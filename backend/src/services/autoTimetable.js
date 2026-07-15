/**
 * services/autoTimetable.js
 * Auto-generates TimetableEntry records on student allocation.
 * Uses inline requires so a missing model won't crash on load.
 */

const toMins = h => { if (!h) return 0; const [hh,mm]=h.split(':').map(Number); return hh*60+mm }
const overlaps = (s1,e1,s2,e2) => s1 < e2 && e1 > s2

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

    if (!teacher) return { created: false, reason: 'Teacher not found.' }
    if (!subject) return { created: false, reason: 'Subject not found.' }
    if (!student) return { created: false, reason: 'Student not found.' }

    const availability = teacher.availability || []
    if (!availability.length) {
      return { created: false, reason: 'Teacher has no availability slots set.' }
    }

    // Already timetabled?
    const alreadyExists = await TimetableEntry.findOne({
      teacherId, assignedStudents: studentId,
      subject: subject.subjectName, isActive: true,
    })
    if (alreadyExists) return { created: false, reason: 'Entry already exists.', entry: alreadyExists }

    // Try joining an existing group
    if (canBeGrouped) {
      const existingGroup = await TimetableEntry.findOne({
        teacherId, subject: subject.subjectName,
        isActive: true, canBeGrouped: true,
      })
      if (existingGroup) {
        const alreadyIn = existingGroup.assignedStudents.some(id => String(id) === String(studentId))
        if (!alreadyIn) {
          const studentEntries = await TimetableEntry.find({ assignedStudents: studentId, isActive: true })
            .select('dayOfWeek startTime endTime').lean()
          const clash = (studentEntries || []).some(e =>
            e.dayOfWeek === existingGroup.dayOfWeek &&
            overlaps(toMins(existingGroup.startTime), toMins(existingGroup.endTime), toMins(e.startTime), toMins(e.endTime))
          )
          if (!clash) {
            existingGroup.assignedStudents.push(studentId)
            existingGroup.title = subject.subjectName + ' — Group (' + existingGroup.assignedStudents.length + ' students)'
            await existingGroup.save()
            console.log('[autoTimetable] Added', student.firstName, 'to group entry', existingGroup._id)
            return { created: true, grouped: true, entry: existingGroup, reason: 'Added to existing group class.' }
          }
        }
      }
    }

    // Find a free slot
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
      return { created: false, reason: 'No free slot found. Please set the timetable manually.' }
    }

    const title = canBeGrouped
      ? subject.subjectName + ' — Group (1 student)'
      : subject.subjectName + ' — ' + student.firstName + ' ' + student.lastName

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
      canBeGrouped: !!canBeGrouped,
      isActive: true,
      createdBy,
    })

    console.log('[autoTimetable] Created', canBeGrouped ? 'group' : '1:1', 'entry',
      entry._id, '—', subject.subjectName, chosenSlot.dayOfWeek,
      chosenSlot.startTime + '-' + chosenSlot.endTime)

    return { created: true, grouped: false, entry, reason: 'Timetable entry auto-generated.' }

  } catch (err) {
    console.error('[autoTimetable]', err.message)
    return { created: false, reason: 'Auto-timetable error: ' + err.message }
  }
}

module.exports = { autoGenerateTimetable }
