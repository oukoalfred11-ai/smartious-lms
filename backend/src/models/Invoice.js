/**
 * models/Invoice.js
 * Persistent invoice records — one per issued invoice.
 */
const mongoose = require('mongoose')

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  sessions:    { type: String, default: '' },   // e.g. "3 sessions"
  duration:    { type: String, default: '' },   // e.g. "1 hr"
  ratePerHr:   { type: Number, default: 0 },
  amount:      { type: Number, required: true },
}, { _id: false })

// One row per reminder actually sent, so the accountant can see the
// full history rather than just a count.
const reminderSchema = new mongoose.Schema({
  sentAt:   { type: Date, default: Date.now },
  sentTo:   { type: String, default: '' },
  kind:     { type: String, enum: ['upcoming', 'due', 'overdue', 'manual'], default: 'manual' },
  // 'auto' for the scheduler, otherwise the user who pressed Send.
  sentBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  automatic:{ type: Boolean, default: false },
  note:     { type: String, default: '' },
}, { _id: false })

const invoiceSchema = new mongoose.Schema({
  invoiceNo:    { type: String, required: true, unique: true, index: true },
  issueDate:    { type: Date,   required: true },
  dueDate:      { type: Date,   default: null },

  // ── Bill To ──────────────────────────────────────────────
  billedToName:    { type: String, required: true },
  billedToAddress: { type: String, default: '' },
  billedToEmail:   { type: String, default: '' },

  // ── Student ───────────────────────────────────────────────
  studentName:  { type: String, default: '' },
  studentGrade: { type: String, default: '' },
  subject:      { type: String, default: '' },

  // Link to the student record, so reminders can check whether the
  // student is on a break before chasing the parent.
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

  // ── Service period ────────────────────────────────────────
  // The stretch of tuition this invoice pays for. The reminder
  // scheduler works from servicePeriodEnd: the next invoice is due
  // as the current period runs out, so a reminder goes three days
  // before that date.
  servicePeriodStart: { type: Date, default: null },
  servicePeriodEnd:   { type: Date, default: null, index: true },

  // ── Reminders ─────────────────────────────────────────────
  // Set false to exclude an invoice from automatic chasing, e.g. a
  // scholarship place or an account in dispute.
  autoRemind:      { type: Boolean, default: true },
  reminders:       { type: [reminderSchema], default: [] },
  lastReminderAt:  { type: Date, default: null },
  reminderCount:   { type: Number, default: 0 },

  // ── Programme ─────────────────────────────────────────────
  programmeLabel: { type: String, default: '' },  // e.g. "HOME TUITION PROGRAMME · 13 July – 21 August 2026 (6 weeks)"

  // ── Line items ────────────────────────────────────────────
  lineItems: [lineItemSchema],
  currency:  { type: String, enum: ['USD','KES','GBP','EUR','AED'], default: 'USD' },

  // ── Totals ────────────────────────────────────────────────
  subtotal:    { type: Number, default: 0 },
  discount:    { type: Number, default: 0 },
  vatPct:      { type: Number, default: 0 },
  vatAmount:   { type: Number, default: 0 },
  totalDue:    { type: Number, required: true },

  // ── Status ───────────────────────────────────────────────
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'sent',
    index: true,
  },
  paidAt:     { type: Date, default: null },
  paidAmount: { type: Number, default: 0 },

  // ── Notes ────────────────────────────────────────────────
  paymentNote: { type: String, default: '' },
  notes:       { type: String, default: '' },

  // ── Meta ─────────────────────────────────────────────────
  issuedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Signature shown on the invoice email and PDF. Set from the
  // creator's role: sales/admissions invoices are signed by the
  // Head of Admission Team, all others by the Head of Finance.
  issuedByName:  { type: String, default: '' },
  issuedByTitle: { type: String, default: '' },
  emailSentTo: { type: String, default: '' },
  emailSentAt: { type: Date, default: null },

}, { timestamps: true })

invoiceSchema.index({ status: 1, createdAt: -1 })
invoiceSchema.index({ billedToEmail: 1 })
invoiceSchema.index({ issueDate: -1 })
// Drives the nightly reminder scan.
invoiceSchema.index({ status: 1, autoRemind: 1, servicePeriodEnd: 1 })
invoiceSchema.index({ dueDate: 1, status: 1 })

module.exports = mongoose.model('Invoice', invoiceSchema)
