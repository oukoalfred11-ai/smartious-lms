/**
 * mastery.js — Mastery analytics and early-warning indicators (EWI).
 *
 * Turns the assessment data the school already collects (exam submissions,
 * homework grading, quiz answers, syllabus progress, attendance) into
 * per-student mastery evidence:
 *   GET /api/mastery/overview        cohort table with risk flags
 *   GET /api/mastery/student/:id     per-subject and per-topic drill-down
 *
 * Every flag uses a transparent, stated threshold so staff can defend the
 * numbers to parents and to accreditation visitors. Nothing here is a
 * black box: each flag names its rule.
 */
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

const User = require('../models/User');
const ExamSubmission = require('../models/ExamSubmission');
const HomeworkSubmission = require('../models/HomeworkSubmission');
const QuizSession = require('../models/QuizSession');
const Attendance = require('../models/Attendance');

const STAFF = ['admin', 'ops_manager', 'dos', 'teacher'];
const days = (n) => new Date(Date.now() - n * 24 * 3600 * 1000);
const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : null);

/* Transparent flag rules. Shown to staff verbatim. */
const RULES = {
  ATTEND: 'Attendance below 70% over the last 30 days (6+ records)',
  EXAM: 'Exam average below 50% over the last 90 days (2+ exams)',
  QUIZ_DECLINE: 'Quiz accuracy fell 15+ points (last 20 answers vs previous 20)',
  HW_SILENT: 'No homework submitted in 21+ days (has submitted before)',
  INACTIVE: 'No activity of any kind for 14+ days',
};

async function cohortMetrics(studentIds) {
  const ids = studentIds.map((x) => new mongoose.Types.ObjectId(String(x)));
  const [exams, hw, quiz, att] = await Promise.all([
    ExamSubmission.aggregate([
      { $match: { studentId: { $in: ids }, status: { $in: ['graded', 'released'] }, gradedAt: { $gte: days(90) } } },
      { $group: { _id: '$studentId', avg: { $avg: '$percentage' }, n: { $sum: 1 }, last: { $max: '$gradedAt' } } },
    ]),
    HomeworkSubmission.aggregate([
      { $match: { student: { $in: ids } } },
      { $group: { _id: '$student', n: { $sum: 1 }, last: { $max: '$createdAt' } } },
    ]),
    QuizSession.aggregate([
      { $match: { studentId: { $in: ids }, completedAt: { $gte: days(60) } } },
      { $unwind: '$answers' },
      { $sort: { completedAt: 1 } },
      { $group: { _id: '$studentId', seq: { $push: '$answers.correct' }, last: { $max: '$completedAt' } } },
    ]),
    Attendance.aggregate([
      { $match: { studentId: { $in: ids }, date: { $gte: days(30) } } },
      { $group: {
        _id: '$studentId', n: { $sum: 1 }, last: { $max: '$date' },
        present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late', 'half_day']] }, 1, 0] } },
      } },
    ]),
  ]);
  const by = (rows) => Object.fromEntries(rows.map((r) => [String(r._id), r]));
  return { exams: by(exams), hw: by(hw), quiz: by(quiz), att: by(att) };
}

function evaluate(sid, m) {
  const e = m.exams[sid], h = m.hw[sid], q = m.quiz[sid], a = m.att[sid];
  const flags = [];
  const attendance30 = a ? pct(a.present, a.n) : null;
  if (a && a.n >= 6 && attendance30 < 70) flags.push({ code: 'ATTEND', rule: RULES.ATTEND });
  const examAvg = e ? Math.round(e.avg) : null;
  if (e && e.n >= 2 && examAvg < 50) flags.push({ code: 'EXAM', rule: RULES.EXAM });
  let quizAcc = null, quizTrend = null;
  if (q && q.seq.length) {
    const seq = q.seq;
    quizAcc = pct(seq.filter(Boolean).length, seq.length);
    if (seq.length >= 40) {
      const recent = seq.slice(-20), prior = seq.slice(-40, -20);
      quizTrend = pct(recent.filter(Boolean).length, 20) - pct(prior.filter(Boolean).length, 20);
      if (quizTrend <= -15) flags.push({ code: 'QUIZ_DECLINE', rule: RULES.QUIZ_DECLINE });
    }
  }
  if (h && h.n >= 1 && h.last < days(21)) flags.push({ code: 'HW_SILENT', rule: RULES.HW_SILENT });
  const lastActive = [e?.last, h?.last, q?.last, a?.last].filter(Boolean).sort().pop() || null;
  if (lastActive && lastActive < days(14)) flags.push({ code: 'INACTIVE', rule: RULES.INACTIVE });
  const risk = flags.length >= 2 ? 'high' : flags.length === 1 ? 'watch' : 'ok';
  return { attendance30, examAvg, examCount: e?.n || 0, quizAcc, quizTrend, hwCount: h?.n || 0, lastActive, flags, risk };
}

// GET /api/mastery/overview?grade=
router.get('/overview', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const filter = { role: 'student', isActive: { $ne: false } };
    if (req.query.grade) filter.gradeLevel = req.query.grade;
    const students = await User.find(filter)
      .select('firstName lastName gradeLevel avatar').limit(1200).lean();
    const m = await cohortMetrics(students.map((s) => s._id));
    const rows = students.map((s) => ({
      _id: s._id,
      name: [s.firstName, s.lastName].filter(Boolean).join(' '),
      grade: s.gradeLevel || '', avatar: s.avatar || '',
      ...evaluate(String(s._id), m),
    }));
    const order = { high: 0, watch: 1, ok: 2 };
    rows.sort((x, y) => order[x.risk] - order[y.risk] || (x.name > y.name ? 1 : -1));
    res.json({ success: true, data: { rows, rules: RULES, generatedAt: new Date() } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/mastery/student/:id — per-subject mastery and per-topic accuracy
router.get('/student/:id', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const sid = new mongoose.Types.ObjectId(req.params.id);
    const [student, examRows, hwRows, topicRows, attRows] = await Promise.all([
      User.findById(sid).select('firstName lastName gradeLevel avatar').lean(),
      ExamSubmission.aggregate([
        { $match: { studentId: sid, status: { $in: ['graded', 'released'] } } },
        { $lookup: { from: 'exams', localField: 'examId', foreignField: '_id', as: 'exam' } },
        { $unwind: '$exam' },
        { $sort: { gradedAt: 1 } },
        { $group: { _id: '$exam.subject', avg: { $avg: '$percentage' }, n: { $sum: 1 }, series: { $push: { p: '$percentage', at: '$gradedAt', title: '$exam.title' } } } },
      ]),
      HomeworkSubmission.aggregate([
        { $match: { student: sid } },
        { $lookup: { from: 'homeworks', localField: 'homework', foreignField: '_id', as: 'h' } },
        { $unwind: '$h' },
        { $group: { _id: '$h.subject', n: { $sum: 1 }, awarded: { $sum: '$totalAwarded' } } },
      ]),
      QuizSession.aggregate([
        { $match: { studentId: sid, completedAt: { $ne: null } } },
        { $unwind: '$answers' },
        { $lookup: { from: 'questions', localField: 'answers.questionId', foreignField: '_id', as: 'q' } },
        { $unwind: '$q' },
        { $group: {
          _id: { subject: '$q.subject', topic: { $ifNull: ['$q.topic', 'General'] } },
          n: { $sum: 1 }, ok: { $sum: { $cond: ['$answers.correct', 1, 0] } },
        } },
        { $match: { n: { $gte: 3 } } },
      ]),
      Attendance.find({ studentId: sid, date: { $gte: days(60) } }).select('date status').sort({ date: 1 }).lean(),
    ]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const subjects = {};
    const S = (name) => (subjects[name] = subjects[name] || { subject: name, examAvg: null, examCount: 0, examSeries: [], hwCount: 0, quizAcc: null, quizN: 0, topics: [] });
    examRows.forEach((r) => { const s = S(r._id); s.examAvg = Math.round(r.avg); s.examCount = r.n; s.examSeries = r.series.slice(-12); });
    hwRows.forEach((r) => { S(r._id).hwCount = r.n; });
    topicRows.forEach((r) => {
      const s = S(r._id.subject);
      s.topics.push({ topic: r._id.topic, accuracy: pct(r.ok, r.n), attempts: r.n });
      s.quizN += r.n;
    });
    Object.values(subjects).forEach((s) => {
      if (s.quizN) {
        const ok = s.topics.reduce((t, x) => t + Math.round((x.accuracy / 100) * x.attempts), 0);
        s.quizAcc = pct(ok, s.quizN);
        s.topics.sort((a, b) => a.accuracy - b.accuracy);
        s.weakest = s.topics.slice(0, 5);
        s.strongest = s.topics.slice(-5).reverse();
      }
    });
    const m = await cohortMetrics([sid]);
    res.json({ success: true, data: {
      student: { _id: student._id, name: [student.firstName, student.lastName].filter(Boolean).join(' '), grade: student.gradeLevel || '', avatar: student.avatar || '' },
      summary: evaluate(String(sid), m),
      subjects: Object.values(subjects).sort((a, b) => (a.subject > b.subject ? 1 : -1)),
      attendance: attRows.map((a) => ({ date: a.date, status: a.status })),
      rules: RULES,
    } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
