const mongoose = require('mongoose');

/**
 * GroupRoom model
 * ─────────────────────────────────────────────────────────
 * Represents a live-class room (Zoom-enabled) where a teacher
 * meets one or more students on a schedule.
 *
 * Source of truth for "teacher meets student in a live class" —
 * NOT for "who is this teacher's student." That's the Allocation
 * collection; the teacher portal's My Students view reads from
 * allocations directly (Path B as of 2026-05-20).
 */
const GroupRoomSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  // Free-text subject name; TODO future: convert to ObjectId ref:'Subject'
  subject:    { type: String, required: true },
  curriculum: { type: String },
  grade:      { type: String },
  capacity:   { type: Number, default: 10 },

  // Teacher refs the User collection (role='teacher'). NOT a separate
  // Teacher model — the standalone `teachers` collection is legacy/empty.
  teacher:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  schedule:   { type: String },
  status:     { type: String, enum: ['Active', 'Inactive'], default: 'Active' },

  // Flag for rooms auto-created by the allocations route (vs admin-built
  // rooms). Used by the reconciliation script to identify which rooms it
  // owns and may modify. Manual rooms should not have this flag.
  isAutoAllocation: { type: Boolean, default: false },

  // Zoom integration fields. Declared here so Mongoose persists them
  // (under strict mode, undeclared fields are silently dropped on write).
  zoomLink:      { type: String, default: '' },
  zoomStartedAt: { type: Date, default: null },
  zoomStartedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('GroupRoom', GroupRoomSchema);
