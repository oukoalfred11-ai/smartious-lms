/**
 * models/Inquiry.js
 * ============================================================
 * CRM inquiry record. One document per prospective family.
 * Tracks the full lifecycle from first contact to enrolment.
 */

const mongoose = require('mongoose')

// Embedded sub-document for each contact/interaction log entry
const noteSchema = new mongoose.Schema({
  date:          { type: Date, default: Date.now },
  type:          { type: String, enum: ['call','whatsapp','email','meeting','other'], default: 'call' },
  summary:       { type: String, required: true, trim: true, maxlength: 2000 },
  outcome:       { type: String, trim: true, maxlength: 500 },
  callbackDate:  { type: Date, default: null },   // when to follow up
  callbackDone:  { type: Boolean, default: false },
  recordedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true, timestamps: false })

const inquirySchema = new mongoose.Schema({
  // ── Contact info ────────────────────────────────────────
  parentName:   { type: String, required: true, trim: true, maxlength: 120 },
  parentPhone:  { type: String, trim: true },
  parentEmail:  { type: String, trim: true, lowercase: true },
  parentPhone2: { type: String, trim: true },   // secondary phone
  country:      { type: String, trim: true },
  city:         { type: String, trim: true },
  timezone:     { type: String, trim: true },

  // ── Student info ─────────────────────────────────────────
  studentName:  { type: String, trim: true },
  studentGrade: { type: String, trim: true },
  curriculum:   { type: String, trim: true },

  // ── Source & channel ─────────────────────────────────────
  source: {
    type: String,
    enum: ['whatsapp','phone','email','website','instagram','facebook','linkedin','tiktok','referral','walk_in','other'],
    default: 'other',
  },
  referredBy:   { type: String, trim: true },   // if source = referral
  campaignTag:  { type: String, trim: true },   // UTM / ad campaign label

  // ── Pipeline status ───────────────────────────────────────
  status: {
    type: String,
    enum: [
      'new',              // just received, not yet contacted
      'contacted',        // first contact made
      'interested',       // expressed genuine interest
      'proposal_sent',    // sent pricing / info pack
      'assessment_req',   // submitted or invited to book assessment
      'enrolled',         // converted to student
      'lost',             // chose another school
      'unqualified',      // not a fit (budget, location, etc.)
    ],
    default: 'new',
    index: true,
  },

  priority: {
    type: String,
    enum: ['low','medium','high'],
    default: 'medium',
  },

  // ── Next follow-up ────────────────────────────────────────
  nextCallbackDate: { type: Date, default: null, index: true },
  nextCallbackDone: { type: Boolean, default: false },

  // ── Notes / contact log ───────────────────────────────────
  notes: [noteSchema],

  // ── Conversion link ───────────────────────────────────────
  // Set when the inquiry converts to an assessment request or student
  assessmentRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentRequest', default: null },
  convertedStudentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // ── Admin fields ──────────────────────────────────────────
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // sales person
  tags:        [{ type: String, trim: true }],
  internalNote: { type: String, trim: true, maxlength: 2000 },

  // ── Metadata ──────────────────────────────────────────────
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true })

inquirySchema.index({ status: 1, createdAt: -1 })
inquirySchema.index({ parentEmail: 1 })
inquirySchema.index({ nextCallbackDate: 1, nextCallbackDone: 1 })
inquirySchema.index({ source: 1 })
inquirySchema.index({ assignedTo: 1 })

module.exports = mongoose.model('Inquiry', inquirySchema)
