/**
 * ClassroomSession model
 * ============================================================
 * One record per (liveClassId, userId) for the native Smartious
 * Classroom. Written automatically by the signaling server as people
 * join and leave — no teacher action required.
 *
 * durationMs accumulates across reconnects (a student dropping and
 * rejoining keeps one record; joinCount tells you it happened).
 * firstJoinedAt vs the class's scheduledAt gives lateness.
 *
 * This is the per-lesson truth. The daily Attendance register is
 * derived from it (see realtime/classroom.js): when a student attends
 * a native class, a 'present' or 'late' record is upserted for that
 * day ONLY if no record exists yet — a teacher's manual mark is never
 * overwritten.
 */
const mongoose = require('mongoose');

const classroomSessionSchema = new mongoose.Schema({
  liveClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveClass',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Denormalised for fast attendance tables without populate.
  name: { type: String, default: '', trim: true },
  role: { type: String, default: 'student', trim: true },

  firstJoinedAt: { type: Date, default: null },
  lastLeftAt:    { type: Date, default: null },

  // Total connected time across all joins, in milliseconds.
  durationMs: { type: Number, default: 0, min: 0 },

  // How many times they connected (1 = stayed the whole time;
  // higher numbers usually mean network drops).
  // Teacher's register verdict. A session doc existing means the student
  // joined; present:false lets the teacher discount a token join, and a
  // doc created by a teacher with joinCount 0 records off-platform presence.
  present:  { type: Boolean, default: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  joinCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

classroomSessionSchema.index({ liveClassId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ClassroomSession', classroomSessionSchema);
