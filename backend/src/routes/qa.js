/**
 * qa.js — QA portal data: Teacher Development Programme and
 * School Accreditations.
 * ============================================================
 *   POST   /uploads/presign      — presigned R2 upload (photos,
 *                                  certificates) for TDP and
 *                                  accreditation evidence
 *   GET    /trainings            — all trainings, newest first
 *   POST   /trainings            — record a training
 *   PATCH  /trainings/:id        — edit a training
 *   DELETE /trainings/:id        — remove one (R2 objects too)
 *   GET    /accreditations       — all accreditations
 *   POST   /accreditations       — add one
 *   PATCH  /accreditations/:id   — edit one
 *   DELETE /accreditations/:id   — remove one (R2 objects too)
 *
 * Reads are open to all staff plus the qa role; writes to admin,
 * ops, dos and qa (qa files evidence during reviews, same as the
 * teacher-documents convention). The requireRole middleware's QA
 * read shadow covers GETs automatically, but roles are listed
 * explicitly so the intent is visible here.
 */
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const TeacherTraining = require('../models/TeacherTraining');
const Accreditation   = require('../models/Accreditation');
const { auth, requireRole } = require('../middleware/auth');

const READ_ROLES  = ['admin', 'ops_manager', 'dos', 'teacher', 'accountant', 'sales', 'qa'];
const WRITE_ROLES = ['admin', 'ops_manager', 'dos', 'qa'];

const R2_READY = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_URL);
if (!R2_READY) console.warn('[qa] R2 storage NOT configured - evidence uploads will fail.');
const r2Guard = (req, res, next) => R2_READY ? next() : res.status(503).json({ success: false, message: 'File storage is not configured on the server.' });

const r2 = R2_READY ? new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
}) : null;
const BUCKET     = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_MIME = [
  'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ── Presign ────────────────────────────────────────────────
router.post('/uploads/presign', auth, requireRole(...WRITE_ROLES), r2Guard, async (req, res) => {
  try {
    const { fileName, mimeType, fileSize, kind } = req.body || {};
    if (!fileName) return res.status(400).json({ success: false, message: 'fileName is required.' });
    const size = Number(fileSize) || 0;
    if (size <= 0 || size > MAX_BYTES)
      return res.status(400).json({ success: false, message: 'Files must be between 1 byte and 50 MB.' });
    if (mimeType && !ALLOWED_MIME.includes(mimeType))
      return res.status(400).json({ success: false, message: 'Only PDF, Word and image files are accepted here.' });
    const folder = kind === 'accreditation' ? 'qa/accreditations' : 'qa/trainings';
    const safeName = String(fileName).replace(/[^\w.\- ]+/g, '_').replace(/ /g, '_').slice(0, 140);
    const r2Key = `${folder}/${uuidv4()}-${safeName}`;
    const uploadUrl = await getSignedUrl(r2, new PutObjectCommand({
      Bucket: BUCKET, Key: r2Key, ContentType: mimeType || 'application/octet-stream',
    }), { expiresIn: 15 * 60 });
    return res.json({ success: true, data: { uploadUrl, r2Key, publicUrl: `${PUBLIC_URL}/${r2Key}` } });
  } catch (e) {
    console.error('[qa presign]', e.message);
    return res.status(500).json({ success: false, message: 'Could not prepare the upload.' });
  }
});

const cleanMedia = (arr, withCaption) => (Array.isArray(arr) ? arr : [])
  .filter(x => x && typeof x.url === 'string' && x.url.startsWith(PUBLIC_URL))
  .slice(0, 30)
  .map(x => withCaption
    ? ({ url: x.url, key: x.key || '', caption: String(x.caption || '').slice(0, 200) })
    : ({ url: x.url, key: x.key || '', name: String(x.name || '').slice(0, 200) }));

const deleteObjects = async (items) => {
  if (!r2) return;
  for (const it of items || []) {
    if (!it.key) continue;
    try { await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: it.key })); }
    catch (e) { console.warn('[qa] R2 delete failed:', e.message); }
  }
};

// ── Trainings (TDP) ────────────────────────────────────────
router.get('/trainings', auth, requireRole(...READ_ROLES), async (req, res) => {
  try {
    const rows = await TeacherTraining.find({})
      .populate('attendees', 'firstName lastName avatar subjects')
      .populate('createdBy', 'firstName lastName role')
      .sort({ trainingDate: -1 }).limit(500).lean();
    res.json({ success: true, data: { trainings: rows } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/trainings', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.title || !b.trainingDate)
      return res.status(400).json({ success: false, message: 'Title and training date are required.' });
    const doc = await TeacherTraining.create({
      title: String(b.title).slice(0, 200),
      provider: String(b.provider || '').slice(0, 200),
      trainingDate: new Date(b.trainingDate),
      durationHours: Math.max(0, Math.min(500, Number(b.durationHours) || 0)),
      mode: ['In person', 'Online', 'Blended'].includes(b.mode) ? b.mode : 'In person',
      description: String(b.description || '').slice(0, 4000),
      attendees: (Array.isArray(b.attendees) ? b.attendees : []).filter(id => mongoose.isValidObjectId(id)).slice(0, 200),
      photos: cleanMedia(b.photos, true),
      files: cleanMedia(b.files, false),
      createdBy: req.user._id,
    });
    res.json({ success: true, data: { training: doc } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.patch('/trainings/:id', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const doc = await TeacherTraining.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Training not found.' });
    const b = req.body || {};
    if (b.title !== undefined) doc.title = String(b.title).slice(0, 200);
    if (b.provider !== undefined) doc.provider = String(b.provider).slice(0, 200);
    if (b.trainingDate !== undefined) doc.trainingDate = new Date(b.trainingDate);
    if (b.durationHours !== undefined) doc.durationHours = Math.max(0, Math.min(500, Number(b.durationHours) || 0));
    if (b.mode !== undefined && ['In person', 'Online', 'Blended'].includes(b.mode)) doc.mode = b.mode;
    if (b.description !== undefined) doc.description = String(b.description).slice(0, 4000);
    if (b.attendees !== undefined) doc.attendees = (Array.isArray(b.attendees) ? b.attendees : []).filter(id => mongoose.isValidObjectId(id)).slice(0, 200);
    if (b.photos !== undefined) doc.photos = cleanMedia(b.photos, true);
    if (b.files !== undefined) doc.files = cleanMedia(b.files, false);
    await doc.save();
    res.json({ success: true, data: { training: doc } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/trainings/:id', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const doc = await TeacherTraining.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Training not found.' });
    await deleteObjects([...(doc.photos || []), ...(doc.files || [])]);
    await doc.deleteOne();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Accreditations ─────────────────────────────────────────
router.get('/accreditations', auth, requireRole(...READ_ROLES), async (req, res) => {
  try {
    const rows = await Accreditation.find({})
      .populate('createdBy', 'firstName lastName role')
      .sort({ type: 1, expiresAt: 1, name: 1 }).limit(300).lean();
    res.json({ success: true, data: { accreditations: rows } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/accreditations', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name) return res.status(400).json({ success: false, message: 'Name is required.' });
    const doc = await Accreditation.create({
      name: String(b.name).slice(0, 200),
      body: String(b.body || '').slice(0, 200),
      type: ['Accreditation', 'License', 'Membership', 'Registration', 'Other'].includes(b.type) ? b.type : 'Accreditation',
      certificateNumber: String(b.certificateNumber || '').slice(0, 120),
      issuedAt: b.issuedAt ? new Date(b.issuedAt) : null,
      expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
      notes: String(b.notes || '').slice(0, 2000),
      documents: cleanMedia(b.documents, false),
      createdBy: req.user._id,
    });
    res.json({ success: true, data: { accreditation: doc } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.patch('/accreditations/:id', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const doc = await Accreditation.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Accreditation not found.' });
    const b = req.body || {};
    if (b.name !== undefined) doc.name = String(b.name).slice(0, 200);
    if (b.body !== undefined) doc.body = String(b.body).slice(0, 200);
    if (b.type !== undefined && ['Accreditation', 'License', 'Membership', 'Registration', 'Other'].includes(b.type)) doc.type = b.type;
    if (b.certificateNumber !== undefined) doc.certificateNumber = String(b.certificateNumber).slice(0, 120);
    if (b.issuedAt !== undefined) doc.issuedAt = b.issuedAt ? new Date(b.issuedAt) : null;
    if (b.expiresAt !== undefined) doc.expiresAt = b.expiresAt ? new Date(b.expiresAt) : null;
    if (b.notes !== undefined) doc.notes = String(b.notes).slice(0, 2000);
    if (b.documents !== undefined) doc.documents = cleanMedia(b.documents, false);
    await doc.save();
    res.json({ success: true, data: { accreditation: doc } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/accreditations/:id', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const doc = await Accreditation.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Accreditation not found.' });
    await deleteObjects(doc.documents || []);
    await doc.deleteOne();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
