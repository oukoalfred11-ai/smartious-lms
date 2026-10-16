// AS & A Level Physics practicals, chapter 8: waves.
// Procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const G = 9.81
const C = (code, chapter = 'Waves') => ({ id: 'al-physics', name: 'AS & A Level Physics practicals', code, chapter })

export default [
  definePractical({
    id: 'phys-al-8-1', collection: C('8.1'), topic: 'Stationary waves; speed of a transverse wave',
    title: 'Stationary waves on a wire carrying a current', summary: 'Drive a tensioned wire with an alternating current in a magnetic field, find the fundamental resonant frequency for different lengths and deduce the wave speed and the mass per unit length.',
    aim: 'To investigate how the fundamental frequency of a stretched wire depends on its vibrating length, and to find the speed of transverse waves on the wire and its mass per unit length.',
    durationMin: 50,
    apparatus: ['steel_wire', 'knife_edge', 'pulley', 'slotted_masses', 'magnets', 'signal_generator', 'metre_rule', 'leads'],
    safety: [
      'Wear eye protection: a tensioned wire can snap.',
      'Keep feet clear of the hanging masses and put a tray of sand beneath them.',
      'Keep the current small (signal generator on its low-impedance output, below about 1 A) so the wire does not get hot.',
    ],
    procedure: [
      'Clamp one end of the wire to the bench, pass it over the pulley at the other end and hang a load from it. Record the mass M of the load.',
      'Place the two knife-edge bridges under the wire, a distance l apart, and put the magnets on their yoke halfway between them so the field is at right angles to the wire.',
      'Connect the signal generator across the ends of the wire. Slowly increase the frequency from low values until the wire vibrates with the largest amplitude in a single loop. Record this frequency f.',
      'Approach the resonance again from above and record f a second time.',
      'Repeat for lengths from 30 cm to 90 cm, keeping the magnets at the centre each time.',
      'Plot f against 1/l. The line through the origin has gradient v / 2, where v is the speed of transverse waves.',
      'Calculate the tension T = Mg and the mass per unit length μ = T / v².',
    ],
    controlled: 'the same wire and load (tension), the magnets always at the midpoint (an antinode), the same current.',
    model: { kind: 'simplified', summary: 'The fundamental has a node at each bridge, so λ = 2l and f = v / (2l), with v = √(T / μ).',
      assumptions: [
        'The wire is perfectly flexible: its bending stiffness, friction at the pulley and any stretching of the wire are ignored.',
        'The bridges define the ends of the vibrating length exactly.',
        'Judging the largest vibration by eye gives a random error of about ±1.5 % in f.',
      ] },
    hidden: (q) => ({ mu: q('mu', 0.35, 0.60), M: q.pick('M', [300, 400, 500]) }),
    constants: [{ key: 'M', label: 'Mass of load', symbol: 'M', unit: 'g', resolution: 1, instrument: 'slotted_masses', read: (p) => p.M }],
    iv: { key: 'l', label: 'Length between bridges', symbol: 'l', unit: 'cm', min: 30, max: 90, step: 5, start: 30, instrument: 'metre_rule' },
    measures: [{ key: 'f', label: 'Resonant frequency', symbol: 'f', unit: 'Hz', resolution: 1, instrument: 'signal_generator',
      read: (p, x, n) => Math.sqrt(p.M / 1000 * G / (p.mu / 1000)) / (2 * x / 100) * (1 + n(0.015)) }],
    repeats: 2,
    graph: { x: 'l', tx: 'reciprocal', y: 'f', fit: 'origin' },
    results: [
      { id: 'v', prompt: 'Speed of transverse waves on the wire', unit: 'm s⁻¹', sig: 3, fromFit: (f) => 2 * f.m / 100, truth: (p) => Math.sqrt(p.M / 1000 * G / (p.mu / 1000)), tolTrue: { rel: 0.05 } },
      { id: 'mu', prompt: 'Mass per unit length of the wire', unit: 'g m⁻¹', sig: 3, fromFit: (f, c) => c.M / 1000 * G / (2 * f.m / 100) ** 2 * 1000, truth: (p) => p.mu, tolTrue: { rel: 0.1 } },
    ],
    questions: [
      { id: 'magnet', type: 'choice', prompt: 'Why are the magnets placed halfway between the bridges?', options: ['The fundamental has an antinode there, so the force drives the largest vibration', 'The fundamental has a node there, so the wire stays still', 'It keeps the tension in the wire constant'], correct: 0 },
      { id: 'force', type: 'text', prompt: 'Explain why an alternating current in the magnetic field makes the wire vibrate, and why the wire only vibrates strongly at certain frequencies.' },
    ],
  }),

  definePractical({
    id: 'phys-al-8-2', collection: C('8.2'), topic: 'Intensity; inverse-square law',
    title: 'Inverse-square law for light from a small lamp', summary: 'Measure the illuminance from a small lamp at different distances and test whether it falls off as 1/d², allowing for background light.',
    aim: 'To show that the intensity of light from a point source varies as 1/d² and to find the background illuminance and the strength of the source.',
    durationMin: 35,
    apparatus: ['lamp_point', 'dc_supply', 'light_meter', 'metre_rule', 'leads'],
    safety: ['The lamp gets hot: do not touch it while it is on.', 'With the room darkened, keep bags and stools out of the way.'],
    procedure: [
      'Darken the room as far as possible. Set the lamp on the bench with its filament at the zero of a metre rule.',
      'With the lamp switched off, note the reading of the light meter: this is roughly the background light.',
      'Switch the lamp on. Place the light meter sensor facing the lamp at d = 20 cm and record the illuminance E. Move the sensor away, set it back to the same distance and take a second reading.',
      'Repeat at larger distances up to 100 cm, keeping the sensor square-on to the lamp.',
      'Plot E against 1/d². The gradient is the luminous intensity of the lamp (in lux m², i.e. candela) and the intercept is the background illuminance.',
    ],
    controlled: 'the same lamp at the same p.d., the room lighting unchanged, the sensor facing the lamp.',
    model: { kind: 'simplified', summary: 'The light spreads out equally in all directions, so E = I_v / d² + B, where I_v is the luminous intensity and B the steady background.',
      assumptions: [
        'The filament is small enough to be a point source at these distances, and nothing reflects extra light onto the sensor.',
        'Luminous intensity 15–40 cd; background 5–20 lux.',
        'The sensor sits in a holder that slides along the rule, so its distance is uncertain by about ±0.1 cm; the meter has a random error of about ±0.5 % plus ±1 lux.',
      ] },
    hidden: (q) => ({ I: q('I', 15, 40), B: q('B', 5, 20) }),
    iv: { key: 'd', label: 'Distance from lamp', symbol: 'd', unit: 'm', min: 0.20, max: 1.00, step: 0.05, start: 0.20, instrument: 'metre_rule' },
    measures: [{ key: 'E', label: 'Illuminance', symbol: 'E', unit: 'lux', resolution: 1, instrument: 'light_meter',
      read: (p, x, n) => (p.I / (x + n(0.001)) ** 2) * (1 + n(0.005)) + p.B + n(1) }],
    repeats: 2,
    derived: [{ key: 'invd2', label: 'Inverse square of distance', symbol: '1/d²', unit: 'm⁻²', decimals: 2, value: (r) => 1 / (r.d * r.d) }],
    graph: { x: 'invd2', y: 'E', fit: 'line' },
    results: [
      { id: 'Iv', prompt: 'Luminous intensity of the lamp', unit: 'cd', sig: 3, fromFit: (f) => f.m, truth: (p) => p.I, tolTrue: { rel: 0.05 } },
      { id: 'B', prompt: 'Background illuminance', unit: 'lux', sig: 2, fromFit: (f) => f.c, truth: (p) => p.B, tolOwn: { abs: 0.5 }, tolTrue: { abs: 5 } },
    ],
    questions: [
      { id: 'half', type: 'choice', prompt: 'If the background were removed, how would E change when the distance from the lamp is doubled?', options: ['It would fall to one quarter', 'It would fall to one half', 'It would not change'], correct: 0 },
      { id: 'close', type: 'text', prompt: 'Explain why the inverse-square law would not fit well for readings taken very close to the lamp.' },
    ],
  }),

  definePractical({
    id: 'phys-al-8-3', collection: C('8.3'), topic: 'Refraction; converging lens',
    title: 'Focal length of a converging lens', summary: 'Form sharp images of an illuminated object on a screen, measure object and image distances and find the focal length from a graph of 1/v against 1/u.',
    aim: 'To determine the focal length of a converging lens from measurements of object and image distances.',
    durationMin: 40,
    apparatus: ['ray_box', 'lens', 'screen', 'metre_rule'],
    safety: ['The lamp housing becomes hot; handle it by its base.', 'Never look at the Sun or a bright lamp through the lens.'],
    procedure: [
      'Set up the illuminated object, the lens and the screen in a straight line along the metre rule, in a dimmed room.',
      'Place the lens a distance u from the object.',
      'Move the screen until the image is as sharp as you can judge. Measure the image distance v from the centre of the lens to the screen.',
      'Move the screen away and find the sharp image again two more times; use the mean of the three values of v.',
      'Repeat for object distances from 25 cm to 60 cm.',
      'Plot 1/v against 1/u. The intercept on the 1/v axis is 1/f (and the gradient should be close to −1).',
    ],
    controlled: 'the same lens and object, distances measured from the centre of the lens, the lens and screen kept at right angles to the rule.',
    model: { kind: 'quantitative', summary: 'For a thin converging lens 1/u + 1/v = 1/f (real-is-positive convention).',
      assumptions: [
        'The lens is thin, so u and v can both be measured from its centre.',
        'The focal length is between 10 and 15 cm.',
        'Judging the sharpest image by eye gives a random error in v of about ±(0.2 cm + 2 % of v), larger for distant images; u is set to ±0.1 cm.',
      ] },
    hidden: (q) => ({ f: q('f', 10, 15) }),
    iv: { key: 'u', label: 'Object distance', symbol: 'u', unit: 'cm', min: 25, max: 60, step: 1, start: 25, instrument: 'metre_rule' },
    measures: [{ key: 'v', label: 'Image distance', symbol: 'v', unit: 'cm', resolution: 0.1, instrument: 'metre_rule',
      read: (p, x, n) => { const u = x + 0.1 * p.j('u' + x); const v = u * p.f / (u - p.f); return v + n(0.2 + 0.02 * v) } }],
    repeats: 3,
    graph: { x: 'u', tx: 'reciprocal', y: 'v', ty: 'reciprocal', fit: 'line' },
    results: [{ id: 'f', prompt: 'Focal length of the lens', unit: 'cm', sig: 3, fromFit: (f) => 1 / f.c, truth: (p) => p.f, tolTrue: { rel: 0.06 } }],
    questions: [
      { id: 'grad', type: 'choice', prompt: 'What gradient should the graph of 1/v against 1/u have?', options: ['−1', '+1', '1/f'], correct: 0 },
      { id: 'sharp', type: 'text', prompt: 'Explain why the image distance is the least precise measurement, and why it is less precise for small object distances.' },
    ],
  }),
]
