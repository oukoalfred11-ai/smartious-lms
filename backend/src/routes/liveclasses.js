/**
 * routes/liveclasses.js
 * ============================================================
 * CRUD for scheduled live classes.
 *
 * Mounted at /api/liveclasses
 *
 * Endpoints:
 *   POST   /                         create (teacher)
 *   GET    /teacher/list             teacher's own classes
 *   GET    /student/list             classes assigned to current student
 *   GET    /:id                      single class detail
 *   PATCH  /:id                      edit (teacher, owner only)
 *   DELETE /:id                      delete (teacher, owner only)
 *   POST   /:id/start                flip to live (teacher)
 *   POST   /:id/end                  flip to ended  (teacher)
 *   POST   /:id/cancel               cancel with reason (teacher)
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LiveClass = require('../models/LiveClass');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────
// Helper: compute status fresh on a plain doc (lean queries
// don't get virtuals, so we re-derive in JS).
// ─────────────────────────────────────────────────────────
const computeStatus = (lc) => {
  if (!lc) return 'scheduled';
  if (lc.status === 'cancelled' || lc.status === 'ended') return lc.status;
  if (lc.status === 'live') return 'live';
  const now = Date.now();
  const start = new Date(lc.scheduledAt).getTime();
  const end   = start + (lc.durationMins || 0) * 60000;
  if (now < start)  return 'scheduled';
  if (now <= end)   return 'live';
  return 'ended';
};

const withComputedStatus = (arr) => arr.map(lc => ({
  ...lc,
  computedStatus: computeStatus(lc),
}));

// ═══════════════════════════════════════════════════════════
// CREATE — teacher schedules a new class
// ═══════════════════════════════════════════════════════════
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const {
      title, description = '',
      subject, curriculum, grade,
      scheduledAt, durationMins = 60,
      meetingLink,
      assignedStudents = [],
      preparationLessonId = null,
      notes = '',
    } = req.body;

    if (!title || !title.trim())
      return res.status(400).json({ success:false, message:'Title is required.' });
    if (!subject || !curriculum || !grade)
      return res.status(400).json({ success:false, message:'Subject, curriculum and grade are required.' });
    if (!scheduledAt)
      return res.status(400).json({ success:false, message:'Scheduled time is required.' });
    if (!meetingLink || !meetingLink.trim())
      return res.status(400).json({ success:false, message:'Meeting link is required.' });

    const startDate = new Date(scheduledAt);
    if (isNaN(startDate.getTime()))
      return res.status(400).json({ success:false, message:'Invalid scheduled time.' });

    const dur = Number(durationMins);
    if (!Number.isFinite(dur) || dur < 5 || dur > 240)
      return res.status(400).json({ success:false, message:'Duration must be between 5 and 240 minutes.' });

    const validStudentIds = (assignedStudents || []).filter(id => mongoose.isValidObjectId(id));
    if (validStudentIds.length === 0)
      return res.status(400).json({ success:false, message:'Assign at least one student.' });

    const studentCount = await User.countDocuments({
      _id: { $in: validStudentIds },
      role: 'student',
    });
    if (studentCount !== validStudentIds.length)
      return res.status(400).json({ success:false, message:'One or more assigned users are not students.' });

    const liveClass = await LiveClass.create({
      title: title.trim(),
      description: description.trim(),
      subject, curriculum, grade,
      scheduledAt: startDate,
      durationMins: dur,
      meetingLink: meetingLink.trim(),
      teacherId: req.user._id,
      assignedStudents: validStudentIds,
      preparationLessonId: mongoose.isValidObjectId(preparationLessonId) ? preparationLessonId : null,
      notes: notes.trim(),
      status: 'scheduled',
    });

    res.status(201).json({ success:true, message:'Live class scheduled.', data: { liveClass } });
  } catch (e) {
    console.error('[liveclasses create]', e.message);
    res.status(500).json({ success:false, message: 'Failed to create live class: ' + e.message });
  }
});

// ═══════════════════════════════════════════════════════════
// TEACHER LIST
// ═══════════════════════════════════════════════════════════
router.get('/teacher/list', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { teacherId: req.user._id };
    const classes = await LiveClass.find(filter)
      .sort({ scheduledAt: -1 })
      .populate('assignedStudents', 'firstName lastName admissionNumber email')
      .lean();
    res.json({ success:true, data: { classes: withComputedStatus(classes) } });
  } catch (e) {
    console.error('[liveclasses teacher/list]', e.message);
    res.status(500).json({ success:false, message:'Failed to load live classes.' });
  }
});

// ═══════════════════════════════════════════════════════════
// STUDENT LIST
// ═══════════════════════════════════════════════════════════
router.get('/student/list', auth, async (req, res) => {
  try {
    const classes = await LiveClass.find({
      assignedStudents: req.user._id,
    })
      .sort({ scheduledAt: 1 })
      .populate('teacherId', 'firstName lastName')
      .lean();
    res.json({ success:true, data: { classes: withComputedStatus(classes) } });
  } catch (e) {
    console.error('[liveclasses student/list]', e.message);
    res.status(500).json({ success:false, message:'Failed to load classes.' });
  }
});

// ═══════════════════════════════════════════════════════════
// SINGLE CLASS
// ═══════════════════════════════════════════════════════════
router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid class id.' });

    const lc = await LiveClass.findById(req.params.id)
      .populate('teacherId', 'firstName lastName email')
      .populate('assignedStudents', 'firstName lastName admissionNumber email')
      .lean();
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });

    const isOwner   = String(lc.teacherId?._id || lc.teacherId) === String(req.user._id);
    const isAdmin   = req.user.role === 'admin';
    const isStudent = (lc.assignedStudents || []).some(s => String(s._id || s) === String(req.user._id));

    if (!isOwner && !isAdmin && !isStudent)
      return res.status(403).json({ success:false, message:'You are not part of this class.' });

    res.json({ success:true, data: { liveClass: { ...lc, computedStatus: computeStatus(lc) } } });
  } catch (e) {
    console.error('[liveclasses get]', e.message);
    res.status(500).json({ success:false, message:'Failed to load class.' });
  }
});

// ═══════════════════════════════════════════════════════════
// EDIT
// ═══════════════════════════════════════════════════════════
router.patch('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid class id.' });

    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });

    if (req.user.role !== 'admin' && String(lc.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your class.' });

    const allowed = ['title','description','subject','curriculum','grade','scheduledAt','durationMins','meetingLink','assignedStudents','notes','preparationLessonId'];
    for (const k of allowed) {
      if (k in req.body) {
        if (k === 'scheduledAt') {
          const d = new Date(req.body.scheduledAt);
          if (isNaN(d.getTime())) return res.status(400).json({ success:false, message:'Invalid scheduled time.' });
          lc.scheduledAt = d;
        } else if (k === 'assignedStudents') {
          const ids = (req.body.assignedStudents || []).filter(id => mongoose.isValidObjectId(id));
          lc.assignedStudents = ids;
        } else if (k === 'preparationLessonId') {
          lc.preparationLessonId = mongoose.isValidObjectId(req.body.preparationLessonId)
            ? req.body.preparationLessonId : null;
        } else {
          lc[k] = req.body[k];
        }
      }
    }

    await lc.save();
    res.json({ success:true, message:'Class updated.', data: { liveClass: lc } });
  } catch (e) {
    console.error('[liveclasses patch]', e.message);
    res.status(500).json({ success:false, message:'Failed to update class.' });
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════
router.delete('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid class id.' });

    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });
    if (req.user.role !== 'admin' && String(lc.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your class.' });

    await lc.deleteOne();
    res.json({ success:true, message:'Class deleted.' });
  } catch (e) {
    console.error('[liveclasses delete]', e.message);
    res.status(500).json({ success:false, message:'Failed to delete class.' });
  }
});

// ═══════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════
router.post('/:id/start', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });
    if (req.user.role !== 'admin' && String(lc.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your class.' });

    lc.status = 'live';
    lc.startedAt = new Date();
    await lc.save();
    res.json({ success:true, message:'Class is live.', data: { liveClass: lc } });
  } catch (e) {
    console.error('[liveclasses start]', e.message);
    res.status(500).json({ success:false, message:'Failed to start class.' });
  }
});

// ═══════════════════════════════════════════════════════════
// END
// ═══════════════════════════════════════════════════════════
router.post('/:id/end', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });
    if (req.user.role !== 'admin' && String(lc.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your class.' });

    lc.status = 'ended';
    lc.endedAt = new Date();
    await lc.save();
    res.json({ success:true, message:'Class ended.', data: { liveClass: lc } });
  } catch (e) {
    console.error('[liveclasses end]', e.message);
    res.status(500).json({ success:false, message:'Failed to end class.' });
  }
});

// ═══════════════════════════════════════════════════════════
// CANCEL
// ═══════════════════════════════════════════════════════════
router.post('/:id/cancel', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });
    if (req.user.role !== 'admin' && String(lc.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your class.' });

    lc.status = 'cancelled';
    lc.cancelledAt = new Date();
    lc.cancelReason = (req.body?.reason || '').trim();
    await lc.save();
    res.json({ success:true, message:'Class cancelled.', data: { liveClass: lc } });
  } catch (e) {
    console.error('[liveclasses cancel]', e.message);
    res.status(500).json({ success:false, message:'Failed to cancel class.' });
  }
});

module.exports = router;
