/**
 * routes/parent-portal.js
 * All parent-facing data endpoints.
 * Mounted at /api/parent
 *
 * GET  /api/parent/children              — get linked students
 * GET  /api/parent/children/:id/reports  — academic performance + reports
 * GET  /api/parent/children/:id/fees     — fee status, invoices, receipts
 * GET  /api/parent/children/:id/timetable— student timetable
 * POST /api/parent/link                  — link parent email to a student
 * POST /api/parent/remind-class          — manual class reminder (cron uses this)
 */

const express    = require('express')
const router     = express.Router()
const nodemailer = require('nodemailer')
const { auth, requireRole } = require('../middleware/auth')
const User           = require('../models/User')
// Resolves the student plus every parent linked by any of the three
// methods, validating and de-duplicating the addresses.
const { resolveStudentRecipients, describeRecipients } = require('../lib/recipients')
const TimetableEntry = require('../models/TimetableEntry')
const attendanceFacts = require('../lib/attendanceFacts')
const Invoice        = require('../models/Invoice')
const Payroll        = require('../models/Payroll')

const ok   = (res, data, msg) => res.json({ success:true, data, message:msg })
const fail = (res, code, msg) => res.status(code).json({ success:false, message:msg })

function getTransporter() {
  const u = process.env.EMAIL_USER, p = process.env.EMAIL_PASSWORD
  if (!u||!p) return null
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST||'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT||'587',10),
    secure: parseInt(process.env.EMAIL_PORT||'587',10)===465,
    auth:{ user:u, pass:p },
  })
}

function fmtTime(hhmm) {
  if (!hhmm) return ''
  const [h,m] = hhmm.split(':').map(Number)
  const mer = h>=12?'PM':'AM'; let hr=h%12; if(!hr) hr=12
  return `${hr}${m?':'+String(m).padStart(2,'0'):''} ${mer}`
}

// ── GET /api/parent/children ──────────────────────────────
// Returns all students linked to the logged-in parent
router.get('/children', auth, async (req, res) => {
  try {
    const parent = await User.findById(req.user._id)
      .populate('linkedStudents','firstName lastName email admissionNo admissionNumber curriculum gradeLevel programme avatar parentEmail parentName')
      .lean()
    if (!parent) return fail(res,404,'Parent not found.')

    // Also find students where parentEmail matches parent email
    const byEmail = await User.find({ role:'student', parentEmail: req.user.email })
      .select('firstName lastName email admissionNo admissionNumber curriculum gradeLevel programme avatar parentEmail parentName')
      .lean()

    // Merge, deduplicate
    const linked  = parent.linkedStudents || []
    const all     = [...linked]
    byEmail.forEach(s => { if (!all.some(x=>String(x._id)===String(s._id))) all.push(s) })

    return ok(res, { children: all })
  } catch(e) { return fail(res,e.status||500,e.message) }
})

// ── POST /api/parent/link ─────────────────────────────────
// Admin/parent links a student to this parent account
router.post('/link', auth, async (req, res) => {
  try {
    const { studentId, admissionNo } = req.body
    let student
    if (studentId) {
      student = await User.findById(studentId)
    } else if (admissionNo) {
      student = await User.findOne({ admissionNo: admissionNo.trim(), role:'student' })
        || await User.findOne({ admissionNumber: admissionNo.trim(), role:'student' })
    }
    if (!student) return fail(res,404,'Student not found.')

    // Link both ways
    await User.findByIdAndUpdate(req.user._id, { $addToSet:{ linkedStudents:student._id } })
    await User.findByIdAndUpdate(student._id,  { $addToSet:{ linkedParents:req.user._id }, $set:{ parentEmail:req.user.email } })

    return ok(res, { student:{ _id:student._id, firstName:student.firstName, lastName:student.lastName } }, 'Student linked.')
  } catch(e) { return fail(res,e.status||500,e.message) }
})

// ── GET /api/parent/children/:id/timetable ───────────────
router.get('/children/:id/timetable', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).lean()
    if (!student) return fail(res,404,'Student not found.')
    await assertAccess(req.user, student)

    const { studentVisibilityFilter } = require('../lib/scheduling')
    const entries = await TimetableEntry.find(studentVisibilityFilter(student))
      .populate('teacherId','firstName lastName')
      .lean()
    return ok(res, { entries })
  } catch(e) { return fail(res,e.status||500,e.message) }
})

// ── GET /api/parent/children/:id/reports ─────────────────
router.get('/children/:id/reports', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).lean()
    if (!student) return fail(res,404,'Student not found.')
    await assertAccess(req.user, student)

    const { from, to } = req.query
    const dateFilter = {}
    if (from) dateFilter.$gte = new Date(from)
    if (to)   dateFilter.$lte = new Date(to)

    // Exam submissions
    let ExamSubmission, Exam
    try { ExamSubmission = require('../models/ExamSubmission'); Exam = require('../models/Exam') } catch {}

    let examResults = []
    if (ExamSubmission && Exam) {
      // Schema-true fields: the submission stores studentId and examId
      // (an older schema used student/exam; querying those matched
      // nothing and the populate threw, which is why parents saw no
      // marked work). Graded and returned papers are both visible.
      const subs = await ExamSubmission.find({
        studentId: req.params.id,
        status: { $in: ['graded', 'returned'] },
        ...(Object.keys(dateFilter).length ? { submittedAt: dateFilter } : {})
      }).populate('examId','title subject curriculum totalMarks startAt').lean()

      examResults = subs.map(s => {
        const ex = s.examId || {}
        const awarded = (s.totalScore != null && s.totalScore > 0)
          ? s.totalScore
          : (s.answers||[]).reduce((t,a)=>t+(a.marksAwarded||0),0)
        const pct = ex.totalMarks>0 ? Math.round((awarded/ex.totalMarks)*100) : 0
        const isEndTerm = /end.?term|final|terminal/i.test(ex.title||'')
        return {
          _id:        s._id,
          examId:     ex._id,
          title:      ex.title,
          subject:    ex.subject,
          curriculum: ex.curriculum,
          type:       isEndTerm ? 'end-term' : 'weekly',
          score:      pct,
          awarded,
          totalMarks: ex.totalMarks,
          date:       ex.startAt || s.submittedAt,
          // Graded on the child's own curriculum scale (lib/grading.js).
          grade:      require('../lib/grading').gradeFor(student.curriculum, pct, student.gradeLevel),
        }
      }).sort((a,b)=>new Date(b.date)-new Date(a.date))
    }

    // Homework submissions
    let HomeworkSubmission, Homework
    try { HomeworkSubmission = require('../models/HomeworkSubmission'); Homework = require('../models/Homework') } catch {}
    let hwResults = []
    if (HomeworkSubmission) {
      const subs = await HomeworkSubmission.find({ studentId:req.params.id, ...(Object.keys(dateFilter).length?{submittedAt:dateFilter}:{}) })
        .populate('homeworkId','title subject dueDate').lean()
      hwResults = subs.map(s=>({
        _id:s._id, title:s.homeworkId?.title, subject:s.homeworkId?.subject,
        status:s.status, score:s.score||null, dueDate:s.homeworkId?.dueDate, submittedAt:s.submittedAt,
      })).sort((a,b)=>new Date(b.submittedAt)-new Date(a.submittedAt))
    }

    // Attendance summary — per lesson (attended X of Y scheduled lessons);
    // legacy day-register records count for dates before the cutover.
    // Default window: the last 365 days.
    const attTo   = to ? new Date(to) : new Date()
    const attFrom = from ? new Date(from) : new Date(attTo.getTime() - 365*864e5)
    const af = await attendanceFacts.oneStudent(req.params.id, attFrom, attTo, { lessons:false })
    const attSummary = {
      total:     af.scheduled,
      scheduled: af.scheduled,
      attended:  af.attended,
      present:   af.attended,
      absent:    af.scheduled - af.attended,
      late:      af.late,
      rate:      af.rate,
      lessonsScheduled: af.lessonsScheduled, lessonsAttended: af.lessonsAttended,
      legacyDays: af.legacyDays, legacyAttended: af.legacyAttended,
    }

    // End-of-term formal reports
    let formalReports = []
    try {
      const Report = require('../models/Report')
      formalReports = await Report.find({ studentId:req.params.id, status:'published' }).sort({academicYear:-1,term:-1}).lean()
    } catch {}

    // Subject averages
    const bySubject = {}
    examResults.forEach(e => {
      if (!bySubject[e.subject]) bySubject[e.subject]={ scores:[], subject:e.subject }
      bySubject[e.subject].scores.push(e.score)
    })
    const subjectAverages = Object.values(bySubject).map(s=>({
      subject:s.subject,
      avg:Math.round(s.scores.reduce((a,b)=>a+b,0)/s.scores.length),
      count:s.scores.length,
      grade:require('../lib/grading').gradeFor(student.curriculum, Math.round(s.scores.reduce((a,b)=>a+b,0)/s.scores.length), student.gradeLevel),
    })).sort((a,b)=>b.avg-a.avg)

    const overallAvg = examResults.length ? Math.round(examResults.reduce((s,e)=>s+e.score,0)/examResults.length) : null

    return ok(res, {
      student:        { _id:student._id, firstName:student.firstName, lastName:student.lastName, curriculum:student.curriculum, gradeLevel:student.gradeLevel },
      examResults,
      hwResults,
      attSummary,
      formalReports,
      subjectAverages,
      overallAvg,
    })
  } catch(e) { return fail(res,e.status||500,e.message) }
})

// ── GET /api/parent/children/:id/teachers ──────────────
// Teachers allocated to this child (for viewing and rating).
router.get('/children/:id/teachers', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).lean()
    if (!student) return fail(res,404,'Student not found.')
    await assertAccess(req.user, student)
    const Allocation = require('../models/Allocation')
    const allocs = await Allocation.find({ studentId: req.params.id })
      .populate('teacherId','firstName lastName email avatar teachingSpecialties').lean()
    const byTeacher = {}
    allocs.forEach(a => {
      if (!a.teacherId) return
      const k = String(a.teacherId._id)
      if (!byTeacher[k]) byTeacher[k] = { teacher: a.teacherId, subjects: [] }
      const subj = a.subjectName || a.subject || (a.subjectId && a.subjectId.name) || ''
      if (subj && !byTeacher[k].subjects.includes(subj)) byTeacher[k].subjects.push(subj)
    })
    return ok(res, { teachers: Object.values(byTeacher) })
  } catch(e) { return fail(res, e.status||500, e.message) }
})

// ── GET /api/parent/children/:id/liveclasses ────────────
// Upcoming and completed live classes with a done-count.
router.get('/children/:id/liveclasses', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).lean()
    if (!student) return fail(res,404,'Student not found.')
    await assertAccess(req.user, student)
    const LiveClass = require('../models/LiveClass')
    const classes = await LiveClass.find({ assignedStudents: req.params.id, status: { $ne: 'cancelled' } })
      .populate('teacherId','firstName lastName')
      .sort({ startAt: -1, scheduledAt: -1, createdAt: -1 }).limit(120).lean()
    const now = new Date()
    const when = c => new Date(c.startAt || c.scheduledAt || c.date || c.createdAt)
    const past = classes.filter(c => when(c) < now || c.status === 'completed' || c.status === 'ended')
    const upcoming = classes.filter(c => !past.includes(c)).reverse()
    // A class whose time has passed was HELD only if it ended properly or
    // somebody was in the room; otherwise it is 'not_confirmed', never
    // presented to the family as completed.
    const { classOutcome } = require('../lib/scheduling')
    const ClassroomSession = require('../models/ClassroomSession')
    const heldIds = new Set((await ClassroomSession.distinct('liveClassId', {
      liveClassId: { $in: past.map(c => c._id) }, joinCount: { $gt: 0 },
    })).map(String))
    // Published recordings ride along on covered classes, so the
    // portal can offer Watch recording. Only featured ones show;
    // an admin unpublishing a weak recording hides it here too.
    const shape = c => ({
      ...c,
      outcome: classOutcome(c, now, heldIds),
      recordings: (c.recordings || [])
        .filter(r => r.featured)
        .map(r => ({ url: r.url, title: r.title || c.title || '', durationSec: r.durationSec || 0, recordedAt: r.recordedAt })),
    })
    return ok(res, { past: past.map(shape), upcoming: upcoming.map(shape), doneCount: past.filter(c => classOutcome(c, now, heldIds) === 'held').length, totalCount: classes.length })
  } catch(e) { return fail(res, e.status||500, e.message) }
})

// ── GET /api/parent/children/:id/homework ─────────────
// Child homework with submission status and marks.
router.get('/children/:id/homework', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).lean()
    if (!student) return fail(res,404,'Student not found.')
    await assertAccess(req.user, student)

    const Homework = require('../models/Homework')
    const HomeworkSubmission = require('../models/HomeworkSubmission')
    const homeworks = await Homework.find({ assignedStudents: req.params.id, isActive: true })
      .select('title subject curriculum dueAt releaseAt totalMarks questionCount createdAt status')
      .sort({ createdAt: -1 }).limit(30).lean()
    const subs = await HomeworkSubmission.find({ student: req.params.id, homework: { $in: homeworks.map(h => h._id) } })
      .select('homework status submittedAt totalAwarded').lean()
    const byHw = {}
    subs.forEach(x => { byHw[String(x.homework)] = x })
    return ok(res, { homeworks: homeworks.map(h => ({ ...h, submission: byHw[String(h._id)] || null })) })
  } catch(e) { return fail(res, e.status||500, e.message) }
})

// ── GET /api/parent/children/:id/attendance ───────────
router.get('/children/:id/attendance', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).lean()
    if (!student) return fail(res,404,'Student not found.')
    await assertAccess(req.user, student)

    // Per-lesson attendance over the last 90 days; dates before the
    // cutover come from the legacy day register, returned as history.
    const since = new Date(Date.now() - 90 * 24 * 3600 * 1000)
    const f = await attendanceFacts.oneStudent(req.params.id, since, new Date())
    const lessons = [...f.lessons].sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
    const legacy = [...f.legacyRecords].sort((a, b) => new Date(b.date) - new Date(a.date))
    const counts = { attended: f.attended, missed: f.scheduled - f.attended, late: f.late }
    return ok(res, {
      summary: {
        scheduled: f.scheduled, attended: f.attended, late: f.late, rate: f.rate,
        lessonsScheduled: f.lessonsScheduled, lessonsAttended: f.lessonsAttended,
        legacyDays: f.legacyDays, legacyAttended: f.legacyAttended,
      },
      lessons, legacy, records: legacy, counts, since, cutover: attendanceFacts.cutoverDate(),
    })
  } catch(e) { return fail(res, e.status||500, e.message) }
})

// ── GET /api/parent/children/:id/results ──────────────
// ── GET /api/parent/children/:id/exam-results ───
// plus the latest term report summary.
router.get('/children/:id/results', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).lean()
    if (!student) return fail(res,404,'Student not found.')
    await assertAccess(req.user, student)

    const WeeklyReport = require('../models/WeeklyReport')
    const Report = require('../models/Report')
    const weeklies = await WeeklyReport.find({ studentId: req.params.id })
      .select('subject week period assessments createdAt teacherName')
      .sort({ createdAt: -1 }).limit(20).lean()
    const assessments = []
    weeklies.forEach(w => (w.assessments || []).forEach(a => {
      if (a && (a.desc || a.score != null)) assessments.push({
        subject: w.subject, week: w.week, period: w.period, teacherName: w.teacherName,
        desc: a.desc, score: a.score, outOf: a.outOf,
        percentage: a.percentage != null ? a.percentage : (a.score != null && a.outOf ? Math.round(a.score / a.outOf * 100) : null),
        date: w.createdAt,
      })
    }))
    const latestTerm = await Report.findOne({ studentId: req.params.id, status: 'published' })
      .select('term termLabel academicYear overallAverage meanGrade subjects.subject subjects.weightedScore subjects.letterGrade dateIssued')
      .sort({ dateIssued: -1 }).lean()
    return ok(res, { assessments: assessments.slice(0, 40), latestTerm })
  } catch(e) { return fail(res, e.status||500, e.message) }
})

// ── GET /api/parent/children/:id/fees ────────────────────
router.get('/children/:id/fees', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('firstName lastName email agreedFee feeCurrency billingDay nextDueDate lastPaidDate billingNote')
      .lean()
    if (!student) return fail(res,404,'Student not found.')
    await assertAccess(req.user, student)

    // All invoices for this student: linked by studentId, or (older
    // invoices) billed to the student's email. Cancelled invoices are
    // kept on record but are not owed, so parents don't see them.
    const or = [{ studentId: student._id }]
    if (student.email) or.push({ billedToEmail: String(student.email).toLowerCase() })
    const invoices = await Invoice.find({ $or: or, status: { $ne: 'cancelled' } })
      .sort({ createdAt:-1 })
      .lean()

    const paid    = invoices.filter(i=>i.status==='paid')
    const pending = invoices.filter(i=>i.status!=='paid')

    // Next due info
    const today = new Date()
    const nextDue = student.nextDueDate ? new Date(student.nextDueDate) : null
    const daysUntil = nextDue ? Math.ceil((nextDue-today)/86400000) : null

    return ok(res, {
      student,
      billing: {
        agreedFee:   student.agreedFee||0,
        feeCurrency: student.feeCurrency||'USD',
        billingDay:  student.billingDay||15,
        nextDueDate: nextDue,
        lastPaidDate:student.lastPaidDate,
        daysUntilDue:daysUntil,
        billingNote: student.billingNote||'',
        status:      !nextDue?'no-fee':daysUntil<0?'overdue':daysUntil<=3?'due-soon':'current',
      },
      invoices,
      paid,
      pending,
    })
  } catch(e) { return fail(res,e.status||500,e.message) }
})

// ── Access guard ──────────────────────────────────────────
async function assertAccess(reqUser, student) {
  if (['admin','dos','accountant','ops_manager'].includes(reqUser.role)) return
  if (reqUser.role==='parent') {
    const parent = await User.findById(reqUser._id).select('linkedStudents email').lean()
    const linked = (parent?.linkedStudents||[]).map(String)
    const byEmail = student.parentEmail === reqUser.email
    if (!linked.includes(String(student._id)) && !byEmail)
      throw Object.assign(new Error('Not authorised to view this student.'), {status:403})
    return
  }
  // Any other role (student, teacher, …) has no business in the parent
  // portal's child views: previously they fell through and were allowed.
  throw Object.assign(new Error('Not authorised to view this student.'), {status:403})
}

// ── Class reminder function ───────────────────────────────
// Called every minute. Reads the REAL classes (LiveClass), so a lesson
// a teacher moved is announced at its new time, a cancelled one is not
// announced at all, and clubs/events get reminders too. Who has been
// reminded is stored on the class itself (remindedRecipients), so a
// restart or a second server never repeats a reminder, and a failed send
// is retried on the next sweep until the class starts.
const {
  reminderWindow, reminderStudents, classTypeLabel,
} = require('../lib/scheduling')
const { zonedParts, zonedHHMM, DEFAULT_TZ } = require('../lib/schoolTime')

async function pausedStudentIds(ids, now) {
  if (!ids.length) return []
  try {
    const StudentPause = require('../models/StudentPause')
    return await StudentPause.distinct('student', {
      student: { $in: ids }, status: 'active', startAt: { $lte: now },
      $or: [{ expectedEnd: null }, { expectedEnd: { $gt: now } }],
    })
  } catch { return [] }
}

async function sendClassReminders() {
  const t = getTransporter()
  if (!t) return 0
  const LiveClass = require('../models/LiveClass')
  const now = new Date()
  const { from, to } = reminderWindow(now)

  const classes = await LiveClass.find({
    status: 'scheduled', reminderSentAt: null, scheduledAt: { $gte: from, $lte: to },
  })
    .populate('teacherId', 'firstName lastName email')
    .populate('assignedStudents', 'firstName lastName parentEmail linkedParents parentId email parentName onBreak timezone deliveryMode archived studentStatus')
    .lean()

  const { inPersonLesson } = require('../lib/learningMode')
  const { hasLeft } = require('../lib/studentExit')
  let sent = 0
  for (const cls of classes) {
    const done = new Set(cls.remindedRecipients || [])
    const ids = (cls.assignedStudents || []).filter(s => s && s._id).map(s => s._id)
    const students = reminderStudents(cls, { pausedIds: await pausedStudentIds(ids, now) })
    const newlyDone = []
    let failed = false

    for (const student of students) {
      // In-person lessons need no join reminder: the family had tomorrow's
      // timetable the evening before (lib/dailyTimetable.js).
      if (inPersonLesson(cls, student)) { newlyDone.push(String(student._id)); continue }
      // Graduated or left: never reminded, even if still on the lesson.
      if (hasLeft(student)) { newlyDone.push(String(student._id)); continue }
      const resolved = await resolveStudentRecipients(student, { includeStudent: true, category: 'classReminders' })
      if (!resolved.to.length) {
        console.warn(`[class reminder] ${student.firstName} ${student.lastName}: no valid email address on file — skipped`)
        newlyDone.push(String(student._id))
        continue
      }
      try {
        await t.sendMail({
          from:    process.env.EMAIL_FROM || 'Smartious <hello@smartioushomeschool.com>',
          to:      resolved.to.join(', '),
          subject: `Class reminder — ${classHeadline(cls)} starts in 30 minutes`,
          html:    buildClassReminderEmail(student, cls),
        })
        newlyDone.push(String(student._id))
        sent++
        console.log(`[class reminder] ${classHeadline(cls)} · ${student.firstName} ${student.lastName} → ${describeRecipients(resolved)}`)
      } catch (e) {
        // A permanent refusal (bad address) is not retried every minute:
        // mailPolicy has suppressed the address. Only temporary faults retry.
        if (require('../lib/mailSuppression').isPermanentError(e)) newlyDone.push(String(student._id))
        else failed = true
        console.error('[class reminder]', resolved.to.join(', '), e.message)
      }
    }

    // The teacher is reminded too, once per class.
    const teacher = cls.teacherId
    if (teacher && teacher.email && !done.has('teacher')) {
      try {
        await t.sendMail({
          from:    process.env.EMAIL_FROM || 'Smartious <hello@smartioushomeschool.com>',
          to:      teacher.email,
          subject: `Your class starts in 30 minutes — ${classHeadline(cls)}`,
          html:    buildClassReminderEmail(null, cls),
        })
        newlyDone.push('teacher')
        sent++
      } catch (e) {
        if (require('../lib/mailSuppression').isPermanentError(e)) newlyDone.push('teacher')
        else failed = true
        console.error('[class reminder] teacher', teacher.email, e.message)
      }
    } else if (!done.has('teacher')) newlyDone.push('teacher')

    const update = { $addToSet: { remindedRecipients: { $each: newlyDone } } }
    if (!failed) update.$set = { reminderSentAt: new Date() }
    try { await LiveClass.updateOne({ _id: cls._id }, update) } catch (e) { console.error('[class reminder] could not record:', e.message) }
  }

  if (sent > 0) console.log(`[class reminder] Sent ${sent} class reminders`)
  return sent
}

function classHeadline(cls) {
  const topic = cls.syllabusTopicName
    ? ' — ' + cls.syllabusTopicName + (cls.syllabusSubtopicName ? ': ' + cls.syllabusSubtopicName : '')
    : ''
  return (cls.subject || cls.title || 'Class') + topic
}

const escHtml = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// student = null → the teacher's copy.
function buildClassReminderEmail(student, cls) {
  const teacherName = cls.teacherId ? `${cls.teacherId.firstName} ${cls.teacherId.lastName}` : 'Your teacher'
  const typeLabel = classTypeLabel(cls)
  const tz = DEFAULT_TZ
  const start = new Date(cls.scheduledAt)
  const end = new Date(start.getTime() + (cls.durationMins || 60) * 60000)
  const p = zonedParts(start, tz)
  const day = new Date(Date.UTC(p.year, p.month - 1, p.day)).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  const who = student ? `${escHtml(student.firstName)} ${escHtml(student.lastName)}` : escHtml(teacherName)
  const lead = student
    ? `<strong>${escHtml(student.firstName)}</strong>'s ${typeLabel.toLowerCase()} starts in <strong>30 minutes</strong>.`
    : `Your ${typeLabel.toLowerCase()} starts in <strong>30 minutes</strong>.`
  const note = student ? `This reminder has been sent to ${escHtml(student.firstName)} and to their parents.` : 'Please open the classroom a few minutes early.'
  const portal = student ? 'https://smartioushomeschool.com/student' : 'https://smartioushomeschool.com/teacher'
  const rows = [['Subject', `<strong>${escHtml(classHeadline(cls))}</strong>`], ['Type', typeLabel],
    ['Time', `<strong>${fmtTime(zonedHHMM(start, tz))} – ${fmtTime(zonedHHMM(end, tz))}</strong> (Nairobi time)` +
      (student && student.timezone && student.timezone !== tz ? `<br>${fmtTime(zonedHHMM(start, student.timezone))} – ${fmtTime(zonedHHMM(end, student.timezone))} your time` : '')],
    ['Teacher', escHtml(teacherName)], ['Day', day]]
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6;">
<tr><td style="background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:24px 32px;">
  <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px">Smartious Homeschool · Class Reminder</div>
  <div style="font-size:20px;font-weight:800;color:#fff;">Class starting in 30 minutes</div>
  <div style="font-size:13px;color:rgba(255,255,255,.65);margin-top:4px;">${who}</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 8px;line-height:1.65;">${lead}</p>
  <p style="font-size:12px;color:#6B6B6B;margin:0 0 20px;line-height:1.6;">${note}</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;border-radius:8px;border:1px solid #E8E2D6;margin-bottom:24px;">
  <tr><td style="padding:16px 20px;">
    <table width="100%">
      ${rows.map(([l, v]) => `
      <tr><td style="font-size:12px;font-weight:700;color:#6B6B6B;text-transform:uppercase;letter-spacing:.06em;padding-bottom:6px;">${l}</td><td style="font-size:13px;color:#1A1A1A;padding-bottom:6px;text-align:right;">${v}</td></tr>`).join('')}
    </table>
  </td></tr></table>
  <a href="${portal}" style="display:block;background:#7D1025;color:#fff;text-align:center;padding:13px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">
    ${student ? 'Go to student portal' : 'Go to teacher portal'}
  </a>
</td></tr>
<tr><td style="background:#FDFAF4;padding:14px 32px;border-top:1px solid #E8E2D6;">
  <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool Global</p>
</td></tr>
</table></td></tr></table></body></html>`
}

module.exports = router
module.exports.sendClassReminders = sendClassReminders
