/**
 * ResetPasswordPage.jsx
 * Three scenarios on /reset-password:
 *
 * A) Forgot password (no token, not logged in):
 *    Step 1 — enter email → send OTP
 *    Step 2 — enter OTP → verify
 *    Step 3 — enter new password → change
 *
 * B) Confirm reset from email link (/reset-password?token=...&email=...):
 *    Enter new password → reset-password-confirm
 *
 * C) Initial login (mustChangePassword, logged in):
 *    Step 1 — send OTP to their email
 *    Step 2 — verify OTP
 *    Step 3 — set new password
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast, useAuth, api } from '../context/ctx.jsx'

const CR = '#8B1A2E'
const GD = '#C9973A'
const BG = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&q=80&auto=format&fit=crop'

const Logo = () => (
  <div style={{ display:'inline-flex', alignItems:'center', gap:12 }}>
    <svg width="42" height="42" viewBox="0 0 80 80" fill="none">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#A8203A"/><stop offset="100%" stopColor="#7A1026"/></linearGradient></defs>
      <path d="M40 6 L68 14 Q70 14 70 17 L70 44 Q70 60 40 74 Q10 60 10 44 L10 17 Q10 14 12 14 Z" fill="url(#lg)" stroke="#6A0E20" strokeWidth="0.6"/>
      <polygon points="40,19 42.2,26 49.5,26 43.7,30.4 45.9,37.5 40,33 34.1,37.5 36.3,30.4 30.5,26 37.8,26" fill="#C9973A"/>
    </svg>
    <div style={{ lineHeight:1.1 }}>
      <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:23, fontWeight:700, color:'#fff' }}>
        Smart<em style={{ fontStyle:'italic', color:GD, fontWeight:500 }}>ious</em>
      </div>
      <div style={{ fontSize:8.5, fontWeight:600, letterSpacing:'.16em', color:'rgba(247,243,237,.5)', textTransform:'uppercase', marginTop:2 }}>
        Homeschool · Global
      </div>
    </div>
  </div>
)

export default function ResetPasswordPage() {
  const nav   = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const params   = new URLSearchParams(window.location.search)
  const urlToken = params.get('token') || ''
  const urlEmail = params.get('email') || ''

  // step: 'email' | 'otp' | 'password' | 'token_reset' | 'done'
  const [step,    setStep]    = useState(urlToken ? 'token_reset' : 'email')
  const [email,   setEmail]   = useState(urlEmail || user?.email || '')
  const [otp,     setOtp]     = useState('')
  const [pw,      setPw]      = useState('')
  const [cpw,     setCpw]     = useState('')
  const [show,    setShow]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [resendCD,setResendCD]= useState(0)

  // Countdown for resend
  useEffect(() => {
    if (resendCD <= 0) return
    const t = setTimeout(() => setResendCD(c => c-1), 1000)
    return () => clearTimeout(t)
  }, [resendCD])

  const inp = focused => ({
    width:'100%', background:'transparent', border:'none',
    borderBottom: focused ? '2px solid '+GD : '1.5px solid rgba(255,255,255,.25)',
    padding:'12px 0 12px 30px', fontSize:15, color:'#fff', outline:'none',
    fontFamily:'inherit', transition:'border-color .2s', boxSizing:'border-box',
  })

  const ErrBox = () => error ? (
    <div style={{ background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#FCA5A5', marginBottom:20, lineHeight:1.45 }}>
      {error}
    </div>
  ) : null

  const Btn = ({ label, disabled, onClick, type='button' }) => (
    <button type={type} disabled={disabled} onClick={onClick} style={{
      width:'100%', padding:'14px', background:'#fff', color:CR, border:'none',
      borderRadius:30, fontWeight:800, fontSize:13, letterSpacing:'.16em',
      textTransform:'uppercase', cursor:disabled?'not-allowed':'pointer',
      opacity:disabled?.65:1, transition:'transform .15s', fontFamily:'inherit',
    }}
      onMouseEnter={e=>!disabled&&(e.currentTarget.style.transform='translateY(-1px)')}
      onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
      {label}
    </button>
  )

  // ── Step 1: Send OTP ───────────────────────────────────────
  const sendOtp = async () => {
    setError('')
    if (!email.trim()) { setError('Enter your email address.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/send-otp', { email: email.trim() })
      if (data.success) {
        setStep('otp')
        setResendCD(60)
        toast.ok('Verification code sent — check your inbox.')
      } else {
        setError(data.message || 'Could not send code.')
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not reach server.')
    } finally { setLoading(false) }
  }

  // ── Step 2: Verify OTP ────────────────────────────────────
  const verifyOtp = async () => {
    setError('')
    if (!otp.trim()) { setError('Enter the 6-digit code.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { email: email.trim(), otp: otp.trim() })
      if (data.success) {
        setStep('password')
        setError('')
      } else {
        setError(data.message || 'Invalid code.')
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Verification failed.')
    } finally { setLoading(false) }
  }

  // ── Step 3: Change password (after OTP verified) ──────────
  const changePassword = async () => {
    setError('')
    if (!pw || !cpw) { setError('Both fields are required.'); return }
    if (pw.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (pw !== cpw) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/change-password', { email: email.trim(), newPassword: pw })
      if (data.success) {
        setStep('done')
        toast.ok('Password changed successfully.')
        setTimeout(() => nav('/login'), 2000)
      } else {
        setError(data.message || 'Could not change password.')
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not change password.')
    } finally { setLoading(false) }
  }

  // ── Token-based reset (from email link) ──────────────────
  const tokenReset = async () => {
    setError('')
    if (!pw || !cpw) { setError('Both fields are required.'); return }
    if (pw.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (pw !== cpw) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/reset-password-confirm', {
        email: urlEmail, token: urlToken, newPassword: pw,
      })
      if (data.success) {
        setStep('done')
        toast.ok('Password updated.')
        setTimeout(() => nav('/login'), 2000)
      } else {
        setError(data.message || 'Reset failed.')
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Reset failed. Link may have expired.')
    } finally { setLoading(false) }
  }

  const LockIcon = ({ active }) => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active?GD:'rgba(255,255,255,.45)'} strokeWidth="1.8" strokeLinecap="round"
      style={{ position:'absolute', left:0, top:14, transition:'stroke .2s' }}>
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )

  const [ef, setEf] = useState(false)
  const [pf, setPf] = useState(false)
  const [cf, setCf] = useState(false)

  const renderContent = () => {
    if (step === 'done') return (
      <>
        <div style={{ width:56,height:56,borderRadius:'50%',background:'rgba(34,197,94,.15)',border:'2px solid rgba(34,197,94,.4)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2rem',color:'#fff',margin:'0 0 12px' }}>Password updated!</h1>
        <p style={{ fontSize:14,color:'rgba(247,243,237,.65)',lineHeight:1.65 }}>Redirecting to login...</p>
      </>
    )

    if (step === 'email') return (
      <>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2.2rem',color:'#fff',margin:'0 0 10px',lineHeight:1.1 }}>Forgot your password?</h1>
        <p style={{ fontSize:14,color:'rgba(247,243,237,.6)',lineHeight:1.6,marginBottom:32 }}>
          Enter your account email. We'll send a 6-digit verification code to confirm it's you.
        </p>
        <ErrBox/>
        <div style={{ position:'relative',marginBottom:28 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={ef?GD:'rgba(255,255,255,.45)'} strokeWidth="1.8" strokeLinecap="round"
            style={{ position:'absolute',left:0,top:14,transition:'stroke .2s' }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            onFocus={()=>setEf(true)} onBlur={()=>setEf(false)}
            onKeyDown={e=>e.key==='Enter'&&sendOtp()}
            placeholder="Your email address" autoComplete="email"
            style={inp(ef)}/>
        </div>
        <Btn label={loading?'Sending code...':'Send verification code'} disabled={loading} onClick={sendOtp}/>
      </>
    )

    if (step === 'otp') return (
      <>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2.2rem',color:'#fff',margin:'0 0 10px',lineHeight:1.1 }}>Check your inbox</h1>
        <p style={{ fontSize:14,color:'rgba(247,243,237,.6)',lineHeight:1.6,marginBottom:8 }}>
          We sent a 6-digit code to <strong style={{color:'#fff'}}>{email}</strong>. Enter it below.
        </p>
        <p style={{ fontSize:12,color:'rgba(247,243,237,.4)',marginBottom:28 }}>Code expires in 10 minutes. Check your spam folder if you don't see it.</p>
        <ErrBox/>
        <div style={{ position:'relative',marginBottom:28 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={ef?GD:'rgba(255,255,255,.45)'} strokeWidth="1.8" strokeLinecap="round"
            style={{ position:'absolute',left:0,top:14,transition:'stroke .2s' }}>
            <circle cx="12" cy="12" r="9"/><path d="M12 8v4l2 2"/>
          </svg>
          <input type="text" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
            onFocus={()=>setEf(true)} onBlur={()=>setEf(false)}
            onKeyDown={e=>e.key==='Enter'&&verifyOtp()}
            placeholder="6-digit code" autoComplete="one-time-code" inputMode="numeric"
            style={{...inp(ef), fontSize:24, letterSpacing:8, fontFamily:'monospace'}}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <Btn label={loading?'Verifying...':'Verify code'} disabled={loading} onClick={verifyOtp}/>
        </div>
        <div style={{ textAlign:'center' }}>
          {resendCD > 0
            ? <span style={{ fontSize:12.5,color:'rgba(247,243,237,.4)' }}>Resend in {resendCD}s</span>
            : <button onClick={() => { setResendCD(60); sendOtp() }}
                style={{ background:'none',border:'none',color:GD,fontSize:12.5,cursor:'pointer',textDecoration:'underline' }}>
                Resend code
              </button>
          }
        </div>
      </>
    )

    if (step === 'password' || step === 'token_reset') return (
      <>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2.2rem',color:'#fff',margin:'0 0 10px',lineHeight:1.1 }}>
          {step === 'token_reset' ? 'Set a new password' : 'New password'}
        </h1>
        <p style={{ fontSize:14,color:'rgba(247,243,237,.6)',lineHeight:1.6,marginBottom:32 }}>
          {step === 'token_reset' ? `Setting new password for ${urlEmail}.` : 'Identity verified. Choose a strong new password.'}
        </p>
        <ErrBox/>
        <div style={{ position:'relative',marginBottom:22 }}>
          <LockIcon active={pf}/>
          <input value={pw} onChange={e=>setPw(e.target.value)}
            onFocus={()=>setPf(true)} onBlur={()=>setPf(false)}
            type={show?'text':'password'} placeholder="New password (min 8 characters)"
            autoComplete="new-password" style={inp(pf)}/>
        </div>
        <div style={{ position:'relative',marginBottom:14 }}>
          <LockIcon active={cf}/>
          <input value={cpw} onChange={e=>setCpw(e.target.value)}
            onFocus={()=>setCf(true)} onBlur={()=>setCf(false)}
            type={show?'text':'password'} placeholder="Confirm new password"
            autoComplete="new-password" style={inp(cf)}/>
        </div>
        <label style={{ display:'flex',alignItems:'center',gap:8,fontSize:12.5,color:'rgba(247,243,237,.6)',cursor:'pointer',marginBottom:28 }}>
          <input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)} style={{cursor:'pointer',accentColor:GD}}/>
          Show passwords
        </label>
        <Btn
          label={loading ? 'Updating...' : 'Set new password'}
          disabled={loading}
          onClick={step === 'token_reset' ? tokenReset : changePassword}
        />
      </>
    )
  }

  return (
    <div style={{ minHeight:'100vh',display:'flex',background:'#080C14',fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",overflow:'hidden' }}>
      <div style={{ flex:'0 0 460px',background:'linear-gradient(135deg,#8B1A2E 0%,#080C14 100%)',position:'relative',display:'flex',flexDirection:'column',padding:'56px 56px 40px',zIndex:2,boxShadow:'10px 0 40px rgba(0,0,0,.4)' }} className="rp-left">
        <div style={{ marginBottom:'auto' }}>
          <Link to="/" style={{ textDecoration:'none',display:'inline-block' }}><Logo/></Link>
        </div>
        <div style={{ marginBottom:'auto',paddingTop:48 }}>
          {renderContent()}
        </div>
        <div style={{ paddingTop:24,borderTop:'1px solid rgba(255,255,255,.08)',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap' }}>
          <Link to="/login" style={{ fontSize:12,color:'rgba(247,243,237,.45)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Login
          </Link>
          <Link to="/" style={{ fontSize:12,color:'rgba(247,243,237,.45)',textDecoration:'none' }}>Smartious.com</Link>
        </div>
      </div>
      <div style={{ flex:1,position:'relative',backgroundColor:'#1a1a1a',overflow:'hidden' }} className="rp-right">
        <img src={BG} alt="" aria-hidden="true" onError={e=>{e.currentTarget.style.display='none'}}
          style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center' }}/>
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(to right,rgba(8,12,20,.45) 0%,rgba(8,12,20,.15) 40%,rgba(8,12,20,.25) 100%)' }}/>
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
