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


// ── Receipt HTML builder ───────────────────────────────────
function buildReceiptHTML(inv) {
  const esc   = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const money = n => Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) } catch { return String(d||'') } }
  const cur = esc(inv.currency||'USD')
  const receiptNo = 'SM-RCP-' + String(inv.invoiceNo||'').replace('SM-INV-','')
  const items = (inv.lineItems||[]).filter(it=>(it.description||'').trim())
  const totalHours = items.reduce((s,it)=>{const n=parseInt(String(it.sessions||'').match(/\d+/)?.[0]||'0');return s+n},0)

  const itemRows = items.map(it=>`<tr>
    <td class="desc">${esc(it.description)}</td>
    <td class="c">${esc(it.sessions)}</td>
    <td class="c">${esc(it.duration)}</td>
    <td class="r">${it.ratePerHr?'$'+money(it.ratePerHr):''}</td>
    <td class="r">$${money(it.amount)}</td>
  </tr>`).join('')

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Receipt ${esc(receiptNo)} — Smartious</title>
<style>
  :root{--cr:#7D1025;--crD:#5A0B1B;--gold:#C9A030;--green:#065F46;--greenBg:#D1FAE5;--ink:#1A1A1A;--mute:#6B6B6B;--line:#E8E2D6;--cream:#FBFAF5;}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#ddd;color:var(--ink)}
  .page{width:210mm;min-height:297mm;background:#fff;margin:60px auto 20px;display:flex;flex-direction:column;box-shadow:0 4px 24px rgba(0,0,0,.15)}
  .page-body{padding:0 20mm;flex:1}
  .topbar{height:6mm;background:linear-gradient(90deg,var(--green),#047857)}
  .hd{display:flex;justify-content:space-between;align-items:flex-start;padding:10mm 20mm 0}
  .brand{display:flex;align-items:center;gap:10px}
  .shield{width:46px;height:52px;flex-shrink:0}
  .brand-tx .name{font-size:22px;font-weight:800;letter-spacing:-.5px;line-height:1}
  .brand-tx .name em{font-style:italic;color:var(--cr)}
  .brand-tx .sub{font-size:7px;letter-spacing:3px;color:var(--mute);margin-top:3px;font-weight:600}
  .hd-r{text-align:right}
  .doc-eyebrow{font-size:9px;letter-spacing:2px;color:var(--mute);text-transform:uppercase;margin-bottom:4px}
  .doc-title{font-size:36px;font-weight:800;color:var(--green);line-height:1}
  .doc-rule{height:2.5px;background:var(--gold);margin-top:5px}
  .paid-stamp{display:inline-block;border:3px solid var(--green);color:var(--green);font-size:22px;font-weight:900;letter-spacing:4px;padding:4px 18px;transform:rotate(-12deg);margin-top:8px;border-radius:4px}
  .inv-tbl{font-size:10.5px;min-width:72mm}
  .inv-tbl tr td{padding:3px 0}
  .inv-tbl td:first-child{color:var(--mute);padding-right:20px;font-weight:600;text-transform:uppercase;font-size:9px;letter-spacing:.5px}
  .inv-tbl td:last-child{font-weight:700;color:var(--ink);text-align:right}
  .bill-row{display:flex;justify-content:space-between;margin-top:7mm;gap:20px;padding-bottom:6mm;border-bottom:1px solid var(--line)}
  .bill-lbl{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--gold);text-transform:uppercase;margin-bottom:5px}
  .bill-name{font-size:17px;font-weight:800;color:var(--ink)}
  .bill-sub{font-size:11px;color:var(--mute);margin-top:2px}
  .prog-banner{background:#F0FDF4;border-left:3px solid var(--green);padding:8px 14px;margin:6mm 0;font-size:11px;font-weight:700;color:var(--green)}
  .items{border-collapse:collapse;width:100%;margin-top:2mm}
  .items thead td{background:var(--green);color:#fff;font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:8px 11px}
  .items thead td.r{text-align:right}.items thead td.c{text-align:center}
  .items tbody tr:nth-child(even){background:#F9FFF9}
  .items tbody td{border-bottom:1px solid var(--line);padding:9px 11px;font-size:11px;vertical-align:top}
  .items tbody td.r{text-align:right}.items tbody td.c{text-align:center}
  .desc{font-weight:600}
  .totals{margin-top:5mm;display:flex;justify-content:flex-end}
  .totals-box{width:76mm}
  .tr{display:flex;justify-content:space-between;padding:5px 11px;font-size:11px}
  .tr .tk{color:var(--mute)}.tr .tv{font-weight:600}
  .tr.total{background:var(--green);color:#fff;padding:10px 11px;margin-top:4px;border-radius:3px}
  .tr.total .tk,.tr.total .tv{color:#fff;font-weight:800;font-size:13px}
  .paid-box{background:#F0FDF4;border:1.5px solid var(--green);border-radius:8px;padding:14px 16px;margin-top:7mm}
  .paid-box .ph{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--green);text-transform:uppercase;margin-bottom:6px}
  .paid-box .pv{font-size:14px;font-weight:700;color:var(--green)}
  .paid-box .ps{font-size:11px;color:var(--mute);margin-top:2px}
  .thank-you{margin-top:8mm;font-size:13px;color:var(--ink);line-height:1.7}
  .ft{margin-top:auto;border-top:1px solid var(--line);padding:4mm 20mm;display:flex;justify-content:space-between;align-items:center;font-size:8.5px;color:var(--mute)}
  .toolbar{position:fixed;top:0;left:0;right:0;background:#065F46;color:#fff;padding:10px 24px;display:flex;justify-content:space-between;align-items:center;z-index:99;box-shadow:0 2px 8px rgba(0,0,0,.3)}
  .toolbar .hint{font-size:12px;opacity:.8}
  .toolbar button{background:#C9A030;color:#7D1025;border:none;padding:9px 22px;border-radius:6px;font-weight:800;font-size:13px;cursor:pointer}
  @media print{body{background:#fff}.toolbar{display:none}.page{margin:0;box-shadow:none;width:100%}@page{size:A4;margin:0}}
</style></head><body>
<div class="toolbar">
  <span class="hint">Payment receipt for ${esc(inv.billedToName)} — ${esc(inv.invoiceNo)}</span>
  <button onclick="window.print()">⬇ Download Receipt PDF</button>
</div>

<div class="page">
  <div class="topbar"></div>
  <div class="hd">
    <div class="brand">
      <svg class="shield" viewBox="0 0 60 66">
        <path d="M30 2 L56 9 V32 C56 47 44 58 30 63 C16 58 4 47 4 32 V9 Z" fill="#8A1228" stroke="#C9A030" stroke-width="1.5"/>
        <path d="M30 13 l2.3 4.7 5.2 .75 -3.75 3.65 .9 5.15 -4.65 -2.45 -4.65 2.45 .9 -5.15 -3.75 -3.65 5.2 -.75 Z" fill="#C9A030"/>
        <g transform="translate(30 42)">
          <path d="M0 -7 C-4 -10 -11 -10 -14 -8 L-14 9 C-11 7 -4 7 0 10 Z" fill="#fff"/>
          <path d="M0 -7 C4 -10 11 -10 14 -8 L14 9 C11 7 4 7 0 10 Z" fill="#fff"/>
        </g>
      </svg>
      <div class="brand-tx">
        <div class="name">Smart<em>ious</em></div>
        <div class="sub">HOMESCHOOL&nbsp;·&nbsp;GLOBAL</div>
        <div style="font-size:8px;color:#6B6B6B;margin-top:2px">EST. 2018</div>
      </div>
    </div>
    <div class="hd-r">
      <div class="doc-eyebrow">RECEIPT</div>
      <div class="doc-title">RECEIPT</div>
      <div class="doc-rule"></div>
      <div class="paid-stamp">PAID</div>
      <div style="margin-top:10px">
        <table class="inv-tbl">
          <tr><td>Receipt No.</td><td>${esc(receiptNo)}</td></tr>
          <tr><td>Invoice No.</td><td>${esc(inv.invoiceNo)}</td></tr>
          <tr><td>Issue Date</td><td>${esc(fmtDate(inv.issueDate))}</td></tr>
          <tr><td>Paid On</td><td style="color:var(--green);font-weight:800">${esc(fmtDate(inv.paidAt||new Date()))}</td></tr>
        </table>
      </div>
    </div>
  </div>

  <div class="page-body">
    <div style="font-size:9px;color:#6B6B6B;margin-top:4mm;margin-bottom:2mm">Smartious Homeschool Global · Diamond Plaza, 4th Avenue, Parklands, Nairobi · hellosmartious@gmail.com · +254 745 021 212</div>
    <div class="bill-row">
      <div>
        <div class="bill-lbl">Received From</div>
        <div class="bill-name">${esc(inv.billedToName)}</div>
        ${inv.billedToAddress?`<div class="bill-sub">${esc(inv.billedToAddress)}</div>`:''}
      </div>
      ${inv.studentName?`<div>
        <div class="bill-lbl">Student</div>
        <div class="bill-name">${esc(inv.studentName)}</div>
        <div class="bill-sub">${[inv.studentGrade,inv.subject].filter(Boolean).map(s=>`<span>${esc(s)}</span>`).join(' &nbsp;·&nbsp; ')}</div>
      </div>`:''}
    </div>

    ${inv.programmeLabel?`<div class="prog-banner">${esc(inv.programmeLabel)}</div>`:'<div style="margin-top:6mm"></div>'}

    <table class="items">
      <thead><tr>
        <td>Description</td>
        <td class="c">Sessions</td>
        <td class="c">Duration</td>
        <td class="r">Rate / hr</td>
        <td class="r">Amount</td>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="totals"><div class="totals-box">
      <div class="tr"><span class="tk">Subtotal${totalHours?' ('+totalHours+' hours)':''}</span><span class="tv">$${money(inv.subtotal)}</span></div>
      <div class="tr"><span class="tk">Discount</span><span class="tv">${(inv.discount||0)>0?'$'+money(inv.discount):'—'}</span></div>
      <div class="tr total"><span class="tk">AMOUNT RECEIVED (${cur})</span><span class="tv">$${money(inv.totalDue)}</span></div>
    </div></div>

    <div class="paid-box">
      <div class="ph">Payment confirmed</div>
      <div class="pv">${cur} ${money(inv.totalDue)} — Received in full</div>
      <div class="ps">Paid on ${esc(fmtDate(inv.paidAt||new Date()))} · Invoice ${esc(inv.invoiceNo)}</div>
    </div>

    <div class="thank-you">
      <p>Thank you for choosing Smartious Homeschool Global${inv.studentName?' for '+esc(inv.studentName)+"'s education":''}. This receipt confirms full payment of the above invoice. Please retain it for your records.</p>
    </div>
  </div>

  <div class="ft">
    <span>smartioushomeschool.com · hellosmartious@gmail.com · +254 745 021 212</span>
    <span>Official Receipt — Page 1</span>
  </div>
</div>

</body></html>`
}

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

    // Auto-send receipt email when marked paid
    if (status === 'paid' && inv.billedToEmail) {
      const t = getTransporter()
      if (t) {
        const from = process.env.EMAIL_FROM || 'Smartious Billing <hellosmartious@gmail.com>'
        const receiptNo = 'SM-RCP-' + String(inv.invoiceNo||'').replace('SM-INV-','')
        t.sendMail({
          from, to: inv.billedToEmail,
          subject: `Payment receipt ${receiptNo} — Smartious Homeschool Global`,
          html: buildReceiptEmailHTML(inv, receiptNo),
        }).then(() => console.log('[receipt] Sent to', inv.billedToEmail))
          .catch(e => console.error('[receipt email]', e.message))
      }
    }

    return res.json({ success: true, data: { invoice: inv } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── GET /api/invoices/:id/receipt-html ────────────────────
// Returns the receipt HTML for the frontend to open in a new window
router.get('/:id/receipt-html', auth, ALLOWED, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).lean()
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' })
    if (inv.status !== 'paid') return res.status(400).json({ success: false, message: 'Receipt can only be issued for paid invoices.' })
    const html = buildReceiptHTML(inv)
    return res.json({ success: true, data: { html } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── Receipt notification email (shorter than full HTML receipt) ──
function buildReceiptEmailHTML(inv, receiptNo) {
  const money = n => Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) } catch { return '' } }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F0FDF4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(6,95,70,.1);">
<tr><td style="background:linear-gradient(135deg,#065F46,#047857);padding:24px 32px;">
  <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6EE7B7;margin-bottom:6px;">Payment Confirmed</div>
  <div style="font-size:22px;font-weight:800;color:#fff;">Receipt ${receiptNo}</div>
  <div style="font-size:13px;color:rgba(255,255,255,.75);margin-top:4px;">Smartious Homeschool Global</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:15px;color:#2c2c2c;line-height:1.65;margin:0 0 18px;">Dear ${inv.billedToName},</p>
  <p style="font-size:14px;color:#2c2c2c;line-height:1.65;margin:0 0 20px;">
    Thank you — we have received your payment of <strong>${inv.currency} ${money(inv.totalDue)}</strong> for invoice <strong>${inv.invoiceNo}</strong>${inv.studentName?' for '+inv.studentName+"'s tuition":''}.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border-radius:8px;border:1.5px solid #6EE7B7;margin-bottom:24px;">
    <tr><td style="padding:16px 18px;">
      <div style="font-size:11px;color:#065F46;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">Payment summary</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12.5px;color:#2c2c2c;">
        <tr><td style="padding:3px 0;color:#6B6B6B">Receipt No.</td><td style="text-align:right;font-weight:700">${receiptNo}</td></tr>
        <tr><td style="padding:3px 0;color:#6B6B6B">Invoice No.</td><td style="text-align:right;font-weight:700">${inv.invoiceNo}</td></tr>
        <tr><td style="padding:3px 0;color:#6B6B6B">Paid on</td><td style="text-align:right;font-weight:700">${fmtDate(inv.paidAt||new Date())}</td></tr>
        <tr><td style="padding:6px 0 0;font-weight:800;font-size:14px">Amount received</td><td style="text-align:right;font-weight:800;font-size:14px;color:#065F46">${inv.currency} ${money(inv.totalDue)}</td></tr>
      </table>
    </td></tr>
  </table>
  <p style="font-size:12.5px;color:#6B6B6B;margin:0;">Please retain this email as your payment receipt. Questions? Contact hellosmartious@gmail.com</p>
</td></tr>
<tr><td style="background:#F0FDF4;padding:18px 32px;border-top:1px solid #D1FAE5;">
  <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool Global · smartioushomeschool.com</p>
</td></tr>
</table></td></tr></table></body></html>`
}

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


// ── GET /api/invoices/sales-performance ───────────────────
// Sales officer's own performance stats.
// Cycle: 15th of each month to 14th of the next.
// Commission: 3% of total sales + KES 40,000 retainer.
router.get('/sales-performance', auth, requireRole('admin', 'sales', 'ops_manager'), async (req, res) => {
  try {
    // Determine cycle: query param ?cycle=YYYY-MM or current cycle
    let cycleStart, cycleEnd
    const { cycle, userId } = req.query

    // Who are we reporting on?
    // Sales officer sees only themselves; admin/ops can query anyone
    const targetUserId = (req.user.role === 'sales')
      ? req.user._id
      : (userId || req.user._id)

    if (cycle) {
      const [yr, mo] = cycle.split('-').map(Number)
      cycleStart = new Date(yr, mo - 1, 15)
      cycleEnd   = new Date(yr, mo, 15)
    } else {
      const now = new Date()
      const day = now.getDate()
      if (day >= 15) {
        cycleStart = new Date(now.getFullYear(), now.getMonth(), 15)
        cycleEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 15)
      } else {
        cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, 15)
        cycleEnd   = new Date(now.getFullYear(), now.getMonth(), 15)
      }
    }

    // Build the last 12 cycles for the cycle picker
    const cycles = []
    let d = new Date()
    for (let i = 0; i < 13; i++) {
      const yr = d.getFullYear()
      const mo = d.getMonth()
      const s  = new Date(yr, mo - i, 15)
      const e  = new Date(yr, mo - i + 1, 15)
      const label = s.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
        + ' – ' + new Date(e - 1).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
      cycles.push({
        key: s.getFullYear() + '-' + String(s.getMonth() + 1).padStart(2,'0'),
        label,
        start: s,
        end: e,
      })
    }

    const filter = {
      issuedBy: targetUserId,
      createdAt: { $gte: cycleStart, $lt: cycleEnd },
    }

    // Current cycle invoices
    const [allInvoices, paidInvoices, prevCycles] = await Promise.all([
      Invoice.find(filter).sort({ createdAt: -1 })
        .populate('issuedBy', 'firstName lastName role').lean(),
      Invoice.find({ ...filter, status: 'paid' }).lean(),
      // Last 6 cycles for trend
      Promise.all(cycles.slice(0, 7).map(async c => {
        const f = { issuedBy: targetUserId, createdAt: { $gte: c.start, $lt: c.end } }
        const [total, paid] = await Promise.all([
          Invoice.countDocuments(f),
          Invoice.aggregate([{ $match: { ...f, status: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalDue' } } }]),
        ])
        return {
          cycle:  c.label,
          key:    c.key,
          count:  total,
          sales:  paid[0]?.total || 0,
        }
      })),
    ])

    // Totals for current cycle
    const totalInvoiced = allInvoices.length
    const totalPaid     = paidInvoices.length
    const totalPending  = allInvoices.filter(i => i.status === 'sent' || i.status === 'draft').length
    const salesVolume   = paidInvoices.reduce((s, i) => s + (i.totalDue || 0), 0)

    // Earnings
    const COMMISSION_RATE = 0.03
    const RETAINER_KES    = 40000
    const commissionUSD   = salesVolume * COMMISSION_RATE   // 3% of USD sales
    const totalEarnings   = {
      retainerKES:   RETAINER_KES,
      commissionRate: COMMISSION_RATE,
      salesVolume,
      commissionUSD,
      commissionKES: commissionUSD * 130, // approximate KES conversion — adjust as needed
      note: 'Commission is 3% of total paid invoice value. Retainer is KES 40,000/month.',
    }

    // Group invoices by currency
    const byCurrency = {}
    paidInvoices.forEach(i => {
      if (!byCurrency[i.currency]) byCurrency[i.currency] = 0
      byCurrency[i.currency] += i.totalDue || 0
    })

    return res.json({
      success: true,
      data: {
        officer: allInvoices[0]?.issuedBy || { _id: targetUserId },
        cycle: {
          start: cycleStart,
          end:   cycleEnd,
          label: cycleStart.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
            + ' – ' + new Date(cycleEnd - 1).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
        },
        summary: { totalInvoiced, totalPaid, totalPending, salesVolume, byCurrency },
        earnings: totalEarnings,
        invoices: allInvoices,
        trend:    prevCycles,
        availableCycles: cycles.map(c => ({ key: c.key, label: c.label })),
      },
    })
  } catch (e) {
    console.error('[sales-performance]', e.message)
    return res.status(500).json({ success: false, message: e.message })
  }
})

module.exports = router
