/**
 * Accreditation.js — the school's accreditations and licenses.
 * ============================================================
 * One document per accreditation, license, membership or
 * registration the school holds, with its certificate files,
 * reference number and validity window. Shown well arranged in
 * the QA portal as the formal evidence wall.
 */
const mongoose = require('mongoose');

const accreditationSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true, maxlength: 200 },   // e.g. Cognia Accreditation
  body:  { type: String, default: '', trim: true, maxlength: 200 },      // issuing body
  type:  { type: String, enum: ['Accreditation', 'License', 'Membership', 'Registration', 'Other'], default: 'Accreditation' },
  certificateNumber: { type: String, default: '', trim: true, maxlength: 120 },
  issuedAt:  { type: Date, default: null },
  expiresAt: { type: Date, default: null },     // null = does not expire
  notes:     { type: String, default: '', trim: true, maxlength: 2000 },

  documents: [{
    url:  { type: String, required: true },
    key:  { type: String, default: '' },
    name: { type: String, default: '', trim: true, maxlength: 200 },
  }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

accreditationSchema.index({ type: 1, expiresAt: 1 });

module.exports = mongoose.model('Accreditation', accreditationSchema);
