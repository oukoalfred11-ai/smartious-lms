import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getExperiment, EXPERIMENTS } from '../experiments/index.js'
import { paramsFor, replay, viewOf, gradeSession } from '../engine.js'

test('setUp records fetched and wrong items in every experiment and changes nothing else', () => {
  for (const def of EXPERIMENTS.slice(0, 8)) {
    const params = paramsFor(def, 's1', {})
    const base = replay(def, params, [])
    const s = replay(def, params, [
      { type: 'setUp', payload: { item: 'beaker_250' } },
      { type: 'setUp', payload: { item: 'measuring_cylinder', wrong: true } },
      { type: 'setUp', payload: { item: 'beaker_250' } },
      { type: 'setUp', payload: { done: true } },
    ])
    const v = viewOf(def, params, s)
    assert.deepEqual(v.setup, { fetched: ['beaker_250'], wrong: ['measuring_cylinder'], done: true }, def.id)
    const { _setup, ...rest } = s
    assert.deepEqual(rest, base, def.id + ': state otherwise unchanged')
    assert.deepEqual(gradeSession(def, { params, state: s }).rows.map(r => r.marks), gradeSession(def, { params, state: base }).rows.map(r => r.marks))
  }
})

test('setUp rejects odd item ids; old sessions have no setup', () => {
  const def = getExperiment('chem-titration')
  const params = paramsFor(def, 's2', {})
  assert.throws(() => replay(def, params, [{ type: 'setUp', payload: { item: '<b>' } }]))
  assert.equal(viewOf(def, params, replay(def, params, [])).setup, undefined)
})
