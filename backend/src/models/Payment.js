/**
 * models/Payment.js
 * Smartious LMS — Payment mongoose model
 * Save this file at:  server/models/Payment.js
 */
const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  // Who paid
  parentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null,  index: true },

  // Amount
  amount:      { type: Number, required: true },   // KES whole number (e.g. 4999)
  currency:    { type: String, default: 'KES' },

  // Description / meta
  description: { type: String, default: 'Fee payment' },
  reference:   { type: String, unique: true, sparse: true, index: true }, // SM-<timestamp>-<hex>
  method:      { type: String, default: 'Paystack' }, // Paystack | M-Pesa | Bank Transfer

  // Status lifecycle:  pending → success | failed
  status:      { type: String, enum: ['pending', 'success', 'failed'], default: 'pending', index: true },

  // Raw Paystack transaction object (stored verbatim for audit / reconciliation)
  paystackData: { type: mongoose.Schema.Types.Mixed, default: null },

  // Timestamps
  paidAt:      { type: Date },   // set when status becomes 'success'

  // Admin override fields
  adminNote:   { type: String },
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,   // adds createdAt + updatedAt
  toJSON:     { virtuals: true },
  toObject:   { virtuals: true },
})

// Virtual: formatted KES display string
paymentSchema.virtual('amountDisplay').get(function () {
  return 'KES ' + Number(this.amount).toLocaleString()
})

// Index for admin queries (date + status)
paymentSchema.index({ createdAt: -1 })
paymentSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model('Payment', paymentSchema)
