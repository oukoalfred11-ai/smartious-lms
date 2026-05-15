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

  // ── Scheduling ──────────────────────────────────
  scheduledAt:  { type: Date, required: true },
  durationMins: { type: Number, required: true, min: 5, max: 240 },

  // ── Meeting link ────────────────────────────────
  meetingLink:  { type: String, required: true, trim: true },

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
