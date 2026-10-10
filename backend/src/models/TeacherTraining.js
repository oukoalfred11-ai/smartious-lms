/**
 * TeacherTraining.js — Teacher Development Programme (TDP) record.
 * ============================================================
 * One document per training delivered to Smartious teachers:
 * what it was, who ran it, when, which teachers attended, with
 * photos and any files (programme, certificates) as evidence for
 * accreditation reviews (Cognia, Cambridge) in the QA portal.
 */
const mongoose = require('mongoose');

const teacherTrainingSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true, maxlength: 200 },
  provider:     { type: String, default: '', trim: true, maxlength: 200 },   // facilitator or organisation
  trainingDate: { type: Date, required: true },
  durationHours:{ type: Number, default: 0, min: 0, max: 500 },
  mode:         { type: String, enum: ['In person', 'Online', 'Blended'], default: 'In person' },
  description:  { type: String, default: '', trim: true, maxlength: 4000 },

  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  photos: [{
    url:     { type: String, required: true },
    key:     { type: String, default: '' },
    caption: { type: String, default: '', trim: true, maxlength: 200 },
  }],
  files: [{
    url:  { type: String, required: true },
    key:  { type: String, default: '' },
    name: { type: String, default: '', trim: true, maxlength: 200 },
  }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

teacherTrainingSchema.index({ trainingDate: -1 });

module.exports = mongoose.model('TeacherTraining', teacherTrainingSchema);
