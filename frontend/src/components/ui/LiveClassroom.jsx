/**
 * LiveClassroom.jsx — the native Smartious Classroom (pilot).
 *
 * Real audio/video over a browser-to-browser WebRTC mesh (see
 * classroom/rtc.js), with the collaboration layer riding the Socket.IO
 * /classroom namespace on the existing backend:
 *   - film strip of live video tiles (self + every remote peer)
 *   - shared infinite whiteboard: pen, eraser, line, rect, circle, text,
 *     pan and zoom; every operation is broadcast in WORLD coordinates and
 *     replayed for late joiners, so all boards stay identical
 *   - chat, participants with raise-hand and mic/cam indicators
 *   - teacher controls: allow or lock student drawing, clear board
 *   - teacher screen share (camera track swapped live, no renegotiation)
 *     with an automatic presentation view on every screen
 *   - teacher can push pictures and Library PDF pages onto the board
 *     as image ops, replayed for late joiners like any stroke
 *
 * Runs alongside the meetingLink flow during the pilot: this component
 * mounts only from the /classroom/:liveClassId route, and nothing about
 * the existing Zoom-link buttons changes.
 *
 * Props: { liveClassId, user, onLeave }
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import { api } from '../../context/ctx.jsx'
import { MeshEngine } from '../../classroom/rtc.js'

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '')

// ── Classroom themes ───────────────────────────────────────
// Applied per user (a student can read in light mode while the
// teacher stays dark — every board op is colour-explicit, and eraser
// strokes always paint the LOCAL background, so boards stay in sync
// across themes).
const THEMES = {
  dark:  { name: 'Dark',  app: '#0B0F17', panel: '#131A26', strip: '#0E141F', board: '#10151F',
           text: '#FFFFFF', sub: 'rgba(255,255,255,.5)', btn: 'rgba(255,255,255,.1)', btnText: 'rgba(255,255,255,.85)',
           border: 'rgba(255,255,255,.08)', field: 'rgba(255,255,255,.08)', grid: 'rgba(255,255,255,.07)', gridBold: 'rgba(255,255,255,.14)', defaultPen: '#FFFFFF' },
  light: { name: 'Light', app: '#EDEDEF', panel: '#FFFFFF', strip: '#F4F4F6', board: '#FFFFFF',
           text: '#1B1B1F', sub: 'rgba(0,0,0,.5)', btn: 'rgba(0,0,0,.07)', btnText: 'rgba(0,0,0,.75)',
           border: 'rgba(0,0,0,.1)', field: 'rgba(0,0,0,.06)', grid: 'rgba(30,64,175,.12)', gridBold: 'rgba(30,64,175,.25)', defaultPen: '#1B1B1F' },
  bone:  { name: 'Bone',  app: '#EFE9DC', panel: '#FDFAF4', strip: '#F5F0E4', board: '#FDFAF4',
           text: '#2B2620', sub: 'rgba(43,38,32,.55)', btn: 'rgba(125,16,37,.08)', btnText: '#5A4634',
           border: 'rgba(125,16,37,.14)', field: 'rgba(125,16,37,.06)', grid: 'rgba(125,16,37,.1)', gridBold: 'rgba(125,16,37,.2)', defaultPen: '#2B2620' },
}
const THEME_ORDER = ['dark', 'light', 'bone']

// Quick pen swatches (theme-independent, chosen to read on all three
// backgrounds except the matching-background ones, which is why both
// white and near-black are offered).
const PEN_COLOURS = ['#FFFFFF', '#1B1B1F', '#E24B4A', '#C9A030', '#60A5FA', '#4ADE80', '#F97316', '#C084FC']

// Buttons read the active theme through this ref so the whole chrome
// re-skins on a theme switch without threading a prop everywhere.
const themeTokensRef = { current: null }
const Btn = ({ children, active, danger, onClick, title, disabled, style = {} }) => {
  const tk = themeTokensRef.current || THEMES.dark
  return (
  <button onClick={onClick} title={title} disabled={disabled} style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    border: 'none', borderRadius: 8, padding: '8px 11px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 12, fontWeight: 600, transition: 'background .15s', whiteSpace: 'nowrap',
    background: danger ? '#DC2626' : active ? 'rgba(96,165,250,.35)' : tk.btn,
    color: danger || active ? '#fff' : tk.btnText,
    opacity: disabled ? .45 : 1, ...style,
  }}>{children}</button>
  )
}

// The official Smartious crest — crimson shield, gold star, open
// book — identical to the login page mark so the classroom feels
// like the same house, not a third-party room.
const SmartiousCrest = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Smartious">
    <defs>
      <linearGradient id="cls-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A8203A"/>
        <stop offset="100%" stopColor="#7A1026"/>
      </linearGradient>
    </defs>
    <path d="M40 6 L68 14 Q70 14 70 17 L70 44 Q70 60 40 74 Q10 60 10 44 L10 17 Q10 14 12 14 Z"
      fill="url(#cls-grad)" stroke="#6A0E20" strokeWidth="0.6"/>
    <path d="M40 10 L64 17 Q65.5 17 65.5 19 L65.5 44 Q65.5 57 40 69 Q14.5 57 14.5 44 L14.5 19 Q14.5 17 16 17 Z"
      fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="0.8"/>
    <polygon points="40,19 42.2,26 49.5,26 43.7,30.4 45.9,37.5 40,33 34.1,37.5 36.3,30.4 30.5,26 37.8,26"
      fill="#C9973A" stroke="#C89A28" strokeWidth="0.4"/>
    <g transform="translate(40 52)">
      <path d="M-14 -4 L-14 8 L-1 9 L-1 -3 Q-8 -5 -14 -4 Z" fill="#FFFFFF" stroke="#FDFAF4" strokeWidth=".4"/>
      <path d="M14 -4 L14 8 L1 9 L1 -3 Q8 -5 14 -4 Z" fill="#FFFFFF" stroke="#FDFAF4" strokeWidth=".4"/>
      <line x1="-10" y1="-0.5" x2="-4" y2="-0.5" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
      <line x1="-10" y1="2" x2="-4" y2="2" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
      <line x1="4" y1="-0.5" x2="10" y2="-0.5" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
      <line x1="4" y1="2" x2="10" y2="2" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
    </g>
  </svg>
)

// ── Demonstration instruments: ruler, protractor, compass ──
// Drawn ABOVE the ink as overlays (never erased, never part of the
// drawing). World-coordinate positions sync to every screen, so the
// class watches the teacher measure exactly as on a real board.
function drawInstruments(ctx, insts, z) {
  const lw = (n) => Math.max(n / z, n * 0.5)
  ctx.save()
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'

  const R = insts.ruler
  if (R && R.visible) {
    ctx.save()
    ctx.translate(R.x, R.y); ctx.rotate(R.rot || 0)
    const L = R.len || 10 * 40, H = 44
    const units = L / 40
    ctx.fillStyle = 'rgba(242,194,48,.16)'
    ctx.strokeStyle = 'rgba(140,100,10,.85)'
    ctx.lineWidth = lw(1.4)
    ctx.fillRect(0, 0, L, H); ctx.strokeRect(0, 0, L, H)
    ctx.font = '11px Arial'; ctx.fillStyle = 'rgba(90,60,0,.9)'
    for (let u = 0; u <= Math.floor(units); u++) {
      const x = u * 40
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 14); ctx.stroke()
      if (u < units) { ctx.beginPath(); ctx.moveTo(x + 20, 0); ctx.lineTo(x + 20, 8); ctx.stroke() }
      ctx.fillText(String(u), x + 3, 26)
    }
    ctx.fillText((units).toFixed(1).replace(/\.0$/, '') + ' units long', 6, H - 6)
    // stretch handle: orange square flush on the end edge
    ctx.fillStyle = '#F97316'
    ctx.fillRect(L - 6, H / 2 - 8, 12, 16)
    ctx.strokeRect(L - 6, H / 2 - 8, 12, 16)
    // rotate handle: gold circle floating beyond the end
    ctx.beginPath(); ctx.arc(L + 26, H / 2, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#F2C230'; ctx.fill(); ctx.stroke()
    ctx.restore()
  }

  const P = insts.prot
  if (P && P.visible) {
    ctx.save()
    ctx.translate(P.x, P.y); ctx.rotate(P.rot || 0)
    const r = 3.4 * 40
    ctx.fillStyle = 'rgba(96,165,250,.13)'
    ctx.strokeStyle = 'rgba(30,80,160,.85)'
    ctx.lineWidth = lw(1.4)
    ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, 0); ctx.lineTo(-r, 0); ctx.closePath()
    ctx.fill(); ctx.stroke()
    ctx.font = '10px Arial'; ctx.fillStyle = 'rgba(20,60,130,.9)'
    for (let d = 0; d <= 180; d += 10) {
      const a = Math.PI + (d * Math.PI / 180)
      const len = d % 30 === 0 ? 14 : 8
      ctx.beginPath()
      ctx.moveTo((r - len) * Math.cos(a), (r - len) * Math.sin(a))
      ctx.lineTo(r * Math.cos(a), r * Math.sin(a))
      ctx.stroke()
      if (d % 30 === 0) {
        ctx.fillText(String(d), (r - 27) * Math.cos(a) - 7, (r - 27) * Math.sin(a) + 4)
      }
    }
    // centre crosshair + baseline
    ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 7); ctx.stroke()
    // rotate handle at the top of the arc
    ctx.beginPath(); ctx.arc(0, -r, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#60A5FA'; ctx.fill(); ctx.stroke()
    ctx.restore()
  }

  const Cm = insts.comp
  if (Cm && Cm.visible) {
    const ha = Cm.ha || 0
    const px = Cm.cx + Cm.r * Math.cos(ha), py = Cm.cy + Cm.r * Math.sin(ha)
    // Guide circle the pencil would trace (fades when pencil is up)
    ctx.strokeStyle = Cm.draw ? 'rgba(180,40,60,.6)' : 'rgba(120,120,130,.35)'
    ctx.lineWidth = lw(1.2)
    ctx.setLineDash([6, 6])
    ctx.beginPath(); ctx.arc(Cm.cx, Cm.cy, Cm.r, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([])

    // Geometry: hinge above the midpoint of needle..pencil
    const mx = (Cm.cx + px) / 2, my = (Cm.cy + py) / 2
    let nx = -(py - Cm.cy), ny = (px - Cm.cx)
    const nl = Math.hypot(nx, ny) || 1
    nx /= nl; ny /= nl
    if (ny > 0) { nx = -nx; ny = -ny }
    const h = Math.max(55, Math.min(150, Cm.r * 0.75))
    const ax = mx + nx * h, ay = my + ny * h

    // Soft ground shadows under the two contact points (3-D cue)
    ctx.fillStyle = 'rgba(0,0,0,.13)'
    ctx.beginPath(); ctx.ellipse(Cm.cx + 3, Cm.cy + 4, 10, 4, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(px + 3, py + 4, 10, 4, 0, 0, Math.PI * 2); ctx.fill()

    // A leg drawn as a metallic bar: quad with a cross-gradient
    const leg = (x1, y1, x2, y2, w1, w2, c1, c2, c3) => {
      const dx = x2 - x1, dy = y2 - y1
      const L = Math.hypot(dx, dy) || 1
      const ux = -dy / L, uy = dx / L
      const g = ctx.createLinearGradient(x1 + ux * w1, y1 + uy * w1, x1 - ux * w1, y1 - uy * w1)
      g.addColorStop(0, c1); g.addColorStop(0.45, c2); g.addColorStop(1, c3)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(x1 + ux * w1, y1 + uy * w1)
      ctx.lineTo(x2 + ux * w2, y2 + uy * w2)
      ctx.lineTo(x2 - ux * w2, y2 - uy * w2)
      ctx.lineTo(x1 - ux * w1, y1 - uy * w1)
      ctx.closePath(); ctx.fill()
      ctx.strokeStyle = 'rgba(40,40,50,.5)'; ctx.lineWidth = lw(0.8); ctx.stroke()
    }

    // Needle leg: steel, tapering to the point
    leg(ax, ay, Cm.cx + (Cm.cx - ax) * 0.02, Cm.cy + (Cm.cy - ay) * 0.02, 7, 1.5,
      '#EDEFF2', '#B9BEC7', '#7C828C')
    // Pencil leg: steel holder for the upper 55%, wood + graphite below
    const wx = ax + (px - ax) * 0.55, wy = ay + (py - ay) * 0.55
    leg(ax, ay, wx, wy, 7, 5, '#EDEFF2', '#B9BEC7', '#7C828C')
    leg(wx, wy, px + (px - wx) * 0.02, py + (py - wy) * 0.02, 5, 1.5,
      '#EFC98A', '#D8A35A', '#A9762F')
    // Graphite tip
    const pa = Math.atan2(ay - py, ax - px)
    ctx.fillStyle = '#3A3A3E'
    ctx.beginPath(); ctx.moveTo(px, py)
    ctx.lineTo(px + 8 * Math.cos(pa + 0.3), py + 8 * Math.sin(pa + 0.3))
    ctx.lineTo(px + 8 * Math.cos(pa - 0.3), py + 8 * Math.sin(pa - 0.3))
    ctx.closePath(); ctx.fill()
    // Needle point
    const na = Math.atan2(ay - Cm.cy, ax - Cm.cx)
    ctx.fillStyle = '#565B64'
    ctx.beginPath(); ctx.moveTo(Cm.cx, Cm.cy)
    ctx.lineTo(Cm.cx + 9 * Math.cos(na + 0.24), Cm.cy + 9 * Math.sin(na + 0.24))
    ctx.lineTo(Cm.cx + 9 * Math.cos(na - 0.24), Cm.cy + 9 * Math.sin(na - 0.24))
    ctx.closePath(); ctx.fill()

    // Hinge knob: radial-gradient sphere with a screw
    const kg = ctx.createRadialGradient(ax - 3, ay - 3 + nx * 0, 2, ax, ay, 12)
    kg.addColorStop(0, '#F5F6F8'); kg.addColorStop(0.6, '#9AA0AA'); kg.addColorStop(1, '#5E646E')
    ctx.fillStyle = kg
    ctx.beginPath(); ctx.arc(ax, ay, 11, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(40,40,50,.6)'; ctx.lineWidth = lw(1); ctx.stroke()
    ctx.fillStyle = '#454A52'
    ctx.beginPath(); ctx.arc(ax, ay, 3, 0, Math.PI * 2); ctx.fill()
    // Grip stem
    leg(ax + nx * 10, ay + ny * 10, ax + nx * 30, ay + ny * 30, 3.5, 3.5, '#EDEFF2', '#B9BEC7', '#7C828C')

    // DRAW toggle chip beside the hinge: pencil down / up
    const bx = ax + nx * 30 + 24, by = ay + ny * 30
    Cm._chip = { x: bx + 26, y: by }   // hit centre cached for the interaction layer
    ctx.fillStyle = Cm.draw ? '#E24B4A' : 'rgba(120,125,135,.9)'
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(bx, by - 11, 52, 22, 11) : ctx.rect(bx, by - 11, 52, 22)
    ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'
    ctx.fillText(Cm.draw ? 'DRAW' : 'SET', bx + (Cm.draw ? 11 : 15), by + 3.5)

    ctx.font = '12px Arial'; ctx.fillStyle = 'rgba(150,20,40,.95)'
    ctx.fillText('r = ' + (Cm.r / 40).toFixed(1) + ' u', mx + 14, my + 4)
  }
  ctx.restore()
}

// ── Teaching diagram templates ─────────────────────────────
// Each is a single board op {kind:'diagram', name, x1, y1, color, w}
// drawn procedurally around its centre — synced, replayable,
// undoable, and erasable like any stroke. Sized in world units so
// they align with the 40-unit graph grid.
function drawDiagram(ctx, op) {
  const { x1: cx, y1: cy } = op
  const S = 40
  ctx.font = '13px Arial, sans-serif'
  const line = (a, b, c, d) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke() }
  const arrowTip = (x, y, ang) => {
    ctx.beginPath()
    ctx.moveTo(x, y); ctx.lineTo(x - 9 * Math.cos(ang - 0.42), y - 9 * Math.sin(ang - 0.42))
    ctx.moveTo(x, y); ctx.lineTo(x - 9 * Math.cos(ang + 0.42), y - 9 * Math.sin(ang + 0.42))
    ctx.stroke()
  }
  if (op.name === 'numberline') {
    line(cx - 5.5 * S, cy, cx + 5.5 * S, cy)
    arrowTip(cx + 5.5 * S, cy, 0); arrowTip(cx - 5.5 * S, cy, Math.PI)
    for (let n = -5; n <= 5; n++) {
      line(cx + n * S, cy - 6, cx + n * S, cy + 6)
      ctx.fillText(String(n), cx + n * S - (n < 0 ? 8 : 4), cy + 21)
    }
  } else if (op.name === 'axes') {
    line(cx - 5.5 * S, cy, cx + 5.5 * S, cy); arrowTip(cx + 5.5 * S, cy, 0)
    line(cx, cy + 5.5 * S, cx, cy - 5.5 * S); arrowTip(cx, cy - 5.5 * S, -Math.PI / 2)
    for (let n = -5; n <= 5; n++) {
      if (n === 0) continue
      line(cx + n * S, cy - 4, cx + n * S, cy + 4)
      line(cx - 4, cy - n * S, cx + 4, cy - n * S)
      ctx.fillText(String(n), cx + n * S - 4, cy + 17)
      ctx.fillText(String(n), cx - 18, cy - n * S + 4)
    }
    ctx.fillText('x', cx + 5.5 * S + 6, cy + 4)
    ctx.fillText('y', cx - 4, cy - 5.5 * S - 8)
    ctx.fillText('O', cx - 15, cy + 15)
  } else if (op.name === 'venn2') {
    ctx.beginPath(); ctx.arc(cx - 1.2 * S, cy, 2.2 * S, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(cx + 1.2 * S, cy, 2.2 * S, 0, Math.PI * 2); ctx.stroke()
    ctx.fillText('A', cx - 2.6 * S, cy - 1.7 * S)
    ctx.fillText('B', cx + 2.4 * S, cy - 1.7 * S)
  } else if (op.name === 'triABC') {
    const A = { x: cx, y: cy - 2.4 * S }, B = { x: cx + 2.8 * S, y: cy + 2 * S }, Cc = { x: cx - 2.8 * S, y: cy + 2 * S }
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(Cc.x, Cc.y); ctx.closePath(); ctx.stroke()
    ctx.fillText('A', A.x - 4, A.y - 9)
    ctx.fillText('B', B.x + 7, B.y + 5)
    ctx.fillText('C', Cc.x - 17, Cc.y + 5)
  } else if (op.name === 'circleR') {
    ctx.beginPath(); ctx.arc(cx, cy, 2.2 * S, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cy, 2.2, 0, Math.PI * 2); ctx.fill()
    line(cx, cy, cx + 2.2 * S * Math.cos(-0.5), cy + 2.2 * S * Math.sin(-0.5))
    ctx.fillText('O', cx - 15, cy + 13)
    ctx.fillText('r', cx + 1.1 * S * Math.cos(-0.5), cy + 1.1 * S * Math.sin(-0.5) - 7)
  } else if (op.name === 'table') {
    const cw = 2.2 * S, ch = S, cols = 4, rows = 3
    const x0 = cx - cols * cw / 2, y0 = cy - rows * ch / 2
    for (let i = 0; i <= cols; i++) line(x0 + i * cw, y0, x0 + i * cw, y0 + rows * ch)
    for (let j = 0; j <= rows; j++) line(x0, y0 + j * ch, x0 + cols * cw, y0 + j * ch)
  }
}

// ── Practical simulations catalog ──────────────────────────
// PhET (University of Colorado) interactive HTML5 labs, free and
// openly licensed for embedding, plus Smartious-built native sims.
// Each participant runs their OWN copy (hands-on practice); the
// teacher demonstrates by screen sharing, which is also what the
// lesson recorder captures.
// The _en.html build carries ONE language; the _all.html build
// bundles every translation and is many times larger — on slower
// connections it looks permanently stuck. English build it is.
const phet = (id, title) => ({
  id: 'phet:' + id, title,
  url: 'https://phet.colorado.edu/sims/html/' + id + '/latest/' + id + '_en.html',
})
const SIM_CATALOG = [
  { subject: 'Smartious Labs', sims: [
    { id: 'sm:vernier', title: 'Vernier callipers — reading practice' },
    { id: 'sm:foodtests', title: 'Food tests — iodine, Benedict\u2019s, Biuret, emulsion' },
    { id: 'sm:titration', title: 'Acid-base titration — full Paper 3 practical' },
    { id: 'sm:electric', title: 'Electricity practical — build the circuit, take the readings' },
  ]},
  { subject: 'Physics', sims: [
    phet('projectile-motion', 'Projectile motion'),
    phet('pendulum-lab', 'Pendulum lab'),
    phet('forces-and-motion-basics', 'Forces and motion'),
    phet('circuit-construction-kit-dc', 'Circuit construction kit (DC)'),
    phet('ohms-law', 'Ohm\u2019s law'),
    phet('wave-on-a-string', 'Waves on a string'),
    phet('masses-and-springs', 'Masses and springs'),
    phet('energy-skate-park-basics', 'Energy skate park'),
    phet('gravity-and-orbits', 'Gravity and orbits'),
    phet('balancing-act', 'Moments: balancing act'),
  ]},
  { subject: 'Chemistry', sims: [
    phet('ph-scale', 'pH scale'),
    phet('acid-base-solutions', 'Acid-base solutions'),
    phet('concentration', 'Concentration'),
    phet('states-of-matter-basics', 'States of matter'),
    phet('balancing-chemical-equations', 'Balancing equations'),
    phet('molecule-shapes', 'Molecule shapes'),
    phet('gas-properties', 'Gas properties'),
  ]},
  { subject: 'Biology', sims: [
    phet('natural-selection', 'Natural selection'),
    phet('neuron', 'Neuron'),
    phet('gene-expression-essentials', 'Gene expression'),
    phet('diffusion', 'Diffusion (membrane transport)'),
  ]},
  { subject: 'Mathematics', sims: [
    phet('graphing-lines', 'Graphing straight lines'),
    phet('graphing-quadratics', 'Graphing quadratics'),
    phet('trig-tour', 'Trigonometry tour'),
  ]},
]

const DIAGRAMS = [
  ['numberline', 'Number line'],
  ['axes', 'Cartesian axes'],
  ['venn2', 'Venn diagram'],
  ['triABC', 'Triangle ABC'],
  ['circleR', 'Circle with radius'],
  ['table', 'Table grid'],
]

// Minimal stroke icons (no icon font needed; multi-subpath in one d).
const Ic = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)
const ICONS = {
  pen: 'M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 3 21l.5-4.5L17 3z',
  eraser: 'M16 3l5 5L10 19H5l-2-2L16 3z M5 19h14',
  hand: 'M2 12h20 M12 2v20 M5 9l-3 3 3 3 M9 5l3-3 3 3 M15 19l-3 3-3-3 M19 9l3 3-3 3',
  text: 'M4 7V4h16v3 M9 20h6 M12 4v16',
  rect: 'M3 5h18v14H3z',
  circle: 'M12 3a9 9 0 1 0 0.001 0z',
  line: 'M4 20L20 4',
  image: 'M3 5h18v14H3z M8.5 10a1.5 1.5 0 1 0 .001 0z M3 16l5-4 4 3 4-4 5 5',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  grid: 'M3 3h18v18H3z M9 3v18 M15 3v18 M3 9h18 M3 15h18',
  lockC: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
  lockO: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 7.5-2',
  undo: 'M3 7v6h6 M3.5 13a9 9 0 1 0 2.5-7.5L3 8',
  trash: 'M3 6h18 M8 6V4h8v2 M6 6l1 14h10l1-14 M10 10v6 M14 10v6',
  mic: 'M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z M19 11a7 7 0 0 1-14 0 M12 18v4 M8 22h8',
  micOff: 'M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z M19 11a7 7 0 0 1-14 0 M12 18v4 M8 22h8 M3 3l18 18',
  cam: 'M2 6h13v12H2z M15 10l7-4v12l-7-4',
  camOff: 'M2 6h13v12H2z M15 10l7-4v12l-7-4 M3 3l18 18',
  share: 'M2 4h20v13H2z M8 21h8 M12 17v4 M12 13V8 M9.5 10.5L12 8l2.5 2.5',
  raise: 'M8 12V6a1.6 1.6 0 1 1 3.2 0 M11.2 11V4a1.6 1.6 0 1 1 3.2 0v7 M14.4 11V6a1.6 1.6 0 1 1 3.2 0v8.5A6.5 6.5 0 0 1 11.1 21h-.6c-2.6 0-4-.9-5.3-2.8l-2.1-3.3a1.7 1.7 0 0 1 2.8-1.9L8 15',
  chat: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  people: 'M9 11a3.5 3.5 0 1 0-.001 0z M2 21a7 7 0 0 1 14 0 M17 3.5a3.5 3.5 0 0 1 0 7 M16 14a7 7 0 0 1 6 7',
  dots: 'M5 12a1 1 0 1 0 .001 0z M12 12a1 1 0 1 0 .001 0z M19 12a1 1 0 1 0 .001 0z',
  phone: 'M22 16.9V20a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3.1a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z',
  view: 'M8 3H5a2 2 0 0 0-2 2v3 M16 3h3a2 2 0 0 1 2 2v3 M8 21H5a2 2 0 0 1-2-2v-3 M16 21h3a2 2 0 0 0 2-2v-3',
  record: 'M12 5a7 7 0 1 0 .001 0z',
  arrow: 'M4 20L18 6 M18 14V6h-8',
  tri: 'M12 4L21 20H3z',
  poly: 'M12 3l8 6-3 10H7L4 9z',
  angle: 'M4 20L20 20 M4 20L16 6 M11 20a8 8 0 0 0-2.5-5.5',
  shapes: 'M4 4h7v7H4z M17.5 13a4.5 4.5 0 1 0 .001 0z M13 4l4 7h-8z',
  select: 'M5 3l14 8-6.5 1.5L16 19l-3 1.5-3.5-6.5L5 17z',
  ruler: 'M3 17L17 3l4 4L7 21z M7.5 12.5l2 2 M10.5 9.5l2 2 M13.5 6.5l2 2',
  prot: 'M4 16a8 8 0 0 1 16 0z M12 16v-5 M8 16v-2 M16 16v-2',
  comp: 'M12 4a2 2 0 1 0 .001 0z M12 6l-5 13 M12 6l5 13 M6 17c3 2 9 2 12 0',
  flask: 'M10 3h4 M10 3v6l-5.5 9a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9V3 M7.5 15h9',
}

// Bottom control: icon over a small label, mockup style.
const CtlBtn = ({ icon, label, active, danger, badge, onClick, title }) => (
  <button onClick={onClick} title={title || label} style={{
    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 10px', minWidth: 62,
    color: danger ? '#F87171' : active ? '#F2C230' : 'rgba(255,255,255,.85)',
  }}>
    <Ic d={ICONS[icon]} size={20} />
    <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
    {badge != null && (
      <span style={{ position: 'absolute', top: -2, right: 4, background: '#F2C230', color: '#111', fontSize: 9.5, fontWeight: 800, borderRadius: 99, padding: '1px 6px' }}>{badge}</span>
    )}
  </button>
)

// ═══ AUDIO RAIL ═══════════════════════════════════════════
// ALL remote audio plays through these permanently mounted, hidden
// elements — never through the visible tiles. Layout changes, view
// switches (whiteboard/screen/practical), fullscreen toggles and
// tile unmounts therefore CANNOT interrupt sound: what you hear no
// longer depends on what happens to be on screen. Every visible
// <video> below is muted; the rail is the single source of audio,
// so double audio is impossible by construction.
function RailAudio({ stream }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !stream) return
    if (el.srcObject !== stream) el.srcObject = stream
    const tryPlay = () => { el.play?.().catch(() => {}) }
    tryPlay()
    // If the browser ever pauses us (autoplay policy, fullscreen
    // transitions, tab juggling), come straight back.
    el.addEventListener('pause', tryPlay)
    document.addEventListener('fullscreenchange', tryPlay)
    document.addEventListener('visibilitychange', tryPlay)
    const gesture = () => tryPlay()
    document.addEventListener('click', gesture)
    const iv = setInterval(() => { if (el.paused) tryPlay() }, 3000)
    return () => {
      el.removeEventListener('pause', tryPlay)
      document.removeEventListener('fullscreenchange', tryPlay)
      document.removeEventListener('visibilitychange', tryPlay)
      document.removeEventListener('click', gesture)
      clearInterval(iv)
    }
  }, [stream])
  return <audio ref={ref} autoPlay style={{ display: 'none' }} />
}
function AudioRail({ streams }) {
  return (
    <div style={{ display: 'none' }}>
      {Object.entries(streams).map(([id, s]) => <RailAudio key={id} stream={s} />)}
    </div>
  )
}

// One video tile. Visible tiles are ALWAYS muted — audio comes from
// the AudioRail above, so unmounting a tile can't silence anyone.
function Tile({ stream, name, role, self, micOn, camOn, hand, quality, small, big }) {
  // Callback ref, NOT an effect: toggling the camera swaps between a
  // <video> and a hidden <audio> element, and each swap mounts a
  // brand-new element that must be (re)attached to the stream. An
  // effect keyed on [stream] misses those swaps — which made media
  // die permanently after the first mute/camera-off.
  const attach = (el) => {
    if (el && stream && el.srcObject !== stream) {
      el.srcObject = stream
      el.play?.().catch(() => {})
    }
  }
  const qColor = { good: '#22C55E', fair: '#F59E0B', poor: '#EF4444', down: '#6B7280' }[quality]
  return (
    <div style={{
      position: 'relative',
      width: big ? '100%' : small ? 108 : '100%',
      height: big ? undefined : small ? 72 : undefined,
      aspectRatio: big ? '16 / 10' : small ? undefined : '4 / 3',
      borderRadius: 12, overflow: 'hidden',
      background: '#1B2230', border: hand ? '2px solid #F59E0B' : '1px solid rgba(255,255,255,.12)',
      flexShrink: 0,
    }}>
      {stream && camOn !== false ? (
        <video ref={attach} autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          <div style={{
            width: 42, height: 42, borderRadius: '50%', background: role === 'teacher' ? '#7D1025' : '#1E3A8A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 15,
          }}>{(name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
        </div>
      )}
      {qColor && (
        <div title={'Connection: ' + quality} style={{
          position: 'absolute', top: 5, right: 5, width: 9, height: 9, borderRadius: '50%',
          background: qColor, border: '1.5px solid rgba(0,0,0,.4)',
        }} />
      )}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, padding: '3px 8px',
        background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <span style={{ color: '#fff', fontSize: 10.5, fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {self ? 'You' : name}{role === 'teacher' ? ' (Teacher)' : ''}
        </span>
        {micOn === false && <span style={{ color: '#F87171', fontSize: 9.5, fontWeight: 800 }}>MUTED</span>}
        {hand && <span style={{ color: '#F59E0B', fontSize: 9.5, fontWeight: 800 }}>HAND</span>}
      </div>
    </div>
  )
}

export default function LiveClassroom({ liveClassId, user, onLeave }) {
  // ── connection state ──
  const [phase, setPhase] = useState('lobby')   // lobby | connecting | live | error
  const [joinNonce, setJoinNonce] = useState(0)  // bumped by the lobby Join click
  const lobbyStreamRef = useRef(null)           // media granted in the lobby
  const [lobbyPreview, setLobbyPreview] = useState(null)
  const [lobbyStatus, setLobbyStatus] = useState('')   // '', 'granted', 'audio', 'denied'
  const [errMsg, setErrMsg] = useState('')
  const [classInfo, setClassInfo] = useState({})
  const [myRole, setMyRole] = useState('student')
  const [mediaNote, setMediaNote] = useState('')

  // ── people and media ──
  const [roster, setRoster] = useState([])           // server truth
  const [streams, setStreams] = useState({})         // socketId -> MediaStream
  const [localStream, setLocalStream] = useState(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [handUp, setHandUp] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [tilesHidden, setTilesHidden] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [swatchOpen, setSwatchOpen] = useState(false)
  const [diagOpen, setDiagOpen] = useState(false)
  const [focus, setFocus] = useState(false)   // board-only: maximum writing area
  // Open coursebook: shown split-screen beside the whiteboard, the
  // teacher turns pages and every student's copy follows.
  const [openBook, setOpenBook] = useState(null)   // { id, title, page }
  const [openSim, setOpenSim] = useState(null)     // { id, title, url }
  const [showSimPicker, setShowSimPicker] = useState(false)
  const [mainView, setMainView] = useState('board')   // 'board' | 'screen'
  const camTrackRef = useRef(null)
  const screenAudioTrackRef = useRef(null)      // system audio captured while screen sharing
  const screenAudioSendersRef = useRef([])      // its per-peer senders, for clean removal
  const [shareHasAudio, setShareHasAudio] = useState(false)
  const [showLibPicker, setShowLibPicker] = useState(false)
  const imgInputRef = useRef(null)
  const [recording, setRecording] = useState(false)
  const [recSecs, setRecSecs] = useState(0)
  const recRef = useRef(null)   // { recorder, recId, audioCtx, rafId, uploadChain, videoEl }

  // ── board ──
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const opsRef = useRef([])                          // full op log (world coords)
  const [tool, setTool] = useState('pen')            // pen eraser line rect circle text pan
  const [colour, setColour] = useState('#FFFFFF')
  const [lineW, setLineW] = useState(3)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [boardLocked, setBoardLocked] = useState(true)
  const viewRef = useRef({ zoom: 1, offset: { x: 0, y: 0 } })
  viewRef.current = { zoom, offset }

  // ── layout / resilience ──
  const [themeId, setThemeId] = useState(() => localStorage.getItem('sm_class_theme') || 'light')
  const T = THEMES[themeId] || THEMES.dark
  const themeRef = useRef(T)
  themeRef.current = T
  themeTokensRef.current = T
  const [grid, setGrid] = useState(false)
  const gridRef = useRef(false)
  gridRef.current = grid
  const rootRef = useRef(null)
  const [isFull, setIsFull] = useState(false)
  const pointersRef = useRef(new Map())   // two-finger pan / pinch zoom
  const penSeenRef = useRef(false)        // stylus detected -> palm rejection

  const cycleTheme = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(themeId) + 1) % THEME_ORDER.length]
    setThemeId(next)
    localStorage.setItem('sm_class_theme', next)
  }
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else rootRef.current?.requestFullscreen?.()
  }
  useEffect(() => {
    const onF = () => setIsFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onF)
    return () => document.removeEventListener('fullscreenchange', onF)
  }, [])

  const [narrow, setNarrow] = useState(typeof window !== 'undefined' && window.innerWidth < 760)
  const [panelOpen, setPanelOpen] = useState(typeof window === 'undefined' || window.innerWidth >= 760)
  const [quality, setQuality] = useState({})       // socketId -> good|fair|poor|down
  const [reconnecting, setReconnecting] = useState(false)
  const hadConnectedRef = useRef(false)

  useEffect(() => {
    const onR = () => setNarrow(window.innerWidth < 760)
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [])

  // ── chat / panel ──
  const [panel, setPanel] = useState('chat')
  const [chat, setChat] = useState([])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef(null)
  const [elapsed, setElapsed] = useState(0)

  const socketRef = useRef(null)
  const engineRef = useRef(null)
  const drawRef = useRef({ active: false, pts: [], start: null })

  const isTeacher = myRole === 'teacher' || myRole === 'admin'
  const canDraw = isTeacher || !boardLocked

  // ═══ BOARD RENDERING ═══════════════════════════════════════
  // Images (pictures, PDF pages) are board ops like any stroke; the
  // bitmap is cached per op and the board redraws once it decodes.
  const imgCacheRef = useRef(new Map())
  const redrawRef = useRef(() => {})

  const drawOp = useCallback((ctx, op) => {
    if (op.kind === 'lock') return
    if (op.kind === 'gsheet') return   // rendered by composite, under the ink
    if (op.kind === 'image') {
      const cache = imgCacheRef.current
      let img = cache.get(op.id)
      if (!img) {
        img = new Image()
        img.onload = () => redrawRef.current()
        img.src = op.src
        cache.set(op.id, img)
      }
      if (img.complete && img.naturalWidth) {
        ctx.drawImage(img, op.x1, op.y1, op.w, op.h)
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,.25)'
        ctx.lineWidth = 1
        ctx.strokeRect(op.x1, op.y1, op.w, op.h)
      }
      return
    }
    if (op.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = op.color || '#fff'
    }
    ctx.fillStyle = op.color || '#fff'
    ctx.lineWidth = (op.tool === 'eraser' ? (op.w || 3) * 6 : (op.w || 3))
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    if (op.kind === 'stroke' && op.pts && op.pts.length > 1) {
      ctx.beginPath(); ctx.moveTo(op.pts[0].x, op.pts[0].y)
      for (let i = 1; i < op.pts.length; i++) ctx.lineTo(op.pts[i].x, op.pts[i].y)
      ctx.stroke()
      ctx.globalCompositeOperation = 'source-over'
    } else if (op.kind === 'line') {
      ctx.beginPath(); ctx.moveTo(op.x1, op.y1); ctx.lineTo(op.x2, op.y2); ctx.stroke()
    } else if (op.kind === 'rect') {
      ctx.strokeRect(Math.min(op.x1, op.x2), Math.min(op.y1, op.y2), Math.abs(op.x2 - op.x1), Math.abs(op.y2 - op.y1))
    } else if (op.kind === 'circle') {
      const r = Math.hypot(op.x2 - op.x1, op.y2 - op.y1)
      ctx.beginPath(); ctx.arc(op.x1, op.y1, r, 0, Math.PI * 2); ctx.stroke()
    } else if (op.kind === 'text') {
      ctx.font = `${op.size || 18}px Arial, sans-serif`
      ctx.fillText(op.text || '', op.x1, op.y1)
    } else if (op.kind === 'arrow') {
      ctx.beginPath(); ctx.moveTo(op.x1, op.y1); ctx.lineTo(op.x2, op.y2); ctx.stroke()
      const a = Math.atan2(op.y2 - op.y1, op.x2 - op.x1), L = 6 + (op.w || 3) * 2.4
      ctx.beginPath()
      ctx.moveTo(op.x2, op.y2)
      ctx.lineTo(op.x2 - L * Math.cos(a - 0.45), op.y2 - L * Math.sin(a - 0.45))
      ctx.moveTo(op.x2, op.y2)
      ctx.lineTo(op.x2 - L * Math.cos(a + 0.45), op.y2 - L * Math.sin(a + 0.45))
      ctx.stroke()
    } else if (op.kind === 'tri') {
      const xa = Math.min(op.x1, op.x2), xb = Math.max(op.x1, op.x2)
      const ya = Math.min(op.y1, op.y2), yb = Math.max(op.y1, op.y2)
      ctx.beginPath()
      ctx.moveTo((xa + xb) / 2, ya); ctx.lineTo(xb, yb); ctx.lineTo(xa, yb)
      ctx.closePath(); ctx.stroke()
    } else if (op.kind === 'poly' && op.pts && op.pts.length > 1) {
      ctx.beginPath(); ctx.moveTo(op.pts[0].x, op.pts[0].y)
      for (let i = 1; i < op.pts.length; i++) ctx.lineTo(op.pts[i].x, op.pts[i].y)
      if (op.closed) ctx.closePath()
      ctx.stroke()
    } else if (op.kind === 'angle' && op.pts && op.pts.length === 3) {
      const [A, V, B] = op.pts
      ctx.beginPath(); ctx.moveTo(V.x, V.y); ctx.lineTo(A.x, A.y)
      ctx.moveTo(V.x, V.y); ctx.lineTo(B.x, B.y); ctx.stroke()
      const a1 = Math.atan2(A.y - V.y, A.x - V.x)
      const a2 = Math.atan2(B.y - V.y, B.x - V.x)
      let sweep = a2 - a1
      while (sweep <= -Math.PI) sweep += 2 * Math.PI
      while (sweep > Math.PI) sweep -= 2 * Math.PI
      const r = Math.min(34, 0.4 * Math.min(Math.hypot(A.x - V.x, A.y - V.y), Math.hypot(B.x - V.x, B.y - V.y)))
      ctx.beginPath(); ctx.arc(V.x, V.y, r, a1, a1 + sweep, sweep < 0); ctx.stroke()
      const deg = Math.abs(sweep) * 180 / Math.PI
      const mid = a1 + sweep / 2
      ctx.font = '13px Arial, sans-serif'
      ctx.fillText(deg.toFixed(1) + '\u00b0', V.x + (r + 14) * Math.cos(mid) - 12, V.y + (r + 14) * Math.sin(mid) + 4)
    } else if (op.kind === 'arc') {
      ctx.beginPath()
      ctx.arc(op.cx, op.cy, op.r, op.a0, op.a1, op.a1 < op.a0)
      ctx.stroke()
    } else if (op.kind === 'diagram') {
      drawDiagram(ctx, op)
    }
  }, [])

  const inkRef = useRef(null)   // offscreen transparent ink layer
  // Instruments live OUTSIDE the op log: one state per instrument,
  // last update wins, drawn above the ink in composite().
  const instRef = useRef({ ruler: null, prot: null, comp: null })
  const instThrottleRef = useRef(0)

  // Paint background + graph grid + the ink layer onto the screen.
  const composite = useCallback(() => {
    const cv = canvasRef.current, ink = inkRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const { zoom: z, offset: o } = viewRef.current
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = themeRef.current.board
    ctx.fillRect(0, 0, cv.width, cv.height)
    // Graph paper: 40-world-unit grid across the visible window only,
    // so the board stays infinite. Every fifth line is bolder. Because
    // it lives UNDER the ink layer, erasing ink never touches it.
    if (gridRef.current) {
      const S = 40
      const x0 = Math.floor((-o.x / z) / S) * S, x1 = (cv.width - o.x) / z
      const y0 = Math.floor((-o.y / z) / S) * S, y1 = (cv.height - o.y) / z
      ctx.setTransform(z, 0, 0, z, o.x, o.y)
      ctx.lineWidth = 1 / z
      for (let x = x0; x <= x1; x += S) {
        ctx.strokeStyle = (Math.round(x / S) % 5 === 0) ? themeRef.current.gridBold : themeRef.current.grid
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 + S); ctx.stroke()
      }
      for (let y = y0; y <= y1; y += S) {
        ctx.strokeStyle = (Math.round(y / S) % 5 === 0) ? themeRef.current.gridBold : themeRef.current.grid
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1 + S, y); ctx.stroke()
      }
    }
    // Graph SHEETS: bounded pieces of graph paper laid on the board,
    // drawn UNDER the ink so plots sit on them and erasing ink never
    // touches the paper. Movable and stretchable with Select.
    ctx.setTransform(z, 0, 0, z, o.x, o.y)
    for (const s of opsRef.current) {
      if (s.kind !== 'gsheet') continue
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(s.x1, s.y1, s.w, s.h)
      ctx.strokeStyle = 'rgba(30,64,175,.16)'
      ctx.lineWidth = 1 / z
      const S = 40
      for (let x = s.x1; x <= s.x1 + s.w + 0.1; x += S) {
        ctx.strokeStyle = (Math.round((x - s.x1) / S) % 5 === 0) ? 'rgba(30,64,175,.32)' : 'rgba(30,64,175,.16)'
        ctx.beginPath(); ctx.moveTo(x, s.y1); ctx.lineTo(x, s.y1 + s.h); ctx.stroke()
      }
      for (let y = s.y1; y <= s.y1 + s.h + 0.1; y += S) {
        ctx.strokeStyle = (Math.round((y - s.y1) / S) % 5 === 0) ? 'rgba(30,64,175,.32)' : 'rgba(30,64,175,.16)'
        ctx.beginPath(); ctx.moveTo(s.x1, y); ctx.lineTo(s.x1 + s.w, y); ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(30,64,175,.5)'
      ctx.lineWidth = 1.5 / z
      ctx.strokeRect(s.x1, s.y1, s.w, s.h)
      // stretch handle: corner tab bottom-right
      ctx.fillStyle = 'rgba(30,64,175,.55)'
      ctx.beginPath()
      ctx.moveTo(s.x1 + s.w, s.y1 + s.h - 16)
      ctx.lineTo(s.x1 + s.w, s.y1 + s.h)
      ctx.lineTo(s.x1 + s.w - 16, s.y1 + s.h)
      ctx.closePath(); ctx.fill()
    }
    if (ink) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(ink, 0, 0)
    }
    ctx.setTransform(z, 0, 0, z, o.x, o.y)
    drawInstruments(ctx, instRef.current, z)
  }, [])

  const redraw = useCallback(() => {
    const cv = canvasRef.current
    if (!cv) return
    if (!inkRef.current) inkRef.current = document.createElement('canvas')
    const ink = inkRef.current
    if (ink.width !== cv.width || ink.height !== cv.height) { ink.width = cv.width; ink.height = cv.height }
    const ictx = ink.getContext('2d')
    const { zoom: z, offset: o } = viewRef.current
    ictx.setTransform(1, 0, 0, 1, 0, 0)
    ictx.clearRect(0, 0, ink.width, ink.height)
    ictx.setTransform(z, 0, 0, z, o.x, o.y)
    for (const op of opsRef.current) drawOp(ictx, op)
    ictx.globalCompositeOperation = 'source-over'
    composite()
  }, [drawOp, composite])
  redrawRef.current = redraw

  useEffect(() => { redraw() }, [zoom, offset, redraw, themeId, grid])

  useEffect(() => {
    const fit = () => {
      const cv = canvasRef.current, wrap = wrapRef.current
      if (!cv || !wrap) return
      const w = wrap.clientWidth, h = wrap.clientHeight
      if (!w || !h) return                    // container not laid out yet
      if (cv.width === w && cv.height === h) return
      cv.width = w; cv.height = h
      redraw()
    }
    fit()
    // The board card resizes when the chat panel opens/closes, tiles
    // hide, fullscreen toggles, or the layout settles after join —
    // none of which fire a window resize. Observe the container
    // itself so the canvas can never be stuck at a stale/zero size
    // (which makes every tool look dead).
    let ro = null
    if (typeof ResizeObserver !== 'undefined' && wrapRef.current) {
      ro = new ResizeObserver(fit)
      ro.observe(wrapRef.current)
    }
    window.addEventListener('resize', fit)
    const t = setInterval(fit, 1500)          // belt and braces
    return () => {
      window.removeEventListener('resize', fit)
      if (ro) ro.disconnect()
      clearInterval(t)
    }
  }, [redraw, phase])

  const applyOp = useCallback((op) => {
    if (op.kind === 'lock') { setBoardLocked(!!op.locked); return }
    if (op.kind === 'bg') { setGrid(op.grid === true); return }
    if (op.kind === 'undo') { applyUndo(op.by); return }
    if (op.kind === 'move') {
      const target = opsRef.current.find(o => o.id === op.target)
      if (target) translateOp(target, op.dx, op.dy)
      opsRef.current.push(op)
      redrawRef.current()
      return
    }
    if (op.kind === 'inst') {
      instRef.current[op.name] = op.st || null
      composite()
      return
    }
    if (op.kind === 'resize') {
      const target = opsRef.current.find(o => o.id === op.target)
      if (target) { target.w = Math.max(4 * 40, (target.w || 0) + op.dw); target.h = Math.max(4 * 40, (target.h || 0) + op.dh) }
      opsRef.current.push(op)
      redrawRef.current()
      return
    }
    if (op.kind === 'book') { setOpenBook(op.bookId ? { id: op.bookId, title: op.title || 'Coursebook', page: op.page || 1 } : null); return }
    if (op.kind === 'sim') {
      const sim = op.simId ? { id: op.simId, title: op.title || 'Practical', url: op.url || null } : null
      setOpenSim(sim)
      setMainView(sim ? 'sim' : 'board')
      return
    }
    opsRef.current.push(op)
    const ink = inkRef.current
    if (!ink) { redrawRef.current(); return }
    const ictx = ink.getContext('2d')
    const { zoom: z, offset: o } = viewRef.current
    ictx.setTransform(z, 0, 0, z, o.x, o.y)
    drawOp(ictx, op)
    ictx.globalCompositeOperation = 'source-over'
    composite()
  }, [drawOp, composite])

  const myIdRef = useRef('')

  const translateOp = (op, dx, dy) => {
    if (!op) return
    if (Array.isArray(op.pts)) for (const pt of op.pts) { pt.x += dx; pt.y += dy }
    if (typeof op.x1 === 'number') op.x1 += dx
    if (typeof op.y1 === 'number') op.y1 += dy
    if (typeof op.x2 === 'number') op.x2 += dx
    if (typeof op.y2 === 'number') op.y2 += dy
    if (typeof op.cx === 'number') op.cx += dx
    if (typeof op.cy === 'number') op.cy += dy
  }

  const opBounds = (op) => {
    const pad = (op.w || 3) + 6
    if (op.kind === 'image' || op.kind === 'gsheet') return { x: op.x1, y: op.y1, w: op.w, h: op.h }
    if (op.kind === 'diagram') return { x: op.x1 - 240, y: op.y1 - 240, w: 480, h: 480 }
    if (op.kind === 'text') return { x: op.x1 - 4, y: op.y1 - (op.size || 18), w: (op.text || '').length * (op.size || 18) * 0.6 + 8, h: (op.size || 18) + 8 }
    if (op.kind === 'arc') {
      return { x: op.cx - op.r - pad, y: op.cy - op.r - pad, w: 2 * (op.r + pad), h: 2 * (op.r + pad) }
    }
    if (op.kind === 'circle') {
      const r = Math.hypot((op.x2 ?? op.x1) - op.x1, (op.y2 ?? op.y1) - op.y1)
      return { x: op.x1 - r - pad, y: op.y1 - r - pad, w: 2 * (r + pad), h: 2 * (r + pad) }
    }
    let xs = [], ys = []
    if (Array.isArray(op.pts)) { xs = op.pts.map(q => q.x); ys = op.pts.map(q => q.y) }
    if (typeof op.x1 === 'number') { xs.push(op.x1); ys.push(op.y1) }
    if (typeof op.x2 === 'number') { xs.push(op.x2); ys.push(op.y2) }
    if (!xs.length) return null
    const x = Math.min(...xs) - pad, y = Math.min(...ys) - pad
    return { x, y, w: Math.max(...xs) - x + pad * 2, h: Math.max(...ys) - y + pad * 2 }
  }

  const MOVABLE = ['stroke', 'line', 'rect', 'circle', 'text', 'arrow', 'tri', 'poly', 'angle', 'image', 'diagram', 'arc', 'gsheet']
  const hitTest = (p) => {
    const ops = opsRef.current
    for (let i = ops.length - 1; i >= 0; i--) {
      const op = ops[i]
      if (!MOVABLE.includes(op.kind) || op.tool === 'eraser') continue
      const b = opBounds(op)
      if (b && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) return op
    }
    return null
  }

  const applyUndo = useCallback((byId) => {
    const ops = opsRef.current
    for (let i = ops.length - 1; i >= 0; i--) {
      if (ops[i].by === byId) {
        if (ops[i].kind === 'inst') continue
        const removed = ops.splice(i, 1)[0]
        // Undoing a MOVE puts the target back where it came from.
        if (removed.kind === 'move') {
          const target = ops.find(o => o.id === removed.target)
          if (target) translateOp(target, -removed.dx, -removed.dy)
        }
        if (removed.kind === 'resize') {
          const target = ops.find(o => o.id === removed.target)
          if (target) { target.w -= removed.dw; target.h -= removed.dh }
        }
        break
      }
    }
    redrawRef.current()
  }, [])

  const sendInst = (name, st, final) => {
    instRef.current[name] = st
    composite()
    const now = Date.now()
    if (!final && now - instThrottleRef.current < 140) return
    instThrottleRef.current = now
    socketRef.current?.emit('board:op', { kind: 'inst', name, st, by: myIdRef.current, id: 'inst-' + name })
  }

  const newOpId = () => 'op-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7)

  const sendOp = useCallback((op) => {
    op.by = myIdRef.current
    if (!op.id) op.id = newOpId()
    applyOp(op)
    socketRef.current?.emit('board:op', op)
  }, [applyOp])

  // Live-flushed stroke chunks bypass local re-draw (already on canvas)
  const sendOpLive = (op) => {
    op.by = myIdRef.current
    if (!op.id) op.id = newOpId()
    if (op.kind === 'stroke') opsRef.current.push(op)
    socketRef.current?.emit('board:op', op)
  }

  const doUndo = () => {
    if (!opsRef.current.some(o => o.by === myIdRef.current)) return
    applyUndo(myIdRef.current)
    socketRef.current?.emit('board:op', { kind: 'undo', by: myIdRef.current })
  }

  const zoomBy = (factor) => {
    const cv = canvasRef.current
    const mx = (cv?.width || 800) / 2, my = (cv?.height || 500) / 2
    setZoom(z0 => {
      const z1 = Math.min(4, Math.max(0.25, z0 * factor))
      setOffset(o => ({ x: mx - (mx - o.x) * (z1 / z0), y: my - (my - o.y) * (z1 / z0) }))
      return z1
    })
  }

  // ═══ CONNECT ═══════════════════════════════════════════════
  useEffect(() => {
    if (!joinNonce) return
    let socket, engine, cancelled = false
    const boot = async () => {
      try {
        // 1. ICE servers (STUN always; TURN when configured server-side)
        let iceServers = null
        try { iceServers = (await api.get('/classroom/ice')).data?.data?.iceServers } catch (e) { iceServers = null }

        // 2. Media was granted (or declined) in the LOBBY, where the
        // permission prompt rode a real click. Whatever the person
        // ended up with is what they join with; the in-class Enable
        // button can still hot-add devices later.
        const stream = lobbyStreamRef.current || new MediaStream()
        const hasVideo = stream.getVideoTracks().length > 0
        const hasAudio = stream.getAudioTracks().length > 0
        setCamOn(hasVideo); setMicOn(hasAudio)
        if (!hasAudio && !hasVideo) setMediaNote('You joined as a viewer. Press Enable camera and mic to speak.')
        else if (!hasVideo) setMediaNote('Camera unavailable — you have joined with audio only.')
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        setLocalStream(stream)

        // 3. Signaling socket, same JWT as the REST API
        const token = localStorage.getItem('sm_token') || ''
        socket = io(BASE + '/classroom', {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true, reconnectionDelay: 1000, reconnectionAttempts: 8,
        })
        socketRef.current = socket

        // 4. Mesh engine
        engine = new MeshEngine({
          socket, localStream: stream, iceServers,
          onTrack: (id, s) => setStreams(prev => ({ ...prev, [id]: s })),
          onPeerClosed: (id) => setStreams(prev => { const n = { ...prev }; delete n[id]; return n }),
        })
        engineRef.current = engine

        myIdRef.current = String(user?._id || user?.id || '')
        const joinRoom = () => socket.emit('join', { liveClassId }, (ack) => {
          if (cancelled) return
          if (!ack?.ok) { setPhase('error'); setErrMsg(ack?.message || 'Could not join.'); return }
          setMyRole(ack.self.role)
          setClassInfo(ack.classInfo || {})
          setRoster(ack.roster || [])
          setChat(ack.chat || [])
          opsRef.current = []
          for (const op of (ack.boardOps || [])) {
            if (op.kind === 'lock') setBoardLocked(!!op.locked)
            else if (op.kind === 'bg') setGrid(op.grid === true)
            else if (op.kind === 'undo') {
              const ops = opsRef.current
              for (let i = ops.length - 1; i >= 0; i--) {
                if (ops[i].by === op.by) { ops.splice(i, 1); break }
              }
            }
            else if (op.kind === 'move') {
              const target = opsRef.current.find(o => o.id === op.target)
              if (target) translateOp(target, op.dx, op.dy)
              opsRef.current.push(op)
            }
            else if (op.kind === 'inst') {
              instRef.current[op.name] = op.st || null
            }
            else if (op.kind === 'resize') {
              const target = opsRef.current.find(o => o.id === op.target)
              if (target) { target.w = Math.max(4 * 40, (target.w || 0) + op.dw); target.h = Math.max(4 * 40, (target.h || 0) + op.dh) }
              opsRef.current.push(op)
            }
            else if (op.kind === 'book') {
              setOpenBook(op.bookId ? { id: op.bookId, title: op.title || 'Coursebook', page: op.page || 1 } : null)
            }
            else if (op.kind === 'sim') {
              const sim = op.simId ? { id: op.simId, title: op.title || 'Practical', url: op.url || null } : null
              setOpenSim(sim)
              if (sim) setMainView('sim')
            }
            else opsRef.current.push(op)
          }
          redraw()
          // Initiate toward every peer already present (they answer).
          for (const p of (ack.roster || [])) if (p.socketId !== socket.id) engine.connectTo(p.socketId)
          setPhase('live')
        })

        socket.on('connect', () => {
          // A reconnect issues a NEW socket id, so every peer must be
          // renegotiated from the fresh roster: drop the stale mesh
          // first, then rejoin. First connect just joins.
          if (hadConnectedRef.current) {
            engine.reset()
            setStreams({})
          }
          hadConnectedRef.current = true
          setReconnecting(false)
          joinRoom()
        })
        socket.on('disconnect', () => setReconnecting(true))
        socket.io.on('reconnect_attempt', () => setReconnecting(true))
        socket.on('connect_error', () => {
          if (!cancelled) { setPhase(p => p === 'live' ? p : 'error'); setErrMsg('Could not reach the classroom server.') }
        })
        socket.on('peer:joined', (p) => {
          setRoster(prev => [...prev.filter(x => x.socketId !== p.socketId), p])
          engine.connectTo(p.socketId)
        })
        socket.on('peer:left', ({ socketId }) => {
          setRoster(prev => prev.filter(x => x.socketId !== socketId))
          engine.close(socketId)
        })
        socket.on('peer:state', (s) => {
          setRoster(prev => prev.map(p => p.socketId === s.socketId ? { ...p, ...s } : p))
        })
        socket.on('board:op', applyOp)
        socket.on('board:clear', () => { opsRef.current = []; redraw() })
        socket.on('chat:msg', (m) => setChat(prev => [...prev, m]))
      } catch (e) {
        console.error('[classroom boot]', e)
        if (!cancelled) { setPhase('error'); setErrMsg('Something went wrong starting the classroom.') }
      }
    }
    boot()
    return () => {
      cancelled = true
      try { engineRef.current?.destroy() } catch (e) { /* noop */ }
      try { socketRef.current?.emit('leave'); socketRef.current?.disconnect() } catch (e) { /* noop */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveClassId, joinNonce])

  useEffect(() => {
    if (phase !== 'live') return
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    const q = setInterval(async () => {
      const eng = engineRef.current
      if (eng) setQuality(await eng.getQuality())
    }, 4000)
    return () => { clearInterval(t); clearInterval(q) }
  }, [phase])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat, panel])

  // ═══ POINTER HANDLING ══════════════════════════════════════
  const toWorld = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const { zoom: z, offset: o } = viewRef.current
    return { x: (e.clientX - rect.left - o.x) / z, y: (e.clientY - rect.top - o.y) / z }
  }

  const rulerSnap = (p) => {
    const R = instRef.current.ruler
    if (!R || !R.visible) return p
    const rot = R.rot || 0
    const lx = (p.x - R.x) * Math.cos(-rot) - (p.y - R.y) * Math.sin(-rot)
    const ly = (p.x - R.x) * Math.sin(-rot) + (p.y - R.y) * Math.cos(-rot)
    const L = R.len || 10 * 40
    // The ruler occludes: anywhere on or near the body snaps the pen
    // to the NEAREST edge (top y=0 or bottom y=44), so you can rule
    // along either side but never scribble across the instrument.
    if (lx >= -8 && lx <= L + 8 && ly > -18 && ly < 62) {
      const edge = ly < 22 ? 0 : 44
      return {
        x: R.x + lx * Math.cos(rot) - edge * Math.sin(rot),
        y: R.y + lx * Math.sin(rot) + edge * Math.cos(rot),
      }
    }
    return p
  }

  const snap15 = (p0, p1) => {
    const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x)
    const s = Math.round(ang / (Math.PI / 12)) * (Math.PI / 12)
    const len = Math.hypot(p1.x - p0.x, p1.y - p0.y)
    return { x: p0.x + len * Math.cos(s), y: p0.y + len * Math.sin(s) }
  }

  const commitMulti = () => {
    const m = drawRef.current.multi
    if (!m) return
    if (m.tool === 'poly' && m.pts.length >= 2)
      sendOp({ kind: 'poly', pts: m.pts, closed: true, color: colour, w: lineW })
    drawRef.current.multi = null
    redraw()
  }
  const cancelMulti = () => { drawRef.current.multi = null; redraw() }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter') commitMulti()
      if (e.key === 'Escape') cancelMulti()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colour, lineW])

  const onDown = (e) => {
    if (phase !== 'live') return
    const d = drawRef.current
    // Palm rejection: the moment a stylus touches the board, fingers
    // stop drawing for the rest of the session — a finger (or resting
    // palm) pans and scrolls instead, and only the pen writes. This
    // is how writing on a tablet stays clean.
    if (e.pointerType === 'pen') penSeenRef.current = true
    const fingerWhilePenMode = e.pointerType === 'touch' && penSeenRef.current
    if (tool === 'pan' || e.button === 1 || !canDraw || fingerWhilePenMode) {
      d.active = 'pan'
      d.start = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
      return
    }
    const p = toWorld(e)

    // Instruments (teacher): grab a handle or body before any tool
    // logic — the ruler, protractor, and compass float above the ink.
    if (isTeacher) {
      const I = instRef.current
      const near = (x, y, r) => Math.hypot(p.x - x, p.y - y) < r
      if (I.comp && I.comp.visible) {
        const Cm = I.comp
        const ha0 = Cm.ha || 0
        const hx = Cm.cx + Cm.r * Math.cos(ha0)
        const hy = Cm.cy + Cm.r * Math.sin(ha0)
        // DRAW/SET chip (position cached by the renderer)
        if (Cm._chip && near(Cm._chip.x, Cm._chip.y, 26)) {
          sendInst('comp', { ...Cm, draw: !Cm.draw }, true)
          return
        }
        // Pencil tip: SET mode opens/closes the legs freely;
        // DRAW mode sweeps a real inked arc at the locked radius.
        if (near(hx, hy, 24)) {
          if (Cm.draw) {
            d.active = 'inst'; d.inst = ['comp', 'sweep']
            d.sweep = { a0: ha0, aCur: ha0, last: ha0 }
          } else {
            d.active = 'inst'; d.inst = ['comp', 'radius']
          }
          return
        }
        // Anywhere else on the instrument (needle, legs, hinge): move
        const mx = (Cm.cx + hx) / 2, my = (Cm.cy + hy) / 2
        let nx = -(hy - Cm.cy), ny = (hx - Cm.cx)
        const nl2 = Math.hypot(nx, ny) || 1; nx /= nl2; ny /= nl2
        if (ny > 0) { nx = -nx; ny = -ny }
        const hh = Math.max(55, Math.min(150, Cm.r * 0.75))
        const axp = mx + nx * hh, ayp = my + ny * hh
        const distToSeg = (x1, y1, x2, y2) => {
          const L2 = (x2 - x1) ** 2 + (y2 - y1) ** 2 || 1
          const t = Math.max(0, Math.min(1, ((p.x - x1) * (x2 - x1) + (p.y - y1) * (y2 - y1)) / L2))
          return Math.hypot(p.x - (x1 + t * (x2 - x1)), p.y - (y1 + t * (y2 - y1)))
        }
        if (near(Cm.cx, Cm.cy, 20) || near(axp, ayp, 22) ||
            distToSeg(Cm.cx, Cm.cy, axp, ayp) < 14 || distToSeg(hx, hy, axp, ayp) < 14) {
          d.active = 'inst'; d.inst = ['comp', 'body']; d.last = p
          return
        }
      }
      if (I.prot && I.prot.visible) {
        const rot = I.prot.rot || 0, r = 3.4 * 40
        const hx = I.prot.x + r * Math.sin(rot) * -1 * 0 + (-r) * Math.sin(rot)
        const hy = I.prot.y + (-r) * Math.cos(rot)
        if (near(I.prot.x - r * Math.sin(rot), I.prot.y - r * Math.cos(rot), 16)) { d.active = 'inst'; d.inst = ['prot', 'rot']; return }
        const lx = (p.x - I.prot.x) * Math.cos(-rot) - (p.y - I.prot.y) * Math.sin(-rot)
        const ly = (p.x - I.prot.x) * Math.sin(-rot) + (p.y - I.prot.y) * Math.cos(-rot)
        if (ly <= 6 && ly > -r && Math.hypot(lx, ly) <= r) { d.active = 'inst'; d.inst = ['prot', 'body']; d.last = p; return }
      }
      if (I.ruler && I.ruler.visible) {
        const rot = I.ruler.rot || 0
        const L = I.ruler.len || 10 * 40
        const lx = (p.x - I.ruler.x) * Math.cos(-rot) - (p.y - I.ruler.y) * Math.sin(-rot)
        const ly = (p.x - I.ruler.x) * Math.sin(-rot) + (p.y - I.ruler.y) * Math.cos(-rot)
        // gold circle beyond the end: rotate
        if (Math.hypot(lx - (L + 26), ly - 22) < 16) { d.active = 'inst'; d.inst = ['ruler', 'rot']; return }
        // orange square on the end edge: stretch
        if (Math.abs(lx - L) < 14 && Math.abs(ly - 22) < 18) { d.active = 'inst'; d.inst = ['ruler', 'len']; return }
        if (lx >= 0 && lx <= L && ly >= 0 && ly <= 44) { d.active = 'inst'; d.inst = ['ruler', 'body']; d.last = p; return }
      }
    }

    // Select tool: grab whatever is under the cursor and drag it.
    if (tool === 'select') {
      const hit = hitTest(p)
      if (hit && hit.kind === 'gsheet' &&
          Math.abs(p.x - (hit.x1 + hit.w)) < 22 && Math.abs(p.y - (hit.y1 + hit.h)) < 22) {
        d.active = 'resize'
        d.moveTarget = hit
        d.moveAcc = { x: 0, y: 0 }
        d.last = p
        return
      }
      if (hit) {
        d.active = 'move'
        d.moveTarget = hit
        d.moveAcc = { x: 0, y: 0 }
        d.last = p
      } else {
        d.active = 'pan'
        d.start = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
      }
      return
    }

    // Click-accumulating tools: polygon and angle.
    if (tool === 'poly' || tool === 'angle') {
      if (!d.multi || d.multi.tool !== tool) d.multi = { tool, pts: [] }
      // Clicking near the first polygon point closes the shape.
      if (tool === 'poly' && d.multi.pts.length >= 2) {
        const f = d.multi.pts[0]
        if (Math.hypot(p.x - f.x, p.y - f.y) < 12 / viewRef.current.zoom) { commitMulti(); return }
      }
      d.multi.pts.push(p)
      if (tool === 'angle' && d.multi.pts.length === 3) {
        sendOp({ kind: 'angle', pts: d.multi.pts, color: colour, w: lineW })
        d.multi = null
      }
      redraw()
      return
    }

    if (tool === 'text') {
      const text = window.prompt('Text:')
      if (text && text.trim()) sendOp({ kind: 'text', x1: p.x, y1: p.y, text: text.trim(), color: colour, size: 12 + lineW * 3 })
      return
    }
    const ps = (tool === 'pen' || tool === 'line') ? rulerSnap(p) : p
    d.active = tool
    d.start = ps
    d.pts = [ps]
  }

  const onMove = (e) => {
    const d = drawRef.current
    // Live preview for polygon/angle while hovering between clicks.
    if (!d.active && d.multi && d.multi.pts.length > 0) {
      const p = toWorld(e)
      redraw()
      const cv = canvasRef.current, ctx = cv.getContext('2d')
      const { zoom: z, offset: o } = viewRef.current
      ctx.setTransform(z, 0, 0, z, o.x, o.y)
      if (d.multi.tool === 'poly') {
        drawOp(ctx, { kind: 'poly', pts: [...d.multi.pts, p], closed: false, color: colour, w: lineW })
      } else if (d.multi.tool === 'angle') {
        const pts = d.multi.pts.length === 1 ? [d.multi.pts[0], p] : [d.multi.pts[0], d.multi.pts[1], p]
        if (pts.length === 2) drawOp(ctx, { kind: 'line', x1: pts[0].x, y1: pts[0].y, x2: pts[1].x, y2: pts[1].y, color: colour, w: lineW })
        else drawOp(ctx, { kind: 'angle', pts, color: colour, w: lineW })
      }
      ctx.globalCompositeOperation = 'source-over'
      return
    }
    if (!d.active) return
    if (d.active !== 'pan' && e.buttons === 0 && e.pointerType !== 'touch') {
      // Stylus hover after a missed pointerup: commit the shape now,
      // otherwise the ghost preview follows the hovering pen and
      // "moves" lines that were already drawn.
      onUp(e)
      return
    }
    if (d.active === 'pan') {
      setOffset({ x: d.start.ox + (e.clientX - d.start.x), y: d.start.oy + (e.clientY - d.start.y) })
      return
    }
    if (d.active === 'move') {
      const p = toWorld(e)
      const dx = p.x - d.last.x, dy = p.y - d.last.y
      translateOp(d.moveTarget, dx, dy)
      d.moveAcc.x += dx; d.moveAcc.y += dy
      d.last = p
      redraw()
      return
    }
    if (d.active === 'resize') {
      const p = toWorld(e)
      const dx = p.x - d.last.x, dy = p.y - d.last.y
      d.moveTarget.w = Math.max(4 * 40, d.moveTarget.w + dx)
      d.moveTarget.h = Math.max(4 * 40, d.moveTarget.h + dy)
      d.moveAcc.x += dx; d.moveAcc.y += dy
      d.last = p
      redraw()
      return
    }
    if (d.active === 'inst') {
      const p = toWorld(e)
      const [name, part] = d.inst
      const I = { ...instRef.current[name] }
      if (part === 'body') {
        const dx = p.x - d.last.x, dy = p.y - d.last.y
        if (name === 'comp') { I.cx += dx; I.cy += dy } else { I.x += dx; I.y += dy }
        d.last = p
      } else if (part === 'rot') {
        if (name === 'ruler') I.rot = Math.atan2(p.y - I.y, p.x - I.x)
        if (name === 'prot') I.rot = Math.atan2(p.x - I.x, -(p.y - I.y)) * -1
      } else if (part === 'radius') {
        I.r = Math.max(20, Math.hypot(p.x - I.cx, p.y - I.cy))
        I.ha = Math.atan2(p.y - I.cy, p.x - I.cx)
      } else if (part === 'sweep') {
        const ang = Math.atan2(p.y - I.cy, p.x - I.cx)
        let delta = ang - d.sweep.last
        while (delta > Math.PI) delta -= 2 * Math.PI
        while (delta < -Math.PI) delta += 2 * Math.PI
        d.sweep.aCur += delta
        d.sweep.last = ang
        I.ha = d.sweep.aCur
        sendInst('comp', I, false)
        // ghost the arc being swept
        const cv = canvasRef.current, ctx = cv.getContext('2d')
        const { zoom: z, offset: o } = viewRef.current
        ctx.setTransform(z, 0, 0, z, o.x, o.y)
        drawOp(ctx, { kind: 'arc', cx: I.cx, cy: I.cy, r: I.r, a0: d.sweep.a0, a1: d.sweep.aCur, color: colour, w: lineW })
        ctx.globalCompositeOperation = 'source-over'
        return
      } else if (part === 'len') {
        const rot = I.rot || 0
        const lx = (p.x - I.x) * Math.cos(-rot) - (p.y - I.y) * Math.sin(-rot)
        I.len = Math.min(30 * 40, Math.max(2 * 40, lx))
      }
      sendInst(name, I, false)
      return
    }
    let p = toWorld(e)
    if (d.active === 'pen' || d.active === 'line') p = rulerSnap(p)
    const cv = canvasRef.current, ctx = cv.getContext('2d')
    const { zoom: z, offset: o } = viewRef.current
    if (d.active === 'pen' || d.active === 'eraser') {
      // Incremental segment onto the ink layer, composite to screen;
      // flushed to peers in chunks.
      const ink = inkRef.current
      if (ink) {
        const ictx = ink.getContext('2d')
        ictx.setTransform(z, 0, 0, z, o.x, o.y)
        drawOp(ictx, { kind: 'stroke', tool: d.active, color: colour, w: lineW, pts: [d.pts[d.pts.length - 1], p] })
        ictx.globalCompositeOperation = 'source-over'
        composite()
      }
      d.pts.push(p)
      if (d.pts.length >= 24) {
        sendOpLive({ kind: 'stroke', tool: d.active, color: colour, w: lineW, pts: d.pts })
        d.pts = [p]
      }
    } else {
      // Shape preview: full redraw, then ghost the shape on screen only.
      // Shift snaps lines and arrows to 15-degree steps, and a live
      // length label (in grid squares) rides the drag for measuring.
      const p2 = (e.shiftKey && (d.active === 'line' || d.active === 'arrow')) ? snap15(d.start, p) : p
      redraw()
      ctx.setTransform(z, 0, 0, z, o.x, o.y)
      drawOp(ctx, { kind: d.active, x1: d.start.x, y1: d.start.y, x2: p2.x, y2: p2.y, color: colour, w: lineW })
      if (d.active === 'line' || d.active === 'arrow') {
        const lenUnits = Math.hypot(p2.x - d.start.x, p2.y - d.start.y) / 40
        ctx.font = '12px Arial, sans-serif'
        ctx.fillStyle = colour
        ctx.fillText(lenUnits.toFixed(1) + ' u', (d.start.x + p2.x) / 2 + 8, (d.start.y + p2.y) / 2 - 8)
      }
      ctx.globalCompositeOperation = 'source-over'
      d.pts = [p2]
    }
  }

  const onUp = () => {
    const d = drawRef.current
    if (!d.active) return
    if (d.active === 'pan') { d.active = false; return }
    if (d.active === 'inst') {
      const [name, part] = d.inst
      if (part === 'sweep' && d.sweep && Math.abs(d.sweep.aCur - d.sweep.a0) > 0.04) {
        const I = instRef.current.comp
        sendOp({ kind: 'arc', cx: I.cx, cy: I.cy, r: I.r, a0: d.sweep.a0, a1: d.sweep.aCur, color: colour, w: lineW })
      }
      sendInst(name, instRef.current[name], true)
      d.active = false; d.inst = null; d.sweep = null
      return
    }
    if (d.active === 'resize') {
      if (d.moveTarget && (Math.abs(d.moveAcc.x) > 0.5 || Math.abs(d.moveAcc.y) > 0.5)) {
        const op = { kind: 'resize', target: d.moveTarget.id, dw: d.moveAcc.x, dh: d.moveAcc.y, by: myIdRef.current, id: newOpId() }
        opsRef.current.push(op)
        socketRef.current?.emit('board:op', op)
      }
      d.active = false; d.moveTarget = null
      return
    }
    if (d.active === 'move') {
      if (d.moveTarget && (Math.abs(d.moveAcc.x) > 0.5 || Math.abs(d.moveAcc.y) > 0.5)) {
        // One op for the whole drag: everyone's copy jumps to the
        // final spot, late joiners replay it, and undo reverses it.
        const op = { kind: 'move', target: d.moveTarget.id, dx: d.moveAcc.x, dy: d.moveAcc.y, by: myIdRef.current, id: newOpId() }
        opsRef.current.push(op)
        socketRef.current?.emit('board:op', op)
      }
      d.active = false; d.moveTarget = null
      return
    }
    if (d.active === 'pen' || d.active === 'eraser') {
      if (d.pts.length > 1) sendOpLive({ kind: 'stroke', tool: d.active, color: colour, w: lineW, pts: d.pts })
    } else {
      const p = d.pts[d.pts.length - 1] || d.start
      sendOp({ kind: d.active, x1: d.start.x, y1: d.start.y, x2: p.x, y2: p.y, color: colour, w: lineW })
    }
    d.active = false; d.pts = []
  }

  // Microsoft Whiteboard feel: plain scroll pans the infinite canvas
  // in any direction (trackpads pan diagonally); Ctrl/Cmd + scroll
  // zooms about the cursor; pinch on touch devices does both.
  const onWheel = (e) => {
    e.preventDefault()
    if (e.ctrlKey || e.metaKey) {
      const rect = canvasRef.current.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.1 : 0.9
      setZoom(z0 => {
        const z1 = Math.min(4, Math.max(0.25, z0 * factor))
        setOffset(o => ({ x: mx - (mx - o.x) * (z1 / z0), y: my - (my - o.y) * (z1 / z0) }))
        return z1
      })
    } else {
      setOffset(o => ({ x: o.x - e.deltaX, y: o.y - e.deltaY }))
    }
  }

  // Two-finger touch: pan with the midpoint, pinch to zoom.
  const onPointerDownMulti = (e) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointersRef.current.size === 2) {
      // Second finger arrived: cancel any in-progress stroke so a
      // pinch never leaves a stray line.
      drawRef.current.active = false
      drawRef.current.pts = []
      redraw()
    }
  }
  const onPointerMoveMulti = (e) => {
    const pts = pointersRef.current
    if (!pts.has(e.pointerId)) return false
    const prev = pts.get(e.pointerId)
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pts.size !== 2) return false
    const [a, b] = [...pts.values()]
    const prevOther = a.x === e.clientX && a.y === e.clientY ? b : a
    // Pan by this finger's movement (midpoint approximation is fine
    // at classroom scale), zoom by the distance ratio.
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y
    const distNow = Math.hypot(a.x - b.x, a.y - b.y)
    const distPrev = Math.hypot(prev.x - prevOther.x, prev.y - prevOther.y)
    setOffset(o => ({ x: o.x + dx / 2, y: o.y + dy / 2 }))
    if (distPrev > 0 && Math.abs(distNow - distPrev) > 2) {
      const rect = canvasRef.current.getBoundingClientRect()
      const mx = (a.x + b.x) / 2 - rect.left, my = (a.y + b.y) / 2 - rect.top
      const factor = distNow / distPrev
      setZoom(z0 => {
        const z1 = Math.min(4, Math.max(0.25, z0 * factor))
        setOffset(o => ({ x: mx - (mx - o.x) * (z1 / z0), y: my - (my - o.y) * (z1 / z0) }))
        return z1
      })
    }
    return true
  }
  const onPointerEnd = (e) => { pointersRef.current.delete(e.pointerId) }

  // ═══ CONTROLS ══════════════════════════════════════════════
  const ensureLiveTrack = async (kind) => {
    const eng = engineRef.current
    if (!eng) return false
    const existing = eng.localStream.getTracks().find(t => t.kind === kind)
    if (existing && existing.readyState === 'live') return true
    // Track missing or ended (device unplugged, another app grabbed
    // it, or it was stopped): get a fresh one and swap it in live.
    try {
      const fresh = await navigator.mediaDevices.getUserMedia(
        kind === 'video'
          ? { video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 20 } } }
          : { audio: { echoCancellation: true, noiseSuppression: true } }
      )
      const track = fresh.getTracks()[0]
      if (existing) eng.localStream.removeTrack(existing)
      if (kind === 'video') {
        await eng.replaceVideoTrack(track)
      } else {
        eng.localStream.addTrack(track)
        for (const { pc } of eng.peers.values()) {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'audio')
          if (sender) await sender.replaceTrack(track).catch(() => {})
          else pc.addTrack(track, eng.localStream)
        }
      }
      setLocalStream(eng.localStream)
      return true
    } catch (e) {
      console.error('[media] could not re-acquire ' + kind, e)
      setMediaNote('Could not turn the ' + (kind === 'video' ? 'camera' : 'microphone') + ' back on — press Enable camera and mic, or check that no other app is using it.')
      return false
    }
  }

  const toggleMic = async () => {
    const next = !micOn
    if (next && !(await ensureLiveTrack('audio'))) return
    setMicOn(next)
    engineRef.current?.setTrackEnabled('audio', next)
    socketRef.current?.emit('state', { micOn: next })
  }
  const toggleCam = async () => {
    const next = !camOn
    if (next && !(await ensureLiveTrack('video'))) return
    setCamOn(next)
    engineRef.current?.setTrackEnabled('video', next)
    socketRef.current?.emit('state', { camOn: next })
  }
  const toggleHand = () => {
    const next = !handUp
    setHandUp(next)
    socketRef.current?.emit('state', { hand: next })
  }
  const toggleBoardLock = () => {
    const next = !boardLocked
    setBoardLocked(next)
    sendOpLive({ kind: 'lock', locked: next })
  }
  const clearBoard = () => {
    if (!window.confirm('Clear the whiteboard for everyone?')) return
    socketRef.current?.emit('board:clear')
  }
  const sendChat = () => {
    const t = chatInput.trim()
    if (!t) return
    socketRef.current?.emit('chat:msg', t)
    setChatInput('')
  }
  const leave = () => { onLeave ? onLeave() : window.history.back() }

  // ═══ SCREEN SHARE (teacher) ════════════════════════════════
  const stopShare = useCallback(async () => {
    const screenTrack = localStream?.getVideoTracks()[0]
    if (screenTrack && screenTrack !== camTrackRef.current) screenTrack.stop()
    // Tear down the shared system-audio track and its senders.
    if (screenAudioTrackRef.current) {
      try { localStream?.removeTrack(screenAudioTrackRef.current) } catch (e) { /* ok */ }
      try { screenAudioTrackRef.current.stop() } catch (e) { /* already stopped */ }
      engineRef.current?.removeSenders(screenAudioSendersRef.current, screenAudioTrackRef.current)
      screenAudioSendersRef.current = []
      screenAudioTrackRef.current = null
    }
    setShareHasAudio(false)
    await engineRef.current?.replaceVideoTrack(camTrackRef.current || null)
    camTrackRef.current = null
    setSharing(false)
    setMainView('board')
    socketRef.current?.emit('state', { sharing: false })
  }, [localStream])

  const startShare = async () => {
    try {
      // Request system/tab audio too, so that when the teacher shares
      // a screen playing a video, students hear it. audio:true asks
      // the browser to include it; the teacher ticks "Share tab audio"
      // (Chrome/Edge) or "Share system audio" in the picker. If they
      // decline or the browser can't, we simply share video only.
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 15 } },
        audio: {
          echoCancellation: false,   // it is media playback, not a mic
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      const screenTrack = display.getVideoTracks()[0]
      const screenAudio = display.getAudioTracks()[0] || null
      camTrackRef.current = localStream?.getVideoTracks()[0] || null
      await engineRef.current?.replaceVideoTrack(screenTrack)

      // Send the captured system audio as a SECOND audio track,
      // separate from the mic, so both reach students at once. We
      // attach it to the SAME stream as the mic/camera (localStream),
      // so on the student side it arrives grouped with the teacher's
      // existing audio and the audio rail plays it with no extra
      // wiring, rather than as an orphan stream with no <audio> bound.
      if (screenAudio) {
        try { screenAudio._isScreenAudio = true } catch (e) { /* ok */ }
        screenAudioTrackRef.current = screenAudio
        screenAudioSendersRef.current = engineRef.current?.addExtraTrack(screenAudio, engineRef.current.localStream) || []
        localStream?.addTrack(screenAudio)   // keep localStream coherent for self-view logic
        // If the tab/system audio track ends on its own, clean it up.
        screenAudio.onended = () => {
          try { localStream?.removeTrack(screenAudio) } catch (e) { /* ok */ }
          engineRef.current?.removeSenders(screenAudioSendersRef.current, screenAudioTrackRef.current)
          screenAudioSendersRef.current = []
          screenAudioTrackRef.current = null
        }
      }
      setShareHasAudio(!!screenAudio)
      if (!screenAudio) {
        setMediaNote('Sharing video sound? Stop sharing and start again, and tick "Share tab audio" (Chrome or Edge) or "Share system audio" in the picker so students hear it.')
        setTimeout(() => setMediaNote(''), 9000)
      }

      screenTrack.onended = () => stopShare()   // browser "Stop sharing" bar
      setSharing(true)
      setMainView('screen')
      socketRef.current?.emit('state', { sharing: true })
    } catch (e) { /* user cancelled the picker */ }
  }

  // Students auto-switch to the presentation when the teacher shares.
  const sharingPeer = roster.find(p => p.sharing && p.socketId !== socketRef.current?.id)
  useEffect(() => {
    if (sharingPeer) setMainView('screen')
    else if (!sharing) setMainView('board')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!sharingPeer])

  // ═══ LOBBY ═════════════════════════════════════════════════
  // The permission prompt only fires from these click handlers — a
  // real user gesture — which is what makes browsers show it
  // reliably, including on phones.
  const [lobbyErr, setLobbyErr] = useState('')
  const lobbyEnable = async () => {
    setLobbyErr('')
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 20 } },
      })
      lobbyStreamRef.current = s
      setLobbyPreview(s)
      setLobbyStatus('granted')
    } catch (e1) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true })
        lobbyStreamRef.current = s
        setLobbyStatus('audio')
        setLobbyErr(diagnoseMediaError(e1, true))
      } catch (e2) {
        setLobbyStatus('denied')
        setLobbyErr(diagnoseMediaError(e2, false))
      }
    }
  }
  const lobbyJoin = () => {
    // The Join click is a user gesture, so we can take the whole
    // screen right here — browser tabs and address bar disappear.
    // Best effort: iPhones do not allow it for pages; everyone else
    // gets a true full-screen classroom. Esc or Exit full leaves.
    try { rootRef.current?.requestFullscreen?.().catch(() => {}) } catch (e) { /* unsupported */ }
    setJoinNonce(n => n + 1)
    setPhase('connecting')
  }

  // ═══ MEDIA RETRY ═══════════════════════════════════════════
  // Browsers never let a site force camera/mic access, but if the
  // person joined as a viewer we can re-prompt on a click (a user
  // gesture) and hot-add the tracks into every live connection —
  // perfect negotiation renegotiates automatically, no rejoin needed.
  const retryMedia = async () => {
    try {
      const fresh = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 20 } },
      }).catch(() => navigator.mediaDevices.getUserMedia({ audio: true }))
      const eng = engineRef.current
      if (!eng || !fresh) return
      for (const track of fresh.getTracks()) {
        if (!eng.localStream.getTracks().some(t => t.kind === track.kind)) {
          eng.localStream.addTrack(track)
          for (const { pc } of eng.peers.values()) pc.addTrack(track, eng.localStream)
        }
      }
      const hasVideo = eng.localStream.getVideoTracks().length > 0
      const hasAudio = eng.localStream.getAudioTracks().length > 0
      setMicOn(hasAudio); setCamOn(hasVideo)
      socketRef.current?.emit('state', { micOn: hasAudio, camOn: hasVideo })
      setMediaNote(hasVideo ? '' : 'Camera still unavailable — you are on audio only.')
      setLocalStream(eng.localStream)
    } catch (e) {
      setMediaNote('Your browser is blocking the camera and microphone. Click the lock/camera icon in the address bar, set Camera and Microphone to Allow for smartioushomeschool.com, then press Enable again.')
    }
  }

  // ═══ LESSON RECORDING (teacher) ════════════════════════════
  // Client-side capture: a 1280x720 compositor canvas repaints the
  // board (or the shared screen while presenting) ~10 times a second,
  // and a Web Audio graph mixes the teacher's mic with every
  // student's audio. MediaRecorder emits 5-second WebM chunks that
  // upload as they are produced (a sequential chain keeps byte
  // order), so an hour-long lesson never sits in browser memory.
  const startRecording = async () => {
    try {
      const { data } = await api.post('/classroom/' + liveClassId + '/recording/start')
      if (!data?.success) throw new Error(data?.message || 'start failed')
      const recId = data.data.recId

      const comp = document.createElement('canvas')
      comp.width = 1280; comp.height = 720
      const cctx = comp.getContext('2d')

      // Hidden video element mirrors whichever screen is presenting.
      const videoEl = document.createElement('video')
      videoEl.muted = true; videoEl.playsInline = true

      const paint = () => {
        cctx.fillStyle = themeRef.current.board
        cctx.fillRect(0, 0, comp.width, comp.height)
        const screenStream = sharing ? localStream
          : (() => { const sp = roster.find(x => x.sharing); return sp ? streams[sp.socketId] : null })()
        if (screenStream && screenStream.getVideoTracks().length) {
          if (videoEl.srcObject !== screenStream) { videoEl.srcObject = screenStream; videoEl.play().catch(() => {}) }
          if (videoEl.videoWidth) {
            const s = Math.min(comp.width / videoEl.videoWidth, comp.height / videoEl.videoHeight)
            const w = videoEl.videoWidth * s, h = videoEl.videoHeight * s
            cctx.drawImage(videoEl, (comp.width - w) / 2, (comp.height - h) / 2, w, h)
          }
        } else if (canvasRef.current) {
          const bc = canvasRef.current
          const s = Math.min(comp.width / bc.width, comp.height / bc.height)
          cctx.drawImage(bc, 0, 0, bc.width * s, bc.height * s)
        }
        rec.rafId = requestAnimationFrame(paint)
      }

      // Audio mix: teacher mic + all remote audio, present and future.
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const dest = audioCtx.createMediaStreamDestination()
      const connected = new Set()
      const connect = (stream) => {
        if (!stream || connected.has(stream) || !stream.getAudioTracks().length) return
        try { audioCtx.createMediaStreamSource(stream).connect(dest); connected.add(stream) } catch (e) { /* noop */ }
      }
      connect(localStream)
      Object.values(streams).forEach(connect)

      const mixed = new MediaStream([
        ...comp.captureStream(10).getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ])
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus' : 'video/webm'
      const recorder = new MediaRecorder(mixed, {
        mimeType: mime, videoBitsPerSecond: 700000, audioBitsPerSecond: 64000,
      })

      const rec = { recorder, recId, audioCtx, rafId: 0, uploadChain: Promise.resolve(), videoEl, connect }
      recRef.current = rec

      recorder.ondataavailable = (ev) => {
        if (!ev.data || !ev.data.size) return
        rec.uploadChain = rec.uploadChain.then(() =>
          ev.data.arrayBuffer().then(buf =>
            api.post('/classroom/' + liveClassId + '/recording/' + recId + '/chunk', buf, {
              headers: { 'Content-Type': 'application/octet-stream' },
            })
          )
        ).catch(e => console.error('[rec upload]', e))
      }
      recorder.onstop = async () => {
        cancelAnimationFrame(rec.rafId)
        try { await rec.uploadChain } catch (e) { /* logged above */ }
        try { audioCtx.close() } catch (e) { /* noop */ }
        try {
          const { data: fin } = await api.post('/classroom/' + liveClassId + '/recording/' + recId + '/finish')
          if (fin?.success && !fin.data?.discarded) window.alert('Recording saved. Students can watch it from the class card.')
        } catch (e) { window.alert('The recording could not be saved.') }
      }

      recorder.start(5000)
      paint()
      setRecording(true)
      setRecSecs(0)
    } catch (e) {
      console.error('[recording]', e)
      window.alert('Could not start recording: ' + (e.message || 'unknown error'))
    }
  }

  const stopRecording = () => {
    const rec = recRef.current
    if (!rec) return
    recRef.current = null
    try { rec.recorder.stop() } catch (e) { /* noop */ }
    setRecording(false)
  }

  // Students joining mid-recording get their audio added to the mix.
  useEffect(() => {
    const rec = recRef.current
    if (rec && recording) Object.values(streams).forEach(rec.connect)
  }, [streams, recording])

  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setRecSecs(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [recording])

  // Leaving the page ends the recording cleanly.
  useEffect(() => () => { if (recRef.current) stopRecording() }, [])

  // ═══ PUSH CONTENT TO BOARD (teacher) ═══════════════════════
  // Places the image at the centre of the teacher's current view in
  // world coordinates, so it lands where they are looking.
  const placeImageOp = (dataUrl, natW, natH) => {
    const cv = canvasRef.current
    const { zoom: z, offset: o } = viewRef.current
    const worldW = 520
    const worldH = worldW * (natH / natW)
    const cx = ((cv?.width || 900) / 2 - o.x) / z
    const cy = ((cv?.height || 500) / 2 - o.y) / z
    sendOp({
      kind: 'image', id: 'img-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      x1: cx - worldW / 2, y1: cy - worldH / 2, w: worldW, h: worldH, src: dataUrl,
    })
  }

  // Compress any picture to <=1280px JPEG so the op stays socket-sized.
  const onPickImage = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, 1280 / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      placeImageOp(c.toDataURL('image/jpeg', 0.8), c.width, c.height)
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  // ═══ RENDER ════════════════════════════════════════════════
  if (phase === 'lobby') {
    const isTeacherGuess = ['teacher', 'admin'].includes(user?.role)
    return (
      <div ref={rootRef} style={{ position: 'fixed', inset: 0, background: T.app, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, fontFamily: 'Inter, Arial, sans-serif', padding: 16 }}>
        <div style={{ background: T.panel, border: '1px solid ' + T.border, borderRadius: 16, width: '100%', maxWidth: 420, padding: '26px 26px 22px', textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#7D1025,#C9A030)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 19, margin: '0 auto 14px' }}>S</div>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 17 }}>Smartious Classroom</div>
          <div style={{ color: T.sub, fontSize: 12.5, marginTop: 4, marginBottom: 18 }}>
            {isTeacherGuess ? 'Get your camera and microphone ready, then start the class.' : 'Get ready, then join your class.'}
          </div>

          <div style={{ width: '100%', aspectRatio: '16 / 10', background: themeId === 'dark' ? '#080C14' : 'rgba(0,0,0,.06)', borderRadius: 12, overflow: 'hidden', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {lobbyPreview ? (
              <LobbyPreview stream={lobbyPreview} />
            ) : (
              <div style={{ color: T.sub, fontSize: 12.5, padding: 20, lineHeight: 1.6 }}>
                {lobbyErr
                  ? lobbyErr
                  : lobbyStatus === 'audio'
                  ? 'Microphone ready. Camera unavailable — you can join with audio.'
                  : 'Your camera preview appears here.'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lobbyStatus !== 'granted' && (
              <Btn onClick={lobbyEnable}
                style={{ width: '100%', padding: '12px 0', fontSize: 13.5, background: '#C9A030', color: '#7D1025', fontWeight: 800 }}>
                {lobbyStatus === 'denied' ? 'Try camera and mic again' : 'Enable camera and microphone'}
              </Btn>
            )}
            <Btn onClick={lobbyJoin}
              style={{ width: '100%', padding: '12px 0', fontSize: 13.5, background: '#7D1025', color: '#fff', fontWeight: 800 }}>
              {lobbyStatus === 'granted' || lobbyStatus === 'audio'
                ? (isTeacherGuess ? 'Start the class' : 'Join the class')
                : (isTeacherGuess ? 'Start without camera' : 'Join as a viewer')}
            </Btn>
            <Btn onClick={leave} style={{ width: '100%', padding: '10px 0', fontSize: 12.5 }}>Back</Btn>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'error') return (
    <div style={{ position: 'fixed', inset: 0, background: '#0B0F17', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 500 }}>
      <div style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>Could not join the classroom</div>
      <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, maxWidth: 360, textAlign: 'center', lineHeight: 1.6 }}>{errMsg}</div>
      <Btn onClick={leave} style={{ background: '#C9A030', color: '#7D1025', fontWeight: 800 }}>Go back</Btn>
    </div>
  )

  const others = roster.filter(p => p.socketId !== socketRef.current?.id)

  // Chrome palette is fixed near-black per the design; the THEME
  // switcher now recolours the BOARD only (white by default).
  const C = { bg: '#0A0A0E', card: '#141419', pill: '#1D1D25', border: 'rgba(255,255,255,.08)',
              text: '#FFFFFF', sub: 'rgba(255,255,255,.55)', gold: '#F2C230' }

  const featured = (isTeacher ? { self: true } : null)
    || (() => { const t = others.find(x => x.role === 'teacher' || x.role === 'admin'); return t ? { peer: t } : { self: true } })()
  const gridPeers = others.filter(p => !(featured.peer && p.socketId === featured.peer.socketId))

  const IconBtn = ({ icon, onClick, title, active, disabled }) => (
    <button onClick={onClick} title={title} disabled={disabled} style={{
      background: active ? 'rgba(242,194,48,.18)' : 'transparent', border: 'none', borderRadius: 8,
      width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer', color: active ? C.gold : '#4B4B55', opacity: disabled ? .35 : 1,
    }}><Ic d={ICONS[icon]} size={17} /></button>
  )


  const toolPill = (isTeacher || canDraw) && mainView === 'board' && (
    <div style={{
      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 6,
      background: C.pill, borderRadius: 14, padding: '10px 7px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 4, boxShadow: '0 8px 28px rgba(0,0,0,.45)',
    }}>
      {[['select', 'Select and move a drawing or diagram'], ['pen', 'Pen'], ['eraser', 'Eraser'], ['line', 'Line (Shift snaps the angle)'], ['arrow', 'Arrow'], ['rect', 'Rectangle'], ['circle', 'Circle'], ['tri', 'Triangle'], ['poly', 'Polygon: click the corners, click the first point or press Enter to close'], ['angle', 'Angle: click a point, the vertex, then a second point'], ['text', 'Text'], ['hand', 'Move the board']].map(([t, l]) => {
        const id = t === 'hand' ? 'pan' : t
        return (
          <button key={t} onClick={() => setTool(id)} title={l} style={{
            background: tool === id ? 'rgba(242,194,48,.22)' : 'transparent', border: 'none', borderRadius: 9,
            width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: tool === id ? C.gold : 'rgba(255,255,255,.8)',
          }}><Ic d={ICONS[t]} size={17} /></button>
        )
      })}
      <div style={{ width: 22, height: 1, background: 'rgba(255,255,255,.12)', margin: '3px 0' }} />
      <button onClick={() => setSwatchOpen(o => !o)} title="Pen colour" style={{
        width: 22, height: 22, borderRadius: '50%', background: colour, border: '2.5px solid rgba(255,255,255,.25)', cursor: 'pointer',
      }} />
      {swatchOpen && (
        <div style={{
          position: 'absolute', left: 52, bottom: 0, background: C.pill, borderRadius: 12, padding: 10,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, boxShadow: '0 8px 28px rgba(0,0,0,.5)',
        }}>
          {PEN_COLOURS.map(c => (
            <div key={c} onClick={() => { setColour(c); setSwatchOpen(false) }}
              style={{ width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer',
                border: colour === c ? '2px solid ' + C.gold : '1.5px solid rgba(255,255,255,.25)', boxSizing: 'border-box' }} />
          ))}
          <input type="color" value={colour} onChange={e => setColour(e.target.value)} title="Custom"
            style={{ gridColumn: 'span 4', width: '100%', height: 24, border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer' }} />
          <input type="range" min="1" max="10" value={lineW} onChange={e => setLineW(+e.target.value)}
            title="Pen size" style={{ gridColumn: 'span 4', width: '100%' }} />
        </div>
      )}
    </div>
  )

  const boardHeader = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,.07)' }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: '#2A2A2E', marginRight: 'auto' }}>
        {mainView === 'sim' && openSim ? openSim.title
          : mainView === 'screen' ? (sharing ? 'Your screen' : (sharingPeer?.name || 'Teacher') + "'s screen")
          : 'Whiteboard'}
      </span>
      {openSim && (
        <button onClick={() => setMainView(v => v === 'board' ? 'sim' : 'board')} style={{
          background: 'rgba(242,194,48,.15)', color: '#8a6a00', border: 'none', borderRadius: 7,
          fontSize: 11.5, fontWeight: 700, padding: '5px 12px', cursor: 'pointer', marginRight: 6,
        }}>{mainView === 'sim' ? 'View board' : 'View practical'}</button>
      )}
      {(sharing || sharingPeer) && (
        <button onClick={() => setMainView(v => v === 'board' ? 'screen' : 'board')} style={{
          background: 'rgba(242,194,48,.15)', color: '#8a6a00', border: 'none', borderRadius: 7,
          fontSize: 11.5, fontWeight: 700, padding: '5px 12px', cursor: 'pointer', marginRight: 6,
        }}>{mainView === 'board' ? 'View screen' : 'View board'}</button>
      )}
      <IconBtn icon="view" title={focus ? 'Exit the full board' : 'Maximise the board: hide videos, chat, and controls'} active={focus}
        onClick={() => setFocus(f => !f)} />
      {canDraw && <IconBtn icon="undo" title="Undo my last mark" onClick={doUndo} />}
      {isTeacher && (<>
        <div style={{ position: 'relative' }}>
          <IconBtn icon="shapes" title="Insert a teaching diagram" active={diagOpen}
            onClick={() => setDiagOpen(o => !o)} />
          {diagOpen && (
            <div style={{ position: 'absolute', top: 38, right: 0, background: '#1D1D25', borderRadius: 12, padding: 6, zIndex: 40, boxShadow: '0 10px 32px rgba(0,0,0,.5)', minWidth: 180 }}>
              {DIAGRAMS.map(([id, label]) => (
                <button key={id}
                  onClick={() => {
                    setDiagOpen(false)
                    const cv = canvasRef.current
                    const { zoom: z, offset: o } = viewRef.current
                    sendOp({
                      kind: 'diagram', name: id,
                      x1: ((cv?.width || 900) / 2 - o.x) / z,
                      y1: ((cv?.height || 500) / 2 - o.y) / z,
                      color: colour, w: Math.max(2, lineW),
                    })
                  }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#fff', fontSize: 12.5, fontWeight: 600, padding: '8px 11px', borderRadius: 8, cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <IconBtn icon="ruler" title="Ruler: drag to move, gold handle rotates, pen snaps to its edge" active={!!instRef.current.ruler?.visible}
          onClick={() => {
            const cur = instRef.current.ruler
            if (cur && cur.visible) sendInst('ruler', null, true)
            else {
              const cv = canvasRef.current, { zoom: z, offset: o } = viewRef.current
              sendInst('ruler', { visible: true, rot: 0, len: 10 * 40,
                x: ((cv?.width || 900) / 2 - o.x) / z - 200, y: ((cv?.height || 500) / 2 - o.y) / z }, true)
            }
          }} />
        <IconBtn icon="prot" title="Protractor: drag to move, blue handle rotates" active={!!instRef.current.prot?.visible}
          onClick={() => {
            const cur = instRef.current.prot
            if (cur && cur.visible) sendInst('prot', null, true)
            else {
              const cv = canvasRef.current, { zoom: z, offset: o } = viewRef.current
              sendInst('prot', { visible: true, rot: 0,
                x: ((cv?.width || 900) / 2 - o.x) / z, y: ((cv?.height || 500) / 2 - o.y) / z }, true)
            }
          }} />
        <IconBtn icon="comp" title="Compass: drag anywhere on it to move; drag the pencil to open the legs; tap DRAW to lower the pencil, then sweep it to ink an arc" active={!!instRef.current.comp?.visible}
          onClick={() => {
            const cur = instRef.current.comp
            if (cur && cur.visible) sendInst('comp', null, true)
            else {
              const cv = canvasRef.current, { zoom: z, offset: o } = viewRef.current
              sendInst('comp', { visible: true, r: 2 * 40, ha: -0.6, draw: false,
                cx: ((cv?.width || 900) / 2 - o.x) / z, cy: ((cv?.height || 500) / 2 - o.y) / z }, true)
            }
          }} />
        <IconBtn icon="grid" title="Lay a graph-paper sheet on the board (move it with Select, stretch it by its corner)"
          onClick={() => {
            const cv = canvasRef.current, { zoom: z, offset: o } = viewRef.current
            const cx = ((cv?.width || 900) / 2 - o.x) / z, cy = ((cv?.height || 500) / 2 - o.y) / z
            sendOp({ kind: 'gsheet', x1: cx - 6 * 40, y1: cy - 5 * 40, w: 12 * 40, h: 10 * 40 })
          }} />
        <IconBtn icon="image" title="Put a picture on the board" onClick={() => imgInputRef.current?.click()} />
        <IconBtn icon="book" title="Put a Library page on the board" onClick={() => setShowLibPicker(true)} />
        <IconBtn icon="flask" title="Open a practical simulation for the class" active={!!openSim}
          onClick={() => openSim
            ? (setOpenSim(null), setMainView('board'), sendOpLive({ kind: 'sim', simId: null }))
            : setShowSimPicker(true)} />
        <IconBtn icon={boardLocked ? 'lockC' : 'lockO'} active={!boardLocked}
          title={boardLocked ? 'Students cannot draw. Click to allow.' : 'Students can draw. Click to lock.'}
          onClick={toggleBoardLock} />
        <IconBtn icon="trash" title="Clear the board for everyone" onClick={clearBoard} />
      </>)}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 8, background: 'rgba(0,0,0,.05)', borderRadius: 8, padding: '2px 4px' }}>
        <button onClick={() => zoomBy(0.9)} title="Zoom out" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: '#4B4B55', width: 24 }}>-</button>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#4B4B55', minWidth: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => zoomBy(1.1)} title="Zoom in" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 15, color: '#4B4B55', width: 24 }}>+</button>
      </div>
      <input ref={imgInputRef} type="file" accept="image/*" onChange={onPickImage} style={{ display: 'none' }} />
    </div>
  )

  const panelCard = panelOpen && (
    <div style={narrow ? {
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(85vw, 310px)', zIndex: 20,
      background: C.card, display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid ' + C.border, boxShadow: '-14px 0 36px rgba(0,0,0,.55)',
    } : {
      width: 300, background: C.card, display: 'flex', flexDirection: 'column',
      borderRadius: 16, overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid ' + C.border }}>
        <span style={{ color: C.text, fontWeight: 800, fontSize: 14.5, flex: 1 }}>
          {panel === 'chat' ? 'Chat' : 'Participants (' + roster.length + ')'}
        </span>
        <button onClick={() => setPanelOpen(false)} style={{ background: 'transparent', border: 'none', color: C.sub, fontSize: 18, cursor: 'pointer' }}>&times;</button>
      </div>

      {panel === 'chat' && (<>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          {chat.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: m.role === 'teacher' ? '#7D1025' : '#2A3A5C', color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(m.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5 }}>
                  <span style={{ color: m.role === 'teacher' ? C.gold : C.text, fontWeight: 700 }}>{m.name}</span>
                  <span style={{ color: C.sub, marginLeft: 7, fontSize: 10.5 }}>
                    {new Date(m.at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.86)', lineHeight: 1.55, wordBreak: 'break-word', marginTop: 2 }}>{m.text}</div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div style={{ display: 'flex', gap: 7, padding: 12 }}>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendChat() }}
            placeholder="Type a message..."
            style={{ flex: 1, background: 'rgba(255,255,255,.07)', border: 'none', borderRadius: 10, padding: '10px 13px', color: '#fff', fontSize: 12.5, outline: 'none' }} />
          <button onClick={sendChat} title="Send" style={{ background: C.gold, color: '#111', border: 'none', borderRadius: 10, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Ic d={'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z'} size={16} />
          </button>
        </div>
      </>)}

      {panel === 'people' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {roster.map(p => (
            <div key={p.socketId} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: 'rgba(255,255,255,.05)', borderRadius: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: p.role === 'teacher' ? '#7D1025' : '#2A3A5C', color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {(p.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.text, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}{p.socketId === socketRef.current?.id ? ' (you)' : ''}
                </div>
                <div style={{ color: C.sub, fontSize: 10.5 }}>{p.role}</div>
              </div>
              {p.hand && <span style={{ color: C.gold }}><Ic d={ICONS.raise} size={15} /></span>}
              {p.micOn === false && <span style={{ color: '#F87171' }}><Ic d={ICONS.micOff} size={15} /></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const tiles = (
    <>
      {(featured.self || featured.peer) && (
        featured.self
          ? <Tile big stream={localStream} name={user?.firstName ? user.firstName + ' ' + (user.lastName || '') : 'You'} role={myRole} self micOn={micOn} camOn={camOn} hand={handUp} />
          : <Tile big stream={streams[featured.peer.socketId]} name={featured.peer.name} role={featured.peer.role}
              micOn={featured.peer.micOn} camOn={featured.peer.camOn} hand={featured.peer.hand} quality={quality[featured.peer.socketId]} />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {!featured.self && (
          <Tile stream={localStream} name={'You'} role={myRole} self micOn={micOn} camOn={camOn} hand={handUp} />
        )}
        {gridPeers.map(p => (
          <Tile key={p.socketId} stream={streams[p.socketId]} name={p.name} role={p.role}
            micOn={p.micOn} camOn={p.camOn} hand={p.hand} quality={quality[p.socketId]} />
        ))}
      </div>
    </>
  )

  return (
    <div ref={rootRef} style={{ position: 'fixed', inset: 0, background: C.bg, display: 'flex', flexDirection: 'column', zIndex: 500, fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Audio rail lives at the ROOT of the classroom, mounted for the
          whole session and NEVER inside a conditional layout branch. The
          video column unmounts in focus mode and on narrow screens, so an
          audio element placed there is destroyed the moment the teacher
          maximises the whiteboard, which silenced every student. Mounted
          here, sound survives every view switch and fullscreen toggle. */}
      <AudioRail streams={streams} />

      {/* ── Top bar (hidden in focus mode) ── */}
      {!focus && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SmartiousCrest size={32} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>
              Smart<em style={{ fontStyle: 'italic', color: '#C9973A', fontWeight: 500 }}>ious</em>
            </div>
            {!narrow && (
              <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '.16em', color: 'rgba(247,243,237,.45)', textTransform: 'uppercase', marginTop: 1 }}>
                Live Classroom
              </div>
            )}
          </div>
        </div>
        <div style={{ width: 1, height: 22, background: C.border }} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: C.text, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {(classInfo.subject ? classInfo.subject + ' \u2013 ' : '') + (classInfo.title || 'Classroom')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.sub, fontSize: 12.5, flexShrink: 0 }}>
            <Ic d={ICONS.people} size={14} /> {roster.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.text, fontSize: 13.5, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: recording ? '#EF4444' : phase === 'live' ? '#22C55E' : '#B45309' }} />
            {recording
              ? String(Math.floor(recSecs / 3600)).padStart(2, '0') + ':' + String(Math.floor(recSecs / 60) % 60).padStart(2, '0') + ':' + String(recSecs % 60).padStart(2, '0')
              : mm + ':' + ss}
          </span>
          <button onClick={toggleFull} title={isFull ? 'Exit full screen' : 'Full screen'} style={{
            display: 'flex', alignItems: 'center', gap: 7, background: C.card, color: C.text, border: '1px solid ' + C.border,
            borderRadius: 10, padding: '7px 13px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}><Ic d={ICONS.view} size={14} /> View</button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMoreOpen(o => !o)} title="More" style={{
              background: C.card, color: C.text, border: '1px solid ' + C.border, borderRadius: 10,
              width: 36, height: 33, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}><Ic d={ICONS.dots} size={16} /></button>
            {moreOpen && (
              <div style={{ position: 'absolute', right: 0, top: 40, background: C.pill, borderRadius: 12, padding: 6, zIndex: 40, boxShadow: '0 10px 32px rgba(0,0,0,.55)', minWidth: 190 }}>
                {isTeacher && (
                  <button onClick={() => { setMoreOpen(false); recording ? stopRecording() : startRecording() }} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', background: 'transparent', border: 'none', color: recording ? '#F87171' : C.text, fontSize: 12.5, fontWeight: 600, padding: '9px 11px', borderRadius: 8, cursor: 'pointer' }}>
                    <Ic d={ICONS.record} size={15} /> {recording ? 'Stop recording' : 'Record the lesson'}
                  </button>
                )}
                <button onClick={() => { setMoreOpen(false); cycleTheme() }} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', background: 'transparent', border: 'none', color: C.text, fontSize: 12.5, fontWeight: 600, padding: '9px 11px', borderRadius: 8, cursor: 'pointer' }}>
                  <Ic d={ICONS.grid} size={15} /> Board style: {T.name}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {mediaNote && (
        <div style={{ background: '#78350F', color: '#FDE68A', fontSize: 12, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ flex: 1, minWidth: 200 }}>{mediaNote}</span>
          <Btn onClick={retryMedia} style={{ background: C.gold, color: '#111', fontWeight: 800, padding: '6px 14px' }}>
            Enable camera and mic
          </Btn>
        </div>
      )}
      {reconnecting && phase === 'live' && (
        <div style={{ background: '#7C2D12', color: '#FED7AA', fontSize: 12, padding: '7px 16px', fontWeight: 700 }}>
          Connection lost — reconnecting automatically...
        </div>
      )}

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative', gap: 10, padding: focus ? 0 : '2px 10px 10px' }}>

        {/* Video column (desktop) */}
        {!narrow && !focus && (
          <div style={{ width: 268, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tiles}
          </div>
        )}

        {/* Board / presentation card */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {narrow && !tilesHidden && !focus && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', alignItems: 'center', flexShrink: 0 }}>
              <Btn onClick={() => setTilesHidden(true)} style={{ padding: '4px 8px', fontSize: 10.5, flexShrink: 0 }}>Hide</Btn>
              <div style={{ width: 108, flexShrink: 0 }}>
                <Tile small stream={localStream} name={'You'} role={myRole} self micOn={micOn} camOn={camOn} hand={handUp} />
              </div>
              {others.map(p => (
                <div key={p.socketId} style={{ width: 108, flexShrink: 0 }}>
                  <Tile small stream={streams[p.socketId]} name={p.name} role={p.role}
                    micOn={p.micOn} camOn={p.camOn} hand={p.hand} quality={quality[p.socketId]} />
                </div>
              ))}
            </div>
          )}
          {narrow && tilesHidden && !focus && (
            <Btn onClick={() => setTilesHidden(false)} style={{ padding: '4px 12px', fontSize: 11, alignSelf: 'center' }}>
              Show videos ({roster.length})
            </Btn>
          )}

          <div style={{ flex: 1, minHeight: 0, background: '#FFFFFF', borderRadius: focus ? 0 : 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: focus ? 'none' : '0 10px 34px rgba(0,0,0,.35)' }}>
            {boardHeader}
            <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
            {openBook && mainView === 'board' && (
              <BookReader
                book={openBook}
                canControl={isTeacher}
                onPage={(pg) => { setOpenBook(b => b && { ...b, page: pg }); sendOpLive({ kind: 'book', bookId: openBook.id, title: openBook.title, page: pg }) }}
                onClose={() => { setOpenBook(null); sendOpLive({ kind: 'book', bookId: null }) }}
                onStamp={(dataUrl, w, h) => placeImageOp(dataUrl, w, h)}
              />
            )}
            <div ref={wrapRef} style={{ flex: 1, position: 'relative', minHeight: 0, background: T.board }}>
              {toolPill}
              {mainView === 'screen' && (sharing || sharingPeer) && (
                <ScreenView stream={sharing ? localStream : streams[sharingPeer?.socketId]} muted={sharing} />
              )}
              {mainView === 'sim' && openSim && (
                <SimPanel sim={openSim} />
              )}
              <canvas ref={canvasRef}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture?.(e.pointerId)
                  onPointerDownMulti(e)
                  if (pointersRef.current.size < 2) onDown(e)
                }}
                onPointerMove={(e) => { if (!onPointerMoveMulti(e) || pointersRef.current.size < 2) onMove(e) }}
                onPointerUp={(e) => { onPointerEnd(e); onUp(e) }}
                onPointerCancel={(e) => { onPointerEnd(e); onUp(e) }}
                onPointerLeave={(e) => { onPointerEnd(e); onUp(e) }}
                onWheel={onWheel}
                style={{ display: 'block', cursor: tool === 'pan' || !canDraw ? 'grab' : tool === 'select' ? 'default' : 'crosshair', touchAction: 'none',
                  visibility: mainView === 'screen' ? 'hidden' : 'visible' }} />
              {!canDraw && mainView === 'board' && (
                <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.5)', color: 'rgba(255,255,255,.85)', fontSize: 11.5, padding: '5px 14px', borderRadius: 99 }}>
                  View only — the teacher controls the board
                </div>
              )}
            </div>
            </div>
          </div>
        </div>

        {!focus && panelCard}
      </div>

      {showSimPicker && (
        <SimPicker
          onClose={() => setShowSimPicker(false)}
          onPick={(sim) => {
            setShowSimPicker(false)
            setOpenSim(sim)
            setMainView('sim')
            sendOpLive({ kind: 'sim', simId: sim.id, title: sim.title, url: sim.url || null })
          }}
        />
      )}
      {showLibPicker && (
        <LibraryPagePicker
          onClose={() => setShowLibPicker(false)}
          onOpenBook={(b) => {
            const nb = { id: b._id, title: b.title || 'Coursebook', page: 1 }
            setOpenBook(nb)
            sendOpLive({ kind: 'book', bookId: nb.id, title: nb.title, page: 1 })
            setShowLibPicker(false)
          }}
        />
      )}

      {/* ── Bottom control bar (hidden in focus; mini pill instead) ── */}
      {focus && (
        <div style={{ position: 'fixed', bottom: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', alignItems: 'center', gap: 4, background: '#1D1D25', borderRadius: 99, padding: '6px 10px', boxShadow: '0 10px 30px rgba(0,0,0,.5)' }}>
          <button onClick={toggleMic} title={micOn ? 'Mute' : 'Unmute'} style={{ background: 'transparent', border: 'none', color: micOn ? 'rgba(255,255,255,.85)' : '#F87171', cursor: 'pointer', padding: 7, display: 'flex' }}>
            <Ic d={ICONS[micOn ? 'mic' : 'micOff']} size={17} />
          </button>
          <button onClick={toggleCam} title={camOn ? 'Stop video' : 'Start video'} style={{ background: 'transparent', border: 'none', color: camOn ? 'rgba(255,255,255,.85)' : '#F87171', cursor: 'pointer', padding: 7, display: 'flex' }}>
            <Ic d={ICONS[camOn ? 'cam' : 'camOff']} size={17} />
          </button>
          <button onClick={() => setFocus(false)} title="Exit the full board" style={{ background: '#F2C230', border: 'none', color: '#111', cursor: 'pointer', padding: '7px 14px', borderRadius: 99, fontSize: 11.5, fontWeight: 800 }}>
            Exit board
          </button>
        </div>
      )}
      {!focus && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: narrow ? 0 : 6, padding: '8px 10px 12px', flexWrap: 'wrap' }}>
        <CtlBtn icon={micOn ? 'mic' : 'micOff'} label={micOn ? 'Mute' : 'Unmute'} danger={!micOn} onClick={toggleMic} />
        <CtlBtn icon={camOn ? 'cam' : 'camOff'} label={camOn ? 'Stop Video' : 'Start Video'} danger={!camOn} onClick={toggleCam} />
        {isTeacher && <CtlBtn icon="share" label={sharing ? 'Stop Share' : 'Share Screen'} active={sharing} onClick={sharing ? stopShare : startShare} />}
        <CtlBtn icon="pen" label="Whiteboard" active={mainView === 'board'} onClick={() => setMainView('board')} />
        {!isTeacher && <CtlBtn icon="raise" label={handUp ? 'Lower Hand' : 'Raise Hand'} active={handUp} onClick={toggleHand} />}
        <CtlBtn icon="chat" label="Chat" active={panelOpen && panel === 'chat'}
          onClick={() => { setPanel('chat'); setPanelOpen(o => !(o && panel === 'chat')) }} />
        <CtlBtn icon="people" label="Participants" badge={roster.length} active={panelOpen && panel === 'people'}
          onClick={() => { setPanel('people'); setPanelOpen(o => !(o && panel === 'people')) }} />
        <button onClick={leave} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: '#E23A3A', color: '#fff', border: 'none',
          borderRadius: 12, padding: '11px 22px', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', marginLeft: narrow ? 6 : 16,
        }}><Ic d={ICONS.phone} size={16} /> Leave</button>
      </div>
      )}
    </div>
  )
}

// ── Full-pane presentation surface ─────────────────────────
function ScreenView({ stream, muted }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream }, [stream])
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
      {stream ? (
        <video ref={ref} autoPlay playsInline muted
          style={{ maxWidth: '100%', maxHeight: '100%' }} />
      ) : (
        <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>Waiting for the shared screen...</div>
      )}
    </div>
  )
}

// ── Library book picker (teacher) ──────────────────────────
// Search the Library and open a coursebook INSIDE the classroom —
// it appears split-screen beside the whiteboard on every student's
// screen, with the teacher turning the pages for the whole class.
function LibraryPagePicker({ onClose, onOpenBook }) {
  const [q, setQ] = useState('')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    const t = setTimeout(() => {
      api.get('/library', { params: q.trim() ? { q: q.trim() } : {} })
        .then(({ data }) => { if (alive) setBooks(data?.data?.books || []) })
        .catch(() => { if (alive) setErr('Could not load the Library.') })
        .finally(() => { if (alive) setLoading(false) })
    }, 300)
    return () => { alive = false; clearTimeout(t) }
  }, [q])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#141419', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <SmartiousCrest size={24} />
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, flex: 1 }}>Open a coursebook in class</div>
          <Btn onClick={onClose} style={{ padding: '5px 10px' }}>Close</Btn>
        </div>
        <div style={{ padding: '12px 18px' }}>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search books by title or subject"
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 12.5, outline: 'none' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {loading ? (
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12.5, padding: 16, textAlign: 'center' }}>Loading...</div>
          ) : err ? (
            <div style={{ color: '#F87171', fontSize: 12.5, padding: 16, textAlign: 'center' }}>{err}</div>
          ) : books.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12.5, padding: 16, textAlign: 'center' }}>No books found.</div>
          ) : (<>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 10.5, padding: '0 2px 4px' }}>
            {books.length} book{books.length === 1 ? '' : 's'} available
          </div>
          {books.map(b => (
            <div key={b._id} onClick={() => onOpenBook(b)}
              style={{ padding: '10px 12px', borderRadius: 9, cursor: 'pointer', background: 'rgba(255,255,255,.05)' }}>
              <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 700 }}>{b.title}</div>
              <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 10.5, marginTop: 2 }}>
                {[b.subjectName, b.grade, b.curriculum].filter(Boolean).join(' \u00b7 ')}
              </div>
            </div>
          ))}
          </>)}
        </div>
      </div>
    </div>
  )
}

// ── In-class book reader ───────────────────────────────────
// Progressive pdf.js reader (range requests — first page in seconds
// even on 80 MB books) shown beside the whiteboard. The teacher
// turns pages; students follow. "To board" stamps the current page
// onto the whiteboard for annotation.
function BookReader({ book, canControl, onPage, onClose, onStamp }) {
  const canvasRef = useRef(null)
  const docRef = useRef(null)
  const [numPages, setNumPages] = useState(0)
  const [status, setStatus] = useState('Opening book...')
  const renderTaskRef = useRef(null)
  const [pageInput, setPageInput] = useState(String(book.page || 1))
  useEffect(() => { setPageInput(String(book.page || 1)) }, [book.page])
  const jumpTo = () => {
    const n = parseInt(pageInput, 10)
    if (!Number.isFinite(n)) { setPageInput(String(book.page || 1)); return }
    const clamped = Math.min(numPages || 9999, Math.max(1, n))
    if (clamped !== (book.page || 1)) onPage(clamped)
    setPageInput(String(clamped))
  }

  useEffect(() => {
    let dead = false
    ;(async () => {
      try {
        const pdfjsUrl = new URL('/pdfjs/pdf.min.mjs', window.location.origin).href
        const pdfjs = await import(/* @vite-ignore */ pdfjsUrl)
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('/pdfjs/pdf.worker.min.mjs', window.location.origin).href
        const token = localStorage.getItem('sm_token') || ''
        const base = (api?.defaults?.baseURL || '')
        const doc = await pdfjs.getDocument({
          url: base + '/library/' + book.id + '/stream',
          httpHeaders: { Authorization: 'Bearer ' + token },
          rangeChunkSize: 1048576,
        }).promise
        if (dead) { doc.destroy(); return }
        docRef.current = doc
        setNumPages(doc.numPages)
        setStatus('')
      } catch (e) {
        console.error('[book reader]', e)
        if (!dead) setStatus('Could not open this book.')
      }
    })()
    return () => { dead = true; try { docRef.current?.destroy() } catch (e) { /* noop */ } docRef.current = null }
  }, [book.id])

  useEffect(() => {
    const doc = docRef.current
    if (!doc || !numPages) return
    let dead = false
    ;(async () => {
      try {
        try { renderTaskRef.current?.cancel() } catch (e) { /* noop */ }
        const n = Math.min(Math.max(1, book.page || 1), doc.numPages)
        const page = await doc.getPage(n)
        if (dead) return
        const cv = canvasRef.current
        if (!cv) return
        const holder = cv.parentElement
        const scale = Math.min(
          (holder.clientWidth - 8) / page.getViewport({ scale: 1 }).width,
          2
        ) * (window.devicePixelRatio || 1)
        const vp = page.getViewport({ scale: Math.max(scale, 0.5) })
        cv.width = vp.width; cv.height = vp.height
        cv.style.width = (vp.width / (window.devicePixelRatio || 1)) + 'px'
        renderTaskRef.current = page.render({ canvasContext: cv.getContext('2d'), viewport: vp })
        await renderTaskRef.current.promise
      } catch (e) { /* cancelled renders are normal on fast page turns */ }
    })()
    return () => { dead = true }
  }, [book.page, numPages])

  const stamp = () => {
    const cv = canvasRef.current
    if (!cv || !cv.width) return
    onStamp(cv.toDataURL('image/jpeg', 0.82), cv.width, cv.height)
  }

  return (
    <div style={{ flex: '0 0 44%', minWidth: 260, maxWidth: 560, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(0,0,0,.1)', background: '#F4F2ED' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderBottom: '1px solid rgba(0,0,0,.08)' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#2A2A2E', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</span>
        {canControl && (
          <button onClick={stamp} title="Stamp this page onto the whiteboard to annotate it"
            style={{ background: 'rgba(125,16,37,.1)', color: '#7D1025', border: 'none', borderRadius: 7, fontSize: 10.5, fontWeight: 800, padding: '5px 10px', cursor: 'pointer' }}>
            To board
          </button>
        )}
        {canControl && (
          <button onClick={onClose} title="Close the book for everyone"
            style={{ background: 'transparent', border: 'none', color: '#6B6B6B', fontSize: 17, cursor: 'pointer', padding: '0 4px' }}>&times;</button>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 6 }}>
        {status
          ? <div style={{ color: '#6B6B6B', fontSize: 12.5, padding: 24 }}>{status}</div>
          : <canvas ref={canvasRef} style={{ boxShadow: '0 4px 18px rgba(0,0,0,.18)', borderRadius: 4 }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '7px 10px', borderTop: '1px solid rgba(0,0,0,.08)' }}>
        {canControl ? (<>
          <button onClick={() => onPage(Math.max(1, (book.page || 1) - 1))} disabled={(book.page || 1) <= 1}
            style={{ background: 'rgba(0,0,0,.06)', border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer', color: '#2A2A2E' }}>Prev</button>
          <input
            type="number" min="1" max={numPages || undefined}
            value={pageInput}
            onChange={e => setPageInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') jumpTo() }}
            onBlur={jumpTo}
            title="Type a page number and press Enter"
            style={{ width: 52, textAlign: 'center', background: '#fff', border: '1px solid rgba(0,0,0,.15)', borderRadius: 7, padding: '5px 4px', fontSize: 12, fontWeight: 800, color: '#2A2A2E', outline: 'none' }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#4B4B55' }}>
            {numPages ? '/ ' + numPages : ''}
          </span>
          <button onClick={() => onPage(Math.min(numPages || 9999, (book.page || 1) + 1))} disabled={numPages > 0 && (book.page || 1) >= numPages}
            style={{ background: 'rgba(0,0,0,.06)', border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer', color: '#2A2A2E' }}>Next</button>
        </>) : (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#4B4B55' }}>
            Page {book.page || 1}{numPages ? ' / ' + numPages : ''} — the teacher turns the pages
          </span>
        )}
      </div>
    </div>
  )
}

// Mirrored self-preview for the lobby.
function LobbyPreview({ stream }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream }, [stream])
  return <video ref={ref} autoPlay playsInline muted
    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
}

// ── Practical simulation surface ───────────────────────────
// PhET sims run in an iframe; Smartious-native sims render directly.
// Every participant interacts with their OWN copy (hands-on), and a
// teacher demonstrating should Share Screen so all eyes and the
// lesson recording follow the same instance.
function SimPanel({ sim }) {
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setLoaded(false); setSlow(false)
    const t = setTimeout(() => setSlow(true), 12000)
    return () => clearTimeout(t)
  }, [sim.url, attempt])

  if (sim.id === 'sm:vernier') return <VernierSim />
  if (sim.id === 'sm:foodtests') return <FoodTestSim />
  if (sim.id === 'sm:titration') return <TitrationSim />
  if (sim.id === 'sm:electric') return <CircuitLab />
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <iframe key={attempt} src={sim.url} title={sim.title} allowFullScreen
          onLoad={() => setLoaded(true)}
          style={{ border: 'none', width: '100%', height: '100%' }} />
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, background: '#FBFAF5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, textAlign: 'center' }}>
            <SmartiousCrest size={38} />
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#2A2A2E' }}>Loading {sim.title}...</div>
            <div style={{ width: 160, height: 4, background: 'rgba(0,0,0,.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: '40%', height: '100%', background: '#C9973A', borderRadius: 99, animation: 'smSlide 1.2s ease-in-out infinite alternate' }} />
            </div>
            <style>{'@keyframes smSlide { from { margin-left: 0 } to { margin-left: 60% } }'}</style>
            {slow && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ fontSize: 11.5, color: '#8A8A82', maxWidth: 320, lineHeight: 1.5 }}>
                  Simulations are a one-off download of a few megabytes — on a slow connection the first open can take a minute. It caches for next time.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setAttempt(a => a + 1)}
                    style={{ background: '#7D1025', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                    Retry
                  </button>
                  <a href={sim.url} target="_blank" rel="noopener noreferrer"
                    style={{ background: 'rgba(125,16,37,.08)', color: '#7D1025', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, textDecoration: 'none' }}>
                    Open in a new tab
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ fontSize: 10, color: '#8A8A92', padding: '3px 10px', background: '#F4F2ED' }}>
        Interactive simulation by PhET, University of Colorado Boulder — each person controls their own copy.
      </div>
    </div>
  )
}

function SimPicker({ onClose, onPick }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#141419', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <SmartiousCrest size={24} />
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, flex: 1 }}>Open a practical for the class</div>
          <Btn onClick={onClose} style={{ padding: '5px 10px' }}>Close</Btn>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 18px 16px' }}>
          {SIM_CATALOG.map(group => (
            <div key={group.subject} style={{ marginBottom: 14 }}>
              <div style={{ color: '#F2C230', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', margin: '8px 0 6px' }}>
                {group.subject}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {group.sims.map(s => (
                  <div key={s.id} onClick={() => onPick(s)}
                    style={{ padding: '9px 11px', borderRadius: 9, cursor: 'pointer', background: 'rgba(255,255,255,.05)', color: '#fff', fontSize: 12, fontWeight: 600 }}>
                    {s.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 10.5, marginTop: 4 }}>
            Everyone in the class is taken to the same practical. Each person controls their own copy — Share Screen to demonstrate yours.
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Smartious native sim: vernier calliper reading practice ──
// A randomised object is measured by the calliper; the student reads
// the main scale + vernier coincidence and checks their answer.
// Directly examinable KCSE/IGCSE practical skill.
function VernierSim() {
  const cvRef = useRef(null)
  const [reading, setReading] = useState(() => +(Math.random() * 74 + 13).toFixed(1))
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)   // { ok, text }
  const [showAns, setShowAns] = useState(false)
  const [tries, setTries] = useState(0)

  useEffect(() => {
    const cv = cvRef.current
    if (!cv) return
    const wrap = cv.parentElement
    const W = Math.min(wrap.clientWidth - 20, 760)
    cv.width = W * (window.devicePixelRatio || 1)
    cv.height = 240 * (window.devicePixelRatio || 1)
    cv.style.width = W + 'px'; cv.style.height = '240px'
    const ctx = cv.getContext('2d')
    ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0)
    const mmPx = (W - 50) / 100
    const x0 = 25, yMain = 95
    ctx.clearRect(0, 0, W, 240)
    // frame beam
    ctx.fillStyle = '#E8E4DA'
    ctx.fillRect(x0 - 12, yMain - 40, 100 * mmPx + 40, 44)
    ctx.strokeStyle = '#8B857A'; ctx.lineWidth = 1.2
    ctx.strokeRect(x0 - 12, yMain - 40, 100 * mmPx + 40, 44)
    // main scale ticks (mm), cm labels
    ctx.fillStyle = '#2A2A2E'; ctx.font = '11px Arial'
    for (let mm = 0; mm <= 100; mm++) {
      const x = x0 + mm * mmPx
      const tall = mm % 10 === 0 ? 16 : mm % 5 === 0 ? 11 : 7
      ctx.beginPath(); ctx.moveTo(x, yMain); ctx.lineTo(x, yMain - tall)
      ctx.strokeStyle = '#2A2A2E'; ctx.lineWidth = mm % 10 === 0 ? 1.4 : 0.8; ctx.stroke()
      if (mm % 10 === 0) ctx.fillText(String(mm / 10), x - 3, yMain - 22)
    }
    ctx.font = '10px Arial'; ctx.fillStyle = '#6B6B6B'
    ctx.fillText('cm', x0 + 100 * mmPx + 14, yMain - 22)
    // fixed jaw
    ctx.fillStyle = '#5A6470'
    ctx.fillRect(x0 - 6, yMain, 6, 90)
    // object being measured
    const jawX = x0 + reading * mmPx
    ctx.fillStyle = '#B8552F'
    ctx.fillRect(x0, yMain + 22, reading * mmPx, 46)
    ctx.strokeStyle = '#7D3A1E'; ctx.strokeRect(x0, yMain + 22, reading * mmPx, 46)
    // moving jaw + vernier scale (10 divisions across 9 mm)
    ctx.fillStyle = '#5A6470'
    ctx.fillRect(jawX, yMain, 4, 90)
    ctx.fillStyle = '#EFEAE0'
    ctx.fillRect(jawX, yMain, 9 * mmPx + 14, 26)
    ctx.strokeStyle = '#8B857A'; ctx.strokeRect(jawX, yMain, 9 * mmPx + 14, 26)
    ctx.fillStyle = '#7D1025'; ctx.font = '10px Arial'
    for (let v = 0; v <= 10; v++) {
      const x = jawX + v * 0.9 * mmPx
      ctx.beginPath(); ctx.moveTo(x, yMain); ctx.lineTo(x, yMain + (v % 5 === 0 ? 13 : 9))
      ctx.strokeStyle = '#7D1025'; ctx.lineWidth = 0.9; ctx.stroke()
      if (v % 5 === 0) ctx.fillText(String(v), x - 2, yMain + 24)
    }
    if (showAns) {
      ctx.fillStyle = '#15803D'; ctx.font = 'bold 13px Arial'
      const cm = Math.floor(reading / 10)
      const mmPart = Math.floor(reading % 10)
      const vern = Math.round((reading * 10) % 10)
      ctx.fillText('Reading: ' + (reading / 10).toFixed(2) + ' cm   (' + cm + ' cm + ' + mmPart + ' mm on the main scale, vernier line ' + vern + ' coincides)', x0, 215)
    }
  }, [reading, showAns])

  const check = () => {
    const val = parseFloat(answer)
    if (!Number.isFinite(val)) { setFeedback({ ok: false, text: 'Type your reading in cm, e.g. 3.47' }); return }
    const correct = +(reading / 10).toFixed(2)
    if (Math.abs(val - correct) < 0.005) {
      setFeedback({ ok: true, text: 'Correct: ' + correct.toFixed(2) + ' cm. Well read.' })
      setShowAns(true)
    } else if (Math.abs(val - correct) <= 0.01) {
      setFeedback({ ok: false, text: 'Almost — check the vernier coincidence line again.' })
      setTries(t => t + 1)
    } else {
      setFeedback({ ok: false, text: 'Not yet. Main scale first (whole mm before the vernier zero), then the coinciding vernier line adds the decimal.' })
      setTries(t => t + 1)
    }
  }
  const next = () => {
    setReading(+(Math.random() * 74 + 13).toFixed(1))
    setAnswer(''); setFeedback(null); setShowAns(false); setTries(0)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FBFAF5', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '14px 10px' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#2A2A2E', marginBottom: 2 }}>Vernier callipers — read the measurement</div>
      <div style={{ fontSize: 11.5, color: '#6B6B6B', marginBottom: 8 }}>Main scale in cm and mm; the vernier gives the extra 0.01 cm. Answer in cm to 2 decimal places.</div>
      <canvas ref={cvRef} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <input value={answer} onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') check() }}
          placeholder="e.g. 3.47" inputMode="decimal"
          style={{ width: 110, textAlign: 'center', border: '1.5px solid #C9C2B0', borderRadius: 9, padding: '9px 10px', fontSize: 14, fontWeight: 700, outline: 'none' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#4B4B55' }}>cm</span>
        <button onClick={check} style={{ background: '#7D1025', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>Check</button>
        <button onClick={next} style={{ background: 'rgba(125,16,37,.08)', color: '#7D1025', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>New object</button>
        {tries >= 2 && !showAns && (
          <button onClick={() => setShowAns(true)} style={{ background: 'transparent', color: '#B45309', border: '1px solid #E8D58F', borderRadius: 9, padding: '10px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Show answer</button>
        )}
      </div>
      {feedback && (
        <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 700, color: feedback.ok ? '#15803D' : '#B45309' }}>{feedback.text}</div>
      )}
    </div>
  )
}

// ── Smartious native sim: KCSE food tests ──────────────────
// Pick a sample and a test, follow the REAL procedure (Benedict's
// only reacts when heated; the emulsion test needs ethanol then
// water), watch the colour change, and record results. Investigation
// mode serves an unknown sample to identify.
const FT_SAMPLES = {
  starch:  { name: 'Starch solution', has: { starch: true,  sugar: false, protein: false, lipid: false }, base: '#EDEAE2' },
  glucose: { name: 'Glucose solution', has: { starch: false, sugar: true,  protein: false, lipid: false }, base: '#F2F0EA' },
  albumen: { name: 'Egg albumen',      has: { starch: false, sugar: false, protein: true,  lipid: false }, base: '#F5F2E4' },
  oil:     { name: 'Cooking oil',      has: { starch: false, sugar: false, protein: false, lipid: true  }, base: '#F2D98A' },
  milk:    { name: 'Milk',             has: { starch: false, sugar: true,  protein: true,  lipid: true  }, base: '#FDFDF8' },
}
const FT_TESTS = {
  iodine:   { name: 'Iodine test (starch)',            reagent: 'iodine solution', needsHeat: false, needsWater: false },
  benedict: { name: 'Benedict\u2019s test (reducing sugar)', reagent: 'Benedict\u2019s solution', needsHeat: true,  needsWater: false },
  biuret:   { name: 'Biuret test (protein)',           reagent: 'NaOH then CuSO\u2084', needsHeat: false, needsWater: false },
  emulsion: { name: 'Emulsion test (lipids)',          reagent: 'ethanol', needsHeat: false, needsWater: true },
}

function ftOutcome(sampleKey, testKey, heated, watered) {
  const s = FT_SAMPLES[sampleKey].has
  if (testKey === 'iodine')
    return s.starch
      ? { colour: '#1E2A4A', text: 'Blue-black colour: starch PRESENT.', positive: true }
      : { colour: '#B8742D', text: 'Stays yellow-brown: starch absent.', positive: false }
  if (testKey === 'benedict') {
    if (!heated) return { colour: '#3B7DD8', text: 'Still blue — Benedict\u2019s must be HEATED in a water bath before it reacts.', positive: null }
    return s.sugar
      ? { colour: '#B4451F', text: 'Brick-red/orange precipitate on heating: reducing sugar PRESENT.', positive: true }
      : { colour: '#3B7DD8', text: 'Remains blue after heating: reducing sugar absent.', positive: false }
  }
  if (testKey === 'biuret')
    return s.protein
      ? { colour: '#6D4A9E', text: 'Purple/violet colour: protein PRESENT.', positive: true }
      : { colour: '#78A8DC', text: 'Remains pale blue: protein absent.', positive: false }
  if (testKey === 'emulsion') {
    if (!watered) return { colour: '#EFEDE6', text: 'Ethanol added — now ADD WATER and shake to complete the emulsion test.', positive: null }
    return s.lipid
      ? { colour: '#F2F1EC', text: 'Cloudy white emulsion forms: lipid PRESENT.', positive: true, cloudy: true }
      : { colour: '#E8E6DE', text: 'No emulsion — mixture stays clear: lipid absent.', positive: false }
  }
}

function FoodTestSim() {
  const [mode, setMode] = useState('practice')     // practice | unknown
  const [sample, setSample] = useState('starch')
  const [unknownKey] = useState(() => Object.keys(FT_SAMPLES)[Math.floor(Math.random() * 5)])
  const [unknownNonce, setUnknownNonce] = useState(0)
  const unknownRef = useRef(unknownKey)
  const [test, setTest] = useState('iodine')
  const [stage, setStage] = useState('ready')      // ready | added | done
  const [heated, setHeated] = useState(false)
  const [watered, setWatered] = useState(false)
  const [result, setResult] = useState(null)
  const [log, setLog] = useState([])
  const [guess, setGuess] = useState({ starch: false, sugar: false, protein: false, lipid: false })
  const [verdict, setVerdict] = useState(null)

  const activeSample = mode === 'unknown' ? unknownRef.current : sample
  const T = FT_TESTS[test]

  const reset = (keep) => {
    setStage('ready'); setHeated(false); setWatered(false); setResult(null)
    if (!keep) setVerdict(null)
  }
  const newUnknown = () => {
    unknownRef.current = Object.keys(FT_SAMPLES)[Math.floor(Math.random() * 5)]
    setUnknownNonce(n => n + 1)
    setLog([]); setGuess({ starch: false, sugar: false, protein: false, lipid: false }); setVerdict(null)
    reset()
  }

  const addReagent = () => {
    setStage('added')
    const o = ftOutcome(activeSample, test, false, false)
    setResult(o)
    if (!T.needsHeat && !T.needsWater) {
      setStage('done')
      setLog(l => [...l.filter(e => e.test !== test), { test, text: o.text }])
    }
  }
  const heat = () => {
    setHeated(true)
    const o = ftOutcome(activeSample, test, true, watered)
    setResult(o); setStage('done')
    setLog(l => [...l.filter(e => e.test !== test), { test, text: o.text }])
  }
  const addWater = () => {
    setWatered(true)
    const o = ftOutcome(activeSample, test, heated, true)
    setResult(o); setStage('done')
    setLog(l => [...l.filter(e => e.test !== test), { test, text: o.text }])
  }
  const checkUnknown = () => {
    const truth = FT_SAMPLES[unknownRef.current].has
    const keys = ['starch', 'sugar', 'protein', 'lipid']
    const wrong = keys.filter(k => !!guess[k] !== !!truth[k])
    setVerdict(wrong.length === 0
      ? { ok: true, text: 'Correct! The sample was ' + FT_SAMPLES[unknownRef.current].name.toLowerCase() + '.' }
      : { ok: false, text: 'Not quite — ' + wrong.length + ' nutrient(s) wrong. Run more tests and check your table.' })
  }

  const liquid = result ? result.colour : FT_SAMPLES[activeSample].base
  const cloudy = result && result.cloudy

  const btn = (label, onClick, primary, disabled) => (
    <button onClick={onClick} disabled={disabled} style={{
      background: primary ? '#7D1025' : 'rgba(125,16,37,.08)', color: primary ? '#fff' : '#7D1025',
      border: 'none', borderRadius: 9, padding: '9px 14px', fontSize: 12, fontWeight: 800,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .4 : 1,
    }}>{label}</button>
  )

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FBFAF5', zIndex: 2, display: 'flex', overflowY: 'auto' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 12px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#2A2A2E' }}>Food tests</div>
        <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
          {btn('Practice', () => { setMode('practice'); setLog([]); reset() }, mode === 'practice')}
          {btn('Identify an unknown', () => { setMode('unknown'); newUnknown() }, mode === 'unknown')}
        </div>

        {mode === 'practice' ? (
          <select value={sample} onChange={e => { setSample(e.target.value); setLog([]); reset() }}
            style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #C9C2B0', fontSize: 12.5, fontWeight: 700 }}>
            {Object.entries(FT_SAMPLES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        ) : (
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#7D1025' }}>Unknown sample X{unknownNonce + 1} — test it, then identify its nutrients</div>
        )}

        {/* Test tube */}
        <div style={{ position: 'relative', width: 74, height: 190, margin: '16px 0 8px' }}>
          <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(90,90,100,.55)', borderTop: 'none', borderRadius: '0 0 37px 37px', background: 'rgba(255,255,255,.35)' }} />
          <div style={{
            position: 'absolute', left: 5, right: 5, bottom: 5, height: 120,
            borderRadius: '0 0 32px 32px', background: liquid, transition: 'background .9s',
            backgroundImage: cloudy ? 'radial-gradient(circle at 30% 40%, rgba(255,255,255,.9) 2px, transparent 3px), radial-gradient(circle at 70% 60%, rgba(255,255,255,.9) 2px, transparent 3px), radial-gradient(circle at 50% 75%, rgba(255,255,255,.9) 2px, transparent 3px)' : 'none',
            backgroundSize: cloudy ? '16px 16px, 20px 20px, 14px 14px' : 'auto',
          }} />
          {heated && (
            <div style={{ position: 'absolute', left: -22, bottom: -6, fontSize: 11, color: '#B45309', fontWeight: 800, transform: 'rotate(-90deg)', transformOrigin: 'left' }}>WATER BATH</div>
          )}
        </div>

        <select value={test} onChange={e => { setTest(e.target.value); reset(true) }}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #C9C2B0', fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
          {Object.entries(FT_TESTS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
        </select>

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
          {btn('Add ' + T.reagent, addReagent, true, stage !== 'ready')}
          {T.needsHeat && btn('Heat in water bath', heat, false, stage !== 'added' || heated)}
          {T.needsWater && btn('Add water and shake', addWater, false, stage !== 'added' || watered)}
          {btn('Rinse the tube', () => reset(true), false, stage === 'ready')}
        </div>

        {result && (
          <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 700, maxWidth: 420, textAlign: 'center',
            color: result.positive === true ? '#15803D' : result.positive === false ? '#4B4B55' : '#B45309' }}>
            {result.text}
          </div>
        )}
      </div>

      {/* Results table */}
      <div style={{ width: 250, flexShrink: 0, borderLeft: '1px solid rgba(0,0,0,.08)', background: '#F4F2ED', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#2A2A2E' }}>Recorded observations</div>
        {log.length === 0 && <div style={{ fontSize: 11.5, color: '#8A8A82' }}>Complete a test and its result records here.</div>}
        {log.map(e => (
          <div key={e.test} style={{ fontSize: 11, color: '#4B4B55', background: '#fff', borderRadius: 8, padding: '7px 9px' }}>
            <strong style={{ color: '#7D1025' }}>{FT_TESTS[e.test].name}:</strong> {e.text}
          </div>
        ))}
        {mode === 'unknown' && (<>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#2A2A2E', marginTop: 6 }}>The unknown contains:</div>
          {[['starch', 'Starch'], ['sugar', 'Reducing sugar'], ['protein', 'Protein'], ['lipid', 'Lipid']].map(([k, l]) => (
            <label key={k} style={{ fontSize: 12, color: '#4B4B55', display: 'flex', gap: 7, alignItems: 'center' }}>
              <input type="checkbox" checked={guess[k]} onChange={e => setGuess(g => ({ ...g, [k]: e.target.checked }))} />
              {l}
            </label>
          ))}
          <div style={{ display: 'flex', gap: 6 }}>
            {btn('Check', checkUnknown, true)}
            {btn('New unknown', newUnknown, false)}
          </div>
          {verdict && (
            <div style={{ fontSize: 12, fontWeight: 800, color: verdict.ok ? '#15803D' : '#B45309' }}>{verdict.text}</div>
          )}
        </>)}
      </div>
    </div>
  )
}

// ── Smartious native sim: acid-base titration (KCSE Paper 3) ──
// Solution B (0.100 M NaOH, 25.0 cm3, phenolphthalein) in the flask;
// solution A (HCl of unknown molarity) in the burette. The student
// runs the tap, drops near the endpoint, reads the burette to 0.05,
// records three titres, averages the consistent ones, and computes
// the molarity — the complete practical, marked as the paper would.
function TitrationSim() {
  // The unknown for this session
  const [M] = useState(() => +(0.08 + Math.random() * 0.06).toFixed(3))
  const endpointBase = 2.5 / M   // cm3 of A to neutralise 25.0 of 0.1M B

  const [run, setRun] = useState(1)              // 1..3
  const [r0] = useState(() => [0, 1, 2].map(() => +(Math.random() * 1.5).toFixed(2)))
  const [jitter] = useState(() => [0, 1, 2].map(() => +((Math.random() - 0.5) * 0.1).toFixed(2)))
  const [disp, setDisp] = useState(0)            // cm3 dispensed this run
  const [rows, setRows] = useState([{}, {}, {}]) // { init, fin, titre, ok }
  const [phase, setPhase] = useState('titrate')  // titrate | record | calc | done
  const [calcAns, setCalcAns] = useState('')
  const [calcFb, setCalcFb] = useState(null)
  const runInt = useRef(null)

  const idx = run - 1
  const endpoint = endpointBase + jitter[idx]
  const reading = r0[idx] + disp
  const past = disp - endpoint
  const overshot = past > 0.25

  // Flask colour: pink in base, fades over the last 0.5 cm3, then clear
  const flaskColour = past >= 0 ? '#F4F2E9'
    : past > -0.5 ? `rgba(242,107,175,${(-past / 0.5) * 0.85 + 0.1})`
    : '#F26BAF'

  const dispense = (amt) => setDisp(d => Math.min(48 - r0[idx], +(d + amt).toFixed(2)))
  const startTap = () => {
    if (runInt.current) return
    runInt.current = setInterval(() => dispense(0.25), 100)
  }
  const stopTap = () => { clearInterval(runInt.current); runInt.current = null }
  useEffect(() => () => clearInterval(runInt.current), [])

  const [initIn, setInitIn] = useState('')
  const [finIn, setFinIn] = useState('')
  const [recFb, setRecFb] = useState(null)

  const recordRun = () => {
    const iv = parseFloat(initIn), fv = parseFloat(finIn)
    if (!Number.isFinite(iv) || !Number.isFinite(fv)) { setRecFb('Enter both burette readings in cm\u00b3.'); return }
    if (Math.abs(iv - r0[idx]) > 0.055) { setRecFb('Check the INITIAL reading again — read the bottom of the meniscus before you opened the tap.'); return }
    if (Math.abs(fv - reading) > 0.055) { setRecFb('Check the FINAL reading — the zoom panel shows the meniscus to 0.05 cm\u00b3.'); return }
    const titre = +(fv - iv).toFixed(2)
    const nr = rows.slice()
    nr[idx] = { init: iv, fin: fv, titre, over: overshot }
    setRows(nr)
    setRecFb(null); setInitIn(''); setFinIn('')
    if (run < 3) { setRun(run + 1); setDisp(0); setPhase('titrate') }
    else setPhase('calc')
  }

  const goodTitres = rows.filter(r => r.titre != null && !r.over)
  const consistent = (() => {
    const t = goodTitres.map(r => r.titre)
    if (t.length < 2) return t
    // keep titres within 0.1 of the median
    const sorted = t.slice().sort((a, b) => a - b)
    const med = sorted[Math.floor(sorted.length / 2)]
    return t.filter(v => Math.abs(v - med) <= 0.1)
  })()
  const avg = consistent.length ? consistent.reduce((a, b) => a + b, 0) / consistent.length : 0

  const checkCalc = () => {
    const val = parseFloat(calcAns)
    if (!Number.isFinite(val)) { setCalcFb({ ok: false, text: 'Enter the molarity of A in mol/dm\u00b3.' }); return }
    const correct = (0.1 * 25.0) / avg
    if (Math.abs(val - correct) < 0.003) {
      setCalcFb({ ok: true, text: 'Correct: M\u2090 = (0.100 \u00d7 25.0) / ' + avg.toFixed(2) + ' = ' + correct.toFixed(3) + ' mol/dm\u00b3. The unknown was ' + M.toFixed(3) + '.' })
      setPhase('done')
    } else {
      setCalcFb({ ok: false, text: 'Not yet. Moles of B = 0.100 \u00d7 25.0/1000; at neutralisation moles A = moles B; divide by your average titre in dm\u00b3.' })
    }
  }

  // Burette geometry: 50 cm3 over 300 px, scale grows downward
  const bTop = 20, bH = 300
  const yOf = (cm3) => bTop + (cm3 / 50) * bH
  const level = yOf(reading)

  const btnS = (label, props, primary) => (
    <button {...props} style={{
      background: primary ? '#7D1025' : 'rgba(125,16,37,.08)', color: primary ? '#fff' : '#7D1025',
      border: 'none', borderRadius: 9, padding: '9px 14px', fontSize: 12, fontWeight: 800,
      cursor: 'pointer', touchAction: 'none', userSelect: 'none', ...(props.style || {}),
    }}>{label}</button>
  )

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FBFAF5', zIndex: 2, display: 'flex', overflowY: 'auto' }}>
      {/* Apparatus */}
      <div style={{ flex: '0 0 46%', minWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', borderRight: '1px solid rgba(0,0,0,.08)' }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#2A2A2E' }}>Titration — run {run} of 3</div>
        <div style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 6, textAlign: 'center' }}>
          Flask: 25.0 cm\u00b3 of 0.100 M NaOH + phenolphthalein. Burette: acid A (unknown M).
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          {/* Burette */}
          <svg width="86" height="380" style={{ flexShrink: 0 }}>
            <rect x="34" y={bTop} width="16" height={bH} fill="#FFFFFF" stroke="#7C828C" strokeWidth="1.6" />
            <rect x="35.5" y={level} width="13" height={bTop + bH - level} fill="#DCE9F7" />
            <line x1="35.5" x2="48.5" y1={level} y2={level} stroke="#3B6FB5" strokeWidth="2" />
            {Array.from({ length: 11 }, (_, i) => (
              <g key={i}>
                <line x1="50" x2="58" y1={yOf(i * 5)} y2={yOf(i * 5)} stroke="#2A2A2E" strokeWidth="1.2" />
                <text x="61" y={yOf(i * 5) + 4} fontSize="9.5" fill="#2A2A2E">{i * 5}</text>
              </g>
            ))}
            {/* tap + tip */}
            <rect x="30" y={bTop + bH} width="24" height="10" fill="#8A8F98" rx="2" />
            <path d={'M40 ' + (bTop + bH + 10) + ' L44 ' + (bTop + bH + 10) + ' L42 ' + (bTop + bH + 28) + ' Z'} fill="#7C828C" />
            {runInt.current && <circle cx="42" cy={bTop + bH + 34} r="2.5" fill="#3B6FB5" />}
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {/* Meniscus zoom */}
            <div style={{ border: '1.5px solid #C9C2B0', borderRadius: 10, background: '#fff', padding: '6px 10px', width: 120 }}>
              <div style={{ fontSize: 9.5, color: '#8A8A82', fontWeight: 700, textAlign: 'center' }}>MENISCUS ZOOM</div>
              <svg width="100" height="96">
                {Array.from({ length: 21 }, (_, i) => {
                  const v = Math.floor(reading * 10) / 10 - 1 + i * 0.1
                  if (v < 0) return null
                  const y = 48 + (v - reading) * 80
                  if (y < 4 || y > 92) return null
                  const major = Math.abs(v * 10 % 10) < 0.01 || Math.abs(v * 10 % 10 - 10) < 0.01
                  return (
                    <g key={i}>
                      <line x1="18" x2={major ? 44 : 32} y1={y} y2={y} stroke="#2A2A2E" strokeWidth={major ? 1.4 : 0.8} />
                      {major && <text x="48" y={y + 3.5} fontSize="10" fill="#2A2A2E">{v.toFixed(0)}</text>}
                    </g>
                  )
                })}
                <path d={'M18 48 Q 40 55 62 48'} fill="none" stroke="#3B6FB5" strokeWidth="2" />
                <rect x="18" y="48" width="44" height="44" fill="rgba(220,233,247,.5)" />
              </svg>
            </div>
            {/* Flask */}
            <svg width="110" height="110">
              <path d="M45 8 h20 v30 l24 52 a8 8 0 0 1 -7 12 h-54 a8 8 0 0 1 -7 -12 l24 -52 z"
                fill="rgba(255,255,255,.5)" stroke="#7C828C" strokeWidth="1.6" />
              <path d="M32 72 l-6 18 a8 8 0 0 0 7 12 h44 a8 8 0 0 0 7 -12 l-6 -18 z"
                fill={flaskColour} style={{ transition: 'fill .5s' }} />
            </svg>
            {overshot && <div style={{ fontSize: 10.5, fontWeight: 800, color: '#B91C1C' }}>OVERSHOT — this titre is rough only</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {btnS('Hold to run tap', { onPointerDown: startTap, onPointerUp: stopTap, onPointerLeave: stopTap, onPointerCancel: stopTap }, true)}
          {btnS('Add one drop (0.05)', { onClick: () => dispense(0.05) })}
          {btnS('Swirl flask', { onClick: () => {} })}
        </div>
      </div>

      {/* Recording + calculation */}
      <div style={{ flex: 1, minWidth: 240, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: '#2A2A2E' }}>Burette readings (cm\u00b3, to 0.05)</div>
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr>
            {['', 'Run 1', 'Run 2', 'Run 3'].map(h => <th key={h} style={{ border: '1px solid #C9C2B0', padding: '5px 9px', background: '#F4F2ED', fontWeight: 800 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {[['Final', 'fin'], ['Initial', 'init'], ['Titre', 'titre']].map(([label, k]) => (
              <tr key={k}>
                <td style={{ border: '1px solid #C9C2B0', padding: '5px 9px', fontWeight: 700 }}>{label}</td>
                {rows.map((r, i) => (
                  <td key={i} style={{ border: '1px solid #C9C2B0', padding: '5px 9px', textAlign: 'center',
                    color: k === 'titre' && r.over ? '#B91C1C' : '#2A2A2E' }}>
                    {r[k] != null ? r[k].toFixed(2) : '\u2014'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {phase !== 'calc' && phase !== 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, background: '#fff', borderRadius: 10, padding: '10px 12px', border: '1px solid #E6E0D2' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#7D1025' }}>Record run {run}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: 11.5 }}>Initial:</label>
              <input value={initIn} onChange={e => setInitIn(e.target.value)} placeholder="0.00" inputMode="decimal"
                style={{ width: 62, textAlign: 'center', border: '1.5px solid #C9C2B0', borderRadius: 8, padding: '7px 6px', fontSize: 12.5, fontWeight: 700 }} />
              <label style={{ fontSize: 11.5 }}>Final:</label>
              <input value={finIn} onChange={e => setFinIn(e.target.value)} placeholder="24.60" inputMode="decimal"
                style={{ width: 62, textAlign: 'center', border: '1.5px solid #C9C2B0', borderRadius: 8, padding: '7px 6px', fontSize: 12.5, fontWeight: 700 }} />
              {btnS('Record titre', { onClick: recordRun }, true)}
            </div>
            {recFb && <div style={{ fontSize: 11.5, fontWeight: 700, color: '#B45309' }}>{recFb}</div>}
            <div style={{ fontSize: 10.5, color: '#8A8A82' }}>
              Tip: run the tap to within ~1 cm\u00b3 of the endpoint, then add single drops until ONE drop turns the pink permanently colourless.
            </div>
          </div>
        )}

        {(phase === 'calc' || phase === 'done') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#fff', borderRadius: 10, padding: '10px 12px', border: '1px solid #E6E0D2' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#7D1025' }}>
              Average of consistent titres: {avg ? avg.toFixed(2) + ' cm\u00b3' : '\u2014'} ({consistent.length} used)
            </div>
            <div style={{ fontSize: 12 }}>Calculate the molarity of acid A (mol/dm\u00b3):</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={calcAns} onChange={e => setCalcAns(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') checkCalc() }}
                placeholder="e.g. 0.104" inputMode="decimal"
                style={{ width: 90, textAlign: 'center', border: '1.5px solid #C9C2B0', borderRadius: 8, padding: '8px 6px', fontSize: 13, fontWeight: 700 }} />
              {btnS('Check', { onClick: checkCalc }, true)}
            </div>
            {calcFb && <div style={{ fontSize: 12, fontWeight: 700, color: calcFb.ok ? '#15803D' : '#B45309' }}>{calcFb.text}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Web Audio sound kit for Smartious Labs ─────────────────
// Synthesised on the fly (no files): switch clicks, a current hum
// that scales with amperage, jockey scrapes, and result tones.
// Context is created lazily on first gesture (browser autoplay rule).
const smAudio = {
  ctx: null,
  get() {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return this.ctx
    } catch (e) { return null }
  },
  blip(freq, dur, type, vol) {
    const ac = this.get(); if (!ac) return
    const o = ac.createOscillator(), g = ac.createGain()
    o.type = type || 'square'; o.frequency.value = freq
    g.gain.setValueAtTime(vol || 0.08, ac.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + (dur || 0.06))
    o.connect(g); g.connect(ac.destination)
    o.start(); o.stop(ac.currentTime + (dur || 0.06) + 0.02)
  },
  click() { this.blip(1400, 0.03, 'square', 0.07); setTimeout(() => this.blip(500, 0.04, 'square', 0.05), 25) },
  scrape() { this.blip(180 + Math.random() * 120, 0.03, 'sawtooth', 0.02) },
  ding() { this.blip(880, 0.16, 'sine', 0.1); setTimeout(() => this.blip(1318, 0.22, 'sine', 0.09), 90) },
  buzz() { this.blip(130, 0.28, 'sawtooth', 0.09) },
  humStart() {
    const ac = this.get(); if (!ac || this._hum) return
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain()
    o1.type = 'sine'; o1.frequency.value = 50
    o2.type = 'triangle'; o2.frequency.value = 100
    g.gain.value = 0
    o1.connect(g); o2.connect(g); g.connect(ac.destination)
    o1.start(); o2.start()
    this._hum = { o1, o2, g }
  },
  humLevel(x) { if (this._hum) this._hum.g.gain.value = Math.min(0.06, x * 0.045) },
  humStop() {
    if (!this._hum) return
    try { this._hum.g.gain.value = 0; this._hum.o1.stop(); this._hum.o2.stop() } catch (e) { /* noop */ }
    this._hum = null
  },
}

// ── Circuit solver: pure nodal analysis with Norton sources ──
// Wires merge terminals into nodes (union-find); every component is
// a conductance between two nodes; each dry cell is a Norton pair
// (current injection E/r + conductance 1/r). One Gaussian solve
// gives every node voltage, hence every reading, brightness, and
// short-circuit — whatever topology the student wires.
function smSolveCircuit(comps, wires) {
  const pr = {}
  const find = (x) => { while (pr[x] !== x) { pr[x] = pr[pr[x]]; x = pr[x] } return x }
  const uni = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) pr[ra] = rb }
  for (const c of comps) { pr[c.id + ':0'] = c.id + ':0'; pr[c.id + ':1'] = c.id + ':1' }
  for (const w of wires) { if (pr[w.a] && pr[w.b]) uni(w.a, w.b) }
  const roots = [...new Set(comps.flatMap(c => [find(c.id + ':0'), find(c.id + ':1')]))]
  const idx = Object.fromEntries(roots.map((r, i) => [r, i]))
  const n = roots.length
  const out = {}
  if (!n) return { out }
  const G = Array.from({ length: n }, () => new Float64Array(n))
  const Inj = new Float64Array(n)
  for (let i = 0; i < n; i++) G[i][i] += 1e-9
  const stamp = (a, b, g) => { G[a][a] += g; G[b][b] += g; G[a][b] -= g; G[b][a] -= g }
  const meta = []
  for (const c of comps) {
    const a = idx[find(c.id + ':0')], b = idx[find(c.id + ':1')]
    if (c.type === 'cell') {
      const r = 0.3, E = 1.5
      stamp(a, b, 1 / r)
      Inj[b] += E / r; Inj[a] -= E / r
      meta.push({ c, a, b, cell: { r, E } })
      continue
    }
    let R = null
    if (c.type === 'resistor') R = c.value
    else if (c.type === 'wirerule') R = Math.max(0.2, (c.k || 0.06) * (c.L || 50))
    else if (c.type === 'bulb') R = 5
    else if (c.type === 'ammeter') R = 0.01
    else if (c.type === 'voltmeter') R = 1e6
    else if (c.type === 'switch') R = c.closed ? 0.01 : null
    if (R != null) { stamp(a, b, 1 / R); meta.push({ c, a, b, R }) }
    else meta.push({ c, a, b, open: true })
  }
  // Solve with node 0 as reference
  const m = n - 1
  const v = new Float64Array(n)
  if (m > 0) {
    const A = Array.from({ length: m }, (_, i) => Float64Array.from(G[i + 1].slice(1)))
    const B = Float64Array.from(Inj.slice(1))
    for (let col = 0; col < m; col++) {
      let piv = col
      for (let r2 = col + 1; r2 < m; r2++) if (Math.abs(A[r2][col]) > Math.abs(A[piv][col])) piv = r2
      if (Math.abs(A[piv][col]) < 1e-12) continue
      ;[A[col], A[piv]] = [A[piv], A[col]]
      ;[B[col], B[piv]] = [B[piv], B[col]]
      for (let r2 = 0; r2 < m; r2++) {
        if (r2 === col) continue
        const f = A[r2][col] / A[col][col]
        if (!f) continue
        for (let c2 = col; c2 < m; c2++) A[r2][c2] -= f * A[col][c2]
        B[r2] -= f * B[col]
      }
    }
    for (let i = 0; i < m; i++) v[i + 1] = Math.abs(A[i][i]) > 1e-12 ? B[i] / A[i][i] : 0
  }
  for (const mt of meta) {
    const vA = v[mt.a], vB = v[mt.b], dV = vA - vB
    let I = 0
    if (mt.cell) I = (mt.cell.E - (vB - vA)) / mt.cell.r     // delivered from + (terminal 1)
    else if (!mt.open) I = dV / mt.R
    out[mt.c.id] = { vA, vB, dV, I }
  }
  return { out }
}

// ── Smartious native sim: circuit builder workbench ────────
// Students drag apparatus from the tray, tap terminal-to-terminal to
// connect, and the live solver animates whatever they build — the
// connection SKILL itself, series and parallel, taught by doing.
const CL_TRAY = [
  ['cell', 'Dry cell 1.5 V'], ['switch', 'Switch'], ['ammeter', 'Ammeter'], ['voltmeter', 'Voltmeter'],
  ['resistor', 'Resistor'], ['bulb', 'Bulb'], ['wirerule', 'Resistance wire on metre rule'],
]
const CL_RVALUES = [1, 2, 4.7, 10, 22]

function CircuitLab() {
  const [comps, setComps] = useState([])
  const [wires, setWires] = useState([])
  const [selTerm, setSelTerm] = useState(null)   // 'id:0'
  const [selComp, setSelComp] = useState(null)
  const nextId = useRef(1)
  const dragRef = useRef(null)

  const solved = smSolveCircuit(comps, wires).out

  // Hum follows total cell current; ding on new challenge completion
  const totalCellI = comps.filter(c => c.type === 'cell')
    .reduce((s, c) => s + Math.max(0, solved[c.id]?.I || 0), 0)
  useEffect(() => {
    if (totalCellI > 0.02) { smAudio.humStart(); smAudio.humLevel(totalCellI / 2) }
    else smAudio.humStop()
  }, [totalCellI])
  useEffect(() => () => smAudio.humStop(), [])

  const addComp = (type) => {
    const id = 'c' + (nextId.current++)
    setComps(cs => [...cs, {
      id, type,
      x: type === 'wirerule' ? 360 : 150 + (cs.length % 4) * 170,
      y: 110 + Math.floor(cs.length / 4) * 90,
      value: 2, closed: false,
      k: type === 'wirerule' ? +(0.05 + Math.random() * 0.02).toFixed(4) : undefined,
      L: type === 'wirerule' ? 50 : undefined,
    }])
    smAudio.click()
  }
  const removeComp = (id) => {
    setComps(cs => cs.filter(c => c.id !== id))
    setWires(ws => ws.filter(w => !w.a.startsWith(id + ':') && !w.b.startsWith(id + ':')))
    setSelComp(null); setSelTerm(null)
  }
  const termPos = (c, t) => {
    if (c.type === 'wirerule')
      return t === 0 ? { x: c.x - 110, y: c.y - 8 } : { x: c.x - 110 + (c.L || 50) * 2.2, y: c.y - 26 }
    return { x: c.x + (t === 0 ? -34 : 34), y: c.y }
  }
  const termPosById = (tid) => {
    const [id, t] = tid.split(':')
    const c = comps.find(x => x.id === id)
    return c ? termPos(c, +t) : { x: 0, y: 0 }
  }
  const tapTerm = (tid) => {
    if (!selTerm) { setSelTerm(tid); return }
    if (selTerm === tid) { setSelTerm(null); return }
    if (!wires.some(w => (w.a === selTerm && w.b === tid) || (w.a === tid && w.b === selTerm)))
      setWires(ws => [...ws, { a: selTerm, b: tid }])
    smAudio.click()
    setSelTerm(null)
  }

  // Challenges auto-detected from the live solution
  const bulbs = comps.filter(c => c.type === 'bulb')
  const lit = bulbs.some(c => { const s = solved[c.id]; return s && (s.dV * s.dV) / 5 > 0.05 })
  const ammSeries = comps.some(c => c.type === 'ammeter' && Math.abs(solved[c.id]?.I || 0) > 0.05) && lit
  const voltAcross = comps.some(c => c.type === 'voltmeter' && Math.abs(solved[c.id]?.dV || 0) > 0.5) && lit
  const resOn = comps.filter(c => c.type === 'resistor').map(c => solved[c.id]).filter(s => s && Math.abs(s.I) > 0.02)
  const seriesDone = resOn.length >= 2 && (() => {
    const [a, b] = resOn
    return Math.abs(Math.abs(a.I) - Math.abs(b.I)) / Math.max(Math.abs(a.I), Math.abs(b.I)) < 0.04
      && Math.abs(Math.abs(a.dV) - Math.abs(b.dV)) > 0.05
  })()
  const parallelDone = resOn.length >= 2 && (() => {
    const [a, b] = resOn
    return Math.abs(Math.abs(a.dV) - Math.abs(b.dV)) / Math.max(Math.abs(a.dV), Math.abs(b.dV), 0.01) < 0.04
  })()
  // The KCSE/IGCSE wire experiment, detected from the live solution:
  // current through the wire, an ammeter in series with it, and a
  // voltmeter across it.
  const wireComp = comps.find(c => c.type === 'wirerule')
  const wireS = wireComp && solved[wireComp.id]
  const wireLive = !!(wireS && Math.abs(wireS.I) > 0.03)
  const wireAmm = wireLive && comps.some(c => c.type === 'ammeter' &&
    Math.abs(Math.abs(solved[c.id]?.I || 0) - Math.abs(wireS.I)) / Math.abs(wireS.I) < 0.06)
  const wireVolt = wireLive && comps.some(c => c.type === 'voltmeter' &&
    Math.abs(Math.abs(solved[c.id]?.dV || 0) - Math.abs(wireS.dV)) < 0.08)
  const experimentReady = wireLive && wireAmm && wireVolt

  const CHALLENGES = [
    ['Light the bulb (cell, switch, bulb in a loop)', lit],
    ['Measure the current: ammeter IN SERIES in the loop', ammSeries],
    ['Measure the bulb voltage: voltmeter ACROSS it (parallel)', voltAcross],
    ['Connect two resistors in SERIES (same current through both)', seriesDone],
    ['Connect the two resistors in PARALLEL (same voltage across both)', parallelDone],
    ['THE EXPERIMENT: cell + switch + ammeter in series with the resistance wire, voltmeter across it', experimentReady],
  ]
  const [rows, setRows] = useState([])
  const [Iin, setIin] = useState(''), [Vin, setVin] = useState('')
  const [fb, setFb] = useState(null)
  const [finalIn, setFinalIn] = useState('')
  const [finalFb, setFinalFb] = useState(null)
  const [finalTries, setFinalTries] = useState(0)
  const [showAns, setShowAns] = useState(false)

  const recordRow = () => {
    if (!experimentReady) { setFb({ ok: false, text: 'Build the experiment circuit first — see the last challenge.' }); return }
    const iv = parseFloat(Iin), vv = parseFloat(Vin)
    const L = wireComp.L || 50
    if (!Number.isFinite(iv) || !Number.isFinite(vv)) { setFb({ ok: false, text: 'Read BOTH meters and enter the values.' }); return }
    if (rows.some(r => r.L === L)) { setFb({ ok: false, text: 'You already recorded ' + L + ' cm — slide the jockey to a new length.' }); return }
    if (Math.abs(iv - Math.abs(wireS.I)) > 0.04) { setFb({ ok: false, text: 'Check the AMMETER — each small division is 0.05 A.' }); smAudio.buzz(); return }
    if (Math.abs(vv - Math.abs(wireS.dV)) > 0.06) { setFb({ ok: false, text: 'Check the VOLTMETER — each small division is 0.1 V.' }); smAudio.buzz(); return }
    setRows(rs => [...rs, { L, I: iv, V: vv, R: +(vv / iv).toFixed(2) }].sort((a, b) => a.L - b.L))
    setIin(''); setVin(''); setFb({ ok: true, text: 'Recorded. Open the switch between readings — the boards award that.' })
    smAudio.click()
  }
  const checkFinal = () => {
    const val = parseFloat(finalIn)
    if (!Number.isFinite(val) || !wireComp) { setFinalFb({ ok: false, text: 'Enter the resistance of ONE METRE of the wire, in ohms.' }); return }
    const correct = wireComp.k * 100
    if (Math.abs(val - correct) / correct < 0.06) {
      setFinalFb({ ok: true, text: 'Correct: about ' + correct.toFixed(1) + ' \u03a9 per metre.' })
      smAudio.ding()
    } else {
      setFinalFb({ ok: false, text: 'Not yet. Each row: R = V/I. R \u00f7 L is the \u03a9 per cm; times 100 gives the metre.' })
      setFinalTries(t => t + 1)
      smAudio.buzz()
    }
  }

  const doneCount = useRef(0)
  useEffect(() => {
    const d = CHALLENGES.filter(x => x[1]).length
    if (d > doneCount.current) smAudio.ding()
    doneCount.current = d
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lit, ammSeries, voltAcross, seriesDone, parallelDone])

  // ── Component renderers (3-D styled) ──
  const Comp = ({ c }) => {
    const s = solved[c.id] || { dV: 0, I: 0 }
    const glow = c.type === 'bulb' ? Math.min(1, (s.dV * s.dV) / 5 / 0.45) : 0
    const sel = selComp === c.id
    return (
      <g transform={'translate(' + c.x + ',' + c.y + ')'}
        onPointerDown={(e) => {
          e.stopPropagation()
          dragRef.current = { id: c.id, sx: e.clientX, sy: e.clientY, ox: c.x, oy: c.y, moved: false }
          e.currentTarget.ownerSVGElement.setPointerCapture?.(e.pointerId)
        }}
        style={{ cursor: 'grab' }}>
        {/* leads */}
        {c.type !== 'wirerule' && (<g>
          <line x1="-34" y1="0" x2="-16" y2="0" stroke="#7C828C" strokeWidth="2.5" />
          <line x1="16" y1="0" x2="34" y2="0" stroke="#7C828C" strokeWidth="2.5" />
        </g>)}

        {c.type === 'cell' && (<g>
          <ellipse cx="0" cy="16" rx="22" ry="3.5" fill="rgba(0,0,0,.14)" />
          <rect x="-18" y="-12" width="36" height="24" rx="4" fill="url(#clCellBody)" stroke="#5E4A12" strokeWidth="0.8" />
          <rect x="-18" y="-12" width="36" height="7" rx="3" fill="rgba(255,255,255,.25)" />
          <rect x="-18" y="-3" width="36" height="9" fill="url(#clCellBand)" />
          <rect x="14" y="-5" width="6" height="10" rx="1.5" fill="url(#clMetal)" stroke="#4E545E" strokeWidth="0.6" />
          <rect x="-20" y="-8" width="4" height="16" rx="1" fill="url(#clMetal)" stroke="#4E545E" strokeWidth="0.6" />
          <text x="6" y="-16" fontSize="10" fontWeight="800" fill="#2A2A2E">+</text>
          <text x="-12" y="-16" fontSize="10" fontWeight="800" fill="#2A2A2E">-</text>
          <text x="0" y="4" fontSize="7.5" fontWeight="800" fill="#FDFAF4" textAnchor="middle">SMARTIOUS 1.5V</text>
        </g>)}

        {c.type === 'resistor' && (<g>
          <ellipse cx="0" cy="12" rx="20" ry="3" fill="rgba(0,0,0,.12)" />
          <rect x="-16" y="-8" width="32" height="16" rx="7" fill="url(#clResBody)" stroke="#7A5A2E" strokeWidth="0.7" />
          {[-9, -3, 3, 9].map((bx, i) => (
            <rect key={i} x={bx - 1.5} y="-8" width="3" height="16" fill={['#7D1025', '#C9973A', '#2A2A2E', '#B45309'][i]} opacity="0.85" />
          ))}
          <text x="0" y="-13" fontSize="9" fontWeight="800" fill="#2A2A2E" textAnchor="middle">{c.value} \u03a9</text>
        </g>)}

        {c.type === 'bulb' && (<g>
          {glow > 0.02 && <circle cx="0" cy="-4" r={14 + glow * 16} style={{ fill: 'rgba(255,196,64,' + (glow * 0.45) + ')', filter: 'blur(4px)' }} />}
          <circle cx="0" cy="-4" r="12" fill={glow > 0.02 ? 'rgba(255,222,120,' + (0.35 + glow * 0.6) + ')' : 'rgba(235,238,244,.85)'} stroke="#7C828C" strokeWidth="1.2" />
          <path d="M-5 -8 L5 0 M5 -8 L-5 0" stroke={glow > 0.4 ? '#B45309' : '#7C828C'} strokeWidth="1.4" />
          <rect x="-6" y="6" width="12" height="7" rx="2" fill="url(#clMetal)" stroke="#4E545E" strokeWidth="0.6" />
        </g>)}

        {c.type === 'switch' && (<g onPointerDown={(e) => { e.stopPropagation(); setComps(cs => cs.map(x => x.id === c.id ? { ...x, closed: !x.closed } : x)); smAudio.click() }} style={{ cursor: 'pointer' }}>
          <ellipse cx="0" cy="12" rx="20" ry="3" fill="rgba(0,0,0,.12)" />
          <circle cx="-14" cy="0" r="4" fill="url(#clKnob)" />
          <circle cx="14" cy="0" r="4" fill="url(#clKnob)" />
          <line x1="-14" y1="0" x2={c.closed ? 14 : 8} y2={c.closed ? 0 : -16}
            stroke="#3A3F47" strokeWidth="3.5" strokeLinecap="round" style={{ transition: 'all .18s' }} />
          <text x="0" y="24" fontSize="8" fill="#6B6B6B" textAnchor="middle">{c.closed ? 'ON' : 'OFF (tap)'}</text>
        </g>)}

        {(c.type === 'ammeter' || c.type === 'voltmeter') && (() => {
          const isA = c.type === 'ammeter'
          const max = isA ? 2 : 3
          const val = Math.min(max, isA ? Math.abs(s.I) : Math.abs(s.dV))
          const ang = -48 + (val / max) * 96
          const majors = isA ? [0, 0.5, 1, 1.5, 2] : [0, 1, 2, 3]
          const minorsN = isA ? 40 : 30
          const P = { x: 0, y: 22 }              // needle pivot
          const tick = (frac, len, wgt) => {
            const a = (-48 + frac * 96) * Math.PI / 180
            const r1 = 40 - len, r2 = 40
            return (
              <line key={'tk' + frac + len}
                x1={P.x + r1 * Math.sin(a)} y1={P.y - r1 * Math.cos(a)}
                x2={P.x + r2 * Math.sin(a)} y2={P.y - r2 * Math.cos(a)}
                stroke="#1E1E22" strokeWidth={wgt} />
            )
          }
          return (<g>
            <ellipse cx="0" cy="34" rx="42" ry="4.5" fill="rgba(0,0,0,.16)" />
            {/* bakelite case + corner screws */}
            <rect x="-46" y="-30" width="92" height="60" rx="7" fill="url(#clBakelite)" stroke="#0E0E11" strokeWidth="0.8" />
            {[[-39, -23], [39, -23], [-39, 23], [39, 23]].map(([sx, sy], i) => (
              <g key={i}>
                <circle cx={sx} cy={sy} r="2.6" fill="url(#clMetal)" stroke="#3A3F47" strokeWidth="0.5" />
                <line x1={sx - 1.6} y1={sy} x2={sx + 1.6} y2={sy} stroke="#3A3F47" strokeWidth="0.7" transform={'rotate(' + (i * 47) + ' ' + sx + ' ' + sy + ')'} />
              </g>
            ))}
            {/* dial face */}
            <rect x="-40" y="-25" width="80" height="46" rx="4" fill="url(#clDial)" stroke="#8B857A" strokeWidth="0.6" />
            {/* mirror strip under the scale (parallax aid on real meters) */}
            <path d={'M ' + (P.x - 33 * Math.sin(48 * Math.PI / 180)) + ' ' + (P.y - 33 * Math.cos(48 * Math.PI / 180)) +
              ' A 33 33 0 0 1 ' + (P.x + 33 * Math.sin(48 * Math.PI / 180)) + ' ' + (P.y - 33 * Math.cos(48 * Math.PI / 180))}
              fill="none" stroke="#C7D3DC" strokeWidth="4" opacity="0.8" />
            {/* scale arc */}
            <path d={'M ' + (P.x - 40 * Math.sin(48 * Math.PI / 180)) + ' ' + (P.y - 40 * Math.cos(48 * Math.PI / 180)) +
              ' A 40 40 0 0 1 ' + (P.x + 40 * Math.sin(48 * Math.PI / 180)) + ' ' + (P.y - 40 * Math.cos(48 * Math.PI / 180))}
              fill="none" stroke="#1E1E22" strokeWidth="1.1" />
            {Array.from({ length: minorsN + 1 }, (_, i) => tick(i / minorsN, i % (minorsN / (majors.length - 1)) === 0 ? 7 : 3.5, i % (minorsN / (majors.length - 1)) === 0 ? 1.2 : 0.6))}
            {majors.map(mv => {
              const a = (-48 + (mv / max) * 96) * Math.PI / 180
              return (
                <text key={'m' + mv} x={P.x + 48 * Math.sin(a)} y={P.y - 48 * Math.cos(a) + 3}
                  fontSize="6.5" fontWeight="700" fill="#1E1E22" textAnchor="middle">{mv}</text>
              )
            })}
            <text x="0" y="-13" fontSize="8.5" fontWeight="900" fill={isA ? '#7D1025' : '#1E5AA8'} textAnchor="middle" fontStyle="italic">
              {isA ? 'A' : 'V'}
            </text>
            <text x="0" y="16" fontSize="4.2" fontWeight="700" fill="#8A8A82" textAnchor="middle" letterSpacing="1">SMARTIOUS</text>
            {/* knife needle + counterweight, with its shadow */}
            <g style={{ transform: 'rotate(' + ang + 'deg)', transformOrigin: '0px 22px', transition: 'transform .55s cubic-bezier(.3,1.55,.5,1)' }}>
              <polygon points="0,-16 1,20 -1,20" fill="rgba(0,0,0,.2)" transform="translate(1.2,1)" />
              <polygon points="0,-16 1.1,22 -1.1,22" fill="#14161A" />
              <circle cx="0" cy="27" r="2.6" fill="#14161A" />
            </g>
            <circle cx={P.x} cy={P.y} r="3" fill="url(#clMetal)" stroke="#2A2A2E" strokeWidth="0.7" />
            {/* glass with diagonal glare */}
            <rect x="-40" y="-25" width="80" height="46" rx="4" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
            <polygon points="-40,-25 -6,-25 -28,21 -40,21" fill="rgba(255,255,255,.10)" />
            {/* brass terminal posts */}
            <circle cx="-30" cy="27" r="3" fill="url(#clCellBody)" stroke="#5E4A12" strokeWidth="0.6" />
            <circle cx="30" cy="27" r="3" fill="url(#clCellBody)" stroke="#5E4A12" strokeWidth="0.6" />
          </g>)
        })()}

        {c.type === 'wirerule' && (<g>
          <ellipse cx="0" cy="14" rx="118" ry="4" fill="rgba(0,0,0,.12)" />
          <rect x="-112" y="-4" width="224" height="16" rx="2.5" fill="url(#clResBody)" stroke="#8A6A3A" strokeWidth="0.7" />
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i}>
              <line x1={-110 + i * 22} y1="-4" x2={-110 + i * 22} y2="2" stroke="#4A3A20" strokeWidth="0.8" />
              <text x={-110 + i * 22} y="9.5" fontSize="5.5" fill="#4A3A20" textAnchor="middle">{i * 10}</text>
            </g>
          ))}
          <line x1="-110" y1="-8" x2="110" y2="-8" stroke="url(#clMetal)" strokeWidth="2.5" />
          {/* jockey: drag along the wire */}
          <g transform={'translate(' + (-110 + (c.L || 50) * 2.2) + ',0)'}
            onPointerDown={(e) => {
              e.stopPropagation()
              dragRef.current = { id: c.id, jockey: true, ox: c.x }
              e.currentTarget.ownerSVGElement.setPointerCapture?.(e.pointerId)
            }}
            style={{ cursor: 'ew-resize' }}>
            <line x1="0" y1="-26" x2="0" y2="-8" stroke="#3A3F47" strokeWidth="2.5" />
            <circle cx="0" cy="-30" r="6.5" fill="url(#clKnob)" stroke="#4E1013" strokeWidth="0.7" />
            <path d="M-3 -10 L3 -10 L0 -5 Z" fill="#3A3F47" />
          </g>
          <text x={-110 + (c.L || 50) * 2.2} y="24" fontSize="8.5" fontWeight="800" fill="#7D1025" textAnchor="middle">L = {c.L || 50} cm</text>
        </g>)}

        {/* terminals */}
        {(c.type === 'wirerule' ? [0, 1] : [0, 1]).map(t => (
          <circle key={t}
            cx={c.type === 'wirerule' ? (t === 0 ? -110 : -110 + (c.L || 50) * 2.2) : (t === 0 ? -34 : 34)}
            cy={c.type === 'wirerule' ? (t === 0 ? -8 : -26) : 0} r="5.5"
            fill={selTerm === c.id + ':' + t ? '#F2C230' : '#2A2A2E'}
            stroke={selTerm === c.id + ':' + t ? '#8A6A00' : '#6B7280'} strokeWidth="1.5"
            onPointerDown={(e) => { e.stopPropagation(); tapTerm(c.id + ':' + t) }}
            style={{ cursor: 'pointer' }} />
        ))}

        {/* selection controls */}
        {sel && (<g>
          <g onPointerDown={(e) => { e.stopPropagation(); removeComp(c.id) }} style={{ cursor: 'pointer' }}>
            <circle cx="0" cy="-34" r="9" fill="#B91C1C" />
            <path d="M-3.5 -37.5 L3.5 -30.5 M3.5 -37.5 L-3.5 -30.5" stroke="#fff" strokeWidth="1.8" />
          </g>
          {c.type === 'resistor' && (
            <g onPointerDown={(e) => {
              e.stopPropagation()
              setComps(cs => cs.map(x => x.id === c.id
                ? { ...x, value: CL_RVALUES[(CL_RVALUES.indexOf(x.value) + 1) % CL_RVALUES.length] }
                : x))
            }} style={{ cursor: 'pointer' }}>
              <rect x="14" y="-42" width="34" height="17" rx="8" fill="#7D1025" />
              <text x="31" y="-30" fontSize="9" fontWeight="800" fill="#fff" textAnchor="middle">value</text>
            </g>
          )}
        </g>)}
      </g>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FBFAF5', zIndex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tray */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', flexWrap: 'wrap', borderBottom: '1px solid rgba(0,0,0,.08)', background: '#F4F2ED', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#7D1025', marginRight: 2 }}>APPARATUS:</span>
        {CL_TRAY.map(([type, label]) => (
          <button key={type} onClick={() => addComp(type)}
            style={{ background: '#fff', border: '1.5px solid #C9C2B0', borderRadius: 9, padding: '6px 11px', fontSize: 11.5, fontWeight: 700, color: '#2A2A2E', cursor: 'pointer' }}>
            + {label}
          </button>
        ))}
        <button onClick={() => { setComps([]); setWires([]); setSelTerm(null); setSelComp(null) }}
          style={{ marginLeft: 'auto', background: 'rgba(185,28,28,.08)', border: 'none', borderRadius: 9, padding: '6px 11px', fontSize: 11.5, fontWeight: 800, color: '#B91C1C', cursor: 'pointer' }}>
          Clear bench
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Bench */}
        <svg viewBox="0 0 720 420" style={{ flex: 1, minWidth: 0, touchAction: 'none' }}
          onPointerMove={(e) => {
            const d = dragRef.current
            if (!d) return
            const svg = e.currentTarget
            const rect = svg.getBoundingClientRect()
            const sc = 720 / rect.width
            if (d.jockey) {
              const wx = (e.clientX - rect.left) * sc
              setComps(cs => cs.map(c => {
                if (c.id !== d.id) return c
                const newL = Math.round(Math.min(100, Math.max(5, (wx - (c.x - 110)) / 2.2)))
                if (newL !== c.L) smAudio.scrape()
                return { ...c, L: newL }
              }))
              return
            }
            const nx = d.ox + (e.clientX - d.sx) * sc
            const ny = d.oy + (e.clientY - d.sy) * sc
            if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true
            setComps(cs => cs.map(c => c.id === d.id
              ? { ...c, x: Math.max(50, Math.min(670, nx)), y: Math.max(40, Math.min(390, ny)) }
              : c))
          }}
          onPointerUp={() => {
            const d = dragRef.current
            if (d && !d.moved) setSelComp(s => s === d.id ? null : d.id)
            dragRef.current = null
          }}
          onPointerDown={() => { setSelTerm(null); setSelComp(null) }}>
          <defs>
            <linearGradient id="clCellBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8B93A" /><stop offset="55%" stopColor="#C9973A" /><stop offset="100%" stopColor="#7A5A16" />
            </linearGradient>
            <linearGradient id="clCellBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A8203A" /><stop offset="100%" stopColor="#6E0F22" />
            </linearGradient>
            <linearGradient id="clMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EDEFF2" /><stop offset="50%" stopColor="#AEB4BE" /><stop offset="100%" stopColor="#6E747E" />
            </linearGradient>
            <linearGradient id="clResBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F2E3C4" /><stop offset="100%" stopColor="#CBA96A" />
            </linearGradient>
            <radialGradient id="clKnob" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#FFF" /><stop offset="60%" stopColor="#B4232A" /><stop offset="100%" stopColor="#6E1116" />
            </radialGradient>
            <radialGradient id="clMeterFace" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#FFFFFF" /><stop offset="85%" stopColor="#EDEBE2" /><stop offset="100%" stopColor="#D5D1C2" />
            </radialGradient>
            <linearGradient id="clBakelite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3A3A40" /><stop offset="45%" stopColor="#232327" /><stop offset="100%" stopColor="#121215" />
            </linearGradient>
            <radialGradient id="clDial" cx="40%" cy="25%">
              <stop offset="0%" stopColor="#FFFEF8" /><stop offset="80%" stopColor="#F2EFE3" /><stop offset="100%" stopColor="#DDD8C6" />
            </radialGradient>
          </defs>

          {/* wires */}
          {wires.map((w, i) => {
            const A = termPosById(w.a), B = termPosById(w.b)
            const mx = (A.x + B.x) / 2, my = Math.max(A.y, B.y) + 26
            return (
              <g key={i} onPointerDown={(e) => { e.stopPropagation(); setWires(ws => ws.filter((_, j) => j !== i)); smAudio.click() }} style={{ cursor: 'pointer' }}>
                <path d={'M' + A.x + ' ' + A.y + ' Q ' + mx + ' ' + my + ' ' + B.x + ' ' + B.y}
                  fill="none" stroke="transparent" strokeWidth="14" />
                <path d={'M' + A.x + ' ' + A.y + ' Q ' + mx + ' ' + my + ' ' + B.x + ' ' + B.y}
                  fill="none" stroke="#B4232A" strokeWidth="2.6" strokeLinecap="round" />
              </g>
            )
          })}
          {/* pending connection hint */}
          {selTerm && (
            <text x="360" y="408" fontSize="11" fontWeight="700" fill="#8A6A00" textAnchor="middle">
              Now tap the terminal you want to connect it to (tap again to cancel)
            </text>
          )}
          {comps.map(c => <Comp key={c.id} c={c} />)}
          {comps.length === 0 && (
            <text x="360" y="200" fontSize="13" fill="#8A8A82" textAnchor="middle">
              Add apparatus from the tray, drag it into place, then tap two terminals to wire them.
            </text>
          )}
        </svg>

        {/* Challenges */}
        <div style={{ width: 230, flexShrink: 0, borderLeft: '1px solid rgba(0,0,0,.08)', background: '#F4F2ED', padding: '12px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#2A2A2E', marginBottom: 8 }}>Connection challenges</div>
          {CHALLENGES.map(([label, done], i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 9 }}>
              <div style={{
                width: 17, height: 17, borderRadius: 5, flexShrink: 0, marginTop: 1,
                background: done ? '#15803D' : '#fff', border: '1.5px solid ' + (done ? '#15803D' : '#C9C2B0'),
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 900,
              }}>{done ? '\u2713' : ''}</div>
              <div style={{ fontSize: 11, color: done ? '#15803D' : '#4B4B55', fontWeight: done ? 800 : 600, lineHeight: 1.45 }}>{label}</div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: '#8A8A82', lineHeight: 1.5, marginTop: 10 }}>
            Tap a terminal, then another, to wire them. Tap a wire to remove it. Tap apparatus to select: remove it or change a resistor value. Cells: + is the button end. On the rule, drag the red jockey to change L.
          </div>

          {experimentReady && (<>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#2A2A2E', margin: '12px 0 6px' }}>Readings (record 4+ lengths)</div>
            <table style={{ borderCollapse: 'collapse', fontSize: 10.5, width: '100%' }}>
              <thead><tr>
                {['L', 'I (A)', 'V (V)', 'R (\u03a9)'].map(h =>
                  <th key={h} style={{ border: '1px solid #C9C2B0', padding: '3px 4px', background: '#fff', fontWeight: 800 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.L}>
                    <td style={{ border: '1px solid #C9C2B0', padding: '3px 4px', textAlign: 'center' }}>{r.L}</td>
                    <td style={{ border: '1px solid #C9C2B0', padding: '3px 4px', textAlign: 'center' }}>{r.I.toFixed(2)}</td>
                    <td style={{ border: '1px solid #C9C2B0', padding: '3px 4px', textAlign: 'center' }}>{r.V.toFixed(2)}</td>
                    <td style={{ border: '1px solid #C9C2B0', padding: '3px 4px', textAlign: 'center' }}>{r.R.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
              <input value={Iin} onChange={e => setIin(e.target.value)} placeholder="I" inputMode="decimal"
                style={{ width: 44, textAlign: 'center', border: '1.5px solid #C9C2B0', borderRadius: 7, padding: '5px 3px', fontSize: 11, fontWeight: 700 }} />
              <input value={Vin} onChange={e => setVin(e.target.value)} placeholder="V" inputMode="decimal"
                style={{ width: 44, textAlign: 'center', border: '1.5px solid #C9C2B0', borderRadius: 7, padding: '5px 3px', fontSize: 11, fontWeight: 700 }} />
              <button onClick={recordRow} style={{ background: '#7D1025', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 10px', fontSize: 10.5, fontWeight: 800, cursor: 'pointer' }}>
                Record L = {wireComp?.L || '?'}
              </button>
            </div>
            {fb && <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 4, color: fb.ok ? '#15803D' : '#B45309' }}>{fb.text}</div>}
            {rows.length >= 4 && (<>
              <div style={{ fontSize: 11.5, fontWeight: 800, marginTop: 8 }}>Resistance of 1 m of the wire (\u03a9):</div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 4 }}>
                <input value={finalIn} onChange={e => setFinalIn(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') checkFinal() }} placeholder="6.0" inputMode="decimal"
                  style={{ width: 54, textAlign: 'center', border: '1.5px solid #C9C2B0', borderRadius: 7, padding: '5px 3px', fontSize: 11.5, fontWeight: 700 }} />
                <button onClick={checkFinal} style={{ background: '#7D1025', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 10px', fontSize: 10.5, fontWeight: 800, cursor: 'pointer' }}>Check</button>
                {finalTries >= 2 && !showAns && (
                  <button onClick={() => setShowAns(true)} style={{ background: 'rgba(125,16,37,.08)', color: '#7D1025', border: 'none', borderRadius: 7, padding: '6px 8px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>Method</button>
                )}
              </div>
              {finalFb && <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 4, color: finalFb.ok ? '#15803D' : '#B45309' }}>{finalFb.text}</div>}
              {showAns && (
                <div style={{ fontSize: 10.5, color: '#4B4B55', lineHeight: 1.55, marginTop: 4 }}>
                  Each row: R = V/I. R grows in a straight line with L, so R \u00f7 L is constant — the \u03a9 per cm. Multiply by 100.
                </div>
              )}
            </>)}
          </>)}
        </div>
      </div>
    </div>
  )
}

// Translate getUserMedia failures into the exact fix for THIS device.
// The error name tells us which layer blocked it.
function diagnoseMediaError(err, cameraOnly) {
  const what = cameraOnly ? 'camera' : 'camera and microphone'
  switch (err && err.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'This site is blocked from using the ' + what + ' in the browser. ' +
        'Click the icon at the LEFT of the address bar, set Camera and Microphone to Allow, then press Try again. ' +
        'If there is no such option, type chrome://settings/content/camera in the address bar and remove this site from the Not allowed list (and the same for microphone).'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No ' + what + ' was detected on this device. If this laptop has a webcam, check the physical camera shutter/switch and that drivers are installed.'
    case 'NotReadableError':
    case 'TrackStartError':
      return 'The ' + what + ' exists but Windows or another app is holding it. Close Zoom, Teams, and any camera app completely, then check Windows Settings, Privacy and security, Camera: turn ON camera access and Let desktop apps access your camera (and the same for Microphone). Then press Try again.'
    case 'OverconstrainedError':
      return 'The camera does not support the requested settings. Press Try again — the classroom will fall back automatically.'
    case 'SecurityError':
      return 'The browser refused for security reasons. Make sure you opened the classroom at https://smartioushomeschool.com (with https), not inside another app.'
    default:
      return 'Could not access the ' + what + ' (' + (err && err.name || 'unknown') + '). Restart the browser and try again; if it persists, test the machine at webrtc.github.io/samples.'
  }
}
