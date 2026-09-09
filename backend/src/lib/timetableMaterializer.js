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
 * Reminders keep reading TimetableEntry directly, which is now safe:
 * entries and classes can no longer disagree, because classes ARE the
 * entries, materialized.
 *
 * Idempotent: safe to run any number of times. Protective: it never
 * deletes an instance that has recordings or that any student joined.
 */
const TimetableEntry = require('../models/TimetableEntry');
const LiveClass = require('../models/LiveClass');
const ClassroomSession = require('../models/ClassroomSession');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EAT_OFFSET_MS = 3 * 3600 * 1000; // Africa/Nairobi, no DST
const HORIZON_DAYS = 7;

function occurrencesFor(entry, now) {
  // Walk the next HORIZON_DAYS of the Nairobi calendar; each date whose
  // weekday matches the entry yields one UTC Date at startTime EAT.
  const [h, m] = String(entry.startTime || '').split(':').map(Number);
  if (!(h >= 0) || !(m >= 0)) return [];
  const out = [];
  for (let i = 0; i <= HORIZON_DAYS; i++) {
    const eat = new Date(now.getTime() + EAT_OFFSET_MS + i * 864e5);
    if (DAYS[eat.getUTCDay()] !== entry.dayOfWeek) continue;
    const when = new Date(Date.UTC(eat.getUTCFullYear(), eat.getUTCMonth(), eat.getUTCDate(), h, m) - EAT_OFFSET_MS);
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

async function protectedIds(candidateIds) {
  if (!candidateIds.length) return new Set();
  const joined = await ClassroomSession.distinct('liveClassId', {
    liveClassId: { $in: candidateIds }, joinCount: { $gt: 0 },
  });
  return new Set(joined.map(String));
}

async function reconcile() {
  const now = new Date();
  const entries = await TimetableEntry.find({}).lean();
  const activeIds = new Set(entries.filter(e => e.isActive !== false).map(e => String(e._id)));

  let created = 0, removed = 0;

  // 1. Future instances whose entry is gone or deactivated: reconcile away
  //    (unless recorded or attended — those are history, we keep them).
  const strays = await LiveClass.find({
    timetableEntryId: { $ne: null },
    detached: { $ne: true },
    scheduledAt: { $gt: now },
    status: { $in: ['scheduled', 'live'] },
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

  // 2. Per active entry: desired vs existing.
  for (const entry of entries) {
    if (entry.isActive === false) continue;
    const desired = occurrencesFor(entry, now);
    const existing = await LiveClass.find({
      timetableEntryId: entry._id,
      scheduledAt: { $gt: now },
    }).select('scheduledAt recordings status detached').lean();

    // Exceptions: a cancelled or individually-edited (detached) instance
    // OWNS its calendar day. The reconciler never removes it and never
    // creates a sibling on that day - "no class this Tuesday" and
    // "5pm just this week" both stick.
    const sameEATDay = (a, b) => {
      const da = new Date(new Date(a).getTime() + 3 * 3600 * 1000);
      const db = new Date(new Date(b).getTime() + 3 * 3600 * 1000);
      return da.getUTCFullYear() === db.getUTCFullYear() && da.getUTCMonth() === db.getUTCMonth() && da.getUTCDate() === db.getUTCDate();
    };
    const exceptions = existing.filter(x => x.detached === true || x.status === 'cancelled');

    const match = (a, b) => Math.abs(new Date(a) - new Date(b)) < 2 * 60000;

    // Existing future instances that no longer match the (edited) entry.
    const mismatched = existing.filter(x => x.detached !== true && x.status !== 'cancelled' && !desired.some(d => match(x.scheduledAt, d)) && !(x.recordings || []).length);
    if (mismatched.length) {
      const keep = await protectedIds(mismatched.map(c => c._id));
      const del = mismatched.filter(c => !keep.has(String(c._id))).map(c => c._id);
      if (del.length) {
        const r = await LiveClass.deleteMany({ _id: { $in: del } });
        removed += r.deletedCount;
      }
    }

    // Spine progression: if the entry is linked to a subject spine, each
    // newly materialized instance carries the NEXT lesson in spine order
    // that this slot has not yet used - the scheme of work advances
    // automatically, and reminders can announce the topic.
    let spineQueue = [];
    if (entry.subjectId) {
      try {
        const Lesson = require('../models/Lesson');
        const used = await LiveClass.distinct('preparationLessonId', {
          timetableEntryId: entry._id, preparationLessonId: { $ne: null },
        });
        spineQueue = await Lesson.find({
          subjectId: entry.subjectId,
          _id: { $nin: used },
          isActive: { $ne: false },
        }).sort({ order: 1 }).limit(50).select('title topicName subtopicName').lean();
        // Teacher's custom sequence for this slot outranks spine order.
        if (Array.isArray(entry.lessonOrder) && entry.lessonOrder.length) {
          const rank = {};
          entry.lessonOrder.forEach((id, ix) => { rank[String(id)] = ix; });
          spineQueue.sort((a, b) =>
            (rank[String(a._id)] ?? 1e9) - (rank[String(b._id)] ?? 1e9));
        }
        spineQueue = spineQueue.slice(0, 10);
      } catch (e) { /* spine optional */ }
    }

    // Missing instances: create them.
    for (const when of desired) {
      if (existing.some(x => match(x.scheduledAt, when))) continue;
      if (exceptions.some(x => sameEATDay(x.scheduledAt, when))) continue;
      const nextLesson = spineQueue.shift() || null;
      try {
        await LiveClass.create({
          preparationLessonId: nextLesson ? nextLesson._id : null,
          syllabusTopicName: nextLesson ? (nextLesson.topicName || nextLesson.title || '') : '',
          syllabusSubtopicName: nextLesson ? (nextLesson.subtopicName || '') : '',
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
          durationMins: durationOf(entry),
          classroomMode: 'native',
          kind: 'lesson',
          status: 'scheduled',
          fromTimetable: true,
          timetableEntryId: entry._id,
        });
        created += 1;
      } catch (createErr) {
        // One malformed entry must never zero the whole run.
        console.error(`[timetable] could not materialize "${entry.title || entry.subject}" (${entry.dayOfWeek} ${entry.startTime}):`, createErr.message);
      }
    }
  }

  if (created || removed) {
    console.log(`[timetable] reconciled: ${created} class(es) materialized, ${removed} stale future instance(s) removed`);
  }
  return { created, removed };
}

function startTimetableMaterializer() {
  const run = () => reconcile().catch(e => console.error('[timetable] reconcile failed:', e.message));
  run();
  setInterval(run, 3 * 3600 * 1000); // every 3 hours
}

module.exports = { reconcile, startTimetableMaterializer };
