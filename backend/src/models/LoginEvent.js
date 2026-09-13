/**
 * LoginEvent.js - one row per sign in attempt, the raw material of
 * the Users Logs module: who signs in, when, from where, and which
 * attempts failed. Events expire after 120 days via TTL index.
 */
const mongoose = require('mongoose');

const loginEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  email: { type: String, trim: true, lowercase: true },
  role: { type: String, default: '' },
  success: { type: Boolean, default: true, index: true },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  at: { type: Date, default: Date.now, index: true },
});

loginEventSchema.index({ at: 1 }, { expireAfterSeconds: 120 * 24 * 3600 });

module.exports = mongoose.model('LoginEvent', loginEventSchema);
