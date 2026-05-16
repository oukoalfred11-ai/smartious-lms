const mongoose = require('mongoose');

/**
 * Communication
 * ============================================================
 * Audit record of one email campaign sent through the
 * Communication module. One document per send action (whether
 * it went to 1 recipient or 200).
 */
const communicationSchema = new mongoose.Schema({
  // Who sent it
  sentBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sentByName: { type: String, trim: true },
  sentByRole: { type: String, trim: true },   // admin / teacher / student

  // Content
  subject:    { type: String, required: true, trim: true },
  body:       { type: String, required: true },

  // Attachments — Cloudinary URLs
  attachments: [{
    name: { type: String, trim: true },
    url:  { type: String, trim: true },
  }],

  // Recipients — flattened to email addresses actually sent to
  recipients: [{
    email:  { type: String, trim: true },
    name:   { type: String, trim: true },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    error:  { type: String, trim: true },
  }],

  // Quick counts (denormalised for fast history listing)
  recipientCount: { type: Number, default: 0 },
  sentCount:      { type: Number, default: 0 },
  failedCount:    { type: Number, default: 0 },

  // How recipients were chosen (for display in history)
  audience: { type: String, trim: true },   // e.g. "All Teachers", "12 individuals", "Mixed"

  createdAt: { type: Date, default: Date.now },
});

communicationSchema.index({ sentBy: 1, createdAt: -1 });

module.exports = mongoose.model('Communication', communicationSchema);
