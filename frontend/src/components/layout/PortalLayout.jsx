import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth, useToast } from '../../context/ctx.jsx'

function Clock() {
  const [t, setT] = useState('')
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString('en-GB'))
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])
  return <span className="mono">{t}</span>
}

export default function PortalLayout({ title, navSections, children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { user, logout } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const loc = useLocation()
  const notifRef = useRef(null)

  useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'
  const handleLogout = () => { logout(); nav('/login') }

  const isActive = (item) => {
    if (item.active) return item.active
    const base = `/${user?.role}`
    if (item.path === base) return loc.pathname === base || loc.pathname === base + '/'
    return loc.pathname.startsWith(item.path)
  }

  return (
    <div className="app">
      <aside className={`sidebar${collapsed ? ' col' : ''}`}>
        <div className="sb-logo">
          <div className="sb-mark">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/>
            </svg>
          </div>
          <div>
            <div className="sb-text">Smartious<span>.</span></div>
            <div className="sb-sub">{title}</div>
          </div>
        </div>

        <button className="sb-tog" onClick={() => setCollapsed(c => !c)}
          style={{ background:'var(--s700)', border:'2px solid var(--s600)', position:'absolute', top:22, right:-13, width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:10, transition:'all .2s' }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,.7)" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition:'transform .25s' }}>
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <nav style={{ flex:1, paddingTop:8 }}>
          {navSections.map((section, si) => (
            <div key={si}>
              {section.label && <div className="sb-sec">{section.label}</div>}
              {section.items.map((item) => (
                <div key={item.id || item.path}
                  className={`nav-item${isActive(item) ? ' active' : ''}`}
                  onClick={() => item.onClick ? item.onClick() : nav(item.path)}>
                  <div className="nav-icon">{item.icon}</div>
                  <span className="sb-lbl">{item.label}</span>
                  {item.badge && <span className="sb-badge" style={item.badgeColor ? {background:item.badgeColor} : {}}>{item.badge}</span>}
                  {item.live && <div className="sb-live-dot" />}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sb-user">
          <div className="sb-av">{initials}</div>
          <div className="sb-uinfo">
            <div className="sb-uname">{user?.firstName} {user?.lastName}</div>
            <div className="sb-urole">{user?.role}</div>
          </div>
        </div>
        <div className="sb-back" onClick={() => nav('/')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          <span className="sb-lbl">Back to Website</span>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="tb-title">{title}</div>
          <div className="tb-right">
            <div className="tb-chip">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <Clock />
            </div>
            <div className="tb-chip live">
              <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--g500)', animation:'pulse 2s infinite' }} />
              All Systems Live
            </div>
            <div ref={notifRef} style={{ position:'relative' }}>
              <button className="ibt" onClick={() => setNotifOpen(o => !o)}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div className="ndot" />
              </button>
              {notifOpen && (
                <div className="notif-panel">
                  <div style={{ padding:'13px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:700, fontSize:14 }}>Notifications</span>
                    <button className="btn btn-g btn-sm" onClick={() => { toast.ok('All marked read'); setNotifOpen(false) }}>Mark all read</button>
                  </div>
                  {[{dot:'var(--r500)',t:'Disk usage at 78%',s:'Archive recordings to free space · now'},{dot:'var(--r500)',t:'5 pending approvals',s:'New student registrations'},{dot:'var(--s300)',t:'Feb revenue report ready',s:'KES 3.48M · 2 hours ago',dim:true}].map((n,i) => (
                    <div key={i} style={{ padding:'13px 18px', borderBottom:'1px solid var(--border)', display:'flex', gap:10, opacity:n.dim?.5:1 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:n.dot, marginTop:5, flexShrink:0 }} />
                      <div><div style={{ fontWeight:700, fontSize:13.5, marginBottom:2 }}>{n.t}</div><div style={{ fontSize:12, color:'var(--s500)' }}>{n.s}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="tb-chip" onClick={handleLogout}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>
        <div className="content" style={{ animation:'fadeIn .25s ease' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
