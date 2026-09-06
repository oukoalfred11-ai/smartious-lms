/**
 * MetricSnapshot.js — one document per scope per day: the school's memory.
 *
 * Dashboards without history can only say "today is 61%". Snapshots turn
 * every module's number into a trend: "declining four weeks straight" is
 * the sentence that drives action. A nightly job (lib/snapshots.js)
 * computes and upserts these; modules read them via /api/snapshots.
 *
 * scope examples: 'school', 'grade:Year 8', 'teacher:<id>', 'subject:Mathematics'
 */
const mongoose = require('mongoose');

const metricSnapshotSchema = new mongoose.Schema({
  day: { type: String, required: true, index: true },   // 'YYYY-MM-DD'
  scope: { type: String, required: true, index: true },
  metrics: {
    scheduled: { type: Number, default: 0 },   // student-session slots due
    attended: { type: Number, default: 0 },    // slots actually attended
    sessionsHeld: { type: Number, default: 0 },
    examAvg: { type: Number, default: null },  // avg % of submissions graded that day
    examN: { type: Number, default: 0 },
    quizN: { type: Number, default: 0 },
    hwN: { type: Number, default: 0 },
    qbAdded: { type: Number, default: 0 },     // questions created that day
  },
}, { timestamps: true });

metricSnapshotSchema.index({ scope: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('MetricSnapshot', metricSnapshotSchema);
