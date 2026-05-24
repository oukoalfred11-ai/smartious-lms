/**
 * StudentSyllabusProgress model
 * ============================================================
 * Tracks which syllabus subtopics each student has completed for
 * each subject. One record per (studentId, subjectId, syllabusSubtopicName).
 *
 * Marked by teachers — either:
 *   (a) Manually via the per-student "Mark done" action on a live class card
 *   (b) Bulk via "End class" on a spine-linked live class (future)
 *   (c) Manually via a Syllabus Progress tab (future)
 *
 * Used by:
 *   - Teacher Portal: show which subtopics each student has covered
 *   - Student Portal (future): show "X% of syllabus remaining" per subject
 *
 * Matching key uses subtopic NAME (string), not subtopic _id (ObjectId).
 * Rationale:
 *   - When a teacher reloads a spine, subtopic _ids are regenerated;
 *     names are stable. Matching on name keeps progress records valid
 *     across spine reloads.
 *   - Trade-off: renaming a subtopic orphans its progress records.
 *     Acceptable because renames are rare; a small migration script
 *     can repair them if needed.
 */

const mongoose = require('mongoose');

const studentSyllabusProgressSchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },

  // ── Denormalised context (for fast student-side display
  // without populate cascades) ───────────────────────────
  curriculum:           { type: String, required: true, trim: true, index: true },
  syllabusTopicName:    { type: String, default: '', trim: true },
  syllabusSubtopicName: { type: String, required: true, trim: true },

  // ── Progress state ───────────────────────────────
  // Only 'Done' for now. Schema keeps room for future states
  // (e.g. 'InProgress', 'Revisit') without a migration.
  status: {
    type: String,
    enum: ['Done'],
    default: 'Done',
  },

  // ── Audit ────────────────────────────────────────
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  markedAt: { type: Date, default: Date.now },

  // Optional back-reference to the live class that produced this mark
  // (when marked via the live class "End class" flow). Null when marked
  // independently via a Syllabus Progress tab.
  linkedLiveClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveClass',
    default: null,
  },

  // Teacher's optional free-text note about how the lesson went
  notes: { type: String, default: '', trim: true, maxlength: 500 },

}, { timestamps: true });

// One record per (student, subject, subtopic). Re-marking should upsert,
// not duplicate.
studentSyllabusProgressSchema.index(
  { studentId: 1, subjectId: 1, syllabusSubtopicName: 1 },
  { unique: true }
);

// Common query: "all progress for student X in subject Y"
studentSyllabusProgressSchema.index({ studentId: 1, subjectId: 1 });

module.exports = mongoose.model('StudentSyllabusProgress', studentSyllabusProgressSchema);
