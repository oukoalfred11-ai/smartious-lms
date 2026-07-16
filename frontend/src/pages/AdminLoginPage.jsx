import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, useToast } from '../context/ctx.jsx'

// Admin-portal demo credentials — Teacher + Admin only
const STAFF_DEMO = [
  {role:'teacher', label:'Teacher', email:'j.muthomi@smartious.ac.ke', pw:'Teacher@2024', col:'#22C55E',
   svg:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'},
  {role:'admin',   label:'Admin',   email:'admin@smartious.ac.ke',    pw:'Admin@2024',   col:'#F59E0B',
   svg:'<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>'},
]

// Inline Smartious logo — crimson gradient shield, gold star, white open book
const SmartiousLogo = ({ size = 40, withText = false }) => (
  <div style={{display:'inline-flex',alignItems:'center',gap:12}}>
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Smartious Homeschool">
      <defs>
        <linearGradient id="al-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#A8203A"/>
          <stop offset="100%" stopColor="#7A1026"/>
        </linearGradient>
      </defs>
      <path d="M40 6 L68 14 Q70 14 70 17 L70 44 Q70 60 40 74 Q10 60 10 44 L10 17 Q10 14 12 14 Z"
            fill="url(#al-grad)" stroke="#6A0E20" strokeWidth="0.6"/>
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
          Staff Portal
        </div>
      </div>
    )}
  </div>
)

export default function AdminLoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [tab, setTab] = useState('admin')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [showPw, setShowPw] = useState(false)

  const TABS = [
    {id:'teacher', label:'Teacher', svg:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'},
    {id:'admin',   label:'Admin',   svg:'<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>'},
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
        const found = STAFF_DEMO.find(d => d.email === email && d.pw === pw)
        if (!found) throw new Error('Invalid credentials')
        const nameMap = { teacher:'James', admin:'Admin' }
        const lastMap = { teacher:'Muthomi', admin:'User' }
        const fakeUser = { firstName: nameMap[found.role]||'Staff', lastName: lastMap[found.role]||'', role: found.role, email }
        localStorage.setItem('sm_token', 'demo-token-' + found.role)
        localStorage.setItem('sm_user', JSON.stringify(fakeUser))
        window.location.href = '/' + found.role
        return
      }
      // ctx.login() returns null when mustChangePassword is true —
      // in that case it already redirected to /reset-password, so just stop here.
      if (!user) { setLoading(false); return }

      const STAFF_ROLES = ['admin','teacher','ops_manager','accountant','sales']
      if (!STAFF_ROLES.includes(user.role)) {
        setErr('This login is for staff only. Students and parents please use the main portal.')
        setLoading(false)
        return
      }
      toast.ok(`Welcome back, ${user.firstName}!`)
      const ROLE_PATHS = {
        admin:       '/admin',
        teacher:     '/teacher',
        ops_manager: '/ops',
        accountant:  '/accounts',
        sales:       '/sales',
      }
      nav(ROLE_PATHS[user.role] || '/admin')
    } catch (e) {
      setErr(e.message || 'Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0806', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', position:'relative', overflow:'hidden', fontFamily:"'Syne',sans-serif" }}>
      <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60%', height:'120%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(139,26,46,.14) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'50%', height:'100%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(184,150,12,.08) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div style={{ textAlign:'center', marginBottom:24, position:'relative', zIndex:1 }}>
        <SmartiousLogo size={48} withText={true}/>
      </div>
      <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', background:'rgba(184,150,12,.08)', border:'1px solid rgba(184,150,12,.22)', borderRadius:99, marginBottom:24, position:'relative', zIndex:1 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F0CC5A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'#F0CC5A' }}>Staff &amp; Administrator Access</span>
      </div>

      <div style={{ background:'rgba(26,21,16,.96)', border:'1px solid rgba(184,150,12,.2)', borderRadius:24, padding:44, width:'100%', maxWidth:440, boxShadow:'0 60px 120px rgba(10,8,6,.28)', position:'relative', zIndex:1, backdropFilter:'blur(20px)' }}>
        <div style={{ display:'flex', background:'rgba(255,255,255,.05)', borderRadius:8, padding:3, marginBottom:26 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setEmail(''); setPw(''); setErr('') }}
              style={{ flex:1, padding:'10px 8px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer', border:'none', transition:'all .2s', fontFamily:"'Syne',sans-serif", color: tab===t.id ? '#fff' : 'rgba(247,243,237,.4)', background: tab===t.id ? '#8B1A2E' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', gap:6, boxShadow: tab===t.id ? '0 2px 8px rgba(139,26,46,.4)' : 'none' }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:t.svg}} />
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'#fff', marginBottom:4 }}>
          {tab === 'admin' ? 'Administrator Sign-in' : 'Teacher Sign-in'}
        </div>
        <div style={{ fontSize:13, color:'rgba(247,243,237,.38)', marginBottom:20 }}>
          {tab === 'admin'
            ? 'Full system access · Admin portal'
            : 'Course delivery, grading and student progress'}
        </div>

        {err && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:8, background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.25)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#F87171', marginBottom:14, lineHeight:1.45 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:2}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{err}</span>
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
            Sign In to {tab === 'admin' ? 'Admin' : 'Teacher'} Portal
          </>}
        </button>

        <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid rgba(255,255,255,.07)', fontSize:11.5, color:'rgba(247,243,237,.35)', lineHeight:1.6 }}>
          <strong style={{color:'rgba(247,243,237,.55)'}}>Not a staff member?</strong>{' '}
          Students and parents use the <Link to="/login" style={{color:'#F0CC5A',textDecoration:'none',fontWeight:600}}>main portal login</Link>.
        </div>
      </div>

      <div style={{ marginTop:20, textAlign:'center', position:'relative', zIndex:1 }}>
        <Link to="/" style={{ fontSize:12.5, color:'rgba(247,243,237,.25)', textDecoration:'none' }}>← Back to Smartious Website</Link>
      </div>
    </div>
  )
}
