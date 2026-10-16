/**
 * indicators.js — acid–base indicators.
 *
 * MODEL: HIn ⇌ H⁺ + In⁻ with pKIn. The fraction in the base form is
 *   f = 1 / (1 + 10^(pKIn − pH)).
 * The perceived colour is the mix of the two forms' colours weighted by f
 * (a reasonable visual approximation; real perception is not linear).
 * Each indicator's visible change range (pKIn ± ~1) is from standard data.
 * The "endpoint" a student sees is therefore a consequence of the
 * equilibrium pH, never a scripted volume.
 */
export const INDICATORS = {
  phenolphthalein: { name: 'Phenolphthalein', pKIn: 9.3, range: [8.2, 10.0], acidColour: [255, 255, 255, 0], baseColour: [214, 51, 132, 0.85] },
  methyl_orange:   { name: 'Methyl orange',   pKIn: 3.7, range: [3.1, 4.4],  acidColour: [220, 40, 40, 0.75], baseColour: [240, 200, 40, 0.75] },
  bromothymol_blue:{ name: 'Bromothymol blue', pKIn: 7.1, range: [6.0, 7.6], acidColour: [235, 210, 40, 0.7], baseColour: [40, 90, 210, 0.75] },
}

export function baseFraction(indicator, pH) {
  const d = INDICATORS[indicator]
  if (!d) throw new Error('Unknown indicator: ' + indicator)
  return 1 / (1 + Math.pow(10, d.pKIn - pH))
}

/** RGBA colour of the solution for a given pH (null indicator → clear). */
export function indicatorColour(indicator, pH) {
  if (!indicator) return [235, 242, 250, 0.25]
  const d = INDICATORS[indicator]
  const f = baseFraction(indicator, pH)
  return d.acidColour.map((a, i) => a + (d.baseColour[i] - a) * f)
}

/** A plain-words description so colour is never the only cue. */
export function colourName(indicator, pH) {
  if (!indicator) return 'colourless'
  const f = baseFraction(indicator, pH)
  const names = {
    phenolphthalein: f < 0.05 ? 'colourless' : f < 0.5 ? 'very pale pink' : 'pink',
    methyl_orange: f < 0.1 ? 'red' : f < 0.9 ? 'orange' : 'yellow',
    bromothymol_blue: f < 0.1 ? 'yellow' : f < 0.9 ? 'green' : 'blue',
  }
  return names[indicator]
}

/**
 * pH at which a student sees a definite, permanent change — taken as the
 * point where 50% of the indicator is in the base form (pH = pKIn).
 * Used for expected-value calculations with tolerance.
 */
export const endpointPH = (indicator) => INDICATORS[indicator].pKIn
