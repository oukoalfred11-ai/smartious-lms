/**
 * lib/scheduling.js — the pure decision logic of lesson scheduling.
 *
 * Everything here is free of database access so it can be unit tested
 * (backend/test/scheduling.test.js). The materializer, the lesson-plan
 * routes and the class reminders call these functions and do the I/O.
 */
const {
  DEFAULT_TZ, resolveTz, zonedParts, zonedTimeToUtc, sameZonedDay, zonedDayKey,
} = require('./schoolTime');

const HORIZON_DAYS = 7;
// Two instants closer than this are the same occurrence.
const MATCH_TOLERANCE_MS = 2 * 60000;

// ── Occurrences ───────────────────────────────────────────────

/** The zone a slot's wall-clock times are written in. */
function entryTz(entry) {
  return resolveTz(entry && entry.timezone);
}

/**
 * The future UTC instants (within the horizon) at which a weekly entry
 * meets: walk the next HORIZON_DAYS calendar days of the entry's zone;
 * each day whose weekday matches yields startTime on that day.
 */
function occurrencesFor(entry, now, horizonDays = HORIZON_DAYS, { closedDays = null } = {}) {
  const [h, m] = String(entry.startTime || '').split(':').map(Number);
  if (!(h >= 0) || !(m >= 0)) return [];
  const tz = entryTz(entry);
  const today = zonedParts(now, tz);
  const out = [];
  for (let i = 0; i <= horizonDays; i++) {
    const day = new Date(Date.UTC(today.year, today.month - 1, today.day + i));
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getUTCDay()];
    if (weekday !== entry.dayOfWeek) continue;
    const when = zonedTimeToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), h, m, tz);
    if (when <= now) continue;
    if (entry.effectiveFrom && when < new Date(entry.effectiveFrom)) continue;
    if (entry.effectiveTo && when > new Date(entry.effectiveTo)) continue;
    // School holidays and breaks: no lesson (days are Nairobi calendar days).
    if (closedDays && closedDays.has(zonedDayKey(when, DEFAULT_TZ))) continue;
    out.push(when);
  }
  return out;
}

function durationOf(entry) {
  const [sh, sm] = String(entry.startTime || '').split(':').map(Number);
  const [eh, em] = String(entry.endTime || '').split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return mins > 0 && mins <= 240 ? mins : 60;
}

/**
 * The weekly occurrence a materialized class stands for. A moved or
 * cancelled class keeps its original slot here, so the reconciler knows
 * that occurrence is taken even though the class now sits elsewhere.
 */
function occurrenceOf(cls) {
  return new Date(cls.originalScheduledAt || cls.scheduledAt);
}

const sameOccurrence = (a, b) => Math.abs(new Date(a) - new Date(b)) < MATCH_TOLERANCE_MS;

/** Cancelled or individually edited instances are exceptions the series never overrides. */
const isException = (cls) => cls.detached === true || cls.status === 'cancelled';

/**
 * Decide what the reconciler must do for one active entry.
 *
 * @param entry     the TimetableEntry (lean)
 * @param existing  its LiveClass instances whose scheduledAt OR
 *                  originalScheduledAt is in the future
 * @param now       Date
 * @returns {{
 *   create: Date[],                 occurrences that need a new class
 *   remove: id[],                   unpinned future classes no longer in the series
 *   move:   {id, when}[],           pinned classes carried to the replacement occurrence
 *   detach: id[],                   pinned classes with no replacement: kept as exceptions
 *   backfill: {id, when}[],         classes missing originalScheduledAt
 * }}
 */
function planEntryOccurrences(entry, existing, now, { closedDays = null } = {}) {
  const tz = entryTz(entry);
  const desired = occurrencesFor(entry, now, HORIZON_DAYS, { closedDays });
  const exceptions = existing.filter(isException);
  const regular = existing.filter(x => !isException(x));

  // Classes in the series that no longer match the (edited) entry.
  // Only untouched future classes qualify: never one that is live,
  // ended, recorded or already in the past.
  const mismatched = regular.filter(x =>
    new Date(x.scheduledAt) > now
    && (x.status || 'scheduled') === 'scheduled'
    && !(x.recordings || []).length
    && !desired.some(d => sameOccurrence(occurrenceOf(x), d)));

  // An occurrence is taken when any instance stands for it, including a
  // moved one now sitting on another day or already in the past.
  const covered = (d) => existing.some(x => !mismatched.includes(x) && sameOccurrence(occurrenceOf(x), d));
  // An exception owns its calendar day - both the day it was taken from
  // and the day it was moved to - so no sibling appears beside it.
  const blocked = (d) => exceptions.some(x =>
    sameZonedDay(occurrenceOf(x), d, tz) || sameZonedDay(x.scheduledAt, d, tz));

  const open = desired.filter(d => !covered(d) && !blocked(d)).sort((a, b) => a - b);

  // Pinned topics survive a day/time edit: the k-th pinned class moves
  // to the k-th replacement occurrence. Without a replacement, it is kept
  // as a one-off exception rather than deleted.
  const byOcc = (a, b) => occurrenceOf(a) - occurrenceOf(b);
  const pinned = mismatched.filter(x => x.lessonPinned).sort(byOcc);
  const move = [], detach = [];
  pinned.forEach((x, i) => {
    if (i < open.length) move.push({ id: x._id, when: open[i] });
    else detach.push(x._id);
  });
  const create = open.slice(move.length);
  const remove = mismatched.filter(x => !x.lessonPinned).map(x => x._id);

  const backfill = regular
    .filter(x => !x.originalScheduledAt && !mismatched.includes(x) && desired.some(d => sameOccurrence(x.scheduledAt, d)))
    .map(x => ({ id: x._id, when: new Date(x.scheduledAt) }));

  return { create, remove, move, detach, backfill };
}

// ── Topic queues ──────────────────────────────────────────────

/**
 * Entries that advance ONE scheme of work together: same teacher, same
 * subject, same students. Used by both the materializer and the plan view.
 */
function groupKey(entry) {
  if (!entry.subjectId) return `solo|${entry._id}`;
  const students = (entry.assignedStudents || []).map(String).sort().join(',');
  return `${entry.teacherId}|${entry.subjectId}|${students}`;
}

function rankSort(items, order, keyOf) {
  if (!Array.isArray(order) || !order.length) return [...items];
  const rank = {};
  order.forEach((k, ix) => { rank[String(k)] = ix; });
  return items
    .map((it, ix) => ({ it, ix }))
    .sort((a, b) => ((rank[keyOf(a.it)] ?? 1e9) - (rank[keyOf(b.it)] ?? 1e9)) || (a.ix - b.ix))
    .map(x => x.it);
}

/** Lessons in teach order (teacher's lessonOrder over spine order). */
function orderLessons(lessons, lessonOrder) {
  return rankSort(lessons, lessonOrder, l => String(l._id));
}

/** Subtopic-dialect plan items, in teach order. */
function subtopicItems(topics, topicPlanOrder) {
  const all = [];
  (topics || []).forEach(tp => (tp.subtopics || []).forEach(st => all.push({
    sub: true, key: `${tp.topic}||${st.name}`, title: st.name, name: st.name, topicName: tp.topic,
  })));
  return rankSort(all, topicPlanOrder, x => x.key);
}

const stampKey = (topicName, subtopicName) => `${topicName || ''}||${subtopicName}`;

/**
 * The materializer's queue: published lessons (or subtopics) of the
 * group's subject not yet given to any of its non-cancelled classes.
 */
function buildLessonQueue({ lessons, usedLessonIds, lessonOrder, limit = 60 }) {
  const used = new Set((usedLessonIds || []).map(String));
  return orderLessons(lessons || [], lessonOrder).filter(l => !used.has(String(l._id))).slice(0, limit);
}

function buildSubtopicQueue({ topics, usedKeys, topicPlanOrder, limit = 60 }) {
  const used = new Set(usedKeys || []);
  return subtopicItems(topics, topicPlanOrder).filter(x => !used.has(x.key)).slice(0, limit);
}

/** What a class should carry for a queue item (or null = nothing assigned). */
function stampFor(item) {
  if (!item) return { preparationLessonId: null, syllabusTopicName: '', syllabusSubtopicName: '' };
  if (item.sub) return { preparationLessonId: null, syllabusTopicName: item.topicName || '', syllabusSubtopicName: item.name || '' };
  return {
    preparationLessonId: item._id || null,
    syllabusTopicName: item.topicName || item.title || '',
    syllabusSubtopicName: item.subtopicName || '',
  };
}

// ── Audience ──────────────────────────────────────────────────

/** Entries a student sees: assigned explicitly, or by curriculum+grade audience. */
function studentVisibilityFilter(student) {
  const clauses = [{ assignedStudents: student._id }];
  const curriculum = typeof student.curriculum === 'string' ? student.curriculum : '';
  const grade = typeof student.grade === 'string' ? student.grade : '';
  if (curriculum && grade) clauses.push({ audienceCurriculum: curriculum, audienceGrade: grade });
  return { isActive: true, $or: clauses };
}

// ── Reminders ─────────────────────────────────────────────────

const REMINDER_LEAD_MIN = 30;
const REMINDER_GRACE_MIN = 10;

/**
 * The scheduledAt range whose classes are due a reminder now: starting
 * within the next 30 minutes, but not sooner than 20 (a sweep that ran
 * late still catches up; a class about to start gets no stale notice).
 */
function reminderWindow(now, leadMin = REMINDER_LEAD_MIN, graceMin = REMINDER_GRACE_MIN) {
  const t = new Date(now).getTime();
  return { from: new Date(t + (leadMin - graceMin) * 60000), to: new Date(t + leadMin * 60000 + 30000) };
}

function isReminderDue(cls, now) {
  if (!cls || cls.status !== 'scheduled') return false;
  if (cls.reminderSentAt) return false;
  const { from, to } = reminderWindow(now);
  const at = new Date(cls.scheduledAt);
  return at >= from && at <= to;
}

/** Students who should get a reminder: unique, not on a break or pause, not yet reminded. */
function reminderStudents(cls, { pausedIds = [] } = {}) {
  const done = new Set((cls.remindedRecipients || []).map(String));
  const paused = new Set(pausedIds.map(String));
  const seen = new Set();
  const out = [];
  for (const st of cls.assignedStudents || []) {
    if (!st || !st._id) continue;
    const id = String(st._id);
    if (seen.has(id)) continue;
    seen.add(id);
    if (st.onBreak || paused.has(id) || done.has(id)) continue;
    out.push(st);
  }
  return out;
}

const KIND_LABEL = { lesson: 'Lesson', club: 'Club meeting', competition: 'Competition', event: 'Event', assembly: 'Assembly' };
function classTypeLabel(cls) {
  return KIND_LABEL[cls && cls.kind] || 'Lesson';
}

// ── Outcomes ──────────────────────────────────────────────────

/**
 * From this instant a lesson whose time has passed counts as held only
 * when its teacher closed it (or someone was in the room). Before it,
 * history keeps the old rule (time passed = held), so past reports do
 * not change. Override with LESSON_CLOSE_CUTOVER=YYYY-MM-DD.
 */
// Monday 19 October 2026, 00:00 Nairobi.
const DEFAULT_CLOSE_CUTOVER = '2026-10-18T21:00:00Z';
function closeCutover() {
  const raw = process.env.LESSON_CLOSE_CUTOVER || DEFAULT_CLOSE_CUTOVER;
  const d = new Date(/T/.test(raw) ? raw : raw + 'T00:00:00Z');
  return isNaN(d.getTime()) ? new Date(DEFAULT_CLOSE_CUTOVER) : d;
}

const OUTCOMES = ['taught', 'student_absent', 'not_held'];
const endOf = (cls) => new Date(new Date(cls.scheduledAt).getTime() + (cls.durationMins || 60) * 60000);
const isLegacy = (cls) => new Date(cls.scheduledAt) < closeCutover();

/**
 * Did this lesson take place? `joined` = someone was in the room.
 * Cancelled or "not held" never; closed taught/absent always; before the
 * cutover, when its time passed; after it, when the teacher pressed End
 * or someone joined. Otherwise the lesson is unconfirmed.
 */
function isHeldClass(cls, { joined = false, now = new Date() } = {}) {
  if (!cls || cls.status === 'cancelled' || cls.outcome === 'not_held') return false;
  if (cls.outcome === 'taught' || cls.outcome === 'student_absent') return true;
  if (isLegacy(cls)) return cls.status === 'ended' || endOf(cls) < now;
  if (cls.status === 'ended' && !cls.autoEnded) return true;
  return !!joined;
}

/** Past, not cancelled, not closed, after the cutover: the teacher still has to say what happened. */
function needsClosing(cls, now = new Date()) {
  if (!cls || cls.status === 'cancelled' || cls.outcome) return false;
  if ((cls.kind || 'lesson') !== 'lesson') return false;
  if (isLegacy(cls)) return false;
  return new Date(cls.scheduledAt) <= now;
}

/** Does this class use up its topic in the scheme of work? */
function consumesTopic(cls) {
  if (!cls || cls.status === 'cancelled') return false;
  if (cls.outcome === 'not_held' || cls.outcome === 'student_absent') return false;
  if (cls.coverage === 'partial') return false;
  return true;
}

/** Mongo filter: classes that consume their topic (mirror of consumesTopic). */
function consumesTopicFilter() {
  return {
    status: { $ne: 'cancelled' },
    outcome: { $nin: ['not_held', 'student_absent'] },
    coverage: { $ne: 'partial' },
  };
}

/** Topics the teacher put back in the plan, across a group: key → when (the latest). */
function returnedMap(members) {
  const m = new Map();
  for (const e of members || []) for (const r of e.planReturned || []) {
    const t = new Date(r.at);
    if (r.key && (!m.has(r.key) || m.get(r.key) < t)) m.set(r.key, t);
  }
  return m;
}

/**
 * Whether a class still counts as teaching a topic the teacher put back:
 * only if the teacher confirmed it as taught in full, or it is scheduled
 * after the topic was put back (it was re-planned to teach it).
 */
function countsAfterReturn(cls, at) {
  return (cls.outcome === 'taught' && cls.coverage !== 'partial') || new Date(cls.scheduledAt) >= at;
}

/**
 * Mongo filter: lessons that count as TAUGHT for the plan view. Before
 * the cutover, any past non-cancelled lesson; after it, only lessons the
 * teacher closed as taught with full coverage.
 */
function taughtFilter(now = new Date()) {
  return {
    status: { $ne: 'cancelled' },
    scheduledAt: { $lte: now },
    $or: [
      { scheduledAt: { $lt: closeCutover() }, outcome: { $nin: ['not_held', 'student_absent'] } },
      { outcome: 'taught', coverage: { $ne: 'partial' } },
    ],
  };
}

/**
 * How a family should read a class: 'upcoming', 'held', 'not_held'
 * (the teacher recorded it did not take place) or 'not_confirmed'
 * (its time passed with no record that it happened).
 */
function classOutcome(cls, now, heldIds) {
  if (cls.outcome === 'not_held') return 'not_held';
  if (cls.status === 'live') return 'upcoming';
  const when = new Date(cls.scheduledAt || cls.startAt || cls.createdAt);
  if (when >= now && !cls.outcome) return 'upcoming';
  const joined = !!(heldIds && heldIds.has(String(cls._id)));
  return isHeldClass(cls, { joined, now }) ? 'held' : 'not_confirmed';
}

/** Validate a close-the-lesson request. Returns { error } or { update }. */
function closeUpdate(body, { now = new Date(), userId = null } = {}) {
  const outcome = String(body && body.outcome || '');
  if (!OUTCOMES.includes(outcome)) return { error: 'Choose what happened: taught, student absent, or not held.' };
  const clean = (v, n = 300) => String(v == null ? '' : v).trim().slice(0, n);
  const update = { outcome, outcomeAt: now, outcomeBy: userId, teacherNote: clean(body.note, 1000) };
  if (outcome === 'taught') {
    const coverage = body.coverage === 'partial' ? 'partial' : 'full';
    Object.assign(update, { coverage, coveredTopic: clean(body.topic), coveredSubtopic: clean(body.subtopic), notHeldReason: '' });
  } else if (outcome === 'not_held') {
    const reason = clean(body.reason);
    if (!reason) return { error: 'Say why the lesson did not take place.' };
    Object.assign(update, { coverage: null, notHeldReason: reason });
  } else {
    Object.assign(update, { coverage: null, notHeldReason: '' });
  }
  return { update };
}

// ── Absence alerts ────────────────────────────────────────────

const ABSENCE_ALERT_AFTER_MIN = 10;
const ABSENCE_ALERT_UNTIL_MIN = 40;

/** Is it time to tell families about students who have not joined? */
function absenceAlertDue(cls, now) {
  if (!cls || cls.status === 'cancelled' || cls.outcome === 'not_held') return false;
  if ((cls.kind || 'lesson') !== 'lesson') return false;
  const start = new Date(cls.scheduledAt).getTime();
  const t = new Date(now).getTime();
  return t >= start + ABSENCE_ALERT_AFTER_MIN * 60000 && t <= start + ABSENCE_ALERT_UNTIL_MIN * 60000;
}

/** Students to alert about: assigned, not joined, not paused, not alerted yet. */
function absentStudents(cls, { joinedIds = [], pausedIds = [] } = {}) {
  const joined = new Set(joinedIds.map(String));
  const paused = new Set(pausedIds.map(String));
  const done = new Set((cls.absenceAlerted || []).map(String));
  const seen = new Set();
  const out = [];
  for (const st of cls.assignedStudents || []) {
    const id = String(st && st._id ? st._id : st);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    if (joined.has(id) || paused.has(id) || done.has(id) || (st && st.onBreak)) continue;
    out.push(st);
  }
  return out;
}

/** The set of "YYYY-MM-DD" days covered by closures [{start, end}]. */
function closedDaySet(closures) {
  const out = new Set();
  for (const c of closures || []) {
    if (!c || !c.start) continue;
    const a = new Date(c.start + 'T00:00:00Z'), b = new Date((c.end || c.start) + 'T00:00:00Z');
    for (let d = a, n = 0; d <= b && n < 400; d = new Date(d.getTime() + 864e5), n++) out.add(d.toISOString().slice(0, 10));
  }
  return out;
}

// ── Clashes ───────────────────────────────────────────────────

const minsOf = (hhmm) => { const [h, m] = String(hhmm || '').split(':').map(Number); return h * 60 + m; };

/**
 * Weekly slots in `others` that clash with `entry`: same day, times
 * overlapping, and the same teacher or a shared student.
 * Returns [{ entry, who: 'teacher'|'student', studentIds }].
 */
function findClashes(entry, others) {
  const a0 = minsOf(entry.startTime), a1 = minsOf(entry.endTime);
  if (!(a1 > a0)) return [];
  const mine = new Set((entry.assignedStudents || []).map(String));
  const out = [];
  for (const o of others || []) {
    if (!o || String(o._id) === String(entry._id || '') || o.isActive === false || o.dayOfWeek !== entry.dayOfWeek) continue;
    const b0 = minsOf(o.startTime), b1 = minsOf(o.endTime);
    if (!(a0 < b1 && b0 < a1)) continue;
    if (entry.teacherId && String(o.teacherId) === String(entry.teacherId)) { out.push({ entry: o, who: 'teacher', studentIds: [] }); continue; }
    const shared = (o.assignedStudents || []).map(String).filter(id => mine.has(id));
    if (shared.length) out.push({ entry: o, who: 'student', studentIds: shared });
  }
  return out;
}

// ── Serialisation ─────────────────────────────────────────────

/**
 * Wrap an async job so runs never overlap. A call while a run is in
 * progress waits for one follow-up run (shared by every caller that
 * arrives meanwhile), so a burst of timetable writes costs at most two
 * runs and the last write is always seen.
 */
function serialize(fn) {
  let current = null, next = null;
  const start = () => {
    current = Promise.resolve().then(fn).finally(() => { current = null; });
    return current;
  };
  return function run() {
    if (!current) return start();
    if (!next) {
      next = current.catch(() => {}).then(() => { next = null; return start(); });
    }
    return next;
  };
}

module.exports = {
  DEFAULT_TZ, HORIZON_DAYS,
  entryTz, occurrencesFor, durationOf, occurrenceOf, sameOccurrence, isException,
  planEntryOccurrences,
  groupKey, orderLessons, subtopicItems, stampKey, buildLessonQueue, buildSubtopicQueue, stampFor,
  studentVisibilityFilter,
  REMINDER_LEAD_MIN, reminderWindow, isReminderDue, reminderStudents, classTypeLabel,
  closeCutover, isHeldClass, needsClosing, consumesTopic, consumesTopicFilter, taughtFilter, returnedMap, countsAfterReturn,
  classOutcome, closeUpdate, OUTCOMES,
  ABSENCE_ALERT_AFTER_MIN, absenceAlertDue, absentStudents, findClashes, closedDaySet,
  serialize,
};
