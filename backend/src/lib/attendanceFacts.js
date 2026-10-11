/**
 * attendanceFacts.js — the single source of truth for STUDENT attendance.
 *
 * Attendance is per lesson: a student is "scheduled" for every held lesson
 * (LiveClass, kind 'lesson', not cancelled, scheduled time + duration
 * passed or explicitly ended) they are assigned to, and "attended" when
 * their ClassroomSession shows they joined (or the class teacher marked
 * them present) and the teacher has not discounted it (present:false).
 *
 * Legacy history: before ATTENDANCE_CUTOVER the school kept a day
 * register (Attendance collection). For the part of a requested range that
 * falls before the cutover, those day docs are used instead (present /
 * late / half_day = attended), flagged source:'legacy'. After the cutover
 * the Attendance collection is only the self check-in log (routes/checkin.js)
 * and is never read as student attendance.
 */
const LiveClass = require('../models/LiveClass');
const ClassroomSession = require('../models/ClassroomSession');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Day the per-lesson register became authoritative. Override with
// ATTENDANCE_CUTOVER=YYYY-MM-DD.
const DEFAULT_CUTOVER = '2026-10-10';
function cutoverDate() {
  const raw = process.env.ATTENDANCE_CUTOVER || DEFAULT_CUTOVER;
  const d = new Date(/T/.test(raw) ? raw : raw + 'T00:00:00Z');
  return isNaN(d.getTime()) ? new Date(DEFAULT_CUTOVER + 'T00:00:00Z') : d;
}

const LATE_GRACE_MS = 10 * 60000;
const LEGACY_ATTENDED = new Set(['present', 'late', 'half_day']);

/** Does this ClassroomSession count as attendance? */
function sessionAttended(s) {
  if (!s) return false;
  const joinedOrMarked = (s.joinCount || 0) > 0 || s.present === true;
  return joinedOrMarked && s.present !== false;
}

/**
 * Lessons that have been held in [from, to] (capped at now).
 * opts.studentIds limits to classes with any of those students assigned.
 */
async function heldLessons(from, to, opts = {}) {
  const cutoff = Math.min(new Date(to).getTime(), Date.now());
  if (cutoff < new Date(from).getTime()) return [];
  const q = {
    status: { $nin: ['cancelled'] },
    kind: { $in: ['lesson', null] },
    scheduledAt: { $gte: new Date(from), $lte: new Date(cutoff) },
  };
  if (opts.studentIds) q.assignedStudents = { $in: opts.studentIds };
  let query = LiveClass.find(q)
    .select(opts.select || 'title subject grade teacherId assignedStudents scheduledAt durationMins status')
    .sort({ scheduledAt: 1 });
  if (opts.limit) query = query.limit(opts.limit);
  const raw = await query.lean();
  // opts.heldBy: the instant by which a lesson must have finished (default
  // the range cutoff); snapshots pass Date.now() so a lesson starting late
  // in the day still counts for that day.
  const heldBy = opts.heldBy ? new Date(opts.heldBy).getTime() : cutoff;
  return raw.filter(c => c.status === 'ended' ||
    new Date(c.scheduledAt).getTime() + (c.durationMins || 60) * 60000 < heldBy);
}

/** Map `${classId}|${userId}` -> session doc for the given classes. */
async function sessionsFor(classes, studentIds) {
  const ids = classes.map(c => c._id);
  if (!ids.length) return new Map();
  const q = { liveClassId: { $in: ids } };
  if (studentIds) q.userId = { $in: studentIds };
  const docs = await ClassroomSession.find(q)
    .select('liveClassId userId present joinCount firstJoinedAt durationMs markedBy').lean();
  return new Map(docs.map(s => [String(s.liveClassId) + '|' + String(s.userId), s]));
}

/**
 * Aggregate facts used by the DOS reports, snapshots and churn: scheduled
 * vs attended per student, plus per-class join stats. Sessions only (no
 * legacy fallback) — these reports have always been session based.
 */
async function sessionFacts(from, to, opts = {}) {
  const classes = await heldLessons(from, to, { limit: opts.limit, heldBy: opts.heldBy });
  const sess = await sessionsFor(classes);
  const perStudent = {}; // userId -> { scheduled, attended }
  const perClass = {};   // classId -> { assigned, attended }
  classes.forEach(c => {
    const cid = String(c._id);
    perClass[cid] = { assigned: (c.assignedStudents || []).length, attended: 0 };
    (c.assignedStudents || []).forEach(u => {
      const uid = String(u);
      perStudent[uid] = perStudent[uid] || { scheduled: 0, attended: 0 };
      perStudent[uid].scheduled += 1;
      if (sessionAttended(sess.get(cid + '|' + uid))) { perStudent[uid].attended += 1; perClass[cid].attended += 1; }
    });
  });
  const attended = (classId, userId) => sessionAttended(sess.get(String(classId) + '|' + String(userId)));
  return { classes, perStudent, perClass, attended };
}

const rateOf = (a, s) => (s > 0 ? Math.round((a / s) * 100) : null);
const utcMidnight = (d) => { const x = new Date(d); x.setUTCHours(0, 0, 0, 0); return x; };

/**
 * Per-student attendance over [from, to].
 *   opts.studentIds  — required unless opts.allStudents (school-wide)
 *   opts.lessons     — include per-lesson rows (default true)
 *   opts.legacy      — use legacy day docs before the cutover (default true)
 *
 * Returns { [studentId]: {
 *   scheduled, attended, late, rate,            // combined (lessons + legacy days)
 *   lessonsScheduled, lessonsAttended,
 *   legacyDays, legacyAttended,
 *   lessons:    [{ liveClassId, title, subject, scheduledAt, durationMins, attended, late, joinedAt, source:'session'|'teacher' }],
 *   legacyRecords: [{ date, status, reason, attended, source:'legacy' }]   (only when opts.lessons)
 * } }
 * plus a non-enumerable `cutover` for callers that want to label history.
 */
async function studentAttendance(from, to, opts = {}) {
  from = new Date(from); to = new Date(to);
  const ids = opts.studentIds ? opts.studentIds.map(String) : null;
  const withRows = opts.lessons !== false;
  const useLegacy = opts.legacy !== false;
  const cut = cutoverDate();
  const out = {};
  const blank = () => ({
    scheduled: 0, attended: 0, late: 0, rate: null,
    lessonsScheduled: 0, lessonsAttended: 0, legacyDays: 0, legacyAttended: 0,
    ...(withRows ? { lessons: [], legacyRecords: [] } : {}),
  });
  const get = (uid) => (out[uid] = out[uid] || blank());
  if (ids) ids.forEach(get);
  const wanted = ids ? new Set(ids) : null;

  // ── Per-lesson part: [max(from, cutover), to] ──
  const lessonFrom = useLegacy && cut > from ? cut : from;
  if (lessonFrom <= to) {
    const classes = await heldLessons(lessonFrom, to, ids ? { studentIds: ids } : {});
    const sess = await sessionsFor(classes, ids);
    classes.forEach(c => {
      const cid = String(c._id);
      (c.assignedStudents || []).forEach(u => {
        const uid = String(u);
        if (wanted && !wanted.has(uid)) return;
        const s = sess.get(cid + '|' + uid);
        const attended = sessionAttended(s);
        const late = attended && !!s.firstJoinedAt &&
          new Date(s.firstJoinedAt).getTime() > new Date(c.scheduledAt).getTime() + LATE_GRACE_MS;
        const r = get(uid);
        r.lessonsScheduled += 1;
        if (attended) r.lessonsAttended += 1;
        if (late) r.late += 1;
        if (withRows) r.lessons.push({
          liveClassId: c._id, title: c.title || '', subject: c.subject || '',
          scheduledAt: c.scheduledAt, durationMins: c.durationMins || null,
          attended, late, joinedAt: s?.firstJoinedAt || null,
          source: s?.markedBy ? 'teacher' : 'session',
        });
      });
    });
  }

  // ── Legacy day-register part: [from, min(to, cutover)) ──
  if (useLegacy && from < cut) {
    const legacyTo = to < cut ? to : new Date(cut.getTime() - 1);
    const q = { date: { $gte: utcMidnight(from), $lte: legacyTo } };
    if (ids) q.studentId = { $in: ids };
    else {
      // School-wide: the Attendance collection also holds staff self
      // check-ins (studentId = staff id). Only student-role users count.
      const studs = await User.find({ role: 'student' }).select('_id').lean();
      q.studentId = { $in: studs.map(u => u._id) };
    }
    const docs = await Attendance.find(q).select('studentId date status reason').sort({ date: 1 }).lean();
    docs.forEach(d => {
      const uid = String(d.studentId);
      if (wanted && !wanted.has(uid)) return;
      const r = get(uid);
      const attended = LEGACY_ATTENDED.has(d.status);
      r.legacyDays += 1;
      if (attended) r.legacyAttended += 1;
      if (d.status === 'late') r.late += 1;
      if (withRows) r.legacyRecords.push({ date: d.date, status: d.status, reason: d.reason || '', attended, source: 'legacy' });
    });
  }

  Object.values(out).forEach(r => {
    r.scheduled = r.lessonsScheduled + r.legacyDays;
    r.attended = r.lessonsAttended + r.legacyAttended;
    r.rate = rateOf(r.attended, r.scheduled);
  });
  Object.defineProperty(out, 'cutover', { value: cut, enumerable: false });
  return out;
}

/** Convenience: one student. */
async function oneStudent(studentId, from, to, opts = {}) {
  const all = await studentAttendance(from, to, { ...opts, studentIds: [studentId] });
  return all[String(studentId)];
}

module.exports = {
  DEFAULT_CUTOVER, cutoverDate, sessionAttended, heldLessons, sessionsFor,
  sessionFacts, studentAttendance, oneStudent, rateOf,
};
