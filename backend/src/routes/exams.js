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
    // Lazy-load Question model only if the bank refs exist
    let Question;
    try { Question = require('../models/Question'); } catch { Question = null; }
    if (Question) {
      const bankDocs = await Question.find({ _id: { $in: exam.questionIds } }).select('marks').lean();
      bankDocs.forEach(q => { totalMarks += (q.marks || 0); totalQuestions += 1; });
    } else {
      // No Question model — just count refs at 1 mark each as a fallback
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

    // Validation
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

    // Validate ObjectId arrays before save
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

// PUT /api/exams/:id — update an exam (teacher who created it, or admin)
router.put('/:id', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid exam id.' });

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success:false, message:'Exam not found.' });

    // Authorisation
    if (req.user.role !== 'admin' && String(exam.teacherId) !== String(req.user._id))
      return res.status(403).json({ success:false, message:'Not your exam.' });

    // Whitelist of editable fields
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

// GET /api/exams/:id/submissions — submissions for an exam (teacher view)
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

    // Find exams either directly assigned OR assigned to a group room the
    // student belongs to. Group room match is best-effort: if there's no
    // GroupRoom model we fall back to direct assignment only.
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

    // Attach the student's own submission status to each exam
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
// Returns questions WITHOUT correctAnswer fields.
router.get('/:id/take', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid exam id.' });

    const exam = await Exam.findById(req.params.id).lean({ virtuals: true });
    if (!exam) return res.status(404).json({ success:false, message:'Exam not found.' });

    // Check student is assigned
    const studentId = String(req.user._id);
    const assigned = (exam.assignedStudents || []).some(id => String(id) === studentId);
    if (!assigned && req.user.role !== 'admin')
      return res.status(403).json({ success:false, message:'Not assigned to you.' });

    // Time check
    if (exam.computedStatus !== 'active')
      return res.status(403).json({ success:false, message:`Exam is ${exam.computedStatus}, not active right now.` });

    // Load bank questions and strip correctAnswer
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

    // Find or create the student's submission (so refresh doesn't reset timer)
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

    // Auto-grade MCQs immediately; leave short/long for teacher marking
    let autoTotal = 0;
    const Question = (() => { try { return require('../models/Question'); } catch { return null; } })();
    const bankMap = {};
    if (Question && exam.questionIds?.length) {
      const bank = await Question.find({ _id: { $in: exam.questionIds } }).lean();
      bank.forEach(q => { bankMap[String(q._id)] = q; });
    }

    const gradedAnswers = answers.map(a => {
      let isCorrect = null, marks = 0;
      const ref = a.questionRef;
      // Bank question
      if (mongoose.isValidObjectId(ref) && bankMap[ref]) {
        const q = bankMap[ref];
        if (q.type === 'mcq' && q.correctAnswer) {
          isCorrect = (a.selectedOption || a.answerText) === q.correctAnswer;
          marks = isCorrect ? (q.marks || 0) : 0;
        }
      }
      // Custom question
      else if (typeof ref === 'string' && ref.startsWith('custom:')) {
        const idx = parseInt(ref.split(':')[1], 10);
        const q = exam.customQuestions?.[idx];
        if (q && q.type === 'mcq' && q.correctAnswer) {
          isCorrect = (a.selectedOption || a.answerText) === q.correctAnswer;
          marks = isCorrect ? (q.marks || 0) : 0;
        }
      }
      autoTotal += marks;
      return {
        questionRef: ref,
        answerText: a.answerText || '',
        selectedOption: a.selectedOption || '',
        isCorrect,
        marksAwarded: marks,
      };
    });

    submission.answers          = gradedAnswers;
    submission.status           = 'submitted';
    submission.submittedAt      = new Date();
    submission.timeSpentSecs    = Number(timeSpentSecs) || 0;
    submission.tabSwitches      = Number(tabSwitches) || 0;
    submission.copyPasteAttempts= Number(copyPasteAttempts) || 0;
    submission.totalScore       = autoTotal;
    submission.maxScore         = exam.totalMarks;
    submission.percentage       = exam.totalMarks ? Math.round((autoTotal / exam.totalMarks) * 100) : 0;
    if (tabSwitches > 3 || copyPasteAttempts > 0) {
      submission.flagged = true;
      submission.flagReason = `Tab switches: ${tabSwitches}, paste attempts: ${copyPasteAttempts}`;
    }
    await submission.save();

    res.json({ success:true, message:'Submitted.', data: { submission } });
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

    // Apply per-answer marks
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
