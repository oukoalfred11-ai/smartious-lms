import { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout.jsx'
import AdminDashboard from './pages/Dashboard.jsx'
import { api } from '../../context/ctx.jsx'

const I = (d) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html: d}} />
)

const PAGE_TITLES = {
  dashboard:'Dashboard', analytics:'Analytics & Reports',
  users:'User Management', teachers:'Teacher Management',
  allocations:'Student Allocations', payroll:'Payroll Management',
  programmes:'IUFP & Study Abroad', livelessons:'Live Lessons', grouprooms:'Group Class Rooms',
  curriculum:'Curriculum Manager', billing:'Billing & Payments',
  website:'Website Editor', settings:'System Settings', ai:'AI Console', leave:'Leave Management',
}

// ─── SMARTIOUS BRAND THEME OVERRIDE ──────────────────────
// Crimson #7D1025 + Gold #C9A030 + Cream #FBFAF5
// Scoped to admin portal only via .sm-admin-theme wrapper.
// Other portals (teacher/student/parent) retain existing tokens.
const SMARTIOUS_THEME = `
  .sm-admin-theme {
    --crimson: #7D1025;
    --crimson-deep: #5A0B1B;
    --crimson-light: #A51C2E;
    --gold: #C9A030;
    --gold-light: #F0CC5A;
    --gold-pale: #FBF6E3;
    --cream: #FBFAF5;

    --b50:  #FDF2F4;
    --b100: #FCE4E8;
    --b200: #F8C5CD;
    --b300: #F19BAA;
    --b400: #E26B81;
    --b500: #C8334D;
    --b600: #A11A35;
    --b700: #7D1025;
    --b800: #5E0B1B;

    --bg: #FBFAF5;
  }

  .sm-admin-theme .serif {
    font-family: 'Instrument Serif', 'DM Serif Display', Georgia, serif !important;
    font-weight: 400 !important;
    letter-spacing: -0.01em;
  }

  .sm-admin-theme .sec-tag {
    color: var(--crimson) !important;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 11px;
    margin-bottom: 6px;
  }

  .sm-admin-theme .btn-p {
    background: var(--crimson) !important;
    color: var(--cream) !important;
    border-color: var(--crimson) !important;
    box-shadow: 0 2px 8px rgba(125, 16, 37, 0.18);
    font-weight: 700;
  }
  .sm-admin-theme .btn-p:hover {
    background: var(--crimson-deep) !important;
    border-color: var(--crimson-deep) !important;
    box-shadow: 0 4px 14px rgba(125, 16, 37, 0.28);
  }

  .sm-admin-theme .btn-ok {
    box-shadow: 0 2px 8px rgba(22, 101, 52, 0.15);
  }

  .sm-admin-theme .card {
    transition: box-shadow 0.18s, border-color 0.18s;
    background: #FFFFFF;
  }
  .sm-admin-theme .card:hover {
    box-shadow: 0 8px 24px rgba(125, 16, 37, 0.06);
  }

  .sm-admin-theme .kpi {
    transition: all 0.18s;
    background: #FFFFFF;
  }
  .sm-admin-theme .kpi:hover {
    border-color: var(--crimson) !important;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(125, 16, 37, 0.08);
  }

  .sm-admin-theme .nav-item-active,
  .sm-admin-theme [class*="nav"][class*="active"] {
    color: var(--crimson) !important;
    background: var(--b50) !important;
    border-left-color: var(--crimson) !important;
  }

  .sm-admin-theme .badge {
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .sm-admin-theme .prog-f {
    transition: width 0.4s ease;
  }

  .sm-admin-theme .fi:focus,
  .sm-admin-theme .fsel:focus,
  .sm-admin-theme .fta:focus {
    border-color: var(--crimson) !important;
    box-shadow: 0 0 0 3px rgba(125, 16, 37, 0.08) !important;
    outline: none !important;
  }

  .sm-admin-theme .tbl thead {
    background: var(--cream) !important;
  }
  .sm-admin-theme .tbl thead th {
    color: var(--crimson) !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 11px !important;
  }

  .sm-admin-theme h1, .sm-admin-theme h2, .sm-admin-theme .page-title {
    color: #1A0508;
  }

  @keyframes sm-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.5; transform: scale(0.85); }
  }
  .sm-admin-theme [class*="live-dot"] {
    background: var(--crimson) !important;
    animation: sm-pulse 1.6s infinite;
  }

  .sm-admin-theme {
    background: var(--cream);
    min-height: 100vh;
  }
`

export default function AdminPortal() {
  const [page, setPage] = useState('dashboard')
  const [userStats, setUserStats] = useState(0)
  const [pendingAllocations, setPendingAllocations] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch total user count for sidebar badge
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await api.get('/users/stats')
        setUserStats(res.data.totalUsers || 0)
      } catch (e) {
        console.error('Failed to load user stats:', e.message)
      }
    }
    fetchUserStats()
  }, [refreshKey])

  // Fetch pending allocations count
  useEffect(() => {
    const fetchPendingAllocations = async () => {
      try {
        const res = await api.get('/allocations/pending-count')
        setPendingAllocations(res.data.pendingCount || 0)
      } catch (e) {
        console.error('Failed to load pending allocations:', e.message)
      }
    }
    fetchPendingAllocations()

    const interval = setInterval(fetchPendingAllocations, 5000)
    return () => clearInterval(interval)
  }, [page, refreshKey])

  const handleUserSaved = () => {
    setRefreshKey(prev => prev + 1)
  }

  const mk = (id, label, svg, opts = {}) => ({
    id, label, path:'/admin', active: page === id,
    onClick: () => setPage(id), icon: I(svg), ...opts,
  })

  const navSections = [
    { label:'Overview', items:[
      mk('dashboard','Dashboard','<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'),
      mk('analytics','Analytics','<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),
    ]},
    { label:'Users', items:[
      mk('users','All Users','<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',{badge:String(userStats)}),
      mk('teachers','Teachers','<path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/>'),
      mk('allocations','Allocations','<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',{badge: pendingAllocations > 0 ? String(pendingAllocations) : '', badgeColor: pendingAllocations > 0 ? 'var(--r700)' : 'var(--crimson)'}),
      mk('payroll','Payroll','<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/><line x1="14" y1="15" x2="18" y2="15"/>'),
      mk('leave','Leave Requests','<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',{badgeCol:'var(--a600)'}),
      mk('programmes','IUFP & Study Abroad','<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'),
      mk('livelessons','Live Lessons','<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',{live:true}),
      mk('grouprooms','Group Rooms','<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
    ]},
    { label:'Content', items:[
      mk('curriculum','Curriculum','<path d="M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13"/><path d="M4 19a2 2 0 0 0 2 2h14"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/>'),
      mk('billing','Billing','<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>'),
    ]},
    { label:'System', items:[
      mk('website','Website Editor','<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
      mk('settings','System Settings','<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><circle cx="12" cy="12" r="7"/>',{badge:'2'}),
      mk('ai','AI Console','<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>'),
    ]},
  ]

  return (
    <>
      <style>{SMARTIOUS_THEME}</style>
      <div className="sm-admin-theme">
        <PortalLayout title={PAGE_TITLES[page] || 'Admin Panel'} navSections={navSections}>
          <AdminDashboard page={page} onNav={setPage} onUserSaved={handleUserSaved} userStats={userStats} />
        </PortalLayout>
      </div>
    </>
  )
}
