const router = require('express').Router();
const GroupRoom = require('../models/GroupRoom');
const User   = require('../models/User');
const Teacher = require('../models/Teacher');
const { auth, requireRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendTeacherMemoEmail } = require('../services/emailService');
const { sendWelcomeEmail } = require('../lib/email');

// ── Cloudinary avatar upload setup ────────────────────────
// Avatar upload — multer memory storage, no Cloudinary needed
let uploadAvatar = null;
try {
  const multer = require('multer');
  uploadAvatar = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
      file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only'));
    },
  });
} catch(e) {
  console.log('[users] avatar upload disabled —', e.message);
}


// ─────────────────────────────────────────────────────────
// GET /api/users/public-teachers   — PUBLIC (no auth)
// Powers the public "Meet Our Team" page on the landing site.
// Returns ONLY safe, public profile fields for every teacher —
// never email, phone, or any private/contact data.
// ─────────────────────────────────────────────────────────
router.get('/public-teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('firstName lastName jobTitle bio avatar qualifications certifications specializations yearsOfExperience subjects curriculum createdAt')
      .lean();

    // Explicitly whitelist the public fields — nothing else leaves the server.
    const publicTeachers = teachers.map(t => ({
      id: String(t._id),
      name: `${t.firstName || ''} ${t.lastName || ''}`.trim(),
      jobTitle: t.jobTitle || 'Teacher',
      bio: t.bio || '',
      avatar: t.avatar || '',
      qualifications: Array.isArray(t.qualifications) ? t.qualifications : [],
      certifications: Array.isArray(t.certifications) ? t.certifications : [],
      specializations: Array.isArray(t.specializations) ? t.specializations : [],
      yearsOfExperience: t.yearsOfExperience || 0,
      subjects: Array.isArray(t.subjects) ? t.subjects : [],
      curriculum: Array.isArray(t.curriculum) ? t.curriculum : (t.curriculum ? [t.curriculum] : []),
    }));

    // Most experienced first, then alphabetical
    publicTeachers.sort((a, b) =>
      (b.yearsOfExperience - a.yearsOfExperience) || a.name.localeCompare(b.name)
    );

    res.json({ success: true, data: { teachers: publicTeachers } });
  } catch (e) {
    console.error('[users public-teachers]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
