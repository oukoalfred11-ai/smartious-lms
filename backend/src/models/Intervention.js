/**
 * Intervention.js — what was DONE about a flag, and did it work.
 *
 * The early-warning system detects; this register closes the loop:
 * every flagged student gets a logged action with an owner and a review
 * date, and at review the outcome is recorded against the metric that
 * triggered it. This is standard MTSS practice and the exact evidence
 * accreditation visitors ask for.
 */
const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  flag: { type: String, required: true },        // ATTEND / EXAM / QUIZ_DECLINE / HW_SILENT / INACTIVE / other
  action: { type: String, required: true },      // what we are doing about it
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who drives it
  dueDate: { type: Date, required: true },       // when we check whether it worked
  status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  outcome: { type: String, enum: ['improved', 'no_change', 'worse', null], default: null },
  outcomeNote: { type: String, default: '' },
  metricAtStart: { type: String, default: '' },  // e.g. 'attendance 58%' — the baseline
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  closedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Intervention', interventionSchema);
