/**
 * SchoolClosure — days with no timetabled lessons: public holidays,
 * mid-term breaks, end-of-term holidays. Dates are calendar days in
 * Nairobi ("YYYY-MM-DD", inclusive). The timetable materializer creates
 * no lessons on these days and removes untouched ones already created.
 * Extra lessons a teacher books by hand are still allowed.
 */
const mongoose = require('mongoose')

const schoolClosureSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true, maxlength: 120 },
  start: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  end:   { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  kind:  { type: String, enum: ['holiday', 'half_term', 'term_break', 'other'], default: 'holiday' },
  note:  { type: String, default: '', maxlength: 500 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

schoolClosureSchema.index({ end: 1, start: 1 })

module.exports = mongoose.model('SchoolClosure', schoolClosureSchema)
