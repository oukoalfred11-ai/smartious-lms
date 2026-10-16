/**
 * views2d.jsx — 2D diagram of each bench (fallback and low-power view).
 * Same engine view, same actions as the 3D scene. Interactive parts are
 * real buttons (keyboard and screen-reader reachable).
 */
import { useState } from 'react'
import { getExperiment } from './core.js'
import { apparatusName } from '../../../shared/lab/apparatus.js'

const rgba = (c) => (c ? `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${Math.max(0.15, c[3])})` : 'rgba(235,242,250,0.25)')

function Hot({ label, onClick, disabled, children }) {
  const act = () => { if (!disabled) onClick() }
  return (
    <g role="button" tabIndex={disabled ? -1 : 0} aria-label={label} aria-disabled={disabled || undefined} className={'lab-hot' + (disabled ? ' off' : '')}
      onClick={act} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act() } }}>
      <title>{label}</title>{children}
    </g>
  )
}

function Titration2D({ view, dispatch, editable }) {
  const b = view.burette, f = view.flask
  const top = 30, len = 260                                   // 0 cm³ at the top, 50 at the bottom
  const level = b.filled ? top + (b.reading / b.max) * len : top + len
  return (
    <svg viewBox="0 0 420 470" className="lab-svg" role="img" aria-label={`Titration bench. Flask contents: ${f.hasAcid ? f.colourName : 'empty'}.`}>
      <rect x="0" y="440" width="420" height="30" fill="#D9D2C3" />
      <rect x="292" y="20" width="8" height="420" fill="#8A8F96" /><rect x="250" y="430" width="120" height="10" fill="#6B7078" />
      <rect x="215" y="150" width="85" height="6" fill="#8A8F96" />
      {/* burette */}
      <rect x="200" y={top} width="20" height={len} fill="#F7FAFC" stroke="#8796A5" />
      {b.filled && <rect x="201" y={level} width="18" height={top + len - level} fill="#DCE9F5" />}
      {[0, 10, 20, 30, 40, 50].map(v => <g key={v}><line x1="200" x2="208" y1={top + v / 50 * len} y2={top + v / 50 * len} stroke="#55606B" /><text x="186" y={top + v / 50 * len + 4} fontSize="10" textAnchor="end" fill="#55606B">{v}</text></g>)}
      <rect x="206" y={top + len} width="8" height="26" fill="#C9D3DD" />
      <Hot label="Open the tap: add one drop (0.05 cm³)" onClick={() => dispatch('addBase', { volume: 0.05 })} disabled={!editable}>
        <rect x="196" y={top + len + 8} width="28" height="9" rx="3" fill="#3C4650" />
      </Hot>
      <rect x="208" y={top + len + 26} width="4" height="14" fill="#C9D3DD" />
      {/* flask */}
      <rect x="150" y="430" width="120" height="10" fill="#FFFFFF" stroke="#CCC" />
      <path d="M195 340 L195 372 L158 428 L262 428 L225 372 L225 340 Z" fill="rgba(255,255,255,0.4)" stroke="#8796A5" strokeWidth="2" />
      {f.hasAcid && <path d={`M${170} 410 L250 410 L262 428 L158 428 Z`} fill={rgba(f.colour)} />}
      <text x="210" y="460" fontSize="12" textAnchor="middle" fill="#222">{f.hasAcid ? 'Flask: ' + f.colourName : 'Flask: empty'}</text>
      {/* bottles */}
      {[['phenolphthalein', 'Phenol-\nphthalein', '#D63384'], ['methyl_orange', 'Methyl\norange', '#E67E22'], ['bromothymol_blue', 'Bromo-\nthymol blue', '#2F5BD2']].map(([id, name, cap], i) => (
        <Hot key={id} label={'Choose indicator: ' + name.replace('\n', '')} onClick={() => dispatch('chooseIndicator', { indicator: id })} disabled={!editable}>
          <rect x={20 + i * 52} y="385" width="38" height="52" rx="5" fill="#FBF6EA" stroke={view.indicatorChosen === id ? '#7D1025' : '#AAA'} strokeWidth={view.indicatorChosen === id ? 3 : 1} />
          <rect x={30 + i * 52} y="374" width="18" height="12" fill={cap} />
          {name.split('\n').map((l, k) => <text key={k} x={39 + i * 52} y={405 + k * 11} fontSize="8.5" textAnchor="middle">{l}</text>)}
        </Hot>
      ))}
    </svg>
  )
}

const OHM_LAYOUT = {
  PS: { x: 40, y: 40, w: 120, h: 70, title: 'Supply', t: { '+': [130, 40], '-': [70, 40] } },
  S1: { x: 50, y: 250, w: 100, h: 40, title: 'Switch', t: { a: [65, 250], b: [135, 250] } },
  A1: { x: 210, y: 40, w: 100, h: 70, title: 'Ammeter', t: { '+': [285, 40], '-': [235, 40] } },
  V1: { x: 340, y: 150, w: 100, h: 70, title: 'Voltmeter', t: { '+': [415, 150], '-': [365, 150] } },
  R1: { x: 220, y: 260, w: 120, h: 34, title: 'Resistor R', t: { a: [235, 260], b: [325, 260] } },
}
const posOf = (id) => { const [c, t] = id.split('.'); return OHM_LAYOUT[c].t[t] }

function Ohms2D({ view, dispatch, editable }) {
  const [pending, setPending] = useState(null)
  const pick = (id) => {
    if (!editable) return
    if (!pending) setPending(id)
    else if (pending === id) setPending(null)
    else { dispatch('connect', { a: pending, b: id }); setPending(null) }
  }
  const trip = view.fault === 'short_circuit'
  const screen = { PS: trip ? 'TRIP' : view.supplyV.toFixed(1) + ' V', A1: view.meters.A1 == null ? '----' : view.meters.A1.toFixed(3) + ' A', V1: view.meters.V1 == null ? '----' : view.meters.V1.toFixed(2) + ' V' }
  return (
    <svg viewBox="0 0 470 330" className="lab-svg" role="img" aria-label="Circuit bench">
      {view.wires.map(([a, b], i) => { const [x1, y1] = posOf(a), [x2, y2] = posOf(b); const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 30
        return <path key={i} d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} fill="none" stroke={a.endsWith('-') || b.endsWith('-') ? '#1A1A1A' : '#C62828'} strokeWidth="3" /> })}
      {Object.entries(OHM_LAYOUT).map(([id, c]) => (
        <g key={id}>
          {id === 'S1'
            ? <Hot label={view.switchClosed ? 'Open the switch' : 'Close the switch'} onClick={() => dispatch('toggleSwitch')} disabled={!editable}>
                <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="6" fill="#E9E4D8" stroke="#888" />
                <line x1={c.x + 15} y1={c.y + 2} x2={c.x + 85} y2={view.switchClosed ? c.y + 2 : c.y - 22} stroke="#555" strokeWidth="4" />
                <text x={c.x + c.w / 2} y={c.y + 28} fontSize="11" textAnchor="middle">{view.switchClosed ? 'Switch: closed' : 'Switch: open'}</text>
              </Hot>
            : <>
                <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="6" fill={id === 'R1' ? '#F1E5C8' : '#2B3440'} stroke="#555" />
                <text x={c.x + c.w / 2} y={c.y + (id === 'R1' ? 22 : 24)} fontSize="11" textAnchor="middle" fill={id === 'R1' ? '#222' : '#FFF'}>{c.title}</text>
                {screen[id] && <><rect x={c.x + 14} y={c.y + 32} width={c.w - 28} height="26" fill={id === 'PS' && trip ? '#F5C6C6' : '#B9E3B0'} /><text x={c.x + c.w / 2} y={c.y + 50} fontSize="14" fontFamily="monospace" textAnchor="middle">{screen[id]}</text></>}
              </>}
          {Object.entries(c.t).map(([t, [x, y]]) => {
            const tid = id + '.' + t
            return (
              <Hot key={tid} label={`Terminal ${c.title} ${t}${pending === tid ? ' (selected)' : pending ? ': connect here' : ''}`} onClick={() => pick(tid)} disabled={!editable}>
                <circle cx={x} cy={y} r="9" fill={t === '-' ? '#111' : t === '+' ? '#C62828' : '#888'} stroke={pending === tid ? '#F2B705' : '#FFF'} strokeWidth={pending === tid ? 4 : 2} />
                <text x={x} y={y - 13} fontSize="10" textAnchor="middle">{t}</text>
              </Hot>
            )
          })}
        </g>
      ))}
      {pending && <text x="235" y="322" fontSize="12" textAnchor="middle" fill="#7D1025">Now choose the other end of the lead (or the same terminal to cancel).</text>}
    </svg>
  )
}

function Osmosis2D({ view, dispatch, editable }) {
  return (
    <svg viewBox="0 0 470 300" className="lab-svg" role="img" aria-label={`Osmosis bench. ${view.immersed ? view.elapsed + ' minutes in solution' : 'Not started'}.`}>
      <rect x="0" y="270" width="470" height="30" fill="#D9D2C3" />
      {view.tubes.map((t, i) => {
        const x = 24 + i * 50, inSol = view.immersed && !t.removed
        const h = 40 * (1 + t.visual / 100), w = 12 * (1 + t.visual / 300)
        return (
          <Hot key={i} label={`Tube ${t.C.toFixed(1)} mol per dm³${view.selected === i ? ' (selected)' : ''}`} onClick={() => dispatch('select', { index: i })} disabled={!editable}>
            <rect x={x} y="80" width="30" height="150" rx="12" fill="rgba(230,240,250,0.6)" stroke={view.selected === i ? '#7D1025' : '#8796A5'} strokeWidth={view.selected === i ? 3 : 1.5} />
            <rect x={x + 2} y="130" width="26" height="98" rx="10" fill={`rgba(200,220,240,${0.3 + t.C * 0.4})`} />
            {inSol && <rect x={x + 15 - w / 2} y={200 - h} width={w} height={h} rx="3" fill="#EBD9A0" stroke="#B89B4A" />}
            <text x={x + 15} y="248" fontSize="10" textAnchor="middle">{t.C.toFixed(1)} M</text>
            {!inSol && <rect x={x + 15 - h / 2} y={258 - w} width={h} height={w} rx="3" fill="#EBD9A0" stroke="#B89B4A" opacity={view.selected === i ? 0.35 : 1} />}
          </Hot>
        )
      })}
      <rect x="330" y="190" width="120" height="70" rx="8" fill="#E6E8EC" stroke="#888" />
      <rect x="350" y="176" width="80" height="14" rx="3" fill="#C9CDD3" />
      <rect x="345" y="222" width="90" height="28" fill="#B9E3B0" />
      <text x="390" y="242" fontSize="15" fontFamily="monospace" textAnchor="middle">{view.balance == null ? '-.-- g' : view.balance.toFixed(2) + ' g'}</text>
      <text x="390" y="40" fontSize="13" textAnchor="middle">{view.immersed ? 'Timer: ' + view.elapsed + ' min' : 'Timer: not started'}</text>
    </svg>
  )
}

/** Generic bench for measurement practicals: apparatus tiles with instrument displays. */
function Practical2D({ def, view, dispatch, editable }) {
  const P = def.practical
  const items = view.collected || P.stockroom
  const readingsBy = {}
  for (const r of [...P.constants, ...P.measures]) if (r.instrument) (readingsBy[r.instrument] = readingsBy[r.instrument] || []).push(r)
  const cols = 4, W = 112, H = 78, gap = 10
  const rows = Math.ceil(items.length / cols)
  const dpOf = (res) => Math.max(0, Math.ceil(-Math.log10(res) - 1e-9))
  return (
    <svg viewBox={`0 0 ${cols * (W + gap) + gap} ${rows * (H + gap) + gap + 34}`} className="lab-svg" role="img" aria-label={view.collected ? 'Your bench' : 'Stockroom'}>
      <text x={gap} y="22" fontSize="13" fontWeight="600">{view.collected ? (P.iv ? `${P.iv.label}: ${view.x} ${P.iv.unit || ''}` : 'Your bench') : 'Stockroom: choose your apparatus in the controls panel'}</text>
      {items.map((id, i) => {
        const x = gap + (i % cols) * (W + gap), y = 34 + gap + Math.floor(i / cols) * (H + gap)
        const rs = view.collected ? readingsBy[id] || [] : []
        const body = (
          <>
            <rect x={x} y={y} width={W} height={H} rx="8" fill={rs.length ? '#22303C' : '#FFFFFF'} stroke="#B8B2A7" />
            <foreignObject x={x + 6} y={y + 4} width={W - 12} height={rs.length ? 30 : H - 8}>
              <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: 10.5, lineHeight: 1.2, color: rs.length ? '#FFF' : '#222' }}>{apparatusName(id)}</div>
            </foreignObject>
            {rs.slice(0, 2).map((r, k) => {
              const v = view.readings[r.key]
              return <g key={r.key}><rect x={x + 8} y={y + 34 + k * 20} width={W - 16} height="17" fill="#B9E3B0" />
                <text x={x + W / 2} y={y + 47 + k * 20} fontSize="11" fontFamily="monospace" textAnchor="middle">{v == null ? '----' : v.toFixed(dpOf(r.resolution)) + ' ' + (r.unit || '')}</text></g>
            })}
          </>
        )
        return rs.length
          ? <Hot key={id} label={'Take readings with the ' + apparatusName(id)} onClick={() => rs.forEach(r => dispatch('measure', { key: r.key }))} disabled={!editable}>{body}</Hot>
          : <g key={id}>{body}</g>
      })}
    </svg>
  )
}

export default function View2D({ experimentId, view, dispatch, editable }) {
  if (!view) return <div className="lab-3d-loading">Loading…</div>
  const def = getExperiment(experimentId)
  if (def?.practical) return <div className="lab-2d"><Practical2D def={def} view={view} dispatch={dispatch} editable={editable} /></div>
  const V = { 'chem-titration': Titration2D, 'phys-ohms-law': Ohms2D, 'bio-osmosis': Osmosis2D }[experimentId]
  return <div className="lab-2d">{V ? <V view={view} dispatch={dispatch} editable={editable} /> : <p>No diagram for this experiment.</p>}</div>
}
