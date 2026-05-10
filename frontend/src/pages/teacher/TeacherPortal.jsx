import { useState, useRef, useEffect } from 'react'
import { useToast, api } from '../../context/ctx.jsx'
import { useStore } from '../../context/ctx.jsx'
import Modal from '../../components/ui/Modal.jsx'

// ── SVG icon helper ──────────────────────────────────────
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

const Av = ({ init, col, size = 36 }) => (
  <div style={{ width:size, height:size, borderRadius:'50%', background:col+'20', color:col, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'JetBrains Mono,monospace', fontSize:Math.round(size*.32), fontWeight:700, flexShrink:0 }}>{init}</div>
)

const ScoreBar = ({ pct }) => {
  const col = pct>=75?'var(--g600)':pct>=60?'var(--a600)':'var(--r500)'
  return <div className="prog-bar"><div className="prog-fill" style={{ width:pct+'%', background:col }}/></div>
}

const STUDENTS = [
  {name:'Amara Osei',   init:'AO',col:'#3B82F6',score:72,trend:'up',att:88,status:'Good'},
  {name:'Kofi Mensah',  init:'KM',col:'#22C55E',score:88,trend:'up',att:96,status:'Excellent'},
  {name:'Zara Kamau',   init:'ZK',col:'#8B5CF6',score:65,trend:'down',att:82,status:'Good'},
  {name:'Brian Otieno', init:'BO',col:'#F59E0B',score:79,trend:'up',att:90,status:'Good'},
  {name:'Faith Wanjiru',init:'FW',col:'#EC4899',score:91,trend:'up',att:98,status:'Excellent'},
  {name:'David Mwangi', init:'DM',col:'#14B8A6',score:58,trend:'down',att:74,status:'At Risk'},
  {name:'Lydia Achieng',init:'LA',col:'#F97316',score:76,trend:'up',att:85,status:'Good'},
  {name:'Peter Kamau',  init:'PK',col:'#06B6D4',score:62,trend:'down',att:78,status:'At Risk'},
]

const RESOURCES = [
  {t:'Pythagoras Theorem Worksheet',   type:'PDF',  sub:'Mathematics',cls:'Form 3',size:'1.2 MB', dl:34, colBg:'var(--r50)',colSt:'var(--r600)', ai:'Concise worksheet covering Pythagorean triples and word problems. 12 questions.'},
  {t:'Trigonometry Lecture Slides',    type:'Slides',sub:'Mathematics',cls:'Form 3',size:'4.8 MB', dl:28, colBg:'var(--a50)',colSt:'var(--a600)', ai:'14-slide deck introducing SOHCAHTOA with worked examples.'},
  {t:'Cambridge Past Papers 2018–2023',type:'PDF',  sub:'Mathematics',cls:'Form 4',size:'18.3 MB',dl:67, colBg:'var(--r50)',colSt:'var(--r600)', ai:'6 years of Cambridge IGCSE Maths Papers 1 & 2.'},
  {t:'Algebra Video Lesson',           type:'Video',sub:'Mathematics',cls:'Form 2',size:'280 MB', dl:22, colBg:'var(--p50)',colSt:'var(--p600)', ai:'45-minute recorded lesson on factorisation.'},
  {t:'Number Theory Reference Sheet',  type:'PDF',  sub:'Mathematics',cls:'Form 1',size:'0.8 MB', dl:41, colBg:'var(--r50)',colSt:'var(--r600)', ai:'Quick-reference for prime numbers, LCM, HCF.'},
  {t:'Khan Academy — Pythagoras',      type:'Link', sub:'Mathematics',cls:'All',   size:'—',      dl:15, colBg:'var(--b50)',colSt:'var(--b600)', ai:'Curated external resource for interactive Pythagoras practice.'},
]

const EXAM_QS = [
  {type:'MCQ',text:'In a right-angled triangle with legs 3 cm and 4 cm, the hypotenuse is:',marks:5},
  {type:'MCQ',text:'If c = 13 and a = 5 in a right-angled triangle, then b equals:',marks:5},
  {type:'Short Answer',text:'A ladder is 10 m long and its base is 6 m from a wall. How high up the wall does it reach? Show all working.',marks:10},
  {type:'Essay',text:'Explain three real-world applications of Pythagoras Theorem and demonstrate each with a worked example.',marks:20},
  {type:'MCQ',text:'Which set of numbers forms a Pythagorean triple?',marks:5},
]

const MARK_STU = [
  {name:'Amara Osei', init:'AO',col:'#3B82F6',scores:[18,15,8,16,10],ai:8, plag:3, copy:12},
  {name:'Kofi Mensah', init:'KM',col:'#22C55E',scores:[20,18,10,18,12],ai:5, plag:1, copy:6},
  {name:'Zara Kamau',  init:'ZK',col:'#8B5CF6',scores:[15,12,6,12,8], ai:6, plag:4, copy:9},
  {name:'Faith Wanjiru',init:'FW',col:'#EC4899',scores:[20,19,10,20,14],ai:4,plag:0, copy:3},
  {name:'David Mwangi',init:'DM',col:'#14B8A6',scores:[12,10,5,10,7], ai:15,plag:22,copy:38,flagged:true},
]

const ALLOCS = [
  {student:'Amara Osei',  curriculum:'IGCSE',  subject:'Mathematics',slot:'Mon/Wed 10:00–11:00 AM', fee:'KES 1,500/session',status:'Active'},
  {student:'Kofi Mensah', curriculum:'A-Level', subject:'Mathematics',slot:'Tue/Thu 2:00–3:00 PM',  fee:'KES 1,500/session',status:'Active'},
  {student:'Zara Kamau',  curriculum:'IGCSE',  subject:'Mathematics',slot:'Mon/Fri 9:00–10:00 AM',  fee:'KES 1,500/session',status:'Active'},
  {student:'Grace Mutua', curriculum:'British', subject:'Mathematics',slot:'Wed/Sat 11:00 AM–12 PM',fee:'KES 1,500/session',status:'Pending'},
]

const PAYSLIPS = [
  {month:'January 2026',att:22,offhrs:8,reads:142,videos:3,gross:'KES 40,126',tax:'KES 4,013',net:'KES 36,113',status:'Paid'},
  {month:'December 2025',att:20,offhrs:5,reads:89, videos:2,gross:'KES 34,267',tax:'KES 3,427',net:'KES 30,840',status:'Paid'},
  {month:'November 2025',att:21,offhrs:11,reads:201,videos:4,gross:'KES 37,903',tax:'KES 3,790',net:'KES 34,113',status:'Paid'},
]

const BLOG_POSTS = [
  {title:'5 Ways to Make Quadratic Equations Fun for IGCSE Students',reads:1847,earnings:'KES 5,541',date:'Feb 28',status:'Published'},
  {title:'Why Pythagoras Theorem Appears in Every IGCSE Exam',reads:3204,earnings:'KES 9,612',date:'Feb 14',status:'Published'},
  {title:'How I Use AI to Give Better Exam Feedback',reads:892,earnings:'KES 2,676',date:'Jan 30',status:'Published'},
  {title:'Teaching Trigonometry: From SOHCAHTOA to Applications',reads:0,earnings:'KES 0',date:'Draft',status:'Draft'},
]

export default function TeacherPortal() {
  const toast  = useToast()
  const store  = useStore()

  // Load logged-in user from localStorage (set during login)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sm_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  // Refresh user from backend on mount (in case localStorage is stale)
  useEffect(() => {
    const token = localStorage.getItem('sm_token')
    if (!token) return
    api.get('/auth/me')
      .then(res => {
        if (res.data?.user) {
          setCurrentUser(res.data.user)
          try { localStorage.setItem('sm_user', JSON.stringify(res.data.user)) } catch {}
        }
      })
      .catch(() => { /* keep localStorage version */ })
  }, [])

  // Computed display name (used throughout the portal)
  const teacherName = currentUser
    ? ('Mr. ' + (currentUser.firstName || '') + ' ' + (currentUser.lastName || '')).trim()
    : 'Teacher'

  const [page, setPage] = useState('dashboard')
  const [collapsed, setSidebarCollapsed] = useState(false)
  const [uploadModal, setUploadModal] = useState(false)
  const [uploadStep, setUploadStep] = useState(1)
  const [markDetail, setMarkDetail] = useState(null)
  const [ebStep, setEbStep] = useState(1)
  const [chatMsgs, setChatMsgs] = useState([
    { role:'ai', text:'24 papers marked. Class average 73%. David Mwangi\'s paper requires review — 3 integrity flags detected.' }
  ])
  const [chatInp, setChatInp] = useState('')

  // ── Blog editor state ────────────────────────────────
  const [blogEditor, setBlogEditor] = useState(false)
  const [blogTitle, setBlogTitle]   = useState('')
  const [blogBody,  setBlogBody]    = useState('')
  const [blogSubject, setBlogSubject] = useState('Mathematics')
  const [blogCat,   setBlogCat]     = useState('igcse')
  const [editingArticle, setEditingArticle] = useState(null)

  // ── Resource upload form state ───────────────────────
  const [uploadTitle,   setUploadTitle]   = useState('')
  const [uploadSubject, setUploadSubject] = useState('Mathematics')
  const [uploadGrade,   setUploadGrade]   = useState('Form 3')
  const [uploadType,    setUploadType]    = useState('PDF')
  const [uploadYouTube, setUploadYouTube] = useState('')
  const [uploadTopic,   setUploadTopic]   = useState('')

  // ── Message compose state ────────────────────────────
  const [msgModal,     setMsgModal]     = useState(false)
  const [msgTo,        setMsgTo]        = useState('')
  const [msgToRole,    setMsgToRole]    = useState('parent')
  const [msgSubject,   setMsgSubject]   = useState('')
  const [msgBody,      setMsgBody]      = useState('')
  const [activeThread, setActiveThread] = useState(null)
  const [replyText,    setReplyText]    = useState('')

  // ── Exam result post state ────────────────────────────
  const [resultModal,    setResultModal]    = useState(false)
  const [resultStudent,  setResultStudent]  = useState('')
  const [resultExam,     setResultExam]     = useState('Pythagoras Theorem Mock')
  const [resultScore,    setResultScore]    = useState('')
  const [resultTotal,    setResultTotal]    = useState('100')
  const [resultFeedback, setResultFeedback] = useState('')
  // Real students fetched from backend (used by Send Message + Post Exam Result modals)
  const [allStudents, setAllStudents] = useState([])
  useEffect(() => {
    const token = localStorage.getItem('sm_token')
    if (!token) return
    api.get('/users?role=student')
      .then(res => {
        if (res.data?.users) {
          setAllStudents(res.data.users)
        }
      })
      .catch(err => console.error('[teacher] failed to load students:', err))
  }, [])

  // ── Derived from store ───────────────────────────────
  const myArticles = store.articles.filter(a => a.author === teacherName)
  const totalReads = myArticles.reduce((s, a) => s + (a.reads || 0), 0)
  const totalEarnings = myArticles.reduce((s, a) => s + (a.earnings || 0), 0)
  const myThreads  = store.getThreads('teacher', teacherName)
  const unreadCount = myThreads.reduce((s, t) => s + t.unread, 0)

  // ── Blog publish ─────────────────────────────────────
  const handlePublish = (asDraft) => {
    if (!blogTitle.trim()) { toast.error('Title is required'); return }
    if (!asDraft && !blogBody.trim()) { toast.error('Write something before publishing'); return }
    const draft = {
      title:      blogTitle,
      body:       blogBody,
      subject:    blogSubject,
      cat:        blogCat,
      author:     teacherName,
      authorInit: ((currentUser?.firstName?.[0] || 'T') + (currentUser?.lastName?.[0] || '')).toUpperCase(),
      authorCol:  '#3B82F6',
      img:        blogCat === 'igcse' ? 'linear-gradient(135deg,#0D1525,#1B3060)' : 'linear-gradient(135deg,#0D1A0D,#1A3D1A)',
    }
    if (editingArticle) {
      if (asDraft) {
        store.updateArticle(editingArticle.id, { ...draft, status:'Draft', url:'', date:'Draft' })
        toast.ok('Draft saved')
      } else {
        const slug = blogTitle.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-')
        store.updateArticle(editingArticle.id, { ...draft, status:'Published', url:'/blog/'+slug,
          date: new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),
          reads: editingArticle.reads || 0, earnings: editingArticle.earnings || 0 })
        toast.ok('Article updated and published!')
      }
    } else {
      if (asDraft) {
        store.saveDraft(draft)
        toast.ok('Draft saved')
      } else {
        const art = store.publishArticle(draft)
        toast.ok('Published! URL: ' + art.url)
      }
    }
    setBlogEditor(false); setBlogTitle(''); setBlogBody(''); setEditingArticle(null)
  }

  const openEditor = (article) => {
    setEditingArticle(article)
    setBlogTitle(article.title)
    setBlogBody(article.body || '')
    setBlogSubject(article.subject || 'Mathematics')
    setBlogCat(article.cat || 'igcse')
    setBlogEditor(true)
  }

  // ── Resource publish ─────────────────────────────────
  const handlePublishResource = () => {
    if (!uploadTitle.trim()) { toast.error('Resource title is required'); return }
    store.addResource({
      title:    uploadTitle,
      type:     uploadYouTube ? 'Video' : uploadType,
      subject:  uploadSubject,
      grade:    uploadGrade,
      size:     '—',
      addedBy:  teacherName,
    })
    // If a YouTube URL was provided, also save as a lesson
    if (uploadYouTube.trim()) {
      // Convert watch URL to embed URL
      let embedUrl = uploadYouTube.trim()
      if (embedUrl.includes('youtube.com/watch?v=')) {
        embedUrl = 'https://www.youtube.com/embed/' + embedUrl.split('v=')[1].split('&')[0]
      } else if (embedUrl.includes('youtu.be/')) {
        embedUrl = 'https://www.youtube.com/embed/' + embedUrl.split('youtu.be/')[1].split('?')[0]
      }
      store.addLesson({
        title:      uploadTitle,
        subject:    uploadSubject,
        grade:      uploadGrade,
        youtubeUrl: embedUrl,
        topic:      uploadTopic || uploadTitle,
        addedBy:    teacherName,
        description: 'Lesson video for ' + uploadSubject + ' — ' + uploadGrade,
      })
      toast.ok('Video lesson published! Students can watch it in the Lesson Player.')
    } else {
      toast.ok('Resource published to student library!')
    }
    setUploadModal(false); setUploadStep(1); setUploadTitle(''); setUploadYouTube(''); setUploadTopic('')
  }

  // ── Send message ─────────────────────────────────────
  const handleSendMsg = () => {
    if (!msgSubject.trim() || !msgBody.trim()) { toast.error('Subject and message are required'); return }
    store.sendMessage({
      from:     'Mr. James Muthomi',
      fromRole: 'teacher',
      to:       msgTo,
      toRole:   msgToRole,
      avatar:   'JM',
      avatarCol:'#22C55E',
      subject:  msgSubject,
      body:     msgBody,
    })
    toast.ok('Message sent to ' + msgTo)
    setMsgModal(false); setMsgSubject(''); setMsgBody('')
  }

  const handleReply = (thread) => {
    if (!replyText.trim()) return
    const last = thread.messages[0]
    store.sendMessage({
      from:     'Mr. James Muthomi',
      fromRole: 'teacher',
      to:       last.from === 'Mr. James Muthomi' ? last.to : last.from,
      toRole:   last.from === 'Mr. James Muthomi' ? last.toRole : last.fromRole,
      avatar:   'JM',
      avatarCol:'#22C55E',
      subject:  'Re: ' + (last.subject || '').replace(/^Re: /,''),
      body:     replyText,
      thread:   thread.id,
    })
    toast.ok('Reply sent')
    setReplyText('')
  }

  // ── Post exam result ─────────────────────────────────
  const handlePostResult = () => {
    if (!resultScore || !resultFeedback.trim()) { toast.error('Score and feedback are required'); return }
    const score = parseInt(resultScore)
    const total = parseInt(resultTotal)
    const pct   = Math.round((score / total) * 100)
    const grade = pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F'
    store.postResult({
      student:       resultStudent,
      studentParent: 'Janet Osei',
      exam:          resultExam,
      subject:       'Mathematics',
      score,
      total,
      grade,
      feedback:      resultFeedback,
      teacher:       'Mr. James Muthomi',
    })
    toast.ok('Results released to ' + resultStudent + ' and parent!')
    setResultModal(false); setResultScore(''); setResultFeedback('')
  }

  // ── Mastery heatmap state ────────────────────────────
  const [heatmapStudent, setHeatmapStudent] = useState(null)
  const [heatmapData,    setHeatmapData]    = useState(null)
  const [heatmapLoading, setHeatmapLoading] = useState(false)

  const loadHeatmap = async (studentId, studentName) => {
    if (!studentId) return
    setHeatmapLoading(true)
    setHeatmapStudent(studentName)
    try {
      const { data } = await api.get(`/mastery/heatmap/${studentId}`)
      if (data.success) setHeatmapData(data.heatmap)
    } catch { setHeatmapData(null) }
    setHeatmapLoading(false)
  }

  // ── Mastery colour helper ──────────────────────────
  const mCol = (pct) => pct >= 80 ? 'var(--g600)' : pct >= 60 ? 'var(--b600)' : pct >= 40 ? 'var(--a600)' : pct > 0 ? 'var(--r500)' : 'var(--s300)'
  const mLabel = (pct) => pct >= 80 ? 'Mastered' : pct >= 60 ? 'Progressing' : pct >= 40 ? 'Building' : pct > 0 ? 'Needs Help' : 'Not Started'
  const [wbColor, setWbColor] = useState('#fff')
  const [wbTool, setWbTool] = useState('pen')
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)

  const pageTitles = {
    dashboard: 'Dashboard',
    students: 'My Students',
    liveclass: 'Live Classes',
    classroom: 'Live Studio',
    questionbank: 'Question Bank',
    exambuilder: 'Exams',
    marking: 'Homework',
    communication: 'Messages',
    mshauri: 'Mshauri AI',
    profile: 'My Profile',
  }

  const sendChat = () => {
    if (!chatInp.trim()) return
    const q = chatInp
    setChatInp('')
    setChatMsgs(m => [...m, { role:'user', text:q }])
    setTimeout(() => {
      setChatMsgs(m => [...m, { role:'ai', text: q.toLowerCase().includes('david') ? 'David Mwangi shows 22% plagiarism and 38% unusual copy-paste patterns. Recommend 1-to-1 review before releasing marks.' : 'Class average is 73%, above school average of 69%. Faith Wanjiru leads with 91%. Additional support recommended for David Mwangi and Peter Kamau.' }])
    }, 800)
  }

  const nav = [
    { section:'Teaching', items:[
      {id:'dashboard',     label:'Dashboard',        icon:'rect:3:3:7:7:1|rect:14:3:7:7:1|rect:14:14:7:7:1|rect:3:14:7:7:1'},
      {id:'students',      label:'My Students',      icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|circle:9:7:4|M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'},
      {id:'liveclass',     label:'Live Classes',     icon:'rect:2:3:20:14:2|M8 21h8M12 17v4', live:true},
    ]},
    { section:'Assessment', items:[
      {id:'questionbank',  label:'Question Bank',    icon:'M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13|M4 19a2 2 0 0 0 2 2h14|M8 10h8M8 14h6|circle:18:18:3'},
      {id:'exambuilder',   label:'Exams',            icon:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2|rect:9:3:6:4:1.5|line:9:12:15:12|line:9:16:12:16'},
      {id:'marking',       label:'Homework',         icon:'M9 11l3 3L22 4|M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'},
    ]},
    { section:'Communication', items:[
      {id:'communication', label:'Messages',         icon:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'},
    ]},
    { section:'Assistant', items:[
      {id:'mshauri',       label:'Mshauri AI',       icon:'M12 2L2 7l10 5 10-5-10-5z|M2 17l10 5 10-5|M2 12l10 5 10-5'},
    ]},
    { section:'Account', items:[
      {id:'profile',       label:'My Profile',       icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|circle:12:7:4'},
    ]},
  ]

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className={`sidebar${collapsed?' col':''}`}>
        <div className="sb-logo">
          <div className="sb-mark">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/>
            </svg>
          </div>
          <div>
            <div className="sb-text">Smartious<span>.</span></div>
            <div className="sb-sub">Teacher Portal</div>
          </div>
        </div>
        <button onClick={() => setSidebarCollapsed(c=>!c)} style={{ position:'absolute',top:22,right:-13,width:26,height:26,background:'var(--s700)',border:'2px solid var(--s600)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',zIndex:10 }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,.7)" strokeWidth="2.5" strokeLinecap="round" style={{transform:collapsed?'rotate(180deg)':'none',transition:'transform .25s'}}><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <nav style={{ flex:1, paddingTop:8 }}>
          {nav.map((s,si) => (
            <div key={si}>
              <div className="sb-sec">{s.section}</div>
              {s.items.map(item => (
                <div key={item.id} className={`nav-item${page===item.id?' active':''}`} onClick={() => setPage(item.id)}>
                  <div className="nav-icon"><Ico d={item.icon} /></div>
                  <span className="sb-lbl">{item.label}</span>
                  {item.badge && <span className="sb-badge" style={item.badgeCol?{background:item.badgeCol}:{}}>{item.badge}</span>}
                  {item.live && <div className="sb-live-dot"/>}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sb-user">
          <Av
            init={((currentUser?.firstName?.[0] || 'T') + (currentUser?.lastName?.[0] || '')).toUpperCase()}
            col="#3B82F6"
            size={36}
          />
          <div className="sb-uinfo">
            <div className="sb-uname">{teacherName}</div>
            <div className="sb-urole">{currentUser?.subject || 'Teacher'}</div>
          </div>
        </div>
        <div className="sb-back" onClick={() => window.location.href='/'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          <span className="sb-lbl">Back to Website</span>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <div className="topbar">
          <div className="tb-title">{pageTitles[page]}</div>
          <div className="tb-right">
            <button className="btn btn-s btn-sm" onClick={() => { setMsgSubject(''); setMsgBody(''); setMsgModal(true) }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Message
            </button>
            {page === 'liveclass' && (
              <div className="tb-chip live" onClick={() => setPage('liveclass')}>
                <div style={{width:7,height:7,borderRadius:'50%',background:'var(--r500)',animation:'pulse 2s infinite'}}/>
                Live Classes
              </div>
            )}
            <div className="tb-chip">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span className="mono">{new Date().toLocaleTimeString('en-GB')}</span>
            </div>
            <button className="tb-chip" onClick={() => { localStorage.clear(); window.location.href='/login' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>

        <div className="content" style={{animation:'fadeIn .25s ease'}}>

          {/* ── DASHBOARD ── */}
          {page === 'dashboard' && <TeacherDashboardTab user={currentUser} store={store} setPage={setPage} toast={toast} setMsgModal={setMsgModal} setUploadModal={setUploadModal} />}


          {/* ── LIVE CLASSROOM (PRO) ── */}
          {page === 'classroom' && (
            <TeacherLiveStudio
              user={currentUser}
              onLeave={() => { setPage('dashboard'); toast?.ok?.('Session ended. Recording saved.') }}
              toast={toast}
            />
          )}

          {/* ── MY STUDENTS ── */}
          {page === 'students' && <MyStudentsTab user={currentUser} store={store} setPage={setPage} toast={toast} setMsgTo={setMsgTo} setMsgSubject={setMsgSubject} setMsgBody={setMsgBody} setMsgModal={setMsgModal} />}


          {/* ── QUESTION BANK ── */}
          {page === 'questionbank' && <QuestionBankTab user={currentUser} store={store} setPage={setPage} toast={toast} />}

          {/* ── EXAMS ── */}
          {page === 'exambuilder' && <ExamsTab user={currentUser} store={store} setPage={setPage} toast={toast} />}


          {/* ── AI MARKING ── */}
          {/* ── HOMEWORK ── */}
          {page === 'marking' && <HomeworkTab user={currentUser} store={store} setPage={setPage} toast={toast} />}


         {/* ── LIVE LESSONS ── (real data from backend) */}
          {page === 'liveclass' && (
            <TeacherLiveClassesTab user={currentUser} toast={toast} />
          )}

           {/* ── COMMUNICATION ── */}
           {page === 'communication' && <CommunicationTab user={currentUser} store={store} setPage={setPage} toast={toast} />}

           {/* ── MSHAURI AI ── */}
           {page === 'mshauri' && <MshauriAITab user={currentUser} store={store} setPage={setPage} toast={toast} />}

           {/* ── PROFILE ── */}
           {page === 'profile' && <TeacherProfileTab user={currentUser} store={store} setPage={setPage} toast={toast} />}


        </div>
      </main>

      {/* ── Mshauri Floating Button & Panel ── */}
      <MshauriFloatingButton user={currentUser} setPage={setPage} toast={toast} currentPage={page}/>

      {/* ── Send Message Modal ── */}
      <Modal open={msgModal} onClose={() => setMsgModal(false)} title="Send Message" size="md"
        footer={<><button className="btn btn-p" onClick={handleSendMsg}>Send Message</button><button className="btn btn-s" onClick={() => setMsgModal(false)}>Cancel</button></>}>
        <div>
          <div className="fg">
            <label className="fl">To</label>
            <select className="fsel" value={msgTo} onChange={e => setMsgTo(e.target.value)}>
              <option value="">-- Select recipient --</option>
              <option value="all">All Students</option>
              {allStudents.length === 0 && (
                <option value="" disabled>No students enrolled yet</option>
              )}
              {allStudents.map(s => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} (Student)
                </option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Subject *</label>
            <input className="fi" value={msgSubject} onChange={e => setMsgSubject(e.target.value)} placeholder="e.g. Amara's Mathematics Progress"/>
          </div>
          <div className="fg">
            <label className="fl">Message *</label>
            <textarea className="fi" rows={5} value={msgBody} onChange={e => setMsgBody(e.target.value)} placeholder="Type your message…" style={{resize:'vertical'}}/>
          </div>
        </div>
      </Modal>

      {/* ── Post Exam Result Modal ── */}
      <Modal open={resultModal} onClose={() => setResultModal(false)} title="Release Exam Result" size="md"
        footer={<><button className="btn btn-ok" onClick={handlePostResult}>Release to Student & Parent</button><button className="btn btn-s" onClick={() => setResultModal(false)}>Cancel</button></>}>
        <div>
          <div className="fg">
            <label className="fl">Student</label>
            <select className="fsel" value={resultStudent} onChange={e => setResultStudent(e.target.value)}>
              <option value="">-- Select student --</option>
              {allStudents.length === 0 && (
                <option value="" disabled>No students enrolled yet</option>
              )}
              {allStudents.map(s => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Exam</label>
            <input className="fi" value={resultExam} onChange={e => setResultExam(e.target.value)} placeholder="e.g. Pythagoras Theorem Mock"/>
          </div>
          <div className="fr2">
            <div className="fg">
              <label className="fl">Score *</label>
              <input className="fi" type="number" min="0" value={resultScore} onChange={e => setResultScore(e.target.value)} placeholder="e.g. 72"/>
            </div>
            <div className="fg">
              <label className="fl">Out of</label>
              <input className="fi" type="number" min="1" value={resultTotal} onChange={e => setResultTotal(e.target.value)}/>
            </div>
          </div>
          {resultScore && resultTotal && (
            <div style={{background:'var(--b50)',border:'1px solid var(--b100)',borderRadius:'var(--rmd)',padding:'10px 14px',marginBottom:12,fontSize:13.5}}>
              Grade: <strong style={{color: parseInt(resultScore)/parseInt(resultTotal)>=0.8?'var(--g600)':parseInt(resultScore)/parseInt(resultTotal)>=0.6?'var(--a600)':'var(--r500)'}}>
                {Math.round(parseInt(resultScore)/parseInt(resultTotal)*100)}% —{' '}
                {parseInt(resultScore)/parseInt(resultTotal)>=0.8?'A':parseInt(resultScore)/parseInt(resultTotal)>=0.7?'B':parseInt(resultScore)/parseInt(resultTotal)>=0.6?'C':parseInt(resultScore)/parseInt(resultTotal)>=0.5?'D':'F'}
              </strong>
            </div>
          )}
          <div className="fg">
            <label className="fl">Feedback to Student *</label>
            <textarea className="fi" rows={4} value={resultFeedback} onChange={e => setResultFeedback(e.target.value)} placeholder="Specific feedback on performance and areas to improve…" style={{resize:'vertical'}}/>
          </div>
          <div style={{background:'var(--a50)',border:'1px solid var(--a100)',borderRadius:'var(--rmd)',padding:'10px 14px',fontSize:13,color:'var(--a600)'}}>
            Releasing will notify the student and their parent automatically via the Messages system.
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Upload Resource" size="md"
        footer={uploadStep===1
          ? <button className="btn btn-p btn-lg" style={{width:'100%',justifyContent:'center'}} onClick={() => setUploadStep(2)}>Continue — Generate AI Summary <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
          : <div style={{display:'flex',gap:10,width:'100%'}}><button className="btn btn-s" onClick={() => setUploadStep(1)}>Back</button><button className="btn btn-ok btn-lg" style={{flex:1,justifyContent:'center'}} onClick={handlePublishResource}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Publish to Student Library</button></div>
        }>
        {uploadStep===1 ? (
          <div>
            <div className="fg"><label className="fl">Resource Title *</label><input className="fi" value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} placeholder="e.g. Pythagoras Worksheet — Form 3"/></div>
            <div className="fr2">
              <div className="fg"><label className="fl">Subject</label><select className="fsel" value={uploadSubject} onChange={e=>setUploadSubject(e.target.value)}><option>Mathematics</option><option>Biology</option><option>Chemistry</option><option>Physics</option><option>English Language</option></select></div>
              <div className="fg"><label className="fl">Class</label><select className="fsel" value={uploadGrade} onChange={e=>setUploadGrade(e.target.value)}><option>All Classes</option><option>Form 1</option><option>Form 2</option><option>Form 3</option><option>Form 4</option></select></div>
            </div>
            <div className="fg">
              <label className="fl">YouTube Lesson URL (optional)</label>
              <input className="fi" value={uploadYouTube} onChange={e=>setUploadYouTube(e.target.value)} placeholder="e.g. https://www.youtube.com/watch?v=aa6bs6Gl1Dw"/>
              <div style={{fontSize:12,color:'var(--s400)',marginTop:4}}>If provided, this will also appear as a watchable lesson in the student Lesson Player.</div>
            </div>
            {uploadYouTube && (
              <div className="fg">
                <label className="fl">Lesson Topic (matches curriculum)</label>
                <select className="fsel" value={uploadTopic} onChange={e=>setUploadTopic(e.target.value)}>
                  <option value="">-- Select topic --</option>
                  <option>Number & Arithmetic</option><option>Algebra</option><option>Pythagoras & Geometry</option>
                  <option>Trigonometry</option><option>Statistics & Probability</option>
                  <option>Cell Structure</option><option>Respiration</option><option>Genetics & Evolution</option>
                  <option>Atomic Structure & Periodic Table</option><option>Stoichiometry & Equations</option>
                  <option>Kinematics</option><option>Forces & Dynamics</option><option>Electricity</option>
                  <option>Reading Comprehension</option><option>Descriptive Writing</option>
                </select>
              </div>
            )}
            <div className="fr2" style={{display:'none'}}>
            </div>
            <div className="fg"><label className="fl">Resource Type</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginTop:8}}>
                {[['PDF','var(--r50)','var(--r600)'],['Video','var(--p50)','var(--p600)'],['Slides','var(--a50)','var(--a600)'],['Link','var(--b50)','var(--b600)']].map(([t,bg,c]) => (
                  <div key={t} style={{background:bg,border:`1px solid ${c}30`,borderRadius:'var(--rmd)',padding:14,textAlign:'center',cursor:'pointer'}} onClick={() => toast.info(`Type: ${t}`)}>
                    <div style={{fontSize:11,fontWeight:700,color:c}}>{t}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{border:'2px dashed var(--border)',borderRadius:'var(--rlg)',padding:28,textAlign:'center',cursor:'pointer'}} onClick={() => toast.info('File picker opened')}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="1.75" strokeLinecap="round" style={{margin:'0 auto 10px',display:'block'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div style={{fontSize:14,fontWeight:600,color:'var(--s600)'}}>Click to upload or drag and drop</div>
              <div style={{fontSize:12,color:'var(--s400)',marginTop:4}}>PDF, DOCX, PPTX, MP4, JPG — max 500 MB</div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{width:36,height:36,background:'var(--b50)',borderRadius:'var(--rmd)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div><div style={{fontWeight:700,fontSize:14}}>Mshauri AI Summary</div><div style={{fontSize:12,color:'var(--s500)'}}>Auto-generated from your file</div></div>
              <button className="btn btn-p btn-sm" style={{marginLeft:'auto'}} onClick={() => toast.info('Regenerating…')}>Regenerate</button>
            </div>
            <div style={{background:'var(--b50)',border:'1px solid var(--b100)',borderRadius:'var(--rmd)',padding:14,fontSize:13.5,color:'var(--s700)',lineHeight:1.75,marginBottom:16}}>
              A 12-question worksheet covering Pythagorean triples, hypotenuse calculations, and real-world application problems. Suitable for IGCSE Form 3 students as a homework or in-class assessment. Difficulty: intermediate.
            </div>
            <div className="fg"><label className="fl">Edit Summary (optional)</label><textarea className="fta" rows={3} defaultValue="A 12-question worksheet covering Pythagorean triples, hypotenuse calculations, and real-world application problems."/></div>
          </div>
        )}
      </Modal>

      {/* Mark Detail Modal */}
      <Modal open={!!markDetail} onClose={() => setMarkDetail(null)} title={markDetail?.name ? `Review: ${markDetail.name}` : ''} size="md"
        footer={<><button className="btn btn-ok" onClick={() => { if(markDetail){ setResultStudent(markDetail.name); setResultExam('Pythagoras Theorem Mock'); setMarkDetail(null); setResultModal(true) } }}>Confirm & Release Result</button><button className="btn btn-s" onClick={() => setMarkDetail(null)}>Close</button></>}>
        {markDetail && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <Av init={markDetail.init} col={markDetail.col} size={44}/>
              <div>
                <div className="serif" style={{fontSize:20,color:'var(--s900)'}}>{markDetail.name}</div>
                <div style={{fontSize:14,color:'var(--s500)'}}>Total: {markDetail.scores.reduce((a,b)=>a+b,0)}/100</div>
              </div>
            </div>
            {markDetail.flagged && (
              <div style={{background:'var(--r50)',border:'1px solid var(--r100)',borderRadius:'var(--rmd)',padding:14,marginBottom:20}}>
                <div style={{fontWeight:700,color:'var(--r600)',marginBottom:8}}>⚠ Integrity Flags Detected</div>
                <div style={{display:'flex',gap:20,fontSize:13}}>
                  <span>AI-generated: <span className="mono" style={{fontWeight:700,color:'var(--a600)'}}>{markDetail.ai}%</span></span>
                  <span>Plagiarism: <span className="mono" style={{fontWeight:700,color:'var(--r600)'}}>{markDetail.plag}%</span></span>
                  <span>Copy-paste: <span className="mono" style={{fontWeight:700,color:'var(--r600)'}}>{markDetail.copy}%</span></span>
                </div>
              </div>
            )}
            {markDetail.scores.map((sc,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <div className="mono" style={{width:32,fontWeight:700,color:'var(--s400)'}}>Q{i+1}</div>
                <div style={{flex:1}}><div className="prog-bar"><div className="prog-fill" style={{width:(sc/EXAM_QS[i].marks*100)+'%',background:sc/EXAM_QS[i].marks>=.7?'var(--g500)':sc/EXAM_QS[i].marks>=.5?'var(--a500)':'var(--r500)'}}/></div></div>
                <span className="mono" style={{fontWeight:700,width:40,textAlign:'right'}}>{sc}/{EXAM_QS[i].marks}</span>
                <input className="fi" defaultValue={sc} type="number" style={{width:60,padding:'4px 8px',fontSize:12}} min={0} max={EXAM_QS[i].marks}/>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// QUESTION BANK — wired to /api/questions
// Phase 2.2: browse + create (with image upload to Cloudinary)
// ═══════════════════════════════════════════════════════════
 
const qbDifficultyColours = {
  easy:   { bg: 'var(--g50)', color: 'var(--g600)', label: 'Easy' },
  medium: { bg: 'var(--a50)', color: 'var(--a600)', label: 'Medium' },
  hard:   { bg: 'var(--r50)', color: 'var(--r500)', label: 'Hard' },
}
 
const qbTypeMeta = {
  mcq:      { letter: 'M', color: '#1E3A8A', label: 'Multiple Choice' },
  short:    { letter: 'S', color: '#166534', label: 'Short Answer' },
  long:     { letter: 'L', color: '#7E22CE', label: 'Long Answer' },
  drawing:  { letter: 'D', color: '#DC2626', label: 'Drawing' },
  upload:   { letter: 'U', color: '#7D1025', label: 'Upload' },
}
 
function QuestionBankTab({ user, store, setPage, toast }) {
  // ── DATA ──
  const [catalog, setCatalog] = useState({ curricula: [], gradesByCurriculum: {}, subjects: [] })
  const [questions, setQuestions] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
 
  // ── FILTERS ──
  const [filterCurriculum, setFilterCurriculum] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [filterType, setFilterType] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [showOnlyMine, setShowOnlyMine] = useState(false)
 
  // ── DETAIL MODAL ──
  const [detailQ, setDetailQ] = useState(null)
 
 // ── CREATE/EDIT MODAL ──
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)  // question _id when editing, null when creating
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [form, setForm] = useState({
    curriculum: '',
    grade: '',
    subject: '',
    topic: '',
    type: 'mcq',
    questionText: '',
    options: ['', '', '', ''],
    correctIndex: null,           // for MCQ — index of correct option
    correctAnswer: '',            // for short/long — model answer text
    explanation: '',
    marks: 1,
    difficulty: 'medium',
    attachments: [],              // [{url, publicId, filename, mimeType, sizeBytes}]
  })
 
  // Load catalog once
  useEffect(() => {
    api.get('/curriculum/options')
      .then(res => {
        if (res.data?.success) {
          setCatalog({
            curricula: res.data.curricula || [],
            gradesByCurriculum: res.data.gradesByCurriculum || {},
            subjects: res.data.subjects || [],
          })
        }
      })
      .catch(err => console.error('[qbank] catalog load failed:', err.message))
  }, [])
 
  // Load questions when filters change
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (filterCurriculum) params.append('curriculum', filterCurriculum)
        if (filterSubject) params.append('subject', filterSubject)
        if (filterGrade) params.append('grade', filterGrade)
        if (filterType) params.append('type', filterType)
        if (searchQ.trim()) params.append('q', searchQ.trim())
        if (showOnlyMine) params.append('createdBy', 'me')
        params.append('limit', '100')
 
        const { data } = await api.get('/questions?' + params.toString())
        if (data.success) {
          setQuestions(data.questions || [])
          setTotal(data.total || 0)
        }
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load questions')
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }
    const handle = setTimeout(loadQuestions, 250)
    return () => clearTimeout(handle)
  }, [filterCurriculum, filterSubject, filterGrade, filterType, searchQ, showOnlyMine])
 
  // Available subjects/grades for filter dropdowns
  const subjectsForFilter = filterCurriculum
    ? catalog.subjects.filter(s =>
        s.availableIn === 'all' || (Array.isArray(s.availableIn) && s.availableIn.includes(filterCurriculum)))
    : catalog.subjects
  const gradesForFilter = filterCurriculum
    ? (catalog.gradesByCurriculum[filterCurriculum] || [])
    : []
 
  // Available subjects/grades for the create form
  const formSubjects = form.curriculum
    ? catalog.subjects.filter(s =>
        s.availableIn === 'all' || (Array.isArray(s.availableIn) && s.availableIn.includes(form.curriculum)))
    : []
  const formGrades = form.curriculum
    ? (catalog.gradesByCurriculum[form.curriculum] || [])
    : []
 
  const handleCurriculumChange = (newCurr) => {
    setFilterCurriculum(newCurr); setFilterSubject(''); setFilterGrade('')
  }
 
  const clearFilters = () => {
    setFilterCurriculum(''); setFilterSubject(''); setFilterGrade('')
    setFilterType(''); setSearchQ(''); setShowOnlyMine(false)
  }
 
  const hasActiveFilters = !!(filterCurriculum || filterSubject || filterGrade || filterType || searchQ.trim() || showOnlyMine)
 
  // ── CREATE MODAL handlers ──
  const openCreate = () => {
    setEditingId(null)
    setForm({
      curriculum: '', grade: '', subject: '', topic: '', type: 'mcq',
      questionText: '', options: ['', '', '', ''],
      correctIndex: null, correctAnswer: '', explanation: '',
      marks: 1, difficulty: 'medium', attachments: [],
    })
    setCreateOpen(true)
  }

  const openEdit = (q) => {
    setEditingId(q._id)
    // Find correctIndex for MCQ from correctAnswer
    let correctIndex = null
    if (q.type === 'mcq' && typeof q.correctAnswer === 'number' && q.options) {
      correctIndex = q.correctAnswer
    } else if (q.type === 'mcq' && typeof q.correctAnswer === 'string' && q.options) {
      const idx = q.options.indexOf(q.correctAnswer)
      correctIndex = idx >= 0 ? idx : null
    }
    setForm({
      curriculum: q.curriculum || '',
      grade: q.grade || '',
      subject: q.subject || '',
      topic: q.topic || '',
      type: q.type || 'mcq',
      questionText: q.questionText || '',
      options: Array.isArray(q.options) && q.options.length > 0 ? [...q.options] : ['', '', '', ''],
      correctIndex,
      correctAnswer: typeof q.correctAnswer === 'string' ? q.correctAnswer : '',
      explanation: q.explanation || '',
      marks: q.marks || 1,
      difficulty: q.difficulty || 'medium',
      attachments: Array.isArray(q.attachments) ? [...q.attachments] : [],
    })
    setDetailQ(null)  // close detail modal if open
    setCreateOpen(true)
  }

  const closeCreate = () => { setCreateOpen(false); setEditingId(null) }

  const handleDelete = async (q) => {
    if (!confirm('Delete this question permanently? This cannot be undone.')) return
    setDeletingId(q._id)
    try {
      const { data } = await api.delete('/questions/' + q._id)
      if (data.success) {
        toast?.ok?.('Question deleted')
        setQuestions(prev => prev.filter(x => x._id !== q._id))
        setTotal(t => Math.max(0, t - 1))
        setDetailQ(null)
      } else {
        toast?.error?.(data.message || 'Delete failed')
      }
    } catch (e) {
      toast?.error?.(e.response?.data?.message || 'Delete failed: ' + e.message)
    } finally {
      setDeletingId(null)
    }
  }
 
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))
 
  const handleFormCurriculumChange = (newCurr) => {
    setForm(f => ({ ...f, curriculum: newCurr, subject: '', grade: '' }))
  }
 
  const setOption = (i, v) => {
    setForm(f => {
      const next = [...f.options]
      next[i] = v
      return { ...f, options: next }
    })
  }
  const addOption = () => setForm(f => ({ ...f, options: [...f.options, ''] }))
  const removeOption = (i) => setForm(f => {
    const next = f.options.filter((_, idx) => idx !== i)
    let newCorrect = f.correctIndex
    if (f.correctIndex === i) newCorrect = null
    else if (f.correctIndex > i) newCorrect = f.correctIndex - 1
    return { ...f, options: next, correctIndex: newCorrect }
  })
 
  const uploadFile = async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast?.error?.('File too large (max 5 MB).')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/questions/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data.success && data.attachment) {
        setForm(f => ({ ...f, attachments: [...f.attachments, data.attachment] }))
        toast?.ok?.('Image uploaded')
      } else {
        toast?.error?.(data.message || 'Upload failed')
      }
    } catch (e) {
      toast?.error?.(e.response?.data?.message || 'Upload failed: ' + e.message)
    } finally {
      setUploading(false)
    }
  }
 
  const removeAttachment = (idx) => {
    setForm(f => ({
      ...f,
      attachments: f.attachments.filter((_, i) => i !== idx),
    }))
  }
 
  const validateForm = () => {
    if (!form.curriculum) return 'Curriculum is required'
    if (!form.grade) return 'Grade is required'
    if (!form.subject) return 'Subject is required'
    if (!form.questionText.trim()) return 'Question text is required'
    if (form.type === 'mcq') {
      const filledOptions = form.options.filter(o => o.trim())
      if (filledOptions.length < 2) return 'MCQ needs at least 2 options'
      if (form.correctIndex === null) return 'Mark which option is correct'
      if (!form.options[form.correctIndex]?.trim()) return 'Correct option must have text'
    } else if (form.type === 'short' || form.type === 'long') {
      if (!form.correctAnswer.trim()) return 'Model answer is required'
    }
    return null
  }
 
  const saveQuestion = async () => {
    const err = validateForm()
    if (err) { toast?.error?.(err); return }
    setSaving(true)
    try {
      // Filter out empty options
      const cleanOptions = form.type === 'mcq' ? form.options.filter(o => o.trim()) : []
      // Adjust correctIndex if empty options were removed
      let correctAnswer = null
      if (form.type === 'mcq' && form.correctIndex !== null) {
        // Find what the original-correct option text is, then find its position in cleanOptions
        const correctText = form.options[form.correctIndex]
        correctAnswer = cleanOptions.indexOf(correctText)
      } else if (form.type === 'short' || form.type === 'long') {
        correctAnswer = form.correctAnswer.trim()
      }
 
      const payload = {
        curriculum: form.curriculum,
        grade: form.grade,
        subject: form.subject,
        topic: form.topic.trim() || '',
        type: form.type,
        questionText: form.questionText.trim(),
        options: cleanOptions,
        correctAnswer,
        explanation: form.explanation.trim() || '',
        marks: parseInt(form.marks) || 1,
        difficulty: form.difficulty,
        attachments: form.attachments,
      }
 
      const { data } = editingId
        ? await api.patch('/questions/' + editingId, payload)
        : await api.post('/questions', payload)
      if (data.success) {
        toast?.ok?.('Question saved')
        // Reload the list
        const reloadParams = new URLSearchParams()
        if (filterCurriculum) reloadParams.append('curriculum', filterCurriculum)
        if (filterSubject) reloadParams.append('subject', filterSubject)
        if (filterGrade) reloadParams.append('grade', filterGrade)
        if (filterType) reloadParams.append('type', filterType)
        if (showOnlyMine) reloadParams.append('createdBy', 'me')
        const reload = await api.get('/questions?' + reloadParams.toString())
        if (reload.data?.success) {
          setQuestions(reload.data.questions || [])
          setTotal(reload.data.total || 0)
        }
        closeCreate()
      } else {
        toast?.error?.(data.message || 'Save failed')
      }
    } catch (e) {
      toast?.error?.(e.response?.data?.message || 'Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }
 
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="sec-tag">Reusable across exams &amp; homework</div>
          <h2 className="serif" style={{ fontSize: 26, color: 'var(--s900)' }}>
            Question <em style={{ color: '#7D1025' }}>Bank</em>
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--s500)', marginTop: 4 }}>
            {total} question{total === 1 ? '' : 's'} in your bank
            {hasActiveFilters && questions.length !== total ? ' (' + questions.length + ' shown)' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={openCreate} className="btn btn-p btn-sm">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Question
          </button>
        </div>
      </div>
 
      {/* Filters card */}
      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4, display: 'block' }}>Curriculum</label>
            <select className="fsel" value={filterCurriculum} onChange={e => handleCurriculumChange(e.target.value)}>
              <option value="">All curricula</option>
              {catalog.curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4, display: 'block' }}>Subject</label>
            <select className="fsel" value={filterSubject} onChange={e => setFilterSubject(e.target.value)} disabled={!filterCurriculum}>
              <option value="">{filterCurriculum ? 'All subjects' : 'Pick curriculum first'}</option>
              {subjectsForFilter.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4, display: 'block' }}>Grade</label>
            <select className="fsel" value={filterGrade} onChange={e => setFilterGrade(e.target.value)} disabled={!filterCurriculum}>
              <option value="">{filterCurriculum ? 'All grades' : 'Pick curriculum first'}</option>
              {gradesForFilter.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4, display: 'block' }}>Type</label>
            <select className="fsel" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All types</option>
              <option value="mcq">Multiple Choice</option>
              <option value="short">Short Answer</option>
              <option value="long">Long Answer</option>
              <option value="drawing">Drawing</option>
              <option value="upload">Upload</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="fi" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search question text..." style={{ flex: 1, minWidth: 200 }}/>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--s700)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={showOnlyMine} onChange={e => setShowOnlyMine(e.target.checked)} style={{ accentColor: '#7D1025' }}/>
            Only my questions
          </label>
          {hasActiveFilters && <button onClick={clearFilters} className="btn btn-s btn-sm">Clear filters</button>}
        </div>
      </div>
 
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
          Failed to load questions: {error}
        </div>
      )}
 
      {loading && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--s500)' }}>Loading questions from backend...</div>
        </div>
      )}
 
      {!loading && !error && questions.length === 0 && (
        <div className="card" style={{ padding: 50, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, margin: '0 auto 14px', borderRadius: '50%', background: '#FBF6E3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #C9A030' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#C9A030" strokeWidth="2" strokeLinecap="round">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: 'var(--s900)', marginBottom: 4 }}>
            {hasActiveFilters ? 'No questions match your filters' : 'Your question bank is empty'}
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 420, margin: '6px auto 0', lineHeight: 1.6 }}>
            {hasActiveFilters
              ? 'Try removing some filters to see more questions.'
              : 'Click "Add Question" to create your first question. Questions you add can be reused in homework and exams.'}
          </div>
        </div>
      )}
 
      {/* Questions list */}
      {!loading && !error && questions.length > 0 && (
        <div style={{ display: 'grid', gap: 10 }}>
          {questions.map(q => {
            const typeMeta = qbTypeMeta[q.type] || qbTypeMeta.mcq
            const diffMeta = qbDifficultyColours[q.difficulty] || qbDifficultyColours.medium
            const author = q.createdBy
              ? (typeof q.createdBy === 'object'
                  ? ((q.createdBy.firstName || '') + ' ' + (q.createdBy.lastName || '')).trim()
                  : 'Unknown')
              : 'Unknown'
            const hasAttachments = (q.attachments || []).length > 0
            return (
              <div key={q._id} className="card" onClick={() => setDetailQ(q)}
                style={{ padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12, transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7D1025' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: typeMeta.color + '15', color: typeMeta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{typeMeta.letter}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: 'var(--s900)', marginBottom: 4, fontWeight: 500, lineHeight: 1.5 }}>{q.questionText}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--s400)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>{q.curriculum} · {q.subject} {q.grade ? '· ' + q.grade : ''}</span>
                    {q.topic && <span>· {q.topic}</span>}
                    <span style={{ background: diffMeta.bg, color: diffMeta.color, padding: '1px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{diffMeta.label}</span>
                    <span style={{ background: 'var(--s100)', color: 'var(--s600)', padding: '1px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{typeMeta.label}</span>
                    {hasAttachments && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--s500)' }}>
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                        {q.attachments.length}
                      </span>
                    )}
                    <span style={{ marginLeft: 'auto', color: 'var(--s400)' }}>by {author}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
 
      {/* DETAIL MODAL */}
      {detailQ && (
        <div onClick={() => setDetailQ(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: 12, maxWidth: 720, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <div style={{ padding: '20px 28px', background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)', color: '#FBFAF5' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, color: '#F0CC5A', marginBottom: 4 }}>
                {detailQ.curriculum} · {detailQ.subject} · {detailQ.grade}
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>{qbTypeMeta[detailQ.type]?.label || 'Question'}</div>
            </div>
            <div style={{ padding: '20px 28px' }}>
              <div style={{ fontSize: 15, color: 'var(--s900)', lineHeight: 1.6, marginBottom: 14 }}>{detailQ.questionText}</div>
              {detailQ.attachments && detailQ.attachments.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 6 }}>Attachments</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {detailQ.attachments.map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer">
                        {a.mimeType?.startsWith('image/') ? (
                          <img src={a.url} alt={a.filename || 'attachment'} style={{ maxWidth: 180, maxHeight: 120, borderRadius: 6, border: '1px solid var(--border)' }} />
                        ) : (
                          <div style={{ padding: '8px 12px', background: 'var(--s100)', borderRadius: 6, fontSize: 12 }}>{a.filename || 'File'}</div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {detailQ.type === 'mcq' && detailQ.options && detailQ.options.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 6 }}>Options</div>
                  {detailQ.options.map((opt, i) => {
                    const isCorrect = (typeof detailQ.correctAnswer === 'number' && detailQ.correctAnswer === i) ||
                                      (typeof detailQ.correctAnswer === 'string' && detailQ.correctAnswer === opt)
                    return (
                      <div key={i} style={{ padding: '8px 12px', borderRadius: 6, marginBottom: 4, background: isCorrect ? '#DCFCE7' : 'var(--bg)', border: '1px solid ' + (isCorrect ? '#86EFAC' : 'var(--border)'), fontSize: 13, color: isCorrect ? '#15803D' : 'var(--s700)', fontWeight: isCorrect ? 600 : 400, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: isCorrect ? '#15803D' : 'var(--s400)' }}>{String.fromCharCode(65 + i)}</span>
                        {opt}
                        {isCorrect && (
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#15803D" strokeWidth="3" strokeLinecap="round" style={{ marginLeft: 'auto' }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              {detailQ.type !== 'mcq' && detailQ.correctAnswer && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 6 }}>Model Answer</div>
                  <div style={{ padding: '10px 14px', background: '#FBFAF5', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>{detailQ.correctAnswer}</div>
                </div>
              )}
              {detailQ.explanation && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 6 }}>Explanation</div>
                  <div style={{ padding: '10px 14px', background: '#FBF6E3', borderLeft: '3px solid #C9A030', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6, color: 'var(--s700)' }}>{detailQ.explanation}</div>
                </div>
              )}
              <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: 12, color: 'var(--s500)', flexWrap: 'wrap' }}>
                <span><strong>Marks:</strong> {detailQ.marks || 1}</span>
                <span><strong>Difficulty:</strong> {detailQ.difficulty || 'medium'}</span>
                {detailQ.usageCount > 0 && <span><strong>Used:</strong> {detailQ.usageCount} time(s)</span>}
              </div>
            </div>
            <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', background: '#FBFAF5', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(() => {
                  const isOwner = detailQ.createdBy && (
                    (typeof detailQ.createdBy === 'object' && detailQ.createdBy._id === user?._id) ||
                    detailQ.createdBy === user?._id
                  )
                  const isAdmin = user?.role === 'admin'
                  if (!isOwner && !isAdmin) return null
                  return (
                    <>
                      <button onClick={() => openEdit(detailQ)} className="btn btn-s btn-sm">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 4 }}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(detailQ)} disabled={deletingId === detailQ._id} className="btn btn-s btn-sm" style={{ color: '#DC2626' }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 4 }}>
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        {deletingId === detailQ._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </>
                  )
                })()}
              </div>
              <button className="btn btn-s" onClick={() => setDetailQ(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
 
      {/* CREATE MODAL */}
      {createOpen && (
        <div onClick={closeCreate} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: 12, maxWidth: 760, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
           <div style={{ padding: '20px 28px', background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)', color: '#FBFAF5' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, color: '#F0CC5A', marginBottom: 4 }}>{editingId ? 'Edit Question' : 'New Question'}</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>{editingId ? 'Update existing question' : 'Add to Question Bank'}</div>
            </div>
 
            <div style={{ padding: '24px 28px' }}>
              {/* Categorization */}
              <div className="fr2">
                <div className="fg">
                  <label className="fl">Curriculum *</label>
                  <select className="fsel" value={form.curriculum} onChange={e => handleFormCurriculumChange(e.target.value)}>
                    <option value="">Select curriculum...</option>
                    {catalog.curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label className="fl">Grade *</label>
                  <select className="fsel" value={form.grade} onChange={e => setF('grade', e.target.value)} disabled={!form.curriculum}>
                    <option value="">{form.curriculum ? 'Select grade...' : 'Pick curriculum first'}</option>
                    {formGrades.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
 
              <div className="fr2">
                <div className="fg">
                  <label className="fl">Subject *</label>
                  <select className="fsel" value={form.subject} onChange={e => setF('subject', e.target.value)} disabled={!form.curriculum}>
                    <option value="">{form.curriculum ? 'Select subject...' : 'Pick curriculum first'}</option>
                    {formSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label className="fl">Topic (optional)</label>
                  <input className="fi" value={form.topic} onChange={e => setF('topic', e.target.value)} placeholder="e.g. Algebra, Pythagoras"/>
                </div>
              </div>
 
              <div className="fg">
                <label className="fl">Question Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 6 }}>
                  {Object.entries(qbTypeMeta).map(([type, meta]) => (
                    <button key={type} type="button" onClick={() => setF('type', type)}
                      style={{
                        padding: '10px 12px',
                        border: '2px solid ' + (form.type === type ? meta.color : 'var(--border)'),
                        background: form.type === type ? meta.color + '15' : 'transparent',
                        borderRadius: 8, cursor: 'pointer',
                        fontSize: 12, fontWeight: 700,
                        color: form.type === type ? meta.color : 'var(--s600)',
                      }}>{meta.label}</button>
                  ))}
                </div>
              </div>
 
              <div className="fg">
                <label className="fl">Question Text *</label>
                <textarea className="fi" rows={3} value={form.questionText} onChange={e => setF('questionText', e.target.value)} placeholder="Type your question here..." style={{ resize: 'vertical' }}/>
              </div>
 
              {/* MCQ-specific options */}
              {form.type === 'mcq' && (
                <div className="fg">
                  <label className="fl">Options ({form.options.filter(o => o.trim()).length} filled, mark correct one)</label>
                  {form.options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                      <button type="button" onClick={() => setF('correctIndex', i)}
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          border: '2px solid ' + (form.correctIndex === i ? '#15803D' : 'var(--border)'),
                          background: form.correctIndex === i ? '#15803D' : '#FFF',
                          color: form.correctIndex === i ? '#FFF' : 'var(--s400)',
                          fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700,
                          cursor: 'pointer', flexShrink: 0,
                        }}>{String.fromCharCode(65 + i)}</button>
                      <input className="fi" value={opt} onChange={e => setOption(i, e.target.value)} placeholder={'Option ' + (i + 1)}/>
                      {form.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)} className="btn btn-s btn-sm" style={{ flexShrink: 0 }}>×</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addOption} className="btn btn-s btn-sm" style={{ marginTop: 4 }}>+ Add option</button>
                  {form.correctIndex !== null && (
                    <div style={{ fontSize: 11, color: 'var(--g600)', marginTop: 4 }}>
                      ✓ Correct answer: option {String.fromCharCode(65 + form.correctIndex)}
                    </div>
                  )}
                </div>
              )}
 
              {/* Short/Long answer fields */}
              {(form.type === 'short' || form.type === 'long') && (
                <div className="fg">
                  <label className="fl">Model Answer *</label>
                  <textarea className="fi" rows={form.type === 'long' ? 5 : 3} value={form.correctAnswer} onChange={e => setF('correctAnswer', e.target.value)} placeholder="The expected answer (used for marking)" style={{ resize: 'vertical' }}/>
                </div>
              )}
 
              {(form.type === 'drawing' || form.type === 'upload') && (
                <div style={{ background: '#FBF6E3', borderLeft: '3px solid #C9A030', padding: '10px 14px', borderRadius: 6, fontSize: 12.5, color: 'var(--s700)', marginBottom: 14, lineHeight: 1.6 }}>
                  {form.type === 'drawing'
                    ? 'Students will use a drawing canvas to answer this question. You will manually mark each submission.'
                    : 'Students will upload an image of their work. You will manually mark each submission.'}
                </div>
              )}
 
              {/* Image attachments */}
              <div className="fg">
                <label className="fl">Attachments (optional)</label>
                <div style={{ marginBottom: 8 }}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0]); e.target.value = '' }}
                    disabled={uploading}
                    style={{ display: 'none' }}
                    id="qbank-file-input"
                  />
                  <label htmlFor="qbank-file-input"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px',
                      background: uploading ? 'var(--s100)' : '#7D1025',
                      color: uploading ? 'var(--s500)' : '#FBFAF5',
                      borderRadius: 6,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      fontSize: 13, fontWeight: 700,
                    }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {uploading ? 'Uploading...' : 'Upload image / PDF'}
                  </label>
                </div>
                {form.attachments.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {form.attachments.map((a, i) => (
                      <div key={i} style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: 6, padding: 4 }}>
                        {a.mimeType?.startsWith('image/') ? (
                          <img src={a.url} alt={a.filename || 'attachment'} style={{ maxWidth: 100, maxHeight: 80, display: 'block', borderRadius: 4 }}/>
                        ) : (
                          <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--s600)' }}>{a.filename || 'File'}</div>
                        )}
                        <button type="button" onClick={() => removeAttachment(i)} style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#DC2626', color: '#FFF', border: '2px solid #FFF', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
 
              {/* Explanation, marks, difficulty */}
              <div className="fg">
                <label className="fl">Explanation (optional)</label>
                <textarea className="fi" rows={2} value={form.explanation} onChange={e => setF('explanation', e.target.value)} placeholder="Help students understand the answer (shown after they submit)" style={{ resize: 'vertical' }}/>
              </div>
 
              <div className="fr2">
                <div className="fg">
                  <label className="fl">Marks</label>
                  <input className="fi" type="number" min="1" max="100" value={form.marks} onChange={e => setF('marks', e.target.value)}/>
                </div>
                <div className="fg">
                  <label className="fl">Difficulty</label>
                  <select className="fsel" value={form.difficulty} onChange={e => setF('difficulty', e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
 
            <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', background: '#FBFAF5', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-s" onClick={closeCreate} disabled={saving}>Cancel</button>
              <button className="btn btn-p" onClick={saveQuestion} disabled={saving || uploading}>
                {saving ? 'Saving...' : (editingId ? 'Update Question' : 'Save Question')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 

// ═══════════════════════════════════════════════════════════
// MY STUDENTS — deep drilldown for individual student management
// ═══════════════════════════════════════════════════════════
// Theme: Smartious crimson (#7D1025) + gold (#C9A030) + cream (#FBFAF5)

const MS_NOTES_PREFIX = 'sm_teacher_notes_'
const MS_FLAGS_KEY    = 'sm_student_flags'

const msSubjColours = {
  'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
  'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
  'Geography': '#0F766E', 'Computer Science': '#1F2937',
}
const msSubjColour = (s) => msSubjColours[s] || '#7D1025'

const msTimeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  if (hours < 24) return hours + 'h ago'
  if (days === 1) return 'yesterday'
  if (days < 7) return days + 'd ago'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const msAvatarColor = (name) => {
  const colors = ['#7D1025', '#8B1A2E', '#C9A030', '#1E3A8A', '#166534', '#7C2D12', '#6B21A8', '#92400E']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
  return colors[Math.abs(hash) % colors.length]
}

const msStatusStyle = (status) => {
  switch (status) {
    case 'excellent':  return { color: '#15803D', bg: '#DCFCE7', label: 'Excellent', borderColor: '#86EFAC' }
    case 'on-track':   return { color: '#7D1025', bg: '#FBE8E8', label: 'On track',  borderColor: '#F4C5C5' }
    case 'needs-help': return { color: '#B45309', bg: '#FEF3C7', label: 'Needs help', borderColor: '#FCD34D' }
    case 'at-risk':    return { color: '#B91C1C', bg: '#FEE2E2', label: 'At risk',    borderColor: '#FCA5A5' }
    default:           return { color: '#64748B', bg: '#F1F5F9', label: status,        borderColor: '#CBD5E1' }
  }
}

// Load functions
const msLoadStudents = () => {
  try { return JSON.parse(localStorage.getItem('sm_teacher_students') || '[]') } catch { return [] }
}
const msSaveStudents = (students) => {
  try { localStorage.setItem('sm_teacher_students', JSON.stringify(students)) } catch {}
}
const msLoadNotes = (studentId) => {
  try { return JSON.parse(localStorage.getItem(MS_NOTES_PREFIX + studentId) || '[]') } catch { return [] }
}
const msSaveNotes = (studentId, notes) => {
  try { localStorage.setItem(MS_NOTES_PREFIX + studentId, JSON.stringify(notes.slice(-50))) } catch {}
}
const msLoadActivity = () => {
  try { return JSON.parse(localStorage.getItem('sm_teacher_recent_activity') || '[]') } catch { return [] }
}
const msLoadHomework = () => {
  try { return JSON.parse(localStorage.getItem('sm_teacher_pending_grading') || '[]') } catch { return [] }
}
const msLoadClassHistory = () => {
  try { return JSON.parse(localStorage.getItem('sm_teacher_class_history') || '[]') } catch { return [] }
}

// Seed if dashboard hasn't been visited yet
const msSeedIfEmpty = () => {
  const existing = msLoadStudents()
  if (existing.length > 0) return existing
  const seeded = [
    { id: 's1', name: 'Amara Osei',    initials: 'AO', curriculum: 'IGCSE',  year: 'Year 10', mastery: 72, lastActive: 1,   hwSubmitted: 3, hwTotal: 4, status: 'on-track',     attendance: 88, parentName: 'Janet Osei',     parentEmail: 'janet.osei@example.com',     phone: '+254 712 000 001' },
    { id: 's2', name: 'Kofi Mensah',   initials: 'KM', curriculum: 'IGCSE',  year: 'Year 10', mastery: 88, lastActive: 0.5, hwSubmitted: 4, hwTotal: 4, status: 'excellent',    attendance: 96, parentName: 'Akua Mensah',    parentEmail: 'akua.mensah@example.com',    phone: '+254 712 000 002' },
    { id: 's3', name: 'Zara Kamau',    initials: 'ZK', curriculum: 'IGCSE',  year: 'Year 10', mastery: 65, lastActive: 4,   hwSubmitted: 2, hwTotal: 4, status: 'on-track',     attendance: 82, parentName: 'Susan Kamau',    parentEmail: 'susan.kamau@example.com',    phone: '+254 712 000 003' },
    { id: 's4', name: 'Brian Otieno',  initials: 'BO', curriculum: 'IGCSE',  year: 'Year 11', mastery: 79, lastActive: 1,   hwSubmitted: 3, hwTotal: 4, status: 'on-track',     attendance: 90, parentName: 'Peter Otieno',   parentEmail: 'peter.otieno@example.com',   phone: '+254 712 000 004' },
    { id: 's5', name: 'Faith Wanjiru', initials: 'FW', curriculum: 'IGCSE',  year: 'Year 10', mastery: 91, lastActive: 0.2, hwSubmitted: 4, hwTotal: 4, status: 'excellent',    attendance: 98, parentName: 'Mary Wanjiru',   parentEmail: 'mary.wanjiru@example.com',   phone: '+254 712 000 005' },
    { id: 's6', name: 'David Mwangi',  initials: 'DM', curriculum: 'IGCSE',  year: 'Year 10', mastery: 58, lastActive: 7,   hwSubmitted: 1, hwTotal: 4, status: 'at-risk',      attendance: 74, parentName: 'James Mwangi',   parentEmail: 'james.mwangi@example.com',   phone: '+254 712 000 006' },
    { id: 's7', name: 'Lydia Achieng', initials: 'LA', curriculum: 'IGCSE',  year: 'Year 11', mastery: 76, lastActive: 2,   hwSubmitted: 3, hwTotal: 4, status: 'on-track',     attendance: 85, parentName: 'Grace Achieng',  parentEmail: 'grace.achieng@example.com',  phone: '+254 712 000 007' },
    { id: 's8', name: 'Peter Kamau',   initials: 'PK', curriculum: 'IGCSE',  year: 'Year 11', mastery: 62, lastActive: 5,   hwSubmitted: 2, hwTotal: 4, status: 'needs-help',    attendance: 78, parentName: 'Eunice Kamau',   parentEmail: 'eunice.kamau@example.com',   phone: '+254 712 000 008' },
  ]
  msSaveStudents(seeded)
  return seeded
}

function MyStudentsTab({ user, store, setPage, toast, setMsgTo, setMsgSubject, setMsgBody, setMsgModal }) {
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(true)

  // Load real students from backend GroupRooms (where this teacher is assigned)
  useEffect(() => {
    const loadRealStudents = async () => {
      setLoadingStudents(true)
      try {
        const teacherId = user?._id
        if (!teacherId) {
          setLoadingStudents(false)
          return
        }
        // Fetch all rooms; filter to ones where this teacher is assigned
        const roomsRes = await api.get('/grouprooms')
        const allRooms = roomsRes.data?.rooms || []
        const myRooms = allRooms.filter(r => {
          if (!r.teacher) return false
          const tid = typeof r.teacher === 'object' ? r.teacher._id : r.teacher
          return tid === teacherId || tid?.toString() === teacherId?.toString()
        })

        // Collect unique students across all my rooms
        const studentMap = new Map()
        myRooms.forEach(room => {
          (room.students || []).forEach(s => {
            // Backend may return populated objects or just IDs
            if (typeof s === 'object' && s !== null) {
              if (!studentMap.has(s._id)) {
                studentMap.set(s._id, {
                  id: s._id,
                  name: ((s.firstName || '') + ' ' + (s.lastName || '')).trim() || 'Unnamed Student',
                  initials: ((s.firstName?.[0] || '') + (s.lastName?.[0] || '')).toUpperCase() || '?',
                  curriculum: s.curriculum || '',
                  year: s.gradeLevel || '',
                  mastery: 0, attendance: 0,
                  hwSubmitted: 0, hwTotal: 0,
                  status: 'on-track', lastActive: 0,
                  parentName: '', parentEmail: s.email || '', phone: s.phone || '',
                  rooms: [room.name],
                })
              } else {
                // Already in map - just append the room name
                const existing = studentMap.get(s._id)
                if (!existing.rooms.includes(room.name)) existing.rooms.push(room.name)
              }
            }
          })
        })

        const realStudents = Array.from(studentMap.values())
        setStudents(realStudents)
      } catch (e) {
        console.error('[mystudents] failed to load:', e.message)
        setStudents([])
      } finally {
        setLoadingStudents(false)
      }
    }
    loadRealStudents()
  }, [user?._id])
  const [view, setView] = useState('roster')  // 'roster' | 'detail'
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [detailTab, setDetailTab] = useState('overview')

  const [searchQ, setSearchQ] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [sortBy, setSortBy] = useState('priority')

  // For drilldown
  const [studentNotes, setStudentNotes] = useState([])
  const [newNoteText, setNewNoteText] = useState('')
  const [noteCategory, setNoteCategory] = useState('observation')

  // Load notes when student selected
  useEffect(() => {
    if (selectedStudent) {
      setStudentNotes(msLoadNotes(selectedStudent.id))
    }
  }, [selectedStudent])

  const openDetail = (student) => {
    setSelectedStudent(student)
    setView('detail')
    setDetailTab('overview')
  }

  const backToRoster = () => {
    setView('roster')
    setSelectedStudent(null)
  }

  const updateStudentStatus = (newStatus) => {
    if (!selectedStudent) return
    const updated = students.map(s => s.id === selectedStudent.id ? { ...s, status: newStatus } : s)
    setStudents(updated)
    msSaveStudents(updated)
    setSelectedStudent({ ...selectedStudent, status: newStatus })
    toast?.ok?.('Student status updated to ' + msStatusStyle(newStatus).label)
  }

  const addNote = () => {
    if (!newNoteText.trim() || !selectedStudent) return
    const note = {
      id: 'note-' + Date.now(),
      text: newNoteText.trim(),
      category: noteCategory,
      createdAt: new Date().toISOString(),
      author: ('Mr. ' + (user?.firstName || '') + ' ' + (user?.lastName || '')).trim() || 'Teacher',
    }
    const updated = [note, ...studentNotes]
    setStudentNotes(updated)
    msSaveNotes(selectedStudent.id, updated)
    setNewNoteText('')
    toast?.ok?.('Note saved.')
  }

  const deleteNote = (noteId) => {
    const updated = studentNotes.filter(n => n.id !== noteId)
    setStudentNotes(updated)
    if (selectedStudent) msSaveNotes(selectedStudent.id, updated)
  }

  const messageStudent = (student) => {
    if (setMsgTo && setMsgSubject && setMsgBody && setMsgModal) {
      setMsgTo(student.parentName || student.name)
      setMsgSubject('About ' + student.name)
      setMsgBody('')
      setMsgModal(true)
    } else {
      toast?.info?.('Messaging will open the message composer.')
    }
  }

  // Filter + sort students for roster
  const filteredStudents = students.filter(s => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false
    if (filterYear !== 'all' && s.year !== filterYear) return false
    if (searchQ.trim()) {
      const search = searchQ.toLowerCase()
      if (!s.name.toLowerCase().includes(search) && !(s.parentName || '').toLowerCase().includes(search)) return false
    }
    return true
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'priority') {
      const order = { 'at-risk': 0, 'needs-help': 1, 'on-track': 2, 'excellent': 3 }
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
      return a.mastery - b.mastery
    }
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'mastery-high') return b.mastery - a.mastery
    if (sortBy === 'mastery-low') return a.mastery - b.mastery
    if (sortBy === 'attendance-low') return a.attendance - b.attendance
    return 0
  })

  // Stats for roster header
  const rosterStats = {
    total: students.length,
    excellent: students.filter(s => s.status === 'excellent').length,
    onTrack: students.filter(s => s.status === 'on-track').length,
    needsHelp: students.filter(s => s.status === 'needs-help').length,
    atRisk: students.filter(s => s.status === 'at-risk').length,
    avgMastery: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.mastery, 0) / students.length) : 0,
    avgAttendance: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length) : 0,
  }

  const allYears = [...new Set(students.map(s => s.year))]

  // ── LOADING STATE ──
  if (loadingStudents) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--s500)' }}>Loading your students...</div>
      </div>
    )
  }

  // ── DETAIL VIEW ─────────────────────────────────────
  if (view === 'detail' && selectedStudent) {
    const sty = msStatusStyle(selectedStudent.status)
    const studentRecentActivity = msLoadActivity().filter(a => a.student === selectedStudent.name)
    const studentHomework = msLoadHomework().filter(h => h.studentName === selectedStudent.name)
    const classHistory = msLoadClassHistory()

    return (
      <div>
        {/* Back navigation */}
        <button onClick={backToRoster}
          style={{
            background: 'transparent', border: 'none',
            color: '#7D1025', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', padding: '6px 0', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to All Students
        </button>

        {/* Hero card with student info — CRIMSON theme */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
          color: '#FBFAF5',
        }}>
          <div style={{ padding: '28px 30px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#C9A030',
              border: '3px solid #F0CC5A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#7D1025',
              fontSize: 28, fontWeight: 700,
              fontFamily: "'Instrument Serif', serif",
              flexShrink: 0,
            }}>
              {selectedStudent.initials}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 4, color: '#F0CC5A' }}>
                Student Profile
              </div>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
                {selectedStudent.name}
              </h1>
              <div style={{ fontSize: 13, opacity: .9, marginTop: 6, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span>{selectedStudent.curriculum} {selectedStudent.year}</span>
                <span>Active {selectedStudent.lastActive < 1 ? Math.round(selectedStudent.lastActive * 24) + 'h ago' : Math.round(selectedStudent.lastActive) + 'd ago'}</span>
                {selectedStudent.parentName && <span>Parent: {selectedStudent.parentName}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => messageStudent(selectedStudent)}
                style={{
                  background: 'rgba(251,250,245,.15)',
                  border: '1px solid rgba(251,250,245,.35)',
                  color: '#FBFAF5',
                  padding: '10px 16px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Message
              </button>
              <button onClick={() => setPage('exambuilder')}
                style={{
                  background: '#C9A030', color: '#7D1025', border: 'none',
                  padding: '10px 16px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 4px 14px rgba(201,160,48,.35)',
                }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Assign Work
              </button>
            </div>
          </div>
          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
            {[
              { l: 'Status',     v: sty.label,                                                                   c: '#F0CC5A' },
              { l: 'Mastery',    v: selectedStudent.mastery + '%',                                              c: selectedStudent.mastery >= 75 ? '#86EFAC' : selectedStudent.mastery >= 60 ? '#F0CC5A' : '#FCA5A5' },
              { l: 'Attendance', v: selectedStudent.attendance + '%',                                            c: selectedStudent.attendance >= 85 ? '#86EFAC' : '#F0CC5A' },
              { l: 'Homework',   v: selectedStudent.hwSubmitted + '/' + selectedStudent.hwTotal,                 c: selectedStudent.hwSubmitted === selectedStudent.hwTotal ? '#86EFAC' : '#F0CC5A' },
              { l: 'Last Active',v: selectedStudent.lastActive < 1 ? Math.round(selectedStudent.lastActive*24) + 'h' : Math.round(selectedStudent.lastActive) + 'd', c: selectedStudent.lastActive < 2 ? '#86EFAC' : '#F0CC5A' },
            ].map(stat => (
              <div key={stat.l} style={{ padding: '14px 18px', borderRight: '1px solid rgba(251,250,245,.08)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7, marginBottom: 2, color: '#F0CC5A' }}>
                  {stat.l}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: stat.c }}>
                  {stat.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: '#FBFAF5',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rmd)',
          padding: 4, marginBottom: 18, gap: 2, flexWrap: 'wrap',
        }}>
          {[
            { id: 'overview',      label: 'Overview' },
            { id: 'mastery',       label: 'Mastery' },
            { id: 'homework',      label: 'Homework' },
            { id: 'exams',         label: 'Exams' },
            { id: 'attendance',    label: 'Attendance' },
            { id: 'communication', label: 'Notes & Comms' },
          ].map(t => (
            <button key={t.id} onClick={() => setDetailTab(t.id)}
              style={{
                flex: 1, minWidth: 100,
                background: detailTab === t.id ? '#7D1025' : 'transparent',
                color: detailTab === t.id ? '#FBFAF5' : '#64748B',
                border: 'none', padding: '10px 14px',
                borderRadius: 'var(--rsm)', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                boxShadow: detailTab === t.id ? '0 4px 16px rgba(125,16,37,.15)' : 'none',
              }}>{t.label}</button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {detailTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {/* Quick Actions */}
            <div className="card">
              <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-s" style={{ justifyContent: 'flex-start' }} onClick={() => messageStudent(selectedStudent)}>
                  Send Message to {selectedStudent.parentName ? 'Parent' : 'Student'}
                </button>
                <button className="btn btn-s" style={{ justifyContent: 'flex-start' }} onClick={() => setPage('exambuilder')}>
                  Assign Homework
                </button>
                <button className="btn btn-s" style={{ justifyContent: 'flex-start' }} onClick={() => setPage('exambuilder')}>
                  Schedule Exam
                </button>
                <button className="btn btn-s" style={{ justifyContent: 'flex-start' }} onClick={() => toast?.info?.('Generating progress report...')}>
                  Generate Progress Report
                </button>
              </div>
            </div>

            {/* Update status */}
            <div className="card">
              <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Update Status</div>
              <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 10 }}>
                Currently: <strong style={{ color: sty.color }}>{sty.label}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 6 }}>
                {['excellent', 'on-track', 'needs-help', 'at-risk'].map(s => {
                  const st = msStatusStyle(s)
                  const isActive = selectedStudent.status === s
                  return (
                    <button key={s} onClick={() => updateStudentStatus(s)}
                      style={{
                        background: isActive ? st.color : st.bg,
                        color: isActive ? '#fff' : st.color,
                        border: '1.5px solid ' + (isActive ? st.color : st.borderColor),
                        padding: '8px 10px', borderRadius: 'var(--rsm)',
                        cursor: 'pointer', fontSize: 11.5, fontWeight: 700,
                      }}>{st.label}</button>
                  )
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Recent Activity</div>
              {studentRecentActivity.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>
                  No recent activity recorded for this student.
                </div>
              ) : (
                studentRecentActivity.slice(0, 8).map((a, i) => (
                  <div key={a.id || i} style={{
                    display: 'flex', gap: 10, padding: '10px 0',
                    borderBottom: i < studentRecentActivity.length - 1 ? '1px solid var(--border)' : 'none',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: msSubjColour(a.subject) + '15', color: msSubjColour(a.subject),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>{(a.type || 'A')[0].toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--s700)' }}>{a.action}</div>
                      <div style={{ fontSize: 11, color: 'var(--s400)' }}>{msTimeAgo(a.when)}</div>
                    </div>
                    {a.score !== undefined && (
                      <span className="mono" style={{
                        fontSize: 12, fontWeight: 700,
                        color: a.score >= 80 ? '#15803D' : a.score >= 60 ? '#B45309' : '#B91C1C',
                      }}>{a.score}%</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Latest note */}
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="ctitle" style={{ color: '#7D1025' }}>Latest Notes</div>
                <button onClick={() => setDetailTab('communication')}
                  style={{ background: 'transparent', border: 'none', color: '#7D1025', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  View All -&gt;
                </button>
              </div>
              {studentNotes.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>
                  No notes yet. Add your first observation in the Notes tab.
                </div>
              ) : (
                studentNotes.slice(0, 3).map(note => (
                  <div key={note.id} style={{
                    background: '#FBFAF5', borderLeft: '3px solid #C9A030',
                    padding: '10px 14px', borderRadius: 'var(--rsm)',
                    marginBottom: 8, fontSize: 13, color: 'var(--s700)',
                    lineHeight: 1.6,
                  }}>
                    <div style={{ marginBottom: 4 }}>{note.text}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--s400)' }}>
                      {note.category} | {msTimeAgo(note.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MASTERY TAB */}
        {detailTab === 'mastery' && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 14, color: '#7D1025' }}>Subject Mastery</div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Overall Mastery</span>
                <span className="mono" style={{ fontWeight: 700, color: '#7D1025' }}>{selectedStudent.mastery}%</span>
              </div>
              <div style={{ height: 12, background: '#FBFAF5', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: selectedStudent.mastery + '%',
                  background: 'linear-gradient(90deg, #7D1025, #C9A030)',
                  borderRadius: 6,
                }}/>
              </div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: '#7D1025', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
              Per-Topic Breakdown (Sample)
            </div>
            {[
              { topic: 'Algebra',           mastery: 82, attempts: 14 },
              { topic: 'Pythagoras Theorem', mastery: 76, attempts: 9 },
              { topic: 'Trigonometry',      mastery: 64, attempts: 7 },
              { topic: 'Statistics',        mastery: 58, attempts: 5 },
              { topic: 'Geometry',          mastery: 71, attempts: 11 },
              { topic: 'Functions & Graphs', mastery: 49, attempts: 3 },
            ].map(t => {
              const tColor = t.mastery >= 80 ? '#15803D' : t.mastery >= 60 ? '#7D1025' : t.mastery >= 40 ? '#B45309' : '#B91C1C'
              return (
                <div key={t.topic} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: 'var(--s700)' }}>{t.topic}</span>
                    <span style={{ fontSize: 11, color: 'var(--s400)' }}>{t.attempts} sessions | <span className="mono" style={{ fontWeight: 700, color: tColor }}>{t.mastery}%</span></span>
                  </div>
                  <div style={{ height: 6, background: '#FBFAF5', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: t.mastery + '%', background: tColor, borderRadius: 3 }}/>
                  </div>
                </div>
              )
            })}
            <div style={{
              background: '#FBFAF5', borderLeft: '3px solid #C9A030',
              padding: '10px 14px', borderRadius: 'var(--rsm)',
              fontSize: 12, color: 'var(--s600)', marginTop: 14, fontStyle: 'italic',
            }}>
              Mastery data updates as students complete practice and exams. Real-time data will populate once the backend is connected.
            </div>
          </div>
        )}

        {/* HOMEWORK TAB */}
        {detailTab === 'homework' && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 14, color: '#7D1025' }}>Homework Assignments</div>
            {studentHomework.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 36 }}>
                No homework assignments yet for this student.
              </div>
            ) : (
              studentHomework.map(h => (
                <div key={h.id} style={{
                  display: 'flex', gap: 12, padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                }}>
                  <div style={{
                    width: 4, height: 36, borderRadius: 2,
                    background: msSubjColour(h.subject), flexShrink: 0,
                  }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>{h.homework}</div>
                    <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                      {h.subject} | Submitted {msTimeAgo(h.submittedAt)} | {h.maxMarks} marks
                    </div>
                  </div>
                  <button onClick={() => setPage('marking')} className="btn btn-s btn-sm">Grade</button>
                </div>
              ))
            )}
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <button onClick={() => setPage('exambuilder')}
                style={{
                  background: '#7D1025', color: '#FBFAF5', border: 'none',
                  padding: '10px 18px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                }}>Assign New Homework</button>
            </div>
          </div>
        )}

        {/* EXAMS TAB */}
        {detailTab === 'exams' && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 14, color: '#7D1025' }}>Exam History</div>
            <div style={{
              background: '#FBFAF5', borderLeft: '3px solid #C9A030',
              padding: '10px 14px', borderRadius: 'var(--rsm)',
              fontSize: 13, color: 'var(--s600)', marginBottom: 14, fontStyle: 'italic',
            }}>
              Exam history will populate once exams are scheduled. Use the Exam Builder to create scheduled exams with locked start times.
            </div>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <button onClick={() => setPage('exambuilder')}
                style={{
                  background: '#7D1025', color: '#FBFAF5', border: 'none',
                  padding: '10px 18px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                }}>Schedule Exam for {selectedStudent.name}</button>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {detailTab === 'attendance' && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 14, color: '#7D1025' }}>Class Attendance</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 18 }}>
              {[
                ['Overall',        selectedStudent.attendance + '%',                                  '#7D1025'],
                ['Classes Held',    classHistory.length,                                              '#7D1025'],
                ['Attended',        classHistory.filter(c => c.attended.includes(selectedStudent.name)).length, '#15803D'],
                ['Missed',          classHistory.filter(c => c.missed?.includes(selectedStudent.name)).length,  '#B91C1C'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ background: '#FBFAF5', padding: '12px 14px', borderRadius: 'var(--rsm)' }}>
                  <div style={{ fontSize: 10, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, marginBottom: 2 }}>{l}</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: '#7D1025', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
              Class-by-Class Log
            </div>
            {classHistory.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>
                No class history yet.
              </div>
            ) : (
              classHistory.map(cls => {
                const wasPresent = cls.attended.includes(selectedStudent.name)
                const wasLate = cls.late?.includes(selectedStudent.name)
                return (
                  <div key={cls.id} style={{
                    display: 'flex', gap: 12, padding: '10px 0',
                    borderBottom: '1px solid var(--border)',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      width: 4, height: 32, borderRadius: 2,
                      background: msSubjColour(cls.subject), flexShrink: 0,
                    }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{cls.topic}</div>
                      <div style={{ fontSize: 11, color: 'var(--s500)' }}>{cls.subject} | {msTimeAgo(cls.date)}</div>
                    </div>
                    <span style={{
                      background: wasPresent ? '#DCFCE7' : '#FEE2E2',
                      color: wasPresent ? '#15803D' : '#B91C1C',
                      fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
                      padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase',
                    }}>
                      {wasPresent ? (wasLate ? 'Late' : 'Present') : 'Absent'}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* COMMUNICATION / NOTES TAB */}
        {detailTab === 'communication' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {/* Add note */}
            <div className="card">
              <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Add Note</div>
              <div className="fg">
                <label className="fl">Category</label>
                <select className="fsel" value={noteCategory} onChange={e => setNoteCategory(e.target.value)}>
                  <option value="observation">Observation</option>
                  <option value="behavior">Behavior</option>
                  <option value="parent-comm">Parent Communication</option>
                  <option value="intervention">Intervention</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>
              <div className="fg" style={{ marginBottom: 12 }}>
                <label className="fl">Note</label>
                <textarea className="fi" rows={4} value={newNoteText} onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Write your observation or note about this student..."
                  style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}/>
              </div>
              <button onClick={addNote}
                style={{
                  background: '#7D1025', color: '#FBFAF5', border: 'none',
                  padding: '10px 18px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700, width: '100%',
                }}>Save Note</button>
              <div style={{
                background: '#FBFAF5', borderLeft: '3px solid #C9A030',
                padding: '8px 12px', borderRadius: 'var(--rsm)',
                fontSize: 11.5, color: 'var(--s500)', marginTop: 12, fontStyle: 'italic',
              }}>
                Notes are private to teaching staff. They help track patterns over time.
              </div>
            </div>

            {/* All notes */}
            <div className="card">
              <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>
                All Notes <span style={{ fontWeight: 400, color: 'var(--s400)' }}>({studentNotes.length})</span>
              </div>
              {studentNotes.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>
                  No notes yet. Add your first observation.
                </div>
              ) : (
                studentNotes.map(note => (
                  <div key={note.id} style={{
                    background: '#FBFAF5', borderLeft: '3px solid #C9A030',
                    padding: '12px 14px', borderRadius: 'var(--rsm)',
                    marginBottom: 8,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        background: '#7D1025', color: '#FBFAF5',
                        fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em',
                        padding: '2px 7px', borderRadius: 99, textTransform: 'uppercase',
                      }}>{note.category}</span>
                      <button onClick={() => deleteNote(note.id)}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--s400)',
                          fontSize: 11, cursor: 'pointer',
                        }}>Delete</button>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--s700)', lineHeight: 1.6, marginBottom: 4 }}>
                      {note.text}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--s400)' }}>
                      {note.author} | {msTimeAgo(note.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── ROSTER VIEW ─────────────────────────────────────
  return (
    <div>
      {/* Hero — CRIMSON theme */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
        color: '#FBFAF5',
      }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 6, color: '#F0CC5A' }}>
              My Students
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Your Roster
            </h1>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              {rosterStats.total} students | Class average mastery {rosterStats.avgMastery}% | Attendance {rosterStats.avgAttendance}%
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
          {[
            ['Total',      rosterStats.total,      '#FBFAF5'],
            ['Excellent',  rosterStats.excellent,  '#86EFAC'],
            ['On Track',   rosterStats.onTrack,    '#F0CC5A'],
            ['Needs Help', rosterStats.needsHelp,  '#FCD34D'],
            ['At Risk',    rosterStats.atRisk,     '#FCA5A5'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(251,250,245,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7, marginBottom: 2, color: '#F0CC5A' }}>{l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7D1025', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Search</label>
            <input className="fi" placeholder="Search by student or parent name..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ width: '100%' }}/>
          </div>
          <div style={{ minWidth: 130 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7D1025', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Status</label>
            <select className="fsel" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All</option>
              <option value="excellent">Excellent</option>
              <option value="on-track">On Track</option>
              <option value="needs-help">Needs Help</option>
              <option value="at-risk">At Risk</option>
            </select>
          </div>
          <div style={{ minWidth: 130 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7D1025', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Year</label>
            <select className="fsel" value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All</option>
              {allYears.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 160 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7D1025', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Sort By</label>
            <select className="fsel" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: '100%' }}>
              <option value="priority">Priority (At-risk first)</option>
              <option value="name">Name (A-Z)</option>
              <option value="mastery-high">Mastery (High to Low)</option>
              <option value="mastery-low">Mastery (Low to High)</option>
              <option value="attendance-low">Attendance (Low first)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 10 }}>
        Showing <strong style={{ color: '#7D1025' }}>{sortedStudents.length}</strong> of {rosterStats.total} students
      </div>

      {/* Student grid */}
      {sortedStudents.length === 0 ? (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <h3 style={{ fontSize: 17, color: 'var(--s800)', marginBottom: 6 }}>No students match these filters</h3>
          <p style={{ fontSize: 13.5, color: 'var(--s500)' }}>Try clearing some filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {sortedStudents.map(s => {
            const sty = msStatusStyle(s.status)
            return (
              <div key={s.id} onClick={() => openDetail(s)}
                style={{
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--rmd)',
                  padding: 14,
                  cursor: 'pointer',
                  background: '#FBFAF5',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7D1025'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(125,16,37,.15)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: msAvatarColor(s.name), color: '#FBFAF5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, flexShrink: 0,
                    fontFamily: "'Instrument Serif', serif",
                  }}>{s.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--s500)' }}>{s.curriculum} {s.year}</div>
                  </div>
                  <span style={{
                    background: sty.bg, color: sty.color,
                    border: '1px solid ' + sty.borderColor,
                    fontSize: 10, fontWeight: 700, letterSpacing: '.04em',
                    padding: '3px 8px', borderRadius: 99, flexShrink: 0,
                  }}>{sty.label}</span>
                </div>

                {/* Mastery bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--s500)', fontWeight: 600 }}>Mastery</span>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: sty.color }}>{s.mastery}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: '#FFF', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: s.mastery + '%', background: sty.color, borderRadius: 3 }}/>
                  </div>
                </div>

                {/* Bottom stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--s500)', marginBottom: 10 }}>
                  <span>HW: <strong style={{ color: s.hwSubmitted < s.hwTotal ? '#B45309' : '#15803D' }}>{s.hwSubmitted}/{s.hwTotal}</strong></span>
                  <span>Att: <strong style={{ color: s.attendance >= 85 ? '#15803D' : '#B45309' }}>{s.attendance}%</strong></span>
                  <span>Active: {s.lastActive < 1 ? Math.round(s.lastActive * 24) + 'h' : Math.round(s.lastActive) + 'd'}</span>
                </div>

                {/* Quick action */}
                <div style={{ display: 'flex', gap: 6, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <button onClick={e => { e.stopPropagation(); messageStudent(s) }}
                    style={{
                      flex: 1, background: '#FBFAF5', color: '#7D1025',
                      border: '1px solid #F4C5C5',
                      padding: '6px 10px', borderRadius: 'var(--rsm)',
                      cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    }}>Message</button>
                  <button onClick={e => { e.stopPropagation(); openDetail(s) }}
                    style={{
                      flex: 1, background: '#7D1025', color: '#FBFAF5',
                      border: 'none',
                      padding: '6px 10px', borderRadius: 'var(--rsm)',
                      cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    }}>View Profile</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// EXAMS — Schedule, lock until start time, deploy to students
// ═══════════════════════════════════════════════════════════
// Theme: Smartious crimson (#7D1025) + gold (#C9A030) + cream (#FBFAF5)

const EX_ASSIGNMENTS_KEY = 'sm_exam_assignments'
const EX_SUBMISSIONS_KEY = 'sm_exam_submissions'

const exSubjColours = {
  'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
  'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
  'Geography': '#0F766E', 'Computer Science': '#1F2937',
  'Business Studies': '#7E22CE', 'Economics': '#9F1239',
}
const exSubjColour = (s) => exSubjColours[s] || '#7D1025'

const exTimeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  if (hours < 24) return hours + 'h ago'
  if (days === 1) return 'yesterday'
  if (days < 7) return days + 'd ago'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const exTimeUntil = (iso) => {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff < 0) return null
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'starting now'
  if (mins < 60) return 'in ' + mins + 'm'
  if (hours < 24) return 'in ' + hours + 'h ' + (mins % 60) + 'm'
  if (days === 1) return 'tomorrow'
  return 'in ' + days + ' days'
}

const exFormatDateTime = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' at ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// Compute exam status from start time and duration
const exComputeStatus = (exam) => {
  const now = Date.now()
  const start = new Date(exam.startAt).getTime()
  const end = start + (exam.durationMins * 60000)
  if (now < start) return 'scheduled'
  if (now < end) return 'active'
  return 'ended'
}

const exLoadExams = () => {
  try { return JSON.parse(localStorage.getItem(EX_ASSIGNMENTS_KEY) || '[]') } catch { return [] }
}
const exSaveExams = (exams) => {
  try { localStorage.setItem(EX_ASSIGNMENTS_KEY, JSON.stringify(exams.slice(-200))) } catch {}
}
const exLoadStudents = () => {
  try { return JSON.parse(localStorage.getItem('sm_teacher_students') || '[]') } catch { return [] }
}
const exLoadQuestionBank = () => {
  try { return JSON.parse(localStorage.getItem('sm_question_bank_custom') || '[]') } catch { return [] }
}
const exGenerateId = () => 'exam-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)

// Default datetime-local 1 day from now at 09:00
const exDefaultStartAt = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(9, 0, 0, 0)
  // Format as YYYY-MM-DDTHH:MM (datetime-local format)
  const pad = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

function ExamsTab({ user, store, setPage, toast }) {
  const [exams, setExams] = useState(() => exLoadExams())
  const [view, setView] = useState('list')  // 'list' | 'create' | 'detail'
  const [selectedExam, setSelectedExam] = useState(null)
  const [createStep, setCreateStep] = useState(1)

  // Filters
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQ, setSearchQ] = useState('')

  // Create form state
  const [formTitle, setFormTitle] = useState('')
  const [formSubject, setFormSubject] = useState('Mathematics')
  const [formCurriculum, setFormCurriculum] = useState('IGCSE')
  const [formYear, setFormYear] = useState('Year 10')
  const [formStartAt, setFormStartAt] = useState(exDefaultStartAt())
  const [formDuration, setFormDuration] = useState(60)
  const [formInstructions, setFormInstructions] = useState('Answer ALL questions. Show full working. Calculator NOT permitted.')
  const [formSelectedQuestions, setFormSelectedQuestions] = useState([])
  const [formSelectedStudents, setFormSelectedStudents] = useState([])
  const [bankFilter, setBankFilter] = useState({ subject: 'Mathematics', difficulty: 'all', search: '' })

  const allStudents = exLoadStudents()
  const questionBank = exLoadQuestionBank()

  // Derived
  const examsWithStatus = exams.map(e => ({ ...e, _status: exComputeStatus(e) }))
  const filteredExams = examsWithStatus.filter(e => {
    if (filterStatus !== 'all' && e._status !== filterStatus) return false
    if (searchQ.trim()) {
      const search = searchQ.toLowerCase()
      if (!e.title.toLowerCase().includes(search) && !e.subject.toLowerCase().includes(search)) return false
    }
    return true
  }).sort((a, b) => new Date(b.startAt) - new Date(a.startAt))

  // Filter question bank for picker
  const filteredBankQuestions = questionBank.filter(q => {
    if (q.status !== 'published') return false
    if (bankFilter.subject !== 'all' && q.subject !== bankFilter.subject) return false
    if (bankFilter.difficulty !== 'all' && q.difficulty !== bankFilter.difficulty) return false
    if (bankFilter.search.trim()) {
      const s = bankFilter.search.toLowerCase()
      if (!q.question.toLowerCase().includes(s) && !q.topic.toLowerCase().includes(s)) return false
    }
    return true
  })

  const totalMarks = formSelectedQuestions.reduce((sum, qid) => {
    const q = questionBank.find(qq => qq.id === qid)
    return sum + (q?.marks || 0)
  }, 0)

  // Stats
  const stats = {
    total: exams.length,
    scheduled: examsWithStatus.filter(e => e._status === 'scheduled').length,
    active: examsWithStatus.filter(e => e._status === 'active').length,
    ended: examsWithStatus.filter(e => e._status === 'ended').length,
  }

  // ── ACTIONS ─────────────────────────────────────────
  const resetForm = () => {
    setFormTitle('')
    setFormSubject('Mathematics')
    setFormCurriculum('IGCSE')
    setFormYear('Year 10')
    setFormStartAt(exDefaultStartAt())
    setFormDuration(60)
    setFormInstructions('Answer ALL questions. Show full working. Calculator NOT permitted.')
    setFormSelectedQuestions([])
    setFormSelectedStudents([])
    setCreateStep(1)
  }

  const openCreate = () => {
    resetForm()
    setView('create')
  }

  const toggleQuestion = (qid) => {
    if (formSelectedQuestions.includes(qid)) {
      setFormSelectedQuestions(formSelectedQuestions.filter(id => id !== qid))
    } else {
      setFormSelectedQuestions([...formSelectedQuestions, qid])
    }
  }

  const toggleStudent = (sid) => {
    if (formSelectedStudents.includes(sid)) {
      setFormSelectedStudents(formSelectedStudents.filter(id => id !== sid))
    } else {
      setFormSelectedStudents([...formSelectedStudents, sid])
    }
  }

  const selectAllStudents = () => {
    setFormSelectedStudents(allStudents.map(s => s.id))
  }

  const clearAllStudents = () => {
    setFormSelectedStudents([])
  }

  const validateStep = (step) => {
    if (step === 1) {
      if (!formTitle.trim()) { toast?.error?.('Exam title is required.'); return false }
      if (!formStartAt) { toast?.error?.('Start time is required.'); return false }
      const startTime = new Date(formStartAt).getTime()
      if (startTime < Date.now() - 60000) { toast?.error?.('Start time must be in the future.'); return false }
      if (!formDuration || formDuration < 5) { toast?.error?.('Duration must be at least 5 minutes.'); return false }
      return true
    }
    if (step === 2) {
      if (formSelectedQuestions.length === 0) { toast?.error?.('Select at least one question.'); return false }
      return true
    }
    if (step === 3) {
      if (formSelectedStudents.length === 0) { toast?.error?.('Assign to at least one student.'); return false }
      return true
    }
    return true
  }

  const scheduleExam = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return

    const newExam = {
      id: exGenerateId(),
      title: formTitle.trim(),
      subject: formSubject,
      curriculum: formCurriculum,
      year: formYear,
      startAt: new Date(formStartAt).toISOString(),
      durationMins: parseInt(formDuration) || 60,
      instructions: formInstructions.trim(),
      questionIds: formSelectedQuestions,
      assignedStudents: formSelectedStudents,
      totalMarks: totalMarks,
      status: 'scheduled',
      teacher: 'Mr. James Muthomi',
      createdAt: new Date().toISOString(),
    }

    const updated = [newExam, ...exams]
    setExams(updated)
    exSaveExams(updated)
    toast?.ok?.('Exam scheduled and locked. ' + formSelectedStudents.length + ' students will be notified.')
    setView('list')
    resetForm()
  }

  const deleteExam = (id) => {
    const updated = exams.filter(e => e.id !== id)
    setExams(updated)
    exSaveExams(updated)
    toast?.ok?.('Exam deleted.')
    setSelectedExam(null)
    setView('list')
  }

  const openDetail = (exam) => {
    setSelectedExam(exam)
    setView('detail')
  }

  // ── RENDER: DETAIL VIEW ─────────────────────────────
  if (view === 'detail' && selectedExam) {
    const status = exComputeStatus(selectedExam)
    const subjCol = exSubjColour(selectedExam.subject)
    const examQuestions = selectedExam.questionIds.map(qid => questionBank.find(q => q.id === qid)).filter(Boolean)
    const examStudents = selectedExam.assignedStudents.map(sid => allStudents.find(s => s.id === sid)).filter(Boolean)
    const timeUntil = exTimeUntil(selectedExam.startAt)
    const endTime = new Date(new Date(selectedExam.startAt).getTime() + selectedExam.durationMins * 60000)

    const statusBadge = status === 'scheduled'
      ? { bg: '#FEF3C7', color: '#B45309', label: 'SCHEDULED' }
      : status === 'active'
      ? { bg: '#FEE2E2', color: '#B91C1C', label: 'LIVE NOW' }
      : { bg: '#F1F5F9', color: '#64748B', label: 'ENDED' }

    return (
      <div>
        <button onClick={() => { setView('list'); setSelectedExam(null) }}
          style={{
            background: 'transparent', border: 'none',
            color: '#7D1025', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', padding: '6px 0', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Exams
        </button>

        {/* Hero */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
          color: '#FBFAF5',
        }}>
          <div style={{ padding: '28px 30px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                background: statusBadge.bg, color: statusBadge.color,
                fontSize: 10, fontWeight: 800, letterSpacing: '.08em',
                padding: '4px 10px', borderRadius: 99,
              }}>{statusBadge.label}</span>
              <span style={{ fontSize: 11, opacity: .75, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F0CC5A' }}>
                {selectedExam.subject} | {selectedExam.curriculum} {selectedExam.year}
              </span>
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              {selectedExam.title}
            </h1>
            <div style={{ fontSize: 13, opacity: .9, marginTop: 8 }}>
              {exFormatDateTime(selectedExam.startAt)} | {selectedExam.durationMins} min duration
              {timeUntil && status === 'scheduled' && <> | <strong style={{ color: '#F0CC5A' }}>Starts {timeUntil}</strong></>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
            {[
              ['Questions', selectedExam.questionIds.length,                                 '#FBFAF5'],
              ['Total Marks', selectedExam.totalMarks,                                       '#F0CC5A'],
              ['Duration', selectedExam.durationMins + ' min',                              '#FBFAF5'],
              ['Students', selectedExam.assignedStudents.length,                            '#FBFAF5'],
              ['Ends', endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), '#F0CC5A'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ padding: '14px 18px', borderRight: '1px solid rgba(251,250,245,.08)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7, marginBottom: 2, color: '#F0CC5A' }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          {/* Questions */}
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Questions ({examQuestions.length})</div>
            {examQuestions.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>
                No questions found in bank.
              </div>
            ) : (
              examQuestions.map((q, i) => (
                <div key={q.id} style={{
                  display: 'flex', gap: 10, padding: '10px 0',
                  borderBottom: i < examQuestions.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div className="mono" style={{ width: 28, fontSize: 12, fontWeight: 700, color: 'var(--s400)', flexShrink: 0 }}>Q{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, color: 'var(--s900)', fontWeight: 600,
                      marginBottom: 4, lineHeight: 1.5,
                    }}>{q.question}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--s400)' }}>
                      {q.topic} | {q.difficulty} | {q.marks} marks
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Students assigned */}
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Assigned Students ({examStudents.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {examStudents.map(s => (
                <span key={s.id} style={{
                  background: '#FBFAF5', color: '#7D1025',
                  border: '1px solid #F4C5C5',
                  fontSize: 12, fontWeight: 600,
                  padding: '5px 12px', borderRadius: 99,
                }}>{s.name}</span>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {selectedExam.instructions && (
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Instructions</div>
              <div style={{
                background: '#FBFAF5', borderLeft: '3px solid #C9A030',
                padding: '12px 16px', borderRadius: 'var(--rsm)',
                fontSize: 13.5, color: 'var(--s700)', lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>{selectedExam.instructions}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap' }}>
          {status === 'scheduled' && (
            <button onClick={() => { if (confirm('Delete this scheduled exam? Students will be unassigned.')) deleteExam(selectedExam.id) }}
              style={{
                background: '#FEE2E2', color: '#B91C1C',
                border: '1px solid #FCA5A5',
                padding: '10px 18px', borderRadius: 'var(--rmd)',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>Cancel Exam</button>
          )}
          <button onClick={() => { setView('list'); setSelectedExam(null) }} className="btn btn-s">Close</button>
        </div>
      </div>
    )
  }

  // ── RENDER: CREATE FORM ─────────────────────────────
  if (view === 'create') {
    return (
      <div>
        <button onClick={() => { setView('list'); resetForm() }}
          style={{
            background: 'transparent', border: 'none',
            color: '#7D1025', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', padding: '6px 0', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Exams
        </button>

        <div style={{ marginBottom: 18 }}>
          <div className="sec-tag" style={{ color: '#7D1025' }}>Schedule New Exam</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>
            Create <em style={{ color: '#7D1025' }}>Exam</em>
          </h2>
        </div>

        {/* Step indicators */}
        <div style={{
          background: '#FBFAF5',
          borderRadius: 'var(--rmd)',
          padding: 14, marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          {[
            { n: 1, label: 'Details' },
            { n: 2, label: 'Questions' },
            { n: 3, label: 'Assign & Lock' },
          ].map((step, i) => {
            const isActive = createStep === step.n
            const isDone = createStep > step.n
            return (
              <div key={step.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'auto', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: isActive ? '#7D1025' : isDone ? '#C9A030' : '#FFF',
                  color: isActive || isDone ? '#FBFAF5' : 'var(--s500)',
                  border: '2px solid ' + (isActive ? '#7D1025' : isDone ? '#C9A030' : 'var(--border)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                  flexShrink: 0,
                }}>{isDone ? (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : step.n}</div>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: isActive ? '#7D1025' : isDone ? '#C9A030' : 'var(--s400)',
                }}>{step.label}</span>
                {i < 2 && <div style={{ flex: 1, height: 2, background: isDone ? '#C9A030' : 'var(--border)', margin: '0 8px' }}/>}
              </div>
            )
          })}
        </div>

        {/* STEP 1: DETAILS */}
        {createStep === 1 && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>Exam Details</div>

            <div className="fg">
              <label className="fl">Exam Title *</label>
              <input className="fi" value={formTitle} onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. Mid-Term Mathematics Mock Paper 1"/>
            </div>

            <div className="fr2">
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Subject</label>
                <select className="fsel" value={formSubject} onChange={e => setFormSubject(e.target.value)}>
                  {QB_SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Curriculum</label>
                <select className="fsel" value={formCurriculum} onChange={e => setFormCurriculum(e.target.value)}>
                  {Object.entries(QB_CURRICULA).map(([id, info]) => <option key={id} value={id}>{info.label}</option>)}
                </select>
              </div>
            </div>

            <div className="fg" style={{ marginTop: 14 }}>
              <label className="fl">Year / Grade</label>
              <select className="fsel" value={formYear} onChange={e => setFormYear(e.target.value)}>
                {(QB_CURRICULA[formCurriculum]?.years || []).map(y => <option key={y}>{y}</option>)}
              </select>
            </div>

            <div className="fr2" style={{ marginTop: 14 }}>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Start Time *</label>
                <input className="fi" type="datetime-local" value={formStartAt}
                  onChange={e => setFormStartAt(e.target.value)}/>
                <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4 }}>
                  Exam will be locked until this time
                </div>
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Duration (minutes) *</label>
                <input className="fi" type="number" min="5" max="300"
                  value={formDuration} onChange={e => setFormDuration(e.target.value)}/>
                <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4 }}>
                  Auto-submits at {formStartAt && formDuration ? new Date(new Date(formStartAt).getTime() + parseInt(formDuration) * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}
                </div>
              </div>
            </div>

            <div className="fg" style={{ marginTop: 14, marginBottom: 0 }}>
              <label className="fl">Instructions</label>
              <textarea className="fi" rows={4} value={formInstructions}
                onChange={e => setFormInstructions(e.target.value)}
                placeholder="What students will see before starting the exam"
                style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}/>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button onClick={() => { if (validateStep(1)) setCreateStep(2) }}
                style={{
                  background: '#7D1025', color: '#FBFAF5', border: 'none',
                  padding: '10px 20px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                Continue to Questions
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: QUESTIONS */}
        {createStep === 2 && (
          <div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div className="ctitle" style={{ color: '#7D1025' }}>
                  Pick Questions from Bank
                  {formSelectedQuestions.length > 0 && (
                    <span style={{
                      marginLeft: 10,
                      background: '#C9A030', color: '#7D1025',
                      fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
                      padding: '3px 10px', borderRadius: 99,
                    }}>{formSelectedQuestions.length} selected | {totalMarks} marks</span>
                  )}
                </div>
                <button onClick={() => setPage('questionbank')}
                  style={{
                    background: 'transparent', border: '1px solid #7D1025',
                    color: '#7D1025', padding: '6px 12px',
                    borderRadius: 'var(--rsm)', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700,
                  }}>+ Add to Question Bank</button>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <input className="fi" placeholder="Search questions..."
                  value={bankFilter.search}
                  onChange={e => setBankFilter({ ...bankFilter, search: e.target.value })}
                  style={{ flex: 1, minWidth: 180 }}/>
                <select className="fsel" value={bankFilter.subject}
                  onChange={e => setBankFilter({ ...bankFilter, subject: e.target.value })}
                  style={{ minWidth: 140 }}>
                  <option value="all">All Subjects</option>
                  {QB_SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
                <select className="fsel" value={bankFilter.difficulty}
                  onChange={e => setBankFilter({ ...bankFilter, difficulty: e.target.value })}
                  style={{ minWidth: 130 }}>
                  <option value="all">All Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {filteredBankQuestions.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>
                  No questions found. Add questions in the Question Bank first.
                </div>
              ) : (
                <div style={{ maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredBankQuestions.map(q => {
                    const isSelected = formSelectedQuestions.includes(q.id)
                    const subjCol = exSubjColour(q.subject)
                    return (
                      <div key={q.id} onClick={() => toggleQuestion(q.id)}
                        style={{
                          padding: 12,
                          border: '1.5px solid ' + (isSelected ? '#7D1025' : 'var(--border)'),
                          borderRadius: 'var(--rmd)',
                          background: isSelected ? '#FBE8E8' : '#FBFAF5',
                          cursor: 'pointer',
                          display: 'flex', gap: 12, alignItems: 'flex-start',
                        }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 4,
                          background: isSelected ? '#7D1025' : '#FFF',
                          border: '2px solid ' + (isSelected ? '#7D1025' : 'var(--border)'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 2,
                        }}>
                          {isSelected && (
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#FBFAF5" strokeWidth="3" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{
                              background: subjCol + '15', color: subjCol,
                              fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em',
                              padding: '2px 7px', borderRadius: 99, textTransform: 'uppercase',
                            }}>{q.subject}</span>
                            <span style={{ fontSize: 10.5, color: 'var(--s500)' }}>{q.topic} | {q.difficulty}</span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--s900)', fontWeight: 600 }}>{q.question}</div>
                        </div>
                        <span style={{
                          background: 'var(--bg)', color: 'var(--s700)',
                          padding: '4px 8px', borderRadius: 'var(--rsm)',
                          fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                          flexShrink: 0,
                        }}>{q.marks}m</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setCreateStep(1)} className="btn btn-s">Back</button>
              <button onClick={() => { if (validateStep(2)) setCreateStep(3) }}
                style={{
                  background: '#7D1025', color: '#FBFAF5', border: 'none',
                  padding: '10px 20px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                Continue to Assign
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ASSIGN & LOCK */}
        {createStep === 3 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              {/* Students */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                  <div className="ctitle" style={{ color: '#7D1025' }}>
                    Assign to Students ({formSelectedStudents.length}/{allStudents.length})
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={selectAllStudents}
                      style={{
                        background: '#FBFAF5', color: '#7D1025',
                        border: '1px solid #F4C5C5',
                        padding: '4px 10px', borderRadius: 'var(--rsm)',
                        cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      }}>Select All</button>
                    <button onClick={clearAllStudents}
                      style={{
                        background: 'transparent', color: 'var(--s500)',
                        border: '1px solid var(--border)',
                        padding: '4px 10px', borderRadius: 'var(--rsm)',
                        cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      }}>Clear</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto' }}>
                  {allStudents.map(s => {
                    const isSelected = formSelectedStudents.includes(s.id)
                    return (
                      <label key={s.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 10px',
                          border: '1.5px solid ' + (isSelected ? '#7D1025' : 'var(--border)'),
                          borderRadius: 'var(--rmd)',
                          background: isSelected ? '#FBE8E8' : '#FBFAF5',
                          cursor: 'pointer',
                        }}>
                        <input type="checkbox" checked={isSelected}
                          onChange={() => toggleStudent(s.id)}
                          style={{ accentColor: '#7D1025' }}/>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: msAvatarColor(s.name), color: '#FBFAF5',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 11, flexShrink: 0,
                        }}>{s.initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--s500)' }}>{s.year} | Mastery {s.mastery}%</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="card" style={{ background: '#FBFAF5', border: '2px solid #C9A030' }}>
                <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Exam Summary</div>
                {[
                  ['Title',         formTitle || '—'],
                  ['Subject',       formSubject + ' | ' + formCurriculum + ' | ' + formYear],
                  ['Start Time',    formStartAt ? exFormatDateTime(new Date(formStartAt).toISOString()) : '—'],
                  ['Duration',      formDuration + ' min'],
                  ['Questions',     formSelectedQuestions.length],
                  ['Total Marks',   totalMarks],
                  ['Students',      formSelectedStudents.length],
                ].map(([l, v]) => (
                  <div key={l} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: '1px solid #F4C5C5',
                    fontSize: 13,
                  }}>
                    <span style={{ color: 'var(--s500)' }}>{l}</span>
                    <span style={{ fontWeight: 700, color: '#7D1025', textAlign: 'right', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                  </div>
                ))}
                <div style={{
                  background: '#FFF', borderLeft: '3px solid #7D1025',
                  padding: '12px 14px', borderRadius: 'var(--rsm)',
                  fontSize: 12.5, color: 'var(--s700)', marginTop: 14,
                  lineHeight: 1.6,
                }}>
                  <strong style={{ color: '#7D1025' }}>What happens next:</strong>
                  <br/>This exam will be LOCKED for all assigned students. They will see a countdown until the start time. At start time, they can begin the exam. Auto-submits at end of duration.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setCreateStep(2)} className="btn btn-s">Back</button>
              <button onClick={scheduleExam}
                style={{
                  background: '#C9A030', color: '#7D1025', border: 'none',
                  padding: '12px 24px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(201,160,48,.35)',
                }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Schedule and Lock Exam
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── RENDER: LIST VIEW ───────────────────────────────
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
        color: '#FBFAF5',
      }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 6, color: '#F0CC5A' }}>
              Exams
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Schedule and Deploy Tests
            </h1>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              Build exams from your Question Bank. Lock until start time. Auto-submits at end.
            </div>
          </div>
          <button onClick={openCreate}
            style={{
              background: '#C9A030', color: '#7D1025', border: 'none',
              padding: '12px 22px', borderRadius: 'var(--rmd)',
              cursor: 'pointer', fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(201,160,48,.35)',
            }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Schedule New Exam
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
          {[
            ['Total',     stats.total,     '#FBFAF5'],
            ['Scheduled', stats.scheduled, '#F0CC5A'],
            ['Live Now',  stats.active,    '#FCA5A5'],
            ['Ended',     stats.ended,     '#FBFAF5'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(251,250,245,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7, marginBottom: 2, color: '#F0CC5A' }}>{l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7D1025', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Search</label>
            <input className="fi" placeholder="Search by exam title or subject..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ width: '100%' }}/>
          </div>
          <div style={{ minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7D1025', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Status</label>
            <select className="fsel" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Live Now</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 10 }}>
        Showing <strong style={{ color: '#7D1025' }}>{filteredExams.length}</strong> of {stats.total} exams
      </div>

      {filteredExams.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%',
            background: '#FBFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#C9A030" strokeWidth="1.5" strokeLinecap="round">
              <rect x="9" y="3" width="6" height="4" rx="1.5"/>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 17, color: 'var(--s800)', marginBottom: 6 }}>
            {stats.total === 0 ? 'No exams scheduled yet' : 'No exams match these filters'}
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 380, margin: '0 auto 14px' }}>
            {stats.total === 0
              ? 'Schedule your first exam. Pick questions from your bank, set a start time, and assign students.'
              : 'Try clearing some filters.'}
          </p>
          {stats.total === 0 && (
            <button onClick={openCreate}
              style={{
                background: '#7D1025', color: '#FBFAF5', border: 'none',
                padding: '10px 20px', borderRadius: 'var(--rmd)',
                cursor: 'pointer', fontSize: 14, fontWeight: 700,
              }}>Schedule Your First Exam</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredExams.map(exam => {
            const status = exam._status
            const subjCol = exSubjColour(exam.subject)
            const timeUntil = exTimeUntil(exam.startAt)
            const statusBadge = status === 'scheduled'
              ? { bg: '#FEF3C7', color: '#B45309', label: 'SCHEDULED' }
              : status === 'active'
              ? { bg: '#FEE2E2', color: '#B91C1C', label: 'LIVE NOW' }
              : { bg: '#F1F5F9', color: '#64748B', label: 'ENDED' }

            return (
              <div key={exam.id} className="card" style={{
                padding: 14, borderLeft: '4px solid ' + subjCol, cursor: 'pointer',
              }} onClick={() => openDetail(exam)}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        background: statusBadge.bg, color: statusBadge.color,
                        fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em',
                        padding: '2px 8px', borderRadius: 99,
                      }}>{statusBadge.label}</span>
                      {status === 'active' && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#B91C1C', animation: 'pulse 1.5s infinite' }}/>
                      )}
                      <span style={{ fontSize: 11, fontWeight: 700, color: subjCol, letterSpacing: '.06em', textTransform: 'uppercase' }}>{exam.subject}</span>
                      <span style={{ fontSize: 11, color: 'var(--s500)' }}>{exam.curriculum} {exam.year}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--s900)', marginBottom: 4 }}>{exam.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                      {exFormatDateTime(exam.startAt)} | {exam.durationMins} min | {exam.questionIds.length} questions | {exam.totalMarks} marks
                      {timeUntil && status === 'scheduled' && <> | <strong style={{ color: '#C9A030' }}>{timeUntil}</strong></>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: '#7D1025' }}>
                      {exam.assignedStudents.length}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Students</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// HOMEWORK — wired to /api/homework backend
// Phase 3.6 (full): list + create/edit/delete + submissions + grade
// ═══════════════════════════════════════════════════════════

const hwTimeAgo = (iso) => {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  if (hours < 24) return hours + 'h ago'
  if (days === 1) return 'yesterday'
  if (days < 7) return days + 'd ago'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const hwTimeUntil = (iso) => {
  if (!iso) return ''
  const diff = new Date(iso).getTime() - Date.now()
  if (diff < 0) {
    const days = Math.floor(-diff / 86400000)
    if (days === 0) return 'overdue today'
    return days + 'd overdue'
  }
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return 'due in ' + mins + 'm'
  if (hours < 24) return 'due in ' + hours + 'h'
  if (days === 1) return 'due tomorrow'
  if (days < 7) return 'due in ' + days + 'd'
  return 'due ' + new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const hwDefaultDateTime = (daysFromNow = 7) => {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(23, 59, 0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

// Convert backend ISO date to datetime-local format
const isoToLocal = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

const hwTypeMeta = {
  mcq:      { letter: 'M', color: '#1E3A8A', label: 'MCQ' },
  short:    { letter: 'S', color: '#166534', label: 'Short' },
  long:     { letter: 'L', color: '#7E22CE', label: 'Long' },
  drawing:  { letter: 'D', color: '#DC2626', label: 'Drawing' },
  upload:   { letter: 'U', color: '#7D1025', label: 'Upload' },
}

function HomeworkTab({ user, store, setPage, toast }) {
  // ── DATA STATE ──
  const [homework, setHomework] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  // ── CATALOG (for create modal) ──
  const [catalog, setCatalog] = useState({ curricula: [], gradesByCurriculum: {}, subjects: [] })
  const [rooms, setRooms] = useState([])

  // ── CREATE/EDIT MODAL ──
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)

  // ── BANK PICKER ──
  const [bankOpen, setBankOpen] = useState(false)
  const [bankQuestions, setBankQuestions] = useState([])
  const [bankLoading, setBankLoading] = useState(false)
  const [bankFilters, setBankFilters] = useState({ curriculum: '', subject: '', grade: '', type: '', q: '' })

  // ── CUSTOM QUESTION SUB-MODAL ──
  const [customOpen, setCustomOpen] = useState(false)
  const [customForm, setCustomForm] = useState(null)

  // ── DRAG STATE ──
  const [dragIndex, setDragIndex] = useState(null)

  // ── DETAIL VIEW STATE ──
  const [detailHw, setDetailHw] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)

  // ── GRADE VIEW STATE ──
  const [gradeSub, setGradeSub] = useState(null)  // submission being graded
  const [gradeForm, setGradeForm] = useState(null)  // { answers: [...], overallFeedback }
  const [gradeSaving, setGradeSaving] = useState(false)

  // Load homework on mount
  useEffect(() => { loadHomework() }, [])

  // Load catalog + rooms once
  useEffect(() => {
    api.get('/curriculum/options').then(r => {
      if (r.data?.success) setCatalog({
        curricula: r.data.curricula || [],
        gradesByCurriculum: r.data.gradesByCurriculum || {},
        subjects: r.data.subjects || [],
      })
    }).catch(() => {})
    api.get('/grouprooms').then(r => {
      if (r.data?.rooms) {
        const myRooms = r.data.rooms.filter(rm => {
          if (!rm.teacher) return false
          const tid = typeof rm.teacher === 'object' ? rm.teacher._id : rm.teacher
          return tid?.toString() === user?._id?.toString()
        })
        setRooms(myRooms)
      }
    }).catch(() => {})
  }, [user?._id])

  const loadHomework = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.get('/homework?createdBy=me')
      if (data.success) setHomework(data.homework || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load homework')
    } finally { setLoading(false) }
  }

  // Tab filtering
  const filteredHw = homework.filter(hw => {
    if (activeTab === 'draft') return hw.status === 'draft'
    if (activeTab === 'published') return hw.status === 'published'
    return true
  })
  const counts = {
    all: homework.length,
    draft: homework.filter(h => h.status === 'draft').length,
    published: homework.filter(h => h.status === 'published').length,
  }

  // ── CREATE MODAL HANDLERS ──
  const openCreate = () => {
    setEditingId(null)
    setForm({
      title: '', description: '', curriculum: '', grade: '', subject: '',
      questions: [], assignedRoom: '', assignedStudents: [],
      releaseAt: hwDefaultDateTime(0), dueAt: hwDefaultDateTime(7),
      saveCustomToBank: true,
    })
    setCreateOpen(true)
  }

  const openEdit = (hw) => {
    setEditingId(hw._id)
    setForm({
      title: hw.title || '',
      description: hw.description || '',
      curriculum: hw.curriculum || '',
      grade: hw.grade || '',
      subject: hw.subject || '',
      questions: Array.isArray(hw.questions) ? hw.questions.map(q => ({...q})) : [],
      assignedRoom: typeof hw.assignedRoom === 'object' && hw.assignedRoom ? hw.assignedRoom._id : (hw.assignedRoom || ''),
      assignedStudents: Array.isArray(hw.assignedStudents)
        ? hw.assignedStudents.map(s => typeof s === 'object' ? s._id : s)
        : [],
      releaseAt: isoToLocal(hw.releaseAt),
      dueAt: isoToLocal(hw.dueAt),
      saveCustomToBank: false,  // edits don't re-save to bank
    })
    setDetailHw(null)  // close detail if open
    setCreateOpen(true)
  }

  const closeCreate = () => { setCreateOpen(false); setForm(null); setEditingId(null) }
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleRoomChange = (roomId) => {
    if (!roomId) { setForm(f => ({ ...f, assignedRoom: '' })); return }
    const room = rooms.find(r => r._id === roomId)
    if (!room) { setForm(f => ({ ...f, assignedRoom: roomId })); return }
    setForm(f => ({ ...f, assignedRoom: roomId, curriculum: room.curriculum || f.curriculum, grade: room.grade || f.grade, subject: room.subject || f.subject }))
  }

  // ── BANK PICKER ──
  const openBankPicker = () => {
    setBankFilters({ curriculum: form?.curriculum || '', subject: form?.subject || '', grade: form?.grade || '', type: '', q: '' })
    setBankOpen(true)
    loadBankQuestions(form?.curriculum, form?.subject, form?.grade, '', '')
  }

  const loadBankQuestions = async (curriculum, subject, grade, type, q) => {
    setBankLoading(true)
    try {
      const params = new URLSearchParams()
      if (curriculum) params.append('curriculum', curriculum)
      if (subject) params.append('subject', subject)
      if (grade) params.append('grade', grade)
      if (type) params.append('type', type)
      if (q?.trim()) params.append('q', q.trim())
      params.append('limit', '50')
      const { data } = await api.get('/questions?' + params.toString())
      if (data.success) setBankQuestions(data.questions || [])
    } catch (e) { toast?.error?.('Failed to load bank questions') }
    finally { setBankLoading(false) }
  }

  useEffect(() => {
    if (!bankOpen) return
    const handle = setTimeout(() => {
      loadBankQuestions(bankFilters.curriculum, bankFilters.subject, bankFilters.grade, bankFilters.type, bankFilters.q)
    }, 250)
    return () => clearTimeout(handle)
  }, [bankFilters, bankOpen])

  const addBankQuestionToForm = (q) => {
    const snap = {
      questionId: q._id, type: q.type, questionText: q.questionText,
      options: Array.isArray(q.options) ? [...q.options] : [],
      correctAnswer: q.correctAnswer, explanation: q.explanation || '',
      marks: q.marks || 1, difficulty: q.difficulty || 'medium',
      attachments: Array.isArray(q.attachments) ? [...q.attachments] : [],
      topic: q.topic || '',
    }
    setForm(f => ({ ...f, questions: [...f.questions, snap] }))
    toast?.ok?.('Added: ' + q.questionText.slice(0, 40) + (q.questionText.length > 40 ? '...' : ''))
  }

  // ── CUSTOM QUESTION ──
  const openCustom = () => {
    setCustomForm({ type: 'short', questionText: '', options: ['', '', '', ''], correctIndex: null, correctAnswer: '', explanation: '', marks: 1, difficulty: 'medium', topic: '', saveToBank: true })
    setCustomOpen(true)
  }
  const closeCustom = () => { setCustomOpen(false); setCustomForm(null) }
  const setCF = (k, v) => setCustomForm(f => ({ ...f, [k]: v }))
  const setCustomOption = (i, v) => setCustomForm(f => { const next = [...f.options]; next[i] = v; return { ...f, options: next } })
  const addCustomOption = () => setCustomForm(f => ({ ...f, options: [...f.options, ''] }))
  const removeCustomOption = (i) => setCustomForm(f => {
    const next = f.options.filter((_, idx) => idx !== i)
    let newCorrect = f.correctIndex
    if (f.correctIndex === i) newCorrect = null
    else if (f.correctIndex > i) newCorrect = f.correctIndex - 1
    return { ...f, options: next, correctIndex: newCorrect }
  })

  const addCustomToForm = () => {
    if (!customForm.questionText.trim()) { toast?.error?.('Question text is required'); return }
    if (customForm.type === 'mcq') {
      const filled = customForm.options.filter(o => o.trim())
      if (filled.length < 2) { toast?.error?.('MCQ needs at least 2 options'); return }
      if (customForm.correctIndex === null) { toast?.error?.('Mark which option is correct'); return }
    } else if (customForm.type === 'short' || customForm.type === 'long') {
      if (!customForm.correctAnswer.trim()) { toast?.error?.('Model answer is required'); return }
    }
    const cleanOptions = customForm.type === 'mcq' ? customForm.options.filter(o => o.trim()) : []
    let correctAnswer = null
    if (customForm.type === 'mcq' && customForm.correctIndex !== null) {
      const correctText = customForm.options[customForm.correctIndex]
      correctAnswer = cleanOptions.indexOf(correctText)
    } else { correctAnswer = customForm.correctAnswer.trim() }
    const snap = {
      questionId: null, type: customForm.type, questionText: customForm.questionText.trim(),
      options: cleanOptions, correctAnswer, explanation: customForm.explanation.trim(),
      marks: parseInt(customForm.marks) || 1, difficulty: customForm.difficulty,
      attachments: [], topic: customForm.topic.trim(), saveToBank: customForm.saveToBank,
    }
    setForm(f => ({ ...f, questions: [...f.questions, snap] }))
    toast?.ok?.('Custom question added')
    closeCustom()
  }

  // ── REORDER/REMOVE ──
  const removeQuestion = (i) => setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }))

  const onDragStart = (i) => (e) => { setDragIndex(i); e.dataTransfer.effectAllowed = 'move' }
  const onDragOver = (i) => (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const onDrop = (toIndex) => (e) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === toIndex) return
    setForm(f => {
      const next = [...f.questions]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(toIndex, 0, moved)
      return { ...f, questions: next }
    })
    setDragIndex(null)
  }
  const onDragEnd = () => setDragIndex(null)

  // ── SAVE HOMEWORK ──
  const totalMarks = (form?.questions || []).reduce((sum, q) => sum + (q.marks || 0), 0)

  const validateForm = () => {
    if (!form.title?.trim()) return 'Title is required'
    if (!form.curriculum) return 'Curriculum is required'
    if (!form.subject) return 'Subject is required'
    if (!form.grade) return 'Grade is required'
    if (!form.questions || form.questions.length === 0) return 'Add at least one question'
    if (!form.releaseAt) return 'Release date is required'
    if (!form.assignedRoom && (!form.assignedStudents || form.assignedStudents.length === 0)) return 'Pick a room or specific students'
    return null
  }

  const saveHomework = async (asStatus) => {
    const err = validateForm()
    if (err) { toast?.error?.(err); return }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(), description: form.description.trim(),
        curriculum: form.curriculum, subject: form.subject, grade: form.grade,
        questions: form.questions, saveCustomToBank: form.saveCustomToBank,
        assignedRoom: form.assignedRoom || null,
        assignedStudents: form.assignedStudents || [],
        releaseAt: new Date(form.releaseAt).toISOString(),
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
        status: asStatus,
      }
      const result = editingId
        ? await api.patch('/homework/' + editingId, payload)
        : await api.post('/homework', payload)
      if (result.data.success) {
        toast?.ok?.(editingId ? 'Homework updated' : ('Homework ' + (asStatus === 'published' ? 'published' : 'saved as draft')))
        await loadHomework()
        closeCreate()
      } else { toast?.error?.(result.data.message || 'Save failed') }
    } catch (e) {
      toast?.error?.(e.response?.data?.message || 'Save failed: ' + e.message)
    } finally { setSaving(false) }
  }

  // ── DELETE HOMEWORK ──
  const handleDelete = async (hw) => {
    if (!confirm('Delete "' + hw.title + '"? This cannot be undone. All student submissions will become inaccessible.')) return
    try {
      const { data } = await api.delete('/homework/' + hw._id)
      if (data.success) {
        toast?.ok?.('Homework deleted')
        await loadHomework()
        setDetailHw(null)
      } else { toast?.error?.(data.message || 'Delete failed') }
    } catch (e) { toast?.error?.(e.response?.data?.message || 'Delete failed') }
  }

  // ── DETAIL VIEW ──
  const openDetail = async (hw) => {
    setDetailHw(hw)
    setSubmissionsLoading(true)
    setSubmissions([])
    try {
      const { data } = await api.get('/homework/' + hw._id + '/submissions')
      if (data.success) setSubmissions(data.submissions || [])
    } catch (e) {
      toast?.error?.('Failed to load submissions')
    } finally { setSubmissionsLoading(false) }
  }
  const closeDetail = () => { setDetailHw(null); setSubmissions([]) }

  // ── GRADE VIEW ──
  const openGrade = (sub) => {
    if (!detailHw) return
    // Initialize grade form with existing answers
    const answers = (detailHw.questions || []).map((q, idx) => {
      const existing = (sub.answers || []).find(a => a.questionIndex === idx)
      return {
        questionIndex: idx,
        // existing student answer fields (read-only display)
        studentAnswer: existing?.answer,
        studentAttachment: existing?.attachment,
        type: q.type,
        // editable grading fields
        marksAwarded: existing?.marksAwarded !== null && existing?.marksAwarded !== undefined ? existing.marksAwarded : null,
        feedback: existing?.feedback || '',
        autoGraded: existing?.autoGraded || false,
        maxMarks: q.marks || 1,
      }
    })
    setGradeForm({ answers, overallFeedback: sub.overallFeedback || '' })
    setGradeSub(sub)
  }
  const closeGrade = () => { setGradeSub(null); setGradeForm(null) }

  const setGradeAnswer = (idx, field, value) => {
    setGradeForm(f => {
      const next = [...f.answers]
      next[idx] = { ...next[idx], [field]: value }
      return { ...f, answers: next }
    })
  }

  const saveGrade = async (release = false) => {
    if (!gradeSub || !detailHw || !gradeForm) return
    // Validate marks are within bounds
    for (const a of gradeForm.answers) {
      if (a.marksAwarded === null || a.marksAwarded === undefined || a.marksAwarded === '') {
        toast?.error?.('Question ' + (a.questionIndex + 1) + ': set marks (0 if wrong)')
        return
      }
      const m = parseFloat(a.marksAwarded)
      if (isNaN(m) || m < 0 || m > a.maxMarks) {
        toast?.error?.('Question ' + (a.questionIndex + 1) + ': marks must be 0-' + a.maxMarks)
        return
      }
    }
    setGradeSaving(true)
    try {
      const payload = {
        answers: gradeForm.answers.map(a => ({
          questionIndex: a.questionIndex,
          marksAwarded: parseFloat(a.marksAwarded),
          feedback: a.feedback || '',
        })),
        overallFeedback: gradeForm.overallFeedback || '',
        release,
      }
      const { data } = await api.patch('/homework/' + detailHw._id + '/submissions/' + gradeSub._id + '/grade', payload)
      if (data.success) {
        toast?.ok?.(release ? 'Graded and released to student' : 'Grade saved (not yet released)')
        // Reload submissions
        const reload = await api.get('/homework/' + detailHw._id + '/submissions')
        if (reload.data.success) setSubmissions(reload.data.submissions || [])
        closeGrade()
      } else { toast?.error?.(data.message || 'Save failed') }
    } catch (e) {
      toast?.error?.(e.response?.data?.message || 'Save failed: ' + e.message)
    } finally { setGradeSaving(false) }
  }

  // Form-derived data
  const formGrades = form?.curriculum ? (catalog.gradesByCurriculum[form.curriculum] || []) : []
  const formSubjects = form?.curriculum
    ? catalog.subjects.filter(s => s.availableIn === 'all' || (Array.isArray(s.availableIn) && s.availableIn.includes(form.curriculum)))
    : []
  const bankSubjects = bankFilters.curriculum
    ? catalog.subjects.filter(s => s.availableIn === 'all' || (Array.isArray(s.availableIn) && s.availableIn.includes(bankFilters.curriculum)))
    : catalog.subjects
  const bankGrades = bankFilters.curriculum ? (catalog.gradesByCurriculum[bankFilters.curriculum] || []) : []

  // Submission stats for the detail view
  const submissionStats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    graded: submissions.filter(s => s.status === 'graded' || s.status === 'released').length,
    released: submissions.filter(s => s.status === 'released').length,
  }

  return (
    <div>
      {/* Hero */}
      <div className="card" style={{ padding: 0, marginBottom: 18, overflow: 'hidden', background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)', color: '#FBFAF5' }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 6, color: '#F0CC5A' }}>Homework</div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>Create &amp; Manage</h1>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>Build assignments. Auto-grade MCQ. Lock until release date. Review and grade student submissions.</div>
          </div>
          <button onClick={openCreate} style={{ background: '#C9A030', color: '#7D1025', border: 'none', padding: '12px 22px', borderRadius: 'var(--rmd)', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(201,160,48,.35)' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Homework
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#FBFAF5', border: '1px solid var(--border)', borderRadius: 'var(--rmd)', padding: 4, marginBottom: 14, gap: 2 }}>
        {[{ id: 'all', label: 'All', count: counts.all }, { id: 'published', label: 'Published', count: counts.published }, { id: 'draft', label: 'Draft', count: counts.draft }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ flex: 1, background: activeTab === t.id ? '#7D1025' : 'transparent', color: activeTab === t.id ? '#FBFAF5' : 'var(--s500)', border: 'none', padding: '10px 14px', borderRadius: 'var(--rsm)', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {t.label}
            {t.count > 0 && <span style={{ background: activeTab === t.id ? 'rgba(251,250,245,.2)' : 'var(--bg)', color: activeTab === t.id ? '#FBFAF5' : 'var(--s500)', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 99 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {loading && <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--s500)' }}>Loading homework from backend...</div>}
      {error && <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>Failed: {error}</div>}

      {!loading && !error && filteredHw.length === 0 && (
        <div className="card" style={{ padding: 50, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: 'var(--s900)', marginBottom: 6 }}>{homework.length === 0 ? 'No homework yet' : 'Nothing in this tab'}</div>
          <div style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 380, margin: '0 auto 14px' }}>{homework.length === 0 ? 'Click "New Homework" to create your first assignment.' : 'Try a different tab.'}</div>
          {homework.length === 0 && <button onClick={openCreate} className="btn btn-p btn-sm">Create homework</button>}
        </div>
      )}

      {!loading && !error && filteredHw.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredHw.map(hw => {
            const isOverdue = hw.dueAt && new Date(hw.dueAt) < new Date()
            const releaseAt = hw.releaseAt ? new Date(hw.releaseAt) : null
            const isLocked = releaseAt && releaseAt > new Date()
            return (
              <div key={hw._id} className="card" style={{ padding: 14, borderLeft: '4px solid ' + (hw.status === 'draft' ? '#C9A030' : '#7D1025') }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#7D1025', letterSpacing: '.06em', textTransform: 'uppercase' }}>{hw.subject}</span>
                      <span style={{ fontSize: 11, color: 'var(--s500)' }}>{hw.curriculum} · {hw.grade}</span>
                      <span style={{ background: hw.status === 'draft' ? '#FBF6E3' : '#DCFCE7', color: hw.status === 'draft' ? '#92400E' : '#15803D', fontSize: 9.5, fontWeight: 800, letterSpacing: '.06em', padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase' }}>{hw.status}</span>
                      {isLocked && hw.status === 'published' && <span style={{ background: '#FBE8E8', color: '#7D1025', fontSize: 9.5, fontWeight: 800, padding: '2px 8px', borderRadius: 99, letterSpacing: '.06em' }}>LOCKED</span>}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--s900)', marginBottom: 4 }}>{hw.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                      Released {hwTimeAgo(hw.releaseAt)}
                      {hw.dueAt ? <> · <strong style={{ color: isOverdue ? '#B91C1C' : '#7D1025' }}>{hwTimeUntil(hw.dueAt)}</strong></> : ''}
                      {' · '}{hw.questionCount || 0} question{hw.questionCount === 1 ? '' : 's'} · {hw.totalMarks || 0} marks
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openDetail(hw)} className="btn btn-p btn-sm">View</button>
                    <button onClick={() => openEdit(hw)} className="btn btn-s btn-sm">Edit</button>
                    <button onClick={() => handleDelete(hw)} className="btn btn-s btn-sm" style={{ color: '#DC2626' }}>Delete</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* DETAIL MODAL — view homework + submissions */}
      {detailHw && (
        <div onClick={closeDetail} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: 12, maxWidth: 900, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.3)', marginTop: 30, marginBottom: 30 }}>
            <div style={{ padding: '20px 28px', background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)', color: '#FBFAF5' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, color: '#F0CC5A', marginBottom: 4 }}>
                {detailHw.subject} · {detailHw.curriculum} · {detailHw.grade}
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24 }}>{detailHw.title}</div>
              <div style={{ fontSize: 13, opacity: .9, marginTop: 6, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span>Released {hwTimeAgo(detailHw.releaseAt)}</span>
                {detailHw.dueAt && <span>{hwTimeUntil(detailHw.dueAt)}</span>}
                <span>{detailHw.questionCount} question{detailHw.questionCount === 1 ? '' : 's'} · {detailHw.totalMarks} marks</span>
              </div>
            </div>

            <div style={{ padding: '20px 28px' }}>
              {detailHw.description && (
                <div style={{ marginBottom: 16, fontSize: 13.5, color: 'var(--s700)', lineHeight: 1.65 }}>{detailHw.description}</div>
              )}

              {/* Submission stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 16 }}>
                <div className="card" style={{ padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Total</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--s900)' }}>{submissionStats.total}</div>
                </div>
                <div className="card" style={{ padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#92400E', textTransform: 'uppercase', letterSpacing: '.06em' }}>To Grade</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#92400E' }}>{submissionStats.submitted}</div>
                </div>
                <div className="card" style={{ padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#15803D', textTransform: 'uppercase', letterSpacing: '.06em' }}>Graded</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#15803D' }}>{submissionStats.graded}</div>
                </div>
                <div className="card" style={{ padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.06em' }}>Released</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1E3A8A' }}>{submissionStats.released}</div>
                </div>
              </div>

              {/* Submissions list */}
              <div style={{ marginBottom: 14, fontSize: 14, fontWeight: 700, color: '#7D1025' }}>Student Submissions</div>

              {submissionsLoading && <div style={{ padding: 24, textAlign: 'center', color: 'var(--s500)' }}>Loading submissions...</div>}

              {!submissionsLoading && submissions.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--s500)', background: 'var(--bg)', borderRadius: 6 }}>
                  No submissions yet. Students will appear here once they submit.
                </div>
              )}

              {!submissionsLoading && submissions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {submissions.map(sub => {
                    const studentName = sub.student
                      ? ((sub.student.firstName || '') + ' ' + (sub.student.lastName || '')).trim()
                      : 'Unknown'
                    const score = sub.totalAwarded || 0
                    const max = sub.totalPossible || detailHw.totalMarks || 0
                    const pct = max > 0 ? Math.round((score / max) * 100) : 0
                    const statusColor = sub.status === 'released' ? '#15803D' : sub.status === 'graded' ? '#1E3A8A' : sub.status === 'submitted' ? '#92400E' : 'var(--s500)'
                    return (
                      <div key={sub._id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: 12, border: '1px solid var(--border)', borderRadius: 8,
                        background: '#FFF',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--s900)' }}>{studentName}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>
                            {sub.submittedAt ? 'Submitted ' + hwTimeAgo(sub.submittedAt) : 'Started ' + hwTimeAgo(sub.startedAt)}
                            {sub.isLate && ' · late'}
                            {sub.status === 'released' && sub.releasedAt && ' · released ' + hwTimeAgo(sub.releasedAt)}
                          </div>
                        </div>
                        {sub.status !== 'in_progress' && max > 0 && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: statusColor, fontFamily: 'JetBrains Mono, monospace' }}>{score}/{max}</div>
                            <div style={{ fontSize: 10, color: 'var(--s500)' }}>{pct}%</div>
                          </div>
                        )}
                        <span style={{
                          background: sub.status === 'released' ? '#DCFCE7' : sub.status === 'graded' ? '#DBEAFE' : sub.status === 'submitted' ? '#FEF3C7' : '#F3F4F6',
                          color: statusColor,
                          fontSize: 9.5, fontWeight: 800, letterSpacing: '.06em',
                          padding: '3px 9px', borderRadius: 99, textTransform: 'uppercase',
                        }}>{sub.status === 'in_progress' ? 'in progress' : sub.status}</span>
                        {sub.status !== 'in_progress' && (
                          <button onClick={() => openGrade(sub)} className="btn btn-p btn-sm" style={{ flexShrink: 0 }}>
                            {sub.status === 'submitted' ? 'Grade' : 'Review'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', background: '#FBFAF5', display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { closeDetail(); openEdit(detailHw) }} className="btn btn-s btn-sm">Edit Homework</button>
                <button onClick={() => handleDelete(detailHw)} className="btn btn-s btn-sm" style={{ color: '#DC2626' }}>Delete</button>
              </div>
              <button onClick={closeDetail} className="btn btn-s">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* GRADE MODAL — review one student's submission */}
      {gradeSub && gradeForm && detailHw && (
        <div onClick={closeGrade} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 1100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: 12, maxWidth: 880, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.4)', marginTop: 30, marginBottom: 30 }}>
            <div style={{ padding: '20px 28px', background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)', color: '#FBFAF5' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, color: '#F0CC5A', marginBottom: 4 }}>Grading Submission</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>
                {gradeSub.student?.firstName} {gradeSub.student?.lastName}
              </div>
              <div style={{ fontSize: 13, opacity: .9, marginTop: 4 }}>{detailHw.title}</div>
            </div>

            <div style={{ padding: '20px 28px', maxHeight: '65vh', overflowY: 'auto' }}>
              {/* Per-question grading */}
              {(detailHw.questions || []).map((q, idx) => {
                const a = gradeForm.answers[idx]
                if (!a) return null
                const meta = hwTypeMeta[q.type] || hwTypeMeta.short

                return (
                  <div key={idx} style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--rmd)',
                    padding: 16, marginBottom: 12,
                    background: idx % 2 === 0 ? '#FFF' : 'var(--bg)',
                  }}>
                    {/* Question text */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
                      <span className="mono" style={{
                        fontSize: 11, fontWeight: 700, color: '#7D1025',
                        background: '#FBE8E8', padding: '2px 8px', borderRadius: 4,
                        flexShrink: 0,
                      }}>Q{idx + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s900)', lineHeight: 1.5 }}>{q.questionText}</div>
                        <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 2 }}>
                          {meta.label} · max {q.marks} mark{q.marks === 1 ? '' : 's'}
                          {a.autoGraded && <span style={{ marginLeft: 8, color: '#1E3A8A', fontWeight: 700 }}>· auto-graded</span>}
                        </div>
                      </div>
                    </div>

                    {/* Question's own attachments */}
                    {q.attachments && q.attachments.length > 0 && (
                      <div style={{ marginBottom: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {q.attachments.map((att, i) => (
                          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                            {att.mimeType?.startsWith('image/')
                              ? <img src={att.url} alt="" style={{ maxWidth: 150, maxHeight: 100, borderRadius: 4, border: '1px solid var(--border)' }}/>
                              : <span style={{ fontSize: 12, padding: '4px 10px', background: 'var(--bg)', borderRadius: 4 }}>{att.filename || 'File'}</span>}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Student's answer (read-only) */}
                    <div style={{ marginBottom: 12, padding: 10, background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 6 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--s500)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Student's Answer</div>

                      {q.type === 'mcq' && a.studentAnswer !== null && a.studentAnswer !== undefined && (
                        <div>
                          {q.options.map((opt, optIdx) => {
                            const wasSelected = a.studentAnswer === optIdx
                            const isCorrect = (typeof q.correctAnswer === 'number' && q.correctAnswer === optIdx) || (typeof q.correctAnswer === 'string' && q.correctAnswer === opt)
                            return (
                              <div key={optIdx} style={{
                                padding: '6px 10px', marginBottom: 3,
                                border: '1px solid ' + (wasSelected ? (isCorrect ? '#22C55E' : '#DC2626') : 'var(--border)'),
                                background: wasSelected ? (isCorrect ? '#DCFCE7' : '#FEE2E2') : '#FFF',
                                borderRadius: 4, fontSize: 12.5,
                                display: 'flex', alignItems: 'center', gap: 6,
                              }}>
                                <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--s500)' }}>{String.fromCharCode(65 + optIdx)}</span>
                                <span style={{ flex: 1 }}>{opt}</span>
                                {wasSelected && <span style={{ fontSize: 10, fontWeight: 700, color: isCorrect ? '#15803D' : '#B91C1C' }}>STUDENT PICKED</span>}
                                {isCorrect && <span style={{ fontSize: 10, fontWeight: 700, color: '#15803D' }}>CORRECT</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {(q.type === 'short' || q.type === 'long') && (
                        <div style={{ fontSize: 13.5, color: 'var(--s700)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {a.studentAnswer || <em style={{ color: 'var(--s400)' }}>No answer provided</em>}
                        </div>
                      )}

                      {(q.type === 'upload' || q.type === 'drawing') && (
                        a.studentAttachment && a.studentAttachment.url ? (
                          a.studentAttachment.mimeType?.startsWith('image/')
                            ? <img src={a.studentAttachment.url} alt="" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 4, border: '1px solid var(--border)' }}/>
                            : <a href={a.studentAttachment.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#7D1025' }}>{a.studentAttachment.filename || 'View file'}</a>
                        ) : <em style={{ color: 'var(--s400)' }}>No file submitted</em>
                      )}
                    </div>

                    {/* Model answer for reference */}
                    {q.correctAnswer !== null && q.correctAnswer !== undefined && q.type !== 'mcq' && (
                      <div style={{ marginBottom: 12, padding: 10, background: '#FBF6E3', borderLeft: '3px solid #C9A030', borderRadius: 4 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#92400E', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>Model Answer</div>
                        <div style={{ fontSize: 12.5, color: 'var(--s700)', lineHeight: 1.5 }}>{q.correctAnswer}</div>
                      </div>
                    )}

                    {/* Marks input */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--s700)' }}>Marks:</label>
                      <input
                        type="number"
                        min="0"
                        max={a.maxMarks}
                        step="0.5"
                        value={a.marksAwarded === null || a.marksAwarded === undefined ? '' : a.marksAwarded}
                        onChange={e => setGradeAnswer(idx, 'marksAwarded', e.target.value)}
                        style={{
                          width: 80, padding: '6px 10px',
                          border: '1.5px solid var(--border)',
                          borderRadius: 6, fontSize: 14, fontFamily: 'JetBrains Mono, monospace',
                          textAlign: 'center', fontWeight: 700,
                        }}
                      />
                      <span style={{ fontSize: 12, color: 'var(--s500)', fontFamily: 'JetBrains Mono, monospace' }}>/ {a.maxMarks}</span>
                      {/* Quick action buttons */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button type="button" onClick={() => setGradeAnswer(idx, 'marksAwarded', a.maxMarks)}
                          style={{ padding: '4px 10px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                          Full ({a.maxMarks})
                        </button>
                        <button type="button" onClick={() => setGradeAnswer(idx, 'marksAwarded', Math.floor(a.maxMarks / 2))}
                          style={{ padding: '4px 10px', background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                          Half
                        </button>
                        <button type="button" onClick={() => setGradeAnswer(idx, 'marksAwarded', 0)}
                          style={{ padding: '4px 10px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                          Zero
                        </button>
                      </div>
                    </div>

                    {/* Per-question feedback */}
                    <textarea
                      value={a.feedback || ''}
                      onChange={e => setGradeAnswer(idx, 'feedback', e.target.value)}
                      placeholder="Feedback for this question (optional)"
                      rows={2}
                      style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4, fontSize: 12.5, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }}
                    />
                  </div>
                )
              })}

              {/* Overall feedback */}
              <div style={{ marginTop: 16, padding: 14, background: '#FBFAF5', border: '1px solid #C9A030', borderRadius: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#7D1025', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'block' }}>
                  Overall Feedback
                </label>
                <textarea
                  value={gradeForm.overallFeedback || ''}
                  onChange={e => setGradeForm(f => ({ ...f, overallFeedback: e.target.value }))}
                  placeholder="What did the student do well? What can they improve?"
                  rows={3}
                  style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }}
                />
              </div>

              {/* Total preview */}
              <div style={{ marginTop: 14, padding: 14, background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11.5, color: '#15803D', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Total Score</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#15803D', fontFamily: 'JetBrains Mono, monospace' }}>
                    {gradeForm.answers.reduce((sum, a) => sum + (parseFloat(a.marksAwarded) || 0), 0)} / {detailHw.totalMarks}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11.5, color: '#15803D', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Percentage</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#15803D', fontFamily: 'JetBrains Mono, monospace' }}>
                    {detailHw.totalMarks > 0
                      ? Math.round((gradeForm.answers.reduce((sum, a) => sum + (parseFloat(a.marksAwarded) || 0), 0) / detailHw.totalMarks) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', background: '#FBFAF5', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={closeGrade} className="btn btn-s" disabled={gradeSaving}>Cancel</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => saveGrade(false)} disabled={gradeSaving} className="btn btn-s">
                  {gradeSaving ? 'Saving...' : 'Save (don\'t release yet)'}
                </button>
                <button onClick={() => saveGrade(true)} disabled={gradeSaving} className="btn btn-p"
                  style={{ background: '#15803D', borderColor: '#15803D' }}>
                  {gradeSaving ? 'Releasing...' : 'Save & Release to Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {createOpen && form && (
        <div onClick={closeCreate} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: 12, maxWidth: 800, width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <div style={{ padding: '20px 28px', background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)', color: '#FBFAF5' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, color: '#F0CC5A', marginBottom: 4 }}>{editingId ? 'Edit Assignment' : 'New Assignment'}</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>{editingId ? 'Update Homework' : 'Create Homework'}</div>
            </div>

            <div style={{ padding: '24px 28px' }}>
              <div className="fg">
                <label className="fl">Title *</label>
                <input className="fi" value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g. Quadratic Equations Practice" autoFocus/>
              </div>
              <div className="fg">
                <label className="fl">Instructions / Description</label>
                <textarea className="fi" rows={2} value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Brief description shown to students" style={{ resize: 'vertical' }}/>
              </div>

              <div className="fg">
                <label className="fl">Assign to Room</label>
                <select className="fsel" value={form.assignedRoom} onChange={e => handleRoomChange(e.target.value)}>
                  <option value="">No room — assign by individual students</option>
                  {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.curriculum} · {r.subject} · {r.grade}, {r.students?.length || 0} students)</option>)}
                </select>
                {rooms.length === 0 && <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4 }}>No rooms assigned to you yet. Ask admin to create one and assign you as teacher.</div>}
              </div>

              <div className="fr2">
                <div className="fg">
                  <label className="fl">Curriculum *</label>
                  <select className="fsel" value={form.curriculum} onChange={e => setForm(f => ({ ...f, curriculum: e.target.value, grade: '', subject: '' }))}>
                    <option value="">Select...</option>
                    {catalog.curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label className="fl">Grade *</label>
                  <select className="fsel" value={form.grade} onChange={e => setF('grade', e.target.value)} disabled={!form.curriculum}>
                    <option value="">{form.curriculum ? 'Select...' : 'Pick curriculum first'}</option>
                    {formGrades.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="fg">
                <label className="fl">Subject *</label>
                <select className="fsel" value={form.subject} onChange={e => setF('subject', e.target.value)} disabled={!form.curriculum}>
                  <option value="">{form.curriculum ? 'Select...' : 'Pick curriculum first'}</option>
                  {formSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="fr2">
                <div className="fg">
                  <label className="fl">Release Date *</label>
                  <input className="fi" type="datetime-local" value={form.releaseAt} onChange={e => setF('releaseAt', e.target.value)}/>
                  <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4 }}>Students see it locked until this time.</div>
                </div>
                <div className="fg">
                  <label className="fl">Due Date</label>
                  <input className="fi" type="datetime-local" value={form.dueAt} onChange={e => setF('dueAt', e.target.value)}/>
                  <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4 }}>Submissions after this are flagged as late.</div>
                </div>
              </div>

              {/* Questions */}
              <div style={{ marginTop: 18, padding: 14, background: '#FBFAF5', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#7D1025' }}>
                    Questions ({form.questions.length})
                    {form.questions.length > 0 && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--s500)', fontWeight: 400 }}>· {totalMarks} total marks</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={openBankPicker} className="btn btn-s btn-sm" disabled={!form.curriculum || !form.subject}>+ From Bank</button>
                    <button type="button" onClick={openCustom} className="btn btn-s btn-sm">+ Write New</button>
                  </div>
                </div>

                {form.questions.length === 0 && (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--s400)', fontSize: 13 }}>
                    {!form.curriculum ? 'Pick curriculum and subject first.' : 'No questions yet. Add from your Question Bank or write a new one.'}
                  </div>
                )}

                {form.questions.map((q, i) => {
                  const meta = hwTypeMeta[q.type] || hwTypeMeta.short
                  return (
                    <div key={i} draggable onDragStart={onDragStart(i)} onDragOver={onDragOver(i)} onDrop={onDrop(i)} onDragEnd={onDragEnd}
                      style={{
                        background: '#FFF', border: '1px solid ' + (dragIndex === i ? '#C9A030' : 'var(--border)'),
                        borderRadius: 8, padding: 10, marginBottom: 6,
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        cursor: 'move', opacity: dragIndex === i ? 0.5 : 1,
                      }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                        <div style={{ color: 'var(--s400)', fontSize: 12, fontWeight: 700 }}>⋮⋮</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, color: 'var(--s500)' }}>Q{i + 1}</div>
                      </div>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: meta.color + '15', color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{meta.letter}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: 'var(--s900)', marginBottom: 2 }}>{q.questionText}</div>
                        <div style={{ fontSize: 11, color: 'var(--s500)' }}>
                          {meta.label} · {q.marks} mark{q.marks === 1 ? '' : 's'} · {q.difficulty}
                          {q.questionId ? ' · from bank' : (q.saveToBank ? ' · custom (will save to bank)' : ' · custom')}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeQuestion(i)} style={{ background: 'transparent', border: '1px solid var(--border)', color: '#DC2626', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', flexShrink: 0, fontSize: 14 }}>×</button>
                    </div>
                  )
                })}

                {form.questions.length > 1 && <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 6, fontStyle: 'italic' }}>Drag to reorder questions.</div>}
              </div>
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', background: '#FBFAF5', display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-s" onClick={closeCreate} disabled={saving}>Cancel</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => saveHomework('draft')} disabled={saving} className="btn btn-s">{saving ? 'Saving...' : 'Save as Draft'}</button>
                <button onClick={() => saveHomework('published')} disabled={saving} className="btn btn-p">{saving ? 'Publishing...' : (editingId ? 'Update & Keep Published' : 'Publish')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BANK PICKER */}
      {bankOpen && (
        <div onClick={() => setBankOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: 12, maxWidth: 760, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
            <div style={{ padding: '16px 24px', background: '#7D1025', color: '#FBFAF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Pick Question from Bank</div>
              <button onClick={() => setBankOpen(false)} style={{ background: 'transparent', border: 'none', color: '#FBFAF5', cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 10 }}>
                <select className="fsel" value={bankFilters.curriculum} onChange={e => setBankFilters(f => ({ ...f, curriculum: e.target.value, subject: '', grade: '' }))}>
                  <option value="">All curricula</option>
                  {catalog.curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="fsel" value={bankFilters.subject} onChange={e => setBankFilters(f => ({ ...f, subject: e.target.value }))} disabled={!bankFilters.curriculum}>
                  <option value="">All subjects</option>
                  {bankSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <select className="fsel" value={bankFilters.grade} onChange={e => setBankFilters(f => ({ ...f, grade: e.target.value }))} disabled={!bankFilters.curriculum}>
                  <option value="">All grades</option>
                  {bankGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select className="fsel" value={bankFilters.type} onChange={e => setBankFilters(f => ({ ...f, type: e.target.value }))}>
                  <option value="">All types</option>
                  <option value="mcq">MCQ</option>
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                  <option value="drawing">Drawing</option>
                  <option value="upload">Upload</option>
                </select>
              </div>
              <input className="fi" placeholder="Search question text..." value={bankFilters.q} onChange={e => setBankFilters(f => ({ ...f, q: e.target.value }))} style={{ marginBottom: 12 }}/>

              {bankLoading && <div style={{ textAlign: 'center', padding: 24, color: 'var(--s500)' }}>Loading...</div>}
              {!bankLoading && bankQuestions.length === 0 && <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>No questions match. Adjust filters or write a custom question.</div>}
              {!bankLoading && bankQuestions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {bankQuestions.map(q => {
                    const meta = hwTypeMeta[q.type] || hwTypeMeta.short
                    const alreadyAdded = (form?.questions || []).some(fq => fq.questionId === q._id)
                    return (
                      <div key={q._id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 10, border: '1px solid var(--border)', borderRadius: 8, background: alreadyAdded ? 'var(--bg)' : '#FFF' }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: meta.color + '15', color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{meta.letter}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: 'var(--s900)', marginBottom: 2 }}>{q.questionText}</div>
                          <div style={{ fontSize: 11, color: 'var(--s500)' }}>{q.curriculum} · {q.subject} · {q.grade} · {meta.label} · {q.marks}m</div>
                        </div>
                        <button onClick={() => addBankQuestionToForm(q)} disabled={alreadyAdded} className="btn btn-p btn-sm" style={{ flexShrink: 0 }}>{alreadyAdded ? 'Added' : 'Add'}</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', background: '#FBFAF5', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setBankOpen(false)} className="btn btn-p">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM QUESTION SUB-MODAL */}
      {customOpen && customForm && (
        <div onClick={closeCustom} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: 12, maxWidth: 680, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
            <div style={{ padding: '16px 24px', background: '#7D1025', color: '#FBFAF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Write Custom Question</div>
              <button onClick={closeCustom} style={{ background: 'transparent', border: 'none', color: '#FBFAF5', cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div className="fg">
                <label className="fl">Question Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 6 }}>
                  {Object.entries(hwTypeMeta).map(([type, meta]) => (
                    <button key={type} type="button" onClick={() => setCF('type', type)}
                      style={{ padding: '8px 10px', border: '2px solid ' + (customForm.type === type ? meta.color : 'var(--border)'), background: customForm.type === type ? meta.color + '15' : 'transparent', borderRadius: 6, cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color: customForm.type === type ? meta.color : 'var(--s600)' }}>{meta.label}</button>
                  ))}
                </div>
              </div>
              <div className="fg">
                <label className="fl">Question Text *</label>
                <textarea className="fi" rows={3} value={customForm.questionText} onChange={e => setCF('questionText', e.target.value)} placeholder="Type the question..." style={{ resize: 'vertical' }}/>
              </div>
              {customForm.type === 'mcq' && (
                <div className="fg">
                  <label className="fl">Options (mark correct one)</label>
                  {customForm.options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                      <button type="button" onClick={() => setCF('correctIndex', i)}
                        style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid ' + (customForm.correctIndex === i ? '#15803D' : 'var(--border)'), background: customForm.correctIndex === i ? '#15803D' : '#FFF', color: customForm.correctIndex === i ? '#FFF' : 'var(--s400)', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                        {String.fromCharCode(65 + i)}
                      </button>
                      <input className="fi" value={opt} onChange={e => setCustomOption(i, e.target.value)} placeholder={'Option ' + (i + 1)}/>
                      {customForm.options.length > 2 && <button type="button" onClick={() => removeCustomOption(i)} className="btn btn-s btn-sm">×</button>}
                    </div>
                  ))}
                  <button type="button" onClick={addCustomOption} className="btn btn-s btn-sm" style={{ marginTop: 4 }}>+ Add option</button>
                </div>
              )}
              {(customForm.type === 'short' || customForm.type === 'long') && (
                <div className="fg">
                  <label className="fl">Model Answer *</label>
                  <textarea className="fi" rows={customForm.type === 'long' ? 4 : 2} value={customForm.correctAnswer} onChange={e => setCF('correctAnswer', e.target.value)} placeholder="The expected answer (used for marking)" style={{ resize: 'vertical' }}/>
                </div>
              )}
              <div className="fg">
                <label className="fl">Topic (optional)</label>
                <input className="fi" value={customForm.topic} onChange={e => setCF('topic', e.target.value)} placeholder="e.g. Algebra, Pythagoras"/>
              </div>
              <div className="fr2">
                <div className="fg">
                  <label className="fl">Marks</label>
                  <input className="fi" type="number" min="1" value={customForm.marks} onChange={e => setCF('marks', e.target.value)}/>
                </div>
                <div className="fg">
                  <label className="fl">Difficulty</label>
                  <select className="fsel" value={customForm.difficulty} onChange={e => setCF('difficulty', e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--s700)', cursor: 'pointer', marginTop: 6 }}>
                <input type="checkbox" checked={customForm.saveToBank} onChange={e => setCF('saveToBank', e.target.checked)} style={{ accentColor: '#7D1025' }}/>
                Also save this question to my Question Bank for reuse
              </label>
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', background: '#FBFAF5', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={closeCustom} className="btn btn-s">Cancel</button>
              <button onClick={addCustomToForm} className="btn btn-p">Add to Homework</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// ═══════════════════════════════════════════════════════════
// COMMUNICATION — Safety-filtered messaging with admin oversight
// ═══════════════════════════════════════════════════════════
// Theme: Smartious crimson (#7D1025) + gold (#C9A030) + cream (#FBFAF5)
//
// CHILD SAFETY DESIGN:
// - All teacher-student messages auto-logged to admin audit (sm_messages_audit)
// - Anti-grooming filter on outgoing messages (warns + flags suspicious phrases)
// - Cannot edit or delete sent messages (immutable conversation log)
// - "Visible to admin" indicator always shown on student channels
// - Auto-flags suspicious patterns to sm_safety_flags

const CM_MESSAGES_KEY      = 'sm_messages'
const CM_AUDIT_KEY         = 'sm_messages_audit'
const CM_FLAGS_KEY         = 'sm_safety_flags'
const CM_SEEDED_KEY        = 'sm_messages_seeded'

// Phrases that trigger child-safety warning when teacher messages a STUDENT
// (these patterns are inappropriate for adult-to-minor communication on an education platform)
const CM_RISKY_PATTERNS = [
  { pattern: /\b(don'?t tell|keep this between|just between us|our secret|private chat|don'?t mention)\b/i, label: 'secrecy language', severity: 'high' },
  { pattern: /\b(meet me|come to my|my house|my place|alone)\b/i, label: 'in-person meeting', severity: 'high' },
  { pattern: /\b(text me|whatsapp me|call me|my phone|my number)\b/i, label: 'off-platform contact', severity: 'high' },
  { pattern: /\b\d{3}[\s\-]?\d{3}[\s\-]?\d{4}\b|\b\+?\d{10,}\b/, label: 'phone number', severity: 'medium' },
  { pattern: /\b(facebook|instagram|tiktok|snapchat|telegram|signal|discord)\b/i, label: 'social media platform', severity: 'medium' },
  { pattern: /\b(gift|present|surprise|give you something)\b/i, label: 'gift offer', severity: 'medium' },
  { pattern: /\b(beautiful|pretty|cute|attractive|handsome)\b/i, label: 'personal compliment', severity: 'medium' },
  { pattern: /\b(home address|where do you live|your address)\b/i, label: 'address request', severity: 'high' },
]

const cmCheckMessage = (text) => {
  const flags = []
  for (const p of CM_RISKY_PATTERNS) {
    if (p.pattern.test(text)) flags.push({ label: p.label, severity: p.severity })
  }
  return flags
}

const cmTimeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  if (hours < 24) return hours + 'h ago'
  if (days === 1) return 'yesterday'
  if (days < 7) return days + 'd ago'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const cmFormatTime = (iso) => {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const cmAvatarColor = (name) => {
  const colors = ['#7D1025', '#8B1A2E', '#C9A030', '#1E3A8A', '#166534', '#7C2D12', '#6B21A8', '#92400E']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
  return colors[Math.abs(hash) % colors.length]
}

const cmInitials = (name) => {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'
}

// Load/save
const cmLoadMessages = () => {
  try { return JSON.parse(localStorage.getItem(CM_MESSAGES_KEY) || '[]') } catch { return [] }
}
const cmSaveMessages = (msgs) => {
  try { localStorage.setItem(CM_MESSAGES_KEY, JSON.stringify(msgs.slice(-500))) } catch {}
}
const cmLoadAudit = () => {
  try { return JSON.parse(localStorage.getItem(CM_AUDIT_KEY) || '[]') } catch { return [] }
}
const cmAppendAudit = (entry) => {
  try {
    const existing = cmLoadAudit()
    existing.push(entry)
    localStorage.setItem(CM_AUDIT_KEY, JSON.stringify(existing.slice(-500)))
  } catch {}
}
const cmAppendFlag = (entry) => {
  try {
    const existing = JSON.parse(localStorage.getItem(CM_FLAGS_KEY) || '[]')
    existing.push(entry)
    localStorage.setItem(CM_FLAGS_KEY, JSON.stringify(existing.slice(-200)))
  } catch {}
}
const cmLoadStudents = () => {
  try { return JSON.parse(localStorage.getItem('sm_teacher_students') || '[]') } catch { return [] }
}
const cmGenerateId = () => 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)

// Seed sample messages
const cmSeedSample = (teacherName) => {
  if (localStorage.getItem(CM_SEEDED_KEY)) return
  const now = Date.now()
  const samples = [
    // Parent thread: Janet Osei (Amara's parent)
    {
      id: cmGenerateId(), threadId: 'th-parent-amara',
      from: 'Janet Osei', fromRole: 'parent',
      to: teacherName, toRole: 'teacher',
      channel: 'parent',
      subject: "Amara's progress in Algebra",
      body: 'Hello, I noticed Amara has been struggling with quadratic equations at home. Could you give us a few extra practice resources for the weekend?',
      sentAt: new Date(now - 2 * 86400000).toISOString(),
      read: true, flags: [],
    },
    {
      id: cmGenerateId(), threadId: 'th-parent-amara',
      from: teacherName, fromRole: 'teacher',
      to: 'Janet Osei', toRole: 'parent',
      channel: 'parent',
      subject: "Re: Amara's progress in Algebra",
      body: "Thanks for letting me know. I'll send Amara a custom worksheet on Monday with worked examples. She should complete it by Friday.",
      sentAt: new Date(now - 86400000).toISOString(),
      read: true, flags: [],
    },
    {
      id: cmGenerateId(), threadId: 'th-parent-amara',
      from: 'Janet Osei', fromRole: 'parent',
      to: teacherName, toRole: 'teacher',
      channel: 'parent',
      subject: "Re: Amara's progress in Algebra",
      body: "Thank you so much. We'll make sure she completes it.",
      sentAt: new Date(now - 3600000).toISOString(),
      read: false, flags: [],
    },
    // Parent thread: David's parent (at-risk)
    {
      id: cmGenerateId(), threadId: 'th-parent-david',
      from: teacherName, fromRole: 'teacher',
      to: 'James Mwangi', toRole: 'parent',
      channel: 'parent',
      subject: "David's recent attendance",
      body: "Mr. Mwangi, I wanted to reach out about David's attendance. He missed last week's class on Pythagoras. Could we set up a brief call to discuss?",
      sentAt: new Date(now - 4 * 86400000).toISOString(),
      read: true, flags: [],
    },
    {
      id: cmGenerateId(), threadId: 'th-parent-david',
      from: 'James Mwangi', fromRole: 'parent',
      to: teacherName, toRole: 'teacher',
      channel: 'parent',
      subject: "Re: David's recent attendance",
      body: "Thank you for noticing. He's been unwell. Can we connect next week?",
      sentAt: new Date(now - 3 * 86400000).toISOString(),
      read: true, flags: [],
    },
    // Student thread: Kofi (high performer asking for extension work)
    {
      id: cmGenerateId(), threadId: 'th-student-kofi',
      from: 'Kofi Mensah', fromRole: 'student',
      to: teacherName, toRole: 'teacher',
      channel: 'student',
      subject: 'Extension work request',
      body: 'Hello sir, I finished the homework already. Can I get extra problems to work on this weekend?',
      sentAt: new Date(now - 6 * 3600000).toISOString(),
      read: false, flags: [], adminVisible: true,
    },
    // Admin thread
    {
      id: cmGenerateId(), threadId: 'th-admin-1',
      from: 'School Admin', fromRole: 'admin',
      to: teacherName, toRole: 'teacher',
      channel: 'admin',
      subject: 'Term 2 schedule confirmation',
      body: 'Please confirm your availability for the Term 2 schedule. Live class slots are unchanged from Term 1.',
      sentAt: new Date(now - 5 * 86400000).toISOString(),
      read: true, flags: [],
    },
  ]
  cmSaveMessages(samples)
  localStorage.setItem(CM_SEEDED_KEY, '1')
}

function CommunicationTab({ user, store, setPage, toast }) {
  const teacherFullName = 'Mr. James Muthomi'

  useEffect(() => { cmSeedSample(teacherFullName) }, [])

  const [messages, setMessages] = useState(() => cmLoadMessages())
  const [activeChannel, setActiveChannel] = useState('parent')  // 'parent' | 'student' | 'admin'
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [showCompose, setShowCompose] = useState(false)
  const [searchQ, setSearchQ] = useState('')

  // Compose form
  const [composeTo, setComposeTo] = useState('')
  const [composeChannel, setComposeChannel] = useState('parent')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [composeFlags, setComposeFlags] = useState([])
  const [composeAcknowledged, setComposeAcknowledged] = useState(false)

  // Reply state
  const [replyText, setReplyText] = useState('')
  const [replyFlags, setReplyFlags] = useState([])
  const [replyAcknowledged, setReplyAcknowledged] = useState(false)

  const allStudents = cmLoadStudents()

  // Group messages into threads
  const allThreads = (() => {
    const map = new Map()
    messages.forEach(m => {
      const tid = m.threadId
      if (!map.has(tid)) map.set(tid, [])
      map.get(tid).push(m)
    })
    return Array.from(map.entries()).map(([threadId, msgs]) => {
      msgs.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
      const last = msgs[msgs.length - 1]
      const otherParty = last.from === teacherFullName ? last.to : last.from
      const otherRole = last.from === teacherFullName ? last.toRole : last.fromRole
      const channel = last.channel
      const unread = msgs.filter(m => !m.read && m.from !== teacherFullName).length
      const hasFlags = msgs.some(m => m.flags && m.flags.length > 0)
      return {
        threadId, messages: msgs, last,
        otherParty, otherRole, channel,
        unread, hasFlags,
        subject: msgs[0].subject.replace(/^Re: /, ''),
      }
    }).sort((a, b) => new Date(b.last.sentAt) - new Date(a.last.sentAt))
  })()

  const channelThreads = allThreads.filter(t => t.channel === activeChannel)
  const filteredThreads = channelThreads.filter(t => {
    if (!searchQ.trim()) return true
    const search = searchQ.toLowerCase()
    return t.otherParty.toLowerCase().includes(search) ||
           t.subject.toLowerCase().includes(search) ||
           t.messages.some(m => m.body.toLowerCase().includes(search))
  })

  const channelCounts = {
    parent:  allThreads.filter(t => t.channel === 'parent').length,
    student: allThreads.filter(t => t.channel === 'student').length,
    admin:   allThreads.filter(t => t.channel === 'admin').length,
  }
  const unreadCounts = {
    parent:  allThreads.filter(t => t.channel === 'parent' && t.unread > 0).length,
    student: allThreads.filter(t => t.channel === 'student' && t.unread > 0).length,
    admin:   allThreads.filter(t => t.channel === 'admin' && t.unread > 0).length,
  }

  const activeThread = activeThreadId ? allThreads.find(t => t.threadId === activeThreadId) : null

  // Mark thread as read when opened
  useEffect(() => {
    if (activeThread) {
      const updated = messages.map(m => {
        if (m.threadId === activeThread.threadId && m.from !== teacherFullName && !m.read) {
          return { ...m, read: true }
        }
        return m
      })
      if (JSON.stringify(updated) !== JSON.stringify(messages)) {
        setMessages(updated)
        cmSaveMessages(updated)
      }
    }
  }, [activeThreadId])

  // Recompute compose flags as user types
  useEffect(() => {
    if (composeChannel === 'student' && composeBody.trim()) {
      setComposeFlags(cmCheckMessage(composeBody))
    } else {
      setComposeFlags([])
    }
    setComposeAcknowledged(false)
  }, [composeBody, composeChannel])

  useEffect(() => {
    if (activeThread && activeThread.channel === 'student' && replyText.trim()) {
      setReplyFlags(cmCheckMessage(replyText))
    } else {
      setReplyFlags([])
    }
    setReplyAcknowledged(false)
  }, [replyText, activeThread])

  // ── ACTIONS ─────────────────────────────────────────
  const sendNewMessage = () => {
    if (!composeTo.trim()) { toast?.error?.('Recipient is required.'); return }
    if (!composeSubject.trim()) { toast?.error?.('Subject is required.'); return }
    if (!composeBody.trim()) { toast?.error?.('Message body is required.'); return }

    const flags = composeFlags
    const hasHighSeverity = flags.some(f => f.severity === 'high')

    if (flags.length > 0 && !composeAcknowledged) {
      toast?.error?.('Please review and acknowledge the safety warning before sending.')
      return
    }

    const role = composeChannel === 'parent' ? 'parent' : composeChannel === 'student' ? 'student' : 'admin'
    const newMsg = {
      id: cmGenerateId(),
      threadId: 'th-' + composeChannel + '-' + Date.now(),
      from: teacherFullName, fromRole: 'teacher',
      to: composeTo, toRole: role,
      channel: composeChannel,
      subject: composeSubject.trim(),
      body: composeBody.trim(),
      sentAt: new Date().toISOString(),
      read: true,
      flags: flags,
      adminVisible: composeChannel === 'student',
    }

    const updated = [...messages, newMsg]
    setMessages(updated)
    cmSaveMessages(updated)

    // Audit log for student channel
    if (composeChannel === 'student') {
      cmAppendAudit({
        id: 'audit-' + Date.now(),
        messageId: newMsg.id,
        teacher: teacherFullName,
        student: composeTo,
        subject: composeSubject,
        body: composeBody,
        sentAt: newMsg.sentAt,
        flags: flags,
      })
    }

    // Flag if any safety patterns triggered
    if (flags.length > 0) {
      cmAppendFlag({
        id: 'flag-' + Date.now(),
        messageId: newMsg.id,
        teacher: teacherFullName,
        student: composeChannel === 'student' ? composeTo : null,
        flags: flags,
        severity: hasHighSeverity ? 'high' : 'medium',
        sentAt: newMsg.sentAt,
        body: composeBody,
      })
      toast?.info?.('Message sent. Safety flag logged to admin.')
    } else {
      toast?.ok?.('Message sent.')
    }

    setShowCompose(false)
    setComposeTo(''); setComposeChannel('parent'); setComposeSubject(''); setComposeBody(''); setComposeFlags([]); setComposeAcknowledged(false)
  }

  const sendReply = () => {
    if (!activeThread || !replyText.trim()) return

    const flags = replyFlags
    const hasHighSeverity = flags.some(f => f.severity === 'high')

    if (flags.length > 0 && !replyAcknowledged) {
      toast?.error?.('Please review and acknowledge the safety warning before sending.')
      return
    }

    const newMsg = {
      id: cmGenerateId(),
      threadId: activeThread.threadId,
      from: teacherFullName, fromRole: 'teacher',
      to: activeThread.otherParty, toRole: activeThread.otherRole,
      channel: activeThread.channel,
      subject: 'Re: ' + activeThread.subject,
      body: replyText.trim(),
      sentAt: new Date().toISOString(),
      read: true,
      flags: flags,
      adminVisible: activeThread.channel === 'student',
    }

    const updated = [...messages, newMsg]
    setMessages(updated)
    cmSaveMessages(updated)

    if (activeThread.channel === 'student') {
      cmAppendAudit({
        id: 'audit-' + Date.now(), messageId: newMsg.id,
        teacher: teacherFullName, student: activeThread.otherParty,
        subject: newMsg.subject, body: newMsg.body, sentAt: newMsg.sentAt, flags: flags,
      })
    }

    if (flags.length > 0) {
      cmAppendFlag({
        id: 'flag-' + Date.now(), messageId: newMsg.id,
        teacher: teacherFullName, student: activeThread.channel === 'student' ? activeThread.otherParty : null,
        flags: flags, severity: hasHighSeverity ? 'high' : 'medium',
        sentAt: newMsg.sentAt, body: replyText,
      })
      toast?.info?.('Reply sent. Safety flag logged to admin.')
    } else {
      toast?.ok?.('Reply sent.')
    }

    setReplyText(''); setReplyFlags([]); setReplyAcknowledged(false)
  }

  const reportConversation = () => {
    if (!activeThread) return
    if (!confirm('Report this conversation to admin for review? This action cannot be undone.')) return
    cmAppendFlag({
      id: 'flag-' + Date.now(),
      threadId: activeThread.threadId,
      teacher: teacherFullName,
      otherParty: activeThread.otherParty,
      reason: 'Manually reported by teacher',
      severity: 'high',
      sentAt: new Date().toISOString(),
    })
    toast?.ok?.('Conversation reported to admin.')
  }

  const channelColors = {
    parent: '#7D1025',
    student: '#1E3A8A',
    admin: '#7E22CE',
  }
  const channelLabels = {
    parent: 'Parents',
    student: 'Students',
    admin: 'Admin',
  }
  const channelDescriptions = {
    parent: 'Communication with parents and guardians',
    student: 'Direct messages with students. ALL messages visible to admin for child safety.',
    admin: 'Operational communication with school administration',
  }

  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
        color: '#FBFAF5',
      }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 6, color: '#F0CC5A' }}>
              Communication
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Messages
            </h1>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              Parents, students, and admin in one place. All student conversations are admin-visible for child safety.
            </div>
          </div>
          <button onClick={() => { setShowCompose(true); setComposeChannel(activeChannel) }}
            style={{
              background: '#C9A030', color: '#7D1025', border: 'none',
              padding: '12px 22px', borderRadius: 'var(--rmd)',
              cursor: 'pointer', fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(201,160,48,.35)',
            }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            New Message
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: 'rgba(0,0,0,.18)' }}>
          {[
            ['Parents',  channelCounts.parent,  unreadCounts.parent],
            ['Students', channelCounts.student, unreadCounts.student],
            ['Admin',    channelCounts.admin,   unreadCounts.admin],
          ].map(([l, count, unread]) => (
            <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(251,250,245,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7, marginBottom: 2, color: '#F0CC5A' }}>{l}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#FBFAF5' }}>{count}</span>
                {unread > 0 && (
                  <span style={{
                    background: '#FCA5A5', color: '#7D1025',
                    fontSize: 10, fontWeight: 800,
                    padding: '2px 7px', borderRadius: 99,
                  }}>{unread} unread</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel tabs */}
      <div style={{
        display: 'flex',
        background: '#FBFAF5',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rmd)',
        padding: 4, marginBottom: 18, gap: 2, flexWrap: 'wrap',
      }}>
        {['parent', 'student', 'admin'].map(ch => {
          const isActive = activeChannel === ch
          const count = channelCounts[ch]
          const unread = unreadCounts[ch]
          return (
            <button key={ch} onClick={() => { setActiveChannel(ch); setActiveThreadId(null) }}
              style={{
                flex: 1, minWidth: 120,
                background: isActive ? channelColors[ch] : 'transparent',
                color: isActive ? '#FBFAF5' : 'var(--s500)',
                border: 'none', padding: '10px 14px',
                borderRadius: 'var(--rsm)', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: isActive ? '0 4px 16px rgba(125,16,37,.15)' : 'none',
              }}>
              {channelLabels[ch]}
              <span style={{
                background: isActive ? 'rgba(251,250,245,.25)' : 'var(--bg)',
                color: isActive ? '#FBFAF5' : 'var(--s500)',
                fontSize: 11, fontWeight: 700,
                padding: '2px 7px', borderRadius: 99,
              }}>{count}</span>
              {unread > 0 && (
                <span style={{
                  background: '#FCA5A5', color: '#7D1025',
                  fontSize: 10, fontWeight: 800,
                  padding: '1px 6px', borderRadius: 99,
                }}>{unread}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Channel info banner */}
      <div style={{
        background: activeChannel === 'student' ? '#FEF3C7' : '#FBFAF5',
        border: '1px solid ' + (activeChannel === 'student' ? '#FCD34D' : 'var(--border)'),
        borderLeft: '3px solid ' + (activeChannel === 'student' ? '#B45309' : '#C9A030'),
        padding: '10px 14px', borderRadius: 'var(--rsm)',
        fontSize: 12.5, color: 'var(--s700)', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={activeChannel === 'student' ? '#B45309' : '#C9A030'} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <div>
          <strong>{activeChannel === 'student' ? 'Child Safety: ' : 'Note: '}</strong>
          {channelDescriptions[activeChannel]}
        </div>
      </div>

      {/* Two-column: thread list + active conversation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: 14 }}>
        {/* Thread list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start', maxHeight: 700, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: '#FBFAF5' }}>
            <input className="fi" placeholder="Search conversations..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              style={{ width: '100%', fontSize: 13 }}/>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredThreads.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--s400)', fontSize: 13 }}>
                No conversations yet
              </div>
            ) : (
              filteredThreads.map(thread => {
                const isActive = activeThreadId === thread.threadId
                return (
                  <div key={thread.threadId} onClick={() => setActiveThreadId(thread.threadId)}
                    style={{
                      padding: '14px 14px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: isActive ? '#FBE8E8' : '#FFF',
                      borderLeft: '3px solid ' + (isActive ? channelColors[thread.channel] : 'transparent'),
                    }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: cmAvatarColor(thread.otherParty), color: '#FBFAF5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                      }}>{cmInitials(thread.otherParty)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span style={{
                            fontWeight: 700, fontSize: 13.5, color: 'var(--s900)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>{thread.otherParty}</span>
                          {thread.unread > 0 && (
                            <span style={{
                              background: '#7D1025', color: '#FBFAF5',
                              fontSize: 10, fontWeight: 800,
                              padding: '1px 7px', borderRadius: 99, flexShrink: 0,
                            }}>{thread.unread}</span>
                          )}
                        </div>
                        <div style={{
                          fontSize: 11.5, color: 'var(--s500)', marginBottom: 3,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{thread.subject}</div>
                        <div style={{
                          fontSize: 11, color: 'var(--s400)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{thread.last.body}</div>
                        <div style={{ fontSize: 10, color: 'var(--s400)', marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{cmTimeAgo(thread.last.sentAt)}</span>
                          {thread.hasFlags && (
                            <span style={{
                              background: '#FEE2E2', color: '#B91C1C',
                              fontSize: 9, fontWeight: 700, letterSpacing: '.06em',
                              padding: '1px 6px', borderRadius: 99,
                            }}>FLAGGED</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Active conversation */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 500 }}>
          {!activeThread ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--s400)', padding: 40, textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Select a conversation</div>
                <div style={{ fontSize: 13 }}>Or start a new message using the button above</div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{
                padding: '14px 18px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: cmAvatarColor(activeThread.otherParty), color: '#FBFAF5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>{cmInitials(activeThread.otherParty)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>{activeThread.otherParty}</span>
                    <span style={{
                      background: channelColors[activeThread.channel] + '15',
                      color: channelColors[activeThread.channel],
                      fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em',
                      padding: '2px 7px', borderRadius: 99, textTransform: 'uppercase',
                    }}>{activeThread.otherRole}</span>
                    {activeThread.channel === 'student' && (
                      <span style={{
                        background: '#FEF3C7', color: '#B45309',
                        fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em',
                        padding: '2px 7px', borderRadius: 99,
                      }}>VISIBLE TO ADMIN</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 2 }}>{activeThread.subject}</div>
                </div>
                <button onClick={reportConversation}
                  style={{
                    background: 'transparent', border: '1px solid #FCA5A5',
                    color: '#B91C1C',
                    padding: '6px 12px', borderRadius: 'var(--rsm)',
                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  }}>Report</button>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, padding: 18, overflowY: 'auto',
                background: '#FBFAF5',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                {activeThread.messages.map(m => {
                  const isMine = m.from === teacherFullName
                  return (
                    <div key={m.id} style={{
                      display: 'flex', gap: 9, flexDirection: isMine ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: cmAvatarColor(m.from), color: '#FBFAF5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, flexShrink: 0,
                      }}>{cmInitials(m.from)}</div>
                      <div style={{
                        background: isMine ? '#7D1025' : '#FFF',
                        color: isMine ? '#FBFAF5' : 'var(--s800)',
                        border: isMine ? 'none' : '1px solid var(--border)',
                        borderRadius: isMine ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                        padding: '10px 14px',
                        maxWidth: '75%',
                        fontSize: 13.5, lineHeight: 1.6,
                      }}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                        {m.flags && m.flags.length > 0 && (
                          <div style={{
                            marginTop: 8, padding: '6px 10px',
                            background: isMine ? 'rgba(251,250,245,.15)' : '#FEE2E2',
                            color: isMine ? '#FCA5A5' : '#B91C1C',
                            borderRadius: 6, fontSize: 10.5, fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                              <line x1="12" y1="9" x2="12" y2="13"/>
                              <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            Safety flag: {m.flags.map(f => f.label).join(', ')}
                          </div>
                        )}
                        <div style={{
                          fontSize: 10, marginTop: 6, opacity: .6,
                          textAlign: isMine ? 'right' : 'left',
                        }}>{cmFormatTime(m.sentAt)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply box */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: '#FFF' }}>
                {/* Safety warning for student channel */}
                {replyFlags.length > 0 && (
                  <div style={{
                    background: '#FEE2E2', border: '1px solid #FCA5A5',
                    borderRadius: 'var(--rsm)', padding: '10px 12px',
                    marginBottom: 10, fontSize: 12, color: '#B91C1C',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontWeight: 700 }}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      Child Safety Warning
                    </div>
                    <div style={{ marginBottom: 6 }}>
                      Your message contains: <strong>{replyFlags.map(f => f.label).join(', ')}</strong>.
                      This may not be appropriate for adult-to-minor communication on this platform.
                    </div>
                    <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer', fontSize: 11.5 }}>
                      <input type="checkbox" checked={replyAcknowledged}
                        onChange={e => setReplyAcknowledged(e.target.checked)}
                        style={{ accentColor: '#B91C1C' }}/>
                      I have reviewed and confirm this message is appropriate. (Will be flagged to admin.)
                    </label>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                    rows={2} placeholder="Type your reply..."
                    style={{
                      flex: 1, padding: '10px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--rsm)',
                      fontSize: 13, fontFamily: 'inherit',
                      resize: 'vertical',
                    }}/>
                  <button onClick={sendReply}
                    disabled={!replyText.trim() || (replyFlags.length > 0 && !replyAcknowledged)}
                    style={{
                      background: replyText.trim() && (replyFlags.length === 0 || replyAcknowledged) ? '#7D1025' : 'var(--bg)',
                      color: replyText.trim() && (replyFlags.length === 0 || replyAcknowledged) ? '#FBFAF5' : 'var(--s400)',
                      border: 'none',
                      padding: '10px 16px', borderRadius: 'var(--rsm)',
                      cursor: replyText.trim() && (replyFlags.length === 0 || replyAcknowledged) ? 'pointer' : 'not-allowed',
                      fontSize: 13, fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                    Send
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div onClick={() => setShowCompose(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', zIndex: 200,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FBFAF5', borderRadius: 'var(--rxl)',
            maxWidth: 640, width: '100%', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,.3)', marginTop: 40, marginBottom: 40,
          }}>
            <div style={{
              padding: '20px 28px',
              background: 'linear-gradient(135deg, #7D1025, #8B1A2E)',
              color: '#FBFAF5',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8, marginBottom: 4, color: '#F0CC5A' }}>
                New Message
              </div>
              <h3 className="serif" style={{ fontSize: 22, margin: 0 }}>Compose</h3>
            </div>

            <div style={{ padding: '20px 28px' }}>
              {/* Channel */}
              <div className="fg">
                <label className="fl">Send to</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['parent', 'student', 'admin'].map(ch => (
                    <button key={ch} onClick={() => setComposeChannel(ch)}
                      style={{
                        flex: 1,
                        background: composeChannel === ch ? channelColors[ch] : '#FFF',
                        color: composeChannel === ch ? '#FBFAF5' : 'var(--s700)',
                        border: '1.5px solid ' + (composeChannel === ch ? channelColors[ch] : 'var(--border)'),
                        padding: '8px 12px', borderRadius: 'var(--rsm)',
                        cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                      }}>{channelLabels[ch]}</button>
                  ))}
                </div>
              </div>

              {/* Recipient */}
              <div className="fg">
                <label className="fl">Recipient *</label>
                {composeChannel === 'student' ? (
                  <select className="fsel" value={composeTo} onChange={e => setComposeTo(e.target.value)}>
                    <option value="">Select student...</option>
                    {allStudents.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                ) : composeChannel === 'parent' ? (
                  <select className="fsel" value={composeTo} onChange={e => setComposeTo(e.target.value)}>
                    <option value="">Select parent...</option>
                    {allStudents.filter(s => s.parentName).map(s => (
                      <option key={s.id} value={s.parentName}>{s.parentName} (parent of {s.name})</option>
                    ))}
                  </select>
                ) : (
                  <input className="fi" value={composeTo} onChange={e => setComposeTo(e.target.value)}
                    placeholder="School Admin"/>
                )}
              </div>

              {/* Subject */}
              <div className="fg">
                <label className="fl">Subject *</label>
                <input className="fi" value={composeSubject} onChange={e => setComposeSubject(e.target.value)}
                  placeholder="Brief subject line"/>
              </div>

              {/* Body */}
              <div className="fg">
                <label className="fl">Message *</label>
                <textarea className="fi" rows={6} value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  placeholder="Type your message..."
                  style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}/>
              </div>

              {/* Safety warning */}
              {composeFlags.length > 0 && (
                <div style={{
                  background: '#FEE2E2', border: '1px solid #FCA5A5',
                  borderRadius: 'var(--rsm)', padding: '12px 14px',
                  marginBottom: 14, fontSize: 12.5, color: '#B91C1C',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 700 }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Child Safety Warning
                  </div>
                  <div style={{ marginBottom: 8, lineHeight: 1.6 }}>
                    Your message contains: <strong>{composeFlags.map(f => f.label).join(', ')}</strong>.
                    These patterns are not typically appropriate for adult-to-minor communication on an education platform.
                  </div>
                  <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer', fontSize: 11.5 }}>
                    <input type="checkbox" checked={composeAcknowledged}
                      onChange={e => setComposeAcknowledged(e.target.checked)}
                      style={{ accentColor: '#B91C1C' }}/>
                    I have reviewed and confirm this message is appropriate. (Will be flagged to admin.)
                  </label>
                </div>
              )}

              {/* Admin visibility note for student channel */}
              {composeChannel === 'student' && composeFlags.length === 0 && (
                <div style={{
                  background: '#FEF3C7', borderLeft: '3px solid #B45309',
                  padding: '10px 12px', borderRadius: 'var(--rsm)',
                  fontSize: 12, color: '#B45309', marginBottom: 14,
                  fontStyle: 'italic',
                }}>
                  This message will be visible to school admin for child safety oversight.
                </div>
              )}
            </div>

            <div style={{
              padding: '14px 24px', borderTop: '1px solid var(--border)',
              background: '#FFF', display: 'flex', justifyContent: 'flex-end', gap: 8,
            }}>
              <button onClick={() => setShowCompose(false)} className="btn btn-s">Cancel</button>
              <button onClick={sendNewMessage}
                disabled={composeFlags.length > 0 && !composeAcknowledged}
                style={{
                  background: composeFlags.length === 0 || composeAcknowledged ? '#7D1025' : 'var(--bg)',
                  color: composeFlags.length === 0 || composeAcknowledged ? '#FBFAF5' : 'var(--s400)',
                  border: 'none',
                  padding: '10px 18px', borderRadius: 'var(--rmd)',
                  cursor: composeFlags.length === 0 || composeAcknowledged ? 'pointer' : 'not-allowed',
                  fontSize: 13, fontWeight: 700,
                }}>Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TEACHER DASHBOARD — Premium daily home screen
// ═══════════════════════════════════════════════════════════
// Theme: Smartious crimson (#7D1025) + gold (#C9A030) + cream (#FBFAF5)
//
// Architecture: A premium dashboard answers 3 questions in 3 seconds:
// 1. What's happening RIGHT NOW?
// 2. What's important TODAY?
// 3. How am I doing?

const dbGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const dbFormatTime = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
const dbFormatDate = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

const dbTimeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  if (hours < 24) return hours + 'h ago'
  if (days === 1) return 'yesterday'
  if (days < 7) return days + 'd ago'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const dbSubjColor = (subject) => {
  const map = {
    'Mathematics': '#7D1025', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
    'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
  }
  return map[subject] || '#7D1025'
}

const dbAvatarColor = (name) => {
  const colors = ['#7D1025', '#8B1A2E', '#C9A030', '#1E3A8A', '#166534', '#7C2D12']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
  return colors[Math.abs(hash) % colors.length]
}

const dbInitials = (name) => (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'

// Sample today's schedule (would come from backend in production)
const dbTodaysSchedule = () => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return [
    { id: 'c1', startMinutes: 9 * 60,    durationMins: 60, subject: 'Mathematics', topic: 'Quadratic equations',     yearGroup: 'IGCSE Year 10', students: 8 },
    { id: 'c2', startMinutes: 11 * 60,   durationMins: 60, subject: 'Mathematics', topic: 'Trigonometry',            yearGroup: 'IGCSE Year 11', students: 6 },
    { id: 'c3', startMinutes: 14 * 60,   durationMins: 45, subject: 'Mathematics', topic: 'Algebraic fractions',     yearGroup: 'IGCSE Year 10', students: 8 },
    { id: 'c4', startMinutes: 16 * 60,   durationMins: 60, subject: 'Mathematics', topic: 'Geometry · Pythagoras',   yearGroup: 'IGCSE Year 11', students: 6 },
  ].map(c => ({
    ...c,
    startAt: new Date(today.getTime() + c.startMinutes * 60000),
    endAt: new Date(today.getTime() + (c.startMinutes + c.durationMins) * 60000),
  }))
}

const dbClassStatus = (cls) => {
  const now = Date.now()
  if (now < cls.startAt.getTime()) return 'upcoming'
  if (now < cls.endAt.getTime()) return 'live'
  return 'done'
}

function TeacherDashboardTab({ user, store, setPage, toast, setMsgModal, setUploadModal }) {
  const teacherFirstName = user?.firstName || 'James'
  const teacherLastName = user?.lastName || 'Muthomi'
  const teacherFullName = ('Mr. ' + teacherFirstName + ' ' + teacherLastName).trim()

  const [now, setNow] = useState(new Date())

  // Real class count from backend (Today's Classes KPI)
  const [realClassCount, setRealClassCount] = useState(null)
  useEffect(() => {
    api.get('/grouprooms')
      .then(res => setRealClassCount(res.data?.rooms?.length || 0))
      .catch(() => setRealClassCount(0))
  }, [])

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const schedule = dbTodaysSchedule()
  const liveClass = schedule.find(c => dbClassStatus(c) === 'live')
  const nextClass = schedule.find(c => dbClassStatus(c) === 'upcoming')
  const doneClasses = schedule.filter(c => dbClassStatus(c) === 'done')

  // Read student data from My Students module
  const allStudents = (() => {
    try { return JSON.parse(localStorage.getItem('sm_teacher_students') || '[]') } catch { return [] }
  })()

  // Read homework data
  const allHomework = (() => {
    try { return JSON.parse(localStorage.getItem('sm_homework_assigned') || '[]') } catch { return [] }
  })()

  // Read exam data
  const allExams = (() => {
    try { return JSON.parse(localStorage.getItem('sm_exam_assignments') || '[]') } catch { return [] }
  })()

  // Read messages
  const allMessages = (() => {
    try { return JSON.parse(localStorage.getItem('sm_messages') || '[]') } catch { return [] }
  })()

  // Compute stats
  const atRiskStudents = allStudents.filter(s => s.status === 'at-risk' || s.status === 'needs-help')
  const ungraded = allHomework.reduce((sum, hw) => {
    const subs = (hw.submissions || []).filter(s => s.grade === null || s.grade === undefined).length
    return sum + subs
  }, 0)
  const liveExams = allExams.filter(e => {
    const start = new Date(e.startAt).getTime()
    const end = start + (e.durationMins * 60000)
    return Date.now() >= start && Date.now() < end
  }).length
  const unreadMessages = allMessages.filter(m => !m.read && m.from !== teacherFullName).length

  // Compute the "RIGHT NOW" hero card content
  const rightNowItem = (() => {
    if (liveClass) {
      return {
        type: 'live-class',
        title: 'Class is live now',
        subtitle: liveClass.subject + ' · ' + liveClass.topic + ' · ' + liveClass.yearGroup,
        action: 'Re-enter Class',
        actionPage: 'classroom',
        urgency: 'live',
      }
    }
    if (nextClass) {
      const minsUntil = Math.floor((nextClass.startAt.getTime() - Date.now()) / 60000)
      if (minsUntil <= 30) {
        return {
          type: 'upcoming-class',
          title: 'Class starts in ' + minsUntil + ' minutes',
          subtitle: nextClass.subject + ' · ' + nextClass.topic + ' · ' + dbFormatTime(nextClass.startAt),
          action: 'Prepare to Teach',
          actionPage: 'classroom',
          urgency: 'soon',
        }
      }
    }
    if (atRiskStudents.length > 0) {
      return {
        type: 'at-risk',
        title: atRiskStudents.length + ' student' + (atRiskStudents.length === 1 ? '' : 's') + ' need your attention',
        subtitle: atRiskStudents.map(s => s.name).slice(0, 3).join(', ') + (atRiskStudents.length > 3 ? ', and others' : ''),
        action: 'View Students',
        actionPage: 'students',
        urgency: 'warning',
      }
    }
    if (ungraded > 0) {
      return {
        type: 'grading',
        title: ungraded + ' submission' + (ungraded === 1 ? '' : 's') + ' need grading',
        subtitle: 'Students are waiting for feedback on their homework',
        action: 'Start Grading',
        actionPage: 'marking',
        urgency: 'normal',
      }
    }
    if (unreadMessages > 0) {
      return {
        type: 'messages',
        title: unreadMessages + ' unread message' + (unreadMessages === 1 ? '' : 's'),
        subtitle: 'Parents and students are waiting for replies',
        action: 'Open Messages',
        actionPage: 'communication',
        urgency: 'normal',
      }
    }
    return {
      type: 'all-clear',
      title: 'You are all caught up',
      subtitle: nextClass ? 'Next class: ' + nextClass.subject + ' at ' + dbFormatTime(nextClass.startAt) : 'No more classes today',
      action: nextClass ? 'View Schedule' : 'Plan Tomorrow',
      actionPage: nextClass ? 'classroom' : 'questionbank',
      urgency: 'good',
    }
  })()

  const urgencyColors = {
    live:    { bg: '#7F1D1D',     accent: '#FCA5A5', text: '#FBFAF5' },
    soon:    { bg: '#7D1025',     accent: '#F0CC5A', text: '#FBFAF5' },
    warning: { bg: '#92400E',     accent: '#FCD34D', text: '#FBFAF5' },
    normal:  { bg: '#7D1025',     accent: '#F0CC5A', text: '#FBFAF5' },
    good:    { bg: '#166534',     accent: '#86EFAC', text: '#FBFAF5' },
  }
  const uColor = urgencyColors[rightNowItem.urgency]

  return (
    <div>
      {/* ─── GREETING ROW ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
            {dbFormatDate(now)} · {dbFormatTime(now)}
          </div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 32, fontWeight: 400, color: 'var(--s900)',
            margin: 0, lineHeight: 1.15,
          }}>
            {dbGreeting()}, <em style={{ color: '#7D1025' }}>{teacherFullName}</em>
          </h1>
          <div style={{ fontSize: 13.5, color: 'var(--s500)', marginTop: 4 }}>
            Mathematics · IGCSE · Smartious E-School Nairobi
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setPage('exambuilder')}
            style={{
              background: 'transparent', color: '#7D1025',
              border: '1.5px solid #7D1025',
              padding: '10px 16px', borderRadius: 'var(--rmd)',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Exam
          </button>
          <button onClick={() => setPage('classroom')}
            style={{
              background: '#7D1025', color: '#FBFAF5', border: 'none',
              padding: '10px 18px', borderRadius: 'var(--rmd)',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 14px rgba(125,16,37,.25)',
            }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Enter Live Class
          </button>
        </div>
      </div>

      {/* ─── "RIGHT NOW" HERO CARD ─── */}
      <div style={{
        background: 'linear-gradient(135deg, ' + uColor.bg + ' 0%, ' + uColor.bg + 'EE 100%)',
        color: uColor.text,
        borderRadius: 'var(--rxl)',
        padding: '28px 32px',
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(125,16,37,.18)',
      }}>
        {/* Decorative accent */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: uColor.accent, opacity: .15,
          pointerEvents: 'none',
        }}/>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 800, letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: uColor.accent, marginBottom: 8,
            }}>
              {rightNowItem.urgency === 'live' && (
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: uColor.accent,
                  animation: 'pulse 1.5s infinite',
                }}/>
              )}
              {rightNowItem.urgency === 'live' ? 'LIVE NOW' :
               rightNowItem.urgency === 'soon' ? 'STARTING SOON' :
               rightNowItem.urgency === 'warning' ? 'NEEDS ATTENTION' :
               rightNowItem.urgency === 'good' ? 'ALL CAUGHT UP' :
               'RIGHT NOW'}
            </div>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 28, fontWeight: 400,
              margin: 0, lineHeight: 1.2,
            }}>{rightNowItem.title}</h2>
            <div style={{ fontSize: 14, opacity: .85, marginTop: 6 }}>{rightNowItem.subtitle}</div>
          </div>
          <button onClick={() => setPage(rightNowItem.actionPage)}
            style={{
              background: uColor.accent, color: uColor.bg,
              border: 'none',
              padding: '14px 28px', borderRadius: 'var(--rmd)',
              fontSize: 14, fontWeight: 800,
              cursor: 'pointer',
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

      {/* ─── KPI STRIP ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 16,
      }}>
        {[
          { label: 'My Students', value: allStudents.length, change: '+2 this term', color: '#7D1025', icon: 'students', page: 'students' },
          { label: 'Need Grading', value: ungraded, change: ungraded === 0 ? 'All caught up' : 'Awaiting your review', color: ungraded > 0 ? '#B45309' : '#15803D', icon: 'grade', page: 'marking' },
          { label: 'My Classes', value: realClassCount === null ? '...' : realClassCount, change: realClassCount === 0 ? 'No classes assigned' : 'Active rooms in backend', color: '#7D1025', icon: 'class', page: 'liveclass' },
          { label: 'Unread Messages', value: unreadMessages, change: unreadMessages === 0 ? 'Inbox clear' : 'From parents & students', color: unreadMessages > 0 ? '#7D1025' : '#15803D', icon: 'mail', page: 'communication' },
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
            <div style={{
              fontSize: 10.5, fontWeight: 700,
              letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--s500)', marginBottom: 6,
            }}>{kpi.label}</div>
            <div style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 36, fontWeight: 400, color: kpi.color,
              lineHeight: 1, marginBottom: 4,
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
              {kpi.icon === 'grade' && (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={kpi.color} strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              )}
              {kpi.icon === 'class' && (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={kpi.color} strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              )}
              {kpi.icon === 'mail' && (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={kpi.color} strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── MAIN GRID: SCHEDULE + ACTION QUEUE ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 380px)', gap: 14, marginBottom: 14 }}>
        {/* Today's Schedule */}
        <div style={{
          background: '#FFF',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--rxl)',
          padding: 22,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
                Today's Schedule
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: 'var(--s900)', margin: 0 }}>
                {schedule.length} classes
              </h3>
            </div>
            <div style={{ fontSize: 12, color: 'var(--s500)' }}>
              {doneClasses.length} done · {schedule.length - doneClasses.length} remaining
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {schedule.map(cls => {
              const status = dbClassStatus(cls)
              const subjCol = dbSubjColor(cls.subject)
              return (
                <div key={cls.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  background: status === 'live' ? '#FEE2E2' : status === 'done' ? '#FBFAF5' : '#FFF',
                  border: '1.5px solid ' + (status === 'live' ? '#FCA5A5' : 'var(--border)'),
                  borderLeft: '4px solid ' + (status === 'live' ? '#DC2626' : status === 'done' ? '#94A3B8' : subjCol),
                  borderRadius: 'var(--rmd)',
                  opacity: status === 'done' ? .65 : 1,
                  cursor: status === 'live' ? 'pointer' : 'default',
                }}
                onClick={() => { if (status === 'live') setPage('classroom') }}>
                  {/* Time */}
                  <div style={{ minWidth: 70 }}>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: status === 'done' ? 'var(--s400)' : 'var(--s900)' }}>
                      {dbFormatTime(cls.startAt)}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--s500)' }}>{cls.durationMins} min</div>
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        background: subjCol + '15', color: subjCol,
                        fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em',
                        padding: '2px 7px', borderRadius: 99, textTransform: 'uppercase',
                      }}>{cls.subject}</span>
                      <span style={{ fontSize: 11, color: 'var(--s500)' }}>{cls.yearGroup}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>{cls.topic}</div>
                    <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 2 }}>{cls.students} students</div>
                  </div>

                  {/* Status */}
                  {status === 'live' && (
                    <div style={{
                      background: '#DC2626', color: '#FBFAF5',
                      fontSize: 10, fontWeight: 800, letterSpacing: '.08em',
                      padding: '4px 10px', borderRadius: 99,
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FCA5A5', animation: 'pulse 1.5s infinite' }}/>
                      LIVE
                    </div>
                  )}
                  {status === 'done' && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#15803D', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Done
                    </span>
                  )}
                  {status === 'upcoming' && (
                    <button
                      onClick={e => { e.stopPropagation(); setPage('classroom') }}
                      style={{
                        background: '#7D1025', color: '#FBFAF5', border: 'none',
                        padding: '6px 12px', borderRadius: 'var(--rsm)',
                        cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      }}>Open</button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Queue */}
        <div style={{
          background: '#FFF',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--rxl)',
          padding: 22,
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
              Action Queue
            </div>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: 'var(--s900)', margin: 0 }}>
              Things to do
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ungraded > 0 && (
              <div onClick={() => setPage('marking')} style={{
                padding: 12, borderRadius: 'var(--rmd)', cursor: 'pointer',
                background: '#FEF3C7', borderLeft: '3px solid #B45309',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#7C2D12', marginBottom: 2 }}>Grade {ungraded} submission{ungraded === 1 ? '' : 's'}</div>
                  <div style={{ fontSize: 11, color: '#92400E' }}>Students are waiting</div>
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            )}

            {atRiskStudents.length > 0 && (
              <div onClick={() => setPage('students')} style={{
                padding: 12, borderRadius: 'var(--rmd)', cursor: 'pointer',
                background: '#FEE2E2', borderLeft: '3px solid #B91C1C',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#7F1D1D', marginBottom: 2 }}>{atRiskStudents.length} student{atRiskStudents.length === 1 ? '' : 's'} need attention</div>
                  <div style={{ fontSize: 11, color: '#991B1B' }}>{atRiskStudents.slice(0, 2).map(s => s.name).join(', ')}{atRiskStudents.length > 2 ? '...' : ''}</div>
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            )}

            {unreadMessages > 0 && (
              <div onClick={() => setPage('communication')} style={{
                padding: 12, borderRadius: 'var(--rmd)', cursor: 'pointer',
                background: '#FBE8E8', borderLeft: '3px solid #7D1025',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#7D1025', marginBottom: 2 }}>{unreadMessages} unread message{unreadMessages === 1 ? '' : 's'}</div>
                  <div style={{ fontSize: 11, color: '#8B1A2E' }}>Reply to keep relationships warm</div>
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#7D1025" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            )}

            {/* Quick actions */}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: 'var(--s400)', textTransform: 'uppercase', marginBottom: 8 }}>
                Quick Actions
              </div>
              {[
                { label: 'Browse Question Bank', page: 'questionbank', color: '#7D1025' },
                { label: 'Schedule New Exam', page: 'exambuilder', color: '#7D1025' },
                { label: 'Send Message', page: 'communication', color: '#7D1025' },
              ].map(a => (
                <div key={a.label} onClick={() => setPage(a.page)} style={{
                  padding: '8px 12px', borderRadius: 'var(--rsm)', cursor: 'pointer',
                  fontSize: 12.5, color: 'var(--s700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                  marginBottom: 2,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FBFAF5'; e.currentTarget.style.color = a.color }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--s700)' }}>
                  <span>{a.label}</span>
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── CLASS HEALTH + RECENT STUDENTS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {/* Class Health */}
        <div style={{
          background: '#FFF',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--rxl)',
          padding: 22,
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
              Class Health
            </div>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: 'var(--s900)', margin: 0 }}>
              How you're doing
            </h3>
          </div>

          {[
            { label: 'Average mastery', value: allStudents.length > 0 ? Math.round(allStudents.reduce((s, st) => s + (st.mastery || 0), 0) / allStudents.length) : 75, target: 75, suffix: '%' },
            { label: 'Attendance this week', value: 92, target: 90, suffix: '%' },
            { label: 'Homework completion', value: 87, target: 80, suffix: '%' },
            { label: 'Parent satisfaction', value: 4.8, target: 4.5, suffix: '/5' },
          ].map(metric => {
            const isAbove = metric.value >= metric.target
            const pct = metric.suffix === '/5' ? (metric.value / 5) * 100 : metric.value
            return (
              <div key={metric.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--s700)', fontWeight: 600 }}>{metric.label}</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: isAbove ? '#15803D' : '#B45309' }}>
                    {metric.value}{metric.suffix}
                  </span>
                </div>
                <div style={{ height: 6, background: '#FBFAF5', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%',
                    width: pct + '%',
                    background: isAbove ? 'linear-gradient(90deg, #166534, #15803D)' : 'linear-gradient(90deg, #B45309, #C9A030)',
                    borderRadius: 3,
                  }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Top performers + Need help */}
        <div style={{
          background: '#FFF',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--rxl)',
          padding: 22,
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
              Spotlight
            </div>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: 'var(--s900)', margin: 0 }}>
              Students this week
            </h3>
          </div>

          {/* Top performer */}
          {(() => {
            const top = [...allStudents].sort((a, b) => (b.mastery || 0) - (a.mastery || 0))[0]
            if (!top) return null
            return (
              <div onClick={() => setPage('students')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 12, marginBottom: 10,
                  background: '#FBFAF5', borderLeft: '3px solid #C9A030',
                  borderRadius: 'var(--rsm)', cursor: 'pointer',
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: dbAvatarColor(top.name), color: '#FBFAF5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>{top.initials || dbInitials(top.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--s900)' }}>{top.name}</span>
                    <span style={{
                      background: '#C9A030', color: '#7D1025',
                      fontSize: 9, fontWeight: 800, letterSpacing: '.08em',
                      padding: '1px 6px', borderRadius: 99,
                    }}>TOP</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>{top.mastery}% mastery · {top.attendance}% attendance</div>
                </div>
              </div>
            )
          })()}

          {/* At-risk students */}
          {atRiskStudents.slice(0, 3).map(s => (
            <div key={s.id} onClick={() => setPage('students')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 12, marginBottom: 6,
                borderLeft: '3px solid ' + (s.status === 'at-risk' ? '#B91C1C' : '#B45309'),
                borderRadius: 'var(--rsm)', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FBFAF5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: dbAvatarColor(s.name), color: '#FBFAF5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 12, flexShrink: 0,
              }}>{s.initials || dbInitials(s.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--s900)' }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: s.status === 'at-risk' ? '#B91C1C' : '#B45309' }}>
                  {s.status === 'at-risk' ? 'At risk' : 'Needs help'} · {s.mastery}% mastery
                </div>
              </div>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          ))}

          {atRiskStudents.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--s500)', fontStyle: 'italic', textAlign: 'center', padding: 18 }}>
              No students need attention right now
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TEACHER PROFILE — Premium self-management module
// ═══════════════════════════════════════════════════════════
// Theme: Smartious crimson (#7D1025) + gold (#C9A030) + cream (#FBFAF5)
//
// Self-contained, instant-load, localStorage-backed.
// 4 tabs: Personal / Professional / Preferences / Security

const TP_PROFILE_KEY = 'sm_teacher_profile'

const tpDefaultProfile = (firstName, lastName) => ({
  firstName: firstName || 'James',
  lastName: lastName || 'Muthomi',
  title: 'Mr.',
  email: 'james.muthomi@smartioushomeschool.com',
  phone: '+254 712 345 678',
  whatsapp: '+254 712 345 678',
  photoUrl: '',
  bio: 'Passionate Mathematics teacher with over 8 years of experience preparing students for IGCSE and A-Level examinations. Specialised in helping students who struggle with mathematical reasoning develop confidence through structured practice and visual problem-solving techniques.',
  location: 'Nairobi, Kenya',
  timezone: 'Africa/Nairobi (EAT, UTC+3)',
  languages: 'English, Kiswahili, Luo',
  // Professional
  subjects: 'Mathematics, Physics',
  curricula: 'Cambridge IGCSE, Cambridge A-Level, Kenya CBC',
  qualifications: 'B.Ed Mathematics — Kenyatta University (2015)\nPGCE Secondary Mathematics — University of London (2018)\nIGCSE Mathematics Examiner — Cambridge International (since 2020)',
  yearsTeaching: 8,
  hourlyRate: 25,
  joinedDate: '2022-03-15',
  // Preferences
  notifyEmailMessages: true,
  notifyEmailGrading: true,
  notifyEmailExams: true,
  notifySmsUrgent: false,
  notifySmsClassReminder: true,
  preferredChannel: 'email',
  workingHoursStart: '08:00',
  workingHoursEnd: '18:00',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  // Security (UI placeholders, real auth in backend)
  twoFactorEnabled: false,
})

const tpLoadProfile = (firstName, lastName) => {
  try {
    const saved = localStorage.getItem(TP_PROFILE_KEY)
    if (saved) return { ...tpDefaultProfile(firstName, lastName), ...JSON.parse(saved) }
  } catch {}
  return tpDefaultProfile(firstName, lastName)
}

const tpSaveProfile = (profile) => {
  try { localStorage.setItem(TP_PROFILE_KEY, JSON.stringify(profile)) } catch {}
}

const tpFormatJoinedDate = (iso) => {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  } catch { return iso }
}

function TeacherProfileTab({ user, store, setPage, toast }) {
  const fName = user?.firstName || 'James'
  const lName = user?.lastName || 'Muthomi'

  const [profile, setProfile] = useState(() => tpLoadProfile(fName, lName))
  const [tab, setTab] = useState('personal')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)

  // Password change form state
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')

  // Photo URL input
  const [photoUrlInput, setPhotoUrlInput] = useState(profile.photoUrl)

  const fileInputRef = useRef(null)

  const updateField = (field, value) => {
    setProfile(p => ({ ...p, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const toggleWorkingDay = (day) => {
    const days = profile.workingDays.includes(day)
      ? profile.workingDays.filter(d => d !== day)
      : [...profile.workingDays, day]
    updateField('workingDays', days)
  }

  const saveAll = () => {
    tpSaveProfile(profile)
    setHasUnsavedChanges(false)
    setSavedFlash(true)
    toast?.ok?.('Profile saved.')
    setTimeout(() => setSavedFlash(false), 2000)
  }

  const discardChanges = () => {
    if (!confirm('Discard all unsaved changes?')) return
    setProfile(tpLoadProfile(fName, lName))
    setHasUnsavedChanges(false)
  }

  const savePhotoUrl = () => {
    updateField('photoUrl', photoUrlInput.trim())
    setShowPhotoModal(false)
    toast?.ok?.('Photo updated. Don\'t forget to save your profile.')
  }

  const handlePhotoFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast?.error?.('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast?.error?.('Image too large. Maximum 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoUrlInput(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const changePassword = () => {
    if (!pwCurrent.trim()) { toast?.error?.('Enter your current password.'); return }
    if (pwNew.length < 8) { toast?.error?.('New password must be at least 8 characters.'); return }
    if (pwNew !== pwConfirm) { toast?.error?.('New passwords do not match.'); return }
    // In production this calls backend. For now, just simulate.
    setPwCurrent(''); setPwNew(''); setPwConfirm('')
    setShowPasswordModal(false)
    toast?.ok?.('Password changed successfully.')
  }

  const initials = (profile.firstName[0] || '?') + (profile.lastName[0] || '')

  return (
    <div>
      {/* ─── HERO ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
        borderRadius: 'var(--rxl)',
        padding: 0, marginBottom: 18, overflow: 'hidden',
        color: '#FBFAF5',
        boxShadow: '0 12px 32px rgba(125,16,37,.18)',
      }}>
        <div style={{ padding: '32px', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Photo */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: profile.photoUrl ? 'transparent' : '#C9A030',
              border: '4px solid #F0CC5A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              fontSize: 44, fontWeight: 400,
              fontFamily: "'Instrument Serif', serif",
              color: '#7D1025',
              boxShadow: '0 8px 24px rgba(0,0,0,.25)',
            }}>
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              ) : initials.toUpperCase()}
            </div>
            <button onClick={() => { setPhotoUrlInput(profile.photoUrl); setShowPhotoModal(true) }}
              title="Change photo"
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 36, height: 36, borderRadius: '50%',
                background: '#C9A030', color: '#7D1025',
                border: '3px solid #FBFAF5',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 6, color: '#F0CC5A' }}>
              Teacher Profile
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              {profile.title} {profile.firstName} {profile.lastName}
            </h1>
            <div style={{ fontSize: 14, opacity: .9, marginTop: 6, lineHeight: 1.5 }}>
              {profile.subjects} · {profile.curricula.split(',')[0]?.trim()}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap', fontSize: 12, opacity: .85 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {profile.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Joined {tpFormatJoinedDate(profile.joinedDate)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {profile.yearsTeaching} years teaching
              </span>
            </div>
          </div>

          {/* Save state */}
          <div style={{ flexShrink: 0 }}>
            {hasUnsavedChanges ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <span style={{
                  background: '#F0CC5A', color: '#7D1025',
                  fontSize: 10.5, fontWeight: 800, letterSpacing: '.06em',
                  padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase',
                }}>Unsaved Changes</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={discardChanges}
                    style={{
                      background: 'rgba(251,250,245,.15)',
                      color: '#FBFAF5',
                      border: '1px solid rgba(251,250,245,.35)',
                      padding: '8px 14px', borderRadius: 'var(--rsm)',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}>Discard</button>
                  <button onClick={saveAll}
                    style={{
                      background: '#C9A030', color: '#7D1025', border: 'none',
                      padding: '8px 16px', borderRadius: 'var(--rsm)',
                      fontSize: 12, fontWeight: 800, cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(201,160,48,.4)',
                    }}>Save Changes</button>
                </div>
              </div>
            ) : savedFlash ? (
              <span style={{
                background: '#15803D', color: '#FBFAF5',
                fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
                padding: '6px 12px', borderRadius: 99,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Saved
              </span>
            ) : (
              <span style={{
                background: 'rgba(251,250,245,.15)', color: '#F0CC5A',
                fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em',
                padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase',
              }}>All Saved</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div style={{
        display: 'flex',
        background: '#FBFAF5',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rmd)',
        padding: 4, marginBottom: 18, gap: 2, flexWrap: 'wrap',
      }}>
        {[
          { id: 'personal',     label: 'Personal',     icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|circle:12:7:4' },
          { id: 'professional', label: 'Professional', icon: 'M20 7h-7m7 4h-7m7 4h-7|M4 4h6v6H4z|M4 14h6v6H4z' },
          { id: 'preferences',  label: 'Preferences',  icon: 'circle:12:12:3|M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4' },
          { id: 'security',     label: 'Security',     icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, minWidth: 130,
              background: tab === t.id ? '#7D1025' : 'transparent',
              color: tab === t.id ? '#FBFAF5' : 'var(--s500)',
              border: 'none', padding: '12px 16px',
              borderRadius: 'var(--rsm)', cursor: 'pointer',
              fontSize: 13, fontWeight: 700,
              boxShadow: tab === t.id ? '0 4px 16px rgba(125,16,37,.15)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── PERSONAL TAB ─── */}
      {tab === 'personal' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          {/* Identity */}
          <div className="card" style={{ padding: 22 }}>
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>Identity</div>
            <div className="fr2" style={{ marginBottom: 12 }}>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Title</label>
                <select className="fsel" value={profile.title} onChange={e => updateField('title', e.target.value)}>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Ms.</option>
                  <option>Dr.</option>
                  <option>Prof.</option>
                </select>
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">First Name</label>
                <input className="fi" value={profile.firstName} onChange={e => updateField('firstName', e.target.value)}/>
              </div>
            </div>
            <div className="fg">
              <label className="fl">Last Name</label>
              <input className="fi" value={profile.lastName} onChange={e => updateField('lastName', e.target.value)}/>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Languages spoken</label>
              <input className="fi" value={profile.languages} onChange={e => updateField('languages', e.target.value)}
                placeholder="e.g. English, Kiswahili, Luo"/>
            </div>
          </div>

          {/* Contact */}
          <div className="card" style={{ padding: 22 }}>
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>Contact</div>
            <div className="fg">
              <label className="fl">Email address</label>
              <input className="fi" type="email" value={profile.email} onChange={e => updateField('email', e.target.value)}/>
            </div>
            <div className="fg">
              <label className="fl">Phone</label>
              <input className="fi" type="tel" value={profile.phone} onChange={e => updateField('phone', e.target.value)}/>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">WhatsApp (if different)</label>
              <input className="fi" type="tel" value={profile.whatsapp} onChange={e => updateField('whatsapp', e.target.value)}/>
            </div>
          </div>

          {/* Location */}
          <div className="card" style={{ padding: 22 }}>
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>Location</div>
            <div className="fg">
              <label className="fl">City, Country</label>
              <input className="fi" value={profile.location} onChange={e => updateField('location', e.target.value)}/>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Time zone</label>
              <input className="fi" value={profile.timezone} onChange={e => updateField('timezone', e.target.value)}/>
            </div>
          </div>

          {/* Bio */}
          <div className="card" style={{ padding: 22, gridColumn: 'span 2' }}>
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>About you</div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Bio (visible to parents and admin)</label>
              <textarea className="fi" rows={5} value={profile.bio} onChange={e => updateField('bio', e.target.value)}
                placeholder="Write a short bio that helps parents and students get to know you..."
                style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}/>
              <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4 }}>
                {profile.bio.length} characters · Recommended 200-500 characters
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PROFESSIONAL TAB ─── */}
      {tab === 'professional' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          {/* Teaching subjects */}
          <div className="card" style={{ padding: 22 }}>
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>Teaching</div>
            <div className="fg">
              <label className="fl">Subjects you teach</label>
              <input className="fi" value={profile.subjects} onChange={e => updateField('subjects', e.target.value)}
                placeholder="e.g. Mathematics, Physics, Chemistry"/>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Curricula</label>
              <input className="fi" value={profile.curricula} onChange={e => updateField('curricula', e.target.value)}
                placeholder="e.g. Cambridge IGCSE, A-Level, IB, CBC"/>
            </div>
          </div>

          {/* Experience */}
          <div className="card" style={{ padding: 22 }}>
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>Experience</div>
            <div className="fr2" style={{ marginBottom: 0 }}>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Years teaching</label>
                <input className="fi" type="number" min="0" max="60" value={profile.yearsTeaching}
                  onChange={e => updateField('yearsTeaching', parseInt(e.target.value) || 0)}/>
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Hourly rate (USD)</label>
                <input className="fi" type="number" min="0" step="5" value={profile.hourlyRate}
                  onChange={e => updateField('hourlyRate', parseInt(e.target.value) || 0)}/>
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div className="card" style={{ padding: 22, gridColumn: 'span 2' }}>
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>Qualifications & Certifications</div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">List your qualifications (one per line)</label>
              <textarea className="fi" rows={6} value={profile.qualifications}
                onChange={e => updateField('qualifications', e.target.value)}
                placeholder={"e.g.\nB.Ed Mathematics — University Name (Year)\nPGCE Secondary — University Name (Year)\nIGCSE Examiner — Cambridge International (since Year)"}
                style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }}/>
            </div>
          </div>
        </div>
      )}

      {/* ─── PREFERENCES TAB ─── */}
      {tab === 'preferences' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          {/* Email notifications */}
          <div className="card" style={{ padding: 22 }}>
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>Email Notifications</div>
            {[
              { key: 'notifyEmailMessages', label: 'New messages from parents/students', desc: 'Email me when I receive a new message' },
              { key: 'notifyEmailGrading',  label: 'Homework submissions to grade',     desc: 'Email me when students submit homework' },
              { key: 'notifyEmailExams',    label: 'Exam reminders',                    desc: 'Email me 24 hours before scheduled exams start' },
            ].map(opt => (
              <label key={opt.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10,
                padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--s900)' }}>{opt.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 2 }}>{opt.desc}</div>
                </div>
                <input type="checkbox" checked={profile[opt.key]}
                  onChange={e => updateField(opt.key, e.target.checked)}
                  style={{ accentColor: '#7D1025', width: 18, height: 18, marginTop: 2 }}/>
              </label>
            ))}
          </div>

          {/* SMS notifications */}
          <div className="card" style={{ padding: 22 }}>
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>SMS Notifications</div>
            {[
              { key: 'notifySmsUrgent',         label: 'Urgent issues',           desc: 'SMS me for safety alerts and emergencies' },
              { key: 'notifySmsClassReminder',  label: 'Class start reminders',   desc: 'SMS me 15 minutes before each class' },
            ].map(opt => (
              <label key={opt.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10,
                padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--s900)' }}>{opt.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 2 }}>{opt.desc}</div>
                </div>
                <input type="checkbox" checked={profile[opt.key]}
                  onChange={e => updateField(opt.key, e.target.checked)}
                  style={{ accentColor: '#7D1025', width: 18, height: 18, marginTop: 2 }}/>
              </label>
            ))}
            <div style={{
              background: '#FBFAF5', borderLeft: '3px solid #C9A030',
              padding: '8px 12px', borderRadius: 'var(--rsm)',
              fontSize: 11.5, color: 'var(--s500)', marginTop: 12, fontStyle: 'italic',
            }}>
              SMS messages are sent to {profile.phone || 'your phone number'}. Update in Personal tab if needed.
            </div>
          </div>

          {/* Working hours */}
          <div className="card" style={{ padding: 22, gridColumn: 'span 2' }}>
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>Working Hours</div>
            <div className="fr2" style={{ marginBottom: 16 }}>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Available from</label>
                <input className="fi" type="time" value={profile.workingHoursStart}
                  onChange={e => updateField('workingHoursStart', e.target.value)}/>
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Available until</label>
                <input className="fi" type="time" value={profile.workingHoursEnd}
                  onChange={e => updateField('workingHoursEnd', e.target.value)}/>
              </div>
            </div>

            <label className="fl" style={{ marginBottom: 8 }}>Working days</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                const isActive = profile.workingDays.includes(day)
                return (
                  <button key={day} onClick={() => toggleWorkingDay(day)}
                    style={{
                      background: isActive ? '#7D1025' : '#FBFAF5',
                      color: isActive ? '#FBFAF5' : 'var(--s700)',
                      border: '1.5px solid ' + (isActive ? '#7D1025' : 'var(--border)'),
                      padding: '8px 14px', borderRadius: 'var(--rsm)',
                      cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                      minWidth: 56,
                    }}>{day}</button>
                )
              })}
            </div>
            <div style={{
              background: '#FBFAF5', borderLeft: '3px solid #C9A030',
              padding: '8px 12px', borderRadius: 'var(--rsm)',
              fontSize: 11.5, color: 'var(--s500)', marginTop: 12, fontStyle: 'italic',
            }}>
              Parents and students see your availability when scheduling. You won't receive class assignments outside these hours.
            </div>
          </div>
        </div>
      )}

      {/* ─── SECURITY TAB ─── */}
      {tab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          {/* Password */}
          <div className="card" style={{ padding: 22 }}>
            <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Password</div>
            <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 16, lineHeight: 1.6 }}>
              Choose a strong password unique to Smartious. Last changed: {tpFormatJoinedDate(profile.joinedDate)}
            </div>
            <button onClick={() => setShowPasswordModal(true)}
              style={{
                background: '#7D1025', color: '#FBFAF5', border: 'none',
                padding: '10px 20px', borderRadius: 'var(--rmd)',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>Change Password</button>
          </div>

          {/* Two-factor */}
          <div className="card" style={{ padding: 22 }}>
            <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Two-Factor Authentication</div>
            <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 16, lineHeight: 1.6 }}>
              Add an extra layer of security using your phone for verification.
            </div>
            {profile.twoFactorEnabled ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  background: '#15803D', color: '#FBFAF5',
                  fontSize: 11, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 99,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Enabled
                </span>
                <button onClick={() => updateField('twoFactorEnabled', false)}
                  style={{
                    background: 'transparent', color: '#B91C1C',
                    border: '1px solid #FCA5A5',
                    padding: '6px 14px', borderRadius: 'var(--rsm)',
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  }}>Disable</button>
              </div>
            ) : (
              <button onClick={() => { updateField('twoFactorEnabled', true); toast?.info?.('Two-factor authentication enabled. Backend integration pending.') }}
                style={{
                  background: '#7D1025', color: '#FBFAF5', border: 'none',
                  padding: '10px 20px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                }}>Enable 2FA</button>
            )}
          </div>

          {/* Active sessions */}
          <div className="card" style={{ padding: 22, gridColumn: 'span 2' }}>
            <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Active Sessions</div>
            <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 14, lineHeight: 1.6 }}>
              Devices currently signed in to your Smartious account.
            </div>
            {[
              { device: 'Windows · Chrome', location: profile.location, lastActive: 'Active now', isCurrent: true },
              { device: 'Android · Chrome', location: 'Nairobi, Kenya', lastActive: '2 days ago', isCurrent: false },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: '#FBFAF5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#7D1025" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--s900)' }}>{s.device}</span>
                    {s.isCurrent && (
                      <span style={{
                        background: '#15803D', color: '#FBFAF5',
                        fontSize: 9, fontWeight: 800, letterSpacing: '.06em',
                        padding: '2px 7px', borderRadius: 99,
                      }}>THIS DEVICE</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 2 }}>{s.location} · {s.lastActive}</div>
                </div>
                {!s.isCurrent && (
                  <button onClick={() => toast?.info?.('Session revoked.')}
                    style={{
                      background: 'transparent', color: '#B91C1C',
                      border: '1px solid #FCA5A5',
                      padding: '6px 12px', borderRadius: 'var(--rsm)',
                      cursor: 'pointer', fontSize: 11.5, fontWeight: 700,
                    }}>Sign Out</button>
                )}
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div className="card" style={{ padding: 22, gridColumn: 'span 2', borderColor: '#FCA5A5' }}>
            <div className="ctitle" style={{ marginBottom: 12, color: '#B91C1C' }}>Danger Zone</div>
            <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 14, lineHeight: 1.6 }}>
              These actions are permanent and cannot be undone.
            </div>
            <button onClick={() => toast?.info?.('Account deletion requires admin approval. Contact your school admin.')}
              style={{
                background: 'transparent', color: '#B91C1C',
                border: '1.5px solid #FCA5A5',
                padding: '10px 20px', borderRadius: 'var(--rmd)',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>Delete My Account</button>
          </div>
        </div>
      )}

      {/* ─── PASSWORD CHANGE MODAL ─── */}
      {showPasswordModal && (
        <div onClick={() => setShowPasswordModal(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFF', borderRadius: 'var(--rxl)',
            maxWidth: 440, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,.3)', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 28px',
              background: 'linear-gradient(135deg, #7D1025, #8B1A2E)',
              color: '#FBFAF5',
            }}>
              <h3 className="serif" style={{ fontSize: 22, margin: 0 }}>Change Password</h3>
              <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>Choose a strong password (min 8 characters)</div>
            </div>
            <div style={{ padding: '24px 28px' }}>
              <div className="fg">
                <label className="fl">Current password</label>
                <input className="fi" type="password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)}/>
              </div>
              <div className="fg">
                <label className="fl">New password</label>
                <input className="fi" type="password" value={pwNew} onChange={e => setPwNew(e.target.value)}/>
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Confirm new password</label>
                <input className="fi" type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}/>
              </div>
            </div>
            <div style={{
              padding: '14px 24px', borderTop: '1px solid var(--border)',
              background: '#FBFAF5', display: 'flex', justifyContent: 'flex-end', gap: 8,
            }}>
              <button onClick={() => setShowPasswordModal(false)} className="btn btn-s">Cancel</button>
              <button onClick={changePassword}
                style={{
                  background: '#7D1025', color: '#FBFAF5', border: 'none',
                  padding: '10px 18px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                }}>Update Password</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PHOTO UPLOAD MODAL ─── */}
      {showPhotoModal && (
        <div onClick={() => setShowPhotoModal(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFF', borderRadius: 'var(--rxl)',
            maxWidth: 480, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,.3)', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 28px',
              background: 'linear-gradient(135deg, #7D1025, #8B1A2E)',
              color: '#FBFAF5',
            }}>
              <h3 className="serif" style={{ fontSize: 22, margin: 0 }}>Update Profile Photo</h3>
              <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>Upload a clear photo of yourself</div>
            </div>
            <div style={{ padding: '24px 28px' }}>
              {/* Preview */}
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%',
                  margin: '0 auto',
                  background: photoUrlInput ? 'transparent' : '#C9A030',
                  border: '3px solid #F0CC5A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  fontSize: 40, fontWeight: 400,
                  fontFamily: "'Instrument Serif', serif",
                  color: '#7D1025',
                }}>
                  {photoUrlInput ? (
                    <img src={photoUrlInput} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  ) : initials.toUpperCase()}
                </div>
              </div>

              {/* Upload from device */}
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }}
                onChange={e => handlePhotoFile(e.target.files?.[0])}/>
              <button onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', background: '#7D1025', color: '#FBFAF5', border: 'none',
                  padding: '12px 18px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 13.5, fontWeight: 700, marginBottom: 12,
                }}>Upload from Device</button>

              {/* Or paste URL */}
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Or paste an image URL</label>
                <input className="fi" type="url" value={photoUrlInput}
                  onChange={e => setPhotoUrlInput(e.target.value)}
                  placeholder="https://..."/>
              </div>

              {photoUrlInput && (
                <button onClick={() => setPhotoUrlInput('')}
                  style={{
                    background: 'transparent', color: '#B91C1C',
                    border: 'none', padding: '6px 0',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600, marginTop: 8,
                  }}>Remove photo</button>
              )}
            </div>
            <div style={{
              padding: '14px 24px', borderTop: '1px solid var(--border)',
              background: '#FBFAF5', display: 'flex', justifyContent: 'flex-end', gap: 8,
            }}>
              <button onClick={() => setShowPhotoModal(false)} className="btn btn-s">Cancel</button>
              <button onClick={savePhotoUrl}
                style={{
                  background: '#C9A030', color: '#7D1025', border: 'none',
                  padding: '10px 18px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                }}>Use This Photo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TEACHER LIVE STUDIO — Flexible teaching experience
// ═══════════════════════════════════════════════════════════
// Theme: Smartious crimson (#7D1025) + gold (#C9A030) + cream (#FBFAF5)
//
// PHILOSOPHY:
// - Camera and mic are OPTIONAL. Teacher can join without them.
// - Pre-flight check tries devices but never blocks joining.
// - If camera works -> use it. If not -> show initials avatar.
// - Three layout modes: Whiteboard / Mixed / Gallery
// - All teaching tools work even without camera/mic.

function TeacherLiveClassesTab({ user, toast }) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Zoom modal state
  const [zoomModal, setZoomModal] = useState(null)  // { roomId, roomName } or null
  const [zoomInput, setZoomInput] = useState('')
  const [saving, setSaving] = useState(false)

  // Load rooms on mount + auto-refresh every 30s for live status
  useEffect(() => {
    let cancelled = false
    const loadRooms = async () => {
      try {
        const { data } = await api.get('/grouprooms')
        if (!cancelled && data.success) {
          setRooms(data.rooms || [])
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || 'Failed to load rooms')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadRooms()
    const id = setInterval(loadRooms, 30000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const refresh = async () => {
    try {
      const { data } = await api.get('/grouprooms')
      if (data.success) setRooms(data.rooms || [])
    } catch (e) { /* silent */ }
  }

  // Filter rooms by teacher (if user._id matches room.teacher)
  // Note: room.teacher is populated as a Teacher document with its own user link.
  // For now, show all rooms. Backend can filter later when teacher accounts have proper role linking.
  const myRooms = rooms

  const liveCount = myRooms.filter(r => r.zoomLink && r.zoomStartedAt).length
  const totalStudents = myRooms.reduce((sum, r) => sum + (r.students?.length || 0), 0)

  const openZoomModal = (room) => {
    setZoomInput(room.zoomLink || '')
    setZoomModal({ roomId: room._id, roomName: room.name })
  }

  const closeZoomModal = () => {
    setZoomModal(null)
    setZoomInput('')
  }

  const saveZoomLink = async () => {
    const trimmed = zoomInput.trim()
    if (!trimmed) {
      toast?.error?.('Please paste a Zoom link.')
      return
    }
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      toast?.error?.('Zoom link must start with https://')
      return
    }

    setSaving(true)
    try {
      const { data } = await api.patch('/grouprooms/' + zoomModal.roomId + '/zoom', {
        zoomLink: trimmed
      })
      if (data.success) {
        toast?.ok?.('Class started! Opening Zoom...')
        window.open(trimmed, '_blank', 'noopener,noreferrer')
        closeZoomModal()
        await refresh()
      } else {
        toast?.error?.(data.message || 'Failed to save')
      }
    } catch (e) {
      toast?.error?.(e.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const endClass = async (roomId, roomName) => {
    if (!confirm('End the live class for "' + roomName + '"? Students will no longer be able to join via the saved Zoom link.')) {
      return
    }
    try {
      const { data } = await api.patch('/grouprooms/' + roomId + '/zoom', { action: 'end' })
      if (data.success) {
        toast?.ok?.('Class ended.')
        await refresh()
      }
    } catch (e) {
      toast?.error?.(e.response?.data?.message || 'Failed to end class')
    }
  }

  const openZoom = (link) => {
    window.open(link, '_blank', 'noopener,noreferrer')
    toast?.ok?.('Opening Zoom...')
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--s500)' }}>Loading classes...</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="sec-tag">Scheduled Sessions</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Live <em style={{ color: 'var(--b700)' }}>Lessons</em></h2>
          <p style={{ fontSize: 13, color: 'var(--s500)', marginTop: 4 }}>Start a class to send the Zoom link to students. They join via their portal.</p>
        </div>
        <button className="btn btn-s btn-sm" onClick={refresh}>Refresh</button>
      </div>

      {/* KPIs */}
      <div className="kpi-row" style={{ marginBottom: 20 }}>
        <div className="kpi"><div className="kpi-v">{myRooms.length}</div><div className="kpi-l">My Classes</div></div>
        <div className="kpi"><div className="kpi-v">{totalStudents}</div><div className="kpi-l">Total Students</div></div>
        <div className="kpi"><div className="kpi-v" style={{ color: liveCount > 0 ? 'var(--r500)' : undefined }}>{liveCount}</div><div className="kpi-l">Live Now</div></div>
      </div>

      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B',
          padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14,
        }}>
          {error}
        </div>
      )}

      {myRooms.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s600)' }}>No classes yet</div>
          <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 6 }}>Admin will create classes and assign you as teacher. Synced rooms appear here.</div>
        </div>
      ) : (
        <div>
          {myRooms.map(room => {
            const isLive = !!(room.zoomLink && room.zoomStartedAt)
            const enrolled = room.students?.length || 0
            return (
              <div key={room._id} className="card" style={{
                display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12,
                borderLeft: isLive ? '3px solid var(--r500)' : '3px solid transparent',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{room.name}</div>
                    {isLive && (
                      <span style={{
                        background: '#DC2626', color: '#FFF',
                        fontSize: 9, fontWeight: 800, padding: '2px 8px',
                        borderRadius: 99, letterSpacing: '.08em',
                      }}>● LIVE</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--s500)' }}>
                    {room.subject} · {room.curriculum || 'IGCSE'} {room.grade ? '· ' + room.grade : ''} · {enrolled}/{room.capacity || 10} students
                  </div>
                  {room.schedule && (
                    <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 2 }}>
                      {room.schedule}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {isLive ? (
                    <>
                      <button className="btn btn-p btn-sm" onClick={() => openZoom(room.zoomLink)}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polygon points="23 7 16 12 23 17 23 7"/>
                          <rect x="1" y="5" width="15" height="14" rx="2"/>
                        </svg>
                        Open Zoom
                      </button>
                      <button className="btn btn-d btn-sm" onClick={() => endClass(room._id, room.name)}>
                        End Class
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-ok btn-sm" onClick={() => openZoomModal(room)}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                      Start Class
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Zoom Link Modal */}
      {zoomModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={closeZoomModal}>
          <div style={{
            background: '#FFF', borderRadius: 16, padding: 0,
            maxWidth: 520, width: '100%', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '20px 28px',
              background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
              color: '#FBFAF5',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, color: '#F0CC5A' }}>
                Start Live Class
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, marginTop: 4 }}>
                {zoomModal.roomName}
              </div>
            </div>

            <div style={{ padding: '24px 28px' }}>
              <div style={{ fontSize: 13.5, color: 'var(--s600)', marginBottom: 16, lineHeight: 1.6 }}>
                Paste your Zoom meeting link below. Once saved, your students will be able to join via their portal.
              </div>

              <div className="fg">
                <label className="fl">Zoom Meeting Link</label>
                <input
                  className="fi"
                  value={zoomInput}
                  onChange={e => setZoomInput(e.target.value)}
                  placeholder="https://zoom.us/j/1234567890?pwd=..."
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') saveZoomLink() }}
                />
                <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 6 }}>
                  Tip: open Zoom desktop app, click "New Meeting", then "Copy Invite Link" and paste it here.
                </div>
              </div>

              <div style={{
                background: '#FBF6E3', borderLeft: '3px solid #C9A030',
                padding: '10px 14px', borderRadius: 6,
                fontSize: 12, color: 'var(--s700)', lineHeight: 1.6, marginTop: 12,
              }}>
                <strong>Note:</strong> After saving, Zoom will open in a new tab. Students see your class as "Live" within 30 seconds and can click "Join Now" to open the same Zoom meeting.
              </div>
            </div>

            <div style={{
              padding: '16px 28px', borderTop: '1px solid var(--border)',
              background: '#FBFAF5',
              display: 'flex', justifyContent: 'flex-end', gap: 10,
            }}>
              <button className="btn btn-s" onClick={closeZoomModal} disabled={saving}>Cancel</button>
              <button
                className="btn btn-p"
                onClick={saveZoomLink}
                disabled={saving || !zoomInput.trim()}
                style={{ opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving...' : 'Save & Open Zoom'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TeacherLiveStudio({ user, onLeave, toast }) {
  const teacherFirstName = user?.firstName || 'James'
  const teacherLastName = user?.lastName || 'Muthomi'
  const teacherFullName = ('Mr. ' + teacherFirstName + ' ' + teacherLastName).trim()
  const teacherInitials = (teacherFirstName[0] || 'T') + (teacherLastName[0] || '')

  // ── STATE ──────────────────────────────────────────
  const [phase, setPhase] = useState('preflight')   // 'preflight' | 'live'
  const [layoutMode, setLayoutMode] = useState('whiteboard')
  const [tool, setTool] = useState('pen')
  const [penColor, setPenColor] = useState('#7D1025')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [audioLevel, setAudioLevel] = useState(0)
  const [hasCamera, setHasCamera] = useState(false)
  const [hasMic, setHasMic] = useState(false)
  const [deviceMessage, setDeviceMessage] = useState('')   // friendly status, not blocking
  const [classDuration, setClassDuration] = useState(0)
  const [classStartedAt, setClassStartedAt] = useState(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [tryingMedia, setTryingMedia] = useState(true)

  // ── REFS ───────────────────────────────────────────
  const localVideoRef = useRef(null)
  const previewVideoRef = useRef(null)
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const streamRef = useRef(null)
  const audioContextRef = useRef(null)
  const audioAnalyserRef = useRef(null)
  const audioLevelRafRef = useRef(null)
  const drawingHistoryRef = useRef([])
  // Performance refs:
  const canvasSnapshotRef = useRef(null)        // ImageBitmap of all completed strokes
  const currentStrokeRef = useRef(null)         // The stroke currently being drawn
  const pendingPointRef = useRef(null)          // Latest pointer position queued for next frame
  const drawRafRef = useRef(null)               // requestAnimationFrame handle
  const ctxRef = useRef(null)                   // Cached 2d context

  const COLOR_PALETTE = [
    { hex: '#7D1025', label: 'Crimson' },
    { hex: '#1E3A8A', label: 'Navy' },
    { hex: '#166534', label: 'Green' },
    { hex: '#C9A030', label: 'Gold' },
    { hex: '#0F172A', label: 'Black' },
    { hex: '#DC2626', label: 'Red' },
  ]

  // ── TRY MEDIA (non-blocking) ──────────────────────
  const tryStartMedia = async () => {
    setTryingMedia(true)
    setDeviceMessage('')
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }

      // Try video + audio first, then fall back gracefully
      let stream = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        })
        setHasCamera(true)
        setHasMic(true)
      } catch (err1) {
        // Try audio only
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: { echoCancellation: true, noiseSuppression: true },
          })
          setHasCamera(false)
          setHasMic(true)
          setDeviceMessage('Audio only — camera not available')
        } catch (err2) {
          // Try video only
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 640 }, height: { ideal: 480 } },
              audio: false,
            })
            setHasCamera(true)
            setHasMic(false)
            setDeviceMessage('Video only — microphone not available')
          } catch (err3) {
            // Nothing works — that's okay, we'll join without media
            setHasCamera(false)
            setHasMic(false)
            const reason = err3.name === 'NotAllowedError' ? 'Permission denied'
              : err3.name === 'NotFoundError' ? 'No devices found'
              : err3.name === 'NotReadableError' ? 'Devices in use by another app'
              : 'Devices not available'
            setDeviceMessage(reason + ' — you can still join the class')
          }
        }
      }

      if (stream) {
        streamRef.current = stream
        if (previewVideoRef.current) previewVideoRef.current.srcObject = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        // Audio level meter
        if (stream.getAudioTracks().length > 0) {
          try {
            const AC = window.AudioContext || window.webkitAudioContext
            if (audioContextRef.current) audioContextRef.current.close().catch(() => {})
            audioContextRef.current = new AC()
            const source = audioContextRef.current.createMediaStreamSource(stream)
            const analyser = audioContextRef.current.createAnalyser()
            analyser.fftSize = 256
            source.connect(analyser)
            audioAnalyserRef.current = analyser
            const dataArray = new Uint8Array(analyser.frequencyBinCount)
            const updateLevel = () => {
              if (!audioAnalyserRef.current) return
              analyser.getByteFrequencyData(dataArray)
              const avg = dataArray.reduce((s, v) => s + v, 0) / dataArray.length
              setAudioLevel(avg)
              audioLevelRafRef.current = requestAnimationFrame(updateLevel)
            }
            updateLevel()
          } catch (e) { /* non-critical */ }
        }
      }
    } catch (err) {
      setHasCamera(false)
      setHasMic(false)
      setDeviceMessage('Could not access devices — you can still join')
    } finally {
      setTryingMedia(false)
    }
  }

  // ── INIT on mount ─────────────────────────────────
  useEffect(() => {
    tryStartMedia()
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {})
      if (audioLevelRafRef.current) cancelAnimationFrame(audioLevelRafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── MIC TOGGLE ────────────────────────────────────
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = micEnabled })
    }
  }, [micEnabled])

  // ── CAMERA TOGGLE (now allowed) ───────────────────
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = cameraEnabled })
    }
  }, [cameraEnabled])

  // ── JOIN ──────────────────────────────────────────
  const joinClass = () => {
    setPhase('live')
    setClassStartedAt(Date.now())
    try {
      localStorage.setItem('sm_live_class_active', JSON.stringify({
        teacher: teacherFullName,
        startedAt: new Date().toISOString(),
      }))
    } catch {}
    setTimeout(() => {
      if (localVideoRef.current && streamRef.current) {
        localVideoRef.current.srcObject = streamRef.current
      }
    }, 100)
  }

  // ── DURATION ──────────────────────────────────────
  useEffect(() => {
    if (phase !== 'live' || !classStartedAt) return
    const interval = setInterval(() => {
      setClassDuration(Math.floor((Date.now() - classStartedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, classStartedAt])

  // ── KEYBOARD ──────────────────────────────────────
  useEffect(() => {
    if (phase !== 'live') return
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'p' || e.key === 'P') setTool('pen')
      else if (e.key === 'e' || e.key === 'E') setTool('eraser')
      else if (e.key === '1') setPenColor(COLOR_PALETTE[0].hex)
      else if (e.key === '2') setPenColor(COLOR_PALETTE[1].hex)
      else if (e.key === '3') setPenColor(COLOR_PALETTE[2].hex)
      else if (e.key === '4') setPenColor(COLOR_PALETTE[3].hex)
      else if (e.key === 'f' || e.key === 'F') setLayoutMode('whiteboard')
      else if (e.key === 'g' || e.key === 'G') setLayoutMode('gallery')
      else if (e.key === 'm' || e.key === 'M') setMicEnabled(m => !m)
      else if (e.key === 'v' || e.key === 'V') setCameraEnabled(c => !c)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ── CANVAS ────────────────────────────────────────
  // Performance architecture:
  // - During a stroke: draw to canvas via requestAnimationFrame (60fps cap, no lag)
  // - On stroke end: commit to history + cache canvas as ImageBitmap snapshot
  // - On resize: just paint the snapshot once (no replay of every stroke)

  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const targetW = Math.floor(rect.width * dpr)
    const targetH = Math.floor(rect.height * dpr)
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW
      canvas.height = targetH
    }
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctxRef.current = ctx
    return ctx
  }

  const repaintFromSnapshot = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    if (canvasSnapshotRef.current) {
      try {
        ctx.drawImage(canvasSnapshotRef.current, 0, 0, rect.width, rect.height)
      } catch (e) { /* snapshot may be invalid after resize, ignore */ }
    }
  }

  // Build snapshot from history (used on first load + after undo/clear)
  const rebuildSnapshot = async () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    drawingHistoryRef.current.forEach(stroke => {
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.beginPath()
      stroke.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y)
        else ctx.lineTo(pt.x, pt.y)
      })
      ctx.stroke()
    })
    // Cache snapshot for fast resize/repaint
    try {
      if (window.createImageBitmap) {
        canvasSnapshotRef.current = await createImageBitmap(canvas)
      }
    } catch (e) { /* not all browsers support, fallback fine */ }
  }

  // Set up canvas on enter live mode + resize
  useEffect(() => {
    if (phase !== 'live') return
    initCanvas()
    rebuildSnapshot()
    let resizeTimeout = null
    const handleResize = () => {
      // Debounce resize to avoid thrashing
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        initCanvas()
        rebuildSnapshot()
      }, 100)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) clearTimeout(resizeTimeout)
      if (drawRafRef.current) cancelAnimationFrame(drawRafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, layoutMode])

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    // Pointer events have clientX/Y. Touch events nest in .touches[0].
    const clientX = e.clientX !== undefined ? e.clientX : e.touches?.[0]?.clientX
    const clientY = e.clientY !== undefined ? e.clientY : e.touches?.[0]?.clientY
    if (clientX === undefined || clientY === undefined) return null
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const drawFrame = () => {
    drawRafRef.current = null
    if (!drawingRef.current) return
    const ctx = ctxRef.current
    const cur = currentStrokeRef.current
    const pt = pendingPointRef.current
    if (!ctx || !cur || !pt) return
    // Draw line from last committed point to current pending point
    const lastIdx = cur.points.length - 1
    const last = cur.points[lastIdx]
    if (!last) return
    ctx.strokeStyle = cur.color
    ctx.lineWidth = cur.width
    ctx.globalCompositeOperation = cur.tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
    cur.points.push(pt)
    pendingPointRef.current = null
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const point = getCanvasPoint(e)
    if (!point) return
    const ctx = ctxRef.current || initCanvas()
    if (!ctx) return
    drawingRef.current = true
    currentStrokeRef.current = {
      tool, color: penColor,
      width: tool === 'eraser' ? strokeWidth * 4 : strokeWidth,
      points: [point],
    }
    // Capture pointer for smooth drawing even when leaving canvas briefly
    if (e.pointerId !== undefined && canvasRef.current?.setPointerCapture) {
      try { canvasRef.current.setPointerCapture(e.pointerId) } catch {}
    }
  }

  const continueDrawing = (e) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const point = getCanvasPoint(e)
    if (!point) return
    pendingPointRef.current = point
    // Schedule a draw on next animation frame if not already scheduled
    if (drawRafRef.current === null) {
      drawRafRef.current = requestAnimationFrame(drawFrame)
    }
  }

  const stopDrawing = (e) => {
    if (!drawingRef.current) return
    e?.preventDefault?.()
    drawingRef.current = false
    // Flush any pending point
    if (pendingPointRef.current && drawRafRef.current !== null) {
      cancelAnimationFrame(drawRafRef.current)
      drawRafRef.current = null
      drawFrame()
    }
    // Commit stroke to history
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      drawingHistoryRef.current.push(currentStrokeRef.current)
      // Update snapshot to include this stroke
      const canvas = canvasRef.current
      if (canvas && window.createImageBitmap) {
        createImageBitmap(canvas).then(bmp => {
          canvasSnapshotRef.current = bmp
        }).catch(() => {})
      }
    }
    currentStrokeRef.current = null
    pendingPointRef.current = null
    // Release pointer capture
    if (e?.pointerId !== undefined && canvasRef.current?.releasePointerCapture) {
      try { canvasRef.current.releasePointerCapture(e.pointerId) } catch {}
    }
  }

  const clearCanvas = () => {
    if (!confirm('Clear the entire whiteboard? This cannot be undone.')) return
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    drawingHistoryRef.current = []
    canvasSnapshotRef.current = null
  }

  const undoLast = () => {
    if (drawingHistoryRef.current.length === 0) return
    drawingHistoryRef.current.pop()
    rebuildSnapshot()
  }

  // ── LEAVE ─────────────────────────────────────────
  const confirmLeave = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {})
    try { localStorage.removeItem('sm_live_class_active') } catch {}
    if (onLeave) onLeave()
  }

  const formatDuration = (sec) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
  }

  // ═══════════════════════════════════════════════════
  // PRE-FLIGHT (now optional, always lets you join)
  // ═══════════════════════════════════════════════════
  if (phase === 'preflight') {
    return (
      <div style={{ minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{
          background: '#FFF', borderRadius: 'var(--rxl)',
          boxShadow: '0 20px 60px rgba(125,16,37,.15)',
          maxWidth: 900, width: '100%', overflow: 'hidden',
        }}>
          <div style={{
            padding: '24px 32px',
            background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
            color: '#FBFAF5',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 4, color: '#F0CC5A' }}>
              Live Class · Pre-flight
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0 }}>
              Ready to teach?
            </h1>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              Camera and microphone are optional. You can join the class either way.
            </div>
          </div>

          <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Camera preview */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#7D1025', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                Camera
                {hasCamera && <span style={{ background: '#15803D', color: '#FBFAF5', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 99, letterSpacing: '.08em' }}>WORKING</span>}
                {!hasCamera && !tryingMedia && <span style={{ background: '#FBFAF5', color: 'var(--s500)', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 99, letterSpacing: '.08em', border: '1px solid var(--border)' }}>OPTIONAL</span>}
              </div>
              <div style={{
                aspectRatio: '4 / 3',
                background: '#0F172A',
                borderRadius: 'var(--rmd)',
                overflow: 'hidden',
                position: 'relative',
                border: '2px solid ' + (hasCamera ? '#15803D' : 'var(--border)'),
              }}>
                {tryingMedia ? (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#9CA3AF', fontSize: 13,
                  }}>
                    Checking devices...
                  </div>
                ) : hasCamera ? (
                  <video ref={previewVideoRef} autoPlay playsInline muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}/>
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 12,
                    color: '#9CA3AF', padding: 20, textAlign: 'center',
                  }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: '#C9A030',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#7D1025',
                      fontSize: 30, fontWeight: 400,
                      fontFamily: "'Instrument Serif', serif",
                    }}>{teacherInitials.toUpperCase()}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, maxWidth: 240 }}>
                      No camera detected. Students will see your initials avatar.
                    </div>
                  </div>
                )}
              </div>
              {!hasCamera && !tryingMedia && (
                <button onClick={tryStartMedia}
                  style={{
                    background: 'transparent', border: '1px solid #7D1025',
                    color: '#7D1025', padding: '6px 14px',
                    borderRadius: 'var(--rsm)', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, marginTop: 10,
                  }}>Try again</button>
              )}
            </div>

            {/* Microphone */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#7D1025', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                Microphone
                {hasMic && <span style={{ background: '#15803D', color: '#FBFAF5', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 99, letterSpacing: '.08em' }}>WORKING</span>}
                {!hasMic && !tryingMedia && <span style={{ background: '#FBFAF5', color: 'var(--s500)', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 99, letterSpacing: '.08em', border: '1px solid var(--border)' }}>OPTIONAL</span>}
              </div>
              <div style={{
                background: '#FBFAF5',
                borderRadius: 'var(--rmd)',
                padding: 24,
                border: '2px solid ' + (hasMic ? '#15803D' : 'var(--border)'),
              }}>
                {tryingMedia ? (
                  <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>Checking microphone...</div>
                ) : hasMic ? (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 12 }}>
                      Speak normally. The bar should react to your voice.
                    </div>
                    <div style={{ height: 12, background: '#FFF', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <div style={{
                        height: '100%',
                        width: Math.min(100, (audioLevel / 80) * 100) + '%',
                        background: audioLevel > 30 ? 'linear-gradient(90deg, #15803D, #C9A030)' : '#15803D',
                        transition: 'width .05s linear',
                      }}/>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--s400)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                      <span>Quiet</span><span>Normal</span><span>Loud</span>
                    </div>
                    {audioLevel > 5 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: '#15803D', fontSize: 12, fontWeight: 700 }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Mic working
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--s500)', textAlign: 'center', padding: '8px 0', lineHeight: 1.6 }}>
                    No microphone detected.<br/>You can teach using just the whiteboard and chat.
                  </div>
                )}
              </div>

              {deviceMessage && (
                <div style={{
                  background: '#FEF3C7', borderLeft: '3px solid #B45309',
                  padding: '10px 14px', borderRadius: 'var(--rsm)',
                  fontSize: 12, color: '#B45309', marginTop: 12, lineHeight: 1.6,
                }}>{deviceMessage}</div>
              )}
            </div>
          </div>

          {/* Info banner */}
          <div style={{ padding: '0 32px 16px' }}>
            <div style={{
              background: '#FBFAF5', borderLeft: '3px solid #C9A030',
              padding: '10px 14px', borderRadius: 'var(--rsm)',
              fontSize: 12, color: 'var(--s600)', lineHeight: 1.6,
            }}>
              <strong>Tip:</strong> The whiteboard works without camera or mic. You can join now and fix devices later from the toolbar inside the class.
            </div>
          </div>

          {/* Footer actions */}
          <div style={{
            padding: '20px 32px',
            background: '#FBFAF5',
            borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap',
          }}>
            <button onClick={() => onLeave && onLeave()}
              style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--s700)',
                padding: '10px 20px', borderRadius: 'var(--rmd)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Cancel</button>

            <button onClick={joinClass}
              style={{
                background: '#C9A030',
                color: '#7D1025',
                border: 'none',
                padding: '12px 28px', borderRadius: 'var(--rmd)',
                fontSize: 14, fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(201,160,48,.35)',
              }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              {hasCamera && hasMic ? 'Join with Camera & Mic'
                : hasCamera ? 'Join with Camera'
                : hasMic ? 'Join with Mic'
                : 'Join Class'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════
  // LIVE STUDIO
  // ═══════════════════════════════════════════════════
  const isWhiteboardMode = layoutMode === 'whiteboard'
  const isGalleryMode = layoutMode === 'gallery'
  const isMixedMode = layoutMode === 'mixed'

  // Avatar fallback when no camera
  const TeacherAvatar = ({ size = 80 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#C9A030',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#7D1025',
      fontSize: size * 0.4,
      fontWeight: 400,
      fontFamily: "'Instrument Serif', serif",
      border: '3px solid #F0CC5A',
    }}>{teacherInitials.toUpperCase()}</div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0F172A', zIndex: 100,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* TOP BAR */}
      <div style={{
        background: '#1F2937', color: '#FBFAF5',
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        borderBottom: '1px solid #374151', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#DC2626',
            boxShadow: '0 0 8px rgba(220,38,38,.6)',
            animation: 'pulse 1.5s infinite',
          }}/>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: '#FCA5A5' }}>LIVE</span>
        </div>
        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#F0CC5A', minWidth: 70 }}>
          {formatDuration(classDuration)}
        </span>
        <div style={{ width: 1, height: 20, background: '#374151' }}/>
        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: 11, opacity: .7 }}>Live Class</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{teacherFullName}</div>
        </div>

        {/* Layout switcher */}
        <div style={{ display: 'flex', background: '#0F172A', borderRadius: 'var(--rsm)', padding: 3, gap: 2 }}>
          {[
            { id: 'whiteboard', label: 'Whiteboard' },
            { id: 'mixed',      label: 'Mixed' },
            { id: 'gallery',    label: 'Gallery' },
          ].map(m => (
            <button key={m.id} onClick={() => setLayoutMode(m.id)}
              style={{
                background: layoutMode === m.id ? '#C9A030' : 'transparent',
                color: layoutMode === m.id ? '#0F172A' : '#9CA3AF',
                border: 'none', padding: '6px 12px',
                borderRadius: 4, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              }}>{m.label}</button>
          ))}
        </div>

        {/* Mic toggle */}
        <button onClick={() => setMicEnabled(!micEnabled)}
          disabled={!hasMic}
          title={hasMic ? (micEnabled ? 'Mute (M)' : 'Unmute (M)') : 'No microphone'}
          style={{
            background: !hasMic ? '#4B5563' : micEnabled ? '#374151' : '#DC2626',
            color: !hasMic ? '#9CA3AF' : '#FBFAF5',
            border: 'none', width: 40, height: 40, borderRadius: '50%',
            cursor: hasMic ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hasMic ? 1 : 0.6,
          }}>
          {micEnabled && hasMic ? (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
              <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>

        {/* Camera toggle */}
        <button onClick={() => setCameraEnabled(!cameraEnabled)}
          disabled={!hasCamera}
          title={hasCamera ? (cameraEnabled ? 'Turn off camera (V)' : 'Turn on camera (V)') : 'No camera'}
          style={{
            background: !hasCamera ? '#4B5563' : cameraEnabled ? '#374151' : '#DC2626',
            color: !hasCamera ? '#9CA3AF' : '#FBFAF5',
            border: 'none', width: 40, height: 40, borderRadius: '50%',
            cursor: hasCamera ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hasCamera ? 1 : 0.6,
          }}>
          {cameraEnabled && hasCamera ? (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M16 16h5v5"/><path d="M8 8H3V3"/>
              <path d="M21 12c0 4.971-4.029 9-9 9-2.65 0-5.022-1.143-6.667-2.964M3 12c0-4.971 4.029-9 9-9 2.65 0 5.022 1.143 6.667 2.964"/>
            </svg>
          )}
        </button>

        <button onClick={() => setShowLeaveConfirm(true)}
          style={{
            background: '#DC2626', color: '#FBFAF5', border: 'none',
            padding: '8px 16px', borderRadius: 'var(--rsm)',
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}>End Class</button>
      </div>

      {/* MAIN STAGE */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* WHITEBOARD MODE */}
        {isWhiteboardMode && (
          <>
            <div style={{ flex: 1, position: 'relative', background: '#FBFAF5' }}>
              <canvas ref={canvasRef}
                onPointerDown={startDrawing}
                onPointerMove={continueDrawing}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
                style={{
                  width: '100%', height: '100%',
                  cursor: tool === 'eraser' ? 'cell' : 'crosshair',
                  touchAction: 'none',
                }}/>

              {/* Floating teacher cam (or avatar fallback) */}
              <div style={{
                position: 'absolute', bottom: 24, right: 24,
                width: 200, height: 150,
                background: '#0F172A',
                borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 12px 32px rgba(0,0,0,.4)',
                border: '3px solid #C9A030',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {hasCamera && cameraEnabled ? (
                  <video ref={localVideoRef} autoPlay playsInline muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}/>
                ) : (
                  <TeacherAvatar size={80}/>
                )}
                <div style={{
                  position: 'absolute', bottom: 6, left: 6, right: 6,
                  background: 'rgba(0,0,0,.6)',
                  color: '#FBFAF5',
                  padding: '4px 8px', borderRadius: 4,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacherFirstName}</span>
                  {!micEnabled && (
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="1" y1="1" x2="23" y2="23"/>
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Tool panel */}
            <div style={{
              width: 60, background: '#1F2937',
              borderLeft: '1px solid #374151',
              padding: '12px 8px',
              display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
            }}>
              <button onClick={() => setTool('pen')} title="Pen (P)"
                style={{
                  background: tool === 'pen' ? '#C9A030' : '#374151',
                  color: tool === 'pen' ? '#0F172A' : '#FBFAF5',
                  border: 'none', width: 44, height: 44, borderRadius: 8,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
              </button>
              <button onClick={() => setTool('eraser')} title="Eraser (E)"
                style={{
                  background: tool === 'eraser' ? '#C9A030' : '#374151',
                  color: tool === 'eraser' ? '#0F172A' : '#FBFAF5',
                  border: 'none', width: 44, height: 44, borderRadius: 8,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 20H7L3 16c-1-1-1-3 0-4l8-8 10 10-2 2"/>
                  <path d="M14 7l4 4"/>
                </svg>
              </button>
              <div style={{ width: 32, height: 1, background: '#374151', margin: '4px 0' }}/>
              {COLOR_PALETTE.slice(0, 6).map((c, i) => (
                <button key={c.hex} onClick={() => { setPenColor(c.hex); setTool('pen') }}
                  title={c.label + (i < 4 ? ' (' + (i + 1) + ')' : '')}
                  style={{
                    background: c.hex,
                    border: penColor === c.hex && tool === 'pen' ? '3px solid #FBFAF5' : '2px solid #374151',
                    width: 32, height: 32, borderRadius: '50%',
                    cursor: 'pointer',
                    boxShadow: penColor === c.hex && tool === 'pen' ? '0 0 0 2px ' + c.hex : 'none',
                  }}/>
              ))}
              <div style={{ width: 32, height: 1, background: '#374151', margin: '4px 0' }}/>
              {[2, 4, 8].map(w => (
                <button key={w} onClick={() => setStrokeWidth(w)} title={'Stroke ' + w + 'px'}
                  style={{
                    background: strokeWidth === w ? '#C9A030' : 'transparent',
                    border: '2px solid ' + (strokeWidth === w ? '#C9A030' : '#374151'),
                    width: 36, height: 36, borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <span style={{
                    width: w, height: w, borderRadius: '50%',
                    background: strokeWidth === w ? '#0F172A' : '#FBFAF5',
                  }}/>
                </button>
              ))}
              <div style={{ width: 32, height: 1, background: '#374151', margin: '4px 0' }}/>
              <button onClick={undoLast} title="Undo"
                style={{
                  background: '#374151', color: '#FBFAF5', border: 'none',
                  width: 44, height: 44, borderRadius: 8, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>
                </svg>
              </button>
              <button onClick={clearCanvas} title="Clear"
                style={{
                  background: '#7F1D1D', color: '#FCA5A5', border: 'none',
                  width: 44, height: 44, borderRadius: 8, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                </svg>
              </button>
            </div>
          </>
        )}

        {/* MIXED MODE */}
        {isMixedMode && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 8, padding: 8 }}>
            <div style={{ position: 'relative', background: '#FBFAF5', borderRadius: 12, overflow: 'hidden' }}>
              <canvas ref={canvasRef}
                onPointerDown={startDrawing}
                onPointerMove={continueDrawing}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
                style={{
                  width: '100%', height: '100%',
                  cursor: tool === 'eraser' ? 'cell' : 'crosshair',
                  touchAction: 'none',
                }}/>
              <div style={{
                position: 'absolute', top: 16, left: 16,
                background: 'rgba(31,41,55,.95)', borderRadius: 8, padding: 6,
                display: 'flex', gap: 4, boxShadow: '0 4px 12px rgba(0,0,0,.3)',
              }}>
                <button onClick={() => setTool('pen')}
                  style={{
                    background: tool === 'pen' ? '#C9A030' : 'transparent',
                    color: tool === 'pen' ? '#0F172A' : '#FBFAF5',
                    border: 'none', width: 32, height: 32, borderRadius: 4, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                  </svg>
                </button>
                <button onClick={() => setTool('eraser')}
                  style={{
                    background: tool === 'eraser' ? '#C9A030' : 'transparent',
                    color: tool === 'eraser' ? '#0F172A' : '#FBFAF5',
                    border: 'none', width: 32, height: 32, borderRadius: 4, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 20H7L3 16c-1-1-1-3 0-4l8-8 10 10-2 2"/>
                  </svg>
                </button>
                <div style={{ width: 1, background: '#374151', margin: '0 4px' }}/>
                {COLOR_PALETTE.slice(0, 4).map(c => (
                  <button key={c.hex} onClick={() => { setPenColor(c.hex); setTool('pen') }}
                    style={{
                      background: c.hex,
                      border: penColor === c.hex ? '2px solid #FBFAF5' : '1px solid transparent',
                      width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                    }}/>
                ))}
                <div style={{ width: 1, background: '#374151', margin: '0 4px' }}/>
                <button onClick={undoLast}
                  style={{
                    background: 'transparent', color: '#FBFAF5',
                    border: 'none', width: 32, height: 32, borderRadius: 4, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>
                  </svg>
                </button>
              </div>
            </div>

            <div style={{
              background: '#0F172A', borderRadius: 12, overflow: 'hidden',
              position: 'relative', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {hasCamera && cameraEnabled ? (
                  <video ref={localVideoRef} autoPlay playsInline muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}/>
                ) : (
                  <TeacherAvatar size={120}/>
                )}
              </div>
              <div style={{
                background: '#1F2937', color: '#FBFAF5',
                padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{teacherFullName}</div>
                  <div style={{ fontSize: 11, opacity: .7 }}>Teacher</div>
                </div>
                {!micEnabled && (
                  <span style={{ background: '#DC2626', color: '#FBFAF5', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>MUTED</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GALLERY MODE */}
        {isGalleryMode && (
          <div style={{
            flex: 1, padding: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gridAutoRows: '1fr', gap: 10, alignContent: 'start',
          }}>
            <div style={{
              background: '#0F172A', borderRadius: 12,
              overflow: 'hidden', position: 'relative',
              border: '2px solid #C9A030', aspectRatio: '4 / 3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {hasCamera && cameraEnabled ? (
                <video ref={localVideoRef} autoPlay playsInline muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}/>
              ) : (
                <TeacherAvatar size={100}/>
              )}
              <div style={{
                position: 'absolute', bottom: 8, left: 8, right: 8,
                background: 'rgba(0,0,0,.7)', color: '#FBFAF5',
                padding: '5px 10px', borderRadius: 6,
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>{teacherFullName}</span>
                <span style={{ background: '#C9A030', color: '#0F172A', fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 99 }}>TEACHER</span>
              </div>
            </div>

            {['Amara Osei', 'Kofi Mensah', 'Faith Wanjiru', 'Brian Otieno', 'Lydia Achieng', 'Zara Kamau'].map((name, i) => (
              <div key={i} style={{
                background: '#1F2937', borderRadius: 12,
                position: 'relative', border: '1px solid #374151', aspectRatio: '4 / 3',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: ['#7D1025', '#1E3A8A', '#166534', '#7C2D12', '#6B21A8', '#92400E'][i % 6],
                  color: '#FBFAF5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700,
                  fontFamily: "'Instrument Serif', serif",
                }}>{name.split(' ').map(w => w[0]).join('')}</div>
                <div style={{
                  position: 'absolute', bottom: 8, left: 8, right: 8,
                  background: 'rgba(0,0,0,.7)', color: '#FBFAF5',
                  padding: '5px 10px', borderRadius: 6,
                  fontSize: 11, fontWeight: 700,
                }}>{name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM HINT BAR */}
      <div style={{
        background: '#1F2937', borderTop: '1px solid #374151',
        padding: '6px 20px', color: '#9CA3AF',
        fontSize: 11, fontWeight: 600,
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
        flexShrink: 0,
      }}>
        <div>
          {isWhiteboardMode && (
            <span><kbd style={{ background: '#374151', padding: '1px 5px', borderRadius: 3, color: '#FBFAF5' }}>P</kbd> Pen · <kbd style={{ background: '#374151', padding: '1px 5px', borderRadius: 3, color: '#FBFAF5' }}>E</kbd> Eraser · <kbd style={{ background: '#374151', padding: '1px 5px', borderRadius: 3, color: '#FBFAF5' }}>1-4</kbd> Colors · <kbd style={{ background: '#374151', padding: '1px 5px', borderRadius: 3, color: '#FBFAF5' }}>M</kbd> Mic · <kbd style={{ background: '#374151', padding: '1px 5px', borderRadius: 3, color: '#FBFAF5' }}>V</kbd> Cam</span>
          )}
          {!isWhiteboardMode && (
            <span><kbd style={{ background: '#374151', padding: '1px 5px', borderRadius: 3, color: '#FBFAF5' }}>F</kbd> Whiteboard · <kbd style={{ background: '#374151', padding: '1px 5px', borderRadius: 3, color: '#FBFAF5' }}>G</kbd> Gallery · <kbd style={{ background: '#374151', padding: '1px 5px', borderRadius: 3, color: '#FBFAF5' }}>M</kbd> Mic · <kbd style={{ background: '#374151', padding: '1px 5px', borderRadius: 3, color: '#FBFAF5' }}>V</kbd> Cam</span>
          )}
        </div>
        <div>
          {hasCamera || hasMic ? <span>Devices: {hasCamera && 'Camera'}{hasCamera && hasMic && ' + '}{hasMic && 'Microphone'}</span> : <span style={{ color: '#FCD34D' }}>No camera or mic</span>}
        </div>
      </div>

      {/* Leave confirm modal */}
      {showLeaveConfirm && (
        <div onClick={() => setShowLeaveConfirm(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFF', borderRadius: 'var(--rxl)',
            padding: 32, maxWidth: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          }}>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: '#7D1025', marginBottom: 8 }}>End class?</h3>
            <p style={{ fontSize: 14, color: 'var(--s600)', lineHeight: 1.6, marginBottom: 20 }}>
              This will end the live session. Whiteboard contents will be saved.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLeaveConfirm(false)}
                style={{
                  background: 'transparent', color: 'var(--s700)',
                  border: '1px solid var(--border)',
                  padding: '10px 20px', borderRadius: 'var(--rmd)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>Continue Teaching</button>
              <button onClick={confirmLeave}
                style={{
                  background: '#DC2626', color: '#FBFAF5', border: 'none',
                  padding: '10px 20px', borderRadius: 'var(--rmd)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>End Class</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MSHAURI AI — Teaching assistant powered by Claude
// ═══════════════════════════════════════════════════════════
// Theme: Smartious crimson (#7D1025) + gold (#C9A030) + cream (#FBFAF5)
//
// PHILOSOPHY:
// - Action-oriented entry points (skills) instead of empty chat box
// - Mock mode works WITHOUT API key (for demos)
// - Real mode wires to backend POST /api/mshauri/chat (next turn)
// - Outputs flow into other modules (Question Bank, Communication, Drafts)
// - Two access modes: dedicated tab + floating button

const MA_CHATS_KEY = 'sm_mshauri_chats'
const MA_CONFIG_KEY = 'sm_mshauri_config'

const maGenerateId = () => 'chat-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)

const maLoadChats = () => {
  try { return JSON.parse(localStorage.getItem(MA_CHATS_KEY) || '[]') } catch { return [] }
}
const maSaveChats = (chats) => {
  try { localStorage.setItem(MA_CHATS_KEY, JSON.stringify(chats.slice(-50))) } catch {}
}
const maLoadConfig = () => {
  try {
    return { apiConnected: false, model: 'sonnet', dailyUsage: 0, ...JSON.parse(localStorage.getItem(MA_CONFIG_KEY) || '{}') }
  } catch { return { apiConnected: false, model: 'sonnet', dailyUsage: 0 } }
}
const maSaveConfig = (config) => {
  try { localStorage.setItem(MA_CONFIG_KEY, JSON.stringify(config)) } catch {}
}

const maTimeAgo = (iso) => {
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

// ──────────────────────────────────────────────────────
// SKILLS — structured prompt builders
// ──────────────────────────────────────────────────────

const MA_SKILLS = [
  {
    id: 'generate-questions',
    label: 'Generate Questions',
    icon: 'M9.5 2A2.5 2.5 0 0 0 7 4.5v15A2.5 2.5 0 0 0 9.5 22h11V2h-11z|M14 7h2|M14 11h2|M14 15h2',
    color: '#7D1025',
    description: 'Create exam or practice questions from any topic',
    formFields: [
      { id: 'subject', label: 'Subject', type: 'select', options: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Business Studies'], default: 'Mathematics' },
      { id: 'curriculum', label: 'Curriculum', type: 'select', options: ['IGCSE', 'Cambridge A-Level', 'Edexcel', 'IB', 'Kenya CBC', 'American'], default: 'IGCSE' },
      { id: 'year', label: 'Year / Grade', type: 'text', default: 'Year 10' },
      { id: 'topic', label: 'Topic', type: 'text', default: 'Quadratic equations', placeholder: 'e.g. Trigonometry, Photosynthesis, Algebra' },
      { id: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard', 'Mixed'], default: 'Medium' },
      { id: 'count', label: 'Number of questions', type: 'number', default: 5, min: 1, max: 20 },
      { id: 'type', label: 'Question type', type: 'select', options: ['Mixed', 'Multiple choice', 'Short answer', 'Essay', 'True/False'], default: 'Mixed' },
    ],
    saveAction: 'questionbank',
    saveLabel: 'Save to Question Bank',
  },
  {
    id: 'mark-answer',
    label: 'Mark Student Work',
    icon: 'M9 11l3 3L22 4|M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    color: '#7D1025',
    description: 'Get suggested marks and feedback for student answers',
    formFields: [
      { id: 'question', label: 'The question', type: 'textarea', placeholder: 'Paste the question or task...', rows: 3 },
      { id: 'studentAnswer', label: 'Student answer', type: 'textarea', placeholder: 'Paste student response...', rows: 6 },
      { id: 'maxMarks', label: 'Maximum marks', type: 'number', default: 10, min: 1, max: 100 },
      { id: 'level', label: 'Education level', type: 'select', options: ['IGCSE Year 9', 'IGCSE Year 10', 'IGCSE Year 11', 'A-Level', 'IB', 'CBC'], default: 'IGCSE Year 10' },
      { id: 'feedbackTone', label: 'Feedback tone', type: 'select', options: ['Encouraging', 'Direct', 'Analytical', 'Supportive'], default: 'Encouraging' },
    ],
    saveAction: 'copy',
    saveLabel: 'Copy Feedback',
  },
  {
    id: 'parent-message',
    label: 'Parent Message',
    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    color: '#7D1025',
    description: 'Draft professional messages to parents',
    formFields: [
      { id: 'studentName', label: 'Student name', type: 'student-select' },
      { id: 'topic', label: 'What is this message about?', type: 'select', options: ['Progress update (positive)', 'Concern about progress', 'Behavior concern', 'Attendance issue', 'Achievement / praise', 'Upcoming exam', 'Schedule change', 'Other (specify below)'], default: 'Progress update (positive)' },
      { id: 'specifics', label: 'Specifics', type: 'textarea', placeholder: 'Brief facts: scores, observations, dates, what you want to discuss...', rows: 4 },
      { id: 'tone', label: 'Tone', type: 'select', options: ['Warm and personal', 'Professional', 'Direct but kind', 'Celebratory'], default: 'Warm and personal' },
      { id: 'length', label: 'Length', type: 'select', options: ['Short (3-4 sentences)', 'Medium (1 paragraph)', 'Long (2-3 paragraphs)'], default: 'Medium (1 paragraph)' },
    ],
    saveAction: 'communication',
    saveLabel: 'Save as Draft',
  },
  {
    id: 'lesson-plan',
    label: 'Lesson Plan',
    icon: 'rect:3:3:18:18:2|line:9:9:15:9|line:9:13:15:13|line:9:17:15:17',
    color: '#7D1025',
    description: 'Build a complete lesson plan with timings and activities',
    formFields: [
      { id: 'subject', label: 'Subject', type: 'select', options: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography'], default: 'Mathematics' },
      { id: 'curriculum', label: 'Curriculum', type: 'select', options: ['IGCSE', 'A-Level', 'Edexcel', 'IB', 'Kenya CBC'], default: 'IGCSE' },
      { id: 'year', label: 'Year / Grade', type: 'text', default: 'Year 10' },
      { id: 'topic', label: 'Topic', type: 'text', default: 'Pythagoras Theorem', placeholder: 'e.g. Trigonometry, French Revolution' },
      { id: 'duration', label: 'Lesson duration (minutes)', type: 'number', default: 60, min: 15, max: 180 },
      { id: 'studentCount', label: 'Number of students', type: 'number', default: 8, min: 1, max: 50 },
      { id: 'objectives', label: 'Learning objectives (optional)', type: 'textarea', placeholder: 'What should students be able to do by the end?', rows: 3 },
    ],
    saveAction: 'copy',
    saveLabel: 'Copy Plan',
  },
  {
    id: 'student-insights',
    label: 'Student Insights',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|circle:8.5:7:4|line:20:8:20:14|line:23:11:17:11',
    color: '#7D1025',
    description: 'Analyze a student and suggest interventions',
    formFields: [
      { id: 'studentName', label: 'Student', type: 'student-select' },
      { id: 'concern', label: 'Specific concern (optional)', type: 'textarea', placeholder: 'e.g. Falling behind in algebra. Was excellent in Term 1.', rows: 3 },
      { id: 'lookback', label: 'How far back to consider', type: 'select', options: ['Last 2 weeks', 'Last month', 'This term', 'All time'], default: 'Last month' },
    ],
    saveAction: 'copy',
    saveLabel: 'Copy Insights',
  },
  {
    id: 'free-chat',
    label: 'Free Chat',
    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    color: '#C9A030',
    description: 'Ask anything — translation, explanation, brainstorming',
    formFields: [
      { id: 'message', label: 'Your message', type: 'textarea', placeholder: 'Ask Mshauri anything...', rows: 5 },
    ],
    saveAction: 'copy',
    saveLabel: 'Copy Response',
  },
]

// ──────────────────────────────────────────────────────
// PROMPT BUILDER — converts skill + form data to API messages
// ──────────────────────────────────────────────────────
const maBuildSystemPrompt = (teacherName, skill) => {
  return `You are Mshauri, an AI teaching assistant for Smartious Homeschool, a Kenya-based international online school. You help ${teacherName || 'a teacher'} with daily teaching tasks.

CONTEXT:
- Smartious teaches Cambridge IGCSE, A-Level, Edexcel, IB, Kenya CBC, and American curricula
- Students are aged 5-18, mostly remote learners across Kenya, UK, UAE, USA, Canada
- Brand voice: warm, professional, encouraging, culturally aware (Kenya context)
- You should be aware of local context (KCSE, CBC competencies, KSh currency, etc.) when relevant

TONE GUIDELINES:
- Concise and useful — teachers are busy
- Confident but humble (you make mistakes too)
- Constructive when giving feedback (build up, don't tear down)
- Format outputs with clear structure (markdown lists, headings)
- Avoid filler ("Certainly!", "Great question!") — get to the answer

CURRENT TASK: ${skill.label} — ${skill.description}`
}

const maBuildUserPrompt = (skill, formData) => {
  switch (skill.id) {
    case 'generate-questions':
      return `Generate ${formData.count} ${formData.difficulty.toLowerCase()} ${formData.type === 'Mixed' ? '' : formData.type.toLowerCase() + ' '}questions for ${formData.subject} at ${formData.curriculum} ${formData.year} level.

Topic: ${formData.topic}

For each question, provide:
1. The question itself (clearly numbered)
2. The answer
3. A brief mark scheme (3-5 bullet points) showing what earns marks
4. Estimated time to complete

Format as a clean list ready to be added to a question bank.`

    case 'mark-answer':
      return `Mark this student answer at ${formData.level} level.

QUESTION:
${formData.question}

STUDENT ANSWER:
${formData.studentAnswer}

MAXIMUM MARKS: ${formData.maxMarks}

Provide:
1. Suggested mark out of ${formData.maxMarks}
2. ${formData.feedbackTone.toLowerCase()} feedback (3-4 sentences)
3. What the student got right (specific observations)
4. What was missing or could be improved
5. One concrete next-step suggestion

Format clearly so the teacher can copy any section.`

    case 'parent-message':
      return `Write a ${formData.length.toLowerCase()} message to the parent of ${formData.studentName || 'this student'}.

Topic: ${formData.topic}
Specifics: ${formData.specifics || 'No additional notes provided'}
Tone: ${formData.tone}

Write the message ready to send. No subject line needed unless this is a formal email situation. End with a warm sign-off appropriate to a teacher.`

    case 'lesson-plan':
      return `Create a ${formData.duration}-minute lesson plan for ${formData.studentCount} students.

Subject: ${formData.subject}
Curriculum: ${formData.curriculum}
Year: ${formData.year}
Topic: ${formData.topic}
${formData.objectives ? 'Learning objectives: ' + formData.objectives : ''}

Structure the plan with:
1. Learning objectives (3-4)
2. Materials needed
3. Lesson timeline with timings (e.g. "0-5 min: Hook activity", "5-15 min: Direct instruction"...)
4. Differentiation suggestions for stronger and weaker students
5. Quick check for understanding (formative assessment)
6. Homework suggestion (if applicable)

Keep activities engaging and age-appropriate.`

    case 'student-insights':
      return `Analyze ${formData.studentName || 'this student'} and provide actionable insights.

Lookback period: ${formData.lookback}
${formData.concern ? 'Specific concern raised: ' + formData.concern : 'No specific concern noted'}

Provide:
1. Likely root causes (3 hypotheses, ranked by probability)
2. Concrete intervention suggestions (3-5, ordered by impact)
3. Conversation starters for the next class (2-3 questions to ask the student)
4. What to communicate to the parent (1 sentence)
5. Red flags to watch for in the next 2 weeks

Be honest. If you don't have enough data, say so and ask what to look at.`

    case 'free-chat':
      return formData.message

    default:
      return ''
  }
}

// ──────────────────────────────────────────────────────
// MOCK RESPONSES — for when API is not connected
// ──────────────────────────────────────────────────────
const maMockResponse = (skill, formData) => {
  switch (skill.id) {
    case 'generate-questions':
      return `Here are ${formData.count} ${formData.difficulty.toLowerCase()} ${formData.subject} questions on **${formData.topic}** for ${formData.curriculum} ${formData.year}:

**Question 1**
Solve the equation x² + 5x + 6 = 0 using factorization.
*Answer:* x = -2 or x = -3
*Mark scheme:* 1 mark for setting up factorization, 1 for correct factors (x+2)(x+3), 1 for both solutions
*Time:* 3 minutes

**Question 2**
Find the roots of 2x² - 7x + 3 = 0 using the quadratic formula.
*Answer:* x = 3 or x = 0.5
*Mark scheme:* 1 for correct formula recall, 1 for substitution, 1 for both roots
*Time:* 4 minutes

**Question 3**
The product of two consecutive integers is 110. Find the integers.
*Answer:* 10 and 11 (or -10 and -11)
*Mark scheme:* 1 for setting up x(x+1) = 110, 1 for solving, 1 for both pairs
*Time:* 5 minutes

*[This is a mock response. Connect your Anthropic API key to get real Mshauri intelligence.]*`

    case 'mark-answer':
      return `**Suggested mark: ${Math.floor(formData.maxMarks * 0.7)}/${formData.maxMarks}**

**Feedback (${formData.feedbackTone.toLowerCase()}):**
This is a solid attempt that shows you understand the core concept. Your working is mostly clear and you've reached a reasonable conclusion, but there are a few places where more care would have earned full marks.

**What you got right:**
- Correctly identified the problem type
- Showed clear working at each step
- Final answer is in the correct form

**What could be improved:**
- Step 3 has a sign error that propagated through to the answer
- The unit/notation in your final answer is missing
- Consider checking your answer by substituting back into the original equation

**Next step:**
Try this same problem again but pause after each step to check whether the result makes sense. A quick estimation can catch sign errors early.

*[This is a mock response. Connect your Anthropic API key to get real Mshauri intelligence.]*`

    case 'parent-message':
      return `Hello,

I wanted to reach out about ${formData.studentName || 'your child'}'s progress this term. ${formData.topic.includes('positive') ? 'They have been making excellent progress, particularly in their problem-solving abilities — I noticed how confidently they tackled this week\'s challenges.' : 'There are a few areas where some additional support at home would really help us move forward together.'}

${formData.specifics ? formData.specifics + '\n\n' : ''}I would love to discuss this in more detail. Please let me know if you have time for a brief call this week, or feel free to reply with any questions.

Warm regards,
Mr. James Muthomi
Mathematics Teacher · Smartious Homeschool

*[This is a mock response. Connect your Anthropic API key to get real Mshauri intelligence.]*`

    case 'lesson-plan':
      return `# ${formData.topic} — ${formData.duration}-minute lesson plan

**Subject:** ${formData.subject} · **Curriculum:** ${formData.curriculum} · **Year:** ${formData.year} · **Class size:** ${formData.studentCount}

## Learning objectives
By the end of this lesson, students will be able to:
1. Apply the ${formData.topic} concept to solve standard problems
2. Explain the underlying principle in their own words
3. Identify when this technique is appropriate to use

## Materials needed
- Whiteboard with stylus
- Worksheet with 8 progressive problems
- Calculator (optional)

## Timeline

**0-5 min · Hook activity**
Open with a real-world puzzle that requires the technique. Don't reveal the connection yet.

**5-20 min · Direct instruction**
Introduce the concept using the visual whiteboard. Show 2 worked examples, narrating your thinking.

**20-40 min · Guided practice**
Students work problems 1-4 individually. Roam the room. Pull aside any student who is stuck for a 1-minute reset.

**40-50 min · Independent challenge**
Problems 5-8 are graduated harder. Stronger students should reach problem 8.

**50-${formData.duration - 5} min · Group share**
Two students explain their approach to problem 5 at the whiteboard.

**${formData.duration - 5}-${formData.duration} min · Exit ticket**
"In your own words, when would you use this technique?"

## Differentiation
- **For stronger students:** Bonus problem with a twist (changes one variable)
- **For students who need support:** Pair with a peer-tutor for problems 1-4

## Homework
Worksheet problems 9-12 (similar difficulty to in-class).

*[This is a mock response. Connect your Anthropic API key to get real Mshauri intelligence.]*`

    case 'student-insights':
      return `# Insights for ${formData.studentName || 'this student'}

## Likely root causes (most to least probable)

**1. Foundation gap (most likely)**
Recent struggle with ${formData.subject || 'this subject'} often traces to a missed concept 2-3 topics back. Worth a 10-minute one-on-one diagnostic to test foundation skills before introducing new material.

**2. External factors**
Sudden drop in performance often correlates with non-academic events. Check attendance pattern and any recent home situation. A brief, kind check-in conversation often surfaces the cause.

**3. Engagement style mismatch**
Some students need more visual/concrete examples than abstract explanations. Try a different approach to the same concept and see if the lights come on.

## Recommended interventions

1. **Diagnostic conversation (5 min, this week)** — "Walk me through what you tried on the last quiz." Listen for misconceptions.
2. **Targeted practice set** — 5 problems specifically on the foundation skill, not the new topic.
3. **Buddy pairing** — Partner with a stronger peer for the next 2 sessions.
4. **Parent loop-in** — Brief, warm message to parent describing the plan, not the problem.

## Conversation starters
- "What part of this topic clicks for you?" (find the foothold)
- "If you had to teach this to a younger student, where would you start?"
- "What would help you most right now: more examples, more practice, or someone to talk it through with?"

## What to tell the parent (1 sentence)
"I've noticed [child] has hit a tricky patch with [topic] — I'm planning some focused support and would love their continued encouragement at home."

## Red flags to watch (next 2 weeks)
- Continued attendance drop
- Defensive reactions to feedback
- Withdrawal from group work
- Significant homework completion drop

*[This is a mock response. Connect your Anthropic API key to get real Mshauri intelligence.]*`

    case 'free-chat':
      return `I'm currently running in mock mode — your Anthropic API key isn't connected yet, so I can't give a real response to "${formData.message}".

Once you connect your API key (instructions in the Mshauri settings panel), I'll be able to:
- Answer any teaching question
- Translate between English, Kiswahili, French, and other languages
- Brainstorm ideas, lesson hooks, or analogies
- Explain concepts at any age level
- Help draft any kind of message or document

For now, you can still use the structured skills (Generate Questions, Mark Work, etc.) — they show realistic mock outputs so you can demo Mshauri to others.

*[Mock response — connect API for real intelligence.]*`

    default:
      return 'Mock response. Connect your API key for real intelligence.'
  }
}

// ──────────────────────────────────────────────────────
// MAIN MSHAURI TAB
// ──────────────────────────────────────────────────────
function MshauriAITab({ user, store, setPage, toast }) {
  const teacherName = (user?.firstName || 'James') + ' ' + (user?.lastName || 'Muthomi')

  const [chats, setChats] = useState(() => maLoadChats())
  const [config, setConfig] = useState(() => maLoadConfig())
  const [activeChatId, setActiveChatId] = useState(null)
  const [showSkillPicker, setShowSkillPicker] = useState(true)
  const [activeSkill, setActiveSkill] = useState(null)
  const [formData, setFormData] = useState({})
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const allStudents = (() => {
    try { return JSON.parse(localStorage.getItem('sm_teacher_students') || '[]') } catch { return [] }
  })()

  const activeChat = activeChatId ? chats.find(c => c.id === activeChatId) : null

  const startNewChat = (skill) => {
    setActiveSkill(skill)
    setShowSkillPicker(false)
    // Initialize form data with defaults
    const defaults = {}
    skill.formFields.forEach(f => {
      if (f.default !== undefined) defaults[f.id] = f.default
      else if (f.type === 'number') defaults[f.id] = 1
      else defaults[f.id] = ''
    })
    setFormData(defaults)
    setActiveChatId(null)
    setStreamedText('')
  }

  const generateResponse = async () => {
    if (!activeSkill) return

    // Validate required text fields
    for (const f of activeSkill.formFields) {
      if (f.type === 'textarea' && !formData[f.id]?.trim() && f.id !== 'objectives' && f.id !== 'concern' && f.id !== 'specifics') {
        toast?.error?.('Please fill in: ' + f.label)
        return
      }
    }

    setIsStreaming(true)
    setStreamedText('')

    const systemPrompt = maBuildSystemPrompt(teacherName, activeSkill)
    const userPrompt = maBuildUserPrompt(activeSkill, formData)

    let response = ''

    if (config.apiConnected) {
      // REAL API CALL — to be wired in next turn
      try {
        const res = await fetch('/api/mshauri/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            model: config.model === 'sonnet' ? 'claude-sonnet-4-20250514' : 'claude-haiku-4-5-20251001',
            maxTokens: 2000,
          }),
        })
        if (!res.ok) throw new Error('API request failed')
        const data = await res.json()
        response = data.content || data.message || 'No response received.'
      } catch (err) {
        toast?.error?.('Could not reach Mshauri AI. Using mock response.')
        response = maMockResponse(activeSkill, formData)
      }
    } else {
      // MOCK MODE
      response = maMockResponse(activeSkill, formData)
    }

    // Streaming animation: type out the response character by character
    const chunks = response.split(/(\s+)/)
    for (let i = 0; i < chunks.length; i++) {
      setStreamedText(t => t + chunks[i])
      // Adaptive speed: faster for whitespace, slower for words
      await new Promise(r => setTimeout(r, chunks[i].match(/^\s+$/) ? 5 : 25))
    }

    // Save to chats
    const newChat = {
      id: maGenerateId(),
      skillId: activeSkill.id,
      skillLabel: activeSkill.label,
      title: getChatTitle(activeSkill, formData),
      formData,
      response,
      createdAt: new Date().toISOString(),
    }
    const updated = [newChat, ...chats]
    setChats(updated)
    maSaveChats(updated)
    setActiveChatId(newChat.id)
    setIsStreaming(false)

    // Track usage
    const newConfig = { ...config, dailyUsage: (config.dailyUsage || 0) + 1 }
    setConfig(newConfig)
    maSaveConfig(newConfig)
  }

  const regenerate = () => {
    if (!activeChat) return
    setActiveSkill(MA_SKILLS.find(s => s.id === activeChat.skillId))
    setFormData(activeChat.formData)
    setActiveChatId(null)
    setShowSkillPicker(false)
    // After form re-loads, user can hit generate again
  }

  const copyResponse = () => {
    const text = activeChat?.response || streamedText
    if (!text) return
    navigator.clipboard?.writeText(text).then(() => {
      toast?.ok?.('Copied to clipboard')
    }).catch(() => {
      toast?.error?.('Could not copy. Select text and use Ctrl+C.')
    })
  }

  const saveToBank = () => {
    if (!activeChat) return
    if (activeChat.skillId === 'generate-questions') {
      // Parse mock/real response and save to question bank
      // For now, save raw to localStorage with marker
      try {
        const existing = JSON.parse(localStorage.getItem('sm_question_bank_drafts') || '[]')
        existing.push({
          id: 'mshauri-' + Date.now(),
          source: 'mshauri',
          subject: activeChat.formData.subject,
          curriculum: activeChat.formData.curriculum,
          year: activeChat.formData.year,
          topic: activeChat.formData.topic,
          rawContent: activeChat.response,
          createdAt: new Date().toISOString(),
        })
        localStorage.setItem('sm_question_bank_drafts', JSON.stringify(existing))
        toast?.ok?.('Saved as draft. Open Question Bank to review and publish.')
      } catch { toast?.error?.('Could not save draft.') }
    }
  }

  const saveAsDraftMessage = () => {
    if (!activeChat) return
    try {
      const existing = JSON.parse(localStorage.getItem('sm_message_drafts') || '[]')
      existing.push({
        id: 'mshauri-' + Date.now(),
        source: 'mshauri',
        recipient: activeChat.formData.studentName ? 'Parent of ' + activeChat.formData.studentName : '',
        body: activeChat.response.replace(/\*\[.*?\]\*/, '').trim(),
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem('sm_message_drafts', JSON.stringify(existing))
      toast?.ok?.('Draft saved. Open Messages to review and send.')
    } catch { toast?.error?.('Could not save draft.') }
  }

  const deleteChat = (chatId) => {
    if (!confirm('Delete this conversation?')) return
    const updated = chats.filter(c => c.id !== chatId)
    setChats(updated)
    maSaveChats(updated)
    if (activeChatId === chatId) {
      setActiveChatId(null)
      setShowSkillPicker(true)
    }
  }

  const updateField = (id, value) => {
    setFormData(f => ({ ...f, [id]: value }))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: 14, minHeight: 600 }}>
      {/* ── LEFT: HISTORY SIDEBAR ── */}
      <div style={{
        background: '#FFF',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--rxl)',
        padding: 14,
        display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100vh - 200px)',
      }}>
        <button onClick={() => { setShowSkillPicker(true); setActiveChatId(null); setActiveSkill(null) }}
          style={{
            background: 'linear-gradient(135deg, #7D1025, #8B1A2E)',
            color: '#FBFAF5',
            border: 'none',
            padding: '12px 16px',
            borderRadius: 'var(--rmd)',
            cursor: 'pointer',
            fontSize: 13.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 12,
            boxShadow: '0 4px 14px rgba(125,16,37,.25)',
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Conversation
        </button>

        <div style={{
          fontSize: 10.5, fontWeight: 700,
          letterSpacing: '.1em', textTransform: 'uppercase',
          color: 'var(--s500)', marginBottom: 8, paddingLeft: 4,
        }}>History</div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {chats.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--s400)', padding: 16, textAlign: 'center', fontStyle: 'italic' }}>
              No conversations yet. Click "New Conversation" to start.
            </div>
          ) : (
            chats.map(c => {
              const isActive = activeChatId === c.id
              return (
                <div key={c.id} onClick={() => { setActiveChatId(c.id); setShowSkillPicker(false); setActiveSkill(null) }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--rsm)',
                    cursor: 'pointer',
                    background: isActive ? '#FBE8E8' : 'transparent',
                    borderLeft: '3px solid ' + (isActive ? '#7D1025' : 'transparent'),
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#FBFAF5' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                  <div style={{
                    fontSize: 12.5, fontWeight: 700,
                    color: 'var(--s900)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: 2,
                  }}>{c.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--s500)' }}>{c.skillLabel}</span>
                    <span style={{ fontSize: 10, color: 'var(--s400)' }}>{maTimeAgo(c.createdAt)}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer: Settings + API status */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 12, marginTop: 12,
        }}>
          <div onClick={() => setShowSettings(true)}
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--rsm)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 11.5,
              color: 'var(--s600)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FBFAF5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: config.apiConnected ? '#15803D' : '#B45309',
              }}/>
              {config.apiConnected ? 'API Connected' : 'Mock Mode'}
            </span>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── RIGHT: MAIN CONVERSATION AREA ── */}
      <div style={{
        background: '#FFF',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--rxl)',
        padding: 0,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Skill Picker */}
        {showSkillPicker && (
          <div style={{ padding: 32, overflowY: 'auto' }}>
            {/* Hero */}
            <div style={{
              background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
              borderRadius: 'var(--rxl)',
              padding: '28px 32px',
              color: '#FBFAF5',
              marginBottom: 24,
              boxShadow: '0 12px 32px rgba(125,16,37,.18)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: '#C9A030',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  border: '3px solid #F0CC5A',
                }}>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#7D1025" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 4, color: '#F0CC5A' }}>
                    Mshauri AI
                  </div>
                  <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
                    Your teaching assistant
                  </h1>
                  <div style={{ fontSize: 13, opacity: .9, marginTop: 4 }}>
                    Generate questions, mark work, draft messages, plan lessons. Powered by Claude.
                  </div>
                </div>
              </div>
            </div>

            {/* Skills grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 14,
            }}>
              {MA_SKILLS.map(skill => (
                <div key={skill.id} onClick={() => startNewChat(skill)}
                  style={{
                    background: '#FFF',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--rxl)',
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'all .15s',
                    display: 'flex', gap: 14,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = skill.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(125,16,37,.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: skill.color + '12',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Ico d={skill.icon} w={20} col={skill.color} sw={2}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--s900)', marginBottom: 4 }}>{skill.label}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--s500)', lineHeight: 1.5 }}>{skill.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* API status banner */}
            {!config.apiConnected && (
              <div style={{
                background: '#FEF3C7', borderLeft: '3px solid #B45309',
                padding: '12px 16px',
                borderRadius: 'var(--rsm)',
                fontSize: 13, color: '#92400E',
                marginTop: 18,
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B45309" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div style={{ flex: 1, minWidth: 200, lineHeight: 1.5 }}>
                  <strong>Mshauri is in mock mode.</strong> All skills work with realistic placeholder responses, perfect for demos. Connect your Anthropic API for real intelligence.
                </div>
                <button onClick={() => setShowSettings(true)}
                  style={{
                    background: '#B45309', color: '#FBFAF5', border: 'none',
                    padding: '8px 16px', borderRadius: 'var(--rsm)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>Connect API</button>
              </div>
            )}
          </div>
        )}

        {/* Active skill form */}
        {activeSkill && !activeChatId && (
          <div style={{ padding: 32, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => { setActiveSkill(null); setShowSkillPicker(true) }}
                style={{
                  background: 'transparent', border: 'none',
                  color: '#7D1025', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: activeSkill.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ico d={activeSkill.icon} w={22} col={activeSkill.color} sw={2}/>
              </div>
              <div>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: 'var(--s900)', margin: 0 }}>
                  {activeSkill.label}
                </h2>
                <div style={{ fontSize: 13, color: 'var(--s500)' }}>{activeSkill.description}</div>
              </div>
            </div>

            {/* Form */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 20 }}>
              {activeSkill.formFields.map(field => (
                <div key={field.id} className="fg" style={{
                  marginBottom: 0,
                  gridColumn: (field.type === 'textarea' || field.id === 'topic') ? 'span 2' : 'auto',
                }}>
                  <label className="fl">{field.label}</label>
                  {field.type === 'select' && (
                    <select className="fsel" value={formData[field.id] || ''} onChange={e => updateField(field.id, e.target.value)}>
                      {field.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  )}
                  {field.type === 'text' && (
                    <input className="fi" value={formData[field.id] || ''}
                      onChange={e => updateField(field.id, e.target.value)}
                      placeholder={field.placeholder}/>
                  )}
                  {field.type === 'number' && (
                    <input className="fi" type="number"
                      min={field.min} max={field.max}
                      value={formData[field.id] || ''}
                      onChange={e => updateField(field.id, parseInt(e.target.value) || 0)}/>
                  )}
                  {field.type === 'textarea' && (
                    <textarea className="fi" rows={field.rows || 4}
                      value={formData[field.id] || ''}
                      onChange={e => updateField(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}/>
                  )}
                  {field.type === 'student-select' && (
                    <select className="fsel" value={formData[field.id] || ''} onChange={e => updateField(field.id, e.target.value)}>
                      <option value="">Select student...</option>
                      {allStudents.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>

            <button onClick={generateResponse}
              disabled={isStreaming}
              style={{
                background: isStreaming ? 'var(--bg)' : '#7D1025',
                color: isStreaming ? 'var(--s400)' : '#FBFAF5',
                border: 'none',
                padding: '14px 28px', borderRadius: 'var(--rmd)',
                cursor: isStreaming ? 'wait' : 'pointer',
                fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: isStreaming ? 'none' : '0 4px 14px rgba(125,16,37,.25)',
              }}>
              {isStreaming ? (
                <>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Mshauri is thinking...
                </>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Generate Response
                </>
              )}
            </button>

            {/* Live streaming output (while generating) */}
            {isStreaming && streamedText && (
              <div style={{
                marginTop: 20,
                padding: 20,
                background: '#FBFAF5',
                borderRadius: 'var(--rmd)',
                borderLeft: '3px solid #C9A030',
                fontSize: 14, lineHeight: 1.7,
                color: 'var(--s700)',
                whiteSpace: 'pre-wrap',
              }}>
                {streamedText}
                <span style={{ display: 'inline-block', width: 8, height: 16, background: '#7D1025', marginLeft: 2, animation: 'pulse 1s infinite' }}/>
              </div>
            )}
          </div>
        )}

        {/* Active chat (completed response) */}
        {activeChat && (
          <div style={{ padding: 32, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{
                  background: '#7D1025', color: '#FBFAF5',
                  fontSize: 10, fontWeight: 800, letterSpacing: '.08em',
                  padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase',
                }}>{activeChat.skillLabel}</span>
                <span style={{ fontSize: 12, color: 'var(--s500)' }}>{maTimeAgo(activeChat.createdAt)}</span>
                <button onClick={() => deleteChat(activeChat.id)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--s400)',
                    fontSize: 11, cursor: 'pointer', marginLeft: 'auto',
                  }}>Delete</button>
              </div>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: 'var(--s900)', margin: 0 }}>
                {activeChat.title}
              </h2>
            </div>

            <div style={{
              background: '#FBFAF5',
              borderLeft: '3px solid #C9A030',
              borderRadius: 'var(--rmd)',
              padding: 22,
              fontSize: 14, lineHeight: 1.75,
              color: 'var(--s800)',
              whiteSpace: 'pre-wrap',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              marginBottom: 18,
            }}>{activeChat.response}</div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={copyResponse}
                style={{
                  background: '#FBFAF5', color: '#7D1025',
                  border: '1.5px solid #F4C5C5',
                  padding: '10px 18px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </button>
              <button onClick={regenerate}
                style={{
                  background: '#FBFAF5', color: '#7D1025',
                  border: '1.5px solid #F4C5C5',
                  padding: '10px 18px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 7v6h6"/>
                  <path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>
                </svg>
                Regenerate
              </button>
              {activeChat.skillId === 'generate-questions' && (
                <button onClick={saveToBank}
                  style={{
                    background: '#7D1025', color: '#FBFAF5', border: 'none',
                    padding: '10px 18px', borderRadius: 'var(--rmd)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                  Save to Question Bank
                </button>
              )}
              {activeChat.skillId === 'parent-message' && (
                <button onClick={saveAsDraftMessage}
                  style={{
                    background: '#7D1025', color: '#FBFAF5', border: 'none',
                    padding: '10px 18px', borderRadius: 'var(--rmd)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                  Save as Draft
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <MshauriSettingsModal
          config={config}
          setConfig={(newConfig) => { setConfig(newConfig); maSaveConfig(newConfig) }}
          onClose={() => setShowSettings(false)}
          toast={toast}
        />
      )}
    </div>
  )
}

const getChatTitle = (skill, formData) => {
  switch (skill.id) {
    case 'generate-questions': return formData.subject + ' · ' + (formData.topic || 'Topic')
    case 'mark-answer': return 'Marked answer (' + (formData.maxMarks || 10) + ' marks)'
    case 'parent-message': return (formData.studentName || 'Parent') + ' · ' + (formData.topic || '').split(' ')[0]
    case 'lesson-plan': return (formData.topic || 'Lesson') + ' · ' + (formData.duration || 60) + 'min'
    case 'student-insights': return 'Insights · ' + (formData.studentName || 'Student')
    case 'free-chat': return (formData.message || '').slice(0, 40) + ((formData.message || '').length > 40 ? '...' : '')
    default: return 'Conversation'
  }
}

// ──────────────────────────────────────────────────────
// SETTINGS MODAL
// ──────────────────────────────────────────────────────
function MshauriSettingsModal({ config, setConfig, onClose, toast }) {
  const [model, setModel] = useState(config.model || 'sonnet')

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#FFF', borderRadius: 'var(--rxl)',
        maxWidth: 520, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,.3)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 28px',
          background: 'linear-gradient(135deg, #7D1025, #8B1A2E)',
          color: '#FBFAF5',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8, marginBottom: 4, color: '#F0CC5A' }}>
            Mshauri Settings
          </div>
          <h3 className="serif" style={{ fontSize: 22, margin: 0 }}>API & Preferences</h3>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {/* API Status */}
          <div style={{
            background: config.apiConnected ? '#DCFCE7' : '#FEF3C7',
            borderLeft: '3px solid ' + (config.apiConnected ? '#15803D' : '#B45309'),
            padding: '12px 14px', borderRadius: 'var(--rsm)',
            fontSize: 13, color: config.apiConnected ? '#15803D' : '#92400E',
            marginBottom: 20, lineHeight: 1.6,
          }}>
            <strong>Status: {config.apiConnected ? 'Connected' : 'Mock Mode'}</strong>
            <br/>
            {config.apiConnected
              ? 'Mshauri is using your Anthropic API for real intelligence.'
              : 'All skills work in mock mode. Real responses require backend setup.'}
          </div>

          {/* Setup Instructions */}
          {!config.apiConnected && (
            <div style={{ marginBottom: 20 }}>
              <div className="ctitle" style={{ marginBottom: 10, color: '#7D1025' }}>Connect to Anthropic API</div>
              <div style={{ fontSize: 13, color: 'var(--s700)', lineHeight: 1.7, marginBottom: 12 }}>
                To enable real AI responses, your developer needs to:
              </div>
              <ol style={{ fontSize: 13, color: 'var(--s700)', lineHeight: 1.8, paddingLeft: 20, marginBottom: 12 }}>
                <li>Add <code style={{ background: '#FBFAF5', padding: '1px 6px', borderRadius: 3, fontSize: 12 }}>ANTHROPIC_API_KEY</code> environment variable on Render backend</li>
                <li>Add a <code style={{ background: '#FBFAF5', padding: '1px 6px', borderRadius: 3, fontSize: 12 }}>POST /api/mshauri/chat</code> endpoint</li>
                <li>Toggle "API Connected" below once endpoint is live</li>
              </ol>
              <div style={{
                background: '#FBFAF5', borderLeft: '3px solid #C9A030',
                padding: '10px 14px', borderRadius: 'var(--rsm)',
                fontSize: 12, color: 'var(--s600)', fontStyle: 'italic',
              }}>
                Backend code will be provided separately. For now, mock mode lets you demo and test the UI.
              </div>
            </div>
          )}

          {/* Toggle (manual switch when backend ready) */}
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: '1px solid var(--border)',
            cursor: 'pointer',
          }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--s900)' }}>API Connected</div>
              <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>Toggle ON only after backend endpoint is deployed</div>
            </div>
            <input type="checkbox" checked={config.apiConnected}
              onChange={e => setConfig({ ...config, apiConnected: e.target.checked })}
              style={{ accentColor: '#7D1025', width: 18, height: 18 }}/>
          </label>

          {/* Model selection */}
          <div className="fg" style={{ marginTop: 18, marginBottom: 0 }}>
            <label className="fl">Model</label>
            <select className="fsel" value={model}
              onChange={e => { setModel(e.target.value); setConfig({ ...config, model: e.target.value }) }}>
              <option value="sonnet">Claude Sonnet 4 (recommended for quality)</option>
              <option value="haiku">Claude Haiku 4.5 (cheaper, faster, simpler tasks)</option>
            </select>
            <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 4 }}>
              Sonnet costs ~5x more than Haiku per message but produces much better questions, marking, and lesson plans.
            </div>
          </div>

          {/* Usage */}
          <div style={{
            background: '#FBFAF5',
            padding: '12px 14px', borderRadius: 'var(--rsm)',
            marginTop: 18,
            fontSize: 12.5, color: 'var(--s600)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>Conversations today: <strong style={{ color: '#7D1025' }}>{config.dailyUsage || 0}</strong></span>
            <button onClick={() => { setConfig({ ...config, dailyUsage: 0 }); toast?.ok?.('Usage counter reset') }}
              style={{
                background: 'transparent', border: 'none', color: 'var(--s500)',
                fontSize: 11, cursor: 'pointer',
              }}>Reset</button>
          </div>
        </div>

        <div style={{
          padding: '14px 24px', borderTop: '1px solid var(--border)',
          background: '#FBFAF5', display: 'flex', justifyContent: 'flex-end',
        }}>
          <button onClick={onClose}
            style={{
              background: '#7D1025', color: '#FBFAF5', border: 'none',
              padding: '10px 24px', borderRadius: 'var(--rmd)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>Done</button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// FLOATING BUTTON — appears on every page
// ──────────────────────────────────────────────────────
function MshauriFloatingButton({ user, setPage, toast, currentPage }) {
  const [open, setOpen] = useState(false)

  // Don't show on Mshauri tab itself or in classroom
  if (currentPage === 'mshauri' || currentPage === 'classroom') return null

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Mshauri AI"
          title="Mshauri AI — your teaching assistant"
          style={{
            position: 'fixed',
            bottom: 24, right: 24,
            width: 60, height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7D1025, #8B1A2E)',
            color: '#FBFAF5',
            border: '3px solid #C9A030',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(125,16,37,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 90,
            transition: 'transform .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </button>
      )}

      {/* Slide-in panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 24, right: 24,
          width: 380,
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 48px)',
          background: '#FFF',
          borderRadius: 'var(--rxl)',
          boxShadow: '0 24px 60px rgba(0,0,0,.25)',
          border: '1.5px solid var(--border)',
          zIndex: 90,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #7D1025, #8B1A2E)',
            color: '#FBFAF5',
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#C9A030',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#7D1025" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Mshauri AI</div>
              <div style={{ fontSize: 11, opacity: .85 }}>Your teaching assistant</div>
            </div>
            <button onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                background: 'rgba(251,250,245,.15)',
                color: '#FBFAF5', border: 'none',
                width: 30, height: 30, borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: 18, overflowY: 'auto' }}>
            <div style={{ fontSize: 13, color: 'var(--s600)', marginBottom: 14, lineHeight: 1.6 }}>
              Quick start a Mshauri task:
            </div>
            {MA_SKILLS.slice(0, 5).map(skill => (
              <button key={skill.id}
                onClick={() => { setPage('mshauri'); setOpen(false) }}
                style={{
                  width: '100%',
                  background: '#FBFAF5',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--rmd)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  marginBottom: 8,
                  textAlign: 'left',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7D1025'; e.currentTarget.style.background = '#FBE8E8' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#FBFAF5' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: '#7D1025' + '12',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Ico d={skill.icon} w={16} col="#7D1025" sw={2}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--s900)' }}>{skill.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--s500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{skill.description}</div>
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            ))}

            <button onClick={() => { setPage('mshauri'); setOpen(false) }}
              style={{
                width: '100%',
                background: '#7D1025', color: '#FBFAF5', border: 'none',
                padding: '12px', borderRadius: 'var(--rmd)',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
                marginTop: 10,
              }}>
              Open Full Mshauri
            </button>
          </div>
        </div>
      )}
    </>
  )
}
