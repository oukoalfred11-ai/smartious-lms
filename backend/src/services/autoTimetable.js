/**
 * services/autoTimetable.js
 * Auto-generates TimetableEntry records on student allocation.
 *
 * If the teacher has no availability set, falls back to a default
 * Mon 09:00-10:00 slot (admin/teacher can adjust it afterwards).
 */

const toMins = h => { if (!h) return 0; const [hh,mm] = h.split(':').map(Number); return hh*60+mm }
const overlaps = (s1,e1,s2,e2) => s1 < e2 && e1 > s2

// Default fallback slots — used when teacher has no availability set
const DEFAULT_SLOTS = [
  { dayOfWeek:'Mon', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Mon', startTime:'10:00', endTime:'11:00' },
  { dayOfWeek:'Tue', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Tue', startTime:'10:00', endTime:'11:00' },
  { dayOfWeek:'Wed', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Thu', startTime:'09:00', endTime:'10:00' },
  { dayOfWeek:'Fri', startTime:'09:00', endTime:'10:00' },
]

async function autoGenerateTimetable({ teacherId, studentId, subjectId, createdBy, canBeGrouped = false }) {
  try {
    const User           = require('../models/User')
    const TimetableEntry = require('../models/TimetableEntry')
    const Subject        = require('../models/Subject')

    // Load all three in parallel
    const [teacher, subject, student] = await Promise.all([
      User.findById(teacherId).select('firstName lastName availability').lean(),
      Subject.findById(subjectId).lean(),
      User.findById(studentId).select('firstName lastName curriculum grade').lean(),
    ])

    if (!teacher) { console.error('[autoTimetable] Teacher not found:', teacherId); return { created: false, reason: 'Teacher not found.' } }
    if (!subject) { console.error('[autoTimetable] Subject not found:', subjectId); return { created: false, reason: 'Subject not found.' } }
    if (!student) { console.error('[autoTimetable] Student not found:', studentId); return { created: false, reason: 'Student not found.' } }

    console.log('[autoTimetable] Starting for', student.firstName, '-', subject.subjectName,
      '| availability slots:', (teacher.availability || []).length,
      '| canBeGrouped:', canBeGrouped)

    // Already timetabled for this student+subject+teacher?
    const alreadyExists = await TimetableEntry.findOne({
      teacherId, assignedStudents: studentId,
      subject: subject.subjectName, isActive: true,
    })
    if (alreadyExists) {
      console.log('[autoTimetable] Entry already exists:', alreadyExists._id)
      return { created: false, reason: 'Entry already exists.', entry: alreadyExists }
    }

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

    // Use teacher's availability or fall back to defaults
    const availability = (teacher.availability && teacher.availability.length > 0)
      ? teacher.availability
      : DEFAULT_SLOTS

    const usingDefaults = !(teacher.availability && teacher.availability.length > 0)
    if (usingDefaults) {
      console.log('[autoTimetable] Teacher has no availability set — using default slots')
    }

    // Load existing entries to detect clashes
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

    // Pick first free slot
    let chosenSlot = null
    for (const slot of availability) {
      const ss = toMins(slot.startTime), se = toMins(slot.endTime), d = slot.dayOfWeek
      const tBusy = (teacherBusy[d] || []).some(([s,e]) => overlaps(ss, se, s, e))
      const sBusy = (studentBusy[d] || []).some(([s,e]) => overlaps(ss, se, s, e))
      if (!tBusy && !sBusy) { chosenSlot = slot; break }
    }

    if (!chosenSlot) {
      console.log('[autoTimetable] No free slot found for', student.firstName, '-', subject.subjectName)
      return { created: false, reason: 'No free slot found. Please set the timetable manually in the Teacher Portal.' }
    }

    const title = canBeGrouped
      ? subject.subjectName + ' — Group (1 student)'
      : subject.subjectName + ' — ' + student.firstName + ' ' + student.lastName

    const entryData = {
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
      isActive: true,
      createdBy,
    }

    // Only add canBeGrouped if the field exists in the model
    try { entryData.canBeGrouped = !!canBeGrouped } catch(e) {}

    const entry = await TimetableEntry.create(entryData)

    console.log('[autoTimetable] Created', canBeGrouped ? 'group' : '1:1', 'entry', entry._id,
      '—', subject.subjectName, chosenSlot.dayOfWeek, chosenSlot.startTime + '-' + chosenSlot.endTime,
      usingDefaults ? '(default slot — teacher should set availability)' : '')

    return { created: true, grouped: false, entry, reason: 'Timetable entry auto-generated.' }

  } catch (err) {
    console.error('[autoTimetable] Error:', err.message, err.stack)
    return { created: false, reason: 'Auto-timetable error: ' + err.message }
  }
}

module.exports = { autoGenerateTimetable }
