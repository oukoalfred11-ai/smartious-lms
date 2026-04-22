import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, useToast } from '../context/ctx.jsx'

// Demo credentials — public portal only serves parents and students
const DEMO = [
  {role:'student', label:'Student', email:'amara.osei@student.smartious.ac.ke', pw:'Student@2024', col:'#3B82F6',
   svg:'<path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/>'},
  {role:'parent',  label:'Parent',  email:'janet.osei@gmail.com',              pw:'Parent@2024',  col:'#8B5CF6',
   svg:'<circle cx="12" cy="8" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/>'},
  {role:'demo',    label:'Demo',    email:'demo@smartious.ac.ke',              pw:'Demo@2024',    col:'#8B1A2E',
   svg:'<polygon points="5 3 19 12 5 21 5 3"/>'},
]

// Inline Smartious logo — crimson gradient shield, gold star, white open book
const SmartiousLogo = ({ size = 40, withText = false }) => (
  <div style={{display:'inline-flex',alignItems:'center',gap:12}}>
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Smartious Homeschool">
      <defs>
        <linearGradient id="ll-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#A8203A"/>
          <stop offset="100%" stopColor="#7A1026"/>
        </linearGradient>
      </defs>
      <path d="M40 6 L68 14 Q70 14 70 17 L70 44 Q70 60 40 74 Q10 60 10 44 L10 17 Q10 14 12 14 Z"
            fill="url(#ll-grad)" stroke="#6A0E20" strokeWidth="0.6"/>
      <path d="M40 10 L64 17 Q65.5 17 65.5 19 L65.5 44 Q65.5 57 40 69 Q14.5 57 14.5 44 L14.5 19 Q14.5 17 16 17 Z"
            fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="0.8"/>
      <polygon points="40,19 42.2,26 49.5,26 43.7,30.4 45.9,37.5 40,33 34.1,37.5 36.3,30.4 30.5,26 37.8,26"
               fill="#F0CC5A" stroke="#C89A28" strokeWidth="0.4"/>
      <g transform="translate(40 52)">
        <path d="M-14 -4 L-14 8 L-1 9 L-1 -3 Q-8 -5 -14 -4 Z" fill="#FEFDFB" stroke="#F7F3ED" strokeWidth=".4"/>
        <path d="M14 -4 L14 8 L1 9 L1 -3 Q8 -5 14 -4 Z"       fill="#FEFDFB" stroke="#F7F3ED" strokeWidth=".4"/>
        <line x1="-10" y1="-0.5" x2="-4" y2="-0.5" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
        <line x1="-10" y1="2"    x2="-4" y2="2"    stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
        <line x1="-10" y1="4.5"  x2="-4" y2="4.5"  stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
        <line x1="4"   y1="-0.5" x2="10" y2="-0.5" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
        <line x1="4"   y1="2"    x2="10" y2="2"    stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
        <line x1="4"   y1="4.5"  x2="10" y2="4.5"  stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
      </g>
    </svg>
    {withText && (
      <div style={{display:'flex',flexDirection:'column',lineHeight:1.1}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize: size*0.55, fontWeight:700, color:'#FEFDFB'}}>
          Smart<em style={{fontStyle:'italic',color:'#F0CC5A',fontWeight:500}}>ious</em>
        </div>
        <div style={{fontSize: size*0.2, fontWeight:600, letterSpacing:'.16em', color:'rgba(247,243,237,.45)', textTransform:'uppercase', marginTop:2}}>
          Homeschool · Global
        </div>
      </div>
    )}
  </div>
)

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

  // Only Student + Parent tabs on the public portal — staff log in elsewhere
  const TABS = [
    {id:'student', label:'Student', svg:'<path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/>'},
    {id:'parent',  label:'Parent',  svg:'<circle cx="12" cy="8" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/>'},
  ]

  const submit = async (e) => {
    e?.preventDefault()
    setErr('')
    if (!email || !pw) { setErr('Enter your email and password.'); return }
    setLoading(true)
    try {
      let user
      try {
        user = await login(email, pw)
      } catch {
        // Offline / demo fallback
        const found = DEMO.find(d => d.email === email && d.pw === pw)
        if (!found) throw new Error('Invalid credentials')
        const nameMap = { student:'Amara', parent:'Janet', demo:'Demo' }
        const lastMap = { student:'Osei',  parent:'Osei',  demo:'Student' }
        const fakeUser = { firstName: nameMap[found.role]||'User', lastName: lastMap[found.role]||'', role: found.role, email }
        localStorage.setItem('sm_token', 'demo-token-' + found.role)
        localStorage.setItem('sm_user', JSON.stringify(fakeUser))
        window.location.href = '/' + found.role
        return
      }
      // Block staff roles that accidentally hit this portal
      if (user.role === 'teacher' || user.role === 'admin') {
        setErr('Staff accounts must use the Admin Login link in the footer.')
        setLoading(false)
        return
      }
      toast.ok(`Welcome back, ${user.firstName}!`)
      nav('/' + user.role)
    } catch (e) {
      setErr(e.message || 'Invalid email or password.')
    }
    setLoading(false)
  }

  const quickLogin = async (d) => {
    setEmail(d.email); setPw(d.pw); setTab(d.role === 'demo' ? 'student' : d.role)
    setErr(''); setLoading(true)
    try {
      try { const user = await login(d.email, d.pw); nav('/' + user.role); return } catch {}
      const nameMap = { student:'Amara', parent:'Janet', demo:'Demo' }
      const lastMap = { student:'Osei',  parent:'Osei',  demo:'Student' }
      const fake = { firstName: nameMap[d.role]||d.label, lastName: lastMap[d.role]||'', role: d.role, email: d.email }
      localStorage.setItem('sm_token', 'demo-token-' + d.role)
      localStorage.setItem('sm_user', JSON.stringify(fake))
      window.location.href = '/' + d.role
    } catch { setErr('Login failed.') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0806', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', position:'relative', overflow:'hidden', fontFamily:"'Syne',sans-serif" }}>
      <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60%', height:'120%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(139,26,46,.14) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'50%', height:'100%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(184,150,12,.05) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div style={{ textAlign:'center', marginBottom:32, position:'relative', zIndex:1 }}>
        <SmartiousLogo size={48} withText={true}/>
      </div>

      <div style={{ background:'rgba(26,21,16,.96)', border:'1px solid rgba(184,150,12,.12)', borderRadius:24, padding:44, width:'100%', maxWidth:440, boxShadow:'0 60px 120px rgba(10,8,6,.28)', position:'relative', zIndex:1, backdropFilter:'blur(20px)' }}>
        <div style={{ display:'flex', background:'rgba(255,255,255,.05)', borderRadius:8, padding:3, marginBottom:26 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex:1, padding:'10px 8px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer', border:'none', transition:'all .2s', fontFamily:"'Syne',sans-serif", color: tab===t.id ? '#fff' : 'rgba(247,243,237,.4)', background: tab===t.id ? '#8B1A2E' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', gap:6, boxShadow: tab===t.id ? '0 2px 8px rgba(139,26,46,.4)' : 'none' }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:t.svg}} />
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'#fff', marginBottom:4 }}>Sign in to Smartious</div>
        <div style={{ fontSize:13, color:'rgba(247,243,237,.38)', marginBottom:24 }}>{tab.charAt(0).toUpperCase()+tab.slice(1)} portal · Enter your credentials below</div>

        {err && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:8, background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.25)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#F87171', marginBottom:14, lineHeight:1.45 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:2}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{err}</span>
          </div>
        )}

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'rgba(247,243,237,.32)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6, display:'block' }}>Email Address</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder={tab === 'student' ? 'student@email.com' : 'parent@email.com'} onKeyDown={e=>e.key==='Enter'&&submit()}
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

        {(() => {
          const demo = DEMO.find(d => d.role === 'demo')
          return (
            <button onClick={() => quickLogin(demo)}
              style={{ width:'100%', padding:'14px 8px', background:'rgba(139,26,46,.08)', border:'1px solid rgba(139,26,46,.25)', borderRadius:10, cursor:'pointer', textAlign:'center', transition:'all .2s', fontFamily:"'Syne',sans-serif" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#8B1A2E';e.currentTarget.style.background='rgba(139,26,46,.18)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(139,26,46,.25)';e.currentTarget.style.background='rgba(139,26,46,.08)'}}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(139,26,46,.25)', border:'1.5px solid rgba(139,26,46,.5)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px' }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#8B1A2E" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:'rgba(247,243,237,.8)', marginBottom:3 }}>Try Demo</div>
              <div style={{ fontSize:11, color:'rgba(247,243,237,.35)' }}>One-click access · No sign-up needed</div>
            </button>
          )
        })()}
      </div>

      <div style={{ marginTop:20, textAlign:'center', position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
        <Link to="/" style={{ fontSize:12.5, color:'rgba(247,243,237,.25)', textDecoration:'none' }}>← Back to Smartious Website</Link>
      </div>
    </div>
  )
}