const test = require('node:test')
const assert = require('node:assert')
const { buildNextOptions } = require('../src/lib/nextLessonOptions')

const sub = (topicName, name, taught = null) => ({ sub: true, key: `${topicName}||${name}`, name, title: name, topicName, taught })

test('taught subtopics stay in the list, marked; first untaught is next', () => {
  const subtopicPlan = { mode: 'subtopics', all: [
    sub('Principles of Chemistry', 'States of matter', { confirmed: false, at: '2026-10-01T08:00:00Z' }),
    sub('Principles of Chemistry', 'The mole', { confirmed: true, at: '2026-10-08T08:00:00Z' }),
    sub('Inorganic Chemistry', 'Group 1'),
    sub('Inorganic Chemistry', 'Group 7'),
  ] }
  const o = buildNextOptions({ lessonPlan: subtopicPlan, subtopicPlan })
  assert.deepStrictEqual(o.map(x => x.subtopicName), ['States of matter', 'The mole', 'Group 1', 'Group 7'])
  assert.deepStrictEqual(o.map(x => x.state), ['unconfirmed', 'taught', 'next', 'todo'])
  assert.match(o[0].label, /not confirmed/)
  assert.strictEqual(o[0].group, 'Principles of Chemistry')
})

test('lessons plan also offers spine subtopics with no published lesson', () => {
  const lessonPlan = { mode: 'lessons', all: [
    { _id: 'a', key: 'a', title: 'Atoms lesson', topicName: 'Principles of Chemistry', subtopicName: 'Atomic structure', taught: { confirmed: true, at: '2026-10-01' } },
  ] }
  const subtopicPlan = { all: [sub('Principles of Chemistry', 'Atomic structure'), sub('Principles of Chemistry', 'The mole')] }
  const o = buildNextOptions({ lessonPlan, subtopicPlan })
  assert.deepStrictEqual(o.map(x => x.value), ['L:a', 'S:Principles of Chemistry||The mole'])
  assert.match(o[1].label, /no published lesson/)
})
