/**
 * models/StudentPause.js
 * ============================================================
 * One record per pause session on a student account.
 * A pause suspends portal access for the student AND any
 * linked parent until Report Back (manual) or auto-expiry.
 *
 * The live enforcement flags are denormalised onto User
 * (onBreak, breakType, breakStart, breakEnd, breakNote) so the
 * auth middleware never needs an extra query for students.
 * This collection is the authoritative audit history.
 */
const mongoose = require('mongoose')

const PAUSE_TYPES = ['holiday', 'mid_term_break', 'end_term_break', 'summer_break', 'medical_leave', 'fee_hold', 'other']

const studentPauseSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:        { type: String, enum: PAUSE_TYPES, required: true },
  note:        { type: String, default: '' },

  // When true the student (and linked parent) cannot access the
  // portal at all. When false the pause is informational: the
  // student keeps full access (homework, personal studies) while
  // reminders and check-in are suspended. Defaults by type:
  // fee_hold blocks, holidays and breaks do not.
  blockAccess: { type: Boolean, default: false },

  startAt:     { type: Date, required: true, default: Date.now },
  expectedEnd: { type: Date, default: null },   // null = until further notice (e.g. fee_hold)

  status:      { type: String, enum: ['active', 'ended'], default: 'active', index: true },
  endedAt:     { type: Date, default: null },
  autoEnded:   { type: Boolean, default: false }, // true when the expiry cron lifted it

  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByRole: { type: String, default: '' },
  endedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

studentPauseSchema.index({ student: 1, status: 1 })
studentPauseSchema.index({ status: 1, expectedEnd: 1 })

module.exports = mongoose.model('StudentPause', studentPauseSchema)
module.exports.PAUSE_TYPES = PAUSE_TYPES
