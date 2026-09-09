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

  const pending = [];   // { entry, when } - created after grouping

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

    // Collect missing instances; lesson assignment happens per
    // SUBJECT GROUP after this loop, so multiple weekly slots of one
    // subject advance a single scheme of work instead of each
    // re-teaching lesson 1.
    for (const when of desired) {
      if (existing.some(x => match(x.scheduledAt, when))) continue;
      if (exceptions.some(x => sameEATDay(x.scheduledAt, when))) continue;
      pending.push({ entry, when });
    }
  }

  // 3. Subject-group lesson assignment + creation, chronologically.
  const groupKey = (e) => e.subjectId
    ? `${e.subjectId}|${(e.assignedStudents || []).map(String).sort().join(',')}`
    : `solo|${e._id}`;
  const activeEntries = entries.filter(e => e.isActive !== false);
  const groups = {};
  activeEntries.forEach(e => { (groups[groupKey(e)] = groups[groupKey(e)] || []).push(e); });
  pending.sort((a, b) => new Date(a.when) - new Date(b.when));

  const queues = {};
  for (const key of Object.keys(groups)) {
    const members = groups[key];
    const lead = members[0];
    if (!lead.subjectId) { queues[key] = []; continue; }
    try {
      const Lesson = require('../models/Lesson');
      const used = await LiveClass.distinct('preparationLessonId', {
        timetableEntryId: { $in: members.map(m => m._id) },
        preparationLessonId: { $ne: null },
      });
      let spineQueue = await Lesson.find({
        subjectId: lead.subjectId,
        _id: { $nin: used },
        isActive: { $ne: false },
      }).sort({ order: 1 }).limit(60).select('title topicName subtopicName').lean();
      // The teacher's custom sequence (any member carrying one) outranks
      // spine order.
      const orderSource = members.find(m => Array.isArray(m.lessonOrder) && m.lessonOrder.length);
      if (orderSource) {
        const rank = {};
        orderSource.lessonOrder.forEach((id, ix) => { rank[String(id)] = ix; });
        spineQueue.sort((a, b) => (rank[String(a._id)] ?? 1e9) - (rank[String(b._id)] ?? 1e9));
      }
      if (!spineQueue.length) {
        // Subtopic dialect: the spine's plan lives as topics/subtopics.
        const SyllabusTopic = require('../models/SyllabusTopic');
        const topics = await SyllabusTopic.find({ subjectId: lead.subjectId }).sort({ topicOrder: 1 }).lean();
        if (topics.length) {
          const stampedPairs = await LiveClass.find({
            timetableEntryId: { $in: members.map(m => m._id) },
            syllabusSubtopicName: { $nin: [null, ''] },
          }).select('syllabusTopicName syllabusSubtopicName').lean();
          const usedKeys = new Set(stampedPairs.map(x => `${x.syllabusTopicName || ''}||${x.syllabusSubtopicName}`));
          let items = [];
          topics.forEach(tp => (tp.subtopics || []).forEach(st => {
            const k = `${tp.topic}||${st.name}`;
            if (!usedKeys.has(k)) items.push({ sub: true, key: k, topicName: tp.topic, name: st.name });
          }));
          const os = members.find(m => Array.isArray(m.topicPlanOrder) && m.topicPlanOrder.length);
          if (os) {
            const rank = {};
            os.topicPlanOrder.forEach((k, ix) => { rank[k] = ix; });
            items.sort((a, b) => (rank[a.key] ?? 1e9) - (rank[b.key] ?? 1e9));
          }
          spineQueue = items.slice(0, 60);
        }
      }
      queues[key] = spineQueue;
    } catch (e) { queues[key] = []; }
  }

  for (const { entry, when } of pending) {
    const nextLesson = (queues[groupKey(entry)] || []).shift() || null;
    try {
      await LiveClass.create({
        preparationLessonId: nextLesson && !nextLesson.sub ? nextLesson._id : null,
        syllabusTopicName: nextLesson ? (nextLesson.topicName || nextLesson.title || '') : '',
        syllabusSubtopicName: nextLesson ? (nextLesson.sub ? nextLesson.name : (nextLesson.subtopicName || '')) : '',
        title: entry.title || `${entry.subject} \u2014 ${entry.grade || 'class'}`.trim(),
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
      console.error(`[timetable] could not materialize "${entry.title || entry.subject}": ${createErr.message}`);
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
