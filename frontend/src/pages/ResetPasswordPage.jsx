import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast, useAuth, api } from '../context/ctx.jsx'

const BG = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&q=80&auto=format&fit=crop'
const BG_M = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&q=75&auto=format&fit=crop'
const CR = '#8B1A2E'
const GD = '#C9973A'

const Logo = ({ size = 42 }) => (
  <div style={{ display:'inline-flex', alignItems:'center', gap:12 }}>
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs><linearGradient id="rp-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A8203A"/><stop offset="100%" stopColor="#7A1026"/>
      </linearGradient></defs>
      <path d="M40 6 L68 14 Q70 14 70 17 L70 44 Q70 60 40 74 Q10 60 10 44 L10 17 Q10 14 12 14 Z" fill="url(#rp-g)" stroke="#6A0E20" strokeWidth="0.6"/>
      <polygon points="40,19 42.2,26 49.5,26 43.7,30.4 45.9,37.5 40,33 34.1,37.5 36.3,30.4 30.5,26 37.8,26" fill="#C9973A"/>
    </svg>
    <div style={{ lineHeight:1.1 }}>
      <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:size*0.55, fontWeight:700, color:'#fff' }}>
        Smart<em style={{ fontStyle:'italic', color:GD, fontWeight:500 }}>ious</em>
      </div>
      <div style={{ fontSize:size*0.2, fontWeight:600, letterSpacing:'.16em', color:'rgba(247,243,237,.5)', textTransform:'uppercase', marginTop:2 }}>
        Homeschool · Global
      </div>
    </div>
  </div>
)

export default function ResetPasswordPage() {
  const nav = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const params = new URLSearchParams(window.location.search)
  const urlToken = params.get('token') || ''
  const urlEmail = params.get('email') || ''

  // step: 'request' | 'confirm' | 'initial'
  const [step, setStep] = useState(
    urlToken ? 'confirm' : (user ? 'initial' : 'request')
  )
  const [email, setEmail] = useState(urlEmail)
  const [pw, setPw] = useState('')
  const [cpw, setCpw] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [ef, setEf] = useState(false)
  const [pf, setPf] = useState(false)
  const [cf, setCf] = useState(false)

  useEffect(() => {
    if (urlToken) setStep('confirm')
    else if (user) setStep('initial')
  }, [urlToken, user])

  const inp = focused => ({
    width:'100%', background:'transparent', border:'none',
    borderBottom: focused ? '2px solid '+GD : '1.5px solid rgba(255,255,255,.25)',
    padding:'12px 0 12px 30px', fontSize:15, color:'#fff', outline:'none',
    fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
    transition:'border-color .2s', boxSizing:'border-box',
  })

  const submitBtn = (label, disabled) => (
    <button type="submit" disabled={disabled} style={{
      width:'100%', padding:'14px', background:'#fff', color:CR,
      border:'none', borderRadius:30, fontWeight:800, fontSize:13,
      letterSpacing:'.16em', textTransform:'uppercase',
      cursor:disabled?'not-allowed':'pointer', opacity:disabled?.65:1,
      transition:'transform .15s', fontFamily:'inherit',
    }}
      onMouseEnter={e=>!disabled&&(e.currentTarget.style.transform='translateY(-1px)')}
      onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
      {label}
    </button>
  )

  // Step A — request reset email
  const submitRequest = async e => {
    e?.preventDefault(); setError('')
    if (!email.trim()) { setError('Enter your email address.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim() })
      if (data.success) setDone(true)
      else setError(data.message || 'Something went wrong.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not reach server.')
    } finally { setLoading(false) }
  }

  // Step B — confirm reset from email link
  const submitConfirm = async e => {
    e?.preventDefault(); setError('')
    if (!pw || !cpw) { setError('Both fields are required.'); return }
    if (pw.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (pw !== cpw) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/reset-password-confirm', {
        email: urlEmail, token: urlToken, newPassword: pw,
      })
      if (data.success) {
        setDone(true)
        toast.ok('Password updated — redirecting...')
        setTimeout(() => nav('/login'), 2200)
      } else { setError(data.message || 'Reset failed.') }
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed. Link may have expired.')
    } finally { setLoading(false) }
  }

  // Step C — initial/authenticated password set
  const submitInitial = async e => {
    e?.preventDefault(); setError('')
    if (!pw || !cpw) { setError('Both fields are required.'); return }
    if (pw.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (pw !== cpw) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/reset-password', { newPassword: pw })
      if (data.success) {
        setDone(true)
        toast.ok('Password set!')
        const u = JSON.parse(localStorage.getItem('sm_user') || '{}')
        setTimeout(() => nav('/' + (u.role || 'student')), 2000)
      } else { setError(data.message || 'Failed.') }
    } catch (err) {
      setError(err?.response?.data?.message || 'Password reset failed.')
    } finally { setLoading(false) }
  }

  const ErrBox = () => error ? (
    <div style={{ display:'flex', alignItems:'flex-start', gap:8, background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#FCA5A5', marginBottom:20, lineHeight:1.45 }}>
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:2}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {error}
    </div>
  ) : null

  const SuccessIcon = () => (
    <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(34,197,94,.15)', border:'2px solid rgba(34,197,94,.4)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
  )

  const renderContent = () => {
    // Success screens
    if (done && step === 'request') return (
      <>
        <SuccessIcon/>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'2rem', color:'#fff', margin:'0 0 12px', lineHeight:1.1 }}>Check your inbox</h1>
        <p style={{ fontSize:14, color:'rgba(247,243,237,.65)', lineHeight:1.65, margin:'0 0 14px' }}>
          If <strong style={{color:'#fff'}}>{email}</strong> is registered, a reset link is on its way. Check your inbox and spam folder.
        </p>
        <p style={{ fontSize:12.5, color:'rgba(247,243,237,.4)', lineHeight:1.6 }}>The link expires in 1 hour.</p>
      </>
    )

    if (done) return (
      <>
        <SuccessIcon/>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'2rem', color:'#fff', margin:'0 0 12px' }}>Password updated!</h1>
        <p style={{ fontSize:14, color:'rgba(247,243,237,.65)', lineHeight:1.65 }}>Redirecting to login...</p>
      </>
    )

    // Step A — request
    if (step === 'request') return (
      <>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'2.2rem', fontWeight:700, color:'#fff', lineHeight:1.1, marginBottom:8 }}>
          Forgot your password?
        </h1>
        <p style={{ fontSize:14, color:'rgba(247,243,237,.6)', lineHeight:1.6, marginBottom:32 }}>
          Enter the email on your Smartious account and we'll send you a reset link.
        </p>
        <ErrBox/>
        <form onSubmit={submitRequest}>
          <div style={{ position:'relative', marginBottom:28 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={ef?GD:'rgba(255,255,255,.45)'} strokeWidth="1.8" strokeLinecap="round" style={{position:'absolute',left:0,top:14,transition:'stroke .2s'}}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              onFocus={()=>setEf(true)} onBlur={()=>setEf(false)}
              placeholder="Your email address" autoComplete="email"
              onKeyDown={e=>e.key==='Enter'&&submitRequest()}
              style={inp(ef)}/>
          </div>
          {submitBtn(loading ? 'Sending...' : 'Send reset link', loading)}
        </form>
      </>
    )

    // Steps B & C — set new password
    const meta = {
      confirm: { title:'Set a new password', sub:`Resetting password for ${urlEmail}.` },
      initial: { title:'Set your password',  sub:'First sign-in. Choose a secure password to continue.' },
    }
    const { title, sub } = meta[step] || meta.initial
    const onSubmit = step === 'confirm' ? submitConfirm : submitInitial

    return (
      <>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'2.2rem', fontWeight:700, color:'#fff', lineHeight:1.1, marginBottom:8 }}>{title}</h1>
        <p style={{ fontSize:14, color:'rgba(247,243,237,.6)', lineHeight:1.6, marginBottom:36 }}>{sub}</p>
        <ErrBox/>
        <form onSubmit={onSubmit}>
          <div style={{ position:'relative', marginBottom:24 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={pf?GD:'rgba(255,255,255,.45)'} strokeWidth="1.8" strokeLinecap="round" style={{position:'absolute',left:0,top:14,transition:'stroke .2s'}}>
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input value={pw} onChange={e=>setPw(e.target.value)} onFocus={()=>setPf(true)} onBlur={()=>setPf(false)}
              type={show?'text':'password'} placeholder="New password (min 8 characters)"
              autoComplete="new-password" style={inp(pf)}/>
          </div>
          <div style={{ position:'relative', marginBottom:14 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={cf?GD:'rgba(255,255,255,.45)'} strokeWidth="1.8" strokeLinecap="round" style={{position:'absolute',left:0,top:14,transition:'stroke .2s'}}>
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="9" y1="16" x2="15" y2="16"/>
            </svg>
            <input value={cpw} onChange={e=>setCpw(e.target.value)} onFocus={()=>setCf(true)} onBlur={()=>setCf(false)}
              type={show?'text':'password'} placeholder="Confirm new password"
              autoComplete="new-password" style={inp(cf)}/>
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12.5, color:'rgba(247,243,237,.6)', cursor:'pointer', marginBottom:28 }}>
            <input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)} style={{cursor:'pointer',accentColor:GD}}/>
            Show passwords
          </label>
          {submitBtn(loading ? 'Setting password…' : 'Set Password & Continue', loading)}
        </form>
      </>
    )
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#080C14', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", overflow:'hidden' }}>
      <div style={{ flex:'0 0 460px', background:'linear-gradient(135deg,#8B1A2E 0%,#080C14 100%)', position:'relative', display:'flex', flexDirection:'column', padding:'56px 56px 40px', zIndex:2, boxShadow:'10px 0 40px rgba(0,0,0,.4)' }} className="rp-left">
        <div style={{ marginBottom:'auto' }}>
          <Link to="/" style={{ textDecoration:'none', display:'inline-block' }}><Logo size={42}/></Link>
        </div>
        <div style={{ marginBottom:'auto', paddingTop:48 }}>
          {renderContent()}
        </div>
        <div style={{ paddingTop:24, borderTop:'1px solid rgba(255,255,255,.08)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <Link to="/login" style={{ fontSize:12, color:'rgba(247,243,237,.45)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Login
          </Link>
          <Link to="/" style={{ fontSize:12, color:'rgba(247,243,237,.45)', textDecoration:'none' }}>Smartious.com</Link>
        </div>
      </div>

      <div style={{ flex:1, position:'relative', backgroundColor:'#1a1a1a', overflow:'hidden' }} className="rp-right">
        <picture>
          <source media="(max-width: 880px)" srcSet={BG_M}/>
          <img src={BG} alt="" aria-hidden="true" onError={e=>{e.currentTarget.style.display='none'}}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}/>
        </picture>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right,rgba(8,12,20,.45) 0%,rgba(8,12,20,.15) 40%,rgba(8,12,20,.25) 100%)' }}/>
      </div>

      <style>{`
        @media(max-width:880px){
          .rp-left{position:relative;flex:1!important;padding:40px 28px!important;background:linear-gradient(160deg,rgba(139,26,46,.72) 0%,rgba(8,12,20,.55) 100%)!important;z-index:2!important;box-shadow:none!important;}
          .rp-right{position:fixed!important;inset:0!important;z-index:1!important;}
        }
      `}</style>
    </div>
  )
}
