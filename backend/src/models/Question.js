/**
 * QUESTION MODEL
 * ============================================================
 * A question in the question bank. Created by teachers, used in
 * homework and exams. Supports multiple question types and
 * Cloudinary-hosted image attachments.
 *
 * Question types:
 *  - mcq: multiple choice (one correct answer)
 *  - short: short text answer (1-3 lines)
 *  - long: long-form / essay
 *  - drawing: student must draw/sketch
 *  - upload: student uploads an image of their work
 *
 * Filtering: questions are filterable by curriculum, subject,
 * grade, topic. These are stored as strings to match the
 * Smartious curriculum catalog.
 */
 
const mongoose = require('mongoose');
 
const questionSchema = new mongoose.Schema({
  // ── Categorization ───────────────────────────────
  curriculum: {
    type: String,
    enum: ['IGCSE', 'Edexcel', 'Cambridge', 'IB', 'BNC', 'American', 'Canadian'],
    required: true,
    index: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  grade: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  topic: {
    type: String,
    trim: true,
    index: true,
    default: '',
  },
 
  // ── Question content ─────────────────────────────
  type: {
    type: String,
    enum: ['mcq', 'short', 'long', 'drawing', 'handwriting', 'upload'],
    required: true,
    default: 'mcq',
  },
  questionText: {
    type: String,
    required: true,
    trim: true,
  },
  // For MCQ: list of options. For others: empty.
  options: {
    type: [String],
    default: [],
  },
  // For MCQ: index (0-based) of the correct option in the options array.
  // For short/long: the model answer (text). For drawing/upload: empty.
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,  // can be Number (for MCQ index) or String
    default: null,
  },
  // Optional explanation shown to student after they answer (for self-study mode)
  explanation: {
    type: String,
    default: '',
    trim: true,
  },
  marks: {
    type: Number,
    default: 1,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
 
  // ── Attachments (Cloudinary URLs) ─────────────────
  // Each attachment: { url, publicId, filename, type }
  // publicId is needed for deletion via Cloudinary API.
  attachments: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    filename: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    sizeBytes: { type: Number, default: 0 },
  }],
 
  // ── Authorship ────────────────────────────────────
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // For audit / analytics
  usageCount: {
    type: Number,
    default: 0,
  },
 
  // ── Soft-delete / status ─────────────────────────
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });
 
// Compound index for fast filtering
questionSchema.index({ curriculum: 1, subject: 1, grade: 1, isActive: 1 });
 
module.exports = mongoose.model('Question', questionSchema);
 
