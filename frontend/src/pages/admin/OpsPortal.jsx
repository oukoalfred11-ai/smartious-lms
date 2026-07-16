import { useState, useEffect } from 'react'
import AdminDashboard from './pages/Dashboard.jsx'
import { api } from '../../context/ctx.jsx'

const SMARTIOUS_THEME = `
  .sm-admin-theme {
    --crimson: #7D1025; --crimson-deep: #5A0B1B; --crimson-light: #A51C2E;
    --gold: #C9A030; --gold-light: #F0CC5A; --gold-pale: #FBF6E3;
    --cream: #FBFAF5; --b50: #FDF2F4; --b100: #FCE4E8; --b200: #F8C5CD;
    --b300: #F19BAA; --b400: #E26B81; --b500: #C8334D; --b600: #A11A35;
    --b700: #7D1025; --b800: #5E0B1B; --bg: #FBFAF5;
  }
  .sm-admin-theme .serif { font-family:'Instrument Serif','DM Serif Display',Georgia,serif!important; font-weight:400!important; letter-spacing:-0.01em; }
  .sm-admin-theme .sec-tag { color:var(--crimson)!important; font-weight:700; letter-spacing:.12em; text-transform:uppercase; font-size:11px; margin-bottom:6px; }
  .sm-admin-theme .btn-p { background:var(--crimson)!important; color:var(--cream)!important; border-color:var(--crimson)!important; font-weight:700; }
  .sm-admin-theme .btn-p:hover { background:var(--crimson-deep)!important; border-color:var(--crimson-deep)!important; }
  .sm-admin-theme .card { transition:box-shadow .18s,border-color .18s; background:#fff; }
  .sm-admin-theme .card:hover { box-shadow:0 8px 24px rgba(125,16,37,.06); }
  .sm-admin-theme .kpi { transition:all .18s; background:#fff; }
  .sm-admin-theme .kpi:hover { border-color:var(--crimson)!important; transform:translateY(-2px); box-shadow:0 12px 28px rgba(125,16,37,.08); }
  .sm-admin-theme .nav-item-active { color:var(--crimson)!important; background:var(--b50)!important; border-left-color:var(--crimson)!important; }
  .sm-admin-theme .tbl thead { background:var(--cream)!important; }
  .sm-admin-theme .tbl thead th { color:var(--crimson)!important; font-weight:700!important; letter-spacing:.06em; text-transform:uppercase; font-size:11px!important; }
  .sm-admin-theme { background:var(--cream); min-height:100vh; }
`

export default function OpsPortal() {
  const [page, setPage]                             = useState('dashboard')
  const [userStats, setUserStats]                   = useState(0)
  const [pendingAllocations, setPendingAllocations] = useState(0)
  const [refreshKey, setRefreshKey]                 = useState(0)

  useEffect(() => {
    api.get('/users/stats').then(r => setUserStats(r.data?.totalUsers || 0)).catch(() => {})
  }, [refreshKey])

  useEffect(() => {
    const fetch = () => api.get('/allocations/pending-count')
      .then(r => setPendingAllocations(r.data?.pendingCount || 0)).catch(() => {})
    fetch()
    const id = setInterval(fetch, 5000)
    return () => clearInterval(id)
  }, [page, refreshKey])

  return (
    <>
      <style>{SMARTIOUS_THEME}</style>
      <div className="sm-admin-theme">
        <AdminDashboard
          page={page}
          setPage={setPage}
          userStats={userStats}
          pendingAllocations={pendingAllocations}
          refreshKey={refreshKey}
          onUserSaved={() => setRefreshKey(k => k+1)}
          forcedRole="ops_manager"
        />
      </div>
    </>
  )
}
