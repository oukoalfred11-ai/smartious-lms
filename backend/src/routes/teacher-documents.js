/**
 * routes/teacher-documents.js
 * ============================================================
 * Teachers file their working documents by category: schemes of
 * work, lesson plans, records of work, assessment records,
 * teaching resources, reports and other.
 * Mounted at /api/teacher-documents
 *
 * Upload flow mirrors the library (presigned, the file never
 * touches Render):
 *   1. POST /presign  — filename + size + mimeType
 *                       returns { uploadUrl, r2Key, publicUrl }
 *   2. Browser PUTs the file straight to R2
 *   3. POST /confirm  — metadata saved to Mongo
 *
 * Reads:
 *   GET  /mine                 — the calling teacher's documents
 *   GET  /teacher/:teacherId   — a teacher's documents (staff oversight)
 * Delete:
 *   DELETE /:id                — owner or admin; removes R2 object too
 */

const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const TeacherDocument = require('../models/TeacherDocument');
const { auth, requireRole } = require('../middleware/auth');

const R2_READY = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_URL);
if (!R2_READY) console.warn('[teacher-documents] R2 storage NOT configured - uploads will fail.');
const r2Guard = (req, res, next) => R2_READY ? next() : res.status(503).json({ success: false, message: 'Document storage (R2) is not configured on the server. Contact the administrator.' });

const r2 = R2_READY ? new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
}) : null;

const BUCKET     = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

const MAX_BYTES = 50 * 1024 * 1024;   // 50 MB per document
const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png', 'image/jpeg', 'image/webp',
  'text/plain', 'text/csv',
];

const UPLOADER_ROLES = ['teacher', 'admin', 'dos', 'ops_manager', 'qa'];
const OVERSIGHT_ROLES = ['admin', 'dos', 'ops_manager', 'qa'];

// ── 1. Presign ─────────────────────────────────────────────
router.post('/presign', auth, requireRole(...UPLOADER_ROLES), r2Guard, async (req, res) => {
  try {
    const { fileName, mimeType, fileSize, forTeacherId } = req.body || {};
    if (!fileName) return res.status(400).json({ success: false, message: 'fileName is required.' });
    // Oversight staff may file a document into a teacher's file; the
    // upload key is minted under that teacher so confirm binds to them.
    let ownerId = String(req.user._id);
    if (forTeacherId && String(forTeacherId) !== ownerId) {
      if (!OVERSIGHT_ROLES.includes(req.user.role))
        return res.status(403).json({ success: false, message: 'Only oversight staff can file into another teacher\'s documents.' });
      if (!mongoose.isValidObjectId(forTeacherId))
        return res.status(400).json({ success: false, message: 'Invalid teacher id.' });
      ownerId = String(forTeacherId);
    }
    const size = Number(fileSize) || 0;
    if (size <= 0 || size > MAX_BYTES)
      return res.status(400).json({ success: false, message: 'Files must be between 1 byte and 50 MB.' });
    if (mimeType && !ALLOWED_MIME.includes(mimeType))
      return res.status(400).json({ success: false, message: 'Only PDF, Word, Excel, PowerPoint, image, text and CSV files are accepted.' });

    const safeName = String(fileName).replace(/[^\w.\- ]+/g, '_').slice(0, 140);
    const r2Key = `teacher-docs/${ownerId}/${uuidv4()}-${safeName}`;

    const uploadUrl = await getSignedUrl(r2, new PutObjectCommand({
      Bucket: BUCKET, Key: r2Key, ContentType: mimeType || 'application/octet-stream',
    }), { expiresIn: 15 * 60 });

    return res.json({ success: true, data: { uploadUrl, r2Key, publicUrl: `${PUBLIC_URL}/${r2Key}` } });
  } catch (e) {
    console.error('[teacher-documents presign]', e.message);
    return res.status(500).json({ success: false, message: 'Could not prepare the upload.' });
  }
});

// ── 2. Confirm ─────────────────────────────────────────────
router.post('/confirm', auth, requireRole(...UPLOADER_ROLES), r2Guard, async (req, res) => {
  try {
    const { r2Key, category, title, subject, description, fileName, mimeType, fileSize } = req.body || {};
    // The key's second segment is the teacher whose file this joins.
    const m = /^teacher-docs\/([a-f0-9]{24})\//.exec(String(r2Key || ''));
    if (!m) return res.status(400).json({ success: false, message: 'Invalid upload key.' });
    const ownerId = m[1];
    if (ownerId !== String(req.user._id) && !OVERSIGHT_ROLES.includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Invalid upload key.' });
    if (!TeacherDocument.CATEGORIES.includes(category))
      return res.status(400).json({ success: false, message: 'Unknown category.' });
    if (!title || !String(title).trim())
      return res.status(400).json({ success: false, message: 'A title is required.' });

    const doc = await TeacherDocument.create({
      teacherId: ownerId,
      category,
      title:       String(title).trim(),
      subject:     String(subject || '').trim(),
      description: String(description || '').trim(),
      uploadedBy:     req.user._id,
      uploadedByName: [req.user.firstName, req.user.lastName].filter(Boolean).join(' '),
      file: {
        url:       `${PUBLIC_URL}/${r2Key}`,
        key:       r2Key,
        filename:  String(fileName || 'document'),
        mimeType:  String(mimeType || ''),
        sizeBytes: Number(fileSize) || 0,
      },
    });

    return res.json({ success: true, data: { document: doc } });
  } catch (e) {
    console.error('[teacher-documents confirm]', e.message);
    return res.status(500).json({ success: false, message: 'Could not save the document.' });
  }
});

// ── Oversight overview: every teacher's filing at a glance ─
router.get('/overview', auth, requireRole(...OVERSIGHT_ROLES), async (req, res) => {
  try {
    const User = require('../models/User');
    const [teachers, counts] = await Promise.all([
      User.find({ role: 'teacher' }).select('firstName lastName email subjects teacherStatus').sort({ firstName: 1 }).lean(),
      TeacherDocument.aggregate([
        { $group: { _id: { teacherId: '$teacherId', category: '$category' }, n: { $sum: 1 }, latest: { $max: '$createdAt' } } },
      ]),
    ]);
    const byTeacher = {};
    for (const c of counts) {
      const t = String(c._id.teacherId);
      byTeacher[t] = byTeacher[t] || { total: 0, categories: {}, latest: null };
      byTeacher[t].categories[c._id.category] = c.n;
      byTeacher[t].total += c.n;
      if (!byTeacher[t].latest || c.latest > byTeacher[t].latest) byTeacher[t].latest = c.latest;
    }
    const rows = teachers.map(t => ({
      _id: t._id,
      name: [t.firstName, t.lastName].filter(Boolean).join(' '),
      email: t.email || '',
      total: byTeacher[String(t._id)]?.total || 0,
      categories: byTeacher[String(t._id)]?.categories || {},
      latest: byTeacher[String(t._id)]?.latest || null,
    }));
    return res.json({ success: true, data: { teachers: rows, categories: TeacherDocument.CATEGORIES } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ── My documents ───────────────────────────────────────────
router.get('/mine', auth, requireRole(...UPLOADER_ROLES), async (req, res) => {
  try {
    const filter = { teacherId: req.user._id };
    if (req.query.category && TeacherDocument.CATEGORIES.includes(req.query.category))
      filter.category = req.query.category;
    const docs = await TeacherDocument.find(filter).sort({ createdAt: -1 }).limit(1000).lean();
    return res.json({ success: true, data: { documents: docs, categories: TeacherDocument.CATEGORIES } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ── Staff oversight: one teacher's documents ───────────────
router.get('/teacher/:teacherId', auth, requireRole(...OVERSIGHT_ROLES), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.teacherId))
      return res.status(400).json({ success: false, message: 'Invalid id.' });
    const docs = await TeacherDocument.find({ teacherId: req.params.teacherId })
      .sort({ category: 1, createdAt: -1 }).limit(1000).lean();
    return res.json({ success: true, data: { documents: docs, categories: TeacherDocument.CATEGORIES } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ── Delete ─────────────────────────────────────────────────
router.delete('/:id', auth, requireRole(...UPLOADER_ROLES), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid id.' });
    const doc = await TeacherDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    const mine = String(doc.teacherId) === String(req.user._id);
    if (!mine && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not your document.' });

    if (R2_READY && doc.file?.key) {
      try { await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: doc.file.key })); }
      catch (e) { console.error('[teacher-documents delete r2]', e.message); }
    }
    await doc.deleteOne();
    return res.json({ success: true, message: 'Document deleted.' });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
