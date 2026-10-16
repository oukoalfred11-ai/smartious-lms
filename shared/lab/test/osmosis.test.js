import { test } from 'node:test'
import assert from 'node:assert/strict'
import { equilibriumChange, percentChange, massAfter, percentFromMasses, DEFAULTS } from '../science/osmosis.js'

test('no net change at the isotonic concentration', () => {
  assert.equal(equilibriumChange(0.3, 0.3), 0)
  assert.equal(percentChange(0.3, 0.3, 120), 0)
})
test('gain in dilute solutions, loss in concentrated ones', () => {
  assert.ok(equilibriumChange(0, 0.3) > 0)
  assert.ok(equilibriumChange(0.8, 0.3) < 0)
})
test('equilibrium change is capped by turgor and plasmolysis', () => {
  assert.equal(equilibriumChange(0, 1.0), DEFAULTS.MAX_GAIN)
  assert.equal(equilibriumChange(2.0, 0.3), -DEFAULTS.MAX_LOSS)
})
test('approach to equilibrium follows 1 − e^(−t/τ)', () => {
  const eq = equilibriumChange(0.1, 0.3)
  assert.ok(Math.abs(percentChange(0.1, 0.3, DEFAULTS.tau) - eq * (1 - Math.exp(-1))) < 1e-12)
  assert.equal(percentChange(0.1, 0.3, 0), 0)
})
test('mass and % change are consistent', () => {
  const m1 = massAfter(2.0, 0.5, 0.3, 60)
  assert.ok(Math.abs(percentFromMasses(2.0, m1) - percentChange(0.5, 0.3, 60)) < 1e-9)
})
test('invalid inputs are rejected', () => {
  assert.throws(() => equilibriumChange(-0.1, 0.3))
  assert.throws(() => percentChange(0.1, 0.3, -5))
})
