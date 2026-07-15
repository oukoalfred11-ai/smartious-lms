/**
 * services/autoTimetable.js
 * ============================================================
 * Auto-generates or updates TimetableEntry records when a
 * teacher is allocated to a student for a subject.
 *
 * Grouping logic:
 *   canBeGrouped=true  → try to merge into an existing class
 *                         that already has other grouped students.
 *                         If no existing group found, create a
 *                         new entry that others can join later.
 *   canBeGrouped=false → always create a dedicated 1-to-1 slot.
 */

const User           = require('../models/User')
const TimetableEntry = require('../models/TimetableEntry')
const Subject        = require('../models/Subject')

const toMins = hhmm => {
  if (!hhmm) return 0
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

const overlaps = (s1, e1, s2, e2) => s1 < e2 && e1 > s2

async function autoGenerateTimetable({ teacherId, studentId, subjectId, createdBy, canBeGrouped = false }) {
  try {
    const [teacher, subject, student] = await Promise.all([
      User.findById(teacherId).select('firstName lastName availability').lean(),
      Subject.findById(subjectId).lean(),
      User.findById(studentId).select('firstName lastName curriculum grade').lean(),
    ])

    if (!teacher) return { created: false, reason: 'Teacher not found.' }
    if (!subject) return { created: false, reason: 'Subject not found.' }
    if (!student) return { created: false, reason: 'Student not found.' }

    const availability = teacher.availability || []
    if (!availability.length) {
      return { created: false, reason: 'Teacher has no availability slots set. Ask them to set availability in the Teacher Portal first.' }
    }

    // Check if this student already has a timetable entry for this subject with this teacher
    const alreadyExists = await TimetableEntry.findOne({
      teacherId, assignedStudents: studentId, subject: subject.subjectName, isActive: true,
    })
    if (alreadyExists) {
      return { created: false, reason: 'Timetable entry already exists.', entry: alreadyExists }
    }

    // ── GROUPING: try to join an existing class ──────────────
    if (canBeGrouped) {
      const existingGroupEntry = await TimetableEntry.findOne({
        teacherId,
        subject: subject.subjectName,
        isActive: true,
        canBeGrouped: true,
      }).sort({ 'assignedStudents.length': 1 }) // prefer smaller groups

      if (existingGroupEntry) {
        // Check student isn't already in it
        const alreadyIn = existingGroupEntry.assignedStudents.some(
          id => String(id) === String(studentId)
        )
        if (!alreadyIn) {
          // Check student has no clash at this time
          const studentEntries = await TimetableEntry.find({ assignedStudents: studentId, isActive: true })
            .select('dayOfWeek startTime endTime').lean()
          const studentBusy = (studentEntries || []).some(e =>
            e.dayOfWeek === existingGroupEntry.dayOfWeek &&
            overlaps(toMins(existingGroupEntry.startTime), toMins(existingGroupEntry.endTime), toMins(e.startTime), toMins(e.endTime))
          )

          if (!studentBusy) {
            existingGroupEntry.assignedStudents.push(studentId)
            existingGroupEntry.title = `${subject.subjectName} — Group (${existingGroupEntry.assignedStudents.length} students)`
            await existingGroupEntry.save()
            console.log('[autoTimetable] Student', student.firstName, 'added to existing group entry', existingGroupEntry._id)
            return { created: true, grouped: true, entry: existingGroupEntry, reason: 'Added to existing group class.' }
          }
        }
      }
    }

    // ── FIND A FREE SLOT ─────────────────────────────────────
    const [teacherEntries, studentEntries] = await Promise.all([
      TimetableEntry.find({ teacherId, isActive: true }).select('dayOfWeek startTime endTime').lean(),
      TimetableEntry.find({ assignedStudents: studentId, isActive: true }).select('dayOfWeek startTime endTime').lean(),
    ])

    const teacherBusy  = {}
    const studentBusy  = {}
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
      const tBusy = (teacherBusy[d] || []).some(([s, e]) => overlaps(ss, se, s, e))
      const sBusy = (studentBusy[d] || []).some(([s, e]) => overlaps(ss, se, s, e))
      if (!tBusy && !sBusy) { chosenSlot = slot; break }
    }

    if (!chosenSlot) {
      return { created: false, reason: 'No free slot found for both teacher and student. Set manually in the Teacher Portal.' }
    }

    const title = canBeGrouped
      ? `${subject.subjectName} — Group (1 student)`
      : `${subject.subjectName} — ${student.firstName} ${student.lastName}`

    const entry = await TimetableEntry.create({
      title,
      subject:     subject.subjectName,
      curriculum:  subject.curriculum || student.curriculum || '',
      grade:       student.grade || '',
      subjectId,
      dayOfWeek:   chosenSlot.dayOfWeek,
      startTime:   chosenSlot.startTime,
      endTime:     chosenSlot.endTime,
      deliveryMode: 'virtual',
      teacherId,
      assignedStudents: [studentId],
      canBeGrouped,
      isActive: true,
      createdBy,
    })

    console.log('[autoTimetable] Created', canBeGrouped ? 'groupable' : '1:1', 'entry', entry._id,
      '—', subject.subjectName, chosenSlot.dayOfWeek, chosenSlot.startTime + '-' + chosenSlot.endTime)

    return { created: true, grouped: false, entry, reason: 'Timetable entry auto-generated.' }

  } catch (err) {
    console.error('[autoTimetable]', err.message)
    return { created: false, reason: 'Auto-timetable error: ' + err.message }
  }
}

module.exports = { autoGenerateTimetable }
