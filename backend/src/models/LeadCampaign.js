/**
 * models/LeadCampaign.js — one email campaign to leads (routes/leads.js):
 * which template, to whom, who sent it, and how each send went.
 */
const mongoose = require('mongoose')

const leadCampaignSchema = new mongoose.Schema({
  template: { type: String, required: true },
  subject:  { type: String, default: '' },
  message:  { type: String, default: '', maxlength: 4000 },
  filters:  { type: mongoose.Schema.Types.Mixed, default: {} },
  sentBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sentByName: { type: String, default: '' },
  status:   { type: String, enum: ['sending', 'done', 'failed'], default: 'sending', index: true },
  total:    { type: Number, default: 0 },
  sent:     { type: Number, default: 0 },
  failed:   { type: Number, default: 0 },
  skipped:  { type: Number, default: 0 },     // opted out, bounced, or emailed recently
  recipients: [{
    _id: false,
    email: String, name: String, leadType: String, leadId: String,
    status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
    error: { type: String, default: '' },
    at: Date,
  }],
  finishedAt: { type: Date, default: null },
}, { timestamps: true })

leadCampaignSchema.index({ 'recipients.email': 1, createdAt: -1 })

module.exports = mongoose.model('LeadCampaign', leadCampaignSchema)
