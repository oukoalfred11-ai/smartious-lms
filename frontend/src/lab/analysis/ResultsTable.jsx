/**
 * ResultsTable — the student draws up their own results table, as in a lab
 * book: headings with units, readings typed in, and calculated columns
 * worked out from a formula they choose (=A/B, =1/C, =mean(B,C,D)).
 */
import { useMemo, useRef, useState } from 'react'
import { computeTable, letterOf, rawFromBench, shiftRefs, LIMITS, headingOf } from '../core.js'
import { DataTables } from '../panels.jsx'

const nextId = (cols) => 'c' + (cols.reduce((m, c) => Math.max(m, Number(String(c.id).replace(/\D/g, '')) || 0), 0) + 1)
const PRECISION = [['sf:2', '2 s.f.'], ['sf:3', '3 s.f.'], ['sf:4', '4 s.f.'], ['dp:0', '0 d.p.'], ['dp:1', '1 d.p.'], ['dp:2', '2 d.p.'], ['dp:3', '3 d.p.'], ['dp:4', '4 d.p.']]
const precOf = (c) => (c.dp != null ? 'dp:' + c.dp : 'sf:' + (c.sf || 3))

/** The bench table worth copying: the one with the most columns that has readings. */
export function benchTableOf(tables) {
  const withRows = tables.filter(t => t.rows.length && t.columns.length > 2)
  return (withRows.length ? withRows : tables).slice().sort((a, b) => b.columns.length - a.columns.length)[0] || null
}

export default function ResultsTable({ analysis, update, editable, benchTables }) {
  const t = useMemo(() => computeTable(analysis.table), [analysis.table])
  const cols = analysis.table.columns
  const rows = analysis.table.rows
  const bench = benchTableOf(benchTables || [])
  const [confirmCopy, setConfirmCopy] = useState(false)
  const grid = useRef(null)

  const setTable = (fn) => update(a => ({ ...a, table: fn(a.table) }))
  const setCol = (i, patch) => setTable(tb => ({ ...tb, columns: tb.columns.map((c, k) => (k === i ? { ...c, ...patch } : c)) }))
  const setCell = (r, c, v) => setTable(tb => ({ ...tb, rows: tb.rows.map((row, k) => (k === r ? row.map((x, j) => (j === c ? v : x)) : row)) }))
  const addCol = (kind) => setTable(tb => {
    if (tb.columns.length >= LIMITS.columns) return tb
    const col = kind === 'calc' ? { id: nextId(tb.columns), name: '', unit: '', kind: 'calc', formula: '', sf: 3 } : { id: nextId(tb.columns), name: '', unit: '', kind: 'raw' }
    return { columns: [...tb.columns, col], rows: (tb.rows.length ? tb.rows : [[]]).map(r => [...r, '']) }
  })
  const delCol = (i) => update(a => {
    const id = a.table.columns[i].id
    return {
      ...a,
      table: {
        columns: a.table.columns.filter((_, k) => k !== i).map(c => (c.kind === 'calc' ? { ...c, formula: shiftRefs(c.formula, i) } : c)),
        rows: a.table.rows.map(r => r.filter((_, k) => k !== i)),
      },
      graphs: a.graphs.map(g => ({ ...g, x: g.x === id ? null : g.x, y: g.y === id ? null : g.y, err: g.err === id ? null : g.err })),
      calcs: a.calcs,
    }
  })
  const addRow = () => setTable(tb => (tb.rows.length >= LIMITS.rows ? tb : { ...tb, rows: [...tb.rows, tb.columns.map(() => '')] }))
  const delRow = (r) => setTable(tb => ({ ...tb, rows: tb.rows.filter((_, k) => k !== r) }))
  const copyBench = () => {
    const raw = rawFromBench(bench)
    if (!raw) return
    update(a => ({ ...a, table: raw, graphs: [] }))
    setConfirmCopy(false)
  }
  const focusCell = (r, c) => setTimeout(() => grid.current?.querySelector(`[data-cell="${r}-${c}"]`)?.focus(), 0)
  const onCellKey = (e, r, c) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (r === rows.length - 1) { addRow(); focusCell(r + 1, c) } else focusCell(r + 1, c)
    }
  }

  return (
    <div className="lab-rt">
      <div className="lab-rt-intro">
        <p>Draw up your results table. Head each column with the <b>quantity and its unit</b> (for example <i>Current I / A</i>), write every reading to the precision of the instrument, and add calculated columns for anything you work out from the readings.</p>
        {editable && (
          <div className="lab-row">
            {bench?.rows.length > 0 && (confirmCopy
              ? <span className="lab-confirm-inline">Replace your table with the readings from the bench? <button type="button" className="lab-btn primary sm" onClick={copyBench}>Yes, copy</button><button type="button" className="lab-btn ghost sm" onClick={() => setConfirmCopy(false)}>Cancel</button></span>
              : <button type="button" className="lab-btn sm" onClick={() => (cols.length ? setConfirmCopy(true) : copyBench())} title="Copies the measured columns only. Calculated columns are yours to add.">Copy my bench readings</button>)}
            <button type="button" className="lab-btn sm" onClick={() => addCol('raw')} disabled={cols.length >= LIMITS.columns}>+ Measured column</button>
            <button type="button" className="lab-btn sm" onClick={() => addCol('calc')} disabled={cols.length >= LIMITS.columns}>+ Calculated column</button>
            <button type="button" className="lab-btn sm" onClick={addRow} disabled={!cols.length || rows.length >= LIMITS.rows}>+ Row</button>
          </div>
        )}
      </div>

      {!cols.length
        ? <p className="lab-empty">Your table is empty. {bench?.rows.length ? 'Copy your bench readings to start, or add columns yourself.' : 'Take readings on the bench first, then copy them here or add columns yourself.'}</p>
        : (
          <div className="lab-rt-wrap" ref={grid}>
            <table className="lab-rt-table">
              <thead>
                <tr className="lab-rt-letters"><th aria-hidden="true" />{cols.map((c, i) => <th key={c.id} scope="col">{letterOf(i)}{c.kind === 'calc' ? ' · calculated' : ''}</th>)}<th aria-hidden="true" /></tr>
                <tr className="lab-rt-head">
                  <th aria-hidden="true" />
                  {cols.map((c, i) => (
                    <th key={c.id} scope="col">
                      {editable ? (
                        <div className="lab-rt-hd">
                          <input aria-label={`Column ${letterOf(i)} quantity`} placeholder="Quantity (symbol)" value={c.name} maxLength={80} onChange={e => setCol(i, { name: e.target.value })} />
                          <span className="lab-rt-slash">/</span>
                          <input aria-label={`Column ${letterOf(i)} unit`} placeholder={c.noUnit ? 'no unit' : 'unit'} value={c.unit} maxLength={40} disabled={c.noUnit} onChange={e => setCol(i, { unit: e.target.value })} className="lab-rt-unit" />
                          <label className="lab-rt-nounit" title="Tick for a quantity with no unit, such as a ratio or a count"><input type="checkbox" checked={!!c.noUnit} onChange={e => setCol(i, { noUnit: e.target.checked, unit: e.target.checked ? '' : c.unit })} /> no unit</label>
                          {c.kind === 'calc' && (
                            <div className="lab-rt-formula">
                              <span>=</span>
                              <input aria-label={`Column ${letterOf(i)} formula`} placeholder="e.g. A/B" value={c.formula} maxLength={LIMITS.formula} onChange={e => setCol(i, { formula: e.target.value })} />
                              <select aria-label={`Column ${letterOf(i)} precision`} value={precOf(c)} onChange={e => { const [k, v] = e.target.value.split(':'); setCol(i, k === 'dp' ? { dp: Number(v), sf: undefined } : { sf: Number(v), dp: undefined }) }}>
                                {PRECISION.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                              </select>
                            </div>
                          )}
                          <button type="button" className="lab-rt-x" aria-label={`Delete column ${letterOf(i)}`} title="Delete column" onClick={() => delCol(i)}>×</button>
                        </div>
                      ) : (
                        <span>{headingOf(c) || '(no heading)'}{c.kind === 'calc' && <span className="lab-help"> = {c.formula}</span>}</span>
                      )}
                    </th>
                  ))}
                  <th aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {t.cells.map((r, ri) => (
                  <tr key={ri}>
                    <th scope="row" className="lab-rt-n">{ri + 1}</th>
                    {r.map((cell, ci) => (
                      <td key={cols[ci].id} className={cols[ci].kind === 'calc' ? 'calc' + (cell.error ? ' err' : '') : ''} title={cell.error || ''}>
                        {cols[ci].kind === 'calc'
                          ? (cell.error ? '!' : cell.text)
                          : editable
                            ? <input data-cell={`${ri}-${ci}`} aria-label={`Row ${ri + 1}, ${cols[ci].name || 'column ' + letterOf(ci)}`} inputMode="decimal" value={rows[ri]?.[ci] ?? ''} maxLength={LIMITS.cell}
                                onChange={e => setCell(ri, ci, e.target.value)} onKeyDown={e => onCellKey(e, ri, ci)} />
                            : cell.text}
                      </td>
                    ))}
                    <td className="lab-rt-n">{editable && <button type="button" className="lab-rt-x" aria-label={`Delete row ${ri + 1}`} title="Delete row" onClick={() => delRow(ri)}>×</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cols.some((c, i) => c.kind === 'calc' && t.cells.some(r => r[i]?.error)) && (
              <p className="lab-problems" role="status">{[...new Set(cols.flatMap((c, i) => (c.kind === 'calc' ? t.cells.map(r => r[i]?.error).filter(Boolean).map(e => `Column ${letterOf(i)}: ${e}`) : [])))].join(' ')}</p>
            )}
          </div>
        )}

      <details className="lab-rt-help">
        <summary>How to write a formula</summary>
        <ul>
          <li>Use column letters: <code>A/B</code>, <code>1/A</code>, <code>A^2</code>, <code>sqrt(A)</code>, <code>lg(A)</code>, <code>ln(A)</code>, <code>sin(A)</code> (degrees).</li>
          <li>Mean of repeat readings on a row: <code>mean(B, C, D)</code>. Difference: <code>C - B</code>. Percentage change: <code>100*(C - B)/B</code>.</li>
          <li>Constants: <code>pi</code>, numbers like <code>9.81</code> or <code>6.63e-34</code>.</li>
          <li>Choose the precision: a calculated value should have the same number of significant figures as the data, or one more.</li>
        </ul>
      </details>

      {bench && (
        <details className="lab-rt-bench" open={!cols.length}>
          <summary>Bench record (what the instruments showed)</summary>
          <DataTables tables={benchTables} />
        </details>
      )}
    </div>
  )
}
