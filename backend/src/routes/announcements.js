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
const { dispatchSoon } = require('../services/announcementMailer');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const Announcement = require('../models/Announcement');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

// R2, for announcement videos (same store the library uses).
const R2_READY = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_URL);
const r2 = R2_READY ? new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
}) : null;
const R2_PUBLIC = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

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
  const MODULES = ['timetable', 'lessons', 'homework', 'exams', 'results', 'curriculum', 'clubs', 'library', 'communication', 'profile', 'settings', 'reports', 'attendance', 'messages'];
  if (typeof b.ctaModule === 'string') out.ctaModule = MODULES.includes(b.ctaModule) ? b.ctaModule : '';
  if (typeof b.imageData === 'string') {
    // Empty clears; otherwise it must be an image data URL under ~2MB.
    if (!b.imageData) out.imageData = '';
    else if (b.imageData.startsWith('data:image/') && b.imageData.length <= 2_800_000) out.imageData = b.imageData;
  }
  if (typeof b.videoUrl === 'string') {
    // Empty clears; otherwise it must be a video we hosted on R2.
    const v = b.videoUrl.trim().slice(0, 600);
    if (!v) out.videoUrl = '';
    else if (R2_PUBLIC && v.startsWith(R2_PUBLIC + '/announcements/')) out.videoUrl = v;
  }
  if (typeof b.heroBanner === 'boolean') out.heroBanner = b.heroBanner;
  if (typeof b.pinned === 'boolean') out.pinned = b.pinned;
  if (typeof b.published === 'boolean') out.published = b.published;
  if (b.showFrom) { const d = new Date(b.showFrom); if (!isNaN(d)) out.showFrom = d; }
  if ('showUntil' in b) {
    if (!b.showUntil) out.showUntil = null;
    else { const d = new Date(b.showUntil); if (!isNaN(d)) out.showUntil = d; }
  }
  return out;
};

// POST /api/announcements/video-presign — staff upload a banner video.
// Presigned like the library: the file goes browser to R2 directly.
router.post('/video-presign', auth, requireRole(...STAFF), async (req, res) => {
  try {
    if (!R2_READY) return res.status(503).json({ success: false, message: 'Video storage (R2) is not configured on the server.' });
    const { fileName, mimeType, fileSize } = req.body || {};
    if (!fileName) return res.status(400).json({ success: false, message: 'fileName is required.' });
    if (!['video/mp4', 'video/webm'].includes(mimeType))
      return res.status(400).json({ success: false, message: 'Only MP4 and WebM videos are accepted.' });
    const size = Number(fileSize) || 0;
    if (size <= 0 || size > 200 * 1024 * 1024)
      return res.status(400).json({ success: false, message: 'Videos must be between 1 byte and 200 MB.' });
    const safeName = String(fileName).replace(/[^\w.\- ]+/g, '_').slice(0, 120);
    const r2Key = `announcements/videos/${uuidv4()}-${safeName}`;
    const uploadUrl = await getSignedUrl(r2, new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME, Key: r2Key, ContentType: mimeType,
    }), { expiresIn: 30 * 60 });
    return res.json({ success: true, data: { uploadUrl, r2Key, publicUrl: `${R2_PUBLIC}/${r2Key}` } });
  } catch (e) {
    console.error('[announcements video-presign]', e.message);
    return res.status(500).json({ success: false, message: 'Could not prepare the upload.' });
  }
});

// GET /api/announcements/hero-video — the video the student dashboard
// hero should play right now. The banner is a standing fixture, not a
// dated notice: it deliberately IGNORES the announcement's display
// window (showFrom/showUntil govern the card, never the banner). The
// most recently updated published banner wins, and it plays until the
// flag is unticked, the video removed, or the announcement deleted or
// unpublished.
router.get('/hero-video', auth, async (req, res) => {
  try {
    const doc = await Announcement.findOne({
      published: true, heroBanner: true, videoUrl: { $ne: '' },
    }).sort({ updatedAt: -1 }).select('videoUrl title').lean();
    return res.json({ success: true, data: { videoUrl: doc?.videoUrl || '', title: doc?.title || '' } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

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
    // Email the audience now if it is live; a scheduled one is picked up
    // by the mailer when its showFrom time arrives.
    if (doc.published) dispatchSoon();
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
    // Publishing a draft (or moving showFrom into the present) sends it;
    // an already-emailed announcement is never re-sent (emailSentAt guard).
    if (doc.published && !doc.emailSentAt) dispatchSoon();
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
