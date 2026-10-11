/**
 * lib/markInvoicePaid.js
 *
 * The one code path that turns an invoice into a paid invoice.
 *
 * The billing screen (PATCH /api/invoices/:id/status), confirmed
 * Paystack card payments and the legacy assessment callback all go
 * through here, so every payment:
 *   - is recorded once (the flip to 'paid' is atomic; a second call
 *     for an invoice that is already paid changes nothing),
 *   - advances the student's billing clock (User.nextDueDate), and
 *   - emails the parent a receipt with the PDF attached, unless silent.
 */

const Invoice = require('../models/Invoice')
const User    = require('../models/User')
const { getTransporter } = require('./issueInvoice')

// Guarded require: if pdfkit is missing, receipts still send without
// the PDF attachment instead of failing the payment.
let buildReceiptPdfBuffer = null
try {
  ({ buildReceiptPdfBuffer } = require('./invoicePdf'))
} catch (e) {
  console.warn('[markInvoicePaid] receipt PDF disabled -', e.message)
}

function receiptNoFor(inv) {
  return 'SM-RCP-' + String(inv.invoiceNo).replace('SM-INV-', '')
}

/**
 * Paying an invoice must also advance the STUDENT's billing clock.
 * Fee reminders are driven by User.nextDueDate, entirely separate from
 * invoice documents, so without this a parent who has paid keeps
 * receiving "fees due" nags until the next cycle rolls over by itself.
 * One payment = one cycle forward, reminder flag reset.
 */
async function advanceBillingClock(inv) {
  if (!inv.studentId) return
  try {
    const student = await User.findById(inv.studentId).select('nextDueDate billingDay')
    if (!student) return
    const now = new Date()
    // Base the roll-forward on the cycle being settled: the current
    // due date if it is recent, otherwise today (very stale clocks
    // jump straight to next month rather than replaying the past).
    const base = student.nextDueDate && (now - new Date(student.nextDueDate)) < 45 * 24 * 3600 * 1000 && new Date(student.nextDueDate) > new Date(now.getTime() - 45 * 24 * 3600 * 1000)
      ? new Date(student.nextDueDate) : now
    const next = new Date(base)
    next.setMonth(next.getMonth() + 1)
    if (student.billingDay >= 1 && student.billingDay <= 28) next.setDate(student.billingDay)
    await User.updateOne({ _id: inv.studentId }, { $set: { nextDueDate: next, feeReminderSent: null } })
    console.log(`[invoices] ${inv.invoiceNo} paid; ${inv.studentName || inv.studentId} billing clock advanced to ${next.toDateString()}`)
  } catch (e) { console.error('[invoices] clock advance failed:', e.message) }
}

function sendReceipt(inv) {
  if (!inv.billedToEmail) return
  const t = getTransporter()
  if (!t) return
  const receiptNo = receiptNoFor(inv)
  // Background send so the caller is not blocked by SMTP.
  ;(async () => {
    let attachments = []
    try {
      if (buildReceiptPdfBuffer) {
        const pdf = await buildReceiptPdfBuffer(inv, receiptNo)
        attachments = [{ filename: `${receiptNo}.pdf`, content: pdf, contentType: 'application/pdf' }]
      }
    } catch (e) { console.error('[receipt pdf]', e.message) }
    await t.sendMail({ from: process.env.EMAIL_FROM || 'Smartious Billing <hello@smartioushomeschool.com>',
      to: inv.billedToEmail,
      subject: `Payment receipt ${receiptNo} — Smartious Homeschool Global`,
      html: buildReceiptEmailHTML(inv, receiptNo),
      attachments,
    })
  })().catch(e => console.error('[receipt email]', e.message))
}

/**
 * Mark an invoice paid.
 *
 * @param {String|ObjectId} invoiceId
 * @param {Object}  opts
 * @param {Number}  [opts.paidAmount]  total received on the invoice. When
 *                  missing or 0, defaults to the full amount, i.e. what
 *                  was already recorded plus the remaining balance.
 * @param {Date}    [opts.paidAt]      defaults to now
 * @param {String}  [opts.note]        appended to the invoice's paymentNote
 * @param {String}  [opts.source]      'manual' | 'paystack' | 'paystack-legacy' | ...
 * @param {ObjectId}[opts.actorId]     user who recorded the payment
 * @param {Boolean} [opts.silent]      true = no receipt email
 * @returns {Promise<{ invoice: Object|null, changed: Boolean }>}
 *          invoice is null when no invoice has that id; changed is
 *          false when it was already paid (nothing was done).
 */
async function markInvoicePaid(invoiceId, { paidAmount, paidAt, note = '', source = 'manual', actorId = null, silent = false } = {}) {
  const current = await Invoice.findById(invoiceId).select('totalDue paidAmount status paymentNote').lean()
  if (!current) return { invoice: null, changed: false }
  if (current.status === 'paid') {
    return { invoice: await Invoice.findById(invoiceId), changed: false }
  }

  const prior = Number(current.paidAmount || 0)
  const total = Number(current.totalDue || 0)
  const given = Number(paidAmount)
  const amount = Number.isFinite(given) && given > 0 ? given : Math.max(total, prior)

  const upd = {
    status: 'paid',
    paidAt: paidAt ? new Date(paidAt) : new Date(),
    paidAmount: amount,
    paidSource: source || 'manual',
    paidMarkedBy: actorId || null,
  }
  const n = String(note || '').trim()
  if (n) upd.paymentNote = [String(current.paymentNote || '').trim(), n].filter(Boolean).join(' | ')

  // Atomic: of two simultaneous calls only one sees status != 'paid',
  // so the clock moves once and one receipt goes out.
  const inv = await Invoice.findOneAndUpdate(
    { _id: invoiceId, status: { $ne: 'paid' } },
    { $set: upd },
    { new: true }
  )
  if (!inv) return { invoice: await Invoice.findById(invoiceId), changed: false }

  console.log(`[markInvoicePaid] ${inv.invoiceNo} paid (${inv.currency} ${amount}) via ${upd.paidSource}`)
  await advanceBillingClock(inv)
  if (!silent) sendReceipt(inv)
  return { invoice: inv, changed: true }
}

function buildReceiptEmailHTML(inv, receiptNo) {
  const m = n=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  const fmtDate = d=>{ try{ return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) }catch{return ''} }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F0FDF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#F0FDF4;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#065F46,#047857);padding:24px 32px;">
  <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6EE7B7;margin-bottom:6px;">Payment Confirmed</div>
  <div style="font-size:20px;font-weight:800;color:#fff;">Receipt ${receiptNo}</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 18px;">Dear ${inv.billedToName},</p>
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 20px;">
    Thank you — we have received <strong>${inv.currency} ${m(inv.totalDue)}</strong> for invoice <strong>${inv.invoiceNo}</strong>${inv.studentName?' for '+inv.studentName+"'s tuition":''}.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border-radius:8px;border:1.5px solid #6EE7B7;margin-bottom:24px;">
    <tr><td style="padding:14px 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12.5px;color:#2c2c2c;">
        <tr><td style="padding:3px 0;color:#6B6B6B">Receipt No.</td><td style="text-align:right;font-weight:700">${receiptNo}</td></tr>
        <tr><td style="padding:3px 0;color:#6B6B6B">Paid on</td><td style="text-align:right;font-weight:700">${fmtDate(inv.paidAt||new Date())}</td></tr>
        <tr><td style="padding:6px 0 0;font-weight:800;font-size:14px">Amount received</td><td style="text-align:right;font-weight:800;font-size:14px;color:#065F46">${inv.currency} ${m(inv.totalDue)}</td></tr>
      </table>
    </td></tr>
  </table>
  <p style="font-size:12px;color:#6B6B6B;margin:0;">Questions? hello@smartioushomeschool.com</p>
</td></tr>
<tr><td style="background:#F0FDF4;padding:16px 32px;border-top:1px solid #D1FAE5;">
  <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool Global</p>
</td></tr>
</table></td></tr></table></body></html>`
}

module.exports = { markInvoicePaid, advanceBillingClock, buildReceiptEmailHTML, receiptNoFor }
