import { useState, useEffect } from 'react'
import { useToast, api } from '../../context/ctx.jsx'
import { useStore } from '../../context/ctx.jsx'

const I = (d) => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:d}}/>

const PAGES = {
  dashboard:'Dashboard', progress:'Academic Progress', lessons:'Live Lessons',
  programme:'Programme Details', messages:'Messages', tutor:'Tutor & Advisor',
  payments:'Fees & Payments', learning:'Resources & Articles', documents:'Documents', mshauri:'Mshauri AI',
}

const mCol = (pct) => pct >= 70 ? 'var(--g600)' : pct >= 50 ? 'var(--a600)' : 'var(--r500)'

export default function ParentPortal() {
  const toast = useToast()
  const store = useStore()
  const [page, setPage] = useState('dashboard')
  const [msgInput, setMsgInput] = useState('')
  const [activeThread, setActiveThread] = useState(null)
  const [aiMsgs, setAiMsgs] = useState([
    {role:'ai', text:"Habari Mrs. Osei! I am Mshauri. Ask me anything about Amara's progress, the IGCSE curriculum, or how to support her learning at home."}
  ])
  const [aiInp, setAiInp] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [payMethod, setPayMethod] = useState('M-Pesa')
  const [payRef, setPayRef] = useState('')

  // ── Live mastery from API ──────────────────────────────
  const [childMastery, setChildMastery] = useState(null)
  useEffect(() => {
    api.get('/mastery/me').then(({data}) => { if(data.success) setChildMastery(data.mastery) }).catch(()=>{})
  }, [])

  const mCol2 = (pct) => pct >= 80 ? 'var(--g600)' : pct >= 60 ? 'var(--b600)' : pct >= 40 ? 'var(--a600)' : 'var(--r500)'

  const subjects = childMastery?.subjects?.map(s => ({
    name:s.name, score:s.overallPct, att:88, col:s.color, velocity:s.velocity||0,
  })) || [
    {name:'Mathematics',   score:67, att:88,  col:'#3B82F6', velocity:5},
    {name:'Biology',       score:54, att:91,  col:'#22C55E', velocity:-2},
    {name:'Chemistry',     score:41, att:82,  col:'#F59E0B', velocity:3},
    {name:'Physics',       score:38, att:78,  col:'#8B5CF6', velocity:0},
    {name:'English Language', score:79, att:95, col:'#EC4899', velocity:7},
  ]
  const avgScore = Math.round(subjects.reduce((s,x) => s+x.score, 0) / subjects.length)

  // ── Store-derived data ────────────────────────────────
  const myThreads = store.getThreads('parent', 'Janet Osei')
  const unread    = myThreads.reduce((s,t) => s+t.unread, 0)
  const announcements = store.getAnnouncements('parent')
  const publishedArticles = store.articles.filter(a => a.status === 'Published').slice(0, 6)
  const amaraResults = store.getStudentResults('Amara Osei')

  // ── Mshauri ───────────────────────────────────────────
  const sendAi = async () => {
    if (!aiInp.trim() || aiLoading) return
    const q = aiInp.trim(); setAiInp(''); setAiLoading(true)
    setAiMsgs(m => [...m, {role:'user', text:q}])
    try {
      const {data} = await api.post('/auth/mshauri', { message: q })
      setAiMsgs(m => [...m, {role:'ai', text: data.reply || 'Let me look into that for you.'}])
    } catch {
      const m2 = q.toLowerCase().includes('chemistry')
        ? "Amara's Chemistry score of 41% needs attention. Recommend 20-min daily revision sessions and using the periodic table flashcards in Resources."
        : "Overall Amara is progressing well. English is her strongest subject (79%). Mathematics is on track. Chemistry and Physics need extra support. Would you like a weekly study plan?"
      setAiMsgs(m => [...m, {role:'ai', text:m2}])
    }
    setAiLoading(false)
  }

  // ── Reply to teacher ──────────────────────────────────
  const sendReply = (thread) => {
    if (!msgInput.trim()) return
    const last = thread.messages[thread.messages.length - 1]
    store.sendMessage({
      from:     'Janet Osei',
      fromRole: 'parent',
      to:       last.from === 'Janet Osei' ? last.to : last.from,
      toRole:   last.from === 'Janet Osei' ? last.toRole : last.fromRole,
      avatar:   'JO',
      avatarCol:'#8B5CF6',
      subject:  'Re: ' + (last.subject || '').replace(/^Re: /, ''),
      body:     msgInput,
      thread:   thread.id,
    })
    setMsgInput('')
    toast.ok('Reply sent')
  }

  // ── Payment ───────────────────────────────────────────
  const handlePayment = () => {
    if (!payRef.trim()) { toast.error('Enter your payment reference'); return }
    store.addPayment({
      desc:   'Premium Plan — April 2026',
      amount: 'KES 1,499',
      method: payMethod,
      ref:    payRef,
    })
    toast.ok('Payment confirmed! Reference: ' + payRef)
    setPayModal(false); setPayRef('')
  }

  const NAV = [
    {id:'dashboard',  label:'Dashboard',          svg:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'},
    {id:'progress',   label:'Academic Progress',  svg:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'},
    {id:'lessons',    label:'Live Lessons',        svg:'<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>', live:true},
    {id:'programme',  label:'Programme Details',   svg:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'},
    {id:'messages',   label:'Messages',            svg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', badge: unread > 0 ? String(unread) : null},
    {id:'tutor',      label:'Tutor & Advisor',     svg:'<circle cx="12" cy="8" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/>'},
    {id:'payments',   label:'Fees & Payments',     svg:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>'},
    {id:'learning',   label:'Articles & Resources',svg:'<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'},
    {id:'documents',  label:'Documents',           svg:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'},
    {id:'mshauri',    label:'Mshauri AI',          svg:'<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>'},
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-mark"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/></svg></div>
          <div><div className="sb-text">Smartious<span>.</span></div><div className="sb-sub">Parent Portal</div></div>
        </div>
        <nav style={{flex:1, paddingTop:8}}>
          <div className="sb-sec">Child Overview</div>
          {NAV.slice(0,6).map(item => (
            <div key={item.id} className={`nav-item${page===item.id?' active':''}`} onClick={()=>setPage(item.id)}>
              <div className="nav-icon">{I(item.svg)}</div>
              <span className="sb-lbl">{item.label}</span>
              {item.badge && <span className="sb-badge">{item.badge}</span>}
              {item.live && <div className="sb-live-dot"/>}
            </div>
          ))}
          <div className="sb-sec">Finance & Learning</div>
          {NAV.slice(6).map(item => (
            <div key={item.id} className={`nav-item${page===item.id?' active':''}`} onClick={()=>setPage(item.id)}>
              <div className="nav-icon">{I(item.svg)}</div>
              <span className="sb-lbl">{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sb-user">
          <div style={{width:36,height:36,borderRadius:'50%',background:'#8B5CF620',color:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'JetBrains Mono,monospace',fontSize:12,fontWeight:700}}>JO</div>
          <div className="sb-uinfo"><div className="sb-uname">Janet Osei</div><div className="sb-urole">Parent · Amara Osei</div></div>
        </div>
        <div className="sb-back" onClick={() => window.location.href='/'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          <span className="sb-lbl">Back to Website</span>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="tb-title">{PAGES[page]}</div>
          <div className="tb-right">
            <button className="btn btn-s btn-sm" onClick={()=>setPage('messages')}>
              Messages {unread > 0 && <span className="sb-badge" style={{background:'var(--b700)',marginLeft:4}}>{unread}</span>}
            </button>
          </div>
        </div>
        <div className="content" style={{animation:'fadeIn .25s ease'}}>

          {/* ── DASHBOARD ── */}
          {page==='dashboard' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Welcome back</div><h1 className="serif" style={{fontSize:28,color:'var(--s900)'}}>Good morning, <em style={{color:'var(--b700)'}}>Mrs. Osei</em>!</h1></div>

              {/* Amara profile banner */}
              <div style={{background:'linear-gradient(135deg,#1B5E20,#2E7D32)',borderRadius:'var(--rxl)',padding:'24px 28px',marginBottom:24,display:'flex',gap:20,flexWrap:'wrap',alignItems:'center'}}>
                <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,.15)',border:'3px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,color:'#fff',fontFamily:'JetBrains Mono,monospace',flexShrink:0}}>AO</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:22,fontWeight:700,color:'#fff',marginBottom:4}}>Amara Osei</div>
                  <div style={{fontSize:13.5,color:'rgba(255,255,255,.7)',marginBottom:12}}>IGCSE · Form 3 · Premium Plan · Nairobi, Kenya</div>
                  <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
                    {[[`${avgScore}%`,'Avg Score'],['88%','Attendance'],[`${childMastery?.streak||12} days`,'Streak'],[(childMastery?.xp||4280).toLocaleString(),'XP']].map(([v,l]) => (
                      <div key={l}><div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>{l}</div><div className="mono" style={{fontSize:16,fontWeight:700,color:'#fff'}}>{v}</div></div>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:10}}>
                  <button className="btn" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.25)'}} onClick={()=>setPage('messages')}>Message Teacher</button>
                  <button className="btn" style={{background:'rgba(255,255,255,.9)',color:'#1B5E20',fontWeight:700,borderColor:'transparent'}} onClick={()=>setPage('progress')}>Full Progress →</button>
                </div>
              </div>

              {/* Announcements from teachers */}
              {announcements.slice(0,3).map((a,i) => (
                <div key={i} style={{background:a.type==='article'?'var(--b50)':a.type==='resource'?'var(--g50)':'var(--a50)',border:`1px solid ${a.type==='article'?'var(--b100)':a.type==='resource'?'var(--g100)':'var(--a100)'}`,borderRadius:'var(--rlg)',padding:'13px 18px',display:'flex',alignItems:'center',gap:14,marginBottom:12,flexWrap:'wrap'}}>
                  <div style={{flex:1}}><div style={{fontWeight:700,color:a.type==='article'?'var(--b700)':a.type==='resource'?'var(--g700)':'var(--a600)',marginBottom:2}}>{a.title}</div><div style={{fontSize:13,color:'var(--s600)'}}>{a.body}</div></div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:11,color:'var(--s400)'}}>{a.date}</span>
                    {a.type==='article' && <button className="btn btn-s btn-sm" onClick={()=>setPage('learning')}>Read</button>}
                    {a.type==='resource' && <button className="btn btn-s btn-sm" onClick={()=>setPage('learning')}>View</button>}
                  </div>
                </div>
              ))}

              {/* Exam results alerts */}
              {amaraResults.slice(0,2).map((r,i) => (
                <div key={i} style={{background:r.grade==='A'||r.grade==='B'?'var(--g50)':'var(--a50)',border:`1px solid ${r.grade==='A'||r.grade==='B'?'var(--g100)':'var(--a100)'}`,borderRadius:'var(--rlg)',padding:'13px 18px',display:'flex',alignItems:'center',gap:14,marginBottom:12,flexWrap:'wrap'}}>
                  <div style={{flex:1}}><div style={{fontWeight:700,color:r.grade==='A'||r.grade==='B'?'var(--g700)':'var(--a600)',marginBottom:2}}>Result Released: {r.exam}</div><div style={{fontSize:13,color:'var(--s600)'}}>{r.student} scored {r.score}/{r.total} — Grade {r.grade}. {r.feedback}</div></div>
                  <button className="btn btn-s btn-sm" onClick={()=>setPage('progress')}>View Progress</button>
                </div>
              ))}

              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginTop:8}}>
                <div className="card">
                  <div className="chdr">
                    <div className="ctitle">Subject Performance {childMastery && <span style={{fontSize:11,color:'var(--g600)',marginLeft:8}}>● Live</span>}</div>
                    <button className="btn btn-g btn-sm" onClick={()=>setPage('progress')}>Full Report</button>
                  </div>
                  {subjects.map(s => (
                    <div key={s.name} style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5}}>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <div style={{width:10,height:10,borderRadius:2,background:s.col}}/>
                          <span style={{fontWeight:600}}>{s.name}</span>
                          {s.velocity!==0 && <span style={{fontSize:11,fontWeight:700,color:s.velocity>0?'var(--g600)':'var(--r500)'}}>{s.velocity>0?'↑':'↓'}{Math.abs(s.velocity)}%</span>}
                        </div>
                        <span className="mono" style={{fontWeight:700,color:mCol(s.score)}}>{s.score}%</span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill" style={{width:s.score+'%',background:s.col,transition:'width 1s ease'}}/></div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div className="card">
                    <div className="ctitle" style={{marginBottom:12}}>Quick Actions</div>
                    {[['View Progress Report','progress'],['Messages','messages'],['Pay April Fees','payments'],['Resources & Articles','learning'],['Ask Mshauri AI','mshauri']].map(([l,p]) => (
                      <button key={l} className="btn btn-s btn-sm" style={{width:'100%',justifyContent:'flex-start',marginBottom:6}} onClick={()=>setPage(p)}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PROGRESS ── */}
          {page==='progress' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Amara Osei · IGCSE Form 3</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Academic <em style={{color:'var(--b700)'}}>Progress</em></h2></div>
              <div className="kpi-grid" style={{marginBottom:24}}>
                {[{v:`${avgScore}%`,l:'Avg Score',d:'Live from mastery data',dc:'var(--g600)'},{v:'88%',l:'Attendance',d:'Above school avg',dc:'var(--g600)'},{v:`${childMastery?.streak||12}`,l:'Day Streak',dc:'var(--a600)',d:'Personal best!'},{v:(childMastery?.xp||4280).toLocaleString(),l:'Total XP',d:'Earned through practice',dc:'var(--b700)'}].map((k,i) => (
                  <div key={i} className="kpi"><div className="kpi-v">{k.v}</div><div className="kpi-l">{k.l}</div><div className="kpi-d" style={{color:k.dc}}>{k.d}</div></div>
                ))}
              </div>
              {/* Exam results */}
              {amaraResults.length > 0 && (
                <div className="card" style={{marginBottom:20}}>
                  <div className="ctitle" style={{marginBottom:14}}>Released Exam Results</div>
                  <table className="tbl">
                    <thead><tr><th>Exam</th><th>Subject</th><th>Score</th><th>Grade</th><th>Date</th><th>Feedback</th></tr></thead>
                    <tbody>
                      {amaraResults.map((r,i) => (
                        <tr key={i}>
                          <td style={{fontWeight:600}}>{r.exam}</td>
                          <td>{r.subject}</td>
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
                <div className="ctitle" style={{marginBottom:14}}>Subject Breakdown</div>
                <table className="tbl">
                  <thead><tr><th>Subject</th><th>Mastery</th><th>Attendance</th><th>Trend</th><th>Target</th><th>Status</th></tr></thead>
                  <tbody>
                    {subjects.map((s,i) => (
                      <tr key={i}>
                        <td style={{fontWeight:700}}>{s.name}</td>
                        <td><span className="mono" style={{fontWeight:700,color:mCol(s.score)}}>{s.score}%</span></td>
                        <td><span className="mono">{s.att}%</span></td>
                        <td><span style={{fontSize:13,fontWeight:700,color:s.velocity>0?'var(--g600)':'var(--r500)'}}>{s.velocity>0?'↑':s.velocity<0?'↓':'→'}</span></td>
                        <td><span className="mono" style={{color:'var(--s400)'}}>60%</span></td>
                        <td><span className={`badge ${s.score>=70?'badge-green':s.score>=60?'badge-amber':'badge-red'}`}>{s.score>=70?'On Track':s.score>=60?'Close':'Needs Help'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── MESSAGES ── */}
          {page==='messages' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Communication</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Messages</h2></div>
              <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:20,height:560}}>
                <div className="card" style={{padding:0,overflow:'hidden'}}>
                  <div style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:13.5}}>Conversations</div>
                  {myThreads.length === 0 ? (
                    <div style={{padding:20,color:'var(--s400)',fontSize:13}}>No messages yet.</div>
                  ) : myThreads.map((thread,i) => {
                    const last = thread.messages[thread.messages.length-1]
                    const other = last.from === 'Janet Osei' ? last.to : last.from
                    const isActive = activeThread?.id === thread.id
                    return (
                      <div key={i} onClick={() => { setActiveThread(thread); thread.messages.forEach(m => store.markRead(m.id)) }}
                        style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',cursor:'pointer',background:isActive?'var(--b50)':'transparent',borderLeft:isActive?'3px solid var(--b600)':'3px solid transparent'}}>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <div style={{width:32,height:32,borderRadius:'50%',background:last.avatarCol+'20',color:last.avatarCol,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'JetBrains Mono,monospace',fontSize:11,fontWeight:700,flexShrink:0}}>{last.avatar}</div>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:700,fontSize:13}}>{other}</span>{thread.unread>0&&<span className="sb-badge">{thread.unread}</span>}</div>
                            <div style={{fontSize:11,color:'var(--s400)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{last.subject}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="card" style={{padding:0,display:'flex',flexDirection:'column'}}>
                  {activeThread ? (
                    <>
                      <div style={{padding:'13px 18px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:14}}>{activeThread.messages[activeThread.messages.length-1].subject}</div>
                      <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
                        {[...activeThread.messages].reverse().map((m,i) => (
                          <div key={i} style={{display:'flex',gap:8,flexDirection:m.from==='Janet Osei'?'row-reverse':'row',alignItems:'flex-end'}}>
                            {m.from!=='Janet Osei'&&<div style={{width:26,height:26,borderRadius:'50%',background:m.avatarCol+'20',color:m.avatarCol,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0}}>{m.avatar}</div>}
                            <div style={{background:m.from==='Janet Osei'?'var(--b700)':'var(--white)',color:m.from==='Janet Osei'?'#fff':'var(--s800)',border:m.from!=='Janet Osei'?'1px solid var(--border)':'none',borderRadius:m.from==='Janet Osei'?'14px 14px 4px 14px':'4px 14px 14px 14px',padding:'9px 13px',maxWidth:'72%',fontSize:13.5,lineHeight:1.65}}>
                              {m.body}<div style={{fontSize:10,marginTop:4,opacity:.5,textAlign:m.from==='Janet Osei'?'right':'left'}}>{m.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{padding:'10px 14px',borderTop:'1px solid var(--border)',display:'flex',gap:8}}>
                        <textarea className="chat-input" value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendReply(activeThread)}}} rows={1} placeholder="Type a reply…" style={{flex:1}}/>
                        <button className="btn btn-p btn-sm" onClick={() => sendReply(activeThread)} style={{padding:'7px 10px'}}>
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--s400)',fontSize:14,flexDirection:'column',gap:8}}>
                      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{opacity:.3}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Select a conversation
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {page==='payments' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Finance</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Fees &amp; Payments</h2></div>
              <div className="kpi-grid" style={{marginBottom:24}}>
                {[{v:'KES '+(store.fees?.individual_premium||2999).toLocaleString(),l:'Monthly Plan',d:'Individual Premium',dc:'var(--b700)'},{v:'Paid',l:'March 2026',d:'Paid on Mar 15',dc:'var(--g600)'},{v:'Apr 15',l:'Next Payment',d:'KES 1,499 due',dc:'var(--a600)'},{v:'OSEI-2027',l:'Referral Code',d:'1 month free per referral',dc:'var(--g600)'}].map((k,i) => (
                  <div key={i} className="kpi"><div className="kpi-v" style={{fontSize:i===0||i===3?15:undefined}}>{k.v}</div><div className="kpi-l">{k.l}</div><div className="kpi-d" style={{color:k.dc}}>{k.d}</div></div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                <div className="card">
                  <div className="ctitle" style={{marginBottom:14}}>Pay April Fees</div>
                  <div style={{background:'var(--bg)',borderRadius:'var(--rmd)',padding:14,marginBottom:16}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:14,marginBottom:6}}><span style={{color:'var(--s500)'}}>Individual Premium — April 2026</span><span className="mono" style={{fontWeight:700}}>KES {(store.fees?.individual_premium||2999).toLocaleString()}</span></div>
                    <div style={{fontSize:12,color:'var(--a600)'}}>Due April 15, 2026</div>
                  </div>
                  <div className="fg" style={{marginBottom:12}}>
                    <label className="fl">Payment Method</label>
                    <select className="fsel" value={payMethod} onChange={e=>setPayMethod(e.target.value)}>
                      <option>M-Pesa</option><option>Card</option><option>Bank Transfer</option>
                    </select>
                  </div>
                  <div className="fg" style={{marginBottom:14}}>
                    <label className="fl">Transaction Reference *</label>
                    <input className="fi" value={payRef} onChange={e=>setPayRef(e.target.value)} placeholder={payMethod==='M-Pesa'?'e.g. QGL4XRZ91':'e.g. TXN-20260415-001'}/>
                  </div>
                  <button className="btn btn-ok" style={{width:'100%',justifyContent:'center'}} onClick={handlePayment}>Confirm Payment — KES 1,499</button>
                </div>
                <div className="card">
                  <div className="ctitle" style={{marginBottom:14}}>Payment History</div>
                  {store.payments.slice(0,5).map((p,i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)',fontSize:13,flexWrap:'wrap',gap:4}}>
                      <span style={{color:'var(--s500)'}}>{p.date}</span><span>{p.desc.split('—')[0].trim()}</span><span className="mono" style={{fontWeight:700}}>{p.amount}</span><span className="badge badge-green">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{marginTop:20,background:'linear-gradient(135deg,#14532D,#15803D)',borderColor:'transparent',color:'#fff'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                  <div><div className="serif" style={{fontSize:18,marginBottom:4}}>Refer a family, get 1 month free!</div><div style={{fontSize:13.5,color:'rgba(255,255,255,.7)'}}>Your code: <span className="mono" style={{fontWeight:700,fontSize:18,color:'#FCD34D'}}>OSEI-2027</span></div></div>
                  <button className="btn" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.3)'}} onClick={()=>{navigator.clipboard?.writeText('OSEI-2027');toast.ok('Code copied!')}}>Copy Code</button>
                </div>
              </div>
            </div>
          )}

          {/* ── PROGRAMME ── */}
          {page==='programme' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Enrolment</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Programme Details</h2></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                <div className="card">
                  <div className="ctitle" style={{marginBottom:14}}>Amara's Programme</div>
                  {[['Programme','IGCSE (Cambridge)'],['Year Level','Form 3 (Grade 10)'],['Service Type','Homeschool — Virtual'],['Plan','Premium — KES 1,499/month'],['Enrolled','September 2025'],['Expected Completion','August 2027'],['School Code','SM-IGC-F3-2025']].map(([l,v]) => (
                    <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)',fontSize:13.5}}>
                      <span style={{color:'var(--s500)'}}>{l}</span><span style={{fontWeight:600,color:'var(--s800)',textAlign:'right'}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="ctitle" style={{marginBottom:14}}>Subject Teachers</div>
                  {[['Mathematics','Mr. Muthomi','Mon/Wed 9–10 AM'],['Biology','Dr. Ouma','Mon 2–3 PM'],['Chemistry','Dr. Ouma','Wed 1–2 PM'],['Physics','Mr. Njoroge','Thu 11 AM'],['English','Ms. Wambua','Tue/Fri 10 AM']].map(([s,t,slot]) => (
                    <div key={s} style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <div style={{fontWeight:700,fontSize:14}}>{s}</div><div style={{fontSize:12.5,color:'var(--s500)'}}>{t} · {slot}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── LESSONS (timetable view) ── */}
          {page==='lessons' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Live Classes</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Live Lessons</h2></div>
              <div style={{background:'linear-gradient(135deg,#1E3A8A,var(--b700))',borderRadius:'var(--rxl)',padding:'20px 24px',marginBottom:20,display:'flex',gap:14,alignItems:'center',flexWrap:'wrap'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#4ADE80',animation:'pulse 1.5s infinite'}}/>
                <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>Amara is live now</div><div style={{fontSize:16,fontWeight:700,color:'#fff'}}>Mathematics — Pythagoras Theorem</div><div style={{fontSize:12.5,color:'rgba(255,255,255,.65)'}}>Mr. Muthomi · 38 min in · 6 students</div></div>
                <button className="btn" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.25)'}} onClick={()=>toast.info('Opening read-only monitor…')}>Monitor</button>
              </div>
              <div className="card">
                <div className="ctitle" style={{marginBottom:14}}>Weekly Schedule</div>
                {[{d:'Mon',s:'Mathematics',t:'Mr. Muthomi',time:'9–10 AM',st:'done'},{d:'Mon',s:'Biology',t:'Dr. Ouma',time:'2–3 PM',st:'done'},{d:'Tue',s:'English',t:'Ms. Wambua',time:'10–11 AM',st:'done'},{d:'Wed',s:'Mathematics',t:'Mr. Muthomi',time:'9–10 AM',st:'live'},{d:'Wed',s:'Chemistry',t:'Dr. Ouma',time:'1–2 PM',st:'upcoming'},{d:'Thu',s:'Physics',t:'Mr. Njoroge',time:'11 AM–12 PM',st:'upcoming'},{d:'Fri',s:'English',t:'Ms. Wambua',time:'9–10 AM',st:'upcoming'}].map((c,i) => (
                  <div key={i} style={{display:'flex',gap:14,padding:'11px 0',borderBottom:'1px solid var(--border)',flexWrap:'wrap',alignItems:'center'}}>
                    <span className="mono" style={{fontWeight:700,color:'var(--b700)',width:28,flexShrink:0}}>{c.d}</span>
                    <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{c.s}</div><div style={{fontSize:12,color:'var(--s500)'}}>{c.t} · {c.time}</div></div>
                    <span className={`badge ${c.st==='live'?'badge-red':c.st==='done'?'badge-green':'badge-blue'}`}>{c.st==='live'?'● Live':c.st==='done'?'Done':'Upcoming'}</span>
                    {c.st==='done'&&<button className="btn btn-g btn-sm" onClick={()=>toast.info('Loading recording…')}>Recording</button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TUTOR ── */}
          {page==='tutor' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Support Team</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Tutor &amp; Advisor</h2></div>
              <div className="card" style={{display:'flex',gap:20,alignItems:'flex-start',flexWrap:'wrap',marginBottom:20}}>
                <div style={{width:80,height:80,borderRadius:'50%',background:'#3B82F620',color:'#3B82F6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,fontFamily:'JetBrains Mono,monospace',flexShrink:0}}>SK</div>
                <div style={{flex:1}}>
                  <div className="serif" style={{fontSize:22,color:'var(--s900)',marginBottom:4}}>Dr. Sarah Kimani</div>
                  <div style={{fontSize:14,color:'var(--s500)',marginBottom:12}}>Lead Tutor & Academic Advisor · 12 years experience · Mathematics, Sciences</div>
                  <div style={{display:'flex',gap:10}}>
                    <button className="btn btn-p btn-sm" onClick={()=>setPage('messages')}>Send Message</button>
                    <button className="btn btn-s btn-sm" onClick={()=>toast.info('Opening consultation booking…')}>Book Consultation</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {page==='documents' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Files</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Documents</h2></div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                {[{t:'Term 1 Report Card',col:'var(--b50)',sc:'var(--b700)'},{t:'Chemistry Study Plan',col:'var(--r50)',sc:'var(--r600)'},{t:'Enrolment Agreement',col:'var(--g50)',sc:'var(--g600)'},{t:'Fee Schedule 2026',col:'var(--a50)',sc:'var(--a600)'},{t:'IGCSE Subject Registration',col:'var(--p50)',sc:'var(--p600)'},{t:'Safeguarding Policy',col:'var(--s100)',sc:'var(--s600)'}].map((d,i) => (
                  <div key={i} className="card" style={{display:'flex',gap:12,alignItems:'center'}}>
                    <div style={{width:40,height:40,borderRadius:'var(--rmd)',background:d.col,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={d.sc} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13.5,color:'var(--s800)'}}>{d.t}</div><div style={{fontSize:11.5,color:'var(--s400)'}}>PDF</div></div>
                    <button className="btn btn-s btn-sm" onClick={()=>store.downloadResource({title:d.t, type:'PDF', subject:'General', grade:'All', addedBy:'Smartious Admin', date:'2026'})}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ARTICLES & RESOURCES (from store — wired to teacher portal) ── */}
          {page==='learning' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Published by Smartious Teachers</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Articles &amp; Resources</h2></div>
              {publishedArticles.length > 0 && (
                <>
                  <h3 className="serif" style={{fontSize:18,color:'var(--s900)',marginBottom:14}}>Latest Articles from Teachers</h3>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14,marginBottom:28}}>
                    {publishedArticles.map((a) => (
                      <div key={a.id} className="card" style={{cursor:'pointer',borderTop:`3px solid var(--b600)`}} onClick={()=>toast.info('Opening: ' + a.title)}>
                        <div style={{height:80,borderRadius:'var(--rmd)',background:a.img,marginBottom:12}}/>
                        <div style={{fontWeight:700,fontSize:14,color:'var(--s900)',marginBottom:6,lineHeight:1.4}}>{a.title}</div>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--s400)'}}>
                          <span>{a.author}</span><span>{a.date}</span>
                        </div>
                        {a.reads > 0 && <div style={{fontSize:12,color:'var(--b600)',marginTop:4}}>{a.reads.toLocaleString()} reads</div>}
                        <div style={{fontSize:11,color:'var(--b600)',marginTop:6,fontFamily:'monospace'}}>{a.url}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <h3 className="serif" style={{fontSize:18,color:'var(--s900)',marginBottom:14}}>Resources from Teachers</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                {store.resources.map((r) => (
                  <div key={r.id} className="card" style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                    <div style={{width:44,height:44,borderRadius:'var(--rmd)',background:'var(--b50)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13.5,color:'var(--s800)',marginBottom:3}}>{r.title}</div>
                      <div style={{fontSize:11.5,color:'var(--s400)',marginBottom:6}}>{r.type} · {r.subject} · {r.grade} · Added by {r.addedBy}</div>
                      <div style={{fontSize:11.5,color:'var(--s400)',marginBottom:8}}>{r.date} · {r.downloads} downloads</div>
                      <button className="btn btn-s btn-sm" onClick={()=>store.downloadResource(r)}>Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MSHAURI ── */}
          {page==='mshauri' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">AI Assistant</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Mshauri AI</h2></div>
              <div className="card" style={{display:'flex',flexDirection:'column',height:540}}>
                <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',gap:10,alignItems:'center'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'var(--b700)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg></div>
                  <div><div style={{fontWeight:700,fontSize:14}}>Mshauri — Parent Assistant</div><div style={{fontSize:12,color:'var(--g600)'}}>● Online · Powered by Claude AI</div></div>
                </div>
                <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
                  {aiMsgs.map((m,i) => (
                    <div key={i} style={{display:'flex',gap:8,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-end'}}>
                      {m.role==='ai'&&<div style={{width:26,height:26,borderRadius:'50%',background:'var(--b700)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#fff',flexShrink:0}}>M</div>}
                      <div style={{background:m.role==='user'?'var(--b700)':'var(--white)',color:m.role==='user'?'#fff':'var(--s800)',border:m.role==='ai'?'1px solid var(--border)':'none',borderRadius:m.role==='user'?'14px 14px 4px 14px':'4px 14px 14px 14px',padding:'9px 13px',maxWidth:'76%',fontSize:13.5,lineHeight:1.7}}>{m.text}</div>
                    </div>
                  ))}
                  {aiLoading&&<div style={{color:'var(--s400)',fontSize:13,paddingLeft:34}}>Mshauri is thinking…</div>}
                </div>
                <div style={{padding:'10px 14px',borderTop:'1px solid var(--border)'}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
                    {["How is Amara doing?","Help with Chemistry","Explain IGCSE"].map(s => (
                      <button key={s} className="btn btn-s btn-sm" style={{fontSize:11.5,padding:'4px 10px'}} onClick={()=>{setAiInp(s);setTimeout(()=>sendAi(),50)}}>{s}</button>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <textarea className="chat-input" value={aiInp} onChange={e=>setAiInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAi()}}} rows={1} placeholder="Ask Mshauri about Amara's education…" style={{flex:1}}/>
                    <button className="btn btn-p btn-sm" onClick={sendAi} disabled={aiLoading} style={{padding:'7px 10px'}}><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
