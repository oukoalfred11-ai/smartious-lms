/**
 * models/MarketingOptOut.js — an address that unsubscribed from lead
 * campaigns. Unlike MailSuppression (bounces), this only stops marketing:
 * invoices, receipts and school mail still go to the address.
 */
const mongoose = require('mongoose')

const marketingOptOutSchema = new mongoose.Schema({
  email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
  source: { type: String, default: 'unsubscribe-link' },   // unsubscribe-link | staff
}, { timestamps: true })

module.exports = mongoose.model('MarketingOptOut', marketingOptOutSchema)
