import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast, useAuth } from '../context/ctx.jsx'
import { api } from '../context/ctx.jsx'

const BG_PHOTO_DESKTOP = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&q=80&auto=format&fit=crop'
const BG_PHOTO_MOBILE  = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&q=75&auto=format&fit=crop'

const SmartiousLogo = ({ size = 42 }) => (
  <div style={{display:'inline-flex',alignItems:'center',gap:12}}>
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Smartious Homeschool">
      <defs>
        <linearGradient id="rp-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A8203A"/>
          <stop offset="100%" stopColor="#7A1026"/>
        </linearGradient>
      </defs>
      <path d="M40 6 L68 14 Q70 14 70 17 L70 44 Q70 60 40 74 Q10 60 10 44 L10 17 Q10 14 12 14 Z" fill="url(#rp-grad)" stroke="#6A0E20" strokeWidth="0.6"/>
      <polygon points="40,19 42.2,26 49.5,26 43.7,30.4 45.9,37.5 40,33 34.1,37.5 36.3,30.4 30.5,26 37.8,26" fill="#F0CC5A" stroke="#C89A28" strokeWidth="0.4"/>
      <g transform="translate(40 52)">
        <path d="M-14 -4 L-14 8 L-1 9 L-1 -3 Q-8 -5 -14 -4 Z" fill="#FEFDFB"/>
        <path d="M14 -4 L14 8 L1 9 L1 -3 Q8 -5 14 -4 Z" fill="#FEFDFB"/>
      </g>
    </svg>
    <div style={{display:'flex',flexDirection:'column',lineHeight:1.1}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize: size*0.55, fontWeight:700, color:'#FEFDFB'}}>
        Smart<em style={{fontStyle:'italic',color:'#F0CC5A',fontWeight:500}}>ious</em>
      </div>
      <div style={{fontSize: size*0.2, fontWeight:600, letterSpacing:'.16em', color:'rgba(247,243,237,.5)', textTransform:'uppercase', marginTop:2}}>
        Homeschool · Global
      </div>
    </div>
  </div>
)

export default function ResetPasswordPage() {
  const nav = useNavigate()
  const toast = useToast()
  const { login } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)
  const [cpFocused, setCpFocused] = useState(false)

  const validate = () => {
    setError('')
    if (!password || !confirmPassword) { setError('Both fields are required'); return false }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return false }
    if (password !== confirmPassword) { setError('Passwords do not match'); return false }
    return true
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const response = await api.post('/auth/reset-password', { newPassword: password })
      if (response.status === 200) {
        setSuccess(true)
        toast.ok('Password reset successful')
        setTimeout(() => {
          const user = JSON.parse(localStorage.getItem('sm_user') || '{}')
          nav(`/${user.role || 'student'}`)
        }, 2000)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed'
      setError(msg)
      toast.error(msg)
    }
    setLoading(false)
  }

  const inputStyle = (focused) => ({
    width:'100%',
    background:'transparent',
    border:'none',
    borderBottom: focused ? '2px solid #F0CC5A' : '1.5px solid rgba(255,255,255,.25)',
    padding:'12px 0 12px 30px',
    fontSize:15,
    color:'#fff',
    outline:'none',
    fontFamily:"'Syne',sans-serif",
    transition:'border-color .2s',
    boxSizing:'border-box',
  })

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'#0A0806',fontFamily:"'Syne',sans-serif",overflow:'hidden'}}>
      {/* LEFT — form */}
      <div style={{
        flex:'0 0 460px',
        background:'linear-gradient(135deg, #8B1A2E 0%, #0A0806 100%)',
        position:'relative',
        display:'flex',
        flexDirection:'column',
        padding:'56px 56px 40px',
        zIndex:2,
        boxShadow:'10px 0 40px rgba(0,0,0,.4)',
      }} className="rp-left">

        {/* Logo */}
        <div style={{marginBottom:'auto'}}>
          <Link to="/" style={{textDecoration:'none',display:'inline-block'}}>
            <SmartiousLogo size={42}/>
          </Link>
        </div>

        {success ? (
          <>
            <div style={{marginBottom:36}}>
              <div style={{
                width:60,height:60,borderRadius:'50%',
                background:'rgba(34,197,94,.18)',
                border:'2px solid rgba(34,197,94,.5)',
                display:'flex',alignItems:'center',justifyContent:'center',
                marginBottom:24,
              }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',fontWeight:700,color:'#fff',lineHeight:1.1,marginBottom:8}}>Password set</h1>
              <p style={{fontSize:14,color:'rgba(247,243,237,.6)',lineHeight:1.6}}>Your new password is active. Taking you to your portal now.</p>
            </div>
            <div style={{marginBottom:'auto'}}/>
          </>
        ) : (
          <>
            {/* Heading */}
            <div style={{marginBottom:36}}>
              <h1 style={{
                fontFamily:"'Playfair Display',serif",
                fontSize:'2.2rem',fontWeight:700,color:'#fff',
                lineHeight:1.1,marginBottom:8,letterSpacing:'-.01em',
              }}>Set your password</h1>
              <p style={{fontSize:14,color:'rgba(247,243,237,.6)',lineHeight:1.6}}>This is your first time signing in. Choose a secure password to continue.</p>
            </div>

            {error && (
              <div style={{
                display:'flex',alignItems:'flex-start',gap:8,
                background:'rgba(220,38,38,.12)',
                border:'1px solid rgba(220,38,38,.3)',
                borderRadius:8,padding:'10px 14px',
                fontSize:13,color:'#FCA5A5',marginBottom:20,lineHeight:1.45,
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:2}}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* New password */}
            <div style={{position:'relative',marginBottom:24}}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={pwFocused ? '#F0CC5A' : 'rgba(255,255,255,.5)'} strokeWidth="1.8" strokeLinecap="round"
                style={{position:'absolute',left:0,top:14,transition:'stroke .2s'}}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                value={password}
                onChange={e=>setPassword(e.target.value)}
                onFocus={()=>setPwFocused(true)}
                onBlur={()=>setPwFocused(false)}
                type={showPassword ? 'text' : 'password'}
                placeholder="New password (min 8 characters)"
                onKeyDown={e=>e.key==='Enter' && submit()}
                autoComplete="new-password"
                style={inputStyle(pwFocused)}
              />
            </div>

            {/* Confirm password */}
            <div style={{position:'relative',marginBottom:14}}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={cpFocused ? '#F0CC5A' : 'rgba(255,255,255,.5)'} strokeWidth="1.8" strokeLinecap="round"
                style={{position:'absolute',left:0,top:14,transition:'stroke .2s'}}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <line x1="9" y1="16" x2="15" y2="16"/>
              </svg>
              <input
                value={confirmPassword}
                onChange={e=>setConfirmPassword(e.target.value)}
                onFocus={()=>setCpFocused(true)}
                onBlur={()=>setCpFocused(false)}
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                onKeyDown={e=>e.key==='Enter' && submit()}
                autoComplete="new-password"
                style={inputStyle(cpFocused)}
              />
            </div>

            {/* Show password toggle */}
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12.5,color:'rgba(247,243,237,.6)',cursor:'pointer',marginBottom:28}}>
              <input type="checkbox" checked={showPassword} onChange={e=>setShowPassword(e.target.checked)} style={{cursor:'pointer',accentColor:'#F0CC5A'}}/>
              Show passwords
            </label>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={loading}
              style={{
                width:'100%',padding:'14px',
                background:'#fff',color:'#8B1A2E',
                border:'none',borderRadius:30,
                fontWeight:800,fontSize:13,letterSpacing:'.16em',textTransform:'uppercase',
                cursor:loading?'not-allowed':'pointer',
                fontFamily:"'Syne',sans-serif",
                boxShadow:'0 10px 30px rgba(255,255,255,.18)',
                opacity:loading?.65:1,
                transition:'transform .15s',
              }}
              onMouseEnter={e=>!loading&&(e.currentTarget.style.transform='translateY(-1px)')}
              onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
              {loading ? 'Setting password…' : 'Set Password & Continue'}
            </button>

            <div style={{marginBottom:'auto'}}/>
          </>
        )}

        {/* Footer */}
        <div style={{paddingTop:24,borderTop:'1px solid rgba(255,255,255,.08)',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <Link to="/login" style={{fontSize:12,color:'rgba(247,243,237,.45)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Login
          </Link>
          <Link to="/" style={{fontSize:12,color:'rgba(247,243,237,.45)',textDecoration:'none'}}>
            Smartious.com
          </Link>
        </div>
      </div>

      {/* RIGHT — photo */}
      <div style={{flex:1,position:'relative',backgroundColor:'#1a1a1a',overflow:'hidden'}} className="rp-right">
        <picture>
          <source media="(max-width: 880px)" srcSet={BG_PHOTO_MOBILE}/>
          <img src={BG_PHOTO_DESKTOP} alt="" aria-hidden="true" onError={e=>{e.currentTarget.style.display='none'}}
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center'}}/>
        </picture>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to right, rgba(10,8,6,.45) 0%, rgba(10,8,6,.15) 40%, rgba(10,8,6,.25) 100%)'}}/>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .rp-left {
            position: relative;
            flex: 1 !important;
            padding: 40px 28px !important;
            min-height: 100vh;
            background: linear-gradient(160deg, rgba(139,26,46,.72) 0%, rgba(10,8,6,.55) 100%) !important;
            z-index: 2 !important;
            box-shadow: none !important;
          }
          .rp-right {
            position: fixed !important;
            inset: 0 !important;
            z-index: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
