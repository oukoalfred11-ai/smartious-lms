// AS & A Level Physics practicals, chapter 5: matter and materials.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const G = 9.81
const C = (code, chapter = 'Matter and materials') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })

// Flow through a narrow tube: the head ρgh drives viscous (Poiseuille) flow
// plus the kinetic energy given to the emerging jet:
//   ρ g h = (8ηL / πa⁴) Q + ρ (Q / πa²)²   (SI units)
function flowRate(p, hcm) {
  const rho = 998, Rv = 8 * p.eta * p.L / (Math.PI * p.a ** 4)
  const beta = rho / (Math.PI * p.a * p.a) ** 2
  const dp = rho * G * hcm / 100
  return (-Rv + Math.sqrt(Rv * Rv + 4 * beta * dp)) / (2 * beta) // m³ s⁻¹
}

export default [
  definePractical({
    id: 'phys-al-5-1', collection: C('5.1'), topic: 'Stress, strain and the Young modulus',
    title: 'Young modulus of nylon', summary: 'Load a long nylon line, follow a marker against a fixed rule and find the Young modulus from a stress–strain graph.',
    aim: 'To determine the Young modulus of nylon from a graph of stress against strain.',
    durationMin: 45,
    apparatus: ['stand_clamp', 'g_clamp', 'nylon_line', 'slotted_masses', 'metre_rule', 'micrometer'],
    safety: [
      'Wear eye protection: a stretched line can snap and whip back.',
      'Keep feet and hands clear of the hanging masses and put a box or tray of sand beneath them.',
      'Clamp the stand firmly so the load cannot pull it over.',
    ],
    procedure: [
      'Clamp one end of the nylon line high up so it hangs freely, with a 100 g hanger at the bottom to keep it straight.',
      'Stick a small paper marker to the line near the bottom and fix a metre rule vertically just behind it.',
      'Measure the length L of line from the clamp to the marker.',
      'Measure the diameter d of the line with the micrometer.',
      'Record the position of the marker against the rule with only the hanger on.',
      'Add masses in 100 g steps up to 800 g. After each addition wait a few seconds for the line to settle, then record the marker position.',
      'Calculate the extension e, the tension F = mg, the stress σ = F / (πd²/4) and the strain ε = e / L.',
      'Plot σ against ε. The gradient is the Young modulus.',
    ],
    controlled: 'the same length of line, the same starting load, readings taken the same time after each load is added.',
    model: { kind: 'simplified', summary: 'The line behaves elastically and linearly: stress = E × strain, so the extension is e = F L / (E A).',
      assumptions: [
        'Nylon is really viscoelastic: it creeps slowly under load. This model ignores creep and any change of diameter as the line stretches.',
        'The line stays within its elastic region for loads up to 800 g added to the hanger.',
        'The diameter is uniform; a micrometer reading has a random error of about ±0.004 mm.',
        'Reading the marker against the rule has a random error of about ±0.05 cm (parallax and slight swinging).',
      ] },
    hidden: (q) => ({ E: q('E', 2.0, 3.5), d: q('d', 0.30, 0.45), L: q('L', 150, 190), P0: q('P0', 20, 40) }),
    constants: [
      { key: 'L', label: 'Original length of line', symbol: 'L', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, n) => p.L + n(0.1) },
      { key: 'd', label: 'Diameter of line', symbol: 'd', unit: 'mm', resolution: 0.01, instrument: 'micrometer', read: (p, n) => p.d + n(0.004) },
      { key: 'P0', label: 'Marker position with hanger only', symbol: 'P₀', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, n) => p.P0 + n(0.04) },
    ],
    iv: { key: 'mass', label: 'Added load', symbol: 'm', unit: 'g', min: 100, max: 800, step: 100, start: 100, instrument: 'slotted_masses' },
    measures: [{ key: 'P', label: 'Marker position', symbol: 'P', unit: 'cm', resolution: 0.1, instrument: 'metre_rule',
      read: (p, x, n) => { const A = Math.PI * (p.d / 1000) ** 2 / 4; return p.P0 + (x / 1000 * G) * (p.L / 100) / (p.E * 1e9 * A) * 100 + n(0.05) } }],
    derived: [
      { key: 'e', label: 'Extension', symbol: 'e', unit: 'cm', decimals: 1, value: (r, c) => r.P - c.P0 },
      { key: 'strain', label: 'Strain', symbol: 'ε', unit: '', decimals: 4, value: (r, c) => (r.P - c.P0) / c.L },
      { key: 'stress', label: 'Stress', symbol: 'σ', unit: 'MPa', decimals: 1, value: (r, c) => (r.mass / 1000 * G) / (Math.PI * (c.d / 1000) ** 2 / 4) / 1e6 },
    ],
    graph: { x: 'strain', y: 'stress', fit: 'line' },
    results: [{ id: 'E', prompt: 'Young modulus of nylon', unit: 'GPa', sig: 3, fromFit: (f) => f.m / 1000, truth: (p) => p.E, tolTrue: { rel: 0.1 } }],
    questions: [
      { id: 'long', type: 'choice', prompt: 'Why is a long line (well over a metre) used?', options: ['So that the extension is large enough to measure with a small percentage uncertainty', 'So that the line does not obey Hooke’s law', 'So that the stress in the line is reduced'], correct: 0 },
      { id: 'diam', type: 'text', prompt: 'The diameter measurement contributes the largest uncertainty to E. Explain why, and how you would reduce it.' },
    ],
  }),

  definePractical({
    id: 'phys-al-5-2', collection: C('5.2'), topic: 'Elastic moduli; springs',
    title: 'Young modulus of steel using a spring', summary: 'Find the stiffness of a close-coiled steel spring, use its dimensions to find the shear modulus of the steel and estimate the Young modulus.',
    aim: 'To determine the shear modulus of steel from the stiffness and dimensions of a helical spring, and to estimate the Young modulus of the steel from it.',
    durationMin: 50,
    apparatus: ['stand_clamp', 'spring', 'slotted_masses', 'metre_rule', 'set_square', 'micrometer', 'vernier_callipers'],
    safety: [
      'Clamp the stand to the bench or weight its base so it cannot topple.',
      'Wear eye protection in case the spring or masses fall; keep feet clear of the load.',
    ],
    procedure: [
      'Count the number N of active turns in the coiled part of the spring.',
      'Measure the diameter d of the steel wire with the micrometer, and the outside diameter of the coils with the callipers. The mean coil diameter is D = outside diameter − d.',
      'Hang the spring from the clamp with a metre rule fixed vertically beside it. Use the set square to read the position of the bottom of the spring and record the unloaded length L₀.',
      'Hang loads from 200 g to 1000 g. For each load record the length L of the spring once it is at rest.',
      'Calculate e = L − L₀ and F = mg. Plot F against e and find the stiffness k from the gradient.',
      'Use G = 8 N D³ k / d⁴ to find the shear modulus, then estimate the Young modulus from E = 2G(1 + ν), taking Poisson’s ratio ν = 0.29 for steel.',
    ],
    controlled: 'the same spring, loads added gently and allowed to come to rest, the spring never stretched so far that the coils open permanently.',
    model: { kind: 'simplified', summary: 'Stretching a close-coiled spring twists its wire, so k = G d⁴ / (8 N D³) depends on the shear modulus G, not directly on E. For an isotropic metal E = 2G(1 + ν).',
      assumptions: [
        'The coils are close and the pitch angle is small; end turns and the curvature of the wire are ignored.',
        'The spring was wound with an initial tension of 0.2–0.8 N, so it only starts to extend once the load exceeds this. Loads of 200 g and above are well past it.',
        'Poisson’s ratio for steel is taken as 0.29 exactly; the steel is isotropic.',
        'Micrometer readings have a random error of about ±0.003 mm, calliper readings about ±0.003 cm and length readings about ±0.04 cm.',
      ] },
    hidden: (q) => ({ G: q('G', 76, 82), d: q('d', 0.80, 0.95), D: q('D', 11, 14), N: Math.round(q('N', 22, 30)), F0: q('F0', 0.2, 0.8), L0: q('L0', 4.0, 6.0) }),
    constants: [
      { key: 'N', label: 'Number of turns', symbol: 'N', unit: '', resolution: 1, instrument: 'spring', read: (p) => p.N },
      { key: 'd', label: 'Diameter of wire', symbol: 'd', unit: 'mm', resolution: 0.01, instrument: 'micrometer', read: (p, n) => p.d + n(0.003) },
      { key: 'Dout', label: 'Outside diameter of coils', symbol: 'D₀', unit: 'cm', resolution: 0.01, instrument: 'vernier_callipers', read: (p, n) => (p.D + p.d) / 10 + n(0.003) },
      { key: 'L0', label: 'Unloaded length', symbol: 'L₀', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, n) => p.L0 + n(0.03) },
    ],
    iv: { key: 'mass', label: 'Load', symbol: 'm', unit: 'g', min: 200, max: 1000, step: 100, start: 200, instrument: 'slotted_masses' },
    measures: [{ key: 'L', label: 'Length of spring', symbol: 'L', unit: 'cm', resolution: 0.1, instrument: 'metre_rule',
      read: (p, x, n) => { const k = p.G * 1e9 * (p.d / 1000) ** 4 / (8 * p.N * (p.D / 1000) ** 3); return p.L0 + Math.max(0, x / 1000 * G - p.F0) / k * 100 + n(0.04) } }],
    derived: [
      { key: 'e', label: 'Extension', symbol: 'e', unit: 'cm', decimals: 1, value: (r, c) => r.L - c.L0 },
      { key: 'F', label: 'Weight of load', symbol: 'F', unit: 'N', decimals: 3, value: (r) => r.mass / 1000 * G },
    ],
    graph: { x: 'e', y: 'F', fit: 'line' },
    results: [
      { id: 'G', prompt: 'Shear modulus of the steel', unit: 'GPa', sig: 3, tolTrue: { rel: 0.1 }, truth: (p) => p.G,
        fromFit: (f, c) => { const k = f.m * 100, D = (c.Dout * 10 - c.d) / 1000; return 8 * c.N * D ** 3 * k / (c.d / 1000) ** 4 / 1e9 } },
      { id: 'E', prompt: 'Young modulus of the steel (taking ν = 0.29)', unit: 'GPa', sig: 3, tolTrue: { rel: 0.1 }, truth: (p) => 2 * p.G * 1.29,
        fromFit: (f, c) => { const k = f.m * 100, D = (c.Dout * 10 - c.d) / 1000; return 2 * 1.29 * 8 * c.N * D ** 3 * k / (c.d / 1000) ** 4 / 1e9 } },
    ],
    questions: [
      { id: 'which', type: 'choice', prompt: 'When a close-coiled spring is stretched, how is the steel wire mainly deformed?', options: ['It is twisted, so the spring constant depends on the shear modulus', 'It is stretched along its length, so the spring constant equals the Young modulus', 'It is compressed, so the spring constant depends on the bulk modulus'], correct: 0 },
      { id: 'intercept', type: 'choice', prompt: 'The F–e line meets the F axis above zero. What does the intercept represent?', options: ['The initial tension wound into the spring', 'The weight of the metre rule', 'A zero error in the slotted masses'], correct: 0 },
      { id: 'power', type: 'text', prompt: 'G depends on d⁴. Estimate the percentage uncertainty in G caused by the micrometer reading and explain why it dominates.' },
    ],
  }),

  definePractical({
    id: 'phys-al-5-3', collection: C('5.3'), topic: 'Pressure in a liquid; flow',
    title: 'Water pressure and flow rate', summary: 'Keep water at a steady height in a bottle with a narrow outlet tube, weigh the water that flows out in two minutes and relate the flow rate to the pressure.',
    aim: 'To investigate how the rate of flow of water through a narrow tube depends on the pressure difference across it, and to estimate the internal radius of the tube.',
    durationMin: 50,
    apparatus: ['bottle_outlet', 'water_jug', 'beaker_250', 'top_pan_balance', 'stopwatch', 'metre_rule', 'ruler_30cm'],
    safety: ['Stand the bottle in a tray and wipe up spills at once; keep water away from the balance’s mains supply.'],
    procedure: [
      'Measure the length L of the narrow horizontal outlet tube with the 30 cm ruler.',
      'Fill the bottle and tape a metre rule beside it with its zero level with the centre of the outlet tube.',
      'Let water run out. Keep the surface at a chosen height h above the outlet by pouring in water gently from the jug.',
      'Collect the water flowing from the tube in a weighed beaker for exactly 120 s, then find the mass m collected.',
      'Repeat for heights from about 4 cm to 24 cm.',
      'Calculate the flow rate Q = m / (120 s × 1.00 g cm⁻³) and the pressure difference Δp = ρgh.',
      'Plot Q against Δp. A straight line through the origin shows viscous flow; Q ∝ √h would instead suggest a free jet.',
      'Use the gradient K = πa⁴ / (8ηL) with η = 1.00 × 10⁻³ Pa s to find the internal radius a of the tube.',
    ],
    controlled: 'the same tube, the water at room temperature (so its viscosity does not change), the head kept steady during each collection.',
    model: { kind: 'simplified', summary: 'Water flows smoothly (laminar flow) through the narrow tube: ρgh = (8ηL/πa⁴) Q + ρv², the second term being the kinetic energy carried away by the jet.',
      assumptions: [
        'The flow in the tube is laminar; the kinetic-energy term reduces the flow by only a few per cent at the largest heights, and losses at the entrance of the tube are ignored.',
        'The viscosity of the water is between 0.95 and 1.05 mPa s (room temperature); the analysis assumes 1.00 mPa s.',
        'The head drifts by up to ±0.15 cm while topping up; starting and stopping the collection adds about ±0.3 % to the mass and drips about ±0.03 g.',
      ] },
    hidden: (q) => ({ a: q('a', 0.35, 0.42) / 1000, L: q('L', 0.15, 0.25), eta: q('eta', 0.95, 1.05) / 1000 }),
    constants: [{ key: 'L', label: 'Length of outlet tube', symbol: 'L', unit: 'cm', resolution: 0.1, instrument: 'ruler_30cm', read: (p, n) => p.L * 100 + n(0.04) }],
    iv: { key: 'h', label: 'Height of water above outlet', symbol: 'h', unit: 'cm', min: 4, max: 24, step: 2, start: 4, instrument: 'metre_rule' },
    measures: [{ key: 'm', label: 'Mass of water collected in 120 s', symbol: 'm', unit: 'g', resolution: 0.01, instrument: 'top_pan_balance',
      read: (p, x, n) => flowRate(p, x + 0.15 * p.j('h' + x)) * 998e3 * 120 * (1 + n(0.003)) + n(0.03) }],
    derived: [
      { key: 'Q', label: 'Flow rate', symbol: 'Q', unit: 'cm³ s⁻¹', decimals: 4, value: (r) => r.m / 120 },
      { key: 'dp', label: 'Pressure difference', symbol: 'Δp', unit: 'kPa', decimals: 3, value: (r) => 1000 * G * r.h / 100 / 1000 },
    ],
    graph: { x: 'dp', y: 'Q', fit: 'line' },
    results: [
      { id: 'K', prompt: 'Gradient K of the Q–Δp graph', unit: 'cm³ s⁻¹ kPa⁻¹', sig: 3, fromFit: (f) => f.m, tolTrue: { rel: 0.1 },
        truth: (p) => Math.PI * p.a ** 4 / (8 * p.eta * p.L) * 1e9 },
      { id: 'a', prompt: 'Internal radius of the outlet tube', unit: 'mm', sig: 3, tolTrue: { rel: 0.05 }, truth: (p) => p.a * 1000,
        fromFit: (f, c) => (8 * 1.00e-3 * (c.L / 100) * f.m * 1e-9 / Math.PI) ** 0.25 * 1000 },
    ],
    questions: [
      { id: 'shape', type: 'choice', prompt: 'Your graph of Q against Δp is a straight line through (or very close to) the origin. What does this show?', options: ['The flow is mainly controlled by viscosity, so Q is proportional to the pressure difference', 'The water leaves as a free jet, so Q is proportional to √h', 'The flow rate does not depend on pressure'], correct: 0 },
      { id: 'radius', type: 'text', prompt: 'The radius is found from a fourth root. Explain why this makes the radius more precise than K itself, and why the temperature of the water still matters.' },
    ],
  }),
]
