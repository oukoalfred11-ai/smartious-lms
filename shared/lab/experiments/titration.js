/**
 * Acid–base titration: find the concentration of an acid with standard
 * sodium hydroxide. The flask pH and the indicator colour come from the
 * equilibrium model in science/acidbase.js after every drop; nothing about
 * the endpoint is scripted.
 *
 * Two ways of working share one engine:
 *   • One-click shortcuts (fillBurette, pipetteAcid). Sessions saved before
 *     the step-by-step bench existed use these, and they still replay.
 *   • The step-by-step (hands-on) bench: wear goggles and a lab coat, rinse
 *     the burette with the alkali, fill it through a funnel, remove the funnel,
 *     run some out to fill the jet, read the meniscus at eye level, rinse and
 *     fill the pipette with a filler, adjust to the mark, deliver into a clean
 *     flask, add indicator, titrate and swirl, and wash the flask out between
 *     runs. The first hands-on action switches the session to this bench and
 *     the shortcuts are then refused. Technique mistakes have the effect they
 *     would have at a real bench and are written to a technique log (notes)
 *     that the rubric and the report use.
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

// Sizes of the hands-on effects, typical of a school burette and pipette.
export const PARALLAX = 0.15   // cm³ misread when the eye is above or below the meniscus
const BURETTE_WET = 0.6        // cm³ of water left in a burette that was not rinsed with the alkali
const PIPETTE_WET = 0.3        // cm³ of water left in a pipette that was not rinsed with the acid
const FLASK_ACID = 1.0         // cm³ of acid left in a flask rinsed with the acid instead of water
const LOCAL_MIX = 12           // how concentrated unswirled alkali is where it lands (the flash of colour)
const FUNNEL_DRIP = 0.05       // cm³ that drains from a funnel left in the burette each time the tap is used
const EYE = { above: 1, level: 0, below: -1 }

/** Technique problems: code → what an examiner would write. */
export const TECHNIQUE = {
  burette_unrinsed: 'Burette not rinsed with the sodium hydroxide: water left inside diluted it, so the titres are too large.',
  pipette_unrinsed: 'Pipette not rinsed with the acid: water left inside diluted the acid, so the titres are too small.',
  pipette_not_at_mark: 'Pipette not adjusted to the 25.0 cm³ mark: more than 25.0 cm³ of acid was delivered, so the titre is too large.',
  flask_rinsed_acid: 'Conical flask rinsed with the acid instead of distilled water: extra acid was left in it, so the titre is too large.',
  air_bubble: 'Air bubble left in the burette jet: it came out during the titration, so the titre is too large.',
  funnel_left: 'Funnel left in the top of the burette: liquid dripped from it during the titration, so the titre is too small.',
  parallax: 'Burette read with the eye above or below the meniscus (parallax error).',
  not_swirled: 'Flask not swirled before the end point was judged: the colour where the drops land is not the colour of the whole solution.',
}

const newRun = () => ({ acidVolume: 0, acidEq: 0, baseAdded: 0, baseEq: 0, unmixed: 0, indicator: null, indicatorDrops: 0, initial: null, final: null, rough: false, startTrue: null, endTrue: null })
const run = (s) => s.runs[s.current]
const titreOf = (r) => (r.initial != null && r.final != null ? Number((r.final - r.initial).toFixed(2)) : null)
const is2dp005 = (v) => Math.abs(Math.round(v * 100) - v * 100) < 1e-6 && Math.round(v * 100) % 5 === 0
const r4 = (x) => Number(x.toFixed(4))

/** Defaults for the hands-on fields, so any state (old or new) has them. */
function hands(s) {
  if (s.handsOn == null) s.handsOn = false
  if (!s.ppe) s.ppe = { goggles: false, coat: false }
  if (s.eye == null) s.eye = 0
  if (!s.bur) s.bur = { wet: 'water', factor: 1, funnel: false, funnelHold: 0, jetAir: 0 }
  if (!s.pip) s.pip = { wet: 'water', filler: false, volume: 0, eq: 0, atMark: false, diluted: false, fills: 0 }
  if (s.flaskClean == null) s.flaskClean = true
  if (s.flaskResidue === undefined) s.flaskResidue = null
  if (!s.notes) s.notes = []
  return s
}
/** Switch the session to the step-by-step bench. */
function goHands(s) {
  hands(s)
  if (!s.handsOn) { s.handsOn = true; s.eye = EYE.above }
}
function note(s, code) {
  const n = s.current + 1
  if (!s.notes.some(x => x.code === code && x.run === n)) s.notes.push({ run: n, code, text: TECHNIQUE[code] })
}
function needPPE(s, what) {
  if (!s.ppe.goggles && !s.ppe.coat) fail('Put on your safety goggles and lab coat before handling ' + what + '.')
  if (!s.ppe.goggles) fail('Put on your safety goggles before handling ' + what + '.')
  if (!s.ppe.coat) fail('Put on your lab coat before handling ' + what + '.')
}

/** pH in a run's flask. acidEq / baseEq: volumes of the nominal solutions the flask really received. */
function flaskPH(params, r, extraBase = 0) {
  const Va = r.acidVolume
  const Ca = params.Ca * (r.acidEq || Va) / Va
  const f = r.baseAdded > 0 ? (r.baseEq || r.baseAdded) / r.baseAdded : 1
  return titrationPH({ acid: params.acid, Ca, Va, Cb: params.Cb * f, Vb: r.baseAdded + extraBase })
}

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

/** Distinct technique problems recorded in a session (hands-on bench only). */
export function techniqueIssues(state) {
  const seen = new Map()
  for (const n of state.notes || []) if (!seen.has(n.code)) seen.set(n.code, { code: n.code, text: n.text, runs: [] })
  for (const n of state.notes || []) seen.get(n.code).runs.push(n.run)
  return [...seen.values()]
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
    'Sodium hydroxide is corrosive to skin and eyes; acids are irritant. Wear eye protection and a lab coat.',
    'Never pipette by mouth; use a pipette filler.',
    'Fill the burette below eye level, with the tap closed, and remove the funnel before titrating.',
    'This is a virtual practice. It does not replace any practical work your examination board requires.',
  ],
  apparatus: [
    '50 cm³ burette (graduated in 0.10 cm³)',
    '25.0 cm³ volumetric pipette',
    'Pipette filler',
    '250 cm³ conical flask',
    'Retort stand with boss and burette clamp',
    'Small filter funnel (for filling the burette)',
    'White tile',
    'Wash bottle of distilled water',
    '100 cm³ beakers: one for the sodium hydroxide, one for the acid, one for rinsings and waste',
    'Safety goggles and lab coat',
  ],
  materials: [
    'Sodium hydroxide solution, 0.100 mol dm⁻³ (standard solution)',
    'Acid of unknown concentration (hydrochloric acid or ethanoic acid, as set by your teacher)',
    'Phenolphthalein indicator',
    'Methyl orange indicator',
    'Bromothymol blue indicator',
    'Distilled water',
  ],
  procedure: [
    'Put on safety goggles and a lab coat.',
    'Rinse the burette with a little of the sodium hydroxide. With the tap closed, put a funnel in the top and fill the burette to above the 0.00 mark, then remove the funnel.',
    'Run a little solution into the waste beaker to fill the jet (no air bubble) and bring the level onto the scale.',
    'With your eye level with the meniscus, read the bottom of the meniscus to the nearest 0.05 cm³. Record the initial reading.',
    'Rinse the pipette with the acid. Using a pipette filler, draw the acid above the mark, let it down until the bottom of the meniscus is on the mark, and deliver 25.0 cm³ into a conical flask (rinsed with distilled water) on a white tile.',
    'Choose an indicator and add 2–3 drops.',
    'Rough titration: open the tap and add alkali quickly, swirling, until the colour changes. Read the final volume.',
    'Wash out the flask and refill the burette. Accurate runs: add alkali quickly to about 2 cm³ before the rough titre, then drop by drop, swirling after each drop, until one drop gives a permanent colour change.',
    'Repeat until you have two titres within 0.10 cm³ (concordant).',
    'Calculate the mean titre, the moles of sodium hydroxide, and the concentration of the acid.',
  ],
  model: {
    kind: 'quantitative',
    summary: 'pH is calculated exactly from the charge balance for the acid and sodium hydroxide in the flask at 25 °C; the indicator colour follows its acid–base equilibrium (pKIn).',
    assumptions: [
      '25 °C, Kw = 1.0 × 10⁻¹⁴; ideal dilute solutions (concentrations used instead of activities).',
      'Volumes add on mixing; the solution in the flask is fully mixed when it is swirled.',
      'Ethanoic acid Ka = 1.74 × 10⁻⁵; hydrochloric acid and sodium hydroxide are fully dissociated.',
      'The endpoint you see is where half of the indicator has changed form (pH = pKIn).',
      'Technique effects use typical sizes: 0.6 cm³ of water left in an unrinsed burette, 0.3 cm³ in an unrinsed pipette, an air bubble of 0.15–0.35 cm³ in an unfilled jet, 0.15–0.30 cm³ left in a funnel, and a parallax error of 0.15 cm³.',
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
    return hands({ indicator: null, fills: 0, burette: { filled: false, reading: null }, runs: [newRun()], current: 0 })
  },

  actions: {
    // One-click shortcuts (used by sessions saved before the step-by-step bench).
    fillBurette(s, _p, params) {
      hands(s)
      if (s.handsOn) fail('Fill the burette step by step: rinse it with the alkali, put the funnel in, pour, then take the funnel out.')
      const r = run(s)
      if (r.baseAdded > 0 && r.final == null) fail('Finish this run (record the final reading) before refilling the burette.')
      s.fills += 1
      s.burette = { filled: true, reading: Number(seeded(params.seed, 'fill' + s.fills, 0, 1.6).toFixed(2)) }
      s.bur.factor = 1; s.bur.jetAir = 0
    },
    pipetteAcid(s, _p, params) {
      hands(s)
      if (s.handsOn) fail('Use the pipette step by step: rinse it with the acid, fill it with the filler, adjust to the mark, then deliver it.')
      const r = run(s)
      if (r.acidVolume > 0) fail('This flask already contains the acid. Start a new run for another titration.')
      r.acidVolume = params.Va
      r.acidEq = params.Va
    },

    // ── Step-by-step bench ───────────────────────────────────
    wearPPE(s, { item }) {
      goHands(s)
      if (item === 'goggles') s.ppe.goggles = true
      else if (item === 'coat') s.ppe.coat = true
      else fail('Choose the safety goggles or the lab coat.')
    },
    rinseBurette(s, { with: w }) {
      goHands(s)
      if (!['water', 'naoh'].includes(w)) fail('Rinse the burette with distilled water or with the sodium hydroxide.')
      if (s.burette.filled) fail('The burette has solution in it. Rinse it before you fill it.')
      if (w === 'naoh') needPPE(s, 'sodium hydroxide (it is corrosive)')
      s.bur.wet = w
    },
    burFunnel(s, { place }) {
      goHands(s)
      if (place) { if (s.bur.funnel) fail('The funnel is already in the top of the burette.'); s.bur.funnel = true }
      else { if (!s.bur.funnel) fail('The funnel is not in the burette.'); s.bur.funnel = false; s.bur.funnelHold = 0 }
    },
    pourIntoBurette(s, _p, params) {
      goHands(s)
      needPPE(s, 'sodium hydroxide (it is corrosive)')
      if (!s.bur.funnel) fail('Put the funnel in the top of the burette before pouring, or the alkali will spill.')
      const r = run(s)
      if (r.baseAdded > 0 && r.final == null) fail('Finish this run (record the final reading) before refilling the burette.')
      if (r.initial != null && r.final == null) fail('You have recorded the initial reading for this run; filling now would make it wrong.')
      if (s.burette.filled && s.burette.reading < 1) fail('The burette is already full.')
      s.fills += 1
      const before = s.burette.filled ? BURETTE_MAX - s.burette.reading : 0
      const level = Number(seeded(params.seed, 'pour' + s.fills, -1.2, 0.5).toFixed(2))   // filled to just above (or near) the 0.00 mark
      const after = BURETTE_MAX - level, added = after - before
      const fresh = s.bur.wet === 'water' ? added / (added + BURETTE_WET) : 1             // water left in an unrinsed burette dilutes the alkali
      s.bur.factor = r4((before * s.bur.factor + added * fresh) / after)
      if (!s.burette.filled) s.bur.jetAir = Number(seeded(params.seed, 'air' + s.fills, 0.15, 0.35).toFixed(2))
      s.bur.wet = 'naoh'
      s.bur.funnelHold = Number(seeded(params.seed, 'funnel' + s.fills, 0.15, 0.3).toFixed(2))
      s.burette = { filled: true, reading: level }
      s.eye = EYE.above
    },
    runToWaste(s, { volume }) {
      goHands(s)
      const v = Number(volume)
      if (!(v > 0) || v > 5) fail('Run between 0.1 and 5 cm³ into the waste beaker at a time.')
      if (!s.burette.filled) fail('Fill the burette first.')
      const r = run(s)
      if (r.baseAdded > 0 && r.final == null) fail('You are part way through this titration; run the alkali into the flask.')
      if (r.initial != null && r.final == null) fail('You have recorded the initial reading for this run; running liquid out now would make it wrong.')
      if (s.burette.reading + v > BURETTE_MAX + 1e-9) fail('The burette does not have that much solution left.')
      if (s.bur.funnel && s.bur.funnelHold > 0) { const d = Math.min(s.bur.funnelHold, FUNNEL_DRIP); s.bur.funnelHold = r4(s.bur.funnelHold - d); s.burette.reading -= d }
      s.bur.jetAir = r4(Math.max(0, s.bur.jetAir - v))       // a quick run flushes the air out of the jet
      s.burette.reading = r4(s.burette.reading + v)
      s.eye = EYE.above
    },
    eyeLevel(s, { pos }) {
      goHands(s)
      if (!(pos in EYE)) fail('Choose above, level with or below the meniscus.')
      s.eye = EYE[pos]
    },
    attachFiller(s) {
      goHands(s)
      if (s.pip.filler) fail('The pipette filler is already attached.')
      s.pip.filler = true
    },
    rinsePipette(s, { with: w }) {
      goHands(s)
      if (!['water', 'acid'].includes(w)) fail('Rinse the pipette with distilled water or with the acid.')
      if (s.pip.volume > 0) fail('The pipette is full. Deliver the acid first.')
      if (w === 'acid') { needPPE(s, 'the acid'); if (!s.pip.filler) fail('Never pipette by mouth. Attach the pipette filler first.') }
      s.pip.wet = w
    },
    fillPipette(s, _p, params) {
      goHands(s)
      needPPE(s, 'the acid')
      if (!s.pip.filler) fail('Never pipette by mouth. Attach the pipette filler first.')
      if (s.pip.volume > 0) fail('The pipette is already full.')
      s.pip.fills = (s.pip.fills || 0) + 1
      const over = Number(seeded(params.seed, 'pipOver' + s.pip.fills, 0.5, 1.2).toFixed(2))   // drawn up above the mark
      s.pip.diluted = s.pip.wet === 'water'
      const fresh = s.pip.diluted ? 1 - PIPETTE_WET / params.Va : 1
      s.pip.volume = r4(params.Va + over); s.pip.eq = r4(s.pip.volume * fresh)
      s.pip.atMark = false
      s.pip.wet = 'acid'
    },
    adjustPipette(s, _p, params) {
      goHands(s)
      if (!(s.pip.volume > 0)) fail('Fill the pipette first.')
      if (s.pip.atMark) fail('The bottom of the meniscus is already on the mark.')
      const f = s.pip.eq / s.pip.volume
      s.pip.volume = params.Va; s.pip.eq = r4(params.Va * f); s.pip.atMark = true
    },
    deliverPipette(s) {
      goHands(s)
      const r = run(s)
      if (!(s.pip.volume > 0)) fail('Fill the pipette with the acid first.')
      if (r.acidVolume > 0) fail('This flask already contains the acid. Start a new run for another titration.')
      if (!s.flaskClean) fail('Empty the conical flask and rinse it with distilled water before adding the next portion of acid.')
      let V = s.pip.volume, eq = s.pip.eq
      if (s.flaskResidue === 'acid') { V += FLASK_ACID; eq += FLASK_ACID; note(s, 'flask_rinsed_acid') }
      if (s.pip.diluted) note(s, 'pipette_unrinsed')
      if (!s.pip.atMark) note(s, 'pipette_not_at_mark')
      r.acidVolume = r4(V); r.acidEq = r4(eq)
      s.pip.volume = 0; s.pip.eq = 0; s.pip.atMark = false; s.pip.diluted = false
      s.flaskResidue = null
    },
    rinseFlask(s, { with: w }) {
      goHands(s)
      if (!['water', 'acid'].includes(w)) fail('Rinse the flask with distilled water or with the acid.')
      const r = run(s)
      if (r.acidVolume > 0) {
        if (w === 'acid') fail('The flask already holds its portion of acid; adding more would change the result.')
        return            // washing the walls down with distilled water does not change the moles of acid
      }
      if (w === 'acid') needPPE(s, 'the acid')
      s.flaskClean = true
      s.flaskResidue = w === 'acid' ? 'acid' : null
    },
    swirl(s) {
      hands(s)
      if (!(run(s).acidVolume > 0)) fail('There is nothing in the flask to swirl.')
      run(s).unmixed = 0
    },

    // ── Used by both ─────────────────────────────────────────
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
      hands(s)
      const v = Number(volume)
      if (!(v > 0) || v > 5) fail('Add between a drop (0.05 cm³) and 5 cm³ at a time.')
      if (!s.burette.filled) fail('Fill the burette first.')
      const r = run(s)
      if (r.acidVolume === 0) fail('Pipette the acid into the flask first.')
      if (r.final != null) fail('This run is finished. Start a new run.')
      if (s.burette.reading + v > BURETTE_MAX + 1e-9) fail('The burette does not have enough solution left. Finish the run or refill it.')
      if (r.startTrue == null) r.startTrue = s.burette.reading
      let delivered = v
      // An air bubble in the jet comes out first: the level falls but no alkali reaches the flask.
      if (s.bur.jetAir > 0) {
        const air = Math.min(s.bur.jetAir, v)
        s.bur.jetAir = r4(s.bur.jetAir - air); delivered = r4(v - air)
        if (r.initial != null) note(s, 'air_bubble')
      }
      // Liquid left in the funnel drains into the burette and holds the level up.
      let drip = 0
      if (s.bur.funnel && s.bur.funnelHold > 0) {
        drip = Math.min(s.bur.funnelHold, FUNNEL_DRIP, v)
        s.bur.funnelHold = r4(s.bur.funnelHold - drip)
        if (r.initial != null) note(s, 'funnel_left')
      }
      s.burette.reading = r4(s.burette.reading + v - drip)
      r.baseAdded = r4(r.baseAdded + delivered)
      r.baseEq = r4((r.baseEq || 0) + delivered * (s.bur.factor ?? 1))
      r.unmixed = r4((r.unmixed || 0) + delivered)
      r.endTrue = s.burette.reading
      if (s.handsOn) s.eye = EYE.above            // you stand up to work the tap
    },
    recordReading(s, { which, value }) {
      hands(s)
      const v = Number(value)
      if (!Number.isFinite(v) || v < 0 || v > BURETTE_MAX) fail('Burette readings are between 0.00 and 50.00 cm³.')
      const r = run(s)
      if (which === 'initial') {
        if (!s.burette.filled) fail('Fill the burette first.')
        if (r.baseAdded > 0) fail('Record the initial reading before adding any alkali.')
        if (s.burette.reading < 0) fail('The meniscus is above the 0.00 mark, where there is no scale. Run a little solution into the waste beaker first.')
        r.initial = v
        r.startTrue = s.burette.reading
        if (s.handsOn && s.bur.factor < 0.9999) note(s, 'burette_unrinsed')
      } else if (which === 'final') {
        if (r.baseAdded === 0) fail('Add alkali from the burette before recording a final reading.')
        if (r.initial == null) fail('Record the initial reading first.')
        if (v < r.initial) fail('The final reading must be larger than the initial reading.')
        r.final = v
        if (s.handsOn && r.unmixed > 0) note(s, 'not_swirled')
      } else fail('Choose initial or final.')
      if (s.handsOn) {
        if (s.eye !== 0) note(s, 'parallax')
        s.eye = EYE.above
      }
    },
    markRough(s, { index, rough }) {
      const r = s.runs[index]
      if (!r) fail('No such run.')
      r.rough = !!rough
    },
    newRun(s) {
      hands(s)
      const r = run(s)
      if (r.final == null) fail('Record the final reading of this run first.')
      if (s.runs.length >= 6) fail('Six runs are enough. Use your concordant results.')
      s.runs.push(newRun())
      s.current = s.runs.length - 1
      if (s.handsOn) { s.flaskClean = false; s.flaskResidue = null; s.eye = EYE.above }
    },
  },

  view(params, s0) {
    const s = hands(JSON.parse(JSON.stringify(s0)))
    const r = run(s)
    const hasAcid = r.acidVolume > 0
    const pH = hasAcid ? flaskPH(params, r) : null
    const ind = r.indicatorDrops > 0 ? r.indicator : null
    const ep = ind ? endpointPH(ind) : null
    // Where unswirled alkali lands the solution is locally far more alkaline: a flash of colour that swirling removes.
    const localPH = hasAcid && r.unmixed > 0 ? flaskPH(params, r, r.unmixed * (LOCAL_MIX - 1)) : pH
    const flash = !!ind && r.unmixed > 0 && baseFraction(ind, localPH) >= 0.5 && baseFraction(ind, pH) < 0.5
    const b = s.burette
    const apparent = b.filled && b.reading != null ? r4(b.reading - s.eye * PARALLAX) : null
    return {
      acid: { id: params.acid, name: params.acidName },   // which acid (set by the teacher); its concentration stays hidden
      run: s.current + 1,
      runs: s.runs.map((x, i) => ({ n: i + 1, rough: x.rough, initial: x.initial, final: x.final, titre: titreOf(x), indicator: x.indicator })),
      flask: {
        hasAcid, volume: hasAcid ? r.acidVolume + r.baseAdded : 0, pH, indicator: ind,
        colour: hasAcid ? indicatorColour(ind, pH) : null,
        colourName: hasAcid ? colourName(ind, pH) : null,
        changed: ind ? baseFraction(ind, pH) >= 0.5 : false,
        overshot: ind ? pH > ep + 1.5 : false,
        flash, flashColour: flash ? indicatorColour(ind, localPH) : null, flashName: flash ? colourName(ind, localPH) : null,
        unmixed: r.unmixed > 0,
        clean: s.flaskClean, residue: s.flaskResidue,
      },
      burette: {
        filled: b.filled, reading: b.reading, resolution: READ_RES, max: BURETTE_MAX, fills: s.fills,
        apparent,                                   // where the meniscus appears against the scale from the student's eye position
        aboveZero: b.filled && b.reading < 0,
        funnel: s.bur.funnel, bubble: s.bur.jetAir > 0, rinsedWith: s.bur.wet,
      },
      handsOn: s.handsOn,
      ppe: { ...s.ppe },
      eye: s.eye === 1 ? 'above' : s.eye === -1 ? 'below' : 'level',
      pipette: { filler: s.pip.filler, rinsedWith: s.pip.wet, full: s.pip.volume > 0, atMark: s.pip.atMark, aboveMark: s.pip.volume > 0 && !s.pip.atMark },
      indicatorChosen: s.indicator,
      titres: titres(s),
      notes: s.notes.map(n => ({ ...n })),
      // pH is shown only as a teaching aid in the pH-meter panel (optional);
      // students find the endpoint from the indicator.
    }
  },

  dataTables(params, s0) {
    const s = hands(JSON.parse(JSON.stringify(s0)))
    const tables = [{
      title: 'Titration results',
      columns: ['Run', 'Indicator', 'Initial reading / cm³', 'Final reading / cm³', 'Titre / cm³', 'Rough?'],
      derived: [4],
      rows: s.runs.filter(r => r.initial != null || r.final != null).map((r, i) => [
        String(i + 1), r.indicator ? INDICATORS[r.indicator].name : '—',
        r.initial != null ? r.initial.toFixed(2) : '—', r.final != null ? r.final.toFixed(2) : '—',
        titreOf(r) != null ? titreOf(r).toFixed(2) : '—', r.rough ? 'yes' : 'no',
      ]),
    }]
    if (s.handsOn && s.notes.length) {
      tables.push({ title: 'Technique notes', columns: ['Run', 'What happened'], derived: [], rows: s.notes.map(n => [String(n.run), n.text]) })
    }
    return tables
  },
  graph() { return null },

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
    { id: 'technique', label: 'Burette and pipette technique', marks: 3, auto: ({ state }) => {
      if (!state.handsOn) return { na: true }      // one-click bench (older sessions): technique was not observed
      const done = state.runs.some(r => r.final != null)
      if (!done) return { marks: 0, detail: 'No titration completed.' }
      const issues = techniqueIssues(state)
      if (!issues.length) return { marks: 3, detail: 'Rinsed, filled and read the burette and pipette correctly; swirled the flask.' }
      return { marks: Math.max(0, 3 - issues.length), detail: issues.map(i => i.text + ' (run ' + i.runs.join(', ') + ')').join(' ') }
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
    { id: 'report', label: 'Analysis, evaluation and conclusion', marks: 4, auto: null, guidance: 'Indicator choice explained (1), two sources of error with improvements (2), clear conclusion with units and significant figures (1). Where the technique notes list mistakes, credit an evaluation that identifies them.' },
  ],
}

export default def
