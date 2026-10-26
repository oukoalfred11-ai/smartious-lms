/**
 * audit-lesson-plan.js
 * Read-only: why topics of a subject's spine do not appear in a class's
 * lesson plan. The plan a timetabled class teaches (lib/lessonPlan.js) is
 *   - the subject's PUBLISHED LESSONS when it has any (spine subtopics
 *     with no published lesson then never appear), otherwise
 *   - the spine's subtopics;
 * and anything counted as taught drops out of the queue (before the
 * close-the-lesson cutover, any past class that was not cancelled counts).
 *
 * Usage (Render shell, from backend/):
 *   node audit-lesson-plan.js Chemistry EdexcelIGCSE
 *   node audit-lesson-plan.js "Chemistry" EdexcelIGCSE "Principles"   # focus on topics matching a word
 */
require('dotenv').config()
const mongoose = require('mongoose')

const [subjectArg = 'Chemistry', curriculumArg = '', focusArg = 'Principles'] = process.argv.slice(2)
const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '-')

async function main() {
  if (!process.env.MONGODB_URI) { console.error('MONGODB_URI is not set.'); process.exit(1) }
  await mongoose.connect(process.env.MONGODB_URI)
  const Subject = require('./src/models/Subject')
  const SyllabusTopic = require('./src/models/SyllabusTopic')
  const Lesson = require('./src/models/Lesson')
  const TimetableEntry = require('./src/models/TimetableEntry')
  const LiveClass = require('./src/models/LiveClass')
  const User = require('./src/models/User')
  const { loadPlan } = require('./src/lib/lessonPlan')
  const { taughtFilter } = require('./src/lib/scheduling')
  const focus = new RegExp(focusArg, 'i')

  const subjects = await Subject.find({ subjectName: new RegExp(subjectArg, 'i'), ...(curriculumArg ? { curriculum: curriculumArg } : {}) }).lean()
  if (!subjects.length) { console.log('No subject matches.'); return }
  for (const subject of subjects) {
    console.log(`\n══ ${subject.curriculum} · ${subject.subjectName} (${subject._id}) ══`)
    const topics = await SyllabusTopic.find({ subjectId: subject._id }).sort({ topicOrder: 1 }).lean()
    const topicName = Object.fromEntries(topics.map(t => [String(t._id), t.topic]))
    console.log(`Spine: ${topics.length} topics, ${topics.reduce((n, t) => n + (t.subtopics || []).length, 0)} subtopics`)

    // 1. Published lessons: when there are any, the plan uses ONLY these.
    const lessons = await Lesson.find({ subjectId: subject._id }).select('title status topicRef subtopicName order createdBy').lean()
    const pub = lessons.filter(l => l.status === 'published')
    console.log(`\n1. Lessons: ${lessons.length} (${pub.length} published, ${lessons.length - pub.length} draft/other)`)
    if (pub.length) {
      const byTopic = {}
      for (const l of pub) { const k = topicName[String(l.topicRef)] || '(not linked to a spine topic)'; byTopic[k] = (byTopic[k] || 0) + 1 }
      for (const t of topics) console.log(`   ${t.topic}: ${byTopic[t.topic] || 0} published lesson(s) for ${(t.subtopics || []).length} subtopics`)
      if (byTopic['(not linked to a spine topic)']) console.log(`   (not linked to a spine topic): ${byTopic['(not linked to a spine topic)']}`)
      const focusTopics = topics.filter(t => focus.test(t.topic))
      const gap = focusTopics.filter(t => !byTopic[t.topic])
      if (gap.length) console.log(`   ✗ The plan uses published lessons, and "${gap.map(t => t.topic).join('", "')}" has none: its subtopics never reach the classes. Publish lessons for it, or unpublish the others so the plan follows the spine.`)
    } else console.log('   No published lessons, so class plans follow the spine subtopics.')

    // 2. Each timetabled class (group) for the subject.
    const entries = await TimetableEntry.find({ subjectId: subject._id, isActive: { $ne: false } }).lean()
    console.log(`\n2. Timetabled classes: ${entries.length} active slot(s)`)
    const done = new Set()
    for (const e of entries) {
      const plan = await loadPlan(e)
      const key = plan.members.map(m => String(m._id)).sort().join(',')
      if (done.has(key)) continue
      done.add(key)
      const teacher = await User.findById(e.teacherId).select('firstName lastName').lean()
      const studs = await User.find({ _id: { $in: e.assignedStudents || [] } }).select('firstName lastName gradeLevel').lean()
      console.log(`\n   ▸ ${teacher ? teacher.firstName + ' ' + teacher.lastName : 'no teacher'} · ${studs.map(s => `${s.firstName} ${s.lastName} (${s.gradeLevel || '?'})`).join(', ') || e.audienceGrade || 'no students'} · ${plan.members.length} slot(s)/week`)
      console.log(`     plan mode: ${plan.mode === 'lessons' ? 'PUBLISHED LESSONS' : plan.mode === 'subtopics' ? 'spine subtopics' : 'none (no spine, no lessons)'} · taught ${plan.taught.length} · still to teach ${plan.queue.length}`)
      const label = (x) => x.sub ? `${x.topicName} › ${x.name}` : `${topicName[String(x.topicRef)] || '?'} › ${x.title}`
      const taughtFocus = plan.taught.filter(x => focus.test(label(x)))
      if (taughtFocus.length) {
        console.log(`     counted as TAUGHT (${taughtFocus.length}) from "${focusArg}": ${taughtFocus.slice(0, 8).map(x => (x.name || x.title)).join('; ')}${taughtFocus.length > 8 ? '; …' : ''}`)
        // Which past classes made them "taught", and whether a teacher confirmed it.
        const past = await LiveClass.find({ timetableEntryId: { $in: plan.members.map(m => m._id) }, ...taughtFilter() })
          .select('scheduledAt outcome coverage syllabusTopicName syllabusSubtopicName preparationLessonId').sort({ scheduledAt: 1 }).lean()
        const shown = past.filter(c => focus.test(c.syllabusTopicName || '')).slice(0, 12)
        for (const c of shown) console.log(`       ${day(c.scheduledAt)} ${c.outcome ? 'teacher: ' + c.outcome : 'NO teacher record (counted taught by date)'} · ${c.syllabusSubtopicName || ''}`)
      }
      console.log(`     next up: ${plan.queue.slice(0, 4).map(label).join(' | ') || '(nothing left)'}`)
    }
  }
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
