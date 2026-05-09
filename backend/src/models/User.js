const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','teacher','student','parent','demo'], default: 'student' },
  grade: String,

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
  // PHASE 3-5 REFACTOR: Teacher teaching specialties (multi-curriculum support)
  teachingSpecialties: [{
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    curriculum: { type: String, enum: ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American'] }
  }],
  phone: String,
  bio: String,
  avatar: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  linkedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For parents: students they manage
  linkedParents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For students: parents managing them
  
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
  
  isActive: { type: Boolean, default: true },
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
  mustChangePassword: { type: Boolean, default: true }, // PHASE 3-5: RENAMED from forcePasswordChange for clarity
  credentialsSentCount: { type: Number, default: 0 },
  lastCredentialsSentAt: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(pw) {
  return bcrypt.compare(pw, this.password);
};

// PHASE 3-5: Helper method to generate temporary password
userSchema.statics.generateTempPassword = function() {
  return Math.random().toString(36).substring(2, 14) + Math.random().toString(36).substring(2, 8);
};

module.exports = mongoose.model('User', userSchema);
