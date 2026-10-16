// AS & A Level Physics practicals, chapter 10: circular motion and gravitational fields.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const G = 9.81
const GRAV = 6.67e-11
const C = (code, chapter = 'Circular motion and gravitational fields') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })

// Hanging mass in 10.1 (hanger plus slotted masses, stated to the student).
const M_HANG = 0.200

// Conical pendulum: period for a vertical height h (m) of the cone.
const conicalT = (h, g) => 2 * Math.PI * Math.sqrt(h / g)

export default [
  definePractical({
    id: 'phys-al-10-1', collection: C('10.1'), topic: 'Circular motion; centripetal force',
    title: 'Whirling bung: centripetal force',
    summary: 'Whirl a rubber bung on a string through a tube, with a hanging mass providing the tension, and find how the period depends on the length of string.',
    aim: 'To investigate how the period of a bung whirled in a circle depends on the length of the string when the centripetal force is kept constant, and to find the mass of the bung from the gradient of T² against L.',
    durationMin: 45,
    apparatus: ['rubber_bung', 'slotted_masses', 'top_pan_balance', 'metre_rule', 'stopwatch'],
    safety: ['Wear eye protection. Check the bung is tied on securely before whirling it.', 'Whirl the bung above head height in a clear space, well away from other people and windows.'],
    procedure: [
      'Weigh the rubber bung and record its mass m.',
      'Thread the string through the tube and hang a total mass of 200 g (hanger and slotted masses) from the lower end.',
      'Measure a length L of string from the top of the tube to the centre of the bung and mark the string just below the tube with a small paper clip.',
      'Whirl the bung in a horizontal circle so that the marker stays just below the tube without touching it. Time 20 revolutions; repeat.',
      'Repeat for lengths from 30 cm to 100 cm.',
      'The tension Mg provides the centripetal force: Mg = m (4π² / T²) L, so T² = (4π² m / Mg) L. Plot T² against L and find m = Mg × gradient / 4π².',
    ],
    controlled: 'the same hanging mass of 200 g, the same bung, the marker kept just below the tube.',
    model: { kind: 'simplified', summary: 'The string tension equals the weight of the hanging mass, and it provides the centripetal force on the bung: Mg = m ω² L. (L is the string length, so the result holds even when the string droops below the horizontal.)',
      assumptions: ['Friction where the string rubs on the tube changes the tension by up to ±3 %; this is the same for all lengths.', 'The mass of the string is ignored and the bung is treated as a point at the end of L.', 'The length of string in the circle wanders by about ±0.5 cm as the student keeps the marker just below the tube.', 'Each timing of 20 revolutions has a random error of about ±0.15 s.'] },
    hidden: (q) => ({ m: q('m', 0.020, 0.035) }),
    constants: [{ key: 'm', label: 'Mass of bung', symbol: 'm', unit: 'g', resolution: 0.01, instrument: 'top_pan_balance', read: (p) => p.m * 1000 }],
    iv: { key: 'L', label: 'Length of string to bung', symbol: 'L', unit: 'cm', min: 30, max: 100, step: 5, start: 30, instrument: 'metre_rule' },
    measures: [{ key: 't', label: 'Time for 20 revolutions', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch',
      read: (p, x, n) => {
        const L = (x + n(0.5)) / 100
        const F = M_HANG * G * (1 + 0.03 * p.j('friction'))
        return 20 * 2 * Math.PI * Math.sqrt(p.m * L / F) + n(0.15)
      } }],
    repeats: 2,
    derived: [
      { key: 'Lm', label: 'Length of string', symbol: 'L', unit: 'm', decimals: 2, value: (r) => r.L / 100 },
      { key: 'T', label: 'Period', symbol: 'T', unit: 's', decimals: 3, value: (r) => r.t / 20 },
    ],
    graph: { x: 'Lm', y: 'T', ty: 'square', fit: 'line' },
    results: [{ id: 'm', prompt: 'Mass of the bung from the gradient', unit: 'g', sig: 3, fromFit: (f) => M_HANG * G * f.m / (4 * Math.PI ** 2) * 1000, truth: (p) => p.m * 1000, tolTrue: { rel: 0.1 } }],
    questions: [
      { id: 'force', type: 'choice', prompt: 'If the length of string is doubled while the hanging mass stays the same, what happens to the period?', options: ['It increases by a factor of √2', 'It doubles', 'It halves', 'It stays the same'], correct: 0 },
      { id: 'compare', type: 'text', prompt: 'Compare the mass from your graph with the balance reading. Suggest why they differ.' },
    ],
  }),

  definePractical({
    id: 'phys-al-10-2', collection: C('10.2'), topic: 'Circular motion; conical pendulum',
    title: 'The conical pendulum: period and height',
    summary: 'Swing a bob in a horizontal circle on a string, time its revolutions for different heights of the cone and find g from a graph of T² against h.',
    aim: 'To show that the period of a conical pendulum depends on the height h of the cone, T = 2π √(h/g), and to determine g.',
    durationMin: 45,
    apparatus: ['stand_clamp', 'string', 'pendulum_bob', 'metre_rule', 'stopwatch'],
    safety: ['Clamp the stand firmly or weigh down its base; a swinging bob can pull it over.', 'Keep faces away from the plane of the circle.'],
    procedure: [
      'Hang the bob from the clamp. Draw circles on paper on the bench below to help keep the bob moving in a steady horizontal circle.',
      'Start the bob moving in a horizontal circle. Measure the vertical height h from the point of suspension to the plane of the circle (the level of the centre of the bob), using the metre rule held vertically.',
      'Time 10 revolutions. Repeat twice more for the same h.',
      'Change h by changing the string length and circle size, for heights from 20 cm to 80 cm.',
      'For a conical pendulum T = 2π √(h/g), so T² = (4π²/g) h. Plot T² against h; g = 4π² / gradient.',
    ],
    controlled: 'the same bob; a steady horizontal circle at each height.',
    model: { kind: 'quantitative', summary: 'Tension and weight together provide the centripetal force. tan θ = r/h = ω²r/g, so ω² = g/h and T = 2π √(h/g), independent of the string length or radius separately.',
      assumptions: ['Air resistance is negligible and the bob moves in a steady horizontal circle.', 'g is 9.78–9.83 N kg⁻¹.', 'h is measured to the centre of the bob; this is uncertain by about ±0.3 cm, the same at every height.', 'The circle drifts so that h varies by about ±1 cm during each timing.', 'Each timing of 10 revolutions has a random error of about ±0.12 s.'] },
    hidden: (q) => ({ g: q('g', 9.78, 9.83) }),
    iv: { key: 'h', label: 'Height of cone', symbol: 'h', unit: 'cm', min: 20, max: 80, step: 5, start: 20, instrument: 'metre_rule' },
    measures: [{ key: 't', label: 'Time for 10 revolutions', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch',
      read: (p, x, n) => 10 * conicalT((x + 0.3 * p.j('h0') + n(1)) / 100, p.g) + n(0.12) }],
    repeats: 3,
    derived: [
      { key: 'hm', label: 'Height of cone', symbol: 'h', unit: 'm', decimals: 2, value: (r) => r.h / 100 },
      { key: 'T', label: 'Period', symbol: 'T', unit: 's', decimals: 3, value: (r) => r.t / 10 },
    ],
    graph: { x: 'hm', y: 'T', ty: 'square', fit: 'line' },
    results: [{ id: 'g', prompt: 'Acceleration of free fall', unit: 'm s⁻²', sig: 3, fromFit: (f) => 4 * Math.PI ** 2 / f.m, truth: (p) => p.g, tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'force', type: 'choice', prompt: 'Which forces act on the bob of a conical pendulum (ignoring air resistance)?', options: ['Its weight and the tension in the string only', 'Its weight, the tension and a separate centripetal force', 'The tension and an outward centrifugal force only', 'Its weight only'], correct: 0 },
      { id: 'hard', type: 'text', prompt: 'Which measurement is hardest to make precisely in this experiment? Suggest how to improve it.' },
    ],
  }),

  definePractical({
    id: 'phys-al-10-3', collection: C('10.3'), topic: 'Circular motion; conical pendulum',
    title: 'Conical pendulum: period and radius of the circle',
    summary: 'Keep the string length fixed, change the radius of the circle and find g and the string length from a graph of T⁴ against r².',
    aim: 'To investigate how the period of a conical pendulum of fixed length depends on the radius of its circle, and to determine g and the length of the pendulum from a straight-line graph.',
    durationMin: 50,
    apparatus: ['stand_clamp', 'string', 'pendulum_bob', 'metre_rule', 'stopwatch'],
    safety: ['Clamp the stand firmly or weigh down its base; a swinging bob can pull it over.', 'Keep faces away from the plane of the circle, especially at large radii.'],
    procedure: [
      'Hang the bob so that the length L from the point of suspension to the centre of the bob is about 1 m. Measure L.',
      'Draw circles of radius 10 cm to 60 cm on paper centred directly below the point of suspension.',
      'Set the bob moving so that its centre travels above one of the circles. Time 20 revolutions (T⁴ magnifies timing errors four times, so long timings matter), three times.',
      'Repeat for each radius r.',
      'The height of the cone is h = √(L² − r²), so T⁴ = (16π⁴/g²)(L² − r²). Plot T⁴ against r².',
      'g = √(−16π⁴ / gradient) (with r in m), and L = √(−intercept / gradient).',
    ],
    controlled: 'the same bob and length of string; the centre of the circles directly below the support.',
    model: { kind: 'quantitative', summary: 'T = 2π √(h/g) with h = √(L² − r²). Raising this to the fourth power gives a straight line, T⁴ = (16π⁴/g²) L² − (16π⁴/g²) r².',
      assumptions: ['Air resistance is negligible and the bob follows the drawn circle; the radius wanders by about ±0.5 cm.', 'The string is light and does not stretch; L is 90–110 cm and g is 9.78–9.83 N kg⁻¹.', 'Each timing of 20 revolutions has a random error of about ±0.12 s.'] },
    hidden: (q) => ({ g: q('g', 9.78, 9.83), L: q('L', 90, 110) }),
    constants: [{ key: 'L', label: 'Length of pendulum', symbol: 'L', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, n) => p.L + n(0.2) }],
    iv: { key: 'r', label: 'Radius of circle', symbol: 'r', unit: 'cm', min: 10, max: 60, step: 5, start: 10, instrument: 'metre_rule' },
    measures: [{ key: 't', label: 'Time for 20 revolutions', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch',
      read: (p, x, n) => { const r = x + n(0.5); return 20 * conicalT(Math.sqrt(p.L * p.L - r * r) / 100, p.g) + n(0.12) } }],
    repeats: 3,
    derived: [
      { key: 'rm', label: 'Radius of circle', symbol: 'r', unit: 'm', decimals: 2, value: (r) => r.r / 100 },
      { key: 'T4', label: 'Period to the fourth power', symbol: 'T⁴', unit: 's⁴', decimals: 2, value: (r) => (r.t / 20) ** 4 },
    ],
    graph: { x: 'rm', tx: 'square', y: 'T4', fit: 'line' },
    results: [
      { id: 'g', prompt: 'Acceleration of free fall', unit: 'm s⁻²', sig: 3, fromFit: (f) => Math.sqrt(-16 * Math.PI ** 4 / f.m), truth: (p) => p.g, tolTrue: { rel: 0.06 } },
      { id: 'L', prompt: 'Length of the pendulum from the graph', unit: 'm', sig: 3, fromFit: (f) => Math.sqrt(-f.c / f.m), truth: (p) => p.L / 100, tolTrue: { rel: 0.06 } },
    ],
    questions: [
      { id: 'radius', type: 'choice', prompt: 'With the length of string fixed, what happens to the period as the radius of the circle increases?', options: ['It decreases, because the height of the cone decreases', 'It increases, because the bob travels further', 'It stays the same', 'It increases, because the tension decreases'], correct: 0 },
      { id: 'why4', type: 'text', prompt: 'Explain why T⁴ against r², rather than T against r, is plotted.' },
    ],
  }),

  definePractical({
    id: 'phys-al-10-4', collection: C('10.4'), topic: 'Gravitational fields; Kepler’s third law',
    title: 'Planetary motion (simulation)',
    summary: 'Use a computer simulation of planets orbiting a star to find how the orbital period depends on the orbital radius, and find the mass of the star.',
    aim: 'To use simulated orbital data to show that T² ∝ r³ for circular orbits and to determine the mass of the central star.',
    durationMin: 35,
    apparatus: ['datalogger'],
    safety: ['This practical uses a computer simulation only; take regular breaks from the screen.'],
    procedure: [
      'Open the orbit simulation on the data logger. It models a star of unknown mass with a small planet in a circular orbit.',
      'Set the orbital radius r of the planet, run the simulation and record the orbital period T reported by the logger, in megaseconds (1 Ms = 10⁶ s).',
      'Repeat for radii from 50 Gm to 500 Gm (1 Gm = 10⁹ m).',
      'For a circular orbit GMm / r² = m (4π²/T²) r, so T² = (4π² / GM) r³. Plot T² against r³.',
      'Find the gradient, convert it to s² m⁻³ (1 Ms² Gm⁻³ = 10⁻¹⁵ s² m⁻³) and calculate M = 4π² / (G × gradient), with G = 6.67 × 10⁻¹¹ N m² kg⁻².',
    ],
    controlled: 'the same star in every run; each planet released into a circular orbit.',
    model: { kind: 'simplified', summary: 'This is a simulation, not a measurement of real planets. Each planet moves in a circular orbit under the star’s gravity alone, so T² = 4π² r³ / (GM).',
      assumptions: ['The planet’s mass is negligible compared with the star’s, so the star does not move.', 'Orbits are exactly circular; real orbits are ellipses and T² ∝ a³ uses the semi-major axis.', 'The simulation adds a small pull from other planets that changes each period by up to ±0.2 %, and the logger times each orbit to about ±0.3 %.', 'The star’s mass is 1.0–3.0 × 10³⁰ kg.'] },
    hidden: (q) => ({ M: q('M', 1.0, 3.0) }),
    iv: { key: 'r', label: 'Orbital radius', symbol: 'r', unit: 'Gm', min: 50, max: 500, step: 10, start: 50, instrument: 'datalogger' },
    measures: [{ key: 'T', label: 'Orbital period', symbol: 'T', unit: 'Ms', resolution: 0.01, instrument: 'datalogger',
      read: (p, x, n) => 2 * Math.PI * Math.sqrt((x * 1e9) ** 3 / (GRAV * p.M * 1e30)) / 1e6 * (1 + 0.002 * p.j('pert' + x) + n(0.003)) }],
    derived: [{ key: 'r3', label: 'Orbital radius cubed', symbol: 'r³', unit: 'Gm³', decimals: 0, value: (r) => r.r ** 3 }],
    graph: { x: 'r3', y: 'T', ty: 'square', fit: 'origin' },
    results: [{ id: 'M', prompt: 'Mass of the star (in units of 10³⁰ kg)', unit: '10³⁰ kg', sig: 3, fromFit: (f) => 4 * Math.PI ** 2 / (GRAV * f.m * 1e-15) / 1e30, truth: (p) => p.M, tolTrue: { rel: 0.05 } }],
    questions: [
      { id: 'kepler', type: 'choice', prompt: 'A planet orbits at four times the radius of another planet round the same star. How many times longer is its period?', options: ['8', '4', '16', '2'], correct: 0 },
      { id: 'planetMass', type: 'choice', prompt: 'Why can this method not be used to find the mass of the orbiting planet?', options: ['The planet’s mass cancels from the equation for its orbit', 'The planet is too far away', 'The period depends only on the planet’s mass', 'The gradient of the graph is zero'], correct: 0 },
    ],
  }),

  definePractical({
    id: 'phys-al-10-5', collection: C('10.5'), topic: 'Gravitational potential; escape speed',
    title: 'Gravitational potential (simulation)',
    summary: 'Use a simulation to find the escape speed of a probe at different distances from a planet, convert it to gravitational potential and find the planet’s mass from φ against 1/r.',
    aim: 'To use simulated launches to determine the gravitational potential at different distances from the centre of a planet, to show that φ ∝ −1/r and to determine the mass of the planet.',
    durationMin: 35,
    apparatus: ['datalogger'],
    safety: ['This practical uses a computer simulation only; take regular breaks from the screen.'],
    procedure: [
      'Open the planet simulation on the data logger and record the radius R of the planet that it displays.',
      'Place the probe at a distance r from the centre of the planet. Use the escape-speed search: the simulation launches the probe straight outwards at different speeds and reports the smallest speed v for which it never returns.',
      'Repeat for distances from 8 Mm to 40 Mm (1 Mm = 10⁶ m).',
      'A probe that just escapes has zero total energy, so ½ v² + φ = 0 and φ = −½ v². With v in km s⁻¹, φ = −½ v² gives φ in MJ kg⁻¹.',
      'Plot φ against 1/r. The gradient is −GM (in MJ kg⁻¹ Mm); find M using G = 6.67 × 10⁻¹¹ N m² kg⁻², and use the line to find the potential at the surface.',
    ],
    controlled: 'the same planet in every run; probe launched radially outwards.',
    model: { kind: 'simplified', summary: 'This is a simulation, not a real measurement. The planet is a uniform, non-rotating sphere with no atmosphere and no other bodies nearby, so φ = −GM/r outside it and the escape speed is v = √(2GM/r).',
      assumptions: ['Air resistance and the rotation of the planet are left out.', 'The escape-speed search stops when it has found v to within about ±0.02 km s⁻¹.', 'The planet’s mass is 3–9 × 10²⁴ kg and its radius 4.0–7.0 Mm.'] },
    hidden: (q) => ({ M: q('M', 3, 9), R: q('R', 4.0, 7.0) }),
    constants: [{ key: 'R', label: 'Radius of planet', symbol: 'R', unit: 'Mm', resolution: 0.01, instrument: 'datalogger', read: (p) => p.R }],
    iv: { key: 'r', label: 'Distance from centre of planet', symbol: 'r', unit: 'Mm', min: 8, max: 40, step: 1, start: 8, instrument: 'datalogger' },
    measures: [{ key: 'v', label: 'Escape speed', symbol: 'v', unit: 'km s⁻¹', resolution: 0.01, instrument: 'datalogger',
      read: (p, x, n) => Math.sqrt(2 * GRAV * p.M * 1e24 / (x * 1e6)) / 1000 + n(0.01) }],
    derived: [
      { key: 'inv', label: 'Reciprocal of distance', symbol: '1/r', unit: 'Mm⁻¹', decimals: 4, value: (r) => 1 / r.r },
      { key: 'phi', label: 'Gravitational potential', symbol: 'φ', unit: 'MJ kg⁻¹', decimals: 2, value: (r) => -0.5 * r.v * r.v },
    ],
    graph: { x: 'inv', y: 'phi', fit: 'line' },
    results: [
      { id: 'M', prompt: 'Mass of the planet (in units of 10²⁴ kg)', unit: '10²⁴ kg', sig: 3, fromFit: (f) => -f.m * 1e12 / GRAV / 1e24, truth: (p) => p.M, tolTrue: { rel: 0.05 } },
      { id: 'phiR', prompt: 'Gravitational potential at the surface of the planet', unit: 'MJ kg⁻¹', sig: 3, fromFit: (f, c) => f.m / c.R + f.c, truth: (p) => -GRAV * p.M * 1e24 / (p.R * 1e6) / 1e6, tolTrue: { rel: 0.05 } },
    ],
    questions: [
      { id: 'sign', type: 'choice', prompt: 'Why is gravitational potential negative?', options: ['Zero potential is defined at infinity, and work must be done on a mass to move it there', 'Gravity can be repulsive', 'Potential is measured from the surface of the planet', 'Kinetic energy is always negative'], correct: 0 },
      { id: 'intercept', type: 'choice', prompt: 'What should the intercept of the φ against 1/r graph be?', options: ['Zero, because φ → 0 as r → infinity', 'The potential at the surface', '−g', 'The escape speed'], correct: 0 },
    ],
  }),
]
