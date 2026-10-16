/**
 * Workspace — a student's experiment: bench, controls, instructions,
 * notebook, questions and submission, with autosave and recovery.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ctx.jsx'
import useLabSession from './useLabSession.js'
import LabViewport from './scene/LabViewport.jsx'
import Controls from './controls.jsx'
import { Instructions, Notebook, Questions, SaveIndicator, SubmitPanel, SimulationNotice } from './panels.jsx'

const pref = (k, d) => { try { return localStorage.getItem('sm_lab_' + k) ?? d } catch { return d } }
const setPref = (k, v) => { try { localStorage.setItem('sm_lab_' + k, v) } catch {} }
const TABS = [['controls', 'Controls'], ['instructions', 'Instructions'], ['notebook', 'Notebook'], ['questions', 'Questions'], ['submit', 'Submit']]

export default function Workspace({ experimentId, assignmentId, sessionId }) {
  const toast = useToast()
  const lab = useLabSession({ experimentId, assignmentId, sessionId })
  const { def, session, view, state, params, editable, save } = lab
  const [tab, setTab] = useState('controls')
  const [mode, setModeRaw] = useState(() => pref('mode', '3d'))
  const [low, setLowRaw] = useState(() => pref('low', '0') === '1')
  const setMode = useCallback((m) => { setModeRaw(m); setPref('mode', m) }, [])
  const setLow = useCallback((v) => { setLowRaw(v); setPref('low', v ? '1' : '0') }, [])
  const [confirmReset, setConfirmReset] = useState(false)

  const tables = useMemo(() => (def && params && state ? def.dataTables(params, state) : []), [def, params, state])
  const graph = useMemo(() => (def && params && state ? def.graph(params, state) : null), [def, params, state])

  useEffect(() => { if (def) document.title = def.title + ' · Smartious Virtual Lab' }, [def])

  if (lab.loadError) return <div className="lab-page"><p className="lab-error" role="alert">{lab.loadError}</p><Link to="/lab" className="lab-btn">Back to the lab</Link></div>
  if (session && !def) return <div className="lab-page"><p className="lab-error" role="alert">This experiment does not exist.</p><Link to="/lab" className="lab-btn">Back to the lab</Link></div>
  if (!session || !def || !view) return <div className="lab-page"><div className="lab-loading">Opening the experiment…</div></div>

  const doReset = async () => {
    try { await lab.reset(); toast.ok('Experiment restarted.') } catch (e) { toast.error(e?.response?.data?.message || 'Could not restart.') }
    setConfirmReset(false)
  }

  return (
    <div className="lab-work">
      <div className="lab-work-head">
        <div>
          <Link to="/lab" className="lab-link">← Lab</Link>
          <h1>{def.title}</h1>
          <span className={'lab-badge ' + def.subject}>{def.subject}</span>{' '}
          <span className="lab-help">Attempt {session.attempt}{!editable ? ' · read only' : ''}</span>
        </div>
        <div className="lab-work-tools">
          <SaveIndicator save={save} onRetry={lab.saveNow} />
          {editable && <button type="button" className="lab-btn ghost" onClick={lab.undo} disabled={!lab.canUndo} title="Undo the last step that has not been saved yet">Undo</button>}
          {editable && <button type="button" className="lab-btn ghost" onClick={() => lab.saveNow()} disabled={save.status === 'saving' || save.status === 'saved'}>Save now</button>}
          {editable && (confirmReset
            ? <span className="lab-confirm-inline">Start again from the beginning? <button type="button" className="lab-btn danger" onClick={doReset}>Yes, restart</button><button type="button" className="lab-btn ghost" onClick={() => setConfirmReset(false)}>Cancel</button></span>
            : <button type="button" className="lab-btn ghost" onClick={() => setConfirmReset(true)}>Restart</button>)}
        </div>
      </div>

      {lab.restorable && (
        <div className="lab-banner" role="alert">
          This device has work that was not saved to the server (from {new Date(lab.restorable.at).toLocaleString()}).
          <button type="button" className="lab-btn primary" onClick={lab.restoreBackup}>Restore it</button>
          <button type="button" className="lab-btn ghost" onClick={lab.discardBackup}>Discard</button>
        </div>
      )}
      {lab.actionError && (
        <div className="lab-action-error" role="alert">{lab.actionError} <button type="button" className="lab-link" onClick={lab.clearActionError}>Dismiss</button></div>
      )}

      <div className="lab-grid">
        <LabViewport experimentId={def.id} view={view} dispatch={lab.dispatch} editable={editable}
          mode={mode} setMode={setMode} lowGraphics={low} setLowGraphics={setLow} />
        <aside className="lab-side">
          <div className="lab-tabs" role="tablist" aria-label="Experiment panels">
            {TABS.map(([k, label]) => <button key={k} type="button" role="tab" id={'tab-' + k} aria-selected={tab === k} aria-controls={'panel-' + k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>)}
          </div>
          <div className="lab-panel" role="tabpanel" id={'panel-' + tab} aria-labelledby={'tab-' + tab}>
            {tab === 'controls' && <><SimulationNotice def={def} /><Controls experimentId={def.id} view={view} dispatch={lab.dispatch} editable={editable} /></>}
            {tab === 'instructions' && <Instructions def={def} />}
            {tab === 'notebook' && <Notebook def={def} notebook={lab.notebook} update={lab.updateNotebook} editable={editable} tables={tables} graph={graph} />}
            {tab === 'questions' && <Questions def={def} answers={lab.answers} update={lab.updateAnswer} editable={editable} />}
            {tab === 'submit' && <SubmitPanel lab={lab} toast={toast} />}
          </div>
        </aside>
      </div>
    </div>
  )
}
