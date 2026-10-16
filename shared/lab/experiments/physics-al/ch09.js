// AS & A Level Physics practicals, chapter 9: planning and data analysis.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const G = 9.81
const C = (code, chapter = 'Planning and data analysis') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })

// Densities used in 9.1 (stated to the student in the procedure).
const RHO_STEEL = 7800, RHO_GLYC = 1260
// n k T / e for the photovoltaic cell in 9.7 (stated to the student).
const NVT = 0.035

// Ramp and trolley model shared by 9.3 and 9.4: a = k_w g sin θ − μ g cos θ.
const trolleyA = (p, sinT) => p.kw * G * sinT - p.mu * G * Math.sqrt(1 - sinT * sinT)

// LDR model shared by 9.5 and 9.6: R = R₁₀₀ ((d + δ) / 100 cm)^(2γ).
const ldrR = (p, d) => p.R100 * Math.pow((d + p.dOff) / 100, 2 * p.gamma)

export default [
  definePractical({
    id: 'phys-al-9-1', collection: C('9.1'), topic: 'Planning; choosing a graph to linearise a power law',
    title: 'Planning data analysis: falling spheres', planning: true,
    summary: 'Plan how to find the power n in v = k dⁿ for steel balls falling through glycerol, then test the plan with a log–log graph.',
    aim: 'To plan and carry out an investigation of how the terminal speed of a steel ball in glycerol depends on its diameter, and to find the power n and the viscosity of the glycerol from a suitable straight-line graph.',
    durationMin: 50,
    apparatus: ['tall_tube', 'ball_bearing', 'micrometer', 'metre_rule', 'stopwatch'],
    safety: ['Glycerol is slippery: wipe up drips at once and keep the tube clamped upright.', 'Recover the balls with a magnet on a string rather than reaching into the tube.'],
    procedure: [
      'Put two rubber bands round the tube, the upper one at least 10 cm below the surface so that the balls reach terminal speed before it. Measure the distance s between the bands.',
      'Measure the diameter d of a ball with the micrometer.',
      'Release the ball at the centre of the surface and time it between the two bands, looking at each band at eye level. Time three balls of the same size.',
      'Repeat for ball sizes from 1.5 mm to 6.0 mm.',
      'Calculate the terminal speed v = s / t. If v = k dⁿ then lg v = n lg d + lg k, so plot lg(v / cm s⁻¹) against lg(d / mm): the gradient is n.',
      'Read lg v at d = 3.00 mm from your line and use Stokes’ law, η = (ρ_s − ρ_f) g d² / (18 v), with ρ_s = 7800 kg m⁻³ and ρ_f = 1260 kg m⁻³, to find the viscosity.',
    ],
    controlled: 'the same tube of glycerol at room temperature, the same distance between the bands, balls released at the centre of the tube.',
    model: { kind: 'simplified', summary: 'Each ball falls at the Stokes terminal speed v = (ρ_s − ρ_f) g d² / (18 η), so v ∝ d² and the log–log gradient is 2.',
      assumptions: ['Stokes’ law holds (Reynolds number below about 1) and the balls reach terminal speed before the upper band.', 'The effect of the tube walls is left out; in a real tube of 5 cm diameter it would slow the largest balls by up to about 20 %.', 'The viscosity of the glycerol is 0.9–1.4 Pa s (it depends strongly on temperature and water content).', 'Ball diameters vary by up to ±0.3 % from the nominal size; micrometer readings have a random error of about ±0.003 mm.', 'Hand timing has a random error of about ±0.1 s.'] },
    hidden: (q) => ({ eta: q('eta', 0.9, 1.4), s: q('s', 29.0, 31.0) }),
    constants: [{ key: 's', label: 'Distance between the bands', symbol: 's', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, n) => p.s + n(0.05) }],
    iv: { key: 'dn', label: 'Nominal ball diameter', symbol: 'd₀', unit: 'mm', min: 1.5, max: 6.0, step: 0.5, start: 1.5, instrument: 'ball_bearing' },
    measures: [
      { key: 'd', label: 'Measured diameter', symbol: 'd', unit: 'mm', resolution: 0.01, instrument: 'micrometer', read: (p, x, n) => x * (1 + 0.003 * p.j('d' + x)) + n(0.003) },
      { key: 't', label: 'Time between bands', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch', read: (p, x, n) => {
        const d = x * (1 + 0.003 * p.j('d' + x)) / 1000
        const v = (RHO_STEEL - RHO_GLYC) * G * d * d / (18 * p.eta)
        return p.s / 100 / v + n(0.1)
      } },
    ],
    repeats: 3,
    derived: [{ key: 'v', label: 'Terminal speed', symbol: 'v', unit: 'cm s⁻¹', decimals: 3, value: (r, c) => c.s / r.t }],
    graph: { x: 'd', tx: 'lg', y: 'v', ty: 'lg', fit: 'line' },
    results: [
      { id: 'n', prompt: 'Power n in v = k dⁿ (gradient of the log–log graph)', unit: '', sig: 3, fromFit: (f) => f.m, truth: () => 2, tolOwn: { abs: 0.02 }, tolTrue: { abs: 0.1 } },
      { id: 'eta', prompt: 'Viscosity of the glycerol', unit: 'Pa s', sig: 3,
        fromFit: (f) => { const v = Math.pow(10, f.c + f.m * Math.log10(3)) / 100; return (RHO_STEEL - RHO_GLYC) * G * 9e-6 / (18 * v) },
        truth: (p) => p.eta, tolTrue: { rel: 0.08 } },
    ],
    questions: [
      { id: 'whyLog', type: 'choice', prompt: 'Why is lg v plotted against lg d rather than v against d?', options: ['A power law v = k dⁿ becomes a straight line whose gradient is n', 'It makes the readings more precise', 'It removes the need to repeat readings', 'Speed is always proportional to the logarithm of size'], correct: 0 },
      { id: 'terminal', type: 'text', prompt: 'Explain how you could check that the balls have reached terminal speed before the upper band.' },
    ],
  }),

  definePractical({
    id: 'phys-al-9-2', collection: C('9.2'), topic: 'Uncertainties; repeated readings and combining uncertainties',
    title: 'Treatment of uncertainties: a simple pendulum',
    summary: 'Measure the diameter of a pendulum bob several times and time repeated sets of oscillations, then combine the uncertainties in g and in the volume of the bob.',
    aim: 'To use repeated readings to reduce random uncertainty, to find the mean diameter and volume of a pendulum bob and to determine g from a graph of T² against length, estimating the uncertainty in each result.',
    durationMin: 50,
    apparatus: ['stand_clamp', 'string', 'pendulum_bob', 'vernier_callipers', 'metre_rule', 'stopwatch'],
    safety: ['Clamp the stand firmly or weigh down its base so it cannot topple when the bob swings.', 'Keep the amplitude small and stand clear of the swinging bob.'],
    procedure: [
      'Measure the diameter of the bob with the callipers three times, turning it between readings. Record each value, the mean and half the range as the uncertainty.',
      'Hang the bob from the clamp between two small wooden jaws. Measure the length l of string from the jaws to the top of the bob.',
      'Displace the bob by a small angle (under 10°) and time 20 oscillations, starting and stopping the watch as the bob passes the lowest point. Repeat twice more.',
      'Repeat for lengths from 20 cm to 100 cm.',
      'Work out the length to the centre of the bob, L = l + d/2, and the period T = t / 20. Plot T² against L.',
      'g = 4π² / gradient. Combine the percentage uncertainties to estimate the uncertainty in g and in the volume of the bob, V = π d³ / 6.',
    ],
    controlled: 'the same bob, small amplitude, timing from the lowest point of the swing.',
    model: { kind: 'quantitative', summary: 'For small oscillations T = 2π √(L/g), where L is measured to the centre of the bob.',
      assumptions: ['Amplitude is small enough that the period does not depend on it (the error at 10° is about 0.2 %).', 'The string is light and inextensible; air resistance is negligible.', 'g is 9.78–9.83 N kg⁻¹.', 'The bob is not perfectly round: diameter readings vary by about ±0.01 cm.', 'The point where the string leaves the jaws is uncertain by about ±0.2 cm, the same at every length.', 'Each timing of 20 oscillations has a random reaction-time error of about ±0.12 s.'] },
    hidden: (q) => ({ g: q('g', 9.78, 9.83), d: q('d', 2.0, 2.6) }),
    constants: [1, 2, 3].map(i => ({ key: 'd' + i, label: 'Diameter of bob, reading ' + i, symbol: 'd' + ['₁', '₂', '₃'][i - 1], unit: 'cm', resolution: 0.01, instrument: 'vernier_callipers', read: (p, n) => p.d + n(0.01) })),
    iv: { key: 'l', label: 'Length of string', symbol: 'l', unit: 'cm', min: 20, max: 100, step: 5, start: 20, instrument: 'metre_rule' },
    measures: [{ key: 't', label: 'Time for 20 oscillations', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch',
      read: (p, x, n) => 20 * 2 * Math.PI * Math.sqrt(((x + p.d / 2 + 0.2 * p.j('jaws')) / 100) / p.g) + n(0.12) }],
    repeats: 3,
    derived: [
      { key: 'L', label: 'Length to centre of bob', symbol: 'L', unit: 'm', decimals: 4, value: (r, c) => (r.l + (c.d1 + c.d2 + c.d3) / 6) / 100 },
      { key: 'T', label: 'Period', symbol: 'T', unit: 's', decimals: 3, value: (r) => r.t / 20 },
    ],
    graph: { x: 'L', y: 'T', ty: 'square', fit: 'line' },
    results: [
      { id: 'd', prompt: 'Mean diameter of the bob', unit: 'cm', sig: 3, fromConsts: (c) => (c.d1 + c.d2 + c.d3) / 3, truth: (p) => p.d, tolTrue: { rel: 0.02 } },
      { id: 'V', prompt: 'Volume of the bob', unit: 'cm³', sig: 3, fromConsts: (c) => Math.PI * Math.pow((c.d1 + c.d2 + c.d3) / 3, 3) / 6, truth: (p) => Math.PI * p.d ** 3 / 6, tolTrue: { rel: 0.05 } },
      { id: 'g', prompt: 'Acceleration of free fall', unit: 'm s⁻²', sig: 3, fromFit: (f) => 4 * Math.PI ** 2 / f.m, truth: (p) => p.g, tolTrue: { rel: 0.04 } },
    ],
    questions: [
      { id: 'pcT', type: 'choice', prompt: 'The time for 20 oscillations is 36.4 s with an uncertainty of ±0.2 s. What is the percentage uncertainty in the period T?', options: ['0.55 %', '0.027 %', '11 %', '0.27 %'], correct: 0 },
      { id: 'pcG', type: 'choice', prompt: 'L has a percentage uncertainty of 0.5 % and T has a percentage uncertainty of 1.0 %. What is the percentage uncertainty in g = 4π² L / T²?', options: ['1.5 %', '2.5 %', '0.5 %', '2.0 %'], correct: 1 },
      { id: 'pcV', type: 'choice', prompt: 'The diameter of the bob has a percentage uncertainty of 0.4 %. What is the percentage uncertainty in its volume V = π d³ / 6?', options: ['0.4 %', '0.8 %', '1.2 %', '0.064 %'], correct: 2 },
      { id: 'why20', type: 'text', prompt: 'Explain why timing 20 oscillations and repeating the timing reduces the uncertainty in T, and why it does not remove a systematic error such as a wrongly measured length.' },
    ],
  }),

  definePractical({
    id: 'phys-al-9-3', collection: C('9.3'), topic: 'Planning; motion on an inclined plane',
    title: 'Planning: acceleration down an inclined plane', planning: true,
    summary: 'Plan how the acceleration of a trolley rolling down a ramp depends on the angle of the ramp, then test the plan by timing the trolley over a fixed distance.',
    aim: 'To plan and test an investigation into how the acceleration of a trolley rolling down an inclined plane varies with the angle of the plane.',
    durationMin: 50,
    apparatus: ['ramp', 'wooden_blocks', 'trolley', 'metre_rule', 'stopwatch'],
    safety: ['Place a soft stop (a bag or a block with padding) at the bottom of the ramp so the trolley cannot run off the bench.', 'Support the raised end of the ramp securely so the blocks cannot slip.'],
    procedure: [
      'Measure the length L of the ramp between the supports, and mark a start line and a finish line a distance s apart.',
      'Raise one end of the ramp on blocks to a height h. sin θ = h / L.',
      'Hold the trolley at rest with its front at the start line, release it without pushing and time it to the finish line. Time three runs.',
      'Repeat for heights from 10 cm to 40 cm.',
      'Calculate a = 2s / t² for each height. If a = g sin θ − constant, a graph of a against sin θ is a straight line with gradient close to g.',
    ],
    controlled: 'the same trolley and load, the same distance s, release from rest at the same line.',
    model: { kind: 'simplified', summary: 'a = k_w g sin θ − μ g cos θ: the component of weight down the slope minus a small rolling resistance; k_w allows for the energy taken by the spinning wheels.',
      assumptions: ['The rolling resistance is a constant fraction μ = 0.010–0.020 of the normal force; air resistance is ignored.', 'The rotating wheels reduce the acceleration by 1–2.5 % (k_w = 0.975–0.99), so the gradient is slightly less than g.', 'The heights of the blocks differ from the set values by up to ±0.2 cm.', 'Hand timing has a random error of about ±0.05 s.'] },
    hidden: (q) => ({ mu: q('mu', 0.010, 0.020), kw: q('kw', 0.975, 0.99), L: q('L', 195, 205), s: q('s', 170, 180) }),
    constants: [
      { key: 'L', label: 'Length of ramp between supports', symbol: 'L', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, n) => p.L + n(0.1) },
      { key: 's', label: 'Distance from start to finish line', symbol: 's', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, n) => p.s + n(0.1) },
    ],
    iv: { key: 'h', label: 'Height of raised end', symbol: 'h', unit: 'cm', min: 10, max: 40, step: 1, start: 10, instrument: 'metre_rule' },
    measures: [{ key: 't', label: 'Time to travel s', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch',
      read: (p, x, n) => Math.sqrt(2 * (p.s / 100) / trolleyA(p, (x + 0.2 * p.j('h' + x)) / p.L)) + n(0.05) }],
    repeats: 3,
    derived: [
      { key: 'sin', label: 'sin θ', symbol: 'sin θ', unit: '', decimals: 4, value: (r, c) => r.h / c.L },
      { key: 'a', label: 'Acceleration', symbol: 'a', unit: 'm s⁻²', decimals: 3, value: (r, c) => 2 * (c.s / 100) / (r.t * r.t) },
    ],
    graph: { x: 'sin', y: 'a', fit: 'line' },
    results: [{ id: 'g', prompt: 'Gradient of a against sin θ (an estimate of g)', unit: 'm s⁻²', sig: 3, fromFit: (f) => f.m, truth: (p) => p.kw * G, tolTrue: { rel: 0.08 } }],
    questions: [
      { id: 'graph', type: 'choice', prompt: 'You predict a = g sin θ − c, where c is a constant. Which graph tests this most directly?', options: ['a against sin θ: a straight line with gradient g and negative intercept', 'a against θ: a straight line through the origin', 'a against 1/sin θ: a straight line through the origin', 'lg a against lg θ: gradient 1'], correct: 0 },
      { id: 'intercept', type: 'text', prompt: 'What does the intercept of your graph on the sin θ axis tell you about the trolley?' },
    ],
  }),

  definePractical({
    id: 'phys-al-9-4', collection: C('9.4'), topic: 'Motion on an inclined plane; light gates',
    title: 'Acceleration of a trolley on an inclined plane',
    summary: 'Use a light gate to measure the speed of a trolley after it has rolled a fixed distance, and find g and the resistive force from a graph of a against sin θ.',
    aim: 'To investigate how the acceleration of a trolley rolling down an inclined plane depends on the angle of the plane, and to determine g and the resistive force on the trolley.',
    durationMin: 45,
    apparatus: ['ramp', 'wooden_blocks', 'trolley', 'card', 'light_gate', 'protractor', 'metre_rule', 'vernier_callipers', 'top_pan_balance'],
    safety: ['Put a padded stop at the bottom of the ramp so the trolley cannot fall off the bench.', 'Keep fingers clear of the trolley wheels and the raised end of the ramp.'],
    procedure: [
      'Weigh the trolley with its card. Measure the width w of the card with the callipers.',
      'Fix the light gate across the ramp. Mark a release line so that the centre of the card is a distance s from the gate when the trolley is released.',
      'Set the ramp to an angle θ with the protractor. Release the trolley from rest and record the time t for which the card blocks the gate.',
      'Repeat each angle twice, for angles from 4° to 24°.',
      'Calculate v = w / t and a = v² / (2s). Plot a against sin θ.',
      'The gradient is close to g. The intercept is −F / m, where F is the resistive force, so F = −m × intercept.',
    ],
    controlled: 'the same trolley, card and release distance s; the gate held firmly in place.',
    model: { kind: 'simplified', summary: 'a = k_w g sin θ − μ g cos θ. Over the angles used cos θ changes by less than 9 %, so a against sin θ is very nearly straight, with intercept close to −μ g.',
      assumptions: ['The rolling resistance is F = μ m g cos θ with μ = 0.012–0.025; air resistance is ignored.', 'The rotating wheels reduce the acceleration by 1–2.5 % (k_w = 0.975–0.99).', 'The speed through the gate is taken as the speed at distance s (the card is short).', 'The protractor sets each angle to within about ±0.2°; the release position varies by about ±0.3 cm from run to run.'] },
    hidden: (q) => ({ mu: q('mu', 0.012, 0.025), kw: q('kw', 0.975, 0.99), m: q('m', 0.60, 1.00), w: q('w', 4.90, 5.10), s: q('s', 78, 82) }),
    constants: [
      { key: 'm', label: 'Mass of trolley and card', symbol: 'm', unit: 'g', resolution: 0.1, instrument: 'top_pan_balance', read: (p) => p.m * 1000 },
      { key: 'w', label: 'Width of card', symbol: 'w', unit: 'cm', resolution: 0.01, instrument: 'vernier_callipers', read: (p, n) => p.w + n(0.005) },
      { key: 's', label: 'Distance from release to gate', symbol: 's', unit: 'cm', resolution: 0.1, instrument: 'metre_rule', read: (p, n) => p.s + n(0.05) },
    ],
    iv: { key: 'th', label: 'Angle of ramp', symbol: 'θ', unit: '°', min: 4, max: 24, step: 1, start: 4, instrument: 'protractor' },
    measures: [{ key: 't', label: 'Time card blocks gate', symbol: 't', unit: 's', resolution: 0.0001, instrument: 'light_gate',
      read: (p, x, n) => {
        const th = (x + 0.2 * p.j('th' + x)) * Math.PI / 180
        const a = trolleyA(p, Math.sin(th))
        const s = p.s / 100 + n(0.003)
        return (p.w / 100) / Math.sqrt(2 * a * s)
      } }],
    repeats: 2,
    derived: [
      { key: 'sin', label: 'sin θ', symbol: 'sin θ', unit: '', decimals: 4, value: (r) => Math.sin(r.th * Math.PI / 180) },
      { key: 'v', label: 'Speed at gate', symbol: 'v', unit: 'm s⁻¹', decimals: 3, value: (r, c) => (c.w / 100) / r.t },
      { key: 'a', label: 'Acceleration', symbol: 'a', unit: 'm s⁻²', decimals: 3, value: (r, c) => ((c.w / 100) / r.t) ** 2 / (2 * c.s / 100) },
    ],
    graph: { x: 'sin', y: 'a', fit: 'line' },
    results: [
      { id: 'g', prompt: 'Gradient of a against sin θ (an estimate of g)', unit: 'm s⁻²', sig: 3, fromFit: (f) => f.m, truth: (p) => p.kw * G, tolTrue: { rel: 0.06 } },
      { id: 'F', prompt: 'Resistive force on the trolley', unit: 'N', sig: 2, fromFit: (f, c) => -f.c * c.m / 1000, truth: (p) => p.mu * p.m * G * Math.cos(14 * Math.PI / 180), tolOwn: { rel: 0.05 }, tolTrue: { abs: 0.03 } },
    ],
    questions: [
      { id: 'lightgate', type: 'choice', prompt: 'Why is a light gate better than a stopwatch for this experiment?', options: ['It removes reaction-time error from very short times', 'It makes the trolley accelerate uniformly', 'It reduces the friction on the trolley', 'It measures the angle of the ramp'], correct: 0 },
      { id: 'cardWidth', type: 'text', prompt: 'Explain why using a much wider card would make the calculated acceleration less accurate.' },
    ],
    reportGuidance: 'Table headed with quantities and units, consistent precision (1); graph of a against sin θ with line of best fit (1); gradient, intercept and F worked out (1); two relevant sources of uncertainty with improvements (1).',
  }),

  definePractical({
    id: 'phys-al-9-5', collection: C('9.5'), topic: 'Planning; light-dependent resistors',
    title: 'Planning: current in an LDR and distance from a lamp', planning: true,
    summary: 'Plan how the current in an LDR depends on its distance from a small lamp, then test the plan in a darkened room using a log–log graph.',
    aim: 'To plan and test an investigation into how the current in a light-dependent resistor connected to a fixed p.d. varies with its distance from a light source.',
    durationMin: 50,
    apparatus: ['ldr', 'lamp_point', 'dc_supply', 'milliammeter', 'voltmeter', 'metre_rule', 'leads'],
    safety: ['The lamp becomes hot: do not touch the bulb and let it cool before moving it.', 'Work in a darkened room with the bench clear of trailing leads so nobody trips.'],
    procedure: [
      'Connect the LDR in series with the milliammeter across the supply. Connect the voltmeter across the supply and set it to 3.0 V.',
      'Darken the room. Place the lamp at the zero of a metre rule fixed to the bench, with the LDR facing it at the same height.',
      'Place the LDR a distance d from the lamp and record the current I.',
      'Repeat for distances from 15 cm to 100 cm, checking the supply p.d. stays constant.',
      'The illuminance is proportional to 1/d², and R ∝ E^(−γ), so I ∝ d^(−2γ). Plot lg(I / mA) against lg(d / cm); the gradient is −2γ.',
    ],
    controlled: 'the same lamp at the same brightness, the same supply p.d., the LDR facing the lamp, room darkened.',
    model: { kind: 'simplified', summary: 'The lamp is a point source, so the illuminance E ∝ 1/d². The LDR follows the empirical law R ∝ E^(−γ), so I = V/R ∝ d^(−2γ).',
      assumptions: ['The power law R ∝ E^(−γ) with γ = 0.65–0.90 is an empirical fit; real LDRs deviate from it at very low and very high light levels and respond slowly.', 'Stray light in the darkened room is negligible.', 'The lamp filament is up to ±0.5 cm from the zero of the rule.', 'The resistance of the milliammeter is negligible; the current reading fluctuates by about ±1 %.'] },
    hidden: (q) => ({ gamma: q('gamma', 0.65, 0.90), R100: q('R100', 3.0, 8.0), dOff: 0, V: q('V', 2.98, 3.02), offj: q('offj', -0.5, 0.5) }),
    constants: [{ key: 'V', label: 'Supply p.d.', symbol: 'V', unit: 'V', resolution: 0.01, instrument: 'voltmeter', read: (p) => p.V }],
    iv: { key: 'd', label: 'Distance from lamp', symbol: 'd', unit: 'cm', min: 15, max: 100, step: 1, start: 15, instrument: 'metre_rule' },
    measures: [{ key: 'I', label: 'Current', symbol: 'I', unit: 'mA', resolution: 0.01, instrument: 'milliammeter',
      read: (p, x, n) => p.V / ldrR({ ...p, dOff: p.offj }, x) * (1 + n(0.01)) }],
    graph: { x: 'd', tx: 'lg', y: 'I', ty: 'lg', fit: 'line' },
    results: [{ id: 'gamma', prompt: 'Exponent γ in R ∝ E^(−γ)', unit: '', sig: 3, fromFit: (f) => -f.m / 2, truth: (p) => p.gamma, tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'grad', type: 'choice', prompt: 'If R ∝ E^(−γ) and E ∝ 1/d², what is the gradient of a graph of lg I against lg d?', options: ['−2γ', '−γ', '2γ', '−γ/2'], correct: 0 },
      { id: 'stray', type: 'text', prompt: 'Explain how stray light from the room would change the shape of your log–log graph at large distances.' },
    ],
  }),

  definePractical({
    id: 'phys-al-9-6', collection: C('9.6'), topic: 'Light-dependent resistors; power laws',
    title: 'Resistance of an LDR',
    summary: 'Measure the p.d. across and current in an LDR at different distances from a lamp, and find the exponent of the power law from a graph of lg R against lg d.',
    aim: 'To investigate how the resistance of a light-dependent resistor depends on its distance from a small lamp, and to determine the exponent γ in R ∝ E^(−γ).',
    durationMin: 45,
    apparatus: ['ldr', 'lamp_point', 'dc_supply', 'resistors', 'voltmeter', 'milliammeter', 'metre_rule', 'leads'],
    safety: ['The lamp becomes hot: do not touch the bulb and let it cool before moving it.', 'Keep the room darkened but keep a clear path to the door; switch off the supply when changing connections.'],
    procedure: [
      'Connect the LDR in series with a 1.0 kΩ protective resistor, the milliammeter and a 6 V supply. Connect the voltmeter across the LDR only.',
      'Darken the room. Fix the lamp at the zero of the metre rule and place the LDR at a distance d, facing the lamp.',
      'Record the p.d. V across the LDR and the current I. Calculate R = V / I.',
      'Repeat for distances from 15 cm to 100 cm.',
      'Plot lg(R / kΩ) against lg(d / m). The gradient is 2γ and the intercept is lg of the resistance at d = 1.00 m.',
    ],
    controlled: 'the same lamp at the same brightness, the LDR facing the lamp at the same height, the room darkened.',
    model: { kind: 'simplified', summary: 'Illuminance from a point source falls as 1/d², and the LDR follows R ∝ E^(−γ), so R ∝ d^(2γ) and lg R against lg d is a straight line of gradient 2γ.',
      assumptions: ['R ∝ E^(−γ) with γ = 0.65–0.90 is an empirical fit, not an exact law.', 'Stray light is negligible; the lamp filament is up to ±0.5 cm from the zero of the rule.', 'The voltmeter has a very high resistance; the meter readings fluctuate by about ±1 % because the LDR responds slowly to small changes in light.'] },
    hidden: (q) => ({ gamma: q('gamma', 0.65, 0.90), R100: q('R100', 3.0, 8.0), dOff: q('dOff', -0.5, 0.5), Vs: q('Vs', 5.9, 6.1), Rp: q('Rp', 0.98, 1.02) }),
    iv: { key: 'd', label: 'Distance from lamp', symbol: 'd', unit: 'cm', min: 15, max: 100, step: 1, start: 15, instrument: 'metre_rule' },
    measures: [
      { key: 'V', label: 'P.d. across LDR', symbol: 'V', unit: 'V', resolution: 0.01, instrument: 'voltmeter', read: (p, x, n) => { const R = ldrR(p, x) * (1 + 0.01 * p.j('R' + x)); return p.Vs * R / (R + p.Rp) * (1 + n(0.003)) } },
      { key: 'I', label: 'Current', symbol: 'I', unit: 'mA', resolution: 0.01, instrument: 'milliammeter', read: (p, x, n) => { const R = ldrR(p, x) * (1 + 0.01 * p.j('R' + x)); return p.Vs / (R + p.Rp) * (1 + n(0.003)) } },
    ],
    derived: [
      { key: 'dm', label: 'Distance', symbol: 'd', unit: 'm', decimals: 3, value: (r) => r.d / 100 },
      { key: 'R', label: 'Resistance of LDR', symbol: 'R', unit: 'kΩ', decimals: 3, value: (r) => r.V / r.I },
    ],
    graph: { x: 'dm', tx: 'lg', y: 'R', ty: 'lg', fit: 'line' },
    results: [
      { id: 'gamma', prompt: 'Exponent γ in R ∝ E^(−γ)', unit: '', sig: 3, fromFit: (f) => f.m / 2, truth: (p) => p.gamma, tolTrue: { rel: 0.06 } },
      { id: 'R1', prompt: 'Resistance of the LDR at d = 1.00 m (from the intercept)', unit: 'kΩ', sig: 3, fromFit: (f) => Math.pow(10, f.c), truth: (p) => ldrR(p, 100), tolTrue: { rel: 0.06 } },
    ],
    questions: [
      { id: 'protect', type: 'choice', prompt: 'Why is the 1.0 kΩ resistor included in series with the LDR?', options: ['To limit the current when the LDR is close to the lamp and its resistance is low', 'To make the illuminance proportional to 1/d²', 'To measure the resistance of the LDR directly', 'To keep the p.d. across the LDR constant'], correct: 0 },
      { id: 'response', type: 'text', prompt: 'LDRs take time to settle after the light changes. How would you allow for this when taking readings?' },
    ],
  }),

  definePractical({
    id: 'phys-al-9-7', collection: C('9.7'), topic: 'Planning; photovoltaic cells and absorption of light',
    title: 'Planning: e.m.f. of a photovoltaic cell and absorber thickness', planning: true,
    summary: 'Plan how the e.m.f. of a photovoltaic cell depends on the thickness of translucent absorber placed over it, then test the plan by adding sheets one at a time.',
    aim: 'To plan and test an investigation into how the e.m.f. of a photovoltaic cell varies with the thickness of an absorber between the cell and a lamp, and to determine the absorption coefficient of the absorber.',
    durationMin: 45,
    apparatus: ['photovoltaic_cell', 'lamp_point', 'filter_sheets', 'multimeter', 'micrometer', 'metre_rule', 'leads'],
    safety: ['The lamp becomes hot: keep the sheets and your hands away from the bulb and do not leave it on unattended.', 'Use a low-voltage lamp supply; do not use a mains lamp on the bench.'],
    procedure: [
      'Fix the lamp and the photovoltaic cell 30 cm apart on the bench and screen them from other light. Connect the digital multimeter (high resistance, d.c. volts) across the cell so it reads the e.m.f.',
      'Measure the thickness of a stack of 10 absorber sheets with the micrometer; the thickness of N sheets is x = N × (stack thickness) / 10.',
      'Record the e.m.f. E with no sheets, then place sheets one at a time flat against the cell and record E each time, up to 10 sheets.',
      'The transmitted intensity is I₀ e^(−μx), and in this model the e.m.f. changes by (nkT/e) × ln(intensity), with nkT/e = 0.035 V for this cell. So E = E₀ − 0.035 μ x.',
      'Plot E against x. Find the gradient and use μ = −gradient / 0.035 V.',
    ],
    controlled: 'the same lamp at a fixed distance and brightness, the cell temperature (lamp left on to warm up first), the same sheets, other light excluded.',
    model: { kind: 'simplified', summary: 'Light is absorbed exponentially, I = I₀ e^(−μx), and the open-circuit e.m.f. of the cell rises with the logarithm of intensity, E = E₀ + (nkT/e) ln(I / I₀). Together these make E fall linearly with x.',
      assumptions: ['The logarithmic e.m.f. law is a simplification that fails at very low intensity, where leakage inside the cell makes the e.m.f. fall faster; the intensities used here are kept above that region.', 'nkT/e is taken as exactly 0.035 V; in practice it depends on the cell and on its temperature, which the lamp can raise.', 'Light scattered sideways or reflected between sheets is ignored; absorption coefficient μ = 1.4–2.2 mm⁻¹.', 'Sheets differ in thickness by up to ±3 %; the e.m.f. reading fluctuates by about ±0.8 mV.'] },
    hidden: (q) => ({ mu: q('mu', 1.4, 2.2), ts: q('ts', 0.10, 0.14), E0: q('E0', 0.50, 0.56) }),
    constants: [{ key: 'x10', label: 'Thickness of 10 sheets', symbol: 'x₁₀', unit: 'mm', resolution: 0.01, instrument: 'micrometer',
      read: (p, n) => { let x = 0; for (let i = 1; i <= 10; i++) x += p.ts * (1 + 0.03 * p.j('sheet' + i)); return x + n(0.003) } }],
    iv: { key: 'N', label: 'Number of sheets', symbol: 'N', unit: '', min: 0, max: 10, step: 1, start: 0, instrument: 'filter_sheets' },
    measures: [{ key: 'E', label: 'E.m.f. of cell', symbol: 'E', unit: 'V', resolution: 0.001, instrument: 'multimeter',
      read: (p, x, n) => { let t = 0; for (let i = 1; i <= x; i++) t += p.ts * (1 + 0.03 * p.j('sheet' + i)); return p.E0 - NVT * p.mu * t + n(0.0008) } }],
    derived: [{ key: 'x', label: 'Thickness of absorber', symbol: 'x', unit: 'mm', decimals: 3, value: (r, c) => r.N * c.x10 / 10 }],
    graph: { x: 'x', y: 'E', fit: 'line' },
    results: [
      { id: 'grad', prompt: 'Gradient of E against x', unit: 'V mm⁻¹', sig: 3, fromFit: (f) => f.m, truth: (p) => -NVT * p.mu, tolTrue: { rel: 0.08 } },
      { id: 'mu', prompt: 'Absorption coefficient μ of the absorber', unit: 'mm⁻¹', sig: 3, fromFit: (f) => -f.m / NVT, truth: (p) => p.mu, tolTrue: { rel: 0.08 } },
    ],
    questions: [
      { id: 'shape', type: 'choice', prompt: 'In this model, what graph of the e.m.f. E against thickness x do you expect?', options: ['A straight line with a negative gradient', 'An exponential decay towards zero', 'A straight line through the origin', 'A curve with E proportional to 1/x²'], correct: 0 },
      { id: 'stack', type: 'text', prompt: 'Why is it better to measure the thickness of a stack of 10 sheets than of a single sheet?' },
    ],
  }),
]
