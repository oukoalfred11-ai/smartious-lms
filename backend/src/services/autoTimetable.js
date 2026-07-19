/**
 * services/autoTimetable.js
 *
 * Smartious school schedule rules:
 *   Full-time / centre students: 09:00–15:00 Mon–Thu lessons, Fri assessment/activities
 *   Tuition students:            slots built from teacher availability
 *
 * Lunch break 13:00–14:00 is ALWAYS blocked.
 * On reallocation: deactivates the old entry for this student+subject first.
 */

const FULL_TIME_SLOTS = [
  { dayOfWeek:'Mon', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Mon', startTime:'10:00', endTime:'11:00' },
  { dayOfWeek:'Mon', startTime:'11:00', endTime:'12:00' },
  { dayOfWeek:'Mon', startTime:'12:00', endTime:'13:00' },
  { dayOfWeek:'Mon', startTime:'14:00', endTime:'15:00' },
  { dayOfWeek:'Tue', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Tue', startTime:'10:00', endTime:'11:00' },
  { dayOfWeek:'Tue', startTime:'11:00', endTime:'12:00' },
  { dayOfWeek:'Tue', startTime:'12:00', endTime:'13:00' },
  { dayOfWeek:'Tue', startTime:'14:00', endTime:'15:00' },
  { dayOfWeek:'Wed', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Wed', startTime:'10:00', endTime:'11:00' },
  { dayOfWeek:'Wed', startTime:'11:00', endTime:'12:00' },
  { dayOfWeek:'Wed', startTime:'12:00', endTime:'13:00' },
  { dayOfWeek:'Wed', startTime:'14:00', endTime:'15:00' },
  { dayOfWeek:'Thu', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Thu', startTime:'10:00', endTime:'11:00' },
  { dayOfWeek:'Thu', startTime:'11:00', endTime:'12:00' },
  { dayOfWeek:'Thu', startTime:'12:00', endTime:'13:00' },
  { dayOfWeek:'Thu', startTime:'14:00', endTime:'15:00' },
  { dayOfWeek:'Fri', startTime:'09:00', endTime:'10:00' },  // Friday = assessment/activities
  { dayOfWeek:'Fri', startTime:'10:00', endTime:'11:00' },
  { dayOfWeek:'Fri', startTime:'11:00', endTime:'12:00' },
]

const toMins  = h => { if (!h) return 0; const [hh,mm] = h.split(':').map(Number); return hh*60+mm }
const overlaps = (s1,e1,s2,e2) => s1 < e2 && e1 > s2
const isLunch  = (start,end) => overlaps(toMins(start),toMins(end), 780, 840) // 13:00-14:00

function isFullTime(student) {
  const prog = (student?.programme || student?.deliveryMode || '').toLowerCase()
  return /full.?time|centre|in.?person/.test(prog)
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

    if (!teacher) { console.error('[autoTimetable] Teacher not found:', teacherId); return { created:false, reason:'Teacher not found.' } }
    if (!subject) { console.error('[autoTimetable] Subject not found:', subjectId); return { created:false, reason:'Subject not found.' } }
    if (!student) { console.error('[autoTimetable] Student not found:', studentId); return { created:false, reason:'Student not found.' } }

    console.log('[autoTimetable]', student.firstName, '-', subject.subjectName, '| teacher:', teacher.firstName, '| fullTime:', isFullTime(student))

    // ── Deactivate old entries for this student+subject ────────
    const oldEntries = await TimetableEntry.find({ assignedStudents:studentId, subject:subject.subjectName, isActive:true })
    for (const old of oldEntries) {
      if (old.assignedStudents.length===1) {
        old.isActive = false; await old.save()
        console.log('[autoTimetable] Deactivated old entry:', old._id)
      } else {
        old.assignedStudents = old.assignedStudents.filter(id=>String(id)!==String(studentId))
        await old.save()
      }
    }

    // ── Try joining existing group ──────────────────────────────
    if (canBeGrouped) {
      const existingGroup = await TimetableEntry.findOne({ teacherId, subject:subject.subjectName, isActive:true, canBeGrouped:true })
      if (existingGroup) {
        const alreadyIn = existingGroup.assignedStudents.some(id=>String(id)===String(studentId))
        if (!alreadyIn) {
          const stEntries = await TimetableEntry.find({ assignedStudents:studentId, isActive:true }).select('dayOfWeek startTime endTime').lean()
          const clash = stEntries.some(e=>e.dayOfWeek===existingGroup.dayOfWeek && overlaps(toMins(existingGroup.startTime),toMins(existingGroup.endTime),toMins(e.startTime),toMins(e.endTime)))
          if (!clash && !isLunch(existingGroup.startTime, existingGroup.endTime)) {
            existingGroup.assignedStudents.push(studentId)
            existingGroup.title = subject.subjectName+' — Group ('+existingGroup.assignedStudents.length+' students)'
            await existingGroup.save()
            console.log('[autoTimetable] Added to existing group', existingGroup._id)
            return { created:true, grouped:true, entry:existingGroup }
          }
        }
      }
    }

    // ── Determine available slots ───────────────────────────────
    // Full-time students: use school schedule 09:00-15:00 Mon-Thu + Fri assessment
    // Tuition students:   use teacher availability (their provided timings)
    const studentFullTime = isFullTime(student)
    let availability

    if (studentFullTime) {
      // Full-time: school slots, filtered by teacher availability if teacher has set it
      availability = (teacher.availability && teacher.availability.length > 0)
        ? teacher.availability.filter(s => FULL_TIME_SLOTS.some(f => f.dayOfWeek===s.dayOfWeek && f.startTime===s.startTime))
        : FULL_TIME_SLOTS
      if (availability.length === 0) availability = FULL_TIME_SLOTS
      console.log('[autoTimetable] Full-time mode — using school schedule slots')
    } else {
      // Tuition: use student's provided availability, fall back to teacher availability
      const studentSlots = student.availability && student.availability.length > 0 ? student.availability : null
      availability = studentSlots || (teacher.availability && teacher.availability.length > 0 ? teacher.availability : FULL_TIME_SLOTS)
      console.log('[autoTimetable] Tuition mode — using', studentSlots ? 'student' : teacher.availability?.length > 0 ? 'teacher' : 'default', 'slots')
    }

    // Remove lunch slots
    availability = availability.filter(s => !isLunch(s.startTime, s.endTime))

    // ── Find a free slot ────────────────────────────────────────
    const [teacherEntries, studentEntries] = await Promise.all([
      TimetableEntry.find({ teacherId, isActive:true }).select('dayOfWeek startTime endTime').lean(),
      TimetableEntry.find({ assignedStudents:studentId, isActive:true }).select('dayOfWeek startTime endTime').lean(),
    ])

    const teacherBusy = {}; const studentBusy = {}
    teacherEntries.forEach(e=>{
      if (!teacherBusy[e.dayOfWeek]) teacherBusy[e.dayOfWeek]=[]
      teacherBusy[e.dayOfWeek].push([toMins(e.startTime),toMins(e.endTime)])
    })
    studentEntries.forEach(e=>{
      if (!studentBusy[e.dayOfWeek]) studentBusy[e.dayOfWeek]=[]
      studentBusy[e.dayOfWeek].push([toMins(e.startTime),toMins(e.endTime)])
    })

    let chosen = null
    for (const slot of availability) {
      const ss=toMins(slot.startTime), se=toMins(slot.endTime), d=slot.dayOfWeek
      const tBusy=(teacherBusy[d]||[]).some(([s,e])=>overlaps(ss,se,s,e))
      const sBusy=(studentBusy[d]||[]).some(([s,e])=>overlaps(ss,se,s,e))
      if (!tBusy && !sBusy) { chosen=slot; break }
    }

    if (!chosen) {
      // All slots busy — use first available school slot as fallback
      chosen = studentFullTime ? FULL_TIME_SLOTS[0] : availability[0] || FULL_TIME_SLOTS[0]
      console.log('[autoTimetable] All slots busy — using fallback:', chosen.dayOfWeek, chosen.startTime)
    }

    // ── Create entry ────────────────────────────────────────────
    const isFri    = chosen.dayOfWeek === 'Fri'
    const typeNote = isFri ? ' (Assessment/Activities)' : ''
    const title    = canBeGrouped
      ? subject.subjectName+' — Group (1 student)'
      : subject.subjectName+' — '+student.firstName+' '+student.lastName

    const entry = await TimetableEntry.create({
      title,
      subject:         subject.subjectName,
      curriculum:      subject.curriculum || student.curriculum || '',
      grade:           student.gradeLevel || student.grade || '',
      subjectId,
      dayOfWeek:       chosen.dayOfWeek,
      startTime:       chosen.startTime,
      endTime:         chosen.endTime,
      deliveryMode:    studentFullTime ? 'in-person' : 'virtual',
      teacherId,
      assignedStudents: [studentId],
      canBeGrouped:    !!canBeGrouped,
      isActive:        true,
      createdBy,
    })

    console.log('[autoTimetable] Created entry', entry._id, '-', subject.subjectName, chosen.dayOfWeek, chosen.startTime+'-'+chosen.endTime+typeNote)
    return { created:true, grouped:false, entry, reason:'Timetable entry auto-generated.' }

  } catch(err) {
    console.error('[autoTimetable] Error:', err.message, err.stack)
    return { created:false, reason:'Auto-timetable error: '+err.message }
  }
}

module.exports = { autoGenerateTimetable }
