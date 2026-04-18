import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../../../context/ctx.jsx'
import { useNavigate } from 'react-router-dom'
import { useToast, api } from '../../../context/ctx.jsx'
import Modal from '../../../components/ui/Modal.jsx'
import CurriculumSubjectSelector from '../../../components/ui/CurriculumSubjectSelector.jsx'

// ─── static data matching admin.html ───────────────────────
const USERS = [
  {name:'Amara Osei',init:'AO',col:'#3B82F6',email:'amara.osei@student.smartious.ac.ke',id:'STU-0021',role:'Student',curr:'IGCSE',plan:'Premium',status:'Active',active:'2h ago'},
  {name:'Mr. James Muthomi',init:'JM',col:'#22C55E',email:'j.muthomi@smartious.ac.ke',id:'TCH-0008',role:'Teacher',curr:'N/A',plan:'Staff',status:'Active',active:'4h ago'},
  {name:'Janet Osei',init:'JO',col:'#8B5CF6',email:'janet.osei@gmail.com',id:'PAR-0014',role:'Parent',curr:'N/A',plan:'Basic',status:'Active',active:'1d ago'},
  {name:'Kofi Mensah',init:'KM',col:'#F59E0B',email:'kofi.mensah@student.smartious.ac.ke',id:'STU-0031',role:'Student',curr:'A-Level',plan:'IGCSE Pack',status:'Active',active:'30m ago'},
  {name:'Faith Wanjiru',init:'FW',col:'#EC4899',email:'faith.w@student.smartious.ac.ke',id:'STU-0019',role:'Student',curr:'IGCSE',plan:'Premium',status:'Active',active:'1h ago'},
]

const TEACHERS = [
  {name:'Mr. James Muthomi',init:'JM',col:'#3B82F6',subj:'Mathematics',stu:96,rat:4.9,cls:12,status:'Active'},
  {name:'Dr. Achieng Ouma', init:'AO',col:'#22C55E',subj:'Biology · Chemistry',stu:84,rat:4.8,cls:10,status:'Active'},
  {name:'Ms. Njeri Wambua', init:'NW',col:'#8B5CF6',subj:'English Language',stu:112,rat:4.7,cls:14,status:'Active'},
  {name:'Mr. Kariuki Njoroge',init:'KN',col:'#F59E0B',subj:'Physics',stu:72,rat:4.6,cls:9,status:'Active'},
  {name:'Mrs. Faith Muthoni',init:'FM',col:'#EC4899',subj:'History · Geography',stu:58,rat:4.9,cls:8,status:'On Leave'},
]

const CURRS = [
  {name:'IGCSE',org:'Cambridge / Pearson Edexcel',stu:894,subj:12,status:'Active'},
  {name:'British Curriculum',org:'UK National Curriculum',stu:612,subj:10,status:'Active'},
  {name:'IB Diploma',org:'International Baccalaureate',stu:387,subj:8,status:'Active'},
  {name:'CBC / KCSE',org:'KNEC Kenya',stu:341,subj:9,status:'Active'},
  {name:'American Curriculum',org:'College Board / SAT',stu:184,subj:8,status:'Active'},
  {name:'IB Primary Years',org:'IBO — PYP',stu:0,subj:6,status:'Draft'},
]

const TXNS = [
  {n:'Grace Mutua',p:'Premium',m:'M-Pesa',a:'1,499',d:'Mar 7, 2026',s:'Paid'},
  {n:'Brian Otieno',p:'IGCSE Pack',m:'Card',a:'3,999',d:'Mar 7, 2026',s:'Paid'},
  {n:'Lydia Achieng',p:'Assessment Fee',m:'M-Pesa',a:'2,000',d:'Mar 7, 2026',s:'Paid'},
  {n:'Samuel Omondi',p:'Basic',m:'M-Pesa',a:'499',d:'Mar 7, 2026',s:'Pending'},
  {n:'David Mwangi',p:'Basic',m:'Bank',a:'499',d:'Mar 6, 2026',s:'Overdue'},
]

const FEATS = [
  {n:'AI Tutor (Mshauri)',d:'Chatbot for all students',on:true},
  {n:'Live Classrooms',d:'Video sessions for teachers',on:true},
  {n:'Secure Exam Mode',d:'Tab-switch detection & proctoring',on:true},
  {n:'Gamification',d:'XP, badges, leaderboards',on:true},
  {n:'Parent Portal',d:'Parent access to student progress',on:true},
  {n:'M-Pesa Payments',d:'Accept M-Pesa STK push',on:true},
  {n:'New Registrations',d:'Allow new student enrolments',on:true},
  {n:'SMS Notifications',d:'Send SMS to students & parents',on:true},
  {n:'Beta Features',d:'Experimental features',on:false},
  {n:'Maintenance Mode',d:'Lock platform for non-admins',on:false},
]

const PENDING = [
  {n:'Grace Mutua',curr:'IGCSE',plan:'Premium',method:'M-Pesa',date:'Today 09:14'},
  {n:'Samuel Omondi',curr:'British',plan:'Basic',method:'Card',date:'Today 08:52'},
  {n:'Halima Abdi',curr:'IB',plan:'IGCSE Pack',method:'Bank',date:'Yesterday'},
  {n:'Moses Kipchoge',curr:'CBC',plan:'Basic',method:'M-Pesa',date:'Yesterday'},
  {n:'Charity Njeri',curr:'IGCSE',plan:'Premium',method:'PayPal',date:'Mar 5'},
]

const REV_DATA = [
  {k:'Sep',v:2.1},{k:'Oct',v:2.4},{k:'Nov',v:2.6},{k:'Dec',v:2.2},{k:'Jan',v:3.1},{k:'Feb',v:3.48,hi:true}
]
const GROWTH_DATA = [
  {k:'Sep',v:1980},{k:'Oct',v:2060},{k:'Nov',v:2140},{k:'Dec',v:2200},{k:'Jan',v:2370},{k:'Feb',v:2418,hi:true}
]

// ─── helpers ────────────────────────────────────────────
function Av({ init, col, size = 34 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: col + '20', color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono,monospace', fontSize: Math.round(size * .32), fontWeight: 700, flexShrink: 0 }}>
      {init}
    </div>
  )
}

function ProgRow({ label, val, pct, col }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: 'var(--s700)' }}>{label}</span>
        <span className="mono" style={{ color: 'var(--s600)' }}>{val}</span>
      </div>
      <div className="prog"><div className="prog-f" style={{ width: pct + '%', background: col }} /></div>
    </div>
  )
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.v))
  return (
    <div className="barchart">
      {data.map((d, i) => (
        <div key={i} className="bc">
          <div className="bv">{typeof d.v === 'number' && d.v < 100 ? d.v + 'M' : (d.v / 1000).toFixed(1) + 'k'}</div>
          <div className="bb" style={{ height: Math.round(d.v / max * 90 + 10) + '%', background: d.hi ? 'var(--b700)' : 'var(--b200)' }} />
          <div className="bl">{d.k}</div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ s }) {
  const map = {
    Active: { color: 'var(--g700)', borderColor: 'var(--g100)', background: 'var(--g50)' },
    'On Leave': { color: 'var(--a600)', borderColor: 'var(--a100)', background: 'var(--a50)' },
    Paid: { color: 'var(--g700)', borderColor: 'var(--g100)', background: 'var(--g50)' },
    Pending: { color: 'var(--a600)', borderColor: 'var(--a100)', background: 'var(--a50)' },
    Overdue: { color: 'var(--r600)', borderColor: 'var(--r100)', background: 'var(--r50)' },
    Draft: { color: 'var(--s600)', borderColor: 'var(--s200)', background: 'var(--s100)' },
  }
  return <span className="badge" style={map[s] || map.Draft}>{s}</span>
}

function PlanBadge({ p }) {
  const map = {
    Premium: { color: 'var(--b700)', borderColor: 'var(--b100)', background: 'var(--b50)' },
    'IGCSE Pack': { color: 'var(--p600)', borderColor: '#EDE9FE', background: 'var(--p50)' },
    Staff: { color: 'var(--t600)', borderColor: 'var(--t50)', background: 'var(--t50)' },
    Basic: { color: 'var(--s600)', borderColor: 'var(--s200)', background: 'var(--s100)' },
  }
  return <span className="badge" style={map[p] || map.Basic}>{p}</span>
}

// ─── page component ──────────────────────────────────────
const DEFAULT_USER_FORM = { firstName: '', lastName: '', email: '', role: 'Student', curriculum: '', plan: 'Basic', _id: null, subjects: [], grade: '', phone: '', bio: '', parentEmail: '', linkedStudents: [] }

export default function AdminDashboard({ page: pageProp, onNav }) {
   const nav = useNavigate()
   const toast = useToast()
   const [liveSessions, setLiveSessions] = useState(284)
   const [liveClasses, setLiveClasses] = useState(12)
   const [pendingModal, setPendingModal] = useState(false)
   const [userModal, setUserModal] = useState(false)
   const [userForm, setUserForm] = useState({ ...DEFAULT_USER_FORM })
   const [page, setPage] = useState(pageProp || 'dashboard')
   const [refreshKey, setRefreshKey] = useState(0)
   if (pageProp && pageProp !== page) setPage(pageProp)
   const setActivePage = onNav || setPage

   const resetForm = () => ({ ...DEFAULT_USER_FORM })
   const [students, setStudents] = useState([])

   // simulate live counts
   useEffect(() => {
     const id = setInterval(() => {
       setLiveSessions(278 + Math.floor(Math.random() * 12))
       setLiveClasses(10 + Math.floor(Math.random() * 4))
     }, 4500)
     return () => clearInterval(id)
   }, [])

   // Fetch all students for parent selection
   useEffect(() => {
     const fetchStudents = async () => {
       try {
         const res = await api.get('/users/students/list')
         setStudents(res.data.students || [])
       } catch (e) {
         console.error('Failed to load students:', e.message)
       }
     }
     fetchStudents()
   }, [])

   const handleUserSaved = () => {
     setRefreshKey(prev => prev + 1)
   }

   return (
    <div style={{ animation: 'fadeIn .25s ease' }}>
      {/* ── Page tabs (same as admin.html) ── */}
      {/* Using page state to show different sections */}

      {page === 'dashboard' && <DashboardPage
        liveSessions={liveSessions} liveClasses={liveClasses}
        onAddUser={() => { setUserForm(resetForm()); setUserModal(true) }}
        onPending={() => setPendingModal(true)}
        onNav={setPage}
        toast={toast}
      />}
      {page === 'analytics' && <AnalyticsPage onNav={setPage} />}
      {page === 'users' && <UsersPage refreshKey={refreshKey} onAddUser={() => { setUserForm(resetForm()); setUserModal(true) }} onPending={() => setPendingModal(true)} toast={toast} setUserForm={setUserForm} setUserModal={setUserModal} />}
      {page === 'teachers' && <TeachersPage refreshKey={refreshKey} onAddUser={() => { setUserForm({...resetForm(), role: 'Teacher', plan: 'Staff'}); setUserModal(true) }} toast={toast} setUserForm={setUserForm} setUserModal={setUserModal} />}
      {page === 'curriculum' && <CurriculumPage toast={toast} />}
      {page === 'billing' && <BillingPage toast={toast} />}
      {page === 'website' && <WebsiteEditorPage toast={toast} />}
      {page === 'settings' && <SettingsPage toast={toast} />}
      {page === 'ai' && <AIConsolePage toast={toast} />}
      {page === 'allocations' && <AllocationsPage refreshKey={refreshKey} toast={toast} />}
      {page === 'payroll' && <PayrollPage toast={toast} />}
      {page === 'programmes' && <ProgrammesPage toast={toast} />}
      {page === 'grouprooms' && <GroupRoomsPage toast={toast} />}
      {page === 'livelessons' && <LiveLessonsPage toast={toast} />}

      {/* Pending Modal */}
      <Modal open={pendingModal} onClose={() => setPendingModal(false)} title="Pending Registrations" size="md"
        footer={<>
          <button className="btn btn-ok" onClick={() => { toast.ok('All 5 approved — emails sent'); setPendingModal(false) }}>Approve All 5</button>
          <button className="btn btn-s" onClick={() => setPendingModal(false)}>Close</button>
        </>}>
        <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 16 }}>5 students awaiting approval</div>
        {PENDING.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--s200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--s600)', flexShrink: 0 }}>
              {p.n.split(' ').map(x => x[0]).join('')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.n}</div>
              <div style={{ fontSize: 12, color: 'var(--s400)' }}>{p.curr} · {p.plan} · {p.method} · {p.date}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ok btn-sm" onClick={() => toast.ok(`Approved: ${p.n}`)}>Approve</button>
              <button className="btn btn-d btn-sm" onClick={() => toast.error(`Rejected: ${p.n}`)}>Reject</button>
            </div>
          </div>
        ))}
      </Modal>

       {/* Add/Edit User Modal - Role-Specific Fields */}
       <Modal open={userModal} onClose={() => { setUserModal(false); setUserForm(resetForm()) }} title={userForm._id ? "Edit User" : `Add New ${userForm.role}`} size="lg"
         footer={<>
           <button className="btn btn-s" onClick={() => { setUserModal(false); setUserForm(resetForm()) }}>Cancel</button>
          <button className="btn btn-p" onClick={async () => {
            if (!userForm.firstName.trim() || !userForm.lastName.trim() || !userForm.email.trim()) {
              toast.error('First name, last name, and email are required')
              return
            }
            try {
              const payload = {
                firstName: userForm.firstName,
                lastName: userForm.lastName,
                email: userForm.email,
                role: userForm.role.toLowerCase(),
                isActive: true,
              }
              // Add role-specific fields
              if (userForm.role === 'Student') {
                payload.curriculum = userForm.curriculum
                payload.grade = userForm.grade
                payload.plan = userForm.plan
              } else if (userForm.role === 'Teacher') {
                payload.subjects = userForm.subjects && userForm.subjects.length > 0 ? userForm.subjects : []
                payload.phone = userForm.phone
                payload.plan = 'Staff'
               } else if (userForm.role === 'Parent') {
                 payload.phone = userForm.phone
                 payload.bio = userForm.bio
                 payload.plan = 'Basic'
                 payload.linkedStudents = userForm.linkedStudents && userForm.linkedStudents.length > 0 ? userForm.linkedStudents : []
              } else if (userForm.role === 'Admin') {
                payload.plan = 'Staff'
                payload.phone = userForm.phone
              }
              if (userForm._id) {
                // Update existing user
                await api.patch('/users/' + userForm._id, payload)
                toast.ok(userForm.firstName + ' updated!')
              } else {
                // Create new user
                payload.password = 'Welcome@2024'
                await api.post('/users', payload)
                toast.ok(userForm.firstName + ' created! Temp password: Welcome@2024')
               }
               setUserModal(false)
               setUserForm(resetForm())
               handleUserSaved()
             } catch(e) {
               toast.error(e.response?.data?.message || 'Could not save user')
            }
          }}>{userForm._id ? 'Update User' : 'Create User'}</button>
        </>}>
         {/* Common Fields */}
         <div className="fr2">
           <div className="fg"><label className="fl">First Name *</label><input className="fi" value={userForm.firstName} onChange={e => setUserForm(f => ({...f,firstName:e.target.value}))} placeholder="First name" /></div>
           <div className="fg"><label className="fl">Last Name *</label><input className="fi" value={userForm.lastName} onChange={e => setUserForm(f => ({...f,lastName:e.target.value}))} placeholder="Last name" /></div>
         </div>
         <div className="fg"><label className="fl">Email Address *</label><input className="fi" type="email" value={userForm.email} onChange={e => setUserForm(f => ({...f,email:e.target.value}))} placeholder="user@smartious.ac.ke" /></div>
         <div className="fg"><label className="fl">Phone Number</label><input className="fi" value={userForm.phone} onChange={e => setUserForm(f => ({...f,phone:e.target.value}))} placeholder="+254 700 000000" /></div>
         
         {/* Role Selection */}
         <div className="fg"><label className="fl">Role *</label>
           <select className="fsel" value={userForm.role} onChange={e => setUserForm(f => ({...f,role:e.target.value}))}>
             {['Student','Teacher','Parent','Admin'].map(r => <option key={r}>{r}</option>)}
           </select>
         </div>

          {/* Student-Specific Fields */}
          {userForm.role === 'Student' && (
            <div style={{ background: 'var(--b50)', border: '1px solid var(--b100)', borderRadius: 'var(--rmd)', padding: 14, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--b700)', marginBottom: 12 }}>Student Details</div>
              <CurriculumSubjectSelector
                curriculum={userForm.curriculum}
                subjects={userForm.subjects}
                onCurriculumChange={(curr) => setUserForm(f => ({...f, curriculum: curr}))}
                onSubjectsChange={(subjs) => setUserForm(f => ({...f, subjects: subjs}))}
                role="student"
                allowQuickAdd={false}
              />
              <div className="fg" style={{ marginTop: 14 }}>
                <label className="fl">Grade/Year</label>
                <input className="fi" value={userForm.grade} onChange={e => setUserForm(f => ({...f,grade:e.target.value}))} placeholder="e.g., Form 3" />
              </div>
              <div className="fg"><label className="fl">Plan</label>
                <select className="fsel" value={userForm.plan} onChange={e => setUserForm(f => ({...f,plan:e.target.value}))}>
                  {['Basic','Premium','IGCSE Pack'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Teacher-Specific Fields */}
          {userForm.role === 'Teacher' && (
            <div style={{ background: 'var(--g50)', border: '1px solid var(--g100)', borderRadius: 'var(--rmd)', padding: 14, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--g700)', marginBottom: 12 }}>Teacher Details</div>
              <CurriculumSubjectSelector
                curriculum={userForm.curriculum}
                subjects={userForm.subjects}
                onCurriculumChange={(curr) => setUserForm(f => ({...f, curriculum: curr}))}
                onSubjectsChange={(subjs) => setUserForm(f => ({...f, subjects: subjs}))}
                role="teacher"
                allowQuickAdd={true}
              />
            </div>
          )}

          {/* Parent-Specific Fields */}
          {userForm.role === 'Parent' && (
            <div style={{ background: 'var(--p50)', border: '1px solid var(--p200)', borderRadius: 'var(--rmd)', padding: 14, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--p700)', marginBottom: 12 }}>Parent Details</div>
              <div className="fg"><label className="fl">Bio/Notes</label>
                <textarea className="fi" rows={3} value={userForm.bio} onChange={e => setUserForm(f => ({...f,bio:e.target.value}))} placeholder="Parent details, emergency contact info, etc." />
              </div>
              <div className="fg"><label className="fl">Link to Students *</label>
                <div style={{ background: '#fff', border: '1px solid var(--p200)', borderRadius: 'var(--rmd)', padding: 10, maxHeight: 200, overflowY: 'auto' }}>
                  {students.length > 0 ? (
                    students.map(student => (
                      <div key={student._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--p100)' }}>
                        <input
                          type="checkbox"
                          checked={userForm.linkedStudents.includes(student._id)}
                          onChange={(e) => {
                            setUserForm(f => ({
                              ...f,
                              linkedStudents: e.target.checked
                                ? [...f.linkedStudents, student._id]
                                : f.linkedStudents.filter(id => id !== student._id)
                            }))
                          }}
                          style={{ width: 16, height: 16, cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--s900)' }}>{student.firstName} {student.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--s400)' }}>{student.email} · {student.curriculum || 'N/A'}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--s500)', padding: '10px' }}>No students available</div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 4 }}>
                  Selected: {userForm.linkedStudents.length} student{userForm.linkedStudents.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

         {/* Admin-Specific Fields */}
         {userForm.role === 'Admin' && (
           <div style={{ background: 'var(--s50)', border: '1px solid var(--s200)', borderRadius: 'var(--rmd)', padding: 14, marginBottom: 14 }}>
             <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--s700)', marginBottom: 12 }}>Administrator</div>
             <div style={{ fontSize: 12, color: 'var(--s600)', padding: 10, background: 'rgba(0,0,0,.02)', borderRadius: 6 }}>
               ℹ️ This user will have full admin access to the system. Be cautious when granting this role.
             </div>
           </div>
         )}
       </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// SUB-PAGES (all rendered in same component via state)
// ═══════════════════════════════════════════════════════

function DashboardPage({ liveSessions, liveClasses, onAddUser, onPending, onNav, toast }) {
  const store = useStore()
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="sec-tag">Smartious E-School</div>
          <h1 className="serif" style={{ fontSize: 28, color: 'var(--s900)' }}>Admin <em style={{ color: 'var(--b700)' }}>Overview</em></h1>
          <p style={{ fontSize: 14, color: 'var(--s500)', marginTop: 3 }}>Last refreshed {new Date().toLocaleString('en-GB', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ fontSize: 12.5, color: 'var(--s400)', background:'var(--bg)', border:'1px solid var(--border)', padding:'5px 12px', borderRadius:99, display:'flex', gap:8 }}>
            <span>{store.articles.filter(a=>a.status==='Published').length} articles live</span>
            <span style={{opacity:.4}}>|</span>
            <span>{store.resources.length} resources</span>
            <span style={{opacity:.4}}>|</span>
            <span>{store.messages.filter(m=>!m.read).length} unread msgs</span>
          </div>
          <button className="btn btn-s btn-sm" onClick={() => toast.info('Generating PDF...')}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button className="btn btn-p btn-sm" onClick={onAddUser}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add User
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-ic" style={{ background: 'var(--b50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="kpi-v">2,418</div>
          <div className="kpi-l">Total Students</div>
          <div className="kpi-d" style={{ color: 'var(--g600)' }}>↑ +48 this month</div>
        </div>
        <div className="kpi">
          <div className="kpi-ic" style={{ background: 'var(--g50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round"><path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/></svg>
          </div>
          <div className="kpi-v">127</div>
          <div className="kpi-l">Active Teachers</div>
          <div className="kpi-d" style={{ color: 'var(--g600)' }}>↑ +6 this month</div>
        </div>
        <div className="kpi">
          <div className="kpi-ic" style={{ background: 'var(--a50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div className="kpi-v mono" style={{ fontSize: 20 }}>3.48M</div>
          <div className="kpi-l">Revenue KES (Feb)</div>
          <div className="kpi-d" style={{ color: 'var(--g600)' }}>↑ +12% vs Jan</div>
        </div>
        <div className="kpi">
          <div className="kpi-ic" style={{ background: 'var(--p50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className="kpi-v">99.4<span style={{ fontSize: 16, color: 'var(--s400)' }}>%</span></div>
          <div className="kpi-l">Platform Uptime</div>
          <div className="kpi-d" style={{ color: 'var(--g600)' }}>30-day avg</div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Revenue chart */}
          <div className="card">
            <div className="chdr">
              <div className="ctitle">Monthly Revenue (KES)</div>
              <span className="badge" style={{ color: 'var(--g700)', borderColor: 'var(--g100)', background: 'var(--g50)' }}>+12% MoM</span>
            </div>
            <BarChart data={REV_DATA} />
          </div>

          {/* Enrolment by service */}
          <div className="card">
            <div className="chdr">
              <div className="ctitle">Enrolment by Service</div>
              <button className="btn btn-g btn-sm" onClick={() => onNav('analytics')}>Analytics →</button>
            </div>
            <ProgRow label="Homeschool — At Home" val={842} pct={35} col="var(--b700)" />
            <ProgRow label="Homeschool — Centre" val={614} pct={25} col="var(--b500)" />
            <ProgRow label="Homeschool — Virtual" val={521} pct={22} col="#93C5FD" />
            <ProgRow label="Virtual School" val={304} pct={13} col="var(--g600)" />
            <ProgRow label="Tuition" val={137} pct={6} col="var(--a600)" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* System alerts */}
          <div className="card">
            <div className="chdr" style={{ marginBottom: 14 }}>
              <div className="ctitle">System Alerts</div>
              <span className="badge" style={{ color: 'var(--r600)', borderColor: 'var(--r100)', background: 'var(--r50)' }}>2 Active</span>
            </div>
            <div style={{ background: 'var(--r50)', border: '1px solid var(--r100)', borderRadius: 'var(--rmd)', padding: 13, marginBottom: 10, display: 'flex', gap: 10 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--r600)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--r600)' }}>Disk Usage: 78%</div>
                <div style={{ fontSize: 12, color: 'var(--s600)', marginTop: 2 }}>Archive recordings to free space</div>
                <button className="btn btn-d btn-sm" style={{ marginTop: 8 }} onClick={() => onNav('settings')}>Fix Now</button>
              </div>
            </div>
            <div style={{ background: 'var(--a50)', border: '1px solid var(--a100)', borderRadius: 'var(--rmd)', padding: 13, display: 'flex', gap: 10 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--a600)' }}>5 Pending Approvals</div>
                <div style={{ fontSize: 12, color: 'var(--s600)', marginTop: 2 }}>New student registrations</div>
                <button className="btn btn-am btn-sm" style={{ marginTop: 8 }} onClick={onPending}>Review</button>
              </div>
            </div>
          </div>

          {/* Live platform */}
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 14 }}>Live Platform Now</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Active sessions', liveSessions, 'var(--b700)'],
                ['Live classes running', liveClasses, 'var(--r500)'],
                ['Lessons completed today', '1,847', 'var(--g600)'],
                ['Exams submitted today', 203, 'var(--s800)'],
                ['New enrolments today', 7, 'var(--g600)'],
                ['Revenue today', 'KES 48,500', 'var(--b700)'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                  <span style={{ color: 'var(--s500)' }}>{l}</span>
                  <span className="mono" style={{ fontWeight: 700, color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By curriculum */}
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 14 }}>By Curriculum</div>
            {[['IGCSE',894,100,'var(--b700)'],['British',612,68,'var(--g600)'],['IB Diploma',387,43,'var(--p600)'],['CBC/KCSE',341,38,'var(--a600)'],['American',184,21,'var(--t600)']].map(([n,v,p,c]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--s700)', flex: 1, minWidth: 80 }}>{n}</span>
                <div style={{ flex: 2 }}><div className="prog"><div className="prog-f" style={{ width: p + '%', background: c }} /></div></div>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--s800)', width: 32, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function AnalyticsPage({ onNav }) {
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div className="sec-tag">Platform Intelligence</div>
        <h2 className="serif" style={{ fontSize: 26, color: 'var(--s900)' }}>Analytics <em style={{ color: 'var(--b700)' }}>&amp; Reports</em></h2>
      </div>
      <div className="kpi-row">
        {[
          { ic: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, bg:'var(--b50)', v:'78%', l:'Platform Pass Rate', d:'↑ +3% YoY', dc:'var(--g600)' },
          { ic: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/></svg>, bg:'var(--g50)', v:'91%', l:'Avg. Attendance', d:'↑ +1.4% MoM', dc:'var(--g600)' },
          { ic: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, bg:'var(--a50)', v:'96%', l:'Retention Rate', d:'↑ +2% vs last term', dc:'var(--g600)' },
          { ic: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--p600)" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, bg:'var(--p50)', v:'4.8/5', l:'Avg. Teacher Rating', d:'1,840 reviews', dc:'var(--s500)' },
        ].map((k, i) => (
          <div key={i} className="kpi">
            <div className="kpi-ic" style={{ background: k.bg }}>{k.ic}</div>
            <div className="kpi-v">{k.v}</div>
            <div className="kpi-l">{k.l}</div>
            <div className="kpi-d" style={{ color: k.dc }}>{k.d}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card"><div className="chdr"><div className="ctitle">Student Growth (6 months)</div></div><BarChart data={GROWTH_DATA} /></div>
        <div className="card">
          <div className="chdr"><div className="ctitle">Top Subjects by Enrolment</div></div>
          {[['Mathematics',1847,100,'#3B82F6'],['English',1623,88,'#22C55E'],['Biology',1204,65,'#8B5CF6'],['Chemistry',1088,59,'#F59E0B'],['Physics',962,52,'#14B8A6']].map(([n,v,p,c]) => (
            <ProgRow key={n} label={n} val={v.toLocaleString()} pct={p} col={c} />
          ))}
        </div>
        <div className="card">
          <div className="chdr"><div className="ctitle">Students by Country</div></div>
          {[['🇰🇪','Kenya',1840],['🇺🇬','Uganda',184],['🇹🇿','Tanzania',112],['🇬🇧','UK / Diaspora',98],['🇦🇪','UAE',76],['🇳🇬','Nigeria',54]].map(([f,c,n]) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 18 }}>{f}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--s700)', flex: 1 }}>{c}</span>
              <div style={{ width: 90 }}><div className="prog"><div className="prog-f" style={{ width: Math.round(n/1840*100)+'%', background: 'var(--b600)' }} /></div></div>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, width: 36, textAlign: 'right' }}>{n}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="chdr"><div className="ctitle">Avg. Exam Score by Year Level</div></div>
          <BarChart data={[{k:'F1',v:81,hi:true},{k:'F2',v:77},{k:'F3',v:73},{k:'F4',v:69},{k:'Y12',v:74},{k:'Y13',v:71}]} />
        </div>
      </div>
    </>
  )
}

function UsersPage({ refreshKey, onAddUser, onPending, toast, setUserForm, setUserModal }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [planFilter, setPlanFilter] = useState('All Plans')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users')
        setUsers(res.data.users || [])
        setLoading(false)
      } catch (e) {
        setError(e.response?.data?.message || e.message)
        setLoading(false)
      }
    }
    fetchUsers()
  }, [refreshKey])

  const filtered = users.filter(u => {
    // Search filter
    if (search && !u.firstName.toLowerCase().includes(search.toLowerCase()) && !u.lastName.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    // Role filter
    if (roleFilter !== 'All Roles' && u.role !== roleFilter.toLowerCase()) {
      return false
    }
    // Status filter
    if (statusFilter !== 'All Status') {
      const userStatus = u.isActive ? 'Active' : 'Suspended'
      if (userStatus !== statusFilter) {
        return false
      }
    }
    // Plan filter
    if (planFilter !== 'All Plans' && u.plan !== planFilter) {
      return false
    }
    return true
  })

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading users...</div>
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--r600)' }}>Error: {error}</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div><div className="sec-tag">Accounts</div><h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>User <em style={{ color: 'var(--b700)' }}>Management</em></h2></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-s btn-sm" onClick={() => toast.info('Exporting CSV...')}>Export CSV</button>
          <button className="btn btn-p btn-sm" onClick={onAddUser}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add User
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <input className="fi" style={{ maxWidth: 280 }} placeholder="Search name, email or ID..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="fsel" style={{ maxWidth: 130 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option>All Roles</option><option>student</option><option>teacher</option><option>parent</option><option>admin</option></select>
        <select className="fsel" style={{ maxWidth: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All Status</option><option>Active</option><option>Suspended</option></select>
        <select className="fsel" style={{ maxWidth: 130 }} value={planFilter} onChange={e => setPlanFilter(e.target.value)}><option>All Plans</option><option>Basic</option><option>Premium</option><option>IGCSE Pack</option><option>Staff</option></select>
      </div>
      <div style={{ background: 'var(--a50)', border: '1px solid var(--a100)', borderRadius: 'var(--rlg)', padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--a600)' }}>5 registrations pending approval</span>
        <button className="btn btn-ok btn-sm" onClick={() => {
          toast.ok('5 registrations approved — welcome emails sent')
        }}>Approve All</button>
        <button className="btn btn-g btn-sm" onClick={onPending}>Review Individually</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl">
          <thead><tr><th>User</th><th>Role</th><th>Curriculum</th><th>Plan</th><th>Status</th><th>Last Active</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u._id || i}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Av init={(u.firstName[0] + u.lastName[0]).toUpperCase()} col={['#3B82F6','#22C55E','#8B5CF6','#F59E0B','#EC4899'][i % 5]} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--s400)' }}>{u.email} · {u._id?.slice(-6) || 'ID'}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge" style={{ color: 'var(--b700)', borderColor: 'var(--b100)', background: 'var(--b50)' }}>{u.role}</span></td>
                <td style={{ color: 'var(--s500)' }}>{u.curriculum || 'N/A'}</td>
                <td><PlanBadge p={u.plan || 'Basic'} /></td>
                <td><StatusBadge s={u.isActive ? 'Active' : 'Suspended'} /></td>
                <td style={{ color: 'var(--s400)', fontSize: 13 }}>{u.lastActive || 'Never'}</td>
                <td>
                   <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-g btn-sm" onClick={() => {
                        setUserForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, curriculum: u.curriculum || '', plan: u.plan || 'Basic', _id: u._id, subjects: u.subjects || [], grade: u.grade || '', phone: u.phone || '', bio: u.bio || '', parentEmail: u.parentEmail || '', linkedStudents: u.linkedStudents || [] })
                        setUserModal(true)
                      }}>Edit</button>
                     <button className="btn btn-d btn-sm" onClick={async () => {
                       if (!confirm(`Delete ${u.firstName} ${u.lastName} permanently? This cannot be undone.`)) return
                       try {
                         await api.delete('/users/' + u._id)
                         setUsers(prev => prev.filter(x => x._id !== u._id))
                         toast.ok(`${u.firstName} deleted`)
                       } catch(e) { toast.error('Delete failed: ' + (e.response?.data?.message || e.message)) }
                     }}>Delete</button>
                   </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function TeachersPage({ refreshKey, onAddUser, toast, setUserForm, setUserModal }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get('/teachers')
        setTeachers(res.data.teachers || [])
        setLoading(false)
      } catch (e) {
        setError(e.response?.data?.message || e.message)
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [refreshKey])

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading teachers...</div>
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--r600)' }}>Error: {error}</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div><div className="sec-tag">Faculty</div><h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Teacher <em style={{ color: 'var(--b700)' }}>Management</em></h2></div>
        <button className="btn btn-p btn-sm" onClick={onAddUser}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Teacher
        </button>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl">
          <thead><tr><th>Teacher</th><th>Subjects</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {teachers.map((t, i) => (
              <tr key={t._id || i}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Av init={(t.firstName[0] + t.lastName[0]).toUpperCase()} col={['#3B82F6','#22C55E','#8B5CF6','#F59E0B','#EC4899'][i % 5]} size={34} /><span style={{ fontWeight: 700, color: 'var(--s900)' }}>{t.firstName} {t.lastName}</span></div></td>
                <td style={{ color: 'var(--s500)', fontSize: 13 }}>{t.subjects?.join(' · ') || 'N/A'}</td>
                <td><StatusBadge s={t.status} /></td>
                 <td>
                   <div style={{ display: 'flex', gap: 5 }}>
                     <button className="btn btn-g btn-sm" onClick={() => {
                       setUserForm({ firstName: t.firstName, lastName: t.lastName, email: t.email, role: 'Teacher', curriculum: '', plan: 'Staff', _id: t._id, subjects: t.subjects || [], phone: t.phone || '', bio: t.bio || '', grade: '', parentEmail: '' })
                       setUserModal(true)
                     }}>Edit</button>
                     <button className="btn btn-d btn-sm" onClick={async () => {
                       if (!confirm(`Delete ${t.firstName} ${t.lastName}? This will also delete their User record.`)) return
                       try {
                         await api.delete('/teachers/' + t._id)
                         setTeachers(prev => prev.filter(x => x._id !== t._id))
                         toast.ok(`${t.firstName} deleted`)
                       } catch(e) { toast.error('Delete failed: ' + (e.response?.data?.message || e.message)) }
                     }}>Delete</button>
                   </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function CurriculumPage({ toast }) {
  const [curricula, setCurricula] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', org: '', grades: '', subjects: 6, status: 'Active', description: '' })

  useEffect(() => {
    const fetchCurricula = async () => {
      try {
        const res = await api.get('/curriculum')
        setCurricula(res.data.curricula || [])
        setLoading(false)
      } catch (e) {
        setError(e.response?.data?.message || e.message)
        setLoading(false)
      }
    }
    fetchCurricula()
  }, [])

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function openAdd() { setForm({ name: '', org: '', grades: '', subjects: 6, status: 'Active', description: '' }); setEditing(null); setAdding(true) }
  function openEdit(c) { setForm({ name: c.name, org: c.org || '', grades: c.grades || '', subjects: c.subjects || 6, status: c.status, description: c.description || '' }); setEditing(c._id); setAdding(true) }

  async function save() {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    try {
      if (editing) {
        const res = await api.patch('/curriculum/' + editing, form)
        setCurricula(prev => prev.map(c => c._id === editing ? res.data.curriculum : c))
        toast.ok(form.name + ' updated — changes live on website and portals')
      } else {
        const res = await api.post('/curriculum', form)
        setCurricula(prev => [...prev, res.data.curriculum])
        toast.ok(form.name + ' added — now visible on website and student registration')
      }
      setAdding(false)
    } catch (e) {
      toast.error('Save failed: ' + (e.response?.data?.message || e.message))
    }
  }

  async function handleStatusToggle(currId, currName, currentStatus) {
    try {
      const newStatus = currentStatus === 'Active' ? 'Draft' : 'Active'
      const res = await api.patch('/curriculum/' + currId, { status: newStatus })
      setCurricula(prev => prev.map(c => c._id === currId ? res.data.curriculum : c))
      toast.ok(currName + ' ' + (newStatus === 'Active' ? 'activated' : 'deactivated'))
    } catch (e) {
      toast.error('Update failed: ' + (e.response?.data?.message || e.message))
    }
  }

  async function handleDelete(currId, currName) {
    if (!window.confirm('Delete ' + currName + '?')) return
    try {
      await api.delete('/curriculum/' + currId)
      setCurricula(prev => prev.filter(c => c._id !== currId))
      toast.ok('Deleted')
    } catch (e) {
      toast.error('Delete failed: ' + (e.response?.data?.message || e.message))
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading curricula...</div>
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--r600)' }}>Error: {error}</div>

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div className="sec-tag">Content Structure</div>
          <h2 className="serif" style={{ fontSize:24, color:'var(--s900)' }}>Curriculum <em style={{ color:'var(--b700)' }}>Manager</em></h2>
          <p style={{ fontSize:13, color:'var(--s500)', marginTop:4 }}>Changes here reflect immediately on the website, registration page, and all portals.</p>
        </div>
        <button className="btn btn-p" onClick={openAdd}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Curriculum
        </button>
      </div>

      {adding && (
        <div className="card" style={{ marginBottom:20, borderColor:'var(--b200)', borderWidth:2 }}>
          <div className="chdr" style={{ marginBottom:16 }}>
            <div className="ctitle">{editing ? 'Edit Curriculum' : 'Add New Curriculum'}</div>
            <button className="btn btn-g btn-sm" onClick={() => setAdding(false)}>Cancel</button>
          </div>
          <div className="fr2">
            <div className="fg"><label className="fl">Curriculum Name *</label><input className="fi" value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="e.g. IGCSE"/></div>
            <div className="fg"><label className="fl">Organisation / Board</label><input className="fi" value={form.org} onChange={e=>upd('org',e.target.value)} placeholder="e.g. Cambridge International"/></div>
          </div>
          <div className="fr2">
            <div className="fg"><label className="fl">Grade / Year Levels</label><input className="fi" value={form.grades} onChange={e=>upd('grades',e.target.value)} placeholder="e.g. Form 1–4 / Ages 14–16"/></div>
            <div className="fg"><label className="fl">Number of Subjects</label><input className="fi" type="number" min="1" max="30" value={form.subjects} onChange={e=>upd('subjects',parseInt(e.target.value)||0)}/></div>
          </div>
          <div className="fg"><label className="fl">Description (shown on website)</label><textarea className="fi" rows={3} value={form.description} onChange={e=>upd('description',e.target.value)} placeholder="Brief description visible on the website curricula page..."/></div>
          <div className="fg" style={{ marginBottom:0 }}>
            <label className="fl">Status</label>
            <select className="fsel" value={form.status} onChange={e=>upd('status',e.target.value)}>
              <option value="Active">Active — visible to students</option>
              <option value="Draft">Draft — hidden from students</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:16 }}>
            <button className="btn btn-ok" onClick={save}>
              {editing ? 'Save Changes' : 'Add Curriculum'}
            </button>
          </div>
        </div>
      )}

      {curricula.length > 0 ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {curricula.map((c) => (
            <div key={c._id} className="card" style={{ borderLeft: c.status==='Active' ? '3px solid var(--g500)' : '3px solid var(--s300)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ width:42, height:42, borderRadius:'var(--rmd)', background:'var(--b50)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13"/><path d="M4 19a2 2 0 0 0 2 2h14"/></svg>
                </div>
                <StatusBadge s={c.status} />
              </div>
              <div className="serif" style={{ fontSize:19, color:'var(--s900)', marginBottom:3 }}>{c.name}</div>
              <div style={{ fontSize:12, color:'var(--s400)', marginBottom:6 }}>{c.org}</div>
              {c.grades && <div style={{ fontSize:12, color:'var(--b600)', marginBottom:10 }}>{c.grades}</div>}
              {c.description && <div style={{ fontSize:12.5, color:'var(--s500)', marginBottom:12, lineHeight:1.5 }}>{c.description}</div>}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                <div style={{ background:'var(--bg)', borderRadius:'var(--rmd)', padding:'10px', textAlign:'center' }}>
                  <div className="mono" style={{ fontSize:18, fontWeight:700 }}>{(c.students?.length||0).toLocaleString()}</div>
                  <div style={{ fontSize:10, color:'var(--s400)' }}>Students</div>
                </div>
                <div style={{ background:'var(--bg)', borderRadius:'var(--rmd)', padding:'10px', textAlign:'center' }}>
                  <div className="mono" style={{ fontSize:18, fontWeight:700 }}>{c.subjects||0}</div>
                  <div style={{ fontSize:10, color:'var(--s400)' }}>Subjects</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-s btn-sm" style={{ flex:1, justifyContent:'center' }} onClick={() => openEdit(c)}>Edit</button>
                <button className="btn btn-g btn-sm" onClick={() => handleStatusToggle(c._id, c.name, c.status)} style={{ color: c.status==='Active' ? 'var(--r500)' : 'var(--g600)' }}>
                  {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
                <button className="btn btn-d btn-sm" onClick={() => handleDelete(c._id, c.name)}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--s500)' }}>
          No curricula found. <button className="btn btn-p btn-sm" onClick={openAdd} style={{ marginLeft: 8 }}>Add one</button>
        </div>
      )}
    </>
  )
}

function BillingPage({ toast }) {
  const store = useStore()
  const [localFees, setLocalFees] = React.useState({ ...store.fees })
  const updFee = (k, v) => setLocalFees(p => ({ ...p, [k]: parseInt(v) || 0 }))
  return (
    <>
      <div style={{ marginBottom: 20 }}><div className="sec-tag">Finance</div><h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Billing &amp; <em style={{ color: 'var(--b700)' }}>Payments</em></h2></div>
      <div className="kpi-row">
        {[
          { ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, bg:'var(--b50)', v:'3.48M', l:'Feb Revenue (KES)', d:'↑ +12% vs Jan', dc:'var(--g600)' },
          { ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round"><path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/></svg>, bg:'var(--g50)', v:'127', l:'Active Teachers', d:'↑ +6 this month', dc:'var(--g600)' },
          { ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>, bg:'var(--a50)', v:'43', l:'Overdue Payments', d:'KES 64,500 total', dc:'var(--a600)' },
          { ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--p600)" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>, bg:'var(--p50)', v:'1,568', l:'Assessment Fees', d:'KES 3.14M YTD', dc:'var(--g600)' },
        ].map((k,i) => (
          <div key={i} className="kpi">
            <div className="kpi-ic" style={{ background: k.bg }}>{k.ic}</div>
            <div className="kpi-v mono" style={{ fontSize: 20 }}>{k.v}</div>
            <div className="kpi-l">{k.l}</div>
            <div className="kpi-d" style={{ color: k.dc }}>{k.d}</div>
          </div>
        ))}
      </div>

      {/* Pricing controls */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="chdr">
          <div className="ctitle">Plan Pricing Controls</div>
          <button className="btn btn-ok btn-sm" onClick={() => { store.updateFees(localFees); toast.ok('Pricing saved — live on website and all portals now!') }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
            Save Pricing
          </button>
        </div>
        <div className="fr3" style={{ marginBottom: 16 }}>
          <div className="card-sm" style={{ borderColor:'var(--border)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'var(--s700)', marginBottom:10 }}>Individual — Basic</div>
              <div className="fg"><label className="fl">KES / month</label><input className="fi" value={localFees.individual_basic||1499} type="number" onChange={e=>updFee('individual_basic',e.target.value)}/></div>
              <div className="fg" style={{ marginBottom:0 }}><label className="fl">Subjects</label><input className="fi" defaultValue="3"/></div>
            </div>
            <div className="card-sm" style={{ borderColor:'var(--b200)', background:'var(--b50)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'var(--b700)', marginBottom:10 }}>Individual — Premium</div>
              <div className="fg"><label className="fl">KES / month</label><input className="fi" value={localFees.individual_premium||2999} type="number" onChange={e=>updFee('individual_premium',e.target.value)}/></div>
              <div className="fg" style={{ marginBottom:0 }}><label className="fl">AI Sessions / day</label><input className="fi" defaultValue="Unlimited"/></div>
            </div>
            <div className="card-sm" style={{ borderColor:'var(--border)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'var(--p600)', marginBottom:10 }}>Group — Basic</div>
              <div className="fg"><label className="fl">KES / month</label><input className="fi" value={localFees.group_basic||499} type="number" onChange={e=>updFee('group_basic',e.target.value)}/></div>
              <div className="fg" style={{ marginBottom:0 }}><label className="fl">Students/room</label><input className="fi" defaultValue="10"/></div>
            </div>
            <div className="card-sm" style={{ borderColor:'var(--border)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'var(--g600)', marginBottom:10 }}>Group — Premium</div>
              <div className="fg"><label className="fl">KES / month</label><input className="fi" value={localFees.group_premium||999} type="number" onChange={e=>updFee('group_premium',e.target.value)}/></div>
              <div className="fg" style={{ marginBottom:0 }}><label className="fl">Students/room</label><input className="fi" defaultValue="10"/></div>
            </div>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {[['Assessment Fee (KES, one-time)','2000','160px'],['Learning Centre Discount','20','80px'],['Online Discount','10','80px'],['Tuition Online (KES)','1000','120px'],['Tuition Home Visit (KES)','1500','120px']].map(([l,v,w]) => (
            <div key={l}><label className="fl">{l}</label><input className="fi" defaultValue={v} style={{ maxWidth: w }} type="number" /></div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="ctitle">Recent Transactions</span>
          <button className="btn btn-g btn-sm" onClick={() => toast.info('Exporting...')}>Export</button>
        </div>
        <table className="tbl">
          <thead><tr><th>Student</th><th>Item</th><th>Method</th><th>Amount</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {TXNS.map((t, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700, color: 'var(--s900)' }}>{t.n}</td>
                <td style={{ color: 'var(--s500)' }}>{t.p}</td>
                <td style={{ color: 'var(--s500)' }}>{t.m}</td>
                <td><span className="mono" style={{ fontWeight: 700 }}>KES {t.a}</span></td>
                <td style={{ color: 'var(--s400)', fontSize: 13 }}>{t.d}</td>
                <td><StatusBadge s={t.s} /></td>
                <td><button className="btn btn-g btn-sm" onClick={() => toast.info('Viewing receipt')}>Receipt</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function AIConsolePage({ toast }) {
  const [msgs, setMsgs] = useState([
    { role: 'system', text: '// Smartious Admin AI Console — Test Mshauri live', col: 'rgba(255,255,255,.3)' },
    { role: 'system', text: '// Type a prompt and press Send or Enter', col: 'rgba(255,255,255,.3)' },
    { role: 'system', text: '● Ready · Model: claude-sonnet-4-20250514', col: '#4ADE80' },
  ])
  const [inp, setInp] = useState('')
  const [loading, setLoading] = useState(false)
  const consoleRef = useRef(null)

  const send = async () => {
    if (!inp.trim() || loading) return
    const q = inp.trim()
    setInp('')
    setMsgs(m => [...m, { role: 'user', text: '> ' + q, col: '#60A5FA' }])
    setLoading(true)
    try {
      const res = await api.post('/auth/mshauri', { message: q })
      setMsgs(m => [...m, { role: 'ai', text: res.data.reply || 'No response.', col: 'rgba(255,255,255,.8)' }])
    } catch {
      setMsgs(m => [...m, { role: 'ai', text: 'Mshauri: ' + (q.toLowerCase().includes('pythagoras') ? 'In a right-angled triangle, c² = a² + b², where c is the hypotenuse. This is Pythagoras Theorem — a foundational concept in IGCSE Geometry.' : 'I can help students understand their subjects, generate practice questions, summarise lessons, and provide personalised feedback. Ask me anything!'), col: 'rgba(255,255,255,.8)' }])
    }
    setLoading(false)
    setTimeout(() => { if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight }, 50)
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}><div className="sec-tag">Artificial Intelligence</div><h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>AI <em style={{ color: 'var(--b700)' }}>Console</em></h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Usage */}
        <div className="card">
          <div className="chdr"><div className="ctitle">Mshauri Usage (Feb 2026)</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Total AI chat sessions','14,847','var(--b700)'],['AI summaries generated','8,312','var(--s900)'],['Flashcard sets generated','3,104','var(--s900)'],['Papers AI-marked','2,847','var(--s900)'],['Exam questions generated','418','var(--s900)'],['Total API tokens','84.2M','var(--p600)'],['API cost (Feb)','USD $124.40','var(--s900)']].map(([l,v,c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: 'var(--s500)' }}>{l}</span>
                <span className="mono" style={{ fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>Cost vs budget</span>
                <span className="mono" style={{ fontWeight: 700 }}>62% of $200</span>
              </div>
              <div className="prog"><div className="prog-f" style={{ width: '62%', background: 'var(--p500)' }} /></div>
            </div>
          </div>
        </div>

        {/* Config */}
        <div className="card">
          <div className="chdr"><div className="ctitle">Model Configuration</div><button className="btn btn-p btn-sm" onClick={() => toast.ok('AI config saved')}>Save</button></div>
          <div className="fg"><label className="fl">AI Model</label><select className="fsel"><option>claude-sonnet-4-20250514 (Active)</option><option>claude-opus-4-6</option><option>claude-haiku-4-5-20251001</option></select></div>
          <div className="fg"><label className="fl">Max Tokens / Request</label><input className="fi" defaultValue="600" type="number" /></div>
          <div className="fg"><label className="fl">Monthly Token Budget</label><input className="fi" defaultValue="100,000,000" /></div>
          <div className="fg"><label className="fl">Requests / Student / Day</label><input className="fi" defaultValue="50" type="number" /></div>
          <div className="fg"><label className="fl">AI-Generated Flag Threshold (%)</label><input className="fi" defaultValue="25" type="number" /></div>
          <div className="fg" style={{ marginBottom: 0 }}><label className="fl">Plagiarism Flag Threshold (%)</label><input className="fi" defaultValue="15" type="number" /></div>
        </div>

        {/* System prompts */}
        <div className="card">
          <div className="chdr"><div className="ctitle">Student System Prompt</div><button className="btn btn-p btn-sm" onClick={() => toast.ok('Prompt saved')}>Save</button></div>
          <textarea className="fta" rows={5} defaultValue="You are Mshauri, a warm and encouraging AI tutor for Smartious E-School Kenya. Use the Socratic method — guide students to answers rather than giving them directly. Be concise (max 3 short paragraphs). Occasionally use Swahili encouragement (e.g. &quot;Hongera!&quot;, &quot;Jaribu tena!&quot;). Focus on IGCSE, IB, British, CBC and American curricula." />
        </div>
        <div className="card">
          <div className="chdr"><div className="ctitle">Teacher System Prompt</div><button className="btn btn-p btn-sm" onClick={() => toast.ok('Prompt saved')}>Save</button></div>
          <textarea className="fta" rows={5} defaultValue="You are Mshauri, an AI marking assistant for teachers at Smartious E-School. Help with grading, personalised feedback, and academic integrity analysis. Be concise and professional. Flag plagiarism indicators, copy-paste patterns, and AI-generated content." />
        </div>
      </div>

      {/* Live test console */}
      <div className="card">
        <div className="chdr">
          <div className="ctitle">Live AI Test Console</div>
          <span className="badge" style={{ color: 'var(--g700)', borderColor: 'var(--g100)', background: 'var(--g50)' }}>● Connected · claude-sonnet-4-20250514</span>
        </div>
        <div ref={consoleRef} className="console">
          {msgs.map((m, i) => <div key={i} style={{ color: m.col }}>{m.text}</div>)}
          {loading && <div style={{ color: '#4ADE80' }}>● Thinking...</div>}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <input className="fi" value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }} placeholder="Test: 'Explain Pythagoras Theorem in 2 sentences'" />
          <button className="btn btn-p" onClick={send} disabled={loading}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Send
          </button>
        </div>
      </div>
    </>
  )
}

function AllocationsPage({ refreshKey, toast }) {
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const res = await api.get('/allocations')
        setAllocations(res.data.allocations || [])
        setLoading(false)
      } catch (e) {
        setError(e.response?.data?.message || e.message)
        setLoading(false)
      }
    }
    fetchAllocations()
  }, [refreshKey])

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading allocations...</div>
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--r600)' }}>Error: {error}</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div><div className="sec-tag">Enrolment System</div><h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Student Allocations</h2>
          <p style={{ color: 'var(--s500)', fontSize: 13.5 }}>Auto-matched students from the website. Review, approve and override teacher assignments.</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-s btn-sm" onClick={() => toast.info('Allocation rules config opening...')}>Allocation Rules</button>
          <button className="btn btn-p btn-sm" onClick={() => toast.info('Manual allocation wizard...')}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Manual Allocate
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[['Pending Review', allocations.filter(a => a.status === 'Pending').length, 'var(--b700)', 'Awaiting admin confirm'], ['Active Allocations', allocations.filter(a => a.status === 'Active').length, 'var(--g600)', 'Across all programmes'], ['Capacity Used', '89%', 'var(--a600)', '33 free slots remain'], ['Auto-Match Rate', '94%', 'var(--p600)', '6% need manual review']].map(([l, v, c, sub]) => (
          <div key={l} className="card" style={{ padding: 18, borderLeft: `3px solid ${c}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--s400)', marginBottom: 8 }}>{l}</div>
            <div className="mono" style={{ fontSize: '2rem', fontWeight: 500, color: c }}>{v}</div>
            <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, flex: 1 }}>All Active Allocations</div>
          <input className="fi" placeholder="Search student or teacher..." style={{ width: 220 }} />
          <select className="fsel" style={{ width: 160 }}><option>All Programmes</option><option>Homeschool</option><option>IGCSE</option><option>A-Level</option><option>IB Diploma</option></select>
        </div>
        <table className="tbl">
          <thead><tr><th>Student</th><th>Programme</th><th>Teacher</th><th>Session Slot</th><th>Match Type</th><th>Since</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {allocations.map((a, i) => (
              <tr key={a._id || i}>
                <td style={{ fontWeight: 600 }}>{a.studentId ? `${a.studentId.firstName} ${a.studentId.lastName}` : 'Unknown'}</td>
                <td><span className="badge badge-blue">{a.programmeId || 'N/A'}</span></td>
                <td style={{ color: 'var(--s600)' }}>{a.teacherId ? `${a.teacherId.firstName} ${a.teacherId.lastName}` : 'Unknown'}</td>
                <td style={{ fontSize: 13, color: 'var(--s500)' }}>{a.sessionSlot || 'N/A'}</td>
                <td><span className={`badge ${a.matchType === 'Auto' ? 'badge-green' : 'badge-amber'}`}>{a.matchType}</span></td>
                <td style={{ fontSize: 13, color: 'var(--s400)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                <td><StatusBadge s={a.status} /></td>
                <td>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="btn btn-g btn-sm" onClick={() => toast.ok('Reassignment notification sent')}>Reassign</button>
                    {a.status === 'Pending' && <button className="btn btn-ok btn-sm" onClick={async () => {
                      if (!confirm(`Approve allocation for ${a.studentId ? a.studentId.firstName : 'Unknown'}?`)) return
                      try {
                        await api.post('/allocations/' + a._id + '/approve')
                        setAllocations(prev => prev.map(x => x._id === a._id ? { ...x, status: 'Active' } : x))
                        toast.ok('Allocation approved — welcome email sent')
                      } catch(e) { toast.error('Approve failed: ' + (e.response?.data?.message || e.message)) }
                    }}>Approve</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function PayrollPage({ toast }) {
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('2026-04')

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const res = await api.get('/payroll')
        setPayrolls(res.data.payrolls || [])
        setLoading(false)
      } catch (e) {
        setError(e.response?.data?.message || e.message)
        setLoading(false)
      }
    }
    fetchPayrolls()
  }, [])

  const filtered = payrolls.filter(p => {
    const staffName = p.staffId?.firstName && p.staffId?.lastName 
      ? (p.staffId.firstName + ' ' + p.staffId.lastName).toLowerCase()
      : 'Unknown'
    return !search || staffName.includes(search.toLowerCase())
  })

  const monthPayrolls = filtered.filter(p => p.month === selectedMonth)

  const handlePayNow = async (payrollId, staffName) => {
    if (!confirm(`Pay ${staffName} via M-Pesa?`)) return
    try {
      await api.patch('/payroll/' + payrollId, { status: 'Paid' })
      setPayrolls(prev => prev.map(p => p._id === payrollId ? { ...p, status: 'Paid' } : p))
      toast.ok(`${staffName} paid successfully`)
    } catch (e) {
      toast.error('Payment failed: ' + (e.response?.data?.message || e.message))
    }
  }

  const handleRunPayroll = async () => {
    if (!confirm(`Process payroll for ${monthPayrolls.length} staff members?`)) return
    try {
      let successCount = 0
      for (const p of monthPayrolls) {
        if (p.status !== 'Paid') {
          await api.patch('/payroll/' + p._id, { status: 'Processing' })
          successCount++
        }
      }
      setPayrolls(prev => prev.map(p => 
        monthPayrolls.some(mp => mp._id === p._id) && p.status !== 'Paid'
          ? { ...p, status: 'Processing' }
          : p
      ))
      toast.ok(`Payroll run complete — ${successCount} staff marked as processing`)
    } catch (e) {
      toast.error('Payroll run failed: ' + (e.response?.data?.message || e.message))
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading payroll data...</div>
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--r600)' }}>Error: {error}</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="sec-tag">Finance</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Staff Payroll &amp; Payments</h2>
          <p style={{ color: 'var(--s500)', fontSize: 13.5 }}>Attendance · Off-hours · Article reads (KES 3) · Video uploads (KES 100). Process via M-Pesa or Bank Transfer.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-s btn-sm" onClick={() => toast.info('Exporting CSV...')}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button className="btn btn-p btn-sm" onClick={handleRunPayroll}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            Run Payroll
          </button>
        </div>
      </div>

      {/* Rate card */}
      <div className="rate-card" style={{ marginBottom: 20 }}>
        <div className="serif" style={{ fontSize: '1rem', color: '#fff', flexShrink: 0 }}>Pay Rates</div>
        {[['Daily Attendance','KES 1,500','#34D399'],['Off-Hours Session','KES 300','#FCD34D'],['Article Read','KES 3','#93C5FD'],['Video Upload','KES 100','#D8B4FE']].map(([l,v,c]) => (
          <div key={l} className="rate-item">
            <div className="rate-lbl">{l}</div>
            <div className="mono" style={{ fontSize: '1.4rem', color: c, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, flex: 1 }}>Staff Payroll — {selectedMonth}</div>
          <select className="fsel" style={{ width: 160 }} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            <option value="2026-04">April 2026</option>
            <option value="2026-03">March 2026</option>
            <option value="2026-02">February 2026</option>
            <option value="2026-01">January 2026</option>
          </select>
          <input className="fi" placeholder="Search staff..." style={{ width: 180 }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table className="tbl">
          <thead><tr><th></th><th>Teacher</th><th>Attendance</th><th>Off-Hours</th><th>Article Reads</th><th>Videos</th><th>Total Earnings</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {monthPayrolls.length > 0 ? monthPayrolls.map((p, i) => {
              const staffName = p.staffId?.firstName && p.staffId?.lastName 
                ? `${p.staffId.firstName} ${p.staffId.lastName}`
                : 'Unknown Staff'
              const init = (p.staffId?.firstName?.[0] || 'U') + (p.staffId?.lastName?.[0] || 'N')
              const colors = ['#3B82F6','#22C55E','#8B5CF6','#F59E0B','#EC4899']
              return (
                <tr key={p._id || i}>
                  <td><input type="checkbox" className="pay-row-check" /></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Av init={init} col={colors[i % 5]} /><span style={{ fontWeight: 700 }}>{staffName}</span></div></td>
                  <td className="mono" style={{ fontWeight: 700 }}>{p.attendance || 0}</td>
                  <td className="mono">{p.offHoursSessions || 0}</td>
                  <td className="mono">{(p.articlesRead || 0).toLocaleString()}</td>
                  <td className="mono">{p.videosUploaded || 0}</td>
                  <td><span className="mono" style={{ fontWeight: 700, color: 'var(--s900)' }}>KES {(p.totalPay || 0).toLocaleString()}</span></td>
                  <td>
                    <span className={p.status === 'Paid' ? 'sp-paid' : p.status === 'Processing' ? 'sp-processing' : 'sp-pending'}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-p btn-sm" onClick={() => handlePayNow(p._id, staffName)} disabled={p.status === 'Paid'}>
                      {p.status === 'Paid' ? 'Paid' : 'Pay Now'}
                    </button>
                  </td>
                </tr>
              )
            }) : (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: 'var(--s500)' }}>No payroll records found for {selectedMonth}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function ProgrammesPage({ toast }) {
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', country: '', fee: '', description: '', status: 'Active' })

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const res = await api.get('/programmes')
        setProgrammes(res.data.programmes || [])
        setLoading(false)
      } catch (e) {
        setError(e.response?.data?.message || e.message)
        setLoading(false)
      }
    }
    fetchProgrammes()
  }, [])

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openAdd = () => {
    setForm({ name: '', country: '', fee: '', description: '', status: 'Active' })
    setEditing(null)
    setAdding(true)
  }

  const openEdit = (p) => {
    setForm({ name: p.name, country: p.country || '', fee: p.fee || '', description: p.description || '', status: p.status })
    setEditing(p._id)
    setAdding(true)
  }

  const save = async () => {
    if (!form.name.trim()) { toast.error('Programme name is required'); return }
    try {
      if (editing) {
        const res = await api.patch('/programmes/' + editing, form)
        setProgrammes(prev => prev.map(p => p._id === editing ? res.data.programme : p))
        toast.ok(form.name + ' updated successfully')
      } else {
        const res = await api.post('/programmes', form)
        setProgrammes(prev => [...prev, res.data.programme])
        toast.ok(form.name + ' added — now visible to students')
      }
      setAdding(false)
    } catch (e) {
      toast.error('Save failed: ' + (e.response?.data?.message || e.message))
    }
  }

  const handleDelete = async (progId, progName) => {
    if (!confirm(`Delete programme "${progName}"? This cannot be undone.`)) return
    try {
      await api.delete('/programmes/' + progId)
      setProgrammes(prev => prev.filter(p => p._id !== progId))
      toast.ok(progName + ' deleted')
    } catch (e) {
      toast.error('Delete failed: ' + (e.response?.data?.message || e.message))
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading programmes...</div>
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--r600)' }}>Error: {error}</div>

  // Color mapping for icons
  const colors = ['var(--b700)', 'var(--p600)', 'var(--g600)', 'var(--a600)']
  const bgColors = ['var(--b50)', 'var(--p50)', 'var(--g50)', 'var(--a50)']

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div className="sec-tag">International Programmes</div>
        <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>IUFP &amp; <em style={{ color: 'var(--b700)' }}>Study Abroad</em></h2>
        <button className="btn btn-p" onClick={openAdd} style={{ marginTop: 12 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Programme
        </button>
      </div>

      {adding && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--b200)', borderWidth: 2 }}>
          <div className="chdr" style={{ marginBottom: 16 }}>
            <div className="ctitle">{editing ? 'Edit Programme' : 'Add New Programme'}</div>
            <button className="btn btn-g btn-sm" onClick={() => setAdding(false)}>Cancel</button>
          </div>
          <div className="fr2">
            <div className="fg"><label className="fl">Programme Name *</label><input className="fi" value={form.name} onChange={e => upd('name', e.target.value)} placeholder="e.g. IUFP Foundation Year" /></div>
            <div className="fg"><label className="fl">Country / Location</label><input className="fi" value={form.country} onChange={e => upd('country', e.target.value)} placeholder="e.g. UK, USA, Dubai" /></div>
          </div>
          <div className="fr2">
            <div className="fg"><label className="fl">Annual Fee</label><input className="fi" value={form.fee} onChange={e => upd('fee', e.target.value)} placeholder="e.g. 2400 or £18000" /></div>
            <div className="fg"><label className="fl">Status</label><select className="fsel" value={form.status} onChange={e => upd('status', e.target.value)}><option>Active</option><option>Inactive</option></select></div>
          </div>
          <div className="fg"><label className="fl">Description</label><textarea className="fi" style={{ minHeight: 80 }} value={form.description} onChange={e => upd('description', e.target.value)} placeholder="Programme details and benefits..." /></div>
          <button className="btn btn-ok" onClick={save}>Save Programme</button>
        </div>
      )}

      {programmes.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {programmes.map((p, i) => (
            <div key={p._id || i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, background: bgColors[i % 4], borderRadius: 'var(--rmd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={colors[i % 4]} strokeWidth="2" strokeLinecap="round">
                    <path d="M23 7 16 12l7 5V7z"/><path d="M1 7l15 5-15 5V7z"/>
                  </svg>
                </div>
                <StatusBadge s={p.status} />
              </div>
              <div className="serif" style={{ fontSize: 17, color: 'var(--s900)', marginBottom: 6 }}>{p.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--s400)', marginBottom: 12 }}>{p.country || 'N/A'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{(p.students?.length || 0).toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: 'var(--s400)' }}>Enrolled</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--b700)' }}>{p.fee || 'N/A'}</div>
                  <div style={{ fontSize: 10, color: 'var(--s400)' }}>Fee</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-g btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(p)}>Edit</button>
                <button className="btn btn-d btn-sm" onClick={() => handleDelete(p._id, p.name)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--s500)' }}>
          No programmes found. <button className="btn btn-p btn-sm" onClick={openAdd} style={{ marginLeft: 8 }}>Create one</button>
        </div>
      )}
    </>
  )
}

function GroupRoomsPage({ toast }) {
  const [rooms, setRooms] = useState([])
  const [curricula, setCurricula] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', subject: 'Mathematics', curriculum: '', grade: '', teacher: '', schedule: '', capacity: 10 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, currRes] = await Promise.all([
          api.get('/groupRooms'),
          api.get('/curriculum')
        ])
        setRooms(roomsRes.data.rooms || [])
        setCurricula(currRes.data.curricula || [])
        setLoading(false)
      } catch (e) {
        setError(e.response?.data?.message || e.message)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const resetForm = () => {
    setForm({ name: '', subject: 'Mathematics', curriculum: '', grade: '', teacher: '', schedule: '', capacity: 10 })
  }

  async function addRoom() {
    if (!form.name.trim()) { toast.error('Room name required'); return }
    if (!form.subject.trim()) { toast.error('Subject required'); return }
    try {
      const res = await api.post('/groupRooms', form)
      setRooms(prev => [...prev, res.data.room])
      toast.ok('Room "' + form.name + '" created — students can now join')
      setAdding(false)
      resetForm()
    } catch (e) {
      toast.error('Create failed: ' + (e.response?.data?.message || e.message))
    }
  }

  async function handleStatusToggle(roomId, roomName, currentStatus) {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
      const res = await api.patch('/groupRooms/' + roomId, { status: newStatus })
      setRooms(prev => prev.map(r => r._id === roomId ? res.data.room : r))
      toast.ok(roomName + ' ' + (newStatus === 'Active' ? 'activated' : 'deactivated'))
    } catch (e) {
      toast.error('Update failed: ' + (e.response?.data?.message || e.message))
    }
  }

  async function handleDelete(roomId, roomName) {
    if (!window.confirm('Delete ' + roomName + '?')) return
    try {
      await api.delete('/groupRooms/' + roomId)
      setRooms(prev => prev.filter(r => r._id !== roomId))
      toast.ok('Room deleted')
    } catch (e) {
      toast.error('Delete failed: ' + (e.response?.data?.message || e.message))
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading group rooms...</div>
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--r600)' }}>Error: {error}</div>

  const totalStudents = rooms.reduce((s, r) => s + (r.students?.length || 0), 0)
  const fullRooms = rooms.filter(r => (r.students?.length || 0) >= r.capacity).length
  const availableSeats = rooms.reduce((s, r) => s + (r.capacity - (r.students?.length || 0)), 0)

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div className="sec-tag">Group Learning System</div>
          <h2 className="serif" style={{ fontSize:24, color:'var(--s900)' }}>Class <em style={{ color:'var(--g600)' }}>Rooms</em></h2>
          <p style={{ fontSize:13, color:'var(--s500)', marginTop:4 }}>Each room holds max 10 students. Unlimited rooms per subject. Students assigned to rooms during registration.</p>
        </div>
        <button className="btn btn-p" onClick={() => { setAdding(a => !a); if (!adding) resetForm() }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {adding ? 'Cancel' : 'Create Room'}
        </button>
      </div>

      {adding && (
        <div className="card" style={{ marginBottom:20, borderColor:'var(--g200)', borderWidth:2 }}>
          <div className="ctitle" style={{ marginBottom:16 }}>New Class Room</div>
          <div className="fr2">
            <div className="fg"><label className="fl">Room Name *</label><input className="fi" value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="e.g. Mathematics A"/></div>
            <div className="fg"><label className="fl">Subject *</label><select className="fsel" value={form.subject} onChange={e=>upd('subject',e.target.value)}><option>Mathematics</option><option>Biology</option><option>Chemistry</option><option>Physics</option><option>English Language</option></select></div>
          </div>
          <div className="fr3">
            <div className="fg"><label className="fl">Curriculum</label><select className="fsel" value={form.curriculum} onChange={e=>upd('curriculum',e.target.value)}><option value="">Select curriculum...</option>{curricula.filter(c=>c.status==='Active').map(c=><option key={c._id} value={c.name}>{c.name}</option>)}</select></div>
            <div className="fg"><label className="fl">Grade / Year</label><input className="fi" value={form.grade} onChange={e=>upd('grade',e.target.value)} placeholder="e.g. Form 3"/></div>
            <div className="fg"><label className="fl">Capacity (max 10)</label><input className="fi" type="number" min="2" max="10" value={form.capacity} onChange={e=>upd('capacity',Math.min(10,parseInt(e.target.value)||10))}/></div>
          </div>
          <div className="fg"><label className="fl">Assigned Teacher</label><input className="fi" value={form.teacher} onChange={e=>upd('teacher',e.target.value)} placeholder="e.g. Mr. Muthomi"/></div>
          <div className="fg"><label className="fl">Schedule</label><input className="fi" value={form.schedule} onChange={e=>upd('schedule',e.target.value)} placeholder="Mon/Wed 9:00–10:00 AM"/></div>
          <button className="btn btn-ok" onClick={addRoom}>Create Room</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          ['Total Rooms', rooms.length, 'var(--b700)'],
          ['Total Students', totalStudents, 'var(--g600)'],
          ['Full Rooms', fullRooms, 'var(--r500)'],
          ['Available Seats', availableSeats, 'var(--a600)'],
        ].map(([l,v,c]) => (
          <div key={l} className="kpi">
            <div className="kpi-v mono" style={{ color:c }}>{v}</div>
            <div className="kpi-l">{l}</div>
          </div>
        ))}
      </div>

      {/* Rooms list */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {rooms.length > 0 ? rooms.map(room => {
          const enrolledCount = room.students?.length || 0
          const isFull = enrolledCount >= room.capacity
          return (
            <div key={room._id} className="card">
              <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{room.name}</div>
                    <span className={`badge ${room.status==='Active'?'badge-green':'badge-slate'}`}>{room.status}</span>
                    {isFull && <span className="badge badge-red">Full</span>}
                  </div>
                  <div style={{ fontSize:13, color:'var(--s500)', marginBottom:6 }}>{room.teacher} · {room.subject} · {room.curriculum} {room.grade} · {room.schedule}</div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ textAlign:'center', background:'var(--bg)', borderRadius:'var(--rmd)', padding:'8px 16px' }}>
                    <div className="mono" style={{ fontSize:20, fontWeight:700, color:isFull?'var(--r500)':'var(--g600)' }}>{enrolledCount}/{room.capacity}</div>
                    <div style={{ fontSize:10, color:'var(--s400)' }}>students</div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-s btn-sm" style={{ flex:1, justifyContent:'center' }} onClick={() => toast.ok('Managing: '+room.name)}>Manage</button>
                    <button className="btn btn-g btn-sm" onClick={() => handleStatusToggle(room._id, room.name, room.status)} style={{ color: room.status==='Active' ? 'var(--r500)' : 'var(--g600)' }}>
                      {room.status==='Active'?'Deactivate':'Activate'}
                    </button>
                    <button className="btn btn-d btn-sm" onClick={() => handleDelete(room._id, room.name)}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                    </button>
                  </div>
                </div>

                {/* Student chips */}
                {room.students && room.students.length > 0 && (
                  <div style={{ width:'100%', display:'flex', flexWrap:'wrap', gap:6, paddingTop:10, borderTop:'1px solid var(--border)' }}>
                    {room.students.map((student,si) => {
                      const cols = ['#3B82F6','#22C55E','#F59E0B','#8B5CF6','#EC4899','#14B8A6','#F97316','#06B6D4','#84CC16','#EF4444']
                      const name = typeof student === 'string' ? student : (student.firstName && student.lastName ? `${student.firstName} ${student.lastName}` : student.email || 'Student')
                      const init = name.split(' ').map(w=>w[0]).join('').slice(0,2)
                      return (
                        <div key={si} style={{ display:'flex', alignItems:'center', gap:5, background:cols[si%cols.length]+'15', border:'1px solid '+cols[si%cols.length]+'30', borderRadius:99, padding:'3px 10px', fontSize:12 }}>
                          <div style={{ width:18, height:18, borderRadius:'50%', background:cols[si%cols.length]+'20', color:cols[si%cols.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'JetBrains Mono,monospace', fontSize:9, fontWeight:700 }}>{init}</div>
                          <span style={{ color:'var(--s700)', fontWeight:500 }}>{name}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        }) : (
          <div className="empty">
            <h3>No class rooms yet</h3>
            <p>Create rooms and assign students to start group learning.</p>
          </div>
        )}
      </div>
    </>
  )
}

function LiveLessonsPage({ toast }) {
  const SESSIONS = [
    { subject:'Mathematics — Pythagoras Theorem', teacher:'Mr. Muthomi', class:'IGCSE Form 3', students:6, duration:'38 min', status:'live' },
    { subject:'Biology — Cell Division', teacher:'Dr. Ouma', class:'IGCSE Form 2', students:11, duration:'12 min', status:'live' },
    { subject:'English — Essay Writing', teacher:'Ms. Wambua', class:'A-Level Year 12', students:8, duration:'Starting in 28 min', status:'upcoming' },
    { subject:'Physics — Newton\'s Laws', teacher:'Mr. Njoroge', class:'IGCSE Form 4', students:0, duration:'Ended 14 min ago', status:'ended' },
  ]
  const statusStyle = { live: { color:'var(--r600)', bg:'var(--r50)', border:'var(--r100)', dot:'var(--r500)' }, upcoming: { color:'var(--b700)', bg:'var(--b50)', border:'var(--b200)', dot:'var(--b500)' }, ended: { color:'var(--s600)', bg:'var(--s100)', border:'var(--s200)', dot:'var(--s400)' } }
  return (
    <>
      <div style={{ marginBottom: 24 }}><div className="sec-tag">Real-Time</div><h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Live <em style={{ color: 'var(--b700)' }}>Lessons</em></h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[['Active Sessions','2','var(--r500)','var(--r50)'],['Total Students Now','17','var(--g600)','var(--g50)'],['Scheduled Today','8','var(--b700)','var(--b50)'],['Avg. Attendance','87%','var(--p600)','var(--p50)']].map(([l,v,c,bg]) => (
          <div key={l} className="kpi">
            <div className="kpi-ic" style={{ background: bg }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            </div>
            <div className="kpi-v" style={{ color: c }}>{v}</div>
            <div className="kpi-l">{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SESSIONS.map((s, i) => {
          const st = statusStyle[s.status]
          return (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 48, height: 48, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 'var(--rmd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={st.color} strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 3 }}>{s.subject}</div>
                <div style={{ fontSize: 12.5, color: 'var(--s500)' }}>{s.teacher} · {s.class} · {s.status === 'live' ? `${s.students} students attending` : s.status === 'upcoming' ? 'Scheduled' : 'Recording available'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 'var(--rmd)', padding: '6px 12px' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: st.dot, animation: s.status === 'live' ? 'pulse 2s infinite' : 'none' }} />
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: st.color }}>{s.duration}</span>
                </div>
                {s.status === 'live' && <button className="btn btn-d btn-sm" onClick={() => toast.info(`Monitoring ${s.subject}`)}>Monitor</button>}
                {s.status === 'ended' && <button className="btn btn-s btn-sm" onClick={() => toast.info('Loading recording...')}>Recording</button>}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}


