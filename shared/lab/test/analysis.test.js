import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseFormula, evaluate, computeTable, shiftRefs, parseCell, decimalsWritten, sigFigsWritten, formatValue,
  rawFromBench, graphPoints, graphResults, computeCalcs, checkAnalysis, cleanAnalysis, axesOf, lineOf,
} from '../analysis.js'
import { EXPERIMENTS } from '../experiments/index.js'

const ev = (src, env = {}) => evaluate(parseFormula(src), env)

test('formulas: precedence, functions, degrees, implicit multiplication', () => {
  assert.equal(ev('1 + 2 * 3'), 7)
  assert.equal(ev('2^3^2'), 512)
  assert.equal(ev('-2^2'), -4)
  assert.equal(ev('(1+2)*3'), 9)
  assert.ok(Math.abs(ev('sin(30)') - 0.5) < 1e-12)
  assert.ok(Math.abs(ev('2pi') - 2 * Math.PI) < 1e-12)
  assert.equal(ev('lg(1000)'), 3)
  assert.equal(ev('Sqrt(16)'), 4)
  assert.equal(ev('3 × 4 ÷ 2 − 1'), 5)
  assert.equal(ev('A / B', { ref: (l) => ({ A: 6, B: 3 })[l] }), 2)
  assert.equal(ev('mean(A)', { column: () => [1, 2, 3] }), 2)
  assert.equal(ev('A', { column: () => [2, 4] }), 3)
  assert.equal(ev('halfrange(A)', { column: () => [10, 14, 11] }), 2)
  assert.equal(ev('k * 2', { names: { k: 4 } }), 8)
  assert.throws(() => ev('1 / 0'), /Division by zero/)
  assert.throws(() => ev('sqrt(-1)'), /not a number/)
  assert.throws(() => ev('2 +'), /ends too soon/)
  assert.throws(() => ev('foo'), /Unknown name/)
  assert.throws(() => ev('2 $ 3'), /Unexpected/)
})

test('cells as students write them', () => {
  assert.equal(parseCell(' 2.50 '), 2.5)
  assert.equal(parseCell('3,5'), 3.5)
  assert.equal(parseCell('1.2 x 10^-3'), 0.0012)
  assert.equal(parseCell('2.5 V'), null)
  assert.equal(parseCell(''), null)
  assert.equal(decimalsWritten('2.50'), 2)
  assert.equal(decimalsWritten('12'), 0)
  assert.equal(sigFigsWritten('0.0250'), 3)
  assert.equal(sigFigsWritten('120'), 2)
  assert.equal(formatValue(0.25, { sf: 3 }), '0.250')
  assert.equal(formatValue(12, { sf: 3 }), '12.0')
  assert.equal(formatValue(1 / 3, { dp: 2 }), '0.33')
})

test('table: calculated columns, blanks and errors', () => {
  const table = {
    columns: [{ id: 'a', name: 'V', unit: 'V' }, { id: 'b', name: 'I', unit: 'A' }, { id: 'c', name: 'R', unit: 'Ω', kind: 'calc', formula: 'A / B', sf: 3 }, { id: 'd', name: 'bad', kind: 'calc', formula: 'D + 1' }],
    rows: [['2.00', '0.200'], ['4.00', ''], ['6.00', '0.610']],
  }
  const t = computeTable(table)
  assert.equal(t.cells[0][2].text, '10.0')
  assert.equal(t.cells[1][2].text, '')
  assert.equal(t.cells[2][2].text, '9.84')
  assert.match(t.cells[0][3].error, /itself/)
  assert.deepEqual(t.column('A'), [2, 4, 6])
})

test('deleting a column rewrites formulas', () => {
  assert.equal(shiftRefs('C / B', 0), 'B / A')
  assert.equal(shiftRefs('C / B + 2E3', 1), 'B / ? + 2E3')
  assert.equal(shiftRefs('sqrt(A)', 2), 'sqrt(A)')
})

test('lines, triangles and uncertainty from the student’s own lines', () => {
  const g = { lines: [{ role: 'best', x1: 0, y1: 0, x2: 1, y2: 10 }, { role: 'worst', x1: 0, y1: 0.5, x2: 1, y2: 9.5 }], triangle: { xa: 0.1, xb: 0.9 } }
  const r = graphResults(g)
  assert.ok(Math.abs(r.best.gradient - 10) < 1e-12)
  assert.ok(Math.abs(r.triangle.dy - 8) < 1e-12 && Math.abs(r.triangle.gradient - 10) < 1e-12)
  assert.ok(Math.abs(r.gradientUncertainty - 1) < 1e-12 && Math.abs(r.gradientPercent - 10) < 1e-9)
  assert.equal(lineOf({ x1: 1, y1: 0, x2: 1, y2: 3 }), null)
})

test('working lines use graph results and earlier lines', () => {
  const a = {
    table: { columns: [{ id: 'a', name: 'I', unit: 'A' }], rows: [['0.10'], ['0.30']] },
    graphs: [{ id: 'g1', type: 'scatter', x: 'a', y: 'a', lines: [{ role: 'best', x1: 0, y1: 0, x2: 1, y2: 10 }, { role: 'worst', x1: 0, y1: 0, x2: 1, y2: 11 }] }],
    calcs: [{ name: 'r', label: 'R', expr: 'gradient', unit: 'Ω' }, { name: 'pc', expr: '100 * abs(worst_gradient - r) / r', unit: '%' }, { expr: 'mean(A)', unit: 'A' }, { expr: 'nothing + 1' }],
  }
  const c = computeCalcs(a)
  assert.equal(c[0].value, 10)
  assert.ok(Math.abs(c[1].value - 10) < 1e-9)
  assert.ok(Math.abs(c[2].value - 0.2) < 1e-12)
  assert.match(c[3].error, /Unknown name/)
})

test('axes: automatic scales contain the data; a student scale is respected', () => {
  const pts = [{ x: 0.12, y: 1.2 }, { x: 0.58, y: 5.9 }]
  const ax = axesOf({ scale: { auto: true } }, pts)
  assert.ok(ax.xmin <= 0.12 && ax.xmax >= 0.58 && ax.ymin <= 1.2 && ax.ymax >= 5.9)
  assert.deepEqual(axesOf({ scale: { auto: false, xmin: 0, xmax: 1, ymin: 0, ymax: 10 } }, pts).xmax, 1)
})

test('coach: a good table and graph pass, a poor one gets specific advice', () => {
  const rows = [[1, 0.10], [2, 0.21], [3, 0.29], [4, 0.41], [5, 0.50], [6, 0.61]].map(([v, i]) => [v.toFixed(2), i.toFixed(2)])
  const good = {
    table: { columns: [{ id: 'v', name: 'V', unit: 'V' }, { id: 'i', name: 'I', unit: 'A' }, { id: 'r', name: 'R', unit: 'Ω', kind: 'calc', formula: 'A/B', sf: 3 }], rows },
    graphs: [{ id: 'g', type: 'scatter', x: 'i', y: 'v', scale: { auto: true }, lines: [{ role: 'best', x1: 0.1, y1: 0.99, x2: 0.6, y2: 5.94 }, { role: 'worst', x1: 0.1, y1: 1.2, x2: 0.6, y2: 5.7 }], triangle: { xa: 0.12, xb: 0.58 } }],
    calcs: [{ name: 'r', label: 'Resistance', expr: 'gradient', unit: 'Ω' }],
  }
  const g = checkAnalysis(good)
  assert.deepEqual(g.filter(x => !x.ok).map(x => x.text), [])

  const poor = {
    table: { columns: [{ id: 'v', name: 'V', unit: '' }, { id: 'i', name: '', unit: 'A' }], rows: [['1', '0.1'], ['2.0', '0.21 A'], ['3.0', '0.32']] },
    graphs: [{ id: 'g', type: 'scatter', x: 'i', y: 'v', xLabel: 'current', scale: { auto: false, xmin: 0, xmax: 10, ymin: 0, ymax: 100 }, lines: [] }],
    calcs: [],
  }
  const texts = checkAnalysis(poor).filter(x => !x.ok).map(x => x.text).join('\n')
  for (const re of [/heading naming/, /unit in the heading/, /at least 5/, /same number of decimal places/, /not a number/, /label each axis/, /half the grid/, /line of best fit/, /Show your working/]) assert.match(texts, re)
})

test('cleanAnalysis trims and rejects bad input', () => {
  const c = cleanAnalysis({
    table: { columns: [{ id: 'a<script>', name: 'x'.repeat(500), kind: 'calc', formula: 'A', dp: 99 }, { id: 'b', name: 'y' }], rows: [[1, 'abc'], ...Array(100).fill(['1', '2'])] },
    graphs: [{ x: 'ascript', y: 'nope', type: 'pie', lines: [{ role: 'best', x1: 0, y1: 0, x2: 'x', y2: 1 }, { role: 'evil', x1: 0, y1: 0, x2: 1, y2: 1 }] }],
    calcs: [{ name: 'Bad Name!', expr: '1+1', sf: 50 }],
  })
  assert.equal(c.table.columns[0].id, 'ascript')
  assert.equal(c.table.columns[0].name.length, 80)
  assert.equal(c.table.columns[0].dp, 8)
  assert.equal(c.table.rows.length, 40)
  assert.equal(c.table.rows[0][0], '')
  assert.equal(c.graphs[0].type, 'scatter')
  assert.equal(c.graphs[0].x, 'ascript')
  assert.equal(c.graphs[0].y, null)
  assert.equal(c.graphs[0].lines.length, 0)
  assert.equal(c.calcs[0].name, 'adame')
  assert.equal(c.calcs[0].sf, 8)
  assert.throws(() => cleanAnalysis('x'))
  assert.throws(() => cleanAnalysis({ table: { columns: [{ id: 'a' }, { id: 'a' }] } }))
  assert.deepEqual(cleanAnalysis(null), { table: { columns: [], rows: [] }, graphs: [], calcs: [] })
})

test('every experiment’s bench table can seed a student table without its calculated columns', () => {
  for (const def of EXPERIMENTS) {
    const params = def.params('analysis-seed', {})
    const tables = def.dataTables(params, def.initialState(params))
    for (const t of tables) {
      assert.ok(Array.isArray(t.derived ?? []), def.id)
      const raw = rawFromBench(t)
      assert.equal(raw.columns.length, t.columns.length - (t.derived || []).length - t.columns.filter(c => /^#$|^run$/i.test(c.trim())).length, def.id + ' ' + t.title)
    }
  }
})

test('graph points come from the student table, including error bars and bar categories', () => {
  const a = { table: { columns: [{ id: 'n', name: 'Indicator' }, { id: 'x', name: 'x' }, { id: 'y', name: 'y' }, { id: 'e', name: 'u', kind: 'calc', formula: 'C/10' }], rows: [['phenol', '1', '2'], ['methyl', '2', ''], ['litmus', '3', '6']] } }
  const sc = graphPoints(a, { type: 'scatter', x: 'x', y: 'y', err: 'e' })
  assert.deepEqual(sc.map(p => [p.x, p.y, p.e]), [[1, 2, 0.2], [3, 6, 0.6]])
  assert.deepEqual(graphPoints(a, { type: 'bar', x: 'n', y: 'y' }).map(p => p.cat), ['phenol', 'litmus'])
})

test('axes that start at zero do not overshoot below it', () => {
  const ax = axesOf({ scale: { auto: true, origin: true } }, [{ x: 0.098, y: 0.98 }, { x: 0.603, y: 6 }])
  assert.equal(ax.xmin, 0); assert.equal(ax.ymin, 0)
  assert.ok(ax.xmax >= 0.603 && ax.ymax >= 6)
})
