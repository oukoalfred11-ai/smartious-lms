/**
 * routes/stat-reports.js — the report behind every headline number
 * (mounted at /api/stat-reports).
 *
 * Click a stat in the Dean & Operations portal and this returns the rows
 * that make it up, computed the same way as the stat itself, with the
 * method stated, so any number can be read, checked and printed.
 *
 *   GET /api/stat-reports/:key?days=N | from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Every report: { title, window, value, summary: [[label, value]], method,
 *   columns: [{ key, label, type }], rows }
 */
const express = require('express')
const router = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const User = require('../models/User')
const Exam = require('../models/Exam')
const ExamSubmission = require('../models/ExamSubmission')
const Homework = require('../models/Homework')
const HomeworkSubmission = require('../models/HomeworkSubmission')
const Allocation = require('../models/Allocation')
const Invoice = require('../models/Invoice')
const Inquiry = require('../models/Inquiry')
const attendanceFacts = require('../lib/attendanceFacts')
const { gradeFor } = require('../lib/grading')

// Quality Assurance reads the academic reports; money reports stay with operations.
const STAFF = ['admin', 'ops_manager', 'dos', 'qa', 'accountant']
const MONEY = ['admin', 'accountant']   // financial reports: Principal and Finance only
const nameOf = (u) => (u ? [u.firstName, u.lastName].filter(Boolean).join(' ') : '')
const pct = (n, d) => (d > 0 ? Math.round((n / d) * 1000) / 10 : null)
const mean = (xs) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null)
const col = (key, label, type = 'text') => ({ key, label, type })

function windowOf(q, defDays) {
  if (q.from || q.to) {
    const to = q.to ? new Date(q.to + 'T23:59:59') : new Date()
    const from = q.from ? new Date(q.from + 'T00:00:00') : new Date(to.getTime() - defDays * 864e5)
    return { from, to }
  }
  const days = Math.min(Math.max(Number(q.days) || defDays, 1), 400)
  return { from: new Date(Date.now() - days * 864e5), to: new Date() }
}

const REPORTS = {
  // Students' lesson attendance: attended of scheduled, lowest first.
  async attendance(q) {
    const w = windowOf(q, 7)
    const facts = await attendanceFacts.studentAttendance(w.from, w.to, { lessons: false })
    const ids = Object.keys(facts).filter(id => facts[id].scheduled > 0)
    const users = await User.find({ _id: { $in: ids }, role: 'student' })
      .select('firstName lastName gradeLevel curriculum deliveryMode classTeacherId').populate('classTeacherId', 'firstName lastName').lean()
    const rows = users.map(u => {
      const f = facts[String(u._id)]
      return { name: nameOf(u), grade: u.gradeLevel || '', curriculum: u.curriculum || '', classTeacher: nameOf(u.classTeacherId),
        scheduled: f.scheduled, attended: f.attended, missed: f.scheduled - f.attended, late: f.late, rate: f.rate }
    }).sort((a, b) => (a.rate ?? 101) - (b.rate ?? 101))
    const sch = rows.reduce((t, r) => t + r.scheduled, 0), att = rows.reduce((t, r) => t + r.attended, 0)
    return {
      title: 'Attendance', window: w, value: pct(att, sch) != null ? pct(att, sch) + '%' : '—',
      summary: [['Lessons scheduled', sch], ['Attended', att], ['Missed', sch - att], ['Students below 80%', rows.filter(r => r.rate != null && r.rate < 80).length]],
      method: 'Each student: lessons attended out of lessons scheduled for them in the window (joined the classroom, or marked present by the teacher or Dean). Lessons on school closure days, during a break or pause, and lessons the Dean excused are not counted. Lowest attendance first.',
      columns: [col('name', 'Student'), col('grade', 'Grade'), col('curriculum', 'Curriculum'), col('classTeacher', 'Class teacher'), col('scheduled', 'Scheduled', 'num'), col('attended', 'Attended', 'num'), col('missed', 'Missed', 'num'), col('late', 'Late', 'num'), col('rate', 'Rate', 'pct')],
      rows,
    }
  },

  // Lessons held, with each lesson's turnout.
  async lessons(q) {
    const w = windowOf(q, 7)
    const facts = await attendanceFacts.sessionFacts(w.from, w.to, { limit: 3000 })
    const tids = [...new Set(facts.classes.map(c => String(c.teacherId)).filter(Boolean))]
    const teachers = Object.fromEntries((await User.find({ _id: { $in: tids } }).select('firstName lastName').lean()).map(t => [String(t._id), nameOf(t)]))
    const rows = facts.classes.map(c => {
      const pc = facts.perClass[String(c._id)] || { assigned: 0, attended: 0 }
      return { date: c.scheduledAt, subject: c.subject || '', title: c.title || '', grade: c.grade || '', teacher: teachers[String(c.teacherId)] || '',
        students: pc.assigned, attended: pc.attended, rate: pct(pc.attended, pc.assigned) }
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
    const byTeacher = {}
    rows.forEach(r => { byTeacher[r.teacher] = (byTeacher[r.teacher] || 0) + 1 })
    return {
      title: 'Lessons held', window: w, value: rows.length,
      summary: [['Lessons', rows.length], ['Teachers teaching', Object.keys(byTeacher).length], ['Average turnout', mean(rows.filter(r => r.rate != null).map(r => r.rate)) != null ? mean(rows.filter(r => r.rate != null).map(r => r.rate)) + '%' : '—']],
      method: 'Lessons (not clubs or events) in the window that were actually held: closed by the teacher as taught or student absent, ended, or joined. Turnout = students attending of students expected.',
      columns: [col('date', 'Date', 'datetime'), col('subject', 'Subject'), col('title', 'Lesson'), col('grade', 'Grade'), col('teacher', 'Teacher'), col('students', 'Expected', 'num'), col('attended', 'Attended', 'num'), col('rate', 'Turnout', 'pct')],
      rows,
    }
  },

  // Exam papers marked in the window, each graded on the student's curriculum.
  async exams(q) {
    const w = windowOf(q, 30)
    const subs = await ExamSubmission.find({ status: { $in: ['graded', 'returned', 'released'] }, gradedAt: { $gte: w.from, $lte: w.to } })
      .select('examId studentId totalScore maxScore percentage gradedAt gradedBy')
      .populate('examId', 'title subject paperNumber grade').populate('studentId', 'firstName lastName curriculum gradeLevel').populate('gradedBy', 'firstName lastName')
      .sort({ gradedAt: -1 }).limit(3000).lean()
    const rows = subs.map(s => ({
      date: s.gradedAt, student: nameOf(s.studentId), grade: s.studentId?.gradeLevel || s.examId?.grade || '',
      subject: s.examId?.subject || '', paper: [s.examId?.title, s.examId?.paperNumber].filter(Boolean).join(' · '),
      score: `${s.totalScore ?? 0}/${s.maxScore ?? 0}`, percentage: s.percentage,
      letter: gradeFor(s.studentId?.curriculum, s.percentage, s.studentId?.gradeLevel), markedBy: nameOf(s.gradedBy),
    }))
    const pcts = rows.map(r => r.percentage).filter(v => v != null)
    return {
      title: 'Exam results', window: w, value: mean(pcts) != null ? mean(pcts) + '%' : '—',
      summary: [['Papers marked', rows.length], ['Average', mean(pcts) != null ? mean(pcts) + '%' : '—'], ['Below 50%', pcts.filter(p => p < 50).length], ['70% and above', pcts.filter(p => p >= 70).length]],
      method: 'Every exam paper marked in the window, with the percentage awarded and the grade on the student\'s own curriculum scale. The average is the mean percentage across papers.',
      columns: [col('date', 'Marked', 'date'), col('student', 'Student'), col('grade', 'Grade'), col('subject', 'Subject'), col('paper', 'Paper'), col('score', 'Score'), col('percentage', '%', 'pct'), col('letter', 'Grade'), col('markedBy', 'Marked by')],
      rows,
    }
  },

  // Exams set in the window and how far each has got.
  async examsSet(q) {
    const w = windowOf(q, 30)
    const exams = await Exam.find({ startAt: { $gte: w.from, $lte: w.to } }).select('title subject grade paperNumber startAt teacherId assignedStudents')
      .populate('teacherId', 'firstName lastName').sort({ startAt: -1 }).limit(1000).lean()
    const agg = await ExamSubmission.aggregate([{ $match: { examId: { $in: exams.map(e => e._id) } } },
      { $group: { _id: '$examId', submitted: { $sum: { $cond: [{ $in: ['$status', ['submitted', 'graded', 'returned', 'released']] }, 1, 0] } },
        marked: { $sum: { $cond: [{ $in: ['$status', ['graded', 'returned', 'released']] }, 1, 0] } } } }])
    const by = Object.fromEntries(agg.map(a => [String(a._id), a]))
    const rows = exams.map(e => {
      const a = by[String(e._id)] || { submitted: 0, marked: 0 }
      const n = (e.assignedStudents || []).length
      return { date: e.startAt, subject: e.subject, paper: [e.title, e.paperNumber].filter(Boolean).join(' · '), grade: e.grade, teacher: nameOf(e.teacherId),
        assigned: n, submitted: a.submitted, marked: a.marked, unmarked: a.submitted - a.marked }
    })
    return {
      title: 'Exams set', window: w, value: rows.length,
      summary: [['Exams', rows.length], ['Papers submitted', rows.reduce((t, r) => t + r.submitted, 0)], ['Awaiting marking', rows.reduce((t, r) => t + r.unmarked, 0)]],
      method: 'Exams scheduled to start in the window, with how many students were set the paper, submitted it, and have been marked.',
      columns: [col('date', 'Date', 'date'), col('subject', 'Subject'), col('paper', 'Paper'), col('grade', 'Grade'), col('teacher', 'Teacher'), col('assigned', 'Set', 'num'), col('submitted', 'Submitted', 'num'), col('marked', 'Marked', 'num'), col('unmarked', 'To mark', 'num')],
      rows,
    }
  },

  // Homework set in the window: submitted and marked.
  async homework(q) {
    const w = windowOf(q, 30)
    const hws = await Homework.find({ createdAt: { $gte: w.from, $lte: w.to } }).select('title subject grade dueAt createdBy assignedStudents')
      .populate('createdBy', 'firstName lastName').sort({ createdAt: -1 }).limit(2000).lean()
    const agg = await HomeworkSubmission.aggregate([{ $match: { homework: { $in: hws.map(h => h._id) } } },
      { $group: { _id: '$homework', submitted: { $sum: { $cond: [{ $ne: ['$submittedAt', null] }, 1, 0] } },
        marked: { $sum: { $cond: [{ $in: ['$status', ['graded', 'released']] }, 1, 0] } } } }])
    const by = Object.fromEntries(agg.map(a => [String(a._id), a]))
    const rows = hws.map(h => {
      const a = by[String(h._id)] || { submitted: 0, marked: 0 }
      const n = (h.assignedStudents || []).length
      return { title: h.title, subject: h.subject || '', grade: h.grade || '', teacher: nameOf(h.createdBy), due: h.dueAt,
        assigned: n, submitted: a.submitted, marked: a.marked, rate: pct(a.submitted, n) }
    })
    const set = rows.reduce((t, r) => t + r.assigned, 0), sub = rows.reduce((t, r) => t + r.submitted, 0), mk = rows.reduce((t, r) => t + r.marked, 0)
    return {
      title: 'Homework', window: w, value: pct(mk, set) != null ? pct(mk, set) + '%' : '—',
      summary: [['Homework set', rows.length], ['Student copies', set], ['Submitted', sub], ['Marked', mk]],
      method: 'Homework created in the window. Compliance = marked submissions out of copies set to students.',
      columns: [col('title', 'Homework'), col('subject', 'Subject'), col('grade', 'Grade'), col('teacher', 'Teacher'), col('due', 'Due', 'date'), col('assigned', 'Set', 'num'), col('submitted', 'Submitted', 'num'), col('marked', 'Marked', 'num'), col('rate', 'Submitted %', 'pct')],
      rows,
    }
  },

  // Students flagged by the early-warning rules (same as Mastery).
  async atRisk() {
    const { cohortMetrics, evaluate, RULES } = require('./mastery')
    const students = await User.find({ role: 'student', isActive: { $ne: false } }).select('firstName lastName gradeLevel curriculum').limit(1200).lean()
    const m = await cohortMetrics(students.map(s => s._id))
    const rows = students.map(s => ({ s, e: evaluate(String(s._id), m) })).filter(x => x.e.risk !== 'ok')
      .map(({ s, e }) => ({ name: nameOf(s), grade: s.gradeLevel || '', risk: e.risk === 'high' ? 'High' : 'Watch',
        attendance30: e.attendance30, examAvg: e.examAvg, quizAcc: e.quizAcc, lastActive: e.lastActive, flags: e.flags.map(f => f.rule).join('; ') }))
      .sort((a, b) => (a.risk === b.risk ? (a.name > b.name ? 1 : -1) : a.risk === 'High' ? -1 : 1))
    return {
      title: 'Students at risk', value: rows.filter(r => r.risk === 'High').length,
      summary: [['High risk', rows.filter(r => r.risk === 'High').length], ['On watch', rows.filter(r => r.risk === 'Watch').length], ['Students checked', students.length]],
      method: 'Early-warning flags: ' + Object.values(RULES).join(' · ') + '. Two or more flags = high risk, one = watch.',
      columns: [col('name', 'Student'), col('grade', 'Grade'), col('risk', 'Risk'), col('attendance30', 'Attendance 30d', 'pct'), col('examAvg', 'Exam avg', 'pct'), col('quizAcc', 'Quiz accuracy', 'pct'), col('lastActive', 'Last active', 'date'), col('flags', 'Why')],
      rows,
    }
  },

  async students() {
    const users = await User.find({ role: 'student', isActive: { $ne: false }, archived: { $ne: true } })
      .select('firstName lastName admissionNo gradeLevel curriculum deliveryMode programme studentStatus classTeacherId createdAt')
      .populate('classTeacherId', 'firstName lastName').sort({ firstName: 1 }).limit(3000).lean()
    const rows = users.map(u => ({ name: nameOf(u), admissionNo: u.admissionNo || '', grade: u.gradeLevel || '', curriculum: u.curriculum || '',
      mode: u.deliveryMode || 'Virtual', programme: u.programme || '', classTeacher: nameOf(u.classTeacherId), status: u.studentStatus || '', joined: u.createdAt }))
    const count = (k) => Object.entries(rows.reduce((o, r) => { o[r[k] || 'Unset'] = (o[r[k] || 'Unset'] || 0) + 1; return o }, {})).sort((a, b) => b[1] - a[1])
    return {
      title: 'Active students', value: rows.length,
      summary: [['Students', rows.length], ...count('mode').map(([k, v]) => [k, v]), ['No class teacher', rows.filter(r => !r.classTeacher).length]],
      method: 'Student accounts that are active and not archived.',
      columns: [col('name', 'Student'), col('admissionNo', 'Adm. no.'), col('grade', 'Grade'), col('curriculum', 'Curriculum'), col('mode', 'Learning mode'), col('programme', 'Programme'), col('classTeacher', 'Class teacher'), col('status', 'Status'), col('joined', 'Joined', 'date')],
      rows,
    }
  },

  async teachers(q) {
    const w = windowOf(q, 30)
    const [teachers, facts, allocs] = await Promise.all([
      User.find({ role: 'teacher', isActive: { $ne: false } }).select('firstName lastName email teacherCategory').sort({ firstName: 1 }).lean(),
      attendanceFacts.sessionFacts(w.from, w.to, { limit: 3000 }),
      Allocation.aggregate([{ $match: { status: 'Active' } }, { $group: { _id: '$teacherId', students: { $addToSet: '$studentId' } } }]),
    ])
    const held = {}
    facts.classes.forEach(c => { held[String(c.teacherId)] = (held[String(c.teacherId)] || 0) + 1 })
    const al = Object.fromEntries(allocs.map(a => [String(a._id), a.students.length]))
    const rows = teachers.map(t => ({ name: nameOf(t), email: t.email, category: t.teacherCategory || 'teacher', students: al[String(t._id)] || 0, lessons: held[String(t._id)] || 0 }))
      .sort((a, b) => b.lessons - a.lessons)
    return {
      title: 'Teachers', window: w, value: rows.length,
      summary: [['Teachers', rows.length], ['Taught in the window', rows.filter(r => r.lessons > 0).length], ['No lessons held', rows.filter(r => r.lessons === 0).length]],
      method: 'Active teacher accounts, with students allocated to each and lessons held in the window.',
      columns: [col('name', 'Teacher'), col('email', 'Email'), col('category', 'Type'), col('students', 'Students', 'num'), col('lessons', 'Lessons held', 'num')],
      rows,
    }
  },

  // Money received this month (same rule as Command → Collected).
  async collected(q, user) {
    if (!MONEY.includes(user.role)) return null
    const now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), 1)
    const inv = await Invoice.find({ status: 'paid', paidAt: { $gte: start } }).select('invoiceNo billedToName studentName totalDue paidAmount paidAt currency').sort({ paidAt: -1 }).lean()
    const rows = inv.map(i => ({ invoiceNo: i.invoiceNo, family: i.billedToName, student: i.studentName || '', paidAt: i.paidAt, currency: i.currency, amount: i.paidAmount > 0 ? i.paidAmount : i.totalDue }))
    const byCur = rows.reduce((o, r) => { o[r.currency] = (o[r.currency] || 0) + r.amount; return o }, {})
    return {
      title: 'Collected this month', value: rows.length + ' payments',
      summary: Object.entries(byCur).map(([c, v]) => [c, Math.round(v).toLocaleString('en-KE')]),
      method: 'Invoices paid this calendar month, by payment date, with the amount received (or the invoice total for older records).',
      columns: [col('paidAt', 'Paid', 'date'), col('invoiceNo', 'Invoice'), col('family', 'Billed to'), col('student', 'Student'), col('currency', 'Cur.'), col('amount', 'Amount', 'money')],
      rows,
    }
  },

  async pipeline(q, user) {
    if (!['admin', 'ops_manager'].includes(user.role)) return null
    const w = windowOf(q, 90)
    const list = await Inquiry.find({ createdAt: { $gte: w.from }, status: { $nin: ['enrolled', 'lost', 'unqualified'] } })
      .select('parentName studentName studentGrade curriculum country source status createdAt').sort({ createdAt: -1 }).limit(2000).lean()
    const rows = list.map(i => ({ created: i.createdAt, parent: i.parentName, student: i.studentName || '', grade: i.studentGrade || '', curriculum: i.curriculum || '', country: i.country || '', source: i.source || '', stage: String(i.status || '').replace(/_/g, ' ') }))
    const stages = Object.entries(rows.reduce((o, r) => { o[r.stage] = (o[r.stage] || 0) + 1; return o }, {}))
    return {
      title: 'Active pipeline', window: w, value: rows.length, summary: stages,
      method: 'Inquiries from the window that are still open: not enrolled, lost or unqualified.',
      columns: [col('created', 'Received', 'date'), col('parent', 'Parent'), col('student', 'Student'), col('grade', 'Grade'), col('curriculum', 'Curriculum'), col('country', 'Country'), col('source', 'Source'), col('stage', 'Stage')],
      rows,
    }
  },
}

router.get('/:key', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const fn = Object.prototype.hasOwnProperty.call(REPORTS, req.params.key) && REPORTS[req.params.key]
    if (!fn) return res.status(404).json({ success: false, message: 'No such report.' })
    const data = await fn(req.query, req.user)
    if (!data) return res.status(403).json({ success: false, message: 'This report is not available to your role.' })
    res.json({ success: true, data: { key: req.params.key, generatedAt: new Date(), ...data } })
  } catch (e) {
    console.error('[stat-reports]', req.params.key, e.message)
    res.status(500).json({ success: false, message: 'Could not build the report.' })
  }
})

module.exports = router
module.exports.REPORTS = REPORTS
