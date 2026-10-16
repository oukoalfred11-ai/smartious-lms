import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pHOf, solutionOf, titrationPH, equivalenceVolume, volumeAtPH, KW } from '../science/acidbase.js'
import { baseFraction, colourName } from '../science/indicators.js'

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} expected ${b} ± ${tol}, got ${a}`)

test('pure water is neutral (pH 7.00)', () => close(pHOf({}), 7, 1e-6))

test('strong acid: 0.100 M HCl → pH 1.00; 1e-3 M → 3.00', () => {
  close(pHOf(solutionOf('HCl', 0.1)), 1.0, 1e-4)
  close(pHOf(solutionOf('HCl', 1e-3)), 3.0, 1e-4)
})

test('very dilute strong acid does not go above pH 7 (1e-8 M HCl → 6.98)', () => {
  // Exact: h = (C + sqrt(C² + 4Kw))/2 → pH 6.978
  const C = 1e-8, h = (C + Math.sqrt(C * C + 4 * KW)) / 2
  close(pHOf(solutionOf('HCl', C)), -Math.log10(h), 1e-6)
})

test('strong base: 0.0100 M NaOH → pH 12.00', () => close(pHOf(solutionOf('NaOH', 0.01)), 12.0, 1e-4))

test('weak acid: 0.100 M ethanoic acid → pH 2.88 (exact quadratic)', () => {
  const Ka = 1.74e-5, C = 0.1
  const h = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C)) / 2
  close(pHOf(solutionOf('CH3COOH', C)), -Math.log10(h), 1e-4)
  close(pHOf(solutionOf('CH3COOH', C)), 2.88, 0.01)
})

test('weak base: 0.100 M ammonia → pH 11.13', () => close(pHOf(solutionOf('NH3', 0.1)), 11.125, 0.01))

test('titration HCl/NaOH: start, half-way, equivalence (7.00) and excess', () => {
  const p = { acid: 'HCl', Ca: 0.1, Va: 25, Cb: 0.1 }
  close(titrationPH({ ...p, Vb: 0 }), 1.0, 1e-4)
  // half-way: 0.00125 mol H+ left in 37.5 cm³ → 0.03333 M → pH 1.477
  close(titrationPH({ ...p, Vb: 12.5 }), -Math.log10(0.00125 / 0.0375), 1e-4)
  close(titrationPH({ ...p, Vb: 25 }), 7.0, 1e-4)
  // 1.00 cm³ excess: 1e-4 mol OH- in 51 cm³ → pOH 2.708 → pH 11.29
  close(titrationPH({ ...p, Vb: 26 }), 14 + Math.log10(1e-4 / 0.051), 1e-3)
})

test('weak acid titration: pH = pKa at half-equivalence, basic at equivalence', () => {
  const p = { acid: 'CH3COOH', Ca: 0.1, Va: 25, Cb: 0.1 }
  close(titrationPH({ ...p, Vb: 12.5 }), -Math.log10(1.74e-5), 0.01)
  // equivalence: 0.05 M ethanoate, Kb = Kw/Ka → pH ≈ 8.73
  const Cs = 0.0025 / 0.05, Kb = KW / 1.74e-5
  close(titrationPH({ ...p, Vb: 25 }), 14 + Math.log10(Math.sqrt(Kb * Cs)), 0.02)
})

test('equivalence volume and indicator endpoints', () => {
  assert.equal(equivalenceVolume({ Ca: 0.1, Va: 25, Cb: 0.1 }), 25)
  const strong = { acid: 'HCl', Ca: 0.1, Va: 25, Cb: 0.1 }
  // phenolphthalein (pKIn 9.3) on strong acid: endpoint within 0.05 cm³ of equivalence
  close(volumeAtPH(strong, 9.3), 25, 0.05)
  // methyl orange on a weak acid ends far too early: why indicator choice matters
  const weak = { acid: 'CH3COOH', Ca: 0.1, Va: 25, Cb: 0.1 }
  assert.ok(volumeAtPH(weak, 3.7) < 3, 'methyl orange changes after ~2 cm³ with ethanoic acid, far before equivalence')
  close(volumeAtPH(weak, 9.3), 25, 0.1)
})

test('pH is monotonic during titration (no scripted jumps)', () => {
  const p = { acid: 'CH3COOH', Ca: 0.1, Va: 25, Cb: 0.1 }
  let prev = -Infinity
  for (let v = 0; v <= 40; v += 0.05) { const ph = titrationPH({ ...p, Vb: v }); assert.ok(ph > prev); prev = ph }
})

test('indicator colour follows the equilibrium fraction', () => {
  close(baseFraction('phenolphthalein', 9.3), 0.5, 1e-9)
  assert.equal(colourName('phenolphthalein', 7), 'colourless')
  assert.equal(colourName('phenolphthalein', 11), 'pink')
  assert.equal(colourName('methyl_orange', 2), 'red')
  assert.equal(colourName('methyl_orange', 6), 'yellow')
})

test('invalid inputs are rejected', () => {
  assert.throws(() => pHOf({ strongAcid: -1 }))
  assert.throws(() => titrationPH({ acid: 'NaOH', Ca: 0.1, Va: 25, Cb: 0.1, Vb: 0 }))
  assert.throws(() => titrationPH({ acid: 'HCl', Ca: 0.1, Va: 0, Cb: 0.1, Vb: 0 }))
})
