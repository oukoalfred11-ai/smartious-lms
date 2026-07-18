/**
 * services/autoTimetable.js
 *
 * Called after every allocation (new or reallocation).
 * On reallocation: deactivates the OLD timetable entry for this
 * student+subject, then creates a fresh one for the new teacher.
 */

const toMins  = h => { if (!h) return 0; const [hh,mm] = h.split(':').map(Number); return hh*60+mm }
const overlaps = (s1,e1,s2,e2) => s1 < e2 && e1 > s2

const DEFAULT_SLOTS = [
  { dayOfWeek:'Mon', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Mon', startTime:'10:00', endTime:'11:00' },
  { dayOfWeek:'Tue', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Tue', startTime:'10:00', endTime:'11:00' },
  { dayOfWeek:'Wed', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Wed', startTime:'10:00', endTime:'11:00' },
  { dayOfWeek:'Thu', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Fri', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Fri', startTime:'10:00', endTime:'11:00' },
]

async function autoGenerateTimetable({ teacherId, studentId, subjectId, createdBy, canBeGrouped = false }) {
  try {
    const User           = require('../models/User')
    const TimetableEntry = require('../models/TimetableEntry')
    const Subject        = require('../models/Subject')

    const [teacher, subject, student] = await Promise.all([
      User.findById(teacherId).select('firstName lastName availability').lean(),
      Subject.findById(subjectId).lean(),
      User.findById(studentId).select('firstName lastName curriculum grade').lean(),
    ])

    if (!teacher) { console.error('[autoTimetable] Teacher not found:', teacherId); return { created: false, reason: 'Teacher not found.' } }
    if (!subject) { console.error('[autoTimetable] Subject not found:', subjectId); return { created: false, reason: 'Subject not found.' } }
    if (!student) { console.error('[autoTimetable] Student not found:', studentId); return { created: false, reason: 'Student not found.' } }

    console.log('[autoTimetable] Starting for', student.firstName, '-', subject.subjectName,
      '| teacher:', teacher.firstName, '| availability:', (teacher.availability || []).length, 'slots')

    // ── Step 1: Deactivate any old timetable entries for this
    //    student+subject (regardless of which teacher they were with).
    //    This handles reallocation cleanly.
    const oldEntries = await TimetableEntry.find({
      assignedStudents: studentId,
      subject: subject.subjectName,
      isActive: true,
    })

    for (const old of oldEntries) {
      if (old.assignedStudents.length === 1) {
        // Only this student — deactivate the whole entry
        old.isActive = false
        await old.save()
        console.log('[autoTimetable] Deactivated old entry:', old._id)
      } else {
        // Group entry — just remove this student from it
        old.assignedStudents = old.assignedStudents.filter(id => String(id) !== String(studentId))
        old.title = subject.subjectName + ' — Group (' + old.assignedStudents.length + ' students)'
        await old.save()
        console.log('[autoTimetable] Removed student from group entry:', old._id)
      }
    }

    // ── Step 2: Try joining an existing groupable entry with new teacher
    if (canBeGrouped) {
      const existingGroup = await TimetableEntry.findOne({
        teacherId, subject: subject.subjectName, isActive: true, canBeGrouped: true,
      })
      if (existingGroup) {
        const alreadyIn = existingGroup.assignedStudents.some(id => String(id) === String(studentId))
        if (!alreadyIn) {
          const studentEntries = await TimetableEntry.find({ assignedStudents: studentId, isActive: true })
            .select('dayOfWeek startTime endTime').lean()
          const clash = studentEntries.some(e =>
            e.dayOfWeek === existingGroup.dayOfWeek &&
            overlaps(toMins(existingGroup.startTime), toMins(existingGroup.endTime), toMins(e.startTime), toMins(e.endTime))
          )
          if (!clash) {
            existingGroup.assignedStudents.push(studentId)
            existingGroup.title = subject.subjectName + ' — Group (' + existingGroup.assignedStudents.length + ' students)'
            await existingGroup.save()
            console.log('[autoTimetable] Added', student.firstName, 'to existing group', existingGroup._id)
            return { created: true, grouped: true, entry: existingGroup, reason: 'Added to existing group class.' }
          }
        }
      }
    }

    // ── Step 3: Find a free slot ──────────────────────────────
    const availability = (teacher.availability && teacher.availability.length > 0)
      ? teacher.availability
      : DEFAULT_SLOTS

    if (!(teacher.availability && teacher.availability.length > 0)) {
      console.log('[autoTimetable] No availability set — using default slots')
    }

    // Load current busy slots for teacher and student
    const [teacherEntries, studentEntries] = await Promise.all([
      TimetableEntry.find({ teacherId, isActive: true }).select('dayOfWeek startTime endTime').lean(),
      TimetableEntry.find({ assignedStudents: studentId, isActive: true }).select('dayOfWeek startTime endTime').lean(),
    ])

    const teacherBusy = {}, studentBusy = {}
    teacherEntries.forEach(e => {
      if (!teacherBusy[e.dayOfWeek]) teacherBusy[e.dayOfWeek] = []
      teacherBusy[e.dayOfWeek].push([toMins(e.startTime), toMins(e.endTime)])
    })
    studentEntries.forEach(e => {
      if (!studentBusy[e.dayOfWeek]) studentBusy[e.dayOfWeek] = []
      studentBusy[e.dayOfWeek].push([toMins(e.startTime), toMins(e.endTime)])
    })

    let chosenSlot = null
    for (const slot of availability) {
      const ss = toMins(slot.startTime), se = toMins(slot.endTime), d = slot.dayOfWeek
      const tBusy = (teacherBusy[d] || []).some(([s,e]) => overlaps(ss, se, s, e))
      const sBusy = (studentBusy[d] || []).some(([s,e]) => overlaps(ss, se, s, e))
      if (!tBusy && !sBusy) { chosenSlot = slot; break }
    }

    if (!chosenSlot) {
      // All default slots are busy — just use Mon 09:00 anyway, admin can adjust
      chosenSlot = DEFAULT_SLOTS[0]
      console.log('[autoTimetable] All slots busy — using Mon 09:00 fallback')
    }

    // ── Step 4: Create the entry ──────────────────────────────
    const title = canBeGrouped
      ? subject.subjectName + ' — Group (1 student)'
      : subject.subjectName + ' — ' + student.firstName + ' ' + student.lastName

    const entry = await TimetableEntry.create({
      title,
      subject:      subject.subjectName,
      curriculum:   subject.curriculum || student.curriculum || '',
      grade:        student.grade || '',
      subjectId,
      dayOfWeek:    chosenSlot.dayOfWeek,
      startTime:    chosenSlot.startTime,
      endTime:      chosenSlot.endTime,
      deliveryMode: 'virtual',
      teacherId,
      assignedStudents: [studentId],
      canBeGrouped:  !!canBeGrouped,
      isActive:      true,
      createdBy,
    })

    console.log('[autoTimetable] ✅ Created', canBeGrouped ? 'group' : '1:1', 'entry', entry._id,
      '—', subject.subjectName, chosenSlot.dayOfWeek, chosenSlot.startTime + '-' + chosenSlot.endTime)

    return { created: true, grouped: false, entry, reason: 'Timetable entry auto-generated.' }

  } catch (err) {
    console.error('[autoTimetable] ❌ Error:', err.message)
    console.error(err.stack)
    return { created: false, reason: 'Auto-timetable error: ' + err.message }
  }
}

module.exports = { autoGenerateTimetable }
