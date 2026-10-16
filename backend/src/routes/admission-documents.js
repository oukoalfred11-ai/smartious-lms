/**
 * routes/admission-documents.js
 * ============================================================
 * Students and parents upload the admission documents listed in the
 * Admission Pack; only admin and Dean & Operations open and review them.
 * Mounted at /api/admission-documents
 *
 * Families (student, or a parent linked to the student):
 *   GET    /mine?studentId=   — the student's admission file + checklist
 *   POST   /presign           — { studentId?, fileName, mimeType, fileSize }
 *   (browser PUTs the file straight to R2)
 *   POST   /confirm           — { r2Key, category, title, note, … }
 *   GET    /pack              — the Admission Pack PDF
 * Both sides:
 *   GET    /:id/open          — short-lived signed link to the file
 *   DELETE /:id               — family: only while not verified; admin: any
 * Reviewers (admin, dos, ops_manager):
 *   GET    /overview          — every student's file at a glance
 *   GET    /student/:id       — one student's file
 *   PATCH  /:id/review        — { status: verified | rejected | pending, reviewNote }
 *
 * Files are private: no public URL is stored or returned, so an ID or a
 * medical report can only be opened by someone allowed to, for 10 minutes.
 */
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const AdmissionDocument = require('../models/AdmissionDocument');
const { ADMISSION_DOC_CATEGORIES, ADMISSION_DOC_KEYS, REQUIRED_ADMISSION_DOCS, ADMISSION_REVIEW_ROLES } = require('../constants/admissionDocs');
const { auth, requireRole } = require('../middleware/auth');
const { PACK_PATH } = require('../lib/admissionPack');

const R2_READY = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME);
const r2Guard = (req, res, next) => R2_READY ? next() : res.status(503).json({ success: false, message: 'Document storage is not configured on the server. Please contact the school.' });
const r2 = R2_READY ? new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
}) : null;
const BUCKET = process.env.R2_BUCKET_NAME;

const FAMILY_ROLES = ['student', 'parent'];
const REVIEW = ADMISSION_REVIEW_ROLES;
const isReviewer = (u) => REVIEW.includes(u.role);
const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const fullName = (u) => [u.firstName, u.lastName].filter(Boolean).join(' ');

/** The students this family member may file for. */
async function childrenOf(user) {
  if (user.role === 'student') return [user];
  const ids = new Set((user.linkedStudents || []).map(String));
  const viaStudents = await User.find({ role: 'student', $or: [{ parentId: user._id }, { linkedParents: user._id }] }).select('_id').lean();
  viaStudents.forEach(s => ids.add(String(s._id)));
  if (!ids.size) return [];
  return User.find({ _id: { $in: [...ids] }, role: 'student' }).select('firstName lastName email admissionNumber').sort({ firstName: 1 }).lean();
}

/** Resolve which student a family request is about, or null if not allowed. */
async function familyStudent(user, requestedId) {
  const kids = await childrenOf(user);
  if (!kids.length) return { kids, student: null };
  if (!requestedId) return { kids, student: kids[0] };
  return { kids, student: kids.find(k => String(k._id) === String(requestedId)) || null };
}

/** Checklist summary for one student's documents. */
function summarise(docs) {
  const byCat = {};
  for (const d of docs) (byCat[d.category] = byCat[d.category] || []).push(d);
  const ok = (k) => (byCat[k] || []).some(d => d.status !== 'rejected');
  const verified = (k) => (byCat[k] || []).some(d => d.status === 'verified');
  return {
    requiredTotal: REQUIRED_ADMISSION_DOCS.length,
    requiredSubmitted: REQUIRED_ADMISSION_DOCS.filter(ok).length,
    requiredVerified: REQUIRED_ADMISSION_DOCS.filter(verified).length,
    pending: docs.filter(d => d.status === 'pending').length,
    rejected: docs.filter(d => d.status === 'rejected').length,
  };
}

const publicDoc = (d) => { const { file, ...rest } = d.toObject ? d.toObject() : d; return { ...rest, file: { filename: file?.filename, mimeType: file?.mimeType, sizeBytes: file?.sizeBytes } }; };

// ── Family: my admission file ──────────────────────────────
router.get('/mine', auth, requireRole(...FAMILY_ROLES), async (req, res) => {
  try {
    const { kids, student } = await familyStudent(req.user, req.query.studentId);
    if (!student) return res.json({ success: true, data: { children: kids, student: null, documents: [], categories: ADMISSION_DOC_CATEGORIES } });
    const docs = await AdmissionDocument.find({ studentId: student._id }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: {
      children: req.user.role === 'parent' ? kids.map(k => ({ _id: k._id, name: fullName(k) })) : [],
      student: { _id: student._id, name: fullName(student), admissionNumber: student.admissionNumber || null },
      documents: docs.map(publicDoc), categories: ADMISSION_DOC_CATEGORIES, summary: summarise(docs),
    } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Family: the Admission Pack PDF ─────────────────────────
router.get('/pack', auth, requireRole(...FAMILY_ROLES, ...REVIEW), (req, res) => {
  res.download(PACK_PATH, 'Smartious_Admission_Pack_2026.pdf', (err) => {
    if (err && !res.headersSent) res.status(404).json({ success: false, message: 'The Admission Pack is not available right now.' });
  });
});

// ── Family: upload (presign → PUT → confirm) ───────────────
router.post('/presign', auth, requireRole(...FAMILY_ROLES), r2Guard, async (req, res) => {
  try {
    const { studentId, fileName, mimeType, fileSize } = req.body || {};
    const { student } = await familyStudent(req.user, studentId);
    if (!student) return res.status(403).json({ success: false, message: 'You can only upload documents for your own child.' });
    if (!fileName) return res.status(400).json({ success: false, message: 'Choose a file.' });
    const size = Number(fileSize) || 0;
    if (size <= 0 || size > MAX_BYTES) return res.status(400).json({ success: false, message: 'Files must be smaller than 20 MB.' });
    if (mimeType && !ALLOWED_MIME.includes(mimeType)) return res.status(400).json({ success: false, message: 'Please upload a PDF, a photo (JPG, PNG, HEIC) or a Word document.' });
    const safeName = String(fileName).replace(/[^\w.\- ]+/g, '_').slice(0, 140);
    const r2Key = `admission-docs/${student._id}/${uuidv4()}-${safeName}`;
    const uploadUrl = await getSignedUrl(r2, new PutObjectCommand({ Bucket: BUCKET, Key: r2Key, ContentType: mimeType || 'application/octet-stream' }), { expiresIn: 15 * 60 });
    return res.json({ success: true, data: { uploadUrl, r2Key } });
  } catch (e) {
    console.error('[admission-documents presign]', e.message);
    return res.status(500).json({ success: false, message: 'Could not prepare the upload.' });
  }
});

router.post('/confirm', auth, requireRole(...FAMILY_ROLES), r2Guard, async (req, res) => {
  try {
    const { r2Key, category, title, note, fileName, mimeType, fileSize } = req.body || {};
    const m = /^admission-docs\/([a-f0-9]{24})\//.exec(String(r2Key || ''));
    if (!m) return res.status(400).json({ success: false, message: 'Invalid upload.' });
    const { student } = await familyStudent(req.user, m[1]);
    if (!student) return res.status(403).json({ success: false, message: 'Invalid upload.' });
    if (!ADMISSION_DOC_KEYS.includes(category)) return res.status(400).json({ success: false, message: 'Choose which document this is.' });
    const label = ADMISSION_DOC_CATEGORIES.find(c => c.key === category).label;
    const doc = await AdmissionDocument.create({
      studentId: student._id, category,
      title: String(title || '').trim().slice(0, 200) || label,
      note: String(note || '').trim().slice(0, 1000),
      uploadedBy: req.user._id, uploadedByName: fullName(req.user), uploadedByRole: req.user.role,
      file: { key: r2Key, filename: String(fileName || 'document').slice(0, 200), mimeType: String(mimeType || ''), sizeBytes: Number(fileSize) || 0 },
    });
    return res.json({ success: true, data: { document: publicDoc(doc) }, message: label + ' uploaded. The school will review it.' });
  } catch (e) {
    console.error('[admission-documents confirm]', e.message);
    return res.status(500).json({ success: false, message: 'Could not save the document.' });
  }
});

// ── Reviewers: overview of every student's file ────────────
router.get('/overview', auth, requireRole(...REVIEW), async (req, res) => {
  try {
    const [students, docs] = await Promise.all([
      User.find({ role: 'student', archived: { $ne: true } }).select('firstName lastName email admissionNumber createdAt isActive').sort({ createdAt: -1 }).lean(),
      AdmissionDocument.find({}).select('studentId category status createdAt').lean(),
    ]);
    const byStudent = {};
    for (const d of docs) (byStudent[String(d.studentId)] = byStudent[String(d.studentId)] || []).push(d);
    const rows = students.map(s => {
      const list = byStudent[String(s._id)] || [];
      const latest = list.reduce((a, d) => (!a || d.createdAt > a ? d.createdAt : a), null);
      return { _id: s._id, name: fullName(s), email: s.email, admissionNumber: s.admissionNumber || null, joined: s.createdAt, total: list.length, latest, ...summarise(list) };
    });
    return res.json({ success: true, data: { students: rows, categories: ADMISSION_DOC_CATEGORIES } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.get('/student/:id', auth, requireRole(...REVIEW), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id.' });
    const student = await User.findById(req.params.id).select('firstName lastName email admissionNumber role').lean();
    if (!student || student.role !== 'student') return res.status(404).json({ success: false, message: 'Student not found.' });
    const docs = await AdmissionDocument.find({ studentId: student._id }).sort({ category: 1, createdAt: -1 }).lean();
    return res.json({ success: true, data: { student: { _id: student._id, name: fullName(student), email: student.email, admissionNumber: student.admissionNumber || null },
      documents: docs.map(publicDoc), categories: ADMISSION_DOC_CATEGORIES, summary: summarise(docs) } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/:id/review', auth, requireRole(...REVIEW), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id.' });
    const status = req.body?.status;
    if (!['verified', 'rejected', 'pending'].includes(status)) return res.status(400).json({ success: false, message: 'Unknown status.' });
    const reviewNote = String(req.body?.reviewNote || '').trim().slice(0, 1000);
    if (status === 'rejected' && !reviewNote) return res.status(400).json({ success: false, message: 'Tell the family why, so they can upload the right copy.' });
    const set = status === 'pending'
      ? { status, reviewNote: '', reviewedBy: null, reviewedByName: '', reviewedAt: null }
      : { status, reviewNote, reviewedBy: req.user._id, reviewedByName: fullName(req.user), reviewedAt: new Date() };
    const doc = await AdmissionDocument.findByIdAndUpdate(req.params.id, { $set: set }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    return res.json({ success: true, data: { document: publicDoc(doc) },
      message: status === 'verified' ? 'Verified.' : status === 'rejected' ? 'Marked as needing a new copy.' : 'Review cleared.' });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Open a file (signed link, 10 minutes) ──────────────────
async function mayAccess(user, doc) {
  if (isReviewer(user)) return true;
  if (!FAMILY_ROLES.includes(user.role)) return false;
  const { student } = await familyStudent(user, doc.studentId);
  return !!student;
}

router.get('/:id/open', auth, r2Guard, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id.' });
    const doc = await AdmissionDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    if (!(await mayAccess(req.user, doc))) return res.status(403).json({ success: false, message: 'Only the family, the Principal and the Dean can open this document.' });
    const url = await getSignedUrl(r2, new GetObjectCommand({
      Bucket: BUCKET, Key: doc.file.key,
      ResponseContentDisposition: `inline; filename="${String(doc.file.filename).replace(/"/g, '')}"`,
    }), { expiresIn: 10 * 60 });
    return res.json({ success: true, data: { url } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id.' });
    const doc = await AdmissionDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    const admin = req.user.role === 'admin';
    if (!admin) {
      if (!(await mayAccess(req.user, doc)) || isReviewer(req.user))
        return res.status(403).json({ success: false, message: 'Not allowed.' });
      if (doc.status === 'verified')
        return res.status(400).json({ success: false, message: 'This document has been verified, so it stays on file. Contact the school if it needs replacing.' });
    }
    if (R2_READY && doc.file?.key) {
      try { await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: doc.file.key })); }
      catch (e) { console.error('[admission-documents delete r2]', e.message); }
    }
    await doc.deleteOne();
    return res.json({ success: true, message: 'Document deleted.' });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
