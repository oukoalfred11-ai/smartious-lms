import { useState, useRef, useEffect } from 'react'
import { useToast, api } from '../../context/ctx.jsx'
import { useStore } from '../../context/ctx.jsx'
import Modal from '../../components/ui/Modal.jsx'
import LiveClassroom from '../../components/ui/LiveClassroom.jsx'
import TeacherProfile from './TeacherProfile.jsx'
import TeacherLeaveRequest from './TeacherLeaveRequest.jsx'

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
  const [msgTo,        setMsgTo]        = useState('Janet Osei')
  const [msgToRole,    setMsgToRole]    = useState('parent')
  const [msgSubject,   setMsgSubject]   = useState('')
  const [msgBody,      setMsgBody]      = useState('')
  const [activeThread, setActiveThread] = useState(null)
  const [replyText,    setReplyText]    = useState('')

  // ── Exam result post state ────────────────────────────
  const [resultModal,    setResultModal]    = useState(false)
  const [resultStudent,  setResultStudent]  = useState('Amara Osei')
  const [resultExam,     setResultExam]     = useState('Pythagoras Theorem Mock')
  const [resultScore,    setResultScore]    = useState('')
  const [resultTotal,    setResultTotal]    = useState('100')
  const [resultFeedback, setResultFeedback] = useState('')

  // ── Derived from store ───────────────────────────────
  const myArticles = store.articles.filter(a => a.author === 'Mr. James Muthomi')
  const totalReads = myArticles.reduce((s, a) => s + (a.reads || 0), 0)
  const totalEarnings = myArticles.reduce((s, a) => s + (a.earnings || 0), 0)
  const myThreads  = store.getThreads('teacher', 'Mr. James Muthomi')
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
      author:    'Mr. James Muthomi',
      authorInit: 'JM',
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
      addedBy: 'Mr. Muthomi',
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
        addedBy:   'Mr. Muthomi',
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
    dashboard:'Dashboard', classroom:'Live Classroom', students:'My Students',
    resources:'Resource Library', exambuilder:'Exams', questionbank:'Question Bank', blog:'Blog & Earnings',
    liveclass:'Live Lessons', allocations:'My Allocations', payslips:'Payslips & Earnings',
    marking:'Homework', reports:'Reports & Analytics', profile:'My Profile', leave:'Leave Requests',
    communication:'Messages'
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
    { section:'Classroom', items:[
      {id:'dashboard',  label:'Dashboard',       icon:'rect:3:3:7:7:1|rect:14:3:7:7:1|rect:14:14:7:7:1|rect:3:14:7:7:1'},
      {id:'classroom',  label:'Live Classroom',  icon:'rect:2:3:20:14:2|M8 21h8M12 17v4', live:true},
      {id:'students',   label:'My Students',     icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|circle:9:7:4|M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', badge:'24'},
    ]},
    { section:'Content', items:[
      {id:'questionbank',label:'Question Bank',    icon:'M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13|M4 19a2 2 0 0 0 2 2h14|M8 10h8M8 14h6|circle:18:18:3'},
      {id:'resources',   label:'Resource Library', icon:'M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13|M4 19a2 2 0 0 0 2 2h14|M8 10h8M8 14h6'},
      {id:'exambuilder', label:'Exams',           icon:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2|rect:9:3:6:4:1.5|line:9:12:15:12|line:9:16:12:16'},
      {id:'blog',        label:'Blog & Earnings',  icon:'M12 19l7-7 3 3-7 7-3-3z|M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z|M2 2l7.586 7.586|circle:11:11:2', badge:'3', badgeCol:'var(--g600)'},
    ]},
    { section:'Assessment', items:[
      {id:'liveclass',   label:'Live Lessons',        icon:'poly:23 7 16 12 23 17 23 7|rect:1:5:15:14:2', live:true},
      {id:'allocations', label:'My Allocations',      icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|circle:9:7:4|line:19:8:19:14|line:22:11:16:11', badge:'3', badgeCol:'var(--b700)'},
      {id:'payslips',    label:'Payslips',            icon:'rect:2:5:20:14:2|line:2:10:22:10|line:6:15:10:15|line:14:15:18:15'},
      {id:'marking',     label:'Homework',            icon:'M9 11l3 3L22 4|M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'},
      {id:'reports',     label:'Reports & Analytics', icon:'pline:22 12 18 12 15 21 9 3 6 12 2 12'},
    ]},
    { section:'Communication', items:[
      {id:'communication', label:'Messages',         icon:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'},
    ]},
    { section:'Account', items:[
      {id:'profile',     label:'My Profile',          icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|circle:12:7:4'},
      {id:'leave',       label:'Leave Requests',      icon:'M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z', badge:'3', badgeCol:'var(--a600)'},
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
          <Av init="JM" col="#3B82F6" size={36}/>
          <div className="sb-uinfo">
            <div className="sb-uname">Mr. James Muthomi</div>
            <div className="sb-urole">Mathematics · IGCSE</div>
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
            {page === 'classroom' && (
              <div className="tb-chip live" onClick={() => setPage('classroom')}>
                <div style={{width:7,height:7,borderRadius:'50%',background:'var(--r500)',animation:'pulse 2s infinite'}}/>
                Mathematics — Pythagoras · LIVE
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
          {page === 'dashboard' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,flexWrap:'wrap',gap:12}}>
                <div>
                  <div className="sec-tag">Good afternoon</div>
                  <h1 className="serif" style={{fontSize:28,color:'var(--s900)',marginBottom:4}}>Welcome back, <em style={{color:'var(--b700)'}}>Mr. Muthomi</em></h1>
                  <p style={{fontSize:14,color:'var(--s500)'}}>Mathematics · IGCSE · Form 3 · Smartious E-School Nairobi</p>
                </div>
                <div style={{display:'flex',gap:10}}>
                  <button className="btn btn-s btn-sm" onClick={() => setPage('exambuilder')}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    New Exam
                  </button>
                  <button className="btn btn-p btn-sm" onClick={() => setPage('classroom')}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Enter Live Class
                  </button>
                </div>
              </div>

              <div className="kpi-grid">
                {[
                  {bg:'var(--b50)',ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,v:'24',l:'Active Students',d:'↑ +2 this term',dc:'var(--g600)'},
                  {bg:'var(--g50)',ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,v:'73%',l:'Class Avg. Score',d:'↑ +4% vs last term',dc:'var(--g600)'},
                  {bg:'var(--a50)',ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,v:'3',l:'Exams to Mark',d:'Due this week',dc:'var(--a600)'},
                  {bg:'var(--p50)',ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--p600)" strokeWidth="2" strokeLinecap="round"><path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/></svg>,v:'47',l:'Resources Uploaded',d:'↑ +6 this month',dc:'var(--g600)'},
                ].map((k,i) => (
                  <div key={i} className="kpi">
                    <div className="kpi-ic" style={{background:k.bg}}>{k.ic}</div>
                    <div className="kpi-v">{k.v}</div>
                    <div className="kpi-l">{k.l}</div>
                    <div className="kpi-d" style={{color:k.dc}}>{k.d}</div>
                  </div>
                ))}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
                <div style={{display:'flex',flexDirection:'column',gap:20}}>
                  {/* Class performance */}
                  <div className="card">
                    <div className="chdr"><div className="ctitle">Class Performance Overview</div><button className="btn btn-g btn-sm" onClick={() => setPage('reports')}>Full Report</button></div>
                    {STUDENTS.slice(0,6).map((s,i) => {
                      const col = s.score>=75?'var(--g600)':s.score>=60?'var(--a600)':'var(--r500)'
                      return (
                        <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<5?'1px solid var(--border)':'none'}}>
                          <Av init={s.init} col={s.col} size={34}/>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,fontWeight:600,color:'var(--s800)',marginBottom:5}}>{s.name}</div>
                            <div className="prog-bar"><div className="prog-fill" style={{width:s.score+'%',background:col}}/></div>
                          </div>
                          <span className="mono" style={{fontSize:14,fontWeight:700,color:col,flexShrink:0}}>{s.score}%</span>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={s.trend==='up'?'var(--g600)':'var(--r500)'} strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0,transform:s.trend==='up'?'rotate(-90deg)':'rotate(90deg)'}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                      )
                    })}
                  </div>

                  {/* Schedule */}
                  <div className="card">
                    <div className="chdr"><div className="ctitle">This Week's Schedule</div></div>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      <div style={{display:'flex',gap:14,alignItems:'center',padding:12,background:'var(--r50)',border:'1px solid var(--r100)',borderRadius:'var(--rmd)'}}>
                        <div style={{width:44,height:44,background:'var(--r500)',borderRadius:'var(--rmd)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <div className="mono" style={{fontSize:11,color:'#fff',fontWeight:700}}>NOW</div>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:14}}>Mathematics — Pythagoras Theorem</div>
                          <div style={{fontSize:12,color:'var(--s500)'}}>IGCSE Form 3 · 6 students attending · 38 min remaining</div>
                        </div>
                        <button className="btn btn-d btn-sm" onClick={() => setPage('classroom')}>Join</button>
                      </div>
                      {[{day:'TUE',num:11,title:'Mathematics — Trigonometry Intro',time:'10:00 AM – 11:00 AM'},{day:'THU',num:13,title:'Mock Exam — Paper 2 Review',time:'2:00 PM – 3:30 PM'}].map((c,i) => (
                        <div key={i} style={{display:'flex',gap:14,alignItems:'center',padding:12,background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--rmd)'}}>
                          <div style={{width:44,height:44,background:'var(--s200)',borderRadius:'var(--rmd)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0,textAlign:'center'}}>
                            <div className="mono" style={{fontSize:9,color:'var(--s600)',fontWeight:700}}>{c.day}</div>
                            <div className="mono" style={{fontSize:15,color:'var(--s800)',fontWeight:700}}>{c.num}</div>
                          </div>
                          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{c.title}</div><div style={{fontSize:12,color:'var(--s500)'}}>{c.time}</div></div>
                          <button className="btn btn-s btn-sm">Prepare</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:20}}>
                  {/* Pending marking */}
                  <div className="card">
                    <div className="chdr" style={{marginBottom:14}}><div className="ctitle">Pending Marking</div></div>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {[{title:'Maths Mock — Paper 1',subs:24,marks:100},{title:'Chapter 4 Quiz',subs:18,marks:20}].map((e,i) => (
                        <div key={i} style={{background:i===0?'var(--a50)':'var(--bg)',border:`1px solid ${i===0?'var(--a100)':'var(--border)'}`,borderRadius:'var(--rmd)',padding:12,cursor:'pointer'}} onClick={() => setPage('marking')}>
                          <div style={{fontWeight:700,fontSize:13.5,marginBottom:3}}>{e.title}</div>
                          <div style={{fontSize:12,color:'var(--s500)',marginBottom:8}}>{e.subs} submissions · {e.marks} marks</div>
                          <button className="btn btn-am btn-sm" style={{width:'100%',justifyContent:'center'}}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            Mark with AI
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="card">
                    <div className="ctitle" style={{marginBottom:14}}>Quick Actions</div>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      <button className="btn btn-s" style={{justifyContent:'flex-start'}} onClick={() => setUploadModal(true)}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload Resource
                      </button>
                      <button className="btn btn-s" style={{justifyContent:'flex-start'}} onClick={() => setPage('exambuilder')}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Create New Exam
                      </button>
                      <button className="btn btn-s" style={{justifyContent:'flex-start'}} onClick={() => setPage('reports')}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        View Student Reports
                      </button>
                    </div>
                  </div>

                  {/* Class health */}
                  <div className="card">
                    <div className="ctitle" style={{marginBottom:14}}>Class Health</div>
                    {[['Attendance (this week)','92%','var(--g600)'],['Assignment completion','87%','var(--b700)'],['At-risk students','2','var(--r500)'],['Top performer','Faith Wanjiru','var(--s800)']].map(([l,v,c]) => (
                      <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13.5,marginBottom:10}}>
                        <span style={{color:'var(--s500)'}}>{l}</span>
                        <span className="mono" style={{fontWeight:700,color:c}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── LIVE CLASSROOM ── */}
          {page === 'classroom' && (
            <LiveClassroom
              role="teacher"
              onLeave={() => { setPage('dashboard'); toast.ok('Session ended. Recording saved.') }}
            />
          )}

          {/* ── MY STUDENTS ── */}
          {page === 'students' && <MyStudentsTab user={store?.currentUser} store={store} setPage={setPage} toast={toast} setMsgTo={setMsgTo} setMsgSubject={setMsgSubject} setMsgBody={setMsgBody} setMsgModal={setMsgModal} />}


          {/* ── QUESTION BANK ── */}
          {page === 'questionbank' && <QuestionBankTab user={store?.currentUser} store={store} setPage={setPage} toast={toast} />}

          {/* ── RESOURCE LIBRARY ── */}
          {page === 'resources' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <div><div className="sec-tag">Content Management</div><h2 className="serif" style={{fontSize:24,color:'var(--s900)'}}>Resource <em style={{color:'var(--b700)'}}>Library</em></h2></div>
                <button className="btn btn-p" onClick={() => { setUploadModal(true); setUploadStep(1) }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload Resource
                </button>
              </div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:20}}>
                <input className="fi" style={{maxWidth:260}} placeholder="Search resources…"/>
                <select className="fsel" style={{maxWidth:160}}><option>All Types</option><option>PDF</option><option>Video</option><option>Slides</option><option>Link</option></select>
                <select className="fsel" style={{maxWidth:160}}><option>All Subjects</option><option>Mathematics</option><option>Biology</option></select>
                <select className="fsel" style={{maxWidth:160}}><option>All Classes</option><option>Form 1</option><option>Form 2</option><option>Form 3</option><option>Form 4</option></select>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
                {RESOURCES.map((r,i) => (
                  <div key={i} className="res-card">
                    <div className="res-icon" style={{background:r.colBg}}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={r.colSt} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,color:'var(--s800)',marginBottom:3}}>{r.t}</div>
                      <div style={{fontSize:11.5,color:'var(--s400)',marginBottom:8}}>{r.type} · {r.sub} · {r.cls} · {r.size}</div>
                      <div style={{fontSize:12,color:'var(--s500)',background:'var(--bg)',borderRadius:'var(--rsm)',padding:8,marginBottom:10,lineHeight:1.5}}>
                        <span style={{fontWeight:700,color:'var(--b700)'}}>AI Summary: </span>{r.ai}
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{fontSize:11.5,color:'var(--s400)'}}>{r.dl} downloads</span>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-s btn-sm" onClick={() => toast.info(`Sharing: ${r.t}`)}>Share</button>
                          <button className="btn btn-g btn-sm" style={{color:'var(--r500)'}} onClick={() => toast.error('Deleting resource…')}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EXAMS ── */}
          {page === 'exambuilder' && <ExamsTab user={store?.currentUser} store={store} setPage={setPage} toast={toast} />}


          {/* ── AI MARKING ── */}
          {/* ── HOMEWORK ── */}
          {page === 'marking' && <HomeworkTab user={store?.currentUser} store={store} setPage={setPage} toast={toast} />}


          {/* ── REPORTS ── */}
          {page === 'reports' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Analytics</div><h2 className="serif" style={{fontSize:24,color:'var(--s900)'}}>Reports &amp; <em style={{color:'var(--b700)'}}>Analytics</em></h2></div>
              <div className="kpi-grid" style={{marginBottom:20}}>
                {[
                  {bg:'var(--b50)',ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,v:'73%',l:'Class Average',d:'↑ +4% vs last term',dc:'var(--g600)'},
                  {bg:'var(--g50)',ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/></svg>,v:'91%',l:'Highest Score',d:'Faith Wanjiru',dc:'var(--s500)'},
                  {bg:'var(--r50)',ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--r500)" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>,v:'2',l:'At-Risk Students',d:'Needs attention',dc:'var(--r500)'},
                  {bg:'var(--a50)',ic:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,v:'92%',l:'Attendance Rate',d:'Above school avg',dc:'var(--g600)'},
                ].map((k,i)=>(
                  <div key={i} className="kpi"><div className="kpi-ic" style={{background:k.bg}}>{k.ic}</div><div className="kpi-v">{k.v}</div><div className="kpi-l">{k.l}</div><div className="kpi-d" style={{color:k.dc}}>{k.d}</div></div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                <div className="card">
                  <div className="chdr"><div className="ctitle">Topic Mastery Breakdown</div></div>
                  {[['Number & Algebra',78,'#3B82F6'],['Pythagoras Theorem',73,'#22C55E'],['Statistics',69,'#F59E0B'],['Coordinate Geometry',61,'#8B5CF6'],['Functions & Graphs',55,'#EC4899']].map(([n,pct,c]) => (
                    <div key={n} style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:13.5,marginBottom:5}}>
                        <span style={{fontWeight:600,color:'var(--s700)'}}>{n}</span>
                        <span className="mono" style={{fontWeight:700,color:c}}>{pct}%</span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill" style={{width:pct+'%',background:c}}/></div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="chdr"><div className="ctitle">At-Risk Student Action Plan</div></div>
                  {[{name:'David Mwangi',score:58,note:'Declining in 3 consecutive assessments. Low attendance (74%). Integrity concerns in last exam.',col:'r'},{name:'Peter Kamau',score:62,note:'Borderline pass. Weak in Geometry and Functions. Attendance 78%.',col:'a'}].map(s => (
                    <div key={s.name} style={{background:s.col==='r'?'var(--r50)':'var(--a50)',border:`1px solid var(--${s.col}100)`,borderRadius:'var(--rmd)',padding:14,marginBottom:12}}>
                      <div style={{fontWeight:700,fontSize:14,color:s.col==='r'?'#B91C1C':'#B45309',marginBottom:6}}>{s.name} — {s.score}%</div>
                      <div style={{fontSize:12.5,color:'var(--s600)',lineHeight:1.65,marginBottom:10}}>{s.note}</div>
                      <div style={{display:'flex',gap:8}}>
                        <button className={`btn btn-${s.col==='r'?'d':'am'} btn-sm`} onClick={() => toast.info(`Scheduling session with ${s.name}…`)}>Schedule Session</button>
                        <button className="btn btn-s btn-sm" onClick={() => { setMsgTo('Janet Osei'); setMsgSubject('Student Progress Update'); setMsgBody(''); setMsgModal(true) }}>Message Parent</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── MESSAGES ── */}
          {page === 'reports' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <div><div className="sec-tag">Communication</div><h2 className="serif" style={{fontSize:24,color:'var(--s900)'}}>Messages</h2></div>
                <button className="btn btn-p btn-sm" onClick={() => { setMsgSubject(''); setMsgBody(''); setMsgModal(true) }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  New Message
                </button>
              </div>
              {myThreads.length === 0 ? (
                <div className="empty"><h3>No messages yet</h3><p>Send a message to a parent or student.</p></div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:20,height:560}}>
                  <div className="card" style={{padding:0,overflow:'hidden'}}>
                    <div style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:13.5}}>Conversations</div>
                    {myThreads.map((thread, ti) => {
                      const last = thread.messages[thread.messages.length - 1]
                      const other = last.from === 'Mr. James Muthomi' ? last.to : last.from
                      const isActive = activeThread?.id === thread.id
                      return (
                        <div key={ti} onClick={() => { setActiveThread(thread); thread.messages.forEach(m => store.markRead(m.id)) }}
                          style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',cursor:'pointer',background:isActive?'var(--b50)':'transparent',borderLeft:isActive?'3px solid var(--b600)':'3px solid transparent'}}>
                          <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <div style={{width:32,height:32,borderRadius:'50%',background:'#3B82F620',color:'#3B82F6',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'JetBrains Mono,monospace',fontSize:11,fontWeight:700,flexShrink:0}}>
                              {other.split(' ').map(w=>w[0]).join('').slice(0,2)}
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                <span style={{fontWeight:700,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{other}</span>
                                {thread.unread > 0 && <span className="sb-badge">{thread.unread}</span>}
                              </div>
                              <div style={{fontSize:11.5,color:'var(--s400)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{last.subject}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="card" style={{padding:0,display:'flex',flexDirection:'column'}}>
                    {activeThread ? (
                      <>
                        <div style={{padding:'13px 18px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:14}}>
                          {activeThread.messages[activeThread.messages.length-1].subject}
                        </div>
                        <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
                          {[...activeThread.messages].reverse().map((m, mi) => (
                            <div key={mi} style={{display:'flex',gap:9,flexDirection:m.from==='Mr. James Muthomi'?'row-reverse':'row',alignItems:'flex-end'}}>
                              <div style={{width:28,height:28,borderRadius:'50%',background:m.avatarCol+'20',color:m.avatarCol,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0}}>{m.avatar}</div>
                              <div style={{background:m.from==='Mr. James Muthomi'?'var(--b700)':'var(--white)',color:m.from==='Mr. James Muthomi'?'#fff':'var(--s800)',border:m.from!=='Mr. James Muthomi'?'1px solid var(--border)':'none',borderRadius:m.from==='Mr. James Muthomi'?'14px 14px 4px 14px':'4px 14px 14px 14px',padding:'9px 13px',maxWidth:'72%',fontSize:13.5,lineHeight:1.65}}>
                                {m.body}
                                <div style={{fontSize:10,marginTop:4,opacity:.5,textAlign:m.from==='Mr. James Muthomi'?'right':'left'}}>{m.time}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{padding:'10px 14px',borderTop:'1px solid var(--border)',display:'flex',gap:8}}>
                          <textarea className="chat-input" value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleReply(activeThread)}}} rows={1} placeholder="Type a reply…" style={{flex:1}}/>
                          <button className="btn btn-p btn-sm" onClick={() => handleReply(activeThread)} style={{padding:'7px 10px'}}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--s400)',fontSize:14}}>Select a conversation</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ALLOCATIONS ── */}
          {page === 'allocations' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">My Assignments</div><h2 className="serif" style={{fontSize:24,color:'var(--s900)'}}>My <em style={{color:'var(--b700)'}}>Allocations</em></h2></div>
              <div className="card" style={{padding:0,overflow:'hidden'}}>
                <table className="tbl">
                  <thead><tr><th>Student</th><th>Curriculum</th><th>Subject</th><th>Session Slot</th><th>Fee</th><th>Status</th></tr></thead>
                  <tbody>
                    {ALLOCS.map((a,i) => (
                      <tr key={i}>
                        <td style={{fontWeight:700}}>{a.student}</td>
                        <td><span className="badge badge-blue">{a.curriculum}</span></td>
                        <td style={{color:'var(--s600)'}}>{a.subject}</td>
                        <td style={{fontSize:13,color:'var(--s500)'}}>{a.slot}</td>
                        <td className="mono" style={{fontWeight:600,fontSize:13}}>{a.fee}</td>
                        <td><span className={`badge ${a.status==='Active'?'badge-green':'badge-amber'}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PAYSLIPS ── */}
          {page === 'payslips' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Earnings</div><h2 className="serif" style={{fontSize:24,color:'var(--s900)'}}>Payslips &amp; <em style={{color:'var(--b700)'}}>Earnings</em></h2></div>
              <div className="rate-card" style={{marginBottom:20}}>
                <div className="serif" style={{fontSize:'1rem',color:'#fff',flexShrink:0}}>Pay Rates</div>
                {[['Daily Attendance','KES 1,500','#34D399'],['Off-Hours Session','KES 300','#FCD34D'],['Article Read','KES 3','#93C5FD'],['Video Upload','KES 100','#D8B4FE']].map(([l,v,c]) => (
                  <div key={l} className="rate-item"><div className="rate-lbl">{l}</div><div className="mono" style={{fontSize:'1.4rem',color:c,fontWeight:500}}>{v}</div></div>
                ))}
              </div>
              <div className="card" style={{padding:0,overflow:'hidden'}}>
                <table className="tbl">
                  <thead><tr><th>Month</th><th>Attendance</th><th>Off-Hours</th><th>Article Reads</th><th>Videos</th><th>Gross</th><th>Tax</th><th>Net Pay</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {PAYSLIPS.map((p,i) => (
                      <tr key={i}>
                        <td style={{fontWeight:700}}>{p.month}</td>
                        <td className="mono">{p.att}</td>
                        <td className="mono">{p.offhrs}</td>
                        <td className="mono">{p.reads.toLocaleString()}</td>
                        <td className="mono">{p.videos}</td>
                        <td className="mono" style={{fontWeight:700}}>{p.gross}</td>
                        <td className="mono" style={{color:'var(--r600)'}}>{p.tax}</td>
                        <td className="mono" style={{fontWeight:700,color:'var(--g600)'}}>{p.net}</td>
                        <td><span className="sp-paid">{p.status}</span></td>
                        <td><button className="btn btn-g btn-sm" onClick={() => toast.info(`Downloading ${p.month} payslip…`)}>Download</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── BLOG ── */}
          {page === 'blog' && !blogEditor && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <div>
                  <div className="sec-tag">Blog & Earnings</div>
                  <h2 className="serif" style={{fontSize:24,color:'var(--s900)'}}>Blog &amp; <em style={{color:'var(--b700)'}}>Earnings</em></h2>
                  <p style={{fontSize:13.5,color:'var(--s500)',marginTop:4}}>You earn KES 3 per article read. Articles appear on the website and in the Parent portal.</p>
                </div>
                <button className="btn btn-p" onClick={() => { setEditingArticle(null); setBlogTitle(''); setBlogBody(''); setBlogEditor(true) }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Write New Post
                </button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
                {[
                  ['Total Reads', totalReads.toLocaleString(), 'var(--b700)'],
                  ['Total Earnings', 'KES ' + totalEarnings.toLocaleString(), 'var(--g600)'],
                  ['Published Posts', myArticles.filter(a=>a.status==='Published').length.toString(), 'var(--p600)'],
                ].map(([l,v,c]) => (
                  <div key={l} className="kpi"><div className="kpi-v" style={{color:c,fontSize:v.length>8?16:undefined}}>{v}</div><div className="kpi-l">{l}</div></div>
                ))}
              </div>
              {myArticles.length === 0 ? (
                <div className="empty">
                  <h3>No articles yet</h3>
                  <p>Write your first article — it will appear on the Smartious website and in parent dashboards.</p>
                  <button className="btn btn-p" onClick={() => setBlogEditor(true)}>Write First Article</button>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {myArticles.map((p) => (
                    <div key={p.id} className="card" style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:14.5,marginBottom:4}}>{p.title}</div>
                        <div style={{display:'flex',gap:12,fontSize:12.5,color:'var(--s400)',flexWrap:'wrap'}}>
                          <span>{p.date}</span>
                          {p.reads > 0 && <span className="mono" style={{fontWeight:600,color:'var(--s700)'}}>{p.reads.toLocaleString()} reads</span>}
                          {p.earnings > 0 && <span style={{color:'var(--g600)',fontWeight:700}}>KES {p.earnings.toLocaleString()}</span>}
                          {p.status === 'Published' && p.url && (
                            <span style={{color:'var(--b600)',fontSize:11}}>smartioushomeschool.com{p.url}</span>
                          )}
                        </div>
                      </div>
                      <span className={`badge ${p.status==='Published'?'badge-green':'badge-slate'}`}>{p.status}</span>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn btn-s btn-sm" onClick={() => openEditor(p)}>Edit</button>
                        {p.status === 'Draft' && (
                          <button className="btn btn-ok btn-sm" onClick={() => {
                            const slug = p.title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-')
                            store.updateArticle(p.id, { status:'Published', url:'/blog/'+slug, date: new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) })
                            toast.ok('Published! Now live on website.')
                          }}>Publish</button>
                        )}
                        <button className="btn btn-d btn-sm" onClick={() => { store.deleteArticle(p.id); toast.ok('Article deleted') }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BLOG EDITOR ── */}
          {page === 'blog' && blogEditor && (
            <div>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                <button className="btn btn-g btn-sm" onClick={() => { setBlogEditor(false); setEditingArticle(null) }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  Back
                </button>
                <div>
                  <div className="sec-tag">Blog Editor</div>
                  <h2 className="serif" style={{fontSize:22,color:'var(--s900)'}}>{editingArticle ? 'Edit Article' : 'Write New Article'}</h2>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:20,alignItems:'start'}}>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div className="fg">
                    <label className="fl">Article Title *</label>
                    <input className="fi" value={blogTitle} onChange={e=>setBlogTitle(e.target.value)} placeholder="e.g. 5 Ways to Make Quadratic Equations Fun"/>
                    {blogTitle && <div style={{fontSize:11.5,color:'var(--s400)',marginTop:4}}>URL: smartioushomeschool.com/blog/{blogTitle.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-') || '…'}</div>}
                  </div>
                  <div className="fg">
                    <label className="fl">Article Body *</label>
                    <textarea className="fi" rows={16} value={blogBody} onChange={e=>setBlogBody(e.target.value)}
                      placeholder="Write your full article here. This will be visible to all students and parents on the Smartious website."
                      style={{resize:'vertical',lineHeight:1.7,fontFamily:'inherit'}}/>
                    <div style={{fontSize:12,color:'var(--s400)',marginTop:4}}>{blogBody.split(/\s+/).filter(Boolean).length} words</div>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div className="card">
                    <div className="ctitle" style={{marginBottom:12}}>Settings</div>
                    <div className="fg">
                      <label className="fl">Subject</label>
                      <select className="fsel" value={blogSubject} onChange={e=>setBlogSubject(e.target.value)}>
                        <option>Mathematics</option><option>Biology</option><option>Chemistry</option><option>Physics</option><option>English Language</option>
                      </select>
                    </div>
                    <div className="fg">
                      <label className="fl">Category</label>
                      <select className="fsel" value={blogCat} onChange={e=>setBlogCat(e.target.value)}>
                        <option value="igcse">IGCSE</option><option value="homeschool">Homeschool</option><option value="ai">AI & EdTech</option><option value="ib">IB</option><option value="university">University</option>
                      </select>
                    </div>
                  </div>
                  <div className="card">
                    <div className="ctitle" style={{marginBottom:12}}>Publish</div>
                    <p style={{fontSize:13,color:'var(--s500)',marginBottom:14,lineHeight:1.6}}>Publishing will make this article live on the website and notify parents. You earn KES 3 per read.</p>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      <button className="btn btn-ok" style={{justifyContent:'center'}} onClick={() => handlePublish(false)}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        Publish to Website
                      </button>
                      <button className="btn btn-s" style={{justifyContent:'center'}} onClick={() => handlePublish(true)}>Save as Draft</button>
                    </div>
                  </div>
                  <div className="card" style={{background:'var(--b50)',borderColor:'var(--b100)'}}>
                    <div style={{fontSize:12.5,color:'var(--b700)',lineHeight:1.6}}>
                      <strong>After publishing:</strong>
                      <ul style={{marginTop:6,paddingLeft:16,display:'flex',flexDirection:'column',gap:4}}>
                        <li>Appears on website Blog page</li>
                        <li>Appears in Parent portal</li>
                        <li>Parents receive notification</li>
                        <li>Auto-generates shareable URL</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── LIVE LESSONS ── */}
          {page==='liveclass'&&(
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Scheduled Sessions</div><h2 className="serif" style={{fontSize:24,color:'var(--s900)'}}>Live <em style={{color:'var(--b700)'}}>Lessons</em></h2></div>
              {[{title:'Pythagoras Theorem',time:'NOW · 38 min remaining',students:6,cls:'IGCSE Form 3',live:true},{title:'Trigonometry Intro',time:'Tue Mar 11 · 10:00–11:00 AM',students:0,cls:'IGCSE Form 3',live:false},{title:'Mock Exam Review',time:'Thu Mar 13 · 2:00–3:30 PM',students:0,cls:'IGCSE Form 3',live:false}].map((s,i) => (
                <div key={i} className="card" style={{display:'flex',alignItems:'center',gap:16,marginBottom:12,borderLeft:s.live?'3px solid var(--r500)':'none'}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:3}}>{s.title}</div>
                    <div style={{fontSize:13,color:'var(--s500)'}}>{s.cls} · {s.time}{s.live?` · ${s.students} attending`:''}</div>
                  </div>
                  {s.live
                    ? <button className="btn btn-d btn-sm" onClick={() => setPage('classroom')}>Join Session</button>
                    : <button className="btn btn-s btn-sm" onClick={() => toast.info('Preparing session...')}>Prepare</button>}
                </div>
              ))}
            </div>
          )}

           {/* ── COMMUNICATION ── */}
           {page === 'communication' && <CommunicationTab user={store?.currentUser} store={store} setPage={setPage} toast={toast} />}

           {/* ── PROFILE ── */}
           {page === 'profile' && (
             <TeacherProfile />
           )}

           {/* ── LEAVE REQUESTS ── */}
           {page === 'leave' && (
             <TeacherLeaveRequest />
           )}

        </div>
      </main>

      {/* ── Send Message Modal ── */}
      <Modal open={msgModal} onClose={() => setMsgModal(false)} title="Send Message" size="md"
        footer={<><button className="btn btn-p" onClick={handleSendMsg}>Send Message</button><button className="btn btn-s" onClick={() => setMsgModal(false)}>Cancel</button></>}>
        <div>
          <div className="fg">
            <label className="fl">To</label>
            <select className="fsel" value={msgTo} onChange={e => setMsgTo(e.target.value)}>
              <option value="Janet Osei">Janet Osei (Parent — Amara)</option>
              <option value="Amara Osei">Amara Osei (Student)</option>
              <option value="All Parents">All Parents</option>
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
              {['Amara Osei','Kofi Mensah','Zara Kamau','Brian Otieno','Faith Wanjiru','David Mwangi','Lydia Achieng','Peter Kamau'].map(s => (
                <option key={s}>{s}</option>
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
// QUESTION BANK — for Exams, Homework, Adaptive Practice
// ═══════════════════════════════════════════════════════════

const QB_CUSTOM_KEY    = 'sm_question_bank_custom'
const QB_DRAFTS_KEY    = 'sm_question_bank_drafts'
const QB_SEEDED_KEY    = 'sm_question_bank_seeded'

const qbSubjColours = {
  'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
  'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
  'Geography': '#0F766E', 'Computer Science': '#1F2937',
  'Business Studies': '#7E22CE', 'Economics': '#9F1239',
}
const qbSubjColour = (s) => qbSubjColours[s] || '#8B1A2E'

const qbDifficultyColours = {
  easy:   { bg: 'var(--g50)', color: 'var(--g600)', label: 'Easy' },
  medium: { bg: 'var(--a50)', color: 'var(--a600)', label: 'Medium' },
  hard:   { bg: 'var(--r50)', color: 'var(--r500)', label: 'Hard' },
}

const qbTypeIcons = {
  mcq:       { letter: 'M', color: '#1E3A8A', label: 'Multiple Choice' },
  short:     { letter: 'S', color: '#166534', label: 'Short Answer' },
  essay:     { letter: 'E', color: '#7E22CE', label: 'Essay' },
  truefalse: { letter: 'T', color: '#92400E', label: 'True / False' },
}

const QB_CURRICULA = {
  'IGCSE':    { label: 'IGCSE',           years: ['Year 7','Year 8','Year 9','Year 10','Year 11'] },
  'Edexcel':  { label: 'Edexcel',         years: ['Year 7','Year 8','Year 9','Year 10','Year 11','Year 12','Year 13'] },
  'IB':       { label: 'IB',              years: ['Grade 9','Grade 10','Grade 11','Grade 12','SL','HL'] },
  'CBC':      { label: 'Kenya CBC',       years: ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'] },
  'BNC':      { label: 'British Nat. Curr.', years: ['Year 1','Year 2','Year 3','Year 4','Year 5','Year 6','Year 7','Year 8','Year 9','Year 10','Year 11','Year 12','Year 13'] },
  'American': { label: 'American',        years: ['K','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'] },
}

const QB_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'History', 'Geography', 'Computer Science', 'Business Studies', 'Economics',
]

const QB_DEFAULT_TOPICS = {
  'Mathematics':       ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Number', 'Calculus'],
  'Physics':           ['Forces & Motion', 'Electricity', 'Waves', 'Energy', 'Atomic Physics'],
  'Chemistry':         ['Atomic Structure', 'Periodic Table', 'Bonding', 'Reactions', 'Organic Chemistry'],
  'Biology':           ['Cell Biology', 'Genetics', 'Ecology', 'Human Body', 'Evolution'],
  'English':           ['Reading', 'Writing', 'Grammar', 'Literature', 'Poetry'],
  'History':           ['Modern History', 'Ancient History', 'World Wars', 'African History'],
  'Geography':         ['Physical', 'Human', 'Maps & Skills', 'Climate'],
  'Computer Science':  ['Algorithms', 'Data Structures', 'Programming', 'Networks'],
  'Business Studies':  ['Marketing', 'Finance', 'Operations', 'HR'],
  'Economics':         ['Microeconomics', 'Macroeconomics', 'Development', 'Globalisation'],
}

const seedQuestionBank = (teacherFullName) => {
  if (localStorage.getItem(QB_SEEDED_KEY)) return
  const now = new Date().toISOString()
  const samples = [
    { id: 'qb-001', curriculum: 'IGCSE', subject: 'Mathematics', topic: 'Algebra', difficulty: 'easy', type: 'mcq',
      question: 'Solve for x:  3x + 7 = 22',
      options: ['x = 5', 'x = 7', 'x = 15', 'x = 29/3'], answer: 'x = 5',
      explanation: 'Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.',
      marks: 2, tags: ['linear-equations'], authorId: 'teacher-1', authorName: teacherFullName, status: 'published', visibility: 'school',
      useInPractice: true, timesUsed: 12, timesAnswered: 87, averageScore: 78, createdAt: now, updatedAt: now },
    { id: 'qb-002', curriculum: 'IGCSE', subject: 'Mathematics', topic: 'Algebra', difficulty: 'medium', type: 'mcq',
      question: 'Expand (x + 4)(x - 2)',
      options: ['x^2 + 2x - 8', 'x^2 - 2x - 8', 'x^2 + 6x - 8', 'x^2 + 2x + 8'], answer: 'x^2 + 2x - 8',
      explanation: 'FOIL: x*x + x*(-2) + 4*x + 4*(-2) = x^2 + 2x - 8.',
      marks: 3, tags: ['expansion'], authorId: 'teacher-1', authorName: teacherFullName, status: 'published', visibility: 'school',
      useInPractice: true, timesUsed: 8, timesAnswered: 56, averageScore: 65, createdAt: now, updatedAt: now },
    { id: 'qb-003', curriculum: 'IGCSE', subject: 'Mathematics', topic: 'Geometry', difficulty: 'easy', type: 'mcq',
      question: 'A right-angled triangle has legs 6 cm and 8 cm. The hypotenuse is:',
      options: ['10 cm', '14 cm', '12 cm', '7 cm'], answer: '10 cm',
      explanation: 'Pythagoras: c^2 = 6^2 + 8^2 = 100, so c = 10 cm.',
      marks: 3, tags: ['pythagoras'], authorId: 'teacher-1', authorName: teacherFullName, status: 'published', visibility: 'school',
      useInPractice: true, timesUsed: 15, timesAnswered: 102, averageScore: 84, createdAt: now, updatedAt: now },
    { id: 'qb-004', curriculum: 'IGCSE', subject: 'Mathematics', topic: 'Trigonometry', difficulty: 'medium', type: 'short',
      question: 'In a right triangle, the side opposite to the angle is 5 cm and the hypotenuse is 13 cm. Find the sine of the angle.',
      answer: '5/13', explanation: 'sin(angle) = opposite / hypotenuse = 5 / 13.',
      marks: 4, tags: ['sine'], authorId: 'teacher-1', authorName: teacherFullName, status: 'published', visibility: 'school',
      useInPractice: true, timesUsed: 6, timesAnswered: 32, averageScore: 58, createdAt: now, updatedAt: now },
    { id: 'qb-005', curriculum: 'IGCSE', subject: 'Mathematics', topic: 'Algebra', difficulty: 'hard', type: 'essay',
      question: 'Explain three real-world applications of algebra. Include a worked example for each.',
      answer: '', explanation: 'Mark scheme: 3 marks per application (1 for context, 1 for setup, 1 for solution). Total 9 + 1 for clarity.',
      marks: 10, tags: ['applications'], authorId: 'teacher-1', authorName: teacherFullName, status: 'published', visibility: 'school',
      useInPractice: false, timesUsed: 2, timesAnswered: 14, averageScore: 71, createdAt: now, updatedAt: now },
    { id: 'qb-006', curriculum: 'IGCSE', subject: 'Physics', topic: 'Forces & Motion', difficulty: 'easy', type: 'mcq',
      question: "Newton's second law is expressed as:",
      options: ['F = ma', 'F = m/a', 'F = m + a', 'F = m - a'], answer: 'F = ma',
      explanation: 'Force = mass times acceleration.',
      marks: 2, tags: ['newton'], authorId: 'teacher-1', authorName: teacherFullName, status: 'published', visibility: 'school',
      useInPractice: true, timesUsed: 9, timesAnswered: 64, averageScore: 89, createdAt: now, updatedAt: now },
    { id: 'qb-007', curriculum: 'IGCSE', subject: 'Physics', topic: 'Electricity', difficulty: 'medium', type: 'truefalse',
      question: 'In a series circuit, current is the same at every point.',
      answer: 'True', explanation: 'In series, the same current flows through each component because there is only one path.',
      marks: 2, tags: ['circuits'], authorId: 'teacher-1', authorName: teacherFullName, status: 'published', visibility: 'school',
      useInPractice: true, timesUsed: 4, timesAnswered: 28, averageScore: 75, createdAt: now, updatedAt: now },
    { id: 'qb-008', curriculum: 'IGCSE', subject: 'Biology', topic: 'Cell Biology', difficulty: 'easy', type: 'mcq',
      question: 'Photosynthesis occurs in the:',
      options: ['Mitochondria', 'Nucleus', 'Chloroplasts', 'Ribosomes'], answer: 'Chloroplasts',
      explanation: 'Chloroplasts contain chlorophyll and convert light energy into chemical energy.',
      marks: 2, tags: ['photosynthesis'], authorId: 'teacher-1', authorName: teacherFullName, status: 'published', visibility: 'school',
      useInPractice: true, timesUsed: 11, timesAnswered: 78, averageScore: 81, createdAt: now, updatedAt: now },
    { id: 'qb-009', curriculum: 'IGCSE', subject: 'Mathematics', topic: 'Statistics', difficulty: 'medium', type: 'mcq',
      question: 'Find the mean of: 4, 7, 9, 10, 5',
      options: ['7', '7.5', '6', '8'], answer: '7',
      explanation: 'Sum = 35. Mean = 35 / 5 = 7.',
      marks: 2, tags: ['mean'], authorId: 'teacher-1', authorName: teacherFullName, status: 'draft', visibility: 'private',
      useInPractice: false, timesUsed: 0, timesAnswered: 0, averageScore: null, createdAt: now, updatedAt: now },
  ]
  localStorage.setItem(QB_CUSTOM_KEY, JSON.stringify(samples))
  localStorage.setItem(QB_SEEDED_KEY, '1')
}

const loadQuestionBank = () => {
  try { return JSON.parse(localStorage.getItem(QB_CUSTOM_KEY) || '[]') } catch { return [] }
}
const saveQuestionBank = (questions) => {
  try { localStorage.setItem(QB_CUSTOM_KEY, JSON.stringify(questions.slice(-1000))) } catch {}
}

const generateQId = () => 'qb-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)

function QuestionBankTab({ user, store, setPage, toast }) {
  const teacherFullName = 'Mr. James Muthomi'

  useEffect(() => { seedQuestionBank(teacherFullName) }, [])

  const [questions, setQuestions] = useState(() => loadQuestionBank())
  const [view, setView] = useState('browse')
  const [editingQ, setEditingQ] = useState(null)
  const [detailQ, setDetailQ] = useState(null)

  const [filterCurriculum, setFilterCurriculum] = useState('all')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQ, setSearchQ] = useState('')

  const [formCurriculum, setFormCurriculum] = useState('IGCSE')
  const [formSubject, setFormSubject] = useState('Mathematics')
  const [formTopic, setFormTopic] = useState('Algebra')
  const [formCustomTopic, setFormCustomTopic] = useState('')
  const [formDifficulty, setFormDifficulty] = useState('medium')
  const [formType, setFormType] = useState('mcq')
  const [formQuestion, setFormQuestion] = useState('')
  const [formOptions, setFormOptions] = useState(['', '', '', ''])
  const [formAnswer, setFormAnswer] = useState('')
  const [formExplanation, setFormExplanation] = useState('')
  const [formMarks, setFormMarks] = useState(2)
  const [formUseInPractice, setFormUseInPractice] = useState(true)
  const [formVisibility, setFormVisibility] = useState('school')

  const filteredQuestions = questions.filter(q => {
    if (filterCurriculum !== 'all' && q.curriculum !== filterCurriculum) return false
    if (filterSubject !== 'all' && q.subject !== filterSubject) return false
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false
    if (filterType !== 'all' && q.type !== filterType) return false
    if (filterStatus !== 'all' && q.status !== filterStatus) return false
    if (searchQ.trim()) {
      const search = searchQ.toLowerCase()
      const haystack = (q.question + ' ' + (q.tags || []).join(' ') + ' ' + q.topic).toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })

  const formTopics = (() => {
    const fromQuestions = [...new Set(questions.filter(q => q.subject === formSubject).map(q => q.topic))]
    const defaults = QB_DEFAULT_TOPICS[formSubject] || []
    return [...new Set([...defaults, ...fromQuestions])]
  })()

  const totalQuestions = questions.length
  const publishedCount = questions.filter(q => q.status === 'published').length
  const draftCount = questions.filter(q => q.status === 'draft').length
  const practiceCount = questions.filter(q => q.useInPractice).length
  const subjectCount = new Set(questions.map(q => q.subject)).size

  const resetForm = () => {
    setFormCurriculum('IGCSE'); setFormSubject('Mathematics'); setFormTopic('Algebra'); setFormCustomTopic('')
    setFormDifficulty('medium'); setFormType('mcq'); setFormQuestion('')
    setFormOptions(['', '', '', '']); setFormAnswer(''); setFormExplanation('')
    setFormMarks(2); setFormUseInPractice(true); setFormVisibility('school')
  }

  const openAdd = () => { resetForm(); setEditingQ(null); setView('add') }

  const openEdit = (q) => {
    setFormCurriculum(q.curriculum); setFormSubject(q.subject); setFormTopic(q.topic); setFormCustomTopic('')
    setFormDifficulty(q.difficulty); setFormType(q.type); setFormQuestion(q.question)
    setFormOptions(q.options || ['', '', '', '']); setFormAnswer(q.answer || ''); setFormExplanation(q.explanation || '')
    setFormMarks(q.marks || 2); setFormUseInPractice(q.useInPractice !== false); setFormVisibility(q.visibility || 'school')
    setEditingQ(q); setView('edit')
  }

  const saveQuestion = (asDraft) => {
    if (!formQuestion.trim()) { toast?.error?.('Question text is required.'); return }
    if (formType === 'mcq') {
      const filled = formOptions.filter(o => o.trim())
      if (filled.length < 2) { toast?.error?.('At least 2 options required.'); return }
      if (!formAnswer.trim()) { toast?.error?.('Select correct answer.'); return }
      if (!filled.includes(formAnswer)) { toast?.error?.('Correct answer must match an option.'); return }
    } else if (formType === 'truefalse') {
      if (formAnswer !== 'True' && formAnswer !== 'False') { toast?.error?.('Select True or False.'); return }
    } else if (formType !== 'essay' && !formAnswer.trim()) {
      toast?.error?.('Expected answer is required.'); return
    }

    const finalTopic = formCustomTopic.trim() || formTopic
    const now = new Date().toISOString()
    const record = {
      id: editingQ ? editingQ.id : generateQId(),
      curriculum: formCurriculum, subject: formSubject, topic: finalTopic,
      difficulty: formDifficulty, type: formType, question: formQuestion.trim(),
      options: formType === 'mcq' ? formOptions.filter(o => o.trim()) : (formType === 'truefalse' ? ['True', 'False'] : undefined),
      answer: formAnswer.trim(), explanation: formExplanation.trim(),
      marks: parseInt(formMarks) || 2, tags: [finalTopic.toLowerCase().replace(/\s+/g, '-')],
      authorId: 'teacher-1', authorName: teacherFullName,
      status: asDraft ? 'draft' : 'published',
      visibility: asDraft ? 'private' : formVisibility,
      useInPractice: !asDraft && formUseInPractice,
      timesUsed: editingQ ? editingQ.timesUsed : 0,
      timesAnswered: editingQ ? editingQ.timesAnswered : 0,
      averageScore: editingQ ? editingQ.averageScore : null,
      createdAt: editingQ ? editingQ.createdAt : now, updatedAt: now,
    }

    const updated = editingQ
      ? questions.map(q => q.id === editingQ.id ? record : q)
      : [record, ...questions]
    setQuestions(updated); saveQuestionBank(updated)
    toast?.ok?.(editingQ ? 'Question updated.' : asDraft ? 'Saved as draft.' : 'Question published.')
    setView('browse'); setEditingQ(null)
  }

  const deleteQuestion = (id) => {
    const updated = questions.filter(q => q.id !== id)
    setQuestions(updated); saveQuestionBank(updated)
    toast?.ok?.('Question deleted.'); setDetailQ(null)
  }

  const togglePractice = (id) => {
    const updated = questions.map(q => q.id === id ? { ...q, useInPractice: !q.useInPractice, updatedAt: new Date().toISOString() } : q)
    setQuestions(updated); saveQuestionBank(updated)
  }

  const publishDraft = (id) => {
    const updated = questions.map(q => q.id === id ? { ...q, status: 'published', visibility: 'school', updatedAt: new Date().toISOString() } : q)
    setQuestions(updated); saveQuestionBank(updated)
    toast?.ok?.('Question published.')
  }

  if (view === 'add' || view === 'edit') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <button onClick={() => { setView('browse'); setEditingQ(null) }} className="btn btn-g btn-sm">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back
          </button>
          <div>
            <div className="sec-tag">Question Bank</div>
            <h2 className="serif" style={{ fontSize: 22, color: 'var(--s900)' }}>{editingQ ? 'Edit Question' : 'Add New Question'}</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          <div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="ctitle" style={{ marginBottom: 12 }}>Question Type</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                {Object.entries(qbTypeIcons).map(([id, info]) => (
                  <button key={id} onClick={() => setFormType(id)}
                    style={{
                      background: formType === id ? info.color + '15' : 'var(--bg)',
                      border: '2px solid ' + (formType === id ? info.color : 'var(--border)'),
                      borderRadius: 'var(--rmd)', padding: '12px 8px', cursor: 'pointer', textAlign: 'center',
                    }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: info.color, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 13, margin: '0 auto 6px' }}>{info.letter}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: formType === id ? info.color : 'var(--s700)' }}>{info.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 14 }}>
              <div className="ctitle" style={{ marginBottom: 12 }}>Categorization</div>
              <div className="fg">
                <label className="fl">Curriculum</label>
                <select className="fsel" value={formCurriculum} onChange={e => setFormCurriculum(e.target.value)}>
                  {Object.entries(QB_CURRICULA).map(([id, info]) => (<option key={id} value={id}>{info.label}</option>))}
                </select>
              </div>
              <div className="fg">
                <label className="fl">Subject</label>
                <select className="fsel" value={formSubject} onChange={e => { setFormSubject(e.target.value); setFormTopic((QB_DEFAULT_TOPICS[e.target.value] || ['General'])[0]) }}>
                  {QB_SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="fl">Topic</label>
                <select className="fsel" value={formTopic} onChange={e => setFormTopic(e.target.value)}>
                  {formTopics.map(t => <option key={t}>{t}</option>)}
                  <option value="__custom__">+ Add custom topic...</option>
                </select>
                {formTopic === '__custom__' && (
                  <input className="fi" style={{ marginTop: 6 }} placeholder="Type new topic name"
                    value={formCustomTopic} onChange={e => setFormCustomTopic(e.target.value)}/>
                )}
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Difficulty</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Object.entries(qbDifficultyColours).map(([id, info]) => (
                    <button key={id} onClick={() => setFormDifficulty(id)}
                      style={{
                        flex: 1, background: formDifficulty === id ? info.color : 'var(--bg)',
                        color: formDifficulty === id ? '#fff' : info.color,
                        border: '1.5px solid ' + info.color,
                        padding: '8px 12px', borderRadius: 'var(--rsm)',
                        cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                      }}>{info.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 14 }}>
              <div className="ctitle" style={{ marginBottom: 12 }}>Question</div>
              <div className="fg">
                <label className="fl">Question Text *</label>
                <textarea className="fi" rows={3} value={formQuestion} onChange={e => setFormQuestion(e.target.value)}
                  placeholder="e.g. Solve for x:  3x + 7 = 22"
                  style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}/>
              </div>
              {formType === 'mcq' && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s500)', marginBottom: 8, marginTop: 4 }}>Options (at least 2 required)</div>
                  {formOptions.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <input type="radio" checked={formAnswer === opt && opt.trim() !== ''}
                        onChange={() => setFormAnswer(opt)} disabled={!opt.trim()}
                        style={{ accentColor: 'var(--g600)' }}/>
                      <input className="fi" value={opt} onChange={e => {
                        const newOpts = [...formOptions]
                        newOpts[i] = e.target.value
                        setFormOptions(newOpts)
                        if (formAnswer === formOptions[i]) setFormAnswer(e.target.value)
                      }} placeholder={'Option ' + String.fromCharCode(65 + i)} style={{ flex: 1 }}/>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: 'var(--s400)', fontStyle: 'italic' }}>Click the radio next to correct answer</div>
                </>
              )}
              {formType === 'truefalse' && (
                <div className="fg">
                  <label className="fl">Correct Answer *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['True', 'False'].map(v => (
                      <button key={v} onClick={() => setFormAnswer(v)}
                        style={{
                          flex: 1, background: formAnswer === v ? 'var(--g600)' : 'var(--bg)',
                          color: formAnswer === v ? '#fff' : 'var(--s700)',
                          border: '1.5px solid ' + (formAnswer === v ? 'var(--g600)' : 'var(--border)'),
                          padding: 12, borderRadius: 'var(--rmd)', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                        }}>{v}</button>
                    ))}
                  </div>
                </div>
              )}
              {(formType === 'short' || formType === 'essay') && (
                <div className="fg">
                  <label className="fl">{formType === 'essay' ? 'Mark Scheme / Rubric' : 'Expected Answer *'}</label>
                  <textarea className="fi" rows={formType === 'essay' ? 4 : 2} value={formAnswer}
                    onChange={e => setFormAnswer(e.target.value)}
                    placeholder={formType === 'essay' ? 'e.g. 3 marks per point. Look for: thesis, evidence, analysis.' : 'e.g. 5/13'}
                    style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}/>
                </div>
              )}
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Explanation (shown to students after answering)</label>
                <textarea className="fi" rows={2} value={formExplanation} onChange={e => setFormExplanation(e.target.value)}
                  placeholder="Why is this the correct answer?"
                  style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}/>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 14 }}>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Marks</label>
                <input className="fi" type="number" min="1" max="100" value={formMarks}
                  onChange={e => setFormMarks(e.target.value)} style={{ maxWidth: 100 }}/>
                <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4 }}>How many marks this question is worth in an exam</div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 14 }}>
              <div className="ctitle" style={{ marginBottom: 12 }}>Settings</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 12, padding: 10, background: 'var(--bg)', borderRadius: 'var(--rmd)' }}>
                <input type="checkbox" checked={formUseInPractice} onChange={e => setFormUseInPractice(e.target.checked)} style={{ accentColor: 'var(--g600)' }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Available for Adaptive Practice</div>
                  <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>Students can practice this in Adaptive Practice tab</div>
                </div>
              </label>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Visibility</label>
                <select className="fsel" value={formVisibility} onChange={e => setFormVisibility(e.target.value)}>
                  <option value="private">Private (only me)</option>
                  <option value="school">School (all teachers can use)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ position: 'sticky', top: 20 }}>
              <div className="ctitle" style={{ marginBottom: 14 }}>Live Preview</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{
                  background: qbSubjColour(formSubject) + '15', color: qbSubjColour(formSubject),
                  fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
                  padding: '3px 8px', borderRadius: 99, textTransform: 'uppercase',
                }}>{formSubject}</span>
                <span style={{
                  background: qbDifficultyColours[formDifficulty]?.bg || 'var(--bg)',
                  color: qbDifficultyColours[formDifficulty]?.color || 'var(--s500)',
                  fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
                  padding: '3px 8px', borderRadius: 99, textTransform: 'uppercase',
                }}>{qbDifficultyColours[formDifficulty]?.label}</span>
                <span style={{
                  background: 'var(--bg)', color: 'var(--s500)', fontSize: 10, fontWeight: 700,
                  padding: '3px 8px', borderRadius: 99,
                }}>{formMarks} {formMarks === 1 ? 'mark' : 'marks'}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 4 }}>
                {formCurriculum} | {formCustomTopic.trim() || formTopic}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s900)', marginBottom: 16, lineHeight: 1.5 }}>
                {formQuestion || <span style={{ color: 'var(--s400)', fontStyle: 'italic' }}>Question text will appear here...</span>}
              </div>
              {formType === 'mcq' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {formOptions.map((opt, i) => (opt.trim() && (
                    <div key={i} style={{
                      padding: '10px 12px',
                      border: '1.5px solid ' + (formAnswer === opt ? 'var(--g500)' : 'var(--border)'),
                      borderRadius: 'var(--rsm)',
                      background: formAnswer === opt ? 'var(--g50)' : 'var(--bg)',
                      fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: formAnswer === opt ? 'var(--g600)' : 'var(--s200)',
                        color: '#fff', fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>{String.fromCharCode(65 + i)}</span>
                      <span>{opt}</span>
                    </div>
                  )))}
                </div>
              )}
              {formType === 'truefalse' && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {['True', 'False'].map(v => (
                    <div key={v} style={{
                      flex: 1, padding: 12,
                      border: '1.5px solid ' + (formAnswer === v ? 'var(--g500)' : 'var(--border)'),
                      borderRadius: 'var(--rsm)',
                      background: formAnswer === v ? 'var(--g50)' : 'var(--bg)',
                      textAlign: 'center', fontSize: 14, fontWeight: 700,
                      color: formAnswer === v ? 'var(--g700)' : 'var(--s700)',
                    }}>{v}</div>
                  ))}
                </div>
              )}
              {(formType === 'short' || formType === 'essay') && formAnswer && (
                <div style={{
                  background: 'var(--g50)', borderLeft: '3px solid var(--g500)',
                  padding: '10px 14px', borderRadius: 'var(--rsm)',
                  fontSize: 13, color: 'var(--g700)', marginBottom: 14,
                  fontStyle: 'italic', lineHeight: 1.6,
                }}><strong>Answer:</strong> {formAnswer}</div>
              )}
              {formExplanation && (
                <div style={{
                  background: 'var(--b50)', borderLeft: '3px solid var(--b500, #3B82F6)',
                  padding: '10px 14px', borderRadius: 'var(--rsm)',
                  fontSize: 12.5, color: 'var(--b700)', fontStyle: 'italic', lineHeight: 1.6,
                }}><strong>Explanation:</strong> {formExplanation}</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap' }}>
          <button onClick={() => { setView('browse'); setEditingQ(null) }} className="btn btn-s">Cancel</button>
          <button onClick={() => saveQuestion(true)} className="btn btn-s">Save as Draft</button>
          <button onClick={() => saveQuestion(false)} className="btn btn-p">{editingQ ? 'Update Question' : 'Publish to Bank'}</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)', color: '#fff',
      }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Smartious Question Bank
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>Your Questions</h1>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              Build once, use everywhere - exams, homework, adaptive practice
            </div>
          </div>
          <button onClick={openAdd}
            style={{
              background: '#F0CC5A', color: '#1E3A8A', border: 'none',
              padding: '12px 22px', borderRadius: 'var(--rmd)', cursor: 'pointer',
              fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(240,204,90,.3)',
            }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Question
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.2)' }}>
          {[['Total', totalQuestions], ['Published', publishedCount], ['Drafts', draftCount], ['Practice', practiceCount], ['Subjects', subjectCount]].map(([l, v]) => (
            <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--s500)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Search</label>
            <input className="fi" placeholder="Search questions, topics, tags..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ width: '100%' }}/>
          </div>
          <div style={{ minWidth: 130 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--s500)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Curriculum</label>
            <select className="fsel" value={filterCurriculum} onChange={e => setFilterCurriculum(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All</option>
              {Object.entries(QB_CURRICULA).map(([id, info]) => <option key={id} value={id}>{info.label}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--s500)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Subject</label>
            <select className="fsel" value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All</option>
              {QB_SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 130 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--s500)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Difficulty</label>
            <select className="fsel" value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </div>
          <div style={{ minWidth: 110 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--s500)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Type</label>
            <select className="fsel" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All</option><option value="mcq">MCQ</option><option value="short">Short</option><option value="essay">Essay</option><option value="truefalse">T/F</option>
            </select>
          </div>
          <div style={{ minWidth: 110 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--s500)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Status</label>
            <select className="fsel" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All</option><option value="published">Published</option><option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 10 }}>
        Showing <strong style={{ color: 'var(--s900)' }}>{filteredQuestions.length}</strong> of {totalQuestions} questions
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <h3 style={{ fontSize: 17, color: 'var(--s800)', marginBottom: 6 }}>
            {totalQuestions === 0 ? 'No questions yet' : 'No questions match these filters'}
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 380, margin: '0 auto 14px' }}>
            {totalQuestions === 0 ? 'Build your question bank.' : 'Try clearing filters or search terms.'}
          </p>
          {totalQuestions === 0 && <button onClick={openAdd} className="btn btn-p">Add Your First Question</button>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredQuestions.map(q => {
            const subjCol = qbSubjColour(q.subject)
            const diffStyle = qbDifficultyColours[q.difficulty]
            const typeInfo = qbTypeIcons[q.type]
            return (
              <div key={q.id} className="card" style={{
                padding: 14, borderLeft: '4px solid ' + subjCol, cursor: 'pointer',
                opacity: q.status === 'draft' ? 0.7 : 1,
              }} onClick={() => setDetailQ(q)}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: typeInfo.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}>{typeInfo.letter}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4, alignItems: 'center' }}>
                      <span style={{
                        background: subjCol + '15', color: subjCol,
                        fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
                        padding: '2px 7px', borderRadius: 99, textTransform: 'uppercase',
                      }}>{q.subject}</span>
                      <span style={{ fontSize: 11, color: 'var(--s500)' }}>{q.curriculum} | {q.topic}</span>
                      <span style={{
                        background: diffStyle.bg, color: diffStyle.color,
                        fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
                        padding: '2px 7px', borderRadius: 99,
                      }}>{diffStyle.label}</span>
                      {q.status === 'draft' && (
                        <span style={{
                          background: 'var(--bg)', color: 'var(--s500)', border: '1px solid var(--border)',
                          fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
                          padding: '2px 7px', borderRadius: 99,
                        }}>DRAFT</span>
                      )}
                      {q.useInPractice && q.status === 'published' && (
                        <span style={{
                          background: 'var(--g50)', color: 'var(--g600)',
                          fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
                          padding: '2px 7px', borderRadius: 99,
                        }}>PRACTICE</span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: 'var(--s900)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      marginBottom: 4,
                    }}>{q.question}</div>
                    <div style={{ fontSize: 11, color: 'var(--s400)' }}>
                      {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                      {q.timesUsed > 0 && ' | Used ' + q.timesUsed + 'x in exams'}
                      {q.timesAnswered > 0 && ' | Answered ' + q.timesAnswered + 'x'}
                      {q.averageScore !== null && q.averageScore !== undefined && ' | Avg ' + q.averageScore + '%'}
                    </div>
                  </div>
                  <div style={{
                    background: 'var(--bg)', color: 'var(--s700)',
                    padding: '6px 10px', borderRadius: 'var(--rsm)',
                    fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                    flexShrink: 0,
                  }}>{q.marks}m</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detailQ && (
        <div onClick={() => setDetailQ(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', zIndex: 200,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--white)', borderRadius: 'var(--rxl)',
            maxWidth: 720, width: '100%', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,.3)', marginTop: 40, marginBottom: 40,
          }}>
            <div style={{
              padding: '22px 28px',
              background: 'linear-gradient(135deg, ' + qbSubjColour(detailQ.subject) + ', ' + qbSubjColour(detailQ.subject) + 'DD)',
              color: '#fff',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8, marginBottom: 4 }}>
                {detailQ.subject} | {detailQ.curriculum} | {detailQ.topic}
              </div>
              <h3 className="serif" style={{ fontSize: 18, margin: 0, lineHeight: 1.4 }}>{detailQ.question}</h3>
              <div style={{ fontSize: 12, opacity: .85, marginTop: 6 }}>
                {qbTypeIcons[detailQ.type]?.label} | {qbDifficultyColours[detailQ.difficulty]?.label} | {detailQ.marks} {detailQ.marks === 1 ? 'mark' : 'marks'}
              </div>
            </div>

            <div style={{ padding: '20px 28px', maxHeight: '60vh', overflowY: 'auto' }}>
              {detailQ.type === 'mcq' && detailQ.options && (
                <div style={{ marginBottom: 16 }}>
                  <div className="sec-tag" style={{ marginBottom: 8 }}>Options</div>
                  {detailQ.options.map((opt, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', marginBottom: 6,
                      border: '1.5px solid ' + (detailQ.answer === opt ? 'var(--g500)' : 'var(--border)'),
                      borderRadius: 'var(--rsm)',
                      background: detailQ.answer === opt ? 'var(--g50)' : 'var(--bg)',
                      fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: detailQ.answer === opt ? 'var(--g600)' : 'var(--s200)',
                        color: '#fff', fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>{String.fromCharCode(65 + i)}</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              )}
              {detailQ.type === 'truefalse' && (
                <div style={{ marginBottom: 16 }}>
                  <div className="sec-tag" style={{ marginBottom: 8 }}>Correct Answer</div>
                  <div style={{
                    background: 'var(--g50)', color: 'var(--g700)', border: '1.5px solid var(--g500)',
                    padding: '12px 16px', borderRadius: 'var(--rmd)',
                    fontSize: 16, fontWeight: 700, textAlign: 'center',
                  }}>{detailQ.answer}</div>
                </div>
              )}
              {(detailQ.type === 'short' || detailQ.type === 'essay') && detailQ.answer && (
                <div style={{ marginBottom: 16 }}>
                  <div className="sec-tag" style={{ marginBottom: 8 }}>{detailQ.type === 'essay' ? 'Mark Scheme' : 'Expected Answer'}</div>
                  <div style={{
                    background: 'var(--g50)', borderLeft: '3px solid var(--g500)',
                    padding: '10px 14px', borderRadius: 'var(--rsm)',
                    fontSize: 13.5, color: 'var(--g700)',
                    lineHeight: 1.65, whiteSpace: 'pre-wrap',
                  }}>{detailQ.answer}</div>
                </div>
              )}
              {detailQ.explanation && (
                <div style={{ marginBottom: 16 }}>
                  <div className="sec-tag" style={{ marginBottom: 8 }}>Explanation</div>
                  <div style={{
                    background: 'var(--b50)', borderLeft: '3px solid var(--b500, #3B82F6)',
                    padding: '10px 14px', borderRadius: 'var(--rsm)',
                    fontSize: 13, color: 'var(--b700)',
                    fontStyle: 'italic', lineHeight: 1.65,
                  }}>{detailQ.explanation}</div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 14 }}>
                {[
                  ['Used in exams', detailQ.timesUsed || 0],
                  ['Answered', detailQ.timesAnswered || 0],
                  ['Avg score', detailQ.averageScore !== null && detailQ.averageScore !== undefined ? detailQ.averageScore + '%' : 'N/A'],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: 'var(--rsm)' }}>
                    <div style={{ fontSize: 10, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, marginBottom: 2 }}>{l}</div>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--s900)' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--s400)', marginBottom: 4 }}>
                Created by {detailQ.authorName} | {new Date(detailQ.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>

            <div style={{
              padding: '14px 24px', borderTop: '1px solid var(--border)',
              background: 'var(--bg)',
              display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => deleteQuestion(detailQ.id)} className="btn btn-d btn-sm">Delete</button>
                {detailQ.status === 'draft' && (
                  <button onClick={() => { publishDraft(detailQ.id); setDetailQ(null) }} className="btn btn-ok btn-sm">Publish</button>
                )}
                {detailQ.status === 'published' && (
                  <button onClick={() => { togglePractice(detailQ.id); setDetailQ({ ...detailQ, useInPractice: !detailQ.useInPractice }) }} className="btn btn-s btn-sm">
                    {detailQ.useInPractice ? 'Remove from Practice' : 'Add to Practice'}
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setDetailQ(null)} className="btn btn-s btn-sm">Close</button>
                <button onClick={() => { setDetailQ(null); openEdit(detailQ) }} className="btn btn-p btn-sm">Edit</button>
              </div>
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
  const [students, setStudents] = useState(() => msSeedIfEmpty())
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
      author: 'Mr. James Muthomi',
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
// HOMEWORK — Assign and grade workflow
// ═══════════════════════════════════════════════════════════
// Theme: Smartious crimson (#7D1025) + gold (#C9A030) + cream (#FBFAF5)

const HW_ASSIGNED_KEY = 'sm_homework_assigned'
const HW_DRAFTS_KEY   = 'sm_homework_drafts'

const hwSubjColours = {
  'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
  'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
  'Geography': '#0F766E', 'Computer Science': '#1F2937',
  'Business Studies': '#7E22CE', 'Economics': '#9F1239',
}
const hwSubjColour = (s) => hwSubjColours[s] || '#7D1025'

const hwTimeAgo = (iso) => {
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

const hwTimeUntilDue = (iso) => {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff < 0) {
    const overdueDays = Math.floor(-diff / 86400000)
    if (overdueDays === 0) return 'overdue today'
    return overdueDays + 'd overdue'
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

const hwFormatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

const hwLoadAssignments = () => {
  try { return JSON.parse(localStorage.getItem(HW_ASSIGNED_KEY) || '[]') } catch { return [] }
}
const hwSaveAssignments = (items) => {
  try { localStorage.setItem(HW_ASSIGNED_KEY, JSON.stringify(items.slice(-200))) } catch {}
}
const hwLoadStudents = () => {
  try { return JSON.parse(localStorage.getItem('sm_teacher_students') || '[]') } catch { return [] }
}
const hwLoadQuestionBank = () => {
  try { return JSON.parse(localStorage.getItem('sm_question_bank_custom') || '[]') } catch { return [] }
}

const hwGenerateId = () => 'hw-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)

const hwDefaultDueDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  d.setHours(23, 59, 0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

// Seed sample homework on first load
const HW_SEEDED_KEY = 'sm_homework_seeded'
const hwSeedSample = () => {
  if (localStorage.getItem(HW_SEEDED_KEY)) return
  const allStudents = hwLoadStudents()
  if (allStudents.length === 0) return  // Wait until students exist
  const studentIds = allStudents.map(s => s.id)
  const now = Date.now()
  const samples = [
    {
      id: 'hw-sample-1',
      title: 'Quadratic Equations Practice',
      subject: 'Mathematics',
      curriculum: 'IGCSE',
      year: 'Year 10',
      questionIds: [],  // Could reference QB if seeded
      customInstructions: 'Solve all 5 questions on the worksheet. Show all working. Submit photo of your work.',
      dueDate: new Date(now + 3 * 86400000).toISOString(),
      assignedStudents: studentIds,
      totalMarks: 50,
      status: 'active',
      teacher: 'Mr. James Muthomi',
      assignedAt: new Date(now - 1 * 86400000).toISOString(),
      submissions: [
        { studentId: 's4', studentName: 'Brian Otieno', submittedAt: new Date(now - 2 * 3600000).toISOString(), responses: { custom: 'See attached photo' }, grade: null, feedback: null },
        { studentId: 'lydia-id', studentName: 'Lydia Achieng', submittedAt: new Date(now - 4 * 3600000).toISOString(), responses: { custom: 'Worked solutions attached' }, grade: null, feedback: null },
      ],
    },
    {
      id: 'hw-sample-2',
      title: 'Photosynthesis Quiz',
      subject: 'Biology',
      curriculum: 'IGCSE',
      year: 'Year 10',
      questionIds: [],
      customInstructions: '5 short answer questions on photosynthesis. Define each term clearly.',
      dueDate: new Date(now + 1 * 86400000).toISOString(),
      assignedStudents: studentIds,
      totalMarks: 25,
      status: 'active',
      teacher: 'Mr. James Muthomi',
      assignedAt: new Date(now - 2 * 86400000).toISOString(),
      submissions: [
        { studentId: 's1', studentName: 'Amara Osei', submittedAt: new Date(now - 8 * 3600000).toISOString(), responses: { custom: 'Photosynthesis converts light energy into chemical energy in chloroplasts. The process requires CO2, water, and chlorophyll.' }, grade: null, feedback: null },
      ],
    },
    {
      id: 'hw-sample-3',
      title: 'Persuasive Essay: My Future Career',
      subject: 'English',
      curriculum: 'IGCSE',
      year: 'Year 10',
      questionIds: [],
      customInstructions: 'Write a 500-word persuasive essay on why your chosen career is the best fit for you. Submit as text.',
      dueDate: new Date(now - 1 * 86400000).toISOString(),
      assignedStudents: studentIds,
      totalMarks: 30,
      status: 'active',
      teacher: 'Mr. James Muthomi',
      assignedAt: new Date(now - 7 * 86400000).toISOString(),
      submissions: [
        { studentId: 's3', studentName: 'Zara Kamau', submittedAt: new Date(now - 24 * 3600000).toISOString(),
          responses: { custom: 'I want to be a doctor because I have always been fascinated by how the human body works...' },
          grade: null, feedback: null },
      ],
    },
  ]
  hwSaveAssignments(samples)
  localStorage.setItem(HW_SEEDED_KEY, '1')
}

function HomeworkTab({ user, store, setPage, toast }) {
  const [assignments, setAssignments] = useState(() => { hwSeedSample(); return hwLoadAssignments() })
  const [view, setView] = useState('list')  // 'list' | 'create' | 'detail' | 'grade'
  const [selectedHw, setSelectedHw] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [activeTab, setActiveTab] = useState('pending')  // 'pending' | 'active' | 'graded' | 'all'
  const [createStep, setCreateStep] = useState(1)

  // Filters
  const [filterSubject, setFilterSubject] = useState('all')
  const [searchQ, setSearchQ] = useState('')

  // Create form state
  const [formTitle, setFormTitle] = useState('')
  const [formSubject, setFormSubject] = useState('Mathematics')
  const [formCurriculum, setFormCurriculum] = useState('IGCSE')
  const [formYear, setFormYear] = useState('Year 10')
  const [formDueDate, setFormDueDate] = useState(hwDefaultDueDate())
  const [formInstructions, setFormInstructions] = useState('')
  const [formSelectedQuestions, setFormSelectedQuestions] = useState([])
  const [formSelectedStudents, setFormSelectedStudents] = useState([])
  const [bankFilter, setBankFilter] = useState({ subject: 'Mathematics', difficulty: 'all', search: '' })

  // Grade form state
  const [gradeMark, setGradeMark] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [gradePerQuestion, setGradePerQuestion] = useState({})

  const allStudents = hwLoadStudents()
  const questionBank = hwLoadQuestionBank()

  // Derived
  const enrichedAssignments = assignments.map(hw => {
    const submissionsCount = (hw.submissions || []).length
    const gradedCount = (hw.submissions || []).filter(s => s.grade !== null && s.grade !== undefined).length
    const ungradedCount = submissionsCount - gradedCount
    const expectedCount = hw.assignedStudents?.length || 0
    return { ...hw, _submissionsCount: submissionsCount, _gradedCount: gradedCount, _ungradedCount: ungradedCount, _expectedCount: expectedCount }
  })

  // Tab counts
  const counts = {
    all: enrichedAssignments.length,
    active: enrichedAssignments.filter(hw => hw.status === 'active' && hw._ungradedCount === 0 && hw._gradedCount < hw._expectedCount).length,
    pending: enrichedAssignments.filter(hw => hw._ungradedCount > 0).length,
    graded: enrichedAssignments.filter(hw => hw._gradedCount > 0 && hw._gradedCount === hw._submissionsCount).length,
  }

  // Filter for active tab
  const tabFiltered = enrichedAssignments.filter(hw => {
    if (activeTab === 'pending') return hw._ungradedCount > 0
    if (activeTab === 'active') return hw.status === 'active'
    if (activeTab === 'graded') return hw._gradedCount > 0
    return true
  })

  const filtered = tabFiltered.filter(hw => {
    if (filterSubject !== 'all' && hw.subject !== filterSubject) return false
    if (searchQ.trim()) {
      const s = searchQ.toLowerCase()
      if (!hw.title.toLowerCase().includes(s) && !hw.subject.toLowerCase().includes(s)) return false
    }
    return true
  }).sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))

  // Stats for hero
  const stats = {
    total: assignments.length,
    pendingGrading: enrichedAssignments.reduce((sum, hw) => sum + hw._ungradedCount, 0),
    submissions: enrichedAssignments.reduce((sum, hw) => sum + hw._submissionsCount, 0),
    students: allStudents.length,
  }

  // Filter question bank for picker
  const filteredBank = questionBank.filter(q => {
    if (q.status !== 'published') return false
    if (bankFilter.subject !== 'all' && q.subject !== bankFilter.subject) return false
    if (bankFilter.difficulty !== 'all' && q.difficulty !== bankFilter.difficulty) return false
    if (bankFilter.search.trim()) {
      const s = bankFilter.search.toLowerCase()
      if (!q.question.toLowerCase().includes(s) && !q.topic.toLowerCase().includes(s)) return false
    }
    return true
  })

  const formTotalMarks = formSelectedQuestions.reduce((sum, qid) => {
    const q = questionBank.find(qq => qq.id === qid)
    return sum + (q?.marks || 0)
  }, 0)

  // ── ACTIONS ─────────────────────────────────────────
  const resetForm = () => {
    setFormTitle('')
    setFormSubject('Mathematics')
    setFormCurriculum('IGCSE')
    setFormYear('Year 10')
    setFormDueDate(hwDefaultDueDate())
    setFormInstructions('')
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

  const validateCreateStep = (step) => {
    if (step === 1) {
      if (!formTitle.trim()) { toast?.error?.('Title is required.'); return false }
      if (!formDueDate) { toast?.error?.('Due date is required.'); return false }
      return true
    }
    if (step === 2) {
      if (formSelectedQuestions.length === 0 && !formInstructions.trim()) {
        toast?.error?.('Add at least one question OR write custom instructions.')
        return false
      }
      return true
    }
    if (step === 3) {
      if (formSelectedStudents.length === 0) { toast?.error?.('Assign to at least one student.'); return false }
      return true
    }
    return true
  }

  const assignHomework = () => {
    if (!validateCreateStep(1) || !validateCreateStep(2) || !validateCreateStep(3)) return
    const newHw = {
      id: hwGenerateId(),
      title: formTitle.trim(),
      subject: formSubject,
      curriculum: formCurriculum,
      year: formYear,
      questionIds: formSelectedQuestions,
      customInstructions: formInstructions.trim(),
      dueDate: new Date(formDueDate).toISOString(),
      assignedStudents: formSelectedStudents,
      totalMarks: formTotalMarks || 100,
      status: 'active',
      teacher: 'Mr. James Muthomi',
      assignedAt: new Date().toISOString(),
      submissions: [],
    }
    const updated = [newHw, ...assignments]
    setAssignments(updated)
    hwSaveAssignments(updated)
    toast?.ok?.('Homework assigned to ' + formSelectedStudents.length + ' students.')
    setView('list')
    resetForm()
  }

  const deleteHomework = (id) => {
    const updated = assignments.filter(hw => hw.id !== id)
    setAssignments(updated)
    hwSaveAssignments(updated)
    toast?.ok?.('Homework deleted.')
    setView('list')
    setSelectedHw(null)
  }

  const openDetail = (hw) => {
    setSelectedHw(hw)
    setView('detail')
  }

  const openGrade = (hw, submission) => {
    setSelectedHw(hw)
    setSelectedSubmission(submission)
    setGradeMark(submission.grade !== null && submission.grade !== undefined ? String(submission.grade) : '')
    setGradeFeedback(submission.feedback || '')
    setGradePerQuestion(submission.perQuestionGrades || {})
    setView('grade')
  }

  const saveGrade = () => {
    if (!gradeMark || isNaN(parseFloat(gradeMark))) {
      toast?.error?.('Please enter a valid mark.')
      return
    }
    const mark = parseFloat(gradeMark)
    if (mark < 0 || mark > selectedHw.totalMarks) {
      toast?.error?.('Mark must be between 0 and ' + selectedHw.totalMarks + '.')
      return
    }

    const updated = assignments.map(hw => {
      if (hw.id !== selectedHw.id) return hw
      return {
        ...hw,
        submissions: (hw.submissions || []).map(sub => {
          if (sub.studentId !== selectedSubmission.studentId) return sub
          return {
            ...sub,
            grade: mark,
            feedback: gradeFeedback.trim(),
            perQuestionGrades: gradePerQuestion,
            gradedAt: new Date().toISOString(),
          }
        }),
      }
    })
    setAssignments(updated)
    hwSaveAssignments(updated)
    toast?.ok?.('Grade saved. Student will see ' + mark + '/' + selectedHw.totalMarks + ' (' + Math.round(mark / selectedHw.totalMarks * 100) + '%)')
    setView('detail')
    setSelectedSubmission(null)
  }

  // ── RENDER: GRADE VIEW ──────────────────────────────
  if (view === 'grade' && selectedHw && selectedSubmission) {
    const subjCol = hwSubjColour(selectedHw.subject)
    const hwQuestions = (selectedHw.questionIds || []).map(qid => questionBank.find(q => q.id === qid)).filter(Boolean)
    const studentRecord = allStudents.find(s => s.id === selectedSubmission.studentId)
    const previewPercent = gradeMark ? Math.round(parseFloat(gradeMark) / selectedHw.totalMarks * 100) : null

    return (
      <div>
        <button onClick={() => { setView('detail'); setSelectedSubmission(null) }}
          style={{
            background: 'transparent', border: 'none', color: '#7D1025',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            padding: '6px 0', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Submissions
        </button>

        {/* Hero */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
          color: '#FBFAF5',
        }}>
          <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#C9A030',
              border: '3px solid #F0CC5A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#7D1025',
              fontSize: 22, fontWeight: 700,
              fontFamily: "'Instrument Serif', serif",
              flexShrink: 0,
            }}>{studentRecord?.initials || selectedSubmission.studentName.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 4, color: '#F0CC5A' }}>
                Grading Submission
              </div>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400, margin: 0, lineHeight: 1.2 }}>
                {selectedSubmission.studentName}
              </h1>
              <div style={{ fontSize: 13, opacity: .9, marginTop: 4 }}>
                {selectedHw.title} | Submitted {hwTimeAgo(selectedSubmission.submittedAt)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 14 }}>
          {/* LEFT: Student's submission */}
          <div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Student's Submission</div>

              {selectedSubmission.responses?.custom && (
                <div style={{
                  background: '#FBFAF5', borderLeft: '3px solid #C9A030',
                  padding: '14px 16px', borderRadius: 'var(--rsm)',
                  fontSize: 13.5, color: 'var(--s700)', lineHeight: 1.7,
                  whiteSpace: 'pre-wrap', marginBottom: 14,
                }}>{selectedSubmission.responses.custom}</div>
              )}

              {hwQuestions.length > 0 && hwQuestions.map((q, i) => {
                const studentAnswer = selectedSubmission.responses?.[q.id]
                return (
                  <div key={q.id} style={{
                    padding: 14, marginBottom: 10,
                    background: '#FBFAF5',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--rmd)',
                  }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                      <span className="mono" style={{
                        fontSize: 11, fontWeight: 700, color: '#7D1025',
                        background: '#FBE8E8', padding: '2px 8px', borderRadius: 'var(--rsm)',
                        flexShrink: 0,
                      }}>Q{i + 1}</span>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--s900)' }}>{q.question}</div>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Student's Answer</div>
                      <div style={{
                        background: '#FFF',
                        border: '1px solid var(--border)',
                        padding: '8px 12px', borderRadius: 'var(--rsm)',
                        fontSize: 13, color: 'var(--s800)',
                        whiteSpace: 'pre-wrap', lineHeight: 1.6,
                      }}>{studentAnswer || <span style={{ color: 'var(--s400)', fontStyle: 'italic' }}>No answer provided</span>}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Expected Answer</div>
                      <div style={{
                        background: '#DCFCE7',
                        border: '1px solid #86EFAC',
                        padding: '8px 12px', borderRadius: 'var(--rsm)',
                        fontSize: 13, color: '#15803D', fontWeight: 600,
                      }}>{q.answer || '—'}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                      <span style={{ fontSize: 11, color: 'var(--s500)' }}>Mark for this question:</span>
                      <input type="number" min="0" max={q.marks}
                        value={gradePerQuestion[q.id] || ''}
                        onChange={e => setGradePerQuestion({ ...gradePerQuestion, [q.id]: e.target.value })}
                        style={{
                          width: 70, padding: '6px 10px',
                          border: '1.5px solid var(--border)',
                          borderRadius: 'var(--rsm)',
                          fontSize: 13, fontFamily: 'JetBrains Mono, monospace',
                        }}/>
                      <span style={{ fontSize: 12, color: 'var(--s500)', fontFamily: 'JetBrains Mono, monospace' }}>/ {q.marks}</span>
                    </div>
                  </div>
                )
              })}

              {hwQuestions.length === 0 && !selectedSubmission.responses?.custom && (
                <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>
                  No submission content available.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Grading panel */}
          <div>
            <div className="card" style={{ position: 'sticky', top: 20, background: '#FBFAF5', border: '2px solid #C9A030' }}>
              <div className="ctitle" style={{ marginBottom: 14, color: '#7D1025' }}>Grade & Feedback</div>

              <div className="fg">
                <label className="fl">Total Mark *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input className="fi" type="number" min="0" max={selectedHw.totalMarks}
                    value={gradeMark} onChange={e => setGradeMark(e.target.value)}
                    placeholder="0"
                    style={{ width: 100, fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: '#7D1025' }}/>
                  <span style={{ fontSize: 14, color: 'var(--s500)', fontFamily: 'JetBrains Mono, monospace' }}>/ {selectedHw.totalMarks}</span>
                </div>
                {previewPercent !== null && (
                  <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 6 }}>
                    Percentage: <strong style={{ color: previewPercent >= 75 ? '#15803D' : previewPercent >= 60 ? '#B45309' : '#B91C1C' }}>{previewPercent}%</strong>
                    {' '}|{' '}Grade: <strong>{previewPercent >= 80 ? 'A' : previewPercent >= 70 ? 'B' : previewPercent >= 60 ? 'C' : previewPercent >= 50 ? 'D' : 'F'}</strong>
                  </div>
                )}
              </div>

              <div className="fg" style={{ marginBottom: 14 }}>
                <label className="fl">Feedback to Student</label>
                <textarea className="fi" rows={6} value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  placeholder="What did they do well? What should they work on next?"
                  style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}/>
              </div>

              <button onClick={saveGrade}
                style={{
                  background: '#7D1025', color: '#FBFAF5', border: 'none',
                  padding: '12px 20px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(125,16,37,.25)',
                }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Save Grade and Release to Student
              </button>

              <div style={{
                background: '#FFF', borderLeft: '3px solid #7D1025',
                padding: '10px 12px', borderRadius: 'var(--rsm)',
                fontSize: 11.5, color: 'var(--s700)', marginTop: 12,
                lineHeight: 1.6,
              }}>
                <strong style={{ color: '#7D1025' }}>What happens:</strong> Student will see this grade and feedback in their Homework tab. The grade contributes to their mastery and overall stats.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── RENDER: DETAIL VIEW ─────────────────────────────
  if (view === 'detail' && selectedHw) {
    const subjCol = hwSubjColour(selectedHw.subject)
    const submissions = selectedHw.submissions || []
    const expectedStudents = (selectedHw.assignedStudents || []).map(sid => allStudents.find(s => s.id === sid)).filter(Boolean)
    const submittedStudentIds = submissions.map(s => s.studentId)
    const notSubmittedStudents = expectedStudents.filter(s => !submittedStudentIds.includes(s.id))

    const ungraded = submissions.filter(s => s.grade === null || s.grade === undefined)
    const graded = submissions.filter(s => s.grade !== null && s.grade !== undefined)

    return (
      <div>
        <button onClick={() => { setView('list'); setSelectedHw(null) }}
          style={{
            background: 'transparent', border: 'none', color: '#7D1025',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            padding: '6px 0', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Homework List
        </button>

        {/* Hero */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)',
          color: '#FBFAF5',
        }}>
          <div style={{ padding: '28px 30px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 4, color: '#F0CC5A' }}>
              {selectedHw.subject} | {selectedHw.curriculum} {selectedHw.year}
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.2 }}>
              {selectedHw.title}
            </h1>
            <div style={{ fontSize: 13, opacity: .9, marginTop: 6 }}>
              Assigned {hwTimeAgo(selectedHw.assignedAt)} | <strong style={{ color: '#F0CC5A' }}>{hwTimeUntilDue(selectedHw.dueDate)}</strong>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
            {[
              ['Assigned',     expectedStudents.length, '#FBFAF5'],
              ['Submitted',    submissions.length,      submissions.length > 0 ? '#F0CC5A' : '#FBFAF5'],
              ['To Grade',     ungraded.length,         ungraded.length > 0 ? '#FCA5A5' : '#FBFAF5'],
              ['Graded',       graded.length,           '#86EFAC'],
              ['Total Marks',  selectedHw.totalMarks,   '#F0CC5A'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ padding: '14px 18px', borderRight: '1px solid rgba(251,250,245,.08)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7, marginBottom: 2, color: '#F0CC5A' }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        {selectedHw.customInstructions && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="ctitle" style={{ marginBottom: 8, color: '#7D1025' }}>Instructions</div>
            <div style={{
              background: '#FBFAF5', borderLeft: '3px solid #C9A030',
              padding: '12px 16px', borderRadius: 'var(--rsm)',
              fontSize: 13.5, color: 'var(--s700)', lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}>{selectedHw.customInstructions}</div>
          </div>
        )}

        {/* Submissions to grade */}
        {ungraded.length > 0 && (
          <div className="card" style={{ marginBottom: 14, border: '2px solid #C9A030' }}>
            <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>
              Awaiting Your Grade ({ungraded.length})
            </div>
            {ungraded.map((sub, i) => (
              <div key={sub.studentId + i} style={{
                display: 'flex', gap: 12, padding: '12px 0',
                borderBottom: i < ungraded.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center', cursor: 'pointer',
              }} onClick={() => openGrade(selectedHw, sub)}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: msAvatarColor(sub.studentName), color: '#FBFAF5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 12, flexShrink: 0,
                }}>{sub.studentName.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{sub.studentName}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>Submitted {hwTimeAgo(sub.submittedAt)}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); openGrade(selectedHw, sub) }}
                  style={{
                    background: '#7D1025', color: '#FBFAF5', border: 'none',
                    padding: '8px 16px', borderRadius: 'var(--rsm)',
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  }}>Grade Now</button>
              </div>
            ))}
          </div>
        )}

        {/* Graded submissions */}
        {graded.length > 0 && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>
              Graded ({graded.length})
            </div>
            {graded.map((sub, i) => {
              const pct = Math.round(sub.grade / selectedHw.totalMarks * 100)
              const gradeCol = pct >= 80 ? '#15803D' : pct >= 60 ? '#B45309' : '#B91C1C'
              return (
                <div key={sub.studentId + i} style={{
                  display: 'flex', gap: 12, padding: '12px 0',
                  borderBottom: i < graded.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'center', cursor: 'pointer',
                }} onClick={() => openGrade(selectedHw, sub)}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: msAvatarColor(sub.studentName), color: '#FBFAF5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 12, flexShrink: 0,
                  }}>{sub.studentName.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{sub.studentName}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>Graded {hwTimeAgo(sub.gradedAt || sub.submittedAt)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: gradeCol }}>{sub.grade}/{selectedHw.totalMarks}</div>
                    <div className="mono" style={{ fontSize: 11, color: gradeCol, fontWeight: 700 }}>{pct}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Not yet submitted */}
        {notSubmittedStudents.length > 0 && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>
              Not Yet Submitted ({notSubmittedStudents.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {notSubmittedStudents.map(s => (
                <span key={s.id} style={{
                  background: '#FBFAF5', color: 'var(--s500)',
                  border: '1px solid var(--border)',
                  fontSize: 12, fontWeight: 600,
                  padding: '5px 12px', borderRadius: 99,
                }}>{s.name}</span>
              ))}
            </div>
            <button
              onClick={() => toast?.info?.('Reminder will be sent (Communication module pending).')}
              style={{
                background: 'transparent', color: '#7D1025',
                border: '1.5px solid #7D1025',
                padding: '8px 14px', borderRadius: 'var(--rmd)',
                cursor: 'pointer', fontSize: 12, fontWeight: 700,
                marginTop: 14,
              }}>Send Reminder to All</button>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap' }}>
          <button onClick={() => { if (confirm('Delete this homework? All submissions will be lost.')) deleteHomework(selectedHw.id) }}
            style={{
              background: '#FEE2E2', color: '#B91C1C',
              border: '1px solid #FCA5A5',
              padding: '10px 18px', borderRadius: 'var(--rmd)',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>Delete Homework</button>
          <button onClick={() => { setView('list'); setSelectedHw(null) }} className="btn btn-s">Close</button>
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
            background: 'transparent', border: 'none', color: '#7D1025',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            padding: '6px 0', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Homework List
        </button>

        <div style={{ marginBottom: 18 }}>
          <div className="sec-tag" style={{ color: '#7D1025' }}>Assign New Homework</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>
            Create <em style={{ color: '#7D1025' }}>Homework</em>
          </h2>
        </div>

        {/* Step indicators */}
        <div style={{
          background: '#FBFAF5', borderRadius: 'var(--rmd)',
          padding: 14, marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          {[
            { n: 1, label: 'Details' },
            { n: 2, label: 'Content' },
            { n: 3, label: 'Assign' },
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
            <div className="ctitle" style={{ marginBottom: 16, color: '#7D1025' }}>Homework Details</div>
            <div className="fg">
              <label className="fl">Title *</label>
              <input className="fi" value={formTitle} onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. Chapter 5 Practice: Quadratic Equations"/>
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
            <div className="fg" style={{ marginTop: 14, marginBottom: 0 }}>
              <label className="fl">Due Date *</label>
              <input className="fi" type="datetime-local" value={formDueDate}
                onChange={e => setFormDueDate(e.target.value)}/>
              <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4 }}>
                Students can submit anytime before this. Late submissions still allowed but flagged.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button onClick={() => { if (validateCreateStep(1)) setCreateStep(2) }}
                style={{
                  background: '#7D1025', color: '#FBFAF5', border: 'none',
                  padding: '10px 20px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                Continue to Content
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONTENT */}
        {createStep === 2 && (
          <div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Custom Instructions</div>
              <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 8 }}>
                Free-form instructions for students. Use this for essay prompts, worksheets, or open-ended assignments.
              </div>
              <textarea className="fi" rows={5} value={formInstructions}
                onChange={e => setFormInstructions(e.target.value)}
                placeholder="e.g. Read pages 45-58. Write a 300-word reflection on the main themes. Submit as text by Friday."
                style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}/>
            </div>

            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div className="ctitle" style={{ color: '#7D1025' }}>
                  Pick from Question Bank
                  {formSelectedQuestions.length > 0 && (
                    <span style={{
                      marginLeft: 10,
                      background: '#C9A030', color: '#7D1025',
                      fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
                      padding: '3px 10px', borderRadius: 99,
                    }}>{formSelectedQuestions.length} selected | {formTotalMarks} marks</span>
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
              <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 14 }}>
                Optional: pair instructions with structured questions from your bank. Students answer each one.
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
              {filteredBank.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>
                  No questions found. Add to Question Bank, or skip and use just instructions.
                </div>
              ) : (
                <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredBank.map(q => {
                    const isSelected = formSelectedQuestions.includes(q.id)
                    const subjCol = hwSubjColour(q.subject)
                    return (
                      <div key={q.id} onClick={() => toggleQuestion(q.id)}
                        style={{
                          padding: 10,
                          border: '1.5px solid ' + (isSelected ? '#7D1025' : 'var(--border)'),
                          borderRadius: 'var(--rmd)',
                          background: isSelected ? '#FBE8E8' : '#FBFAF5',
                          cursor: 'pointer',
                          display: 'flex', gap: 10, alignItems: 'flex-start',
                        }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 4,
                          background: isSelected ? '#7D1025' : '#FFF',
                          border: '2px solid ' + (isSelected ? '#7D1025' : 'var(--border)'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 2,
                        }}>
                          {isSelected && (
                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#FBFAF5" strokeWidth="3" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{
                              background: subjCol + '15', color: subjCol,
                              fontSize: 9, fontWeight: 700, letterSpacing: '.06em',
                              padding: '2px 6px', borderRadius: 99, textTransform: 'uppercase',
                            }}>{q.subject}</span>
                            <span style={{ fontSize: 10, color: 'var(--s500)' }}>{q.topic} | {q.difficulty}</span>
                          </div>
                          <div style={{ fontSize: 12.5, color: 'var(--s900)', fontWeight: 600 }}>{q.question}</div>
                        </div>
                        <span style={{
                          background: 'var(--bg)', color: 'var(--s700)',
                          padding: '3px 7px', borderRadius: 'var(--rsm)',
                          fontSize: 10.5, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
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
              <button onClick={() => { if (validateCreateStep(2)) setCreateStep(3) }}
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

        {/* STEP 3: ASSIGN */}
        {createStep === 3 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                  <div className="ctitle" style={{ color: '#7D1025' }}>
                    Students ({formSelectedStudents.length}/{allStudents.length})
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setFormSelectedStudents(allStudents.map(s => s.id))}
                      style={{
                        background: '#FBFAF5', color: '#7D1025',
                        border: '1px solid #F4C5C5',
                        padding: '4px 10px', borderRadius: 'var(--rsm)',
                        cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      }}>Select All</button>
                    <button onClick={() => setFormSelectedStudents([])}
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

              <div className="card" style={{ background: '#FBFAF5', border: '2px solid #C9A030' }}>
                <div className="ctitle" style={{ marginBottom: 12, color: '#7D1025' }}>Homework Summary</div>
                {[
                  ['Title',          formTitle || '—'],
                  ['Subject',        formSubject + ' | ' + formCurriculum + ' | ' + formYear],
                  ['Due',            formDueDate ? hwFormatDate(new Date(formDueDate).toISOString()) : '—'],
                  ['Questions',      formSelectedQuestions.length || '—'],
                  ['Total Marks',    formTotalMarks || (formInstructions ? '100 (default)' : 0)],
                  ['Students',       formSelectedStudents.length],
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
                  <br/>Students see this in their Homework tab immediately. They submit by the due date. You grade via the Pending tab.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setCreateStep(2)} className="btn btn-s">Back</button>
              <button onClick={assignHomework}
                style={{
                  background: '#C9A030', color: '#7D1025', border: 'none',
                  padding: '12px 24px', borderRadius: 'var(--rmd)',
                  cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(201,160,48,.35)',
                }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Assign to Students
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
              Homework
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Assign and Grade
            </h1>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              Build assignments from Question Bank or write custom prompts. Grade per submission with feedback.
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
            Assign Homework
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
          {[
            ['Total',        stats.total,          '#FBFAF5'],
            ['To Grade',     stats.pendingGrading, stats.pendingGrading > 0 ? '#FCA5A5' : '#FBFAF5'],
            ['Submissions',  stats.submissions,    '#F0CC5A'],
            ['Students',     stats.students,       '#FBFAF5'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(251,250,245,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7, marginBottom: 2, color: '#F0CC5A' }}>{l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex',
        background: '#FBFAF5',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rmd)',
        padding: 4, marginBottom: 14, gap: 2, flexWrap: 'wrap',
      }}>
        {[
          { id: 'pending', label: 'Pending Grading', count: counts.pending, hot: true },
          { id: 'active',  label: 'Active',          count: counts.active },
          { id: 'graded',  label: 'Graded',          count: counts.graded },
          { id: 'all',     label: 'All',             count: counts.all },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, minWidth: 100,
              background: activeTab === t.id ? '#7D1025' : 'transparent',
              color: activeTab === t.id ? '#FBFAF5' : 'var(--s500)',
              border: 'none', padding: '10px 14px',
              borderRadius: 'var(--rsm)', cursor: 'pointer',
              fontSize: 13, fontWeight: 700,
              boxShadow: activeTab === t.id ? '0 4px 16px rgba(125,16,37,.15)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: activeTab === t.id ? 'rgba(251,250,245,.2)' : (t.hot ? '#FEE2E2' : 'var(--bg)'),
                color: activeTab === t.id ? '#FBFAF5' : (t.hot ? '#B91C1C' : 'var(--s500)'),
                fontSize: 10, fontWeight: 800,
                padding: '2px 7px', borderRadius: 99,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7D1025', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Search</label>
            <input className="fi" placeholder="Search by title or subject..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ width: '100%' }}/>
          </div>
          <div style={{ minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7D1025', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Subject</label>
            <select className="fsel" value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All</option>
              {QB_SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 10 }}>
        Showing <strong style={{ color: '#7D1025' }}>{filtered.length}</strong> assignments
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <h3 style={{ fontSize: 17, color: 'var(--s800)', marginBottom: 6 }}>
            {stats.total === 0 ? 'No homework yet' : 'Nothing in this tab'}
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 380, margin: '0 auto 14px' }}>
            {stats.total === 0
              ? 'Assign your first homework. Pick from Question Bank, write custom instructions, set a due date.'
              : 'Try a different tab or clear filters.'}
          </p>
          {stats.total === 0 && (
            <button onClick={openCreate}
              style={{
                background: '#7D1025', color: '#FBFAF5', border: 'none',
                padding: '10px 20px', borderRadius: 'var(--rmd)',
                cursor: 'pointer', fontSize: 14, fontWeight: 700,
              }}>Assign Your First Homework</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(hw => {
            const subjCol = hwSubjColour(hw.subject)
            const dueText = hwTimeUntilDue(hw.dueDate)
            const isOverdue = new Date(hw.dueDate).getTime() < Date.now()
            return (
              <div key={hw.id} className="card" style={{
                padding: 14, borderLeft: '4px solid ' + subjCol, cursor: 'pointer',
              }} onClick={() => openDetail(hw)}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: subjCol, letterSpacing: '.06em', textTransform: 'uppercase' }}>{hw.subject}</span>
                      <span style={{ fontSize: 11, color: 'var(--s500)' }}>{hw.curriculum} {hw.year}</span>
                      {hw._ungradedCount > 0 && (
                        <span style={{
                          background: '#FEE2E2', color: '#B91C1C',
                          fontSize: 9.5, fontWeight: 800, letterSpacing: '.06em',
                          padding: '2px 8px', borderRadius: 99,
                        }}>{hw._ungradedCount} TO GRADE</span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--s900)', marginBottom: 4 }}>{hw.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                      Assigned {hwTimeAgo(hw.assignedAt)} | <strong style={{ color: isOverdue ? '#B91C1C' : '#7D1025' }}>{dueText}</strong> | {hw.assignedStudents.length} students
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--s700)' }}>
                        {hw._submissionsCount}/{hw._expectedCount}
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Submitted</div>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 70 }}>
                      <div className="mono" style={{
                        fontSize: 14, fontWeight: 700,
                        color: hw._gradedCount === hw._submissionsCount && hw._submissionsCount > 0 ? '#15803D' : '#B45309',
                      }}>{hw._gradedCount}</div>
                      <div style={{ fontSize: 9.5, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Graded</div>
                    </div>
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
