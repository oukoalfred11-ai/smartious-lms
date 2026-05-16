const router = require('express').Router();
const User = require('../models/User');
const Communication = require('../models/Communication');
const { auth, requireRole } = require('../middleware/auth');
const { sendBulkEmail } = require('../services/emailService');

// ── Cloudinary attachment upload (defensive — never crash boot) ──
let uploadAttachment = null;
let attachmentUploadError = null;
try {
  const multer = require('multer');
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const attachmentStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'smartious/communication',
      resource_type: 'raw',          // PDFs and docs, not images
      allowed_formats: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'],
    },
  });
  uploadAttachment = multer({
    storage: attachmentStorage,
    limits: { fileSize: 10 * 1024 * 1024 },   // 10 MB per file
  });
} catch (e) {
  attachmentUploadError = e.message;
  console.error('[communication] attachment upload disabled —', e.message);
}

// ─────────────────────────────────────────────────────────
// GET /api/communication/recipients
// The school community — all users, for the recipient picker.
// Admin only (teacher/student scoping comes in later sessions).
// ─────────────────────────────────────────────────────────
router.get('/recipients', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['teacher', 'student', 'parent', 'admin'] } })
      .select('_id firstName lastName email role programme curriculum')
      .sort('firstName')
      .lean();

    const recipients = users
      .filter(u => u.email)
      .map(u => ({
        _id: u._id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        email: u.email,
        role: u.role,
        programme: u.programme || '',
        curriculum: typeof u.curriculum === 'string' ? u.curriculum : '',
      }));

    res.json({ success: true, data: { recipients } });
  } catch (e) {
    console.error('[communication recipients]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/communication/upload-attachment
// Uploads one file to Cloudinary, returns { name, url }.
// The frontend uploads each attachment, then includes the
// returned URLs in the /send payload.
// ─────────────────────────────────────────────────────────
router.post('/upload-attachment', auth, requireRole('admin'), (req, res) => {
  if (!uploadAttachment) {
    return res.status(503).json({
      success: false,
      message: 'Attachment upload unavailable: ' + (attachmentUploadError || 'module not installed.'),
    });
  }
  uploadAttachment.single('file')(req, res, (err) => {
    if (err) {
      console.error('[communication upload]', err.message);
      return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    res.json({
      success: true,
      data: { name: req.file.originalname || 'attachment', url: req.file.path },
    });
  });
});

// ─────────────────────────────────────────────────────────
// POST /api/communication/send
// Body: {
//   subject, body,
//   userIds: [...],            — recipients chosen from the community
//   externalEmails: [...],     — typed addresses (admin only)
//   attachments: [{ name, url }],
//   audience: "All Teachers"   — label for history display
// }
// ─────────────────────────────────────────────────────────
router.post('/send', auth, requireRole('admin'), async (req, res) => {
  try {
    const {
      subject, body,
      userIds = [], externalEmails = [],
      attachments = [], audience = '',
    } = req.body;

    if (!subject || !subject.trim())
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    if (!body || !body.trim())
      return res.status(400).json({ success: false, message: 'Message body is required.' });

    // Resolve community recipients
    let communityRecipients = [];
    if (Array.isArray(userIds) && userIds.length > 0) {
      const users = await User.find({ _id: { $in: userIds } })
        .select('firstName lastName email')
        .lean();
      communityRecipients = users
        .filter(u => u.email)
        .map(u => ({
          email: u.email,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        }));
    }

    // External typed addresses (admin privilege)
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const externalRecipients = (Array.isArray(externalEmails) ? externalEmails : [])
      .map(e => String(e).trim())
      .filter(e => emailRe.test(e))
      .map(e => ({ email: e, name: '' }));

    // Merge + dedupe by email
    const seen = new Set();
    const allRecipients = [];
    for (const r of [...communityRecipients, ...externalRecipients]) {
      const key = r.email.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      allRecipients.push(r);
    }

    if (allRecipients.length === 0)
      return res.status(400).json({ success: false, message: 'No valid recipients.' });

    const senderName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
      || 'Smartious Administration';

    // Normalise attachments → nodemailer shape
    const mailAttachments = (Array.isArray(attachments) ? attachments : [])
      .filter(a => a && a.url)
      .map(a => ({ filename: a.name || 'attachment', path: a.url }));

    // Send
    const { results, sentCount, failedCount } = await sendBulkEmail({
      recipients: allRecipients,
      subject: subject.trim(),
      bodyText: body,
      senderName,
      attachments: mailAttachments,
    });

    // Log the campaign
    const record = await Communication.create({
      sentBy: req.user._id,
      sentByName: senderName,
      sentByRole: req.user.role,
      subject: subject.trim(),
      body,
      attachments: (attachments || []).map(a => ({ name: a.name, url: a.url })),
      recipients: results,
      recipientCount: allRecipients.length,
      sentCount,
      failedCount,
      audience: audience || `${allRecipients.length} recipient${allRecipients.length === 1 ? '' : 's'}`,
    });

    res.json({
      success: true,
      message: `Sent ${sentCount} of ${allRecipients.length} email${allRecipients.length === 1 ? '' : 's'}.`,
      data: { id: record._id, sentCount, failedCount, results },
    });
  } catch (e) {
    console.error('[communication send]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/communication/history — past campaigns
// ─────────────────────────────────────────────────────────
router.get('/history', auth, requireRole('admin'), async (req, res) => {
  try {
    const history = await Communication.find()
      .sort('-createdAt')
      .limit(100)
      .lean();
    res.json({ success: true, data: { history } });
  } catch (e) {
    console.error('[communication history]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
