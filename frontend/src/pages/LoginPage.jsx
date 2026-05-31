import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, useToast } from '../context/ctx.jsx'

// Background photo for the right-side panel — Unsplash students/campus.
// Swap with a real Smartious photo when available.
const BG_PHOTO_DESKTOP = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&q=80&auto=format&fit=crop'
const BG_PHOTO_MOBILE  = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&q=75&auto=format&fit=crop'

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
        <div style={{fontSize: size*0.2, fontWeight:600, letterSpacing:'.16em', color:'rgba(247,243,237,.5)', textTransform:'uppercase', marginTop:2}}>
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
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)

  const submit = async (e) => {
    e?.preventDefault()
    setErr('')
    if (!email || !pw) {
      setErr('Enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const user = await login(email, pw)
      // Block staff roles that hit the public portal by mistake
      if (user.role === 'teacher' || user.role === 'admin') {
        setErr('Staff accounts must sign in via the Admin Login link.')
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

  // Reusable underline-input style. Tied to focus state via inline checks.
  const inputBaseStyle = (focused) => ({
    width:'100%',
    background:'transparent',
    border:'none',
    borderBottom: focused
      ? '2px solid #F0CC5A'
      : '1.5px solid rgba(255,255,255,.25)',
    padding:'12px 0 12px 30px',
    fontSize:15,
    color:'#fff',
    outline:'none',
    fontFamily:"'Syne',sans-serif",
    transition:'border-color .2s',
    boxSizing:'border-box',
  })

  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      background:'#0A0806',
      fontFamily:"'Syne',sans-serif",
      overflow:'hidden',
    }}>
      {/* LEFT PANEL — Form */}
      <div style={{
        flex:'0 0 460px',
        background:'linear-gradient(135deg, #8B1A2E 0%, #0A0806 100%)',
        position:'relative',
        display:'flex',
        flexDirection:'column',
        padding:'56px 56px 40px',
        zIndex:2,
        boxShadow:'10px 0 40px rgba(0,0,0,.4)',
      }} className="login-left">

        {/* Logo */}
        <div style={{marginBottom:'auto'}}>
          <Link to="/" style={{textDecoration:'none',display:'inline-block'}}>
            <SmartiousLogo size={42} withText={true}/>
          </Link>
        </div>

        {/* Welcome heading */}
        <div style={{marginBottom:36}}>
          <h1 style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:'2.8rem',
            fontWeight:700,
            color:'#fff',
            lineHeight:1.05,
            marginBottom:8,
            letterSpacing:'-.01em',
          }}>Welcome</h1>
          <p style={{
            fontSize:14,
            color:'rgba(247,243,237,.6)',
            fontWeight:400,
            letterSpacing:'.02em',
          }}>Sign in to continue your learning journey</p>
        </div>

        {/* Error banner */}
        {err && (
          <div style={{
            display:'flex',
            alignItems:'flex-start',
            gap:8,
            background:'rgba(220,38,38,.12)',
            border:'1px solid rgba(220,38,38,.3)',
            borderRadius:8,
            padding:'10px 14px',
            fontSize:13,
            color:'#FCA5A5',
            marginBottom:20,
            lineHeight:1.45,
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:2}}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{err}</span>
          </div>
        )}

        {/* Email input */}
        <div style={{position:'relative',marginBottom:24}}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={emailFocused ? '#F0CC5A' : 'rgba(255,255,255,.5)'} strokeWidth="1.8" strokeLinecap="round"
            style={{position:'absolute',left:0,top:14,transition:'stroke .2s'}}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <input
            value={email}
            onChange={e=>setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            type="email"
            placeholder="Email address"
            onKeyDown={e=>e.key==='Enter' && submit()}
            autoComplete="email"
            style={inputBaseStyle(emailFocused)}
          />
        </div>

        {/* Password input */}
        <div style={{position:'relative',marginBottom:32}}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={pwFocused ? '#F0CC5A' : 'rgba(255,255,255,.5)'} strokeWidth="1.8" strokeLinecap="round"
            style={{position:'absolute',left:0,top:14,transition:'stroke .2s'}}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            value={pw}
            onChange={e=>setPw(e.target.value)}
            onFocus={() => setPwFocused(true)}
            onBlur={() => setPwFocused(false)}
            type={showPw ? 'text' : 'password'}
            placeholder="Password"
            onKeyDown={e=>e.key==='Enter' && submit()}
            autoComplete="current-password"
            style={{...inputBaseStyle(pwFocused), paddingRight:36}}
          />
          <button
            type="button"
            onClick={()=>setShowPw(v=>!v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            style={{
              position:'absolute',
              right:0,
              top:12,
              background:'none',
              border:'none',
              cursor:'pointer',
              color:'rgba(247,243,237,.5)',
              padding:4,
            }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {showPw ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Sign-in button */}
        <button
          onClick={submit}
          disabled={loading}
          style={{
            width:'100%',
            padding:'14px',
            background:'#fff',
            color:'#8B1A2E',
            border:'none',
            borderRadius:30,
            fontWeight:800,
            fontSize:13,
            letterSpacing:'.16em',
            textTransform:'uppercase',
            cursor:loading ? 'not-allowed' : 'pointer',
            transition:'transform .15s, box-shadow .15s, opacity .15s',
            fontFamily:"'Syne',sans-serif",
            boxShadow:'0 10px 30px rgba(255,255,255,.18)',
            opacity:loading ? .65 : 1,
            marginBottom:18,
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
          {loading ? 'Signing in…' : 'Login'}
        </button>

        {/* Forgot password */}
        <div style={{textAlign:'left',marginBottom:'auto'}}>
          <Link to="/reset-password" style={{
            fontSize:13,
            color:'rgba(247,243,237,.6)',
            textDecoration:'none',
            borderBottom:'1px solid transparent',
            transition:'color .2s, border-color .2s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.color='#F0CC5A';e.currentTarget.style.borderColor='rgba(240,204,90,.4)'}}
          onMouseLeave={e=>{e.currentTarget.style.color='rgba(247,243,237,.6)';e.currentTarget.style.borderColor='transparent'}}>
            Forgot Password?
          </Link>
        </div>

        {/* Footer links */}
        <div style={{
          paddingTop:24,
          borderTop:'1px solid rgba(255,255,255,.08)',
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          gap:12,
          flexWrap:'wrap',
        }}>
          <Link to="/" style={{
            fontSize:12,
            color:'rgba(247,243,237,.45)',
            textDecoration:'none',
            display:'inline-flex',
            alignItems:'center',
            gap:6,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Website
          </Link>
          <Link to="/enroll" style={{
            fontSize:12,
            color:'rgba(247,243,237,.65)',
            textDecoration:'none',
            fontWeight:600,
          }}>
            New here? <span style={{color:'#F0CC5A',borderBottom:'1px solid rgba(240,204,90,.4)'}}>Enroll →</span>
          </Link>
        </div>
      </div>

      {/* RIGHT PANEL — Photo */}
      <div style={{
        flex:1,
        position:'relative',
        backgroundColor:'#1a1a1a',
        overflow:'hidden',
      }} className="login-right">
        <picture>
          <source media="(max-width: 880px)" srcSet={BG_PHOTO_MOBILE}/>
          <img
            src={BG_PHOTO_DESKTOP}
            alt=""
            aria-hidden="true"
            onError={e => { e.currentTarget.style.display='none' }}
            style={{
              position:'absolute',
              inset:0,
              width:'100%',
              height:'100%',
              objectFit:'cover',
              objectPosition:'center',
            }}
          />
        </picture>
        {/* Subtle overlay so photo has consistent mood */}
        <div style={{
          position:'absolute',
          inset:0,
          background:'linear-gradient(to right, rgba(10,8,6,.45) 0%, rgba(10,8,6,.15) 40%, rgba(10,8,6,.25) 100%)',
        }}/>
        {/* Optional tagline overlay at bottom */}
        <div style={{
          position:'absolute',
          bottom:36,
          right:36,
          maxWidth:340,
          textAlign:'right',
          color:'rgba(255,255,255,.85)',
        }}>
          <div style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:'1.4rem',
            fontWeight:700,
            lineHeight:1.25,
            textShadow:'0 2px 12px rgba(0,0,0,.5)',
            marginBottom:6,
          }}>Learn from anywhere. <em style={{color:'#F0CC5A'}}>Grow with us.</em></div>
          <div style={{
            fontSize:11.5,
            color:'rgba(255,255,255,.65)',
            letterSpacing:'.06em',
            textTransform:'uppercase',
            textShadow:'0 2px 8px rgba(0,0,0,.5)',
          }}>Smartious · 12+ countries · IGCSE · IB · A-Level</div>
        </div>
      </div>

      {/* Responsive — on mobile, photo becomes the background and form sits over it */}
      <style>{`
        @media (max-width: 880px) {
          .login-left {
            position: relative;
            flex: 1 !important;
            padding: 40px 28px !important;
            min-height: 100vh;
            background: linear-gradient(160deg, rgba(139,26,46,.72) 0%, rgba(10,8,6,.55) 100%) !important;
            z-index: 2 !important;
            box-shadow: none !important;
          }
          .login-right {
            position: fixed !important;
            inset: 0 !important;
            z-index: 1 !important;
            display: block !important;
          }
          .login-right > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
