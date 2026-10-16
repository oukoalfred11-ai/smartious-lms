// AS & A Level Physics practicals, chapter 2: limitations and improvements.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const G = 9.81
const C = (code, chapter = 'Limitations and improvements') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })

export default [
  definePractical({
    id: 'phys-al-2-1', collection: C('2.1'), topic: 'Thermal energy transfer; cooling',
    title: 'Cooling of water in a polystyrene cup', summary: 'Record the temperature of hot water in a polystyrene cup as it cools and find how quickly it loses thermal energy to the room.',
    aim: 'To investigate how the temperature of hot water in a polystyrene cup falls with time and to find its cooling constant.',
    durationMin: 45,
    apparatus: ['polystyrene_cup', 'kettle', 'measuring_cylinder', 'thermometer', 'stopwatch', 'heat_mat'],
    safety: ['Hot water from the kettle can scald: pour it slowly with the cup standing on a heat-resistant mat, and do not carry the full cup around the room.', 'Do not use the thermometer to stir; a broken thermometer must be reported to the teacher.'],
    procedure: [
      'Before starting, read the room temperature θ₀ with the thermometer held in the air away from the bench.',
      'Measure 150 cm³ of water from the kettle with the measuring cylinder and pour it into the polystyrene cup on the mat.',
      'Put the thermometer in the water, stir gently and start the stopwatch. Record the temperature at t = 0.',
      'Keep the stopwatch running and record the temperature every few minutes, stirring gently just before each reading, for 30 minutes.',
      'Calculate the temperature excess θ − θ₀ for each reading.',
      'Plot ln(θ − θ₀) against t. The gradient of the straight line is −k, where k is the cooling constant.',
    ],
    controlled: 'the same cup with no lid, the same volume of water, the cup kept in the same place away from draughts and heaters.',
    model: { kind: 'simplified', summary: 'Newton’s law of cooling: the rate of temperature fall is proportional to the excess over room temperature, so θ − θ₀ = (θᵢ − θ₀) e^(−kt).',
      assumptions: ['The cooling constant k stays the same throughout. In a real open cup evaporation from the surface is relatively larger when the water is hottest, so k is slightly larger at the start; this is left out.', 'The heat capacity of the cup and thermometer and changes in room temperature are ignored.', 'The water is well mixed; each temperature reading has a random error of about ±0.2 °C and is read to the nearest 0.5 °C.'] },
    hidden: (q) => ({ k: q('k', 0.012, 0.024), room: q('room', 19, 24), T0: q('T0', 74, 84) }),
    constants: [{ key: 'room', label: 'Room temperature', symbol: 'θ₀', unit: '°C', resolution: 0.5, instrument: 'thermometer', read: (p, n) => p.room + n(0.15) }],
    iv: { key: 't', label: 'Time', symbol: 't', unit: 'min', min: 0, max: 30, step: 1, start: 0, instrument: 'stopwatch', monotonic: true },
    measures: [{ key: 'T', label: 'Temperature of water', symbol: 'θ', unit: '°C', resolution: 0.5, instrument: 'thermometer', read: (p, x, n) => p.room + (p.T0 - p.room) * Math.exp(-p.k * x) + n(0.2) }],
    derived: [{ key: 'dT', label: 'Temperature excess', symbol: 'Δθ', unit: '°C', decimals: 1, value: (r, c) => r.T - c.room }],
    graph: { x: 't', y: 'dT', ty: 'ln', fit: 'line' },
    results: [{ id: 'k', prompt: 'Cooling constant k', unit: 'min⁻¹', sig: 3, fromFit: (f) => -f.m, truth: (p) => p.k, tolTrue: { rel: 0.08 } }],
    questions: [
      { id: 'lid', type: 'choice', prompt: 'The experiment is repeated with a lid on the cup. What happens to the cooling constant?', options: ['It becomes smaller, because less energy is lost by evaporation and convection from the surface', 'It becomes larger, because the lid traps energy', 'It does not change, because the water and the cup are the same'], correct: 0 },
      { id: 'lngraph', type: 'text', prompt: 'Explain why a graph of ln(θ − θ₀) against t is plotted rather than θ against t.' },
      { id: 'improve', type: 'text', prompt: 'Suggest two changes to the apparatus that would reduce the rate of energy loss, and explain how each one works.' },
    ],
  }),

  definePractical({
    id: 'phys-al-2-2', collection: C('2.2'), topic: 'Stretching materials; non-linear extension',
    title: 'Stretching a loaded rubber band', summary: 'Hang loads from a rubber band, measure its extension and find how the extension depends on the load.',
    aim: 'To investigate how the extension of a rubber band depends on the load and to find the power law that describes it.',
    durationMin: 40,
    apparatus: ['stand_clamp', 'rubber_band', 'slotted_masses', 'metre_rule', 'set_square'],
    safety: ['Wear eye protection: a rubber band can snap and fly back.', 'Clamp the stand firmly or weight its base, and keep your feet away from the hanging masses.'],
    procedure: [
      'Hang the rubber band from the clamp with a light wire hook at its lower end, so that it just hangs straight.',
      'Fix the metre rule vertically beside the band and use the set square to read the position of the bottom of the band. Record this unloaded length L₀.',
      'Hang the 100 g mass hanger on the hook, then add masses so that the load goes up in steps to 600 g. Wait a few seconds after each addition, then record the length L.',
      'Calculate the extension e = L − L₀ and the weight of the load F = mg (g = 9.81 N kg⁻¹).',
      'Plot e against F and describe its shape. Then plot lg(e) against lg(F) and find the gradient n and the intercept.',
    ],
    controlled: 'the same rubber band, loaded only in increasing steps, each reading taken the same time after adding the load.',
    model: { kind: 'simplified', summary: 'Over the loads used the extension follows a power law e = A Fⁿ with n greater than 1, so lg e = n lg F + lg A.',
      assumptions: ['Real rubber does not follow a single power law: at very large extensions it stiffens again, and the unloading curve lies below the loading curve (hysteresis). Only increasing loads in the middle range are modelled.', 'Creep after each load is added is ignored if the reading is taken after a few seconds; small permanent irregularities of about 1 % in each extension are included.', 'Each length reading has a random error of about ±0.05 cm.'] },
    hidden: (q) => ({ A: q('A', 1.0, 1.4), n: q('n', 1.25, 1.55), L0: q('L0', 8.0, 11.0) }),
    constants: [{ key: 'L0', label: 'Unloaded length', symbol: 'L₀', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, n) => p.L0 + n(0.03) }],
    iv: { key: 'm', label: 'Load', symbol: 'm', unit: 'g', min: 100, max: 600, step: 50, start: 100, instrument: 'slotted_masses' },
    measures: [{ key: 'L', label: 'Length of band', symbol: 'L', unit: 'cm', resolution: 0.1, instrument: 'metre_rule',
      read: (p, x, n) => p.L0 + p.A * Math.pow(x / 1000 * G, p.n) * (1 + 0.01 * p.j('e' + x)) + n(0.05) }],
    derived: [
      { key: 'F', label: 'Weight of load', symbol: 'F', unit: 'N', decimals: 3, value: (r) => r.m / 1000 * G },
      { key: 'e', label: 'Extension', symbol: 'e', unit: 'cm', decimals: 1, value: (r, c) => r.L - c.L0 },
    ],
    graph: { x: 'F', tx: 'lg', y: 'e', ty: 'lg', fit: 'line' },
    results: [
      { id: 'n', prompt: 'Power n in e = A Fⁿ', unit: '', sig: 3, fromFit: (f) => f.m, truth: (p) => p.n, tolTrue: { rel: 0.08 } },
      { id: 'A', prompt: 'Extension produced by a load of 1 N (the constant A)', unit: 'cm', sig: 3, fromFit: (f) => Math.pow(10, f.c), truth: (p) => p.A, tolTrue: { rel: 0.12 } },
    ],
    questions: [
      { id: 'shape', type: 'choice', prompt: 'What does the graph of e against F look like over these loads?', options: ['A curve whose gradient increases: each extra newton produces more extension than the one before', 'A straight line through the origin, like a spring', 'A curve whose gradient decreases: the band gets stiffer as soon as it is loaded'], correct: 0 },
      { id: 'hooke', type: 'text', prompt: 'Does the rubber band obey Hooke’s law? Use your graphs to justify your answer.' },
      { id: 'unload', type: 'text', prompt: 'Describe what you would expect to see if you also measured the length while removing the masses, and what this tells you about the energy in the band.' },
    ],
  }),

  definePractical({
    id: 'phys-al-2-3', collection: C('2.3'), topic: 'Moments; centre of mass',
    title: 'Mass of a balanced metre rule', summary: 'Hang different masses near one end of a metre rule, find the balance point on a knife edge each time and deduce the mass of the rule.',
    aim: 'To determine the mass of a metre rule using the principle of moments.',
    durationMin: 40,
    apparatus: ['metre_rule', 'knife_edge', 'slotted_masses', 'string'],
    safety: ['Keep the masses low over the bench and catch the rule if it tips, so the masses do not fall on hands or feet.'],
    procedure: [
      'Tie a loop of thread around the rule close to the 5 cm mark and record the exact position a of the loop.',
      'Hang a 20 g mass from the loop. Slide the rule along the knife edge until it balances horizontally and record the position x of the knife edge on the scale.',
      'Find each balance point twice, approaching from opposite sides, and take the mean.',
      'Repeat with masses up to 300 g.',
      'Calculate the distance y = x − a from the mass to the pivot. Plot 1/y against m.',
      'Taking moments about the pivot, m y = M (c − a − y), so 1/y = m / (M(c − a)) + 1/(c − a). The mass of the rule is M = intercept / gradient.',
    ],
    controlled: 'the same rule and loop position; the rule is balanced horizontally each time.',
    model: { kind: 'quantitative', summary: 'Principle of moments about the knife edge: m (x − a) = M (c − x), with c the centre of mass of the rule close to the 50 cm mark.',
      assumptions: ['The thread loop has negligible mass.', 'The knife edge has a little friction, so each balance point has a random error of about ±0.15 cm.', 'The masses are accurate to their stated values.'] },
    hidden: (q) => ({ M: q('M', 95, 130), c: q('c', 49.6, 50.4), a: q('a', 4.8, 5.3) }),
    constants: [{ key: 'a', label: 'Position of thread loop', symbol: 'a', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, n) => p.a + n(0.03) }],
    iv: { key: 'm', label: 'Hanging mass', symbol: 'm', unit: 'g', min: 20, max: 300, step: 10, start: 20, instrument: 'slotted_masses' },
    measures: [{ key: 'x', label: 'Balance point', symbol: 'x', unit: 'cm', resolution: 0.1, instrument: 'metre_rule',
      read: (p, m, n) => (m * p.a + p.M * p.c) / (m + p.M) + n(0.15) }],
    repeats: 2,
    derived: [{ key: 'y', label: 'Distance from mass to pivot', symbol: 'y', unit: 'cm', decimals: 2, value: (r, c) => r.x - c.a }],
    graph: { x: 'm', y: 'y', ty: 'reciprocal', fit: 'line' },
    results: [{ id: 'M', prompt: 'Mass of the metre rule', unit: 'g', sig: 3, fromFit: (f) => f.c / f.m, truth: (p) => p.M, tolTrue: { rel: 0.08 } }],
    questions: [
      { id: 'heavy', type: 'choice', prompt: 'As the hanging mass is increased, the balance point moves', options: ['towards the hanging mass', 'towards the 50 cm mark', 'it does not move'], correct: 0 },
      { id: 'limit', type: 'text', prompt: 'Explain why it is hard to find the balance point precisely, and suggest a way of improving the precision.' },
    ],
  }),
]
