// Plays every measurement practical as a careful student would and checks
// that the model, the instruments, the tolerances and the grading agree:
// a careful student must get every automatic mark, on several seeds.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PHYSICS_AL } from '../experiments/physics-al/index.js'
import { paramsFor, applyAction, replay, gradeSession, validateDefinition } from '../engine.js'
import { APPARATUS } from '../apparatus.js'
import { carefulRun } from './careful.js'

test('every AS & A Level physics practical definition is valid', () => {
  const ids = new Set()
  for (const d of PHYSICS_AL) {
    assert.deepEqual(validateDefinition(d), [], d.id)
    assert.ok(!ids.has(d.id), 'duplicate id ' + d.id); ids.add(d.id)
    for (const a of d.apparatus) assert.ok(APPARATUS[a], d.id + ': apparatus ' + a)
    for (const r of [...d.practical.constants, ...d.practical.measures]) if (r.instrument) assert.ok(d.apparatus.includes(r.instrument), d.id + ': ' + r.key + ' uses ' + r.instrument + ' which is not in the apparatus list')
    assert.ok(d.procedure.length >= 3, d.id + ': procedure')
    assert.ok(d.model.assumptions.length >= 2, d.id + ': assumptions')
  }
})

for (const def of PHYSICS_AL) {
  test(`${def.collection.code} ${def.title}: a careful student scores every automatic mark`, () => {
    for (const seed of ['s1', 's2', 's3', 's4', 's5', 's6']) {
      const { params, state, actions, answers } = carefulRun(def, seed)
      // The server rebuilds the same state from the action log.
      assert.deepEqual(replay(def, params, actions), state)
      const g = gradeSession(def, { params, state, answers })
      for (const row of g.rows.filter(r => r.auto)) assert.equal(row.marks, row.max, `${def.id} seed ${seed}: ${row.label}: ${row.detail}`)
      for (const v of Object.values(def.expected({ params, state, answers }))) assert.ok(v == null || Number.isFinite(v))
    }
  })
}

test('a wrong result loses marks; in stockroom mode, missing apparatus blocks readings and loses the mark', () => {
  const def = PHYSICS_AL[0]
  const { params, state, answers } = carefulRun(def, 'w1')
  const g = gradeSession(def, { params, state, answers: { ...answers, r_rho: '1.5' } })
  assert.equal(g.rows.find(r => r.id === 'res_rho').marks, 0)
  assert.equal(g.rows.find(r => r.id === 'apparatus'), undefined, 'apparatus was provided, so there is no apparatus mark')

  const p2 = paramsFor(def, 'w2', { stockroom: true })
  let s = def.initialState(p2)
  assert.equal(s.collected, null)
  s = applyAction(def, p2, s, { type: 'collect', payload: { items: [def.apparatus[0]] } })
  assert.throws(() => applyAction(def, p2, s, { type: 'measure', payload: { key: def.practical.measures[0].key } }), /missing/)
  s = applyAction(def, p2, s, { type: 'collect', payload: { items: def.apparatus } })
  assert.equal(gradeSession(def, { params: p2, state: s, answers: {} }).rows.find(r => r.id === 'apparatus').marks, 0)

  const run = carefulRun(def, 'w3', { options: { stockroom: true } })
  assert.equal(gradeSession(def, { params: run.params, state: run.state, answers: run.answers }).rows.find(r => r.id === 'apparatus').marks, 1)
})
