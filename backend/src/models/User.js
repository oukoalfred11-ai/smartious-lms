const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','accountant','sales','ops_manager','dos','teacher','student','parent','demo'], default: 'student' },
  grade: String,

  // ── PROGRAMME ENROLMENT (students) ──
  // Which Smartious programme the student is enrolled in.
  //   Academic programmes  — Homeschool, Tuition, IUFP — have a
  //     curriculum + subjects + teacher allocations + lessons.
  //   Advisory programmes  — Study Abroad, Pre-University — are
  //     advisory services with no curriculum/subjects/teaching.
  programme: {
    type: String,
    enum: ['Homeschool', 'Tuition', 'IUFP', 'Study Abroad', 'Pre-University'],
  },
  // Delivery mode for the programme.
  deliveryMode: {
    type: String,
    enum: ['Virtual', 'In-person'],
  },

  // Student enrollment fields (only relevant when role === 'student')
  // - curriculum: string for students (one curriculum), array for teachers (multi-curriculum)
  // - gradeLevel: student's current grade/year (e.g., 'Year 10', 'Grade 11')
  // - subjects: list of subject NAMES the student is enrolled in (string array)
  // - studentSubjects: same as subjects, kept for clarity (legacy alias)
  curriculum: {
    type: mongoose.Schema.Types.Mixed,  // string OR array depending on role
    default: ''
  },
  gradeLevel: {
    type: String,
    default: null,
  },
  // Student subjects (strings, e.g. "Mathematics", "Physics")
  subjects: {
    type: [String],
    default: [],
  },
  // Teacher subject ObjectId references (used by Allocation/Subject system)
  // Renamed from old `subjects` field to avoid collision
  subjectRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  // ── Password reset ───────────────────────────────────────
  avatar: { type: String, default: '' },   // profile photo URL (R2 or base64)
  // 2FA — email OTP for password change verification
  otpCode:      { type: String,  default: undefined },
  otpExpires:   { type: Date,    default: undefined },
  otpVerified:  { type: Boolean, default: false },

  passwordResetToken:   { type: String, default: undefined },
  passwordResetExpires: { type: Date,   default: undefined },

  // ── Teacher weekly availability ──────────────────────────
  // Array of time windows the teacher is available to teach.
  // Used to auto-generate timetable entries on student enrollment.
  // Each slot: { dayOfWeek: 'Mon', startTime: '09:00', endTime: '10:00' }
  availability: [{
    dayOfWeek:  { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], required: true },
    startTime:  { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    endTime:    { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    _id: false,
  }],

  // PHASE 3-5 REFACTOR: Teacher teaching specialties (multi-curriculum support)
  teachingSpecialties: [{
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    curriculum: { type: String, enum: [
      // New 15-curriculum catalog
      'CambridgePrimary', 'CambridgeLowerSec', 'CambridgeIGCSE', 'CambridgeALevel',
      'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel',
      'AQALowerSec', 'AQAGCSE', 'AQAALevel',
      'IB', 'BNC', 'American', 'Canadian', 'KenyaCBC',
      // Legacy values (backwards-compat for existing records — not used for new writes)
      'IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'IUFP',
    ] }
  }],
  phone: String,
  bio: String,
  avatar: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  linkedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For parents: students they manage
  linkedParents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For students: parents managing them

  // ── TEACHER PROFILE FIELDS (Phase: profiles) ──
  qualifications: [{ type: String, trim: true }],          // e.g. ["B.Ed. Mathematics, University of Nairobi 2022"]
  certifications: [{ type: String, trim: true }],          // e.g. ["Cambridge IGCSE Mathematics certified", "TSC registered"]
  specializations: [{ type: String, trim: true }],         // e.g. ["Calculus", "Mechanics"]
  yearsOfExperience: { type: Number, min: 0, max: 70, default: 0 },

  // Display title / job role (distinct from `role` which is the system
  // permission level). e.g. "Senior Mathematics Teacher", "Head of Sciences",
  // "Lead Tutor". Free-text but admin picks from suggested presets in the UI.
  jobTitle: { type: String, trim: true, default: '' },

  // ── ADMIN → TEACHER EMAIL HISTORY ──
  // A record of branded emails an admin has sent this teacher from the
  // Teacher Management "Email" tab. Append-only audit trail.
  sentEmails: [{
    subject:   { type: String, trim: true },
    kind:      { type: String, trim: true },     // memo / meeting / commendation / notice / custom
    sentAt:    { type: Date, default: Date.now },
    sentBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentByName:{ type: String, trim: true },
  }],

  // Default meeting URL (Zoom personal room, Google Meet, etc.) pre-filled
  // when teacher schedules a new live class. Overridable per-class.
  defaultMeetingLink: { type: String, trim: true, default: '' },

  // ── STUDENT-SPECIFIC PROFILE FIELDS (Phase: profiles) ──
  admissionNumber: {
    type: String,
    trim: true,
    sparse: true,   // allows null, enforces uniqueness when set
    unique: true,
    index: true,
  },
  dateOfBirth: { type: Date, default: null },
  homeAddress: { type: String, trim: true, maxlength: 500 },
  medicalNotes: { type: String, trim: true, maxlength: 500 },
  
  // STUDENT STATUS MANAGEMENT
  studentStatus: { 
    type: String, 
    enum: ['Active', 'Graduated', 'Inactive', 'Removed', 'Non-Paying'], 
    default: 'Active'
  },
  statusChangedAt: Date,
  statusChangedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who made the change
  statusReason: String, // Reason for status change (graduation, parent removal, fee default, etc.)
  
  // TEACHER STATUS & LEAVE MANAGEMENT
  teacherStatus: {
    type: String,
    enum: ['Active', 'On Leave Pending', 'On Leave Approved', 'Left'],
    default: 'Active'
  },
  
  isActive:       { type: Boolean, default: true },

  // ── Break / Leave ──────────────────────────────────────
  // DOS sets onBreak=true to deactivate reminders & check-in for a student.
  // Admin can do the same for staff.
  onBreak:        { type: Boolean, default: false },
  breakType:      { type: String, enum: ['mid_term_break','end_term_break','summer_break','medical_leave','other',''], default: '' },
  breakStart:     { type: Date, default: null },
  breakEnd:       { type: Date, default: null },
  breakNote:      { type: String, default: '' },
  isDemo: { type: Boolean, default: false }, // PHASE 3: Protect main admin from deletion
  isMainAdmin: { type: Boolean, default: false }, // PHASE 3: Protect main admin from deletion
  isOnLeave: { type: Boolean, default: false }, // Teacher on leave - invalidates their allocations
  leaveStartDate: Date,
  leaveEndDate: Date,
  
  plan: { type: String, enum: ['Basic','Premium','IGCSE Pack','Staff'], default: 'Basic' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: Date,
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  mustChangePassword: { type: Boolean, default: false }, // Only true for student/parent accounts created by admin
  credentialsSentCount: { type: Number, default: 0 },
  lastCredentialsSentAt: { type: Date },
}, { timestamps: true });

// Hash password before saving (existing hook — DO NOT REMOVE)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Auto-generate admission number for students on first save (Phase: profiles)
userSchema.pre('save', async function(next) {
  if (this.role === 'student' && !this.admissionNumber) {
    try {
      const Counter = require('./Counter')
      const year = new Date().getFullYear()
      const counter = await Counter.findOneAndUpdate(
        { _id: 'admission-' + year },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      )
      const padded = String(counter.seq).padStart(3, '0')
      this.admissionNumber = 'SH/' + year + '/' + padded
    } catch (err) {
      console.error('[admission-number] generation failed:', err.message)
      // Don't block save — admission number can be assigned later
    }
  }
  next()
});

userSchema.methods.comparePassword = async function(pw) {
  return bcrypt.compare(pw, this.password);
};

// PHASE 3-5: Helper method to generate temporary password
userSchema.statics.generateTempPassword = function() {
  return Math.random().toString(36).substring(2, 14) + Math.random().toString(36).substring(2, 8);
};

module.exports = mongoose.model('User', userSchema);
