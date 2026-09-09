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
    if (!isOwn && !['teacher', 'admin', 'dos'].includes(req.user.role)) {
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
    if (!isOwn && !['admin','dos'].includes(req.user.role)) {
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
    require('../lib/timetableMaterializer').reconcile().catch(() => {});

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
    require('../lib/timetableMaterializer').reconcile().catch(() => {});
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
    require('../lib/timetableMaterializer').reconcile().catch(() => {});
    return ok(res, { deleted: true }, 'Entry deleted.');
  } catch (err) {
    console.error('[timetable DELETE /:id]', err.message);
    return fail(res, 500, err.message || 'Failed to delete.');
  }
});

// ── School-wide overview for the DOS Timetable Manager ───────────────
// One call powering the console: every teacher with their active slot
// count (zero = the migration chase-list), every student for search and
// slot assignment, and headline stats.
router.get('/overview', auth, requireRole('admin', 'ops_manager', 'dos', 'teacher'), async (req, res) => {
  try {
    const User = require('../models/User');
    const Subject = require('../models/Subject');
    const [teachers, students, perTeacher, weekendCount, subjects] = await Promise.all([
      User.find({ role: 'teacher', isActive: { $ne: false } }).select('firstName lastName').sort({ firstName: 1 }).lean(),
      User.find({ role: 'student', isActive: { $ne: false } }).select('firstName lastName gradeLevel admissionNo').sort({ firstName: 1 }).lean(),
      TimetableEntry.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$teacherId', n: { $sum: 1 } } },
      ]),
      TimetableEntry.countDocuments({ isActive: true, dayOfWeek: { $in: ['Sat', 'Sun'] } }),
      Subject.find({ isActive: { $ne: false } }).select('subjectName curriculum').sort({ subjectName: 1 }).lean(),
    ]);
    // Full active entry set for printable timetables (school / per person).
    const allEntries = await TimetableEntry.find({ isActive: true })
      .populate('teacherId', 'firstName lastName')
      .populate('assignedStudents', 'firstName lastName gradeLevel')
      .lean();
    const counts = Object.fromEntries(perTeacher.map(r => [String(r._id), r.n]));
    const tRows = teachers.map(t => ({ _id: t._id, name: [t.firstName, t.lastName].filter(Boolean).join(' '), slots: counts[String(t._id)] || 0 }));
    return ok(res, {
      subjects: subjects.map(x => ({ _id: x._id, name: x.subjectName + (x.curriculum ? ' (' + x.curriculum + ')' : ''), subjectName: x.subjectName, curriculum: x.curriculum || '' })),
      teachers: tRows,
      students: students.map(st => ({ _id: st._id, name: [st.firstName, st.lastName].filter(Boolean).join(' '), grade: st.gradeLevel || '', admissionNo: st.admissionNo || '' })),
      entries: allEntries.map(e => ({
        _id: e._id, title: e.title, subject: e.subject, curriculum: e.curriculum, grade: e.grade,
        dayOfWeek: e.dayOfWeek, startTime: e.startTime, endTime: e.endTime,
        teacher: e.teacherId ? [e.teacherId.firstName, e.teacherId.lastName].filter(Boolean).join(' ') : 'Unassigned',
        students: (e.assignedStudents || []).map(x => ({ name: [x.firstName, x.lastName].filter(Boolean).join(' '), grade: x.gradeLevel || '' })),
      })),
      stats: {
        activeSlots: perTeacher.reduce((a, r) => a + r.n, 0),
        teachersWithout: tRows.filter(t => t.slots === 0).length,
        weekendSlots: weekendCount,
      },
    });
  } catch (e) { return fail(res, 500, e.message); }
});

// ── Per-slot lesson-plan management ──────────────────────────────────
// The teacher's control over WHAT gets taught in a slot, while WHEN
// stays fixed by the timetable. Only slotted classes are manageable.
const Lesson = require('../models/Lesson');
const LiveClass = require('../models/LiveClass');

async function groupEntries(entry) {
  if (!entry.subjectId) return [entry];
  const key = (e) => (e.assignedStudents || []).map(String).sort().join(',');
  const siblings = await TimetableEntry.find({
    teacherId: entry.teacherId, subjectId: entry.subjectId, isActive: true,
  }).lean();
  return siblings.filter(e => key(e) === key(entry));
}

async function loadPlan(entry) {
  const lessons = await Lesson.find({ subjectId: entry.subjectId, isActive: { $ne: false } })
    .sort({ order: 1 }).select('title topicName subtopicName').lean();
  if (!lessons.length) return loadSubtopicPlan(entry);
  const members = await groupEntries(entry);
  const usedIds = await LiveClass.distinct('preparationLessonId', {
    timetableEntryId: { $in: members.map(m => m._id) }, preparationLessonId: { $ne: null },
    status: { $ne: 'cancelled' }, scheduledAt: { $lte: new Date() },
  });
  const usedSet = new Set(usedIds.map(String));
  const rank = {};
  (entry.lessonOrder || []).forEach((id, ix) => { rank[String(id)] = ix; });
  const ordered = [...lessons].sort((a, b) => (rank[String(a._id)] ?? 1e9) - (rank[String(b._id)] ?? 1e9));
  // Taught lessons first (history), then the teachable queue.
  const taught = ordered.filter(l => usedSet.has(String(l._id)));
  const queue = ordered.filter(l => !usedSet.has(String(l._id)));
  return { mode: 'lessons', taught, queue, members };
}

// Subtopic dialect: the plan is the SyllabusTopic tree; "taught" is
// what the group's past classes have stamped.
async function loadSubtopicPlan(entry) {
  const SyllabusTopic = require('../models/SyllabusTopic');
  const members = await groupEntries(entry);
  const topics = await SyllabusTopic.find({ subjectId: entry.subjectId }).sort({ topicOrder: 1 }).lean();
  if (!topics.length) return { mode: 'none', taught: [], queue: [], members };
  const stamped = await LiveClass.find({
    timetableEntryId: { $in: members.map(m => m._id) },
    syllabusSubtopicName: { $nin: [null, ''] },
    status: { $ne: 'cancelled' }, scheduledAt: { $lte: new Date() },
  }).select('syllabusTopicName syllabusSubtopicName').lean();
  const usedKeys = new Set(stamped.map(x => `${x.syllabusTopicName || ''}||${x.syllabusSubtopicName}`));
  const all = [];
  topics.forEach(tp => (tp.subtopics || []).forEach(st => all.push({
    key: `${tp.topic}||${st.name}`, title: st.name, topicName: tp.topic,
  })));
  const os = members.find(m => Array.isArray(m.topicPlanOrder) && m.topicPlanOrder.length);
  const ordered = [...all];
  if (os) {
    const rank = {};
    os.topicPlanOrder.forEach((k, ix) => { rank[k] = ix; });
    ordered.sort((a, b) => (rank[a.key] ?? 1e9) - (rank[b.key] ?? 1e9));
  }
  return {
    mode: 'subtopics',
    taught: ordered.filter(x => usedKeys.has(x.key)),
    queue: ordered.filter(x => !usedKeys.has(x.key)),
    members,
  };
}

// Re-stamp future materialized instances to follow the (new) queue.
async function restampFuture(entry) {
  const { queue, members } = await loadPlan(entry);
  const future = await LiveClass.find({
    timetableEntryId: { $in: members.map(m => m._id) }, fromTimetable: true,
    detached: { $ne: true }, status: { $nin: ['cancelled', 'completed'] },
    scheduledAt: { $gt: new Date() },
  }).sort({ scheduledAt: 1 });
  let i = 0, stamped = 0;
  for (const cls of future) {
    if (cls.lessonPinned) continue;   // teacher pinned this class - keep it
    const l = queue[i++] || null;
    cls.preparationLessonId = l && l._id ? l._id : null;
    cls.syllabusTopicName = l ? (l.topicName || l.title || '') : '';
    cls.syllabusSubtopicName = l ? (l.key ? l.title : (l.subtopicName || '')) : '';
    await cls.save();
    stamped += 1;
  }
  return stamped;
}

function canManage(req, entry) {
  const role = req.user.role;
  if (['admin', 'ops_manager', 'dos'].includes(role)) return true;
  return String(entry.teacherId) === String(req.user._id);
}

// GET /timetable/:id/lesson-plan
router.get('/:id/lesson-plan', auth, async (req, res) => {
  try {
    const entry = await TimetableEntry.findById(req.params.id).lean();
    if (!entry || entry.isActive === false) return res.status(404).json({ success: false, message: 'Slot not found.' });
    if (!canManage(req, entry)) return res.status(403).json({ success: false, message: 'Not your slot.' });
    if (!entry.subjectId) return res.json({ success: true, data: { linked: false } });
    const { mode, taught, queue, members } = await loadPlan(entry);
    const lessonName = {};
    [...taught, ...queue].forEach(l => { if (l._id) lessonName[String(l._id)] = l.title; });
    const upcoming = await LiveClass.find({
      timetableEntryId: { $in: members.map(m => m._id) }, fromTimetable: true, detached: { $ne: true },
      status: { $nin: ['cancelled', 'completed'] }, scheduledAt: { $gt: new Date() },
    }).sort({ scheduledAt: 1 }).limit(12).select('scheduledAt preparationLessonId lessonPinned status syllabusTopicName syllabusSubtopicName').lean();
    const User = require('../models/User');
    const studentIds = [...new Set(members.flatMap(m => (m.assignedStudents || []).map(String)))];
    const students = await User.find({ _id: { $in: studentIds } }).select('firstName lastName gradeLevel').lean();
    res.json({ success: true, data: {
      linked: mode !== 'none', mode, taught, queue,
      slots: members.map(m => ({ _id: m._id, dayOfWeek: m.dayOfWeek, startTime: m.startTime, endTime: m.endTime })),
      students: students.map(st => ({ _id: st._id, name: [st.firstName, st.lastName].filter(Boolean).join(' '), grade: st.gradeLevel || '' })),
      upcoming: upcoming.map(x => ({
        _id: x._id, scheduledAt: x.scheduledAt, pinned: !!x.lessonPinned, status: x.status,
        lessonTitle: x.preparationLessonId
          ? (lessonName[String(x.preparationLessonId)] || 'Assigned lesson')
          : (x.syllabusSubtopicName ? `${x.syllabusTopicName ? x.syllabusTopicName + ': ' : ''}${x.syllabusSubtopicName}` : ''),
      })),
    } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PATCH /timetable/:id/lesson-plan  { queueOrder: [lessonIds] }
// The remaining (unteught) lessons, in the teacher's chosen order.
router.patch('/:id/lesson-plan', auth, async (req, res) => {
  try {
    const entry = await TimetableEntry.findById(req.params.id);
    if (!entry || entry.isActive === false) return res.status(404).json({ success: false, message: 'Slot not found.' });
    if (!canManage(req, entry)) return res.status(403).json({ success: false, message: 'Not your slot.' });
    if (!entry.subjectId) return res.status(400).json({ success: false, message: 'This slot is not linked to a syllabus.' });
    const ids = Array.isArray(req.body?.queueOrder) ? req.body.queueOrder.filter(x => x) : [];
    if (!ids.length) return res.status(400).json({ success: false, message: 'queueOrder required.' });
    const members = await groupEntries(entry);
    const lessonCount = await Lesson.countDocuments({ subjectId: entry.subjectId, isActive: { $ne: false } });
    if (lessonCount > 0) {
      const valid = await Lesson.countDocuments({ _id: { $in: ids }, subjectId: entry.subjectId });
      if (valid !== ids.length) return res.status(400).json({ success: false, message: 'Order contains lessons outside this syllabus.' });
      await TimetableEntry.updateMany({ _id: { $in: members.map(m => m._id) } }, { $set: { lessonOrder: ids } });
    } else {
      // Subtopic dialect: keys of "Topic||Subtopic".
      const SyllabusTopic = require('../models/SyllabusTopic');
      const topics = await SyllabusTopic.find({ subjectId: entry.subjectId }).lean();
      const validKeys = new Set();
      topics.forEach(tp => (tp.subtopics || []).forEach(st => validKeys.add(`${tp.topic}||${st.name}`)));
      if (!ids.every(k => validKeys.has(k))) return res.status(400).json({ success: false, message: 'Order contains topics outside this syllabus.' });
      await TimetableEntry.updateMany({ _id: { $in: members.map(m => m._id) } }, { $set: { topicPlanOrder: ids } });
    }
    const restamped = await restampFuture(entry);
    res.json({ success: true, message: `Order saved. ${restamped} upcoming class(es) updated to follow it.` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
