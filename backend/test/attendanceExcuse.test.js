const { test } = require('node:test')
const assert = require('node:assert')
const Module = require('module')
// The pure helpers need no database; stub the models attendanceFacts loads.
const load = Module._load
Module._load = function (req, ...rest) { return /\/models\//.test(req) ? {} : load.call(this, req, ...rest) }
const { lessonCounts, sessionAttended } = require('../src/lib/attendanceFacts')
Module._load = load

test('excused lessons never count; closure-day lessons count only when attended', () => {
  const lesson = { _id: 'a' }, closed = { _id: 'b', closureDay: true }
  assert.equal(lessonCounts(lesson, null), true)
  assert.equal(lessonCounts(lesson, { excused: true, present: false }), false)
  assert.equal(lessonCounts(closed, null), false)
  assert.equal(lessonCounts(closed, { joinCount: 1, present: true }), true)
  assert.equal(lessonCounts(closed, { joinCount: 1, present: false }), false)
  assert.equal(sessionAttended({ joinCount: 0, present: true }), true)
})
