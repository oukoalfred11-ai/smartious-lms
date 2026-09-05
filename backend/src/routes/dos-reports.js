/**
 * dos-reports.js — the DOS performance engine.
 *
 * Design principles, drawn from what accreditation bodies and serious
 * school systems actually require of academic reporting:
 *   1. FACTUAL DENOMINATORS. Attendance is "attended X of Y scheduled
 *      classes", computed from real class sessions and real joins, never
 *      a percentage of only-the-days-that-have-records. A student who
 *      missed 5 of 20 scheduled classes shows 75%, not 100%.
 *   2. EVERY NUMBER TRACEABLE. Each metric names its source and window,
 *      so the DOS can defend it in front of the CEO or a visitor.
 *   3. ACCOUNTABILITY CHAIN. School -> grade -> teacher -> student, so
 *      "where are we failing" has an answer at every level.
 *
 *   GET /api/dos-reports/school?from&to     whole-school + grades + subjects
 *   GET /api/dos-reports/teachers?from&to   teacher accountability league
 *   GET /api/dos-reports/grade/:grade?from&to  per-student rows for a grade
 *
 * Academic sessions = ended live classes of kind 'lesson' (clubs and
 * events are engagement, not the academic register).
 */
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

const User = require('../models/User');
const LiveClass = require('../models/LiveClass');
const ClassroomSession = require('../models/ClassroomSession');
const ExamSubmission = require('../models/ExamSubmission');
const HomeworkSubmission = require('../models/HomeworkSubmission');
const QuizSession = require('../models/QuizSession');
const TeacherRating = require('../models/TeacherRating');

const STAFF = ['admin', 'ops_manager', 'dos'];
const r1 = (x) => (x === null || x === undefined ? null : Math.round(x * 10) / 10);
const pct = (n, d) => (d > 0 ? Math.round((n / d) * 1000) / 10 : null);

function range(req) {
  const to = req.query.to ? new Date(req.query.to + 'T23:59:59') : new Date();
  const from = req.query.from ? new Date(req.query.from + 'T00:00:00') : new Date(to.getTime() - 90 * 24 * 3600 * 1000);
  return { from, to };
}

/** Core: scheduled vs attended per student, plus per-class join stats. */
async function sessionFacts(from, to) {
  const classes = await LiveClass.find({
    status: 'ended',
    kind: { $in: ['lesson', null] },
    scheduledAt: { $gte: from, $lte: to },
  }).select('subject grade teacherId assignedStudents scheduledAt').limit(1500).lean();
  const ids = classes.map(c => c._id);
  const sessions = ids.length ? await ClassroomSession.find({ liveClassId: { $in: ids } })
    .select('liveClassId userId present joinCount').lean() : [];
  const attendedSet = new Set(); // `${classId}|${userId}` where counted present
  sessions.forEach(s => {
    const joinedOrMarked = (s.joinCount || 0) > 0 || s.present === true;
    if (joinedOrMarked && s.present !== false) attendedSet.add(String(s.liveClassId) + '|' + String(s.userId));
  });
  const perStudent = {}; // userId -> { scheduled, attended }
  const perClass = {};   // classId -> { assigned, attended }
  classes.forEach(c => {
    const cid = String(c._id);
    perClass[cid] = { assigned: (c.assignedStudents || []).length, attended: 0 };
    (c.assignedStudents || []).forEach(u => {
      const uid = String(u);
      perStudent[uid] = perStudent[uid] || { scheduled: 0, attended: 0 };
      perStudent[uid].scheduled += 1;
      if (attendedSet.has(cid + '|' + uid)) { perStudent[uid].attended += 1; perClass[cid].attended += 1; }
    });
  });
  return { classes, perStudent, perClass };
}

// ── Whole school ─────────────────────────────────────────────────────
router.get('/school', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const { from, to } = range(req);
    const [facts, students, examAgg, quizAgg, hwAgg] = await Promise.all([
      sessionFacts(from, to),
      User.find({ role: 'student', isActive: { $ne: false } }).select('gradeLevel').lean(),
      ExamSubmission.aggregate([
        { $match: { status: { $in: ['graded', 'released'] }, gradedAt: { $gte: from, $lte: to } } },
        { $lookup: { from: 'exams', localField: 'examId', foreignField: '_id', as: 'exam' } },
        { $unwind: '$exam' },
        { $group: { _id: { grade: '$exam.grade', subject: '$exam.subject' }, avg: { $avg: '$percentage' }, n: { $sum: 1 } } },
      ]),
      QuizSession.aggregate([
        { $match: { completedAt: { $gte: from, $lte: to } } },
        { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'u' } },
        { $unwind: '$u' },
        { $group: { _id: '$u.gradeLevel', ok: { $sum: '$correctCount' }, n: { $sum: { $size: '$answers' } } } },
      ]),
      HomeworkSubmission.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        { $lookup: { from: 'users', localField: 'student', foreignField: '_id', as: 'u' } },
        { $unwind: '$u' },
        { $group: { _id: '$u.gradeLevel', n: { $sum: 1 } } },
      ]),
    ]);

    const gradeCount = {};
    students.forEach(s => { const g = s.gradeLevel || 'Unassigned'; gradeCount[g] = (gradeCount[g] || 0) + 1; });

    // Attendance rolled up by grade needs student -> grade
    const studentGrade = {};
    (await User.find({ _id: { $in: Object.keys(facts.perStudent) } }).select('gradeLevel').lean())
      .forEach(u => { studentGrade[String(u._id)] = u.gradeLevel || 'Unassigned'; });
    const gradeAtt = {};
    Object.entries(facts.perStudent).forEach(([uid, v]) => {
      const g = studentGrade[uid] || 'Unassigned';
      gradeAtt[g] = gradeAtt[g] || { scheduled: 0, attended: 0 };
      gradeAtt[g].scheduled += v.scheduled; gradeAtt[g].attended += v.attended;
    });

    const gradeExam = {};
    examAgg.forEach(r => {
      const g = r._id.grade || 'Unassigned';
      gradeExam[g] = gradeExam[g] || { sum: 0, n: 0 };
      gradeExam[g].sum += r.avg * r.n; gradeExam[g].n += r.n;
    });
    const quizByGrade = Object.fromEntries(quizAgg.map(r => [r._id || 'Unassigned', pct(r.ok, r.n)]));
    const hwByGrade = Object.fromEntries(hwAgg.map(r => [r._id || 'Unassigned', r.n]));

    const grades = Object.keys(gradeCount).sort().map(g => ({
      grade: g,
      students: gradeCount[g],
      attendancePct: gradeAtt[g] ? pct(gradeAtt[g].attended, gradeAtt[g].scheduled) : null,
      attended: gradeAtt[g]?.attended || 0,
      scheduled: gradeAtt[g]?.scheduled || 0,
      examAvg: gradeExam[g] ? r1(gradeExam[g].sum / gradeExam[g].n) : null,
      examN: gradeExam[g]?.n || 0,
      quizAcc: quizByGrade[g] ?? null,
      hwSubmissions: hwByGrade[g] || 0,
    }));

    const subjMap = {};
    examAgg.forEach(r => {
      const s = r._id.subject || 'Unknown';
      subjMap[s] = subjMap[s] || { sum: 0, n: 0 };
      subjMap[s].sum += r.avg * r.n; subjMap[s].n += r.n;
    });
    const sessBySubj = {};
    facts.classes.forEach(c => { sessBySubj[c.subject] = (sessBySubj[c.subject] || 0) + 1; });
    const subjects = Object.keys({ ...subjMap, ...sessBySubj }).sort().map(s => ({
      subject: s,
      examAvg: subjMap[s] ? r1(subjMap[s].sum / subjMap[s].n) : null,
      examN: subjMap[s]?.n || 0,
      sessionsHeld: sessBySubj[s] || 0,
    }));

    const totSched = Object.values(facts.perStudent).reduce((t, v) => t + v.scheduled, 0);
    const totAtt = Object.values(facts.perStudent).reduce((t, v) => t + v.attended, 0);
    const totExam = examAgg.reduce((t, r) => t + r.avg * r.n, 0);
    const totExamN = examAgg.reduce((t, r) => t + r.n, 0);

    res.json({ success: true, data: {
      window: { from, to },
      kpis: {
        students: students.length,
        sessionsHeld: facts.classes.length,
        attendancePct: pct(totAtt, totSched),
        attended: totAtt, scheduled: totSched,
        examAvg: totExamN ? r1(totExam / totExamN) : null,
        examsGraded: totExamN,
      },
      grades, subjects,
      method: 'Attendance = attended / scheduled across ended lesson classes the student was assigned to. Exam average weighted by submissions graded in the window. Sources: live class registers, exam submissions, quiz answers, homework submissions.',
    } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Teacher accountability league ────────────────────────────────────
router.get('/teachers', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const { from, to } = range(req);
    const facts = await sessionFacts(from, to);
    const perTeacher = {}; // id -> { sessions, assigned, attended }
    facts.classes.forEach(c => {
      const tid = String(c.teacherId);
      perTeacher[tid] = perTeacher[tid] || { sessions: 0, assigned: 0, attended: 0 };
      perTeacher[tid].sessions += 1;
      const pc = facts.perClass[String(c._id)];
      perTeacher[tid].assigned += pc.assigned; perTeacher[tid].attended += pc.attended;
    });

    const [examAgg, ratingAgg, teachers] = await Promise.all([
      ExamSubmission.aggregate([
        { $match: { status: { $in: ['graded', 'released'] }, gradedAt: { $gte: from, $lte: to } } },
        { $lookup: { from: 'exams', localField: 'examId', foreignField: '_id', as: 'exam' } },
        { $unwind: '$exam' },
        { $project: { t: '$exam.teacherId', percentage: 1,
          turnaroundDays: { $cond: [{ $and: ['$submittedAt', '$gradedAt'] }, { $divide: [{ $subtract: ['$gradedAt', '$submittedAt'] }, 86400000] }, null] } } },
        { $group: { _id: '$t', avg: { $avg: '$percentage' }, n: { $sum: 1 }, turnaround: { $avg: '$turnaroundDays' } } },
      ]),
      TeacherRating.aggregate([{ $group: { _id: '$teacherId', avg: { $avg: '$score' }, n: { $sum: 1 } } }]),
      User.find({ role: 'teacher', isActive: { $ne: false } }).select('firstName lastName').lean(),
    ]);
    const exams = Object.fromEntries(examAgg.map(r => [String(r._id), r]));
    const ratings = Object.fromEntries(ratingAgg.map(r => [String(r._id), r]));

    const rows = teachers.map(t => {
      const tid = String(t._id);
      const s = perTeacher[tid]; const e = exams[tid]; const r = ratings[tid];
      return {
        _id: t._id,
        name: [t.firstName, t.lastName].filter(Boolean).join(' '),
        sessionsHeld: s?.sessions || 0,
        classAttendancePct: s ? pct(s.attended, s.assigned) : null,
        examAvg: e ? r1(e.avg) : null, examN: e?.n || 0,
        markingDays: e && e.turnaround !== null ? r1(e.turnaround) : null,
        rating: r ? r1(r.avg) : null, ratingN: r?.n || 0,
      };
    }).sort((a, b) => (b.examAvg ?? -1) - (a.examAvg ?? -1));

    res.json({ success: true, data: { window: { from, to }, rows,
      method: 'Sessions and class attendance from the teacher\'s own ended lesson classes. Exam average and marking turnaround from exams the teacher set, graded in the window. Rating from all-time student and parent ratings.' } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── One grade, per student ───────────────────────────────────────────
router.get('/grade/:grade', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const { from, to } = range(req);
    const [facts, students, examAgg, quizAgg] = await Promise.all([
      sessionFacts(from, to),
      User.find({ role: 'student', isActive: { $ne: false }, gradeLevel: req.params.grade })
        .select('firstName lastName gradeLevel').lean(),
      ExamSubmission.aggregate([
        { $match: { status: { $in: ['graded', 'released'] }, gradedAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$studentId', avg: { $avg: '$percentage' }, n: { $sum: 1 } } },
      ]),
      QuizSession.aggregate([
        { $match: { completedAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$studentId', ok: { $sum: '$correctCount' }, n: { $sum: { $size: '$answers' } } } },
      ]),
    ]);
    const exams = Object.fromEntries(examAgg.map(r => [String(r._id), r]));
    const quiz = Object.fromEntries(quizAgg.map(r => [String(r._id), r]));
    const rows = students.map(st => {
      const sid = String(st._id);
      const att = facts.perStudent[sid];
      return {
        _id: st._id,
        name: [st.firstName, st.lastName].filter(Boolean).join(' '),
        attended: att?.attended || 0, scheduled: att?.scheduled || 0,
        attendancePct: att ? pct(att.attended, att.scheduled) : null,
        examAvg: exams[sid] ? r1(exams[sid].avg) : null, examN: exams[sid]?.n || 0,
        quizAcc: quiz[sid] ? pct(quiz[sid].ok, quiz[sid].n) : null,
      };
    }).sort((a, b) => (a.name > b.name ? 1 : -1));
    res.json({ success: true, data: { window: { from, to }, grade: req.params.grade, rows } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Question bank analysis ───────────────────────────────────────────
// The DOS's tool for pushing teachers to build the bank: weekly output
// per teacher, artwork debt, marking-scheme debt, and thin subjects.
const Question = require('../models/Question');

router.get('/question-bank', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const weeks = 8;
    const since = new Date(Date.now() - weeks * 7 * 24 * 3600 * 1000);
    since.setHours(0, 0, 0, 0);

    const [weekly, pendingArt, missingScheme, subjectCounts, teachers] = await Promise.all([
      Question.aggregate([
        { $match: { isActive: { $ne: false }, createdAt: { $gte: since } } },
        { $group: {
          _id: { teacher: '$createdBy', week: { $isoWeek: '$createdAt' }, year: { $isoWeekYear: '$createdAt' } },
          n: { $sum: 1 },
        } },
      ]),
      Question.aggregate([
        { $match: { isActive: { $ne: false }, 'artwork.required': true, 'artwork.status': 'pending' } },
        { $group: { _id: '$subject', n: { $sum: 1 } } }, { $sort: { n: -1 } },
      ]),
      Question.aggregate([
        { $match: { isActive: { $ne: false }, type: { $ne: 'mcq' },
          $and: [
            { $or: [{ 'markScheme.modelAnswer': '' }, { 'markScheme.modelAnswer': null }] },
            { $or: [{ 'markScheme.points': { $size: 0 } }, { 'markScheme.points': null }] },
          ] } },
        { $group: { _id: '$subject', n: { $sum: 1 } } }, { $sort: { n: -1 } },
      ]),
      Question.aggregate([
        { $match: { isActive: { $ne: false } } },
        { $group: { _id: '$subject', n: { $sum: 1 } } }, { $sort: { n: 1 } },
      ]),
      User.find({ role: 'teacher', isActive: { $ne: false } }).select('firstName lastName').lean(),
    ]);

    // Reshape weekly into per-teacher series.
    const perTeacher = {};
    weekly.forEach(w => {
      const tid = String(w._id.teacher || 'unknown');
      perTeacher[tid] = perTeacher[tid] || {};
      perTeacher[tid][`${w._id.year}-${String(w._id.week).padStart(2, '0')}`] = w.n;
    });
    // Ordered list of the last `weeks` ISO week keys via aggregation keys seen + fill
    const allKeys = [...new Set(weekly.map(w => `${w._id.year}-${String(w._id.week).padStart(2, '0')}`))].sort();
    const rows = teachers.map(t => {
      const tid = String(t._id);
      const series = allKeys.map(k => perTeacher[tid]?.[k] || 0);
      const total = series.reduce((a, b) => a + b, 0);
      const thisWeek = series.length ? series[series.length - 1] : 0;
      const avg = series.length ? Math.round((total / Math.max(series.length, 1)) * 10) / 10 : 0;
      return { _id: t._id, name: [t.firstName, t.lastName].filter(Boolean).join(' '), thisWeek, weeklyAvg: avg, total8w: total };
    }).sort((a, b) => b.total8w - a.total8w);

    res.json({ success: true, data: {
      weeks, weekKeys: allKeys,
      teachers: rows,
      pendingArtwork: pendingArt.map(r => ({ subject: r._id || 'Unknown', n: r.n })),
      pendingArtworkTotal: pendingArt.reduce((t, r) => t + r.n, 0),
      missingScheme: missingScheme.map(r => ({ subject: r._id || 'Unknown', n: r.n })),
      missingSchemeTotal: missingScheme.reduce((t, r) => t + r.n, 0),
      subjectCounts: subjectCounts.map(r => ({ subject: r._id || 'Unknown', n: r.n })),
      method: 'Weekly counts by ISO week from active questions created in the last 8 weeks, attributed to the creating teacher. Artwork debt: active questions with artwork required and status pending. Marking-scheme debt: active non-MCQ questions with no model answer and no marking points. Subject depth: active questions per subject, thinnest first.',
    } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
