// ═══════════════════════════════════════════════════════════
// AchievementTab.jsx  — Student achievement hub
// Shows XP, level, badges, leaderboard, subject stats
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { api } from '../../context/ctx.jsx'

const C = {
  crimson:'#7D1025',crimsonD:'#5A0B1B',gold:'#C9A030',goldPale:'#FBF6E3',
  cream:'#FDFAF4',ink:'#1A0F0E',s100:'#F4EFEB',s300:'#D4CBC6',s400:'#9A8F8B',
  s500:'#857973',s700:'#564844',s900:'#261A17',green:'#059669',greenL:'#D1FAE5',
}


// ── Coloured SVG badge medals ──────────────────────────────────────
// Each badge is a gradient medal with a white pictogram, drawn in SVG
// so it renders identically on every device (no OS emoji).
const BADGE_ART = {
  first_quiz:   { c:['#14B8A6','#0F766E'], g:<path d="M7 3h2v18H7zm3 1h8l-2.2 3L18 10h-8z"/> },
  streak_3:     { c:['#FB923C','#EA580C'], g:<path d="M12 2c1 3-2 4.5-2 7a2 2 0 0 0 4 .2C15.5 8 17 6.5 17 4c2.5 2 4 5 4 8a9 9 0 1 1-18 0c0-2.5 1-4.8 2.6-6.4C6.4 8 8 9 9 8.6 8.4 6 10 3.4 12 2z"/> },
  streak_5:     { c:['#EF4444','#B91C1C'], g:<path d="M13 2 4.5 13.5H10L8.5 22 19 10h-6z"/> },
  perfect_10:   { c:['#8B5CF6','#6D28D9'], g:<path d="M12 2l6 6-6 14L6 8zm-3.6 6L12 5l3.6 3L12 17.5z"/> },
  century:      { c:['#F59E0B','#B45309'], g:<g><circle cx="12" cy="10" r="6"/><path d="M8.5 15.5 7 22l5-2.6L17 22l-1.5-6.5a7.5 7.5 0 0 1-7 0z"/><text x="12" y="12.6" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#B45309">100</text></g> },
  math_master:  { c:['#3B82F6','#1D4ED8'], g:<g><path d="M5 5h14v2.5H9.5c2 2 3 4 3 6.5a5.5 5.5 0 0 1-9.4 3.9l1.7-1.7A3.1 3.1 0 0 0 10 14c0-2.4-1.4-4.5-4-6.5V5z"/></g> },
  science_star: { c:['#22C55E','#15803D'], g:<path d="M10 2h4v2h-.5v5l4.8 8.1A2 2 0 0 1 16.6 20H7.4a2 2 0 0 1-1.7-2.9L10.5 9V4H10zm2.5 8.5-1.8 3h3.6z"/> },
  speed_demon:  { c:['#EAB308','#A16207'], g:<g><circle cx="12" cy="13" r="8" fillOpacity=".35"/><path d="M12 7v6l4.2 2.5-1 1.7L10 14V7zM9 2h6v2H9z"/></g> },
  xp_1000:      { c:['#C9A030','#7D1025'], g:<path d="M12 2l2.7 6 6.3.7-4.7 4.3 1.3 6.3L12 16l-5.6 3.3L7.7 13 3 8.7 9.3 8z"/> },
  level_5:      { c:['#EC4899','#BE185D'], g:<path d="M4 20 10 14l3 3 7-8v5h2V5h-9v2h5l-5.5 6.3-3-3L2 18.6z"/> },
  level_10:     { c:['#A855F7','#7E22CE'], g:<path d="M3 8l4.5 3L12 4l4.5 7L21 8l-1.5 10h-15zM5.5 20h13v2h-13z"/> },
  consistent:   { c:['#10B981','#047857'], g:<g><path d="M7 2h2v2h6V2h2v2h3v18H4V4h3zm-1 7v11h12V9z"/><path d="M8.6 14.4 11 16.8l4.4-4.4 1.4 1.4-5.8 5.8-3.8-3.8z"/></g> },
}
function BadgeIcon({ id, size = 64, dim = false }) {
  const a = BADGE_ART[id] || { c:[C.gold, C.crimson], g:<circle cx="12" cy="12" r="6"/> }
  const [c1, c2] = a.c
  const gid = 'bg_' + id
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: dim ? 'grayscale(100%) opacity(.55)' : 'drop-shadow(0 3px 6px rgba(26,15,14,.18))' }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1}/><stop offset="1" stopColor={c2}/></linearGradient></defs>
      <circle cx="12" cy="12" r="11" fill={'url(#' + gid + ')'} />
      <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth=".8" />
      <g transform="translate(4.8 4.8) scale(.6)" fill="#fff">{a.g}</g>
    </svg>
  )
}
const STAT_ART = {
  quizzes:  { c:'#7C3AED', g:<path d="M7.2 7h9.6a5.2 5.2 0 0 1 5.1 6.3l-.9 4.2a2.6 2.6 0 0 1-4.6 1L14.6 16H9.4l-1.8 2.5a2.6 2.6 0 0 1-4.6-1l-.9-4.2A5.2 5.2 0 0 1 7.2 7z"/> },
  correct:  { c:'#22C55E', g:<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.8 14.4-4-4 1.6-1.6 2.4 2.4 6-6 1.6 1.6z"/> },
  streak:   { c:'#F97316', g:<path d="M12 2c1 3-2 4.5-2 7a2 2 0 0 0 4 .2C15.5 8 17 6.5 17 4c2.5 2 4 5 4 8a9 9 0 1 1-18 0c0-2.5 1-4.8 2.6-6.4C6.4 8 8 9 9 8.6 8.4 6 10 3.4 12 2z"/> },
  rank:     { c:'#F2C230', g:<path d="M7 2h10v2h3a1 1 0 0 1 1 1c0 3.3-2 5.7-4.7 6.5A5 5 0 0 1 13 14.9V17h3v2H8v-2h3v-2.1a5 5 0 0 1-3.3-3.4C5 10.7 3 8.3 3 5a1 1 0 0 1 1-1h3z"/> },
}
const StatIcon = ({ k, size = 26 }) => {
  const a = STAT_ART[k] || STAT_ART.rank
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={a.c}>{a.g}</svg>
}

const BADGES = [
  { id:'first_quiz',    name:'First Step',      icon:'◎', desc:'Completed your first quiz' },
  { id:'streak_3',      name:'On Fire',          icon:'▲', desc:'3 correct answers in a row' },
  { id:'streak_5',      name:'Unstoppable',      icon:'▶', desc:'5 correct answers in a row' },
  { id:'perfect_10',    name:'Perfect Ten',      icon:'◇', desc:'100% score on a 10-question quiz' },
  { id:'century',       name:'Century',          icon:'★', desc:'100 correct answers total' },
  { id:'math_master',   name:'Math Master',      icon:'∠', desc:'Top score in Mathematics' },
  { id:'science_star',  name:'Science Star',     icon:'✦', desc:'Top score in Sciences' },
  { id:'speed_demon',   name:'Speed Demon',      icon:'▶', desc:'Answered 5 questions in under 5 seconds each' },
  { id:'xp_1000',       name:'XP Hunter',        icon:'★', desc:'Earned 1000 XP' },
  { id:'level_5',       name:'Rising Star',      icon:'✧', desc:'Reached Level 5' },
  { id:'level_10',      name:'Scholar',          icon:'♕', desc:'Reached Level 10' },
  { id:'consistent',    name:'Consistent',       icon:'◆', desc:'Played quizzes 5 days in a row' },
]

const LEVEL_NAMES = ['Beginner','Explorer','Learner','Scholar','Achiever','Expert','Champion','Master','Legend','Elite']

function getLevelName(level) {
  return LEVEL_NAMES[Math.min(level-1, LEVEL_NAMES.length-1)] || 'Elite'
}

function XPBar({ current, needed }) {
  const pct = needed > 0 ? Math.min(100, (current/needed)*100) : 100
  return (
    <div style={{ height:10, borderRadius:99, background:C.s100, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${C.gold},#E8B84B)`, borderRadius:99, transition:'width .6s ease' }}/>
    </div>
  )
}

export default function AchievementTab({ user }) {
  const [data,    setData]    = useState(null)
  const [lb,      setLB]      = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('overview')

  useEffect(() => {
    const uid = user?._id
    if (!uid) return
    Promise.allSettled([
      api.get('/quiz/achievements/'+uid),
      api.get('/quiz/leaderboard'),
    ]).then(([achRes, lbRes]) => {
      if (achRes.status==='fulfilled') setData(achRes.value.data?.data)
      if (lbRes.status==='fulfilled')  setLB(lbRes.value.data?.data?.leaderboard||[])
    }).finally(() => setLoading(false))
  }, [user?._id])

  if (loading) return (
    <div style={{ padding:40, textAlign:'center', color:C.s400, fontSize:13 }}>Loading achievements...</div>
  )

  const ach    = data?.achievement
  const level  = ach?.level || 1
  const xp     = ach?.totalXP || 0
  const xpNext = level * 200
  const xpThisLevel = xp - ((level-1)*200)
  const earnedBadges = new Set((ach?.badges||[]).map(b=>b.id))

  const myRank = lb.findIndex(e => String(e.studentId) === String(user?._id))

  return (
    <div>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${C.crimson},${C.crimsonD})`, borderRadius:16, padding:'24px 28px', marginBottom:20, color:'#fff' }}>
        <div style={{ display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,.15)', border:'3px solid rgba(255,255,255,.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:28 }}>{level>=10?'♛':level>=7?'✧':level>=5?'♕':level>=3?'▤':'◎'}</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(255,255,255,.6)', marginBottom:4 }}>
              {getLevelName(level)} · Level {level}
            </div>
            <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:26, marginBottom:8 }}>
              {user?.firstName}'s Achievement Hub
            </div>
            <XPBar current={xpThisLevel} needed={200}/>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,.7)' }}>{xpThisLevel} / 200 XP to Level {level+1}</span>
              <span style={{ fontSize:13, fontWeight:800, color:C.gold }}>{xp} Total XP</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginTop:20 }}>
          {[
            { label:'Quizzes', val:ach?.quizzesTaken||0, icon:'quizzes' },
            { label:'Correct', val:ach?.totalCorrect||0, icon:'correct' },
            { label:'Best Streak', val:ach?.bestStreak||0, icon:'streak' },
            { label:'Rank', val:myRank>=0 ? '#'+(myRank+1) : '\u2014', icon:'rank' },
          ].map(s=>(
            <div key={s.label} style={{ textAlign:'center', background:'rgba(255,255,255,.12)', borderRadius:10, padding:'10px 8px' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:4 }}><StatIcon k={s.icon} /></div>
              <div style={{ fontSize:20, fontWeight:900, color:C.gold }}>{s.val}</div>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.6)', textTransform:'uppercase', letterSpacing:'.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['overview','badges','leaderboard','history'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'8px 18px', borderRadius:99, cursor:'pointer', fontSize:13, fontWeight:600,
            background:tab===t?C.crimson:'#fff', color:tab===t?'#fff':C.s700,
            border:`1px solid ${tab===t?C.crimson:C.s100}`,
          }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>

      {/* Overview */}
      {tab==='overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {/* Subject breakdown */}
          <div style={{ background:'#fff', borderRadius:14, border:`1px solid ${C.s100}`, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.s100}`, fontWeight:800, fontSize:14, color:C.ink }}>Subject Performance</div>
            {(ach?.subjectStats||[]).length === 0 ? (
              <div style={{ padding:'24px 20px', fontSize:13, color:C.s400, textAlign:'center' }}>Play quizzes to see your subject breakdown!</div>
            ) : (
              (ach?.subjectStats||[]).map(s => {
                const pct = s.answered > 0 ? Math.round((s.correct/s.answered)*100) : 0
                return (
                  <div key={s.subject} style={{ padding:'12px 20px', borderBottom:`1px solid ${C.s100}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:C.ink }}>{s.subject}</span>
                      <span style={{ fontSize:13, fontWeight:800, color:pct>=70?C.green:pct>=50?'#D97706':C.crimson }}>{pct}%</span>
                    </div>
                    <div style={{ height:6, borderRadius:99, background:C.s100, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:pct>=70?C.green:pct>=50?'#F59E0B':C.crimson, borderRadius:99, transition:'width .6s' }}/>
                    </div>
                    <div style={{ fontSize:11, color:C.s400, marginTop:4 }}>{s.correct}/{s.answered} correct · {s.xp} XP</div>
                  </div>
                )
              })
            )}
          </div>

          {/* Recent badges */}
          <div style={{ background:'#fff', borderRadius:14, border:`1px solid ${C.s100}`, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.s100}`, fontWeight:800, fontSize:14, color:C.ink }}> Recent Badges</div>
            <div style={{ padding:'16px 20px', display:'flex', flexWrap:'wrap', gap:10 }}>
              {(ach?.badges||[]).slice(0,8).map(b => {
                const def = BADGES.find(x=>x.id===b.id)||{ icon:'✦', name:b.id, desc:'' }
                return (
                  <div key={b.id} title={def.desc + ' \u2014 ' + def.name}>
                    <BadgeIcon id={b.id} size={52} />
                  </div>
                )
              })}
              {(ach?.badges||[]).length === 0 && (
                <div style={{ fontSize:13, color:C.s400 }}>Complete quizzes to earn badges!</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Badges */}
      {tab==='badges' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
          {BADGES.map(b => {
            const earned = earnedBadges.has(b.id)
            return (
              <div key={b.id} style={{
                background: earned ? `linear-gradient(135deg,${C.goldPale},#fff)` : '#fff',
                border:`2px solid ${earned?C.gold:C.s100}`, borderRadius:14,
                padding:'20px 16px', textAlign:'center', opacity:earned?1:0.55,
                transition:'all .2s',
              }}>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}><BadgeIcon id={b.id} size={80} dim={!earned} /></div>
                <div style={{ fontSize:14, fontWeight:800, color:earned?C.crimson:C.s500, marginBottom:4 }}>{b.name}</div>
                <div style={{ fontSize:12, color:C.s400, lineHeight:1.5 }}>{b.desc}</div>
                {earned && <div style={{ marginTop:8, fontSize:11, fontWeight:700, color:C.gold, textTransform:'uppercase', letterSpacing:'.08em' }}>✓ Earned</div>}
              </div>
            )
          })}
        </div>
      )}

      {/* Leaderboard */}
      {tab==='leaderboard' && (
        <div style={{ background:'#fff', borderRadius:14, border:`1px solid ${C.s100}`, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.s100}`, fontWeight:800, fontSize:14, color:C.ink }}>♛ Class Leaderboard</div>
          {lb.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', fontSize:13, color:C.s400 }}>No leaderboard data yet. Be the first to play!</div>
          ) : (
            lb.slice(0,20).map((e,i) => {
              const isMe = String(e.studentId) === String(user?._id)
              const medal = i===0?'1st':i===1?'2nd':i===2?'3rd':null
              return (
                <div key={e.studentId||i} style={{
                  padding:'14px 20px', borderBottom:`1px solid ${C.s100}`,
                  background: isMe ? C.goldPale : 'transparent',
                  display:'flex', alignItems:'center', gap:14,
                }}>
                  <div style={{ width:36, textAlign:'center', fontSize:i<3?22:14, fontWeight:800, color:isMe?C.crimson:C.s400 }}>
                    {medal||`#${i+1}`}
                  </div>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${C.crimson},${C.crimsonD})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ color:'#F0CC5A', fontSize:11, fontWeight:700 }}>
                      {(e.studentName||'?').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight: isMe?800:600, color:isMe?C.crimson:C.ink }}>
                      {e.studentName} {isMe&&'(You)'}
                    </div>
                    <div style={{ fontSize:12, color:C.s400 }}>Level {e.level||1} · {e.quizzesTaken||0} quizzes</div>
                  </div>
                  <div style={{ fontWeight:900, fontSize:16, color:C.gold }}>{e.totalXP} XP</div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* History */}
      {tab==='history' && (
        <div style={{ background:'#fff', borderRadius:14, border:`1px solid ${C.s100}`, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.s100}`, fontWeight:800, fontSize:14, color:C.ink }}> Quiz History</div>
          {(data?.recentSessions||[]).length===0 ? (
            <div style={{ padding:40, textAlign:'center', fontSize:13, color:C.s400 }}>No quiz history yet. Start playing!</div>
          ) : (
            (data?.recentSessions||[]).map((s,i)=>(
              <div key={i} style={{ padding:'14px 20px', borderBottom:`1px solid ${C.s100}`, display:'flex', gap:14, alignItems:'center' }}>
                <div style={{ width:42, height:42, borderRadius:10, background: s.score/s.total>=0.7?C.greenL:C.s100, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                  {s.score/s.total>=0.9?'♛':s.score/s.total>=0.7?'✧':'▤'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:C.ink }}>{s.subject}</div>
                  <div style={{ fontSize:12, color:C.s400 }}>{new Date(s.completedAt||s.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:16, fontWeight:900, color:C.crimson }}>{Math.round((s.score/s.total)*100)}%</div>
                  <div style={{ fontSize:11, color:C.s400 }}>{s.score}/{s.total}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
