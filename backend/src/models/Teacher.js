const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  curriculum: {
    type: String,
    enum: ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American'],
    trim: true
  },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  qualifications: [String], // e.g., ["Bachelor of Science", "Teaching Diploma"]
  experience: { type: Number, default: 0 }, // Years of experience
  status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalStudents: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  universalCurriculum: { type: Boolean, default: false }, // PHASE 4: Bypass curriculum-based filtering if true
  isDemo: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to User record
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt on save
TeacherSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Teacher', TeacherSchema);
