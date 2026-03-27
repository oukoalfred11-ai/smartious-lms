const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','teacher','student','parent','demo'], default: 'student' },
  grade: String,
  curriculum: String,
  subjects: [String],
  phone: String,
  bio: String,
  avatar: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false },
  plan: { type: String, enum: ['Basic','Premium','IGCSE Pack','Staff'], default: 'Basic' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: Date,
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
