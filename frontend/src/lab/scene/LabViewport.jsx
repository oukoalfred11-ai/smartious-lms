/**
 * LabViewport — the interactive bench.
 *
 * Shows the 3D scene when WebGL works and the user has not chosen the 2D
 * view; otherwise (no WebGL, context lost, load failure, or user choice)
 * the 2D diagram is shown. Both views display the same engine view and send
 * the same validated actions, so nothing depends on the graphics mode.
 * Three.js is loaded only here, on demand, so the rest of the LMS is not
 * slowed down by it.
 */
import { useEffect, useRef, useState } from 'react'
import View2D from '../views2d.jsx'
import { getExperiment } from '../core.js'

export default function LabViewport({ experimentId, view, dispatch, editable, mode, setMode, lowGraphics, setLowGraphics, onSelect }) {
  const box = useRef(null)
  const labRef = useRef(null)
  const sceneRef = useRef(null)
  const dispatchRef = useRef(dispatch); dispatchRef.current = dispatch
  const selectRef = useRef(onSelect); selectRef.current = onSelect
  const [status, setStatus] = useState('idle')   // idle | loading | ready | failed
  const [problem, setProblem] = useState(null)
  const [hover, setHover] = useState(null)      // what the pointer is over
  const [sel, setSel] = useState(null)          // what was last clicked (lead, pending terminal…)
  const selTimer = useRef(0)
  const showSel = (p) => {
    clearTimeout(selTimer.current)
    setSel(p)
    // Plain notices fade; a selected lead or a half-made connection stays.
    if (p && !['wire', 'pending', 'menu'].includes(p.kind)) selTimer.current = setTimeout(() => setSel(null), 2500)
  }

  useEffect(() => {
    if (mode !== '3d' || !box.current) return
    let alive = true
    setStatus('loading'); setProblem(null)
    Promise.all([import('./engine3d.js'), import('./scenes.js'), import('./practicalScene.js')]).then(([E3, S, PS]) => {
      if (!alive) return
      if (!E3.webglAvailable()) { setProblem('3D graphics (WebGL) are not available on this device, so the 2D view is shown.'); setMode('2d'); return }
      const def = getExperiment(experimentId)
      const build = S.SCENES[experimentId] || (def?.practical ? (lab, o) => PS.buildPracticalScene(lab, { ...o, def }) : null)
      if (!build) { setProblem('This experiment has no 3D scene yet; the 2D view is shown.'); setMode('2d'); return }
      try {
        let scene = null
        const lab = E3.createLabScene(box.current, { lowGraphics, onPick: (p) => scene?.onPick(p) })
        scene = build(lab, { dispatch: (t, p) => dispatchRef.current(t, p), onSelect: (p) => { showSel(p); selectRef.current?.(p) }, onHover: (t) => setHover(t || null) })
        if (scene.view) { lab.camera.position.set(...scene.view.pos); lab.controls.target.set(...scene.view.target); lab.controls.update() }
        lab.resetViewTo = () => { if (scene.view) { lab.camera.position.set(...scene.view.pos); lab.controls.target.set(...scene.view.target); lab.controls.update(); lab.invalidate() } else lab.resetView() }
        lab.onContextLost(() => { setProblem('The 3D view stopped (the graphics card was reset). Your work is safe; the 2D view is shown.'); setMode('2d') })
        labRef.current = lab; sceneRef.current = scene
        setStatus('ready')
      } catch (e) {
        setProblem('The 3D view could not start (' + (e?.message || 'unknown error') + '). The 2D view is shown.'); setMode('2d')
      }
    }).catch(() => { if (alive) { setProblem('The 3D view could not be loaded. Check your connection; the 2D view is shown.'); setMode('2d') } })
    return () => {
      alive = false
      labRef.current?.dispose(); labRef.current = null; sceneRef.current = null
      setStatus('idle'); setSel(null); setHover(null)
    }
  }, [mode, lowGraphics, experimentId, setMode])

  // Push every new engine view into the scene.
  useEffect(() => { if (status === 'ready' && view) { try { sceneRef.current?.update(view) } catch (e) { console.error('[lab] scene update', e) } } }, [view, status])

  const onKey = (e) => {
    const lab = labRef.current
    if (!lab) return
    if (e.key === '+' || e.key === '=') { lab.zoom(0.85); e.preventDefault() }
    else if (e.key === '-' || e.key === '_') { lab.zoom(1.18); e.preventDefault() }
    else if (e.key === 'r' || e.key === 'R') { lab.resetViewTo(); e.preventDefault() }
  }

  return (
    <section className="lab-viewport" aria-label="Laboratory bench">
      <div className="lab-vp-bar" role="toolbar" aria-label="View options">
        <div className="lab-seg" role="group" aria-label="View">
          <button type="button" aria-pressed={mode === '3d'} className={mode === '3d' ? 'on' : ''} onClick={() => { setProblem(null); setMode('3d') }}>3D</button>
          <button type="button" aria-pressed={mode === '2d'} className={mode === '2d' ? 'on' : ''} onClick={() => setMode('2d')}>2D</button>
        </div>
        {mode === '3d' && <>
          <label className="lab-check"><input type="checkbox" checked={lowGraphics} onChange={e => setLowGraphics(e.target.checked)} /> Low graphics</label>
          <span className="lab-vp-cam">
            <button type="button" onClick={() => labRef.current?.zoom(0.85)} aria-label="Zoom in" disabled={status !== 'ready'}>＋</button>
            <button type="button" onClick={() => labRef.current?.zoom(1.18)} aria-label="Zoom out" disabled={status !== 'ready'}>－</button>
            <button type="button" onClick={() => labRef.current?.resetViewTo()} disabled={status !== 'ready'}>Reset view</button>
          </span>
        </>}
      </div>
      {problem && <p className="lab-note" role="status">{problem}</p>}
      {mode === '3d'
        ? <div className="lab-3d" ref={box} tabIndex={0} onKeyDown={onKey}
            aria-label="3D bench. Drag to rotate, scroll or + and − to zoom, arrow keys to pan, R to reset. Every action is also available in the controls panel.">
            {status === 'loading' && <div className="lab-3d-loading">Loading the 3D laboratory…</div>}
            {status === 'ready' && (hover || sel) && (
              <div className="lab-3d-overlay" role="status" aria-live="polite">
                {sel?.kind === 'pending' && <>Lead from <b>{sel.label}</b>: now tap the other terminal, or drag between terminals. <button type="button" className="lab-btn sm ghost" onClick={() => { sel.cancel?.(); setSel(null) }}>Cancel</button></>}
                {sel?.kind === 'wire' && <>{sel.label.replace(' (click to select)', '')} <button type="button" className="lab-btn sm danger" disabled={!editable} onClick={() => { dispatch('disconnect', { index: sel.index }); setSel(null) }}>Remove lead</button> <button type="button" className="lab-btn sm ghost" onClick={() => { sel.clear?.(); setSel(null) }}>Close</button></>}
                {sel?.kind === 'menu' && <span className="lab-3d-menu" role="group" aria-label={sel.label}><b>{sel.label}:</b> {sel.actions.map(a => <button key={a.label} type="button" className="lab-btn sm" disabled={!editable || a.disabled} onClick={() => { setSel(null); a.run() }}>{a.label}</button>)} <button type="button" className="lab-btn sm ghost" onClick={() => setSel(null)}>Close</button></span>}
                {sel && !['pending', 'wire', 'menu'].includes(sel.kind) && sel.label && <span>{sel.label}</span>}
                {!sel && hover && <span>{hover}</span>}
              </div>
            )}
          </div>
        : <View2D experimentId={experimentId} view={view} dispatch={dispatch} editable={editable} onSelect={onSelect} />}
      {mode === '3d' && <p className="lab-hint">Drag to look around · click equipment to use it · every action is also in the controls panel.</p>}
    </section>
  )
}
