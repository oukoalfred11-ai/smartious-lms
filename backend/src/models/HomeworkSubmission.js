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
 *
 * Per-answer fields:
 *   - marksAwarded     — number, null until graded
 *   - feedback         — teacher's per-question note
 *   - autoGraded       — true if MCQ auto-marked
 *   - teacherAnnotation — for drawing/upload: dataURL of teacher's marked-up
 *                         version of the student's image. Original (in
 *                         `attachment.url`) is preserved untouched.
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
    // Teacher's annotated version of the student's drawing/upload.
    // Stored as PNG dataURL so the original attachment is never overwritten.
    teacherAnnotation: { type: String, default: '' },

    // ── AI marking suggestion ──
    // A suggestion only. marksAwarded above stays null until a teacher
    // accepts or overrides it, so nothing here can reach a student.
    aiSuggestion: {
      marksAwarded:  { type: Number, default: null },
      feedback:      { type: String, default: '' },
      confidence:    { type: String, enum: ['high','medium','low',''], default: '' },
      // True when the question had no mark scheme and the model built
      // its own. Those marks deserve a closer look.
      schemeless:    { type: Boolean, default: false },
      assumedScheme: { type: String, default: '' },
      model:         { type: String, default: '' },
      markedAt:      { type: Date, default: null },
      // Set once a teacher has accepted or overridden it, so the same
      // answer is not counted twice in the learning figures.
      reviewed:      { type: Boolean, default: false },
      teacherAgreed: { type: Boolean, default: null },
    },
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
  // ── Homework cycle tracking ──
  // Warnings are keyed by homework + lesson occurrence so a scheduler
  // running every few minutes cannot send the same warning twice.
  lastWarningKey:    { type: String, default: '' },   // student, not yet submitted
  lastWarningAt:     { type: Date, default: null },
  lastBacklogKey:    { type: String, default: '' },   // teacher, not yet released
  teacherNotifiedAt: { type: Date, default: null },   // teacher, work arrived

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
