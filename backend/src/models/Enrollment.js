/**
 * Enrollment.js — one student's membership of one academic year.
 *
 * The missing half of the student lifecycle: statuses say what a
 * student IS (active, on break, graduated, removed); enrollments say
 * WHERE they were each year ("2026/2027 - Year 7"). Cohorts fall out
 * of this directly, and retention rate is computed by comparing
 * consecutive years' records: of the non-graduating students enrolled
 * in year X, how many hold an active record in year X+1.
 *
 * Written by the year tools in routes/student-sessions.js:
 *   - initialize year: snapshot every active student into the year
 *   - promote year: close the old year, advance grades, graduate
 *     terminal grades, open the new year.
 */
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  academicYear: { type: String, required: true, index: true },   // '2026/2027'
  grade: { type: String, required: true },                        // 'Year 7'
  curriculum: { type: String, default: '' },
  status: {
    type: String,
    enum: ['active', 'break', 'withdrawn', 'graduated', 'completed'],
    default: 'active',
    index: true,
  },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
  reason: { type: String, default: '' },
}, { timestamps: true });

enrollmentSchema.index({ studentId: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
