/**
 * LabDemo — one practical from the Virtual Lab, open to anyone on the
 * public /virtual-lab page (no login, nothing saved to the server).
 *
 * It runs the same shared engine, 3D bench and controls as the student
 * workspace (Workspace.jsx), but keeps the session in the browser: every
 * action is applied locally with applyAction, and the unknown acid
 * concentration is revealed only when the visitor checks their answer.
 * The planning, results-table, graph and report steps, autosave and
 * teacher marking are left to the full lab for Smartious students.
 */
import { useCallback, useMemo, useRef, useState } from 'react'
import LabViewport from './scene/LabViewport.jsx'
import Controls from './controls.jsx'
import { DataTables, SimulationNotice } from './panels.jsx'
import { paramsFor, applyAction, viewOf, getExperiment } from './core.js'
import './lab.css'

const pref = (k, d) => { try { return localStorage.getItem('sm_lab_' + k) ?? d } catch { return d } }
const setPref = (k, v) => { try { localStorage.setItem('sm_lab_' + k, v) } catch {} }
const newSeed = () => 'web-' + Math.random().toString(36).slice(2, 10)

export default function LabDemo({ experimentId = 'chem-titration', onFinished }) {
  const def = useMemo(() => getExperiment(experimentId), [experimentId])
  const [seed, setSeed] = useState(newSeed)
  const params = useMemo(() => paramsFor(def, seed, {}), [def, seed])
  const [state, setState] = useState(() => def.initialState(params))
  const [actions, setActions] = useState([])
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('controls')
  const [mode, setModeRaw] = useState(() => pref('mode', '3d'))
  const [low, setLowRaw] = useState(() => pref('low', '0') === '1')
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(null)
  const setMode = useCallback((m) => { setModeRaw(m); setPref('mode', m) }, [])
  const setLow = useCallback((v) => { setLowRaw(v); setPref('low', v ? '1' : '0') }, [])

  // Actions build on the latest state, not the last render (a held tap sends several).
  const stateRef = useRef(state)
  stateRef.current = state
  const dispatch = useCallback((type, payload = {}) => {
    try {
      const next = applyAction(def, params, stateRef.current, { type, payload })
      stateRef.current = next
      setState(next)
      setActions(a => [...a, { type, payload }])
      setError(null)
      return true
    } catch (e) { setError(e.message); return false }
  }, [def, params])

  const view = useMemo(() => viewOf(def, params, state), [def, params, state])
  const tables = useMemo(() => def.dataTables(params, state), [def, params, state])

  const restart = () => {
    const s = newSeed()
    setSeed(s); const p = paramsFor(def, s, {})
    const st = def.initialState(p); stateRef.current = st
    setState(st); setActions([]); setError(null); setAnswer(''); setChecked(null)
  }
  const check = () => {
    const v = Number(String(answer).replace(',', '.'))
    if (!Number.isFinite(v) || v <= 0) { setChecked({ ok: false, text: 'Type the concentration as a number, for example 0.0950.' }); return }
    const truth = params.Ca, off = Math.abs(v - truth) / truth
    setChecked(off <= 0.02
      ? { ok: true, text: `Well done. The acid was ${truth.toFixed(4)} mol dm⁻³, and your answer is within ${Math.max(0.1, off * 100).toFixed(1)}%.` }
      : { ok: false, text: `Not quite: the acid was ${truth.toFixed(4)} mol dm⁻³ (you are ${(off * 100).toFixed(1)}% out). Check your concordant titres and the 1:1 ratio, then try a new bench.` })
    onFinished?.(off <= 0.02)
  }

  return (
    <div className="lab-app lab-demo" style={{ minHeight: 0, background: 'transparent' }}>
      {error && <div className="lab-action-error" role="alert">{error} <button type="button" className="lab-link" onClick={() => setError(null)}>Dismiss</button></div>}
      <div className="lab-grid">
        <LabViewport experimentId={def.id} view={view} dispatch={dispatch} editable
          mode={mode} setMode={setMode} lowGraphics={low} setLowGraphics={setLow}
          onlySetup={actions.every(a => a.type === 'setUp')} />
        <aside className="lab-side">
          <div className="lab-tabs" role="tablist" aria-label="Bench panels">
            {[['controls', 'Controls'], ['record', 'Your readings'], ['method', 'Method'], ['answer', 'Your answer']].map(([k, label]) => (
              <button key={k} type="button" role="tab" id={'demo-tab-' + k} aria-selected={tab === k} aria-controls={'demo-panel-' + k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
            ))}
          </div>
          <div className="lab-panel" role="tabpanel" id={'demo-panel-' + tab} aria-labelledby={'demo-tab-' + tab}>
            {tab === 'controls' && <><SimulationNotice def={def} /><Controls experimentId={def.id} view={view} dispatch={dispatch} editable /></>}
            {tab === 'record' && <><p className="lab-help">Every reading you recorded at the bench. Repeat until two titres agree within 0.10 cm³.</p><DataTables tables={tables} /></>}
            {tab === 'method' && <ol>{def.procedure.map(p => <li key={p}>{p}</li>)}</ol>}
            {tab === 'answer' && (
              <div>
                <p>The sodium hydroxide in the burette is <b>0.100 mol dm⁻³</b> and you pipette <b>25.0 cm³</b> of the acid. NaOH and {params.acidName.toLowerCase()} react 1:1.</p>
                <p className="lab-help">Concentration of acid = (0.100 × mean titre ÷ 1000) ÷ 0.0250</p>
                <label htmlFor="demo-conc"><b>Concentration of the acid (mol dm⁻³)</b></label>
                <div className="lab-row" style={{ marginTop: 6 }}>
                  <input id="demo-conc" inputMode="decimal" value={answer} onChange={e => { setAnswer(e.target.value); setChecked(null) }} placeholder="e.g. 0.0950" style={{ maxWidth: 160 }} />
                  <button type="button" className="lab-btn primary" onClick={check}>Check my answer</button>
                </div>
                {checked && <p className={checked.ok ? 'lab-ok' : 'lab-warn'} role="status" style={{ marginTop: 8 }}>{checked.text}</p>}
              </div>
            )}
          </div>
          <div className="lab-panel" style={{ borderTop: '1px solid var(--lab-line)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="lab-btn ghost" onClick={restart}>New bench (new unknown acid)</button>
            <span className="lab-help">Practice only: nothing is saved.</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
