/**
 * Pure scheduling logic: time zones, weekly occurrences, the reconciler's
 * decisions (moves, cancellations, pinned topics), topic queues,
 * reminders and class outcomes. Run: node --test backend/test/
 */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const T = require('../src/lib/schoolTime')
const S = require('../src/lib/scheduling')

const iso = (d) => new Date(d).toISOString()

test('Nairobi wall clock converts to UTC with +3h, London follows DST', () => {
  assert.equal(iso(T.zonedTimeToUtc(2026, 10, 20, 16, 0, 'Africa/Nairobi')), '2026-10-20T13:00:00.000Z')
  assert.equal(iso(T.zonedTimeToUtc(2026, 7, 1, 9, 0, 'Europe/London')), '2026-07-01T08:00:00.000Z')
  assert.equal(iso(T.zonedTimeToUtc(2026, 12, 1, 9, 0, 'Europe/London')), '2026-12-01T09:00:00.000Z')
  assert.equal(T.resolveTz('Not/AZone'), 'Africa/Nairobi')
  assert.equal(T.zonedHHMM('2026-10-20T13:00:00Z', 'Africa/Nairobi'), '16:00')
  assert.equal(T.zonedDayKey('2026-10-20T22:30:00Z', 'Africa/Nairobi'), '2026-10-21')
})

// Tuesday 20 Oct 2026, 08:00 Nairobi.
const NOW = new Date('2026-10-20T05:00:00Z')
const entry = { _id: 'e1', dayOfWeek: 'Tue', startTime: '16:00', endTime: '17:00', teacherId: 't1', subjectId: 's1', assignedStudents: ['b', 'a'] }

test('weekly occurrences land on the right days in the entry zone', () => {
  const occ = S.occurrencesFor(entry, NOW)
  assert.deepEqual(occ.map(iso), ['2026-10-20T13:00:00.000Z', '2026-10-27T13:00:00.000Z'])
  assert.equal(S.occurrencesFor({ ...entry, effectiveTo: '2026-10-21' }, NOW).length, 1)
  assert.equal(S.occurrencesFor({ ...entry, startTime: 'bad' }, NOW).length, 0)
  assert.equal(S.durationOf(entry), 60)
  assert.equal(S.durationOf({ startTime: '10:00', endTime: '09:00' }), 60)
})

test('a fresh entry creates every occurrence', () => {
  const p = S.planEntryOccurrences(entry, [], NOW)
  assert.equal(p.create.length, 2)
  assert.deepEqual([p.remove, p.move, p.detach], [[], [], []])
})

test('a lesson moved to another day is NOT re-created on its original day', () => {
  const existing = [
    { _id: 'm', scheduledAt: new Date('2026-10-22T13:00:00Z'), originalScheduledAt: new Date('2026-10-20T13:00:00Z'), detached: true, status: 'scheduled' },
    { _id: 'n', scheduledAt: new Date('2026-10-27T13:00:00Z'), originalScheduledAt: new Date('2026-10-27T13:00:00Z'), status: 'scheduled' },
  ]
  const p = S.planEntryOccurrences(entry, existing, NOW)
  assert.equal(p.create.length, 0)
  assert.equal(p.remove.length, 0)
})

test('a cancelled lesson keeps its occurrence taken', () => {
  const existing = [{ _id: 'c', scheduledAt: new Date('2026-10-20T13:00:00Z'), originalScheduledAt: new Date('2026-10-20T13:00:00Z'), status: 'cancelled', detached: true }]
  const p = S.planEntryOccurrences(entry, existing, NOW)
  assert.deepEqual(p.create.map(iso), ['2026-10-27T13:00:00.000Z'])
})

test('editing the slot moves pinned topics and removes unpinned classes', () => {
  const edited = { ...entry, dayOfWeek: 'Wed' }
  const existing = [
    { _id: 'p', scheduledAt: new Date('2026-10-20T13:00:00Z'), originalScheduledAt: new Date('2026-10-20T13:00:00Z'), status: 'scheduled', lessonPinned: true },
    { _id: 'u', scheduledAt: new Date('2026-10-27T13:00:00Z'), originalScheduledAt: new Date('2026-10-27T13:00:00Z'), status: 'scheduled' },
  ]
  const p = S.planEntryOccurrences(edited, existing, NOW)
  assert.deepEqual(p.move.map(m => [m.id, iso(m.when)]), [['p', '2026-10-21T13:00:00.000Z']])
  assert.deepEqual(p.remove, ['u'])
  assert.equal(p.create.length, 0)  // 21 Oct taken by the moved pin; 28 Oct is beyond the 7-day horizon
})

test('classes made before originalScheduledAt existed are backfilled, not duplicated', () => {
  const existing = [{ _id: 'o', scheduledAt: new Date('2026-10-20T13:01:00Z'), status: 'scheduled' }]
  const p = S.planEntryOccurrences(entry, existing, NOW)
  assert.deepEqual(p.backfill.map(b => b.id), ['o'])
  assert.equal(p.create.length, 1)
})

test('topic queues: one scheme per teacher + subject + students; used and drafts skipped', () => {
  assert.equal(S.groupKey(entry), 't1|s1|a,b')
  assert.notEqual(S.groupKey(entry), S.groupKey({ ...entry, teacherId: 't2' }))
  const lessons = [{ _id: 'L1' }, { _id: 'L2' }, { _id: 'L3' }]
  assert.deepEqual(S.buildLessonQueue({ lessons, usedLessonIds: ['L1'], lessonOrder: ['L3'] }).map(l => l._id), ['L3', 'L2'])
  const topics = [{ topic: 'Algebra', subtopics: [{ name: 'Expand' }, { name: 'Factorise' }] }]
  assert.deepEqual(S.buildSubtopicQueue({ topics, usedKeys: ['Algebra||Expand'] }).map(x => x.name), ['Factorise'])
  assert.deepEqual(S.stampFor(null), { preparationLessonId: null, syllabusTopicName: '', syllabusSubtopicName: '' })
})

test('reminders: due once, from the real class, skipping paused and reminded students', () => {
  const now = new Date('2026-10-20T12:30:00Z')
  assert.ok(S.isReminderDue({ status: 'scheduled', scheduledAt: '2026-10-20T13:00:00Z' }, now))
  assert.ok(!S.isReminderDue({ status: 'cancelled', scheduledAt: '2026-10-20T13:00:00Z' }, now))
  assert.ok(!S.isReminderDue({ status: 'scheduled', scheduledAt: '2026-10-20T13:00:00Z', reminderSentAt: now }, now))
  assert.ok(!S.isReminderDue({ status: 'scheduled', scheduledAt: '2026-10-20T14:00:00Z' }, now))
  const cls = { assignedStudents: [{ _id: 'a' }, { _id: 'a' }, { _id: 'b', onBreak: true }, { _id: 'c' }, { _id: 'd' }], remindedRecipients: ['c'] }
  assert.deepEqual(S.reminderStudents(cls, { pausedIds: ['d'] }).map(s => s._id), ['a'])
  assert.equal(S.classTypeLabel({ kind: 'club' }), 'Club meeting')
  assert.equal(S.classTypeLabel({}), 'Lesson')
})

test('a past class is held only when it ended or someone attended', () => {
  const now = new Date('2026-10-21T00:00:00Z')
  const past = { _id: 'x', scheduledAt: '2026-10-20T13:00:00Z', status: 'scheduled' }
  assert.equal(S.classOutcome(past, now, new Set()), 'not_confirmed')
  assert.equal(S.classOutcome(past, now, new Set(['x'])), 'held')
  assert.equal(S.classOutcome({ ...past, status: 'ended' }, now, new Set()), 'held')
  assert.equal(S.classOutcome({ ...past, scheduledAt: '2026-10-22T13:00:00Z' }, now, new Set()), 'upcoming')
})

test('serialize: runs never overlap and a burst costs at most one extra run', async () => {
  let running = 0, max = 0, runs = 0
  const job = S.serialize(async () => { running++; runs++; max = Math.max(max, running); await new Promise(r => setTimeout(r, 10)); running-- })
  await Promise.all([job(), job(), job(), job()])
  assert.equal(max, 1)
  assert.equal(runs, 2)
})

test('student visibility includes grade-wide audiences', () => {
  const f = S.studentVisibilityFilter({ _id: 'st', curriculum: 'IGCSE', grade: 'Year 10' })
  assert.equal(f.$or.length, 2)
  assert.equal(S.studentVisibilityFilter({ _id: 'st' }).$or.length, 1)
})
