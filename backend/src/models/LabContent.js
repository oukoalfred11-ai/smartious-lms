/**
 * models/LabContent.js — publication status of each Virtual Lab experiment.
 * draft → review → approved (a subject specialist checked the science) →
 * published (students can open it). Experiments have no record until an
 * admin or the Dean changes their status; the default is 'review'.
 */
const mongoose = require('mongoose');

const labContentSchema = new mongoose.Schema({
  experimentId: { type: String, required: true, unique: true },
  status:       { type: String, enum: ['draft', 'review', 'approved', 'published'], default: 'review' },
  reviewNote:   { type: String, default: '' },
  reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedByName: { type: String, default: '' },
  history: [{ at: { type: Date, default: Date.now }, byName: String, status: String, note: String }],
}, { timestamps: true });

module.exports = mongoose.model('LabContent', labContentSchema);
