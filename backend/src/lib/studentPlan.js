/**
 * lib/studentPlan.js — one student's lesson plan, per subject.
 *
 * For each scheme of work the student is in (teacher + subject + students,
 * the same grouping the timetable uses), the plan lists every topic in the
 * teacher's order with:
 *   status      done | in_progress | next | planned
 *   taughtAt    when it was taught (closed as taught), and whether the
 *               student attended that lesson
 *   scheduledFor  the upcoming lesson that will teach it, if already planned
 *   confidence  the student's own "got it" / "need help" (TopicConfidence)
 *   mastered    the teacher's mastery mark (LessonProgress, lesson plans)
 */
const TimetableEntry = require('../models/TimetableEntry')
const LiveClass = require('../models/LiveClass')
const ClassroomSession = require('../models/ClassroomSession')
const TopicConfidence = require('../models/TopicConfidence')
const { loadPlan } = require('./lessonPlan')
const { groupKey, stampKey, studentVisibilityFilter, taughtFilter } = require('./scheduling')

const keyOfClass = (c, mode) => (mode === 'lessons'
  ? (c.preparationLessonId ? String(c.preparationLessonId) : null)
  : (c.syllabusSubtopicName ? stampKey(c.syllabusTopicName, c.syllabusSubtopicName) : null))
const keyOfItem = (it) => (it.sub ? it.key : String(it._id))

async function buildStudentPlan(student, now = new Date()) {
  const entries = await TimetableEntry.find(studentVisibilityFilter(student))
    .populate('teacherId', 'firstName lastName').lean()
  const groups = {}
  for (const e of entries) {
    const k = groupKey({ ...e, teacherId: e.teacherId && e.teacherId._id ? e.teacherId._id : e.teacherId })
    ;(groups[k] = groups[k] || []).push(e)
  }

  const subjects = []
  for (const members of Object.values(groups)) {
    const lead = members[0]
    const teacher = lead.teacherId && lead.teacherId.firstName ? `${lead.teacherId.firstName} ${lead.teacherId.lastName || ''}`.trim() : ''
    const slots = members.map(m => ({ day: m.dayOfWeek, start: m.startTime, end: m.endTime }))
    const base = { subject: lead.subject, subjectId: lead.subjectId || null, teacher, slots, entryIds: members.map(m => m._id) }
    if (!lead.subjectId) { subjects.push({ ...base, mode: 'none', items: [], counts: { done: 0, total: 0 } }); continue }

    const planEntry = { ...lead, teacherId: lead.teacherId && lead.teacherId._id ? lead.teacherId._id : lead.teacherId }
    const plan = await loadPlan(planEntry)
    if (plan.mode === 'none') { subjects.push({ ...base, mode: 'none', items: [], counts: { done: 0, total: 0 } }); continue }
    const ids = (plan.members || members).map(m => m._id)

    const [future, taughtClasses, partial] = await Promise.all([
      LiveClass.find({ timetableEntryId: { $in: ids }, status: 'scheduled', scheduledAt: { $gt: now } })
        .sort({ scheduledAt: 1 }).limit(60)
        .select('scheduledAt durationMins preparationLessonId syllabusTopicName syllabusSubtopicName').lean(),
      LiveClass.find({ timetableEntryId: { $in: ids }, ...taughtFilter(now) })
        .sort({ scheduledAt: 1 })
        .select('scheduledAt preparationLessonId syllabusTopicName syllabusSubtopicName recordings').lean(),
      LiveClass.find({ timetableEntryId: { $in: ids }, outcome: 'taught', coverage: 'partial', scheduledAt: { $lte: now } })
        .select('preparationLessonId syllabusTopicName syllabusSubtopicName').lean(),
    ])
    const firstFuture = {}
    for (const c of future) { const k = keyOfClass(c, plan.mode); if (k && !firstFuture[k]) firstFuture[k] = c }
    const taughtBy = {}
    for (const c of taughtClasses) { const k = keyOfClass(c, plan.mode); if (k) taughtBy[k] = c }
    const partialKeys = new Set(partial.map(c => keyOfClass(c, plan.mode)).filter(Boolean))

    const attendedIds = new Set((await ClassroomSession.find({
      liveClassId: { $in: taughtClasses.map(c => c._id) }, userId: student._id,
    }).select('liveClassId joinCount present').lean())
      .filter(s => ((s.joinCount || 0) > 0 || s.present === true) && s.present !== false)
      .map(s => String(s.liveClassId)))

    const confidence = {}
    ;(await TopicConfidence.find({ studentId: student._id, subjectId: lead.subjectId }).lean())
      .forEach(c => { confidence[c.key] = { state: c.state, note: c.note, at: c.updatedAt, resolvedAt: c.resolvedAt } })

    let mastered = new Set()
    if (plan.mode === 'lessons') {
      try {
        const LessonProgress = require('../models/LessonProgress')
        mastered = new Set((await LessonProgress.distinct('lessonId', { studentId: student._id, subjectId: lead.subjectId })).map(String))
      } catch { /* mastery is optional */ }
    }

    const items = []
    let nextGiven = false
    const push = (it, done) => {
      const key = keyOfItem(it)
      const taught = taughtBy[key]
      let status = done ? 'done' : partialKeys.has(key) ? 'in_progress' : 'planned'
      if (!done && !nextGiven) { if (status === 'planned') status = 'next'; nextGiven = true }
      const sched = firstFuture[key]
      items.push({
        key, title: it.sub ? it.name : it.title, topic: it.sub ? it.topicName : (it.topicName || ''),
        lessonId: it.sub ? null : it._id, status,
        taughtAt: taught ? taught.scheduledAt : null,
        attended: taught ? attendedIds.has(String(taught._id)) : null,
        recording: taught && (taught.recordings || []).some(r => r.featured) ? true : false,
        scheduledFor: sched ? sched.scheduledAt : null,
        confidence: confidence[key] || null,
        mastered: !it.sub && mastered.has(String(it._id)),
      })
    }
    plan.taught.forEach(it => push(it, true))
    plan.queue.forEach(it => push(it, false))
    const counts = {
      done: items.filter(i => i.status === 'done').length, total: items.length,
      gotIt: items.filter(i => i.confidence && i.confidence.state === 'got_it').length,
      needHelp: items.filter(i => i.confidence && i.confidence.state === 'need_help' && !i.confidence.resolvedAt).length,
    }
    subjects.push({ ...base, mode: plan.mode, items, counts })
  }
  subjects.sort((a, b) => String(a.subject).localeCompare(String(b.subject)))
  return { subjects }
}

module.exports = { buildStudentPlan }
