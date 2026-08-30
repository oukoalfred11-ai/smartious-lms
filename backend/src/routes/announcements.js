/**
 * announcements.js — broadcast announcements.
 *
 * Public reads for signed-in students and parents (the dashboard feed,
 * scoped to what is live and addressed to them). Create, update and
 * remove are restricted to admins and teachers. Scheduling is enforced
 * on read: an announcement outside its showFrom/showUntil window is
 * simply not returned, so repeated information can be set once and it
 * appears and disappears on its own.
 */
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const Announcement = require('../models/Announcement');

const STAFF = ['admin', 'ops_manager', 'dos', 'teacher'];

// Map a user role to the audiences that apply to them.
const audiencesFor = (role) => {
  if (role === 'parent') return ['all', 'parents'];
  // students (and, harmlessly, staff previewing) see student + all
  return ['all', 'students'];
};

// ── FEED (students and parents) ───────────────────────────
// GET /api/announcements  → live announcements for this user, newest
// first, pinned on top.
router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const auds = audiencesFor(req.user.role);
    const rows = await Announcement.find({
      published: true,
      audience: { $in: auds },
      showFrom: { $lte: now },
      $or: [{ showUntil: null }, { showUntil: { $gte: now } }],
    })
      .sort({ pinned: -1, showFrom: -1, createdAt: -1 })
      .limit(40)
      .lean();
    return res.json({ success: true, data: { announcements: rows } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ── MANAGEMENT (admins and teachers) ──────────────────────
// GET /api/announcements/manage → everything, including scheduled and
// expired, for the composer list.
router.get('/manage', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const rows = await Announcement.find({})
      .sort({ pinned: -1, createdAt: -1 })
      .limit(200)
      .lean();
    const now = new Date();
    const withState = rows.map(r => ({
      ...r,
      live: r.published
        && (!r.showFrom || new Date(r.showFrom) <= now)
        && (!r.showUntil || new Date(r.showUntil) >= now),
      scheduled: r.published && r.showFrom && new Date(r.showFrom) > now,
      expired: r.showUntil && new Date(r.showUntil) < now,
    }));
    return res.json({ success: true, data: { announcements: withState } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

const sanitize = (b = {}) => {
  const out = {};
  if (typeof b.title === 'string') out.title = b.title.trim().slice(0, 120);
  if (typeof b.body === 'string') out.body = b.body.trim().slice(0, 1000);
  if (['general', 'event', 'academic', 'holiday', 'achievement', 'reminder'].includes(b.category)) out.category = b.category;
  if (['all', 'students', 'parents'].includes(b.audience)) out.audience = b.audience;
  if (typeof b.ctaLabel === 'string') out.ctaLabel = b.ctaLabel.trim().slice(0, 40);
  if (typeof b.ctaUrl === 'string') out.ctaUrl = b.ctaUrl.trim().slice(0, 500);
  if (typeof b.pinned === 'boolean') out.pinned = b.pinned;
  if (typeof b.published === 'boolean') out.published = b.published;
  if (b.showFrom) { const d = new Date(b.showFrom); if (!isNaN(d)) out.showFrom = d; }
  if ('showUntil' in b) {
    if (!b.showUntil) out.showUntil = null;
    else { const d = new Date(b.showUntil); if (!isNaN(d)) out.showUntil = d; }
  }
  return out;
};

// POST /api/announcements — create
router.post('/', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const data = sanitize(req.body);
    if (!data.title || !data.body) {
      return res.status(400).json({ success: false, message: 'A title and message are both required.' });
    }
    data.author = req.user._id;
    data.authorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Smartious';
    const doc = await Announcement.create(data);
    return res.json({ success: true, data: { announcement: doc } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/announcements/:id — update
router.patch('/:id', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const data = sanitize(req.body);
    const doc = await Announcement.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Announcement not found.' });
    return res.json({ success: true, data: { announcement: doc } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE /api/announcements/:id — remove
router.delete('/:id', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const doc = await Announcement.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Announcement not found.' });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
