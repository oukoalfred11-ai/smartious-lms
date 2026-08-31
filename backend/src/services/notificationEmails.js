/**
 * services/notificationEmails.js
 * ============================================================
 * Branded transactional emails for the student session system
 * and community birthdays. Zero emojis by policy.
 *
 *   sendPauseNotice({ student, parentEmails, pause, typeLabel })
 *   sendReportBackNotice({ student, parentEmails, auto })
 *   sendBirthdayEmail(user)
 *
 * All senders are best-effort: failures are logged, never thrown,
 * so an SMTP hiccup can never break a pause or a cron run.
 */
const nodemailer = require('nodemailer')

const CRIMSON = '#7D1025'
const GOLD = '#C9A030'

let transporter = null
function getTransporter() {
  if (transporter) return transporter
  const user = process.env.EMAIL_USER, pass = process.env.EMAIL_PASSWORD
  if (!user || !pass) return null
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: parseInt(process.env.EMAIL_PORT || '587', 10) === 465,
    auth: { user, pass },
  })
  return transporter
}

const FROM = () => process.env.EMAIL_FROM || 'Smartious Homeschool Global <hello@smartioushomeschool.com>'

const fmtDate = d => {
  if (!d) return null
  const dt = new Date(d)
  return isNaN(dt) ? null : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function brandWrap(title, bodyHtml) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F4F1EA;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 12px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(8,12,20,.08);">
      <div style="height:7px;background:${CRIMSON};"></div>
      <div style="height:3px;background:${GOLD};"></div>
      <div style="padding:28px 32px 8px;">
        <div style="font-size:11px;letter-spacing:3px;color:${GOLD};font-weight:bold;">SMARTIOUS HOMESCHOOL GLOBAL</div>
        <h1 style="margin:12px 0 0;font-size:22px;color:#080C14;font-family:Georgia,serif;">${title}</h1>
      </div>
      <div style="padding:16px 32px 28px;font-size:14.5px;color:#374151;line-height:1.7;">
        ${bodyHtml}
      </div>
      <div style="background:#FDFAF4;border-top:1px solid #E8E2D6;padding:16px 32px;font-size:12px;color:#6B7280;line-height:1.6;">
        Smartious Homeschool Global &middot; Diamond Plaza Parklands and Karen, Nairobi<br/>
        hello@smartioushomeschool.com &middot; +254 745 021 212 &middot; smartioushomeschool.com
      </div>
    </div>
  </div>
</body></html>`
}

function dedupeEmails(list) {
  return [...new Set(list.map(e => String(e || '').trim().toLowerCase()).filter(e => e && e.includes('@')))]
}

async function safeSend(to, subject, html) {
  const t = getTransporter()
  if (!t) { console.warn('[notify] Email not configured; skipped:', subject); return false }
  try {
    await t.sendMail({ from: FROM(), to, subject, html })
    return true
  } catch (e) {
    console.error('[notify] Send failed:', subject, '-', e.message)
    return false
  }
}

// ── Pause notice ────────────────────────────────────────────
async function sendPauseNotice({ student, parentEmails = [], pause, typeLabel }) {
  const recipients = dedupeEmails([student.email, ...parentEmails, student.parentEmail])
  if (!recipients.length) return
  const name = `${student.firstName} ${student.lastName}`.trim()
  const expected = fmtDate(pause.expectedEnd)
  const isFee = pause.type === 'fee_hold'

  let subject, body
  if (pause.blockAccess) {
    subject = isFee
      ? `Account on hold pending fee payment - ${name}`
      : `Account paused - ${name}`
    body = `
      <p>Dear Smartious family,</p>
      <p>The student account for <strong>${name}</strong> has been placed on
      <strong>${typeLabel}</strong> and portal access is suspended for the student
      and linked parent accounts for its duration.</p>
      ${isFee ? `<p>Access will be restored as soon as payment is confirmed by our
      accounts office. You can pay via <strong>M-Pesa Paybill 745021</strong>
      (Account: ${name}) or contact us for bank transfer details.</p>` : ''}
      ${expected ? `<p>Expected return: <strong>${expected}</strong>. Access is
      restored automatically on this date.</p>` : ''}
      ${pause.note ? `<div style="background:#F9FAFB;border-left:3px solid ${GOLD};padding:10px 14px;margin:14px 0;">${pause.note}</div>` : ''}
      <p>All progress, records and learning materials are safe and will be exactly
      as they were left. If you have any questions, simply reply to this email or
      call us on +254 745 021 212.</p>
      <p>Warm regards,<br/><strong>Smartious Homeschool Global</strong></p>`
  } else {
    subject = `${typeLabel} confirmed - ${name}`
    body = `
      <p>Dear Smartious family,</p>
      <p>The student account for <strong>${name}</strong> has been marked as on
      <strong>${typeLabel}</strong>${expected ? ` until <strong>${expected}</strong>` : ''}.</p>
      <p>During this period, daily check-in and reminders are paused. The student
      portal remains fully available for homework, practice and personal studies,
      so learning can continue at a relaxed pace whenever it suits.</p>
      ${pause.note ? `<div style="background:#F9FAFB;border-left:3px solid ${GOLD};padding:10px 14px;margin:14px 0;">${pause.note}</div>` : ''}
      ${expected ? `<p>Normal schedules resume automatically on <strong>${expected}</strong>.</p>` : ''}
      <p>Enjoy the break, and see you back in class soon.</p>
      <p>Warm regards,<br/><strong>Smartious Homeschool Global</strong></p>`
  }
  await safeSend(recipients.join(', '), subject, brandWrap(subject.replace(' - ' + name, ''), body))
}

// ── Report back / welcome back ──────────────────────────────
async function sendReportBackNotice({ student, parentEmails = [], auto = false }) {
  const recipients = dedupeEmails([student.email, ...parentEmails, student.parentEmail])
  if (!recipients.length) return
  const name = `${student.firstName} ${student.lastName}`.trim()
  const subject = `Welcome back - ${name}`
  const body = `
    <p>Dear Smartious family,</p>
    <p>Great news: the account for <strong>${name}</strong> is fully active again
    ${auto ? 'following the scheduled return date' : ''}. Portal access, classes,
    check-in and reminders have all resumed as normal.</p>
    <p>Everything is exactly where it was left: lessons, homework, progress and
    materials are ready to continue.</p>
    <p>If anything looks out of place or you need help settling back in, reply to
    this email or call us on +254 745 021 212.</p>
    <p>Welcome back to class,<br/><strong>Smartious Homeschool Global</strong></p>`
  await safeSend(recipients.join(', '), subject, brandWrap('Welcome back', body))
}

// ── Community birthday ──────────────────────────────────────
async function sendBirthdayEmail(user) {
  if (!user?.email) return false
  const first = (user.firstName || '').trim() || 'Friend'
  const subject = `Happy Birthday, ${first}!`
  const body = `
    <p>Dear ${first},</p>
    <p>Everyone at Smartious wishes you a truly wonderful birthday. Today the whole
    <strong>Smartious Community</strong> celebrates you: your curiosity, your effort
    and everything you bring to our school family.</p>
    <p>May the year ahead be filled with growth, achievement and plenty of joy.
    We are proud to have you with us.</p>
    <div style="background:#FDFAF4;border:1px solid #E8E2D6;border-radius:10px;padding:16px 20px;margin:16px 0;text-align:center;">
      <div style="font-family:Georgia,serif;font-size:19px;color:${CRIMSON};font-weight:bold;">Happy Birthday from the Smartious Community</div>
      <div style="font-size:12.5px;color:#6B7280;margin-top:6px;">With warm wishes from all your teachers, classmates and the entire Smartious team.</div>
    </div>
    <p>Warm regards,<br/><strong>The Smartious Community</strong><br/>Smartious Homeschool Global</p>`
  return safeSend(user.email, subject, brandWrap('A birthday celebration', body))
}

// ── Personal birthday letter from a community member ────────
async function sendBirthdayLetterEmail({ celebrant, fromName, message }) {
  if (!celebrant?.email) return false
  const first = (celebrant.firstName || '').trim() || 'Friend'
  const subject = `A birthday letter for you, ${first}`
  const safeMessage = String(message || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
  const body = `
    <p>Dear ${first},</p>
    <p><strong>${fromName}</strong> from the Smartious Community has written you a
    birthday letter:</p>
    <div style="background:#FDFAF4;border:1px solid #E8E2D6;border-left:4px solid ${GOLD};border-radius:8px;padding:18px 22px;margin:16px 0;font-family:Georgia,serif;font-size:15px;color:#374151;line-height:1.8;">
      ${safeMessage}
      <div style="margin-top:14px;font-size:13px;color:#6B7280;font-family:Arial,sans-serif;">With warm wishes, ${fromName}</div>
    </div>
    <p>You can read all your birthday letters in your Smartious portal.</p>
    <p>Happy Birthday once again,<br/><strong>The Smartious Community</strong></p>`
  return safeSend(celebrant.email, subject, brandWrap('A birthday letter', body))
}

module.exports = { sendPauseNotice, sendReportBackNotice, sendBirthdayEmail, sendBirthdayLetterEmail }
