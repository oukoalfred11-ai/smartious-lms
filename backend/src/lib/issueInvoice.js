/**
 * lib/issueInvoice.js
 *
 * Single place where a Smartious invoice is created, rendered and sent.
 *
 * Both the billing screen (routes/invoices.js) and the assessment
 * workflow (routes/assessment.js) issue invoices through this module,
 * so every invoice carries the same numbering, the same PDF layout
 * with both payment panels, and the same signatory rules.
 *
 * Paystack is deliberately NOT used here. Card checkout is reserved
 * for recurring subscriptions such as Mshauri AI; one-off fees are
 * invoiced and settled by M-Pesa or bank transfer.
 */

const nodemailer = require('nodemailer')
const Invoice = require('../models/Invoice')
const { buildInvoicePdfBuffer } = require('./invoicePdf')

const SIGNATORY_FINANCE    = { name: 'Innocent Jabuya',  title: 'Head of Finance' }
const SIGNATORY_ADMISSIONS = { name: 'Manuela Murithi',  title: 'Head of Admission Team' }

function signatoryForRole(role) {
  return role === 'sales' ? SIGNATORY_ADMISSIONS : SIGNATORY_FINANCE
}

function signatoryOf(inv) {
  return {
    name:  inv?.issuedByName  || SIGNATORY_FINANCE.name,
    title: inv?.issuedByTitle || SIGNATORY_FINANCE.title,
  }
}

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

async function nextInvoiceNo() {
  const now = new Date()
  const prefix = `SM-INV-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
  const count = await Invoice.countDocuments({ invoiceNo: { $regex: `^${prefix}` } })
  return `${prefix}-${String(count+1).padStart(2,'0')}`
}

function buildInvoiceEmailHTML(inv) {
  const m = n=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  const cur = inv.currency||'USD'
  const sig = signatoryOf(inv)
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#FDFAF4;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#8B1A2E,#6E1424);padding:24px 32px;">
  <div style="font-size:20px;font-weight:800;color:#fff;">Invoice ${inv.invoiceNo}</div>
  <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;">Smartious Homeschool Global</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 18px;">Dear ${inv.billedToName},</p>
  <p style="font-size:14px;color:#2c2c2c;line-height:1.7;margin:0 0 18px;">
    Please find <strong>attached</strong> your invoice <strong>${inv.invoiceNo}</strong> for <strong>${cur} ${m(inv.totalDue)}</strong>${inv.dueDate?', due <strong>'+new Date(inv.dueDate).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})+'</strong>':''}.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;border-left:3px solid #C9A030;border-radius:4px;margin-bottom:22px;">
    <tr>
      <td style="padding:12px 16px;font-size:13px;color:#2c2c2c;line-height:1.6;">
        A PDF copy of this invoice is attached to this email for your records.
      </td>
    </tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;border-radius:8px;border:1px solid #E8E2D6;margin-bottom:24px;">
    <tr><td style="padding:14px 12px;">
      <div style="font-size:11px;color:#C9A030;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;">Payment Options</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" valign="top" style="padding:0 5px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E8E2D6;border-top:3px solid #8B1A2E;border-radius:6px;">
              <tr><td style="padding:11px 10px;">
                <div style="font-size:12px;font-weight:800;color:#1A1A1A;letter-spacing:.04em;">M-PESA</div>
                <div style="font-size:11px;color:#6B6B6B;font-style:italic;margin-bottom:10px;">Paying from Kenya</div>
                <div style="font-size:10px;color:#6B6B6B;letter-spacing:.05em;">PAYBILL</div>
                <div style="font-size:14px;font-weight:700;color:#1A1A1A;margin-bottom:7px;">247247</div>
                <div style="font-size:10px;color:#6B6B6B;letter-spacing:.05em;">ACCOUNT</div>
                <div style="font-size:14px;font-weight:700;color:#1A1A1A;margin-bottom:7px;">745021</div>
                <div style="font-size:10px;color:#6B6B6B;letter-spacing:.05em;">REFERENCE</div>
                <div style="font-size:14px;font-weight:700;color:#1A1A1A;">${inv.invoiceNo}</div>
              </td></tr>
            </table>
          </td>
          <td width="50%" valign="top" style="padding:0 0 0 5px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E8E2D6;border-top:3px solid #C9A030;border-radius:6px;">
              <tr><td style="padding:11px 10px;">
                <div style="font-size:12px;font-weight:800;color:#1A1A1A;letter-spacing:.04em;">BANK TRANSFER</div>
                <div style="font-size:11px;color:#6B6B6B;font-style:italic;margin-bottom:10px;">Paying from outside Kenya</div>
                <div style="font-size:10px;color:#6B6B6B;letter-spacing:.05em;">BANK</div>
                <div style="font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:7px;">Equity Bank Kenya</div>
                <div style="font-size:10px;color:#6B6B6B;letter-spacing:.05em;">ACCOUNT</div>
                <div style="font-size:14px;font-weight:700;color:#1A1A1A;margin-bottom:7px;">0910186607556</div>
                <div style="font-size:10px;color:#6B6B6B;letter-spacing:.05em;">SWIFT / BENEFICIARY</div>
                <div style="font-size:12px;font-weight:700;color:#1A1A1A;">EQBLKENA &nbsp;&middot;&nbsp; Smartious Edtech</div>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8E2D6;margin-bottom:16px;">
    <tr><td style="padding:16px 0 0;">
      <div style="font-size:12px;color:#6B6B6B;margin-bottom:10px;">Issued by</div>
      <div style="font-size:15px;font-weight:800;color:#8B1A2E;letter-spacing:.02em;">${sig.name}</div>
      <div style="font-size:12px;color:#6B6B6B;margin-top:2px;">${sig.title}</div>
      <div style="font-size:12px;color:#6B6B6B;">Smartious Edtech</div>
    </td></tr>
  </table>
  <p style="font-size:12px;color:#6B6B6B;margin:0;">Questions about this invoice? Contact hello@smartioushomeschool.com</p>
</td></tr>
<tr><td style="background:#FDFAF4;padding:16px 32px;border-top:1px solid #f0e8e8;">
  <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool Global</p>
</td></tr>
</table></td></tr></table></body></html>`
}

/**
 * Create an invoice, optionally emailing it with the PDF attached.
 *
 * @param {Object}  opts
 * @param {String}  opts.billedToName      required
 * @param {Array}   opts.lineItems         required, [{ description, amount, ... }]
 * @param {String}  opts.issuedByRole      determines the signatory
 * @returns {Promise<Object>} the saved Invoice document
 */
async function issueInvoice(opts = {}) {
  const {
    invoiceNo: provided, issueDate, dueDate,
    billedToName, billedToAddress, billedToEmail,
    studentName, studentGrade, subject, programmeLabel,
    lineItems = [], currency, discount, vatPct, notes, paymentNote,
    issuedBy, issuedByRole, sendEmail = true,
    // Service period drives the reminder schedule.
    studentId, servicePeriodStart, servicePeriodEnd, autoRemind,
  } = opts

  if (!billedToName || !String(billedToName).trim())
    throw new Error('Billed-to name is required.')
  const items = lineItems.filter(it => it && String(it.description || '').trim())
  if (!items.length) throw new Error('At least one line item is required.')

  const invNo    = String(provided || '').trim() || await nextInvoiceNo()
  const subtotal = items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0)
  const disc     = parseFloat(discount) || 0
  const vp       = parseFloat(vatPct) || 0
  const vatAmt   = (subtotal - disc) * (vp / 100)
  const total    = subtotal - disc + vatAmt
  const sig      = signatoryForRole(issuedByRole)

  const inv = await Invoice.create({
    invoiceNo: invNo,
    issueDate: issueDate || new Date(),
    dueDate:   dueDate || null,
    billedToName:    String(billedToName).trim(),
    billedToAddress: String(billedToAddress || '').trim(),
    billedToEmail:   String(billedToEmail || '').trim().toLowerCase(),
    studentName:     String(studentName || '').trim(),
    studentGrade:    String(studentGrade || '').trim(),
    subject:         String(subject || '').trim(),
    programmeLabel:  String(programmeLabel || '').trim(),
    lineItems: items.map(it => ({
      description: it.description,
      sessions:    it.sessions || '',
      duration:    it.duration || '',
      ratePerHr:   parseFloat(it.ratePerHr) || 0,
      amount:      parseFloat(it.amount) || 0,
    })),
    currency: currency || 'USD',
    subtotal, discount: disc, vatPct: vp, vatAmount: vatAmt, totalDue: total,
    notes:       String(notes || '').trim(),
    paymentNote: String(paymentNote || '').trim(),
    studentId: studentId || null,
    servicePeriodStart: servicePeriodStart || null,
    servicePeriodEnd:   servicePeriodEnd || null,
    autoRemind: autoRemind !== undefined ? !!autoRemind : true,
    status: 'sent',
    issuedBy: issuedBy || null,
    issuedByName:  sig.name,
    issuedByTitle: sig.title,
  })

  if (sendEmail && inv.billedToEmail) {
    const t = getTransporter()
    if (t) {
      const from = process.env.EMAIL_FROM || 'Smartious Billing <hello@smartioushomeschool.com>'
      // Sent in the background so the caller is not blocked by SMTP.
      ;(async () => {
        let attachments = []
        try {
          const pdf = await buildInvoicePdfBuffer(inv)
          attachments = [{ filename: `${invNo}.pdf`, content: pdf, contentType: 'application/pdf' }]
        } catch (e) { console.error('[issueInvoice pdf]', e.message) }
        await t.sendMail({
          from, to: inv.billedToEmail,
          subject: `Invoice ${invNo} — Smartious Homeschool Global`,
          html: buildInvoiceEmailHTML(inv),
          attachments,
        })
        await Invoice.findByIdAndUpdate(inv._id, { emailSentTo: inv.billedToEmail, emailSentAt: new Date() })
        console.log(`[issueInvoice] ${invNo} emailed to ${inv.billedToEmail}`)
      })().catch(e => console.error('[issueInvoice email]', e.message))
    }
  }

  return inv
}

module.exports = {
  issueInvoice,
  nextInvoiceNo,
  signatoryForRole,
  signatoryOf,
  getTransporter,
  buildInvoiceEmailHTML,
  SIGNATORY_FINANCE,
  SIGNATORY_ADMISSIONS,
}
