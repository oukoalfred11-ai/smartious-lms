/**
 * lib/lessonPlan.js — what each slotted class teaches.
 *
 * Shared by the materializer (which stamps new classes) and the
 * lesson-plan routes (which show and reorder the plan and re-stamp the
 * upcoming classes). Both read lessons the same way - PUBLISHED lessons
 * of the subject, topic name resolved from the syllabus - and group
 * entries the same way: teacher + subject + students (scheduling.groupKey).
 */
const TimetableEntry = require('../models/TimetableEntry');
const LiveClass = require('../models/LiveClass');
const Lesson = require('../models/Lesson');
const {
  groupKey, orderLessons, subtopicItems, stampKey, stampFor, taughtFilter, returnedMap, countsAfterReturn,
} = require('./scheduling');

/**
 * The classes that count as having taught each key, minus those a put-back
 * rules out. Returns key → { confirmed, at } (confirmed: the teacher closed
 * a class as taught in full; at: the latest such class).
 */
function taughtKeys(classes, keyOf, members) {
  const ret = returnedMap(members);
  const out = new Map();
  for (const c of classes) {
    const k = keyOf(c);
    if (!k) continue;
    if (ret.has(k) && !countsAfterReturn(c, ret.get(k))) continue;
    const confirmed = c.outcome === 'taught' && c.coverage !== 'partial';
    const was = out.get(k);
    out.set(k, { confirmed: confirmed || !!(was && was.confirmed), at: !was || new Date(c.scheduledAt) > new Date(was.at) ? c.scheduledAt : was.at });
  }
  return out;
}

/** Published lessons of a subject in spine order, each with its topic name. */
async function loadPublishedLessons(subjectId) {
  const lessons = await Lesson.find({ subjectId, status: 'published' })
    .sort({ order: 1 }).select('title topicRef subtopicName order').lean();
  const refs = [...new Set(lessons.map(l => l.topicRef).filter(Boolean).map(String))];
  if (refs.length) {
    const SyllabusTopic = require('../models/SyllabusTopic');
    const topics = await SyllabusTopic.find({ _id: { $in: refs } }).select('topic').lean();
    const name = Object.fromEntries(topics.map(t => [String(t._id), t.topic]));
    lessons.forEach(l => { l.topicName = l.topicRef ? (name[String(l.topicRef)] || '') : ''; });
  }
  return lessons;
}

/** Topic name for one lesson document (lean or hydrated). */
async function topicNameOf(lesson) {
  if (!lesson || !lesson.topicRef) return '';
  const SyllabusTopic = require('../models/SyllabusTopic');
  const t = await SyllabusTopic.findById(lesson.topicRef).select('topic').lean();
  return t ? t.topic : '';
}

/** Active entries that share this entry's scheme of work. */
async function groupEntries(entry) {
  if (!entry.subjectId) return [entry];
  const siblings = await TimetableEntry.find({
    teacherId: entry.teacherId, subjectId: entry.subjectId, isActive: true,
  }).lean();
  const k = groupKey(entry);
  const members = siblings.filter(e => groupKey(e) === k);
  return members.length ? members : [entry];
}

async function loadPlan(entry) {
  const lessons = await loadPublishedLessons(entry.subjectId);
  if (!lessons.length) return loadSubtopicPlan(entry);
  const members = await groupEntries(entry);
  // Taught = closed by the teacher as taught in full (or, before the
  // close-the-lesson cutover, any past lesson that was not cancelled).
  const past = await LiveClass.find({
    timetableEntryId: { $in: members.map(m => m._id) }, preparationLessonId: { $ne: null },
    ...taughtFilter(),
  }).select('preparationLessonId scheduledAt outcome coverage').lean();
  const used = taughtKeys(past, c => String(c.preparationLessonId), members);
  const orderSource = members.find(m => Array.isArray(m.lessonOrder) && m.lessonOrder.length) || entry;
  const ordered = orderLessons(lessons, orderSource.lessonOrder);
  return {
    mode: 'lessons',
    taught: ordered.filter(l => used.has(String(l._id))).map(l => ({ ...l, key: String(l._id), confirmed: used.get(String(l._id)).confirmed, taughtOn: used.get(String(l._id)).at })),
    queue: ordered.filter(l => !used.has(String(l._id))),
    // Every item in plan order with its taught state (null = still to teach).
    all: ordered.map(l => ({ ...l, key: String(l._id), taught: used.get(String(l._id)) || null })),
    members,
  };
}

// Subtopic dialect: the plan is the SyllabusTopic tree; "taught" is
// what the group's past, non-cancelled classes have stamped.
async function loadSubtopicPlan(entry) {
  const SyllabusTopic = require('../models/SyllabusTopic');
  const members = await groupEntries(entry);
  const topics = await SyllabusTopic.find({ subjectId: entry.subjectId }).sort({ topicOrder: 1 }).lean();
  if (!topics.length) return { mode: 'none', taught: [], queue: [], all: [], members };
  const stamped = await LiveClass.find({
    timetableEntryId: { $in: members.map(m => m._id) },
    syllabusSubtopicName: { $nin: [null, ''] },
    ...taughtFilter(),
  }).select('syllabusTopicName syllabusSubtopicName scheduledAt outcome coverage').lean();
  const used = taughtKeys(stamped, x => stampKey(x.syllabusTopicName, x.syllabusSubtopicName), members);
  const os = members.find(m => Array.isArray(m.topicPlanOrder) && m.topicPlanOrder.length);
  const ordered = subtopicItems(topics, os ? os.topicPlanOrder : null);
  return {
    mode: 'subtopics',
    taught: ordered.filter(x => used.has(x.key)).map(x => ({ ...x, confirmed: used.get(x.key).confirmed, taughtOn: used.get(x.key).at })),
    queue: ordered.filter(x => !used.has(x.key)),
    all: ordered.map(x => ({ ...x, taught: used.get(x.key) || null })),
    members,
  };
}

/**
 * Re-stamp the group's upcoming materialized classes to follow the plan.
 * Called from the WRITE paths (reorder, pin, cancel) - never from a read.
 * Pinned classes keep their lesson, and what they hold is taken out of
 * the queue so no other class repeats it.
 */
async function restampFuture(entry) {
  const { queue, members } = await loadPlan(entry);
  const future = await LiveClass.find({
    timetableEntryId: { $in: members.map(m => m._id) }, fromTimetable: true,
    detached: { $ne: true }, status: 'scheduled',
    scheduledAt: { $gt: new Date() },
  }).sort({ scheduledAt: 1 });
  const pinnedLessons = new Set(future.filter(c => c.lessonPinned && c.preparationLessonId).map(c => String(c.preparationLessonId)));
  const pinnedKeys = new Set(future.filter(c => c.lessonPinned && c.syllabusSubtopicName).map(c => stampKey(c.syllabusTopicName, c.syllabusSubtopicName)));
  const free = queue.filter(l => (l.sub ? !pinnedKeys.has(l.key) : !pinnedLessons.has(String(l._id))));
  let i = 0, stamped = 0;
  for (const cls of future) {
    if (cls.lessonPinned) continue;
    const s = stampFor(free[i++] || null);
    const same = String(cls.preparationLessonId || '') === String(s.preparationLessonId || '')
      && (cls.syllabusTopicName || '') === s.syllabusTopicName
      && (cls.syllabusSubtopicName || '') === s.syllabusSubtopicName;
    if (same) continue;
    Object.assign(cls, s);
    await cls.save();
    stamped += 1;
  }
  return stamped;
}

/** restampFuture by entry id, never throwing (for fire-and-forget write paths). */
async function restampForEntryId(entryId) {
  try {
    if (!entryId) return 0;
    const entry = await TimetableEntry.findById(entryId).lean();
    if (!entry || entry.isActive === false || !entry.subjectId) return 0;
    return await restampFuture(entry);
  } catch (e) {
    console.error('[lesson-plan] restamp failed:', e.message);
    return 0;
  }
}

module.exports = {
  taughtKeys,
  loadPublishedLessons, topicNameOf, groupEntries, loadPlan, loadSubtopicPlan,
  restampFuture, restampForEntryId,
};
