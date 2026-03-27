import { useState, useRef, useEffect } from 'react'
import { useToast, api } from '../../context/ctx.jsx'
import { useStore } from '../../context/ctx.jsx'
import Modal from '../../components/ui/Modal.jsx'
import LiveClassroom from '../../components/ui/LiveClassroom.jsx'

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
    resources:'Resource Library', exambuilder:'Exam Builder', blog:'Blog & Earnings',
    liveclass:'Live Lessons', allocations:'My Allocations', payslips:'Payslips & Earnings',
    marking:'AI Marking & Integrity', reports:'Reports & Analytics'
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
      {id:'resources',   label:'Resource Library', icon:'M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13|M4 19a2 2 0 0 0 2 2h14|M8 10h8M8 14h6'},
      {id:'exambuilder', label:'Exam Builder',     icon:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2|rect:9:3:6:4:1.5|line:9:12:15:12|line:9:16:12:16'},
      {id:'blog',        label:'Blog & Earnings',  icon:'M12 19l7-7 3 3-7 7-3-3z|M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z|M2 2l7.586 7.586|circle:11:11:2', badge:'3', badgeCol:'var(--g600)'},
    ]},
    { section:'Assessment', items:[
      {id:'liveclass',   label:'Live Lessons',        icon:'poly:23 7 16 12 23 17 23 7|rect:1:5:15:14:2', live:true},
      {id:'allocations', label:'My Allocations',      icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|circle:9:7:4|line:19:8:19:14|line:22:11:16:11', badge:'3', badgeCol:'var(--b700)'},
      {id:'payslips',    label:'Payslips',            icon:'rect:2:5:20:14:2|line:2:10:22:10|line:6:15:10:15|line:14:15:18:15'},
      {id:'marking',     label:'AI Marking',          icon:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'},
      {id:'reports',     label:'Reports & Analytics', icon:'pline:22 12 18 12 15 21 9 3 6 12 2 12'},
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
          {page === 'students' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <div><div className="sec-tag">IGCSE Form 3 · Mathematics</div><h2 className="serif" style={{fontSize:24,color:'var(--s900)'}}>My <em style={{color:'var(--b700)'}}>Students</em></h2></div>
                <div style={{display:'flex',gap:10}}>
                  <input className="fi" style={{maxWidth:240}} placeholder="Search students…"/>
                  <button className="btn btn-p btn-sm" onClick={() => toast.ok('Exporting class report…')}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export Report
                  </button>
                </div>
              </div>
              <div className="card" style={{padding:0,overflow:'hidden'}}>
                <table className="tbl">
                  <thead><tr><th>Student</th><th>Latest Score</th><th>Trend</th><th>Attendance</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {STUDENTS.map((s,i) => {
                      const sc = s.score>=75?'var(--g600)':s.score>=60?'var(--a600)':'var(--r500)'
                      const stCol = s.status==='Excellent'?{color:'var(--g700)',borderColor:'#BBF7D0',background:'var(--g50)'}:s.status==='At Risk'?{color:'var(--r600)',borderColor:'var(--r100)',background:'var(--r50)'}:{color:'var(--b700)',borderColor:'var(--b200)',background:'var(--b50)'}
                      return (
                        <tr key={i}>
                          <td><div style={{display:'flex',alignItems:'center',gap:10}}><Av init={s.init} col={s.col} size={34}/><div style={{fontWeight:600,fontSize:14}}>{s.name}</div></div></td>
                          <td><span className="mono" style={{fontWeight:700,color:sc}}>{s.score}%</span></td>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:4,fontSize:13,fontWeight:600,color:s.trend==='up'?'var(--g600)':'var(--r500)'}}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{transform:s.trend==='up'?'rotate(-90deg)':'rotate(90deg)'}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                              {s.trend==='up'?'Improving':'Declining'}
                            </div>
                          </td>
                          <td><span className="mono" style={{fontWeight:600,fontSize:13,color:s.att>=90?'var(--g600)':s.att>=80?'var(--a600)':'var(--r500)'}}>{s.att}%</span></td>
                          <td><span className="badge" style={stCol}>{s.status}</span></td>
                          <td style={{display:'flex',gap:6}}>
                            <button className="btn btn-g btn-sm" onClick={() => toast.info(`Opening profile: ${s.name}`)}>Profile</button>
                            <button className="btn btn-s btn-sm" onClick={() => loadHeatmap(s.id||`demo-${i}`, s.name)}>
                              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                              Mastery
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

            {/* ── MASTERY HEATMAP PANEL ── */}
            {(heatmapStudent || heatmapLoading) && (
              <div className="card" style={{marginTop:20,animation:'fadeUp .3s ease'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <div>
                    <div className="sec-tag">Per-Topic Mastery</div>
                    <h3 className="serif" style={{fontSize:20,color:'var(--s900)'}}>
                      {heatmapStudent} — Mastery Heatmap
                    </h3>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <div style={{display:'flex',gap:6,alignItems:'center',fontSize:12,color:'var(--s500)'}}>
                      {[['var(--g500)','Mastered (80%+)'],['var(--b600)','Progressing (60%)'],['var(--a600)','Building (40%)'],['var(--r500)','Needs Help']].map(([c,l]) => (
                        <div key={l} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:10,height:10,borderRadius:2,background:c}}/><span>{l}</span></div>
                      ))}
                    </div>
                    <button className="btn btn-g btn-sm" onClick={() => {setHeatmapStudent(null);setHeatmapData(null)}}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>

                {heatmapLoading ? (
                  <div className="lc"><div className="spinner"/></div>
                ) : heatmapData ? (
                  <div style={{display:'flex',flexDirection:'column',gap:16}}>
                    {heatmapData.map((subj, si) => (
                      <div key={si}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                          <span style={{fontWeight:700,fontSize:14,color:'var(--s800)',minWidth:160}}>{subj.subject}</span>
                          <div style={{flex:1,height:8,background:'var(--s100)',borderRadius:999,overflow:'hidden'}}>
                            <div style={{width:subj.overall+'%',height:'100%',background:mCol(subj.overall),borderRadius:999,transition:'width 1s ease'}}/>
                          </div>
                          <span className="mono" style={{fontSize:13,fontWeight:700,color:mCol(subj.overall),minWidth:36}}>{subj.overall}%</span>
                          {subj.velocity !== 0 && (
                            <span style={{fontSize:11,fontWeight:700,color:subj.velocity>0?'var(--g600)':'var(--r500)'}}>
                              {subj.velocity > 0 ? '↑' : '↓'}{Math.abs(subj.velocity)}%
                            </span>
                          )}
                        </div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                          {subj.topics.map((t, ti) => (
                            <div key={ti} title={`${t.name}: ${t.pct}% — ${mLabel(t.pct)} — ${t.attempts} sessions`}
                              style={{
                                padding:'5px 10px',
                                borderRadius:'var(--rsm)',
                                fontSize:12,
                                fontWeight:600,
                                background: t.pct >= 80 ? 'var(--g50)' : t.pct >= 60 ? 'var(--b50)' : t.pct >= 40 ? 'var(--a50)' : t.pct > 0 ? 'var(--r50)' : 'var(--s50)',
                                color: mCol(t.pct),
                                border: `1.5px solid ${t.pct >= 80 ? '#BBF7D0' : t.pct >= 60 ? 'var(--b200)' : t.pct >= 40 ? '#FDE68A' : t.pct > 0 ? '#FECACA' : 'var(--s200)'}`,
                                cursor:'pointer',
                              }}
                              onClick={() => toast.info(`${t.name}: ${t.pct}% mastery · ${mLabel(t.pct)} · ${t.attempts} sessions`)}>
                              {t.name}
                              <span className="mono" style={{marginLeft:6,fontSize:11}}>{t.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div style={{background:'var(--bg)',borderRadius:'var(--rmd)',padding:14,display:'flex',gap:20,flexWrap:'wrap',fontSize:13,color:'var(--s500)'}}>
                      <div>Topics needing intervention: <strong style={{color:'var(--r600)'}}>{heatmapData.flatMap(s=>s.topics).filter(t=>t.pct>0&&t.pct<50).length}</strong></div>
                      <div>Topics mastered: <strong style={{color:'var(--g600)'}}>{heatmapData.flatMap(s=>s.topics).filter(t=>t.pct>=80).length}</strong></div>
                      <div>Not yet started: <strong style={{color:'var(--s400)'}}>{heatmapData.flatMap(s=>s.topics).filter(t=>t.pct===0).length}</strong></div>
                    </div>
                  </div>
                ) : (
                  <div style={{textAlign:'center',padding:24,color:'var(--s400)',fontSize:14}}>
                    No mastery data yet for this student. They need to complete at least one practice session.
                  </div>
                )}
              </div>
            )}
            </div>
          )}

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

          {/* ── EXAM BUILDER ── */}
          {page === 'exambuilder' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:20,alignItems:'start'}}>
              <div>
                <div style={{marginBottom:18}}>
                  <div className="sec-tag">Exam Builder</div>
                  <h2 className="serif" style={{fontSize:24,color:'var(--s900)'}}>Create <em style={{color:'var(--b700)'}}>New Exam</em></h2>
                </div>
                {/* Step indicators */}
                <div style={{display:'flex',alignItems:'center',marginBottom:28}}>
                  {[1,2,3].map((n,i) => (
                    <div key={n} style={{display:'flex',alignItems:'center',flex:i<2?1:'auto'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:28,height:28,borderRadius:'50%',background:ebStep>=n?'var(--b700)':'var(--s200)',color:ebStep>=n?'#fff':'var(--s500)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,fontFamily:'JetBrains Mono,monospace'}}>{n}</div>
                        <span style={{fontSize:12.5,fontWeight:700,color:ebStep>=n?'var(--b700)':'var(--s400)'}}>{['Details','Questions','Security'][i]}</span>
                      </div>
                      {i<2&&<div style={{flex:1,height:1,background:'var(--border)',margin:'0 10px'}}/>}
                    </div>
                  ))}
                </div>

                {ebStep===1&&(
                  <div>
                    <div className="card" style={{marginBottom:16}}>
                      <div className="ctitle" style={{marginBottom:18}}>Exam Details</div>
                      <div className="fg"><label className="fl">Exam Title</label><input className="fi" defaultValue="Mathematics — Pythagoras Theorem Mock" placeholder="e.g. Mathematics Mock Paper 1"/></div>
                      <div className="fr2">
                        <div className="fg" style={{marginBottom:0}}><label className="fl">Subject</label><select className="fsel"><option>Mathematics</option><option>Biology</option><option>Chemistry</option><option>Physics</option></select></div>
                        <div className="fg" style={{marginBottom:0}}><label className="fl">Class</label><select className="fsel"><option>IGCSE Form 3</option><option>IGCSE Form 2</option><option>IGCSE Form 4</option></select></div>
                      </div>
                      <div className="fr2" style={{marginTop:14}}>
                        <div className="fg" style={{marginBottom:0}}><label className="fl">Duration (minutes)</label><input className="fi" defaultValue="60" type="number"/></div>
                        <div className="fg" style={{marginBottom:0}}><label className="fl">Total Marks</label><input className="fi" defaultValue="100" type="number"/></div>
                      </div>
                      <div className="fr2" style={{marginTop:14}}>
                        <div className="fg" style={{marginBottom:0}}><label className="fl">Available From</label><input className="fi" type="datetime-local" defaultValue="2026-03-10T09:00"/></div>
                        <div className="fg" style={{marginBottom:0}}><label className="fl">Deadline</label><input className="fi" type="datetime-local" defaultValue="2026-03-10T11:00"/></div>
                      </div>
                      <div className="fg" style={{marginTop:14,marginBottom:0}}><label className="fl">Instructions</label><textarea className="fta" rows={3} defaultValue="Answer ALL questions. Show full working for all calculations. Calculator NOT permitted."/></div>
                    </div>
                    <div style={{display:'flex',justifyContent:'flex-end'}}>
                      <button className="btn btn-p" onClick={() => setEbStep(2)}>Continue to Questions <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                    </div>
                  </div>
                )}

                {ebStep===2&&(
                  <div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:10}}>
                      <div className="ctitle">Questions <span className="mono" style={{fontSize:14,color:'var(--s500)'}}>({EXAM_QS.length} added)</span></div>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn btn-s btn-sm" onClick={() => toast.info('Adding question...')}>
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Add Question
                        </button>
                        <button className="btn btn-am btn-sm" onClick={() => toast.info('AI generating questions…')}>
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                          AI Generate All
                        </button>
                      </div>
                    </div>
                    {EXAM_QS.map((q,i) => {
                      const tCol = q.type==='MCQ'?{color:'var(--b700)',borderColor:'var(--b200)',background:'var(--b50)'}:q.type==='Short Answer'?{color:'var(--g700)',borderColor:'var(--g100)',background:'var(--g50)'}:{color:'var(--p600)',borderColor:'#EDE9FE',background:'var(--p50)'}
                      return (
                        <div key={i} className="q-card">
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                            <div style={{display:'flex',alignItems:'center',gap:10,flex:1,minWidth:0}}>
                              <div className="mono" style={{fontSize:13,fontWeight:700,color:'var(--s400)',flexShrink:0}}>Q{i+1}</div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:14,fontWeight:600,color:'var(--s800)',marginBottom:6}}>{q.text}</div>
                                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                                  <span className="badge" style={tCol}>{q.type}</span>
                                  <span style={{fontSize:12,color:'var(--s400)'}}>{q.marks} marks</span>
                                </div>
                              </div>
                            </div>
                            <div style={{display:'flex',gap:6,flexShrink:0}}>
                              <button className="btn btn-g btn-sm" onClick={() => toast.info(`Editing Q${i+1}`)}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                              </button>
                              <button className="btn btn-g btn-sm" style={{color:'var(--r500)'}} onClick={() => toast.error('Question removed')}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                      <button className="btn btn-s" onClick={() => setEbStep(1)}>Back</button>
                      <button className="btn btn-p" onClick={() => setEbStep(3)}>Continue to Security <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                    </div>
                  </div>
                )}

                {ebStep===3&&(
                  <div>
                    <div className="card" style={{marginBottom:16}}>
                      <div className="ctitle" style={{marginBottom:18}}>Security & Proctoring Settings</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                        {[{l:'Tab-switch detection',d:'Log and flag when student leaves exam tab',on:true},{l:'Copy-paste disabled',d:'Prevent clipboard use during exam',on:true},{l:'Time limit enforced',d:'Auto-submit on deadline',on:true},{l:'Question randomisation',d:'Shuffle question order per student',on:true},{l:'Answer randomisation',d:'Shuffle MCQ options per student',on:true},{l:'Full-screen mode',d:'Force student into full-screen',on:false},{l:'IP logging',d:'Record student IP on each action',on:false},{l:'Right-click disabled',d:'Block context menu',on:true}].map((o,i) => (
                          <div key={i} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--rmd)',padding:12,display:'flex',gap:10,alignItems:'flex-start'}}>
                            <div style={{width:36,height:20,borderRadius:999,background:o.on?'var(--b700)':'var(--s300)',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0,marginTop:2}} onClick={() => toast.info(`${o.l} ${o.on?'disabled':'enabled'}`)}>
                              <div style={{position:'absolute',top:2,left:o.on?20:2,width:16,height:16,background:'#fff',borderRadius:'50%',transition:'left .2s'}}/>
                            </div>
                            <div>
                              <div style={{fontSize:13,fontWeight:700,color:'var(--s800)'}}>{o.l}</div>
                              <div style={{fontSize:11.5,color:'var(--s500)',marginTop:1}}>{o.d}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
                      <button className="btn btn-s" onClick={() => setEbStep(2)}>Back</button>
                      <div style={{display:'flex',gap:10}}>
                        <button className="btn btn-s" onClick={() => toast.info('Exam saved as draft')}>Save Draft</button>
                        <button className="btn btn-ok" onClick={() => { toast.ok('Exam published to students!'); setEbStep(1) }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                          Publish Exam
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div className="card">
                  <div className="card-label" style={{marginBottom:12}}>Exam Summary</div>
                  {[['Title','Pythagoras Mock'],['Questions',EXAM_QS.length],['Total marks',EXAM_QS.reduce((s,q)=>s+q.marks,0)],['Duration','60 min'],['Assigned to','24 students']].map(([l,v]) => (
                    <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13.5,marginBottom:9}}>
                      <span style={{color:'var(--s500)'}}>{l}</span>
                      <span className="mono" style={{fontWeight:700,color:'var(--s800)',fontSize:12,textAlign:'right',maxWidth:160}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-label" style={{marginBottom:12}}>Add Question Type</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    {[
                      {l:'MCQ',bg:'var(--b50)',ic:<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>},
                      {l:'Short Answer',bg:'var(--g50)',ic:<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h5"/></svg>},
                      {l:'Essay',bg:'var(--p50)',ic:<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--p600)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>},
                      {l:'Photo Answer',bg:'var(--a50)',ic:<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>},
                    ].map(q => (
                      <div key={q.l} className="q-type-btn" onClick={() => toast.info(`Adding ${q.l} question`)}>
                        <div className="q-type-icon" style={{background:q.bg}}>{q.ic}</div>
                        <div style={{fontSize:11.5,fontWeight:700,color:'var(--s700)'}}>{q.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── AI MARKING ── */}
          {page === 'marking' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:20,alignItems:'start'}}>
              <div>
                <div style={{marginBottom:18}}>
                  <div className="sec-tag">AI Marking & Integrity</div>
                  <h2 className="serif" style={{fontSize:24,color:'var(--s900)'}}>Mathematics Mock — <em style={{color:'var(--b700)'}}>Paper 1</em></h2>
                  <p style={{fontSize:14,color:'var(--s500)',marginTop:4}}>24 submissions · AI-marked · 5 questions · 100 marks</p>
                </div>
                <div className="card" style={{marginBottom:20}}>
                  <div className="chdr">
                    <div className="ctitle">Class Score Overview</div>
                    <div style={{display:'flex',gap:8}}>
                      <button className="btn btn-s btn-sm" onClick={() => toast.ok('Exporting results to CSV…')}>Export CSV</button>
                      <button className="btn btn-p btn-sm" onClick={() => toast.ok('Sending results to all students…')}>Publish Results</button>
                    </div>
                  </div>
                  {MARK_STU.map((s,i) => {
                    const total = s.scores.reduce((a,b)=>a+b,0)
                    const col = total>=75?'var(--g600)':total>=60?'var(--a600)':'var(--r500)'
                    return (
                      <div key={i} className="mark-row">
                        <Av init={s.init} col={s.col} size={36}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:600,color:'var(--s800)',marginBottom:4}}>
                            {s.name}
                            {s.flagged&&<span style={{marginLeft:8,fontSize:11,fontWeight:700,color:'var(--r600)',background:'var(--r50)',border:'1px solid var(--r100)',borderRadius:999,padding:'1px 8px'}}>⚠ Flagged</span>}
                          </div>
                          <div style={{display:'flex',gap:12,fontSize:12,color:'var(--s400)'}}>
                            {s.scores.map((sc,qi) => <span key={qi}>Q{qi+1}: <span className="mono" style={{fontWeight:700,color:'var(--s700)'}}>{sc}</span></span>)}
                          </div>
                        </div>
                        <span className="mono" style={{fontSize:18,fontWeight:700,color:col,flexShrink:0}}>{total}%</span>
                        <button className="btn btn-g btn-sm" onClick={() => setMarkDetail(s)} style={{flexShrink:0}}>Review</button>
                      </div>
                    )
                  })}
                </div>
                <div className="card">
                  <div className="chdr"><div className="ctitle">Score Distribution</div><span style={{fontSize:13,color:'var(--s500)'}}>Class average: <span className="mono" style={{fontWeight:700,color:'var(--b700)'}}>73%</span></span></div>
                  <div style={{display:'flex',gap:6,alignItems:'flex-end',height:80}}>
                    {[{r:'0–39',n:1,c:'var(--r500)'},{r:'40–59',n:2,c:'var(--a500)'},{r:'60–69',n:4,c:'var(--a500)'},{r:'70–79',n:8,c:'var(--b500)'},{r:'80–89',n:6,c:'var(--g500)'},{r:'90–100',n:3,c:'var(--g600)'}].map((d,i) => (
                      <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                        <div className="mono" style={{fontSize:10,color:'var(--s500)'}}>{d.n}</div>
                        <div style={{width:'100%',background:d.c,borderRadius:'4px 4px 0 0',height:Math.round(d.n/8*100)+'%',minHeight:6,opacity:.85}}/>
                        <div style={{fontSize:9.5,color:'var(--s400)',textAlign:'center'}}>{d.r}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Integrity sidebar */}
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div className="card">
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                    <div style={{width:32,height:32,background:'var(--a50)',borderRadius:'var(--rmd)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--a600)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div className="ctitle" style={{fontSize:15}}>Integrity Scanner</div>
                  </div>
                  {[['AI-Generated Answers','David · 15%','var(--a600)',15,'1 student flagged'],['Plagiarism Detected','David · 22%','var(--r600)',22,'1 student flagged'],['Unusual Copy-Paste','David · 38%','var(--r600)',38,'1 student flagged']].map(([l,v,c,pct,sub]) => (
                    <div key={l} style={{marginBottom:14}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:6}}>
                        <span style={{color:'var(--s500)'}}>{l}</span>
                        <span className="mono" style={{fontWeight:700,color:c}}>{v}</span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill" style={{width:pct+'%',background:c}}/></div>
                      <div style={{fontSize:11,color:'var(--s400)',marginTop:4}}>{sub}</div>
                    </div>
                  ))}
                  <div style={{background:'var(--r50)',border:'1px solid var(--r100)',borderRadius:'var(--rmd)',padding:12}}>
                    <div style={{fontWeight:700,fontSize:13,color:'var(--r600)',marginBottom:4}}>⚠ Integrity Alert</div>
                    <div style={{fontSize:12,color:'var(--s600)',lineHeight:1.6}}>David Mwangi's submission shows 22% plagiarism and unusual copy-paste patterns. Review recommended before releasing marks.</div>
                    <button className="btn btn-d btn-sm" style={{marginTop:10,width:'100%',justifyContent:'center'}} onClick={() => setMarkDetail(MARK_STU[4])}>Review Submission</button>
                  </div>
                </div>

                {/* Chat */}
                <div className="card">
                  <div className="ctitle" style={{fontSize:15,marginBottom:12}}>Marking Assistant</div>
                  <div className="chat-area" style={{height:180,background:'var(--bg)',borderRadius:'var(--rmd)',padding:10}}>
                    {chatMsgs.map((m,i) => (
                      <div key={i} className={`chat-msg${m.role==='user'?' user':''}`}>
                        <div className="chat-av" style={{background:m.role==='ai'?'var(--b700)':'var(--s600)'}}>{m.role==='ai'?'M':'J'}</div>
                        <div className="chat-bubble" style={{fontSize:12.5}}>{m.text}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:8,marginTop:10}}>
                    <textarea className="chat-input" value={chatInp} onChange={e=>setChatInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat()}}} rows={1} placeholder="Ask about marking…" style={{fontSize:13}}/>
                    <button className="btn btn-p btn-sm" onClick={sendChat} style={{padding:'8px 12px'}}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
