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
    }).select('firstName email emailPrefs').lean();
    // Respect each student's classUpdates preference.
    const willing = students.filter(st => st.emailPrefs?.classUpdates !== false);
    if (willing.length === 0) return;
    await sendLiveClassEmailBatch(willing, { ...classParams, isUpdate });
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

// A timetable-born class that is moved or cancelled keeps a record of the
// weekly occurrence it stood for, so the reconciler treats that
// occurrence as taken and never re-creates it on the original day.
function rememberOccurrence(lc) {
  if (lc.timetableEntryId && !lc.originalScheduledAt && lc.scheduledAt) {
    lc.originalScheduledAt = lc.scheduledAt;
  }
}

// Save, tolerating the one-class-per-occurrence index: a legacy duplicate
// of the same occurrence already holds it, so this copy drops the claim
// rather than failing the teacher's edit.
async function saveClass(lc) {
  try {
    await lc.save();
  } catch (e) {
    if (e && e.code === 11000 && lc.originalScheduledAt) {
      lc.originalScheduledAt = null;
      await lc.save();
    } else throw e;
  }
}

const STAFF_ROLES = ['admin', 'dos', 'ops_manager'];

// ═══════════════════════════════════════════════════════════
// CREATE — teacher schedules a new class
// ═══════════════════════════════════════════════════════════
router.post('/', auth, requireRole('teacher', ...STAFF_ROLES), async (req, res) => {
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
      extra = false,
      makeUpFor = null,
    } = req.body;
    // Extra and make-up lessons a teacher adds by hand. They live in the
    // Smartious classroom (so attendance is recorded) unless a link is given.
    const isExtra = !!extra || mongoose.isValidObjectId(makeUpFor);

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
    if (classroomMode === 'link' && !isExtra && (!meetingLink || !meetingLink.trim()))
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

    const wantedKind = ['lesson','club','competition','event','assembly'].includes(kind) ? kind : 'lesson';
    // ONE SYSTEM: the timetable dictates classes. Lessons are
    // materialized from timetable entries by the reconciler and cannot
    // be slotted directly. Clubs, events and assemblies remain manual.
    if (wantedKind === 'lesson' && !isExtra) {
      return res.status(400).json({
        success: false,
        message: 'Lessons are created from the timetable. Add or edit your timetable slot and the class will appear automatically for the coming week.',
      });
    }
    let makeUpOf = null;
    if (mongoose.isValidObjectId(makeUpFor)) {
      makeUpOf = await LiveClass.findById(makeUpFor).select('teacherId subject').lean();
      if (!makeUpOf) return res.status(404).json({ success:false, message:'The lesson this makes up for was not found.' });
      if (!STAFF_ROLES.includes(req.user.role) && String(makeUpOf.teacherId) !== String(req.user._id))
        return res.status(403).json({ success:false, message:'You can only make up your own lessons.' });
    }
    const mode = isExtra && !(meetingLink && meetingLink.trim()) ? 'native' : classroomMode;
    const liveClass = await LiveClass.create({
      kind: ['lesson','club','competition','event','assembly'].includes(kind) ? kind : 'lesson',
      extraLesson: isExtra,
      makeUpFor: makeUpOf ? makeUpOf._id : null,
      title: title.trim(),
      description: description.trim(),
      subject, curriculum, grade,
      scheduledAt: startDate,
      durationMins: dur,
      classroomMode: mode,
      meetingLink: mode === 'native' ? '' : meetingLink.trim(),
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

    if (isExtra) {
      require('../lib/lessonNotices').lessonAdded(liveClass, { makeUp: !!makeUpOf });
      return;
    }
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
      // Cancelled occurrences are exceptions the family should never
      // see as joinable classes.
      status: { $ne: 'cancelled' },
    })
      .sort({ scheduledAt: 1 })
      .populate('teacherId', 'firstName lastName')
      // "Prepare for this class" needs the lesson's id and title.
      .populate('preparationLessonId', 'title')
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
// ── Orphaned timetable class cleanup ───────────────────────────────
// Future classes materialized from a timetable slot that has since been
// deactivated or deleted. The reconciler removes these itself; this is
// the manual broom for anything left behind. Classes of ACTIVE slots are
// never touched (the reconciler would only re-create them), nor are
// teachers' one-off moves (detached), taught, recorded or attended ones.
async function orphanFilter() {
  const TimetableEntry = require('../models/TimetableEntry');
  const activeIds = await TimetableEntry.distinct('_id', { isActive: { $ne: false } });
  return {
    fromTimetable: true,
    status: 'scheduled',
    detached: { $ne: true },
    scheduledAt: { $gte: new Date() },
    'recordings.0': { $exists: false },
    timetableEntryId: { $nin: activeIds },
  };
}

// GET /api/liveclasses/auto/count — how many orphaned future classes exist
router.get('/auto/count', auth, requireRole('admin', 'ops_manager', 'dos'), async (req, res) => {
  try {
    const filter = await orphanFilter();
    const count = await LiveClass.countDocuments(filter);
    const sample = await LiveClass.find(filter).sort({ scheduledAt: 1 }).limit(5)
      .select('title subject grade scheduledAt').lean();
    res.json({ success: true, data: { count, sample } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE /api/liveclasses/auto/purge — remove them
router.delete('/auto/purge', auth, requireRole('admin', 'ops_manager', 'dos'), async (req, res) => {
  try {
    const ClassroomSession = require('../models/ClassroomSession');
    const filter = await orphanFilter();
    const ids = await LiveClass.distinct('_id', filter);
    const joined = new Set((await ClassroomSession.distinct('liveClassId', { liveClassId: { $in: ids }, joinCount: { $gt: 0 } })).map(String));
    const del = ids.filter(id => !joined.has(String(id)));
    const r = await LiveClass.deleteMany({ _id: { $in: del } });
    console.log(`[liveclasses] purge-orphans: removed ${r.deletedCount} orphaned timetable classes (by ${req.user.email})`);
    res.json({ success: true, message: `Removed ${r.deletedCount} class(es) left over from removed timetable slots. Reminders for them stop immediately.`, data: { removed: r.deletedCount } });
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

    if (!STAFF_ROLES.includes(req.user.role) && String(lc.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your class.' });

    // Capture old link and time before any updates so we can detect a change
    const oldMeetingLink = lc.meetingLink;
    const oldAt = lc.scheduledAt;

    // One-off change to a timetable-born class: detach it so the
    // reconciler treats it as an exception rather than reverting it.
    if (lc.timetableEntryId && (req.body.scheduledAt || req.body.durationMins)) {
      lc.detached = true;
      rememberOccurrence(lc);
    }

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

    await saveClass(lc);

    res.json({ success:true, message:'Class updated.', data: { liveClass: lc } });

    // A lesson moved to a new time: the family is told straight away.
    if (oldAt && lc.scheduledAt && Math.abs(new Date(lc.scheduledAt) - new Date(oldAt)) > 60000
        && new Date(lc.scheduledAt) > new Date() && lc.status === 'scheduled') {
      require('../lib/lessonNotices').lessonMoved(lc, oldAt);
    }

    // ── Re-notify students only if the meeting link actually changed ──
    const newMeetingLink = lc.meetingLink;
    const linkChanged = lc.classroomMode !== 'native' && newMeetingLink &&
      newMeetingLink.trim() !== (oldMeetingLink || '').trim();

    if (linkChanged && lc.assignedStudents && lc.assignedStudents.length > 0) {
      const teacherName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Your Teacher';
      // Auto scheduled classes (materialized from the timetable) send no
      // creation or update emails to anyone; the timetable is the promise
      // and the 30 minute reminder is the announcement.
      if (!lc.fromTimetable) notifyStudents(lc.assignedStudents, {
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
    if (!STAFF_ROLES.includes(req.user.role) && String(lc.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your class.' });

    if (lc.timetableEntryId) {
      // Deleting a timetable-born class must MEAN something durable:
      // a hard delete would be re-materialized within hours. Cancel it
      // as a persistent exception instead - this occurrence is off, the
      // weekly slot continues next week.
      lc.status = 'cancelled';
      lc.detached = true;
      lc.cancelledAt = new Date();
      rememberOccurrence(lc);
      await saveClass(lc);
      // The cancelled class gives its topic back to the plan.
      require('../lib/lessonPlan').restampForEntryId(lc.timetableEntryId);
      if (new Date(lc.scheduledAt) > new Date()) require('../lib/lessonNotices').lessonCancelled(lc, { reason: (req.body && req.body.reason) || '' });
      return res.json({ success: true, message: 'This occurrence is cancelled and the family has been told. The weekly timetable slot continues from next week.' });
    }
    await lc.deleteOne();
    res.json({ success:true, message:'Class deleted.' });
  } catch (e) {
    console.error('[liveclasses delete]', e.message);
    res.status(500).json({ success:false, message:'Failed to delete class.' });
  }
});

// ═══════════════════════════════════════════════════════════
// CLOSE THE LESSON — the teacher records what happened
// ═══════════════════════════════════════════════════════════
// taught (topic, full/partial) · student_absent · not_held (reason).
// Only a closed lesson counts as taught: it moves the scheme of work on
// and triggers homework. Not held = cancelled after the fact (the family
// is told, the topic returns to the plan, nobody is marked absent).
router.post('/:id/close', auth, requireRole('teacher', ...STAFF_ROLES), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid class id.' });
    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });
    if (!STAFF_ROLES.includes(req.user.role) && String(lc.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your class.' });
    if (new Date(lc.scheduledAt) > new Date())
      return res.status(400).json({ success:false, message:'A lesson can be closed once it has started.' });
    if (lc.status === 'cancelled' && lc.outcome !== 'not_held')
      return res.status(400).json({ success:false, message:'This lesson was cancelled in advance.' });

    const { closeUpdate } = require('../lib/scheduling');
    const { error, update } = closeUpdate(req.body || {}, { userId: req.user._id });
    if (error) return res.status(400).json({ success:false, message: error });
    const wasNotHeld = lc.outcome === 'not_held';
    Object.assign(lc, update);
    if (update.outcome === 'taught' && !lc.coveredTopic) {
      lc.coveredTopic = lc.syllabusTopicName || '';
      lc.coveredSubtopic = lc.syllabusSubtopicName || '';
    }
    if (update.outcome === 'not_held') {
      lc.status = 'cancelled';
      lc.cancelledAt = lc.cancelledAt || new Date();
      lc.cancelReason = update.notHeldReason;
      rememberOccurrence(lc);
    } else {
      lc.status = 'ended';
      lc.endedAt = lc.endedAt || new Date();
      lc.autoEnded = false;
    }
    await saveClass(lc);
    res.json({ success:true, message:'Lesson closed.', data: { liveClass: lc } });

    // Side effects after the response.
    if (lc.timetableEntryId) require('../lib/lessonPlan').restampForEntryId(lc.timetableEntryId);
    if (update.outcome === 'not_held' && !wasNotHeld) require('../lib/lessonNotices').lessonCancelled(lc, { reason: update.notHeldReason, notHeld: true });
    if (update.outcome === 'taught' && !lc.autoHomeworkGeneratedAt) {
      try { require('../services/autoHomeworkCron').processEndedClasses({ classId: lc._id }).catch(e => console.error('[close] homework', e.message)); }
      catch (e) { console.error('[close] homework', e.message); }
    }
  } catch (e) {
    console.error('[liveclasses close]', e.message);
    res.status(500).json({ success:false, message:'Failed to close the lesson.' });
  }
});

// Lessons the teacher still has to close (past, not cancelled, no outcome).
router.get('/teacher/to-close', auth, requireRole('teacher', ...STAFF_ROLES), async (req, res) => {
  try {
    const { closeCutover } = require('../lib/scheduling');
    const q = {
      kind: { $in: ['lesson', null] }, status: { $ne: 'cancelled' }, outcome: null,
      scheduledAt: { $gte: closeCutover(), $lte: new Date() },
    };
    if (!STAFF_ROLES.includes(req.user.role) || req.query.mine === '1') q.teacherId = req.user._id;
    const classes = await LiveClass.find(q).sort({ scheduledAt: -1 }).limit(100)
      .populate('assignedStudents', 'firstName lastName')
      .populate('preparationLessonId', 'title')
      .select('title subject grade scheduledAt durationMins assignedStudents syllabusTopicName syllabusSubtopicName preparationLessonId timetableEntryId teacherId status')
      .lean();
    res.json({ success:true, data: { classes } });
  } catch (e) {
    console.error('[liveclasses to-close]', e.message);
    res.status(500).json({ success:false, message:'Failed to load lessons to close.' });
  }
});

// For the Director of Studies: lessons left unconfirmed for over 24 hours.
router.get('/staff/unconfirmed', auth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const { closeCutover } = require('../lib/scheduling');
    const hours = Math.max(1, Math.min(24 * 30, Number(req.query.hours) || 24));
    const classes = await LiveClass.find({
      kind: { $in: ['lesson', null] }, status: { $ne: 'cancelled' }, outcome: null,
      scheduledAt: { $gte: closeCutover(), $lte: new Date(Date.now() - hours * 3600000) },
    }).sort({ scheduledAt: 1 }).limit(300)
      .populate('teacherId', 'firstName lastName email')
      .populate('assignedStudents', 'firstName lastName')
      .select('title subject grade scheduledAt durationMins assignedStudents teacherId syllabusTopicName syllabusSubtopicName')
      .lean();
    res.json({ success:true, data: { classes, hours } });
  } catch (e) {
    console.error('[liveclasses unconfirmed]', e.message);
    res.status(500).json({ success:false, message:'Failed to load unconfirmed lessons.' });
  }
});

// Lessons flagged as needing cover (teacher on leave without a replacement).
router.get('/staff/needs-cover', auth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const classes = await LiveClass.find({ needsCover: true, status: 'scheduled', scheduledAt: { $gt: new Date() } })
      .sort({ scheduledAt: 1 }).limit(300)
      .populate('teacherId', 'firstName lastName').populate('assignedStudents', 'firstName lastName')
      .select('title subject grade scheduledAt durationMins teacherId assignedStudents').lean();
    res.json({ success:true, data: { classes } });
  } catch (e) { res.status(500).json({ success:false, message:'Failed to load lessons needing cover.' }); }
});

// Staff: hand one lesson to a cover teacher.
router.post('/:id/cover', auth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const { teacherId } = req.body || {};
    if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(teacherId))
      return res.status(400).json({ success:false, message:'Choose a cover teacher.' });
    const cover = await User.findOne({ _id: teacherId, role: 'teacher' }).select('_id').lean();
    if (!cover) return res.status(400).json({ success:false, message:'That user is not a teacher.' });
    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });
    if (!lc.originalTeacherId && String(lc.teacherId) !== String(teacherId)) lc.originalTeacherId = lc.teacherId;
    lc.teacherId = teacherId;
    lc.needsCover = false;
    await lc.save();
    res.json({ success:true, message:'Cover teacher assigned.', data: { liveClass: lc } });
  } catch (e) { res.status(500).json({ success:false, message:'Failed to assign cover.' }); }
});

// ═══════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════
router.post('/:id/start', auth, requireRole('teacher', ...STAFF_ROLES), async (req, res) => {
  try {
    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });
    if (!STAFF_ROLES.includes(req.user.role) && String(lc.teacherId) !== String(req.user._id))
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
router.post('/:id/end', auth, requireRole('teacher', ...STAFF_ROLES), async (req, res) => {
  try {
    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });
    if (!STAFF_ROLES.includes(req.user.role) && String(lc.teacherId) !== String(req.user._id))
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
router.post('/:id/cancel', auth, requireRole('teacher', ...STAFF_ROLES), async (req, res) => {
  try {
    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success:false, message:'Class not found.' });
    if (!STAFF_ROLES.includes(req.user.role) && String(lc.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your class.' });

    lc.status = 'cancelled';
    lc.cancelledAt = new Date();
    lc.cancelReason = (req.body?.reason || '').trim();
    rememberOccurrence(lc);
    await saveClass(lc);
    res.json({ success:true, message:'Class cancelled.', data: { liveClass: lc } });
    if (lc.timetableEntryId) require('../lib/lessonPlan').restampForEntryId(lc.timetableEntryId);
    if (new Date(lc.scheduledAt) > new Date()) require('../lib/lessonNotices').lessonCancelled(lc, { reason: lc.cancelReason });
  } catch (e) {
    console.error('[liveclasses cancel]', e.message);
    res.status(500).json({ success:false, message:'Failed to cancel class.' });
  }
});

// ── Pin a specific lesson to ONE class ───────────────────────────────
// The deepest management level: a teacher overrides what a single
// upcoming class teaches. Pinned classes are skipped by subject-level
// reorders and restamps.
router.patch('/:id/lesson', auth, async (req, res) => {
  try {
    const Lesson = require('../models/Lesson');
    const TimetableEntry = require('../models/TimetableEntry');
    const cls = await LiveClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found.' });
    const isStaff = ['admin', 'ops_manager', 'dos'].includes(req.user.role);
    if (!isStaff && String(cls.teacherId) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not your class.' });
    if (new Date(cls.scheduledAt) <= new Date()) return res.status(400).json({ success: false, message: 'This class is in the past.' });
    // Subtopic-dialect pin: { topicName, subtopicName }
    if (!req.body?.lessonId && req.body?.subtopicName) {
      cls.preparationLessonId = null;
      cls.syllabusTopicName = String(req.body.topicName || '');
      cls.syllabusSubtopicName = String(req.body.subtopicName);
      cls.lessonPinned = true;
      await cls.save();
      if (cls.timetableEntryId) await require('../lib/lessonPlan').restampForEntryId(cls.timetableEntryId);
      return res.json({ success: true, message: `Pinned "${cls.syllabusSubtopicName}" to this class.` });
    }
    const lesson = await Lesson.findById(req.body?.lessonId).lean();
    if (!lesson) return res.status(400).json({ success: false, message: 'lessonId required.' });
    if (cls.timetableEntryId) {
      const entry = await TimetableEntry.findById(cls.timetableEntryId).select('subjectId').lean();
      if (entry?.subjectId && String(entry.subjectId) !== String(lesson.subjectId)) {
        return res.status(400).json({ success: false, message: 'That lesson belongs to a different syllabus.' });
      }
    }
    const { topicNameOf, restampForEntryId } = require('../lib/lessonPlan');
    cls.preparationLessonId = lesson._id;
    cls.syllabusTopicName = (await topicNameOf(lesson)) || lesson.title || '';
    cls.syllabusSubtopicName = lesson.subtopicName || '';
    cls.lessonPinned = true;
    await cls.save();
    // The rest of the series moves up so nothing else repeats this lesson.
    if (cls.timetableEntryId) await restampForEntryId(cls.timetableEntryId);
    res.json({ success: true, message: `Pinned "${lesson.title}" to this class.` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
