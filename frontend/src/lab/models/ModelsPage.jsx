/**
 * ModelsPage — the labelled 3D models library (/lab/models) and one model
 * (/lab/models/:id). Turn the model with a finger or the mouse, click a part
 * or a label to read about it, run the animation, show the cut-away, or test
 * yourself: the labels are hidden and you click the part that is named.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MODELS, getModel } from './catalogue.js'
import './models.css'

const pref = (k, d) => { try { return localStorage.getItem('sm_lab_' + k) ?? d } catch { return d } }
const setPref = (k, v) => { try { localStorage.setItem('sm_lab_' + k, v) } catch {} }
const SUBJECTS = [['biology', 'Biology'], ['physics', 'Physics and technology']]

export function ModelsLibrary() {
  return (
    <section>
      <h2>3D models</h2>
      <p className="lab-help">Labelled models to turn, take apart and test yourself on. Click any model to open it.</p>
      {SUBJECTS.map(([k, label]) => (
        <section key={k} className="lab-collection">
          <h2>{label}</h2>
          <div className="m3d-cards">
            {MODELS.filter(m => m.subject === k).map(m => (
              <Link key={m.id} to={'/lab/models/' + m.id} className="m3d-card">
                <span className={'lab-badge ' + m.subject}>{m.topic}</span>
                <h3>{m.title}</h3>
                <p>{m.summary}</p>
                {m.credit && <p className="lab-help">3D model: {m.credit.author || m.credit.source} · {m.credit.licence}</p>}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}

function shuffle(list) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

export function ModelViewer() {
  const { id } = useParams()
  const meta = getModel(id)
  const box = useRef(null)
  const stageRef = useRef(null)
  const [model, setModel] = useState(null)
  const [problem, setProblem] = useState(null)
  const [selected, setSelected] = useState(null)
  const [labels, setLabels] = useState(true)
  const [animate, setAnimate] = useState(false)
  const [cutaway, setCutaway] = useState(true)
  const [status, setStatus] = useState('')
  const [low, setLow] = useState(pref('low', '0') === '1')
  const [quiz, setQuiz] = useState(null)          // { order, i, score, tries, feedback }
  const quizRef = useRef(null); quizRef.current = quiz

  useEffect(() => {
    if (!meta || !box.current) return undefined
    let stage = null, cancelled = false
    setModel(null); setSelected(null); setAnimate(false); setQuiz(null); setProblem(null)
    Promise.all([import('./modelStage.js'), import('../scene/engine3d.js'), meta.load()]).then(async ([S, E, build]) => {
      if (cancelled) return
      if (!E.webglAvailable()) { setProblem('3D graphics (WebGL) are not available on this device.'); return }
      stage = S.createModelStage(box.current, { low, onSelect: (pid) => onPart(pid) })
      stageRef.current = stage
      const m = await stage.load(build)
      if (cancelled) return
      setModel(m); setStatus(stage.status())
    }).catch(() => setProblem('This model could not be loaded. Check your connection and try again.'))
    return () => { cancelled = true; stage?.dispose(); stageRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, low])

  // Keep the line about the moment shown up to date while the model moves.
  useEffect(() => {
    if (!animate) return undefined
    const t = setInterval(() => setStatus(stageRef.current?.status() || ''), 250)
    return () => clearInterval(t)
  }, [animate])

  function onPart(pid) {
    const q = quizRef.current
    if (q && q.i < q.order.length) {
      const want = q.order[q.i]
      if (pid === want.id) {
        const score = q.score + (q.tries === 0 ? 1 : 0)
        stageRef.current?.select(pid)
        setQuiz({ ...q, score, i: q.i + 1, tries: 0, feedback: { ok: true, text: 'Yes, that is the ' + want.name.toLowerCase() + '.' } })
      } else {
        const got = stageRef.current?.model?.parts.find(p => p.id === pid)
        setQuiz({ ...q, tries: q.tries + 1, feedback: { ok: false, text: got ? 'That is the ' + got.name.toLowerCase() + '. Try again.' : 'Try again.' } })
      }
      return
    }
    setSelected(pid)
    stageRef.current?.select(pid)
  }
  const choose = (pid) => onPart(pid)
  const toggleLabels = () => { const v = !labels; setLabels(v); stageRef.current?.setLabels(v) }
  const toggleAnimate = () => { const v = !animate; setAnimate(v); stageRef.current?.setAnimate(v); if (!v) setStatus(stageRef.current?.status() || '') }
  const toggleCut = () => { const v = !cutaway; setCutaway(v); stageRef.current?.setCutaway(v) }
  const startQuiz = () => {
    const parts = stageRef.current?.model?.parts || []
    const order = shuffle(parts).slice(0, Math.min(8, parts.length))
    setSelected(null); stageRef.current?.select(null); stageRef.current?.setQuiz(true)
    setQuiz({ order, i: 0, score: 0, tries: 0, feedback: null })
  }
  const endQuiz = () => { setQuiz(null); stageRef.current?.setQuiz(false); stageRef.current?.select(null) }
  const part = useMemo(() => model?.parts.find(p => p.id === selected) || null, [model, selected])

  if (!meta) return <section><p className="lab-error" role="alert">That model is not in the library.</p><Link className="lab-btn" to="/lab/models">All models</Link></section>
  return (
    <section>
      <div className="lab-row">
        <Link to="/lab/models" className="lab-btn sm ghost">← All models</Link>
        <h2 style={{ margin: 0 }}>{meta.title}</h2>
        <span className={'lab-badge ' + meta.subject}>{meta.topic}</span>
      </div>
      <div className="m3d-layout">
        <div>
          <div ref={box} className="m3d-stage" role="img" aria-label={'3D model: ' + meta.title + '. Drag to turn it, scroll or pinch to zoom.'}>
            {!model && !problem && <div className="lab-loading" style={{ color: '#DDE5EE', padding: 24 }}>Building the model…</div>}
            {problem && <p className="lab-error" role="alert" style={{ margin: 16 }}>{problem}</p>}
          </div>
          <div className="m3d-tools">
            <button type="button" className={'lab-btn sm' + (labels ? ' primary' : '')} aria-pressed={labels} onClick={toggleLabels} disabled={!model || !!quiz}>Labels</button>
            {model?.tick && <button type="button" className={'lab-btn sm' + (animate ? ' primary' : '')} aria-pressed={animate} onClick={toggleAnimate}>{animate ? 'Pause' : model.animateLabel || 'Animate'}</button>}
            {model?.cutaway && <button type="button" className={'lab-btn sm' + (cutaway ? ' primary' : '')} aria-pressed={cutaway} onClick={toggleCut}>Cut-away</button>}
            <button type="button" className="lab-btn sm" onClick={() => stageRef.current?.resetView()} disabled={!model}>Reset view</button>
            {!quiz ? <button type="button" className="lab-btn sm" onClick={startQuiz} disabled={!model}>Test yourself</button> : <button type="button" className="lab-btn sm" onClick={endQuiz}>End test</button>}
            <label className="lab-check"><input type="checkbox" checked={low} onChange={e => { setLow(e.target.checked); setPref('low', e.target.checked ? '1' : '0') }} /> Low graphics</label>
          </div>
          {status && <p className="m3d-status" aria-live="polite">{status}</p>}
        </div>
        <aside className="m3d-side">
          {quiz ? (
            <div className="m3d-panel m3d-quiz" aria-live="polite">
              {quiz.i < quiz.order.length ? <>
                <h3>Test yourself · {quiz.i + 1} of {quiz.order.length}</h3>
                <p>Click the <b>{quiz.order[quiz.i].name}</b> on the model.</p>
                {quiz.feedback && <p className={quiz.feedback.ok ? 'lab-ok' : 'lab-warn'}>{quiz.feedback.text}</p>}
                <p className="lab-help">Score: {quiz.score} (first-try answers count)</p>
              </> : <>
                <h3>Finished</h3>
                <p>You found {quiz.score} of {quiz.order.length} parts at the first try.</p>
                <div className="lab-row"><button type="button" className="lab-btn sm primary" onClick={startQuiz}>Try again</button><button type="button" className="lab-btn sm" onClick={endQuiz}>Back to labels</button></div>
              </>}
            </div>
          ) : (
            <div className="m3d-panel">
              {part ? <><h3>{part.name}</h3><p>{part.info}</p></> : <><h3>{meta.title}</h3><p>{meta.summary}</p><p className="lab-help" style={{ marginTop: 8 }}>Click a part or a label to read what it does. Drag to turn the model; scroll or pinch to zoom.</p></>}
            </div>
          )}
          {meta.credit && (
            <div className="m3d-panel m3d-credit">
              <p>3D model: {meta.credit.url ? <a href={meta.credit.url} target="_blank" rel="noopener noreferrer">{meta.credit.title || meta.title}</a> : (meta.credit.title || meta.title)}{meta.credit.author ? ' by ' + meta.credit.author : ''}{meta.credit.source ? ' (' + meta.credit.source + ')' : ''}, {meta.credit.licenceUrl ? <a href={meta.credit.licenceUrl} target="_blank" rel="noopener noreferrer">{meta.credit.licence}</a> : meta.credit.licence}.{meta.credit.changes ? ' ' + meta.credit.changes : ''}</p>
            </div>
          )}
          {model && !quiz && (
            <div className="m3d-panel">
              <h3>Parts</h3>
              <ul className="m3d-parts">{model.parts.map(p => <li key={p.id}><button type="button" className={selected === p.id ? 'on' : ''} onClick={() => choose(p.id)}>{p.name}</button></li>)}</ul>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
