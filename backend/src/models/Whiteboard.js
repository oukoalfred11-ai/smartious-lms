/**
 * Whiteboard.js — durable whiteboard state, one document per class.
 *
 * The realtime server used to hold board ops only in memory, so the
 * board wiped whenever the room emptied for a moment, the server
 * restarted (every deploy), or the op cap trimmed. Now the room is a
 * cache and this document is the truth: ops are appended as they are
 * drawn and reloaded whenever the room is recreated. Replay order is
 * preserved, so clears and lock ops behave exactly as live.
 */
const mongoose = require('mongoose');

const whiteboardSchema = new mongoose.Schema({
  liveClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass', required: true, unique: true, index: true },
  ops: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { timestamps: true, minimize: false });

module.exports = mongoose.model('Whiteboard', whiteboardSchema);
