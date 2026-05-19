const mongoose = require('mongoose');

/**
 * Timetable — a recurring weekly schedule for ONE student in ONE
 * subject. The teacher defines weekly slots (e.g. Mon 10:00,
 * Wed 10:00) and a start date; the system generates dated
 * SESSIONS upfront — one per lesson in the subject, in lesson
 * order — until the subject's lessons run out.
 *
 * AUTO-SYNC: when the subject's lesson count changes (a lesson is
 * added or deleted), every Timetable for that subject is
 * recomputed. Sessions already marked delivered are PRESERVED;
 * only future (pending) sessions are regenerated. See the
 * regeneration helper in routes/timetables.js.
 */

// ── A weekly slot — a day-of-week + time the class recurs ───
const slotSchema = new mongoose.Schema({
  // 0 = Sunday … 6 = Saturday  (JS getDay convention)
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  // 24h time "HH:MM", e.g. "10:00"
  time: { type: String, required: true, trim: true },
}, { _id: false });

// ── A generated, dated session — delivers one lesson ───────
const sessionSchema = new mongoose.Schema({
  // The calendar date/time of this session
  date: { type: Date, required: true },

  // Which weekly slot produced it (day + time), for display
  dayOfWeek: { type: Number, min: 0, max: 6 },
  time: { type: String, trim: true, default: '' },

  // The lesson this session delivers — sessions are generated in
  // lesson order, one session per lesson.
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
  lessonTitle: { type: String, trim: true, default: '' },
  // 1-based position in the subject's lesson sequence
  lessonNumber: { type: Number, default: 0 },

  // Delivery state. 'delivered' sessions are FROZEN — auto-sync
  // never recomputes them.
  status: {
    type: String,
    enum: ['pending', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { _id: true });

// ── The timetable ──────────────────────────────────────────
const timetableSchema = new mongoose.Schema({
  // ── Who & what ──
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  studentName: { type: String, trim: true, default: '' },

  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  subjectName: { type: String, trim: true, default: '' },
  curriculum:  { type: String, trim: true, default: '' },

  // The teacher who owns/created this timetable
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // ── Recurrence definition ──
  weeklySlots: { type: [slotSchema], default: [] },
  startDate:   { type: Date, required: true },

  // ── Generated calendar ──
  sessions: { type: [sessionSchema], default: [] },

  // Snapshot of the subject's lesson count at last generation —
  // lets auto-sync detect when a recompute is needed.
  lessonCountAtGen: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ── Derived helpers ────────────────────────────────────────
timetableSchema.virtual('sessionCount').get(function () {
  return (this.sessions || []).length;
});
timetableSchema.virtual('deliveredCount').get(function () {
  return (this.sessions || []).filter(s => s.status === 'delivered').length;
});
// The last dated session — i.e. when the course is projected to finish
timetableSchema.virtual('endDate').get(function () {
  const ss = this.sessions || [];
  return ss.length ? ss[ss.length - 1].date : null;
});
timetableSchema.set('toJSON',   { virtuals: true });
timetableSchema.set('toObject', { virtuals: true });

// ── Indexes ────────────────────────────────────────────────
// One active timetable per student+subject is the normal case
timetableSchema.index({ studentId: 1, subjectId: 1 });
// Auto-sync looks timetables up by subject
timetableSchema.index({ subjectId: 1, isActive: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
