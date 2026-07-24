/**
 * services/showCauseCron.js
 * Every Friday at 5 PM EAT:
 * - Find all active students with teachers assigned
 * - Check if teacher has published a report for this student this week
 * - If not, send show-cause email to teacher and apply 0.3 rating deduction
 */
const User          = require('../models/User')
const Report        = require('../models/Report')
const TeacherRating = require('../models/TeacherRating')
const TimetableEntry = require('../models/TimetableEntry')

function getTransporter() {
  const nodemailer = require('nodemailer')
  const u = process.env.EMAIL_USER, p = process.env.EMAIL_PASSWORD
  if (!u||!p) return null
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST||'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT||'587',10),
    secure: false,
    auth:{ user:u, pass:p },
  })
}

async function runShowCauseCheck() {
  console.log('[show-cause] Running Friday 5PM check...')
  const t = getTransporter()

  // Get the current week's Monday-Friday date range
  const now    = new Date()
  const eat    = new Date(now.getTime() + 3*60*60*1000)
  const monday = new Date(eat)
  monday.setDate(eat.getDate() - eat.getDay() + 1)
  monday.setHours(0,0,0,0)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  friday.setHours(23,59,59,999)

  // Get all active timetable entries with teacher assigned
  const entries = await TimetableEntry.find({ isActive:true, teacherId:{ $exists:true } })
    .populate('teacherId','firstName lastName email _id')
    .populate('assignedStudents','firstName lastName _id')
    .lean()

  // Build map: teacherId → set of studentIds they teach
  const teacherStudentMap = {}
  entries.forEach(e => {
    if (!e.teacherId) return
    const tid = String(e.teacherId._id)
    if (!teacherStudentMap[tid]) teacherStudentMap[tid] = { teacher:e.teacherId, students:new Set(), subjects:new Set() }
    ;(e.assignedStudents||[]).forEach(s => teacherStudentMap[tid].students.add(String(s._id)))
    if (e.subject) teacherStudentMap[tid].subjects.add(e.subject)
  })

  let issued = 0, missing = 0

  for (const [teacherId, info] of Object.entries(teacherStudentMap)) {
    const { teacher, students, subjects } = info
    if (!students.size) continue

    const missingStudents = []

    for (const studentId of students) {
      // Check if teacher has published a report this week for this student
      const report = await Report.findOne({
        teacherId,
        studentId,
        status: 'published',
        updatedAt: { $gte: monday, $lte: friday },
      }).lean()

      if (!report) {
        const student = await User.findById(studentId).select('firstName lastName').lean()
        if (student) missingStudents.push(student)
      }
    }

    if (missingStudents.length === 0) { issued++; continue }
    missing += missingStudents.length

    // Apply 0.3 deduction per missing report
    const systemUser = await User.findOne({ role:'ops_manager' }).select('_id').lean()
    const raterId = systemUser?._id || teacher._id

    for (const student of missingStudents) {
      try {
        let rating = await TeacherRating.findOne({ teacherId, raterId })
        if (!rating) {
          rating = await TeacherRating.create({
            teacherId, raterId,
            raterRole:'parent', raterName:'System (Auto)', score:5, comment:'',
          })
        }
        rating.showCauseDeductions.push({
          amount: 0.3,
          reason: `Report not issued for ${student.firstName} ${student.lastName} by Friday 5PM — week of ${monday.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`,
          date: new Date(),
        })
        await rating.save()
      } catch(e) { console.error('[show-cause rating]', e.message) }
    }

    // Send show-cause email to teacher
    if (t && teacher.email) {
      const studentList = missingStudents.map(s=>`<li>${s.firstName} ${s.lastName}</li>`).join('')
      const weekLabel = monday.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})

      try {
        await t.sendMail({
          from: process.env.EMAIL_FROM||'Smartious COO <hellosmartious@gmail.com>',
          to: teacher.email,
          subject: `SHOW CAUSE NOTICE — Weekly reports not submitted — Smartious`,
          html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center"><table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6;">
<tr><td style="background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:24px 32px;">
  <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px">Smartious Homeschool Global · Office of the COO</div>
  <div style="font-size:20px;font-weight:800;color:#fff;">SHOW CAUSE NOTICE</div>
  <div style="font-size:13px;color:rgba(255,255,255,.65);margin-top:4px;">${teacher.firstName} ${teacher.lastName}</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 16px;line-height:1.7;">Dear ${teacher.firstName},</p>
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 16px;line-height:1.7;">
    This notice is issued because <strong>weekly academic reports were not submitted</strong> by the required deadline of <strong>Friday 5:00 PM EAT</strong> for the week ending <strong>${weekLabel}</strong>.
  </p>
  <p style="font-size:13px;font-weight:700;color:#7D1025;margin:0 0 8px;">Reports not submitted for:</p>
  <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;color:#2c2c2c;line-height:1.8;">${studentList}</ul>
  <div style="background:#FEF2F2;border:1px solid #FECACA;border-left:4px solid #991B1B;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
    <p style="font-size:13px;font-weight:700;color:#991B1B;margin:0 0 6px;">Action required</p>
    <p style="font-size:13px;color:#7F1D1D;margin:0;line-height:1.6;">
      Please submit the above reports <strong>immediately</strong> and reply to this notice with the reasons for the delay. Failure to respond within 24 hours may result in further disciplinary action.
    </p>
  </div>
  <p style="font-size:12px;color:#6B6B6B;margin:0 0 20px;font-style:italic;">
    Note: A deduction of 0.3 points has been applied to your performance rating for each missing report.
  </p>
  <a href="https://smartioushomeschool.com/teacher" style="display:block;background:#7D1025;color:#fff;text-align:center;padding:13px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Submit reports now</a>
</td></tr>
<tr><td style="background:#FDFAF4;padding:14px 32px;border-top:1px solid #E8E2D6;">
  <p style="font-size:11px;color:#999;margin:0;">Smartious Homeschool Global · Office of the COO · This is an automated notice.</p>
</td></tr>
</table></td></tr></table></body></html>`,
        })
        console.log(`[show-cause] Email sent to ${teacher.email} for ${missingStudents.length} missing report(s)`)
      } catch(e) { console.error('[show-cause email]', teacher.email, e.message) }
    }
  }

  console.log(`[show-cause] Done — ${issued} teachers compliant, ${missing} missing reports, deductions applied`)
  return { issued, missing }
}

// Schedule: every Friday at 5 PM EAT
function scheduleShowCauseCron() {
  const checkAndSchedule = () => {
    const now  = new Date()
    const eat  = new Date(now.getTime() + 3*60*60*1000)
    const next = new Date(eat)
    // Find next Friday
    const daysUntilFri = (5 - eat.getDay() + 7) % 7 || 7
    next.setDate(eat.getDate() + daysUntilFri)
    next.setHours(17,0,0,0)
    const ms = next.getTime() - eat.getTime()
    console.log(`[show-cause] Next check: ${next.toLocaleDateString('en-GB')} 5:00 PM EAT (in ${Math.round(ms/3600000)}h)`)
    setTimeout(() => {
      runShowCauseCheck().catch(e => console.error('[show-cause cron]', e.message))
      setInterval(() => runShowCauseCheck().catch(e => console.error('[show-cause cron]', e.message)), 7*24*60*60*1000)
    }, ms)
  }
  checkAndSchedule()
}

module.exports = { runShowCauseCheck, scheduleShowCauseCron }
