/**
 * osmosis.js — mass change of plant tissue in sucrose solutions.
 *
 * SIMPLIFIED EDUCATIONAL MODEL (stated to students):
 *   • Each tissue sample has an isotonic sucrose concentration C_iso: the
 *     concentration whose water potential equals the tissue's. For potato
 *     tissue this is typically 0.2–0.4 mol dm⁻³.
 *   • Net water movement, and so the final % change in mass, is taken as
 *     proportional to the concentration difference (C_iso − C): water enters
 *     the tissue from more dilute solutions and leaves it into more
 *     concentrated ones. This linear relationship is an approximation that
 *     holds best near C_iso.
 *   • The change approaches its equilibrium value exponentially with time
 *     constant τ (minutes): Δ%(t) = Δ%eq · (1 − e^(−t/τ)).
 *   • Gain is limited by the cell wall (full turgor) and loss by plasmolysis;
 *     the equilibrium change is capped at +MAX_GAIN % and −MAX_LOSS %.
 *   • Solute diffusion into cells, tissue damage at the cut surface and
 *     temperature effects are not modelled.
 *   • Real samples vary; the model adds a small, reproducible blotting error
 *     (± ≤ 0.02 g) to each final weighing.
 */
export const DEFAULTS = { slope: 40, tau: 45, MAX_GAIN: 18, MAX_LOSS: 32 }

/** Equilibrium % change in mass for a solution of concentration C (mol dm⁻³). */
export function equilibriumChange(C, Ciso, p = DEFAULTS) {
  if (!(C >= 0) || !(Ciso > 0)) throw new Error('Concentrations must be non-negative (C_iso positive).')
  const raw = p.slope * (Ciso - C)
  return Math.max(-p.MAX_LOSS, Math.min(p.MAX_GAIN, raw))
}

/** % change after t minutes. */
export function percentChange(C, Ciso, tMin, p = DEFAULTS) {
  if (!(tMin >= 0)) throw new Error('Time cannot be negative.')
  return equilibriumChange(C, Ciso, p) * (1 - Math.exp(-tMin / p.tau))
}

/** Mass after t minutes from an initial mass (g). */
export const massAfter = (m0, C, Ciso, tMin, p = DEFAULTS) => m0 * (1 + percentChange(C, Ciso, tMin, p) / 100)

/** % change from two masses — what students calculate. */
export const percentFromMasses = (m0, m1) => ((m1 - m0) / m0) * 100
