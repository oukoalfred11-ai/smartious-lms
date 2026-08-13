const mongoose = require('mongoose');

const libraryBookSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  coverUrl:    { type: String, default: '' },
  section:     { type: String, enum: ['coursebook','mock','past_paper'], default: 'coursebook' },
  description: { type: String, default: '', trim: true, maxlength: 1000 },
  author:      { type: String, default: '', trim: true, maxlength: 200 },

  // ── Past paper / mock exam folder fields ──────────────────
  // Used to group papers into folders: Year -> Paper 1..6.
  // Only meaningful when section is 'mock' or 'past_paper';
  // left null for coursebooks.
  examYear:    { type: Number, default: null, min: 2000, max: 2100, index: true },
  paperNumber: { type: Number, default: null, min: 1, max: 6 },
  // Exam session/series, e.g. "Feb/March", "May/June", "Oct/Nov"
  // for exam-body papers, or "Term 1".."Term 3" for school mocks.
  session:     { type: String, default: '', trim: true, maxlength: 40 },

  // ── Shelf ────────────────────────────────────────────────
  // A library is not only a curriculum store. 'academic' books belong
  // to a subject and curriculum; 'general' books — novels, biographies,
  // reference, careers, wellbeing — belong to no syllabus and were
  // previously impossible to upload at all, because subjectId,
  // subjectName and curriculum were every one of them required.
  shelf: {
    type: String,
    enum: ['academic', 'general'],
    default: 'academic',
    index: true,
  },
  // Only meaningful for shelf 'general'. Kept as a small closed list so
  // the student filter stays browsable rather than becoming free tags.
  genre: {
    type: String,
    enum: ['', 'Fiction', 'Non-fiction', 'Biography', 'Poetry', 'Reference',
           'Careers', 'Wellbeing', 'History', 'Science & Nature', 'Other'],
    default: '',
    index: true,
  },
  // Guidance, not a gate — a keen reader may go above it.
  ageRange: { type: String, default: '', trim: true, maxlength: 20 },

  // Academic books only. Optional so a general book can exist without
  // being forced into a subject it does not belong to.
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    default: null,
    index: true,
  },
  subjectName: { type: String, default: '', trim: true },
  curriculum:  { type: String, default: '', trim: true, index: true },
  grades:      [{ type: String, trim: true }],

  // R2 file pointers
  r2Key:     { type: String, required: true },
  url:       { type: String, required: true },       // public R2 URL for the PDF
  coverImage:{ type: String, default: '' },          // public R2 URL for cover image (optional)
  coverR2Key:{ type: String, default: '' },          // R2 key for cover (for deletion)
  fileName:  { type: String, required: true, trim: true },
  sizeBytes: { type: Number, default: 0 },
  mimeType:  { type: String, default: 'application/pdf' },

  uploadedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedByName: { type: String, default: '', trim: true },

  isActive:  { type: Boolean, default: true, index: true },
  viewCount: { type: Number,  default: 0 },

}, { timestamps: true });

// An academic book must name its subject; a general book must name its
// genre. Without one or the other a book cannot be found by any filter.
libraryBookSchema.pre('validate', function (next) {
  if (this.shelf === 'academic' && !this.subjectId) {
    return next(new Error('An academic book needs a subject.'));
  }
  if (this.shelf === 'general' && !this.genre) {
    this.genre = 'Other';
  }
  next();
});

libraryBookSchema.index({ subjectId: 1, isActive: 1, createdAt: -1 });
libraryBookSchema.index({ curriculum: 1, isActive: 1 });
libraryBookSchema.index({ shelf: 1, genre: 1, isActive: 1 });
// Folder browsing: section -> year -> paper
libraryBookSchema.index({ section: 1, examYear: -1, paperNumber: 1 });

module.exports = mongoose.model('LibraryBook', libraryBookSchema);
