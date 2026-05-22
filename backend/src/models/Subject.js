const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  curriculum: {
    type: String,
    enum: [
      // Current 15-curriculum catalog
      'CambridgePrimary', 'CambridgeLowerSec', 'CambridgeIGCSE', 'CambridgeALevel',
      'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel',
      'AQALowerSec', 'AQAGCSE', 'AQAALevel',
      'IB', 'BNC', 'American', 'Canadian', 'KenyaCBC',
      // Legacy values kept for backwards-compat with any pre-migration records
      'IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'IUFP',
      'Primary', 'Cambridge', 'Edexcel',
    ],
    required: true,
    trim: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      // Smartious's 8-category taxonomy (decided 2026-05-20)
      'Mathematics',
      'Sciences',
      'Languages',
      'Arts',
      'Business',
      'Humanities',
      'Technology',
      'Physical Education',
    ],
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  // ── Visual identity (optional; for student-facing UI) ──
  // color: hex code that paints the subject card stripe + accents
  // coverImage: Cloudinary URL for the subject hero image
  color: {
    type: String,
    trim: true,
    default: ''
  },
  coverImage: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure uniqueness per curriculum
subjectSchema.index({ curriculum: 1, subjectName: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
