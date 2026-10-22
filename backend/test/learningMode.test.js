const test = require('node:test')
const assert = require('node:assert')
const { learningMode, inPersonLesson } = require('../src/lib/learningMode')

test('learningMode reads the three modes', () => {
  assert.strictEqual(learningMode({ deliveryMode: 'Virtual' }), 'virtual')
  assert.strictEqual(learningMode({ deliveryMode: 'In-person' }), 'physical')
  assert.strictEqual(learningMode({ deliveryMode: 'Hybrid' }), 'hybrid')
  assert.strictEqual(learningMode({}), 'virtual')
})

test('in-person lesson: In-person student always; Hybrid by the lesson', () => {
  const online = { deliveryMode: 'virtual' }, centre = { deliveryMode: 'physical' }
  assert.strictEqual(inPersonLesson(online, { deliveryMode: 'In-person' }), true)
  assert.strictEqual(inPersonLesson(online, { deliveryMode: 'Hybrid' }), false)
  assert.strictEqual(inPersonLesson(centre, { deliveryMode: 'Hybrid' }), true)
  assert.strictEqual(inPersonLesson(online, { deliveryMode: 'Virtual' }), false)
})

test('daily timetable: tomorrow is the next Nairobi day, email lists lessons', () => {
  const { tomorrow, buildEmail } = require('../src/lib/dailyTimetable')
  // 21 Oct 2026 19:00 Nairobi = 16:00 UTC
  const t = tomorrow(new Date('2026-10-21T16:00:00Z'))
  assert.strictEqual(t.key, '2026-10-22')
  assert.strictEqual(t.start.toISOString(), '2026-10-21T21:00:00.000Z')
  const st = { firstName: 'Amina', deliveryMode: 'Hybrid' }
  const { subject, html } = buildEmail(st, [
    { subject: 'Biology', scheduledAt: new Date('2026-10-22T06:00:00Z'), deliveryMode: 'physical', status: 'scheduled', teacherId: { firstName: 'Jane', lastName: 'Doe' } },
    { subject: 'Maths', scheduledAt: new Date('2026-10-22T08:00:00Z'), deliveryMode: 'virtual', status: 'cancelled' },
  ], 'Thursday 22 October')
  assert.match(subject, /Tomorrow's timetable — Amina/)
  assert.match(html, /At the centre/)
  assert.match(html, /Cancelled/)
  assert.match(html, /academic office before Thursday 22 October/)
})
