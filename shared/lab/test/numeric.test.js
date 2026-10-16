import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toSigFigs, toResolution, within, linearFit, bisect } from '../science/numeric.js'
import { seeded } from '../science/random.js'

test('significant figures', () => {
  assert.equal(toSigFigs(0.0123456, 3), 0.0123)
  assert.equal(toSigFigs(24.96, 3), 25.0)
  assert.equal(toSigFigs(1234.5, 2), 1200)
})
test('instrument resolution', () => {
  assert.equal(toResolution(24.37, 0.05), 24.35)
  assert.equal(toResolution(24.38, 0.05), 24.4)
  assert.equal(toResolution(0.1 + 0.2, 0.01), 0.3)
})
test('tolerances', () => {
  assert.ok(within(0.1015, 0.1, { rel: 0.02 }))
  assert.ok(!within(0.103, 0.1, { rel: 0.02 }))
  assert.ok(within(25.04, 25, { abs: 0.05 }))
})
test('linear fit recovers slope and intercept', () => {
  const f = linearFit([1, 2, 3, 4].map(x => ({ x, y: 2 * x + 1 })))
  assert.ok(Math.abs(f.m - 2) < 1e-12 && Math.abs(f.c - 1) < 1e-12 && Math.abs(f.r2 - 1) < 1e-12)
})
test('bisection finds a root and rejects unbracketed intervals', () => {
  assert.ok(Math.abs(bisect(x => x * x - 2, 0, 2) - Math.SQRT2) < 1e-10)
  assert.throws(() => bisect(x => x * x + 1, 0, 2))
})
test('seeded values are reproducible and in range', () => {
  const a = seeded('session-1', 'Ca', 0.08, 0.12)
  assert.equal(a, seeded('session-1', 'Ca', 0.08, 0.12))
  assert.notEqual(a, seeded('session-2', 'Ca', 0.08, 0.12))
  assert.ok(a >= 0.08 && a < 0.12)
})
