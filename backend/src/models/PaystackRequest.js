/**
 * PaystackRequest.js — a card payment request sent to a parent.
 *
 * The "parent pays by card" lane. Each record tracks one Paystack
 * checkout link from creation to payment. A request may be tied to an
 * invoice (invoiceId); the invoice stays the single source of truth
 * and is marked paid when Paystack confirms the money.
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

  // Optional link to the invoice this card payment settles. When set,
  // a confirmed payment marks that invoice paid through the same path
  // as manual marking (receipt, billing clock). Older requests have
  // none and are never tied to an invoice retroactively.
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null, index: true },
  invoiceNo: { type: String, default: '' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // What happened to the linked invoice on confirmation, for the
  // accounts team: 'marked_paid', 'already_paid', 'partial',
  // 'currency_mismatch', 'invoice_missing'.
  invoiceOutcome: { type: String, default: '' },
}, { timestamps: true });

paystackRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PaystackRequest', paystackRequestSchema);
