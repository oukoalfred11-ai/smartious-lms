const mongoose = require('mongoose');

/**
 * SyllabusTopic — the CURRICULUM SPINE.
 *
 * One document per TOPIC within a Subject (e.g. "Number" within
 * IGCSE Mathematics). Each topic embeds its ordered SUBTOPICS.
 * The tree is:
 *
 *   Subject  →  SyllabusTopic[]  →  subtopics[]
 *
 * Derived from a subject's official syllabus. Lessons and questions
 * reference this spine so the question bank, lesson setting and the
 * lesson player all draw from one organised, syllabus-accurate
 * source. This model is ADDITIVE — existing lessons and questions
 * are untouched and keep working; they simply GAIN the option to
 * link to the spine.
 */

// ── Embedded subtopic ──────────────────────────────────────
const subtopicSchema = new mongoose.Schema({
  // Display name of the subtopic, e.g. "Integers, HCF and LCM"
  name: { type: String, required: true, trim: true, maxlength: 240 },

  // Optional short code from the syllabus, e.g. "1.1"
  code: { type: String, trim: true, default: '' },

  // Order of this subtopic within its parent topic (0-based)
  subOrder: { type: Number, default: 0 },

  // How many lessons this subtopic is expected to need —
  // derived from the syllabus. Used as the DEFAULT lesson
  // count when a teacher sets lessons for this subtopic.
  suggestedLessons: { type: Number, default: 1, min: 0 },

  // Optional syllabus learning objectives for this subtopic.
  // Free-text lines lifted from the syllabus; useful as
  // default scaffolding for lessons and question coverage.
  objectives: { type: [String], default: [] },
}, { _id: true });

// ── Topic (one document) ───────────────────────────────────
const syllabusTopicSchema = new mongoose.Schema({
  // ── Links ──
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  // Denormalised for fast filtering without populating Subject
  curriculum:  { type: String, required: true, trim: true, index: true },
  subjectName: { type: String, required: true, trim: true },

  // ── Topic identity ──
  // Display name of the topic, e.g. "Number"
  topic: { type: String, required: true, trim: true, maxlength: 240 },

  // Optional short code from the syllabus, e.g. "1"
  code: { type: String, trim: true, default: '' },

  // Order of this topic within the subject (0-based)
  topicOrder: { type: Number, default: 0, index: true },

  // ── Subtopics ──
  subtopics: { type: [subtopicSchema], default: [] },

  // ── Provenance ──
  // Which syllabus this topic was derived from, for traceability.
  sourceSyllabus: { type: String, trim: true, default: '' },

  // Soft-disable a topic without deleting it
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ── Derived helpers ────────────────────────────────────────
// Total suggested lessons for the whole topic = sum of its
// subtopics' suggestedLessons.
syllabusTopicSchema.virtual('totalSuggestedLessons').get(function () {
  return (this.subtopics || []).reduce(
    (sum, s) => sum + (s.suggestedLessons || 0), 0
  );
});
syllabusTopicSchema.virtual('subtopicCount').get(function () {
  return (this.subtopics || []).length;
});
syllabusTopicSchema.set('toJSON',   { virtuals: true });
syllabusTopicSchema.set('toObject', { virtuals: true });

// ── Indexes ────────────────────────────────────────────────
// A subject's spine in display order
syllabusTopicSchema.index({ subjectId: 1, topicOrder: 1 });
// Prevent duplicate topic names within one subject
syllabusTopicSchema.index({ subjectId: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('SyllabusTopic', syllabusTopicSchema);
