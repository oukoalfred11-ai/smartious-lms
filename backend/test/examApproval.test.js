const test = require('node:test')
const assert = require('node:assert')
const { isPublished, initialApproval, needsReverification, PUBLISHED } = require('../src/lib/examApproval')

test('teacher exams wait for the Dean; staff exams publish', () => {
  assert.strictEqual(initialApproval('teacher').status, 'pending')
  for (const r of ['dos', 'ops_manager', 'admin']) assert.strictEqual(initialApproval(r, 'u').status, 'approved')
})

test('only approved exams, or exams from before the rule, reach students', () => {
  assert.strictEqual(isPublished({}), true)
  assert.strictEqual(isPublished({ approval: { status: 'approved' } }), true)
  assert.strictEqual(isPublished({ approval: { status: 'pending' } }), false)
  assert.strictEqual(isPublished({ approval: { status: 'returned' } }), false)
  assert.deepStrictEqual(PUBLISHED['approval.status'].$nin, ['pending', 'returned'])
})

test('a teacher editing an upcoming paper sends it back for verification', () => {
  const later = Date.now() + 86400000, past = Date.now() - 1000
  assert.strictEqual(needsReverification('teacher', { questionIds: [] }, later), true)
  assert.strictEqual(needsReverification('teacher', { status: 'archived' }, later), false)
  assert.strictEqual(needsReverification('teacher', { title: 'x' }, past), false)
  assert.strictEqual(needsReverification('dos', { title: 'x' }, later), false)
})
