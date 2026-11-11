import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, useToast } from '../context/ctx.jsx'
import SmartiousCrest from '../components/SmartiousCrest.jsx'

/* ═══════════════════════════════════════════════════════════════════
   AdminLoginPage — teacher and staff sign-in (/admin-login)
   ───────────────────────────────────────────────────────────────────
   Desktop: the teaching photo framed on the left
   (public/images/login/staff-split-*.webp: a market and medicine behind
   the teacher and student, split by a gold diagonal) with a rotating line of
   motivation; the sign-in form on cream on the right.
   Mobile: the photo becomes a header, the form follows.
   The greeting follows the time of day. Headings in Source Serif 4,
   body in DM Sans; one colour per sentence.
═══════════════════════════════════════════════════════════════════ */

const LINES = [
  'Every lesson you teach today shapes a future.',
  'The patience you give is the confidence they keep.',
  'Small classes. Big moments. Make today count.',
  'One good question can change how a student thinks.',
  'You notice the quiet ones. That is the job.',
]

const CSS = `
.sl{min-height:100vh;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);background:#F8F3EA;font-family:'DM Sans',system-ui,sans-serif;color:#1E1418}
.sl *{box-sizing:border-box}
.sl-photo{position:relative;margin:16px;border-radius:28px;overflow:hidden;min-height:calc(100vh - 32px);background:#3A0A14}
.sl-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:45% 28%}
.sl-photo::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(40,4,12,.30) 0%,rgba(40,4,12,0) 26%,rgba(40,4,12,0) 46%,rgba(40,4,12,.55) 66%,rgba(36,3,10,.92) 100%)}
.sl-tag{position:absolute;z-index:2;top:22px;left:22px;display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#FBF6EE;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.sl-quote{position:absolute;z-index:2;left:clamp(26px,4vw,52px);right:clamp(26px,4vw,52px);bottom:clamp(28px,5vh,52px)}
.sl-mark{font-family:'Source Serif 4',Georgia,serif;font-size:76px;line-height:.6;color:#E8BA60;display:block;height:34px}
.sl-line{font-family:'Source Serif 4',Georgia,serif;font-style:italic;font-weight:600;font-size:clamp(1.6rem,2.3vw,2.25rem);line-height:1.2;color:#FBF6EE;margin:0 0 18px;min-height:2.4em;transition:opacity .6s ease,transform .6s ease}
.sl-line.out{opacity:0;transform:translateY(8px)}
.sl-by{font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:rgba(251,246,238,.68);margin:0 0 16px}
.sl-dots{display:flex;gap:6px}
.sl-dots button{width:22px;height:4px;border-radius:4px;border:none;padding:0;background:rgba(255,255,255,.3);cursor:pointer;transition:background .3s,width .3s}
.sl-dots button.on{width:38px;background:#E8BA60}
.sl-star{position:absolute;z-index:2;right:28px;top:26px;width:22px;color:#E8BA60;animation:slTwinkle 3.6s ease-in-out infinite}
.sl-star svg{display:block;width:100%;height:auto}
@keyframes slTwinkle{0%,100%{opacity:.4;transform:scale(.65) rotate(0deg)}45%{opacity:1;transform:scale(1.12) rotate(18deg)}}
.sl-form{display:flex;flex-direction:column;padding:40px clamp(28px,5vw,88px) 32px;min-height:100vh}
.sl-brand{display:inline-flex;align-items:center;gap:12px;text-decoration:none}
.sl-word{display:flex;flex-direction:column;line-height:1.05}
.sl-word b{font-family:'Source Serif 4',Georgia,serif;font-size:23px;font-weight:700;color:#7D1025}
.sl-word b em{font-style:italic;font-weight:500;color:#B8862E}
.sl-word span{font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#8C7A7E;margin-top:4px}
.sl-main{margin:auto 0;width:100%;max-width:420px;padding:44px 0}
.sl-eb{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#7D1025;margin:0 0 14px}
.sl h1{font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:clamp(2.6rem,3.6vw,3.4rem);line-height:1.02;letter-spacing:-.02em;color:#1E1418;margin:0 0 12px}
.sl-sub{font-size:16px;line-height:1.6;color:#6B5A5E;margin:0 0 26px}
.sl-seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:14px;background:#EFE6D8;margin:0 0 24px}
.sl-seg button{height:42px;border:none;border-radius:10px;background:transparent;font:700 14px 'DM Sans',system-ui,sans-serif;color:#6B5A5E;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s,color .2s,box-shadow .2s}
.sl-seg button.on{background:#fff;color:#7D1025;box-shadow:0 4px 12px rgba(70,20,30,.10)}
.sl-err{display:flex;gap:10px;align-items:flex-start;background:#FDECEC;border:1px solid #F5C2C2;color:#9B1C1C;border-radius:12px;padding:12px 14px;font-size:14px;line-height:1.45;margin:0 0 20px}
.sl-field{margin:0 0 18px}
.sl-label{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;font-weight:700;color:#3B2A2F;margin:0 0 8px}
.sl-label a{font-weight:600;color:#7D1025;text-decoration:none}
.sl-label a:hover{text-decoration:underline}
.sl-box{position:relative}
.sl-box svg.ic{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:#A8979B;pointer-events:none;transition:color .2s}
.sl-in{width:100%;height:54px;border:1.5px solid #E6DCCB;border-radius:12px;background:#fff;padding:0 48px 0 46px;font:500 15.5px 'DM Sans',system-ui,sans-serif;color:#1E1418;outline:none;transition:border-color .2s,box-shadow .2s}
.sl-in::placeholder{color:#B3A5A8}
.sl-in:hover{border-color:#D6C7B0}
.sl-in:focus{border-color:#7D1025;box-shadow:0 0 0 4px rgba(125,16,37,.1)}
.sl-box:focus-within svg.ic{color:#7D1025}
.sl-eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:38px;height:38px;border:none;background:none;border-radius:8px;color:#8C7A7E;cursor:pointer;display:flex;align-items:center;justify-content:center}
.sl-eye:hover{background:#F4ECDF;color:#7D1025}
.sl-btn{width:100%;height:56px;margin-top:10px;border:none;border-radius:12px;background:#7D1025;color:#fff;font:800 16px 'DM Sans',system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 12px 28px rgba(125,16,37,.26);transition:transform .18s,background .18s,box-shadow .18s}
.sl-btn:hover:not(:disabled){background:#5E0B1C;transform:translateY(-1px);box-shadow:0 16px 32px rgba(125,16,37,.3)}
.sl-btn:disabled{opacity:.7;cursor:not-allowed}
.sl-note{display:flex;gap:10px;align-items:center;margin:22px 0 0;font-size:13.5px;line-height:1.5;color:#6B5A5E}
.sl-note i{flex-shrink:0;width:34px;height:34px;border-radius:10px;background:#EFE6D8;color:#7D1025;display:flex;align-items:center;justify-content:center}
.sl-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;font-size:13px;color:#8C7A7E}
.sl-foot a{color:#6B5A5E;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
.sl-foot a:hover{color:#7D1025}
.sl-foot b{font-weight:700;color:#7D1025}
@media (prefers-reduced-motion: reduce){.sl-star{animation:none}.sl-line{transition:none}}
@media (max-width: 980px){
  .sl{grid-template-columns:1fr}
  .sl-photo{margin:0;border-radius:0 0 28px 28px;min-height:0;height:clamp(380px,100vw,520px)}
  .sl-photo img{object-position:50% 22%}
  .sl-line{font-size:1.35rem;margin-bottom:12px}
  .sl-mark{font-size:56px;height:24px}
  .sl-by{display:none}
  .sl-quote{bottom:22px;left:22px;right:22px}
  .sl-form{min-height:0;padding:0 22px 28px}
  .sl-form > .sl-brand{display:none}
  .sl-tag{top:18px;left:18px}
  .sl-main{margin:0 auto;padding:30px 0 34px;max-width:480px}
  .sl h1{font-size:2.4rem}
  .sl-sub{font-size:15px;margin-bottom:22px}
  .sl-foot{max-width:480px;width:100%;margin:0 auto}
}
`

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning.' : h < 17 ? 'Good afternoon.' : 'Good evening.'
}

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
)

export default function AdminLoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [tab, setTab] = useState('teacher')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [line, setLine] = useState(0)
  const [fading, setFading] = useState(false)

  // A new line of motivation 7 seconds after the last change,
  // with a soft fade. Restarts whenever the line changes, so tapping a bar
  // never collides with an automatic change.
  useEffect(() => {
    let t2
    const t1 = setTimeout(() => {
      setFading(true)
      t2 = setTimeout(() => { setLine(i => (i + 1) % LINES.length); setFading(false) }, 600)
    }, 7000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [line])

  const submit = async (e) => {
    e?.preventDefault()
    setErr('')
    if (!email || !pw) { setErr('Enter your email and password.'); return }
    setLoading(true)
    try {
      const user = await login(email, pw)
      // ctx.login() returns null when mustChangePassword is true —
      // in that case it already redirected to /reset-password, so just stop here.
      if (!user) { setLoading(false); return }

      const STAFF_ROLES = ['admin','teacher','ops_manager','accountant','sales','dos','qa']
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
        dos:         '/dos',
        qa:          '/qa',
      }
      nav(ROLE_PATHS[user.role] || '/admin')
    } catch (e) {
      setErr(e.message || 'Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <div className="sl">
      <style>{CSS}</style>

      <div className="sl-photo">
        <picture>
          <source media="(max-width: 980px)" srcSet="/images/login/staff-split-720.webp"/>
          <img src="/images/login/staff-split-1086.webp" width="1086" height="1448" alt="A Smartious teacher guiding a student through his work" fetchpriority="high" decoding="async"/>
        </picture>
        <span className="sl-tag">
          <SmartiousCrest size={18}/> Staff portal
        </span>
        <span className="sl-star" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c.7 6.4 5.6 11.3 12 12-6.4.7-11.3 5.6-12 12-.7-6.4-5.6-11.3-12-12C6.4 11.3 11.3 6.4 12 0z"/></svg></span>
        <div className="sl-quote">
          <span className="sl-mark" aria-hidden="true">“</span>
          <p className={'sl-line' + (fading ? ' out' : '')} aria-live="polite">{LINES[line]}</p>
          <p className="sl-by">For the teachers of Smartious</p>
          <div className="sl-dots">
            {LINES.map((_, i) => (
              <button key={i} type="button" className={i === line ? 'on' : ''} aria-label={'Show message ' + (i + 1)} onClick={() => { setFading(false); setLine(i) }}/>
            ))}
          </div>
        </div>
      </div>

      <div className="sl-form">
        <Link to="/" className="sl-brand" aria-label="Smartious Homeschool home">
          <SmartiousCrest size={42}/>
          <div className="sl-word"><b>Smart<em>ious</em></b><span>Staff portal</span></div>
        </Link>

        <main className="sl-main">
          <p className="sl-eb">Teachers &amp; staff</p>
          <h1>{greeting()}</h1>
          <p className="sl-sub">{tab === 'admin' ? 'Sign in to run admissions, fees, timetables and reports.' : 'Sign in to teach, mark homework and follow your students.'}</p>

          <div className="sl-seg" role="tablist" aria-label="I am signing in as">
            <button type="button" role="tab" aria-selected={tab === 'teacher'} className={tab === 'teacher' ? 'on' : ''} onClick={() => { setTab('teacher'); setErr('') }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
              Teacher
            </button>
            <button type="button" role="tab" aria-selected={tab === 'admin'} className={tab === 'admin' ? 'on' : ''} onClick={() => { setTab('admin'); setErr('') }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              Administration
            </button>
          </div>

          {err && (
            <div className="sl-err" role="alert">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:1}} aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{err}</span>
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <div className="sl-field">
              <label className="sl-label" htmlFor="sl-email">Work email</label>
              <div className="sl-box">
                <svg className="ic" width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
                <input id="sl-email" className="sl-in" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email"/>
              </div>
            </div>
            <div className="sl-field">
              <div className="sl-label">
                <label htmlFor="sl-pw">Password</label>
                <Link to="/reset-password">Forgot password?</Link>
              </div>
              <div className="sl-box">
                <svg className="ic" width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input id="sl-pw" className="sl-in" type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Your password" autoComplete="current-password"/>
                <button type="button" className="sl-eye" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                    {showPw
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" className="sl-btn" disabled={loading}>
              {loading ? 'Signing in…' : <>Sign in to the {tab === 'admin' ? 'staff' : 'teacher'} portal <Arrow/></>}
            </button>
          </form>

          <p className="sl-note">
            <i><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/></svg></i>
            For Smartious staff only. You'll go straight to the portal for your role.
          </p>
        </main>

        <div className="sl-foot">
          <Link to="/">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to website
          </Link>
          <Link to="/login">Student or parent? <b>Sign in here</b></Link>
        </div>
      </div>
    </div>
  )
}
