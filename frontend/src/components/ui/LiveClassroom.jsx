/**
 * LiveClassroom.jsx — Microsoft Whiteboard-style infinite canvas classroom
 * - Infinite pan/scroll canvas (drag to pan like MS Whiteboard)
 * - Zoom in/out with scroll wheel or pinch
 * - Draw, shapes, text, eraser, sticky notes
 * - Attach images/PDFs by drag-drop or file picker — shown as sticky cards on board
 * - Teacher: full control; Student: view-only board, can raise hand
 * - Chat panel, participants list, mic/cam toggles
 */
import { useState, useRef, useEffect, useCallback } from 'react'

const DEMO_STUDENTS = [
  { id:'AO', name:'Amara Osei',    col:'#3B82F6', online:true,  hand:true,  muted:false },
  { id:'KM', name:'Kofi Mensah',   col:'#22C55E', online:true,  hand:false, muted:true  },
  { id:'ZK', name:'Zara Kamau',    col:'#8B5CF6', online:true,  hand:false, muted:false },
  { id:'BO', name:'Brian Otieno',  col:'#F59E0B', online:true,  hand:false, muted:true  },
  { id:'FW', name:'Faith Wanjiru', col:'#EC4899', online:true,  hand:false, muted:false },
  { id:'DM', name:'David Mwangi',  col:'#14B8A6', online:false, hand:false, muted:true  },
]

const Btn = ({ children, active, danger, label, onClick, style = {} }) => (
  <button onClick={onClick} title={label} style={{
    display:'flex', alignItems:'center', justifyContent:'center', gap:4,
    border:'none', borderRadius:8, padding:'8px 10px', cursor:'pointer', fontSize:12, fontWeight:600,
    transition:'background .15s',
    background: danger ? '#EF4444' : active ? 'rgba(96,165,250,.35)' : 'rgba(255,255,255,.1)',
    color: danger || active ? '#fff' : 'rgba(255,255,255,.8)',
    ...style,
  }}>
    {children}{label && <span>{label}</span>}
  </button>
)

export default function LiveClassroom({ role = 'teacher', onLeave }) {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)
  const fileRef      = useRef(null)

  // View/tool state
  const [tool,       setTool]       = useState('pen')   // pen | eraser | line | rect | circle | text | pan | sticky
  const [colour,     setColour]     = useState('#FFFFFF')
  const [lineW,      setLineW]      = useState(3)
  const [micOn,      setMicOn]      = useState(true)
  const [camOn,      setCamOn]      = useState(true)
  const [handRaised, setHandRaised] = useState(false)
  const [elapsed,    setElapsed]    = useState(0)
  const [panel,      setPanel]      = useState('chat')  // chat | people | files

  // Infinite canvas state
  const [zoom,    setZoom]    = useState(1)
  const [offset,  setOffset]  = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef(null)

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPt   = useRef(null)
  const snapshot = useRef(null)

  // Attachments — files dropped onto the board
  const [attachments, setAttachments] = useState([
    { id:'att-0', name:'Pythagoras Worksheet.pdf', type:'pdf', x:60, y:80,  col:'#1E3A8A', dragging:false },
    { id:'att-1', name:'Geometry Diagram.png',     type:'img', x:340, y:200, col:'#14532D', dragging:false },
  ])
  const [dragAttach, setDragAttach] = useState(null)

  // Sticky notes
  const [stickies, setStickies] = useState([
    { id:'st-0', text:'Remember: c² = a² + b²', x:500, y:60, col:'#FCD34D' },
  ])

  // Chat
  const [chatMsgs, setChatMsgs] = useState([
    { who:'teacher', name:'Mr. Muthomi', text:'Good morning everyone! Today: Pythagoras Theorem.', time:'09:01' },
    { who:'student',  name:'Amara Osei',  text:'Good morning, sir!', time:'09:01' },
  ])
  const [chatInp, setChatInp] = useState('')
  const chatEndRef = useRef(null)

  const [participants, setParticipants] = useState(DEMO_STUDENTS)

  // ── Timer ────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  // ── Canvas setup ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      // Save existing content
      const img = canvas.width > 0 && canvas.height > 0
        ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null
      canvas.width  = Math.max(width,  100)
      canvas.height = Math.max(height, 100)
      ctx.fillStyle = '#0D1525'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // Draw subtle dot-grid
      ctx.fillStyle = 'rgba(255,255,255,.04)'
      const sp = 32
      for (let x = 0; x < canvas.width; x += sp)
        for (let y = 0; y < canvas.height; y += sp)
          ctx.fillRect(x, y, 1.5, 1.5)
      if (img) ctx.putImageData(img, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  // ── Coordinate helpers (world ↔ canvas) ──────────────────
  const toWorld = useCallback((cx, cy) => ({
    x: (cx - offset.x) / zoom,
    y: (cy - offset.y) / zoom,
  }), [offset, zoom])

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const src  = e.touches ? e.touches[0] : e
    return { cx: src.clientX - rect.left, cy: src.clientY - rect.top }
  }

  // ── Zoom (scroll wheel) ──────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault()
    const { cx, cy } = getCanvasPos(e)
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    setZoom(z => {
      const nz = Math.min(4, Math.max(0.25, z * factor))
      // Keep the point under cursor fixed
      setOffset(o => ({
        x: cx - (cx - o.x) * (nz / z),
        y: cy - (cy - o.y) * (nz / z),
      }))
      return nz
    })
  }, [])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  // ── Drawing ──────────────────────────────────────────────
  const ctxStyle = useCallback((ctx) => {
    ctx.strokeStyle = tool === 'eraser' ? '#0D1525' : colour
    ctx.lineWidth   = (tool === 'eraser' ? lineW * 6 : lineW) / zoom
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
  }, [tool, colour, lineW, zoom])

  const onPointerDown = useCallback((e) => {
    if (role !== 'teacher') return
    const { cx, cy } = getCanvasPos(e)
    const wp = toWorld(cx, cy)

    if (tool === 'pan' || (e.button === 1)) {
      setIsPanning(true)
      panStart.current = { cx, cy, ox: offset.x, oy: offset.y }
      return
    }

    if (tool === 'sticky') {
      setStickies(s => [...s, { id:'st-'+Date.now(), text:'Double-click to edit', x: wp.x, y: wp.y, col:'#FCD34D' }])
      return
    }

    setIsDrawing(true)
    lastPt.current = wp
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height)

    if (tool === 'pen' || tool === 'eraser') {
      ctx.save()
      ctx.translate(offset.x, offset.y)
      ctx.scale(zoom, zoom)
      ctxStyle(ctx)
      ctx.beginPath()
      ctx.moveTo(wp.x, wp.y)
      ctx.restore()
    }
  }, [role, tool, offset, zoom, toWorld, ctxStyle])

  const onPointerMove = useCallback((e) => {
    if (role !== 'teacher') return
    const { cx, cy } = getCanvasPos(e)

    if (isPanning && panStart.current) {
      setOffset({
        x: panStart.current.ox + (cx - panStart.current.cx),
        y: panStart.current.oy + (cy - panStart.current.cy),
      })
      return
    }

    if (!isDrawing) return
    const wp = toWorld(cx, cy)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(zoom, zoom)
    ctxStyle(ctx)

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(lastPt.current.x, lastPt.current.y)
      ctx.lineTo(wp.x, wp.y)
      ctx.stroke()
      lastPt.current = wp
    } else if (snapshot.current && (tool === 'line' || tool === 'rect' || tool === 'circle')) {
      ctx.restore()
      ctx.putImageData(snapshot.current, 0, 0)
      ctx.save()
      ctx.translate(offset.x, offset.y)
      ctx.scale(zoom, zoom)
      ctxStyle(ctx)
      const sx = lastPt.current.x, sy = lastPt.current.y
      if (tool === 'line') {
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(wp.x, wp.y); ctx.stroke()
      } else if (tool === 'rect') {
        ctx.strokeRect(sx, sy, wp.x - sx, wp.y - sy)
      } else if (tool === 'circle') {
        const rx = Math.abs(wp.x - sx) / 2, ry = Math.abs(wp.y - sy) / 2
        ctx.beginPath()
        ctx.ellipse(sx + (wp.x-sx)/2, sy + (wp.y-sy)/2, rx, ry, 0, 0, Math.PI*2)
        ctx.stroke()
      }
    }
    ctx.restore()
  }, [role, isPanning, isDrawing, tool, offset, zoom, toWorld, ctxStyle])

  const onPointerUp = useCallback(() => {
    setIsDrawing(false)
    setIsPanning(false)
    panStart.current = null
    snapshot.current = null
  }, [])

  // ── File attachment drop / pick ───────────────────────────
  const handleFileDrop = useCallback((e) => {
    e.preventDefault()
    const files = e.dataTransfer?.files || e.target?.files
    if (!files) return
    Array.from(files).forEach(file => {
      const isImg = file.type.startsWith('image/')
      const isPdf = file.type === 'application/pdf'
      if (!isImg && !isPdf) return
      const reader = new FileReader()
      reader.onload = ev => {
        const rect = canvasRef.current?.getBoundingClientRect() || { left:0, top:0, width:800, height:500 }
        const dropX = e.clientX ? (e.clientX - rect.left - offset.x) / zoom : 100 + Math.random()*200
        const dropY = e.clientY ? (e.clientY - rect.top  - offset.y) / zoom : 100 + Math.random()*200
        setAttachments(a => [...a, {
          id:    'att-' + Date.now(),
          name:  file.name,
          type:  isImg ? 'img' : 'pdf',
          src:   isImg ? ev.target.result : null,
          x:     dropX,
          y:     dropY,
          col:   isImg ? '#14532D' : '#7C3AED',
          w:     isImg ? 180 : 140,
          h:     isImg ? 130 : 100,
        }])
      }
      if (isImg) reader.readAsDataURL(file)
      else reader.readAsArrayBuffer(file)
    })
  }, [offset, zoom])

  // ── Sticky note edit ─────────────────────────────────────
  const editSticky = (id, text) => setStickies(s => s.map(n => n.id===id ? {...n, text} : n))
  const delSticky  = (id) => setStickies(s => s.filter(n => n.id!==id))

  // ── Chat ─────────────────────────────────────────────────
  const sendChat = () => {
    if (!chatInp.trim()) return
    setChatMsgs(m => [...m, { who:'teacher', name:'Mr. Muthomi', text:chatInp.trim(), time: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) }])
    setChatInp('')
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:'smooth' }), 50)
  }

  // ── Reset view ───────────────────────────────────────────
  const resetView = () => { setZoom(1); setOffset({ x:0, y:0 }) }

  // ── RENDER ───────────────────────────────────────────────
  const toolBtn = (id, icon, title) => (
    <Btn key={id} active={tool===id} label={title} onClick={() => setTool(id)} style={{flexDirection:'column',padding:'6px 8px',fontSize:10,gap:2}}>
      {icon}
    </Btn>
  )

  return (
    <div ref={containerRef} style={{ display:'flex', height:'100vh', background:'#060D1A', color:'#fff', fontFamily:'Inter,sans-serif', overflow:'hidden' }}>

      {/* ── LEFT TOOLBAR ── */}
      <div style={{ width:58, background:'rgba(0,0,0,.4)', borderRight:'1px solid rgba(255,255,255,.08)', display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 6px', gap:4, zIndex:10, overflowY:'auto' }}>
        {/* Draw tools */}
        {toolBtn('pen',    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>, 'Pen')}
        {toolBtn('eraser', <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 20H7L3 16l10-10 7 7-3.5 3.5"/><path d="M6.5 17.5l4-4"/></svg>, 'Eraser')}
        {toolBtn('line',   <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>, 'Line')}
        {toolBtn('rect',   <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>, 'Rectangle')}
        {toolBtn('circle', <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/></svg>, 'Circle')}
        {toolBtn('sticky', <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8l6-6V4a2 2 0 0 0-2-2z"/><polyline points="14 2 14 8 20 8"/></svg>, 'Sticky Note')}
        {toolBtn('pan',    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34L4 17"/></svg>, 'Pan / Move')}

        <div style={{ height:1, width:'80%', background:'rgba(255,255,255,.1)', margin:'4px 0' }}/>

        {/* Colour swatches */}
        {['#FFFFFF','#FF4444','#4ADE80','#60A5FA','#FBBF24','#E879F9','#F97316'].map(c => (
          <div key={c} onClick={() => setColour(c)} style={{ width:22, height:22, borderRadius:'50%', background:c, cursor:'pointer', border: colour===c ? '2px solid #fff' : '2px solid transparent', flexShrink:0 }}/>
        ))}

        <div style={{ height:1, width:'80%', background:'rgba(255,255,255,.1)', margin:'4px 0' }}/>

        {/* Line width */}
        {[2,4,8].map(w => (
          <div key={w} onClick={() => setLineW(w)} style={{ width:20, height:w+2, borderRadius:w, background: lineW===w?'#60A5FA':'rgba(255,255,255,.3)', cursor:'pointer', margin:'2px 0' }}/>
        ))}

        <div style={{ flex:1 }}/>

        {/* Attach file button */}
        <Btn label="Attach" onClick={() => fileRef.current?.click()} style={{flexDirection:'column',padding:'6px 8px',fontSize:10,gap:2}}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </Btn>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple style={{display:'none'}} onChange={handleFileDrop}/>

        {/* Zoom reset */}
        <Btn onClick={resetView} label={Math.round(zoom*100)+'%'} style={{flexDirection:'column',padding:'4px 6px',fontSize:9,gap:1}}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </Btn>
      </div>

      {/* ── MAIN CANVAS AREA ── */}
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleFileDrop}
      >
        {/* Infinite canvas */}
        <canvas
          ref={canvasRef}
          style={{ width:'100%', height:'100%', display:'block', cursor: tool==='pan'||isPanning ? 'grabbing' : tool==='eraser' ? 'cell' : 'crosshair' }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        />

        {/* ── ATTACHMENTS on board ── */}
        {attachments.map(att => (
          <div key={att.id}
            style={{
              position:'absolute',
              left: att.x * zoom + offset.x,
              top:  att.y * zoom + offset.y,
              width: (att.w||140) * zoom,
              minHeight: (att.h||100) * zoom,
              background: att.type==='img' && att.src ? 'transparent' : att.col+'22',
              border: `2px solid ${att.col}`,
              borderRadius: 8*zoom,
              cursor:'move',
              userSelect:'none',
              overflow:'hidden',
              zIndex:5,
              fontSize: 11*zoom,
            }}
            onMouseDown={e => {
              e.stopPropagation()
              const startX = e.clientX, startY = e.clientY
              const origX = att.x, origY = att.y
              const move = ev => setAttachments(a => a.map(x => x.id===att.id ? {...x, x: origX+(ev.clientX-startX)/zoom, y: origY+(ev.clientY-startY)/zoom} : x))
              const up   = () => { document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up) }
              document.addEventListener('mousemove',move)
              document.addEventListener('mouseup',up)
            }}
          >
            {att.type==='img' && att.src ? (
              <img src={att.src} alt={att.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:6*zoom,display:'block'}}/>
            ) : (
              <div style={{padding:8*zoom}}>
                <div style={{display:'flex',alignItems:'center',gap:4*zoom,marginBottom:4*zoom}}>
                  <svg width={14*zoom} height={14*zoom} fill="none" viewBox="0 0 24 24" stroke={att.col} strokeWidth="2" strokeLinecap="round">
                    {att.type==='pdf' ? <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> : <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>}
                  </svg>
                  <span style={{color:att.col,fontWeight:700,fontSize:11*zoom,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{att.name}</span>
                </div>
                <div style={{fontSize:10*zoom,color:'rgba(255,255,255,.4)',textTransform:'uppercase'}}>{att.type.toUpperCase()}</div>
              </div>
            )}
            {/* Delete handle */}
            <div onClick={() => setAttachments(a => a.filter(x => x.id!==att.id))}
              style={{position:'absolute',top:2,right:2,width:16*zoom,height:16*zoom,borderRadius:'50%',background:'rgba(239,68,68,.8)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:10*zoom,color:'#fff',fontWeight:700}}>
              ×
            </div>
          </div>
        ))}

        {/* ── STICKY NOTES on board ── */}
        {stickies.map(note => (
          <div key={note.id}
            style={{
              position:'absolute',
              left: note.x * zoom + offset.x,
              top:  note.y * zoom + offset.y,
              width: 140*zoom,
              minHeight: 80*zoom,
              background: note.col,
              borderRadius: 6*zoom,
              padding: 8*zoom,
              zIndex:6,
              boxShadow:'0 4px 12px rgba(0,0,0,.4)',
              cursor:'move',
              userSelect:'none',
            }}
            onMouseDown={e => {
              e.stopPropagation()
              const sx=e.clientX, sy=e.clientY, ox=note.x, oy=note.y
              const mv = ev => setStickies(s => s.map(n => n.id===note.id ? {...n, x:ox+(ev.clientX-sx)/zoom, y:oy+(ev.clientY-sy)/zoom} : n))
              const up = () => { document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up) }
              document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up)
            }}
          >
            <textarea
              style={{width:'100%',background:'transparent',border:'none',outline:'none',resize:'none',fontSize:11*zoom,fontFamily:'Inter,sans-serif',fontWeight:600,color:'#1A1A2E',minHeight:50*zoom,cursor:'text'}}
              value={note.text}
              onChange={e => editSticky(note.id, e.target.value)}
              onMouseDown={e => e.stopPropagation()}
            />
            <div onClick={() => delSticky(note.id)} style={{position:'absolute',top:2,right:2,fontSize:10*zoom,color:'rgba(0,0,0,.4)',cursor:'pointer',fontWeight:700}}>×</div>
          </div>
        ))}

        {/* Drop zone hint */}
        <div style={{position:'absolute',bottom:14,left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,.5)',border:'1px solid rgba(255,255,255,.1)',borderRadius:99,padding:'6px 16px',fontSize:11,color:'rgba(255,255,255,.4)',pointerEvents:'none'}}>
          Drop image or PDF to attach · Scroll to zoom · {role==='teacher'?'Drag with Pan tool to move':'View only'}
        </div>

        {/* Student view-only banner */}
        {role === 'student' && (
          <div style={{position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,.6)',border:'1px solid rgba(255,255,255,.1)',borderRadius:99,padding:'5px 16px',fontSize:12,color:'rgba(255,255,255,.6)'}}>
            View-only · Raise hand to ask a question
          </div>
        )}

        {/* TOP BAR */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:52,background:'rgba(6,13,26,.85)',backdropFilter:'blur(8px)',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',padding:'0 14px',gap:12,zIndex:20}}>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700}}>Mathematics — Pythagoras Theorem</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>Mr. Muthomi · IGCSE Form 3 · {fmt(elapsed)}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#4ADE80',animation:'pulse 1.5s infinite'}}/>
            <span style={{fontSize:12,color:'rgba(255,255,255,.6)'}}>{participants.filter(p=>p.online).length} online</span>
          </div>
          {/* Zoom controls */}
          <div style={{display:'flex',gap:4,alignItems:'center'}}>
            <Btn onClick={() => setZoom(z => Math.max(0.25, z*0.8))}>−</Btn>
            <span style={{fontSize:11,minWidth:36,textAlign:'center',color:'rgba(255,255,255,.5)'}}>{Math.round(zoom*100)}%</span>
            <Btn onClick={() => setZoom(z => Math.min(4, z*1.25))}>+</Btn>
            <Btn onClick={resetView} style={{fontSize:10}}>Reset</Btn>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{width:280, background:'rgba(0,0,0,.4)', borderLeft:'1px solid rgba(255,255,255,.07)', display:'flex', flexDirection:'column', zIndex:10}}>

        {/* Panel tabs */}
        <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          {[['chat','Chat'],['people','People'],['files','Files']].map(([id,l]) => (
            <button key={id} onClick={() => setPanel(id)}
              style={{flex:1,padding:'12px 0',fontSize:12,fontWeight:panel===id?700:400,background:'transparent',border:'none',borderBottom:panel===id?'2px solid #60A5FA':'2px solid transparent',color:panel===id?'#60A5FA':'rgba(255,255,255,.5)',cursor:'pointer'}}>
              {l}
            </button>
          ))}
        </div>

        {/* Chat panel */}
        {panel==='chat' && (
          <>
            <div style={{flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:10}}>
              {chatMsgs.map((m,i) => (
                <div key={i} style={{display:'flex',gap:8,flexDirection:m.who==='teacher'?'row-reverse':'row',alignItems:'flex-end'}}>
                  <div style={{width:24,height:24,borderRadius:'50%',background:m.who==='teacher'?'#1D4ED8':'#374151',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0}}>
                    {m.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div style={{background:m.who==='teacher'?'#1D4ED8':'rgba(255,255,255,.08)',borderRadius:m.who==='teacher'?'12px 12px 4px 12px':'4px 12px 12px 12px',padding:'8px 10px',maxWidth:'78%',fontSize:13}}>
                    <div style={{opacity:.5,fontSize:10,marginBottom:2}}>{m.name}</div>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}/>
            </div>
            <div style={{padding:10,borderTop:'1px solid rgba(255,255,255,.07)',display:'flex',gap:8}}>
              <input value={chatInp} onChange={e=>setChatInp(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();sendChat()}}}
                placeholder="Type a message…"
                style={{flex:1,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'8px 12px',color:'#fff',fontSize:13,outline:'none'}}/>
              <button onClick={sendChat} style={{background:'#1D4ED8',border:'none',borderRadius:8,padding:'8px 12px',cursor:'pointer',color:'#fff'}}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </>
        )}

        {/* People panel */}
        {panel==='people' && (
          <div style={{flex:1,overflowY:'auto',padding:12}}>
            <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>In this session</div>
            {participants.map((p,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:p.col+'30',color:p.col,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:11,flexShrink:0,position:'relative'}}>
                  {p.id}
                  <div style={{position:'absolute',bottom:0,right:0,width:8,height:8,borderRadius:'50%',background:p.online?'#4ADE80':'#6B7280',border:'1px solid #060D1A'}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{p.name}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>{p.online?'Online':'Offline'}</div>
                </div>
                {p.hand && <div style={{fontSize:18}}>✋</div>}
                {p.muted && <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,100,100,.6)" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>}
              </div>
            ))}
          </div>
        )}

        {/* Files panel */}
        {panel==='files' && (
          <div style={{flex:1,overflowY:'auto',padding:12}}>
            <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>Board attachments</div>
            <div
              onDragOver={e=>e.preventDefault()}
              onDrop={handleFileDrop}
              style={{border:'2px dashed rgba(255,255,255,.15)',borderRadius:10,padding:16,textAlign:'center',marginBottom:14,cursor:'pointer'}}
              onClick={() => fileRef.current?.click()}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" strokeLinecap="round" style={{margin:'0 auto 8px'}}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              <div style={{fontSize:12,color:'rgba(255,255,255,.3)'}}>Drop files here or click to upload</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.2)',marginTop:4}}>Images and PDFs</div>
            </div>
            {attachments.length === 0 && <div style={{fontSize:13,color:'rgba(255,255,255,.3)',textAlign:'center'}}>No files attached yet</div>}
            {attachments.map(att => (
              <div key={att.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:'rgba(255,255,255,.05)',borderRadius:8,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:6,background:att.col+'30',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={att.col} strokeWidth="2" strokeLinecap="round">
                    {att.type==='pdf' ? <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> : <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>}
                  </svg>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{att.name}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.3)',textTransform:'uppercase'}}>{att.type}</div>
                </div>
                <button onClick={() => setAttachments(a => a.filter(x => x.id!==att.id))} style={{background:'transparent',border:'none',color:'rgba(255,100,100,.6)',cursor:'pointer',fontSize:16,padding:0}}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom controls */}
        <div style={{padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,.07)',display:'flex',gap:8,justifyContent:'center'}}>
          <Btn active={micOn} onClick={() => setMicOn(v=>!v)} danger={!micOn} label={micOn?'Mic':'Muted'}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{micOn ? <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></> : <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/></>}</svg>
          </Btn>
          <Btn active={camOn} onClick={() => setCamOn(v=>!v)} danger={!camOn} label={camOn?'Cam':'Off'}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{camOn ? <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></> : <><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><line x1="1" y1="1" x2="23" y2="23"/></>}</svg>
          </Btn>
          {role==='student' && (
            <Btn active={handRaised} onClick={() => setHandRaised(v=>!v)} label={handRaised?'Lower':'Hand'}>
              <svg width="14" height="14" fill={handRaised?'#FBBF24':'none'} viewBox="0 0 24 24" stroke={handRaised?'#FBBF24':'currentColor'} strokeWidth="2" strokeLinecap="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34L4 17"/></svg>
            </Btn>
          )}
          <Btn danger onClick={onLeave} label="Leave">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </Btn>
        </div>
      </div>
    </div>
  )
}
