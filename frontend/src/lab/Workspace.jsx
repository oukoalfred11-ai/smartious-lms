/**
 * Workspace — a student's practical from start to finish, in the order it
 * is done in a school laboratory:
 *   1 Plan  2 Experiment (bench)  3 Results table  4 Graph  5 Analysis
 *   6 Conclusion  7 Report and submit
 * Autosave and recovery cover every step (useLabSession).
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ctx.jsx'
import useLabSession from './useLabSession.js'
import LabViewport from './scene/LabViewport.jsx'
import Controls from './controls.jsx'
import { Instructions, Questions, SaveIndicator, SubmitPanel, SimulationNotice, DataTables, Graph, LABELS } from './panels.jsx'
import { computeTable, checkAnalysis } from './core.js'
import ResultsTable from './analysis/ResultsTable.jsx'
import GraphStudio from './analysis/GraphStudio.jsx'
import Working from './analysis/Working.jsx'
import Coach from './analysis/Coach.jsx'
import Report from './analysis/Report.jsx'

const pref = (k, d) => { try { return localStorage.getItem('sm_lab_' + k) ?? d } catch { return d } }
const setPref = (k, v) => { try { localStorage.setItem('sm_lab_' + k, v) } catch {} }

const STEPS = [
  ['plan', 'Plan'], ['experiment', 'Experiment'], ['results', 'Results table'], ['graph', 'Graph'],
  ['analysis', 'Analysis'], ['conclusion', 'Conclusion'], ['report', 'Report & submit'],
]
const PLACEHOLDER = {
  aim: '', hypothesis: 'What do you expect to happen, and why? Use the science you know.',
  variables: '', risk: 'Hazard → risk → how you will reduce it. For example: hot water → scalds → stand the beaker on a mat and do not carry it while full.',
  apparatus: 'List the apparatus and materials you will use, with sizes and ranges (e.g. 0–1 A ammeter, 50.00 cm³ burette).',
  procedure: 'Number the steps. Say what you will measure, how, and how you will keep the control variables constant.',
  observations: 'Write anything you notice while you work: colour changes, readings that drift, anything unexpected.',
  analysis: 'Describe what your graph shows (trend, proportionality, anomalies) and explain the calculation.',
  conclusion: 'State what you found, with the value and its unit, and whether it supports your hypothesis.',
  evaluation: 'Sources of uncertainty and error, which matters most, and specific improvements.',
}

function Fields({ keys, def, notebook, update, editable }) {
  return keys.map(k => (
    <div key={k} className="lab-nb-sec">
      <label htmlFor={'nb-' + k}><h3>{LABELS[k]}</h3></label>
      {editable
        ? <textarea id={'nb-' + k} value={notebook[k] ?? ''} onChange={e => update(k, e.target.value)} maxLength={10000} rows={k === 'aim' ? 2 : 4}
            placeholder={k === 'aim' ? def.notebook.aim : k === 'variables' ? def.notebook.variables : PLACEHOLDER[k]} />
        : <p className="lab-nb-ro">{notebook[k] || '—'}</p>}
    </div>
  ))
}

export default function Workspace({ experimentId, assignmentId, sessionId }) {
  const toast = useToast()
  const lab = useLabSession({ experimentId, assignmentId, sessionId })
  const { def, session, view, state, params, editable, save, analysis, updateAnalysis } = lab
  const [step, setStepRaw] = useState(() => pref('step_' + (sessionId || experimentId), 'plan'))
  const [benchTab, setBenchTab] = useState('controls')
  const [mode, setModeRaw] = useState(() => pref('mode', '3d'))
  const [low, setLowRaw] = useState(() => pref('low', '0') === '1')
  const setMode = useCallback((m) => { setModeRaw(m); setPref('mode', m) }, [])
  const setLow = useCallback((v) => { setLowRaw(v); setPref('low', v ? '1' : '0') }, [])
  const [confirmReset, setConfirmReset] = useState(false)
  const setStep = (k) => { setStepRaw(k); setPref('step_' + (sessionId || experimentId), k); window.scrollTo?.({ top: 0, behavior: 'smooth' }) }

  const tables = useMemo(() => (def && params && state ? def.dataTables(params, state) : []), [def, params, state])
  const benchGraph = useMemo(() => (def && params && state ? def.graph(params, state) : null), [def, params, state])
  const minRows = def?.practical?.minPoints || 5

  useEffect(() => { if (def) document.title = def.title + ' · Smartious Virtual Lab' }, [def])

  // Rough progress for the step bar.
  const done = useMemo(() => {
    if (!def || !state) return {}
    const nb = lab.notebook, filled = (k) => String(nb[k] || '').trim().length > 3
    const t = computeTable(analysis.table)
    const benchRows = tables.filter(x => !/^Technique/.test(x.title)).reduce((a, x) => a + x.rows.length, 0)
    const checks = checkAnalysis(analysis, { minRows })
    const qs = def.questions.filter(q => !/^plan_/.test(q.id) && q.id !== 'evaluation')
    return {
      plan: filled('hypothesis') && filled('variables') && filled('risk'),
      experiment: benchRows >= Math.min(minRows, 3),
      results: t.columns.length > 1 && t.cells.length >= Math.min(minRows, 3),
      graph: (analysis.graphs || []).length > 0 && !checks.some(c => c.area === 'Graph' && !c.ok),
      analysis: (analysis.calcs || []).length > 0 && qs.every(q => String(lab.answers[q.id] ?? '').trim()),
      conclusion: filled('conclusion') && (filled('evaluation') || String(lab.answers.evaluation || '').trim().length > 3),
      report: ['submitted', 'marked'].includes(session?.status),
    }
  }, [def, state, lab.notebook, lab.answers, analysis, tables, minRows, session?.status])

  if (lab.loadError) return <div className="lab-page"><p className="lab-error" role="alert">{lab.loadError}</p><Link to="/lab" className="lab-btn">Back to the lab</Link></div>
  if (session && !def) return <div className="lab-page"><p className="lab-error" role="alert">This experiment does not exist.</p><Link to="/lab" className="lab-btn">Back to the lab</Link></div>
  if (!session || !def || !view) return <div className="lab-page"><div className="lab-loading">Opening the experiment…</div></div>

  const doReset = async () => {
    try { await lab.reset(); toast.ok('Experiment restarted. Your plan, table and graphs are kept.') } catch (e) { toast.error(e?.response?.data?.message || 'Could not restart.') }
    setConfirmReset(false)
  }
  const useInWorking = (gi, what) => {
    const pre = gi ? 'g' + (gi + 1) + '_' : ''
    const line = what === 'gradient' ? { name: pre + 'm', label: 'Gradient of the line of best fit', expr: pre + 'gradient', unit: '', sf: 3 }
      : what === 'intercept' ? { name: pre + 'c', label: 'Intercept on the y-axis', expr: pre + 'intercept', unit: '', sf: 3 }
        : { name: pre + 'dm', label: 'Uncertainty in the gradient', expr: pre + 'gradient_uncertainty', unit: '', sf: 2 }
    updateAnalysis(a => ({ ...a, calcs: [...(a.calcs || []), line] }))
    toast.ok('Added to your working (Analysis step). Give it a unit there.')
  }
  const idx = STEPS.findIndex(s => s[0] === step)
  const cur = idx < 0 ? 0 : idx
  const planQs = def.questions.filter(q => /^plan_/.test(q.id))
  const analysisQs = def.questions.filter(q => !/^plan_/.test(q.id) && q.id !== 'evaluation')
  const evalQs = def.questions.filter(q => q.id === 'evaluation')
  const qProps = { answers: lab.answers, update: lab.updateAnswer, editable }

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
          {editable && step === 'experiment' && <button type="button" className="lab-btn ghost" onClick={lab.undo} disabled={!lab.canUndo} title="Undo the last bench step that has not been saved yet">Undo</button>}
          {editable && <button type="button" className="lab-btn ghost" onClick={() => lab.saveNow()} disabled={save.status === 'saving' || save.status === 'saved'}>Save now</button>}
          {editable && (confirmReset
            ? <span className="lab-confirm-inline">Clear the bench and readings and start the experiment again? <button type="button" className="lab-btn danger" onClick={doReset}>Yes, restart</button><button type="button" className="lab-btn ghost" onClick={() => setConfirmReset(false)}>Cancel</button></span>
            : <button type="button" className="lab-btn ghost" onClick={() => setConfirmReset(true)}>Restart bench</button>)}
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

      <nav className="lab-steps" aria-label="Stages of the practical">
        <ol>
          {STEPS.map(([k, label], i) => (
            <li key={k} className={(k === step || (idx < 0 && i === 0) ? 'on ' : '') + (done[k] ? 'done' : '')}>
              <button type="button" onClick={() => setStep(k)} aria-current={i === cur ? 'step' : undefined}>
                <span className="n" aria-hidden="true">{done[k] ? '✓' : i + 1}</span><span className="t">{label}</span>
                {done[k] && <span className="sr-only"> (done)</span>}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {STEPS[cur][0] === 'plan' && (
        <div className="lab-stage two">
          <section className="lab-card"><h2>The task</h2><Instructions def={def} /></section>
          <section className="lab-card">
            <h2>Your plan</h2>
            <p className="lab-help">Plan before you touch the apparatus. Your plan goes into your report.</p>
            <Fields keys={['aim', 'hypothesis', 'variables', 'risk', 'apparatus', 'procedure']} def={def} notebook={lab.notebook} update={lab.updateNotebook} editable={editable} />
            {planQs.length > 0 && <><h3>Planning questions</h3><Questions def={{ ...def, questions: planQs }} {...qProps} /></>}
          </section>
        </div>
      )}

      {STEPS[cur][0] === 'experiment' && (
        <div className="lab-grid">
          <LabViewport experimentId={def.id} view={view} dispatch={lab.dispatch} editable={editable}
            mode={mode} setMode={setMode} lowGraphics={low} setLowGraphics={setLow} />
          <aside className="lab-side">
            <div className="lab-tabs" role="tablist" aria-label="Bench panels">
              {[['controls', 'Controls'], ['record', 'Bench record'], ['observations', 'Observations'], ['instructions', 'Method']].map(([k, label]) => (
                <button key={k} type="button" role="tab" id={'btab-' + k} aria-selected={benchTab === k} aria-controls={'bpanel-' + k} className={benchTab === k ? 'on' : ''} onClick={() => setBenchTab(k)}>{label}</button>
              ))}
            </div>
            <div className="lab-panel" role="tabpanel" id={'bpanel-' + benchTab} aria-labelledby={'btab-' + benchTab}>
              {benchTab === 'controls' && <><SimulationNotice def={def} /><Controls experimentId={def.id} view={view} dispatch={lab.dispatch} editable={editable} /></>}
              {benchTab === 'record' && <><p className="lab-help">Everything you recorded at the bench, exactly as you wrote it. You will draw up your own table from this in the next step.</p><DataTables tables={tables} /></>}
              {benchTab === 'observations' && <Fields keys={['observations']} def={def} notebook={lab.notebook} update={lab.updateNotebook} editable={editable} />}
              {benchTab === 'instructions' && <><h3>Your method</h3><p className="lab-nb-ro">{lab.notebook.procedure || 'You have not written a method yet (Plan step).'}</p><h3>Suggested procedure</h3><ol>{def.procedure.map(p => <li key={p}>{p}</li>)}</ol></>}
            </div>
          </aside>
        </div>
      )}

      {STEPS[cur][0] === 'results' && (
        <div className="lab-stage">
          <section className="lab-card wide"><h2>Results table</h2><ResultsTable analysis={analysis} update={updateAnalysis} editable={editable} benchTables={tables} /></section>
          <section className="lab-card"><Coach analysis={analysis} minRows={minRows} only="Table" compact /></section>
        </div>
      )}

      {STEPS[cur][0] === 'graph' && (
        <section className="lab-card wide"><h2>Graph</h2>
          <GraphStudio analysis={analysis} update={updateAnalysis} editable={editable} onUseInWorking={useInWorking} fitKind={def.practical?.fitKind} />
        </section>
      )}

      {STEPS[cur][0] === 'analysis' && (
        <div className="lab-stage two">
          <section className="lab-card"><h2>Working</h2><Working analysis={analysis} update={updateAnalysis} editable={editable} />
            <Fields keys={['analysis']} def={def} notebook={lab.notebook} update={lab.updateNotebook} editable={editable} /></section>
          <section className="lab-card"><h2>Results and questions</h2>
            <p className="lab-help">Give each final answer from your own working, to the precision asked for.</p>
            <Questions def={{ ...def, questions: analysisQs }} {...qProps} /></section>
        </div>
      )}

      {STEPS[cur][0] === 'conclusion' && (
        <div className="lab-stage two">
          <section className="lab-card"><h2>Conclusion and evaluation</h2><Fields keys={['conclusion', 'evaluation']} def={def} notebook={lab.notebook} update={lab.updateNotebook} editable={editable} />
            {evalQs.length > 0 && <Questions def={{ ...def, questions: evalQs }} {...qProps} />}</section>
          <section className="lab-card"><h2>Your evidence</h2>
            {(analysis.graphs || []).length ? <p className="lab-help">Your graph and working are in the report. Refer to them: quote your value with its uncertainty.</p> : <Graph g={benchGraph} />}
            <Coach analysis={analysis} minRows={minRows} compact /></section>
        </div>
      )}

      {STEPS[cur][0] === 'report' && (
        <div className="lab-stage report">
          <section className="lab-card wide">
            <div className="lab-row lab-noprint">
              <button type="button" className="lab-btn" onClick={() => window.print()}>Print or save as PDF</button>
              <span className="lab-help">Check your report before you submit. Go back to any step to change it.</span>
            </div>
            <Report def={def} session={session} notebook={lab.notebook} answers={lab.answers} analysis={analysis} benchTables={tables} />
          </section>
          <aside className="lab-card lab-noprint">
            <Coach analysis={analysis} minRows={minRows} />
            <h2>Submit</h2>
            <SubmitPanel lab={lab} toast={toast} />
          </aside>
        </div>
      )}

      <div className="lab-stepnav lab-noprint">
        {cur > 0 ? <button type="button" className="lab-btn" onClick={() => setStep(STEPS[cur - 1][0])}>← {STEPS[cur - 1][1]}</button> : <span />}
        {cur < STEPS.length - 1 && <button type="button" className="lab-btn primary" onClick={() => setStep(STEPS[cur + 1][0])}>Next: {STEPS[cur + 1][1]} →</button>}
      </div>
    </div>
  )
}
