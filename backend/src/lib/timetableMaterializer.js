/**
 * timetableMaterializer.js — the one-system timetabling engine.
 *
 * THE RULE: the timetable dictates classes. A teacher slots a weekly
 * time ONCE; this reconciler continuously guarantees that the next
 * 7 days of real LiveClass instances exist for every active entry.
 * Teach a class and it becomes history; next week's instance is
 * already there. Edit or deactivate the entry and untouched future
 * instances are reconciled away. Manual lesson creation is closed
 * (routes/liveclasses.js) — clubs, events and assemblies stay manual.
 *
 * Reminders read the materialized LiveClass instances (the real
 * lessons, with their one-off moves and cancellations), not the template.
 *
 * Each template-born class records the weekly occurrence it stands for
 * (originalScheduledAt). Moving or cancelling it keeps that occurrence
 * taken, so the reconciler never re-creates it on the original day; a
 * unique index on (timetableEntryId, originalScheduledAt) backs this up
 * against concurrent runs.
 *
 * Idempotent: safe to run any number of times. Protective: it never
 * deletes an instance that has recordings or that any student joined.
 */
const TimetableEntry = require('../models/TimetableEntry');
const LiveClass = require('../models/LiveClass');
const ClassroomSession = require('../models/ClassroomSession');
const {
  occurrencesFor, durationOf, planEntryOccurrences, groupKey,
  buildLessonQueue, buildSubtopicQueue, stampKey, stampFor, serialize, consumesTopicFilter, closedDaySet, returnedMap, countsAfterReturn,
} = require('./scheduling');

const isDuplicateKey = (e) => e && (e.code === 11000 || /E11000/.test(String(e.message || '')));

async function protectedIds(candidateIds) {
  if (!candidateIds.length) return new Set();
  const joined = await ClassroomSession.distinct('liveClassId', {
    liveClassId: { $in: candidateIds }, joinCount: { $gt: 0 },
  });
  return new Set(joined.map(String));
}

// The queue of what a group's next new classes teach: published lessons
// (or syllabus subtopics) not yet given to any NON-CANCELLED class of the
// group. A cancelled class gives its topic back.
async function buildQueue(members) {
  const lead = members[0];
  if (!lead || !lead.subjectId) return [];
  const { loadPublishedLessons } = require('./lessonPlan');
  const memberIds = members.map(m => m._id);
  const lessons = await loadPublishedLessons(lead.subjectId);
  if (lessons.length) {
    const ret = returnedMap(members);
    const used = (await LiveClass.find({
      timetableEntryId: { $in: memberIds },
      preparationLessonId: { $ne: null },
      // Cancelled, not-held, student-absent and partly covered lessons
      // give their topic back.
      ...consumesTopicFilter(),
    }).select('preparationLessonId scheduledAt outcome coverage').lean())
      // A topic the teacher put back counts only by confirmed or later classes.
      .filter(c => { const k = String(c.preparationLessonId); return !ret.has(k) || countsAfterReturn(c, ret.get(k)) })
      .map(c => c.preparationLessonId);
    // The teacher's custom sequence (any member carrying one) outranks spine order.
    const orderSource = members.find(m => Array.isArray(m.lessonOrder) && m.lessonOrder.length);
    return buildLessonQueue({ lessons, usedLessonIds: used, lessonOrder: orderSource && orderSource.lessonOrder });
  }
  // Subtopic dialect: the spine's plan lives as topics/subtopics.
  const SyllabusTopic = require('../models/SyllabusTopic');
  const topics = await SyllabusTopic.find({ subjectId: lead.subjectId }).sort({ topicOrder: 1 }).lean();
  if (!topics.length) return [];
  const stamped = await LiveClass.find({
    timetableEntryId: { $in: memberIds },
    syllabusSubtopicName: { $nin: [null, ''] },
    ...consumesTopicFilter(),
  }).select('syllabusTopicName syllabusSubtopicName scheduledAt outcome coverage').lean();
  const os = members.find(m => Array.isArray(m.topicPlanOrder) && m.topicPlanOrder.length);
  const ret = returnedMap(members);
  return buildSubtopicQueue({
    topics,
    usedKeys: stamped.map(x => stampKey(x.syllabusTopicName, x.syllabusSubtopicName))
      .filter((k, i) => !ret.has(k) || countsAfterReturn(stamped[i], ret.get(k))),
    topicPlanOrder: os && os.topicPlanOrder,
  });
}

async function reconcileOnce() {
  const now = new Date();
  const entries = await TimetableEntry.find({}).lean();
  // School holidays and breaks in the horizon: no lessons on those days.
  let closedDays = new Set();
  try {
    const SchoolClosure = require('../models/SchoolClosure');
    const today = new Date(now.getTime() - 864e5).toISOString().slice(0, 10);
    closedDays = closedDaySet(await SchoolClosure.find({ end: { $gte: today } }).select('start end').lean());
  } catch (e) { console.error('[timetable] closures:', e.message); }
  const activeIds = new Set(entries.filter(e => e.isActive !== false).map(e => String(e._id)));

  let created = 0, removed = 0, moved = 0;

  // 1. Future instances whose entry is gone or deactivated: reconcile away
  //    (unless recorded or attended — those are history, we keep them).
  const strays = await LiveClass.find({
    timetableEntryId: { $ne: null },
    detached: { $ne: true },
    scheduledAt: { $gt: now },
    status: 'scheduled',
    'recordings.0': { $exists: false },
  }).select('timetableEntryId scheduledAt').lean();
  const strayCandidates = strays.filter(c => !activeIds.has(String(c.timetableEntryId)));
  if (strayCandidates.length) {
    const keep = await protectedIds(strayCandidates.map(c => c._id));
    const del = strayCandidates.filter(c => !keep.has(String(c._id))).map(c => c._id);
    if (del.length) {
      const r = await LiveClass.deleteMany({ _id: { $in: del } });
      removed += r.deletedCount;
    }
  }

  const pending = [];   // { entry, when } - created after grouping

  // 2. Per active entry: desired vs existing.
  for (const entry of entries) {
    if (entry.isActive === false) continue;
    // Every instance that sits in the future or stands for a future
    // occurrence - including one moved earlier (perhaps already taught)
    // whose original slot is still ahead.
    const existing = await LiveClass.find({
      timetableEntryId: entry._id,
      $or: [{ scheduledAt: { $gt: now } }, { originalScheduledAt: { $gt: now } }],
    }).select('scheduledAt originalScheduledAt recordings status detached lessonPinned').lean();

    const plan = planEntryOccurrences(entry, existing, now, { closedDays });

    if (plan.remove.length) {
      const keep = await protectedIds(plan.remove);
      const del = plan.remove.filter(id => !keep.has(String(id)));
      if (del.length) {
        const r = await LiveClass.deleteMany({ _id: { $in: del } });
        removed += r.deletedCount;
      }
    }
    // Pinned topics are never discarded by a slot edit: the class is
    // carried to the replacement occurrence, or kept as an exception.
    for (const { id, when } of plan.move) {
      try {
        await LiveClass.updateOne({ _id: id }, { $set: { scheduledAt: when, originalScheduledAt: when, durationMins: durationOf(entry) } });
        moved += 1;
      } catch (e) {
        if (!isDuplicateKey(e)) console.error('[timetable] could not move pinned class:', e.message);
      }
    }
    if (plan.detach.length) {
      await LiveClass.updateMany({ _id: { $in: plan.detach } }, { $set: { detached: true } });
    }
    // Classes made before originalScheduledAt existed learn their slot.
    for (const { id, when } of plan.backfill) {
      try { await LiveClass.updateOne({ _id: id, originalScheduledAt: null }, { $set: { originalScheduledAt: when } }); }
      catch (e) { if (!isDuplicateKey(e)) console.error('[timetable] backfill failed:', e.message); }
    }

    // Lesson assignment happens per GROUP after this loop, so multiple
    // weekly slots of one subject advance a single scheme of work
    // instead of each re-teaching lesson 1.
    for (const when of plan.create) pending.push({ entry, when });
  }

  // 3. Group lesson assignment + creation, chronologically. A group is
  //    teacher + subject + students, exactly as in the lesson-plan view.
  const groups = {};
  entries.filter(e => e.isActive !== false)
    .forEach(e => { (groups[groupKey(e)] = groups[groupKey(e)] || []).push(e); });
  pending.sort((a, b) => new Date(a.when) - new Date(b.when));

  const queues = {};
  for (const key of new Set(pending.map(p => groupKey(p.entry)))) {
    try { queues[key] = await buildQueue(groups[key] || []); }
    catch (e) { queues[key] = []; }
  }

  for (const { entry, when } of pending) {
    const nextLesson = (queues[groupKey(entry)] || []).shift() || null;
    try {
      await LiveClass.create({
        ...stampFor(nextLesson),
        title: entry.title || `${entry.subject} — ${entry.grade || 'class'}`.trim(),
        description: entry.description || '',
        subject: entry.subject || 'Class',
        // curriculum and grade are REQUIRED by the LiveClass model and
        // empty strings fail validation - always send substance.
        curriculum: entry.curriculum || 'General',
        grade: entry.grade || 'All grades',
        teacherId: entry.teacherId,
        assignedStudents: entry.assignedStudents || [],
        scheduledAt: when,
        originalScheduledAt: when,
        durationMins: durationOf(entry),
        classroomMode: 'native',
        deliveryMode: entry.deliveryMode === 'physical' ? 'physical' : 'virtual',
        kind: 'lesson',
        status: 'scheduled',
        fromTimetable: true,
        timetableEntryId: entry._id,
      });
      created += 1;
    } catch (createErr) {
      // A duplicate key means a concurrent run (another process) already
      // made this occurrence - the outcome we wanted. Anything else is one
      // malformed entry, which must never zero the whole run.
      if (isDuplicateKey(createErr)) continue;
      console.error(`[timetable] could not materialize "${entry.title || entry.subject}": ${createErr.message}`);
    }
  }

  // Lessons of teachers on approved leave go to the cover teacher, or are
  // flagged for the Director of Studies to arrange cover.
  try { await require('./leaveCover').applyLeaveCover(); }
  catch (e) { console.error('[timetable] leave cover:', e.message); }

  if (created || removed || moved) {
    console.log(`[timetable] reconciled: ${created} class(es) materialized, ${removed} stale future instance(s) removed, ${moved} pinned class(es) moved`);
  }
  return { created, removed, moved };
}

// Boot, the interval and every timetable/allocation write call this;
// runs never overlap within the process (see scheduling.serialize).
const reconcile = serialize(reconcileOnce);

/** Fire-and-forget reconcile for write paths. */
function reconcileSoon() {
  reconcile().catch(e => console.error('[timetable] reconcile failed:', e.message));
}

function startTimetableMaterializer() {
  reconcileSoon();
  setInterval(reconcileSoon, 3 * 3600 * 1000); // every 3 hours
}

module.exports = { reconcile, reconcileSoon, startTimetableMaterializer, occurrencesFor };
