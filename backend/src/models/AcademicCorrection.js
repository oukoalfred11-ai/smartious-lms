/**
 * AcademicCorrection — the audit trail of the Dean's corrections: an
 * attendance mark changed, an exam mark or a teacher's comment edited, a
 * class teacher assigned. Never edited; one row per change.
 */
const mongoose = require('mongoose')

const academicCorrectionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind:      { type: String, enum: ['attendance', 'exam_mark', 'keyed_mark', 'report_comment', 'weekly_comment', 'class_teacher'], required: true },
  ref:       { type: String, default: '' },      // lesson, submission, mark or report id
  label:     { type: String, default: '' },      // e.g. "Biology · 12 Oct"
  before:    { type: String, default: '' },
  after:     { type: String, default: '' },
  note:      { type: String, default: '', maxlength: 300 },
  by:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  byName:    { type: String, default: '' },
}, { timestamps: true })

academicCorrectionSchema.index({ studentId: 1, createdAt: -1 })

module.exports = mongoose.model('AcademicCorrection', academicCorrectionSchema)
