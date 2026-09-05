/**
 * timetableSync.js — shared timetable generation & auto-sync.
 *
 * Used by:
 *   - routes/timetables.js  (create / regenerate)
 *   - routes/lessons.js     (auto-sync hook on lesson add/delete)
 *
 * GENERATION: given a subject's ordered lessons, the weekly slots
 * and a start date, walk the calendar forward assigning one
 * session per lesson, in lesson order, until lessons run out.
 *
 * AUTO-SYNC: when a subject's lesson count changes, every active
 * Timetable for that subject is recomputed — sessions already
 * marked 'delivered' are PRESERVED untouched; only 'pending'
 * sessions are regenerated, flowing the new lesson list into the
 * future of the calendar.
 */

const Timetable = require('../models/Timetable');
const Lesson = require('../models/Lesson');

// ── Build the ordered lesson list for a subject ────────────
async function orderedLessons(subjectId) {
  return Lesson.find({ subjectId })
    .sort({ order: 1, createdAt: 1 })
    .select('_id title order')
    .lean();
}

// ── Calendar walk ──────────────────────────────────────────
// Given weekly slots and a "from" date, yield successive dated
// occurrences (Date objects) in chronological order.
function buildOccurrences(weeklySlots, fromDate, howMany) {
  // Normalise slots: sort within a week by day then time
  const slots = [...(weeklySlots || [])]
    .filter(s => typeof s.dayOfWeek === 'number' && s.time)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.time.localeCompare(b.time));
  if (slots.length === 0 || howMany <= 0) return [];

  const out = [];
  // Start scanning from the day of `fromDate`
  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);

  // Safety bound: never scan more than ~5 years of days
  let guard = 0;
  const MAX_DAYS = 366 * 5;

  while (out.length < howMany && guard < MAX_DAYS) {
    const dow = cursor.getDay();
    // Any slots on this weekday? (could be more than one time)
    const todays = slots.filter(s => s.dayOfWeek === dow)
      .sort((a, b) => a.time.localeCompare(b.time));
    for (const slot of todays) {
      if (out.length >= howMany) break;
      const [hh, mm] = slot.time.split(':').map(n => parseInt(n, 10));
      const d = new Date(cursor);
      d.setHours(hh || 0, mm || 0, 0, 0);
      // Only include occurrences at/after the original fromDate
      if (d >= fromDate) {
        out.push({ date: d, dayOfWeek: slot.dayOfWeek, time: slot.time });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
    guard++;
  }
  return out;
}

// ── Generate a fresh session list ──────────────────────────
// Pure generation from scratch — used when a timetable is first
// created. Produces one session per lesson, all 'pending'.
function generateSessions(lessons, weeklySlots, startDate) {
  const occ = buildOccurrences(weeklySlots, new Date(startDate), lessons.length);
  return lessons.map((les, i) => {
    const o = occ[i];
    return {
      date: o ? o.date : null,
      dayOfWeek: o ? o.dayOfWeek : undefined,
      time: o ? o.time : '',
      lessonId: les._id,
      lessonTitle: les.title || '',
      lessonNumber: i + 1,
      status: 'pending',
    };
  }).filter(s => s.date);  // drop any beyond the 5-year safety bound
}

// ── Recompute a single timetable, preserving delivered ─────
// The core auto-sync operation for one timetable.
//   • 'delivered' sessions are kept EXACTLY as they are.
//   • the remaining lessons (those not already delivered) are
//     re-flowed onto future calendar slots after the last
//     delivered session (or the start date if none delivered).
function recomputeTimetable(tt, lessons) {
  const delivered = (tt.sessions || [])
    .filter(s => s.status === 'delivered')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Which lessons are already delivered? (match by lessonId)
  const deliveredLessonIds = new Set(
    delivered.map(s => String(s.lessonId)).filter(Boolean)
  );

  // Remaining lessons = full ordered list minus delivered ones,
  // keeping lesson order.
  const remaining = lessons.filter(l => !deliveredLessonIds.has(String(l._id)));

  // Future generation starts the day AFTER the last delivered
  // session — or at the timetable's startDate if nothing delivered.
  let from;
  if (delivered.length) {
    from = new Date(delivered[delivered.length - 1].date);
    from.setDate(from.getDate() + 1);
    from.setHours(0, 0, 0, 0);
  } else {
    from = new Date(tt.startDate);
  }

  const occ = buildOccurrences(tt.weeklySlots, from, remaining.length);

  // Build a lookup of existing (non-delivered) sessions by lessonId,
  // so any per-session data already set — deliveryMode, and a
  // liveClassId if a live class was already created — survives the
  // reflow. Only the DATE changes; the link does not.
  const priorByLesson = {};
  ;(tt.sessions || []).forEach(s => {
    if (s.lessonId) priorByLesson[String(s.lessonId)] = s;
  });

  // Future sessions, numbered to continue after the delivered ones
  const baseNumber = delivered.length;
  const futureSessions = remaining.map((les, i) => {
    const o = occ[i];
    const prior = priorByLesson[String(les._id)];
    return {
      date: o ? o.date : null,
      dayOfWeek: o ? o.dayOfWeek : undefined,
      time: o ? o.time : '',
      lessonId: les._id,
      lessonTitle: les.title || '',
      lessonNumber: baseNumber + i + 1,
      status: 'pending',
      deliveryMode: (prior && prior.deliveryMode) || 'virtual',
      liveClassId: (prior && prior.liveClassId) || null,
    };
  }).filter(s => s.date);

  // Renumber delivered sessions 1..N to stay contiguous
  const deliveredRenum = delivered.map((s, i) => ({
    ...(s.toObject ? s.toObject() : s),
    lessonNumber: i + 1,
  }));

  return [...deliveredRenum, ...futureSessions];
}

// ── AUTO-SYNC ENTRY POINT ──────────────────────────────────
// Call after a subject's lesson count changes. Recomputes EVERY
// active timetable for that subject. Best-effort: errors are
// logged, never thrown, so a lesson add/delete is never blocked
// by a timetable problem.
async function syncTimetablesForSubject(subjectId) {
  try {
    const tts = await Timetable.find({ subjectId, isActive: true });
    if (!tts.length) return { synced: 0 };

    const lessons = await orderedLessons(subjectId);

    let synced = 0;
    for (const tt of tts) {
      try {
        tt.sessions = recomputeTimetable(tt, lessons);
        tt.lessonCountAtGen = lessons.length;
        await tt.save();
        synced++;
      } catch (inner) {
        console.error('[timetableSync] one timetable failed', tt._id, inner.message);
      }
    }
    return { synced };
  } catch (e) {
    console.error('[timetableSync] subject sync failed', subjectId, e.message);
    return { synced: 0, error: e.message };
  }
}

// ── ROLL-FORWARD PROMOTION ─────────────────────────────────
// Promote timetable sessions that fall within the next
// `windowDays` days into real LiveClass records, using the
// teacher's default meeting link. A session is promoted at most
// once (guarded by session.liveClassId).
//
// Also reconciles: if a session already linked to a LiveClass
// has had its date shifted (by auto-sync), the LiveClass's
// scheduledAt is updated to match.
async function promoteUpcomingSessions(windowDays = 14) {
  // RULE: auto-created classes caused confusion (teachers received
  // reminders for classes they never scheduled). This function now
  // refuses to create anything unless AUTO_TIMETABLE=on is set
  // explicitly in the environment, no matter who calls it.
  if (String(process.env.AUTO_TIMETABLE || '').toLowerCase() !== 'on') {
    return { skipped: true, reason: 'AUTO_TIMETABLE is off; classes are scheduled manually only.' };
  }
  const LiveClass = require('../models/LiveClass');
  const User = require('../models/User');
  const Lesson = require('../models/Lesson');

  const now = new Date();
  const horizon = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

  let promoted = 0, reconciled = 0;

  try {
    const tts = await Timetable.find({ isActive: true });
    // Cache teacher default links so we don't refetch per session
    const teacherCache = {};

    for (const tt of tts) {
      let dirty = false;
      for (const s of (tt.sessions || [])) {
        if (s.status !== 'pending') continue;
        if (!s.date) continue;
        const sDate = new Date(s.date);

        // ── Reconcile an existing link whose date moved ──
        if (s.liveClassId) {
          try {
            const lc = await LiveClass.findById(s.liveClassId);
            if (lc && Math.abs(new Date(lc.scheduledAt).getTime() - sDate.getTime()) > 60000) {
              lc.scheduledAt = sDate;
              await lc.save();
              reconciled++;
            }
          } catch { /* link broken — fall through to re-promote below */ }
          continue;
        }

        // ── Promote sessions inside the window ──
        if (sDate < now || sDate > horizon) continue;

        // Teacher default meeting link
        let teacher = teacherCache[String(tt.teacherId)];
        if (teacher === undefined) {
          teacher = await User.findById(tt.teacherId).lean();
          teacherCache[String(tt.teacherId)] = teacher || null;
        }
        const link = (teacher && teacher.defaultMeetingLink) || '';

        // LiveClass requires a meetingLink. For physical sessions,
        // or when the teacher has no default link, use a clear
        // placeholder so the record is still valid and visible.
        const meetingLink = link
          || (s.deliveryMode === 'physical' ? 'In-person class' : 'Link to be added');

        try {
          const lesson = s.lessonId ? await Lesson.findById(s.lessonId).lean() : null;
          const lc = await LiveClass.create({
            title: s.lessonTitle || ('Lesson ' + (s.lessonNumber || '')),
            description: '',
            subject: tt.subjectName || 'Subject',
            curriculum: tt.curriculum || '',
            grade: '',
            preparationLessonId: s.lessonId || null,
            scheduledAt: sDate,
            durationMins: 60,
            meetingLink,
            deliveryMode: s.deliveryMode || 'virtual',
            fromTimetable: true,
            teacherId: tt.teacherId,
            assignedStudents: tt.studentId ? [tt.studentId] : [],
          });
          s.liveClassId = lc._id;
          dirty = true;
          promoted++;
        } catch (inner) {
          console.error('[promote] session failed', tt._id, inner.message);
        }
      }
      if (dirty) {
        try { await tt.save(); } catch (e) { console.error('[promote] save failed', tt._id, e.message); }
      }
    }
  } catch (e) {
    console.error('[promote] run failed', e.message);
  }
  return { promoted, reconciled };
}

module.exports = {
  orderedLessons,
  buildOccurrences,
  generateSessions,
  recomputeTimetable,
  syncTimetablesForSubject,
  promoteUpcomingSessions,
};
