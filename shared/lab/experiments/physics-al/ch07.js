// AS & A Level Physics practicals, chapter 7: resistance and resistivity.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const C = (code, chapter = 'Resistance and resistivity') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })

export default [
  definePractical({
    id: 'phys-al-7-1', collection: C('7.1'), topic: 'Resistivity',
    title: 'Resistivity of the metal of a wire', summary: 'Measure the resistance of different lengths of a wire and its diameter, and find the resistivity of the metal from the gradient of R against l.',
    aim: 'To determine the resistivity of the metal of a wire from a graph of resistance against length.',
    durationMin: 45,
    apparatus: ['resistance_wire', 'micrometer', 'dry_cell', 'ammeter', 'voltmeter', 'switch', 'leads'],
    safety: ['The wire can get hot at short lengths: open the switch between readings and do not touch the wire while current flows.'],
    procedure: [
      'Measure the diameter d of the wire with the micrometer. Check the zero reading first and take readings at several places and in different directions.',
      'Connect the cell, switch, ammeter and wire in series, with one crocodile clip at the zero end of the wire. Connect the voltmeter across the wire between the clips.',
      'Place the sliding clip at l = 10 cm, close the switch, record V and I quickly, then open the switch.',
      'Repeat for lengths up to 90 cm.',
      'Calculate R = V / I and plot R against l.',
      'Find the resistivity from ρ = gradient × A, where A = πd²/4.',
    ],
    controlled: 'the same wire at room temperature (switch opened between readings), the same clips pressed firmly onto the wire.',
    model: { kind: 'quantitative', summary: 'R = ρ l / A + R_c, where R_c is a small resistance at the clips.',
      assumptions: [
        'The wire is uniform constantan with ρ between 4.7 × 10⁻⁷ and 5.1 × 10⁻⁷ Ω m; heating is small enough to ignore.',
        'The cell has e.m.f. 1.5–1.6 V and internal resistance 0.6–1.0 Ω; the meters are ideal and contact resistance is 0.05–0.15 Ω.',
        'The diameter varies by up to ±0.5 % along the wire; a micrometer reading has a random error of about ±0.003 mm.',
        'Meter readings have random errors of about ±0.3 %.',
      ] },
    hidden: (q) => ({ rho: q('rho', 4.7, 5.1) * 1e-7, d: q.pick('d', [0.315, 0.345, 0.376, 0.417]) * (1 + 0.005 * q('dj', -1, 1)), rc: q('rc', 0.05, 0.15), r: q('r', 0.6, 1.0), E: q('E', 1.50, 1.60) }),
    circuit: {
      parts: [
        { id: 'PS', type: 'supply', apparatus: 'dry_cell', label: 'Cell' },
        { id: 'S1', type: 'switch', apparatus: 'switch', label: 'Switch' },
        { id: 'A1', type: 'ammeter', apparatus: 'ammeter', label: 'Ammeter' },
        { id: 'V1', type: 'voltmeter', apparatus: 'voltmeter', label: 'Voltmeter' },
        { id: 'X', type: 'resistor', apparatus: 'resistance_wire', label: 'Wire' },
      ],
      checks: [{ meter: 'A1', series: 'X' }, { meter: 'V1', across: 'X' }],
      values: (p, x) => ({ PS: { emf: p.E, r: p.r }, X: { R: p.rho * (x / 100) / (Math.PI * (p.d / 1000) ** 2 / 4) + p.rc } }),
      correct: [['PS.+', 'S1.a'], ['S1.b', 'A1.+'], ['A1.-', 'X.a'], ['X.b', 'PS.-'], ['V1.+', 'X.a'], ['V1.-', 'X.b']],
    },
    constants: [{ key: 'd', label: 'Diameter of wire', symbol: 'd', unit: 'mm', resolution: 0.01, instrument: 'micrometer', read: (p, n) => p.d + n(0.003) }],
    iv: { key: 'l', label: 'Length of wire', symbol: 'l', unit: 'cm', min: 10, max: 90, step: 5, start: 10, instrument: 'resistance_wire' },
    measures: [
      { key: 'V', label: 'Potential difference', symbol: 'V', unit: 'V', resolution: 0.001, instrument: 'voltmeter',
        read: (p, x, n) => { const R = p.rho * (x / 100) / (Math.PI * (p.d / 1000) ** 2 / 4) + p.rc; return p.E * R / (R + p.r) * (1 + n(0.003)) } },
      { key: 'I', label: 'Current', symbol: 'I', unit: 'A', resolution: 0.001, instrument: 'ammeter',
        read: (p, x, n) => { const R = p.rho * (x / 100) / (Math.PI * (p.d / 1000) ** 2 / 4) + p.rc; return p.E / (R + p.r) * (1 + n(0.003)) } },
    ],
    derived: [{ key: 'R', label: 'Resistance', symbol: 'R', unit: 'Ω', decimals: 3, value: (r) => r.V / r.I }],
    graph: { x: 'l', y: 'R', fit: 'line' },
    results: [{ id: 'rho', prompt: 'Resistivity of the metal (enter in Ω m, e.g. 4.9e-7)', unit: 'Ω m', sig: 3, tolTrue: { rel: 0.08 }, truth: (p) => p.rho,
      fromFit: (f, c) => f.m * 100 * Math.PI * (c.d / 1000) ** 2 / 4 }],
    questions: [
      { id: 'gradient', type: 'choice', prompt: 'Why is ρ found from the gradient rather than from a single value of R / l?', options: ['The gradient is not affected by the constant contact resistance at the clips', 'The gradient makes the wire cooler', 'A single reading would give the resistivity in the wrong units'], correct: 0 },
      { id: 'd', type: 'text', prompt: 'The diameter is squared in the calculation. Explain how this affects the percentage uncertainty in ρ, and why several diameter readings are taken.' },
    ],
  }),

  definePractical({
    id: 'phys-al-7-2', collection: C('7.2'), topic: 'E.m.f. and internal resistance',
    title: 'Internal resistance of a dry cell', summary: 'Vary the current drawn from a dry cell with a rheostat, measure its terminal p.d. and find its e.m.f. and internal resistance from a V–I graph.',
    aim: 'To determine the e.m.f. and internal resistance of a dry cell.',
    durationMin: 35,
    apparatus: ['dry_cell', 'rheostat', 'ammeter', 'voltmeter', 'switch', 'leads'],
    safety: ['Never connect the cell directly across the ammeter or short-circuit it: the cell and wires can become hot. Open the switch between readings.'],
    procedure: [
      'Connect the cell, switch, ammeter and rheostat in series. Connect the voltmeter directly across the cell terminals.',
      'Set the rheostat to about 12 Ω, close the switch, record the terminal p.d. V and the current I, then open the switch.',
      'Reduce the resistance in steps down to about 1 Ω, recording V and I each time.',
      'Plot V against I.',
      'The intercept on the V axis is the e.m.f. E and the gradient is −r, where r is the internal resistance.',
    ],
    controlled: 'the same cell; switch opened between readings so the cell does not run down or warm up.',
    model: { kind: 'quantitative', summary: 'V = E − I r: the terminal p.d. falls in proportion to the current because of the internal resistance.',
      assumptions: [
        'E is between 1.50 and 1.60 V and r is between 0.5 and 1.5 Ω and both stay constant during the experiment.',
        'The rheostat setting is only approximate (±5 %); this does not matter as V and I are both measured.',
        'The voltmeter takes no current; meter readings have random errors of about ±0.003 V and ±0.3 %; small chemical changes in the cell add a fixed ±0.003 V at each setting.',
      ] },
    hidden: (q) => ({ E: q('E', 1.50, 1.60), r: q('r', 0.5, 1.5) }),
    circuit: {
      parts: [
        { id: 'PS', type: 'supply', apparatus: 'dry_cell', label: 'Cell' },
        { id: 'S1', type: 'switch', apparatus: 'switch', label: 'Switch' },
        { id: 'A1', type: 'ammeter', apparatus: 'ammeter', label: 'Ammeter' },
        { id: 'V1', type: 'voltmeter', apparatus: 'voltmeter', label: 'Voltmeter' },
        { id: 'RH', type: 'resistor', apparatus: 'rheostat', label: 'Rheostat' },
      ],
      checks: [{ meter: 'A1', series: 'RH' }, { meter: 'V1', across: 'PS' }],
      values: (p, x) => ({ PS: { emf: p.E, r: p.r }, RH: { R: x * (1 + 0.05 * p.j('R' + x)) } }),
      correct: [['PS.+', 'S1.a'], ['S1.b', 'A1.+'], ['A1.-', 'RH.a'], ['RH.b', 'PS.-'], ['V1.+', 'PS.+'], ['V1.-', 'PS.-']],
    },
    iv: { key: 'Rx', label: 'Rheostat resistance', symbol: 'R', unit: 'Ω', min: 1, max: 12, step: 0.5, start: 12, instrument: 'rheostat' },
    measures: [
      { key: 'V', label: 'Terminal p.d.', symbol: 'V', unit: 'V', resolution: 0.001, instrument: 'voltmeter',
        read: (p, x, n) => { const R = x * (1 + 0.05 * p.j('R' + x)); return p.E * R / (R + p.r) + 0.003 * p.j('E' + x) + n(0.003) } },
      { key: 'I', label: 'Current', symbol: 'I', unit: 'A', resolution: 0.001, instrument: 'ammeter',
        read: (p, x, n) => { const R = x * (1 + 0.05 * p.j('R' + x)); return p.E / (R + p.r) * (1 + n(0.003)) } },
    ],
    graph: { x: 'I', y: 'V', fit: 'line' },
    results: [
      { id: 'E', prompt: 'E.m.f. of the cell', unit: 'V', sig: 3, fromFit: (f) => f.c, truth: (p) => p.E, tolTrue: { rel: 0.03 } },
      { id: 'r', prompt: 'Internal resistance of the cell', unit: 'Ω', sig: 3, fromFit: (f) => -f.m, truth: (p) => p.r, tolTrue: { rel: 0.1 } },
    ],
    questions: [
      { id: 'lost', type: 'choice', prompt: 'At a current I, what is the p.d. “lost” inside the cell?', options: ['I r', 'E + I r', 'E / r'], correct: 0 },
      { id: 'short', type: 'text', prompt: 'Explain why the readings should be taken quickly and the switch opened between them, and what would happen to your graph if the cell warmed up or ran down.' },
    ],
  }),

  definePractical({
    id: 'phys-al-7-3', collection: C('7.3'), topic: 'Potential dividers',
    title: 'Potential divider using a resistance wire', summary: 'Connect a cell across a metre of resistance wire and measure the output p.d. between one end and a sliding contact at different positions.',
    aim: 'To investigate how the output p.d. of a potential divider depends on the position of the sliding contact, and find the potential gradient along the wire.',
    durationMin: 35,
    apparatus: ['resistance_wire', 'dry_cell', 'voltmeter', 'switch', 'leads'],
    safety: ['Open the switch between readings; the wire warms up if current flows for a long time.'],
    procedure: [
      'Connect the cell and switch across the full 100 cm length of the resistance wire.',
      'Connect the voltmeter between the zero end of the wire and a sliding contact (jockey).',
      'Close the switch, touch the jockey onto the wire at l = 10 cm and record the output p.d. V. Do not slide the jockey along the wire while pressing.',
      'Repeat at 10 cm intervals up to 90 cm.',
      'Plot V against l. The gradient is the potential gradient along the wire, k.',
      'Use your graph to find the length that would give an output of 0.500 V.',
    ],
    controlled: 'the same cell and wire, the switch opened between readings so the current stays steady.',
    model: { kind: 'quantitative', summary: 'The same current I = E / (R_wire + r + R_c) flows along the whole wire, so V_out = I λ l: the output p.d. is proportional to the length tapped off.',
      assumptions: [
        'The voltmeter draws negligible current, so it does not load the divider.',
        'The wire is uniform with resistance 4–6 Ω per metre; the cell has e.m.f. 1.5–1.6 V and internal resistance 0.5–1.0 Ω; each end connection adds 0.05–0.15 Ω.',
        'The jockey contact point is uncertain by about ±0.1 cm and the voltmeter reading by about ±0.002 V.',
      ] },
    hidden: (q) => ({ lam: q('lam', 4.0, 6.0), E: q('E', 1.50, 1.60), r: q('r', 0.5, 1.0), rc: q('rc', 0.05, 0.15) }),
    iv: { key: 'l', label: 'Length from zero end', symbol: 'l', unit: 'cm', min: 10, max: 90, step: 5, start: 10, instrument: 'resistance_wire' },
    measures: [{ key: 'V', label: 'Output p.d.', symbol: 'V', unit: 'V', resolution: 0.001, instrument: 'voltmeter',
      read: (p, x, n) => { const I = p.E / (p.lam + 2 * p.rc + p.r); return I * p.lam * (x + n(0.1)) / 100 + n(0.002) } }],
    graph: { x: 'l', y: 'V', fit: 'line' },
    results: [
      { id: 'k', prompt: 'Potential gradient along the wire', unit: 'V m⁻¹', sig: 3, fromFit: (f) => f.m * 100, truth: (p) => p.E * p.lam / (p.lam + 2 * p.rc + p.r), tolTrue: { rel: 0.05 } },
      { id: 'l05', prompt: 'Length of wire giving an output of 0.500 V', unit: 'cm', sig: 3, fromFit: (f) => (0.5 - f.c) / f.m, truth: (p) => 0.5 / (p.E * p.lam / (p.lam + 2 * p.rc + p.r)) * 100, tolTrue: { rel: 0.05 } },
    ],
    questions: [
      { id: 'total', type: 'choice', prompt: 'Why is the p.d. across the whole wire less than the e.m.f. of the cell?', options: ['Some p.d. is lost across the internal resistance of the cell and the connections', 'The voltmeter is connected the wrong way round', 'The wire has no resistance'], correct: 0 },
      { id: 'load', type: 'text', prompt: 'Predict how the output p.d. at 50 cm would change if a 5 Ω resistor were connected across the output, and explain why.' },
    ],
  }),
]
