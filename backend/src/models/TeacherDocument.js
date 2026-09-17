/**
 * models/TeacherDocument.js
 * ============================================================
 * A document a teacher keeps on file in their portal, organised
 * by category: schemes of work, lesson plans, records of work,
 * assessment records, teaching resources, reports and other.
 * The file itself lives on R2; this is the metadata record.
 */
const mongoose = require('mongoose');

const CATEGORIES = [
  'scheme_of_work',
  'lesson_plan',
  'record_of_work',
  'assessment_record',
  'teaching_resource',
  'report',
  'other',
];

const teacherDocumentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  category: { type: String, enum: CATEGORIES, required: true },

  title:       { type: String, required: true, trim: true, maxlength: 200 },
  subject:     { type: String, default: '', trim: true, maxlength: 120 },
  description: { type: String, default: '', trim: true, maxlength: 1000 },

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
