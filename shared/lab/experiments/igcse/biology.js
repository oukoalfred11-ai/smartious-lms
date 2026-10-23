// IGCSE Biology practicals: photosynthesis, enzymes and diffusion.
// The topic list follows the practicals common to IGCSE and International
// GCSE courses; all procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'

const R = 8.314
const C = (code, chapter) => ({ id: 'igcse-biology', name: 'IGCSE Biology practicals', code, chapter })
const CUR = (topic) => [
  { board: 'Cambridge', level: 'IGCSE', subject: 'Biology', topic, syllabusRef: null, verified: false },
  { board: 'Pearson Edexcel', level: 'International GCSE', subject: 'Biology', topic, syllabusRef: null, verified: false },
]

// Relative activity of amylase at θ °C: faster collisions, until the enzyme denatures.
const activity = (p, th) => Math.exp(-p.Ea * 1000 / R * (1 / (th + 273.15) - 1 / 310.15)) / (1 + Math.exp((th - p.Tm) / p.w))
const amylaseTime = (p, th) => p.t37 * activity(p, 37) / activity(p, th)

export default [
  definePractical({
    id: 'bio-ig-1-1', subject: 'biology', collection: C('1.1', 'Plant nutrition'), topic: 'Photosynthesis: effect of light intensity',
    curriculum: CUR('Photosynthesis: effect of light intensity on the rate'), difficulty: 'IGCSE',
    title: 'Light intensity and photosynthesis', summary: 'Move a lamp away from pondweed, collect the oxygen it gives off in a capillary tube and find how the rate depends on the distance.',
    aim: 'To investigate how the distance of a light source affects the rate of photosynthesis of pondweed.',
    durationMin: 60,
    apparatus: ['pondweed', 'photosynthometer', 'bench_lamp', 'metre_rule', 'ruler_30cm', 'beaker_250', 'thermometer', 'stopwatch'],
    materials: ['Sodium hydrogencarbonate solution, 1 % (a supply of carbon dioxide)'],
    safety: ['Keep water away from the lamp and its plug, and dry your hands before touching the lamp.', 'The cut end of the pondweed is handled with forceps; wash your hands after the practical.'],
    procedure: [
      'Put the pondweed, cut end upwards, in the boiling tube of sodium hydrogencarbonate solution and connect the capillary tube above it.',
      'Stand a beaker of water between the lamp and the tube as a heat shield. Read the temperature of the water around the tube.',
      'Place the lamp 10 cm from the pondweed (measured with the metre rule). Let the plant adjust for 5 minutes in the dark room.',
      'Collect gas for 5 minutes, then draw the bubble into the scale part of the tube with the syringe and measure its length with the ruler.',
      'Repeat twice at each distance, then move the lamp further away in steps up to 30 cm.',
      'Calculate the rate as length per minute. Plot lg(rate) against lg(distance) and find the gradient.',
    ],
    controlled: 'the same piece of pondweed, the concentration of hydrogencarbonate, the temperature (heat shield), the collecting time and the room kept dark apart from the lamp.',
    model: { kind: 'simplified', summary: 'Light is the limiting factor at every distance used, and light intensity falls with the inverse square of the distance, so the rate ∝ 1/d².',
      assumptions: ['Carbon dioxide and temperature are not limiting; very close to a bright lamp light would stop being the limiting factor and the rate would level off.', 'All the gas collected is oxygen from photosynthesis; in reality some dissolves in the water and some nitrogen comes out of solution.', 'Each length has a random error of about ±0.04 cm, and the plant’s rate varies by a few per cent between runs.'] },
    hidden: (q) => ({ k: q('k', 600, 800), th: q('th', 21, 25) }),
    constants: [{ key: 'th', label: 'Temperature of the water around the tube', symbol: 'θ', unit: '°C', resolution: 0.5, instrument: 'thermometer', read: (p, n) => p.th + n(0.1) }],
    iv: { key: 'd', label: 'Distance from lamp to pondweed', symbol: 'd', unit: 'cm', min: 10, max: 30, step: 2, start: 10, instrument: 'bench_lamp' },
    repeats: 2,
    measures: [{ key: 'L', label: 'Length of gas bubble collected in 5 min', symbol: 'L', unit: 'cm', resolution: 0.1, instrument: 'ruler_30cm',
      read: (p, x, n) => p.k / (x * x) * (1 + 0.03 * p.j('L' + x)) + n(0.04) }],
    derived: [{ key: 'rate', label: 'Rate of gas production', symbol: 'r', unit: 'cm/min', decimals: 3, value: (r) => r.L / 5 }],
    graph: { x: 'd', tx: 'lg', y: 'rate', ty: 'lg', fit: 'line' },
    results: [{ id: 'n', prompt: 'Gradient of your graph of lg(rate) against lg(d)', unit: '', sig: 3, fromFit: (f) => f.m, truth: () => -2, tolOwn: { abs: 0.02 }, tolTrue: { abs: 0.25 } }],
    questions: [
      { id: 'shield', type: 'choice', prompt: 'Why is a beaker of water placed between the lamp and the pondweed?', options: ['To absorb heat from the lamp so the temperature stays the same', 'To give the plant more water', 'To focus the light onto the plant', 'To supply carbon dioxide'], correct: 0 },
      { id: 'inverse', type: 'choice', prompt: 'Your gradient is close to −2. What does this tell you?', options: ['The rate is proportional to 1/d², the same as the light intensity', 'The rate halves for every 2 cm the lamp is moved', 'The rate does not depend on the distance', 'The rate is proportional to d²'], correct: 0 },
      { id: 'limit', type: 'text', prompt: 'Explain what would happen to the rate if the lamp were moved much closer than 10 cm, using the idea of limiting factors.' },
    ],
  }),

  definePractical({
    id: 'bio-ig-2-1', subject: 'biology', collection: C('2.1', 'Enzymes'), topic: 'Enzymes: effect of temperature',
    curriculum: CUR('Enzymes: effect of temperature on enzyme activity'), difficulty: 'IGCSE',
    title: 'Temperature and amylase', summary: 'Mix starch and amylase at different temperatures, test drops with iodine every 10 seconds and find the optimum temperature of the enzyme.',
    aim: 'To investigate how temperature affects the rate at which amylase breaks down starch, and to find its optimum temperature.',
    durationMin: 60,
    apparatus: ['boiling_tube', 'spotting_tile', 'water_bath', 'thermometer', 'stopwatch', 'measuring_cylinder'],
    materials: ['Starch solution, 1 %', 'Amylase solution, 1 %', 'Iodine solution (in a dropper bottle)', 'pH 7 buffer solution'],
    safety: ['Wear eye protection: iodine solution irritates the eyes and stains skin and clothes.', 'Amylase can cause an allergic reaction: avoid skin contact and wipe up spills straight away.'],
    gogglesWhy: 'Iodine solution irritates the eyes, and enzyme solutions should not reach your eyes.',
    procedure: [
      'Put one drop of iodine solution in each well of the spotting tile.',
      'Measure 5 cm³ of starch solution and 1 cm³ of buffer into one boiling tube and 2 cm³ of amylase into another. Stand both in the water bath for 5 minutes and read the temperature θ.',
      'Pour the amylase into the starch, mix and start the stopwatch.',
      'Every 10 seconds put one drop of the mixture into the next well. Stop the stopwatch at the first drop that leaves the iodine orange-brown (no starch left).',
      'Repeat at water bath settings from 10 °C to 60 °C, with fresh solutions each time.',
      'Calculate the rate as 1/t. Plot the rate against temperature, join the points with a smooth curve and read the optimum temperature.',
    ],
    controlled: 'the volumes and concentrations of starch and amylase, the pH (buffer), the time between tests and the size of each drop.',
    model: { kind: 'simplified', summary: 'Below the optimum, a higher temperature gives more frequent, more energetic collisions between enzyme and starch; above it, the active site changes shape (the enzyme denatures) and the rate falls quickly.',
      assumptions: ['The collision effect follows an activation energy of 40–55 kJ/mol; half of the enzyme is denatured at 47–55 °C.', 'Testing every 10 seconds means each time is the first test with no starch left, so it can be up to 10 s longer than the true time.', 'Each run varies by a few seconds (mixing, drop size); the bath may differ from its setting by up to 0.6 °C.'] },
    hidden: (q) => ({ Ea: q('Ea', 40, 55), Tm: q('Tm', 47, 55), w: q('w', 2.5, 4), t37: q('t37', 70, 110) }),
    iv: { key: 'set', label: 'Water bath setting', symbol: 'θ_set', unit: '°C', min: 10, max: 60, step: 5, start: 10, instrument: 'water_bath' },
    measures: [
      { key: 'th', label: 'Temperature of the mixture', symbol: 'θ', unit: '°C', resolution: 0.5, instrument: 'thermometer', read: (p, x, n) => x + 0.6 * p.j('bath' + x) + n(0.1) },
      { key: 't', label: 'Time until no starch is left', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch',
        read: (p, x, n) => { const t = amylaseTime(p, x + 0.6 * p.j('bath' + x)) * (1 + 0.03 * p.j('t' + x)) + n(2); return 10 * Math.max(1, Math.ceil(t / 10)) } },
    ],
    derived: [{ key: 'rate', label: 'Rate of reaction', symbol: '1/t', unit: 's⁻¹', decimals: 4, value: (r) => 1 / r.t }],
    results: [{ id: 'opt', prompt: 'Optimum temperature from your results', unit: '°C', sig: 2,
      fromConsts: (c, gs) => { const g = gs.filter(x => Number.isFinite(x.row.rate)).sort((a, b) => b.row.rate - a.row.rate)[0]; return g ? g.row.th : null },
      truth: (p) => { let best = 10, bt = Infinity; for (let th = 10; th <= 60; th += 0.1) { const t = amylaseTime(p, th); if (t < bt) { bt = t; best = th } } return best },
      tolOwn: { abs: 0.6 }, tolTrue: { abs: 7 } }],
    questions: [
      { id: 'denature', type: 'choice', prompt: 'Why is the rate so low at 60 °C?', options: ['The active site has changed shape, so starch no longer fits (the enzyme is denatured)', 'The enzyme has been killed', 'The starch molecules move too fast to react', 'The iodine stops working when it is warm'], correct: 0 },
      { id: 'cold', type: 'choice', prompt: 'The tube at 10 °C is warmed to 37 °C and the amylase starts working quickly again. Why?', options: ['At low temperature the enzyme was only slowed down, not denatured', 'Warming makes new enzyme', 'The starch was denatured at 10 °C', 'The buffer was used up at 10 °C'], correct: 0 },
      { id: 'precision', type: 'text', prompt: 'Your optimum can only be found to the nearest few degrees. Explain why, and describe how you would find it more precisely.' },
    ],
  }),

  definePractical({
    id: 'bio-ig-3-1', subject: 'biology', collection: C('3.1', 'Movement into and out of cells'), topic: 'Diffusion: surface area to volume ratio',
    curriculum: CUR('Diffusion: effect of surface area to volume ratio'), difficulty: 'IGCSE',
    title: 'Diffusion into agar cubes', summary: 'Cut cubes of pink indicator agar, put them in acid and time how long each takes to turn colourless, to see why size matters for diffusion.',
    aim: 'To investigate how the size of an agar cube, and so its surface area to volume ratio, affects the time taken for acid to diffuse to its centre.',
    durationMin: 50,
    apparatus: ['agar_blocks', 'ruler_30cm', 'beaker_250', 'stopwatch'],
    materials: ['Agar with phenolphthalein and sodium hydroxide (pink)', 'Dilute hydrochloric acid, 1 mol/dm³'],
    safety: ['Wear eye protection: the acid can splash.', 'Cut away from your fingers on the tile, and keep the scalpel in its holder when not in use.'],
    gogglesWhy: 'Hydrochloric acid can splash into your eyes.',
    procedure: [
      'Cut a cube of agar with the scalpel, measuring each side with the ruler. Start with the largest cube (2.0 cm).',
      'Put the cube in a beaker of acid, deep enough to cover it, and start the stopwatch.',
      'Stop the stopwatch when the whole cube has turned colourless.',
      'Repeat with fresh acid for cubes of side 0.5 cm to 2.0 cm, two cubes of each size.',
      'Calculate the surface area to volume ratio (6/L) for each size. Plot t against L².',
    ],
    controlled: 'the concentration and temperature of the acid, the volume of acid, the same batch of agar, and the cubes left undisturbed.',
    model: { kind: 'simplified', summary: 'The time for acid to diffuse to the centre of a cube is proportional to the square of the distance it travels (half the side), so t ∝ L².',
      assumptions: ['The acid diffuses in from all six faces at the same rate; corners clear first and the last pink is at the centre.', 'Cubes are cut to within a few per cent of the intended size.', 'Judging the moment the last pink disappears adds a random error of about ±5 s.'] },
    hidden: (q) => ({ K: q('K', 230, 320) }),
    iv: { key: 'L', label: 'Side of cube', symbol: 'L', unit: 'cm', min: 0.5, max: 2, step: 0.25, start: 2, instrument: 'agar_blocks' },
    repeats: 2,
    measures: [{ key: 't', label: 'Time to turn colourless', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch',
      read: (p, x, n) => p.K * x * x * (1 + 0.04 * p.j('c' + x)) + n(5) }],
    derived: [{ key: 'sav', label: 'Surface area : volume ratio', symbol: 'SA:V', unit: 'cm⁻¹', decimals: 1, value: (r) => 6 / r.L }],
    graph: { x: 'L', tx: 'square', y: 't', fit: 'origin' },
    results: [{ id: 'K', prompt: 'Time for a 1 cm cube to turn colourless, from your gradient', unit: 's', sig: 3, fromFit: (f) => f.m, truth: (p) => p.K, tolTrue: { rel: 0.08 } }],
    questions: [
      { id: 'sav', type: 'choice', prompt: 'As the cube gets bigger, what happens to its surface area to volume ratio?', options: ['It gets smaller, so each cm³ of agar has less surface for acid to enter', 'It gets bigger', 'It stays the same, because all the cubes are the same shape', 'It depends on the acid'], correct: 0 },
      { id: 'organism', type: 'text', prompt: 'Use your results to explain why large animals need lungs and a blood system, but a single-celled organism does not.' },
    ],
  }),
]
