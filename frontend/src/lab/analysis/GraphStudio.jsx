/**
 * GraphStudio — the student plots their own graph from their results table:
 * chooses the type, the axes and the scales, then draws the line of best
 * fit, a worst acceptable line or a tangent by hand, and a gradient
 * triangle. Gradients, intercepts and the uncertainty are read from the
 * student's own lines. The computer's least-squares line is only a check,
 * shown on request (and the teacher can see that it was used).
 */
import { useMemo, useState } from 'react'
import { graphPoints, axesOf, graphResults, headingOf, LIMITS, LINE_LABEL, computeTable } from '../core.js'
import GraphCanvas from './GraphCanvas.jsx'

const TYPES = [['scatter', 'Scatter graph (points and a line)'], ['line', 'Line graph (points joined)'], ['bar', 'Bar chart (categories)']]
const sig = (v, n = 3) => (v == null || !Number.isFinite(v) ? '—' : Number(v.toPrecision(n)).toString())

export function newGraph(analysis) {
  const cols = analysis.table.columns
  const id = 'g' + ((analysis.graphs || []).reduce((m, g) => Math.max(m, Number(String(g.id).replace(/\D/g, '')) || 0), 0) + 1)
  return { id, type: 'scatter', title: '', x: cols[0]?.id || null, y: cols[1]?.id || null, err: null, xLabel: '', yLabel: '', scale: { auto: true, origin: false }, lines: [], triangle: null, showComputer: false }
}

function defaultLine(role, pts, g) {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  const x1 = Math.min(...xs), x2 = Math.max(...xs), ym = ys.reduce((a, b) => a + b, 0) / ys.length
  if (role === 'tangent') {
    const mid = pts[Math.floor(pts.length / 2)]
    const w = (x2 - x1) / 4
    return { role, x1: mid.x - w, y1: mid.y, x2: mid.x + w, y2: mid.y }
  }
  const best = g.lines.find(l => l.role === 'best')
  if (role === 'worst' && best) {
    const tilt = (Math.max(...ys) - Math.min(...ys)) * 0.08
    return { role, x1: best.x1, y1: best.y1 + tilt, x2: best.x2, y2: best.y2 - tilt }
  }
  return { role, x1, y1: ym, x2, y2: ym }     // level: the student turns it to fit
}

export default function GraphStudio({ analysis, update, editable, onUseInWorking, fitKind = 'line' }) {
  const graphs = analysis.graphs || []
  const [sel, setSel] = useState(0)
  const i = Math.min(sel, Math.max(0, graphs.length - 1))
  const g = graphs[i]
  const cols = analysis.table.columns
  const t = useMemo(() => computeTable(analysis.table), [analysis.table])
  const numericCols = cols.filter((c, k) => t.cells.some(r => r[k]?.value != null))
  const pts = useMemo(() => (g ? graphPoints(analysis, g) : []), [analysis, g])
  const res = useMemo(() => (g ? graphResults(g, pts) : {}), [g, pts])
  const ax = useMemo(() => (g ? axesOf(g, pts) : null), [g, pts])

  const setG = (patch) => update(a => ({ ...a, graphs: a.graphs.map((x, k) => (k === i ? { ...x, ...(typeof patch === 'function' ? patch(x) : patch) } : x)) }))
  const add = () => { update(a => ({ ...a, graphs: [...(a.graphs || []), newGraph(a)] })); setSel(graphs.length) }
  const remove = () => { update(a => ({ ...a, graphs: a.graphs.filter((_, k) => k !== i) })); setSel(0) }
  const addLine = (role) => setG(x => ({ lines: [...x.lines.filter(l => l.role !== role || role === 'tangent'), defaultLine(role, pts, x)].slice(0, LIMITS.lines) }))
  const removeLine = (k) => setG(x => ({ lines: x.lines.filter((_, j) => j !== k), triangle: x.lines[k].role === 'best' ? null : x.triangle }))
  const addTriangle = () => {
    const xs = pts.map(p => p.x), lo = Math.min(...xs), hi = Math.max(...xs)
    setG({ triangle: { xa: Number((lo + 0.4 * (hi - lo)).toPrecision(4)), xb: Number((lo + 0.6 * (hi - lo)).toPrecision(4)) } })
  }
  const setScale = (patch) => setG(x => ({ scale: { ...x.scale, ...patch } }))

  if (!cols.length) return <p className="lab-empty">Draw up your results table first. Your graph is plotted from it.</p>
  if (!g) return (
    <div className="lab-empty">
      <p>Plot a graph of your results. You choose the axes, the scales and where the line goes, just as on graph paper.</p>
      {editable && <button type="button" className="lab-btn primary" onClick={add}>Start a graph</button>}
    </div>
  )

  const best = res.best, worst = res.worst
  const scatter = g.type === 'scatter'
  const unit = (c) => cols.find(x => x.id === c)?.unit || ''
  const uy = unit(g.y), ux = unit(g.x)
  const gUnit = uy && ux ? (uy === ux ? '' : `${uy} ${/\s/.test(ux) ? '(' + ux + ')' : ux}⁻¹`) : uy

  return (
    <div className="lab-gs">
      <div className="lab-gs-tabs" role="tablist" aria-label="Your graphs">
        {graphs.map((x, k) => <button key={x.id} type="button" role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => setSel(k)}>{x.title || 'Graph ' + (k + 1)}</button>)}
        {editable && graphs.length < LIMITS.graphs && <button type="button" className="lab-gs-add" onClick={add}>+ New graph</button>}
      </div>

      <div className="lab-gs-grid">
        <div className="lab-gs-paper">
          <GraphCanvas key={g.id} analysis={analysis} graph={g} editable={editable} onChange={(ng) => setG(ng)} />
          {editable && scatter && g.lines.length > 0 && <p className="lab-hint">Drag the round ends to turn a line, drag the line itself to move it, drag the square corners to size the triangle. Arrow keys move a selected handle (Shift for bigger steps).</p>}
        </div>

        <div className="lab-gs-side">
          <fieldset className="lab-fs" disabled={!editable}>
            <legend>Plot</legend>
            <label className="lab-gs-f">Title<input value={g.title} maxLength={120} placeholder={(headingOf(cols.find(c => c.id === g.y)) || 'y').split(' / ')[0] + ' against ' + (headingOf(cols.find(c => c.id === g.x)) || 'x').split(' / ')[0]} onChange={e => setG({ title: e.target.value })} /></label>
            <label className="lab-gs-f">Type<select value={g.type} onChange={e => setG({ type: e.target.value })}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label className="lab-gs-f">{g.type === 'bar' ? 'Categories (x)' : 'x-axis (horizontal)'}<select value={g.x || ''} onChange={e => setG({ x: e.target.value || null })}><option value="">Choose a column</option>{(g.type === 'bar' ? cols : numericCols).map(c => <option key={c.id} value={c.id}>{headingOf(c) || c.id}</option>)}</select></label>
            <label className="lab-gs-f">y-axis (vertical)<select value={g.y || ''} onChange={e => setG({ y: e.target.value || null })}><option value="">Choose a column</option>{numericCols.map(c => <option key={c.id} value={c.id}>{headingOf(c) || c.id}</option>)}</select></label>
            <label className="lab-gs-f">Error bars (±)<select value={g.err || ''} onChange={e => setG({ err: e.target.value || null })}><option value="">None</option>{numericCols.map(c => <option key={c.id} value={c.id}>{headingOf(c) || c.id}</option>)}</select></label>
            <label className="lab-gs-f">x-axis label<input value={g.xLabel} maxLength={80} placeholder={headingOf(cols.find(c => c.id === g.x))} onChange={e => setG({ xLabel: e.target.value })} /></label>
            <label className="lab-gs-f">y-axis label<input value={g.yLabel} maxLength={80} placeholder={headingOf(cols.find(c => c.id === g.y))} onChange={e => setG({ yLabel: e.target.value })} /></label>
          </fieldset>

          <fieldset className="lab-fs" disabled={!editable}>
            <legend>Scales</legend>
            <label className="lab-check"><input type="checkbox" checked={g.scale.auto !== false} onChange={e => setScale({ auto: e.target.checked, ...(e.target.checked ? {} : { xmin: ax.xmin, xmax: ax.xmax, ymin: ax.ymin, ymax: ax.ymax }) })} /> Choose scales automatically</label>
            {g.scale.auto !== false
              ? <label className="lab-check"><input type="checkbox" checked={!!g.scale.origin} onChange={e => setScale({ origin: e.target.checked })} /> Start both axes at zero (to read the intercept)</label>
              : (
                <div className="lab-gs-scale">
                  {g.type !== 'bar' && <><label>x from<input inputMode="decimal" value={g.scale.xmin ?? ''} onChange={e => setScale({ xmin: e.target.value })} /></label><label>to<input inputMode="decimal" value={g.scale.xmax ?? ''} onChange={e => setScale({ xmax: e.target.value })} /></label></>}
                  <label>y from<input inputMode="decimal" value={g.scale.ymin ?? ''} onChange={e => setScale({ ymin: e.target.value })} /></label><label>to<input inputMode="decimal" value={g.scale.ymax ?? ''} onChange={e => setScale({ ymax: e.target.value })} /></label>
                </div>
              )}
            <p className="lab-help">A good scale uses more than half the grid in each direction and has easy steps (1, 2, 5 or 10 per square).</p>
          </fieldset>

          {scatter && (
            <fieldset className="lab-fs" disabled={!editable || pts.length < 2}>
              <legend>Draw</legend>
              <div className="lab-row">
                <button type="button" className="lab-btn sm" onClick={() => addLine('best')}>{g.lines.some(l => l.role === 'best') ? 'Redraw' : 'Draw'} line of best fit</button>
                <button type="button" className="lab-btn sm" onClick={() => addLine('worst')} disabled={!best}>Worst acceptable line</button>
                <button type="button" className="lab-btn sm" onClick={() => addLine('tangent')}>Tangent</button>
                <button type="button" className="lab-btn sm" onClick={addTriangle} disabled={!best}>{g.triangle ? 'Reset' : 'Draw'} gradient triangle</button>
              </div>
              {g.lines.length > 0 && <ul className="lab-list">{g.lines.map((l, k) => <li key={k}><span><span className="lab-swatch" style={{ background: { best: '#7D1025', worst: '#1D4C9A', tangent: '#1E7B34' }[l.role] }} />{LINE_LABEL[l.role]}</span>{editable && <button type="button" className="lab-link" onClick={() => removeLine(k)}>Remove</button>}</li>)}</ul>}
              {g.triangle && <p className="lab-help"><button type="button" className="lab-link" onClick={() => setG({ triangle: null })}>Remove triangle</button></p>}
              <label className="lab-check"><input type="checkbox" checked={!!g.showComputer} onChange={e => setG({ showComputer: e.target.checked })} /> Check against the computer’s line (dashed orange). Your teacher can see if you used this.</label>
            </fieldset>
          )}

          {scatter && (best || res.tangent) && (
            <div className="lab-gs-res" aria-live="polite">
              <h4>Read from your graph</h4>
              {res.triangle && (
                <p className="lab-gs-work">Triangle: ({sig(res.triangle.xa)}, {sig(res.triangle.ya)}) to ({sig(res.triangle.xb)}, {sig(res.triangle.yb)})<br />
                  gradient = Δy / Δx = {sig(res.triangle.dy)} / {sig(res.triangle.dx)} = <b>{sig(res.triangle.gradient)}</b>{gUnit ? ' ' + gUnit : ''}</p>
              )}
              <table className="lab-table">
                <thead><tr><th>Line</th><th>Gradient</th><th>y-intercept</th></tr></thead>
                <tbody>
                  {best && <tr><td>Best fit</td><td>{sig(best.gradient)}</td><td>{sig(best.intercept)}</td></tr>}
                  {worst && <tr><td>Worst acceptable</td><td>{sig(worst.gradient)}</td><td>{sig(worst.intercept)}</td></tr>}
                  {res.tangent && <tr><td>Tangent</td><td>{sig(res.tangent.gradient)}</td><td>{sig(res.tangent.intercept)}</td></tr>}
                </tbody>
              </table>
              {res.gradientUncertainty != null && <p>Uncertainty in gradient = |best − worst| = <b>{sig(res.gradientUncertainty, 2)}</b> ({sig(res.gradientPercent, 2)} %)</p>}
              {g.showComputer && res.computer && <p className="lab-help">Computer’s least-squares line: gradient {sig(res.computer.m)}, intercept {sig(res.computer.c)}{res.computer.r2 != null ? `, r² = ${sig(res.computer.r2, 4)}` : ''}{fitKind === 'origin' ? '. The theory predicts a line through the origin.' : '.'}</p>}
              {editable && onUseInWorking && (
                <div className="lab-row">
                  {best && <button type="button" className="lab-btn sm" onClick={() => onUseInWorking(i, 'gradient')}>Use gradient in working</button>}
                  {best && <button type="button" className="lab-btn sm" onClick={() => onUseInWorking(i, 'intercept')}>Use intercept</button>}
                  {res.gradientUncertainty != null && <button type="button" className="lab-btn sm" onClick={() => onUseInWorking(i, 'uncertainty')}>Use uncertainty</button>}
                </div>
              )}
            </div>
          )}
          {editable && <p><button type="button" className="lab-link" onClick={remove}>Delete this graph</button></p>}
        </div>
      </div>
    </div>
  )
}
