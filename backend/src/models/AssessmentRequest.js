/**
 * AssessmentRequest model
 * ============================================================
 * One document per academic assessment request submitted via
 * the public AssessmentForm.jsx. Mirrors the `form` state shape
 * in that component field-for-field, plus admin-side workflow
 * fields appended at the bottom.
 *
 * Two-gate funnel: this record starts at 'awaiting_review' and
 * NO payment has been collected at creation time. Payment (via
 * Paystack) happens separately once admissions accepts the
 * request — that workflow is out of scope for this model, but
 * paystackInvoiceId is reserved here for when it's wired up.
 */

const mongoose = require('mongoose');

const assessmentRequestSchema = new mongoose.Schema({
  // ── Student ────────────────────────────────────────────────
  studentFirstName: { type: String, required: true, trim: true, maxlength: 100 },
  studentLastName:  { type: String, required: true, trim: true, maxlength: 100 },
  studentDOB:       { type: String, required: true },              // ISO date string from <input type="date">
  studentGrade:     { type: String, required: true, trim: true },
  currentSchool:    { type: String, default: '', trim: true },
  studentEmail:     { type: String, default: '', trim: true, lowercase: true },
  studentLanguages: { type: String, default: '', trim: true },
  learningNeeds:    { type: String, default: '', trim: true, maxlength: 2000 },

  // ── Parent 1 (primary contact) ───────────────────────────────
  parent1FirstName:    { type: String, required: true, trim: true, maxlength: 100 },
  parent1LastName:     { type: String, required: true, trim: true, maxlength: 100 },
  parent1Relationship: { type: String, required: true, trim: true },
  parent1Email:        { type: String, required: true, trim: true, lowercase: true },
  parent1Phone:        { type: String, required: true, trim: true },

  // ── Parent 2 (optional) ───────────────────────────────────────
  hasParent2:          { type: Boolean, default: false },
  parent2FirstName:    { type: String, default: '', trim: true },
  parent2LastName:     { type: String, default: '', trim: true },
  parent2Relationship: { type: String, default: '', trim: true },
  parent2Email:        { type: String, default: '', trim: true, lowercase: true },
  parent2Phone:        { type: String, default: '', trim: true },

  // ── Contact preferences ────────────────────────────────────
  preferredContact:     { type: String, required: true, trim: true },
  preferredContactTime: { type: String, default: '', trim: true },

  // ── Location ────────────────────────────────────────────────
  countryIso:    { type: String, required: true, trim: true, uppercase: true }, // ISO code or 'OTHER'
  stateProvince: { type: String, default: '', trim: true },
  city:          { type: String, required: true, trim: true },
  timezone:      { type: String, default: '', trim: true },

  // ── Academic ────────────────────────────────────────────────
  curriculumInterest: { type: [String], default: [] },
  targetUniversity:   { type: [String], default: [] },
  whyConsidering:      { type: [String], default: [] },
  preferredSchedule:  { type: String, default: '', trim: true },

  // ── Additional ──────────────────────────────────────────────
  howDidYouHear:  { type: String, default: '', trim: true },
  additionalInfo: { type: String, default: '', trim: true, maxlength: 3000 },

  // ── Fee acknowledgment ────────────────────────────────────
  feeAcknowledged: { type: Boolean, required: true },

  // ── Admin workflow fields ──────────────────────────────────
  status: {
    type: String,
    enum: ['awaiting_review', 'info_requested', 'accepted', 'declined'],
    default: 'awaiting_review',
    index: true,
  },
  requestRef: { type: String, required: true, unique: true, index: true }, // e.g. 'A-12847'

  reviewedAt:     { type: Date, default: null },
  reviewedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  internalNotes:  { type: String, default: '', trim: true, maxlength: 5000 },

  paystackInvoiceId: { type: String, default: '' }, // filled in later by the separate invoicing workflow

  // ── Submission metadata ────────────────────────────────────
  submittedIp:        { type: String, default: '' },
  submittedUserAgent: { type: String, default: '' },

}, { timestamps: true });

assessmentRequestSchema.index({ status: 1, createdAt: -1 });
assessmentRequestSchema.index({ parent1Email: 1 });
assessmentRequestSchema.index({ countryIso: 1 });

module.exports = mongoose.model('AssessmentRequest', assessmentRequestSchema);
