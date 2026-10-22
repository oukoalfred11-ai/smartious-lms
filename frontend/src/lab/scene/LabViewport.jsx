/**
 * LabViewport — the interactive bench.
 *
 * Shows the 3D scene when WebGL works and the user has not chosen the 2D
 * view; otherwise (no WebGL, context lost, load failure, or user choice)
 * the 2D diagram is shown. Both views display the same engine view and send
 * the same validated actions, so nothing depends on the graphics mode.
 * Three.js is loaded only here, on demand, so the rest of the LMS is not
 * slowed down by it.
 *
 * The 3D bench plays like a game:
 *   • A new attempt starts with "Set up your bench" (setupQuest.js): open
 *     the apparatus cupboard and carry each item to the bench, take the
 *     reagents from the rack, leave what the practical does not need.
 *   • A step panel (bottom left) says what to do next, with progress and a
 *     "Show me" button that flies the camera to it; a ring pulses under it.
 *   • Name tags float over the apparatus (crisp HTML text, always readable);
 *     "Labels" shows them all, otherwise only for what the pointer is on.
 *   • The camera stands at the bench and frames the work so the apparatus
 *     fills the view; "Look closer" (double-click) zooms in on one item.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import View2D from '../views2d.jsx'
import { getExperiment } from '../core.js'
import { benchGuide } from '../benchGuide.js'
import { apparatusName } from '../../../../shared/lab/apparatus.js'

const BENCH_Y = 0.9                 // bench top height in every scene (equipment.js)
const pref = (k, d) => { try { return localStorage.getItem('sm_lab_' + k) ?? d } catch { return d } }
const setPref = (k, v) => { try { localStorage.setItem('sm_lab_' + k, v) } catch {} }
// Small parts that would clutter the view with tags.
const NO_TAG = new Set(['tap', 'post', 'lead', 'terminal', 'tare', 'cupboard'])
const tagName = (p) => {
  if (!p) return ''
  if (p.name) return p.name.charAt(0).toUpperCase() + p.name.slice(1)
  const l = String(p.label || '').split(':')[0].trim()
  if (l) return l.length > 40 ? l.slice(0, 38) + '…' : l
  return p.id ? apparatusName(p.id) : ''
}

export default function LabViewport({ experimentId, view, dispatch, editable, mode, setMode, lowGraphics, setLowGraphics, onSelect, onlySetup = false }) {
  const box = useRef(null)
  const tagsBox = useRef(null)
  const labRef = useRef(null)
  const sceneRef = useRef(null)
  const questRef = useRef(null)
  const viewRef = useRef(view); viewRef.current = view
  const dispatchRef = useRef(dispatch); dispatchRef.current = dispatch
  const selectRef = useRef(onSelect); selectRef.current = onSelect
  const [status, setStatus] = useState('idle')   // idle | loading | ready | failed
  const [problem, setProblem] = useState(null)
  const [hover, setHover] = useState(null)      // what the pointer is over
  const [sel, setSel] = useState(null)          // what was last clicked (lead, pending terminal…)
  const [questTick, setQuestTick] = useState(0) // bumps when the set-up quest changes
  const [labels, setLabelsRaw] = useState(() => pref('labels2', '0') === '1')
  const [hudOpen, setHudOpen] = useState(true)
  const [showMethod, setShowMethod] = useState(false)
  const setLabels = (v) => { setLabelsRaw(v); setPref('labels2', v ? '1' : '0') }
  const hoverPick = useRef(null)
  const selTimer = useRef(0)
  const def = useMemo(() => getExperiment(experimentId), [experimentId])
  const showSel = (p) => {
    clearTimeout(selTimer.current)
    setSel(p)
    // Plain notices fade; a selected lead or a half-made connection stays.
    if (p && !['wire', 'pending', 'menu'].includes(p.kind)) selTimer.current = setTimeout(() => setSel(null), 3500)
  }

  // ── Build the 3D bench ─────────────────────────────────
  useEffect(() => {
    if (mode !== '3d' || !box.current) return
    let alive = true
    setStatus('loading'); setProblem(null)
    Promise.all([import('./engine3d.js'), import('./scenes.js'), import('./practicalScene.js'), import('./setupQuest.js')]).then(([E3, S, PS, SQ]) => {
      if (!alive) return
      if (!E3.webglAvailable()) { setProblem('3D graphics (WebGL) are not available on this device, so the 2D view is shown.'); setMode('2d'); return }
      const build = S.SCENES[experimentId] || (def?.practical ? (lab, o) => PS.buildPracticalScene(lab, { ...o, def }) : null)
      if (!build) { setProblem('This experiment has no 3D scene yet; the 2D view is shown.'); setMode('2d'); return }
      try {
        let scene = null
        const lab = E3.createLabScene(box.current, {
          lowGraphics,
          onPick: (p) => { if (questRef.current?.onPick(p)) return; scene?.onPick(p) },
          onHoverPick: (p) => { hoverPick.current = p; labRef.current?.invalidate() },
        })
        scene = build(lab, {
          dispatch: (t, p) => dispatchRef.current(t, p),
          onSelect: (p) => { showSel(p); selectRef.current?.(p) },
          onHover: (t) => setHover(t || null),
        })
        scene.update(viewRef.current)

        // The set-up quest: new attempts only (nothing done yet but set-up).
        const v0 = viewRef.current
        if (scene.setup && editable && onlySetup && !v0?.setup?.done) {
          const S0 = scene.setup()
          if (S0?.items?.length) {
            questRef.current = SQ.createSetupQuest(lab, {
              ...S0,
              dispatch: (t, p) => dispatchRef.current(t, p),
              say: (label) => showSel({ kind: 'notice', label }),
              menu: (label, actions) => showSel({ kind: 'menu', label, actions }),
              onChange: () => setQuestTick(t => t + 1),
            })
            questRef.current.sync(v0?.setup)
          }
        }
        const frame = (fly) => {
          const q = questRef.current
          const T = lab.THREE
          let area = null
          if (q && !q.done) area = q.workArea()
          else {
            area = new T.Box3()
            for (const o of lab.pickables) {
              if (!o.layers.test(lab.camera.layers)) continue
              let vis = true, x = o; while (x) { if (!x.visible) { vis = false; break } x = x.parent }
              if (vis) area.expandByObject(o)
            }
            // Frame the bench top, not the top of a tall stand: the work is down here.
            if (!area.isEmpty()) { area.min.y = Math.max(area.min.y, BENCH_Y); area.max.y = Math.max(area.min.y + 0.05, Math.min(area.max.y, BENCH_Y + 0.32)) }
          }
          if (area && !area.isEmpty()) lab.fitTo(area, { pitch: q && !q.done ? 0.72 : 0.7, margin: 1.03, fly })
          else if (scene.view) { lab.camera.position.set(...scene.view.pos); lab.controls.target.set(...scene.view.target); lab.controls.update() }
        }
        frame(false)
        lab.resetViewTo = () => { frame(true); lab.userMoved = false }
        lab.frameWork = frame
        // The page may still be settling (fonts, panels): keep the work framed
        // until the student moves the camera themselves.
        lab.onResize(() => { if (!lab.userMoved) frame(false) })
        lab.onContextLost(() => { setProblem('The 3D view stopped (the graphics card was reset). Your work is safe; the 2D view is shown.'); setMode('2d') })
        labRef.current = lab; sceneRef.current = scene
        setStatus('ready')
      } catch (e) {
        setProblem('The 3D view could not start (' + (e?.message || 'unknown error') + '). The 2D view is shown.'); setMode('2d')
      }
    }).catch(() => { if (alive) { setProblem('The 3D view could not be loaded. Check your connection; the 2D view is shown.'); setMode('2d') } })
    return () => {
      alive = false
      questRef.current?.dispose(); questRef.current = null
      labRef.current?.dispose(); labRef.current = null; sceneRef.current = null
      setStatus('idle'); setSel(null); setHover(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, lowGraphics, experimentId, setMode])

  // Push every new engine view into the scene and the quest.
  useEffect(() => {
    if (status !== 'ready' || !view) return
    try { sceneRef.current?.update(view) } catch (e) { console.error('[lab] scene update', e) }
    const q = questRef.current
    if (q) {
      // Anything but set-up done (e.g. from the controls panel) ends the quest.
      if (!q.done && !onlySetup) q.dispose()
      else if (!q.done) q.sync(view.setup)
      if (q.done || !onlySetup) { questRef.current = null; setQuestTick(t => t + 1); labRef.current?.frameWork?.(true) }
    }
  }, [view, status, onlySetup])

  // The pulsing ring follows the current step's object.
  const quest = questRef.current && !questRef.current.done ? questRef.current : null
  useEffect(() => {
    const lab = labRef.current
    if (!lab || status !== 'ready') return
    lab.ring('target', quest ? quest.focusTarget() : null, '#F2B705')
  }, [questTick, status, quest])

  // ── Name tags: HTML text over the 3D objects ──────────
  useEffect(() => {
    const lab = labRef.current
    const layer = tagsBox.current
    if (!lab || !layer || status !== 'ready') return
    const T = lab.THREE
    const bx = new T.Box3(), top = new T.Vector3()
    const els = new Map()
    const shown = (o) => { if (!o.layers.test(lab.camera.layers)) return false; while (o) { if (!o.visible) return false; o = o.parent } return true }
    const place = () => {
      const want = new Set()
      const q = questRef.current && !questRef.current.done ? questRef.current : null
      const taken = []                 // screen boxes of tags already placed: never overlap
      const order = [...lab.pickables].sort((a, b) => (hoverPick.current === b.userData.pick) - (hoverPick.current === a.userData.pick))
      for (const o of order) {
        const p = o.userData.pick
        if (!p || NO_TAG.has(p.kind) || !shown(o)) continue
        const isHover = hoverPick.current === p
        // During set-up: the item under the pointer and the next one to fetch
        // (all of them at once would hide the cupboard); afterwards, all.
        const isTarget = q && q.targetPick() === p
        if (!(isHover || isTarget || (labels && !q))) continue
        const name = tagName(p)
        if (!name) continue
        bx.setFromObject(o)
        if (bx.isEmpty()) continue
        top.set((bx.min.x + bx.max.x) / 2, bx.max.y + 0.012, (bx.min.z + bx.max.z) / 2)
        const s = lab.project(top)
        if (s.behind || s.x < -40 || s.y < -20 || s.x > layer.clientWidth + 40 || s.y > layer.clientHeight + 20) continue
        // A tag that would cover another is left out (hover and the target win).
        const w = name.length * 7 + 18, h = 24
        const r = { l: s.x - w / 2, r: s.x + w / 2, t: s.y - h, b: s.y }
        if (!isHover && !isTarget && taken.some(k => r.l < k.r && r.r > k.l && r.t < k.b && r.b > k.t)) continue
        taken.push(r)
        let el = els.get(o)
        if (!el) { el = document.createElement('div'); el.className = 'lab-tag'; layer.appendChild(el); els.set(o, el) }
        if (el.textContent !== name) el.textContent = name
        el.classList.toggle('hot', isHover)
        el.style.transform = `translate(${Math.round(s.x)}px, ${Math.round(s.y)}px) translate(-50%, -100%)`
        want.add(o)
      }
      for (const [o, el] of els) if (!want.has(o)) { el.remove(); els.delete(o) }
    }
    const off = lab.onRendered(place)
    lab.invalidate()
    return () => { off(); for (const el of els.values()) el.remove(); els.clear() }
  }, [status, labels, questTick])

  const onKey = (e) => {
    const lab = labRef.current
    if (!lab) return
    if (e.key === '+' || e.key === '=') { lab.zoom(0.85); e.preventDefault() }
    else if (e.key === '-' || e.key === '_') { lab.zoom(1.18); e.preventDefault() }
    else if (e.key === 'r' || e.key === 'R') { lab.resetViewTo(); e.preventDefault() }
  }
  const onDouble = () => {
    const lab = labRef.current, p = hoverPick.current
    if (!lab || !p) return
    const o = lab.pickables.find(x => x.userData.pick === p)
    if (o) lab.focusOn(o)
  }

  // ── Step panel ─────────────────────────────────────────
  let hud = null
  if (status === 'ready' && mode === '3d') {
    if (quest) {
      const steps = quest.steps()
      const n = steps.length, d = steps.filter(s => s.done).length
      const cur = steps.find(s => !s.done)
      const allIn = steps.slice(1, -1).every(s => s.done)
      hud = {
        title: 'Set up your bench', step: Math.min(n, d + 1), of: n, progress: d / n, text: cur?.text || '',
        extra: quest.wrongCount() ? `${quest.wrongCount()} item${quest.wrongCount() > 1 ? 's' : ''} taken out by mistake` : '',
        action: allIn ? { label: 'Start the practical', run: () => quest.finish() } : null,
        show: () => { const t = quest.focusTarget(); if (t) labRef.current?.focusOn(t, { closeness: 0.8 }) },
      }
    } else {
      const g = benchGuide(def, view)
      hud = g ? { title: def?.title || 'Experiment', progress: g.progress, text: g.text }
        : { title: def?.title || 'Experiment', text: 'Follow the method. Click apparatus to use it; every step is also in the controls panel.' }
    }
  }

  return (
    <section className="lab-viewport" aria-label="Laboratory bench">
      <div className="lab-vp-bar" role="toolbar" aria-label="View options">
        <div className="lab-seg" role="group" aria-label="View">
          <button type="button" aria-pressed={mode === '3d'} className={mode === '3d' ? 'on' : ''} onClick={() => { setProblem(null); setMode('3d') }}>3D</button>
          <button type="button" aria-pressed={mode === '2d'} className={mode === '2d' ? 'on' : ''} onClick={() => setMode('2d')}>2D</button>
        </div>
        {mode === '3d' && <>
          <label className="lab-check"><input type="checkbox" checked={labels} onChange={e => setLabels(e.target.checked)} /> Labels</label>
          <label className="lab-check"><input type="checkbox" checked={lowGraphics} onChange={e => setLowGraphics(e.target.checked)} /> Low graphics</label>
          <span className="lab-vp-cam">
            <button type="button" onClick={() => labRef.current?.zoom(0.85)} aria-label="Zoom in" disabled={status !== 'ready'}>＋</button>
            <button type="button" onClick={() => labRef.current?.zoom(1.18)} aria-label="Zoom out" disabled={status !== 'ready'}>－</button>
            <button type="button" onClick={() => labRef.current?.resetViewTo()} disabled={status !== 'ready'}>Whole bench</button>
          </span>
        </>}
      </div>
      {problem && <p className="lab-note" role="status">{problem}</p>}
      {mode === '3d'
        ? <div className="lab-3d" ref={box} tabIndex={0} onKeyDown={onKey} onDoubleClick={onDouble}
            aria-label="3D bench. Press and drag apparatus to carry it; drag empty space to look around; double-click something to look closer; scroll or + and − to zoom; R for the whole bench. Every action is also available in the controls panel.">
            {status === 'loading' && <div className="lab-3d-loading">Loading the 3D laboratory…</div>}
            <div className="lab-tags" ref={tagsBox} aria-hidden="true" />
            {hud && (
              <div className={'lab-hud' + (hudOpen ? '' : ' min')} role="status" aria-live="polite">
                <button type="button" className="lab-hud-top" onClick={() => setHudOpen(o => !o)} aria-expanded={hudOpen} title={hudOpen ? 'Hide the instructions' : 'Show the instructions'}>
                  <span className="lab-hud-title">{hud.title}</span>
                  {hud.of ? <span className="lab-hud-step">Step {hud.step} of {hud.of}</span> : null}
                  {hud.progress != null && <span className="lab-hud-pct">{Math.round(hud.progress * 100)}%</span>}
                  <span className="lab-hud-tog" aria-hidden="true">{hudOpen ? '▾' : '▸'}</span>
                </button>
                {hudOpen && <>
                  {hud.progress != null && <div className="lab-hud-bar"><i style={{ width: Math.round(hud.progress * 100) + '%' }} /></div>}
                  <p className="lab-hud-text">{hud.text}</p>
                  {hud.extra && <p className="lab-hud-extra">{hud.extra}</p>}
                  <div className="lab-hud-btns">
                    {hud.show && <button type="button" className="lab-btn sm ghost" onClick={hud.show}>Show me</button>}
                    {hud.action && <button type="button" className="lab-btn sm primary" disabled={!editable} onClick={hud.action.run}>{hud.action.label}</button>}
                    {def?.procedure?.length > 0 && <button type="button" className="lab-btn sm ghost" aria-expanded={showMethod} onClick={() => setShowMethod(m => !m)}>{showMethod ? 'Hide method' : 'Method'}</button>}
                  </div>
                  {showMethod && def?.procedure?.length > 0 && (
                    <ol className="lab-hud-method">{def.procedure.map((p, i) => <li key={i}>{p}</li>)}</ol>
                  )}
                </>}
              </div>
            )}
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
      {mode === '3d' && <p className="lab-hint">Press and drag apparatus to carry it · drag empty space to look around · double-click to look closer · every action is also in the controls panel.</p>}
    </section>
  )
}
