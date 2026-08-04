/**
 * AssessmentRequest model
 * ============================================================
 * One document per academic assessment request submitted via
 * the public AssessmentForm.jsx.
 *
 * Status flow:
 *   awaiting_review → info_requested → awaiting_review (loop)
 *   awaiting_review → accepted       → payment_pending
 *                                    → payment_received
 *   awaiting_review → declined
 */

const mongoose = require('mongoose');

const assessmentRequestSchema = new mongoose.Schema({
  // ── Student ────────────────────────────────────────────────
  studentFirstName: { type: String, required: true, trim: true, maxlength: 100 },
  studentLastName:  { type: String, required: true, trim: true, maxlength: 100 },
  studentDOB:       { type: String, required: true },
  studentGrade:     { type: String, required: true, trim: true },
  currentSchool:    { type: String, default: '', trim: true },
  studentEmail:     { type: String, default: '', trim: true, lowercase: true },
  studentLanguages: { type: String, default: '', trim: true },
  learningNeeds:    { type: String, default: '', trim: true, maxlength: 2000 },

  // ── Parent 1 ───────────────────────────────────────────────
  parent1FirstName:    { type: String, required: true, trim: true, maxlength: 100 },
  parent1LastName:     { type: String, required: true, trim: true, maxlength: 100 },
  parent1Relationship: { type: String, required: true, trim: true },
  parent1Email:        { type: String, required: true, trim: true, lowercase: true },
  parent1Phone:        { type: String, required: true, trim: true },

  // ── Parent 2 (optional) ────────────────────────────────────
  hasParent2:          { type: Boolean, default: false },
  parent2FirstName:    { type: String, default: '', trim: true },
  parent2LastName:     { type: String, default: '', trim: true },
  parent2Relationship: { type: String, default: '', trim: true },
  parent2Email:        { type: String, default: '', trim: true, lowercase: true },
  parent2Phone:        { type: String, default: '', trim: true },

  // ── Contact preferences ─────────────────────────────────────
  preferredContact:     { type: String, required: true, trim: true },
  preferredContactTime: { type: String, default: '', trim: true },

  // ── Location ────────────────────────────────────────────────
  countryIso:    { type: String, required: true, trim: true, uppercase: true },
  stateProvince: { type: String, default: '', trim: true },
  city:          { type: String, required: true, trim: true },
  timezone:      { type: String, default: '', trim: true },

  // ── Academic ────────────────────────────────────────────────
  curriculumInterest: { type: [String], default: [] },
  targetUniversity:   { type: [String], default: [] },
  whyConsidering:     { type: [String], default: [] },
  preferredSchedule:  { type: String, default: '', trim: true },

  // ── Additional ──────────────────────────────────────────────
  howDidYouHear:  { type: String, default: '', trim: true },
  additionalInfo: { type: String, default: '', trim: true, maxlength: 3000 },
  feeAcknowledged: { type: Boolean, required: true },

  // ── Admin workflow ─────────────────────────────────────────
  status: {
    type: String,
    enum: [
      'awaiting_review',
      'info_requested',
      'accepted',
      'payment_pending',    // accepted + invoice sent, awaiting payment
      'payment_received',   // Paystack confirmed payment
      'declined',
    ],
    default: 'awaiting_review',
    index: true,
  },
  requestRef:  { type: String, required: true, unique: true, index: true },
  reviewedAt:  { type: Date, default: null },
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  internalNotes: { type: String, default: '', trim: true, maxlength: 5000 },

  // ── Paystack payment ───────────────────────────────────────
  paystackReference:    { type: String, default: '' }, // e.g. ASS-A12847-1234567890
  paystackAuthUrl:      { type: String, default: '' }, // the hosted payment page URL
  paystackAmountKobo:   { type: Number, default: 0  }, // amount in kobo (KES × 100)
  paystackData:         { type: mongoose.Schema.Types.Mixed, default: null },
  // Assessment fees are invoiced through the standard invoice system.
  invoiceId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
  invoiceNo:            { type: String, default: '' },
  invoiceSentAt:        { type: Date, default: null },
  paidAt:               { type: Date, default: null },

  // ── Submission metadata ─────────────────────────────────────
  submittedIp:        { type: String, default: '' },
  submittedUserAgent: { type: String, default: '' },

}, { timestamps: true });

assessmentRequestSchema.index({ status: 1, createdAt: -1 });
assessmentRequestSchema.index({ parent1Email: 1 });
assessmentRequestSchema.index({ paystackReference: 1 });

module.exports = mongoose.model('AssessmentRequest', assessmentRequestSchema);
