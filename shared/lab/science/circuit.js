/**
 * circuit.js — DC circuit solver (modified nodal analysis).
 *
 * MODEL
 *   • Components are linear and ohmic: resistors, a DC supply (EMF E with
 *     internal resistance r), an ammeter (small resistance) and a voltmeter
 *     (large resistance). Switches are ideal (closed = joined, open = gap).
 *   • Wires are ideal (zero resistance). Connected terminals form one node.
 *   • Kirchhoff's current law is solved exactly with MNA; no series/parallel
 *     shortcut formulas are used, so any circuit a student wires is solved
 *     from its actual topology.
 *   • A tiny leakage conductance (1e-12 S) to ground keeps floating parts
 *     solvable: a meter that is not in a closed loop correctly reads ~0.
 *   • If the supply current exceeds its trip current (a short circuit, e.g.
 *     an ammeter wired straight across the supply) the supply trips and the
 *     result is reported as a fault, never as a plausible reading.
 *   • Temperature effects (e.g. a filament lamp) are not modelled.
 */

export const METER = {
  ammeter:   { resistance: 0.01, resolution: 0.001, unit: 'A' },
  voltmeter: { resistance: 1e7,  resolution: 0.01,  unit: 'V' },
}
const GMIN = 1e-12

const TERMINALS = {
  supply: ['+', '-'], resistor: ['a', 'b'], ammeter: ['+', '-'], voltmeter: ['+', '-'], switch: ['a', 'b'],
}
export const terminalsOf = (type) => TERMINALS[type] || []

/** Validate a circuit description; returns a list of problems (empty = OK). */
export function validateCircuit(circuit) {
  const problems = []
  const ids = new Set()
  for (const c of circuit.components || []) {
    if (!TERMINALS[c.type]) problems.push('Unknown component type: ' + c.type)
    if (ids.has(c.id)) problems.push('Duplicate component id: ' + c.id)
    ids.add(c.id)
    if (c.type === 'resistor' && !(c.resistance > 0)) problems.push(c.id + ': resistance must be positive')
    if (c.type === 'supply' && !(c.emf >= 0)) problems.push(c.id + ': EMF must be zero or positive')
  }
  for (const w of circuit.wires || []) {
    for (const end of w) {
      const [id, t] = String(end).split('.')
      const comp = (circuit.components || []).find(c => c.id === id)
      if (!comp) problems.push('Wire to unknown component: ' + end)
      else if (!TERMINALS[comp.type].includes(t)) problems.push('Wire to unknown terminal: ' + end)
    }
  }
  if (!(circuit.components || []).some(c => c.type === 'supply')) problems.push('The circuit has no power supply.')
  return problems
}

// ── Union–find over terminals (wires and closed switches join them) ──
function nodesOf(circuit) {
  const parent = {}
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
  const add = (x) => { if (!(x in parent)) parent[x] = x }
  const join = (a, b) => { add(a); add(b); const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb }
  for (const c of circuit.components) for (const t of TERMINALS[c.type]) add(c.id + '.' + t)
  for (const [a, b] of circuit.wires || []) join(a, b)
  for (const c of circuit.components) if (c.type === 'switch' && c.closed) join(c.id + '.a', c.id + '.b')
  const index = {}
  let n = 0
  for (const k of Object.keys(parent)) { const r = find(k); if (!(r in index)) index[r] = n++ }
  return { nodeOf: (term) => index[find(term)], count: n }
}

/** Solve A x = b by Gaussian elimination with partial pivoting. */
function solveLinear(A, b) {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let piv = col
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r
    if (Math.abs(M[piv][col]) < 1e-18) throw new Error('singular')
    ;[M[col], M[piv]] = [M[piv], M[col]]
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / M[col][col]
      if (f) for (let k = col; k <= n; k++) M[r][k] -= f * M[col][k]
    }
  }
  const x = new Array(n).fill(0)
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n]
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]
    x[r] = s / M[r][r]
  }
  return x
}

/**
 * Solve a circuit.
 * @returns {{ok, fault?, problems?, voltage(term), current(componentId), readings:{[id]: value}}}
 */
export function solveCircuit(circuit, { tripCurrent = 5 } = {}) {
  const problems = validateCircuit(circuit)
  if (problems.length) return { ok: false, fault: 'invalid', problems, readings: {} }
  const comps = circuit.components
  const { nodeOf, count } = nodesOf(circuit)
  const supplies = comps.filter(c => c.type === 'supply')
  const ground = nodeOf(supplies[0].id + '.-')
  // Unknowns: node voltages (except ground), each supply's internal node,
  // and each supply's branch current.
  const nodeVar = (n) => (n === ground ? -1 : (n < ground ? n : n - 1))
  const nNodes = count - 1
  const internal = {}           // supply id → internal node index (between EMF and r)
  supplies.forEach((s, i) => { internal[s.id] = nNodes + i })
  const size = nNodes + supplies.length * 2
  const A = Array.from({ length: size }, () => new Array(size).fill(0))
  const b = new Array(size).fill(0)
  const stamp = (i, j, g) => {             // conductance g between unknown i and j (−1 = ground)
    if (i >= 0) A[i][i] += g
    if (j >= 0) A[j][j] += g
    if (i >= 0 && j >= 0) { A[i][j] -= g; A[j][i] -= g }
  }
  for (let k = 0; k < nNodes + supplies.length; k++) A[k][k] += GMIN
  const R = (c) => c.type === 'resistor' ? c.resistance : c.type === 'ammeter' ? METER.ammeter.resistance : c.type === 'voltmeter' ? METER.voltmeter.resistance : null
  for (const c of comps) {
    const r = R(c)
    if (r == null) continue
    const [t1, t2] = TERMINALS[c.type]
    stamp(nodeVar(nodeOf(c.id + '.' + t1)), nodeVar(nodeOf(c.id + '.' + t2)), 1 / r)
  }
  supplies.forEach((s, i) => {
    // + terminal —[r]— internal node —(EMF)— − terminal
    const plus = nodeVar(nodeOf(s.id + '.+')), minus = nodeVar(nodeOf(s.id + '.-')), mid = internal[s.id]
    stamp(plus, mid, 1 / Math.max(s.internalResistance || 0, 1e-6))
    const row = nNodes + supplies.length + i      // EMF equation: V(mid) − V(minus) = E
    A[row][mid] += 1; if (minus >= 0) A[row][minus] -= 1
    A[mid][row] += 1; if (minus >= 0) A[minus][row] -= 1
    b[row] = s.on === false ? 0 : s.emf
  })
  let x
  try { x = solveLinear(A, b) } catch { return { ok: false, fault: 'unsolvable', problems: ['The circuit cannot be solved.'], readings: {} } }
  const V = (term) => { const v = nodeVar(nodeOf(term)); return v < 0 ? 0 : x[v] }
  const current = (id) => {                 // conventional current from first to second terminal
    const c = comps.find(q => q.id === id)
    if (!c) return 0
    if (c.type === 'supply') { const i = supplies.indexOf(c); return -x[nNodes + supplies.length + i] }
    const r = R(c)
    if (r == null) return 0
    const [t1, t2] = TERMINALS[c.type]
    return (V(c.id + '.' + t1) - V(c.id + '.' + t2)) / r
  }
  for (const s of supplies) {
    if (Math.abs(current(s.id)) > tripCurrent)
      return { ok: false, fault: 'short_circuit', problems: ['Short circuit: the supply has tripped. Check for a wire or an ammeter connected straight across the supply.'], readings: {} }
  }
  const readings = {}
  for (const c of comps) {
    if (c.type === 'ammeter') readings[c.id] = current(c.id)
    if (c.type === 'voltmeter') readings[c.id] = V(c.id + '.+') - V(c.id + '.-')
  }
  return { ok: true, voltage: V, current, readings, nodeOf }
}

/** Are two terminals electrically the same node (joined by wires/closed switches)? */
export function sameNode(circuit, t1, t2) {
  const { nodeOf } = nodesOf(circuit)
  return nodeOf(t1) === nodeOf(t2)
}

/** Equivalent resistance of resistors in series / parallel (reference formulas for tests and teaching). */
export const seriesR = (rs) => rs.reduce((a, r) => a + r, 0)
export const parallelR = (rs) => 1 / rs.reduce((a, r) => a + 1 / r, 0)
