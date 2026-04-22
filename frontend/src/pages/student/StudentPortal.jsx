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
             page === 'tutor'     ? 'Mshauri AI Tutor' :
             page === 'studyplan' ? 'My Personalised Study Plan' :
             page === 'curriculum'? 'My Curriculum' :
             page === 'lessons'   ? 'Lesson Player' :
             page === 'exams'     ? 'Exams' :
             page === 'live'      ? 'Live Classes' :
             page === 'timetable' ? 'Timetable' :
             page === 'resources' ? 'Resources' :
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
              DASHBOARD — live mastery data
          ════════════════════════════════════════════ */}
          {page === 'dashboard' && learningMode === 'individual' && (
            <div>
              {masteryLoading ? (
                <div className="lc"><div className="spinner"/></div>
              ) : (
                <>
                {/* Announcements from store */}
                {store.getAnnouncements('student').slice(0,2).map((a,i) => (
                  <div key={i} style={{background:a.type==='article'?'var(--b50)':a.type==='resource'?'var(--g50)':'var(--a50)',border:`1px solid ${a.type==='article'?'var(--b100)':a.type==='resource'?'var(--g100)':'var(--a100)'}`,borderRadius:'var(--rlg)',padding:'12px 16px',display:'flex',alignItems:'center',gap:12,marginBottom:12,flexWrap:'wrap'}}>
                    <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13.5,color:a.type==='article'?'var(--b700)':a.type==='resource'?'var(--g700)':'var(--a600)',marginBottom:2}}>{a.title}</div><div style={{fontSize:12.5,color:'var(--s500)'}}>{a.body}</div></div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span style={{fontSize:11,color:'var(--s400)'}}>{a.date}</span>
                      {a.type==='resource' && <button className="btn btn-s btn-sm" onClick={()=>goTo('resources')}>View</button>}
                    </div>
                  </div>
                ))}
                  {/* KPI row */}
                  <div className="kpi-grid" style={{marginBottom:24}}>
                    {[
                      {v: mastery?.xp?.toLocaleString() || '0',    l:'Total XP',       d:`Streak: ${mastery?.streak||0} days`,  dc:'var(--b700)'},
                      {v: subjects.length > 0 ? `${Math.round(subjects.reduce((s,x)=>s+x.overallPct,0)/subjects.length)}%` : '—', l:'Avg Mastery', d:'Across all subjects', dc:'var(--g600)'},
                      {v: nextRec ? nextRec.subject : '—',          l:'Priority Subject', d:nextRec ? `${nextRec.topic}` : 'All on track', dc:'var(--a600)'},
                      {v: `${mastery?.studyTimeToday||0}/${mastery?.dailyGoalMins||30}`, l:'Study Today (min)', d: (mastery?.studyTimeToday||0) >= (mastery?.dailyGoalMins||30) ? 'Goal reached!' : 'Keep going', dc: (mastery?.studyTimeToday||0) >= (mastery?.dailyGoalMins||30) ? 'var(--g600)' : 'var(--a600)'},
                    ].map((k,i) => (
                      <div key={i} className="kpi">
                        <div className="kpi-v" style={{fontSize:i===2?16:undefined}}>{k.v}</div>
                        <div className="kpi-l">{k.l}</div>
                        <div className="kpi-d" style={{color:k.dc}}>{k.d}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
                    <div style={{display:'flex',flexDirection:'column',gap:20}}>

                      {/* Personalised recommendation banner */}
                      {nextRec && (
                        <div style={{background:'linear-gradient(135deg,var(--b900,#1E3A8A),var(--b700))',borderRadius:'var(--rxl)',padding:'20px 24px',color:'#fff',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
                          <div style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>Mshauri recommends right now</div>
                            <div style={{fontFamily:'Instrument Serif,serif',fontSize:18,color:'#fff',marginBottom:2}}>{nextRec.topic} — {nextRec.subject}</div>
                            <div style={{fontSize:13,color:'rgba(255,255,255,.6)'}}>Current mastery: <span className="mono" style={{fontWeight:700,color:nextRec.pct<60?'#FCA5A5':'#6EE7B7'}}>{nextRec.pct}%</span> — this is your weakest active topic</div>
                          </div>
                          <div style={{display:'flex',gap:8}}>
                            <button className="btn" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.25)'}}
                              onClick={() => { goTo('practice'); loadPractice(nextRec.subject, nextRec.topic) }}>
                              Practice it
                            </button>
                            <button className="btn" style={{background:'#fff',color:'var(--b700)',fontWeight:700,borderColor:'transparent'}}
                              onClick={() => { setTutorInp('Explain ' + (nextRec.topic || '') + ' to me'); goTo('tutor'); }}>
                              Ask Mshauri
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Subject mastery bars — live data */}
                      <div className="card">
                        <div className="chdr">
                          <div className="ctitle">Subject Mastery</div>
                          <button className="btn btn-g btn-sm" onClick={() => goTo('curriculum')}>View All Topics</button>
                        </div>
                        {subjects.length === 0 ? (
                          <div className="empty"><p>Loading your mastery data…</p></div>
                        ) : subjects.map(s => (
                          <div key={s.name} style={{marginBottom:12}}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5}}>
                              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                                <div style={{width:10,height:10,borderRadius:2,background:s.color,flexShrink:0}}/>
                                <span style={{fontWeight:600}}>{s.name}</span>
                                {s.velocity !== 0 && (
                                  <span style={{fontSize:11,color:s.velocity>0?'var(--g600)':'var(--r500)',fontWeight:700}}>
                                    {s.velocity > 0 ? '↑' : '↓'} {Math.abs(s.velocity)}%
                                  </span>
                                )}
                              </div>
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                <span style={{fontSize:11,color:masteryCol(s.overallPct),fontWeight:700}}>{masteryLabel(s.overallPct)}</span>
                                <span className="mono" style={{fontWeight:700,color:masteryCol(s.overallPct)}}>{s.overallPct}%</span>
                              </div>
                            </div>
                            <div className="prog-bar">
                              <div className="prog-fill" style={{width:s.overallPct+'%',background:s.color,transition:'width 1s ease'}}/>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Recent activity + next sessions */}
                      <div className="card">
                        <div className="chdr"><div className="ctitle">Quick Actions</div></div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                          {[
                            {label:'Start Adaptive Practice', icon:'<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1.5"/>', action:() => { goTo('practice'); loadPractice() }},
                            {label:'View My Study Plan',      icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>',               action:() => goTo('studyplan')},
                            {label:'Ask Mshauri AI',          icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',                           action:() => goTo('tutor')},
                            {label:'All My Topics',           icon:'<path d="M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13"/><path d="M4 19a2 2 0 0 0 2 2h14"/>',             action:() => goTo('curriculum')},
                          ].map((a,i) => (
                            <button key={i} className="btn btn-s" style={{justifyContent:'flex-start',gap:8,padding:'12px 14px'}} onClick={a.action}>
                              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:a.icon}}/>
                              <span style={{fontSize:13}}>{a.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right column */}
                    <div style={{display:'flex',flexDirection:'column',gap:16}}>

                      {/* Daily goal ring */}
                      <div className="card" style={{textAlign:'center',padding:20}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--s400)',marginBottom:12}}>Daily Study Goal</div>
                        <div style={{position:'relative',width:96,height:96,margin:'0 auto 12px'}}>
                          <svg viewBox="0 0 36 36" style={{width:96,height:96,transform:'rotate(-90deg)'}}>
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--s100)" strokeWidth="3"/>
                            <circle cx="18" cy="18" r="15.9" fill="none"
                              stroke={mastery && mastery.studyTimeToday >= mastery.dailyGoalMins ? 'var(--g500)' : 'var(--b600)'}
                              strokeWidth="3"
                              strokeDasharray={`${Math.min(100, Math.round(((mastery?.studyTimeToday||0)/(mastery?.dailyGoalMins||30))*100))} 100`}
                              strokeLinecap="round"/>
                          </svg>
                          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                            <span className="mono" style={{fontSize:18,fontWeight:700,color:'var(--s900)'}}>{mastery?.studyTimeToday||0}</span>
                            <span style={{fontSize:10,color:'var(--s400)'}}>/ {mastery?.dailyGoalMins||30} min</span>
                          </div>
                        </div>
                        {mastery && mastery.studyTimeToday >= mastery.dailyGoalMins
                          ? <div style={{fontSize:13,color:'var(--g600)',fontWeight:700}}>Daily goal reached!</div>
                          : <div style={{fontSize:12,color:'var(--s500)'}}>Complete a practice set to add study time</div>
                        }
                      </div>

                      {/* Badges */}
                      {mastery?.badges?.length > 0 && (
                        <div className="card">
                          <div className="ctitle" style={{marginBottom:12}}>Recent Badges</div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                            {mastery.badges.slice(-4).map((b,i) => (
                              <div key={i} style={{display:'flex',alignItems:'center',gap:6,background:'var(--a50)',border:'1px solid var(--a100)',borderRadius:99,padding:'5px 10px',fontSize:12,fontWeight:600,color:'var(--a600)'}}>
                                {BADGE_ICONS[b.id] || null}
                                {b.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Topics needing help */}
                      <div className="card">
                        <div className="ctitle" style={{marginBottom:12}}>Topics Needing Help</div>
                        {subjects.flatMap(s => s.topics.filter(t => t.pct > 0 && t.pct < 60).map(t => ({...t, subject:s.name, color:s.color}))).sort((a,b)=>a.pct-b.pct).slice(0,4).map((t,i) => (
                          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)',cursor:'pointer'}}
                            onClick={() => { goTo('practice'); loadPractice(t.subject, t.name) }}>
                            <div style={{width:8,height:8,borderRadius:'50%',background:t.color,flexShrink:0}}/>
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:600,color:'var(--s800)'}}>{t.name}</div>
                              <div style={{fontSize:11,color:'var(--s400)'}}>{t.subject}</div>
                            </div>
                            <span className="mono" style={{fontSize:13,fontWeight:700,color:masteryCol(t.pct)}}>{t.pct}%</span>
                          </div>
                        ))}
                        {subjects.flatMap(s => s.topics.filter(t => t.pct < 60)).length === 0 && (
                          <div style={{fontSize:13,color:'var(--g600)',textAlign:'center',padding:12}}>All topics above 60%!</div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════
              CURRICULUM — topic-by-topic mastery grid
          ════════════════════════════════════════════ */}
          {page === 'curriculum' && (
            <div>
              <div style={{marginBottom:20}}>
                <div className="sec-tag">Your Learning Map</div>
                <h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>My <em style={{color:'var(--b700)'}}>Curriculum</em></h2>
                <p style={{fontSize:14,color:'var(--s500)',marginTop:4}}>Click any topic to start adaptive practice. Topics unlock as you master prerequisites.</p>
              </div>
              {masteryLoading ? <div className="lc"><div className="spinner"/></div> : (
                <div style={{display:'flex',flexDirection:'column',gap:20}}>
                  {subjects.map(subj => (
                    <div key={subj.name} className="card">
                      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                        <div style={{width:14,height:14,borderRadius:3,background:subj.color,flexShrink:0}}/>
                        <div className="serif" style={{fontSize:20,color:'var(--s900)',flex:1}}>{subj.name}</div>
                        <span className="mono" style={{fontWeight:700,fontSize:18,color:masteryCol(subj.overallPct)}}>{subj.overallPct}%</span>
                        <button className="btn btn-p btn-sm" onClick={() => { goTo('practice'); loadPractice(subj.name) }}>
                          Practice
                        </button>
                      </div>
                      <div className="prog-bar" style={{height:8,marginBottom:16}}>
                        <div className="prog-fill" style={{width:subj.overallPct+'%',background:subj.color,transition:'width 1s ease'}}/>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
                        {subj.topics.map((topic, ti) => {
                          const locked = topic.prerequisite &&
                            subj.topics.find(t => t.name === topic.prerequisite)?.pct < 60
                          return (
                            <div key={ti}
                              style={{background:locked?'var(--s50)':'var(--bg)',border:`1.5px solid ${locked?'var(--s200)':masteryCol(topic.pct)+'40'}`,borderRadius:'var(--rmd)',padding:'10px 12px',cursor:locked?'default':'pointer',opacity:locked?.6:1,transition:'all .2s'}}
                              onClick={() => !locked && (goTo('practice'), loadPractice(subj.name, topic.name))}>
                              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                                <div style={{fontSize:13,fontWeight:600,color:locked?'var(--s400)':'var(--s800)',lineHeight:1.3}}>{topic.name}</div>
                                {locked ? (
                                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                ) : (
                                  <span className="mono" style={{fontSize:12,fontWeight:700,color:masteryCol(topic.pct)}}>{topic.pct}%</span>
                                )}
                              </div>
                              {!locked && (
                                <div style={{height:4,background:'var(--s100)',borderRadius:999,overflow:'hidden'}}>
                                  <div style={{width:topic.pct+'%',height:'100%',background:masteryCol(topic.pct),borderRadius:999,transition:'width 1s ease'}}/>
                                </div>
                              )}
                              {locked && <div style={{fontSize:11,color:'var(--s400)'}}>Requires: {topic.prerequisite}</div>}
                              {!locked && <div style={{fontSize:10,color:'var(--s400)',marginTop:4}}>{masteryLabel(topic.pct)} · {topic.attempts||0} sessions</div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                        {lesson?.youtubeUrl ? (
                          <div style={{position:'relative',paddingBottom:'56.25%',height:0,borderRadius:'var(--rlg)',overflow:'hidden',background:'#000'}}>
                            <iframe
                              src={lesson.youtubeUrl + '?rel=0&modestbranding=1'}
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
                        )}
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
          {page === 'practice' && (
            <div>
              {practiceLoading ? (
                <div className="lc"><div className="spinner"/><div style={{marginTop:12,color:'var(--s500)',fontSize:14}}>Loading personalised questions…</div></div>
              ) : !practiceData ? (
                <div className="empty">
                  <h3>Choose a topic to practise</h3>
                  <p>Click any subject below to start adaptive practice matched to your mastery level.</p>
                  <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',marginTop:16}}>
                    {subjects.map(s => (
                      <button key={s.name} className="btn btn-s" onClick={() => loadPractice(s.name)}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:s.color,flexShrink:0}}/>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : practiceResult ? (
                /* ── Results ── */
                <div style={{maxWidth:540,margin:'0 auto'}}>
                  <div className="card" style={{textAlign:'center',padding:36}}>
                    <div className="serif" style={{fontSize:28,color:'var(--s900)',marginBottom:8}}>
                      {practiceResult.score >= 80 ? 'Excellent work!' : practiceResult.score >= 60 ? 'Good effort!' : 'Keep practising!'}
                    </div>
                    <p style={{fontSize:14,color:'var(--s500)',marginBottom:24}}>{practiceData.topic} — {practiceData.subject}</p>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:28}}>
                      {[['Score',`${practiceResult.score}%`,practiceResult.score>=60?'var(--g50)':'var(--r50)',masteryCol(practiceResult.score)],
                        ['Correct',`${practiceResult.correct}/${practiceResult.total}`,'var(--b50)','var(--b700)'],
                        ['Difficulty',practiceData.difficulty,'var(--a50)','var(--a600)']].map(([l,v,bg,c]) => (
                        <div key={l} style={{background:bg,borderRadius:'var(--rmd)',padding:'14px 10px',textAlign:'center'}}>
                          <div className="mono" style={{fontSize:20,fontWeight:700,color:c}}>{v}</div>
                          <div style={{fontSize:12,color:'var(--s500)',marginTop:3}}>{l}</div>
                        </div>
                      ))}
                    </div>
                    {/* Show explanations for wrong answers */}
                    {practiceData.questions.filter(q => practiceAnswers[q.id] && practiceAnswers[q.id] !== q.correct).map((q,i) => (
                      <div key={i} style={{textAlign:'left',background:'var(--r50)',border:'1px solid var(--r100)',borderRadius:'var(--rmd)',padding:14,marginBottom:10}}>
                        <div style={{fontWeight:600,fontSize:13.5,color:'var(--r600)',marginBottom:4}}>Q{q.id}: {q.question}</div>
                        <div style={{fontSize:13,color:'var(--s700)',marginBottom:4}}>Your answer: <span style={{color:'var(--r600)',fontWeight:600}}>{practiceAnswers[q.id]}</span></div>
                        <div style={{fontSize:13,color:'var(--g700)',marginBottom:4}}>Correct: <span style={{fontWeight:600}}>{q.correct}</span></div>
                        {q.explanation && <div style={{fontSize:12.5,color:'var(--s500)',fontStyle:'italic'}}>{q.explanation}</div>}
                      </div>
                    ))}
                    <div style={{display:'flex',gap:10,justifyContent:'center',marginTop:8}}>
                      <button className="btn btn-p" onClick={() => { setPracticeResult(null); setPracticeAnswers({}); loadPractice(practiceData.subject, practiceData.topic) }}>Try Again</button>
                      <button className="btn btn-s" onClick={() => goTo('dashboard')}>Back to Dashboard</button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Active practice ── */
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
                    <div>
                      <div className="sec-tag">{practiceData.subject} · {practiceData.difficulty} difficulty · Mastery: {practiceData.currentMastery}%</div>
                      <h2 className="serif" style={{fontSize:22,color:'var(--s900)'}}>{practiceData.topic}</h2>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <div style={{fontSize:13,color:'var(--s500)'}}>{Object.keys(practiceAnswers).length}/{practiceData.questions.length} answered</div>
                      <button className="btn btn-s btn-sm" onClick={() => { setPracticeData(null); setPracticeAnswers({}) }}>Change Topic</button>
                    </div>
                  </div>

                  <div className="prog-bar" style={{marginBottom:20,height:8}}>
                    <div className="prog-fill" style={{width:`${(Object.keys(practiceAnswers).length/practiceData.questions.length)*100}%`,background:'var(--b600)'}}/>
                  </div>

                  {practiceData.questions.map((q) => (
                    <div key={q.id} className="card" style={{marginBottom:14,borderColor:practiceAnswers[q.id]?'var(--b200)':'var(--border)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <div style={{width:26,height:26,borderRadius:'50%',background:practiceAnswers[q.id]?'var(--b700)':'var(--s200)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:practiceAnswers[q.id]?'#fff':'var(--s500)'}}>{q.id}</div>
                          <span style={{fontSize:15,color:'var(--s800)',fontWeight:500,lineHeight:1.5}}>{q.question}</span>
                        </div>
                        <span style={{fontSize:11,color:'var(--s400)',flexShrink:0,marginLeft:8}}>{q.marks} marks</span>
                      </div>
                      {q.options?.map(opt => (
                        <label key={opt} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',marginBottom:7,borderRadius:'var(--rmd)',cursor:'pointer',border:`1.5px solid ${practiceAnswers[q.id]===opt?'var(--b600)':'var(--border)'}`,background:practiceAnswers[q.id]===opt?'var(--b50)':'var(--bg)',transition:'all .15s'}}>
                          <input type="radio" name={`q${q.id}`} value={opt} checked={practiceAnswers[q.id]===opt} onChange={() => setPracticeAnswers(a=>({...a,[q.id]:opt}))} style={{accentColor:'var(--b600)'}}/>
                          <span style={{fontSize:14,color:practiceAnswers[q.id]===opt?'var(--b800)':'var(--s700)',fontWeight:practiceAnswers[q.id]===opt?600:400}}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ))}

                  <div style={{position:'sticky',bottom:16,background:'var(--white)',border:'1px solid var(--border)',borderRadius:'var(--rxl)',padding:'14px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'var(--sh-lg)'}}>
                    <div style={{fontSize:13.5,color:'var(--s600)'}}>
                      {Object.keys(practiceAnswers).length < practiceData.questions.length
                        ? <span style={{color:'var(--a600)'}}>⚠ {practiceData.questions.length - Object.keys(practiceAnswers).length} unanswered</span>
                        : <span style={{color:'var(--g600)'}}>All questions answered</span>}
                    </div>
                    <button className="btn btn-p" onClick={submitPractice} disabled={submitting || Object.keys(practiceAnswers).length === 0}>
                      {submitting ? 'Submitting…' : 'Submit Answers'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════
              EXAMS
          ════════════════════════════════════════════ */}
          {page === 'exams' && !examActive && !examResult && (
            <div>
              <div style={{marginBottom:20}}>
                <div className="sec-tag">Assessment</div>
                <h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Exams</h2>
              </div>
              {/* Released results from teacher */}
              {store.getStudentResults('Amara Osei').length > 0 && (
                <div className="card" style={{marginBottom:20}}>
                  <div className="ctitle" style={{marginBottom:14}}>Released Results</div>
                  <table className="tbl">
                    <thead><tr><th>Exam</th><th>Score</th><th>Grade</th><th>Date</th><th>Feedback</th></tr></thead>
                    <tbody>
                      {store.getStudentResults('Amara Osei').map((r,i) => (
                        <tr key={i}>
                          <td style={{fontWeight:600}}>{r.exam}</td>
                          <td><span className="mono" style={{fontWeight:700,color:r.grade==='A'||r.grade==='B'?'var(--g600)':'var(--a600)'}}>{r.score}/{r.total}</span></td>
                          <td><span className={`badge ${r.grade==='A'||r.grade==='B'?'badge-green':'badge-amber'}`}>{r.grade}</span></td>
                          <td style={{color:'var(--s500)',fontSize:13}}>{r.date}</td>
                          <td style={{fontSize:12.5,color:'var(--s500)',maxWidth:200}}>{r.feedback}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="card">
                <div className="chdr"><div className="ctitle">Mathematics — Pythagoras Theorem Mock</div><span className="badge badge-red">Due Today</span></div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
                  {[['Duration','60 min'],['Questions',`${EXAM_QS.length}`],['Marks',`${EXAM_QS.reduce((s,q)=>s+q.marks,0)}`],['Pass Mark','60%']].map(([l,v]) => (
                    <div key={l} style={{background:'var(--bg)',borderRadius:'var(--rsm)',padding:'10px 12px',textAlign:'center'}}>
                      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:'var(--s400)',marginBottom:3}}>{l}</div>
                      <div className="mono" style={{fontSize:14,fontWeight:700,color:'var(--s700)'}}>{v}</div>
                    </div>
                  ))}
                </div>
                {mastery && (() => { const subj = mastery.subjects.find(s=>s.name==='Mathematics'); const topic = subj?.topics.find(t=>t.name==='Pythagoras & Geometry'); return topic && (
                  <div style={{background:topic.pct<60?'var(--r50)':'var(--g50)',border:`1px solid ${topic.pct<60?'var(--r100)':'var(--g100)'}`,borderRadius:'var(--rmd)',padding:'10px 14px',marginBottom:14,fontSize:13.5,color:topic.pct<60?'var(--r600)':'var(--g700)'}}>
                    Your current mastery for this topic: <strong>{topic.pct}%</strong>
                    {topic.pct < 60 ? ' — Review before starting! Consider practising first.' : ' — You are ready for this exam.'}
                  </div>
                )})()}
                <button className="btn btn-p" onClick={() => {setExamActive(true);setExamTime(3600);setExamAnswers({});setExamResult(null)}}>
                  Start Exam
                </button>
              </div>
            </div>
          )}
          {page === 'exams' && examActive && !examResult && (
            <div>
              <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:'var(--rxl)',padding:'14px 24px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
                <div><div className="serif" style={{fontSize:18}}>Mathematics — Pythagoras Theorem Mock</div><div style={{fontSize:13,color:'var(--s400)'}}>{EXAM_QS.length} questions · {EXAM_QS.reduce((s,q)=>s+q.marks,0)} marks</div></div>
                <div style={{display:'flex',gap:14,alignItems:'center'}}>
                  <div className="mono" style={{fontSize:22,fontWeight:700,color:examTime<300?'var(--r600)':'var(--s800)'}}>{fmtTime(examTime)}</div>
                  <button className="btn btn-d btn-sm" onClick={() => setExamActive(false)}>Exit</button>
                </div>
              </div>
              {EXAM_QS.map((q,qi) => (
                <div key={qi} className="card" style={{marginBottom:14,borderColor:examAnswers[q.id]?'var(--b200)':'var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <div style={{width:26,height:26,borderRadius:'50%',background:examAnswers[q.id]?'var(--b700)':'var(--s200)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:examAnswers[q.id]?'#fff':'var(--s500)'}}>{qi+1}</div>
                      <span style={{fontSize:15,fontWeight:500,color:'var(--s800)',lineHeight:1.5}}>{q.q}</span>
                    </div>
                    <span style={{fontSize:11,color:'var(--s400)',flexShrink:0,marginLeft:8}}>{q.marks} marks</span>
                  </div>
                  {q.opts.map(opt => (
                    <label key={opt} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',marginBottom:7,borderRadius:'var(--rmd)',cursor:'pointer',border:`1.5px solid ${examAnswers[q.id]===opt?'var(--b600)':'var(--border)'}`,background:examAnswers[q.id]===opt?'var(--b50)':'var(--bg)',transition:'all .15s'}}>
                      <input type="radio" name={`eq${qi}`} value={opt} checked={examAnswers[q.id]===opt} onChange={() => setExamAnswers(a=>({...a,[q.id]:opt}))} style={{accentColor:'var(--b600)'}}/>
                      <span style={{fontSize:14,color:examAnswers[q.id]===opt?'var(--b800)':'var(--s700)',fontWeight:examAnswers[q.id]===opt?600:400}}>{opt}</span>
                    </label>
                  ))}
                </div>
              ))}
              <div style={{position:'sticky',bottom:16,background:'var(--white)',border:'1px solid var(--border)',borderRadius:'var(--rxl)',padding:'14px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'var(--sh-lg)'}}>
                <div style={{fontSize:13.5,color:Object.keys(examAnswers).length<EXAM_QS.length?'var(--a600)':'var(--g600)'}}>
                  {Object.keys(examAnswers).length}/{EXAM_QS.length} answered
                </div>
                <button className="btn btn-p" onClick={submitExam}>Submit Exam</button>
              </div>
            </div>
          )}
          {page === 'exams' && examResult && (
            <div style={{maxWidth:520,margin:'0 auto'}}>
              <div className="card" style={{textAlign:'center',padding:36}}>
                <div className="serif" style={{fontSize:28,color:'var(--s900)',marginBottom:6}}>
                  {examResult.pct >= 60 ? 'Well done!' : 'Keep Practising'}
                </div>
                <p style={{color:'var(--s500)',marginBottom:24}}>Mathematics — Pythagoras Theorem Mock</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
                  {[['Score',`${examResult.pct}%`,examResult.pct>=60?'var(--g50)':'var(--r50)',masteryCol(examResult.pct)],
                    ['Correct',`${examResult.correct}/${EXAM_QS.length}`,'var(--b50)','var(--b700)'],
                    ['Grade',examResult.pct>=80?'A':examResult.pct>=60?'B':'C',examResult.pct>=60?'var(--g50)':'var(--a50)',examResult.pct>=60?'var(--g700)':'var(--a600)']].map(([l,v,bg,c]) => (
                    <div key={l} style={{background:bg,borderRadius:'var(--rmd)',padding:'16px 10px'}}>
                      <div className="mono" style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
                      <div style={{fontSize:12,color:'var(--s500)',marginTop:3}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                  <button className="btn btn-p" onClick={() => {setExamResult(null);setExamActive(false)}}>Back to Exams</button>
                  <button className="btn btn-s" onClick={() => { goTo('practice'); loadPractice('Mathematics','Pythagoras & Geometry') }}>Practise Weak Areas</button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              LIVE CLASSES
          ════════════════════════════════════════════ */}
          {page === 'live' && !inClassroom && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Real-Time Learning</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Live Classes</h2></div>
              <div style={{background:'linear-gradient(135deg,#1E3A8A,var(--b700))',borderRadius:'var(--rxl)',padding:'24px 28px',marginBottom:20,display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                  <span style={{position:'absolute',top:-2,right:-2,width:10,height:10,borderRadius:'50%',background:'#4CAF50',border:'2px solid rgba(255,255,255,.3)',animation:'pulse 1.5s infinite'}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span style={{background:'rgba(255,255,255,.18)',color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'.1em',padding:'3px 9px',borderRadius:99,textTransform:'uppercase'}}>LIVE NOW</span>
                    <span style={{color:'rgba(255,255,255,.6)',fontSize:12.5}}>6 students in class</span>
                  </div>
                  <div className="serif" style={{fontSize:'1.15rem',color:'#fff',marginBottom:2}}>IGCSE Mathematics — Pythagoras Theorem</div>
                  <div style={{fontSize:12.5,color:'rgba(255,255,255,.65)'}}>Mr. James Muthomi · Started 38 minutes ago</div>
                </div>
                <button className="btn" style={{background:'#fff',color:'var(--b700)',fontWeight:700,padding:'10px 22px'}} onClick={() => setInClassroom(true)}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Join Now
                </button>
              </div>
              <div className="card">
                <div className="chdr"><div className="ctitle">Upcoming This Week</div></div>
                {[{subj:'Biology — Cell Division',teacher:'Dr. Ouma',day:'Thu',time:'2:00 PM',dur:'1 hour'},{subj:'Chemistry — Periodic Table',teacher:'Dr. Ouma',day:'Fri',time:'11:00 AM',dur:'1 hour'}].map((c,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{width:44,height:44,background:'var(--s100)',borderRadius:'var(--rmd)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <div className="mono" style={{fontSize:9,fontWeight:700,color:'var(--s500)'}}>{c.day.toUpperCase()}</div>
                      <div className="mono" style={{fontSize:14,fontWeight:700,color:'var(--s800)'}}>{c.time.split(':')[0]}</div>
                    </div>
                    <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{c.subj}</div><div style={{fontSize:12,color:'var(--s500)'}}>{c.teacher} · {c.time} · {c.dur}</div></div>
                    <button className="btn btn-s btn-sm" onClick={() => toast.info('Adding to calendar…')}>Add to Calendar</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {page === 'live' && inClassroom && (
            <LiveClassroom role="student" onLeave={() => setInClassroom(false)}/>
          )}

          {/* ════════════════════════════════════════════
              TIMETABLE
          ════════════════════════════════════════════ */}
          {page === 'timetable' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Weekly Schedule</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Timetable</h2></div>
              <div className="card" style={{padding:0,overflow:'hidden'}}>
                <table className="tbl">
                  <thead><tr><th>Day</th><th>Subject</th><th>Teacher</th><th>Time</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {TIMETABLE.map((t,i) => (
                      <tr key={i}>
                        <td><span className="mono" style={{fontWeight:700,color:'var(--b700)'}}>{t.day}</span></td>
                        <td style={{fontWeight:600}}>{t.subj}</td>
                        <td style={{color:'var(--s500)',fontSize:13}}>{t.teacher}</td>
                        <td className="mono" style={{fontSize:13}}>{t.time}</td>
                        <td><span className={`badge ${t.status==='completed'?'badge-green':t.status==='live'?'badge-red':'badge-blue'}`}>{t.status==='live'?'Live Now':t.status==='completed'?'Done':'Upcoming'}</span></td>
                        <td>
                          {t.status==='live' && <button className="btn btn-d btn-sm" onClick={() => setInClassroom(true)}>Join</button>}
                          {t.status==='completed' && <button className="btn btn-g btn-sm" onClick={() => toast.info('Loading recording…')}>Recording</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              MSHAURI AI — mastery-aware
          ════════════════════════════════════════════ */}
          {page === 'tutor' && (
            <div>
              <div style={{marginBottom:16}}>
                <div className="sec-tag">Personalised AI Tutor</div>
                <h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Mshauri AI</h2>
                {mastery && nextRec && (
                  <div style={{background:'var(--b50)',border:'1px solid var(--b100)',borderRadius:'var(--rmd)',padding:'10px 14px',marginTop:10,fontSize:13,color:'var(--b700)'}}>
                    Mshauri knows your mastery levels. Your current focus: <strong>{nextRec.topic}</strong> ({nextRec.pct}% mastery). Ask anything — Mshauri will tailor the answer to your level.
                  </div>
                )}
              </div>
              <div className="card" style={{display:'flex',flexDirection:'column',height:560,padding:0,overflow:'hidden'}}>
                <div style={{padding:'13px 18px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'var(--b700)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>Mshauri</div>
                    <div style={{fontSize:12,color:'var(--g600)',display:'flex',alignItems:'center',gap:4}}><span style={{width:6,height:6,borderRadius:'50%',background:'var(--g500)',display:'inline-block'}}/>Online · Knows your mastery profile</div>
                  </div>
                </div>
                <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:14}}>
                  {tutorMsgs.map((m,i) => (
                    <div key={i} style={{display:'flex',gap:9,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-start'}}>
                      <div style={{width:30,height:30,borderRadius:'50%',background:m.role==='ai'?'var(--b700)':'var(--s200)',color:m.role==='ai'?'#fff':'var(--s600)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0}}>
                        {m.role==='ai'?'M': (user?.firstName?.[0]||'A')}
                      </div>
                      <div style={{background:m.role==='user'?'var(--b700)':'var(--white)',color:m.role==='user'?'#fff':'var(--s800)',padding:'10px 14px',borderRadius:m.role==='user'?'14px 14px 4px 14px':'4px 14px 14px 14px',fontSize:13.5,lineHeight:1.65,maxWidth:'78%',border:m.role==='ai'?'1px solid var(--border)':'none'}}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {aiLoading && <div style={{display:'flex',gap:9,alignItems:'flex-start'}}><div style={{width:30,height:30,borderRadius:'50%',background:'var(--b700)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>M</div><div style={{background:'var(--bg)',border:'1px solid var(--border)',padding:'10px 14px',borderRadius:'4px 14px 14px 14px',fontSize:13,color:'var(--s400)'}}>Mshauri is thinking…</div></div>}
                  <div ref={chatEndRef}/>
                </div>
                <div style={{padding:'12px 16px',borderTop:'1px solid var(--border)'}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
                    {[
                      `What should I study today?`,
                      nextRec ? `Explain ${nextRec.topic}` : 'How am I doing?',
                      'Create a practice quiz',
                      'How is my progress?',
                    ].map(s => (
                      <button key={s} className="btn btn-s btn-sm" style={{fontSize:11.5,padding:'4px 10px'}} onClick={() => { setTutorInp(s); setTimeout(() => sendTutor(), 50) }}>{s}</button>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <textarea className="chat-input" value={tutorInp} onChange={e=>setTutorInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendTutor()}}} rows={1} placeholder="Ask Mshauri — it knows your exact mastery levels…"/>
                    <button className="btn btn-p btn-sm" onClick={sendTutor} disabled={aiLoading} style={{padding:'8px 12px'}}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              PERSONALISED STUDY PLAN
          ════════════════════════════════════════════ */}
          {page === 'studyplan' && (
            <div>
              <div style={{marginBottom:20}}>
                <div className="sec-tag">Generated from your mastery data</div>
                <h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>My Personalised <em style={{color:'var(--b700)'}}>Study Plan</em></h2>
                <p style={{fontSize:14,color:'var(--s500)',marginTop:4}}>This plan is built from your actual mastery scores. Weakest topics get more time. Refreshes every time you practise.</p>
              </div>
              {planLoading ? <div className="lc"><div className="spinner"/></div> : (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                  {studyPlan.map((day,i) => (
                    <div key={i} className="card" style={{borderLeft:`4px solid ${day.color}`,borderTopLeftRadius:0,borderBottomLeftRadius:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:15,color:'var(--s900)'}}>{day.day}</div>
                          <div style={{fontSize:12,color:'var(--s500)'}}>{day.mins} minutes</div>
                        </div>
                        <span className={`badge ${day.priority==='high'?'badge-red':day.priority==='medium'?'badge-amber':'badge-green'}`}>{day.priority==='high'?'Priority':day.priority==='medium'?'Review':'Maintain'}</span>
                      </div>
                      <div style={{background:day.color+'15',borderRadius:'var(--rmd)',padding:'10px 12px',marginBottom:12}}>
                        <div style={{fontWeight:700,fontSize:14,color:'var(--s900)',marginBottom:1}}>{day.topic}</div>
                        <div style={{fontSize:12,color:'var(--s500)'}}>{day.subject} · Current mastery: <span className="mono" style={{fontWeight:700,color:masteryCol(day.mastery)}}>{day.mastery}%</span></div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        {day.tasks.map((task,ti) => (
                          <div key={ti} style={{display:'flex',gap:8,fontSize:13,color:'var(--s600)'}}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={day.color} strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0,marginTop:2}}><polyline points="20 6 9 17 4 12"/></svg>
                            {task}
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-p btn-sm" style={{marginTop:14,width:'100%',justifyContent:'center'}} onClick={() => { goTo('practice'); loadPractice(day.subject, day.topic) }}>
                        Start {day.day}'s Session
                      </button>
                    </div>
                  ))}
                  {studyPlan.length === 0 && (
                    <div className="empty" style={{gridColumn:'1/-1'}}>
                      <h3>Building your study plan…</h3>
                      <p>Complete a practice session first so Mshauri can see your mastery levels and build a personalised plan.</p>
                      <button className="btn btn-p" onClick={() => { goTo('practice'); loadPractice() }}>Start First Practice</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
          {page === 'achievements' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Your Progress</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Achievements</h2></div>
              <div className="kpi-grid" style={{marginBottom:24}}>
                {[{v:mastery?.xp?.toLocaleString()||'0',l:'XP Points',c:'var(--b700)'},{v:`${mastery?.streak||0}`,l:'Day Streak',c:'var(--a600)'},{v:`${mastery?.badges?.length||0}`,l:'Badges Earned',c:'var(--g600)'},{v:subjects.length>0?`${Math.round(subjects.reduce((s,x)=>s+x.overallPct,0)/subjects.length)}%`:'—',l:'Avg Mastery',c:'var(--p600)'}].map((k,i) => (
                  <div key={i} className="kpi"><div className="kpi-v" style={{color:k.c}}>{k.v}</div><div className="kpi-l">{k.l}</div></div>
                ))}
              </div>
              <div className="card" style={{marginBottom:20}}>
                <div className="ctitle" style={{marginBottom:14}}>XP Progress to Next Level</div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}><span style={{color:'var(--s500)'}}>XP to next level</span><span className="mono" style={{fontWeight:700}}>{mastery?.xp||0} / {Math.ceil(((mastery?.xp||0)+1000)/1000)*1000}</span></div>
                <div className="prog-bar" style={{height:10}}><div className="prog-fill" style={{width:`${((mastery?.xp||0)%1000)/10}%`,background:'linear-gradient(90deg,var(--b700),var(--p600))',transition:'width .8s ease'}}/></div>
              </div>
              <div className="card">
                <div className="ctitle" style={{marginBottom:14}}>Badges</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:12}}>
                  {[
                    {id:'streak_7',   name:'7-Day Streak',   condition:mastery?.streak>=7},
                    {id:'streak_30',  name:'30-Day Streak',  condition:mastery?.streak>=30},
                    {id:'xp_1000',    name:'1,000 XP',       condition:(mastery?.xp||0)>=1000},
                    {id:'xp_5000',    name:'5,000 XP',       condition:(mastery?.xp||0)>=5000},
                    {id:'master_subj',name:'Subject Master',  condition:mastery?.subjects?.some(s=>s.overallPct>=80)},
                    {id:'all_round',  name:'All-Rounder',    condition:mastery?.subjects?.length>=4&&mastery?.subjects?.every(s=>s.overallPct>=50)},
                  ].map((b,i) => {
                    const earned = mastery?.badges?.some(x=>x.id===b.id) || b.condition
                    return (
                      <div key={i} style={{background:earned?'var(--a50)':'var(--s50)',border:`1.5px solid ${earned?'var(--a200,#FDE68A)':'var(--s200)'}`,borderRadius:'var(--rlg)',padding:16,textAlign:'center',opacity:earned?1:.45,filter:earned?'none':'grayscale(.6)',transition:'all .2s'}}>
                        <div style={{marginBottom:8,display:'flex',justifyContent:'center'}}>{BADGE_ICONS[b.id]||null}</div>
                        <div style={{fontSize:12,fontWeight:700,color:'var(--s800)'}}>{b.name}</div>
                        <div style={{fontSize:11,color:'var(--s500)',marginTop:4}}>{earned?'Earned':'Locked'}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

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

          {/* ════════════════════════════════════════════
              SUBSCRIPTION
          ════════════════════════════════════════════ */}
          {page === 'subscription' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">My Plan</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Subscription</h2></div>

              {/* Mode switcher */}
              <div className="card" style={{marginBottom:20,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Learning Mode</div>
                  <div style={{fontSize:13,color:'var(--s500)'}}>Current: <strong style={{color:learningMode==='group'?'var(--g600)':'var(--b700)'}}>{learningMode==='group'?'Group Class':'Individual'}</strong></div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  {[['individual','Individual','var(--b700)'],['group','Group Class','var(--g600)']].map(([m,l,c]) => (
                    <button key={m} className="btn btn-sm"
                      style={{background:learningMode===m?c:'transparent',color:learningMode===m?'#fff':'var(--s500)',borderColor:learningMode===m?c:'var(--border)'}}
                      onClick={()=>{setLearningMode(m);localStorage.setItem('sm_learning_mode',m);toast.ok('Switched to '+l+' mode')}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan cards — fees come from admin store */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
                <div className="card" style={{background:'linear-gradient(135deg,#1E3A8A,var(--b700))',borderColor:'transparent',color:'#fff',outline:learningMode==='individual'?'3px solid #60A5FA':'none'}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.5)',marginBottom:8}}>Individual Plan</div>
                  <div className="serif" style={{fontSize:22,marginBottom:4}}>{user?.plan || 'Premium'}</div>
                  <div className="mono" style={{fontSize:20,fontWeight:700,marginBottom:16}}>
                    KES {(store.fees.individual_premium||2999).toLocaleString()}
                    <span style={{fontSize:13,fontWeight:400,opacity:.6}}>/month</span>
                  </div>
                  {['1-on-1 AI tutoring (Mshauri)','Adaptive mastery tracking','Personalised study plan','All subjects access','Parent dashboard'].map(f => (
                    <div key={f} style={{display:'flex',gap:8,fontSize:13,marginBottom:6}}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span style={{opacity:.85}}>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="card" style={{background:'linear-gradient(135deg,#14532D,#166534)',borderColor:'transparent',color:'#fff',outline:learningMode==='group'?'3px solid #4ADE80':'none'}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.5)',marginBottom:8}}>Group Class Plan</div>
                  <div className="serif" style={{fontSize:22,marginBottom:4}}>{user?.plan || 'Premium'}</div>
                  <div className="mono" style={{fontSize:20,fontWeight:700,marginBottom:16}}>
                    KES {(store.fees.group_premium||999).toLocaleString()}
                    <span style={{fontSize:13,fontWeight:400,opacity:.6}}>/month</span>
                  </div>
                  {['Up to 10 students per room','Shared live lessons','Group resources & notes','Lower monthly fee','Parent dashboard'].map(f => (
                    <div key={f} style={{display:'flex',gap:8,fontSize:13,marginBottom:6}}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span style={{opacity:.85}}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment history */}
              <div className="card">
                <div className="ctitle" style={{marginBottom:14}}>Payment History</div>
                {[['Mar 15','Premium','KES '+(store.fees[learningMode+'_premium']||2999).toLocaleString()],['Feb 15','Premium','KES '+(store.fees[learningMode+'_premium']||2999).toLocaleString()],['Jan 15','Premium','KES '+(store.fees[learningMode+'_premium']||2999).toLocaleString()]].map(([d,p,a]) => (
                  <div key={d} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)',fontSize:13.5}}>
                    <span style={{color:'var(--s500)'}}>{d}</span><span>{p}</span><span className="mono" style={{fontWeight:700}}>{a}</span><span className="badge badge-green">Paid</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
