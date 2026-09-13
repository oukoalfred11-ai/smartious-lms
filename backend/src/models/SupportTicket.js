/**
 * SupportTicket.js - one thread per request, chat style. The response
 * clock: lastUserMessageAt vs lastStaffMessageAt tells exactly how
 * long a person has been waiting for the school to speak.
 */
const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userName: { type: String, default: '' },
  userRole: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  subject: { type: String, required: true, trim: true, maxlength: 140 },
  status: { type: String, enum: ['open', 'awaiting_user', 'resolved'], default: 'open', index: true },
  messages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String, default: '' },
    staff: { type: Boolean, default: false },
    body: { type: String, required: true, trim: true, maxlength: 3000 },
    at: { type: Date, default: Date.now },
  }],
  firstStaffReplyAt: Date,
  lastUserMessageAt: { type: Date, default: Date.now },
  lastStaffMessageAt: Date,
  resolvedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
