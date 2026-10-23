// IGCSE Chemistry practicals: rates of reaction and energy from fuels.
// The topic list follows the practicals common to IGCSE and International
// GCSE courses; all procedures, models and wording are Smartious's own.
import { definePractical } from '../../practical.js'
import { linearFit } from '../../science/numeric.js'

const R = 8.314
const C = (code, chapter) => ({ id: 'igcse-chemistry', name: 'IGCSE Chemistry practicals', code, chapter })
const CUR = (topic) => [
  { board: 'Cambridge', level: 'IGCSE', subject: 'Chemistry', topic, syllabusRef: null, verified: false },
  { board: 'Pearson Edexcel', level: 'International GCSE', subject: 'Chemistry', topic, syllabusRef: null, verified: false },
]
const STOCK = 40      // g/dm³ of sodium thiosulfate in the stock bottle
const TOTAL = 50      // cm³ in the flask before the acid is added

// Time for the cross to disappear at temperature θ, for the temperature practical.
const thioTime = (p, th) => p.t40 * Math.exp(p.Ea * 1000 / R * (1 / (th + 273.15) - 1 / 313.15))

export default [
  definePractical({
    id: 'chem-ig-1-1', subject: 'chemistry', collection: C('1.1', 'Rates of reaction'), topic: 'Rate of reaction: effect of concentration',
    curriculum: CUR('Rate of reaction: effect of concentration'), difficulty: 'IGCSE',
    title: 'Concentration and rate: the disappearing cross', summary: 'Time how long sulfur takes to hide a cross when sodium thiosulfate of different concentrations reacts with acid, and find how the rate depends on concentration.',
    aim: 'To investigate how the concentration of sodium thiosulfate affects the rate of its reaction with hydrochloric acid.',
    durationMin: 45,
    apparatus: ['conical_flask', 'measuring_cylinder', 'cross_card', 'stopwatch', 'thermometer'],
    materials: ['Sodium thiosulfate solution, 40 g/dm³', 'Dilute hydrochloric acid, 1.0 mol/dm³', 'Distilled water'],
    safety: ['Wear eye protection: the acid and the thiosulfate solution can splash.', 'The reaction gives off a little sulfur dioxide, which can trigger asthma: work in a well-ventilated room, do not breathe over the flask, and pour each finished mixture into the waste beaker straight away.'],
    gogglesWhy: 'The acid and the thiosulfate solution can splash into your eyes.',
    procedure: [
      'Read the room temperature. All the solutions should be at this temperature.',
      'Measure the volume of sodium thiosulfate solution with the measuring cylinder and make it up to 50 cm³ with distilled water. Pour the mixture into the conical flask standing on the cross.',
      'Measure 5 cm³ of hydrochloric acid. Add it to the flask, swirl once and start the stopwatch at the same moment.',
      'Look down through the flask from above. Stop the stopwatch when you can no longer see the cross.',
      'Rinse the flask and repeat with each volume of thiosulfate from 10 cm³ to 50 cm³. Do each volume twice.',
      'Calculate the concentration c of thiosulfate in the flask and the rate as 1/t. Plot 1/t against c.',
    ],
    controlled: 'the volume of acid and its concentration, the total volume (50 cm³), the temperature, the same flask and the same cross, and the same person judging the end.',
    model: { kind: 'simplified', summary: 'The time taken for a fixed amount of sulfur to form is inversely proportional to the thiosulfate concentration, so 1/t = k c.',
      assumptions: ['The acid is in excess, so its concentration hardly changes during a run.', 'Judging when the cross disappears adds a short delay (a fraction of a second) and a random error of about ±0.6 s that grows a little for slow runs.', 'The solutions are at room temperature throughout.'] },
    hidden: (q) => ({ K: q('K', 700, 950), lag: q('lag', 0.2, 0.6), room: q('room', 19, 25) }),
    constants: [{ key: 'room', label: 'Room temperature', symbol: 'θ', unit: '°C', resolution: 0.5, instrument: 'thermometer', read: (p, n) => p.room + n(0.15) }],
    iv: { key: 'V', label: 'Volume of sodium thiosulfate solution', symbol: 'V', unit: 'cm³', min: 10, max: 50, step: 5, start: 50, instrument: 'measuring_cylinder' },
    repeats: 2,
    measures: [{ key: 't', label: 'Time for the cross to disappear', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch', look: 'cross',
      read: (p, x, n) => { const t = p.K / (STOCK * x / TOTAL); return t + p.lag + n(0.5 + 0.01 * t) } }],
    derived: [
      { key: 'c', label: 'Concentration of thiosulfate in the flask', symbol: 'c', unit: 'g/dm³', decimals: 1, value: (r) => STOCK * r.V / TOTAL },
      { key: 'rate', label: 'Rate of reaction', symbol: '1/t', unit: 's⁻¹', decimals: 4, value: (r) => 1 / r.t },
    ],
    graph: { x: 'c', y: 'rate', fit: 'line' },
    results: [
      { id: 'k', prompt: 'Gradient of your graph of 1/t against c', unit: 'dm³ g⁻¹ s⁻¹', sig: 3, fromFit: (f) => f.m, truth: (p) => 1 / p.K, tolTrue: { rel: 0.1 } },
      { id: 't20', prompt: 'Time you predict from your graph for c = 20 g/dm³', unit: 's', sig: 3, fromFit: (f) => 1 / (f.m * 20 + f.c), truth: (p) => p.K / 20 + p.lag, tolTrue: { rel: 0.07 } },
    ],
    questions: [
      { id: 'collide', type: 'choice', prompt: 'Why does a higher concentration of thiosulfate make the reaction faster?', options: ['There are more particles in the same volume, so there are more frequent collisions', 'Each particle has more energy, so more collisions succeed', 'The particles are larger, so they are easier to hit', 'The acid is used up faster, so the sulfur forms sooner'], correct: 0 },
      { id: 'total', type: 'choice', prompt: 'Why is the mixture always made up to 50 cm³ with water?', options: ['So the depth of liquid over the cross is the same and only the concentration changes', 'To cool the mixture down', 'To make the sulfur dissolve', 'To dilute the acid so it is safer'], correct: 0 },
      { id: 'judge', type: 'text', prompt: 'The end of each run is judged by eye. Explain how this affects your results and suggest a better way to detect the end of the reaction.' },
    ],
  }),

  definePractical({
    id: 'chem-ig-1-2', subject: 'chemistry', collection: C('1.2', 'Rates of reaction'), topic: 'Rate of reaction: effect of temperature',
    curriculum: CUR('Rate of reaction: effect of temperature'), difficulty: 'IGCSE',
    title: 'Temperature and rate: the disappearing cross', summary: 'Warm the thiosulfate in a water bath, time the cross disappearing at each temperature and find the temperature rise that doubles the rate.',
    aim: 'To investigate how temperature affects the rate of the reaction between sodium thiosulfate and hydrochloric acid.',
    durationMin: 50,
    apparatus: ['conical_flask', 'measuring_cylinder', 'cross_card', 'water_bath', 'thermometer', 'stopwatch'],
    materials: ['Sodium thiosulfate solution, 40 g/dm³', 'Dilute hydrochloric acid, 1.0 mol/dm³'],
    safety: ['Wear eye protection: the solutions can splash, and warm acid is more irritating.', 'More sulfur dioxide is given off from warm mixtures: keep the room ventilated, do not lean over the flask and do not go above 60 °C.'],
    gogglesWhy: 'Warm acid and thiosulfate can splash into your eyes.',
    procedure: [
      'Measure 50 cm³ of sodium thiosulfate solution into the conical flask and 5 cm³ of acid into a test tube. Stand both in the water bath.',
      'When the thiosulfate has reached the temperature of the bath, read its temperature θ with the thermometer.',
      'Stand the flask on the cross, add the acid, swirl and start the stopwatch. Stop it when the cross can no longer be seen from above.',
      'Repeat with the water bath set to temperatures from 20 °C to 60 °C.',
      'Calculate the rate as 1/t. Plot lg(1/t) against θ: over this range it is close to a straight line.',
      'Use the gradient to find the rise in temperature that doubles the rate.',
    ],
    controlled: 'the volumes and concentrations of both solutions, the same flask, the same cross and the same person judging the end.',
    model: { kind: 'simplified', summary: 'The rate follows the Arrhenius equation, rate ∝ e^(−Eₐ/RT), so over 20–60 °C lg(rate) rises almost linearly with temperature.',
      assumptions: ['The activation energy is about 50–65 kJ/mol, so the rate roughly doubles for each 10–13 °C rise.', 'The mixture stays at the temperature read before the acid was added; in a real flask it cools a little during slow runs.', 'Judging the end adds a short delay and a random error of about ±0.4 s; the thermometer is read to the nearest 0.5 °C, and the bath may differ from its setting by up to 0.6 °C.'] },
    hidden: (q) => ({ Ea: q('Ea', 50, 65), t40: q('t40', 25, 35), lag: q('lag', 0.1, 0.4) }),
    iv: { key: 'set', label: 'Water bath setting', symbol: 'θ_set', unit: '°C', min: 20, max: 60, step: 5, start: 20, instrument: 'water_bath' },
    measures: [
      { key: 'th', label: 'Temperature of thiosulfate', symbol: 'θ', unit: '°C', resolution: 0.5, instrument: 'thermometer', read: (p, x, n) => x + 0.6 * p.j('bath' + x) + n(0.1) },
      { key: 't', label: 'Time for the cross to disappear', symbol: 't', unit: 's', resolution: 0.01, instrument: 'stopwatch', look: 'cross',
        read: (p, x, n) => { const t = thioTime(p, x + 0.6 * p.j('bath' + x)); return t + p.lag + n(0.3 + 0.01 * t) } },
    ],
    derived: [{ key: 'rate', label: 'Rate of reaction', symbol: '1/t', unit: 's⁻¹', decimals: 4, value: (r) => 1 / r.t }],
    graph: { x: 'th', y: 'rate', ty: 'lg', fit: 'line' },
    results: [{ id: 'dbl', prompt: 'Temperature rise that doubles the rate', unit: '°C', sig: 3, fromFit: (f) => Math.log10(2) / f.m,
      truth: (p) => { const pts = []; for (let th = 20; th <= 60; th += 5) pts.push({ x: th, y: -Math.log10(thioTime(p, th)) }); return Math.log10(2) / linearFit(pts).m },
      tolTrue: { rel: 0.15 } }],
    questions: [
      { id: 'energy', type: 'choice', prompt: 'Why does the rate increase so much for a small rise in temperature?', options: ['Many more collisions have at least the activation energy', 'The particles become larger', 'The concentration of the acid increases', 'The sulfur dissolves more slowly'], correct: 0 },
      { id: 'cool', type: 'text', prompt: 'At high temperatures the runs are very short. Explain why the timing is less precise there and how you could improve it.' },
    ],
  }),

  definePractical({
    id: 'chem-ig-2-1', subject: 'chemistry', collection: C('2.1', 'Energy changes'), topic: 'Energy released by burning a fuel',
    curriculum: CUR('Energy changes: heat energy released by fuels'), difficulty: 'IGCSE',
    title: 'Energy from burning ethanol', summary: 'Heat water in a copper can with a spirit burner, weigh the burner as it is used and find the energy transferred to the water for each gram of ethanol.',
    aim: 'To find the energy transferred to water per gram of ethanol burned, and to compare it with the value from a data book.',
    durationMin: 50,
    apparatus: ['spirit_burner', 'copper_can', 'stand_clamp', 'thermometer', 'top_pan_balance', 'measuring_cylinder', 'stopwatch', 'heat_mat'],
    materials: ['Ethanol (in the spirit burner)', 'Water'],
    safety: ['Wear eye protection. Ethanol is highly flammable: keep the bottle away from flames, refill the burner only when it is cold, and put the cap on to put the flame out.', 'Stand the burner on a heat-resistant mat; the can and clamp get hot.'],
    gogglesWhy: 'Ethanol is flammable and the water gets hot.',
    procedure: [
      'Measure 100 cm³ of water into the copper can and clamp it about 3 cm above the wick. Read the starting temperature θ₀.',
      'Tare the balance and weigh the spirit burner with its cap on (m₀).',
      'Light the burner under the can and start the stopwatch.',
      'At the end of each minute put the cap on, stir and read the temperature, weigh the burner, then relight it. Stop after 8 minutes.',
      'Calculate the mass of ethanol burned and the temperature rise for each reading. Plot the temperature rise against the mass burned.',
      'Energy given to the water = m c ΔT, with c = 4.18 J/g °C and 1 cm³ of water = 1 g. Use the gradient to find the energy per gram of ethanol.',
    ],
    controlled: 'the volume of water, the distance from the wick to the can, the same can, and draughts kept away from the flame.',
    model: { kind: 'simplified', summary: 'A fixed fraction of the energy released by the burning ethanol reaches the water, so the temperature rise is proportional to the mass burned.',
      assumptions: ['Burning ethanol releases about 29.7 kJ/g; only 25–40 % of it reaches the water. The rest heats the can, the clamp and the air, or is lost as incomplete combustion (soot).', 'The fraction reaching the water stays the same as the water warms (in reality it falls slightly at higher temperatures).', 'The burner burns at a steady rate with small irregularities; the balance reads to 0.01 g and the thermometer to the nearest 0.5 °C.'] },
    hidden: (q) => ({ Eg: q('Eg', 7.5, 11.5), burn: q('burn', 0.14, 0.2), m0: q('m0', 180, 200), th0: q('th0', 18, 24), Vw: q('Vw', 99.2, 100.8) }),
    constants: [
      { key: 'Vw', label: 'Volume of water', symbol: 'V', unit: 'cm³', resolution: 1, instrument: 'measuring_cylinder', read: (p, n) => p.Vw + n(0.2) },
      { key: 'th0', label: 'Starting temperature', symbol: 'θ₀', unit: '°C', resolution: 0.5, instrument: 'thermometer', read: (p, n) => p.th0 + n(0.1) },
      { key: 'm0', label: 'Mass of burner at the start', symbol: 'm₀', unit: 'g', resolution: 0.01, instrument: 'top_pan_balance', read: (p, n) => p.m0 + n(0.003) },
    ],
    iv: { key: 'time', label: 'Time heated', symbol: 't', unit: 'min', min: 0, max: 8, step: 1, start: 0, instrument: 'stopwatch', monotonic: true },
    measures: [
      { key: 'm', label: 'Mass of burner', symbol: 'm', unit: 'g', resolution: 0.01, instrument: 'top_pan_balance', read: (p, x, n) => p.m0 - p.burn * x * (1 + 0.04 * p.j('b' + x)) + n(0.003) },
      { key: 'th', label: 'Temperature of water', symbol: 'θ', unit: '°C', resolution: 0.5, instrument: 'thermometer',
        read: (p, x, n) => p.th0 + p.Eg * 1000 * p.burn * x * (1 + 0.04 * p.j('b' + x)) / (p.Vw * 4.18) + n(0.2) },
    ],
    derived: [
      { key: 'dm', label: 'Mass of ethanol burned', symbol: 'Δm', unit: 'g', decimals: 2, value: (r, c) => c.m0 - r.m },
      { key: 'dT', label: 'Temperature rise', symbol: 'ΔT', unit: '°C', decimals: 1, value: (r, c) => r.th - c.th0 },
    ],
    graph: { x: 'dm', y: 'dT', fit: 'line' },
    results: [
      { id: 'E', prompt: 'Energy transferred to the water per gram of ethanol', unit: 'kJ/g', sig: 3, fromFit: (f, c) => f.m * c.Vw * 4.18 / 1000, truth: (p) => p.Eg, tolTrue: { rel: 0.08 } },
      { id: 'eff', prompt: 'Percentage of the data-book value (29.7 kJ/g) that reached the water', unit: '%', sig: 3, fromFit: (f, c) => 100 * f.m * c.Vw * 4.18 / 1000 / 29.7, truth: (p) => 100 * p.Eg / 29.7, tolTrue: { rel: 0.08 } },
    ],
    questions: [
      { id: 'loss', type: 'choice', prompt: 'Which is the main reason your value is much lower than the data-book value?', options: ['Most of the energy heats the surroundings instead of the water', 'The balance is not accurate enough', 'Ethanol releases less energy when it burns slowly', 'The thermometer reads too high'], correct: 0 },
      { id: 'soot', type: 'text', prompt: 'A black deposit forms on the bottom of the can. Explain what it is and how it affects your result.' },
      { id: 'improve', type: 'text', prompt: 'Suggest two changes to the apparatus that would get more of the energy into the water.' },
    ],
  }),
  definePractical({
    id: 'chem-ig-2-2', subject: 'chemistry', collection: C('2.2', 'Electrolysis'), topic: 'Electrolysis of copper(II) sulfate with copper electrodes',
    curriculum: CUR('Electrolysis: mass of copper deposited and the charge passed'), difficulty: 'IGCSE',
    title: 'Electrolysis of copper(II) sulfate', summary: 'Pass a steady current through copper(II) sulfate solution, weigh the cathode every few minutes and find how the mass of copper deposited depends on the charge.',
    aim: 'To investigate how the mass of copper deposited on the cathode depends on time at a constant current, and to estimate the charge on one mole of electrons.',
    durationMin: 60,
    apparatus: ['copper_electrodes', 'beaker_250', 'dc_supply', 'ammeter', 'rheostat', 'leads', 'top_pan_balance', 'stopwatch'],
    materials: ['Copper(II) sulfate solution, 0.5 mol/dm³', 'Propanone (for drying the cathode)'],
    safety: ['Wear eye protection: copper(II) sulfate solution is harmful and irritates the eyes.', 'Propanone is highly flammable: no flames nearby; dry the cathode in air, not over a heater. Switch off the supply before taking the cathode out.'],
    gogglesWhy: 'Copper(II) sulfate solution irritates the eyes.',
    procedure: [
      'Clean the copper cathode with emery paper, rinse it with propanone, let it dry and weigh it (m₀). Tare the balance first.',
      'Set up the cell with the two copper electrodes in the solution, connected through the ammeter and rheostat to the d.c. supply (cathode to the negative terminal).',
      'Switch on, start the stopwatch and adjust the rheostat to keep the current steady at about 0.5 A. Record the current I.',
      'Every 2 minutes switch off, lift out the cathode, dip it in propanone, let it dry, weigh it (m) and put it back. Restart the current.',
      'Calculate the mass of copper deposited, Δm = m − m₀, and plot Δm against t.',
      'Charge passed Q = I t (t in seconds). Cu²⁺ + 2e⁻ → Cu, so 2 mol of electrons deposit 63.5 g of copper. Use your gradient to find the charge on one mole of electrons.',
    ],
    controlled: 'the current (kept steady with the rheostat), the concentration of the solution, the area of the electrodes in the solution and the distance between them.',
    model: { kind: 'quantitative', summary: 'Faraday’s law: the mass of copper deposited is proportional to the charge passed, Δm = (63.5 / 2F) I t, where F ≈ 96 500 C/mol.',
      assumptions: ['A small fraction (0–4 %) of the copper does not stick, or is lost when the cathode is rinsed, so the mass gained is slightly less than Faraday’s law predicts.', 'The current stays at its set value; the ammeter is read to 0.01 A.', 'The cathode is fully dry each time it is weighed; the balance reads to 0.001 g, with a random error of about ±0.001 g from drying and handling.'] },
    hidden: (q) => ({ I: q('I', 0.42, 0.58), eff: q('eff', 0.96, 1.0), m0: q('m0', 9, 14) }),
    constants: [
      { key: 'm0', label: 'Mass of clean cathode', symbol: 'm₀', unit: 'g', resolution: 0.001, instrument: 'top_pan_balance', read: (p, n) => p.m0 + n(0.0004) },
      { key: 'I', label: 'Current', symbol: 'I', unit: 'A', resolution: 0.01, instrument: 'ammeter', read: (p, n) => p.I + n(0.002) },
    ],
    iv: { key: 't', label: 'Time', symbol: 't', unit: 'min', min: 0, max: 20, step: 2, start: 0, instrument: 'stopwatch', monotonic: true },
    measures: [{ key: 'm', label: 'Mass of cathode', symbol: 'm', unit: 'g', resolution: 0.001, instrument: 'top_pan_balance',
      read: (p, x, n) => p.m0 + p.eff * 63.5 * p.I * x * 60 / (2 * 96485) * (1 + 0.01 * p.j('m' + x)) + n(0.0008) }],
    derived: [{ key: 'dm', label: 'Mass of copper deposited', symbol: 'Δm', unit: 'g', decimals: 3, value: (r, c) => r.m - c.m0 }],
    graph: { x: 't', y: 'dm', fit: 'origin' },
    results: [
      { id: 'rate', prompt: 'Gradient: mass of copper deposited per minute', unit: 'g/min', sig: 3, fromFit: (f) => f.m, truth: (p) => p.eff * 63.5 * p.I * 60 / (2 * 96485), tolTrue: { rel: 0.06 } },
      { id: 'F', prompt: 'Charge on one mole of electrons from your results', unit: 'C/mol', sig: 3, fromFit: (f, c) => 63.5 * c.I * 60 / (2 * f.m), truth: (p) => 96485 / p.eff, tolTrue: { rel: 0.06 } },
    ],
    questions: [
      { id: 'anode', type: 'choice', prompt: 'What happens at the copper anode?', options: ['Copper atoms lose electrons and go into solution as Cu²⁺ ions, so the anode loses mass', 'Oxygen is given off', 'Copper is deposited on it', 'Hydrogen is given off'], correct: 0 },
      { id: 'colour', type: 'choice', prompt: 'Why does the blue colour of the solution stay the same?', options: ['Copper ions are added at the anode as fast as they are removed at the cathode', 'The current is too small to change the colour', 'The sulfate ions are blue', 'Water is decomposed instead of copper sulfate'], correct: 0 },
      { id: 'error', type: 'text', prompt: 'Your value for the charge on a mole of electrons is a little high. Suggest two reasons, linked to how the cathode was handled.' },
    ],
  }),
]
