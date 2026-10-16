// AS & A Level Physics practicals, chapter 14: magnetic fields,
// electromagnetism and charged particles.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const G = 9.81
const MU0 = 4 * Math.PI * 1e-7
const EM = 1.7588e11 // specific charge of the electron / C kg⁻¹
const C = (code, chapter = 'Magnetic fields, electromagnetism and charged particles') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })

// Helmholtz coils used with the electron deflection tube (data printed on the coils).
const HH_N = 320, HH_R = 0.068
const hhB = (I) => Math.pow(0.8, 1.5) * MU0 * HH_N * I / HH_R
const GRAT_X = 8.0 // cm: the vertical graticule line at which the beam is read

export default [
  definePractical({
    id: 'phys-al-14-1', collection: C('14.1'), topic: 'Force on a current-carrying conductor; magnetic flux density',
    title: 'Force on a wire in a magnetic field', summary: 'A wire clamped between magnadur magnets on a balance carries a current. The change in balance reading gives the force, and its variation with current gives the flux density B.',
    aim: 'To investigate how the force on a current-carrying wire in a magnetic field depends on the current, and to determine the magnetic flux density between the magnets.',
    durationMin: 40, difficulty: 'A Level',
    apparatus: ['magnets', 'top_pan_balance', 'stand_clamp', 'dc_supply', 'rheostat', 'ammeter', 'switch', 'leads', 'ruler_30cm'],
    safety: ['The wire and rheostat can get hot at 4 A: open the switch between readings and do not touch the bare wire while current flows.', 'Keep the strong magnets away from phones, cards and the balance mechanism; they can pinch fingers when they snap together.'],
    procedure: [
      'Place the magnadur magnets on their steel yoke on the balance, with opposite poles facing across the gap.',
      'Clamp a stiff straight copper wire horizontally so that it passes through the middle of the gap without touching the magnets or the yoke.',
      'Measure the length L of the pole faces along the wire with the ruler: this is the length of wire in the field.',
      'With no current, record the balance reading m₀ (zero the balance if you prefer, and record 0.00 g).',
      'Connect the wire in series with the supply, rheostat, ammeter and switch. Set a current I, close the switch, record the balance reading m, then open the switch.',
      'Repeat for currents from 0.5 A to 4.0 A.',
      'Calculate the change in reading Δm = m − m₀ and the force F = Δm g. Plot F against I; the gradient is BL, so B = gradient / L.',
    ],
    controlled: 'the same magnets and length of wire in the field, the wire kept in the same position and at right angles to the field.',
    model: { kind: 'quantitative', summary: 'The force on the wire is F = BIL. By Newton’s third law the wire pushes the magnets down with the same force, so the balance reading rises by F / g.',
      assumptions: ['The field is uniform over the length L of the pole faces and zero outside it.', 'The wire is perpendicular to the field and does not move.', 'B is between 0.04 and 0.09 T.', 'The balance reading has a random error of about ±0.01 g (draughts and vibration); L is read to about ±0.03 cm.'] },
    hidden: (q) => ({ B: q('B', 0.040, 0.090), L: q('L', 4.6, 5.4), M0: q('M0', 95, 130) }),
    constants: [
      { key: 'L', label: 'Length of wire in the field', symbol: 'L', unit: 'cm', resolution: 0.1, instrument: 'ruler_30cm', read: (p, n) => p.L + n(0.03) },
      { key: 'm0', label: 'Balance reading with no current', symbol: 'm₀', unit: 'g', resolution: 0.01, instrument: 'top_pan_balance', read: (p, n) => p.M0 + n(0.005) },
    ],
    iv: { key: 'I', label: 'Current', symbol: 'I', unit: 'A', min: 0.5, max: 4.0, step: 0.25, start: 0.5, instrument: 'ammeter' },
    measures: [{ key: 'm', label: 'Balance reading', symbol: 'm', unit: 'g', resolution: 0.01, instrument: 'top_pan_balance',
      read: (p, x, n) => p.M0 + p.B * x * (p.L / 100) / G * 1000 + n(0.01) }],
    derived: [{ key: 'F', label: 'Force on wire', symbol: 'F', unit: 'mN', decimals: 2, value: (r, c) => (r.m - c.m0) * G }],
    graph: { x: 'I', y: 'F', fit: 'line' },
    results: [{ id: 'B', prompt: 'Magnetic flux density between the magnets', unit: 'T', sig: 3, fromFit: (f, c) => f.m / (10 * c.L), truth: (p) => p.B, tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'third', type: 'choice', prompt: 'The force on the wire is upwards. Why does the balance reading increase?', options: ['The wire exerts an equal and opposite downward force on the magnets', 'The current heats the magnets and makes them heavier', 'The magnetic field pulls the balance pan towards the wire', 'The current flowing through the balance adds to its reading'], correct: 0 },
      { id: 'reverse', type: 'text', prompt: 'Predict what happens to the balance reading if the current is reversed, and explain how you could use this to reduce the effect of a drifting balance.' },
    ],
  }),

  definePractical({
    id: 'phys-al-14-2', collection: C('14.2'), topic: 'Force between parallel currents',
    title: 'Planning: separation of two current-carrying foils', summary: 'Plan and test an investigation into how the separation of two hanging aluminium foil strips, carrying opposite currents, depends on the current.',
    aim: 'To plan and carry out an investigation into how the separation of two parallel foil strips carrying a current depends on the current, and to use the results to find the mass per unit length of the foil.',
    durationMin: 60, difficulty: 'A Level', planning: true,
    apparatus: ['aluminium_foil', 'stand_clamp', 'dc_supply', 'rheostat', 'ammeter', 'switch', 'leads', 'ruler_30cm'],
    safety: ['Use a low-voltage supply only. Large currents make the foil and connections hot: close the switch only while taking a reading.', 'Do not touch the foil or the crocodile clips while the current is on.'],
    procedure: [
      'Cut two identical strips of foil and hang them side by side from an insulating bar held in a clamp, so they are parallel and close together.',
      'Join the strips at the top so that the same current flows down one strip and back up the other (opposite directions).',
      'Measure the hanging length l of the strips and their separation d₀ at the bottom with no current.',
      'Connect the strips in series with the supply, rheostat, ammeter and switch. Set a current, close the switch briefly and measure the separation d at the bottom of the strips with the ruler held just behind them.',
      'Take two readings at each current, opening the switch in between, for currents from 2 A to 8 A.',
      'Calculate d(d − d₀) and plot it against I². A straight line through the origin supports the model; use the gradient to find the mass per unit length λ of the foil.',
    ],
    controlled: 'the same strips, hanging length and starting separation; no draughts; readings taken quickly before the foil warms.',
    model: { kind: 'simplified', summary: 'Each strip is treated as a rigid strip of length l pivoted at the top. The force per unit length between antiparallel currents, μ₀I²/(2πd), balances the horizontal component of gravity, which for small angles gives d(d − d₀) = μ₀lI²/(πλg).',
      assumptions: ['Foil flexes and bows rather than tilting as a rigid strip; that is left out.', 'The separation d at the bottom is used for the whole length; in reality it varies from d₀ at the top to d at the bottom.', 'Small-angle approximation, and the strips are treated as long thin parallel wires.', 'Foil mass per unit length 0.35–0.50 g m⁻¹; heating and air currents ignored.', 'The separation reading has a random error of about ±0.05 cm (the strips flutter).'] },
    hidden: (q) => ({ lam: q('lam', 3.5e-4, 5.0e-4), l: q('l', 18, 22), d0: q('d0', 1.6, 2.4) }),
    constants: [
      { key: 'l', label: 'Hanging length of strips', symbol: 'l', unit: 'cm', resolution: 0.1, instrument: 'ruler_30cm', read: (p, n) => p.l + n(0.05) },
      { key: 'd0', label: 'Separation with no current', symbol: 'd₀', unit: 'cm', resolution: 0.1, instrument: 'ruler_30cm', read: (p, n) => p.d0 + n(0.02) },
    ],
    iv: { key: 'I', label: 'Current', symbol: 'I', unit: 'A', min: 2.0, max: 8.0, step: 0.5, start: 2.0, instrument: 'ammeter' },
    measures: [{ key: 'd', label: 'Separation at bottom of strips', symbol: 'd', unit: 'cm', resolution: 0.1, instrument: 'ruler_30cm',
      read: (p, x, n) => {
        const A = MU0 * (p.l / 100) * x * x / (Math.PI * p.lam * G) // m²
        const d0 = p.d0 / 100
        return (d0 + Math.sqrt(d0 * d0 + 4 * A)) / 2 * 100 + n(0.05)
      } }],
    repeats: 2,
    derived: [{ key: 'dd', label: 'Product d(d − d₀)', symbol: 'd(d − d₀)', unit: 'cm²', decimals: 3, value: (r, c) => r.d * (r.d - c.d0) }],
    graph: { x: 'I', tx: 'square', y: 'dd', fit: 'origin' },
    results: [{ id: 'lam', prompt: 'Mass per unit length of the foil', unit: 'g m⁻¹', sig: 3, fromFit: (f, c) => MU0 * (c.l / 100) / (Math.PI * G * f.m * 1e-4) * 1000, truth: (p) => p.lam * 1000, tolTrue: { rel: 0.12 } }],
    questions: [
      { id: 'direction', type: 'choice', prompt: 'Why do the strips move apart?', options: ['Antiparallel currents repel each other', 'Parallel currents in the same direction repel each other', 'The foil becomes electrically charged and like charges repel', 'The heated foil expands sideways'], correct: 0 },
      { id: 'improve', type: 'text', prompt: 'Explain why measuring d at the bottom of the strips gives only an approximate test of the model, and suggest a better arrangement.' },
    ],
  }),

  definePractical({
    id: 'phys-al-14-3', collection: C('14.3'), topic: 'Magnetic field of a coil; Hall probe',
    title: 'Planning: field at the centre of a coil', summary: 'Plan and test an investigation, with a Hall probe, into how the magnetic flux density at the centre of a flat coil depends on its number of turns.',
    aim: 'To plan and carry out an investigation into how the flux density at the centre of a flat circular coil depends on the number of turns, and to estimate the permeability of free space.',
    durationMin: 60, difficulty: 'A Level', planning: true,
    apparatus: ['coil', 'hall_probe', 'dc_supply', 'rheostat', 'ammeter', 'switch', 'leads', 'vernier_callipers', 'stand_clamp'],
    safety: ['The thin coil wire gets hot if the current is left on: switch off between readings.', 'Keep the current at or below 2.5 A and check the supply is a low-voltage d.c. supply.'],
    procedure: [
      'Wind N turns of insulated copper wire closely on a circular former so that they form a flat coil. Measure the diameter D of the windings with the callipers.',
      'Connect the coil in series with the supply, rheostat, ammeter and switch. Set a fixed current I and record it; keep it the same throughout by adjusting the rheostat.',
      'Zero the Hall probe away from the coil. Clamp it so that its sensing face is at the centre of the coil and perpendicular to the axis.',
      'Close the switch and record the flux density B, then open the switch.',
      'Unwind the coil and rewind with a different number of turns, from 5 to 40, keeping the same former, wire and current.',
      'Plot B against N. A straight line supports B ∝ N; the gradient is μ₀I/(2R), from which μ₀ can be found.',
    ],
    controlled: 'the same current, coil radius and wire; the Hall probe at the centre with the same orientation; no other magnets nearby.',
    model: { kind: 'quantitative', summary: 'At the centre of a flat circular coil of radius R, B = μ₀NI/(2R), so B is proportional to N at a fixed current.',
      assumptions: ['All turns lie at the same radius R = D/2 in one plane.', 'The probe may be tilted by up to about 5° from the axis and its zero may be off by up to ±0.02 mT.', 'The current is 1.5–2.5 A; the Hall probe reading has a random error of about ±0.01 mT.'] },
    hidden: (q) => ({ I: q('I', 1.5, 2.5), D: q('D', 5.0, 8.0), z: q('z', -0.02, 0.02) }),
    constants: [
      { key: 'I', label: 'Current in coil', symbol: 'I', unit: 'A', resolution: 0.01, instrument: 'ammeter', read: (p, n) => p.I + n(0.003) },
      { key: 'D', label: 'Diameter of the windings', symbol: 'D', unit: 'cm', resolution: 0.01, instrument: 'vernier_callipers', read: (p, n) => p.D + n(0.02) },
    ],
    iv: { key: 'N', label: 'Number of turns', symbol: 'N', unit: '', min: 5, max: 40, step: 5, start: 5, instrument: 'coil' },
    measures: [{ key: 'B', label: 'Flux density at centre', symbol: 'B', unit: 'mT', resolution: 0.01, instrument: 'hall_probe',
      read: (p, x, n) => MU0 * x * p.I / (p.D / 100) * 1000 * Math.cos(0.087 * Math.abs(p.j('tilt'))) + p.z + n(0.01) }],
    graph: { x: 'N', y: 'B', fit: 'line' },
    results: [{ id: 'mu0', prompt: 'Permeability of free space μ₀', unit: 'μH m⁻¹', sig: 3, fromFit: (f, c) => c.D * f.m * 10 / c.I, truth: () => MU0 * 1e6, tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'offset', type: 'choice', prompt: 'The best-fit line has a small intercept on the B axis. What is the most likely cause?', options: ['A zero error of the Hall probe or a stray field', 'The number of turns was counted incorrectly for every coil', 'The current was too large', 'The coil radius was too small'], correct: 0 },
      { id: 'orient', type: 'text', prompt: 'Explain why the Hall probe must be held with its face perpendicular to the axis of the coil, and how you would check this.' },
    ],
  }),

  definePractical({
    id: 'phys-al-14-4', collection: C('14.4'), topic: 'Magnetic field on the axis of a coil',
    title: 'Field on the axis of a coil', summary: 'Measure the flux density along the axis of a flat coil with a Hall probe and test the axial-field formula with a straight-line graph.',
    aim: 'To investigate how the magnetic flux density on the axis of a flat coil varies with distance from its centre, and to find the radius and number of turns of the coil.',
    durationMin: 50, difficulty: 'A Level',
    apparatus: ['coil', 'hall_probe', 'dc_supply', 'rheostat', 'ammeter', 'switch', 'leads', 'metre_rule', 'stand_clamp'],
    safety: ['The coil warms up if left on: switch off between readings and check it is not hot before touching it.', 'Use a low-voltage d.c. supply and keep the current below 2.5 A.'],
    procedure: [
      'Clamp the flat coil vertically and fix a metre rule along its axis, with the zero at the centre of the coil.',
      'Connect the coil in series with the supply, rheostat, ammeter and switch. Set a current of about 2 A and record it; keep it constant.',
      'Zero the Hall probe well away from the coil, then mount it on the axis with its face perpendicular to the axis.',
      'Record the flux density B at the centre (x = 0), then move the probe along the axis in steps up to x = 14 cm. Take two readings at each position, switching off between them.',
      'The model gives B^(−2/3) = K(R² + x²). Plot B^(−2/3) against x²: the gradient is K and the intercept is KR².',
      'Find the radius from R = √(intercept / gradient), then the number of turns N from K.',
    ],
    controlled: 'the same current, the probe on the axis with the same orientation, no steel or magnets near the coil.',
    model: { kind: 'quantitative', summary: 'On the axis of a flat coil of N turns and radius R, B = μ₀NIR² / (2(R² + x²)^{3/2}). Rearranged, B^(−2/3) = K(R² + x²) with K = (2/(μ₀NIR²))^{2/3}.',
      assumptions: ['All turns are at the same radius R in one plane (a flat coil); in practice the windings have some width and depth.', 'The probe is on the axis; its position along the rule is uncertain by about ±1 mm.', 'The Hall probe reading has a random error of about ±0.005 mT plus 0.3 % of the reading.', 'R is 5–7 cm, N is 180–300 and the current 1.5–2.5 A.'] },
    hidden: (q) => ({ N: Math.round(q('N', 180, 300)), I: q('I', 1.5, 2.5), R: q('R', 5.0, 7.0) }),
    constants: [{ key: 'I', label: 'Current in coil', symbol: 'I', unit: 'A', resolution: 0.01, instrument: 'ammeter', read: (p, n) => p.I + n(0.003) }],
    iv: { key: 'x', label: 'Distance along axis from centre', symbol: 'x', unit: 'cm', min: 0, max: 14, step: 1, start: 0, instrument: 'metre_rule' },
    measures: [{ key: 'B', label: 'Flux density', symbol: 'B', unit: 'mT', resolution: 0.01, instrument: 'hall_probe',
      read: (p, x, n) => {
        const xe = (x + 0.1 * p.j('x' + x)) / 100, R = p.R / 100
        const B = MU0 * p.N * p.I * R * R / (2 * Math.pow(R * R + xe * xe, 1.5)) * 1000
        return B * (1 + n(0.003)) + n(0.005)
      } }],
    repeats: 2,
    derived: [{ key: 'Y', label: 'B to the power −2/3', symbol: 'B^(−2/3)', unit: 'mT^(−2/3)', decimals: 4, value: (r) => Math.pow(r.B, -2 / 3) }],
    graph: { x: 'x', tx: 'square', y: 'Y', fit: 'line' },
    results: [
      { id: 'R', prompt: 'Radius of the coil (from the graph)', unit: 'cm', sig: 3, fromFit: (f) => Math.sqrt(f.c / f.m), truth: (p) => p.R, tolTrue: { rel: 0.06 } },
      { id: 'N', prompt: 'Number of turns on the coil', unit: '', sig: 3, fromFit: (f, c) => 2 / (MU0 * c.I * (f.c * 100) * Math.sqrt(f.m * 1e6)), truth: (p) => p.N, tolTrue: { rel: 0.08 } },
    ],
    questions: [
      { id: 'far', type: 'choice', prompt: 'Far from the coil (x much larger than R), how does B depend on x?', options: ['B ∝ 1/x³', 'B ∝ 1/x²', 'B ∝ 1/x', 'B is constant'], correct: 0 },
      { id: 'why23', type: 'text', prompt: 'Explain why B^(−2/3) is plotted against x², rather than B against x.' },
    ],
  }),

  definePractical({
    id: 'phys-al-14-5', collection: C('14.5'), topic: 'Charged particles in a magnetic field; specific charge of the electron',
    title: 'Specific charge of the electron', summary: 'Teacher demonstration: an electron beam is bent into a circular arc by the uniform field of Helmholtz coils. The radius at different accelerating voltages gives e/m.',
    aim: 'To observe the path of electrons in a uniform magnetic field and use the radius of the path at different accelerating voltages to determine the specific charge e/m of the electron.',
    durationMin: 45, difficulty: 'A Level',
    apparatus: ['electron_tube', 'helmholtz_coils', 'dc_supply', 'rheostat', 'ammeter', 'leads'],
    safety: ['TEACHER DEMONSTRATION ONLY. The tube uses an EHT supply of up to 5 kV: only the teacher connects, adjusts or touches the circuit, and the supply is switched off and its output discharged before any change.', 'Students watch from behind the bench and do not touch the tube, the coils or any lead.', 'The tube is an evacuated glass bulb that could implode if knocked: it stays in its stand, and the heater makes the tube neck hot.'],
    procedure: [
      'The teacher mounts the deflection tube between the Helmholtz coils (320 turns each, radius 6.8 cm, separated by their radius) and connects the heater and EHT supplies.',
      'The coils are connected in series with a d.c. supply, rheostat and ammeter so that their fields add. A fixed coil current I is set and recorded.',
      'The accelerating voltage V is set to 2.5 kV. The beam curves in the field; the vertical deflection y where the beam crosses the graticule line x = 8.0 cm is read.',
      'The voltage is increased in steps up to 5.0 kV and y is read at each step, with two readings at each voltage.',
      'The radius of the path is r = (x² + y²)/(2y). Plot r² against V: the gradient is 2m/(eB²).',
      'Calculate B = (4/5)^{3/2} μ₀NI/R for the coils and hence e/m = 2/(gradient × B²).',
    ],
    controlled: 'the same coil current, the beam entering the field horizontally at the origin of the graticule; the room darkened so the beam is easy to see.',
    model: { kind: 'simplified', summary: 'Electrons accelerated through V gain speed v = √(2eV/m). In a uniform field B the magnetic force evB provides the centripetal force, so r = mv/(eB) and r² = (2m/(eB²)) V.',
      assumptions: ['The field of the Helmholtz coils is uniform over the whole path; in practice it weakens towards the edges of the tube.', 'Electrons leave the anode with exactly the energy eV and enter the field at the graticule origin, moving horizontally.', 'The EHT meter may be off by up to 1 %; the beam position is read to about ±0.05 cm (beam width).', 'Relativistic effects (under 0.5 % at 5 kV) and the Earth’s field are ignored.'] },
    hidden: (q) => ({ I: q('I', 0.38, 0.46) }),
    constants: [{ key: 'I', label: 'Current in the Helmholtz coils', symbol: 'I', unit: 'A', resolution: 0.001, instrument: 'ammeter', read: (p, n) => p.I + n(0.0005) }],
    iv: { key: 'V', label: 'Accelerating voltage', symbol: 'V', unit: 'V', min: 2500, max: 5000, step: 250, start: 2500, instrument: 'dc_supply' },
    measures: [{ key: 'y', label: 'Deflection at x = 8.0 cm', symbol: 'y', unit: 'cm', resolution: 0.1, instrument: 'electron_tube',
      read: (p, x, n) => {
        const V = x * (1 + 0.01 * p.j('eht'))
        const r = Math.sqrt(2 * V / EM) / hhB(p.I) * 100
        return r - Math.sqrt(r * r - GRAT_X * GRAT_X) + n(0.05)
      } }],
    repeats: 2,
    derived: [{ key: 'r', label: 'Radius of path', symbol: 'r', unit: 'cm', decimals: 2, value: (row) => (GRAT_X * GRAT_X + row.y * row.y) / (2 * row.y) }],
    graph: { x: 'V', y: 'r', ty: 'square', fit: 'origin' },
    results: [{ id: 'em', prompt: 'Specific charge of the electron e/m', unit: 'C kg⁻¹', sig: 3, fromFit: (f, c) => 2 / (f.m * 1e-4 * Math.pow(hhB(c.I), 2)), truth: () => EM, tolTrue: { rel: 0.10 } }],
    questions: [
      { id: 'circle', type: 'choice', prompt: 'Why is the path of the electrons in the uniform field an arc of a circle?', options: ['The magnetic force is always perpendicular to the velocity, so the speed is constant and the force is centripetal', 'The magnetic force is parallel to the velocity and slows the electrons', 'Gravity pulls the electrons down in a parabola', 'The electric field of the anode keeps pulling the electrons back'], correct: 0 },
      { id: 'helm', type: 'text', prompt: 'Explain why Helmholtz coils are used rather than a single coil, and why the coil current must be kept constant.' },
    ],
  }),
]
