/**
 * STUDENT SELF-SERVICE ROUTES
 * ============================================================
 * Endpoints a logged-in student can call about their OWN data.
 *   GET   /api/students/my-profile  -> fetch own profile
 *   PATCH /api/students/my-profile  -> update own editable fields
 *
 * Security:
 *  - All routes require valid JWT (auth middleware)
 *  - Role check: only `student` users can access
 *  - User can only modify their own record (uses req.user._id)
 *  - Whitelist of editable fields - students CANNOT change role,
 *    plan, isActive, mustChangePassword, email, password, etc.
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// Fields the student is allowed to update on their own profile.
// Anything outside this list is silently ignored.
const ALLOWED_PROFILE_FIELDS = [
  'firstName',
  'lastName',
  'phone',
  'bio',
  'avatar',
  'grade',
];

// --------------------------------------------------------------
// GET /api/students/my-profile
// --------------------------------------------------------------
router.get('/my-profile', auth, requireRole('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -verificationToken -verificationTokenExpiry')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    return res.json({
      success: true,
      profile: user,
    });
  } catch (e) {
    console.error('[students/my-profile GET]', e.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load profile.',
    });
  }
});

// --------------------------------------------------------------
// PATCH /api/students/my-profile
// --------------------------------------------------------------
router.patch('/my-profile', auth, requireRole('student'), async (req, res) => {
  try {
    // Whitelist filter - quietly drop any field the student isn't
    // allowed to change.
    const updates = {};
    for (const key of ALLOWED_PROFILE_FIELDS) {
      if (key in req.body) {
        updates[key] = typeof req.body[key] === 'string'
          ? req.body[key].trim()
          : req.body[key];
      }
    }

    // Validation
    if (updates.firstName === '' || updates.lastName === '') {
      return res.status(400).json({
        success: false,
        message: 'First name and last name cannot be empty.',
      });
    }

    if (updates.bio && updates.bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Bio is too long (max 500 characters).',
      });
    }

    if (updates.avatar && updates.avatar.length > 0) {
      if (!/^https?:\/\//i.test(updates.avatar)) {
        return res.status(400).json({
          success: false,
          message: 'Photo URL must start with http:// or https://',
        });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select('-password -verificationToken -verificationTokenExpiry')
      .lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    return res.json({
      success: true,
      profile: updated,
      message: 'Profile updated successfully.',
    });
  } catch (e) {
    console.error('[students/my-profile PATCH]', e.message);
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }
});

module.exports = router;
