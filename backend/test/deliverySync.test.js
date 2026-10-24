const { test } = require('node:test')
const assert = require('node:assert')
const Module = require('module')
// The rule needs no database; stub the models the module loads.
const load = Module._load
Module._load = function (req, ...rest) { return /\/models\//.test(req) ? {} : load.call(this, req, ...rest) }
const { wantedMode } = require('../src/lib/deliverySync')
Module._load = load

const S = (deliveryMode) => ({ deliveryMode })
test('all In-person → physical, all Virtual → virtual', () => {
  assert.equal(wantedMode([S('In-person')]), 'physical')
  assert.equal(wantedMode([S('In-person'), S('In-person')]), 'physical')
  assert.equal(wantedMode([S('Virtual'), S(undefined)]), 'virtual')
})
test('Hybrid students and mixed groups are left alone', () => {
  assert.equal(wantedMode([S('Hybrid')]), null)
  assert.equal(wantedMode([S('In-person'), S('Virtual')]), null)
  assert.equal(wantedMode([S('In-person'), S('Hybrid')]), null)
  assert.equal(wantedMode([]), null)
})
