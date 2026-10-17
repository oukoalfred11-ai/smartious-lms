/**
 * services/showCauseCron.js
 * Thursday 5 PM EAT: reminder listing the weekly reports still owed.
 * Friday 5 PM EAT: for every student a teacher taught this week with no
 * published report (lib/weeklyReportsDue.js), a show-cause email and a
 * 0.3 rating deduction (once per student per week).
 */
const User          = require('../models/User')
const TeacherRating = require('../models/TeacherRating')

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

async function runShowCauseCheck({ reminder = false } = {}) {
  console.log(reminder ? '[show-cause] Running Thursday reminder...' : '[show-cause] Running Friday 5PM check...')
  const t = getTransporter()

  // Monday 00:00 Nairobi of the current week, whatever the server's zone.
  const { reportsDue, teachersWithLessons, weekStart } = require('../lib/weeklyReportsDue')
  const now    = new Date()
  const monday = weekStart(now)

  let issued = 0, missing = 0

  // Teachers who taught this week. The same reportsDue() drives the
  // teacher's "Reports due this week" list, so a report the teacher sees
  // as published is never chased here.
  const teacherIds = await teachersWithLessons(monday, now)

  for (const teacherId of teacherIds) {
    const teacher = await User.findById(teacherId)
      .select('firstName lastName email isOnLeave leaveStartDate leaveEndDate').lean()
    if (!teacher) continue

    // A teacher on approved leave this week is not chased.
    if (teacher.isOnLeave && (!teacher.leaveEndDate || new Date(teacher.leaveEndDate) >= monday)) { issued++; continue }

    const due = await reportsDue(teacherId, { monday, until: now })
    const missingStudents = due.items.filter(x => !x.cleared && !x.student.onBreak).map(x => x.student)

    if (missingStudents.length === 0) { issued++; continue }
    missing += missingStudents.length

    // Thursday: a friendly reminder, no deduction.
    if (reminder) {
      if (t && teacher.email) {
        try {
          await t.sendMail({
            from: process.env.EMAIL_FROM || 'Smartious <hello@smartioushomeschool.com>',
            to: teacher.email,
            subject: `Reminder: ${missingStudents.length} weekly report${missingStudents.length > 1 ? 's' : ''} due by Friday 5 PM`,
            html: `<p>Dear ${teacher.firstName},</p><p>This week's report is still to be published for:</p><ul>${missingStudents.map(x => `<li>${x.firstName} ${x.lastName}</li>`).join('')}</ul><p>Please publish by <strong>Friday 5:00 PM (Nairobi time)</strong> to avoid a show-cause notice. In the teacher portal open <strong>Reports</strong>, pick the student and press <strong>Publish</strong>.</p><p><a href="https://smartioushomeschool.com/teacher">Open the teacher portal</a></p>`,
          })
        } catch (e) { console.error('[show-cause reminder]', teacher.email, e.message) }
      }
      continue
    }

    // Apply 0.3 deduction per missing report
    const systemUser = await User.findOne({ role:'ops_manager' }).select('_id').lean()
    const raterId = systemUser?._id || teacher._id

    // Idempotent: a restart during the 5 PM hour must not deduct twice.
    let fresh = 0
    for (const student of missingStudents) {
      try {
        let rating = await TeacherRating.findOne({ teacherId, raterId })
        if (!rating) {
          rating = await TeacherRating.create({
            teacherId, raterId,
            raterRole:'parent', raterName:'System (Auto)', score:5, comment:'',
          })
        }
        const reason = `Report not issued for ${student.firstName} ${student.lastName} by Friday 5PM — week of ${monday.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Nairobi'})}`
        if ((rating.showCauseDeductions || []).some(d => d.reason === reason)) continue
        rating.showCauseDeductions.push({ amount: 0.3, reason, date: new Date() })
        await rating.save()
        fresh++
      } catch(e) { console.error('[show-cause rating]', e.message) }
    }
    if (!fresh) continue

    // Send show-cause email to teacher
    if (t && teacher.email) {
      const studentList = missingStudents.map(s=>`<li>${s.firstName} ${s.lastName}</li>`).join('')
      const weekLabel = monday.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Nairobi'})

      try {
        await t.sendMail({
          from: process.env.EMAIL_FROM||'Smartious COO <hello@smartioushomeschool.com>',
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

// Schedule: Thursday 5 PM EAT reminder, Friday 5 PM EAT show cause.
// Checked every 10 minutes against Nairobi time (robust to restarts and
// to the server's own time zone); each run happens once per day.
let lastRun = ''
function scheduleShowCauseCron() {
  const { zonedParts, zonedDayKey } = require('../lib/schoolTime')
  const tick = () => {
    const now = new Date()
    const p = zonedParts(now, 'Africa/Nairobi')
    if (p.hour !== 17 || !['Thu', 'Fri'].includes(p.weekday)) return
    const key = zonedDayKey(now, 'Africa/Nairobi')
    if (lastRun === key) return
    lastRun = key
    runShowCauseCheck({ reminder: p.weekday === 'Thu' }).catch(e => console.error('[show-cause cron]', e.message))
  }
  setInterval(tick, 10 * 60 * 1000)
  console.log('[show-cause] Scheduled: Thursday 5 PM reminder, Friday 5 PM check (Nairobi time)')
}

module.exports = { runShowCauseCheck, scheduleShowCauseCron }
