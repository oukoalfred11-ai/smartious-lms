const mongoose = require('mongoose');

const libraryBookSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  coverUrl:    { type: String, default: '' },
  section:     { type: String, enum: ['coursebook','mock','past_paper'], default: 'coursebook' },
  description: { type: String, default: '', trim: true, maxlength: 1000 },
  author:      { type: String, default: '', trim: true, maxlength: 200 },

  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true,
  },
  subjectName: { type: String, required: true, trim: true },
  curriculum:  { type: String, required: true, trim: true, index: true },
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

libraryBookSchema.index({ subjectId: 1, isActive: 1, createdAt: -1 });
libraryBookSchema.index({ curriculum: 1, isActive: 1 });

module.exports = mongoose.model('LibraryBook', libraryBookSchema);
