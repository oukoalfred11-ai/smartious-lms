const mongoose = require('mongoose');

// ── EXAM ASSIGNMENT ───────────────────────────────────────
// A scheduled exam set by a teacher and assigned to specific students.
// Questions can be either references to the question bank OR embedded
// custom questions written directly into the exam (matching the way
// the teacher exam builder works in the UI today).
const examSchema = new mongoose.Schema({
  // ── Identity ──
  title:        { type: String, required: true, trim: true },
  instructions: { type: String, default: 'Answer ALL questions. Show full working.', trim: true },

  // ── Subject / curriculum context ──
  subject:    { type: String, required: true, trim: true },
  curriculum: { type: String, required: true, trim: true },
  grade:      { type: String, required: true, trim: true },  // e.g. 'Year 10', 'Grade 11'

  // ── Schedule ──
  startAt:      { type: Date,   required: true },
  durationMins: { type: Number, required: true, min: 5, max: 360 },

  // ── Authorship ──
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // ── Questions ──
  // questionIds: references to the question bank
  // customQuestions: embedded questions a teacher wrote without saving to bank
  // The frontend can mix the two; total marks = sum across both.
  questionIds:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  customQuestions: [{
    questionText:  { type: String, required: true },
    type:          { type: String, enum: ['mcq','short','long'], default: 'short' },
    options:       [String],
    correctAnswer: String,
    marks:         { type: Number, default: 1 },
    difficulty:    { type: String, enum: ['easy','medium','hard'], default: 'medium' },
    topic:         String,
  }],

  // ── Assignments ──
  // List of student IDs the exam was assigned to. A student sees an exam
  // only if their _id is in this list (or the exam was assigned to their
  // whole group room — see groupRoomIds).
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  groupRoomIds:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'GroupRoom' }],

  // ── Lifecycle ──
  // Status is derived from time, but cached here for fast filters.
  // Use the .computedStatus virtual to read the live status.
  status: {
    type: String,
    enum: ['scheduled','active','ended','archived'],
    default: 'scheduled',
    index: true,
  },

  // ── Aggregates (denormalised for fast list views) ──
  totalMarks:       { type: Number, default: 0 },
  totalQuestions:   { type: Number, default: 0 },

}, { timestamps: true });

// Virtual: live status based on time
examSchema.virtual('computedStatus').get(function() {
  if (this.status === 'archived') return 'archived';
  const now = Date.now();
  const start = new Date(this.startAt).getTime();
  const end   = start + (this.durationMins || 0) * 60000;
  if (now < start)  return 'scheduled';
  if (now <= end)   return 'active';
  return 'ended';
});

// Make virtuals serialise on toJSON
examSchema.set('toJSON',   { virtuals: true });
examSchema.set('toObject', { virtuals: true });

// Useful compound index for student list queries
examSchema.index({ assignedStudents: 1, startAt: -1 });
examSchema.index({ teacherId: 1, startAt: -1 });

module.exports = mongoose.model('Exam', examSchema);
