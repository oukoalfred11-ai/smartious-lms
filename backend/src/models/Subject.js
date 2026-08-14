const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  curriculum: {
    type: String,
    enum: [
      // 15-curriculum catalog. Legacy values (IGCSE, A-Level, IB Diploma,
      // IB MYP, Kenya CBC, IUFP, Primary, Cambridge, Edexcel) were
      // removed on 2026-05-22 after verified-clean migrations of all
      // four collections (subjects, allocations, timetables, liveclasses)
      // and both user views (student top-level, teacher arrays).
      'CambridgePrimary', 'CambridgeLowerSec', 'CambridgeIGCSE', 'CambridgeALevel',
      'EdexcelPrimary', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel',
      'AQALowerSec', 'AQAGCSE', 'AQAALevel',
      'IBPYP', 'IBMYP', 'IBDP',
      'BNC', 'American', 'Canadian', 'KenyaCBC',
      // Legacy — pre-2026-08-04 flat IB curriculum. Existing records
      // are migrated to IBDP by migrate-ib-split.js; kept here so
      // validation does not break before the migration runs.
      'IB',
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
