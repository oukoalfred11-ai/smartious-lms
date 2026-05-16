/**
 * routes/lesson-progress.js
 * ============================================================
 * Mounted at /api/lesson-progress
 *
 * Mastery-gated lesson progress: only teachers can mark mastery.
 * Students can read their own progress to see which lessons they've
 * been credited with.
 *
 * Endpoints:
 *   POST   /toggle                  teacher toggles a (student, lesson) pair
 *   GET    /student/:studentId      teacher views all progress for one student
 *   GET    /student/:studentId/lesson/:lessonId  single-record lookup
 *   GET    /my                      current student fetches own progress map
 *   GET    /teacher-roster/:subjectId  teacher views progress matrix for one of
 *                                      their subjects (all students × all lessons)
 */

const express  = require('express');
const mongoose = require('mongoose');
const router   = express.Router();

const LessonProgress = require('../models/LessonProgress');
const Lesson         = require('../models/Lesson');
const Allocation     = require('../models/Allocation');
const User           = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────
// POST /toggle — teacher marks a (student, lesson) mastery
// Body: { studentId, lessonId, mastered (bool), teacherNotes? }
// - mastered=true → upsert mastery record
// - mastered=false → delete record (if exists)
// Authorisation: the lesson must belong to this teacher (or admin).
// ─────────────────────────────────────────────────────────
router.post('/toggle', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { studentId, lessonId, mastered, teacherNotes = '' } = req.body;

    if (!mongoose.isValidObjectId(studentId))
      return res.status(400).json({ success: false, message: 'Invalid studentId.' });
    if (!mongoose.isValidObjectId(lessonId))
      return res.status(400).json({ success: false, message: 'Invalid lessonId.' });

    const lesson = await Lesson.findById(lessonId).lean();
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });

    // Authorisation: teacher must own this lesson (unless admin)
    if (req.user.role !== 'admin' && String(lesson.teacherId) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not your lesson.' });

    // Verify the student exists
    const student = await User.findById(studentId).select('role').lean();
    if (!student || student.role !== 'student')
      return res.status(404).json({ success: false, message: 'Student not found.' });

    if (mastered === false) {
      // Delete the record (treat as "unmark")
      const deleted = await LessonProgress.findOneAndDelete({ studentId, lessonId });
      return res.json({
        success: true,
        message: deleted ? 'Mastery removed.' : 'Was not marked.',
        data: { mastered: false },
      });
    }

    // Upsert mastery record
    const record = await LessonProgress.findOneAndUpdate(
      { studentId, lessonId },
      {
        $set: {
          subjectId:    lesson.subjectId,
          mastered:     true,
          masteredAt:   new Date(),
          masteredBy:   req.user._id,
          teacherNotes: (teacherNotes || '').toString().trim(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: 'Marked as mastered.',
      data: { progress: record },
    });
  } catch (e) {
    console.error('[lesson-progress toggle]', e.message);
    res.status(500).json({ success: false, message: 'Failed to update mastery: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /student/:studentId — teacher views one student's progress
// Returns array of LessonProgress docs the teacher has marked for them.
// Only returns progress against lessons the requesting teacher owns
// (or all, if admin).
// ─────────────────────────────────────────────────────────
router.get('/student/:studentId', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.isValidObjectId(studentId))
      return res.status(400).json({ success: false, message: 'Invalid studentId.' });

    // Find lessons this teacher owns
    const lessonFilter = req.user.role === 'admin' ? {} : { teacherId: req.user._id };
    const lessonIds = await Lesson.find(lessonFilter).distinct('_id');

    const progress = await LessonProgress.find({
      studentId,
      lessonId: { $in: lessonIds },
    })
      .populate('lessonId', 'title order termIndex subjectId')
      .lean();

    res.json({ success: true, data: { progress } });
  } catch (e) {
    console.error('[lesson-progress student]', e.message);
    res.status(500).json({ success: false, message: 'Failed to load progress.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /my — current student's own progress, as a flat map
// keyed by lessonId for easy lookup in the Lesson Player UI.
// ─────────────────────────────────────────────────────────
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student')
      return res.status(403).json({ success: false, message: 'Students only.' });

    const records = await LessonProgress.find({ studentId: req.user._id })
      .select('lessonId subjectId masteredAt')
      .lean();

    // Build keyed map: { [lessonId]: { masteredAt, ... } }
    const byLesson = {};
    records.forEach(r => {
      byLesson[String(r.lessonId)] = {
        lessonId:   String(r.lessonId),
        subjectId:  String(r.subjectId),
        masteredAt: r.masteredAt,
      };
    });

    // Also aggregate per-subject counts
    const bySubject = {};
    records.forEach(r => {
      const sid = String(r.subjectId);
      bySubject[sid] = (bySubject[sid] || 0) + 1;
    });

    res.json({
      success: true,
      data: { byLesson, bySubject, totalMastered: records.length },
    });
  } catch (e) {
    console.error('[lesson-progress my]', e.message);
    res.status(500).json({ success: false, message: 'Failed to load progress.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /teacher-roster/:subjectId — matrix of (students × lessons)
// for this subject. Used in the teacher Mastery Tracker view.
// Returns:
//   students: [{ _id, firstName, lastName, admissionNumber }]
//   lessons:  [{ _id, title, order, termIndex, status }]
//   masteryMap: { [studentId]: { [lessonId]: { masteredAt, masteredBy } } }
// ─────────────────────────────────────────────────────────
router.get('/teacher-roster/:subjectId', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { subjectId } = req.params;
    if (!mongoose.isValidObjectId(subjectId))
      return res.status(400).json({ success: false, message: 'Invalid subjectId.' });

    // Lessons in this subject owned by the requesting teacher (or all, if admin)
    const lessonFilter = { subjectId };
    if (req.user.role !== 'admin') lessonFilter.teacherId = req.user._id;
    const lessons = await Lesson.find(lessonFilter)
      .sort({ termIndex: 1, order: 1 })
      .select('title order termIndex status')
      .lean();

    if (lessons.length === 0)
      return res.json({
        success: true,
        data: { students: [], lessons: [], masteryMap: {} },
      });

    // Find allocations: students this teacher (or any) is paired with for this subject
    const allocationFilter = { subjectId, status: 'Active' };
    if (req.user.role !== 'admin') allocationFilter.teacherId = req.user._id;
    const allocations = await Allocation.find(allocationFilter)
      .populate('studentId', 'firstName lastName admissionNumber email')
      .lean();

    const students = allocations
      .map(a => a.studentId)
      .filter(Boolean)
      .sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));

    if (students.length === 0)
      return res.json({
        success: true,
        data: { students: [], lessons, masteryMap: {} },
      });

    // Fetch all relevant LessonProgress records in one query
    const records = await LessonProgress.find({
      studentId: { $in: students.map(s => s._id) },
      lessonId:  { $in: lessons.map(l => l._id) },
    }).lean();

    const masteryMap = {};
    records.forEach(r => {
      const sid = String(r.studentId);
      const lid = String(r.lessonId);
      if (!masteryMap[sid]) masteryMap[sid] = {};
      masteryMap[sid][lid] = {
        masteredAt: r.masteredAt,
        teacherNotes: r.teacherNotes,
      };
    });

    res.json({
      success: true,
      data: { students, lessons, masteryMap },
    });
  } catch (e) {
    console.error('[lesson-progress teacher-roster]', e.message);
    res.status(500).json({ success: false, message: 'Failed to load mastery roster.' });
  }
});

module.exports = router;
