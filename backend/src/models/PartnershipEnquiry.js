/**
 * models/PartnershipEnquiry.js — an enquiry from the public /partnerships
 * page: universities offering scholarships, examination centres, training
 * providers, co-curricular providers and the other PARTNERSHIP_TYPES.
 * `details` holds the answers to that type's own questions (the field
 * list is in frontend/src/data/careers.js), sanitised on the way in.
 */
const mongoose = require('mongoose')
const { PARTNERSHIP_TYPES, PARTNERSHIP_STATUSES, PARTNER_DOCS } = require('../constants/careers')

const by = {
  by:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, default: '' },
  role: { type: String, default: '' },
  at:   { type: Date, default: Date.now },
}

const partnershipEnquirySchema = new mongoose.Schema({
  ref:  { type: String, index: true },                   // SMP-2026-0007
  type: { type: String, enum: PARTNERSHIP_TYPES, required: true, index: true },
  organisation: { type: String, required: true, trim: true, maxlength: 160 },
  website:      { type: String, default: '', trim: true, maxlength: 300 },
  country:      { type: String, default: '', trim: true, maxlength: 80, index: true },
  city:         { type: String, default: '', trim: true, maxlength: 80 },
  contactName:  { type: String, required: true, trim: true, maxlength: 120 },
  contactRole:  { type: String, default: '', trim: true, maxlength: 120 },
  email:        { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  phone:        { type: String, default: '', trim: true, maxlength: 40 },
  details:      { type: mongoose.Schema.Types.Mixed, default: {} },
  message:      { type: String, default: '', trim: true, maxlength: 4000 },
  howHeard:     { type: String, default: '', trim: true, maxlength: 120 },
  // Proof the organisation is real: government registration, licence and
  // proof of operations (required), and any other supporting document.
  // Private R2 keys; staff open them through signed links.
  documents: [{ _id: false, category: { type: String, enum: PARTNER_DOCS }, key: String, filename: String, mimeType: String, sizeBytes: Number }],

  status: { type: String, enum: PARTNERSHIP_STATUSES, default: 'new', index: true },
  statusHistory: [{ status: String, note: { type: String, default: '' }, ...by }],
  assignedTo:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedToName: { type: String, default: '' },
  followUpOn: { type: Date, default: null, index: true },
  notes: [{ text: { type: String, maxlength: 2000 }, ...by }],
}, { timestamps: true })

partnershipEnquirySchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model('PartnershipEnquiry', partnershipEnquirySchema)
