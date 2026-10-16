/**
 * GraphCanvas — draws one of the student's graphs on graph paper. In edit
 * mode the ends of each line, the whole line and the corners of the
 * gradient triangle can be dragged (mouse, touch or arrow keys).
 */
import { useMemo, useRef, useState } from 'react'
import { graphPoints, axesOf, lineOf, computerFit, headingOf, LINE_LABEL } from '../core.js'

const W = 660, H = 460, L = 74, B = 58, T = 18, R = 22
const COL = { best: '#7D1025', worst: '#1D4C9A', tangent: '#1E7B34', computer: '#B86E00' }
const decimalsForStep = (st) => Math.max(0, Math.min(8, -Math.floor(Math.log10(st) + 1e-9) + (String(st / Math.pow(10, Math.floor(Math.log10(st)))).includes('.5') ? 1 : 0)))
const fmtTick = (v, st) => (Math.abs(v) < st * 1e-6 ? '0' : v.toFixed(decimalsForStep(st)))

export default function GraphCanvas({ analysis, graph, editable = false, onChange, id }) {
  const svg = useRef(null)
  const [drag, setDrag] = useState(null)      // { kind, li, end, which, start, orig }
  const [draft, setDraft] = useState(null)    // graph being dragged (committed on release)
  const g = draft || graph
  const cols = analysis.table.columns
  const xc = cols.find(c => c.id === g.x), yc = cols.find(c => c.id === g.y)
  const pts = useMemo(() => graphPoints(analysis, g), [analysis, g.x, g.y, g.err, g.type])
  const ax = useMemo(() => axesOf(g, pts), [g.scale, g.type, pts])
  const X = (x) => L + ((x - ax.xmin) / (ax.xmax - ax.xmin)) * (W - L - R)
  const Y = (y) => T + (1 - (y - ax.ymin) / (ax.ymax - ax.ymin)) * (H - T - B)
  const fromPx = (px, py) => ({ x: ax.xmin + ((px - L) / (W - L - R)) * (ax.xmax - ax.xmin), y: ax.ymin + (1 - (py - T) / (H - T - B)) * (ax.ymax - ax.ymin) })
  const snap = (v, st) => Number((Math.round(v / (st / 50)) * (st / 50)).toPrecision(10))
  const clampX = (x) => Math.max(ax.xmin, Math.min(ax.xmax, x)), clampY = (y) => Math.max(ax.ymin, Math.min(ax.ymax, y))

  if (!xc || !yc) return <p className="lab-help">Choose a column for each axis.</p>

  const toData = (e) => {
    const m = svg.current.getScreenCTM()
    if (!m) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return fromPx(p.x, p.y)
  }
  const start = (e, d) => {
    if (!editable) return
    e.preventDefault(); e.stopPropagation()
    svg.current.setPointerCapture?.(e.pointerId)
    setDrag({ ...d, start: toData(e), orig: graph })
    setDraft(graph)
  }
  const move = (e) => {
    if (!drag) return
    const p = toData(e)
    if (!p) return
    const o = drag.orig
    if (drag.kind === 'end') {
      const lines = o.lines.map((l, i) => (i !== drag.li ? l : drag.end === 1 ? { ...l, x1: snap(clampX(p.x), ax.xstep), y1: snap(clampY(p.y), ax.ystep) } : { ...l, x2: snap(clampX(p.x), ax.xstep), y2: snap(clampY(p.y), ax.ystep) }))
      setDraft({ ...o, lines })
    } else if (drag.kind === 'line') {
      const dx = p.x - drag.start.x, dy = p.y - drag.start.y
      const lines = o.lines.map((l, i) => (i !== drag.li ? l : { ...l, x1: snap(l.x1 + dx, ax.xstep), y1: snap(l.y1 + dy, ax.ystep), x2: snap(l.x2 + dx, ax.xstep), y2: snap(l.y2 + dy, ax.ystep) }))
      setDraft({ ...o, lines })
    } else if (drag.kind === 'tri') {
      setDraft({ ...o, triangle: { ...o.triangle, [drag.which]: snap(clampX(p.x), ax.xstep) } })
    }
  }
  const end = () => { if (drag && draft) onChange?.(draft); setDrag(null); setDraft(null) }
  const nudge = (e, d) => {
    if (!editable) return
    const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]
    if (!k) return
    e.preventDefault()
    const sx = (ax.xstep / 10) * k[0] * (e.shiftKey ? 5 : 1), sy = (ax.ystep / 10) * k[1] * (e.shiftKey ? 5 : 1)
    if (d.kind === 'end') onChange({ ...graph, lines: graph.lines.map((l, i) => (i !== d.li ? l : d.end === 1 ? { ...l, x1: snap(l.x1 + sx, ax.xstep), y1: snap(l.y1 + sy, ax.ystep) } : { ...l, x2: snap(l.x2 + sx, ax.xstep), y2: snap(l.y2 + sy, ax.ystep) })) })
    if (d.kind === 'tri') onChange({ ...graph, triangle: { ...graph.triangle, [d.which]: snap(graph.triangle[d.which] + sx, ax.xstep) } })
  }

  const xLabel = (g.xLabel || '').trim() || headingOf(xc), yLabel = (g.yLabel || '').trim() || headingOf(yc)
  const minor = (lo, hi, st) => { const out = []; const s = st / 5; for (let v = Math.ceil(lo / s - 1e-9) * s; v <= hi + 1e-9; v += s) out.push(v); return out }
  const major = (lo, hi, st) => { const out = []; for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) out.push(v); return out }
  const best = lineOf(g.lines?.find(l => l.role === 'best'))
  const tri = best && g.triangle ? { xa: g.triangle.xa, xb: g.triangle.xb, ya: best.m * g.triangle.xa + best.c, yb: best.m * g.triangle.xb + best.c } : null
  const comp = g.showComputer && g.type === 'scatter' ? computerFit(pts) : null
  const clip = 'clip-' + (id || g.id)

  return (
    <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className={'lab-gc' + (editable ? ' edit' : '')} role="img"
      aria-label={`${g.title || yLabel + ' against ' + xLabel}. ${pts.length} points.`}
      onPointerMove={move} onPointerUp={end} onPointerCancel={end} style={{ touchAction: drag ? 'none' : 'pan-y' }}>
      <defs><clipPath id={clip}><rect x={L} y={T} width={W - L - R} height={H - T - B} /></clipPath></defs>
      <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="#FFFEFA" />
      {g.type !== 'bar' && minor(ax.xmin, ax.xmax, ax.xstep).map((v, i) => <line key={'mx' + i} x1={X(v)} x2={X(v)} y1={T} y2={H - B} className="gp-minor" />)}
      {minor(ax.ymin, ax.ymax, ax.ystep).map((v, i) => <line key={'my' + i} x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} className="gp-minor" />)}
      {g.type !== 'bar' && major(ax.xmin, ax.xmax, ax.xstep).map((v, i) => <g key={'Mx' + i}><line x1={X(v)} x2={X(v)} y1={T} y2={H - B} className="gp-major" /><text x={X(v)} y={H - B + 15} className="gp-tick" textAnchor="middle">{fmtTick(v, ax.xstep)}</text></g>)}
      {major(ax.ymin, ax.ymax, ax.ystep).map((v, i) => <g key={'My' + i}><line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} className="gp-major" /><text x={L - 6} y={Y(v) + 3.5} className="gp-tick" textAnchor="end">{fmtTick(v, ax.ystep)}</text></g>)}
      <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="none" stroke="#6B6B6B" />
      {ax.ymin < 0 && ax.ymax > 0 && <line x1={L} x2={W - R} y1={Y(0)} y2={Y(0)} stroke="#333" />}
      {g.type !== 'bar' && ax.xmin < 0 && ax.xmax > 0 && <line x1={X(0)} x2={X(0)} y1={T} y2={H - B} stroke="#333" />}

      <g clipPath={`url(#${clip})`}>
        {g.type === 'bar' && pts.map((p, i) => {
          const bw = (W - L - R) / pts.length
          const y0 = Y(Math.max(ax.ymin, Math.min(ax.ymax, 0)))
          return <rect key={i} x={L + i * bw + bw * 0.18} width={bw * 0.64} y={Math.min(Y(p.y), y0)} height={Math.abs(Y(p.y) - y0)} fill="#C9A5AD" stroke="#7D1025" />
        })}
        {g.type === 'line' && pts.length > 1 && <polyline points={pts.slice().sort((a, b) => a.x - b.x).map(p => X(p.x) + ',' + Y(p.y)).join(' ')} fill="none" stroke="#7D1025" strokeWidth="1.6" />}
        {pts.filter(p => p.e).map((p, i) => {
          const x = g.type === 'bar' ? L + (pts.indexOf(p) + 0.5) * ((W - L - R) / pts.length) : X(p.x)
          return <g key={'e' + i} stroke="#333" strokeWidth="1"><line x1={x} x2={x} y1={Y(p.y - p.e)} y2={Y(p.y + p.e)} /><line x1={x - 4} x2={x + 4} y1={Y(p.y - p.e)} y2={Y(p.y - p.e)} /><line x1={x - 4} x2={x + 4} y1={Y(p.y + p.e)} y2={Y(p.y + p.e)} /></g>
        })}
        {g.type !== 'bar' && pts.map((p, i) => <g key={'p' + i} stroke="#111" strokeWidth="1.5"><line x1={X(p.x) - 4.5} x2={X(p.x) + 4.5} y1={Y(p.y) - 4.5} y2={Y(p.y) + 4.5} /><line x1={X(p.x) - 4.5} x2={X(p.x) + 4.5} y1={Y(p.y) + 4.5} y2={Y(p.y) - 4.5} /></g>)}
        {comp && <line x1={X(ax.xmin)} y1={Y(comp.m * ax.xmin + comp.c)} x2={X(ax.xmax)} y2={Y(comp.m * ax.xmax + comp.c)} stroke={COL.computer} strokeWidth="1.4" strokeDasharray="7 5" />}
        {g.type === 'scatter' && (g.lines || []).map((l, i) => (
          <g key={'l' + i}>
            <line x1={X(l.x1)} y1={Y(l.y1)} x2={X(l.x2)} y2={Y(l.y2)} stroke={COL[l.role]} strokeWidth="2" strokeDasharray={l.role === 'worst' ? '9 5' : undefined} />
            {editable && <line x1={X(l.x1)} y1={Y(l.y1)} x2={X(l.x2)} y2={Y(l.y2)} stroke="transparent" strokeWidth="14" className="gp-grab" onPointerDown={e => start(e, { kind: 'line', li: i })} />}
          </g>
        ))}
        {tri && (
          <g className="gp-tri">
            <path d={`M${X(tri.xa)},${Y(tri.ya)} L${X(tri.xb)},${Y(tri.ya)} L${X(tri.xb)},${Y(tri.yb)}`} fill="none" stroke="#333" strokeWidth="1.2" strokeDasharray="4 3" />
            <text x={(X(tri.xa) + X(tri.xb)) / 2} y={Y(tri.ya) + (tri.yb > tri.ya ? 15 : -7)} textAnchor="middle" className="gp-tri-t">Δx</text>
            <text x={X(tri.xb) + 6} y={(Y(tri.ya) + Y(tri.yb)) / 2} className="gp-tri-t">Δy</text>
          </g>
        )}
      </g>

      {editable && g.type === 'scatter' && (g.lines || []).map((l, i) => [1, 2].map(k => (
        <circle key={'h' + i + k} cx={X(k === 1 ? l.x1 : l.x2)} cy={Y(k === 1 ? l.y1 : l.y2)} r="8" className="gp-handle" fill={COL[l.role]}
          tabIndex={0} role="slider" aria-label={`${LINE_LABEL[l.role]}, end ${k}. Drag, or use the arrow keys.`} aria-valuetext={`x ${k === 1 ? l.x1 : l.x2}, y ${k === 1 ? l.y1 : l.y2}`}
          onPointerDown={e => start(e, { kind: 'end', li: i, end: k })} onKeyDown={e => nudge(e, { kind: 'end', li: i, end: k })} />
      )))}
      {editable && tri && ['xa', 'xb'].map(w => (
        <rect key={w} x={X(tri[w]) - 6} y={Y(w === 'xa' ? tri.ya : tri.yb) - 6} width="12" height="12" className="gp-handle tri"
          tabIndex={0} role="slider" aria-label={`Gradient triangle, ${w === 'xa' ? 'first' : 'second'} corner. Drag along the line, or use the arrow keys.`} aria-valuetext={`x ${tri[w]}`}
          onPointerDown={e => start(e, { kind: 'tri', which: w })} onKeyDown={e => nudge(e, { kind: 'tri', which: w })} />
      ))}

      {g.type === 'bar' && pts.map((p, i) => {
        const bw = (W - L - R) / pts.length
        return <text key={'c' + i} x={L + (i + 0.5) * bw} y={H - B + 15} className="gp-tick" textAnchor="middle">{p.cat.length > 14 ? p.cat.slice(0, 13) + '…' : p.cat}</text>
      })}
      <text x={(L + W - R) / 2} y={H - 12} textAnchor="middle" className="gp-label">{xLabel}</text>
      <text transform={`translate(16 ${(T + H - B) / 2}) rotate(-90)`} textAnchor="middle" className="gp-label">{yLabel}</text>
    </svg>
  )
}
