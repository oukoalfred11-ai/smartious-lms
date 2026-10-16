// AS & A Level Physics practicals, chapter 11: oscillations and communications.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const C = (code, chapter = 'Oscillations and communications') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })

// Card areas in 11.2 (cm²).
const CARD_AREA = { small: 100, large: 400 }

export default [
  definePractical({
    id: 'phys-al-11-1', collection: C('11.1'), topic: 'Oscillations; power laws',
    title: 'Period of oscillation of a loaded steel blade',
    summary: 'Clamp a steel blade to the bench with a mass on its free end, find how the period depends on the vibrating length and use a log–log graph to find the power and the Young modulus of the steel.',
    aim: 'To investigate how the period of a loaded steel blade depends on its vibrating length, to find the power n in T ∝ Lⁿ and to estimate the Young modulus of the steel.',
    durationMin: 50,
    apparatus: ['steel_blade', 'g_clamp', 'slotted_masses', 'top_pan_balance', 'micrometer', 'digital_callipers', 'metre_rule', 'stopwatch'],
    safety: ['Wear eye protection: the blade or the mass can fly off if the clamp slips.', 'Cover the cutting edge of the blade with tape, and keep the amplitude small.'],
    procedure: [
      'Measure the width b of the blade with the callipers and its thickness d with the micrometer. Weigh the mass M that will be fixed to the end.',
      'Clamp the blade flat on the edge of the bench with the G-clamp and fix the mass firmly to its free end.',
      'Set the vibrating length L from the edge of the bench to the centre of the mass.',
      'Pull the end down by about 1 cm and release. Time 20 oscillations, twice.',
      'Repeat for lengths from 15 cm to 35 cm.',
      'If T = k Lⁿ, then lg T = n lg L + lg k. Plot lg(T / s) against lg(L / cm); the gradient is n.',
      'Read T at L = 25.0 cm from the line and use E = 4π² M L³ / (3 I T²), where I = b d³ / 12, to find the Young modulus.',
    ],
    controlled: 'the same blade and mass, the same clamp and small amplitude.',
    model: { kind: 'simplified', summary: 'The blade is a light cantilever of stiffness 3EI/L³ carrying a point mass M at its end, so T = 2π √(M L³ / (3EI)) and T ∝ L^1.5.',
      assumptions: ['The mass of the blade itself is ignored; in reality about a quarter of it moves with the end mass and makes long blades slightly slower.', 'The clamp is perfectly rigid; the effective length differs from L by up to ±0.2 cm because the edge of the clamp is not sharp.', 'The steel has E = 190–210 GPa; the blade is 12.4–12.8 mm wide and 0.60–0.68 mm thick.', 'Each timing of 20 oscillations has a random error of about ±0.1 s.'] },
    hidden: (q) => ({ E: q('E', 190, 210), b: q('b', 12.4, 12.8), d: q('d', 0.60, 0.68), M: q('M', 0.045, 0.060) }),
    constants: [
      { key: 'b', label: 'Width of blade', symbol: 'b', unit: 'mm', resolution: 0.01, instrument: 'digital_callipers', read: (p, n) => p.b + n(0.01) },
      { key: 'd', label: 'Thickness of blade', symbol: 'd', unit: 'mm', resolution: 0.01, instrument: 'micrometer', read: (p, n) => p.d + n(0.003) },
      { key: 'M', label: 'Mass on end of blade', symbol: 'M', unit: 'g', resolution: 0.1, instrument: 'top_pan_balance', read: (p) => p.M * 1000 },
    ],
    iv: { key: 'L', label: 'Vibrating length', symbol: 'L', unit: 'cm', min: 15, max: 35, step: 1, start: 15, instrument: 'metre_rule' },
    measures: [{ key: 't', label: 'Time for 20 oscillations', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch',
      read: (p, x, n) => {
        const I = (p.b / 1000) * (p.d / 1000) ** 3 / 12
        const L = (x + 0.2 * p.j('clamp')) / 100
        return 20 * 2 * Math.PI * Math.sqrt(p.M * L ** 3 / (3 * p.E * 1e9 * I)) + n(0.1)
      } }],
    repeats: 2,
    derived: [{ key: 'T', label: 'Period', symbol: 'T', unit: 's', decimals: 3, value: (r) => r.t / 20 }],
    graph: { x: 'L', tx: 'lg', y: 'T', ty: 'lg', fit: 'line' },
    results: [
      { id: 'n', prompt: 'Power n in T ∝ Lⁿ', unit: '', sig: 3, fromFit: (f) => f.m, truth: () => 1.5, tolOwn: { abs: 0.02 }, tolTrue: { abs: 0.1 } },
      { id: 'E', prompt: 'Young modulus of the steel', unit: 'GPa', sig: 3,
        fromFit: (f, c) => {
          const T = Math.pow(10, f.c + f.m * Math.log10(25))
          const I = (c.b / 1000) * (c.d / 1000) ** 3 / 12
          return 4 * Math.PI ** 2 * (c.M / 1000) * 0.25 ** 3 / (3 * I * T * T) / 1e9
        },
        truth: (p) => p.E, tolTrue: { rel: 0.08 } },
    ],
    questions: [
      { id: 'thick', type: 'choice', prompt: 'The thickness d has a percentage uncertainty of 1 %. What percentage uncertainty does this give in E?', options: ['3 %', '1 %', '0.33 %', '6 %'], correct: 0 },
      { id: 'bladeMass', type: 'text', prompt: 'The model ignores the mass of the blade. Explain how this would affect the period at the longest lengths.' },
    ],
  }),

  definePractical({
    id: 'phys-al-11-2', collection: C('11.2'), topic: 'Damped oscillations',
    title: 'Damped oscillations of a mass on a spring',
    summary: 'Attach a card to a mass on a spring, record how the amplitude dies away with time and find the damping constant from a graph of ln A against t, for two card sizes.',
    aim: 'To investigate how the amplitude of a damped oscillator decreases with time and how the damping depends on the area of the card.',
    durationMin: 45,
    apparatus: ['stand_clamp', 'spring', 'slotted_masses', 'card', 'metre_rule', 'stopwatch'],
    safety: ['Clamp the stand to the bench or weigh down its base so it cannot topple.', 'Keep feet clear of the masses and wear eye protection in case the spring or card comes loose.'],
    procedure: [
      'Hang a 200 g mass from the spring and tape a horizontal card to the bottom of the mass. Fix a metre rule vertically beside it with a pointer on the mass.',
      'Pull the mass down 10.0 cm from its rest position and release it, starting the stopwatch.',
      'At a chosen time t, note the amplitude A (the greatest distance of the pointer below the rest position). Release again from 10.0 cm for each new time, and take each reading twice.',
      'Repeat for times from 0 to 40 s, for the small card (100 cm²) and the large card (400 cm²).',
      'If A = A₀ e^(−λt), then ln A = ln A₀ − λt. Plot ln(A / cm) against t for each card; the gradient is −λ.',
    ],
    controlled: 'the same spring, mass and starting amplitude; card kept horizontal.',
    model: { kind: 'simplified', summary: 'The damping force is taken as proportional to velocity, with a constant proportional to the card area, so A = A₀ e^(−λt) with λ = λ₀ + k × (card area).',
      assumptions: ['Real air drag on a card is closer to proportional to v², which makes the decay faster than exponential at large amplitude; this is left out.', 'λ₀ = 0.004–0.006 s⁻¹ (damping inside the spring and on the mass alone); k = 1.0–1.4 × 10⁻⁴ s⁻¹ cm⁻².', 'The starting amplitude is 10.0 ± 0.2 cm; reading the amplitude of a moving pointer has a random error of about ±0.1 cm.'] },
    hidden: (q) => ({ l0: q('l0', 0.004, 0.006), k: q('k', 1.0e-4, 1.4e-4), A0: q('A0', 9.8, 10.2) }),
    settings: [{ key: 'card', label: 'Card', options: [{ value: 'small', label: 'Small card (100 cm²)' }, { value: 'large', label: 'Large card (400 cm²)' }], default: 'small' }],
    iv: { key: 't', label: 'Time after release', symbol: 't', unit: 's', min: 0, max: 40, step: 5, start: 0, instrument: 'stopwatch' },
    measures: [{ key: 'A', label: 'Amplitude', symbol: 'A', unit: 'cm', resolution: 0.1, instrument: 'metre_rule',
      read: (p, x, n, s) => p.A0 * Math.exp(-(p.l0 + p.k * CARD_AREA[s.card]) * x) + n(0.1) }],
    repeats: 2,
    graph: { x: 't', y: 'A', ty: 'ln', fit: 'line', seriesBy: 'card' },
    results: [
      { id: 'lamS', prompt: 'Damping constant λ with the small card', unit: 's⁻¹', sig: 3, series: 'small', fromFit: (f) => -f.m, truth: (p) => p.l0 + p.k * CARD_AREA.small, tolTrue: { rel: 0.1 } },
      { id: 'lamL', prompt: 'Damping constant λ with the large card', unit: 's⁻¹', sig: 3, series: 'large', fromFit: (f) => -f.m, truth: (p) => p.l0 + p.k * CARD_AREA.large, tolTrue: { rel: 0.1 } },
    ],
    questions: [
      { id: 'halfLife', type: 'choice', prompt: 'For exponential decay with constant λ, how long does the amplitude take to halve?', options: ['ln 2 / λ', '1 / λ', '2 / λ', 'λ / 2'], correct: 0 },
      { id: 'ratio', type: 'text', prompt: 'Compare the two values of λ. Does the damping appear to be proportional to the card area? Explain.' },
    ],
  }),

  definePractical({
    id: 'phys-al-11-3', collection: C('11.3'), topic: 'Simple harmonic motion; mass on a spring',
    title: 'Mass on a spring: period and mass',
    summary: 'Time the oscillations of a spring loaded with different masses and use a graph of T² against m to find the spring constant and the effective mass of the spring.',
    aim: 'To investigate how the period of a mass oscillating on a spring depends on the mass, and to determine the spring constant and the effective mass of the spring.',
    durationMin: 45,
    apparatus: ['stand_clamp', 'spring', 'slotted_masses', 'top_pan_balance', 'stopwatch'],
    safety: ['Clamp the stand to the bench or weigh down its base so it cannot topple.', 'Keep feet clear of the masses and wear eye protection in case the spring or masses come off.'],
    procedure: [
      'Weigh the spring and record its mass m_s.',
      'Hang the spring from the clamp and load it with a mass m (including the hanger).',
      'Pull the mass down about 2 cm and release. Use a fiducial mark at the rest position and time 20 oscillations. Repeat twice more.',
      'Repeat for masses from 50 g to 500 g; the small loads help fix the intercept.',
      'T² = (4π² / k)(m + m_e), where m_e is the effective mass of the spring. Plot T² against m (in kg).',
      'k = 4π² / gradient, and m_e = intercept / gradient. Compare m_e with m_s / 3.',
    ],
    controlled: 'the same spring; small amplitude; oscillations vertical with no swinging.',
    model: { kind: 'quantitative', summary: 'A spring obeying Hooke’s law gives simple harmonic motion with T = 2π √((m + m_s/3) / k); a third of the spring’s own mass acts as if it were attached to the load.',
      assumptions: ['The spring stays within its limit of proportionality and its coils do not touch.', 'The spring constant is 18–30 N m⁻¹ and the spring’s mass is 30–60 g.', 'Air resistance is negligible over 20 oscillations.', 'Each timing of 20 oscillations has a random error of about ±0.08 s.'] },
    hidden: (q) => ({ k: q('k', 18, 30), ms: q('ms', 0.030, 0.060) }),
    constants: [{ key: 'ms', label: 'Mass of spring', symbol: 'm_s', unit: 'g', resolution: 0.1, instrument: 'top_pan_balance', read: (p) => p.ms * 1000 }],
    iv: { key: 'm', label: 'Load', symbol: 'm', unit: 'g', min: 50, max: 500, step: 50, start: 50, instrument: 'slotted_masses' },
    measures: [{ key: 't', label: 'Time for 20 oscillations', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch',
      read: (p, x, n) => 20 * 2 * Math.PI * Math.sqrt((x / 1000 + p.ms / 3) / p.k) + n(0.08) }],
    repeats: 3,
    derived: [
      { key: 'mkg', label: 'Load', symbol: 'm', unit: 'kg', decimals: 3, value: (r) => r.m / 1000 },
      { key: 'T', label: 'Period', symbol: 'T', unit: 's', decimals: 3, value: (r) => r.t / 20 },
    ],
    graph: { x: 'mkg', y: 'T', ty: 'square', fit: 'line' },
    results: [
      { id: 'k', prompt: 'Spring constant', unit: 'N m⁻¹', sig: 3, fromFit: (f) => 4 * Math.PI ** 2 / f.m, truth: (p) => p.k, tolTrue: { rel: 0.05 } },
      { id: 'me', prompt: 'Effective mass of the spring', unit: 'g', sig: 2, fromFit: (f) => f.c / f.m * 1000, truth: (p) => p.ms / 3 * 1000, tolOwn: { abs: 0.6 }, tolTrue: { abs: 5 } },
    ],
    questions: [
      { id: 'quad', type: 'choice', prompt: 'The load is increased from 100 g to 400 g. Ignoring the mass of the spring, what happens to the period?', options: ['It doubles', 'It increases four times', 'It increases by √2', 'It halves'], correct: 0 },
      { id: 'fiducial', type: 'text', prompt: 'Why is it better to start and stop timing as the mass passes its rest position rather than at the top or bottom of an oscillation?' },
    ],
  }),

  definePractical({
    id: 'phys-al-11-4', collection: C('11.4'), topic: 'Communication; attenuation in a coaxial cable',
    title: 'Attenuation of a signal in a coaxial cable',
    summary: 'Send a 10 MHz signal through different lengths of coaxial cable, measure the output amplitude on an oscilloscope and find the attenuation per metre from a graph of ln V against l.',
    aim: 'To investigate how the amplitude of a signal decreases along a coaxial cable and to determine the attenuation per unit length in dB m⁻¹.',
    durationMin: 40,
    apparatus: ['signal_generator', 'coaxial_cable', 'oscilloscope', 'resistors', 'leads'],
    safety: ['Use only the low-voltage signal generator output; check the cables and plugs for damage before use.', 'Unreel the cable along the floor at the side of the room so that nobody trips over it.'],
    procedure: [
      'Set the signal generator to a 10 MHz sine wave of about 5 V amplitude. Connect the oscilloscope directly to the output and record the amplitude (cable length 0).',
      'Connect a length l of coaxial cable between the generator and the oscilloscope, terminated at the far end with a 50 Ω resistor so that the signal is not reflected.',
      'Record the amplitude V of the signal at the far end, using the largest trace that fits on the screen.',
      'Repeat for cable lengths up to 200 m, joining 20 m reels together.',
      'If V = V₀ e^(−αl), then ln V = ln V₀ − αl. Plot ln(V / V) against l. The gradient is −α, and the attenuation per metre is 20 α / ln 10 dB m⁻¹ = 8.69 α dB m⁻¹.',
    ],
    controlled: 'the same frequency and generator amplitude, the same type of cable, the same 50 Ω termination.',
    model: { kind: 'simplified', summary: 'Each metre of cable reduces the amplitude by the same fraction, so V = V₀ e^(−αl). Thin coaxial cable at 10 MHz loses 0.07–0.12 dB per metre.',
      assumptions: ['The cable is perfectly matched by the 50 Ω load, so there are no reflections; losses at the connectors between reels are ignored.', 'The output impedance of the generator is matched, so V₀ does not change with the length of cable.', 'Reading the amplitude on the oscilloscope screen has a random error of about ±1.5 %.'] },
    hidden: (q) => ({ adb: q('adb', 0.07, 0.12), V0: q('V0', 4.8, 5.2) }),
    iv: { key: 'l', label: 'Length of cable', symbol: 'l', unit: 'm', min: 0, max: 200, step: 20, start: 0, instrument: 'coaxial_cable' },
    measures: [{ key: 'V', label: 'Output amplitude', symbol: 'V', unit: 'V', resolution: 0.01, instrument: 'oscilloscope',
      read: (p, x, n) => p.V0 * Math.pow(10, -p.adb * x / 20) * (1 + n(0.015)) }],
    graph: { x: 'l', y: 'V', ty: 'ln', fit: 'line' },
    results: [{ id: 'adb', prompt: 'Attenuation per unit length', unit: 'dB m⁻¹', sig: 3, fromFit: (f) => -f.m * 20 / Math.LN10, truth: (p) => p.adb, tolTrue: { rel: 0.08 } }],
    questions: [
      { id: 'dB', type: 'choice', prompt: 'A signal of power 8.0 mW is attenuated by 30 dB. What is the output power?', options: ['8.0 μW', '0.27 mW', '80 μW', '0.80 μW'], correct: 0 },
      { id: 'repeaters', type: 'text', prompt: 'Explain why long-distance cable links need amplifiers (repeaters) at intervals, and why they are placed before the signal becomes comparable with the noise.' },
    ],
  }),
]
