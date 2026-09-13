/**
 * Conversation.js - one document per pair of people talking. The
 * pairKey (sorted ids) guarantees a single conversation per pair.
 */
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  pairKey: { type: String, required: true, unique: true, index: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  participantMeta: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    role: String,
  }],
  lastMessageAt: { type: Date, default: Date.now, index: true },
  lastMessageText: { type: String, default: '' },
  messageCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
