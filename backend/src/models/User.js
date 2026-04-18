const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','teacher','student','parent','demo'], default: 'student' },
  grade: String,
  curriculum: {
    type: String,
    enum: ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American'],
    trim: true
  },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  phone: String,
  bio: String,
  avatar: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  linkedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For parents: students they manage
  linkedParents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For students: parents managing them
  isActive: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false },
  plan: { type: String, enum: ['Basic','Premium','IGCSE Pack','Staff'], default: 'Basic' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: Date,
  verificationToken: { type: String }, // JWT token for email verification
  verificationTokenExpiry: { type: Date }, // Token expiry
  isEmailVerified: { type: Boolean, default: false },
  forcePasswordChange: { type: Boolean, default: true }, // PHASE 7: Force reset on first login / after password change
  credentialsSentCount: { type: Number, default: 0 }, // PHASE 5: Track how many times credentials email was sent
  lastCredentialsSentAt: { type: Date }, // PHASE 5: Track when credentials were last sent
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(pw) {
  return bcrypt.compare(pw, this.password);
};

module.exports = mongoose.model('User', userSchema);
