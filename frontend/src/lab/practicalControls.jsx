/**
 * practicalControls.jsx — controls for every measurement practical built
 * with shared/lab/practical.js: stockroom, settings, the independent
 * variable, instrument readings, the results table and the graph axes.
 * Students type what the instruments show; the server checks it.
 */
import { useState } from 'react'
import { apparatusName } from '../../../shared/lab/apparatus.js'
import { axisLabel, TRANSFORMS } from '../../../shared/lab/practical.js'

const dp = (res) => Math.max(0, Math.ceil(-Math.log10(res) - 1e-9))
const show = (v, r) => (v == null ? '----' : v.toFixed(dp(r.resolution)) + ' ' + (r.unit || ''))
const TF_LABEL = { none: 'as measured', square: 'squared', sqrt: 'square root', reciprocal: '1 / value', ln: 'ln', lg: 'lg (log₁₀)' }

function Btn({ children, onClick, disabled, kind = '', type = 'button' }) {
  return <button type={type} className={'lab-btn ' + kind} onClick={onClick} disabled={disabled}>{children}</button>
}

export function Stockroom({ def, view, dispatch, editable }) {
  const P = def.practical
  const [open, setOpen] = useState(!view.collected)
  const [pick, setPick] = useState(() => new Set(view.collected || []))
  const toggle = (id) => setPick(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  if (!open && view.collected) {
    return (
      <fieldset className="lab-fs">
        <legend>Apparatus on your bench</legend>
        <p className="lab-help">{view.collected.map(apparatusName).join(' · ')}</p>
        <Btn kind="sm ghost" onClick={() => { setPick(new Set(view.collected)); setOpen(true) }} disabled={!editable}>Change apparatus</Btn>
      </fieldset>
    )
  }
  return (
    <fieldset className="lab-fs">
      <legend>Stockroom: choose the apparatus you need</legend>
      <p className="lab-help">Read the procedure first. Choosing exactly what you need is part of the mark.</p>
      <ul className="lab-pick">{P.stockroom.map(id => (
        <li key={id}><label className="lab-check"><input type="checkbox" checked={pick.has(id)} onChange={() => toggle(id)} disabled={!editable} /> {apparatusName(id)}</label></li>
      ))}</ul>
      <div className="lab-row">
        <Btn kind="primary" onClick={() => { if (dispatch('collect', { items: [...pick] })) setOpen(false) }} disabled={!editable || !pick.size}>Take to my bench</Btn>
        {view.collected && <Btn kind="ghost" onClick={() => setOpen(false)}>Cancel</Btn>}
      </div>
    </fieldset>
  )
}

function ConstantRow({ c, view, dispatch, editable }) {
  const [v, setV] = useState('')
  const recorded = view.constants[c.key]
  return (
    <div className="lab-const">
      <div className="lab-row">
        <b>{c.label}{c.symbol ? ' (' + c.symbol + ')' : ''}</b>
        <Btn kind="sm" onClick={() => dispatch('measure', { key: c.key })} disabled={!editable}>Measure with the {apparatusName(c.instrument).toLowerCase()}</Btn>
        <span className="lab-reading" aria-live="polite">{show(view.readings[c.key], c)}</span>
      </div>
      <form className="lab-inline" onSubmit={e => { e.preventDefault(); if (dispatch('recordConst', { key: c.key, value: v })) setV('') }}>
        <label>Record <input inputMode="decimal" value={v} onChange={e => setV(e.target.value)} disabled={!editable} size="8" aria-label={'Record ' + c.label} /> {c.unit}</label>
        <Btn type="submit" kind="sm" disabled={!editable || v === ''}>Record</Btn>
        {recorded != null && <span className="lab-help">Recorded: {recorded} {c.unit}</span>}
      </form>
    </div>
  )
}

function RowForm({ P, view, dispatch, editable }) {
  const [vals, setVals] = useState({})
  const ready = P.measures.every(m => vals[m.key] !== undefined && vals[m.key] !== '')
  return (
    <form className="lab-rowform" onSubmit={e => { e.preventDefault(); if (dispatch('recordRow', { values: vals })) setVals({}) }}>
      {P.measures.map(m => (
        <div key={m.key} className="lab-row">
          <Btn kind="sm" onClick={() => dispatch('measure', { key: m.key })} disabled={!editable}>{m.instrument ? 'Read the ' + apparatusName(m.instrument).toLowerCase() : 'Measure'}</Btn>
          <span className="lab-reading" aria-live="polite">{m.label}: {show(view.readings[m.key], m)}</span>
          <label>{m.symbol || m.label} <input inputMode="decimal" size="8" value={vals[m.key] ?? ''} onChange={e => setVals(x => ({ ...x, [m.key]: e.target.value }))} disabled={!editable} aria-label={'Record ' + m.label} /> {m.unit}</label>
        </div>
      ))}
      <Btn type="submit" kind="primary" disabled={!editable || !ready}>Record this row</Btn>
    </form>
  )
}

export function GraphAxes({ def, view, dispatch, editable }) {
  const P = def.practical
  const [g, setG] = useState(view.graph)
  const vars = P.vars
  const changed = JSON.stringify(g) !== JSON.stringify(view.graph)
  const axis = (which, label) => (
    <label className="lab-axis">{label}
      <select value={g[which]} onChange={e => setG({ ...g, [which]: e.target.value })} disabled={!editable}>{vars.map(v => <option key={v.key} value={v.key}>{v.label}{v.symbol ? ' (' + v.symbol + ')' : ''}</option>)}</select>
      <select value={g['t' + which]} onChange={e => setG({ ...g, ['t' + which]: e.target.value })} disabled={!editable} aria-label={label + ' transformation'}>{P.transforms.map(t => <option key={t} value={t}>{TF_LABEL[t] || TRANSFORMS[t].label}</option>)}</select>
    </label>
  )
  const byKey = Object.fromEntries(vars.map(v => [v.key, v]))
  return (
    <fieldset className="lab-fs">
      <legend>Graph axes</legend>
      <p className="lab-help">Choose quantities that give a straight line, so you can use the gradient{P.fitKind === 'line' ? ' and intercept' : ''}.</p>
      {axis('y', 'y-axis')}
      {axis('x', 'x-axis')}
      <p className="lab-help">Plotting {axisLabel(byKey[g.y] || vars[0], g.ty)} against {axisLabel(byKey[g.x] || vars[0], g.tx)}.</p>
      <Btn kind="sm primary" onClick={() => dispatch('setGraph', g)} disabled={!editable || !changed}>Use these axes</Btn>
    </fieldset>
  )
}

export default function PracticalControls({ def, view, dispatch, editable }) {
  const P = def.practical
  const iv = P.iv
  const [x, setX] = useState(String(view.x ?? ''))
  const ready = !!view.collected
  return (
    <div className="lab-controls">
      <Stockroom def={def} view={view} dispatch={dispatch} editable={editable} />
      {ready && <>
        {P.settings.length > 0 && (
          <fieldset className="lab-fs"><legend>Conditions</legend>
            {P.settings.map(s => (
              <label key={s.key} className="lab-row">{s.label}
                <select value={String(view.settings[s.key])} onChange={e => dispatch('setting', { key: s.key, value: e.target.value })} disabled={!editable}>
                  {s.options.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
                </select>
              </label>
            ))}
          </fieldset>
        )}
        {P.constants.length > 0 && (
          <fieldset className="lab-fs"><legend>One-off measurements</legend>
            {P.constants.map(c => <ConstantRow key={c.key} c={c} view={view} dispatch={dispatch} editable={editable} />)}
          </fieldset>
        )}
        {P.measures.length > 0 && (
          <fieldset className="lab-fs"><legend>{iv ? 'Take readings' : 'Repeated measurements'}</legend>
            {iv && (
              <form className="lab-row" onSubmit={e => { e.preventDefault(); dispatch('setIV', { value: x }) }}>
                <label>{iv.label} ({iv.symbol}) <input type="number" min={iv.min} max={iv.max} step={iv.step} value={x} onChange={e => setX(e.target.value)} disabled={!editable} style={{ width: '7em' }} /> {iv.unit}</label>
                <Btn type="submit" kind="sm" disabled={!editable}>Set</Btn>
                <span className="lab-help">Now: <b>{view.x} {iv.unit}</b> · range {iv.min}–{iv.max}{iv.monotonic ? ' · cannot go back' : ''}</span>
              </form>
            )}
            {P.repeats > 1 && <p className="lab-help">Take at least {P.repeats} readings at each value: measure, record, then measure again.</p>}
            <RowForm P={P} view={view} dispatch={dispatch} editable={editable} />
          </fieldset>
        )}
        {view.rows.length > 0 && (
          <div className="lab-tablewrap">
            <table className="lab-table"><thead><tr><th>#</th>{P.settings.map(s => <th key={s.key}>{s.label}</th>)}{iv && <th>{axisLabel(iv)}</th>}{P.measures.map(m => <th key={m.key}>{axisLabel(m)}</th>)}<th></th></tr></thead>
              <tbody>{view.rows.map((r, i) => (
                <tr key={i}><td>{i + 1}</td>{P.settings.map(s => <td key={s.key}>{s.options.find(o => String(o.value) === String(r.settings?.[s.key]))?.label}</td>)}{iv && <td>{r.x}</td>}
                  {P.measures.map(m => <td key={m.key}>{r.values[m.key]}</td>)}<td><Btn kind="sm ghost" onClick={() => dispatch('deleteRow', { index: i })} disabled={!editable}>Delete</Btn></td></tr>
              ))}</tbody></table>
          </div>
        )}
        {def.correctGraph && <GraphAxes key={JSON.stringify(view.graph)} def={def} view={view} dispatch={dispatch} editable={editable} />}
      </>}
    </div>
  )
}
