// AS & A Level Physics practicals, chapter 15: electromagnetic induction
// and alternating currents.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const G = 9.81
const C = (code, chapter = 'Electromagnetic induction and alternating currents') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })
const NP = 120 // primary turns on the transformer kit (printed on the coil)
const F_MAINS = 50 // Hz

export default [
  definePractical({
    id: 'phys-al-15-1', collection: C('15.1'), topic: 'Electromagnetic induction; Lenz’s law',
    title: 'Planning: height of a levitating ring', summary: 'Plan and test an investigation into how the height at which an aluminium ring floats above an a.c. coil depends on the current in the coil.',
    aim: 'To plan and carry out an investigation into how the levitation height of an aluminium ring above a coil with an iron core depends on the alternating current in the coil.',
    durationMin: 60, difficulty: 'A Level', planning: true,
    apparatus: ['coil', 'iron_core', 'metal_ring', 'ac_supply', 'rheostat', 'ammeter', 'switch', 'leads', 'metre_rule', 'stand_clamp'],
    safety: ['Use the low-voltage isolated a.c. supply. If the school’s ring apparatus runs directly from the mains, only the teacher operates it.', 'The coil and the ring get hot: switch on only while reading, and lift the ring off with tongs or after it has cooled.', 'Do not lean over the coil: the ring can jump up sharply when the current is switched on.'],
    procedure: [
      'Stand the coil on the bench with the long iron core rising vertically through it. Clamp a metre rule beside the core with its zero at the top of the coil.',
      'Slide the aluminium ring over the core so it rests on the coil.',
      'Connect the coil to the a.c. supply through the rheostat, an a.c. ammeter and a switch.',
      'Set a current I, close the switch and read the height h of the bottom of the ring above the coil once it has settled, with your eye level with the ring. Open the switch.',
      'Take two readings at each current, for currents from 2 A to 6 A, letting the ring cool between readings.',
      'The model predicts h = 2h₀ ln(I / I₀). Plot h against ln I: a straight line supports it. Find h₀ from the gradient and I₀ (the current that just lifts the ring) from the intercept.',
    ],
    controlled: 'the same ring, coil, core and supply frequency; the ring allowed to cool so its resistance stays the same.',
    model: { kind: 'simplified', summary: 'The alternating flux induces a current in the ring proportional to the coil current, so the repulsive force is proportional to I². The field of the core is taken to fall off exponentially with height, so the force is kI²e^(−h/h₀). The ring floats where this equals its weight, giving h = 2h₀ ln(I / I₀).',
      assumptions: ['The exponential fall-off of the force with height is an approximation to the real field of the core.', 'The ring’s resistance does not change as it warms; in practice a hot ring floats lower.', 'Phase differences, the ring’s self-inductance and friction on the core are ignored.', 'h₀ is 3–5 cm and I₀ is 1.0–1.5 A; the height is read to about ±0.15 cm because the ring hovers and vibrates.'] },
    hidden: (q) => ({ h0: q('h0', 3.0, 5.0), I0: q('I0', 1.0, 1.5) }),
    // An a.c. circuit with currents up to 6 A (above the solver's 5 A trip):
    // no resistive values.
    circuit: {
      parts: [
        { id: 'PS', type: 'supply', apparatus: 'ac_supply', label: 'A.c. supply' },
        { id: 'S1', type: 'switch', apparatus: 'switch', label: 'Switch' },
        { id: 'RH', type: 'resistor', apparatus: 'rheostat', label: 'Rheostat' },
        { id: 'A1', type: 'ammeter', apparatus: 'ammeter', label: 'A.c. ammeter' },
        { id: 'X', type: 'resistor', apparatus: 'coil', label: 'Coil' },
      ],
      checks: [{ meter: 'A1', series: 'X' }],
      correct: [['PS.+', 'S1.a'], ['S1.b', 'RH.a'], ['RH.b', 'A1.+'], ['A1.-', 'X.a'], ['X.b', 'PS.-']],
    },
    iv: { key: 'I', label: 'Current in coil (r.m.s.)', symbol: 'I', unit: 'A', min: 2.0, max: 6.0, step: 0.25, start: 2.0, instrument: 'ammeter' },
    measures: [{ key: 'h', label: 'Height of ring above coil', symbol: 'h', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, x, n) => 2 * p.h0 * Math.log(x / p.I0) + n(0.15) }],
    repeats: 2,
    graph: { x: 'I', tx: 'ln', y: 'h', fit: 'line' },
    results: [
      { id: 'h0', prompt: 'Decay length h₀ of the levitating force', unit: 'cm', sig: 3, fromFit: (f) => f.m / 2, truth: (p) => p.h0, tolTrue: { rel: 0.08 } },
      { id: 'I0', prompt: 'Current I₀ that just lifts the ring', unit: 'A', sig: 3, fromFit: (f) => Math.exp(-f.c / f.m), truth: (p) => p.I0, tolTrue: { rel: 0.10 } },
    ],
    questions: [
      { id: 'dc', type: 'choice', prompt: 'What happens if a steady d.c. current is used instead of a.c.?', options: ['The ring jumps only briefly at switch-on, then falls back, because the flux stops changing', 'The ring floats higher because d.c. is stronger', 'The ring floats at the same height', 'The ring is attracted down onto the coil and stays there'], correct: 0 },
      { id: 'split', type: 'text', prompt: 'Predict what happens if the ring is replaced by one with a narrow cut through it, and explain using Faraday’s and Lenz’s laws.' },
    ],
  }),

  definePractical({
    id: 'phys-al-15-2', collection: C('15.2'), topic: 'Faraday’s law; induced e.m.f.',
    title: 'A magnet falling through a coil', summary: 'Drop a bar magnet through a coil from different heights and use a data logger to find how the peak induced e.m.f. depends on the speed of the magnet.',
    aim: 'To investigate how the peak e.m.f. induced in a coil by a falling magnet depends on the height from which it is dropped.',
    durationMin: 45, difficulty: 'A Level',
    apparatus: ['bar_magnet', 'coil', 'datalogger', 'leads', 'metre_rule', 'stand_clamp', 'sand_tray'],
    safety: ['Put the sand tray under the coil so the magnet lands softly and does not break or bounce off the bench.', 'Keep feet and hands clear of the falling magnet; drop it only from heights up to 80 cm.'],
    procedure: [
      'Clamp the coil with its axis vertical and the sand tray underneath. Connect the coil to the voltage input of the data logger, set to record quickly (at least 1000 readings per second).',
      'Hold the magnet vertically above the coil with the metre rule beside it. The drop height h is measured from the centre of the magnet to the centre of the coil.',
      'Start the logger and release the magnet so it falls straight through the coil. Read the size of the first peak e.m.f. E from the trace.',
      'Drop the magnet three times from each height and average the peaks, for heights from 10 cm to 80 cm.',
      'The speed at the coil is v = √(2gh) and E ∝ v. Plot E against √h (h in m): a straight line through the origin supports the model. The gradient divided by √(2g) gives the flux-linkage gradient K = E/v.',
    ],
    controlled: 'the same magnet, coil and pole leading; the magnet released from rest and falling along the axis.',
    model: { kind: 'simplified', summary: 'The magnet falls freely, reaching speed v = √(2gh) at the coil. The peak e.m.f. is E = Kv, where K is the largest rate of change of flux linkage with position (in Wb m⁻¹ or V s m⁻¹).',
      assumptions: ['Air resistance and the braking force of the induced current are ignored.', 'The change in speed as the magnet passes through the coil, and its length, are ignored, so h is measured to the centre of the coil.', 'K is 0.12–0.25 V s m⁻¹.', 'Each peak varies randomly by about 2 % because the magnet tilts and drifts off the axis.'] },
    hidden: (q) => ({ K: q('K', 0.12, 0.25) }),
    iv: { key: 'h', label: 'Drop height', symbol: 'h', unit: 'cm', min: 10, max: 80, step: 5, start: 10, instrument: 'metre_rule' },
    measures: [{ key: 'E', label: 'Peak e.m.f.', symbol: 'E', unit: 'V', resolution: 0.001, instrument: 'datalogger', read: (p, x, n) => p.K * Math.sqrt(2 * G * x / 100) * (1 + n(0.02)) }],
    repeats: 3,
    derived: [{ key: 'h_m', label: 'Drop height', symbol: 'h', unit: 'm', decimals: 2, value: (r) => r.h / 100 }],
    graph: { x: 'h_m', tx: 'sqrt', y: 'E', fit: 'origin' },
    results: [{ id: 'K', prompt: 'Flux-linkage gradient K = E / v', unit: 'V s m⁻¹', sig: 3, fromFit: (f) => f.m / Math.sqrt(2 * G), truth: (p) => p.K, tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'second', type: 'choice', prompt: 'The trace shows a second peak as the magnet leaves the coil. How does it compare with the first?', options: ['Opposite in sign and slightly larger, because the magnet is moving faster', 'Same sign and the same size', 'Opposite in sign and smaller, because the magnet has slowed down', 'There is no second peak'], correct: 0 },
      { id: 'area', type: 'text', prompt: 'Explain why the areas under the two peaks of the e.m.f.–time graph should be equal in size.' },
    ],
  }),

  definePractical({
    id: 'phys-al-15-3', collection: C('15.3'), topic: 'Eddy currents; electromagnetic damping',
    title: 'Planning: damping by eddy currents', summary: 'Plan and test an investigation into how the damping of a magnet pendulum swinging above copper plates depends on the total thickness of copper.',
    aim: 'To plan and carry out an investigation into how the thickness of a copper plate below a swinging magnet affects how quickly the oscillations die away.',
    durationMin: 60, difficulty: 'A Level', planning: true,
    apparatus: ['bar_magnet', 'string', 'stand_clamp', 'copper_plate', 'micrometer', 'stopwatch', 'metre_rule'],
    safety: ['Clamp the stand firmly so it cannot topple, and keep the swing small so the magnet cannot hit the plates hard.', 'Copper sheets can have sharp edges: handle them by the faces.'],
    procedure: [
      'Measure the thickness d₁ of one copper sheet with the micrometer, at several places, and take the mean.',
      'Hang the magnet as a pendulum from the clamp so it swings just above the bench, with a metre rule fixed behind it to read the amplitude.',
      'With no copper, pull the magnet aside to an amplitude of 10 cm, release it and time how long the amplitude takes to fall to 5 cm (the halving time t½).',
      'Place a stack of n copper sheets under the magnet, keeping the gap between magnet and top sheet the same, and repeat. Time each stack three times.',
      'Repeat for 0 to 8 sheets. Calculate the total thickness d = n d₁.',
      'The model predicts 1/t½ = 1/t₀ + βd. Plot 1/t½ against d; a straight line supports the model and the gradient is β.',
    ],
    controlled: 'the same magnet, string length, starting amplitude and gap above the top sheet; the stack lined up under the lowest point of the swing.',
    model: { kind: 'simplified', summary: 'The amplitude decays exponentially. Air resistance and eddy currents each remove energy at a rate proportional to the speed squared; for thin plates the eddy-current loss is proportional to the copper thickness, so the decay rate 1/t½ = 1/t₀ + βd.',
      assumptions: ['The sheets are thin compared with the skin depth at the swing frequency, so eddy currents in each sheet simply add; lower sheets are actually further from the magnet and contribute a little less.', 'Air damping alone gives a halving time t₀ of 30–50 s; β is 0.020–0.035 s⁻¹ mm⁻¹.', 'Judging when the amplitude reaches half gives a timing error of about ±0.1 s plus 3 % of the time.', 'Each sheet is 0.9–1.1 mm thick.'] },
    hidden: (q) => ({ t0: q('t0', 30, 50), beta: q('beta', 0.020, 0.035), d1: q('d1', 0.90, 1.10) }),
    constants: [{ key: 'd1', label: 'Thickness of one sheet', symbol: 'd₁', unit: 'mm', resolution: 0.01, instrument: 'micrometer', read: (p, n) => p.d1 + n(0.004) }],
    iv: { key: 'n', label: 'Number of copper sheets', symbol: 'n', unit: '', min: 0, max: 8, step: 1, start: 0, instrument: 'copper_plate' },
    measures: [{ key: 't', label: 'Time for amplitude to halve', symbol: 't½', unit: 's', resolution: 0.01, instrument: 'stopwatch',
      read: (p, x, n) => 1 / (1 / p.t0 + p.beta * x * p.d1) * (1 + n(0.03)) + n(0.1) }],
    repeats: 3,
    derived: [{ key: 'd', label: 'Total copper thickness', symbol: 'd', unit: 'mm', decimals: 2, value: (r, c) => r.n * c.d1 }],
    graph: { x: 'd', y: 't', ty: 'reciprocal', fit: 'line' },
    results: [{ id: 'beta', prompt: 'Increase in decay rate per mm of copper, β', unit: 's⁻¹ mm⁻¹', sig: 3, fromFit: (f) => f.m, truth: (p) => p.beta, tolTrue: { rel: 0.08 } }],
    questions: [
      { id: 'slots', type: 'choice', prompt: 'The plates are replaced by plates of the same thickness with many narrow slots cut across them. What happens to the damping?', options: ['It decreases, because the slots break the paths of the eddy currents', 'It increases, because the slots add more edges', 'It stays the same, because the thickness is unchanged', 'The magnet sticks to the plates'], correct: 0 },
      { id: 'energy', type: 'text', prompt: 'Explain where the energy of the pendulum goes when it is damped by the copper.' },
    ],
  }),

  definePractical({
    id: 'phys-al-15-4', collection: C('15.4'), topic: 'Transformers; flux linkage',
    title: 'Planning: the iron core of a transformer', summary: 'Plan and test an investigation into how the output voltage of a simple transformer depends on the number of secondary turns, with and without an iron core.',
    aim: 'To plan and carry out an investigation into the effect of the iron core on the output of a transformer, by measuring the secondary voltage for different numbers of secondary turns with and without the core.',
    durationMin: 60, difficulty: 'A Level', planning: true,
    apparatus: ['transformer_kit', 'iron_core', 'ac_supply', 'voltmeter', 'multimeter', 'switch', 'leads'],
    safety: ['Use the low-voltage a.c. supply only; never connect a home-made transformer to the mains.', 'Without the core the primary draws a larger current and warms up: switch on only while reading.', 'The laminated core is heavy: assemble it on the bench and keep fingers clear when closing the yoke.'],
    procedure: [
      'Fit the 120-turn primary coil from the kit on one limb of the C-core and connect it to the a.c. supply through a switch. Measure the primary voltage Vₚ with the voltmeter.',
      'Wind N_s turns of insulated wire on the other limb to make the secondary, and connect it to the multimeter on its a.c. voltage range.',
      'Close the switch, record the secondary voltage V_s, then open the switch.',
      'Change the number of secondary turns from 10 to 80 and repeat.',
      'Remove the core (or leave only the coils on a non-magnetic former in the same positions) and repeat the whole set of readings.',
      'Plot V_s against N_s for both cases on the same axes. The gradient is kVₚ/Nₚ, so find the fraction k of the primary flux that links the secondary in each case.',
    ],
    controlled: 'the same primary coil, supply voltage and frequency, and the same positions of the coils; the secondary not connected to any load.',
    model: { kind: 'simplified', summary: 'Each secondary turn links a fraction k of the flux per primary turn, so V_s = kVₚN_s/Nₚ. With a closed iron core k is close to 1; in air most of the flux spreads out and k is small.',
      assumptions: ['Resistance of the coils, core losses and the effect of the voltmeter are ignored.', 'The primary voltage stays the same when the core is removed (in practice the primary current rises).', 'k is 0.88–0.96 with the core and 0.06–0.12 without; Vₚ is 1.8–2.2 V.', 'The multimeter reading has a random error of about ±1 mV plus 1 %.'] },
    hidden: (q) => ({ Vp: q('Vp', 1.8, 2.2), kc: q('kc', 0.88, 0.96), ka: q('ka', 0.06, 0.12) }),
    // Two separate circuits: the primary on the a.c. supply, and the
    // secondary coil with the multimeter across it. Coupling by flux is not
    // resistive, so there are no values and a wrongly wired meter reads 0.
    circuit: {
      parts: [
        { id: 'PS', type: 'supply', apparatus: 'ac_supply', label: 'A.c. supply' },
        { id: 'S1', type: 'switch', apparatus: 'switch', label: 'Switch' },
        { id: 'XP', type: 'resistor', apparatus: 'transformer_kit', label: 'Primary coil' },
        { id: 'XS', type: 'resistor', apparatus: 'transformer_kit', label: 'Secondary coil' },
        { id: 'V1', type: 'voltmeter', apparatus: 'voltmeter', label: 'Voltmeter' },
        { id: 'V2', type: 'voltmeter', apparatus: 'multimeter', label: 'Multimeter' },
      ],
      checks: [{ meter: 'V1', across: 'XP' }, { meter: 'V2', across: 'XS' }],
      correct: [['PS.+', 'S1.a'], ['S1.b', 'XP.a'], ['XP.b', 'PS.-'], ['V1.+', 'XP.a'], ['V1.-', 'XP.b'], ['V2.+', 'XS.a'], ['V2.-', 'XS.b']],
    },
    settings: [{ key: 'core', label: 'Core', options: [{ value: 'core', label: 'Iron core in place' }, { value: 'air', label: 'No core (air)' }], default: 'core' }],
    constants: [{ key: 'Vp', label: 'Primary voltage (r.m.s.)', symbol: 'Vₚ', unit: 'V', resolution: 0.01, instrument: 'voltmeter', read: (p, n) => p.Vp + n(0.005) }],
    iv: { key: 'Ns', label: 'Number of secondary turns', symbol: 'N_s', unit: '', min: 10, max: 80, step: 5, start: 10, instrument: 'transformer_kit' },
    measures: [{ key: 'Vs', label: 'Secondary voltage (r.m.s.)', symbol: 'V_s', unit: 'V', resolution: 0.001, instrument: 'multimeter',
      read: (p, x, n, s) => p.Vp * (s.core === 'air' ? p.ka : p.kc) * x / NP * (1 + n(0.01)) + n(0.001) }],
    graph: { x: 'Ns', y: 'Vs', fit: 'origin', seriesBy: 'core' },
    results: [
      { id: 'kc', prompt: 'Fraction of flux linked with the iron core', unit: '', sig: 3, series: 'core', fromFit: (f, c) => f.m * NP / c.Vp, truth: (p) => p.kc, tolTrue: { rel: 0.05 } },
      { id: 'ka', prompt: 'Fraction of flux linked without the core', unit: '', sig: 3, series: 'air', fromFit: (f, c) => f.m * NP / c.Vp, truth: (p) => p.ka, tolTrue: { rel: 0.10 } },
    ],
    questions: [
      { id: 'why', type: 'choice', prompt: 'Why does the iron core increase the secondary voltage so much?', options: ['Iron guides the magnetic flux so that almost all of it links the secondary', 'Iron conducts the current from the primary to the secondary', 'Iron stores charge like a capacitor', 'Iron increases the frequency of the supply'], correct: 0 },
      { id: 'lamin', type: 'text', prompt: 'Explain why real transformer cores are laminated, and what would happen to a solid core.' },
    ],
  }),

  definePractical({
    id: 'phys-al-15-5', collection: C('15.5'), topic: 'Rectification and smoothing',
    title: 'Ripple voltage of a smoothed rectifier', summary: 'Measure the ripple on the output of a half-wave rectifier with a smoothing capacitor for different load resistances, and find the capacitance.',
    aim: 'To investigate how the ripple voltage of a half-wave rectifier with a smoothing capacitor depends on the load resistance, and to determine the capacitance of the capacitor.',
    durationMin: 45, difficulty: 'A Level',
    apparatus: ['ac_supply', 'diodes', 'capacitor', 'resistors', 'oscilloscope', 'switch', 'leads'],
    safety: ['Connect the electrolytic capacitor the right way round (positive to the diode cathode side); reversed, it can overheat and burst. Wear eye protection.', 'Use the 12 V a.c. low-voltage supply only, and discharge the capacitor through a resistor before changing the circuit.'],
    procedure: [
      'Connect the a.c. supply (50 Hz, 12 V r.m.s.) to a diode in series with a load resistor R. Connect the capacitor across R.',
      'Connect the oscilloscope across R on d.c. coupling and measure the peak output voltage V₀.',
      'Switch the oscilloscope to a.c. coupling and a sensitive range, and measure the peak-to-peak ripple voltage ΔV.',
      'Change R in steps from 1000 Ω to 4000 Ω and measure ΔV for each.',
      'For small ripple ΔV ≈ V₀/(fRC). Plot ΔV against 1/R; the gradient is V₀/(fC). Calculate C.',
    ],
    controlled: 'the same capacitor, supply voltage and frequency (50 Hz), and diode.',
    model: { kind: 'quantitative', summary: 'The capacitor charges to the peak V₀, then discharges through R for about one period T = 1/f, so ΔV = V₀(1 − e^(−1/(fRC))) ≈ V₀/(fRC) when the ripple is small.',
      assumptions: ['The capacitor discharges for a whole period; it actually starts recharging slightly earlier.', 'The simulated ripple uses the exponential discharge, so the linear approximation overestimates C by up to about 3 % at the smallest R.', 'C is 330–680 μF and V₀ is 15–17 V.', 'The ripple is read to about ±5 mV and V₀ to about ±0.1 V on the oscilloscope.'] },
    hidden: (q) => ({ C: q('C', 330, 680), V0: q('V0', 15, 17) }),
    constants: [{ key: 'V0', label: 'Peak output voltage', symbol: 'V₀', unit: 'V', resolution: 0.1, instrument: 'oscilloscope', read: (p, n) => p.V0 + n(0.05) }],
    iv: { key: 'R', label: 'Load resistance', symbol: 'R', unit: 'Ω', min: 1000, max: 4000, step: 100, start: 1000, instrument: 'resistors' },
    measures: [{ key: 'dV', label: 'Ripple voltage (peak to peak)', symbol: 'ΔV', unit: 'V', resolution: 0.01, instrument: 'oscilloscope',
      read: (p, x, n) => p.V0 * (1 - Math.exp(-1 / (F_MAINS * x * p.C * 1e-6))) + n(0.005) }],
    graph: { x: 'R', tx: 'reciprocal', y: 'dV', fit: 'origin' },
    results: [{ id: 'C', prompt: 'Capacitance of the smoothing capacitor', unit: 'μF', sig: 3, fromFit: (f, c) => c.V0 / (F_MAINS * f.m) * 1e6, truth: (p) => p.C, tolTrue: { rel: 0.08 } }],
    questions: [
      { id: 'largerR', type: 'choice', prompt: 'Why is the ripple smaller when the load resistance is larger?', options: ['The time constant RC is longer, so the capacitor loses less charge in each cycle', 'A larger resistance makes the diode conduct for longer', 'A larger resistance increases the supply frequency', 'Less current flows through the diode, so the peak voltage is higher'], correct: 0 },
      { id: 'full', type: 'text', prompt: 'Explain how using full-wave rectification would change the ripple for the same R and C.' },
    ],
  }),
]
