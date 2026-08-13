/**
 * routes/weekly-reports.js
 * Mounted at /api/weekly-reports
 *
 * POST /api/weekly-reports/save          — teacher creates/updates (auto-save)
 * GET  /api/weekly-reports/my            — teacher: list all their reports
 * GET  /api/weekly-reports/student/:id   — parent/admin: reports for a student
 * GET  /api/weekly-reports/:id           — get one report
 * GET  /api/weekly-reports/:id/html      — printable HTML
 * POST /api/weekly-reports/:id/publish   — publish + notify parent
 */
const express      = require('express')
const router       = express.Router()
const nodemailer   = require('nodemailer')
const { auth, requireRole } = require('../middleware/auth')
const WeeklyReport = require('../models/WeeklyReport')
const User         = require('../models/User')

const ok   = (res,data,msg) => res.json({ success:true, data, message:msg||'' })
const fail = (res,code,msg) => res.status(code).json({ success:false, message:msg })

function getTransporter() {
  const u = process.env.EMAIL_USER, p = process.env.EMAIL_PASSWORD
  if (!u||!p) return null
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST||'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT||'587',10),
    secure: false, auth:{ user:u, pass:p },
  })
}

// ── POST /save ────────────────────────────────────────────
router.post('/save', auth, requireRole('admin','ops_manager','dos','teacher'), async (req, res) => {
  try {
    const {
      studentId, studentName, subject, classLevel, week, period,
      topics, subTopics, activities, homework, strengths, improvements,
      assessments, understanding, participation, generalPerf, remarks,
      publish, _id,
    } = req.body

    // Resolve student
    let student = null
    if (studentId) {
      student = await User.findById(studentId)
        .select('firstName lastName email parentEmail linkedParents curriculum gradeLevel').lean()
    }
    const sName      = student ? `${student.firstName} ${student.lastName}` : (studentName||'').trim()
    const sEmail     = student?.email || ''
    const pEmail     = student?.parentEmail || ''
    if (!sName) return fail(res, 400, 'Student name is required.')
    if (!subject) return fail(res, 400, 'Subject is required.')

    // Compute averages
    const validAss = (assessments||[]).filter(a => a.score !== '' && a.score !== null && parseFloat(a.outOf||100) > 0)
    const scores   = validAss.map(a => ({
      desc: a.desc||'', score: parseFloat(a.score)||0,
      outOf: parseFloat(a.outOf)||100,
      percentage: Math.round((parseFloat(a.score||0)/parseFloat(a.outOf||100))*100),
    }))
    const avg  = scores.length ? Math.round(scores.reduce((s,a)=>s+a.percentage,0)/scores.length) : null
    const grade = avg===null?'':(avg>=80?'A*':avg>=70?'A':avg>=60?'B':avg>=50?'C':avg>=40?'D':'E')

    const yearStr = new Date().getFullYear()+'/'+(new Date().getFullYear()+1)
    const teacher = await User.findById(req.user._id).select('firstName lastName').lean()
    const tName   = teacher ? `${teacher.firstName} ${teacher.lastName}` : ''

    const data = {
      teacherId:req.user._id, teacherName:tName,
      studentId:student?._id||null, studentName:sName,
      studentEmail:sEmail, parentEmail:pEmail,
      subject, classLevel:classLevel||student?.gradeLevel||'',
      curriculum:student?.curriculum||'',
      week:week||'', period:period||'Term 1', academicYear:yearStr,
      topics:(topics||[]).filter(Boolean),
      subTopics:(subTopics||[]).filter(Boolean),
      activities:(activities||[]).filter(Boolean),
      homework:(homework||[]).filter(Boolean),
      strengths:(strengths||[]).filter(Boolean),
      improvements:(improvements||[]).filter(Boolean),
      assessments:scores,
      understanding:understanding||'', participation:participation||'',
      generalPerf:generalPerf||'', remarks:remarks||'',
      overallAverage:avg, meanGrade:grade,
      status: publish ? 'published' : 'draft',
    }

    let report
    if (_id) {
      // Update existing
      report = await WeeklyReport.findOneAndUpdate(
        { _id, teacherId:req.user._id },
        { $set: data },
        { new:true }
      )
      if (!report) return fail(res, 404, 'Report not found.')
    } else {
      // Try to find existing draft for same teacher+student+subject+week
      const existing = await WeeklyReport.findOne({
        teacherId: req.user._id,
        studentName: sName,
        subject,
        week: week||'',
        academicYear: yearStr,
      })
      if (existing) {
        Object.assign(existing, data)
        report = await existing.save()
      } else {
        report = await WeeklyReport.create(data)
      }
    }

    // Notify ONLY when publishing, and only once per report.
    //
    // This previously emailed on EVERY save, draft included, so a teacher
    // who saved a draft four times while writing sent the parent four
    // emails before the report even existed properly — then a fifth on
    // publish. A draft is work in progress and is not something a parent
    // should hear about at all.
    let emailSent = false
    const alreadyNotified = !!report.parentEmailSent
    const shouldNotify = publish && !alreadyNotified
    const emailTargets = shouldNotify ? await getParentEmails(student, pEmail) : []
    if (emailTargets.length) {
      emailSent = await sendParentNotification(report, emailTargets, publish)
      if (emailSent) {
        report.parentEmailSent  = true
        report.parentNotifiedAt = new Date()
        await report.save()
      }
    }

    const msg = publish
      ? `Report published.${emailSent ? ' Parent notified by email.'
          : alreadyNotified ? ' Parent was already notified.'
          : ' (No parent email on file)'}`
      : 'Draft saved. The parent is notified when you publish.'

    return ok(res, { report }, msg)
  } catch(e) {
    console.error('[weekly-reports save]', e.message)
    return fail(res, 500, e.message)
  }
})

// ── GET /my ───────────────────────────────────────────────
router.get('/my', auth, requireRole('admin','ops_manager','dos','teacher'), async (req, res) => {
  try {
    const filter = req.user.role === 'teacher' ? { teacherId:req.user._id } : {}
    const reports = await WeeklyReport.find(filter)
      .sort({ updatedAt:-1 })
      .select('studentName subject week period academicYear status overallAverage meanGrade updatedAt parentEmailSent parentNotifiedAt studentId')
      .lean()
    return ok(res, { reports })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /student/:id ──────────────────────────────────────
router.get('/student/:id', auth, async (req, res) => {
  try {
    const role = req.user.role
    const staff = ['admin','ops_manager','dos','accountant','teacher'].includes(role)
    const isSelf = role === 'student' && String(req.params.id) === String(req.user._id)
    const isParent = role === 'parent' && [ ...(req.user.linkedStudents||[]), ...(req.user.children||[]) ]
      .map(String).includes(String(req.params.id))
    if (!staff && !isSelf && !isParent)
      return fail(res,403,'Access denied.')
    const reports = await WeeklyReport.find({ studentId:req.params.id })
      .sort({ updatedAt:-1 }).lean()
    return ok(res, { reports })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /:id ──────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id).lean()
    if (!report) return fail(res,404,'Report not found.')
    return ok(res, { report })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /:id/html ─────────────────────────────────────────
router.get('/:id/html', auth, async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id)
      .populate('teacherId','firstName lastName')
      .lean()
    if (!report) return fail(res,404,'Report not found.')
    return ok(res, { html: buildReportHTML(report) })
  } catch(e) { return fail(res,500,e.message) }
})

// ── POST /:id/publish ─────────────────────────────────────
// ── GET /api/weekly-reports/:id/pdf ─────────────────
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const { buildWeeklyReportPdf } = require('../lib/reportPdf')
    const report = await WeeklyReport.findById(req.params.id).lean()
    if (!report) return res.status(404).json({ success:false, message:'Report not found.' })

    const role = req.user.role
    const staff = ['admin','ops_manager','dos','accountant'].includes(role)
    const isOwnTeacher = role === 'teacher' && String(report.teacherId) === String(req.user._id)
    const isStudent = role === 'student' && String(report.studentId||'') === String(req.user._id)
    const isParent = role === 'parent' && (
      [ ...(req.user.linkedStudents||[]), ...(req.user.children||[]) ].map(String).includes(String(report.studentId||'')) ||
      (report.parentEmail && report.parentEmail.toLowerCase() === String(req.user.email||'').toLowerCase())
    )
    if (!staff && !isOwnTeacher && !isStudent && !isParent)
      return res.status(403).json({ success:false, message:'Access denied.' })

    const pdf = await buildWeeklyReportPdf(report)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="Weekly-' + String(report.studentName||'student').replace(/[^A-Za-z0-9-]/g,'-') + '-' + String(report.week||'').replace(/[^A-Za-z0-9-]/g,'-') + '.pdf"')
    return res.send(pdf)
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

router.post('/:id/publish', auth, requireRole('admin','ops_manager','dos','teacher'), async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id)
    if (!report) return fail(res,404,'Not found.')
    if (req.user.role==='teacher' && String(report.teacherId)!==String(req.user._id))
      return fail(res,403,'Not your report.')

    // Idempotent. Publishing an already-notified report used to send the
    // parent another copy every time the button was pressed, which is the
    // other half of why one report produced several emails. Re-publishing
    // is still allowed (a teacher may correct and re-publish) but the
    // parent is notified exactly once unless notification is reset.
    const alreadyNotified = !!report.parentEmailSent
    report.status = 'published'
    await report.save()

    let sent = false
    if (!alreadyNotified) {
      let student = null
      if (report.studentId) student = await User.findById(report.studentId).select('parentEmail linkedParents').lean()
      const emails = await getParentEmails(student, report.parentEmail)
      sent = emails.length ? await sendParentNotification(report, emails, true) : false
      if (sent) { report.parentEmailSent = true; report.parentNotifiedAt = new Date(); await report.save() }
    }

    return ok(res, { report },
      alreadyNotified ? 'Published. The parent was already notified for this report.'
                      : `Published.${sent ? ' Parent notified.' : ' (No parent email on file)'}`)
  } catch(e) { return fail(res,500,e.message) }
})

// ── POST /api/weekly-reports/:id/resend ────────────────────
// Deliberate re-send, for when a parent genuinely did not receive the
// email. Publishing is idempotent, so this is the only way to send a
// second copy — which keeps accidental duplicates impossible while
// leaving a real need served.
router.post('/:id/resend', auth, requireRole('admin','ops_manager','dos','teacher'), async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id)
    if (!report) return fail(res,404,'Not found.')
    if (req.user.role==='teacher' && String(report.teacherId)!==String(req.user._id))
      return fail(res,403,'Not your report.')
    if (report.status !== 'published')
      return fail(res,400,'Publish the report before sending it to the parent.')

    let student = null
    if (report.studentId) student = await User.findById(report.studentId).select('parentEmail linkedParents').lean()
    const emails = await getParentEmails(student, report.parentEmail)
    if (!emails.length) return fail(res,400,'No parent email on file for this student.')

    const sent = await sendParentNotification(report, emails, true)
    if (sent) { report.parentNotifiedAt = new Date(); await report.save() }
    return ok(res, { report }, sent ? `Re-sent to ${emails.join(', ')}.` : 'Could not send the email.')
  } catch(e) { return fail(res,500,e.message) }
})

// ── Helpers ───────────────────────────────────────────────
async function getParentEmails(student, fallbackEmail) {
  // The same parent commonly appears in all three sources. A plain Set
  // de-dupes by exact string, so "Parent@Gmail.com " and
  // "parent@gmail.com" survived as two recipients and the parent got two
  // copies of the same report. Normalise before de-duplicating.
  const seen = new Map()          // normalised -> original casing
  const add = (e) => {
    if (!e || typeof e !== 'string') return
    const clean = e.trim()
    if (!clean || !clean.includes('@')) return
    const key = clean.toLowerCase()
    if (!seen.has(key)) seen.set(key, clean)
  }
  add(fallbackEmail)
  add(student?.parentEmail)
  if (student?.linkedParents?.length) {
    const parents = await User.find({ _id:{ $in:student.linkedParents } }).select('email').lean()
    parents.forEach(p => add(p.email))
  }
  return [...seen.values()]
}

async function sendParentNotification(report, emails, isPublished) {
  const t = getTransporter()
  if (!t || !emails.length) return false

  const perf = report.overallAverage !== null
    ? `<tr><td style="font-size:12px;color:#6B6B6B;font-weight:700;text-transform:uppercase;padding-bottom:6px">Overall score</td><td style="font-size:16px;font-weight:800;color:#7D1025;text-align:right;padding-bottom:6px">${report.overallAverage}% (${report.meanGrade})</td></tr>`
    : ''

  const topicsList = (report.topics||[]).filter(Boolean)
  const hw = (report.homework||[]).filter(Boolean)

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center"><table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6;">
<tr><td style="background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:24px 32px;">
  <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px">Smartious Homeschool · Weekly Report</div>
  <div style="font-size:20px;font-weight:800;color:#fff;">${isPublished ? 'Weekly Report Published' : 'Report Update'}</div>
  <div style="font-size:13px;color:rgba(255,255,255,.65);margin-top:4px;">${report.studentName} · ${report.subject}</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 20px;line-height:1.7;">
    Dear Parent, ${isPublished ? `the weekly report for <strong>${report.studentName}</strong> has been published.` : `a report update is available for <strong>${report.studentName}</strong>.`}
  </p>
  <table width="100%" style="background:#FDFAF4;border-radius:8px;border:1px solid #E8E2D6;margin-bottom:20px;"><tr><td style="padding:16px 20px;">
    <table width="100%">
      <tr><td style="font-size:12px;color:#6B6B6B;font-weight:700;text-transform:uppercase;padding-bottom:6px">Subject</td><td style="font-size:14px;font-weight:700;color:#1A1A1A;text-align:right;padding-bottom:6px">${report.subject}</td></tr>
      <tr><td style="font-size:12px;color:#6B6B6B;font-weight:700;text-transform:uppercase;padding-bottom:6px">Week / Period</td><td style="font-size:13px;color:#1A1A1A;text-align:right;padding-bottom:6px">${report.week||'—'} · ${report.period}</td></tr>
      <tr><td style="font-size:12px;color:#6B6B6B;font-weight:700;text-transform:uppercase;padding-bottom:6px">Teacher</td><td style="font-size:13px;color:#1A1A1A;text-align:right;padding-bottom:6px">${report.teacherName||'—'}</td></tr>
      ${perf}
    </table>
  </td></tr></table>
  ${topicsList.length ? `<p style="font-size:13px;color:#2c2c2c;margin:0 0 8px;font-weight:700;">Topics covered this week:</p><ul style="margin:0 0 16px;padding-left:20px;font-size:13px;color:#564844;line-height:1.8;">${topicsList.map(t=>`<li>${t}</li>`).join('')}</ul>` : ''}
  ${hw.length ? `<div style="background:#FFFBEB;border-radius:8px;padding:14px 18px;margin-bottom:20px;border-left:3px solid #C9A030;"><p style="font-size:12px;font-weight:700;color:#D97706;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px">Homework assigned</p><ul style="margin:0;padding-left:18px;font-size:13px;color:#564844;line-height:1.8;">${hw.map(h=>`<li>${h}</li>`).join('')}</ul></div>` : ''}
  ${report.remarks ? `<div style="background:#F9F2F3;border-radius:8px;padding:14px 18px;margin-bottom:20px;border-left:3px solid #7D1025;"><p style="font-size:12px;font-weight:700;color:#7D1025;text-transform:uppercase;margin:0 0 6px">Teacher remarks</p><p style="font-size:13px;color:#2c2c2c;margin:0;line-height:1.65;">${report.remarks}</p></div>` : ''}
  <a href="https://smartioushomeschool.com/parent" style="display:block;background:#7D1025;color:#fff;text-align:center;padding:13px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">View full report in parent portal →</a>
</td></tr>
<tr><td style="background:#FDFAF4;padding:14px 32px;border-top:1px solid #E8E2D6;">
  <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool Global · hellosmartious@gmail.com · +254 745 021 212</p>
</td></tr>
</table></td></tr></table></body></html>`

  let sent = 0
  // ONE message addressed to all recipients, rather than one message per
  // recipient. Two guardians on the same report should receive a single
  // email between them, not one each with the other invisible.
  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM||'Smartious <hellosmartious@gmail.com>',
      to:   emails.join(', '),
      subject: `${isPublished?'Weekly report published':'Report update'} — ${report.studentName} · ${report.subject} · Smartious`,
      html,
    })
    sent++
    console.log(`[weekly-report email] Sent to ${emails.join(', ')}`)
  } catch(e) { console.error('[weekly-report email]', emails.join(', '), e.message) }
  return sent > 0
}

// Printable HTML for download
function buildReportHTML(r) {
  const fmtList = arr => (arr||[]).filter(Boolean).map((x,i)=>`<li style="margin-bottom:4px">${x}</li>`).join('')
  const section = (title, content) => content ? `<div style="margin-bottom:20px"><div style="font-size:10px;font-weight:700;color:#7D1025;text-transform:uppercase;letter-spacing:.1em;border-bottom:1.5px solid #E8E2D6;padding-bottom:6px;margin-bottom:10px">${title}</div>${content}</div>` : ''
  const perf = (label, val) => val ? `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F4EFEB"><span style="font-size:13px;color:#6B6B6B">${label}</span><span style="font-size:13px;font-weight:700;color:#1A0F0E">${val}</span></div>` : ''

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Weekly Report — ${r.studentName} — ${r.subject}</title>
<style>
  body{font-family:sans-serif;margin:0;padding:0;background:#FDFAF4;color:#1A0F0E;}
  .wrap{max-width:750px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6;}
  .hdr{background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:28px 36px;color:#fff}
  .body{padding:32px 36px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  ul{margin:0;padding-left:20px;line-height:1.8;font-size:13px;color:#564844}
  @media print{body{padding:0}.wrap{border:none;border-radius:0;margin:0}}
</style></head>
<body>
<div class="wrap">
  <div class="hdr">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px">Smartious Homeschool Global · Weekly Academic Report</div>
        <div style="font-size:26px;font-weight:800;color:#fff">${r.studentName}</div>
        <div style="font-size:14px;color:rgba(255,255,255,.7);margin-top:4px">${r.subject} · ${r.week||''} · ${r.period} · ${r.academicYear}</div>
      </div>
      ${r.overallAverage!==null?`<div style="text-align:right"><div style="font-size:36px;font-weight:800;color:#C9A030;line-height:1">${r.overallAverage}%</div><div style="font-size:14px;font-weight:800;color:rgba(255,255,255,.7);margin-top:4px">${r.meanGrade}</div><div style="font-size:11px;color:rgba(255,255,255,.4)">Overall score</div></div>`:''}
    </div>
  </div>
  <div class="body">
    <div class="grid" style="margin-bottom:24px">
      <div style="background:#FBFAF5;border-radius:8px;padding:14px 16px">
        <div style="font-size:10px;font-weight:700;color:#7D1025;text-transform:uppercase;margin-bottom:8px">Student</div>
        <div style="font-size:15px;font-weight:700">${r.studentName}</div>
        <div style="font-size:12px;color:#6B6B6B;margin-top:2px">${r.classLevel||r.curriculum||''}</div>
      </div>
      <div style="background:#FBFAF5;border-radius:8px;padding:14px 16px">
        <div style="font-size:10px;font-weight:700;color:#7D1025;text-transform:uppercase;margin-bottom:8px">Teacher</div>
        <div style="font-size:15px;font-weight:700">${r.teacherName||'—'}</div>
        <div style="font-size:12px;color:#6B6B6B;margin-top:2px">${r.subject}</div>
      </div>
    </div>

    ${section('Topics covered', (r.topics||[]).filter(Boolean).length?`<ul>${fmtList(r.topics)}</ul>`:'')}
    ${section('Sub-topics', (r.subTopics||[]).filter(Boolean).length?`<ul>${fmtList(r.subTopics)}</ul>`:'')}
    ${section('Class activities', (r.activities||[]).filter(Boolean).length?`<ul>${fmtList(r.activities)}</ul>`:'')}

    ${(r.assessments||[]).length?section('Assessments & marks',
      `<table style="width:100%;border-collapse:collapse">
        <tr style="background:#FBFAF5"><th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#7D1025;text-transform:uppercase;border-bottom:1.5px solid #E8E2D6">Description</th><th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:#7D1025;text-transform:uppercase;border-bottom:1.5px solid #E8E2D6">Score</th><th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:#7D1025;text-transform:uppercase;border-bottom:1.5px solid #E8E2D6">%</th></tr>
        ${(r.assessments||[]).map(a=>`<tr style="border-bottom:1px solid #F4EFEB"><td style="padding:8px 12px;font-size:13px">${a.desc||'—'}</td><td style="padding:8px 12px;text-align:right;font-size:13px">${a.score}/${a.outOf}</td><td style="padding:8px 12px;text-align:right;font-weight:800;color:#7D1025">${a.percentage}%</td></tr>`).join('')}
      </table>`
    ):''}

    ${section('Performance observations',
      [perf('Understanding', r.understanding), perf('Participation', r.participation), perf('General performance', r.generalPerf)].filter(Boolean).join('')
    )}

    <div class="grid">
      ${section('Strengths', (r.strengths||[]).filter(Boolean).length?`<ul>${fmtList(r.strengths)}</ul>`:'')}
      ${section('Areas for improvement', (r.improvements||[]).filter(Boolean).length?`<ul>${fmtList(r.improvements)}</ul>`:'')}
    </div>

    ${section('Homework assigned', (r.homework||[]).filter(Boolean).length?`<ul>${fmtList(r.homework)}</ul>`:'')}
    ${section('Teacher remarks', r.remarks?`<p style="font-size:14px;color:#564844;line-height:1.7;margin:0">${r.remarks}</p>`:'')}

    <div style="margin-top:32px;padding-top:20px;border-top:1.5px solid #E8E2D6;text-align:center;font-size:11px;color:#9A9A9A">
      Smartious Homeschool Global · Generated ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})} · hellosmartious@gmail.com
    </div>
  </div>
</div>
<script>window.onload=()=>window.print()</script>
</body></html>`
}

module.exports = router
