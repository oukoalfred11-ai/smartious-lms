// AS & A Level Physics practicals, chapter 6: electric current, potential
// difference and resistance. Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const C = (code, chapter = 'Electric current, potential difference and resistance') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })

// The i-th resistor of a set: nominal value with a fixed manufacturing spread.
const Ri = (p, i) => p.R0 * (1 + 0.02 * p.j('R' + i))
const meanR = (p) => { let s = 0; for (let i = 1; i <= 8; i++) s += Ri(p, i); return s / 8 }
const seriesR = (p, N) => { let s = 0; for (let i = 1; i <= N; i++) s += Ri(p, i); return s + p.rj * (N + 1) }
const parallelR = (p, N) => { let g = 0; for (let i = 1; i <= N; i++) g += 1 / Ri(p, i); return 1 / g + p.rj }

export default [
  definePractical({
    id: 'phys-al-6-1', collection: C('6.1'), topic: 'Power; I–V characteristic of a filament lamp',
    title: 'Power and resistance of a filament lamp', summary: 'Measure the current through a filament lamp at different potential differences and find how its power depends on the p.d.',
    aim: 'To investigate how the power dissipated in a filament lamp and its resistance depend on the potential difference across it.',
    durationMin: 40,
    apparatus: ['dc_supply', 'filament_lamp', 'rheostat', 'milliammeter', 'voltmeter', 'switch', 'leads'],
    safety: ['The lamp glass becomes hot: do not touch it while it is lit or for a few minutes afterwards.', 'Do not exceed the rated 6.0 V of the lamp.'],
    procedure: [
      'Connect the supply, switch, rheostat, milliammeter and lamp in series, so the rheostat controls the p.d. across the lamp.',
      'Connect the voltmeter directly across the lamp.',
      'Set the p.d. across the lamp to about 1.0 V, wait a few seconds for the filament to settle and record V and I.',
      'Increase the p.d. in steps of about 0.5 V up to 6.0 V, recording V and I each time.',
      'Calculate the power P = VI and the resistance R = V / I for each reading.',
      'Plot lg(P / W) against lg(V / V). The gradient is the power n in P ∝ Vⁿ.',
    ],
    controlled: 'the same lamp, readings taken once the filament has reached a steady temperature.',
    model: { kind: 'simplified', summary: 'Over the range in which the filament glows, the lamp follows the empirical law I = a V^b with b ≈ 0.5–0.65, so P = a V^(1+b) and R = V^(1−b)/a rises with p.d.',
      assumptions: [
        'The filament temperature rises with power until radiation losses balance the electrical power; the result is summarised by a single power law and is not valid below about 1 V, where the filament is nearly cold.',
        'The lamp is rated at 6.0 V, 0.30 A (±5 %).',
        'The p.d. settles within ±0.02 V of the value aimed for; meter readings have random errors of about ±0.003 V and ±0.3 %.',
      ] },
    hidden: (q) => ({ b: q('b', 0.52, 0.62), I6: q('I6', 0.285, 0.315) }),
    // No values: the milliammeter reads in mA, which the solver (in A) cannot
    // give, so a wrongly wired meter reads 0. The lamp is not ohmic either.
    circuit: {
      parts: [
        { id: 'PS', type: 'supply', apparatus: 'dc_supply', label: 'Supply' },
        { id: 'S1', type: 'switch', apparatus: 'switch', label: 'Switch' },
        { id: 'RH', type: 'resistor', apparatus: 'rheostat', label: 'Rheostat' },
        { id: 'A1', type: 'ammeter', apparatus: 'milliammeter', label: 'Milliammeter' },
        { id: 'V1', type: 'voltmeter', apparatus: 'voltmeter', label: 'Voltmeter' },
        { id: 'X', type: 'resistor', apparatus: 'filament_lamp', label: 'Lamp' },
      ],
      checks: [{ meter: 'A1', series: 'X' }, { meter: 'V1', across: 'X' }],
      correct: [['PS.+', 'S1.a'], ['S1.b', 'RH.a'], ['RH.b', 'A1.+'], ['A1.-', 'X.a'], ['X.b', 'PS.-'], ['V1.+', 'X.a'], ['V1.-', 'X.b']],
    },
    iv: { key: 'Vset', label: 'P.d. aimed for', symbol: 'V_set', unit: 'V', min: 1.0, max: 6.0, step: 0.5, start: 1.0, instrument: 'rheostat' },
    measures: [
      { key: 'V', label: 'P.d. across lamp', symbol: 'V', unit: 'V', resolution: 0.01, instrument: 'voltmeter', read: (p, x, n) => x + 0.02 * p.j('V' + x) + n(0.003) },
      { key: 'I', label: 'Current', symbol: 'I', unit: 'mA', resolution: 0.1, instrument: 'milliammeter',
        read: (p, x, n) => 1000 * p.I6 * ((x + 0.02 * p.j('V' + x)) / 6) ** p.b * (1 + n(0.003)) },
    ],
    derived: [
      { key: 'P', label: 'Power', symbol: 'P', unit: 'W', decimals: 3, value: (r) => r.V * r.I / 1000 },
      { key: 'R', label: 'Resistance', symbol: 'R', unit: 'Ω', decimals: 1, value: (r) => r.V / (r.I / 1000) },
    ],
    graph: { x: 'V', tx: 'lg', y: 'P', ty: 'lg', fit: 'line' },
    results: [{ id: 'n', prompt: 'Power n in the relationship P ∝ Vⁿ', unit: '', sig: 3, fromFit: (f) => f.m, truth: (p) => 1 + p.b, tolTrue: { rel: 0.05 } }],
    questions: [
      { id: 'notTwo', type: 'choice', prompt: 'For a fixed resistor P ∝ V². Why is n smaller than 2 for the lamp?', options: ['The filament gets hotter at higher p.d., so its resistance increases', 'The filament gets cooler at higher p.d., so its resistance decreases', 'The voltmeter takes more current at higher p.d.'], correct: 0 },
      { id: 'cold', type: 'text', prompt: 'Predict, with a reason, whether the resistance of the lamp measured with a multimeter when it is cold would be higher or lower than any value in your table.' },
    ],
  }),

  definePractical({
    id: 'phys-al-6-2', collection: C('6.2'), topic: 'Resistors in series',
    title: 'Resistors in series', summary: 'Connect one to eight identical resistors in series, measure the total resistance each time and test R = R₁ + R₂ + ….',
    aim: 'To show that the resistance of resistors in series is the sum of their resistances and to find the mean resistance of one resistor.',
    durationMin: 35,
    apparatus: ['dc_supply', 'resistors', 'milliammeter', 'voltmeter', 'switch', 'leads'],
    safety: ['Use a low p.d. (3 V) and open the switch between readings so the resistors stay cool.'],
    procedure: [
      'Connect one resistor in series with the milliammeter, the switch and the 3 V supply. Connect the voltmeter across the resistor.',
      'Close the switch, record V and I, then open the switch.',
      'Add a second identical resistor in series and move the voltmeter so it is across both. Record V and I.',
      'Continue up to eight resistors, keeping the voltmeter across the whole chain.',
      'Calculate the total resistance R = V / I and plot R against the number of resistors N.',
      'The gradient is the mean resistance of one resistor; the intercept shows the resistance of the joins.',
    ],
    controlled: 'the same set of resistors, the same supply, switch opened between readings.',
    model: { kind: 'quantitative', summary: 'The current is the same through every resistor in a series chain and the p.d.s add, so R = R₁ + R₂ + … + R_N plus the small resistance of the joins.',
      assumptions: [
        'Each resistor is within ±2 % of its marked value; the spread is fixed for this set.',
        'Each join and clip adds 0.02–0.06 Ω.',
        'The 3 V supply has an internal resistance of about 0.5 Ω; the voltmeter is across the chain only, so this does not affect R.',
        'Meter readings have random errors of about ±0.005 V and ±0.2 %.',
      ] },
    hidden: (q) => ({ R0: q.pick('R0', [22, 27, 33, 39, 47]), rj: q('rj', 0.02, 0.06), E: q('E', 2.95, 3.05), ri: q('ri', 0.3, 0.7) }),
    // No values: the milliammeter reads in mA, which the solver (in A) cannot
    // give, so a wrongly wired meter reads 0.
    circuit: {
      parts: [
        { id: 'PS', type: 'supply', apparatus: 'dc_supply', label: 'Supply' },
        { id: 'S1', type: 'switch', apparatus: 'switch', label: 'Switch' },
        { id: 'A1', type: 'ammeter', apparatus: 'milliammeter', label: 'Milliammeter' },
        { id: 'V1', type: 'voltmeter', apparatus: 'voltmeter', label: 'Voltmeter' },
        { id: 'X', type: 'resistor', apparatus: 'resistors', label: 'Resistor chain' },
      ],
      checks: [{ meter: 'A1', series: 'X' }, { meter: 'V1', across: 'X' }],
      correct: [['PS.+', 'S1.a'], ['S1.b', 'A1.+'], ['A1.-', 'X.a'], ['X.b', 'PS.-'], ['V1.+', 'X.a'], ['V1.-', 'X.b']],
    },
    iv: { key: 'N', label: 'Number of resistors in series', symbol: 'N', unit: '', min: 1, max: 8, step: 1, start: 1, instrument: 'resistors' },
    measures: [
      { key: 'V', label: 'P.d. across chain', symbol: 'V', unit: 'V', resolution: 0.01, instrument: 'voltmeter', read: (p, x, n) => { const R = seriesR(p, x); return p.E * R / (R + p.ri) + n(0.005) } },
      { key: 'I', label: 'Current', symbol: 'I', unit: 'mA', resolution: 0.1, instrument: 'milliammeter', read: (p, x, n) => 1000 * p.E / (seriesR(p, x) + p.ri) * (1 + n(0.002)) },
    ],
    derived: [{ key: 'R', label: 'Total resistance', symbol: 'R', unit: 'Ω', decimals: 1, value: (r) => r.V / (r.I / 1000) }],
    graph: { x: 'N', y: 'R', fit: 'line' },
    results: [{ id: 'R1', prompt: 'Mean resistance of one resistor', unit: 'Ω', sig: 3, fromFit: (f) => f.m, truth: (p) => meanR(p), tolTrue: { rel: 0.05 } }],
    questions: [
      { id: 'three', type: 'choice', prompt: 'Three resistors of 10 Ω, 22 Ω and 47 Ω are connected in series. What is their combined resistance?', options: ['79 Ω', '5.8 Ω', '26 Ω'], correct: 0 },
      { id: 'why', type: 'text', prompt: 'Use conservation of energy to explain why the p.d.s across resistors in series add up to the total p.d.' },
    ],
  }),

  definePractical({
    id: 'phys-al-6-3', collection: C('6.3'), topic: 'Resistors in parallel',
    title: 'Resistors in parallel', summary: 'Connect one to eight identical resistors in parallel, measure the combined resistance and plot 1/R against the number of resistors.',
    aim: 'To show that 1/R = 1/R₁ + 1/R₂ + … for resistors in parallel and to find the mean resistance of one resistor.',
    durationMin: 35,
    apparatus: ['dc_supply', 'resistors', 'milliammeter', 'voltmeter', 'switch', 'leads'],
    safety: ['With many resistors in parallel the current is large: keep the p.d. at 1.5 V and open the switch between readings.'],
    procedure: [
      'Connect one resistor in series with the milliammeter, the switch and the supply set to 1.5 V. Connect the voltmeter across the resistor.',
      'Close the switch, record V and I, then open the switch.',
      'Add identical resistors one at a time in parallel with the first, between the same two connecting blocks, up to eight resistors.',
      'Calculate the combined resistance R = V / I for each arrangement.',
      'Plot 1/R against the number of resistors N. The gradient is 1/R₁ for one resistor.',
    ],
    controlled: 'the same set of resistors, the same connecting blocks, the same supply setting.',
    model: { kind: 'quantitative', summary: 'Each resistor has the same p.d. across it and the currents add, so 1/R = Σ 1/Rᵢ; the connecting blocks add a small series resistance.',
      assumptions: [
        'Each resistor is within ±2 % of its marked value; the spread is fixed for this set.',
        'The connecting blocks add 0.02–0.06 Ω in series with the parallel group; this slightly bends the graph for large N.',
        'The supply has an internal resistance of about 0.5 Ω; meter readings have random errors of about ±0.003 V and ±0.2 %.',
      ] },
    hidden: (q) => ({ R0: q.pick('R0', [82, 100, 120, 150, 180, 220]), rj: q('rj', 0.02, 0.06), E: q('E', 1.48, 1.52), ri: q('ri', 0.3, 0.7) }),
    // No values: the milliammeter reads in mA, which the solver (in A) cannot
    // give, so a wrongly wired meter reads 0.
    circuit: {
      parts: [
        { id: 'PS', type: 'supply', apparatus: 'dc_supply', label: 'Supply' },
        { id: 'S1', type: 'switch', apparatus: 'switch', label: 'Switch' },
        { id: 'A1', type: 'ammeter', apparatus: 'milliammeter', label: 'Milliammeter' },
        { id: 'V1', type: 'voltmeter', apparatus: 'voltmeter', label: 'Voltmeter' },
        { id: 'X', type: 'resistor', apparatus: 'resistors', label: 'Parallel group' },
      ],
      checks: [{ meter: 'A1', series: 'X' }, { meter: 'V1', across: 'X' }],
      correct: [['PS.+', 'S1.a'], ['S1.b', 'A1.+'], ['A1.-', 'X.a'], ['X.b', 'PS.-'], ['V1.+', 'X.a'], ['V1.-', 'X.b']],
    },
    iv: { key: 'N', label: 'Number of resistors in parallel', symbol: 'N', unit: '', min: 1, max: 8, step: 1, start: 1, instrument: 'resistors' },
    measures: [
      { key: 'V', label: 'P.d. across group', symbol: 'V', unit: 'V', resolution: 0.001, instrument: 'voltmeter', read: (p, x, n) => { const R = parallelR(p, x); return p.E * R / (R + p.ri) + n(0.003) } },
      { key: 'I', label: 'Current', symbol: 'I', unit: 'mA', resolution: 0.1, instrument: 'milliammeter', read: (p, x, n) => 1000 * p.E / (parallelR(p, x) + p.ri) * (1 + n(0.002)) },
    ],
    derived: [{ key: 'R', label: 'Combined resistance', symbol: 'R', unit: 'Ω', decimals: 2, value: (r) => r.V / (r.I / 1000) }],
    graph: { x: 'N', y: 'R', ty: 'reciprocal', fit: 'line' },
    results: [{ id: 'R1', prompt: 'Mean resistance of one resistor', unit: 'Ω', sig: 3, fromFit: (f) => 1 / f.m, truth: (p) => meanR(p), tolTrue: { rel: 0.05 } }],
    questions: [
      { id: 'two', type: 'choice', prompt: 'Two 100 Ω resistors are connected in parallel. What is their combined resistance?', options: ['50 Ω', '200 Ω', '100 Ω'], correct: 0 },
      { id: 'blocks', type: 'text', prompt: 'Explain why the small resistance of the connecting blocks matters more when there are eight resistors in parallel than when there is one.' },
    ],
  }),
]
