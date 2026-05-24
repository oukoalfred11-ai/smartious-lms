/**
 * routes/library.js
 * ============================================================
 * Library of subject coursebook PDFs.
 *
 * Mounted at /api/library
 *
 * Storage pattern: PDFs go to Cloudinary (raw resource, separate
 * folder smartious/library). Mongo holds metadata + URL +
 * publicId. Mirrors lessons-route.js exactly.
 *
 * Endpoints:
 *   POST   /upload           Teacher uploads a new book (multipart)
 *   GET    /                 List books (filterable by subject/curriculum)
 *   GET    /:id              Single book metadata
 *   GET    /:id/view-url     Signed delivery URL (short-lived) — used by
 *                            the inline viewer so we can later rotate
 *                            without re-syncing clients
 *   PATCH  /:id              Update metadata (uploader or admin)
 *   DELETE /:id              Delete book + Cloudinary asset (uploader or admin)
 *
 * Visibility rules:
 *   - Teachers see books for subjects in their teachingSpecialties
 *   - Students see books for subjects in their `subjects` array
 *     (matched by name against the LibraryBook.subjectName)
 *     AND matching their curriculum
 *   - Admins see everything
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const LibraryBook = require('../models/LibraryBook');
const Subject = require('../models/Subject');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────
// Cloudinary setup — same pattern as lessons-route.js
// Env vars must already be set (CLOUDINARY_CLOUD_NAME etc.).
// ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const libraryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'smartious/library',
    resource_type: 'raw',                // PDFs are raw assets, not images
    allowed_formats: ['pdf'],
  },
});

// File size limit — set to 10 MB to match Cloudinary's free tier
// per-file ceiling for raw uploads. Once on a paid Cloudinary plan
// (Plus or higher) this can be raised to 200 MB. Lowering this
// here means uploads fail fast in the route with a clear message
// rather than reaching Cloudinary only to be rejected there.
const LIBRARY_MAX_BYTES = 10 * 1024 * 1024;
const uploadBook = multer({
  storage: libraryStorage,
  limits: { fileSize: LIBRARY_MAX_BYTES },
});

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const ok   = (res, data, message) => res.json({ success: true, data, message });
const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Resolve a Cloudinary signed URL for a given publicId.
// Expires in 60 minutes by default — enough for a reading session
// but short enough that stale URLs aren't useful long-term.
function signedDeliveryUrl(publicId, expiresInSeconds = 3600) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  // Cloudinary's url() with sign_url + auth_token would be the
  // most paranoid option. The simpler signed delivery uses the
  // private CDN URL with expiration param.
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    type: 'upload',
    secure: true,
    sign_url: true,
    expires_at: expiresAt,
  });
}

// Compute the visible-books filter for a given user. Returns a
// Mongo filter object. Admins see everything; teachers see books
// for subjects in their teachingSpecialties; students see books
// for subjects in their `subjects` array, matching their curriculum.
async function visibilityFilterFor(user) {
  if (user.role === 'admin') {
    return { isActive: true };
  }
  if (user.role === 'teacher') {
    // Teacher's subjects are referenced by ObjectId in teachingSpecialties
    const specialties = user.teachingSpecialties || [];
    const subjectIds = [...new Set(
      specialties.map(s => String(s.subjectId)).filter(Boolean)
    )];
    if (subjectIds.length === 0) return { _id: { $exists: false } };  // no match
    return {
      isActive: true,
      subjectId: { $in: subjectIds },
    };
  }
  if (user.role === 'student') {
    // Student's subjects are stored as NAMES. Match against subjectName
    // and curriculum.
    const subjectNames = Array.isArray(user.subjects) ? user.subjects : [];
    if (subjectNames.length === 0) return { _id: { $exists: false } };
    const curriculum = typeof user.curriculum === 'string' ? user.curriculum : '';
    return {
      isActive: true,
      subjectName: { $in: subjectNames },
      ...(curriculum ? { curriculum } : {}),
    };
  }
  // Other roles (parent, demo) — restrictive by default
  return { _id: { $exists: false } };
}

// ═══════════════════════════════════════════════════════════
// POST /upload — Teacher uploads a new book
// multipart/form-data: file (PDF), plus body: subjectId, title,
// description?, author?, grades? (comma-separated)
// ═══════════════════════════════════════════════════════════
router.post('/upload', auth, requireRole('teacher', 'admin'), uploadBook.single('file'), async (req, res) => {
  try {
    if (!req.file) return fail(res, 400, 'No PDF file uploaded.');

    const { subjectId, title, description, author, grades } = req.body || {};

    if (!subjectId || !mongoose.isValidObjectId(subjectId)) {
      return fail(res, 400, 'Valid subjectId required.');
    }
    if (!title || !String(title).trim()) {
      return fail(res, 400, 'Title is required.');
    }

    const subject = await Subject.findById(subjectId).lean();
    if (!subject) return fail(res, 404, 'Subject not found.');

    // Parse grades — accept array OR comma-separated string OR empty
    let gradeArr = [];
    if (Array.isArray(grades)) {
      gradeArr = grades.map(g => String(g).trim()).filter(Boolean);
    } else if (typeof grades === 'string' && grades.trim()) {
      gradeArr = grades.split(',').map(g => g.trim()).filter(Boolean);
    }

    const uploaderName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();

    const book = await LibraryBook.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      author: author ? String(author).trim() : '',
      subjectId,
      subjectName: subject.subjectName,
      curriculum: subject.curriculum,
      grades: gradeArr,
      url: req.file.path,                  // CloudinaryStorage sets this to the secure URL
      publicId: req.file.filename,         // CloudinaryStorage sets this to the public_id
      resourceType: 'raw',
      sizeBytes: req.file.size || 0,
      uploadedBy: req.user._id,
      uploadedByName: uploaderName,
      isActive: true,
    });

    return ok(res, { book }, 'Book uploaded.');
  } catch (err) {
    console.error('[library upload]', err.message);
    // Cloudinary rejects files above the free-tier 10 MB raw limit
    // with a message containing "File size too large".
    const msg = err.message || '';
    if (msg.includes('File too large') || msg.includes('File size too large')) {
      return fail(res, 413,
        'File exceeds 10 MB limit. Please compress the PDF (most coursebooks ' +
        'compress to <10 MB with no visible quality loss), or upgrade the ' +
        'Cloudinary plan to enable larger uploads.');
    }
    return fail(res, 500, err.message || 'Upload failed.');
  }
});

// ═══════════════════════════════════════════════════════════
// GET / — List books visible to current user
// Query params (optional):
//   subjectId    — filter to one subject
//   curriculum   — filter to one curriculum
//   q            — search title/description (case-insensitive substring)
// ═══════════════════════════════════════════════════════════
router.get('/', auth, async (req, res) => {
  try {
    const filter = await visibilityFilterFor(req.user);

    if (req.query.subjectId && mongoose.isValidObjectId(req.query.subjectId)) {
      filter.subjectId = req.query.subjectId;
    }
    if (req.query.curriculum) {
      filter.curriculum = String(req.query.curriculum).trim();
    }
    if (req.query.q && String(req.query.q).trim()) {
      const term = String(req.query.q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { author: { $regex: term, $options: 'i' } },
      ];
    }

    const books = await LibraryBook.find(filter)
      .sort({ createdAt: -1 })
      .select('-publicId -url')   // don't leak raw delivery URL in list view
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
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid book id.');
    const book = await LibraryBook.findById(req.params.id)
      .select('-publicId -url')
      .lean();
    if (!book || !book.isActive) return fail(res, 404, 'Book not found.');

    // Visibility check
    const filter = await visibilityFilterFor(req.user);
    // Re-fetch with the visibility filter applied, to confirm access
    const allowed = await LibraryBook.exists({ _id: book._id, ...filter });
    if (!allowed) return fail(res, 403, 'You do not have access to this book.');

    return ok(res, { book }, 'Book.');
  } catch (err) {
    console.error('[library get]', err.message);
    return fail(res, 500, err.message || 'Get failed.');
  }
});

// ═══════════════════════════════════════════════════════════
// GET /:id/view-url — Signed, short-lived delivery URL for the viewer
// Returns { url, expiresAt } for the client to load into PDF.js.
// ═══════════════════════════════════════════════════════════
router.get('/:id/view-url', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid book id.');
    const book = await LibraryBook.findById(req.params.id).lean();
    if (!book || !book.isActive) return fail(res, 404, 'Book not found.');

    // Visibility check
    const filter = await visibilityFilterFor(req.user);
    const allowed = await LibraryBook.exists({ _id: book._id, ...filter });
    if (!allowed) return fail(res, 403, 'You do not have access to this book.');

    const expiresIn = 3600;  // 1 hour
    const url = signedDeliveryUrl(book.publicId, expiresIn);

    // Bump view counter (fire-and-forget; non-blocking)
    LibraryBook.updateOne({ _id: book._id }, { $inc: { viewCount: 1 } }).catch(() => {});

    return ok(res, {
      url,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    }, 'View URL.');
  } catch (err) {
    console.error('[library view-url]', err.message);
    return fail(res, 500, err.message || 'Failed to issue view URL.');
  }
});

// ═══════════════════════════════════════════════════════════
// PATCH /:id — Update metadata (uploader or admin)
// Editable: title, description, author, grades, isActive
// ═══════════════════════════════════════════════════════════
router.patch('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid book id.');
    const book = await LibraryBook.findById(req.params.id);
    if (!book) return fail(res, 404, 'Book not found.');

    const isOwner = String(book.uploadedBy) === String(req.user._id);
    if (req.user.role !== 'admin' && !isOwner) {
      return fail(res, 403, 'You can only edit books you uploaded.');
    }

    const { title, description, author, grades, isActive } = req.body || {};
    if (title !== undefined)       book.title = String(title).trim() || book.title;
    if (description !== undefined) book.description = String(description).trim();
    if (author !== undefined)      book.author = String(author).trim();
    if (grades !== undefined) {
      let arr = [];
      if (Array.isArray(grades)) arr = grades.map(g => String(g).trim()).filter(Boolean);
      else if (typeof grades === 'string') arr = grades.split(',').map(g => g.trim()).filter(Boolean);
      book.grades = arr;
    }
    if (isActive !== undefined)    book.isActive = !!isActive;

    await book.save();
    return ok(res, { book }, 'Book updated.');
  } catch (err) {
    console.error('[library patch]', err.message);
    return fail(res, 500, err.message || 'Update failed.');
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE /:id — Delete book + Cloudinary asset (uploader or admin)
// ═══════════════════════════════════════════════════════════
router.delete('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid book id.');
    const book = await LibraryBook.findById(req.params.id);
    if (!book) return fail(res, 404, 'Book not found.');

    const isOwner = String(book.uploadedBy) === String(req.user._id);
    if (req.user.role !== 'admin' && !isOwner) {
      return fail(res, 403, 'You can only delete books you uploaded.');
    }

    // Cleanup Cloudinary asset. Failure here is logged but doesn't
    // block the DB deletion — the book record in Mongo is the source
    // of truth for visibility, so removing it is the priority.
    if (book.publicId) {
      try {
        await cloudinary.uploader.destroy(book.publicId, { resource_type: 'raw' });
      } catch (e) {
        console.error('[library delete] cloudinary cleanup failed:', e.message);
      }
    }

    await book.deleteOne();
    return ok(res, { deleted: true }, 'Book deleted.');
  } catch (err) {
    console.error('[library delete]', err.message);
    return fail(res, 500, err.message || 'Delete failed.');
  }
});

module.exports = router;
