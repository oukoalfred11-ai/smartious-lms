// The hands-on bench (session option bench: 2): instruments read from a
// close-up, zero errors, parallax, settling, stopwatch timing, heating,
// safety and tidying. Older sessions (no option) must replay unchanged.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getExperiment } from '../experiments/index.js'
import { PHYSICS_AL } from '../experiments/physics-al/index.js'
import { paramsFor, applyAction, replay, viewOf, gradeSession } from '../engine.js'
import { carefulRun } from './careful.js'
import { cyclesOf } from '../practical.js'
import { dialScale, niceCeil, parallaxShift, displayPosition, flickerAlt, vernierParts, micrometerParts, cycleTiming, instrumentKind } from '../science/instruments.js'

const byCode = (code) => PHYSICS_AL.find(d => d.collection.code === code)
const HANDS = { bench: 2 }

/** Step-by-step player that records the action log. */
function player(def, seed, options = HANDS) {
  const params = paramsFor(def, seed, options)
  let state = def.initialState(params)
  const actions = []
  const step = (type, payload = {}) => { state = applyAction(def, params, state, { type, payload }); actions.push({ type, payload }); return state }
  return { params, get state() { return state }, actions, step, view: () => viewOf(def, params, state), grade: (answers = {}) => gradeSession(def, { params, state, answers }) }
}
const row = (g, id) => g.rows.find(r => r.id === id)

// ── Pure instrument models ─────────────────────────────────
test('instrument models: scales, parallax, display position, flicker, vernier, micrometer', () => {
  assert.equal(niceCeil(1.3), 2); assert.equal(niceCeil(0.21), 0.5); assert.equal(niceCeil(7), 10); assert.equal(niceCeil(1), 1)
  // 0–2 V read to 0.01 V: 100 divisions of 0.02 V, read to half a division.
  assert.deepEqual(dialScale(1.55, 0.01), { fullScale: 2, division: 0.02, divisions: 100, half: true })
  assert.deepEqual(dialScale(4.1, 0.1), { fullScale: 5, division: 0.1, divisions: 50, half: false })
  assert.equal(dialScale(1.55, 0.001), null, 'too fine for a needle: drawn as a digital display')
  assert.equal(instrumentKind('micrometer', { unit: 'mm', resolution: 0.01 }), 'micrometer')
  assert.equal(instrumentKind('metre_rule', { unit: 'cm', resolution: 0.1 }), 'rule')
  // Parallax: square-on there is no shift; off-square the pointer appears shifted, the more so the further off.
  assert.equal(parallaxShift(0, 0.1), 0)
  assert.ok(parallaxShift(0.5, 0.1) > 0 && parallaxShift(-0.5, 0.1) < 0)
  assert.ok(Math.abs(parallaxShift(1, 0.1)) > Math.abs(parallaxShift(0.5, 0.1)))
  assert.equal(parallaxShift(5, 0.1), parallaxShift(1, 0.1), 'eye position is limited')
  // The pointer is drawn at the true value but never ambiguous to round.
  assert.ok(Math.abs(displayPosition(12.349, 12.3, 0.1) - 12.33) < 1e-9)
  assert.equal(displayPosition(12.31, 12.3, 0.1), 12.31)
  // A value near a digit boundary flickers to the neighbouring digit; a value near a digit is steady.
  assert.equal(flickerAlt(2.3448, 2.34, 0.01), 2.35)
  assert.equal(flickerAlt(2.3352, 2.34, 0.01), 2.33)
  assert.equal(flickerAlt(2.3405, 2.34, 0.01), null)
  // Vernier: 23.7 mm = 23 mm on the main scale + vernier line 7; 50-division vernier to 0.02 mm.
  assert.deepEqual(vernierParts(23.7, 10), { main: 23, line: 7, step: 0.1, value: 23.7 })
  assert.deepEqual(vernierParts(4.36, 50), { main: 4, line: 18, step: 0.02, value: 4.36 })
  // Micrometer: 5.78 mm = 5.5 on the sleeve + 28 on the thimble; −0.03 mm zero error = thimble 47 below the datum.
  assert.deepEqual(micrometerParts(5.78), { sleeve: 5.5, thimble: 28, value: 5.78 })
  assert.deepEqual(micrometerParts(-0.03), { sleeve: -0.5, thimble: 47, value: -0.03 })
  assert.deepEqual(micrometerParts(0.02), { sleeve: 0, thimble: 2, value: 0.02 })
  // Counting one cycle too many adds one period.
  assert.ok(Math.abs(cycleTiming(40.1, 20, 21, 40) - 42.1) < 1e-9)
})

// ── Old sessions are untouched ─────────────────────────────
test('sessions without the hands-on option replay exactly as before and cannot use the new steps', () => {
  for (const def of [byCode('1.2'), byCode('7.1'), byCode('9.2'), getExperiment('phys-ohms-law')]) {
    const params = paramsFor(def, 'old', {})
    const s = def.initialState(params)
    assert.equal(s.hands, undefined, def.id)
    assert.equal(viewOf(def, params, s).bench, undefined)
    if (def.practical) {
      for (const type of ['wearGoggles', 'wait', 'tidyUp', 'setEye']) assert.throws(() => applyAction(def, params, s, { type, payload: { offset: 0 } }), /hands-on bench/)
      const run = carefulRun(def, 'old')
      assert.ok(!gradeSession(def, run).rows.some(r => r.id === 'technique' || r.id === 'safety'), 'no new marks for old sessions')
    } else assert.throws(() => applyAction(def, params, s, { type: 'wait' }), /hands-on bench/)
  }
  // A bench-1 student may still load several masses at once.
  const def = byCode('1.2'), p = player(def, 'old', {})
  p.step('setIV', { value: 300 })
  assert.equal(p.state.x, 300)
})

// ── Safety: goggles, one mass at a time, tidy up ───────────
test('goggles must be worn before loading a spring; masses go on one at a time; tidying away earns the safety mark', () => {
  const def = byCode('1.2'), p = player(def, 'safe')
  assert.equal(p.view().hands.needsGoggles, true)
  assert.throws(() => p.step('setIV', { value: 100 }), /goggles/)
  assert.throws(() => p.step('measure', { key: 'L0' }), /goggles/)
  p.step('wearGoggles')
  assert.throws(() => p.step('wearGoggles'), /already/)
  assert.throws(() => p.step('setIV', { value: 200 }), /one 50 g mass at a time/)
  p.step('setIV', { value: 100 }); p.step('setIV', { value: 150 }); p.step('setIV', { value: 100 })
  assert.equal(p.state.x, 100)
  let g = p.grade()
  assert.equal(row(g, 'safety').marks, 0)
  p.step('tidyUp')
  assert.equal(row(p.grade(), 'safety').marks, 1)
  p.step('setIV', { value: 150 })                         // getting the apparatus out again un-tidies the bench
  assert.equal(row(p.grade(), 'safety').marks, 0)
  // A circuit cannot be tidied away with the switch closed.
  const c = player(byCode('1.3'), 'safe')
  for (const [a, b] of byCode('1.3').practical.circuit.correct) c.step('connect', { a, b })
  c.step('toggleSwitch')
  assert.throws(() => c.step('tidyUp'), /Open the switch/)
  c.step('toggleSwitch'); c.step('tidyUp')
  assert.equal(c.view().hands.tidy, true)
})

// ── Zero error ─────────────────────────────────────────────
test('micrometer zero error: shown in every reading, checked, recorded and corrected; missing or wrong loses the technique mark', () => {
  const def = byCode('7.1')
  let seed = null
  for (let i = 0; i < 50 && seed == null; i++) if (Math.abs(paramsFor(def, 'z' + i, HANDS)._zero.micrometer) >= 0.02) seed = 'z' + i
  assert.ok(seed, 'a seed with a zero error')
  const z = paramsFor(def, seed, HANDS)._zero.micrometer
  // The same session without the hands-on bench shows the uncorrected true diameter.
  const old = player(def, seed, {}); old.step('measure', { key: 'd' })
  const p = player(def, seed)
  p.step('setEye', { offset: 0 })
  p.step('measure', { key: 'd' })
  assert.ok(Math.abs(p.state.readings.d - old.state.readings.d - z) < 0.0051, 'the reading includes the zero error')
  assert.throws(() => p.step('recordZero', { instrument: 'micrometer', value: z }), /jaws/)
  p.step('zeroCheck', { instrument: 'micrometer' })
  assert.equal(p.view().hands.zeroShown.micrometer, z)
  assert.throws(() => p.step('recordZero', { instrument: 'micrometer', value: 'x' }), /number/)

  // A careful student who records the zero error gets the right resistivity; one who ignores it does not get the technique mark.
  const full = carefulRun(def, seed, { options: HANDS })
  assert.equal(row(gradeSession(def, full), 'technique').marks, 1)
  const noZero = full.actions.filter(a => a.type !== 'zeroCheck' && a.type !== 'recordZero')
  const st = replay(def, full.params, noZero)
  const g = gradeSession(def, { params: full.params, state: st, answers: full.answers })
  assert.equal(row(g, 'technique').marks, 0)
  assert.match(row(g, 'technique').detail, /zero error/)
  // Without the correction the student's own data give a different resistivity (d is wrong by z).
  const e1 = def.expected({ params: full.params, state: full.state }).r_rho, e0 = def.expected({ params: full.params, state: st }).r_rho
  assert.ok(Math.abs(e1 - e0) / e1 > 0.03, 'zero error changes d² noticeably')
  // A wrongly read zero error also loses the mark.
  const wrong = full.actions.map(a => (a.type === 'recordZero' ? { ...a, payload: { ...a.payload, value: -z } } : a))
  assert.equal(row(gradeSession(def, { params: full.params, state: replay(def, full.params, wrong), answers: full.answers }), 'technique').marks, 0)
})

test('top-pan balance: readings before taring include the empty-pan reading and lose the technique mark', () => {
  const def = byCode('1.1')
  const p = player(def, 'tare')
  p.step('setEye', { offset: 0 })
  p.step('measure', { key: 'mb' }); const before = p.state.readings.mb
  const offset = p.params._tare.top_pan_balance * 0.01
  assert.ok(p.view().hands.balanceZero.top_pan_balance.value > 0)
  p.step('tare', { instrument: 'top_pan_balance' })
  assert.equal(p.state.readings.mb, undefined, 'taring clears the display')
  assert.equal(p.view().hands.balanceZero.top_pan_balance.value, 0)
  p.step('measure', { key: 'mb' })
  assert.ok(Math.abs(before - p.state.readings.mb - offset) < 0.011)
  assert.equal(p.state.hands.untared.top_pan_balance, 1)
  assert.throws(() => p.step('tare', { instrument: 'micrometer' }), /nothing to tare/)
})

// ── Parallax and reading the scale ─────────────────────────
test('parallax: the eye starts off-square; readings recorded off-square lose the technique mark; the shown value is the square-on one', () => {
  const def = byCode('1.2')
  const p = player(def, 'eye')
  assert.ok(Math.abs(p.state.hands.eye) >= 0.5, 'the student starts looking from one side')
  p.step('wearGoggles')
  p.step('measure', { key: 'L0' })
  const look = p.state.look.L0
  assert.equal(look.kind, 'rule')
  assert.ok(Math.abs(look.pos - p.state.readings.L0) <= 0.03 + 1e-9, 'pointer drawn near the shown value')
  p.step('recordConst', { key: 'L0', value: p.state.readings.L0 })
  assert.deepEqual(p.state.constTech.L0.offSquare, ['L0'])
  assert.throws(() => p.step('setEye', { offset: 2 }), /between/)
  p.step('setEye', { offset: 0 })
  p.step('recordConst', { key: 'L0', value: p.state.readings.L0 })
  assert.deepEqual(p.state.constTech.L0.offSquare, [])
  // Reading the apparent (off-square) position instead gives a value the grader does not accept.
  const apparent = look.pos + parallaxShift(0.75, 0.1)
  p.step('recordConst', { key: 'L0', value: Math.round(apparent * 10) / 10 + 0.1 })
  assert.equal(row(p.grade(), 'readings').marks, 0)
})

test('digital displays: either value of a flickering last digit is accepted, nothing further away', () => {
  const def = byCode('1.1')
  let found = null
  for (let i = 0; i < 60 && !found; i++) {
    const p = player(def, 'f' + i)
    p.step('setEye', { offset: 0 }); p.step('tare', { instrument: 'top_pan_balance' })
    p.step('measure', { key: 'mb' })
    if (p.state.look.mb.alt != null) found = p
  }
  assert.ok(found, 'some balance reading flickers')
  const { shown, alt } = { shown: found.state.readings.mb, alt: found.state.look.mb.alt }
  assert.ok(Math.abs(Math.abs(alt - shown) - 0.01) < 1e-9)
  found.step('recordConst', { key: 'mb', value: alt })
  assert.equal(found.state.constAlt.mb, alt)
  const g = (v) => { const s = applyAction(def, found.params, found.state, { type: 'recordConst', payload: { key: 'mb', value: v } }); return gradeSession(def, { params: found.params, state: { ...s, rows: [] }, answers: {} }) }
  // Only constants recorded here; the readings row then checks mb and the (unrecorded) diameter.
  const okAlt = g(alt), okShown = g(shown), bad = g(shown + 2 * (alt - shown))
  const badCount = (x) => Number((/(\d+) of/.exec(row(x, 'readings').detail) || [0, 0])[1])
  assert.equal(badCount(okAlt), badCount(okShown))
  assert.equal(badCount(bad), badCount(okShown) + 1)
})

// ── Settling ───────────────────────────────────────────────
test('meters and loaded springs must settle: a reading taken straight after a change overshoots and is flagged', () => {
  const def = byCode('1.2')
  const p = player(def, 'settle')
  p.step('wearGoggles'); p.step('setEye', { offset: 0 })
  p.step('setIV', { value: 100 })
  assert.equal(p.view().hands.settled, false)
  p.step('measure', { key: 'L' }); const bouncing = p.state.readings.L
  p.step('recordRow', { values: { L: bouncing } })
  assert.deepEqual(p.state.rows[0].tech.unsettled, ['L'])
  p.step('wait')
  p.step('measure', { key: 'L' }); const still = p.state.readings.L
  p.step('recordRow', { values: { L: still } })
  assert.deepEqual(p.state.rows[1].tech.unsettled, [])
  assert.ok(Math.abs(bouncing - still) >= 0.2, 'the bouncing spring reads several mm out')
  assert.equal(row(p.grade(), 'technique').marks, 0)
  assert.match(row(p.grade(), 'technique').detail, /settled/)
})

// ── Stopwatch ──────────────────────────────────────────────
test('stopwatch: start then stop; it counts on unless reset; counting the wrong number of oscillations is a whole period out', () => {
  const def = byCode('9.2')
  assert.equal(cyclesOf(def.practical.measures[0]), 20)
  const p = player(def, 'sw')
  assert.throws(() => p.step('measure', { key: 't' }), /Start the stopwatch/)
  p.step('startTimer')
  assert.throws(() => p.step('startTimer'), /already running/)
  assert.throws(() => p.step('resetTimer'), /Stop the stopwatch/)
  assert.throws(() => p.step('tidyUp'), /Stop the stopwatch/)
  p.step('measure', { key: 't' }); const t1 = p.state.readings.t
  const T = p.view().hands.motion.period
  assert.ok(Math.abs(t1 - 20 * T) < 0.6, 'about 20 periods')
  // Not reset: the second timing adds on to the first.
  p.step('startTimer'); p.step('measure', { key: 't' })
  assert.ok(p.state.readings.t > 1.9 * t1)
  assert.equal(p.state.hands.unreset, 1)
  p.step('resetTimer'); p.step('startTimer'); p.step('measure', { key: 't', cycles: 21 })
  assert.ok(Math.abs(p.state.readings.t - 21 * T) < 0.6, 'one oscillation too many')
  assert.equal(p.state.look.t.cycles, 21)
  assert.throws(() => { p.step('resetTimer'); p.step('startTimer'); p.step('measure', { key: 't', cycles: 0 }) }, /Count between/)
})

test('stopwatch: the human timing error is random, replayable, and shared between the oscillations timed', () => {
  const def = byCode('9.2')
  const errs = { 1: [], 20: [] }
  for (let i = 0; i < 300; i++) {
    for (const c of [1, 20]) {
      const p = player(def, 'rt' + i)
      p.step('startTimer'); p.step('measure', { key: 't', cycles: c })
      const T = p.view().hands.motion.period
      errs[c].push(p.state.readings.t / c - T)
    }
  }
  const sd = (a) => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)) }
  const s1 = sd(errs[1]), s20 = sd(errs[20])
  assert.ok(s1 > 0.08 && s1 < 0.16, 'reaction-time error of about ±0.12 s for one timing: ' + s1)
  assert.ok(s1 / s20 > 15 && s1 / s20 < 25, 'timing 20 oscillations makes the error in T about 20 times smaller: ' + s1 / s20)
  // Replay gives the same time.
  const p = player(def, 'rt0'); p.step('startTimer'); p.step('measure', { key: 't' })
  assert.deepEqual(replay(def, p.params, p.actions), p.state)
})

// ── Heating ────────────────────────────────────────────────
test('resistance wire warms if the switch is left closed: resistance drifts up and the technique mark is lost', () => {
  const def = byCode('1.3')
  const p = player(def, 'heat')
  p.step('setEye', { offset: 0 })
  for (const [a, b] of def.practical.circuit.correct) p.step('connect', { a, b })
  p.step('setIV', { value: 50 })
  p.step('toggleSwitch'); p.step('wait')
  const R = () => { p.step('measure', { key: 'V' }); p.step('measure', { key: 'I' }); return p.state.readings.V / p.state.readings.I }
  const cold = R()
  for (let i = 0; i < 25; i++) p.step('wait')
  assert.ok(p.view().hands.hot && p.view().hands.heatFrac > 0.5)
  const hot = R()
  assert.ok(hot > cold * 1.015, `R rose from ${cold} to ${hot}`)
  p.step('recordRow', { values: { V: p.state.readings.V, I: p.state.readings.I } })
  assert.match(row(p.grade(), 'technique').detail, /warm/)
  // Opening the switch and waiting lets it cool.
  p.step('toggleSwitch'); p.step('wait'); p.step('wait'); p.step('wait'); p.step('wait')
  assert.equal(p.view().hands.heat, 0)
})

// ── Ohm's law ──────────────────────────────────────────────
const GOOD_WIRING = [['PS.+', 'S1.a'], ['S1.b', 'A1.+'], ['A1.-', 'R1.a'], ['R1.b', 'PS.-'], ['V1.+', 'R1.a'], ['V1.-', 'R1.b']]
function ohmsRun(seed, { leaveOn = false, noWait = false, tidy = true } = {}) {
  const def = getExperiment('phys-ohms-law')
  const p = player(def, seed)
  for (const [a, b] of GOOD_WIRING) p.step('connect', { a, b })
  if (leaveOn) p.step('toggleSwitch')
  for (const v of [1, 3, 5, 7, 9, 11, 12]) {
    p.step('setSupply', { volts: v })
    if (!leaveOn) p.step('toggleSwitch')
    if (!noWait) p.step('wait')
    const m = p.view().meters
    p.step('recordRow', { V: m.V1, I: m.A1 })
    if (!leaveOn) p.step('toggleSwitch')
  }
  if (leaveOn) p.step('toggleSwitch')
  if (tidy) { p.step('setSupply', { volts: 0 }); p.step('tidyUp') }
  const e = def.expected({ params: p.params, state: p.state })
  return { p, def, g: p.grade({ gradient: String(e.gradient), ohmic: '0' }) }
}

test("Ohm's law on the hands-on bench: careful technique scores every mark; leaving it on, not waiting or not tidying lose marks", () => {
  const { g, p } = ohmsRun('o1')
  assert.equal(g.autoMarks, g.autoMax, JSON.stringify(g.rows.filter(r => r.auto && r.marks < r.max)))
  assert.equal(p.view().bench, 2)
  assert.deepEqual(replay(getExperiment('phys-ohms-law'), p.params, p.actions), p.state)

  const hot = ohmsRun('o1', { leaveOn: true }).g
  assert.equal(row(hot, 'technique').marks, 0)
  assert.match(row(hot, 'technique').detail, /warm/)
  const rushed = ohmsRun('o1', { noWait: true }).g
  assert.equal(row(rushed, 'technique').marks, 0)
  assert.match(row(rushed, 'technique').detail, /settled/)
  assert.equal(row(ohmsRun('o1', { tidy: false }).g, 'safety').marks, 0)

  const def = getExperiment('phys-ohms-law'), q = player(def, 'o2')
  for (const [a, b] of GOOD_WIRING) q.step('connect', { a, b })
  q.step('setSupply', { volts: 6 }); q.step('toggleSwitch')
  assert.throws(() => q.step('tidyUp'), /Open the switch/)
  q.step('toggleSwitch')
  assert.throws(() => q.step('tidyUp'), /0 V/)
  // An unsettled meter overshoots.
  q.step('toggleSwitch')
  const swinging = q.view().meters.V1
  q.step('wait')
  assert.notEqual(q.view().meters.V1, swinging)
})
