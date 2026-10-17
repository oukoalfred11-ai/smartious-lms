/**
 * Osmosis in potato tissue: find the sucrose concentration that is
 * isotonic with potato cells. Mass changes come from the simplified model
 * in science/osmosis.js, which is labelled as such to students.
 *
 * Two ways of working share one engine:
 *   • The original bench (recordInitial on ready-cut cylinders, immerse all,
 *     wait, remove, recordFinal). Older sessions use it and still replay.
 *   • The step-by-step (hands-on) bench: cut cylinders with a cork borer,
 *     trim them to equal length against a ruler with a scalpel, blot them,
 *     tare the balance, weigh each one, place each in its labelled boiling
 *     tube, start the timer, fast-forward the lab clock, remove, blot and
 *     reweigh. The first hands-on action switches the session to this bench.
 *     Mistakes (not blotting, not taring, unequal lengths, the wrong tube)
 *     change the balance readings as they would in a real lab and are
 *     recorded as technique notes for the rubric and report.
 */
import { massAfter, percentFromMasses, percentChange, DEFAULTS } from '../science/osmosis.js'
import { seeded } from '../science/random.js'
import { toResolution, within, linearFit } from '../science/numeric.js'
import { fail } from '../engine.js'

const CONCS = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
const BALANCE_RES = 0.01
const MAX_TIME = 24 * 60
const MASS_PER_MM = 0.0543          // g per mm of an 8 mm cork-borer cylinder (area 50 mm², density 1.08 g cm⁻³)
const BORER_R = 4                   // mm
const START_CLOCK = 9 * 60          // the lab clock reads 09:00 when the practical starts

/** Technique problems: code → what an examiner would write. */
export const OSMOSIS_TECHNIQUE = {
  unequal_length: 'Cylinders not trimmed to the same length: the samples were not the same size, so it was not a fair test.',
  unblotted_initial: 'Cylinder not blotted before the first weighing: surface liquid from cutting was weighed with it.',
  unblotted_final: 'Cylinder not blotted after it was taken out of the solution: solution on its surface was weighed with it, so the final mass is too large.',
  not_tared: 'Balance not tared with the weighing boat on it: every mass includes the mass of the boat.',
  wrong_tube: 'A cylinder was put into a tube of a different concentration from the one it was weighed for.',
}

const newCyl = () => ({ length: null, trimmed: false, wet: false, tube: null })

function hands(s) {
  if (s.handsOn == null) s.handsOn = false
  if (s.cut == null) s.cut = false
  if (!s.cyl) s.cyl = CONCS.map(newCyl)
  if (s.onPan === undefined) s.onPan = null
  if (s.tared == null) s.tared = false
  if (!s.notes) s.notes = []
  return s
}
function goHands(s) { hands(s); s.handsOn = true }
function note(s, code, index) {
  const at = index == null ? null : CONCS[index].toFixed(1) + ' mol dm⁻³'
  if (!s.notes.some(x => x.code === code && x.at === at)) s.notes.push({ code, at, text: OSMOSIS_TECHNIQUE[code] })
}
const cylAt = (s, index) => { const c = s.cyl[index]; if (!c) fail('No such cylinder.'); return c }
const r4 = (x) => Number(x.toFixed(4))

/** Hands-on: the tissue mass of cylinder i, before (stage 0) or after (stage 1) the solution. */
function tissueMass(params, s, i, stage) {
  const c = s.cyl[i]
  const m0 = c.length * MASS_PER_MM * (1 + seeded(params.seed, 'dens' + i, -0.02, 0.02))
  if (!stage) return m0
  const t = s.tubes[i]
  const minutes = t.removedAt - s.immersedAt
  // Shorter pieces have more surface for their volume, so they change a little faster.
  const tau = DEFAULTS.tau * (2 / BORER_R + 2 / 40) / (2 / BORER_R + 2 / c.length)
  const noise = seeded(params.seed, 'blot' + i, -0.02, 0.02)
  return massAfter(m0, CONCS[c.tube], params.Ciso, minutes, { ...DEFAULTS, tau }) + noise
}
/** Hands-on: what the balance shows (boat, unless tared, plus whatever is on the pan). */
function balanceReading(params, s) {
  const boat = s.tared ? 0 : seeded(params.seed, 'boat', 1.2, 1.6)
  const i = s.onPan
  if (i == null) return toResolution(boat, BALANCE_RES)
  const c = s.cyl[i], t = s.tubes[i]
  const stage = t.removedAt != null ? 1 : 0
  const surface = c.wet ? seeded(params.seed, (stage ? 'cling' : 'sap') + i, stage ? 0.08 : 0.03, stage ? 0.15 : 0.07) : 0
  return toResolution(boat + tissueMass(params, s, i, stage) + surface, BALANCE_RES)
}
const outOfSolution = (s, i) => s.cyl[i].tube == null || s.tubes[i].removedAt != null

/** One-click bench: true (unrounded) masses for tube i. */
function trueMasses(params, s, i) {
  const t = s.tubes[i]
  const m0 = params.m0[i]
  if (t.removedAt == null) return { m0, m1: null }
  const minutes = t.removedAt - s.immersedAt
  const noise = seeded(params.seed, 'blot' + i, -0.02, 0.02)
  return { m0, m1: massAfter(m0, CONCS[i], params.Ciso, minutes) + noise, minutes }
}

/** Isotonic concentration estimated from a set of (C, % change) points: x-intercept by interpolation. */
export function isotonicFrom(points) {
  const pts = points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y)).sort((a, b) => a.x - b.x)
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]
    if (a.y === 0) return a.x
    if (Math.sign(a.y) !== Math.sign(b.y)) return a.x + (0 - a.y) * (b.x - a.x) / (b.y - a.y)
  }
  const f = linearFit(pts)
  return f && f.m !== 0 ? -f.c / f.m : null
}

/** Distinct technique problems (hands-on bench only). */
export function osmosisIssues(state) {
  const out = new Map()
  for (const n of state.notes || []) {
    if (!out.has(n.code)) out.set(n.code, { code: n.code, text: n.text, at: [] })
    if (n.at) out.get(n.code).at.push(n.at)
  }
  return [...out.values()]
}

export const clockText = (minutes) => {
  const m = (START_CLOCK + Math.round(minutes)) % (24 * 60)
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
}

const def = {
  id: 'bio-osmosis',
  version: 1,
  subject: 'biology',
  title: 'Osmosis in potato tissue',
  summary: 'Measure the change in mass of potato cylinders in sucrose solutions and find the concentration that is isotonic with the cells.',
  durationMin: 45,
  difficulty: 'core',
  curriculum: [
    { board: 'Cambridge', level: 'IGCSE', subject: 'Biology', topic: 'Movement into and out of cells: osmosis', syllabusRef: null, verified: false },
    { board: 'Pearson Edexcel', level: 'International GCSE', subject: 'Biology', topic: 'Movement of substances into and out of cells', syllabusRef: null, verified: false },
    { board: 'Cambridge', level: 'AS & A Level', subject: 'Biology', topic: 'Cell membranes and transport: water potential', syllabusRef: null, verified: false },
    { board: 'IB', level: 'Diploma Programme', subject: 'Biology', topic: 'Membranes and transport: osmosis and water potential', syllabusRef: null, verified: false },
  ],
  skills: ['Using a cork borer and scalpel safely', 'Using a balance', 'Calculating percentage change', 'Plotting and interpolating a graph', 'Identifying variables'],
  objectives: [
    'Explain osmosis in terms of water potential and a partially permeable membrane.',
    'Prepare equal potato cylinders and measure mass changes accurately.',
    'Calculate percentage change, plot it against sucrose concentration and estimate the isotonic point.',
    'Evaluate the reliability of the method.',
  ],
  prerequisites: ['Diffusion', 'Cell membranes', 'Percentage change'],
  safety: ['Take care when cutting with a scalpel or cork borer: cut downwards onto a tile, away from your fingers.', 'This is a virtual practice using a simplified model. It does not replace any practical work your examination board requires.'],
  apparatus: ['boiling_tubes', 'rack', 'balance', 'potato_cylinders', 'paper_towel', 'timer', 'cork borer, white tile, scalpel and 30 cm ruler', 'weighing boat'],
  materials: ['A potato', 'Sucrose solutions: 0.0, 0.2, 0.4, 0.6, 0.8 and 1.0 mol dm⁻³ in labelled boiling tubes'],
  procedure: [
    'Use a cork borer to cut six potato cylinders. On a white tile, trim each with a scalpel against a ruler to the same length (for example 40 mm).',
    'Blot each cylinder dry on a paper towel.',
    'Put the weighing boat on the balance and tare (zero) it.',
    'Weigh each cylinder and record its initial mass (to 0.01 g).',
    'Place each cylinder in its labelled tube of sucrose solution and start the timer.',
    'Leave the cylinders for at least 30 minutes (the longer, the closer to equilibrium).',
    'Remove each cylinder, blot it dry in the same way, and weigh it again.',
    'Calculate the percentage change in mass for each concentration.',
    'Plot % change (y) against concentration (x) and find where the line crosses zero.',
  ],
  model: {
    kind: 'simplified',
    summary: 'A simplified educational model: % change in mass is proportional to the difference between the tissue’s isotonic concentration and the solution, approached exponentially with time and capped by turgor and plasmolysis.',
    assumptions: [
      'Potato tissue has a single isotonic concentration between 0.24 and 0.36 mol dm⁻³ (it varies between real potatoes).',
      'Equilibrium % change = 40 × (C_iso − C), capped at +18 % (full turgor) and −32 % (plasmolysis).',
      'Change with time: Δ%(t) = Δ%eq × (1 − e^(−t/45 min)) for a 40 mm cylinder; shorter pieces change a little faster.',
      'Each final weighing includes a small blotting error of up to ±0.02 g. An unblotted cylinder carries 0.03–0.07 g of liquid after cutting and 0.08–0.15 g after the solution.',
      'Sucrose entering cells, cut-surface damage and temperature are not modelled. These are simulated values, not real measurements.',
    ],
  },
  notebook: {
    aim: 'To find the concentration of sucrose solution that is isotonic with potato tissue.',
    variables: 'Independent: sucrose concentration. Dependent: % change in mass. Controlled: size and type of potato, time in solution, volume of solution, temperature, blotting method.',
  },

  params(seed) {
    return {
      seed,
      Ciso: Number(seeded(seed, 'Ciso', 0.24, 0.36).toFixed(3)),             // hidden
      m0: CONCS.map((_, i) => Number(seeded(seed, 'm0' + i, 1.80, 2.40).toFixed(4))),
      concentrations: CONCS,
    }
  },

  initialState() {
    return hands({ clock: 0, immersedAt: null, tubes: CONCS.map(() => ({ m0: null, m1: null, removedAt: null })), selected: 0 })
  },

  actions: {
    select(s, { index }) { if (!s.tubes[index]) fail('No such tube.'); s.selected = index },

    // ── Step-by-step bench ───────────────────────────────────
    cutCylinders(s, _p, params) {
      goHands(s)
      if (s.cut) fail('You have already cut six cylinders.')
      if (s.immersedAt != null || s.tubes.some(t => t.m0 != null)) fail('The cylinders have already been prepared and weighed.')
      s.cut = true
      s.cyl.forEach((c, i) => { c.length = Number(seeded(params.seed, 'len' + i, 42, 58).toFixed(1)); c.wet = true })
    },
    trimCylinder(s, { index, length }, params) {
      goHands(s)
      if (!s.cut) fail('Cut the cylinders with the cork borer first.')
      const c = cylAt(s, index)
      if (c.tube != null) fail('That cylinder is already in its tube.')
      if (s.tubes[index].m0 != null) fail('That cylinder has been weighed; trimming it now would make the initial mass wrong.')
      const L = Number(length)
      if (!Number.isFinite(L) || L < 20) fail('Trim to at least 20 mm, or the cylinder is too small to weigh accurately.')
      if (L > c.length - 0.5) fail('The cylinder is ' + c.length.toFixed(0) + ' mm long; you can only make it shorter.')
      // A scalpel cut against a ruler is good to about half a millimetre.
      c.length = Number((L + seeded(params.seed, 'trim' + index + '|' + L, -0.4, 0.4)).toFixed(2))
      c.trimmed = true; c.wet = true
      s.selected = index
    },
    blot(s, { index }) {
      goHands(s)
      const c = cylAt(s, index)
      if (!s.cut) fail('Cut the cylinders first.')
      if (!outOfSolution(s, index)) fail('Take the cylinder out of the solution first.')
      c.wet = false
      s.selected = index
    },
    putOnPan(s, { index }) {
      goHands(s)
      if (!s.cut) fail('Cut the cylinders first.')
      cylAt(s, index)
      if (!outOfSolution(s, index)) fail('That cylinder is in its tube of solution.')
      s.onPan = index
      s.selected = index
    },
    clearPan(s) { goHands(s); s.onPan = null },
    tareBalance(s) {
      goHands(s)
      if (s.onPan != null) fail('Take the cylinder off the pan before you tare (zero) the balance.')
      s.tared = true
    },
    placeInTube(s, { index, tube }) {
      goHands(s)
      const c = cylAt(s, index)
      const k = tube == null ? index : Number(tube)
      if (!s.tubes[k]) fail('No such tube.')
      if (c.tube != null) fail('That cylinder is already in a tube.')
      if (s.cyl.some(x => x.tube === k)) fail('That tube already has a cylinder in it.')
      if (s.tubes[index].m0 == null) fail('Weigh the cylinder and record its initial mass first.')
      if (s.immersedAt != null) fail('The timer is running. Place every cylinder before you start it.')
      c.tube = k; c.wet = true
      if (s.onPan === index) s.onPan = null
      if (k !== index) note(s, 'wrong_tube', index)
      s.selected = index
    },
    startTimer(s) {
      goHands(s)
      if (s.immersedAt != null) fail('The timer is already running.')
      if (s.cyl.some(c => c.tube == null)) fail('Place every cylinder in its tube first.')
      const L = s.cyl.map(c => c.length)
      if (Math.max(...L) - Math.min(...L) > 1.0) note(s, 'unequal_length')
      s.immersedAt = s.clock
    },

    // ── Used by both ─────────────────────────────────────────
    recordInitial(s, { index, value }, params) {
      hands(s)
      const t = s.tubes[index]
      if (!t) fail('No such tube.')
      if (s.immersedAt != null) fail('Weigh every cylinder before placing them in the solutions.')
      const v = Number(value)
      if (!(v > 0) || v > 10) fail('Enter the mass in grams shown on the balance.')
      if (s.handsOn) {
        if (!s.cut) fail('Cut the cylinders with the cork borer first.')
        if (s.cyl[index].tube != null) fail('That cylinder is already in its tube.')
        if (s.onPan !== index) fail('Put this cylinder on the balance pan to weigh it.')
        t.shown0 = balanceReading(params, s)
        if (s.cyl[index].wet) note(s, 'unblotted_initial', index)
        if (!s.tared) note(s, 'not_tared')
      }
      t.m0 = v
    },
    immerse(s) {
      hands(s)
      if (s.handsOn) fail('Place each cylinder in its labelled tube, then start the timer.')
      if (s.immersedAt != null) fail('The cylinders are already in the solutions.')
      if (s.tubes.some(t => t.m0 == null)) fail('Record the initial mass of every cylinder first.')
      s.immersedAt = s.clock
    },
    wait(s, { minutes }) {
      const m = Number(minutes)
      if (!(m > 0) || m > 240) fail('Wait between 1 and 240 minutes at a time.')
      if (s.immersedAt == null) fail('Place the cylinders in the solutions first.')
      if (s.clock + m > MAX_TIME) fail('The experiment runs for up to 24 hours.')
      s.clock += m
    },
    remove(s, { index }) {
      hands(s)
      const t = s.tubes[index]
      if (!t) fail('No such tube.')
      if (s.immersedAt == null) fail('Place the cylinders in the solutions first.')
      if (t.removedAt != null) fail('That cylinder has already been removed.')
      if (s.clock - s.immersedAt < 1) fail('Leave the cylinders in the solutions for a while first.')
      t.removedAt = s.clock
      if (s.handsOn) { s.cyl[index].wet = true; s.selected = index }
    },
    recordFinal(s, { index, value }, params) {
      hands(s)
      const t = s.tubes[index]
      if (!t) fail('No such tube.')
      if (t.removedAt == null) fail(s.handsOn ? 'Take the cylinder out of its tube before weighing it.' : 'Remove and blot the cylinder before weighing it.')
      const v = Number(value)
      if (!(v > 0) || v > 10) fail('Enter the mass in grams shown on the balance.')
      if (s.handsOn) {
        if (s.onPan !== index) fail('Put this cylinder on the balance pan to weigh it.')
        t.shown1 = balanceReading(params, s)
        if (s.cyl[index].wet) note(s, 'unblotted_final', index)
        if (!s.tared) note(s, 'not_tared')
      }
      t.m1 = v
    },
  },

  view(params, s0) {
    const s = hands(JSON.parse(JSON.stringify(s0)))
    const i = s.selected
    const t = s.tubes[i]
    let balance
    if (s.handsOn) balance = balanceReading(params, s)
    else {
      const tm = trueMasses(params, s, i)
      const onBalance = s.immersedAt == null ? tm.m0 : t.removedAt != null ? tm.m1 : null
      balance = onBalance != null ? toResolution(onBalance, BALANCE_RES) : null
    }
    return {
      clock: s.clock, immersed: s.immersedAt != null,
      elapsed: s.immersedAt != null ? s.clock - s.immersedAt : 0,
      clockTime: clockText(s.clock),
      selected: i,
      balance,
      handsOn: s.handsOn, cut: s.cut, tared: s.tared, onPan: s.onPan,
      tubes: s.tubes.map((x, k) => {
        const pc = x.m0 != null && x.m1 != null ? percentFromMasses(x.m0, x.m1) : null
        const tubeC = s.handsOn && s.cyl[k].tube != null ? CONCS[s.cyl[k].tube] : CONCS[k]
        // Visual cue only: how swollen / limp the tissue looks.
        const visual = s.immersedAt != null ? percentChange(tubeC, params.Ciso, (x.removedAt ?? s.clock) - s.immersedAt) : 0
        return { C: CONCS[k], m0: x.m0, m1: x.m1, removed: x.removedAt != null, percent: pc != null ? Number(pc.toFixed(1)) : null, visual }
      }),
      cylinders: s.cyl.map((c, k) => ({
        length: c.length, trimmed: c.trimmed, wet: c.wet, tube: c.tube,
        inSolution: c.tube != null && s.tubes[k].removedAt == null, onPan: s.onPan === k,
      })),
      notes: s.notes.map(n => ({ ...n })),
    }
  },

  dataTables(params, s0) {
    const s = hands(JSON.parse(JSON.stringify(s0)))
    const tables = [{
      title: 'Mass of potato cylinders',
      columns: ['Sucrose / mol dm⁻³', 'Initial mass / g', 'Final mass / g', 'Change in mass / %'],
      derived: [3],
      rows: s.tubes.map((t, i) => [CONCS[i].toFixed(1), t.m0 != null ? t.m0.toFixed(2) : '—', t.m1 != null ? t.m1.toFixed(2) : '—',
        t.m0 != null && t.m1 != null ? percentFromMasses(t.m0, t.m1).toFixed(1) : '—']),
    }]
    if (s.handsOn && s.notes.length) tables.push({ title: 'Technique notes', columns: ['Cylinder', 'What happened'], derived: [], rows: s.notes.map(n => [n.at || 'all', n.text]) })
    return tables
  },
  graph(params, s) {
    const pts = s.tubes.map((t, i) => (t.m0 != null && t.m1 != null ? { x: CONCS[i], y: percentFromMasses(t.m0, t.m1) } : null)).filter(Boolean)
    const fit = linearFit(pts)
    return { title: 'Change in mass against sucrose concentration', xLabel: 'Sucrose concentration / mol dm⁻³', yLabel: 'Change in mass / %', points: pts, line: fit ? { m: fit.m, c: fit.c } : null }
  },

  questions: [
    { id: 'isotonic', type: 'numeric', unit: 'mol dm⁻³', prompt: 'Sucrose concentration isotonic with the potato tissue', hint: 'Read from where your line crosses 0 % change. 2 significant figures.' },
    { id: 'explain', type: 'text', prompt: 'Explain, using water potential, why the cylinder in 0.0 mol dm⁻³ gained mass and the one in 1.0 mol dm⁻³ lost mass.' },
    { id: 'evaluation', type: 'text', prompt: 'Suggest two ways to make the results more reliable.' },
  ],

  expected({ params, state }) {
    const pts = state.tubes.map((t, i) => (t.m0 != null && t.m1 != null ? { x: CONCS[i], y: percentFromMasses(t.m0, t.m1) } : null)).filter(Boolean)
    const est = pts.length >= 2 ? isotonicFrom(pts) : null
    return { isotonic: est != null ? Number(est.toFixed(3)) : null, trueIsotonic: params.Ciso }
  },

  rubric: [
    { id: 'initial', label: 'Initial masses recorded correctly', marks: 1, auto: ({ params, state }) => {
      const shown = (t, i) => (state.handsOn ? t.shown0 : toResolution(params.m0[i], BALANCE_RES))
      const bad = state.tubes.filter((t, i) => t.m0 == null || shown(t, i) == null || !within(t.m0, shown(t, i), { abs: 0.011 }))
      return { marks: bad.length ? 0 : 1, detail: bad.length ? bad.length + ' initial mass(es) missing or misread.' : 'All initial masses correct.' }
    } },
    { id: 'time', label: 'Cylinders left long enough (≥ 30 min)', marks: 1, auto: ({ state }) => {
      const times = state.tubes.filter(t => t.removedAt != null).map(t => t.removedAt - state.immersedAt)
      const ok = times.length === state.tubes.length && times.every(m => m >= 30)
      return { marks: ok ? 1 : 0, detail: times.length ? 'Shortest time: ' + Math.min(...times) + ' min.' : 'No cylinders removed.' }
    } },
    { id: 'final', label: 'Final masses recorded for every concentration', marks: 1, auto: ({ state }) => {
      const done = state.tubes.filter(t => t.m1 != null).length
      const misread = state.handsOn ? state.tubes.filter(t => t.m1 != null && !within(t.m1, t.shown1, { abs: 0.011 })).length : 0
      const ok = done === state.tubes.length && !misread
      return { marks: ok ? 1 : 0, detail: done + ' of ' + state.tubes.length + ' final masses recorded.' + (misread ? ' ' + misread + ' misread from the balance.' : '') }
    } },
    { id: 'technique', label: 'Preparing and weighing the cylinders', marks: 3, auto: ({ state }) => {
      if (!state.handsOn) return { na: true }      // ready-cut cylinders (older sessions): technique was not observed
      if (!state.tubes.some(t => t.m1 != null)) return { marks: 0, detail: 'No cylinders reweighed.' }
      const issues = osmosisIssues(state)
      if (!issues.length) return { marks: 3, detail: 'Cylinders trimmed to equal length, blotted before each weighing, balance tared, each in its own labelled tube.' }
      return { marks: Math.max(0, 3 - issues.length), detail: issues.map(i => i.text + (i.at.length ? ' (' + i.at.join(', ') + ')' : '')).join(' ') }
    } },
    { id: 'isotonic', label: 'Isotonic concentration: method and accuracy', marks: 2, auto: (ctx) => {
      const a = Number(ctx.answers.isotonic)
      if (!Number.isFinite(a) || ctx.answers.isotonic === '' || ctx.answers.isotonic == null) return { marks: 0, detail: 'No estimate given.' }
      const e = def.expected(ctx)
      let m = 0
      if (e.isotonic != null && within(a, e.isotonic, { abs: 0.03 })) m += 1
      if (within(a, ctx.params.Ciso, { abs: 0.05 })) m += 1
      return { marks: m, detail: 'From your data: ' + (e.isotonic ?? '—') + ' mol dm⁻³. Model value: ' + ctx.params.Ciso + ' mol dm⁻³.' }
    } },
    { id: 'report', label: 'Explanation, graph and evaluation', marks: 5, auto: null, guidance: 'Water potential explanation for gain and loss (2), graph with axes, units and line of best fit (1), two improvements (2). Where the technique notes list mistakes, credit an evaluation that identifies them.' },
  ],
}

export default def
