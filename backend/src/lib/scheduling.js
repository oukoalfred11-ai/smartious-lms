/**
 * lib/scheduling.js — the pure decision logic of lesson scheduling.
 *
 * Everything here is free of database access so it can be unit tested
 * (backend/test/scheduling.test.js). The materializer, the lesson-plan
 * routes and the class reminders call these functions and do the I/O.
 */
const {
  DEFAULT_TZ, resolveTz, zonedParts, zonedTimeToUtc, sameZonedDay,
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
function occurrencesFor(entry, now, horizonDays = HORIZON_DAYS) {
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
function planEntryOccurrences(entry, existing, now) {
  const tz = entryTz(entry);
  const desired = occurrencesFor(entry, now);
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
 * How a family should read a class: 'upcoming', 'held' (it ended or
 * somebody was in the room) or 'not_confirmed' (its time passed with no
 * record that it happened).
 */
function classOutcome(cls, now, heldIds) {
  const when = new Date(cls.scheduledAt || cls.startAt || cls.createdAt);
  const held = cls.status === 'ended' || (heldIds && heldIds.has(String(cls._id)));
  if (held) return 'held';
  if (cls.status === 'live') return 'upcoming';
  return when < now ? 'not_confirmed' : 'upcoming';
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
  classOutcome,
  serialize,
};
