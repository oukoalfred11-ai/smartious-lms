import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../../../context/ctx.jsx'
import { useNavigate } from 'react-router-dom'
import { useToast, useAuth, api } from '../../../context/ctx.jsx'
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
const DEFAULT_USER_FORM = { firstName: '', lastName: '', email: '', role: 'Student', curriculum: '', plan: 'Basic', _id: null, subjects: [], grade: '', phone: '', bio: '', parentEmail: '', linkedStudents: [], teachingSpecialties: [] }

export default function AdminDashboard({ page: pageProp, onNav, onUserSaved, userStats = 0 }) {
   const nav = useNavigate()
   const toast = useToast()
   const [liveSessions, setLiveSessions] = useState(284)
   const [liveClasses, setLiveClasses] = useState(12)
   const [pendingModal, setPendingModal] = useState(false)
   const [userModal, setUserModal] = useState(false)
   const [userForm, setUserForm] = useState({ ...DEFAULT_USER_FORM })
   const [page, setPage] = useState(pageProp || 'dashboard')
   const [refreshKey, setRefreshKey] = useState(0)
   const [credentialsOverlay, setCredentialsOverlay] = useState(null) // PHASE 3-5: Credentials popup
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
     if (onUserSaved) onUserSaved()
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
       {page === 'users' && <UsersPage refreshKey={refreshKey} userStats={userStats} onAddUser={() => { setUserForm(resetForm()); setUserModal(true) }} onPending={() => setPendingModal(true)} toast={toast} setUserForm={setUserForm} setUserModal={setUserModal} />}
       {page === 'teachers' && <TeachersPage refreshKey={refreshKey} toast={toast} />}
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
       {page === 'leave' && <LeaveManagement />}

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
                   payload.subjects = userForm.subjects && userForm.subjects.length > 0 ? userForm.subjects : []
                 } else if (userForm.role === 'Teacher') {
                  // Handle curriculum as array for teachers
                  payload.curriculum = Array.isArray(userForm.curriculum) ? userForm.curriculum : (userForm.curriculum ? [userForm.curriculum] : [])
                  payload.subjects = userForm.subjects && userForm.subjects.length > 0 ? userForm.subjects : []
                  payload.teachingSpecialties = userForm.teachingSpecialties && userForm.teachingSpecialties.length > 0 ? userForm.teachingSpecialties : []
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
                 const response = await api.post('/users', payload)
                 // PHASE 3-5: Show credentials popup after successful creation
                 if (response.data.credentials) {
                   setCredentialsOverlay(response.data.credentials)
                 }
                 toast.ok(userForm.firstName + ' created successfully!')
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
  const auth = useAuth()
  const [now, setNow] = useState(new Date())
  const [stats, setStats] = useState({ totalUsers: 0, students: 0, teachers: 0, parents: 0, loading: true })
  const [pendingAllocs, setPendingAllocs] = useState(0)
  const [recentAllocs, setRecentAllocs] = useState([])
  const [mshauriPrompt, setMshauriPrompt] = useState('')

  // Admin name (graceful fallback)
  const adminFirstName = auth?.user?.firstName || (auth?.user?.name || '').split(' ')[0] || 'Alfred'
  const adminFullName = (auth?.user?.firstName && auth?.user?.lastName) ? auth.user.firstName + ' ' + auth.user.lastName : (auth?.user?.name || 'Alfred Ouko')

  // Time-aware greeting
  const greeting = (() => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  // Live clock — every 30s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  // Fetch users stats — graceful fallback
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats')
        const d = res.data || {}
        setStats({
          totalUsers: d.totalUsers || 0,
          students:   d.students   ?? d.totalStudents ?? 0,
          teachers:   d.teachers   ?? d.totalTeachers ?? 0,
          parents:    d.parents    ?? d.totalParents  ?? 0,
          loading:    false,
        })
      } catch (e) {
        // Graceful fallback to demo numbers if API unavailable
        setStats({ totalUsers: 2418, students: 2156, teachers: 127, parents: 894, loading: false })
      }
    }
    fetchStats()
  }, [])

  // Fetch pending allocations + recent allocations
  useEffect(() => {
    const fetchAllocs = async () => {
      try {
        const [pendRes, allRes] = await Promise.all([
          api.get('/allocations/pending-count'),
          api.get('/allocations'),
        ])
        setPendingAllocs(pendRes.data.pendingCount || 0)
        const allocs = (allRes.data.allocations || []).slice(0, 4)
        setRecentAllocs(allocs)
      } catch (e) {
        setPendingAllocs(0)
        setRecentAllocs([])
      }
    }
    fetchAllocs()
    const id = setInterval(fetchAllocs, 5000)
    return () => clearInterval(id)
  }, [])

  // RIGHT-NOW logic — picks single highest-priority item
  const rightNow = (() => {
    if (pendingAllocs > 0) {
      return {
        urgency: 'critical',
        label:   'NEEDS ATTENTION',
        title:   pendingAllocs + ' student' + (pendingAllocs === 1 ? '' : 's') + ' awaiting allocation',
        sub:     'Subjects + curricula matched but no teacher assigned yet',
        action:  'Open Allocations',
        nav:     'allocations',
        bg:      'var(--r700)',
        accent:  'var(--r50)',
      }
    }
    if (liveClasses > 0) {
      return {
        urgency: 'live',
        label:   'LIVE NOW',
        title:   liveClasses + ' live class' + (liveClasses === 1 ? '' : 'es') + ' running',
        sub:     liveSessions + ' active sessions across the platform right now',
        action:  'View Live Lessons',
        nav:     'livelessons',
        bg:      'var(--b700)',
        accent:  'var(--b50)',
      }
    }
    return {
      urgency: 'good',
      label:   'ALL CLEAR',
      title:   'School running smoothly',
      sub:     stats.students.toLocaleString() + ' students · ' + stats.teachers + ' teachers · all systems normal',
      action:  'View Analytics',
      nav:     'analytics',
      bg:      'var(--g700)',
      accent:  'var(--g50)',
    }
  })()

  const askMshauri = () => {
    if (!mshauriPrompt.trim()) {
      onNav('ai')
      return
    }
    // Stash prompt for AI Console to pick up
    try { localStorage.setItem('sm_mshauri_pending_prompt', mshauriPrompt.trim()) } catch {}
    onNav('ai')
  }

  const fmtTime = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
  const fmtDate = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      {/* GREETING ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
            {fmtDate(now)} · {fmtTime(now)}
          </div>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 400, color: 'var(--s900)', margin: 0, lineHeight: 1.15 }}>
            {greeting}, <em style={{ color: 'var(--b700)' }}>{adminFirstName}</em>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s500)', marginTop: 4 }}>
            Smartious Homeschool · Founder &amp; Admin
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontSize: 12.5, color: 'var(--s500)', background: 'var(--bg)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 99, display: 'flex', gap: 10 }}>
            <span><strong style={{ color: 'var(--s900)' }}>{store.articles.filter(a => a.status === 'Published').length}</strong> articles</span>
            <span style={{ opacity: .3 }}>|</span>
            <span><strong style={{ color: 'var(--s900)' }}>{store.resources.length}</strong> resources</span>
            <span style={{ opacity: .3 }}>|</span>
            <span><strong style={{ color: 'var(--s900)' }}>{store.messages.filter(m => !m.read).length}</strong> unread</span>
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

      {/* RIGHT-NOW HERO */}
      <div style={{
        background: 'linear-gradient(135deg, ' + rightNow.bg + ' 0%, ' + rightNow.bg + 'EE 100%)',
        color: '#fff',
        borderRadius: 'var(--rxl, 16px)',
        padding: '24px 28px',
        marginBottom: 18,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(0,0,0,.12)',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: rightNow.accent, opacity: .2, pointerEvents: 'none' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 800, letterSpacing: '.12em',
              color: rightNow.accent, marginBottom: 8,
            }}>
              {(rightNow.urgency === 'critical' || rightNow.urgency === 'live') && (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: rightNow.accent, animation: 'pulse 1.5s infinite' }}/>
              )}
              {rightNow.label}
            </div>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.2 }}>{rightNow.title}</h2>
            <div style={{ fontSize: 14, opacity: .9, marginTop: 6 }}>{rightNow.sub}</div>
          </div>
          <button onClick={() => onNav(rightNow.nav)} style={{
            background: rightNow.accent, color: rightNow.bg,
            border: 'none', padding: '12px 22px', borderRadius: 'var(--rmd, 10px)',
            fontSize: 13.5, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0,
          }}>
            {rightNow.action}
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="kpi-row">
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => onNav('users')}>
          <div className="kpi-ic" style={{ background: 'var(--b50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="kpi-v">{stats.loading ? '—' : stats.students.toLocaleString()}</div>
          <div className="kpi-l">Total Students</div>
          <div className="kpi-d" style={{ color: 'var(--g600)' }}>↑ {Math.max(1, Math.floor(stats.students * 0.02))} this month</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => onNav('teachers')}>
          <div className="kpi-ic" style={{ background: 'var(--g50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round"><path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/></svg>
          </div>
          <div className="kpi-v">{stats.loading ? '—' : stats.teachers}</div>
          <div className="kpi-l">Active Teachers</div>
          <div className="kpi-d" style={{ color: 'var(--g600)' }}>↑ +6 this month</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => onNav('billing')}>
          <div className="kpi-ic" style={{ background: 'var(--a50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="kpi-v mono" style={{ fontSize: 20 }}>3.48M</div>
          <div className="kpi-l">Revenue KES (Feb)</div>
          <div className="kpi-d" style={{ color: 'var(--g600)' }}>↑ +12% vs Jan</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer', borderColor: pendingAllocs > 0 ? 'var(--r100)' : undefined }} onClick={() => onNav('allocations')}>
          <div className="kpi-ic" style={{ background: pendingAllocs > 0 ? 'var(--r50)' : 'var(--p50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={pendingAllocs > 0 ? 'var(--r700)' : 'var(--p600)'} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          </div>
          <div className="kpi-v" style={{ color: pendingAllocs > 0 ? 'var(--r700)' : undefined }}>{pendingAllocs}</div>
          <div className="kpi-l">Pending Allocations</div>
          <div className="kpi-d" style={{ color: pendingAllocs > 0 ? 'var(--r600)' : 'var(--g600)' }}>{pendingAllocs > 0 ? 'Awaiting your review' : 'All caught up'}</div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Revenue chart */}
          <div className="card">
            <div className="chdr">
              <div className="ctitle">Monthly Revenue (KES, millions)</div>
              <span className="badge" style={{ color: 'var(--g700)', borderColor: 'var(--g100)', background: 'var(--g50)' }}>+12% MoM</span>
            </div>
            <BarChart data={REV_DATA}/>
          </div>

          {/* Today's operations + Recent allocations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="card">
              <div className="ctitle" style={{ marginBottom: 14 }}>Live Platform Now</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Active sessions',         liveSessions,           'var(--b700)'],
                  ['Live classes running',    liveClasses,            'var(--r500)'],
                  ['Lessons completed today', '1,847',                'var(--g600)'],
                  ['Exams submitted today',   203,                    'var(--s800)'],
                  ['New enrolments today',    7,                      'var(--g600)'],
                  ['Revenue today',           'KES 48,500',           'var(--b700)'],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                    <span style={{ color: 'var(--s500)' }}>{l}</span>
                    <span className="mono" style={{ fontWeight: 700, color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="chdr" style={{ marginBottom: 14 }}>
                <div className="ctitle">Recent Allocations</div>
                <button className="btn btn-g btn-sm" onClick={() => onNav('allocations')}>View all</button>
              </div>
              {recentAllocs.length === 0 ? (
                <div style={{ fontSize: 12.5, color: 'var(--s400)', padding: 16, textAlign: 'center', fontStyle: 'italic' }}>
                  No recent allocations
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentAllocs.map(a => (
                    <div key={a._id || a.id} style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 'var(--rsm, 6px)', borderLeft: '3px solid var(--b700)' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--s900)' }}>
                        {a.studentId?.firstName || '—'} {a.studentId?.lastName || ''}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 2 }}>
                        {a.subjectId?.subjectName || '—'} · {a.curriculum || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enrolment by service */}
          <div className="card">
            <div className="chdr">
              <div className="ctitle">Enrolment by Service</div>
              <button className="btn btn-g btn-sm" onClick={() => onNav('analytics')}>Analytics →</button>
            </div>
            <ProgRow label="Homeschool — At Home"  val={842} pct={35} col="var(--b700)"/>
            <ProgRow label="Homeschool — Centre"   val={614} pct={25} col="var(--b500)"/>
            <ProgRow label="Homeschool — Virtual"  val={521} pct={22} col="#93C5FD"/>
            <ProgRow label="Virtual School"        val={304} pct={13} col="var(--g600)"/>
            <ProgRow label="Tuition"               val={137} pct={6}  col="var(--a600)"/>
          </div>

          {/* Top teachers leaderboard */}
          <div className="card">
            <div className="chdr">
              <div className="ctitle">Top Teachers (by student count)</div>
              <button className="btn btn-g btn-sm" onClick={() => onNav('teachers')}>View all</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TEACHERS.slice(0, 4).map((t, i) => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--s400)', width: 22 }}>#{i + 1}</div>
                  <Av init={t.init} col={t.col} size={32}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--s900)' }}>{t.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>{t.subj}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--b700)' }}>{t.stu}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--s400)' }}>students · ★ {t.rat}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* MSHAURI quick-access */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #7D1025 0%, #5A0B1B 100%)', color: '#fff', border: 'none', position: 'relative', overflow: 'hidden' }}>
            <div className="chdr">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(201, 160, 48, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#F0CC5A" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <div className="ctitle" style={{ color: 'rgba(255,255,255,.9)' }}>Mshauri AI</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#F0CC5A' }}>● ONLINE</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.6, marginBottom: 12 }}>
              Ask anything — generate questions, explain concepts, draft messages.
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                value={mshauriPrompt}
                onChange={e => setMshauriPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') askMshauri() }}
                placeholder="Try: explain Pythagoras..."
                style={{
                  flex: 1, padding: '9px 12px',
                  background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
                  borderRadius: 'var(--rsm, 6px)', color: '#fff', fontSize: 12.5,
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
              <button onClick={askMshauri} style={{
                background: '#C9A030', color: '#3D0810', border: 'none',
                padding: '9px 14px', borderRadius: 'var(--rsm, 6px)',
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                boxShadow: '0 2px 8px rgba(201, 160, 48, 0.3)',
              }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Ask
              </button>
            </div>
            <div style={{ marginTop: 10, fontSize: 10.5, color: 'rgba(255,255,255,.4)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Model: claude-sonnet-4</span>
              <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onNav('ai')}>Open full console →</span>
            </div>
          </div>

          {/* System alerts */}
          <div className="card">
            <div className="chdr" style={{ marginBottom: 14 }}>
              <div className="ctitle">System Alerts</div>
              <span className="badge" style={{ color: 'var(--r600)', borderColor: 'var(--r100)', background: 'var(--r50)' }}>2 Active</span>
            </div>
            <div style={{ background: 'var(--r50)', border: '1px solid var(--r100)', borderRadius: 'var(--rmd)', padding: 13, marginBottom: 10, display: 'flex', gap: 10 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--r600)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--r600)' }}>Disk Usage: 78%</div>
                <div style={{ fontSize: 12, color: 'var(--s600)', marginTop: 2 }}>Archive recordings to free space</div>
                <button className="btn btn-d btn-sm" style={{ marginTop: 8 }} onClick={() => onNav('settings')}>Fix Now</button>
              </div>
            </div>
            <div style={{ background: 'var(--a50)', border: '1px solid var(--a100)', borderRadius: 'var(--rmd)', padding: 13, display: 'flex', gap: 10 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--a600)' }}>5 Pending Approvals</div>
                <div style={{ fontSize: 12, color: 'var(--s600)', marginTop: 2 }}>New student registrations</div>
                <button className="btn btn-am btn-sm" style={{ marginTop: 8 }} onClick={onPending}>Review</button>
              </div>
            </div>
          </div>

          {/* By curriculum */}
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 14 }}>By Curriculum</div>
            {[['IGCSE',894,100,'var(--b700)'],['British',612,68,'var(--g600)'],['IB Diploma',387,43,'var(--p600)'],['CBC/KCSE',341,38,'var(--a600)'],['American',184,21,'var(--t600)']].map(([n,v,p,c]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--s700)', flex: 1, minWidth: 80 }}>{n}</span>
                <div style={{ flex: 2 }}><div className="prog"><div className="prog-f" style={{ width: p + '%', background: c }}/></div></div>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--s800)', width: 32, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Approve Users',   page: 'users',       icon: 'M9 11l3 3L22 4|M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
                { label: 'Allocate',        page: 'allocations', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z|line:19:8:19:14|line:22:11:16:11' },
                { label: 'Curriculum',      page: 'curriculum',  icon: 'M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13|M4 19a2 2 0 0 0 2 2h14|line:8:10:16:10' },
                { label: 'Edit Site',       page: 'website',     icon: 'circle:12:12:10|line:2:12:22:12|M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10' },
                { label: 'Send Message',    page: 'users',       icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
                { label: 'AI Console',      page: 'ai',          icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
              ].map(q => (
                <button key={q.label} onClick={() => onNav(q.page)} className="btn btn-s" style={{ flexDirection: 'column', gap: 6, padding: '10px 8px', fontSize: 11.5, height: 'auto' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round">
                    {q.icon.split('|').map((p, i) => {
                      if (p.startsWith('line:')) { const [,x1,y1,x2,y2] = p.split(':'); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}/> }
                      if (p.startsWith('circle:')) { const [,cx,cy,r] = p.split(':'); return <circle key={i} cx={cx} cy={cy} r={r}/> }
                      return <path key={i} d={p}/>
                    })}
                  </svg>
                  <span>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TRENDS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 18 }}>
        {[
          { label: 'Enrolment Trend',   value: stats.students.toLocaleString(),  suffix: ' students', trend: GROWTH_DATA.map(d => d.v),                       color: 'var(--b700)' },
          { label: 'Revenue (KES, M)',  value: '3.48',                            suffix: 'M / month', trend: REV_DATA.map(d => d.v),                          color: 'var(--g600)' },
          { label: 'Active Teachers',   value: stats.teachers,                    suffix: '',          trend: [108, 112, 115, 118, 121, stats.teachers || 127], color: 'var(--p600)' },
          { label: 'Platform Uptime',   value: '99.4',                            suffix: '%',         trend: [99.1, 99.3, 99.2, 99.5, 99.4, 99.4],            color: 'var(--g600)' },
        ].map(card => (
          <div key={card.label} className="card" style={{ padding: 16 }}>
            <div className="ctitle" style={{ fontSize: 10.5, marginBottom: 6 }}>{card.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</span>
              {card.suffix && <span style={{ fontSize: 12, color: 'var(--s500)' }}>{card.suffix}</span>}
            </div>
            <svg width="100%" height="36" viewBox="0 0 200 36" preserveAspectRatio="none">
              {(() => {
                const max = Math.max(...card.trend, 1)
                const min = Math.min(...card.trend, 0)
                const range = max - min || 1
                const pts = card.trend.map((v, i) => {
                  const x = (i / (card.trend.length - 1)) * 200
                  const y = 34 - ((v - min) / range) * 30
                  return x + ',' + y
                }).join(' ')
                return (
                  <>
                    <polyline points={pts} fill="none" stroke={card.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    {card.trend.map((v, i) => {
                      const x = (i / (card.trend.length - 1)) * 200
                      const y = 34 - ((v - min) / range) * 30
                      return <circle key={i} cx={x} cy={y} r={i === card.trend.length - 1 ? 3 : 1.5} fill={card.color}/>
                    })}
                  </>
                )
              })()}
            </svg>
          </div>
        ))}
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

function UsersPage({ refreshKey, userStats, onAddUser, onPending, toast, setUserForm, setUserModal, setCredentialsOverlay }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')        // all | student | teacher | parent | admin
  const [statusFilter, setStatusFilter] = useState('all')    // all | active | pending | suspended
  const [planFilter, setPlanFilter] = useState('all')

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

  // ── COMPUTED COUNTS ────────────────────────────────
  const counts = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    parents: users.filter(u => u.role === 'parent').length,
    admins: users.filter(u => u.role === 'admin').length,
    pendingLogin: users.filter(u => u.mustChangePassword).length,
    active: users.filter(u => u.isActive !== false && !u.mustChangePassword).length,
    suspended: users.filter(u => u.isActive === false).length,
  }

  // ── DETERMINISTIC AVATAR COLORS (uses crimson palette) ──
  const avColor = (name) => {
    const tokens = ['var(--crimson, #7D1025)', '#A51C2E', '#C9A030', 'var(--g600)', 'var(--p600)', 'var(--t600)']
    let hash = 0
    for (let i = 0; i < (name || '').length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
    return tokens[Math.abs(hash) % tokens.length]
  }

  // ── FILTERED ROWS ──────────────────────────────────
  const filtered = users.filter(u => {
    if (search) {
      const q = search.toLowerCase()
      const matches = (u.firstName || '').toLowerCase().includes(q) ||
                      (u.lastName || '').toLowerCase().includes(q) ||
                      (u.email || '').toLowerCase().includes(q)
      if (!matches) return false
    }

    if (roleFilter !== 'all' && u.role !== roleFilter) return false

    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && !u.mustChangePassword) return false
      if (statusFilter === 'active' && (u.mustChangePassword || u.isActive === false)) return false
      if (statusFilter === 'suspended' && u.isActive !== false) return false
    }

    if (planFilter !== 'all' && (u.plan || 'Basic') !== planFilter) return false

    return true
  })

  // ── ACTIONS ────────────────────────────────────────
  const handleEdit = (u) => {
    setUserForm({
      firstName: u.firstName, lastName: u.lastName, email: u.email,
      role: u.role, curriculum: u.curriculum || '', plan: u.plan || 'Basic',
      _id: u._id, subjects: u.subjects || [], grade: u.grade || '',
      phone: u.phone || '', bio: u.bio || '', parentEmail: u.parentEmail || '',
      linkedStudents: u.linkedStudents || [], teachingSpecialties: u.teachingSpecialties || []
    })
    setUserModal(true)
  }

  const handleDelete = async (u) => {
    if (!confirm(`Delete ${u.firstName} ${u.lastName} permanently? This cannot be undone.`)) return
    try {
      await api.delete('/users/' + u._id)
      setUsers(prev => prev.filter(x => x._id !== u._id))
      toast.ok(`${u.firstName} deleted`)
    } catch (e) {
      toast.error('Delete failed: ' + (e.response?.data?.message || e.message))
    }
  }

  // ── LOADING / ERROR STATES ─────────────────────────
  if (loading) {
    return (
      <>
        <div style={{ marginBottom: 18 }}>
          <div className="sec-tag">Accounts</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>User <em style={{ color: 'var(--b700)' }}>Management</em></h2>
        </div>
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--s500)', fontSize: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Loading</div>
          Fetching all users from your backend...
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div style={{ marginBottom: 18 }}>
          <div className="sec-tag">Accounts</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>User <em style={{ color: 'var(--b700)' }}>Management</em></h2>
        </div>
        <div className="card" style={{ padding: 24, background: 'var(--r50)', borderColor: 'var(--r100)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--r700)', marginBottom: 6 }}>Failed to load users</div>
          <div style={{ fontSize: 12, color: 'var(--r600)', marginBottom: 12 }}>{error}</div>
          <button className="btn btn-r btn-sm" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="sec-tag">Accounts</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>User <em style={{ color: 'var(--b700)' }}>Management</em></h2>
          <p style={{ color: 'var(--s500)', fontSize: 13.5, marginTop: 3 }}>Add, edit, suspend, or delete platform users · Students · Teachers · Parents · Admins</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {counts.pendingLogin > 0 && (
            <button className="btn btn-am btn-sm" onClick={() => setStatusFilter('pending')}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
              {counts.pendingLogin} Pending First Login
            </button>
          )}
          <button className="btn btn-s btn-sm" onClick={() => toast.info('Exporting CSV...')}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button className="btn btn-p btn-sm" onClick={onAddUser}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add User
          </button>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="kpi-row">
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => setRoleFilter('all')}>
          <div className="kpi-ic" style={{ background: 'var(--b50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="kpi-v">{counts.total}</div>
          <div className="kpi-l">Total Users</div>
          <div className="kpi-d" style={{ color: 'var(--s500)' }}>All roles combined</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => setRoleFilter('student')}>
          <div className="kpi-ic" style={{ background: 'var(--b50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div className="kpi-v">{counts.students}</div>
          <div className="kpi-l">Students</div>
          <div className="kpi-d" style={{ color: 'var(--s500)' }}>Click to filter</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => setRoleFilter('teacher')}>
          <div className="kpi-ic" style={{ background: 'var(--g50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round"><path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/></svg>
          </div>
          <div className="kpi-v">{counts.teachers}</div>
          <div className="kpi-l">Teachers</div>
          <div className="kpi-d" style={{ color: 'var(--s500)' }}>Click to filter</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => setRoleFilter('parent')}>
          <div className="kpi-ic" style={{ background: 'var(--p50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--p600)" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="kpi-v">{counts.parents}</div>
          <div className="kpi-l">Parents</div>
          <div className="kpi-d" style={{ color: 'var(--s500)' }}>Click to filter</div>
        </div>
        <div className="kpi" style={{ cursor: counts.pendingLogin > 0 ? 'pointer' : 'default', borderColor: counts.pendingLogin > 0 ? 'var(--a100)' : undefined }} onClick={() => counts.pendingLogin > 0 && setStatusFilter('pending')}>
          <div className="kpi-ic" style={{ background: counts.pendingLogin > 0 ? 'var(--a50)' : 'var(--s100)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={counts.pendingLogin > 0 ? 'var(--a600)' : 'var(--s500)'} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="kpi-v" style={{ color: counts.pendingLogin > 0 ? 'var(--a600)' : undefined }}>{counts.pendingLogin}</div>
          <div className="kpi-l">Pending Login</div>
          <div className="kpi-d" style={{ color: counts.pendingLogin > 0 ? 'var(--a600)' : 'var(--g600)' }}>
            {counts.pendingLogin > 0 ? 'Need first login' : 'All onboarded'}
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="ctitle" style={{ marginRight: 4 }}>Role:</span>
          {[
            { id: 'all',     label: 'All',      count: counts.total },
            { id: 'student', label: 'Students', count: counts.students },
            { id: 'teacher', label: 'Teachers', count: counts.teachers },
            { id: 'parent',  label: 'Parents',  count: counts.parents },
            { id: 'admin',   label: 'Admins',   count: counts.admins },
          ].map(chip => (
            <button key={chip.id} onClick={() => setRoleFilter(chip.id)}
              style={{
                background: roleFilter === chip.id ? 'var(--crimson, #7D1025)' : 'var(--bg)',
                color: roleFilter === chip.id ? '#fff' : 'var(--s700)',
                border: '1px solid ' + (roleFilter === chip.id ? 'transparent' : 'var(--border)'),
                padding: '6px 12px', borderRadius: 99,
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all .15s',
              }}>
              {chip.label}
              <span style={{
                background: roleFilter === chip.id ? 'rgba(255,255,255,.2)' : 'var(--s100)',
                color: roleFilter === chip.id ? '#fff' : 'var(--s600)',
                padding: '1px 7px', borderRadius: 99, fontSize: 11, fontWeight: 700,
              }}>{chip.count}</span>
            </button>
          ))}

          <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 4px' }}/>

          <select className="fsel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: 12.5, fontWeight: 600 }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending First Login</option>
            <option value="suspended">Suspended</option>
          </select>

          <select className="fsel" value={planFilter} onChange={e => setPlanFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: 12.5, fontWeight: 600 }}>
            <option value="all">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Premium">Premium</option>
            <option value="IGCSE Pack">IGCSE Pack</option>
            <option value="Staff">Staff</option>
          </select>

          <input className="fi" placeholder="Search name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: 220, marginLeft: 'auto' }}/>
        </div>
      </div>

      {/* TABLE */}
      {users.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--s600)', fontWeight: 600 }}>No users yet</div>
          <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 6 }}>Click "Add User" to create the first account</div>
          <button className="btn btn-p btn-sm" style={{ marginTop: 14 }} onClick={onAddUser}>Add First User</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--s600)', fontWeight: 600 }}>No users match your filters</div>
          <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 6 }}>Showing 0 of {users.length} users</div>
          <button className="btn btn-s btn-sm" style={{ marginTop: 14 }} onClick={() => { setRoleFilter('all'); setStatusFilter('all'); setPlanFilter('all'); setSearch('') }}>Clear all filters</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--s700)' }}>
              {filtered.length} of {users.length} users
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--s400)' }}>
              Click a user's <strong>Edit</strong> button to modify their profile
            </div>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table className="tbl" style={{ minWidth: 1000 }}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Curriculum</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th style={{ width: 140, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const fullName = (u.firstName || '') + ' ' + (u.lastName || '')
                  const initials = ((u.firstName?.[0] || '?') + (u.lastName?.[0] || '')).toUpperCase()
                  const isPending = u.mustChangePassword
                  const isSuspended = u.isActive === false

                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Av init={initials} col={avColor(fullName)} size={36}/>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>{fullName.trim() || 'Unnamed'}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--s400)' }}>{u.email || 'No email'} · {u._id?.slice(-6) || 'ID'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ color: 'var(--b700)', borderColor: 'var(--b100)', background: 'var(--b50)', textTransform: 'capitalize' }}>{u.role}</span>
                      </td>
                      <td style={{ color: 'var(--s500)', maxWidth: 150, whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 13 }}>
                        {Array.isArray(u.curriculum) ? u.curriculum.join(', ') : (u.curriculum || 'N/A')}
                      </td>
                      <td><PlanBadge p={u.plan || 'Basic'} /></td>
                      <td>
                        {isSuspended ? (
                          <span className="badge" style={{ color: 'var(--r700)', borderColor: 'var(--r100)', background: 'var(--r50)' }}>Suspended</span>
                        ) : isPending ? (
                          <span className="badge" style={{ color: 'var(--a600)', borderColor: 'var(--a100)', background: 'var(--a50)' }}>Pending Login</span>
                        ) : (
                          <span className="badge" style={{ color: 'var(--g700)', borderColor: 'var(--g100)', background: 'var(--g50)' }}>Active</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--s400)', fontSize: 13 }}>{u.lastActive || 'Never'}</td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button className="btn btn-g btn-sm" onClick={() => handleEdit(u)}>Edit</button>
                          <button className="btn btn-d btn-sm" onClick={() => handleDelete(u)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

function TeachersPage({ refreshKey, toast }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [teacherDetailsLoading, setTeacherDetailsLoading] = useState(false)

    useEffect(() => {
      const fetchTeachers = async () => {
        try {
          const res = await api.get('/users/teachers/list')
          console.log('Teachers API response:', res.data.teachers)
          setTeachers(res.data.teachers || [])
          setLoading(false)
        } catch (e) {
          setError(e.response?.data?.message || e.message)
          setLoading(false)
        }
      }
      fetchTeachers()
    }, [refreshKey])

  const calculateDuration = (createdAt) => {
    if (!createdAt) return 'N/A'
    const start = new Date(createdAt)
    const now = new Date()
    
    let years = now.getFullYear() - start.getFullYear()
    let months = now.getMonth() - start.getMonth()
    let days = now.getDate() - start.getDate()
    
    // Adjust for negative days
    if (days < 0) {
      months--
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      days += prevMonth.getDate()
    }
    
    // Adjust for negative months
    if (months < 0) {
      years--
      months += 12
    }
    
    // Format output
    const parts = []
    if (years > 0) parts.push(`${years}y`)
    if (months > 0) parts.push(`${months}mo`)
    if (days > 0) parts.push(`${days}d`)
    
    if (parts.length === 0) return 'New'
    return parts.join(' ')
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

   const handleViewDetails = async (teacher) => {
     setSelectedTeacher(teacher)
     setTeacherDetailsLoading(true)
     // Details will be shown in the modal
     setTeacherDetailsLoading(false)
   }

   const handleToggleTeacherLeave = async (teacher) => {
     try {
       const newLeaveStatus = !teacher.isOnLeave
       const res = await api.patch(`/users/${teacher._id}/leave`, {
         isOnLeave: newLeaveStatus,
         leaveStartDate: newLeaveStatus ? new Date() : null
       })
       
       // Update teacher in list
       setTeachers(prev => prev.map(t => 
         t._id === teacher._id ? {...t, ...res.data.user} : t
       ))
       
       // Update selected teacher modal
       if (selectedTeacher && selectedTeacher._id === teacher._id) {
         setSelectedTeacher({...selectedTeacher, ...res.data.user})
       }
       
       toast.ok(res.data.message || 'Leave status updated')
     } catch (e) {
       toast.error('Failed to update leave status: ' + (e.response?.data?.message || e.message))
     }
   }

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading teachers...</div>
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--r600)' }}>Error: {error}</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div><div className="sec-tag">Faculty</div><h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Teacher <em style={{ color: 'var(--b700)' }}>Management</em></h2></div>
      </div>
       <div className="card" style={{ padding: 0, overflow: 'auto', maxWidth: '100%' }}>
         <table className="tbl" style={{ minWidth: '1400px' }}>
           <thead><tr><th>Teacher</th><th>Subjects</th><th>Date Joined</th><th>Duration</th><th>Status</th><th>Leave</th><th style={{ width: '100px', textAlign: 'center' }}>Actions</th></tr></thead>
           <tbody>
             {teachers.map((t, i) => (
               <tr key={t._id || i} style={{ background: t.isOnLeave ? 'var(--r50)' : i % 2 === 0 ? '#fff' : 'var(--s50)' }}>
                 <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Av init={(t.firstName[0] + t.lastName[0]).toUpperCase()} col={['#3B82F6','#22C55E','#8B5CF6','#F59E0B','#EC4899'][i % 5]} size={34} /><span style={{ fontWeight: 700, color: 'var(--s900)' }}>{t.firstName} {t.lastName}</span></div></td>
                <td style={{ color: 'var(--s500)', fontSize: 13, maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  {t.subjects && t.subjects.length > 0 
                    ? t.subjects.map(s => typeof s === 'string' ? s : s.subjectName || 'Subject').join(' · ')
                    : 'N/A'}
                </td>
                 <td style={{ color: 'var(--s500)', fontSize: 13 }}>{formatDate(t.createdAt)}</td>
                 <td style={{ color: 'var(--s500)', fontSize: 13 }}>{calculateDuration(t.createdAt)}</td>
                 <td><StatusBadge s={t.status} /></td>
                 <td>
                   {t.isOnLeave ? (
                     <span className="badge" style={{ color: 'var(--r700)', background: 'var(--r50)', borderColor: 'var(--r100)' }}>
                       On Leave
                     </span>
                   ) : (
                     <span style={{ color: 'var(--s400)', fontSize: 12 }}>Active</span>
                   )}
                 </td>
                 <td style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '100px' }}>
                   <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                     <button className="btn btn-b btn-sm" onClick={() => handleViewDetails(t)}>View</button>
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>

      {/* Teacher Details Modal */}
      <Modal open={!!selectedTeacher} onClose={() => setSelectedTeacher(null)} title={selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName} - Details` : 'Teacher Details'} size="lg">
        {selectedTeacher && (
          <div>
            <div style={{ background: 'var(--s50)', border: '1px solid var(--s200)', borderRadius: 'var(--rmd)', padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase' }}>Email</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s900)' }}>{selectedTeacher.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase' }}>Phone</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s900)' }}>{selectedTeacher.phone || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase' }}>Date Joined</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s900)' }}>{formatDate(selectedTeacher.createdAt)}</div>
                </div>
                 <div>
                   <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase' }}>Duration</div>
                   <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s900)' }}>{calculateDuration(selectedTeacher.createdAt)}</div>
                 </div>
                 <div>
                   <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase' }}>Leave Status</div>
                   <div style={{ fontSize: 14, fontWeight: 600, color: selectedTeacher.isOnLeave ? 'var(--r700)' : 'var(--g700)' }}>
                     {selectedTeacher.isOnLeave ? '🔴 On Leave' : '🟢 Active'}
                   </div>
                 </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--s900)', marginBottom: 10 }}>Subjects Teaching</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 ? (
                  selectedTeacher.subjects.map((s, idx) => (
                    <span key={idx} className="badge" style={{ color: 'var(--b700)', borderColor: 'var(--b100)', background: 'var(--b50)' }}>
                      {typeof s === 'string' ? s : s.subjectName || 'Subject'}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--s400)' }}>No subjects assigned</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--s900)', marginBottom: 10 }}>Teaching Statistics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'var(--b50)', border: '1px solid var(--b100)', borderRadius: 'var(--rmd)', padding: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--s500)', fontWeight: 600 }}>Total Students</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--b700)' }}>{selectedTeacher.totalStudents || 0}</div>
                </div>
                <div style={{ background: 'var(--g50)', border: '1px solid var(--g100)', borderRadius: 'var(--rmd)', padding: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--s500)', fontWeight: 600 }}>Total Sessions</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--g700)' }}>{selectedTeacher.totalSessions || 0}</div>
                </div>
              </div>
            </div>

             {selectedTeacher.bio && (
               <div>
                 <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--s900)', marginBottom: 8 }}>Bio</div>
                 <div style={{ fontSize: 13, color: 'var(--s600)', lineHeight: 1.5 }}>{selectedTeacher.bio}</div>
               </div>
             )}

             <div style={{ marginTop: 20, borderTop: '1px solid var(--s200)', paddingTop: 16 }}>
               <button 
                 className={selectedTeacher.isOnLeave ? 'btn btn-g btn-sm' : 'btn btn-r btn-sm'}
                 onClick={() => handleToggleTeacherLeave(selectedTeacher)}
               >
                 {selectedTeacher.isOnLeave ? '✓ Return from Leave' : '⏸ Set On Leave'}
               </button>
             </div>
          </div>
        )}
      </Modal>
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

  // Pick up prefilled prompt from Dashboard quick-ask card
  useEffect(() => {
    try {
      const pending = localStorage.getItem('sm_mshauri_pending_prompt')
      if (pending && pending.trim()) {
        setInp(pending)
        localStorage.removeItem('sm_mshauri_pending_prompt')
      }
    } catch {}
  }, [])

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
  // ── DATA STATE ────────────────────────────────────
  const [students, setStudents] = useState([])
  const [allocations, setAllocations] = useState([])
  const [allTeachers, setAllTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── UI STATE ──────────────────────────────────────
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')        // all | pending | complete | nosubjects
  const [curriculumFilter, setCurriculumFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [viewMode, setViewMode] = useState('all')                // all | pending-queue
  const [selectedStudent, setSelectedStudent] = useState(null)

  // ── ALLOCATION MODAL STATE ────────────────────────
  const [allocatingSubject, setAllocatingSubject] = useState(null)
  const [showAllocateModal, setShowAllocateModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [availableTeachers, setAvailableTeachers] = useState([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)

  // ── BULK ALLOCATION STATE ─────────────────────────
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkPreview, setBulkPreview] = useState([])             // [{ studentId, studentName, subjectId, subjectName, curriculum, suggestedTeachers, selectedTeacherId, included }]
  const [bulkSendEmails, setBulkSendEmails] = useState(false)    // SAFETY: default OFF
  const [bulkExecuting, setBulkExecuting] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0, failed: [] })

  // ── INITIAL FETCH ─────────────────────────────────
  useEffect(() => {
    fetchData()
  }, [refreshKey])

  const fetchData = async () => {
    try {
      const [studentsRes, allocationsRes, teachersRes] = await Promise.all([
        api.get('/users/students/list'),
        api.get('/allocations'),
        api.get('/users/teachers/list').catch(() => ({ data: { teachers: [] } })),
      ])
      let studentsData = studentsRes.data.students || []
      const allocationsData = allocationsRes.data.allocations || []

      // Sort students by latest created (descending)
      studentsData.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA
      })

      setStudents(studentsData)
      setAllocations(allocationsData)
      setAllTeachers(teachersRes.data.teachers || [])
      setLoading(false)
    } catch (e) {
      setError(e.response?.data?.message || e.message)
      setLoading(false)
    }
  }

  // ── HELPERS ────────────────────────────────────────
  const getStudentSummary = (student) => {
    const subjectsArray = Array.isArray(student.subjects) ? student.subjects : []
    let fullyAllocated = 0
    let pendingAllocation = 0

    subjectsArray.forEach(subject => {
      const subjectId = subject._id || subject
      const allocation = allocations.find(a =>
        a.studentId._id === student._id &&
        a.subjectId._id === subjectId &&
        a.status === 'Active'
      )
      if (allocation) fullyAllocated++
      else pendingAllocation++
    })

    return {
      totalSubjects: subjectsArray.length,
      fullyAllocated,
      pendingAllocation,
      subjects: subjectsArray,
    }
  }

  // Avatar color from name (deterministic, uses tokens)
  const avColor = (name) => {
    const tokens = ['var(--b700)', 'var(--g600)', 'var(--p600)', 'var(--a600)', 'var(--t600)', 'var(--r600)']
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
    return tokens[Math.abs(hash) % tokens.length]
  }

  // ── KPI COMPUTATIONS ──────────────────────────────
  const kpiTotalStudents = students.length
  const kpiAllocatedSubjects = students.reduce((sum, s) => sum + getStudentSummary(s).fullyAllocated, 0)
  const kpiTotalSubjects = students.reduce((sum, s) => sum + getStudentSummary(s).totalSubjects, 0)
  const kpiPendingSubjects = students.reduce((sum, s) => sum + getStudentSummary(s).pendingAllocation, 0)
  const kpiPendingStudents = students.filter(s => getStudentSummary(s).pendingAllocation > 0).length
  const kpiAvailableTeachers = allTeachers.length

  // ── FILTER OPTIONS ─────────────────────────────────
  const allCurricula = [...new Set(students.map(s => s.curriculum).filter(Boolean))].sort()
  const allYears = [...new Set(students.map(s => s.grade).filter(Boolean))].sort()

  // ── FILTERED STUDENTS ─────────────────────────────
  const filtered = students.filter(student => {
    const q = search.toLowerCase()
    const studentName = (student.firstName + ' ' + student.lastName).toLowerCase()
    const studentEmail = (student.email || '').toLowerCase()
    if (q && !studentName.includes(q) && !studentEmail.includes(q)) return false

    if (curriculumFilter !== 'all' && student.curriculum !== curriculumFilter) return false
    if (yearFilter !== 'all' && student.grade !== yearFilter) return false

    if (statusFilter !== 'all') {
      const summary = getStudentSummary(student)
      if (statusFilter === 'pending' && summary.pendingAllocation === 0) return false
      if (statusFilter === 'complete' && (summary.totalSubjects === 0 || summary.pendingAllocation > 0)) return false
      if (statusFilter === 'nosubjects' && summary.totalSubjects > 0) return false
    }

    if (viewMode === 'pending-queue') {
      const summary = getStudentSummary(student)
      if (summary.pendingAllocation === 0) return false
    }

    return true
  })

  // ── ALLOCATE FLOW ─────────────────────────────────
  const handleAllocateClick = async (studentId, subjectId, curriculum) => {
    const existingAllocation = allocations.find(a =>
      a.studentId._id === studentId &&
      a.subjectId._id === subjectId &&
      a.status === 'Active'
    )

    setAllocatingSubject({
      studentId,
      subjectId,
      curriculum,
      allocationId: existingAllocation?._id || null,
    })
    setShowAllocateModal(true)
    setLoadingTeachers(true)
    setSelectedTeacher(null)

    try {
      const res = await api.get(`/allocations/suggest-teachers/${studentId}/${subjectId}`)
      const teachers = res.data.qualifiedTeachers || []
      setAvailableTeachers(teachers)
      // Auto-select the first (best match) teacher for one-click flow
      if (teachers.length > 0 && !existingAllocation) {
        setSelectedTeacher(teachers[0]._id)
      }
    } catch (e) {
      toast.error('Failed to load qualified teachers: ' + e.message)
      setAvailableTeachers([])
    } finally {
      setLoadingTeachers(false)
    }
  }

  const handleAllocateTeacher = async () => {
    if (!selectedTeacher) {
      toast.error('Please select a teacher')
      return
    }

    try {
      const isReassignment = !!allocatingSubject.allocationId

      if (isReassignment) {
        await api.patch(`/allocations/${allocatingSubject.allocationId}`, {
          teacherId: selectedTeacher,
        })
        toast.ok('Teacher reassigned successfully')
      } else {
        await api.post('/allocations', {
          studentId: allocatingSubject.studentId,
          subjectId: allocatingSubject.subjectId,
          teacherId: selectedTeacher,
          sendEmails: true,
        })
        toast.ok('Allocation created · emails sent')
      }

      setShowAllocateModal(false)
      setAllocatingSubject(null)
      setSelectedTeacher(null)
      fetchData()
    } catch (e) {
      toast.error('Failed to save allocation: ' + (e.response?.data?.message || e.message))
    }
  }

  // ── BULK ALLOCATE FLOW ────────────────────────────
  const startBulkAllocate = async () => {
    setBulkLoading(true)
    setShowBulkModal(true)
    setBulkSendEmails(false)
    setBulkProgress({ done: 0, total: 0, failed: [] })

    // Build list of all pending (student, subject) pairs
    const pendingPairs = []
    students.forEach(student => {
      // Apply curriculum filter to bulk preview if set
      if (curriculumFilter !== 'all' && student.curriculum !== curriculumFilter) return

      const summary = getStudentSummary(student)
      summary.subjects.forEach(subject => {
        const subjectId = subject._id || subject
        const subjectName = typeof subject === 'object' ? subject.subjectName : 'Unknown'
        const isAllocated = allocations.some(a =>
          a.studentId._id === student._id &&
          a.subjectId._id === subjectId &&
          a.status === 'Active'
        )
        if (!isAllocated) {
          pendingPairs.push({
            studentId: student._id,
            studentName: student.firstName + ' ' + student.lastName,
            studentEmail: student.email,
            subjectId,
            subjectName,
            curriculum: student.curriculum,
            year: student.grade,
          })
        }
      })
    })

    if (pendingPairs.length === 0) {
      toast.info('No pending allocations to process')
      setShowBulkModal(false)
      setBulkLoading(false)
      return
    }

    // Cap at 50 to prevent overwhelming the backend
    const capped = pendingPairs.slice(0, 50)

    // Fetch suggestions for each in sequence (parallel would flood the API)
    const preview = []
    for (let i = 0; i < capped.length; i++) {
      const pair = capped[i]
      try {
        const res = await api.get(`/allocations/suggest-teachers/${pair.studentId}/${pair.subjectId}`)
        const suggestedTeachers = res.data.qualifiedTeachers || []
        preview.push({
          ...pair,
          suggestedTeachers,
          selectedTeacherId: suggestedTeachers[0]?._id || null,
          included: suggestedTeachers.length > 0,
        })
      } catch (e) {
        preview.push({
          ...pair,
          suggestedTeachers: [],
          selectedTeacherId: null,
          included: false,
          error: e.message,
        })
      }
      // Update preview as we go for live feedback
      setBulkPreview([...preview])
    }

    setBulkLoading(false)
    if (pendingPairs.length > 50) {
      toast.info(`Showing first 50 of ${pendingPairs.length} pending. Process these and run again.`)
    }
  }

  const updateBulkPreviewRow = (index, changes) => {
    setBulkPreview(prev => prev.map((row, i) => i === index ? { ...row, ...changes } : row))
  }

  const executeBulkAllocate = async () => {
    const toExecute = bulkPreview.filter(r => r.included && r.selectedTeacherId)
    if (toExecute.length === 0) {
      toast.error('No rows selected for allocation')
      return
    }

    if (!confirm(`Create ${toExecute.length} allocation${toExecute.length === 1 ? '' : 's'}?` + (bulkSendEmails ? '\n\nEmails WILL be sent to parents.' : '\n\nEmails will NOT be sent.'))) return

    setBulkExecuting(true)
    setBulkProgress({ done: 0, total: toExecute.length, failed: [] })

    const failed = []

    // Execute one at a time (sequential, not parallel — protects backend)
    for (let i = 0; i < toExecute.length; i++) {
      const row = toExecute[i]
      try {
        await api.post('/allocations', {
          studentId: row.studentId,
          subjectId: row.subjectId,
          teacherId: row.selectedTeacherId,
          sendEmails: bulkSendEmails,
        })
        setBulkProgress(p => ({ ...p, done: i + 1, failed: [...failed] }))
      } catch (e) {
        failed.push({
          row,
          error: e.response?.data?.message || e.message,
        })
        setBulkProgress(p => ({ ...p, done: i + 1, failed: [...failed] }))
      }
    }

    setBulkExecuting(false)

    const succeeded = toExecute.length - failed.length
    if (failed.length === 0) {
      toast.ok(`All ${succeeded} allocations created successfully`)
    } else {
      toast.error(`${succeeded} succeeded · ${failed.length} failed (see details)`)
    }

    fetchData()
  }

  const closeBulkModal = () => {
    if (bulkExecuting) {
      toast.error('Cannot close while bulk allocation is running')
      return
    }
    setShowBulkModal(false)
    setBulkPreview([])
    setBulkProgress({ done: 0, total: 0, failed: [] })
  }

  // ── RENDER STATES ──────────────────────────────────
  if (loading) {
    return (
      <>
        <div style={{ marginBottom: 20 }}>
          <div className="sec-tag">Enrolment System</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Student <em style={{ color: 'var(--b700)' }}>Allocations</em></h2>
        </div>
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--s500)', fontSize: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Loading</div>
          Fetching students, allocations, and teachers...
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div style={{ marginBottom: 20 }}>
          <div className="sec-tag">Enrolment System</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Student <em style={{ color: 'var(--b700)' }}>Allocations</em></h2>
        </div>
        <div className="card" style={{ padding: 24, background: 'var(--r50)', borderColor: 'var(--r100)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--r700)', marginBottom: 6 }}>Failed to load allocations</div>
          <div style={{ fontSize: 12, color: 'var(--r600)', marginBottom: 12 }}>{error}</div>
          <button className="btn btn-r btn-sm" onClick={fetchData}>Retry</button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="sec-tag">Enrolment System</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Student <em style={{ color: 'var(--b700)' }}>Allocations</em></h2>
          <p style={{ color: 'var(--s500)', fontSize: 13.5, marginTop: 3 }}>Match students to qualified teachers · 3-point check (subject + curriculum + specialty)</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {kpiPendingSubjects > 0 && (
            <button className="btn btn-p btn-sm" onClick={startBulkAllocate}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Bulk Allocate ({kpiPendingSubjects})
            </button>
          )}
          <button className="btn btn-s btn-sm" onClick={fetchData}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>
            Refresh
          </button>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-ic" style={{ background: 'var(--b50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div className="kpi-v">{kpiTotalStudents}</div>
          <div className="kpi-l">Total Students</div>
          <div className="kpi-d" style={{ color: 'var(--s500)' }}>{kpiTotalSubjects} subject enrolments</div>
        </div>
        <div className="kpi">
          <div className="kpi-ic" style={{ background: 'var(--g50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div className="kpi-v"><span style={{ color: 'var(--g600)' }}>{kpiAllocatedSubjects}</span><span style={{ fontSize: 16, color: 'var(--s400)' }}>/{kpiTotalSubjects}</span></div>
          <div className="kpi-l">Fully Allocated</div>
          <div className="kpi-d" style={{ color: 'var(--g600)' }}>{kpiTotalSubjects > 0 ? Math.round(kpiAllocatedSubjects / kpiTotalSubjects * 100) : 0}% complete</div>
        </div>
        <div className="kpi" style={{ borderColor: kpiPendingSubjects > 0 ? 'var(--r100)' : undefined, cursor: kpiPendingSubjects > 0 ? 'pointer' : 'default' }} onClick={() => kpiPendingSubjects > 0 && setStatusFilter('pending')}>
          <div className="kpi-ic" style={{ background: kpiPendingSubjects > 0 ? 'var(--r50)' : 'var(--s100)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={kpiPendingSubjects > 0 ? 'var(--r700)' : 'var(--s500)'} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="kpi-v" style={{ color: kpiPendingSubjects > 0 ? 'var(--r700)' : undefined }}>{kpiPendingSubjects}</div>
          <div className="kpi-l">Pending Allocations</div>
          <div className="kpi-d" style={{ color: kpiPendingSubjects > 0 ? 'var(--r600)' : 'var(--g600)' }}>
            {kpiPendingSubjects > 0 ? `Across ${kpiPendingStudents} student${kpiPendingStudents === 1 ? '' : 's'}` : 'All caught up'}
          </div>
        </div>
        <div className="kpi" style={{ cursor: 'default' }}>
          <div className="kpi-ic" style={{ background: 'var(--p50)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--p600)" strokeWidth="2" strokeLinecap="round"><path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/></svg>
          </div>
          <div className="kpi-v">{kpiAvailableTeachers}</div>
          <div className="kpi-l">Active Teachers</div>
          <div className="kpi-d" style={{ color: 'var(--s500)' }}>Available for allocation</div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="ctitle" style={{ marginRight: 4 }}>Filter:</span>
          {[
            { id: 'all',         label: 'All',          count: students.length },
            { id: 'pending',     label: 'Pending',      count: kpiPendingStudents, urgent: kpiPendingStudents > 0 },
            { id: 'complete',    label: 'Complete',     count: students.filter(s => { const x = getStudentSummary(s); return x.totalSubjects > 0 && x.pendingAllocation === 0 }).length },
            { id: 'nosubjects',  label: 'No Subjects',  count: students.filter(s => getStudentSummary(s).totalSubjects === 0).length },
          ].map(chip => (
            <button key={chip.id} onClick={() => setStatusFilter(chip.id)}
              style={{
                background: statusFilter === chip.id ? (chip.urgent ? 'var(--r700)' : 'var(--b700)') : 'var(--bg)',
                color: statusFilter === chip.id ? '#fff' : (chip.urgent ? 'var(--r700)' : 'var(--s700)'),
                border: '1px solid ' + (statusFilter === chip.id ? 'transparent' : (chip.urgent ? 'var(--r100)' : 'var(--border)')),
                padding: '6px 12px', borderRadius: 99,
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all .15s',
              }}>
              {chip.label}
              <span style={{
                background: statusFilter === chip.id ? 'rgba(255,255,255,.2)' : (chip.urgent ? 'var(--r50)' : 'var(--s100)'),
                color: statusFilter === chip.id ? '#fff' : (chip.urgent ? 'var(--r700)' : 'var(--s600)'),
                padding: '1px 7px', borderRadius: 99, fontSize: 11, fontWeight: 700,
              }}>{chip.count}</span>
            </button>
          ))}

          <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 4px' }}/>

          <select className="fsel" value={curriculumFilter} onChange={e => setCurriculumFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: 12.5, fontWeight: 600 }}>
            <option value="all">All Curricula</option>
            {allCurricula.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="fsel" value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: 12.5, fontWeight: 600 }}>
            <option value="all">All Years</option>
            {allYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <div style={{ flex: 1 }}/>

          <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--rsm)', padding: 2 }}>
            <button onClick={() => setViewMode('all')}
              style={{
                background: viewMode === 'all' ? '#fff' : 'transparent',
                border: 'none', padding: '5px 12px', borderRadius: 4,
                fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                color: viewMode === 'all' ? 'var(--s900)' : 'var(--s500)',
                boxShadow: viewMode === 'all' ? '0 1px 4px rgba(0,0,0,.06)' : 'none',
              }}>All</button>
            <button onClick={() => setViewMode('pending-queue')}
              style={{
                background: viewMode === 'pending-queue' ? '#fff' : 'transparent',
                border: 'none', padding: '5px 12px', borderRadius: 4,
                fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                color: viewMode === 'pending-queue' ? 'var(--r700)' : 'var(--s500)',
                boxShadow: viewMode === 'pending-queue' ? '0 1px 4px rgba(0,0,0,.06)' : 'none',
              }}>Pending Queue</button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      {students.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--s600)', fontWeight: 600 }}>No students found</div>
          <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 6 }}>Add students from the Users module first</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--s600)', fontWeight: 600 }}>No students match your filters</div>
          <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 6 }}>Try adjusting the filter chips above</div>
          <button className="btn btn-s btn-sm" style={{ marginTop: 14 }} onClick={() => { setStatusFilter('all'); setCurriculumFilter('all'); setYearFilter('all'); setSearch(''); setViewMode('all') }}>Clear all filters</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                {viewMode === 'pending-queue' ? 'Pending Queue' : 'Students Overview'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 4 }}>
                {filtered.length} of {students.length} student{students.length === 1 ? '' : 's'}
                {viewMode === 'pending-queue' && ' · need allocation'}
              </div>
            </div>
            <input className="fi" placeholder="Search name or email..." style={{ width: 260 }} value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Curriculum</th>
                  <th>Year/Grade</th>
                  <th>Allocated</th>
                  <th>Pending</th>
                  <th style={{ width: 120, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => {
                  const summary = getStudentSummary(student)
                  const hasPending = summary.pendingAllocation > 0 || summary.totalSubjects === 0
                  const fullName = student.firstName + ' ' + student.lastName
                  return (
                    <tr key={student._id} style={{ background: hasPending ? 'var(--a50)' : '#fff' }}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Av init={(student.firstName[0] + student.lastName[0]).toUpperCase()} col={avColor(fullName)} size={32}/>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{fullName}</div>
                            <div style={{ fontSize: 11, color: 'var(--s400)' }}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {student.curriculum ? (
                          <span className="badge" style={{ color: 'var(--b700)', borderColor: 'var(--b100)', background: 'var(--b50)' }}>{student.curriculum}</span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--s400)' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--s600)' }}>{student.grade || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontWeight: 700, color: 'var(--g700)' }}>{summary.fullyAllocated}</span>
                          <span style={{ color: 'var(--s400)', fontSize: 12 }}>/ {summary.totalSubjects}</span>
                        </div>
                      </td>
                      <td>
                        {summary.totalSubjects === 0 ? (
                          <span className="badge" style={{ color: 'var(--s600)', background: 'var(--s100)', borderColor: 'var(--s200)' }}>No subjects</span>
                        ) : hasPending ? (
                          <span className="badge" style={{ color: 'var(--r700)', background: 'var(--r50)', borderColor: 'var(--r100)' }}>{summary.pendingAllocation} pending</span>
                        ) : (
                          <span style={{ color: 'var(--g700)', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Complete
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button className={hasPending ? 'btn btn-r btn-sm' : 'btn btn-g btn-sm'}
                          onClick={() => setSelectedStudent(student)}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT ALLOCATION MODAL */}
      {selectedStudent && (
        <Modal
          open={!!selectedStudent}
          onClose={() => { setSelectedStudent(null); setAllocatingSubject(null); setSelectedTeacher(null) }}
          title={`${selectedStudent.firstName} ${selectedStudent.lastName} — Allocations`}
          size="lg"
        >
          <div style={{ marginBottom: 20, padding: 14, background: 'var(--s50)', borderRadius: 'var(--rmd)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Curriculum</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s900)' }}>{selectedStudent.curriculum || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Year / Grade</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s900)' }}>{selectedStudent.grade || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 13, color: 'var(--s700)' }}>{selectedStudent.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Subjects</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s900)' }}>
                  {(() => {
                    const summary = getStudentSummary(selectedStudent)
                    return `${summary.fullyAllocated}/${summary.totalSubjects} allocated`
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--s900)', marginBottom: 12 }}>Subject Allocations</div>
            {(() => {
              const summary = getStudentSummary(selectedStudent)
              if (summary.subjects.length === 0) {
                return (
                  <div style={{ padding: 24, textAlign: 'center', background: 'var(--s50)', borderRadius: 'var(--rmd)', border: '1px dashed var(--border)' }}>
                    <div style={{ fontSize: 13, color: 'var(--s600)', fontWeight: 600 }}>No subjects enrolled</div>
                    <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 4 }}>This student needs subjects added to their profile first</div>
                  </div>
                )
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {summary.subjects.map(subject => {
                    const subjectId = subject._id || subject
                    const subjectName = typeof subject === 'object' ? subject.subjectName : 'Unknown'
                    const allocation = allocations.find(a =>
                      a.studentId._id === selectedStudent._id &&
                      a.subjectId._id === subjectId &&
                      a.status === 'Active'
                    )
                    const isAllocated = !!allocation
                    const teacherBeingLoaded = allocatingSubject?.subjectId === subjectId && loadingTeachers
                    const subjectTeachers = allocatingSubject?.subjectId === subjectId ? availableTeachers : []
                    const hasNoTeachers = allocatingSubject?.subjectId === subjectId && !loadingTeachers && subjectTeachers.length === 0
                    const isExpanded = allocatingSubject?.subjectId === subjectId

                    return (
                      <div key={subjectId} style={{
                        border: '1px solid ' + (isExpanded ? 'var(--b200)' : 'var(--border)'),
                        borderRadius: 'var(--rmd)',
                        padding: 14,
                        background: isAllocated ? '#fff' : (isExpanded ? 'var(--b50)' : 'var(--r50)'),
                        transition: 'all 0.2s ease',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between', marginBottom: isExpanded ? 12 : 0 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>{subjectName}</div>
                            {isAllocated && !isExpanded && (
                              <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                Assigned to <span style={{ fontWeight: 700, color: 'var(--g700)' }}>{allocation.teacherId.firstName} {allocation.teacherId.lastName}</span>
                              </div>
                            )}
                            {!isAllocated && !isExpanded && (
                              <div style={{ fontSize: 12, color: 'var(--r600)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                Unassigned
                              </div>
                            )}
                          </div>
                          {!isExpanded && (
                            <button className={isAllocated ? 'btn btn-g btn-sm' : 'btn btn-r btn-sm'}
                              onClick={() => handleAllocateClick(selectedStudent._id, subjectId, selectedStudent.curriculum)}
                              style={{ whiteSpace: 'nowrap' }}>
                              {isAllocated ? 'Change' : 'Allocate'}
                            </button>
                          )}
                        </div>

                        {isExpanded && (
                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 8 }}>
                              {isAllocated ? 'Reassign Teacher for' : 'Select Teacher for'} {subjectName}
                            </div>

                            {isAllocated && (
                              <div style={{ padding: 8, background: 'var(--b100)', border: '1px solid var(--b200)', borderRadius: 'var(--rmd)', fontSize: 11, color: 'var(--b700)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                <span>Currently assigned to: <strong>{allocation.teacherId.firstName} {allocation.teacherId.lastName}</strong></span>
                              </div>
                            )}

                            {teacherBeingLoaded && (
                              <div style={{ padding: 16, textAlign: 'center', color: 'var(--s500)', fontSize: 12 }}>
                                Finding qualified teachers...
                              </div>
                            )}

                            {hasNoTeachers && (
                              <div style={{ padding: 12, background: 'var(--r50)', border: '1px solid var(--r100)', borderRadius: 'var(--rmd)', color: 'var(--r700)', fontSize: 12, textAlign: 'center', fontWeight: 600 }}>
                                No qualified teachers for {subjectName} in {selectedStudent.curriculum}
                              </div>
                            )}

                            {!teacherBeingLoaded && subjectTeachers.length > 0 && (
                              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--rmd)', overflow: 'hidden', background: '#fff' }}>
                                <div style={{ maxHeight: 280, overflowY: 'auto', overflowX: 'hidden' }}>
                                  {subjectTeachers.map((t, idx) => {
                                    const isCurrentTeacher = isAllocated && allocation.teacherId._id === t._id
                                    const isBestMatch = idx === 0 && !isAllocated
                                    const isSelected = selectedTeacher === t._id
                                    return (
                                      <div key={t._id} onClick={() => setSelectedTeacher(t._id)}
                                        style={{
                                          padding: '12px 14px',
                                          borderBottom: idx < subjectTeachers.length - 1 ? '1px solid var(--s100)' : 'none',
                                          cursor: 'pointer',
                                          background: isSelected ? 'var(--b50)' : (isCurrentTeacher ? 'var(--s50)' : '#fff'),
                                          borderLeft: '3px solid ' + (isSelected ? 'var(--b700)' : (isCurrentTeacher ? 'var(--s400)' : 'transparent')),
                                          transition: 'all 0.15s ease',
                                          display: 'flex', alignItems: 'center', gap: 10,
                                        }}
                                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--s50)' }}
                                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isCurrentTeacher ? 'var(--s50)' : '#fff' }}>
                                        <div style={{
                                          width: 32, height: 32, borderRadius: '50%',
                                          background: isCurrentTeacher ? 'var(--s300)' : 'var(--b100)',
                                          color: isCurrentTeacher ? 'var(--s700)' : 'var(--b700)',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          fontWeight: 700, fontSize: 12, flexShrink: 0,
                                        }}>
                                          {t.firstName.charAt(0)}{t.lastName.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--s900)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {t.firstName} {t.lastName}
                                            {isBestMatch && (
                                              <span style={{ background: 'var(--a50)', color: 'var(--a600)', border: '1px solid var(--a100)', fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 99, letterSpacing: '.06em' }}>BEST MATCH</span>
                                            )}
                                            {isCurrentTeacher && (
                                              <span style={{ fontSize: 10, color: 'var(--s500)', fontWeight: 500 }}>(current)</span>
                                            )}
                                          </div>
                                          <div style={{ fontSize: 11, color: 'var(--s500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {t.email}
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                              <button className="btn btn-p" onClick={handleAllocateTeacher}
                                disabled={!selectedTeacher || teacherBeingLoaded || hasNoTeachers}
                                style={{ flex: 1 }}>
                                {teacherBeingLoaded ? 'Loading...' : (isAllocated ? 'Update Allocation' : 'Save Allocation')}
                              </button>
                              <button className="btn btn-s" onClick={() => { setAllocatingSubject(null); setSelectedTeacher(null) }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </Modal>
      )}

      {/* BULK ALLOCATION MODAL */}
      {showBulkModal && (
        <Modal open={showBulkModal} onClose={closeBulkModal} title="Bulk Allocate Pending Students" size="lg">
          {bulkLoading && bulkPreview.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 6 }}>Preparing Preview</div>
              <div style={{ fontSize: 13, color: 'var(--s600)' }}>Loading suggested teachers for each pending allocation...</div>
            </div>
          ) : bulkExecuting || bulkProgress.done > 0 ? (
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--s900)', marginBottom: 6 }}>
                  Allocating {bulkProgress.done} of {bulkProgress.total}
                </div>
                <div className="prog">
                  <div className="prog-f" style={{ width: bulkProgress.total > 0 ? (bulkProgress.done / bulkProgress.total * 100) + '%' : '0%', background: 'var(--b700)' }}/>
                </div>
              </div>

              {bulkExecuting && (
                <div style={{ padding: 12, background: 'var(--b50)', border: '1px solid var(--b100)', borderRadius: 'var(--rmd)', fontSize: 12, color: 'var(--b700)', marginBottom: 12 }}>
                  Bulk allocation in progress · do not close this window
                </div>
              )}

              {!bulkExecuting && bulkProgress.done > 0 && (
                <>
                  <div style={{ padding: 12, background: bulkProgress.failed.length === 0 ? 'var(--g50)' : 'var(--a50)', border: '1px solid ' + (bulkProgress.failed.length === 0 ? 'var(--g100)' : 'var(--a100)'), borderRadius: 'var(--rmd)', fontSize: 13, color: bulkProgress.failed.length === 0 ? 'var(--g700)' : 'var(--a600)', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      {bulkProgress.failed.length === 0 ? 'All allocations completed successfully' : 'Bulk allocation completed with some failures'}
                    </div>
                    <div style={{ fontSize: 12 }}>
                      Succeeded: <strong>{bulkProgress.total - bulkProgress.failed.length}</strong> · Failed: <strong>{bulkProgress.failed.length}</strong>
                    </div>
                  </div>

                  {bulkProgress.failed.length > 0 && (
                    <div style={{ border: '1px solid var(--r100)', borderRadius: 'var(--rmd)', overflow: 'hidden', marginBottom: 12 }}>
                      <div style={{ padding: '10px 14px', background: 'var(--r50)', fontSize: 12, fontWeight: 700, color: 'var(--r700)' }}>Failed Allocations</div>
                      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                        {bulkProgress.failed.map((f, i) => (
                          <div key={i} style={{ padding: '8px 14px', borderTop: i > 0 ? '1px solid var(--s100)' : 'none', fontSize: 12 }}>
                            <div style={{ fontWeight: 600, color: 'var(--s900)' }}>{f.row.studentName} · {f.row.subjectName}</div>
                            <div style={{ color: 'var(--r600)', fontSize: 11, marginTop: 2 }}>{f.error}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="btn btn-p" onClick={closeBulkModal} style={{ width: '100%' }}>Close</button>
                </>
              )}
            </div>
          ) : (
            <>
              <div style={{ padding: 14, background: 'var(--a50)', border: '1px solid var(--a100)', borderRadius: 'var(--rmd)', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--a600)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Review before allocating
                </div>
                <div style={{ fontSize: 12, color: 'var(--s700)', lineHeight: 1.6 }}>
                  Each row shows the system's suggested best teacher. Uncheck rows to skip them, or change the teacher dropdown. Existing active allocations will <strong>not</strong> be touched.
                </div>
              </div>

              {/* Email toggle */}
              <div style={{ padding: '10px 14px', background: bulkSendEmails ? 'var(--r50)' : 'var(--s50)', border: '1px solid ' + (bulkSendEmails ? 'var(--r100)' : 'var(--border)'), borderRadius: 'var(--rmd)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: bulkSendEmails ? 'var(--r700)' : 'var(--s900)', marginBottom: 2 }}>
                    {bulkSendEmails ? 'Notification emails ENABLED' : 'Notification emails disabled'}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--s600)' }}>
                    {bulkSendEmails
                      ? 'Each parent will be emailed about their child\'s new teacher assignment.'
                      : 'Recommended for bulk operations. You can notify parents individually afterward.'}
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 22, cursor: 'pointer', flexShrink: 0 }}>
                  <input type="checkbox" checked={bulkSendEmails} onChange={e => setBulkSendEmails(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }}/>
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: bulkSendEmails ? 'var(--r600)' : 'var(--s300)', borderRadius: 22, transition: 'background .2s' }}/>
                  <span style={{ position: 'absolute', top: 3, left: bulkSendEmails ? 23 : 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left .2s' }}/>
                </label>
              </div>

              {/* Preview table */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--rmd)', overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '10px 14px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>
                    {bulkPreview.length} pending · <span style={{ color: 'var(--g700)' }}>{bulkPreview.filter(r => r.included && r.selectedTeacherId).length} ready</span>
                    {bulkPreview.filter(r => !r.included).length > 0 && <span style={{ color: 'var(--s400)' }}> · {bulkPreview.filter(r => !r.included).length} skipped</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-s btn-sm" onClick={() => setBulkPreview(p => p.map(r => ({ ...r, included: r.suggestedTeachers.length > 0 })))}>Select all</button>
                    <button className="btn btn-s btn-sm" onClick={() => setBulkPreview(p => p.map(r => ({ ...r, included: false })))}>Deselect all</button>
                  </div>
                </div>
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {bulkPreview.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--s500)' }}>Loading suggestions...</div>
                  ) : bulkPreview.map((row, idx) => {
                    const hasError = !row.suggestedTeachers || row.suggestedTeachers.length === 0
                    return (
                      <div key={row.studentId + '-' + row.subjectId} style={{
                        padding: '10px 14px',
                        borderTop: idx > 0 ? '1px solid var(--s100)' : 'none',
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: hasError ? 'var(--r50)' : (row.included ? '#fff' : 'var(--s50)'),
                        opacity: hasError ? .8 : 1,
                      }}>
                        <input type="checkbox" checked={row.included} disabled={hasError}
                          onChange={e => updateBulkPreviewRow(idx, { included: e.target.checked })}
                          style={{ accentColor: 'var(--b700)', flexShrink: 0, width: 16, height: 16 }}/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--s900)' }}>
                            {row.studentName} <span style={{ color: 'var(--s500)', fontWeight: 500 }}>· {row.subjectName}</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>
                            {row.curriculum} {row.year ? '· ' + row.year : ''}
                          </div>
                        </div>
                        {hasError ? (
                          <span className="badge" style={{ color: 'var(--r700)', background: 'var(--r50)', borderColor: 'var(--r100)', fontSize: 10 }}>NO MATCH</span>
                        ) : (
                          <select className="fsel" value={row.selectedTeacherId || ''}
                            disabled={!row.included}
                            onChange={e => updateBulkPreviewRow(idx, { selectedTeacherId: e.target.value })}
                            style={{ width: 220, padding: '6px 10px', fontSize: 12, fontWeight: 600 }}>
                            {row.suggestedTeachers.map((t, ti) => (
                              <option key={t._id} value={t._id}>
                                {ti === 0 ? '★ ' : ''}{t.firstName} {t.lastName}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-p" onClick={executeBulkAllocate}
                  disabled={bulkPreview.filter(r => r.included && r.selectedTeacherId).length === 0}
                  style={{ flex: 1 }}>
                  Allocate {bulkPreview.filter(r => r.included && r.selectedTeacherId).length} Selected
                </button>
                <button className="btn btn-s" onClick={closeBulkModal}>Cancel</button>
              </div>
            </>
          )}
        </Modal>
      )}
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



// ─── Settings Page ──────────────────────────────────────────
function SettingsPage({ toast }) {
  const store = useStore()
  const [features, setFeatures] = useState(FEATS.map(f => ({ ...f })))
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [signupsOpen, setSignupsOpen] = useState(true)
  const [aiTutorEnabled, setAiTutorEnabled] = useState(true)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(60)
  const [defaultCurriculum, setDefaultCurriculum] = useState('IGCSE')
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [termStartDate, setTermStartDate] = useState('2026-01-08')
  const [termEndDate, setTermEndDate] = useState('2026-04-04')
  const [supportEmail, setSupportEmail] = useState('support@smartious.ac.ke')
  const [supportPhone, setSupportPhone] = useState('+254 745 021 212')
  const [savingFeatures, setSavingFeatures] = useState(false)

  const toggleFeature = (idx) => {
    setFeatures(prev => prev.map((f, i) => i === idx ? { ...f, on: !f.on } : f))
  }

  const saveFeatures = () => {
    setSavingFeatures(true)
    setTimeout(() => {
      setSavingFeatures(false)
      toast.ok('Feature flags saved · changes live across all portals')
    }, 600)
  }

  const saveSchoolSettings = () => {
    toast.ok('School settings saved · academic calendar updated')
  }

  const saveSecuritySettings = () => {
    toast.ok('Security settings saved')
  }

  const saveSupport = () => {
    toast.ok('Support contact updated')
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div className="sec-tag">System</div>
        <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>System <em style={{ color: 'var(--b700)' }}>Settings</em></h2>
        <p style={{ fontSize: 14, color: 'var(--s500)', marginTop: 3 }}>Platform configuration · feature flags · security policies</p>
      </div>

      {/* KPI summary */}
      <div className="kpi-row">
        {[
          { ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-11h-6m-6 0H1"/></svg>, bg:'var(--b50)', v:String(features.filter(f => f.on).length), l:'Features Enabled', d:`of ${features.length} total`, dc:'var(--g600)' },
          { ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={maintenanceMode ? 'var(--r700)' : 'var(--g600)'} strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, bg: maintenanceMode ? 'var(--r50)' : 'var(--g50)', v: maintenanceMode ? 'OFF' : 'LIVE', l:'Platform Status', d: maintenanceMode ? 'Maintenance mode' : 'All systems operational', dc: maintenanceMode ? 'var(--r700)' : 'var(--g600)' },
          { ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--p600)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, bg:'var(--p50)', v: twoFactor ? 'ON' : 'OFF', l:'2-Factor Auth', d: twoFactor ? 'All admins protected' : 'Recommended', dc: twoFactor ? 'var(--g600)' : 'var(--a600)' },
          { ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, bg:'var(--a50)', v:`${sessionTimeout}m`, l:'Session Timeout', d:'Auto-logout after idle', dc:'var(--s500)' },
        ].map((k, i) => (
          <div key={i} className="kpi">
            <div className="kpi-ic" style={{ background: k.bg }}>{k.ic}</div>
            <div className="kpi-v mono" style={{ fontSize: 20 }}>{k.v}</div>
            <div className="kpi-l">{k.l}</div>
            <div className="kpi-d" style={{ color: k.dc }}>{k.d}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Feature flags */}
        <div className="card">
          <div className="chdr">
            <div className="ctitle">Feature Flags</div>
            <button className="btn btn-ok btn-sm" onClick={saveFeatures} disabled={savingFeatures}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
              {savingFeatures ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 13px', borderRadius: 'var(--rsm)',
                background: f.on ? 'var(--g50)' : 'var(--s50)',
                border: '1px solid ' + (f.on ? 'var(--g100)' : 'var(--border)'),
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--s900)' }}>{f.n}</div>
                  <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 2 }}>{f.d}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 22, cursor: 'pointer' }}>
                  <input type="checkbox" checked={f.on} onChange={() => toggleFeature(i)} style={{ opacity: 0, width: 0, height: 0 }}/>
                  <span style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: f.on ? 'var(--g600)' : 'var(--s300)',
                    borderRadius: 22, transition: 'background .2s',
                  }}/>
                  <span style={{
                    position: 'absolute', top: 3, left: f.on ? 23 : 3,
                    width: 16, height: 16, background: '#fff', borderRadius: '50%',
                    transition: 'left .2s',
                  }}/>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* School configuration */}
        <div className="card">
          <div className="chdr">
            <div className="ctitle">School Configuration</div>
            <button className="btn btn-p btn-sm" onClick={saveSchoolSettings}>Save</button>
          </div>
          <div className="fg">
            <label className="fl">Default Curriculum</label>
            <select className="fsel" value={defaultCurriculum} onChange={e => setDefaultCurriculum(e.target.value)}>
              {(store.curricula || []).map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Academic Year</label>
            <input className="fi" value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="e.g. 2025-2026"/>
          </div>
          <div className="fr2">
            <div className="fg">
              <label className="fl">Term Start Date</label>
              <input className="fi" type="date" value={termStartDate} onChange={e => setTermStartDate(e.target.value)}/>
            </div>
            <div className="fg">
              <label className="fl">Term End Date</label>
              <input className="fi" type="date" value={termEndDate} onChange={e => setTermEndDate(e.target.value)}/>
            </div>
          </div>
          <div style={{ background: 'var(--b50)', border: '1px solid var(--b100)', padding: '10px 12px', borderRadius: 'var(--rsm)', fontSize: 12.5, color: 'var(--s700)', marginTop: 4, lineHeight: 1.6 }}>
            <strong>Note:</strong> Term dates affect billing cycles, attendance reports, and grade book deadlines.
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="card">
          <div className="chdr">
            <div className="ctitle">Security & Authentication</div>
            <button className="btn btn-p btn-sm" onClick={saveSecuritySettings}>Save</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Two-Factor Authentication (Admin)', desc: 'Require OTP for all admin logins', val: twoFactor, set: setTwoFactor },
              { label: 'Open Public Sign-ups', desc: 'Allow new students to register without invitation', val: signupsOpen, set: setSignupsOpen },
              { label: 'Maintenance Mode', desc: 'Lock platform · only admins can access', val: maintenanceMode, set: setMaintenanceMode },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 13px', borderRadius: 'var(--rsm)',
                background: row.val ? 'var(--g50)' : 'var(--s50)',
                border: '1px solid ' + (row.val ? 'var(--g100)' : 'var(--border)'),
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--s900)' }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 2 }}>{row.desc}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 22, cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.val} onChange={() => row.set(!row.val)} style={{ opacity: 0, width: 0, height: 0 }}/>
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: row.val ? 'var(--g600)' : 'var(--s300)', borderRadius: 22, transition: 'background .2s' }}/>
                  <span style={{ position: 'absolute', top: 3, left: row.val ? 23 : 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left .2s' }}/>
                </label>
              </div>
            ))}
          </div>
          <div className="fg" style={{ marginTop: 12, marginBottom: 0 }}>
            <label className="fl">Session Timeout (minutes)</label>
            <input className="fi" type="number" value={sessionTimeout} onChange={e => setSessionTimeout(parseInt(e.target.value) || 60)} min="5" max="480"/>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="chdr">
            <div className="ctitle">Notifications</div>
            <button className="btn btn-p btn-sm" onClick={() => toast.ok('Notification preferences saved')}>Save</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Email Notifications', desc: 'System alerts · weekly digests · payment receipts', val: emailNotifs, set: setEmailNotifs },
              { label: 'SMS Notifications', desc: 'Class reminders · payment confirmations · urgent alerts', val: smsNotifs, set: setSmsNotifs },
              { label: 'Push Notifications', desc: 'Real-time browser/mobile push · class start alerts', val: pushNotifs, set: setPushNotifs },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 13px', borderRadius: 'var(--rsm)',
                background: row.val ? 'var(--g50)' : 'var(--s50)',
                border: '1px solid ' + (row.val ? 'var(--g100)' : 'var(--border)'),
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--s900)' }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 2 }}>{row.desc}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 22, cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.val} onChange={() => row.set(!row.val)} style={{ opacity: 0, width: 0, height: 0 }}/>
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: row.val ? 'var(--g600)' : 'var(--s300)', borderRadius: 22, transition: 'background .2s' }}/>
                  <span style={{ position: 'absolute', top: 3, left: row.val ? 23 : 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left .2s' }}/>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Support contact */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="chdr">
            <div className="ctitle">Support Contact (shown to students & parents)</div>
            <button className="btn btn-p btn-sm" onClick={saveSupport}>Save</button>
          </div>
          <div className="fr2">
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Support Email</label>
              <input className="fi" type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)}/>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Support Phone / WhatsApp</label>
              <input className="fi" type="tel" value={supportPhone} onChange={e => setSupportPhone(e.target.value)}/>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ borderColor: 'var(--r100)' }}>
        <div className="chdr">
          <div className="ctitle" style={{ color: 'var(--r700)' }}>Danger Zone</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--s600)', marginBottom: 14, lineHeight: 1.6 }}>
          Irreversible actions. Use with caution.
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-sm" style={{ background: 'var(--a50)', color: 'var(--a600)', borderColor: 'var(--a100)' }} onClick={() => { if (confirm('Clear local cache? This will log all admins out.')) toast.info('Cache cleared') }}>Clear Local Cache</button>
          <button className="btn btn-sm" style={{ background: 'var(--r50)', color: 'var(--r700)', borderColor: 'var(--r100)' }} onClick={() => { if (confirm('Reset all feature flags to defaults?')) { setFeatures(FEATS.map(f => ({ ...f }))); toast.ok('Features reset to defaults') } }}>Reset Feature Flags</button>
          <button className="btn btn-sm" style={{ background: 'var(--r50)', color: 'var(--r700)', borderColor: 'var(--r100)' }} onClick={() => toast.error('This action requires super-admin token')}>Force Logout All Users</button>
        </div>
      </div>
    </>
  )
}

// ─── Website Editor Page ────────────────────────────────────
function WebsiteEditorPage({ toast }) {
  const store = useStore()
  const [site, setSite] = useState({ ...store.siteConfig })
  const [tab, setTab] = useState('hero')
  const [saving, setSaving] = useState(false)

  const upd = (k, v) => setSite(p => ({ ...p, [k]: v }))

  const saveAll = () => {
    setSaving(true)
    setTimeout(() => {
      store.updateSiteConfig(site)
      setSaving(false)
      toast.ok('Website saved · live on smartioushomeschool.com')
    }, 700)
  }

  const resetSection = () => {
    if (!confirm('Reset this section to last saved state?')) return
    setSite({ ...store.siteConfig })
    toast.info('Section reset')
  }

  const previewSite = () => {
    window.open('https://smartioushomeschool.com', '_blank', 'noopener')
  }

  const tabs = [
    { id: 'hero',    label: 'Hero Section' },
    { id: 'stats',   label: 'Stats' },
    { id: 'about',   label: 'About' },
    { id: 'contact', label: 'Contact & Footer' },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="sec-tag">System</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Website <em style={{ color: 'var(--b700)' }}>Editor</em></h2>
          <p style={{ fontSize: 14, color: 'var(--s500)', marginTop: 3 }}>Edit landing page content · changes go live instantly across smartioushomeschool.com</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-g btn-sm" onClick={previewSite}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Preview Live Site
          </button>
          <button className="btn btn-ok btn-sm" onClick={saveAll} disabled={saving}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
            {saving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--s50)', borderRadius: 'var(--rmd)', marginBottom: 16, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: '0 0 auto',
            padding: '9px 16px', borderRadius: 'var(--rsm)',
            background: tab === t.id ? '#fff' : 'transparent',
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700,
            color: tab === t.id ? 'var(--b700)' : 'var(--s600)',
            boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,.06)' : 'none',
            transition: 'all .15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* HERO TAB */}
      {tab === 'hero' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="chdr">
              <div className="ctitle">Hero Content</div>
              <button className="btn btn-sm" onClick={resetSection}>Reset</button>
            </div>
            <div className="fg">
              <label className="fl">School Name</label>
              <input className="fi" value={site.schoolName || ''} onChange={e => upd('schoolName', e.target.value)} placeholder="Smartious Homeschool"/>
            </div>
            <div className="fg">
              <label className="fl">Headline</label>
              <input className="fi" value={site.headline || ''} onChange={e => upd('headline', e.target.value)}/>
            </div>
            <div className="fg">
              <label className="fl">Subheadline</label>
              <textarea className="fta" rows={3} value={site.subheadline || ''} onChange={e => upd('subheadline', e.target.value)}/>
            </div>
            <div className="fr2">
              <div className="fg">
                <label className="fl">Primary CTA Button</label>
                <input className="fi" value={site.cta1 || ''} onChange={e => upd('cta1', e.target.value)}/>
              </div>
              <div className="fg">
                <label className="fl">Secondary CTA Button</label>
                <input className="fi" value={site.cta2 || ''} onChange={e => upd('cta2', e.target.value)}/>
              </div>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Hero Video URL (optional)</label>
              <input className="fi" value={site.heroVideo || ''} onChange={e => upd('heroVideo', e.target.value)} placeholder="https://youtube.com/embed/..."/>
            </div>
          </div>

          {/* Live preview */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #7D1025, #5A0B1B)', color: '#fff', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="ctitle" style={{ color: 'rgba(255,255,255,.6)' }}>Live Preview</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#4ADE80' }}>● UPDATING IN REAL-TIME</span>
            </div>
            <div style={{ padding: '32px 24px', minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 12, letterSpacing: '.1em' }}>
                {site.schoolName || 'SCHOOL NAME'}
              </div>
              <div className="serif" style={{ fontSize: 28, lineHeight: 1.2, marginBottom: 12, color: '#fff' }}>
                {site.headline || 'Headline goes here'}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', marginBottom: 20, lineHeight: 1.6 }}>
                {site.subheadline || 'Subheadline preview...'}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-block', padding: '10px 18px', background: 'var(--b700)', color: '#fff', borderRadius: 'var(--rsm)', fontSize: 13, fontWeight: 700 }}>{site.cta1 || 'Primary CTA'}</span>
                <span style={{ display: 'inline-block', padding: '10px 18px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: 'var(--rsm)', fontSize: 13, fontWeight: 700 }}>{site.cta2 || 'Secondary CTA'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS TAB */}
      {tab === 'stats' && (
        <div className="card">
          <div className="chdr">
            <div className="ctitle">Hero Statistics (4 displayed)</div>
            <button className="btn btn-sm" onClick={resetSection}>Reset</button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 14 }}>
            These appear in the hero section as social-proof. Use short, punchy text.
          </div>
          <div className="fr2">
            <div className="fg">
              <label className="fl">Stat 1</label>
              <input className="fi" value={site.stat1 || ''} onChange={e => upd('stat1', e.target.value)} placeholder="2,418+ Students"/>
            </div>
            <div className="fg">
              <label className="fl">Stat 2</label>
              <input className="fi" value={site.stat2 || ''} onChange={e => upd('stat2', e.target.value)} placeholder="127 Teachers"/>
            </div>
            <div className="fg">
              <label className="fl">Stat 3</label>
              <input className="fi" value={site.stat3 || ''} onChange={e => upd('stat3', e.target.value)} placeholder="6 Curricula"/>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Stat 4</label>
              <input className="fi" value={site.stat4 || ''} onChange={e => upd('stat4', e.target.value)} placeholder="Kenya · UAE · UK"/>
            </div>
          </div>
          <div style={{ marginTop: 18, padding: 14, background: 'var(--s50)', borderRadius: 'var(--rsm)' }}>
            <div className="ctitle" style={{ marginBottom: 10 }}>Preview</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[site.stat1, site.stat2, site.stat3, site.stat4].map((s, i) => (
                <div key={i} style={{ background: '#fff', padding: 12, borderRadius: 'var(--rsm)', border: '1px solid var(--border)', textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--s900)' }}>
                  {s || '—'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABOUT TAB */}
      {tab === 'about' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="chdr">
              <div className="ctitle">About Section</div>
              <button className="btn btn-sm" onClick={resetSection}>Reset</button>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">About Text (appears below hero)</label>
              <textarea className="fta" rows={10} value={site.aboutText || ''} onChange={e => upd('aboutText', e.target.value)}/>
            </div>
          </div>
          <div className="card">
            <div className="chdr">
              <div className="ctitle">Live Preview</div>
            </div>
            <div style={{ padding: 18, background: 'var(--s50)', borderRadius: 'var(--rsm)', minHeight: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'var(--s500)', textTransform: 'uppercase', marginBottom: 8 }}>
                About
              </div>
              <div className="serif" style={{ fontSize: 22, color: 'var(--s900)', marginBottom: 12 }}>
                Why families choose us
              </div>
              <div style={{ fontSize: 14, color: 'var(--s700)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {site.aboutText || 'About text will appear here...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT & FOOTER TAB */}
      {tab === 'contact' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="chdr">
              <div className="ctitle">Footer Contact</div>
              <button className="btn btn-sm" onClick={resetSection}>Reset</button>
            </div>
            <div className="fg">
              <label className="fl">Email</label>
              <input className="fi" type="email" value={site.footerEmail || ''} onChange={e => upd('footerEmail', e.target.value)}/>
            </div>
            <div className="fg">
              <label className="fl">Primary Phone</label>
              <input className="fi" type="tel" value={site.footerPhone || ''} onChange={e => upd('footerPhone', e.target.value)}/>
            </div>
            <div className="fg">
              <label className="fl">Secondary Phone (optional)</label>
              <input className="fi" type="tel" value={site.phone2 || ''} onChange={e => upd('phone2', e.target.value)}/>
            </div>
            <div className="fg">
              <label className="fl">WhatsApp</label>
              <input className="fi" type="tel" value={site.whatsapp || ''} onChange={e => upd('whatsapp', e.target.value)}/>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Physical Address</label>
              <textarea className="fta" rows={2} value={site.footerAddress || ''} onChange={e => upd('footerAddress', e.target.value)}/>
            </div>
          </div>
          <div className="card">
            <div className="chdr">
              <div className="ctitle">Footer Copy & Branding</div>
            </div>
            <div className="fg">
              <label className="fl">Copyright Line</label>
              <input className="fi" value={site.footerCopy || ''} onChange={e => upd('footerCopy', e.target.value)}/>
            </div>
            <div style={{ marginTop: 18, padding: 18, background: '#0D1525', borderRadius: 'var(--rsm)', color: '#fff' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 12 }}>
                Footer Preview
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', lineHeight: 1.8 }}>
                <div>📧 {site.footerEmail || 'email@example.com'}</div>
                <div>📞 {site.footerPhone || '+254 ...'}</div>
                {site.phone2 && <div>📞 {site.phone2}</div>}
                {site.whatsapp && <div>💬 WhatsApp: {site.whatsapp}</div>}
                <div style={{ marginTop: 6 }}>📍 {site.footerAddress || 'Address...'}</div>
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.15)', fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
                  {site.footerCopy || '© Year School Name'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helpful tip */}
      <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--b50)', border: '1px solid var(--b100)', borderRadius: 'var(--rsm)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <div style={{ fontSize: 13, color: 'var(--s700)', lineHeight: 1.6 }}>
          Changes save instantly to the platform when you click <strong>Save &amp; Publish</strong>. The live website at <strong>smartioushomeschool.com</strong> reflects updates immediately. Use the Preview Live Site button to verify before showing parents.
        </div>
      </div>
    </>
  )
}
