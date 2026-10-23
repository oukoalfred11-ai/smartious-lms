/**
 * attendanceFacts.js — the single source of truth for STUDENT attendance.
 *
 * Attendance is per lesson: a student is "scheduled" for every held lesson
 * (LiveClass, kind 'lesson', not cancelled, scheduled time + duration
 * passed or explicitly ended) they are assigned to, and "attended" when
 * their ClassroomSession shows they joined (or the class teacher marked
 * them present) and the teacher has not discounted it (present:false).
 *
 * Never counted as missed: lessons on a school closure day (mid-term,
 * holidays: SchoolClosure) unless the student came anyway, lessons while
 * the student is on a pause or break, and lessons the Dean excused
 * (ClassroomSession.excused).
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
    .select(opts.select || 'title subject grade teacherId assignedStudents scheduledAt durationMins status outcome autoEnded')
    .sort({ scheduledAt: 1 });
  if (opts.limit) query = query.limit(opts.limit);
  const raw = await query.lean();
  // opts.heldBy: the instant by which a lesson must have finished (default
  // the range cutoff); snapshots pass Date.now() so a lesson starting late
  // in the day still counts for that day.
  const heldBy = opts.heldBy ? new Date(opts.heldBy).getTime() : cutoff;
  // A lesson counts as held by the rule in lib/scheduling (isHeldClass):
  // after the close-the-lesson cutover, only when its teacher closed it as
  // taught / student absent, pressed End, or someone joined - never just
  // because its time passed (a teacher no-show is not a student absence).
  const { isHeldClass, closeCutover } = require('./scheduling');
  const cut = closeCutover();
  const needJoin = raw.filter(c => new Date(c.scheduledAt) >= cut && !c.outcome && !(c.status === 'ended' && !c.autoEnded));
  let joined = new Set();
  if (needJoin.length) {
    joined = new Set((await ClassroomSession.distinct('liveClassId', {
      liveClassId: { $in: needJoin.map(c => c._id) }, joinCount: { $gt: 0 },
    })).map(String));
  }
  const held = raw.filter(c => {
    const lapsed = c.status === 'ended' ||
      new Date(c.scheduledAt).getTime() + (c.durationMins || 60) * 60000 < heldBy;
    if (!lapsed && !c.outcome) return false;
    return isHeldClass(c, { joined: joined.has(String(c._id)), now: new Date(heldBy) });
  });
  return markClosureDays(await withoutPausedStudents(held));
}

/**
 * Flag lessons that fall on a school closure day (Nairobi calendar days).
 * The timetable creates none there, but a lesson booked by hand, or one
 * created before the closure was entered, may exist: it counts only for
 * students who came (see lessonCounts).
 */
async function markClosureDays(classes) {
  if (!classes.length) return classes;
  let closed;
  try {
    const SchoolClosure = require('../models/SchoolClosure');
    const { closedDaySet } = require('./scheduling');
    const { zonedDayKey, DEFAULT_TZ } = require('./schoolTime');
    const keys = classes.map(c => zonedDayKey(new Date(c.scheduledAt), DEFAULT_TZ)).sort();
    const closures = await SchoolClosure.find({ start: { $lte: keys[keys.length - 1] }, end: { $gte: keys[0] } }).select('start end').lean();
    if (!closures.length) return classes;
    closed = closedDaySet(closures);
    return classes.map(c => (closed.has(zonedDayKey(new Date(c.scheduledAt), DEFAULT_TZ)) ? { ...c, closureDay: true } : c));
  } catch { return classes; }
}

/**
 * Does this lesson count for this student? Excused lessons never count;
 * lessons on a closure day count only when the student attended.
 */
function lessonCounts(c, s) {
  if (s && s.excused) return false;
  if (c.closureDay && !sessionAttended(s)) return false;
  return true;
}

/**
 * A student on a pause (holiday, break, fee hold…) at the time of a
 * lesson is not expected at it: drop them from that lesson's students so
 * the lesson neither counts as scheduled nor as missed for them.
 */
async function withoutPausedStudents(classes) {
  if (!classes.length) return classes;
  let pauses = [];
  try {
    const StudentPause = require('../models/StudentPause');
    const times = classes.map(c => new Date(c.scheduledAt).getTime());
    const min = new Date(Math.min(...times)), max = new Date(Math.max(...times));
    const ids = [...new Set(classes.flatMap(c => (c.assignedStudents || []).map(String)))];
    pauses = await StudentPause.find({
      student: { $in: ids }, startAt: { $lte: max },
      $or: [{ endedAt: null, expectedEnd: null }, { endedAt: { $gte: min } }, { endedAt: null, expectedEnd: { $gte: min } }],
    }).select('student startAt expectedEnd endedAt status').lean();
    // A break set on the check-in page before it recorded a pause lives
    // only on the user (onBreak, breakStart, breakEnd).
    const onBreak = await User.find({ _id: { $in: ids }, onBreak: true, breakStart: { $ne: null, $lte: max } })
      .select('_id breakStart breakEnd').lean();
    onBreak.forEach(u => pauses.push({ student: u._id, startAt: u.breakStart, expectedEnd: u.breakEnd || null, endedAt: null }));
  } catch { return classes; }
  if (!pauses.length) return classes;
  const byStudent = {};
  for (const p of pauses) (byStudent[String(p.student)] = byStudent[String(p.student)] || []).push(p);
  const pausedAt = (sid, t) => (byStudent[sid] || []).some(p => {
    const end = p.endedAt || p.expectedEnd;
    return new Date(p.startAt).getTime() <= t && (!end || new Date(end).getTime() >= t);
  });
  return classes.map(c => {
    const t = new Date(c.scheduledAt).getTime();
    const kept = (c.assignedStudents || []).filter(u => !pausedAt(String(u), t));
    return kept.length === (c.assignedStudents || []).length ? c : { ...c, assignedStudents: kept };
  });
}

/** Map `${classId}|${userId}` -> session doc for the given classes. */
async function sessionsFor(classes, studentIds) {
  const ids = classes.map(c => c._id);
  if (!ids.length) return new Map();
  const q = { liveClassId: { $in: ids } };
  if (studentIds) q.userId = { $in: studentIds };
  const docs = await ClassroomSession.find(q)
    .select('liveClassId userId present excused excuseNote joinCount firstJoinedAt durationMs markedBy').lean();
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
      const s = sess.get(cid + '|' + uid);
      if (!lessonCounts(c, s)) { perClass[cid].assigned -= 1; return; }
      perStudent[uid] = perStudent[uid] || { scheduled: 0, attended: 0 };
      perStudent[uid].scheduled += 1;
      if (sessionAttended(s)) { perStudent[uid].attended += 1; perClass[cid].attended += 1; }
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
        if (!lessonCounts(c, s)) {
          // opts.allRows: the Dean's oversight view lists uncounted lessons too.
          if (withRows && opts.allRows) get(uid).lessons.push({
            liveClassId: c._id, title: c.title || '', subject: c.subject || '',
            scheduledAt: c.scheduledAt, durationMins: c.durationMins || null,
            attended: false, late: false, joinedAt: null, counted: false,
            excused: !!(s && s.excused), excuseNote: (s && s.excuseNote) || '', closureDay: !!c.closureDay,
            source: s?.markedBy ? 'teacher' : 'session',
          });
          return;
        }
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
          attended, late, joinedAt: s?.firstJoinedAt || null, counted: true,
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
  DEFAULT_CUTOVER, cutoverDate, sessionAttended, lessonCounts, heldLessons, sessionsFor,
  sessionFacts, studentAttendance, oneStudent, rateOf,
};
