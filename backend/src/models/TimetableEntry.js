/**
 * TimetableEntry model
 * ============================================================
 * A recurring weekly timetable slot for a subject/class.
 *
 * Concept:
 *   A timetable entry represents "Mathematics, every Monday
 *   09:00–10:00, for these students, with this teacher." It
 *   does NOT represent a single session — that's LiveClass.
 *
 *   Each TimetableEntry is the WEEKLY TEMPLATE. The actual
 *   sessions can be materialised as LiveClass documents when
 *   needed (with `fromTimetable: true`) — currently that's done
 *   on-the-fly on the student side, since the materialisation
 *   job hasn't been built yet.
 *
 * Why a separate model (not LiveClass with recurrence):
 *   - A timetable slot is a long-lived weekly thing; LiveClass
 *     is the per-instance occurrence with its own status/lifecycle
 *   - Cancelling one Monday class shouldn't cancel the slot
 *   - Subbing a different teacher for one week shouldn't change
 *     the slot's primary teacher
 *   - Visibility/scoping is simpler: students see entries where
 *     they're in `assignedStudents`; teachers see entries where
 *     they're the `teacherId`
 *
 * Audience scoping:
 *   - `assignedStudents`: explicit student User._id list
 *   - OR `audienceCurriculum + audienceGrade`: all students
 *     matching the grade/curriculum see it (admin "block timetable"
 *     pattern). Either OR both can be set.
 */

const mongoose = require('mongoose');

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const timetableEntrySchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },

  // ── Academic context ────────────────────────────
  subject:     { type: String, required: true, trim: true, index: true },
  curriculum:  { type: String, required: true, trim: true, index: true },
  grade:       { type: String, default: '', trim: true },
  // Optional Subject ref for catalog linkage
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    default: null,
    index: true,
  },

  // ── Weekly recurrence ───────────────────────────
  // dayOfWeek as 3-letter abbreviation for readability
  // startTime / endTime in 24h "HH:MM" — local time per
  // the school's timezone (Africa/Nairobi by default)
  dayOfWeek:   { type: String, enum: DAYS_OF_WEEK, required: true, index: true },
  startTime:   {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):[0-5]\d$/,   // "HH:MM"
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):[0-5]\d$/,
  },
  // School timezone (informational; the times above are wall-clock
  // local to this timezone). Defaults to Smartious's primary base.
  timezone: { type: String, default: 'Africa/Nairobi', trim: true },

  // ── Term window (optional) ──────────────────────
  // When set, the slot is only active between these dates
  // (e.g. Term 1: Jan-Apr). If null, the slot is open-ended.
  effectiveFrom: { type: Date, default: null },
  effectiveTo:   { type: Date, default: null },

  // ── Delivery mode + link ────────────────────────
  // 'virtual' uses meetingLink, 'physical' uses location
  deliveryMode: {
    type: String,
    enum: ['virtual', 'physical'],
    default: 'virtual',
  },
  meetingLink: { type: String, default: '', trim: true },
  location:    { type: String, default: '', trim: true },

  // ── Ownership ───────────────────────────────────
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // ── Audience scoping ────────────────────────────
  // Either explicit students OR broadcast by grade. At
  // least one must be set; the visibility filter in the
  // route OR's them together.
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  }],
  audienceCurriculum: { type: String, default: '', trim: true },
  audienceGrade:      { type: String, default: '', trim: true },

  // ── State ───────────────────────────────────────
  // Whether this slot is open to receive more students via grouping
  canBeGrouped: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true, index: true },

  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

}, { timestamps: true });

// Compound indexes for the common queries
timetableEntrySchema.index({ dayOfWeek: 1, startTime: 1 });
timetableEntrySchema.index({ assignedStudents: 1, isActive: 1, dayOfWeek: 1 });
timetableEntrySchema.index({ teacherId: 1, isActive: 1, dayOfWeek: 1 });

// Helper: returns a numeric day index (1..7, Mon=1) for sorting
timetableEntrySchema.virtual('dayIndex').get(function() {
  return DAYS_OF_WEEK.indexOf(this.dayOfWeek) + 1;
});

// Convert HH:MM to minutes since midnight, for cross-row sorting
timetableEntrySchema.virtual('startMinutes').get(function() {
  if (!this.startTime) return 0;
  const [h, m] = this.startTime.split(':').map(Number);
  return h * 60 + m;
});

// Validate that endTime > startTime when set
timetableEntrySchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    const [sh, sm] = this.startTime.split(':').map(Number);
    const [eh, em] = this.endTime.split(':').map(Number);
    const start = sh * 60 + sm;
    const end   = eh * 60 + em;
    if (end <= start) return next(new Error('endTime must be after startTime.'));
  }
  // Require some audience
  const hasStudents = Array.isArray(this.assignedStudents) && this.assignedStudents.length > 0;
  const hasBroadcast = !!(this.audienceCurriculum && this.audienceGrade);
  if (!hasStudents && !hasBroadcast) {
    return next(new Error('A timetable entry must target at least one student, or a curriculum+grade audience.'));
  }
  next();
});

timetableEntrySchema.set('toJSON',   { virtuals: true });
timetableEntrySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TimetableEntry', timetableEntrySchema);
