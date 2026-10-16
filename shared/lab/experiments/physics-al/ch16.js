// AS & A Level Physics practicals, chapter 16: quantum physics, nuclear
// physics and medical imaging.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const C = (code, chapter = 'Quantum physics, nuclear physics and medical imaging') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })
const H = 6.626e-34, E_CH = 1.602e-19, C_LIGHT = 2.998e8
const PA_HALF = 70.2 // s: half-life of protactinium-234m
const GAMMA_P = 2.675e8 // rad s⁻¹ T⁻¹: gyromagnetic ratio of the proton

// Counting noise: Poisson for small means, normal approximation for large ones.
function poisson(n, mu) {
  if (mu >= 25) return Math.max(0, Math.round(mu + Math.sqrt(mu) * n(1)))
  const L = Math.exp(-mu)
  let k = 0, prod = n.u(0, 1)
  while (prod > L) { k++; prod *= n.u(0, 1) }
  return k
}

export default [
  definePractical({
    id: 'phys-al-16-1', collection: C('16.1'), topic: 'Photons; the Planck constant',
    title: 'Planck constant from LEDs', summary: 'Find the voltage at which each of a set of LEDs just starts to glow and use a graph against 1/λ to estimate the Planck constant.',
    aim: 'To determine the Planck constant from the threshold voltages of LEDs of different wavelengths.',
    durationMin: 45, difficulty: 'A Level',
    apparatus: ['leds', 'dc_supply', 'rheostat', 'resistors', 'voltmeter', 'switch', 'leads'],
    safety: ['Always keep the protective resistor in series with the LED, or the LED will burn out.', 'Do not stare into a brightly lit LED at close range.'],
    procedure: [
      'Connect the rheostat as a potential divider across the supply, and connect the LED with a protective resistor to its output. Connect the voltmeter directly across the LED.',
      'Note the peak wavelength λ of the LED from its data. Look down a short black tube at the LED to cut out room light.',
      'Increase the voltage slowly from zero and record the voltage V at which the LED just begins to glow.',
      'Repeat three times for each LED, approaching from below each time.',
      'Repeat for each LED in the set, with wavelengths from 450 nm to 650 nm.',
      'The photon energy is about eV, so V = (hc/e)(1/λ) − constant. Plot V against 1/λ; then h = e × gradient / c.',
    ],
    controlled: 'the same protective resistor and the same judgement of “just glowing”, in the same dim light.',
    model: { kind: 'simplified', summary: 'An electron crossing the LED junction gives up energy eV as a photon of energy hc/λ, less an energy that is taken to be the same for every LED, so V = hc/(eλ) − V_off.',
      assumptions: ['Real LEDs emit a band of wavelengths and their threshold depends on the material, so the constant offset is a simplification.', 'Each LED differs from the model by a fixed amount of up to ±0.02 V; V_off is 0.05–0.20 V.', 'Judging when the LED just glows gives a random error of about ±0.015 V.'] },
    hidden: (q) => ({ Voff: q('Voff', 0.05, 0.20) }),
    iv: { key: 'lam', label: 'Wavelength of LED', symbol: 'λ', unit: 'nm', min: 450, max: 650, step: 25, start: 450, instrument: 'leds' },
    measures: [{ key: 'V', label: 'Threshold voltage', symbol: 'V', unit: 'V', resolution: 0.01, instrument: 'voltmeter',
      read: (p, x, n) => H * C_LIGHT / (E_CH * x * 1e-9) - p.Voff + 0.02 * p.j('led' + x) + n(0.015) }],
    repeats: 3,
    graph: { x: 'lam', tx: 'reciprocal', y: 'V', fit: 'line' },
    results: [{ id: 'h', prompt: 'Planck constant', unit: 'J s', sig: 3, fromFit: (f) => E_CH * f.m * 1e-9 / C_LIGHT, truth: () => H, tolTrue: { rel: 0.10 } }],
    questions: [
      { id: 'blue', type: 'choice', prompt: 'Which LED needs the largest voltage to light?', options: ['Blue, because its photons have the most energy', 'Red, because red light has the longest wavelength', 'All need the same voltage', 'Green, because the eye is most sensitive to green'], correct: 0 },
      { id: 'judge', type: 'text', prompt: 'Explain why judging the “just glowing” point is the largest source of uncertainty, and suggest a more objective way to find the threshold voltage.' },
    ],
  }),

  definePractical({
    id: 'phys-al-16-2', collection: C('16.2'), topic: 'Radioactive decay; decay constant and half-life',
    title: 'Decay constant of protactinium', summary: 'Count the beta radiation from a protactinium generator at intervals, correct for background and use a log graph to find the decay constant and half-life.',
    aim: 'To determine the decay constant and half-life of protactinium-234m.',
    durationMin: 40, difficulty: 'A Level',
    apparatus: ['gm_tube', 'stopwatch', 'stand_clamp'],
    safety: ['The protactinium generator is a sealed bottle handled ONLY by the teacher, with tongs, over a tray. Students do not touch it.', 'Stand at least 1 m away except when reading the counter, and do not eat or drink in the laboratory.', 'If the bottle leaks, keep clear and tell the teacher at once. Wash hands after the lesson.'],
    procedure: [
      'With no source present, count the background for 100 s and record the count.',
      'The teacher shakes the generator so that the protactinium collects in the upper liquid layer, then places it in front of the clamped GM tube.',
      'Starting the stopwatch at that moment (t = 0), record the count in the 20 s interval starting at each time t, every 20 s up to 200 s (a counter that can be read and restarted without stopping, or a data logger, makes this easier).',
      'Subtract the background count for 20 s (one fifth of the 100 s count) from each count to get the corrected count.',
      'Plot ln(corrected count) against t. The gradient is −λ; the half-life is ln 2 / λ.',
    ],
    controlled: 'the same distance between the source and the GM tube, and the same counting interval.',
    model: { kind: 'quantitative', summary: 'The count in each interval is proportional to the activity, which falls as e^(−λt) with λ = ln 2 / 70.2 s for protactinium-234m. Counts follow Poisson statistics.',
      assumptions: ['Decays of the parent uranium in the lower layer and of protactinium left behind are ignored.', 'The dead time of the GM tube is ignored (it loses under 1 % at these rates).', 'The initial count rate is 50–80 s⁻¹ and the background 0.3–0.6 s⁻¹.', 'Random counting error is √N for a count of N.'] },
    hidden: (q) => ({ A0: q('A0', 50, 80), bg: q('bg', 0.3, 0.6) }),
    constants: [{ key: 'Nb', label: 'Background count in 100 s', symbol: 'N_b', unit: 'counts', resolution: 1, instrument: 'gm_tube', read: (p, n) => poisson(n, p.bg * 100) }],
    iv: { key: 't', label: 'Time since source placed', symbol: 't', unit: 's', min: 0, max: 200, step: 20, start: 0, instrument: 'stopwatch', monotonic: true },
    measures: [{ key: 'N', label: 'Count in 20 s', symbol: 'N', unit: 'counts', resolution: 1, instrument: 'gm_tube',
      read: (p, x, n) => { const l = Math.LN2 / PA_HALF; return poisson(n, p.A0 * (1 - Math.exp(-l * 20)) / l * Math.exp(-l * x) + p.bg * 20) } }],
    derived: [{ key: 'Nc', label: 'Corrected count in 20 s', symbol: 'N_c', unit: 'counts', decimals: 1, value: (r, c) => r.N - c.Nb / 5 }],
    graph: { x: 't', y: 'Nc', ty: 'ln', fit: 'line' },
    results: [
      { id: 'lam', prompt: 'Decay constant', unit: 's⁻¹', sig: 3, fromFit: (f) => -f.m, truth: () => Math.LN2 / PA_HALF, tolTrue: { rel: 0.10 } },
      { id: 'half', prompt: 'Half-life', unit: 's', sig: 3, fromFit: (f) => Math.LN2 / -f.m, truth: () => PA_HALF, tolTrue: { rel: 0.10 } },
    ],
    questions: [
      { id: 'scatter', type: 'choice', prompt: 'Why are the points at later times more scattered about the line?', options: ['The counts are smaller, so the random √N error is a larger fraction of each count', 'The GM tube warms up', 'The half-life gets longer as the source decays', 'The background radiation increases with time'], correct: 0 },
      { id: 'interval', type: 'text', prompt: 'Explain why the counting interval must be short compared with the half-life, and why it must not be too short.' },
    ],
  }),

  definePractical({
    id: 'phys-al-16-3', collection: C('16.3'), topic: 'X-ray attenuation; half-value thickness',
    title: 'Attenuation of an X-ray beam', summary: 'A simulation of a hospital or industry measurement: find how the intensity of a narrow X-ray beam falls through layers of metal, and find the attenuation coefficient and half-value thickness.',
    aim: 'To determine the linear attenuation coefficient and the half-value thickness of copper for a narrow beam of X-rays.',
    durationMin: 35, difficulty: 'A Level',
    apparatus: ['copper_plate', 'micrometer', 'gm_tube'],
    safety: ['This is a simulation only. Schools do not use X-ray sets: X-rays are ionising radiation and real measurements are made in shielded hospital or industrial rooms by trained staff.', 'In a real facility the beam is switched off before absorbers are changed, and staff stay behind shielding and wear dosimeters.'],
    procedure: [
      'Measure the thickness d₁ of one copper sheet with the micrometer.',
      'With no absorber, record the count from the detector in 10 s with the (simulated) narrow, collimated beam on.',
      'Add copper sheets one at a time between the beam and the detector, recording the count in 10 s for each number of sheets up to 10.',
      'Calculate the total thickness x = n d₁ and the count rate I = count / 10 s.',
      'Since I = I₀e^(−μx), plot ln I against x. The gradient is −μ; the half-value thickness is ln 2 / μ.',
    ],
    controlled: 'the same beam settings (voltage and tube current), the same detector position, sheets placed flat across the beam.',
    model: { kind: 'simplified', summary: 'A narrow beam of X-rays of a single energy is attenuated exponentially, I = I₀e^(−μx). Counts follow Poisson statistics.',
      assumptions: ['Real X-ray beams contain a range of energies and become harder (more penetrating) as they pass through metal; this beam hardening is left out.', 'Scattered X-rays do not reach the detector, and its dead time and the background are negligible.', 'μ is 0.35–0.70 mm⁻¹ (copper at roughly 80–100 keV); I₀ is 1500–2500 s⁻¹.', 'Each sheet is 0.48–0.52 mm thick; random counting error is √N.'] },
    hidden: (q) => ({ mu: q('mu', 0.35, 0.70), I0: q('I0', 1500, 2500), d1: q('d1', 0.48, 0.52) }),
    constants: [{ key: 'd1', label: 'Thickness of one sheet', symbol: 'd₁', unit: 'mm', resolution: 0.01, instrument: 'micrometer', read: (p, n) => p.d1 + n(0.003) }],
    iv: { key: 'n', label: 'Number of copper sheets', symbol: 'n', unit: '', min: 0, max: 10, step: 1, start: 0, instrument: 'copper_plate' },
    measures: [{ key: 'N', label: 'Count in 10 s', symbol: 'N', unit: 'counts', resolution: 1, instrument: 'gm_tube', read: (p, x, n) => poisson(n, p.I0 * 10 * Math.exp(-p.mu * x * p.d1)) }],
    derived: [
      { key: 'x', label: 'Total thickness', symbol: 'x', unit: 'mm', decimals: 2, value: (r, c) => r.n * c.d1 },
      { key: 'I', label: 'Count rate', symbol: 'I', unit: 's⁻¹', decimals: 1, value: (r) => r.N / 10 },
    ],
    graph: { x: 'x', y: 'I', ty: 'ln', fit: 'line' },
    results: [
      { id: 'mu', prompt: 'Linear attenuation coefficient of copper', unit: 'mm⁻¹', sig: 3, fromFit: (f) => -f.m, truth: (p) => p.mu, tolTrue: { rel: 0.06 } },
      { id: 'hvt', prompt: 'Half-value thickness of copper', unit: 'mm', sig: 3, fromFit: (f) => Math.LN2 / -f.m, truth: (p) => Math.LN2 / p.mu, tolTrue: { rel: 0.06 } },
    ],
    questions: [
      { id: 'contrast', type: 'choice', prompt: 'Bone shows up clearly on an X-ray image of the arm because…', options: ['bone has a much larger attenuation coefficient than soft tissue', 'bone emits X-rays when the beam hits it', 'soft tissue reflects X-rays back to the tube', 'bone is thicker than all the soft tissue around it'], correct: 0 },
      { id: 'hardening', type: 'text', prompt: 'Explain why, for a real X-ray beam with a spread of energies, the second half-value thickness is larger than the first.' },
    ],
  }),

  definePractical({
    id: 'phys-al-16-4', collection: C('16.4'), topic: 'Magnetic resonance imaging; Larmor frequency',
    title: 'Larmor frequency of protons', summary: 'A simulation of the principle behind MRI: find the resonant frequency of protons in water for different magnetic flux densities and determine the gyromagnetic ratio.',
    aim: 'To investigate how the Larmor (resonant) frequency of protons depends on the magnetic flux density and to determine the gyromagnetic ratio of the proton.',
    durationMin: 40, difficulty: 'A Level',
    apparatus: ['helmholtz_coils', 'dc_supply', 'rheostat', 'ammeter', 'hall_probe', 'signal_generator', 'oscilloscope', 'coil', 'leads'],
    safety: ['This is a simulation of the principle of MRI. Real MRI scanners use fields of over 1 T: steel objects can be pulled in violently, and people with pacemakers or metal implants must not enter the room.', 'In this low-field arrangement the Helmholtz coils warm up: switch off between readings.'],
    procedure: [
      'Place a sample of water inside a small radio-frequency coil at the centre of the Helmholtz coils. Connect the RF coil to the signal generator and the detector output to the oscilloscope.',
      'Connect the Helmholtz coils in series with the supply, rheostat and ammeter. Set a current I.',
      'Measure the flux density B at the sample position with the Hall probe (zeroed with the coils off).',
      'Sweep the signal generator frequency slowly and record the frequency f at which the absorption signal on the oscilloscope is largest.',
      'Repeat for coil currents from 0.5 A to 2.5 A.',
      'Plot f against B. The Larmor relation f = γB/(2π) gives γ = 2π × gradient.',
    ],
    controlled: 'the same water sample at the centre of the coils, the same RF coil and amplitude.',
    model: { kind: 'simplified', summary: 'Protons in a field B precess at the Larmor frequency f = γB/(2π), with γ = 2.675 × 10⁸ rad s⁻¹ T⁻¹. Energy is absorbed from the RF field only near this frequency.',
      assumptions: ['The field is uniform over the sample; a real MRI magnet is far stronger and the signal far weaker at these low fields, so the readings are simulated.', 'Chemical shifts and the Earth’s field are ignored; the Hall probe may have a zero error of up to ±0.02 mT.', 'The coils give 1.8–2.4 mT per ampere.', 'The resonance is read to about ±0.3 kHz (line width) and B to about ±0.005 mT.'] },
    hidden: (q) => ({ k: q('k', 1.8, 2.4), z: q('z', -0.02, 0.02) }),
    iv: { key: 'I', label: 'Current in Helmholtz coils', symbol: 'I', unit: 'A', min: 0.5, max: 2.5, step: 0.25, start: 0.5, instrument: 'ammeter' },
    measures: [
      { key: 'B', label: 'Flux density at sample', symbol: 'B', unit: 'mT', resolution: 0.01, instrument: 'hall_probe', read: (p, x, n) => p.k * x + p.z + n(0.005) },
      { key: 'f', label: 'Resonant frequency', symbol: 'f', unit: 'kHz', resolution: 0.1, instrument: 'signal_generator', read: (p, x, n) => GAMMA_P / (2 * Math.PI) * p.k * x * 1e-6 + n(0.3) },
    ],
    graph: { x: 'B', y: 'f', fit: 'line' },
    results: [{ id: 'gamma', prompt: 'Gyromagnetic ratio of the proton', unit: 'rad s⁻¹ T⁻¹', sig: 3, fromFit: (f) => 2 * Math.PI * f.m * 1e6, truth: () => GAMMA_P, tolTrue: { rel: 0.05 } }],
    questions: [
      { id: 'double', type: 'choice', prompt: 'In an MRI scanner the field is doubled. What happens to the Larmor frequency of the protons?', options: ['It doubles', 'It halves', 'It stays the same', 'It increases by a factor of four'], correct: 0 },
      { id: 'gradient', type: 'text', prompt: 'Explain how an MRI scanner uses a field gradient to locate where in the body a signal comes from.' },
    ],
  }),
]
