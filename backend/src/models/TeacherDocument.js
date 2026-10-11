/**
 * models/TeacherDocument.js
 * ============================================================
 * A document on a teacher's file, organised by category: the
 * personnel file (CV, certificates, ID, licence, police clearance,
 * contract...) and teaching documents (schemes of work, lesson
 * plans, records of work...). Categories live in constants/qa.js.
 * The file itself lives on R2; this is the metadata record.
 */
const mongoose = require('mongoose');
const { CATEGORY_KEYS } = require('../constants/qa');

const CATEGORIES = CATEGORY_KEYS;

const teacherDocumentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  category: { type: String, enum: CATEGORIES, required: true },

  title:       { type: String, required: true, trim: true, maxlength: 200 },
  subject:     { type: String, default: '', trim: true, maxlength: 120 },
  description: { type: String, default: '', trim: true, maxlength: 1000 },

  // Licences, police clearance, contracts and the like lapse; null =
  // does not expire.
  expiresAt: { type: Date, default: null },

  // QA has checked this copy against the original.
  verifiedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verifiedByName: { type: String, default: '' },
  verifiedAt:     { type: Date, default: null },

  // Who actually filed it. Normally the teacher themselves; QA and
  // other oversight staff can file a document into a teacher's file
  // (an observation report, a moderated record), and provenance must
  // stay visible.
  uploadedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  uploadedByName: { type: String, default: '' },

  file: {
    url:       { type: String, required: true },
    key:       { type: String, required: true },
    filename:  { type: String, required: true },
    mimeType:  { type: String, default: '' },
    sizeBytes: { type: Number, default: 0 },
  },
}, { timestamps: true });

teacherDocumentSchema.index({ teacherId: 1, category: 1, createdAt: -1 });

teacherDocumentSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('TeacherDocument', teacherDocumentSchema);
