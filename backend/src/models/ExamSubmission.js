const mongoose = require('mongoose');

/**
 * EXAM SUBMISSION
 * ============================================================
 * A student's answers to an exam, plus grading state.
 *
 * Answer addressing — supports both flat and nested questions:
 *
 *   FLAT question:
 *     questionRef = '<questionId>'    // bank reference, e.g. '6a04...'
 *                 | 'custom:0'         // 0-based index into exam.customQuestions
 *     partPath    = []                 // empty = top-level answer
 *
 *   NESTED question — answer to part (b)(ii):
 *     questionRef = '<questionId>' OR 'custom:N'
 *     partPath    = [1, 1]             // 0-based: parts[1] = 'b', then parts[1] = 'ii'
 *
 *   So one nested question generates multiple answer rows in the
 *   answers[] array — one per leaf part the student attempted.
 *
 *   This lets the teacher mark each leaf independently and lets
 *   the student answer at any depth without schema gymnastics.
 */

const answerSchema = new mongoose.Schema({
  // Reference to the parent question — either a Question._id OR
  // 'custom:N' for an embedded custom question in the exam.
  questionRef: { type: String, required: true },

  // Path to the specific leaf part being answered. Empty array
  // means the answer is for a FLAT question (no parts).
  // For nested: array of zero-based indices, e.g. [1, 0] = part (b)(i).
  partPath: { type: [Number], default: [] },

  // The answer itself
  answerText:     { type: String, default: '' },
  selectedOption: { type: String, default: '' },

  // Grading (always pending until teacher reviews — no auto-grade)
  isCorrect:      { type: Boolean, default: null },
  marksAwarded:   { type: Number,  default: 0 },
  teacherComment: { type: String,  default: '' },

  // For drawing/handwriting/upload answers: the teacher's marked-up
  // version of the student's image, as a PNG dataURL. Stored separately
  // from answerText so the student's original is never overwritten.
  // Up to ~5 MB per dataURL — MongoDB doc limit is 16 MB so a typical
  // exam (10 questions × ~300 KB annotated PNG = 3 MB) fits comfortably.
  teacherAnnotation: { type: String, default: '' },
}, { _id: false });

const examSubmissionSchema = new mongoose.Schema({
  examId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  answers: { type: [answerSchema], default: [] },

  status: {
    type: String,
    enum: ['in_progress','submitted','graded','returned'],
    default: 'in_progress',
    index: true,
  },

  startedAt:     { type: Date, default: Date.now },
  submittedAt:   Date,
  gradedAt:      Date,
  timeSpentSecs: { type: Number, default: 0 },

  totalScore:  { type: Number, default: 0 },
  maxScore:    { type: Number, default: 0 },
  percentage:  { type: Number, default: 0 },
  grade:       String,
  feedback:    String,
  gradedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  tabSwitches:       { type: Number, default: 0 },
  copyPasteAttempts: { type: Number, default: 0 },
  flagged:           { type: Boolean, default: false },
  flagReason:        String,

}, { timestamps: true });

// One submission per student per exam
examSubmissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ExamSubmission', examSubmissionSchema);
