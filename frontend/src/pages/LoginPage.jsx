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
.lg-art{position:relative;overflow:hidden;background:radial-gradient(120% 90% at 70% 78%,#A0182F 0%,#7D1025 42%,#4E0A17 100%);min-height:100vh}
.lg-art::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1.3px);background-size:22px 22px;mask-image:linear-gradient(180deg,#000 0%,transparent 70%);-webkit-mask-image:linear-gradient(180deg,#000 0%,transparent 70%)}
.lg-glow{position:absolute;width:min(78vh,760px);aspect-ratio:1;border-radius:50%;right:-6%;bottom:-14%;background:radial-gradient(circle,rgba(255,236,214,.95) 0%,rgba(248,226,200,.55) 38%,rgba(248,226,200,0) 68%)}
.lg-ring{position:absolute;width:min(92vh,900px);aspect-ratio:1;border-radius:50%;right:-14%;bottom:-24%;border:1px solid rgba(255,255,255,.12)}
.lg-art img{position:absolute;right:2%;bottom:0;width:min(86%,calc(100vh * 0.98));height:auto;filter:drop-shadow(0 30px 40px rgba(40,4,12,.35))}
.lg-copy{position:absolute;left:clamp(32px,4vw,64px);top:clamp(40px,7vh,84px);max-width:440px;z-index:2}
.lg-copy h2{font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:clamp(2rem,2.8vw,2.8rem);line-height:1.08;letter-spacing:-.015em;color:#FBF6EE;margin:0 0 14px}
.lg-copy h2 em{display:block;font-style:italic;font-weight:600;color:#E8BA60}
.lg-copy p{font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(251,246,238,.62);margin:0}
.lg-chip{position:absolute;z-index:2;left:clamp(32px,6%,90px);bottom:30vh;display:flex;align-items:center;gap:12px;padding:12px 18px 12px 12px;border-radius:16px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#FBF6EE;box-shadow:0 18px 40px rgba(30,2,8,.25)}
.lg-chip i{width:40px;height:40px;border-radius:12px;background:#FBF6EE;color:#7D1025;display:flex;align-items:center;justify-content:center}
.lg-chip b{display:block;font-size:14.5px;font-weight:800}
.lg-chip span{display:flex;align-items:center;gap:6px;font-size:12.5px;color:rgba(251,246,238,.75);margin-top:2px}
.lg-dot{width:7px;height:7px;border-radius:50%;background:#4ADE80;box-shadow:0 0 0 4px rgba(74,222,128,.2)}
@media (max-width: 980px){
  .lg{grid-template-columns:1fr;grid-template-rows:auto 1fr}
  .lg-art{order:-1;min-height:0;border-radius:0 0 28px 28px}
  .lg-art{height:clamp(320px,56vw,440px)}
  .lg-art img{right:0;width:auto;height:84%;bottom:0}
  .lg-glow{width:110vw;max-width:620px;right:-20%;bottom:-45%}
  .lg-ring{display:none}
  .lg-copy,.lg-chip{display:none}
  .lg-form{min-height:0;padding:0 22px 28px}
  .lg-brand-top{position:absolute;top:18px;left:20px;z-index:3}
  .lg-brand-top svg{width:36px;height:36px}
  .lg-brand-top .lg-word b{font-size:20px}
  .lg-brand-top .lg-word b{color:#FBF6EE}
  .lg-brand-top .lg-word b em{color:#E8BA60}
  .lg-brand-top .lg-word span{color:rgba(251,246,238,.6)}
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
        <div className="lg-ring" aria-hidden="true"/>
        <div className="lg-glow" aria-hidden="true"/>
        <div className="lg-copy">
          <h2>Learn from anywhere. <em>Grow with us.</em></h2>
          <p>IGCSE · IB · A-Level</p>
        </div>
        <div className="lg-chip" aria-hidden="true">
          <i>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
          </i>
          <div><b>Live classes</b><span><em className="lg-dot"/>with expert teachers</span></div>
        </div>
        <picture>
          <source media="(max-width: 980px)" srcSet="/images/login/student-760.webp"/>
          <img src="/images/login/student-1200.webp" width="1200" height="1027" alt="" fetchpriority="high" decoding="async"/>
        </picture>
      </div>
    </div>
  )
}
