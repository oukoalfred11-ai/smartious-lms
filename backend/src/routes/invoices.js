/**
 * routes/invoices.js
 * Mounted at /api/invoices
 */
const express = require('express')
const router  = express.Router()
const nodemailer = require('nodemailer')
const { auth, requireRole } = require('../middleware/auth')
const Invoice = require('../models/Invoice')

const ALLOWED = requireRole('admin', 'accountant', 'sales', 'ops_manager')

// ── Auto-increment invoice number ──────────────────────────
async function nextInvoiceNo() {
  const now  = new Date()
  const yyyy = now.getFullYear()
  const mm   = String(now.getMonth() + 1).padStart(2, '0')
  const dd   = String(now.getDate()).padStart(2, '0')
  const prefix = `SM-INV-${yyyy}-${mm}${dd}`
  const existing = await Invoice.find({ invoiceNo: { $regex: `^${prefix}` } }).countDocuments()
  const seq = String(existing + 1).padStart(2, '0')
  return `${prefix}-${seq}`
}

// ── Email transporter ───────────────────────────────────────
function getTransporter() {
  const user = process.env.EMAIL_USER, pass = process.env.EMAIL_PASSWORD
  if (!user || !pass) return null
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: parseInt(process.env.EMAIL_PORT || '587', 10) === 465,
    auth: { user, pass },
  })
}

// ── GET /api/invoices/stats ────────────────────────────────
router.get('/stats', auth, ALLOWED, async (req, res) => {
  try {
    const [agg, countByStatus, recentIssuers] = await Promise.all([
      Invoice.aggregate([{
        $group: {
          _id: '$currency',
          total: { $sum: '$totalDue' },
          paid:  { $sum: { $cond: [{ $eq: ['$status','paid'] }, '$totalDue', 0] } },
          count: { $sum: 1 },
        }
      }]),
      Invoice.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Invoice.aggregate([
        { $group: { _id: '$issuedBy', count: { $sum: 1 }, total: { $sum: '$totalDue' } } },
        { $sort: { count: -1 } }, { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: { $concat: ['$user.firstName', ' ', '$user.lastName'] }, count: 1, total: 1, role: '$user.role' } },
      ]),
    ])
    const statusMap = {}
    countByStatus.forEach(c => { statusMap[c._id] = c.count })
    return res.json({ success: true, data: { byCurrency: agg, statusMap, recentIssuers } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── GET /api/invoices ──────────────────────────────────────
router.get('/', auth, ALLOWED, async (req, res) => {
  try {
    const { status, currency, search, page = 1, limit = 30, issuedBy } = req.query
    const filter = {}
    if (status && status !== 'all') filter.status = status
    if (currency && currency !== 'all') filter.currency = currency
    if (issuedBy) filter.issuedBy = issuedBy
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [{ invoiceNo: re }, { billedToName: re }, { billedToEmail: re }, { studentName: re }]
    }
    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitN  = Math.min(100, parseInt(limit) || 30)
    const [invoices, total] = await Promise.all([
      Invoice.find(filter).sort({ createdAt: -1 }).skip((pageNum-1)*limitN).limit(limitN)
        .populate('issuedBy', 'firstName lastName role').lean(),
      Invoice.countDocuments(filter),
    ])
    return res.json({ success: true, data: { invoices, total, page: pageNum, totalPages: Math.ceil(total/limitN) } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── GET /api/invoices/:id ─────────────────────────────────
router.get('/:id', auth, ALLOWED, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).populate('issuedBy','firstName lastName role email').lean()
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' })
    return res.json({ success: true, data: { invoice: inv } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── POST /api/invoices ────────────────────────────────────
router.post('/', auth, ALLOWED, async (req, res) => {
  try {
    const {
      invoiceNo: providedNo, issueDate, dueDate,
      billedToName, billedToAddress, billedToEmail,
      studentName, studentGrade, subject, programmeLabel,
      lineItems, currency, discount, vatPct, notes, paymentNote,
      sendEmail,
    } = req.body

    if (!billedToName?.trim()) return res.status(400).json({ success: false, message: 'Billed-to name is required.' })
    if (!lineItems?.length)    return res.status(400).json({ success: false, message: 'At least one line item is required.' })

    const invoiceNo = providedNo?.trim() || await nextInvoiceNo()
    const items = lineItems.filter(it => it.description?.trim())
    const subtotal  = items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0)
    const disc      = parseFloat(discount) || 0
    const vPct      = parseFloat(vatPct)   || 0
    const vatAmount = (subtotal - disc) * (vPct / 100)
    const totalDue  = subtotal - disc + vatAmount

    const inv = await Invoice.create({
      invoiceNo, issueDate: issueDate || new Date(),
      dueDate: dueDate || null,
      billedToName: billedToName.trim(),
      billedToAddress: billedToAddress?.trim() || '',
      billedToEmail:   billedToEmail?.trim()?.toLowerCase() || '',
      studentName:  studentName?.trim()  || '',
      studentGrade: studentGrade?.trim() || '',
      subject:      subject?.trim()      || '',
      programmeLabel: programmeLabel?.trim() || '',
      lineItems: items.map(it => ({
        description: it.description,
        sessions:    it.sessions   || '',
        duration:    it.duration   || '',
        ratePerHr:   parseFloat(it.ratePerHr) || 0,
        amount:      parseFloat(it.amount) || 0,
      })),
      currency: currency || 'USD',
      subtotal, discount: disc, vatPct: vPct, vatAmount, totalDue,
      notes: notes?.trim() || '', paymentNote: paymentNote?.trim() || '',
      status: 'sent', issuedBy: req.user._id,
    })

    // Auto-email if requested and email provided
    if (sendEmail && billedToEmail) {
      const t = getTransporter()
      if (t) {
        const from = process.env.EMAIL_FROM || 'Smartious Billing <hellosmartious@gmail.com>'
        t.sendMail({
          from, to: billedToEmail,
          subject: `Invoice ${invoiceNo} — Smartious Homeschool Global`,
          html: buildInvoiceEmailHTML(inv),
          text: `Dear ${billedToName},\n\nPlease find your invoice ${invoiceNo} for ${totalDue.toLocaleString('en-US',{minimumFractionDigits:2})} ${currency} attached.\n\nPayment is due by ${dueDate ? new Date(dueDate).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : 'the due date on the invoice'}.\n\nKind regards,\nSmartious Homeschool Global`,
        }).then(async () => {
          await Invoice.findByIdAndUpdate(inv._id, { emailSentTo: billedToEmail, emailSentAt: new Date() })
        }).catch(e => console.error('[invoice email]', e.message))
      }
    }

    console.log('[invoices] Created', invoiceNo, 'by', req.user.email, '| total:', totalDue, currency)
    return res.status(201).json({ success: true, data: { invoice: inv } })
  } catch (e) {
    console.error('[invoices create]', e.message)
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Invoice number already exists.' })
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── PATCH /api/invoices/:id/status ───────────────────────
router.patch('/:id/status', auth, ALLOWED, async (req, res) => {
  try {
    const { status, paidAmount, paidAt } = req.body
    const VALID = ['draft','sent','paid','overdue','cancelled']
    if (!VALID.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' })
    const upd = { status }
    if (status === 'paid') { upd.paidAt = paidAt || new Date(); upd.paidAmount = paidAmount || 0 }
    const inv = await Invoice.findByIdAndUpdate(req.params.id, { $set: upd }, { new: true })
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' })
    return res.json({ success: true, data: { invoice: inv } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── POST /api/invoices/:id/resend ─────────────────────────
router.post('/:id/resend', auth, ALLOWED, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).lean()
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' })
    const email = req.body.email || inv.billedToEmail
    if (!email) return res.status(400).json({ success: false, message: 'No email address.' })
    const t = getTransporter()
    if (!t) return res.status(500).json({ success: false, message: 'Email not configured.' })
    await t.sendMail({
      from: process.env.EMAIL_FROM || 'Smartious Billing <hellosmartious@gmail.com>',
      to: email,
      subject: `Invoice ${inv.invoiceNo} — Smartious Homeschool Global`,
      html: buildInvoiceEmailHTML(inv),
    })
    await Invoice.findByIdAndUpdate(inv._id, { emailSentTo: email, emailSentAt: new Date() })
    return res.json({ success: true, message: `Invoice resent to ${email}.` })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── DELETE /api/invoices/:id ──────────────────────────────
router.delete('/:id', auth, requireRole('admin', 'accountant'), async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id)
    return res.json({ success: true, message: 'Invoice deleted.' })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── Email HTML template (notification email body) ─────────
function buildInvoiceEmailHTML(inv) {
  const money = n => Number(n).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })
  const cur = inv.currency || 'USD'
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(139,26,46,.08);">
<tr><td style="background:linear-gradient(135deg,#8B1A2E,#6E1424);padding:24px 32px;">
  <div style="font-size:22px;font-weight:800;color:#fff;">Invoice ${inv.invoiceNo}</div>
  <div style="font-size:13px;color:rgba(255,255,255,.75);margin-top:4px;">Smartious Homeschool Global</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:14px;color:#2c2c2c;line-height:1.65;margin:0 0 18px;">Dear ${inv.billedToName},</p>
  <p style="font-size:14px;color:#2c2c2c;line-height:1.65;margin:0 0 24px;">
    Please find your invoice <strong>${inv.invoiceNo}</strong> for <strong>${cur} ${money(inv.totalDue)}</strong>${inv.dueDate ? ', due by <strong>' + new Date(inv.dueDate).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) + '</strong>' : ''}.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;border-radius:8px;border:1px solid #E8E2D6;margin-bottom:24px;">
    <tr><td style="padding:14px 18px;">
      <div style="font-size:11px;color:#C9A030;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Payment Options</div>
      <p style="font-size:13px;color:#2c2c2c;line-height:1.8;margin:0;">
        <strong>M-Pesa:</strong> Paybill 247247 · A/C 745021 · Ref: ${inv.invoiceNo}<br>
        <strong>Bank:</strong> Equity Bank Kenya · A/C 0910186607556 · SWIFT: EQBLKENA<br>
        <strong>Beneficiary:</strong> Smartious Edtech
      </p>
    </td></tr>
  </table>
  <p style="font-size:12.5px;color:#6B6B6B;margin:0;">Questions? Reply to this email or contact hellosmartious@gmail.com</p>
</td></tr>
<tr><td style="background:#FDFAF4;padding:18px 32px;border-top:1px solid #f0e8e8;">
  <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool Global · smartioushomeschool.com</p>
</td></tr>
</table></td></tr></table></body></html>`
}

module.exports = router
