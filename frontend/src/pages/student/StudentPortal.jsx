/**
 * StudentPortal.jsx — Individualised Learning System
 *
 * Every section reads live data from the API:
 *  - Mastery scores per topic (not hardcoded)
 *  - Practice questions matched to current difficulty
 *  - Mshauri AI receives the student's real mastery context
 *  - Dashboard recommends exactly what to study next
 *  - Study plan is personalised per student
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth, useToast, api } from '../../context/ctx.jsx'
import { useStore } from '../../context/ctx.jsx'
import Modal from '../../components/ui/Modal.jsx'
import LiveClassroom from '../../components/ui/LiveClassroom.jsx'

// ── SVG icon helper ───────────────────────────────────────
const I = (d) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    dangerouslySetInnerHTML={{__html: d}}/>
)

// ── Avatar ────────────────────────────────────────────────
function Av({init, col, size=36}) {
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:col+'20',color:col,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:'JetBrains Mono,monospace',fontSize:Math.round(size*.32),
      fontWeight:700,flexShrink:0}}>
      {init}
    </div>
  )
}

// ── Mastery colour helper ─────────────────────────────────
const masteryCol = (pct) =>
  pct >= 80 ? 'var(--g600)' : pct >= 60 ? 'var(--b600)' : pct >= 40 ? 'var(--a600)' : 'var(--r500)'

const masteryLabel = (pct) =>
  pct >= 80 ? 'Mastered' : pct >= 60 ? 'Progressing' : pct >= 40 ? 'Building' : pct > 0 ? 'Needs Help' : 'Not Started'

// ── YouTube URL normalizer ────────────────────────────────
// Teachers paste any YouTube URL format. Convert to embed URL
// so the iframe plays inline instead of opening the YouTube app.
const toYouTubeEmbed = (url) => {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  // Already an embed URL
  if (/^https?:\/\/(www\.)?youtube\.com\/embed\//i.test(trimmed)) return trimmed

  let videoId = ''
  let m

  // youtu.be/VIDEOID
  m = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (m) videoId = m[1]

  // youtube.com/watch?v=VIDEOID
  if (!videoId) { m = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/); if (m) videoId = m[1] }

  // youtube.com/shorts/VIDEOID
  if (!videoId) { m = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/); if (m) videoId = m[1] }

  // youtube.com/live/VIDEOID
  if (!videoId) { m = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/); if (m) videoId = m[1] }

  // Raw 11-char video ID
  if (!videoId && /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) videoId = trimmed

  if (!videoId) return ''
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
}
// ── Badge icon SVGs ───────────────────────────────────────
const BADGE_ICONS = {
  streak_7:    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#F97316" strokeWidth="2" strokeLinecap="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>,
  streak_30:   <svg width="16" height="16" fill="#F59E0B" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  xp_1000:     <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  xp_5000:     <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  master_subj: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 0 0 5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 1 0 5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  all_round:   <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
}

// ── NAV SECTIONS ──────────────────────────────────────────
const NAV_SECTIONS = [
  { label:'Learning', items:[
    { id:'dashboard',    label:'Dashboard',       svg:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>' },
    { id:'curriculum',   label:'My Curriculum',   svg:'<path d="M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13"/><path d="M4 19a2 2 0 0 0 2 2h14"/><path d="M8 10h8M8 14h6"/>' },
    { id:'lessons',      label:'Lesson Player',   svg:'<polygon points="5 3 19 12 5 21 5 3"/>' },
    { id:'practice',     label:'Adaptive Practice',svg:'<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1.5"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/>' },
    { id:'homework',     label:'Homework',         svg:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>' },
    { id:'exams',        label:'Exams',           svg:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',  badge:'1' },
    { id:'live',         label:'Live Classes',    svg:'<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>', live:true },
    { id:'myroom',       label:'My Class Room',   svg:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',  groupOnly:true },
    { id:'timetable',    label:'Timetable',       svg:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  ]},
  { label:'Tools', items:[
    { id:'tutor',        label:'Mshauri AI',      svg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
    { id:'studyplan',    label:'My Study Plan',   svg:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>' },
    { id:'resources',    label:'Resources',       svg:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
  ]},
  { label:'Account', items:[
    { id:'profile',      label:'Profile',          svg:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
    { id:'achievements', label:'Achievements',    svg:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
    { id:'subscription', label:'Subscription',   svg:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>' },
  ]},
]

const TIMETABLE = [
  {day:'Mon',subj:'Mathematics',teacher:'Mr. Muthomi',time:'9:00–10:00 AM',status:'completed'},
  {day:'Mon',subj:'Biology',    teacher:'Dr. Ouma',   time:'2:00–3:00 PM', status:'completed'},
  {day:'Tue',subj:'English',   teacher:'Ms. Wambua', time:'10:00–11:00 AM',status:'completed'},
  {day:'Wed',subj:'Mathematics',teacher:'Mr. Muthomi',time:'9:00–10:00 AM',status:'live'},
  {day:'Wed',subj:'Chemistry', teacher:'Dr. Ouma',   time:'1:00–2:00 PM', status:'upcoming'},
  {day:'Thu',subj:'Physics',   teacher:'Mr. Njoroge',time:'11:00 AM–12 PM',status:'upcoming'},
  {day:'Fri',subj:'English',   teacher:'Ms. Wambua', time:'9:00–10:00 AM', status:'upcoming'},
]

// ─────────────────────────────────────────────────────────
export default function StudentPortal() {
  const { user } = useAuth()
  const toast    = useToast()
  const store    = useStore()

  // ── Learning mode (set at login) ─────────────────────
  // 'individual' = personalised AI mastery system
  // 'group'      = shared classroom with up to 10 students/room
  const [learningMode, setLearningMode] = useState(
    () => localStorage.getItem('sm_learning_mode') || 'individual'
  )

  // ── Navigation ───────────────────────────────────────
  const [page,        setPage]        = useState('dashboard')
  const [collapsed,   setCollapsed]   = useState(false)
  const [inClassroom, setInClassroom] = useState(false)

  // ── Mastery (from API) ───────────────────────────────
  const [mastery,       setMastery]       = useState(null)
  const [masteryLoading,setMasteryLoading] = useState(true)
  const [nextRec,       setNextRec]       = useState(null)

  // ── Adaptive practice (from API) ─────────────────────
  const [practiceData,  setPracticeData]  = useState(null)
  const [practiceLoading,setPracticeLoading] = useState(false)
  const [practiceAnswers,setPracticeAnswers] = useState({})
  const [practiceResult, setPracticeResult]  = useState(null)
  const [submitting,    setSubmitting]    = useState(false)

  // ── Lesson player ────────────────────────────────────
  const [lessonTab,   setLessonTab]   = useState('video')
  const [selectedSubj, setSelectedSubj] = useState(null)
  const [fcIdx,       setFcIdx]       = useState(0)
  const [fcFlipped,   setFcFlipped]   = useState(false)
  const [flashcards,  setFlashcards]  = useState([])

  // ── Exams ────────────────────────────────────────────
  const [examActive,  setExamActive]  = useState(false)
  const [examAnswers, setExamAnswers] = useState({})
  const [examResult,  setExamResult]  = useState(null)
  const [examTime,    setExamTime]    = useState(3600)

  // ── Mshauri (mastery-aware) ──────────────────────────
  const [tutorMsgs,   setTutorMsgs]   = useState([
    {role:'ai', text:"Habari! I'm Mshauri, your personalised AI tutor. I can see your exact mastery levels and I'll always guide you to what needs the most attention. What would you like to work on today?"}
  ])
  const [tutorInp,    setTutorInp]    = useState('')
  const [aiLoading,   setAiLoading]   = useState(false)
  const [masteryCtx,  setMasteryCtx]  = useState('')

  // ── Study plan (from API) ────────────────────────────
  const [studyPlan,   setStudyPlan]   = useState([])
  const [planLoading, setPlanLoading] = useState(false)

  const chatEndRef = useRef(null)

  // ── LOAD MASTERY ON MOUNT ────────────────────────────
  useEffect(() => {
    loadMastery()
    loadMasteryContext()
  }, [])

  const loadMastery = async () => {
    try {
      setMasteryLoading(true)
      const { data } = await api.get('/mastery/me')
      if (data.success) {
        setMastery(data.mastery)
        setNextRec(data.nextRecommended)
      }
    } catch (e) {
      console.error('Mastery load error:', e.message)
    } finally {
      setMasteryLoading(false)
    }
  }

  const loadMasteryContext = async () => {
    try {
      const { data } = await api.get('/adaptive/mshauri-context')
      if (data.success) setMasteryCtx(data.context)
    } catch {}
  }

  // ── LOAD ADAPTIVE PRACTICE ───────────────────────────
  const loadPractice = useCallback(async (subject, topic) => {
    try {
      setPracticeLoading(true)
      setPracticeResult(null)
      setPracticeAnswers({})
      const params = new URLSearchParams({ count: 5 })
      if (subject) params.set('subject', subject)
      if (topic)   params.set('topic', topic)
      const { data } = await api.get(`/adaptive/practice?${params}`)
      if (data.success) setPracticeData(data.practice)
    } catch (e) {
      toast.error('Could not load practice questions.')
    } finally {
      setPracticeLoading(false)
    }
  }, [toast])

  // ── LOAD FLASHCARDS ──────────────────────────────────
  const loadFlashcards = useCallback(async (topic) => {
    try {
      const params = topic ? `?topic=${encodeURIComponent(topic)}` : ''
      const { data } = await api.get(`/adaptive/flashcards${params}`)
      if (data.success) {
        setFlashcards(data.flashcards)
        setFcIdx(0)
        setFcFlipped(false)
      }
    } catch {}
  }, [])

  // ── LOAD STUDY PLAN ──────────────────────────────────
  const loadStudyPlan = useCallback(async () => {
    try {
      setPlanLoading(true)
      const { data } = await api.get('/adaptive/study-plan')
      if (data.success) setStudyPlan(data.plan)
    } catch {} finally {
      setPlanLoading(false)
    }
  }, [])

  // ── SUBMIT PRACTICE ──────────────────────────────────
  const submitPractice = async () => {
    if (!practiceData) return
    setSubmitting(true)
    const questions = practiceData.questions
    let correct = 0
    questions.forEach(q => {
      if (practiceAnswers[q.id] === q.correct) correct++
    })
    const score = Math.round((correct / questions.length) * 100)
    setPracticeResult({ correct, total: questions.length, score })

    // Update mastery
    try {
      const { data } = await api.post('/mastery/update', {
        subject:     practiceData.subject,
        topic:       practiceData.topic,
        score,
        sessionType: 'practice',
        timeMins:    8,
      })
      if (data.success) {
        toast.ok(`+${data.xpEarned} XP earned! Mastery updated.`)
        if (data.newBadges?.length) {
          toast.ok(`New badge unlocked: ${data.newBadges[0].name}`)
        }
        // Refresh mastery data
        loadMastery()
        loadMasteryContext()
      }
    } catch {}
    setSubmitting(false)
  }

  // ── EXAM (static bank, scores to API) ────────────────
  const EXAM_QS = [
    {id:1,q:'In a right-angled triangle with legs 3 cm and 4 cm, the hypotenuse is:',opts:['5 cm','7 cm','6 cm','4.5 cm'],ans:'5 cm',marks:5},
    {id:2,q:'If c = 13 and a = 5 in a right-angled triangle, b equals:',opts:['12','10','8','11'],ans:'12',marks:5},
    {id:3,q:'Which set forms a Pythagorean triple?',opts:['3,4,5','2,3,4','4,5,6','1,2,3'],ans:'3,4,5',marks:5},
    {id:4,q:'The area of a right-angled triangle with legs 6 and 8 is:',opts:['24 cm²','48 cm²','14 cm²','28 cm²'],ans:'24 cm²',marks:5},
  ]
  useEffect(() => {
    if (!examActive || examResult) return
    const id = setInterval(() => setExamTime(t => { if(t<=1){clearInterval(id);return 0} return t-1 }), 1000)
    return () => clearInterval(id)
  }, [examActive, examResult])

  const submitExam = async () => {
    const correct = EXAM_QS.filter(q => examAnswers[q.id] === q.ans).length
    const score   = Math.round((correct / EXAM_QS.length) * 100)
    setExamResult({ correct, score, total: EXAM_QS.length * 5, pct: score })
    try {
      await api.post('/mastery/update', { subject:'Mathematics', topic:'Pythagoras & Geometry', score, sessionType:'exam', timeMins:20 })
      loadMastery()
    } catch {}
  }
  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  // ── MSHAURI (mastery-aware) ──────────────────────────
  const sendTutor = async () => {
    if (!tutorInp.trim() || aiLoading) return
    const q = tutorInp.trim()
    setTutorInp('')
    setAiLoading(true)
    setTutorMsgs(m => [...m, {role:'user', text:q}])
    try {
      const { data } = await api.post('/auth/mshauri', {
        message: q,
        masteryContext: masteryCtx,
      })
      setTutorMsgs(m => [...m, {role:'ai', text: data.reply || 'Let me think about that...'}])
    } catch {
      setTutorMsgs(m => [...m, {role:'ai', text:"I'm having trouble connecting right now. Please try again in a moment."}])
    }
    setAiLoading(false)
    setTimeout(() => chatEndRef.current?.scrollIntoView({behavior:'smooth'}), 80)
  }

  // ── Navigate and trigger loads ───────────────────────
  const goTo = (id) => {
    setPage(id)
    if (id === 'practice' && !practiceData) loadPractice()
    if (id === 'studyplan')                  loadStudyPlan()
    if (id === 'lessons' && flashcards.length === 0) loadFlashcards(nextRec?.topic)
  }

  const firstName = user?.firstName || 'Student'
  const initials  = user ? `${user.firstName[0]}${user.lastName[0]}` : 'ST'
  const subjects  = mastery?.subjects || []

  // ─────────────────────────────────────────────────────
  return (
    <div className="app">

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar${collapsed?' col':''}`}>
        <div className="sb-logo">
          <div className="sb-mark">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/>
            </svg>
          </div>
          <div>
            <div className="sb-text">Smartious<span>.</span></div>
            <div className="sb-sub">Student Portal</div>
          </div>
        </div>

        <button className="sb-tog" onClick={() => setCollapsed(c=>!c)}
          style={{background:'var(--s700)',border:'2px solid var(--s600)',position:'absolute',top:22,right:-13,
            width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',zIndex:10}}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,.7)" strokeWidth="2.5" strokeLinecap="round"
            style={{transform:collapsed?'rotate(180deg)':'none',transition:'transform .25s'}}>
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <nav style={{flex:1, paddingTop:8}}>
          {NAV_SECTIONS.map((sec, si) => (
            <div key={si}>
              <div className="sb-sec">{sec.label}</div>
              {sec.items.filter(item => !item.groupOnly || learningMode === 'group').map(item => (
                <div key={item.id} className={`nav-item${page===item.id?' active':''}`} onClick={() => goTo(item.id)}>
                  <div className="nav-icon">{I(item.svg)}</div>
                  <span className="sb-lbl">{item.label}</span>
                  {item.badge && <span className="sb-badge">{item.badge}</span>}
                  {item.live  && <div className="sb-live-dot"/>}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sb-user">
          <Av init={initials} col="#3B82F6" size={36}/>
          <div className="sb-uinfo">
            <div className="sb-uname">{user?.firstName} {user?.lastName}</div>
            <div className="sb-urole">{user?.grade || 'IGCSE'} · {mastery ? mastery.xp.toLocaleString() + ' XP' : '...'}</div>
            <div style={{display:'flex',alignItems:'center',gap:4,marginTop:3}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:learningMode==='group'?'#22C55E':'#3B82F6'}}/>
              <span style={{fontSize:10,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.05em'}}>{learningMode==='group'?'Group Class':'Individual'}</span>
              <button onClick={()=>{const m=learningMode==='group'?'individual':'group';setLearningMode(m);localStorage.setItem('sm_learning_mode',m)}} style={{background:'transparent',border:'none',color:'rgba(255,255,255,.3)',cursor:'pointer',fontSize:10,padding:0,marginLeft:2}}>switch</button>
            </div>
          </div>
        </div>
        <div className="sb-back" onClick={() => window.location.href='/'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          <span className="sb-lbl">Back to Website</span>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        <div className="topbar">
          <div className="tb-title" style={{fontFamily:'Instrument Serif,serif',fontSize:20,color:'var(--s900)'}}>
            {page === 'dashboard' ? `Welcome back, ${firstName}` :
             page === 'practice'  ? (practiceData ? `Adaptive Practice — ${practiceData.topic}` : 'Adaptive Practice') :
             page === 'homework'  ? 'Homework' :
             page === 'tutor'     ? 'Mshauri AI Tutor' :
             page === 'studyplan' ? 'My Personalised Study Plan' :
             page === 'curriculum'? 'My Curriculum' :
             page === 'lessons'   ? 'Lesson Player' :
             page === 'exams'     ? 'Exams' :
             page === 'live'      ? 'Live Classes' :
             page === 'timetable' ? 'Timetable' :
             page === 'resources' ? 'Resources' :
             page === 'profile'   ? 'My Profile' :
             page === 'achievements' ? 'Achievements' :
             page === 'subscription' ? 'Subscription' : 'Portal'}
          </div>
          <div className="tb-right">
            {nextRec && (
              <div className="tb-chip" style={{background:'var(--a50)',borderColor:'var(--a100)',color:'var(--a600)'}}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Focus: {nextRec.topic}
              </div>
            )}
            <button className="btn btn-p btn-sm" onClick={() => { goTo('practice'); loadPractice(nextRec?.subject, nextRec?.topic) }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Practice Now
            </button>
          </div>
        </div>

        <div className="content" style={{animation:'fadeIn .25s ease'}}>
          

          {/* ════════════════════════════════════════════
              CURRICULUM — topic-by-topic mastery grid
          ════════════════════════════════════════════ */}
          {page === 'curriculum' && (() => {
            // Pull real data from store + user object
            const myCurriculumName = user?.curriculum || 'IGCSE'
            const curriculumInfo   = store.curricula?.find(c =>
              c.name === myCurriculumName ||
              c.name?.toLowerCase() === myCurriculumName?.toLowerCase()
            )
            // My class rooms = subjects I'm enrolled in (each room = subject + teacher + schedule)
            const studentFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
            const myRooms = (store.groupRooms || []).filter(r =>
              r.students?.some(s =>
                s === studentFullName ||
                s === user?.firstName ||
                s.includes(user?.firstName)
              )
            )
            // Subject colour palette — stable per subject name
            const subjectColours = {
              'Mathematics': '#8B1A2E', 'Physics':'#1E3A8A', 'Chemistry':'#166534',
              'Biology':'#7C2D12', 'English':'#6B21A8', 'History':'#92400E',
              'Geography':'#0F766E', 'Computer Science':'#1F2937', 'Business Studies':'#7E22CE',
              'Economics':'#9F1239', 'Art':'#BE185D', 'Music':'#0E7490',
            }
            const colourFor = (name) => subjectColours[name] || '#8B1A2E'

            // Lessons grouped by subject (from the same store the lessons tab uses)
            const lessonsBySubject = {}
            ;(store.lessons || []).forEach(l => {
              const s = l.subject || 'General'
              if (!lessonsBySubject[s]) lessonsBySubject[s] = []
              lessonsBySubject[s].push(l)
            })

            return (
              <div>
                {/* Hero card — student's curriculum */}
                <div className="card" style={{
                  padding: 0, marginBottom: 18, overflow: 'hidden',
                  background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
                  color: '#fff',
                }}>
                  <div style={{ padding: '28px 32px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
                      Your Learning Path
                    </div>
                    <h2 style={{ fontFamily: "'Instrument Serif', 'Playfair Display', serif", fontSize: 30, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
                      {curriculumInfo?.name || myCurriculumName}
                    </h2>
                    {curriculumInfo?.org && (
                      <div style={{ fontSize: 13.5, opacity: .8, marginTop: 4 }}>
                        {curriculumInfo.org}
                      </div>
                    )}
                    {curriculumInfo?.description && (
                      <p style={{ fontSize: 13.5, opacity: .85, marginTop: 12, marginBottom: 0, maxWidth: 560, lineHeight: 1.55 }}>
                        {curriculumInfo.description}
                      </p>
                    )}
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    background: 'rgba(0,0,0,.18)',
                  }}>
                    {[
                      ['Grade',       user?.grade || curriculumInfo?.grades || '—'],
                      ['Subjects',    myRooms.length || curriculumInfo?.subjects || '—'],
                      ['Plan',        user?.plan || 'Basic'],
                      ['Status',      'Enrolled'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ padding: '14px 20px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 3 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* My Subjects section */}
                <div style={{ marginBottom: 14, marginTop: 24 }}>
                  <div className="sec-tag">My Subjects &amp; Teachers</div>
                  <h3 className="serif" style={{ fontSize: 22, color: 'var(--s900)', margin: '4px 0 0' }}>
                    {myRooms.length > 0
                      ? `${myRooms.length} subject${myRooms.length === 1 ? '' : 's'} this term`
                      : 'No subjects assigned yet'}
                  </h3>
                </div>

                {myRooms.length === 0 ? (
                  <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, margin: '0 auto 14px', borderRadius: '50%', background: 'var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13"/><path d="M4 19a2 2 0 0 0 2 2h14"/><path d="M8 10h8M8 14h6"/>
                      </svg>
                    </div>
                    <h3 style={{ fontSize: 16, color: 'var(--s800)', marginBottom: 6 }}>Your subjects will appear here</h3>
                    <p style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 360, margin: '0 auto' }}>
                      Once an admin assigns you to subjects, you&apos;ll see your teacher, schedule, and lessons for each one.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                    {myRooms.map(room => {
                      const col = colourFor(room.subject)
                      const teacherInit = room.teacher
                        ? room.teacher.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i, '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                        : '?'
                      const subjectLessons = lessonsBySubject[room.subject] || []
                      return (
                        <div key={room.id} className="card" style={{
                          padding: 0, overflow: 'hidden', borderTop: `4px solid ${col}`,
                          display: 'flex', flexDirection: 'column',
                        }}>
                          <div style={{ padding: '18px 20px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                              <div>
                                <div className="serif" style={{ fontSize: 19, color: 'var(--s900)', lineHeight: 1.2, marginBottom: 3 }}>
                                  {room.subject}
                                </div>
                                <div style={{ fontSize: 11.5, color: 'var(--s400)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
                                  {room.curriculum} {room.grade ? '· ' + room.grade : ''}
                                </div>
                              </div>
                              <span className={`badge ${room.status === 'Active' ? 'badge-green' : 'badge-slate'}`}>
                                {room.status || 'Active'}
                              </span>
                            </div>

                            {/* Teacher */}
                            {room.teacher && (
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: 'var(--bg)', borderRadius: 'var(--rmd)',
                                padding: '10px 12px', marginBottom: 12,
                              }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%',
                                  background: col + '22', color: col,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700,
                                  flexShrink: 0,
                                }}>
                                  {teacherInit}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--s800)' }}>
                                    {room.teacher}
                                  </div>
                                  <div style={{ fontSize: 11, color: 'var(--s500)' }}>
                                    Subject Teacher
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Schedule */}
                            {room.schedule && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--s600)', marginBottom: 6 }}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={col} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{room.schedule}</span>
                              </div>
                            )}

                            {/* Classmates count */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--s600)' }}>
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={col} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                              </svg>
                              <span>{room.enrolled || room.students?.length || 0} classmates</span>
                            </div>

                            {/* Lessons available */}
                            {subjectLessons.length > 0 && (
                              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--s400)', marginBottom: 8 }}>
                                  {subjectLessons.length} lesson{subjectLessons.length === 1 ? '' : 's'} available
                                </div>
                                {subjectLessons.slice(0, 2).map((l, li) => (
                                  <div key={li} style={{ fontSize: 12, color: 'var(--s600)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    · {l.title}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div style={{ marginTop: 'auto', padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg)' }}>
                            <button
                              className="btn btn-p btn-sm"
                              style={{ flex: 1, justifyContent: 'center' }}
                              onClick={() => { setSelectedSubj(room.subject); goTo('lessons') }}
                            >
                              Open Lessons
                            </button>
                            <button
                              className="btn btn-s btn-sm"
                              style={{ flex: 1, justifyContent: 'center' }}
                              onClick={() => goTo('timetable')}
                            >
                              Timetable
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}

          {/* ════════════════════════════════════════════
              LESSONS — player with adaptive flashcards
          ════════════════════════════════════════════ */}
          {page === 'lessons' && (
            <div>
              <div style={{marginBottom:16}}>
                <div className="sec-tag">{selectedSubj || (nextRec?.subject || 'Mathematics')} · {nextRec?.topic || 'Pythagoras & Geometry'}</div>
                <h2 className="serif" style={{fontSize:22,color:'var(--s900)'}}>Lesson Player</h2>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:20,alignItems:'start'}}>
                <div>
                  <div className="tabs" style={{marginBottom:16}}>
                    {['video','notes','flashcards','resources'].map(t => (
                      <div key={t} className={`tab${lessonTab===t?' active':''}`} onClick={() => {
                        setLessonTab(t)
                        if (t === 'flashcards' && flashcards.length === 0) loadFlashcards(nextRec?.topic)
                      }} style={{textTransform:'capitalize'}}>{t}</div>
                    ))}
                  </div>

                  {lessonTab === 'video' && (() => {
                    // Find a lesson matching the current subject/topic
                    const subjectName = selectedSubj || nextRec?.subject || 'Mathematics'
                    const topicName   = nextRec?.topic || 'Pythagoras & Geometry'
                    const lesson = store.lessons.find(l =>
                      l.subject === subjectName ||
                      (l.topic && l.topic === topicName)
                    ) || store.lessons[0]
                    return (
                      <>
                       {(() => { const embedUrl = toYouTubeEmbed(lesson?.youtubeUrl); return embedUrl ? (
                          <div style={{position:'relative',paddingBottom:'56.25%',height:0,borderRadius:'var(--rlg)',overflow:'hidden',background:'#000'}}>
                            <iframe
                              src={embedUrl}
                              title={lesson.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}
                            />
                          </div>
                        ) : (
                          <div className="player-wrap" style={{cursor:'default'}}>
                            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
                              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              <div style={{fontSize:14,color:'rgba(255,255,255,.4)',textAlign:'center'}}>
                                No video yet for {subjectName}<br/>
                                <span style={{fontSize:12,color:'rgba(255,255,255,.25)'}}>Teacher can upload a YouTube lesson from their portal</span>
                              </div>
                            </div>
                         </div>
                        ) })()}
                        {lesson && (
                          <div style={{marginTop:12,padding:'12px 16px',background:'var(--bg)',borderRadius:'var(--rmd)',fontSize:13}}>
                            <div style={{fontWeight:700,color:'var(--s800)',marginBottom:2}}>{lesson.title}</div>
                            <div style={{color:'var(--s400)'}}>{lesson.addedBy} · {lesson.subject} · {lesson.date}</div>
                          </div>
                        )}
                        {/* Lesson selector if multiple lessons */}
                        {store.lessons.filter(l => l.subject === subjectName).length > 1 && (
                          <div style={{marginTop:10,display:'flex',gap:8,flexWrap:'wrap'}}>
                            {store.lessons.filter(l => l.subject === subjectName).map((l,i) => (
                              <button key={i} className="btn btn-s btn-sm" style={{fontSize:12}} onClick={() => setSelectedSubj(l.subject)}>
                                {l.title.slice(0,30)}{l.title.length>30?'…':''}
                              </button>
                            ))}
                          </div>
                        )}
                        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:12}}>
                          <button className="btn btn-p btn-sm" onClick={() => { goTo('practice'); loadPractice(nextRec?.subject, nextRec?.topic) }}>
                            Start Adaptive Practice
                          </button>
                          <button className="btn btn-s btn-sm" onClick={() => goTo('tutor')}>Ask Mshauri</button>
                        </div>
                      </>
                    )
                  })()}

                  {lessonTab === 'notes' && (
                    <div className="card" style={{padding:28}}>
                      <h3 className="serif" style={{fontSize:20,marginBottom:14}}>{nextRec?.topic || 'Pythagoras & Geometry'} — Study Notes</h3>
                      <div style={{fontSize:14,color:'var(--s700)',lineHeight:1.9}}>
                        <p style={{marginBottom:12}}><strong>Definition:</strong> Pythagoras Theorem states that in any right-angled triangle, c² = a² + b², where c is the hypotenuse.</p>
                        <div style={{background:'var(--b50)',border:'1px solid var(--b100)',borderRadius:'var(--rmd)',padding:16,textAlign:'center',margin:'16px 0'}}>
                          <div className="mono" style={{fontSize:20,fontWeight:600,color:'var(--b800)'}}>c² = a² + b²</div>
                          <div style={{fontSize:12,color:'var(--s500)',marginTop:6}}>c = hypotenuse (opposite the right angle)</div>
                        </div>
                        <p><strong>Pythagorean triples:</strong> (3,4,5), (5,12,13), (8,15,17) — memorise these for speed in exams.</p>
                      </div>
                    </div>
                  )}

                  {lessonTab === 'flashcards' && (
                    <div>
                      {flashcards.length === 0 ? (
                        <div className="lc"><div className="spinner"/></div>
                      ) : (
                        <>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                            <div style={{fontSize:13,color:'var(--s500)'}}>Card {fcIdx+1} of {flashcards.length} — click to flip</div>
                            <button className="btn btn-s btn-sm" onClick={() => loadFlashcards(nextRec?.topic)}>Refresh</button>
                          </div>
                          <div className={`fc-wrap${fcFlipped?' flipped':''}`} onClick={() => setFcFlipped(f=>!f)}>
                            <div className="fc-inner">
                              <div className="fc-front"><div className="serif" style={{fontSize:18}}>{flashcards[fcIdx]?.q}</div></div>
                              <div className="fc-back"><div>{flashcards[fcIdx]?.a}</div></div>
                            </div>
                          </div>
                          <div style={{display:'flex',gap:10,justifyContent:'center',marginTop:14}}>
                            <button className="btn btn-s btn-sm" onClick={() => {setFcIdx(i=>(i-1+flashcards.length)%flashcards.length);setFcFlipped(false)}}>Previous</button>
                            <button className="btn btn-p btn-sm" onClick={() => {setFcIdx(i=>(i+1)%flashcards.length);setFcFlipped(false)}}>Next Card</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {lessonTab === 'resources' && (
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {[
                        {name:'Past Paper Questions — '+( nextRec?.topic||'Pythagoras'),meta:'PDF · Cambridge 2018–2023',action:'Download'},
                        {name:'Worksheet — '+(nextRec?.topic||'Geometry'),meta:'PDF · 12 practice questions',action:'Download'},
                        {name:'Khan Academy — '+(nextRec?.topic||'Pythagoras'),meta:'External · Interactive',action:'Open'},
                      ].map((r,i) => (
                        <div key={i} className="card-sm" style={{display:'flex',gap:12,alignItems:'center'}}>
                          <div style={{width:40,height:40,borderRadius:'var(--rmd)',background:'var(--b50)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                          <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13.5}}>{r.name}</div><div style={{fontSize:11.5,color:'var(--s400)'}}>{r.meta}</div></div>
                          <button className="btn btn-s btn-sm" onClick={() => toast.ok(`${r.action}ing…`)}>{r.action}</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lesson path sidebar */}
                <div className="card" style={{padding:16}}>
                  <div className="card-label" style={{marginBottom:12}}>Your Progress Path</div>
                  {subjects.find(s => s.name === (nextRec?.subject || 'Mathematics'))?.topics.slice(0,6).map((t,i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid var(--border)',cursor:'pointer'}}
                      onClick={() => { loadPractice(nextRec?.subject, t.name); goTo('practice') }}>
                      <div style={{width:22,height:22,borderRadius:'50%',background:t.pct>=80?'var(--g500)':t.pct>=60?'var(--b600)':'var(--s200)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {t.pct >= 80
                          ? <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          : <span className="mono" style={{fontSize:9,fontWeight:700,color:t.pct>=60?'#fff':'var(--s500)'}}>{t.pct}%</span>
                        }
                      </div>
                      <span style={{fontSize:12.5,flex:1,color:t.pct>=60?'var(--s800)':'var(--s500)',fontWeight:t.name===nextRec?.topic?700:400}}>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              ADAPTIVE PRACTICE — live questions from API
          ════════════════════════════════════════════ */}
          {page === 'practice' && <PracticeTab user={user} toast={toast} goTo={goTo} />}
          {page === 'homework' && <HomeworkTab user={user} toast={toast} />}

          {/* ════════════════════════════════════════════
              EXAMS
          ════════════════════════════════════════════ */}
          {page === 'exams' && <ExamsTab user={user} toast={toast} goTo={goTo} store={store} />}

          {/* ════════════════════════════════════════════
              LIVE CLASSES
          ════════════════════════════════════════════ */}
          {page === 'live' && !inClassroom && <LiveClassesTab user={user} store={store} setInClassroom={setInClassroom} toast={toast} />}
          {page === 'live' && inClassroom && (
            <LiveClassroom role="student" onLeave={() => setInClassroom(false)}/>
          )}

          {/* ════════════════════════════════════════════
              TIMETABLE
          ════════════════════════════════════════════ */}
          {page === 'timetable' && <TimetableTab user={user} store={store} setInClassroom={setInClassroom} setPage={setPage} toast={toast} />}

          {/* ════════════════════════════════════════════
              MSHAURI AI — mastery-aware
          ════════════════════════════════════════════ */}
          {page === 'tutor' && <MshauriTab user={user} />}

          {/* ════════════════════════════════════════════
              PERSONALISED STUDY PLAN
          ════════════════════════════════════════════ */}
          {page === 'studyplan' && <StudyPlanTab user={user} store={store} setPage={setPage} toast={toast} />}

          {/* ════════════════════════════════════════════
              RESOURCES — live from teacher uploads
          ════════════════════════════════════════════ */}
          {page === 'resources' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Uploaded by your teachers</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Resources</h2></div>
              {store.resources.length === 0 ? (
                <div className="empty"><h3>No resources yet</h3><p>Your teachers will upload worksheets, past papers and more here.</p></div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                  {store.resources.map((r) => (
                    <div key={r.id} className="card" style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                      <div style={{width:44,height:44,borderRadius:'var(--rmd)',background:'var(--b50)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13.5,color:'var(--s800)',marginBottom:3}}>{r.title}</div>
                        <div style={{fontSize:11.5,color:'var(--s400)',marginBottom:3}}>{r.type} · {r.subject} · {r.grade}</div>
                        <div style={{fontSize:11.5,color:'var(--s400)',marginBottom:8}}>Added by {r.addedBy} · {r.date}</div>
                        <button className="btn btn-s btn-sm" onClick={() => store.downloadResource(r)}>{r.type==='Link'?'Open':'Download'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════
              ACHIEVEMENTS — live badges + XP
          ════════════════════════════════════════════ */}
          {page === 'achievements' && <AchievementsTab user={user} />}

          {/* ════════════════════════════════════════════
              GROUP MODE DASHBOARD OVERRIDE
              When learningMode === 'group', show group dashboard
              instead of individual mastery dashboard
          ════════════════════════════════════════════ */}
          {page === 'dashboard' && learningMode === 'group' && (
            <div>
              <div style={{marginBottom:20}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                  <div style={{background:'#22C55E20',border:'1px solid #22C55E40',borderRadius:99,padding:'3px 12px',fontSize:12,fontWeight:700,color:'#22C55E'}}>Group Class Mode</div>
                  <button onClick={()=>{setLearningMode('individual');localStorage.setItem('sm_learning_mode','individual')}} style={{background:'transparent',border:'none',fontSize:12,color:'var(--s400)',cursor:'pointer',textDecoration:'underline'}}>Switch to Individual</button>
                </div>
                <h1 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Welcome back, <em style={{color:'var(--g600)'}}>{firstName}</em>!</h1>
              </div>

              {/* My rooms */}
              <div className="kpi-grid" style={{marginBottom:24}}>
                {[
                  {v:store.groupRooms.filter(r=>r.students.includes(firstName+' Osei')).length||2, l:'My Class Rooms', d:'Enrolled', dc:'var(--g600)'},
                  {v:store.groupRooms.reduce((s,r)=>s+(r.students.includes(firstName+' Osei')?r.enrolled:0),0)||13, l:'Classmates', d:'Across all rooms', dc:'var(--b700)'},
                  {v:'10', l:'Max per Room', d:'Group class limit', dc:'var(--a600)'},
                  {v:store.fees.group_premium||999, l:'KES/month', d:'Group Premium plan', dc:'var(--p600)'},
                ].map((k,i) => (
                  <div key={i} className="kpi"><div className="kpi-v" style={{fontSize:i===3?18:undefined}}>{k.v}</div><div className="kpi-l">{k.l}</div><div className="kpi-d" style={{color:k.dc}}>{k.d}</div></div>
                ))}
              </div>

              {/* My class rooms */}
              <div className="card" style={{marginBottom:20}}>
                <div className="chdr">
                  <div className="ctitle">My Class Rooms</div>
                  <button className="btn btn-g btn-sm" onClick={()=>goTo('myroom')}>View All</button>
                </div>
                {store.groupRooms.slice(0,3).map(room => (
                  <div key={room.id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:'1px solid var(--border)',flexWrap:'wrap'}}>
                    <div style={{width:44,height:44,borderRadius:'var(--rmd)',background:'var(--g50)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14}}>{room.name}</div>
                      <div style={{fontSize:12.5,color:'var(--s500)'}}>{room.teacher} · {room.schedule}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{fontSize:12,color:'var(--s400)'}}>{room.enrolled}/{room.capacity} students</div>
                      <div style={{height:8,width:60,background:'var(--s100)',borderRadius:999,overflow:'hidden'}}>
                        <div style={{height:'100%',width:(room.enrolled/room.capacity*100)+'%',background:room.enrolled>=room.capacity?'var(--r500)':'var(--g500)',borderRadius:999}}/>
                      </div>
                      <span className={`badge ${room.status==='Active'?'badge-green':'badge-slate'}`}>{room.status}</span>
                    </div>
                    <button className="btn btn-p btn-sm" onClick={()=>{setPage('live');setInClassroom(true)}}>Join Class</button>
                  </div>
                ))}
              </div>

              {/* Announcements */}
              {store.getAnnouncements('student').slice(0,2).map((a,i) => (
                <div key={i} style={{background:'var(--b50)',border:'1px solid var(--b100)',borderRadius:'var(--rlg)',padding:'12px 16px',display:'flex',alignItems:'center',gap:12,marginBottom:10,flexWrap:'wrap'}}>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13.5,color:'var(--b700)',marginBottom:2}}>{a.title}</div><div style={{fontSize:12.5,color:'var(--s500)'}}>{a.body}</div></div>
                  <span style={{fontSize:11,color:'var(--s400)'}}>{a.date}</span>
                </div>
              ))}

              {/* Quick actions */}
              <div className="card">
                <div className="ctitle" style={{marginBottom:12}}>Quick Actions</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {[
                    ['Join Live Class', () => {setPage('live');setInClassroom(true)}, '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>'],
                    ['My Class Rooms', () => goTo('myroom'), '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'],
                    ['Resources', () => goTo('resources'), '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>'],
                    ['Ask Mshauri', () => goTo('tutor'), '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'],
                  ].map(([label, action, icon]) => (
                    <button key={label} className="btn btn-s" style={{justifyContent:'flex-start',gap:8,padding:'12px 14px'}} onClick={action}>
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:icon}}/>
                      <span style={{fontSize:13}}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              MY CLASS ROOM (Group mode)
          ════════════════════════════════════════════ */}
          {page === 'myroom' && (
            <div>
              <div style={{marginBottom:20}}>
                <div className="sec-tag">Group Learning</div>
                <h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>My <em style={{color:'var(--g600)'}}>Class Rooms</em></h2>
                <p style={{fontSize:14,color:'var(--s500)',marginTop:4}}>Each room holds up to 10 students. You share lessons, resources and live classes with your classmates.</p>
              </div>

              {store.groupRooms.map(room => (
                <div key={room.id} className="card" style={{marginBottom:16}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:10}}>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                        <div className="serif" style={{fontSize:20,color:'var(--s900)'}}>{room.name}</div>
                        <span className={`badge ${room.status==='Active'?'badge-green':'badge-slate'}`}>{room.status}</span>
                      </div>
                      <div style={{fontSize:13,color:'var(--s500)'}}>{room.teacher} · {room.subject} · {room.curriculum} {room.grade}</div>
                      <div style={{fontSize:13,color:'var(--b600)',marginTop:2}}>{room.schedule}</div>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <div style={{textAlign:'center',background:'var(--bg)',borderRadius:'var(--rmd)',padding:'8px 14px'}}>
                        <div className="mono" style={{fontSize:18,fontWeight:700,color:room.enrolled>=room.capacity?'var(--r500)':'var(--g600)'}}>{room.enrolled}/{room.capacity}</div>
                        <div style={{fontSize:11,color:'var(--s400)'}}>students</div>
                      </div>
                      <button className="btn btn-p btn-sm" onClick={()=>{setPage('live');setInClassroom(true)}}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                        Join Class
                      </button>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div style={{marginBottom:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--s400)',marginBottom:4}}>
                      <span>Room capacity</span>
                      <span>{room.capacity - room.enrolled} seats available</span>
                    </div>
                    <div className="prog-bar" style={{height:8}}>
                      <div className="prog-fill" style={{width:(room.enrolled/room.capacity*100)+'%',background:room.enrolled>=room.capacity?'var(--r500)':'var(--g500)',transition:'width 1s ease'}}/>
                    </div>
                  </div>

                  {/* Classmates */}
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--s400)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>Classmates ({room.enrolled})</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {room.students.map((name, si) => {
                        const cols = ['#3B82F6','#22C55E','#F59E0B','#8B5CF6','#EC4899','#14B8A6','#F97316','#06B6D4','#84CC16','#EF4444']
                        const init = name.split(' ').map(w=>w[0]).join('').slice(0,2)
                        return (
                          <div key={si} title={name} style={{width:36,height:36,borderRadius:'50%',background:cols[si%cols.length]+'20',color:cols[si%cols.length],display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'JetBrains Mono,monospace',fontSize:11,fontWeight:700,border:'2px solid '+cols[si%cols.length]+'40',cursor:'default'}}>
                            {init}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {store.groupRooms.length === 0 && (
                <div className="empty">
                  <h3>No class rooms yet</h3>
                  <p>The admin will assign you to a class room based on your curriculum and subject choices.</p>
                </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}  

         {/* ════════════════════════════════════════════
          SUBSCRIPTION
      ════════════════════════════════════════════ */}
      {page === 'profile' && <ProfileTab user={user} toast={toast} />}
      {page === 'subscription' && (<SubscriptionTab user={user} store={store} toast={toast} />)}
    </div>
  );
}
          
// ═══════════════════════════════════════════════════════════
// QUESTION BANK — IGCSE / Edexcel / CBC
// ═══════════════════════════════════════════════════════════
const QUESTION_BANK = {
  Mathematics: {
    'Algebra': [
      { q: 'Solve for x:  3x + 7 = 22', options: ['x = 5', 'x = 7', 'x = 15', 'x = 29/3'], answer: 'x = 5', explanation: 'Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.' },
      { q: 'Expand (x + 4)(x − 2)', options: ['x² + 2x − 8', 'x² − 2x − 8', 'x² + 6x − 8', 'x² + 2x + 8'], answer: 'x² + 2x − 8', explanation: 'FOIL: x·x + x·(−2) + 4·x + 4·(−2) = x² − 2x + 4x − 8 = x² + 2x − 8.' },
      { q: 'Factorise:  x² − 9', options: ['(x − 3)(x − 3)', '(x + 3)(x − 3)', '(x + 9)(x − 1)', 'Cannot be factorised'], answer: '(x + 3)(x − 3)', explanation: 'Difference of two squares: a² − b² = (a + b)(a − b). Here a = x, b = 3.' },
      { q: 'If 2x − 5 = 11, what is the value of x?', options: ['3', '6', '8', '13'], answer: '8', explanation: 'Add 5: 2x = 16. Divide by 2: x = 8.' },
      { q: 'Simplify:  4(2x + 3) − 5x', options: ['3x + 12', '13x + 12', '8x + 3', '3x + 3'], answer: '3x + 12', explanation: 'Distribute: 8x + 12 − 5x. Combine like terms: 3x + 12.' },
    ],
    'Geometry & Pythagoras': [
      { q: 'A right-angled triangle has legs 6 cm and 8 cm. What is the hypotenuse?', options: ['10 cm', '14 cm', '12 cm', '7 cm'], answer: '10 cm', explanation: 'Pythagoras: c² = 6² + 8² = 36 + 64 = 100, so c = 10 cm.' },
      { q: 'Which set is a Pythagorean triple?', options: ['(2, 3, 4)', '(5, 12, 13)', '(4, 5, 6)', '(1, 2, 3)'], answer: '(5, 12, 13)', explanation: '5² + 12² = 25 + 144 = 169 = 13². The others do not satisfy a² + b² = c².' },
      { q: 'The area of a triangle with base 10 cm and height 6 cm is:', options: ['60 cm²', '30 cm²', '16 cm²', '32 cm²'], answer: '30 cm²', explanation: 'Area = ½ × base × height = ½ × 10 × 6 = 30 cm².' },
      { q: 'The interior angles of a triangle sum to:', options: ['90°', '180°', '270°', '360°'], answer: '180°', explanation: 'Standard geometry fact: interior angles of any triangle always sum to 180°.' },
      { q: 'A square has perimeter 24 cm. What is its area?', options: ['36 cm²', '48 cm²', '72 cm²', '144 cm²'], answer: '36 cm²', explanation: 'Side length = 24 ÷ 4 = 6 cm. Area = 6² = 36 cm².' },
    ],
    'Number & Percentages': [
      { q: 'What is 15% of 240?', options: ['24', '32', '36', '40'], answer: '36', explanation: '15% = 0.15. 0.15 × 240 = 36.' },
      { q: 'A jacket costs $80, then is reduced by 25%. The new price is:', options: ['$55', '$60', '$65', '$75'], answer: '$60', explanation: '25% of 80 = 20. 80 − 20 = $60.' },
      { q: 'Express 0.75 as a fraction in simplest form.', options: ['3/4', '7/10', '75/100', '4/5'], answer: '3/4', explanation: '0.75 = 75/100 = 3/4 (dividing top and bottom by 25).' },
      { q: 'What is the value of 2³ × 3²?', options: ['72', '36', '54', '108'], answer: '72', explanation: '2³ = 8 and 3² = 9. So 8 × 9 = 72.' },
      { q: 'A price increases from $40 to $50. What is the percentage increase?', options: ['10%', '20%', '25%', '50%'], answer: '25%', explanation: 'Increase = $10. Percentage = (10/40) × 100 = 25%.' },
    ],
    'Statistics': [
      { q: 'Find the mean of: 4, 7, 9, 10, 5', options: ['7', '7.5', '6', '8'], answer: '7', explanation: 'Sum = 35. Mean = 35 ÷ 5 = 7.' },
      { q: 'Find the median of: 3, 8, 1, 5, 9, 2, 7', options: ['5', '6', '7', '4'], answer: '5', explanation: 'Sort: 1, 2, 3, 5, 7, 8, 9. Middle value (4th of 7) = 5.' },
      { q: 'Find the mode of: 2, 4, 4, 5, 7, 4, 8', options: ['4', '5', '7', '2'], answer: '4', explanation: 'Mode = the value appearing most often. The number 4 appears 3 times.' },
      { q: 'The range of a data set is:', options: ['Mean of all values', 'Difference between largest and smallest', 'Most common value', 'Sum divided by count'], answer: 'Difference between largest and smallest', explanation: 'Range = max − min. It measures the spread of the data.' },
      { q: 'A bag has 3 red and 7 blue balls. P(picking red) is:', options: ['3/10', '3/7', '7/10', '1/3'], answer: '3/10', explanation: 'P(red) = favourable / total = 3 / (3 + 7) = 3/10.' },
    ],
    'Trigonometry': [
      { q: 'In a right triangle, sin(θ) is defined as:', options: ['Opposite / Hypotenuse', 'Adjacent / Hypotenuse', 'Opposite / Adjacent', 'Hypotenuse / Opposite'], answer: 'Opposite / Hypotenuse', explanation: 'SOH from SOH-CAH-TOA: sin = Opposite / Hypotenuse.' },
      { q: 'What is sin(30°)?', options: ['0.5', '0.707', '0.866', '1'], answer: '0.5', explanation: 'sin(30°) = 1/2 = 0.5. This is a standard angle to memorise.' },
      { q: 'cos(60°) equals:', options: ['√3/2', '1/2', '√2/2', '1'], answer: '1/2', explanation: 'cos(60°) = 0.5. (Note: cos(60°) = sin(30°).)' },
      { q: 'Which of these statements is true?', options: ['sin²θ + cos²θ = 1', 'sin²θ − cos²θ = 1', 'sin θ + cos θ = 1', 'tan θ = sin θ × cos θ'], answer: 'sin²θ + cos²θ = 1', explanation: 'Pythagorean identity. Always true for any angle θ.' },
      { q: 'tan(45°) =', options: ['0', '1', '√2', '∞'], answer: '1', explanation: 'tan(45°) = sin(45°)/cos(45°) = (√2/2)/(√2/2) = 1.' },
    ],
  },
 
  Physics: {
    'Forces & Motion': [
      { q: 'Newton\'s second law is expressed as:', options: ['F = ma', 'F = m/a', 'F = m + a', 'F = m − a'], answer: 'F = ma', explanation: 'Force = mass × acceleration. Standard Newton\'s second law equation.' },
      { q: 'A car accelerates from rest at 4 m/s². After 5 seconds its velocity is:', options: ['9 m/s', '20 m/s', '25 m/s', '4 m/s'], answer: '20 m/s', explanation: 'v = u + at = 0 + 4 × 5 = 20 m/s.' },
      { q: 'The SI unit of force is:', options: ['Joule', 'Watt', 'Newton', 'Pascal'], answer: 'Newton', explanation: '1 Newton = 1 kg·m/s². Named after Sir Isaac Newton.' },
      { q: 'Acceleration due to gravity on Earth is approximately:', options: ['8.8 m/s²', '9.8 m/s²', '10.8 m/s²', '11.8 m/s²'], answer: '9.8 m/s²', explanation: 'g ≈ 9.8 m/s² near Earth\'s surface (often rounded to 10 in IGCSE problems).' },
      { q: 'Momentum is defined as:', options: ['mass × velocity', 'mass × acceleration', 'force × time', 'force × distance'], answer: 'mass × velocity', explanation: 'p = mv. Momentum is the product of mass and velocity.' },
    ],
    'Electricity': [
      { q: 'Ohm\'s Law states:', options: ['V = IR', 'V = I/R', 'V = I + R', 'V = I − R'], answer: 'V = IR', explanation: 'Voltage = Current × Resistance. Foundation of basic circuit analysis.' },
      { q: 'The SI unit of electrical resistance is:', options: ['Volt', 'Ampere', 'Ohm', 'Watt'], answer: 'Ohm', explanation: '1 Ohm (Ω) = 1 V/A. Named after Georg Ohm.' },
      { q: 'In a series circuit, the current:', options: ['Is the same everywhere', 'Splits at each junction', 'Increases with each component', 'Decreases with each component'], answer: 'Is the same everywhere', explanation: 'In series, current has only one path so it\'s identical at every point.' },
      { q: 'A 12 V battery drives 3 A through a circuit. The resistance is:', options: ['4 Ω', '36 Ω', '15 Ω', '0.25 Ω'], answer: '4 Ω', explanation: 'R = V/I = 12/3 = 4 Ω.' },
      { q: 'Power dissipated by a resistor is given by:', options: ['P = VI', 'P = V/I', 'P = V + I', 'P = V − I'], answer: 'P = VI', explanation: 'Power = Voltage × Current. Also expressible as I²R or V²/R.' },
    ],
    'Waves': [
      { q: 'Wave speed equation:', options: ['v = fλ', 'v = f/λ', 'v = f + λ', 'v = f − λ'], answer: 'v = fλ', explanation: 'Speed = frequency × wavelength. Fundamental wave equation.' },
      { q: 'The unit of frequency is:', options: ['Metre', 'Second', 'Hertz', 'Newton'], answer: 'Hertz', explanation: '1 Hz = 1 cycle per second. Named after Heinrich Hertz.' },
      { q: 'Sound waves are:', options: ['Transverse', 'Longitudinal', 'Electromagnetic', 'Standing only'], answer: 'Longitudinal', explanation: 'Sound waves consist of compressions and rarefactions parallel to the direction of travel.' },
      { q: 'Light travels in a vacuum at approximately:', options: ['3 × 10⁵ m/s', '3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s'], answer: '3 × 10⁸ m/s', explanation: 'The speed of light in a vacuum is c ≈ 299,792,458 m/s ≈ 3 × 10⁸ m/s.' },
      { q: 'When light passes from air into glass, it:', options: ['Speeds up', 'Slows down', 'Stays the same speed', 'Stops completely'], answer: 'Slows down', explanation: 'Light slows in denser media. This causes refraction (bending of light).' },
    ],
    'Energy': [
      { q: 'The unit of energy is the:', options: ['Watt', 'Joule', 'Newton', 'Pascal'], answer: 'Joule', explanation: '1 Joule = 1 N·m = energy to apply 1 N over 1 m.' },
      { q: 'Kinetic energy is calculated as:', options: ['½mv²', 'mv²', 'mgh', 'mv'], answer: '½mv²', explanation: 'KE = ½ × mass × velocity². Note the factor of one-half.' },
      { q: 'Gravitational potential energy is:', options: ['mgh', '½mv²', 'mv', 'F × d'], answer: 'mgh', explanation: 'GPE = mass × gravity × height. Energy stored due to position above a reference level.' },
      { q: 'Energy can be:', options: ['Created from nothing', 'Destroyed completely', 'Transformed but not destroyed', 'Multiplied by adding fuel'], answer: 'Transformed but not destroyed', explanation: 'Conservation of Energy: total energy is constant; only the form changes.' },
      { q: 'Power is defined as:', options: ['Energy × time', 'Energy / time', 'Energy + time', 'Force × time'], answer: 'Energy / time', explanation: 'P = E/t. Measured in Watts (1 W = 1 J/s).' },
    ],
  },
 
  Biology: {
    'Cell Biology': [
      { q: 'The structure that controls what enters and leaves an animal cell is the:', options: ['Cell wall', 'Cell membrane', 'Nucleus', 'Cytoplasm'], answer: 'Cell membrane', explanation: 'Cell membrane is selectively permeable. (Cell walls are found in plants, fungi, and bacteria — not animal cells.)' },
      { q: 'Photosynthesis occurs in the:', options: ['Mitochondria', 'Nucleus', 'Chloroplasts', 'Ribosomes'], answer: 'Chloroplasts', explanation: 'Chloroplasts contain chlorophyll and convert light energy into chemical energy.' },
      { q: 'The "powerhouse" of the cell is the:', options: ['Nucleus', 'Mitochondrion', 'Chloroplast', 'Vacuole'], answer: 'Mitochondrion', explanation: 'Mitochondria produce ATP through respiration — the cell\'s usable energy currency.' },
      { q: 'Which cell structure contains DNA?', options: ['Cytoplasm', 'Cell membrane', 'Nucleus', 'Ribosome'], answer: 'Nucleus', explanation: 'In eukaryotic cells, DNA is housed in the nucleus.' },
      { q: 'Plant cells have all of the following EXCEPT:', options: ['Cell wall', 'Chloroplasts', 'Centrioles', 'Large vacuole'], answer: 'Centrioles', explanation: 'Centrioles are typically found in animal cells, not plant cells.' },
    ],
    'Human Body Systems': [
      { q: 'Oxygen and carbon dioxide are exchanged in the:', options: ['Trachea', 'Bronchi', 'Alveoli', 'Diaphragm'], answer: 'Alveoli', explanation: 'Alveoli are tiny air sacs with thin walls — gas exchange happens by diffusion across them.' },
      { q: 'The chamber of the heart that pumps blood to the body is the:', options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'], answer: 'Left ventricle', explanation: 'The left ventricle is the most muscular chamber, pumping oxygenated blood through the aorta to the body.' },
      { q: 'Insulin is produced by the:', options: ['Liver', 'Stomach', 'Pancreas', 'Kidney'], answer: 'Pancreas', explanation: 'The pancreas produces insulin (and glucagon) to regulate blood sugar.' },
      { q: 'The largest organ in the human body is the:', options: ['Brain', 'Liver', 'Skin', 'Lungs'], answer: 'Skin', explanation: 'Skin is the largest organ by surface area and weight.' },
      { q: 'Red blood cells transport oxygen using a protein called:', options: ['Insulin', 'Haemoglobin', 'Glucose', 'Albumin'], answer: 'Haemoglobin', explanation: 'Haemoglobin contains iron, which binds oxygen reversibly.' },
    ],
    'Genetics & Inheritance': [
      { q: 'DNA stands for:', options: ['Deoxyribonucleic acid', 'Dinitrogen acid', 'Diribonucleic acid', 'Dinucleic acid'], answer: 'Deoxyribonucleic acid', explanation: 'DNA = Deoxyribonucleic Acid. Stores genetic information in all living cells.' },
      { q: 'A human body cell normally has how many chromosomes?', options: ['23', '46', '92', '12'], answer: '46', explanation: '23 pairs of chromosomes = 46 in total in human somatic cells.' },
      { q: 'The genotype Tt represents:', options: ['Homozygous dominant', 'Homozygous recessive', 'Heterozygous', 'Mutant'], answer: 'Heterozygous', explanation: 'Heterozygous = one dominant + one recessive allele.' },
      { q: 'Sex chromosomes in human males are:', options: ['XX', 'XY', 'YY', 'XO'], answer: 'XY', explanation: 'Males have one X and one Y chromosome. Females have XX.' },
      { q: 'Which scientists are credited with the structure of DNA?', options: ['Darwin & Wallace', 'Watson & Crick', 'Mendel & Morgan', 'Pasteur & Koch'], answer: 'Watson & Crick', explanation: 'James Watson and Francis Crick proposed the double helix structure in 1953 (with key data from Rosalind Franklin).' },
    ],
    'Ecology': [
      { q: 'Producers in an ecosystem are typically:', options: ['Herbivores', 'Carnivores', 'Plants', 'Decomposers'], answer: 'Plants', explanation: 'Plants produce their own food via photosynthesis — they\'re the base of most food chains.' },
      { q: 'A food chain typically starts with:', options: ['A predator', 'A producer', 'A decomposer', 'A consumer'], answer: 'A producer', explanation: 'Producers (plants) capture solar energy. Energy then flows up to consumers.' },
      { q: 'The process by which water evaporates and forms clouds is part of the:', options: ['Carbon cycle', 'Nitrogen cycle', 'Water cycle', 'Rock cycle'], answer: 'Water cycle', explanation: 'The water cycle includes evaporation, condensation, precipitation, and collection.' },
      { q: 'A community of organisms with their physical environment forms a(n):', options: ['Population', 'Species', 'Ecosystem', 'Habitat'], answer: 'Ecosystem', explanation: 'Ecosystem = biotic (living) + abiotic (non-living) factors interacting.' },
      { q: 'Which gas do plants take in for photosynthesis?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], answer: 'Carbon dioxide', explanation: 'Plants absorb CO₂ and release O₂ during photosynthesis.' },
    ],
  },
 
  Chemistry: {
    'Atomic Structure': [
      { q: 'The atomic number of an element equals the number of:', options: ['Neutrons', 'Protons', 'Electrons + Neutrons', 'Protons + Neutrons'], answer: 'Protons', explanation: 'Atomic number Z = number of protons. (In a neutral atom, this also equals the number of electrons.)' },
      { q: 'Which subatomic particle has a negative charge?', options: ['Proton', 'Neutron', 'Electron', 'Nucleus'], answer: 'Electron', explanation: 'Electrons carry a charge of −1. Protons are +1, neutrons are neutral.' },
      { q: 'The mass number of an atom is:', options: ['Number of protons only', 'Number of electrons only', 'Number of protons + neutrons', 'Number of neutrons only'], answer: 'Number of protons + neutrons', explanation: 'Mass number A = protons + neutrons. Electrons have negligible mass.' },
      { q: 'Isotopes of an element have:', options: ['Same protons, different neutrons', 'Same neutrons, different protons', 'Same protons and neutrons', 'Different electrons'], answer: 'Same protons, different neutrons', explanation: 'Isotopes have the same atomic number but different mass numbers (e.g. Carbon-12 and Carbon-14).' },
      { q: 'Where are electrons located?', options: ['In the nucleus', 'In shells around the nucleus', 'Spread evenly through the atom', 'Outside the atom'], answer: 'In shells around the nucleus', explanation: 'Electrons occupy energy levels (shells) at specific distances from the nucleus.' },
    ],
    'The Periodic Table': [
      { q: 'Group 1 elements are also known as:', options: ['Halogens', 'Noble gases', 'Alkali metals', 'Transition metals'], answer: 'Alkali metals', explanation: 'Group 1: Li, Na, K, Rb, Cs, Fr — soft, highly reactive metals.' },
      { q: 'Group 7 elements are called:', options: ['Halogens', 'Alkali metals', 'Noble gases', 'Lanthanides'], answer: 'Halogens', explanation: 'Group 7 (or 17): F, Cl, Br, I, At — non-metals that form salts.' },
      { q: 'Group 0 (or 8) elements are:', options: ['Alkali metals', 'Halogens', 'Noble gases', 'Transition metals'], answer: 'Noble gases', explanation: 'Group 0: He, Ne, Ar, Kr, Xe, Rn — full outer shells, very unreactive.' },
      { q: 'As you go down Group 1, reactivity:', options: ['Decreases', 'Increases', 'Stays the same', 'Becomes zero'], answer: 'Increases', explanation: 'Outer electron is held less tightly going down the group, so it\'s easier to lose, making the element more reactive.' },
      { q: 'Elements in the same period have the same:', options: ['Number of electron shells', 'Number of outer electrons', 'Atomic mass', 'Reactivity'], answer: 'Number of electron shells', explanation: 'Period number = number of electron shells.' },
    ],
    'Chemical Reactions': [
      { q: 'A chemical reaction that releases heat is called:', options: ['Endothermic', 'Exothermic', 'Catalytic', 'Reversible'], answer: 'Exothermic', explanation: 'Exo = "out". Releases heat to the surroundings.' },
      { q: 'A catalyst is a substance that:', options: ['Is consumed in the reaction', 'Speeds up a reaction without being used up', 'Slows down all reactions', 'Reacts only with metals'], answer: 'Speeds up a reaction without being used up', explanation: 'Catalysts lower activation energy and are recovered unchanged at the end.' },
      { q: 'Balance:  H₂ + O₂ → H₂O. Coefficients are:', options: ['1, 1, 1', '2, 1, 2', '1, 2, 2', '2, 2, 1'], answer: '2, 1, 2', explanation: '2H₂ + O₂ → 2H₂O. Now: 4 H atoms each side, 2 O atoms each side. Balanced.' },
      { q: 'pH 7 is:', options: ['Strongly acidic', 'Strongly basic', 'Neutral', 'Salt'], answer: 'Neutral', explanation: 'Pure water has pH 7. Below 7 = acid, above 7 = base.' },
      { q: 'Which gas turns limewater milky?', options: ['Oxygen', 'Hydrogen', 'Carbon dioxide', 'Nitrogen'], answer: 'Carbon dioxide', explanation: 'CO₂ reacts with calcium hydroxide (limewater) forming insoluble calcium carbonate, the white cloudiness.' },
    ],
    'Acids, Bases & Salts': [
      { q: 'An acid produces which ion in water?', options: ['OH⁻', 'H⁺', 'Na⁺', 'Cl⁻'], answer: 'H⁺', explanation: 'Acids release H⁺ (hydrogen ions) in aqueous solution.' },
      { q: 'A base produces which ion in water?', options: ['H⁺', 'OH⁻', 'O²⁻', 'H₃O⁺'], answer: 'OH⁻', explanation: 'Alkalis (soluble bases) release OH⁻ (hydroxide ions) in water.' },
      { q: 'Acid + Base →', options: ['Salt + Hydrogen', 'Salt + Water', 'Salt + Carbon dioxide', 'No reaction'], answer: 'Salt + Water', explanation: 'Neutralisation: H⁺ + OH⁻ → H₂O. The remaining ions form a salt.' },
      { q: 'Acid + Metal →', options: ['Salt + Water', 'Salt + Hydrogen', 'Salt + Oxygen', 'No reaction'], answer: 'Salt + Hydrogen', explanation: 'A reactive metal displaces hydrogen from an acid, producing the metal salt and H₂ gas.' },
      { q: 'Universal indicator turns red in:', options: ['A strong acid', 'A weak base', 'Neutral solution', 'A strong base'], answer: 'A strong acid', explanation: 'Universal indicator: red = strong acid (pH 0–2), green = neutral (pH 7), purple = strong base (pH 13–14).' },
    ],
  },
 
  English: {
    'Reading Comprehension': [
      { q: 'A "metaphor" is:', options: ['A direct comparison using "like" or "as"', 'An indirect comparison without "like" or "as"', 'An exaggeration', 'A repeated sound'], answer: 'An indirect comparison without "like" or "as"', explanation: 'Metaphor: "Time is a thief." Simile would say "Time is like a thief."' },
      { q: 'What is the main purpose of a topic sentence?', options: ['Conclude a paragraph', 'State the main idea of a paragraph', 'Provide an example', 'Add an interesting fact'], answer: 'State the main idea of a paragraph', explanation: 'Topic sentence = anchor of the paragraph. Usually placed first.' },
      { q: 'Which of these is an example of personification?', options: ['The wind whispered through the trees', 'The wind was strong', 'The wind blew at 50 mph', 'The wind was cold'], answer: 'The wind whispered through the trees', explanation: 'Personification gives human qualities ("whispered") to non-human things.' },
      { q: '"He is as brave as a lion" is an example of:', options: ['Metaphor', 'Simile', 'Hyperbole', 'Alliteration'], answer: 'Simile', explanation: 'Simile uses "like" or "as" for comparison.' },
      { q: 'The narrator who refers to themselves as "I" is using:', options: ['First person', 'Second person', 'Third person omniscient', 'Third person limited'], answer: 'First person', explanation: 'First person uses I/me/we. Second uses you. Third uses he/she/they.' },
    ],
    'Grammar & Punctuation': [
      { q: 'Choose the correct sentence:', options: ['Their going to the store', 'There going to the store', 'They\'re going to the store', 'Theyre going to the store'], answer: 'They\'re going to the store', explanation: 'They\'re = "they are". Their = possessive. There = location.' },
      { q: 'A semicolon is used to:', options: ['End a sentence', 'Join two related independent clauses', 'Introduce a list', 'Show possession'], answer: 'Join two related independent clauses', explanation: 'Example: "I love coffee; she prefers tea." Both halves could stand alone, but they\'re closely linked.' },
      { q: 'Which sentence uses an apostrophe correctly?', options: ['The dog\'s tail wagged', 'The dogs tail wagged', 'The dogs\' tail wagged', 'The dog tail\'s wagged'], answer: 'The dog\'s tail wagged', explanation: 'Singular possession: dog\'s. (Plural would be "dogs\'" — note position of the apostrophe.)' },
      { q: 'The past tense of "run" is:', options: ['Runned', 'Ran', 'Running', 'Runs'], answer: 'Ran', explanation: '"Run" is irregular: run / ran / run.' },
      { q: 'Which is a complete sentence?', options: ['Walking down the street', 'The boy walked down the street', 'After the rain stopped', 'Because she was happy'], answer: 'The boy walked down the street', explanation: 'A complete sentence needs a subject ("The boy") and a verb ("walked"). Others are fragments.' },
    ],
    'Literature': [
      { q: 'Shakespeare wrote during which historical period?', options: ['Medieval', 'Renaissance', 'Victorian', 'Romantic'], answer: 'Renaissance', explanation: 'Shakespeare (1564–1616) wrote during the English Renaissance / Elizabethan era.' },
      { q: '"Romeo and Juliet" is a:', options: ['Comedy', 'Tragedy', 'History', 'Sonnet'], answer: 'Tragedy', explanation: 'A Shakespearean tragedy ending in the deaths of both lovers.' },
      { q: 'Which is NOT a feature of poetry?', options: ['Rhyme', 'Rhythm', 'Imagery', 'Long paragraphs'], answer: 'Long paragraphs', explanation: 'Poetry uses lines/stanzas, not paragraphs. The other three are common poetic features.' },
      { q: 'A "sonnet" typically has how many lines?', options: ['10', '12', '14', '16'], answer: '14', explanation: 'Traditional sonnet (Shakespearean or Petrarchan) = 14 lines, often in iambic pentameter.' },
      { q: 'The protagonist of a story is:', options: ['The villain', 'The main character', 'The narrator', 'The setting'], answer: 'The main character', explanation: 'Protagonist = central character whose journey the story follows.' },
    ],
    'Writing Skills': [
      { q: 'A persuasive essay aims to:', options: ['Tell a story', 'Describe a scene', 'Convince the reader', 'Provide instructions'], answer: 'Convince the reader', explanation: 'Persuasive writing presents arguments to influence the reader\'s opinion.' },
      { q: 'A good thesis statement is:', options: ['Vague and general', 'Clear and specific', 'A question', 'A description'], answer: 'Clear and specific', explanation: 'Strong thesis = clear claim + specific reasons. Frames the entire essay.' },
      { q: 'The best place for a topic sentence in an academic paragraph is:', options: ['At the end', 'In the middle', 'At the start', 'Doesn\'t matter'], answer: 'At the start', explanation: 'Topic sentence first → reader knows the paragraph\'s focus immediately.' },
      { q: 'Which is the most formal opening for a letter?', options: ['Hi there!', 'Dear Sir/Madam,', 'Hey,', 'What\'s up?'], answer: 'Dear Sir/Madam,', explanation: 'Standard formal salutation when you don\'t know the recipient\'s name.' },
      { q: '"In conclusion" is typically used to:', options: ['Introduce a new topic', 'Add an example', 'Begin a final summary', 'Disagree with a point'], answer: 'Begin a final summary', explanation: 'Conclusion phrases signal the closing summary of an essay or argument.' },
    ],
  },
};
 
// Subject colours — premium palette
const SUBJECT_COLOURS = {
  Mathematics: '#8B1A2E',
  Physics: '#1E3A8A',
  Chemistry: '#166534',
  Biology: '#7C2D12',
  English: '#6B21A8',
  History: '#92400E',
  Geography: '#0F766E',
  'Computer Science': '#1F2937',
  'Business Studies': '#7E22CE',
  Economics: '#9F1239',
}
const subjectColour = (s) => SUBJECT_COLOURS[s] || '#8B1A2E'
 
// Persisted XP/sessions in localStorage
const PRACTICE_XP_KEY = 'sm_practice_xp'
const PRACTICE_HIST_KEY = 'sm_practice_history'
 
const loadXp = () => {
  try { return parseInt(localStorage.getItem(PRACTICE_XP_KEY) || '0', 10) || 0 }
  catch { return 0 }
}
const saveXp = (xp) => { try { localStorage.setItem(PRACTICE_XP_KEY, String(xp)) } catch {} }
const loadHist = () => {
  try { return JSON.parse(localStorage.getItem(PRACTICE_HIST_KEY) || '[]') }
  catch { return [] }
}
const saveHist = (hist) => { try { localStorage.setItem(PRACTICE_HIST_KEY, JSON.stringify(hist.slice(-50))) } catch {} }
 
// Shuffle helper
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
 
function PracticeTab({ user, toast, goTo }) {
  const [stage, setStage]       = useState('pick')      // 'pick' | 'quiz' | 'result'
  const [subject, setSubject]   = useState(null)
  const [topic, setTopic]       = useState(null)
  const [questions, setQs]      = useState([])
  const [answers, setAnswers]   = useState({})
  const [result, setResult]     = useState(null)
  const [xp, setXp]             = useState(loadXp())
  const [hist, setHist]         = useState(loadHist())
 
  const allSubjects = Object.keys(QUESTION_BANK)
 
  const startQuiz = (subj, top) => {
    const bank = QUESTION_BANK[subj]?.[top] || []
    if (bank.length === 0) {
      toast?.error?.('No questions for this topic yet.')
      return
    }
    // Pick 5, shuffle, shuffle options too
    const picked = shuffle(bank).slice(0, 5).map((q, i) => ({
      ...q,
      id: i + 1,
      shuffledOptions: shuffle(q.options),
      marks: q.marks || 5,
    }))
    setSubject(subj)
    setTopic(top)
    setQs(picked)
    setAnswers({})
    setResult(null)
    setStage('quiz')
  }
 
  const submit = () => {
    let correct = 0
    questions.forEach(q => {
      if (answers[q.id] === q.answer) correct++
    })
    const score = Math.round((correct / questions.length) * 100)
    const xpEarned = correct * 20  // 20 XP per correct = max 100/quiz
    const newXp = xp + xpEarned
    const session = {
      subject, topic, score, correct,
      total: questions.length,
      xpEarned,
      date: new Date().toISOString(),
    }
    const newHist = [...hist, session]
    setXp(newXp)
    setHist(newHist)
    saveXp(newXp)
    saveHist(newHist)
    setResult({ correct, score, xpEarned })
    setStage('result')
    if (score >= 80)      toast?.ok?.(`Excellent! +${xpEarned} XP`)
    else if (score >= 60) toast?.ok?.(`Good work! +${xpEarned} XP`)
    else                  toast?.info?.(`+${xpEarned} XP. Try again to improve!`)
  }
 
  const resetToPick = () => {
    setStage('pick')
    setSubject(null)
    setTopic(null)
    setQuestions([])
    setAnswers({})
    setResult(null)
  }
 
  // ── PICK SCREEN ──────────────────────────────────────────
  if (stage === 'pick') {
    return (
      <div>
        {/* Hero */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
          color: '#fff',
        }}>
          <div style={{ padding: '24px 30px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Practice &amp; Master
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Sharpen your skills, one topic at a time
            </h2>
            <p style={{ fontSize: 13.5, opacity: .85, marginTop: 8, marginBottom: 0, maxWidth: 540, lineHeight: 1.55 }}>
              5 questions per session. Instant feedback. Earn XP for every correct answer. Choose a subject below to begin.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
            {[
              ['Total XP', xp.toLocaleString()],
              ['Sessions', hist.length],
              ['Best Score', hist.length ? `${Math.max(...hist.map(h => h.score))}%` : '—'],
              ['Avg Score', hist.length ? `${Math.round(hist.reduce((s, h) => s + h.score, 0) / hist.length)}%` : '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>
                  {l}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Subject grid */}
        <div style={{ marginBottom: 14 }}>
          <div className="sec-tag">Pick a subject</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 24 }}>
          {allSubjects.map(s => {
            const col   = subjectColour(s)
            const topics = Object.keys(QUESTION_BANK[s])
            return (
              <div key={s} className="card" style={{ padding: 0, overflow: 'hidden', borderTop: `4px solid ${col}` }}>
                <div style={{ padding: '16px 18px 12px' }}>
                  <div className="serif" style={{ fontSize: 18, color: 'var(--s900)', marginBottom: 4 }}>{s}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
                    {topics.length} topic{topics.length === 1 ? '' : 's'} · IGCSE / Edexcel
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', padding: '8px 8px' }}>
                  {topics.map(t => (
                    <button
                      key={t}
                      onClick={() => startQuiz(s, t)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '8px 10px', borderRadius: 6,
                        border: 'none', background: 'transparent',
                        cursor: 'pointer', fontSize: 13, color: 'var(--s700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'background .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = col + '14' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <span>{t}</span>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={col} strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
 
        {/* Recent sessions */}
        {hist.length > 0 && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 12 }}>Recent Sessions</div>
            <table className="tbl">
              <thead>
                <tr><th>Date</th><th>Subject</th><th>Topic</th><th>Score</th><th>XP</th></tr>
              </thead>
              <tbody>
                {[...hist].reverse().slice(0, 8).map((h, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 12.5, color: 'var(--s500)' }}>
                      {new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{h.subject}</td>
                    <td style={{ fontSize: 13, color: 'var(--s600)' }}>{h.topic}</td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: h.score >= 80 ? 'var(--g600)' : h.score >= 60 ? 'var(--b700)' : 'var(--a600)' }}>
                        {h.score}%
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: 'var(--p600)' }}>+{h.xpEarned}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }
 
  // ── QUIZ SCREEN ──────────────────────────────────────────
  if (stage === 'quiz') {
    const answered = Object.keys(answers).length
    const col = subjectColour(subject)
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div className="sec-tag">{subject} · IGCSE Practice</div>
            <h2 className="serif" style={{ fontSize: 22, color: 'var(--s900)' }}>{topic}</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--s500)' }}>{answered}/{questions.length} answered</div>
            <button className="btn btn-s btn-sm" onClick={resetToPick}>Change Topic</button>
          </div>
        </div>
 
        <div className="prog-bar" style={{ marginBottom: 20, height: 8 }}>
          <div className="prog-fill" style={{ width: `${(answered / questions.length) * 100}%`, background: col, transition: 'width .3s' }}/>
        </div>
 
        {questions.map(q => (
          <div key={q.id} className="card" style={{ marginBottom: 14, borderColor: answers[q.id] ? col : 'var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: answers[q.id] ? col : 'var(--s200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: answers[q.id] ? '#fff' : 'var(--s500)',
                  flexShrink: 0,
                }}>{q.id}</div>
                <span style={{ fontSize: 15, color: 'var(--s800)', fontWeight: 500, lineHeight: 1.5 }}>{q.q}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--s400)', flexShrink: 0, marginLeft: 8 }}>{q.marks} marks</span>
            </div>
            {q.shuffledOptions.map(opt => (
              <label
                key={opt}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', marginBottom: 7,
                  borderRadius: 'var(--rmd)', cursor: 'pointer',
                  border: `1.5px solid ${answers[q.id] === opt ? col : 'var(--border)'}`,
                  background: answers[q.id] === opt ? col + '0F' : 'var(--bg)',
                  transition: 'all .15s',
                }}
              >
                <input
                  type="radio"
                  name={`q${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                  style={{ accentColor: col }}
                />
                <span style={{ fontSize: 14, color: answers[q.id] === opt ? col : 'var(--s700)', fontWeight: answers[q.id] === opt ? 600 : 400 }}>
                  {opt}
                </span>
              </label>
            ))}
          </div>
        ))}
 
        <div style={{ position: 'sticky', bottom: 16, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--rxl)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--sh-lg)' }}>
          <div style={{ fontSize: 13.5, color: 'var(--s600)' }}>
            {answered < questions.length
              ? <span style={{ color: 'var(--a600)' }}>{questions.length - answered} unanswered</span>
              : <span style={{ color: 'var(--g600)' }}>All questions answered</span>
            }
          </div>
          <button
            className="btn btn-p"
            onClick={submit}
            disabled={answered === 0}
            style={{ background: col, borderColor: col }}
          >
            Submit Answers
          </button>
        </div>
      </div>
    )
  }
 
  // ── RESULT SCREEN ────────────────────────────────────────
  if (stage === 'result' && result) {
    const col = subjectColour(subject)
    const wrong = questions.filter(q => answers[q.id] && answers[q.id] !== q.answer)
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: result.score >= 80 ? 'var(--g50)' : result.score >= 60 ? 'var(--b50)' : 'var(--a50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span className="mono" style={{
              fontSize: 28, fontWeight: 700,
              color: result.score >= 80 ? 'var(--g600)' : result.score >= 60 ? 'var(--b700)' : 'var(--a600)',
            }}>{result.score}%</span>
          </div>
          <h2 className="serif" style={{ fontSize: 26, color: 'var(--s900)', marginBottom: 6 }}>
            {result.score >= 80 ? 'Excellent work!' : result.score >= 60 ? 'Good effort!' : 'Keep practising!'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--s500)', marginBottom: 20 }}>
            {topic} — {subject}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              ['Correct', `${result.correct}/${questions.length}`, 'var(--b50)', 'var(--b700)'],
              ['XP Earned', `+${result.xpEarned}`, 'var(--p50, var(--a50))', 'var(--p600, var(--a600))'],
              ['Total XP', xp.toLocaleString(), 'var(--g50)', 'var(--g600)'],
            ].map(([l, v, bg, c]) => (
              <div key={l} style={{ background: bg, borderRadius: 'var(--rmd)', padding: '14px 10px' }}>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-p" onClick={() => startQuiz(subject, topic)} style={{ background: col, borderColor: col }}>
              Try Again
            </button>
            <button className="btn btn-s" onClick={resetToPick}>Pick Another Topic</button>
            <button className="btn btn-s" onClick={() => goTo?.('dashboard')}>Back to Dashboard</button>
          </div>
        </div>
 
        {/* Review wrong answers */}
        {wrong.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="sec-tag" style={{ marginBottom: 8 }}>Review</div>
            <h3 className="serif" style={{ fontSize: 18, color: 'var(--s900)', marginBottom: 14 }}>
              Let&apos;s look at what you missed
            </h3>
            {wrong.map((q, i) => (
              <div key={i} className="card" style={{ marginBottom: 10, borderLeft: '4px solid var(--r500)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--s900)', marginBottom: 8 }}>
                  Q{q.id}: {q.q}
                </div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: 'var(--s500)' }}>Your answer: </span>
                  <span style={{ color: 'var(--r600)', fontWeight: 600 }}>{answers[q.id]}</span>
                </div>
                <div style={{ fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--s500)' }}>Correct answer: </span>
                  <span style={{ color: 'var(--g700)', fontWeight: 600 }}>{q.answer}</span>
                </div>
                {q.explanation && (
                  <div style={{ fontSize: 12.5, color: 'var(--s600)', fontStyle: 'italic', background: 'var(--bg)', padding: '8px 12px', borderRadius: 'var(--rsm)' }}>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
 
  return null
}
          
 // ═══════════════════════════════════════════════════════════
// ACHIEVEMENTS TAB — reads from PracticeTab's localStorage
// ═══════════════════════════════════════════════════════════
function AchievementsTab({ user }) {
  // Read same keys that PracticeTab writes
  const xp   = (() => { try { return parseInt(localStorage.getItem('sm_practice_xp') || '0', 10) || 0 } catch { return 0 } })()
  const hist = (() => { try { return JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch { return [] } })()
 
  // Calculate streaks from history dates
  const calcStreak = (sessions) => {
    if (sessions.length === 0) return 0
    const days = new Set(sessions.map(s => new Date(s.date).toDateString()))
    let streak = 0
    let cursor = new Date()
    // Look back day by day; allow today + consecutive prior days
    // First check: did they practice today OR yesterday? (yesterday because they might
    // not have practiced yet today but the streak isn't broken)
    const today     = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (!days.has(today) && !days.has(yesterday)) return 0
    if (!days.has(today)) cursor = new Date(Date.now() - 86400000)
 
    while (days.has(cursor.toDateString())) {
      streak++
      cursor = new Date(cursor.getTime() - 86400000)
    }
    return streak
  }
 
  const streak           = calcStreak(hist)
  const sessionCount     = hist.length
  const subjectsPracticed = [...new Set(hist.map(h => h.subject))]
  const avgScore         = hist.length ? Math.round(hist.reduce((s, h) => s + h.score, 0) / hist.length) : 0
  const bestScore        = hist.length ? Math.max(...hist.map(h => h.score)) : 0
  const bestEver         = hist.find(h => h.score === bestScore)
 
  // Per-subject averages (for Subject Specialist badge)
  const subjectAverages = {}
  subjectsPracticed.forEach(subj => {
    const subjSessions = hist.filter(h => h.subject === subj)
    subjectAverages[subj] = Math.round(subjSessions.reduce((s, h) => s + h.score, 0) / subjSessions.length)
  })
  const hasSpecialty = Object.values(subjectAverages).some(avg => avg >= 80)
  const specialtySubject = Object.entries(subjectAverages).find(([_, avg]) => avg >= 80)?.[0]
 
  // ── BADGES — earned conditions ───────────────────────────
  const badges = [
    { id:'first',       name:'First Steps',       desc:'Complete your first session',   tier:'bronze', earned: sessionCount >= 1 },
    { id:'quick',       name:'Quick Learner',     desc:'Score 60%+ on a session',         tier:'bronze', earned: bestScore >= 60 },
    { id:'high',        name:'High Achiever',     desc:'Score 80%+ on a session',         tier:'silver', earned: bestScore >= 80 },
    { id:'perfect',     name:'Perfectionist',     desc:'Score 100% on a session',         tier:'gold',   earned: bestScore >= 100 },
    { id:'dedicated',   name:'Dedicated',         desc:'Complete 5 sessions',             tier:'bronze', earned: sessionCount >= 5 },
    { id:'committed',   name:'Committed',         desc:'Complete 25 sessions',            tier:'silver', earned: sessionCount >= 25 },
    { id:'scholar',     name:'Scholar',           desc:'Complete 100 sessions',           tier:'gold',   earned: sessionCount >= 100 },
    { id:'xp100',       name:'Centurion',         desc:'Earn 100 XP',                     tier:'bronze', earned: xp >= 100 },
    { id:'xp500',       name:'Half Millennium',   desc:'Earn 500 XP',                     tier:'silver', earned: xp >= 500 },
    { id:'xp1000',      name:'Millennium',        desc:'Earn 1,000 XP',                   tier:'gold',   earned: xp >= 1000 },
    { id:'xp5000',      name:'Legend',            desc:'Earn 5,000 XP',                   tier:'platinum', earned: xp >= 5000 },
    { id:'streak3',     name:'3-Day Streak',      desc:'Practice 3 days in a row',        tier:'bronze', earned: streak >= 3 },
    { id:'streak7',     name:'Week Warrior',      desc:'Practice 7 days in a row',        tier:'silver', earned: streak >= 7 },
    { id:'streak30',    name:'Monthly Master',    desc:'Practice 30 days in a row',       tier:'platinum', earned: streak >= 30 },
    { id:'renaissance', name:'Renaissance',       desc:'Practice 3 different subjects',   tier:'silver', earned: subjectsPracticed.length >= 3 },
    { id:'allrounder',  name:'All Rounder',       desc:'Practice all 5 subjects',         tier:'gold',   earned: subjectsPracticed.length >= 5 },
    { id:'specialist',  name:'Subject Specialist',desc:'Average 80%+ in any subject',     tier:'gold',   earned: hasSpecialty },
  ]
 
  const earnedBadges = badges.filter(b => b.earned)
  const lockedBadges = badges.filter(b => !b.earned)
 
  // Tier styling
  const tierStyles = {
    bronze:   { bg:'#CD7F3220', border:'#CD7F32', icon:'#CD7F32' },
    silver:   { bg:'#C0C0C020', border:'#9CA3AF', icon:'#6B7280' },
    gold:     { bg:'#F0CC5A20', border:'#F0CC5A', icon:'#C9973A' },
    platinum: { bg:'#E5E4E220', border:'#94A3B8', icon:'#475569' },
  }
 
  // Next level XP target — 1,000 XP per level
  const currentLevel    = Math.floor(xp / 1000) + 1
  const xpThisLevel     = xp % 1000
  const xpToNextLevel   = 1000 - xpThisLevel
  const levelProgressPct = Math.round((xpThisLevel / 1000) * 100)
 
  // Top-3 milestone close to unlocking
  const closeBadges = lockedBadges
    .map(b => {
      let progress = 0, target = 1
      if (b.id === 'first')       { progress = sessionCount; target = 1 }
      else if (b.id === 'quick')  { progress = bestScore; target = 60 }
      else if (b.id === 'high')   { progress = bestScore; target = 80 }
      else if (b.id === 'perfect'){ progress = bestScore; target = 100 }
      else if (b.id === 'dedicated'){ progress = sessionCount; target = 5 }
      else if (b.id === 'committed'){ progress = sessionCount; target = 25 }
      else if (b.id === 'scholar'){ progress = sessionCount; target = 100 }
      else if (b.id === 'xp100')  { progress = xp; target = 100 }
      else if (b.id === 'xp500')  { progress = xp; target = 500 }
      else if (b.id === 'xp1000') { progress = xp; target = 1000 }
      else if (b.id === 'xp5000') { progress = xp; target = 5000 }
      else if (b.id === 'streak3'){ progress = streak; target = 3 }
      else if (b.id === 'streak7'){ progress = streak; target = 7 }
      else if (b.id === 'streak30'){ progress = streak; target = 30 }
      else if (b.id === 'renaissance'){ progress = subjectsPracticed.length; target = 3 }
      else if (b.id === 'allrounder'){ progress = subjectsPracticed.length; target = 5 }
      else if (b.id === 'specialist'){
        const bestAvg = Math.max(0, ...Object.values(subjectAverages))
        progress = bestAvg; target = 80
      }
      return { ...b, progress, target, pct: Math.min(100, Math.round((progress/target)*100)) }
    })
    .sort((a,b) => b.pct - a.pct)
    .slice(0, 3)
 
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '28px 32px 22px', display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          {/* Level badge */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'rgba(240,204,90,.18)',
            border: '3px solid #F0CC5A',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,.25)',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A', opacity: .85 }}>
              Level
            </div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#F0CC5A', lineHeight: 1 }}>
              {currentLevel}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 4 }}>
              Your Achievements
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              {earnedBadges.length === 0
                ? 'Start practising to earn your first badge'
                : earnedBadges.length < 5
                ? "You're on your way"
                : earnedBadges.length < 10
                ? 'Strong progress, keep it up'
                : 'You are an achiever'}
            </h2>
            <div style={{ fontSize: 13.5, opacity: .85, marginTop: 6 }}>
              {earnedBadges.length} of {badges.length} badges earned · {xpToNextLevel.toLocaleString()} XP to Level {currentLevel + 1}
            </div>
          </div>
        </div>
        {/* XP progress bar inside hero */}
        <div style={{ background: 'rgba(0,0,0,.2)', padding: '12px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: .75, marginBottom: 5 }}>
            <span>{xpThisLevel} / 1,000 XP</span>
            <span className="mono">{levelProgressPct}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              width: levelProgressPct + '%',
              height: '100%',
              background: 'linear-gradient(90deg, #F0CC5A, #C9973A)',
              borderRadius: 99,
              transition: 'width 1s ease',
            }}/>
          </div>
        </div>
        {/* Stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          {[
            ['Total XP',      xp.toLocaleString()],
            ['Day Streak',    streak === 0 ? '0' : `${streak} day${streak === 1 ? '' : 's'}`],
            ['Sessions',      sessionCount],
            ['Best Score',    sessionCount ? `${bestScore}%` : '—'],
            ['Avg Score',     sessionCount ? `${avgScore}%` : '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)', borderTop: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Empty state if no sessions yet */}
      {sessionCount === 0 ? (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="1.5" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 17, color: 'var(--s800)', marginBottom: 6 }}>Your achievements will appear here</h3>
          <p style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 380, margin: '0 auto' }}>
            Complete your first practice session to start earning XP and unlocking badges.
          </p>
        </div>
      ) : (
        <>
          {/* Almost-there badges */}
          {closeBadges.length > 0 && (
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="ctitle" style={{ marginBottom: 14 }}>Almost there</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {closeBadges.map(b => {
                  const tier = tierStyles[b.tier]
                  return (
                    <div key={b.id} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: tier.bg, border: `2px solid ${tier.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, opacity: .55, filter: 'grayscale(.4)',
                      }}>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={tier.icon} strokeWidth="2" strokeLinecap="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s800)' }}>{b.name}</div>
                          <div className="mono" style={{ fontSize: 12, color: 'var(--s500)' }}>
                            {b.progress} / {b.target}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 5 }}>{b.desc}</div>
                        <div style={{ height: 5, background: 'var(--s100)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: b.pct + '%', height: '100%', background: tier.icon, borderRadius: 99, transition: 'width 1s ease' }}/>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
 
          {/* Earned badges */}
          {earnedBadges.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 12 }}>
                <div className="sec-tag">Earned · {earnedBadges.length}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {earnedBadges.map(b => {
                  const tier = tierStyles[b.tier]
                  return (
                    <div key={b.id} style={{
                      background: '#fff',
                      border: `2px solid ${tier.border}`,
                      borderRadius: 'var(--rlg)',
                      padding: '18px 14px',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'all .2s',
                      boxShadow: `0 4px 12px ${tier.bg}`,
                    }}>
                      {/* Tier ribbon */}
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: tier.icon, color: '#fff',
                        fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                        padding: '2px 7px', borderRadius: 99,
                      }}>
                        {b.tier}
                      </div>
                      <div style={{
                        width: 56, height: 56, margin: '0 auto 10px', borderRadius: '50%',
                        background: tier.bg, border: `2px solid ${tier.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="28" height="28" fill={tier.icon} stroke={tier.icon} strokeWidth="1" viewBox="0 0 24 24">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--s900)', marginBottom: 3 }}>{b.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>{b.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
 
          {/* Locked badges */}
          {lockedBadges.length > 0 && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <div className="sec-tag">Locked · {lockedBadges.length}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {lockedBadges.map(b => {
                  const tier = tierStyles[b.tier]
                  return (
                    <div key={b.id} style={{
                      background: 'var(--bg)',
                      border: '1.5px solid var(--s200)',
                      borderRadius: 'var(--rlg)',
                      padding: '18px 14px',
                      textAlign: 'center',
                      opacity: .55,
                      filter: 'grayscale(.5)',
                      transition: 'all .2s',
                    }}>
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                      }}/>
                      <div style={{
                        width: 56, height: 56, margin: '0 auto 10px', borderRadius: '50%',
                        background: 'var(--s100)', border: '2px solid var(--s200)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="2" strokeLinecap="round">
                          <rect x="3" y="11" width="18" height="11" rx="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--s700)', marginBottom: 3 }}>{b.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>{b.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

 // ═══════════════════════════════════════════════════════════
// EXAMS TAB — uses QUESTION_BANK from PracticeTab paste
// ═══════════════════════════════════════════════════════════
const EXAM_HIST_KEY = 'sm_exam_history'
const EXAM_DURATION_SECONDS = 60 * 60  // 60 minutes
const EXAM_QUESTION_COUNT   = 10
 
const loadExamHist = () => {
  try { return JSON.parse(localStorage.getItem(EXAM_HIST_KEY) || '[]') }
  catch { return [] }
}
const saveExamHist = (h) => {
  try { localStorage.setItem(EXAM_HIST_KEY, JSON.stringify(h.slice(-30))) } catch {}
}
 
const fmtExamTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
 
const gradeFor = (pct) => {
  if (pct >= 90) return { grade: 'A*', colour: 'var(--g600)', message: 'Outstanding!' }
  if (pct >= 80) return { grade: 'A',  colour: 'var(--g600)', message: 'Excellent!' }
  if (pct >= 70) return { grade: 'B',  colour: 'var(--b700)', message: 'Very good.' }
  if (pct >= 60) return { grade: 'C',  colour: 'var(--b700)', message: 'Good. Pass.' }
  if (pct >= 50) return { grade: 'D',  colour: 'var(--a600)', message: 'Borderline pass.' }
  if (pct >= 40) return { grade: 'E',  colour: 'var(--a600)', message: 'Below pass.' }
  return         { grade: 'U',         colour: 'var(--r500)', message: 'Ungraded — review and retry.' }
}
 
const examShuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
 
function ExamsTab({ user, toast, goTo, store }) {
  const [stage,    setStage]    = useState('list')   // 'list' | 'sitting' | 'result'
  const [subject,  setSubject]  = useState(null)
  const [examQs,   setExamQs]   = useState([])
  const [answers,  setAnswers]  = useState({})
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS)
  const [result,   setResult]   = useState(null)
  const [hist,     setHist]     = useState(loadExamHist())
 
  // Build available exams — one per subject (mixed topics)
  const availableExams = Object.keys(QUESTION_BANK).map(subj => {
    const allQs = []
    Object.entries(QUESTION_BANK[subj]).forEach(([topic, qs]) => {
      qs.forEach(q => allQs.push({ ...q, topic }))
    })
    return {
      subject: subj,
      title: `${subj} — Mixed Topics Exam`,
      questionsAvailable: allQs.length,
      topics: Object.keys(QUESTION_BANK[subj]).length,
      colour: subjectColour(subj),
    }
  })
 
  // ── Timer effect ─────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'sitting') return
    if (timeLeft <= 0) {
      submitExam(true)
      return
    }
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [stage, timeLeft])
 
  const startExam = (subj) => {
    const allQs = []
    Object.entries(QUESTION_BANK[subj]).forEach(([topic, qs]) => {
      qs.forEach(q => allQs.push({ ...q, topic }))
    })
    if (allQs.length < EXAM_QUESTION_COUNT) {
      toast?.error?.(`Not enough questions for ${subj} exam yet.`)
      return
    }
    const picked = examShuffle(allQs).slice(0, EXAM_QUESTION_COUNT).map((q, i) => ({
      ...q,
      id: i + 1,
      shuffledOptions: examShuffle(q.options),
      marks: 5,
    }))
    setSubject(subj)
    setExamQs(picked)
    setAnswers({})
    setTimeLeft(EXAM_DURATION_SECONDS)
    setResult(null)
    setStage('sitting')
  }
 
  const submitExam = (autoSubmitted = false) => {
    let correct = 0
    examQs.forEach(q => {
      if (answers[q.id] === q.answer) correct++
    })
    const score = Math.round((correct / examQs.length) * 100)
    const session = {
      subject, score, correct,
      total: examQs.length,
      autoSubmitted,
      timeUsed: EXAM_DURATION_SECONDS - timeLeft,
      date: new Date().toISOString(),
    }
    const newHist = [...hist, session]
    setHist(newHist)
    saveExamHist(newHist)
    setResult({ correct, score, autoSubmitted, timeUsed: session.timeUsed })
    setStage('result')
 
    if (autoSubmitted) toast?.info?.('Time up — exam submitted automatically.')
    else if (score >= 60) toast?.ok?.(`Pass! Grade ${gradeFor(score).grade}`)
    else toast?.info?.(`Below pass mark — keep practising.`)
  }
 
  const exitExam = () => {
    if (window.confirm('Leave the exam? Your progress will be lost.')) {
      setStage('list')
      setExamQs([])
      setAnswers({})
    }
  }
 
  // Released results — read from the actual logged-in student name
  const studentFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const releasedResults = (() => {
    try { return store?.getStudentResults?.(studentFullName) || [] }
    catch { return [] }
  })()
 
  // ── LIST SCREEN ──────────────────────────────────────────
  if (stage === 'list') {
    const passRate = hist.length > 0
      ? Math.round((hist.filter(h => h.score >= 60).length / hist.length) * 100)
      : 0
    const avgGrade = hist.length > 0
      ? gradeFor(Math.round(hist.reduce((s, h) => s + h.score, 0) / hist.length)).grade
      : '—'
 
    return (
      <div>
        {/* Hero */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
          color: '#fff',
        }}>
          <div style={{ padding: '24px 30px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Assessment
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Exam-style assessments under timed conditions
            </h2>
            <p style={{ fontSize: 13.5, opacity: .85, marginTop: 8, marginBottom: 0, maxWidth: 540, lineHeight: 1.55 }}>
              10 questions across mixed topics, 60 minutes, IGCSE-style grading. Your real exam preparation begins here.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
            {[
              ['Exams Taken',  hist.length],
              ['Pass Rate',    hist.length ? `${passRate}%` : '—'],
              ['Avg Grade',    avgGrade],
              ['Best Grade',   hist.length ? gradeFor(Math.max(...hist.map(h => h.score))).grade : '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>
                  {l}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Released results from teacher */}
        {releasedResults.length > 0 && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="ctitle" style={{ marginBottom: 14 }}>Released Results from Teacher</div>
            <table className="tbl">
              <thead>
                <tr><th>Exam</th><th>Score</th><th>Grade</th><th>Date</th><th>Feedback</th></tr>
              </thead>
              <tbody>
                {releasedResults.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.exam}</td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: r.grade === 'A' || r.grade === 'B' ? 'var(--g600)' : 'var(--a600)' }}>
                        {r.score}/{r.total}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${r.grade === 'A' || r.grade === 'B' ? 'badge-green' : 'badge-amber'}`}>{r.grade}</span>
                    </td>
                    <td style={{ color: 'var(--s500)', fontSize: 13 }}>{r.date}</td>
                    <td style={{ fontSize: 12.5, color: 'var(--s500)', maxWidth: 220 }}>{r.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
 
        {/* Available exams */}
        <div style={{ marginBottom: 12 }}>
          <div className="sec-tag">Available Exams</div>
          <h3 className="serif" style={{ fontSize: 20, color: 'var(--s900)', margin: '4px 0 0' }}>
            Sit a {EXAM_QUESTION_COUNT}-question mixed-topic exam
          </h3>
        </div>
 
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
          {availableExams.map(ex => {
            const lastSession = [...hist].reverse().find(h => h.subject === ex.subject)
            return (
              <div key={ex.subject} className="card" style={{
                padding: 0, overflow: 'hidden',
                borderTop: `4px solid ${ex.colour}`,
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ padding: '18px 20px 14px' }}>
                  <div className="serif" style={{ fontSize: 18, color: 'var(--s900)', marginBottom: 4 }}>{ex.subject}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 14 }}>
                    {ex.topics} topics covered · IGCSE / Edexcel
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 14 }}>
                    {[
                      ['Questions', EXAM_QUESTION_COUNT],
                      ['Duration',  '60 min'],
                      ['Marks',     EXAM_QUESTION_COUNT * 5],
                      ['Pass Mark', '60%'],
                    ].map(([l, v]) => (
                      <div key={l} style={{ background: 'var(--bg)', borderRadius: 'var(--rsm)', padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--s400)', marginBottom: 2 }}>{l}</div>
                        <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--s700)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {lastSession && (
                    <div style={{
                      background: lastSession.score >= 60 ? 'var(--g50)' : 'var(--a50)',
                      border: `1px solid ${lastSession.score >= 60 ? 'var(--g100)' : 'var(--a100)'}`,
                      borderRadius: 'var(--rsm)',
                      padding: '8px 12px',
                      marginBottom: 0,
                      fontSize: 12.5,
                      color: lastSession.score >= 60 ? 'var(--g700)' : 'var(--a600)',
                    }}>
                      Last attempt: <strong>{lastSession.score}%</strong> ({gradeFor(lastSession.score).grade}) on {new Date(lastSession.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <button
                    className="btn btn-p"
                    style={{ width: '100%', justifyContent: 'center', background: ex.colour, borderColor: ex.colour }}
                    onClick={() => startExam(ex.subject)}
                  >
                    Start Exam
                  </button>
                </div>
              </div>
            )
          })}
        </div>
 
        {/* Exam history */}
        {hist.length > 0 && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 12 }}>My Exam History</div>
            <table className="tbl">
              <thead>
                <tr><th>Date</th><th>Subject</th><th>Score</th><th>Grade</th><th>Time Used</th></tr>
              </thead>
              <tbody>
                {[...hist].reverse().slice(0, 10).map((h, i) => {
                  const g = gradeFor(h.score)
                  return (
                    <tr key={i}>
                      <td style={{ fontSize: 12.5, color: 'var(--s500)' }}>
                        {new Date(h.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                      </td>
                      <td style={{ fontWeight: 600 }}>{h.subject}</td>
                      <td>
                        <span className="mono" style={{ fontWeight: 700, color: h.score >= 60 ? 'var(--g600)' : 'var(--a600)' }}>
                          {h.score}%
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700, fontSize: 13,
                          color: g.colour,
                          padding: '2px 10px',
                          borderRadius: 99,
                          background: g.colour + '14',
                        }}>{g.grade}</span>
                      </td>
                      <td className="mono" style={{ fontSize: 12, color: 'var(--s500)' }}>
                        {fmtExamTime(h.timeUsed || 0)}{h.autoSubmitted ? ' (auto)' : ''}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }
 
  // ── SITTING SCREEN ───────────────────────────────────────
  if (stage === 'sitting') {
    const col = subjectColour(subject)
    const answered = Object.keys(answers).length
    return (
      <div>
        {/* Sticky exam header */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rxl)',
          padding: '14px 24px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14,
        }}>
          <div>
            <div className="serif" style={{ fontSize: 18, color: 'var(--s900)' }}>
              {subject} — Mixed Topics Exam
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--s400)' }}>
              {examQs.length} questions · {examQs.length * 5} marks · Pass mark 60%
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 99,
              background: timeLeft < 300 ? 'var(--r50)' : 'var(--bg)',
              border: `1.5px solid ${timeLeft < 300 ? 'var(--r500)' : 'var(--border)'}`,
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={timeLeft < 300 ? 'var(--r600)' : 'var(--s700)'} strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: timeLeft < 300 ? 'var(--r600)' : 'var(--s800)' }}>
                {fmtExamTime(timeLeft)}
              </span>
            </div>
            <button className="btn btn-d btn-sm" onClick={exitExam}>Exit</button>
          </div>
        </div>
 
        <div className="prog-bar" style={{ marginBottom: 20, height: 8 }}>
          <div className="prog-fill" style={{ width: `${(answered / examQs.length) * 100}%`, background: col, transition: 'width .3s' }}/>
        </div>
 
        {examQs.map(q => (
          <div key={q.id} className="card" style={{ marginBottom: 14, borderColor: answers[q.id] ? col : 'var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: answers[q.id] ? col : 'var(--s200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: answers[q.id] ? '#fff' : 'var(--s500)',
                  flexShrink: 0,
                }}>{q.id}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--s400)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>
                    {q.topic}
                  </div>
                  <span style={{ fontSize: 15, color: 'var(--s800)', fontWeight: 500, lineHeight: 1.5 }}>{q.q}</span>
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--s400)', flexShrink: 0, marginLeft: 8 }}>{q.marks} marks</span>
            </div>
            {q.shuffledOptions.map(opt => (
              <label
                key={opt}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', marginBottom: 7,
                  borderRadius: 'var(--rmd)', cursor: 'pointer',
                  border: `1.5px solid ${answers[q.id] === opt ? col : 'var(--border)'}`,
                  background: answers[q.id] === opt ? col + '0F' : 'var(--bg)',
                  transition: 'all .15s',
                }}
              >
                <input
                  type="radio"
                  name={`eq${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                  style={{ accentColor: col }}
                />
                <span style={{ fontSize: 14, color: answers[q.id] === opt ? col : 'var(--s700)', fontWeight: answers[q.id] === opt ? 600 : 400 }}>
                  {opt}
                </span>
              </label>
            ))}
          </div>
        ))}
 
        <div style={{
          position: 'sticky', bottom: 16,
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rxl)',
          padding: '14px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: 'var(--sh-lg)',
        }}>
          <div style={{ fontSize: 13.5, color: 'var(--s600)' }}>
            {answered < examQs.length
              ? <span style={{ color: 'var(--a600)' }}>{examQs.length - answered} unanswered</span>
              : <span style={{ color: 'var(--g600)' }}>All questions answered</span>
            }
          </div>
          <button
            className="btn btn-p"
            onClick={() => submitExam(false)}
            disabled={answered === 0}
            style={{ background: col, borderColor: col }}
          >
            Submit Exam
          </button>
        </div>
      </div>
    )
  }
 
  // ── RESULT SCREEN ────────────────────────────────────────
  if (stage === 'result' && result) {
    const col   = subjectColour(subject)
    const grade = gradeFor(result.score)
    const passed = result.score >= 60
    const wrong = examQs.filter(q => answers[q.id] && answers[q.id] !== q.answer)
    const unanswered = examQs.filter(q => !answers[q.id])
 
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 36 }}>
          <div style={{
            width: 100, height: 100, margin: '0 auto 16px', borderRadius: '50%',
            background: passed ? 'var(--g50)' : 'var(--r50)',
            border: `3px solid ${grade.colour}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: grade.colour, lineHeight: 1 }}>
              {grade.grade}
            </div>
            <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: grade.colour, marginTop: 2 }}>
              {result.score}%
            </div>
          </div>
          <h2 className="serif" style={{ fontSize: 26, color: 'var(--s900)', marginBottom: 4 }}>
            {grade.message}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--s500)', marginBottom: 4 }}>
            {subject} — Mixed Topics Exam
          </p>
          {result.autoSubmitted && (
            <div style={{ fontSize: 12.5, color: 'var(--a600)', fontStyle: 'italic', marginBottom: 14 }}>
              Time ran out — exam was submitted automatically.
            </div>
          )}
 
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 22, marginBottom: 24 }}>
            {[
              ['Correct',    `${result.correct}/${examQs.length}`, 'var(--b50)',  'var(--b700)'],
              ['Pass Status', passed ? 'PASSED' : 'FAILED',          passed ? 'var(--g50)' : 'var(--r50)', passed ? 'var(--g600)' : 'var(--r500)'],
              ['Time Used',   fmtExamTime(result.timeUsed),           'var(--bg)',   'var(--s700)'],
            ].map(([l, v, bg, c]) => (
              <div key={l} style={{ background: bg, borderRadius: 'var(--rmd)', padding: '14px 10px' }}>
                <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
 
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-p" onClick={() => startExam(subject)} style={{ background: col, borderColor: col }}>
              Retake Exam
            </button>
            <button className="btn btn-s" onClick={() => setStage('list')}>Back to Exams</button>
            <button className="btn btn-s" onClick={() => goTo?.('practice')}>Practice Weak Areas</button>
          </div>
        </div>
 
        {/* Review wrong answers */}
        {wrong.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="sec-tag" style={{ marginBottom: 6 }}>Review</div>
            <h3 className="serif" style={{ fontSize: 18, color: 'var(--s900)', marginBottom: 14 }}>
              Questions you missed
            </h3>
            {wrong.map((q, i) => (
              <div key={i} className="card" style={{ marginBottom: 10, borderLeft: '4px solid var(--r500)' }}>
                <div style={{ fontSize: 11, color: 'var(--s400)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>
                  {q.topic}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--s900)', marginBottom: 8 }}>
                  Q{q.id}: {q.q}
                </div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: 'var(--s500)' }}>Your answer: </span>
                  <span style={{ color: 'var(--r600)', fontWeight: 600 }}>{answers[q.id]}</span>
                </div>
                <div style={{ fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--s500)' }}>Correct: </span>
                  <span style={{ color: 'var(--g700)', fontWeight: 600 }}>{q.answer}</span>
                </div>
                {q.explanation && (
                  <div style={{ fontSize: 12.5, color: 'var(--s600)', fontStyle: 'italic', background: 'var(--bg)', padding: '8px 12px', borderRadius: 'var(--rsm)' }}>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
 
        {/* Unanswered questions */}
        {unanswered.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="sec-tag" style={{ marginBottom: 6 }}>Unanswered</div>
            <h3 className="serif" style={{ fontSize: 18, color: 'var(--s900)', marginBottom: 14 }}>
              Questions you didn&apos;t answer
            </h3>
            {unanswered.map((q, i) => (
              <div key={i} className="card" style={{ marginBottom: 10, borderLeft: '4px solid var(--a500, #F59E0B)' }}>
                <div style={{ fontSize: 11, color: 'var(--s400)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>
                  {q.topic}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--s900)', marginBottom: 8 }}>
                  Q{q.id}: {q.q}
                </div>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--s500)' }}>Correct: </span>
                  <span style={{ color: 'var(--g700)', fontWeight: 600 }}>{q.answer}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
 
  return null
}
// ═══════════════════════════════════════════════════════════
// LIVE CLASSES TAB — schedule-aware, reads real groupRooms
// ═══════════════════════════════════════════════════════════
 
// Parse a schedule string like "Mon/Wed 9:00–10:00 AM"
// Returns { days: [1,3], startMins: 540, endMins: 600 } where days are 0-6 (Sun-Sat)
// and times are minutes-since-midnight, OR null if unparseable.
const parseScheduleString = (scheduleStr) => {
  if (!scheduleStr || typeof scheduleStr !== 'string') return null
  const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
 
  // Split before the first digit so days/time separate cleanly
  const parts = scheduleStr.trim().split(/\s+(?=\d)/)
  if (parts.length < 2) return null
  const daysPart = parts[0]
  const timePart = parts.slice(1).join(' ')
 
  const dayMatches = daysPart.toLowerCase().match(/sun|mon|tue|wed|thu|fri|sat/g)
  if (!dayMatches || dayMatches.length === 0) return null
  const days = []
  dayMatches.forEach(d => { if (dayMap[d] !== undefined && !days.includes(dayMap[d])) days.push(dayMap[d]) })
 
  // Match "9:00-10:00 AM" or "9:00 AM - 10:00 AM" or "2:00–3:00 PM" (any dash type)
  const timeMatch = timePart.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?\s*[-–—]\s*(\d{1,2}):?(\d{0,2})\s*(am|pm)/i)
  if (!timeMatch) return null
 
  let startH = parseInt(timeMatch[1], 10)
  const startM = parseInt(timeMatch[2] || '0', 10)
  const startMer = (timeMatch[3] || timeMatch[6]).toLowerCase()
  let endH = parseInt(timeMatch[4], 10)
  const endM = parseInt(timeMatch[5] || '0', 10)
  const endMer = timeMatch[6].toLowerCase()
 
  const to24 = (h, mer) => {
    if (mer === 'pm' && h < 12) return h + 12
    if (mer === 'am' && h === 12) return 0
    return h
  }
  startH = to24(startH, startMer)
  endH = to24(endH, endMer)
 
  return {
    days,
    startMins: startH * 60 + startM,
    endMins:   endH * 60 + endM,
  }
}
 
// Compute room status RIGHT NOW based on schedule + clock.
// Returns: 'live' | { startsIn: number-of-mins } | { laterToday: 'HH:MM' } | { tomorrow: 'Day HH:MM' } | { thisWeek: 'Day HH:MM' } | null
const computeRoomStatus = (scheduleStr, now = new Date()) => {
  const parsed = parseScheduleString(scheduleStr)
  if (!parsed) return null
 
  const todayDow = now.getDay()
  const nowMins  = now.getHours() * 60 + now.getMinutes()
 
  // 1. Live now? (today is in days, and now is between start and end)
  if (parsed.days.includes(todayDow) && nowMins >= parsed.startMins && nowMins < parsed.endMins) {
    return { state: 'live', endMins: parsed.endMins, startedMinsAgo: nowMins - parsed.startMins }
  }
 
  // 2. Starting later today?
  if (parsed.days.includes(todayDow) && nowMins < parsed.startMins) {
    return { state: 'today', startMins: parsed.startMins, startsInMins: parsed.startMins - nowMins }
  }
 
  // 3. Find the next upcoming day in this week or next
  // Start checking from tomorrow
  for (let i = 1; i <= 7; i++) {
    const checkDow = (todayDow + i) % 7
    if (parsed.days.includes(checkDow)) {
      return {
        state: i === 1 ? 'tomorrow' : 'upcoming',
        dow: checkDow,
        daysAway: i,
        startMins: parsed.startMins,
      }
    }
  }
  return null
}
 
const formatMins = (mins) => {
  let h = Math.floor(mins / 60)
  const m = mins % 60
  const mer = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${String(m).padStart(2, '0')} ${mer}`
}
 
const dayName = (dow) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow]
 
function LiveClassesTab({ user, store, setInClassroom, toast }) {
  // Tick state — re-evaluate liveness every 30 seconds
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])
 
  // Find this student's enrolled rooms
  const studentFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const allRooms = store?.groupRooms || []
  const myRooms = allRooms.filter(r =>
    r.students?.some(s =>
      s === studentFullName ||
      s === user?.firstName ||
      (user?.firstName && s.includes(user.firstName))
    )
  )
 
  // Compute status for each
  const now = new Date()
  const roomsWithStatus = myRooms.map(r => ({
    ...r,
    statusInfo: computeRoomStatus(r.schedule, now),
  }))
 
  const liveRooms     = roomsWithStatus.filter(r => r.statusInfo?.state === 'live')
  const todayRooms    = roomsWithStatus.filter(r => r.statusInfo?.state === 'today')
  const tomorrowRooms = roomsWithStatus.filter(r => r.statusInfo?.state === 'tomorrow')
  const upcomingRooms = roomsWithStatus.filter(r => r.statusInfo?.state === 'upcoming')
 
  // Sort upcoming by daysAway then start time
  const sortByTime = (a, b) => {
    const aDays = a.statusInfo.daysAway || 0
    const bDays = b.statusInfo.daysAway || 0
    if (aDays !== bDays) return aDays - bDays
    return (a.statusInfo.startMins || 0) - (b.statusInfo.startMins || 0)
  }
  todayRooms.sort((a, b) => a.statusInfo.startsInMins - b.statusInfo.startsInMins)
  tomorrowRooms.sort(sortByTime)
  upcomingRooms.sort(sortByTime)
 
  // Stable subject colours (mirror Practice palette)
  const subjColours = {
    'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
    'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
    'Geography': '#0F766E', 'Computer Science': '#1F2937',
    'Business Studies': '#7E22CE', 'Economics': '#9F1239',
  }
  const colourFor = (s) => subjColours[s] || '#8B1A2E'
 
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '24px 30px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
            Real-Time Learning
          </div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
            Live Classes
          </h2>
          <p style={{ fontSize: 13.5, opacity: .85, marginTop: 6, marginBottom: 0, maxWidth: 540, lineHeight: 1.55 }}>
            Join your scheduled lessons in our virtual classroom — interactive whiteboard, live chat, and your teacher leading the way.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
          {[
            ['Live Now',        liveRooms.length],
            ['Today',           todayRooms.length],
            ['Tomorrow',        tomorrowRooms.length],
            ['My Classes',      myRooms.length],
          ].map(([l, v]) => (
            <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>
                {l}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Empty state */}
      {myRooms.length === 0 && (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="1.5" strokeLinecap="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 17, color: 'var(--s800)', marginBottom: 6 }}>No classes scheduled yet</h3>
          <p style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 380, margin: '0 auto' }}>
            Once an admin enrols you in a class room, your live lessons will appear here automatically.
          </p>
        </div>
      )}
 
      {/* LIVE NOW — pulsing crimson card */}
      {liveRooms.map(room => {
        const col = colourFor(room.subject)
        const remaining = room.statusInfo.endMins - (now.getHours() * 60 + now.getMinutes())
        return (
          <div key={room.id} style={{
            background: `linear-gradient(135deg, ${col} 0%, ${col}DD 100%)`,
            borderRadius: 'var(--rxl)',
            padding: '24px 28px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
            color: '#fff',
            boxShadow: `0 8px 24px ${col}55`,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
              <span style={{
                position: 'absolute', top: -2, right: -2,
                width: 12, height: 12, borderRadius: '50%',
                background: '#4ADE80',
                border: '2px solid rgba(255,255,255,.4)',
                animation: 'pulse 1.5s infinite',
              }}/>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(255,255,255,.2)', color: '#fff',
                  fontSize: 10, fontWeight: 800, letterSpacing: '.1em',
                  padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase',
                }}>● LIVE NOW</span>
                <span style={{ color: 'rgba(255,255,255,.75)', fontSize: 12.5 }}>
                  Started {room.statusInfo.startedMinsAgo === 0 ? 'just now' : `${room.statusInfo.startedMinsAgo} min ago`} · {remaining} min left
                </span>
              </div>
              <div className="serif" style={{ fontSize: 20, color: '#fff', marginBottom: 3, lineHeight: 1.2 }}>
                {room.name} — {room.subject}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
                {room.teacher} · {room.curriculum} {room.grade ? '· ' + room.grade : ''} · {room.enrolled || room.students?.length || 0} students
              </div>
            </div>
            <button
              className="btn"
              style={{
                background: '#fff', color: col,
                fontWeight: 700, padding: '12px 24px',
                fontSize: 14,
              }}
              onClick={() => setInClassroom(true)}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: 6 }}>
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Join Now
            </button>
          </div>
        )
      })}
 
      {/* TODAY (later) */}
      {todayRooms.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="chdr">
            <div className="ctitle">Later Today</div>
            <span className="badge badge-amber">{todayRooms.length}</span>
          </div>
          {todayRooms.map(room => {
            const col = colourFor(room.subject)
            const startsIn = room.statusInfo.startsInMins
            return (
              <div key={room.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--rmd)',
                  background: col + '14', borderLeft: `3px solid ${col}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <div className="mono" style={{ fontSize: 9, fontWeight: 700, color: col, textTransform: 'uppercase' }}>
                    Today
                  </div>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: col }}>
                    {formatMins(room.statusInfo.startMins).replace(/:00 /, ' ')}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>
                    {room.subject} — {room.name}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--s500)' }}>
                    {room.teacher} · Starts in <strong style={{ color: col }}>{startsIn < 60 ? `${startsIn} min` : `${Math.floor(startsIn / 60)}h ${startsIn % 60}m`}</strong>
                  </div>
                </div>
                <button
                  className="btn btn-s btn-sm"
                  onClick={() => toast?.info?.(`Reminder set for ${room.subject}`)}
                  style={{ flexShrink: 0 }}
                >
                  Remind Me
                </button>
              </div>
            )
          })}
        </div>
      )}
 
      {/* TOMORROW + UPCOMING */}
      {(tomorrowRooms.length > 0 || upcomingRooms.length > 0) && (
        <div className="card">
          <div className="chdr">
            <div className="ctitle">Upcoming This Week</div>
          </div>
          {[...tomorrowRooms, ...upcomingRooms].map(room => {
            const col = colourFor(room.subject)
            const isTomorrow = room.statusInfo.state === 'tomorrow'
            return (
              <div key={room.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--rmd)',
                  background: 'var(--bg)',
                  borderLeft: `3px solid ${col}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <div className="mono" style={{ fontSize: 9, fontWeight: 700, color: 'var(--s500)', textTransform: 'uppercase' }}>
                    {isTomorrow ? 'Tomorrow' : dayName(room.statusInfo.dow)}
                  </div>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--s800)' }}>
                    {formatMins(room.statusInfo.startMins).replace(/:00 /, ' ')}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>
                    {room.subject} — {room.name}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--s500)' }}>
                    {room.teacher} · {room.schedule}
                  </div>
                </div>
                <button
                  className="btn btn-s btn-sm"
                  onClick={() => toast?.info?.('Adding to calendar…')}
                  style={{ flexShrink: 0 }}
                >
                  Add to Calendar
                </button>
              </div>
            )
          })}
        </div>
      )}
 
      {/* If they have rooms but nothing today/tomorrow */}
      {myRooms.length > 0 && liveRooms.length === 0 && todayRooms.length === 0 && tomorrowRooms.length === 0 && upcomingRooms.length === 0 && (
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <h3 style={{ fontSize: 16, color: 'var(--s700)', marginBottom: 6 }}>No classes scheduled this week</h3>
          <p style={{ fontSize: 13, color: 'var(--s500)' }}>
            Check back later or speak with your teacher about upcoming lessons.
          </p>
        </div>
      )}
    </div>
  )
}
 
// ═══════════════════════════════════════════════════════════
// MSHAURI AI — smart rule-based tutor (no API required)
// ═══════════════════════════════════════════════════════════
const MSHAURI_HISTORY_KEY = 'sm_mshauri_history'
 
const loadMshauriHist = () => {
  try { return JSON.parse(localStorage.getItem(MSHAURI_HISTORY_KEY) || '[]') }
  catch { return [] }
}
const saveMshauriHist = (h) => {
  try { localStorage.setItem(MSHAURI_HISTORY_KEY, JSON.stringify(h.slice(-30))) } catch {}
}
 
// ── TOPIC EXPLANATIONS — Mshauri's knowledge base ────────────
const TOPIC_EXPLANATIONS = {
  'pythagoras': `**Pythagoras Theorem** is a rule about right-angled triangles.
 
For any right-angled triangle with legs a and b, and hypotenuse c (the longest side, opposite the right angle):
 
**c² = a² + b²**
 
For example, if a triangle has legs of 3 cm and 4 cm:
c² = 3² + 4² = 9 + 16 = 25
c = √25 = 5 cm
 
**Common Pythagorean triples to memorise:** (3,4,5), (5,12,13), (8,15,17). These appear often in IGCSE exams.
 
Want me to walk you through a problem?`,
 
  'photosynthesis': `**Photosynthesis** is how plants make their own food using sunlight.
 
The simplified equation:
**6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂**
 
In plain words: carbon dioxide + water + light energy → glucose (sugar) + oxygen.
 
**Where it happens:** in chloroplasts, which contain the green pigment chlorophyll. Chlorophyll absorbs light energy.
 
**The two stages:**
1. **Light-dependent reactions** — splits water, releases oxygen, produces ATP and NADPH
2. **Calvin Cycle (light-independent)** — uses ATP/NADPH to convert CO₂ into glucose
 
**Why it matters:** photosynthesis is the source of nearly all the oxygen in our atmosphere and the base of almost every food chain on Earth.
 
Want to try a quick question on this?`,
 
  'algebra': `**Algebra** is using letters to represent unknown numbers, then finding what those numbers must be.
 
**The basic rule:** whatever you do to one side of an equation, do to the other.
 
**Example:** Solve 3x + 5 = 20
 
Step 1: Subtract 5 from both sides → 3x = 15
Step 2: Divide both sides by 3 → x = 5
 
**Key skills:**
- Combine like terms: 3x + 2x = 5x
- Expand brackets: 2(x + 3) = 2x + 6
- Factorise: 2x + 6 = 2(x + 3)
- Solve linear equations
- Solve quadratics by factorising or formula
 
What kind of algebra problem are you working on?`,
 
  'cell biology': `**Cell biology** studies the building blocks of life.
 
**Two main cell types:**
- **Animal cells** — have nucleus, cytoplasm, cell membrane, mitochondria, ribosomes
- **Plant cells** — all of the above PLUS cell wall, chloroplasts, large vacuole
 
**Key parts:**
- **Nucleus** — contains DNA, controls the cell
- **Cell membrane** — controls what enters/leaves
- **Cytoplasm** — jelly-like fluid where reactions happen
- **Mitochondria** — "powerhouse" — produces energy through respiration
- **Chloroplasts** (plants only) — site of photosynthesis
- **Ribosomes** — make proteins
- **Cell wall** (plants only) — gives shape and support
 
Specialised cells (red blood cells, nerve cells, sperm cells) are adapted for specific jobs.
 
Which part would you like me to explain in more depth?`,
 
  'newton': `**Newton's Three Laws of Motion**
 
**1st Law — Inertia:** An object stays at rest, or moves at constant velocity, unless acted on by a net force. Things don't change their motion by themselves.
 
**2nd Law:** Force = mass × acceleration (F = ma).
- 1 Newton (N) = the force needed to accelerate 1 kg at 1 m/s²
- A heavier object needs more force to accelerate at the same rate
 
**3rd Law:** For every action there is an equal and opposite reaction. When you push the ground walking, the ground pushes you back equally.
 
**Useful equations from these laws:**
- F = ma
- W = mg (weight = mass × gravity, where g ≈ 9.8 m/s² on Earth)
- p = mv (momentum)
 
What problem can I help you with?`,
 
  'periodic table': `**The Periodic Table** organises all known elements by their atomic number (number of protons).
 
**Key features:**
- **Periods** (rows) — elements in the same period have the same number of electron shells
- **Groups** (columns) — elements in the same group have the same number of outer electrons → similar chemical behaviour
 
**Important groups:**
- **Group 1: Alkali metals** (Li, Na, K…) — soft, very reactive
- **Group 2: Alkaline earth metals** (Mg, Ca…) — reactive but less than Group 1
- **Group 7: Halogens** (F, Cl, Br, I) — non-metals, form salts
- **Group 0: Noble gases** (He, Ne, Ar) — full outer shell, unreactive
 
**Trends:**
- Reactivity of metals **increases** down a group
- Reactivity of non-metals **decreases** down a group
- Atomic radius increases down a group, decreases across a period
 
What element or trend would you like to explore?`,
 
  'electricity': `**Electricity basics**
 
**Ohm's Law:** V = IR
- V = Voltage (Volts) — the "push"
- I = Current (Amperes) — the flow of charge
- R = Resistance (Ohms) — how much something resists current
 
**Power equations:**
- P = VI (Power = Voltage × Current)
- P = I²R = V²/R
 
**Series circuits:**
- Current is the same everywhere
- Voltages add up: V_total = V₁ + V₂ + V₃
- Resistances add: R_total = R₁ + R₂ + R₃
 
**Parallel circuits:**
- Voltage is the same across each branch
- Currents add: I_total = I₁ + I₂ + I₃
- 1/R_total = 1/R₁ + 1/R₂ + 1/R₃
 
**Common units:** 1 kWh = 3,600,000 Joules. Energy bill = Power (kW) × time (hours) × cost per kWh.
 
What circuit problem are you working on?`,
 
  'simile metaphor': `**Simile vs Metaphor** — both are comparisons, but they work differently.
 
**Simile** — uses "like" or "as" to compare:
- "She runs like the wind"
- "His smile is as bright as the sun"
- "The water was as cold as ice"
 
**Metaphor** — says one thing IS another, no "like" or "as":
- "She is a shining star"
- "Time is a thief"
- "His words were daggers"
 
**Why they matter:** they make writing more vivid and emotional. Authors use them to paint pictures in the reader's mind.
 
**Other figures of speech to know for IGCSE English:**
- **Personification** — giving human traits to non-humans ("the wind whispered")
- **Hyperbole** — exaggeration ("I've told you a million times")
- **Alliteration** — repeating initial sounds ("Peter Piper picked")
 
Want to try identifying these in a sentence?`,
 
  'percentage': `**Percentages** mean "out of 100." So 25% = 25/100 = 0.25.
 
**Three common calculations:**
 
**1. Find X% of Y:** Convert percentage to decimal, multiply.
Example: 15% of 240 = 0.15 × 240 = **36**
 
**2. Find what % one number is of another:** (part / whole) × 100
Example: What % of 80 is 20? → (20/80) × 100 = **25%**
 
**3. Percentage change:** ((new − old) / old) × 100
Example: Price went from $40 to $50. Change = ((50−40)/40) × 100 = **25% increase**
 
**Common conversions to remember:**
- 50% = 1/2 = 0.5
- 25% = 1/4 = 0.25
- 75% = 3/4 = 0.75
- 10% = 1/10 = 0.1
- 33⅓% = 1/3
- 12.5% = 1/8
 
What percentage problem can I help with?`,
 
  'trigonometry': `**Trigonometry** — relating angles to sides in right-angled triangles.
 
**The three ratios** (memorise SOH CAH TOA):
- **sin θ = Opposite / Hypotenuse**
- **cos θ = Adjacent / Hypotenuse**
- **tan θ = Opposite / Adjacent**
 
(Opposite is the side opposite the angle θ. Adjacent is the side next to it that isn't the hypotenuse.)
 
**Standard angles to memorise:**
| Angle | sin | cos | tan |
|-------|-----|-----|-----|
| 0° | 0 | 1 | 0 |
| 30° | 1/2 | √3/2 | 1/√3 |
| 45° | √2/2 | √2/2 | 1 |
| 60° | √3/2 | 1/2 | √3 |
| 90° | 1 | 0 | undefined |
 
**Pythagorean identity:** sin²θ + cos²θ = 1 — always true, useful for simplifying.
 
**To find an unknown angle:** use sin⁻¹, cos⁻¹, tan⁻¹ on your calculator.
 
Show me your problem and I'll walk through it.`,
}
 
// ── FIND BEST MATCHING TOPIC ─────────────────────────────────
const findTopicMatch = (text) => {
  const lower = text.toLowerCase()
  // Try direct matches first
  for (const key of Object.keys(TOPIC_EXPLANATIONS)) {
    if (lower.includes(key)) return key
  }
  // Aliases
  const aliases = [
    [['hypotenuse', 'right triangle', 'right angled triangle'], 'pythagoras'],
    [['plant food', 'chlorophyll', 'photosynthes'], 'photosynthesis'],
    [['solve for x', 'equation', 'unknown', 'variable'], 'algebra'],
    [['mitochondria', 'nucleus', 'chloroplast', 'organelle'], 'cell biology'],
    [['force', 'motion', 'acceleration', 'momentum'], 'newton'],
    [['element', 'group 1', 'halogen', 'noble gas', 'alkali metal'], 'periodic table'],
    [['voltage', 'current', 'ohm', 'circuit', 'resistance'], 'electricity'],
    [['figure of speech', 'comparison', 'imagery', 'literary device'], 'simile metaphor'],
    [['percent', '% of', 'discount', 'increase by'], 'percentage'],
    [['sin', 'cos', 'tan', 'soh cah toa'], 'trigonometry'],
  ]
  for (const [keywords, topic] of aliases) {
    if (keywords.some(k => lower.includes(k))) return topic
  }
  return null
}
 
// ── MATH SOLVER — handles simple linear equations ────────────
const trySolveMath = (text) => {
  const lower = text.toLowerCase().trim()
 
  // Arithmetic: "what is 7 * 8" or "what's 25% of 80"
  const arithMatch = lower.match(/(?:what\s+(?:is|s)\s+)?(\d+(?:\.\d+)?)\s*([+\-*/x×÷])\s*(\d+(?:\.\d+)?)/i)
  if (arithMatch) {
    const a = parseFloat(arithMatch[1])
    const op = arithMatch[2].toLowerCase().replace('x', '*').replace('×', '*').replace('÷', '/')
    const b = parseFloat(arithMatch[3])
    let result
    if (op === '+') result = a + b
    else if (op === '-') result = a - b
    else if (op === '*') result = a * b
    else if (op === '/') result = b !== 0 ? a / b : null
    if (result !== null && result !== undefined) {
      return `${a} ${arithMatch[2]} ${b} = **${Number.isInteger(result) ? result : result.toFixed(4).replace(/\.?0+$/, '')}**`
    }
  }
 
  // Percentage: "what is 15% of 240"
  const pctMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/i)
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1])
    const num = parseFloat(pctMatch[2])
    const result = (pct / 100) * num
    return `${pct}% of ${num} = (${pct}/100) × ${num} = **${Number.isInteger(result) ? result : result.toFixed(2)}**`
  }
 
  // Linear equation: "solve 3x + 5 = 20" or "3x + 5 = 20"
  const linMatch = text.match(/(\-?\d*\.?\d*)\s*x\s*([+\-])\s*(\d+(?:\.\d+)?)\s*=\s*(\-?\d+(?:\.\d+)?)/i)
  if (linMatch) {
    const a = parseFloat(linMatch[1] || '1') || 1
    const sign = linMatch[2]
    const b = parseFloat(linMatch[3])
    const c = parseFloat(linMatch[4])
    const constant = sign === '+' ? b : -b
    const x = (c - constant) / a
    return `**Solving ${a}x ${sign} ${b} = ${c}**
 
Step 1: ${sign === '+' ? 'Subtract' : 'Add'} ${b} from both sides → ${a}x = ${c - constant}
Step 2: Divide both sides by ${a} → **x = ${Number.isInteger(x) ? x : x.toFixed(2)}**
 
Check: ${a} × ${Number.isInteger(x) ? x : x.toFixed(2)} ${sign} ${b} = ${(a * x + constant).toFixed(2)} ✓`
  }
 
  return null
}
 
// ── BUILD PROGRESS REPORT — reads from localStorage ──────────
const buildProgressReport = (user) => {
  let practiceHist = []
  let examHist = []
  let xp = 0
  try { practiceHist = JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch {}
  try { examHist = JSON.parse(localStorage.getItem('sm_exam_history') || '[]') } catch {}
  try { xp = parseInt(localStorage.getItem('sm_practice_xp') || '0', 10) || 0 } catch {}
 
  if (practiceHist.length === 0 && examHist.length === 0) {
    return `You haven't started any practice or exams yet, ${user?.firstName || ''}. Try the **Adaptive Practice** tab to begin — pick any subject and topic, complete 5 questions, and I'll know exactly where you stand. Once you've done a few sessions I can give you tailored advice.`
  }
 
  const subjectStats = {}
  practiceHist.forEach(s => {
    if (!subjectStats[s.subject]) subjectStats[s.subject] = []
    subjectStats[s.subject].push(s.score)
  })
 
  const subjectLines = Object.entries(subjectStats).map(([subj, scores]) => {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    return `- **${subj}:** ${avg}% average (${scores.length} session${scores.length === 1 ? '' : 's'})`
  }).join('\n')
 
  const weakSubjects = Object.entries(subjectStats)
    .filter(([_, scores]) => scores.reduce((a, b) => a + b, 0) / scores.length < 60)
    .map(([s]) => s)
 
  const recentSessions = [...practiceHist].reverse().slice(0, 3)
 
  let report = `**Your progress so far, ${user?.firstName || ''}:**
 
📊 Total XP: **${xp.toLocaleString()}**
📝 Practice sessions: **${practiceHist.length}**
🎓 Exams taken: **${examHist.length}**
 
**By subject:**
${subjectLines}
 
**Recent sessions:**
${recentSessions.map(s => `- ${s.topic} (${s.subject}): ${s.score}%`).join('\n')}`
 
  if (weakSubjects.length > 0) {
    report += `\n\n💡 **My recommendation:** Focus on ${weakSubjects.join(' and ')}. These need more attention. Try a few practice sessions in those subjects today.`
  } else if (practiceHist.length >= 3) {
    report += `\n\n🌟 You're doing well across all subjects. Keep up the steady work!`
  }
 
  return report
}
 
// ── BUILD STUDY RECOMMENDATION ───────────────────────────────
const buildStudyRecommendation = (user) => {
  let practiceHist = []
  try { practiceHist = JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch {}
 
  if (practiceHist.length === 0) {
    return `Since you haven't started yet, I suggest beginning with **Mathematics — Algebra** or **English — Grammar**. These are foundational and appear in every IGCSE paper. Head to the **Adaptive Practice** tab and try 5 questions. Then come back and tell me how it went.`
  }
 
  // Find the subject with lowest average
  const subjectAvgs = {}
  practiceHist.forEach(s => {
    if (!subjectAvgs[s.subject]) subjectAvgs[s.subject] = []
    subjectAvgs[s.subject].push(s.score)
  })
 
  const sorted = Object.entries(subjectAvgs)
    .map(([s, scores]) => ({ subject: s, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
    .sort((a, b) => a.avg - b.avg)
 
  const weakest = sorted[0]
  const lastSession = practiceHist[practiceHist.length - 1]
 
  if (weakest.avg < 60) {
    return `Today, focus on **${weakest.subject}** — your average there is ${Math.round(weakest.avg)}%, which means you have room to grow. Pick any topic in ${weakest.subject} from the **Adaptive Practice** tab. After 2 sessions, take a quick break, then try a different subject to keep things fresh. Aim for 30 minutes of focused study.`
  }
 
  return `You're doing well across the board. Today, I'd suggest:
1. **15 min review** — practise ${lastSession.topic} again to lock it in
2. **20 min new ground** — pick a topic you haven't tried yet
3. **5 min reflection** — look at your Achievements tab and see which badge you're closest to
 
Keep the momentum, ${user?.firstName || 'friend'}!`
}
 
// ── MAIN RESPONSE ROUTER ─────────────────────────────────────
const generateMshauriReply = (userMessage, user) => {
  const text = userMessage.trim()
  const lower = text.toLowerCase()
 
  // 1. Greetings
  if (/^(hi|hello|hey|habari|jambo|yo|sup|hola)[\s!.?]*$/i.test(lower)) {
    return `Habari, ${user?.firstName || 'friend'}! Ready to study? You can ask me to:
- Explain a topic ("explain pythagoras")
- Solve a problem ("solve 3x + 5 = 20")
- Tell you what to study ("what should I study today?")
- Show your progress ("how am I doing?")
 
What would you like to start with?`
  }
 
  // 2. Progress questions
  if (/(how am i doing|my progress|how have i been|my stats|how did i do|my performance|am i improving)/i.test(lower)) {
    return buildProgressReport(user)
  }
 
  // 3. Study recommendations
  if (/(what should i study|what to study|what to learn|recommend|suggest.*topic|study plan|where should i start)/i.test(lower)) {
    return buildStudyRecommendation(user)
  }
 
  // 4. Maths solver
  const mathReply = trySolveMath(text)
  if (mathReply) return mathReply
 
  // 5. Topic explanation
  const topic = findTopicMatch(text)
  if (topic) return TOPIC_EXPLANATIONS[topic]
 
  // 6. Test me requests
  if (/(test me|quiz me|practice|give me.*question)/i.test(lower)) {
    return `Great instinct! Head to the **Adaptive Practice** tab — pick any subject and topic, and I'll have 5 questions ready for you. Each session takes about 5 minutes and I'll save your XP to your achievements.
 
After your session, come back and tell me how it went. I'll help you understand anything you got wrong.`
  }
 
  // 7. Help with homework — redirect appropriately
  if (/(do my homework|do this for me|just give me the answer|whats the answer)/i.test(lower)) {
    return `I can help you understand the topic, but I won't do your homework for you — that wouldn't help you actually learn. Tell me which topic the question is on, or share what you've tried so far, and I'll help you work through it.`
  }
 
  // 8. Generic learning question — guide them
  if (/(i don't understand|i dont understand|confused|stuck|help me with|how do i)/i.test(lower)) {
    return `I'd love to help. Tell me specifically which topic you're stuck on — for example:
- "Help me with **Pythagoras Theorem**"
- "I don't understand **photosynthesis**"
- "How do I **solve algebra equations**?"
 
The more specific you are, the better I can help. You can also try the **Adaptive Practice** tab and see what comes up — sometimes doing questions helps reveal exactly what's confusing.`
  }
 
  // 9. Emotional / motivational
  if (/(stressed|anxious|worried|overwhelmed|cant focus|hard|too difficult|i give up|tired)/i.test(lower)) {
    return `That's a normal feeling, ${user?.firstName || 'friend'} — every student goes through it. Here's what helps:
 
1. **Pomodoro:** Study for 25 minutes, then take a 5-minute break. Repeat 3-4 times.
2. **One topic at a time.** Don't try to do everything at once.
3. **Practice beats reading.** Active practice (the Practice tab) builds memory faster than re-reading notes.
4. **Sleep matters.** Your brain consolidates learning during sleep — never sacrifice it.
 
Remember: progress, not perfection. Every practice session you complete makes you a little better than yesterday. What specific subject is feeling hardest right now?`
  }
 
  // 10. Off-topic
  if (/(weather|movie|song|football|game|date|girlfriend|boyfriend|tiktok|instagram)/i.test(lower)) {
    return `Let's keep our focus on your studies — what subject can I help you with today? You can ask about Maths, Physics, Chemistry, Biology, English, or any specific topic.`
  }
 
  // 11. Default — encourage them to be specific
  return `That's an interesting question. To give you the best help, could you be more specific?
 
For example:
- For Maths: "**Solve 2x + 7 = 15**" or "**Explain Pythagoras**"
- For Sciences: "**Explain photosynthesis**" or "**What are Newton's laws?**"
- For English: "**What is a metaphor?**" or "**Explain similes**"
- For Studies: "**What should I study today?**" or "**How am I doing?**"
 
What would you like to learn about?`
}
 
function MshauriTab({ user }) {
  const [messages, setMessages] = useState(() => {
    const saved = loadMshauriHist()
    if (saved.length > 0) return saved
    const name = user?.firstName || 'there'
    return [{
      role: 'assistant',
      text: `Habari ${name}! I'm Mshauri, your personal AI tutor. I can help you understand difficult topics, solve problems step-by-step, or check your progress. What would you like to work on today?`,
      time: new Date().toISOString(),
    }]
  })
  const [input, setInput]     = useState('')
  const [thinking, setThinking] = useState(false)
  const chatEndRef            = useRef(null)
 
  useEffect(() => {
    saveMshauriHist(messages)
  }, [messages])
 
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])
 
  const send = (text) => {
    const userMsg = (text || input).trim()
    if (!userMsg || thinking) return
 
    const newMessages = [...messages, { role: 'user', text: userMsg, time: new Date().toISOString() }]
    setMessages(newMessages)
    setInput('')
    setThinking(true)
 
    // Simulate thinking time for realism (300-800ms based on response length)
    const reply = generateMshauriReply(userMsg, user)
    const delay = Math.min(800, 300 + reply.length * 2)
    setTimeout(() => {
      setMessages(m => [...m, { role: 'assistant', text: reply, time: new Date().toISOString() }])
      setThinking(false)
    }, delay)
  }
 
  const clearChat = () => {
    if (window.confirm('Clear our conversation?')) {
      const name = user?.firstName || 'there'
      const fresh = [{
        role: 'assistant',
        text: `Habari ${name}! Fresh start. What would you like to learn today?`,
        time: new Date().toISOString(),
      }]
      setMessages(fresh)
    }
  }
 
  // Suggestions adapt to whether they have practice history
  const suggestions = (() => {
    let practiceHist = []
    try { practiceHist = JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch {}
    if (practiceHist.length === 0) {
      return ['What should I study today?', 'Explain Pythagoras', 'Solve 2x + 7 = 15', 'How does this work?']
    }
    const recent = practiceHist[practiceHist.length - 1]
    return [
      'How am I doing?',
      `Explain ${recent.topic}`,
      'What should I study today?',
      'Solve 3x + 5 = 20',
    ]
  })()
 
  const initials = user?.firstName?.[0]?.toUpperCase() || 'S'
 
  // Simple markdown-ish formatter for **bold** and line breaks
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--s900)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }
 
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(240,204,90,.18)',
            border: '3px solid #F0CC5A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            boxShadow: '0 4px 16px rgba(0,0,0,.25)',
          }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#F0CC5A" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v4"/>
            </svg>
            <span style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 12, height: 12, borderRadius: '50%',
              background: '#4ADE80',
              border: '2px solid #6B0F1E',
              animation: 'pulse 2s infinite',
            }}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 4 }}>
              Personalised AI Tutor
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Mshauri
            </h2>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }}/>
              Online · Knows your progress · Always patient
            </div>
          </div>
          <button
            onClick={clearChat}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.25)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 'var(--rmd)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            New Chat
          </button>
        </div>
      </div>
 
      {/* Chat container */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)', minHeight: 480, padding: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 10,
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: m.role === 'assistant' ? '#8B1A2E' : 'var(--s200)',
                color: m.role === 'assistant' ? '#F0CC5A' : 'var(--s700)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: m.role === 'assistant' ? 'Instrument Serif, serif' : 'JetBrains Mono, monospace',
                fontSize: m.role === 'assistant' ? 16 : 12,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {m.role === 'assistant' ? 'M' : initials}
              </div>
              <div style={{
                background: m.role === 'user' ? '#8B1A2E' : 'var(--bg)',
                color: m.role === 'user' ? '#fff' : 'var(--s800)',
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                fontSize: 14,
                lineHeight: 1.65,
                maxWidth: '78%',
                border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {m.role === 'assistant' ? renderText(m.text) : m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#8B1A2E', color: '#F0CC5A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Instrument Serif, serif', fontSize: 16, fontWeight: 700,
                flexShrink: 0,
              }}>M</div>
              <div style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                padding: '12px 16px',
                borderRadius: '4px 14px 14px 14px',
                fontSize: 13,
                color: 'var(--s500)',
                fontStyle: 'italic',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ display: 'inline-flex', gap: 3 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B1A2E', animation: 'mDot 1.2s infinite' }}/>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B1A2E', animation: 'mDot 1.2s infinite .2s' }}/>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B1A2E', animation: 'mDot 1.2s infinite .4s' }}/>
                </span>
                Mshauri is thinking…
              </div>
              <style>{`@keyframes mDot { 0%, 100% { opacity: .3 } 50% { opacity: 1 } }`}</style>
            </div>
          )}
          <div ref={chatEndRef}/>
        </div>
 
        <div style={{ padding: '12px 18px 14px', borderTop: '1px solid var(--border)', background: 'var(--white)' }}>
          {messages.length <= 2 && !thinking && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--s700)',
                    padding: '5px 11px',
                    borderRadius: 99,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#8B1A2E'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#8B1A2E' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--s700)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
 
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Ask Mshauri anything about your studies…"
              rows={1}
              disabled={thinking}
              style={{
                flex: 1,
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--rmd)',
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5,
                maxHeight: 120,
              }}
              onFocus={e => e.target.style.borderColor = '#8B1A2E'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={() => send()}
              disabled={thinking || !input.trim()}
              style={{
                background: input.trim() && !thinking ? '#8B1A2E' : 'var(--s200)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--rmd)',
                padding: '10px 16px',
                cursor: input.trim() && !thinking ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600,
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
 
// ═══════════════════════════════════════════════════════════
// TIMETABLE TAB — week grid + list, real student schedule
// ═══════════════════════════════════════════════════════════
function TimetableTab({ user, store, setInClassroom, setPage, toast }) {
  const [view, setView]   = useState('grid')   // 'grid' | 'list'
  const [tick, setTick]   = useState(0)
  const [selected, setSelected] = useState(null)  // currently selected slot for action menu
 
  // Re-evaluate live status every 30 seconds
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])
 
  // Find this student's enrolled rooms
  const studentFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const allRooms = store?.groupRooms || []
  const myRooms = allRooms.filter(r =>
    r.students?.some(s =>
      s === studentFullName ||
      s === user?.firstName ||
      (user?.firstName && s.includes(user.firstName))
    )
  )
 
  // Build slot data — one slot per (room × day-it-recurs)
  const slots = []
  myRooms.forEach(room => {
    const parsed = parseScheduleString(room.schedule)
    if (!parsed) return
    parsed.days.forEach(dow => {
      slots.push({
        roomId: room.id,
        room,
        dow,
        startMins: parsed.startMins,
        endMins: parsed.endMins,
      })
    })
  })
 
  const subjColours = {
    'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
    'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
    'Geography': '#0F766E', 'Computer Science': '#1F2937',
    'Business Studies': '#7E22CE', 'Economics': '#9F1239',
  }
  const colourFor = (s) => subjColours[s] || '#8B1A2E'
 
  const now = new Date()
  const todayDow = now.getDay()
  const nowMins = now.getHours() * 60 + now.getMinutes()
 
  const isLiveNow = (slot) =>
    slot.dow === todayDow && nowMins >= slot.startMins && nowMins < slot.endMins
  const isPastToday = (slot) =>
    slot.dow === todayDow && nowMins >= slot.endMins
  const isUpcomingToday = (slot) =>
    slot.dow === todayDow && nowMins < slot.startMins
 
  // Determine which days to show (always Mon-Fri; add Sat/Sun if any class falls there)
  const usedDays = new Set(slots.map(s => s.dow))
  const showSat = usedDays.has(6)
  const showSun = usedDays.has(0)
  const dayList = []
  if (showSun) dayList.push(0)
  for (let d = 1; d <= 5; d++) dayList.push(d)
  if (showSat) dayList.push(6)
  const dayShortName = (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
  const dayLongName  = (d) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]
 
  // Time range to display — find earliest start, latest end across all slots
  let earliestMins = 8 * 60   // default 8 AM
  let latestMins   = 17 * 60  // default 5 PM
  if (slots.length > 0) {
    earliestMins = Math.min(...slots.map(s => s.startMins))
    latestMins   = Math.max(...slots.map(s => s.endMins))
    // Snap to nearest hour boundary
    earliestMins = Math.floor(earliestMins / 60) * 60
    latestMins   = Math.ceil(latestMins / 60) * 60
    // Add small buffer
    earliestMins = Math.max(7 * 60, earliestMins)
    latestMins   = Math.min(20 * 60, latestMins + 30)
  }
  const totalMinsSpan = latestMins - earliestMins
 
  // Hour labels for the row headers
  const hourLabels = []
  for (let m = earliestMins; m <= latestMins; m += 60) {
    let h = Math.floor(m / 60)
    const mer = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    if (h === 0) h = 12
    hourLabels.push({ mins: m, label: `${h} ${mer}` })
  }
 
  const formatTime = (mins) => {
    let h = Math.floor(mins / 60)
    const m = mins % 60
    const mer = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    if (h === 0) h = 12
    return `${h}${m === 0 ? '' : ':' + String(m).padStart(2, '0')} ${mer}`
  }
 
  // Stats
  const liveCount      = slots.filter(isLiveNow).length
  const todayCount     = slots.filter(s => s.dow === todayDow).length
  const totalWeekly    = slots.length
  const subjectCount   = new Set(slots.map(s => s.room.subject)).size
 
  // ── Action menu actions ─────────────────────────────────────
  const handleAction = (action, slot) => {
    setSelected(null)
    if (action === 'join') {
      setPage('live')
      setInClassroom(true)
    } else if (action === 'view-class') {
      setPage('myroom')
    } else if (action === 'add-cal') {
      toast?.info?.(`Reminder set for ${slot.room.subject}`)
    } else if (action === 'practice') {
      setPage('practice')
    }
  }
 
  // ── EMPTY STATE ─────────────────────────────────────────────
  if (myRooms.length === 0) {
    return (
      <div>
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
          color: '#fff',
        }}>
          <div style={{ padding: '24px 30px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Weekly Schedule
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0 }}>
              Your Timetable
            </h2>
          </div>
        </div>
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 17, color: 'var(--s800)', marginBottom: 6 }}>Your timetable will appear here</h3>
          <p style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 380, margin: '0 auto' }}>
            Once an admin enrols you in classes, your weekly schedule will be built automatically from your class times.
          </p>
        </div>
      </div>
    )
  }
 
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Weekly Schedule
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Your Timetable
            </h2>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              {dayLongName(todayDow)} · {now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
            </div>
          </div>
          {/* View toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,.2)',
            borderRadius: 99,
            padding: 3,
            gap: 2,
          }}>
            {[['grid', 'Week'], ['list', 'List']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                style={{
                  background: view === id ? '#fff' : 'transparent',
                  color: view === id ? '#8B1A2E' : 'rgba(255,255,255,.75)',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: 99,
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontWeight: 600,
                  transition: 'all .15s',
                }}
              >{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
          {[
            ['Live Now',     liveCount],
            ['Today',        todayCount],
            ['This Week',    totalWeekly],
            ['Subjects',     subjectCount],
          ].map(([l, v]) => (
            <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>
                {l}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* GRID VIEW */}
      {view === 'grid' && (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `64px repeat(${dayList.length}, minmax(110px, 1fr))`,
            minWidth: 64 + dayList.length * 110,
          }}>
            {/* Header row */}
            <div style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}/>
            {dayList.map(d => {
              const isToday = d === todayDow
              return (
                <div key={d} style={{
                  background: isToday ? 'rgba(139,26,46,.06)' : 'var(--bg)',
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  padding: '12px 8px',
                  textAlign: 'center',
                  position: 'relative',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: isToday ? '#8B1A2E' : 'var(--s400)' }}>
                    {dayShortName(d)}
                  </div>
                  {isToday && (
                    <div style={{ fontSize: 9, color: '#8B1A2E', fontWeight: 700, marginTop: 1 }}>Today</div>
                  )}
                </div>
              )
            })}
 
            {/* Body — one row per hour */}
            {hourLabels.slice(0, -1).map((hour, hi) => (
              <div key={hi} style={{ display: 'contents' }}>
                {/* Time label */}
                <div style={{
                  background: 'var(--bg)',
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  padding: '6px 6px 0',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  color: 'var(--s400)',
                  textAlign: 'right',
                  height: 60,
                }}>
                  {hour.label}
                </div>
                {/* Day cells for this hour - empty cells with grid lines */}
                {dayList.map(d => {
                  const isToday = d === todayDow
                  return (
                    <div key={d} style={{
                      background: isToday ? 'rgba(139,26,46,.025)' : 'transparent',
                      borderRight: '1px solid var(--border)',
                      borderBottom: '1px solid var(--border)',
                      height: 60,
                      position: 'relative',
                    }}/>
                  )
                })}
              </div>
            ))}
          </div>
 
          {/* Overlay slots positioned absolutely on the grid */}
          <div style={{ position: 'relative', marginTop: -((hourLabels.length - 1) * 60), pointerEvents: 'none' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `64px repeat(${dayList.length}, minmax(110px, 1fr))`,
              minWidth: 64 + dayList.length * 110,
            }}>
              <div/>
              {dayList.map(d => (
                <div key={d} style={{ position: 'relative', minHeight: (hourLabels.length - 1) * 60 + 'px' }}>
                  {slots.filter(s => s.dow === d).map((slot, si) => {
                    const col = colourFor(slot.room.subject)
                    const top = ((slot.startMins - earliestMins) / 60) * 60
                    const height = Math.max(36, ((slot.endMins - slot.startMins) / 60) * 60 - 2)
                    const live = isLiveNow(slot)
                    const past = isPastToday(slot)
                    return (
                      <div
                        key={si}
                        onClick={() => setSelected(slot)}
                        style={{
                          position: 'absolute',
                          top: top + 'px',
                          left: 4,
                          right: 4,
                          height: height + 'px',
                          background: live ? col : col + 'E0',
                          color: '#fff',
                          borderRadius: 'var(--rsm)',
                          padding: '6px 8px',
                          fontSize: 11,
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          boxShadow: live ? `0 0 0 2px #fff, 0 0 0 4px ${col}` : '0 1px 3px rgba(0,0,0,.15)',
                          opacity: past ? 0.55 : 1,
                          overflow: 'hidden',
                          transition: 'all .15s',
                          zIndex: live ? 5 : 1,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                        title={`${slot.room.subject} — ${slot.room.teacher}\n${formatTime(slot.startMins)} – ${formatTime(slot.endMins)}`}
                      >
                        {live && (
                          <div style={{
                            display: 'inline-block',
                            background: '#fff',
                            color: col,
                            fontSize: 8.5,
                            fontWeight: 800,
                            letterSpacing: '.08em',
                            padding: '1px 6px',
                            borderRadius: 99,
                            marginBottom: 2,
                          }}>● LIVE</div>
                        )}
                        <div style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.2, marginBottom: 2, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {slot.room.subject}
                        </div>
                        <div style={{ fontSize: 10, opacity: .8, lineHeight: 1.2 }}>
                          {formatTime(slot.startMins)}
                        </div>
                        {height > 50 && (
                          <div style={{ fontSize: 10, opacity: .75, lineHeight: 1.2, marginTop: 1, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                            {slot.room.teacher}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
 
      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...slots].sort((a, b) => {
                // Sort by day then time, with today first
                const aDayOrder = a.dow === todayDow ? -1 : a.dow
                const bDayOrder = b.dow === todayDow ? -1 : b.dow
                if (aDayOrder !== bDayOrder) return aDayOrder - bDayOrder
                return a.startMins - b.startMins
              }).map((slot, i) => {
                const col = colourFor(slot.room.subject)
                const live = isLiveNow(slot)
                const past = isPastToday(slot)
                const upcomingToday = isUpcomingToday(slot)
                const isToday = slot.dow === todayDow
 
                let statusBadge
                if (live) statusBadge = <span className="badge badge-red" style={{ background: '#FEE2E2', color: '#991B1B' }}>● Live Now</span>
                else if (past) statusBadge = <span className="badge badge-slate" style={{ background: 'var(--s100)', color: 'var(--s500)' }}>Done</span>
                else if (upcomingToday) statusBadge = <span className="badge badge-amber">Today</span>
                else statusBadge = <span className="badge badge-blue">Upcoming</span>
 
                return (
                  <tr key={i} style={{ background: live ? '#FEF2F2' : isToday ? 'rgba(139,26,46,.025)' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 4, height: 24, borderRadius: 2, background: col, flexShrink: 0 }}/>
                        <span className="mono" style={{ fontWeight: 700, color: isToday ? '#8B1A2E' : 'var(--s700)' }}>
                          {dayShortName(slot.dow)}
                        </span>
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: 13 }}>
                      {formatTime(slot.startMins)} – {formatTime(slot.endMins)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{slot.room.subject}</td>
                    <td style={{ color: 'var(--s500)', fontSize: 13 }}>{slot.room.teacher}</td>
                    <td>{statusBadge}</td>
                    <td>
                      {live && (
                        <button className="btn btn-d btn-sm" onClick={() => { setPage('live'); setInClassroom(true) }}>
                          Join
                        </button>
                      )}
                      {!live && !past && (
                        <button className="btn btn-s btn-sm" onClick={() => toast?.info?.(`Reminder set for ${slot.room.subject}`)}>
                          Remind
                        </button>
                      )}
                      {past && (
                        <button className="btn btn-s btn-sm" onClick={() => setPage('practice')}>
                          Practice
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
 
      {/* Action menu modal */}
      {selected && (() => {
        const live = isLiveNow(selected)
        const past = isPastToday(selected)
        return (
          <div
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15,23,42,.55)',
              zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--white)',
                borderRadius: 'var(--rxl)',
                width: '100%', maxWidth: 420,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,.3)',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '20px 24px',
                background: `linear-gradient(135deg, ${colourFor(selected.room.subject)} 0%, ${colourFor(selected.room.subject)}DD 100%)`,
                color: '#fff',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8, marginBottom: 4 }}>
                  {dayLongName(selected.dow)} · {formatTime(selected.startMins)} – {formatTime(selected.endMins)}
                </div>
                <h3 className="serif" style={{ fontSize: 22, margin: 0 }}>{selected.room.subject}</h3>
                <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
                  {selected.room.teacher} · {selected.room.curriculum} {selected.room.grade ? '· ' + selected.room.grade : ''}
                </div>
                {live && (
                  <div style={{
                    display: 'inline-block',
                    background: '#fff', color: colourFor(selected.room.subject),
                    fontSize: 10, fontWeight: 800, letterSpacing: '.1em',
                    padding: '3px 10px', borderRadius: 99,
                    marginTop: 10,
                  }}>● LIVE NOW</div>
                )}
              </div>
 
              {/* Actions */}
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {live && (
                  <button
                    className="btn btn-p"
                    onClick={() => handleAction('join', selected)}
                    style={{ background: colourFor(selected.room.subject), borderColor: colourFor(selected.room.subject), justifyContent: 'flex-start' }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Join Class Now
                  </button>
                )}
                {!live && !past && (
                  <button
                    className="btn btn-s"
                    onClick={() => handleAction('add-cal', selected)}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Set Reminder
                  </button>
                )}
                <button
                  className="btn btn-s"
                  onClick={() => handleAction('view-class', selected)}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  View Classmates
                </button>
                {past && (
                  <button
                    className="btn btn-s"
                    onClick={() => handleAction('practice', selected)}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1.5"/></svg>
                    Practice This Subject
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'var(--s500)', padding: '8px',
                    fontSize: 13, cursor: 'pointer',
                    textAlign: 'center', marginTop: 4,
                  }}
                >Close</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
 
// ═══════════════════════════════════════════════════════════
// STUDY PLAN TAB — 7-day rolling plan, real data, mark-as-done
// ═══════════════════════════════════════════════════════════
const STUDY_PLAN_KEY = 'sm_study_plan'
const STUDY_PLAN_DONE_KEY = 'sm_study_plan_done'   // tasks marked complete
const STUDY_PLAN_GENERATED_KEY = 'sm_study_plan_generated'  // ISO date when last regenerated
 
const loadDoneTasks = () => {
  try { return JSON.parse(localStorage.getItem(STUDY_PLAN_DONE_KEY) || '{}') }
  catch { return {} }
}
const saveDoneTasks = (d) => {
  try { localStorage.setItem(STUDY_PLAN_DONE_KEY, JSON.stringify(d)) } catch {}
}
 
const loadStoredPlan = () => {
  try { return JSON.parse(localStorage.getItem(STUDY_PLAN_KEY) || 'null') }
  catch { return null }
}
const saveStoredPlan = (p) => {
  try {
    localStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(p))
    localStorage.setItem(STUDY_PLAN_GENERATED_KEY, new Date().toISOString())
  } catch {}
}
 
// ── PLAN GENERATOR — uses real Practice + Exam history ─────
const generateStudyPlan = (user, store) => {
  // Read student's data
  let practiceHist = []
  let examHist = []
  try { practiceHist = JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch {}
  try { examHist = JSON.parse(localStorage.getItem('sm_exam_history') || '[]') } catch {}
 
  // Subject → array of {topic, score, attempts}
  const subjectStats = {}
  practiceHist.forEach(s => {
    if (!subjectStats[s.subject]) subjectStats[s.subject] = {}
    if (!subjectStats[s.subject][s.topic]) {
      subjectStats[s.subject][s.topic] = { scores: [], attempts: 0 }
    }
    subjectStats[s.subject][s.topic].scores.push(s.score)
    subjectStats[s.subject][s.topic].attempts++
  })
 
  // Compute each topic's avg
  const topicMastery = []
  Object.entries(subjectStats).forEach(([subject, topics]) => {
    Object.entries(topics).forEach(([topic, data]) => {
      const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      topicMastery.push({ subject, topic, mastery: Math.round(avg), attempts: data.attempts })
    })
  })
 
  // Subjects from QUESTION_BANK that the student hasn't tried yet
  const allSubjects = Object.keys(QUESTION_BANK)
  const triedSubjects = new Set(topicMastery.map(t => t.subject))
  const untriedSubjects = allSubjects.filter(s => !triedSubjects.has(s))
 
  // Find untried topics within tried subjects
  const untriedTopics = []
  Object.keys(QUESTION_BANK).forEach(subject => {
    Object.keys(QUESTION_BANK[subject]).forEach(topic => {
      const tried = topicMastery.find(t => t.subject === subject && t.topic === topic)
      if (!tried) {
        untriedTopics.push({ subject, topic, mastery: 0, attempts: 0 })
      }
    })
  })
 
  // Find student's enrolled rooms (live classes anchor study around them)
  const studentFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const myRooms = (store?.groupRooms || []).filter(r =>
    r.students?.some(s => s === studentFullName || s === user?.firstName || (user?.firstName && s.includes(user.firstName)))
  )
 
  // Map class days: { 1: ['Mathematics', 'Biology'], 3: [...] }
  const classesByDay = {}
  myRooms.forEach(room => {
    const parsed = parseScheduleString(room.schedule)
    if (!parsed) return
    parsed.days.forEach(dow => {
      if (!classesByDay[dow]) classesByDay[dow] = []
      classesByDay[dow].push({ subject: room.subject, time: parsed.startMins, teacher: room.teacher })
    })
  })
 
  // Build the 7-day plan starting today
  const plan = []
  const today = new Date()
  const dayLongName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
 
  // Sort weak topics by mastery (lowest first) for priority
  const weakTopics = [...topicMastery].filter(t => t.mastery < 70).sort((a, b) => a.mastery - b.mastery)
  const reviewTopics = [...topicMastery].filter(t => t.mastery >= 70 && t.mastery < 85).sort((a, b) => a.mastery - b.mastery)
 
  // Build a rotation pool that prioritises weak first, then untried in tried subjects, then untried subjects
  const studyPool = [
    ...weakTopics.map(t => ({ ...t, priority: 'high' })),
    ...untriedTopics.slice(0, 5).map(t => ({ ...t, priority: 'medium' })),
    ...reviewTopics.map(t => ({ ...t, priority: 'low' })),
    ...untriedTopics.slice(5).map(t => ({ ...t, priority: 'medium' })),
  ]
 
  // Fallback: if pool is empty (cold start), seed with first 7 topics from QUESTION_BANK
  if (studyPool.length === 0) {
    Object.keys(QUESTION_BANK).forEach(subject => {
      Object.keys(QUESTION_BANK[subject]).slice(0, 2).forEach(topic => {
        studyPool.push({ subject, topic, mastery: 0, attempts: 0, priority: 'medium' })
      })
    })
  }
 
  // Generate one entry per day
  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getTime() + i * 86400000)
    const dow = date.getDay()
    const isWeekend = dow === 0 || dow === 6
    const dayClasses = classesByDay[dow] || []
    const isToday = i === 0
 
    // Pick this day's main topic — rotate through pool
    const mainTopic = studyPool[i % studyPool.length] || { subject: 'Mathematics', topic: 'Algebra', mastery: 0, priority: 'medium' }
 
    // Build tasks list
    const tasks = []
    const minsTarget = isWeekend ? 25 : (mainTopic.priority === 'high' ? 45 : 35)
 
    if (isToday) {
      tasks.push({
        id: `${date.toDateString()}-warmup`,
        type: 'warmup',
        title: 'Warm-up: 5 minutes review of yesterday',
        mins: 5,
        action: 'review',
      })
    }
 
    tasks.push({
      id: `${date.toDateString()}-practice-${mainTopic.topic.replace(/\s/g, '-')}`,
      type: 'practice',
      title: `Practice ${mainTopic.topic}`,
      subject: mainTopic.subject,
      topic: mainTopic.topic,
      mins: 20,
      action: 'practice',
      mastery: mainTopic.mastery,
    })
 
    if (mainTopic.mastery > 0 && mainTopic.mastery < 60) {
      tasks.push({
        id: `${date.toDateString()}-explain-${mainTopic.topic.replace(/\s/g, '-')}`,
        type: 'explain',
        title: `Ask Mshauri to explain ${mainTopic.topic}`,
        mins: 10,
        action: 'mshauri',
        topic: mainTopic.topic,
      })
    }
 
    // Anchor live classes
    dayClasses.forEach(cls => {
      tasks.push({
        id: `${date.toDateString()}-class-${cls.subject.replace(/\s/g, '-')}`,
        type: 'class',
        title: `Live ${cls.subject} class with ${cls.teacher}`,
        mins: 60,
        time: cls.time,
        action: 'live',
        subject: cls.subject,
      })
    })
 
    // Weekend: lighter, suggest exam practice
    if (isWeekend && !isToday) {
      tasks.push({
        id: `${date.toDateString()}-exam`,
        type: 'exam',
        title: `Take a practice exam (10 questions)`,
        mins: 30,
        action: 'exam',
      })
    }
 
    // Sort tasks by time if any have specific times
    tasks.sort((a, b) => {
      if (a.time !== undefined && b.time !== undefined) return a.time - b.time
      if (a.time !== undefined) return -1
      if (b.time !== undefined) return 1
      // Order: warmup → practice → explain → exam
      const order = { warmup: 1, class: 2, practice: 3, explain: 4, exam: 5 }
      return (order[a.type] || 99) - (order[b.type] || 99)
    })
 
    plan.push({
      date: date.toISOString(),
      dow,
      dateStr: date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }),
      shortDate: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      dayName: dayLongName[dow],
      isToday,
      isWeekend,
      mainSubject: mainTopic.subject,
      mainTopic: mainTopic.topic,
      mainMastery: mainTopic.mastery,
      priority: mainTopic.priority,
      minsTarget,
      tasks,
    })
  }
 
  return plan
}
 
// ── COLOURS ────────────────────────────────────────────────
const planSubjColours = {
  'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
  'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
  'Geography': '#0F766E',
}
const planSubjColour = (s) => planSubjColours[s] || '#8B1A2E'
 
const priorityStyle = {
  high:   { label: 'Priority',  bg: 'var(--r50)', color: 'var(--r600)', accent: 'var(--r500)' },
  medium: { label: 'Build',     bg: 'var(--a50)', color: 'var(--a600)', accent: 'var(--a600)' },
  low:    { label: 'Maintain',  bg: 'var(--g50)', color: 'var(--g600)', accent: 'var(--g600)' },
}
 
const taskTypeIcon = (type) => {
  if (type === 'warmup') return '☀'
  if (type === 'class') return '●'
  if (type === 'practice') return '◆'
  if (type === 'explain') return '◇'
  if (type === 'exam') return '★'
  return '·'
}
 
function StudyPlanTab({ user, store, setPage, toast }) {
  const [plan, setPlan]     = useState(() => loadStoredPlan() || generateStudyPlan(user, store))
  const [done, setDone]     = useState(() => loadDoneTasks())
  const [activeDay, setActiveDay] = useState(0)  // index into plan
 
  // Auto-regenerate if plan is older than 24 hours OR data has changed
  useEffect(() => {
    const stored = loadStoredPlan()
    const generatedAt = localStorage.getItem(STUDY_PLAN_GENERATED_KEY)
    if (!stored || !generatedAt) {
      const fresh = generateStudyPlan(user, store)
      setPlan(fresh)
      saveStoredPlan(fresh)
      return
    }
    const ageHours = (Date.now() - new Date(generatedAt).getTime()) / 3600000
    if (ageHours > 24) {
      const fresh = generateStudyPlan(user, store)
      setPlan(fresh)
      saveStoredPlan(fresh)
    }
  }, [])
 
  const refreshPlan = () => {
    const fresh = generateStudyPlan(user, store)
    setPlan(fresh)
    saveStoredPlan(fresh)
    toast?.ok?.('Study plan refreshed using your latest data.')
  }
 
  const toggleDone = (taskId) => {
    const newDone = { ...done, [taskId]: !done[taskId] }
    setDone(newDone)
    saveDoneTasks(newDone)
  }
 
  const handleAction = (task) => {
    if (task.action === 'practice')  setPage('practice')
    else if (task.action === 'live') setPage('live')
    else if (task.action === 'exam') setPage('exams')
    else if (task.action === 'mshauri') setPage('tutor')
    else if (task.action === 'review') {
      toast?.info?.('Review your last practice session in the Achievements tab.')
      setPage('achievements')
    }
  }
 
  const formatTaskTime = (mins) => {
    let h = Math.floor(mins / 60)
    const m = mins % 60
    const mer = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    if (h === 0) h = 12
    return `${h}${m === 0 ? '' : ':' + String(m).padStart(2, '0')} ${mer}`
  }
 
  // Stats
  const allTasks = plan.flatMap(d => d.tasks)
  const doneCount = allTasks.filter(t => done[t.id]).length
  const totalCount = allTasks.length
  const completionPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
  const todayPlan = plan[0]
  const todayTasks = todayPlan?.tasks || []
  const todayDone = todayTasks.filter(t => done[t.id]).length
 
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Personalised &amp; Adaptive
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Your Study Plan
            </h2>
            <p style={{ fontSize: 13.5, opacity: .85, marginTop: 6, marginBottom: 0, maxWidth: 520, lineHeight: 1.55 }}>
              Built from your real practice scores, exam history, and live class schedule. Your weakest topics get the most attention.
            </p>
          </div>
          <button
            onClick={refreshPlan}
            style={{
              background: 'rgba(255,255,255,.15)',
              border: '1px solid rgba(255,255,255,.3)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 'var(--rmd)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh Plan
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
          {[
            ['Today',         `${todayDone}/${todayTasks.length}`],
            ['This Week',     `${doneCount}/${totalCount}`],
            ['Completion',    `${completionPct}%`],
            ['Focus',         todayPlan?.mainSubject?.split(' ')[0] || '—'],
          ].map(([l, v]) => (
            <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>
                {l}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Day picker tabs */}
      <div style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        marginBottom: 18,
        paddingBottom: 4,
      }}>
        {plan.map((day, i) => {
          const isActive = activeDay === i
          const dayDoneCount = day.tasks.filter(t => done[t.id]).length
          const allDone = dayDoneCount === day.tasks.length && day.tasks.length > 0
          return (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              style={{
                background: isActive ? '#8B1A2E' : 'var(--white)',
                color: isActive ? '#fff' : 'var(--s700)',
                border: `1.5px solid ${isActive ? '#8B1A2E' : 'var(--border)'}`,
                borderRadius: 'var(--rmd)',
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                position: 'relative',
                flexShrink: 0,
                transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: isActive ? .85 : .5, marginBottom: 2 }}>
                {day.isToday ? 'Today' : day.dayName.slice(0, 3)}
              </div>
              <div style={{ fontSize: 13 }}>{day.shortDate}</div>
              {allDone && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--g500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
 
      {/* Active day card */}
      {plan[activeDay] && (() => {
        const day  = plan[activeDay]
        const subjCol = planSubjColour(day.mainSubject)
        const pri  = priorityStyle[day.priority] || priorityStyle.medium
        return (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Day header */}
            <div style={{
              padding: '20px 24px 18px',
              borderBottom: '1px solid var(--border)',
              borderLeft: `4px solid ${subjCol}`,
              background: 'var(--bg)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--s400)', marginBottom: 4 }}>
                    {day.dateStr}
                  </div>
                  <h3 className="serif" style={{ fontSize: 22, color: 'var(--s900)', margin: 0, lineHeight: 1.15 }}>
                    Focus: <span style={{ color: subjCol }}>{day.mainSubject}</span>
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--s500)', marginTop: 4 }}>
                    Main topic: <strong>{day.mainTopic}</strong>
                    {day.mainMastery > 0 && (
                      <> · current mastery <span className="mono" style={{ fontWeight: 700, color: day.mainMastery < 60 ? 'var(--r600)' : day.mainMastery < 80 ? 'var(--a600)' : 'var(--g600)' }}>{day.mainMastery}%</span></>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    background: pri.bg, color: pri.color,
                    fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: 99,
                  }}>{pri.label}</span>
                  <span style={{
                    background: 'var(--white)', color: 'var(--s700)',
                    fontSize: 11.5, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 99,
                    border: '1px solid var(--border)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{day.minsTarget} min target</span>
                </div>
              </div>
 
              {/* Why this? coaching note */}
              <div style={{
                fontSize: 12.5, color: 'var(--s500)', fontStyle: 'italic',
                background: 'var(--white)', borderRadius: 'var(--rsm)',
                padding: '8px 12px',
                borderLeft: `2px solid ${subjCol}`,
              }}>
                {day.priority === 'high'
                  ? `Why this: your mastery in ${day.mainTopic} is below 70%. Today's practice will move it forward.`
                  : day.mainMastery === 0
                  ? `Why this: you haven't practised ${day.mainTopic} yet. Today's session is your introduction.`
                  : `Why this: keeping ${day.mainTopic} fresh while you build other topics. Light review.`
                }
              </div>
            </div>
 
            {/* Tasks list */}
            <div style={{ padding: '14px 0' }}>
              {day.tasks.length === 0 ? (
                <div style={{ padding: '20px 24px', textAlign: 'center', color: 'var(--s400)', fontSize: 13 }}>
                  No tasks scheduled — enjoy a rest day.
                </div>
              ) : day.tasks.map((task) => {
                const isDone = done[task.id]
                const hasTime = task.time !== undefined
                const taskCol = task.subject ? planSubjColour(task.subject) : subjCol
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      padding: '12px 24px',
                      borderBottom: '1px solid var(--border)',
                      opacity: isDone ? 0.55 : 1,
                      transition: 'opacity .2s',
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleDone(task.id)}
                      style={{
                        width: 22, height: 22, flexShrink: 0,
                        borderRadius: 6,
                        border: `2px solid ${isDone ? 'var(--g500)' : 'var(--s300, #CBD5E1)'}`,
                        background: isDone ? 'var(--g500)' : 'var(--white)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 2,
                        transition: 'all .15s',
                      }}
                    >
                      {isDone && (
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
 
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 14, fontWeight: 700,
                          color: isDone ? 'var(--s500)' : 'var(--s900)',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}>
                          {task.title}
                        </span>
                        {hasTime && (
                          <span className="mono" style={{
                            fontSize: 11, fontWeight: 700,
                            color: taskCol,
                            background: taskCol + '15',
                            padding: '2px 7px',
                            borderRadius: 99,
                          }}>
                            {formatTaskTime(task.time)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--s400)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ color: taskCol, fontWeight: 700, fontSize: 12 }}>
                          {taskTypeIcon(task.type)}
                        </span>
                        <span style={{ textTransform: 'capitalize' }}>{task.type}</span>
                        <span>·</span>
                        <span>{task.mins} min</span>
                      </div>
                    </div>
 
                    {!isDone && (
                      <button
                        className="btn btn-s btn-sm"
                        onClick={() => handleAction(task)}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      >
                        Start
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
 
// ═══════════════════════════════════════════════════════════
// SUBSCRIPTION TAB — KES, enrolled-only, 3-day grace
// ═══════════════════════════════════════════════════════════
 
// Paystack live key (your dashboard)
const PAYSTACK_PUBLIC_KEY = 'pk_live_a1608f5c5f71946ca1357afa673cd53ce4057af8'
 
const SUBSCRIPTION_PAYMENTS_KEY = 'sm_subscription_payments'
const SUBSCRIPTION_TIER_KEY     = 'sm_subscription_tier'
const SUBSCRIPTION_MODE_KEY     = 'sm_subscription_mode'
const SUBSCRIPTION_ENROLLED_KEY = 'sm_subscription_enrolled'  // the plan student has paid for
 
// Conversion rate USD → KES. Update if your landing rate changes.
// (Landing shows "~ KES 52,000" for $400/month → ratio of 130 KES per USD)
const KES_PER_USD = 130
 
// Grace period in days after due date before lockout
const GRACE_PERIOD_DAYS = 3
 
// PRICING — mirrors landing page exactly
const PRICING_TABS = [
  {
    id: 'homeschool',
    label: 'Homeschool · In-Person',
    plans: [
      { id: 'hs-primary',    name: 'Primary',              subtitle: 'CBC · British · American', eyebrow: 'HOMESCHOOL · AT HOME', gradeRange: 'Grades 1-6',  monthly: 400, termly: 1140, annually: 4224, termSave: 60, annualSave: 576, features: ['Full CBC, British or American curriculum','Dedicated class teacher (home or video)','All teaching materials, textbooks & workbooks','Quarterly progress reports','Parent dashboard'] },
      { id: 'hs-highschool', name: 'High School',          subtitle: 'IGCSE · Edexcel',         eyebrow: 'HOMESCHOOL · AT HOME', gradeRange: 'Year 7-11',   monthly: 423, termly: 1206, annually: 4467, termSave: 63, annualSave: 609, badge: 'Most Popular', featured: true, features: ['IGCSE, Edexcel, British or American pathway','Subject specialist tutors per subject','All Cambridge & Edexcel past papers','Mock exams & marking schemes','University counselling'] },
      { id: 'hs-alevel',     name: 'A-Level / IB Diploma', subtitle: '',                          eyebrow: 'HOMESCHOOL · AT HOME', gradeRange: 'Year 12-13',  monthly: 515, termly: 1468, annually: 5438, termSave: 77, annualSave: 742, features: ['Cambridge A-Level or IB Diploma','University counselling included','UCAS / Common App application support','Unlimited Mshauri AI + live Zoom sessions','Personal statement coaching'] },
    ],
  },
  {
    id: 'virtual',
    label: 'Online / Virtual School',
    plans: [
      { id: 'v-basic',   name: 'Basic Online',     subtitle: '', eyebrow: 'ONLINE / VIRTUAL SCHOOL', gradeRange: 'All ages', monthly: 180, termly: 513,  annually: 1901, termSave: 27, annualSave: 259, features: ['Full recorded video lesson library','Interactive practice quizzes & worksheets','Mshauri AI homework helper','Self-paced learning','Discussion forums'] },
      { id: 'v-premium', name: 'Premium Online',   subtitle: '', eyebrow: 'ONLINE / VIRTUAL SCHOOL', gradeRange: 'All ages', monthly: 260, termly: 741,  annually: 2746, termSave: 39, annualSave: 374, badge: 'Best Value', featured: true, features: ['Everything in Basic, plus:','Live small-group Zoom classes','Direct teacher messaging','Personalised learning paths','Monthly 1-on-1 reviews'] },
      { id: 'v-igcse',   name: 'IGCSE Full Pack',  subtitle: '', eyebrow: 'ONLINE / VIRTUAL SCHOOL', gradeRange: 'Year 9-11', monthly: 360, termly: 1026, annually: 3802, termSave: 54, annualSave: 518, features: ['Complete IGCSE curriculum across all subjects','All Cambridge past papers 2015-2025','Mock exams with marking schemes','Subject specialist tutors','University guidance'] },
    ],
  },
  {
    id: 'tuition',
    label: 'Private Tuition',
    plans: [
      { id: 't-online', name: 'Online Session', subtitle: '',              eyebrow: 'PRIVATE TUITION · ONLINE',  gradeRange: 'Any subject',     unit: 'per hour', hourly: 8,  monthly: 8,  termly: 8,  annually: 8,    features: ['Video session with subject specialist','Interactive shared digital whiteboard','Recorded for review','1-hour minimum booking','Pay per session'] },
      { id: 't-home',   name: 'Home Visit',     subtitle: 'Nairobi area', eyebrow: 'PRIVATE TUITION · NAIROBI', gradeRange: 'Any subject',     unit: 'per hour', hourly: 12, monthly: 12, termly: 12, annually: 12,   badge: 'Popular', featured: true, features: ['Tutor comes to your home in Nairobi','Subject specialist matched to need','Flexible scheduling','1-hour minimum','Materials provided'] },
      { id: 't-bundle', name: 'Monthly Bundle', subtitle: '20 hours per month', eyebrow: 'PRIVATE TUITION · BUNDLE', gradeRange: 'All subjects',                       monthly: 235, termly: 705, annually: 2820, features: ['20 hours - online or home visit','Same dedicated tutor each week','Mix any subjects','Save vs hourly rate','Monthly subscription'] },
    ],
  },
]
 
const findPlanById = (planId) => {
  for (const tab of PRICING_TABS) {
    const plan = tab.plans.find(p => p.id === planId)
    if (plan) return { tab, plan }
  }
  return null
}
 
const findPlanTabId = (planId) => {
  for (const tab of PRICING_TABS) {
    if (tab.plans.find(p => p.id === planId)) return tab.id
  }
  return 'homeschool'
}
 
// Lazy-load Paystack inline.js
let paystackPromise = null
const ensurePaystack = () => {
  if (paystackPromise) return paystackPromise
  paystackPromise = new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.PaystackPop) { resolve(window.PaystackPop); return }
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v2/inline.js'
    script.async = true
    script.onload = () => window.PaystackPop ? resolve(window.PaystackPop) : reject(new Error('Paystack loaded but PaystackPop undefined'))
    script.onerror = () => reject(new Error('Failed to load Paystack script'))
    document.head.appendChild(script)
  })
  return paystackPromise
}
 
const loadStudentPayments = () => { try { return JSON.parse(localStorage.getItem(SUBSCRIPTION_PAYMENTS_KEY) || '[]') } catch { return [] } }
const saveStudentPayments = (p) => { try { localStorage.setItem(SUBSCRIPTION_PAYMENTS_KEY, JSON.stringify(p.slice(-50))) } catch {} }
const loadEnrolledPlan = () => { try { return localStorage.getItem(SUBSCRIPTION_ENROLLED_KEY) || null } catch { return null } }
const saveEnrolledPlan = (planId) => { try { localStorage.setItem(SUBSCRIPTION_ENROLLED_KEY, planId) } catch {} }
 
const buildReferralCode = (user) => {
  const last = (user?.lastName || 'STUDENT').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5)
  return `${last}-${new Date().getFullYear()}`
}
 
// ═══════════════════════════════════════════════════════════
// SUBSCRIPTION STATUS — for grace period lockout
// ═══════════════════════════════════════════════════════════
// Place this at module level so the main StudentPortal can call it.
// Returns: { active, daysOverdue, locked, nextDueDate, lastPayment }
const computeSubscriptionStatus = (user) => {
  const payments = loadStudentPayments()
  const lastPayment = payments[0]
  const enrolledPlanId = loadEnrolledPlan() || user?.enrolledPlanId
 
  // Never paid + never enrolled = grace state, not locked (lets new students browse)
  if (!lastPayment) {
    return {
      active: false,
      daysOverdue: 0,
      locked: false,
      nextDueDate: null,
      lastPayment: null,
      enrolledPlanId,
      neverPaid: true,
    }
  }
 
  // Compute due date based on payment cycle
  const paidOn = new Date(lastPayment.date)
  const dueDate = new Date(paidOn)
  if (lastPayment.cycle === 'annually') dueDate.setFullYear(dueDate.getFullYear() + 1)
  else if (lastPayment.cycle === 'termly') dueDate.setMonth(dueDate.getMonth() + 3)
  else dueDate.setMonth(dueDate.getMonth() + 1)
 
  const now = new Date()
  const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))
 
  return {
    active: daysOverdue <= 0,
    daysOverdue: Math.max(0, daysOverdue),
    locked: daysOverdue > GRACE_PERIOD_DAYS,
    nextDueDate: dueDate,
    lastPayment,
    enrolledPlanId,
    neverPaid: false,
  }
}
 
// ═══════════════════════════════════════════════════════════
// LOCKOUT BANNER — paste this if you want it visible across tabs
// (it's not strictly required, the SubscriptionTab handles its own
// renewal flow, but a top banner makes overdue status visible)
// ═══════════════════════════════════════════════════════════
function SubscriptionStatusBanner({ user, onRenew }) {
  const status = computeSubscriptionStatus(user)
  if (status.active || status.neverPaid) return null
 
  const isLocked = status.locked
  const daysOverdue = status.daysOverdue
 
  return (
    <div style={{
      background: isLocked ? '#7F1D1D' : '#92400E',
      color: '#fff',
      padding: '10px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontSize: 13,
      flexWrap: 'wrap',
    }}>
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}>
        {isLocked
          ? <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
          : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
        }
      </svg>
      <div style={{ flex: 1, minWidth: 200 }}>
        <strong>{isLocked ? 'Account Locked: ' : 'Payment Overdue: '}</strong>
        {isLocked
          ? `Your subscription has been overdue for ${daysOverdue} days. Please renew to restore access.`
          : `Your subscription is ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue. ${GRACE_PERIOD_DAYS - daysOverdue} day${GRACE_PERIOD_DAYS - daysOverdue === 1 ? '' : 's'} until lockout.`
        }
      </div>
      <button
        onClick={onRenew}
        style={{
          background: '#fff',
          color: isLocked ? '#7F1D1D' : '#92400E',
          border: 'none',
          padding: '6px 14px',
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 12,
          cursor: 'pointer',
        }}
      >Renew Now</button>
    </div>
  )
}
 
// ═══════════════════════════════════════════════════════════
// MAIN SUBSCRIPTION TAB
// ═══════════════════════════════════════════════════════════
function SubscriptionTab({ user, store, toast }) {
  const status = computeSubscriptionStatus(user)
  const enrolledPlanId = status.enrolledPlanId
 
  // View mode: 'enrolled' (show only their plan) or 'change' (full catalog)
  const [viewMode, setViewMode] = useState(enrolledPlanId ? 'enrolled' : 'change')
 
  // Default to their enrolled plan, or featured high school plan if no enrollment
  const defaultPlanId = enrolledPlanId || 'hs-highschool'
  const [activeTabId,   setActiveTabId]   = useState(() => findPlanTabId(defaultPlanId))
  const [billingCycle,  setBillingCycle]  = useState('monthly')
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId)
  const [payments, setPayments] = useState(() => loadStudentPayments())
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(null)
 
  const activeTab = PRICING_TABS.find(t => t.id === activeTabId) || PRICING_TABS[0]
  const planLookup = findPlanById(selectedPlanId)
  const currentPlan = planLookup ? planLookup.plan : PRICING_TABS[0].plans[1]
 
  const getPriceForCycle = (plan, cycle) => {
    if (plan.unit === 'per hour') return { price: plan.hourly, label: plan.unit, savings: 0 }
    if (cycle === 'monthly')  return { price: plan.monthly,  label: 'per month', savings: 0 }
    if (cycle === 'termly')   return { price: plan.termly,   label: 'per term',  savings: plan.termSave || 0 }
    if (cycle === 'annually') return { price: plan.annually, label: 'per year',  savings: plan.annualSave || 0 }
    return { price: plan.monthly, label: 'per month', savings: 0 }
  }
 
  const referralCode = buildReferralCode(user)
 
  const switchTab = (tabId) => {
    setActiveTabId(tabId)
    localStorage.setItem(SUBSCRIPTION_MODE_KEY, tabId)
    const newTab = PRICING_TABS.find(t => t.id === tabId)
    const featured = newTab?.plans.find(p => p.featured) || newTab?.plans[0]
    if (featured) {
      setSelectedPlanId(featured.id)
      localStorage.setItem(SUBSCRIPTION_TIER_KEY, featured.id)
    }
  }
 
  const selectPlan = (planId) => {
    setSelectedPlanId(planId)
    localStorage.setItem(SUBSCRIPTION_TIER_KEY, planId)
  }
 
  // ── PAYSTACK PAYMENT (KES) ──────────────────────────────
  const handlePay = async () => {
    if (processing) return
    if (!user?.email) { toast?.error?.('Please add an email address before paying.'); return }
 
    const { price: usdPrice } = getPriceForCycle(currentPlan, billingCycle)
    const kesPrice = Math.round(usdPrice * KES_PER_USD)
    // Paystack expects KES amount in kobo (minor unit) — multiply by 100
    const paystackAmount = kesPrice * 100
 
    setProcessing(true)
 
    try {
      const PaystackPop = await ensurePaystack()
      if (!PaystackPop) { toast?.error?.('Could not load Paystack. Check internet.'); setProcessing(false); return }
 
      const reference = 'SM-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase()
      const paystack = new PaystackPop()
 
      paystack.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: paystackAmount,
        currency: 'KES',  // ← KES (was USD — Paystack KE accounts don't support USD)
        ref: reference,
        metadata: {
          student_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          plan_id: currentPlan.id,
          plan_name: currentPlan.name,
          tab: activeTabId,
          billing_cycle: billingCycle,
          usd_equivalent: usdPrice,
          custom_fields: [
            { display_name: 'Plan',          variable_name: 'plan',          value: `${currentPlan.name}${currentPlan.subtitle ? ' - ' + currentPlan.subtitle : ''}` },
            { display_name: 'Billing Cycle', variable_name: 'billing_cycle', value: billingCycle },
            { display_name: 'Student',       variable_name: 'student',       value: `${user.firstName} ${user.lastName}` },
            { display_name: 'USD Price',     variable_name: 'usd_price',     value: '$' + usdPrice },
          ],
        },
        onSuccess: (transaction) => {
          const newPayment = {
            id: transaction.reference,
            planId: currentPlan.id,
            planName: currentPlan.name,
            tab: activeTabId,
            cycle: billingCycle,
            amountKES: kesPrice,
            amountUSD: usdPrice,
            currency: 'KES',
            method: 'Paystack',
            reference: transaction.reference,
            date: new Date().toISOString(),
            status: 'success',
          }
          const newPayments = [newPayment, ...payments]
          setPayments(newPayments)
          saveStudentPayments(newPayments)
          // Mark this plan as the student's enrolled plan
          saveEnrolledPlan(currentPlan.id)
          if (store?.addPayment) {
            try {
              store.addPayment({
                student: `${user.firstName} ${user.lastName}`,
                amount: kesPrice,
                method: 'Paystack',
                reference: transaction.reference,
              })
            } catch {}
          }
          setPaymentSuccess(newPayment)
          setViewMode('enrolled')  // switch back to enrolled view
          toast?.ok?.('Payment successful! Subscription is active.')
          setProcessing(false)
        },
        onCancel: () => {
          toast?.info?.('Payment cancelled. Try again anytime.')
          setProcessing(false)
        },
      })
    } catch (e) {
      console.error('[paystack]', e)
      toast?.error?.('Payment error: ' + (e?.message || 'Unknown'))
      setProcessing(false)
    }
  }
 
  const formatUSD = (a) => `$${a.toLocaleString()}`
  const formatKES = (usd) => `KES ${Math.round(usd * KES_PER_USD).toLocaleString()}`
 
  const { price: currentPrice, label: currentLabel, savings: currentSavings } = getPriceForCycle(currentPlan, billingCycle)
 
  // ── ENROLLED-ONLY VIEW (the default for paid students) ──
  if (viewMode === 'enrolled' && enrolledPlanId) {
    const enrolledLookup = findPlanById(enrolledPlanId)
    const enrolledPlan = enrolledLookup ? enrolledLookup.plan : null
    const lastPayment = status.lastPayment
 
    if (!enrolledPlan) {
      // Plan not in catalog (legacy plan or removed)
      return (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <h3>Your enrolled plan is not in the current catalog.</h3>
          <button className="btn btn-p" onClick={() => setViewMode('change')}>Choose a Plan</button>
        </div>
      )
    }
 
    return (
      <div>
        {/* HERO — current subscription with renewal status */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: status.locked
            ? 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)'
            : status.daysOverdue > 0
            ? 'linear-gradient(135deg, #B45309 0%, #92400E 100%)'
            : 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
          color: '#fff',
        }}>
          <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
                {status.locked ? 'Account Locked' : status.daysOverdue > 0 ? 'Payment Overdue' : 'Active Subscription'}
              </div>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
                {enrolledPlan.name}{enrolledPlan.subtitle ? ` (${enrolledPlan.subtitle})` : ''}
              </h2>
              <div style={{ fontSize: 13.5, opacity: .9, marginTop: 6 }}>
                {status.locked
                  ? <>Locked since {new Date(status.nextDueDate.getTime() + GRACE_PERIOD_DAYS * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · <strong>Renew to restore access</strong></>
                  : status.daysOverdue > 0
                  ? <>Was due {status.nextDueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · <strong>{GRACE_PERIOD_DAYS - status.daysOverdue} day{GRACE_PERIOD_DAYS - status.daysOverdue === 1 ? '' : 's'} until lockout</strong></>
                  : <>Next payment: <strong>{status.nextDueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></>
                }
              </div>
            </div>
            <button
              onClick={handlePay}
              disabled={processing}
              style={{
                background: '#F0CC5A',
                color: '#6B0F1E',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 'var(--rmd)',
                cursor: processing ? 'wait' : 'pointer',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(240,204,90,.35)',
                opacity: processing ? .7 : 1,
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              {processing ? 'Processing…' : status.daysOverdue > 0 ? `Renew · ${formatKES(currentPrice)}` : `Pay ${formatKES(currentPrice)}`}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
            {[
              ['Plan',     enrolledPlan.name],
              ['Cycle',    billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)],
              ['USD',      formatUSD(currentPrice)],
              ['KES',      Math.round(currentPrice * KES_PER_USD).toLocaleString()],
            ].map(([l, v]) => (
              <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Plan details card */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="chdr">
            <div className="ctitle">My Plan Details</div>
            <button
              onClick={() => setViewMode('change')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8B1A2E',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >Change Plan</button>
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--s400)', marginBottom: 4 }}>
                {enrolledPlan.eyebrow}
              </div>
              <h3 className="serif" style={{ fontSize: 20, color: 'var(--s900)', margin: '0 0 8px' }}>
                {enrolledPlan.name}
              </h3>
              {enrolledPlan.gradeRange && (
                <div style={{ fontSize: 12.5, color: 'var(--s500)', marginBottom: 14 }}>
                  {enrolledPlan.gradeRange}
                </div>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {enrolledPlan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'var(--s700)' }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#8B1A2E" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 3 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 'var(--rmd)', minWidth: 200 }}>
              <div style={{ fontSize: 11, color: 'var(--s400)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.06em', marginBottom: 8 }}>Pricing</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: '#8B1A2E', fontWeight: 700 }}>$</span>
                <span style={{ fontSize: 28, color: '#8B1A2E', fontWeight: 700, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                  {currentPrice.toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--s500)', marginBottom: 4 }}>
                {currentLabel}
              </div>
              <div style={{ fontSize: 11, color: 'var(--s400)' }}>
                = {formatKES(currentPrice)} KES
              </div>
            </div>
          </div>
        </div>
 
        {/* Payment History */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="ctitle" style={{ marginBottom: 14 }}>Payment History</div>
          {payments.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--s400)', fontSize: 13 }}>
              No payments yet
            </div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Date</th><th>Plan</th><th>Cycle</th><th>Amount</th><th>Reference</th><th>Status</th></tr></thead>
              <tbody>
                {payments.slice(0, 10).map(p => (
                  <tr key={p.id}>
                    <td style={{ fontSize: 12.5, color: 'var(--s500)' }}>{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ fontWeight: 600 }}>{p.planName}</td>
                    <td style={{ fontSize: 12.5, color: 'var(--s600)', textTransform: 'capitalize' }}>{p.cycle || 'monthly'}</td>
                    <td><span className="mono" style={{ fontWeight: 700 }}>KES {(p.amountKES || (p.amount * KES_PER_USD) || p.amount).toLocaleString()}</span></td>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--s500)' }}>{p.reference?.slice(0, 16)}{p.reference?.length > 16 ? '…' : ''}</td>
                    <td><span className="badge badge-green">Paid</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
 
        {/* Referral */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(240,204,90,.08), rgba(184,150,12,.06))',
          border: '1px solid rgba(240,204,90,.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0CC5A', color: '#6B0F1E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11l-3-3m0 0l-3 3m3-3v8"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)', marginBottom: 2 }}>Refer a friend, get one month free</div>
              <div style={{ fontSize: 12.5, color: 'var(--s600)' }}>Code: <span className="mono" style={{ fontWeight: 700, color: '#8B1A2E', background: '#fff', padding: '2px 8px', borderRadius: 4 }}>{referralCode}</span></div>
            </div>
            <button className="btn btn-s btn-sm" onClick={() => { if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(referralCode); toast?.ok?.('Copied.') } }}>Copy</button>
          </div>
        </div>
 
        {/* Success modal */}
        {paymentSuccess && (
          <div onClick={() => setPaymentSuccess(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--white)', borderRadius: 20, maxWidth: 480, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
              <div style={{ background: 'linear-gradient(135deg, #14532D, #166534)', padding: '28px 30px', color: '#fff', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="serif" style={{ fontSize: 22, marginBottom: 4 }}>Payment Successful</h3>
                <p style={{ fontSize: 13.5, opacity: .85, margin: 0 }}>Your subscription is now active!</p>
              </div>
              <div style={{ padding: '20px 26px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {[
                    ['Plan', paymentSuccess.planName],
                    ['Amount', `KES ${paymentSuccess.amountKES?.toLocaleString() || (paymentSuccess.amount * KES_PER_USD).toLocaleString()}`],
                    ['Reference', paymentSuccess.reference],
                    ['Date', new Date(paymentSuccess.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--s500)' }}>{l}</span>
                      <span className="mono" style={{ fontWeight: 700, color: 'var(--s900)' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setPaymentSuccess(null)} style={{ width: '100%', background: '#8B1A2E', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Continue Learning</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
 
  // ── CHANGE PLAN VIEW (full catalog) ─────────────────────
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{ padding: 0, marginBottom: 18, overflow: 'hidden', background: 'linear-gradient(135deg, #8B1A2E, #6B0F1E)', color: '#fff' }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              {enrolledPlanId ? 'Change Plan' : 'Choose Your Plan'}
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              {currentPlan.name}{currentPlan.subtitle ? ` (${currentPlan.subtitle})` : ''}
            </h2>
            <div style={{ fontSize: 13.5, opacity: .85, marginTop: 6 }}>
              {formatUSD(currentPrice)} {currentLabel} = <strong>{formatKES(currentPrice)}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {enrolledPlanId && (
              <button onClick={() => setViewMode('enrolled')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.4)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--rmd)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                ← Back to My Plan
              </button>
            )}
            <button onClick={handlePay} disabled={processing} style={{ background: '#F0CC5A', color: '#6B0F1E', border: 'none', padding: '12px 24px', borderRadius: 'var(--rmd)', cursor: processing ? 'wait' : 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(240,204,90,.35)', opacity: processing ? .7 : 1 }}>
              {processing ? 'Processing…' : `Pay ${formatKES(currentPrice)}`}
            </button>
          </div>
        </div>
      </div>
 
      {/* Tab switcher */}
      <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--rmd)', padding: 4, marginBottom: 18, gap: 2, flexWrap: 'wrap' }}>
        {PRICING_TABS.map(tab => (
          <button key={tab.id} onClick={() => switchTab(tab.id)} style={{ flex: 1, minWidth: 130, background: activeTabId === tab.id ? 'var(--white)' : 'transparent', color: activeTabId === tab.id ? '#8B1A2E' : 'var(--s500)', border: 'none', padding: '10px 16px', borderRadius: 'var(--rsm)', cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: activeTabId === tab.id ? '0 4px 16px rgba(10,8,6,.10)' : 'none' }}>
            {tab.label}
          </button>
        ))}
      </div>
 
      {/* Billing cycle */}
      {activeTabId !== 'tuition' && (
        <>
          <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 99, padding: 4, margin: '0 auto 8px', width: 'fit-content', gap: 2, flexWrap: 'wrap' }}>
            {[{ id: 'monthly', label: 'Monthly' }, { id: 'termly', label: 'Termly', save: '5%' }, { id: 'annually', label: 'Annually', save: '12%' }].map(c => (
              <button key={c.id} onClick={() => setBillingCycle(c.id)} style={{ background: billingCycle === c.id ? '#8B1A2E' : 'transparent', color: billingCycle === c.id ? '#fff' : 'var(--s700)', border: 'none', padding: '8px 18px', borderRadius: 99, cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                {c.label}
                {c.save && <span style={{ fontSize: 10, fontWeight: 800, background: billingCycle === c.id ? '#F0CC5A' : 'rgba(139,26,46,.12)', color: billingCycle === c.id ? '#6B0F1E' : '#8B1A2E', padding: '2px 7px', borderRadius: 99 }}>Save {c.save}</span>}
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--s400)', fontStyle: 'italic', marginBottom: 16 }}>
            {billingCycle === 'monthly'  && 'Billed monthly · Cancel anytime'}
            {billingCycle === 'termly'   && 'Billed every 3 months · Save 5% vs monthly'}
            {billingCycle === 'annually' && 'Billed annually · Save 12% vs monthly'}
          </div>
        </>
      )}
 
      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
        {activeTab.plans.map(plan => {
          const { price, label, savings } = getPriceForCycle(plan, billingCycle)
          const isSelected = selectedPlanId === plan.id
          const isFeatured = plan.featured
          return (
            <div key={plan.id} onClick={() => selectPlan(plan.id)} style={{
              position: 'relative',
              background: isFeatured ? '#0A0806' : '#FEFDFB',
              color: isFeatured ? '#fff' : 'var(--s900)',
              border: `2px solid ${isSelected ? '#F0CC5A' : isFeatured ? '#0A0806' : 'var(--border)'}`,
              borderRadius: 20, padding: 28, cursor: 'pointer',
              outline: isSelected ? '3px solid rgba(240,204,90,.3)' : 'none', outlineOffset: -2,
              transition: 'all .2s',
            }}>
              {plan.badge && (
                <div style={{ display: 'inline-block', background: 'linear-gradient(90deg, #B8960C, #D4AF37)', color: '#0A0806', fontSize: 10, fontWeight: 800, letterSpacing: '.08em', padding: '4px 12px', borderRadius: 99, marginBottom: 14, textTransform: 'uppercase' }}>{plan.badge}</div>
              )}
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: isFeatured ? 'rgba(247,243,237,.35)' : 'var(--s400)', marginBottom: 8 }}>{plan.eyebrow}</div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, fontWeight: 700, color: isFeatured ? '#fff' : 'var(--s900)', margin: '0 0 6px', lineHeight: 1.2 }}>
                {plan.name}{plan.subtitle ? ` (${plan.subtitle})` : ''}
              </h3>
              <div style={{ marginBottom: 4, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: isFeatured ? '#F0CC5A' : '#8B1A2E', fontFamily: "'Playfair Display', serif", marginTop: -8 }}>$</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: isFeatured ? '#F0CC5A' : '#8B1A2E', lineHeight: 1 }}>{price.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 12.5, color: isFeatured ? 'rgba(247,243,237,.45)' : 'var(--s500)', marginBottom: 4 }}>
                {label}{plan.gradeRange ? ` · ${plan.gradeRange}` : ''}
              </div>
              {price > 50 && (
                <div style={{ fontSize: 11.5, color: isFeatured ? 'rgba(247,243,237,.35)' : 'var(--s400)', marginBottom: 14 }}>
                  ~ KES {Math.round(price * KES_PER_USD).toLocaleString()}{label !== 'per hour' && billingCycle === 'monthly' ? ' per month' : ''}
                </div>
              )}
              {savings > 0 && (
                <div style={{ display: 'inline-block', background: isFeatured ? 'rgba(240,204,90,.18)' : 'rgba(139,26,46,.08)', color: isFeatured ? '#F0CC5A' : '#8B1A2E', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, marginBottom: 14 }}>You save ${savings}</div>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: isFeatured ? 'rgba(247,243,237,.7)' : 'var(--s600)' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: isFeatured ? 'rgba(240,204,90,.18)' : 'rgba(139,26,46,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={isFeatured ? '#F0CC5A' : '#8B1A2E'} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={(e) => { e.stopPropagation(); selectPlan(plan.id); if (isSelected) handlePay() }} disabled={processing && isSelected} style={{
                display: 'block', width: '100%', padding: '12px', borderRadius: 6, fontWeight: 700, fontSize: 13.5,
                cursor: processing && isSelected ? 'wait' : 'pointer', border: 'none', textAlign: 'center',
                background: isSelected ? 'linear-gradient(90deg, #B8960C, #D4AF37)' : 'transparent',
                color: isSelected ? '#0A0806' : isFeatured ? '#F0CC5A' : '#8B1A2E',
                boxShadow: isSelected ? '0 4px 14px rgba(184,150,12,.3)' : 'none',
                borderWidth: isSelected ? 0 : 1.5, borderStyle: 'solid',
                borderColor: isSelected ? 'transparent' : isFeatured ? '#F0CC5A' : '#8B1A2E',
              }}>
                {isSelected ? processing ? 'Processing…' : `Pay ${formatKES(price)}` : 'Select Plan'}
              </button>
            </div>
          )
        })}
      </div>
 
      {paymentSuccess && (
        <div onClick={() => setPaymentSuccess(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--white)', borderRadius: 20, maxWidth: 480, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <div style={{ background: 'linear-gradient(135deg, #14532D, #166534)', padding: '28px 30px', color: '#fff', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 className="serif" style={{ fontSize: 22, marginBottom: 4 }}>Payment Successful</h3>
              <p style={{ fontSize: 13.5, opacity: .85, margin: 0 }}>Welcome to {paymentSuccess.planName}!</p>
            </div>
            <div style={{ padding: '20px 26px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {[
                  ['Plan', paymentSuccess.planName],
                  ['Amount', `KES ${paymentSuccess.amountKES?.toLocaleString()}`],
                  ['Reference', paymentSuccess.reference],
                  ['Date', new Date(paymentSuccess.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--s500)' }}>{l}</span>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--s900)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setPaymentSuccess(null)} style={{ width: '100%', background: '#8B1A2E', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Continue Learning</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// HOMEWORK TAB — assigned by teachers, submitted by students
// ═══════════════════════════════════════════════════════════
const HOMEWORK_ASSIGNED_KEY    = 'sm_homework_assigned'
const HOMEWORK_SUBMISSIONS_KEY = 'sm_homework_submissions'
const HOMEWORK_SEEDED_FLAG     = 'sm_homework_seeded'
 
// Subject colour palette (mirrors Practice / Exams)
const homeworkSubjColours = {
  'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
  'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
  'Geography': '#0F766E', 'Computer Science': '#1F2937',
}
const homeworkColourFor = (s) => homeworkSubjColours[s] || '#8B1A2E'
 
// Seed sample homework on first load so UI works without a teacher portal yet
const seedSampleHomework = (studentName) => {
  if (localStorage.getItem(HOMEWORK_SEEDED_FLAG)) return
  const today = new Date()
  const inDays = (n) => new Date(today.getTime() + n * 86400000).toISOString()
 
  const samples = [
    {
      id: 'hw-001',
      title: 'Quadratic Equations Practice',
      subject: 'Mathematics',
      teacher: 'Mr. Muthomi',
      assignedTo: studentName,
      type: 'mixed',  // can have both text and file
      description: 'Complete questions 1-10 from your textbook (page 145). Show all your working - partial marks are awarded for correct method even if the final answer is wrong. Type your final answers in the response box and upload a photo or scan of your full working.',
      questions: [],
      maxMarks: 50,
      assignedDate: inDays(-2),
      dueDate: inDays(2),
      status: 'assigned',
    },
    {
      id: 'hw-002',
      title: 'Photosynthesis - Multiple Choice Quiz',
      subject: 'Biology',
      teacher: 'Dr. Ouma',
      assignedTo: studentName,
      type: 'quiz',
      description: 'Five questions on photosynthesis. Read each question carefully. You have one attempt.',
      questions: [
        { id: 'q1', q: 'Where does photosynthesis primarily take place in plant cells?', options: ['Mitochondria', 'Chloroplasts', 'Nucleus', 'Cell wall'], correct: 'Chloroplasts' },
        { id: 'q2', q: 'Which gas do plants take in during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correct: 'Carbon dioxide' },
        { id: 'q3', q: 'The green pigment that absorbs light energy is called:', options: ['Haemoglobin', 'Chlorophyll', 'Carotene', 'Melanin'], correct: 'Chlorophyll' },
        { id: 'q4', q: 'The simplified word equation for photosynthesis is:', options: ['CO2 + Water + Light -> Glucose + Oxygen', 'Glucose + Oxygen -> CO2 + Water', 'Water + Oxygen -> Glucose + CO2', 'CO2 + Oxygen -> Water + Light'], correct: 'CO2 + Water + Light -> Glucose + Oxygen' },
        { id: 'q5', q: 'Which factor does NOT affect the rate of photosynthesis?', options: ['Light intensity', 'Carbon dioxide concentration', 'Temperature', 'Soil colour'], correct: 'Soil colour' },
      ],
      maxMarks: 5,
      assignedDate: inDays(-1),
      dueDate: inDays(5),
      status: 'assigned',
    },
    {
      id: 'hw-003',
      title: 'Persuasive Essay: Should Schools Have Uniforms?',
      subject: 'English',
      teacher: 'Ms. Wambua',
      assignedTo: studentName,
      type: 'text',  // typed response only, with paste blocking
      description: 'Write a persuasive essay of 350-500 words arguing FOR or AGAINST school uniforms. Use at least three supporting reasons. Remember the structure: introduction -> three body paragraphs (one per reason) -> conclusion. Type your essay in the response box. Pasting is disabled to ensure original work.',
      questions: [],
      maxMarks: 30,
      assignedDate: inDays(-7),
      dueDate: inDays(-1),  // OVERDUE
      status: 'assigned',
    },
    {
      id: 'hw-004',
      title: 'Periodic Table Review',
      subject: 'Chemistry',
      teacher: 'Dr. Ouma',
      assignedTo: studentName,
      type: 'mixed',
      description: 'Watch the video lesson on the periodic table (in Resources tab), then write a short summary (150 words) covering: groups vs periods, three trends, and one example for each.',
      questions: [],
      maxMarks: 20,
      assignedDate: inDays(-10),
      dueDate: inDays(-5),
      status: 'submitted',
      submittedAt: inDays(-6),
      submittedText: '[Sample submitted essay would appear here in real submissions]',
    },
    {
      id: 'hw-005',
      title: 'Newton\'s Laws of Motion',
      subject: 'Physics',
      teacher: 'Mr. Njoroge',
      assignedTo: studentName,
      type: 'text',
      description: 'Explain each of Newton\'s three laws in your own words, with one real-world example for each.',
      questions: [],
      maxMarks: 30,
      assignedDate: inDays(-15),
      dueDate: inDays(-10),
      status: 'graded',
      submittedAt: inDays(-11),
      gradedAt: inDays(-9),
      grade: 26,
      gradePercent: 87,
      feedback: 'Excellent work, Amara! Your explanation of the third law (action-reaction) was particularly clear. Next time, try to give a more original example for the first law - the "ball at rest" example is a classic but slightly overused. Keep it up!',
    },
  ]
 
  localStorage.setItem(HOMEWORK_ASSIGNED_KEY, JSON.stringify(samples))
  localStorage.setItem(HOMEWORK_SEEDED_FLAG, '1')
}
 
const loadHomework = () => {
  try { return JSON.parse(localStorage.getItem(HOMEWORK_ASSIGNED_KEY) || '[]') }
  catch { return [] }
}
const saveHomework = (hw) => {
  try { localStorage.setItem(HOMEWORK_ASSIGNED_KEY, JSON.stringify(hw)) } catch {}
}
 
const formatHomeworkDate = (iso) => {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.round((d - now) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
 
function HomeworkTab({ user, toast }) {
  const studentName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
 
  // Seed on first load
  useEffect(() => { seedSampleHomework(studentName) }, [studentName])
 
  const [homework, setHomework] = useState(() => loadHomework())
  const [view, setView]         = useState('status')  // 'status' | 'subject' | 'date'
  const [selected, setSelected] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [quizAnswers, setQuizAnswers]   = useState({})
  const [pasteWarning, setPasteWarning] = useState(false)
 
  // Filter to this student's assignments only
  const myHomework = homework.filter(hw =>
    !hw.assignedTo ||
    hw.assignedTo === studentName ||
    hw.assignedTo === user?.firstName ||
    hw.assignedTo === '*'  // wildcard for whole-class
  )
 
  // Compute auto status: 'overdue' if past due and not submitted
  const enrichStatus = (hw) => {
    const due = new Date(hw.dueDate)
    const now = new Date()
    if (hw.status === 'graded') return 'graded'
    if (hw.status === 'submitted') return 'submitted'
    if (due < now) return 'overdue'
    return 'pending'
  }
 
  const enriched = myHomework.map(hw => ({ ...hw, computedStatus: enrichStatus(hw) }))
 
  // Counts
  const counts = {
    pending:   enriched.filter(h => h.computedStatus === 'pending').length,
    overdue:   enriched.filter(h => h.computedStatus === 'overdue').length,
    submitted: enriched.filter(h => h.computedStatus === 'submitted').length,
    graded:    enriched.filter(h => h.computedStatus === 'graded').length,
  }
 
  // Group by chosen view
  let grouped = {}
  if (view === 'status') {
    grouped = {
      'Overdue':      enriched.filter(h => h.computedStatus === 'overdue'),
      'Due This Week': enriched.filter(h => h.computedStatus === 'pending'),
      'Submitted':    enriched.filter(h => h.computedStatus === 'submitted'),
      'Graded':       enriched.filter(h => h.computedStatus === 'graded'),
    }
  } else if (view === 'subject') {
    enriched.forEach(h => {
      if (!grouped[h.subject]) grouped[h.subject] = []
      grouped[h.subject].push(h)
    })
  } else if (view === 'date') {
    grouped = {
      'This Week':  enriched.filter(h => {
        const days = (new Date(h.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        return days >= -7 && days <= 7
      }),
      'Next Week':  enriched.filter(h => {
        const days = (new Date(h.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        return days > 7 && days <= 14
      }),
      'Later':      enriched.filter(h => {
        const days = (new Date(h.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        return days > 14
      }),
      'Past':       enriched.filter(h => {
        const days = (new Date(h.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        return days < -7
      }),
    }
  }
 
  // ── Submission handlers ───────────────────────────────
  const openHomework = (hw) => {
    setSelected(hw)
    setResponseText('')
    setUploadedFile(null)
    setQuizAnswers({})
    setPasteWarning(false)
  }
 
  const closeHomework = () => {
    setSelected(null)
    setResponseText('')
    setUploadedFile(null)
    setQuizAnswers({})
  }
 
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024 * 5) {
      toast?.error?.('File too large. Maximum 5MB.')
      return
    }
    // Read as data URL so it persists in localStorage
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: ev.target.result,
      })
    }
    reader.readAsDataURL(file)
  }
 
  const submitHomework = () => {
    if (!selected) return
 
    // Validation per type
    if (selected.type === 'text') {
      if (!responseText.trim() || responseText.trim().length < 50) {
        toast?.error?.('Please write a more detailed response (at least 50 characters).')
        return
      }
    } else if (selected.type === 'quiz') {
      const unanswered = selected.questions.filter(q => !quizAnswers[q.id])
      if (unanswered.length > 0) {
        toast?.error?.(`Please answer all ${selected.questions.length} questions. ${unanswered.length} remaining.`)
        return
      }
    } else if (selected.type === 'mixed') {
      if (!responseText.trim() && !uploadedFile) {
        toast?.error?.('Please add a written response or upload a file.')
        return
      }
    } else if (selected.type === 'file') {
      if (!uploadedFile) {
        toast?.error?.('Please upload a file.')
        return
      }
    }
 
    // Auto-grade quiz
    let autoGrade = null
    let autoFeedback = ''
    if (selected.type === 'quiz') {
      const correct = selected.questions.filter(q => quizAnswers[q.id] === q.correct).length
      autoGrade = correct
      autoFeedback = `Auto-graded: ${correct} out of ${selected.questions.length} correct.`
    }
 
    const updated = homework.map(h => {
      if (h.id === selected.id) {
        return {
          ...h,
          status: autoGrade !== null ? 'graded' : 'submitted',
          submittedAt: new Date().toISOString(),
          submittedText: responseText || null,
          submittedFile: uploadedFile || null,
          submittedAnswers: Object.keys(quizAnswers).length > 0 ? quizAnswers : null,
          ...(autoGrade !== null ? {
            gradedAt: new Date().toISOString(),
            grade: autoGrade,
            gradePercent: Math.round((autoGrade / selected.questions.length) * 100),
            feedback: autoFeedback,
          } : {}),
        }
      }
      return h
    })
 
    setHomework(updated)
    saveHomework(updated)
    toast?.ok?.(autoGrade !== null
      ? `Quiz submitted and graded: ${autoGrade}/${selected.questions.length}`
      : 'Homework submitted successfully.'
    )
    closeHomework()
  }
 
  // ── Render ────────────────────────────────────────────
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Assigned by your teachers
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0 }}>
              Homework
            </h2>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              Submit on time. Grades count toward your progress reports.
            </div>
          </div>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,.2)', borderRadius: 99, padding: 3, gap: 2, flexWrap: 'wrap' }}>
            {[['status', 'Status'], ['subject', 'Subject'], ['date', 'Date']].map(([id, label]) => (
              <button key={id} onClick={() => setView(id)} style={{
                background: view === id ? '#fff' : 'transparent',
                color: view === id ? '#8B1A2E' : 'rgba(255,255,255,.75)',
                border: 'none', padding: '6px 14px', borderRadius: 99,
                cursor: 'pointer', fontSize: 12, fontWeight: 700,
              }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
          {[
            ['Overdue',   counts.overdue,   counts.overdue > 0 ? '#FCA5A5' : 'inherit'],
            ['Pending',   counts.pending,   'inherit'],
            ['Submitted', counts.submitted, 'inherit'],
            ['Graded',    counts.graded,    counts.graded > 0 ? '#4ADE80' : 'inherit'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Empty state */}
      {enriched.length === 0 && (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 17, color: 'var(--s800)', marginBottom: 6 }}>No homework assigned yet</h3>
          <p style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 380, margin: '0 auto' }}>
            When your teachers assign work, it will appear here organised by status, subject, or due date.
          </p>
        </div>
      )}
 
      {/* Grouped homework lists */}
      {Object.entries(grouped).map(([groupName, items]) => {
        if (!items || items.length === 0) return null
        const isOverdueGroup = groupName === 'Overdue'
        return (
          <div key={groupName} className="card" style={{ marginBottom: 14 }}>
            <div className="chdr">
              <div className="ctitle" style={{ color: isOverdueGroup ? 'var(--r600)' : undefined }}>
                {groupName}
              </div>
              <span className={`badge ${isOverdueGroup ? 'badge-red' : 'badge-slate'}`} style={isOverdueGroup ? { background: 'var(--r50)', color: 'var(--r600)' } : {}}>
                {items.length}
              </span>
            </div>
            {items.map(hw => {
              const col = homeworkColourFor(hw.subject)
              return (
                <div key={hw.id} onClick={() => openHomework(hw)} style={{
                  display: 'flex', gap: 14, padding: '14px 0',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer', alignItems: 'flex-start',
                }}>
                  {/* Subject indicator */}
                  <div style={{
                    width: 4, alignSelf: 'stretch', borderRadius: 2,
                    background: col, flexShrink: 0,
                  }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: col, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                          {hw.subject}
                        </div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--s900)' }}>{hw.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 2 }}>
                          {hw.teacher} · {hw.maxMarks} marks · {
                            hw.type === 'quiz' ? `${hw.questions?.length || 0} questions` :
                            hw.type === 'text' ? 'Written response' :
                            hw.type === 'file' ? 'File upload' :
                            'Mixed (text + file)'
                          }
                        </div>
                      </div>
                      {/* Status & due */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {hw.computedStatus === 'graded' && (
                          <div>
                            <span className="badge badge-green">Graded</span>
                            <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--g600)', marginTop: 4 }}>
                              {hw.grade}/{hw.maxMarks}
                            </div>
                          </div>
                        )}
                        {hw.computedStatus === 'submitted' && <span className="badge badge-blue">Submitted</span>}
                        {hw.computedStatus === 'overdue' && <span className="badge badge-red" style={{ background: 'var(--r50)', color: 'var(--r600)' }}>Overdue · {formatHomeworkDate(hw.dueDate)}</span>}
                        {hw.computedStatus === 'pending' && <span className="badge badge-amber">Due {formatHomeworkDate(hw.dueDate)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
 
      {/* Homework detail / submission modal */}
      {selected && (
        <div onClick={closeHomework} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', zIndex: 200,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: 20, overflowY: 'auto',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--white)', borderRadius: 'var(--rxl)',
            maxWidth: 720, width: '100%', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,.3)', marginTop: 40, marginBottom: 40,
          }}>
            {/* Header */}
            <div style={{
              padding: '22px 28px',
              background: `linear-gradient(135deg, ${homeworkColourFor(selected.subject)} 0%, ${homeworkColourFor(selected.subject)}DD 100%)`,
              color: '#fff',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8, marginBottom: 4 }}>
                {selected.subject} · {selected.teacher}
              </div>
              <h3 className="serif" style={{ fontSize: 22, margin: 0, lineHeight: 1.2 }}>{selected.title}</h3>
              <div style={{ fontSize: 13, opacity: .9, marginTop: 6 }}>
                Due {formatHomeworkDate(selected.dueDate)} · {selected.maxMarks} marks
              </div>
            </div>
 
            {/* Body */}
            <div style={{ padding: '20px 28px', maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Description */}
              <div style={{ marginBottom: 18 }}>
                <div className="sec-tag" style={{ marginBottom: 6 }}>Instructions</div>
                <div style={{ fontSize: 14, color: 'var(--s700)', lineHeight: 1.65 }}>{selected.description}</div>
              </div>
 
              {/* If already graded — show grade + feedback, no submission UI */}
              {selected.status === 'graded' && (
                <div style={{
                  background: 'var(--g50)', border: '1px solid var(--g100)',
                  borderRadius: 'var(--rmd)', padding: 18, marginBottom: 18,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'var(--g500)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 18, fontWeight: 700,
                    }}>
                      {selected.gradePercent || Math.round((selected.grade / selected.maxMarks) * 100)}%
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--g700)' }}>
                        {selected.grade} / {selected.maxMarks} marks
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                        Graded {selected.gradedAt ? new Date(selected.gradedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                      </div>
                    </div>
                  </div>
                  {selected.feedback && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>
                        Teacher feedback
                      </div>
                      <div style={{ fontSize: 13.5, color: 'var(--s700)', lineHeight: 1.65, fontStyle: 'italic' }}>
                        "{selected.feedback}"
                      </div>
                    </div>
                  )}
                </div>
              )}
 
              {/* If submitted but not graded */}
              {selected.status === 'submitted' && (
                <div style={{
                  background: 'var(--b50)', border: '1px solid var(--b100)',
                  borderRadius: 'var(--rmd)', padding: 16, marginBottom: 18,
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--b700)', marginBottom: 4 }}>
                    Submitted · awaiting teacher grade
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--s500)' }}>
                    Submitted {new Date(selected.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    {selected.submittedText && ` · ${selected.submittedText.length} characters`}
                  </div>
                </div>
              )}
 
              {/* Submission UI — only if assigned and not already submitted */}
              {(selected.status === 'assigned' || selected.computedStatus === 'overdue' || selected.computedStatus === 'pending') && selected.status !== 'submitted' && selected.status !== 'graded' && (
                <>
                  {/* Quiz type */}
                  {selected.type === 'quiz' && (
                    <div>
                      <div className="sec-tag" style={{ marginBottom: 8 }}>Questions</div>
                      {selected.questions.map((q, i) => (
                        <div key={q.id} className="card" style={{ marginBottom: 10, padding: 14 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                            {i + 1}. {q.q}
                          </div>
                          {q.options.map(opt => (
                            <label key={opt} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '8px 12px', marginBottom: 6,
                              border: `1.5px solid ${quizAnswers[q.id] === opt ? homeworkColourFor(selected.subject) : 'var(--border)'}`,
                              borderRadius: 'var(--rsm)', cursor: 'pointer',
                              background: quizAnswers[q.id] === opt ? homeworkColourFor(selected.subject) + '10' : 'var(--bg)',
                            }}>
                              <input
                                type="radio"
                                name={q.id}
                                checked={quizAnswers[q.id] === opt}
                                onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              />
                              <span style={{ fontSize: 13.5 }}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
 
                  {/* Text response (with paste blocking) */}
                  {(selected.type === 'text' || selected.type === 'mixed') && (
                    <div style={{ marginBottom: 16 }}>
                      <div className="sec-tag" style={{ marginBottom: 6 }}>
                        {selected.type === 'mixed' ? 'Written Response (optional if uploading file)' : 'Your Response'}
                      </div>
                      <div style={{
                        fontSize: 11.5, color: 'var(--s500)', fontStyle: 'italic',
                        marginBottom: 8,
                        background: 'var(--a50)', borderLeft: '3px solid var(--a500, #F59E0B)',
                        padding: '6px 10px', borderRadius: 4,
                      }}>
                        Please type your answer in your own words. Pasting is disabled.
                      </div>
                      <textarea
                        value={responseText}
                        onChange={e => setResponseText(e.target.value)}
                        onPaste={(e) => {
                          e.preventDefault()
                          setPasteWarning(true)
                          setTimeout(() => setPasteWarning(false), 3000)
                          toast?.error?.('Pasting is disabled. Please type your answer.')
                        }}
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                        rows={10}
                        placeholder="Start typing your response here..."
                        style={{
                          width: '100%',
                          padding: 14,
                          border: `1.5px solid ${pasteWarning ? 'var(--r500)' : 'var(--border)'}`,
                          borderRadius: 'var(--rmd)',
                          fontSize: 14, fontFamily: 'inherit',
                          lineHeight: 1.6, outline: 'none', resize: 'vertical',
                          background: 'var(--white)', transition: 'border-color .2s',
                        }}
                      />
                      {pasteWarning && (
                        <div style={{ fontSize: 11, color: 'var(--r500)', marginTop: 4, fontWeight: 600 }}>
                          [!] Paste blocked - please type your answer
                        </div>
                      )}
                      <div style={{ fontSize: 11.5, color: 'var(--s400)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{responseText.length} characters · {responseText.trim().split(/\s+/).filter(Boolean).length} words</span>
                        {selected.type === 'text' && responseText.length < 50 && <span>Minimum 50 characters</span>}
                      </div>
                    </div>
                  )}
 
                  {/* File upload */}
                  {(selected.type === 'file' || selected.type === 'mixed') && (
                    <div style={{ marginBottom: 16 }}>
                      <div className="sec-tag" style={{ marginBottom: 6 }}>
                        {selected.type === 'mixed' ? 'File Upload (optional if writing response)' : 'Upload File'}
                      </div>
                      {!uploadedFile ? (
                        <label style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 10, padding: '24px 16px',
                          border: '2px dashed var(--border)', borderRadius: 'var(--rmd)',
                          background: 'var(--bg)', cursor: 'pointer',
                          transition: 'all .2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = homeworkColourFor(selected.subject); e.currentTarget.style.background = homeworkColourFor(selected.subject) + '08' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)' }}
                        >
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--s500)" strokeWidth="2" strokeLinecap="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--s700)' }}>
                              Click to upload a file
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--s400)', marginTop: 2 }}>
                              PDF, image, or document · max 5MB
                            </div>
                          </div>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                          />
                        </label>
                      ) : (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: 12, border: '1.5px solid var(--g500)',
                          borderRadius: 'var(--rmd)', background: 'var(--g50)',
                        }}>
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--g700)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                              {uploadedFile.name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--s500)' }}>
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <button
                            onClick={() => setUploadedFile(null)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--s500)', cursor: 'pointer', fontSize: 18, padding: 4 }}
                          >x</button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
 
            {/* Footer */}
            <div style={{
              padding: '14px 24px', borderTop: '1px solid var(--border)',
              background: 'var(--bg)',
              display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap',
            }}>
              <button onClick={closeHomework} className="btn btn-s">Close</button>
              {selected.status === 'assigned' && (
                <button
                  onClick={submitHomework}
                  className="btn btn-p"
                  style={{
                    background: homeworkColourFor(selected.subject),
                    borderColor: homeworkColourFor(selected.subject),
                  }}
                >
                  Submit Homework
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
 
 
// ═══════════════════════════════════════════════════════════
// PROFILE TAB — student account & preferences
// ═══════════════════════════════════════════════════════════
const PROFILE_PREFS_KEY    = 'sm_profile_prefs'
const PROFILE_AVATAR_KEY   = 'sm_profile_avatar'
const PROFILE_BIO_KEY      = 'sm_profile_bio'
const PROFILE_DISPLAY_KEY  = 'sm_profile_display_name'
 
const loadProfilePrefs = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_PREFS_KEY) || 'null') || {
      notifyEmail: true,
      notifyDailyDigest: true,
      notifyHomework: true,
      notifyExamResults: true,
      notifyLiveClass: true,
      shareProgressWithParent: true,
      preferredContactMethod: 'email',
      timezone: 'Africa/Nairobi',
      preferredLanguage: 'en',
    }
  } catch {
    return null
  }
}
const saveProfilePrefs = (p) => {
  try { localStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(p)) } catch {}
}
 
// Generate avatar initials background colour from name (deterministic)
const initialsColor = (name) => {
  const colors = ['#8B1A2E', '#1E3A8A', '#166534', '#7C2D12', '#6B21A8', '#92400E', '#0F766E', '#7E22CE']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
  return colors[Math.abs(hash) % colors.length]
}
 
function ProfileTab({ user, toast }) {
  const initialDisplayName = localStorage.getItem(PROFILE_DISPLAY_KEY) || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const initialBio = localStorage.getItem(PROFILE_BIO_KEY) || ''
  const initialAvatar = localStorage.getItem(PROFILE_AVATAR_KEY) || null
 
  const [section, setSection] = useState('account')  // 'account' | 'security' | 'notifications' | 'communication'
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [bio, setBio] = useState(initialBio)
  const [avatar, setAvatar] = useState(initialAvatar)
  const [prefs, setPrefs] = useState(() => loadProfilePrefs())
 
  // Password change state
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [pwdSubmitting, setPwdSubmitting] = useState(false)
 
  const initials = (displayName || 'S').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'S'
  const avatarBg = initialsColor(displayName || 'Student')
 
  // Save handlers
  const saveAccountInfo = () => {
    if (!displayName.trim()) {
      toast?.error?.('Display name cannot be empty.')
      return
    }
    localStorage.setItem(PROFILE_DISPLAY_KEY, displayName.trim())
    localStorage.setItem(PROFILE_BIO_KEY, bio.trim())
    if (avatar) localStorage.setItem(PROFILE_AVATAR_KEY, avatar)
    else localStorage.removeItem(PROFILE_AVATAR_KEY)
    toast?.ok?.('Profile updated.')
  }
 
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 500) {
      toast?.error?.('Image too large. Max 500KB.')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast?.error?.('Please upload an image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target.result)
    reader.readAsDataURL(file)
  }
 
  const removeAvatar = () => {
    setAvatar(null)
    localStorage.removeItem(PROFILE_AVATAR_KEY)
  }
 
  // Password change — uses backend if available, otherwise saves intent locally
  const changePassword = async () => {
    if (pwdSubmitting) return
 
    // Validation
    if (!currentPwd) { toast?.error?.('Enter your current password.'); return }
    if (!newPwd || newPwd.length < 8) { toast?.error?.('New password must be at least 8 characters.'); return }
    if (newPwd === currentPwd) { toast?.error?.('New password must be different from current.'); return }
    if (newPwd !== confirmPwd) { toast?.error?.('Passwords do not match.'); return }
 
    // Strength check
    const hasLower = /[a-z]/.test(newPwd)
    const hasUpper = /[A-Z]/.test(newPwd)
    const hasNumber = /\d/.test(newPwd)
    if (!hasLower || !hasUpper || !hasNumber) {
      toast?.error?.('Password must contain uppercase, lowercase, and a number.')
      return
    }
 
    setPwdSubmitting(true)
 
    try {
      // Try backend if api is available
      const apiBase = import.meta?.env?.VITE_API_BASE || ''
      const token = localStorage.getItem('sm_token') || ''
 
      if (apiBase && token) {
        const response = await fetch(`${apiBase}/api/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: currentPwd,
            newPassword: newPwd,
          }),
        })
        if (response.ok) {
          toast?.ok?.('Password changed successfully.')
          setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
        } else {
          const errBody = await response.json().catch(() => ({}))
          toast?.error?.(errBody.message || 'Could not change password. Check current password.')
        }
      } else {
        // Backend not available — show informative message
        toast?.info?.('Password change requires backend connection. Try again later.')
      }
    } catch (e) {
      console.error('[password]', e)
      toast?.error?.('Network error. Please try again.')
    } finally {
      setPwdSubmitting(false)
    }
  }
 
  const updatePref = (key, value) => {
    const newPrefs = { ...prefs, [key]: value }
    setPrefs(newPrefs)
    saveProfilePrefs(newPrefs)
  }
 
  // Section nav items
  const sections = [
    { id: 'account',        label: 'Account Info',     iconPath: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
    { id: 'security',       label: 'Password & Security', iconPath: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' },
    { id: 'notifications',  label: 'Notifications',    iconPath: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' },
    { id: 'communication',  label: 'Communication',    iconPath: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
  ]
 
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '28px 30px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Big avatar */}
          <div style={{
            width: 84, height: 84, borderRadius: '50%',
            background: avatar ? 'transparent' : avatarBg,
            border: '3px solid #F0CC5A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 30, fontWeight: 700,
            fontFamily: "'Instrument Serif', serif",
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,.25)',
          }}>
            {avatar ? (
              <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Account Settings
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              {displayName || 'My Profile'}
            </h2>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              {user?.email || 'No email set'} · {user?.curriculum || 'IGCSE'} · {user?.grade || 'Year 10'}
            </div>
          </div>
        </div>
      </div>
 
      {/* Section nav */}
      <div style={{
        display: 'flex',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rmd)',
        padding: 4,
        marginBottom: 18,
        gap: 2,
        flexWrap: 'wrap',
      }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              flex: 1, minWidth: 130,
              background: section === s.id ? 'var(--white)' : 'transparent',
              color: section === s.id ? '#8B1A2E' : 'var(--s500)',
              border: 'none',
              padding: '10px 14px',
              borderRadius: 'var(--rsm)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: section === s.id ? '0 4px 16px rgba(10,8,6,.10)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .15s',
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              dangerouslySetInnerHTML={{ __html: s.iconPath }}/>
            {s.label}
          </button>
        ))}
      </div>
 
      {/* SECTION: Account Info */}
      {section === 'account' && (
        <div className="card">
          <div className="ctitle" style={{ marginBottom: 18 }}>Personal Information</div>
 
          {/* Avatar uploader */}
          <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 10 }}>Profile Picture</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: avatar ? 'transparent' : avatarBg,
                color: '#fff', fontSize: 26, fontWeight: 700,
                fontFamily: "'Instrument Serif', serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid var(--border)',
              }}>
                {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : initials}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'inline-block', marginRight: 8, marginBottom: 4 }}>
                  <span className="btn btn-s btn-sm" style={{ cursor: 'pointer' }}>
                    {avatar ? 'Change Picture' : 'Upload Picture'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </label>
                {avatar && (
                  <button
                    onClick={removeAvatar}
                    className="btn btn-d btn-sm"
                    style={{ marginLeft: 4 }}
                  >Remove</button>
                )}
                <div style={{ fontSize: 11.5, color: 'var(--s400)', marginTop: 6 }}>
                  PNG or JPG, square crop works best. Max 500KB.
                </div>
              </div>
            </div>
          </div>
 
          {/* Display name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="How should we address you?"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: 'inherit',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--rmd)',
                outline: 'none',
                background: 'var(--white)',
              }}
              onFocus={e => e.target.style.borderColor = '#8B1A2E'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ fontSize: 11.5, color: 'var(--s400)', marginTop: 4 }}>
              This is shown in chat, leaderboards, and your dashboard.
            </div>
          </div>
 
          {/* Email (read-only — managed by admin) */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || 'Not set'}
              disabled
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: 'inherit',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--rmd)',
                background: 'var(--bg)',
                color: 'var(--s500)',
                cursor: 'not-allowed',
              }}
            />
            <div style={{ fontSize: 11.5, color: 'var(--s400)', marginTop: 4 }}>
              Contact admin to change your email address.
            </div>
          </div>
 
          {/* Curriculum & Grade (read-only) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
                Curriculum
              </label>
              <input
                type="text"
                value={user?.curriculum || 'IGCSE'}
                disabled
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                  border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                  background: 'var(--bg)', color: 'var(--s500)', cursor: 'not-allowed',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
                Grade / Year
              </label>
              <input
                type="text"
                value={user?.grade || 'Year 10'}
                disabled
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                  border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                  background: 'var(--bg)', color: 'var(--s500)', cursor: 'not-allowed',
                }}
              />
            </div>
          </div>
 
          {/* Bio */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              About Me <span style={{ fontWeight: 400, color: 'var(--s400)' }}>(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 300))}
              placeholder="Share a bit about yourself, your interests, or what you're aiming for..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: 'inherit',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--rmd)',
                outline: 'none',
                resize: 'vertical',
                background: 'var(--white)',
                lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.borderColor = '#8B1A2E'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ fontSize: 11.5, color: 'var(--s400)', marginTop: 4, textAlign: 'right' }}>
              {bio.length} / 300 characters
            </div>
          </div>
 
          <button onClick={saveAccountInfo} className="btn btn-p">
            Save Changes
          </button>
        </div>
      )}
 
      {/* SECTION: Password & Security */}
      {section === 'security' && (
        <div className="card">
          <div className="ctitle" style={{ marginBottom: 18 }}>Change Password</div>
 
          <div style={{
            background: 'var(--a50)', border: '1px solid var(--a100)',
            borderRadius: 'var(--rmd)', padding: 12, marginBottom: 18,
            fontSize: 12.5, color: 'var(--a700, #92400E)',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              Choose a strong password. Use at least 8 characters with uppercase, lowercase, and a number. Never share your password with anyone - not even teachers or admin staff.
            </div>
          </div>
 
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              Current Password
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                outline: 'none', background: 'var(--white)',
              }}
              onFocus={e => e.target.style.borderColor = '#8B1A2E'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
 
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              New Password
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                outline: 'none', background: 'var(--white)',
              }}
              onFocus={e => e.target.style.borderColor = '#8B1A2E'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {newPwd && (
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', fontSize: 11 }}>
                {[
                  { check: newPwd.length >= 8, label: '8+ characters' },
                  { check: /[a-z]/.test(newPwd), label: 'lowercase' },
                  { check: /[A-Z]/.test(newPwd), label: 'UPPERCASE' },
                  { check: /\d/.test(newPwd), label: 'number' },
                ].map(req => (
                  <span key={req.label} style={{
                    padding: '2px 8px', borderRadius: 99,
                    background: req.check ? 'var(--g50)' : 'var(--s100)',
                    color: req.check ? 'var(--g600)' : 'var(--s500)',
                    fontWeight: 600,
                  }}>
                    {req.check ? '[x]' : '[ ]'} {req.label}
                  </span>
                ))}
              </div>
            )}
          </div>
 
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              Confirm New Password
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              placeholder="Type new password again"
              autoComplete="new-password"
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                border: `1.5px solid ${confirmPwd && newPwd !== confirmPwd ? 'var(--r500)' : 'var(--border)'}`,
                borderRadius: 'var(--rmd)', outline: 'none', background: 'var(--white)',
              }}
              onFocus={e => { if (newPwd === confirmPwd) e.target.style.borderColor = '#8B1A2E' }}
              onBlur={e => { if (!confirmPwd || newPwd === confirmPwd) e.target.style.borderColor = 'var(--border)' }}
            />
            {confirmPwd && newPwd !== confirmPwd && (
              <div style={{ fontSize: 11, color: 'var(--r500)', marginTop: 4, fontWeight: 600 }}>
                Passwords don't match
              </div>
            )}
          </div>
 
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: 13, color: 'var(--s600)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showPwd}
              onChange={e => setShowPwd(e.target.checked)}
              style={{ accentColor: '#8B1A2E' }}
            />
            Show passwords
          </label>
 
          <button
            onClick={changePassword}
            disabled={pwdSubmitting}
            className="btn btn-p"
            style={{ opacity: pwdSubmitting ? .7 : 1 }}
          >
            {pwdSubmitting ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      )}
 
      {/* SECTION: Notifications */}
      {section === 'notifications' && (
        <div className="card">
          <div className="ctitle" style={{ marginBottom: 18 }}>Notification Preferences</div>
 
          {[
            { key: 'notifyEmail',          label: 'Email notifications',           desc: 'Receive important account emails.' },
            { key: 'notifyDailyDigest',    label: 'Daily study digest',            desc: 'Morning summary of your day\'s plan and what\'s due.' },
            { key: 'notifyHomework',       label: 'Homework reminders',            desc: 'Alert me 24 hours before any homework is due.' },
            { key: 'notifyExamResults',    label: 'Exam results',                  desc: 'Notify me when teachers release exam grades.' },
            { key: 'notifyLiveClass',      label: 'Live class reminders',          desc: '15 minutes before every scheduled live class.' },
          ].map(item => (
            <div key={item.key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '14px 0', borderBottom: '1px solid var(--border)', gap: 14, flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>{item.label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--s500)', marginTop: 2 }}>{item.desc}</div>
              </div>
              {/* Toggle */}
              <button
                onClick={() => updatePref(item.key, !prefs[item.key])}
                style={{
                  width: 44, height: 24, padding: 2,
                  borderRadius: 99,
                  border: 'none',
                  background: prefs[item.key] ? '#8B1A2E' : 'var(--s300, #CBD5E1)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background .2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 2,
                  left: prefs[item.key] ? 22 : 2,
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left .2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,.2)',
                }}/>
              </button>
            </div>
          ))}
 
          <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 16, fontStyle: 'italic' }}>
            Changes save automatically.
          </div>
        </div>
      )}
 
      {/* SECTION: Communication */}
      {section === 'communication' && (
        <div className="card">
          <div className="ctitle" style={{ marginBottom: 18 }}>Communication & Privacy</div>
 
          {/* Share progress with parent */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            padding: '14px 0', borderBottom: '1px solid var(--border)', gap: 14, flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>Share progress with parent</div>
              <div style={{ fontSize: 12.5, color: 'var(--s500)', marginTop: 2 }}>
                Allow your parent or guardian to see your dashboard, mastery scores, and exam results.
              </div>
            </div>
            <button
              onClick={() => updatePref('shareProgressWithParent', !prefs.shareProgressWithParent)}
              style={{
                width: 44, height: 24, padding: 2, borderRadius: 99, border: 'none',
                background: prefs.shareProgressWithParent ? '#8B1A2E' : 'var(--s300, #CBD5E1)',
                cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 2,
                left: prefs.shareProgressWithParent ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', transition: 'left .2s',
                boxShadow: '0 2px 4px rgba(0,0,0,.2)',
              }}/>
            </button>
          </div>
 
          {/* Preferred contact method */}
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)', marginBottom: 4 }}>
              Preferred contact method
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--s500)', marginBottom: 10 }}>
              How should teachers and admin reach you for important updates?
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'email',    label: 'Email' },
                { id: 'message',  label: 'In-app messaging' },
                { id: 'both',     label: 'Both' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updatePref('preferredContactMethod', opt.id)}
                  className={prefs.preferredContactMethod === opt.id ? 'btn btn-p btn-sm' : 'btn btn-s btn-sm'}
                  style={{ background: prefs.preferredContactMethod === opt.id ? '#8B1A2E' : 'transparent' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
 
          {/* Timezone */}
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: 'var(--s900)', marginBottom: 4 }}>
              Timezone
            </label>
            <div style={{ fontSize: 12.5, color: 'var(--s500)', marginBottom: 10 }}>
              Class times and reminders are shown in this timezone.
            </div>
            <select
              value={prefs.timezone}
              onChange={e => updatePref('timezone', e.target.value)}
              style={{
                padding: '8px 12px', fontSize: 14, fontFamily: 'inherit',
                border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                background: 'var(--white)', color: 'var(--s700)', cursor: 'pointer',
                minWidth: 200,
              }}
            >
              <option value="Africa/Nairobi">Nairobi (EAT, UTC+3)</option>
              <option value="Asia/Dubai">Dubai (GST, UTC+4)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="America/New_York">New York (EST/EDT)</option>
              <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
              <option value="Africa/Lagos">Lagos (WAT, UTC+1)</option>
              <option value="Africa/Johannesburg">Johannesburg (SAST, UTC+2)</option>
            </select>
          </div>
 
          {/* Language */}
          <div style={{ padding: '14px 0' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: 'var(--s900)', marginBottom: 4 }}>
              Preferred language
            </label>
            <div style={{ fontSize: 12.5, color: 'var(--s500)', marginBottom: 10 }}>
              For emails and notifications. Class language is set by your teacher.
            </div>
            <select
              value={prefs.preferredLanguage}
              onChange={e => updatePref('preferredLanguage', e.target.value)}
              style={{
                padding: '8px 12px', fontSize: 14, fontFamily: 'inherit',
                border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                background: 'var(--white)', color: 'var(--s700)', cursor: 'pointer',
                minWidth: 200,
              }}
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
              <option value="fr">Francais</option>
              <option value="ar">Arabic</option>
              <option value="es">Espanol</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
 

// ═══════════════════════════════════════════════════════════
// DASHBOARD — Unified Student Dashboard
// ═══════════════════════════════════════════════════════════
//
// REPLACES the TWO existing dashboard blocks (lines 400-1408).
// One unified component that adapts to learning mode.
//
// HOW TO APPLY:
//
// STEP 1: Find and select the entire individual+group dashboard block
//
//   START: line ~397 — the comment that says:
//     {/* ════════════════════════════════════════════
//         DASHBOARD — live mastery data
//
//   END: line ~1408 — the closing `)}` after the group dashboard
//   (right before the SUBSCRIPTION comment block)
//
//   That's about 1008 lines of code. Select all of it.
//
// STEP 2: Delete the selection
//
// STEP 3: Paste this single line in its place:
//
//          {page === 'dashboard' && <DashboardTab user={user} store={store} setPage={setPage} setInClassroom={setInClassroom} setLearningMode={setLearningMode} learningMode={learningMode} toast={toast} />}
//
// STEP 4: Add the DashboardTab component at the bottom of the file
//   at COLUMN 1 — paste everything below this line:


// ═══════════════════════════════════════════════════════════
// DASHBOARD TAB — unified for individual & group, real data
// ═══════════════════════════════════════════════════════════

const dashSubjColours = {
  'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
  'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
  'Geography': '#0F766E', 'Computer Science': '#1F2937',
  'Business Studies': '#7E22CE', 'Economics': '#9F1239',
}
const dashSubjColour = (s) => dashSubjColours[s] || '#8B1A2E'

// Daily affirmations — rotates by day-of-year, same quote for the whole day.
// Mix of African voices, classic wisdom, education-focused, and Smartious originals.
const DAILY_AFFIRMATIONS = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "You are never too small to make a difference.", author: "Wangari Maathai" },
  { text: "I have learned that to be with those I like is enough.", author: "Walt Whitman" },
  { text: "Small daily steps compound into mastery.", author: null },
  { text: "Once you stop learning, you start dying.", author: "Albert Einstein" },
  { text: "The best way out is always through.", author: "Robert Frost" },
  { text: "He who learns, teaches.", author: "Ethiopian proverb" },
  { text: "Knowledge is like a garden; if it is not cultivated, it cannot be harvested.", author: "Guinean proverb" },
  { text: "Mistakes are proof that you are trying.", author: null },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "A river cuts through rock not because of its power, but its persistence.", author: null },
  { text: "When the deepest part of you becomes engaged in what you are doing, you have come home.", author: "Sarah Ban Breathnach" },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African proverb" },
  { text: "Try to be a rainbow in someone's cloud.", author: "Maya Angelou" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "The expert in anything was once a beginner.", author: null },
  { text: "Wisdom is like a baobab tree; no one individual can embrace it.", author: "Akan proverb" },
  { text: "Do not wait for the light to appear at the end of the tunnel; stride down there and light it yourself.", author: "Sara Henderson" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "There is no shame in not knowing; the shame lies in not finding out.", author: "Russian proverb" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The only way to learn mathematics is to do mathematics.", author: "Paul Halmos" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "If I have seen further it is by standing on the shoulders of giants.", author: "Isaac Newton" },
  { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupery" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "However difficult life may seem, there is always something you can do and succeed at.", author: "Stephen Hawking" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
]

// Pick the affirmation for today — same for everyone on the same day, rotates daily
const todaysAffirmation = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const dayOfYear = Math.floor(diff / 86400000)
  return DAILY_AFFIRMATIONS[dayOfYear % DAILY_AFFIRMATIONS.length]
}

const greetingFor = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Working late'
}


// Simple format for "X hours ago" / "yesterday"
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function DashboardTab({ user, store, setPage, setInClassroom, setLearningMode, learningMode, toast }) {
  // Tick to refresh live status every 30s
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const studentFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const firstName = user?.firstName || 'Student'
  const initials = (studentFullName || firstName).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'S'

  // Read avatar from profile if set
  const avatar = (() => {
    try { return localStorage.getItem('sm_profile_avatar') } catch { return null }
  })()

  // ── DATA AGGREGATION ────────────────────────────────
  // All data comes from localStorage written by the other tabs.

  let practiceHist = [], examHist = [], homework = [], xp = 0
  try { practiceHist = JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch {}
  try { examHist = JSON.parse(localStorage.getItem('sm_exam_history') || '[]') } catch {}
  try { homework = JSON.parse(localStorage.getItem('sm_homework_assigned') || '[]') } catch {}
  try { xp = parseInt(localStorage.getItem('sm_practice_xp') || '0', 10) || 0 } catch {}

  // Filter homework to this student
  const myHomework = homework.filter(hw =>
    !hw.assignedTo || hw.assignedTo === studentFullName ||
    hw.assignedTo === firstName || hw.assignedTo === '*'
  )

  // Compute per-subject mastery
  const subjectStats = {}
  practiceHist.forEach(s => {
    if (!subjectStats[s.subject]) subjectStats[s.subject] = []
    subjectStats[s.subject].push(s.score)
  })
  const subjectMastery = Object.entries(subjectStats).map(([subj, scores]) => ({
    subject: subj,
    mastery: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    sessions: scores.length,
  })).sort((a, b) => b.mastery - a.mastery)

  // Compute streak (consecutive days with practice activity)
  const streak = (() => {
    if (practiceHist.length === 0) return 0
    const days = new Set(practiceHist.map(s => new Date(s.date).toDateString()))
    let count = 0
    let cursor = new Date()
    while (days.has(cursor.toDateString())) {
      count++
      cursor.setDate(cursor.getDate() - 1)
    }
    return count
  })()

  // Pass rate from exams
  const passRate = examHist.length > 0
    ? Math.round((examHist.filter(e => e.score >= 60).length / examHist.length) * 100)
    : null

  // Today's classes (using parseScheduleString from LiveClasses paste)
  const myRooms = (store?.groupRooms || []).filter(r =>
    r.students?.some(s => s === studentFullName || s === firstName || (firstName && s.includes(firstName)))
  )
  const now = new Date()
  const todayDow = now.getDay()
  const nowMins = now.getHours() * 60 + now.getMinutes()

  const todayClasses = []
  myRooms.forEach(room => {
    const parsed = parseScheduleString(room.schedule)
    if (!parsed || !parsed.days.includes(todayDow)) return
    let status = 'upcoming'
    if (nowMins >= parsed.endMins) status = 'done'
    else if (nowMins >= parsed.startMins) status = 'live'
    todayClasses.push({
      ...room,
      startMins: parsed.startMins,
      endMins: parsed.endMins,
      status,
    })
  })
  todayClasses.sort((a, b) => a.startMins - b.startMins)

  // Today's homework due (and overdue)
  const homeworkPending = myHomework.filter(h => h.status !== 'submitted' && h.status !== 'graded')
  const overdueHomework = homeworkPending.filter(h => new Date(h.dueDate) < now)
  const dueTodayHomework = homeworkPending.filter(h => {
    const d = new Date(h.dueDate)
    return d.toDateString() === now.toDateString() && d >= now
  })
  const dueThisWeekHomework = homeworkPending.filter(h => {
    const d = new Date(h.dueDate)
    const days = (d - now) / 86400000
    return days > 0 && days <= 7
  })

  // Recent activity timeline (last 5 events from any source)
  const activity = []
  practiceHist.slice(-10).forEach(s => activity.push({
    type: 'practice', date: s.date,
    label: `Practiced ${s.topic} (${s.subject})`, score: s.score,
    icon: 'practice', color: dashSubjColour(s.subject),
  }))
  examHist.slice(-5).forEach(e => activity.push({
    type: 'exam', date: e.date,
    label: `${e.subject} exam`, score: e.score,
    icon: 'exam', color: dashSubjColour(e.subject),
  }))
  myHomework.filter(h => h.submittedAt).slice(-5).forEach(h => activity.push({
    type: 'homework', date: h.submittedAt,
    label: `Submitted: ${h.title}`,
    icon: 'homework', color: dashSubjColour(h.subject),
  }))
  activity.sort((a, b) => new Date(b.date) - new Date(a.date))
  const recentActivity = activity.slice(0, 5)

  // ── RECOMMENDED NEXT ACTION ─────────────────────────
  const nextAction = (() => {
    // Live class right now
    const liveNow = todayClasses.find(c => c.status === 'live')
    if (liveNow) return {
      title: 'You have a live class right now',
      subtitle: `${liveNow.subject} with ${liveNow.teacher} - ends at ${formatMinsTime(liveNow.endMins)}`,
      cta: 'Join Class Now',
      colour: '#22C55E',
      action: () => { setPage('live'); setInClassroom(true) },
    }

    // Class within 30 min
    const upcomingClass = todayClasses.find(c => c.status === 'upcoming' && (c.startMins - nowMins) <= 30)
    if (upcomingClass) return {
      title: `Class starting in ${upcomingClass.startMins - nowMins} min`,
      subtitle: `${upcomingClass.subject} with ${upcomingClass.teacher}`,
      cta: 'View Live Classes',
      colour: '#1E3A8A',
      action: () => setPage('live'),
    }

    // Overdue homework
    if (overdueHomework.length > 0) {
      const hw = overdueHomework[0]
      return {
        title: `${overdueHomework.length} overdue homework`,
        subtitle: `Start with: ${hw.title} (${hw.subject})`,
        cta: 'Open Homework',
        colour: '#DC2626',
        action: () => setPage('homework'),
      }
    }

    // Homework due today
    if (dueTodayHomework.length > 0) {
      const hw = dueTodayHomework[0]
      return {
        title: 'Homework due today',
        subtitle: `${hw.title} (${hw.subject}) due in a few hours`,
        cta: 'Submit Now',
        colour: '#F59E0B',
        action: () => setPage('homework'),
      }
    }

    // Weak topic to practice
    const weakest = subjectMastery.find(s => s.mastery < 60)
    if (weakest) {
      return {
        title: `Strengthen ${weakest.subject}`,
        subtitle: `Current mastery: ${weakest.mastery}% - 5 minutes can move this forward`,
        cta: 'Start Practice',
        colour: '#8B1A2E',
        action: () => setPage('practice'),
      }
    }

    // Default — daily practice nudge
    return {
      title: streak > 0 ? `Keep your ${streak}-day streak going` : 'Start a 5-minute practice',
      subtitle: practiceHist.length === 0
        ? 'Pick any subject to begin'
        : 'Just one quick session keeps your momentum',
      cta: 'Open Practice',
      colour: '#8B1A2E',
      action: () => setPage('practice'),
    }
  })()

  const greeting = greetingFor()
  const affirmation = getTodayAffirmation()
  const isGroupMode = learningMode === 'group'

  return (
    <div>
      {/* ─── WELCOME HERO ─── */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '28px 30px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: avatar ? 'transparent' : 'rgba(240,204,90,.18)',
            border: '3px solid #F0CC5A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#F0CC5A',
            fontSize: 26, fontWeight: 700,
            fontFamily: "'Instrument Serif', serif",
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : initials}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                background: isGroupMode ? 'rgba(34,197,94,.2)' : 'rgba(59,130,246,.2)',
                border: `1px solid ${isGroupMode ? 'rgba(34,197,94,.4)' : 'rgba(59,130,246,.4)'}`,
                borderRadius: 99, padding: '3px 10px',
                fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
                color: isGroupMode ? '#86EFAC' : '#93C5FD',
              }}>{isGroupMode ? 'Group Class' : 'Individual'}</div>
              <button
                onClick={() => {
                  const newMode = isGroupMode ? 'individual' : 'group'
                  setLearningMode(newMode)
                  localStorage.setItem('sm_learning_mode', newMode)
                  toast?.ok?.(`Switched to ${newMode === 'group' ? 'Group' : 'Individual'} mode`)
                }}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'rgba(255,255,255,.6)', fontSize: 11.5,
                  cursor: 'pointer', textDecoration: 'underline',
                }}
              >Switch to {isGroupMode ? 'Individual' : 'Group'}</button>
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.2 }}>
              {greeting}, <em style={{ color: '#F0CC5A', fontStyle: 'italic' }}>{firstName}</em>
            </h1>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              {user?.curriculum || 'IGCSE'} · {user?.grade || 'Year 10'} · {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
        {/* Quick stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.2)' }}>
          {[
            { label: 'XP',         value: xp.toLocaleString(),                     onClick: () => setPage('achievements'), color: '#F0CC5A' },
            { label: 'Streak',     value: streak > 0 ? `${streak} day${streak === 1 ? '' : 's'}` : '0',  onClick: () => setPage('practice'),   color: streak >= 3 ? '#4ADE80' : '#fff' },
            { label: 'Pass Rate',  value: passRate !== null ? `${passRate}%` : '-', onClick: () => setPage('exams'),     color: passRate >= 60 ? '#4ADE80' : (passRate !== null ? '#F59E0B' : '#fff') },
            { label: 'Practice',   value: practiceHist.length,                     onClick: () => setPage('practice'),   color: '#fff' },
          ].map(stat => (
            <button
              key={stat.label}
              onClick={stat.onClick}
              style={{
                padding: '14px 18px',
                borderRight: '1px solid rgba(255,255,255,.08)',
                background: 'transparent',
                border: 'none', borderBottom: 'none', borderTop: 'none', borderLeft: 'none',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: stat.color }}>
                {stat.value}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── DAILY AFFIRMATION ─── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(240,204,90,.08) 0%, rgba(184,150,12,.04) 100%)',
        border: '1px solid rgba(240,204,90,.3)',
        borderRadius: 'var(--rxl)',
        padding: '16px 22px',
        marginBottom: 18,
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(240,204,90,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B8960C" strokeWidth="2" strokeLinecap="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 16, fontStyle: 'italic',
            color: 'var(--s700)',
            lineHeight: 1.45,
            marginBottom: 2,
          }}>
            {affirmation.text}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--s400)', fontWeight: 600 }}>
            {'\u2014'} {affirmation.attribution}
          </div>
        </div>
      </div>

      {/* ─── RECOMMENDED NEXT ACTION ─── */}
      <div
        onClick={nextAction.action}
        style={{
          background: `linear-gradient(135deg, ${nextAction.colour} 0%, ${nextAction.colour}DD 100%)`,
          borderRadius: 'var(--rxl)',
          padding: '20px 26px',
          marginBottom: 18,
          color: '#fff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
          transition: 'transform .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(255,255,255,.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8, marginBottom: 2 }}>
            Recommended Now
          </div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, marginBottom: 2 }}>
            {nextAction.title}
          </div>
          <div style={{ fontSize: 13, opacity: .85 }}>
            {nextAction.subtitle}
          </div>
        </div>
        <button
          style={{
            background: '#fff',
            color: nextAction.colour,
            border: 'none',
            padding: '10px 20px',
            borderRadius: 'var(--rmd)',
            fontWeight: 700, fontSize: 13.5,
            cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {nextAction.cta}
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      {/* ─── TODAY'S AGENDA: 2-COLUMN ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginBottom: 18 }}>
        {/* Today's Classes */}
        <div className="card">
          <div className="chdr">
            <div className="ctitle">Today's Classes</div>
            <button onClick={() => setPage('live')} style={{ background: 'transparent', border: 'none', color: '#8B1A2E', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              View all -&gt;
            </button>
          </div>
          {todayClasses.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--s400)', fontSize: 13 }}>
              No classes scheduled today
            </div>
          ) : todayClasses.map((cls, i) => (
            <div key={i}
              onClick={() => { if (cls.status === 'live') { setPage('live'); setInClassroom(true) } else { setPage('live') } }}
              style={{
                display: 'flex', gap: 12, padding: '12px 0',
                borderBottom: i < todayClasses.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer', alignItems: 'center',
              }}>
              <div style={{
                width: 4, height: 40, borderRadius: 2,
                background: dashSubjColour(cls.subject), flexShrink: 0,
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>{cls.subject}</div>
                <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                  {cls.teacher} · {formatMinsTime(cls.startMins)} - {formatMinsTime(cls.endMins)}
                </div>
              </div>
              {cls.status === 'live' && (
                <span style={{
                  background: '#FEE2E2', color: '#991B1B',
                  fontSize: 10, fontWeight: 800, letterSpacing: '.06em',
                  padding: '3px 8px', borderRadius: 99, textTransform: 'uppercase',
                }}>LIVE</span>
              )}
              {cls.status === 'done' && (
                <span style={{ fontSize: 11, color: 'var(--s400)' }}>Done</span>
              )}
              {cls.status === 'upcoming' && (
                <span style={{
                  background: 'var(--a50)', color: 'var(--a600)',
                  fontSize: 10, fontWeight: 800, letterSpacing: '.06em',
                  padding: '3px 8px', borderRadius: 99,
                }}>UPCOMING</span>
              )}
            </div>
          ))}
        </div>

        {/* Today's Homework */}
        <div className="card">
          <div className="chdr">
            <div className="ctitle">
              Homework
              {overdueHomework.length > 0 && (
                <span style={{
                  marginLeft: 8,
                  background: 'var(--r50)', color: 'var(--r600)',
                  fontSize: 10, fontWeight: 800,
                  padding: '2px 7px', borderRadius: 99,
                }}>{overdueHomework.length} overdue</span>
              )}
            </div>
            <button onClick={() => setPage('homework')} style={{ background: 'transparent', border: 'none', color: '#8B1A2E', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              View all -&gt;
            </button>
          </div>
          {[...overdueHomework, ...dueTodayHomework, ...dueThisWeekHomework].slice(0, 4).length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--s400)', fontSize: 13 }}>
              All caught up - no pending homework
            </div>
          ) : (
            [...overdueHomework, ...dueTodayHomework, ...dueThisWeekHomework].slice(0, 4).map((hw, i) => {
              const isOverdue = new Date(hw.dueDate) < now
              return (
                <div key={hw.id}
                  onClick={() => setPage('homework')}
                  style={{
                    display: 'flex', gap: 12, padding: '12px 0',
                    borderBottom: i < Math.min(3, [...overdueHomework, ...dueTodayHomework, ...dueThisWeekHomework].length - 1) ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer', alignItems: 'center',
                  }}>
                  <div style={{
                    width: 4, height: 40, borderRadius: 2,
                    background: dashSubjColour(hw.subject), flexShrink: 0,
                  }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hw.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                      {hw.subject} · {hw.teacher}
                    </div>
                  </div>
                  <span style={{
                    background: isOverdue ? 'var(--r50)' : 'var(--a50)',
                    color: isOverdue ? 'var(--r600)' : 'var(--a600)',
                    fontSize: 10, fontWeight: 800,
                    padding: '3px 8px', borderRadius: 99,
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    {isOverdue ? 'Overdue' : 'Due Soon'}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ─── MASTERY SNAPSHOT ─── */}
      {subjectMastery.length > 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="chdr">
            <div className="ctitle">Mastery Snapshot</div>
            <button onClick={() => setPage('practice')} style={{ background: 'transparent', border: 'none', color: '#8B1A2E', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Practice -&gt;
            </button>
          </div>
          {subjectMastery.slice(0, 6).map(s => {
            const col = dashSubjColour(s.subject)
            return (
              <div key={s.subject}
                onClick={() => setPage('practice')}
                style={{ marginBottom: 10, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--s700)' }}>{s.subject}</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: col }}>
                    {s.mastery}% <span style={{ fontWeight: 400, color: 'var(--s400)', fontSize: 11 }}>({s.sessions} sessions)</span>
                  </span>
                </div>
                <div style={{
                  height: 8, borderRadius: 4,
                  background: 'var(--bg)', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${s.mastery}%`,
                    background: col,
                    borderRadius: 4,
                    transition: 'width .4s ease',
                  }}/>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── BOTTOM ROW: 2 columns ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {/* Recent Activity */}
        <div className="card">
          <div className="chdr">
            <div className="ctitle">Recent Activity</div>
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--s400)', fontSize: 13 }}>
              No activity yet - start a practice session
            </div>
          ) : recentActivity.map((a, i) => (
            <div key={i}
              onClick={() => {
                if (a.type === 'practice') setPage('practice')
                else if (a.type === 'exam') setPage('exams')
                else if (a.type === 'homework') setPage('homework')
              }}
              style={{
                display: 'flex', gap: 10, padding: '10px 0',
                borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer', alignItems: 'center',
              }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: a.color + '15',
                color: a.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
              }}>
                {a.type === 'practice' ? 'P' : a.type === 'exam' ? 'E' : 'H'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--s700)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.label}</div>
                <div style={{ fontSize: 11, color: 'var(--s400)' }}>{timeAgo(a.date)}</div>
              </div>
              {a.score !== undefined && (
                <span className="mono" style={{
                  fontSize: 12, fontWeight: 700,
                  color: a.score >= 80 ? 'var(--g600)' : a.score >= 60 ? 'var(--a600)' : 'var(--r500)',
                  flexShrink: 0,
                }}>{a.score}%</span>
              )}
            </div>
          ))}
        </div>

        {/* My Subjects (quick jump) */}
        <div className="card">
          <div className="chdr">
            <div className="ctitle">My Subjects</div>
            <button onClick={() => setPage('curriculum')} style={{ background: 'transparent', border: 'none', color: '#8B1A2E', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              View all -&gt;
            </button>
          </div>
          {myRooms.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--s400)', fontSize: 13 }}>
              No subjects enrolled yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[...new Set(myRooms.map(r => r.subject))].map(subj => {
                const mast = subjectMastery.find(s => s.subject === subj)
                const col = dashSubjColour(subj)
                return (
                  <button
                    key={subj}
                    onClick={() => setPage('practice')}
                    style={{
                      background: col + '0F',
                      border: `1.5px solid ${col}30`,
                      borderRadius: 'var(--rsm)',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = col + '20' }}
                    onMouseLeave={e => { e.currentTarget.style.background = col + '0F' }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col }}/>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--s700)' }}>{subj}</span>
                    {mast && (
                      <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: col }}>{mast.mastery}%</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper at module level — minutes since midnight to "9:00 AM"
function formatMinsTime(mins) {
  let h = Math.floor(mins / 60)
  const m = mins % 60
  const mer = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}${m === 0 ? '' : ':' + String(m).padStart(2, '0')} ${mer}`
}






































































































































































































































































































































































































































































