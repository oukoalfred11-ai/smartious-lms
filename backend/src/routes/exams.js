const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const ExamSubmission = require('../models/ExamSubmission');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// Helper: recompute totalMarks + totalQuestions from a populated exam doc
// when the teacher creates or updates an exam.
async function recomputeAggregates(exam) {
  let totalMarks = 0;
  let totalQuestions = 0;

  if (exam.questionIds && exam.questionIds.length) {
    let Question;
    try { Question = require('../models/Question'); } catch { Question = null; }
    if (Question) {
      const bankDocs = await Question.find({ _id: { $in: exam.questionIds } }).select('marks').lean();
      bankDocs.forEach(q => { totalMarks += (q.marks || 0); totalQuestions += 1; });
    } else {
      totalQuestions += exam.questionIds.length;
      totalMarks += exam.questionIds.length;
    }
  }
  if (exam.customQuestions && exam.customQuestions.length) {
    exam.customQuestions.forEach(q => { totalMarks += (q.marks || 0); totalQuestions += 1; });
  }

  exam.totalMarks = totalMarks;
  exam.totalQuestions = totalQuestions;
  return exam;
}

// ═══════════════════════════════════════════════════════════
// TEACHER ROUTES
// ═══════════════════════════════════════════════════════════

// POST /api/exams — create a new exam (teacher only)
router.post('/', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const {
      title, instructions, subject, curriculum, grade,
      startAt, durationMins,
      questionIds = [], customQuestions = [],
      assignedStudents = [], groupRoomIds = [],
    } = req.body;

    if (!title?.trim())      return res.status(400).json({ success:false, message:'Title is required.' });
    if (!subject?.trim())    return res.status(400).json({ success:false, message:'Subject is required.' });
    if (!curriculum?.trim()) return res.status(400).json({ success:false, message:'Curriculum is required.' });
    if (!grade?.trim())      return res.status(400).json({ success:false, message:'Grade is required.' });
    if (!startAt)            return res.status(400).json({ success:false, message:'Start time is required.' });
    if (!durationMins || durationMins < 5) return res.status(400).json({ success:false, message:'Duration must be at least 5 minutes.' });

    const totalQs = (questionIds?.length || 0) + (customQuestions?.length || 0);
    if (totalQs === 0) return res.status(400).json({ success:false, message:'At least one question is required.' });

    const startDate = new Date(startAt);
    if (isNaN(startDate.getTime())) return res.status(400).json({ success:false, message:'Invalid start time.' });

    const validQuestionIds = (questionIds || []).filter(id => mongoose.isValidObjectId(id));
    const validStudentIds  = (assignedStudents || []).filter(id => mongoose.isValidObjectId(id));
    const validGroupIds    = (groupRoomIds || []).filter(id => mongoose.isValidObjectId(id));

    const exam = new Exam({
      title:           title.trim(),
      instructions:    (instructions || '').trim(),
      subject:         subject.trim(),
      curriculum:      curriculum.trim(),
      grade:           grade.trim(),
      startAt:         startDate,
      durationMins:    Number(durationMins),
      teacherId:       req.user._id,
      questionIds:     validQuestionIds,
      customQuestions: customQuestions || [],
      assignedStudents:validStudentIds,
      groupRoomIds:    validGroupIds,
    });

    await recomputeAggregates(exam);
    await exam.save();

    res.status(201).json({ success:true, message:'Exam scheduled.', data: { exam } });
  } catch (e) {
    console.error('[exams POST] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to create exam.' });
  }
});

// GET /api/exams/teacher/list — exams created by the current teacher
router.get('/teacher/list', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const exams = await Exam.find({ teacherId: req.user._id })
      .sort({ startAt: -1 })
      .lean({ virtuals: true });
    res.json({ success:true, data: { exams } });
  } catch (e) {
    console.error('[exams teacher/list] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to load exams.' });
  }
});

// PUT /api/exams/:id — update an exam
router.put('/:id', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid exam id.' });

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success:false, message:'Exam not found.' });

    if (req.user.role !== 'admin' && String(exam.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your exam.' });

    const editable = ['title','instructions','subject','curriculum','grade','startAt','durationMins',
                      'questionIds','customQuestions','assignedStudents','groupRoomIds','status'];
    editable.forEach(k => { if (k in req.body) exam[k] = req.body[k]; });

    await recomputeAggregates(exam);
    await exam.save();

    res.json({ success:true, message:'Exam updated.', data: { exam } });
  } catch (e) {
    console.error('[exams PUT] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to update exam.' });
  }
});

// DELETE /api/exams/:id — only if no submissions exist
router.delete('/:id', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid exam id.' });

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success:false, message:'Exam not found.' });

    if (req.user.role !== 'admin' && String(exam.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your exam.' });

    const subCount = await ExamSubmission.countDocuments({ examId: exam._id });
    if (subCount > 0)
      return res.status(409).json({ success:false, message:`Cannot delete — ${subCount} student(s) have already started this exam. Archive it instead.` });

    await exam.deleteOne();
    res.json({ success:true, message:'Exam deleted.' });
  } catch (e) {
    console.error('[exams DELETE] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to delete exam.' });
  }
});

// GET /api/exams/:id/submissions — teacher view of student submissions for an exam
router.get('/:id/submissions', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid exam id.' });

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success:false, message:'Exam not found.' });

    if (req.user.role !== 'admin' && String(exam.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your exam.' });

    const submissions = await ExamSubmission.find({ examId: exam._id })
      .populate('studentId', 'firstName lastName email admissionNumber grade')
      .sort({ submittedAt: -1, startedAt: -1 })
      .lean();

    res.json({ success:true, data: { exam, submissions } });
  } catch (e) {
    console.error('[exams submissions] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to load submissions.' });
  }
});

// ═══════════════════════════════════════════════════════════
// STUDENT ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/exams/student/list — exams assigned to current student
router.get('/student/list', auth, async (req, res) => {
  try {
    const studentId = req.user._id;

    let groupRoomIds = [];
    try {
      const GroupRoom = require('../models/GroupRoom');
      const rooms = await GroupRoom.find({ students: studentId }).select('_id').lean();
      groupRoomIds = rooms.map(r => r._id);
    } catch { /* no GroupRoom model — skip */ }

    const exams = await Exam.find({
      $or: [
        { assignedStudents: studentId },
        groupRoomIds.length ? { groupRoomIds: { $in: groupRoomIds } } : { _id: null },
      ],
      status: { $ne: 'archived' },
    })
      .sort({ startAt: -1 })
      .populate('teacherId', 'firstName lastName')
      .lean({ virtuals: true });

    const submissionMap = {};
    if (exams.length) {
      const subs = await ExamSubmission.find({
        examId: { $in: exams.map(e => e._id) },
        studentId,
      }).lean();
      subs.forEach(s => { submissionMap[String(s.examId)] = s; });
    }
    const examsWithSub = exams.map(e => ({
      ...e,
      mySubmission: submissionMap[String(e._id)] || null,
    }));

    res.json({ success:true, data: { exams: examsWithSub } });
  } catch (e) {
    console.error('[exams student/list] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to load exams.' });
  }
});

// GET /api/exams/:id/take — load an exam to sit it (student)
router.get('/:id/take', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid exam id.' });

    const exam = await Exam.findById(req.params.id).lean({ virtuals: true });
    if (!exam) return res.status(404).json({ success:false, message:'Exam not found.' });

    const studentId = String(req.user._id);
    const assigned = (exam.assignedStudents || []).some(id => String(id) === studentId);
    if (!assigned && req.user.role !== 'admin')
      return res.status(403).json({ success:false, message:'Not assigned to you.' });

    if (exam.computedStatus !== 'active')
      return res.status(403).json({ success:false, message:`Exam is ${exam.computedStatus}, not active right now.` });

    // Load bank questions — DO NOT strip correctAnswer here, since auto-grading
    // is now disabled and the server never compares the student's answer to it.
    // But still strip it from the response sent to the student, just in case
    // (defence in depth — never trust the front-end with the answer).
    let bankQuestions = [];
    try {
      const Question = require('../models/Question');
      bankQuestions = await Question.find({ _id: { $in: exam.questionIds || [] } })
        .select('-correctAnswer -__v')
        .lean();
    } catch { /* no Question model */ }

    // Strip correctAnswer from custom questions too
    const customQuestions = (exam.customQuestions || []).map(q => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    let submission = await ExamSubmission.findOne({ examId: exam._id, studentId: req.user._id });
    if (!submission) {
      submission = await ExamSubmission.create({
        examId: exam._id,
        studentId: req.user._id,
        startedAt: new Date(),
        maxScore: exam.totalMarks,
      });
    }
    if (submission.status === 'submitted' || submission.status === 'graded')
      return res.status(409).json({ success:false, message:'You have already submitted this exam.' });

    res.json({
      success:true,
      data: {
        exam: { ...exam, customQuestions, questionIds: undefined },
        bankQuestions,
        submission,
      },
    });
  } catch (e) {
    console.error('[exams take] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to load exam.' });
  }
});

// POST /api/exams/:id/submit — submit answers (student)
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  POLICY: NO AUTO-GRADING. Every submission — MCQs, short
//  answers, long answers — waits for teacher manual review.
//  This route only persists the student's answers and marks
//  the submission as 'submitted'. The teacher grades via
//  POST /submissions/:subId/grade.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/:id/submit', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid exam id.' });

    const { answers = [], timeSpentSecs = 0, tabSwitches = 0, copyPasteAttempts = 0 } = req.body;

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success:false, message:'Exam not found.' });

    const submission = await ExamSubmission.findOne({ examId: exam._id, studentId: req.user._id });
    if (!submission) return res.status(404).json({ success:false, message:'No active attempt. Open the exam first.' });
    if (submission.status === 'submitted' || submission.status === 'graded')
      return res.status(409).json({ success:false, message:'Already submitted.' });

    // Persist answers verbatim. isCorrect=null, marksAwarded=0 across the board
    // until the teacher reviews. The student sees "Awaiting teacher review" on
    // their result screen until that happens.
    const persistedAnswers = answers.map(a => ({
      questionRef:    a.questionRef,
      answerText:     a.answerText || '',
      selectedOption: a.selectedOption || '',
      isCorrect:      null,
      marksAwarded:   0,
    }));

    submission.answers           = persistedAnswers;
    submission.status            = 'submitted';
    submission.submittedAt       = new Date();
    submission.timeSpentSecs     = Number(timeSpentSecs) || 0;
    submission.tabSwitches       = Number(tabSwitches) || 0;
    submission.copyPasteAttempts = Number(copyPasteAttempts) || 0;
    submission.totalScore        = 0;  // pending teacher
    submission.maxScore          = exam.totalMarks;
    submission.percentage        = 0;  // pending teacher

    if (tabSwitches > 3 || copyPasteAttempts > 0) {
      submission.flagged = true;
      submission.flagReason = `Tab switches: ${tabSwitches}, paste attempts: ${copyPasteAttempts}`;
    }
    await submission.save();

    res.json({
      success:true,
      message:'Submitted successfully. Your teacher will review and grade your answers.',
      data: { submission },
    });
  } catch (e) {
    console.error('[exams submit] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to submit.' });
  }
});

// POST /api/exams/submissions/:subId/grade — teacher grades a submission
router.post('/submissions/:subId/grade', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.subId))
      return res.status(400).json({ success:false, message:'Invalid submission id.' });

    const { answers = [], feedback = '', grade: gradeLetter = '' } = req.body;
    const submission = await ExamSubmission.findById(req.params.subId).populate('examId');
    if (!submission) return res.status(404).json({ success:false, message:'Submission not found.' });

    if (req.user.role !== 'admin' && String(submission.examId.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your exam.' });

    let total = 0;
    submission.answers = submission.answers.map((a, i) => {
      const update = answers[i] || {};
      const marks = typeof update.marksAwarded === 'number' ? update.marksAwarded : a.marksAwarded;
      total += marks;
      return {
        ...a.toObject(),
        marksAwarded: marks,
        teacherComment: update.teacherComment ?? a.teacherComment,
        isCorrect: typeof update.isCorrect === 'boolean' ? update.isCorrect : a.isCorrect,
      };
    });

    submission.totalScore = total;
    submission.percentage = submission.maxScore ? Math.round((total / submission.maxScore) * 100) : 0;
    submission.feedback   = feedback;
    submission.grade      = gradeLetter;
    submission.status     = 'graded';
    submission.gradedAt   = new Date();
    submission.gradedBy   = req.user._id;
    await submission.save();

    res.json({ success:true, message:'Graded.', data: { submission } });
  } catch (e) {
    console.error('[exams grade] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to grade.' });
  }
});

module.exports = router;
