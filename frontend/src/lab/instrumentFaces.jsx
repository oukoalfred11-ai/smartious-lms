/**
 * instrumentFaces.jsx — close-ups of the instruments on the hands-on bench
 * (view.bench === 2). The student reads the value from the drawing; no
 * number is printed except on displays that really are digital.
 *
 * Every drawing uses the engine's numbers (view.readings and
 * view.hands.look / kinds): the pointer position, the scale and any
 * flicker are decided by the shared engine, so what is drawn is exactly
 * what the grader treats as "shown". Eye position (parallax) uses the
 * same shared function as the engine.
 */
import { useEffect, useRef, useState } from 'react'
import { parallaxShift, vernierParts, micrometerParts } from '../../../shared/lab/science/instruments.js'

const dpOf = (res) => Math.max(0, Math.ceil(-Math.log10(res) - 1e-9))
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const INK = '#1A1A1A'

/** Format a time as a stopwatch shows it: SS.cc, or M:SS.cc from a minute. */
export function stopwatchText(t, res = 0.01) {
  if (t == null || !Number.isFinite(t)) return '0.00'
  const d = res >= 1 ? 0 : 2
  if (t < 60) return t.toFixed(d)
  const m = Math.floor(t / 60), s = t - m * 60
  return m + ':' + (s < 10 ? '0' : '') + s.toFixed(d)
}

// ── Digital display ────────────────────────────────────────
/** LCD whose last digit flickers between value and alt (both are what it shows). */
export function LCD({ value, alt = null, res, unit = '', width = 220, label }) {
  const [flip, setFlip] = useState(false)
  useEffect(() => {
    if (alt == null) { setFlip(false); return undefined }
    const t = setInterval(() => setFlip(f => !f), 520)
    return () => clearInterval(t)
  }, [alt])
  const v = flip && alt != null ? alt : value
  const text = v == null ? '- - - -' : v.toFixed(dpOf(res))
  return (
    <svg viewBox={`0 0 ${width} 70`} className="lab-closeup-svg" role="img" aria-label={label || 'Digital display'}>
      <rect x="2" y="2" width={width - 4} height="66" rx="8" fill="#2B2F36" />
      <rect x="12" y="10" width={width - 24} height="50" rx="4" fill="#B9D6A8" />
      <text x={width - 22 - (unit ? 34 : 0)} y="47" fontSize="32" fontFamily='"DejaVu Sans Mono", "Courier New", monospace' textAnchor="end" fill="#13240F">{text}</text>
      {unit && <text x={width - 20} y="47" fontSize="15" textAnchor="end" fill="#13240F">{unit}</text>}
    </svg>
  )
}

// ── Analogue meter ─────────────────────────────────────────
function majorEvery(n) {
  for (const m of [10, 5, 20, 25, 4, 2, 50]) if (n % m === 0 && n / m <= 10) return m
  return Math.max(1, Math.round(n / 10))
}
/**
 * Moving-coil meter: scale, mirror strip and needle. pos is the true needle
 * position. A fine scale (many divisions) is shown magnified around the
 * needle, as a student would lean in to read it.
 */
export function Dial({ pos, fullScale, division, unit, eye = 0, settled = true, label }) {
  const N = Math.round(fullScale / division), M = majorEvery(N)
  const R = Math.max(140, (10 * N) / 1.745)              // at least 10 units between divisions
  const ang = (v) => (-50 + 100 * clamp01(v / fullScale)) * Math.PI / 180
  const pt = (v, r) => [r * Math.sin(ang(v)), -r * Math.cos(ang(v))]
  const shift = parallaxShift(eye, division)
  const needle = pos == null ? 0 : pos + shift
  const image = pos == null ? 0 : pos - shift                   // the needle's reflection in the mirror
  const [nx, ny] = pt(needle, R * 0.97)
  const [ix1, iy1] = pt(image, R * 0.8), [ix2, iy2] = pt(image, R * 0.87)
  const dec = Math.max(0, dpOf(division * M))
  const arc = (r) => { const [x1, y1] = pt(0, r), [x2, y2] = pt(fullScale, r); return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}` }
  const crop = R > 160
  const [tx, ty] = pt(pos == null ? fullScale / 2 : pos, R)
  const vb = crop ? [tx - 170, ty - 60, 340, 210] : [-160, -R - 32, 320, R + 52]
  const near = (v) => !crop || Math.abs(pt(v, R)[0] - tx) < 200
  return (
    <svg viewBox={vb.join(' ')} className="lab-closeup-svg" role="img" aria-label={label || 'Meter scale'}>
      <rect x={vb[0] + 2} y={vb[1] + 2} width={vb[2] - 4} height={vb[3] - 4} rx="10" fill="#FBFAF6" stroke="#9AA0A6" />
      <path d={arc(R * 0.835)} fill="none" stroke="#C9D2DA" strokeWidth={Math.min(26, R * 0.07)} />
      <path d={arc(R * 0.835)} fill="none" stroke="#EEF3F7" strokeWidth={Math.min(10, R * 0.03)} />
      {Array.from({ length: N + 1 }, (_, i) => {
        if (!near(i * division)) return null
        const major = i % M === 0, half = !major && M % 2 === 0 && i % (M / 2) === 0
        const [x1, y1] = pt(i * division, R * 0.9), [x2, y2] = pt(i * division, R * 0.9 + (major ? 30 : half ? 22 : 14))
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={major ? 1.8 : 1} />
      })}
      {Array.from({ length: Math.floor(N / M) + 1 }, (_, k) => {
        if (!near(k * M * division)) return null
        const [x, y] = pt(k * M * division, R * 0.9 + 44)
        return <text key={k} x={x} y={y + 4} fontSize="14" textAnchor="middle" fill={INK}>{(k * M * division).toFixed(dec)}</text>
      })}
      <text x={crop ? vb[0] + 16 : 0} y={crop ? vb[1] + vb[3] - 16 : -40} fontSize="20" textAnchor={crop ? 'start' : 'middle'} fill="#444" fontWeight="700">{unit}</text>
      <line x1={ix1} y1={iy1} x2={ix2} y2={iy2} stroke="#7A8794" strokeWidth="1.6" opacity="0.8" />
      <g className={settled ? '' : 'lab-wobble'} style={{ transformOrigin: '0px 0px' }}>
        <line x1="0" y1="0" x2={nx} y2={ny} stroke="#111" strokeWidth="1.8" />
      </g>
      {!crop && <circle cx="0" cy="0" r="9" fill="#2B2F36" />}
      {crop && <text x={vb[0] + vb[2] - 12} y={vb[1] + vb[3] - 16} fontSize="11" textAnchor="end" fill="#666">magnified · 0 to {fullScale} {unit}</text>}
    </svg>
  )
}

// ── Metre rule ─────────────────────────────────────────────
/** Millimetre scale with the pointer (spring pointer, edge of the object) at pos cm. */
export function Rule({ pos, eye = 0, settled = true, label }) {
  const W = 560, X0 = W / 2, PX = 22, SPAN = 12          // px per mm, mm shown each side
  const p = pos * 10
  const shift = parallaxShift(eye, 0.1) * 10 * PX
  const from = Math.floor(p - SPAN), to = Math.ceil(p + SPAN)
  const xOf = (mm) => X0 + (mm - p) * PX
  return (
    <svg viewBox={`0 0 ${W} 140`} className="lab-closeup-svg" role="img" aria-label={label || 'Metre rule close-up'}>
      <rect x="0" y="40" width={W} height="96" fill="#E9D3A4" stroke="#B8955A" />
      {Array.from({ length: to - from + 1 }, (_, i) => {
        const mm = from + i, x = xOf(mm), L = mm % 10 === 0 ? 44 : mm % 5 === 0 ? 30 : 19
        return <g key={mm}>
          <line x1={x} y1="40" x2={x} y2={40 + L} stroke={INK} strokeWidth={mm % 10 === 0 ? 2 : 1.1} />
          {mm % 10 === 0 && <text x={x} y="104" fontSize="17" textAnchor="middle" fill={INK}>{mm / 10}</text>}
        </g>
      })}
      <text x={W - 10} y="128" fontSize="12" textAnchor="end" fill="#5B4520">cm</text>
      <g className={settled ? '' : 'lab-bounce'}>
        <rect x={X0 + shift - 70} y="6" width="70" height="10" fill="#C62828" />
        <polygon points={`${X0 + shift},6 ${X0 + shift},40 ${X0 + shift - 8},16`} fill="#C62828" />
        <line x1={X0 + shift} y1="6" x2={X0 + shift} y2="42" stroke="#7F0000" strokeWidth="1.5" />
      </g>
    </svg>
  )
}

// ── Thermometer ────────────────────────────────────────────
/** Liquid-in-glass thermometer, 1 °C divisions; pos is the top of the liquid. */
export function Thermometer({ pos, eye = 0, settled = true, label }) {
  const H = 320, Y0 = H / 2, PX = 16, SPAN = 8
  const shift = parallaxShift(eye, 1) * PX
  const yOf = (t) => Y0 - (t - pos) * PX
  const from = Math.floor(pos - SPAN), to = Math.ceil(pos + SPAN)
  return (
    <svg viewBox={`0 0 180 ${H}`} className="lab-closeup-svg tall" role="img" aria-label={label || 'Thermometer close-up'}>
      <rect x="40" y="0" width="120" height={H} rx="14" fill="#F3F7FA" stroke="#9AA9B6" />
      {Array.from({ length: to - from + 1 }, (_, i) => {
        const t = from + i, y = yOf(t), L = t % 10 === 0 ? 30 : t % 5 === 0 ? 22 : 14
        return <g key={t}>
          <line x1="98" y1={y} x2={98 + L} y2={y} stroke={INK} strokeWidth={t % 5 === 0 ? 1.5 : 0.9} />
          {t % 5 === 0 && <text x="132" y={y + 5} fontSize="13" fill={INK}>{t}</text>}
        </g>
      })}
      <rect x="82" y="0" width="12" height={H} fill="#E4ECF2" />
      <g className={settled ? '' : 'lab-bounce y'}>
        <rect x="82" y={yOf(pos) + shift} width="12" height={H} fill="#C62828" />
        <path d={`M82 ${yOf(pos) + shift} Q88 ${yOf(pos) + shift + 3} 94 ${yOf(pos) + shift}`} fill="#E4ECF2" />
      </g>
      <text x="170" y={H - 8} fontSize="12" textAnchor="end" fill="#555">°C</text>
    </svg>
  )
}

// ── Vernier callipers ──────────────────────────────────────
/** Main scale (mm) and the sliding vernier with n divisions; value in mm. */
export function Vernier({ mm, n = 10, label }) {
  const { step } = vernierParts(mm, n)
  const PX = n > 10 ? 12 : 26
  const startMm = Math.max(0, Math.floor(mm) - 3), spanMm = n > 10 ? 56 : 20
  const W = spanMm * PX + 30
  const xOf = (v) => 15 + (v - startMm) * PX
  const vd = 1 - step                                      // a vernier division is (1 − step) mm
  const vLabelEvery = n > 10 ? 5 : 1
  return (
    <svg viewBox={`0 0 ${W} 170`} className="lab-closeup-svg" role="img" aria-label={label || 'Vernier callipers close-up'}>
      <rect x="0" y="10" width={W} height="72" fill="#D9DEE3" stroke="#8D98A3" />
      {Array.from({ length: spanMm + 1 }, (_, i) => {
        const m = startMm + i, x = xOf(m), L = m % 10 === 0 ? 34 : m % 5 === 0 ? 26 : 18
        return <g key={m}>
          <line x1={x} y1={82 - L} x2={x} y2="82" stroke={INK} strokeWidth={m % 10 === 0 ? 1.6 : 1} />
          {m % 10 === 0 && <text x={x} y="38" fontSize="14" textAnchor="middle" fill={INK}>{m / 10}</text>}
        </g>
      })}
      <text x={W - 8} y="28" fontSize="11" textAnchor="end" fill="#333">cm (main scale)</text>
      <rect x={xOf(mm) - 14} y="82" width={n * vd * PX + 28} height="62" fill="#EEF1F4" stroke="#8D98A3" />
      {Array.from({ length: n + 1 }, (_, k) => {
        const x = xOf(mm + k * vd), major = k % vLabelEvery === 0
        return <g key={k}>
          <line x1={x} y1="82" x2={x} y2={82 + (major ? 26 : 16)} stroke={INK} strokeWidth={major ? 1.4 : 0.9} />
          {major && <text x={x} y="124" fontSize={n > 10 ? 11 : 12} textAnchor="middle" fill={INK}>{n > 10 ? k / 5 : k}</text>}
        </g>
      })}
      <text x={xOf(mm) + 2} y="140" fontSize="10" fill="#555">vernier ({n > 10 ? '0.02' : '0.1'} mm)</text>
    </svg>
  )
}

// ── Micrometer ─────────────────────────────────────────────
/** Sleeve (mm above the datum line, half-mm below) and thimble (50 divisions). */
export function Micrometer({ mm, label, closed = false }) {
  const { thimble } = micrometerParts(mm)
  const PX = 34, Y = 104
  const start = Math.max(0, Math.floor(mm) - 4)
  const xOf = (v) => 30 + (v - start) * PX
  const edge = xOf(mm)
  const marks = []
  for (let h = start * 2; h / 2 <= mm + 1e-9; h++) marks.push(h / 2)
  const TP = 9
  return (
    <svg viewBox="0 0 520 210" className="lab-closeup-svg" role="img" aria-label={label || 'Micrometer close-up'}>
      <rect x="0" y={Y - 34} width={Math.max(10, edge)} height="68" fill="#D7DCE1" stroke="#8D98A3" />
      <line x1="0" y1={Y} x2={edge} y2={Y} stroke={INK} strokeWidth="1.4" />
      {marks.map(v => {
        const whole = Math.abs(v - Math.round(v)) < 1e-9, x = xOf(v)
        return <g key={v}>
          <line x1={x} y1={Y} x2={x} y2={whole ? Y - 16 : Y + 14} stroke={INK} strokeWidth="1.3" />
          {whole && Math.round(v) % 5 === 0 && <text x={x} y={Y - 21} fontSize="13" textAnchor="middle" fill={INK}>{Math.round(v)}</text>}
        </g>
      })}
      <text x="8" y={Y + 30} fontSize="10" fill="#444">sleeve (mm)</text>
      <rect x={edge} y="10" width="170" height="190" rx="6" fill="#C9CFD5" stroke="#7F8A95" />
      <rect x={edge} y="10" width="16" height="190" fill="#B8C0C8" />
      {Array.from({ length: 21 }, (_, i) => {
        const d = thimble - 10 + i, y = Y + (thimble - d) * TP
        const j = ((d % 50) + 50) % 50
        return <g key={i}>
          <line x1={edge} y1={y} x2={edge + (j % 5 === 0 ? 30 : 18)} y2={y} stroke={INK} strokeWidth={j % 5 === 0 ? 1.4 : 0.9} />
          {j % 5 === 0 && <text x={edge + 36} y={y + 4} fontSize="12" fill={INK}>{j}</text>}
        </g>
      })}
      <text x={edge + 164} y="200" fontSize="10" textAnchor="end" fill="#333">thimble (0.01 mm)</text>
      {closed && <text x={edge + 180} y="30" fontSize="11" fill="#7D1025">Jaws closed (ratchet turned until it clicks)</text>}
    </svg>
  )
}

// ── Stopwatch ──────────────────────────────────────────────
export function StopwatchFace({ text, running }) {
  return (
    <svg viewBox="0 0 200 200" className="lab-closeup-svg sq" role="img" aria-label={'Stopwatch ' + (running ? 'running' : 'stopped')}>
      <rect x="92" y="6" width="16" height="16" rx="3" fill="#8A9097" />
      <rect x="40" y="14" width="14" height="12" rx="3" fill="#C62828" transform="rotate(-30 47 20)" />
      <circle cx="100" cy="110" r="84" fill="#2B2F36" />
      <circle cx="100" cy="110" r="74" fill="#D9DDE2" />
      <rect x="40" y="88" width="120" height="44" rx="6" fill="#B9D6A8" />
      <text x="150" y="121" fontSize="27" fontFamily='"DejaVu Sans Mono", "Courier New", monospace' textAnchor="end" fill="#13240F">{text}</text>
      <text x="100" y="152" fontSize="11" textAnchor="middle" fill="#333">{running ? '● running' : 'STOPWATCH'}</text>
    </svg>
  )
}

/**
 * The motion being timed, drawn at the model's own period (or duration), so
 * the student can count oscillations. speed > 1 is a time-lapse.
 */
export function MotionView({ motion, running, speed = 1, startedAt, revolve = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !motion) return undefined
    let raf = 0
    const draw = () => {
      const t = running && startedAt ? ((performance.now() - startedAt) / 1000) * speed : 0
      const bob = el.querySelector('[data-bob]'), str = el.querySelector('[data-str]')
      if (motion.period) {
        if (revolve) {
          const a = 2 * Math.PI * t / motion.period
          bob?.setAttribute('cx', String(100 + 60 * Math.cos(a))); bob?.setAttribute('cy', String(60 + 22 * Math.sin(a)))
          str?.setAttribute('x2', String(100 + 60 * Math.cos(a))); str?.setAttribute('y2', String(60 + 22 * Math.sin(a)))
        } else {
          const a = running ? 0.32 * Math.cos(2 * Math.PI * t / motion.period) : 0.32
          const x = 100 + 92 * Math.sin(a), y = 10 + 92 * Math.cos(a)
          bob?.setAttribute('cx', String(x)); bob?.setAttribute('cy', String(y))
          str?.setAttribute('x2', String(x)); str?.setAttribute('y2', String(y))
        }
      } else {
        const f = running ? Math.min(1, t / motion.duration) : 0
        bob?.setAttribute('cx', String(20 + 160 * f)); bob?.setAttribute('cy', '60')
      }
      if (running) raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [motion, running, speed, startedAt, revolve])
  if (!motion) return null
  return (
    <svg ref={ref} viewBox="0 0 200 120" className="lab-closeup-svg" role="img" aria-label={motion.period ? 'The oscillation you are timing' : 'The motion you are timing'}>
      <rect x="0" y="0" width="200" height="120" fill="#F4F6F8" />
      {motion.period ? (revolve
        ? <><ellipse cx="100" cy="60" rx="60" ry="22" fill="none" stroke="#C9CED4" strokeDasharray="4 4" /><line data-str x1="100" y1="60" x2="160" y2="60" stroke="#555" /><circle data-bob cx="160" cy="60" r="7" fill="#8B5A2B" /></>
        : <><line x1="70" y1="10" x2="130" y2="10" stroke="#555" strokeWidth="4" /><line x1="100" y1="10" x2="100" y2="104" stroke="#C9CED4" strokeDasharray="3 4" /><line data-str x1="100" y1="10" x2="100" y2="102" stroke="#555" /><circle data-bob cx="100" cy="102" r="8" fill="#B8860B" /></>)
        : <><line x1="20" y1="80" x2="180" y2="80" stroke="#888" /><line x1="20" y1="30" x2="20" y2="90" stroke="#C62828" /><line x1="180" y1="30" x2="180" y2="90" stroke="#C62828" /><circle data-bob cx="20" cy="60" r="8" fill="#5D6D7E" /></>}
    </svg>
  )
}

/** The close-up of one reading, chosen by the kind of instrument. */
export function CloseUp({ r, view, label }) {
  const H = view.hands
  const value = view.readings[r.key]
  const info = H.kinds[r.key] || { kind: 'plain' }
  const look = H.look[r.key] || {}
  if (value === undefined) return <p className="lab-help">Take the reading to see the {label || 'instrument'} close up.</p>
  const settled = look.settled !== false
  const name = (label || r.label) + ' close-up'
  switch (info.kind) {
    case 'dial': return <Dial pos={value == null ? null : look.pos ?? value} fullScale={look.fullScale ?? info.fullScale} division={look.division ?? info.division} unit={r.unit} eye={H.eye} settled={settled} label={name} />
    case 'rule': return value == null ? null : <Rule pos={look.pos ?? value} eye={H.eye} settled={settled} label={name} />
    case 'thermometer': return value == null ? null : <Thermometer pos={look.pos ?? value} eye={H.eye} settled={settled} label={name} />
    case 'vernier': return value == null ? null : <Vernier mm={value * (r.unit === 'cm' ? 10 : 1)} n={info.n || 10} label={name} />
    case 'micrometer': return value == null ? null : <Micrometer mm={value} label={name} />
    case 'stopwatch': return <StopwatchFace text={stopwatchText(value, r.resolution)} running={false} />
    case 'digital': return <LCD value={value} alt={look.alt ?? null} res={r.resolution} unit={r.unit} label={name} />
    default: return <p className="lab-obs">{r.label}: <b>{value == null ? '----' : value.toFixed(dpOf(r.resolution)) + ' ' + (r.unit || '')}</b></p>
  }
}
