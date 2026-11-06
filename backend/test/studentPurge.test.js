const test = require('node:test')
const assert = require('node:assert')
const Module = require('module')

// studentPurge requires models (mongoose is not installed for unit tests);
// stub them so the pure rules can be tested.
const realLoad = Module._load
Module._load = function (req, parent, isMain) {
  if (/(^|\/)models\/User$/.test(req)) return {}
  return realLoad.apply(this, arguments)
}
const { blockReason, parentsToDelete } = require('../src/lib/studentPurge')
Module._load = realLoad

test('only leavers without payments can be deleted', () => {
  assert.match(blockReason(null), /not found/)
  assert.match(blockReason({ hasLeft: false, paid: 0 }), /left or graduated/)
  assert.match(blockReason({ hasLeft: true, paid: 1 }), /paid/)
  assert.strictEqual(blockReason({ hasLeft: true, paid: 0 }), '')
})

test('a parent is deleted only when asked and with no other child', () => {
  const s = 'S1'
  const parents = [{ _id: 'P1', linkedStudents: ['S1'] }, { _id: 'P2', linkedStudents: ['S1', 'S2'] }, { _id: 'P3', children: ['S1'] }]
  assert.deepStrictEqual(parentsToDelete(parents, s, false), [])
  assert.deepStrictEqual(parentsToDelete(parents, s, true).map(p => p._id), ['P1', 'P3'])
})
