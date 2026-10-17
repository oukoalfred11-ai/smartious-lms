/**
 * instruments.js — how real instruments show a value, for the hands-on
 * bench (session option `bench: 2`).
 *
 * Pure functions, no state. The engine (practical.js, ohms-law.js) uses
 * them to decide what an instrument SHOWS; the browser uses the same
 * numbers to draw the close-up the student reads. So the needle, scale
 * or display the student looks at is exactly what the grader treats as
 * "shown".
 *
 *   instrumentKind(id, reading)        'dial' | 'rule' | 'vernier' | 'micrometer' | 'thermometer' | 'stopwatch' | 'digital' | 'plain'
 *   dialScale(maxAbs, resolution)      full scale and division of an analogue meter (or null: use a digital display)
 *   displayPosition(raw, shown, res)   where to draw a pointer so that rounding to the resolution is unambiguous
 *   parallaxShift(eye, division, k)    apparent shift of a pointer read off-square
 *   flickerAlt(raw, shown, res)        the other value a digital display flickers to (or null)
 *   vernierParts(mm, n)                main-scale and coinciding vernier line
 *   micrometerParts(mm)                sleeve and thimble readings (zero error included in mm)
 *   cycleTiming(tFixed, fixedCycles, cycles, tTrue)  stopwatch reading when a different number of cycles is timed
 */

// Analogue instruments that may be drawn as a needle on a scale.
export const DIAL_INSTRUMENTS = ['ammeter', 'voltmeter', 'milliammeter', 'millivoltmeter', 'newton_meter', 'pressure_gauge']
// Digital displays whose last digit flickers when the value sits between two digits.
export const FLICKER_INSTRUMENTS = ['multimeter', 'top_pan_balance', 'ammeter', 'voltmeter', 'milliammeter', 'millivoltmeter', 'hall_probe', 'light_meter', 'datalogger']
// Readings that take a moment to settle after something is changed
// (a needle swinging, a thermometer catching up, a loaded spring bouncing).
export const SETTLING_INSTRUMENTS = ['ammeter', 'voltmeter', 'milliammeter', 'millivoltmeter', 'multimeter', 'thermometer', 'newton_meter', 'hall_probe', 'light_meter', 'pressure_gauge', 'top_pan_balance']
// Read against a scale, so the eye position matters.
export const PARALLAX_KINDS = ['dial', 'rule', 'thermometer']
// Instruments whose zero must be checked (and corrected) before use.
export const ZERO_INSTRUMENTS = ['micrometer']
export const TARE_INSTRUMENTS = ['top_pan_balance']

const near = (a, b) => Math.abs(a - b) < 1e-9

/** The smallest 1, 2 or 5 × 10ⁿ at or above v. */
export function niceCeil(v) {
  if (!(v > 0)) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  for (const m of [1, 2, 5, 10]) if (m * p >= v - 1e-12) return Number((m * p).toPrecision(6))
  return 10 * p
}

/**
 * Scale of an analogue meter able to show `maxAbs`, read to `resolution`.
 * A student reads to the nearest division, or to half a division when the
 * divisions are twice the resolution. If neither gives a sensible scale
 * (25–100 divisions), the instrument is drawn as a digital display.
 */
export function dialScale(maxAbs, resolution) {
  if (!(resolution > 0)) return null
  const fs = niceCeil(Math.max(Math.abs(maxAbs) * 1.15, resolution * 10))
  const steps = fs / resolution
  if (steps <= 50 + 1e-9) return { fullScale: fs, division: resolution, divisions: Math.round(steps), half: false }
  if (steps <= 200 + 1e-9) return { fullScale: fs, division: 2 * resolution, divisions: Math.round(steps / 2), half: true }
  return null
}

/** How an instrument is drawn for the student to read. */
export function instrumentKind(id, { unit, resolution } = {}) {
  if (id === 'vernier_callipers' && (unit === 'cm' || unit === 'mm')) return 'vernier'
  if (id === 'micrometer' && unit === 'mm') return 'micrometer'
  if ((id === 'metre_rule' || id === 'ruler_30cm') && unit === 'cm' && near(resolution, 0.1)) return 'rule'
  if (id === 'thermometer' && unit === '°C' && near(resolution, 0.5)) return 'thermometer'
  if (id === 'stopwatch') return 'stopwatch'
  if (DIAL_INSTRUMENTS.includes(id)) return 'dial'          // falls back to 'digital' if no scale fits
  if (['multimeter', 'top_pan_balance', 'digital_callipers', 'light_gate', 'gm_tube', 'hall_probe', 'light_meter', 'datalogger', 'signal_generator', 'oscilloscope', 'joulemeter'].includes(id)) return 'digital'
  return 'plain'
}

/**
 * Where to draw the pointer (needle, spring pointer, meniscus): at the
 * true value, but never so close to half-way between two marks that a
 * careful reader could round either way.
 */
export function displayPosition(raw, shown, resolution, margin = 0.3) {
  if (!Number.isFinite(raw) || !Number.isFinite(shown)) return shown
  const d = Math.max(-margin * resolution, Math.min(margin * resolution, raw - shown))
  return shown + d
}

/**
 * Parallax: the pointer stands a little in front of the scale, so an eye
 * that is not square-on sees it shifted. eye is −1 … 1 (0 = square-on);
 * at eye = ±1 the shift is k divisions.
 */
export function parallaxShift(eye, division, k = 1.5) {
  const e = Math.max(-1, Math.min(1, Number(eye) || 0))
  return e * k * division
}

/**
 * A digital display whose true value lies near the boundary between two
 * digits flickers between them. Returns the other value it shows, or null
 * when the display is steady.
 */
export function flickerAlt(raw, shown, resolution, threshold = 0.2) {
  if (!Number.isFinite(raw) || !Number.isFinite(shown) || !(resolution > 0)) return null
  const d = raw - shown
  if (Math.abs(d) <= threshold * resolution) return null
  return Number((shown + Math.sign(d) * resolution).toFixed(10))
}

/**
 * Vernier callipers: `mm` is the jaw opening (already a whole number of
 * vernier steps), n the number of vernier divisions (10 → 0.1 mm, 50 →
 * 0.02 mm). The main-scale reading is the last millimetre mark before the
 * vernier zero; `line` is the vernier line that coincides with a main mark.
 */
export function vernierParts(mm, n = 10) {
  const step = 1 / n
  const k = Math.round(mm / step)
  const main = Math.floor((k * step) + 1e-9)
  const line = k - main * n
  return { main, line, step, value: Number((main + line * step).toFixed(6)) }
}

/**
 * Micrometer screw gauge (0.5 mm pitch, 50 thimble divisions): the sleeve
 * shows whole and half millimetres; the thimble the hundredths. Negative
 * readings (a negative zero error) put the thimble zero below the datum line.
 */
export function micrometerParts(mm) {
  const k = Math.round(mm * 100)                      // hundredths of a millimetre
  const halfMm = Math.floor(k / 50)                   // completed half-millimetres (may be −1)
  const thimble = k - halfMm * 50                     // 0 … 49 divisions
  return { sleeve: halfMm * 0.5, thimble, value: k / 100 }
}

/**
 * Stopwatch reading when the student times `cycles` oscillations instead
 * of the `fixedCycles` the model reading `tFixed` is for. The human timing
 * error (starting and stopping late or early) is already in tFixed and is
 * the same however many cycles are timed, so timing more cycles divides it
 * between more periods. tTrue is the error-free time for fixedCycles.
 */
export function cycleTiming(tFixed, fixedCycles, cycles, tTrue) {
  const T = tTrue / fixedCycles
  return tFixed + (cycles - fixedCycles) * T
}

/** Reading effect of a needle or spring that has not yet settled: a seeded overshoot. */
export function unsettledReading(raw, { relative = 0.05, absolute = 0, sign = 1 } = {}) {
  return raw + sign * (Math.abs(raw) * relative + absolute)
}
