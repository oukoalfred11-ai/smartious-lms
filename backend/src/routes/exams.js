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

/**
 * Remove EVERY answer-bearing field before a question is sent to a
 * student sitting the paper.
 *
 * It is not enough to drop correctAnswer. markScheme carries the model
 * answer, the award points and the accepted alternatives, and
 * explanation states the answer in prose. Both were previously sent
 * intact, so any student who opened the network tab could read the
 * mark scheme while sitting the exam. Every question in the bank has
 * an explanation, so this affected the entire question bank.
 *
 * Applied recursively, because nested parts carry the same fields.
 */
function stripAnswerFields(node) {
  const { correctAnswer, markScheme, explanation, ...rest } = node || {};
  return { ...rest, parts: stripCorrectAnswersFromParts(node && node.parts) };
}

function stripCorrectAnswersFromParts(parts) {
  if (!Array.isArray(parts)) return [];
  return parts.map(p => stripAnswerFields(p));
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

router.post('/', auth, requireRole('teacher','admin', 'dos'), async (req, res) => {
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


router.get('/all', auth, requireRole('admin', 'dos'), async (req, res) => {
  try {
    const filter = {}
    if (req.query.subject)    filter.subject    = req.query.subject
    if (req.query.curriculum) filter.curriculum = req.query.curriculum
    if (req.query.grade)      filter.grade      = req.query.grade
    if (req.query.status)     filter.status     = req.query.status
    const exams = await Exam.find(filter)
      .sort({ startAt: -1 })
      .limit(200)
      .lean()
    return res.json({ success: true, data: { exams: withComputedStatus(exams), total: exams.length } })
  } catch(e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

router.get('/teacher/list', auth, requireRole('teacher','admin', 'dos'), async (req, res) => {
  try {
    const exams = await Exam.find({ teacherId: req.user._id })
      .sort({ startAt: -1 }).lean();

    // Attach submission counts so the exam list itself shows where work
    // is waiting. Without this a teacher has to open every exam to find
    // out whether anything needs marking, which is how scripts sit
    // unmarked for weeks.
    const ids = exams.map(e => e._id);
    const counts = await ExamSubmission.aggregate([
      { $match: { examId: { $in: ids } } },
      { $group: { _id: { examId: '$examId', status: '$status' }, n: { $sum: 1 } } },
    ]);
    const byExam = {};
    counts.forEach(c => {
      const k = String(c._id.examId);
      byExam[k] = byExam[k] || { inProgress: 0, awaitingMarking: 0, graded: 0, total: 0 };
      if (c._id.status === 'in_progress') byExam[k].inProgress += c.n;
      if (c._id.status === 'submitted')   byExam[k].awaitingMarking += c.n;
      if (c._id.status === 'graded' || c._id.status === 'returned') byExam[k].graded += c.n;
      byExam[k].total += c.n;
    });

    const withCounts = withComputedStatus(exams).map(e => ({
      ...e,
      submissionCounts: byExam[String(e._id)] || { inProgress:0, awaitingMarking:0, graded:0, total:0 },
    }));
    res.json({ success:true, data: { exams: withCounts } });
  } catch (e) {
    console.error('[exams teacher/list] failed:', e.message);
    res.status(500).json({ success:false, message:'Failed to load exams.' });
  }
});

router.put('/:id', auth, requireRole('teacher','admin', 'dos'), async (req, res) => {
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

router.delete('/:id', auth, requireRole('teacher','admin', 'dos'), async (req, res) => {
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

// ═══════════════════════════════════════════════════════════
// GET /api/exams/teacher/marking-queue
// Every script awaiting marking across ALL of this teacher's exams,
// oldest first. The teacher should not have to remember which exam
// has work waiting — the work comes to them.
// ═══════════════════════════════════════════════════════════
router.get('/teacher/marking-queue', auth, requireRole('teacher','admin','dos'), async (req, res) => {
  try {
    const examFilter = req.user.role === 'admin' ? {} : { teacherId: req.user._id };
    const exams = await Exam.find(examFilter).select('title subject curriculum grade totalMarks startAt').lean();
    const byId = new Map(exams.map(e => [String(e._id), e]));

    const subs = await ExamSubmission.find({
      examId: { $in: exams.map(e => e._id) },
      status: 'submitted',
    })
      .populate('studentId', 'firstName lastName email admissionNumber grade')
      .sort({ submittedAt: 1 })            // oldest waiting first
      .lean();

    const queue = subs.map(sub => {
      const exam = byId.get(String(sub.examId)) || {};
      const waitingHrs = sub.submittedAt
        ? Math.round((Date.now() - new Date(sub.submittedAt).getTime()) / 3600000)
        : 0;
      return {
        submissionId: sub._id,
        examId: sub.examId,
        examTitle: exam.title || 'Untitled exam',
        subject: exam.subject || '',
        grade: exam.grade || '',
        totalMarks: exam.totalMarks || sub.maxScore || 0,
        student: sub.studentId
          ? { id: sub.studentId._id,
              name: [sub.studentId.firstName, sub.studentId.lastName].filter(Boolean).join(' '),
              admissionNumber: sub.studentId.admissionNumber || '' }
          : null,
        submittedAt: sub.submittedAt,
        waitingHrs,
        answerCount: (sub.answers || []).length,
        flagged: !!sub.flagged,
        flagReason: sub.flagReason || '',
        lateSubmission: !!sub.lateSubmission,
      };
    });

    return res.json({
      success:true,
      data: {
        total: queue.length,
        oldestWaitingHrs: queue.length ? queue[0].waitingHrs : 0,
        flaggedCount: queue.filter(q => q.flagged).length,
        queue,
      },
    });
  } catch (e) {
    console.error('[exams marking-queue] failed:', e.message);
    return res.status(500).json({ success:false, message:'Failed to load the marking queue.' });
  }
});

router.get('/:id/submissions', auth, requireRole('teacher','admin', 'dos'), async (req, res) => {
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

/**
 * Normalise a client answers[] payload into the persisted shape.
 * Shared by /save and /submit so a draft and a final submission are
 * stored identically and a draft can simply be promoted.
 */
function normaliseAnswers(answers) {
  return (answers || []).map(a => ({
    questionRef: String(a.questionRef || ''),
    partPath: Array.isArray(a.partPath)
      ? a.partPath.map(n => Number.isFinite(Number(n)) ? Number(n) : 0)
      : [],
    answerText: String(a.answerText || ''),
    selectedOption: String(a.selectedOption || ''),
    isCorrect: null,
    marksAwarded: 0,
  })).filter(a => a.questionRef.length > 0);
}

/**
 * Server-side deadline. The client reports timeSpentSecs, but a client
 * can report anything, so the authoritative elapsed time is measured
 * from the submission's own startedAt. A short grace window absorbs
 * slow connections and the final save-then-submit round trip.
 */
const LATE_GRACE_SECS = 120;
function deadlineState(exam, submission) {
  const started = new Date(submission.startedAt || Date.now()).getTime();
  const elapsed = Math.max(0, Math.round((Date.now() - started) / 1000));
  const allowed = (Number(exam.durationMins) || 60) * 60;
  return { elapsed, allowed, late: elapsed > allowed + LATE_GRACE_SECS };
}

// ═══════════════════════════════════════════════════════════
// POST /api/exams/:id/save — autosave an in-progress attempt
//
// Without this a browser crash, a closed tab or a dropped connection
// loses the entire paper: answers lived only in React state and the
// only write was the final submit. Students on intermittent
// connections would lose whole papers. Idempotent — safe to call
// every few seconds.
// ═══════════════════════════════════════════════════════════
router.post('/:id/save', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success:false, message:'Invalid exam id.' });

    const submission = await ExamSubmission.findOne({ examId: req.params.id, studentId: req.user._id });
    if (!submission) return res.status(404).json({ success:false, message:'No active attempt.' });
    if (submission.status === 'submitted' || submission.status === 'graded')
      return res.status(409).json({ success:false, message:'Already submitted.' });

    submission.answers = normaliseAnswers(req.body.answers);
    if (Number.isFinite(Number(req.body.tabSwitches)))
      submission.tabSwitches = Math.max(submission.tabSwitches || 0, Number(req.body.tabSwitches));
    if (Number.isFinite(Number(req.body.copyPasteAttempts)))
      submission.copyPasteAttempts = Math.max(submission.copyPasteAttempts || 0, Number(req.body.copyPasteAttempts));
    submission.lastSavedAt = new Date();
    await submission.save();

    const exam = await Exam.findById(req.params.id).select('durationMins').lean();
    const { elapsed, allowed } = deadlineState(exam || {}, submission);
    return res.json({
      success:true,
      data: { savedAt: submission.lastSavedAt, answersSaved: submission.answers.length,
              secondsRemaining: Math.max(0, allowed - elapsed) },
    });
  } catch (e) {
    console.error('[exams save] failed:', e.message);
    return res.status(500).json({ success:false, message:'Failed to save.' });
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
      // Defence in depth: exclude the answer fields in the projection as
      // well as stripping them below, so a future refactor of the mapper
      // cannot silently reintroduce the leak.
      const rawBank = await Question.find({ _id: { $in: exam.questionIds || [] } })
        .select('-__v -markScheme -explanation -correctAnswer').lean();
      bankQuestions = rawBank.map(q => stripAnswerFields(q));
    } catch {}

    const customQuestions = (exam.customQuestions || []).map(q => stripAnswerFields(q));

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

    const persistedAnswers = normaliseAnswers(answers);

    // Keep whatever was autosaved if the final payload arrives empty
    // (a connection that died mid-submit should not wipe the draft).
    submission.answers = persistedAnswers.length ? persistedAnswers : (submission.answers || []);
    submission.status = 'submitted';
    submission.submittedAt = new Date();

    // Time is measured server-side from startedAt. The client value is
    // kept only for comparison — a client can report anything.
    const dl = deadlineState(exam, submission);
    submission.timeSpentSecs = dl.elapsed;
    submission.clientReportedSecs = Number(timeSpentSecs) || 0;
    submission.lateSubmission = dl.late;

    submission.tabSwitches = Math.max(submission.tabSwitches || 0, Number(tabSwitches) || 0);
    submission.copyPasteAttempts = Math.max(submission.copyPasteAttempts || 0, Number(copyPasteAttempts) || 0);
    submission.totalScore = 0;
    submission.maxScore = exam.totalMarks;
    submission.percentage = 0;

    const flags = [];
    if (submission.tabSwitches > 3)       flags.push(`${submission.tabSwitches} tab switches`);
    if (submission.copyPasteAttempts > 0) flags.push(`${submission.copyPasteAttempts} paste attempts`);
    if (dl.late) flags.push(`submitted ${Math.round((dl.elapsed - dl.allowed) / 60)} min after the time limit`);
    if (flags.length) {
      submission.flagged = true;
      submission.flagReason = flags.join('; ');
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

router.post('/submissions/:subId/grade', auth, requireRole('teacher','admin', 'dos'), async (req, res) => {
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

// ═══════════════════════════════════════════════════════════════════
// PDF PAPER + MARK SCHEME
//   GET /api/exams/:id/paper.pdf   — the question paper
//   GET /api/exams/:id/scheme.pdf  — the mark scheme (staff only)
//
// One standard Smartious house paper, so no teacher has to lay one
// out and no two assessments look different. Bank questions and any
// custom questions are merged in the order the exam stores them.
// ═══════════════════════════════════════════════════════════════════
async function loadExamQuestions(exam) {
  const out = [];
  if (exam.questionIds && exam.questionIds.length) {
    const docs = await Question.find({ _id: { $in: exam.questionIds } }).lean();
    const byId = new Map(docs.map(d => [String(d._id), d]));
    // Preserve the teacher's chosen order rather than Mongo's.
    exam.questionIds.forEach(id => { const d = byId.get(String(id)); if (d) out.push(d); });
  }
  (exam.customQuestions || []).forEach(q => out.push(q));
  return out;
}

router.get('/:id/paper.pdf', auth, async (req, res) => {
  try {
    const { buildExamPaperPdf } = require('../lib/examPaperPdf');
    const exam = await Exam.findById(req.params.id).lean();
    if (!exam) return res.status(404).json({ success:false, message:'Exam not found.' });

    // Students may only download their own paper once it has started.
    if (req.user.role === 'student') {
      const assigned = (exam.assignedStudents || []).map(String).includes(String(req.user._id));
      if (!assigned) return res.status(403).json({ success:false, message:'Not assigned to you.' });
      if (exam.startAt && new Date(exam.startAt) > new Date())
        return res.status(403).json({ success:false, message:'This paper is not available yet.' });
    }

    const questions = await loadExamQuestions(exam);
    if (!questions.length) return res.status(400).json({ success:false, message:'This exam has no questions yet.' });

    const pdf = await buildExamPaperPdf(exam, questions, {
      paperNumber: req.query.paper || 'Paper 1',
      syllabusRef: req.query.ref || '',
    });
    const safe = String(exam.title || 'paper').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="smartious-${safe}.pdf"`);
    return res.end(pdf);
  } catch (e) {
    console.error('[exam paper pdf]', e.message);
    return res.status(500).json({ success:false, message:'Failed to generate the paper.' });
  }
});

router.get('/:id/scheme.pdf', auth, requireRole('teacher','admin','dos','ops_manager'), async (req, res) => {
  try {
    const { buildMarkSchemePdf } = require('../lib/examPaperPdf');
    const exam = await Exam.findById(req.params.id).lean();
    if (!exam) return res.status(404).json({ success:false, message:'Exam not found.' });
    const questions = await loadExamQuestions(exam);
    if (!questions.length) return res.status(400).json({ success:false, message:'This exam has no questions yet.' });
    const pdf = await buildMarkSchemePdf(exam, questions, { paperNumber: req.query.paper || 'Paper 1' });
    const safe = String(exam.title || 'paper').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="smartious-${safe}-mark-scheme.pdf"`);
    return res.end(pdf);
  } catch (e) {
    console.error('[exam scheme pdf]', e.message);
    return res.status(500).json({ success:false, message:'Failed to generate the mark scheme.' });
  }
});

module.exports = router;
