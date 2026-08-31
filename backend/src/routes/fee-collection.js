/**
 * routes/fee-collection.js
 * Fee collection and billing cycle management for accountants.
 * Mounted at /api/fees
 *
 * GET  /api/fees                    — list all students with billing info
 * GET  /api/fees/summary            — totals: collected, outstanding, overdue
 * PATCH /api/fees/:studentId        — update agreedFee, billingDay, feeCurrency, billingNote
 * POST /api/fees/:studentId/remind  — send manual fee reminder now
 * POST /api/fees/remind-all         — send reminders to all students due within 3 days
 * POST /api/fees/:studentId/record-payment — mark a payment received, create Invoice
 */

const express      = require('express')
const router       = express.Router()
const nodemailer   = require('nodemailer')
const { auth, requireRole } = require('../middleware/auth')
const User         = require('../models/User')
// Parents may be attached by free-text email, by parentId, or through
// linkedParents. This resolves all three so a parent with a portal
// account but no text entry still receives fee reminders.
const { resolveStudentRecipients, describeRecipients } = require('../lib/recipients')
const Invoice      = require('../models/Invoice')

const ALLOWED = requireRole('admin', 'accountant', 'ops_manager')

// ── Helpers ──────────────────────────────────────────────
function getTransporter() {
  const u = process.env.EMAIL_USER, p = process.env.EMAIL_PASSWORD
  if (!u || !p) return null
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: parseInt(process.env.EMAIL_PORT || '587', 10) === 465,
    auth: { user: u, pass: p },
  })
}

const money = (n, cur = 'USD') => {
  const syms = { USD: '$', KES: 'KES ', GBP: '£', EUR: '€', AED: 'AED ' }
  return (syms[cur] || '') + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })
}

// Compute next due date from billingDay
function nextDue(billingDay) {
  const today = new Date()
  const d = billingDay || 15
  const candidate = new Date(today.getFullYear(), today.getMonth(), d)
  if (candidate <= today) candidate.setMonth(candidate.getMonth() + 1)
  return candidate
}

// Days until a date
function daysUntil(date) {
  if (!date) return null
  const diff = new Date(date) - new Date()
  return Math.ceil(diff / 86400000)
}

// Compute billing status for a student
function billingStatus(student) {
  if (!student.agreedFee || student.agreedFee === 0) return 'no-fee'
  const due = student.nextDueDate ? new Date(student.nextDueDate) : nextDue(student.billingDay)
  const days = daysUntil(due)
  if (days < 0) return 'overdue'
  if (days <= 3) return 'due-soon'
  return 'current'
}

// ── GET /api/fees ─────────────────────────────────────────
// List all active students with billing info + last invoice status
// ── GET /api/fees/billing-directory ──────────────────────
// Lightweight student directory for the invoice quick picker:
// every active student with their resolved parent contact, agreed
// fee and currency, so one click prefills a whole invoice.
router.get('/billing-directory', auth, ALLOWED, async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isActive: true })
      .select('firstName lastName email admissionNo admissionNumber curriculum gradeLevel programme agreedFee feeCurrency parentEmail parentId linkedParents')
      .sort({ firstName: 1 })
      .lean()

    // Resolve linked parent accounts in one query
    const parentIds = new Set()
    for (const s of students) {
      if (s.parentId) parentIds.add(String(s.parentId))
      for (const lp of (s.linkedParents || [])) if (lp) parentIds.add(String(lp))
    }
    const parents = parentIds.size
      ? await User.find({ _id: { $in: [...parentIds] } }).select('firstName lastName email').lean()
      : []
    const byId = Object.fromEntries(parents.map(p => [String(p._id), p]))

    const rows = students.map(s => {
      const linked = s.parentId ? byId[String(s.parentId)]
        : (s.linkedParents || []).map(id => byId[String(id)]).find(Boolean)
      const parentName  = linked ? `${linked.firstName || ''} ${linked.lastName || ''}`.trim() : ''
      const parentEmail = (s.parentEmail || linked?.email || '').toLowerCase()
      return {
        _id: s._id,
        studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
        admission: s.admissionNo || s.admissionNumber || '',
        grade: s.gradeLevel || '', curriculum: s.curriculum || '', programme: s.programme || '',
        agreedFee: s.agreedFee || 0, feeCurrency: s.feeCurrency || 'USD',
        parentName, parentEmail,
        studentEmail: (s.email || '').toLowerCase(),
      }
    })
    return res.json({ success: true, data: { students: rows } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

router.get('/', auth, ALLOWED, async (req, res) => {
  try {
    const { search, status, currency, page = 1, limit = 50 } = req.query

    const filter = { role: 'student', isActive: true }
    if (search) {
      const re = new RegExp(search, 'i')
      filter.$or = [{ firstName: re }, { lastName: re }, { email: re },
                    { admissionNo: re }, { admissionNumber: re }]
    }

    const students = await User.find(filter)
      .select('firstName lastName email admissionNo admissionNumber curriculum gradeLevel programme agreedFee feeCurrency billingDay lastPaidDate nextDueDate billingNote feeReminderSent onBreak')
      .lean()

    // Get last invoice per student
    const studentIds = students.map(s => s._id)
    const lastInvoices = await Invoice.aggregate([
      { $match: { billedToEmail: { $in: students.map(s => s.email) } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$billedToEmail', last: { $first: '$$ROOT' } } },
    ])
    const invMap = {}
    lastInvoices.forEach(r => { invMap[r._id] = r.last })

    let rows = students.map(s => {
      const due    = s.nextDueDate ? new Date(s.nextDueDate) : nextDue(s.billingDay)
      const bs     = billingStatus(s)
      const inv    = invMap[s.email] || null
      return {
        _id:            s._id,
        name:           s.firstName + ' ' + s.lastName,
        email:          s.email,
        admissionNo:    s.admissionNo || s.admissionNumber || '',
        curriculum:     s.curriculum || '',
        grade:          s.gradeLevel || '',
        programme:      s.programme || '',
        agreedFee:      s.agreedFee || 0,
        feeCurrency:    s.feeCurrency || 'USD',
        billingDay:     s.billingDay || 15,
        lastPaidDate:   s.lastPaidDate,
        nextDueDate:    due,
        daysUntilDue:   daysUntil(due),
        billingNote:    s.billingNote || '',
        feeReminderSent:s.feeReminderSent,
        billingStatus:  bs,
        onBreak:        s.onBreak,
        lastInvoice:    inv ? { invoiceNo: inv.invoiceNo, status: inv.status, amount: inv.totalDue, date: inv.issueDate } : null,
      }
    })

    // Status filter
    if (status && status !== 'all') rows = rows.filter(r => r.billingStatus === status)
    if (currency) rows = rows.filter(r => r.feeCurrency === currency)

    // Summary
    const summary = {
      total:      rows.length,
      overdue:    rows.filter(r => r.billingStatus === 'overdue').length,
      dueSoon:    rows.filter(r => r.billingStatus === 'due-soon').length,
      current:    rows.filter(r => r.billingStatus === 'current').length,
      noFee:      rows.filter(r => r.billingStatus === 'no-fee').length,
      totalMonthly: rows.reduce((s, r) => s + (r.agreedFee || 0), 0),
    }

    const skip = (parseInt(page,10)-1)*parseInt(limit,10)
    const paged = rows.slice(skip, skip+parseInt(limit,10))

    return res.json({ success: true, data: { students: paged, total: rows.length, summary } })
  } catch(e) {
    console.error('[fees GET /]', e.message)
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── PATCH /api/fees/:studentId ────────────────────────────
// Update a student's billing cycle settings
router.patch('/:studentId', auth, ALLOWED, async (req, res) => {
  try {
    const { agreedFee, feeCurrency, billingDay, billingNote, nextDueDate } = req.body

    const update = {}
    if (agreedFee   !== undefined) update.agreedFee   = parseFloat(agreedFee) || 0
    if (feeCurrency !== undefined) update.feeCurrency = feeCurrency
    if (billingNote !== undefined) update.billingNote = billingNote
    if (billingDay  !== undefined) {
      const d = parseInt(billingDay, 10)
      if (d >= 1 && d <= 28) {
        update.billingDay   = d
        update.nextDueDate  = nextDue(d)
      }
    }
    if (nextDueDate !== undefined) update.nextDueDate = new Date(nextDueDate)

    const student = await User.findByIdAndUpdate(req.params.studentId, { $set: update }, { new: true })
      .select('firstName lastName email agreedFee feeCurrency billingDay nextDueDate billingNote')
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })

    return res.json({ success: true, message: 'Billing updated.', data: { student } })
  } catch(e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── POST /api/fees/:studentId/remind ─────────────────────
// Send a fee reminder to this student + their parent email
router.post('/:studentId/remind', auth, ALLOWED, async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId)
      .select('firstName lastName email agreedFee feeCurrency billingDay nextDueDate billingNote parentEmail parentId linkedParents curriculum gradeLevel')
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })

    const resolved = await resolveStudentRecipients(student, { includeStudent: true })
    if (!resolved.to.length) {
      return res.status(400).json({
        success: false,
        message: 'No valid email address on file for this student or their parents. Add a parent email or link a parent account first.',
      })
    }

    const sent = await sendReminder(student)
    if (sent > 0) await User.findByIdAndUpdate(student._id, { $set: { feeReminderSent: new Date() } })

    return res.json({
      success: sent > 0,
      message: sent > 0
        ? `Reminder sent to ${sent} address${sent === 1 ? '' : 'es'}: ${resolved.to.join(', ')}`
        : 'Could not send to any address. Check the mail server configuration.',
      data: { sent, recipients: resolved.to, sources: resolved.sources },
    })
  } catch(e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── POST /api/fees/remind-all ─────────────────────────────
// Auto-send reminders to all students due within 3 days
router.post('/remind-all', auth, ALLOWED, async (req, res) => {
  try {
    const result = await sendDueReminders()
    return res.json({ success: true, message: `Sent ${result.sent} reminders (${result.skipped} skipped).`, data: result })
  } catch(e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── POST /api/fees/:studentId/record-payment ─────────────
// Mark payment received; create Invoice record
router.post('/:studentId/record-payment', auth, ALLOWED, async (req, res) => {
  try {
    const { amount, currency, paidAt, paymentMethod, note, periodLabel } = req.body
    const student = await User.findById(req.params.studentId)
      .select('firstName lastName email agreedFee feeCurrency billingDay curriculum gradeLevel programme parentEmail')
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })

    const paidDate = paidAt ? new Date(paidAt) : new Date()
    const cur      = currency || student.feeCurrency || 'USD'
    const amt      = parseFloat(amount) || student.agreedFee || 0

    // Generate invoice number
    const today    = new Date()
    const yyyymmdd = today.toISOString().slice(0,10).replace(/-/g,'')
    const count    = await Invoice.countDocuments({ invoiceNo: { $regex: `^SM-INV-${yyyymmdd}` } })
    const invoiceNo = `SM-INV-${yyyymmdd}-${String(count+1).padStart(2,'0')}`

    const invoice = await Invoice.create({
      invoiceNo,
      issueDate:        today,
      dueDate:          paidDate,
      billedToName:     student.firstName + ' ' + student.lastName,
      billedToEmail:    student.email,
      studentName:      student.firstName + ' ' + student.lastName,
      studentGrade:     student.gradeLevel || '',
      programmeLabel:   periodLabel || student.programme || '',
      lineItems: [{
        description: `Tuition fee — ${periodLabel || today.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}`,
        amount: amt,
      }],
      currency:   cur,
      subtotal:   amt,
      totalDue:   amt,
      status:     'paid',
      paidAt:     paidDate,
      paidAmount: amt,
      paymentNote: [paymentMethod, note].filter(Boolean).join(' — '),
      issuedBy:    req.user._id,
    })

    // Compute next due date
    const nextBillingDay = student.billingDay || 15
    const nextDueD = nextDue(nextBillingDay)
    await User.findByIdAndUpdate(student._id, { $set: { lastPaidDate: paidDate, nextDueDate: nextDueD, feeReminderSent: null } })

    return res.json({ success: true, message: 'Payment recorded.', data: { invoice } })
  } catch(e) {
    console.error('[fees record-payment]', e.message)
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── Email sender ──────────────────────────────────────────
async function sendReminder(student) {
  const t = getTransporter()
  if (!t) { console.log('[fees] Email not configured'); return 0 }

  const due      = student.nextDueDate ? new Date(student.nextDueDate) : nextDue(student.billingDay)
  const days     = daysUntil(due)
  const dueLabel = due.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const amtLabel = money(student.agreedFee, student.feeCurrency)

  const html = buildReminderEmail(student, dueLabel, amtLabel, days)
  const subject = days <= 0
    ? `Fee overdue — ${student.firstName} ${student.lastName} — Smartious`
    : `Fee due ${days <= 1 ? 'tomorrow' : `in ${days} days`} — ${student.firstName} ${student.lastName}`

  // Gather the student plus every linked parent, however they were attached.
  const resolved = await resolveStudentRecipients(student, { includeStudent: true })
  const recipients = resolved.to

  if (!recipients.length) {
    console.warn(`[fees reminder] ${student.firstName} ${student.lastName}: no valid email addresses on file`)
    return 0
  }

  let sent = 0
  const failures = []
  for (const email of recipients) {
    try {
      await t.sendMail({ from: process.env.EMAIL_FROM || 'Smartious Finance <hello@smartioushomeschool.com>', to: email, subject, html })
      sent++
    } catch(e) {
      failures.push(email)
      console.error('[fees reminder]', email, e.message)
    }
  }
  console.log(`[fees reminder] ${student.firstName} ${student.lastName}: ${describeRecipients(resolved)}` +
    (failures.length ? ` | failed: ${failures.join(', ')}` : ''))
  return sent
}

async function sendDueReminders() {
  const students = await User.find({ role: 'student', isActive: true, onBreak: false, agreedFee: { $gt: 0 } })
    .select('firstName lastName email parentEmail parentId linkedParents agreedFee feeCurrency billingDay nextDueDate feeReminderSent')

  let sent = 0, skipped = 0
  for (const s of students) {
    const due  = s.nextDueDate ? new Date(s.nextDueDate) : nextDue(s.billingDay)
    const days = daysUntil(due)
    if (days > 3 && days >= 0) { skipped++; continue }

    // Don't send if already reminded today
    if (s.feeReminderSent) {
      const lastSent = new Date(s.feeReminderSent)
      const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0)
      if (lastSent >= todayMidnight) { skipped++; continue }
    }

    try {
      const n = await sendReminder(s)
      if (n > 0) {
        await User.findByIdAndUpdate(s._id, { $set: { feeReminderSent: new Date() } })
        sent += n
      }
    } catch {}
  }
  return { sent, skipped }
}

function buildReminderEmail(student, dueLabel, amtLabel, days) {
  const isOverdue = days < 0
  const accent    = isOverdue ? '#991B1B' : days <= 1 ? '#D97706' : '#7D1025'
  const urgency   = isOverdue ? `Your fee payment is <strong>overdue</strong>.`
    : days === 0 ? `Your fee payment is <strong>due today</strong>.`
    : days === 1 ? `Your fee payment is due <strong>tomorrow</strong>.`
    : `Your fee payment is due in <strong>${days} days</strong>.`

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#FDFAF4;">
<tr><td align="center"><table width="100%" style="max-width:540px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6;">
<tr><td style="background:linear-gradient(135deg,${accent},${accent}dd);padding:24px 32px;">
  <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:8px">Smartious Homeschool Global · Finance</div>
  <div style="font-size:20px;font-weight:800;color:#fff;">${isOverdue ? 'Fee Payment Overdue' : 'Fee Payment Reminder'}</div>
  <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;">${student.firstName} ${student.lastName}</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 20px;line-height:1.65;">Dear ${student.firstName}, ${urgency}</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;border-radius:8px;border:1px solid #E8E2D6;margin-bottom:24px;">
  <tr><td style="padding:18px 20px;">
    <table width="100%">
      ${[['Student', student.firstName+' '+student.lastName],['Programme',student.programme||'Homeschool'],['Amount due',`<strong style="font-size:18px;color:${accent}">${amtLabel}</strong>`],['Due date',dueLabel]].map(([l,v])=>`
      <tr><td style="font-size:12px;font-weight:700;color:#6B6B6B;text-transform:uppercase;letter-spacing:.06em;padding-bottom:4px">${l}</td><td style="font-size:13px;color:#1A1A1A;padding-bottom:12px;text-align:right">${v}</td></tr>`).join('')}
    </table>
  </td></tr></table>
  <p style="font-size:13px;color:#6B6B6B;line-height:1.6;margin:0 0 20px;">
    ${isOverdue ? 'Please settle this payment as soon as possible to avoid any interruption to your studies.' : 'Please ensure payment is made by the due date to keep your account in good standing.'}
    ${student.billingNote ? `<br><br><em>Note: ${student.billingNote}</em>` : ''}
  </p>
  <div style="background:#F9F2F3;border-radius:8px;padding:14px 18px;font-size:12px;color:#7D1025;font-style:italic;border-left:3px solid #7D1025;">
    For payment enquiries, please contact us at hello@smartioushomeschool.com or call +254 745 021 212.
  </div>
</td></tr>
<tr><td style="background:#FDFAF4;padding:14px 32px;border-top:1px solid #E8E2D6;">
  <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool Global · Diamond Plaza Parklands & Karen, Nairobi</p>
</td></tr>
</table></td></tr></table></body></html>`
}

// Export for cron scheduling
module.exports = router
module.exports.sendDueReminders = sendDueReminders
