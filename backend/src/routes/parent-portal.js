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
const TimetableEntry = require('../models/TimetableEntry')
const Attendance     = require('../models/Attendance')
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
  } catch(e) { return fail(res,500,e.message) }
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
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/parent/children/:id/timetable ───────────────
router.get('/children/:id/timetable', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).lean()
    if (!student) return fail(res,404,'Student not found.')
    await assertAccess(req.user, student)

    const entries = await TimetableEntry.find({ assignedStudents:req.params.id, isActive:true })
      .populate('teacherId','firstName lastName')
      .lean()
    return ok(res, { entries })
  } catch(e) { return fail(res,500,e.message) }
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
      const subs = await ExamSubmission.find({
        student: req.params.id,
        status: 'graded',
        ...(Object.keys(dateFilter).length ? { submittedAt: dateFilter } : {})
      }).populate('exam','title subject curriculum totalMarks startAt').lean()

      examResults = subs.map(s => {
        const awarded = (s.answers||[]).reduce((t,a)=>t+(a.marksAwarded||0),0)
        const pct = s.exam?.totalMarks>0 ? Math.round((awarded/s.exam.totalMarks)*100) : 0
        const isEndTerm = /end.?term|final|terminal/i.test(s.exam?.title||'')
        return {
          _id:        s._id,
          examId:     s.exam?._id,
          title:      s.exam?.title,
          subject:    s.exam?.subject,
          curriculum: s.exam?.curriculum,
          type:       isEndTerm ? 'end-term' : 'weekly',
          score:      pct,
          awarded,
          totalMarks: s.exam?.totalMarks,
          date:       s.exam?.startAt || s.submittedAt,
          grade:      pct>=80?'A*':pct>=70?'B':pct>=60?'C':pct>=50?'D':pct>=40?'E':'U',
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

    // Attendance summary
    const attFilter = { studentId:req.params.id }
    if (Object.keys(dateFilter).length) attFilter.date = dateFilter
    const attRecords = await Attendance.find(attFilter).lean()
    const attSummary = {
      total:   attRecords.length,
      present: attRecords.filter(r=>r.status==='present').length,
      absent:  attRecords.filter(r=>r.status==='absent').length,
      late:    attRecords.filter(r=>r.checkInStatus==='late').length,
      rate:    attRecords.length ? Math.round((attRecords.filter(r=>r.status==='present').length/attRecords.length)*100) : null,
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
      grade:(avg=>avg>=80?'A*':avg>=70?'B':avg>=60?'C':avg>=50?'D':avg>=40?'E':'U')(Math.round(s.scores.reduce((a,b)=>a+b,0)/s.scores.length)),
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
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/parent/children/:id/fees ────────────────────
router.get('/children/:id/fees', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('firstName lastName email agreedFee feeCurrency billingDay nextDueDate lastPaidDate billingNote')
      .lean()
    if (!student) return fail(res,404,'Student not found.')
    await assertAccess(req.user, student)

    // All invoices for this student
    const invoices = await Invoice.find({ billedToEmail: student.email })
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
  } catch(e) { return fail(res,500,e.message) }
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
  }
}

// ── Class reminder function ───────────────────────────────
// Called by cron every minute; sends email 30min before class starts
async function sendClassReminders() {
  const t = getTransporter()
  if (!t) return 0

  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const now     = new Date()
  const eat     = new Date(now.getTime() + 3*60*60*1000)  // UTC+3
  const dayName = DAYS[eat.getDay()]
  const nowMins = eat.getHours()*60 + eat.getMinutes()
  const target  = nowMins + 30  // classes starting in 30 minutes

  // Find timetable entries starting in 30±2 minutes
  const entries = await TimetableEntry.find({ dayOfWeek:dayName, isActive:true })
    .populate('teacherId','firstName lastName')
    .populate('assignedStudents','firstName lastName parentEmail linkedParents email parentName onBreak')
    .lean()

  const upcoming = entries.filter(e => {
    if (!e.startTime) return false
    const [h,m] = e.startTime.split(':').map(Number)
    const slotMins = h*60+m
    return Math.abs(slotMins - target) <= 2
  })

  let sent = 0
  for (const entry of upcoming) {
    for (const student of (entry.assignedStudents||[])) {
      if (student.onBreak) continue // paused students receive no class reminders
      // Collect parent emails: parentEmail field + linked parent accounts
      const parentEmails = new Set()
      if (student.parentEmail) parentEmails.add(student.parentEmail)

      // Get linked parent account emails
      if (student.linkedParents?.length) {
        const parents = await User.find({ _id:{ $in:student.linkedParents } }).select('email').lean()
        parents.forEach(p => parentEmails.add(p.email))
      }

      for (const email of parentEmails) {
        try {
          await t.sendMail({
            from:    process.env.EMAIL_FROM || 'Smartious <hellosmartious@gmail.com>',
            to:      email,
            subject: `Class reminder — ${entry.subject} starts in 30 minutes`,
            html:    buildClassReminderEmail(student, entry),
          })
          sent++
        } catch(e) { console.error('[class reminder]', email, e.message) }
      }
    }
  }

  if (sent > 0) console.log(`[class reminder] Sent ${sent} class reminders`)
  return sent
}

function buildClassReminderEmail(student, entry) {
  const teacherName = entry.teacherId ? `${entry.teacherId.firstName} ${entry.teacherId.lastName}` : 'Your teacher'
  const isFri = entry.dayOfWeek === 'Fri'
  const typeLabel = isFri ? 'Assessment / Activities' : 'Lesson'
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6;">
<tr><td style="background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:24px 32px;">
  <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px">Smartious Homeschool · Class Reminder</div>
  <div style="font-size:20px;font-weight:800;color:#fff;">Class starting in 30 minutes</div>
  <div style="font-size:13px;color:rgba(255,255,255,.65);margin-top:4px;">${student.firstName} ${student.lastName}</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 20px;line-height:1.65;">
    This is a reminder that <strong>${student.firstName}</strong>'s ${typeLabel.toLowerCase()} starts in <strong>30 minutes</strong>.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;border-radius:8px;border:1px solid #E8E2D6;margin-bottom:24px;">
  <tr><td style="padding:16px 20px;">
    <table width="100%">
      ${[['Subject',`<strong>${entry.subject}</strong>`],['Type',typeLabel],['Time',`<strong>${fmtTime(entry.startTime)} – ${fmtTime(entry.endTime)}</strong>`],['Teacher',teacherName],['Day',entry.dayOfWeek]].map(([l,v])=>`
      <tr><td style="font-size:12px;font-weight:700;color:#6B6B6B;text-transform:uppercase;letter-spacing:.06em;padding-bottom:6px;">${l}</td><td style="font-size:13px;color:#1A1A1A;padding-bottom:6px;text-align:right;">${v}</td></tr>`).join('')}
    </table>
  </td></tr></table>
  <a href="https://smartioushomeschool.com/student" style="display:block;background:#7D1025;color:#fff;text-align:center;padding:13px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">
    Go to student portal
  </a>
</td></tr>
<tr><td style="background:#FDFAF4;padding:14px 32px;border-top:1px solid #E8E2D6;">
  <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool Global</p>
</td></tr>
</table></td></tr></table></body></html>`
}

module.exports = router
module.exports.sendClassReminders = sendClassReminders
