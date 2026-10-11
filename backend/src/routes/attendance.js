/**
 * Attendance Routes
 * ============================================================
 * /api/attendance
 *
 * STUDENT attendance is per lesson (ClassroomSession, see lib/attendanceFacts)
 * and is amended by the class teacher via /api/class-register/:liveClassId.
 * The day register (Attendance docs) is frozen for marking: it remains
 * readable as history for dates before the cutover, and the collection
 * continues as the self check-in log (routes/checkin.js).
 *
 * Routes:
 *   POST    /                       410 — day-register marking is retired
 *   POST    /bulk                   410 — day-register marking is retired
 *   GET     /student/:studentId     Per-lesson attendance + legacy day history (?from=&to=)
 *   GET     /day                    List all attendance for a specific date (?date=YYYY-MM-DD)
 *   DELETE  /:attendanceId          Remove an attendance record (correction case)
 *
 * Authorization:
 *   - All routes require auth (token)
 *   - DELETE: admin only (legacy-record corrections)
 *   - GET /student/:id: teacher/admin/dos/ops_manager OR the student themselves
 *   - GET /day: teacher/admin only
 *
 * Date handling:
 *   - Dates are normalised to UTC midnight (00:00:00.000Z) before storage
 *   - Accepts 'YYYY-MM-DD' format or full ISO datetime; both are normalised
 *   - Range queries with ?from= and ?to= are inclusive on both ends
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const User = require('../models/User');
const attendanceFacts = require('../lib/attendanceFacts');
const { auth, requireRole } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────
// Resolve the Attendance Mongoose model defensively.
// Different deployed versions of models/Attendance.js may export
// the model, a named property, just the schema, or be broken.
// We handle all shapes and fall back to defining the model here
// if needed so the route always has a usable model.
// ─────────────────────────────────────────────────────────
let Attendance = (() => {
  try {
    const imp = require('../models/Attendance');
    if (imp && typeof imp.findOneAndUpdate === 'function') return imp;
    if (imp && imp.Attendance && typeof imp.Attendance.findOneAndUpdate === 'function') return imp.Attendance;
    if (imp && imp.default && typeof imp.default.findOneAndUpdate === 'function') return imp.default;
    if (mongoose.models && mongoose.models.Attendance) return mongoose.models.Attendance;
    return null;
  } catch (e) {
    return null;
  }
})();

if (!Attendance) {
  const ATTENDANCE_STATUS = ['present', 'absent', 'half_day'];
  const schema = new mongoose.Schema({
    studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date:       { type: Date, required: true, index: true },
    status:     { type: String, enum: ATTENDANCE_STATUS, required: true },
    reason:     { type: String, default: '', trim: true, maxlength: 500 },
    markedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    markedAt:   { type: Date, default: Date.now },
    curriculum: { type: String, default: '', trim: true },
  }, { timestamps: true });
  schema.index({ studentId: 1, date: 1 }, { unique: true });
  schema.index({ studentId: 1, date: -1 });
  schema.pre('validate', function(next) {
    if (this.status === 'absent' && (!this.reason || !this.reason.trim())) {
      return next(new Error('Reason is required when status is absent.'));
    }
    next();
  });
  Attendance = mongoose.models.Attendance || mongoose.model('Attendance', schema);
  console.warn('[attendance route] models/Attendance.js did not export a usable model; using inline fallback.');
}

// Local copy of valid status values — kept in lockstep with the
// schema enum. Decoupled from any model static.
const STATUS_VALUES = ['present', 'absent', 'half_day'];

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

const ok = (res, data, message) => res.json({ success: true, data, message });
const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Normalise any date input to UTC midnight of the same calendar day.
// Accepts 'YYYY-MM-DD' or full ISO datetime. Returns Date or null.
function normaliseDate(input) {
  if (!input) return null;
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return null;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// POST / and POST /bulk — retired. Student attendance is recorded per
// lesson; the class teacher confirms or amends it in the class register.
// ═══════════════════════════════════════════════════════════
const RETIRED_MSG = 'The daily attendance register has been retired. Student attendance is now recorded per lesson: '
  + 'joining a class marks the student present, and the class teacher confirms or amends it in the class register '
  + '(Teacher portal > past classes > Register).';
const retired = (req, res) => res.status(410).json({ success: false, retired: true, message: RETIRED_MSG, register: '/api/class-register/:liveClassId' });
router.post('/', auth, retired);
router.post('/bulk', auth, retired);

// ═══════════════════════════════════════════════════════════
// GET /student/:studentId — Per-lesson attendance for one student
// Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD (both optional, inclusive;
// default the last 90 days). Dates before the cutover come from the
// legacy day register and are returned separately as `legacy`.
// ═══════════════════════════════════════════════════════════
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.isValidObjectId(studentId)) return fail(res, 400, 'Invalid studentId.');

    const isOwn = String(req.user._id) === String(studentId);
    if (!isOwn && !['teacher', 'admin', 'dos', 'ops_manager'].includes(req.user.role))
      return fail(res, 403, 'Not allowed.');

    const toDay = normaliseDate(req.query.to);
    const to = toDay ? new Date(toDay.getTime() + 864e5 - 1) : new Date();
    const from = normaliseDate(req.query.from) || new Date(to.getTime() - 90 * 864e5);

    const f = await attendanceFacts.oneStudent(studentId, from, to);
    const lessons = [...f.lessons].sort((x, y) => new Date(y.scheduledAt) - new Date(x.scheduledAt));
    const legacy = [...f.legacyRecords].sort((x, y) => new Date(y.date) - new Date(x.date));
    return ok(res, {
      summary: {
        scheduled: f.scheduled, attended: f.attended, late: f.late, rate: f.rate,
        lessonsScheduled: f.lessonsScheduled, lessonsAttended: f.lessonsAttended,
        legacyDays: f.legacyDays, legacyAttended: f.legacyAttended,
      },
      lessons,
      legacy,
      // Back-compat: older clients read `items` as day records.
      items: legacy,
      cutover: attendanceFacts.cutoverDate(),
      from, to,
    }, `${f.lessonsAttended} of ${f.lessonsScheduled} lessons attended.`);
  } catch (err) {
    console.error('[attendance GET /student]', err.message);
    return fail(res, 500, err.message || 'Failed to load.');
  }
});

// ═══════════════════════════════════════════════════════════
// GET /day — List attendance for a specific date (all students)
// Query: ?date=YYYY-MM-DD (defaults to today)
// ═══════════════════════════════════════════════════════════
router.get('/day', auth, requireRole('teacher', 'admin', 'dos'), async (req, res) => {
  try {
    const dateNorm = normaliseDate(req.query.date || new Date());
    if (!dateNorm) return fail(res, 400, 'Invalid date.');

    const items = await Attendance.find({ date: dateNorm })
      .populate('studentId', 'firstName lastName admissionNumber email curriculum')
      .populate('markedBy', 'firstName lastName')
      .lean();

    return ok(res, { date: dateNorm, items }, `${items.length} records for ${dateNorm.toISOString().slice(0,10)}.`);
  } catch (err) {
    console.error('[attendance GET /day]', err.message);
    return fail(res, 500, err.message || 'Failed to load.');
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE /:attendanceId — Remove an attendance record (correction)
// ═══════════════════════════════════════════════════════════
router.delete('/:attendanceId', auth, requireRole('admin'), async (req, res) => {
  try {
    const { attendanceId } = req.params;
    if (!mongoose.isValidObjectId(attendanceId))
      return fail(res, 400, 'Invalid attendanceId.');

    const removed = await Attendance.findByIdAndDelete(attendanceId);
    if (!removed) return fail(res, 404, 'Record not found.');

    return ok(res, { deleted: true }, 'Attendance record removed.');
  } catch (err) {
    console.error('[attendance DELETE]', err.message);
    return fail(res, 500, err.message || 'Delete failed.');
  }
});


// ── GET /api/attendance/summary ──────────────────────────
// DOS: attendance rate per user over a date range
router.get('/summary', auth, requireRole('admin', 'dos', 'ops_manager'), async (req, res) => {
  try {
    const { from, to, role } = req.query
    const dateFilter = {}
    if (from) dateFilter.$gte = normaliseDate(from)
    if (to)   dateFilter.$lte = normaliseDate(to)

    const match = Object.keys(dateFilter).length ? { date: dateFilter } : {}

    const agg = await Attendance.aggregate([
      { $match: match },
      { $group: {
        _id: '$studentId',
        total:   { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status','present'] }, 1, 0] } },
        absent:  { $sum: { $cond: [{ $eq: ['$status','absent']  }, 1, 0] } },
        late:    { $sum: { $cond: [{ $eq: ['$checkInStatus','late'] }, 1, 0] } },
      }},
      { $lookup: { from:'users', localField:'_id', foreignField:'_id', as:'user' } },
      { $unwind: '$user' },
      { $match: role ? { 'user.role': role } : {} },
      { $project: {
        name:       { $concat: ['$user.firstName',' ','$user.lastName'] },
        role:       '$user.role',
        curriculum: '$user.curriculum',
        grade:      '$user.gradeLevel',
        total: 1, present: 1, absent: 1, late: 1,
        rate: { $cond: [{ $gt: ['$total',0] }, { $multiply: [{ $divide: ['$present','$total'] }, 100] }, 0] },
      }},
      { $sort: { rate: 1 } },
    ])

    return res.json({ success: true, data: { records: agg } })
  } catch(e) {
    return res.status(500).json({ success: false, message: e.message })
  }
});

module.exports = router;
