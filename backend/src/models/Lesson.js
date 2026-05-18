/**
 * Lesson model
 * ============================================================
 * One sub-topic / teaching unit within a Subject.
 * Owned by a teacher (so two teachers teaching the same subject
 * maintain their own lesson sets). The student-facing Lesson Player
 * will fetch lessons via the student's allocated teacher for each
 * subject.
 *
 * YouTube embed: we accept any of these watch URLs:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://youtube.com/watch?v=VIDEO_ID
 * The 11-char video ID is extracted and stored in videoEmbedId so the
 * student-facing player can build the embed URL via:
 *   https://www.youtube-nocookie.com/embed/{videoEmbedId}?rel=0&modestbranding=1
 *
 * Term structure: termIndex is 1, 2, or 3. Lessons within a subject
 * are ordered globally via `order` (auto-incremented on bulk import,
 * editable later).
 */

const mongoose = require('mongoose');

// Extract YouTube video ID from various URL shapes. Returns '' if no match.
const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return '';
  // Common YouTube ID regex
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return '';
};

const lessonSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  // teacherId — MODEL A: this is the ORIGINAL AUTHOR / createdBy only.
  // It is NOT an ownership or access-control field. Lessons belong to
  // the Subject; any teacher with that subject in their teachingSpecialties
  // can view and edit them. Kept here purely as an audit trail of who
  // first created the lesson, and to show a "Created by ..." label.
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,   // a lesson can outlive its author
    index: false,
  },

  // ── Curriculum context (denormalised for easier student-side query) ──
  curriculum: { type: String, required: true, trim: true },

  // ── Ordering & grouping ──
  order: { type: Number, default: 0, index: true },
  termIndex: { type: Number, enum: [1, 2, 3], default: 1, index: true },

  // ── Curriculum-spine link (ADDITIVE — optional) ──
  // Links this lesson to a SyllabusTopic + subtopic so the lesson
  // sits in the syllabus structure. Optional: existing lessons
  // leave these null and keep working exactly as before. New
  // lessons can be scaffolded from the spine.
  topicRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SyllabusTopic',
    default: null,
    index: true,
  },
  // The subtopic name within that topic (the subtopic is an
  // embedded doc, so we store its name for display/grouping).
  subtopicName: { type: String, trim: true, default: '' },

  // ── Content ──
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 2000 },

  notesPdfUrl:      { type: String, default: '' },
  notesPdfPublicId: { type: String, default: '' },

  videoUrl:     { type: String, default: '' },
  videoEmbedId: { type: String, default: '' },

  durationMins: { type: Number, default: 0, min: 0 },

  // ── Status ──
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true,
  },
}, { timestamps: true });

// Compound index: most common student query — published lessons for a subject
lessonSchema.index({ subjectId: 1, status: 1, order: 1 });
// Teacher / admin view: all lessons for a subject in display order
lessonSchema.index({ subjectId: 1, termIndex: 1, order: 1 });

// Auto-derive videoEmbedId from videoUrl on save
lessonSchema.pre('save', function (next) {
  if (this.isModified('videoUrl')) {
    this.videoEmbedId = extractYouTubeId(this.videoUrl || '');
  }
  next();
});

// Also handle findOneAndUpdate / updateOne — extract ID from incoming videoUrl
lessonSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  const flat = update.$set || update;
  if ('videoUrl' in flat) {
    flat.videoEmbedId = extractYouTubeId(flat.videoUrl || '');
    if (update.$set) update.$set = flat; else Object.assign(update, flat);
  }
  next();
});

module.exports = mongoose.model('Lesson', lessonSchema);
module.exports.extractYouTubeId = extractYouTubeId;
