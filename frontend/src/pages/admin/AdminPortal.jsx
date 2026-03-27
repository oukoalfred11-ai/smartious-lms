import { useState } from 'react'
import PortalLayout from '../../components/layout/PortalLayout.jsx'
import AdminDashboard from './pages/Dashboard.jsx'

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
  website:'Website Editor', settings:'System Settings', ai:'AI Console',
}

export default function AdminPortal() {
  const [page, setPage] = useState('dashboard')

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
      mk('users','All Users','<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',{badge:'5'}),
      mk('teachers','Teachers','<path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/>'),
      mk('allocations','Allocations','<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',{badge:'3',badgeColor:'var(--b700)'}),
      mk('payroll','Payroll','<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/><line x1="14" y1="15" x2="18" y2="15"/>'),
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
    <PortalLayout title={PAGE_TITLES[page] || 'Admin Panel'} navSections={navSections}>
      <AdminDashboard page={page} onNav={setPage} />
    </PortalLayout>
  )
}
