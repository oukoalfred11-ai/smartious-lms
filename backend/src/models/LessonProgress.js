/**
 * LessonProgress model
 * ============================================================
 * One record per (student, lesson) pair where the teacher has
 * marked the student as having mastered that lesson.
 *
 * Absence of a record = NOT mastered. We don't create "not mastered"
 * records; we only create records when marking complete. This keeps
 * the collection lean — only positive mastery events exist.
 *
 * Toggle behaviour:
 *   - Mark mastered: upsert {mastered: true, masteredAt: now, masteredBy: teacherId}
 *   - Unmark:        delete the record entirely
 *
 * Aggregation pattern for student progress pie:
 *   countDocuments({studentId, subjectId, mastered:true})
 *   / total published lessons for that subject
 */

const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
    index: true,
  },
  // Denormalised for aggregation queries (so we don't have to populate Lesson
  // to know which subject this belongs to).
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  mastered: {
    type: Boolean,
    default: true,
  },
  masteredAt: { type: Date, default: Date.now },
  masteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Optional teacher note saved alongside the mastery decision
  teacherNotes: { type: String, default: '' },
}, { timestamps: true });

// One progress record per (student, lesson). Updating an existing one is fine;
// double-marking is not.
lessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
// Aggregation: progress per (student, subject)
lessonProgressSchema.index({ studentId: 1, subjectId: 1 });

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
