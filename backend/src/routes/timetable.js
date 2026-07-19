/**
 * routes/timetable.js
 * ============================================================
 * Weekly timetable management. Mounted at /api/timetable.
 *
 * Endpoints:
 *   GET    /me         — Current user's own timetable (student or teacher)
 *   GET    /student/:id — Specific student's timetable (teacher/admin only,
 *                         or the student themself)
 *   GET    /teacher/:id — Specific teacher's timetable (admin or self)
 *   POST   /            — Create a slot (teacher/admin)
 *   PATCH  /:id         — Edit a slot (creator/admin)
 *   DELETE /:id         — Delete a slot (creator/admin)
 *
 * For students:
 *   The /me endpoint returns all entries where the student is in
 *   `assignedStudents` OR where the entry's audience
 *   curriculum+grade matches the student's curriculum+grade.
 *   Each entry is populated with teacher basic info (name,
 *   avatar, role, jobTitle, bio) — NOT phone or email — so
 *   students can preview their teacher without bypassing the
 *   school's communication channels.
 *
 * For teachers:
 *   The /me endpoint returns all entries where the teacher is
 *   `teacherId`, sorted by day-of-week then time.
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const TimetableEntry = require('../models/TimetableEntry');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const ok   = (res, data, message) => res.json({ success: true, data, message });
const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Fields safe to send to STUDENTS about their teachers.
// No phone, no email — students must use the Communication
// module if they want to reach a teacher.
const TEACHER_PUBLIC_FIELDS = '_id firstName lastName avatar role jobTitle bio qualifications specializations yearsOfExperience';

// Compute the visibility filter for a student-facing query.
// Returns a Mongo $or clause matching either assignment OR audience.
function studentVisibilityFilter(student) {
  const clauses = [
    { assignedStudents: student._id },
  ];
  const curriculum = typeof student.curriculum === 'string' ? student.curriculum : '';
  const grade = typeof student.grade === 'string' ? student.grade : '';
  if (curriculum && grade) {
    clauses.push({
      audienceCurriculum: curriculum,
      audienceGrade: grade,
    });
  }
  return { isActive: true, $or: clauses };
}

// Sort entries by day-of-week then start time
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
function sortBySlot(a, b) {
  const da = DAYS.indexOf(a.dayOfWeek);
  const db = DAYS.indexOf(b.dayOfWeek);
  if (da !== db) return da - db;
  return String(a.startTime).localeCompare(String(b.startTime));
}

// ═══════════════════════════════════════════════════════════
// GET /me — Current user's timetable
// Routes to student-view or teacher-view based on role.
// ═══════════════════════════════════════════════════════════
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const filter = studentVisibilityFilter(req.user);
      const entries = await TimetableEntry.find(filter)
        .populate('teacherId', TEACHER_PUBLIC_FIELDS)
        .lean();
      entries.sort(sortBySlot);
      return ok(res, { entries, count: entries.length }, `${entries.length} entries.`);
    }
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      const entries = await TimetableEntry.find({ teacherId: req.user._id, isActive: true })
        .populate('teacherId', TEACHER_PUBLIC_FIELDS)
        .lean();
      entries.sort(sortBySlot);
      return ok(res, { entries, count: entries.length }, `${entries.length} entries.`);
    }
    return ok(res, { entries: [], count: 0 }, 'No entries for this role.');
  } catch (err) {
    console.error('[timetable GET /me]', err.message);
    return fail(res, 500, err.message || 'Failed to load timetable.');
  }
});

// ═══════════════════════════════════════════════════════════
// GET /student/:id — Specific student's timetable
// Allowed if the requester is the student themself, or any
// teacher/admin (parent links could be added later).
// ═══════════════════════════════════════════════════════════
router.get('/student/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid studentId.');

    const isOwn = String(req.user._id) === String(req.params.id);
    if (!isOwn && !['teacher', 'admin'].includes(req.user.role)) {
      return fail(res, 403, 'Not allowed.');
    }

    const student = await User.findById(req.params.id)
      .select('_id role curriculum grade firstName lastName')
      .lean();
    if (!student) return fail(res, 404, 'Student not found.');
    if (student.role !== 'student') return fail(res, 400, 'User is not a student.');

    const filter = studentVisibilityFilter(student);
    const entries = await TimetableEntry.find(filter)
      .populate('teacherId', TEACHER_PUBLIC_FIELDS)
      .lean();
    entries.sort(sortBySlot);

    return ok(res, { entries, count: entries.length, student }, `${entries.length} entries.`);
  } catch (err) {
    console.error('[timetable GET /student/:id]', err.message);
    return fail(res, 500, err.message || 'Failed to load.');
  }
});

// ═══════════════════════════════════════════════════════════
// GET /teacher/:id — Specific teacher's timetable
// Admin or the teacher themself.
// ═══════════════════════════════════════════════════════════
router.get('/teacher/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid teacherId.');

    const isOwn = String(req.user._id) === String(req.params.id);
    if (!isOwn && req.user.role !== 'admin') {
      return fail(res, 403, 'Not allowed.');
    }

    const entries = await TimetableEntry.find({ teacherId: req.params.id, isActive: true })
      .populate('teacherId', TEACHER_PUBLIC_FIELDS)
      .lean();
    entries.sort(sortBySlot);

    return ok(res, { entries, count: entries.length }, `${entries.length} entries.`);
  } catch (err) {
    console.error('[timetable GET /teacher/:id]', err.message);
    return fail(res, 500, err.message || 'Failed to load.');
  }
});

// ═══════════════════════════════════════════════════════════
// POST / — Create a timetable slot
// Body: title, subject, curriculum, grade, dayOfWeek, startTime,
// endTime, teacherId (optional, defaults to self), assignedStudents[],
// audienceCurriculum, audienceGrade, deliveryMode, meetingLink,
// location, description
// ═══════════════════════════════════════════════════════════
router.post('/', auth, requireRole('teacher', 'admin', 'dos'), async (req, res) => {
  try {
    const b = req.body || {};
    const teacherId = b.teacherId && mongoose.isValidObjectId(b.teacherId)
      ? b.teacherId
      : req.user._id;

    // Admins can create for any teacher; teachers can only create for themselves
    if (req.user.role === 'teacher' && String(teacherId) !== String(req.user._id)) {
      return fail(res, 403, 'Teachers can only create timetable entries for themselves.');
    }

    const entry = await TimetableEntry.create({
      title:        b.title,
      description:  b.description || '',
      subject:      b.subject,
      curriculum:   b.curriculum,
      grade:        b.grade || '',
      subjectId:    mongoose.isValidObjectId(b.subjectId) ? b.subjectId : null,
      dayOfWeek:    b.dayOfWeek,
      startTime:    b.startTime,
      endTime:      b.endTime,
      timezone:     b.timezone || 'Africa/Nairobi',
      effectiveFrom: b.effectiveFrom ? new Date(b.effectiveFrom) : null,
      effectiveTo:   b.effectiveTo   ? new Date(b.effectiveTo)   : null,
      deliveryMode: b.deliveryMode || 'virtual',
      meetingLink:  b.meetingLink || '',
      location:     b.location || '',
      teacherId,
      assignedStudents: Array.isArray(b.assignedStudents)
        ? b.assignedStudents.filter(id => mongoose.isValidObjectId(id))
        : [],
      audienceCurriculum: b.audienceCurriculum || '',
      audienceGrade:      b.audienceGrade || '',
      createdBy: req.user._id,
    });

    return ok(res, { entry }, 'Timetable entry created.');
  } catch (err) {
    console.error('[timetable POST /]', err.message);
    return fail(res, 400, err.message || 'Failed to create entry.');
  }
});

// ═══════════════════════════════════════════════════════════
// PATCH /:id — Edit a timetable slot
// Allowed for the creator or an admin.
// ═══════════════════════════════════════════════════════════
router.patch('/:id', auth, requireRole('teacher', 'admin', 'dos'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid entry id.');
    const entry = await TimetableEntry.findById(req.params.id);
    if (!entry) return fail(res, 404, 'Entry not found.');

    const isCreator = String(entry.createdBy || '') === String(req.user._id);
    const isOwner   = String(entry.teacherId) === String(req.user._id);
    if (req.user.role !== 'admin' && !isCreator && !isOwner) {
      return fail(res, 403, 'You can only edit entries you created or teach.');
    }

    const b = req.body || {};
    const editable = [
      'title', 'description', 'subject', 'curriculum', 'grade',
      'dayOfWeek', 'startTime', 'endTime', 'timezone',
      'deliveryMode', 'meetingLink', 'location',
      'audienceCurriculum', 'audienceGrade',
      'isActive',
    ];
    for (const k of editable) if (k in b) entry[k] = b[k];
    if ('assignedStudents' in b && Array.isArray(b.assignedStudents)) {
      entry.assignedStudents = b.assignedStudents.filter(id => mongoose.isValidObjectId(id));
    }
    if ('effectiveFrom' in b) entry.effectiveFrom = b.effectiveFrom ? new Date(b.effectiveFrom) : null;
    if ('effectiveTo'   in b) entry.effectiveTo   = b.effectiveTo   ? new Date(b.effectiveTo)   : null;
    if ('subjectId'     in b) entry.subjectId     = mongoose.isValidObjectId(b.subjectId) ? b.subjectId : null;

    await entry.save();
    return ok(res, { entry }, 'Entry updated.');
  } catch (err) {
    console.error('[timetable PATCH /:id]', err.message);
    return fail(res, 400, err.message || 'Failed to update.');
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE /:id — Delete a timetable slot
// Allowed for the creator or an admin.
// ═══════════════════════════════════════════════════════════
router.delete('/:id', auth, requireRole('teacher', 'admin', 'dos'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid entry id.');
    const entry = await TimetableEntry.findById(req.params.id);
    if (!entry) return fail(res, 404, 'Entry not found.');

    const isCreator = String(entry.createdBy || '') === String(req.user._id);
    const isOwner   = String(entry.teacherId) === String(req.user._id);
    if (req.user.role !== 'admin' && !isCreator && !isOwner) {
      return fail(res, 403, 'You can only delete entries you created or teach.');
    }

    await entry.deleteOne();
    return ok(res, { deleted: true }, 'Entry deleted.');
  } catch (err) {
    console.error('[timetable DELETE /:id]', err.message);
    return fail(res, 500, err.message || 'Failed to delete.');
  }
});

module.exports = router;
