const { test } = require('node:test')
const assert = require('node:assert')
const Module = require('module')
// The rule needs no database; stub the models the module loads.
const load = Module._load
Module._load = function (req, ...rest) { return /\/models\//.test(req) ? {} : load.call(this, req, ...rest) }
const { isPurged, purgeFilter } = require('../src/lib/purgeCheckins')
Module._load = load

const cut = new Date('2026-10-10T00:00:00Z')
const student = 's1', teacher = 't1'
const students = new Set([student])
const before = new Date('2026-10-01T00:00:00Z'), after = new Date('2026-10-15T00:00:00Z')

test('staff check-ins are deleted, whatever the date', () => {
  assert.equal(isPurged({ studentId: teacher, markedBy: teacher, source: 'self', checkedIn: true, date: before }, students, cut), true)
  assert.equal(isPurged({ studentId: teacher, markedBy: teacher, checkedIn: true, date: after }, students, cut), true)
})

test("students' check-ins after the cutover are deleted; before it they are kept as attendance history", () => {
  assert.equal(isPurged({ studentId: student, markedBy: student, source: 'self', date: after }, students, cut), true)
  assert.equal(isPurged({ studentId: student, markedBy: student, source: 'self', date: before }, students, cut), false)
})

test('register marks by staff or from classes are kept, including a check-in a teacher re-marked', () => {
  assert.equal(isPurged({ studentId: student, markedBy: teacher, source: 'staff', date: after }, students, cut), false)
  assert.equal(isPurged({ studentId: student, markedBy: teacher, source: 'class', date: after }, students, cut), false)
  assert.equal(isPurged({ studentId: student, markedBy: teacher, date: after }, students, cut), false)
  assert.equal(isPurged({ studentId: student, markedBy: teacher, source: 'self', checkedIn: true, date: after }, students, cut), false)
})

test('the database filter keeps the same exceptions', () => {
  const f = purgeFilter(['s1'], cut)
  assert.deepEqual(f.$and[1], { $nor: [{ studentId: { $in: ['s1'] }, date: { $lt: cut } }] })
  assert.deepEqual(f.$and[0].$expr, { $eq: ['$markedBy', '$studentId'] })
})
