/**
 * PaystackRequest.js — a card payment request sent to a parent.
 *
 * Deliberately separate from the Invoice system: this is the quick
 * "enter an amount and an email, parent pays by card" lane. Each
 * record tracks one Paystack checkout link from creation to payment.
 */
const mongoose = require('mongoose');

const paystackRequestSchema = new mongoose.Schema({
  payerName:   { type: String, trim: true, default: '' },
  email:       { type: String, required: true, trim: true, lowercase: true },
  amount:      { type: Number, required: true, min: 1 },      // major units
  currency:    { type: String, required: true, enum: ['KES', 'USD', 'NGN', 'GHS', 'ZAR'], default: 'KES' },
  description: { type: String, trim: true, default: 'School fees' },

  reference:        { type: String, required: true, unique: true, index: true },
  authorizationUrl: { type: String, required: true },

  status:  { type: String, enum: ['pending', 'paid', 'failed', 'abandoned'], default: 'pending', index: true },
  paidAt:  { type: Date, default: null },
  channel: { type: String, default: '' },                     // card, bank, mobile_money
  gatewayResponse: { type: String, default: '' },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

paystackRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PaystackRequest', paystackRequestSchema);
