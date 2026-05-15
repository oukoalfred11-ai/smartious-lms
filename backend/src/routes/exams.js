const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const ExamSubmission = require('../models/ExamSubmission');
const { auth, requireRole } = require('../middleware/auth');

// ── Helpers ────────────────────────────────────────────────

function sumLeafMarks(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return 0;
  let total = 0;
  for (const p of parts) {
    if (Array.isArray(p.parts) && p.parts.length > 0) total += sumLeafMarks(p.parts);
    else total += Number(p.marks) || 0;
  }
  return total;
}

function questionMarks(q) {
  if (Array.isArray(q.parts) && q.parts.length > 0) return sumLeafMarks(q.parts);
  return Number(q.marks) || 0;
}

async function recomputeAggregates(exam) {
  let totalMarks = 0;
  let totalQuestions = 0;

  if (exam.questionIds && exam.questionIds.length) {
    let Question;
    try { Question = require('../models/Question'); } catch { Question = null; }
    if (Question) {
      const bankDocs = await Question.find({ _id: { $in: exam.questionIds } })
        .select('marks parts').lean();
      bankDocs.forEach(q => { totalMarks += questionMarks(q); totalQuestions += 1; });
    } else {
      totalQuestions += exam.questionIds.length;
      totalMarks += exam.questionIds.length;
    }
  }
  if (exam.customQuestions && exam.customQuestions.length) {
    exam.customQuestions.forEach(q => { totalMarks += questionMarks(q); totalQuestions += 1; });
  }

  exam.totalMarks = totalMarks;
  exam.totalQuestions = totalQuestions;
  return exam;
}

function stripCorrectAnswersFromParts(parts) {
  if (!Array.isArray(parts)) return [];
  return parts.map(p => {
    const { correctAnswer, ...rest } = p;
    return { ...rest, parts: stripCorrectAnswersFromParts(p.parts || []) };
  });
}

// Compute status from raw fields. Use after .lean() because the virtual
// on the schema doesn't survive .lean() without the lean-virtuals plugin.
function computeStatus(exam) {
  if (!exam) return null;
  if (exam.status === 'archived') return 'archived';
  const now   = Date.now();
  const start = new Date(exam.startAt).getTime();
  const end   = start + (exam.durationMins || 0) * 60000;
  if (now < start) return 'scheduled';
  if (now <= end)  return 'active';
  return 'ended';
}

// Attach computedStatus to a lean exam doc (or array of them)
function withComputedStatus(examOrArray) {
  if (Array.isArray(examOrArray)) {
    return examOrArray.map(e => ({ ...e, computedStatus: computeStatus(e) }));
  }
  return examOrArray ? { ...examOrArray, computedStatus: computeStatus(examOrArray) } : examOrArray;
}

// ═══════════════════════════════════════════════════════════
// TEACHER ROUTES
// ═══════════════════════════════════════════════════════════

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
      title: title.trim(),
      instructions: (instructions || '').trim(),
      subject: subject.trim(),
      curriculum: curriculum.trim(),
      grade: grade.trim(),
      startAt: startDate,
      durationMins: Number(durationMins),
      teacherId: req.user._id,
      questionIds: validQuestionIds,
      customQuestions: customQuestions || [],
      assignedStudents: validStudentIds,
      groupRoomIds: validGroupIds,
    });

    await recomputeAggregates(exam);
    await exam.save();

    res.status(201).json({ success:true, message:'Exam scheduled.', data: { exam } });
  } catch (e) {
    console.error('[exams POST] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to create exam.' });
  }
});

router.get('/teacher/list', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const exams = await Exam.find({ teacherId: req.user._id })
      .sort({ startAt: -1 }).lean();
    res.json({ success:true, data: { exams: withComputedStatus(exams) } });
  } catch (e) {
    console.error('[exams teacher/list] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to load exams.' });
  }
});

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
      .sort({ submittedAt: -1, startedAt: -1 }).lean();

    res.json({ success:true, data: { exam, submissions } });
  } catch (e) {
    console.error('[exams submissions] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to load submissions.' });
  }
});

// ═══════════════════════════════════════════════════════════
// STUDENT ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/exams/submissions/my — current student's submissions across
// all exams, with parent exam populated so the result module can show
// full context (title, subject, total marks, teacher name, etc).
// Only returns submitted/graded submissions — in-progress attempts are
// hidden from the results module.
router.get('/submissions/my', auth, async (req, res) => {
  try {
    const submissions = await ExamSubmission.find({
      studentId: req.user._id,
      status: { $in: ['submitted', 'graded'] },
    })
      .sort({ submittedAt: -1 })
      .populate({
        path: 'examId',
        select: 'title subject curriculum grade durationMins totalMarks totalQuestions teacherId questionIds customQuestions startAt',
        populate: { path: 'teacherId', select: 'firstName lastName' },
      })
      .lean();

    // Strip submissions whose parent exam was deleted
    const valid = submissions.filter(s => s.examId);

    res.json({ success: true, data: { submissions: valid } });
  } catch (e) {
    console.error('[exams submissions/my] failed:', e.message);
    res.status(500).json({ success: false, message: 'Failed to load your submissions.' });
  }
});

// GET /api/exams/submissions/my/:subId — a single submission with full
// question context (bank questions populated) so the result detail screen
// can render every answer with its question text.
router.get('/submissions/my/:subId', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.subId))
      return res.status(400).json({ success:false, message:'Invalid submission id.' });

    const submission = await ExamSubmission.findOne({
      _id: req.params.subId,
      studentId: req.user._id,
    })
      .populate({
        path: 'examId',
        populate: { path: 'teacherId', select: 'firstName lastName' },
      })
      .lean();

    if (!submission) return res.status(404).json({ success:false, message:'Submission not found.' });

    // Fetch bank questions for the exam so the result screen can display them.
    // We keep correctAnswer here because the result screen is shown to the
    // student AFTER grading — at that point seeing the model answer is helpful.
    let bankQuestions = [];
    try {
      const Question = require('../models/Question');
      bankQuestions = await Question.find({
        _id: { $in: submission.examId?.questionIds || [] },
      }).select('-__v').lean();
    } catch {}

    res.json({
      success: true,
      data: { submission, bankQuestions },
    });
  } catch (e) {
    console.error('[exams submissions/my/:id] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to load submission.' });
  }
});

router.get('/student/list', auth, async (req, res) => {
  try {
    const studentId = req.user._id;
    let groupRoomIds = [];
    try {
      const GroupRoom = require('../models/GroupRoom');
      const rooms = await GroupRoom.find({ students: studentId }).select('_id').lean();
      groupRoomIds = rooms.map(r => r._id);
    } catch {}

    const exams = await Exam.find({
      $or: [
        { assignedStudents: studentId },
        groupRoomIds.length ? { groupRoomIds: { $in: groupRoomIds } } : { _id: null },
      ],
      status: { $ne: 'archived' },
    })
      .sort({ startAt: -1 })
      .populate('teacherId', 'firstName lastName')
      .lean();

    const submissionMap = {};
    if (exams.length) {
      const subs = await ExamSubmission.find({
        examId: { $in: exams.map(e => e._id) }, studentId,
      }).lean();
      subs.forEach(s => { submissionMap[String(s.examId)] = s; });
    }
    const examsWithSub = withComputedStatus(exams).map(e => ({
      ...e, mySubmission: submissionMap[String(e._id)] || null,
    }));

    res.json({ success:true, data: { exams: examsWithSub } });
  } catch (e) {
    console.error('[exams student/list] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to load exams.' });
  }
});

router.get('/:id/take', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid exam id.' });

    const exam = await Exam.findById(req.params.id).lean();
    if (!exam) return res.status(404).json({ success:false, message:'Exam not found.' });

    const studentId = String(req.user._id);
    const assigned = (exam.assignedStudents || []).some(id => String(id) === studentId);
    if (!assigned && req.user.role !== 'admin')
      return res.status(403).json({ success:false, message:'Not assigned to you.' });

    // Compute status from raw fields (virtual doesn't survive .lean())
    const computedStatus = computeStatus(exam);
    if (computedStatus !== 'active')
      return res.status(403).json({ success:false, message:`Exam is ${computedStatus}, not active right now.` });

    let bankQuestions = [];
    try {
      const Question = require('../models/Question');
      const rawBank = await Question.find({ _id: { $in: exam.questionIds || [] } })
        .select('-__v').lean();
      bankQuestions = rawBank.map(q => {
        const { correctAnswer, ...rest } = q;
        return { ...rest, parts: stripCorrectAnswersFromParts(q.parts || []) };
      });
    } catch {}

    const customQuestions = (exam.customQuestions || []).map(q => {
      const { correctAnswer, ...rest } = q;
      return { ...rest, parts: stripCorrectAnswersFromParts(q.parts || []) };
    });

    let submission = await ExamSubmission.findOne({ examId: exam._id, studentId: req.user._id });
    if (!submission) {
      submission = await ExamSubmission.create({
        examId: exam._id, studentId: req.user._id,
        startedAt: new Date(), maxScore: exam.totalMarks,
      });
    }
    if (submission.status === 'submitted' || submission.status === 'graded')
      return res.status(409).json({ success:false, message:'You have already submitted this exam.' });

    res.json({
      success:true,
      data: {
        exam: { ...exam, customQuestions, questionIds: undefined },
        bankQuestions, submission,
      },
    });
  } catch (e) {
    console.error('[exams take] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to load exam.' });
  }
});

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

    const persistedAnswers = (answers || []).map(a => ({
      questionRef: String(a.questionRef || ''),
      partPath: Array.isArray(a.partPath)
        ? a.partPath.map(n => Number.isFinite(Number(n)) ? Number(n) : 0)
        : [],
      answerText: String(a.answerText || ''),
      selectedOption: String(a.selectedOption || ''),
      isCorrect: null,
      marksAwarded: 0,
    })).filter(a => a.questionRef.length > 0);

    submission.answers = persistedAnswers;
    submission.status = 'submitted';
    submission.submittedAt = new Date();
    submission.timeSpentSecs = Number(timeSpentSecs) || 0;
    submission.tabSwitches = Number(tabSwitches) || 0;
    submission.copyPasteAttempts = Number(copyPasteAttempts) || 0;
    submission.totalScore = 0;
    submission.maxScore = exam.totalMarks;
    submission.percentage = 0;

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
        // Teacher's marked-up version of the student's drawing.
        // Only update if the request explicitly sent one; otherwise
        // preserve what was saved before (re-grade-friendly).
        teacherAnnotation: typeof update.teacherAnnotation === 'string'
          ? update.teacherAnnotation
          : (a.teacherAnnotation || ''),
      };
    });

    submission.totalScore = total;
    submission.percentage = submission.maxScore ? Math.round((total / submission.maxScore) * 100) : 0;
    submission.feedback = feedback;
    submission.grade = gradeLetter;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;
    await submission.save();

    res.json({ success:true, message:'Graded.', data: { submission } });
  } catch (e) {
    console.error('[exams grade] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to grade.' });
  }
});

module.exports = router;
