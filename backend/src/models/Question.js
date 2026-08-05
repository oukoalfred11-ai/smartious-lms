/**
 * QUESTION MODEL — with Cambridge-style nested parts
 * ============================================================
 * A question in the question bank. Created by teachers, used in
 * homework and exams. Supports multiple question types and
 * Cloudinary-hosted image attachments.
 *
 * NESTED PARTS (added):
 *   A question can be FLAT (no parts) or NESTED (parts[] populated).
 *   Each part has its own type, text, marks, options, attachments,
 *   AND its own optional parts[] — recursively, any depth.
 *
 *   Numbering convention (Cambridge style):
 *     Top level: Q1, Q2, Q3 ...
 *     Depth 1:   (a), (b), (c) ...
 *     Depth 2:   (i), (ii), (iii) ...
 *     Depth 3:   (1), (2), (3) ...
 *     Depth 4:   (alpha), (beta), (gamma) ...
 *   Labels are auto-generated from array index on render — the
 *   schema doesn't store them explicitly, so re-ordering parts
 *   automatically re-letters them.
 *
 *   Marks rule: leaves carry the marks. Parent.marks is auto-
 *   computed as the sum of descendant leaf marks on save.
 *   Pre-existing flat questions keep marks at the root level
 *   (parts[] empty) and continue to work unchanged.
 *
 * Question types:
 *  - mcq: multiple choice (one correct answer)
 *  - short: short text answer (1-3 lines)
 *  - long: long-form / essay
 *  - drawing: student must draw/sketch
 *  - handwriting: student writes by hand
 *  - upload: student uploads an image of their work
 */

const mongoose = require('mongoose');

// ── Attachment subdocument (re-used inside parts) ───
const attachmentSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  publicId:  { type: String, required: true },
  filename:  { type: String, default: '' },
  mimeType:  { type: String, default: '' },
  sizeBytes: { type: Number, default: 0 },
}, { _id: false });

// ── Part subdocument (RECURSIVE) ────────────────────
// Mongoose handles recursion via lazy assignment below.
// A part has all the question-content fields PLUS its own
// `parts` array of the same shape.
const partSchema = new mongoose.Schema({
  // No label field — labels are derived from array index on render
  // so adding/removing/reordering parts auto-relabels them.
  type: {
    type: String,
    enum: ['mcq','short','long','drawing','handwriting','upload'],
    default: 'short',
  },
  text:          { type: String, default: '', trim: true },
  options:       { type: [String], default: [] },
  correctAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
  explanation:   { type: String, default: '', trim: true },
  // For a leaf part, marks is the marks awarded for THIS part.
  // For a parent part (with its own parts[]), marks auto-recomputes
  // as the sum of descendant leaf marks (see pre-save hook below).
  marks:         { type: Number, default: 1, min: 0 },
  attachments:   { type: [attachmentSchema], default: [] },
  // Recursive: parts can have their own parts
  parts:         { type: [], default: [] },  // schema assigned below
}, { _id: false });

// Wire up the recursion: parts inside a part use the same schema.
partSchema.add({ parts: { type: [partSchema], default: [] } });

// ── QUESTION schema ─────────────────────────────────
const questionSchema = new mongoose.Schema({
  // ── Categorization ───────────────────────────────
  curriculum: {
    type: String,
    enum: [
      // Canonical curriculum IDs
      'CambridgePrimary','CambridgeLowerSec','CambridgeIGCSE','CambridgeALevel',
      'EdexcelLowerSec','EdexcelIGCSE','EdexcelALevel',
      'AQALowerSec','AQAGCSE','AQAALevel',
      'IBPYP','IBMYP','IBDP',
      'KenyaCBC','BNC','American','Canadian',
      // Legacy values — keep for existing questions
      'IB','IGCSE','Edexcel','Cambridge',
    ],
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

  // ── Multi-class visibility ───────────────────────
  // A question is authored for one grade but may legitimately be set
  // to others. Kenya 8-4-4 is the driving case: Form 4 sits the whole
  // syllabus, so it must see Form 1-3 content without duplicating the
  // record. Empty means "visible to `grade` only".
  gradeLevels: { type: [String], default: [], index: true },

  // ── Provenance ───────────────────────────────────
  // Where the question came from, and what it maps to elsewhere, so a
  // teacher can pull equivalent material across curricula.
  sourceForm:      { type: String, default: '', trim: true },
  syllabus:        { type: String, default: '', trim: true },
  igcseEquivalent: { type: String, default: '', trim: true },
  // Figures extracted from a source document, stored as filenames.
  figures:         { type: [String], default: [] },
  // Set where the source supplied the question but no mark scheme.
  needsMarkScheme: { type: Boolean, default: false, index: true },
  topic: {
    type: String,
    trim: true,
    index: true,
    default: '',
  },

  // ── Curriculum-spine link (ADDITIVE — optional) ──
  // `subtopic` aligns the question to a SyllabusTopic subtopic;
  // `topicRef` links to the SyllabusTopic document. Both optional —
  // existing questions leave them empty and keep working. The
  // existing free-text `topic` field above is retained.
  // sha1 of (subject + questionText) — unique-sparse indexed so
  // duplicate detection stays O(1) at any collection size.
  // ── Mark scheme for typed / drawn answers ────────────
  // MCQs auto-mark against correctAnswer. Everything else needs a
  // mark scheme so it can be marked by a teacher, or assessed
  // automatically, without the marker having to know the subject.
  // ── ARTWORK REQUEST (additive, optional) ─────────────
  // Some questions need a diagram, graph or illustration that does
  // not exist yet. The question is authored with a written brief
  // describing exactly what is required; a teacher later produces
  // the image (by hand or with an AI generator) and uploads it.
  // Questions with artwork.required === false behave exactly as
  // before, so existing questions are unaffected.
  artwork: {
    required:    { type: Boolean, default: false, index: true },
    status:      { type: String, enum: ['pending', 'uploaded'], default: 'pending', index: true },
    // What kind of image is needed — drives grouping in the UI.
    kind:        { type: String, enum: ['diagram','graph','chart','illustration','photo','map','circuit','other'], default: 'diagram' },
    // Short label for lists, e.g. "Forces on an inclined plane".
    title:       { type: String, default: '', trim: true },
    // Full brief: what must be shown, labelled, and to what scale.
    // Written so a teacher can produce the image without having to
    // interpret the question themselves.
    description: { type: String, default: '' },
    // Ready-to-paste prompt for an AI image generator.
    aiPrompt:    { type: String, default: '' },
    // Constraints the image must satisfy (labels, units, style).
    requirements:{ type: [String], default: [] },
    // Set when a teacher uploads the artwork.
    uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    uploadedAt:  { type: Date, default: null },
  },

  markScheme: {
    // Full-credit model answer, shown to the marker and the student
    // after release.
    modelAnswer: { type: String, default: '' },
    // Each point a student can earn credit for.
    points: [{
      text:     { type: String, default: '' },   // what earns the mark
      marks:    { type: Number, default: 1 },
      keywords: [{ type: String }],              // any one of these = credit
    }],
    // Accepted alternative wordings for short answers, lower-cased.
    acceptableAnswers: [{ type: String }],
    // Common wrong answers worth flagging back to the student.
    commonErrors: [{ type: String }],
  },

  // ── Media ────────────────────────────────────────────
  // A diagram the student must read, label or interpret.
  imageUrl:     { type: String, default: '' },
  imageCaption: { type: String, default: '' },
  // Set when the student must upload or draw their own answer.
  requiresDrawing: { type: Boolean, default: false },

  contentHash: {
    type: String,
    default: null,
    // Index declared once at the foot of this file with unique+sparse.
  },
  lessonCode: {
    type: String,
    default: '',
    trim: true,
    index: true,
  },
  subtopic: {
    type: String,
    trim: true,
    index: true,
    default: '',
  },
  topicRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SyllabusTopic',
    default: null,
    index: true,
  },

  // ── Question content (flat or nested) ────────────
  // For a FLAT question: `type`, `questionText`, `options`,
  // `correctAnswer`, `marks` are the answer-bearing fields and
  // `parts` is empty.
  //
  // For a NESTED question: `questionText` is the STEM (background
  // context, no marks of its own), `parts[]` carries the actual
  // sub-questions. Top-level `type` becomes 'nested' as a tag,
  // and top-level `marks` auto-recomputes to the sum of leaf marks.
  type: {
    type: String,
    enum: ['mcq', 'short', 'long', 'essay', 'drawing', 'handwriting', 'upload', 'nested'],
    required: true,
    default: 'mcq',
  },
  questionText: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    default: [],
  },
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  explanation: {
    type: String,
    default: '',
    trim: true,
  },
  marks: {
    type: Number,
    default: 1,
    min: 0,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },

  // ── Nested parts (new) ──────────────────────────
  // Empty array = flat question (legacy behaviour unchanged).
  // Non-empty = nested question; top-level answer fields ignored.
  parts: {
    type: [partSchema],
    default: [],
  },

  // ── Attachments (Cloudinary URLs) ─────────────────
  attachments: [attachmentSchema],

  // ── Authorship ────────────────────────────────────
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
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

// ── Scale indexes (millions of questions) ────────────
// Lesson-level pool: the hot path for auto-homework and the quiz game.
questionSchema.index({ subject: 1, curriculum: 1, subtopic: 1, isActive: 1, difficulty: 1 });
// Topic-level fallback pool.
questionSchema.index({ subject: 1, curriculum: 1, topic: 1, isActive: 1, difficulty: 1 });
// Spine lesson code lookups and prior-lesson review sampling.
questionSchema.index({ subject: 1, curriculum: 1, lessonCode: 1, isActive: 1 });
// O(1) duplicate detection on import. Without this, every imported
// question triggers a collection scan on unindexed questionText.
questionSchema.index({ contentHash: 1 }, { unique: true, sparse: true });

// ── Helper: recursively sum leaf marks ──────────────
// A "leaf" is a part with no children (or an empty parts array).
// The recursive total is what the question is worth overall.
function sumLeafMarks(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return 0;
  let total = 0;
  for (const p of parts) {
    if (Array.isArray(p.parts) && p.parts.length > 0) {
      total += sumLeafMarks(p.parts);
    } else {
      total += Number(p.marks) || 0;
    }
  }
  return total;
}

// Pre-save hook: auto-compute parent marks from leaves.
// Runs on both Question and (via the recursive schema) part subdocs.
questionSchema.pre('save', function(next) {
  if (Array.isArray(this.parts) && this.parts.length > 0) {
    // This is a nested question — recompute total marks.
    this.marks = sumLeafMarks(this.parts);
    // Also recompute parent marks at every intermediate level.
    const fix = (parts) => {
      for (const p of parts) {
        if (Array.isArray(p.parts) && p.parts.length > 0) {
          fix(p.parts);
          p.marks = sumLeafMarks(p.parts);
        }
      }
    };
    fix(this.parts);
  }
  next();
});

// Expose sumLeafMarks for use in route handlers / other models
questionSchema.statics.sumLeafMarks = sumLeafMarks;

module.exports = mongoose.model('Question', questionSchema);
