/**
 * routes/student-profile.js
 * ============================================================
 * Self-service profile + account management for authenticated
 * students.
 *
 * Mounted at /api/student-profile
 *
 * Endpoints:
 *   GET   /me               Fetch current student's profile
 *   PATCH /me               Update current student's profile
 *   POST  /change-password  Change own password (requires current)
 *   POST  /delete-account   Soft-delete own account (requires password)
 *
 * Editable fields (whitelist — anything else in the body is ignored):
 *   firstName, lastName, phone, bio, avatar
 *
 * Intentionally NOT editable here:
 *   email      — security-sensitive, separate flow needed
 *   role       — never
 *   subjects, subjectRefs, curriculum, grade — set by admin via
 *                Allocations / admin-side tools
 *
 * Deletion model:
 *   - SOFT delete: sets isActive=false. Preserves submissions,
 *     attendance, allocations for audit/compliance.
 *   - Requires the student's password as confirmation.
 *   - After successful delete the client should clear its
 *     JWT and redirect to login; the auth middleware will
 *     reject any future requests from the now-inactive user.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const ok   = (res, data, message) => res.json({ success: true, data, message });
const fail = (res, status, message) => res.status(status).json({ success: false, message });

const EDITABLE_STRING_FIELDS = ['firstName', 'lastName', 'phone', 'bio', 'avatar'];

const READABLE_FIELDS = [
  '_id', 'firstName', 'lastName', 'email', 'role',
  'phone', 'bio', 'avatar',
  'subjects', 'curriculum', 'grade', 'createdAt',
  'isActive',
].join(' ');

// ═══════════════════════════════════════════════════════════
// GET /me — Fetch profile
// ═══════════════════════════════════════════════════════════
router.get('/me', auth, requireRole('student', 'admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(READABLE_FIELDS).lean();
    if (!user) return fail(res, 404, 'User not found.');
    return ok(res, { profile: user }, 'Profile loaded.');
  } catch (err) {
    console.error('[student-profile GET /me]', err.message);
    return fail(res, 500, err.message || 'Failed to load profile.');
  }
});

// ═══════════════════════════════════════════════════════════
// PATCH /me — Update profile
// ═══════════════════════════════════════════════════════════
router.patch('/me', auth, requireRole('student', 'admin'), async (req, res) => {
  try {
    const body = req.body || {};
    const updates = {};

    for (const k of EDITABLE_STRING_FIELDS) {
      if (k in body) {
        const v = body[k];
        if (v === null || v === undefined) {
          updates[k] = '';
        } else if (typeof v === 'string') {
          updates[k] = v.trim();
        } else {
          return fail(res, 400, `${k} must be a string.`);
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return fail(res, 400, 'No editable fields in request body.');
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select(READABLE_FIELDS).lean();

    if (!user) return fail(res, 404, 'User not found.');

    return ok(res, { profile: user, updatedFields: Object.keys(updates) }, 'Profile updated.');
  } catch (err) {
    console.error('[student-profile PATCH /me]', err.message);
    return fail(res, 500, err.message || 'Failed to update profile.');
  }
});

// ═══════════════════════════════════════════════════════════
// POST /change-password
// Body: { currentPassword, newPassword }
// ═══════════════════════════════════════════════════════════
router.post('/change-password', auth, requireRole('student', 'admin'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || typeof currentPassword !== 'string') {
      return fail(res, 400, 'Current password is required.');
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return fail(res, 400, 'New password must be at least 8 characters.');
    }
    if (newPassword === currentPassword) {
      return fail(res, 400, 'New password must differ from current.');
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return fail(res, 404, 'User not found.');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return fail(res, 401, 'Current password is incorrect.');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return ok(res, { changed: true }, 'Password changed.');
  } catch (err) {
    console.error('[student-profile change-password]', err.message);
    return fail(res, 500, err.message || 'Failed to change password.');
  }
});

// ═══════════════════════════════════════════════════════════
// POST /delete-account
// Body: { password, confirmation }
//   - password: current password, required for verification
//   - confirmation: must be the literal string "DELETE"
//
// Performs a SOFT delete:
//   - Sets isActive=false
//   - Records the timestamp in deletedAt
//   - Flags it as student-initiated for admin review
//
// Returns 200 on success. The client must clear its JWT and
// redirect to login. The auth middleware will reject any
// further requests because isActive=false.
// ═══════════════════════════════════════════════════════════
router.post('/delete-account', auth, requireRole('student'), async (req, res) => {
  try {
    const { password, confirmation } = req.body || {};

    if (confirmation !== 'DELETE') {
      return fail(res, 400, 'Confirmation string is incorrect. Type DELETE in uppercase to confirm.');
    }
    if (!password || typeof password !== 'string') {
      return fail(res, 400, 'Your current password is required to delete your account.');
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return fail(res, 404, 'User not found.');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return fail(res, 401, 'Password is incorrect.');

    // Soft-delete: preserve all related records (submissions,
    // attendance, allocations) for audit/compliance. Admin can
    // reactivate if needed by setting isActive=true.
    user.isActive = false;
    user.set('deletedAt', new Date());
    user.set('deletedSelfRequested', true);
    await user.save({ validateBeforeSave: false });

    return ok(res, { deleted: true },
      'Your account has been deactivated. If this was a mistake, contact your school administrator to restore access.'
    );
  } catch (err) {
    console.error('[student-profile delete-account]', err.message);
    return fail(res, 500, err.message || 'Failed to delete account.');
  }
});

module.exports = router;
