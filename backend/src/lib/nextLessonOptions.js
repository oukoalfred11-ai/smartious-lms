/**
 * lib/nextLessonOptions.js — the "Next lesson" choices on the
 * end-of-lesson pop-up (GET /api/liveclasses/:id/next).
 *
 * The teacher must be able to choose ANY part of the syllabus, not only
 * what the plan thinks is still to teach. The list used to be the plan's
 * queue alone, so anything counted as taught vanished from it, including
 * subtopics counted taught only because a past class carried them with no
 * teacher record. That left whole sections (e.g. Edexcel Chemistry's
 * Principles of Chemistry) missing, in every subject. Now:
 *
 *   - every item of the plan is offered, grouped by topic, in plan order;
 *   - taught items stay in the list, marked "taught <date>" (confirmed by
 *     the teacher) or "past class <date>, not confirmed";
 *   - the first item still to teach is marked "next in the plan";
 *   - when the plan follows published lessons, spine subtopics that have
 *     no published lesson are offered too, so a gap in the lessons never
 *     hides part of the syllabus.
 */
const day = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Africa/Nairobi' }) : '')
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

function stateNote(taught, isNext) {
  if (isNext) return ' (next in the plan)'
  if (!taught) return ''
  return taught.confirmed ? ` (taught ${day(taught.at)})` : ` (past class ${day(taught.at)}, not confirmed as taught)`
}

/**
 * lessonPlan: loadPlan() result, or null. subtopicPlan: loadSubtopicPlan()
 * result (the spine), or null. Returns [{ value, label, group, state,
 * lessonId? , topicName?, subtopicName? }].
 */
function buildNextOptions({ lessonPlan, subtopicPlan }) {
  const out = []
  const seen = new Set()
  let nextMarked = false
  const push = (o) => { if (!seen.has(o.value)) { seen.add(o.value); out.push(o) } }
  const state = (t) => (!t ? 'todo' : t.confirmed ? 'taught' : 'unconfirmed')

  const lessonItems = lessonPlan && lessonPlan.mode === 'lessons' ? (lessonPlan.all || []) : []
  for (const l of lessonItems) {
    const isNext = !l.taught && !nextMarked
    if (isNext) nextMarked = true
    push({ value: 'L:' + l._id, lessonId: l._id, group: l.topicName || 'Other lessons', state: isNext ? 'next' : state(l.taught),
      label: `${l.title}${stateNote(l.taught, isNext)}` })
  }

  // Spine subtopics: the whole plan in the subtopic dialect, or the ones
  // no published lesson covers when the plan follows lessons.
  const covered = new Set(lessonItems.filter(l => l.subtopicName).map(l => norm(l.topicName) + '|' + norm(l.subtopicName)))
  const subItems = subtopicPlan ? (subtopicPlan.all || []) : []
  for (const x of subItems) {
    if (lessonItems.length && covered.has(norm(x.topicName) + '|' + norm(x.name))) continue
    const isNext = !lessonItems.length && !x.taught && !nextMarked
    if (isNext) nextMarked = true
    push({ value: 'S:' + x.key, topicName: x.topicName || '', subtopicName: x.name, group: x.topicName || 'Syllabus',
      state: isNext ? 'next' : state(x.taught),
      label: `${x.name}${lessonItems.length ? ' (no published lesson yet)' : ''}${stateNote(x.taught, isNext)}` })
  }

  // Keep each topic's items together, topics in first-appearance order.
  const order = []
  const byGroup = new Map()
  for (const o of out) {
    if (!byGroup.has(o.group)) { byGroup.set(o.group, []); order.push(o.group) }
    byGroup.get(o.group).push(o)
  }
  return order.flatMap(g => byGroup.get(g))
}

module.exports = { buildNextOptions }
