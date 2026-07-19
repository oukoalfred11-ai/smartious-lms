/**
 * models/Payroll.js
 * One payroll record per teacher per month.
 */
const mongoose = require('mongoose')

const deductionSchema = new mongoose.Schema({
  label:  { type: String, required: true },   // e.g. "NHIF", "NSSF", "Tax"
  amount: { type: Number, required: true, default: 0 },
}, { _id: false })

const tuitionEarningSchema = new mongoose.Schema({
  description:   { type: String, required: true },  // e.g. "Extra tuition — Chemistry, 3 sessions"
  studentName:   { type: String, default: '' },
  subject:       { type: String, default: '' },
  sessions:      { type: Number, default: 1 },
  ratePerSession:{ type: Number, default: 0 },
  totalAmount:   { type: Number, required: true },
  date:          { type: Date,   default: Date.now },
  status:        { type: String, enum:['pending','approved','rejected'], default:'pending' },
  approvedBy:    { type: mongoose.Schema.Types.ObjectId, ref:'User', default:null },
  approvedAt:    { type: Date, default: null },
  rejectedNote:  { type: String, default: '' },
}, { timestamps: true })

const payrollSchema = new mongoose.Schema({
  // Who
  teacherId:   { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true, index:true },
  teacherName: { type: String, required:true },
  teacherEmail:{ type: String, required:true },

  // Period
  periodLabel: { type: String, required:true },  // e.g. "July 2026"
  periodMonth: { type: Number, required:true },  // 1–12
  periodYear:  { type: Number, required:true },

  // Compensation
  basicSalary: { type: Number, default: 0 },     // entered by accountant (KES)
  currency:    { type: String, enum:['KES','USD','GBP'], default:'KES' },

  // Deductions
  deductions:  [deductionSchema],               // NHIF, NSSF, tax, etc.
  totalDeductions: { type: Number, default: 0 },

  // Approved tuition extras
  tuitionExtras:        [tuitionEarningSchema],
  totalApprovedExtras:  { type: Number, default: 0 },

  // Net
  netPay:    { type: Number, default: 0 },  // basicSalary - totalDeductions + totalApprovedExtras

  // Payment
  status:    { type: String, enum:['draft','processing','paid'], default:'draft', index:true },
  paymentDate:     { type: Date, default: null },
  paymentMethod:   { type: String, default: 'Bank transfer' },
  paymentRef:      { type: String, default: '' },
  paymentNote:     { type: String, default: '' },

  // Email
  payslipEmailSentAt: { type: Date, default: null },

  // Created by accountant
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
}, { timestamps: true })

payrollSchema.index({ teacherId:1, periodYear:1, periodMonth:1 }, { unique:true })

module.exports = mongoose.model('Payroll', payrollSchema)
