/**
 * Attendance Routes
 * ============================================================
 * /api/attendance
 *
 * Tracks daily attendance per student. One record per (studentId, date).
 *
 * Routes:
 *   POST    /                       Mark/update one student's attendance for a date
 *   POST    /bulk                   Mark multiple students for the same date
 *   GET     /student/:studentId     List attendance for a student (?from=&to=)
 *   GET     /day                    List all attendance for a specific date (?date=YYYY-MM-DD)
 *   DELETE  /:attendanceId          Remove an attendance record (correction case)
 *
 * Authorization:
 *   - All routes require auth (token)
 *   - POST/DELETE: teacher or admin only
 *   - GET /student/:id: teacher/admin OR the student themselves
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
// POST / — Mark or update one student's attendance for a date
// Body: { studentId, date, status, reason? }
// ═══════════════════════════════════════════════════════════
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { studentId, date, status, reason = '' } = req.body || {};

    if (!studentId || !mongoose.isValidObjectId(studentId))
      return fail(res, 400, 'Valid studentId required.');
    if (!STATUS_VALUES.includes(status))
      return fail(res, 400, 'status must be one of: ' + STATUS_VALUES.join(', '));

    const dateNorm = normaliseDate(date);
    if (!dateNorm) return fail(res, 400, 'Valid date required (YYYY-MM-DD or ISO).');

    if (status === 'absent' && (!reason || !String(reason).trim()))
      return fail(res, 400, 'Reason is required when status is absent.');

    const student = await User.findById(studentId).select('role curriculum').lean();
    if (!student) return fail(res, 404, 'Student not found.');
    if (student.role !== 'student') return fail(res, 400, 'studentId is not a student.');

    const doc = await Attendance.findOneAndUpdate(
      { studentId, date: dateNorm },
      {
        $set: {
          status,
          reason: status === 'absent' ? String(reason).trim().slice(0, 500) : '',
          markedBy: req.user._id,
          markedAt: new Date(),
          curriculum: student.curriculum || '',
        },
        $setOnInsert: { studentId, date: dateNorm },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return ok(res, { attendance: doc }, 'Attendance saved.');
  } catch (err) {
    if (err && err.code === 11000) {
      // Race on the unique index — fetch the winning record
      const existing = await Attendance.findOne({
        studentId: req.body.studentId,
        date: normaliseDate(req.body.date),
      });
      return ok(res, { attendance: existing }, 'Already marked.');
    }
    console.error('[attendance POST]', err.message);
    return fail(res, 500, err.message || 'Failed to save attendance.');
  }
});

// ═══════════════════════════════════════════════════════════
// POST /bulk — Mark same status for multiple students on one date
// Body: { studentIds: [...], date, status, reason? }
// ═══════════════════════════════════════════════════════════
router.post('/bulk', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { studentIds, date, status, reason = '' } = req.body || {};

    if (!Array.isArray(studentIds) || studentIds.length === 0)
      return fail(res, 400, 'studentIds array required.');
    if (!STATUS_VALUES.includes(status))
      return fail(res, 400, 'status must be one of: ' + STATUS_VALUES.join(', '));

    const dateNorm = normaliseDate(date);
    if (!dateNorm) return fail(res, 400, 'Valid date required (YYYY-MM-DD or ISO).');

    if (status === 'absent' && (!reason || !String(reason).trim()))
      return fail(res, 400, 'Reason is required when status is absent.');

    const validIds = studentIds.filter(id => mongoose.isValidObjectId(id));
    if (validIds.length === 0) return fail(res, 400, 'No valid studentIds.');

    // Fetch students to get curricula for denormalisation
    const students = await User.find({ _id: { $in: validIds }, role: 'student' })
      .select('_id curriculum')
      .lean();
    const byId = new Map(students.map(s => [String(s._id), s]));

    const cleanReason = status === 'absent' ? String(reason).trim().slice(0, 500) : '';
    const markedAt = new Date();

    const ops = validIds
      .filter(id => byId.has(String(id))) // only mark real students
      .map(studentId => ({
        updateOne: {
          filter: { studentId, date: dateNorm },
          update: {
            $set: {
              status,
              reason: cleanReason,
              markedBy: req.user._id,
              markedAt,
              curriculum: byId.get(String(studentId))?.curriculum || '',
            },
            $setOnInsert: { studentId, date: dateNorm },
          },
          upsert: true,
        },
      }));

    if (ops.length === 0) return fail(res, 400, 'No valid students after filtering.');

    const result = await Attendance.bulkWrite(ops, { ordered: false });

    return ok(res, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      total: ops.length,
    }, `Attendance saved for ${ops.length} student(s).`);
  } catch (err) {
    console.error('[attendance POST /bulk]', err.message);
    return fail(res, 500, err.message || 'Bulk save failed.');
  }
});

// ═══════════════════════════════════════════════════════════
// GET /student/:studentId — List attendance for one student
// Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD (both optional, inclusive)
// ═══════════════════════════════════════════════════════════
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.isValidObjectId(studentId)) return fail(res, 400, 'Invalid studentId.');

    const isOwn = String(req.user._id) === String(studentId);
    if (!isOwn && !['teacher', 'admin'].includes(req.user.role))
      return fail(res, 403, 'Not allowed.');

    const filter = { studentId };
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) {
        const d = normaliseDate(req.query.from);
        if (d) filter.date.$gte = d;
      }
      if (req.query.to) {
        const d = normaliseDate(req.query.to);
        if (d) filter.date.$lte = d;
      }
    }

    const items = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate('markedBy', 'firstName lastName')
      .lean();

    return ok(res, { items }, `${items.length} attendance records.`);
  } catch (err) {
    console.error('[attendance GET /student]', err.message);
    return fail(res, 500, err.message || 'Failed to load.');
  }
});

// ═══════════════════════════════════════════════════════════
// GET /day — List attendance for a specific date (all students)
// Query: ?date=YYYY-MM-DD (defaults to today)
// ═══════════════════════════════════════════════════════════
router.get('/day', auth, requireRole('teacher', 'admin'), async (req, res) => {
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
router.delete('/:attendanceId', auth, requireRole('teacher', 'admin'), async (req, res) => {
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

module.exports = router;
