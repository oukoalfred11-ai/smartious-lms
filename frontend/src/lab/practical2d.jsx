/**
 * practical2d.jsx — 2D bench for measurement practicals: apparatus tiles
 * with instrument displays, and for circuit practicals real terminals that
 * students wire by tapping one terminal and then another. Same actions as
 * the 3D bench.
 *
 * On the hands-on bench (view.bench === 2) only digital displays show a
 * number; scales are read from the close-ups in the controls panel. Tap the
 * stopwatch to start or stop it, the masses to add one, the goggles to put
 * them on. Lamps glow and the resistance wire reddens as it warms.
 */
import { useState } from 'react'
import { apparatusName } from '../../../shared/lab/apparatus.js'
import { terminalsOf } from './core.js'
import { terminalLabel } from './circuitControls.jsx'

function Hot({ label, onClick, disabled, children }) {
  const act = () => { if (!disabled) onClick() }
  return (
    <g role="button" tabIndex={disabled ? -1 : 0} aria-label={label} aria-disabled={disabled || undefined} className={'lab-hot' + (disabled ? ' off' : '')}
      onClick={act} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act() } }}>
      <title>{label}</title>{children}
    </g>
  )
}
const dpOf = (res) => Math.max(0, Math.ceil(-Math.log10(res) - 1e-9))
const DIGITAL = ['digital']

export default function Practical2D({ def, view, dispatch, editable }) {
  const P = def.practical
  const [pending, setPending] = useState(null)
  const [selWire, setSelWire] = useState(null)
  const items = view.collected || P.stockroom
  const readingsBy = {}
  for (const r of [...P.constants, ...P.measures]) if (r.instrument) (readingsBy[r.instrument] = readingsBy[r.instrument] || []).push(r)
  const partsBy = {}
  for (const p of P.circuit?.parts || []) (partsBy[p.apparatus] = partsBy[p.apparatus] || []).push(p)
  const cols = 4, W = 120, H = 92, gap = 14
  const rows = Math.ceil(items.length / cols)
  const pos = {}
  const tiles = items.map((id, i) => {
    const x = gap + (i % cols) * (W + gap), y = 40 + gap + Math.floor(i / cols) * (H + gap)
    const parts = view.collected ? partsBy[id] || [] : []
    const terms = parts.flatMap((p, k) => terminalsOf(p.type).map((t, j) => {
      const n = parts.length * 2, idx = k * 2 + j
      const tx = x + (W * (idx + 1)) / (n + 1), ty = y + H - 10
      pos[p.id + '.' + t] = [tx, ty]
      return { id: p.id + '.' + t, label: terminalLabel(p, t), tx, ty, colour: t === '+' ? '#C62828' : t === '-' ? '#111' : '#888' }
    }))
    return { id, x, y, rs: view.collected ? readingsBy[id] || [] : [], terms }
  })
  const tap = (tid) => {
    if (!editable) return
    setSelWire(null)
    if (!pending) setPending(tid)
    else if (pending === tid) setPending(null)
    else { dispatch('connect', { a: pending, b: tid }); setPending(null) }
  }
  const height = rows * (H + gap) + gap + 40
  const hands = view.bench === 2 ? view.hands : null
  const timerKey = hands?.timed?.[0]?.key
  /** Text on an instrument tile: digital displays show their number, scales say where to read them. */
  const tileText = (r) => {
    const v = view.readings[r.key]
    if (!hands) return v == null ? '----' : v.toFixed(dpOf(r.resolution)) + ' ' + (r.unit || '')
    const kind = hands.kinds[r.key]?.kind
    if (kind === 'stopwatch') return hands.timer.running ? 'running…' : v === undefined ? (hands.timer.acc ? 'not reset' : '0.00') : 'stopped'
    if (v === undefined) return 'tap to read'
    if (DIGITAL.includes(kind)) return v == null ? '----' : v.toFixed(dpOf(r.resolution)) + ' ' + (r.unit || '')
    return 'read close-up →'
  }
  const tileFill = (id, rs) => {
    if (hands?.glow?.[id] > 0) return `rgb(255, ${Math.round(236 - 40 * hands.glow[id])}, ${Math.round(160 - 120 * hands.glow[id])})`
    if (hands && id === 'resistance_wire' && hands.heatFrac > 0.02) return `rgb(255, ${Math.round(240 - 120 * hands.heatFrac)}, ${Math.round(225 - 170 * hands.heatFrac)})`
    return rs.length ? '#22303C' : '#FFFFFF'
  }
  const tapTile = (id, rs) => {
    // Stopping is done in the controls panel, where the oscillations are counted.
    if (hands && id === 'stopwatch' && timerKey) return hands.timer.running ? null : dispatch('startTimer')
    rs.forEach(r => dispatch('measure', { key: r.key }))
  }
  return (
    <div>
      <svg viewBox={`0 0 ${cols * (W + gap) + gap} ${height}`} className="lab-svg" role="img" aria-label={view.collected ? 'Your bench' : 'Stockroom'}>
        <text x={gap} y="24" fontSize="13" fontWeight="600">{view.collected ? (P.iv ? `${P.iv.label}: ${view.x} ${P.iv.unit || ''}` : 'Your bench') : 'Stockroom: choose your apparatus in the controls panel'}</text>
        {hands && view.collected && (
          <Hot label={hands.needsGoggles && !hands.goggles ? 'Put on safety goggles' : 'Safety goggles'} onClick={() => dispatch('wearGoggles')} disabled={!editable || !hands.needsGoggles || hands.goggles}>
            <text x={cols * (W + gap)} y="24" fontSize="12" textAnchor="end" fill={hands.needsGoggles && !hands.goggles ? '#B42318' : '#1E7B34'}>
              {hands.tidy ? 'Bench tidied away' : hands.needsGoggles ? (hands.goggles ? 'Goggles on' : 'Goggles: tap to put on') : hands.settled ? 'Readings steady' : 'Readings settling…'}</text>
          </Hot>
        )}
        {tiles.map(({ id, x, y, rs }) => {
          const body = (
            <>
              <rect x={x} y={y} width={W} height={H} rx="8" fill={tileFill(id, rs)} stroke="#B8B2A7" />
              <foreignObject x={x + 6} y={y + 4} width={W - 12} height={30}>
                <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: 10.5, lineHeight: 1.2, color: rs.length && !(hands?.glow?.[id] > 0) ? '#FFF' : '#222' }}>{apparatusName(id)}</div>
              </foreignObject>
              {rs.slice(0, 2).map((r, k) => (
                <g key={r.key}><rect x={x + 8} y={y + 34 + k * 20} width={W - 16} height="17" fill="#B9E3B0" />
                  <text x={x + W / 2} y={y + 47 + k * 20} fontSize="11" fontFamily="monospace" textAnchor="middle">{tileText(r)}</text></g>
              ))}
              {hands && id === P.iv?.instrument && id === 'slotted_masses' && <text x={x + W / 2} y={y + H - 8} fontSize="10.5" textAnchor="middle" fill="#333">{view.x} {P.iv.unit} · tap to add one</text>}
              {id === 'switch' && P.circuit && <text x={x + W / 2} y={y + 50} fontSize="12" textAnchor="middle">{view.switchClosed ? 'closed' : 'open'}</text>}
            </>
          )
          if (rs.length) return <Hot key={id} label={hands && id === 'stopwatch' && timerKey ? (hands.timer.running ? 'Stopwatch running: stop it in the controls panel when you have counted' : 'Start the stopwatch') : 'Take readings with the ' + apparatusName(id)} onClick={() => tapTile(id, rs)} disabled={!editable}>{body}</Hot>
          if (hands && id === 'slotted_masses' && P.iv?.instrument === id) return <Hot key={id} label={'Add a ' + P.iv.step + ' ' + P.iv.unit + ' mass'} onClick={() => dispatch('setIV', { value: view.x + P.iv.step })} disabled={!editable || view.x + P.iv.step > P.iv.max + 1e-9}>{body}</Hot>
          if (id === 'switch' && P.circuit) return <Hot key={id} label={view.switchClosed ? 'Open the switch' : 'Close the switch'} onClick={() => dispatch('toggleSwitch')} disabled={!editable}>{body}</Hot>
          return <g key={id}>{body}</g>
        })}
        {(view.wires || []).map(([a, b], i) => {
          if (!pos[a] || !pos[b]) return null
          const [x1, y1] = pos[a], [x2, y2] = pos[b], my = Math.max(y1, y2) + 22
          const c = view.wireColours?.[i] === 'black' ? '#1A1A1A' : '#C62828'
          return (
            <Hot key={i} label={'Lead ' + (i + 1) + ': select to remove'} onClick={() => setSelWire(i)} disabled={!editable}>
              <path d={`M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}`} fill="none" stroke="transparent" strokeWidth="12" />
              <path d={`M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}`} fill="none" stroke={c} strokeWidth={selWire === i ? 5 : 3} />
            </Hot>
          )
        })}
        {tiles.flatMap(({ terms }) => terms).map(t => (
          <Hot key={t.id} label={`Terminal ${t.label}${pending === t.id ? ' (selected)' : pending ? ': connect here' : ''}`} onClick={() => tap(t.id)} disabled={!editable}>
            <circle cx={t.tx} cy={t.ty} r="8" fill={t.colour} stroke={pending === t.id ? '#F2B705' : '#FFF'} strokeWidth={pending === t.id ? 4 : 2} />
          </Hot>
        ))}
      </svg>
      {pending && <p className="lab-help" role="status">Lead from {tiles.flatMap(x => x.terms).find(t => t.id === pending)?.label}: now tap the other terminal. <button type="button" className="lab-link" onClick={() => setPending(null)}>Cancel</button></p>}
      {selWire != null && view.wires[selWire] && (
        <p className="lab-row" role="status">Lead {selWire + 1} selected.
          <button type="button" className="lab-btn sm danger" onClick={() => { dispatch('disconnect', { index: selWire }); setSelWire(null) }} disabled={!editable}>Remove lead</button>
          <button type="button" className="lab-btn sm ghost" onClick={() => setSelWire(null)}>Close</button></p>
      )}
    </div>
  )
}
