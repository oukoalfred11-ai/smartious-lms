/**
 * Working — the calculation, line by line, the way it is set out in a lab
 * report: what is being found, the expression, the result with its unit
 * and a sensible number of significant figures. Named lines can be used by
 * later lines; values from the graph (gradient, intercept, …) are ready to use.
 */
import { useMemo } from 'react'
import { computeCalcs, graphNames, letterOf, headingOf, LIMITS, FUNCTION_NAMES } from '../core.js'

const TEMPLATES = [
  { label: 'Percentage uncertainty in the gradient', lines: [{ name: 'pu', label: 'Percentage uncertainty in gradient', expr: '100 * abs(gradient - worst_gradient) / gradient', unit: '%', sf: 2 }] },
  { label: 'Percentage difference from an accepted value', lines: [{ name: 'accepted', label: 'Accepted value (type it in)', expr: '', unit: '', sf: 3 }, { name: 'pd', label: 'Percentage difference', expr: '100 * abs(gradient - accepted) / accepted', unit: '%', sf: 2 }] },
  { label: 'Mean of a column', lines: [{ name: 'avg', label: 'Mean', expr: 'mean(A)', unit: '', sf: 3 }] },
  { label: 'Uncertainty from repeats (half the range)', lines: [{ name: 'u', label: 'Uncertainty (half the range)', expr: 'halfrange(A)', unit: '', sf: 2 }] },
]
const blank = () => ({ name: '', label: '', expr: '', unit: '', sf: 3 })

export default function Working({ analysis, update, editable }) {
  const calcs = useMemo(() => computeCalcs(analysis), [analysis])
  const names = useMemo(() => graphNames(analysis), [analysis])
  const set = (i, patch) => update(a => ({ ...a, calcs: a.calcs.map((c, k) => (k === i ? { ...c, ...patch } : c)) }))
  const add = (lines = [blank()]) => update(a => ({ ...a, calcs: [...(a.calcs || []), ...lines].slice(0, LIMITS.calcs) }))
  const del = (i) => update(a => ({ ...a, calcs: a.calcs.filter((_, k) => k !== i) }))
  const cols = analysis.table.columns

  return (
    <div className="lab-work-calc">
      <p>Set out each step of your calculation. Give each result a short <b>name</b> if you want to use it in a later line, and always give the <b>unit</b>.</p>
      {calcs.length === 0 && <p className="lab-empty">No working yet.</p>}
      <ol className="lab-calc-list">
        {calcs.map((c, i) => (
          <li key={i} className={c.error ? 'err' : ''}>
            {editable ? (
              <div className="lab-calc-row">
                <input className="lab-calc-label" aria-label={`Line ${i + 1}: what you are finding`} placeholder="What you are finding, e.g. Resistance" value={c.label} maxLength={120} onChange={e => set(i, { label: e.target.value })} />
                <input className="lab-calc-name" aria-label={`Line ${i + 1}: name`} placeholder="name" value={c.name} maxLength={24} onChange={e => set(i, { name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} />
                <span>=</span>
                <input className="lab-calc-expr" aria-label={`Line ${i + 1}: expression`} placeholder="e.g. gradient, or 2 * pi * r" value={c.expr} maxLength={LIMITS.formula} onChange={e => set(i, { expr: e.target.value })} />
                <span className="lab-calc-eq">=</span>
                <output className="lab-calc-val">{c.error ? '?' : c.text || '…'}</output>
                <input className="lab-calc-unit" aria-label={`Line ${i + 1}: unit`} placeholder={c.noUnit ? '—' : 'unit'} value={c.unit} disabled={c.noUnit} maxLength={40} onChange={e => set(i, { unit: e.target.value })} />
                <select aria-label={`Line ${i + 1}: significant figures`} value={c.sf || 3} onChange={e => set(i, { sf: Number(e.target.value) })}>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} s.f.</option>)}</select>
                <label className="lab-rt-nounit"><input type="checkbox" checked={!!c.noUnit} onChange={e => set(i, { noUnit: e.target.checked, unit: e.target.checked ? '' : c.unit })} /> no unit</label>
                <button type="button" className="lab-rt-x" aria-label={`Delete line ${i + 1}`} onClick={() => del(i)}>×</button>
              </div>
            ) : (
              <p className="lab-calc-ro">{c.label ? c.label + ': ' : ''}{c.name ? <i>{c.name}</i> : null}{c.name ? ' = ' : ''}{c.expr} = <b>{c.text || '—'}</b> {c.unit}</p>
            )}
            {c.error && <p className="lab-problems">{c.error}</p>}
          </li>
        ))}
      </ol>
      {editable && (
        <div className="lab-row">
          <button type="button" className="lab-btn sm" onClick={() => add()} disabled={calcs.length >= LIMITS.calcs}>+ Working line</button>
          <select aria-label="Add a common calculation" value="" onChange={e => { const tpl = TEMPLATES[Number(e.target.value)]; if (tpl) add(tpl.lines.map(l => ({ ...l }))) }}>
            <option value="">Add a common calculation…</option>
            {TEMPLATES.map((tpl, k) => <option key={k} value={k}>{tpl.label}</option>)}
          </select>
        </div>
      )}
      <details className="lab-rt-help">
        <summary>What you can use</summary>
        <ul>
          <li>From your graphs: {Object.keys(names).length ? Object.entries(names).map(([k, v]) => <code key={k} title={String(v)}>{k}</code>).reduce((a, b) => [a, ' ', b]) : 'draw a line of best fit first'}.</li>
          <li>Columns of your table (a letter alone means the column’s mean): {cols.length ? cols.map((c, k) => <span key={c.id}><code>{letterOf(k)}</code> {headingOf(c) || '(no heading)'}{k < cols.length - 1 ? '; ' : ''}</span>) : 'none yet'}.</li>
          <li>Functions: {FUNCTION_NAMES.map(f => <code key={f}>{f}</code>).reduce((a, b) => [a, ' ', b])}, and <code>pi</code>. Angles are in degrees.</li>
        </ul>
      </details>
    </div>
  )
}
