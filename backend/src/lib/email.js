// ═══════════════════════════════════════════════════════════
// EMAIL UTILITY — Smartious E-School
// Sends transactional emails via Gmail SMTP using nodemailer.
// ═══════════════════════════════════════════════════════════
//
// ENV VARS required (set on Render):
//   EMAIL_HOST     = smtp.gmail.com
//   EMAIL_PORT     = 587
//   EMAIL_USER     = hello@smartioushomeschool.com
//   EMAIL_PASSWORD = <Gmail app password, 16 chars>
//   EMAIL_FROM     = Smartious Homeschool <hello@smartioushomeschool.com>

const nodemailer = require('nodemailer')

// Create reusable transporter (lazy — only instantiate when first email sends)
let transporter = null

const getTransporter = () => {
  if (transporter) return transporter

  const host = process.env.EMAIL_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.EMAIL_PORT || '587', 10)
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD

  if (!user || !pass) {
    console.error('[email] EMAIL_USER and EMAIL_PASSWORD env vars are required')
    return null
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  return transporter
}

// ─────────────────────────────────────────────────────────
// Shared footer snippet — reused across templates
// ─────────────────────────────────────────────────────────
const emailFooter = () => `
  <tr><td style="background: #FBFAF5; padding: 22px 36px; border-top: 1px solid #f0e8e8;">
    <p style="font-size: 12px; line-height: 1.55; color: #6b6b6b; margin: 0 0 8px;">
      Questions? Contact us at
      <a href="mailto:hello@smartioushomeschool.com" style="color: #7D1025;">hello@smartioushomeschool.com</a>
      or call +254 745 021 212.
    </p>
    <p style="font-size: 11px; color: #999; margin: 0;">
      © ${new Date().getFullYear()} Smartious E-School · Nairobi, Kenya ·
      <a href="https://smartioushomeschool.com" style="color: #999;">smartioushomeschool.com</a>
    </p>
  </td></tr>
`

// ─────────────────────────────────────────────────────────
// Helper: format a Date into a human-readable local string
// Uses Africa/Nairobi as the base; works for all students
// since the LMS is Nairobi-hosted and most students are
// in EAT or adjacent zones.
// ─────────────────────────────────────────────────────────
function formatClassTime(date) {
  try {
    return new Date(date).toLocaleString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi',
      timeZoneName: 'short',
    })
  } catch {
    return new Date(date).toUTCString()
  }
}

// ─────────────────────────────────────────────────────────
// WELCOME EMAIL
// ─────────────────────────────────────────────────────────
const buildWelcomeHTML = ({ name, role, username, tempPassword, admissionNumber, loginUrl }) => {
  const roleLabel = {
    student: 'Student',
    teacher: 'Teacher',
    parent: 'Parent',
    admin: 'Administrator',
  }[role] || 'User'

  const roleSpecificMessage = {
    student: 'Welcome to Smartious. Your learning journey begins here. Log in to access your homework, live classes, and study resources.',
    teacher: 'Welcome to Smartious. We are honoured to have you join our faculty. Log in to access your classes, students, and teaching tools.',
    parent: 'Welcome to Smartious. You can now monitor your child\'s progress, communicate with their teachers, and stay involved in their education.',
    admin: 'Your administrator account has been created. Log in to manage Smartious.',
  }[role] || 'Welcome to Smartious. Please log in to begin.'

  const admissionRow = admissionNumber
    ? `<tr><td style="padding: 10px 0; color: #6b6b6b; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700;">Admission Number</td><td style="padding: 10px 0; color: #7D1025; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 16px; text-align: right;">${admissionNumber}</td></tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Smartious</title>
</head>
<body style="margin: 0; padding: 0; background: #FBFAF5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FBFAF5; padding: 32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(125, 16, 37, 0.08);">
        <tr><td style="background: linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%); padding: 32px 36px; color: #FBFAF5;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #C9A030; margin-bottom: 6px;">Smartious E-School</div>
          <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; line-height: 1.2;">Welcome, ${name}</div>
          <div style="font-size: 13px; opacity: 0.85; margin-top: 6px;">${roleLabel} Account</div>
        </td></tr>
        <tr><td style="padding: 32px 36px;">
          <p style="font-size: 15px; line-height: 1.65; color: #2c2c2c; margin: 0 0 22px;">${roleSpecificMessage}</p>
          <p style="font-size: 14px; line-height: 1.65; color: #2c2c2c; margin: 0 0 12px;">Your account has been created. Use these credentials to log in:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FBFAF5; border-left: 4px solid #C9A030; border-radius: 6px; padding: 18px 22px; margin-bottom: 24px;">
            <tr><td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${admissionRow}
                <tr>
                  <td style="padding: 10px 0; color: #6b6b6b; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; border-top: 1px solid #f0e8e8;">Username</td>
                  <td style="padding: 10px 0; color: #1a1a1a; font-family: 'JetBrains Mono', monospace; font-size: 14px; text-align: right; word-break: break-all; border-top: 1px solid #f0e8e8;">${username}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b6b6b; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; border-top: 1px solid #f0e8e8;">Temporary Password</td>
                  <td style="padding: 10px 0; color: #7D1025; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 16px; text-align: right; border-top: 1px solid #f0e8e8;">${tempPassword}</td>
                </tr>
              </table>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FEF3C7; border-left: 4px solid #B45309; border-radius: 6px; margin-bottom: 26px;">
            <tr><td style="padding: 14px 18px;">
              <div style="font-size: 12px; font-weight: 700; color: #7C2D12; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">Important</div>
              <div style="font-size: 13.5px; line-height: 1.55; color: #7C2D12;">For your security, you will be required to change this temporary password on your first login.</div>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 26px;">
            <tr><td align="center">
              <a href="${loginUrl}" style="display: inline-block; background: #7D1025; color: #FBFAF5; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: 0.02em;">Log In to Smartious</a>
            </td></tr>
          </table>
          <p style="font-size: 13px; line-height: 1.65; color: #6b6b6b; margin: 0 0 6px;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 12px; line-height: 1.55; color: #7D1025; word-break: break-all; margin: 0;"><a href="${loginUrl}" style="color: #7D1025;">${loginUrl}</a></p>
        </td></tr>
        ${emailFooter()}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

const buildWelcomeText = ({ name, role, username, tempPassword, admissionNumber, loginUrl }) => {
  const lines = [
    'Welcome to Smartious E-School, ' + name + '!',
    '',
    'Your account has been created. Use these credentials to log in:',
    '',
  ]
  if (admissionNumber) lines.push('Admission Number: ' + admissionNumber)
  lines.push('Username: ' + username)
  lines.push('Temporary Password: ' + tempPassword)
  lines.push('')
  lines.push('IMPORTANT: For your security, you will be required to change this temporary password on your first login.')
  lines.push('')
  lines.push('Log in at: ' + loginUrl)
  lines.push('')
  lines.push('If you have any questions, reply to this email or contact hello@smartioushomeschool.com.')
  lines.push('')
  lines.push('— Smartious E-School')
  return lines.join('\n')
}

const sendWelcomeEmail = async ({ to, name, role, username, tempPassword, admissionNumber, loginUrl }) => {
  const t = getTransporter()
  if (!t) {
    console.error('[email] No transporter — check EMAIL_USER and EMAIL_PASSWORD env vars')
    return { success: false, message: 'Email service not configured' }
  }

  const from = process.env.EMAIL_FROM || 'Smartious Homeschool <hello@smartioushomeschool.com>'
  const finalLoginUrl = loginUrl || 'https://smartioushomeschool.com/login'

  const mailOptions = {
    from,
    to,
    subject: 'Welcome to Smartious — Your Login Credentials',
    text: buildWelcomeText({ name, role, username, tempPassword, admissionNumber, loginUrl: finalLoginUrl }),
    html: buildWelcomeHTML({ name, role, username, tempPassword, admissionNumber, loginUrl: finalLoginUrl }),
  }

  try {
    const info = await t.sendMail(mailOptions)
    console.log('[email] Welcome email sent to ' + to + ' — messageId: ' + info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error('[email] Failed to send welcome email to ' + to + ':', err.message)
    return { success: false, message: err.message }
  }
}

// ─────────────────────────────────────────────────────────
// LIVE CLASS NOTIFICATION EMAIL
// ─────────────────────────────────────────────────────────
// Sent to each assigned student when:
//   (a) a teacher creates a new live class
//   (b) a teacher updates the meeting link on an existing class
//
// Params:
//   to           string  — student email
//   studentName  string  — student first name
//   teacherName  string  — teacher full name
//   title        string  — class title
//   subject      string
//   grade        string
//   scheduledAt  Date    — class start time
//   durationMins number
//   meetingLink  string  — the actual join URL
//   isUpdate     bool    — true = link changed, false = new class
//   portalUrl    string  — link to the student portal
// ─────────────────────────────────────────────────────────
const buildLiveClassHTML = ({
  studentName, teacherName, title, subject, grade,
  scheduledAt, durationMins, meetingLink, isUpdate, portalUrl,
}) => {
  const timeStr = formatClassTime(scheduledAt)
  const heading = isUpdate
    ? `Your class link has been updated`
    : `You have a new live class scheduled`
  const subheading = isUpdate
    ? `${teacherName} updated the meeting link for an upcoming class.`
    : `${teacherName} has scheduled a live class for you.`
  const buttonLabel = isUpdate ? 'View Updated Class' : 'View Class in Portal'
  const alertBox = isUpdate ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background: #FEF3C7; border-left: 4px solid #B45309; border-radius: 6px; margin-bottom: 20px;">
      <tr><td style="padding: 12px 16px;">
        <div style="font-size: 12px; font-weight: 700; color: #7C2D12; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px;">Link Updated</div>
        <div style="font-size: 13px; line-height: 1.5; color: #7C2D12;">
          The meeting link for this class has changed. Please use the new link below — any old link you saved will no longer work.
        </div>
      </td></tr>
    </table>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${heading}</title>
</head>
<body style="margin: 0; padding: 0; background: #FBFAF5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FBFAF5; padding: 32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="max-width: 580px; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(125, 16, 37, 0.08);">

        <!-- Header -->
        <tr><td style="background: linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%); padding: 28px 36px; color: #FBFAF5;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #C9A030; margin-bottom: 6px;">
            Smartious E-School · Live Class
          </div>
          <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 400; line-height: 1.2;">
            ${heading}
          </div>
          <div style="font-size: 13px; opacity: 0.8; margin-top: 6px;">${subheading}</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding: 28px 36px;">
          <p style="font-size: 15px; color: #2c2c2c; margin: 0 0 20px; line-height: 1.6;">
            Hi <strong>${studentName}</strong>,
          </p>

          ${alertBox}

          <!-- Class details box -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="background: #FBFAF5; border-left: 4px solid #7D1025; border-radius: 6px; padding: 18px 22px; margin-bottom: 24px;">
            <tr><td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 9px 0; color: #6b6b6b; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; width: 40%;">Class</td>
                  <td style="padding: 9px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${title}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; color: #6b6b6b; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border-top: 1px solid #f0e8e8;">Subject</td>
                  <td style="padding: 9px 0; color: #1a1a1a; font-size: 14px; border-top: 1px solid #f0e8e8;">${subject}${grade ? ' · ' + grade : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; color: #6b6b6b; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border-top: 1px solid #f0e8e8;">Teacher</td>
                  <td style="padding: 9px 0; color: #1a1a1a; font-size: 14px; border-top: 1px solid #f0e8e8;">${teacherName}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; color: #6b6b6b; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border-top: 1px solid #f0e8e8;">Date &amp; Time</td>
                  <td style="padding: 9px 0; color: #1a1a1a; font-size: 14px; border-top: 1px solid #f0e8e8;">${timeStr}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; color: #6b6b6b; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border-top: 1px solid #f0e8e8;">Duration</td>
                  <td style="padding: 9px 0; color: #1a1a1a; font-size: 14px; border-top: 1px solid #f0e8e8;">${durationMins} minutes</td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Meeting link — the main action -->
          <p style="font-size: 13px; font-weight: 700; color: #6b6b6b; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 8px;">
            Meeting Link
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="background: #F0F7FF; border: 1px solid #BFDBFE; border-radius: 8px; margin-bottom: 24px;">
            <tr><td style="padding: 14px 18px;">
              <a href="${meetingLink}"
                style="color: #1D4ED8; font-size: 14px; font-weight: 600; word-break: break-all; text-decoration: none;">
                ${meetingLink}
              </a>
            </td></tr>
          </table>

          <!-- Primary CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
            <tr><td align="center">
              <a href="${meetingLink}"
                style="display: inline-block; background: #7D1025; color: #FBFAF5; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: 0.02em;">
                Join Class
              </a>
            </td></tr>
          </table>

          <p style="font-size: 13px; color: #6b6b6b; line-height: 1.6; margin: 0 0 6px;">
            You can also find this class in your student portal under
            <strong>Live Classes</strong>.
          </p>
          <p style="font-size: 12px; margin: 0;">
            <a href="${portalUrl}" style="color: #7D1025; text-decoration: none; font-weight: 600;">
              Open Student Portal →
            </a>
          </p>
        </td></tr>

        ${emailFooter()}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

const buildLiveClassText = ({
  studentName, teacherName, title, subject, grade,
  scheduledAt, durationMins, meetingLink, isUpdate, portalUrl,
}) => {
  const timeStr = formatClassTime(scheduledAt)
  const lines = [
    isUpdate
      ? `Hi ${studentName}, your meeting link has been updated.`
      : `Hi ${studentName}, you have a new live class scheduled.`,
    '',
    'CLASS DETAILS',
    '─────────────',
    `Title:    ${title}`,
    `Subject:  ${subject}${grade ? ' · ' + grade : ''}`,
    `Teacher:  ${teacherName}`,
    `When:     ${timeStr}`,
    `Duration: ${durationMins} minutes`,
    '',
    'MEETING LINK',
    '─────────────',
    meetingLink,
    '',
  ]
  if (isUpdate) {
    lines.push('NOTE: This link has changed. Please discard any previous link you saved.')
    lines.push('')
  }
  lines.push(`View in your student portal: ${portalUrl}`)
  lines.push('')
  lines.push('— Smartious E-School')
  return lines.join('\n')
}

/**
 * sendLiveClassEmail
 * ------------------
 * Send a live class notification to one student.
 * Non-throwing — logs errors and returns { success, message }.
 *
 * @param {object} params
 *   to           string  student email
 *   studentName  string  student first name
 *   teacherName  string  teacher full name
 *   title        string  class title
 *   subject      string
 *   grade        string
 *   scheduledAt  Date|string
 *   durationMins number
 *   meetingLink  string
 *   isUpdate     boolean  true = link was changed on existing class
 */
const sendLiveClassEmail = async ({
  to,
  studentName,
  teacherName,
  title,
  subject,
  grade = '',
  scheduledAt,
  durationMins = 60,
  meetingLink,
  isUpdate = false,
}) => {
  const t = getTransporter()
  if (!t) {
    console.error('[email] No transporter — live class email not sent to', to)
    return { success: false, message: 'Email service not configured' }
  }

  const from = process.env.EMAIL_FROM || 'Smartious Homeschool <hello@smartioushomeschool.com>'
  const portalUrl = (process.env.CLIENT_URL || 'https://smartioushomeschool.com') + '/student'
  const subjectLine = isUpdate
    ? `Updated meeting link — ${title}`
    : `Live class scheduled — ${title}`

  const templateParams = {
    studentName, teacherName, title, subject, grade,
    scheduledAt, durationMins, meetingLink, isUpdate, portalUrl,
  }

  try {
    const info = await t.sendMail({
      from,
      to,
      subject: subjectLine,
      text: buildLiveClassText(templateParams),
      html: buildLiveClassHTML(templateParams),
    })
    console.log(`[email] Live class email sent to ${to} — messageId: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error(`[email] Failed to send live class email to ${to}:`, err.message)
    return { success: false, message: err.message }
  }
}

// ─────────────────────────────────────────────────────────
// Batch helper — send to multiple students, non-blocking.
// Fires all emails in parallel and returns aggregate stats.
// ─────────────────────────────────────────────────────────
const sendLiveClassEmailBatch = async (students, classParams) => {
  if (!students || students.length === 0) return { sent: 0, failed: 0 }
  const results = await Promise.allSettled(
    students.map(s => sendLiveClassEmail({
      to: s.email,
      studentName: s.firstName || s.name || 'Student',
      ...classParams,
    }))
  )
  const sent   = results.filter(r => r.status === 'fulfilled' && r.value?.success).length
  const failed = results.length - sent
  console.log(`[email] Live class batch: ${sent} sent, ${failed} failed`)
  return { sent, failed }
}

// ─────────────────────────────────────────────────────────
// Test connection
// ─────────────────────────────────────────────────────────
const testConnection = async () => {
  const t = getTransporter()
  if (!t) return { success: false, message: 'No transporter' }
  try {
    await t.verify()
    return { success: true, message: 'SMTP connection OK' }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

// ─────────────────────────────────────────────────────────
// Exam scheduled / rescheduled notification
// Sent to each assigned student AND their parent, so nobody
// discovers an exam by logging in the day after it ran.
// ─────────────────────────────────────────────────────────
const NAIROBI_FMT = new Intl.DateTimeFormat('en-KE', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi',
})

const buildExamHTML = (p) => `
<div style="margin:0;padding:24px;background:#F4F1EA;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E5DFD2;">
    <div style="background:#8B1A2E;padding:22px 28px;">
      <span style="color:#FFFFFF;font-size:20px;font-weight:700;">Smart</span><span style="color:#C9973A;font-size:20px;font-style:italic;">ious</span>
      <div style="color:rgba(255,255,255,.85);font-size:12px;letter-spacing:2px;margin-top:2px;">HOMESCHOOL</div>
    </div>
    <div style="padding:28px;">
      <p style="font-size:15px;color:#080C14;margin:0 0 14px;">Dear ${p.recipientName},</p>
      <p style="font-size:14px;color:#3A3A40;line-height:1.65;margin:0 0 18px;">
        ${p.isUpdate
          ? (p.isParent
            ? `The schedule for <strong>${p.studentName}</strong>'s examination has been <strong>updated</strong>. Please note the new details below.`
            : `The schedule for your examination has been <strong>updated</strong>. Please note the new details below.`)
          : (p.isParent
            ? `An examination has been scheduled for <strong>${p.studentName}</strong>. The details are below so you can help them prepare.`
            : `An examination has been scheduled for you. The details are below — good luck with your preparation.`)}
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:13.5px;color:#080C14;">
        ${[
          ['Examination', p.examTitle + (p.paperNumber ? ' — ' + p.paperNumber : '')],
          ['Subject', p.subject + (p.grade ? ' (' + p.grade + ')' : '')],
          ['Date & time', NAIROBI_FMT.format(new Date(p.startAt)) + ' (Nairobi time)'],
          ['Duration', p.durationMins + ' minutes'],
          ['Set by', p.teacherName || 'Smartious Academics'],
        ].map(([k, v]) => `
          <tr>
            <td style="padding:9px 0;border-bottom:1px solid #EFEAE0;color:#8B1A2E;font-weight:700;width:130px;vertical-align:top;">${k}</td>
            <td style="padding:9px 0;border-bottom:1px solid #EFEAE0;">${v}</td>
          </tr>`).join('')}
      </table>
      <p style="font-size:13.5px;color:#3A3A40;line-height:1.65;margin:18px 0 22px;">
        ${p.isParent
          ? 'Your child sits this examination in the Student Portal. Kindly ensure a quiet space, a charged device and a stable connection at the scheduled time.'
          : 'You will sit this examination in your Student Portal. Be logged in a few minutes early, in a quiet space, with a stable connection.'}
      </p>
      <a href="${p.portalUrl}" style="display:inline-block;background:#8B1A2E;color:#FFFFFF;text-decoration:none;padding:12px 26px;border-radius:8px;font-size:14px;font-weight:700;">Open the ${p.isParent ? 'Parent' : 'Student'} Portal</a>
    </div>
    <div style="padding:16px 28px;background:#FDFAF4;border-top:1px solid #EFEAE0;font-size:11.5px;color:#8A8A82;">
      Smartious Homeschool · smartioushomeschool.com · +254 745 021 212
    </div>
  </div>
</div>`

const buildExamText = (p) => [
  `Dear ${p.recipientName},`,
  '',
  p.isUpdate
    ? `The examination schedule ${p.isParent ? 'for ' + p.studentName + ' ' : ''}has been UPDATED:`
    : `An examination has been scheduled${p.isParent ? ' for ' + p.studentName : ''}:`,
  '',
  `Examination: ${p.examTitle}${p.paperNumber ? ' - ' + p.paperNumber : ''}`,
  `Subject: ${p.subject}${p.grade ? ' (' + p.grade + ')' : ''}`,
  `Date & time: ${NAIROBI_FMT.format(new Date(p.startAt))} (Nairobi time)`,
  `Duration: ${p.durationMins} minutes`,
  `Set by: ${p.teacherName || 'Smartious Academics'}`,
  '',
  p.isParent
    ? 'Your child sits this examination in the Student Portal.'
    : 'You will sit this examination in your Student Portal.',
  p.portalUrl,
  '',
  'Smartious Homeschool',
].join('\n')

const sendExamScheduledEmail = async (params) => {
  const t = getTransporter()
  if (!t) {
    console.error('[email] No transporter — exam email not sent to', params.to)
    return { success: false, message: 'Email service not configured' }
  }
  const from = process.env.EMAIL_FROM || 'Smartious Homeschool <hello@smartioushomeschool.com>'
  const portalUrl = (process.env.CLIENT_URL || 'https://smartioushomeschool.com') + (params.isParent ? '/parent' : '/student')
  const p = { ...params, portalUrl }
  const subjectLine = (p.isUpdate ? 'Updated: ' : 'Exam scheduled: ') +
    p.examTitle + ' — ' + NAIROBI_FMT.format(new Date(p.startAt))
  try {
    const info = await t.sendMail({
      from, to: p.to, subject: subjectLine,
      text: buildExamText(p),
      html: buildExamHTML(p),
    })
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error(`[email] Failed exam email to ${p.to}:`, err.message)
    return { success: false, message: err.message }
  }
}

module.exports = {
  sendWelcomeEmail,
  sendLiveClassEmail,
  sendLiveClassEmailBatch,
  sendExamScheduledEmail,
  testConnection,
}
