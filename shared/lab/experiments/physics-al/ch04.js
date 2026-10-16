// AS & A Level Physics practicals, chapter 4: forces, work and energy.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const G = 9.81
const C = (code, chapter = 'Forces, work and energy') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })

export default [
  definePractical({
    id: 'phys-al-4-1', collection: C('4.1'), topic: 'Moments; equilibrium of a rigid body',
    title: 'Load position and the forces on beam supports', summary: 'Hang a beam from two newton meters, move a load along it and find how the support forces change.',
    aim: 'To investigate how the force on one support of a beam depends on the position of a load, and to find the weights of the load and the beam.',
    durationMin: 40,
    apparatus: ['stand_clamp', 'newton_meter', 'metre_rule', 'slotted_masses', 'string'],
    safety: ['Clamp both stands firmly; the beam and load can fall if a newton meter slips off its hook.', 'Keep feet clear of the area under the beam.'],
    procedure: [
      'Hang a metre rule horizontally from two newton meters attached at the 5 cm and 95 cm marks, so the supports A and B are D = 90 cm apart. Zero both meters before use.',
      'Hang a 600 g load from a loop of thread at a distance x from support A.',
      'Check the rule is horizontal, tap the meters gently, then read the force F_B on support B. Also note F_A as a check that F_A + F_B stays constant.',
      'Move the load in steps along the rule and repeat for x from 10 cm to 80 cm.',
      'Plot F_B against x. Taking moments about A, F_B D = W x + W_r (D / 2), so the gradient is W / D and the intercept is W_r / 2.',
    ],
    controlled: 'the same beam, load and support positions; the beam is horizontal for every reading.',
    model: { kind: 'quantitative', summary: 'The rule is uniform with its centre of mass midway between the supports: F_B = (W / D) x + W_r / 2.',
      assumptions: ['The rule is uniform, so its weight acts at the 50 cm mark, midway between the supports.', 'The newton meters are vertical and read to 0.05 N; friction in each spring balance gives a random error of about ±0.03 N.', 'The load is labelled 600 g but its true weight differs by up to 2 %; the thread has negligible mass.'] },
    hidden: (q) => ({ W: q('W', 0.588, 0.612) * G, Wr: q('Wr', 0.100, 0.130) * G }),
    iv: { key: 'x', label: 'Distance of load from support A', symbol: 'x', unit: 'cm', min: 10, max: 80, step: 5, start: 10, instrument: 'metre_rule' },
    measures: [{ key: 'FB', label: 'Force on support B', symbol: 'F_B', unit: 'N', resolution: 0.05, instrument: 'newton_meter',
      read: (p, x, n) => p.W * x / 90 + p.Wr / 2 + n(0.03) }],
    repeats: 2,
    derived: [],
    graph: { x: 'x', y: 'FB', fit: 'line' },
    results: [
      { id: 'W', prompt: 'Weight of the load', unit: 'N', sig: 3, fromFit: (f) => f.m * 90, truth: (p) => p.W, tolTrue: { rel: 0.05 } },
      { id: 'Wr', prompt: 'Weight of the metre rule', unit: 'N', sig: 3, fromFit: (f) => 2 * f.c, truth: (p) => p.Wr, tolTrue: { rel: 0.15 } },
    ],
    questions: [
      { id: 'sum', type: 'choice', prompt: 'As the load moves from A towards B, what happens to F_A + F_B?', options: ['It stays the same, equal to the total weight of the load and the beam', 'It increases', 'It decreases'], correct: 0 },
      { id: 'precision', type: 'text', prompt: 'The weight of the rule is found less precisely than the weight of the load. Explain why, and suggest how to improve it.' },
    ],
  }),

  definePractical({
    id: 'phys-al-4-2', collection: C('4.2'), topic: 'Density; measuring instruments',
    title: 'Density of a metal sample', summary: 'Measure the mass and dimensions of a metal cylinder with a balance, callipers and a micrometer and calculate its density.',
    aim: 'To determine the density of a metal sample and identify the metal.',
    durationMin: 30,
    apparatus: ['metal_block', 'top_pan_balance', 'micrometer', 'vernier_callipers'],
    safety: ['Do not drop the metal sample; it is heavy enough to hurt a foot or crack the balance pan.'],
    procedure: [
      'Check the zero of the micrometer and the callipers and correct for any zero error.',
      'Weigh the cylinder on the top-pan balance and record its mass m.',
      'Measure the diameter d with the micrometer at three places along the cylinder, turning it through about 60° each time, and record each reading.',
      'Measure the length l with the callipers three times at different places round the end faces.',
      'Calculate the mean d and mean l, the volume V = π d² l / 4 and the density ρ = m / V in kg m⁻³.',
      'Compare your value with the densities of common metals (aluminium 2700, brass 8500, steel 7850, copper 8960 kg m⁻³).',
    ],
    controlled: 'the same sample at room temperature; the instruments checked for zero error.',
    model: { kind: 'quantitative', summary: 'The sample is a solid cylinder, so ρ = 4m / (π d² l).',
      assumptions: ['The sample has no holes or bubbles; its end faces are flat and parallel.', 'The diameter varies by up to about 0.01 mm along the cylinder; each micrometer reading has a random error of about ±0.003 mm.', 'Each callipers reading of length has a random error of about ±0.04 mm.'] },
    hidden: (q) => {
      const metal = q.pick('metal', [['aluminium', 2700], ['brass', 8500], ['steel', 7850], ['copper', 8960]])
      const rho = metal[1] * q('alloy', 0.985, 1.005), d = q('d', 12.0, 16.0), l = q('l', 25.0, 40.0)
      return { metal: metal[0], rho, d, l, m: rho * Math.PI * d * d * l / 4 * 1e-6 }
    },
    constants: [{ key: 'm', label: 'Mass of sample', symbol: 'm', unit: 'g', resolution: 0.01, instrument: 'top_pan_balance', read: (p) => p.m }],
    measures: [
      { key: 'd', label: 'Diameter', symbol: 'd', unit: 'mm', resolution: 0.01, instrument: 'micrometer', read: (p, x, n) => p.d + n.u(-0.005, 0.005) + n(0.003) },
      { key: 'l', label: 'Length', symbol: 'l', unit: 'mm', resolution: 0.02, instrument: 'vernier_callipers', read: (p, x, n) => p.l + n(0.04) },
    ],
    repeats: 3,
    results: [{ id: 'rho', prompt: 'Density of the metal', unit: 'kg m⁻³', sig: 3,
      fromConsts: (c, gs) => { const r = gs[0]?.row; return r ? c.m * 1e-3 / (Math.PI * r.d * r.d * r.l / 4 * 1e-9) : null }, truth: (p) => p.rho, tolTrue: { rel: 0.02 } }],
    questions: [
      { id: 'micrometer', type: 'choice', prompt: 'Which measurement contributes the largest percentage uncertainty to the density?', options: ['The length, because the callipers have the coarsest resolution relative to the size measured', 'The mass, because the balance reads to 0.01 g', 'The diameter, because it is measured with a micrometer'], correct: 0 },
      { id: 'metal', type: 'text', prompt: 'Which metal is the sample most likely to be? Explain using your value and its uncertainty.' },
    ],
  }),

  definePractical({
    id: 'phys-al-4-3', collection: C('4.3'), topic: 'Principle of moments',
    title: 'Equilibrium of a pivoted wooden strip', summary: 'Balance a lump of modelling clay against a known mass on a pivoted wooden strip and find the mass of the clay.',
    aim: 'To use the principle of moments to determine an unknown mass on a pivoted wooden strip.',
    durationMin: 35,
    apparatus: ['wooden_strip', 'stand_clamp', 'plasticine', 'slotted_masses', 'string', 'metre_rule'],
    safety: ['Make sure the pivot pin is held firmly in the clamp, and keep the hanging masses low over the bench.'],
    procedure: [
      'Push the pivot pin through the central hole of the wooden strip and hold it in the clamp so that the strip can swing freely. Check that the strip rests nearly horizontal on its own.',
      'Hang the lump of modelling clay from the hole a distance d from the pivot on one side.',
      'On the other side hang a 150 g mass from a loop of thread. Slide the loop until the strip balances horizontally and measure its distance x from the pivot.',
      'Find each balance position twice, then move the clay to other holes, for d from 5 cm to 45 cm.',
      'Plot x against d. Taking moments about the pivot, 150 g × x = m_c d + (a small term from any imbalance of the strip), so the gradient is m_c / 150 g.',
    ],
    controlled: 'the same 150 g balancing mass, the same pivot hole, the strip horizontal for each reading.',
    model: { kind: 'quantitative', summary: 'Moments about the pivot: M x = m_c d + m_s e, where e is the small offset of the strip’s centre of mass from the pivot. The offset only shifts the intercept.',
      assumptions: ['The balancing mass is exactly 150 g and the thread has negligible mass.', 'The strip’s centre of mass is within ±0.5 cm of the pivot.', 'Friction at the pivot makes each balance position uncertain by about ±0.3 cm.'] },
    hidden: (q) => ({ mc: q('mc', 60, 140), e: q('e', -0.5, 0.5), ms: q('ms', 100, 140) }),
    iv: { key: 'd', label: 'Distance of clay from pivot', symbol: 'd', unit: 'cm', min: 5, max: 45, step: 5, start: 5, instrument: 'wooden_strip' },
    measures: [{ key: 'x', label: 'Balance distance of 150 g mass', symbol: 'x', unit: 'cm', resolution: 0.1, instrument: 'metre_rule',
      read: (p, d, n) => (p.mc * d + p.ms * p.e) / 150 + n(0.3) }],
    repeats: 2,
    graph: { x: 'd', y: 'x', fit: 'line' },
    results: [{ id: 'mc', prompt: 'Mass of the modelling clay', unit: 'g', sig: 3, fromFit: (f) => f.m * 150, truth: (p) => p.mc, tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'intercept', type: 'choice', prompt: 'Your line does not pass exactly through the origin. The most likely reason is', options: ['the centre of mass of the strip is not exactly at the pivot', 'the clay is heavier than 150 g', 'the strip is not long enough'], correct: 0 },
      { id: 'gradient', type: 'text', prompt: 'Explain why using the gradient, rather than a single balance reading, gives a better value for the mass of the clay.' },
    ],
  }),

  definePractical({
    id: 'phys-al-4-4', collection: C('4.4'), topic: 'Work and kinetic energy; friction',
    title: 'Kinetic energy and work against friction', summary: 'Measure the speed of a sliding block with a light gate and the distance it slides before stopping, and find the friction force.',
    aim: 'To investigate how the stopping distance of a sliding block depends on its speed and to determine the frictional force acting on it.',
    durationMin: 45,
    apparatus: ['ramp', 'wooden_blocks', 'card', 'light_gate', 'metre_rule', 'top_pan_balance'],
    safety: ['Put a stop at the end of the bench so the block cannot slide off onto someone’s feet.', 'Keep the light gate leads clear of the path of the block.'],
    procedure: [
      'Weigh the wooden block with a card fixed upright on top. Measure the length L of the card.',
      'Set up a ramp leading onto the bench and place the light gate on the bench just beyond the foot of the ramp.',
      'Release the block from rest a distance l up the ramp. The timer records the time t the card blocks the beam. Measure the distance s the block slides beyond the light gate before it stops.',
      'Repeat each release three times, then repeat for distances l from 20 cm to 100 cm up the ramp.',
      'Calculate v = L / t. All the kinetic energy at the gate is used to do work against friction: ½ m v² = F s.',
      'Plot s against v². The gradient is m / (2F), so F = m / (2 × gradient).',
    ],
    controlled: 'the same block and card, the same ramp angle and the same part of the bench surface.',
    model: { kind: 'quantitative', summary: 'Kinetic energy at the gate is transferred to work against a constant friction force F = μ m g: s = m v² / (2F).',
      assumptions: ['Friction does not depend on speed; the bench surface varies so that each stopping distance has a random variation of about 3 %.', 'The block arrives at the gate with nearly the same speed every time it is released from the same point; the timer resolves 1 ms.', 'Each stopping distance is read to about ±0.2 cm.'] },
    hidden: (q) => ({ mu: q('mu', 0.25, 0.35), m: q('m', 400, 600), k: q('k', 2.5, 3.5), L: q('L', 9.8, 10.2) }),
    constants: [
      { key: 'm', label: 'Mass of block and card', symbol: 'm', unit: 'g', resolution: 0.1, instrument: 'top_pan_balance', read: (p) => p.m },
      { key: 'L', label: 'Length of card', symbol: 'L', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, n) => p.L + n(0.03) },
    ],
    iv: { key: 'l', label: 'Release distance up the ramp', symbol: 'l', unit: 'cm', min: 20, max: 100, step: 10, start: 20, instrument: 'metre_rule' },
    measures: [
      { key: 't', label: 'Time card blocks the beam', symbol: 't', unit: 's', resolution: 0.001, instrument: 'light_gate',
        read: (p, x) => (p.L / 100) / Math.sqrt(p.k * x / 100 * (1 + 0.04 * p.j('v' + x))) },
      { key: 's', label: 'Stopping distance', symbol: 's', unit: 'cm', resolution: 0.1, instrument: 'metre_rule',
        read: (p, x, n) => 100 * p.k * x / 100 * (1 + 0.04 * p.j('v' + x)) / (2 * p.mu * G) * (1 + n(0.03)) + n(0.2) },
    ],
    repeats: 3,
    derived: [{ key: 'v', label: 'Speed at light gate', symbol: 'v', unit: 'm s⁻¹', decimals: 3, value: (r, c) => (c.L / 100) / r.t }],
    graph: { x: 'v', tx: 'square', y: 's', fit: 'line' },
    results: [
      { id: 'F', prompt: 'Friction force on the block', unit: 'N', sig: 3, fromFit: (f, c) => (c.m / 1000) / (2 * f.m / 100), truth: (p) => p.mu * p.m / 1000 * G, tolTrue: { rel: 0.08 } },
      { id: 'mu', prompt: 'Coefficient of friction between block and bench', unit: '', sig: 3, fromFit: (f) => 1 / (2 * G * f.m / 100), truth: (p) => p.mu, tolTrue: { rel: 0.08 } },
    ],
    questions: [
      { id: 'mass', type: 'choice', prompt: 'If a heavier block of the same material were used, the gradient of s against v² would', options: ['stay about the same, because the friction force increases in proportion to the mass', 'double', 'halve'], correct: 0 },
      { id: 'energy', type: 'text', prompt: 'Explain why the speed must be measured on the flat bench rather than on the ramp.' },
    ],
  }),
]
