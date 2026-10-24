/**
 * lib/purgeCheckins.js
 * Deletes the records left by the retired daily self check-in
 * (routes/checkin.js) from the Attendance collection.
 *
 * Deleted: every self check-in (source:'self', or checkedIn:true on older
 * records written before `source` existed, and still marked by the person
 * themselves: a record a teacher later re-marked kept those flags, because
 * staff marks never set `source`, but its markedBy is the teacher, so it
 * stays), by staff or students, EXCEPT
 * students' check-ins dated before the attendance cutover: those are the
 * register of record for those days (lib/attendanceFacts reads them as
 * legacy attendance history, which appears in attendance rates and reports).
 * Day-register records marked by staff or from live classes are kept.
 *
 * Runs at startup (index.js). It is idempotent: nothing writes new
 * self check-ins any more, so later runs find nothing to delete.
 * Set PURGE_CHECKINS=off to skip it.
 */
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { cutoverDate } = require('./attendanceFacts');

// A self check-in record (older ones have no `source`, only checkedIn), not re-marked by staff.
const SELF = {
  $or: [{ source: 'self' }, { checkedIn: true, source: { $exists: false } }],
  $expr: { $eq: ['$markedBy', '$studentId'] },
};

/** The deleteMany filter: self check-ins, minus students' pre-cutover history. */
function purgeFilter(studentIds, cut) {
  return { $and: [SELF, { $nor: [{ studentId: { $in: studentIds }, date: { $lt: cut } }] }] };
}

/** The same rule for one record (for tests and dry runs). */
function isPurged(doc, studentIdSet, cut) {
  const self = (doc.source === 'self' || (doc.checkedIn === true && doc.source === undefined))
    && String(doc.markedBy) === String(doc.studentId);
  const history = studentIdSet.has(String(doc.studentId)) && new Date(doc.date) < cut;
  return self && !history;
}

async function purgeOldCheckins() {
  if (process.env.PURGE_CHECKINS === 'off') return { deleted: 0, skipped: true };
  const students = await User.find({ role: 'student' }).select('_id').lean();
  const r = await Attendance.deleteMany(purgeFilter(students.map(u => u._id), cutoverDate()));
  if (r.deletedCount) console.log('[checkin] Deleted', r.deletedCount, 'old self check-in records');
  return { deleted: r.deletedCount || 0 };
}

module.exports = { purgeFilter, isPurged, purgeOldCheckins };
