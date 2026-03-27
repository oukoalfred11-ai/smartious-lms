import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, useToast } from '../context/ctx.jsx'

const DEMO = [
  {role:'student',label:'Student',email:'amara.osei@student.smartious.ac.ke',pw:'Student@2024',col:'#3B82F6',svg:'<path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/>'},
  {role:'teacher',label:'Teacher',email:'j.muthomi@smartious.ac.ke',pw:'Teacher@2024',col:'#22C55E',svg:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'},
  {role:'parent',label:'Parent',email:'janet.osei@gmail.com',pw:'Parent@2024',col:'#8B5CF6',svg:'<circle cx="12" cy="8" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/>'},
  {role:'admin',label:'Admin',email:'admin@smartious.ac.ke',pw:'Admin@2024',col:'#F59E0B',svg:'<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>'},
  {role:'demo',label:'Demo',email:'demo@smartious.ac.ke',pw:'Demo@2024',col:'#8B1A2E',svg:'<polygon points="5 3 19 12 5 21 5 3"/>'},
]

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [tab, setTab] = useState('student')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [showPw, setShowPw] = useState(false)
  // Learning mode — only relevant for students
  const [learningMode, setLearningMode] = useState('individual')

  const TABS = [
    {id:'student',label:'Student',svg:'<path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/>'},
    {id:'teacher',label:'Teacher',svg:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'},
    {id:'parent',label:'Parent',svg:'<circle cx="12" cy="8" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/>'},
    {id:'admin',label:'Admin',svg:'<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>'},
  ]

  const submit = async (e) => {
    e?.preventDefault()
    setErr('')
    if (!email || !pw) { setErr('Enter your email and password.'); return }
    setLoading(true)
    try {
      // Try real backend first, fall back to demo credentials
      let user
      try {
        user = await login(email, pw)
      } catch {
        // Offline / demo mode — match against known demo credentials
        const found = DEMO.find(d => d.email === email && d.pw === pw)
        if (!found) throw new Error('Invalid credentials')
        // Simulate login
        const nameMap = {student:'Amara',teacher:'James',parent:'Janet',admin:'Admin',demo:'Demo'}
        const lastMap = {student:'Osei',teacher:'Muthomi',parent:'Osei',admin:'User',demo:'Student'}
        const fakeUser = { firstName: nameMap[found.role] || 'User', lastName: lastMap[found.role] || 'Demo', role: found.role, email }
        localStorage.setItem('sm_token', 'demo-token-' + found.role)
        localStorage.setItem('sm_user', JSON.stringify(fakeUser))
        window.location.href = '/' + found.role
        return
      }
      toast.ok(`Welcome back, ${user.firstName}!`)
      nav('/' + user.role)
    } catch (e) {
      setErr('Invalid email or password. Try a demo account below.')
    }
    setLoading(false)
  }

  const quickLogin = async (d) => {
    setEmail(d.email); setPw(d.pw); setTab(d.role)
    setErr(''); setLoading(true)
    try {
      try { const user = await login(d.email, d.pw); nav('/' + user.role); return }
      catch {}
      const nameMap2 = {student:'Amara',teacher:'James',parent:'Janet',admin:'Admin',demo:'Demo'}
      const lastMap2 = {student:'Osei',teacher:'Muthomi',parent:'Osei',admin:'User',demo:'Student'}
      const fake = { firstName: nameMap2[d.role]||d.label, lastName: lastMap2[d.role]||'', role: d.role, email: d.email }
      localStorage.setItem('sm_token', 'demo-token-' + d.role)
      localStorage.setItem('sm_user', JSON.stringify(fake))
      window.location.href = '/' + d.role
    } catch { setErr('Login failed.') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0806', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', position:'relative', overflow:'hidden', fontFamily:"'Syne',sans-serif" }}>
      {/* Radial glows */}
      <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60%', height:'120%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(139,26,46,.14) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'50%', height:'100%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(184,150,12,.05) 0%,transparent 70%)', pointerEvents:'none' }} />

      {/* Logo */}
      <div style={{ textAlign:'center', marginBottom:32, position:'relative', zIndex:1 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'#8B1A2E', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'#fff' }}>Smart<em style={{ fontStyle:'italic', color:'#F0CC5A' }}>ious</em></div>
            <div style={{ fontSize:9, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(255,255,255,.25)', marginTop:2 }}>Homeschool · Global</div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ background:'rgba(26,21,16,.96)', border:'1px solid rgba(184,150,12,.12)', borderRadius:24, padding:44, width:'100%', maxWidth:440, boxShadow:'0 60px 120px rgba(10,8,6,.28)', position:'relative', zIndex:1, backdropFilter:'blur(20px)' }}>
        {/* Role tabs */}
        <div style={{ display:'flex', background:'rgba(255,255,255,.05)', borderRadius:8, padding:3, marginBottom:26 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex:1, padding:8, borderRadius:7, fontSize:11.5, fontWeight:700, cursor:'pointer', border:'none', transition:'all .2s', fontFamily:"'Syne',sans-serif", color: tab===t.id ? '#fff' : 'rgba(247,243,237,.4)', background: tab===t.id ? '#8B1A2E' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', gap:5, boxShadow: tab===t.id ? '0 2px 8px rgba(139,26,46,.4)' : 'none' }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:t.svg}} />
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'#fff', marginBottom:4 }}>Sign in to Smartious</div>
        <div style={{ fontSize:13, color:'rgba(247,243,237,.38)', marginBottom:24 }}>{tab.charAt(0).toUpperCase()+tab.slice(1)} portal · Enter your credentials below</div>

        {err && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.25)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#F87171', marginBottom:14 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {err}
          </div>
        )}

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'rgba(247,243,237,.32)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6, display:'block' }}>Email Address</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder={`${tab}@smartious.ac.ke`} onKeyDown={e=>e.key==='Enter'&&submit()}
            style={{ padding:'12px 14px', border:'1.5px solid rgba(255,255,255,.1)', borderRadius:8, fontSize:14, color:'#fff', outline:'none', background:'rgba(255,255,255,.05)', width:'100%', fontFamily:"'Syne',sans-serif", boxSizing:'border-box' }} />
        </div>

        <div style={{ marginBottom:20, position:'relative' }}>
          <label style={{ fontSize:11, fontWeight:700, color:'rgba(247,243,237,.32)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6, display:'block' }}>Password</label>
          <input value={pw} onChange={e=>setPw(e.target.value)} type={showPw?'text':'password'} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&submit()}
            style={{ padding:'12px 14px', paddingRight:44, border:'1.5px solid rgba(255,255,255,.1)', borderRadius:8, fontSize:14, color:'#fff', outline:'none', background:'rgba(255,255,255,.05)', width:'100%', fontFamily:"'Syne',sans-serif", boxSizing:'border-box' }} />
          <button onClick={()=>setShowPw(v=>!v)} style={{ position:'absolute', right:12, top:34, background:'none', border:'none', cursor:'pointer', color:'rgba(247,243,237,.35)' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>

        <button onClick={submit} disabled={loading}
          style={{ width:'100%', padding:14, background:'#8B1A2E', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:loading?'not-allowed':'pointer', transition:'all .2s', fontFamily:"'Syne',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 14px rgba(139,26,46,.4)', opacity:loading?.7:1 }}>
          {loading ? 'Signing in…' : <>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Sign In to {tab.charAt(0).toUpperCase()+tab.slice(1)} Portal
          </>}
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }} />
          <span style={{ fontSize:12, color:'rgba(247,243,237,.2)', whiteSpace:'nowrap' }}>Quick Access — Demo</span>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {DEMO.slice(0,3).map(d => (
            <button key={d.role} onClick={()=>quickLogin(d)}
              style={{ padding:'11px 8px', background:'rgba(255,255,255,.04)', border:`1px solid rgba(255,255,255,.06)`, borderRadius:10, cursor:'pointer', textAlign:'center', transition:'all .2s', fontFamily:"'Syne',sans-serif" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=d.col;e.currentTarget.style.background=d.col+'12'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.06)';e.currentTarget.style.background='rgba(255,255,255,.04)'}}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:d.col+'20', border:`1.5px solid ${d.col}50`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 7px' }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={d.col} strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:d.svg}} />
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:'rgba(247,243,237,.7)' }}>{d.label}</div>
            </button>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8 }}>
          {DEMO.slice(3).map(d => (
            <button key={d.role} onClick={()=>quickLogin(d)}
              style={{ padding:'11px 8px', background:'rgba(255,255,255,.04)', border:`1px solid rgba(255,255,255,.06)`, borderRadius:10, cursor:'pointer', textAlign:'center', transition:'all .2s', fontFamily:"'Syne',sans-serif" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=d.col;e.currentTarget.style.background=d.col+'12'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.06)';e.currentTarget.style.background='rgba(255,255,255,.04)'}}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:d.col+'20', border:`1.5px solid ${d.col}50`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 7px' }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={d.col} strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:d.svg}} />
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:'rgba(247,243,237,.7)' }}>{d.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop:20, textAlign:'center', position:'relative', zIndex:1 }}>
        <Link to="/" style={{ fontSize:12.5, color:'rgba(247,243,237,.25)', textDecoration:'none' }}>← Back to Smartious Website</Link>
      </div>
    </div>
  )
}
