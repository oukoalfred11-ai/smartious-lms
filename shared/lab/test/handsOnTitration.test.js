// Step-by-step (hands-on) titration bench: every technique step is an
// engine action, mistakes change the readings the way they would at a real
// bench, and they are recorded for the rubric and report.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getExperiment } from '../experiments/index.js'
import { paramsFor, replay, applyAction, viewOf, gradeSession, LabActionError } from '../engine.js'
import { trueEndpoint, titres, techniqueIssues, PARALLAX } from '../experiments/titration.js'
import { toResolution, mean } from '../science/numeric.js'

const def = getExperiment('chem-titration')

function bench(seed, options = {}) {
  const params = paramsFor(def, seed, options)
  let state = def.initialState(params)
  const actions = []
  const step = (type, payload) => { actions.push({ type, payload }); state = applyAction(def, params, state, { type, payload }) }
  return { params, actions, step, get state() { return state }, view: () => viewOf(def, params, state) }
}

/**
 * A student at the bench. Every option is a mistake (default: careful).
 * Returns the bench after `runs` titrations (run 1 rough).
 */
function titrate(seed, o = {}) {
  const b = bench(seed, o.options)
  const { step } = b
  const indicator = o.indicator || 'phenolphthalein'
  const target = trueEndpoint(b.params, indicator)
  const read = () => {
    if (!o.parallax) step('eyeLevel', { pos: 'level' })
    return toResolution(b.view().burette.apparent, 0.05)
  }
  const fill = () => {
    if (!b.state.bur.funnel) step('burFunnel', { place: true })
    step('pourIntoBurette')
    if (!o.funnelLeft) step('burFunnel', { place: false })
    if (!o.bubble) step('runToWaste', { volume: 0.5 })
    while (b.view().burette.aboveZero) step('runToWaste', { volume: 0.5 })
  }
  step('wearPPE', { item: 'goggles' }); step('wearPPE', { item: 'coat' })
  step('rinseBurette', { with: 'water' })
  if (!o.noBuretteRinse) step('rinseBurette', { with: 'naoh' })
  fill()
  step('attachFiller')
  for (let n = 0; n < (o.runs || 3); n++) {
    if (n > 0) {
      step('newRun')
      step('rinseFlask', { with: o.flaskAcid ? 'acid' : 'water' })
      if (b.state.burette.reading > 20) fill()
    } else if (o.flaskAcid) step('rinseFlask', { with: 'acid' })
    if (!o.noPipetteRinse) step('rinsePipette', { with: 'acid' })
    step('fillPipette')
    if (!o.noAdjust) step('adjustPipette')
    step('deliverPipette')
    if (n === 0) step('chooseIndicator', { indicator })
    step('addIndicator')
    const start = b.state.burette.reading
    step('recordReading', { which: 'initial', value: read() })
    // fast stream to about 1 cm³ before the end point, then drop by drop, swirling
    let added = 0
    const bulk = Math.floor(target - 1)
    while (added + 5 <= bulk) { step('addBase', { volume: 5 }); added += 5; if (!o.noSwirl) step('swirl') }
    if (bulk - added > 0) { step('addBase', { volume: bulk - added }); if (!o.noSwirl) step('swirl') }
    while (!b.view().flask.changed) { step('addBase', { volume: 0.05 }); if (!o.noSwirl) step('swirl') }
    step('recordReading', { which: 'final', value: read() })
    if (n === 0) step('markRough', { index: 0, rough: true })
    void start
  }
  return b
}
const answersFor = (b) => {
  const t = titres(b.state)
  const mt = Number(mean(t.concordant.length ? t.concordant : t.all).toFixed(2))
  const moles = 0.1 * mt / 1000
  return { titre: mt.toFixed(2), moles: moles.toPrecision(3), conc: (moles / 0.025).toPrecision(3) }
}
const firstTitre = (b) => b.view().runs[0].titre     // every mistake below affects the first run
const row = (g, id) => g.rows.find(r => r.id === id)

test('hands-on titration: a careful student scores every automatic mark, including technique', () => {
  for (const seed of ['hands-1', 'hands-2', 'hands-3']) {
    const b = titrate(seed)
    assert.equal(b.view().handsOn, true)
    assert.deepEqual(b.state.notes, [], seed + ': no technique notes')
    const g = gradeSession(def, { params: b.params, state: b.state, answers: answersFor(b) })
    assert.ok(row(g, 'technique'), 'technique row present')
    assert.equal(g.autoMarks, g.autoMax, seed + ': ' + JSON.stringify(g.rows.filter(r => r.auto && r.marks < r.max)))
    // the server's replay of the log gives the same state
    assert.deepEqual(replay(def, b.params, b.actions), b.state)
  }
})

test('hands-on titration: one-click sessions still replay and are not marked on technique', () => {
  const params = paramsFor(def, 'legacy', {})
  const acts = [{ type: 'fillBurette' }, { type: 'pipetteAcid' }, { type: 'chooseIndicator', payload: { indicator: 'phenolphthalein' } }, { type: 'addIndicator' }]
  const state = replay(def, params, acts)
  assert.equal(state.handsOn, false)
  assert.equal(viewOf(def, params, state).burette.apparent, state.burette.reading, 'no parallax on the one-click bench')
  const g = gradeSession(def, { params, state, answers: {} })
  assert.equal(row(g, 'technique'), undefined)
  // once the student starts working step by step, the shortcuts are refused
  const s2 = applyAction(def, params, def.initialState(params), { type: 'wearPPE', payload: { item: 'goggles' } })
  assert.throws(() => applyAction(def, params, s2, { type: 'fillBurette' }), /step by step/)
  assert.throws(() => applyAction(def, params, s2, { type: 'pipetteAcid' }), /step by step/)
})

test('hands-on titration: safety and procedure rules are enforced with clear messages', () => {
  const b = bench('rules')
  b.step('burFunnel', { place: true })
  assert.throws(() => b.step('pourIntoBurette'), /safety goggles and lab coat/)
  b.step('wearPPE', { item: 'goggles' })
  assert.throws(() => b.step('pourIntoBurette'), /lab coat/)
  b.step('wearPPE', { item: 'coat' })
  b.step('burFunnel', { place: false })
  assert.throws(() => b.step('pourIntoBurette'), /funnel/)
  assert.throws(() => b.step('fillPipette'), /Never pipette by mouth/)
  b.step('burFunnel', { place: true }); b.step('pourIntoBurette')
  assert.throws(() => b.step('rinseBurette', { with: 'naoh' }), /Rinse it before you fill it/)
  if (b.view().burette.aboveZero) assert.throws(() => b.step('recordReading', { which: 'initial', value: 0 }), /above the 0.00 mark/)
  assert.throws(() => b.step('runToWaste', { volume: 9 }), /0.1 and 5/)
  assert.throws(() => b.step('eyeLevel', { pos: 'sideways' }), LabActionError)
  assert.throws(() => b.step('swirl'), /nothing in the flask/)
  assert.throws(() => b.step('deliverPipette'), /Fill the pipette/)
})

test('hands-on titration: the flask must be washed out between runs', () => {
  const b = titrate('wash', { runs: 1 })
  b.step('newRun')
  b.step('rinsePipette', { with: 'acid' }); b.step('fillPipette'); b.step('adjustPipette')
  assert.throws(() => b.step('deliverPipette'), /rinse it with distilled water/)
  b.step('rinseFlask', { with: 'water' })
  b.step('deliverPipette')
  assert.ok(b.view().flask.hasAcid)
  assert.throws(() => b.step('rinseFlask', { with: 'acid' }), /already holds/)
})

test('hands-on titration: technique mistakes move the titre the way they would in a real lab', () => {
  const seed = 'mistakes'
  const good = firstTitre(titrate(seed))
  const cases = [
    ['noBuretteRinse', 'burette_unrinsed', +1],
    ['noPipetteRinse', 'pipette_unrinsed', -1],
    ['noAdjust', 'pipette_not_at_mark', +1],
    ['flaskAcid', 'flask_rinsed_acid', +1],
    ['funnelLeft', 'funnel_left', -1],
  ]
  for (const [opt, code, sign] of cases) {
    const b = titrate(seed, { [opt]: true })
    const d = firstTitre(b) - good
    assert.ok(sign * d > 0.08, `${opt}: titre should be ${sign > 0 ? 'larger' : 'smaller'} (difference ${d.toFixed(3)} cm³)`)
    assert.ok(techniqueIssues(b.state).some(i => i.code === code), opt + ' recorded as ' + code)
    const g = gradeSession(def, { params: b.params, state: b.state, answers: answersFor(b) })
    assert.ok(row(g, 'technique').marks < 3, opt + ' loses a technique mark')
    assert.match(row(g, 'technique').detail, /run/)
    assert.ok(b.state.notes.length && def.dataTables(b.params, b.state).some(t => t.title === 'Technique notes'))
  }
})

test('hands-on titration: an air bubble left in the jet makes the first titre too large', () => {
  // find a seed whose first fill lands on the scale, so the student can skip running some out
  let seed = null
  for (let i = 0; i < 200 && !seed; i++) {
    const b = bench('bubble-' + i)
    b.step('wearPPE', { item: 'goggles' }); b.step('wearPPE', { item: 'coat' }); b.step('burFunnel', { place: true }); b.step('pourIntoBurette')
    if (!b.view().burette.aboveZero) seed = 'bubble-' + i
  }
  assert.ok(seed, 'a seed with the level on the scale')
  const careful = titrate(seed, { runs: 1 }), sloppy = titrate(seed, { runs: 1, bubble: true })
  assert.equal(sloppy.view().burette.bubble, false, 'the bubble came out during the titration')
  const d = sloppy.view().runs[0].titre - careful.view().runs[0].titre
  assert.ok(d >= 0.1, 'titre larger by the bubble volume: ' + d)
  assert.ok(techniqueIssues(sloppy.state).some(i => i.code === 'air_bubble'))
})

test('hands-on titration: reading with the eye above the meniscus gives a parallax error', () => {
  const b = bench('parallax')
  for (const [t, p] of [['wearPPE', { item: 'goggles' }], ['wearPPE', { item: 'coat' }], ['rinseBurette', { with: 'naoh' }], ['burFunnel', { place: true }], ['pourIntoBurette'], ['burFunnel', { place: false }], ['runToWaste', { volume: 2 }]]) b.step(t, p)
  const v = b.view()
  assert.equal(v.eye, 'above', 'standing at the bench, looking down')
  assert.ok(Math.abs(v.burette.reading - v.burette.apparent - PARALLAX) < 1e-9, 'from above, the reading looks too small')
  b.step('eyeLevel', { pos: 'below' })
  assert.ok(Math.abs(b.view().burette.apparent - b.view().burette.reading - PARALLAX) < 1e-9)
  b.step('eyeLevel', { pos: 'level' })
  assert.equal(b.view().burette.apparent, b.view().burette.reading)

  const s = titrate('parallax', { parallax: true })
  const g = gradeSession(def, { params: s.params, state: s.state, answers: answersFor(s) })
  assert.equal(row(g, 'readings').marks, 0, 'readings misread by parallax')
  assert.ok(techniqueIssues(s.state).some(i => i.code === 'parallax'))
})

test('hands-on titration: unswirled alkali flashes colour, swirling makes it fade, and not swirling is recorded', () => {
  const b = titrate('swirl', { runs: 1 })
  b.step('newRun'); b.step('rinseFlask', { with: 'water' })
  if (b.state.burette.reading > 20) { b.step('burFunnel', { place: true }); b.step('pourIntoBurette'); b.step('burFunnel', { place: false }); while (b.view().burette.aboveZero) b.step('runToWaste', { volume: 0.5 }) }
  b.step('rinsePipette', { with: 'acid' }); b.step('fillPipette'); b.step('adjustPipette'); b.step('deliverPipette'); b.step('addIndicator')
  const target = trueEndpoint(b.params, 'phenolphthalein')
  for (let left = Math.floor(target - 1); left > 0; left -= 5) b.step('addBase', { volume: Math.min(5, left) })
  let v = b.view()
  assert.equal(v.flask.flash, true, 'a pink flash where the alkali landed')
  assert.equal(v.flask.changed, false)
  b.step('swirl')
  v = b.view()
  assert.equal(v.flask.flash, false, 'the flash fades on swirling')
  assert.equal(v.flask.colourName, 'colourless')
  // overshooting is possible and real
  b.step('addBase', { volume: 3 }); b.step('swirl')
  assert.equal(b.view().flask.overshot, true)

  const n = titrate('swirl', { noSwirl: true })
  assert.ok(techniqueIssues(n.state).some(i => i.code === 'not_swirled'))
})
