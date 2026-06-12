/**
 * LibraryBook model
 * ============================================================
 * One document per uploaded coursebook PDF.
 *
 * Storage: file lives on Cloudflare R2 (S3-compatible object
 * storage). MongoDB holds metadata + the permanent public URL.
 * No file size limits. No egress fees (R2 + Cloudflare CDN).
 */

const mongoose = require('mongoose');

const libraryBookSchema = new mongoose.Schema({
  // ── Identity ──────────────────────────────────────────────
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', trim: true, maxlength: 1000 },
  author:      { type: String, default: '', trim: true, maxlength: 200 },

  // ── Subject scoping ───────────────────────────────────────
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  subjectName: { type: String, required: true, trim: true },
  curriculum:  { type: String, required: true, trim: true, index: true },
  grades:      [{ type: String, trim: true }],

  // ── R2 file pointers ──────────────────────────────────────
  // r2Key    — object key in the R2 bucket (used for deletion)
  // url      — permanent public URL via Cloudflare CDN
  // fileName — original filename shown in UI
  // sizeBytes — file size at upload time
  r2Key:     { type: String, required: true },
  url:       { type: String, required: true },
  fileName:  { type: String, required: true, trim: true },
  sizeBytes: { type: Number, default: 0 },
  mimeType:  { type: String, default: 'application/pdf' },

  // ── Audit ─────────────────────────────────────────────────
  uploadedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedByName: { type: String, default: '', trim: true },

  // ── Visibility ────────────────────────────────────────────
  isActive:  { type: Boolean, default: true, index: true },
  viewCount: { type: Number,  default: 0 },

}, { timestamps: true });

libraryBookSchema.index({ subjectId: 1, isActive: 1, createdAt: -1 });
libraryBookSchema.index({ curriculum: 1, isActive: 1 });

module.exports = mongoose.model('LibraryBook', libraryBookSchema);
