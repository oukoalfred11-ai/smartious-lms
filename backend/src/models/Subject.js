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
      // ── Cambridge / Edexcel / AQA — Western-style 8-category taxonomy ──
      'Mathematics',
      'Sciences',
      'Languages',
      'Arts',
      'Business',
      'Humanities',
      'Technology',
      'Physical Education',

      // ── IB — IB Diploma / MYP / PYP framework ──
      'Studies in Language and Literature',
      'Language and Literature',
      'Language Acquisition',
      'Individuals and Societies',
      'The Arts',
      'IB Core',

      // ── Kenya CBC ──
      'STEM',
      'Social Studies',
      'Life Skills',

      // ── BNC (British National Curriculum) ──
      'Core',
      'English',
      'Practical',
      'Design',

      // ── American / Canadian (future-prep) ──
      'Electives',

      // ── IB / cross-curriculum ──
      'Physical and Health Education',
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
