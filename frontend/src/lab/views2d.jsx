/**
 * views2d.jsx — 2D diagram of each bench (fallback and low-power view).
 * Same engine view, same actions as the 3D scene. Interactive parts are
 * real buttons (keyboard and screen-reader reachable).
 */
import { useEffect, useRef, useState } from 'react'
import { getExperiment } from './core.js'
import Practical2D from './practical2d.jsx'
import { titrationNext, osmosisNext } from './handsOnChemControls.jsx'
import { oneClickTitration, oneClickOsmosis } from './benchMode.js'

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

/** Burette tap: click (or Enter) for one drop; press and hold to let it run (0.1 cm³ every 150 ms). */
function TapHot({ dispatch, disabled, onRun, children }) {
  const ref = useRef(null)
  const send = useRef(dispatch); send.current = dispatch
  const runCb = useRef(onRun); runCb.current = onRun
  const stop = () => {
    const r = ref.current
    if (!r) return null
    clearTimeout(r.t); clearInterval(r.i); ref.current = null
    runCb.current?.(false)
    return r
  }
  useEffect(() => () => { stop() }, [])
  const down = (e) => {
    if (disabled || (e.button != null && e.button !== 0)) return
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
    stop()
    const r = ref.current = { ticks: 0, failed: false }
    r.t = setTimeout(() => {
      if (ref.current !== r) return
      runCb.current?.(true)
      const tick = () => {
        if (ref.current !== r) return
        if (send.current('addBase', { volume: 0.1 })) r.ticks++
        else { r.failed = true; clearInterval(r.i); runCb.current?.(false) }
      }
      tick()
      if (!r.failed) r.i = setInterval(tick, 150)
    }, 250)
  }
  const up = () => { const r = stop(); if (r && !r.ticks && !r.failed) send.current('addBase', { volume: 0.05 }) }
  const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!disabled) send.current('addBase', { volume: 0.05 }) } }
  const label = 'Burette tap: click for one drop (0.05 cm³), press and hold to let it run'
  return (
    <g role="button" tabIndex={disabled ? -1 : 0} aria-label={label} aria-disabled={disabled || undefined} className={'lab-hot' + (disabled ? ' off' : '')}
      onPointerDown={down} onPointerUp={up} onPointerCancel={() => stop()} onKeyDown={key} style={{ touchAction: 'none' }}>
      <title>{label}</title>{children}
    </g>
  )
}

const INDICATOR_BOTTLES = [['phenolphthalein', 'Phenol-\nphthalein', '#F2F4F7'], ['methyl_orange', 'Methyl\norange', '#E8862A'], ['bromothymol_blue', 'Bromo-\nthymol blue', '#3A78C9']]
const INDICATOR_NAMES = { phenolphthalein: 'phenolphthalein', methyl_orange: 'methyl orange', bromothymol_blue: 'bromothymol blue' }

/** A labelled reagent bottle. */
function Bottle2D({ x, y, w = 60, h = 78, lines, cap, hazard, glass = '#F3F6F8' }) {
  return (
    <g>
      <rect x={x + w / 2 - 10} y={y - 12} width="20" height="13" rx="2" fill={cap} />
      <path d={`M${x + w / 2 - 8} ${y} L${x + 6} ${y + 12} L${x + 6} ${y + h} L${x + w - 6} ${y + h} L${x + w - 6} ${y + 12} L${x + w / 2 + 8} ${y} Z`} fill={glass} stroke="#8796A5" />
      <rect x={x + 9} y={y + 22} width={w - 18} height={hazard ? 40 : 34} fill="#FFFFFF" stroke="#C5CCD3" />
      {lines.map((l, k) => <text key={k} x={x + w / 2} y={y + 33 + k * 10} fontSize="8" fontWeight="600" textAnchor="middle" fill="#1A1A1A">{l}</text>)}
      {hazard && <><rect x={x + 11} y={y + 52} width={w - 22} height="8" fill="#E8731A" /><text x={x + w / 2} y={y + 58.5} fontSize="6" textAnchor="middle" fill="#FFF">{hazard}</text></>}
    </g>
  )
}
/** A 100 cm³ beaker with a tag. */
function Beaker2D({ x, y, label, fill = 0.6, colour = '#DCE9F5' }) {
  const h = 46
  return (
    <g>
      {fill > 0 && <rect x={x + 2} y={y + h - h * fill} width="36" height={h * fill} fill={colour} />}
      <path d={`M${x - 3} ${y} L${x} ${y + 3} L${x} ${y + h} L${x + 40} ${y + h} L${x + 40} ${y + 3} L${x + 43} ${y}`} fill="none" stroke="#8796A5" strokeWidth="1.5" />
      {label && <><rect x={x + 5} y={y + 14} width="30" height="11" fill="#FFF" stroke="#C5CCD3" /><text x={x + 20} y={y + 22.5} fontSize="7.5" textAnchor="middle">{label}</text></>}
    </g>
  )
}

function Titration2D({ view, dispatch, editable }) {
  const [running, setRunning] = useState(false)
  const b = view.burette, f = view.flask
  const off = !editable
  const acidName = view.acid?.name || 'Acid'
  const acidTag = view.acid?.id === 'CH3COOH' ? 'CH₃COOH' : view.acid?.id || 'Acid'
  const top = 30, len = 260, bx = 330                          // burette: 0 cm³ at the top, 50 at the bottom
  const level = b.filled ? top + (b.reading / b.max) * len : top + len
  const chosen = view.indicatorChosen
  return (
    <svg viewBox="0 0 680 480" className="lab-svg" role="img" aria-label={`Titration bench. Flask contents: ${f.hasAcid ? f.colourName : 'empty'}.`}>
      <rect x="0" y="440" width="680" height="40" fill="#D9D2C3" />
      {/* retort stand, boss and burette clamp */}
      <rect x="384" y="22" width="8" height="410" fill="#8A8F96" /><rect x="350" y="430" width="90" height="10" fill="#4A4F57" />
      <rect x="350" y="148" width="40" height="6" fill="#8A8F96" /><rect x="380" y="144" width="16" height="14" fill="#6B7078" />
      <rect x="324" y="144" width="6" height="14" fill="#B98A5A" /><rect x="350" y="144" width="6" height="14" fill="#B98A5A" />
      <text x="400" y="40" fontSize="9" fill="#55606B">Retort stand</text>
      {/* burette */}
      <rect x={bx} y={top} width="20" height={len} fill="#F7FAFC" stroke="#8796A5" />
      {b.filled && <rect x={bx + 1} y={level} width="18" height={top + len - level} fill="#DCE9F5" />}
      {[0, 10, 20, 30, 40, 50].map(v => <g key={v}><line x1={bx} x2={bx + 8} y1={top + v / 50 * len} y2={top + v / 50 * len} stroke="#55606B" /><text x={bx - 4} y={top + v / 50 * len + 4} fontSize="10" textAnchor="end" fill="#55606B">{v}</text></g>)}
      <text x={bx + 10} y={top - 8} fontSize="9" textAnchor="middle" fill="#55606B">Burette (50 cm³)</text>
      <rect x={bx + 6} y={top + len} width="8" height="26" fill="#C9D3DD" />
      <TapHot dispatch={dispatch} disabled={off} onRun={setRunning}>
        <rect x={bx - 10} y={top + len + 4} width="40" height="17" fill="transparent" />
        <rect x={bx - 4} y={top + len + 8} width="28" height="9" rx="3" fill={running ? '#7D1025' : '#3C4650'} transform={running ? `rotate(90 ${bx + 10} ${top + len + 12.5})` : undefined} />
      </TapHot>
      <rect x={bx + 8} y={top + len + 26} width="4" height="14" fill="#C9D3DD" />
      {running && [0, 1, 2].map(k => <circle key={k} cx={bx + 10} cy={top + len + 46 + k * 14} r="2.2" fill="#9FC3E3" />)}
      {/* flask on the white tile */}
      <rect x="280" y="430" width="120" height="10" fill="#FFFFFF" stroke="#CCC" />
      <Hot label={chosen ? 'Conical flask: add 2 drops of ' + INDICATOR_NAMES[chosen] : 'Conical flask: choose an indicator bottle first to add indicator'} onClick={() => dispatch('addIndicator')} disabled={off || !chosen}>
        <path d="M325 340 L325 372 L288 428 L392 428 L355 372 L355 340 Z" fill="rgba(255,255,255,0.4)" stroke="#8796A5" strokeWidth="2" />
        {f.hasAcid && <path d="M300 410 L380 410 L392 428 L288 428 Z" fill={rgba(f.colour)} />}
      </Hot>
      <text x="340" y="458" fontSize="12" textAnchor="middle" fill="#222">{f.hasAcid ? 'Flask: ' + f.colourName : 'Flask: empty'}</text>
      <text x="340" y="473" fontSize="9" textAnchor="middle" fill="#55606B">250 cm³ conical flask on a white tile</text>
      {/* acid side */}
      <Hot label={'Pipette 25.0 cm³ of ' + acidName.toLowerCase() + ' into the flask'} onClick={() => dispatch('pipetteAcid')} disabled={off || f.hasAcid}>
        <Bottle2D x={150} y={352} lines={[acidName + ',', '? M']} cap="#8B1A2E" />
      </Hot>
      <Beaker2D x={222} y={384} label={acidTag} />
      <Hot label={'Pipette with filler: transfer 25.0 cm³ of ' + acidName.toLowerCase() + ' to the flask'} onClick={() => dispatch('pipetteAcid')} disabled={off || f.hasAcid}>
        <rect x="14" y="444" width="250" height="16" fill="transparent" />
        <line x1="20" y1="452" x2="210" y2="452" stroke="#8796A5" strokeWidth="3" />
        <ellipse cx="110" cy="452" rx="26" ry="6" fill="#F7FAFC" stroke="#8796A5" />
        <line x1="172" y1="448" x2="172" y2="456" stroke="#222" />
        <rect x="210" y="446" width="46" height="12" rx="3" fill="#2E7D32" />
        <text x="138" y="470" fontSize="9" textAnchor="middle" fill="#333">25.0 cm³ pipette and filler</text>
      </Hot>
      {INDICATOR_BOTTLES.map(([id, name, liquid], i) => (
        <Hot key={id} label={'Choose indicator: ' + INDICATOR_NAMES[id]} onClick={() => dispatch('chooseIndicator', { indicator: id })} disabled={off}>
          <rect x={14 + i * 44} y="388" width="36" height="50" rx="5" fill="#B88A5A" stroke={chosen === id ? '#F0B429' : '#7A4A1E'} strokeWidth={chosen === id ? 3 : 1} />
          <rect x={20 + i * 44} y="420" width="24" height="15" fill={liquid} opacity="0.85" />
          <rect x={24 + i * 44} y="374" width="16" height="14" fill="#1F2227" /><ellipse cx={32 + i * 44} cy="370" rx="6" ry="7" fill="#7A1F2B" />
          <rect x={17 + i * 44} y="394" width="30" height="24" fill="#FBF6EA" />
          {name.split('\n').map((l, k) => <text key={k} x={32 + i * 44} y={404 + k * 9} fontSize="7" textAnchor="middle">{l}</text>)}
        </Hot>
      ))}
      <text x="80" y="364" fontSize="9" textAnchor="middle" fill="#55606B">Indicators</text>
      {/* sodium hydroxide side */}
      <Beaker2D x={448} y={384} label="NaOH" />
      <Hot label="Sodium hydroxide 0.100 M: fill the burette" onClick={() => dispatch('fillBurette')} disabled={off}>
        <Bottle2D x={500} y={352} lines={['Sodium', 'hydroxide', '0.100 M']} cap="#1F5FAF" hazard="IRRITANT" />
      </Hot>
      <Beaker2D x={574} y={392} label="Rinsings" fill={0.08} />
      <Hot label="Filter funnel: fill the burette with sodium hydroxide" onClick={() => dispatch('fillBurette')} disabled={off}>
        <path d="M570 370 L620 370 L599 392 L599 412 L591 412 L591 392 Z" fill="rgba(240,246,250,0.8)" stroke="#8796A5" strokeWidth="1.5" />
        <text x="595" y="364" fontSize="9" textAnchor="middle" fill="#55606B">Funnel</text>
      </Hot>
      <g aria-label="Wash bottle of distilled water">
        <path d="M630 396 L630 438 L668 438 L668 396 Q668 388 660 386 L638 386 Q630 388 630 396 Z" fill="#EEF3F6" stroke="#8796A5" />
        <path d="M649 386 L649 372 Q649 364 640 366 L628 372" fill="none" stroke="#9AA3AD" strokeWidth="2" />
        <text x="649" y="410" fontSize="7" textAnchor="middle" fill="#1F5FAF">Distilled</text><text x="649" y="419" fontSize="7" textAnchor="middle" fill="#1F5FAF">water</text>
      </g>
      <g aria-label="Safety goggles">
        <rect x="470" y="446" width="56" height="16" rx="8" fill="rgba(207,230,242,0.7)" stroke="#2F6E4F" strokeWidth="2" />
        <text x="498" y="474" fontSize="9" textAnchor="middle" fill="#333">Safety goggles</text>
      </g>
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
                <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="6" fill={id === 'R1' ? (view.hands?.heatFrac > 0.02 ? `rgb(245, ${Math.round(229 - 110 * view.hands.heatFrac)}, ${Math.round(200 - 150 * view.hands.heatFrac)})` : '#F1E5C8') : '#2B3440'} stroke="#555" />
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

// ── Step-by-step benches ─────────────────────────────────────
// Clicking a piece of apparatus opens a small menu of what can be done with
// it (as a student would choose at a real bench), including the mistakes.

/** A pop-up menu of actions drawn in the SVG. items: { label, run, disabled } */
function Menu2D({ menu, close, W, H }) {
  if (!menu) return null
  const w = 210, rowH = 22, h = menu.items.length * rowH + 26
  const x = Math.max(4, Math.min(W - w - 4, menu.x)), y = Math.max(4, Math.min(H - h - 4, menu.y))
  return (
    <g role="menu" aria-label={menu.title}>
      <rect x={x} y={y} width={w} height={h} rx="7" fill="#FFFFFF" stroke="#7D1025" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' }} />
      <text x={x + 10} y={y + 16} fontSize="10.5" fontWeight="700" fill="#7D1025">{menu.title}</text>
      <Hot label="Close menu" onClick={close}><rect x={x + w - 22} y={y + 4} width="18" height="16" fill="transparent" /><text x={x + w - 13} y={y + 16} fontSize="12" textAnchor="middle" fill="#55606B">×</text></Hot>
      {menu.items.map((it, k) => (
        <Hot key={it.label} label={it.label} disabled={it.disabled} onClick={() => { it.run(); close() }}>
          <rect x={x + 4} y={y + 22 + k * rowH} width={w - 8} height={rowH - 2} rx="4" fill={it.disabled ? '#F4F5F7' : '#F7EEF0'} />
          <text x={x + 12} y={y + 37 + k * rowH} fontSize="10.5" fill={it.disabled ? '#9AA3AD' : '#1A1A1A'}>{it.label}</text>
        </Hot>
      ))}
    </g>
  )
}

function HandsTitration2D({ view, dispatch, editable }) {
  const [running, setRunning] = useState(false)
  const [menu, setMenu] = useState(null)
  const b = view.burette, f = view.flask, p = view.pipette
  const off = !editable
  const run = view.runs[view.run - 1] || {}
  const mid = run.initial != null && run.final == null
  const acidName = view.acid?.name || 'Acid'
  const acidTag = view.acid?.id === 'CH3COOH' ? 'CH₃COOH' : view.acid?.id || 'Acid'
  const top = 40, len = 250, bx = 330
  const level = b.filled ? top + (Math.max(-1.6, b.reading) / b.max) * len : top + len
  const chosen = view.indicatorChosen
  const act = (type, payload) => () => dispatch(type, payload)
  const open = (title, x, y, items) => (off ? null : setMenu({ title, x, y, items }))
  const eyeY = { above: level - 22, level, below: level + 22 }[view.eye] ?? level
  return (
    <svg viewBox="0 0 680 480" className="lab-svg" role="img" aria-label={`Titration bench, step by step. Flask: ${f.hasAcid ? f.colourName : 'empty'}.`}>
      <rect x="0" y="440" width="680" height="40" fill="#D9D2C3" />
      <text x="10" y="18" fontSize="11" fill="#7D1025" fontWeight="600">{titrationNext(view)}</text>
      {/* retort stand and clamp */}
      <rect x="384" y="32" width="8" height="400" fill="#8A8F96" /><rect x="350" y="430" width="90" height="10" fill="#4A4F57" />
      <rect x="350" y="158" width="40" height="6" fill="#8A8F96" /><rect x="380" y="154" width="16" height="14" fill="#6B7078" />
      {/* burette, liquid, jet and tap */}
      <Hot label="Burette: read it close-up in the controls panel" onClick={() => open('Burette', bx + 30, level - 10, [
        { label: 'Rinse with distilled water', run: act('rinseBurette', { with: 'water' }), disabled: b.filled },
        { label: 'Rinse with sodium hydroxide', run: act('rinseBurette', { with: 'naoh' }), disabled: b.filled },
      ])}>
        <rect x={bx} y={top} width="20" height={len} fill="#F7FAFC" stroke="#8796A5" />
      </Hot>
      {b.filled && <rect x={bx + 1} y={Math.max(top - 8, level)} width="18" height={top + len - Math.max(top - 8, level)} fill="#DCE9F5" pointerEvents="none" />}
      {[0, 10, 20, 30, 40, 50].map(v => <g key={v} pointerEvents="none"><line x1={bx} x2={bx + 8} y1={top + v / 50 * len} y2={top + v / 50 * len} stroke="#55606B" /><text x={bx - 4} y={top + v / 50 * len + 4} fontSize="10" textAnchor="end" fill="#55606B">{v}</text></g>)}
      <rect x={bx + 6} y={top + len} width="8" height="26" fill={b.filled ? '#DCE9F5' : '#C9D3DD'} stroke="#8796A5" strokeWidth="0.6" />
      <TapHot dispatch={dispatch} disabled={off} onRun={setRunning}>
        <rect x={bx - 10} y={top + len + 4} width="40" height="17" fill="transparent" />
        <rect x={bx - 4} y={top + len + 8} width="28" height="9" rx="3" fill={running ? '#7D1025' : '#3C4650'} transform={running ? `rotate(90 ${bx + 10} ${top + len + 12.5})` : undefined} />
      </TapHot>
      <rect x={bx + 8} y={top + len + 26} width="4" height="16" fill={b.filled && !b.bubble ? '#DCE9F5' : '#E8EDF2'} stroke="#8796A5" strokeWidth="0.5" />
      {b.bubble && <ellipse cx={bx + 10} cy={top + len + 33} rx="1.6" ry="4" fill="#FFFFFF" stroke="#8796A5" strokeWidth="0.6" />}
      {running && [0, 1, 2].map(k => <circle key={k} cx={bx + 10} cy={top + len + 50 + k * 14} r="2.2" fill="#9FC3E3" />)}
      {/* eye position, beside the meniscus */}
      {b.filled && <g>
        {['above', 'level', 'below'].map(k => (
          <Hot key={k} label={'Move your eye ' + (k === 'level' ? 'level with' : k) + ' the meniscus'} onClick={act('eyeLevel', { pos: k })} disabled={off}>
            <circle cx={bx + 72} cy={{ above: level - 22, level, below: level + 22 }[k]} r="7" fill={view.eye === k ? '#7D1025' : '#FFFFFF'} stroke="#7D1025" />
          </Hot>
        ))}
        <path d={`M${bx + 62} ${eyeY} Q${bx + 52} ${eyeY - 7} ${bx + 42} ${eyeY} Q${bx + 52} ${eyeY + 7} ${bx + 62} ${eyeY} Z`} fill="#FFF" stroke="#222" pointerEvents="none" />
        <circle cx={bx + 50} cy={eyeY} r="2.5" fill="#222" pointerEvents="none" />
        <line x1={bx + 42} y1={eyeY} x2={bx + 20} y2={level} stroke="#7D1025" strokeDasharray="3 2" pointerEvents="none" />
        <text x={bx + 84} y={level + 4} fontSize="9" fill="#55606B">your eye</text>
      </g>}
      {/* funnel: in the burette or resting in the waste beaker */}
      <Hot label={b.funnel ? 'Funnel: take it out of the burette' : 'Funnel: put it in the top of the burette'} onClick={act('burFunnel', { place: !b.funnel })} disabled={off}>
        {b.funnel
          ? <path d={`M${bx - 15} ${top - 26} L${bx + 35} ${top - 26} L${bx + 14} ${top - 6} L${bx + 14} ${top + 12} L${bx + 6} ${top + 12} L${bx + 6} ${top - 6} Z`} fill="rgba(240,246,250,0.85)" stroke="#8796A5" strokeWidth="1.5" />
          : <path d="M570 370 L620 370 L599 392 L599 412 L591 412 L591 392 Z" fill="rgba(240,246,250,0.8)" stroke="#8796A5" strokeWidth="1.5" />}
      </Hot>
      {/* flask on the white tile */}
      <rect x="280" y="430" width="120" height="10" fill="#FFFFFF" stroke="#CCC" />
      <Hot label="Conical flask: swirl it, add indicator or rinse it" onClick={() => open('Conical flask', 400, 330, [
        { label: 'Swirl the flask', run: act('swirl'), disabled: !f.hasAcid },
        { label: chosen ? 'Add 2 drops of ' + INDICATOR_NAMES[chosen] : 'Add indicator (choose a bottle first)', run: act('addIndicator'), disabled: !chosen || !f.hasAcid },
        { label: 'Rinse with distilled water', run: act('rinseFlask', { with: 'water' }) },
        { label: 'Rinse with the acid', run: act('rinseFlask', { with: 'acid' }), disabled: f.hasAcid },
      ])}>
        <path d="M325 340 L325 372 L288 428 L392 428 L355 372 L355 340 Z" fill={f.clean || f.hasAcid ? 'rgba(255,255,255,0.4)' : 'rgba(225,215,190,0.5)'} stroke="#8796A5" strokeWidth="2" />
        {f.hasAcid && <path d="M300 410 L380 410 L392 428 L288 428 Z" fill={rgba(f.colour)} />}
        {f.flash && <ellipse cx="340" cy="411" rx="13" ry="3.5" fill={rgba(f.flashColour)} />}
      </Hot>
      <text x="340" y="458" fontSize="12" textAnchor="middle" fill="#222">{f.hasAcid ? 'Flask: ' + f.colourName + (f.flash ? ' (flash of ' + f.flashName + ')' : '') : f.clean ? 'Flask: clean, empty' : 'Flask: needs washing out'}</text>
      {/* acid */}
      <Hot label={'Bottle of ' + acidName.toLowerCase() + ': pipette or rinse'} onClick={() => open(acidName, 150, 250, [
        { label: 'Rinse the pipette with the acid', run: act('rinsePipette', { with: 'acid' }), disabled: p.full },
        { label: 'Draw the acid above the mark', run: act('fillPipette'), disabled: p.full },
        { label: 'Rinse the flask with the acid', run: act('rinseFlask', { with: 'acid' }), disabled: f.hasAcid },
      ])}>
        <Bottle2D x={150} y={352} lines={[acidName + ',', '? M']} cap="#8B1A2E" />
      </Hot>
      <Beaker2D x={222} y={384} label={acidTag} />
      <Hot label="25.0 cm³ pipette: attach the filler, adjust to the mark or deliver" onClick={() => open('25.0 cm³ pipette', 20, 330, [
        { label: 'Attach the pipette filler', run: act('attachFiller'), disabled: p.filler },
        { label: 'Rinse with distilled water', run: act('rinsePipette', { with: 'water' }), disabled: p.full },
        { label: 'Let down to the mark', run: act('adjustPipette'), disabled: !p.aboveMark },
        { label: 'Deliver into the flask', run: act('deliverPipette'), disabled: !p.full },
      ])}>
        <rect x="14" y="444" width="250" height="16" fill="transparent" />
        <line x1="20" y1="452" x2="210" y2="452" stroke={p.full ? '#BFD6EA' : '#8796A5'} strokeWidth="3" />
        <ellipse cx="110" cy="452" rx="26" ry="6" fill={p.full ? '#E1ECF6' : '#F7FAFC'} stroke="#8796A5" />
        <line x1="172" y1="448" x2="172" y2="456" stroke="#222" />
        {p.aboveMark && <line x1="172" y1="452" x2="186" y2="452" stroke="#BFD6EA" strokeWidth="3" />}
        {p.filler && <rect x="210" y="446" width="46" height="12" rx="3" fill="#2E7D32" />}
        <text x="138" y="472" fontSize="9" textAnchor="middle" fill="#333">{'Pipette' + (p.filler ? ' + filler' : '') + (p.full ? (p.atMark ? ': on the mark' : ': above the mark') : '')}</text>
      </Hot>
      {INDICATOR_BOTTLES.map(([id, name, liquid], i) => (
        <Hot key={id} label={'Choose indicator: ' + INDICATOR_NAMES[id]} onClick={act('chooseIndicator', { indicator: id })} disabled={off}>
          <rect x={14 + i * 44} y="388" width="36" height="50" rx="5" fill="#B88A5A" stroke={chosen === id ? '#F0B429' : '#7A4A1E'} strokeWidth={chosen === id ? 3 : 1} />
          <rect x={20 + i * 44} y="420" width="24" height="15" fill={liquid} opacity="0.85" />
          <rect x={24 + i * 44} y="374" width="16" height="14" fill="#1F2227" /><ellipse cx={32 + i * 44} cy="370" rx="6" ry="7" fill="#7A1F2B" />
          <rect x={17 + i * 44} y="394" width="30" height="24" fill="#FBF6EA" />
          {name.split('\n').map((l, k) => <text key={k} x={32 + i * 44} y={404 + k * 9} fontSize="7" textAnchor="middle">{l}</text>)}
        </Hot>
      ))}
      {/* sodium hydroxide */}
      <Beaker2D x={448} y={384} label="NaOH" />
      <Hot label="Sodium hydroxide 0.100 M: rinse or fill the burette" onClick={() => open('Sodium hydroxide', 430, 240, [
        { label: 'Rinse the burette with it', run: act('rinseBurette', { with: 'naoh' }), disabled: b.filled },
        { label: 'Pour into the burette (funnel)', run: act('pourIntoBurette'), disabled: mid },
      ])}>
        <Bottle2D x={500} y={352} lines={['Sodium', 'hydroxide', '0.100 M']} cap="#1F5FAF" hazard="CORROSIVE" />
      </Hot>
      <Hot label="Waste beaker: run some solution out of the burette into it" onClick={() => open('Run into the waste beaker', 470, 300, [0.5, 1, 2].map(v => ({ label: 'Run ' + v + ' cm³ out of the burette', run: act('runToWaste', { volume: v }), disabled: !b.filled || mid })))}>
        <Beaker2D x={574} y={392} label="Waste" fill={0.12} />
      </Hot>
      <Hot label="Wash bottle of distilled water" onClick={() => open('Distilled water', 460, 300, [
        { label: 'Rinse the burette', run: act('rinseBurette', { with: 'water' }), disabled: b.filled },
        { label: 'Rinse the flask', run: act('rinseFlask', { with: 'water' }) },
        { label: 'Rinse the pipette', run: act('rinsePipette', { with: 'water' }), disabled: p.full },
      ])}>
        <path d="M630 396 L630 438 L668 438 L668 396 Q668 388 660 386 L638 386 Q630 388 630 396 Z" fill="#EEF3F6" stroke="#8796A5" />
        <path d="M649 386 L649 372 Q649 364 640 366 L628 372" fill="none" stroke="#9AA3AD" strokeWidth="2" />
        <text x="649" y="410" fontSize="7" textAnchor="middle" fill="#1F5FAF">Distilled</text><text x="649" y="419" fontSize="7" textAnchor="middle" fill="#1F5FAF">water</text>
      </Hot>
      {/* safety: goggles on the bench, lab coat on a hook */}
      <Hot label={view.ppe.goggles ? 'Safety goggles: you are wearing them' : 'Safety goggles: put them on'} onClick={act('wearPPE', { item: 'goggles' })} disabled={off || view.ppe.goggles}>
        <rect x="470" y="446" width="56" height="16" rx="8" fill="rgba(207,230,242,0.7)" stroke="#2F6E4F" strokeWidth="2" opacity={view.ppe.goggles ? 0.35 : 1} />
        <text x="498" y="474" fontSize="9" textAnchor="middle" fill="#333">{view.ppe.goggles ? 'Goggles: worn ✓' : 'Safety goggles'}</text>
      </Hot>
      <Hot label={view.ppe.coat ? 'Lab coat: you are wearing it' : 'Lab coat: put it on'} onClick={act('wearPPE', { item: 'coat' })} disabled={off || view.ppe.coat}>
        <circle cx="620" cy="44" r="4" fill="#6B7078" />
        <path d="M620 48 L596 62 L590 150 L650 150 L644 62 Z" fill="#FFFFFF" stroke="#9AA3AD" opacity={view.ppe.coat ? 0.3 : 1} />
        <text x="620" y="166" fontSize="9" textAnchor="middle" fill="#333">{view.ppe.coat ? 'Lab coat: worn ✓' : 'Lab coat'}</text>
      </Hot>
      <Menu2D menu={menu} close={() => setMenu(null)} W={680} H={480} />
    </svg>
  )
}

function HandsOsmosis2D({ view, dispatch, editable }) {
  const [menu, setMenu] = useState(null)
  const off = !editable
  const act = (type, payload) => () => dispatch(type, payload)
  const open = (title, x, y, items) => (off ? null : setMenu({ title, x, y, items }))
  const sel = view.selected
  const [hh, mm] = view.clockTime.split(':').map(Number)
  const ang = (deg) => (deg - 90) * Math.PI / 180
  const cylinderMenu = (k, x, y) => open('Cylinder for ' + view.tubes[k].C.toFixed(1) + ' M', x, y, [
    ...[30, 35, 40, 45].map(L => ({ label: 'Trim to ' + L + ' mm with the scalpel', run: act('trimCylinder', { index: k, length: L }), disabled: view.tubes[k].m0 != null })),
    { label: 'Blot dry on the paper towel', run: act('blot', { index: k }), disabled: view.cylinders[k].inSolution },
    { label: 'Put it on the balance pan', run: act('putOnPan', { index: k }), disabled: view.cylinders[k].inSolution },
  ])
  return (
    <svg viewBox="0 0 560 340" className="lab-svg" role="img" aria-label={`Osmosis bench, step by step. Lab clock ${view.clockTime}.`}>
      <rect x="0" y="300" width="560" height="40" fill="#D9D2C3" />
      <text x="10" y="18" fontSize="11" fill="#7D1025" fontWeight="600">{osmosisNext(view)}</text>
      {/* lab clock on the wall */}
      <Hot label={'Lab clock ' + view.clockTime + (view.immersed ? ': fast-forward time' : ': start the timer')} onClick={() => open('Lab clock and timer', 330, 30, view.immersed
        ? [10, 30, 60, 120].map(m => ({ label: 'Fast-forward ' + m + ' minutes', run: act('wait', { minutes: m }) }))
        : [{ label: 'Start the timer', run: act('startTimer') }])}>
        <circle cx="510" cy="56" r="30" fill="#FFFFFF" stroke="#2B3440" strokeWidth="3" />
        {[...Array(12)].map((_, k) => <line key={k} x1={510 + 25 * Math.cos(ang(k * 30))} y1={56 + 25 * Math.sin(ang(k * 30))} x2={510 + 28 * Math.cos(ang(k * 30))} y2={56 + 28 * Math.sin(ang(k * 30))} stroke="#2B3440" />)}
        <line x1="510" y1="56" x2={510 + 15 * Math.cos(ang((hh % 12) * 30 + mm / 2))} y2={56 + 15 * Math.sin(ang((hh % 12) * 30 + mm / 2))} stroke="#1A1A1A" strokeWidth="3" />
        <line x1="510" y1="56" x2={510 + 23 * Math.cos(ang(mm * 6))} y2={56 + 23 * Math.sin(ang(mm * 6))} stroke="#1A1A1A" strokeWidth="1.8" />
        <text x="510" y="102" fontSize="10" textAnchor="middle">{view.immersed ? 'In solution ' + view.elapsed + ' min' : 'Timer not started'}</text>
      </Hot>
      {/* rack of labelled boiling tubes */}
      <rect x="150" y="150" width="310" height="10" fill="#FFFFFF" stroke="#BBB" />
      {view.tubes.map((t, k) => {
        const x = 165 + k * 50
        const owner = view.cylinders.findIndex(c => c.tube === k)
        const inTube = owner >= 0 && view.cylinders[owner].inSolution
        const v = owner >= 0 ? view.tubes[owner].visual : 0
        const h = 32 * Math.cbrt(1 + v / 100) * ((view.cylinders[owner]?.length || 40) / 40), w = 10 * Math.cbrt(1 + v / 100)
        const label = view.immersed
          ? (inTube ? 'Tube ' + t.C.toFixed(1) + ' M: take the cylinder out' : 'Tube ' + t.C.toFixed(1) + ' M')
          : 'Tube ' + t.C.toFixed(1) + ' M: place the selected cylinder in it'
        return (
          <Hot key={k} label={label} disabled={off || (view.immersed ? !inTube : owner >= 0)}
            onClick={view.immersed ? act('remove', { index: owner }) : act('placeInTube', { index: sel, tube: k })}>
            <rect x={x} y="70" width="28" height="160" rx="12" fill="rgba(230,240,250,0.6)" stroke="#8796A5" strokeWidth="1.5" />
            <rect x={x + 2} y="120" width="24" height="108" rx="10" fill={`rgba(200,220,240,${0.3 + t.C * 0.4})`} />
            {inTube && <rect x={x + 14 - w / 2} y={215 - h} width={w} height={h} rx="3" fill="#EBD9A0" stroke="#B89B4A" />}
            <rect x={x - 2} y="236" width="32" height="14" fill="#FFFFFF" stroke="#C5CCD3" />
            <text x={x + 14} y="246" fontSize="9" textAnchor="middle">{t.C.toFixed(1)} M</text>
          </Hot>
        )
      })}
      {/* white tile, cork borer and the cylinders against a ruler */}
      <rect x="10" y="40" width="130" height="250" fill="#FFFFFF" stroke="#CCC" />
      {!view.cut && <Hot label="Potato and cork borer: cut six cylinders" onClick={act('cutCylinders')} disabled={off}>
        <ellipse cx="60" cy="120" rx="38" ry="26" fill="#C9A26A" stroke="#8C6B3A" />
        <rect x="100" y="70" width="10" height="70" fill="#B7BDC4" stroke="#6B7078" />
        <text x="75" y="170" fontSize="10" textAnchor="middle">Cut cylinders with the cork borer</text>
      </Hot>}
      {view.cut && <g>
        <rect x="16" y="46" width="12" height="236" fill="#F2E6C8" stroke="#B9A57A" />
        {[...Array(13)].map((_, k) => <line key={k} x1="16" x2={k % 2 ? 22 : 26} y1={52 + k * 18} y2={52 + k * 18} stroke="#333" strokeWidth="0.6" />)}
        {view.cylinders.map((c, k) => {
          if (c.inSolution || c.onPan) return null
          const y = 50 + k * 38, w = (c.length || 40) * 1.8
          return (
            <Hot key={k} label={`Cylinder for ${view.tubes[k].C.toFixed(1)} M${k === sel ? ' (selected)' : ''}: trim, blot or weigh`} onClick={() => { dispatch('select', { index: k }); cylinderMenu(k, 150, y) }} disabled={off}>
              <rect x="34" y={y} width={w} height="14" rx="5" fill="#EBD9A0" stroke={k === sel ? '#7D1025' : '#B89B4A'} strokeWidth={k === sel ? 2.5 : 1} />
              {c.wet && <><circle cx={40} cy={y + 4} r="1.6" fill="#8FB9DE" /><circle cx={34 + w - 6} cy={y + 9} r="1.6" fill="#8FB9DE" /></>}
              <text x="34" y={y + 26} fontSize="8" fill="#55606B">{view.tubes[k].C.toFixed(1)} M{c.wet ? ' · wet' : ''}</text>
            </Hot>
          )
        })}
      </g>}
      <rect x="150" y="270" width="150" height="24" fill="#FAFAF5" stroke="#DDD" />
      <text x="225" y="286" fontSize="9" textAnchor="middle" fill="#55606B">Paper towel</text>
      {/* balance with weighing boat */}
      <Hot label="Balance: tare it, or put the selected cylinder on the pan" onClick={() => open('Balance', 300, 170, [
        { label: 'Tare (zero) with the boat on', run: act('tareBalance'), disabled: view.onPan != null },
        { label: 'Put the selected cylinder on the pan', run: act('putOnPan', { index: sel }), disabled: !view.cut || view.cylinders[sel].inSolution },
        { label: 'Take the cylinder off the pan', run: act('clearPan'), disabled: view.onPan == null },
      ])}>
        <rect x="400" y="250" width="140" height="50" rx="8" fill="#E6E8EC" stroke="#888" />
        <rect x="425" y="236" width="90" height="14" rx="3" fill="#C9CDD3" />
        <path d="M440 236 L500 236 L494 228 L446 228 Z" fill="#F2F4F7" stroke="#9AA3AD" />
        {view.onPan != null && <rect x={470 - (view.cylinders[view.onPan].length || 40) * 0.6} y="220" width={(view.cylinders[view.onPan].length || 40) * 1.2} height="9" rx="3" fill="#EBD9A0" stroke="#B89B4A" />}
        <rect x="420" y="264" width="100" height="26" fill="#B9E3B0" />
        <text x="470" y="283" fontSize="15" fontFamily="monospace" textAnchor="middle">{view.balance == null ? '-.-- g' : view.balance.toFixed(2) + ' g'}</text>
      </Hot>
      <Menu2D menu={menu} close={() => setMenu(null)} W={560} H={340} />
    </svg>
  )
}

export default function View2D({ experimentId, view, dispatch, editable }) {
  if (!view) return <div className="lab-3d-loading">Loading…</div>
  const def = getExperiment(experimentId)
  if (def?.practical) return <div className="lab-2d"><Practical2D def={def} view={view} dispatch={dispatch} editable={editable} /></div>
  if (experimentId === 'chem-titration' && !oneClickTitration(view)) return <div className="lab-2d"><HandsTitration2D view={view} dispatch={dispatch} editable={editable} /></div>
  if (experimentId === 'bio-osmosis' && !oneClickOsmosis(view)) return <div className="lab-2d"><HandsOsmosis2D view={view} dispatch={dispatch} editable={editable} /></div>
  const V = { 'chem-titration': Titration2D, 'phys-ohms-law': Ohms2D, 'bio-osmosis': Osmosis2D }[experimentId]
  return <div className="lab-2d">{V ? <V view={view} dispatch={dispatch} editable={editable} /> : <p>No diagram for this experiment.</p>}</div>
}
