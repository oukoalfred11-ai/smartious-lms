import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../context/ctx.jsx'
import { api } from '../context/ctx.jsx'

const BG_PHOTO_DESKTOP = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&q=80&auto=format&fit=crop'
const BG_PHOTO_MOBILE  = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&q=75&auto=format&fit=crop'

const SmartiousLogo = ({ size = 42 }) => (
  <div style={{display:'inline-flex',alignItems:'center',gap:12}}>
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Smartious Homeschool">
      <defs>
        <linearGradient id="ve-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A8203A"/>
          <stop offset="100%" stopColor="#7A1026"/>
        </linearGradient>
      </defs>
      <path d="M40 6 L68 14 Q70 14 70 17 L70 44 Q70 60 40 74 Q10 60 10 44 L10 17 Q10 14 12 14 Z" fill="url(#ve-grad)" stroke="#6A0E20" strokeWidth="0.6"/>
      <polygon points="40,19 42.2,26 49.5,26 43.7,30.4 45.9,37.5 40,33 34.1,37.5 36.3,30.4 30.5,26 37.8,26" fill="#C9973A" stroke="#C89A28" strokeWidth="0.4"/>
      <g transform="translate(40 52)">
        <path d="M-14 -4 L-14 8 L-1 9 L-1 -3 Q-8 -5 -14 -4 Z" fill="#FFFFFF"/>
        <path d="M14 -4 L14 8 L1 9 L1 -3 Q8 -5 14 -4 Z" fill="#FFFFFF"/>
      </g>
    </svg>
    <div style={{display:'flex',flexDirection:'column',lineHeight:1.1}}>
      <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize: size*0.55, fontWeight:700, color:'#FFFFFF'}}>
        Smart<em style={{fontStyle:'italic',color:'#C9973A',fontWeight:500}}>ious</em>
      </div>
      <div style={{fontSize: size*0.2, fontWeight:600, letterSpacing:'.16em', color:'rgba(247,243,237,.5)', textTransform:'uppercase', marginTop:2}}>
        Homeschool · Global
      </div>
    </div>
  </div>
)

export default function VerifyEmailPage() {
  const nav = useNavigate()
  const toast = useToast()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const tokenFromUrl = urlParams.get('token')
        const tokenFromStorage = localStorage.getItem('sm_verify_token')
        const token = tokenFromUrl || tokenFromStorage

        if (!token) {
          setStatus('error')
          setMessage('No verification token provided. Please check your email link.')
          return
        }

        const response = await api.post('/auth/verify-email', { token })
        if (response.status === 200) {
          setStatus('success')
          setMessage(response.data.message || 'Email verified successfully.')
          toast.ok('Email verified. Redirecting to password reset.')
          setTimeout(() => nav('/reset-password'), 3000)
        }
      } catch (error) {
        setStatus('error')
        const msg = error.response?.data?.message || error.message || 'Verification failed.'
        setMessage(msg)
        toast.error(msg)
      }
    }
    verifyToken()
  }, [nav, toast])

  useEffect(() => {
    if (status !== 'success') return
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [status])

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'#080C14',fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",overflow:'hidden'}}>
      {/* LEFT — content */}
      <div style={{
        flex:'0 0 460px',
        background:'linear-gradient(135deg, #8B1A2E 0%, #080C14 100%)',
        position:'relative',
        display:'flex',
        flexDirection:'column',
        padding:'56px 56px 40px',
        zIndex:2,
        boxShadow:'10px 0 40px rgba(0,0,0,.4)',
      }} className="ve-left">

        <div style={{marginBottom:'auto'}}>
          <Link to="/" style={{textDecoration:'none',display:'inline-block'}}>
            <SmartiousLogo size={42}/>
          </Link>
        </div>

        {/* Verifying state — pulsing crimson dot */}
        {status === 'verifying' && (
          <>
            <div style={{marginBottom:36}}>
              <div style={{
                width:60,height:60,borderRadius:'50%',
                background:'rgba(201,151,58,.18)',
                border:'2px solid rgba(201,151,58,.5)',
                display:'flex',alignItems:'center',justifyContent:'center',
                marginBottom:24,
                animation:'ve-pulse 1.4s ease-in-out infinite',
              }}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#C9973A" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2.2rem',fontWeight:700,color:'#fff',lineHeight:1.1,marginBottom:8}}>Verifying your email</h1>
              <p style={{fontSize:14,color:'rgba(247,243,237,.6)',lineHeight:1.6}}>This usually takes just a moment. Please wait while we confirm your email address.</p>
            </div>
            <div style={{marginBottom:'auto'}}/>
          </>
        )}

        {/* Success state */}
        {status === 'success' && (
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
              <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2.2rem',fontWeight:700,color:'#fff',lineHeight:1.1,marginBottom:8}}>Email verified</h1>
              <p style={{fontSize:14,color:'rgba(247,243,237,.65)',lineHeight:1.6,marginBottom:20}}>{message}</p>
              <p style={{fontSize:12.5,color:'rgba(247,243,237,.45)',letterSpacing:'.04em'}}>
                Redirecting in <strong style={{color:'#C9973A'}}>{countdown}</strong> seconds…
              </p>
            </div>

            <button
              onClick={() => nav('/reset-password')}
              style={{
                width:'100%',padding:'14px',
                background:'#fff',color:'#8B1A2E',
                border:'none',borderRadius:30,
                fontWeight:800,fontSize:13,letterSpacing:'.16em',textTransform:'uppercase',
                cursor:'pointer',
                fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
                boxShadow:'0 10px 30px rgba(255,255,255,.18)',
                marginBottom:'auto',
              }}>
              Continue to Password Reset
            </button>
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <>
            <div style={{marginBottom:36}}>
              <div style={{
                width:60,height:60,borderRadius:'50%',
                background:'rgba(220,38,38,.18)',
                border:'2px solid rgba(220,38,38,.5)',
                display:'flex',alignItems:'center',justifyContent:'center',
                marginBottom:24,
              }}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2.2rem',fontWeight:700,color:'#fff',lineHeight:1.1,marginBottom:8}}>Verification failed</h1>
              <p style={{fontSize:14,color:'rgba(247,243,237,.65)',lineHeight:1.6}}>{message}</p>
            </div>

            <button
              onClick={() => nav('/login')}
              style={{
                width:'100%',padding:'14px',
                background:'#fff',color:'#8B1A2E',
                border:'none',borderRadius:30,
                fontWeight:800,fontSize:13,letterSpacing:'.16em',textTransform:'uppercase',
                cursor:'pointer',
                fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
                boxShadow:'0 10px 30px rgba(255,255,255,.18)',
                marginBottom:'auto',
              }}>
              Back to Login
            </button>
          </>
        )}

        {/* Footer */}
        <div style={{paddingTop:24,borderTop:'1px solid rgba(255,255,255,.08)',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <Link to="/" style={{fontSize:12,color:'rgba(247,243,237,.45)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Website
          </Link>
          <Link to="/login" style={{fontSize:12,color:'rgba(247,243,237,.65)',textDecoration:'none',fontWeight:600}}>
            Sign In
          </Link>
        </div>
      </div>

      {/* RIGHT — photo */}
      <div style={{flex:1,position:'relative',backgroundColor:'#1a1a1a',overflow:'hidden'}} className="ve-right">
        <picture>
          <source media="(max-width: 880px)" srcSet={BG_PHOTO_MOBILE}/>
          <img src={BG_PHOTO_DESKTOP} alt="" aria-hidden="true" onError={e=>{e.currentTarget.style.display='none'}}
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center'}}/>
        </picture>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to right, rgba(8,12,20,.45) 0%, rgba(8,12,20,.15) 40%, rgba(8,12,20,.25) 100%)'}}/>
      </div>

      <style>{`
        @keyframes ve-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: .82; }
        }
        @media (max-width: 880px) {
          .ve-left {
            position: relative;
            flex: 1 !important;
            padding: 40px 28px !important;
            min-height: 100vh;
            background: linear-gradient(160deg, rgba(139,26,46,.72) 0%, rgba(8,12,20,.55) 100%) !important;
            z-index: 2 !important;
            box-shadow: none !important;
          }
          .ve-right {
            position: fixed !important;
            inset: 0 !important;
            z-index: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
