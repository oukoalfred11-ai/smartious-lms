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

// ── Student lesson-plan progress ─────────────────────────────────────
// For each of the student's spine-linked timetable slots: the full
// ordered lesson plan, with each lesson's real status - attended,
// held-but-missed, scheduled (materialized, real date), or projected
// (dated forward by the slot's weekly cadence, possible because the
// timetable is permanent).
//   GET /api/curriculum/progress
router.get('/progress', auth, async (req, res) => {
  try {
    const TimetableEntry = require('../models/TimetableEntry');
    const Lesson = require('../models/Lesson');
    const LiveClass = require('../models/LiveClass');
    const ClassroomSession = require('../models/ClassroomSession');
    const now = new Date();
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const EAT = 3 * 3600 * 1000;

    const entries = await TimetableEntry.find({
      assignedStudents: req.user._id, isActive: true, subjectId: { $ne: null },
    }).populate('teacherId', 'firstName lastName').lean();

    const subjects = [];
    for (const entry of entries) {
      const lessons = await Lesson.find({ subjectId: entry.subjectId, isActive: { $ne: false } })
        .sort({ order: 1 }).select('title topicName subtopicName order').lean();
      if (!lessons.length) continue;

      const classes = await LiveClass.find({ timetableEntryId: entry._id, preparationLessonId: { $ne: null } })
        .select('preparationLessonId scheduledAt status').sort({ scheduledAt: 1 }).lean();
      const pastIds = classes.filter(c => new Date(c.scheduledAt) <= now && c.status !== 'cancelled').map(c => c._id);
      const joined = pastIds.length
        ? await ClassroomSession.distinct('liveClassId', { liveClassId: { $in: pastIds }, userId: req.user._id, joinCount: { $gt: 0 } })
        : [];
      const joinedSet = new Set(joined.map(String));
      const byLesson = {};
      classes.forEach(c => { if (!byLesson[String(c.preparationLessonId)]) byLesson[String(c.preparationLessonId)] = c; });

      // Projection cursor: continue weekly from the latest known class,
      // or from the slot's next occurrence if nothing is materialized.
      let cursor;
      if (classes.length) cursor = new Date(Math.max(...classes.map(c => new Date(c.scheduledAt).getTime())));
      else {
        const [h, m] = String(entry.startTime || '9:0').split(':').map(Number);
        cursor = null;
        for (let d = 0; d <= 7 && !cursor; d++) {
          const eat = new Date(now.getTime() + EAT + d * 864e5);
          if (DAYS[eat.getUTCDay()] === entry.dayOfWeek) {
            const t = new Date(Date.UTC(eat.getUTCFullYear(), eat.getUTCMonth(), eat.getUTCDate(), h || 9, m || 0) - EAT);
            cursor = t > now ? new Date(t.getTime() - 7 * 864e5) : t;
          }
        }
        if (!cursor) cursor = now;
      }

      let attended = 0, missed = 0, upcoming = 0;
      const plan = lessons.map(l => {
        const cls = byLesson[String(l._id)];
        if (cls) {
          const past = new Date(cls.scheduledAt) <= now && cls.status !== 'cancelled';
          const status = cls.status === 'cancelled' ? 'cancelled' : past ? (joinedSet.has(String(cls._id)) ? 'attended' : 'missed') : 'scheduled';
          if (status === 'attended') attended++; else if (status === 'missed') missed++; else if (status === 'scheduled') upcoming++;
          return { title: l.title, topic: l.topicName || '', subtopic: l.subtopicName || '', status, date: cls.scheduledAt };
        }
        cursor = new Date(cursor.getTime() + 7 * 864e5);
        return { title: l.title, topic: l.topicName || '', subtopic: l.subtopicName || '', status: 'projected', date: cursor };
      });

      subjects.push({
        subject: entry.subject, title: entry.title || entry.subject,
        teacher: entry.teacherId ? [entry.teacherId.firstName, entry.teacherId.lastName].filter(Boolean).join(' ') : '',
        slot: `${entry.dayOfWeek} ${entry.startTime}`,
        counts: { total: plan.length, covered: attended + missed, attended, missed, upcoming },
        plan,
      });
    }
    res.json({ success: true, data: { subjects } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router
module.exports.SUBJECTS = SUBJECTS
