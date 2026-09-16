/**
 * check-exam-results.js
 * One off devtool. Audits a single student's exam results:
 * which papers are marked and visible to the student, which are
 * submitted but still waiting for marks, which were never finished,
 * and which assigned exams have no submission at all.
 *
 * Usage (Render shell, from backend/):
 *   node check-exam-results.js "Abubakirova"
 *   node check-exam-results.js "Amira Abubakirova"
 *   node check-exam-results.js <studentObjectId>
 *
 * Read only. Writes nothing.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const User           = require('./src/models/User');
const Exam           = require('./src/models/Exam');
const ExamSubmission = require('./src/models/ExamSubmission');

const ARG = process.argv.slice(2).join(' ').trim() || 'Abubakirova';

function fmt(d) {
  return d ? new Date(d).toISOString().replace('T', ' ').slice(0, 16) : 'never';
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI is not set.'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected.');

  // 1. Find the student, by id or by name across first/last in any order
  let student = null;
  if (mongoose.isValidObjectId(ARG)) {
    student = await User.findById(ARG).lean();
  } else {
    const parts = ARG.split(/\s+/).filter(Boolean);
    const rx = parts.map(p => new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    const matches = await User.find({
      role: 'student',
      $and: rx.map(r => ({ $or: [{ firstName: r }, { lastName: r }] })),
    }).select('firstName lastName email gradeLevel curriculum status').lean();

    if (matches.length === 0) {
      console.log('No student matched "' + ARG + '".');
      const loose = await User.find({ role: 'student', $or: [{ firstName: rx[0] }, { lastName: rx[0] }] })
        .select('firstName lastName email').limit(10).lean();
      if (loose.length) {
        console.log('Closest first-token matches:');
        loose.forEach(u => console.log('  ' + u._id + '  ' + u.firstName + ' ' + u.lastName + '  ' + (u.email || '')));
      }
      return;
    }
    if (matches.length > 1) {
      console.log('Multiple students matched "' + ARG + '". Re-run with the exact id:');
      matches.forEach(u => console.log('  ' + u._id + '  ' + u.firstName + ' ' + u.lastName + '  ' + (u.email || '')));
      return;
    }
    student = matches[0];
  }
  if (!student) { console.log('Student not found.'); return; }

  console.log('');
  console.log('STUDENT: ' + student.firstName + ' ' + student.lastName +
    '  (' + student._id + ')' +
    (student.gradeLevel ? '  grade: ' + student.gradeLevel : '') +
    (student.curriculum ? '  curriculum: ' + student.curriculum : ''));

  // 2. Every submission the student has, newest first
  const subs = await ExamSubmission.find({ studentId: student._id })
    .populate({ path: 'examId', select: 'title subject paperNumber startAt status totalMarks',
                populate: { path: 'teacherId', select: 'firstName lastName' } })
    .sort({ createdAt: -1 })
    .lean();

  // 3. Assigned exams with no submission document at all
  const subExamIds = new Set(subs.map(s => String(s.examId && s.examId._id ? s.examId._id : s.examId)));
  const assigned = await Exam.find({ assignedStudents: student._id })
    .select('title subject paperNumber startAt status').sort({ startAt: -1 }).lean();
  const noSub = assigned.filter(e => !subExamIds.has(String(e._id)));

  const published = [];   // graded or returned: marks are visible to the student
  const pending   = [];   // submitted: waiting for a teacher to mark
  const unfinished = [];  // in_progress: started, never submitted

  for (const s of subs) {
    if (s.status === 'graded' || s.status === 'returned') published.push(s);
    else if (s.status === 'submitted') pending.push(s);
    else unfinished.push(s);
  }

  function line(s) {
    const e = s.examId || {};
    const t = e.teacherId ? (e.teacherId.firstName + ' ' + e.teacherId.lastName) : 'unknown teacher';
    const paper = e.paperNumber ? ' Paper ' + e.paperNumber : '';
    return '  [' + (e.subject || '?') + '] ' + (e.title || '(exam deleted)') + paper +
      '  exam date: ' + fmt(e.startAt) + '  teacher: ' + t;
  }

  console.log('');
  console.log('MARKED AND PUBLISHED (visible to student): ' + published.length);
  for (const s of published) {
    console.log(line(s));
    console.log('    score: ' + s.totalScore + '/' + s.maxScore + ' (' + s.percentage + '%)' +
      (s.grade ? '  grade: ' + s.grade : '') +
      '  submitted: ' + fmt(s.submittedAt) + '  marked: ' + fmt(s.gradedAt) +
      '  status: ' + s.status);
    const unmarked = (s.answers || []).filter(a => a.isCorrect === null && !a.marksAwarded).length;
    if (unmarked > 0) console.log('    NOTE: ' + unmarked + ' answer(s) carry no marks. Check for partial marking.');
  }

  console.log('');
  console.log('PENDING MARKING (submitted, marks NOT yet published): ' + pending.length);
  for (const s of pending) {
    console.log(line(s));
    const days = s.submittedAt ? Math.floor((Date.now() - new Date(s.submittedAt)) / 86400000) : '?';
    const touched = (s.answers || []).filter(a => a.isCorrect !== null || a.marksAwarded > 0).length;
    console.log('    submitted: ' + fmt(s.submittedAt) + '  waiting: ' + days + ' day(s)' +
      (s.lateSubmission ? '  LATE SUBMISSION' : '') +
      (touched ? '  (' + touched + ' answer(s) part marked but not finalised)' : ''));
  }

  console.log('');
  console.log('STARTED BUT NEVER SUBMITTED: ' + unfinished.length);
  for (const s of unfinished) {
    console.log(line(s));
    console.log('    started: ' + fmt(s.startedAt) + '  last autosave: ' + fmt(s.lastSavedAt));
  }

  console.log('');
  console.log('ASSIGNED BUT NO ATTEMPT: ' + noSub.length);
  for (const e of noSub) {
    console.log('  [' + (e.subject || '?') + '] ' + e.title +
      (e.paperNumber ? ' Paper ' + e.paperNumber : '') +
      '  exam date: ' + fmt(e.startAt) + '  exam status: ' + e.status);
  }

  console.log('');
  console.log('SUMMARY: ' + published.length + ' published, ' + pending.length +
    ' awaiting marks, ' + unfinished.length + ' unfinished, ' + noSub.length + ' not attempted.');
}

main()
  .catch(e => { console.error('FAILED:', e.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
