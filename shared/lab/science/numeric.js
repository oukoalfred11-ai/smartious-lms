/**
 * numeric.js — small numerical helpers used by every model.
 * Pure functions, no dependencies.
 */

/** Round to a number of significant figures (returns a Number). */
export function toSigFigs(x, sf) {
  if (!Number.isFinite(x) || x === 0) return x
  const d = Math.ceil(Math.log10(Math.abs(x)))
  const p = sf - d
  const m = Math.pow(10, p)
  return Math.round(x * m) / m
}

/** Round to an instrument's resolution (e.g. 0.05 cm³ burette, 0.01 g balance). */
export function toResolution(x, res) {
  if (!Number.isFinite(x)) return x
  const r = Math.round(x / res) * res
  // tidy binary float noise (0.30000000000000004 → 0.3)
  const dp = Math.max(0, -Math.floor(Math.log10(res)) + 2)
  return Number(r.toFixed(dp))
}

/** Number of decimal places implied by a resolution (0.05 → 2, 0.1 → 1). */
export function decimalsFor(res) {
  return Math.max(0, Math.ceil(-Math.log10(res) - 1e-9))
}

/** Is |a − b| within an absolute or relative tolerance? */
export function within(actual, expected, { abs = 0, rel = 0 } = {}) {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false
  const tol = Math.max(abs, Math.abs(expected) * rel)
  return Math.abs(actual - expected) <= tol + 1e-12
}

/**
 * Bisection root finder for a function that changes sign on [lo, hi].
 * Works in whatever variable it is given (the acid–base solver passes
 * log10[H+]). Deterministic and unconditionally convergent.
 */
export function bisect(f, lo, hi, { tol = 1e-12, maxIter = 200 } = {}) {
  let flo = f(lo), fhi = f(hi)
  if (flo === 0) return lo
  if (fhi === 0) return hi
  if (Math.sign(flo) === Math.sign(fhi)) throw new Error('bisect: root not bracketed')
  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2
    const fm = f(mid)
    if (fm === 0 || (hi - lo) / 2 < tol) return mid
    if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm } else { hi = mid; fhi = fm }
  }
  return (lo + hi) / 2
}

/** Least-squares straight line y = m x + c, with r². */
export function linearFit(points) {
  const pts = points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
  const n = pts.length
  if (n < 2) return null
  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0
  for (const { x, y } of pts) { sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y }
  const den = n * sxx - sx * sx
  if (den === 0) return null
  const m = (n * sxy - sx * sy) / den
  const c = (sy - m * sx) / n
  const ssTot = syy - (sy * sy) / n
  const ssRes = pts.reduce((a, { x, y }) => a + Math.pow(y - (m * x + c), 2), 0)
  return { m, c, r2: ssTot === 0 ? 1 : 1 - ssRes / ssTot, n }
}

/** Line through the origin y = m x (least squares). */
export function fitThroughOrigin(points) {
  const pts = points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
  const sxx = pts.reduce((a, p) => a + p.x * p.x, 0)
  if (!pts.length || sxx === 0) return null
  return { m: pts.reduce((a, p) => a + p.x * p.y, 0) / sxx, n: pts.length }
}

/** Mean of numbers. */
export const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length
