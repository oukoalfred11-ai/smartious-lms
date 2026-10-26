const test = require('node:test')
const assert = require('node:assert')
const { classStatus, REJOIN_GRACE_MIN } = require('../src/lib/classWindow')

const now = Date.UTC(2026, 9, 26, 10, 0)
const at = (offMin, status, durationMins = 60) => ({ scheduledAt: new Date(now + offMin * 60000), durationMins, status })

test('a lesson closed or auto-ended early stays joinable until its set end', () => {
  assert.strictEqual(classStatus(at(-20, 'ended'), now), 'live')
  assert.strictEqual(classStatus(at(-20, 'scheduled'), now), 'live')
})

test('rejoin grace after the scheduled end, then ended', () => {
  assert.strictEqual(classStatus(at(-60 - REJOIN_GRACE_MIN + 1, 'ended'), now), 'live')
  assert.strictEqual(classStatus(at(-60 - REJOIN_GRACE_MIN - 1, 'live'), now), 'ended')
})

test('before start: scheduled, unless the teacher started early', () => {
  assert.strictEqual(classStatus(at(5, 'scheduled'), now), 'scheduled')
  assert.strictEqual(classStatus(at(5, 'live'), now), 'live')
})

test('cancelled is never joinable', () => {
  assert.strictEqual(classStatus(at(-10, 'cancelled'), now), 'cancelled')
})
