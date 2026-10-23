/**
 * models/MarkEntry.js — a mark keyed in by the Dean (or admin) for one
 * student in one subject: a weekly test or an end-of-term exam that was
 * sat on paper, typically by a centre (In-person) student. Term reports
 * use these alongside marks from online exams (lib/reportScores.js).
 */
const mongoose = require('mongoose')

const markEntrySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject:   { type: String, required: true, trim: true, maxlength: 80 },
  kind:      { type: String, enum: ['weekly', 'endterm'], default: 'weekly' },
  label:     { type: String, trim: true, maxlength: 80, default: '' },   // e.g. "Week 3 test"
  date:      { type: Date, required: true },
  score:     { type: Number, required: true, min: 0 },
  outOf:     { type: Number, required: true, min: 1, default: 100 },
  note:      { type: String, trim: true, maxlength: 300, default: '' },
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

markEntrySchema.index({ studentId: 1, date: 1 })

module.exports = mongoose.model('MarkEntry', markEntrySchema)
