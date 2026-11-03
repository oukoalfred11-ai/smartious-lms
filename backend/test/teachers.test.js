const test = require('node:test')
const assert = require('node:assert')
const { isTeacher, teachersWhere, TEACHERS } = require('../src/lib/teachers')

test('a teacher, or a staff account that also teaches, counts as a teacher', () => {
  assert.strictEqual(isTeacher({ role: 'teacher' }), true)
  assert.strictEqual(isTeacher({ role: 'accountant', additionalRoles: ['teacher'] }), true)
  assert.strictEqual(isTeacher({ role: 'accountant', additionalRoles: ['qa'] }), false)
  assert.strictEqual(isTeacher({ role: 'student' }), false)
  assert.strictEqual(isTeacher(null), false)
})

test('teacher filters keep their own conditions, including an $or', () => {
  assert.deepStrictEqual(teachersWhere({ isActive: true }), { ...TEACHERS, isActive: true })
  const both = teachersWhere({ $or: [{ firstName: 'A' }, { lastName: 'A' }] })
  assert.deepStrictEqual(both, { $and: [TEACHERS, { $or: [{ firstName: 'A' }, { lastName: 'A' }] }] })
})
