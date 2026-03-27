const router = require('express').Router();
const User   = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// GET all users (admin only) — never return passwords
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt')
      .limit(200);
    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// CREATE user (admin only)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.create(req.body);
    const safe = user.toObject();
    delete safe.password;
    res.json({ success: true, user: safe });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// UPDATE user (admin only) — demo users cannot be deleted or have role/isDemo changed
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Protect demo users: disallow role change or deactivation
    if (target.isDemo) {
      delete req.body.role;
      delete req.body.isDemo;
      delete req.body.isActive; // cannot deactivate demo accounts
    }

    // Never update password via this route — use a dedicated change-password endpoint
    delete req.body.password;

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE user (admin only) — demo users cannot be deleted
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.isDemo) {
      return res.status(403).json({ success: false, message: 'Demo users cannot be deleted.' });
    }
    await target.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
