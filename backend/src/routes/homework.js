/**
 * HOMEWORK ROUTES
 * ============================================================
 *  Teacher endpoints:
 *    POST   /api/homework                   create
 *    GET    /api/homework?createdBy=me      list own
 *    GET    /api/homework/:id               get one
 *    PATCH  /api/homework/:id               update
 *    DELETE /api/homework/:id               soft delete
 *    GET    /api/homework/:id/submissions   list submissions for grading
 *
 *  Student endpoints:
 *    GET    /api/homework/student/list      visible homework (for me)
 *    POST   /api/homework/:id/start         create empty submission
 *    POST   /api/homework/:id/submit        submit answers
 *    GET    /api/homework/:id/my-submission get own submission
 *
 *  Grading endpoints (teacher):
 *    PATCH  /api/homework/:hwId/submissions/:subId/grade
 *
 * KEY LOGIC:
 *   - Teacher who creates can edit/delete (so can admin)
 *   - Students see homework only if:
 *       (a) status='published' AND isActive
 *       (b) they're in assignedStudents OR in assignedRoom.students
 *   - Lock-until-date: returned in response, frontend respects it
 *   - MCQ auto-grading happens in /submit
 */

const express = require('express');
const router = express.Router();

const Homework = require('../models/Homework');
const HomeworkSubmission = require('../models/HomeworkSubmission');
const Question = require('../models/Question');
const GroupRoom = require('../models/GroupRoom');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const isObjectId = (s) => /^[a-f\d]{24}$/i.test(s);

// Snapshot a question (full copy for homework embedding)
function snapshotQuestion(q) {
  return {
    questionId:    q._id || null,
    type:          q.type,
    questionText:  q.questionText,
    options:       Array.isArray(q.options) ? [...q.options] : [],
    correctAnswer: q.correctAnswer,
    explanation:   q.explanation || '',
    marks:         q.marks || 1,
    difficulty:    q.difficulty || 'medium',
    attachments:   Array.isArray(q.attachments) ? q.attachments.map(a => ({...a})) : [],
    topic:         q.topic || '',
  };
}

// Auto-grade MCQ answer (returns awarded marks)
function autoGradeMCQ(snapshotQuestion, answer) {
  if (snapshotQuestion.type !== 'mcq') return { awarded: null, autoGraded: false };
  const correct = snapshotQuestion.correctAnswer;
  // correctAnswer can be a number (option index) or string (option text)
  let isCorrect = false;
  if (typeof correct === 'number') {
    isCorrect = (answer === correct);
  } else if (typeof correct === 'string') {
    isCorrect = (snapshotQuestion.options[answer] === correct);
  }
  return {
    awarded: isCorrect ? snapshotQuestion.marks : 0,
    autoGraded: true,
  };
}

// ─────────────────────────────────────────────────────────
// POST /api/homework  — teacher creates homework
// Body: { title, description, curriculum, subject, grade,
//         questions: [{questionId or full snapshot}], saveCustomToBank: bool,
//         assignedRoom, assignedStudents, releaseAt, dueAt, status }
// ─────────────────────────────────────────────────────────
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const {
      title, description,
      curriculum, subject, grade,
      questions, saveCustomToBank,
      assignedRoom, assignedStudents,
      releaseAt, dueAt,
      status,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    if (!curriculum || !subject || !grade) {
      return res.status(400).json({ success: false, message: 'curriculum, subject and grade are required.' });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required.' });
    }
    if (!releaseAt) {
      return res.status(400).json({ success: false, message: 'releaseAt is required.' });
    }
    if (!assignedRoom && (!Array.isArray(assignedStudents) || assignedStudents.length === 0)) {
      return res.status(400).json({ success: false, message: 'Must assign to a room or specific students.' });
    }

    // Build snapshotted questions array
    const snapshots = [];
    for (const q of questions) {
      let snapshot;
      if (q.questionId && isObjectId(q.questionId)) {
        // Reference existing bank question — fetch and snapshot
        const bankQ = await Question.findById(q.questionId);
        if (!bankQ || !bankQ.isActive) {
          return res.status(400).json({ success: false, message: 'Question not found: ' + q.questionId });
        }
        snapshot = snapshotQuestion(bankQ);
        // Increment usageCount
        bankQ.usageCount = (bankQ.usageCount || 0) + 1;
        await bankQ.save();
      } else {
        // Custom question (not from bank)
        if (!q.questionText || !q.questionText.trim()) {
          return res.status(400).json({ success: false, message: 'Custom question missing text.' });
        }
        if (!q.type) {
          return res.status(400).json({ success: false, message: 'Custom question missing type.' });
        }
        snapshot = {
          questionId: null,
          type:          q.type,
          questionText:  q.questionText.trim(),
          options:       Array.isArray(q.options) ? q.options : [],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null,
          explanation:   q.explanation || '',
          marks:         q.marks || 1,
          difficulty:    q.difficulty || 'medium',
          attachments:   Array.isArray(q.attachments) ? q.attachments : [],
          topic:         q.topic || '',
        };
        // If saveCustomToBank flag is true (or per-question flag), also save to question bank
        if (saveCustomToBank || q.saveToBank) {
          try {
            const newBankQ = await Question.create({
              curriculum, subject, grade,
              topic: snapshot.topic,
              type: snapshot.type,
              questionText: snapshot.questionText,
              options: snapshot.options,
              correctAnswer: snapshot.correctAnswer,
              explanation: snapshot.explanation,
              marks: snapshot.marks,
              difficulty: snapshot.difficulty,
              attachments: snapshot.attachments,
              createdBy: req.user._id,
              usageCount: 1,
            });
            snapshot.questionId = newBankQ._id;
          } catch (bankErr) {
            console.error('[homework POST] failed to save custom Q to bank:', bankErr.message);
          }
        }
      }
      snapshots.push(snapshot);
    }

    // If assigned to a room, validate the room exists and is accessible
    if (assignedRoom) {
      if (!isObjectId(assignedRoom)) {
        return res.status(400).json({ success: false, message: 'Invalid room ID.' });
      }
      const room = await GroupRoom.findById(assignedRoom);
      if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found.' });
      }
    }

    // Validate assigned students all exist (if provided)
    if (Array.isArray(assignedStudents) && assignedStudents.length > 0) {
      for (const sid of assignedStudents) {
        if (!isObjectId(sid)) {
          return res.status(400).json({ success: false, message: 'Invalid student ID: ' + sid });
        }
      }
    }

    const hw = await Homework.create({
      title:        title.trim(),
      description:  description || '',
      curriculum, subject, grade,
      questions:    snapshots,
      assignedRoom: assignedRoom || null,
      assignedStudents: Array.isArray(assignedStudents) ? assignedStudents : [],
      releaseAt:    new Date(releaseAt),
      dueAt:        dueAt ? new Date(dueAt) : null,
      createdBy:    req.user._id,
      status:       status || 'draft',
    });

    return res.json({
      success: true,
      message: 'Homework created.',
      homework: hw,
    });
  } catch (e) {
    console.error('[homework POST]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to create homework: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/homework  — teacher lists own homework
// Query: createdBy=me OR createdBy=<id> (admin), status, curriculum, subject
// ─────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.createdBy === 'me') {
      filter.createdBy = req.user._id;
    } else if (req.query.createdBy && isObjectId(req.query.createdBy) && req.user.role === 'admin') {
      filter.createdBy = req.query.createdBy;
    } else if (req.user.role !== 'admin') {
      // Default for teachers: only their own homework
      filter.createdBy = req.user._id;
    }

    if (req.query.status)     filter.status = req.query.status;
    if (req.query.curriculum) filter.curriculum = req.query.curriculum;
    if (req.query.subject)    filter.subject = req.query.subject;
    if (req.query.grade)      filter.grade = req.query.grade;

    const homework = await Homework.find(filter)
      .populate('assignedRoom', 'name subject')
      .populate('assignedStudents', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, homework, total: homework.length });
  } catch (e) {
    console.error('[homework GET]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to load homework.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/homework/student/list  — student sees their homework
// Returns published homework where student is in assignedRoom or assignedStudents.
// `locked: true` if releaseAt > now.
// ─────────────────────────────────────────────────────────
router.get('/student/list', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find rooms this student is in
    const rooms = await GroupRoom.find({ students: userId }).select('_id');
    const roomIds = rooms.map(r => r._id);

    const homework = await Homework.find({
      isActive: true,
      status: 'published',
      $or: [
        { assignedRoom: { $in: roomIds } },
        { assignedStudents: userId },
      ],
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ releaseAt: -1 })
      .lean();

    // Find which ones the student has already submitted
    const myHwIds = homework.map(h => h._id);
    const mySubmissions = await HomeworkSubmission.find({
      homework: { $in: myHwIds },
      student: userId,
    }).select('homework status submittedAt totalAwarded totalPossible').lean();

    const submissionMap = {};
    mySubmissions.forEach(s => { submissionMap[s.homework.toString()] = s; });

    const now = new Date();
    const enriched = homework.map(hw => {
      const releaseAt = new Date(hw.releaseAt);
      const dueAt = hw.dueAt ? new Date(hw.dueAt) : null;
      return {
        ...hw,
        // Don't leak correctAnswers / explanations to students before grading
        questions: (hw.questions || []).map(q => ({
          ...q,
          correctAnswer: undefined,
          explanation: undefined,
        })),
        locked: releaseAt > now,
        overdue: dueAt ? (dueAt < now) : false,
        mySubmission: submissionMap[hw._id.toString()] || null,
      };
    });

    return res.json({ success: true, homework: enriched, total: enriched.length });
  } catch (e) {
    console.error('[homework/student/list]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to load homework.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/homework/:id  — get one (teacher view)
// ─────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid homework ID.' });
    }
    const hw = await Homework.findById(req.params.id)
      .populate('assignedRoom', 'name subject curriculum grade')
      .populate('assignedStudents', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .lean();
    if (!hw || !hw.isActive) {
      return res.status(404).json({ success: false, message: 'Homework not found.' });
    }
    return res.json({ success: true, homework: hw });
  } catch (e) {
    console.error('[homework GET :id]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to load homework.' });
  }
});

// ─────────────────────────────────────────────────────────
// PATCH /api/homework/:id  — update (creator/admin only)
// ─────────────────────────────────────────────────────────
router.patch('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid homework ID.' });
    }
    const hw = await Homework.findById(req.params.id);
    if (!hw || !hw.isActive) {
      return res.status(404).json({ success: false, message: 'Homework not found.' });
    }
    if (hw.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own homework.' });
    }
    const allowed = ['title', 'description', 'curriculum', 'subject', 'grade', 'questions', 'assignedRoom', 'assignedStudents', 'releaseAt', 'dueAt', 'status'];
    for (const k of allowed) {
      if (req.body[k] !== undefined) hw[k] = req.body[k];
    }
    await hw.save();
    return res.json({ success: true, homework: hw });
  } catch (e) {
    console.error('[homework PATCH]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to update homework.' });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/homework/:id  — soft-delete (creator/admin only)
// ─────────────────────────────────────────────────────────
router.delete('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid homework ID.' });
    }
    const hw = await Homework.findById(req.params.id);
    if (!hw || !hw.isActive) {
      return res.status(404).json({ success: false, message: 'Homework not found.' });
    }
    if (hw.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own homework.' });
    }
    hw.isActive = false;
    await hw.save();
    return res.json({ success: true, message: 'Homework deleted.' });
  } catch (e) {
    console.error('[homework DELETE]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to delete homework.' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/homework/:id/start  — student creates an empty submission
// (called when student opens the homework for the first time)
// ─────────────────────────────────────────────────────────
router.post('/:id/start', auth, async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid homework ID.' });
    }
    const hw = await Homework.findById(req.params.id);
    if (!hw || !hw.isActive || hw.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Homework not available.' });
    }
    // Validate student is allowed to access
    const userId = req.user._id;
    let allowed = (hw.assignedStudents || []).some(sid => sid.toString() === userId.toString());
    if (!allowed && hw.assignedRoom) {
      const room = await GroupRoom.findById(hw.assignedRoom);
      if (room && (room.students || []).some(sid => sid.toString() === userId.toString())) {
        allowed = true;
      }
    }
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'This homework is not assigned to you.' });
    }
    // Lock check
    if (new Date(hw.releaseAt) > new Date()) {
      return res.status(403).json({ success: false, message: 'Homework not yet released.' });
    }
    // Find or create submission
    let sub = await HomeworkSubmission.findOne({ homework: hw._id, student: userId });
    if (sub) {
      return res.json({ success: true, submission: sub });
    }
    sub = await HomeworkSubmission.create({
      homework: hw._id,
      student: userId,
      answers: [],
      status: 'in_progress',
      totalPossible: hw.totalMarks || 0,
    });
    return res.json({ success: true, submission: sub });
  } catch (e) {
    console.error('[homework start]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to start homework.' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/homework/:id/submit  — student submits answers
// Body: { answers: [{questionIndex, answer, attachment}] }
// ─────────────────────────────────────────────────────────
router.post('/:id/submit', auth, async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid homework ID.' });
    }
    const hw = await Homework.findById(req.params.id);
    if (!hw || !hw.isActive || hw.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Homework not available.' });
    }
    if (new Date(hw.releaseAt) > new Date()) {
      return res.status(403).json({ success: false, message: 'Homework not yet released.' });
    }
    const userId = req.user._id;

    // Build the answers array — auto-grade MCQ as we go
    const inputAnswers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const answers = [];
    let totalAwarded = 0;

    for (const a of inputAnswers) {
      const idx = a.questionIndex;
      const q = hw.questions[idx];
      if (!q) continue;
      const entry = {
        questionIndex: idx,
        type: q.type,
        answer: a.answer !== undefined ? a.answer : null,
        attachment: a.attachment || undefined,
        marksAwarded: null,
        feedback: '',
        autoGraded: false,
      };
      if (q.type === 'mcq' && a.answer !== null && a.answer !== undefined) {
        const grade = autoGradeMCQ(q, a.answer);
        entry.marksAwarded = grade.awarded;
        entry.autoGraded = grade.autoGraded;
        totalAwarded += (grade.awarded || 0);
      }
      answers.push(entry);
    }

    let sub = await HomeworkSubmission.findOne({ homework: hw._id, student: userId });
    if (!sub) {
      sub = new HomeworkSubmission({
        homework: hw._id,
        student: userId,
      });
    }
    if (sub.status === 'submitted' || sub.status === 'graded' || sub.status === 'released') {
      return res.status(400).json({ success: false, message: 'Already submitted.' });
    }

    sub.answers = answers;
    sub.status = 'submitted';
    sub.submittedAt = new Date();
    sub.totalAwarded = totalAwarded;
    sub.totalPossible = hw.totalMarks || 0;
    if (hw.dueAt && new Date() > new Date(hw.dueAt)) {
      sub.isLate = true;
    }
    // If all questions are MCQ (auto-graded), mark as graded
    const allAuto = answers.every(a => a.type === 'mcq');
    if (allAuto && answers.length > 0) {
      sub.status = 'graded';
      sub.gradedAt = new Date();
    }
    await sub.save();

    return res.json({ success: true, submission: sub, message: 'Submitted.' });
  } catch (e) {
    console.error('[homework submit]', e.message);
    return res.status(500).json({ success: false, message: 'Submit failed: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/homework/:id/my-submission — student's own submission
// ─────────────────────────────────────────────────────────
router.get('/:id/my-submission', auth, async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid homework ID.' });
    }
    const sub = await HomeworkSubmission.findOne({ homework: req.params.id, student: req.user._id });
    return res.json({ success: true, submission: sub || null });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to load submission.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/homework/:id/submissions — teacher views all submissions
// ─────────────────────────────────────────────────────────
router.get('/:id/submissions', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid homework ID.' });
    }
    const hw = await Homework.findById(req.params.id);
    if (!hw || !hw.isActive) {
      return res.status(404).json({ success: false, message: 'Homework not found.' });
    }
    if (hw.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not your homework.' });
    }
    const subs = await HomeworkSubmission.find({ homework: hw._id })
      .populate('student', 'firstName lastName email curriculum gradeLevel')
      .sort({ submittedAt: -1 })
      .lean();
    return res.json({ success: true, submissions: subs, total: subs.length, homework: hw });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to load submissions.' });
  }
});

// ─────────────────────────────────────────────────────────
// PATCH /api/homework/:hwId/submissions/:subId/grade  — teacher grades
// Body: { answers: [{questionIndex, marksAwarded, feedback}], overallFeedback, release }
// ─────────────────────────────────────────────────────────
router.patch('/:hwId/submissions/:subId/grade', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { hwId, subId } = req.params;
    if (!isObjectId(hwId) || !isObjectId(subId)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs.' });
    }
    const hw = await Homework.findById(hwId);
    if (!hw) {
      return res.status(404).json({ success: false, message: 'Homework not found.' });
    }
    if (hw.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not your homework.' });
    }
    const sub = await HomeworkSubmission.findById(subId);
    if (!sub || sub.homework.toString() !== hwId) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }
    const inputGrades = Array.isArray(req.body.answers) ? req.body.answers : [];
    let totalAwarded = 0;
    for (const a of sub.answers) {
      const grade = inputGrades.find(g => g.questionIndex === a.questionIndex);
      if (grade) {
        if (grade.marksAwarded !== undefined && grade.marksAwarded !== null) {
          a.marksAwarded = Math.max(0, Math.min(grade.marksAwarded, hw.questions[a.questionIndex]?.marks || 0));
        }
        if (grade.feedback !== undefined) a.feedback = grade.feedback;
        // Teacher's annotated version of the student's drawing/upload.
        // Only update when the request explicitly sends one — preserves
        // a previous annotation on partial re-saves.
        if (typeof grade.teacherAnnotation === 'string') {
          a.teacherAnnotation = grade.teacherAnnotation;
        }
      }
      totalAwarded += (a.marksAwarded || 0);
    }
    sub.totalAwarded = totalAwarded;
    if (req.body.overallFeedback !== undefined) sub.overallFeedback = req.body.overallFeedback;
    sub.status = 'graded';
    sub.gradedAt = new Date();
    sub.gradedBy = req.user._id;
    if (req.body.release === true) {
      sub.status = 'released';
      sub.releasedAt = new Date();
    }
    await sub.save();
    return res.json({ success: true, submission: sub });
  } catch (e) {
    console.error('[homework grade]', e.message);
    return res.status(500).json({ success: false, message: 'Grading failed: ' + e.message });
  }
});

module.exports = router;
