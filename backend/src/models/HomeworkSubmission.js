/**
 * HOMEWORK SUBMISSION MODEL
 * ============================================================
 * One submission per (homework, student) pair.
 * Created when student STARTS the homework (not necessarily submitted).
 * Status flow:
 *   in_progress → submitted → graded → released
 *
 * Each answer is keyed by questionIndex (matches Homework.questions[i]).
 * Answer formats vary by question type:
 *   - mcq:      answer = number (selected option index)
 *   - short:    answer = string
 *   - long:     answer = string
 *   - drawing:  answer = { dataUrl: 'data:image/png;base64,...' }
 *               OR { attachmentUrl: 'cloudinary url' } if we upload it
 *   - upload:   answer = { attachmentUrl, publicId, filename, mimeType }
 */
 
const mongoose = require('mongoose');
 
const submissionSchema = new mongoose.Schema({
  homework: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homework',
    required: true,
    index: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
 
  // ── Answers (one per homework question) ──
  answers: [{
    questionIndex: { type: Number, required: true },
    type: { type: String, enum: ['mcq', 'short', 'long', 'drawing', 'upload'], required: true },
    // For mcq: selected option index. For short/long: string. For drawing/upload: see attachment.
    answer: { type: mongoose.Schema.Types.Mixed, default: null },
    // For drawing/upload questions, the student's submitted attachment
    attachment: {
      url: String,
      publicId: String,
      filename: String,
      mimeType: String,
      sizeBytes: Number,
    },
    // Per-question grading
    marksAwarded: { type: Number, default: null },  // null = not graded yet
    feedback:     { type: String, default: '' },
    autoGraded:   { type: Boolean, default: false },
  }],
 
  // ── Status ──
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'graded', 'released'],
    default: 'in_progress',
  },
 
  // ── Timing ──
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: null },
  gradedAt: { type: Date, default: null },
  releasedAt: { type: Date, default: null },
  isLate: { type: Boolean, default: false },
 
  // ── Aggregate grading ──
  totalAwarded: { type: Number, default: 0 },
  totalPossible: { type: Number, default: 0 },
  overallFeedback: { type: String, default: '' },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });
 
// Unique: one submission per (homework, student)
submissionSchema.index({ homework: 1, student: 1 }, { unique: true });
 
module.exports = mongoose.model('HomeworkSubmission', submissionSchema);
 




























































































































































































































































































































