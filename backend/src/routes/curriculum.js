/**
 * routes/curriculum.js
 * Serves curriculum options (curricula, grades, subjects) for the user form.
 * GET /api/curriculum/options
 * GET /api/curriculum/subjects/:curriculumId
 *
 * SOURCE OF TRUTH (fixed 2026-08-27)
 * The subject catalogue is the constants file MERGED with the live
 * Subject collection. Constants alone made every subject created in
 * the database — for example by a syllabus spine script — invisible
 * to the question bank and every form fed by this endpoint: American
 * Grade 7 Science existed, had a full spine, and could not be picked
 * because the constants only list AP courses under American. Now any
 * (subjectName, curriculum) pair present in the database appears in
 * the catalogue automatically: existing constant entries gain the
 * curriculum in availableIn, and genuinely new subjects are appended
 * as dynamic entries. Constants remain the base catalogue; the
 * database can only ADD availability, never remove it.
 */
const express = require('express')
const router  = express.Router()
const { auth } = require('../middleware/auth')

const { CURRICULA, SUBJECTS, GRADES_BY_CURRICULUM } = require('../constants/curriculum')
const Subject = require('../models/Subject')

// ── DB MERGE ──────────────────────────────────────────────
const normName = v => String(v || '').trim().toLowerCase()
const slug = v => normName(v).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

let _cache = { at: 0, subjects: null }
const CACHE_MS = 60 * 1000

const buildMergedSubjects = async () => {
  const now = Date.now()
  if (_cache.subjects && now - _cache.at < CACHE_MS) return _cache.subjects

  const merged = SUBJECTS.map(s => ({
    ...s,
    availableIn: s.availableIn === 'all' ? 'all' : [...s.availableIn],
  }))

  try {
    const dbRows = await Subject.find({ isActive: { $ne: false } })
      .select('subjectName curriculum category').lean()
    for (const d of dbRows) {
      if (!d.subjectName || !d.curriculum) continue
      const hit = merged.find(s => normName(s.name) === normName(d.subjectName))
      if (hit) {
        if (hit.availableIn !== 'all' && !hit.availableIn.includes(d.curriculum)) {
          hit.availableIn.push(d.curriculum)
        }
      } else {
        merged.push({
          id: 'db_' + slug(d.subjectName),
          name: d.subjectName,
          category: d.category || 'General',
          availableIn: [d.curriculum],
          fromDb: true,
        })
      }
    }
    _cache = { at: now, subjects: merged }
  } catch (e) {
    console.error('[curriculum] subject merge failed, serving constants only:', e.message)
    return merged
  }
  return merged
}

// ── HELPERS ───────────────────────────────────────────────
const getSubjectsForCurriculum = (curriculumId, catalogue = SUBJECTS) => {
  const EXPLICIT_ONLY = ['CambridgePrimary', 'IBPYP', 'IBMYP']
  const filtered = catalogue.filter(s => {
    if (EXPLICIT_ONLY.includes(curriculumId)) {
      return Array.isArray(s.availableIn) && s.availableIn.includes(curriculumId)
    }
    return s.availableIn === 'all' || s.availableIn.includes(curriculumId)
  })
  const grouped = {}
  filtered.forEach(s => {
    if (!grouped[s.category]) grouped[s.category] = []
    grouped[s.category].push(s)
  })
  return { flat: filtered, grouped }
}

const getGradesForCurriculum = (curriculumId) => GRADES_BY_CURRICULUM[curriculumId] || []

const isSubjectValidForCurriculum = (subjectId, curriculumId) => {
  const subject = SUBJECTS.find(s => s.id === subjectId)
  if (!subject) return false
  if (['CambridgePrimary', 'IBPYP', 'IBMYP'].includes(curriculumId)) {
    return Array.isArray(subject.availableIn) && subject.availableIn.includes(curriculumId)
  }
  return subject.availableIn === 'all' || subject.availableIn.includes(curriculumId)
}

// GET /api/curriculum/options
router.get('/options', auth, async (req, res) => {
  const subjects = await buildMergedSubjects()
  res.json({
    success: true,
    curricula: CURRICULA,
    gradesByCurriculum: GRADES_BY_CURRICULUM,
    subjects,
  })
})

// GET /api/curriculum/subjects/:curriculumId
router.get('/subjects/:curriculumId', auth, async (req, res) => {
  const { curriculumId } = req.params
  const catalogue = await buildMergedSubjects()
  const { flat } = getSubjectsForCurriculum(curriculumId, catalogue)
  res.json({ success: true, subjects: flat })
})

// ── Student lesson-plan progress (spine-first) ───────────────────────
// The plan is the SPINE itself: every lesson in order. Coverage comes
// from any of the student's classes that taught a spine lesson
// (timetable-born or manual); attendance from their join records;
// future dates from materialized classes, then projected weekly.
//   GET /api/curriculum/progress/subject?subjectId=...
router.get('/progress/subject', auth, async (req, res) => {
  try {
    const Lesson = require('../models/Lesson');
    const LiveClass = require('../models/LiveClass');
    const ClassroomSession = require('../models/ClassroomSession');
    const TimetableEntry = require('../models/TimetableEntry');
    const mongooseX = require('mongoose');
    const sid = String(req.query.subjectId || '');
    if (!mongooseX.isValidObjectId(sid)) return res.status(400).json({ success: false, message: 'subjectId required.' });
    const now = new Date();

    const lessons = await Lesson.find({ subjectId: sid, isActive: { $ne: false } })
      .sort({ order: 1 }).select('title topicName subtopicName').lean();

    if (!lessons.length) {
      // Subtopic mode: most spines carry their plan as topics with
      // subtopics (the same tree the 0-of-285 metric counts). The plan
      // is that tree in display order, ticked from the student's
      // syllabus-progress records.
      const SyllabusTopic = require('../models/SyllabusTopic');
      const StudentSyllabusProgress = require('../models/StudentSyllabusProgress');
      const topics = await SyllabusTopic.find({ subjectId: sid }).sort({ topicOrder: 1 }).lean();
      if (!topics.length) return res.json({ success: true, data: null });
      const done = await StudentSyllabusProgress.find({ studentId: req.user._id, subjectId: sid }).lean();
      const doneMap = {};
      done.forEach(d => { doneMap[`${d.syllabusTopicName || ''}||${d.syllabusSubtopicName}`] = d.updatedAt || d.createdAt || null; });
      let total = 0, covered = 0;
      const groups = topics.map(t => ({
        topic: t.topic,
        items: (t.subtopics || []).map(st => {
          total += 1;
          const key = `${t.topic}||${st.name}`;
          const key2 = `||${st.name}`;
          const when = doneMap[key] !== undefined ? doneMap[key] : doneMap[key2];
          const isDone = when !== undefined;
          if (isDone) covered += 1;
          return { name: st.name, done: isDone, date: when || null };
        }),
      })).filter(g => g.items.length);
      // Pace: observed velocity from the done-records' timestamps,
      // else 3 subtopics per weekly slot as a planning heuristic.
      const slots = await TimetableEntry.countDocuments({ assignedStudents: req.user._id, isActive: true, subjectId: sid });
      let perWeek = 0;
      const stamps = done.map(d => new Date(d.updatedAt || d.createdAt || 0).getTime()).filter(t => t > 0).sort();
      if (stamps.length >= 2) {
        const weeks = Math.max((stamps[stamps.length - 1] - stamps[0]) / (7 * 864e5), 1);
        perWeek = covered / weeks;
      }
      if (!perWeek) perWeek = slots * 3;
      const remaining = total - covered;
      const est = perWeek > 0 && remaining > 0 ? new Date(Date.now() + (remaining / perWeek) * 7 * 864e5) : null;
      return res.json({ success: true, data: {
        mode: 'subtopics', slot: '',
        counts: { total, covered, attended: covered, missed: 0 },
        pace: { perWeek: Math.round(perWeek * 10) / 10, slotsPerWeek: slots, estCompletionDate: est },
        groups,
      } });
    }
    const lessonIds = lessons.map(l => l._id);

    const classes = await LiveClass.find({
      assignedStudents: req.user._id,
      preparationLessonId: { $in: lessonIds },
    }).select('preparationLessonId scheduledAt status').sort({ scheduledAt: 1 }).lean();
    const pastIds = classes.filter(c => new Date(c.scheduledAt) <= now && c.status !== 'cancelled').map(c => c._id);
    const joined = pastIds.length
      ? await ClassroomSession.distinct('liveClassId', { liveClassId: { $in: pastIds }, userId: req.user._id, joinCount: { $gt: 0 } })
      : [];
    const joinedSet = new Set(joined.map(String));
    const byLesson = {};
    classes.forEach(c => { if (!byLesson[String(c.preparationLessonId)]) byLesson[String(c.preparationLessonId)] = c; });

    // Weekly cadence for projection: the student's slot on this spine
    // if one exists, else a plain 7-day rhythm from the last known date.
    const entry = await TimetableEntry.find({ assignedStudents: req.user._id, isActive: true, subjectId: sid })
      .select('dayOfWeek startTime').limit(1).lean();
    const slot = entry.length ? `${entry[0].dayOfWeek} ${entry[0].startTime}` : '';
    let cursor = classes.length
      ? new Date(Math.max(...classes.map(c => new Date(c.scheduledAt).getTime())))
      : now;

    let attended = 0, missed = 0;
    const plan = lessons.map(l => {
      const cls = byLesson[String(l._id)];
      if (cls) {
        const past = new Date(cls.scheduledAt) <= now && cls.status !== 'cancelled';
        const status = cls.status === 'cancelled' ? 'cancelled' : past ? (joinedSet.has(String(cls._id)) ? 'attended' : 'missed') : 'scheduled';
        if (status === 'attended') attended++; else if (status === 'missed') missed++;
        return { title: l.title, topic: l.topicName || '', subtopic: l.subtopicName || '', status, date: cls.scheduledAt };
      }
      cursor = new Date(cursor.getTime() + 7 * 864e5);
      return { title: l.title, topic: l.topicName || '', subtopic: l.subtopicName || '', status: 'projected', date: cursor };
    });

    const slotsPerWeek = await TimetableEntry.countDocuments({ assignedStudents: req.user._id, isActive: true, subjectId: sid });
    res.json({ success: true, data: {
      mode: 'lessons', slot,
      counts: { total: plan.length, covered: attended + missed, attended, missed },
      pace: { slotsPerWeek, estCompletionDate: plan.length ? plan[plan.length - 1].date : null },
      plan,
    } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router
module.exports.SUBJECTS = SUBJECTS
