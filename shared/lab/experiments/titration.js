/**
 * Acid–base titration: find the concentration of an acid with standard
 * sodium hydroxide. The flask pH and the indicator colour come from the
 * equilibrium model in science/acidbase.js after every drop; nothing about
 * the endpoint is scripted.
 */
import { titrationPH, volumeAtPH, SUBSTANCES } from '../science/acidbase.js'
import { INDICATORS, indicatorColour, colourName, baseFraction, endpointPH } from '../science/indicators.js'
import { seeded } from '../science/random.js'
import { within, mean, toSigFigs } from '../science/numeric.js'
import { fail } from '../engine.js'

const ACIDS = ['HCl', 'CH3COOH']
const SUITABLE = { HCl: ['phenolphthalein', 'methyl_orange', 'bromothymol_blue'], CH3COOH: ['phenolphthalein'] }
const BURETTE_MAX = 50
const READ_RES = 0.05

const newRun = () => ({ acidVolume: 0, baseAdded: 0, indicator: null, indicatorDrops: 0, initial: null, final: null, rough: false, startTrue: null, endTrue: null })
const run = (s) => s.runs[s.current]
const titreOf = (r) => (r.initial != null && r.final != null ? Number((r.final - r.initial).toFixed(2)) : null)
const is2dp005 = (v) => Math.abs(Math.round(v * 100) - v * 100) < 1e-6 && Math.round(v * 100) % 5 === 0

/** Volume of base (cm³) at which this run's indicator is half-changed. */
export function trueEndpoint(params, indicator) {
  if (!indicator) return null
  return volumeAtPH({ acid: params.acid, Ca: params.Ca, Va: params.Va, Cb: params.Cb }, endpointPH(indicator))
}

/** Accurate (non-rough) completed titres, and the concordant ones (within 0.10 cm³). */
export function titres(state) {
  const done = state.runs.filter(r => !r.rough && titreOf(r) != null).map(titreOf)
  let best = []
  for (let i = 0; i < done.length; i++) {
    const group = done.filter(t => Math.abs(t - done[i]) <= 0.10 + 1e-9)
    if (group.length > best.length) best = group
  }
  return { all: done, concordant: best.length >= 2 ? best : [] }
}

const def = {
  id: 'chem-titration',
  version: 1,
  subject: 'chemistry',
  title: 'Acid–base titration',
  summary: 'Use a standard solution of sodium hydroxide to find the concentration of an acid by titration.',
  durationMin: 50,
  difficulty: 'core',
  curriculum: [
    { board: 'Cambridge', level: 'IGCSE', subject: 'Chemistry', topic: 'Acids, bases and salts: titration', syllabusRef: null, verified: false },
    { board: 'Pearson Edexcel', level: 'International GCSE', subject: 'Chemistry', topic: 'Acids, alkalis and titrations', syllabusRef: null, verified: false },
    { board: 'Cambridge', level: 'AS & A Level', subject: 'Chemistry', topic: 'Equilibria: pH, Ka, titration curves and indicators', syllabusRef: null, verified: false },
    { board: 'IB', level: 'Diploma Programme', subject: 'Chemistry', topic: 'Acids and bases: titration curves and indicators', syllabusRef: null, verified: false },
  ],
  skills: ['Using a burette and pipette', 'Reading a meniscus to ±0.05 cm³', 'Concordant results', 'Moles and concentration calculations'],
  objectives: [
    'Carry out an acid–base titration with a burette, pipette and indicator.',
    'Record burette readings to the nearest 0.05 cm³ and obtain concordant titres.',
    'Choose an indicator suited to the acid and explain the choice.',
    'Calculate the concentration of the acid from the mean titre.',
  ],
  prerequisites: ['Moles and concentration (mol dm⁻³)', 'Neutralisation equations', 'pH scale'],
  safety: [
    'Sodium hydroxide is corrosive to skin and eyes; acids are irritant. In a real lab wear eye protection and a lab coat.',
    'Never pipette by mouth; use a pipette filler.',
    'Fill the burette below eye level, with the tap closed, and remove the funnel before titrating.',
    'This is a virtual practice. It does not replace any practical work your examination board requires.',
  ],
  apparatus: ['burette', 'stand', 'pipette', 'conical_flask', 'white_tile', 'funnel', 'beaker', 'indicator_bottle', 'wash_bottle'],
  materials: ['Acid of unknown concentration', 'Sodium hydroxide, 0.100 mol dm⁻³ (standard solution)', 'Indicators: phenolphthalein, methyl orange, bromothymol blue', 'Distilled water'],
  procedure: [
    'Rinse and fill the burette with the sodium hydroxide solution. Record the initial reading.',
    'Pipette 25.0 cm³ of the acid into a clean conical flask on a white tile.',
    'Choose an indicator and add 2 drops.',
    'Do a rough titration: add alkali in larger portions until the colour changes, then record the final reading.',
    'Start a new run. Add alkali quickly to within about 2 cm³ of the rough titre, then drop by drop, swirling, until one drop gives a permanent colour change.',
    'Repeat until you have two titres within 0.10 cm³ (concordant).',
    'Calculate the mean titre, the moles of sodium hydroxide, and the concentration of the acid.',
  ],
  model: {
    kind: 'quantitative',
    summary: 'pH is calculated exactly from the charge balance for the acid and sodium hydroxide in the flask at 25 °C; the indicator colour follows its acid–base equilibrium (pKIn).',
    assumptions: [
      '25 °C, Kw = 1.0 × 10⁻¹⁴; ideal dilute solutions (concentrations used instead of activities).',
      'Volumes add on mixing; the solution in the flask is fully mixed after each addition.',
      'Ethanoic acid Ka = 1.74 × 10⁻⁵; hydrochloric acid and sodium hydroxide are fully dissociated.',
      'The endpoint you see is where half of the indicator has changed form (pH = pKIn).',
      'Carbon dioxide absorption and burette drainage errors are not modelled.',
    ],
  },
  notebook: {
    aim: 'To find the concentration of an acid by titration with 0.100 mol dm⁻³ sodium hydroxide.',
    variables: 'Independent: none (repeated measurement). Dependent: titre (cm³). Controlled: volume of acid (25.0 cm³), concentration of NaOH, indicator, temperature.',
  },

  params(seed, options) {
    const acid = ACIDS.includes(options.acid) ? options.acid : 'HCl'
    return {
      seed,
      acid,
      acidName: SUBSTANCES[acid].name,
      Ca: Number(seeded(seed, 'Ca', 0.0800, 0.1200).toFixed(4)), // hidden
      Va: 25.0,
      Cb: 0.100,
      base: 'NaOH',
    }
  },

  initialState() {
    return { indicator: null, fills: 0, burette: { filled: false, reading: null }, runs: [newRun()], current: 0 }
  },

  actions: {
    fillBurette(s, _p, params) {
      const r = run(s)
      if (r.baseAdded > 0 && r.final == null) fail('Finish this run (record the final reading) before refilling the burette.')
      s.fills += 1
      s.burette = { filled: true, reading: Number(seeded(params.seed, 'fill' + s.fills, 0, 1.6).toFixed(2)) }
    },
    pipetteAcid(s, _p, params) {
      const r = run(s)
      if (r.acidVolume > 0) fail('This flask already contains the acid. Start a new run for another titration.')
      r.acidVolume = params.Va
    },
    chooseIndicator(s, { indicator }) {
      if (!INDICATORS[indicator]) fail('Choose one of the indicators provided.')
      if (run(s).indicatorDrops > 0) fail('Indicator has already been added to this flask. Start a new run to change it.')
      s.indicator = indicator
    },
    addIndicator(s) {
      const r = run(s)
      if (!s.indicator) fail('Choose an indicator first.')
      if (r.acidVolume === 0) fail('Pipette the acid into the flask first.')
      if (r.indicatorDrops >= 6) fail('That is plenty of indicator; more would affect the result.')
      r.indicator = s.indicator
      r.indicatorDrops += 2
    },
    addBase(s, { volume }) {
      const v = Number(volume)
      if (!(v > 0) || v > 5) fail('Add between a drop (0.05 cm³) and 5 cm³ at a time.')
      if (!s.burette.filled) fail('Fill the burette first.')
      const r = run(s)
      if (r.acidVolume === 0) fail('Pipette the acid into the flask first.')
      if (r.final != null) fail('This run is finished. Start a new run.')
      if (s.burette.reading + v > BURETTE_MAX + 1e-9) fail('The burette does not have enough solution left. Finish the run or refill it.')
      if (r.startTrue == null) r.startTrue = s.burette.reading
      s.burette.reading = Number((s.burette.reading + v).toFixed(4))
      r.baseAdded = Number((r.baseAdded + v).toFixed(4))
      r.endTrue = s.burette.reading
    },
    recordReading(s, { which, value }) {
      const v = Number(value)
      if (!Number.isFinite(v) || v < 0 || v > BURETTE_MAX) fail('Burette readings are between 0.00 and 50.00 cm³.')
      const r = run(s)
      if (which === 'initial') {
        if (!s.burette.filled) fail('Fill the burette first.')
        if (r.baseAdded > 0) fail('Record the initial reading before adding any alkali.')
        r.initial = v
        r.startTrue = s.burette.reading
      } else if (which === 'final') {
        if (r.baseAdded === 0) fail('Add alkali from the burette before recording a final reading.')
        if (r.initial == null) fail('Record the initial reading first.')
        if (v < r.initial) fail('The final reading must be larger than the initial reading.')
        r.final = v
      } else fail('Choose initial or final.')
    },
    markRough(s, { index, rough }) {
      const r = s.runs[index]
      if (!r) fail('No such run.')
      r.rough = !!rough
    },
    newRun(s) {
      const r = run(s)
      if (r.final == null) fail('Record the final reading of this run first.')
      if (s.runs.length >= 6) fail('Six runs are enough. Use your concordant results.')
      s.runs.push(newRun())
      s.current = s.runs.length - 1
    },
  },

  view(params, s) {
    const r = run(s)
    const hasAcid = r.acidVolume > 0
    const pH = hasAcid ? titrationPH({ acid: params.acid, Ca: params.Ca, Va: params.Va, Cb: params.Cb, Vb: r.baseAdded }) : null
    const ind = r.indicatorDrops > 0 ? r.indicator : null
    const ep = ind ? endpointPH(ind) : null
    return {
      run: s.current + 1,
      runs: s.runs.map((x, i) => ({ n: i + 1, rough: x.rough, initial: x.initial, final: x.final, titre: titreOf(x), indicator: x.indicator })),
      flask: {
        hasAcid, volume: hasAcid ? params.Va + r.baseAdded : 0, pH, indicator: ind,
        colour: hasAcid ? indicatorColour(ind, pH) : null,
        colourName: hasAcid ? colourName(ind, pH) : null,
        changed: ind ? baseFraction(ind, pH) >= 0.5 : false,
        overshot: ind ? pH > ep + 1.5 : false,
      },
      burette: { filled: s.burette.filled, reading: s.burette.reading, resolution: READ_RES, max: BURETTE_MAX },
      indicatorChosen: s.indicator,
      titres: titres(s),
      // pH is shown only as a teaching aid in the pH-meter panel (optional);
      // students find the endpoint from the indicator.
    }
  },

  questions: [
    { id: 'titre', type: 'numeric', unit: 'cm³', prompt: 'Mean of your concordant titres', hint: 'Give 2 decimal places.' },
    { id: 'moles', type: 'numeric', unit: 'mol', prompt: 'Moles of sodium hydroxide in the mean titre', hint: '3 significant figures.' },
    { id: 'conc', type: 'numeric', unit: 'mol dm⁻³', prompt: 'Concentration of the acid', hint: '3 significant figures. The reaction is 1:1.' },
    { id: 'indicator_reason', type: 'text', prompt: 'Why is your indicator suitable for this titration?' },
    { id: 'evaluation', type: 'text', prompt: 'Give two sources of error and how you would reduce them.' },
  ],

  expected(ctx) {
    const { params, state, answers } = ctx
    const t = titres(state)
    const mt = t.concordant.length ? mean(t.concordant) : null
    const ownTitre = Number(answers.titre) || mt
    const nb = ownTitre ? params.Cb * ownTitre / 1000 : null
    return {
      titre: mt != null ? Number(mt.toFixed(2)) : null,
      moles: nb != null ? toSigFigs(nb, 3) : null,
      conc: (Number(answers.moles) || nb) ? toSigFigs((Number(answers.moles) || nb) / (params.Va / 1000), 3) : null,
      trueConc: params.Ca,
      trueEndpoint: trueEndpoint(params, state.runs.find(r => !r.rough && r.indicator)?.indicator || state.indicator),
    }
  },

  rubric: [
    { id: 'indicator', label: 'Suitable indicator chosen', marks: 1, auto: ({ params, state }) => {
      const used = state.runs.filter(r => !r.rough && r.final != null).map(r => r.indicator)
      if (!used.length) return { marks: 0, detail: 'No completed accurate titration.' }
      const ok = used.every(i => SUITABLE[params.acid].includes(i))
      return { marks: ok ? 1 : 0, detail: ok ? 'Indicator suits the acid.' : 'Indicator does not change at the equivalence pH for ' + params.acidName + '.' }
    } },
    { id: 'concordant', label: 'Concordant titres (within 0.10 cm³)', marks: 2, auto: ({ state }) => {
      const t = titres(state)
      if (t.concordant.length >= 2) return { marks: 2, detail: 'Concordant: ' + t.concordant.map(x => x.toFixed(2)).join(', ') + ' cm³.' }
      return { marks: t.all.length ? 1 : 0, detail: t.all.length ? 'Titres not yet concordant.' : 'No accurate titres recorded.' }
    } },
    { id: 'readings', label: 'Burette readings recorded correctly to ±0.05 cm³', marks: 1, auto: ({ state }) => {
      const recs = []
      for (const r of state.runs) {
        if (r.initial != null) recs.push([r.initial, r.startTrue])
        if (r.final != null) recs.push([r.final, r.endTrue])
      }
      if (!recs.length) return { marks: 0, detail: 'No readings recorded.' }
      const bad = recs.filter(([v, t]) => !is2dp005(v) || !within(v, t, { abs: READ_RES + 1e-9 }))
      return { marks: bad.length ? 0 : 1, detail: bad.length ? bad.length + ' reading(s) not to 2 d.p. ending in 0 or 5, or misread.' : 'All readings correct.' }
    } },
    { id: 'accuracy', label: 'Mean titre close to the true endpoint', marks: 2, auto: (ctx) => {
      const e = def.expected(ctx)
      if (e.titre == null || e.trueEndpoint == null) return { marks: 0, detail: 'No concordant titres.' }
      const d = Math.abs(e.titre - e.trueEndpoint)
      return { marks: d <= 0.10 ? 2 : d <= 0.30 ? 1 : 0, detail: 'Mean titre ' + e.titre.toFixed(2) + ' cm³; true endpoint ' + e.trueEndpoint.toFixed(2) + ' cm³.' }
    } },
    { id: 'moles', label: 'Moles of NaOH calculated correctly', marks: 1, auto: (ctx) => {
      const e = def.expected(ctx), a = Number(ctx.answers.moles)
      return { marks: e.moles != null && within(a, e.moles, { rel: 0.01 }) ? 1 : 0, detail: e.moles != null ? 'Expected ' + e.moles + ' mol from your titre.' : 'No titre to work from.' }
    } },
    { id: 'conc', label: 'Acid concentration: method and accuracy', marks: 2, auto: (ctx) => {
      const e = def.expected(ctx), a = Number(ctx.answers.conc)
      if (!Number.isFinite(a) || !a) return { marks: 0, detail: 'No concentration given.' }
      let m = 0
      if (e.conc != null && within(a, e.conc, { rel: 0.01 })) m += 1
      if (within(a, ctx.params.Ca, { rel: 0.02 })) m += 1
      return { marks: m, detail: 'From your working: ' + (e.conc ?? '—') + ' mol dm⁻³. True value: ' + ctx.params.Ca.toFixed(4) + ' mol dm⁻³.' }
    } },
    { id: 'report', label: 'Analysis, evaluation and conclusion', marks: 4, auto: null, guidance: 'Indicator choice explained (1), two sources of error with improvements (2), clear conclusion with units and significant figures (1).' },
  ],
}

export default def
