/**
 * StaffAttendance — the Dean's register for teachers: one mark per teacher
 * per school day (Nairobi calendar day, "YYYY-MM-DD"). Replaces the old
 * self check-in for staff.
 */
const mongoose = require('mongoose')

const STAFF_MARKS = ['present', 'late', 'half_day', 'absent', 'leave', 'off']

const staffAttendanceSchema = new mongoose.Schema({
  staffId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  day:      { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  status:   { type: String, enum: STAFF_MARKS, required: true },
  note:     { type: String, default: '', maxlength: 300 },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

staffAttendanceSchema.index({ staffId: 1, day: 1 }, { unique: true })
staffAttendanceSchema.index({ day: 1 })

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema)
module.exports.STAFF_MARKS = STAFF_MARKS
