/**
 * BOOTSTRAP ADMIN ROUTE — ONE-TIME USE
 * ============================================================
 * Creates an admin user when visited with the correct secret.
 *
 * USAGE:
 *   1. Add this file to backend/src/routes/bootstrap.js
 *   2. Mount in server.js: app.use('/api/bootstrap', require('./routes/bootstrap'))
 *   3. Visit in browser:
 *      https://smartious-backend.onrender.com/api/bootstrap/admin/SmartiousBootstrap2026
 *   4. Use returned credentials to log in
 *   5. DELETE THIS FILE and the server.js line, then commit
 *
 * SECURITY:
 *   - Requires a secret key in the URL (set BOOTSTRAP_SECRET below)
 *   - Refuses to run if any admin user already exists with the email
 *     unless the URL includes ?force=true
 *   - Should be deleted from the codebase immediately after use
 *
 * WHY THIS WORKS WHEN MONGODB UI INSERT DOESN'T:
 *   - Uses User model directly (same as login flow)
 *   - User model's pre-save hook hashes password automatically
 *   - No copy-paste of bcrypt hashes — eliminates encoding issues
 *   - Verifies password works BEFORE returning success
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ─── CONFIGURATION ─────────────────────────────────────
// Change this secret to anything you want. It must appear in the URL.
const BOOTSTRAP_SECRET = 'SmartiousBootstrap2026';

// Admin account details (customize before deploying)
const ADMIN_EMAIL    = 'alfred@smartious.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_FIRST    = 'Alfred';
const ADMIN_LAST     = 'Ouko';
// ───────────────────────────────────────────────────────

router.get('/admin/:secret', async (req, res) => {
  try {
    const { secret } = req.params;
    const force = req.query.force === 'true';

    // Verify secret
    if (secret !== BOOTSTRAP_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Invalid bootstrap secret.',
      });
    }

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing && !force) {
      return res.status(409).json({
        success: false,
        message: 'Admin already exists with this email. Add ?force=true to URL to delete and recreate.',
        existingId: existing._id,
        hint: 'URL with force: /api/bootstrap/admin/' + BOOTSTRAP_SECRET + '?force=true',
      });
    }

    // Delete existing if force=true
    if (existing && force) {
      await User.deleteOne({ email: ADMIN_EMAIL.toLowerCase() });
      console.log('[bootstrap] Deleted existing admin: ' + ADMIN_EMAIL);
    }

    // Also delete any other admin documents to clean slate
    const otherAdmins = await User.find({ role: 'admin' });
    for (const other of otherAdmins) {
      if (other.email !== ADMIN_EMAIL.toLowerCase()) {
        console.log('[bootstrap] Found other admin: ' + other.email + ' (keeping)');
      }
    }

    // Create the admin (User model's pre-save hook hashes the password)
    const admin = new User({
      firstName: ADMIN_FIRST,
      lastName: ADMIN_LAST,
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD, // Will be hashed by pre-save hook
      role: 'admin',
      plan: 'Staff',
      isActive: true,
      isMainAdmin: true,
      isEmailVerified: true,
      mustChangePassword: false,
      isDemo: false,
      isOnLeave: false,
      xp: 0,
      streak: 0,
    });

    await admin.save();
    console.log('[bootstrap] Admin created: ' + ADMIN_EMAIL);

    // Verify the password works (sanity check)
    const fresh = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    const matches = await fresh.comparePassword(ADMIN_PASSWORD);

    if (!matches) {
      console.error('[bootstrap] PASSWORD VERIFICATION FAILED!');
      return res.status(500).json({
        success: false,
        message: 'Admin created but password verification failed. Check User model setup.',
      });
    }

    // Return HTML page with credentials (so it looks nice in browser)
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Smartious Admin Bootstrap</title>
        <style>
          body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 60px auto; padding: 20px; background: #FBFAF5; color: #333; }
          h1 { color: #15803D; font-size: 32px; margin: 0 0 8px; }
          .subtitle { color: #888; margin-bottom: 30px; }
          .card { background: #fff; border: 1px solid #ddd; border-radius: 12px; padding: 24px; margin: 20px 0; }
          .creds { background: #FBF6E3; border: 2px solid #C9A030; padding: 16px; border-radius: 8px; margin: 12px 0; font-family: monospace; }
          .creds-row { padding: 8px 0; border-bottom: 1px solid #C9A030; }
          .creds-row:last-child { border: none; }
          .label { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
          .value { font-size: 16px; font-weight: 700; color: #7D1025; }
          .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px 16px; margin: 20px 0; font-size: 14px; }
          .button { display: inline-block; background: #7D1025; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 12px; }
          code { background: #FBF6E3; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>✓ Admin Created Successfully</h1>
        <p class="subtitle">Password verified by backend — you can log in immediately.</p>

        <div class="card">
          <h3 style="margin-top:0;">Login Credentials</h3>
          <div class="creds">
            <div class="creds-row">
              <div class="label">Email</div>
              <div class="value">${ADMIN_EMAIL}</div>
            </div>
            <div class="creds-row">
              <div class="label">Password</div>
              <div class="value">${ADMIN_PASSWORD}</div>
            </div>
          </div>
          <a href="https://smartioushomeschool.com/admin-login" class="button">Open Admin Login →</a>
        </div>

        <div class="warning">
          <strong>⚠ Security Notice:</strong> Delete this bootstrap file from your codebase immediately.
          <br><br>
          1. Delete <code>backend/src/routes/bootstrap.js</code>
          <br>
          2. Remove the line in <code>server.js</code> that mounts <code>/api/bootstrap</code>
          <br>
          3. Commit and push so Render redeploys without it.
        </div>

        <p style="color: #888; font-size: 12px; margin-top: 40px;">
          Smartious Bootstrap · Created at ${new Date().toISOString()}
        </p>
      </body>
      </html>
    `);
  } catch (e) {
    console.error('[bootstrap]', e.message);
    return res.status(500).json({
      success: false,
      message: 'Bootstrap failed: ' + e.message,
    });
  }
});

// Health check (so you can verify the route is mounted)
router.get('/check', (req, res) => {
  res.json({
    success: true,
    message: 'Bootstrap route is alive. Use the admin endpoint with your secret to create an admin.',
    instructions: 'Visit /api/bootstrap/admin/' + BOOTSTRAP_SECRET,
  });
});

module.exports = router;
