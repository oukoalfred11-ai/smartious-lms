/**
 * Attendance model
 * ============================================================
 * Daily attendance records, one per (studentId, date).
 *
 * Marked by teachers (or admins). Status options:
 *   - 'present'      — full school day
 *   - 'absent'       — missed the whole day (reason required)
 *   - 'half_day'     — present for part of the day
 *
 * Cross-teacher visibility: any teacher/admin can read or mark.
 * No per-teacher scoping. If multiple teachers mark the same day,
 * the most recent mark wins (upsert).
 *
 * Date is stored at UTC midnight of the school day. The UI can
 * normalise display to school timezone.
 */

const mongoose = require('mongoose');

const ATTENDANCE_STATUS = ['present', 'absent', 'half_day', 'late'];

const attendanceSchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Day of attendance, normalised to UTC midnight (00:00:00.000Z).
  // Indexed for date-range queries (e.g. "show this week").
  date: {
    type: Date,
    required: true,
    index: true,
  },

  // ── State ───────────────────────────────────────
  status: {
    type: String,
    enum: ATTENDANCE_STATUS,
    required: true,
  },
  // Required only when status is 'absent'. Free text from teacher.
  reason: {
    type: String,
    default: '',
    trim: true,
    maxlength: 500,
  },

  // ── Audit ───────────────────────────────────────
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // ── Self check-in fields ──────────────────────────
  checkedIn:     { type: Boolean, default: false },
  checkInStatus: { type: String, enum:['present','absent','late',''], default:'' },
  lateTime:      { type: String, default: '' },
  checkInTime:   { type: Date,   default: null },

  markedAt: {
    type: Date,
    default: Date.now,
  },
  // Optional context: which curriculum the student was on when marked.
  // Denormalised for fast reporting without populate.
  curriculum: {
    type: String,
    default: '',
    trim: true,
  },

}, { timestamps: true });

// One record per (student, date). Re-marking should upsert, not duplicate.
attendanceSchema.index(
  { studentId: 1, date: 1 },
  { unique: true }
);

// Common range query: "all attendance for student X between dates"
attendanceSchema.index({ studentId: 1, date: -1 });

// Helper: validate that reason is present when status is 'absent'
attendanceSchema.pre('validate', function(next) {
  if (this.status === 'absent' && (!this.reason || !this.reason.trim())) {
    return next(new Error('Reason is required when status is absent.'));
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
Attendance.STATUS_VALUES = ATTENDANCE_STATUS;
module.exports = Attendance;
