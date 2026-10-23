/**
 * routes/oversight.js — the Dean's academic oversight (mounted at /api/oversight).
 *
 * One place to check, monitor and correct every student's academic record:
 * attendance per lesson, keyed-in and online marks, teachers' comments, and
 * the class teacher. Every correction is logged in AcademicCorrection.
 *
 *   GET   /students?q&curriculum&classTeacher   all students, class teacher, term attendance
 *   GET   /teachers                             teachers for the class-teacher picker
 *   PATCH /students/:id/class-teacher           { teacherId | null }
 *   POST  /class-teacher/bulk                   { studentIds, teacherId | null }
 *   GET   /students/:id?from&to                 one student's full record
 *   PATCH /attendance                           { liveClassId, studentId, status, note }
 *   POST  /students/:id/excuse                  { from, to, note }  excuse every lesson in a range
 *   PATCH /marks/:id                            { score, outOf, note }        keyed-in mark
 *   PATCH /exam-submissions/:id                 { answers:[{i, marksAwarded, teacherComment}], feedback, note }
 *   PATCH /reports/:id/comment                  { field, subject?, text }     term report comment
 *   PATCH /weekly/:id                           { remarks }                   weekly report remark
 */
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const User = require('../models/User')
const LiveClass = require('../models/LiveClass')
const ClassroomSession = require('../models/ClassroomSession')
const MarkEntry = require('../models/MarkEntry')
const Exam = require('../models/Exam')
const ExamSubmission = require('../models/ExamSubmission')
const Report = require('../models/Report')
const WeeklyReport = require('../models/WeeklyReport')
const Correction = require('../models/AcademicCorrection')
const attendanceFacts = require('../lib/attendanceFacts')
const { gradeFor } = require('../lib/grading')

const STAFF = ['admin', 'dos', 'ops_manager']
const isId = (v) => mongoose.isValidObjectId(v)
const nameOf = (u) => (u ? [u.firstName, u.lastName].filter(Boolean).join(' ') : '')
const clip = (s, n = 300) => String(s ?? '').trim().slice(0, n)
const day = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Africa/Nairobi' })
const endOfDay = (d) => (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 ? new Date(d.getTime() + 864e5 - 1) : d)

router.use(auth, requireRole(...STAFF))

function range(q) {
  const to = q.to ? endOfDay(new Date(q.to)) : new Date()
  const from = q.from ? new Date(q.from) : new Date(to.getTime() - 90 * 864e5)
  if (isNaN(from) || isNaN(to) || from > to) return null
  return { from, to }
}

async function log(req, row) {
  try {
    await Correction.create({ ...row, by: req.user._id, byName: nameOf(req.user) })
  } catch (e) { console.error('[oversight] audit', e.message) }
}

// A sitting the lesson's teacher or the Dean marked, the join record, or none.
const markOf = (s) => (s?.excused ? 'excused' : attendanceFacts.sessionAttended(s) ? 'present' : 'absent')

// ── Students ───────────────────────────────────────────────────
router.get('/students', async (req, res) => {
  try {
    const f = { role: 'student', archived: { $ne: true } }
    if (req.query.curriculum) f.curriculum = String(req.query.curriculum)
    if (req.query.classTeacher === 'none') f.classTeacherId = null
    else if (isId(req.query.classTeacher)) f.classTeacherId = req.query.classTeacher
    if (req.query.q) {
      const r = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 60), 'i')
      f.$or = [{ firstName: r }, { lastName: r }, { admissionNo: r }]
    }
    const students = await User.find(f)
      .select('firstName lastName admissionNo curriculum gradeLevel deliveryMode studentStatus classTeacherId')
      .populate('classTeacherId', 'firstName lastName')
      .sort({ firstName: 1, lastName: 1 }).limit(400).lean()
    const r = range(req.query) || range({})
    let att = {}
    if (students.length) {
      att = await attendanceFacts.studentAttendance(r.from, r.to, { studentIds: students.map(s => s._id), lessons: false })
    }
    res.json({ success: true, data: { from: r.from, to: r.to, students: students.map(s => ({
      _id: s._id, name: nameOf(s), admissionNo: s.admissionNo || '', curriculum: s.curriculum || '',
      gradeLevel: s.gradeLevel || '', deliveryMode: s.deliveryMode || 'Virtual', status: s.studentStatus || '',
      classTeacher: s.classTeacherId ? { _id: s.classTeacherId._id, name: nameOf(s.classTeacherId) } : null,
      attendance: att[String(s._id)] ? { scheduled: att[String(s._id)].scheduled, attended: att[String(s._id)].attended, rate: att[String(s._id)].rate } : null,
    })) } })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

router.get('/teachers', async (req, res) => {
  try {
    const list = await User.find({ role: 'teacher', isActive: { $ne: false }, archived: { $ne: true } })
      .select('firstName lastName').sort({ firstName: 1 }).lean()
    res.json({ success: true, data: list.map(t => ({ _id: t._id, name: nameOf(t) })) })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

async function setClassTeacher(req, studentId, teacherId) {
  const st = await User.findOne({ _id: studentId, role: 'student' }).populate('classTeacherId', 'firstName lastName')
  if (!st) return null
  let teacher = null
  if (teacherId) {
    teacher = await User.findOne({ _id: teacherId, role: 'teacher' }).select('firstName lastName').lean()
    if (!teacher) throw Object.assign(new Error('Choose a teacher.'), { status: 400 })
  }
  const before = nameOf(st.classTeacherId)
  st.classTeacherId = teacher ? teacher._id : null
  await st.save()
  await log(req, { studentId: st._id, kind: 'class_teacher', label: 'Class teacher', before, after: nameOf(teacher) })
  return { _id: st._id, classTeacher: teacher ? { _id: teacher._id, name: nameOf(teacher) } : null }
}

router.patch('/students/:id/class-teacher', async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid student.' })
    const t = req.body?.teacherId
    if (t && !isId(t)) return res.status(400).json({ success: false, message: 'Invalid teacher.' })
    const out = await setClassTeacher(req, req.params.id, t || null)
    if (!out) return res.status(404).json({ success: false, message: 'Student not found.' })
    res.json({ success: true, data: out, message: 'Class teacher saved.' })
  } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
})

router.post('/class-teacher/bulk', async (req, res) => {
  try {
    const ids = (Array.isArray(req.body?.studentIds) ? req.body.studentIds : []).filter(isId).slice(0, 400)
    const t = req.body?.teacherId
    if (!ids.length) return res.status(400).json({ success: false, message: 'Choose students.' })
    if (t && !isId(t)) return res.status(400).json({ success: false, message: 'Invalid teacher.' })
    let n = 0
    for (const id of ids) { if (await setClassTeacher(req, id, t || null)) n++ }
    res.json({ success: true, data: { updated: n }, message: `Class teacher set for ${n} student${n === 1 ? '' : 's'}.` })
  } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
})

// ── One student's record ───────────────────────────────────────
router.get('/students/:id', async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid student.' })
    const r = range(req.query)
    if (!r) return res.status(400).json({ success: false, message: 'Check the dates.' })
    const st = await User.findOne({ _id: req.params.id, role: 'student' })
      .select('firstName lastName admissionNo curriculum gradeLevel deliveryMode classTeacherId')
      .populate('classTeacherId', 'firstName lastName').lean()
    if (!st) return res.status(404).json({ success: false, message: 'Student not found.' })
    const sid = st._id

    const att = await attendanceFacts.oneStudent(sid, r.from, r.to, { allRows: true })
    const classIds = (att.lessons || []).map(l => l.liveClassId)
    const [classes, sessions, keyed, subs, reports, weekly, history] = await Promise.all([
      LiveClass.find({ _id: { $in: classIds } }).select('teacherId deliveryMode').populate('teacherId', 'firstName lastName').lean(),
      ClassroomSession.find({ liveClassId: { $in: classIds }, userId: sid }).select('liveClassId markedBy excused excuseNote present').populate('markedBy', 'firstName lastName').lean(),
      MarkEntry.find({ studentId: sid, date: { $gte: r.from, $lte: r.to } }).populate('enteredBy', 'firstName lastName').sort({ date: -1 }).lean(),
      ExamSubmission.find({ studentId: sid, createdAt: { $gte: r.from, $lte: r.to } })
        .select('examId status totalScore maxScore percentage grade feedback answers.marksAwarded answers.teacherComment answers.questionRef answers.partPath answers.answerText gradedBy gradedAt submittedAt')
        .populate('examId', 'title subject paperNumber totalMarks startAt').populate('gradedBy', 'firstName lastName').sort({ createdAt: -1 }).lean(),
      Report.find({ studentId: sid }).select('academicYear term termLabel status overallAverage meanGrade subjects.subject subjects.teacherComment subjects.weightedScore subjects.letterGrade classTeacherReport hodRemarks principalComment updatedAt').sort({ academicYear: -1, term: -1 }).limit(6).lean(),
      WeeklyReport.find({ studentId: sid, createdAt: { $gte: r.from, $lte: r.to } }).select('subject teacherName week period remarks strengths improvements overallAverage meanGrade status updatedAt').sort({ createdAt: -1 }).limit(60).lean(),
      Correction.find({ studentId: sid }).sort({ createdAt: -1 }).limit(40).lean(),
    ])
    const cls = new Map(classes.map(c => [String(c._id), c]))
    const ses = new Map(sessions.map(s => [String(s.liveClassId), s]))

    res.json({ success: true, data: {
      from: r.from, to: r.to,
      student: { _id: sid, name: nameOf(st), admissionNo: st.admissionNo || '', curriculum: st.curriculum || '', gradeLevel: st.gradeLevel || '', deliveryMode: st.deliveryMode || 'Virtual',
        classTeacher: st.classTeacherId ? { _id: st.classTeacherId._id, name: nameOf(st.classTeacherId) } : null },
      attendance: {
        scheduled: att.scheduled, attended: att.attended, rate: att.rate, late: att.late,
        lessons: (att.lessons || []).map(l => {
          const s = ses.get(String(l.liveClassId)), c = cls.get(String(l.liveClassId))
          return { ...l, mark: l.closureDay && !l.counted && !l.excused ? 'closure' : markOf(s),
            teacher: nameOf(c?.teacherId), markedBy: nameOf(s?.markedBy) }
        }).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)),
        legacyRecords: att.legacyRecords || [],
      },
      keyedMarks: keyed.map(m => ({ _id: m._id, subject: m.subject, kind: m.kind, label: m.label, date: m.date, score: m.score, outOf: m.outOf, note: m.note, enteredBy: nameOf(m.enteredBy) })),
      exams: subs.map(s => ({
        _id: s._id, status: s.status, title: s.examId?.title || 'Exam', subject: s.examId?.subject || '', paper: s.examId?.paperNumber || '',
        date: s.examId?.startAt || s.submittedAt, totalScore: s.totalScore, maxScore: s.maxScore, percentage: s.percentage,
        grade: s.grade || (s.status === 'graded' || s.status === 'returned' ? gradeFor(st.curriculum, s.percentage, st.gradeLevel) : ''),
        feedback: s.feedback || '', markedBy: nameOf(s.gradedBy), markedAt: s.gradedAt,
        answers: (s.answers || []).map((a, i) => ({ i, ref: a.questionRef, part: a.partPath || [], marksAwarded: a.marksAwarded || 0, teacherComment: a.teacherComment || '', answer: String(a.answerText || '').slice(0, 160) })),
      })),
      reports, weekly, corrections: history,
    } })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

// ── Attendance ─────────────────────────────────────────────────
async function markLesson(req, liveClassId, studentId, status, note) {
  const cls = await LiveClass.findById(liveClassId).select('title subject scheduledAt assignedStudents').lean()
  if (!cls) throw Object.assign(new Error('Lesson not found.'), { status: 404 })
  if (!(cls.assignedStudents || []).map(String).includes(String(studentId)))
    throw Object.assign(new Error('The student is not on this lesson.'), { status: 400 })
  const prev = await ClassroomSession.findOne({ liveClassId, userId: studentId }).lean()
  const before = markOf(prev)
  const set = status === 'excused'
    ? { excused: true, excuseNote: clip(note), present: false, markedBy: req.user._id }
    : { excused: false, excuseNote: '', present: status === 'present', markedBy: req.user._id }
  await ClassroomSession.updateOne({ liveClassId, userId: studentId },
    { $set: set, $setOnInsert: { joinCount: 0, role: 'student' } }, { upsert: true })
  if (before !== status) {
    await log(req, { studentId, kind: 'attendance', ref: String(liveClassId), label: `${cls.subject || cls.title} · ${day(cls.scheduledAt)}`, before, after: status, note: clip(note) })
  }
  return { before, after: status }
}

router.patch('/attendance', async (req, res) => {
  try {
    const { liveClassId, studentId, status, note } = req.body || {}
    if (!isId(liveClassId) || !isId(studentId)) return res.status(400).json({ success: false, message: 'Choose a lesson and a student.' })
    if (!['present', 'absent', 'excused'].includes(status)) return res.status(400).json({ success: false, message: 'Mark present, absent or excused.' })
    const out = await markLesson(req, liveClassId, studentId, status, note)
    res.json({ success: true, data: out, message: 'Attendance corrected.' })
  } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
})

// Excuse every missed lesson in a range, e.g. a mid-term break that was
// never entered as a pause. Attended lessons are left as they are.
router.post('/students/:id/excuse', async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid student.' })
    const r = range(req.body || {})
    if (!r || !req.body?.from || !req.body?.to) return res.status(400).json({ success: false, message: 'Give the first and last day.' })
    if ((r.to - r.from) / 864e5 > 120) return res.status(400).json({ success: false, message: 'At most 120 days at a time.' })
    const att = await attendanceFacts.oneStudent(req.params.id, r.from, r.to, { allRows: true })
    let n = 0
    for (const l of att.lessons || []) {
      if (l.attended || l.excused) continue
      await markLesson(req, l.liveClassId, req.params.id, 'excused', req.body.note || 'Excused by the Dean')
      n++
    }
    res.json({ success: true, data: { excused: n }, message: n ? `${n} lesson${n === 1 ? '' : 's'} excused.` : 'No missed lessons in that range.' })
  } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
})

// ── Marks ──────────────────────────────────────────────────────
router.patch('/marks/:id', async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid mark.' })
    const m = await MarkEntry.findById(req.params.id)
    if (!m) return res.status(404).json({ success: false, message: 'Mark not found.' })
    const before = `${m.score}/${m.outOf}`
    const score = req.body?.score !== undefined ? Number(req.body.score) : m.score
    const outOf = req.body?.outOf !== undefined ? Number(req.body.outOf) : m.outOf
    if (!(outOf >= 1) || !(score >= 0) || score > outOf) return res.status(400).json({ success: false, message: 'The mark must be between 0 and the total.' })
    m.score = score; m.outOf = outOf
    if (req.body?.note !== undefined) m.note = clip(req.body.note)
    await m.save()
    await log(req, { studentId: m.studentId, kind: 'keyed_mark', ref: String(m._id), label: `${m.subject} · ${m.label || m.kind}`, before, after: `${score}/${outOf}`, note: clip(req.body?.reason) })
    res.json({ success: true, data: m, message: 'Mark corrected.' })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

// Correct an online exam: marks per answer and the teacher's comments.
// Re-totals the paper; no result email goes out again.
router.patch('/exam-submissions/:id', async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid submission.' })
    const sub = await ExamSubmission.findById(req.params.id).populate('examId', 'title subject')
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' })
    const before = `${sub.totalScore}/${sub.maxScore}`
    const edits = new Map((Array.isArray(req.body?.answers) ? req.body.answers : []).map(a => [Number(a.i), a]))
    let total = 0
    sub.answers = sub.answers.map((a, i) => {
      const e = edits.get(i), o = a.toObject()
      if (e) {
        if (e.marksAwarded !== undefined) {
          const v = Number(e.marksAwarded)
          if (!(v >= 0)) throw Object.assign(new Error('Marks cannot be negative.'), { status: 400 })
          o.marksAwarded = v
        }
        if (e.teacherComment !== undefined) o.teacherComment = clip(e.teacherComment, 2000)
      }
      total += o.marksAwarded || 0
      return o
    })
    if (sub.maxScore && total > sub.maxScore) return res.status(400).json({ success: false, message: `The total cannot exceed ${sub.maxScore}.` })
    sub.totalScore = total
    sub.percentage = sub.maxScore ? Math.round((total / sub.maxScore) * 100) : 0
    if (req.body?.feedback !== undefined) sub.feedback = clip(req.body.feedback, 3000)
    if (sub.status === 'submitted') { sub.status = 'graded'; sub.gradedAt = new Date(); sub.gradedBy = req.user._id }
    await sub.save()
    const st = await User.findById(sub.studentId).select('curriculum gradeLevel').lean()
    await log(req, { studentId: sub.studentId, kind: 'exam_mark', ref: String(sub._id), label: `${sub.examId?.subject || ''} · ${sub.examId?.title || 'Exam'}`, before, after: `${total}/${sub.maxScore}`, note: clip(req.body?.note) })
    res.json({ success: true, data: { totalScore: total, maxScore: sub.maxScore, percentage: sub.percentage, grade: gradeFor(st?.curriculum, sub.percentage, st?.gradeLevel) }, message: 'Exam marks corrected.' })
  } catch (e) { res.status(e.status || 500).json({ success: false, message: e.message }) }
})

// ── Teachers' comments ─────────────────────────────────────────
const REPORT_FIELDS = { teacherComment: "Subject teacher's comment", classTeacherReport: "Class teacher's report", hodRemarks: "Dean's comment", principalComment: "Principal's comment" }

router.patch('/reports/:id/comment', async (req, res) => {
  try {
    const { field, subject, text } = req.body || {}
    if (!isId(req.params.id) || !REPORT_FIELDS[field]) return res.status(400).json({ success: false, message: 'Choose a comment to edit.' })
    const rep = await Report.findById(req.params.id)
    if (!rep) return res.status(404).json({ success: false, message: 'Report not found.' })
    let before = ''
    if (field === 'teacherComment') {
      const s = (rep.subjects || []).find(x => x.subject === subject)
      if (!s) return res.status(400).json({ success: false, message: 'Subject not on this report.' })
      before = s.teacherComment || ''; s.teacherComment = clip(text, 1000)
    } else { before = rep[field] || ''; rep[field] = clip(text, 3000) }
    await rep.save()
    await log(req, { studentId: rep.studentId, kind: 'report_comment', ref: String(rep._id), label: `Term ${rep.term} ${rep.academicYear} · ${REPORT_FIELDS[field]}${subject ? ' (' + subject + ')' : ''}`, before: clip(before), after: clip(text) })
    res.json({ success: true, message: 'Comment saved.' })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

router.patch('/weekly/:id', async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid report.' })
    const w = await WeeklyReport.findById(req.params.id)
    if (!w) return res.status(404).json({ success: false, message: 'Report not found.' })
    const before = w.remarks || ''
    w.remarks = clip(req.body?.remarks, 3000)
    await w.save()
    if (w.studentId) await log(req, { studentId: w.studentId, kind: 'weekly_comment', ref: String(w._id), label: `${w.subject} · ${w.week || w.period}`, before: clip(before), after: clip(w.remarks) })
    res.json({ success: true, message: 'Remark saved.' })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

module.exports = router
