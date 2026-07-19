/**
 * routes/payroll.js
 * Payroll management for accountants + teacher earnings.
 * Mounted at /api/payroll
 *
 * Accountant endpoints:
 *   GET    /api/payroll                      — list all payroll records (with filters)
 *   GET    /api/payroll/teachers             — list teachers for payroll setup
 *   POST   /api/payroll                      — create payroll record for a teacher/month
 *   PATCH  /api/payroll/:id                  — update salary, deductions
 *   POST   /api/payroll/:id/mark-paid        — mark paid + send payslip email
 *   DELETE /api/payroll/:id                  — delete draft
 *   GET    /api/payroll/:id/payslip-html     — get printable payslip HTML
 *   PATCH  /api/payroll/:id/extras/:extraId  — approve/reject a tuition extra
 *
 * Teacher endpoints:
 *   GET    /api/payroll/my                   — my payroll history
 *   POST   /api/payroll/my/extras            — submit a tuition extra claim
 *   DELETE /api/payroll/my/extras/:extraId   — delete pending claim
 *   GET    /api/payroll/:id/payslip-html     — download my payslip (must be own)
 */

const express  = require('express')
const router   = express.Router()
const nodemailer = require('nodemailer')
const { auth, requireRole } = require('../middleware/auth')
const User     = require('../models/User')
const Payroll  = require('../models/Payroll')

const ACCT  = requireRole('admin', 'accountant', 'ops_manager')
const DOS   = requireRole('admin', 'dos', 'accountant', 'ops_manager')
const ok    = (res, data, msg) => res.json({ success:true, data, message:msg })
const fail  = (res, code, msg) => res.status(code).json({ success:false, message:msg })

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

const money = (n, cur='KES') => {
  const s = ({KES:'KES ',USD:'$',GBP:'£'})[cur]||''
  return s+(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
}

function computeNet(rec) {
  const extras = (rec.tuitionExtras||[]).filter(e=>e.status==='approved').reduce((s,e)=>s+e.totalAmount,0)
  const ded    = (rec.deductions||[]).reduce((s,d)=>s+d.amount,0)
  return { net:(rec.basicSalary||0)-ded+extras, totalDeductions:ded, totalApprovedExtras:extras }
}

// ── GET /api/payroll/teachers ─────────────────────────────
// List teachers for payroll (for creating new payroll records)
router.get('/teachers', auth, ACCT, async (req, res) => {
  try {
    const teachers = await User.find({ role:'teacher', isActive:true })
      .select('firstName lastName email currency')
      .lean()
    return ok(res, { teachers })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/payroll/my ───────────────────────────────────
// Teacher: my payroll history + pending extras
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return fail(res,403,'Teachers only.')
    const records = await Payroll.find({ teacherId:req.user._id })
      .sort({ periodYear:-1, periodMonth:-1 })
      .lean()
    return ok(res, { records })
  } catch(e) { return fail(res,500,e.message) }
})

// ── POST /api/payroll/my/extras ───────────────────────────
// Teacher submits a tuition extra claim (pending DOS/accountant approval)
router.post('/my/extras', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return fail(res,403,'Teachers only.')
    const { description, studentName, subject, sessions, ratePerSession, totalAmount, date, periodMonth, periodYear } = req.body

    if (!description || !totalAmount) return fail(res,400,'Description and amount required.')

    // Find or create payroll record for this period
    const month = parseInt(periodMonth,10) || new Date().getMonth()+1
    const year  = parseInt(periodYear,10)  || new Date().getFullYear()

    let record = await Payroll.findOne({ teacherId:req.user._id, periodMonth:month, periodYear:year })
    if (!record) {
      const teacher = await User.findById(req.user._id).select('firstName lastName email').lean()
      const months  = ['January','February','March','April','May','June','July','August','September','October','November','December']
      record = await Payroll.create({
        teacherId:    req.user._id,
        teacherName:  teacher.firstName+' '+teacher.lastName,
        teacherEmail: teacher.email,
        periodLabel:  months[month-1]+' '+year,
        periodMonth:  month,
        periodYear:   year,
        basicSalary:  0,
        currency:     'KES',
        createdBy:    req.user._id,
      })
    }

    const extra = {
      description, studentName:studentName||'', subject:subject||'',
      sessions:parseInt(sessions,10)||1,
      ratePerSession:parseFloat(ratePerSession)||0,
      totalAmount:parseFloat(totalAmount),
      date:date?new Date(date):new Date(),
      status:'pending',
    }

    record.tuitionExtras.push(extra)
    const computed = computeNet(record)
    record.totalApprovedExtras = computed.totalApprovedExtras
    record.totalDeductions     = computed.totalDeductions
    record.netPay              = computed.net
    await record.save()

    return ok(res, { record }, 'Tuition extra submitted. Pending approval.')
  } catch(e) { return fail(res,500,e.message) }
})

// ── DELETE /api/payroll/my/extras/:extraId ────────────────
// Teacher deletes a pending extra
router.delete('/my/extras/:extraId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return fail(res,403,'Teachers only.')
    const record = await Payroll.findOne({ teacherId:req.user._id, 'tuitionExtras._id':req.params.extraId })
    if (!record) return fail(res,404,'Not found.')
    const extra = record.tuitionExtras.id(req.params.extraId)
    if (!extra) return fail(res,404,'Extra not found.')
    if (extra.status !== 'pending') return fail(res,400,'Can only delete pending claims.')
    extra.deleteOne()
    const computed = computeNet(record)
    record.totalApprovedExtras = computed.totalApprovedExtras
    record.netPay = computed.net
    await record.save()
    return ok(res, {}, 'Claim deleted.')
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/payroll ──────────────────────────────────────
// Accountant: list all payroll records
router.get('/', auth, ACCT, async (req, res) => {
  try {
    const { month, year, status, teacherId } = req.query
    const filter = {}
    if (month)     filter.periodMonth = parseInt(month,10)
    if (year)      filter.periodYear  = parseInt(year,10)
    if (status)    filter.status      = status
    if (teacherId) filter.teacherId   = teacherId

    const records = await Payroll.find(filter)
      .sort({ periodYear:-1, periodMonth:-1, teacherName:1 })
      .lean()

    const summary = {
      total:     records.length,
      draft:     records.filter(r=>r.status==='draft').length,
      paid:      records.filter(r=>r.status==='paid').length,
      processing:records.filter(r=>r.status==='processing').length,
      totalGross:records.reduce((s,r)=>s+(r.basicSalary||0),0),
      totalNet:  records.reduce((s,r)=>s+(r.netPay||0),0),
      pendingExtras: records.reduce((s,r)=>s+(r.tuitionExtras||[]).filter(e=>e.status==='pending').length,0),
    }

    return ok(res, { records, summary })
  } catch(e) { return fail(res,500,e.message) }
})

// ── POST /api/payroll ─────────────────────────────────────
// Accountant: create payroll record
router.post('/', auth, ACCT, async (req, res) => {
  try {
    const { teacherId, periodMonth, periodYear, basicSalary, currency, deductions, paymentDate, paymentMethod } = req.body
    if (!teacherId || !periodMonth || !periodYear) return fail(res,400,'teacherId, periodMonth, periodYear required.')

    const teacher = await User.findById(teacherId).select('firstName lastName email').lean()
    if (!teacher) return fail(res,404,'Teacher not found.')

    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

    // Check duplicate
    const exists = await Payroll.findOne({ teacherId, periodMonth:parseInt(periodMonth,10), periodYear:parseInt(periodYear,10) })
    if (exists) return fail(res,409,'Payroll record already exists for this teacher/period.')

    const deds = (deductions||[]).map(d=>({ label:d.label, amount:parseFloat(d.amount)||0 }))
    const dedTotal = deds.reduce((s,d)=>s+d.amount,0)
    const basic    = parseFloat(basicSalary)||0
    const net      = basic - dedTotal

    const record = await Payroll.create({
      teacherId,
      teacherName:  teacher.firstName+' '+teacher.lastName,
      teacherEmail: teacher.email,
      periodLabel:  months[parseInt(periodMonth,10)-1]+' '+periodYear,
      periodMonth:  parseInt(periodMonth,10),
      periodYear:   parseInt(periodYear,10),
      basicSalary:  basic,
      currency:     currency||'KES',
      deductions:   deds,
      totalDeductions: dedTotal,
      totalApprovedExtras: 0,
      netPay:       net,
      paymentDate:  paymentDate?new Date(paymentDate):null,
      paymentMethod:paymentMethod||'Bank transfer',
      status:       'draft',
      createdBy:    req.user._id,
    })

    return ok(res, { record }, 'Payroll created.')
  } catch(e) {
    if (e.code===11000) return fail(res,409,'Payroll record already exists for this teacher/period.')
    return fail(res,500,e.message)
  }
})

// ── PATCH /api/payroll/:id ────────────────────────────────
// Accountant: update payroll
router.patch('/:id', auth, ACCT, async (req, res) => {
  try {
    const record = await Payroll.findById(req.params.id)
    if (!record) return fail(res,404,'Not found.')
    if (record.status==='paid') return fail(res,400,'Cannot edit a paid record.')

    const { basicSalary, currency, deductions, paymentDate, paymentMethod, paymentNote, status } = req.body
    if (basicSalary  !== undefined) record.basicSalary   = parseFloat(basicSalary)||0
    if (currency     !== undefined) record.currency      = currency
    if (paymentDate  !== undefined) record.paymentDate   = paymentDate?new Date(paymentDate):null
    if (paymentMethod!== undefined) record.paymentMethod = paymentMethod
    if (paymentNote  !== undefined) record.paymentNote   = paymentNote
    if (status       !== undefined && status !== 'paid') record.status = status
    if (deductions   !== undefined) {
      record.deductions = deductions.map(d=>({ label:d.label, amount:parseFloat(d.amount)||0 }))
    }
    const computed = computeNet(record)
    record.totalDeductions     = computed.totalDeductions
    record.totalApprovedExtras = computed.totalApprovedExtras
    record.netPay              = computed.net

    await record.save()
    return ok(res, { record }, 'Payroll updated.')
  } catch(e) { return fail(res,500,e.message) }
})

// ── POST /api/payroll/:id/mark-paid ──────────────────────
// Accountant: mark payroll as paid + send payslip email
router.post('/:id/mark-paid', auth, ACCT, async (req, res) => {
  try {
    const record = await Payroll.findById(req.params.id)
    if (!record) return fail(res,404,'Not found.')
    if (record.status==='paid') return fail(res,400,'Already paid.')

    const { paymentDate, paymentMethod, paymentRef, paymentNote } = req.body
    record.status        = 'paid'
    record.paymentDate   = paymentDate ? new Date(paymentDate) : new Date()
    record.paymentMethod = paymentMethod || record.paymentMethod || 'Bank transfer'
    record.paymentRef    = paymentRef || ''
    record.paymentNote   = paymentNote || ''

    const computed = computeNet(record)
    record.totalDeductions     = computed.totalDeductions
    record.totalApprovedExtras = computed.totalApprovedExtras
    record.netPay              = computed.net

    await record.save()

    // Send payslip email
    let emailSent = false
    try {
      const t = getTransporter()
      if (t) {
        await t.sendMail({
          from:    process.env.EMAIL_FROM || 'Smartious Finance <hellosmartious@gmail.com>',
          to:      record.teacherEmail,
          subject: `Payslip — ${record.periodLabel} — Smartious Homeschool`,
          html:    buildPayslipEmail(record),
        })
        record.payslipEmailSentAt = new Date()
        await record.save()
        emailSent = true
      }
    } catch(e) { console.error('[payroll email]', e.message) }

    return ok(res, { record, emailSent }, `Payroll marked as paid.${emailSent?' Payslip emailed to teacher.':' (Email not configured)'}`)
  } catch(e) { return fail(res,500,e.message) }
})

// ── PATCH /api/payroll/:id/extras/:extraId ────────────────
// DOS or accountant: approve/reject a tuition extra
router.patch('/:id/extras/:extraId', auth, DOS, async (req, res) => {
  try {
    const record = await Payroll.findById(req.params.id)
    if (!record) return fail(res,404,'Not found.')
    const extra = record.tuitionExtras.id(req.params.extraId)
    if (!extra) return fail(res,404,'Extra not found.')

    const { action, rejectedNote } = req.body // action: 'approve' | 'reject'
    if (!['approve','reject'].includes(action)) return fail(res,400,'action must be approve or reject.')

    extra.status       = action==='approve' ? 'approved' : 'rejected'
    extra.approvedBy   = req.user._id
    extra.approvedAt   = new Date()
    extra.rejectedNote = rejectedNote||''

    const computed = computeNet(record)
    record.totalApprovedExtras = computed.totalApprovedExtras
    record.totalDeductions     = computed.totalDeductions
    record.netPay              = computed.net
    await record.save()

    return ok(res, { record }, `Extra ${extra.status}.`)
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/payroll/:id ──────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await Payroll.findById(req.params.id).lean()
    if (!record) return fail(res,404,'Not found.')
    // Teacher can only see own records
    if (req.user.role==='teacher' && String(record.teacherId)!==String(req.user._id))
      return fail(res,403,'Not allowed.')
    return ok(res, { record })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/payroll/:id/payslip-html ────────────────────
router.get('/:id/payslip-html', auth, async (req, res) => {
  try {
    const record = await Payroll.findById(req.params.id).lean()
    if (!record) return fail(res,404,'Not found.')
    if (req.user.role==='teacher' && String(record.teacherId)!==String(req.user._id))
      return fail(res,403,'Not allowed.')
    return ok(res, { html: buildPayslipHTML(record) })
  } catch(e) { return fail(res,500,e.message) }
})

// ── DELETE /api/payroll/:id ───────────────────────────────
router.delete('/:id', auth, ACCT, async (req, res) => {
  try {
    const record = await Payroll.findById(req.params.id)
    if (!record) return fail(res,404,'Not found.')
    if (record.status==='paid') return fail(res,400,'Cannot delete a paid record.')
    await record.deleteOne()
    return ok(res, {}, 'Deleted.')
  } catch(e) { return fail(res,500,e.message) }
})

// ── Payslip HTML generator ────────────────────────────────
function buildPayslipHTML(r) {
  const cur = r.currency||'KES'
  const approvedExtras = (r.tuitionExtras||[]).filter(e=>e.status==='approved')
  const fmtDate = d => d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'—'
  const row = (l,v,bold) => `<tr><td style="padding:8px 0;font-size:13px;color:#6B6B6B;border-bottom:1px solid #F4EFEB">${l}</td><td style="padding:8px 0;font-size:13px;font-weight:${bold?700:500};color:${bold?'#1A0F0E':'#3A3A3A'};text-align:right;border-bottom:1px solid #F4EFEB">${v}</td></tr>`

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payslip — ${r.periodLabel}</title>
<style>body{font-family:sans-serif;background:#FDFAF4;margin:0;padding:32px}
.wrap{max-width:700px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6}
.hdr{background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:28px 36px;color:#fff}
.body{padding:32px 36px}
.sec{font-size:10px;font-weight:700;color:#7D1025;text-transform:uppercase;letter-spacing:.12em;margin:20px 0 10px}
table{width:100%}
@media print{body{padding:0}.wrap{border:none;border-radius:0}}
</style></head><body>
<div class="wrap">
<div class="hdr">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px">Smartious Homeschool Global</div>
      <div style="font-size:24px;font-weight:800;color:#fff">Payslip</div>
      <div style="font-size:14px;color:rgba(255,255,255,.7);margin-top:4px">${r.periodLabel}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:28px;font-weight:800;color:#C9A030">${money(r.netPay,cur)}</div>
      <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:4px">Net pay</div>
    </div>
  </div>
</div>
<div class="body">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
    <div style="background:#FBFAF5;border-radius:8px;padding:14px 16px">
      <div style="font-size:10px;font-weight:700;color:#7D1025;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Employee</div>
      <div style="font-size:15px;font-weight:800;color:#1A0F0E">${r.teacherName}</div>
      <div style="font-size:12px;color:#6B6B6B;margin-top:3px">${r.teacherEmail}</div>
      <div style="font-size:12px;color:#6B6B6B;margin-top:2px">Teacher</div>
    </div>
    <div style="background:#FBFAF5;border-radius:8px;padding:14px 16px">
      <div style="font-size:10px;font-weight:700;color:#7D1025;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Payment</div>
      <div style="font-size:13px;color:#1A0F0E"><strong>Method:</strong> ${r.paymentMethod||'—'}</div>
      <div style="font-size:13px;color:#1A0F0E;margin-top:4px"><strong>Date:</strong> ${fmtDate(r.paymentDate)}</div>
      ${r.paymentRef?`<div style="font-size:12px;color:#6B6B6B;margin-top:4px">Ref: ${r.paymentRef}</div>`:''}
    </div>
  </div>

  <div class="sec">Earnings</div>
  <table><tbody>
    ${row('Basic salary', money(r.basicSalary,cur))}
    ${approvedExtras.map(e=>row(`${e.description}${e.studentName?' ('+e.studentName+')':''}`, money(e.totalAmount,cur))).join('')}
    ${row('Total earnings', money((r.basicSalary||0)+(r.totalApprovedExtras||0),cur), true)}
  </tbody></table>

  <div class="sec">Deductions</div>
  <table><tbody>
    ${(r.deductions||[]).length===0?row('No deductions','—'):(r.deductions||[]).map(d=>row(d.label,`(${money(d.amount,cur)})`)).join('')}
    ${row('Total deductions', money(r.totalDeductions,cur), true)}
  </tbody></table>

  <div style="background:linear-gradient(135deg,#7D1025,#5A0B1B);border-radius:8px;padding:16px 20px;margin-top:20px;display:flex;justify-content:space-between;align-items:center">
    <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,.8)">Net Pay</div>
    <div style="font-size:24px;font-weight:800;color:#C9A030">${money(r.netPay,cur)}</div>
  </div>

  ${r.paymentNote?`<div style="margin-top:14px;font-size:12px;color:#6B6B6B;font-style:italic">${r.paymentNote}</div>`:''}
  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #E8E2D6;font-size:11px;color:#9A9A9A;text-align:center">
    Generated by Smartious Homeschool Global Finance · Diamond Plaza Parklands & Karen Hardy, Nairobi · hellosmartious@gmail.com
  </div>
</div></div>
<script>window.onload=function(){window.print()}</script>
</body></html>`
}

function buildPayslipEmail(r) {
  const cur = r.currency||'KES'
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center"><table width="100%" style="max-width:540px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6">
<tr><td style="background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:24px 32px">
  <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:6px">Smartious Homeschool Global · Payroll</div>
  <div style="font-size:20px;font-weight:800;color:#fff">Salary Processed — ${r.periodLabel}</div>
  <div style="font-size:13px;color:rgba(255,255,255,.65);margin-top:4px">${r.teacherName}</div>
</td></tr>
<tr><td style="padding:28px 32px">
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 20px;line-height:1.65">
    Dear ${r.teacherName.split(' ')[0]}, your salary for <strong>${r.periodLabel}</strong> has been processed and is on its way to your account.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBFAF5;border-radius:8px;border:1px solid #E8E2D6;margin-bottom:24px">
  <tr><td style="padding:18px 20px">
    <table width="100%">
      <tr><td style="font-size:12px;color:#6B6B6B;padding-bottom:8px">Basic salary</td><td style="text-align:right;font-size:13px;color:#1A0F0E;padding-bottom:8px">${money(r.basicSalary,cur)}</td></tr>
      ${(r.totalApprovedExtras||0)>0?`<tr><td style="font-size:12px;color:#6B6B6B;padding-bottom:8px">Tuition extras</td><td style="text-align:right;font-size:13px;color:#065F46;padding-bottom:8px">+${money(r.totalApprovedExtras,cur)}</td></tr>`:''}
      ${(r.totalDeductions||0)>0?`<tr><td style="font-size:12px;color:#6B6B6B;padding-bottom:8px">Deductions</td><td style="text-align:right;font-size:13px;color:#991B1B;padding-bottom:8px">(${money(r.totalDeductions,cur)})</td></tr>`:''}
      <tr style="border-top:1px solid #E8E2D6"><td style="font-size:13px;font-weight:700;color:#7D1025;padding-top:10px">Net pay</td><td style="text-align:right;font-size:20px;font-weight:800;color:#C9A030;padding-top:10px">${money(r.netPay,cur)}</td></tr>
    </table>
  </td></tr></table>
  <p style="font-size:13px;color:#6B6B6B;margin:0 0 20px;line-height:1.6">
    Payment method: <strong>${r.paymentMethod||'Bank transfer'}</strong>${r.paymentRef?' · Ref: '+r.paymentRef:''}<br>
    Log in to your teacher portal to download your full payslip.
  </p>
  <a href="https://smartioushomeschool.com/teacher" style="display:block;background:#7D1025;color:#fff;text-align:center;padding:13px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">
    Open my teacher portal
  </a>
</td></tr>
<tr><td style="background:#FBFAF5;padding:14px 32px;border-top:1px solid #E8E2D6">
  <p style="font-size:11px;color:#999;margin:0">© ${new Date().getFullYear()} Smartious Homeschool Global</p>
</td></tr>
</table></td></tr></table></body></html>`
}

module.exports = router
