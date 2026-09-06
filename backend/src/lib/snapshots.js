/**
 * snapshots.js — computes daily metric snapshots and the weekly digest.
 *
 * computeDay(date): derives that day's facts from source collections
 * (derived-status class sessions, graded exams, quizzes, homework,
 * question bank) and upserts one MetricSnapshot per scope. Idempotent:
 * re-running a day overwrites it with fresh truth.
 *
 * sendWeeklyDigest(): Monday email to academic leadership — KPIs with
 * week-over-week deltas plus the exception lists. The report that
 * arrives beats the dashboard that must be visited.
 */
const LiveClass = require('../models/LiveClass');
const ClassroomSession = require('../models/ClassroomSession');
const ExamSubmission = require('../models/ExamSubmission');
const QuizSession = require('../models/QuizSession');
const HomeworkSubmission = require('../models/HomeworkSubmission');
const Question = require('../models/Question');
const MetricSnapshot = require('../models/MetricSnapshot');
const User = require('../models/User');

const dayKey = (d) => d.toISOString().split('T')[0];
const r1 = (x) => Math.round(x * 10) / 10;

async function computeDay(date) {
  const from = new Date(dayKey(date) + 'T00:00:00Z');
  const to = new Date(dayKey(date) + 'T23:59:59Z');
  const now = Date.now();

  // Classes held that day: derived status (scheduled time + duration past,
  // not cancelled) — same rule as the DOS reports, so numbers agree.
  const raw = await LiveClass.find({
    status: { $nin: ['cancelled'] },
    kind: { $in: ['lesson', null] },
    scheduledAt: { $gte: from, $lte: to },
  }).select('subject grade teacherId assignedStudents scheduledAt durationMins status').lean();
  const classes = raw.filter(c => c.status === 'ended' ||
    new Date(c.scheduledAt).getTime() + (c.durationMins || 60) * 60000 < now);
  const ids = classes.map(c => c._id);
  const sessions = ids.length ? await ClassroomSession.find({ liveClassId: { $in: ids } })
    .select('liveClassId userId present joinCount').lean() : [];
  const attendedSet = new Set();
  sessions.forEach(s => {
    if (((s.joinCount || 0) > 0 || s.present === true) && s.present !== false)
      attendedSet.add(String(s.liveClassId) + '|' + String(s.userId));
  });

  const studentGrade = {};
  const allStudents = new Set();
  classes.forEach(c => (c.assignedStudents || []).forEach(u => allStudents.add(String(u))));
  if (allStudents.size) {
    (await User.find({ _id: { $in: [...allStudents] } }).select('gradeLevel').lean())
      .forEach(u => { studentGrade[String(u._id)] = u.gradeLevel || 'Unassigned'; });
  }

  const acc = {}; // scope -> partial metrics
  const bump = (scope, field, n = 1) => {
    acc[scope] = acc[scope] || { scheduled: 0, attended: 0, sessionsHeld: 0, examSum: 0, examN: 0, quizN: 0, hwN: 0, qbAdded: 0 };
    acc[scope][field] += n;
  };
  classes.forEach(c => {
    ['school', 'subject:' + (c.subject || 'Unknown'), 'teacher:' + String(c.teacherId)].forEach(s => bump(s, 'sessionsHeld'));
    (c.assignedStudents || []).forEach(u => {
      const uid = String(u);
      const g = 'grade:' + (studentGrade[uid] || 'Unassigned');
      const att = attendedSet.has(String(c._id) + '|' + uid) ? 1 : 0;
      [['school'], [g], ['teacher:' + String(c.teacherId)]].forEach(([s]) => {
        bump(s, 'scheduled'); if (att) bump(s, 'attended');
      });
    });
  });

  // Exams graded that day
  const exams = await ExamSubmission.aggregate([
    { $match: { status: { $in: ['graded', 'released'] }, gradedAt: { $gte: from, $lte: to } } },
    { $lookup: { from: 'exams', localField: 'examId', foreignField: '_id', as: 'exam' } },
    { $unwind: '$exam' },
    { $project: { percentage: 1, grade: '$exam.grade', subject: '$exam.subject', teacherId: '$exam.teacherId' } },
  ]);
  exams.forEach(e => {
    ['school', 'grade:' + (e.grade || 'Unassigned'), 'subject:' + (e.subject || 'Unknown'), 'teacher:' + String(e.teacherId)]
      .forEach(s => { bump(s, 'examN'); bump(s, 'examSum', e.percentage || 0); });
  });

  const [quizN, hwN, qb] = await Promise.all([
    QuizSession.countDocuments({ completedAt: { $gte: from, $lte: to } }),
    HomeworkSubmission.countDocuments({ createdAt: { $gte: from, $lte: to } }),
    Question.aggregate([
      { $match: { isActive: { $ne: false }, createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$createdBy', n: { $sum: 1 } } },
    ]),
  ]);
  bump('school', 'quizN', quizN); bump('school', 'hwN', hwN);
  qb.forEach(r => { bump('school', 'qbAdded', r.n); bump('teacher:' + String(r._id), 'qbAdded', r.n); });

  const day = dayKey(date);
  const ops = Object.entries(acc).map(([scope, m]) => ({
    updateOne: {
      filter: { day, scope },
      update: { $set: { metrics: {
        scheduled: m.scheduled, attended: m.attended, sessionsHeld: m.sessionsHeld,
        examAvg: m.examN ? r1(m.examSum / m.examN) : null, examN: m.examN,
        quizN: m.quizN, hwN: m.hwN, qbAdded: m.qbAdded,
      } } },
      upsert: true,
    },
  }));
  if (ops.length) await MetricSnapshot.bulkWrite(ops);
  return { day, scopes: ops.length };
}

/** Sum a scope's snapshots over a date range into one KPI row. */
async function rollup(scope, fromDay, toDay) {
  const rows = await MetricSnapshot.find({ scope, day: { $gte: fromDay, $lte: toDay } }).lean();
  const t = { scheduled: 0, attended: 0, sessionsHeld: 0, examSum: 0, examN: 0, quizN: 0, hwN: 0, qbAdded: 0 };
  rows.forEach(r => {
    const m = r.metrics || {};
    t.scheduled += m.scheduled || 0; t.attended += m.attended || 0; t.sessionsHeld += m.sessionsHeld || 0;
    t.examSum += (m.examAvg || 0) * (m.examN || 0); t.examN += m.examN || 0;
    t.quizN += m.quizN || 0; t.hwN += m.hwN || 0; t.qbAdded += m.qbAdded || 0;
  });
  return {
    attendancePct: t.scheduled ? r1((t.attended / t.scheduled) * 100) : null,
    attended: t.attended, scheduled: t.scheduled, sessionsHeld: t.sessionsHeld,
    examAvg: t.examN ? r1(t.examSum / t.examN) : null, examN: t.examN,
    quizN: t.quizN, hwN: t.hwN, qbAdded: t.qbAdded,
  };
}

async function sendWeeklyDigest() {
  const { getTransporter } = require('./issueInvoice');
  const t = getTransporter();
  if (!t) return console.log('[digest] no email transport configured');
  const d = (n) => dayKey(new Date(Date.now() - n * 864e5));
  const [thisWeek, lastWeek, Intervention] = await Promise.all([
    rollup('school', d(7), d(1)),
    rollup('school', d(14), d(8)),
    Promise.resolve(require('../models/Intervention')),
  ]);
  const due = await Intervention.countDocuments({ status: 'open', dueDate: { $lte: new Date() } });
  const delta = (a, b, suffix = '') => {
    if (a === null || b === null) return '';
    const diff = r1(a - b);
    const arrow = diff > 0 ? '\u2191' : diff < 0 ? '\u2193' : '\u2192';
    return ` (${arrow} ${Math.abs(diff)}${suffix} vs prior week)`;
  };
  const staff = await User.find({ role: { $in: ['dos', 'ops_manager', 'admin'] }, isActive: { $ne: false } }).select('email').lean();
  const to = staff.map(s => s.email).filter(Boolean).join(',');
  if (!to) return;
  const html = `
    <div style="font-family:Georgia,serif;max-width:560px">
      <h2 style="color:#7D1025;margin:0 0 4px">Smartious weekly academic digest</h2>
      <p style="color:#666;font-size:13px;margin:0 0 16px">${d(7)} to ${d(1)}</p>
      <ul style="font-size:14px;line-height:1.9">
        <li><b>Attendance:</b> ${thisWeek.attendancePct ?? '\u2013'}% (${thisWeek.attended}/${thisWeek.scheduled})${delta(thisWeek.attendancePct, lastWeek.attendancePct, 'pp')}</li>
        <li><b>Lessons held:</b> ${thisWeek.sessionsHeld}${delta(thisWeek.sessionsHeld, lastWeek.sessionsHeld)}</li>
        <li><b>Exam average:</b> ${thisWeek.examAvg ?? '\u2013'}% over ${thisWeek.examN} graded${delta(thisWeek.examAvg, lastWeek.examAvg, 'pp')}</li>
        <li><b>Quiz sessions:</b> ${thisWeek.quizN}${delta(thisWeek.quizN, lastWeek.quizN)} &middot; <b>Homework:</b> ${thisWeek.hwN}${delta(thisWeek.hwN, lastWeek.hwN)}</li>
        <li><b>Question bank:</b> ${thisWeek.qbAdded} added${delta(thisWeek.qbAdded, lastWeek.qbAdded)}</li>
        <li><b>Interventions past their review date:</b> ${due}</li>
      </ul>
      <p style="font-size:12.5px;color:#666">Full detail, charts and downloadable reports: DOS portal \u2192 Performance &amp; Reports.</p>
    </div>`;
  await t.sendMail({
    from: process.env.EMAIL_FROM || 'reports@smartioushomeschool.com',
    to, subject: 'Smartious weekly academic digest', html,
  });
  console.log('[digest] sent to', staff.length, 'leaders');
}

function startSnapshotJobs() {
  const run = async () => {
    try {
      await computeDay(new Date(Date.now() - 864e5)); // finalize yesterday
      await computeDay(new Date());                    // running today
      console.log('[snapshots] daily compute done');
    } catch (e) { console.error('[snapshots] failed:', e.message); }
  };
  run();
  setInterval(run, 6 * 3600 * 1000); // every 6h keeps "today" fresh
  setInterval(async () => {
    if (new Date().getDay() === 1 && new Date().getHours() < 6) {
      try { await sendWeeklyDigest(); } catch (e) { console.error('[digest]', e.message); }
    }
  }, 5 * 3600 * 1000); // fires Monday early morning once
}

module.exports = { computeDay, rollup, sendWeeklyDigest, startSnapshotJobs };
