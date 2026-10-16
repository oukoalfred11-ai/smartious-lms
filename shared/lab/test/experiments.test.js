import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EXPERIMENTS, getExperiment, catalogueEntry } from '../experiments/index.js'
import { paramsFor, replay, applyAction, viewOf, gradeSession, validateDefinition, LabActionError } from '../engine.js'
import { trueEndpoint, titres } from '../experiments/titration.js'
import { toResolution } from '../science/numeric.js'
import { isotonicFrom } from '../experiments/osmosis.js'

test('every experiment definition is valid', () => {
  for (const d of EXPERIMENTS) assert.deepEqual(validateDefinition(d), [], d.id)
})

test('catalogue entries hide functions and hidden values', () => {
  for (const d of EXPERIMENTS) {
    const c = catalogueEntry(d)
    const walk = (v, at) => {
      assert.notEqual(typeof v, 'function', d.id + ': function in catalogue at ' + at)
      if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, at + '.' + k)
    }
    walk(c, 'entry')
    assert.ok(!/=>/.test(JSON.stringify(c)), d.id + ': code text in catalogue')
    assert.equal(c.params, undefined)
  }
})

// ── Titration walkthrough ───────────────────────────────
function titrate(def, params, actions, { indicator = 'phenolphthalein', runs = 3, readOff = 0 } = {}) {
  const act = (type, payload) => actions.push({ type, payload })
  let state = def.initialState(params)
  const step = (type, payload) => { actions.push({ type, payload }); state = applyAction(def, params, state, { type, payload }) }
  step('fillBurette')
  const target = trueEndpoint(params, indicator)
  for (let n = 0; n < runs; n++) {
    if (n > 0) { step('newRun'); step('fillBurette') }
    step('pipetteAcid')
    if (n === 0) step('chooseIndicator', { indicator })
    step('addIndicator')
    const read = (v) => toResolution(v, 0.05) + readOff
    step('recordReading', { which: 'initial', value: read(state.burette.reading) })
    // add quickly, then drop by drop until the colour changes
    let added = 0
    const bulk = Math.floor(target - 1)
    while (added + 5 <= bulk) { step('addBase', { volume: 5 }); added += 5 }
    if (bulk - added > 0) { step('addBase', { volume: bulk - added }); added = bulk }
    while (!viewOf(def, params, state).flask.changed) { step('addBase', { volume: 0.05 }); added += 0.05 }
    step('recordReading', { which: 'final', value: read(state.burette.reading) })
    if (n === 0) step('markRough', { index: 0, rough: true })
  }
  return state
}

test('titration: a careful student scores full auto marks; result is reproducible by replay', () => {
  const def = getExperiment('chem-titration')
  const params = paramsFor(def, 'student-A', {})
  const actions = []
  const state = titrate(def, params, actions)
  // replay gives the same state
  assert.deepEqual(replay(def, params, actions), state)
  const t = titres(state)
  assert.ok(t.concordant.length >= 2, 'concordant titres')
  const mt = t.concordant.reduce((a, b) => a + b, 0) / t.concordant.length
  const moles = 0.1 * mt / 1000
  const answers = { titre: mt.toFixed(2), moles: moles.toPrecision(3), conc: (Number(moles.toPrecision(3)) / 0.025).toPrecision(3) }
  const g = gradeSession(def, { params, state, answers })
  assert.equal(g.autoMarks, g.autoMax, JSON.stringify(g.rows.filter(r => r.auto && r.marks < r.max)))
})

test('titration: wrong indicator for a weak acid loses the indicator and accuracy marks', () => {
  const def = getExperiment('chem-titration')
  const params = paramsFor(def, 'student-B', { acid: 'CH3COOH' })
  const state = titrate(def, params, [], { indicator: 'methyl_orange' })
  const g = gradeSession(def, { params, state, answers: {} })
  assert.equal(g.rows.find(r => r.id === 'indicator').marks, 0)
  // methyl orange changed after only a few cm³: far from the true equivalence
  const eqV = params.Ca * params.Va / params.Cb
  assert.ok(titres(state).all[0] < eqV - 10)
})

test('titration: misread burette readings lose the readings mark', () => {
  const def = getExperiment('chem-titration')
  const params = paramsFor(def, 'student-C', {})
  const state = titrate(def, params, [], { readOff: 0.2 })
  const g = gradeSession(def, { params, state, answers: {} })
  assert.equal(g.rows.find(r => r.id === 'readings').marks, 0)
})

test('titration: invalid actions are refused', () => {
  const def = getExperiment('chem-titration')
  const params = paramsFor(def, 's', {})
  const s0 = def.initialState(params)
  assert.throws(() => applyAction(def, params, s0, { type: 'addBase', payload: { volume: 1 } }), LabActionError)
  assert.throws(() => applyAction(def, params, s0, { type: 'chooseIndicator', payload: { indicator: 'litmus' } }), LabActionError)
  assert.throws(() => applyAction(def, params, s0, { type: 'hack', payload: {} }), LabActionError)
  const s1 = applyAction(def, params, applyAction(def, params, s0, { type: 'fillBurette' }), { type: 'pipetteAcid' })
  assert.throws(() => applyAction(def, params, s1, { type: 'addBase', payload: { volume: 50 } }), LabActionError)
  assert.throws(() => replay(def, params, [{ type: 'addBase', payload: { volume: 1 } }]), /Action 1/)
})

test('titration: hidden concentration is reproducible per seed and in range', () => {
  const def = getExperiment('chem-titration')
  const a = paramsFor(def, 'x', {}), b = paramsFor(def, 'x', {}), c = paramsFor(def, 'y', {})
  assert.equal(a.Ca, b.Ca)
  assert.ok(a.Ca >= 0.08 && a.Ca <= 0.12 && c.Ca >= 0.08 && c.Ca <= 0.12)
})

// ── Ohm's law walkthrough ───────────────────────────────
const GOOD_WIRING = [['PS.+', 'S1.a'], ['S1.b', 'A1.+'], ['A1.-', 'R1.a'], ['R1.b', 'PS.-'], ['V1.+', 'R1.a'], ['V1.-', 'R1.b']]

test("Ohm's law: correct circuit, readings and gradient score full auto marks", () => {
  const def = getExperiment('phys-ohms-law')
  const params = paramsFor(def, 'phys-1', {})
  const actions = GOOD_WIRING.map(([a, b]) => ({ type: 'connect', payload: { a, b } }))
  let state = replay(def, params, actions)
  const rows = []
  for (const v of [1, 3, 5, 7, 9, 11]) {
    state = applyAction(def, params, state, { type: 'setSupply', payload: { volts: v } })
    state = applyAction(def, params, state, { type: 'toggleSwitch' })
    const view = viewOf(def, params, state)
    assert.ok(view.setupOk, view.problems.join('; '))
    state = applyAction(def, params, state, { type: 'recordRow', payload: { V: view.meters.V1, I: view.meters.A1 } })
    rows.push(view.meters)
    state = applyAction(def, params, state, { type: 'toggleSwitch' })
  }
  const g0 = def.expected({ params, state })
  const g = gradeSession(def, { params, state, answers: { gradient: String(g0.gradient), ohmic: '0' } })
  assert.equal(g.autoMarks, g.autoMax, JSON.stringify(g.rows.filter(r => r.auto && r.marks < r.max)))
  assert.ok(Math.abs(g0.gradient - params.R) / params.R < 0.01, 'V/I gradient recovers R')
})

test("Ohm's law: voltmeter in series is detected and gives no plausible current", () => {
  const def = getExperiment('phys-ohms-law')
  const params = paramsFor(def, 'phys-2', {})
  const wires = [['PS.+', 'S1.a'], ['S1.b', 'V1.+'], ['V1.-', 'R1.a'], ['R1.b', 'A1.+'], ['A1.-', 'PS.-']]
  let state = replay(def, params, wires.map(([a, b]) => ({ type: 'connect', payload: { a, b } })))
  state = applyAction(def, params, state, { type: 'setSupply', payload: { volts: 6 } })
  state = applyAction(def, params, state, { type: 'toggleSwitch' })
  const view = viewOf(def, params, state)
  assert.equal(view.setupOk, false)
  assert.ok(Math.abs(view.meters.A1) < 0.001)
})

test("Ohm's law: short circuit trips the supply", () => {
  const def = getExperiment('phys-ohms-law')
  const params = paramsFor(def, 'phys-3', {})
  let state = replay(def, params, [['PS.+', 'S1.a'], ['S1.b', 'A1.+'], ['A1.-', 'PS.-']].map(([a, b]) => ({ type: 'connect', payload: { a, b } })))
  state = applyAction(def, params, state, { type: 'setSupply', payload: { volts: 6 } })
  state = applyAction(def, params, state, { type: 'toggleSwitch' })
  const view = viewOf(def, params, state)
  assert.equal(view.fault, 'short_circuit')
  assert.equal(view.meters.A1, null)
})

test("Ohm's law: invalid connections are refused", () => {
  const def = getExperiment('phys-ohms-law')
  const params = paramsFor(def, 'p', {})
  const s = def.initialState(params)
  assert.throws(() => applyAction(def, params, s, { type: 'connect', payload: { a: 'PS.+', b: 'PS.-' } }), LabActionError)
  assert.throws(() => applyAction(def, params, s, { type: 'connect', payload: { a: 'R1.c', b: 'PS.-' } }), LabActionError)
  assert.throws(() => applyAction(def, params, s, { type: 'setSupply', payload: { volts: 30 } }), LabActionError)
})

// ── Osmosis walkthrough ─────────────────────────────────
test('osmosis: careful student finds the isotonic point and scores full auto marks', () => {
  const def = getExperiment('bio-osmosis')
  const params = paramsFor(def, 'bio-1', {})
  let state = def.initialState(params)
  const step = (type, payload) => { state = applyAction(def, params, state, { type, payload }) }
  for (let i = 0; i < 6; i++) { step('select', { index: i }); step('recordInitial', { index: i, value: viewOf(def, params, state).balance }) }
  step('immerse'); step('wait', { minutes: 120 })
  for (let i = 0; i < 6; i++) { step('remove', { index: i }); step('select', { index: i }); step('recordFinal', { index: i, value: viewOf(def, params, state).balance }) }
  const e = def.expected({ params, state })
  assert.ok(Math.abs(e.isotonic - params.Ciso) < 0.05, `estimate ${e.isotonic} vs ${params.Ciso}`)
  const g = gradeSession(def, { params, state, answers: { isotonic: e.isotonic.toFixed(2) } })
  assert.equal(g.autoMarks, g.autoMax, JSON.stringify(g.rows.filter(r => r.auto && r.marks < r.max)))
})

test('osmosis: cannot weigh after immersion before removal, or immerse twice', () => {
  const def = getExperiment('bio-osmosis')
  const params = paramsFor(def, 'bio-2', {})
  let s = def.initialState(params)
  assert.throws(() => applyAction(def, params, s, { type: 'immerse' }), /initial mass/)
  assert.throws(() => applyAction(def, params, s, { type: 'recordFinal', payload: { index: 0, value: 2 } }), LabActionError)
})

test('osmosis: isotonic interpolation', () => {
  assert.equal(isotonicFrom([{ x: 0.2, y: 4 }, { x: 0.4, y: -4 }]), 0.30000000000000004)
})

test('grading marks teacher-only rows as pending (null)', () => {
  for (const def of EXPERIMENTS) {
    const params = paramsFor(def, 'g', {})
    const g = gradeSession(def, { params, state: def.initialState(params), answers: {} })
    for (const r of g.rows.filter(r => !r.auto)) assert.equal(r.marks, null)
    assert.equal(g.max, def.rubric.reduce((a, r) => a + r.marks, 0))
  }
})
