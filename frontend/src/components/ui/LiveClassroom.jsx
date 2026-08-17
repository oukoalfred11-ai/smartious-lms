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

// One video tile. Self tile is muted (never hear yourself).
function Tile({ stream, name, role, self, micOn, camOn, hand, quality, small }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream }, [stream])
  const qColor = { good: '#22C55E', fair: '#F59E0B', poor: '#EF4444', down: '#6B7280' }[quality]
  return (
    <div style={{
      position: 'relative', width: small ? 108 : 150, height: small ? 72 : 100, borderRadius: 10, overflow: 'hidden',
      background: '#1B2230', border: hand ? '2px solid #F59E0B' : '1px solid rgba(255,255,255,.12)',
      flexShrink: 0,
    }}>
      {stream && camOn !== false ? (
        <video ref={ref} autoPlay playsInline muted={self}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {stream && <audio ref={ref} autoPlay muted={self} style={{ display: 'none' }} />}
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
  const [themeId, setThemeId] = useState(() => localStorage.getItem('sm_class_theme') || 'dark')
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
      cv.width = wrap.clientWidth; cv.height = wrap.clientHeight
      redraw()
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [redraw, phase])

  const applyOp = useCallback((op) => {
    if (op.kind === 'lock') { setBoardLocked(!!op.locked); return }
    if (op.kind === 'bg') { setGrid(op.grid === true); return }
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

  const sendOp = useCallback((op) => {
    applyOp(op)
    socketRef.current?.emit('board:op', op)
  }, [applyOp])

  // Live-flushed stroke chunks bypass local re-draw (already on canvas)
  const sendOpLive = (op) => { opsRef.current.push(op); socketRef.current?.emit('board:op', op) }

  // ═══ CONNECT ═══════════════════════════════════════════════
  useEffect(() => {
    if (phase !== 'connecting') return
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
  }, [liveClassId, phase === 'connecting'])

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
    if (!d.active) return
    if (d.active === 'pan') {
      setOffset({ x: d.start.ox + (e.clientX - d.start.x), y: d.start.oy + (e.clientY - d.start.y) })
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
      // Shape preview: full redraw, then ghost the shape on screen only
      redraw()
      ctx.setTransform(z, 0, 0, z, o.x, o.y)
      drawOp(ctx, { kind: d.active, x1: d.start.x, y1: d.start.y, x2: p.x, y2: p.y, color: colour, w: lineW })
      ctx.globalCompositeOperation = 'source-over'
      d.pts = [p]
    }
  }

  const onUp = () => {
    const d = drawRef.current
    if (!d.active) return
    if (d.active === 'pan') { d.active = false; return }
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
  const toggleMic = () => {
    const next = !micOn
    setMicOn(next)
    engineRef.current?.setTrackEnabled('audio', next)
    socketRef.current?.emit('state', { micOn: next })
  }
  const toggleCam = () => {
    const next = !camOn
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

  return (
    <div ref={rootRef} style={{ position: 'fixed', inset: 0, background: T.app, display: 'flex', flexDirection: 'column', zIndex: 500, fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: T.panel, borderBottom: '1px solid ' + T.border }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#7D1025,#C9A030)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>S</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: T.text, fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {classInfo.title || 'Smartious Classroom'}
          </div>
          <div style={{ color: T.sub, fontSize: 11 }}>
            {classInfo.subject || ''}{phase === 'live' ? ` \u00b7 ${mm}:${ss}` : ' \u00b7 connecting...'}
          </div>
        </div>
        <span style={{ background: phase === 'live' ? '#15803D' : '#B45309', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99, letterSpacing: '.06em' }}>
          {phase === 'live' ? 'LIVE' : 'CONNECTING'}
        </span>
        <span style={{ background: isTeacher ? '#7D1025' : '#1E3A8A', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99, letterSpacing: '.06em' }}>
          {isTeacher ? 'TEACHER' : 'STUDENT'}
        </span>
        <Btn onClick={cycleTheme} title="Switch between dark, light, and bone modes">{T.name}</Btn>
        <Btn onClick={toggleFull} title={isFull ? 'Exit full screen' : 'Use the whole screen'}>{isFull ? 'Exit full' : 'Full screen'}</Btn>
        <Btn danger onClick={leave}>Leave</Btn>
      </div>

      {mediaNote && (
        <div style={{ background: '#78350F', color: '#FDE68A', fontSize: 12, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ flex: 1, minWidth: 200 }}>{mediaNote}</span>
          <Btn onClick={retryMedia} style={{ background: '#C9A030', color: '#7D1025', fontWeight: 800, padding: '6px 14px' }}>
            Enable camera and mic
          </Btn>
        </div>
      )}
      {reconnecting && phase === 'live' && (
        <div style={{ background: '#7C2D12', color: '#FED7AA', fontSize: 12, padding: '7px 16px', fontWeight: 700 }}>
          Connection lost — reconnecting automatically...
        </div>
      )}

      {/* ── Video strip (collapsible: more room to write) ── */}
      {tilesHidden ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3px 0', background: T.strip, borderBottom: '1px solid ' + T.border }}>
          <Btn onClick={() => setTilesHidden(false)} style={{ padding: '4px 14px', fontSize: 11 }}>
            Show videos ({roster.length})
          </Btn>
        </div>
      ) : (
      <div style={{ display: 'flex', gap: 8, padding: narrow ? '6px 10px' : '8px 14px', overflowX: 'auto', background: T.strip, borderBottom: '1px solid ' + T.border, alignItems: 'center' }}>
        <Btn onClick={() => setTilesHidden(true)} title="Hide videos for a bigger board"
          style={{ padding: '4px 8px', fontSize: 10.5, flexShrink: 0, writingMode: 'vertical-rl', height: narrow ? 72 : 100 }}>
          Hide
        </Btn>
        <Tile stream={localStream} name={user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'You'}
          role={myRole} self micOn={micOn} camOn={camOn} hand={handUp} small={narrow} />
        {others.map(p => (
          <Tile key={p.socketId} stream={streams[p.socketId]} name={p.name} role={p.role}
            micOn={p.micOn} camOn={p.camOn} hand={p.hand} quality={quality[p.socketId]} small={narrow} />
        ))}
      </div>
      )}

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        {/* Toolbar: the full deck for teachers; for students it only
            appears when the teacher opens the board for drawing. */}
        {(isTeacher || canDraw) && (
        <div style={{ width: narrow ? 48 : 56, background: T.panel, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 0', borderRight: '1px solid ' + T.border, overflowY: 'auto' }}>
          {[['pen', 'Pen'], ['eraser', 'Erase'], ['line', 'Line'], ['rect', 'Rect'], ['circle', 'Circ'], ['text', 'Text'], ['pan', 'Pan']].map(([t, l]) => (
            <Btn key={t} active={tool === t} onClick={() => setTool(t)} title={l}
              disabled={!canDraw && t !== 'pan'} style={{ width: 42, padding: '8px 0' }}>{l}</Btn>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 4 }}>
            {PEN_COLOURS.map(c => (
              <div key={c} onClick={() => canDraw && setColour(c)} title={c}
                style={{
                  width: 16, height: 16, borderRadius: '50%', background: c, cursor: canDraw ? 'pointer' : 'not-allowed',
                  border: colour === c ? '2px solid #60A5FA' : '1.5px solid rgba(128,128,128,.45)',
                  boxSizing: 'border-box',
                }} />
            ))}
          </div>
          <input type="color" value={colour} onChange={e => setColour(e.target.value)} disabled={!canDraw}
            title="Custom colour"
            style={{ width: 34, height: 26, border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer', marginTop: 2 }} />
          <input type="range" min="1" max="10" value={lineW} onChange={e => setLineW(+e.target.value)} disabled={!canDraw}
            style={{ width: 42 }} />
          {isTeacher && (<>
            <Btn active={!boardLocked} onClick={toggleBoardLock} title={boardLocked ? 'Students cannot draw. Click to allow.' : 'Students can draw. Click to lock.'}
              style={{ width: 42, padding: '7px 0', fontSize: 10.5, marginTop: 8 }}>{boardLocked ? 'Locked' : 'Open'}</Btn>
            <Btn onClick={clearBoard} title="Clear board for everyone" style={{ width: 42, padding: '7px 0', fontSize: 10.5 }}>Clear</Btn>
            <Btn active={grid} onClick={() => { const g = !grid; setGrid(g); sendOpLive({ kind: 'bg', grid: g }) }}
              title={grid ? 'Back to a plain board' : 'Turn the board into graph paper for everyone'}
              style={{ width: 42, padding: '7px 0', fontSize: 10.5 }}>Graph</Btn>
            <Btn onClick={() => imgInputRef.current?.click()} title="Put a picture on the board"
              style={{ width: 42, padding: '7px 0', fontSize: 10.5, marginTop: 8 }}>Img</Btn>
            <Btn onClick={() => setShowLibPicker(true)} title="Put a Library PDF page on the board"
              style={{ width: 42, padding: '7px 0', fontSize: 10.5 }}>Book</Btn>
            <input ref={imgInputRef} type="file" accept="image/*" onChange={onPickImage} style={{ display: 'none' }} />
          </>)}
        </div>
        )}

        {/* Board / presentation */}
        <div ref={wrapRef} style={{ flex: 1, position: 'relative', minWidth: 0, background: T.board }}>
          {(sharing || sharingPeer) && (
            <div style={{ position: 'absolute', top: 10, left: 12, zIndex: 5, display: 'flex', gap: 6 }}>
              <Btn active={mainView === 'board'} onClick={() => setMainView('board')} style={{ padding: '6px 12px', fontSize: 11 }}>Board</Btn>
              <Btn active={mainView === 'screen'} onClick={() => setMainView('screen')} style={{ padding: '6px 12px', fontSize: 11 }}>
                {sharing ? 'Your screen' : (sharingPeer?.name || 'Teacher') + "'s screen"}
              </Btn>
            </div>
          )}
          {mainView === 'screen' && (sharing || sharingPeer) && (
            <ScreenView
              stream={sharing ? localStream : streams[sharingPeer?.socketId]}
              muted={sharing}
            />
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
            style={{ display: 'block', cursor: tool === 'pan' || !canDraw ? 'grab' : 'crosshair', touchAction: 'none',
              visibility: mainView === 'screen' ? 'hidden' : 'visible' }} />
          {!canDraw && (
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.55)', color: 'rgba(255,255,255,.75)', fontSize: 11.5, padding: '5px 14px', borderRadius: 99 }}>
              View only — the teacher controls the board
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 10, right: 12, color: 'rgba(255,255,255,.4)', fontSize: 11 }}>
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Right panel: fixed sidebar on desktop, slide-over on phones */}
        {(!narrow || panelOpen) && (
        <div style={narrow ? {
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(85vw, 300px)', zIndex: 20,
          background: T.panel, display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid ' + T.border, boxShadow: '-12px 0 32px rgba(0,0,0,.5)',
        } : { width: 280, background: T.panel, display: 'flex', flexDirection: 'column', borderLeft: '1px solid ' + T.border }}>
          {narrow && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 10px 0' }}>
              <Btn onClick={() => setPanelOpen(false)} style={{ padding: '5px 12px' }}>Close</Btn>
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, padding: '10px 12px' }}>
            {[['chat', 'Chat'], ['people', `People (${roster.length})`]].map(([id, l]) => (
              <Btn key={id} active={panel === id} onClick={() => setPanel(id)} style={{ flex: 1 }}>{l}</Btn>
            ))}
          </div>

          {panel === 'chat' && (<>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chat.map((m, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10.5, color: m.role === 'teacher' ? '#F0CC5A' : 'rgba(255,255,255,.5)', fontWeight: 700 }}>
                    {m.name}{m.role === 'teacher' ? ' (Teacher)' : ''}
                  </div>
                  <div style={{ fontSize: 12.5, color: T.text, lineHeight: 1.5, wordBreak: 'break-word' }}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: 'flex', gap: 6, padding: 10, borderTop: '1px solid rgba(255,255,255,.07)' }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendChat() }}
                placeholder="Message the class"
                style={{ flex: 1, background: T.field, border: 'none', borderRadius: 8, padding: '9px 11px', color: T.text, fontSize: 12.5, outline: 'none' }} />
              <Btn onClick={sendChat} style={{ background: '#C9A030', color: '#7D1025', fontWeight: 800 }}>Send</Btn>
            </div>
          </>)}

          {panel === 'people' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {roster.map(p => (
                <div key={p.socketId} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', background: 'rgba(255,255,255,.05)', borderRadius: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.role === 'teacher' ? '#7D1025' : '#1E3A8A', color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {(p.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: T.text, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}{p.socketId === socketRef.current?.id ? ' (you)' : ''}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 10 }}>{p.role}</div>
                  </div>
                  {p.hand && <span style={{ color: '#F59E0B', fontSize: 9.5, fontWeight: 800 }}>HAND</span>}
                  {p.micOn === false && <span style={{ color: '#F87171', fontSize: 9.5, fontWeight: 800 }}>MUTED</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>

      {showLibPicker && (
        <LibraryPagePicker onClose={() => setShowLibPicker(false)} onPlace={placeImageOp} />
      )}

      {/* ── Bottom controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 16px', background: T.panel, borderTop: '1px solid ' + T.border }}>
        <Btn active={micOn} danger={!micOn} onClick={toggleMic}>{micOn ? 'Mic on' : 'Mic off'}</Btn>
        <Btn active={camOn} danger={!camOn} onClick={toggleCam}>{camOn ? 'Camera on' : 'Camera off'}</Btn>
        {isTeacher && (
          <Btn active={sharing} onClick={sharing ? stopShare : startShare}>
            {sharing ? 'Stop sharing' : 'Share screen'}
          </Btn>
        )}
        {isTeacher && (
          <Btn danger={recording} onClick={recording ? stopRecording : startRecording}>
            {recording
              ? 'Stop recording ' + String(Math.floor(recSecs / 60)).padStart(2, '0') + ':' + String(recSecs % 60).padStart(2, '0')
              : 'Record'}
          </Btn>
        )}
        {!isTeacher && <Btn active={handUp} onClick={toggleHand}>{handUp ? 'Lower hand' : 'Raise hand'}</Btn>}
        {narrow && (
          <Btn active={panelOpen} onClick={() => setPanelOpen(o => !o)}>
            Chat ({roster.length})
          </Btn>
        )}
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

// ── Library PDF page picker (teacher) ──────────────────────
// Search the Library, choose a book and a page, and the page is
// rendered client-side with the bundled pdf.js, compressed, and
// pushed onto the shared board as an image op.
function LibraryPagePicker({ onClose, onPlace }) {
  const [q, setQ] = useState('')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [book, setBook] = useState(null)
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(false)
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

  const addPage = async () => {
    if (!book) return
    setBusy(true); setErr('')
    try {
      // Runtime-only import: pdf.js ships as a static asset in
      // /public/pdfjs, not as a bundled dependency. The URL is built
      // at runtime so Vite/Rollup does not try to resolve it at
      // build time (a literal string here fails the Netlify build).
      const pdfjsUrl = new URL('/pdfjs/pdf.min.mjs', window.location.origin).href
      const pdfjs = await import(/* @vite-ignore */ pdfjsUrl)
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'
      const token = localStorage.getItem('sm_token') || ''
      const base = (api?.defaults?.baseURL || '')
      const doc = await pdfjs.getDocument({
        url: base + '/library/' + book._id + '/stream',
        httpHeaders: { Authorization: 'Bearer ' + token },
        rangeChunkSize: 1048576,
      }).promise
      const n = Math.min(Math.max(1, Number(page) || 1), doc.numPages)
      const pdfPage = await doc.getPage(n)
      const viewport = pdfPage.getViewport({ scale: 1.6 })
      const c = document.createElement('canvas')
      c.width = viewport.width; c.height = viewport.height
      await pdfPage.render({ canvasContext: c.getContext('2d'), viewport }).promise
      onPlace(c.toDataURL('image/jpeg', 0.82), c.width, c.height)
      doc.destroy()
      onClose()
    } catch (e) {
      console.error('[lib picker]', e)
      setErr('Could not render that page. Try another page or book.')
    } finally { setBusy(false) }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#131A26', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, width: '100%', maxWidth: 460, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, flex: 1 }}>Add a Library page to the board</div>
          <Btn onClick={onClose} style={{ padding: '5px 10px' }}>Close</Btn>
        </div>
        <div style={{ padding: '12px 18px' }}>
          <input value={q} onChange={e => { setQ(e.target.value); setBook(null) }}
            placeholder="Search books by title or subject"
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 12.5, outline: 'none' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {loading ? (
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12.5, padding: 16, textAlign: 'center' }}>Loading...</div>
          ) : books.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12.5, padding: 16, textAlign: 'center' }}>No books found.</div>
          ) : books.slice(0, 30).map(b => (
            <div key={b._id} onClick={() => setBook(b)}
              style={{
                padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                background: book?._id === b._id ? 'rgba(96,165,250,.25)' : 'rgba(255,255,255,.05)',
                border: book?._id === b._id ? '1px solid rgba(96,165,250,.6)' : '1px solid transparent',
              }}>
              <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 700 }}>{b.title}</div>
              <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 10.5, marginTop: 2 }}>
                {[b.subjectName, b.grade, b.curriculum].filter(Boolean).join(' \u00b7 ')}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>Page</span>
          <input type="number" min="1" value={page} onChange={e => setPage(e.target.value)}
            style={{ width: 64, background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 7, padding: '8px 10px', color: '#fff', fontSize: 12.5, outline: 'none' }} />
          <div style={{ flex: 1, color: '#F87171', fontSize: 11 }}>{err}</div>
          <Btn onClick={addPage} disabled={!book || busy}
            style={{ background: '#C9A030', color: '#7D1025', fontWeight: 800 }}>
            {busy ? 'Rendering...' : 'Add to board'}
          </Btn>
        </div>
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
