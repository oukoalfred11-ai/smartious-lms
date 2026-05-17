const mongoose = require('mongoose');

/**
 * FrontDeskSubmission
 * ============================================================
 * One record per submission from the public landing page —
 * consultation bookings, enrolment/registration enquiries, and
 * general contact messages. Stored so the admin Front Desk
 * module can work and analyse leads (rather than data dying in
 * an email inbox).
 *
 * `type` distinguishes the three landing-page forms:
 *   - 'consultation' : Book a Consultation form
 *   - 'registration' : enrolment wizard (rich data)
 *   - 'contact'      : general website contact message
 *
 * Most fields are optional — different forms capture different
 * things. `extra` holds anything form-specific not modelled here.
 */
const frontDeskSubmissionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['consultation', 'registration', 'contact'],
    required: true,
    index: true,
  },

  // ── Who is enquiring ──
  name:          { type: String, trim: true },
  email:         { type: String, trim: true, lowercase: true },
  phone:         { type: String, trim: true },
  relationship:  { type: String, trim: true },   // Parent / Guardian / Student / Other

  // ── The student ──
  studentFirstName: { type: String, trim: true },
  studentLastName:  { type: String, trim: true },
  studentDob:       { type: String, trim: true },
  currentSchool:    { type: String, trim: true },

  // ── What they want ──
  country:      { type: String, trim: true },   // country of residence — key for diaspora analysis
  programme:    { type: String, trim: true },   // Homeschool / Tuition / IUFP / etc.
  curriculum:   { type: String, trim: true },
  learningMode: { type: String, trim: true },   // online / in-person
  pathway:      { type: String, trim: true },
  destination:  { type: String, trim: true },   // study-abroad destination
  duration:     { type: String, trim: true },

  // ── Attribution & contact ──
  heardFrom:     { type: String, trim: true },   // marketing channel — most analysable field
  consultFormat: { type: String, trim: true },   // online / office / home visit
  address:       { type: String, trim: true },

  // ── Message ──
  subject: { type: String, trim: true },
  message: { type: String, trim: true },

  // ── Anything form-specific not modelled above ──
  extra: { type: mongoose.Schema.Types.Mixed, default: {} },

  // ── Lead workflow ──
  status: {
    type: String,
    enum: ['new', 'contacted', 'converted', 'closed'],
    default: 'new',
    index: true,
  },
  adminNotes: { type: String, trim: true, default: '' },

  // Light source metadata
  sourcePage: { type: String, trim: true },   // which page/section the form was on

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

frontDeskSubmissionSchema.index({ type: 1, status: 1, createdAt: -1 });

frontDeskSubmissionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('FrontDeskSubmission', frontDeskSubmissionSchema);
