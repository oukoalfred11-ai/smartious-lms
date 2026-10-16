/**
 * circuitControls.jsx — the keyboard / screen-reader way to wire a circuit
 * (the same 'connect', 'disconnect' and 'toggleSwitch' actions as dragging
 * leads on the bench), plus what is wrong with the circuit right now.
 */
import { useState } from 'react'
import { terminalsOf } from './core.js'

const POLAR = ['supply', 'ammeter', 'voltmeter']
export function terminalLabel(part, t) {
  if (POLAR.includes(part.type)) return part.label + ' ' + (t === '+' ? '+' : '−')
  return part.label + ' ' + (t === 'a' ? 'one end' : 'other end')
}

export default function CircuitControls({ parts, view, dispatch, editable }) {
  const [a, setA] = useState(''), [b, setB] = useState('')
  const terms = parts.flatMap(p => terminalsOf(p.type).map(t => ({ id: p.id + '.' + t, label: terminalLabel(p, t) })))
  const labelOf = (id) => terms.find(t => t.id === id)?.label || id
  const off = !editable
  const hasSwitch = parts.some(p => p.type === 'switch')
  const left = view.maxLeads != null ? view.maxLeads - view.wires.length : null
  const c = view.circuit
  return (
    <fieldset className="lab-fs">
      <legend>Circuit</legend>
      <p className="lab-help">Build the circuit on the bench: drag a lead from one terminal to another, or tap one terminal and then the other. Click a lead to select it and remove it. Click the switch to open or close it.</p>
      <details className="lab-menus"><summary>Connect using menus instead (keyboard)</summary>
      <form className="lab-row" onSubmit={e => { e.preventDefault(); if (dispatch('connect', { a, b })) { setA(''); setB('') } }}>
        <select value={a} onChange={e => setA(e.target.value)} disabled={off} aria-label="From terminal"><option value="">From…</option>{terms.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
        <select value={b} onChange={e => setB(e.target.value)} disabled={off} aria-label="To terminal"><option value="">To…</option>{terms.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
        <button type="submit" className="lab-btn sm" disabled={off || !a || !b}>Connect a lead</button>
      </form>
      </details>
      {left != null && <p className="lab-help">{left} lead{left === 1 ? '' : 's'} left in the tray</p>}
      {view.wires.length ? (
        <ul className="lab-list">{view.wires.map(([x, y], i) => (
          <li key={i}><span><span className={'lab-dot ' + (view.wireColours?.[i] === 'black' ? 'k' : 'r')} aria-hidden="true" />{labelOf(x)} → {labelOf(y)}</span>
            <button type="button" className="lab-btn sm ghost" onClick={() => dispatch('disconnect', { index: i })} disabled={off}>Remove</button></li>
        ))}</ul>
      ) : <p className="lab-help">No leads connected yet.</p>}
      <div className="lab-row">
        {hasSwitch && <button type="button" className="lab-btn sm" onClick={() => dispatch('toggleSwitch')} disabled={off}>{view.switchClosed ? 'Open the switch' : 'Close the switch'}</button>}
        {view.wires.length > 0 && <button type="button" className="lab-btn sm ghost" onClick={() => dispatch('clearWires')} disabled={off}>Remove all leads</button>}
      </div>
      {c && (c.fault === 'short_circuit'
        ? <p className="lab-warn" role="alert">Short circuit: the supply has tripped. Check for a lead or an ammeter connected straight across the supply.</p>
        : c.ok ? <p className="lab-ok">The circuit is complete and the meters are connected correctly.</p>
          : c.problems?.length > 0 && <ul className="lab-problems">{c.problems.map(p => <li key={p}>{p}</li>)}</ul>)}
    </fieldset>
  )
}
