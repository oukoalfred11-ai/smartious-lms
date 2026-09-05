/**
 * ClubProject.js
 *
 * A project a student uploads to their club: a science build, a service
 * initiative, a piece of writing, an app, a performance video. Fellow
 * club members discuss it (comments and suggestions) and cast their
 * annual-award vote. One award vote per member per club per year: voting
 * for one project moves your vote off any other project in that club's
 * year, the way a real award ballot works.
 */
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  kind:      { type: String, enum: ['image', 'video', 'audio', 'file'], default: 'file' },
  url:       { type: String, required: true },
  key:       { type: String, default: '' },
  name:      { type: String, default: '' },
  mime:      { type: String, default: '' },
  sizeBytes: { type: Number, default: 0 },
}, { _id: false });

const commentSchema = new mongoose.Schema({
  authorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body:      { type: String, required: true, trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
});

const clubProjectSchema = new mongoose.Schema({
  clubId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:       { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, trim: true, maxlength: 3000, default: '' },
  attachments: { type: [attachmentSchema], default: [] },

  // Award year the project competes in (the year it was posted).
  year:        { type: Number, required: true, index: true },

  votes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments:    { type: [commentSchema], default: [] },

  // Moderation: leaders/admin can take a project down without losing it.
  isActive:    { type: Boolean, default: true },
  removedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

clubProjectSchema.index({ clubId: 1, year: 1, isActive: 1 });

module.exports = mongoose.model('ClubProject', clubProjectSchema);
