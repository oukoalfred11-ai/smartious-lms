/**
 * CommunityPost.js — one post in the school-wide community feed.
 *
 * Design decisions that keep the community safe by construction:
 *  - There is ONE public feed. No private rooms, no student DMs.
 *  - Every post and comment passes the contact-info filter before
 *    it is stored (enforced in the routes).
 *  - Reports live on the post itself; three unresolved reports
 *    auto-hide a post into the moderation queue.
 *  - Removal never deletes: removed content stays in the database
 *    with who removed it and why, because safeguarding may need
 *    the record later.
 */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body:    { type: String, required: true, trim: true, maxlength: 600 },
  status:  { type: String, enum: ['live', 'removed'], default: 'live' },
  removedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  removedReason: { type: String, default: '' },
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
  by:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason:   { type: String, trim: true, maxlength: 300, default: '' },
  resolved: { type: Boolean, default: false },
}, { timestamps: true });

const communityPostSchema = new mongoose.Schema({
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind:    { type: String, enum: ['post', 'question', 'tip', 'achievement', 'poll'], default: 'post' },
  body:    { type: String, required: true, trim: true, maxlength: 2000 },
  tags:    [{ type: String, trim: true, maxlength: 40 }],

  // Poll posts only
  pollOptions: [{
    text:  { type: String, trim: true, maxlength: 120 },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],

  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  reports:  [reportSchema],

  status: { type: String, enum: ['live', 'pending_review', 'removed'], default: 'live', index: true },
  pinned: { type: Boolean, default: false },

  removedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  removedReason: { type: String, default: '' },
}, { timestamps: true });

communityPostSchema.index({ status: 1, pinned: -1, createdAt: -1 });
communityPostSchema.index({ 'reports.resolved': 1 });

communityPostSchema.virtual('openReportCount').get(function () {
  return (this.reports || []).filter(r => !r.resolved).length;
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);
