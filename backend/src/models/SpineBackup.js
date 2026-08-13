const mongoose = require('mongoose');

/**
 * SpineBackup
 * ═══════════════════════════════════════════════════════════════
 * A snapshot of a subject's syllabus spine, taken immediately before
 * POST /api/syllabus/bulk replaces it.
 *
 * WHY
 * The bulk loader used to run `SyllabusTopic.deleteMany({ subjectId })`
 * with no copy kept. When a Physics scheme was loaded onto Cambridge
 * IGCSE Biology, the original 24-topic Biology spine was simply gone,
 * and 1,504 questions lost their lesson link. Recovery meant rebuilding
 * it by hand.
 *
 * Now every replacement writes one of these first, and a bad load is a
 * single restore call away.
 *
 * These are small — a spine is a few hundred short strings — so they are
 * kept indefinitely rather than expired. The history is also an audit
 * trail: who replaced what, when, and with which source.
 */
const spineBackupSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  // Denormalised so a backup stays readable even if the Subject is
  // later renamed, merged or deactivated.
  subjectName: { type: String, default: '' },
  curriculum:  { type: String, default: '' },

  // The full SyllabusTopic documents as they were, straight from find().lean().
  topics: { type: Array, default: [] },

  replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason:     { type: String, default: '' },

  // Set when this backup has been restored, so the history shows which
  // snapshot was rolled back to rather than just accumulating.
  restoredAt: { type: Date, default: null },
  restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

spineBackupSchema.index({ subjectId: 1, createdAt: -1 });

// Convenience counts for listing backups without shipping the whole payload.
spineBackupSchema.virtual('topicCount').get(function () {
  return (this.topics || []).length;
});
spineBackupSchema.virtual('lessonCount').get(function () {
  return (this.topics || []).reduce((n, t) => n + ((t.subtopics || []).length), 0);
});

module.exports = mongoose.models.SpineBackup
  || mongoose.model('SpineBackup', spineBackupSchema);
