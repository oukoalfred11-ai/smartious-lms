/**
 * Osmosis in potato tissue: find the sucrose concentration that is
 * isotonic with potato cells. Mass changes come from the simplified model
 * in science/osmosis.js, which is labelled as such to students.
 */
import { massAfter, percentFromMasses, percentChange } from '../science/osmosis.js'
import { seeded } from '../science/random.js'
import { toResolution, within, linearFit } from '../science/numeric.js'
import { fail } from '../engine.js'

const CONCS = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
const BALANCE_RES = 0.01
const MAX_TIME = 24 * 60

/** True (unrounded) masses for tube i. */
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
  skills: ['Using a balance', 'Calculating percentage change', 'Plotting and interpolating a graph', 'Identifying variables'],
  objectives: [
    'Explain osmosis in terms of water potential and a partially permeable membrane.',
    'Measure mass changes accurately and calculate percentage change.',
    'Plot % change in mass against sucrose concentration and estimate the isotonic point.',
    'Evaluate the reliability of the method.',
  ],
  prerequisites: ['Diffusion', 'Cell membranes', 'Percentage change'],
  safety: ['In a real lab take care when cutting with a scalpel or cork borer.', 'This is a virtual practice using a simplified model. It does not replace any practical work your examination board requires.'],
  apparatus: ['boiling_tubes', 'rack', 'balance', 'potato_cylinders', 'paper_towel', 'timer'],
  materials: ['Potato cylinders of equal size', 'Sucrose solutions: 0.0, 0.2, 0.4, 0.6, 0.8 and 1.0 mol dm⁻³'],
  procedure: [
    'Weigh each potato cylinder and record its initial mass (to 0.01 g).',
    'Place one cylinder in each sucrose solution and start the timer.',
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
      'Change with time: Δ%(t) = Δ%eq × (1 − e^(−t/45 min)).',
      'Each final weighing includes a small blotting error of up to ±0.02 g.',
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
    return { clock: 0, immersedAt: null, tubes: CONCS.map(() => ({ m0: null, m1: null, removedAt: null })), selected: 0 }
  },

  actions: {
    select(s, { index }) { if (!s.tubes[index]) fail('No such tube.'); s.selected = index },
    recordInitial(s, { index, value }) {
      const t = s.tubes[index]
      if (!t) fail('No such tube.')
      if (s.immersedAt != null) fail('Weigh every cylinder before placing them in the solutions.')
      const v = Number(value)
      if (!(v > 0) || v > 10) fail('Enter the mass in grams shown on the balance.')
      t.m0 = v
    },
    immerse(s) {
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
      const t = s.tubes[index]
      if (!t) fail('No such tube.')
      if (s.immersedAt == null) fail('Place the cylinders in the solutions first.')
      if (t.removedAt != null) fail('That cylinder has already been removed.')
      if (s.clock - s.immersedAt < 1) fail('Leave the cylinders in the solutions for a while first.')
      t.removedAt = s.clock
    },
    recordFinal(s, { index, value }) {
      const t = s.tubes[index]
      if (!t) fail('No such tube.')
      if (t.removedAt == null) fail('Remove and blot the cylinder before weighing it.')
      const v = Number(value)
      if (!(v > 0) || v > 10) fail('Enter the mass in grams shown on the balance.')
      t.m1 = v
    },
  },

  view(params, s) {
    const i = s.selected
    const tm = trueMasses(params, s, i)
    const t = s.tubes[i]
    const onBalance = s.immersedAt == null ? tm.m0 : t.removedAt != null ? tm.m1 : null
    return {
      clock: s.clock, immersed: s.immersedAt != null,
      elapsed: s.immersedAt != null ? s.clock - s.immersedAt : 0,
      selected: i,
      balance: onBalance != null ? toResolution(onBalance, BALANCE_RES) : null,
      tubes: s.tubes.map((x, k) => {
        const pc = x.m0 != null && x.m1 != null ? percentFromMasses(x.m0, x.m1) : null
        // Visual cue only: how swollen / limp the tissue looks.
        const visual = s.immersedAt != null ? percentChange(CONCS[k], params.Ciso, (x.removedAt ?? s.clock) - s.immersedAt) : 0
        return { C: CONCS[k], m0: x.m0, m1: x.m1, removed: x.removedAt != null, percent: pc != null ? Number(pc.toFixed(1)) : null, visual }
      }),
    }
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
      const bad = state.tubes.filter((t, i) => t.m0 == null || !within(t.m0, toResolution(params.m0[i], BALANCE_RES), { abs: 0.011 }))
      return { marks: bad.length ? 0 : 1, detail: bad.length ? bad.length + ' initial mass(es) missing or misread.' : 'All initial masses correct.' }
    } },
    { id: 'time', label: 'Cylinders left long enough (≥ 30 min)', marks: 1, auto: ({ state }) => {
      const times = state.tubes.filter(t => t.removedAt != null).map(t => t.removedAt - state.immersedAt)
      const ok = times.length === state.tubes.length && times.every(m => m >= 30)
      return { marks: ok ? 1 : 0, detail: times.length ? 'Shortest time: ' + Math.min(...times) + ' min.' : 'No cylinders removed.' }
    } },
    { id: 'final', label: 'Final masses recorded for every concentration', marks: 1, auto: ({ params, state }) => {
      const done = state.tubes.filter(t => t.m1 != null).length
      return { marks: done === state.tubes.length ? 1 : 0, detail: done + ' of ' + state.tubes.length + ' final masses recorded.' }
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
    { id: 'report', label: 'Explanation, graph and evaluation', marks: 5, auto: null, guidance: 'Water potential explanation for gain and loss (2), graph with axes, units and line of best fit (1), two improvements (2).' },
  ],
}

export default def
