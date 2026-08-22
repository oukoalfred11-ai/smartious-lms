/**
 * lib/invoiceReminders.js
 *
 * Decides which invoices need chasing, sends the reminder, and records
 * what was sent so the accountant has a full history.
 *
 * The rule the school asked for:
 *   A reminder goes out 3 days before the service period ends, so the
 *   parent can pay before the next block of tuition starts. If the
 *   student is on a break, no reminder is sent.
 *
 * After the period has ended, the invoice becomes due and then overdue,
 * and the escalating reminders continue on a fixed cadence.
 */

const Invoice = require('../models/Invoice')
const User = require('../models/User')
const { getTransporter } = require('./issueInvoice')
const { resolveStudentRecipients } = require('./recipients')

// Reminder sent this many days before the service period ends.
const DAYS_BEFORE_PERIOD_END = 3
// Minimum gap between two automatic reminders on the same invoice, so a
// parent is not emailed every night once an invoice goes overdue.
const MIN_DAYS_BETWEEN_REMINDERS = 3

const startOfDay = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000)

/**
 * Which reminder, if any, does this invoice need today?
 * Returns null when nothing should be sent.
 *
 * Exported separately so it can be unit tested without a database.
 */
function reminderKindFor(invoice, now = new Date()) {
  if (!invoice) return null
  if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'draft') return null
  if (invoice.autoRemind === false) return null

  // Respect the minimum gap between automatic reminders.
  if (invoice.lastReminderAt && daysBetween(invoice.lastReminderAt, now) < MIN_DAYS_BETWEEN_REMINDERS) return null

  const periodEnd = invoice.servicePeriodEnd ? startOfDay(invoice.servicePeriodEnd) : null
  const dueDate   = invoice.dueDate ? startOfDay(invoice.dueDate) : null
  const today     = startOfDay(now)

  // Overdue takes priority: past the due date and still unpaid.
  if (dueDate && today > dueDate) return 'overdue'

  // Due today or in the past two days.
  if (dueDate && daysBetween(today, dueDate) >= 0 && daysBetween(today, dueDate) <= 1) return 'due'

  // The main rule: three days before the service period ends.
  if (periodEnd) {
    const daysLeft = daysBetween(today, periodEnd)
    if (daysLeft >= 0 && daysLeft <= DAYS_BEFORE_PERIOD_END) return 'upcoming'
    if (daysLeft < 0) return 'overdue'   // period finished, still unpaid
  }

  return null
}

/**
 * Is this invoice's student currently on a break?
 * A student with no linked record is treated as active, because the
 * alternative would silently stop chasing legitimate debts.
 */
async function studentIsOnBreak(invoice) {
  if (!invoice.studentId) return false
  try {
    const student = await User.findById(invoice.studentId).select('onBreak breakStart breakEnd').lean()
    if (!student || !student.onBreak) return false
    // If the break has a defined window, only honour it while current.
    const now = new Date()
    if (student.breakEnd && new Date(student.breakEnd) < now) return false
    if (student.breakStart && new Date(student.breakStart) > now) return false
    return true
  } catch {
    return false
  }
}

const money = (n, cur) =>
  `${cur || 'USD'} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

const HEADLINES = {
  upcoming: 'Your next tuition payment is due shortly',
  due:      'Your tuition payment is due',
  overdue:  'Your tuition payment is overdue',
  manual:   'A reminder about your invoice',
}

function buildReminderHTML(inv, kind) {
  const outstanding = Number(inv.totalDue || 0) - Number(inv.paidAmount || 0)
  const isOverdue = kind === 'overdue'
  const accent = isOverdue ? '#B91C1C' : '#8B1A2E'

  let lead
  if (kind === 'upcoming') {
    lead = `The tuition period covered by this invoice ends on <strong>${fmtDate(inv.servicePeriodEnd)}</strong>. To keep ${inv.studentName || 'your child'}'s lessons running without interruption, please settle the balance before that date.`
  } else if (kind === 'due') {
    lead = `Invoice <strong>${inv.invoiceNo}</strong> is due${inv.dueDate ? ' on <strong>' + fmtDate(inv.dueDate) + '</strong>' : ''}. Please settle the balance at your earliest convenience.`
  } else if (kind === 'overdue') {
    lead = `Invoice <strong>${inv.invoiceNo}</strong> was due on <strong>${fmtDate(inv.dueDate || inv.servicePeriodEnd)}</strong> and remains unpaid. Please arrange payment so lessons can continue uninterrupted.`
  } else {
    lead = `This is a reminder about invoice <strong>${inv.invoiceNo}</strong>.`
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#FDFAF4;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);">

  <tr><td style="background:linear-gradient(135deg,${accent},#6E1424);padding:24px 32px;">
    <div style="font-size:11px;font-weight:700;color:#F0CC5A;letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;">
      ${isOverdue ? 'Payment overdue' : 'Payment reminder'}
    </div>
    <div style="font-size:20px;font-weight:800;color:#fff;">${HEADLINES[kind] || HEADLINES.manual}</div>
  </td></tr>

  <tr><td style="padding:26px 32px;">
    <p style="font-size:14.5px;line-height:1.7;color:#2c2c2c;margin:0 0 16px;">Dear ${inv.billedToName},</p>
    <p style="font-size:14.5px;line-height:1.7;color:#2c2c2c;margin:0 0 20px;">${lead}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8e8;border-radius:8px;margin-bottom:20px;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #f5efef;">
        <span style="font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:.06em;">Invoice</span><br>
        <span style="font-size:15px;font-weight:700;color:#1a1a1a;">${inv.invoiceNo}</span>
      </td></tr>
      ${inv.studentName ? `<tr><td style="padding:14px 18px;border-bottom:1px solid #f5efef;">
        <span style="font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:.06em;">Student</span><br>
        <span style="font-size:14px;color:#1a1a1a;">${inv.studentName}${inv.studentGrade ? ' &middot; ' + inv.studentGrade : ''}</span>
      </td></tr>` : ''}
      ${inv.servicePeriodStart && inv.servicePeriodEnd ? `<tr><td style="padding:14px 18px;border-bottom:1px solid #f5efef;">
        <span style="font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:.06em;">Period covered</span><br>
        <span style="font-size:14px;color:#1a1a1a;">${fmtDate(inv.servicePeriodStart)} &ndash; ${fmtDate(inv.servicePeriodEnd)}</span>
      </td></tr>` : ''}
      <tr><td style="padding:14px 18px;background:${isOverdue ? '#FEF2F2' : '#FDFAF4'};">
        <span style="font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:.06em;">Amount outstanding</span><br>
        <span style="font-size:20px;font-weight:800;color:${accent};">${money(outstanding, inv.currency)}</span>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td width="50%" valign="top" style="padding-right:8px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8e8;border-radius:8px;overflow:hidden;">
            <tr><td style="background:#8B1A2E;padding:8px 14px;">
              <div style="font-size:11px;font-weight:800;color:#fff;letter-spacing:.06em;text-transform:uppercase;">M-Pesa</div>
              <div style="font-size:10px;color:#F7CED4;">Paying from Kenya</div>
            </td></tr>
            <tr><td style="padding:12px 14px;">
              <div style="font-size:10px;color:#6B6B6B;text-transform:uppercase;">Paybill</div>
              <div style="font-size:15px;font-weight:800;color:#1a1a1a;margin-bottom:6px;">247247</div>
              <div style="font-size:10px;color:#6B6B6B;text-transform:uppercase;">Account</div>
              <div style="font-size:15px;font-weight:800;color:#1a1a1a;margin-bottom:6px;">745021</div>
              <div style="font-size:10px;color:#6B6B6B;text-transform:uppercase;">Reference</div>
              <div style="font-size:13px;font-weight:700;color:#8B1A2E;">${inv.invoiceNo}</div>
            </td></tr>
          </table>
        </td>
        <td width="50%" valign="top" style="padding-left:8px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8e8;border-radius:8px;overflow:hidden;">
            <tr><td style="background:#C9973A;padding:8px 14px;">
              <div style="font-size:11px;font-weight:800;color:#fff;letter-spacing:.06em;text-transform:uppercase;">Bank Transfer</div>
              <div style="font-size:10px;color:#FDFAF4;">Paying from outside Kenya</div>
            </td></tr>
            <tr><td style="padding:12px 14px;">
              <div style="font-size:10px;color:#6B6B6B;text-transform:uppercase;">Bank</div>
              <div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:6px;">Equity Bank Kenya</div>
              <div style="font-size:10px;color:#6B6B6B;text-transform:uppercase;">Account</div>
              <div style="font-size:14px;font-weight:800;color:#1a1a1a;margin-bottom:6px;">0910186607556</div>
              <div style="font-size:10px;color:#6B6B6B;text-transform:uppercase;">SWIFT</div>
              <div style="font-size:13px;font-weight:700;color:#1a1a1a;">EQBLKENA</div>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size:12.5px;line-height:1.6;color:#6B6B6B;margin:0 0 18px;">
      If you have already paid, please ignore this message and accept our thanks &mdash; payments can take a day to appear against your account.
    </p>

    <p style="font-size:13.5px;line-height:1.65;color:#2c2c2c;margin:0;">
      Warm regards,<br>
      <strong style="color:#8B1A2E;font-size:15px;">${inv.issuedByName || 'Innocent Jabuya'}</strong><br>
      ${inv.issuedByTitle || 'Head of Finance'}<br>Smartious Edtech
    </p>
  </td></tr>

  <tr><td style="background:#FDFAF4;padding:18px 32px;border-top:1px solid #f0e8e8;">
    <p style="font-size:11px;color:#999;margin:0;">Questions? Reply to this email or contact hello@smartioushomeschool.com</p>
  </td></tr>
</table></td></tr></table></body></html>`
}

function buildReminderText(inv, kind) {
  const outstanding = Number(inv.totalDue || 0) - Number(inv.paidAmount || 0)
  return [
    `Dear ${inv.billedToName},`,
    '',
    kind === 'upcoming'
      ? `The tuition period covered by invoice ${inv.invoiceNo} ends on ${fmtDate(inv.servicePeriodEnd)}. Please settle the balance before that date so lessons continue uninterrupted.`
      : kind === 'overdue'
        ? `Invoice ${inv.invoiceNo} was due on ${fmtDate(inv.dueDate || inv.servicePeriodEnd)} and remains unpaid.`
        : `Invoice ${inv.invoiceNo} is due${inv.dueDate ? ' on ' + fmtDate(inv.dueDate) : ''}.`,
    '',
    `Amount outstanding: ${money(outstanding, inv.currency)}`,
    '',
    'PAYING FROM KENYA (M-Pesa):',
    '  Paybill:   247247',
    '  Account:   745021',
    `  Reference: ${inv.invoiceNo}`,
    '',
    'PAYING FROM OUTSIDE KENYA (Bank transfer):',
    '  Bank:    Equity Bank Kenya',
    '  Account: 0910186607556',
    '  SWIFT:   EQBLKENA',
    '',
    'If you have already paid, please ignore this message.',
    '',
    'Warm regards,',
    inv.issuedByName || 'Innocent Jabuya',
    inv.issuedByTitle || 'Head of Finance',
    'Smartious Edtech',
  ].join('\n')
}

/**
 * Send one reminder and record it on the invoice.
 * Used by both the scheduler and the manual "Send again" button.
 */
async function resolveInvoiceRecipients(invoice) {
  const seen = new Map()
  const add = (email, source) => {
    const e = String(email || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return
    if (!seen.has(e)) seen.set(e, [])
    if (!seen.get(e).includes(source)) seen.get(e).push(source)
  }

  // The person the invoice is addressed to is always included.
  add(invoice.billedToEmail, 'billed to')

  // Plus the student and any linked parents, so a parent attached only
  // by portal account still receives the reminder.
  if (invoice.studentId) {
    try {
      const r = await resolveStudentRecipients(invoice.studentId, { includeStudent: true })
      r.to.forEach(e => (r.sources[e] || ['linked']).forEach(src => add(e, src)))
    } catch (e) {
      console.error('[reminders] recipient resolution failed:', e.message)
    }
  }

  return { to: [...seen.keys()], sources: Object.fromEntries(seen) }
}

async function sendReminder(invoice, { kind = 'manual', sentBy = null, automatic = false, note = '' } = {}) {
  const t = getTransporter()
  if (!t) throw new Error('Email is not configured on this server.')

  const { to, sources } = await resolveInvoiceRecipients(invoice)
  if (!to.length) throw new Error('No valid email address for this invoice, its student, or their parents.')

  const from = process.env.EMAIL_FROM || 'Smartious Billing <hello@smartioushomeschool.com>'
  const subjectPrefix = kind === 'overdue' ? 'Overdue: ' : kind === 'upcoming' ? 'Reminder: ' : ''

  // One message addressed to everyone, so parent and student see the
  // same thread and either can reply to the school.
  await t.sendMail({
    from,
    to: to.join(', '),
    subject: `${subjectPrefix}Invoice ${invoice.invoiceNo} — Smartious Homeschool Global`,
    html: buildReminderHTML(invoice, kind),
    text: buildReminderText(invoice, kind),
  })

  console.log(`[reminders] ${invoice.invoiceNo} (${kind}) -> ` +
    to.map(e => `${e} [${(sources[e] || []).join(', ')}]`).join('; '))

  invoice.reminders.push({
    sentAt: new Date(), sentTo: to.join(', '), kind, sentBy, automatic, note,
  })
  invoice.lastReminderAt = new Date()
  invoice.reminderCount  = (invoice.reminderCount || 0) + 1

  // An invoice past its due date is marked overdue as we chase it, so
  // the billing list reflects reality without a separate sweep.
  if (kind === 'overdue' && invoice.status === 'sent') invoice.status = 'overdue'

  await invoice.save()
  return invoice
}

/**
 * Nightly scan. Returns a summary so the run can be logged.
 */
async function runDueReminders({ dryRun = false } = {}) {
  const now = new Date()
  const summary = { scanned: 0, sent: 0, skippedOnBreak: 0, skippedNoEmail: 0, failed: 0, details: [] }

  const candidates = await Invoice.find({
    status: { $in: ['sent', 'overdue'] },
    autoRemind: { $ne: false },
  }).limit(2000)

  for (const inv of candidates) {
    summary.scanned++

    // Self-heal: if the money already covers the invoice but the status
    // was never flipped (payment recorded elsewhere, or the old UI bug
    // that hid Mark Paid on overdue invoices), close it here instead of
    // chasing a parent who has paid.
    const outstanding = Number(inv.totalDue || 0) - Number(inv.paidAmount || 0)
    if (Number(inv.totalDue || 0) > 0 && outstanding <= 0) {
      inv.status = 'paid'
      if (!inv.paidAt) inv.paidAt = new Date()
      if (!dryRun) await inv.save()
      summary.details.push({ invoiceNo: inv.invoiceNo, action: 'healed', reason: 'paid amount covers total; status corrected to paid' })
      continue
    }

    const kind = reminderKindFor(inv, now)
    if (!kind) continue

    // An invoice with no billed-to address may still be deliverable via
    // the student's linked parents, so check properly rather than assume.
    const { to } = await resolveInvoiceRecipients(inv)
    if (!to.length) { summary.skippedNoEmail++; continue }

    if (await studentIsOnBreak(inv)) {
      summary.skippedOnBreak++
      summary.details.push({ invoiceNo: inv.invoiceNo, action: 'skipped', reason: 'student on break' })
      continue
    }

    if (dryRun) {
      summary.details.push({ invoiceNo: inv.invoiceNo, action: 'would send', kind })
      continue
    }

    try {
      await sendReminder(inv, { kind, automatic: true })
      summary.sent++
      summary.details.push({ invoiceNo: inv.invoiceNo, action: 'sent', kind, to: inv.billedToEmail })
    } catch (e) {
      summary.failed++
      summary.details.push({ invoiceNo: inv.invoiceNo, action: 'failed', error: e.message })
      console.error(`[reminders] ${inv.invoiceNo}:`, e.message)
    }
  }

  return summary
}

module.exports = {
  reminderKindFor,
  resolveInvoiceRecipients,
  studentIsOnBreak,
  sendReminder,
  runDueReminders,
  buildReminderHTML,
  buildReminderText,
  DAYS_BEFORE_PERIOD_END,
  MIN_DAYS_BETWEEN_REMINDERS,
}
