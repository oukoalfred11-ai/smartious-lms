/**
 * models/LabAssignment.js — a teacher sets a Virtual Lab experiment for
 * students they teach, with a deadline and options (e.g. which acid).
 */
const mongoose = require('mongoose');

const labAssignmentSchema = new mongoose.Schema({
  experimentId: { type: String, required: true, index: true },
  title:        { type: String, required: true, trim: true, maxlength: 200 },
  instructions: { type: String, default: '', trim: true, maxlength: 4000 },
  options:      { type: mongoose.Schema.Types.Mixed, default: {} },
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  teacherName:  { type: String, default: '' },
  studentIds:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  dueAt:        { type: Date, default: null },
  status:       { type: String, enum: ['active', 'closed'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('LabAssignment', labAssignmentSchema);
