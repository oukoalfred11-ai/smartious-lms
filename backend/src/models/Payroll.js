const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // e.g., '2026-04'
  attendance: { type: Number, default: 0 },
  offHoursSessions: { type: Number, default: 0 },
  articlesRead: { type: Number, default: 0 },
  videosUploaded: { type: Number, default: 0 },
  totalPay: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Paid'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Payroll', PayrollSchema);

