import { test } from 'node:test'
import assert from 'node:assert/strict'
import { solveCircuit, seriesR, parallelR, METER } from '../science/circuit.js'

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} expected ${b} ± ${tol}, got ${a}`)

// Standard Ohm's-law circuit: supply → switch → ammeter → R → back; voltmeter across R.
function ohmCircuit({ emf = 6, r = 0, R = 20, closed = true, voltmeterAcross = true } = {}) {
  return {
    components: [
      { id: 'PS', type: 'supply', emf, internalResistance: r },
      { id: 'S1', type: 'switch', closed },
      { id: 'A1', type: 'ammeter' },
      { id: 'R1', type: 'resistor', resistance: R },
      { id: 'V1', type: 'voltmeter' },
    ],
    wires: [
      ['PS.+', 'S1.a'], ['S1.b', 'A1.+'], ['A1.-', 'R1.a'], ['R1.b', 'PS.-'],
      ...(voltmeterAcross ? [['V1.+', 'R1.a'], ['V1.-', 'R1.b']] : []),
    ],
  }
}

test("Ohm's law: I = V/R with ideal supply (meter resistances included)", () => {
  const s = solveCircuit(ohmCircuit({ emf: 6, R: 20 }))
  assert.ok(s.ok)
  const Rtot = 20 + METER.ammeter.resistance
  close(s.readings.A1, 6 / Rtot, 1e-5, 'ammeter')
  close(s.readings.V1, 6 * 20 / Rtot, 1e-3, 'voltmeter')
  close(s.readings.V1 / s.readings.A1, 20, 0.01, 'V/I = R')
})

test('internal resistance lowers the terminal voltage', () => {
  const s = solveCircuit(ohmCircuit({ emf: 6, r: 1, R: 20 }))
  close(s.readings.A1, 6 / (21.01), 1e-4)
  close(s.readings.V1, 20 * 6 / 21.01, 1e-3)
})

test('open switch: no current, no voltage across the resistor', () => {
  const s = solveCircuit(ohmCircuit({ closed: false }))
  assert.ok(s.ok)
  close(s.readings.A1, 0, 1e-6)
  close(s.readings.V1, 0, 1e-4)
})

test('voltmeter wired in series instead of ammeter gives ~0 current (not a plausible false reading)', () => {
  const c = {
    components: [{ id: 'PS', type: 'supply', emf: 6 }, { id: 'V1', type: 'voltmeter' }, { id: 'R1', type: 'resistor', resistance: 20 }],
    wires: [['PS.+', 'V1.+'], ['V1.-', 'R1.a'], ['R1.b', 'PS.-']],
  }
  const s = solveCircuit(c)
  assert.ok(s.ok)
  close(s.readings.V1, 6, 1e-3, 'voltmeter in series reads ~EMF')
  close(s.current('R1'), 6 / 1e7, 1e-9, 'almost no current flows')
})

test('ammeter straight across the supply trips it (short circuit fault)', () => {
  const c = {
    components: [{ id: 'PS', type: 'supply', emf: 6, internalResistance: 0.5 }, { id: 'A1', type: 'ammeter' }],
    wires: [['PS.+', 'A1.+'], ['A1.-', 'PS.-']],
  }
  const s = solveCircuit(c)
  assert.equal(s.ok, false)
  assert.equal(s.fault, 'short_circuit')
  assert.deepEqual(s.readings, {})
})

test('series and parallel networks match the reference formulas', () => {
  const R1 = 10, R2 = 22, R3 = 47, E = 9
  // R1 in series with (R2 ∥ R3)
  const c = {
    components: [
      { id: 'PS', type: 'supply', emf: E }, { id: 'A1', type: 'ammeter' },
      { id: 'R1', type: 'resistor', resistance: R1 }, { id: 'R2', type: 'resistor', resistance: R2 }, { id: 'R3', type: 'resistor', resistance: R3 },
    ],
    wires: [['PS.+', 'A1.+'], ['A1.-', 'R1.a'], ['R1.b', 'R2.a'], ['R1.b', 'R3.a'], ['R2.b', 'PS.-'], ['R3.b', 'PS.-']],
  }
  const s = solveCircuit(c)
  const Req = seriesR([R1, parallelR([R2, R3]), METER.ammeter.resistance])
  close(s.readings.A1, E / Req, 1e-6, 'total current')
  const Vp = (E / Req) * parallelR([R2, R3])
  close(s.current('R2'), Vp / R2, 1e-6, 'branch R2')
  close(s.current('R3'), Vp / R3, 1e-6, 'branch R3')
  close(s.current('R2') + s.current('R3'), s.readings.A1, 1e-9, 'KCL at the junction')
})

test('reversed meter leads give a negative reading', () => {
  const c = ohmCircuit()
  c.wires = c.wires.map(w => w.map(t => t === 'V1.+' ? 'V1.-' : t === 'V1.-' ? 'V1.+' : t))
  assert.ok(solveCircuit(c).readings.V1 < 0)
})

test('invalid circuits are rejected with reasons', () => {
  assert.equal(solveCircuit({ components: [{ id: 'R1', type: 'resistor', resistance: 10 }], wires: [] }).fault, 'invalid')
  assert.equal(solveCircuit({ components: [{ id: 'PS', type: 'supply', emf: 6 }, { id: 'R1', type: 'resistor', resistance: -5 }], wires: [] }).fault, 'invalid')
  assert.equal(solveCircuit({ components: [{ id: 'PS', type: 'supply', emf: 6 }], wires: [['PS.+', 'X.a']] }).fault, 'invalid')
})
