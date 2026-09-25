// ═══════════════════════════════════════════════════════════
// EXIT AND REINSTATEMENT EMAILS — Smartious E-School
// ═══════════════════════════════════════════════════════════
// Sent when a student is marked as left or graduated (to the
// student and every linked parent) and when an archived student
// is reinstated. Same Gmail SMTP env vars as lib/email.js.
// Failures are logged, never thrown: an email problem must not
// stop an archive or a reinstatement.

const nodemailer = require('nodemailer')

let transporter = null
const getTransporter = () => {
  if (transporter) return transporter
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD
  if (!user || !pass) { console.error('[exitEmail] EMAIL_USER and EMAIL_PASSWORD required'); return null }
  const port = parseInt(process.env.EMAIL_PORT || '587', 10)
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port, secure: port === 465, auth: { user, pass },
  })
  return transporter
}

const CRIMSON = '#7D1025'
const GOLD = '#C9A030'

const shell = (title, bodyHtml) => `
<div style="background:#F5F1E8;padding:28px 12px;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #EAE2D2;">
    <tr><td style="background:${CRIMSON};padding:26px 36px;">
      <div style="color:#fff;font-size:19px;font-weight:bold;letter-spacing:.4px;">SMARTIOUS HOMESCHOOL</div>
      <div style="color:${GOLD};font-size:12px;letter-spacing:2px;margin-top:3px;">EST. 2018</div>
    </td></tr>
    <tr><td style="padding:30px 36px 8px;">
      <div style="font-size:17px;font-weight:bold;color:${CRIMSON};margin-bottom:14px;">${title}</div>
      ${bodyHtml}
    </td></tr>
    <tr><td style="background:#FBFAF5;padding:20px 36px;border-top:1px solid #f0e8e8;">
      <p style="font-size:12px;line-height:1.55;color:#6b6b6b;margin:0 0 8px;">
        Questions? Contact us at
        <a href="mailto:hello@smartioushomeschool.com" style="color:${CRIMSON};">hello@smartioushomeschool.com</a>
        or call +254 745 021 212.
      </p>
      <p style="font-size:11px;color:#999;margin:0;">
        © ${new Date().getFullYear()} Smartious E-School · Nairobi, Kenya ·
        <a href="https://smartioushomeschool.com" style="color:#999;">smartioushomeschool.com</a>
      </p>
    </td></tr>
  </table>
</div>`

const p = (t) => `<p style="font-size:13.5px;line-height:1.7;color:#2c2c2c;margin:0 0 12px;">${t}</p>`

async function send(to, subject, html, text) {
  const t = getTransporter()
  if (!t || !to) return { success: false }
  try {
    const info = await t.sendMail({
      from: process.env.EMAIL_FROM || 'Smartious Homeschool <hello@smartioushomeschool.com>',
      to, subject, html, text,
    })
    console.log('[exitEmail] sent "' + subject + '" to ' + to)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error('[exitEmail] failed to ' + to + ':', err.message)
    return { success: false, message: err.message }
  }
}

/**
 * Exit notice. kind: 'withdrawn' or 'graduated'.
 * recipientName is who the email greets; studentName names the student,
 * so the same template serves the student and each parent.
 */
async function sendExitEmail({ to, recipientName, studentName, kind, forParent }) {
  const graduated = kind === 'graduated'
  const who = forParent ? (studentName + '’s') : 'your'
  const subject = graduated
    ? 'Smartious Homeschool, Completion of Studies'
    : 'Smartious Homeschool, Account Update'
  const opening = graduated
    ? p('Congratulations! ' + (forParent ? studentName + ' has' : 'You have') + ' completed studies at Smartious Homeschool. It has been a privilege to be part of that journey.')
    : p('This is to confirm that ' + who + ' student account at Smartious Homeschool has been closed following departure from the school.')
  const body =
    opening +
    p('All academic records, results and certificates remain safely stored in our archives. Nothing has been deleted.') +
    p('The door stays open. If circumstances change and ' + (forParent ? studentName + ' wishes' : 'you wish') + ' to return, simply contact the school and the account will be restored with its full history, exactly as it was left.') +
    p('We wish ' + (forParent ? studentName : 'you') + ' every success ahead. Learn without limits.')
  const html = shell(graduated ? 'Congratulations, ' + (recipientName || 'Friend') : 'Dear ' + (recipientName || 'Friend'), body)
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim()
  return send(to, subject, html, text)
}

/** Welcome back notice after reinstatement. */
async function sendReinstateEmail({ to, recipientName, studentName, forParent }) {
  const body =
    p('Welcome back! ' + (forParent ? (studentName + '’s') : 'Your') + ' Smartious Homeschool account has been restored, with all records and history exactly as they were.') +
    p((forParent ? studentName : 'You') + ' can log in with the same credentials as before. If the password has been forgotten, use the password reset on the login page or contact the school.') +
    p('Classes and timetable placements will be arranged by the academic team. We are delighted to have ' + (forParent ? studentName : 'you') + ' with us again.')
  const html = shell('Dear ' + (recipientName || 'Friend'), body)
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim()
  return send(to, 'Smartious Homeschool, Welcome Back', html, text)
}

module.exports = { sendExitEmail, sendReinstateEmail }
