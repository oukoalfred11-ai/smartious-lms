/**
 * LIVE CLASS MODEL
 * ============================================================
 * A scheduled live class session. Created by a teacher, attended by
 * specifically-assigned students at a future scheduled time.
 *
 * Distinct from the GroupRoom model:
 *   - GroupRoom = an ongoing classroom (e.g. "Year 11 Maths Group A")
 *     with persistent membership and an associated Zoom link.
 *   - LiveClass = a single scheduled session at a specific date/time,
 *     with a specific topic and meeting URL.
 *
 * Lifecycle:
 *   scheduled → live → ended
 *   (teacher can also mark cancelled at any pre-live point)
 *
 * The computed status is derived from `scheduledAt`, `durationMins`, and
 * the explicit `status` field. Teachers can manually flip 'live' early
 * for technical issues.
 */

const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────
  title:        { type: String, required: true, trim: true },
  description:  { type: String, default: '', trim: true },

  // ── Academic context ────────────────────────────
  subject:      { type: String, required: true, trim: true },
  curriculum:   { type: String, required: true, trim: true },
  grade:        { type: String, required: true, trim: true },
  // Optional pointer to a Lesson when the Lesson model exists.
  // Used by the future "Prepare for lesson" button on the student card.
  preparationLessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null,
  },

  // ── Spine linkage (added 2026-05-22) ────────────────
  // When a teacher schedules a class, they can optionally pick a
  // topic + subtopic from the subject's loaded syllabus spine.
  // Both fields nullable; existing classes without spine linkage
  // continue to work unchanged. Denormalised strings (not refs)
  // because: (a) the spine sub-document _ids may change when a
  // spine is reloaded; (b) the names are what we display anyway;
  // (c) this avoids the complication of populating embedded
  // subdocuments. Reporting (% syllabus remaining) will match
  // on (subject, curriculum, grade, syllabusSubtopicName).
  syllabusTopicName:    { type: String, default: null, trim: true },
  syllabusSubtopicName: { type: String, default: null, trim: true },

  // ── Scheduling ──────────────────────────────────
  scheduledAt:  { type: Date, required: true },
  durationMins: { type: Number, required: true, min: 5, max: 240 },

  // ── Classroom mode ──────────────────────────────
  // 'link'   = external meeting link (Zoom/Meet) — the original flow.
  // 'native' = the built-in Smartious Classroom at /classroom/:id
  //            (WebRTC + shared whiteboard). No external link needed.
  classroomMode: {
    type: String,
    enum: ['link', 'native'],
    default: 'link',
  },

  // ── Meeting link ────────────────────────────────
  // Required only for link-mode classes; native classes leave it empty.
  meetingLink: {
    type: String,
    trim: true,
    default: '',
    required: function () { return this.classroomMode !== 'native'; },
  },

  // ── Delivery mode ───────────────────────────────
  // 'virtual' = online via meetingLink; 'physical' = in-person.
  // Defaults to virtual. Set per class.
  deliveryMode: {
    type: String,
    enum: ['virtual', 'physical'],
    default: 'virtual',
  },

  // Set when this class was auto-created by the timetable
  // roll-forward promotion (vs. manually scheduled).
  fromTimetable: { type: Boolean, default: false },

  // ── Ownership ───────────────────────────────────
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // ── Assigned students (one-by-one this phase) ───
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  }],

  // ── Recordings (native Smartious Classroom) ─────
  // Uploaded by the teacher's browser during/after the lesson.
  // url points at the public R2 object (WebM video).
  recordings: [{
    url:        { type: String, required: true },
    sizeBytes:  { type: Number, default: 0 },
    durationSec:{ type: Number, default: 0 },
    recordedAt: { type: Date, default: Date.now },
  }],

  // ── Lifecycle ───────────────────────────────────
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled',
  },
  startedAt:  Date,     // when teacher flipped status to live
  endedAt:    Date,     // when teacher flipped status to ended OR auto-ended
  cancelledAt: Date,
  cancelReason: String,

  // ── Resources / handouts (optional) ─────────────
  // Attachments shared before or during the class.
  attachments: [{
    url:       { type: String, required: true },
    publicId:  String,
    filename:  String,
    mimeType:  String,
    sizeBytes: Number,
  }],

  notes: { type: String, default: '', trim: true },

  // ── Auto-homework (set when the scheduled end time passes) ──
  autoHomeworkEnabled:     { type: Boolean, default: true },
  autoHomeworkGeneratedAt: { type: Date,    default: null, index: true },
  autoHomeworkNote:        { type: String,  default: '' },

}, { timestamps: true });

// Compound indexes for student/teacher dashboards
liveClassSchema.index({ assignedStudents: 1, scheduledAt: -1 });
liveClassSchema.index({ teacherId: 1, scheduledAt: -1 });

// Virtual: computed status — accounts for the actual date even if the
// `status` field hasn't been flipped yet.
liveClassSchema.virtual('computedStatus').get(function() {
  if (this.status === 'cancelled' || this.status === 'ended') return this.status;
  if (this.status === 'live') return 'live';
  const now = Date.now();
  const start = new Date(this.scheduledAt).getTime();
  const end   = start + (this.durationMins || 0) * 60000;
  if (now < start)  return 'scheduled';
  if (now <= end)   return 'live';
  return 'ended';
});

liveClassSchema.set('toJSON',   { virtuals: true });
liveClassSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LiveClass', liveClassSchema);
