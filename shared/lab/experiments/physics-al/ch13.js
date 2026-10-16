// AS & A Level Physics practicals, chapter 13: Coulomb's law, capacitance and electronics.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const LN2 = Math.LN2
const RV = 10e3 // kΩ: resistance of a digital voltmeter (10 MΩ)
const C = (code, chapter = 'Coulomb’s law, capacitance and electronics') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })
// A resistor in parallel with the voltmeter (both in kΩ).
const par = (R) => R * RV / (R + RV)

export default [
  definePractical({
    id: 'phys-al-13-1', collection: C('13.1'), topic: 'Capacitor discharge; time constant; planning',
    title: 'Planning how the time for the p.d. across a capacitor to halve varies with resistance',
    summary: 'Plan, then test, an investigation of the half-time of a discharging capacitor for different resistors, and use it to find the capacitance.',
    aim: 'To plan and carry out an investigation of how the time for the potential difference across a discharging capacitor to halve depends on the resistance it discharges through.',
    durationMin: 55, difficulty: 'A Level', planning: true,
    apparatus: ['capacitor', 'resistors', 'dc_supply', 'voltmeter', 'stopwatch', 'switch', 'leads'],
    safety: ['Connect the electrolytic capacitor the right way round and do not exceed its voltage rating: a reversed or overloaded electrolytic can burst.', 'Discharge the capacitor before handling the circuit.'],
    procedure: [
      'Plan your investigation first: decide your variables, method, analysis and safety precautions.',
      'Connect the capacitor to the 6 V supply through a two-way switch so that it can be charged and then discharged through the resistor R. Connect the voltmeter across the capacitor.',
      'Charge the capacitor until the voltmeter reads 6.00 V.',
      'Switch to discharge and start the stopwatch at the same moment. Stop it when the voltmeter reads 3.00 V. Record the half-time t½.',
      'Repeat twice more for the same resistor and find the mean.',
      'Repeat for resistors from 10 kΩ to 100 kΩ.',
      'Plot t½ against R. If t½ = RC ln 2 the graph is a straight line through the origin, and C = gradient / ln 2.',
    ],
    controlled: 'the same capacitor, the same starting p.d. of 6.00 V and the same final p.d. of 3.00 V.',
    model: { kind: 'quantitative', summary: 'The capacitor discharges exponentially, V = V₀ e^(−t/RC), so the time to halve is t½ = RC ln 2.',
      assumptions: ['The capacitor is marked 1000 µF; its true value lies between 900 and 1150 µF.', 'Each resistor is within 2 % of its marked value.', 'The voltmeter (10 MΩ) is in parallel with R, which shortens t½ by up to 1 %. Leakage of the capacitor is ignored.', 'Starting and stopping the stopwatch by hand gives a random error of about ±0.15 s.'] },
    hidden: (q) => ({ C: q('C', 900, 1150) }),
    iv: { key: 'R', label: 'Resistance', symbol: 'R', unit: 'kΩ', min: 10, max: 100, step: 10, start: 10, instrument: 'resistors' },
    measures: [{ key: 't', label: 'Time for p.d. to halve', symbol: 't½', unit: 's', resolution: 0.01, instrument: 'stopwatch',
      read: (p, x, n) => par(x * (1 + 0.02 * p.j('R' + x))) * 1e3 * p.C * 1e-6 * LN2 + n(0.15) }],
    repeats: 3,
    graph: { x: 'R', y: 't', fit: 'origin' },
    results: [{ id: 'C', prompt: 'Capacitance of the capacitor', unit: 'µF', sig: 3, fromFit: (f) => f.m / LN2 * 1000, truth: (p) => p.C, tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'double', type: 'choice', prompt: 'If t½ = RC ln 2, what happens to t½ when R is doubled?', options: ['It doubles', 'It halves', 'It increases by a factor of ln 2', 'It stays the same'], correct: 0 },
      { id: 'voltmeter', type: 'text', prompt: 'Explain why a voltmeter with a very high resistance should be used, and how a low-resistance voltmeter would affect your results.' },
    ],
  }),

  definePractical({
    id: 'phys-al-13-2', collection: C('13.2'), topic: 'Capacitor discharge; time constant',
    title: 'Capacitance of a capacitor from its discharge',
    summary: 'Discharge a capacitor through a resistor, record the p.d. against time and find the capacitance from a graph of ln V against t.',
    aim: 'To determine the capacitance of a capacitor in a d.c. circuit from the way it discharges through a known resistor.',
    durationMin: 45, difficulty: 'A Level',
    apparatus: ['capacitor', 'resistors', 'dc_supply', 'voltmeter', 'multimeter', 'stopwatch', 'switch', 'leads'],
    safety: ['Connect the electrolytic capacitor with the correct polarity and keep below its voltage rating.', 'Discharge the capacitor before dismantling the circuit.'],
    procedure: [
      'Measure the resistance R of the resistor with the multimeter on its resistance range.',
      'Connect the capacitor, marked 470 µF, so that a two-way switch charges it from the 6 V supply or discharges it through R. Connect the voltmeter across the capacitor.',
      'Charge the capacitor fully, then switch to discharge and start the stopwatch at the same moment.',
      'Record the voltmeter reading V every 10 s for about 100 s.',
      'Plot ln(V / V) against t. The graph is a straight line with gradient −1/RC.',
      'Calculate C from the gradient and your measured R, and compare it with the marked value.',
    ],
    controlled: 'the same resistor and capacitor, the capacitor fully charged at the start.',
    model: { kind: 'quantitative', summary: 'V = V₀ e^(−t/RC), so ln V = ln V₀ − t/RC, a straight line of gradient −1/RC.',
      assumptions: ['The capacitor is marked 470 µF ± 20 %; its true value lies between 400 and 540 µF.', 'The resistor is 100 kΩ ± 2 %, measured with the multimeter to ±0.2 kΩ.', 'The voltmeter (10 MΩ) in parallel with R lowers the time constant by about 1 %. Leakage is ignored.', 'Reading the meter at the right moment gives a timing error of about ±0.2 s; the supply gives 5.8–6.2 V.'] },
    hidden: (q) => ({ C: q('C', 400, 540), R: q('R', 98, 102), V0: q('V0', 5.8, 6.2) }),
    constants: [{ key: 'R', label: 'Resistance of resistor', symbol: 'R', unit: 'kΩ', resolution: 0.1, instrument: 'multimeter', read: (p, n) => p.R + n(0.15) }],
    iv: { key: 't', label: 'Time from start of discharge', symbol: 't', unit: 's', min: 0, max: 100, step: 5, start: 0, instrument: 'stopwatch', monotonic: true },
    measures: [{ key: 'V', label: 'P.d. across capacitor', symbol: 'V', unit: 'V', resolution: 0.01, instrument: 'voltmeter',
      read: (p, x, n) => p.V0 * Math.exp(-(x + n(0.2)) / (par(p.R) * 1e3 * p.C * 1e-6)) }],
    graph: { x: 't', y: 'V', ty: 'ln', fit: 'line' },
    results: [{ id: 'C', prompt: 'Capacitance of the capacitor', unit: 'µF', sig: 3, fromFit: (f, c) => -1000 / (f.m * c.R), truth: (p) => p.C, tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'lnV', type: 'choice', prompt: 'Why is ln V plotted against t, rather than V against t?', options: ['An exponential decay becomes a straight line, so the gradient gives −1/RC', 'It makes the readings more precise', 'It removes the effect of the voltmeter resistance', 'V against t would be a straight line through the origin'], correct: 0 },
      { id: 'tolerance', type: 'text', prompt: 'The capacitor is marked 470 µF ± 20 %. State whether your value is consistent with this marking, and explain your reasoning.' },
    ],
  }),

  definePractical({
    id: 'phys-al-13-3', collection: C('13.3'), topic: 'Capacitors in a.c. circuits; planning',
    title: 'Planning how the peak current in a capacitor circuit varies with frequency',
    summary: 'Plan, then test, an investigation of the peak current through a capacitor as the frequency of the supply changes, using an oscilloscope across a small resistor.',
    aim: 'To plan and carry out an investigation of how the peak current in a capacitor connected to an alternating supply depends on the supply frequency.',
    durationMin: 55, difficulty: 'A Level', planning: true,
    apparatus: ['signal_generator', 'capacitor', 'resistors', 'oscilloscope', 'multimeter', 'leads'],
    safety: ['Use only the low-voltage signal generator output; switch off before changing connections.', 'Check that the oscilloscope earth and the generator earth are connected to the same point in the circuit.'],
    procedure: [
      'Plan your investigation first: decide your variables, method, analysis and safety precautions.',
      'Measure the small resistor r (about 10 Ω) with the multimeter.',
      'Connect the signal generator, the capacitor (marked 1.0 µF) and r in series. Connect channel 1 of the oscilloscope across the generator output and channel 2 across r.',
      'Set the frequency to 100 Hz and adjust the amplitude until channel 1 shows a peak p.d. V₀ of about 2 V. Record V₀.',
      'Measure the peak p.d. V_r across r on channel 2; the peak current is I₀ = V_r / r.',
      'Increase the frequency in steps up to 1000 Hz, checking that V₀ stays the same at each step.',
      'Plot I₀ against f. If I₀ = 2πfCV₀ the graph is a straight line through the origin, and C = gradient / (2πV₀).',
    ],
    controlled: 'the same capacitor and resistor, the same peak supply p.d. V₀ at every frequency.',
    model: { kind: 'quantitative', summary: 'The circuit impedance is √(r² + X_C²) with X_C = 1/(2πfC). Because r is much smaller than X_C, I₀ ≈ V₀/X_C = 2πfCV₀.',
      assumptions: ['The capacitor is marked 1.0 µF; its true value is 0.90–1.10 µF.', 'r is 9.8–10.2 Ω; it reduces the current by less than 0.2 %.', 'The supply peak p.d. is held at 1.9–2.1 V and read on the oscilloscope to about ±0.02 V.', 'Reading the trace height gives a random error of about ±1.5 % in V_r.'] },
    hidden: (q) => ({ C: q('C', 0.90, 1.10), r: q('r', 9.8, 10.2), V0: q('V0', 1.9, 2.1) }),
    constants: [
      { key: 'r', label: 'Resistance of small resistor', symbol: 'r', unit: 'Ω', resolution: 0.1, instrument: 'multimeter', read: (p, n) => p.r + n(0.05) },
      { key: 'V0', label: 'Peak p.d. of supply', symbol: 'V₀', unit: 'V', resolution: 0.01, instrument: 'oscilloscope', read: (p, n) => p.V0 + n(0.015) },
    ],
    iv: { key: 'f', label: 'Frequency', symbol: 'f', unit: 'Hz', min: 100, max: 1000, step: 50, start: 100, instrument: 'signal_generator' },
    measures: [{ key: 'Vr', label: 'Peak p.d. across resistor', symbol: 'V_r', unit: 'mV', resolution: 0.1, instrument: 'oscilloscope', read: (p, x, n) => {
      const Xc = 1 / (2 * Math.PI * x * p.C * 1e-6)
      return p.V0 * (1 + 0.005 * p.j('V0' + x)) * p.r / Math.hypot(p.r, Xc) * 1000 * (1 + n(0.015))
    } }],
    derived: [{ key: 'I0', label: 'Peak current', symbol: 'I₀', unit: 'mA', decimals: 3, value: (r, c) => r.Vr / c.r }],
    graph: { x: 'f', y: 'I0', fit: 'origin' },
    results: [{ id: 'C', prompt: 'Capacitance of the capacitor', unit: 'µF', sig: 3, fromFit: (f, c) => f.m * 1e3 / (2 * Math.PI * c.V0), truth: (p) => p.C, tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'double', type: 'choice', prompt: 'According to I₀ = 2πfCV₀, what happens to the peak current when the frequency is doubled?', options: ['It doubles', 'It halves', 'It stays the same', 'It increases by a factor of four'], correct: 0 },
      { id: 'small_r', type: 'text', prompt: 'Explain why the resistor used to measure the current must have a resistance much smaller than the reactance of the capacitor.' },
    ],
  }),

  definePractical({
    id: 'phys-al-13-4', collection: C('13.4'), topic: 'Capacitors in a.c. circuits; reactance',
    title: 'Capacitance of a capacitor in an a.c. circuit',
    summary: 'Measure the r.m.s. current through a capacitor at different frequencies with a constant p.d., and find the capacitance from the gradient of I against f.',
    aim: 'To determine the capacitance of a capacitor from the current it passes at different frequencies of an alternating supply.',
    durationMin: 45, difficulty: 'A Level',
    apparatus: ['signal_generator', 'capacitor', 'voltmeter', 'multimeter', 'leads'],
    safety: ['Use only the low-voltage output of the signal generator, and switch off before changing connections.'],
    procedure: [
      'Connect the capacitor (marked 2.2 µF) in series with the multimeter on its a.c. milliamp range to the signal generator. Connect the voltmeter, on its a.c. range, across the capacitor.',
      'Set the frequency to 100 Hz and adjust the amplitude until the voltmeter reads 2.00 V r.m.s. Record this p.d. V.',
      'Record the r.m.s. current I.',
      'Increase the frequency in steps up to 1000 Hz. At each step readjust the amplitude so that V stays at 2.00 V before reading I.',
      'Plot I against f. The graph is a straight line through the origin of gradient 2πCV.',
      'Calculate C from the gradient.',
    ],
    controlled: 'the same capacitor, the r.m.s. p.d. across it held at the same value at every frequency.',
    model: { kind: 'quantitative', summary: 'The reactance X_C = 1/(2πfC), so with a constant r.m.s. p.d. V across the capacitor, I = V/X_C = 2πCV f.',
      assumptions: ['The capacitor is marked 2.2 µF; its true value is 2.0–2.4 µF.', 'The p.d. is held at its set value to within ±0.5 % at each frequency; both meters read true r.m.s. values over 100–1000 Hz.', 'The multimeter current reading has a random error of about ±0.8 %.', 'Capacitor losses are negligible.'] },
    hidden: (q) => ({ C: q('C', 2.0, 2.4), V: q('V', 1.995, 2.005) }),
    // An a.c. circuit, and the current is read in mA: no resistive values,
    // so a wrongly wired meter reads 0.
    circuit: {
      parts: [
        { id: 'SG', type: 'supply', apparatus: 'signal_generator', label: 'Signal generator' },
        { id: 'A1', type: 'ammeter', apparatus: 'multimeter', label: 'Multimeter' },
        { id: 'V1', type: 'voltmeter', apparatus: 'voltmeter', label: 'Voltmeter' },
        { id: 'X', type: 'resistor', apparatus: 'capacitor', label: 'Capacitor' },
      ],
      checks: [{ meter: 'A1', series: 'X' }, { meter: 'V1', across: 'X' }],
      correct: [['SG.+', 'A1.+'], ['A1.-', 'X.a'], ['X.b', 'SG.-'], ['V1.+', 'X.a'], ['V1.-', 'X.b']],
    },
    constants: [{ key: 'V', label: 'R.m.s. p.d. across capacitor (held constant)', symbol: 'V', unit: 'V', resolution: 0.01, instrument: 'voltmeter', read: (p) => p.V }],
    iv: { key: 'f', label: 'Frequency', symbol: 'f', unit: 'Hz', min: 100, max: 1000, step: 50, start: 100, instrument: 'signal_generator' },
    measures: [{ key: 'I', label: 'R.m.s. current', symbol: 'I', unit: 'mA', resolution: 0.01, instrument: 'multimeter',
      read: (p, x, n) => 2 * Math.PI * x * p.C * 1e-6 * p.V * (1 + 0.005 * p.j('V' + x)) * 1000 * (1 + n(0.008)) }],
    graph: { x: 'f', y: 'I', fit: 'origin' },
    results: [{ id: 'C', prompt: 'Capacitance of the capacitor', unit: 'µF', sig: 3, fromFit: (f, c) => f.m * 1e3 / (2 * Math.PI * c.V), truth: (p) => p.C, tolTrue: { rel: 0.05 } }],
    questions: [
      { id: 'reactance', type: 'choice', prompt: 'How does the reactance of the capacitor change as the frequency increases?', options: ['It decreases, in inverse proportion to f', 'It increases, in proportion to f', 'It stays the same', 'It decreases, in proportion to f²'], correct: 0 },
      { id: 'hold', type: 'text', prompt: 'Explain why the amplitude of the signal generator had to be readjusted at each frequency.' },
    ],
  }),

  definePractical({
    id: 'phys-al-13-5', collection: C('13.5'), topic: 'Thermistors; sensing; planning',
    title: 'Planning how the resistance of a thermistor varies with temperature',
    summary: 'Plan, then test, an investigation of the resistance of an NTC thermistor in a water bath, and find its B constant from a graph of ln R against 1/T.',
    aim: 'To plan and carry out an investigation of how the resistance of a thermistor depends on its temperature.',
    durationMin: 55, difficulty: 'A Level', planning: true,
    apparatus: ['thermistor', 'multimeter', 'thermometer', 'water_bath', 'beaker_250', 'stand_clamp', 'leads'],
    safety: ['The water bath reaches 80 °C: handle hot beakers with care and keep the bath away from the bench edge.', 'Keep the multimeter dry and away from the water; use a thermistor with insulated, waterproofed leads.'],
    procedure: [
      'Plan your investigation first: decide your variables, method, analysis and safety precautions.',
      'Clamp the thermistor in a beaker of water in the water bath, with the thermometer bulb right beside it. Connect the thermistor to the multimeter on a resistance range.',
      'Set the bath to about 20 °C, stir, and wait until both readings are steady. Record θ and R.',
      'Raise the temperature in steps of about 10 °C up to 80 °C, recording θ and R each time.',
      'Convert θ to the thermodynamic temperature T = θ + 273.15.',
      'Plot ln(R / kΩ) against 1/T. If R = R₂₅ e^(B(1/T − 1/298)), the graph is a straight line of gradient B.',
      'Use the line to find B and the resistance at 25 °C.',
    ],
    controlled: 'the same thermistor, readings only when the temperature is steady, the multimeter on the same range.',
    model: { kind: 'quantitative', summary: 'An NTC thermistor follows the B-parameter equation R = R₂₅ exp(B(1/T − 1/298.15 K)), so ln R is a linear function of 1/T.',
      assumptions: ['R₂₅ is 9.5–10.5 kΩ and B is 3400–4000 K; the B equation is accurate to better than 1 % over 20–80 °C.', 'Self-heating by the multimeter current is negligible.', 'The thermistor and thermometer may differ by up to 0.3 K; the thermometer is read to 0.5 °C.', 'The multimeter reading has a random error of about ±0.5 %.'] },
    hidden: (q) => ({ R25: q('R25', 9.5, 10.5), B: q('B', 3400, 4000) }),
    iv: { key: 'set', label: 'Water bath setting', symbol: 'θ_set', unit: '°C', min: 20, max: 80, step: 5, start: 20, instrument: 'water_bath' },
    measures: [
      { key: 'th', label: 'Temperature', symbol: 'θ', unit: '°C', resolution: 0.5, instrument: 'thermometer', read: (p, x, n) => x + 0.8 * p.j('bath' + x) + n(0.1) },
      { key: 'R', label: 'Resistance of thermistor', symbol: 'R', unit: 'kΩ', resolution: 0.01, instrument: 'multimeter', read: (p, x, n) => {
        const T = x + 0.8 * p.j('bath' + x) + 0.3 * p.j('lag' + x) + 273.15
        return p.R25 * Math.exp(p.B * (1 / T - 1 / 298.15)) * (1 + n(0.005))
      } },
    ],
    derived: [{ key: 'T', label: 'Thermodynamic temperature', symbol: 'T', unit: 'K', decimals: 2, value: (r) => r.th + 273.15 }],
    graph: { x: 'T', tx: 'reciprocal', y: 'R', ty: 'ln', fit: 'line' },
    results: [
      { id: 'B', prompt: 'B constant of the thermistor', unit: 'K', sig: 3, fromFit: (f) => f.m, truth: (p) => p.B, tolTrue: { rel: 0.06 } },
      { id: 'R25', prompt: 'Resistance of the thermistor at 25 °C', unit: 'kΩ', sig: 3, fromFit: (f) => Math.exp(f.m / 298.15 + f.c), truth: (p) => p.R25, tolTrue: { rel: 0.05 } },
    ],
    questions: [
      { id: 'ntc', type: 'choice', prompt: 'How does the resistance of an NTC thermistor change as its temperature rises?', options: ['It decreases, because more charge carriers are released', 'It increases, because the lattice vibrates more', 'It stays constant', 'It increases, because fewer charge carriers are available'], correct: 0 },
      { id: 'kelvin', type: 'text', prompt: 'Explain why the temperature must be converted to kelvin before plotting the graph.' },
    ],
  }),

  definePractical({
    id: 'phys-al-13-6', collection: C('13.6'), topic: 'Operational amplifiers; non-inverting amplifier',
    title: 'Investigation into a non-inverting amplifier',
    summary: 'Measure the output of a non-inverting op-amp amplifier for a range of input voltages, find its gain and deduce the value of the feedback resistor.',
    aim: 'To determine the voltage gain of a non-inverting amplifier and use it to find the resistance of an unknown feedback resistor.',
    durationMin: 45, difficulty: 'A Level',
    apparatus: ['op_amp_board', 'dc_supply', 'rheostat', 'voltmeter', 'multimeter', 'leads'],
    safety: ['Use the ±9 V supply only, connected with the correct polarity to the op-amp board; a reversed supply can make the chip overheat.', 'Switch off before changing any connection.'],
    procedure: [
      'Measure the resistance R₁ of the resistor between the inverting input and 0 V with the multimeter, with the board disconnected from the supply.',
      'Connect the ±9 V supply to the op-amp board. Connect a rheostat as a potential divider across the 0 V and +1.5 V terminals to supply the non-inverting input.',
      'Connect the voltmeter between the non-inverting input and 0 V, and the multimeter (d.c. volts) between the output and 0 V.',
      'Set the input p.d. to about 0.10 V and record V_in and V_out.',
      'Increase V_in in steps up to about 1.2 V, recording both p.d.s each time.',
      'Plot V_out against V_in. The gradient is the gain G = 1 + R_f / R₁. Use it to find R_f.',
    ],
    controlled: 'the same op-amp board and supply voltages; the output not loaded by anything except the multimeter.',
    model: { kind: 'quantitative', summary: 'An ideal op-amp with negative feedback keeps its two inputs at the same p.d., so V_out = (1 + R_f/R₁) V_in until the output saturates about 1 V below the supply rails.',
      assumptions: ['The op-amp has a very large open-loop gain and an input offset of up to ±2 mV, which shifts the line slightly from the origin.', 'R₁ is 9.9–10.1 kΩ; R_f is between 22 and 47 kΩ.', 'With a ±9 V supply the output saturates at about ±7.8 V; over this input range it stays below saturation.', 'Each meter reading has a random error of about ±0.005 V.'] },
    hidden: (q) => ({ R1: q('R1', 9.9, 10.1), Rf: q('Rf', 22, 47), off: q('off', -0.002, 0.002), sat: q('sat', 7.6, 8.0) }),
    constants: [{ key: 'R1', label: 'Resistance R₁', symbol: 'R₁', unit: 'kΩ', resolution: 0.01, instrument: 'multimeter', read: (p, n) => p.R1 + n(0.01) }],
    iv: { key: 'set', label: 'Input setting', symbol: 'V_set', unit: 'V', min: 0.1, max: 1.2, step: 0.05, start: 0.1, instrument: 'rheostat' },
    measures: [
      { key: 'Vin', label: 'Input p.d.', symbol: 'V_in', unit: 'V', resolution: 0.001, instrument: 'voltmeter', read: (p, x, n) => x * (1 + 0.02 * p.j('in' + x)) + n(0.001) },
      { key: 'Vout', label: 'Output p.d.', symbol: 'V_out', unit: 'V', resolution: 0.01, instrument: 'multimeter', read: (p, x, n) => {
        const v = (x * (1 + 0.02 * p.j('in' + x)) + p.off) * (1 + p.Rf / p.R1)
        return Math.min(p.sat, v) + n(0.005)
      } },
    ],
    graph: { x: 'Vin', y: 'Vout', fit: 'line' },
    results: [
      { id: 'G', prompt: 'Voltage gain of the amplifier', unit: '', sig: 3, fromFit: (f) => f.m, truth: (p) => 1 + p.Rf / p.R1, tolTrue: { rel: 0.04 } },
      { id: 'Rf', prompt: 'Resistance of the feedback resistor R_f', unit: 'kΩ', sig: 3, fromFit: (f, c) => (f.m - 1) * c.R1, truth: (p) => p.Rf, tolTrue: { rel: 0.05 } },
    ],
    questions: [
      { id: 'saturate', type: 'choice', prompt: 'If V_in were increased to 3.0 V, what would the output p.d. be closest to?', options: ['About +8 V, just below the positive supply, because the output saturates', 'G × 3.0 V, as the gain stays the same', '0 V, because the op-amp switches off', 'About −8 V, because the output reverses'], correct: 0 },
      { id: 'feedback', type: 'text', prompt: 'Explain how negative feedback makes the gain depend only on the two resistors and not on the op-amp itself.' },
    ],
  }),
]
