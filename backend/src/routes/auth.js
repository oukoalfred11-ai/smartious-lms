/**
 * routes/auth.js
 * ============================================================
 * Authentication routes: login, forgot-password, reset.
 * Mounted at /api/auth in index.js with authLimiter.
 */

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/User');

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';
const CLIENT_URL  = (process.env.CLIENT_URL || 'https://smartioushomeschool.com').replace(/\/$/, '');

// ── Email transporter ──────────────────────────────────────
let _transporter = null;
function getTransporter() {
  if (_transporter) return _transporter;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  if (!user || !pass) { console.error('[auth] EMAIL_USER/PASSWORD not set'); return null; }
  _transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: parseInt(process.env.EMAIL_PORT || '587', 10) === 465,
    auth: { user, pass },
  });
  return _transporter;
}

// ─────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// ─────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact admin.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const userOut = user.toObject();
    delete userOut.password;
    delete userOut.passwordResetToken;
    delete userOut.passwordResetExpires;

    console.log('[auth] Login:', user.email, '| role:', user.role);
    return res.json({ success: true, token, user: userOut });
  } catch (err) {
    console.error('[auth/login]', err.message);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Public — sends a reset link email.
// Body: { email }
// Always returns success (don't reveal if email exists).
// ─────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal whether the email exists
      return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    }

    // Generate token — store hash, send raw
    const rawToken  = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken   = tokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${CLIENT_URL}/forgot-password/reset?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
    const from     = process.env.EMAIL_FROM || 'Smartious E-School <hellosmartious@gmail.com>';

    const t = getTransporter();
    if (t) {
      await t.sendMail({
        from,
        to: user.email,
        subject: 'Reset your Smartious password',
        html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(139,26,46,.08);">
        <tr><td style="background:linear-gradient(135deg,#8B1A2E,#6E1424);padding:28px 32px;">
          <div style="font-family:Georgia,serif;font-size:22px;color:#fff;font-weight:700;">Reset your password</div>
          <div style="font-size:13px;color:rgba(255,255,255,.75);margin-top:4px;">Smartious Homeschool and eSchool</div>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="font-size:15px;color:#2c2c2c;margin:0 0 14px;line-height:1.6;">Hi ${user.firstName || 'there'},</p>
          <p style="font-size:14px;color:#2c2c2c;margin:0 0 24px;line-height:1.65;">
            We received a request to reset the password on your Smartious account.
            Click the button below — this link expires in <strong>1 hour</strong>.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td align="center">
              <a href="${resetUrl}" style="display:inline-block;background:#8B1A2E;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:.01em;">
                Reset my password
              </a>
            </td></tr>
          </table>
          <p style="font-size:12.5px;color:#6B6B6B;margin:0 0 8px;line-height:1.6;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
          </p>
          <p style="font-size:11px;color:#9CA3AF;margin:0;line-height:1.6;word-break:break-all;">
            Or paste this link in your browser: ${resetUrl}
          </p>
        </td></tr>
        <tr><td style="background:#FDFAF4;padding:18px 32px;border-top:1px solid #f0e8e8;">
          <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool and eSchool · smartioushomeschool.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
        text: `Hi ${user.firstName || 'there'},\n\nReset your Smartious password (link expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.\n\nSmartious Homeschool and eSchool`,
      }).catch(e => console.error('[auth] Reset email send failed:', e.message));
    }

    console.log('[auth/forgot-password] Reset link sent to', user.email);
    return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error('[auth/forgot-password]', err.message);
    return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/auth/reset-password-confirm
// Public — validates token and sets new password.
// Body: { email, token, newPassword }
// ─────────────────────────────────────────────────────────
router.post('/reset-password-confirm', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};

    if (!email || !token || !newPassword)
      return res.status(400).json({ success: false, message: 'Email, token and new password are required.' });
    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email:                email.toLowerCase().trim(),
      passwordResetToken:   tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired. Please request a new one.' });

    // Set new password — pre-save hook hashes it
    user.password             = newPassword;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log('[auth/reset-password-confirm] Password reset for', user.email);
    return res.json({ success: true, message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('[auth/reset-password-confirm]', err.message);
    return res.status(500).json({ success: false, message: 'Password reset failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Legacy endpoint (used by existing ResetPasswordPage for
// first-time login — no token required, user must be logged in).
// Body: { newPassword }
// ─────────────────────────────────────────────────────────
const { auth: authMiddleware } = require('../middleware/auth');
router.post('/reset-password', authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: 'Password updated.' });
  } catch (err) {
    console.error('[auth/reset-password]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

module.exports = router;
