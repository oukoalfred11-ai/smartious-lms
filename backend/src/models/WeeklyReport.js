/**
 * models/WeeklyReport.js
 * One weekly report per teacher per student per week.
 * Separate from the end-term Report model.
 */
const mongoose = require('mongoose')

const assessmentSchema = new mongoose.Schema({
  desc:  { type: String, default: '' },
  score: { type: Number, default: null },
  outOf: { type: Number, default: 100 },
  percentage: { type: Number, default: null },
}, { _id: false })

const weeklyReportSchema = new mongoose.Schema({
  // Identifiers
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true, index:true },
  teacherName:  { type: String, default:'' },
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref:'User', default:null, index:true },
  studentName:  { type: String, required:true },
  studentEmail: { type: String, default:'' },
  parentEmail:  { type: String, default:'' },

  // Academic context
  subject:      { type: String, required:true },
  classLevel:   { type: String, default:'' },
  curriculum:   { type: String, default:'' },
  week:         { type: String, default:'' },
  period:       { type: String, default:'Term 1' },
  academicYear: { type: String, default:'' },

  // Content
  topics:       [{ type: String }],
  subTopics:    [{ type: String }],
  activities:   [{ type: String }],
  homework:     [{ type: String }],
  strengths:    [{ type: String }],
  improvements: [{ type: String }],
  assessments:  [assessmentSchema],

  // Performance observations
  understanding:  { type: String, default:'' },
  participation:  { type: String, default:'' },
  generalPerf:    { type: String, default:'' },
  remarks:        { type: String, default:'' },

  // Computed
  overallAverage: { type: Number, default:null },
  meanGrade:      { type: String,  default:'' },

  // Status
  status: { type: String, enum:['draft','published'], default:'draft', index:true },

  // Notification tracking
  parentNotifiedAt: { type: Date, default:null },
  parentEmailSent:  { type: Boolean, default:false },
}, { timestamps:true })

// Allow multiple weekly reports per teacher+student+subject (different weeks)
weeklyReportSchema.index({ teacherId:1, studentId:1, subject:1, week:1 })

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema)
