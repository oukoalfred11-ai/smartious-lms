/**
 * DirectMessage.js - one row per message. Separate from the
 * conversation so threads can grow without unbounded documents.
 */
const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, default: '' },
  body: { type: String, required: true, trim: true, maxlength: 3000 },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  at: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('DirectMessage', directMessageSchema);
