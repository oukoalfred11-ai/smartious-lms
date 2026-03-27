import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

// ── API ───────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({ baseURL: BASE })
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('sm_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('sm_token')
    localStorage.removeItem('sm_user')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})
export { api }

// ── AUTH ──────────────────────────────────────────────────
const AuthCtx = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = localStorage.getItem('sm_token')
    const u = localStorage.getItem('sm_user')
    if (t && u) { try { setUser(JSON.parse(u)) } catch {} }
    setLoading(false)
  }, [])
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('sm_token', data.token)
    localStorage.setItem('sm_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])
  const logout = useCallback(() => {
    localStorage.removeItem('sm_token')
    localStorage.removeItem('sm_user')
    setUser(null)
  }, [])
  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>
}
export const useAuth = () => useContext(AuthCtx)

// ── TOAST ─────────────────────────────────────────────────
const ToastCtx = createContext(null)
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((msg, type = 'info', dur = 3500) => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), dur)
  }, [])
  const t = { ok: m => toast(m, 'ok'), error: m => toast(m, 'error'), info: m => toast(m, 'info') }
  const dotCol = { ok: 'var(--g500)', error: 'var(--r500)', info: 'var(--b400)' }
  return (
    <ToastCtx.Provider value={t}>
      {children}
      <div className="toast-wrap">
        {toasts.map(x => (
          <div key={x.id} className={`toast ${x.type}`}>
            <div className="toast-dot" style={{ background: dotCol[x.type] }} />
            {x.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

// ── STORE ─────────────────────────────────────────────────
// Cross-portal shared state — articles, resources, messages,
// exam results, site config, fees, curricula, announcements.
// Persisted to localStorage so data survives page refresh.

function ls(key, fb) {
  try { const v = localStorage.getItem('sm2_' + key); return v ? JSON.parse(v) : fb } catch { return fb }
}
function ss(key, v) { try { localStorage.setItem('sm2_' + key, JSON.stringify(v)) } catch {} }

// ── Default fees (editable by admin) ─────────────────────
const DEFAULT_FEES = {
  individual_basic:    1499,
  individual_premium:  2999,
  individual_igcse:    3999,
  group_basic:          499,
  group_premium:        999,
  group_igcse:         1499,
  assessment:           2000,
  tuition_online:       1000,
  tuition_home:         1500,
  currency:            'KES',
}

// ── Default site config ───────────────────────────────────
const DEFAULT_SITE = {
  schoolName:    'Smartious Homeschool',
  headline:      'World-Class Education, Delivered to Your Home',
  subheadline:   'IGCSE · IB · British · CBC · American curricula. Individual and group learning. Live classes, AI tutoring.',
  cta1:          'Enrol Now — Free Assessment',
  cta2:          'View Pricing',
  stat1:         '2,418+ Students',
  stat2:         '127 Teachers',
  stat3:         '6 Curricula',
  stat4:         'Kenya · UAE · UK',
  footerCopy:    '© 2026 Smartious E-School Ltd. Nairobi, Kenya. All rights reserved.',
  footerEmail:   'info@smartious.ac.ke',
  footerPhone:   '+254 712 345 678',
  footerAddress: 'Diamond Plaza I, Parklands, Nairobi, Kenya',
  phone2:        '+254 733 456 789',
  whatsapp:      '+254 712 345 678',
  heroVideo:     '',
  aboutText:     'Smartious is Kenya\'s leading homeschool provider, offering both individual and group learning pathways across 6 international curricula.',
}

// ── Default curricula ─────────────────────────────────────
const DEFAULT_CURRICULA = [
  { id:'cur-001', name:'IGCSE', org:'Cambridge / Pearson Edexcel', students:894, subjects:12, status:'Active', grades:'Form 1–4', description:'International General Certificate of Secondary Education. Globally recognised, exam-focused.' },
  { id:'cur-002', name:'British Curriculum', org:'UK National Curriculum', students:612, subjects:10, status:'Active', grades:'Year 1–13', description:'Full UK national curriculum from primary through sixth form.' },
  { id:'cur-003', name:'IB Diploma', org:'International Baccalaureate', students:387, subjects:8, status:'Active', grades:'Years 11–12', description:'Rigorous two-year pre-university programme recognised worldwide.' },
  { id:'cur-004', name:'CBC / KCSE', org:'KNEC Kenya', students:341, subjects:9, status:'Active', grades:'Grade 1–12', description:'Kenya Competency-Based Curriculum and Kenya Certificate of Secondary Education.' },
  { id:'cur-005', name:'American Curriculum', org:'College Board / SAT', students:184, subjects:8, status:'Active', grades:'K–12', description:'US-aligned curriculum with SAT/ACT preparation.' },
  { id:'cur-006', name:'IB Primary Years', org:'IBO — PYP', students:0, subjects:6, status:'Draft', grades:'Ages 3–12', description:'International Baccalaureate Primary Years Programme.' },
]

// ── Seed data ─────────────────────────────────────────────
const SEED_ARTICLES = [
  { id:'art-001', title:'5 Ways to Make Quadratic Equations Fun', slug:'5-ways-quadratic', body:'Quadratic equations are one of the most important topics in IGCSE Mathematics...', subject:'Mathematics', author:'Mr. James Muthomi', authorInit:'JM', authorCol:'#3B82F6', date:'Feb 28, 2026', reads:1847, earnings:5541, status:'Published', cat:'igcse', img:'linear-gradient(135deg,#0D1525,#1B3060)', url:'/blog/5-ways-quadratic' },
  { id:'art-002', title:'Why Pythagoras Appears in Every IGCSE Exam', slug:'pythagoras-igcse', body:'Pythagoras Theorem underpins geometry, trigonometry and algebra...', subject:'Mathematics', author:'Mr. James Muthomi', authorInit:'JM', authorCol:'#3B82F6', date:'Feb 14, 2026', reads:3204, earnings:9612, status:'Published', cat:'igcse', img:'linear-gradient(135deg,#1A0500,#3D1200)', url:'/blog/pythagoras-igcse' },
]

const SEED_RESOURCES = [
  { id:'res-001', title:'Pythagoras Theorem Worksheet', type:'PDF', subject:'Mathematics', grade:'Form 3', size:'1.2 MB', downloads:34, addedBy:'Mr. Muthomi', date:'Mar 1, 2026', url:'#' },
  { id:'res-002', title:'Cambridge Past Papers 2018–2023', type:'PDF', subject:'Mathematics', grade:'Form 4', size:'18.3 MB', downloads:67, addedBy:'Mr. Muthomi', date:'Feb 20, 2026', url:'#' },
  { id:'res-003', title:'Biology Cell Division Notes', type:'PDF', subject:'Biology', grade:'Form 3', size:'2.1 MB', downloads:29, addedBy:'Dr. Ouma', date:'Feb 15, 2026', url:'#' },
  { id:'res-004', title:'Chemistry Periodic Table Reference', type:'PDF', subject:'Chemistry', grade:'Form 3', size:'0.9 MB', downloads:41, addedBy:'Dr. Ouma', date:'Feb 10, 2026', url:'#' },
  { id:'res-005', title:'Khan Academy — Pythagoras', type:'Link', subject:'Mathematics', grade:'All', size:'—', downloads:15, addedBy:'Mr. Muthomi', date:'Jan 30, 2026', url:'https://www.khanacademy.org' },
]

const SEED_LESSONS = [
  { id:'les-001', title:'Pythagoras Theorem — Full IGCSE Lesson', subject:'Mathematics', grade:'Form 3', youtubeUrl:'https://www.youtube.com/embed/aa6bs6Gl1Dw', description:'Complete IGCSE lesson with worked examples and exam tips.', addedBy:'Mr. Muthomi', date:'Mar 1, 2026', topic:'Pythagoras & Geometry' },
  { id:'les-002', title:'Quadratic Equations — Factorising', subject:'Mathematics', grade:'Form 3', youtubeUrl:'https://www.youtube.com/embed/2ZzuZvz33X0', description:'Step-by-step factorising for IGCSE.', addedBy:'Mr. Muthomi', date:'Feb 20, 2026', topic:'Algebra' },
  { id:'les-003', title:'Cell Structure and Function', subject:'Biology', grade:'Form 3', youtubeUrl:'https://www.youtube.com/embed/8IlzKri08kk', description:'Plant vs animal cells, organelles. IGCSE Biology.', addedBy:'Dr. Ouma', date:'Feb 15, 2026', topic:'Cell Structure' },
]

const SEED_MESSAGES = [
  { id:'msg-001', from:'Dr. Sarah Kimani', fromRole:'tutor', to:'Janet Osei', toRole:'parent', avatar:'SK', avatarCol:'#3B82F6', subject:"Amara's Progress Update", body:'Good morning Mrs. Osei. Amara scored 18/20 on the Pythagoras quiz!', time:'9:14 AM', date:'Today', read:false, thread:'t-001' },
  { id:'msg-002', from:'Mr. James Muthomi', fromRole:'teacher', to:'Janet Osei', toRole:'parent', avatar:'JM', avatarCol:'#22C55E', subject:"Mathematics Progress", body:"Amara's algebra scores have improved by 12% this term.", time:'Yesterday', date:'Yesterday', read:false, thread:'t-002' },
]

const SEED_RESULTS = [
  { id:'rx-001', student:'Amara Osei', exam:'Pythagoras Theorem Mock', subject:'Mathematics', score:72, total:100, grade:'B', date:'Mar 15, 2026', feedback:'Good grasp. Work on 3D applications.', status:'Released' },
  { id:'rx-002', student:'Amara Osei', exam:'Algebra Mid-Term', subject:'Mathematics', score:85, total:100, grade:'A', date:'Mar 1, 2026', feedback:'Excellent factorisation.', status:'Released' },
]

const SEED_ANNOUNCEMENTS = [
  { id:'ann-001', title:'Term 2 Schedule Now Available', body:'Term 2 timetable uploaded. All classes start Monday 7 April.', date:'Mar 20, 2026', type:'info', audience:['student','parent'] },
]

const SEED_PAYMENTS = [
  { id:'pay-001', desc:'Individual Premium — March 2026', amount:'KES 2,999', date:'Mar 15, 2026', method:'M-Pesa', status:'Paid', ref:'MPE240315001' },
  { id:'pay-002', desc:'Individual Premium — February 2026', amount:'KES 2,999', date:'Feb 15, 2026', method:'M-Pesa', status:'Paid', ref:'MPE240215001' },
]

// ── Group class rooms ─────────────────────────────────────
// Each class can have unlimited rooms, max 10 students per room
const SEED_GROUP_ROOMS = [
  { id:'room-001', name:'Mathematics A', subject:'Mathematics', curriculum:'IGCSE', grade:'Form 3', teacher:'Mr. James Muthomi', schedule:'Mon/Wed 9:00–10:00 AM', capacity:10, enrolled:6, students:['Amara Osei','Kofi Mensah','Faith Wanjiru','Brian Otieno','Zara Kamau','Peter Kamau'], status:'Active' },
  { id:'room-002', name:'Mathematics B', subject:'Mathematics', curriculum:'IGCSE', grade:'Form 3', teacher:'Mr. James Muthomi', schedule:'Mon/Wed 10:00–11:00 AM', capacity:10, enrolled:4, students:['Lydia Achieng','David Mwangi','Grace Mutua','Samuel Omondi'], status:'Active' },
  { id:'room-003', name:'Biology A', subject:'Biology', curriculum:'IGCSE', grade:'Form 3', teacher:'Dr. Achieng Ouma', schedule:'Tue/Thu 2:00–3:00 PM', capacity:10, enrolled:7, students:['Amara Osei','Faith Wanjiru','Kofi Mensah','Brian Otieno','Zara Kamau','Lydia Achieng','Peter Kamau'], status:'Active' },
]

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [siteConfig,    setSiteConfig]    = useState(() => ls('site',          DEFAULT_SITE))
  const [fees,          setFees]          = useState(() => ls('fees',          DEFAULT_FEES))
  const [curricula,     setCurricula]     = useState(() => ls('curricula',     DEFAULT_CURRICULA))
  const [articles,      setArticles]      = useState(() => ls('articles',      SEED_ARTICLES))
  const [resources,     setResources]     = useState(() => ls('resources',     SEED_RESOURCES))
  const [lessons,       setLessons]       = useState(() => ls('lessons',       SEED_LESSONS))
  const [messages,      setMessages]      = useState(() => ls('messages',      SEED_MESSAGES))
  const [results,       setResults]       = useState(() => ls('results',       SEED_RESULTS))
  const [announcements, setAnnouncements] = useState(() => ls('announcements', SEED_ANNOUNCEMENTS))
  const [payments,      setPayments]      = useState(() => ls('payments',      SEED_PAYMENTS))
  const [groupRooms,    setGroupRooms]    = useState(() => ls('grouprooms',    SEED_GROUP_ROOMS))

  useEffect(() => { ss('site',          siteConfig)    }, [siteConfig])
  useEffect(() => { ss('fees',          fees)          }, [fees])
  useEffect(() => { ss('curricula',     curricula)     }, [curricula])
  useEffect(() => { ss('articles',      articles)      }, [articles])
  useEffect(() => { ss('resources',     resources)     }, [resources])
  useEffect(() => { ss('lessons',       lessons)       }, [lessons])
  useEffect(() => { ss('messages',      messages)      }, [messages])
  useEffect(() => { ss('results',       results)       }, [results])
  useEffect(() => { ss('announcements', announcements) }, [announcements])
  useEffect(() => { ss('payments',      payments)      }, [payments])
  useEffect(() => { ss('grouprooms',    groupRooms)    }, [groupRooms])

  // Announcements helper — must be defined before functions that call it
  function addAnnouncement(ann) {
    const a = { id: 'ann-' + Date.now(), date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }), ...ann }
    setAnnouncements(p => [a, ...p])
    return a
  }
  function getAnnouncements(role) { return announcements.filter(a => !a.audience || a.audience.includes(role)) }

  // ── Site config ────────────────────────────────────────
  function updateSiteConfig(changes) { setSiteConfig(p => ({ ...p, ...changes })) }

  // ── Fees ──────────────────────────────────────────────
  function updateFees(changes) {
    setFees(p => ({ ...p, ...changes }))
    addAnnouncement({ title: 'Fee update', body: 'Admin updated the fee schedule. Please check the Payments page.', type: 'info', audience: ['student', 'parent'] })
  }
  function getFee(key) { return fees[key] || 0 }
  function fmtFee(key) { return (fees.currency || 'KES') + ' ' + (fees[key] || 0).toLocaleString() }

  // ── Curricula ──────────────────────────────────────────
  function addCurriculum(cur) {
    const c = { id: 'cur-' + Date.now(), students: 0, status: 'Active', ...cur }
    setCurricula(p => [...p, c])
    return c
  }
  function updateCurriculum(id, changes) { setCurricula(p => p.map(c => c.id === id ? { ...c, ...changes } : c)) }
  function deleteCurriculum(id) { setCurricula(p => p.filter(c => c.id !== id)) }

  // ── Articles ───────────────────────────────────────────
  function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60) }

  function publishArticle(draft) {
    const slug = slugify(draft.title)
    const article = { id: 'art-' + Date.now(), slug, url: '/blog/' + slug, reads: 0, earnings: 0, status: 'Published', date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }), authorInit: 'JM', authorCol: '#3B82F6', img: 'linear-gradient(135deg,#0D1525,#1B3060)', cat: 'igcse', ...draft }
    setArticles(p => [article, ...p])
    addAnnouncement({ title: 'New Article: ' + draft.title, body: (draft.author || 'A teacher') + ' published a new article.', type: 'article', audience: ['student', 'parent'] })
    return article
  }
  function saveDraft(draft) {
    const article = { id: 'art-' + Date.now(), slug: slugify(draft.title), url: '', reads: 0, earnings: 0, status: 'Draft', date: 'Draft', authorInit: 'JM', authorCol: '#3B82F6', img: 'linear-gradient(135deg,#0D1525,#1B3060)', cat: 'igcse', ...draft }
    setArticles(p => [article, ...p])
    return article
  }
  function updateArticle(id, changes) { setArticles(p => p.map(a => a.id === id ? { ...a, ...changes } : a)) }
  function deleteArticle(id) { setArticles(p => p.filter(a => a.id !== id)) }

  // ── Resources ──────────────────────────────────────────
  function addResource(r) {
    const res = { id: 'res-' + Date.now(), downloads: 0, date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }), url: '#', ...r }
    setResources(p => [res, ...p])
    addAnnouncement({ title: 'New Resource: ' + r.title, body: (r.addedBy || 'Your teacher') + ' uploaded a new resource.', type: 'resource', audience: ['student', 'parent'] })
    return res
  }
  function deleteResource(id) { setResources(p => p.filter(r => r.id !== id)) }
  function downloadResource(resource) {
    if (resource.type === 'Link') { window.open(resource.url || '#', '_blank'); return }
    const txt = ['SMARTIOUS HOMESCHOOL', '='.repeat(40), '', resource.title, '-'.repeat(Math.min(resource.title.length, 40)), '', 'Subject: ' + (resource.subject || ''), 'Grade: ' + (resource.grade || ''), 'Added by: ' + (resource.addedBy || ''), '', '='.repeat(40), 'SAMPLE CONTENT', '='.repeat(40), '', 'This is a sample resource from Smartious Homeschool.', 'In production this would be the actual ' + (resource.type || 'PDF') + ' file.', '', 'Practice Questions:', '1. Define the key concept.', '2. Give two real-world examples.', '3. Show a worked calculation.', '4. What is the exam approach?', '', '='.repeat(40), 'www.smartioushomeschool.com', '© 2026 Smartious E-School Ltd.'].join('\n')
    const blob = new Blob([txt], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = (resource.title || 'resource').replace(/[^a-z0-9]/gi, '_') + '.txt'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── Lessons ────────────────────────────────────────────
  function addLesson(lesson) {
    const l = { id: 'les-' + Date.now(), date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }), ...lesson }
    setLessons(p => [l, ...p])
    addAnnouncement({ title: 'New Lesson: ' + lesson.title, body: (lesson.addedBy || 'Your teacher') + ' uploaded a video lesson.', type: 'resource', audience: ['student', 'parent'] })
    return l
  }

  // ── Messages ───────────────────────────────────────────
  function sendMessage(msg) {
    const m = { id: 'msg-' + Date.now(), time: new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }), date: 'Today', read: false, thread: msg.thread || ('t-' + Date.now()), ...msg }
    setMessages(p => [m, ...p])
    return m
  }
  function markRead(id) { setMessages(p => p.map(m => m.id === id ? { ...m, read: true } : m)) }
  function getThreads(role, name) {
    const mine = messages.filter(m => m.from === name || m.to === name)
    const map = {}
    mine.forEach(m => {
      const tid = m.thread || m.id
      if (!map[tid]) map[tid] = { id: tid, messages: [], unread: 0 }
      map[tid].messages.push(m)
      if (!m.read && m.to === name) map[tid].unread++
    })
    return Object.values(map).sort((a, b) => b.messages[0].id.localeCompare(a.messages[0].id))
  }
  function getUnreadCount(name) { return messages.filter(m => !m.read && m.to === name).length }

  // ── Exam results ───────────────────────────────────────
  function postResult(result) {
    const r = { id: 'rx-' + Date.now(), date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }), status: 'Released', ...result }
    setResults(p => [r, ...p])
    sendMessage({ from: result.teacher || 'Mr. James Muthomi', fromRole: 'teacher', to: result.studentParent || 'Janet Osei', toRole: 'parent', avatar: 'JM', avatarCol: '#22C55E', subject: result.exam + ' — Results', body: result.student + ' scored ' + result.score + '/' + result.total + ' (' + result.grade + '). Feedback: ' + result.feedback, thread: 'tresult-' + Date.now() })
    return r
  }
  function getStudentResults(name) { return results.filter(r => r.student === name) }

  // ── Payments ───────────────────────────────────────────
  function addPayment(p) {
    const pay = { id: 'pay-' + Date.now(), date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }), status: 'Paid', ref: (p.method === 'M-Pesa' ? 'MPE' : 'CRD') + Date.now().toString().slice(-9), ...p }
    setPayments(prev => [pay, ...prev])
    return pay
  }

  // ── Group rooms ────────────────────────────────────────
  function addGroupRoom(room) {
    const r = { id: 'room-' + Date.now(), enrolled: 0, students: [], status: 'Active', capacity: 10, ...room }
    setGroupRooms(p => [...p, r])
    return r
  }
  function updateGroupRoom(id, changes) { setGroupRooms(p => p.map(r => r.id === id ? { ...r, ...changes } : r)) }
  function deleteGroupRoom(id) { setGroupRooms(p => p.filter(r => r.id !== id)) }
  function joinGroupRoom(roomId, studentName) {
    setGroupRooms(p => p.map(r => {
      if (r.id !== roomId) return r
      if (r.enrolled >= r.capacity) return r
      if (r.students.includes(studentName)) return r
      return { ...r, enrolled: r.enrolled + 1, students: [...r.students, studentName] }
    }))
  }
  function getRoomsForSubject(subject) { return groupRooms.filter(r => r.subject === subject) }
  function getAvailableRooms() { return groupRooms.filter(r => r.enrolled < r.capacity) }

  const value = {
    // Site
    siteConfig, updateSiteConfig,
    // Fees (admin-controlled, read everywhere)
    fees, updateFees, getFee, fmtFee,
    // Curricula
    curricula, addCurriculum, updateCurriculum, deleteCurriculum,
    // Articles
    articles, publishArticle, saveDraft, updateArticle, deleteArticle,
    // Resources
    resources, addResource, deleteResource, downloadResource,
    // Lessons
    lessons, addLesson,
    // Messages
    messages, sendMessage, markRead, getThreads, getUnreadCount,
    // Results
    results, postResult, getStudentResults,
    // Announcements
    announcements, addAnnouncement, getAnnouncements,
    // Payments
    payments, addPayment,
    // Group rooms
    groupRooms, addGroupRoom, updateGroupRoom, deleteGroupRoom, joinGroupRoom, getRoomsForSubject, getAvailableRooms,
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
