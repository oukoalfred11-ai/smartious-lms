/**
 * services/autoTimetable.js
 * ============================================================
 * Chooses a weekly slot when a student is allocated to a teacher.
 *
 * The rule that governs everything here: a CENTRE student is bound by
 * when the building is open; a TUITION student is not. Tuition is
 * mostly online, often to families in the UK, UAE, USA and Canada, and
 * it happens in evenings and at weekends because that is when those
 * families are free. The previous version applied the centre timetable
 * to everyone, so no tuition lesson could ever be placed on a Friday
 * afternoon, a Saturday or a Sunday.
 *
 * What decides a slot, in order:
 *   1. Slots BOTH the teacher and student have declared free
 *   2. Slots one declared, where the other declared nothing
 *   3. A sensible default window for that student type
 * Anything that clashes for either party is discarded, never used.
 *
 * If nothing survives, this returns created:false with a reason. It
 * does NOT fall back to a fixed slot: the previous version did, which
 * silently double-booked whenever a timetable filled up.
 */

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

// ── Centre timetable: when the building is open ──────────────
const CENTRE_DAYS  = ['Mon','Tue','Wed','Thu','Fri']
const CENTRE_START = 9 * 60
const CENTRE_END   = 15 * 60
const LUNCH_START  = 13 * 60
const LUNCH_END    = 14 * 60

// ── Tuition window: every day, morning through evening ───────
// Weekends and evenings are the point. For a family abroad these are
// frequently the only workable hours, so they are first-class options.
const TUITION_START         = 7 * 60    // 07:00
const TUITION_END           = 21 * 60   // last lesson starts 20:00
const TUITION_WEEKEND_START = 8 * 60

const SLOT_MINS = 60

const toMins = h => { if (!h) return 0; const [a,b] = h.split(':').map(Number); return a*60 + b }
const toHHMM = m => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0')
const overlaps = (s1,e1,s2,e2) => s1 < e2 && e1 > s2
const isWeekend = d => d === 'Sat' || d === 'Sun'

/** Centre students are on site; everyone else is tuition. */
function isCentreStudent(student) {
  const s = `${student?.programme || ''} ${student?.deliveryMode || ''}`.toLowerCase()
  if (/tuition|online|virtual|remote/.test(s)) return false
  return /full.?time|centre|center|in.?person|on.?site|day.?school/.test(s)
}

function centreGrid() {
  const out = []
  for (const day of CENTRE_DAYS) {
    for (let t = CENTRE_START; t + SLOT_MINS <= CENTRE_END; t += SLOT_MINS) {
      if (overlaps(t, t + SLOT_MINS, LUNCH_START, LUNCH_END)) continue
      out.push({ dayOfWeek: day, startTime: toHHMM(t), endTime: toHHMM(t + SLOT_MINS) })
    }
  }
  return out
}

/**
 * All seven days, early morning to evening. No lunch exclusion: a
 * 13:00 Saturday lesson is normal, and the old lunch block was a
 * centre rule wrongly applied to everyone.
 */
function tuitionGrid() {
  const out = []
  for (const day of DAYS) {
    const start = isWeekend(day) ? TUITION_WEEKEND_START : TUITION_START
    for (let t = start; t + SLOT_MINS <= TUITION_END; t += SLOT_MINS) {
      out.push({ dayOfWeek: day, startTime: toHHMM(t), endTime: toHHMM(t + SLOT_MINS) })
    }
  }
  return out
}

/** Does a declared availability window cover this whole slot? */
function covered(slot, windows) {
  if (!windows || !windows.length) return false
  const s = toMins(slot.startTime), e = toMins(slot.endTime)
  return windows.some(w => w.dayOfWeek === slot.dayOfWeek
    && toMins(w.startTime) <= s && toMins(w.endTime) >= e)
}

const busyIndex = entries => {
  const idx = {}
  for (const e of entries) {
    (idx[e.dayOfWeek] = idx[e.dayOfWeek] || []).push([toMins(e.startTime), toMins(e.endTime)])
  }
  return idx
}
const clashes = (slot, idx) => (idx[slot.dayOfWeek] || [])
  .some(([s,e]) => overlaps(toMins(slot.startTime), toMins(slot.endTime), s, e))

/**
 * Score a slot; higher is better. Exported so the preference order can
 * be tested without a database.
 *
 * Scoring exists because the old version took the first free slot in a
 * fixed order, so every enrolment tried Monday 09:00 first and
 * early-week mornings filled while later slots stayed empty.
 */
function scoreSlot(slot, ctx) {
  const { teacherWindows, studentWindows, teacherBusy, studentBusy, centre } = ctx
  let score = 0

  const tOK = covered(slot, teacherWindows)
  const sOK = covered(slot, studentWindows)
  if (tOK && sOK) score += 100
  else if (tOK || sOK) score += 40
  else score += 5

  // Keep a teacher's day compact: adjacent to existing teaching beats
  // stranding an hour in the middle of a gap.
  const sameDay = teacherBusy[slot.dayOfWeek] || []
  const s = toMins(slot.startTime), e = toMins(slot.endTime)
  if (sameDay.some(([bs,be]) => be === s || bs === e)) score += 12
  else if (sameDay.length) score += 3

  // Spread a student's subjects across the week.
  score -= (studentBusy[slot.dayOfWeek] || []).length * 8

  if (centre) {
    if (slot.dayOfWeek === 'Fri') score -= 25      // assessment and activities
    if (s < 12 * 60) score += 6                    // mornings for concentration
  } else {
    if (s >= 16 * 60) score += 10                  // after school
    if (isWeekend(slot.dayOfWeek)) score += 8      // weekends are wanted, not tolerated
    // A weekday morning is usually impossible for a student enrolled
    // elsewhere, unless they have explicitly said otherwise.
    if (!isWeekend(slot.dayOfWeek) && s < 14 * 60 && !sOK) score -= 30
  }
  return score
}

async function autoGenerateTimetable({ teacherId, studentId, subjectId, createdBy, canBeGrouped = false }) {
  try {
    const User           = require('../models/User')
    const TimetableEntry = require('../models/TimetableEntry')
    const Subject        = require('../models/Subject')

    const [teacher, subject, student] = await Promise.all([
      User.findById(teacherId).select('firstName lastName availability').lean(),
      Subject.findById(subjectId).lean(),
      User.findById(studentId).select('firstName lastName curriculum grade gradeLevel programme deliveryMode availability').lean(),
    ])
    if (!teacher) return { created:false, reason:'Teacher not found.' }
    if (!subject) return { created:false, reason:'Subject not found.' }
    if (!student) return { created:false, reason:'Student not found.' }

    const centre = isCentreStudent(student)
    console.log(`[autoTimetable] ${student.firstName} · ${subject.subjectName} · teacher ${teacher.firstName} · ${centre ? 'CENTRE' : 'TUITION'}`)

    // ── Release any existing entry for this student and subject ──
    const old = await TimetableEntry.find({ assignedStudents: studentId, subject: subject.subjectName, isActive: true })
    for (const o of old) {
      if (o.assignedStudents.length === 1) { o.isActive = false; await o.save() }
      else {
        o.assignedStudents = o.assignedStudents.filter(id => String(id) !== String(studentId))
        await o.save()
      }
    }

    // ── Join an existing group where allowed ─────────────────────
    if (canBeGrouped) {
      const group = await TimetableEntry.findOne({ teacherId, subject: subject.subjectName, isActive:true, canBeGrouped:true })
      if (group && !group.assignedStudents.some(id => String(id) === String(studentId))) {
        const mine = await TimetableEntry.find({ assignedStudents: studentId, isActive: true })
          .select('dayOfWeek startTime endTime').lean()
        const clash = mine.some(e => e.dayOfWeek === group.dayOfWeek
          && overlaps(toMins(group.startTime), toMins(group.endTime), toMins(e.startTime), toMins(e.endTime)))
        if (!clash) {
          group.assignedStudents.push(studentId)
          group.title = `${subject.subjectName} — Group (${group.assignedStudents.length} students)`
          await group.save()
          console.log('[autoTimetable] joined group', group._id)
          return { created:true, grouped:true, entry:group }
        }
      }
    }

    // ── Candidate slots ──────────────────────────────────────────
    const grid = centre ? centreGrid() : tuitionGrid()

    const [tEntries, sEntries] = await Promise.all([
      TimetableEntry.find({ teacherId, isActive:true }).select('dayOfWeek startTime endTime').lean(),
      TimetableEntry.find({ assignedStudents: studentId, isActive:true }).select('dayOfWeek startTime endTime').lean(),
    ])
    const teacherBusy = busyIndex(tEntries)
    const studentBusy = busyIndex(sEntries)

    const ctx = {
      teacherWindows: teacher.availability || [],
      studentWindows: student.availability || [],
      teacherBusy, studentBusy, centre,
    }

    const free = grid
      .filter(slot => !clashes(slot, teacherBusy) && !clashes(slot, studentBusy))
      .map(slot => ({ slot, score: scoreSlot(slot, ctx) }))
      .sort((a,b) => b.score - a.score)

    if (!free.length) {
      // Deliberately no fallback. The old version dropped the lesson on
      // Monday 09:00 regardless of clashes, double-booking silently.
      const reason = `No free slot for ${student.firstName} in ${subject.subjectName}. `
        + (centre
            ? 'The centre timetable is full for this student or teacher — schedule manually.'
            : 'Teacher and student have no overlapping free hour — widen their availability.')
      console.warn('[autoTimetable]', reason)
      return { created:false, needsManualScheduling:true, reason }
    }

    const chosen = free[0].slot
    const bothDeclared = covered(chosen, ctx.teacherWindows) && covered(chosen, ctx.studentWindows)

    const entry = await TimetableEntry.create({
      title: canBeGrouped
        ? `${subject.subjectName} — Group (1 student)`
        : `${subject.subjectName} — ${student.firstName} ${student.lastName}`,
      subject:    subject.subjectName,
      curriculum: subject.curriculum || student.curriculum || '',
      grade:      student.gradeLevel || student.grade || '',
      subjectId,
      dayOfWeek:  chosen.dayOfWeek,
      startTime:  chosen.startTime,
      endTime:    chosen.endTime,
      deliveryMode: centre ? 'in-person' : 'virtual',
      teacherId,
      assignedStudents: [studentId],
      canBeGrouped: !!canBeGrouped,
      isActive: true,
      createdBy,
    })

    console.log(`[autoTimetable] created ${entry._id} — ${subject.subjectName} ${chosen.dayOfWeek} `
      + `${chosen.startTime}-${chosen.endTime} (score ${free[0].score}${bothDeclared ? ', both declared free' : ''})`)

    return {
      created: true, grouped: false, entry,
      // Where neither party declared the hour, the slot is a reasonable
      // guess rather than an agreed time. Surfacing that lets the UI
      // ask someone to confirm it.
      confident: bothDeclared,
      alternatives: free.slice(1, 4).map(f => ({ ...f.slot, score: f.score })),
      reason: bothDeclared
        ? 'Slot agreed by both teacher and student availability.'
        : 'Slot chosen without a declared availability match — worth confirming.',
    }
  } catch (err) {
    console.error('[autoTimetable] error:', err.message)
    return { created:false, reason:'Auto-timetable error: ' + err.message }
  }
}

module.exports = {
  autoGenerateTimetable,
  scoreSlot, centreGrid, tuitionGrid, isCentreStudent, covered,
}
