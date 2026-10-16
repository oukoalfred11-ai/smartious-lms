// AS & A Level Physics practicals, chapter 12: thermal physics and ideal gases.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const R_GAS = 8.31
const L_WATER = 2257 // J g⁻¹ (= kJ kg⁻¹) at 100 °C
const C = (code, chapter = 'Thermal physics and ideal gases') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })

// Straight-line fit of y against x for a list of points (used where a result
// combines two lines, so a single graph fit is not enough).
function slopeOf(pts) {
  const n = pts.length
  if (n < 2) return NaN
  let sx = 0, sy = 0, sxx = 0, sxy = 0
  for (const { x, y } of pts) { sx += x; sy += y; sxx += x * x; sxy += x * y }
  const den = n * sxx - sx * sx
  return den === 0 ? NaN : (n * sxy - sx * sy) / den
}
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN)

// 12.4: the rate of mass loss and the mean power for one heater setting.
function runOf(groups, setting) {
  const gs = groups.filter(g => String(g.settings.power) === setting && Number.isFinite(g.row.M))
  return {
    rate: -slopeOf(gs.map(g => ({ x: g.x, y: g.row.M }))),
    P: avg(gs.map(g => g.row.V * g.row.I).filter(Number.isFinite)),
  }
}
// Heater settings for 12.4: nominal supply voltage across a heater of resistance Rh.
const POWER_V = { low: 8, high: 12 }

export default [
  definePractical({
    id: 'phys-al-12-1', collection: C('12.1'), topic: 'Temperature scales; thermocouples',
    title: 'The thermocouple', summary: 'Measure the e.m.f. of a thermocouple for different temperature differences between its junctions and find its sensitivity.',
    aim: 'To investigate how the e.m.f. of a thermocouple depends on the temperature difference between its junctions, and to determine its sensitivity.',
    durationMin: 45, difficulty: 'A Level',
    apparatus: ['thermocouple', 'millivoltmeter', 'thermometer', 'water_bath', 'ice', 'beaker_250', 'leads'],
    safety: ['The water bath can reach 90 °C: handle the beaker and probes with care and keep the bath away from the bench edge.', 'Keep the water and the millivoltmeter apart, and wipe up spills at once.'],
    procedure: [
      'Fill the beaker with crushed ice and a little water. Put one junction of the thermocouple in it with the thermometer, wait, and record the temperature θ₀ of the cold junction.',
      'Connect the two free ends of the thermocouple wires to the millivoltmeter.',
      'Put the other junction in the water bath next to the bulb of the thermometer, both at the same depth.',
      'Set the bath to about 20 °C, stir and wait until the readings are steady. Record the bath temperature θ and the e.m.f. E.',
      'Raise the bath temperature in steps up to about 90 °C, recording θ and E at each step. Keep ice in the cold beaker throughout.',
      'Calculate the temperature difference Δθ = θ − θ₀ and plot E against Δθ.',
      'The gradient of the best-fit line is the sensitivity of the thermocouple over this range. Convert it to µV K⁻¹.',
    ],
    controlled: 'the same pair of junctions, the cold junction kept in melting ice, readings taken only when steady.',
    model: { kind: 'quantitative', summary: 'A copper–constantan thermocouple has E = aΔθ + bΔθ², where a is about 39 µV K⁻¹ and b about 0.04 µV K⁻². Over 20–90 K the graph is close to a straight line; its gradient is near the mean sensitivity E(100 K)/100 K = a + 100b.',
      assumptions: ['The small quadratic term makes the sensitivity rise by about 15 % from 0 to 100 °C, so the graph curves slightly upwards.', 'The cold junction stays at the measured ice temperature (0.0–0.4 °C).', 'The hot junction and the thermometer bulb may differ by up to 0.3 K; the thermometer is read to the nearest 0.5 °C.', 'The millivoltmeter has a random error of about ±0.005 mV and draws no current.'] },
    hidden: (q) => ({ a: q('a', 38.0, 41.0), b: q('b', 0.035, 0.048), th0: q('th0', 0.0, 0.4) }),
    constants: [{ key: 'th0', label: 'Temperature of cold junction', symbol: 'θ₀', unit: '°C', resolution: 0.5, instrument: 'thermometer', read: (p, n) => p.th0 + n(0.1) }],
    iv: { key: 'set', label: 'Water bath setting', symbol: 'θ_set', unit: '°C', min: 20, max: 90, step: 5, start: 20, instrument: 'water_bath' },
    measures: [
      { key: 'th', label: 'Bath temperature', symbol: 'θ', unit: '°C', resolution: 0.5, instrument: 'thermometer', read: (p, x, n) => x + 0.8 * p.j('bath' + x) + n(0.1) },
      { key: 'E', label: 'Thermocouple e.m.f.', symbol: 'E', unit: 'mV', resolution: 0.01, instrument: 'millivoltmeter', read: (p, x, n) => {
        const d = x + 0.8 * p.j('bath' + x) + 0.3 * p.j('probe' + x) - p.th0
        return (p.a * d + p.b * d * d) / 1000 + n(0.005)
      } },
    ],
    derived: [{ key: 'dth', label: 'Temperature difference', symbol: 'Δθ', unit: 'K', decimals: 1, value: (r, c) => r.th - c.th0 }],
    graph: { x: 'dth', y: 'E', fit: 'line' },
    results: [{ id: 'S', prompt: 'Sensitivity of the thermocouple', unit: 'µV K⁻¹', sig: 3, fromFit: (f) => f.m * 1000, truth: (p) => p.a + 100 * p.b, tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'cold', type: 'choice', prompt: 'Why is the cold junction kept in melting ice?', options: ['It gives a fixed, known reference temperature', 'It makes the thermocouple wires conduct better', 'It stops the millivoltmeter from heating up', 'It makes the e.m.f. independent of the hot junction'], correct: 0 },
      { id: 'curve', type: 'text', prompt: 'Look closely at your graph. Describe any curvature and explain what it tells you about the sensitivity at higher temperatures.' },
    ],
  }),

  definePractical({
    id: 'phys-al-12-2', collection: C('12.2'), topic: 'Ideal gases; Boyle’s law',
    title: 'Boyle’s law', summary: 'Compress a column of air trapped above oil, measure its volume at different pressures and find the amount of gas.',
    aim: 'To show that the volume of a fixed mass of gas at constant temperature is inversely proportional to its pressure, and to find the amount of gas trapped.',
    durationMin: 40, difficulty: 'A Level',
    apparatus: ['boyle_apparatus', 'pressure_gauge', 'thermometer', 'metre_rule'],
    safety: ['Wear eye protection: the glass tube is under pressure. Do not pump beyond the top of the gauge scale.', 'Release the pressure slowly at the end so the oil does not spurt out of the valve.'],
    procedure: [
      'Record the room temperature θ beside the apparatus and the internal diameter d of the tube given on the apparatus label.',
      'With the valve open, the gauge reads about atmospheric pressure. Close the valve.',
      'Use the pump to raise the pressure in steps of about 20 kPa. After each step wait about a minute for the air to return to room temperature.',
      'At each step record the gauge reading p and the length L of the air column, reading the bottom of the oil meniscus at eye level.',
      'Continue up to about 300 kPa, then release the pressure slowly.',
      'Calculate the volume V = πd²L/4 and plot V against 1/p.',
      'The gradient of the line is nRT. Use the room temperature in kelvin to find the amount n of trapped air.',
    ],
    controlled: 'the same trapped air (no leaks), at room temperature; wait after each pressure change.',
    model: { kind: 'quantitative', summary: 'The trapped air is an ideal gas at constant temperature, so pV = nRT and V is proportional to 1/p.',
      assumptions: ['The gauge reads absolute pressure, with a zero error of up to ±1.5 kPa and a reading error of about ±1 kPa.', 'The tube is a uniform cylinder and the air column length is read to about ±0.1 cm.', 'The air temperature stays at room temperature (18–25 °C) once settled.', 'There is no leakage and the oil vapour pressure is negligible.'] },
    hidden: (q) => ({ d: q('d', 0.95, 1.05), L0: q('L0', 26, 32), tc: q('tc', 18, 25) }),
    constants: [
      { key: 'd', label: 'Internal diameter of tube (from the label)', symbol: 'd', unit: 'cm', resolution: 0.01, instrument: 'boyle_apparatus', read: (p) => p.d },
      { key: 'T', label: 'Room temperature', symbol: 'θ', unit: '°C', resolution: 0.5, instrument: 'thermometer', read: (p, n) => p.tc + n(0.15) },
    ],
    iv: { key: 'pset', label: 'Pressure pumped to (approximate)', symbol: 'p_set', unit: 'kPa', min: 100, max: 300, step: 10, start: 100, instrument: 'boyle_apparatus' },
    measures: [
      { key: 'p', label: 'Gauge reading', symbol: 'p', unit: 'kPa', resolution: 1, instrument: 'pressure_gauge', read: (p, x, n) => x + 3 * p.j('p' + x) + 1.5 * p.j('zero') + n(0.8) },
      { key: 'L', label: 'Length of air column', symbol: 'L', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, x, n) => p.L0 * 101 / (x + 3 * p.j('p' + x)) + n(0.06) },
    ],
    derived: [
      { key: 'V', label: 'Volume of air', symbol: 'V', unit: 'cm³', decimals: 2, value: (r, c) => Math.PI * c.d * c.d / 4 * r.L },
      { key: 'pV', label: 'Product pV', symbol: 'pV', unit: 'kPa cm³', decimals: 0, value: (r, c) => r.p * Math.PI * c.d * c.d / 4 * r.L },
    ],
    graph: { x: 'p', tx: 'reciprocal', y: 'V', fit: 'line' },
    results: [{ id: 'n', prompt: 'Amount of air trapped', unit: 'mol', sig: 3,
      fromFit: (f, c) => f.m * 1e-3 / (R_GAS * (c.T + 273.15)),
      truth: (p) => (101e3 * Math.PI * p.d * p.d / 4 * p.L0 * 1e-6) / (R_GAS * (p.tc + 273.15)), tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'origin', type: 'choice', prompt: 'If the air obeys Boyle’s law and the gauge has no zero error, the graph of V against 1/p should be:', options: ['a straight line through the origin', 'a straight line with a positive intercept on the V axis', 'a curve that levels off', 'a horizontal line'], correct: 0 },
      { id: 'wait', type: 'text', prompt: 'Explain why you should wait for a minute after each change of pressure before reading the volume.' },
    ],
  }),

  definePractical({
    id: 'phys-al-12-3', collection: C('12.3'), topic: 'Specific latent heat; planning',
    title: 'Planning an investigation into the specific latent heat of vaporisation of water',
    summary: 'Plan, then test, a method that uses several heater powers and the rate of mass loss of boiling water to find the specific latent heat and allow for heat loss.',
    aim: 'To plan and carry out an investigation of how the rate at which water boils away depends on the heater power, and to determine the specific latent heat of vaporisation of water.',
    durationMin: 60, difficulty: 'A Level', planning: true,
    apparatus: ['immersion_heater', 'beaker_250', 'top_pan_balance', 'dc_supply', 'voltmeter', 'ammeter', 'stopwatch', 'leads'],
    safety: ['Boiling water and steam scald: keep hands and faces away from the beaker mouth and never touch the heater when it is on.', 'Keep the heater covered by water whenever it is switched on, and switch it off before topping up.', 'Stand the beaker on a heat-resistant mat on the balance pan, away from the bench edge.'],
    procedure: [
      'Plan your investigation first: decide your variables, method, analysis and safety precautions.',
      'Put the beaker of water on the balance with the immersion heater held in it by a clamp, so the heater is not supported by the beaker.',
      'Connect the heater to the supply with the ammeter in series and the voltmeter across it. Bring the water to the boil.',
      'With the water boiling steadily, set the supply voltage. Record V and I, then record the mass of water boiled away in 300 s.',
      'Repeat for several supply voltages, topping up with boiling water between runs.',
      'Calculate the power P = VI and the rate of mass loss m/t. Plot P against m/t.',
      'The gradient is the specific latent heat L; the intercept on the P axis is the rate of heat loss to the surroundings.',
    ],
    controlled: 'water kept boiling throughout, the same beaker and depth of water, the same timing interval.',
    model: { kind: 'quantitative', summary: 'At boiling point P = L (m/t) + h, where h is the rate of heat loss from the beaker, which is the same at every power because the water is always at 100 °C.',
      assumptions: ['The heat loss h is between 6 and 14 W and does not depend on the heater power.', 'L = 2257 J g⁻¹ at 100 °C.', 'Splashing and condensation give a random error of about ±0.06 g in each mass loss; meters read to ±0.01.', 'The heater resistance (2.7–3.1 Ω hot) stays constant during a run.'] },
    hidden: (q) => ({ h: q('h', 6, 14), Rh: q('Rh', 2.7, 3.1) }),
    constants: [{ key: 't', label: 'Time for each run', symbol: 't', unit: 's', resolution: 1, instrument: 'stopwatch', read: () => 300 }],
    iv: { key: 'Vs', label: 'Supply voltage setting', symbol: 'V_s', unit: 'V', min: 7, max: 14, step: 0.5, start: 7, instrument: 'dc_supply' },
    measures: [
      { key: 'V', label: 'Heater p.d.', symbol: 'V', unit: 'V', resolution: 0.01, instrument: 'voltmeter', read: (p, x, n) => x * (1 + 0.01 * p.j('V' + x)) + n(0.01) },
      { key: 'I', label: 'Heater current', symbol: 'I', unit: 'A', resolution: 0.01, instrument: 'ammeter', read: (p, x, n) => x * (1 + 0.01 * p.j('V' + x)) / p.Rh + n(0.01) },
      { key: 'm', label: 'Mass boiled away in 300 s', symbol: 'm', unit: 'g', resolution: 0.01, instrument: 'top_pan_balance', read: (p, x, n) => {
        const V = x * (1 + 0.01 * p.j('V' + x))
        return Math.max(0, (V * V / p.Rh - p.h) * 300 / L_WATER + n(0.06))
      } },
    ],
    derived: [
      { key: 'P', label: 'Heater power', symbol: 'P', unit: 'W', decimals: 1, value: (r) => r.V * r.I },
      { key: 'rate', label: 'Rate of mass loss', symbol: 'm/t', unit: 'g s⁻¹', decimals: 5, value: (r, c) => r.m / c.t },
    ],
    graph: { x: 'rate', y: 'P', fit: 'line' },
    results: [{ id: 'L', prompt: 'Specific latent heat of vaporisation of water', unit: 'J g⁻¹', sig: 3, fromFit: (f) => f.m, truth: () => L_WATER, tolTrue: { rel: 0.08 } }],
    questions: [
      { id: 'intercept', type: 'choice', prompt: 'What does the intercept on the power axis represent?', options: ['The rate at which energy is lost to the surroundings', 'The energy needed to heat the water to 100 °C', 'The resistance of the heater', 'The latent heat of the water'], correct: 0 },
      { id: 'boiling', type: 'text', prompt: 'Explain why timing must only start once the water is boiling steadily.' },
    ],
  }),

  definePractical({
    id: 'phys-al-12-4', collection: C('12.4'), topic: 'Specific latent heat of vaporisation',
    title: 'Specific latent heat of vaporisation of water',
    summary: 'Record the mass of boiling water against time at two heater powers and combine the two rates to find L with the heat loss removed.',
    aim: 'To determine the specific latent heat of vaporisation of water, using two heater powers to eliminate the effect of heat loss.',
    durationMin: 60, difficulty: 'A Level',
    apparatus: ['immersion_heater', 'beaker_250', 'top_pan_balance', 'dc_supply', 'voltmeter', 'ammeter', 'stopwatch', 'leads'],
    safety: ['Boiling water and steam scald: keep hands and faces away from the beaker mouth and do not touch the heater when it is on.', 'Never switch on the heater unless it is covered by water.', 'Stand the beaker on a heat-resistant mat on the balance pan, away from the bench edge.'],
    settings: [{ key: 'power', label: 'Heater supply', options: [{ value: 'low', label: 'Low power (8 V)' }, { value: 'high', label: 'High power (12 V)' }], default: 'low' }],
    procedure: [
      'Clamp the immersion heater in the beaker of water on the balance so the heater does not rest on the beaker. Connect the ammeter in series and the voltmeter across the heater.',
      'Choose the low power setting and bring the water to the boil.',
      'Once it boils steadily, start the stopwatch. Record the balance reading M and the meter readings every minute or so for ten minutes.',
      'Top up with boiling water, choose the high power setting and repeat.',
      'Plot M against t for both powers. Each gradient gives the rate of mass loss.',
      'With heat loss h the same in both runs, P₁ = L r₁ + h and P₂ = L r₂ + h, so L = (P₂ − P₁)/(r₂ − r₁).',
    ],
    controlled: 'the same beaker and depth of water, water boiling throughout so the heat loss is the same in both runs.',
    model: { kind: 'quantitative', summary: 'At boiling point P = L (dm/dt) + h. The heat loss h depends only on the temperature of the beaker, which is 100 °C in both runs, so it cancels when the two runs are subtracted.',
      assumptions: ['The heat loss is 6–14 W and is equal in both runs.', 'L = 2257 J g⁻¹ at 100 °C.', 'Bubbling makes each balance reading uncertain by about ±0.05 g.', 'The heater resistance is 2.7–3.1 Ω and the supply voltage is steady to within 1 %.'] },
    hidden: (q) => ({ h: q('h', 6, 14), Rh: q('Rh', 2.7, 3.1), M0: q('M0', 230, 260) }),
    iv: { key: 't', label: 'Time since timing started', symbol: 't', unit: 's', min: 0, max: 600, step: 30, start: 0, instrument: 'stopwatch' },
    measures: [
      { key: 'M', label: 'Balance reading', symbol: 'M', unit: 'g', resolution: 0.01, instrument: 'top_pan_balance', read: (p, x, n, s) => {
        const V = POWER_V[s.power] * (1 + 0.005 * p.j('V' + s.power))
        return p.M0 + (s.power === 'high' ? 4 : 0) - (V * V / p.Rh - p.h) * x / L_WATER + n(0.05)
      } },
      { key: 'V', label: 'Heater p.d.', symbol: 'V', unit: 'V', resolution: 0.01, instrument: 'voltmeter', read: (p, x, n, s) => POWER_V[s.power] * (1 + 0.005 * p.j('V' + s.power)) + n(0.01) },
      { key: 'I', label: 'Heater current', symbol: 'I', unit: 'A', resolution: 0.01, instrument: 'ammeter', read: (p, x, n, s) => POWER_V[s.power] * (1 + 0.005 * p.j('V' + s.power)) / p.Rh + n(0.01) },
    ],
    derived: [{ key: 'P', label: 'Heater power', symbol: 'P', unit: 'W', decimals: 1, value: (r) => r.V * r.I }],
    graph: { x: 't', y: 'M', fit: 'line', seriesBy: 'power' },
    results: [
      { id: 'L', prompt: 'Specific latent heat of vaporisation of water (two-power method)', unit: 'J g⁻¹', sig: 3,
        fromConsts: (c, gs) => { const a = runOf(gs, 'low'), b = runOf(gs, 'high'); return (b.P - a.P) / (b.rate - a.rate) },
        truth: () => L_WATER, tolTrue: { rel: 0.06 } },
      { id: 'h', prompt: 'Rate of heat loss to the surroundings', unit: 'W', sig: 3,
        fromConsts: (c, gs) => { const a = runOf(gs, 'low'), b = runOf(gs, 'high'); const L = (b.P - a.P) / (b.rate - a.rate); return a.P - L * a.rate },
        truth: (p) => p.h, tolTrue: { abs: 2.5 } },
    ],
    questions: [
      { id: 'single', type: 'choice', prompt: 'If L were calculated from one run alone as P divided by the rate of mass loss, the value would be:', options: ['too large, because some of the heater’s energy is lost to the surroundings', 'too small, because some of the heater’s energy is lost to the surroundings', 'correct, because heat loss does not affect boiling', 'too large, because the balance reads high'], correct: 0 },
      { id: 'clamp', type: 'text', prompt: 'Explain why the heater must be held by a clamp rather than resting on the beaker.' },
    ],
  }),
]
