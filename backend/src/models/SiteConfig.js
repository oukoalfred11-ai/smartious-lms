const mongoose = require('mongoose');

const SiteConfigSchema = new mongoose.Schema({
  schoolName: { type: String },
  tagline: { type: String },
  supportEmail: { type: String },
  adminPhone: { type: String },
  language: { type: String },
  timezone: { type: String },
  brandColor: { type: String },
  contactEmail: { type: String },
  apiKeys: [{ key: String, value: String }],
  featureToggles: { type: Object },
  storage: { type: Object },
  emailTemplates: [{ name: String, content: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteConfig', SiteConfigSchema);

