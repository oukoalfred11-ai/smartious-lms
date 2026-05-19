const router = require('express').Router();
const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const {
  orderedLessons,
  generateSessions,
  syncTimetablesForSubject,
} = require('../services/timetableSync');

// ═══════════════════════════════════════════════════════════
// TIMETABLE ROUTES  —  /api/timetables
// Recurring weekly timetable per student per subject.
// Teacher-created. Sessions are generated upfront from the
// subject's lesson list.
// ═══════════════════════════════════════════════════════════

// ── GET /api/timetables/student/:studentId ─────────────────
// All timetables for a student (any authenticated user).
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const tts = await Timetable.find({ studentId: req.params.studentId, isActive: true })
      .sort({ subjectName: 1 })
      .lean({ virtuals: true });
    res.json({ success: true, data: { timetables: tts } });
  } catch (e) {
    console.error('[timetables GET student]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /api/timetables/mine ───────────────────────────────
// Timetables created by the logged-in teacher.
router.get('/mine', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const tts = await Timetable.find({ teacherId: req.user._id, isActive: true })
      .sort({ updatedAt: -1 })
      .lean({ virtuals: true });
    res.json({ success: true, data: { timetables: tts } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /api/timetables/:id ────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const tt = await Timetable.findById(req.params.id).lean({ virtuals: true });
    if (!tt) return res.status(404).json({ success: false, message: 'Timetable not found.' });
    res.json({ success: true, data: { timetable: tt } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /api/timetables ───────────────────────────────────
// Create a timetable and generate its sessions upfront.
// Body: { studentId, subjectId, weeklySlots:[{dayOfWeek,time}], startDate }
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { studentId, subjectId, weeklySlots, startDate } = req.body;

    if (!studentId || !mongoose.isValidObjectId(studentId))
      return res.status(400).json({ success: false, message: 'Valid studentId required.' });
    if (!subjectId || !mongoose.isValidObjectId(subjectId))
      return res.status(400).json({ success: false, message: 'Valid subjectId required.' });
    if (!Array.isArray(weeklySlots) || weeklySlots.length === 0)
      return res.status(400).json({ success: false, message: 'At least one weekly slot is required.' });
    if (!startDate)
      return res.status(400).json({ success: false, message: 'A start date is required.' });

    const [student, subject] = await Promise.all([
      User.findById(studentId).lean(),
      Subject.findById(subjectId).lean(),
    ]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    const lessons = await orderedLessons(subjectId);
    if (lessons.length === 0)
      return res.status(400).json({ success: false, message: 'This subject has no lessons yet — add lessons before building a timetable.' });

    const sessions = generateSessions(lessons, weeklySlots, startDate);

    const tt = await Timetable.create({
      studentId,
      studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      subjectId,
      subjectName: subject.subjectName || subject.name || '',
      curriculum: subject.curriculum || '',
      teacherId: req.user._id,
      weeklySlots,
      startDate: new Date(startDate),
      sessions,
      lessonCountAtGen: lessons.length,
    });

    res.status(201).json({ success: true, message: 'Timetable created.', data: { timetable: tt } });
  } catch (e) {
    console.error('[timetables POST]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── PATCH /api/timetables/:id ──────────────────────────────
// Update slots / startDate and regenerate; or update a session's
// status (deliver / cancel). Body may contain:
//   weeklySlots, startDate         → regenerate
//   sessionUpdate:{sessionId,status} → mark one session
router.patch('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const tt = await Timetable.findById(req.params.id);
    if (!tt) return res.status(404).json({ success: false, message: 'Timetable not found.' });

    // Session status update (deliver / cancel / pending)
    if (req.body.sessionUpdate) {
      const { sessionId, status } = req.body.sessionUpdate;
      if (!['pending', 'delivered', 'cancelled'].includes(status))
        return res.status(400).json({ success: false, message: 'Invalid session status.' });
      const sess = tt.sessions.id(sessionId);
      if (!sess) return res.status(404).json({ success: false, message: 'Session not found.' });
      sess.status = status;
      await tt.save();
      return res.json({ success: true, message: 'Session updated.', data: { timetable: tt } });
    }

    // Recurrence change → regenerate (preserving delivered sessions)
    let changed = false;
    if (Array.isArray(req.body.weeklySlots) && req.body.weeklySlots.length) {
      tt.weeklySlots = req.body.weeklySlots; changed = true;
    }
    if (req.body.startDate) {
      tt.startDate = new Date(req.body.startDate); changed = true;
    }
    if (changed) {
      const lessons = await orderedLessons(tt.subjectId);
      const { recomputeTimetable } = require('../services/timetableSync');
      tt.sessions = recomputeTimetable(tt, lessons);
      tt.lessonCountAtGen = lessons.length;
    }
    await tt.save();
    res.json({ success: true, message: 'Timetable updated.', data: { timetable: tt } });
  } catch (e) {
    console.error('[timetables PATCH]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /api/timetables/:id/regenerate ────────────────────
// Manually recompute from the current lesson list.
router.post('/:id/regenerate', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const tt = await Timetable.findById(req.params.id);
    if (!tt) return res.status(404).json({ success: false, message: 'Timetable not found.' });
    const lessons = await orderedLessons(tt.subjectId);
    const { recomputeTimetable } = require('../services/timetableSync');
    tt.sessions = recomputeTimetable(tt, lessons);
    tt.lessonCountAtGen = lessons.length;
    await tt.save();
    res.json({ success: true, message: 'Timetable regenerated.', data: { timetable: tt } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── DELETE /api/timetables/:id ─────────────────────────────
router.delete('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const tt = await Timetable.findByIdAndDelete(req.params.id);
    if (!tt) return res.status(404).json({ success: false, message: 'Timetable not found.' });
    res.json({ success: true, message: 'Timetable deleted.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
