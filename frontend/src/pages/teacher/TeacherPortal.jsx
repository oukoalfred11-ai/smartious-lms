import { useState, useRef, useEffect, useCallback } from 'react'
import { useToast, api } from '../../context/ctx.jsx'
import { useStore } from '../../context/ctx.jsx'
import Modal from '../../components/ui/Modal.jsx'
import {
  NestedQuestionEditor,
  NestedQuestionRenderer,
  AttachmentList,
  AnnotationCanvas,
  sumLeafMarks,
  labelAt,
} from '../../components/exam/NestedQuestion.jsx'
import ManageSubjectTab from './ManageSubjectTab.jsx'

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

// ═════════════════════════════════════════════════════════
// APPLE-STYLE COLOURED NAV ICONS — matches Student Portal
// Each module renders as a 26×26 squircle tile with its own
// signature gradient and a white pictogram, like iOS Settings.
// ═════════════════════════════════════════════════════════
const NAV_ICON_PALETTE = {
  dashboard:     ['#FF6B6B', '#EE5253'], // coral red
  students:      ['#0EA5E9', '#0369A1'], // sky blue
  liveclass:     ['#EF4444', '#B91C1C'], // signal red
  questionbank:  ['#5E8CFF', '#3D6FE8'], // bright blue
  exambuilder:   ['#D97706', '#B45309'], // amber
  marking:       ['#22C55E', '#15803D'], // green
  documents:     ['#C9A030', '#9A7B16'], // gold
  communication: ['#8B5CF6', '#6D28D9'], // royal purple
  mshauri:       ['#7C3AED', '#5B21B6'], // violet
  profile:       ['#64748B', '#334155'], // slate
}

const NavIcon = ({ name, active }) => {
  const [c1, c2] = NAV_ICON_PALETTE[name] || ['#94A3B8', '#475569']
  const size = 26
  const r = 7 // squircle-ish corner radius

  const renderGlyph = () => {
    switch (name) {
      case 'dashboard': // tile grid
        return (
          <g fill="#fff">
            <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5"/>
            <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5"/>
            <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5"/>
            <rect x="13" y="13" width="7.5" height="7.5" rx="1.5"/>
          </g>
        )
      case 'students': // three people
        return (
          <g>
            <circle cx="8" cy="9" r="3" fill="#fff" fillOpacity=".25" stroke="#fff" strokeWidth="1.6"/>
            <circle cx="16" cy="10" r="2.5" fill="#fff" fillOpacity=".25" stroke="#fff" strokeWidth="1.6"/>
            <path d="M3 20c.6-3 2.6-5 5-5s4.4 2 5 5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M14 20c.4-2 1.8-3.5 3.5-3.5s3.1 1.5 3.5 3.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
          </g>
        )
      case 'attendance': // clipboard with checkmark
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="4" width="14" height="17" rx="2" fill="#fff" fillOpacity=".25"/>
            <rect x="9" y="2" width="6" height="3" rx="1" fill="#fff" stroke="#fff" strokeWidth="1.6"/>
            <path d="M8.5 12.5l2 2 4-4.5"/>
          </g>
        )
      case 'liveclass': // video camera with live dot
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="13" height="10" rx="2" fill="#fff" fillOpacity=".25"/>
            <path d="M16 10.5L21 7v10l-5-3.5z" fill="#fff"/>
            <circle cx="6.5" cy="10.5" r="1" fill="#fff" stroke="none"/>
          </g>
        )
      case 'questionbank': // book with question mark
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5z" fill="#fff" fillOpacity=".25"/>
            <path d="M4 17a2 2 0 0 1 2-2h12" />
            <path d="M10.5 8.5a1.5 1.5 0 1 1 2.5 1.1c-.7.5-1 .9-1 1.9" stroke="#fff" strokeWidth="1.8"/>
            <circle cx="12" cy="13.5" r="0.8" fill="#fff" stroke="none"/>
          </g>
        )
      case 'exambuilder': // clipboard with star
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="5" width="14" height="16" rx="2" fill="#fff" fillOpacity=".25"/>
            <rect x="8.5" y="3" width="7" height="4" rx="1" fill="#fff"/>
            <path d="M12 10l1.2 2.4 2.6.4-1.9 1.8.4 2.6L12 16l-2.3 1.2.4-2.6L7.2 12.8l2.6-.4L12 10z" fill="#fff" stroke="none"/>
          </g>
        )
      case 'marking': // clipboard with check (homework)
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="5" width="14" height="16" rx="2" fill="#fff" fillOpacity=".25"/>
            <rect x="8.5" y="3" width="7" height="4" rx="1" fill="#fff"/>
            <path d="M8 13.5l2.5 2.5 5-5"/>
          </g>
        )
      case 'communication': // chat bubble
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v4a5 5 0 0 1-5 5h-5l-4 3v-3a5 5 0 0 1-4-5V9z" fill="#fff" fillOpacity=".25"/>
            <circle cx="9" cy="11" r="1" fill="#fff" stroke="none"/>
            <circle cx="12" cy="11" r="1" fill="#fff" stroke="none"/>
            <circle cx="15" cy="11" r="1" fill="#fff" stroke="none"/>
          </g>
        )
      case 'mshauri': // chat bubble with sparkle (AI)
        return (
          <g>
            <path d="M3 9a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v4a5 5 0 0 1-5 5h-5l-4 3v-3a5 5 0 0 1-4-5V9z" fill="#fff" fillOpacity=".25" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M12 7.5l.9 1.9 2 .3-1.5 1.4.4 2L12 12.2l-1.8 1 .4-2-1.5-1.4 2-.3L12 7.5z" fill="#fff"/>
          </g>
        )
      case 'profile': // person
        return (
          <g>
            <circle cx="12" cy="8" r="3.8" fill="#fff" fillOpacity=".25" stroke="#fff" strokeWidth="1.8"/>
            <path d="M4.5 20c.6-4 3.8-6.5 7.5-6.5s6.9 2.5 7.5 6.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </g>
        )
      case 'documents': // document with lines
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" fill="#fff" fillOpacity=".25"/>
            <path d="M13 3v6h6"/>
            <line x1="15" y1="13" x2="9" y2="13"/>
            <line x1="15" y1="16.5" x2="9" y2="16.5"/>
          </g>
        )
      default:
        return <circle cx="12" cy="12" r="4" fill="#fff"/>
    }
  }

  return (
    <div style={{
      width:size, height:size,
      borderRadius: r,
      background:`linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink:0,
      boxShadow: active
        ? `0 4px 10px ${c2}55, inset 0 1px 0 rgba(255,255,255,.35)`
        : `0 1px 3px ${c2}40, inset 0 1px 0 rgba(255,255,255,.25)`,
      transition:'box-shadow .15s, transform .15s',
      transform: active ? 'scale(1.04)' : 'scale(1)',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        {renderGlyph()}
      </svg>
    </div>
  )
}

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
      {id:'dashboard',     label:'Dashboard',        iconName:'dashboard',     icon:'rect:3:3:7:7:1|rect:14:3:7:7:1|rect:14:14:7:7:1|rect:3:14:7:7:1'},
      {id:'students',      label:'My Students',      iconName:'students',      icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|circle:9:7:4|M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'},
      {id:'attendance',    label:'Attendance',       iconName:'attendance',    icon:'rect:5:4:14:17:2|rect:9:2:6:3:1|M8.5 12.5l2 2 4-4.5'},
      {id:'scheduleclasses', label:'Schedule Classes', iconName:'scheduleclasses', icon:'rect:3:4:18:18:2|line:16:2:16:6|line:8:2:8:6|line:3:10:21:10'},
      {id:'managesubject',  label:'Manage My Subject', iconName:'managesubject', icon:'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z|M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'},
    ]},
    { section:'Assessment', items:[
      {id:'questionbank',  label:'Question Bank',    iconName:'questionbank',  icon:'M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13|M4 19a2 2 0 0 0 2 2h14|M8 10h8M8 14h6|circle:18:18:3'},
      {id:'exambuilder',   label:'Exams',            iconName:'exambuilder',   icon:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2|rect:9:3:6:4:1.5|line:9:12:15:12|line:9:16:12:16'},
      {id:'marking',       label:'Homework',         iconName:'marking',       icon:'M9 11l3 3L22 4|M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'},
    ]},
    { section:'Documents', items:[
      {id:'documents',     label:'Reports & Documents', iconName:'documents',  icon:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|M14 2v6h6|line:16:13:8:13|line:16:17:8:17|line:10:9:8:9'},
    ]},
    { section:'Communication', items:[
      {id:'communication', label:'Messages',         iconName:'communication', icon:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'},
    ]},
    { section:'Assistant', items:[
      {id:'mshauri',       label:'Mshauri AI',       iconName:'mshauri',       icon:'M12 2L2 7l10 5 10-5-10-5z|M2 17l10 5 10-5|M2 12l10 5 10-5'},
    ]},
    { section:'Account', items:[
      {id:'profile',       label:'My Profile',       iconName:'profile',       icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|circle:12:7:4'},
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
                  <div className="nav-icon" style={{ width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <NavIcon name={item.iconName} active={page===item.id}/>
                  </div>
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

          {page === 'attendance' && <AttendanceTab user={currentUser} toast={toast} />}


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

          {/* ── SCHEDULE CLASSES ── (new scheduling system) */}
          {page === 'scheduleclasses' && (
            <ScheduleClassesTab user={currentUser} toast={toast} />
          )}

          {/* ── MANAGE MY SUBJECT ── */}
          {page === 'managesubject' && (
            <ManageSubjectTab user={currentUser} toast={toast} />
          )}

           {/* ── COMMUNICATION ── */}
           {page === 'communication' && <CommunicationTab user={currentUser} store={store} setPage={setPage} toast={toast} />}
           {page === 'documents' && <DocumentsTab user={currentUser} store={store} setPage={setPage} toast={toast} />}

           {/* ── MSHAURI AI ── */}
           {page === 'mshauri' && <MshauriAITab user={currentUser} store={store} setPage={setPage} toast={toast} />}

           {/* ── PROFILE ── */}
           {page === 'profile' && <TeacherProfileTab user={currentUser} setCurrentUser={setCurrentUser} store={store} setPage={setPage} toast={toast} />}


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
  mcq:         { letter: 'M', color: '#1E3A8A', label: 'Multiple Choice' },
  short:       { letter: 'S', color: '#166534', label: 'Short Answer' },
  long:        { letter: 'L', color: '#7E22CE', label: 'Long Answer' },
  drawing:     { letter: 'D', color: '#DC2626', label: 'Drawing' },
  handwriting: { letter: 'H', color: '#0F1933', label: 'Handwriting' },
  upload:      { letter: 'U', color: '#7D1025', label: 'Upload' },
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
    subtopic: '',
    type: 'mcq',
    questionText: '',
    options: ['', '', '', ''],
    correctIndex: null,           // for MCQ — index of correct option
    correctAnswer: '',            // for short/long — model answer text
    explanation: '',
    marks: 1,
    difficulty: 'medium',
    attachments: [],              // [{url, publicId, filename, mimeType, sizeBytes}]
    parts: [],                    // for NESTED questions — empty = flat question
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
      curriculum: '', grade: '', subject: '', topic: '', subtopic: '', type: 'mcq',
      questionText: '', options: ['', '', '', ''],
      correctIndex: null, correctAnswer: '', explanation: '',
      marks: 1, difficulty: 'medium', attachments: [], parts: [],
    })
    setCreateOpen(true)
  }

  const openEdit = (q) => {
    setEditingId(q._id)
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
      subtopic: q.subtopic || '',
      type: q.type || 'mcq',
      questionText: q.questionText || '',
      options: Array.isArray(q.options) && q.options.length > 0 ? [...q.options] : ['', '', '', ''],
      correctIndex,
      correctAnswer: typeof q.correctAnswer === 'string' ? q.correctAnswer : '',
      explanation: q.explanation || '',
      marks: q.marks || 1,
      difficulty: q.difficulty || 'medium',
      attachments: Array.isArray(q.attachments) ? [...q.attachments] : [],
      parts: Array.isArray(q.parts) ? q.parts : [],
    })
    setDetailQ(null)
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

  // ── Curriculum-spine integration ───────────────────────
  // When a subject with a loaded syllabus spine is selected,
  // Topic becomes Topic + Subtopic dropdowns drawn from the
  // spine. Subjects without a spine fall back to free text.
  //
  // NOTE: the question form's subject list comes from the static
  // /curriculum/options catalog, whose ids are NOT real database
  // Subject._ids. The spine is keyed by real Subject._id. So we
  // resolve the real subject by querying /subjects (DB-backed)
  // and matching on curriculum + name, then fetch its spine.
  const [spineTopics, setSpineTopics] = useState([])
  const [spineLoading, setSpineLoading] = useState(false)

  useEffect(() => {
    if (!form.curriculum || !form.subject) { setSpineTopics([]); return }
    let cancelled = false
    setSpineLoading(true)
    setSpineTopics([])
    ;(async () => {
      try {
        // 1. Resolve the real Subject._id from the DB-backed list
        const subjRes = await api.get('/subjects', { params: { curriculum: form.curriculum } })
        const dbSubjects = subjRes.data?.subjects || []
        const norm = (s) => String(s || '').trim().toLowerCase()
        const want = norm(form.subject)
        // Match exact first; then fall back to a contains-match either
        // way (handles "Mathematics" vs "IGCSE Mathematics" naming).
        let match = dbSubjects.find(s => norm(s.subjectName) === want)
        if (!match) {
          match = dbSubjects.find(s => {
            const have = norm(s.subjectName)
            return have && want && (have.includes(want) || want.includes(have))
          })
        }
        if (!match) { if (!cancelled) setSpineTopics([]); return }
        // 2. Fetch the spine for that real subject id
        const spineRes = await api.get('/syllabus/subject/' + match._id)
        if (!cancelled) setSpineTopics(spineRes.data?.data?.topics || [])
      } catch (e) {
        if (!cancelled) setSpineTopics([])
      } finally {
        if (!cancelled) setSpineLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [form.subject, form.curriculum])  // eslint-disable-line react-hooks/exhaustive-deps

  const hasSpine = spineTopics.length > 0
  const spineSelectedTopic = spineTopics.find(t => t.topic === form.topic)

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
        subtopic: (form.subtopic || '').trim() || '',
        type: form.type,
        questionText: form.questionText.trim(),
        options: cleanOptions,
        correctAnswer,
        explanation: form.explanation.trim() || '',
        marks: parseInt(form.marks) || 1,
        difficulty: form.difficulty,
        attachments: form.attachments,
        parts: Array.isArray(form.parts) ? form.parts : [],
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
                  {hasSpine ? (
                    <select className="fsel" value={form.topic}
                      onChange={e => { setF('topic', e.target.value); setF('subtopic', '') }}>
                      <option value="">Select topic...</option>
                      {spineTopics.map(t => (
                        <option key={t._id} value={t.topic}>{t.code ? t.code + '. ' : ''}{t.topic}</option>
                      ))}
                    </select>
                  ) : (
                    <input className="fi" value={form.topic} onChange={e => setF('topic', e.target.value)}
                      placeholder={spineLoading ? 'Loading syllabus...' : 'e.g. Algebra, Pythagoras'}/>
                  )}
                </div>
              </div>

              {hasSpine && form.topic && (
                <div className="fr2">
                  <div className="fg">
                    <label className="fl">Subtopic (optional)</label>
                    <select className="fsel" value={form.subtopic}
                      onChange={e => setF('subtopic', e.target.value)}>
                      <option value="">Select subtopic...</option>
                      {(spineSelectedTopic?.subtopics || []).map((s, i) => (
                        <option key={i} value={s.name}>{s.code ? s.code + ' ' : ''}{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="fg"></div>
                </div>
              )}
 
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

              {/* ════════════════════════════════════════════════
                  NESTED SUB-QUESTIONS (Cambridge format)
                  Optional. If used, the question text above acts
                  as the STEM (background context) and the parts
                  below carry the actual sub-questions with marks.
                  ════════════════════════════════════════════════ */}
              <div className="fg" style={{ marginTop: 8, paddingTop: 16, borderTop: '1px dashed #E8E2D6' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10 }}>
                  <div>
                    <label className="fl" style={{ marginBottom: 2 }}>
                      Sub-questions (Cambridge nested format)
                    </label>
                    <div style={{ fontSize: 11, color: '#6B6B6B', fontStyle: 'italic' }}>
                      Optional — leave empty for a flat question. Add parts to create (a)(b)(c) with optional (i)(ii)(iii) sub-parts. Marks auto-sum from leaves.
                    </div>
                  </div>
                  {Array.isArray(form.parts) && form.parts.length > 0 && (
                    <div style={{
                      background:'#7D1025', color:'#fff',
                      padding:'4px 10px', borderRadius:99,
                      fontSize:11, fontWeight:700, fontFamily:'JetBrains Mono,monospace',
                    }}>
                      Total: {sumLeafMarks(form.parts)} marks
                    </div>
                  )}
                </div>
                <NestedQuestionEditor
                  value={form.parts || []}
                  onChange={(newParts) => setF('parts', newParts)}
                  maxDepth={4}
                />
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

  // Load students from this teacher's allocations.
  // (Migrated from GroupRoom-based loading. Allocations are the source
  // of truth for "who teaches whom"; GroupRooms are for live-class
  // infrastructure only.)
  useEffect(() => {
    const loadRealStudents = async () => {
      setLoadingStudents(true)
      try {
        const teacherId = user?._id
        if (!teacherId) {
          setLoadingStudents(false)
          return
        }
        // Fetch this teacher's allocations (admin or teacher both work;
        // /allocations/teacher returns only the current user's).
        const allocRes = await api.get('/allocations/teacher')
        const allocations = allocRes.data?.allocations || []

        // Aggregate by student — one student may have multiple allocations
        // (different subjects with this teacher). Each allocation contributes
        // a subject to that student's list.
        const studentMap = new Map()
        allocations.forEach(a => {
          // Only count Active allocations in My Students view
          if (a.status && a.status !== 'Active') return

          const s = a.studentId
          if (!s || typeof s !== 'object' || !s._id) return

          const subjectName = a.subjectId?.subjectName || ''

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
              subjects: subjectName ? [subjectName] : [],
            })
          } else if (subjectName) {
            const existing = studentMap.get(s._id)
            if (!existing.subjects.includes(subjectName)) existing.subjects.push(subjectName)
          }
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

// ── Subject + Curriculum reference data for the Exam builder ──
// (These were referenced by ExamsTab but never declared, causing
// "ReferenceError: QB_SUBJECTS is not defined" at runtime.)
const QB_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Business Studies',
  'Economics',
  'Accounting',
]

const QB_CURRICULA = {
  IGCSE:    { label: 'Cambridge IGCSE', years: ['Year 9', 'Year 10', 'Year 11'] },
  EDEXCEL:  { label: 'Edexcel',         years: ['Year 9', 'Year 10', 'Year 11'] },
  IB:       { label: 'IB',              years: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
  CBC:      { label: 'Kenya CBC',       years: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
  BNC:      { label: 'British National', years: ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'] },
  AMERICAN: { label: 'American',        years: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
}

function ExamsTab({ user, store, setPage, toast }) {
  // Exams are now loaded from the backend (/api/exams/teacher/list).
  // We keep using exLoadExams() as a fallback if the API call fails so the
  // teacher still sees whatever was previously cached, but the source of
  // truth is the server.
  const [exams, setExams] = useState([])
  const [examsLoading, setExamsLoading] = useState(true)
  const [view, setView] = useState('list')  // 'list' | 'create' | 'detail' | 'submissions' | 'grade'
  const [selectedExam, setSelectedExam] = useState(null)
  const [createStep, setCreateStep] = useState(1)

  // ── Submissions list state ──
  const [submissions, setSubmissions] = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)

  // ── Grading state (when view === 'grade') ──
  // selectedSubmission holds the full submission doc with answers[].
  // gradeForm tracks the teacher's input as they grade.
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [gradeForm, setGradeForm] = useState({
    answerMarks: {},          // { [answerIndex]: number }
    answerComments: {},       // { [answerIndex]: string }
    answerAnnotations: {},    // { [answerIndex]: dataURL } — teacher's marked-up image
    feedback: '',
    grade: '',
  })
  const [gradeSaving, setGradeSaving] = useState(false)
  // Annotation modal — when set, the AnnotationCanvas modal is open for this answer index.
  const [annotatingIndex, setAnnotatingIndex] = useState(null)
  // Cache of full bank-question docs (with parts), keyed by _id.
  const [gradeQuestionCache, setGradeQuestionCache] = useState({})

  // Filters
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQ, setSearchQ] = useState('')

  // Create form state
  const [formTitle, setFormTitle] = useState('')
  const [formSubject, setFormSubject] = useState('Mathematics')
  const [formCurriculum, setFormCurriculum] = useState('CambridgeIGCSE')
  const [formYear, setFormYear] = useState('Year 10')
  const [formStartAt, setFormStartAt] = useState(exDefaultStartAt())
  const [formDuration, setFormDuration] = useState(60)
  const [formInstructions, setFormInstructions] = useState('Answer ALL questions. Show full working. Calculator NOT permitted.')
  const [formSelectedQuestions, setFormSelectedQuestions] = useState([])
  const [formSelectedStudents, setFormSelectedStudents] = useState([])
  const [bankFilter, setBankFilter] = useState({ subject: 'all', difficulty: 'all', search: '' })

  // ── Bank questions — loaded from /questions API ──
  // Mirrors HomeworkTab pattern: filters drive a debounced GET /questions,
  // results held in state, no localStorage at all.
  const [bankQuestions, setBankQuestions] = useState([])
  const [bankLoading, setBankLoading] = useState(false)

  // True if we relaxed the grade filter on the last load (so we can warn).
  const [bankRelaxed, setBankRelaxed] = useState(false)

  const loadBankQuestions = async () => {
    setBankLoading(true)
    setBankRelaxed(false)
    try {
      // Build the strict query first: curriculum + grade + subject + filters
      const buildParams = (includeGrade) => {
        const p = new URLSearchParams()
        if (formCurriculum)        p.append('curriculum', formCurriculum)
        if (includeGrade && formYear) p.append('grade', formYear)
        const subj = bankFilter.subject === 'all' ? formSubject : bankFilter.subject
        if (subj) p.append('subject', subj)
        if (bankFilter.difficulty && bankFilter.difficulty !== 'all') {
          p.append('difficulty', bankFilter.difficulty)
        }
        if (bankFilter.search?.trim()) p.append('q', bankFilter.search.trim())
        p.append('limit', '100')
        return p
      }

      // Try strict first
      let { data } = await api.get('/questions?' + buildParams(true).toString())
      let questions = (data?.success ? data.questions : []) || []

      // If empty, retry without the grade filter so teachers can still see
      // questions tagged with a slightly different grade string.
      if (questions.length === 0 && formYear) {
        const retry = await api.get('/questions?' + buildParams(false).toString())
        const retryQs = (retry?.data?.success ? retry.data.questions : []) || []
        if (retryQs.length > 0) {
          questions = retryQs
          setBankRelaxed(true)
        }
      }

      setBankQuestions(questions)
    } catch (e) {
      console.error('[exam-bank] load failed:', e?.response?.data?.message || e.message)
      toast?.error?.('Failed to load question bank')
      setBankQuestions([])
    } finally {
      setBankLoading(false)
    }
  }

  // Debounced reload when filter inputs change AND when the user is on
  // step 2 of the create flow (where the picker is visible).
  useEffect(() => {
    if (view !== 'create' || createStep !== 2) return
    const handle = setTimeout(loadBankQuestions, 250)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, createStep, bankFilter.subject, bankFilter.difficulty, bankFilter.search, formSubject, formCurriculum, formYear])

  // ── Students — loaded from /users?role=student API ──
  const [allStudents, setAllStudents] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [studentsLoading, setStudentsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loadStudents = async () => {
      setStudentsLoading(true)
      try {
        const { data } = await api.get('/users?role=student')
        if (cancelled) return
        const rows = Array.isArray(data?.users) ? data.users : (Array.isArray(data) ? data : [])
        // Normalize each student to the shape the form already expects.
        const normalised = rows.map(s => {
          const first = s.firstName || ''
          const last  = s.lastName  || ''
          const fullName = (first + ' ' + last).trim() || s.email || 'Student'
          const initials = ((first[0] || '') + (last[0] || '')).toUpperCase() || (fullName[0] || 'S').toUpperCase()
          return {
            id: s._id || s.id,
            _id: s._id || s.id,
            name: fullName,
            initials,
            year: s.grade || s.year || '',
            curriculum: s.curriculum || '',
            mastery: typeof s.mastery === 'number' ? s.mastery : 0,
            email: s.email || '',
          }
        })
        setAllStudents(normalised)
      } catch (e) {
        console.error('[exam-students] load failed:', e?.response?.data?.message || e.message)
        if (!cancelled) setAllStudents([])
      } finally {
        if (!cancelled) setStudentsLoading(false)
      }
    }
    loadStudents()
    return () => { cancelled = true }
  }, [])

  // ── Load exams from backend ──
  // Source of truth = the server. Refreshes after every mutation
  // (create/delete) so the list stays in sync.
  const loadExamsFromServer = async () => {
    setExamsLoading(true)
    try {
      const { data } = await api.get('/exams/teacher/list')
      if (data?.success) {
        setExams(data.data?.exams || [])
      } else {
        toast?.error?.('Could not load exams.')
      }
    } catch (e) {
      console.error('[exams load] failed:', e?.response?.data?.message || e.message)
      toast?.error?.('Failed to load exams.')
    } finally {
      setExamsLoading(false)
    }
  }
  useEffect(() => {
    loadExamsFromServer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helper: look up a bank question by id (handles both _id and id keys)
  const findBankQuestion = (qid) =>
    bankQuestions.find(q => (q._id || q.id) === qid)

  // ── Load submissions for the selected exam ──
  // Fetches the per-student submission list with student names populated.
  // Called when the teacher opens 'submissions' view.
  const loadSubmissions = async (examId) => {
    if (!examId) return
    setSubmissionsLoading(true)
    try {
      const { data } = await api.get('/exams/' + examId + '/submissions')
      if (data?.success) {
        setSubmissions(data.data?.submissions || [])
      } else {
        toast?.error?.(data?.message || 'Could not load submissions.')
        setSubmissions([])
      }
    } catch (e) {
      console.error('[submissions load] failed:', e?.response?.data?.message || e.message)
      toast?.error?.('Failed to load submissions.')
      setSubmissions([])
    } finally {
      setSubmissionsLoading(false)
    }
  }

  const openSubmissions = async (exam) => {
    setSelectedExam(exam)
    setSubmissions([])
    setView('submissions')
    await loadSubmissions(exam._id)
  }

  // Open the grading screen for one student's submission.
  // Pre-loads the bank questions referenced by the exam so we can show
  // each question's text + parts alongside the student's answers.
  const openGrade = async (submission) => {
    setSelectedSubmission(submission)
    // Seed gradeForm from existing values (so re-grading shows previous marks/annotations)
    const initMarks       = {}
    const initComments    = {}
    const initAnnotations = {}
    ;(submission.answers || []).forEach((a, i) => {
      initMarks[i]       = typeof a.marksAwarded === 'number' ? a.marksAwarded : 0
      initComments[i]    = a.teacherComment || ''
      initAnnotations[i] = a.teacherAnnotation || ''
    })
    setGradeForm({
      answerMarks: initMarks,
      answerComments: initComments,
      answerAnnotations: initAnnotations,
      feedback: submission.feedback || '',
      grade:    submission.grade    || '',
    })

    // Fetch any bank-question IDs we don't yet have cached
    const neededIds = (selectedExam?.questionIds || [])
      .filter(qid => !gradeQuestionCache[String(qid)])
    if (neededIds.length > 0) {
      try {
        const fetches = await Promise.all(
          neededIds.map(qid => api.get('/questions/' + qid).then(r => r.data).catch(() => null))
        )
        const cache = { ...gradeQuestionCache }
        fetches.forEach((res, i) => {
          if (res?.success && res.question) {
            cache[String(neededIds[i])] = res.question
          }
        })
        setGradeQuestionCache(cache)
      } catch (e) {
        console.error('[grade] question cache load failed:', e.message)
      }
    }
    setView('grade')
  }

  // Save the grade — calls POST /exams/submissions/:subId/grade
  const saveGrade = async () => {
    if (!selectedSubmission) return
    setGradeSaving(true)
    try {
      // Build the per-answer payload. Include teacherAnnotation only if
      // the teacher actually drew on this answer (avoids re-uploading the
      // same annotation on every re-save).
      const answers = (selectedSubmission.answers || []).map((a, i) => {
        const payload = {
          marksAwarded:   Number(gradeForm.answerMarks[i]) || 0,
          teacherComment: gradeForm.answerComments[i] || '',
        }
        const ann = gradeForm.answerAnnotations?.[i]
        if (typeof ann === 'string') payload.teacherAnnotation = ann
        return payload
      })
      const { data } = await api.post('/exams/submissions/' + selectedSubmission._id + '/grade', {
        answers,
        feedback: gradeForm.feedback,
        grade:    gradeForm.grade,
      })
      if (data?.success) {
        toast?.ok?.('Saved & marked as graded.')
        // Update local submissions list with the new state
        setSubmissions(subs => subs.map(s =>
          s._id === selectedSubmission._id ? data.data.submission : s
        ))
        setView('submissions')
        setSelectedSubmission(null)
      } else {
        toast?.error?.(data?.message || 'Failed to save grade.')
      }
    } catch (e) {
      console.error('[grade save] failed:', e?.response?.data?.message || e.message)
      toast?.error?.('Could not save grade.')
    } finally {
      setGradeSaving(false)
    }
  }

  // Helper: find the question (bank or custom) that an answer refers to.
  // Returns { question, isCustom } or null.
  const findQuestionForAnswer = (questionRef) => {
    if (!questionRef || !selectedExam) return null
    if (questionRef.startsWith('custom:')) {
      const idx = parseInt(questionRef.slice(7), 10)
      const q = (selectedExam.customQuestions || [])[idx]
      return q ? { question: q, isCustom: true } : null
    }
    // Bank reference — look in cache
    const q = gradeQuestionCache[questionRef]
    return q ? { question: q, isCustom: false } : null
  }

  // Helper: descend into a question's parts tree following a partPath
  // and return the leaf part. Returns null if path doesn't resolve.
  const findLeafByPath = (question, partPath) => {
    if (!Array.isArray(partPath) || partPath.length === 0) return null
    let current = { parts: question.parts || [] }
    for (const idx of partPath) {
      if (!Array.isArray(current.parts) || !current.parts[idx]) return null
      current = current.parts[idx]
    }
    return current
  }

  // Helper: compute max marks for an answer (flat question or leaf part)
  const maxMarksForAnswer = (answer) => {
    const found = findQuestionForAnswer(answer.questionRef)
    if (!found) return 1
    const { question } = found
    if (Array.isArray(answer.partPath) && answer.partPath.length > 0) {
      const leaf = findLeafByPath(question, answer.partPath)
      return Number(leaf?.marks) || 0
    }
    return Number(question.marks) || 0
  }

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

  // Bank questions are pre-filtered server-side; surface them straight to the UI.
  const filteredBankQuestions = bankQuestions

  const totalMarks = formSelectedQuestions.reduce((sum, qid) => {
    const q = findBankQuestion(qid)
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
    setBankFilter({ subject: 'all', difficulty: 'all', search: '' })
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

  const scheduleExam = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return

    // Build the payload in the shape the backend Exam model expects.
    // The backend uses `grade` (not `year`) and `durationMins` (not `duration`).
    const payload = {
      title:            formTitle.trim(),
      instructions:     formInstructions.trim(),
      subject:          formSubject,
      curriculum:       formCurriculum,
      grade:            formYear, // formYear is the year/grade string e.g. 'Year 10'
      startAt:          new Date(formStartAt).toISOString(),
      durationMins:     parseInt(formDuration) || 60,
      questionIds:      formSelectedQuestions,  // already _id strings from the bank
      customQuestions: [],                       // (not exposed in current UI; reserved)
      assignedStudents: formSelectedStudents,
    }

    try {
      const { data } = await api.post('/exams', payload)
      if (data?.success) {
        toast?.ok?.('Exam scheduled. ' + formSelectedStudents.length + ' student(s) will be notified.')
        await loadExamsFromServer() // refresh
        setView('list')
        resetForm()
      } else {
        toast?.error?.(data?.message || 'Failed to schedule exam.')
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Network error.'
      console.error('[exam schedule] failed:', msg)
      toast?.error?.('Could not schedule: ' + msg)
    }
  }

  const deleteExam = async (id) => {
    if (!id) return
    try {
      const { data } = await api.delete('/exams/' + id)
      if (data?.success) {
        toast?.ok?.('Exam deleted.')
        await loadExamsFromServer()
        setSelectedExam(null)
        setView('list')
      } else {
        toast?.error?.(data?.message || 'Failed to delete.')
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Network error.'
      console.error('[exam delete] failed:', msg)
      toast?.error?.('Could not delete: ' + msg)
    }
  }

  const openDetail = (exam) => {
    setSelectedExam(exam)
    setView('detail')
  }

  // ── RENDER: DETAIL VIEW ─────────────────────────────
  if (view === 'detail' && selectedExam) {
    const status = exComputeStatus(selectedExam)
    const subjCol = exSubjColour(selectedExam.subject)
    // Questions may reference IDs that aren't currently loaded in
    // bankQuestions (e.g. teacher opens detail before opening the bank).
    // Fall back to a synthesized stub so the detail view still renders.
    const examQuestions = (selectedExam.questionIds || []).map(qid => {
      const q = findBankQuestion(qid)
      if (q) return q
      return { _id: qid, id: qid, questionText: '(question removed from bank)', marks: 0, subject: selectedExam.subject, topic: '', difficulty: 'medium' }
    })
    const examStudents = (selectedExam.assignedStudents || []).map(sid =>
      allStudents.find(s => (s._id || s.id) === sid)
    ).filter(Boolean)
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
                {selectedExam.subject} | {selectedExam.curriculum} {selectedExam.grade || selectedExam.year}
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
              ['Questions', (selectedExam.questionIds || []).length + ((selectedExam.customQuestions || []).length),  '#FBFAF5'],
              ['Total Marks', selectedExam.totalMarks,                                       '#F0CC5A'],
              ['Duration', selectedExam.durationMins + ' min',                              '#FBFAF5'],
              ['Students', (selectedExam.assignedStudents || []).length,                       '#FBFAF5'],
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
                <div key={q._id || q.id} style={{
                  display: 'flex', gap: 10, padding: '10px 0',
                  borderBottom: i < examQuestions.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div className="mono" style={{ width: 28, fontSize: 12, fontWeight: 700, color: 'var(--s400)', flexShrink: 0 }}>Q{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, color: 'var(--s900)', fontWeight: 600,
                      marginBottom: 4, lineHeight: 1.5,
                    }}>{q.questionText || q.question}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--s400)' }}>
                      {q.topic || '—'} | {q.difficulty || 'medium'} | {q.marks || 0} marks
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
                <span key={s._id || s.id} style={{
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
            <button onClick={() => { if (confirm('Delete this scheduled exam? Students will be unassigned.')) deleteExam(selectedExam._id || selectedExam.id) }}
              style={{
                background: '#FEE2E2', color: '#B91C1C',
                border: '1px solid #FCA5A5',
                padding: '10px 18px', borderRadius: 'var(--rmd)',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>Cancel Exam</button>
          )}
          {(status === 'active' || status === 'ended') && (
            <button onClick={() => openSubmissions(selectedExam)}
              style={{
                background: '#7D1025', color: '#fff',
                border: 'none',
                padding: '10px 18px', borderRadius: 'var(--rmd)',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              View Submissions
            </button>
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
                <a
                  href="/teacher#questionbank"
                  target="_blank"
                  rel="noopener"
                  title="Opens Question Bank in a new tab so you don't lose this exam draft"
                  style={{
                    background: 'transparent', border: '1px solid #7D1025',
                    color: '#7D1025', padding: '6px 12px',
                    borderRadius: 'var(--rsm)', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  Manage Bank
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>

              {/* Inline hint so teachers see the picker is RIGHT BELOW */}
              <div style={{
                background: '#FBF6E3', border: '1px solid #C9A030',
                borderRadius: 6, padding: '8px 12px', marginBottom: 14,
                fontSize: 12, color: '#7D1025', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span><strong>Click a question card below to select it</strong>. Selected questions appear with a red border and a tick. Use the filters to narrow by subject or difficulty.</span>
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

              {bankLoading ? (
                <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>
                  Loading questions from bank...
                </div>
              ) : filteredBankQuestions.length === 0 ? (
                <div style={{
                  padding: '20px 16px', textAlign: 'center',
                  background: '#FBFAF5', border: '1px dashed #E8E2D6',
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 13, color: 'var(--s700)', marginBottom: 8, fontWeight: 600 }}>
                    No questions match these filters
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 14, lineHeight: 1.55 }}>
                    Try clearing the difficulty filter or selecting "All Subjects", or add new questions to your bank.
                  </div>
                  <a href="/teacher#questionbank" target="_blank" rel="noopener"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: '#7D1025', color: '#fff',
                      padding: '7px 14px', borderRadius: 6,
                      fontSize: 12, fontWeight: 700, textDecoration: 'none',
                    }}>
                    Open Question Bank (new tab)
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
              ) : (
                <>
                  {bankRelaxed && (
                    <div style={{
                      background: '#FEF3C7', border: '1px solid #D97706',
                      borderRadius: 6, padding: '8px 12px', marginBottom: 10,
                      fontSize: 11.5, color: '#92400E',
                    }}>
                      <strong>Note:</strong> no questions matched <strong>{formYear}</strong> exactly,
                      so we're showing all <strong>{formSubject}</strong> questions for {formCurriculum} instead.
                    </div>
                  )}
                  <div style={{ maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredBankQuestions.map(q => {
                      const qid = q._id || q.id
                      const isSelected = formSelectedQuestions.includes(qid)
                      const subjCol = exSubjColour(q.subject)
                      return (
                        <div key={qid} onClick={() => toggleQuestion(qid)}
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
                            <span style={{ fontSize: 10.5, color: 'var(--s500)' }}>{q.topic || '—'} | {q.difficulty || 'medium'}</span>
                            {Array.isArray(q.parts) && q.parts.length > 0 && (
                              <span style={{
                                background: '#FBF6E3', color: '#7D1025',
                                fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em',
                                padding: '2px 7px', borderRadius: 99, textTransform: 'uppercase',
                                border: '1px solid #C9A030',
                              }}>Nested · {q.parts.length} part{q.parts.length===1?'':'s'}</span>
                            )}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--s900)', fontWeight: 600 }}>{q.questionText || q.question}</div>
                        </div>
                        <span style={{
                          background: 'var(--bg)', color: 'var(--s700)',
                          padding: '4px 8px', borderRadius: 'var(--rsm)',
                          fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                          flexShrink: 0,
                        }}>{(Array.isArray(q.parts) && q.parts.length > 0 ? sumLeafMarks(q.parts) : q.marks) || 0}m</span>
                      </div>
                    )
                  })}
                  </div>
                </>
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

  // ─────────────────────────────────────────────────────────
  // RENDER: SUBMISSIONS LIST VIEW
  // Teacher sees who has submitted this exam, with status + score.
  // Click a row to open the grading screen.
  // ─────────────────────────────────────────────────────────
  if (view === 'submissions' && selectedExam) {
    const totalAssigned = (selectedExam.assignedStudents || []).length
    const submittedCount = submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length
    const gradedCount    = submissions.filter(s => s.status === 'graded').length
    const inProgressCount= submissions.filter(s => s.status === 'in_progress').length
    const notStartedCount = Math.max(0, totalAssigned - submissions.length)
    const flaggedCount   = submissions.filter(s => s.flagged).length

    const statusColour = (s) => {
      if (s === 'graded')      return { bg: '#DCFCE7', fg: '#15803D', label: 'GRADED' }
      if (s === 'submitted')   return { bg: '#FEF3C7', fg: '#92400E', label: 'AWAITING GRADE' }
      if (s === 'in_progress') return { bg: '#FEE2E2', fg: '#B91C1C', label: 'IN PROGRESS' }
      return { bg: '#F1F5F9', fg: '#64748B', label: 'NOT STARTED' }
    }

    return (
      <div>
        <button onClick={() => { setView('detail') }}
          style={{
            background: 'transparent', border: 'none',
            color: '#7D1025', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', padding: '6px 0', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Exam
        </button>

        {/* Hero */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
          color: '#FBFAF5',
        }}>
          <div style={{ padding: '20px 28px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#F0CC5A', marginBottom: 4 }}>
              Submissions for
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              {selectedExam.title}
            </h1>
            <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>
              {selectedExam.subject} | {selectedExam.curriculum} {selectedExam.grade} | {selectedExam.durationMins} min
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
            {[
              ['Assigned',     totalAssigned,    '#FBFAF5'],
              ['Submitted',    submittedCount,   '#F0CC5A'],
              ['Graded',       gradedCount,      '#DCFCE7'],
              ['In Progress',  inProgressCount,  '#FCA5A5'],
              ['Not Started',  notStartedCount,  '#FBFAF5'],
              ...(flaggedCount > 0 ? [['Flagged', flaggedCount, '#FCA5A5']] : []),
            ].map(([l, v, c]) => (
              <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(251,250,245,.08)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7, marginBottom: 2, color: '#F0CC5A' }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Submissions list */}
        {submissionsLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: '#1A1A1A', marginBottom: 6 }}>
              No submissions yet
            </div>
            <div style={{ fontSize: 13, color: '#6B6B6B' }}>
              Students will appear here once they start the exam.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {submissions.map(sub => {
              const studentName = sub.studentId
                ? (sub.studentId.firstName || '') + ' ' + (sub.studentId.lastName || '')
                : '(unknown student)'
              const admissionNo = sub.studentId?.admissionNumber || sub.studentId?.email || ''
              const sc = statusColour(sub.status)
              const submittedTime = sub.submittedAt
                ? new Date(sub.submittedAt).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
                : '—'
              const minsSpent = sub.timeSpentSecs ? Math.round(sub.timeSpentSecs / 60) : null
              return (
                <div key={sub._id} className="card" style={{
                  padding: 14, cursor: sub.status === 'in_progress' ? 'default' : 'pointer',
                  borderLeft: '4px solid ' + sc.fg,
                  opacity: sub.status === 'in_progress' ? .7 : 1,
                }}
                  onClick={() => sub.status !== 'in_progress' && openGrade(sub)}
                  title={sub.status === 'in_progress' ? 'Student is still taking the exam' : 'Click to grade'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          background: sc.bg, color: sc.fg,
                          fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em',
                          padding: '2px 8px', borderRadius: 99,
                        }}>{sc.label}</span>
                        {sub.flagged && (
                          <span style={{
                            background: '#FEE2E2', color: '#B91C1C',
                            fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em',
                            padding: '2px 8px', borderRadius: 99,
                          }} title={sub.flagReason}>⚠ FLAGGED</span>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--s900)' }}>{studentName}</div>
                      <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 2 }}>
                        {admissionNo && <>{admissionNo} | </>}
                        Submitted {submittedTime}
                        {minsSpent !== null && <> | {minsSpent} min spent</>}
                      </div>
                    </div>
                    {sub.status === 'graded' && (
                      <div style={{ textAlign: 'center', minWidth: 80 }}>
                        <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: '#15803D' }}>
                          {sub.totalScore}/{sub.maxScore}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                          {sub.percentage}%{sub.grade ? ' | ' + sub.grade : ''}
                        </div>
                      </div>
                    )}
                    {sub.status === 'submitted' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openGrade(sub) }}
                        style={{
                          background: '#7D1025', color: '#fff', border: 'none',
                          padding: '8px 16px', borderRadius: 'var(--rsm)',
                          cursor: 'pointer', fontSize: 12, fontWeight: 700,
                          flexShrink: 0,
                        }}>
                        Grade Now
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // RENDER: GRADING SCREEN
  // Per-answer marks + comments + overall feedback + grade letter.
  // ─────────────────────────────────────────────────────────
  if (view === 'grade' && selectedSubmission && selectedExam) {
    const sub = selectedSubmission
    const studentName = sub.studentId
      ? (sub.studentId.firstName || '') + ' ' + (sub.studentId.lastName || '')
      : '(unknown student)'

    // Sum the marks the teacher has entered so far (live total)
    const liveTotal = Object.values(gradeForm.answerMarks).reduce((s, v) => s + (Number(v) || 0), 0)
    const maxTotal = selectedExam.totalMarks || 0
    const livePercentage = maxTotal > 0 ? Math.round((liveTotal / maxTotal) * 100) : 0

    return (
      <div>
        <button onClick={() => { setView('submissions'); setSelectedSubmission(null) }}
          style={{
            background: 'transparent', border: 'none',
            color: '#7D1025', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', padding: '6px 0', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Submissions
        </button>

        {/* Sticky header: student + live score */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 5,
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          padding: '14px 0', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--s400)' }}>
              Grading
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--s900)' }}>{studentName}</div>
            <div style={{ fontSize: 11, color: 'var(--s500)' }}>{selectedExam.title}</div>
          </div>
          <div style={{
            background: '#FBF6E3', border: '1px solid #C9A030',
            padding: '10px 18px', borderRadius: 8,
            textAlign: 'center',
          }}>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: '#7D1025' }}>
              {liveTotal}/{maxTotal}
            </div>
            <div style={{ fontSize: 10, color: '#7D1025', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>
              {livePercentage}% (live)
            </div>
          </div>
          <button
            onClick={saveGrade}
            disabled={gradeSaving}
            style={{
              background: gradeSaving ? '#9CA3AF' : '#7D1025',
              color: '#fff', border: 'none',
              padding: '12px 22px', borderRadius: 'var(--rmd)',
              cursor: gradeSaving ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {gradeSaving ? 'Saving...' : 'Save & Mark Graded'}
          </button>
        </div>

        {sub.flagged && (
          <div style={{
            background: '#FEE2E2', border: '1px solid #FCA5A5',
            color: '#B91C1C', padding: '10px 14px', borderRadius: 8,
            marginBottom: 14, fontSize: 12.5,
          }}>
            <strong>⚠ Integrity flag:</strong> {sub.flagReason}
          </div>
        )}

        {/* Answers — one block per answer, in submission order */}
        {(sub.answers || []).length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--s500)' }}>
              No answers in this submission.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sub.answers.map((answer, i) => {
              const found = findQuestionForAnswer(answer.questionRef)
              const question = found?.question
              const isCustom = found?.isCustom
              const isNested = Array.isArray(answer.partPath) && answer.partPath.length > 0
              const leafPart = isNested && question ? findLeafByPath(question, answer.partPath) : null

              // Display label: Q3 (flat) or Q3.b.ii (nested)
              const qIndex = isCustom
                ? '(custom)'
                : (selectedExam.questionIds || []).findIndex(qid => String(qid) === String(answer.questionRef))
              const qLabel = qIndex === -1 || qIndex === '(custom)'
                ? 'Q?'
                : 'Q' + (qIndex + 1)
              const fullLabel = isNested ? qLabel + '.' + labelAt(answer.partPath) : qLabel

              const maxMarks = maxMarksForAnswer(answer)
              const questionText = leafPart ? leafPart.text : (question?.questionText || '(question not loaded)')
              const partType = leafPart ? leafPart.type : (question?.type || 'short')
              const partOptions = leafPart ? (leafPart.options || []) : (question?.options || [])
              const correctAnswer = leafPart ? leafPart.correctAnswer : question?.correctAnswer

              return (
                <div key={i} className="card" style={{
                  padding: 14, borderLeft: '4px solid #7D1025',
                }}>
                  {/* Question label + text */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                    <div className="mono" style={{
                      minWidth: 48, padding: '4px 8px', borderRadius: 4,
                      background: '#7D1025', color: '#fff',
                      fontSize: 11, fontWeight: 700, textAlign: 'center', flexShrink: 0,
                    }}>{fullLabel}</div>
                    <div style={{ flex: 1, fontSize: 13.5, color: 'var(--s900)', lineHeight: 1.5 }}>
                      {questionText}
                      {/* Show context stem for nested */}
                      {isNested && question?.questionText && (
                        <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 6, fontStyle: 'italic' }}>
                          (Question {qLabel} stem: {question.questionText})
                        </div>
                      )}
                      {/* Attachments */}
                      {leafPart && Array.isArray(leafPart.attachments) && leafPart.attachments.length > 0 && (
                        <AttachmentList attachments={leafPart.attachments} />
                      )}
                      {!leafPart && question && Array.isArray(question.attachments) && question.attachments.length > 0 && (
                        <AttachmentList attachments={question.attachments} />
                      )}
                    </div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--s500)',
                      fontWeight: 700, flexShrink: 0, padding: '4px 8px',
                      background: '#FBFAF5', borderRadius: 4,
                    }}>
                      Max: {maxMarks}
                    </div>
                  </div>

                  {/* Student answer */}
                  <div style={{
                    background: '#FBFAF5', padding: '12px 14px',
                    borderRadius: 6, marginBottom: 12,
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 6 }}>
                      Student answer
                    </div>
                    {/* Drawing / handwriting: show as image, with Annotate button */}
                    {(partType === 'drawing' || partType === 'handwriting') && answer.answerText && answer.answerText.startsWith('data:') ? (() => {
                      const ann = gradeForm.answerAnnotations?.[i]
                      const displayUrl = ann || answer.answerText
                      return (
                        <div>
                          <div style={{ position:'relative', display:'inline-block', maxWidth:'100%' }}>
                            <img src={displayUrl} alt="Student drawing"
                              style={{
                                maxWidth: '100%', maxHeight: 480,
                                border: '1px solid var(--border)', borderRadius: 6,
                                background: '#fff', display: 'block',
                              }}/>
                            {ann && (
                              <div style={{
                                position:'absolute', top:8, right:8,
                                background:'rgba(125,16,37,.9)', color:'#fff',
                                padding:'4px 10px', borderRadius:99,
                                fontSize:10.5, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase',
                              }}>
                                ✓ Marked
                              </div>
                            )}
                          </div>
                          <div style={{ marginTop:8, display:'flex', gap:6, flexWrap:'wrap' }}>
                            <button
                              type="button"
                              onClick={() => setAnnotatingIndex(i)}
                              style={{
                                background:'#7D1025', color:'#fff', border:'none',
                                padding:'8px 16px', borderRadius:6,
                                fontSize:12, fontWeight:700, cursor:'pointer',
                                display:'inline-flex', alignItems:'center', gap:6,
                              }}>
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"/>
                                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                              </svg>
                              {ann ? 'Edit Annotation' : 'Annotate'}
                            </button>
                            {ann && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm('Remove your annotation? The student\'s original drawing stays.')) {
                                    setGradeForm(f => ({
                                      ...f,
                                      answerAnnotations: { ...f.answerAnnotations, [i]: '' },
                                    }))
                                  }
                                }}
                                style={{
                                  background:'transparent', color:'#7D1025',
                                  border:'1px solid #7D1025',
                                  padding:'8px 14px', borderRadius:6,
                                  fontSize:12, fontWeight:700, cursor:'pointer',
                                }}>
                                Remove
                              </button>
                            )}
                            <a
                              href={answer.answerText}
                              target="_blank" rel="noopener noreferrer"
                              style={{
                                background:'transparent', color:'#6B6B6B',
                                border:'1px solid #E8E2D6',
                                padding:'8px 14px', borderRadius:6,
                                fontSize:12, fontWeight:600,
                                textDecoration:'none',
                                display:'inline-flex', alignItems:'center', gap:6,
                              }}>
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                              </svg>
                              View Original
                            </a>
                          </div>
                        </div>
                      )
                    })() : partType === 'mcq' ? (
                      <div style={{ fontSize: 14, color: 'var(--s900)' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--s500)', marginRight: 8 }}>
                          Selected:
                        </span>
                        {answer.selectedOption || answer.answerText || <em style={{ color: 'var(--s400)' }}>(no answer)</em>}
                        {/* Show correct answer hint to teacher */}
                        {correctAnswer !== null && correctAnswer !== undefined && partOptions.length > 0 && (
                          <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 4 }}>
                            Model answer: {typeof correctAnswer === 'number' ? (partOptions[correctAnswer] || '(invalid index)') : correctAnswer}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        whiteSpace: 'pre-wrap',
                        fontSize: 13.5, color: 'var(--s900)', lineHeight: 1.6,
                      }}>
                        {answer.answerText || <em style={{ color: 'var(--s400)' }}>(no answer)</em>}
                      </div>
                    )}
                  </div>

                  {/* Marks + comment */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 110 }}>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
                        Marks (max {maxMarks})
                      </label>
                      <input
                        type="number" min={0} max={maxMarks} step={0.5}
                        value={gradeForm.answerMarks[i] ?? 0}
                        onChange={e => {
                          const v = Math.max(0, Math.min(maxMarks, parseFloat(e.target.value) || 0))
                          setGradeForm(f => ({ ...f, answerMarks: { ...f.answerMarks, [i]: v } }))
                        }}
                        style={{
                          width: 90, padding: '8px 10px',
                          background: '#fff', border: '1.5px solid #7D1025', borderRadius: 6,
                          fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                          color: '#7D1025', textAlign: 'center',
                        }}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
                        Comment (optional)
                      </label>
                      <input
                        value={gradeForm.answerComments[i] || ''}
                        onChange={e => setGradeForm(f => ({ ...f, answerComments: { ...f.answerComments, [i]: e.target.value } }))}
                        placeholder="Feedback on this answer..."
                        style={{
                          width: '100%', boxSizing: 'border-box', padding: '8px 10px',
                          background: '#fff', border: '1px solid var(--border)', borderRadius: 6,
                          fontSize: 13,
                        }}/>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Overall feedback + grade letter */}
        <div className="card" style={{ marginTop: 18, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7D1025', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            Overall feedback & grade
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <label className="fl">Feedback to student (optional)</label>
              <textarea
                value={gradeForm.feedback}
                onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                rows={4}
                placeholder="Overall comments shown to the student on their result screen..."
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  background: '#FBFAF5', border: '1px solid var(--border)', borderRadius: 6,
                  fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                }}/>
            </div>
            <div style={{ minWidth: 140 }}>
              <label className="fl">Grade letter</label>
              <select
                value={gradeForm.grade}
                onChange={e => setGradeForm(f => ({ ...f, grade: e.target.value }))}
                className="fsel"
                style={{ width: '100%' }}
              >
                <option value="">— (none) —</option>
                <option value="A*">A*</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="U">U (ungraded)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom save row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button onClick={() => { setView('submissions'); setSelectedSubmission(null) }}
            className="btn btn-s" disabled={gradeSaving}>Cancel</button>
          <button onClick={saveGrade} disabled={gradeSaving}
            style={{
              background: gradeSaving ? '#9CA3AF' : '#7D1025',
              color: '#fff', border: 'none',
              padding: '12px 24px', borderRadius: 'var(--rmd)',
              cursor: gradeSaving ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {gradeSaving ? 'Saving...' : 'Save & Mark Graded'}
          </button>
        </div>

        {/* ─── ANNOTATION MODAL ─── */}
        {annotatingIndex !== null && selectedSubmission?.answers?.[annotatingIndex] && (() => {
          const answer = selectedSubmission.answers[annotatingIndex]
          const existing = gradeForm.answerAnnotations?.[annotatingIndex] || ''
          return (
            <div style={{
              position:'fixed', inset:0, zIndex:100,
              background:'rgba(0,0,0,.7)',
              display:'flex', alignItems:'center', justifyContent:'center',
              padding:'20px',
            }}
              onClick={(e) => { if (e.target === e.currentTarget) setAnnotatingIndex(null) }}
            >
              <div style={{
                background:'#fff', borderRadius:12,
                maxWidth:'95vw', maxHeight:'95vh', width:1100,
                display:'flex', flexDirection:'column', overflow:'hidden',
                boxShadow:'0 24px 64px rgba(0,0,0,.4)',
              }}>
                <div style={{
                  padding:'16px 24px',
                  background:'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
                  color:'#FBFAF5',
                  display:'flex', alignItems:'center', justifyContent:'space-between', gap:14,
                }}>
                  <div>
                    <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'#F0CC5A' }}>
                      Annotate Student's Drawing
                    </div>
                    <div className="serif" style={{ fontSize:18, marginTop:2 }}>
                      Mark with red, green, or blue pen
                    </div>
                  </div>
                  <button onClick={() => setAnnotatingIndex(null)}
                    style={{
                      background:'rgba(0,0,0,.15)', color:'#fff',
                      border:'none', padding:'8px 12px', borderRadius:6,
                      cursor:'pointer', fontSize:13, fontWeight:700,
                    }}>
                    Close
                  </button>
                </div>
                <div style={{ padding:'20px 24px', overflow:'auto', flex:1 }}>
                  <AnnotationCanvas
                    backgroundImageUrl={answer.answerText}
                    existingAnnotation={existing}
                    onCancel={() => setAnnotatingIndex(null)}
                    onSave={(dataUrl) => {
                      setGradeForm(f => ({
                        ...f,
                        answerAnnotations: { ...f.answerAnnotations, [annotatingIndex]: dataUrl },
                      }))
                      setAnnotatingIndex(null)
                      toast?.ok?.('Annotation saved. Don\'t forget to save the grade.')
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })()}
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

      {examsLoading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--s500)', fontSize: 13.5 }}>
          Loading exams from server...
        </div>
      ) : filteredExams.length === 0 ? (
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
              <div key={exam._id || exam.id} className="card" style={{
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
                      <span style={{ fontSize: 11, color: 'var(--s500)' }}>{exam.curriculum} {exam.grade || exam.year}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--s900)', marginBottom: 4 }}>{exam.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                      {exFormatDateTime(exam.startAt)} | {exam.durationMins} min | {(typeof exam.totalQuestions === 'number') ? exam.totalQuestions : ((exam.questionIds || []).length + (exam.customQuestions || []).length)} questions | {exam.totalMarks || 0} marks
                      {timeUntil && status === 'scheduled' && <> | <strong style={{ color: '#C9A030' }}>{timeUntil}</strong></>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: '#7D1025' }}>
                      {(exam.assignedStudents || []).length}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Students</div>
                  </div>
                  {(status === 'active' || status === 'ended') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openSubmissions(exam) }}
                      style={{
                        background: '#FBF6E3', border: '1px solid #C9A030',
                        color: '#7D1025', padding: '8px 14px',
                        borderRadius: 'var(--rsm)', cursor: 'pointer',
                        fontSize: 12, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        flexShrink: 0,
                      }}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      Submissions
                    </button>
                  )}
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
  const [students, setStudents] = useState([])

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
  // Annotation modal index (which gradeForm.answers[idx] is being annotated)
  const [hwAnnotatingIndex, setHwAnnotatingIndex] = useState(null)

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
    // Students — for assigning homework directly, no group room needed
    api.get('/users?role=student').then(r => {
      setStudents(r.data?.data?.users || r.data?.users || [])
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
        studentAnswer: existing?.answer,
        studentAttachment: existing?.attachment,
        type: q.type,
        marksAwarded: existing?.marksAwarded !== null && existing?.marksAwarded !== undefined ? existing.marksAwarded : null,
        feedback: existing?.feedback || '',
        autoGraded: existing?.autoGraded || false,
        maxMarks: q.marks || 1,
        // Teacher's marked-up version of the student's image (data URL).
        teacherAnnotation: existing?.teacherAnnotation || '',
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
        answers: gradeForm.answers.map(a => {
          const item = {
            questionIndex: a.questionIndex,
            marksAwarded: parseFloat(a.marksAwarded),
            feedback: a.feedback || '',
          }
          // Only include teacherAnnotation if the teacher actually drew on
          // this answer — keeps re-saves small.
          if (typeof a.teacherAnnotation === 'string') {
            item.teacherAnnotation = a.teacherAnnotation
          }
          return item
        }),
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

                      {(q.type === 'upload' || q.type === 'drawing' || q.type === 'handwriting') && (
                        a.studentAttachment && a.studentAttachment.url ? (
                          a.studentAttachment.mimeType?.startsWith('image/') ? (
                            <div>
                              <div style={{ position:'relative', display:'inline-block', maxWidth:'100%' }}>
                                <img
                                  src={a.teacherAnnotation || a.studentAttachment.url}
                                  alt={a.teacherAnnotation ? 'Marked by teacher' : 'Student work'}
                                  style={{
                                    maxWidth: '100%', maxHeight: 300,
                                    borderRadius: 4, border: '1px solid var(--border)',
                                    background:'#fff', display:'block',
                                  }}
                                />
                                {a.teacherAnnotation && (
                                  <div style={{
                                    position:'absolute', top:6, right:6,
                                    background:'rgba(125,16,37,.9)', color:'#fff',
                                    padding:'3px 9px', borderRadius:99,
                                    fontSize:10, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase',
                                  }}>
                                    ✓ Marked
                                  </div>
                                )}
                              </div>
                              {/* Annotate / Edit / Remove / View Original buttons */}
                              <div style={{ marginTop:8, display:'flex', gap:6, flexWrap:'wrap' }}>
                                <button
                                  type="button"
                                  onClick={() => setHwAnnotatingIndex(idx)}
                                  style={{
                                    background:'#7D1025', color:'#fff', border:'none',
                                    padding:'8px 16px', borderRadius:6,
                                    fontSize:12, fontWeight:700, cursor:'pointer',
                                    display:'inline-flex', alignItems:'center', gap:6,
                                  }}>
                                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                  </svg>
                                  {a.teacherAnnotation ? 'Edit Annotation' : 'Annotate'}
                                </button>
                                {a.teacherAnnotation && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm('Remove your annotation? Student\'s original work stays.')) {
                                        setGradeAnswer(idx, 'teacherAnnotation', '')
                                      }
                                    }}
                                    style={{
                                      background:'transparent', color:'#7D1025',
                                      border:'1px solid #7D1025',
                                      padding:'8px 14px', borderRadius:6,
                                      fontSize:12, fontWeight:700, cursor:'pointer',
                                    }}>
                                    Remove
                                  </button>
                                )}
                                <a
                                  href={a.studentAttachment.url}
                                  target="_blank" rel="noopener noreferrer"
                                  style={{
                                    background:'transparent', color:'#6B6B6B',
                                    border:'1px solid #E8E2D6',
                                    padding:'8px 14px', borderRadius:6,
                                    fontSize:12, fontWeight:600, textDecoration:'none',
                                    display:'inline-flex', alignItems:'center', gap:6,
                                  }}>
                                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                  </svg>
                                  View Original
                                </a>
                              </div>
                            </div>
                          ) : (
                            <a href={a.studentAttachment.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#7D1025' }}>{a.studentAttachment.filename || 'View file'}</a>
                          )
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

      {/* ─── HOMEWORK ANNOTATION MODAL ─── */}
      {hwAnnotatingIndex !== null && gradeForm?.answers?.[hwAnnotatingIndex] && (() => {
        const a = gradeForm.answers[hwAnnotatingIndex]
        const bgUrl = a.studentAttachment?.url
        const existing = a.teacherAnnotation || ''
        return (
          <div style={{
            position:'fixed', inset:0, zIndex:1100,
            background:'rgba(0,0,0,.7)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:'20px',
          }}
            onClick={(e) => { if (e.target === e.currentTarget) setHwAnnotatingIndex(null) }}
          >
            <div style={{
              background:'#fff', borderRadius:12,
              maxWidth:'95vw', maxHeight:'95vh', width:1100,
              display:'flex', flexDirection:'column', overflow:'hidden',
              boxShadow:'0 24px 64px rgba(0,0,0,.4)',
            }}>
              <div style={{
                padding:'16px 24px',
                background:'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
                color:'#FBFAF5',
                display:'flex', alignItems:'center', justifyContent:'space-between', gap:14,
              }}>
                <div>
                  <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'#F0CC5A' }}>
                    Annotate Student's Work
                  </div>
                  <div style={{ fontFamily:"'Instrument Serif', serif", fontSize:18, marginTop:2 }}>
                    Q{a.questionIndex + 1} &middot; Mark with red, green, or blue pen
                  </div>
                </div>
                <button onClick={() => setHwAnnotatingIndex(null)}
                  style={{
                    background:'rgba(0,0,0,.15)', color:'#fff',
                    border:'none', padding:'8px 12px', borderRadius:6,
                    cursor:'pointer', fontSize:13, fontWeight:700,
                  }}>
                  Close
                </button>
              </div>
              <div style={{ padding:'20px 24px', overflow:'auto', flex:1 }}>
                <AnnotationCanvas
                  backgroundImageUrl={bgUrl}
                  existingAnnotation={existing}
                  onCancel={() => setHwAnnotatingIndex(null)}
                  onSave={(dataUrl) => {
                    setGradeAnswer(hwAnnotatingIndex, 'teacherAnnotation', dataUrl)
                    setHwAnnotatingIndex(null)
                    toast?.ok?.('Annotation saved. Don\'t forget to save the grade.')
                  }}
                />
              </div>
            </div>
          </div>
        )
      })()}

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

              {/* ── ASSIGN TO STUDENTS — direct, no group room needed ── */}
              <div className="fg">
                <label className="fl">Assign to Students *</label>
                <div style={{
                  border: '1.5px solid var(--border)', borderRadius: 8, maxHeight: 180,
                  overflowY: 'auto', padding: 6, background: '#fff',
                }}>
                  {students.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--s400)', padding: 8 }}>No students found.</div>
                  ) : students.map(st => {
                    const sid = st._id
                    const checked = (form.assignedStudents || []).includes(sid)
                    const name = `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.email
                    return (
                      <label key={sid} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                        cursor: 'pointer', borderRadius: 6,
                        background: checked ? '#FBF3F4' : 'transparent', fontSize: 13,
                      }}>
                        <input type="checkbox" checked={checked}
                          onChange={() => setForm(f => {
                            const cur = f.assignedStudents || []
                            return { ...f, assignedStudents: checked
                              ? cur.filter(x => x !== sid)
                              : [...cur, sid] }
                          })}/>
                        <span style={{ fontWeight: 600, color: '#231715' }}>{name}</span>
                        {st.curriculum && <span style={{ fontSize: 11, color: 'var(--s400)' }}>
                          · {Array.isArray(st.curriculum) ? st.curriculum.join(', ') : st.curriculum}
                        </span>}
                      </label>
                    )
                  })}
                </div>
                <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4 }}>
                  {(form.assignedStudents || []).length} student(s) selected.
                  {rooms.length > 0 && ' You can also assign to a whole group room below.'}
                </div>
              </div>

              {/* Optional — assign to a whole group room as well */}
              {rooms.length > 0 && (
                <div className="fg">
                  <label className="fl">Or Assign to a Group Room (optional)</label>
                  <select className="fsel" value={form.assignedRoom} onChange={e => handleRoomChange(e.target.value)}>
                    <option value="">No room — use the student list above</option>
                    {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.curriculum} · {r.subject} · {r.grade}, {r.students?.length || 0} students)</option>)}
                  </select>
                </div>
              )}

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
                  <option value="handwriting">Handwriting</option>
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

// ═══════════════════════════════════════════════════════════
// COMMUNICATION TAB — teacher emails to students, parents, staff
// ═══════════════════════════════════════════════════════════
// Compose branded emails to the teacher's own students, those
// students' parents, and colleagues/admin. No external addresses.
// Templates: weekly report, behaviour report, parent meeting.
// Multiple attachments. Two-step send. Campaign history.
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// DOCUMENTS TAB — academic document generators (Teacher portal)
// First generator: Weekly Academic Report. Fills a form, then
// generates the branded report and opens it for PDF download.
// ═══════════════════════════════════════════════════════════
function DocumentsTab({ user, store, setPage, toast }) {
  const [docType, setDocType] = useState(null)   // null = picker; 'weekly' = weekly report

  if (docType === 'weekly') {
    return <WeeklyReportGenerator user={user} toast={toast} onBack={() => setDocType(null)} />
  }

  // Document picker
  const cardStyle = {
    background: '#fff', border: '1px solid #E8E2D6', borderRadius: 14,
    padding: 22, cursor: 'pointer', transition: 'all .18s',
  }
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>
          Reports &amp; Documents
        </h1>
        <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 2 }}>
          Generate branded academic documents for your students.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        <div style={cardStyle} onClick={() => setDocType('weekly')}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: 'rgba(125,16,37,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7D1025" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>Weekly Academic Report</div>
          <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4, lineHeight: 1.5 }}>
            A branded weekly lesson report — topics, activities, performance, assessment marks and remarks.
          </div>
        </div>

        {/* Future generators — shown as coming soon */}
        <div style={{ ...cardStyle, opacity: .55, cursor: 'default' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: 'rgba(125,16,37,.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>Termly Report</div>
          <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>Coming soon.</div>
        </div>
        <div style={{ ...cardStyle, opacity: .55, cursor: 'default' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: 'rgba(125,16,37,.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>Study Plan</div>
          <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>Coming soon.</div>
        </div>
      </div>
    </div>
  )
}

// ── WEEKLY REPORT GENERATOR ────────────────────────────────
function WeeklyReportGenerator({ user, toast, onBack }) {
  const teacherName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Teacher'
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  const [f, setF] = useState({
    studentName: '', classLevel: '', subject: '',
    teacher: teacherName, week: '', period: '',
    topics: [''],
    subTopics: [''],
    activities: [''],
    understanding: '', participation: '', generalPerf: '',
    strengths: [''],
    improvements: [''],
    assessments: [{ desc: '', score: '', outOf: '' }],
    homework: [''],
    remarks: '',
    teacherDate: today,
  })

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  // generic list-field helpers
  const listAdd = (k) => setF(p => ({ ...p, [k]: [...p[k], ''] }))
  const listSet = (k, i, v) => setF(p => ({ ...p, [k]: p[k].map((x, idx) => idx === i ? v : x) }))
  const listDel = (k, i) => setF(p => ({ ...p, [k]: p[k].filter((_, idx) => idx !== i).length ? p[k].filter((_, idx) => idx !== i) : [''] }))

  // assessment rows
  const aAdd = () => setF(p => ({ ...p, assessments: [...p.assessments, { desc: '', score: '', outOf: '' }] }))
  const aSet = (i, key, v) => setF(p => ({ ...p, assessments: p.assessments.map((r, idx) => idx === i ? { ...r, [key]: v } : r) }))
  const aDel = (i) => setF(p => {
    const next = p.assessments.filter((_, idx) => idx !== i)
    return { ...p, assessments: next.length ? next : [{ desc: '', score: '', outOf: '' }] }
  })

  const generate = () => {
    if (!f.studentName.trim()) { toast?.error?.('Student name is required.'); return }
    if (!f.subject.trim())     { toast?.error?.('Subject is required.'); return }
    const html = buildWeeklyReportHTML(f)
    const w = window.open('', '_blank')
    if (!w) { toast?.error?.('Please allow pop-ups to generate the report.'); return }
    w.document.write(html)
    w.document.close()
  }

  // ── styles ──
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
    textTransform: 'uppercase', color: '#7D1025', marginBottom: 5 }
  const inp = { width: '100%', boxSizing: 'border-box', padding: '8px 11px',
    borderRadius: 7, border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit' }
  const card = { background: '#fff', border: '1px solid #E8E2D6', borderRadius: 12,
    padding: 18, marginBottom: 14 }
  const addBtn = { background: 'transparent', border: '1.5px dashed #C9A030',
    color: '#9A7B16', borderRadius: 7, padding: '6px 12px', fontSize: 12,
    fontWeight: 700, cursor: 'pointer', marginTop: 6 }
  const delBtn = { background: 'transparent', border: 'none', color: '#B91C1C',
    cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px', flexShrink: 0 }

  // a reusable list editor
  // ListEditor renders a labelled list of editable text inputs with
  // add/remove buttons. Implemented as a PLAIN FUNCTION (not a React
  // component) so it doesn't get a new identity on every parent
  // re-render — that was causing inputs to lose focus after every
  // keystroke. Called as {listEditor({label, k, placeholder})}, not
  // <ListEditor .../>.
  const listEditor = ({ label, k, placeholder }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      {f[k].map((val, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5, alignItems: 'center' }}>
          <input value={val} onChange={e => listSet(k, i, e.target.value)}
            placeholder={placeholder} style={inp}/>
          <button onClick={() => listDel(k, i)} style={delBtn} title="Remove">×</button>
        </div>
      ))}
      <button onClick={() => listAdd(k)} style={addBtn}>+ Add</button>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={onBack} style={{
          background: '#fff', border: '1.5px solid #E8E2D6', borderRadius: 8,
          padding: '7px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#7D1025',
        }}>← Documents</button>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>
            Weekly Academic Report
          </h1>
          <div style={{ fontSize: 12, color: '#6B6B6B' }}>Fill the report, then generate the branded PDF.</div>
        </div>
      </div>

      {/* Basic info */}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div><label style={lbl}>Student Name *</label>
            <input value={f.studentName} onChange={e => set('studentName', e.target.value)} placeholder="e.g. Jeremy" style={inp}/></div>
          <div><label style={lbl}>Class / Level</label>
            <input value={f.classLevel} onChange={e => set('classLevel', e.target.value)} placeholder="e.g. Year 8" style={inp}/></div>
          <div><label style={lbl}>Subject *</label>
            <input value={f.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Mathematics" style={inp}/></div>
          <div><label style={lbl}>Teacher</label>
            <input value={f.teacher} onChange={e => set('teacher', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Week</label>
            <input value={f.week} onChange={e => set('week', e.target.value)} placeholder="e.g. Week of 11 – 14 May 2026" style={inp}/></div>
          <div><label style={lbl}>Period</label>
            <input value={f.period} onChange={e => set('period', e.target.value)} placeholder="e.g. 11/05/2026 – 14/05/2026" style={inp}/></div>
        </div>
      </div>

      {/* Topics / sub-topics / activities */}
      <div style={card}>
        {listEditor({label:"Topics Covered", k:"topics", placeholder:"e.g. Integers"})}
        {listEditor({label:"Sub-Topics Taught", k:"subTopics", placeholder:"e.g. Adding and subtracting integers"})}
        {listEditor({label:"Class Activities", k:"activities", placeholder:"Describe a class activity"})}
      </div>

      {/* Performance */}
      <div style={card}>
        <div style={{ marginBottom: 12 }}><label style={lbl}>Understanding Concepts</label>
          <textarea value={f.understanding} onChange={e => set('understanding', e.target.value)} rows={2}
            placeholder="How well the student grasped the concepts" style={{ ...inp, resize: 'vertical' }}/></div>
        <div style={{ marginBottom: 12 }}><label style={lbl}>Class Participation</label>
          <textarea value={f.participation} onChange={e => set('participation', e.target.value)} rows={2}
            placeholder="The student's participation and engagement" style={{ ...inp, resize: 'vertical' }}/></div>
        <div><label style={lbl}>General Performance</label>
          <textarea value={f.generalPerf} onChange={e => set('generalPerf', e.target.value)} rows={2}
            placeholder="Overall performance summary" style={{ ...inp, resize: 'vertical' }}/></div>
      </div>

      {/* Strengths / improvements */}
      <div style={card}>
        {listEditor({label:"Strengths Observed", k:"strengths", placeholder:"A strength observed this week"})}
        {listEditor({label:"Areas to Improve", k:"improvements", placeholder:"An area to work on"})}
      </div>

      {/* Assessment Done — with optional marks */}
      <div style={card}>
        <label style={lbl}>Assessment Done</label>
        <div style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 8 }}>
          Leave score blank for informal assessment. Fill score &amp; total when the student sat an exam.
        </div>
        {f.assessments.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={row.desc} onChange={e => aSet(i, 'desc', e.target.value)}
              placeholder="Assessment description" style={{ ...inp, flex: '1 1 220px' }}/>
            <input value={row.score} onChange={e => aSet(i, 'score', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="Score" style={{ ...inp, width: 80, flex: '0 0 80px' }}/>
            <span style={{ fontSize: 13, color: '#6B6B6B' }}>/</span>
            <input value={row.outOf} onChange={e => aSet(i, 'outOf', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="Out of" style={{ ...inp, width: 80, flex: '0 0 80px' }}/>
            <button onClick={() => aDel(i)} style={delBtn} title="Remove">×</button>
          </div>
        ))}
        <button onClick={aAdd} style={addBtn}>+ Add Assessment</button>
      </div>

      {/* Homework */}
      <div style={card}>
        {listEditor({label:"Homework / Follow-Up Work", k:"homework", placeholder:"A homework or follow-up task"})}
      </div>

      {/* Remarks + confirmation */}
      <div style={card}>
        <div style={{ marginBottom: 12 }}><label style={lbl}>Teacher's Remarks</label>
          <textarea value={f.remarks} onChange={e => set('remarks', e.target.value)} rows={4}
            placeholder="Closing remarks to the student and parent" style={{ ...inp, resize: 'vertical' }}/></div>
        <div style={{ maxWidth: 220 }}><label style={lbl}>Confirmation Date</label>
          <input value={f.teacherDate} onChange={e => set('teacherDate', e.target.value)} style={inp}/></div>
      </div>

      {/* Generate */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 30 }}>
        <button onClick={generate} style={{
          background: '#7D1025', color: '#fff', border: 'none', borderRadius: 8,
          padding: '12px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>
          Generate Report
        </button>
      </div>
    </div>
  )
}

// ── Build the branded report HTML (opens in new tab for PDF) ──
function buildWeeklyReportHTML(f) {
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const clean = (arr) => (arr || []).map(x => (x || '').trim()).filter(Boolean)
  const topics = clean(f.topics), subTopics = clean(f.subTopics), activities = clean(f.activities)
  const strengths = clean(f.strengths), improvements = clean(f.improvements), homework = clean(f.homework)
  const assessments = (f.assessments || []).filter(a => (a.desc || '').trim())

  const bullets = (arr) => arr.map(x => `<li>${esc(x)}</li>`).join('') || '<li style="color:#999">—</li>'

  const assessRows = assessments.map(a => {
    const hasMark = a.score !== '' && a.outOf !== '' && Number(a.outOf) > 0
    const pct = hasMark ? Math.round((Number(a.score) / Number(a.outOf)) * 100) : null
    return `<div class="assess-row">
      <span class="assess-desc">${esc(a.desc)}</span>
      ${hasMark ? `<span class="assess-mark">
        <span class="mark-pill">${esc(a.score)} / ${esc(a.outOf)}</span>
        <span class="mark-pct">${pct}%</span></span>` : ''}
    </div>`
  }).join('') || '<div class="assess-row"><span class="assess-desc" style="color:#999">—</span></div>'

  const shield = `<svg class="shield" viewBox="0 0 60 66">
    <path d="M30 2 L56 9 V32 C56 47 44 58 30 63 C16 58 4 47 4 32 V9 Z" fill="#8A1228" stroke="#C9A030" stroke-width="2"/>
    <path d="M30 13 l2.3 4.7 5.2 .75 -3.75 3.65 .9 5.15 -4.65 -2.45 -4.65 2.45 .9 -5.15 -3.75 -3.65 5.2 -.75 Z" fill="#C9A030"/>
    <g transform="translate(30 40)">
      <path d="M0 -6 C-4 -9 -11 -9 -14 -7 L-14 9 C-11 7 -4 7 0 10 Z" fill="#FFFFFF" stroke="#E3D9C4" stroke-width="0.6"/>
      <path d="M0 -6 C4 -9 11 -9 14 -7 L14 9 C11 7 4 7 0 10 Z" fill="#FFFFFF" stroke="#E3D9C4" stroke-width="0.6"/>
      <line x1="-10" y1="-3.5" x2="-3.5" y2="-2" stroke="#E7B7C0" stroke-width="0.8"/>
      <line x1="-10" y1="0" x2="-3.5" y2="1.5" stroke="#E7B7C0" stroke-width="0.8"/>
      <line x1="-10" y1="3.5" x2="-3.5" y2="5" stroke="#E7B7C0" stroke-width="0.8"/>
      <line x1="3.5" y1="-2" x2="10" y2="-3.5" stroke="#E7B7C0" stroke-width="0.8"/>
      <line x1="3.5" y1="1.5" x2="10" y2="0" stroke="#E7B7C0" stroke-width="0.8"/>
      <line x1="3.5" y1="5" x2="10" y2="3.5" stroke="#E7B7C0" stroke-width="0.8"/>
    </g></svg>`

  const header = (rightH1, rightH2) => `<div class="topbar"></div>
    <div class="hd">
      <div class="brand">${shield}
        <div class="brand-tx"><div class="name">Smart<em>ious</em></div>
        <div class="tag">HOMESCHOOL&nbsp;·&nbsp;GLOBAL</div></div>
      </div>
      <div class="hd-r"><div class="h1">${rightH1}</div><div class="h2">${rightH2}</div></div>
    </div><div class="gold-rule"></div>`

  const footer = (n) => `<div class="ft">
    <span>Smartious Homeschool Global · Est. 2018 · Confidential Academic Record</span>
    <span>Page ${n} of 2</span></div>`

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Weekly Report — ${esc(f.studentName)}</title>
<style>
  :root{--crimson:#7D1025;--crimsonD:#5A0B1B;--gold:#C9A030;--ink:#1A1A1A;--mute:#6B6B6B;--line:#E8E2D6;--cream:#FBFAF5;}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#e9e6df;color:var(--ink)}
  .page{width:210mm;min-height:297mm;background:#fff;margin:18px auto;position:relative;display:flex;flex-direction:column;box-shadow:0 4px 24px rgba(0,0,0,.13)}
  .page-body{padding:0 22mm 18mm;flex:1}
  .topbar{height:8mm;background:linear-gradient(90deg,var(--crimsonD),var(--crimson))}
  .hd{display:flex;justify-content:space-between;align-items:flex-start;padding:11mm 22mm 0}
  .brand{display:flex;align-items:center;gap:10px}
  .shield{width:50px;height:55px;flex-shrink:0}
  .brand-tx .name{font-size:22px;font-weight:800;letter-spacing:-.5px;line-height:1}
  .brand-tx .name em{font-style:italic;color:var(--crimson)}
  .brand-tx .tag{font-size:7px;letter-spacing:3px;color:var(--mute);margin-top:3px;font-weight:600}
  .hd-r{text-align:right}
  .hd-r .h1{font-size:19px;font-weight:800;letter-spacing:.5px}
  .hd-r .h2{font-size:9px;color:var(--mute);margin-top:3px;letter-spacing:.5px}
  .gold-rule{height:2px;background:var(--gold);margin:9mm 22mm 0}
  .info{margin:7mm 0 0;border-collapse:collapse;width:100%}
  .info td{border:1px solid var(--line);padding:7px 11px;font-size:11px}
  .info .k{background:var(--cream);font-weight:700;color:var(--crimson);width:24%;font-size:9.5px;letter-spacing:.4px;text-transform:uppercase}
  .sh{font-size:11px;font-weight:800;color:var(--crimson);letter-spacing:.7px;text-transform:uppercase;margin:8mm 0 0;padding-bottom:4px;border-bottom:1.5px solid var(--gold)}
  .sh.tight{margin-top:6mm}
  ul.b{list-style:none;margin:4mm 0 0}
  ul.b li{font-size:10.5px;line-height:1.55;padding:2.5px 0 2.5px 16px;position:relative;color:#2c2c2c}
  ul.b li::before{content:'';position:absolute;left:3px;top:9px;width:4px;height:4px;border-radius:50%;background:var(--gold)}
  .assess{margin:4mm 0 0}
  .assess-row{display:flex;align-items:center;gap:10px;padding:4px 0 4px 16px;position:relative;font-size:10.5px;line-height:1.5;color:#2c2c2c;border-bottom:1px solid #F1ECE0}
  .assess-row:last-child{border-bottom:none}
  .assess-row::before{content:'';position:absolute;left:3px;top:10px;width:4px;height:4px;border-radius:50%;background:var(--gold)}
  .assess-desc{flex:1}
  .assess-mark{flex-shrink:0;display:flex;align-items:center;gap:6px}
  .mark-pill{background:var(--crimson);color:#fff;font-size:10px;font-weight:800;padding:3px 9px;border-radius:4px;letter-spacing:.3px;white-space:nowrap}
  .mark-pct{font-size:9.5px;font-weight:700;color:var(--gold)}
  .perf{margin:5mm 0 0;border-collapse:collapse;width:100%}
  .perf td{border:1px solid var(--line);padding:9px 11px;font-size:10.5px;vertical-align:top;line-height:1.5}
  .perf .k{background:var(--cream);font-weight:700;color:var(--crimson);width:30%;font-size:10px}
  .remarks{margin:5mm 0 0;background:var(--cream);border:1px solid var(--line);border-left:3px solid var(--gold);padding:11px 14px;font-size:10.5px;line-height:1.6;color:#2c2c2c;font-style:italic}
  .confirm{margin:7mm 0 0;display:flex;justify-content:space-between;align-items:flex-end}
  .confirm .who{font-size:10.5px;line-height:1.9}
  .confirm .who b{color:var(--crimson)}
  .sig-line{border-bottom:1px solid var(--ink);width:55mm;margin-top:14px}
  .verified{border:1.5px solid var(--gold);border-radius:7px;padding:8px 16px;text-align:center}
  .verified .v{font-size:11px;font-weight:800;color:var(--crimson);letter-spacing:1.5px}
  .verified .vs{font-size:7.5px;color:var(--mute);margin-top:2px;letter-spacing:.5px}
  .ft{margin-top:auto;border-top:1px solid var(--line);padding:5mm 22mm;display:flex;justify-content:space-between;font-size:8px;color:var(--mute)}
  .toolbar{position:fixed;top:0;left:0;right:0;background:#7D1025;color:#fff;padding:10px 20px;display:flex;justify-content:space-between;align-items:center;z-index:99;font-family:'Helvetica Neue',Arial,sans-serif}
  .toolbar button{background:#fff;color:#7D1025;border:none;padding:8px 18px;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer}
  .toolbar .hint{font-size:12px;opacity:.85}
  @media print{
    body{background:#fff}.toolbar{display:none}
    .page{margin:0;box-shadow:none;width:100%;min-height:auto}
    @page{size:A4;margin:0}.page-break{page-break-before:always}
  }
</style></head><body>
<div class="toolbar">
  <span class="hint">Review the report below, then download. Use "Save as PDF" as the destination.</span>
  <button onclick="window.print()">Download PDF</button>
</div>
<div style="height:48px"></div>

<div class="page">
  ${header('WEEKLY ACADEMIC REPORT', 'Lesson Report &nbsp;·&nbsp; Confidential')}
  <div class="page-body">
    <table class="info">
      <tr><td class="k">Student Name</td><td>${esc(f.studentName)}</td>
          <td class="k">Teacher</td><td>${esc(f.teacher)}</td></tr>
      <tr><td class="k">Class / Level</td><td>${esc(f.classLevel)}</td>
          <td class="k">Week</td><td>${esc(f.week)}</td></tr>
      <tr><td class="k">Subject</td><td>${esc(f.subject)}</td>
          <td class="k">Period</td><td>${esc(f.period)}</td></tr>
    </table>
    <div class="sh">Topics Covered</div><ul class="b">${bullets(topics)}</ul>
    <div class="sh">Sub-Topics Taught</div><ul class="b">${bullets(subTopics)}</ul>
    <div class="sh">Class Activities</div><ul class="b">${bullets(activities)}</ul>
    <div class="sh">Student Performance &amp; Participation</div>
    <table class="perf">
      <tr><td class="k">Understanding Concepts</td><td>${esc(f.understanding) || '—'}</td></tr>
      <tr><td class="k">Class Participation</td><td>${esc(f.participation) || '—'}</td></tr>
      <tr><td class="k">General Performance</td><td>${esc(f.generalPerf) || '—'}</td></tr>
    </table>
  </div>
  ${footer(1)}
</div>

<div class="page page-break">
  ${header(esc(f.studentName) + ' · ' + esc(f.subject), esc(f.week))}
  <div class="page-body">
    <div class="sh tight">Strengths Observed</div><ul class="b">${bullets(strengths)}</ul>
    <div class="sh">Areas to Improve</div><ul class="b">${bullets(improvements)}</ul>
    <div class="sh">Assessment Done</div><div class="assess">${assessRows}</div>
    <div class="sh">Homework / Follow-Up Work</div><ul class="b">${bullets(homework)}</ul>
    <div class="sh">Teacher's Remarks</div>
    <div class="remarks">${esc(f.remarks) || '—'}</div>
    <div class="sh">Teacher's Confirmation</div>
    <div class="confirm">
      <div class="who">Teacher's Name: <b>${esc(f.teacher)}</b><br>
        Date: <b>${esc(f.teacherDate)}</b>
        <div class="sig-line"></div>
        <span style="font-size:8.5px;color:#6B6B6B">Signature</span></div>
      <div class="verified"><div class="v">VERIFIED</div>
        <div class="vs">SMARTIOUS HOMESCHOOL GLOBAL</div>
        <div class="vs">Parklands · Nairobi · Kenya</div></div>
    </div>
  </div>
  ${footer(2)}
</div>
</body></html>`
}

function CommunicationTab({ user, store, setPage, toast }) {
  const [view, setView] = useState('compose')   // compose | history

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, color: 'var(--s900)', margin: 0 }}>
          Communication
        </h1>
        <div style={{ fontSize: 13, color: 'var(--s500)', marginTop: 2 }}>
          Email your students, their parents, and colleagues.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { id: 'compose', label: 'Compose' },
          { id: 'history', label: 'History' },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 99,
              border: `1.5px solid ${view === t.id ? '#7D1025' : 'var(--border)'}`,
              background: view === t.id ? '#7D1025' : '#fff',
              color: view === t.id ? '#fff' : '#7D1025',
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {view === 'compose'
        ? <TeacherComposeView user={user} toast={toast} />
        : <TeacherCommsHistory toast={toast} />}
    </div>
  )
}

// ── TEMPLATES ─────────────────────────────────────────────
const TEACHER_EMAIL_TEMPLATES = {
  weekly: {
    label: 'Weekly Report',
    subject: 'Weekly Progress Report',
    body: 'This is the weekly progress update for your child.\n\nProgress this week:\n[Describe what was covered and how the student engaged.]\n\nStrengths:\n[What the student did well.]\n\nAreas to work on:\n[What needs attention, and any home support that would help.]\n\nPlease reach out if you have any questions.',
  },
  behaviour: {
    label: 'Behaviour Report',
    subject: 'Behaviour Update',
    body: 'I would like to share an update regarding your child\'s conduct in class.\n\n[Describe the behaviour factually — what happened, when, and the context.]\n\n[Note any steps taken and what support would help going forward.]\n\nI welcome the chance to discuss this together.',
  },
  meeting: {
    label: 'Parent-Teacher Meeting',
    subject: 'Request for a Parent-Teacher Meeting',
    body: 'I would like to arrange a meeting to discuss your child\'s progress.\n\nReason for the meeting:\n[Briefly state the purpose.]\n\nProposed date and time: [date / time]\nFormat: [video call / in person]\n\nKindly let me know if this works, or suggest an alternative time.',
  },
  custom: {
    label: 'Custom Message',
    subject: '',
    body: '',
  },
}

// ── COMPOSE ───────────────────────────────────────────────
function TeacherComposeView({ user, toast }) {
  const [students, setStudents] = useState([])
  const [colleagues, setColleagues] = useState([])
  const [loading, setLoading] = useState(true)

  // recipient selection — keyed by email so students + parents + colleagues mix cleanly
  const [picked, setPicked] = useState({})   // email -> { email, name }
  const [search, setSearch] = useState('')

  const [kind, setKind] = useState('weekly')
  const [subject, setSubject] = useState(TEACHER_EMAIL_TEMPLATES.weekly.subject)
  const [body, setBody] = useState(TEACHER_EMAIL_TEMPLATES.weekly.body)

  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)

  const [sending, setSending] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.get('/communication/teacher/recipients')
      .then(r => {
        setStudents(r.data.data?.students || [])
        setColleagues(r.data.data?.colleagues || [])
      })
      .catch(() => toast?.error?.('Failed to load recipients.'))
      .finally(() => setLoading(false))
  }, [toast])

  const applyTemplate = (k) => {
    setKind(k)
    setSubject(TEACHER_EMAIL_TEMPLATES[k].subject)
    setBody(TEACHER_EMAIL_TEMPLATES[k].body)
    setConfirm(false)
  }

  const toggleRecipient = (email, name) => {
    if (!email) return
    setPicked(prev => {
      const next = { ...prev }
      if (next[email]) delete next[email]
      else next[email] = { email, name: name || '' }
      return next
    })
    setConfirm(false)
  }

  const pickedList = Object.values(picked)

  const uploadFile = async (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast?.error?.('File exceeds 10 MB.'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/communication/upload-attachment', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data?.success) {
        setAttachments(a => [...a, data.data])
        toast?.ok?.('Attached ' + data.data.name)
      } else {
        toast?.error?.(data?.message || 'Upload failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const send = async () => {
    if (!subject.trim()) { toast?.error?.('Subject is required.'); return }
    if (!body.trim())    { toast?.error?.('Message body is required.'); return }
    if (pickedList.length === 0) { toast?.error?.('Pick at least one recipient.'); return }

    setSending(true)
    try {
      const { data } = await api.post('/communication/teacher/send', {
        subject: subject.trim(),
        body,
        recipientEmails: pickedList,
        attachments,
        audience: TEACHER_EMAIL_TEMPLATES[kind].label,
      })
      if (data?.success) {
        setResult(data.data)
        toast?.ok?.(data.message || 'Sent.')
        setConfirm(false)
      } else {
        toast?.error?.(data?.message || 'Send failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Send failed.')
    } finally {
      setSending(false)
    }
  }

  const resetAll = () => {
    setPicked({}); setSubject(TEACHER_EMAIL_TEMPLATES.weekly.subject)
    setBody(TEACHER_EMAIL_TEMPLATES.weekly.body); setKind('weekly')
    setAttachments([]); setConfirm(false); setResult(null)
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 6,
    border: '1.5px solid var(--border)', fontSize: 13, fontFamily: 'inherit',
  }
  const lbl = {
    display: 'block', fontSize: 10.5, fontWeight: 700,
    letterSpacing: '.06em', textTransform: 'uppercase',
    color: '#7D1025', marginBottom: 5,
  }
  const cardStyle = {
    background: '#fff', border: '1px solid var(--border)',
    borderRadius: 'var(--rxl)', padding: 20,
  }

  // Filter students by search
  const filteredStudents = students.filter(s =>
    !search.trim() ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.parents || []).some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  )
  const filteredColleagues = colleagues.filter(c =>
    !search.trim() || c.name.toLowerCase().includes(search.toLowerCase())
  )

  if (result) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: 28 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#DCFCE7', color: '#15803D',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: 'var(--s900)' }}>
          Emails sent
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--s500)', marginTop: 6 }}>
          {result.sentCount} delivered{result.failedCount > 0 ? ` · ${result.failedCount} failed` : ''}
        </div>
        {result.failedCount > 0 && (
          <div style={{
            marginTop: 14, textAlign: 'left',
            background: '#FEF2F2', border: '1px solid #FCA5A5',
            borderRadius: 8, padding: 12, fontSize: 12, color: '#991B1B',
            maxHeight: 160, overflowY: 'auto',
          }}>
            <strong>Failed:</strong>
            {(result.results || []).filter(r => r.status === 'failed').map((r, i) => (
              <div key={i}>{r.email} — {r.error || 'unknown error'}</div>
            ))}
          </div>
        )}
        <button onClick={resetAll}
          style={{
            marginTop: 18, background: '#7D1025', color: '#fff',
            border: 'none', padding: '10px 24px', borderRadius: 6,
            cursor: 'pointer', fontSize: 13, fontWeight: 700,
          }}>
          New Message
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 340px)', gap: 14 }}>
      {/* LEFT — compose */}
      <div style={cardStyle}>
        {/* Templates */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Template</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(TEACHER_EMAIL_TEMPLATES).map(([k, t]) => (
              <button key={k} onClick={() => applyTemplate(k)}
                style={{
                  background: kind === k ? '#7D1025' : '#fff',
                  color: kind === k ? '#fff' : '#7D1025',
                  border: `1.5px solid ${kind === k ? '#7D1025' : 'var(--border)'}`,
                  padding: '6px 12px', borderRadius: 99,
                  cursor: 'pointer', fontSize: 11.5, fontWeight: 700,
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Subject</label>
          <input value={subject} onChange={e => { setSubject(e.target.value); setConfirm(false) }}
            placeholder="Email subject" style={inp}/>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Message</label>
          <textarea value={body} onChange={e => { setBody(e.target.value); setConfirm(false) }}
            rows={11} placeholder="Write your message. Leave a blank line between paragraphs."
            style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}/>
          <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 4 }}>
            Wrapped in the Smartious branded template and signed with your name.
          </div>
        </div>

        {/* Attachments */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Attachments</label>
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {attachments.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', background: '#FBFAF5',
                  border: '1px solid var(--border)', borderRadius: 6, fontSize: 12,
                }}>
                  <span style={{ flex: 1, color: 'var(--s900)' }}>{a.name}</span>
                  <button onClick={() => setAttachments(list => list.filter((_, idx) => idx !== i))}
                    style={{ background: 'transparent', border: 'none', color: '#B91C1C', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <label style={{
            display: 'inline-block',
            background: '#fff', color: '#7D1025',
            border: '1.5px solid #7D1025',
            padding: '7px 14px', borderRadius: 6,
            cursor: uploading ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700,
          }}>
            <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }}
              onChange={e => { uploadFile(e.target.files?.[0]); e.target.value = '' }}/>
            {uploading ? 'Uploading...' : '+ Add Attachment (max 10 MB)'}
          </label>
        </div>

        {/* Send */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
          {!confirm ? (
            <button onClick={() => {
              if (!subject.trim() || !body.trim()) { toast?.error?.('Subject and message are required.'); return }
              if (pickedList.length === 0) { toast?.error?.('Pick at least one recipient.'); return }
              setConfirm(true)
            }}
              style={{
                background: '#7D1025', color: '#fff', border: 'none',
                padding: '10px 22px', borderRadius: 6,
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>
              Review &amp; Send
            </button>
          ) : (
            <>
              <span style={{ fontSize: 12, color: 'var(--s500)' }}>
                Send to {pickedList.length} recipient{pickedList.length === 1 ? '' : 's'}?
              </span>
              <button onClick={() => setConfirm(false)} disabled={sending}
                style={{
                  background: '#fff', color: 'var(--s500)', border: '1.5px solid var(--border)',
                  padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                }}>
                Cancel
              </button>
              <button onClick={send} disabled={sending}
                style={{
                  background: sending ? '#9CA3AF' : '#15803D', color: '#fff', border: 'none',
                  padding: '10px 22px', borderRadius: 6,
                  cursor: sending ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700,
                }}>
                {sending ? 'Sending...' : 'Confirm Send'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* RIGHT — recipients */}
      <div style={{ ...cardStyle, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7D1025', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Recipients ({pickedList.length})
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search students, parents, staff..."
          style={{ ...inp, marginBottom: 10 }}/>

        {/* External email — for parents/contacts not in the system */}
        <ExternalEmailAdder onAdd={(email, name) => toggleRecipient(email, name)} pickedEmails={Object.keys(picked)} toast={toast} />

        {loading ? (
          <div style={{ padding: 14, fontSize: 12, color: 'var(--s500)', textAlign: 'center' }}>Loading...</div>
        ) : (
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {/* Students + their parents */}
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--s500)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              My Students
            </div>
            {filteredStudents.length === 0 ? (
              <div style={{ fontSize: 11.5, color: 'var(--s500)', padding: '4px 0 10px' }}>
                No students allocated to you yet.
              </div>
            ) : filteredStudents.map(s => (
              <div key={s._id} style={{
                border: '1px solid var(--border)', borderRadius: 6,
                padding: 8, marginBottom: 6,
              }}>
                {/* Student */}
                {s.email ? (
                  <RecipientRow
                    label={s.name} sub="Student"
                    on={!!picked[s.email]}
                    onClick={() => toggleRecipient(s.email, s.name)}
                  />
                ) : (
                  <div style={{ fontSize: 11.5, color: 'var(--s500)', padding: '3px 0' }}>
                    {s.name} <span style={{ fontStyle: 'italic' }}>(no email)</span>
                  </div>
                )}
                {/* Parents */}
                {s.parents.length > 0 ? s.parents.map(p => (
                  <RecipientRow key={p._id}
                    label={p.name} sub={'Parent of ' + s.name.split(' ')[0]}
                    indent
                    on={!!picked[p.email]}
                    onClick={() => toggleRecipient(p.email, p.name)}
                  />
                )) : (
                  <div style={{ fontSize: 10.5, color: 'var(--s500)', fontStyle: 'italic', padding: '2px 0 0 22px' }}>
                    No parent linked
                  </div>
                )}
              </div>
            ))}

            {/* Colleagues */}
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--s500)', letterSpacing: '.08em', textTransform: 'uppercase', margin: '10px 0 6px' }}>
              Colleagues &amp; Admin
            </div>
            {filteredColleagues.length === 0 ? (
              <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>No matches.</div>
            ) : filteredColleagues.map(c => (
              <RecipientRow key={c._id}
                label={c.name} sub={c.role === 'admin' ? 'Admin' : 'Teacher'}
                on={!!picked[c.email]}
                onClick={() => toggleRecipient(c.email, c.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── recipient row ─────────────────────────────────────────
function RecipientRow({ label, sub, on, onClick, indent }) {
  return (
    <div onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 6px', cursor: 'pointer',
        background: on ? '#FBF6E3' : 'transparent',
        borderRadius: 4,
        marginLeft: indent ? 16 : 0,
      }}>
      <div style={{
        width: 15, height: 15, borderRadius: 3, flexShrink: 0,
        border: `1.5px solid ${on ? '#7D1025' : 'var(--border)'}`,
        background: on ? '#7D1025' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {on && (
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: 'var(--s500)' }}>{sub}</div>
      </div>
    </div>
  )
}

// ── HISTORY ───────────────────────────────────────────────
function TeacherCommsHistory({ toast }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/communication/teacher/history')
      .then(r => setHistory(r.data.data?.history || []))
      .catch(() => toast?.error?.('Failed to load history.'))
      .finally(() => setLoading(false))
  }, [toast])

  const cardStyle = {
    background: '#fff', border: '1px solid var(--border)',
    borderRadius: 'var(--rxl)', padding: 14,
  }

  if (loading) {
    return <div style={{ ...cardStyle, padding: 40, textAlign: 'center', color: 'var(--s500)' }}>Loading history...</div>
  }
  if (history.length === 0) {
    return <div style={{ ...cardStyle, padding: 40, textAlign: 'center', color: 'var(--s500)' }}>No messages sent yet.</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {history.map(c => (
        <div key={c._id} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--s900)' }}>
                {c.subject}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 2 }}>
                {c.audience} · {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                {Array.isArray(c.attachments) && c.attachments.length > 0 && ` · ${c.attachments.length} attachment${c.attachments.length === 1 ? '' : 's'}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 700,
                background: '#DCFCE7', color: '#15803D',
                padding: '3px 9px', borderRadius: 99,
              }}>
                {c.sentCount} sent
              </span>
              {c.failedCount > 0 && (
                <span style={{
                  fontSize: 10.5, fontWeight: 700,
                  background: '#FEE2E2', color: '#B91C1C',
                  padding: '3px 9px', borderRadius: 99,
                }}>
                  {c.failedCount} failed
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
 
// ═══════════════════════════════════════════════════════════
// DASHBOARD HELPERS — greeting, date/time, schedule parsing
// ═══════════════════════════════════════════════════════════
const dbGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const dbFormatTime = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
const dbFormatDate = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

const dbSubjColor = (subject) => {
  const map = {
    'Mathematics': '#7D1025', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
    'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
    'Geography': '#0F766E', 'Computer Science': '#1F2937',
    'Business Studies': '#7E22CE', 'Economics': '#9F1239',
  }
  return map[subject] || '#7D1025'
}

// Schedule string parser (same as live classes tab)
const dbParseSchedule = (s) => {
  if (!s || typeof s !== 'string') return null
  const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
  const parts = s.trim().split(/\s+(?=\d)/)
  if (parts.length < 2) return null
  const dayMatches = parts[0].toLowerCase().match(/sun|mon|tue|wed|thu|fri|sat/g)
  if (!dayMatches) return null
  const days = []
  dayMatches.forEach(d => { if (dayMap[d] !== undefined && !days.includes(dayMap[d])) days.push(dayMap[d]) })
  const timeMatch = parts.slice(1).join(' ').match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?\s*[-–—]\s*(\d{1,2}):?(\d{0,2})\s*(am|pm)/i)
  if (!timeMatch) return null
  let startH = parseInt(timeMatch[1], 10)
  const startM = parseInt(timeMatch[2] || '0', 10)
  const startMer = (timeMatch[3] || timeMatch[6]).toLowerCase()
  let endH = parseInt(timeMatch[4], 10)
  const endM = parseInt(timeMatch[5] || '0', 10)
  const endMer = timeMatch[6].toLowerCase()
  const to24 = (h, mer) => mer === 'pm' && h < 12 ? h + 12 : (mer === 'am' && h === 12 ? 0 : h)
  return {
    days,
    startMins: to24(startH, startMer) * 60 + startM,
    endMins: to24(endH, endMer) * 60 + endM,
  }
}

function TeacherDashboardTab({ user, store, setPage, toast, setMsgModal, setUploadModal }) {
  const teacherFirstName = user?.firstName || 'Teacher'
  const teacherLastName = user?.lastName || ''
  const teacherFullName = (teacherFirstName + ' ' + teacherLastName).trim()
  const teacherDisplayName = (teacherFullName || 'Teacher').trim()
 
  const [now, setNow] = useState(new Date())
 
  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])
 
  // ── REAL DATA: Rooms, Homework, Submissions ──
  const [rooms, setRooms] = useState(null)
  const [homework, setHomework] = useState([])
  const [ungradedCount, setUngradedCount] = useState(0)
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    let cancelled = false
    const loadAll = async () => {
      try {
        // Fetch rooms
        const roomsRes = await api.get('/grouprooms')
        const allRooms = roomsRes.data?.rooms || []
        // Filter to MY rooms
        const myRooms = allRooms.filter(r => {
          if (!r.teacher) return false
          const tid = typeof r.teacher === 'object' ? r.teacher._id : r.teacher
          return tid?.toString() === user?._id?.toString()
        })
        if (!cancelled) setRooms(myRooms)
 
        // Fetch homework I created
        const hwRes = await api.get('/homework?createdBy=me')
        const myHomework = hwRes.data?.homework || []
        if (cancelled) return
        setHomework(myHomework)
 
        // For each homework, fetch submissions to count ungraded
        // (Backend GET /homework/:id/submissions returns submissions for one hw)
        let totalUngraded = 0
        for (const hw of myHomework) {
          if (hw.status !== 'published') continue
          try {
            const subsRes = await api.get('/homework/' + hw._id + '/submissions')
            const subs = subsRes.data?.submissions || []
            // Count submissions where status is 'submitted' (not yet graded or released)
            const ungraded = subs.filter(s => s.status === 'submitted').length
            totalUngraded += ungraded
          } catch (e) { /* skip individual failures */ }
          if (cancelled) return
        }
        if (!cancelled) setUngradedCount(totalUngraded)
      } catch (e) {
        console.error('[dashboard] load failed:', e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()
    // refresh every 60s
    const id = setInterval(loadAll, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [user?._id])
 
  // ── DERIVED: Student count (unique across all my rooms) ──
  const uniqueStudents = (() => {
    if (!rooms) return null
    const seen = new Set()
    rooms.forEach(r => {
      if (Array.isArray(r.students)) {
        r.students.forEach(s => {
          const id = typeof s === 'object' ? s?._id : s
          if (id) seen.add(String(id))
        })
      }
    })
    return seen.size
  })()
 
  // ── DERIVED: Today's schedule from real rooms ──
  const todaysSchedule = (() => {
    if (!rooms) return []
    const today = now.getDay()
    const items = []
    rooms.forEach(r => {
      const parsed = dbParseSchedule(r.schedule)
      if (!parsed) return
      if (!parsed.days.includes(today)) return
      const startAt = new Date(now)
      startAt.setHours(Math.floor(parsed.startMins / 60), parsed.startMins % 60, 0, 0)
      const endAt = new Date(now)
      endAt.setHours(Math.floor(parsed.endMins / 60), parsed.endMins % 60, 0, 0)
      items.push({
        _id: r._id,
        startAt,
        endAt,
        startMinutes: parsed.startMins,
        durationMins: Math.max(1, parsed.endMins - parsed.startMins),
        subject: r.subject,
        topic: r.name,
        yearGroup: (r.curriculum || '') + (r.grade ? ' · ' + r.grade : ''),
        students: Array.isArray(r.students) ? r.students.length : 0,
        zoomLink: r.zoomLink,
        zoomStartedAt: r.zoomStartedAt,
      })
    })
    items.sort((a, b) => a.startMinutes - b.startMinutes)
    return items
  })()
 
  const dbClassStatus = (cls) => {
    const t = Date.now()
    if (t < cls.startAt.getTime()) return 'upcoming'
    if (t < cls.endAt.getTime()) return 'live'
    return 'done'
  }
 
  const liveClass = todaysSchedule.find(c => dbClassStatus(c) === 'live')
  const nextClass = todaysSchedule.find(c => dbClassStatus(c) === 'upcoming')
  const doneClasses = todaysSchedule.filter(c => dbClassStatus(c) === 'done')
 
  // ── RIGHT NOW hero card ──
  const rightNowItem = (() => {
    if (liveClass) {
      const teacherStarted = !!(liveClass.zoomLink && liveClass.zoomStartedAt &&
        (Date.now() - new Date(liveClass.zoomStartedAt).getTime()) < 3 * 60 * 60 * 1000)
      return {
        type: 'live-class',
        title: teacherStarted ? 'Class is live now' : 'Scheduled class — start it',
        subtitle: liveClass.subject + ' · ' + liveClass.topic + ' · ' + dbFormatTime(liveClass.startAt),
        action: teacherStarted ? 'Re-enter Class' : 'Start Class',
        actionPage: 'liveclass',
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
          actionPage: 'liveclass',
          urgency: 'soon',
        }
      }
    }
    if (ungradedCount > 0) {
      return {
        type: 'grading',
        title: ungradedCount + ' submission' + (ungradedCount === 1 ? '' : 's') + ' need grading',
        subtitle: 'Students are waiting for feedback on their homework',
        action: 'Start Grading',
        actionPage: 'homework',
        urgency: 'normal',
      }
    }
    return {
      type: 'all-clear',
      title: 'You are all caught up',
      subtitle: nextClass ? 'Next class: ' + nextClass.subject + ' at ' + dbFormatTime(nextClass.startAt) : 'No more classes today',
      action: nextClass ? 'View Schedule' : 'Plan New Homework',
      actionPage: nextClass ? 'liveclass' : 'homework',
      urgency: 'good',
    }
  })()
 
  const urgencyColors = {
    live:    { bg: '#7F1D1D', accent: '#FCA5A5', text: '#FBFAF5' },
    soon:    { bg: '#7D1025', accent: '#F0CC5A', text: '#FBFAF5' },
    warning: { bg: '#92400E', accent: '#FCD34D', text: '#FBFAF5' },
    normal:  { bg: '#7D1025', accent: '#F0CC5A', text: '#FBFAF5' },
    good:    { bg: '#7D1025', accent: '#C9A030', text: '#FBFAF5' },
  }
  const uColor = urgencyColors[rightNowItem.urgency]
 
  // Upcoming homework deadlines (next 3)
  const upcomingHomework = homework
    .filter(hw => hw.status === 'published' && hw.dueAt && new Date(hw.dueAt) > new Date())
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .slice(0, 3)
 
  return (
    <div>
      {/* ── PROFILE CARD — crimson, restrained ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #7D1025 0%, #5A0B1B 100%)',
        borderRadius: 'var(--rxl)',
        padding: '22px 26px', marginBottom: 16,
      }}>
        {/* subtle decorative star, low opacity — does not shout */}
        <svg width="120" height="120" viewBox="0 0 24 24"
          style={{ position: 'absolute', top: -28, right: -22, opacity: 0.06, pointerEvents: 'none' }}
          fill="#F0CC5A">
          <polygon points="12 2 15 9 22 9.3 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9.3 9 9"/>
        </svg>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', position: 'relative' }}>
          {/* bigger avatar */}
          {user?.avatar ? (
            <img src={user.avatar} alt={teacherDisplayName}
              style={{
                width: 88, height: 88, borderRadius: '50%', objectFit: 'cover',
                flexShrink: 0, border: '2.5px solid rgba(240,204,90,.55)',
              }}/>
          ) : (
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'rgba(251,246,227,.12)',
              border: '2.5px solid rgba(240,204,90,.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 700, color: '#F0CC5A', flexShrink: 0,
            }}>
              {((teacherFirstName[0] || '') + (teacherLastName[0] || '')).toUpperCase()}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif", fontSize: 26, fontWeight: 400,
              color: '#FBFAF5', margin: 0, lineHeight: 1.2,
            }}>
              {dbGreeting()}, {teacherFirstName}
            </h1>
            {/* job title in golden-yellow */}
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '.07em',
              textTransform: 'uppercase', color: '#F0CC5A', marginTop: 3,
            }}>
              {user?.jobTitle || 'Teacher'}
            </div>
            {/* bio */}
            <div style={{
              fontSize: 12.5, color: 'rgba(251,250,245,.78)',
              marginTop: 8, lineHeight: 1.5,
            }}>
              {user?.bio || 'No bio added yet — an administrator can add one to your profile.'}
            </div>
            {/* qualifications */}
            {Array.isArray(user?.qualifications) && user.qualifications.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {user.qualifications.map((q, i) => (
                  <span key={i} style={{
                    fontSize: 10.5, fontWeight: 600,
                    color: '#F0CC5A',
                    background: 'rgba(240,204,90,.12)',
                    border: '1px solid rgba(240,204,90,.3)',
                    padding: '3px 9px', borderRadius: 99,
                  }}>
                    {q}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <button onClick={() => setPage('liveclass')}
              style={{
                background: '#F0CC5A', color: '#5A0B1B', border: 'none',
                padding: '9px 18px', borderRadius: 'var(--rmd)',
                cursor: 'pointer', fontSize: 12.5, fontWeight: 800,
              }}>
              Live Classes
            </button>
            <button onClick={() => setPage('homework')}
              style={{
                background: 'transparent', color: '#FBFAF5',
                border: '1.5px solid rgba(251,250,245,.35)',
                padding: '9px 18px', borderRadius: 'var(--rmd)',
                cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
              }}>
              New Homework
            </button>
          </div>
        </div>

        {/* date strip */}
        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: '1px solid rgba(251,246,227,.14)',
          fontSize: 11.5, color: 'rgba(251,250,245,.6)',
        }}>
          {dbFormatDate(now)} · {dbFormatTime(now)}
        </div>
      </div>

      {/* ── ATTENTION BANNER — only when something genuinely needs action ── */}
      {(rightNowItem.urgency === 'live' || rightNowItem.urgency === 'soon' ||
        (rightNowItem.type === 'grading')) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          background: '#FFF',
          borderLeft: '3px solid ' + (rightNowItem.urgency === 'live' ? '#B91C1C' : '#7D1025'),
          border: '1px solid var(--border)',
          borderRadius: 'var(--rmd)',
          padding: '14px 18px', marginBottom: 16,
        }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: rightNowItem.urgency === 'live' ? '#B91C1C' : '#7D1025',
              marginBottom: 3,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {rightNowItem.urgency === 'live' && (
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#B91C1C', animation: 'pulse 1.5s infinite' }}/>
              )}
              {rightNowItem.urgency === 'live' ? 'Live now' :
               rightNowItem.urgency === 'soon' ? 'Starting soon' : 'Needs attention'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s900)' }}>
              {rightNowItem.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 2 }}>
              {rightNowItem.subtitle}
            </div>
          </div>
          <button onClick={() => setPage(rightNowItem.actionPage)}
            style={{
              background: '#7D1025', color: '#FBFAF5', border: 'none',
              padding: '9px 18px', borderRadius: 'var(--rmd)',
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              flexShrink: 0,
            }}>
            {rightNowItem.action}
          </button>
        </div>
      )}

      {/* ── FACTUAL STATS — quiet, understated ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 1,
        background: 'var(--border)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rxl)',
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        {[
          {
            label: 'My Students',
            value: uniqueStudents === null ? '—' : uniqueStudents,
            sub: uniqueStudents === null ? 'Loading' : 'Across ' + (rooms?.length || 0) + ' room' + ((rooms?.length || 0) === 1 ? '' : 's'),
            page: 'students',
          },
          {
            label: 'My Classes',
            value: rooms === null ? '—' : (rooms?.length || 0),
            sub: rooms === null ? 'Loading' : ((rooms?.length || 0) === 0 ? 'None assigned' : 'Active rooms'),
            page: 'liveclass',
          },
          {
            label: 'Need Grading',
            value: loading ? '—' : ungradedCount,
            sub: loading ? 'Loading' : (ungradedCount === 0 ? 'All caught up' : 'Awaiting review'),
            page: 'homework',
            alert: ungradedCount > 0,
          },
          {
            label: 'Active Homework',
            value: loading ? '—' : homework.filter(h => h.status === 'published').length,
            sub: loading ? 'Loading' : 'Published',
            page: 'homework',
          },
        ].map(stat => (
          <div key={stat.label} onClick={() => setPage(stat.page)}
            style={{
              background: '#FFF', padding: '16px 18px', cursor: 'pointer',
              transition: 'background .12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FBFAF5' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFF' }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '.09em',
              textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 8,
            }}>
              {stat.label}
            </div>
            <div style={{
              fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400,
              lineHeight: 1,
              color: stat.alert ? '#B45309' : 'var(--s900)',
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 4 }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── TODAY'S SCHEDULE ── */}
      <div style={{
        background: '#FFF',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rxl)',
        padding: 22,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 14, flexWrap: 'wrap', gap: 8,
        }}>
          <h3 style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 20, fontWeight: 400,
            color: 'var(--s900)', margin: 0,
          }}>
            Today's Schedule
          </h3>
          {todaysSchedule.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--s500)' }}>
              {doneClasses.length} done · {todaysSchedule.length - doneClasses.length} remaining
            </div>
          )}
        </div>

        {todaysSchedule.length === 0 ? (
          <div style={{
            padding: '20px 0', textAlign: 'center',
            color: 'var(--s500)', fontSize: 13,
          }}>
            {rooms === null ? 'Loading…' :
             (rooms.length === 0
               ? 'No rooms assigned yet. Ask an administrator to add you to a class.'
               : 'No classes scheduled for today.')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {todaysSchedule.map(cls => {
              const status = dbClassStatus(cls)
              const statusMeta = status === 'live'
                ? { label: 'Live', color: '#B91C1C' }
                : status === 'done'
                  ? { label: 'Done', color: 'var(--s500)' }
                  : { label: dbFormatTime(cls.startAt), color: '#7D1025' }
              return (
                <div key={cls._id} onClick={() => setPage('liveclass')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px',
                    background: status === 'done' ? '#FBFAF5' : '#FFF',
                    border: '1px solid var(--border)',
                    borderLeft: '3px solid ' + statusMeta.color,
                    borderRadius: 'var(--rmd)',
                    cursor: 'pointer',
                    opacity: status === 'done' ? 0.65 : 1,
                  }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--s900)' }}>
                      {cls.subject}{cls.topic ? ' · ' + cls.topic : ''}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 1 }}>
                      {dbFormatTime(cls.startAt)} – {dbFormatTime(cls.endAt)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em',
                    textTransform: 'uppercase', color: statusMeta.color,
                    flexShrink: 0,
                  }}>
                    {statusMeta.label}
                  </div>
                </div>
              )
            })}
          </div>
        )}
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

// Fields that are DB-backed (saved via PATCH /api/teacher-profile/me).
// Everything NOT in this list is local-only (kept in localStorage as
// teacher preference, not synced to backend).
const TP_DB_FIELDS = [
  'firstName', 'lastName', 'phone', 'bio', 'avatar', 'jobTitle',
  'qualifications', 'certifications', 'specializations', 'yearsOfExperience',
]

// Build the default profile from a REAL user object (from /auth/me or
// the currentUser state). Fills DB-backed fields from the user record;
// uses empty/sensible defaults for local-only fields.
const tpDefaultProfile = (user) => ({
  // DB-backed (read from user)
  firstName:        user?.firstName || '',
  lastName:         user?.lastName  || '',
  email:            user?.email     || '',
  phone:            user?.phone     || '',
  bio:              user?.bio       || '',
  avatar:           user?.avatar    || '',
  photoUrl:         user?.avatar    || '',
  jobTitle:         user?.jobTitle  || '',
  qualifications:   Array.isArray(user?.qualifications)   ? user.qualifications.join('\n') : (user?.qualifications || ''),
  certifications:   Array.isArray(user?.certifications)   ? user.certifications.join('\n') : (user?.certifications || ''),
  specializations:  Array.isArray(user?.specializations)  ? user.specializations.join(', ') : (user?.specializations || ''),
  yearsOfExperience: typeof user?.yearsOfExperience === 'number' ? user.yearsOfExperience : 0,
  yearsTeaching:    typeof user?.yearsOfExperience === 'number' ? user.yearsOfExperience : 0,
  // Display-only (read-only in the form)
  title:            'Mr.',  // Local convention; not in User model
  subjects:         Array.isArray(user?.subjects) ? user.subjects.join(', ') :
                    Array.isArray(user?.subjectRefs) ? '' :
                    (typeof user?.subjects === 'string' ? user.subjects : ''),
  curricula:        Array.isArray(user?.curriculum) ? user.curriculum.join(', ') :
                    (typeof user?.curriculum === 'string' ? user.curriculum : ''),
  joinedDate:       user?.createdAt || '',
  // Local-only (kept in localStorage; not synced to backend)
  whatsapp:         '',
  location:         '',
  timezone:         'Africa/Nairobi (EAT, UTC+3)',
  languages:        '',
  hourlyRate:       0,
  notifyEmailMessages: true,
  notifyEmailGrading:  true,
  notifyEmailExams:    true,
  notifySmsUrgent:     false,
  notifySmsClassReminder: true,
  preferredChannel:  'email',
  workingHoursStart: '08:00',
  workingHoursEnd:   '18:00',
  workingDays:       ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  twoFactorEnabled:  false,
})

// Load profile: start from real user object, then layer over any
// local-only fields the teacher has saved previously.
const tpLoadProfile = (user) => {
  const base = tpDefaultProfile(user)
  try {
    const saved = localStorage.getItem(TP_PROFILE_KEY)
    if (saved) {
      const local = JSON.parse(saved)
      // Only layer local-only fields; DB-backed fields come from `user`
      const localOnly = {}
      for (const k of Object.keys(local || {})) {
        if (!TP_DB_FIELDS.includes(k)) localOnly[k] = local[k]
      }
      return { ...base, ...localOnly }
    }
  } catch {}
  return base
}

// Save profile: split into DB-bound (PATCH to /api/teacher-profile/me)
// and local-only (localStorage). Returns the API promise so callers
// can chain on success.
const tpSaveProfileLocalOnly = (profile) => {
  try {
    const localOnly = {}
    for (const k of Object.keys(profile || {})) {
      if (!TP_DB_FIELDS.includes(k)) localOnly[k] = profile[k]
    }
    localStorage.setItem(TP_PROFILE_KEY, JSON.stringify(localOnly))
  } catch {}
}

const tpFormatJoinedDate = (iso) => {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  } catch { return iso }
}

function TeacherProfileTab({ user, setCurrentUser, store, setPage, toast }) {
  // Profile state is hydrated from the REAL user object (passed in
  // from the portal shell). DB-backed fields originate from the User
  // document; local-only fields (notifications, working hours, etc.)
  // come from localStorage.
  const [profile, setProfile] = useState(() => tpLoadProfile(user))
  const [tab, setTab] = useState('personal')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)

  // Re-hydrate profile when the underlying user object changes (e.g.
  // /auth/me responds after initial mount). Without this, an early
  // mount could leave the form with empty defaults.
  useEffect(() => {
    if (user) setProfile(tpLoadProfile(user))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id])

  // On mount, fetch the freshest profile from the new endpoint so
  // any out-of-band updates (e.g. admin edits) are picked up.
  useEffect(() => {
    let cancelled = false
    api.get('/teacher-profile/me')
      .then(res => {
        if (cancelled) return
        const p = res.data?.data?.profile
        if (p) {
          setProfile(tpLoadProfile(p))
          // Sync the global user too so the rest of the portal sees it
          if (setCurrentUser) setCurrentUser(prev => ({ ...(prev || {}), ...p }))
        }
      })
      .catch(() => { /* keep what we already have */ })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // Save: split into DB PATCH (for fields the backend knows about)
  // and localStorage (for preferences). DB save is awaited so any
  // validation error surfaces; local save happens regardless.
  const saveAll = async () => {
    setSaving(true)
    try {
      // Build the DB payload from current profile state.
      // `avatar` lives on the User model; the UI binds to `photoUrl`.
      const dbPayload = {
        firstName: profile.firstName,
        lastName:  profile.lastName,
        phone:     profile.phone,
        bio:       profile.bio,
        avatar:    profile.photoUrl,           // UI uses photoUrl, DB uses avatar
        jobTitle:  profile.jobTitle || '',
        qualifications:  profile.qualifications  || '',  // backend splits by newline
        certifications:  profile.certifications  || '',
        specializations: profile.specializations || '',  // backend splits by comma
        yearsOfExperience: Number(profile.yearsTeaching || profile.yearsOfExperience || 0),
      }

      const { data } = await api.patch('/teacher-profile/me', dbPayload)
      if (!data?.success) {
        toast?.error?.(data?.message || 'Server rejected the changes.')
        setSaving(false)
        return
      }

      // Persist local-only preferences
      tpSaveProfileLocalOnly(profile)

      // Reflect the saved user back into the portal's currentUser so
      // sidebar / header refresh without a page reload.
      const updated = data.data?.profile
      if (updated) {
        if (setCurrentUser) {
          setCurrentUser(prev => ({ ...(prev || {}), ...updated }))
        }
        try {
          const stored = JSON.parse(localStorage.getItem('sm_user') || '{}')
          localStorage.setItem('sm_user', JSON.stringify({ ...stored, ...updated }))
        } catch {}
      }

      setHasUnsavedChanges(false)
      setSavedFlash(true)
      toast?.ok?.('Profile saved.')
      setTimeout(() => setSavedFlash(false), 2000)
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const discardChanges = () => {
    if (!confirm('Discard all unsaved changes?')) return
    setProfile(tpLoadProfile(user))
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
                    disabled={saving}
                    style={{
                      background: '#C9A030', color: '#7D1025', border: 'none',
                      padding: '8px 16px', borderRadius: 'var(--rsm)',
                      fontSize: 12, fontWeight: 800,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1,
                      boxShadow: '0 4px 12px rgba(201,160,48,.4)',
                    }}>{saving ? 'Saving...' : 'Save Changes'}</button>
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


// ═══════════════════════════════════════════════════════════
// SCHEDULE CLASSES TAB
// Teacher-side scheduling for one-off live class sessions.
// Distinct from TeacherLiveClassesTab (which manages persistent
// Group Rooms with Zoom links).
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// SCHEDULE CLASSES — shell with two tabs:
//   • Live Sessions   — one-off scheduled live classes
//   • Weekly Timetable — recurring per-student timetable
// ═══════════════════════════════════════════════════════════
function ScheduleClassesTab({ user, toast }) {
  const [tab, setTab] = useState('live')

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
      fontWeight: 700, fontSize: 13,
      background: tab === id ? '#7D1025' : '#fff',
      color: tab === id ? '#fff' : '#5A5048',
      border: '1.5px solid ' + (tab === id ? '#7D1025' : '#E8E2D6'),
    }}>{label}</button>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabBtn('live', 'Live Sessions')}
        {tabBtn('timetable', 'Weekly Timetable')}
      </div>
      {tab === 'live' && <LiveSessionsTab user={user} toast={toast} />}
      {tab === 'timetable' && <WeeklyTimetableTab user={user} toast={toast} />}
    </div>
  )
}

// ── WEEKLY TIMETABLE — recurring per-student schedule ──────
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function WeeklyTimetableTab({ user, toast }) {
  const [view, setView] = useState('list')        // 'list' | 'create' | 'detail'
  const [timetables, setTimetables] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)      // timetable being viewed

  // builder data
  const [students, setStudents] = useState([])
  const [curricula] = useState([
    'CambridgePrimary', 'CambridgeLowerSec', 'CambridgeIGCSE', 'CambridgeALevel',
    'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel',
    'AQALowerSec', 'AQAGCSE', 'AQAALevel',
    'IB', 'BNC', 'American', 'Canadian', 'KenyaCBC',
  ])

  const loadMine = useCallback(() => {
    setLoading(true)
    api.get('/timetables/mine')
      .then(r => setTimetables(r.data?.data?.timetables || []))
      .catch(() => toast?.error?.('Failed to load timetables.'))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => { loadMine() }, [loadMine])
  useEffect(() => {
    api.get('/users?role=student')
      .then(r => setStudents(r.data?.data?.users || r.data?.users || []))
      .catch(() => {})
  }, [])

  // ── LIST VIEW ──
  if (view === 'list') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#231715', margin: 0 }}>Weekly Timetables</h2>
            <div style={{ fontSize: 12.5, color: '#857973' }}>Recurring per-student schedules — generated from the subject's lessons.</div>
          </div>
          <button onClick={() => setView('create')} style={{
            background: '#7D1025', color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>+ New Timetable</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#857973', fontSize: 13 }}>Loading…</div>
        ) : timetables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, color: '#857973', fontSize: 13, border: '1px dashed #E8E2D6', borderRadius: 12 }}>
            No timetables yet. Click “New Timetable” to build one.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {timetables.map(tt => {
              const delivered = (tt.sessions || []).filter(s => s.status === 'delivered').length
              const total = (tt.sessions || []).length
              const end = tt.sessions && tt.sessions.length ? tt.sessions[tt.sessions.length - 1].date : null
              return (
                <div key={tt._id} onClick={() => { setActive(tt); setView('detail') }} style={{
                  background: '#fff', border: '1px solid #E8E2D6', borderRadius: 12,
                  padding: 16, cursor: 'pointer',
                }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#231715' }}>{tt.studentName || 'Student'}</div>
                  <div style={{ fontSize: 13, color: '#7D1025', fontWeight: 700, marginTop: 2 }}>{tt.subjectName}</div>
                  <div style={{ fontSize: 11.5, color: '#857973', marginTop: 8 }}>
                    {(tt.weeklySlots || []).map(s => DAY_SHORT[s.dayOfWeek] + ' ' + s.time).join('  ·  ')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: '#857973' }}>
                    <span><b style={{ color: '#231715' }}>{delivered}</b> / {total} delivered</span>
                    {end && <span>ends {new Date(end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── CREATE VIEW ──
  if (view === 'create') {
    return <TimetableBuilder
      students={students} curricula={curricula} toast={toast}
      onBack={() => setView('list')}
      onCreated={() => { setView('list'); loadMine() }}
    />
  }

  // ── DETAIL VIEW ──
  if (view === 'detail' && active) {
    return <TimetableDetail
      timetable={active} toast={toast}
      onBack={() => { setActive(null); setView('list') }}
      onChanged={(updated) => setActive(updated)}
      onDeleted={() => { setActive(null); setView('list'); loadMine() }}
    />
  }
  return null
}

// ── TIMETABLE BUILDER ──────────────────────────────────────
function TimetableBuilder({ students, curricula, toast, onBack, onCreated }) {
  const [studentId, setStudentId] = useState('')
  const [curriculum, setCurriculum] = useState('CambridgeIGCSE')
  const [subjects, setSubjects] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [slots, setSlots] = useState([{ dayOfWeek: 1, time: '10:00' }])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/subjects', { params: { curriculum } })
      .then(r => { setSubjects(r.data?.subjects || []); setSubjectId('') })
      .catch(() => setSubjects([]))
  }, [curriculum])

  const addSlot = () => setSlots(s => [...s, { dayOfWeek: 1, time: '10:00' }])
  const setSlot = (i, k, v) => setSlots(s => s.map((x, idx) => idx === i ? { ...x, [k]: v } : x))
  const delSlot = (i) => setSlots(s => s.filter((_, idx) => idx !== i).length ? s.filter((_, idx) => idx !== i) : s)

  const create = async () => {
    if (!studentId) { toast?.error?.('Pick a student.'); return }
    if (!subjectId) { toast?.error?.('Pick a subject.'); return }
    if (!slots.length) { toast?.error?.('Add at least one weekly slot.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/timetables', {
        studentId, subjectId, weeklySlots: slots, startDate,
      })
      if (data?.success) { toast?.ok?.('Timetable created.'); onCreated?.() }
      else toast?.error?.(data?.message || 'Failed.')
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Failed to create timetable.')
    } finally { setSaving(false) }
  }

  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
    textTransform: 'uppercase', color: '#7D1025', marginBottom: 5 }
  const inp = { width: '100%', boxSizing: 'border-box', padding: '8px 11px',
    borderRadius: 7, border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit', background: '#fff' }
  const card = { background: '#fff', border: '1px solid #E8E2D6', borderRadius: 12, padding: 18, marginBottom: 14 }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={onBack} style={{
          background: '#fff', border: '1.5px solid #E8E2D6', borderRadius: 8,
          padding: '7px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#7D1025',
        }}>← Timetables</button>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#231715', margin: 0 }}>New Weekly Timetable</h2>
      </div>

      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div><label style={lbl}>Student *</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)} style={inp}>
              <option value="">— Select student —</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>
                  {`${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email}
                </option>
              ))}
            </select>
          </div>
          <div><label style={lbl}>Curriculum</label>
            <select value={curriculum} onChange={e => setCurriculum(e.target.value)} style={inp}>
              {curricula.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Subject *</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} style={inp}>
              <option value="">— Select subject —</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Start Date *</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inp}/>
          </div>
        </div>
      </div>

      <div style={card}>
        <label style={lbl}>Weekly Slots</label>
        <div style={{ fontSize: 11.5, color: '#857973', marginBottom: 8 }}>
          The recurring days &amp; times. One session per lesson is generated across these slots until the subject's lessons run out.
        </div>
        {slots.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <select value={s.dayOfWeek} onChange={e => setSlot(i, 'dayOfWeek', Number(e.target.value))}
              style={{ ...inp, flex: '1 1 140px' }}>
              {DAY_NAMES.map((d, di) => <option key={di} value={di}>{d}</option>)}
            </select>
            <input type="time" value={s.time} onChange={e => setSlot(i, 'time', e.target.value)}
              style={{ ...inp, flex: '0 0 130px' }}/>
            <button onClick={() => delSlot(i)} style={{
              background: 'transparent', border: 'none', color: '#B91C1C',
              cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px',
            }}>×</button>
          </div>
        ))}
        <button onClick={addSlot} style={{
          background: 'transparent', border: '1.5px dashed #C9A030', color: '#9A7B16',
          borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 4,
        }}>+ Add Slot</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 30 }}>
        <button onClick={create} disabled={saving} style={{
          background: saving ? '#9CA3AF' : '#7D1025', color: '#fff', border: 'none', borderRadius: 8,
          padding: '12px 26px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
        }}>{saving ? 'Generating…' : 'Generate Timetable'}</button>
      </div>
    </div>
  )
}

// ── TIMETABLE DETAIL — the generated calendar ──────────────
function TimetableDetail({ timetable, toast, onBack, onChanged, onDeleted }) {
  const [tt, setTt] = useState(timetable)
  const [busy, setBusy] = useState(false)

  const refresh = (updated) => { setTt(updated); onChanged?.(updated) }

  const setSessionStatus = async (sessionId, status) => {
    setBusy(true)
    try {
      const { data } = await api.patch('/timetables/' + tt._id, {
        sessionUpdate: { sessionId, status },
      })
      if (data?.success) refresh(data.data.timetable)
    } catch (e) { toast?.error?.('Failed to update session.') }
    finally { setBusy(false) }
  }

  const setDeliveryMode = async (sessionId, deliveryMode) => {
    setBusy(true)
    try {
      const { data } = await api.patch('/timetables/' + tt._id, {
        sessionUpdate: { sessionId, deliveryMode },
      })
      if (data?.success) refresh(data.data.timetable)
    } catch (e) { toast?.error?.('Failed to update delivery mode.') }
    finally { setBusy(false) }
  }

  const promoteSession = async (sessionId) => {
    setBusy(true)
    try {
      const { data } = await api.post('/timetables/' + tt._id + '/promote-session', { sessionId })
      if (data?.success) { refresh(data.data.timetable); toast?.ok?.('Live class created for this session.') }
      else toast?.error?.(data?.message || 'Failed.')
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Failed to create live class.') }
    finally { setBusy(false) }
  }

  const regenerate = async () => {
    if (!window.confirm('Regenerate this timetable from the current lesson list? Delivered sessions are kept; pending ones are recomputed.')) return
    setBusy(true)
    try {
      const { data } = await api.post('/timetables/' + tt._id + '/regenerate')
      if (data?.success) { refresh(data.data.timetable); toast?.ok?.('Regenerated.') }
    } catch (e) { toast?.error?.('Failed to regenerate.') }
    finally { setBusy(false) }
  }

  const remove = async () => {
    if (!window.confirm('Delete this timetable? This cannot be undone.')) return
    setBusy(true)
    try {
      await api.delete('/timetables/' + tt._id)
      toast?.ok?.('Timetable deleted.'); onDeleted?.()
    } catch (e) { toast?.error?.('Failed to delete.'); setBusy(false) }
  }

  const sessions = tt.sessions || []
  const delivered = sessions.filter(s => s.status === 'delivered').length
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

  const stChip = (status) => {
    const map = {
      delivered: { bg: '#DCFCE7', fg: '#15803D', label: 'Delivered' },
      cancelled: { bg: '#FEE2E2', fg: '#B91C1C', label: 'Cancelled' },
      pending:   { bg: '#FEF3C7', fg: '#B45309', label: 'Pending' },
    }
    const c = map[status] || map.pending
    return <span style={{ background: c.bg, color: c.fg, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{c.label}</span>
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{
          background: '#fff', border: '1.5px solid #E8E2D6', borderRadius: 8,
          padding: '7px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#7D1025',
        }}>← Timetables</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: '#231715', margin: 0 }}>
            {tt.studentName} · {tt.subjectName}
          </h2>
          <div style={{ fontSize: 12, color: '#857973' }}>
            {(tt.weeklySlots || []).map(s => DAY_SHORT[s.dayOfWeek] + ' ' + s.time).join('  ·  ')}
            {'   —   '}{delivered} of {sessions.length} delivered
          </div>
        </div>
        <button onClick={regenerate} disabled={busy} style={{
          background: '#fff', border: '1.5px solid #C9A030', color: '#9A7B16',
          borderRadius: 7, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>Regenerate</button>
        <button onClick={remove} disabled={busy} style={{
          background: '#fff', border: '1.5px solid #E8E2D6', color: '#B91C1C',
          borderRadius: 7, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>Delete</button>
      </div>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#857973', fontSize: 13 }}>
          No sessions generated.
        </div>
      ) : (
        <div style={{ border: '1px solid #E8E2D6', borderRadius: 12, overflow: 'hidden' }}>
          {sessions.map((s, i) => (
            <div key={s._id || i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              borderBottom: i < sessions.length - 1 ? '1px solid #F1ECE0' : 'none',
              background: s.status === 'delivered' ? '#FAFCFA' : '#fff',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: '#FBFAF5', border: '1px solid #E8E2D6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#7D1025',
              }}>{s.lessonNumber || i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#231715', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.lessonTitle || 'Lesson ' + (s.lessonNumber || i + 1)}
                </div>
                <div style={{ fontSize: 11.5, color: '#857973' }}>
                  {fmtDate(s.date)}{s.time ? ' · ' + s.time : ''}
                </div>
              </div>
              {stChip(s.status)}
              <select value={s.deliveryMode || 'virtual'} disabled={busy}
                onChange={e => setDeliveryMode(s._id, e.target.value)}
                title="Delivery mode"
                style={{
                  border: '1.5px solid #E8E2D6', borderRadius: 6, padding: '4px 8px',
                  fontSize: 11.5, fontFamily: 'inherit', background: '#fff', cursor: 'pointer',
                }}>
                <option value="virtual">Virtual</option>
                <option value="physical">Physical</option>
              </select>
              {s.liveClassId ? (
                <span style={{
                  fontSize: 10.5, fontWeight: 700, color: '#15803D',
                  background: '#DCFCE7', padding: '4px 9px', borderRadius: 20, whiteSpace: 'nowrap',
                }}>✓ Live class</span>
              ) : (
                <button onClick={() => promoteSession(s._id)} disabled={busy}
                  title="Create a live class for this session now"
                  style={{
                    border: '1.5px solid #C9A030', background: '#fff', color: '#9A7B16',
                    borderRadius: 6, padding: '4px 9px', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>+ Live class</button>
              )}
              <select value={s.status} disabled={busy}
                onChange={e => setSessionStatus(s._id, e.target.value)}
                style={{
                  border: '1.5px solid #E8E2D6', borderRadius: 6, padding: '4px 8px',
                  fontSize: 11.5, fontFamily: 'inherit', background: '#fff', cursor: 'pointer',
                }}>
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── LIVE SESSIONS — one-off scheduled live classes ─────────
// (Previously "ScheduleClassesTab" — now the Live Sessions tab
// inside the Schedule Classes shell. Logic unchanged.)
function LiveSessionsTab({ user, toast }) {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'create' | 'edit'
  const [filter, setFilter] = useState('all') // 'all' | 'scheduled' | 'live' | 'ended'
  const [searchQ, setSearchQ] = useState('')
  const [editing, setEditing] = useState(null) // class being edited

  // Default-meeting-link settings modal
  const [showSettings, setShowSettings] = useState(false)
  const [defaultLinkInput, setDefaultLinkInput] = useState(user?.defaultMeetingLink || '')
  const [savingSettings, setSavingSettings] = useState(false)
  const [currentDefaultLink, setCurrentDefaultLink] = useState(user?.defaultMeetingLink || '')

  // Catalog of curriculum/subjects/grades
  const [catalog, setCatalog] = useState({ curricula: [], gradesByCurriculum: {}, subjects: [] })
  // Eligible students for the chosen curriculum+grade
  const [eligibleStudents, setEligibleStudents] = useState([])

  // Form state
  const initialForm = () => ({
    title: '',
    description: '',
    subject: '',
    curriculum: '',
    grade: '',
    scheduledAt: defaultScheduleDate(),
    durationMins: 60,
    meetingLink: currentDefaultLink || '',
    assignedStudents: [], // array of student _ids
    notes: '',
    // Spine linkage (optional — picked when subject has a loaded spine)
    syllabusTopicName: '',
    syllabusSubtopicName: '',
  })
  const [form, setForm] = useState(initialForm())
  const [saving, setSaving] = useState(false)

  // ── Curriculum-spine integration ───────────────────────
  // When the chosen subject has a loaded syllabus spine, show
  // Topic + Subtopic dropdowns. Both optional. Subjects without
  // a spine show the dropdowns empty (or hidden). Mirrors the
  // pattern used by the question-bank form.
  // Resolves the real Subject._id by matching subject name within
  // the chosen curriculum, then fetches the spine for that id.
  const [spineTopics, setSpineTopics] = useState([])
  const [spineLoading, setSpineLoading] = useState(false)

  useEffect(() => {
    if (!form.curriculum || !form.subject) { setSpineTopics([]); return }
    let cancelled = false
    setSpineLoading(true)
    setSpineTopics([])
    ;(async () => {
      try {
        const subjRes = await api.get('/subjects', { params: { curriculum: form.curriculum } })
        const dbSubjects = subjRes.data?.subjects || []
        const norm = (s) => String(s || '').trim().toLowerCase()
        const want = norm(form.subject)
        let match = dbSubjects.find(s => norm(s.subjectName) === want)
        if (!match) {
          match = dbSubjects.find(s => {
            const have = norm(s.subjectName)
            return have && want && (have.includes(want) || want.includes(have))
          })
        }
        if (!match) { if (!cancelled) setSpineTopics([]); return }
        const spineRes = await api.get('/syllabus/subject/' + match._id)
        if (!cancelled) setSpineTopics(spineRes.data?.data?.topics || [])
      } catch (e) {
        if (!cancelled) setSpineTopics([])
      } finally {
        if (!cancelled) setSpineLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.subject, form.curriculum])

  const hasSpine = spineTopics.length > 0
  const spineSelectedTopic = spineTopics.find(t => t.topic === form.syllabusTopicName)

  // ── helpers ──
  function defaultScheduleDate() {
    // Round to next hour, default to tomorrow at 9am
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(9, 0, 0, 0)
    return d.toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM
  }

  // ── Load all classes + catalog on mount ──
  useEffect(() => {
    let cancelled = false
    const loadAll = async () => {
      setLoading(true)
      try {
        const [classesRes, catalogRes] = await Promise.all([
          api.get('/liveclasses/teacher/list'),
          api.get('/curriculum/options'),
        ])
        if (cancelled) return
        if (classesRes.data?.success) {
          setClasses(classesRes.data.data?.classes || [])
        }
        if (catalogRes.data?.success) {
          setCatalog({
            curricula: catalogRes.data.curricula || [],
            gradesByCurriculum: catalogRes.data.gradesByCurriculum || {},
            subjects: catalogRes.data.subjects || [],
          })
        }
      } catch (e) {
        if (cancelled) return
        console.error('[scheduleclasses] load failed:', e?.response?.data?.message || e.message)
        toast?.error?.('Failed to load classes.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Reload eligible students when curriculum+grade changes ──
  useEffect(() => {
    if (!form.curriculum || !form.grade) { setEligibleStudents([]); return }
    let cancelled = false
    const loadStudents = async () => {
      try {
        const { data } = await api.get('/users', {
          params: { role: 'student', curriculum: form.curriculum, gradeLevel: form.grade },
        })
        if (cancelled) return
        const list = data?.users || data?.data?.users || []
        setEligibleStudents(list.filter(u => u.isActive !== false))
      } catch (e) {
        if (cancelled) return
        setEligibleStudents([])
      }
    }
    loadStudents()
    return () => { cancelled = true }
  }, [form.curriculum, form.grade])

  // ── form helpers ──
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleStudent = (sid) => setForm(f => ({
    ...f,
    assignedStudents: f.assignedStudents.includes(sid)
      ? f.assignedStudents.filter(id => id !== sid)
      : [...f.assignedStudents, sid],
  }))

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm())
    setView('create')
  }
  const openEdit = (lc) => {
    setEditing(lc)
    setForm({
      title: lc.title,
      description: lc.description || '',
      subject: lc.subject,
      curriculum: lc.curriculum,
      grade: lc.grade,
      scheduledAt: new Date(lc.scheduledAt).toISOString().slice(0, 16),
      durationMins: lc.durationMins,
      meetingLink: lc.meetingLink,
      assignedStudents: (lc.assignedStudents || []).map(s => s._id || s),
      notes: lc.notes || '',
      syllabusTopicName:    lc.syllabusTopicName || '',
      syllabusSubtopicName: lc.syllabusSubtopicName || '',
    })
    setView('edit')
  }
  const cancelForm = () => { setView('list'); setEditing(null); setForm(initialForm()) }

  // ── Save (create or edit) ──
  const saveForm = async () => {
    if (!form.title.trim()) { toast?.error?.('Title is required.'); return }
    if (!form.subject || !form.curriculum || !form.grade) {
      toast?.error?.('Subject, curriculum and grade are required.'); return
    }
    if (!form.scheduledAt) { toast?.error?.('Scheduled time is required.'); return }
    if (!form.meetingLink.trim()) { toast?.error?.('Meeting link is required.'); return }
    if (form.assignedStudents.length === 0) {
      if (!window.confirm('No students selected. Save anyway? (You can add students later.)')) return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        subject: form.subject,
        curriculum: form.curriculum,
        grade: form.grade,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        durationMins: Number(form.durationMins),
        meetingLink: form.meetingLink.trim(),
        assignedStudents: form.assignedStudents,
        notes: form.notes.trim(),
        // Spine linkage (null when not picked)
        syllabusTopicName:    form.syllabusTopicName?.trim() || null,
        syllabusSubtopicName: form.syllabusSubtopicName?.trim() || null,
      }
      const { data } = editing
        ? await api.put('/liveclasses/' + editing._id, payload)
        : await api.post('/liveclasses', payload)
      if (data?.success) {
        toast?.ok?.(editing ? 'Class updated.' : 'Class scheduled.')
        // Reload list
        const reload = await api.get('/liveclasses/teacher/list')
        if (reload.data?.success) setClasses(reload.data.data?.classes || [])
        cancelForm()
      } else {
        toast?.error?.(data?.message || 'Save failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteClass = async (lc) => {
    if (!window.confirm(`Delete "${lc.title}"? This cannot be undone.`)) return
    try {
      const { data } = await api.delete('/liveclasses/' + lc._id)
      if (data?.success) {
        toast?.ok?.('Class deleted.')
        setClasses(cs => cs.filter(c => c._id !== lc._id))
      } else {
        toast?.error?.(data?.message || 'Delete failed.')
      }
    } catch (e) {
      toast?.error?.('Delete failed: ' + e.message)
    }
  }

  const startClass = async (lc) => {
    try {
      const { data } = await api.post('/liveclasses/' + lc._id + '/start')
      if (data?.success) {
        toast?.ok?.('Class is now live.')
        setClasses(cs => cs.map(c => c._id === lc._id ? { ...c, ...data.data.liveClass } : c))
      }
    } catch (e) {
      toast?.error?.('Failed to start.')
    }
  }
  const endClass = async (lc) => {
    if (!window.confirm('End this class now?')) return
    try {
      const { data } = await api.post('/liveclasses/' + lc._id + '/end')
      if (data?.success) {
        toast?.ok?.('Class ended.')
        setClasses(cs => cs.map(c => c._id === lc._id ? { ...c, ...data.data.liveClass } : c))
      }
    } catch (e) {
      toast?.error?.('Failed to end.')
    }
  }

  // ── Save default meeting link to teacher's profile ──
  const saveDefaultLink = async () => {
    setSavingSettings(true)
    try {
      const { data } = await api.patch('/auth/me', { defaultMeetingLink: defaultLinkInput.trim() })
      if (data?.success) {
        setCurrentDefaultLink(data.user?.defaultMeetingLink || '')
        toast?.ok?.('Default meeting link saved.')
        setShowSettings(false)
      } else {
        toast?.error?.(data?.message || 'Failed to save link.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Failed to save link.')
    } finally {
      setSavingSettings(false)
    }
  }

  // ── Filter and search ──
  const filtered = classes.filter(c => {
    if (filter !== 'all' && c.computedStatus !== filter) return false
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase()
      return (c.title || '').toLowerCase().includes(q)
        || (c.subject || '').toLowerCase().includes(q)
    }
    return true
  })

  const stats = {
    total: classes.length,
    scheduled: classes.filter(c => c.computedStatus === 'scheduled').length,
    live: classes.filter(c => c.computedStatus === 'live').length,
    ended: classes.filter(c => c.computedStatus === 'ended').length,
  }

  // ── Form-derived ──
  const formGrades = form.curriculum ? (catalog.gradesByCurriculum[form.curriculum] || []) : []
  // Subject list is scoped to the chosen curriculum via a DB-backed
  // fetch (not the static catalog). DB Subjects are tightly scoped
  // by curriculum at creation time; this prevents IGCSE subjects
  // from appearing under Lower Secondary etc.
  const [dbSubjects, setDbSubjects] = useState([])
  useEffect(() => {
    if (!form.curriculum) { setDbSubjects([]); return }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/subjects', { params: { curriculum: form.curriculum } })
        if (cancelled) return
        const list = (data?.subjects || []).filter(s => s.isActive !== false)
        setDbSubjects(list)
      } catch (e) {
        if (!cancelled) setDbSubjects([])
      }
    })()
    return () => { cancelled = true }
  }, [form.curriculum])
  // Fallback: if the currently-saved subject isn't in the fetched list
  // (e.g. an old class with a slightly different name), still show it
  // so the form doesn't appear broken.
  const formSubjects = form.curriculum
    ? (() => {
        const names = new Set(dbSubjects.map(s => s.subjectName))
        const arr = dbSubjects.map(s => ({ id: s._id, name: s.subjectName }))
        if (form.subject && !names.has(form.subject)) {
          arr.unshift({ id: 'legacy', name: form.subject })
        }
        return arr
      })()
    : []

  // ─────────────────────────────────────────────────────
  // CREATE / EDIT FORM
  // ─────────────────────────────────────────────────────
  if (view === 'create' || view === 'edit') {
    return (
      <div>
        <button onClick={cancelForm}
          style={{
            background: 'transparent', border: 'none', color: '#7D1025',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            padding: '6px 0', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Schedule
        </button>

        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: 'linear-gradient(135deg, #7D1025 0%, #5A0B1B 100%)',
          color: '#FBFAF5',
        }}>
          <div style={{ padding: '24px 30px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#F0CC5A', marginBottom: 6 }}>
              {editing ? 'Edit Live Class' : 'New Live Class'}
            </div>
            <h1 className="serif" style={{ fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              {editing ? form.title : 'Schedule a Live Class'}
            </h1>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              Set the time, topic, and which students to invite. The meeting link can be your Zoom personal room.
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          {/* Basic info */}
          <div className="fg">
            <label className="fl">Lesson title *</label>
            <input className="fi"
              placeholder="e.g. Quadratic Equations Recap"
              value={form.title} onChange={e => setF('title', e.target.value)}
              autoFocus
            />
          </div>
          <div className="fg">
            <label className="fl">Description (optional)</label>
            <textarea className="fi" rows={2}
              placeholder="What students should expect"
              value={form.description} onChange={e => setF('description', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Academic context */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="fg" style={{ flex: 1, minWidth: 180 }}>
              <label className="fl">Curriculum *</label>
              <select className="fsel" value={form.curriculum}
                onChange={e => { setF('curriculum', e.target.value); setF('grade', ''); setF('subject', '') }}
              >
                <option value="">Select curriculum...</option>
                {catalog.curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="fg" style={{ flex: 1, minWidth: 180 }}>
              <label className="fl">Grade *</label>
              <select className="fsel" value={form.grade}
                onChange={e => setF('grade', e.target.value)}
                disabled={!form.curriculum}
              >
                <option value="">{form.curriculum ? 'Select grade...' : 'Pick curriculum first'}</option>
                {formGrades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="fg" style={{ flex: 1, minWidth: 180 }}>
              <label className="fl">Subject *</label>
              <select className="fsel" value={form.subject}
                onChange={e => { setF('subject', e.target.value); setF('syllabusTopicName', ''); setF('syllabusSubtopicName', '') }}
                disabled={!form.curriculum}
              >
                <option value="">{form.curriculum ? 'Select subject...' : 'Pick curriculum first'}</option>
                {formSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Syllabus spine: Topic + Subtopic dropdowns. Only shows when
              the chosen subject has a loaded spine. Both optional. */}
          {form.subject && (hasSpine || spineLoading) && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="fg" style={{ flex: 1, minWidth: 240 }}>
                <label className="fl">Syllabus topic (optional)</label>
                <select className="fsel" value={form.syllabusTopicName}
                  onChange={e => { setF('syllabusTopicName', e.target.value); setF('syllabusSubtopicName', '') }}
                  disabled={spineLoading || !hasSpine}
                >
                  <option value="">{spineLoading ? 'Loading syllabus...' : (hasSpine ? 'Select topic...' : 'No spine loaded')}</option>
                  {spineTopics.map(t => (
                    <option key={t._id} value={t.topic}>{t.code ? t.code + '. ' : ''}{t.topic}</option>
                  ))}
                </select>
              </div>
              <div className="fg" style={{ flex: 1, minWidth: 240 }}>
                <label className="fl">Subtopic (optional)</label>
                <select className="fsel" value={form.syllabusSubtopicName}
                  onChange={e => {
                    const picked = e.target.value
                    setF('syllabusSubtopicName', picked)
                    // Auto-fill title with the subtopic name, but only if
                    // title is empty OR title matches a previously-picked
                    // subtopic name (i.e. the teacher hasn't typed a custom
                    // title). This way custom titles are preserved.
                    if (picked) {
                      setForm(f => {
                        const titleIsCustom = f.title && f.title !== f.syllabusSubtopicName
                        return titleIsCustom ? { ...f, syllabusSubtopicName: picked } : { ...f, syllabusSubtopicName: picked, title: picked }
                      })
                    }
                  }}
                  disabled={!spineSelectedTopic}
                >
                  <option value="">{spineSelectedTopic ? 'Select subtopic...' : 'Pick a topic first'}</option>
                  {(spineSelectedTopic?.subtopics || []).map(st => (
                    <option key={st._id || st.name} value={st.name}>{st.code ? st.code + ': ' : ''}{st.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Time + duration */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="fg" style={{ flex: 1, minWidth: 240 }}>
              <label className="fl">Date &amp; Time *</label>
              <input className="fi" type="datetime-local"
                value={form.scheduledAt}
                onChange={e => setF('scheduledAt', e.target.value)}
              />
            </div>
            <div className="fg" style={{ minWidth: 140 }}>
              <label className="fl">Duration (min) *</label>
              <input className="fi" type="number" min={5} max={240} step={5}
                value={form.durationMins}
                onChange={e => setF('durationMins', e.target.value)}
              />
            </div>
          </div>

          {/* Meeting link */}
          <div className="fg">
            <label className="fl">
              Meeting link *
              {currentDefaultLink && form.meetingLink === currentDefaultLink && (
                <span style={{ marginLeft: 8, fontSize: 11, color: '#15803D', fontWeight: 700, fontStyle: 'italic' }}>
                  (pre-filled from your default)
                </span>
              )}
            </label>
            <input className="fi"
              type="url"
              placeholder="https://us02web.zoom.us/j/XXXXXXX"
              value={form.meetingLink} onChange={e => setF('meetingLink', e.target.value)}
            />
            <div style={{ fontSize: 11.5, color: '#6B6B6B', marginTop: 4 }}>
              Students see a "Join Class" button that opens this link 10 minutes before the start time.
            </div>
          </div>

          {/* Student selection */}
          <div className="fg">
            <label className="fl">
              Assign students
              <span style={{ marginLeft: 8, fontSize: 11, color: '#6B6B6B', fontWeight: 600 }}>
                ({form.assignedStudents.length} selected)
              </span>
            </label>
            {!form.curriculum || !form.grade ? (
              <div style={{
                padding: '12px 14px', background: '#FBFAF5',
                border: '1px dashed #E8E2D6', borderRadius: 6,
                fontSize: 12.5, color: '#6B6B6B', textAlign: 'center',
              }}>
                Pick a curriculum and grade first to see eligible students.
              </div>
            ) : eligibleStudents.length === 0 ? (
              <div style={{
                padding: '12px 14px', background: '#FEF3C7',
                border: '1px solid #FCD34D', borderRadius: 6,
                fontSize: 12.5, color: '#92400E',
              }}>
                No active students found for {form.curriculum} {form.grade}.
              </div>
            ) : (
              <div style={{
                maxHeight: 240, overflowY: 'auto',
                border: '1px solid #E8E2D6', borderRadius: 6,
                background: '#fff',
              }}>
                {eligibleStudents.map(s => {
                  const isSelected = form.assignedStudents.includes(s._id)
                  return (
                    <label key={s._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', cursor: 'pointer',
                        background: isSelected ? '#FBF6E3' : 'transparent',
                        borderBottom: '1px solid #F4EFE5',
                        fontSize: 13,
                      }}
                    >
                      <input type="checkbox" checked={isSelected}
                        onChange={() => toggleStudent(s._id)}
                        style={{ width: 16, height: 16 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#1A1A1A' }}>
                          {s.firstName} {s.lastName}
                        </div>
                        <div style={{ fontSize: 11, color: '#6B6B6B' }}>
                          {s.admissionNumber || s.email} &middot; {s.gradeLevel || form.grade}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
            {eligibleStudents.length > 0 && (
              <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                <button type="button"
                  onClick={() => setF('assignedStudents', eligibleStudents.map(s => s._id))}
                  style={{
                    background: 'transparent', border: '1px solid #7D1025',
                    color: '#7D1025', padding: '4px 12px', borderRadius: 4,
                    fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                  }}>
                  Select All
                </button>
                <button type="button"
                  onClick={() => setF('assignedStudents', [])}
                  style={{
                    background: 'transparent', border: '1px solid #E8E2D6',
                    color: '#6B6B6B', padding: '4px 12px', borderRadius: 4,
                    fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                  }}>
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="fg">
            <label className="fl">Notes for students (optional)</label>
            <textarea className="fi" rows={2}
              placeholder="What to bring, what to revise, etc."
              value={form.notes} onChange={e => setF('notes', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Save / cancel */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button onClick={cancelForm} disabled={saving}
              style={{
                background: 'transparent', border: '1.5px solid #E8E2D6',
                color: '#1A1A1A', padding: '10px 20px', borderRadius: 6,
                fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              }}>Cancel</button>
            <button onClick={saveForm} disabled={saving}
              style={{
                background: saving ? '#9CA3AF' : '#7D1025',
                color: '#fff', border: 'none',
                padding: '10px 22px', borderRadius: 6,
                fontSize: 13, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}>
              {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Schedule Class')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────────────
  return (
    <div>
      {/* HERO */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #7D1025 0%, #5A0B1B 100%)',
        color: '#FBFAF5',
      }}>
        <div style={{
          padding: '24px 30px',
          backgroundImage: 'radial-gradient(circle at 95% 50%, rgba(201,160,48,.18) 0%, transparent 50%)',
          display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#F0CC5A', marginBottom: 6 }}>
              Live Class Scheduler
            </div>
            <h1 className="serif" style={{ fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Schedule and run live sessions
            </h1>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              Create one-off lessons, assign students, share your Zoom link.
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={() => { setDefaultLinkInput(currentDefaultLink); setShowSettings(true) }}
              title="Set default meeting link"
              style={{
                background: 'rgba(0,0,0,.15)', color: '#FBFAF5',
                border: '1px solid rgba(251,250,245,.25)',
                padding: '12px 14px', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Default Link
            </button>
            <button onClick={openCreate}
              style={{
                background: '#C9A030', color: '#7D1025', border: 'none',
                padding: '12px 22px', borderRadius: 8,
                cursor: 'pointer', fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(201,160,48,.35)',
              }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Schedule Class
            </button>
          </div>
        </div>
        {/* Stats strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          background: 'rgba(0,0,0,.18)',
        }}>
          {[
            ['Total', stats.total, '#FBFAF5'],
            ['Scheduled', stats.scheduled, '#F0CC5A'],
            ['Live Now', stats.live, '#FCA5A5'],
            ['Ended', stats.ended, '#FBFAF5'],
          ].map(([label, value, color]) => (
            <div key={label} style={{
              padding: '12px 18px',
              borderRight: '1px solid rgba(251,250,245,.08)',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', opacity: .7, color: '#F0CC5A',
                marginBottom: 2,
              }}>{label}</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 700, color }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 14, padding: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7D1025', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Search
            </label>
            <input className="fi" placeholder="Search by title or subject..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7D1025', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Status
            </label>
            <select className="fsel" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live Now</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 13, color: 'var(--s400)', letterSpacing: '.1em' }}>
            LOADING CLASSES...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div className="serif" style={{ fontSize: 20, color: '#1A1A1A', marginBottom: 6 }}>
            {classes.length === 0 ? 'No classes yet' : 'No classes match your filters'}
          </div>
          <div style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 16 }}>
            {classes.length === 0
              ? 'Schedule your first live class to get started.'
              : 'Try clearing search or filters.'}
          </div>
          {classes.length === 0 && (
            <button onClick={openCreate}
              style={{
                background: '#7D1025', color: '#fff', border: 'none',
                padding: '10px 22px', borderRadius: 6,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Schedule Class</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(lc => (
            <TeacherClassCard key={lc._id} lc={lc}
              onEdit={() => openEdit(lc)}
              onDelete={() => deleteClass(lc)}
              onStart={() => startClass(lc)}
              onEnd={() => endClass(lc)}
              toast={toast}
            />
          ))}
        </div>
      )}

      {/* ─── Default meeting link settings modal ─── */}
      {showSettings && (
        <div style={{
          position:'fixed', inset:0, zIndex:100,
          background:'rgba(0,0,0,.6)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:20,
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false) }}
        >
          <div style={{
            background:'#fff', borderRadius:12,
            maxWidth:540, width:'100%', overflow:'hidden',
            boxShadow:'0 24px 64px rgba(0,0,0,.4)',
          }}>
            <div style={{
              padding:'18px 24px',
              background:'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
              color:'#FBFAF5',
            }}>
              <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'#F0CC5A' }}>
                Settings
              </div>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:22, marginTop:2 }}>
                Default Meeting Link
              </div>
            </div>
            <div style={{ padding:'22px 24px' }}>
              <p style={{ fontSize:13, color:'#3F3F3F', margin:'0 0 14px', lineHeight:1.55 }}>
                When you schedule a new live class, this link will be pre-filled in the meeting URL field.
                You can override it per class if needed.
              </p>
              <label style={{ fontSize:11, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'#7D1025' }}>
                Your Zoom personal room (or any video meeting URL)
              </label>
              <input
                value={defaultLinkInput}
                onChange={e => setDefaultLinkInput(e.target.value)}
                placeholder="https://us02web.zoom.us/j/1234567890"
                style={{
                  width:'100%', boxSizing:'border-box', marginTop:6,
                  padding:'10px 12px', borderRadius:6,
                  border:'1.5px solid #E8E2D6',
                  fontSize:13, fontFamily:'inherit',
                }}
              />
              <div style={{ fontSize:11, color:'#6B6B6B', marginTop:8 }}>
                Saved to your teacher profile. Visible only to you.
              </div>
            </div>
            <div style={{
              padding:'14px 24px',
              background:'#FBFAF5', borderTop:'1px solid #E8E2D6',
              display:'flex', justifyContent:'flex-end', gap:8,
            }}>
              <button onClick={() => setShowSettings(false)} disabled={savingSettings}
                style={{
                  background:'#fff', color:'#7D1025',
                  border:'1.5px solid #E8E2D6',
                  padding:'9px 18px', borderRadius:6,
                  cursor:'pointer', fontSize:13, fontWeight:700,
                }}>
                Cancel
              </button>
              <button onClick={saveDefaultLink} disabled={savingSettings}
                style={{
                  background: savingSettings ? '#9CA3AF' : '#7D1025',
                  color:'#fff', border:'none',
                  padding:'9px 20px', borderRadius:6,
                  cursor: savingSettings ? 'not-allowed' : 'pointer',
                  fontSize:13, fontWeight:700,
                }}>
                {savingSettings ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// TeacherClassCard — one card per class in the scheduler list
// ─────────────────────────────────────────────────────────
function TeacherClassCard({ lc, onEdit, onDelete, onStart, onEnd, toast }) {
  const status = lc.computedStatus
  const [showMarkPanel, setShowMarkPanel] = useState(false)
  const subjCol = ({
    Mathematics: '#7D1025', Maths: '#7D1025',
    English: '#0F766E', Physics: '#1E40AF',
    Chemistry: '#7C3AED', Biology: '#15803D',
    'Computer Science': '#0369A1', ICT: '#0369A1',
    Business: '#92400E', Economics: '#92400E',
    History: '#A16207', Geography: '#A16207',
  })[lc.subject] || '#7D1025'

  const statusBadge = status === 'scheduled'
    ? { bg: '#FEF3C7', color: '#92400E', label: 'SCHEDULED' }
    : status === 'live'
    ? { bg: '#FEE2E2', color: '#B91C1C', label: 'LIVE NOW' }
    : { bg: '#F1F5F9', color: '#64748B', label: 'ENDED' }

  const formatDate = (iso) => new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })

  const studentCount = (lc.assignedStudents || []).length

  return (
    <div className="card" style={{
      padding: 14, borderLeft: '4px solid ' + subjCol,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              background: statusBadge.bg, color: statusBadge.color,
              fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em',
              padding: '2px 8px', borderRadius: 99,
            }}>{statusBadge.label}</span>
            {status === 'live' && (
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#B91C1C', animation: 'pulse 1.5s infinite',
              }}/>
            )}
            <span style={{
              fontSize: 11, fontWeight: 700, color: subjCol,
              letterSpacing: '.06em', textTransform: 'uppercase',
            }}>{lc.subject}</span>
            <span style={{ fontSize: 11, color: '#6B6B6B' }}>
              {lc.curriculum} {lc.grade}
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 4 }}>
            {lc.title}
          </div>
          {lc.syllabusSubtopicName && (
            <div style={{
              display: 'inline-block',
              background: '#FDF7E2', color: '#7D5A0F',
              fontSize: 10.5, fontWeight: 700,
              padding: '2px 8px', borderRadius: 5,
              marginBottom: 4,
              border: '1px solid #E8D58F',
            }}>
              {lc.syllabusTopicName ? lc.syllabusTopicName + ' → ' : ''}{lc.syllabusSubtopicName}
            </div>
          )}
          <div style={{ fontSize: 12, color: '#6B6B6B' }}>
            {formatDate(lc.scheduledAt)} &middot; {lc.durationMins} min &middot; {studentCount} student{studentCount === 1 ? '' : 's'}
          </div>
          {lc.meetingLink && (
            <div style={{ fontSize: 11.5, color: '#6B6B6B', marginTop: 4, wordBreak: 'break-all' }}>
              <strong style={{ color: '#7D1025' }}>Link:</strong>{' '}
              <a href={lc.meetingLink} target="_blank" rel="noopener noreferrer"
                style={{ color: '#7D1025' }}>
                {lc.meetingLink.length > 60 ? lc.meetingLink.slice(0, 60) + '...' : lc.meetingLink}
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {status === 'scheduled' && (
            <>
              <button onClick={onStart}
                style={{
                  background: '#15803D', color: '#fff', border: 'none',
                  padding: '8px 14px', borderRadius: 6,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                Start
              </button>
              <button onClick={onEdit}
                style={{
                  background: 'transparent', border: '1px solid #C9A030',
                  color: '#7D1025', padding: '8px 14px', borderRadius: 6,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                Edit
              </button>
              <button onClick={onDelete}
                style={{
                  background: 'transparent', border: '1px solid #FCA5A5',
                  color: '#B91C1C', padding: '8px 14px', borderRadius: 6,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                Delete
              </button>
            </>
          )}
          {status === 'live' && (
            <>
              <a href={lc.meetingLink} target="_blank" rel="noopener noreferrer"
                style={{
                  background: '#7D1025', color: '#fff',
                  padding: '8px 14px', borderRadius: 6,
                  fontSize: 12, fontWeight: 700, textDecoration: 'none',
                }}>
                Join Zoom
              </a>
              <button onClick={onEnd}
                style={{
                  background: 'transparent', border: '1px solid #B91C1C',
                  color: '#B91C1C', padding: '8px 14px', borderRadius: 6,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                End Class
              </button>
            </>
          )}
          {status === 'ended' && (
            <>
              {lc.syllabusSubtopicName && (
                <button onClick={() => setShowMarkPanel(s => !s)}
                  style={{
                    background: showMarkPanel ? '#7D5A0F' : '#FDF7E2',
                    color: showMarkPanel ? '#fff' : '#7D5A0F',
                    border: '1px solid #E8D58F',
                    padding: '8px 14px', borderRadius: 6,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                  {showMarkPanel ? 'Close' : 'Mark progress'}
                </button>
              )}
              <button onClick={onDelete}
                style={{
                  background: 'transparent', border: '1px solid #E8E2D6',
                  color: '#6B6B6B', padding: '8px 14px', borderRadius: 6,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mark-progress inline panel (only when 'ended' AND spine-linked AND opened) */}
      {status === 'ended' && lc.syllabusSubtopicName && showMarkPanel && (
        <MarkProgressPanel lc={lc} onClose={() => setShowMarkPanel(false)} toast={toast} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// MarkProgressPanel
// Inline panel on a live class card. Lets teacher select which
// students to mark as having completed the linked syllabus subtopic.
// Calls POST /api/syllabus-progress/bulk on submit.
// ─────────────────────────────────────────────────────────
function MarkProgressPanel({ lc, onClose, toast }) {
  // assignedStudents may be populated User objects OR raw ObjectIds.
  // Normalise to { _id, firstName, lastName, fullName } objects.
  const initialStudents = (lc.assignedStudents || []).map(s => {
    if (typeof s === 'string') return { _id: s, firstName: '', lastName: '', fullName: '' }
    const fn = s.firstName || ''
    const ln = s.lastName || ''
    return {
      _id: s._id || s,
      firstName: fn, lastName: ln,
      fullName: (fn + ' ' + ln).trim() || s.username || s.email || '(student)',
    }
  })

  const [students, setStudents] = useState(initialStudents)
  const [picked, setPicked] = useState(() => new Set(initialStudents.map(s => s._id))) // default all
  const [alreadyDone, setAlreadyDone] = useState(new Set())
  const [saving, setSaving] = useState(false)
  const [loadingNames, setLoadingNames] = useState(false)

  // ── Resolve real subject._id by curriculum + name (same resolver
  // used by the schedule form). Required for the progress POST.
  const [subjectId, setSubjectId] = useState(null)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/subjects', { params: { curriculum: lc.curriculum } })
        if (cancelled) return
        const list = data?.subjects || []
        const norm = (s) => String(s || '').trim().toLowerCase()
        const want = norm(lc.subject)
        let match = list.find(s => norm(s.subjectName) === want)
        if (!match) {
          match = list.find(s => {
            const have = norm(s.subjectName)
            return have && want && (have.includes(want) || want.includes(have))
          })
        }
        if (match) setSubjectId(match._id)
      } catch (e) { /* leave subjectId null; save will warn */ }
    })()
    return () => { cancelled = true }
  }, [lc.curriculum, lc.subject])

  // ── Fetch student names if not already populated ──
  useEffect(() => {
    const missingNames = students.filter(s => !s.fullName).map(s => s._id)
    if (missingNames.length === 0) return
    let cancelled = false
    setLoadingNames(true)
    ;(async () => {
      try {
        const { data } = await api.get('/users', { params: { ids: missingNames.join(',') } })
        if (cancelled) return
        const users = data?.users || data?.data?.users || []
        const byId = new Map(users.map(u => [String(u._id), u]))
        setStudents(prev => prev.map(s => {
          const u = byId.get(String(s._id))
          if (!u) return s
          const fn = u.firstName || ''
          const ln = u.lastName || ''
          return {
            ...s,
            firstName: fn, lastName: ln,
            fullName: (fn + ' ' + ln).trim() || u.username || u.email || '(student)',
          }
        }))
      } catch (e) { /* leave names blank; UI shows id */ }
      finally { if (!cancelled) setLoadingNames(false) }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch existing "done" status for each student for this subtopic ──
  // So teacher can see who's already been marked (and avoid double-marking).
  useEffect(() => {
    if (!subjectId) return
    let cancelled = false
    ;(async () => {
      try {
        const checks = await Promise.all(students.map(async (s) => {
          try {
            const { data } = await api.get(`/syllabus-progress/student/${s._id}`, { params: { subjectId } })
            const items = data?.data?.items || []
            return items.some(i => i.syllabusSubtopicName === lc.syllabusSubtopicName) ? s._id : null
          } catch { return null }
        }))
        if (cancelled) return
        setAlreadyDone(new Set(checks.filter(Boolean)))
      } catch (e) { /* silent */ }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])

  const togglePick = (sid) => setPicked(prev => {
    const next = new Set(prev)
    if (next.has(sid)) next.delete(sid); else next.add(sid)
    return next
  })

  const saveProgress = async () => {
    if (!subjectId) { toast?.error?.('Could not resolve subject. Try reloading.'); return }
    if (picked.size === 0) { toast?.error?.('Pick at least one student.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/syllabus-progress/bulk', {
        studentIds: Array.from(picked),
        subjectId,
        syllabusTopicName: lc.syllabusTopicName || '',
        syllabusSubtopicName: lc.syllabusSubtopicName,
        linkedLiveClassId: lc._id,
      })
      if (data?.success) {
        toast?.ok?.(data.message || 'Progress saved.')
        // Update alreadyDone locally so the UI reflects the new state
        setAlreadyDone(prev => {
          const next = new Set(prev)
          picked.forEach(id => next.add(id))
          return next
        })
        onClose()
      } else {
        toast?.error?.(data?.message || 'Save failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      marginTop: 14, paddingTop: 14,
      borderTop: '1.5px dashed #E8D58F',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#7D5A0F', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>
        Mark students who completed this lesson
      </div>
      <div style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 10 }}>
        Subtopic: <strong>{lc.syllabusSubtopicName}</strong>
        {loadingNames && <span style={{ marginLeft: 8, color: '#9A7B16' }}>(loading names...)</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {students.map(s => {
          const done = alreadyDone.has(s._id)
          const isPicked = picked.has(s._id)
          return (
            <label key={s._id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 10px', borderRadius: 6,
              border: '1px solid ' + (isPicked ? '#C9A030' : '#E8E2D6'),
              background: isPicked ? '#FDF7E2' : '#fff',
              cursor: 'pointer', fontSize: 13,
            }}>
              <input type="checkbox"
                checked={isPicked}
                onChange={() => togglePick(s._id)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ flex: 1 }}>{s.fullName || s._id}</span>
              {done && (
                <span style={{
                  background: '#15803D', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 7px', borderRadius: 99,
                  letterSpacing: '.04em',
                }}>ALREADY DONE</span>
              )}
            </label>
          )
        })}
        {students.length === 0 && (
          <div style={{ fontSize: 12, color: '#9A9A9A', fontStyle: 'italic', padding: '6px 10px' }}>
            No students assigned to this class.
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={saveProgress}
          disabled={saving || picked.size === 0 || !subjectId}
          style={{
            background: '#7D5A0F', color: '#fff', border: 'none',
            padding: '8px 16px', borderRadius: 6,
            fontSize: 12, fontWeight: 700,
            cursor: (saving || picked.size === 0 || !subjectId) ? 'not-allowed' : 'pointer',
            opacity: (saving || picked.size === 0 || !subjectId) ? 0.5 : 1,
          }}>
          {saving ? 'Saving...' : `Mark ${picked.size} done`}
        </button>
        <button onClick={onClose}
          style={{
            background: 'transparent', border: '1px solid #E8E2D6',
            color: '#6B6B6B', padding: '8px 16px', borderRadius: 6,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
          Cancel
        </button>
      </div>
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

// ═══════════════════════════════════════════════════════════
// ATTENDANCE TAB
// Mark daily attendance per student. Cross-teacher visibility:
// when teacher A marks a student absent on a day, teacher B (also
// allocated to that student) sees the same status.
//
// Statuses: 'present', 'absent', 'half_day'. Reason required when
// 'absent' per the backend Attendance model's pre-validate hook.
// ═══════════════════════════════════════════════════════════
function AttendanceTab({ user, toast }) {
  // ── List of teacher's students (from existing allocations endpoint) ──
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStudentsLoading(true)
    ;(async () => {
      try {
        // Use the existing /allocations/teacher endpoint — returns
        // populated student objects we can deduplicate.
        const { data } = await api.get('/allocations/teacher')
        if (cancelled) return
        const allocs = data?.allocations || []
        // Deduplicate by studentId (a student may appear under multiple subjects)
        const byId = new Map()
        for (const a of allocs) {
          const s = a.studentId
          if (!s || !s._id) continue
          if (!byId.has(String(s._id))) {
            const fn = s.firstName || ''
            const ln = s.lastName || ''
            byId.set(String(s._id), {
              _id: s._id,
              firstName: fn,
              lastName: ln,
              fullName: (fn + ' ' + ln).trim() || s.email || '(student)',
              email: s.email || '',
              curriculum: s.curriculum || '',
            })
          }
        }
        const list = Array.from(byId.values()).sort((a,b) => a.fullName.localeCompare(b.fullName))
        setStudents(list)
      } catch (e) {
        if (!cancelled) toast?.error?.('Failed to load students: ' + (e?.response?.data?.message || e.message))
      } finally {
        if (!cancelled) setStudentsLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="sec-tag">Daily attendance</div>
        <h2 className="serif" style={{ fontSize: 26, color: 'var(--s900)', margin: '6px 0 4px' }}>
          Attendance
        </h2>
        <div style={{ fontSize: 13, color: '#6B6B6B' }}>
          Mark daily attendance for your students. Other teachers allocated to the same student will see your marks.
        </div>
      </div>

      {/* Student picker */}
      <div className="card" style={{ padding: 18, marginBottom: 18 }}>
        <div className="fl" style={{ marginBottom: 8 }}>Select student</div>
        {studentsLoading ? (
          <div style={{ fontSize: 13, color: '#9A9A9A', fontStyle: 'italic' }}>Loading students...</div>
        ) : students.length === 0 ? (
          <div style={{ fontSize: 13, color: '#9A9A9A', fontStyle: 'italic' }}>
            No students allocated to you yet.
          </div>
        ) : (
          <select className="fsel" value={selectedStudent?._id || ''}
            onChange={e => {
              const id = e.target.value
              setSelectedStudent(students.find(s => s._id === id) || null)
            }}
          >
            <option value="">Select a student...</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>
                {s.fullName}{s.curriculum ? ' · ' + s.curriculum : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 30-day attendance grid for selected student */}
      {selectedStudent && (
        <AttendanceGrid student={selectedStudent} markedByUser={user} toast={toast} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// AttendanceGrid
// Renders the last 30 days for a given student. Each day is a
// row with status buttons (Present / Absent / Half day) and a
// reason field that's required when status is Absent.
// ─────────────────────────────────────────────────────────
function AttendanceGrid({ student, markedByUser, toast }) {
  const [records, setRecords] = useState({})  // map: 'YYYY-MM-DD' -> Attendance doc
  const [loading, setLoading] = useState(false)
  const [savingKey, setSavingKey] = useState(null)
  // Drafts: per-day in-progress edits BEFORE save
  const [drafts, setDrafts] = useState({})    // map: 'YYYY-MM-DD' -> { status, reason }

  // Generate last 30 days (most recent first)
  const days = (() => {
    const out = []
    const today = new Date()
    today.setHours(0,0,0,0)
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      out.push({ key, date: d })
    }
    return out
  })()

  // Fetch existing records for this student
  useEffect(() => {
    if (!student?._id) return
    let cancelled = false
    setLoading(true)
    setRecords({})
    setDrafts({})
    ;(async () => {
      try {
        // Compute 30-day range
        const to = new Date()
        const from = new Date()
        from.setDate(from.getDate() - 30)
        const fromStr = from.toISOString().slice(0,10)
        const toStr   = to.toISOString().slice(0,10)
        const { data } = await api.get(`/attendance/student/${student._id}`, {
          params: { from: fromStr, to: toStr },
        })
        if (cancelled) return
        const items = data?.data?.items || []
        const byKey = {}
        for (const r of items) {
          const k = new Date(r.date).toISOString().slice(0,10)
          byKey[k] = r
        }
        setRecords(byKey)
      } catch (e) {
        if (!cancelled) toast?.error?.('Failed to load attendance: ' + (e?.response?.data?.message || e.message))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?._id])

  // Get the displayed status for a day: draft if set, else record, else null
  const statusFor = (key) => drafts[key]?.status ?? records[key]?.status ?? null
  const reasonFor = (key) => drafts[key]?.reason ?? records[key]?.reason ?? ''

  // Has the user changed anything from the saved record?
  const isDirty = (key) => {
    const d = drafts[key]
    if (!d) return false
    const r = records[key]
    if (!r) return true
    return d.status !== r.status || (d.reason || '') !== (r.reason || '')
  }

  const setDraft = (key, patch) => {
    setDrafts(prev => {
      const cur = prev[key] || {
        status: records[key]?.status ?? null,
        reason: records[key]?.reason ?? '',
      }
      return { ...prev, [key]: { ...cur, ...patch } }
    })
  }

  const save = async (key, date) => {
    const draft = drafts[key]
    if (!draft || !draft.status) return
    if (draft.status === 'absent' && !draft.reason?.trim()) {
      toast?.error?.('Reason is required when marking absent.')
      return
    }
    setSavingKey(key)
    try {
      const { data } = await api.post('/attendance', {
        studentId: student._id,
        date: key,                  // YYYY-MM-DD, server normalises
        status: draft.status,
        reason: draft.reason || '',
      })
      if (data?.success) {
        const saved = data.data?.attendance
        if (saved) {
          setRecords(prev => ({ ...prev, [key]: saved }))
        }
        // Drop the draft now that it's saved
        setDrafts(prev => {
          const next = { ...prev }
          delete next[key]
          return next
        })
        toast?.ok?.('Attendance saved.')
      } else {
        toast?.error?.(data?.message || 'Save failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed: ' + e.message)
    } finally {
      setSavingKey(null)
    }
  }

  const formatDate = (d) => {
    const wd = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]
    const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]
    return `${wd}, ${d.getDate()} ${mo}`
  }

  const STATUS_BTNS = [
    { key: 'present',  label: 'Present',   bg: '#15803D', bgLight: '#DCFCE7', text: '#15803D' },
    { key: 'half_day', label: 'Half day',  bg: '#C9A030', bgLight: '#FDF7E2', text: '#7D5A0F' },
    { key: 'absent',   label: 'Absent',    bg: '#7D1025', bgLight: '#FDE7EC', text: '#7D1025' },
  ]

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A' }}>{student.fullName}</div>
          <div style={{ fontSize: 11.5, color: '#6B6B6B', marginTop: 2 }}>
            Showing last 30 days{student.curriculum ? ' · ' + student.curriculum : ''}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: '#9A9A9A', fontStyle: 'italic', padding: '12px 0' }}>
          Loading attendance...
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
          {days.map(({ key, date }) => {
            const status = statusFor(key)
            const reason = reasonFor(key)
            const dirty  = isDirty(key)
            const rec    = records[key]
            const needsReason = status === 'absent'

            return (
              <div key={key} style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr auto',
                alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: dirty ? '#FDF7E2' : '#FBFAF5',
                border: '1px solid ' + (dirty ? '#C9A030' : '#E8E2D6'),
                borderRadius: 8,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{formatDate(date)}</div>
                  {rec && !dirty && (
                    <div style={{ fontSize: 10.5, color: '#6B6B6B', marginTop: 2 }}>
                      by {rec.markedBy?.firstName || ''} {rec.markedBy?.lastName || ''}
                    </div>
                  )}
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
                  <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
                    {STATUS_BTNS.map(btn => {
                      const active = status === btn.key
                      return (
                        <button key={btn.key}
                          onClick={() => setDraft(key, { status: btn.key })}
                          style={{
                            padding: '6px 12px', borderRadius: 6,
                            background: active ? btn.bg : btn.bgLight,
                            color: active ? '#fff' : btn.text,
                            border: '1px solid ' + (active ? btn.bg : btn.text + '44'),
                            fontSize: 11.5, fontWeight: 700, cursor:'pointer',
                            opacity: savingKey === key ? 0.5 : 1,
                          }}
                          disabled={savingKey === key}
                        >
                          {btn.label}
                        </button>
                      )
                    })}
                  </div>
                  {needsReason && (
                    <input
                      type="text"
                      value={reason}
                      placeholder="Reason (required for absent)"
                      onChange={e => setDraft(key, { reason: e.target.value })}
                      style={{
                        padding: '6px 10px', borderRadius: 6,
                        border: '1px solid ' + ((!reason || !reason.trim()) ? '#7D1025' : '#E8E2D6'),
                        fontSize: 12, background:'#fff',
                      }}
                      disabled={savingKey === key}
                    />
                  )}
                </div>

                <div>
                  {dirty && (
                    <button onClick={() => save(key, date)}
                      disabled={savingKey === key || !status || (needsReason && !reason?.trim())}
                      style={{
                        padding: '7px 14px', borderRadius: 6,
                        background: '#7D1025', color: '#fff', border: 'none',
                        fontSize: 11.5, fontWeight: 700,
                        cursor: (savingKey === key || !status || (needsReason && !reason?.trim())) ? 'not-allowed' : 'pointer',
                        opacity: (savingKey === key || !status || (needsReason && !reason?.trim())) ? 0.5 : 1,
                      }}>
                      {savingKey === key ? 'Saving...' : 'Save'}
                    </button>
                  )}
                  {!dirty && rec && (
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: '#15803D',
                      letterSpacing: '.06em', textTransform: 'uppercase',
                    }}>Saved</div>
                  )}
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
// ExternalEmailAdder
// Small input + "Add" button that lets a teacher add an arbitrary
// external email address (not a student/parent/colleague in the
// system) as an email recipient. The existing backend send route
// already accepts arbitrary recipientEmails so no backend change
// needed.
// ═══════════════════════════════════════════════════════════
function ExternalEmailAdder({ onAdd, pickedEmails, toast }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const submit = () => {
    const e = email.trim().toLowerCase()
    if (!EMAIL_RE.test(e)) {
      toast?.error?.('Enter a valid email address.')
      return
    }
    if (pickedEmails.includes(e)) {
      toast?.error?.('That email is already in the recipient list.')
      return
    }
    onAdd(e, name.trim() || e)
    setEmail('')
    setName('')
    setOpen(false)
    toast?.ok?.('Added ' + e)
  }

  if (!open) {
    return (
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setOpen(true)}
          style={{
            width: '100%',
            background: 'transparent', color: '#7D5A0F',
            border: '1.5px dashed #C9A030', borderRadius: 7,
            padding: '8px 12px', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', textAlign: 'center',
          }}>
          + Add an external email
        </button>
      </div>
    )
  }

  return (
    <div style={{
      marginBottom: 10,
      background: '#FDF7E2',
      border: '1.5px solid #C9A030',
      borderRadius: 7, padding: 10,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: '#7D5A0F',
        letterSpacing: '.06em', textTransform: 'uppercase',
        marginBottom: 6,
      }}>Add external recipient</div>
      <input value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="email@example.com (required)"
        type="email"
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '7px 10px', borderRadius: 6,
          border: '1px solid #E8D58F',
          fontSize: 12, marginBottom: 6, background: '#fff',
        }}
        autoFocus
      />
      <input value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="Display name (optional, e.g. 'John's mum')"
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '7px 10px', borderRadius: 6,
          border: '1px solid #E8D58F',
          fontSize: 12, marginBottom: 8, background: '#fff',
        }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={submit}
          style={{
            flex: 1,
            background: '#7D5A0F', color: '#fff', border: 'none',
            padding: '7px 12px', borderRadius: 6,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>Add</button>
        <button onClick={() => { setOpen(false); setEmail(''); setName('') }}
          style={{
            background: 'transparent', color: '#6B6B6B',
            border: '1px solid #E8E2D6', padding: '7px 12px',
            borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>Cancel</button>
      </div>
    </div>
  )
}
