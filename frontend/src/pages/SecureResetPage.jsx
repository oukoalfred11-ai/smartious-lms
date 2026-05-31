/**
 * Secure Password Reset Page
 * Users with temporary credentials must reset their password here on first login.
 * Only "Logout" and "Change Password" buttons are active.
 */
import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const BG_PHOTO_DESKTOP = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&q=80&auto=format&fit=crop'
const BG_PHOTO_MOBILE  = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&q=75&auto=format&fit=crop'

const SmartiousLogo = ({ size = 42 }) => (
  <div style={{display:'inline-flex',alignItems:'center',gap:12}}>
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Smartious Homeschool">
      <defs>
        <linearGradient id="sr-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A8203A"/>
          <stop offset="100%" stopColor="#7A1026"/>
        </linearGradient>
      </defs>
      <path d="M40 6 L68 14 Q70 14 70 17 L70 44 Q70 60 40 74 Q10 60 10 44 L10 17 Q10 14 12 14 Z" fill="url(#sr-grad)" stroke="#6A0E20" strokeWidth="0.6"/>
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

export default function SecureResetPage() {
  const nav = useNavigate()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [focused, setFocused] = useState({ current:false, new:false, confirm:false })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const e = {}
    if (!formData.currentPassword) e.currentPassword = 'Current password is required'
    if (!formData.newPassword) e.newPassword = 'New password is required'
    else if (formData.newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters'
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your new password'
    else if (formData.newPassword !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/secure-reset`,
        { currentPassword: formData.currentPassword, newPassword: formData.newPassword },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )
      if (response.data.success) {
        setSuccess(true)
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          user.forcePasswordChange = false
          localStorage.setItem('user', JSON.stringify(user))
        }
        setTimeout(() => nav('/dashboard', { replace: true }), 2000)
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reset password'
      setErrors({ submit: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    nav('/login', { replace: true })
  }

  const inputStyle = (focused, hasErr) => ({
    width:'100%',
    background:'transparent',
    border:'none',
    borderBottom: hasErr
      ? '2px solid #F87171'
      : focused
        ? '2px solid #C9973A'
        : '1.5px solid rgba(255,255,255,.25)',
    padding:'12px 0 12px 30px',
    fontSize:15,
    color:'#fff',
    outline:'none',
    fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
    transition:'border-color .2s',
    boxSizing:'border-box',
  })

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'#080C14',fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",overflow:'hidden'}}>
      {/* LEFT — form */}
      <div style={{
        flex:'0 0 460px',
        background:'linear-gradient(135deg, #8B1A2E 0%, #080C14 100%)',
        position:'relative',
        display:'flex',
        flexDirection:'column',
        padding:'48px 56px 36px',
        zIndex:2,
        boxShadow:'10px 0 40px rgba(0,0,0,.4)',
        overflowY:'auto',
      }} className="sr-left">

        <div style={{marginBottom:32}}>
          <Link to="/" style={{textDecoration:'none',display:'inline-block'}}>
            <SmartiousLogo size={38}/>
          </Link>
        </div>

        {success ? (
          <>
            <div style={{
              width:60,height:60,borderRadius:'50%',
              background:'rgba(34,197,94,.18)',
              border:'2px solid rgba(34,197,94,.5)',
              display:'flex',alignItems:'center',justifyContent:'center',
              marginBottom:24,
            }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2.2rem',fontWeight:700,color:'#fff',lineHeight:1.1,marginBottom:8}}>Password changed</h1>
            <p style={{fontSize:14,color:'rgba(247,243,237,.6)',lineHeight:1.6,marginBottom:'auto'}}>Your new password is active. Taking you to your dashboard now.</p>
          </>
        ) : (
          <>
            <div style={{marginBottom:28}}>
              <div style={{fontSize:10.5,fontWeight:700,letterSpacing:'.16em',textTransform:'uppercase',color:'#C9973A',marginBottom:10}}>Security required</div>
              <h1 style={{
                fontFamily:"'DM Serif Display',Georgia,serif",
                fontSize:'2rem',fontWeight:700,color:'#fff',
                lineHeight:1.1,marginBottom:8,letterSpacing:'-.01em',
              }}>Change your password</h1>
              <p style={{fontSize:13.5,color:'rgba(247,243,237,.6)',lineHeight:1.6}}>Your account is using a temporary password. Set a permanent one to continue.</p>
            </div>

            {errors.submit && (
              <div style={{
                display:'flex',alignItems:'flex-start',gap:8,
                background:'rgba(220,38,38,.12)',
                border:'1px solid rgba(220,38,38,.3)',
                borderRadius:8,padding:'10px 14px',
                fontSize:13,color:'#FCA5A5',marginBottom:18,lineHeight:1.45,
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:2}}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Current password */}
            <div style={{position:'relative',marginBottom: errors.currentPassword ? 6 : 20}}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={focused.current ? '#C9973A' : 'rgba(255,255,255,.5)'} strokeWidth="1.8" strokeLinecap="round"
                style={{position:'absolute',left:0,top:14,transition:'stroke .2s'}}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPw ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                onFocus={()=>setFocused(f=>({...f,current:true}))}
                onBlur={()=>setFocused(f=>({...f,current:false}))}
                placeholder="Current temporary password"
                autoComplete="current-password"
                style={inputStyle(focused.current, !!errors.currentPassword)}
              />
            </div>
            {errors.currentPassword && (
              <p style={{fontSize:11.5,color:'#F87171',margin:'0 0 14px 30px'}}>{errors.currentPassword}</p>
            )}

            {/* New password */}
            <div style={{position:'relative',marginBottom: errors.newPassword ? 6 : 20}}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={focused.new ? '#C9973A' : 'rgba(255,255,255,.5)'} strokeWidth="1.8" strokeLinecap="round"
                style={{position:'absolute',left:0,top:14,transition:'stroke .2s'}}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPw ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                onFocus={()=>setFocused(f=>({...f,new:true}))}
                onBlur={()=>setFocused(f=>({...f,new:false}))}
                placeholder="New password (min 8 characters)"
                autoComplete="new-password"
                style={inputStyle(focused.new, !!errors.newPassword)}
              />
            </div>
            {errors.newPassword && (
              <p style={{fontSize:11.5,color:'#F87171',margin:'0 0 14px 30px'}}>{errors.newPassword}</p>
            )}

            {/* Confirm password */}
            <div style={{position:'relative',marginBottom: errors.confirmPassword ? 6 : 16}}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={focused.confirm ? '#C9973A' : 'rgba(255,255,255,.5)'} strokeWidth="1.8" strokeLinecap="round"
                style={{position:'absolute',left:0,top:14,transition:'stroke .2s'}}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <line x1="9" y1="16" x2="15" y2="16"/>
              </svg>
              <input
                type={showPw ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={()=>setFocused(f=>({...f,confirm:true}))}
                onBlur={()=>setFocused(f=>({...f,confirm:false}))}
                placeholder="Confirm new password"
                autoComplete="new-password"
                style={inputStyle(focused.confirm, !!errors.confirmPassword)}
              />
            </div>
            {errors.confirmPassword && (
              <p style={{fontSize:11.5,color:'#F87171',margin:'0 0 14px 30px'}}>{errors.confirmPassword}</p>
            )}

            {/* Show password */}
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12.5,color:'rgba(247,243,237,.6)',cursor:'pointer',marginBottom:24}}>
              <input type="checkbox" checked={showPw} onChange={e=>setShowPw(e.target.checked)} style={{cursor:'pointer',accentColor:'#C9973A'}}/>
              Show passwords
            </label>

            {/* Change Password — primary */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || success}
              style={{
                width:'100%',padding:'14px',
                background:'#fff',color:'#8B1A2E',
                border:'none',borderRadius:30,
                fontWeight:800,fontSize:12.5,letterSpacing:'.16em',textTransform:'uppercase',
                cursor:isLoading||success?'not-allowed':'pointer',
                fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
                boxShadow:'0 10px 30px rgba(255,255,255,.18)',
                opacity:isLoading||success?.65:1,
                marginBottom:12,
              }}>
              {isLoading ? 'Updating…' : 'Change Password & Continue'}
            </button>

            {/* Logout — secondary */}
            <button
              onClick={handleLogout}
              style={{
                width:'100%',padding:'12px',
                background:'transparent',color:'rgba(247,243,237,.75)',
                border:'1px solid rgba(255,255,255,.18)',borderRadius:30,
                fontWeight:600,fontSize:12,letterSpacing:'.1em',textTransform:'uppercase',
                cursor:'pointer',
                fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
                transition:'background .2s, border-color .2s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.05)';e.currentTarget.style.borderColor='rgba(255,255,255,.3)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='rgba(255,255,255,.18)'}}>
              Logout
            </button>

            {/* Info */}
            <div style={{
              marginTop:24,
              background:'rgba(201,151,58,.08)',
              border:'1px solid rgba(201,151,58,.2)',
              borderRadius:8,padding:'12px 14px',
              fontSize:12.5,color:'rgba(247,243,237,.72)',lineHeight:1.55,
            }}>
              You must set a new password before accessing the dashboard. This is a one-time security requirement.
            </div>
          </>
        )}

        <div style={{marginTop:'auto',paddingTop:24}}></div>
      </div>

      {/* RIGHT — photo */}
      <div style={{flex:1,position:'relative',backgroundColor:'#1a1a1a',overflow:'hidden'}} className="sr-right">
        <picture>
          <source media="(max-width: 880px)" srcSet={BG_PHOTO_MOBILE}/>
          <img src={BG_PHOTO_DESKTOP} alt="" aria-hidden="true" onError={e=>{e.currentTarget.style.display='none'}}
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center'}}/>
        </picture>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to right, rgba(8,12,20,.45) 0%, rgba(8,12,20,.15) 40%, rgba(8,12,20,.25) 100%)'}}/>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .sr-left {
            position: relative;
            flex: 1 !important;
            padding: 32px 24px !important;
            min-height: 100vh;
            background: linear-gradient(160deg, rgba(139,26,46,.72) 0%, rgba(8,12,20,.55) 100%) !important;
            z-index: 2 !important;
            box-shadow: none !important;
          }
          .sr-right {
            position: fixed !important;
            inset: 0 !important;
            z-index: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
