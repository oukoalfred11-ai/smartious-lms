/**
 * acidbase.js — aqueous acid–base equilibrium at 25 °C.
 *
 * MODEL
 *   A solution is described by the total (analytical) concentrations of:
 *     strong acids (fully dissociated, e.g. HCl → H⁺ + Cl⁻)       → anion conc.
 *     strong bases (fully dissociated, e.g. NaOH → Na⁺ + OH⁻)     → cation conc.
 *     weak monoprotic acids HA with Ka (e.g. ethanoic acid)
 *     weak monoprotic bases B with Kb (e.g. ammonia)
 *   [H⁺] is found from the exact charge balance
 *     [H⁺] + [Na⁺] + Σ[BH⁺] = [OH⁻] + [Cl⁻] + Σ[A⁻]
 *   with [OH⁻] = Kw/[H⁺], [A⁻] = C·Ka/(Ka+[H⁺]), [BH⁺] = C·[H⁺]/([H⁺]+Kw/Kb).
 *   The left minus right side is strictly increasing in [H⁺], so bisection on
 *   log10[H⁺] always finds the unique root. No "strong/weak" shortcut
 *   formula is used, so the same code is correct at the start of a titration,
 *   in the buffer region, at equivalence and past it.
 *
 * ASSUMPTIONS (stated to students in the experiment notes)
 *   • 25 °C, Kw = 1.0 × 10⁻¹⁴.
 *   • Ideal dilute solutions: concentrations used in place of activities, so
 *     pH is the ideal value; real meters differ slightly at high ionic strength.
 *   • Volumes are additive on mixing; CO₂ absorption is ignored.
 *   • Only monoprotic acids and bases are modelled here (no H₂SO₄, H₃PO₄).
 */
import { bisect } from './numeric.js'

export const KW = 1.0e-14

/** Reference data (25 °C). Ka/Kb from standard data tables. */
export const SUBSTANCES = {
  HCl:     { name: 'Hydrochloric acid', formula: 'HCl', kind: 'strong_acid' },
  HNO3:    { name: 'Nitric acid', formula: 'HNO₃', kind: 'strong_acid' },
  CH3COOH: { name: 'Ethanoic acid', formula: 'CH₃COOH', kind: 'weak_acid', Ka: 1.74e-5 },
  NaOH:    { name: 'Sodium hydroxide', formula: 'NaOH', kind: 'strong_base' },
  KOH:     { name: 'Potassium hydroxide', formula: 'KOH', kind: 'strong_base' },
  NH3:     { name: 'Ammonia', formula: 'NH₃', kind: 'weak_base', Kb: 1.78e-5 },
  H2O:     { name: 'Distilled water', formula: 'H₂O', kind: 'water' },
}

/**
 * Hydrogen-ion concentration of a solution.
 * @param {object} s { strongAcid, strongBase, weakAcids:[{C,Ka}], weakBases:[{C,Kb}] } in mol dm⁻³
 */
export function hydrogenIon(s) {
  const Ca = s.strongAcid || 0
  const Cb = s.strongBase || 0
  const wa = s.weakAcids || []
  const wb = s.weakBases || []
  for (const v of [Ca, Cb, ...wa.map(x => x.C), ...wb.map(x => x.C)])
    if (!(v >= 0) || !Number.isFinite(v)) throw new Error('Concentrations must be finite and non-negative.')
  const balance = (logH) => {
    const h = Math.pow(10, logH)
    let pos = h + Cb
    for (const b of wb) pos += b.C * h / (h + KW / b.Kb)
    let neg = KW / h + Ca
    for (const a of wa) neg += a.C * a.Ka / (a.Ka + h)
    return pos - neg
  }
  return Math.pow(10, bisect(balance, -16, 2, { tol: 1e-13 }))
}

export const pHOf = (s) => -Math.log10(hydrogenIon(s))

/** Composition of a single named substance at concentration C. */
export function solutionOf(substance, C) {
  const d = SUBSTANCES[substance]
  if (!d) throw new Error('Unknown substance: ' + substance)
  if (d.kind === 'strong_acid') return { strongAcid: C }
  if (d.kind === 'strong_base') return { strongBase: C }
  if (d.kind === 'weak_acid') return { weakAcids: [{ C, Ka: d.Ka }] }
  if (d.kind === 'weak_base') return { weakBases: [{ C, Kb: d.Kb }] }
  return {}
}

/**
 * pH during the titration of a monoprotic acid (in the flask) with a strong
 * base (in the burette).
 * @param {object} p { acid:'HCl'|'CH3COOH', Ca, Va (cm³), Cb, Vb (cm³) }
 */
export function titrationPH({ acid, Ca, Va, Cb, Vb }) {
  if (!(Va > 0)) throw new Error('Flask volume must be positive.')
  if (!(Vb >= 0)) throw new Error('Added volume cannot be negative.')
  const Vt = Va + Vb
  const nAcid = Ca * Va / 1000
  const nBase = Cb * Vb / 1000
  const d = SUBSTANCES[acid]
  if (!d || (d.kind !== 'strong_acid' && d.kind !== 'weak_acid')) throw new Error('Flask must contain a monoprotic acid.')
  const mix = { strongBase: nBase / (Vt / 1000) }
  if (d.kind === 'strong_acid') mix.strongAcid = nAcid / (Vt / 1000)
  else mix.weakAcids = [{ C: nAcid / (Vt / 1000), Ka: d.Ka }]
  return pHOf(mix)
}

/** Volume of base (cm³) needed to reach the equivalence point. */
export const equivalenceVolume = ({ Ca, Va, Cb }) => Ca * Va / Cb

/** Smallest Vb at which pH reaches the target (monotonic search). */
export function volumeAtPH(p, targetPH, { maxVb = 100 } = {}) {
  const f = (Vb) => titrationPH({ ...p, Vb }) - targetPH
  if (f(0) >= 0) return 0
  if (f(maxVb) < 0) return null
  return bisect(f, 0, maxVb, { tol: 1e-7 })
}

/** Points of a titration curve for graphs (pure data). */
export function titrationCurve(p, { to = 50, step = 0.25 } = {}) {
  const pts = []
  for (let v = 0; v <= to + 1e-9; v += step) pts.push({ x: Number(v.toFixed(4)), y: titrationPH({ ...p, Vb: v }) })
  return pts
}
