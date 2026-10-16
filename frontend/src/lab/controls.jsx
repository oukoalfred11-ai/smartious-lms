/**
 * controls.jsx — the control panel for each experiment.
 * Every action available on the bench is available here with a keyboard,
 * so the 3D view is never required. Readings are typed by the student from
 * the instruments; the engine stores what they typed and the server checks it.
 */
import { useState } from 'react'
import { INDICATORS, terminalsOf, getExperiment } from './core.js'
import PracticalControls from './practicalControls.jsx'

function Btn({ children, onClick, disabled, kind = '' }) {
  return <button type="button" className={'lab-btn ' + kind} onClick={onClick} disabled={disabled}>{children}</button>
}

/** Close-up of the burette scale around the meniscus (0.1 cm³ graduations). */
function BuretteScale({ reading, filled }) {
  if (!filled) return <div className="lab-scale-empty">The burette is empty.</div>
  const H = 220, span = 2.4, pxPer = H / span
  const lo = Math.max(0, reading - span / 2)
  const y = (v) => (v - lo) * pxPer
  const ticks = []
  for (let v = Math.ceil(lo * 10) / 10; v <= lo + span + 1e-9; v = Math.round((v + 0.1) * 10) / 10) ticks.push(v)
  return (
    <svg viewBox={`0 0 140 ${H}`} className="lab-scale" role="img" aria-label="Close-up of the burette scale. Read the bottom of the meniscus.">
      <rect x="40" y="0" width="60" height={H} fill="#F7FAFC" stroke="#8796A5" />
      <rect x="41" y={y(reading) + 3} width="58" height={H} fill="#DCE9F5" />
      <path d={`M41 ${y(reading) - 3} Q70 ${y(reading) + 8} 99 ${y(reading) - 3}`} fill="none" stroke="#5B7FA6" strokeWidth="2" />
      {ticks.map(v => {
        const major = Math.abs(v - Math.round(v)) < 1e-6, half = !major && Math.abs(v * 10 % 5) < 1e-6
        return <g key={v}>
          <line x1="40" x2={major ? 72 : half ? 62 : 54} y1={y(v)} y2={y(v)} stroke="#2B3440" strokeWidth={major ? 1.6 : 1} />
          {major && <text x="34" y={y(v) + 4} fontSize="12" textAnchor="end">{v}</text>}
        </g>
      })}
    </svg>
  )
}

function ReadingInput({ label, onRecord, disabled }) {
  const [v, setV] = useState('')
  return (
    <form className="lab-inline" onSubmit={e => { e.preventDefault(); if (v !== '' && onRecord(v)) setV('') }}>
      <label>{label} <input inputMode="decimal" value={v} onChange={e => setV(e.target.value)} placeholder="0.00" disabled={disabled} aria-describedby="reading-help" /> cm³</label>
      <Btn disabled={disabled || v === ''}>Record</Btn>
    </form>
  )
}

function TitrationControls({ view, dispatch, editable }) {
  const [probe, setProbe] = useState(false)
  const f = view.flask, b = view.burette
  const run = view.runs[view.run - 1]
  const off = !editable
  return (
    <div className="lab-controls">
      <h3>Run {view.run}</h3>
      <div className="lab-row">
        <Btn onClick={() => dispatch('fillBurette')} disabled={off}>{b.filled ? 'Refill burette' : 'Fill burette with NaOH'}</Btn>
        <Btn onClick={() => dispatch('pipetteAcid')} disabled={off || f.hasAcid}>Pipette 25.0 cm³ acid</Btn>
      </div>
      <fieldset className="lab-fs">
        <legend>Indicator</legend>
        <div className="lab-row">
          <select value={view.indicatorChosen || ''} onChange={e => e.target.value && dispatch('chooseIndicator', { indicator: e.target.value })} disabled={off} aria-label="Choose indicator">
            <option value="">Choose…</option>
            {Object.entries(INDICATORS).map(([id, d]) => <option key={id} value={id}>{d.name}</option>)}
          </select>
          <Btn onClick={() => dispatch('addIndicator')} disabled={off}>Add 2 drops</Btn>
        </div>
      </fieldset>
      <fieldset className="lab-fs">
        <legend>Add sodium hydroxide from the burette</legend>
        <div className="lab-row">
          {[0.05, 0.1, 0.5, 1, 5].map(v => <Btn key={v} onClick={() => dispatch('addBase', { volume: v })} disabled={off}>{v === 0.05 ? '1 drop' : '+' + v + ' cm³'}</Btn>)}
        </div>
        <p className="lab-obs" aria-live="polite">Flask: <b>{f.hasAcid ? f.colourName : 'empty'}</b>{f.overshot ? ' (well past the endpoint)' : ''}</p>
      </fieldset>
      <div className="lab-split">
        <BuretteScale reading={b.reading} filled={b.filled} />
        <div>
          <p id="reading-help" className="lab-help">Read the bottom of the meniscus to the nearest 0.05 cm³ (e.g. 23.45).</p>
          <ReadingInput label="Initial reading" onRecord={(v) => dispatch('recordReading', { which: 'initial', value: v })} disabled={off || run?.initial != null} />
          <ReadingInput label="Final reading" onRecord={(v) => dispatch('recordReading', { which: 'final', value: v })} disabled={off || run?.initial == null || run?.final != null} />
          <label className="lab-check"><input type="checkbox" checked={!!run?.rough} onChange={e => dispatch('markRough', { index: view.run - 1, rough: e.target.checked })} disabled={off} /> This is a rough (trial) run</label>
          <div className="lab-row"><Btn onClick={() => dispatch('newRun')} disabled={off || run?.final == null}>Start a new run</Btn></div>
        </div>
      </div>
      <details className="lab-probe" open={probe} onToggle={e => setProbe(e.currentTarget.open)}>
        <summary>pH probe (teaching aid)</summary>
        <p>Simulated pH of the flask: <b>{f.pH == null ? '—' : f.pH.toFixed(2)}</b>. Find the endpoint with the indicator; the probe is only to help you understand the change.</p>
      </details>
      <TitreSummary view={view} />
    </div>
  )
}

function TitreSummary({ view }) {
  const t = view.titres
  if (!view.runs.some(r => r.titre != null)) return null
  return (
    <p className="lab-help">Titres so far: {view.runs.filter(r => r.titre != null).map(r => `${r.titre.toFixed(2)}${r.rough ? ' (rough)' : ''}`).join(', ')}.
      {t?.concordant?.length >= 2 ? ` Concordant (within 0.10 cm³): ${t.concordant.map(x => x.toFixed(2)).join(', ')}.` : ' You need at least two concordant titres.'}</p>
  )
}

const COMPONENTS = [['PS', 'Supply', 'supply'], ['S1', 'Switch', 'switch'], ['A1', 'Ammeter', 'ammeter'], ['V1', 'Voltmeter', 'voltmeter'], ['R1', 'Resistor', 'resistor']]
const TERMINALS = COMPONENTS.flatMap(([id, name, type]) => terminalsOf(type).map(t => ({ id: id + '.' + t, label: name + ' ' + t })))
const termLabel = (id) => TERMINALS.find(t => t.id === id)?.label || id

function OhmsControls({ view, dispatch, editable }) {
  const [a, setA] = useState(''), [b, setB] = useState('')
  const [V, setV] = useState(''), [I, setI] = useState('')
  const off = !editable
  return (
    <div className="lab-controls">
      <fieldset className="lab-fs">
        <legend>Connect a lead</legend>
        <form className="lab-row" onSubmit={e => { e.preventDefault(); if (dispatch('connect', { a, b })) { setA(''); setB('') } }}>
          <select value={a} onChange={e => setA(e.target.value)} disabled={off} aria-label="From terminal"><option value="">From…</option>{TERMINALS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
          <select value={b} onChange={e => setB(e.target.value)} disabled={off} aria-label="To terminal"><option value="">To…</option>{TERMINALS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
          <Btn disabled={off || !a || !b}>Connect</Btn>
        </form>
        {view.wires.length ? (
          <ul className="lab-list">{view.wires.map(([x, y], i) => <li key={i}>{termLabel(x)} → {termLabel(y)} <Btn kind="sm" onClick={() => dispatch('disconnect', { index: i })} disabled={off}>Remove</Btn></li>)}</ul>
        ) : <p className="lab-help">No leads connected yet.</p>}
        {view.wires.length > 0 && <Btn kind="ghost" onClick={() => dispatch('clearWires')} disabled={off}>Remove all leads</Btn>}
      </fieldset>
      <fieldset className="lab-fs">
        <legend>Supply and switch</legend>
        <label className="lab-range">Supply: <b>{view.supplyV.toFixed(1)} V</b>
          <input type="range" min="0" max="12" step="0.5" value={view.supplyV} onChange={e => dispatch('setSupply', { volts: e.target.value })} disabled={off} />
        </label>
        <Btn onClick={() => dispatch('toggleSwitch')} disabled={off}>{view.switchClosed ? 'Open switch' : 'Close switch'}</Btn>
        <p className="lab-obs" aria-live="polite">
          Ammeter: <b>{view.meters.A1 == null ? '----' : view.meters.A1.toFixed(3) + ' A'}</b> · Voltmeter: <b>{view.meters.V1 == null ? '----' : view.meters.V1.toFixed(2) + ' V'}</b>
          {view.fault === 'short_circuit' && <span className="lab-warn"> Supply tripped: short circuit. Check your leads.</span>}
        </p>
        {view.problems?.length > 0 && <ul className="lab-problems">{view.problems.map(p => <li key={p}>{p}</li>)}</ul>}
      </fieldset>
      <fieldset className="lab-fs">
        <legend>Record a reading</legend>
        <form className="lab-row" onSubmit={e => { e.preventDefault(); if (dispatch('recordRow', { V, I })) { setV(''); setI('') } }}>
          <label>V <input inputMode="decimal" value={V} onChange={e => setV(e.target.value)} disabled={off} size="6" /> V</label>
          <label>I <input inputMode="decimal" value={I} onChange={e => setI(e.target.value)} disabled={off} size="6" /> A</label>
          <Btn disabled={off || V === '' || I === ''}>Record</Btn>
        </form>
        {view.rows.length > 0 && (
          <table className="lab-table"><thead><tr><th>#</th><th>Supply / V</th><th>V / V</th><th>I / A</th><th></th></tr></thead>
            <tbody>{view.rows.map((r, i) => <tr key={i}><td>{i + 1}</td><td>{r.supply.toFixed(1)}</td><td>{r.V.toFixed(2)}</td><td>{r.I.toFixed(3)}</td><td><Btn kind="sm" onClick={() => dispatch('deleteRow', { index: i })} disabled={off}>Delete</Btn></td></tr>)}</tbody></table>
        )}
      </fieldset>
    </div>
  )
}

function MassInput({ label, onRecord, disabled }) {
  const [v, setV] = useState('')
  return (
    <form className="lab-inline" onSubmit={e => { e.preventDefault(); if (v !== '' && onRecord(v)) setV('') }}>
      <label>{label} <input inputMode="decimal" value={v} onChange={e => setV(e.target.value)} disabled={disabled} size="6" placeholder="0.00" /> g</label>
      <Btn disabled={disabled || v === ''}>Record</Btn>
    </form>
  )
}

function OsmosisControls({ view, dispatch, editable }) {
  const [mins, setMins] = useState('30')
  const off = !editable
  const i = view.selected, t = view.tubes[i]
  return (
    <div className="lab-controls">
      <fieldset className="lab-fs">
        <legend>Cylinder</legend>
        <div className="lab-row" role="group" aria-label="Choose a cylinder">
          {view.tubes.map((x, k) => <button type="button" key={k} className={'lab-chip' + (k === i ? ' on' : '')} aria-pressed={k === i} onClick={() => dispatch('select', { index: k })} disabled={off}>{x.C.toFixed(1)} M</button>)}
        </div>
        <p className="lab-obs" aria-live="polite">Balance: <b>{view.balance == null ? (view.immersed && !t.removed ? 'cylinder is in the solution' : '-.-- g') : view.balance.toFixed(2) + ' g'}</b></p>
        {!view.immersed && <MassInput label={`Initial mass (${t.C.toFixed(1)} M)`} onRecord={(v) => dispatch('recordInitial', { index: i, value: v })} disabled={off} />}
        {view.immersed && !t.removed && <Btn onClick={() => dispatch('remove', { index: i })} disabled={off}>Remove and blot this cylinder</Btn>}
        {t.removed && <MassInput label={`Final mass (${t.C.toFixed(1)} M)`} onRecord={(v) => dispatch('recordFinal', { index: i, value: v })} disabled={off || t.m1 != null} />}
      </fieldset>
      <fieldset className="lab-fs">
        <legend>Timer</legend>
        {!view.immersed
          ? <Btn onClick={() => dispatch('immerse')} disabled={off}>Place all cylinders in their solutions</Btn>
          : <form className="lab-row" onSubmit={e => { e.preventDefault(); dispatch('wait', { minutes: mins }) }}>
              <span>In solution for <b>{view.elapsed} min</b>.</span>
              <label>Wait <input inputMode="numeric" value={mins} onChange={e => setMins(e.target.value)} size="4" disabled={off} /> min</label>
              <Btn disabled={off}>Wait</Btn>
            </form>}
      </fieldset>
      <table className="lab-table"><thead><tr><th>Sucrose / M</th><th>Initial / g</th><th>Final / g</th><th>Change / %</th></tr></thead>
        <tbody>{view.tubes.map((x, k) => <tr key={k} className={k === i ? 'sel' : ''}><td>{x.C.toFixed(1)}</td><td>{x.m0 != null ? x.m0.toFixed(2) : '—'}</td><td>{x.m1 != null ? x.m1.toFixed(2) : '—'}</td><td>{x.percent != null ? x.percent.toFixed(1) : '—'}</td></tr>)}</tbody></table>
    </div>
  )
}

export default function Controls({ experimentId, view, dispatch, editable }) {
  if (!view) return null
  const def = getExperiment(experimentId)
  if (def?.practical) return <PracticalControls def={def} view={view} dispatch={dispatch} editable={editable} />
  const C = { 'chem-titration': TitrationControls, 'phys-ohms-law': OhmsControls, 'bio-osmosis': OsmosisControls }[experimentId]
  return C ? <C view={view} dispatch={dispatch} editable={editable} /> : <p>No controls for this experiment.</p>
}
