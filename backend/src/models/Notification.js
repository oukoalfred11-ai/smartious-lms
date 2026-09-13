/**
 * Notification.js - in app notifications for every user. Emitted by
 * lib/notify.js; read by the bell in every portal. Expire after 60
 * days via TTL.
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  body: { type: String, trim: true, maxlength: 400, default: '' },
  module: { type: String, trim: true, default: '' },  // portal module key, same dialect as announcements
  readAt: { type: Date, default: null, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 3600 });

module.exports = mongoose.model('Notification', notificationSchema);
