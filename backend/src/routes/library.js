/**
 * routes/library.js
 * ============================================================
 * Library of subject coursebook PDFs.
 * Mounted at /api/library
 *
 * Storage: Cloudflare R2 (S3-compatible, zero egress fees).
 * Upload flow (presigned — file never hits Render):
 *
 *   1. POST /presign  — client sends filename + size + subjectId
 *                       server returns { uploadUrl, r2Key, publicUrl }
 *   2. Client PUTs the file directly to uploadUrl (browser → R2)
 *   3. POST /confirm  — client confirms upload; server saves metadata to Mongo
 *
 * Read flow:
 *   GET /           — list books (metadata only)
 *   GET /:id        — single book metadata
 *   GET /:id/view   — returns the permanent R2 public URL for the viewer
 *   PATCH /:id      — update metadata
 *   DELETE /:id     — delete book + R2 object
 *
 * Required env vars (set in Render dashboard):
 *   R2_ACCOUNT_ID       — Cloudflare account ID
 *   R2_ACCESS_KEY_ID    — R2 API token Access Key ID
 *   R2_SECRET_ACCESS_KEY — R2 API token Secret Access Key
 *   R2_BUCKET_NAME      — bucket name e.g. smartious-library
 *   R2_PUBLIC_URL       — public bucket URL e.g. https://library.smartioushomeschool.com
 *                         (or the r2.dev URL Cloudflare gives you)
 */

const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const LibraryBook = require('../models/LibraryBook');
const Subject     = require('../models/Subject');
const { auth, requireRole } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────
// R2 client — S3-compatible, pointed at Cloudflare's endpoint
// ─────────────────────────────────────────────────────────
const R2_READY = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_URL)
if (!R2_READY) console.warn('[library] R2 storage NOT configured - uploads and viewing will fail. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL on Render.')
const r2Guard = (req, res, next) => R2_READY ? next() : res.status(503).json({ success:false, message:'Library storage (R2) is not configured on the server. Contact the administrator.' })

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET      = process.env.R2_BUCKET_NAME;
const PUBLIC_URL  = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

// Presigned upload URL expires in 15 minutes — enough for any file size
const PRESIGN_EXPIRES = 15 * 60;

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const ok   = (res, data, msg) => res.json({ success: true, data, message: msg });
const fail = (res, status, msg) => res.status(status).json({ success: false, message: msg });

// Sanitise a filename to a safe R2 key component
function safeFileName(name) {
  return (name || 'file').replace(/[^a-zA-Z0-9._\-]/g, '_').slice(0, 100);
}

async function visibilityFilterFor(user) {
  if (user.role === 'admin') return { isActive: true };

  if (user.role === 'teacher') {
    // Build OR conditions so teacher is never locked out:
    // 1. Books they uploaded themselves
    // 2. Books for subjects in their teachingSpecialties
    // 3. Books matching their curriculum (fallback when specialties not yet populated)
    const conditions = [{ uploadedBy: user._id }];

    const specIds = [...new Set(
      (user.teachingSpecialties || []).map(s => String(s.subjectId)).filter(Boolean)
    )];
    if (specIds.length) conditions.push({ subjectId: { $in: specIds } });

    const curricula = Array.isArray(user.curriculum)
      ? user.curriculum.filter(Boolean)
      : user.curriculum ? [user.curriculum] : [];
    if (curricula.length) conditions.push({ curriculum: { $in: curricula } });

    // If no curriculum/specialties at all, show everything so teacher isn't locked out
    return conditions.length > 1
      ? { isActive: true, $or: conditions }
      : { isActive: true };
  }

  if (user.role === 'student') {
    const names = Array.isArray(user.subjects) ? user.subjects : [];
    if (!names.length) return { _id: { $exists: false } };
    const curr = typeof user.curriculum === 'string' ? user.curriculum : '';
    return { isActive: true, subjectName: { $in: names }, ...(curr ? { curriculum: curr } : {}) };
  }

  return { _id: { $exists: false } };
}

// ═══════════════════════════════════════════════════════════
// POST /presign
// Step 1 of the upload flow.
// Body: { subjectId, fileName, fileSize, mimeType? }
// Returns: { uploadUrl, r2Key, publicUrl, expiresAt }
// The client PUTs the file directly to uploadUrl.
// ═══════════════════════════════════════════════════════════
router.post('/presign', auth, r2Guard, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { subjectId, fileName, fileSize, mimeType } = req.body || {};

    if (!subjectId || !mongoose.isValidObjectId(subjectId))
      return fail(res, 400, 'Valid subjectId is required.');
    if (!fileName || !String(fileName).trim())
      return fail(res, 400, 'fileName is required.');

    const subject = await Subject.findById(subjectId).lean();
    if (!subject) return fail(res, 404, 'Subject not found.');

    // Build a unique, collision-free R2 key
    const safe = safeFileName(fileName);
    const r2Key = `library/${subject.curriculum}/${subject.subjectName}/${uuidv4()}_${safe}`;
    const contentType = mimeType || 'application/pdf';

    // Generate a presigned PUT URL — the browser uploads directly to this
    const command = new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         r2Key,
      ContentType: contentType,
      ContentDisposition: 'inline',
    });
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: PRESIGN_EXPIRES });
    const publicUrl = `${PUBLIC_URL}/${r2Key}`;

    console.log('[library presign] r2Key:', r2Key, 'size:', fileSize || 'unknown');

    return ok(res, {
      uploadUrl,
      r2Key,
      publicUrl,
      expiresAt: new Date(Date.now() + PRESIGN_EXPIRES * 1000).toISOString(),
    }, 'Presigned URL ready. PUT the file to uploadUrl, then call /confirm.');
  } catch (err) {
    console.error('[library presign]', err.message);
    return fail(res, 500, err.message || 'Could not generate upload URL.');
  }
});

// ═══════════════════════════════════════════════════════════
// POST /presign-cover
// Get a presigned URL to upload a cover image to R2.
// Same flow as /presign but for images (jpg/png/webp).
// ═══════════════════════════════════════════════════════════
router.post('/presign-cover', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { fileName, mimeType } = req.body || {};
    if (!fileName) return fail(res, 400, 'fileName is required.');
    const allowed = ['image/jpeg','image/png','image/webp','image/jpg'];
    const ct = mimeType || 'image/jpeg';
    if (!allowed.includes(ct)) return fail(res, 400, 'Cover must be JPG, PNG or WebP.');

    const safe = safeFileName(fileName);
    const r2Key = `covers/${uuidv4()}_${safe}`;
    const command = new PutObjectCommand({ Bucket: BUCKET, Key: r2Key, ContentType: ct });
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: PRESIGN_EXPIRES });
    const publicUrl = `${PUBLIC_URL}/${r2Key}`;

    return ok(res, { uploadUrl, r2Key, publicUrl }, 'Cover presigned URL ready.');
  } catch (err) {
    console.error('[library presign-cover]', err.message);
    return fail(res, 500, err.message || 'Could not generate cover upload URL.');
  }
});

// ═══════════════════════════════════════════════════════════
// POST /confirm
// Step 2 of the upload flow — called after the browser PUT succeeds.
// Body: { r2Key, publicUrl, subjectId, title, fileName,
//         fileSize?, description?, author?, grades? }
// Creates the LibraryBook record in MongoDB.
// ═══════════════════════════════════════════════════════════
router.post('/confirm', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { coverUrl, section,
      r2Key, publicUrl, subjectId, title, fileName,
      fileSize, description, author, grades, mimeType,
      coverImage, coverR2Key,
    } = req.body || {};

    if (!r2Key)    return fail(res, 400, 'r2Key is required.');
    if (!publicUrl) return fail(res, 400, 'publicUrl is required.');
    if (!subjectId || !mongoose.isValidObjectId(subjectId))
      return fail(res, 400, 'Valid subjectId is required.');
    if (!title || !String(title).trim())
      return fail(res, 400, 'Title is required.');

    // Verify the r2Key starts with 'library/' — simple guard against
    // confirming an upload to an arbitrary bucket key
    if (!r2Key.startsWith('library/'))
      return fail(res, 400, 'Invalid r2Key.');

    const subject = await Subject.findById(subjectId).lean();
    if (!subject) return fail(res, 404, 'Subject not found.');

    let gradeArr = [];
    if (Array.isArray(grades)) gradeArr = grades.map(g => String(g).trim()).filter(Boolean);
    else if (typeof grades === 'string' && grades.trim())
      gradeArr = grades.split(',').map(g => g.trim()).filter(Boolean);

    const uploaderName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();

    const book = await LibraryBook.create({
      coverUrl: coverUrl || '',
      section: ['coursebook','mock','past_paper'].includes(section) ? section : 'coursebook',
      title:          String(title).trim(),
      description:    description ? String(description).trim() : '',
      author:         author      ? String(author).trim()      : '',
      subjectId,
      subjectName:    subject.subjectName,
      curriculum:     subject.curriculum,
      grades:         gradeArr,
      r2Key,
      url:            publicUrl,
      coverImage:     coverImage || '',
      coverR2Key:     coverR2Key || '',
      fileName:       String(fileName || 'book.pdf').trim(),
      sizeBytes:      Number(fileSize) || 0,
      mimeType:       mimeType || 'application/pdf',
      uploadedBy:     req.user._id,
      uploadedByName: uploaderName,
      isActive:       true,
    });

    console.log('[library confirm] saved:', book.title, '—', book.r2Key);
    return ok(res, { book }, 'Book saved to library.');
  } catch (err) {
    console.error('[library confirm]', err.message);
    return fail(res, 500, err.message || 'Could not save book.');
  }
});

// ═══════════════════════════════════════════════════════════
// GET / — List books visible to the current user
// ═══════════════════════════════════════════════════════════
router.get('/', auth, async (req, res) => {
  try {
    const filter = await visibilityFilterFor(req.user);

    if (req.query.subjectId && mongoose.isValidObjectId(req.query.subjectId))
      filter.subjectId = req.query.subjectId;
    if (req.query.curriculum)
      filter.curriculum = String(req.query.curriculum).trim();
    if (req.query.q && String(req.query.q).trim()) {
      const term = String(req.query.q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title:       { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { author:      { $regex: term, $options: 'i' } },
      ];
    }

    const books = await LibraryBook.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return ok(res, { books, count: books.length }, `${books.length} book(s).`);
  } catch (err) {
    console.error('[library list]', err.message);
    return fail(res, 500, err.message || 'List failed.');
  }
});

// ═══════════════════════════════════════════════════════════
// GET /:id — Single book metadata
// ═══════════════════════════════════════════════════════════
router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid id.');
    const book = await LibraryBook.findById(req.params.id).lean();
    if (!book || !book.isActive) return fail(res, 404, 'Book not found.');

    const filter = await visibilityFilterFor(req.user);
    const allowed = await LibraryBook.exists({ _id: book._id, ...filter });
    if (!allowed) return fail(res, 403, 'Access denied.');

    return ok(res, { book }, 'Book.');
  } catch (err) {
    console.error('[library get]', err.message);
    return fail(res, 500, err.message || 'Get failed.');
  }
});

// ═══════════════════════════════════════════════════════════
// GET /:id/view — Returns the public R2 URL for the PDF viewer
// Same interface as the old /view-url endpoint so LibraryViewer
// needs no changes (just point it at /view instead of /view-url).
// ═══════════════════════════════════════════════════════════
router.get('/:id/view', auth, r2Guard, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid id.');
    const book = await LibraryBook.findById(req.params.id).lean();
    if (!book || !book.isActive) return fail(res, 404, 'Book not found.');

    const filter = await visibilityFilterFor(req.user);
    const allowed = await LibraryBook.exists({ _id: book._id, ...filter });
    if (!allowed) return fail(res, 403, 'Access denied.');

    // Bump view counter (non-blocking)
    LibraryBook.updateOne({ _id: book._id }, { $inc: { viewCount: 1 } }).catch(() => {});

    return ok(res, {
      url: book.url,
      fileName: book.fileName,
    }, 'View URL.');
  } catch (err) {
    console.error('[library view]', err.message);
    return fail(res, 500, err.message || 'Failed.');
  }
});

// ═══════════════════════════════════════════════════════════
// PATCH /:id — Update metadata (uploader or admin)
// ═══════════════════════════════════════════════════════════
router.patch('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid id.');
    const book = await LibraryBook.findById(req.params.id);
    if (!book) return fail(res, 404, 'Book not found.');

    const isOwner = String(book.uploadedBy) === String(req.user._id);
    if (req.user.role !== 'admin' && !isOwner)
      return fail(res, 403, 'You can only edit books you uploaded.');

    const { title, description, author, grades, isActive, coverUrl } = req.body || {};
    if (coverUrl !== undefined)    book.coverUrl = String(coverUrl).trim();
    if (req.body.section !== undefined && ['coursebook','mock','past_paper'].includes(req.body.section)) book.section = req.body.section;
    if (title !== undefined)       book.title = String(title).trim() || book.title;
    if (description !== undefined) book.description = String(description).trim();
    if (author !== undefined)      book.author = String(author).trim();
    if (grades !== undefined) {
      let arr = [];
      if (Array.isArray(grades)) arr = grades.map(g => String(g).trim()).filter(Boolean);
      else if (typeof grades === 'string') arr = grades.split(',').map(g => g.trim()).filter(Boolean);
      book.grades = arr;
    }
    if (isActive !== undefined) book.isActive = !!isActive;

    await book.save();
    return ok(res, { book }, 'Book updated.');
  } catch (err) {
    console.error('[library patch]', err.message);
    return fail(res, 500, err.message || 'Update failed.');
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE /:id — Delete book + R2 object (uploader or admin)
// ═══════════════════════════════════════════════════════════
router.delete('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid id.');
    const book = await LibraryBook.findById(req.params.id);
    if (!book) return fail(res, 404, 'Book not found.');

    const isOwner = String(book.uploadedBy) === String(req.user._id);
    if (req.user.role !== 'admin' && !isOwner)
      return fail(res, 403, 'You can only delete books you uploaded.');

    // Delete PDF and cover from R2 (non-fatal)
    for (const key of [book.r2Key, book.coverR2Key].filter(Boolean)) {
      try {
        await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
        console.log('[library delete] R2 object deleted:', key);
      } catch (e) {
        console.error('[library delete] R2 cleanup failed for', key, ':', e.message);
      }
    }

    await book.deleteOne();
    return ok(res, { deleted: true }, 'Book deleted.');
  } catch (err) {
    console.error('[library delete]', err.message);
    return fail(res, 500, err.message || 'Delete failed.');
  }
});

// ═══════════════════════════════════════════════════════════
// GET /:id/stream — Proxy-stream the PDF from R2 through the
// backend. Serves from the same origin as the API so the
// browser's native PDF viewer loads it without CORS issues.
// Supports Range requests so browsers can seek large PDFs.
// Auth via ?token= query param (iframe can't send headers).
// ═══════════════════════════════════════════════════════════
router.get('/:id/stream', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return fail(res, 400, 'Invalid id.');

    const book = await LibraryBook.findById(req.params.id).lean();
    if (!book || !book.isActive) return fail(res, 404, 'Book not found.');

    const filter = await visibilityFilterFor(req.user);
    const allowed = await LibraryBook.exists({ _id: book._id, ...filter });
    if (!allowed) return fail(res, 403, 'Access denied.');

    // Bump view counter (non-blocking)
    LibraryBook.updateOne({ _id: book._id }, { $inc: { viewCount: 1 } }).catch(() => {});

    // Fetch from R2 and pipe to client, forwarding Range header if present
    const fetchHeaders = { 'Accept': 'application/pdf' };
    if (req.headers.range) fetchHeaders['Range'] = req.headers.range;

    const r2Res = await fetch(book.url, { headers: fetchHeaders });
    if (!r2Res.ok) return fail(res, 502, 'Could not fetch file from storage.');

    const status = req.headers.range && r2Res.status === 206 ? 206 : 200;
    const fileName = (book.fileName || 'book.pdf').replace(/[^\w.\-]/g, '_');

    res.status(status);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${fileName}"`);
    res.set('Cache-Control', 'private, max-age=3600');
    res.set('Accept-Ranges', 'bytes');
    // Allow this endpoint to be loaded in an iframe from the frontend domain
    res.set('X-Frame-Options', 'ALLOWALL');
    res.set('Content-Security-Policy', 'frame-ancestors *');

    if (r2Res.headers.get('Content-Length'))
      res.set('Content-Length', r2Res.headers.get('Content-Length'));
    if (r2Res.headers.get('Content-Range'))
      res.set('Content-Range', r2Res.headers.get('Content-Range'));

    // Pipe the R2 response body to the client
    const { Readable } = require('stream');
    const nodeStream = Readable.fromWeb
      ? Readable.fromWeb(r2Res.body)
      : require('stream').Readable.from(r2Res.body);
    nodeStream.pipe(res);

    nodeStream.on('error', (e) => {
      console.error('[library stream] pipe error:', e.message);
      if (!res.headersSent) res.status(502).end();
    });
  } catch (err) {
    console.error('[library stream]', err.message);
    return fail(res, 500, err.message || 'Stream failed.');
  }
});

module.exports = router;
