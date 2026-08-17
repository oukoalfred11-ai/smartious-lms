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

// One video tile. Self tile is muted (never hear yourself).
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
        <video ref={attach} autoPlay playsInline muted={self}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {stream && <audio ref={attach} autoPlay muted={self} style={{ display: 'none' }} />}
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
  // Open coursebook: shown split-screen beside the whiteboard, the
  // teacher turns pages and every student's copy follows.
  const [openBook, setOpenBook] = useState(null)   // { id, title, page }
  const [mainView, setMainView] = useState('board')   // 'board' | 'screen'
  const camTrackRef = useRef(null)
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
    } else if (op.kind === 'diagram') {
      drawDiagram(ctx, op)
    }
  }, [])

  const inkRef = useRef(null)   // offscreen transparent ink layer

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
    if (ink) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(ink, 0, 0)
    }
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
    if (op.kind === 'book') { setOpenBook(op.id ? { id: op.id, title: op.title || 'Coursebook', page: op.page || 1 } : null); return }
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
  }

  const opBounds = (op) => {
    const pad = (op.w || 3) + 6
    if (op.kind === 'image') return { x: op.x1, y: op.y1, w: op.w, h: op.h }
    if (op.kind === 'diagram') return { x: op.x1 - 240, y: op.y1 - 240, w: 480, h: 480 }
    if (op.kind === 'text') return { x: op.x1 - 4, y: op.y1 - (op.size || 18), w: (op.text || '').length * (op.size || 18) * 0.6 + 8, h: (op.size || 18) + 8 }
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

  const MOVABLE = ['stroke', 'line', 'rect', 'circle', 'text', 'arrow', 'tri', 'poly', 'angle', 'image', 'diagram']
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
        const removed = ops.splice(i, 1)[0]
        // Undoing a MOVE puts the target back where it came from.
        if (removed.kind === 'move') {
          const target = ops.find(o => o.id === removed.target)
          if (target) translateOp(target, -removed.dx, -removed.dy)
        }
        break
      }
    }
    redrawRef.current()
  }, [])

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
            else if (op.kind === 'book') {
              setOpenBook(op.id ? { id: op.id, title: op.title || 'Coursebook', page: op.page || 1 } : null)
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

    // Select tool: grab whatever is under the cursor and drag it.
    if (tool === 'select') {
      const hit = hitTest(p)
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
    d.active = tool
    d.start = p
    d.pts = [p]
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
    const p = toWorld(e)
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
    await engineRef.current?.replaceVideoTrack(camTrackRef.current || null)
    camTrackRef.current = null
    setSharing(false)
    setMainView('board')
    socketRef.current?.emit('state', { sharing: false })
  }, [localStream])

  const startShare = async () => {
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 10 } }, audio: false,
      })
      const screenTrack = display.getVideoTracks()[0]
      camTrackRef.current = localStream?.getVideoTracks()[0] || null
      await engineRef.current?.replaceVideoTrack(screenTrack)
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
        {mainView === 'screen' ? (sharing ? 'Your screen' : (sharingPeer?.name || 'Teacher') + "'s screen") : 'Whiteboard'}
      </span>
      {(sharing || sharingPeer) && (
        <button onClick={() => setMainView(v => v === 'board' ? 'screen' : 'board')} style={{
          background: 'rgba(242,194,48,.15)', color: '#8a6a00', border: 'none', borderRadius: 7,
          fontSize: 11.5, fontWeight: 700, padding: '5px 12px', cursor: 'pointer', marginRight: 6,
        }}>{mainView === 'board' ? 'View screen' : 'View board'}</button>
      )}
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
        <IconBtn icon="grid" title={grid ? 'Plain board' : 'Graph paper for everyone'} active={grid}
          onClick={() => { const g = !grid; setGrid(g); sendOpLive({ kind: 'bg', grid: g }) }} />
        <IconBtn icon="image" title="Put a picture on the board" onClick={() => imgInputRef.current?.click()} />
        <IconBtn icon="book" title="Put a Library page on the board" onClick={() => setShowLibPicker(true)} />
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

      {/* ── Top bar ── */}
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
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative', gap: 10, padding: '2px 10px 10px' }}>

        {/* Video column (desktop) */}
        {!narrow && (
          <div style={{ width: 268, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tiles}
          </div>
        )}

        {/* Board / presentation card */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {narrow && !tilesHidden && (
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
          {narrow && tilesHidden && (
            <Btn onClick={() => setTilesHidden(false)} style={{ padding: '4px 12px', fontSize: 11, alignSelf: 'center' }}>
              Show videos ({roster.length})
            </Btn>
          )}

          <div style={{ flex: 1, minHeight: 0, background: '#FFFFFF', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 34px rgba(0,0,0,.35)' }}>
            {boardHeader}
            <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
            {openBook && mainView === 'board' && (
              <BookReader
                book={openBook}
                canControl={isTeacher}
                onPage={(pg) => { setOpenBook(b => b && { ...b, page: pg }); sendOpLive({ kind: 'book', id: openBook.id, title: openBook.title, page: pg }) }}
                onClose={() => { setOpenBook(null); sendOpLive({ kind: 'book', id: null }) }}
                onStamp={(dataUrl, w, h) => placeImageOp(dataUrl, w, h)}
              />
            )}
            <div ref={wrapRef} style={{ flex: 1, position: 'relative', minHeight: 0, background: T.board }}>
              {toolPill}
              {mainView === 'screen' && (sharing || sharingPeer) && (
                <ScreenView stream={sharing ? localStream : streams[sharingPeer?.socketId]} muted={sharing} />
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

        {panelCard}
      </div>

      {showLibPicker && (
        <LibraryPagePicker
          onClose={() => setShowLibPicker(false)}
          onOpenBook={(b) => {
            const nb = { id: b._id, title: b.title || 'Coursebook', page: 1 }
            setOpenBook(nb)
            sendOpLive({ kind: 'book', id: nb.id, title: nb.title, page: 1 })
            setShowLibPicker(false)
          }}
        />
      )}

      {/* ── Bottom control bar ── */}
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
        <video ref={ref} autoPlay playsInline muted={muted}
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
          ) : books.slice(0, 30).map(b => (
            <div key={b._id} onClick={() => onOpenBook(b)}
              style={{ padding: '10px 12px', borderRadius: 9, cursor: 'pointer', background: 'rgba(255,255,255,.05)' }}>
              <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 700 }}>{b.title}</div>
              <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 10.5, marginTop: 2 }}>
                {[b.subjectName, b.grade, b.curriculum].filter(Boolean).join(' \u00b7 ')}
              </div>
            </div>
          ))}
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
