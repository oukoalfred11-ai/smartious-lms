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
 *
 * Email notifications (non-blocking, never fail the API response):
 *   CREATE → email every assigned student with class details + link
 *   PATCH  → if meetingLink changed, re-email every assigned student
 *            with the updated link and a clear "link changed" warning
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LiveClass = require('../models/LiveClass');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { sendLiveClassEmailBatch } = require('../lib/email');

// ─────────────────────────────────────────────────────────
// Helper: fetch students for a list of IDs and fire emails.
// Pure side-effect — never throws, never blocks the response.
// ─────────────────────────────────────────────────────────
async function notifyStudents(studentIds, classParams, isUpdate = false) {
  try {
    if (!studentIds || studentIds.length === 0) return;
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student',
    }).select('firstName email').lean();
    if (students.length === 0) return;
    await sendLiveClassEmailBatch(students, { ...classParams, isUpdate });
  } catch (err) {
    // Log but never propagate — email failure must not affect the API response
    console.error('[liveclasses] notifyStudents error:', err.message);
  }
}

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
      classroomMode = 'link',
      kind = 'lesson',
      assignedStudents = [],
      preparationLessonId = null,
      notes = '',
      syllabusTopicName = '',
      syllabusSubtopicName = '',
    } = req.body;

    if (!title || !title.trim())
      return res.status(400).json({ success:false, message:'Title is required.' });
    if (!subject || !curriculum || !grade)
      return res.status(400).json({ success:false, message:'Subject, curriculum and grade are required.' });
    if (!scheduledAt)
      return res.status(400).json({ success:false, message:'Scheduled time is required.' });
    if (!['link', 'native'].includes(classroomMode))
      return res.status(400).json({ success:false, message:'Invalid classroom mode.' });
    // A meeting link is only required for link-mode classes; native
    // classes are joined at /classroom/:id inside the platform.
    if (classroomMode === 'link' && (!meetingLink || !meetingLink.trim()))
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
      kind: ['lesson','club','competition','event','assembly'].includes(kind) ? kind : 'lesson',
      title: title.trim(),
      description: description.trim(),
      subject, curriculum, grade,
      scheduledAt: startDate,
      durationMins: dur,
      classroomMode,
      meetingLink: classroomMode === 'native' ? '' : meetingLink.trim(),
      teacherId: req.user._id,
      assignedStudents: validStudentIds,
      preparationLessonId: mongoose.isValidObjectId(preparationLessonId) ? preparationLessonId : null,
      notes: notes.trim(),
      status: 'scheduled',
      syllabusTopicName:    syllabusTopicName    ? String(syllabusTopicName).trim()    || null : null,
      syllabusSubtopicName: syllabusSubtopicName ? String(syllabusSubtopicName).trim() || null : null,
    });

    // ── Respond immediately, then email in the background ──
    res.status(201).json({ success:true, message:'Live class scheduled.', data: { liveClass } });

    // Gather teacher name for the email
    const teacherName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Your Teacher';

    notifyStudents(validStudentIds, {
      teacherName,
      title:       liveClass.title,
      subject:     liveClass.subject,
      grade:       liveClass.grade,
      scheduledAt: liveClass.scheduledAt,
      durationMins: liveClass.durationMins,
      meetingLink: liveClass.classroomMode === 'native'
        ? `${process.env.CLIENT_URL || 'https://smartioushomeschool.com'}/classroom/${liveClass._id}`
        : liveClass.meetingLink,
    }, false);

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
// ── Auto-scheduled class cleanup ────────────────────────────────────
// Classes created by the old auto-timetable promotion confused teachers:
// reminders went out for classes nobody had scheduled. These endpoints
// find and remove the future ones. Classes already taught (ended, or
// with recordings) are never touched, so no history is lost.

// GET /api/liveclasses/auto/count — how many future auto classes exist
router.get('/auto/count', auth, requireRole('admin', 'ops_manager', 'dos'), async (req, res) => {
  try {
    const filter = {
      fromTimetable: true,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() },
      'recordings.0': { $exists: false },
    };
    const count = await LiveClass.countDocuments(filter);
    const sample = await LiveClass.find(filter).sort({ scheduledAt: 1 }).limit(5)
      .select('title subject grade scheduledAt').lean();
    res.json({ success: true, data: { count, sample } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE /api/liveclasses/auto/purge — remove them
router.delete('/auto/purge', auth, requireRole('admin', 'ops_manager', 'dos'), async (req, res) => {
  try {
    const filter = {
      fromTimetable: true,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() },
      'recordings.0': { $exists: false },
    };
    const r = await LiveClass.deleteMany(filter);
    console.log(`[liveclasses] purge-auto: removed ${r.deletedCount} auto-scheduled classes (by ${req.user.email})`);
    res.json({ success: true, message: `Removed ${r.deletedCount} auto-scheduled class(es). Reminders for them stop immediately.`, data: { removed: r.deletedCount } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

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
// Re-emails students if meetingLink changed.
// ═══════════════════════════════════════════════════════════
router.patch('/:id', auth, requireRole('teacher', 'admin', 'dos', 'ops_manager'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid class id.' });

    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });

    if (!['admin', 'dos', 'ops_manager'].includes(req.user.role) && String(lc.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your class.' });

    // Capture old link before any updates so we can detect a change
    const oldMeetingLink = lc.meetingLink;

    const allowed = [
      'title','description','subject','curriculum','grade',
      'scheduledAt','durationMins','meetingLink','classroomMode',
      'assignedStudents','notes','preparationLessonId',
      'syllabusTopicName','syllabusSubtopicName',
    ];
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

    // ── Re-notify students only if the meeting link actually changed ──
    const newMeetingLink = lc.meetingLink;
    const linkChanged = lc.classroomMode !== 'native' && newMeetingLink &&
      newMeetingLink.trim() !== (oldMeetingLink || '').trim();

    if (linkChanged && lc.assignedStudents && lc.assignedStudents.length > 0) {
      const teacherName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Your Teacher';
      notifyStudents(lc.assignedStudents, {
        teacherName,
        title:        lc.title,
        subject:      lc.subject,
        grade:        lc.grade,
        scheduledAt:  lc.scheduledAt,
        durationMins: lc.durationMins,
        meetingLink:  newMeetingLink,
      }, true); // isUpdate = true → shows "link changed" warning
    }

  } catch (e) {
    console.error('[liveclasses patch]', e.message);
    res.status(500).json({ success:false, message:'Failed to update class.' });
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════
router.delete('/:id', auth, requireRole('teacher', 'admin', 'dos', 'ops_manager'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid class id.' });

    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });
    if (!['admin', 'dos', 'ops_manager'].includes(req.user.role) && String(lc.teacherId) !== String(req.user._id))
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
    if (!['admin', 'dos', 'ops_manager'].includes(req.user.role) && String(lc.teacherId) !== String(req.user._id))
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
    if (!['admin', 'dos', 'ops_manager'].includes(req.user.role) && String(lc.teacherId) !== String(req.user._id))
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
    if (!['admin', 'dos', 'ops_manager'].includes(req.user.role) && String(lc.teacherId) !== String(req.user._id))
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
