/**
 * routes/teacher-profile.js
 * ============================================================
 * Self-service profile management for authenticated teachers.
 *
 * Mounted at /api/teacher-profile
 *
 * Endpoints:
 *   GET   /me        Fetch current teacher's editable profile
 *   PATCH /me        Update current teacher's editable profile
 *
 * Editable fields (whitelist — anything else in the body is ignored):
 *   firstName, lastName, phone, bio, avatar, jobTitle,
 *   qualifications[], certifications[], specializations[],
 *   yearsOfExperience
 *
 * Intentionally NOT editable here:
 *   email      — security-sensitive, separate flow needed
 *   role       — admins only via separate route (anti-escalation)
 *   password   — separate change-password endpoint
 *   subjects, subjectRefs, teachingSpecialties, curriculum
 *              — set via Allocations / admin-side tools
 *
 * Authorisation:
 *   - Teacher or admin (admins can also use this to edit their own profile)
 *   - A teacher can only edit their own record
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const ok = (res, data, message) => res.json({ success: true, data, message });
const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Fields a teacher is allowed to self-edit
const EDITABLE_STRING_FIELDS  = ['firstName', 'lastName', 'phone', 'bio', 'avatar', 'jobTitle'];
const EDITABLE_ARRAY_FIELDS   = ['qualifications', 'certifications', 'specializations'];
const EDITABLE_NUMBER_FIELDS  = ['yearsOfExperience'];

// Fields safe to return when reading the profile
const READABLE_FIELDS = [
  '_id', 'firstName', 'lastName', 'email', 'role',
  'phone', 'bio', 'avatar', 'jobTitle',
  'qualifications', 'certifications', 'specializations', 'yearsOfExperience',
  'subjects', 'curriculum', 'createdAt',
].join(' ');

// ═══════════════════════════════════════════════════════════
// GET /me — Fetch current teacher's profile
// ═══════════════════════════════════════════════════════════
router.get('/me', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(READABLE_FIELDS).lean();
    if (!user) return fail(res, 404, 'User not found.');
    return ok(res, { profile: user }, 'Profile loaded.');
  } catch (err) {
    console.error('[teacher-profile GET /me]', err.message);
    return fail(res, 500, err.message || 'Failed to load profile.');
  }
});

// ═══════════════════════════════════════════════════════════
// PATCH /me — Update current teacher's profile
// Body: any subset of the editable fields
// ═══════════════════════════════════════════════════════════
router.patch('/me', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const body = req.body || {};
    const updates = {};

    // Strings: trim, accept empty (means "clear this field")
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

    // Arrays of strings: accept array or comma/newline-separated string
    for (const k of EDITABLE_ARRAY_FIELDS) {
      if (k in body) {
        const v = body[k];
        let arr;
        if (Array.isArray(v)) {
          arr = v.filter(x => typeof x === 'string').map(x => x.trim()).filter(Boolean);
        } else if (typeof v === 'string') {
          // Accept newline OR comma separated strings
          arr = v.split(/[\n,]/).map(x => x.trim()).filter(Boolean);
        } else if (v === null || v === undefined) {
          arr = [];
        } else {
          return fail(res, 400, `${k} must be an array or comma/newline-separated string.`);
        }
        updates[k] = arr;
      }
    }

    // Numbers
    for (const k of EDITABLE_NUMBER_FIELDS) {
      if (k in body) {
        const v = body[k];
        const n = Number(v);
        if (v === null || v === undefined || v === '') {
          updates[k] = 0;
        } else if (Number.isFinite(n) && n >= 0 && n <= 70) {
          updates[k] = n;
        } else {
          return fail(res, 400, `${k} must be a number between 0 and 70.`);
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
    console.error('[teacher-profile PATCH /me]', err.message);
    return fail(res, 500, err.message || 'Failed to update profile.');
  }
});

module.exports = router;
