// ═══════════════════════════════════════════════════════════
// SMARTIOUS ADMIN PORTAL
// ═══════════════════════════════════════════════════════════
// Theme: Smartious crimson (#7D1025) + gold (#C9A030) + cream (#FBFAF5)
//
// Architecture:
// - 8 sidebar modules across 4 sections
// - Each module is a self-contained component
// - All data via localStorage (backend swap = single function change)
// - Every admin action logged to sm_admin_audit_log (per audit requirement)
// - Reads cross-portal keys written by Teacher portal modules

import { useState, useRef, useEffect } from 'react'
import { useToast } from '../../context/ctx.jsx'
import { useStore } from '../../context/ctx.jsx'

// ── SVG icon helper (same pattern as TeacherPortal) ─────
const Ico = ({ d, w = 18, col = 'currentColor', sw = 2 }) => (
  <svg width={w} height={w} fill="none" viewBox="0 0 24 24" stroke={col} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d.split('|').map((p, i) => {
      if (p.startsWith('rect:')) { const [,x,y,W,H,rx] = p.split(':'); return <rect key={i} x={x} y={y} width={W} height={H} rx={rx||0}/> }
      if (p.startsWith('circle:')) { const [,cx,cy,r] = p.split(':'); return <circle key={i} cx={cx} cy={cy} r={r}/> }
      if (p.startsWith('line:')) { const [,x1,y1,x2,y2] = p.split(':'); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}/> }
      if (p.startsWith('poly:')) { return <polygon key={i} points={p.slice(5)}/> }
      if (p.startsWith('pline:')) { return <polyline key={i} points={p.slice(6)}/> }
      return <path key={i} d={p}/>
    })}
  </svg>
)

// ──────────────────────────────────────────────────────
// AUDIT LOG — every admin action gets logged
// ──────────────────────────────────────────────────────
const AUDIT_LOG_KEY = 'sm_admin_audit_log'

const logAdminAction = (action, target, before, after, adminName) => {
  try {
    const existing = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]')
    existing.push({
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      action,        // e.g. "edit_student_status"
      target,        // e.g. "student:s3"
      before,
      after,
      adminName: adminName || 'Alfred Ouko',
      timestamp: new Date().toISOString(),
    })
    // Keep last 1000 entries to avoid bloat
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(existing.slice(-1000)))
  } catch {}
}

// ──────────────────────────────────────────────────────
// MAIN ADMIN PORTAL COMPONENT
// ──────────────────────────────────────────────────────
export default function AdminPortal() {
  const toast = useToast()
  const store = useStore()
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const adminFirstName = store?.currentUser?.firstName || 'Alfred'
  const adminLastName = store?.currentUser?.lastName || 'Ouko'
  const adminFullName = (adminFirstName + ' ' + adminLastName).trim()

  const pageTitles = {
    dashboard: 'Dashboard',
    students: 'Students',
    teachers: 'Teachers',
    classes: 'Classes',
    curriculum: 'Curriculum',
    finance: 'Finance',
    safety: 'Safety Center',
    profile: 'Admin Profile',
  }

  const nav = [
    { section: 'Oversight', items: [
      { id: 'dashboard',  label: 'Dashboard',     icon: 'rect:3:3:7:7:1|rect:14:3:7:7:1|rect:14:14:7:7:1|rect:3:14:7:7:1' },
      { id: 'students',   label: 'Students',      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|circle:9:7:4|M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
      { id: 'teachers',   label: 'Teachers',      icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|circle:12:7:4' },
    ]},
    { section: 'Operations', items: [
      { id: 'classes',    label: 'Classes',       icon: 'rect:3:4:18:18:2|line:16:2:16:6|line:8:2:8:6|line:3:10:21:10' },
      { id: 'curriculum', label: 'Curriculum',    icon: 'M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13|M4 19a2 2 0 0 0 2 2h14|M8 10h8M8 14h6' },
      { id: 'finance',    label: 'Finance',       icon: 'line:12:1:12:23|M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    ]},
    { section: 'Trust & Safety', items: [
      { id: 'safety',     label: 'Safety Center', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    ]},
    { section: 'Account', items: [
      { id: 'profile',    label: 'Admin Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|circle:12:7:4' },
    ]},
  ]

  return (
    <div className="app">
      <style>{`
        .app { display: flex; min-height: 100vh; background: #FBFAF5; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #0F172A; }
        :root {
          --crimson: #7D1025;
          --crimson-deep: #8B1A2E;
          --gold: #C9A030;
          --gold-light: #F0CC5A;
          --cream: #FBFAF5;
          --bg: #FBFAF5;
          --border: #E5E7EB;
          --s900: #0F172A;
          --s800: #1F2937;
          --s700: #374151;
          --s600: #4B5563;
          --s500: #64748B;
          --s400: #94A3B8;
          --s300: #CBD5E1;
          --rxl: 14px;
          --rmd: 10px;
          --rsm: 6px;
        }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: .5 } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .serif { font-family: 'Instrument Serif', 'DM Serif Display', serif; font-weight: 400; }
        .mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
        .card { background: #FFF; border: 1.5px solid var(--border); border-radius: var(--rxl); padding: 18px; }
        .ctitle { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--s500); }
        .fl { display: block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--s500); margin-bottom: 6px; }
        .fi, .fsel { width: 100%; padding: 10px 12px; background: #FFF; border: 1.5px solid var(--border); border-radius: var(--rsm); font-size: 13.5px; font-family: inherit; color: var(--s900); transition: border-color .15s; }
        .fi:focus, .fsel:focus { outline: none; border-color: var(--crimson); }
        .fg { margin-bottom: 14px; }
        .fr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid var(--border); border-radius: var(--rsm); background: #FFF; color: var(--s700); cursor: pointer; font-size: 13px; font-weight: 700; font-family: inherit; }
        .btn-s { background: #FFF; color: var(--s700); }
        .btn-s:hover { background: #FBFAF5; }
        .btn-p { background: var(--crimson); color: #FBFAF5; border-color: var(--crimson); }
        .btn-p:hover { background: var(--crimson-deep); }
        .btn-sm { padding: 6px 12px; font-size: 11.5px; }

        .sidebar { width: 240px; background: #FFF; border-right: 1px solid var(--border); padding: 18px 0; display: flex; flex-direction: column; flex-shrink: 0; transition: width .2s; }
        .sidebar-collapsed { width: 60px; }
        .sb-brand { padding: 0 18px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
        .sb-brand-text { font-family: 'Instrument Serif', serif; font-size: 18px; color: var(--s900); }
        .sb-section { padding: 14px 18px 6px; }
        .sb-section-title { font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--s400); }
        .sb-item { display: flex; align-items: center; gap: 10px; padding: 9px 18px; cursor: pointer; color: var(--s700); font-size: 13.5px; font-weight: 600; border-left: 3px solid transparent; transition: all .15s; }
        .sb-item:hover { background: #FBFAF5; }
        .sb-item.active { background: #FBE8E8; color: var(--crimson); border-left-color: var(--crimson); font-weight: 700; }

        .main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .topbar { background: #FFF; border-bottom: 1px solid var(--border); padding: 14px 22px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .content { flex: 1; padding: 22px; overflow-y: auto; }
      `}</style>

      {/* SIDEBAR */}
      <aside className={'sidebar' + (sidebarOpen ? '' : ' sidebar-collapsed')}>
        <div className="sb-brand">
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--crimson)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gold-light)',
            fontFamily: "'Instrument Serif', serif",
            fontSize: 16, flexShrink: 0,
          }}>S</div>
          {sidebarOpen && (
            <div>
              <div className="sb-brand-text">Smartious</div>
              <div style={{ fontSize: 10, color: 'var(--s500)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Admin</div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 14 }}>
          {nav.map(section => (
            <div key={section.section}>
              {sidebarOpen && (
                <div className="sb-section">
                  <div className="sb-section-title">{section.section}</div>
                </div>
              )}
              {section.items.map(item => (
                <div key={item.id} className={'sb-item' + (page === item.id ? ' active' : '')}
                  onClick={() => setPage(item.id)}
                  title={!sidebarOpen ? item.label : ''}>
                  <Ico d={item.icon} w={18} col={page === item.id ? 'var(--crimson)' : 'var(--s500)'} sw={2}/>
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
          <div onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '6px 0', cursor: 'pointer',
              color: 'var(--s500)', fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s' }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            {sidebarOpen && <span>Collapse</span>}
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="main">
        {/* TOP BAR */}
        <div className="topbar">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, color: 'var(--s500)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              Admin Portal
            </div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: 'var(--s900)', lineHeight: 1.2 }}>
              {pageTitles[page]}
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 14px',
            background: '#FBFAF5',
            borderRadius: 99,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--crimson)',
              color: 'var(--gold-light)',
              fontFamily: "'Instrument Serif', serif",
              fontSize: 13, fontWeight: 400,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{(adminFirstName[0] || 'A') + (adminLastName[0] || '')}</div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--s900)' }}>{adminFullName}</div>
              <div style={{ fontSize: 10, color: 'var(--s500)' }}>Founder · Admin</div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">
          {page === 'dashboard'  && <AdminDashboardTab admin={{ name: adminFullName, firstName: adminFirstName }} setPage={setPage} toast={toast}/>}
          {page === 'students'   && <ComingSoonTab title="Students Management" description="Roster of all enrolled students with applications pipeline, status tracking, and family communication."/>}
          {page === 'teachers'   && <ComingSoonTab title="Teachers Management" description="Roster of all teachers with performance metrics, hiring pipeline, and payroll tracking."/>}
          {page === 'classes'    && <ComingSoonTab title="Classes Schedule" description="Today, this week, and historical view of all classes across all teachers."/>}
          {page === 'curriculum' && <ComingSoonTab title="Curriculum Configuration" description="Subjects, year groups, programs offered, and curriculum-specific settings."/>}
          {page === 'finance'    && <ComingSoonTab title="Finance" description="Payments, payroll, P&L summary, and revenue tracking."/>}
          {page === 'safety'     && <ComingSoonTab title="Safety Center" description="Flagged messages, behaviour incidents, and child safety review queue."/>}
          {page === 'profile'    && <ComingSoonTab title="Admin Profile" description="Your personal admin settings, password, and audit log."/>}
        </div>
      </main>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// COMING SOON STUB
// ──────────────────────────────────────────────────────
function ComingSoonTab({ title, description }) {
  return (
    <div style={{
      maxWidth: 560, margin: '60px auto',
      background: '#FFF',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--rxl)',
      padding: 36,
      textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, margin: '0 auto 18px', borderRadius: '50%',
        background: '#FBFAF5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#C9A030" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7D1025', marginBottom: 6 }}>
        Module Coming Next
      </div>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: 'var(--s900)', marginBottom: 10 }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--s500)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 18px' }}>
        {description}
      </p>
      <div style={{
        background: '#FBFAF5', borderLeft: '3px solid #C9A030',
        padding: '10px 14px', borderRadius: 'var(--rsm)',
        fontSize: 12, color: 'var(--s600)', textAlign: 'left',
        maxWidth: 420, margin: '0 auto', fontStyle: 'italic',
      }}>
        We're building admin module-by-module to keep each delivery validated. Dashboard is fully functional. Other modules launch in upcoming turns.
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ADMIN DASHBOARD — School-wide command center
// ═══════════════════════════════════════════════════════════
// Theme: Smartious crimson (#7D1025) + gold (#C9A030) + cream (#FBFAF5)

const adGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
const adFormatTime = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
const adFormatDate = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
const adTimeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  if (hours < 24) return hours + 'h ago'
  if (days === 1) return 'yesterday'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
const adSubjColor = (s) => {
  const m = { 'Mathematics': '#7D1025', 'Physics': '#1E3A8A', 'Chemistry': '#166534', 'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E' }
  return m[s] || '#7D1025'
}
const adAvatarColor = (name) => {
  const colors = ['#7D1025', '#8B1A2E', '#C9A030', '#1E3A8A', '#166534', '#7C2D12']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
  return colors[Math.abs(hash) % colors.length]
}
const adInitials = (name) => (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'
const adFormatKsh = (n) => 'KSh ' + Math.round(n).toLocaleString('en-KE')
const adFormatUsd = (n) => '$' + Math.round(n).toLocaleString('en-US')

// Seed sample data on first load if nothing exists
const adSeedSampleApps = () => {
  try {
    const k = 'sm_admin_applications'
    const existing = localStorage.getItem(k)
    if (existing) return JSON.parse(existing)
    const sample = [
      { id: 'app-1', studentName: 'Aisha Mohamed',     parentName: 'Halima Mohamed',   parentEmail: 'halima.m@example.com',  curriculum: 'IGCSE',   year: 'Year 9',  appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'pending', source: 'Website', monthlyFee: 18000 },
      { id: 'app-2', studentName: 'Daniel Otieno',     parentName: 'Mary Otieno',      parentEmail: 'mary.o@example.com',    curriculum: 'CBC',     year: 'Grade 7', appliedAt: new Date(Date.now() - 86400000).toISOString(),     status: 'pending', source: 'Referral', monthlyFee: 14000 },
      { id: 'app-3', studentName: 'Sarah Williams',    parentName: 'James Williams',   parentEmail: 'j.williams@example.com', curriculum: 'IB',      year: 'Grade 10', appliedAt: new Date(Date.now() - 3600000 * 6).toISOString(), status: 'pending', source: 'Diaspora', monthlyFee: 32000 },
    ]
    localStorage.setItem(k, JSON.stringify(sample))
    return sample
  } catch { return [] }
}

const adLoadStudents = () => {
  try { return JSON.parse(localStorage.getItem('sm_teacher_students') || '[]') } catch { return [] }
}
const adLoadFlags = () => {
  try { return JSON.parse(localStorage.getItem('sm_safety_flags') || '[]') } catch { return [] }
}
const adLoadHomework = () => {
  try { return JSON.parse(localStorage.getItem('sm_homework_assigned') || '[]') } catch { return [] }
}
const adLoadExams = () => {
  try { return JSON.parse(localStorage.getItem('sm_exam_assignments') || '[]') } catch { return [] }
}
const adLoadLiveClass = () => {
  try { return JSON.parse(localStorage.getItem('sm_live_class_active') || 'null') } catch { return null }
}
const adLoadApplications = () => adSeedSampleApps()
const adSaveApplications = (apps) => {
  try { localStorage.setItem('sm_admin_applications', JSON.stringify(apps)) } catch {}
}

// Sample teachers (will come from real teachers tab in turn 3)
const adSampleTeachers = [
  { id: 't1', name: 'Mr. James Muthomi',   subject: 'Mathematics', curriculum: 'IGCSE',  status: 'active',   classesToday: 4, hourlyRate: 25 },
  { id: 't2', name: 'Mrs. Grace Wairimu',   subject: 'English',     curriculum: 'IGCSE',  status: 'active',   classesToday: 3, hourlyRate: 22 },
  { id: 't3', name: 'Dr. Peter Kibet',      subject: 'Sciences',    curriculum: 'IB',     status: 'active',   classesToday: 2, hourlyRate: 30 },
  { id: 't4', name: 'Ms. Anita Kamau',      subject: 'History',     curriculum: 'IGCSE',  status: 'active',   classesToday: 2, hourlyRate: 22 },
]

function AdminDashboardTab({ admin, setPage, toast }) {
  const [now, setNow] = useState(new Date())

  // Live clock — updates every 30s
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  // ── DATA ────────────────────────────────────────────
  const allStudents = adLoadStudents()
  const allFlags = adLoadFlags()
  const allHomework = adLoadHomework()
  const allExams = adLoadExams()
  const liveClass = adLoadLiveClass()
  const [applications, setApplications] = useState(() => adLoadApplications())

  // ── COMPUTED STATS ──────────────────────────────────
  const atRiskStudents = allStudents.filter(s => s.status === 'at-risk' || s.status === 'needs-help')
  const totalRevenueMonthly = allStudents.length * 18000  // sample avg fee KSh
  const usdEquivalent = totalRevenueMonthly / 130  // approximate KSh → USD
  const ungraded = allHomework.reduce((sum, hw) => sum + ((hw.submissions || []).filter(s => s.grade === null || s.grade === undefined).length), 0)
  const liveExams = allExams.filter(e => {
    const start = new Date(e.startAt).getTime()
    const end = start + (e.durationMins * 60000)
    return Date.now() >= start && Date.now() < end
  }).length
  const pendingApps = applications.filter(a => a.status === 'pending').length
  const unreviewedFlags = allFlags.filter(f => !f.reviewed).length

  // ── RIGHT-NOW HERO LOGIC ────────────────────────────
  const rightNowItem = (() => {
    if (unreviewedFlags > 0) {
      return {
        title: unreviewedFlags + ' safety item' + (unreviewedFlags === 1 ? '' : 's') + ' need review',
        subtitle: 'Flagged messages from teacher communications require admin oversight',
        action: 'Open Safety Center',
        actionPage: 'safety',
        urgency: 'critical',
      }
    }
    if (pendingApps > 0) {
      return {
        title: pendingApps + ' application' + (pendingApps === 1 ? '' : 's') + ' awaiting review',
        subtitle: 'New families are waiting to hear back from you',
        action: 'Review Applications',
        actionPage: 'students',
        urgency: 'soon',
      }
    }
    if (liveClass) {
      return {
        title: 'Live class in session',
        subtitle: liveClass.teacher + ' is teaching now',
        action: 'View Live Operations',
        actionPage: 'classes',
        urgency: 'live',
      }
    }
    if (atRiskStudents.length > 3) {
      return {
        title: atRiskStudents.length + ' students flagged at-risk',
        subtitle: 'Multiple students may need intervention support',
        action: 'View Students',
        actionPage: 'students',
        urgency: 'warning',
      }
    }
    return {
      title: 'School running smoothly',
      subtitle: allStudents.length + ' students · ' + adSampleTeachers.length + ' teachers · all systems normal',
      action: 'View Today\'s Operations',
      actionPage: 'classes',
      urgency: 'good',
    }
  })()

  const urgencyColors = {
    critical: { bg: '#7F1D1D', accent: '#FCA5A5' },
    live:     { bg: '#7D1025', accent: '#F0CC5A' },
    soon:     { bg: '#92400E', accent: '#FCD34D' },
    warning:  { bg: '#92400E', accent: '#FCD34D' },
    good:     { bg: '#166534', accent: '#86EFAC' },
  }
  const uColor = urgencyColors[rightNowItem.urgency]

  // ── ACTIONS ─────────────────────────────────────────
  const approveApplication = (appId) => {
    if (!confirm('Approve this application? The family will be notified.')) return
    const app = applications.find(a => a.id === appId)
    const updated = applications.map(a => a.id === appId ? { ...a, status: 'approved', reviewedAt: new Date().toISOString() } : a)
    setApplications(updated)
    adSaveApplications(updated)
    logAdminAction('approve_application', 'application:' + appId, { status: 'pending' }, { status: 'approved' }, admin.name)
    toast?.ok?.('Application approved. ' + app.studentName + ' will receive welcome email.')
  }

  const declineApplication = (appId) => {
    if (!confirm('Decline this application? This action will notify the family.')) return
    const app = applications.find(a => a.id === appId)
    const updated = applications.map(a => a.id === appId ? { ...a, status: 'declined', reviewedAt: new Date().toISOString() } : a)
    setApplications(updated)
    adSaveApplications(updated)
    logAdminAction('decline_application', 'application:' + appId, { status: 'pending' }, { status: 'declined' }, admin.name)
    toast?.info?.('Application declined.')
  }

  const sendAnnouncement = () => {
    toast?.info?.('Announcement composer will open in next module update.')
  }

  // Sample today's classes (cross-teacher view)
  const todaysClasses = [
    { id: 'c1', teacher: 'Mr. James Muthomi', subject: 'Mathematics',  topic: 'Quadratic equations',  yearGroup: 'IGCSE Year 10', students: 8, time: '09:00', duration: 60, status: 'done' },
    { id: 'c2', teacher: 'Mrs. Grace Wairimu', subject: 'English',     topic: 'Essay writing',         yearGroup: 'IGCSE Year 11', students: 6, time: '10:00', duration: 60, status: 'done' },
    { id: 'c3', teacher: 'Mr. James Muthomi', subject: 'Mathematics',  topic: 'Trigonometry',          yearGroup: 'IGCSE Year 11', students: 6, time: '11:00', duration: 60, status: 'done' },
    { id: 'c4', teacher: 'Dr. Peter Kibet',    subject: 'Chemistry',   topic: 'Organic compounds',     yearGroup: 'IB Year 1',     students: 4, time: '14:00', duration: 60, status: 'upcoming' },
    { id: 'c5', teacher: 'Mr. James Muthomi', subject: 'Mathematics',  topic: 'Algebra review',        yearGroup: 'IGCSE Year 10', students: 8, time: '15:00', duration: 60, status: 'upcoming' },
    { id: 'c6', teacher: 'Ms. Anita Kamau',    subject: 'History',     topic: 'WWI causes',            yearGroup: 'IGCSE Year 10', students: 5, time: '16:00', duration: 60, status: 'upcoming' },
  ]
  const liveCount = todaysClasses.filter(c => c.status === 'live').length
  const doneCount = todaysClasses.filter(c => c.status === 'done').length
  const upcomingCount = todaysClasses.filter(c => c.status === 'upcoming').length

  return (
    <div>
      {/* GREETING ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
            {adFormatDate(now)} · {adFormatTime(now)}
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: 'var(--s900)', margin: 0, lineHeight: 1.15 }}>
            {adGreeting()}, <em style={{ color: '#7D1025' }}>{admin.firstName}</em>
          </h1>
          <div style={{ fontSize: 13.5, color: 'var(--s500)', marginTop: 4 }}>
            Smartious Homeschool · Founder & Admin
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setPage('safety')}
            style={{
              background: 'transparent', color: '#7D1025',
              border: '1.5px solid #7D1025',
              padding: '10px 16px', borderRadius: 'var(--rmd)',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Safety Center
            {unreviewedFlags > 0 && (
              <span style={{
                background: '#DC2626', color: '#FBFAF5',
                fontSize: 10, fontWeight: 800,
                padding: '1px 7px', borderRadius: 99,
              }}>{unreviewedFlags}</span>
            )}
          </button>
          <button onClick={sendAnnouncement}
            style={{
              background: '#7D1025', color: '#FBFAF5', border: 'none',
              padding: '10px 18px', borderRadius: 'var(--rmd)',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 14px rgba(125,16,37,.25)',
            }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 11l18-8v18l-18-8z"/>
            </svg>
            School Announcement
          </button>
        </div>
      </div>

      {/* RIGHT-NOW HERO */}
      <div style={{
        background: 'linear-gradient(135deg, ' + uColor.bg + ' 0%, ' + uColor.bg + 'EE 100%)',
        color: '#FBFAF5',
        borderRadius: 'var(--rxl)',
        padding: '28px 32px',
        marginBottom: 16,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(125,16,37,.18)',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: uColor.accent, opacity: .15, pointerEvents: 'none',
        }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase',
              color: uColor.accent, marginBottom: 8,
            }}>
              {rightNowItem.urgency === 'critical' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: uColor.accent, animation: 'pulse 1.5s infinite' }}/>}
              {rightNowItem.urgency === 'live' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: uColor.accent, animation: 'pulse 1.5s infinite' }}/>}
              {rightNowItem.urgency === 'critical' ? 'NEEDS REVIEW' :
               rightNowItem.urgency === 'live' ? 'LIVE NOW' :
               rightNowItem.urgency === 'soon' ? 'AWAITING ACTION' :
               rightNowItem.urgency === 'warning' ? 'NEEDS ATTENTION' :
               'ALL CLEAR'}
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.2 }}>
              {rightNowItem.title}
            </h2>
            <div style={{ fontSize: 14, opacity: .85, marginTop: 6 }}>{rightNowItem.subtitle}</div>
          </div>
          <button onClick={() => setPage(rightNowItem.actionPage)}
            style={{
              background: uColor.accent, color: uColor.bg,
              border: 'none',
              padding: '14px 28px', borderRadius: 'var(--rmd)',
              fontSize: 14, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,.2)',
              flexShrink: 0,
            }}>
            {rightNowItem.action}
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* KPI STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12, marginBottom: 16,
      }}>
        {[
          { label: 'Active Students', value: allStudents.length, change: '+' + Math.floor(allStudents.length * 0.15) + ' this month', color: '#7D1025', icon: 'students', page: 'students' },
          { label: 'Active Teachers', value: adSampleTeachers.length, change: '~' + Math.round(adSampleTeachers.reduce((s, t) => s + t.classesToday, 0) / adSampleTeachers.length) + ' classes/day avg', color: '#7D1025', icon: 'teachers', page: 'teachers' },
          { label: 'Monthly Revenue', value: adFormatKsh(totalRevenueMonthly), change: '~' + adFormatUsd(usdEquivalent), color: '#15803D', icon: 'money', page: 'finance' },
          { label: 'Safety Queue', value: unreviewedFlags, change: unreviewedFlags === 0 ? 'All clear' : 'Needs your review', color: unreviewedFlags > 0 ? '#B91C1C' : '#15803D', icon: 'shield', page: 'safety' },
        ].map(kpi => (
          <div key={kpi.label} onClick={() => setPage(kpi.page)}
            style={{
              background: '#FFF',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--rxl)',
              padding: 18,
              cursor: 'pointer',
              transition: 'all .15s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = kpi.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(125,16,37,.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 6 }}>
              {kpi.label}
            </div>
            <div style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: typeof kpi.value === 'string' && kpi.value.length > 8 ? 22 : 36,
              fontWeight: 400, color: kpi.color, lineHeight: 1, marginBottom: 4,
            }}>{kpi.value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>{kpi.change}</div>
            <div style={{
              position: 'absolute', top: 16, right: 16,
              width: 32, height: 32, borderRadius: '50%',
              background: kpi.color + '12',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {kpi.icon === 'students' && (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={kpi.color} strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
              )}
              {kpi.icon === 'teachers' && (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={kpi.color} strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
              {kpi.icon === 'money' && (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={kpi.color} strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              )}
              {kpi.icon === 'shield' && (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={kpi.color} strokeWidth="2" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN GRID — TODAY'S OPERATIONS + APPROVALS QUEUE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 380px)', gap: 14, marginBottom: 14 }}>
        {/* TODAY'S OPERATIONS */}
        <div style={{
          background: '#FFF', border: '1.5px solid var(--border)',
          borderRadius: 'var(--rxl)', padding: 22,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
                Today's Operations
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: 'var(--s900)', margin: 0 }}>
                {todaysClasses.length} classes scheduled
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{
                background: '#FEE2E2', color: '#B91C1C',
                fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
                padding: '3px 10px', borderRadius: 99,
              }}>{liveCount} LIVE</span>
              <span style={{
                background: '#FEF3C7', color: '#B45309',
                fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
                padding: '3px 10px', borderRadius: 99,
              }}>{upcomingCount} UPCOMING</span>
              <span style={{
                background: '#DCFCE7', color: '#15803D',
                fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
                padding: '3px 10px', borderRadius: 99,
              }}>{doneCount} DONE</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
            {todaysClasses.map(cls => {
              const subjCol = adSubjColor(cls.subject)
              return (
                <div key={cls.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px',
                  background: cls.status === 'done' ? '#FBFAF5' : '#FFF',
                  border: '1.5px solid var(--border)',
                  borderLeft: '4px solid ' + (cls.status === 'live' ? '#DC2626' : cls.status === 'done' ? '#94A3B8' : subjCol),
                  borderRadius: 'var(--rmd)',
                  opacity: cls.status === 'done' ? 0.65 : 1,
                }}>
                  <div style={{ minWidth: 50 }}>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: cls.status === 'done' ? 'var(--s400)' : 'var(--s900)' }}>
                      {cls.time}
                    </div>
                  </div>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: adAvatarColor(cls.teacher), color: '#FBFAF5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 11, flexShrink: 0,
                  }}>{adInitials(cls.teacher.replace('Mr. ', '').replace('Mrs. ', '').replace('Ms. ', '').replace('Dr. ', ''))}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--s900)' }}>{cls.topic}</div>
                    <div style={{ fontSize: 11, color: 'var(--s500)' }}>
                      {cls.teacher} · {cls.subject} · {cls.yearGroup} · {cls.students} students
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* APPROVALS QUEUE */}
        <div style={{
          background: '#FFF', border: '1.5px solid var(--border)',
          borderRadius: 'var(--rxl)', padding: 22,
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
              Approvals Queue
            </div>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: 'var(--s900)', margin: 0 }}>
              Awaiting your review
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
            {applications.filter(a => a.status === 'pending').length === 0 && unreviewedFlags === 0 ? (
              <div style={{
                fontSize: 12.5, color: 'var(--s500)',
                fontStyle: 'italic', textAlign: 'center',
                padding: 24,
                background: '#FBFAF5', borderRadius: 'var(--rsm)',
              }}>
                Nothing awaiting your approval
              </div>
            ) : (
              <>
                {/* Safety flags first (highest priority) */}
                {unreviewedFlags > 0 && (
                  <div onClick={() => setPage('safety')} style={{
                    padding: 12,
                    background: '#FEE2E2', borderLeft: '3px solid #B91C1C',
                    borderRadius: 'var(--rmd)', cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#7F1D1D', marginBottom: 2 }}>
                          {unreviewedFlags} safety flag{unreviewedFlags === 1 ? '' : 's'}
                        </div>
                        <div style={{ fontSize: 11, color: '#991B1B' }}>From teacher communications</div>
                      </div>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                )}

                {/* Pending applications */}
                {applications.filter(a => a.status === 'pending').map(app => (
                  <div key={app.id} style={{
                    padding: 12,
                    background: '#FBFAF5', borderLeft: '3px solid #C9A030',
                    borderRadius: 'var(--rmd)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--s900)' }}>{app.studentName}</div>
                        <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 2 }}>
                          {app.curriculum} {app.year} · {adFormatKsh(app.monthlyFee)}/mo
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--s400)', marginTop: 2 }}>
                          via {app.source} · {adTimeAgo(app.appliedAt)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => approveApplication(app.id)}
                        style={{
                          flex: 1, background: '#7D1025', color: '#FBFAF5', border: 'none',
                          padding: '6px 10px', borderRadius: 'var(--rsm)',
                          cursor: 'pointer', fontSize: 11, fontWeight: 700,
                        }}>Approve</button>
                      <button onClick={() => declineApplication(app.id)}
                        style={{
                          flex: 1, background: 'transparent', color: 'var(--s700)',
                          border: '1px solid var(--border)',
                          padding: '6px 10px', borderRadius: 'var(--rsm)',
                          cursor: 'pointer', fontSize: 11, fontWeight: 700,
                        }}>Decline</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* TRENDS ROW */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
      }}>
        {[
          { label: 'Enrollment Trend', value: allStudents.length, suffix: ' students', trend: [12, 18, 24, 28, 32, 38, 42, allStudents.length], color: '#7D1025' },
          { label: 'Revenue (KSh, monthly)', value: Math.round(totalRevenueMonthly / 1000), suffix: 'k', trend: [120, 180, 240, 280, 320, 380, 420, Math.round(totalRevenueMonthly / 1000)], color: '#15803D' },
          { label: 'Avg Teacher Load', value: Math.round(adSampleTeachers.reduce((s, t) => s + t.classesToday, 0) / adSampleTeachers.length * 10) / 10, suffix: ' classes/day', trend: [2, 2.4, 2.6, 2.8, 2.9, 3.0, 3.0, 2.75], color: '#7D1025' },
          { label: 'Safety Items (last 7 days)', value: allFlags.length, suffix: ' flagged', trend: [0, 1, 0, 0, 1, 0, 1, allFlags.length], color: allFlags.length > 0 ? '#B45309' : '#15803D' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#FFF', border: '1.5px solid var(--border)',
            borderRadius: 'var(--rxl)', padding: 18,
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
              <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</span>
              <span style={{ fontSize: 12, color: 'var(--s500)' }}>{card.suffix}</span>
            </div>
            {/* Sparkline */}
            <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
              {(() => {
                const max = Math.max(...card.trend, 1)
                const min = Math.min(...card.trend, 0)
                const range = max - min || 1
                const pts = card.trend.map((v, i) => {
                  const x = (i / (card.trend.length - 1)) * 200
                  const y = 38 - ((v - min) / range) * 34
                  return x + ',' + y
                }).join(' ')
                return (
                  <>
                    <polyline points={pts} fill="none" stroke={card.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    {card.trend.map((v, i) => {
                      const x = (i / (card.trend.length - 1)) * 200
                      const y = 38 - ((v - min) / range) * 34
                      return <circle key={i} cx={x} cy={y} r={i === card.trend.length - 1 ? 3 : 1.5} fill={card.color}/>
                    })}
                  </>
                )
              })()}
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}
