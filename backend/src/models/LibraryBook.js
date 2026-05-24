/**
 * LibraryBook model
 * ============================================================
 * One document per uploaded coursebook PDF.
 *
 * Storage pattern: file lives on Cloudinary (raw resource);
 * Mongo holds the metadata + URL + publicId. Mirrors the
 * lesson-notes PDF flow exactly so behaviour is consistent
 * and cleanup is predictable.
 *
 * Visibility:
 *   - Teachers can upload to their subjects (controlled by route)
 *   - Students can view books for subjects in their enrollment
 *     (controlled by route)
 *
 * Designed around the "no download" requirement: clients should
 * fetch a signed, short-lived delivery URL via the route's
 * /:id/view endpoint, not the raw `url` field, so we can rotate
 * access if needed in future.
 */

const mongoose = require('mongoose');

const libraryBookSchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', trim: true, maxlength: 1000 },
  author: { type: String, default: '', trim: true, maxlength: 200 },

  // ── Scoping: which subject and (optional) grade(s) does this book serve ──
  // Storing both the Subject ref AND the denormalised names lets us:
  //   (a) Query by Subject._id for fast filtered list endpoints
  //   (b) Show the book's subject/curriculum/grade in the UI without
  //       a populate cascade
  //   (c) Survive a subject rename (the denormalised strings stay valid
  //       for display until next refresh)
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  subjectName: { type: String, required: true, trim: true },
  curriculum:  { type: String, required: true, trim: true, index: true },
  // Grades the book applies to. Optional; empty = all grades for that subject.
  // e.g. ['Year 10', 'Year 11'] for IGCSE Maths
  grades: [{ type: String, trim: true }],

  // ── Cloudinary file pointers ────────────────────
  // url           — public delivery URL (Cloudinary serves it CDN-backed)
  // publicId      — Cloudinary asset public_id; needed for deletion
  // resourceType  — Cloudinary resource type (always 'raw' for PDFs)
  // sizeBytes     — file size at upload time (for UI display)
  // pageCount     — optional, for UI display; populated only if upload
  //                 process extracts it (not currently extracted)
  url:          { type: String, required: true },
  publicId:     { type: String, required: true },
  resourceType: { type: String, default: 'raw' },
  sizeBytes:    { type: Number, default: 0 },
  pageCount:    { type: Number, default: null },

  // ── Audit ───────────────────────────────────────
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedByName: { type: String, default: '', trim: true },

  // ── Visibility flag ─────────────────────────────
  // Allows soft-hide (e.g. admin pulls a problematic book without
  // deleting it) per the same pattern as Subject.isActive.
  isActive: { type: Boolean, default: true, index: true },

  // ── Stats (lightweight; populated lazily) ───────
  viewCount: { type: Number, default: 0 },

}, { timestamps: true });

// Common queries
libraryBookSchema.index({ subjectId: 1, isActive: 1, createdAt: -1 });
libraryBookSchema.index({ curriculum: 1, isActive: 1 });

module.exports = mongoose.model('LibraryBook', libraryBookSchema);
