/**
 * QuizGame.jsx  v2
 * Full-screen quiz game — solo + competition modes.
 * Wired into LessonPlayerTab and StudentPortal achievements.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../../context/ctx.jsx'

const C = {
  crimson:'#7D1025', crimsonD:'#5A0B1B', gold:'#C9A030', cream:'#FDFAF4',
  ink:'#1A0F0E', s100:'#F4EFEB', s400:'#9A8F8B', s500:'#857973', s700:'#564844',
  green:'#059669', greenL:'#D1FAE5', red:'#DC2626', redL:'#FEE2E2', blue:'#2563EB',
}

// ── Confetti ─────────────────────────────────────────
function Confetti({ show }) {
  if (!show) return null
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id:i, x: Math.random()*100,
    color:['#C9A030','#7D1025','#22C55E','#3B82F6','#F59E0B','#EC4899','#8B5CF6','#06B6D4'][i%8],
    size: 6 + Math.random()*10, delay: Math.random()*0.5,
    rot: Math.random()*360, shape: Math.random()>0.5 ? '50%' : '2px',
  }))
  return (
    <div style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:9999,overflow:'hidden' }}>
      <style>{`
        @keyframes fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
        @keyframes flowerPop{0%{transform:scale(0) rotate(0deg);opacity:0}40%{opacity:1}60%{transform:scale(1.3) rotate(180deg);opacity:1}100%{transform:scale(0.8) rotate(360deg);opacity:0}}
        @keyframes streakFire{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
      `}</style>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:`${p.x}%`, top:'-20px',
          width:p.size, height:p.size, background:p.color, borderRadius:p.shape,
          animation:`fall ${1.5+Math.random()}s ${p.delay}s ease-in forwards`,
          transform:`rotate(${p.rot}deg)`,
        }}/>
      ))}
      {/* Flower emojis */}
      {['🌸','🌺','🌼','🌻','🎉','⭐','🏆','✨'].map((e,i) => (
        <div key={'f'+i} style={{
          position:'absolute', left:`${10+i*12}%`, top:'20%',
          fontSize: 32+Math.random()*20,
          animation:`flowerPop ${1.2+Math.random()*0.5}s ${i*0.1}s ease-in-out forwards`,
        }}>{e}</div>
      ))}
    </div>
  )
}

// ── Floating +XP popup ────────────────────────────────
function XPPop({ xp, show }) {
  if (!show) return null
  return (
    <div style={{
      position:'fixed', top:'20%', right:24, zIndex:99999,
      background:C.gold, color:'#fff',
      fontWeight:900, fontSize:28, padding:'10px 20px', borderRadius:12,
      boxShadow:`0 8px 30px ${C.gold}60`,
      animation:'xpPop 1.2s ease forwards',
    }}>
      <style>{`@keyframes xpPop{0%{transform:translateY(0) scale(0.5);opacity:0}20%{opacity:1;transform:translateY(-10px) scale(1.2)}80%{opacity:1;transform:translateY(-40px) scale(1)}100%{opacity:0;transform:translateY(-60px) scale(0.8)}}`}</style>
      +{xp} XP ⭐
    </div>
  )
}

// ── Sound engine ──────────────────────────────────────
function useSounds() {
  const ctx = useRef(null)
  const get = () => {
    if (!ctx.current) try { ctx.current = new (window.AudioContext||window.webkitAudioContext)() } catch {}
    return ctx.current
  }
  const tone = (freq, dur, type='sine', vol=0.3) => {
    try {
      const ac=get(); if(!ac) return
      const o=ac.createOscillator(), g=ac.createGain()
      o.connect(g); g.connect(ac.destination)
      o.type=type; o.frequency.value=freq
      g.gain.setValueAtTime(vol, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+dur)
      o.start(ac.currentTime); o.stop(ac.currentTime+dur)
    } catch {}
  }
  return {
    correct: () => { tone(523,.08); setTimeout(()=>tone(659,.08),90); setTimeout(()=>tone(784,.1),180); setTimeout(()=>tone(1047,.25),270) },
    wrong:   () => { tone(200,.15,'sawtooth',.4); setTimeout(()=>tone(150,.3,'sawtooth',.3),150) },
    tick:    () => tone(800,.03,'square',.08),
    complete:() => { [523,659,784,1047,784,1047,1319].forEach((f,i)=>setTimeout(()=>tone(f,.12),i*100)) },
    levelUp: () => { [523,659,784,880,1047].forEach((f,i)=>setTimeout(()=>tone(f,.15),i*80)) },
  }
}

// ── Math/Formula text renderer ────────────────────────
function MathText({ text }) {
  if (!text) return null
  const parts = text.split(/(\\\(.*?\\\)|\$.*?\$|sqrt\([^)]+\)|\d+\^\d+|[⁰¹²³⁴⁵⁶⁷⁸⁹]+|[₀₁₂₃₄₅₆₇₈₉]+)/g)
  return (
    <span>
      {parts.map((p, i) => {
        if (p.startsWith('\\(') || p.startsWith('$')) {
          const inner = p.replace(/^\\\(|\\\)$|^\$|\$$/g,'').trim()
          return <span key={i} style={{ fontFamily:'Georgia,serif', fontStyle:'italic', fontSize:'1.05em', color:C.crimson }}>{inner}</span>
        }
        if (/^sqrt\(/.test(p)) {
          const inner = p.match(/sqrt\(([^)]+)\)/)?.[1]||''
          return <span key={i} style={{ fontFamily:'Georgia,serif' }}>√<span style={{ borderTop:'1.5px solid currentColor', paddingTop:1 }}>{inner}</span></span>
        }
        if (/\d+\^\d+/.test(p)) {
          const [base,exp] = p.split('^')
          return <span key={i}>{base}<sup style={{ fontSize:'.7em' }}>{exp}</sup></span>
        }
        return <span key={i}>{p}</span>
      })}
    </span>
  )
}

// ── Timer ring ────────────────────────────────────────
function TimerRing({ total, left }) {
  const pct = left / total
  const r = 26, circ = 2 * Math.PI * r
  const color = left <= 5 ? C.red : left <= 10 ? '#F59E0B' : C.green
  return (
    <div style={{ position:'relative', width:68, height:68, flexShrink:0 }}>
      <svg width="68" height="68" viewBox="0 0 68 68" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="34" cy="34" r={r} fill="none" stroke={C.s100} strokeWidth="5"/>
        <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${circ * pct} ${circ}`}
          style={{ transition:'stroke-dasharray .3s linear, stroke .5s' }}/>
      </svg>
      <div style={{
        position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:18, fontWeight:900, color,
      }}>{left}</div>
    </div>
  )
}

// ── Main QuizGame ─────────────────────────────────────
export default function QuizGame({ subject, topic, curriculum, grade, difficulty, onClose, user }) {
  const snd = useSounds()

  // ── Phase: setup | loading | playing | result
  const [phase,    setPhase]   = useState('setup')
  const [mode,     setMode]    = useState('solo')   // solo | host | join
  const [compCode, setCompCode]= useState('')
  const [joinCode, setJoinCode]= useState('')

  // Quiz state
  const [session,  setSession] = useState(null)
  const [questions,setQns]     = useState([])
  const [qIndex,   setQIndex]  = useState(0)
  const [answers,  setAnswers] = useState({})   // {qId: answer}
  const [score,    setScore]   = useState(0)
  const [streak,   setStreak]  = useState(0)
  const [xp,       setXp]      = useState(0)

  // UI state
  const [selected,  setSelected] = useState(null)
  const [revealed,  setRevealed] = useState(false)
  const [confetti,  setConfetti] = useState(false)
  const [xpPop,     setXpPop]   = useState(null)
  const [timeLeft,  setTimeLeft] = useState(30)
  const [timerOn,   setTimerOn] = useState(false)
  const [leaderboard, setLB]    = useState([])
  const [qCount,    setQCount]  = useState(10)
  const [selDiff,   setSelDiff] = useState(difficulty||'')
  const [loading,   setLoading] = useState(false)
  const [error,     setError]   = useState('')
  const timerRef = useRef(null)

  const q = questions[qIndex]

  // Timer tick
  useEffect(() => {
    if (!timerOn || !q) return
    setTimeLeft(30)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0 }
        if (t <= 6) snd.tick()
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [qIndex, timerOn, q])

  const handleTimeout = () => {
    if (!revealed) { setRevealed(true); setStreak(0) }
  }

  // Start quiz
  const startQuiz = async () => {
    setLoading(true); setError('')
    try {
      let res
      if (mode === 'host') {
        res = await api.post('/quiz/competition', { subject, topic, curriculum, grade, difficulty:selDiff, count:qCount })
        setCompCode(res.data?.data?.code || '')
        setSession(res.data?.data?.session)
        setQns(res.data?.data?.questions || [])
      } else if (mode === 'join') {
        res = await api.post('/quiz/join/'+joinCode.trim().toUpperCase())
        setSession(res.data?.data?.session)
        setQns(res.data?.data?.questions || [])
      } else {
        res = await api.post('/quiz/session', { subject, topic, curriculum, grade, difficulty:selDiff, count:qCount })
        setSession(res.data?.data?.session)
        setQns(res.data?.data?.questions || [])
      }
      setQIndex(0); setAnswers({}); setScore(0); setStreak(0); setXp(0)
      setPhase('playing'); setTimerOn(true)
    } catch(e) {
      setError(e?.response?.data?.message || 'Could not load quiz. No questions found for this selection.')
    }
    setLoading(false)
  }

  // Answer
  const answer = async (opt) => {
    if (revealed || selected) return
    clearInterval(timerRef.current)
    setSelected(opt)
    setRevealed(true)
    const correct = opt === q.correctAnswer
    const speedBonus = timeLeft >= 20 ? 5 : timeLeft >= 10 ? 2 : 0
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)

    if (correct) {
      const earned = 10 + speedBonus + (newStreak >= 5 ? 30 : newStreak >= 3 ? 15 : 0)
      setScore(s => s+1)
      setXp(x => x+earned)
      setXpPop(earned)
      setConfetti(true)
      snd.correct()
      setTimeout(() => { setConfetti(false); setXpPop(null) }, 2000)
    } else {
      snd.wrong()
    }

    setAnswers(a => ({ ...a, [q._id]: opt }))

    // Submit to backend
    if (session?._id) {
      try {
        await api.post('/quiz/answer', {
          sessionId: session._id, questionId: q._id,
          answer: opt, timeSpent: 30 - timeLeft,
        })
      } catch {}
    }

    // Auto-advance after 2.5s
    setTimeout(() => advance(), 2500)
  }

  const advance = () => {
    if (qIndex + 1 >= questions.length) {
      finishQuiz()
    } else {
      setQIndex(i => i+1)
      setSelected(null)
      setRevealed(false)
    }
  }

  const finishQuiz = async () => {
    setTimerOn(false)
    snd.complete()
    setPhase('result')

    // Submit completion
    if (session?._id) {
      try {
        const res = await api.post('/quiz/complete', { sessionId: session._id })
        if (res.data?.data?.leaderboard) setLB(res.data.data.leaderboard)
      } catch {}
    }

    // Fetch leaderboard
    try {
      const res = await api.get('/quiz/leaderboard', { params: { subject, curriculum } })
      if (res.data?.data?.leaderboard) setLB(res.data.data.leaderboard)
    } catch {}
  }

  const pct     = questions.length ? Math.round((score / questions.length) * 100) : 0
  const grade_l = pct >= 90 ? 'A*' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'E'
  const gradeColor = pct >= 70 ? C.green : pct >= 50 ? '#F59E0B' : C.red

  // ── SETUP SCREEN ─────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div style={{ minHeight:'100vh', background:C.cream, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ background:'#fff', borderRadius:20, maxWidth:520, width:'100%', overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,.15)' }}>
          {/* Header */}
          <div style={{ background:`linear-gradient(135deg,${C.crimson},${C.crimsonD})`, padding:'28px 32px' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:8 }}>
              Smartious Quiz
            </div>
            <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:28, color:'#fff', lineHeight:1.2 }}>
              {subject||'Quiz'} Challenge
            </div>
            {(topic||curriculum) && (
              <div style={{ fontSize:13, color:'rgba(255,255,255,.65)', marginTop:4 }}>{topic} · {curriculum}</div>
            )}
          </div>

          <div style={{ padding:'28px 32px' }}>
            {/* Mode selector */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:24 }}>
              {[['solo','🎯 Solo'],['host','🏆 Host Competition'],['join','🔗 Join']].map(([m,l]) => (
                <button key={m} onClick={()=>setMode(m)} style={{
                  padding:'12px 8px', borderRadius:10, border:`2px solid ${mode===m?C.crimson:C.s100}`,
                  background:mode===m?'#FDE7EC':'#fff', color:mode===m?C.crimson:C.s700,
                  fontWeight:700, fontSize:12, cursor:'pointer', textAlign:'center', lineHeight:1.4,
                }}>{l}</button>
              ))}
            </div>

            {mode === 'join' ? (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.crimson, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Competition Code</div>
                <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-letter code e.g. MATH42"
                  style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.s100}`, fontSize:18, textAlign:'center', letterSpacing:'.2em', fontWeight:800, boxSizing:'border-box', color:C.ink }}/>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:C.crimson, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Difficulty</div>
                  <select value={selDiff} onChange={e=>setSelDiff(e.target.value)}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`1.5px solid ${C.s100}`, fontSize:14, color:C.ink, background:'#fff' }}>
                    <option value="">Any level</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:C.crimson, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Questions</div>
                  <select value={qCount} onChange={e=>setQCount(parseInt(e.target.value))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`1.5px solid ${C.s100}`, fontSize:14, color:C.ink, background:'#fff' }}>
                    {[5,10,15,20].map(n=><option key={n} value={n}>{n} questions</option>)}
                  </select>
                </div>
              </div>
            )}

            {error && <div style={{ background:C.redL, color:C.red, padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:16 }}>{error}</div>}

            <button onClick={startQuiz} disabled={loading} style={{
              width:'100%', padding:'16px', borderRadius:12,
              background:loading?C.s400:C.crimson, color:'#fff',
              border:'none', fontSize:16, fontWeight:800, cursor:loading?'not-allowed':'pointer',
              letterSpacing:'.02em',
            }}>
              {loading ? '⏳ Loading questions...' : mode==='join' ? '🎮 Join Game!' : mode==='host' ? '🏆 Create Competition' : '🚀 Start Quiz!'}
            </button>

            {onClose && (
              <button onClick={onClose} style={{ width:'100%', marginTop:10, padding:'12px', borderRadius:10, background:'transparent', border:'none', color:C.s500, fontSize:14, cursor:'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── PLAYING ──────────────────────────────────────────
  if (phase === 'playing' && q) {
    return (
      <div style={{ minHeight:'100vh', background:C.cream, display:'flex', flexDirection:'column', fontFamily:"Inter,sans-serif" }}>
        <Confetti show={confetti}/>
        <XPPop xp={xpPop} show={!!xpPop}/>

        {/* Top bar */}
        <div style={{ background:`linear-gradient(135deg,${C.crimson},${C.crimsonD})`, padding:'14px 20px', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase' }}>{subject} · {topic||curriculum}</div>
            <div style={{ display:'flex', gap:16, marginTop:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ fontSize:10, color:'rgba(255,255,255,.6)', fontWeight:600 }}>SCORE</span>
                <span style={{ fontSize:18, fontWeight:900, color:'#F0CC5A' }}>{score}/{qIndex+1}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ fontSize:16 }}>{streak>=3?'🔥':streak>=1?'⚡':'💫'}</span>
                <span style={{ fontSize:16, fontWeight:900, color:streak>=3?'#F59E0B':'rgba(255,255,255,.8)' }}>×{streak}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ fontSize:10, color:'rgba(255,255,255,.6)', fontWeight:600 }}>XP</span>
                <span style={{ fontSize:16, fontWeight:800, color:C.gold }}>{xp}</span>
              </div>
            </div>
          </div>
          <TimerRing total={30} left={timeLeft}/>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.5)' }}>Q {qIndex+1}/{questions.length}</div>
            <div style={{ fontSize:10, marginTop:3 }}>
              {Array.from({length:questions.length}).map((_,i)=>(
                <span key={i} style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', margin:'0 1px',
                  background: i<qIndex ? (answers[questions[i]._id]===questions[i].correctAnswer?C.green:C.red)
                    : i===qIndex ? C.gold : 'rgba(255,255,255,.2)'
                }}/>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height:4, background:C.s100, flexShrink:0 }}>
          <div style={{ height:'100%', background:C.gold, width:`${((qIndex)/questions.length)*100}%`, transition:'width .4s' }}/>
        </div>

        {/* Question */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'24px 20px', maxWidth:700, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
          <div style={{
            background:'#fff', borderRadius:16, padding:'24px 28px', marginBottom:20,
            border:`2px solid ${revealed ? (selected===q.correctAnswer?C.green:C.red) : C.s100}`,
            boxShadow:'0 4px 20px rgba(0,0,0,.06)',
            transition:'border-color .3s',
          }}>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${C.crimson},${C.crimsonD})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:'#F0CC5A', fontSize:12, fontWeight:800 }}>{qIndex+1}</span>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.s400, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>
                  {q.topic||q.subject} · {q.difficulty}
                </div>
                <div style={{ fontSize:17, fontWeight:600, color:C.ink, lineHeight:1.6 }}>
                  <MathText text={q.questionText}/>
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div style={{ display:'grid', gridTemplateColumns: window.innerWidth>600 ? '1fr 1fr' : '1fr', gap:12 }}>
            {(q.options||[]).map((opt, i) => {
              const isCorrect  = opt === q.correctAnswer
              const isSelected = opt === selected
              const bg = !revealed ? '#fff'
                : isCorrect ? C.greenL
                : isSelected ? C.redL : '#fff'
              const border = !revealed ? C.s100
                : isCorrect ? C.green
                : isSelected ? C.red : C.s100
              const textColor = !revealed ? C.ink
                : isCorrect ? C.green
                : isSelected ? C.red : C.s400

              return (
                <button key={i} onClick={() => answer(opt)} disabled={revealed} style={{
                  background:bg, border:`2px solid ${border}`, borderRadius:12,
                  padding:'14px 18px', textAlign:'left', cursor:revealed?'default':'pointer',
                  display:'flex', alignItems:'center', gap:12, transition:'all .2s',
                  transform: isSelected&&revealed ? 'scale(0.98)' : 'scale(1)',
                }}>
                  <div style={{
                    width:28, height:28, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                    background: !revealed ? C.s100
                      : isCorrect ? C.green : isSelected ? C.red : C.s100,
                    fontWeight:800, fontSize:13, color: revealed&&(isCorrect||isSelected) ? '#fff' : C.s500,
                  }}>
                    {revealed && isCorrect ? '✓' : revealed && isSelected ? '✗' : ['A','B','C','D'][i]}
                  </div>
                  <span style={{ fontSize:14, fontWeight:500, color:textColor, lineHeight:1.5 }}>
                    <MathText text={opt}/>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {revealed && q.explanation && (
            <div style={{
              marginTop:16, padding:'14px 18px', borderRadius:12,
              background: selected===q.correctAnswer ? '#F0FDF4' : '#FFF7ED',
              border:`1.5px solid ${selected===q.correctAnswer?C.green:'#F59E0B'}`,
              animation:'fadeIn .3s ease',
            }}>
              <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:5, color: selected===q.correctAnswer?C.green:'#D97706' }}>
                {selected===q.correctAnswer ? '✓ Correct! Well done!' : '✗ Incorrect — learn from this:'}
              </div>
              <div style={{ fontSize:13, color:C.s700, lineHeight:1.6 }}>
                <MathText text={q.explanation}/>
              </div>
            </div>
          )}

          {/* Streak badge */}
          {streak >= 3 && (
            <div style={{
              position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)',
              background:`linear-gradient(135deg,#F59E0B,#D97706)`,
              color:'#fff', padding:'10px 24px', borderRadius:99, fontSize:15, fontWeight:800,
              boxShadow:'0 8px 24px rgba(245,158,11,.4)',
              animation:'streakFire .5s ease infinite alternate',
            }}>
              🔥 {streak} STREAK! Keep going!
            </div>
          )}

          {/* Competition code */}
          {compCode && (
            <div style={{ marginTop:16, padding:'12px 16px', borderRadius:10, background:'#EEF2FF', border:'1.5px solid #818CF8', textAlign:'center' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#4338CA', textTransform:'uppercase', marginBottom:4 }}>Share this code with friends</div>
              <div style={{ fontSize:28, fontWeight:900, color:'#3730A3', letterSpacing:'.2em' }}>{compCode}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── RESULT SCREEN ─────────────────────────────────────
  if (phase === 'result') {
    return (
      <div style={{ minHeight:'100vh', background:C.cream, padding:'24px 20px', fontFamily:"Inter,sans-serif" }}>
        <Confetti show={pct >= 70}/>

        <div style={{ maxWidth:600, margin:'0 auto' }}>
          {/* Hero card */}
          <div style={{
            background:`linear-gradient(135deg,${C.crimson},${C.crimsonD})`,
            borderRadius:20, padding:'32px 28px', textAlign:'center', marginBottom:20, color:'#fff',
          }}>
            <div style={{ fontSize:60 }}>
              {pct>=90?'🏆':pct>=70?'🌟':pct>=50?'👍':'💪'}
            </div>
            <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:32, marginTop:8 }}>
              {pct>=90?'Outstanding!':pct>=70?'Great Job!':pct>=50?'Well Done!':'Keep Practising!'}
            </div>
            <div style={{ fontSize:64, fontWeight:900, color:C.gold, margin:'8px 0', letterSpacing:'.02em' }}>{pct}%</div>
            <div style={{ fontSize:20, color:'rgba(255,255,255,.8)' }}>{score} / {questions.length} correct</div>
            <div style={{ display:'inline-block', background:gradeColor, color:'#fff', fontWeight:900, fontSize:18, padding:'6px 20px', borderRadius:99, marginTop:12 }}>
              Grade {grade_l}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
            {[
              { label:'XP Earned', val:`+${xp}`, icon:'⭐' },
              { label:'Best Streak', val:`🔥${streak}`, icon:'' },
              { label:'Subject', val:subject, icon:'📚' },
            ].map(s => (
              <div key={s.label} style={{ background:'#fff', borderRadius:12, padding:'16px 12px', textAlign:'center', border:`1px solid ${C.s100}` }}>
                <div style={{ fontSize:22 }}>{s.icon}</div>
                <div style={{ fontSize:18, fontWeight:900, color:C.crimson, marginTop:4 }}>{s.val}</div>
                <div style={{ fontSize:10, fontWeight:700, color:C.s400, textTransform:'uppercase', letterSpacing:'.06em', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Question review */}
          <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:`1px solid ${C.s100}`, marginBottom:20 }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.s100}`, fontWeight:800, fontSize:14, color:C.ink }}>📋 Review Answers</div>
            {questions.map((q,i) => {
              const given = answers[q._id]
              const correct = given === q.correctAnswer
              return (
                <div key={q._id} style={{ padding:'14px 20px', borderBottom:`1px solid ${C.s100}`, display:'flex', gap:12, alignItems:'flex-start' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:correct?C.greenL:C.redL, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>
                    {correct?'✓':'✗'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:C.ink, lineHeight:1.5, marginBottom:4 }}>
                      <MathText text={q.questionText}/>
                    </div>
                    {!correct && (
                      <>
                        <div style={{ fontSize:12, color:C.red }}>Your answer: {given||'(no answer)'}</div>
                        <div style={{ fontSize:12, color:C.green, fontWeight:600 }}>Correct: {q.correctAnswer}</div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:`1px solid ${C.s100}`, marginBottom:20 }}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.s100}`, fontWeight:800, fontSize:14, color:C.ink }}>🏆 Class Leaderboard</div>
              {leaderboard.slice(0,10).map((e,i) => (
                <div key={e.studentId||i} style={{ padding:'12px 20px', borderBottom:`1px solid ${C.s100}`, display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:i===0?C.gold:i===1?'#C0C0C0':i===2?'#CD7F32':C.s100, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, color:i<3?'#fff':C.s500 }}>
                    {i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}
                  </div>
                  <div style={{ flex:1, fontSize:14, fontWeight:600, color:C.ink }}>{e.studentName}</div>
                  <div style={{ fontWeight:800, color:C.crimson }}>{e.totalXP} XP</div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <button onClick={() => { setPhase('setup'); setQIndex(0); setAnswers({}); setScore(0); setStreak(0); setXp(0); setSelected(null); setRevealed(false) }}
              style={{ padding:'14px', borderRadius:12, background:C.crimson, color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer' }}>
              🔄 Play Again
            </button>
            {onClose && (
              <button onClick={onClose}
                style={{ padding:'14px', borderRadius:12, background:'#fff', color:C.crimson, border:`2px solid ${C.crimson}`, fontSize:15, fontWeight:700, cursor:'pointer' }}>
                ✓ Done
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
