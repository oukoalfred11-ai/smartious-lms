import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canViewSession, canEditSession, canMarkSession, canAssign, canManageContent, canOpenExperiment, validateMarks } from '../access.js'

const stu = { _id: 's1', role: 'student' }, other = { _id: 's2', role: 'student' }
const teacher = { _id: 't1', role: 'teacher' }, admin = { _id: 'a1', role: 'admin' }, dean = { _id: 'd1', role: 'dos' }
const parent = { _id: 'p1', role: 'parent' }, accountant = { _id: 'x1', role: 'accountant' }
const session = { studentId: 's1', status: 'in_progress' }
const submitted = { studentId: 's1', status: 'submitted' }
const scope = { studentIds: ['s1'] }

test('students see and edit only their own sessions', () => {
  assert.ok(canViewSession(stu, session))
  assert.ok(!canViewSession(other, session))
  assert.ok(canEditSession(stu, session))
  assert.ok(!canEditSession(other, session))
  assert.ok(!canEditSession(stu, submitted), 'no editing after submission')
  assert.ok(canEditSession(stu, { ...submitted, status: 'returned' }), 'returned work can be corrected')
})

test('teachers see and mark only students they teach', () => {
  assert.ok(canViewSession(teacher, session, scope))
  assert.ok(!canViewSession(teacher, session, { studentIds: ['s9'] }))
  assert.ok(canMarkSession(teacher, submitted, scope))
  assert.ok(!canMarkSession(teacher, submitted, { studentIds: [] }))
  assert.ok(!canMarkSession(teacher, session, scope), 'cannot mark work in progress')
  assert.ok(!canEditSession(teacher, session))
})

test('admin and Dean have school-wide access; other staff none', () => {
  assert.ok(canViewSession(admin, session) && canViewSession(dean, session))
  assert.ok(canMarkSession(dean, submitted))
  assert.ok(!canViewSession(accountant, session))
  assert.ok(canManageContent(admin) && canManageContent(dean) && !canManageContent(teacher))
})

test('parents see their child’s submitted work only', () => {
  assert.ok(!canViewSession(parent, session, { childIds: ['s1'] }))
  assert.ok(canViewSession(parent, submitted, { childIds: ['s1'] }))
  assert.ok(!canViewSession(parent, submitted, { childIds: ['s2'] }))
})

test('assignment scope', () => {
  assert.ok(canAssign(teacher, ['s1'], scope))
  assert.ok(!canAssign(teacher, ['s1', 's2'], scope))
  assert.ok(!canAssign(teacher, [], scope))
  assert.ok(canAssign(admin, ['s2']))
  assert.ok(!canAssign(stu, ['s1'], scope))
})

test('publication gates students', () => {
  assert.ok(canOpenExperiment(stu, 'published'))
  assert.ok(!canOpenExperiment(stu, 'draft'))
  assert.ok(!canOpenExperiment(stu, 'review'))
  assert.ok(canOpenExperiment(stu, 'approved', { assigned: true }))
  assert.ok(canOpenExperiment(teacher, 'draft'))
})

test('teacher marks are validated against the rubric', () => {
  const rows = [{ id: 'report', label: 'Report', max: 4 }]
  assert.deepEqual(validateMarks(rows, { report: 3.5 }), [])
  assert.equal(validateMarks(rows, { report: 5 }).length, 1)
  assert.equal(validateMarks(rows, { report: 1.25 }).length, 1)
  assert.equal(validateMarks(rows, { nope: 1 }).length, 1)
})
