/**
 * CommunityMessage.js — one message in the school-wide live chat.
 *
 * The chat is ONE room for the whole school, WhatsApp style:
 * every student is in automatically, channels organize topics
 * inside the room, and everything is visible to everyone.
 * No private threads exist. Removal keeps the record.
 */
const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema({
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  channel: { type: String, enum: ['general', 'announcements', 'questions', 'resources', 'wins'], default: 'general', index: true },
  body:    { type: String, trim: true, maxlength: 800, default: '' },

  // One attachment per message: a document, an image, a voice note, or a
  // video. Stored on R2; the message renders a matching inline player/card.
  attachment: {
    kind:      { type: String, enum: ['', 'file', 'image', 'audio', 'video'], default: '' },
    url:       { type: String, default: '' },
    key:       { type: String, default: '' },
    name:      { type: String, default: '', maxlength: 200 },
    mime:      { type: String, default: '' },
    sizeBytes: { type: Number, default: 0 },
    durationSec: { type: Number, default: 0 },   // voice notes / video, if known
  },

  // Light reply threading: snapshot the quoted line so rendering
  // never needs a second lookup and survives later removals.
  replyTo:        { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityMessage', default: null },
  replyToAuthor:  { type: String, default: '' },
  replyToExcerpt: { type: String, default: '', maxlength: 140 },

  reactions: [{
    emoji: { type: String, enum: ['\ud83d\udc4d', '\u2764\ufe0f', '\ud83c\udf89', '\ud83d\ude4c'] },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],

  reports: [{
    by:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason:   { type: String, trim: true, maxlength: 300, default: '' },
    resolved: { type: Boolean, default: false },
    createdAt:{ type: Date, default: Date.now },
  }],

  status: { type: String, enum: ['live', 'pending_review', 'removed'], default: 'live', index: true },
  pinned: { type: Boolean, default: false },
  system: { type: Boolean, default: false },

  removedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  removedReason: { type: String, default: '' },
}, { timestamps: true });

communityMessageSchema.index({ status: 1, channel: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityMessage', communityMessageSchema);
