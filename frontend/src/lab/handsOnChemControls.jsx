/**
 * handsOnChemControls.jsx — control panels for the step-by-step titration and
 * osmosis benches. Every step the 3D or 2D bench offers is here too, so the
 * practical can be done with a keyboard alone. Instruments are drawn, not
 * printed: the student reads the burette close-up (from the eye position
 * they chose) and the cylinder against the ruler, and types what they see.
 */
import { useState } from 'react'
import { INDICATORS } from './core.js'

function Btn({ children, onClick, disabled, kind = '', type = 'button', pressed }) {
  return <button type={type} className={'lab-btn ' + kind} onClick={onClick} disabled={disabled} aria-pressed={pressed}>{children}</button>
}
const tick = (on) => (on ? '✓ ' : '')

// ── Titration ────────────────────────────────────────────────

/** What a teacher would tell the student to do next (never reveals a hidden value). */
export function titrationNext(v) {
  const b = v.burette, f = v.flask, p = v.pipette, run = v.runs[v.run - 1] || {}
  if (!v.ppe.goggles || !v.ppe.coat) return 'Put on your safety goggles and lab coat before you touch the reagents.'
  if (!b.filled) {
    if (b.rinsedWith !== 'naoh') return 'Rinse the burette with a little of the sodium hydroxide and let it run to waste.'
    if (!b.funnel) return 'Put the funnel in the top of the burette, with the tap closed.'
    return 'Pour sodium hydroxide through the funnel into the burette, to just above the 0.00 mark.'
  }
  if (run.final == null && run.initial == null && b.funnel) return 'Take the funnel out of the burette: drips from it would change the reading.'
  if (b.aboveZero) return 'Run a little solution into the waste beaker to fill the jet and bring the meniscus onto the scale.'
  if (run.final != null) return v.titres.concordant.length >= 2 ? 'You have concordant titres. Go on to your results table, or do another run to check.' : 'Start a new run: wash the flask out with distilled water, and refill the burette if it is low.'
  if (run.initial == null) return 'Check the jet is full of liquid, then crouch so your eye is level with the meniscus and record the initial reading.'
  if (!f.hasAcid) {
    if (!f.clean) return 'Empty the flask and rinse it with distilled water.'
    if (!p.filler) return 'Attach the pipette filler to the pipette. Never pipette by mouth.'
    if (!p.full) return p.rinsedWith !== 'acid' ? 'Rinse the pipette with a little of the acid.' : 'Use the filler to draw the acid up to above the mark.'
    if (p.aboveMark) return 'Let the acid down until the bottom of the meniscus sits on the mark.'
    return 'Deliver the 25.0 cm³ of acid into the conical flask on the white tile; touch the tip on the inside of the flask.'
  }
  if (!f.indicator) return 'Choose an indicator and add 2 drops to the flask.'
  if (f.flash || f.unmixed) return 'Swirl the flask. Does the colour fade, or does it stay?'
  if (f.changed) return 'The colour has stayed after swirling: this is the end point. Read the final volume at eye level.'
  return 'Open the tap: a fast stream at first, then drop by drop near the end point, swirling all the time.'
}

/**
 * Close-up of the burette scale around the meniscus, as seen from the
 * student's eye position. From above or below, the graduation rings and the
 * meniscus look like ellipses and appear against the wrong graduation.
 */
export function BuretteCloseUp({ burette, eye = 'level', showJet = false }) {
  const b = burette
  if (!b.filled) return <div className="lab-scale-empty">The burette is empty.</div>
  const a = b.apparent ?? b.reading
  const H = 220, span = 2.4, pxPer = H / span
  const lo = a - span / 2
  const y = (v) => (v - lo) * pxPer
  const tilt = eye === 'level' ? 0 : 5
  const ticks = []
  for (let v = Math.max(0, Math.ceil(lo * 10) / 10); v <= lo + span + 1e-9; v = Math.round((v + 0.1) * 10) / 10) ticks.push(v)
  const ym = y(a)
  return (
    <svg viewBox={`0 0 ${showJet ? 180 : 140} ${H}`} className="lab-scale" style={showJet ? { width: 180 } : undefined} role="img"
      aria-label={`Close-up of the burette scale, seen with your eye ${eye === 'level' ? 'level with' : eye} the meniscus. Read the bottom of the meniscus.`}>
      <rect x="40" y="0" width="60" height={H} fill="#F7FAFC" stroke="#8796A5" />
      {lo < 0 && <rect x="40" y="0" width="60" height={Math.min(H, y(0))} fill="#EEF1F4" />}
      <rect x="41" y={Math.max(0, ym)} width="58" height={H} fill="#DCE9F5" />
      {tilt > 0 && <ellipse cx="70" cy={ym} rx="29" ry={tilt} fill="#C9DCEE" stroke="#5B7FA6" strokeWidth="1" />}
      <path d={`M41 ${ym - 3} Q70 ${ym + 8} 99 ${ym - 3}`} fill="none" stroke="#5B7FA6" strokeWidth="2" />
      {ticks.map(v => {
        const major = Math.abs(v - Math.round(v)) < 1e-6, half = !major && Math.abs(v * 10 % 5) < 1e-6
        return <g key={v}>
          <line x1="40" x2={major ? 72 : half ? 62 : 54} y1={y(v)} y2={y(v)} stroke="#2B3440" strokeWidth={major ? 1.6 : 1} />
          {major && tilt > 0 && <path d={`M72 ${y(v)} Q86 ${y(v) - (eye === 'above' ? tilt * 1.6 : -tilt * 1.6)} 99 ${y(v)}`} fill="none" stroke="#2B3440" strokeWidth="0.8" strokeDasharray="2 2" />}
          {major && tilt === 0 && <line x1="72" x2="99" y1={y(v)} y2={y(v)} stroke="#2B3440" strokeWidth="0.6" strokeDasharray="2 2" />}
          {major && <text x="34" y={y(v) + 4} fontSize="12" textAnchor="end">{v}</text>}
        </g>
      })}
      {lo < 0 && y(0) > 12 && <text x="70" y={Math.min(y(0) - 4, H - 4)} fontSize="9" textAnchor="middle" fill="#55606B">above 0.00</text>}
      {showJet && <g aria-label="The jet below the tap">
        <text x="150" y="16" fontSize="10" textAnchor="middle" fill="#55606B">Jet</text>
        <rect x="132" y="40" width="36" height="12" rx="3" fill="#3C4650" />
        <path d="M144 24 L156 24 L156 40 L144 40 Z M146 52 L154 52 L151 120 L149 120 Z" fill="#F7FAFC" stroke="#8796A5" />
        <path d="M145 25 L155 25 L155 39 L145 39 Z M147 53 L153 53 L150.6 118 L149.4 118 Z" fill="#DCE9F5" />
        {b.bubble && <ellipse cx="150" cy="78" rx="2.4" ry="9" fill="#FFFFFF" stroke="#8796A5" strokeWidth="0.8" />}
      </g>}
    </svg>
  )
}

/** The pipette's graduation mark and the meniscus near it. */
function PipetteMark({ pipette }) {
  const p = pipette
  const my = !p.full ? null : p.atMark ? 60 : 30
  return (
    <svg viewBox="0 0 80 110" className="lab-scale" style={{ width: 80 }} role="img" aria-label={!p.full ? 'The pipette is empty.' : p.atMark ? 'The bottom of the meniscus is on the mark.' : 'The acid is above the mark.'}>
      <rect x="32" y="0" width="16" height="110" fill="#F7FAFC" stroke="#8796A5" />
      {my != null && <rect x="33" y={my} width="14" height={110 - my} fill="#E1ECF6" />}
      {my != null && <path d={`M33 ${my - 2} Q40 ${my + 5} 47 ${my - 2}`} fill="none" stroke="#5B7FA6" strokeWidth="1.5" />}
      <ellipse cx="40" cy="62" rx="9" ry="2.4" fill="none" stroke="#1A1A1A" strokeWidth="1.2" />
      <text x="54" y="65" fontSize="8" fill="#55606B">mark</text>
    </svg>
  )
}

function ReadingInput({ label, onRecord, disabled }) {
  const [v, setV] = useState('')
  return (
    <form className="lab-inline" onSubmit={e => { e.preventDefault(); if (v !== '' && onRecord(v)) setV('') }}>
      <label>{label} <input inputMode="decimal" value={v} onChange={e => setV(e.target.value)} placeholder="0.00" disabled={disabled} aria-describedby="reading-help" /> cm³</label>
      <Btn type="submit" disabled={disabled || v === ''}>Record</Btn>
    </form>
  )
}

export function Notes({ notes, where = 'Run' }) {
  if (!notes?.length) return null
  return (
    <details className="lab-fs" open>
      <summary><b>Technique notes</b> (your teacher and your report see these)</summary>
      <ul className="lab-help">{notes.map((n, i) => <li key={i}>{where === 'Run' ? 'Run ' + n.run : n.at || 'All cylinders'}: {n.text}</li>)}</ul>
    </details>
  )
}

export function HandsOnTitrationControls({ view, dispatch, editable }) {
  const [probe, setProbe] = useState(false)
  const f = view.flask, b = view.burette, p = view.pipette
  const run = view.runs[view.run - 1]
  const off = !editable
  const mid = run && run.initial != null && run.final == null
  const d = (t, payload) => dispatch(t, payload)
  return (
    <div className="lab-controls">
      <h3>Run {view.run}</h3>
      <p className="lab-obs" aria-live="polite"><b>Next:</b> {titrationNext(view)}</p>
      <fieldset className="lab-fs">
        <legend>Safety</legend>
        <div className="lab-row">
          <Btn onClick={() => d('wearPPE', { item: 'goggles' })} disabled={off || view.ppe.goggles} pressed={view.ppe.goggles}>{tick(view.ppe.goggles)}Wear safety goggles</Btn>
          <Btn onClick={() => d('wearPPE', { item: 'coat' })} disabled={off || view.ppe.coat} pressed={view.ppe.coat}>{tick(view.ppe.coat)}Wear lab coat</Btn>
        </div>
      </fieldset>
      <fieldset className="lab-fs">
        <legend>Burette (sodium hydroxide)</legend>
        <div className="lab-row">
          <Btn onClick={() => d('rinseBurette', { with: 'water' })} disabled={off || b.filled}>Rinse with distilled water</Btn>
          <Btn onClick={() => d('rinseBurette', { with: 'naoh' })} disabled={off || b.filled}>Rinse with sodium hydroxide</Btn>
        </div>
        <div className="lab-row">
          <Btn onClick={() => d('burFunnel', { place: !b.funnel })} disabled={off}>{b.funnel ? 'Take the funnel out' : 'Put the funnel in'}</Btn>
          <Btn onClick={() => d('pourIntoBurette')} disabled={off || mid}>Pour NaOH in through the funnel</Btn>
        </div>
        <div className="lab-row">
          <span>Run into the waste beaker:</span>
          {[0.5, 1, 2].map(v => <Btn key={v} kind="sm" onClick={() => d('runToWaste', { volume: v })} disabled={off || !b.filled || mid}>{v} cm³</Btn>)}
        </div>
        <p className="lab-help">Burette: {b.filled ? (b.aboveZero ? 'filled; the meniscus is above the 0.00 mark' : 'filled') : 'empty'}{b.funnel ? '; funnel in the top' : ''}.</p>
      </fieldset>
      <fieldset className="lab-fs">
        <legend>Pipette (25.0 cm³ of {view.acid?.name?.toLowerCase() || 'acid'})</legend>
        <div className="lab-split">
          <PipetteMark pipette={p} />
          <div>
            <div className="lab-row">
              <Btn onClick={() => d('attachFiller')} disabled={off || p.filler} pressed={p.filler}>{tick(p.filler)}Attach pipette filler</Btn>
              <Btn onClick={() => d('rinsePipette', { with: 'water' })} disabled={off || p.full}>Rinse with distilled water</Btn>
              <Btn onClick={() => d('rinsePipette', { with: 'acid' })} disabled={off || p.full}>Rinse with the acid</Btn>
            </div>
            <div className="lab-row">
              <Btn onClick={() => d('fillPipette')} disabled={off || p.full}>Draw acid above the mark</Btn>
              <Btn onClick={() => d('adjustPipette')} disabled={off || !p.aboveMark}>Let down to the mark</Btn>
              <Btn onClick={() => d('deliverPipette')} disabled={off || !p.full || f.hasAcid}>Deliver into the flask</Btn>
            </div>
          </div>
        </div>
      </fieldset>
      <fieldset className="lab-fs">
        <legend>Conical flask and indicator</legend>
        <div className="lab-row">
          <Btn onClick={() => d('rinseFlask', { with: 'water' })} disabled={off}>Rinse flask with distilled water</Btn>
          <Btn onClick={() => d('rinseFlask', { with: 'acid' })} disabled={off || f.hasAcid}>Rinse flask with the acid</Btn>
        </div>
        <div className="lab-row">
          <select value={view.indicatorChosen || ''} onChange={e => e.target.value && d('chooseIndicator', { indicator: e.target.value })} disabled={off} aria-label="Choose indicator">
            <option value="">Choose indicator…</option>
            {Object.entries(INDICATORS).map(([id, x]) => <option key={id} value={id}>{x.name}</option>)}
          </select>
          <Btn onClick={() => d('addIndicator')} disabled={off}>Add 2 drops</Btn>
        </div>
        <p className="lab-help">Flask: {f.hasAcid ? 'contains the acid' : f.clean ? 'clean and rinsed' : 'needs washing out'}.</p>
      </fieldset>
      <fieldset className="lab-fs">
        <legend>Titrate: open the tap, swirl the flask</legend>
        <div className="lab-row">
          {[0.05, 0.1, 0.5, 1, 5].map(v => <Btn key={v} onClick={() => d('addBase', { volume: v })} disabled={off}>{v === 0.05 ? '1 drop' : v === 0.1 ? '2 drops' : v === 5 ? 'Fast stream (5 cm³)' : '+' + v + ' cm³'}</Btn>)}
          <Btn kind="primary" onClick={() => d('swirl')} disabled={off || !f.hasAcid}>Swirl the flask</Btn>
        </div>
        <p className="lab-obs" aria-live="polite">Flask: <b>{f.hasAcid ? f.colourName : 'empty'}</b>{f.flash ? `, with a flash of ${f.flashName} where the alkali lands` : ''}{f.overshot ? ' (well past the end point)' : ''}</p>
      </fieldset>
      <fieldset className="lab-fs">
        <legend>Read the burette</legend>
        <div className="lab-row" role="radiogroup" aria-label="Where your eye is">
          {[['above', 'Standing (eye above)'], ['level', 'Eye level with the meniscus'], ['below', 'Crouching too low']].map(([k, label]) => (
            <label key={k} className="lab-radio"><input type="radio" name="eye" checked={view.eye === k} onChange={() => d('eyeLevel', { pos: k })} disabled={off} /> {label}</label>
          ))}
        </div>
        <div className="lab-split">
          <BuretteCloseUp burette={b} eye={view.eye} showJet />
          <div>
            <p id="reading-help" className="lab-help">Read the bottom of the meniscus to the nearest 0.05 cm³ (e.g. 23.45). Get your eye level with it first: from above or below the scale seems to move.</p>
            <ReadingInput label="Initial reading" onRecord={(v) => d('recordReading', { which: 'initial', value: v })} disabled={off || run?.initial != null} />
            <ReadingInput label="Final reading" onRecord={(v) => d('recordReading', { which: 'final', value: v })} disabled={off || run?.initial == null || run?.final != null} />
            <label className="lab-check"><input type="checkbox" checked={!!run?.rough} onChange={e => d('markRough', { index: view.run - 1, rough: e.target.checked })} disabled={off} /> This is a rough (trial) run</label>
            <div className="lab-row"><Btn onClick={() => d('newRun')} disabled={off || run?.final == null}>Start a new run</Btn></div>
          </div>
        </div>
      </fieldset>
      <details className="lab-probe" open={probe} onToggle={e => setProbe(e.currentTarget.open)}>
        <summary>pH probe (teaching aid)</summary>
        <p>Simulated pH of the flask: <b>{f.pH == null ? '—' : f.pH.toFixed(2)}</b>. Find the endpoint with the indicator; the probe is only to help you understand the change.</p>
      </details>
      <Notes notes={view.notes} />
      {view.runs.some(r => r.titre != null) && (
        <p className="lab-help">Titres so far: {view.runs.filter(r => r.titre != null).map(r => `${r.titre.toFixed(2)}${r.rough ? ' (rough)' : ''}`).join(', ')}.
          {view.titres.concordant.length >= 2 ? ` Concordant (within 0.10 cm³): ${view.titres.concordant.map(x => x.toFixed(2)).join(', ')}.` : ' You need at least two concordant titres.'}</p>
      )}
    </div>
  )
}

// ── Osmosis ──────────────────────────────────────────────────

export function osmosisNext(v) {
  const cy = v.cylinders, t = v.tubes
  if (!v.cut) return 'Cut six potato cylinders with the cork borer, on the white tile.'
  if (cy.some(c => !c.trimmed)) return 'Measure each cylinder against the ruler and trim it to the same length with the scalpel.'
  if (t.some(x => x.m0 == null)) {
    if (!v.tared) return 'Put the weighing boat on the balance and tare (zero) it before weighing.'
    return 'Blot each cylinder dry, put it on the balance and record its initial mass.'
  }
  if (cy.some(c => c.tube == null)) return 'Place each cylinder in its labelled boiling tube of sucrose solution.'
  if (!v.immersed) return 'Start the timer.'
  if (v.elapsed < 30) return 'Fast-forward the lab clock: leave the cylinders in the solutions for at least 30 minutes.'
  if (t.some(x => x.m1 == null)) return 'Take each cylinder out, blot it dry in the same way, and reweigh it.'
  return 'All the masses are recorded. Go on to your results table.'
}

/** A cylinder lying against a millimetre ruler (read its length yourself). */
export function RulerView({ length }) {
  if (length == null) return <div className="lab-scale-empty">No cylinder cut yet.</div>
  const px = 3.6, x0 = 12
  const ticks = []
  for (let mm = 0; mm <= 70; mm++) ticks.push(mm)
  return (
    <svg viewBox="0 0 280 70" className="lab-svg" style={{ maxWidth: 300 }} role="img" aria-label="Potato cylinder lying against a ruler marked in millimetres. Read its length.">
      <rect x="4" y="34" width="272" height="30" fill="#F2E6C8" stroke="#B9A57A" />
      {ticks.map(mm => <line key={mm} x1={x0 + mm * px} x2={x0 + mm * px} y1="34" y2={34 + (mm % 10 === 0 ? 14 : mm % 5 === 0 ? 10 : 6)} stroke="#2B2B2B" strokeWidth={mm % 10 === 0 ? 1.2 : 0.7} />)}
      {ticks.filter(mm => mm % 10 === 0).map(mm => <text key={'t' + mm} x={x0 + mm * px} y="60" fontSize="8" textAnchor="middle">{mm / 10}</text>)}
      <text x="268" y="60" fontSize="7" textAnchor="end">cm</text>
      <rect x={x0} y="14" width={length * px} height="18" rx="5" fill="#EBD9A0" stroke="#B89B4A" />
    </svg>
  )
}

function NumInput({ label, unit, onRecord, disabled, size = 6, placeholder = '0.00', button = 'Record' }) {
  const [v, setV] = useState('')
  return (
    <form className="lab-inline" onSubmit={e => { e.preventDefault(); if (v !== '' && onRecord(v)) setV('') }}>
      <label>{label} <input inputMode="decimal" value={v} onChange={e => setV(e.target.value)} disabled={disabled} size={size} placeholder={placeholder} /> {unit}</label>
      <Btn type="submit" disabled={disabled || v === ''}>{button}</Btn>
    </form>
  )
}

export function HandsOnOsmosisControls({ view, dispatch, editable }) {
  const [mins, setMins] = useState('30')
  const [tube, setTube] = useState('')
  const off = !editable
  const i = view.selected, t = view.tubes[i], c = view.cylinders[i]
  const d = (type, payload) => dispatch(type, payload)
  const out = !c.inSolution
  return (
    <div className="lab-controls">
      <p className="lab-obs" aria-live="polite"><b>Next:</b> {osmosisNext(view)}</p>
      <fieldset className="lab-fs">
        <legend>Prepare the cylinders</legend>
        <div className="lab-row"><Btn onClick={() => d('cutCylinders')} disabled={off || view.cut}>{tick(view.cut)}Cut 6 cylinders with the cork borer</Btn></div>
        <div className="lab-row" role="group" aria-label="Choose a cylinder">
          {view.tubes.map((x, k) => <button type="button" key={k} className={'lab-chip' + (k === i ? ' on' : '')} aria-pressed={k === i} onClick={() => d('select', { index: k })} disabled={off}>Cylinder for {x.C.toFixed(1)} M</button>)}
        </div>
        {view.cut && <>
          <RulerView length={out ? c.length : null} />
          <NumInput label="Trim this cylinder to" unit="mm" size={4} placeholder="40" button="Trim with scalpel" onRecord={(v) => d('trimCylinder', { index: i, length: v })} disabled={off || t.m0 != null} />
          <div className="lab-row">
            <Btn onClick={() => d('blot', { index: i })} disabled={off || !out}>Blot dry on paper towel</Btn>
            <span className="lab-help">{c.inSolution ? 'In its tube of solution.' : c.wet ? 'Surface is wet.' : 'Blotted dry.'}</span>
          </div>
        </>}
      </fieldset>
      <fieldset className="lab-fs">
        <legend>Balance</legend>
        <div className="lab-row">
          <Btn onClick={() => d('tareBalance')} disabled={off || view.onPan != null}>Tare (zero) with the boat on</Btn>
          <Btn onClick={() => d('putOnPan', { index: i })} disabled={off || !view.cut || !out || c.onPan}>Put this cylinder on the pan</Btn>
          <Btn onClick={() => d('clearPan')} disabled={off || view.onPan == null}>Take it off</Btn>
        </div>
        <p className="lab-obs" aria-live="polite">Balance: <b>{view.balance == null ? '-.-- g' : view.balance.toFixed(2) + ' g'}</b>{view.onPan != null ? ` (cylinder for ${view.tubes[view.onPan].C.toFixed(1)} M on the pan)` : ' (weighing boat only)'}</p>
        {c.tube == null && <NumInput label={`Initial mass (${t.C.toFixed(1)} M)`} unit="g" onRecord={(v) => d('recordInitial', { index: i, value: v })} disabled={off || view.immersed} />}
        {t.removed && <NumInput label={`Final mass (${t.C.toFixed(1)} M)`} unit="g" onRecord={(v) => d('recordFinal', { index: i, value: v })} disabled={off || t.m1 != null} />}
      </fieldset>
      <fieldset className="lab-fs">
        <legend>Boiling tubes and lab clock</legend>
        {!view.immersed && <div className="lab-row">
          <label>Place this cylinder in tube <select value={tube === '' ? String(i) : tube} onChange={e => setTube(e.target.value)} disabled={off}>
            {view.tubes.map((x, k) => <option key={k} value={k}>{x.C.toFixed(1)} mol dm⁻³</option>)}
          </select></label>
          <Btn onClick={() => { if (d('placeInTube', { index: i, tube: tube === '' ? i : Number(tube) })) setTube('') }} disabled={off || c.tube != null}>Place in tube</Btn>
        </div>}
        <p className="lab-obs">Lab clock: <b>{view.clockTime}</b>{view.immersed ? ` · in solution for ${view.elapsed} min` : ''}</p>
        {!view.immersed
          ? <Btn onClick={() => d('startTimer')} disabled={off}>Start the timer</Btn>
          : <form className="lab-row" onSubmit={e => { e.preventDefault(); d('wait', { minutes: mins }) }}>
              <label>Fast-forward <input inputMode="numeric" value={mins} onChange={e => setMins(e.target.value)} size="4" disabled={off} /> min</label>
              <Btn type="submit" disabled={off}>Wait</Btn>
              <Btn onClick={() => d('remove', { index: i })} disabled={off || !c.inSolution}>Take this cylinder out</Btn>
            </form>}
      </fieldset>
      <table className="lab-table"><thead><tr><th>Sucrose / M</th><th>Initial / g</th><th>Final / g</th><th>Change / %</th></tr></thead>
        <tbody>{view.tubes.map((x, k) => <tr key={k} className={k === i ? 'sel' : ''}><td>{x.C.toFixed(1)}</td><td>{x.m0 != null ? x.m0.toFixed(2) : '—'}</td><td>{x.m1 != null ? x.m1.toFixed(2) : '—'}</td><td>{x.percent != null ? x.percent.toFixed(1) : '—'}</td></tr>)}</tbody></table>
      <Notes notes={view.notes} where="Cylinder" />
    </div>
  )
}
