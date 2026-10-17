/**
 * Ohm's law: build a circuit, vary the supply voltage, measure current and
 * potential difference, and find the resistance of an unknown resistor.
 * Every reading comes from solving the circuit the student actually wired
 * (science/circuit.js); a wrong or incomplete circuit gives the readings
 * that circuit would really give, or a fault.
 *
 * Hands-on bench (session option bench: 2): the meters take a moment to
 * settle after anything is changed (wait), their last digit may flicker,
 * the resistor warms up if the switch is left closed (its resistance
 * rises, so readings drift), and the bench is switched off and tidied at
 * the end. Sessions without the option replay exactly as before.
 */
import { solveCircuit, sameNode, terminalsOf, METER } from '../science/circuit.js'
import { seeded, pick } from '../science/random.js'
import { toResolution, within, fitThroughOrigin, linearFit } from '../science/numeric.js'
import { fail } from '../engine.js'
import { flickerAlt } from '../science/instruments.js'

const NOMINAL = [10, 15, 22, 33, 47]       // E12 values, Ω
const SUPPLY_R = 0.5                       // internal resistance, Ω
const MAX_WIRES = 10                      // leads in the tray (a correct circuit needs 6)
// Hands-on bench: the resistor warms while current flows.
const HEAT_ALPHA = 6e-4                   // fractional rise in resistance per kelvin
const HEAT_K_PER_STEP = 3                 // kelvin gained per step with current flowing
const HOT_STEPS = 6                       // above this a reading counts as taken with the resistor warm
export const heatFactor = (steps) => 1 + HEAT_ALPHA * Math.min(60, HEAT_K_PER_STEP * Math.max(0, steps || 0))

export function circuitOf(params, s) {
  return {
    components: [
      { id: 'PS', type: 'supply', emf: s.supplyV, internalResistance: SUPPLY_R },
      { id: 'S1', type: 'switch', closed: s.switchClosed },
      { id: 'A1', type: 'ammeter' },
      { id: 'V1', type: 'voltmeter' },
      { id: 'R1', type: 'resistor', resistance: params.R * (s.hands ? heatFactor(s.hands.heat) : 1) },
    ],
    wires: s.wires,
  }
}

/** Is the circuit wired correctly for this experiment? Returns {ok, problems[]} */
export function checkSetup(params, s) {
  const c = circuitOf(params, s)
  const sol = solveCircuit(c)
  const problems = []
  if (!sol.ok) return { ok: false, problems: sol.problems, solution: sol }
  const vAcross = (sameNode(c, 'V1.+', 'R1.a') && sameNode(c, 'V1.-', 'R1.b')) || (sameNode(c, 'V1.+', 'R1.b') && sameNode(c, 'V1.-', 'R1.a'))
  if (!vAcross) problems.push('The voltmeter must be connected across (in parallel with) the resistor.')
  const iR = sol.current('R1'), iA = sol.current('A1')
  const loopClosed = s.switchClosed && Math.abs(iR) > 1e-6
  if (s.switchClosed && !loopClosed) problems.push('No current flows through the resistor: the circuit is not a complete loop.')
  if (loopClosed && Math.abs(Math.abs(iA) - Math.abs(iR)) > Math.abs(iR) * 0.01) problems.push('The ammeter must be in series with the resistor, so the same current flows through both.')
  if (!s.switchClosed) problems.push('Close the switch to take readings.')
  return { ok: problems.length === 0, problems, solution: sol }
}

/**
 * What the two digital meters display. On the hands-on bench a meter that
 * has not settled since the last change overshoots by a few per cent, and
 * a value between two digits flickers (alt).
 */
export function meterDisplay(params, s, sol) {
  if (!sol?.ok) return { A1: null, V1: null, alt: { A1: null, V1: null }, settled: true }
  let a = sol.readings.A1, v = sol.readings.V1
  const settled = !s.hands || s.hands.settled
  if (!settled) {
    const k = 1 + (seeded(params.seed, 'settle|' + s.hands.changes, 0, 1) < 0.5 ? -1 : 1) * seeded(params.seed, 'settleSize|' + s.hands.changes, 0.03, 0.07)
    a *= k; v *= k
  }
  const A1 = toResolution(a, METER.ammeter.resolution), V1 = toResolution(v, METER.voltmeter.resolution)
  const alt = s.hands ? { A1: flickerAlt(a, A1, METER.ammeter.resolution), V1: flickerAlt(v, V1, METER.voltmeter.resolution) } : { A1: null, V1: null }
  return { A1, V1, alt, settled }
}
const flowing = (params, s) => {
  if (!s.switchClosed) return false
  const sol = solveCircuit(circuitOf(params, s))
  return !!sol.ok && Math.abs(sol.current('R1')) > 1e-6
}
const changed = (params, s) => {             // something changed: meters swing, the resistor warms if current flows
  if (!s.hands) return
  s.hands.settled = false; s.hands.changes += 1; s.hands.tidy = false
  if (flowing(params, s)) s.hands.heat += 1
}
const needHands = (s) => { if (!s.hands) fail('This step is part of the hands-on bench. Start a new attempt to use it.') }

const def = {
  id: 'phys-ohms-law',
  version: 1,
  subject: 'physics',
  title: "Ohm's law",
  summary: 'Build a circuit to measure current and potential difference for a resistor, plot a graph and find its resistance.',
  durationMin: 40,
  difficulty: 'core',
  curriculum: [
    { board: 'Cambridge', level: 'IGCSE', subject: 'Physics', topic: 'Electricity: current, potential difference and resistance', syllabusRef: null, verified: false },
    { board: 'Pearson Edexcel', level: 'International GCSE', subject: 'Physics', topic: 'Electricity: current, voltage and resistance', syllabusRef: null, verified: false },
    { board: 'Cambridge', level: 'AS & A Level', subject: 'Physics', topic: 'D.C. circuits: resistance and Ohm’s law', syllabusRef: null, verified: false },
    { board: 'IB', level: 'Diploma Programme', subject: 'Physics', topic: 'Electricity: circuits and resistance', syllabusRef: null, verified: false },
  ],
  skills: ['Building a circuit from a diagram', 'Using ammeters and voltmeters', 'Plotting and interpreting a V–I graph'],
  objectives: [
    'Connect an ammeter in series and a voltmeter in parallel.',
    'Take a set of current and potential difference readings over a range of supply voltages.',
    'Plot V against I and use the gradient to find the resistance.',
    'Decide whether the resistor obeys Ohm’s law.',
  ],
  prerequisites: ['Circuit symbols', 'V = I R'],
  safety: [
    'Low-voltage supplies only. Switch off between readings so components do not heat up.',
    'A short circuit (for example an ammeter connected straight across the supply) trips the supply.',
    'This is a virtual practice. It does not replace any practical work your examination board requires.',
  ],
  apparatus: ['variable_supply', 'switch', 'ammeter', 'voltmeter', 'resistor', 'leads'],
  materials: [],
  procedure: [
    'Connect the supply, switch, ammeter and resistor in a single loop (series).',
    'Connect the voltmeter across the resistor.',
    'Set the supply to 1.0 V, close the switch and record the ammeter and voltmeter readings. Open the switch.',
    'Repeat for at least five more supply settings up to 12 V.',
    'Plot potential difference (y) against current (x) and draw a line of best fit.',
    'Calculate the resistance from the gradient.',
  ],
  model: {
    kind: 'quantitative',
    summary: 'Readings come from solving the wired circuit with Kirchhoff’s laws (modified nodal analysis).',
    assumptions: [
      'The resistor is ohmic and its temperature does not change.',
      'The supply has an internal resistance of 0.5 Ω, so the voltage across the resistor is less than the supply setting.',
      'The ammeter has a resistance of 0.01 Ω and the voltmeter 10 MΩ; leads have no resistance.',
      'Meters show 0.001 A and 0.01 V resolution.',
    ],
  },
  notebook: {
    aim: 'To find the resistance of a resistor and test whether it obeys Ohm’s law.',
    variables: 'Independent: potential difference (V). Dependent: current (A). Controlled: the resistor, temperature.',
  },

  params(seed, options = {}) {
    const nominal = pick(seed, 'nominal', NOMINAL)
    const p = { seed, nominal, R: Number((nominal * seeded(seed, 'tolerance', 0.95, 1.05)).toFixed(2)) } // R hidden
    if (Number(options?.bench) >= 2) p._bench = 2
    return p
  },

  initialState(params = {}) {
    return { wires: [], wireColours: [], supplyV: 0, switchClosed: false, rows: [],
      ...(params._bench >= 2 ? { hands: { settled: true, changes: 0, heat: 0, tidy: false } } : {}) }
  },

  actions: {
    connect(s, { a, b, colour }, params) {
      const valid = (t) => { const [id, term] = String(t).split('.'); const type = { PS: 'supply', S1: 'switch', A1: 'ammeter', V1: 'voltmeter', R1: 'resistor' }[id]; return type && terminalsOf(type).includes(term) }
      if (!valid(a) || !valid(b)) fail('Connect two terminals.')
      if (a === b) fail('A lead needs two different terminals.')
      if (a.split('.')[0] === b.split('.')[0]) fail('Do not connect a component to itself.')
      if (s.wires.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) fail('Those terminals are already connected.')
      if (s.wires.length >= MAX_WIRES) fail('That is more leads than this circuit needs.')
      s.wires.push([a, b])
      s.wireColours = s.wireColours || []
      s.wireColours[s.wires.length - 1] = colour === 'black' ? 'black' : 'red'
      changed(params, s)
    },
    disconnect(s, { index }, params) {
      if (!s.wires[index]) fail('No such lead.')
      s.wires.splice(index, 1)
      s.wireColours?.splice(index, 1)
      changed(params, s)
    },
    clearWires(s, _p, params) { s.wires = []; s.wireColours = []; changed(params, s) },
    setSupply(s, { volts }, params) {
      const v = Number(volts)
      if (!Number.isFinite(v) || v < 0 || v > 12) fail('The supply goes from 0 to 12 V.')
      const before = s.supplyV
      s.supplyV = Math.round(v * 2) / 2
      if (s.supplyV !== before) changed(params, s)
    },
    toggleSwitch(s, _p, params) {
      s.switchClosed = !s.switchClosed
      if (s.hands && !s.switchClosed) s.hands.heat = Math.floor(s.hands.heat / 2)     // the resistor starts to cool
      changed(params, s)
    },
    recordRow(s, { V, I }, params) {
      const v = Number(V), i = Number(I)
      if (!Number.isFinite(v) || !Number.isFinite(i)) fail('Enter both readings as numbers.')
      if (s.rows.length >= 15) fail('Fifteen readings are plenty.')
      const chk = checkSetup(params, s)
      const m = meterDisplay(params, s, chk.solution)
      const row = { V: v, I: i, supply: s.supplyV, trueV: m.V1, trueI: m.A1, validSetup: chk.ok }
      if (s.hands) {
        row.altV = m.alt.V1; row.altI = m.alt.A1
        row.settled = m.settled; row.hot = s.hands.heat > HOT_STEPS
        if (flowing(params, s)) s.hands.heat += 1
        s.hands.tidy = false
      }
      s.rows.push(row)
    },
    // ── Hands-on bench ─────────────────────────────────────
    wait(s, _p, params) {
      needHands(s)
      s.hands.settled = true
      if (flowing(params, s)) s.hands.heat += 1
      else s.hands.heat = Math.max(0, s.hands.heat - 4)
    },
    tidyUp(s) {
      needHands(s)
      if (s.switchClosed) fail('Open the switch before you tidy away.')
      if (s.supplyV !== 0) fail('Turn the supply down to 0 V and switch it off before you tidy away.')
      s.hands.tidy = true
    },
    deleteRow(s, { index }) {
      if (!s.rows[index]) fail('No such reading.')
      s.rows.splice(index, 1)
    },
  },

  view(params, s) {
    const chk = checkSetup(params, s)
    const sol = chk.solution
    const md = meterDisplay(params, s, sol)
    const meters = { A1: md.A1, V1: md.V1 }
    return {
      ...(s.hands ? { bench: 2, hands: { ...s.hands, hot: s.hands.heat > HOT_STEPS, heatFrac: Math.min(1, (heatFactor(s.hands.heat) - 1) / (heatFactor(1e9) - 1)), metersAlt: md.alt } } : {}),
      supplyV: s.supplyV, switchClosed: s.switchClosed, wires: s.wires, wireColours: s.wireColours || [], maxLeads: MAX_WIRES,
      fault: sol && !sol.ok ? sol.fault : null,
      problems: chk.problems, setupOk: chk.ok, meters,
      rows: s.rows,
      fit: fitThroughOrigin(s.rows.map(r => ({ x: r.I, y: r.V }))),
      line: linearFit(s.rows.map(r => ({ x: r.I, y: r.V }))),
    }
  },

  dataTables(params, s) {
    return [{
      title: 'Readings',
      columns: ['#', 'Supply / V', 'p.d. V / V', 'Current I / A', 'V / I / Ω'],
      derived: [4],
      rows: s.rows.map((r, i) => [String(i + 1), r.supply.toFixed(1), r.V.toFixed(2), r.I.toFixed(3), r.I ? (r.V / r.I).toFixed(1) : '—']),
    }]
  },
  graph(params, s) {
    const pts = s.rows.map(r => ({ x: r.I, y: r.V }))
    const fit = fitThroughOrigin(pts)
    return { title: 'Potential difference against current', xLabel: 'Current I / A', yLabel: 'p.d. V / V', points: pts, line: fit ? { m: fit.m, c: 0 } : null }
  },

  questions: [
    { id: 'gradient', type: 'numeric', unit: 'Ω', prompt: 'Resistance from the gradient of your V–I graph', hint: '3 significant figures.' },
    { id: 'ohmic', type: 'choice', prompt: 'Does the resistor obey Ohm’s law?', options: ['Yes: V is proportional to I (straight line through the origin)', 'No: the graph is curved or does not pass through the origin'] },
    { id: 'switch_reason', type: 'text', prompt: 'Why should the switch be opened between readings?' },
    { id: 'evaluation', type: 'text', prompt: 'How could you make your value of resistance more reliable?' },
  ],

  expected({ params, state }) {
    const fit = fitThroughOrigin(state.rows.map(r => ({ x: r.I, y: r.V })))
    return { gradient: fit ? Number(fit.m.toPrecision(3)) : null, trueR: params.R, ohmic: 0 }
  },

  rubric: [
    { id: 'circuit', label: 'Circuit built correctly (ammeter in series, voltmeter in parallel)', marks: 2, auto: ({ state }) => {
      const valid = state.rows.filter(r => r.validSetup).length
      return { marks: valid >= 5 ? 2 : valid >= 1 ? 1 : 0, detail: valid + ' of ' + state.rows.length + ' readings taken with a correct circuit.' }
    } },
    { id: 'range', label: 'Enough readings over a good range', marks: 1, auto: ({ state }) => {
      const good = state.rows.filter(r => r.validSetup)
      const span = good.length ? Math.max(...good.map(r => r.supply)) - Math.min(...good.map(r => r.supply)) : 0
      return { marks: good.length >= 6 && span >= 6 ? 1 : 0, detail: good.length + ' valid readings over ' + span + ' V of supply.' }
    } },
    { id: 'recording', label: 'Readings recorded as shown on the meters', marks: 1, auto: ({ state }) => {
      const good = state.rows.filter(r => r.validSetup)
      if (!good.length) return { marks: 0, detail: 'No valid readings.' }
      const bad = good.filter(r => !within(r.V, r.trueV, { abs: 0.011 }) || !within(r.I, r.trueI, { abs: 0.0011 }))
      return { marks: bad.length ? 0 : 1, detail: bad.length ? bad.length + ' reading(s) differ from the meters.' : 'All readings match the meters.' }
    } },
    { id: 'resistance', label: 'Resistance: method and accuracy', marks: 2, auto: (ctx) => {
      const a = Number(ctx.answers.gradient)
      if (!Number.isFinite(a) || !a) return { marks: 0, detail: 'No resistance given.' }
      const e = def.expected(ctx)
      let m = 0
      if (e.gradient != null && within(a, e.gradient, { rel: 0.03 })) m += 1
      if (within(a, ctx.params.R, { rel: 0.03 })) m += 1
      return { marks: m, detail: 'From your data: ' + (e.gradient ?? '—') + ' Ω. True value: ' + ctx.params.R + ' Ω.' }
    } },
    { id: 'technique', label: 'Meters allowed to settle; switch opened between readings so the resistor stays cool', marks: 1, auto: ({ state }) => {
      if (!state.hands) return { na: true }                // sessions from before the hands-on bench
      const good = state.rows.filter(r => r.validSetup)
      if (!good.length) return { marks: 0, detail: 'No valid readings.' }
      const unsettled = good.filter(r => r.settled === false).length, hot = good.filter(r => r.hot).length
      const p = [unsettled ? unsettled + ' reading(s) recorded before the meters had settled.' : '', hot ? hot + ' reading(s) taken with the resistor warm: open the switch between readings.' : ''].filter(Boolean)
      return { marks: p.length ? 0 : 1, detail: p.length ? p.join(' ') : 'Meters settled before every reading; the resistor stayed cool.' }
    } },
    { id: 'safety', label: 'Switched off and tidied away at the end', marks: 1, auto: ({ state }) => {
      if (!state.hands) return { na: true }
      return state.hands.tidy && !state.switchClosed && state.supplyV === 0 ? { marks: 1, detail: 'Supply at 0 V, switch open, bench tidied.' } : { marks: 0, detail: 'Open the switch, turn the supply to 0 V and tidy away at the end.' }
    } },
    { id: 'ohmic', label: 'Correct conclusion about Ohm’s law', marks: 1, auto: ({ answers }) => ({ marks: Number(answers.ohmic) === 0 ? 1 : 0, detail: 'The resistor is ohmic in this model.' }) },
    { id: 'report', label: 'Graph, explanation and evaluation', marks: 4, auto: null, guidance: 'Graph with labelled axes and units (1), switch/heating explained (1), two sensible improvements (2).' },
  ],
}

export default def
