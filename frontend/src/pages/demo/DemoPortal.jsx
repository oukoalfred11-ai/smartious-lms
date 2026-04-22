import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../context/ctx.jsx'

const I = (d) => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:d}}/>

const NAV = [
  {id:'dashboard',label:'Dashboard',svg:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'},
  {id:'curriculum',label:'My Curriculum',svg:'<path d="M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13"/><path d="M4 19a2 2 0 0 0 2 2h14"/>'},
  {id:'lessons',label:'Lesson Player',svg:'<polygon points="5 3 19 12 5 21 5 3"/>'},
  {id:'practice',label:'Practice',svg:'<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1.5"/>'},
  {id:'exams',label:'Exams',svg:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',badge:'2'},
  {id:'live',label:'Live Classes',svg:'<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',live:true},
  {id:'timetable',label:'Timetable',svg:'<rect x="3" y="4" width="18" height="18" rx="2"/>'},
  {id:'tutor',label:'AI Tutor (Mshauri)',svg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'},
  {id:'resources',label:'Resources',svg:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>'},
  {id:'gamification',label:'Achievements',svg:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'},
  {id:'subscription',label:'Enrol Now',svg:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>'},
]

export default function DemoPortal() {
  const toast = useToast()
  const nav = useNavigate()
  const [page, setPage] = useState('dashboard')
  const enrol = () => { nav('/'); toast.info('Redirecting to enrolment…') }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-mark"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/></svg></div>
          <div><div className="sb-text">Smartious<span>.</span></div><div className="sb-sub">Demo Preview</div></div>
        </div>
        <nav style={{flex:1,paddingTop:8}}>
          <div className="sb-sec">Learning Preview</div>
          {NAV.map(item => (
            <div key={item.id} className={`nav-item${page===item.id?' active':''}`} onClick={()=>setPage(item.id)}>
              <div className="nav-icon">{I(item.svg)}</div>
              <span className="sb-lbl">{item.label}</span>
              {item.badge && <span className="sb-badge">{item.badge}</span>}
              {item.live && <div className="sb-live-dot"/>}
            </div>
          ))}
        </nav>
        <div style={{padding:'12px 14px',borderTop:'1px solid var(--s700)'}}>
          <button className="btn btn-p btn-sm" style={{width:'100%',justifyContent:'center',background:'#8B1A2E',borderColor:'#8B1A2E'}} onClick={enrol}>Enrol Now →</button>
        </div>
        <div className="sb-back" onClick={()=>nav('/')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg><span className="sb-lbl">Back to Website</span></div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div className="tb-title">Demo Preview <span className="badge badge-amber" style={{marginLeft:10,fontSize:11}}>Demo Mode</span></div>
          <div className="tb-right"><button className="btn btn-p btn-sm" style={{background:'#8B1A2E',borderColor:'#8B1A2E'}} onClick={enrol}>Enrol Now →</button></div>
        </div>
        <div className="content">
          <div style={{background:'linear-gradient(135deg,#8B1A2E,#A8203A)',borderRadius:'var(--rxl)',padding:'18px 24px',marginBottom:20,display:'flex',gap:14,alignItems:'center',flexWrap:'wrap'}}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <div style={{flex:1,color:'rgba(255,255,255,.9)',fontSize:14}}>This is a preview — enrol to unlock all {NAV.length} features including live classes, AI tutoring, and exams.</div>
            <button className="btn" style={{background:'rgba(255,255,255,.9)',color:'#8B1A2E',fontWeight:700,borderColor:'transparent'}} onClick={enrol}>Enrol Free →</button>
          </div>
          {page==='dashboard' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Demo Account</div><h1 className="serif" style={{fontSize:28,color:'var(--s900)'}}>Welcome to <em style={{color:'var(--b700)'}}>Smartious!</em></h1><p style={{fontSize:14,color:'var(--s500)',marginTop:4}}>Explore what our platform offers, then start your free assessment.</p></div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
                {[{t:'IGCSE Cambridge',d:'Form 1–4, all subjects. Cambridge official partner.',col:'var(--b50)',sc:'var(--b700)'},{t:'A-Level',d:'Year 12–13. AS and A2 papers. Expert teachers.',col:'var(--g50)',sc:'var(--g600)'},{t:'IB Diploma',d:'Full IB DP. Extended Essay, TOK, CAS included.',col:'var(--p50)',sc:'var(--p600)'},{t:'CBC / KCSE',d:'Grade 1–12. KNEC-aligned. CBC and Form 1–6.',col:'var(--a50)',sc:'var(--a600)'},{t:'British Curriculum',d:'Key Stage 1–4. UK National Curriculum.',col:'var(--r50)',sc:'var(--r600)'},{t:'American Curriculum',d:'Grade K–12. Common Core & SAT prep.',col:'var(--s100)',sc:'var(--s600)'}].map((c,i) => (
                  <div key={i} className="card" style={{cursor:'pointer',borderLeft:`3px solid ${c.sc}`}} onClick={enrol}>
                    <div className="serif" style={{fontSize:17,color:'var(--s900)',marginBottom:6}}>{c.t}</div>
                    <div style={{fontSize:13,color:'var(--s500)',marginBottom:14,lineHeight:1.6}}>{c.d}</div>
                    <button className="btn btn-s btn-sm" style={{color:c.sc,borderColor:c.sc}}>Enrol in {c.t}</button>
                  </div>
                ))}
              </div>
              <div style={{marginTop:24,textAlign:'center'}}>
                <button className="btn btn-p" style={{background:'#8B1A2E',borderColor:'#8B1A2E',padding:'13px 32px'}} onClick={enrol}>Start Your Free Assessment →</button>
                <div style={{fontSize:12,color:'var(--s400)',marginTop:8}}>No credit card required · Assessment takes 20 minutes</div>
              </div>
            </div>
          )}
          {page!=='dashboard' && (
            <div style={{textAlign:'center',padding:'60px 20px'}}>
              <div style={{width:80,height:80,borderRadius:'50%',background:'var(--bg)',border:'2px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}><svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
              <h2 className="serif" style={{fontSize:22,color:'var(--s900)',marginBottom:10}}>Enrol to Access This Feature</h2>
              <p style={{fontSize:14,color:'var(--s500)',maxWidth:380,margin:'0 auto 20px'}}>This feature requires a Smartious subscription. Start with a free diagnostic assessment.</p>
              <div style={{display:'flex',gap:12,justifyContent:'center'}}><button className="btn btn-p" style={{background:'#8B1A2E',borderColor:'#8B1A2E'}} onClick={enrol}>Start Free Assessment →</button><button className="btn btn-s" onClick={()=>setPage('dashboard')}>Back to Preview</button></div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
