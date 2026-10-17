// Step-by-step (hands-on) osmosis bench: cork borer, scalpel and ruler,
// blotting, a tared balance, labelled tubes and a lab clock, all as engine
// actions that the server replays and marks.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getExperiment } from '../experiments/index.js'
import { paramsFor, replay, applyAction, viewOf, gradeSession } from '../engine.js'
import { osmosisIssues, clockText } from '../experiments/osmosis.js'

const def = getExperiment('bio-osmosis')

function bench(seed) {
  const params = paramsFor(def, seed, {})
  let state = def.initialState(params)
  const actions = []
  const step = (type, payload) => { actions.push({ type, payload }); state = applyAction(def, params, state, { type, payload }) }
  return { params, actions, step, get state() { return state }, view: () => viewOf(def, params, state) }
}

/** A student doing the practical; each option is a mistake (default: careful). */
function practical(seed, o = {}) {
  const b = bench(seed)
  const { step } = b
  step('cutCylinders')
  for (let i = 0; i < 6; i++) {
    if (!o.noTrim) step('trimCylinder', { index: i, length: 40 })
    if (!o.noBlotInitial) step('blot', { index: i })
  }
  if (!o.noTare) step('tareBalance')
  for (let i = 0; i < 6; i++) {
    step('putOnPan', { index: i })
    step('recordInitial', { index: i, value: b.view().balance })
  }
  for (let i = 0; i < 6; i++) step('placeInTube', { index: i, tube: o.swap && i < 2 ? 1 - i : i })
  step('startTimer')
  step('wait', { minutes: 120 })
  for (let i = 0; i < 6; i++) {
    step('remove', { index: i })
    if (!o.noBlotFinal) step('blot', { index: i })
    step('putOnPan', { index: i })
    step('recordFinal', { index: i, value: b.view().balance })
  }
  return b
}
const grade = (b) => {
  const e = def.expected({ params: b.params, state: b.state })
  return { e, g: gradeSession(def, { params: b.params, state: b.state, answers: { isotonic: e.isotonic.toFixed(2) } }) }
}
const row = (g, id) => g.rows.find(r => r.id === id)

test('hands-on osmosis: a careful student scores every automatic mark, including technique', () => {
  for (const seed of ['os-1', 'os-2', 'os-3', 'os-4']) {
    const b = practical(seed)
    assert.deepEqual(b.state.notes, [], seed)
    const { e, g } = grade(b)
    assert.ok(Math.abs(e.isotonic - b.params.Ciso) < 0.05, `${seed}: estimate ${e.isotonic} vs ${b.params.Ciso}`)
    assert.ok(row(g, 'technique'))
    assert.equal(g.autoMarks, g.autoMax, seed + ': ' + JSON.stringify(g.rows.filter(r => r.auto && r.marks < r.max)))
    assert.deepEqual(replay(def, b.params, b.actions), b.state)
  }
})

test('hands-on osmosis: the balance shows the weighing boat until it is tared, and the lab clock runs', () => {
  const b = bench('os-balance')
  b.step('cutCylinders')
  const boat = b.view().balance
  assert.ok(boat >= 1.2 && boat <= 1.6, 'boat ' + boat)
  b.step('tareBalance')
  assert.equal(b.view().balance, 0)
  b.step('putOnPan', { index: 0 })
  assert.throws(() => b.step('tareBalance'), /Take the cylinder off the pan/)
  assert.equal(clockText(0), '09:00')
  assert.equal(clockText(135), '11:15')
  assert.equal(b.view().clockTime, '09:00')
})

test('hands-on osmosis: steps are enforced with clear messages; one-click sessions still replay', () => {
  const b = bench('os-rules')
  assert.throws(() => b.step('trimCylinder', { index: 0, length: 40 }), /cork borer/)
  b.step('cutCylinders')
  assert.throws(() => b.step('cutCylinders'), /already cut/)
  assert.throws(() => b.step('trimCylinder', { index: 0, length: 80 }), /only make it shorter/)
  assert.throws(() => b.step('trimCylinder', { index: 0, length: 5 }), /at least 20 mm/)
  assert.throws(() => b.step('recordInitial', { index: 0, value: 2 }), /balance pan/)
  assert.throws(() => b.step('placeInTube', { index: 0 }), /initial mass/)
  assert.throws(() => b.step('immerse'), /labelled tube/)
  assert.throws(() => b.step('startTimer'), /every cylinder/)
  b.step('putOnPan', { index: 0 }); b.step('recordInitial', { index: 0, value: b.view().balance })
  assert.throws(() => b.step('trimCylinder', { index: 0, length: 30 }), /weighed/)
  b.step('placeInTube', { index: 0 })
  assert.throws(() => b.step('placeInTube', { index: 1, tube: 0 }), /already has a cylinder/)
  assert.throws(() => b.step('putOnPan', { index: 0 }), /in its tube/)
  assert.throws(() => b.step('blot', { index: 0 }), /out of the solution/)

  // the original bench (ready-cut cylinders) still works and is not marked on technique
  const params = paramsFor(def, 'os-legacy', {})
  let s = def.initialState(params)
  const step = (type, payload) => { s = applyAction(def, params, s, { type, payload }) }
  for (let i = 0; i < 6; i++) { step('select', { index: i }); step('recordInitial', { index: i, value: viewOf(def, params, s).balance }) }
  step('immerse'); step('wait', { minutes: 60 })
  for (let i = 0; i < 6; i++) { step('remove', { index: i }); step('select', { index: i }); step('recordFinal', { index: i, value: viewOf(def, params, s).balance }) }
  assert.equal(row(gradeSession(def, { params, state: s, answers: {} }), 'technique'), undefined)
})

test('hands-on osmosis: mistakes give realistic errors and are recorded', () => {
  const seed = 'os-mistakes'
  const good = grade(practical(seed)).e.isotonic

  // Solution left on the surface makes every final mass too large: the line crosses zero at a higher concentration.
  const wet = practical(seed, { noBlotFinal: true })
  assert.ok(grade(wet).e.isotonic - good > 0.05, `unblotted: ${grade(wet).e.isotonic} vs ${good}`)
  assert.ok(osmosisIssues(wet.state).some(i => i.code === 'unblotted_final' && i.at.length === 6))
  assert.ok(row(grade(wet).g, 'technique').marks < 3)

  // Sap weighed with the cylinder at the start makes the initial masses too large.
  const sap = practical(seed, { noBlotInitial: true })
  assert.ok(grade(sap).e.isotonic < good, 'unblotted at the start shifts the estimate down')
  assert.ok(osmosisIssues(sap.state).some(i => i.code === 'unblotted_initial'))

  // Not taring adds the boat to every mass: the readings are still read correctly, the % changes shrink.
  const boat = practical(seed, { noTare: true })
  const t0 = boat.state.tubes[0], g0 = practical(seed).state.tubes[0]
  assert.ok(t0.m0 - g0.m0 > 1.1, 'every mass includes the boat')
  assert.ok(Math.abs((t0.m1 - t0.m0) / t0.m0) < Math.abs((g0.m1 - g0.m0) / g0.m0), '% change too small')
  assert.equal(row(grade(boat).g, 'initial').marks, 1, 'the balance was read correctly')
  assert.ok(osmosisIssues(boat.state).some(i => i.code === 'not_tared'))

  // Untrimmed cylinders differ in length: not a fair test.
  const un = practical(seed, { noTrim: true })
  const L = un.view().cylinders.map(c => c.length)
  assert.ok(Math.max(...L) - Math.min(...L) > 1)
  assert.ok(osmosisIssues(un.state).some(i => i.code === 'unequal_length'))

  // Swapping two cylinders between tubes: the 0.0 M row really sat in 0.2 M.
  const sw = practical(seed, { swap: true })
  assert.ok(osmosisIssues(sw.state).some(i => i.code === 'wrong_tube'))
  assert.equal(sw.view().cylinders[0].tube, 1)
  assert.ok(def.dataTables(sw.params, sw.state).some(t => t.title === 'Technique notes'))
})

test('hands-on osmosis view has what the UI reads', () => {
  const b = practical('os-view')
  const v = b.view()
  for (const k of ['clockTime', 'handsOn', 'cut', 'tared', 'onPan', 'cylinders', 'notes', 'tubes', 'balance']) assert.ok(k in v, k)
  for (const c of v.cylinders) for (const k of ['length', 'trimmed', 'wet', 'tube', 'inSolution', 'onPan']) assert.ok(k in c, k)
})
