import { useState, useEffect, useCallback } from 'react'
import { api } from '../../context/ctx.jsx'

// ── Tokens matching admin/student/teacher portals ──────────
const C = {
  crimson:'#7D1025', crimsonD:'#5A0B1B', gold:'#C9A030', goldPale:'#FBF6E3',
  cream:'#FBFAF5', ink:'#1A0F0E', s900:'#231715', s700:'#564844', s500:'#857973',
  s400:'#A89E99', s200:'#E8E1DC', s100:'#F4EFEB', line:'#E8E2D6', white:'#fff',
}

const money  = (n,cur='USD') => ({USD:'$',KES:'KES ',GBP:'£',EUR:'€',AED:'AED '}[cur]||'')+(n||0).toLocaleString()
const fmtD   = d => d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'
const fmtT   = hhmm => { if(!hhmm)return ''; const[h,m]=hhmm.split(':').map(Number); const mer=h>=12?'PM':'AM'; let hr=h%12; if(!hr)hr=12; return `${hr}${m?':'+String(m).padStart(2,'0'):''} ${mer}` }
const gc     = s => s>=80?'#065F46':s>=70?'#1E40AF':s>=60?'#92400E':s>=50?'#6B21A8':'#991B1B'
const gl     = s => s>=80?'A*':s>=70?'B':s>=60?'C':s>=50?'D':s>=40?'E':'U'

// ── Shared section header ──────────────────────────────────
function PSection({ tag, title, em, sub }) {
  return (
    <div style={{ marginBottom:20 }}>
      {tag&&<div style={{ fontSize:10, fontWeight:700, color:C.crimson, textTransform:'uppercase', letterSpacing:'.14em', marginBottom:4 }}>{tag}</div>}
      <h2 style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:26, fontWeight:400, color:C.ink, margin:'4px 0 6px', lineHeight:1.15 }}>
        {title}{em&&<em style={{ fontStyle:'italic', color:C.crimson }}> {em}</em>}
      </h2>
      {sub&&<div style={{ fontSize:13, color:C.s500, lineHeight:1.55 }}>{sub}</div>}
    </div>
  )
}

// ── NAV items ──────────────────────────────────────────────
const NAV_SECTIONS = [
  { section:'Child Overview', items:[
    { id:'dashboard',  label:'Dashboard',         icon:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
    { id:'reports',    label:'Academic Reports',  icon:'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
    { id:'timetable',  label:'Timetable',         icon:'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
    { id:'lessons',    label:'Live Lessons',      icon:'M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z', live:true },
    { id:'messages',   label:'Messages',          icon:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  ]},
  { section:'Finance', items:[
    { id:'fees',       label:'Fees & Invoices',   icon:'M2 5h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zM2 10h20' },
  ]},
  { section:'More', items:[
    { id:'programme',  label:'Programme Details', icon:'M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5' },
    { id:'tutor',      label:'Tutor & Advisor',   icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ]},
]

const PAGE_TITLES = {
  dashboard:'Dashboard', reports:'Academic Reports', timetable:'Timetable',
  lessons:'Live Lessons', messages:'Messages', fees:'Fees & Invoices',
  programme:'Programme Details', tutor:'Tutor & Advisor',
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function ParentPortal() {
  const [page,            setPage]            = useState('dashboard')
  const [user,            setUser]            = useState(null)
  const [children,        setChildren]        = useState([])
  const [selectedChild,   setSelectedChild]   = useState(null)
  const [collapsed,       setCollapsed]       = useState(false)
  const [linkModal,       setLinkModal]       = useState(false)
  const [linkAdm,         setLinkAdm]         = useState('')
  const [linking,         setLinking]         = useState(false)
  const [toast,           setToast]           = useState(null)

  const showToast = (msg, type='ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    const raw = localStorage.getItem('sm_user')
    if (raw) { try { setUser(JSON.parse(raw)) } catch {} }
    api.get('/parent/children')
      .then(r => {
        const kids = r.data?.data?.children || []
        setChildren(kids)
        if (kids.length > 0) setSelectedChild(kids[0])
      })
      .catch(() => {})
  }, [])

  const linkStudent = async () => {
    if (!linkAdm.trim()) return
    setLinking(true)
    try {
      const r = await api.post('/parent/link', { admissionNo: linkAdm.trim() })
      showToast(r.data?.message || 'Student linked!')
      setLinkModal(false); setLinkAdm('')
      const r2 = await api.get('/parent/children')
      const kids = r2.data?.data?.children || []
      setChildren(kids)
      if (kids.length > 0 && !selectedChild) setSelectedChild(kids[0])
    } catch(e) { showToast(e?.response?.data?.message || 'Failed to link student.', 'err') }
    finally { setLinking(false) }
  }

  const parentName = user ? `${user.firstName||''} ${user.lastName||''}`.trim() : 'Parent'
  const initials   = user ? ((user.firstName?.[0]||'')+(user.lastName?.[0]||'')).toUpperCase() : 'P'

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:C.cream, fontFamily:"Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color:C.ink }}>

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width:collapsed?76:252, flexShrink:0, background:C.cream, borderRight:`1px solid ${C.s100}`, display:'flex', flexDirection:'column', height:'100vh', overflowY:'auto', overflowX:'hidden', transition:'width .25s cubic-bezier(.22,.61,.36,1)', position:'relative', zIndex:50, scrollbarWidth:'none' }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:collapsed?'20px 0':'20px 22px', justifyContent:collapsed?'center':'flex-start', borderBottom:`1px solid ${C.s100}`, minHeight:72, flexShrink:0 }}>
          <svg viewBox="0 0 64 72" width="38" height="42" style={{ flexShrink:0 }} xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4 L60 4 L60 44 Q60 56 32 68 Q4 56 4 44 Z" fill="#C9A030"/>
            <path d="M7 7 L57 7 L57 44 Q57 54 32 65 Q7 54 7 44 Z" fill="#7D1025"/>
            <polygon points="32,16 33.6,20.8 38.7,20.8 34.6,23.8 36.2,28.6 32,25.6 27.8,28.6 29.4,23.8 25.3,20.8 30.4,20.8" fill="#C9A030"/>
            <path d="M16 36 Q24 32 32 34 L32 52 Q24 50 16 54 Z" fill="#fff"/>
            <path d="M48 36 Q40 32 32 34 L32 52 Q40 50 48 54 Z" fill="#fff"/>
          </svg>
          {!collapsed&&(
            <div>
              <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:22, fontWeight:400, color:C.ink, lineHeight:1 }}>
                Smart<em style={{ fontStyle:'italic', color:C.crimson }}>ious</em>
              </div>
              <div style={{ fontSize:9.5, color:C.crimson, letterSpacing:'.14em', textTransform:'uppercase', marginTop:4, fontWeight:700 }}>Parent Portal</div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button onClick={()=>setCollapsed(c=>!c)} style={{ position:'absolute', top:24, right:-13, width:26, height:26, borderRadius:'50%', background:C.white, border:`1px solid ${C.s200}`, boxShadow:'0 2px 8px rgba(0,0,0,.06)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:60 }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={C.s500} strokeWidth="2.5" strokeLinecap="round" style={{ transform:collapsed?'rotate(180deg)':'none', transition:'transform .25s' }}>
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        {/* Nav */}
        <nav style={{ flex:1, paddingTop:14, paddingBottom:8, overflowY:'auto', scrollbarWidth:'thin' }}>
          {NAV_SECTIONS.map((s,si)=>(
            <div key={si} style={{ marginBottom:18 }}>
              {!collapsed&&<div style={{ fontSize:10, fontWeight:700, color:C.crimson, letterSpacing:'.14em', textTransform:'uppercase', padding:'0 22px 8px' }}>{s.section}</div>}
              {s.items.map(item=>{
                const active = page===item.id
                return (
                  <div key={item.id} onClick={()=>setPage(item.id)} title={collapsed?item.label:undefined}
                    style={{ position:'relative', display:'flex', alignItems:'center', gap:collapsed?0:12, padding:collapsed?'11px 0':'10px 22px', margin:'2px 12px', borderRadius:8, cursor:'pointer', background:active?C.goldPale:'transparent', color:active?C.crimson:C.s700, fontWeight:active?600:500, fontSize:13.5, transition:'background .15s', justifyContent:collapsed?'center':'flex-start' }}
                    onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='#FAF7F4' }}
                    onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent' }}>
                    {active&&!collapsed&&<div style={{ position:'absolute', left:-12, top:8, bottom:8, width:3, borderRadius:'0 3px 3px 0', background:C.gold, boxShadow:`0 0 8px ${C.gold}60` }}/>}
                    <div style={{ width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active?C.crimson:C.s500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon}/>
                      </svg>
                    </div>
                    {!collapsed&&(
                      <>
                        <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</span>
                        {item.live&&<span style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E', display:'inline-block' }}/>}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Child selector */}
        {!collapsed&&children.length>0&&(
          <div style={{ padding:'10px 14px', borderTop:`1px solid ${C.s100}` }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.crimson, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>
              {children.length>1?'Viewing':'Child'}
            </div>
            {children.length>1?(
              <select value={selectedChild?._id||''} onChange={e=>setSelectedChild(children.find(c=>String(c._id)===e.target.value))}
                style={{ width:'100%', padding:'7px 9px', borderRadius:8, border:`1px solid ${C.line}`, fontSize:13, fontFamily:'inherit', fontWeight:600, color:C.s900, background:'#fff', color:C.ink }}>
                {children.map(c=><option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
              </select>
            ):(
              <div style={{ fontSize:13.5, fontWeight:700, color:C.ink }}>{children[0]?.firstName} {children[0]?.lastName}</div>
            )}
            <button onClick={()=>setLinkModal(true)} style={{ marginTop:8, width:'100%', padding:'7px', borderRadius:7, border:`1px dashed ${C.line}`, background:'transparent', color:C.s500, fontSize:12, cursor:'pointer', fontWeight:600 }}>
              + Link another student
            </button>
          </div>
        )}

        {/* User card */}
        <div style={{ flexShrink:0, padding:collapsed?'12px 0 0':'12px 14px', borderTop:`1px solid ${C.s100}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:collapsed?'8px 0':'8px', borderRadius:10, background:C.cream, border:`1px solid ${C.s200}`, justifyContent:collapsed?'center':'flex-start' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${C.crimson},${C.crimsonD})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:'#F0CC5A', fontSize:11, fontWeight:700 }}>{initials}</span>
            </div>
            {!collapsed&&(
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:C.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{parentName}</div>
                <div style={{ fontSize:10.5, color:C.s500, marginTop:2 }}>Parent</div>
              </div>
            )}
          </div>
          <div onClick={()=>{ localStorage.removeItem('sm_token'); localStorage.removeItem('sm_user'); window.location.href='/login' }}
            style={{ marginTop:4, padding:collapsed?'10px 0':'9px 12px', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:12, color:C.s500, fontWeight:500, justifyContent:collapsed?'center':'flex-start', transition:'all .15s', marginBottom:10 }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#FAF7F4'; e.currentTarget.style.color=C.crimson }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=C.s500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {!collapsed&&<span>Log out</span>}
          </div>
        </div>

        <style>{`
          @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
          .card{background:#fff;border:1px solid #E8E2D6;border-radius:12px;}
          .kpi{background:#fff;border:1px solid #E8E2D6;border-radius:12px;padding:16px 18px;transition:all .18s;}
          .kpi:hover{border-color:#7D1025;transform:translateY(-2px);box-shadow:0 12px 28px rgba(125,16,37,.08);}
          .tbl{width:100%;border-collapse:collapse;}
          .tbl thead th{padding:9px 14px;text-align:left;font-size:10.5px;font-weight:700;color:#7D1025;text-transform:uppercase;letter-spacing:.06em;background:#FBFAF5;border-bottom:1.5px solid #E8E2D6;}
          .tbl tbody tr{border-top:1px solid #E8E2D6;}
          .tbl tbody tr:hover{background:#FBFAF5;}
          .tbl td{padding:10px 14px;}
          select,input,textarea,option{color:#1A0F0E!important;}
          select option{background:#fff;}
        `}</style>
      </aside>

      {/* ══ MAIN ══ */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C.cream }}>

        {/* Top bar */}
        <div style={{ position:'sticky', top:0, zIndex:30, background:'rgba(251,250,245,.9)', backdropFilter:'saturate(180%) blur(20px)', WebkitBackdropFilter:'saturate(180%) blur(20px)', borderBottom:`1px solid ${C.s100}`, padding:'13px 28px', display:'flex', alignItems:'center', gap:20, minHeight:60, flexShrink:0 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.crimson, letterSpacing:'.14em', textTransform:'uppercase', marginBottom:3 }}>Parent Portal</div>
            <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:22, fontWeight:400, color:C.ink, lineHeight:1.2 }}>
              {PAGE_TITLES[page]||'Dashboard'}
              {selectedChild&&<span style={{ fontSize:14, fontWeight:400, color:C.s500, marginLeft:12 }}>— {selectedChild.firstName} {selectedChild.lastName}</span>}
            </div>
          </div>
          {children.length===0&&(
            <button onClick={()=>setLinkModal(true)} style={{ background:C.crimson, color:'#fff', border:'none', padding:'8px 18px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
              Link a student
            </button>
          )}
          <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${C.crimson},${C.crimsonD})`, display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid ${C.gold}40` }}>
            <span style={{ color:'#F0CC5A', fontSize:12, fontWeight:700 }}>{initials}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', maxWidth:1400, margin:'0 auto', width:'100%', boxSizing:'border-box', animation:'fadeIn .25s ease' }}>
          {!selectedChild&&page!=='messages'&&page!=='programme'&&page!=='tutor' ? (
            <NoChildLinked onLink={()=>setLinkModal(true)}/>
          ) : (
            <>
              {page==='dashboard'  && <ParentDashboard   child={selectedChild} showToast={showToast}/>}
              {page==='reports'    && <ParentReports      child={selectedChild} showToast={showToast}/>}
              {page==='timetable'  && <ParentTimetable    child={selectedChild}/>}
              {page==='fees'       && <ParentFees         child={selectedChild} showToast={showToast}/>}
              {page==='lessons'    && <ParentLessons      child={selectedChild}/>}
              {page==='messages'   && <ParentMessages     user={user} showToast={showToast}/>}
              {page==='programme'  && <ParentProgramme    child={selectedChild}/>}
              {page==='tutor'      && <ParentTutor        child={selectedChild}/>}
            </>
          )}
        </div>
      </div>

      {/* ── Link student modal ── */}
      {linkModal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setLinkModal(false)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:400, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:16, fontWeight:800, color:C.s900, marginBottom:4 }}>Link a student</div>
            <div style={{ fontSize:13, color:C.s500, marginBottom:20, lineHeight:1.6 }}>
              Enter your child's admission number to link them to your account. Contact the school if you need help finding it.
            </div>
            <label style={{ fontSize:11, fontWeight:700, color:C.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:5, display:'block' }}>Admission number</label>
            <input value={linkAdm} onChange={e=>setLinkAdm(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&linkStudent()}
              placeholder="e.g. SM-2024-001"
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`1.5px solid ${C.line}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box', marginBottom:16, color:C.ink }}/>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={linkStudent} disabled={linking} style={{ flex:1, background:linking?C.s300:C.crimson, color:'#fff', border:'none', padding:'11px', borderRadius:8, fontSize:13, fontWeight:700, cursor:linking?'not-allowed':'pointer' }}>
                {linking?'Linking...':'Link student'}
              </button>
              <button onClick={()=>setLinkModal(false)} style={{ background:'transparent', border:`1.5px solid ${C.line}`, color:C.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast&&(
        <div style={{ position:'fixed', bottom:24, right:24, padding:'13px 20px', borderRadius:10, background:toast.type==='err'?'#FEE2E2':'#D1FAE5', color:toast.type==='err'?'#991B1B':'#065F46', fontSize:13, fontWeight:600, boxShadow:'0 8px 24px rgba(0,0,0,.12)', zIndex:99999, animation:'fadeIn .2s ease' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ── No child linked placeholder ───────────────────────────
function NoChildLinked({ onLink }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, textAlign:'center' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'#FBF6E3', border:`2px solid ${C.gold}40`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:24, color:C.ink, marginBottom:8 }}>No student linked yet</div>
      <div style={{ fontSize:13.5, color:C.s500, maxWidth:400, lineHeight:1.65, marginBottom:24 }}>
        Link your child's account using their admission number to view their progress, timetable, and fees.
      </div>
      <button onClick={onLink} style={{ background:C.crimson, color:'#fff', border:'none', padding:'12px 28px', borderRadius:9, fontSize:14, fontWeight:700, cursor:'pointer' }}>
        Link a student now
      </button>
    </div>
  )
}

// ── Parent Dashboard ──────────────────────────────────────
function ParentDashboard({ child, showToast }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!child?._id) return
    Promise.allSettled([
      api.get('/parent/children/'+child._id+'/reports'),
      api.get('/parent/children/'+child._id+'/fees'),
      api.get('/parent/children/'+child._id+'/timetable'),
    ]).then(([rep, fee, tt]) => {
      setData({
        rep:  rep.status==='fulfilled'  ? rep.value.data?.data  : null,
        fee:  fee.status==='fulfilled'  ? fee.value.data?.data  : null,
        tt:   tt.status==='fulfilled'   ? tt.value.data?.data?.entries||[] : [],
      })
    }).finally(()=>setLoading(false))
  }, [child?._id])

  if (loading) return <Spinner/>
  if (!data) return null

  const now = new Date()
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const today = DAYS[now.getDay()]
  const nowMins = now.getHours()*60+now.getMinutes()
  const toMins = h => { const [hh,mm]=h.split(':').map(Number); return hh*60+mm }
  const todayClasses = (data.tt||[]).filter(e=>e.dayOfWeek===today).sort((a,b)=>toMins(a.startTime)-toMins(b.startTime))
  const nextClass = todayClasses.find(e=>toMins(e.startTime)>nowMins)
  const liveClass = todayClasses.find(e=>nowMins>=toMins(e.startTime)&&nowMins<toMins(e.endTime))

  const overall = data.rep?.overallAvg
  const att     = data.rep?.attSummary
  const billing = data.fee?.billing

  return (
    <>
      {/* Hero banner */}
      <div style={{ background:`linear-gradient(135deg,${C.crimson},${C.crimsonD})`, borderRadius:16, overflow:'hidden', marginBottom:20, boxShadow:'0 8px 32px rgba(125,16,37,.2)' }}>
        <div style={{ padding:'24px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:8 }}>
              {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </div>
            <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:26, color:'#fff', marginBottom:4 }}>
              {child.firstName} {child.lastName}
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.65)' }}>{child.curriculum} · {child.gradeLevel} · {child.programme||'Homeschool'}</div>
          </div>
          {liveClass ? (
            <div style={{ background:'rgba(34,197,94,.15)', border:'1px solid rgba(34,197,94,.3)', borderRadius:12, padding:'14px 20px', textAlign:'center' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#4ADE80', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>Live now</div>
              <div style={{ fontSize:16, fontWeight:800, color:'#fff' }}>{liveClass.subject}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.55)', marginTop:2 }}>{fmtT(liveClass.startTime)} – {fmtT(liveClass.endTime)}</div>
            </div>
          ) : nextClass ? (
            <div style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', borderRadius:12, padding:'14px 20px', textAlign:'center' }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.gold, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>Next class</div>
              <div style={{ fontSize:16, fontWeight:800, color:'#fff' }}>{nextClass.subject}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.55)', marginTop:2 }}>{fmtT(nextClass.startTime)}</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
        {[
          { label:'Overall average', val:overall!==null?overall+'%':'—', color:overall!==null?gc(overall):C.s400 },
          { label:'Attendance rate', val:att?.rate!==null?att.rate+'%':'—', color:att?.rate>=80?'#065F46':att?.rate>=60?'#D97706':'#991B1B' },
          { label:'Exams completed', val:data.rep?.examResults?.length||0, color:C.s900 },
          { label:'Classes today',   val:todayClasses.length, color:C.crimson },
          { label:'Fee status', val:billing?.status==='overdue'?'Overdue':billing?.status==='due-soon'?'Due soon':billing?.status==='current'?'Current':'—',
            color:billing?.status==='overdue'?'#991B1B':billing?.status==='due-soon'?'#D97706':'#065F46' },
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div style={{ fontSize:10, fontWeight:700, color:C.s400, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{k.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Recent exams + today timetable */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16 }}>
        {/* Recent exams */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.line}`, fontWeight:800, fontSize:13, color:C.s900 }}>Recent exam results</div>
          {!(data.rep?.examResults?.length) ? (
            <div style={{ padding:30, textAlign:'center', color:C.s400, fontSize:13 }}>No exam results yet.</div>
          ) : (
            <table className="tbl"><thead><tr>
              {['Subject','Type','Score','Grade','Date'].map(h=><th key={h}>{h}</th>)}
            </tr></thead><tbody>
              {data.rep.examResults.slice(0,6).map(e=>(
                <tr key={e._id}>
                  <td style={{ fontWeight:600 }}>{e.subject}</td>
                  <td><span style={{ padding:'2px 8px', borderRadius:99, fontSize:10.5, fontWeight:700, background:e.type==='end-term'?'#FDE7EC':'#DBEAFE', color:e.type==='end-term'?C.crimson:'#1E40AF' }}>{e.type==='end-term'?'End-term':'Weekly'}</span></td>
                  <td style={{ fontWeight:800, color:gc(e.score) }}>{e.score}%</td>
                  <td><span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:800, background:gc(e.score)+'15', color:gc(e.score) }}>{e.grade}</span></td>
                  <td style={{ fontSize:12, color:C.s500 }}>{fmtD(e.date)}</td>
                </tr>
              ))}
            </tbody></table>
          )}
        </div>

        {/* Today timetable */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.line}`, fontWeight:800, fontSize:13, color:C.s900 }}>Today's schedule</div>
          {todayClasses.length===0?(
            <div style={{ padding:24, textAlign:'center', color:C.s400, fontSize:13 }}>No classes today.</div>
          ):(
            <div>
              {todayClasses.map(e=>{
                const live = nowMins>=toMins(e.startTime)&&nowMins<toMins(e.endTime)
                return (
                  <div key={e._id} style={{ display:'flex', gap:12, padding:'11px 16px', borderBottom:`1px solid ${C.s100}`, background:live?'#F0FDF4':undefined }}>
                    <div style={{ textAlign:'right', flexShrink:0, minWidth:54 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:C.crimson }}>{fmtT(e.startTime)}</div>
                      <div style={{ fontSize:10, color:C.s400 }}>{fmtT(e.endTime)}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{e.subject}</div>
                      {e.teacherId&&<div style={{ fontSize:11.5, color:C.s500 }}>{e.teacherId.firstName} {e.teacherId.lastName}</div>}
                    </div>
                    {live&&<span style={{ fontSize:10, fontWeight:800, color:'#fff', background:'#22C55E', padding:'2px 8px', borderRadius:99, alignSelf:'center' }}>LIVE</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Parent Reports ────────────────────────────────────────
function ParentReports({ child, showToast }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('exams') // exams | homework | formal
  const [filters, setFilters] = useState({ from:'', to:'' })

  const load = useCallback(() => {
    if (!child?._id) return
    setLoading(true)
    const params = {}
    if (filters.from) params.from = filters.from
    if (filters.to)   params.to   = filters.to
    api.get('/parent/children/'+child._id+'/reports', { params })
      .then(r=>setData(r.data?.data))
      .catch(e=>showToast('Failed to load reports.','err'))
      .finally(()=>setLoading(false))
  }, [child?._id, filters])

  useEffect(()=>{ load() },[load])

  if (loading) return <Spinner/>
  if (!data) return null

  const overall = data.overallAvg
  const att     = data.attSummary

  const SUBJ_COLS = {'Mathematics':'#8B1A2E','Maths':'#8B1A2E','Physics':'#1E3A8A','Chemistry':'#166534','Biology':'#7C2D12','English':'#6B21A8','English Language':'#6B21A8','History':'#92400E','Geography':'#0F766E','Computer Science':'#1F2937','Business Studies':'#7E22CE','Economics':'#9F1239'}
  const colFor = s => SUBJ_COLS[s]||'#8B1A2E'

  const openReport = async (id) => {
    try {
      const r = await api.get('/reports/'+id+'/pdf-html')
      const w = window.open('','_blank'); w.document.write(r.data?.data?.html||''); w.document.close()
    } catch { showToast('Could not open report.','err') }
  }

  return (
    <>
      <PSection tag="Parent Portal" title="Academic" em="Reports"
        sub={`${child.firstName}'s performance across weekly tests, assignments, and end-of-term examinations.`}/>

      {/* Date filter */}
      <div style={{ display:'flex', gap:8, marginBottom:18, alignItems:'center', background:'#fff', border:`1px solid ${C.line}`, borderRadius:10, padding:'12px 14px' }}>
        <span style={{ fontSize:12, color:C.s500 }}>From</span>
        <input type="date" value={filters.from} onChange={e=>setFilters(p=>({...p,from:e.target.value}))}
          style={{ padding:'7px 10px', borderRadius:7, border:`1.5px solid ${C.line}`, fontSize:12.5, fontFamily:'inherit', color:C.ink }}/>
        <span style={{ fontSize:12, color:C.s500 }}>to</span>
        <input type="date" value={filters.to} onChange={e=>setFilters(p=>({...p,to:e.target.value}))}
          style={{ padding:'7px 10px', borderRadius:7, border:`1.5px solid ${C.line}`, fontSize:12.5, fontFamily:'inherit', color:C.ink }}/>
        <button onClick={load} style={{ background:C.crimson, color:'#fff', border:'none', padding:'7px 16px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>Apply</button>
        <button onClick={()=>{ setFilters({from:'',to:''}); setTimeout(load,50) }} style={{ background:'transparent', border:`1px solid ${C.line}`, color:C.s500, padding:'7px 12px', borderRadius:7, fontSize:12, cursor:'pointer' }}>Reset</button>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
        {[
          { label:'Overall avg',    val:overall!==null?overall+'%':'—',  color:overall!==null?gc(overall):C.s400 },
          { label:'Exams done',     val:data.examResults?.length||0,      color:C.s900 },
          { label:'Attendance',     val:att?.rate!==null?att.rate+'%':'—', color:att?.rate>=80?'#065F46':att?.rate>=60?'#D97706':'#991B1B' },
          { label:'Present',        val:att?.present||0,                   color:'#065F46' },
          { label:'Absent',         val:att?.absent||0,                    color:att?.absent>0?'#991B1B':C.s400 },
          { label:'Formal reports', val:data.formalReports?.length||0,     color:C.crimson },
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div style={{ fontSize:10, fontWeight:700, color:C.s400, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{k.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Subject averages */}
      {data.subjectAverages?.length>0&&(
        <div className="card" style={{ padding:18, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:800, color:C.s900, marginBottom:14 }}>Subject performance</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {data.subjectAverages.map(s=>(
              <div key={s.subject}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:colFor(s.subject), flexShrink:0 }}/>
                    <span style={{ fontSize:13, fontWeight:600, color:C.ink }}>{s.subject}</span>
                    <span style={{ fontSize:11, color:C.s400 }}>{s.count} exam{s.count>1?'s':''}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ padding:'1px 8px', borderRadius:99, fontSize:11, fontWeight:800, background:gc(s.avg)+'15', color:gc(s.avg) }}>{s.grade}</span>
                    <span style={{ fontSize:13, fontWeight:800, color:gc(s.avg) }}>{s.avg}%</span>
                  </div>
                </div>
                <div style={{ height:6, background:'#F3F4F6', borderRadius:99 }}>
                  <div style={{ width:s.avg+'%', height:'100%', background:colFor(s.subject), borderRadius:99, transition:'width .5s' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', border:`1.5px solid ${C.line}`, borderRadius:8, overflow:'hidden', marginBottom:14, width:'fit-content' }}>
        {[['exams','Weekly Exams'],['homework','Assignments'],['formal','End-term Reports']].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 16px', border:'none', cursor:'pointer', fontSize:12.5, fontWeight:600, background:tab===t?C.crimson:'#fff', color:tab===t?'#fff':C.s500, borderRight:`1px solid ${C.line}` }}>{l}</button>
        ))}
      </div>

      {tab==='exams'&&(
        <div className="card" style={{ overflow:'hidden' }}>
          {!data.examResults?.length?<div style={{ padding:30, textAlign:'center', color:C.s400, fontSize:13 }}>No exam results yet.</div>:(
            <table className="tbl"><thead><tr>{['Exam','Subject','Type','Score','Grade','Date'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {data.examResults.map(e=>(
                <tr key={e._id}>
                  <td style={{ fontWeight:600 }}>{e.title}</td>
                  <td style={{ color:C.s600 }}>{e.subject}</td>
                  <td><span style={{ padding:'2px 8px', borderRadius:99, fontSize:10.5, fontWeight:700, background:e.type==='end-term'?'#FDE7EC':'#DBEAFE', color:e.type==='end-term'?C.crimson:'#1E40AF' }}>{e.type==='end-term'?'End-term':'Weekly'}</span></td>
                  <td style={{ fontWeight:800, color:gc(e.score) }}>{e.score}%</td>
                  <td><span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:800, background:gc(e.score)+'15', color:gc(e.score) }}>{e.grade}</span></td>
                  <td style={{ fontSize:12, color:C.s500 }}>{fmtD(e.date)}</td>
                </tr>
              ))}
            </tbody></table>
          )}
        </div>
      )}

      {tab==='homework'&&(
        <div className="card" style={{ overflow:'hidden' }}>
          {!data.hwResults?.length?<div style={{ padding:30, textAlign:'center', color:C.s400, fontSize:13 }}>No assignment submissions yet.</div>:(
            <table className="tbl"><thead><tr>{['Assignment','Subject','Status','Score','Due','Submitted'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {data.hwResults.map(h=>(
                <tr key={h._id}>
                  <td style={{ fontWeight:600 }}>{h.title||'—'}</td>
                  <td style={{ color:C.s600 }}>{h.subject||'—'}</td>
                  <td><span style={{ padding:'2px 8px', borderRadius:99, fontSize:10.5, fontWeight:700, background:h.status==='graded'?'#D1FAE5':h.status==='submitted'?'#DBEAFE':'#FEF3C7', color:h.status==='graded'?'#065F46':h.status==='submitted'?'#1E40AF':'#D97706' }}>{h.status}</span></td>
                  <td style={{ fontWeight:700, color:h.score!=null?gc(h.score):C.s400 }}>{h.score!=null?h.score+'%':'—'}</td>
                  <td style={{ fontSize:12, color:C.s500 }}>{fmtD(h.dueDate)}</td>
                  <td style={{ fontSize:12, color:C.s500 }}>{fmtD(h.submittedAt)}</td>
                </tr>
              ))}
            </tbody></table>
          )}
        </div>
      )}

      {tab==='formal'&&(
        <div className="card" style={{ overflow:'hidden' }}>
          {!data.formalReports?.length?<div style={{ padding:40, textAlign:'center', color:C.s400, fontSize:13 }}>No end-of-term reports published yet.</div>:(
            <table className="tbl"><thead><tr>{['Period','Curriculum','Grade','Mean grade','Overall avg',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {data.formalReports.map(r=>(
                <tr key={r._id}>
                  <td style={{ fontWeight:700 }}>Term {r.term} · {r.academicYear}</td>
                  <td>{r.curriculum}</td>
                  <td>{r.yearGrade}</td>
                  <td><span style={{ padding:'2px 10px', borderRadius:99, fontSize:13, fontWeight:800, background:gc(r.overallAverage||0)+'15', color:gc(r.overallAverage||0) }}>{r.meanGrade||'—'}</span></td>
                  <td style={{ fontWeight:800, color:gc(r.overallAverage||0) }}>{r.overallAverage!==null?r.overallAverage+'%':'—'}</td>
                  <td><button onClick={()=>openReport(r._id)} style={{ background:C.crimson, color:'#fff', border:'none', padding:'5px 14px', borderRadius:6, fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Download</button></td>
                </tr>
              ))}
            </tbody></table>
          )}
        </div>
      )}
    </>
  )
}

// ── Parent Fees ───────────────────────────────────────────
function ParentFees({ child, showToast }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!child?._id) return
    setLoading(true)
    api.get('/parent/children/'+child._id+'/fees')
      .then(r=>setData(r.data?.data))
      .catch(()=>showToast('Failed to load fee info.','err'))
      .finally(()=>setLoading(false))
  },[child?._id])

  const openInvoice = async (inv) => {
    try {
      const r = await api.get('/invoices/'+inv._id+'/receipt-html')
      const w = window.open('','_blank'); w.document.write(r.data?.data?.html||''); w.document.close()
    } catch { showToast('Could not load invoice.','err') }
  }

  if (loading) return <Spinner/>
  if (!data) return null

  const { billing, invoices=[] } = data
  const cur = billing?.feeCurrency||'USD'
  const STATUS_S = {
    overdue:  { bg:'#FEE2E2', fg:'#991B1B', label:'Overdue' },
    'due-soon':{ bg:'#FEF3C7', fg:'#D97706', label:'Due soon' },
    current:  { bg:'#D1FAE5', fg:'#065F46', label:'Current' },
    'no-fee': { bg:'#F3F4F6', fg:'#6B7280', label:'Not set' },
  }
  const INV_S = {
    paid:    { bg:'#D1FAE5', fg:'#065F46' },
    sent:    { bg:'#DBEAFE', fg:'#1E40AF' },
    overdue: { bg:'#FEE2E2', fg:'#991B1B' },
    draft:   { bg:'#F3F4F6', fg:'#6B7280' },
  }
  const ss = STATUS_S[billing?.status]||STATUS_S['no-fee']

  return (
    <>
      <PSection tag="Parent Portal" title="Fees &" em="Invoices"
        sub={`Fee account for ${child.firstName} ${child.lastName}. Download receipts and invoices below.`}/>

      {/* Billing summary card */}
      <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:20 }}>
        <div style={{ background:`linear-gradient(135deg,${C.crimson},${C.crimsonD})`, padding:'22px 26px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:8 }}>Monthly fee</div>
            <div style={{ fontSize:32, fontWeight:800, color:'#C9A030', lineHeight:1 }}>
              {billing?.agreedFee ? money(billing.agreedFee, cur) : '—'}
            </div>
            {billing?.billingNote&&<div style={{ fontSize:12, color:'rgba(255,255,255,.55)', marginTop:4 }}>{billing.billingNote}</div>}
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.45)', marginBottom:6 }}>Payment status</div>
            <span style={{ padding:'5px 16px', borderRadius:99, fontSize:13, fontWeight:700, background:ss.fg, color:'#fff' }}>{ss.label}</span>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:`1px solid ${C.line}` }}>
          {[
            { label:'Billing day', val:billing?.billingDay ? `${billing.billingDay}th of month` : '—' },
            { label:'Next due', val:billing?.nextDueDate ? fmtD(billing.nextDueDate)+(billing.daysUntilDue!==null?' ('+Math.abs(billing.daysUntilDue)+(billing.daysUntilDue<0?' days overdue':billing.daysUntilDue===0?' today':' days')+')'):'') : '—' },
            { label:'Last paid', val:fmtD(billing?.lastPaidDate) },
          ].map((k,i)=>(
            <div key={k.label} style={{ padding:'14px 18px', borderRight:i<2?`1px solid ${C.line}`:undefined }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.s400, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>{k.label}</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.s900 }}>{k.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.line}`, fontWeight:800, fontSize:13, color:C.s900 }}>
          Invoices & receipts ({invoices.length})
        </div>
        {invoices.length===0?(
          <div style={{ padding:40, textAlign:'center', color:C.s400, fontSize:13 }}>No invoices yet.</div>
        ):(
          <table className="tbl"><thead><tr>
            {['Invoice no.','Period','Amount','Status','Date',''].map(h=><th key={h}>{h}</th>)}
          </tr></thead><tbody>
            {invoices.map(inv=>{
              const is = INV_S[inv.status]||INV_S.draft
              return (
                <tr key={inv._id}>
                  <td style={{ fontWeight:700, fontSize:13 }}>{inv.invoiceNo}</td>
                  <td style={{ color:C.s600 }}>{inv.programmeLabel||inv.billedToName||'—'}</td>
                  <td style={{ fontWeight:700 }}>{money(inv.totalDue||inv.paidAmount, cur)}</td>
                  <td><span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:is.bg, color:is.fg }}>{inv.status}</span></td>
                  <td style={{ fontSize:12, color:C.s500 }}>{fmtD(inv.status==='paid'?inv.paidAt:inv.issueDate)}</td>
                  <td>
                    {inv.status==='paid'&&(
                      <button onClick={()=>openInvoice(inv)} style={{ background:C.accentEmerald||'#15803D', color:'#fff', border:'none', padding:'5px 12px', borderRadius:6, fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Receipt</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody></table>
        )}
      </div>
    </>
  )
}

// ── Parent Timetable ──────────────────────────────────────
function ParentTimetable({ child }) {
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(()=>{
    if (!child?._id) return
    api.get('/parent/children/'+child._id+'/timetable')
      .then(r=>setEntries(r.data?.data?.entries||[]))
      .catch(()=>{})
      .finally(()=>setLoading(false))
  },[child?._id])

  const DAYS  = ['Mon','Tue','Wed','Thu','Fri']
  const DAY_L = { Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday' }
  const SLOTS = [
    { label:'9 AM',  s:'09:00', e:'10:00' },{ label:'10 AM', s:'10:00', e:'11:00' },
    { label:'11 AM', s:'11:00', e:'12:00' },{ label:'12 PM', s:'12:00', e:'13:00' },
    { label:'Lunch', s:'13:00', e:'14:00', isBreak:true },
    { label:'2 PM',  s:'14:00', e:'15:00' },
  ]
  const toMins = h => { const[hh,mm]=h.split(':').map(Number); return hh*60+mm }
  const SUBJ_COLS={'Mathematics':'#8B1A2E','Maths':'#8B1A2E','Physics':'#1E3A8A','Chemistry':'#166534','Biology':'#7C2D12','English':'#6B21A8','English Language':'#6B21A8','History':'#92400E','Geography':'#0F766E','Computer Science':'#1F2937','Business Studies':'#7E22CE','Economics':'#9F1239'}
  const colFor=s=>SUBJ_COLS[s]||'#8B1A2E'
  const FRI_COL='#6D28D9'

  const byDay={}
  DAYS.forEach(d=>{byDay[d]=[]})
  entries.forEach(e=>{if(byDay[e.dayOfWeek])byDay[e.dayOfWeek].push(e)})
  const entryForSlot=(day,slot)=>byDay[day].filter(e=>toMins(e.startTime)>=toMins(slot.s)&&toMins(e.startTime)<toMins(slot.e))

  if (loading) return <Spinner/>

  return (
    <>
      <PSection tag="Parent Portal" title={`${child.firstName}'s`} em="Timetable" sub="School hours 9 AM–3 PM · Lunch 1–2 PM · Monday–Thursday: Lessons · Friday: Assessment & Activities"/>
      <div style={{ background:'#fff', border:`1px solid ${C.line}`, borderRadius:12, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.06)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>
            <th style={{ width:64, padding:'10px 12px', background:'#1A0F0E', fontSize:10.5, fontWeight:700, color:'rgba(255,255,255,.5)', textAlign:'center', borderRight:'1px solid rgba(255,255,255,.1)' }}>Time</th>
            {DAYS.map(d=>(
              <th key={d} style={{ padding:'10px 12px', background:d==='Fri'?'#3D0A4A':'#1A0F0E', fontSize:11, fontWeight:800, color:'rgba(255,255,255,.85)', textAlign:'center', borderRight:'1px solid rgba(255,255,255,.08)', letterSpacing:'.05em' }}>
                <div>{DAY_L[d]}</div>
                <div style={{ fontSize:9, fontWeight:500, color:d==='Fri'?'rgba(180,150,220,.7)':'rgba(255,255,255,.4)', marginTop:2 }}>{d==='Fri'?'Assessment':'Lessons'}</div>
              </th>
            ))}
          </tr></thead>
          <tbody>
            {SLOTS.map(slot=>(
              <tr key={slot.label} style={{ borderBottom:`1px solid ${C.s100}` }}>
                <td style={{ padding:'6px 10px', textAlign:'center', background:slot.isBreak?'#FFFBF0':C.cream, borderRight:`1px solid ${C.line}`, fontSize:11, fontWeight:700, color:slot.isBreak?'#D97706':C.s500, whiteSpace:'nowrap' }}>
                  {slot.isBreak?<div><div style={{ fontSize:9.5, color:'#D97706' }}>LUNCH</div><div style={{ fontSize:9, opacity:.7 }}>1–2 PM</div></div>:slot.label}
                </td>
                {DAYS.map(day=>{
                  if (slot.isBreak) return <td key={day} style={{ background:'#FFFBF0', borderRight:`1px solid ${C.s100}`, textAlign:'center' }}><span style={{ fontSize:9.5, color:'#D97706', fontWeight:600 }}>Lunch</span></td>
                  const cells = entryForSlot(day, slot)
                  const isFri = day==='Fri'
                  return (
                    <td key={day} style={{ padding:4, verticalAlign:'top', background:isFri?'#FAF5FF':'#fff', borderRight:`1px solid ${C.s100}`, minWidth:100 }}>
                      {cells.map(e=>{
                        const col=isFri?FRI_COL:colFor(e.subject)
                        return (
                          <div key={e._id} style={{ background:col+'12', border:`1.5px solid ${col}30`, borderLeft:`3px solid ${col}`, borderRadius:7, padding:'6px 8px', marginBottom:3 }}>
                            <div style={{ fontSize:11.5, fontWeight:700, color:col, lineHeight:1.25, marginBottom:2 }}>{e.subject}</div>
                            <div style={{ fontSize:10, color:col+'90' }}>{fmtT(e.startTime)}–{fmtT(e.endTime)}</div>
                            {e.teacherId&&<div style={{ fontSize:9.5, color:col+'70', marginTop:1 }}>{e.teacherId.firstName} {(e.teacherId.lastName||'')[0]}.</div>}
                          </div>
                        )
                      })}
                      {!cells.length&&<div style={{ fontSize:10, color:C.s200, textAlign:'center', paddingTop:8 }}>—</div>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Stub pages (kept from original) ──────────────────────
function ParentLessons({ child }) {
  return <PSection tag="Parent Portal" title="Live" em="Lessons" sub="Access live classroom sessions for your child."/>
}
function ParentMessages({ user, showToast }) {
  return <PSection tag="Parent Portal" title="Messages" sub="Send and receive messages from teachers and administration."/>
}
function ParentProgramme({ child }) {
  return (
    <>
      <PSection tag="Parent Portal" title="Programme" em="Details"/>
      {child&&(
        <div className="card" style={{ padding:24 }}>
          {[['Student',`${child.firstName} ${child.lastName}`],['Curriculum',child.curriculum||'—'],['Grade',child.gradeLevel||'—'],['Programme',child.programme||'Homeschool'],['Email',child.email||'—']].map(([l,v])=>(
            <div key={l} style={{ display:'flex', gap:16, padding:'10px 0', borderBottom:`1px solid ${C.s100}` }}>
              <div style={{ width:140, fontSize:12, fontWeight:700, color:C.crimson, textTransform:'uppercase', letterSpacing:'.06em' }}>{l}</div>
              <div style={{ fontSize:14, color:C.ink, fontWeight:600 }}>{v}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
function ParentTutor({ child }) {
  return <PSection tag="Parent Portal" title="Tutor &" em="Advisor" sub="Contact your child's assigned tutor or academic advisor."/>
}

function Spinner() {
  return (
    <div style={{ padding:'60px 0', textAlign:'center' }}>
      <div style={{ width:36, height:36, border:'3px solid #F0EBE6', borderTopColor:C.crimson, borderRadius:'50%', animation:'spin .75s linear infinite', margin:'0 auto' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
