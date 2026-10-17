/**
 * handsOnControls.jsx — controls for a measurement practical on the
 * hands-on bench (view.bench === 2): the student puts on goggles, tares
 * the balance, checks the micrometer's zero, moves their eye level with
 * the scale, changes the variable with the real control (add a mass, move
 * the clip), waits for the reading to settle, reads each instrument from
 * its close-up and types what it shows, starts and stops the stopwatch,
 * and switches off and tidies away at the end. Every button is an engine
 * action, so the 2D bench and the 3D bench do exactly the same steps.
 */
import { useEffect, useState } from 'react'
import { apparatusName } from '../../../shared/lab/apparatus.js'
import { axisLabel } from '../../../shared/lab/practical.js'
import CircuitControls from './circuitControls.jsx'
import { Stockroom, GraphAxes } from './practicalControls.jsx'
import { CloseUp, Micrometer, LCD, StopwatchFace, MotionView, stopwatchText } from './instrumentFaces.jsx'

function Btn({ children, onClick, disabled, kind = '', type = 'button', label }) {
  return <button type={type} className={'lab-btn ' + kind} onClick={onClick} disabled={disabled} aria-label={label}>{children}</button>
}
const lower = (id) => apparatusName(id).toLowerCase()
const PARALLAX = ['dial', 'rule', 'thermometer']

/** What moving the independent variable looks like for its apparatus. */
function ivVerb(iv) {
  switch (iv.instrument) {
    case 'resistance_wire': return 'Slide the crocodile clip along the wire to'
    case 'rheostat': return 'Move the rheostat slider until it reads'
    case 'dc_supply': return 'Turn the supply knob to'
    case 'water_bath': return 'Set the water bath to'
    case 'stopwatch': return 'Wait until the stopwatch reads'
    case 'metre_rule': return 'Move it (or the clamp) to'
    case 'signal_generator': return 'Set the signal generator to'
    default: return 'Set ' + iv.label.toLowerCase() + ' to'
  }
}

function Preparation({ def, view, dispatch, editable }) {
  const H = view.hands
  const P = def.practical
  const readings = [...P.constants, ...P.measures]
  const parallax = readings.some(r => PARALLAX.includes(H.kinds[r.key]?.kind))
  const [zeroV, setZeroV] = useState('')
  if (!H.needsGoggles && !H.tareInstruments.length && !H.zeroInstruments.length && !parallax) return null
  const eye = H.eye, square = Math.abs(eye) <= H.eyeSquare
  const eyeText = square ? 'level with the scale (square-on)' : (eye < 0 ? 'to the left of / below' : 'to the right of / above') + ' the pointer'
  return (
    <fieldset className="lab-fs">
      <legend>Before you start</legend>
      {H.needsGoggles && (
        <div className="lab-row">
          {H.goggles
            ? <span className="lab-ok">Safety goggles on.</span>
            : <><span className="lab-warn">Something here is loaded or stretched and could snap.</span><Btn kind="sm primary" onClick={() => dispatch('wearGoggles')} disabled={!editable}>Put on safety goggles</Btn></>}
        </div>
      )}
      {H.tareInstruments.map(id => {
        const z = H.balanceZero[id]
        return (
          <div key={id} className="lab-closeup">
            <p className="lab-help">The {lower(id)} with nothing on the pan:</p>
            <LCD value={z.value} res={z.resolution} unit={z.unit} label={apparatusName(id) + ' with an empty pan'} />
            <div className="lab-row">
              <Btn kind="sm" onClick={() => dispatch('tare', { instrument: id })} disabled={!editable}>Press TARE (zero the balance)</Btn>
              {H.tared[id] && <span className="lab-help">Tared.</span>}
            </div>
          </div>
        )
      })}
      {H.zeroInstruments.map(id => (
        <div key={id} className="lab-closeup">
          <p className="lab-help">Check the zero of the {lower(id)}: close the jaws gently with the ratchet and read it. A reading below zero is a negative zero error.</p>
          <Btn kind="sm" onClick={() => dispatch('zeroCheck', { instrument: id })} disabled={!editable}>Close the jaws and look at the zero</Btn>
          {H.zeroShown[id] !== undefined && <Micrometer mm={H.zeroShown[id]} closed label={apparatusName(id) + ' with its jaws closed'} />}
          <form className="lab-inline" onSubmit={e => { e.preventDefault(); if (dispatch('recordZero', { instrument: id, value: zeroV })) setZeroV('') }}>
            <label>Zero error <input inputMode="decimal" size="7" value={zeroV} onChange={e => setZeroV(e.target.value)} disabled={!editable || H.zeroShown[id] === undefined} aria-label={'Zero error of the ' + lower(id)} /> mm</label>
            <Btn type="submit" kind="sm" disabled={!editable || zeroV === ''}>Record</Btn>
            {H.zero[id] && <span className="lab-help">Recorded: {H.zero[id].value} mm. Your readings will be corrected by this.</span>}
          </form>
        </div>
      ))}
      {parallax && (
        <div className="lab-row" role="group" aria-label="Eye position">
          <span>Your eye:</span>
          <Btn kind="sm" onClick={() => dispatch('setEye', { offset: Math.max(-1, eye - 0.125) })} disabled={!editable || eye <= -1} label="Move your eye left or down">◀</Btn>
          <span className="lab-eye-track" aria-hidden="true"><span style={{ left: (50 + 45 * eye) + '%' }} /></span>
          <Btn kind="sm" onClick={() => dispatch('setEye', { offset: Math.min(1, eye + 0.125) })} disabled={!editable || eye >= 1} label="Move your eye right or up">▶</Btn>
          <span className="lab-help">{eyeText}. Line the needle up with its reflection in the mirror strip, or look straight across the pointer.</span>
        </div>
      )}
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
        <Btn kind="sm" onClick={() => dispatch('measure', { key: c.key })} disabled={!editable}>Measure with the {lower(c.instrument)}</Btn>
      </div>
      <div className="lab-closeup" aria-live="polite"><CloseUp r={c} view={view} label={lower(c.instrument)} /></div>
      <form className="lab-inline" onSubmit={e => { e.preventDefault(); if (dispatch('recordConst', { key: c.key, value: v })) setV('') }}>
        <label>Record what it shows <input inputMode="decimal" value={v} onChange={e => setV(e.target.value)} disabled={!editable} size="8" aria-label={'Record ' + c.label} /> {c.unit}</label>
        <Btn type="submit" kind="sm" disabled={!editable || v === ''}>Record</Btn>
        {recorded != null && <span className="lab-help">Recorded: {recorded} {c.unit}</span>}
      </form>
    </div>
  )
}

/** Start / stop / reset, with the motion drawn at its real period so oscillations can be counted. */
function StopwatchControl({ m, view, dispatch, editable }) {
  const H = view.hands
  const running = H.timer.running
  const motion = H.motion?.key === m.key ? H.motion : null
  const fixed = H.timed.find(t => t.key === m.key)?.cycles || null
  const [startedAt, setStartedAt] = useState(null)
  const [speed, setSpeed] = useState(1)
  const [, tick] = useState(0)
  useEffect(() => { if (running && startedAt == null) setStartedAt(performance.now()); if (!running) setStartedAt(null) }, [running, startedAt])
  useEffect(() => {
    if (!running) return undefined
    const t = setInterval(() => tick(x => x + 1), 60)
    return () => clearInterval(t)
  }, [running])
  const elapsed = running && startedAt != null ? ((performance.now() - startedAt) / 1000) * speed : 0
  const shownValue = view.readings[m.key]
  const text = running ? stopwatchText(H.timer.acc + elapsed) : stopwatchText(shownValue !== undefined ? shownValue : H.timer.acc, m.resolution)
  const start = () => { if (dispatch('startTimer')) setStartedAt(performance.now()) }
  const stop = () => {
    const cycles = fixed && motion?.period ? Math.max(1, Math.min(200, Math.round(elapsed / motion.period))) : null
    dispatch('measure', cycles ? { key: m.key, cycles } : { key: m.key })
  }
  const revolve = /revolution/i.test(m.label)
  return (
    <div className="lab-closeup">
      <div className="lab-row lab-sw">
        <StopwatchFace text={text} running={running} />
        {motion && <MotionView motion={motion} running={running} speed={speed} startedAt={startedAt} revolve={revolve} />}
      </div>
      <div className="lab-row">
        {!running
          ? <Btn kind="sm primary" onClick={start} disabled={!editable}>{fixed ? 'Release and start the stopwatch' : 'Start the stopwatch'}</Btn>
          : <Btn kind="sm primary" onClick={stop} disabled={!editable}>Stop the stopwatch</Btn>}
        <Btn kind="sm" onClick={() => dispatch('resetTimer')} disabled={!editable || running}>Reset to zero</Btn>
        <label className="lab-help">Speed <select value={speed} onChange={e => setSpeed(Number(e.target.value))} disabled={running} aria-label="Playback speed">
          <option value={1}>real time</option><option value={2}>× 2 (time-lapse)</option><option value={5}>× 5 (time-lapse)</option></select></label>
      </div>
      <p className="lab-help">{fixed ? `Count ${fixed} complete ${revolve ? 'revolutions' : 'oscillations'}, starting the count from 0 as you start, and stop the stopwatch as the ${revolve ? 'bung' : 'bob'} completes the last one. ` : 'Start the stopwatch as the motion begins and stop it at the mark. '}
        Reset it before each new timing: a stopwatch that is not reset counts on from its last time.</p>
    </div>
  )
}

function RowForm({ P, view, dispatch, editable }) {
  const [vals, setVals] = useState({})
  const ready = P.measures.every(m => vals[m.key] !== undefined && vals[m.key] !== '')
  return (
    <form className="lab-rowform" onSubmit={e => { e.preventDefault(); if (dispatch('recordRow', { values: vals })) setVals({}) }}>
      {P.measures.map(m => (
        <div key={m.key} className="lab-const">
          {m.instrument === 'stopwatch'
            ? <StopwatchControl m={m} view={view} dispatch={dispatch} editable={editable} />
            : <>
                <div className="lab-row"><b>{m.label}</b><Btn kind="sm" onClick={() => dispatch('measure', { key: m.key })} disabled={!editable}>{m.instrument ? 'Look at the ' + lower(m.instrument) : 'Measure'}</Btn></div>
                <div className="lab-closeup" aria-live="polite"><CloseUp r={m} view={view} label={m.instrument ? lower(m.instrument) : ''} /></div>
              </>}
          <label>{m.symbol || m.label} = <input inputMode="decimal" size="8" value={vals[m.key] ?? ''} onChange={e => setVals(x => ({ ...x, [m.key]: e.target.value }))} disabled={!editable} aria-label={'Record ' + m.label} /> {m.unit}</label>
        </div>
      ))}
      <Btn type="submit" kind="primary" disabled={!editable || !ready}>Record this row</Btn>
    </form>
  )
}

function IVControl({ iv, view, dispatch, editable }) {
  const [x, setX] = useState(String(view.x ?? ''))
  useEffect(() => { setX(String(view.x ?? '')) }, [view.x])
  if (iv.instrument === 'slotted_masses') {
    return (
      <div className="lab-row">
        <span>Load: <b>{view.x} {iv.unit}</b></span>
        <Btn kind="sm" onClick={() => dispatch('setIV', { value: view.x + iv.step })} disabled={!editable || view.x + iv.step > iv.max + 1e-9}>Add a {iv.step} {iv.unit} mass</Btn>
        <Btn kind="sm" onClick={() => dispatch('setIV', { value: view.x - iv.step })} disabled={!editable || view.x - iv.step < iv.min - 1e-9}>Take one off</Btn>
        <span className="lab-help">Add masses one at a time, gently.</span>
      </div>
    )
  }
  return (
    <form className="lab-row" onSubmit={e => { e.preventDefault(); dispatch('setIV', { value: x }) }}>
      <label className="lab-range">{ivVerb(iv)} <b>{x} {iv.unit}</b>
        <input type="range" min={iv.min} max={iv.max} step={iv.step} value={x} onChange={e => setX(e.target.value)} disabled={!editable} aria-label={iv.label} />
      </label>
      <Btn type="submit" kind="sm" disabled={!editable || Number(x) === view.x}>Do it</Btn>
      <span className="lab-help">Now: <b>{view.x} {iv.unit}</b>{iv.monotonic ? ' · cannot go back' : ''}</span>
    </form>
  )
}

export default function HandsOnControls({ def, view, dispatch, editable }) {
  const P = def.practical
  const H = view.hands
  const iv = P.iv
  const ready = !!view.collected
  const heat = H.heatFrac > 0.02 ? (H.hot ? 'hot: open the switch and let it cool' : 'warm') : null
  return (
    <div className="lab-controls">
      <Stockroom def={def} view={view} dispatch={dispatch} editable={editable} />
      {ready && <>
        <Preparation def={def} view={view} dispatch={dispatch} editable={editable} />
        {P.circuit && <CircuitControls parts={P.circuit.parts} view={view} dispatch={dispatch} editable={editable} />}
        {heat && <p className={H.hot ? 'lab-warn' : 'lab-help'} role="status"><span className="lab-heat" style={{ opacity: 0.3 + 0.7 * H.heatFrac }} aria-hidden="true" /> The resistance wire is {heat}.</p>}
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
            {iv && <IVControl iv={iv} view={view} dispatch={dispatch} editable={editable} />}
            {H.hasSwitch && <p className="lab-help">Close the switch only while you take a reading, then open it again so the wire does not warm up.
              <Btn kind="sm" onClick={() => dispatch('toggleSwitch')} disabled={!editable}>{view.switchClosed ? 'Open the switch' : 'Close the switch'}</Btn></p>}
            {H.settles.length > 0 && (
              <div className="lab-row" role="status">
                {H.settled ? <span className="lab-help">Readings are steady.</span> : <span className="lab-warn">Something has just changed: the {H.settles.some(k => /rule|ruler/.test(P.measures.find(m => m.key === k)?.instrument || '')) ? 'load is still bouncing' : 'reading is still moving'}.</span>}
                <Btn kind="sm" onClick={() => dispatch('wait')} disabled={!editable}>Wait a few seconds</Btn>
              </div>
            )}
            {P.repeats > 1 && <p className="lab-help">Take at least {P.repeats} readings at each value: read, record, then read again.</p>}
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
        <fieldset className="lab-fs"><legend>Finish</legend>
          {H.tidy
            ? <p className="lab-ok">Switched off and tidied away.</p>
            : <><p className="lab-help">When you have all your readings, switch off{H.hasSwitch ? ' (open the switch)' : ''} and tidy the apparatus away.</p>
                <Btn kind="sm" onClick={() => dispatch('tidyUp')} disabled={!editable}>Switch off and tidy away</Btn></>}
        </fieldset>
      </>}
    </div>
  )
}

/** Ohm's law on the hands-on bench: meter close-ups, settling, heating and tidying. */
export function OhmsHandsOn({ view, dispatch, editable }) {
  const H = view.hands
  const alt = H.metersAlt || {}
  return (
    <fieldset className="lab-fs">
      <legend>Meters (look closely)</legend>
      <div className="lab-row lab-sw">
        <div><p className="lab-help">Ammeter</p><LCD value={view.meters.A1} alt={alt.A1} res={0.001} unit="A" width={200} label="Ammeter display" /></div>
        <div><p className="lab-help">Voltmeter</p><LCD value={view.meters.V1} alt={alt.V1} res={0.01} unit="V" width={200} label="Voltmeter display" /></div>
      </div>
      {view.fault === 'short_circuit' && <p className="lab-warn">Supply tripped: short circuit. Check your leads.</p>}
      <div className="lab-row" role="status">
        {H.settled ? <span className="lab-help">The readings are steady.</span> : <span className="lab-warn">The readings are still changing.</span>}
        <Btn kind="sm" onClick={() => dispatch('wait')} disabled={!editable}>Wait a few seconds</Btn>
      </div>
      {H.heatFrac > 0.02 && <p className={H.hot ? 'lab-warn' : 'lab-help'}><span className="lab-heat" style={{ opacity: 0.3 + 0.7 * H.heatFrac }} aria-hidden="true" /> The resistor feels {H.hot ? 'hot: open the switch between readings' : 'warm'}.</p>}
      <div className="lab-row">
        {H.tidy ? <span className="lab-ok">Switched off and tidied away.</span>
          : <Btn kind="sm" onClick={() => dispatch('tidyUp')} disabled={!editable}>Switch off and tidy away</Btn>}
        <span className="lab-help">At the end: open the switch and turn the supply to 0 V first.</span>
      </div>
    </fieldset>
  )
}
