/**
 * models/LabSession.js — one student's attempt at one Virtual Lab experiment.
 * The action log is the source of truth: the server replays it with the
 * shared lab engine (shared/lab) to rebuild the experiment and to mark it.
 * The seed is generated on the server and fixes the hidden conditions
 * (unknown concentration, resistor value, tissue sample).
 */
const mongoose = require('mongoose');

const labSessionSchema = new mongoose.Schema({
  studentId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  studentName:       { type: String, default: '' },
  experimentId:      { type: String, required: true, index: true },
  experimentVersion: { type: Number, required: true },
  assignmentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'LabAssignment', default: null, index: true },
  attempt:           { type: Number, default: 1 },
  seed:              { type: String, required: true },
  options:           { type: mongoose.Schema.Types.Mixed, default: {} },

  actions:  { type: [mongoose.Schema.Types.Mixed], default: [] },
  notebook: { type: mongoose.Schema.Types.Mixed, default: {} },
  answers:  { type: mongoose.Schema.Types.Mixed, default: {} },
  revision: { type: Number, default: 0 },

  status: { type: String, enum: ['in_progress', 'submitted', 'returned', 'marked'], default: 'in_progress', index: true },
  submissionKey: { type: String, default: null },
  submittedAt:   { type: Date, default: null },
  autoGrade:     { type: mongoose.Schema.Types.Mixed, default: null },
  markedRows:    { type: mongoose.Schema.Types.Mixed, default: null },
  rubricMarks:   { type: mongoose.Schema.Types.Mixed, default: {} },
  score:         { type: Number, default: null },
  maxScore:      { type: Number, default: null },
  feedback:      { type: String, default: '' },
  markedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  markedByName:  { type: String, default: '' },
  markedAt:      { type: Date, default: null },
  returnedAt:    { type: Date, default: null },

  // Audit trail: saves are not logged individually (too many); lifecycle events are.
  history: [{ at: { type: Date, default: Date.now }, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, byName: String, event: String, note: String }],
}, { timestamps: true });

labSessionSchema.index({ studentId: 1, experimentId: 1, assignmentId: 1, attempt: 1 }, { unique: true });
labSessionSchema.index({ assignmentId: 1, status: 1 });

module.exports = mongoose.model('LabSession', labSessionSchema);
