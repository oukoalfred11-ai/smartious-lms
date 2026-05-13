const mongoose = require('mongoose');

const examSubmissionSchema = new mongoose.Schema({
  examId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // ── Answers ──
  // questionRef can be either a Question _id (string) for bank questions,
  // or a synthetic string like 'custom:0', 'custom:1' for custom questions.
  answers: [{
    questionRef:   { type: String, required: true },
    answerText:    String,
    selectedOption: String,
    isCorrect:     { type: Boolean, default: null }, // null = not yet graded
    marksAwarded:  { type: Number,  default: 0 },
    teacherComment: String,
  }],

  // ── Lifecycle ──
  status: {
    type: String,
    enum: ['in_progress','submitted','graded','returned'],
    default: 'in_progress',
    index: true,
  },

  // ── Timing ──
  startedAt:   { type: Date, default: Date.now },
  submittedAt: Date,
  gradedAt:    Date,
  timeSpentSecs: { type: Number, default: 0 },

  // ── Scoring ──
  totalScore:  { type: Number, default: 0 },
  maxScore:    { type: Number, default: 0 },
  percentage:  { type: Number, default: 0 },
  grade:       String,  // 'A*','A','B','C','D','E','U' or curriculum-specific
  feedback:    String,
  gradedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // ── Integrity flags ──
  tabSwitches: { type: Number, default: 0 },
  copyPasteAttempts: { type: Number, default: 0 },
  flagged: { type: Boolean, default: false },
  flagReason: String,

}, { timestamps: true });

// One submission per student per exam (enforced — students can't double-submit)
examSubmissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ExamSubmission', examSubmissionSchema);
