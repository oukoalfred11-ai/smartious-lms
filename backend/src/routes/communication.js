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
router.post('/upload-attachment', auth, requireRole('admin', 'teacher', 'student'), (req, res) => {
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

// ─────────────────────────────────────────────────────────
// GET /api/communication/teacher/recipients
// A teacher's allowed audience: their allocated students, those
// students' linked parents, other teachers, and admins.
// NO external addresses for teachers.
// ─────────────────────────────────────────────────────────
router.get('/teacher/recipients', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const Allocation = require('../models/Allocation');

    // Students allocated to this teacher (active allocations)
    const allocs = await Allocation.find({ teacherId: req.user._id, status: 'Active' })
      .select('studentId')
      .lean();
    const studentIds = [...new Set(allocs.map(a => String(a.studentId)).filter(Boolean))];

    const students = await User.find({ _id: { $in: studentIds }, role: 'student' })
      .select('_id firstName lastName email linkedParents parentId')
      .lean();

    // Collect parent ids referenced by these students
    const parentIdSet = new Set();
    students.forEach(s => {
      (s.linkedParents || []).forEach(p => parentIdSet.add(String(p)));
      if (s.parentId) parentIdSet.add(String(s.parentId));
    });
    const parents = await User.find({ _id: { $in: [...parentIdSet] }, role: 'parent' })
      .select('_id firstName lastName email')
      .lean();
    const parentById = {};
    parents.forEach(p => { parentById[String(p._id)] = p; });

    // Build the student list, each with their resolved parents
    const studentList = students.map(s => {
      const linkedIds = [
        ...(s.linkedParents || []).map(String),
        ...(s.parentId ? [String(s.parentId)] : []),
      ];
      const myParents = [...new Set(linkedIds)]
        .map(id => parentById[id])
        .filter(p => p && p.email)
        .map(p => ({
          _id: p._id,
          name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email,
          email: p.email,
        }));
      return {
        _id: s._id,
        name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email,
        email: s.email || '',
        parents: myParents,
      };
    });

    // Colleagues — other teachers + admins
    const colleagues = await User.find({
      role: { $in: ['teacher', 'admin'] },
      _id: { $ne: req.user._id },
    })
      .select('_id firstName lastName email role')
      .sort('firstName')
      .lean();
    const colleagueList = colleagues
      .filter(c => c.email)
      .map(c => ({
        _id: c._id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        email: c.email,
        role: c.role,
      }));

    res.json({
      success: true,
      data: { students: studentList, colleagues: colleagueList },
    });
  } catch (e) {
    console.error('[communication teacher/recipients]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/communication/teacher/send
// Body: { subject, body, recipientEmails: [{ email, name }], attachments, audience }
//
// Recipients come from two sources:
//   1. Community recipients — students allocated to this teacher,
//      those students' parents, and colleague teachers/admins.
//      Server re-validates these against the teacher's allowed set.
//   2. External recipients — any well-formed email address typed
//      manually by the teacher (e.g. an outside parent contact,
//      a colleague at another school, a guest speaker). These pass
//      a format check and go through. All sends are audit-logged.
// ─────────────────────────────────────────────────────────
router.post('/teacher/send', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const Allocation = require('../models/Allocation');
    const { subject, body, recipientEmails = [], attachments = [], audience = '' } = req.body;

    if (!subject || !subject.trim())
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    if (!body || !body.trim())
      return res.status(400).json({ success: false, message: 'Message body is required.' });

    // Build the teacher's community allowed-set, server-side
    const allocs = await Allocation.find({ teacherId: req.user._id, status: 'Active' })
      .select('studentId').lean();
    const studentIds = [...new Set(allocs.map(a => String(a.studentId)).filter(Boolean))];
    const students = await User.find({ _id: { $in: studentIds } })
      .select('email linkedParents parentId').lean();

    const parentIdSet = new Set();
    students.forEach(s => {
      (s.linkedParents || []).forEach(p => parentIdSet.add(String(p)));
      if (s.parentId) parentIdSet.add(String(s.parentId));
    });
    const parents = await User.find({ _id: { $in: [...parentIdSet] } }).select('email').lean();
    const colleagues = await User.find({ role: { $in: ['teacher', 'admin'] } }).select('email').lean();

    const allowedCommunity = new Set();
    students.forEach(s => s.email && allowedCommunity.add(s.email.toLowerCase()));
    parents.forEach(p => p.email && allowedCommunity.add(p.email.toLowerCase()));
    colleagues.forEach(c => c.email && allowedCommunity.add(c.email.toLowerCase()));

    // Split each requested recipient into community vs external.
    // Community recipients are validated against the allowedCommunity set.
    // External recipients pass through if the address looks well-formed.
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const requested = Array.isArray(recipientEmails) ? recipientEmails : [];
    const seen = new Set();
    const finalRecipients = [];
    let communityCount = 0;
    let externalCount = 0;
    let rejected = 0;
    for (const r of requested) {
      const emailRaw = String(r?.email || '').trim();
      if (!emailRaw) continue;
      const emailLc = emailRaw.toLowerCase();
      if (seen.has(emailLc)) continue;

      if (allowedCommunity.has(emailLc)) {
        // Community recipient — known user
        seen.add(emailLc);
        finalRecipients.push({ email: emailRaw, name: r.name || '' });
        communityCount++;
      } else if (EMAIL_RE.test(emailRaw)) {
        // External recipient — typed manually, format-valid
        seen.add(emailLc);
        finalRecipients.push({ email: emailRaw, name: r.name || '' });
        externalCount++;
      } else {
        // Malformed address
        rejected++;
      }
    }

    if (finalRecipients.length === 0)
      return res.status(400).json({
        success: false,
        message: rejected > 0
          ? 'No valid recipients — one or more addresses were malformed.'
          : 'No recipients selected.',
      });

    const senderName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Smartious Teacher';

    const mailAttachments = (Array.isArray(attachments) ? attachments : [])
      .filter(a => a && a.url)
      .map(a => ({ filename: a.name || 'attachment', path: a.url }));

    const { results, sentCount, failedCount } = await sendBulkEmail({
      recipients: finalRecipients,
      subject: subject.trim(),
      bodyText: body,
      senderName,
      attachments: mailAttachments,
    });

    // Build a human-readable audience label that reflects the split.
    let audienceLabel = audience;
    if (!audienceLabel) {
      const parts = [];
      if (communityCount) parts.push(`${communityCount} from community`);
      if (externalCount)  parts.push(`${externalCount} external`);
      audienceLabel = parts.join(', ') || `${finalRecipients.length} recipient(s)`;
    }

    const record = await Communication.create({
      sentBy: req.user._id,
      sentByName: senderName,
      sentByRole: req.user.role,
      subject: subject.trim(),
      body,
      attachments: (attachments || []).map(a => ({ name: a.name, url: a.url })),
      recipients: results,
      recipientCount: finalRecipients.length,
      sentCount,
      failedCount,
      audience: audienceLabel,
    });

    res.json({
      success: true,
      message: `Sent ${sentCount} of ${finalRecipients.length} email${finalRecipients.length === 1 ? '' : 's'}`
        + (externalCount > 0 ? ` (${externalCount} external).` : '.'),
      data: { id: record._id, sentCount, failedCount, rejected, communityCount, externalCount, results },
    });
  } catch (e) {
    console.error('[communication teacher/send]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/communication/teacher/history — this teacher's campaigns
// ─────────────────────────────────────────────────────────
router.get('/teacher/history', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const history = await Communication.find({ sentBy: req.user._id })
      .sort('-createdAt')
      .limit(60)
      .lean();
    res.json({ success: true, data: { history } });
  } catch (e) {
    console.error('[communication teacher/history]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/communication/student/recipients
// A student's allowed audience: the teachers allocated to them,
// plus admins. NO parents, NO other students, NO external.
// ─────────────────────────────────────────────────────────
router.get('/student/recipients', auth, requireRole('student', 'admin'), async (req, res) => {
  try {
    const Allocation = require('../models/Allocation');

    // Teachers allocated to this student (active allocations)
    const allocs = await Allocation.find({ studentId: req.user._id, status: 'Active' })
      .populate('teacherId', 'firstName lastName email')
      .populate('subjectId', 'subjectName')
      .lean();

    // De-dupe teachers, noting which subject(s) they teach this student
    const teacherMap = {};
    allocs.forEach(a => {
      const t = a.teacherId;
      if (!t || !t.email) return;
      const tid = String(t._id);
      if (!teacherMap[tid]) {
        teacherMap[tid] = {
          _id: t._id,
          name: `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.email,
          email: t.email,
          role: 'teacher',
          subjects: [],
        };
      }
      const subjName = a.subjectId?.subjectName;
      if (subjName && !teacherMap[tid].subjects.includes(subjName)) {
        teacherMap[tid].subjects.push(subjName);
      }
    });
    const teachers = Object.values(teacherMap);

    // Admins
    const admins = await User.find({ role: 'admin' })
      .select('_id firstName lastName email')
      .sort('firstName')
      .lean();
    const adminList = admins
      .filter(a => a.email)
      .map(a => ({
        _id: a._id,
        name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email,
        email: a.email,
        role: 'admin',
        subjects: [],
      }));

    res.json({ success: true, data: { teachers, admins: adminList } });
  } catch (e) {
    console.error('[communication student/recipients]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/communication/student/send
// Body: { subject, body, recipientEmails: [{ email, name }], attachments, audience }
// Server re-validates every address against the student's allowed
// set (their allocated teachers + admins) — a student cannot email
// anyone else, regardless of what the frontend sends.
// ─────────────────────────────────────────────────────────
router.post('/student/send', auth, requireRole('student', 'admin'), async (req, res) => {
  try {
    const Allocation = require('../models/Allocation');
    const { subject, body, recipientEmails = [], attachments = [], audience = '' } = req.body;

    if (!subject || !subject.trim())
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    if (!body || !body.trim())
      return res.status(400).json({ success: false, message: 'Message body is required.' });

    // Rebuild the student's allowed email set, server-side
    const allocs = await Allocation.find({ studentId: req.user._id, status: 'Active' })
      .populate('teacherId', 'email').lean();
    const admins = await User.find({ role: 'admin' }).select('email').lean();

    const allowed = new Set();
    allocs.forEach(a => { if (a.teacherId?.email) allowed.add(a.teacherId.email.toLowerCase()); });
    admins.forEach(a => { if (a.email) allowed.add(a.email.toLowerCase()); });

    // Filter requested recipients to the allowed set
    const requested = Array.isArray(recipientEmails) ? recipientEmails : [];
    const seen = new Set();
    const finalRecipients = [];
    let rejected = 0;
    for (const r of requested) {
      const email = String(r?.email || '').trim().toLowerCase();
      if (!email) continue;
      if (!allowed.has(email)) { rejected++; continue; }
      if (seen.has(email)) continue;
      seen.add(email);
      finalRecipients.push({ email: r.email.trim(), name: r.name || '' });
    }

    if (finalRecipients.length === 0)
      return res.status(400).json({
        success: false,
        message: rejected > 0
          ? 'No valid recipients — students can only email their own teachers and the administration.'
          : 'No recipients selected.',
      });

    const senderName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Smartious Student';

    const mailAttachments = (Array.isArray(attachments) ? attachments : [])
      .filter(a => a && a.url)
      .map(a => ({ filename: a.name || 'attachment', path: a.url }));

    const { results, sentCount, failedCount } = await sendBulkEmail({
      recipients: finalRecipients,
      subject: subject.trim(),
      bodyText: body,
      senderName,
      attachments: mailAttachments,
    });

    const record = await Communication.create({
      sentBy: req.user._id,
      sentByName: senderName,
      sentByRole: req.user.role,
      subject: subject.trim(),
      body,
      attachments: (attachments || []).map(a => ({ name: a.name, url: a.url })),
      recipients: results,
      recipientCount: finalRecipients.length,
      sentCount,
      failedCount,
      audience: audience || `${finalRecipients.length} recipient${finalRecipients.length === 1 ? '' : 's'}`,
    });

    res.json({
      success: true,
      message: `Sent ${sentCount} of ${finalRecipients.length} email${finalRecipients.length === 1 ? '' : 's'}.`,
      data: { id: record._id, sentCount, failedCount, rejected, results },
    });
  } catch (e) {
    console.error('[communication student/send]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/communication/student/history — this student's sends
// ─────────────────────────────────────────────────────────
router.get('/student/history', auth, requireRole('student', 'admin'), async (req, res) => {
  try {
    const history = await Communication.find({ sentBy: req.user._id })
      .sort('-createdAt')
      .limit(50)
      .lean();
    res.json({ success: true, data: { history } });
  } catch (e) {
    console.error('[communication student/history]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
