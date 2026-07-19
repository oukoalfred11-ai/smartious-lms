/**
 * models/Report.js
 * One document per student per term.
 * Stores the computed scores + comments so the PDF can be
 * regenerated at any time without re-querying exam data.
 */
const mongoose = require('mongoose')

const subjectResultSchema = new mongoose.Schema({
  subject:            { type: String, required: true },
  teacherId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherInitials:    { type: String, default: '' },

  // Raw scores
  weeklyScores:       [Number],              // all weekly exam scores this term
  weeklyAverage:      { type: Number, default: null },  // avg of above, null if none sat
  endTermScore:       { type: Number, default: null },  // end-of-term exam score

  // Weighted final: weekly*30% + endTerm*70%
  weightedScore:      { type: Number, default: null },
  letterGrade:        { type: String, default: '' },

  teacherComment:     { type: String, default: '' },
  missedWeekly:       { type: Boolean, default: false },
  missedEndTerm:      { type: Boolean, default: false },
}, { _id: false })

const reportSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  academicYear: { type: String, required: true },  // e.g. '2025/2026'
  term:         { type: Number, required: true, enum: [1,2,3] },
  termLabel:    { type: String, default: '' },     // e.g. 'Term 3 · Final Term'

  // Term date range used to pull exams + attendance
  termStart:    { type: Date, required: true },
  termEnd:      { type: Date, required: true },

  // Student snapshot at time of report
  studentName:    { type: String },
  admissionNo:    { type: String },
  gender:         { type: String },
  curriculum:     { type: String },
  yearGrade:      { type: String },
  classStream:    { type: String, default: '—' },
  programme:      { type: String },
  classTeacher:   { type: String },
  photoUrl:       { type: String, default: '' },

  // Attendance
  scheduledDays:  { type: Number, default: 0 },
  attendedDays:   { type: Number, default: 0 },
  absentDays:     { type: Number, default: 0 },
  punctualityPct: { type: Number, default: 0 },

  // Subject results
  subjects: [subjectResultSchema],

  // Computed totals
  endTermAverage:  { type: Number, default: null },
  weeklyAverage:   { type: Number, default: null },
  overallAverage:  { type: Number, default: null },
  meanGrade:       { type: String, default: '' },
  yearAverage:     { type: Number, default: null },

  // Learning habits (1=Concern, 2=Developing, 3=Good, 4=Excellent)
  learningHabits: {
    effort:           { type: Number, default: 3 },
    participation:    { type: Number, default: 3 },
    homework:         { type: Number, default: 3 },
    organisation:     { type: Number, default: 3 },
    conduct:          { type: Number, default: 3 },
    collaboration:    { type: Number, default: 3 },
    feedback:         { type: Number, default: 3 },
    digital:          { type: Number, default: 3 },
  },

  coCurricular:        { type: String, default: '' },
  agreedTargets:       [String],
  classTeacherReport:  { type: String, default: '' },
  hodRemarks:          { type: String, default: '' },
  issuedBy:            { type: String, default: 'Ms. Brendaliz Chelangat — Head of Academics' },
  dateIssued:          { type: Date, default: Date.now },

  promotionDecision:   { type: String, default: '' },
  nextTermStart:       { type: String, default: '' },
  reportingTime:       { type: String, default: '' },

  status: { type: String, enum: ['draft','published'], default: 'draft' },

  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

reportSchema.index({ studentId: 1, academicYear: 1, term: 1 }, { unique: true })

module.exports = mongoose.model('Report', reportSchema)
