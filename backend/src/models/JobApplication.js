/**
 * models/JobApplication.js — an application from the public /careers page.
 *
 * Created as a draft when the applicant starts (so documents and the demo
 * lesson can upload straight to R2 under careers/<id>/), and submitted
 * once everything required is in. Staff in the Admin, Dean and QA portals
 * move it through the pipeline (status + statusHistory), review the demo
 * lesson against REVIEW_CRITERIA, and keep notes.
 *
 * Files are private: only the R2 key is stored, and staff open them
 * through short-lived signed links (routes/careers.js).
 */
const mongoose = require('mongoose')
const { POSITIONS, APPLICATION_STATUSES, REVIEW_CRITERIA } = require('../constants/careers')

const fileSchema = new mongoose.Schema({
  key:       { type: String, required: true },
  filename:  { type: String, default: '' },
  mimeType:  { type: String, default: '' },
  sizeBytes: { type: Number, default: 0 },
}, { _id: false })

const by = {
  by:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, default: '' },
  role: { type: String, default: '' },
  at:   { type: Date, default: Date.now },
}

const scoresShape = Object.fromEntries(REVIEW_CRITERIA.map(k => [k, { type: Number, min: 1, max: 5 }]))

const jobApplicationSchema = new mongoose.Schema({
  ref:       { type: String, index: true },          // SMA-2026-0042, shown to the applicant
  submitted: { type: Boolean, default: false, index: true },
  submittedAt: { type: Date, default: null, index: true },
  tokenHash: { type: String, select: false },        // the applicant's upload token (hashed)
  uploads:   { type: Number, default: 0 },           // upload links issued to the draft (capped)

  // Applicant
  firstName: { type: String, required: true, trim: true, maxlength: 80 },
  lastName:  { type: String, required: true, trim: true, maxlength: 80 },
  email:     { type: String, required: true, trim: true, lowercase: true, maxlength: 160, index: true },
  phone:     { type: String, default: '', trim: true, maxlength: 40 },
  country:   { type: String, default: '', trim: true, maxlength: 80, index: true },
  city:      { type: String, default: '', trim: true, maxlength: 80 },
  timezone:  { type: String, default: '', trim: true, maxlength: 60 },
  linkedin:  { type: String, default: '', trim: true, maxlength: 300 },

  // Role
  position:   { type: String, enum: POSITIONS, required: true, index: true },
  roleTitle:  { type: String, default: '', trim: true, maxlength: 120 },   // non-teaching: which role
  employment: { type: String, enum: ['full_time', 'part_time', 'either', ''], default: '' },
  hoursPerWeek: { type: Number, default: null, min: 0, max: 80 },
  availableFrom: { type: Date, default: null },
  expectedPay: { type: String, default: '', trim: true, maxlength: 120 },

  // Teaching
  curricula: [{ type: String, trim: true, maxlength: 80 }],
  subjects:  [{ type: String, trim: true, maxlength: 80 }],
  levels:    [{ type: String, trim: true, maxlength: 60 }],
  yearsExperience: { type: Number, default: null, min: 0, max: 60, index: true },
  yearsOnline:     { type: Number, default: null, min: 0, max: 60 },
  highestQualification: { type: String, default: '', trim: true, maxlength: 60 },
  teachingQualification: { type: String, default: '', trim: true, maxlength: 160 },   // PGCE, B.Ed, …
  registration: { type: String, default: '', trim: true, maxlength: 160 },            // TSC no., QTS, …
  examinerExperience: { type: String, default: '', trim: true, maxlength: 300 },
  setup: {
    internet: { type: String, default: '', maxlength: 60 },
    backupPower: { type: Boolean, default: false },
    headsetWebcam: { type: Boolean, default: false },
    pentablet: { type: Boolean, default: false },
  },
  coverLetter: { type: String, default: '', trim: true, maxlength: 6000 },
  howHeard:    { type: String, default: '', trim: true, maxlength: 120 },

  // Documents (same categories as the teacher portal's personnel file)
  documents: [{
    category: { type: String, required: true },
    file:     { type: fileSchema, default: null },
    pending:  { type: Boolean, default: false },      // "in progress" instead of a file
    note:     { type: String, default: '', maxlength: 300 },
  }],

  // Demo lesson: an uploaded recording, or a link (YouTube, Drive, Vimeo…)
  demoLesson: {
    file:     { type: fileSchema, default: null },
    url:      { type: String, default: '', trim: true, maxlength: 500 },
    subject:  { type: String, default: '', trim: true, maxlength: 80 },
    level:    { type: String, default: '', trim: true, maxlength: 60 },
    topic:    { type: String, default: '', trim: true, maxlength: 200 },
    minutes:  { type: Number, default: null, min: 0, max: 240 },
    notes:    { type: String, default: '', trim: true, maxlength: 1000 },
  },

  consents: {
    accurate:     { type: Boolean, default: false },
    safeguarding: { type: Boolean, default: false },
    data:         { type: Boolean, default: false },
  },

  // Pipeline
  status: { type: String, enum: APPLICATION_STATUSES, default: 'new', index: true },
  statusHistory: [{ status: String, note: { type: String, default: '' }, ...by }],
  assignedTo:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedToName: { type: String, default: '' },
  tags:  [{ type: String, trim: true, maxlength: 40 }],
  notes: [{ text: { type: String, maxlength: 2000 }, ...by }],
  reviews: [{ scores: scoresShape, recommendation: { type: String, enum: ['hire', 'maybe', 'no'], default: 'maybe' }, comment: { type: String, default: '', maxlength: 2000 }, ...by }],
  avgScore: { type: Number, default: null, index: true },   // mean of every review's mean, 1-5
  docsComplete: { type: Boolean, default: false, index: true },
  hasDemo:      { type: Boolean, default: false, index: true },
}, { timestamps: true })

jobApplicationSchema.index({ submitted: 1, status: 1, submittedAt: -1 })
jobApplicationSchema.index({ subjects: 1 })
jobApplicationSchema.index({ curricula: 1 })

module.exports = mongoose.model('JobApplication', jobApplicationSchema)
