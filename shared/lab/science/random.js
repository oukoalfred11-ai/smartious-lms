/**
 * random.js — seeded, reproducible randomness.
 * The same session seed always gives the same unknown concentration,
 * resistor value or tissue sample, so a saved experiment reloads to
 * exactly the same physical situation and the server can re-mark it.
 */
export function hashSeed(text) {
  let h = 2166136261 >>> 0
  for (const ch of String(text)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  return h >>> 0
}

/** mulberry32: small, fast, well-distributed 32-bit PRNG. */
export function rng(seed) {
  let a = (typeof seed === 'number' ? seed : hashSeed(seed)) >>> 0
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Uniform number in [lo, hi). */
export const uniform = (r, lo, hi) => lo + (hi - lo) * r()

/** Deterministic value for a named quantity within a session. */
export function seeded(seed, name, lo, hi) {
  return uniform(rng(hashSeed(seed + '|' + name)), lo, hi)
}

/** Pick one element deterministically. */
export function pick(seed, name, list) {
  return list[Math.floor(seeded(seed, name, 0, list.length)) % list.length]
}
