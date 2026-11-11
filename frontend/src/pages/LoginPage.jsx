import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, useToast } from '../context/ctx.jsx'
import SmartiousCrest from '../components/SmartiousCrest.jsx'

/* ═══════════════════════════════════════════════════════════════════
   LoginPage — student and parent sign-in
   ───────────────────────────────────────────────────────────────────
   Desktop: cream sign-in column on the left; crimson panel on the
   right with the student artwork (public/images/login/student-*.webp,
   Smartious crest on her shirt) sitting in a soft light.
   Mobile: the crimson panel becomes a header with the artwork, the
   form follows on cream.
   Headings in Source Serif 4, body in DM Sans; one colour per sentence.
═══════════════════════════════════════════════════════════════════ */

const CSS = `
.lg{min-height:100vh;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);background:#F8F3EA;font-family:'DM Sans',system-ui,sans-serif;color:#1E1418}
.lg *{box-sizing:border-box}
.lg-form{display:flex;flex-direction:column;padding:40px clamp(28px,5vw,88px) 32px;min-height:100vh}
.lg-brand{display:inline-flex;align-items:center;gap:12px;text-decoration:none}
.lg-word{display:flex;flex-direction:column;line-height:1.05}
.lg-word b{font-family:'Source Serif 4',Georgia,serif;font-size:23px;font-weight:700;color:#7D1025}
.lg-word b em{font-style:italic;font-weight:500;color:#B8862E}
.lg-word span{font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#8C7A7E;margin-top:4px}
.lg-main{margin:auto 0;width:100%;max-width:420px;padding:48px 0}
.lg-eb{font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#7D1025;margin:0 0 14px}
.lg h1{font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:clamp(2.6rem,3.6vw,3.4rem);line-height:1.02;letter-spacing:-.02em;color:#1E1418;margin:0 0 12px}
.lg-sub{font-size:16px;line-height:1.6;color:#6B5A5E;margin:0 0 34px}
.lg-err{display:flex;gap:10px;align-items:flex-start;background:#FDECEC;border:1px solid #F5C2C2;color:#9B1C1C;border-radius:12px;padding:12px 14px;font-size:14px;line-height:1.45;margin:0 0 20px}
.lg-field{margin:0 0 18px}
.lg-label{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;font-weight:700;color:#3B2A2F;margin:0 0 8px}
.lg-label a{font-weight:600;color:#7D1025;text-decoration:none}
.lg-label a:hover{text-decoration:underline}
.lg-box{position:relative}
.lg-box svg.ic{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:#A8979B;pointer-events:none;transition:color .2s}
.lg-in{width:100%;height:54px;border:1.5px solid #E6DCCB;border-radius:12px;background:#fff;padding:0 48px 0 46px;font:500 15.5px 'DM Sans',system-ui,sans-serif;color:#1E1418;outline:none;transition:border-color .2s,box-shadow .2s}
.lg-in::placeholder{color:#B3A5A8}
.lg-in:hover{border-color:#D6C7B0}
.lg-in:focus{border-color:#7D1025;box-shadow:0 0 0 4px rgba(125,16,37,.1)}
.lg-box:focus-within svg.ic{color:#7D1025}
.lg-eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:38px;height:38px;border:none;background:none;border-radius:8px;color:#8C7A7E;cursor:pointer;display:flex;align-items:center;justify-content:center}
.lg-eye:hover{background:#F4ECDF;color:#7D1025}
.lg-btn{width:100%;height:56px;margin-top:10px;border:none;border-radius:12px;background:#7D1025;color:#fff;font:800 16px 'DM Sans',system-ui,sans-serif;letter-spacing:.01em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 12px 28px rgba(125,16,37,.26);transition:transform .18s,background .18s,box-shadow .18s}
.lg-btn:hover:not(:disabled){background:#5E0B1C;transform:translateY(-1px);box-shadow:0 16px 32px rgba(125,16,37,.3)}
.lg-btn:disabled{opacity:.7;cursor:not-allowed}
.lg-or{display:flex;align-items:center;gap:14px;margin:30px 0 18px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#A8979B}
.lg-or::before,.lg-or::after{content:'';flex:1;height:1px;background:#E6DCCB}
.lg-new{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff;border:1px solid #EFE6D8;border-radius:14px;padding:16px 18px;text-decoration:none;transition:border-color .2s,transform .2s}
.lg-new:hover{border-color:#D6C7B0;transform:translateY(-1px)}
.lg-new b{display:block;font-size:15px;color:#1E1418}
.lg-new span{display:block;font-size:13.5px;color:#6B5A5E;margin-top:2px}
.lg-new i{flex-shrink:0;width:38px;height:38px;border-radius:50%;background:#F8F3EA;color:#7D1025;display:flex;align-items:center;justify-content:center}
.lg-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;font-size:13px;color:#8C7A7E}
.lg-foot a{color:#6B5A5E;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
.lg-foot a:hover{color:#7D1025}
.lg-art{position:relative;overflow:hidden;min-height:100vh;background:#F1E4D5;isolation:isolate}
.lg-art::before{content:'';position:absolute;inset:0;z-index:-2;background-image:linear-gradient(rgba(125,16,37,.055) 1px,transparent 1px);background-size:100% 34px;-webkit-mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,.55) 100%);mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,.55) 100%)}
.lg-art::after{content:'';position:absolute;top:0;bottom:0;left:clamp(40px,7%,84px);width:1.5px;z-index:-2;background:rgba(196,70,90,.22)}
.lg-arch{position:absolute;left:64%;bottom:0;transform:translateX(-50%);width:min(64%,calc(72vh));height:74%;border-radius:999px 999px 0 0;z-index:-1;background:radial-gradient(90% 70% at 50% 72%,#A3192F 0%,#7D1025 55%,#5C0B1B 100%);box-shadow:inset 0 2px 0 rgba(255,255,255,.08)}
.lg-arch::before{content:'';position:absolute;inset:-16px -16px 0 -16px;border-radius:999px 999px 0 0;border:1.5px solid #D2A24C;border-bottom:none;opacity:.85}
.lg-arch::after{content:'';position:absolute;left:50%;top:14%;width:62%;aspect-ratio:1;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,226,200,.42) 0%,rgba(255,226,200,0) 66%)}
.lg-art img{position:absolute;left:46%;bottom:0;transform:translateX(-50%);width:min(90%,calc(100vh * 0.98));height:auto;filter:drop-shadow(0 26px 30px rgba(60,10,20,.28))}
.lg-copy{position:absolute;left:clamp(64px,11%,128px);top:clamp(44px,8vh,92px);max-width:420px;z-index:3}
.lg-copy h2{font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:clamp(2rem,2.7vw,2.7rem);line-height:1.06;letter-spacing:-.015em;color:#7D1025;margin:0 0 14px}
.lg-copy h2 em{display:block;font-style:italic;font-weight:600;color:#A87422}
.lg-copy p{font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#8C6A70;margin:0}
.lg-card{position:absolute;z-index:3;background:#fff;border-radius:16px;box-shadow:0 18px 40px rgba(70,20,30,.16),0 2px 6px rgba(70,20,30,.06);display:flex;align-items:center;gap:12px;padding:12px 16px 12px 12px;color:#1E1418;animation:lgFloat 6s ease-in-out infinite}
.lg-card i{flex-shrink:0;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center}
.lg-card b{display:block;font-size:14px;font-weight:800;line-height:1.25}
.lg-card span{display:block;font-size:12.5px;color:#6B5A5E;margin-top:2px}
.lg-c1{left:clamp(36px,6%,90px);top:36%;transform:rotate(-3deg)}
.lg-c1 i{background:#7D1025;color:#fff}
.lg-c2{right:clamp(20px,5%,64px);top:25%;transform:rotate(2.5deg);animation-delay:-2s}
.lg-c2 i{background:#E7F6EC;color:#15803D}
.lg-live{position:absolute;z-index:3;left:clamp(36px,6%,90px);top:51%;display:flex;align-items:center;gap:10px;padding:8px 14px 8px 8px;border-radius:999px;background:#1E1418;color:#FBF6EE;font-size:13px;font-weight:700;box-shadow:0 14px 30px rgba(30,10,15,.28);animation:lgFloat 7s ease-in-out infinite;animation-delay:-4s}
.lg-av{display:flex}
.lg-av em{width:26px;height:26px;border-radius:50%;border:2px solid #1E1418;margin-left:-8px;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:10.5px;font-weight:800;color:#1E1418}
.lg-av em:first-child{margin-left:0}
.lg-rec{width:8px;height:8px;border-radius:50%;background:#EF4444;box-shadow:0 0 0 4px rgba(239,68,68,.25)}
.lg-star{position:absolute;z-index:3;color:#D2A24C}
.lg-s1{right:12%;top:15%;width:26px}.lg-s2{left:30%;top:31%;width:14px;opacity:.8}.lg-s3{right:31%;top:22%;width:12px;opacity:.7}
@keyframes lgFloat{0%,100%{translate:0 0}50%{translate:0 -7px}}
@media (prefers-reduced-motion: reduce){.lg-card,.lg-live{animation:none}}
@media (max-width: 980px){
  .lg{grid-template-columns:1fr;grid-template-rows:auto 1fr}
  .lg-art{order:-1;min-height:0;height:clamp(360px,92vw,480px);border-radius:0 0 28px 28px}
  .lg-art::after{left:22px}
  .lg-arch{left:64%;width:62%;height:72%}
  .lg-arch::before{inset:-10px -10px 0 -10px}
  .lg-art img{left:50%;width:auto;height:76%}
  .lg-copy,.lg-c1,.lg-c2,.lg-s2,.lg-s3{display:none}
  .lg-c1{left:16px;top:auto;bottom:34%;padding:9px 12px 9px 9px;border-radius:14px}
  .lg-c1 i{width:32px;height:32px;border-radius:10px}
  .lg-c1 b{font-size:12.5px}.lg-c1 span{font-size:11.5px}
  .lg-live{left:16px;top:96px;font-size:12px;padding:6px 12px 6px 6px}
  .lg-av em{width:22px;height:22px;font-size:9.5px}
  .lg-s1{right:7%;top:20%;width:18px}
  .lg-form{min-height:0;padding:0 22px 28px}
  .lg-brand-top{position:absolute;top:18px;left:20px;z-index:4}
  .lg-brand-top svg{width:36px;height:36px}
  .lg-brand-top .lg-word b{font-size:20px}
  .lg-form > .lg-brand{display:none}
  .lg-main{margin:0 auto;padding:30px 0 34px;max-width:480px}
  .lg h1{font-size:2.4rem}
  .lg-sub{font-size:15px;margin-bottom:26px}
  .lg-foot{max-width:480px;width:100%;margin:0 auto}
}
@media (min-width: 981px){ .lg-brand-top{display:none} }
`

const Brand = ({ className = '' }) => (
  <Link to="/" className={'lg-brand ' + className} aria-label="Smartious Homeschool home">
    <SmartiousCrest size={42}/>
    <div className="lg-word"><b>Smart<em>ious</em></b><span>Homeschool · Global</span></div>
  </Link>
)

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
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
      const STAFF_ROLES = ['admin','teacher','ops_manager','accountant','sales']
      if (STAFF_ROLES.includes(user.role)) {
        setErr('Staff accounts must sign in via the Admin Login link.')
        setLoading(false)
        return
      }
      toast.ok(`Welcome back, ${user.firstName}!`)
      const ROLE_PATHS = { student:'/student', parent:'/parent' }
      // Opened from a lesson link (e.g. the daily timetable email): go
      // straight into that lesson; leaving it returns to the portal.
      let after = null
      try { after = sessionStorage.getItem('smartious.afterLogin'); sessionStorage.removeItem('smartious.afterLogin') } catch (e2) { /* noop */ }
      if (after && /^\/classroom\/[\w-]+$/.test(after)) {
        try { sessionStorage.setItem('smartious.classroomReturn', ROLE_PATHS[user.role] || '/portal') } catch (e2) { /* noop */ }
        nav(after)
      } else nav(ROLE_PATHS[user.role] || '/portal')
    } catch (e) {
      setErr(e.message || 'Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <div className="lg">
      <style>{CSS}</style>

      <div className="lg-form">
        <Brand/>
        <main className="lg-main">
          <p className="lg-eb">Student &amp; parent portal</p>
          <h1>Welcome back.</h1>
          <p className="lg-sub">Sign in to your classes, homework and reports.</p>

          {err && (
            <div className="lg-err" role="alert">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:1}} aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{err}</span>
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <div className="lg-field">
              <label className="lg-label" htmlFor="lg-email">Email address</label>
              <div className="lg-box">
                <svg className="ic" width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>
                </svg>
                <input id="lg-email" className="lg-in" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email" inputMode="email"/>
              </div>
            </div>

            <div className="lg-field">
              <div className="lg-label">
                <label htmlFor="lg-pw">Password</label>
                <Link to="/reset-password">Forgot password?</Link>
              </div>
              <div className="lg-box">
                <svg className="ic" width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="lg-pw" className="lg-in" type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                  placeholder="Your password" autoComplete="current-password"/>
                <button type="button" className="lg-eye" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                    {showPw
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" className="lg-btn" disabled={loading}>
              {loading ? 'Signing in…' : <>Sign in <Arrow/></>}
            </button>
          </form>

          <div className="lg-or">New to Smartious?</div>
          <Link to="/assessment" className="lg-new">
            <div><b>Book an assessment</b><span>The first step to joining a class.</span></div>
            <i><Arrow/></i>
          </Link>
        </main>

        <div className="lg-foot">
          <Link to="/">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to website
          </Link>
          <Link to="/admin-login">Staff sign in</Link>
        </div>
      </div>

      <div className="lg-art">
        <Brand className="lg-brand-top"/>
        <div className="lg-copy">
          <h2>Learn from anywhere. <em>Grow with us.</em></h2>
          <p>IGCSE · IB · A-Level</p>
        </div>
        <div className="lg-arch" aria-hidden="true"/>
        <span className="lg-star lg-s1" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c.7 6.4 5.6 11.3 12 12-6.4.7-11.3 5.6-12 12-.7-6.4-5.6-11.3-12-12C6.4 11.3 11.3 6.4 12 0z"/></svg></span>
        <span className="lg-star lg-s2" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c.7 6.4 5.6 11.3 12 12-6.4.7-11.3 5.6-12 12-.7-6.4-5.6-11.3-12-12C6.4 11.3 11.3 6.4 12 0z"/></svg></span>
        <span className="lg-star lg-s3" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c.7 6.4 5.6 11.3 12 12-6.4.7-11.3 5.6-12 12-.7-6.4-5.6-11.3-12-12C6.4 11.3 11.3 6.4 12 0z"/></svg></span>
        <picture>
          <source media="(max-width: 980px)" srcSet="/images/login/student-760.webp"/>
          <img src="/images/login/student-1200.webp" width="1200" height="1027" alt="" fetchpriority="high" decoding="async"/>
        </picture>
        <div className="lg-card lg-c1" aria-hidden="true">
          <i><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm-7-8h5v5h-5z"/></svg></i>
          <div><b>Next class · Biology</b><span>Today at 10:00</span></div>
        </div>
        <div className="lg-card lg-c2" aria-hidden="true">
          <i><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></i>
          <div><b>Homework submitted</b><span>Physics · Waves</span></div>
        </div>
        <div className="lg-live" aria-hidden="true">
          <span className="lg-av"><em style={{background:'#F6D9A8'}}>A</em><em style={{background:'#F3C6CF'}}>K</em><em style={{background:'#CFE3F7'}}>M</em></span>
          <span className="lg-rec"/> Live now
        </div>
      </div>
    </div>
  )
}
