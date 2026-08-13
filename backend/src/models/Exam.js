const mongoose = require('mongoose');

// ── Attachment subdoc (mirrors Question.js) ─────────
const attachmentSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  publicId:  { type: String, required: true },
  filename:  { type: String, default: '' },
  mimeType:  { type: String, default: '' },
  sizeBytes: { type: Number, default: 0 },
}, { _id: false });

// ── Recursive part subdoc (mirrors Question.js) ─────
const customPartSchema = new mongoose.Schema({
  type:          { type: String, enum: ['mcq','short','long','drawing','handwriting','upload'], default: 'short' },
  text:          { type: String, default: '', trim: true },
  options:       { type: [String], default: [] },
  correctAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
  explanation:   { type: String, default: '', trim: true },
  marks:         { type: Number, default: 1, min: 0 },
  attachments:   { type: [attachmentSchema], default: [] },
  parts:         { type: [], default: [] },
}, { _id: false });
customPartSchema.add({ parts: { type: [customPartSchema], default: [] } });

// ── Embedded custom question (flat or nested) ───────
// Same shape as a Question document, minus filter fields.
const customQuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq','short','long','drawing','handwriting','upload','nested'],
    default: 'short',
  },
  questionText:  { type: String, required: true },
  options:       { type: [String], default: [] },
  correctAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
  marks:         { type: Number, default: 1, min: 0 },
  difficulty:    { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  topic:         { type: String, default: '' },
  attachments:   { type: [attachmentSchema], default: [] },
  parts:         { type: [customPartSchema], default: [] },
}, { _id: false });

// ── EXAM ASSIGNMENT ─────────────────────────────────
const examSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  instructions: { type: String, default: 'Answer ALL questions. Show full working.', trim: true },

  subject:    { type: String, required: true, trim: true },
  curriculum: { type: String, required: true, trim: true },
  grade:      { type: String, required: true, trim: true },

  // Component number within a subject's assessment set. Cambridge
  // subjects routinely run Paper 1 through 6 (multiple choice, theory,
  // practical, alternative-to-practical and so on), so a school setting
  // its own papers needs the same label on the cover.
  paperNumber:  { type: String, default: 'Paper 1', trim: true },
  // Optional plain-text syllabus reference printed on the cover, e.g.
  // "Prepared for Cambridge IGCSE Accounting 0452". Deliberately free
  // text and never an exam-board logo.
  syllabusRef:  { type: String, default: '', trim: true },

  startAt:      { type: Date,   required: true },
  durationMins: { type: Number, required: true, min: 5, max: 360 },

  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  questionIds:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  customQuestions: { type: [customQuestionSchema], default: [] },

  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  groupRoomIds:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'GroupRoom' }],

  status: {
    type: String,
    enum: ['scheduled','active','ended','archived'],
    default: 'scheduled',
    index: true,
  },

  totalMarks:     { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },

}, { timestamps: true });

// Helper: sum leaf marks of a nested parts array
function sumLeafMarks(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return 0;
  let total = 0;
  for (const p of parts) {
    if (Array.isArray(p.parts) && p.parts.length > 0) total += sumLeafMarks(p.parts);
    else total += Number(p.marks) || 0;
  }
  return total;
}

examSchema.virtual('computedStatus').get(function() {
  if (this.status === 'archived') return 'archived';
  const now = Date.now();
  const start = new Date(this.startAt).getTime();
  const end   = start + (this.durationMins || 0) * 60000;
  if (now < start)  return 'scheduled';
  if (now <= end)   return 'active';
  return 'ended';
});

examSchema.set('toJSON',   { virtuals: true });
examSchema.set('toObject', { virtuals: true });

examSchema.index({ assignedStudents: 1, startAt: -1 });
examSchema.index({ teacherId: 1, startAt: -1 });

// Expose for route use
examSchema.statics.sumLeafMarks = sumLeafMarks;

module.exports = mongoose.model('Exam', examSchema);
