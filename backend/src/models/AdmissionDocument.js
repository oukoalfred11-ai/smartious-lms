/**
 * models/AdmissionDocument.js
 * ============================================================
 * A document on a student's admission file (signed agreement, ID,
 * photo, reports, proof of payment…), uploaded by the student or a
 * linked parent. Only admin and Dean & Operations can open and review
 * them. The file is private on R2: it is opened through a short-lived
 * signed link, never a public URL.
 */
const mongoose = require('mongoose');
const { ADMISSION_DOC_KEYS } = require('../constants/admissionDocs');

const admissionDocumentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category:  { type: String, enum: ADMISSION_DOC_KEYS, required: true },
  title:     { type: String, required: true, trim: true, maxlength: 200 },
  note:      { type: String, default: '', trim: true, maxlength: 1000 },   // from the family

  // Review: pending → verified, or rejected with a reason (upload a new copy).
  status:         { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
  reviewNote:     { type: String, default: '', trim: true, maxlength: 1000 },
  reviewedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedByName: { type: String, default: '' },
  reviewedAt:     { type: Date, default: null },

  uploadedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedByName: { type: String, default: '' },
  uploadedByRole: { type: String, default: '' },

  file: {
    key:       { type: String, required: true },
    filename:  { type: String, required: true },
    mimeType:  { type: String, default: '' },
    sizeBytes: { type: Number, default: 0 },
  },
}, { timestamps: true });

admissionDocumentSchema.index({ studentId: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('AdmissionDocument', admissionDocumentSchema);
