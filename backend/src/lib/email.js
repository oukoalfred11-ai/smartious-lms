// ═══════════════════════════════════════════════════════════
// EMAIL UTILITY — Smartious E-School
// Sends transactional emails via Gmail SMTP using nodemailer.
// ═══════════════════════════════════════════════════════════
//
// ENV VARS required (set on Render):
//   EMAIL_HOST     = smtp.gmail.com
//   EMAIL_PORT     = 587
//   EMAIL_USER     = hellosmartious@gmail.com
//   EMAIL_PASSWORD = <Gmail app password, 16 chars>
//   EMAIL_FROM     = Smartious E-School <hellosmartious@gmail.com>
//
// To create the Gmail app password:
//   1. Go to https://myaccount.google.com/apppasswords
//   2. Sign in to hellosmartious@gmail.com
//   3. Create new app password named "Smartious LMS"
//   4. Copy the 16-character password (no spaces)
//   5. Add as EMAIL_PASSWORD env var on Render
//
// USAGE:
//   const { sendWelcomeEmail } = require('../lib/email')
//   await sendWelcomeEmail({
//     to: 'student@example.com',
//     name: 'Jane Doe',
//     role: 'student',
//     username: 'student@example.com',
//     tempPassword: 'abc123XYZ',
//     admissionNumber: 'SH/2026/001',  // optional, students only
//     loginUrl: 'https://smartioushomeschool.com/login',
//   })
 
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
    secure: port === 465,  // SSL for 465, STARTTLS for 587
    auth: { user, pass },
  })
 
  return transporter
}
 
// HTML template for welcome email
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
    ? '<tr><td style="padding: 10px 0; color: #6b6b6b; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700;">Admission Number</td><td style="padding: 10px 0; color: #7D1025; font-family: \'JetBrains Mono\', monospace; font-weight: 700; font-size: 16px; text-align: right;">' + admissionNumber + '</td></tr>'
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
 
        <!-- Header -->
        <tr><td style="background: linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%); padding: 32px 36px; color: #FBFAF5;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #C9A030; margin-bottom: 6px;">Smartious E-School</div>
          <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; line-height: 1.2;">Welcome, ${name}</div>
          <div style="font-size: 13px; opacity: 0.85; margin-top: 6px;">${roleLabel} Account</div>
        </td></tr>
 
        <!-- Body -->
        <tr><td style="padding: 32px 36px;">
          <p style="font-size: 15px; line-height: 1.65; color: #2c2c2c; margin: 0 0 22px;">${roleSpecificMessage}</p>
 
          <p style="font-size: 14px; line-height: 1.65; color: #2c2c2c; margin: 0 0 12px;">Your account has been created. Use these credentials to log in:</p>
 
          <!-- Credentials box -->
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
 
          <!-- Important notice -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FEF3C7; border-left: 4px solid #B45309; border-radius: 6px; margin-bottom: 26px;">
            <tr><td style="padding: 14px 18px;">
              <div style="font-size: 12px; font-weight: 700; color: #7C2D12; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">Important</div>
              <div style="font-size: 13.5px; line-height: 1.55; color: #7C2D12;">For your security, you will be required to change this temporary password on your first login.</div>
            </td></tr>
          </table>
 
          <!-- Login button -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 26px;">
            <tr><td align="center">
              <a href="${loginUrl}" style="display: inline-block; background: #7D1025; color: #FBFAF5; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: 0.02em;">Log In to Smartious</a>
            </td></tr>
          </table>
 
          <p style="font-size: 13px; line-height: 1.65; color: #6b6b6b; margin: 0 0 6px;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 12px; line-height: 1.55; color: #7D1025; word-break: break-all; margin: 0;"><a href="${loginUrl}" style="color: #7D1025;">${loginUrl}</a></p>
        </td></tr>
 
        <!-- Footer -->
        <tr><td style="background: #FBFAF5; padding: 22px 36px; border-top: 1px solid #f0e8e8;">
          <p style="font-size: 12px; line-height: 1.55; color: #6b6b6b; margin: 0 0 8px;">If you weren't expecting this email, please ignore it or contact us at <a href="mailto:hellosmartious@gmail.com" style="color: #7D1025;">hellosmartious@gmail.com</a>.</p>
          <p style="font-size: 11px; color: #999; margin: 0;">© ${new Date().getFullYear()} Smartious E-School · Nairobi, Kenya · <a href="https://smartioushomeschool.com" style="color: #999;">smartioushomeschool.com</a></p>
        </td></tr>
 
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
 
// Plain text fallback for email clients that don't render HTML
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
  lines.push('If you have any questions, reply to this email or contact hellosmartious@gmail.com.')
  lines.push('')
  lines.push('— Smartious E-School')
  return lines.join('\n')
}
 
// Send a welcome email with login credentials
const sendWelcomeEmail = async ({ to, name, role, username, tempPassword, admissionNumber, loginUrl }) => {
  const t = getTransporter()
  if (!t) {
    console.error('[email] No transporter — check EMAIL_USER and EMAIL_PASSWORD env vars')
    return { success: false, message: 'Email service not configured' }
  }
 
  const from = process.env.EMAIL_FROM || 'Smartious E-School <hellosmartious@gmail.com>'
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
 
// Test connection (call this from a debug endpoint if you want to verify setup)
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
 
module.exports = {
  sendWelcomeEmail,
  testConnection,
}
