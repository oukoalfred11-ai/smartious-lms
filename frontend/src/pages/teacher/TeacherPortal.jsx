import { useState, useEffect, useRef } from 'react'
import { useToast, api, useAuth } from '../../context/ctx.jsx'
import { useStore } from '../../context/ctx.jsx'

const I = (d) => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:d}}/>

const PAGES = {
  dashboard:'Dashboard', progress:'Academic Progress', lessons:'Live Lessons',
  programme:'Programme Details', messages:'Messages', tutor:'Tutor & Advisor',
  payments:'Fees & Payments', mshauri:'Mshauri AI',
}
const mCol = (pct) => pct >= 70 ? 'var(--g600)' : pct >= 50 ? 'var(--a600)' : 'var(--r500)'

// ── PROGRESS RING ─────────────────────────────────────────
function ProgressRing({ pct = 0, size = 92, stroke = 9, label, sublabel }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  const dash = (clamped / 100) * circ
  return (
    <div style={{
      display:'flex', height:'100vh', overflow:'hidden',
      background:'#FBFAF5',
      fontFamily:"Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      color:'#1A0F0E',
    }}>
      {/* ══ SIDEBAR ══ */}
      <aside style={{
        width:260, flexShrink:0,
        background:'#FBFAF5',
        borderRight:'1px solid #F4EFEB',
        display:'flex', flexDirection:'column',
        height:'100vh', overflowY:'auto', overflowX:'hidden',
        position:'relative', zIndex:50,
        scrollbarWidth:'none',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'20px 22px', borderBottom:'1px solid #F4EFEB', minHeight:72, flexShrink:0 }}>
          <div style={{ width:42, height:46, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg viewBox="0 0 64 72" width="38" height="42" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4 L60 4 L60 44 Q60 56 32 68 Q4 56 4 44 Z" fill="#C9A030"/>
              <path d="M7 7 L57 7 L57 44 Q57 54 32 65 Q7 54 7 44 Z" fill="#7D1025"/>
              <path d="M11 11 L53 11 L53 44 Q53 52 32 61 Q11 52 11 44 Z" fill="none" stroke="#C9A030" strokeWidth="0.5" opacity="0.4"/>
              <polygon points="32,16 33.6,20.8 38.7,20.8 34.6,23.8 36.2,28.6 32,25.6 27.8,28.6 29.4,23.8 25.3,20.8 30.4,20.8" fill="#C9A030"/>
              <path d="M16 36 Q24 32 32 34 L32 52 Q24 50 16 54 Z" fill="#FFFFFF"/>
              <path d="M48 36 Q40 32 32 34 L32 52 Q40 50 48 54 Z" fill="#FFFFFF"/>
              <line x1="32" y1="34" x2="32" y2="52" stroke="#E8D58F" strokeWidth="0.5"/>
              <line x1="20" y1="40" x2="29" y2="39" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
              <line x1="20" y1="43" x2="29" y2="42" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
              <line x1="20" y1="46" x2="29" y2="45" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
              <line x1="35" y1="39" x2="44" y2="40" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
              <line x1="35" y1="42" x2="44" y2="43" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
              <line x1="35" y1="45" x2="44" y2="46" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:22, fontWeight:400, color:'#1A0F0E', lineHeight:1 }}>
              Smart<em style={{ fontStyle:'italic', color:'#7D1025' }}>ious</em>
            </div>
            <div style={{ fontSize:9.5, color:'#7D1025', letterSpacing:'.14em', textTransform:'uppercase', marginTop:4, fontWeight:700 }}>
              Parent Portal
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, paddingTop:14, paddingBottom:14, overflowY:'auto' }}>
          {[{section:'Child Overview', items:NAV.slice(0,6)},{section:'Finance & AI', items:NAV.slice(6)}].map((s,si) => (
            <div key={si} style={{ marginBottom:18 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#7D1025', letterSpacing:'.14em', textTransform:'uppercase', padding:'0 22px 8px' }}>{s.section}</div>
              {s.items.map(item => {
                const active = page === item.id
                return (
                  <div key={item.id} onClick={()=>setPage(item.id)}
                    style={{ position:'relative', display:'flex', alignItems:'center', gap:12, padding:'10px 22px', margin:'2px 12px', borderRadius:8, cursor:'pointer', background:active?'#FBF6E3':'transparent', color:active?'#7D1025':'#564844', fontWeight:active?600:500, fontSize:13.5, transition:'background .15s' }}
                    onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='#FAF7F4' }}
                    onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent' }}>
                    {active && <div style={{ position:'absolute', left:-12, top:8, bottom:8, width:3, borderRadius:'0 3px 3px 0', background:'#C9A030', boxShadow:'0 0 8px #C9A03060' }}/>}
                    <div style={{ width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active?'#7D1025':'#857973'} strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:item.svg}}/>
                    </div>
                    <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</span>
                    {item.live && <span style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E', display:'inline-block', animation:'pulseDot 1.5s ease-out infinite' }}/>}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Child selector */}
        {children.length > 0 && (
          <div style={{ padding:'12px 16px', borderTop:'1px solid #F4EFEB' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#7D1025', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>
              {children.length>1?'Viewing child':'Child'}
            </div>
            {children.length>1 ? (
              <select value={selectedChildId||''} onChange={e=>setSelectedChildId(e.target.value)}
                style={{ width:'100%', padding:'7px 9px', borderRadius:8, border:'1px solid #E8E2D6', fontSize:13, fontFamily:'inherit', fontWeight:600, color:'#231715', background:'#fff' }}>
                {children.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            ) : (
              <div style={{ fontSize:13.5, fontWeight:700, color:'#231715' }}>{children[0].name}</div>
            )}
          </div>
        )}

        {/* User card */}
        <div style={{ flexShrink:0, padding:'12px 14px', borderTop:'1px solid #F4EFEB' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px', borderRadius:10, background:'#FBFAF5', border:'1px solid #E8E2D6' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#7D1025,#5A0B1B)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:'#F0CC5A', fontSize:11, fontWeight:700 }}>
                {((user?.firstName?.[0]||'')+(user?.lastName?.[0]||'')).toUpperCase()||'P'}
              </span>
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:12.5, fontWeight:700, color:'#1A0F0E', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{parentName}</div>
              <div style={{ fontSize:10.5, color:'#857973', marginTop:2 }}>Parent{selectedChild?' · '+selectedChild.name:''}</div>
            </div>
          </div>
          <div onClick={()=>window.location.href='/'} style={{ marginTop:6, padding:'9px 12px', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#857973', fontWeight:500, transition:'all .15s', marginBottom:8 }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#FAF7F4'; e.currentTarget.style.color='#7D1025' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#857973' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            <span>Back to Website</span>
          </div>
        </div>

        <style>{`@keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}.card{background:#fff;border:1px solid #E8E2D6;border-radius:12px;}.kpi{background:#fff;border:1px solid #E8E2D6;border-radius:12px;padding:16px 18px;}.tbl{width:100%;border-collapse:collapse;}.tbl thead{background:#FBFAF5;}.tbl thead th{padding:9px 14px;text-align:left;font-size:10.5px;font-weight:700;color:#7D1025;text-transform:uppercase;letter-spacing:.06em;border-bottom:1.5px solid #E8E2D6;}.tbl tbody tr{border-top:1px solid #E8E2D6;}.tbl td{padding:10px 14px;}.sec-tag{font-size:10px;font-weight:700;color:#7D1025;text-transform:uppercase;letter-spacing:.14em;margin-bottom:4px;}.serif{font-family:'Instrument Serif',Georgia,serif;font-weight:400;}`}</style>
      </aside>

      {/* ══ MAIN ══ */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:'#FBFAF5' }}>
        {/* Frosted top bar */}
        <div style={{ position:'sticky', top:0, zIndex:30, background:'rgba(251,250,245,.9)', backdropFilter:'saturate(180%) blur(20px)', WebkitBackdropFilter:'saturate(180%) blur(20px)', borderBottom:'1px solid #F4EFEB', padding:'13px 28px', display:'flex', alignItems:'center', gap:20, minHeight:60, flexShrink:0 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#7D1025', letterSpacing:'.14em', textTransform:'uppercase', marginBottom:3 }}>Parent Portal</div>
            <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:22, fontWeight:400, color:'#1A0F0E', lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {PAGES[page] || 'Dashboard'}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={()=>setPage('messages')} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:'1px solid #E8E2D6', background:'#FBFAF5', color:'#564844', fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Messages
            </button>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#7D1025,#5A0B1B)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #C9A03040' }}>
              <span style={{ color:'#F0CC5A', fontSize:12, fontWeight:700 }}>{((user?.firstName?.[0]||'')+(user?.lastName?.[0]||'')).toUpperCase()||'P'}</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', maxWidth:1400, margin:'0 auto', width:'100%', boxSizing:'border-box', animation:'fadeIn .25s ease' }}>
          {page==='dashboard' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Welcome back</div><h1 className="serif" style={{fontSize:28,color:'var(--s900)'}}>Hello, <em style={{color:'var(--b700)'}}>{user?.firstName || parentName}</em></h1></div>
              {childrenLoading ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s400)'}}>Loading…</div>
              ) : children.length === 0 ? (
                <div className="card" style={{padding:'48px 32px',textAlign:'center'}}>
                  <div className="serif" style={{fontSize:22,color:'var(--s900)',marginBottom:8}}>No child linked yet</div>
                  <div style={{fontSize:13.5,color:'var(--s500)',maxWidth:420,margin:'0 auto',lineHeight:1.6}}>
                    Your account isn't linked to a student yet. Please contact the Smartious administration to link your child to your account.
                  </div>
                </div>
              ) : (
                <>
                  <div style={{background:'linear-gradient(135deg,#7D1025,#5A0B1B)',borderRadius:'var(--rxl)',padding:'24px 28px',marginBottom:24,display:'flex',gap:20,flexWrap:'wrap',alignItems:'center'}}>
                    <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,.15)',border:'3px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,color:'#fff',fontFamily:'JetBrains Mono,monospace',flexShrink:0}}>
                      {initials(selectedChild?.name)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:22,fontWeight:700,color:'#fff',marginBottom:4}}>{selectedChild?.name}</div>
                      <div style={{fontSize:13.5,color:'rgba(255,255,255,.7)',marginBottom:12}}>
                        {[overview?.child?.programme, overview?.child?.deliveryMode, overview?.child?.curriculum, overview?.child?.grade].filter(Boolean).join(' · ')}
                      </div>
                      <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
                        {[
                          [`${avgScore}%`,'Overall Progress'],
                          [`${overview?.stats?.allocatedSubjects ?? 0}`,'Subjects w/ Teacher'],
                          [`${overview?.stats?.enrolledSubjects ?? 0}`,'Enrolled Subjects'],
                        ].map(([v,l]) => (
                          <div key={l}><div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>{l}</div><div className="mono" style={{fontSize:16,fontWeight:700,color:'#fff'}}>{v}</div></div>
                        ))}
                      </div>
                    </div>
                    <div style={{display:'flex',gap:10}}>
                      <button className="btn" style={{background:'rgba(255,255,255,.9)',color:'#7D1025',fontWeight:700,borderColor:'transparent'}} onClick={()=>setPage('progress')}>Full Progress →</button>
                    </div>
                  </div>
                  {childLoading ? (
                    <div className="card" style={{padding:30,textAlign:'center',color:'var(--s400)'}}>Loading progress…</div>
                  ) : (
                    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginTop:8}}>
                      <div className="card">
                        <div className="chdr"><div className="ctitle">Subject Progress</div><button className="btn btn-g btn-sm" onClick={()=>setPage('progress')}>Full Report</button></div>
                        {subjects.length === 0 ? (
                          <div style={{padding:'20px 0',color:'var(--s400)',fontSize:13,textAlign:'center'}}>No subjects with progress yet.</div>
                        ) : (
                          <div style={{display:'flex',flexWrap:'wrap',gap:14,justifyContent:'center',paddingTop:6}}>
                            {subjects.map(s => <ProgressRing key={s.name} pct={s.score} label={s.name} sublabel={`${s.mastered}/${s.total}`} />)}
                          </div>
                        )}
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:14}}>
                        <div className="card">
                          <div className="ctitle" style={{marginBottom:12}}>Quick Actions</div>
                          {[['Live Lessons','lessons'],['Programme & Teachers','programme'],['Ask Mshauri AI','mshauri'],['Pay Fees','payments']].map(([l,p]) => (
                            <button key={l} className="btn btn-s btn-sm" style={{width:'100%',justifyContent:'flex-start',marginBottom:6}} onClick={()=>setPage(p)}>{l}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── ACADEMIC PROGRESS ── */}
          {page==='progress' && (
            <div>
              <div style={{marginBottom:20}}>
                <div className="sec-tag">{selectedChild ? selectedChild.name + (overview?.child?.curriculum ? ' · ' + overview.child.curriculum : '') : 'Academic Progress'}</div>
                <h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Academic <em style={{color:'var(--b700)'}}>Progress</em></h2>
              </div>
              {childrenLoading || childLoading ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s400)'}}>Loading…</div>
              ) : !selectedChild ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s500)'}}>No child linked to your account yet.</div>
              ) : (
                <>
                  <div className="kpi-grid" style={{marginBottom:24}}>
                    {[
                      {v:`${avgScore}%`,l:'Overall Progress',d:'Across all subjects',dc:'var(--g600)'},
                      {v:`${(progress?.subjects||[]).length}`,l:'Subjects',d:'With an allocated teacher',dc:'var(--b700)'},
                      {v:`${(progress?.subjects||[]).reduce((s,x)=>s+x.masteredLessons,0)}`,l:'Lessons Mastered',d:'Marked by teachers',dc:'var(--g600)'},
                      {v:`${(progress?.subjects||[]).reduce((s,x)=>s+x.totalLessons,0)}`,l:'Total Lessons',d:'Published in subjects',dc:'var(--a600)'},
                    ].map((k,i) => (
                      <div key={i} className="kpi"><div className="kpi-v">{k.v}</div><div className="kpi-l">{k.l}</div><div className="kpi-d" style={{color:k.dc}}>{k.d}</div></div>
                    ))}
                  </div>
                  <div className="card">
                    <div className="ctitle" style={{marginBottom:14}}>Subject Breakdown</div>
                    {(progress?.subjects || []).length === 0 ? (
                      <div style={{padding:'20px 0',color:'var(--s400)',fontSize:13,textAlign:'center'}}>No subject progress yet.</div>
                    ) : (
                      <>
                        <div style={{display:'flex',flexWrap:'wrap',gap:16,justifyContent:'center',paddingBottom:18,marginBottom:8,borderBottom:'1px solid var(--border)'}}>
                          {(progress?.subjects || []).map((s,i) => <ProgressRing key={i} pct={s.progressPct} label={s.name} sublabel={`${s.masteredLessons}/${s.totalLessons}`} />)}
                        </div>
                        <table className="tbl">
                          <thead><tr><th>Subject</th><th>Curriculum</th><th>Lessons Mastered</th><th>Progress</th><th>Status</th></tr></thead>
                          <tbody>
                            {(progress?.subjects || []).map((s,i) => (
                              <tr key={i}>
                                <td style={{fontWeight:700}}>{s.name}</td>
                                <td style={{color:'var(--s500)',fontSize:13}}>{s.curriculum}</td>
                                <td><span className="mono">{s.masteredLessons}/{s.totalLessons}</span></td>
                                <td><span className="mono" style={{fontWeight:700,color:mCol(s.progressPct)}}>{s.progressPct}%</span></td>
                                <td><span className={`badge ${s.progressPct>=70?'badge-green':s.progressPct>=40?'badge-amber':'badge-red'}`}>{s.progressPct>=70?'On Track':s.progressPct>=40?'In Progress':'Getting Started'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── LIVE LESSONS ── */}
          {page==='lessons' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Live Classes</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Live Lessons</h2></div>
              {!selectedChild ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s500)'}}>No child linked yet.</div>
              ) : liveLoading ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s400)'}}>Loading classes…</div>
              ) : liveClasses.length === 0 ? (
                <div className="card" style={{padding:'48px 32px',textAlign:'center'}}>
                  <div className="serif" style={{fontSize:18,color:'var(--s900)',marginBottom:8}}>No live classes scheduled yet</div>
                  <div style={{fontSize:13.5,color:'var(--s500)',maxWidth:420,margin:'0 auto',lineHeight:1.6}}>
                    Your child's teachers haven't published a live class schedule yet.
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="ctitle" style={{marginBottom:14}}>{selectedChild.name}'s Schedule</div>
                  {liveClasses.map(formatLiveClass).map((c,i) => {
                    const live = c.isLive || c.status === 'live'
                    const done = c.status === 'completed' || c.status === 'done'
                    return (
                      <div key={c.id || i} style={{display:'flex',gap:14,padding:'12px 0',borderBottom:'1px solid var(--border)',flexWrap:'wrap',alignItems:'center'}}>
                        {c.dayOfWeek && <span className="mono" style={{fontWeight:700,color:'var(--b700)',width:42,flexShrink:0}}>{c.dayOfWeek.slice(0,3)}</span>}
                        <div style={{flex:1,minWidth:200}}>
                          <div style={{fontWeight:700,fontSize:14}}>{c.title}</div>
                          <div style={{fontSize:12,color:'var(--s500)'}}>
                            {c.teacher && <>{c.teacher} · </>}
                            {c.startTime}{c.endTime ? ` – ${c.endTime}` : ''}
                          </div>
                        </div>
                        <span className={`badge ${live?'badge-red':done?'badge-green':'badge-blue'}`}>
                          {live?'● Live':done?'Done':'Upcoming'}
                        </span>
                        {live && c.meetingLink && (
                          <a href={c.meetingLink} target="_blank" rel="noopener noreferrer"
                            className="btn btn-p btn-sm" style={{textDecoration:'none'}}>
                            Join to Monitor
                          </a>
                        )}
                        {!live && c.meetingLink && (
                          <button className="btn btn-s btn-sm" onClick={()=>window.open(c.meetingLink, '_blank')}>Link</button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PROGRAMME DETAILS ── */}
          {page==='programme' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Enrolment</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Programme Details</h2></div>
              {childrenLoading || childLoading ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s400)'}}>Loading…</div>
              ) : !selectedChild ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s500)'}}>No child linked to your account yet.</div>
              ) : (
                <>
                  <div className="card" style={{marginBottom:20}}>
                    <div className="ctitle" style={{marginBottom:14}}>{selectedChild.name.split(' ')[0]}'s Programme</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
                      {[
                        ['Programme', overview?.child?.programme || '—'],
                        ['Delivery Mode', overview?.child?.deliveryMode || '—'],
                        ['Curriculum', overview?.child?.curriculum || '—'],
                        ['Year / Grade', overview?.child?.grade || '—'],
                        ['Admission Number', overview?.child?.admissionNumber || '—'],
                        ['Enrolled Subjects', String(overview?.stats?.enrolledSubjects ?? 0)],
                      ].map(([l,v]) => (
                        <div key={l} style={{padding:'12px 14px',background:'var(--bg)',borderRadius:'var(--rmd)'}}>
                          <div style={{fontSize:10,fontWeight:700,color:'var(--s400)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{l}</div>
                          <div style={{fontSize:14,fontWeight:700,color:'var(--s800)'}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <h3 className="serif" style={{fontSize:20,color:'var(--s900)',marginBottom:6}}>Your child's teachers</h3>
                  <div style={{fontSize:13,color:'var(--s500)',marginBottom:14}}>Each subject has an allocated teacher. Tap "Email" to send them a message.</div>
                  {teachersLoading ? (
                    <div className="card" style={{padding:30,textAlign:'center',color:'var(--s400)'}}>Loading teacher profiles…</div>
                  ) : teachers.length === 0 ? (
                    <div className="card" style={{padding:30,textAlign:'center',color:'var(--s500)'}}>No teachers allocated yet.</div>
                  ) : (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(420px,1fr))',gap:14}}>
                      {teachers.map((t,i) => <TeacherCard key={`${t._id||i}-${t.subjectName||i}`} teacher={t} onEmail={emailTeacher}/>)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── TUTOR & ADVISOR ── */}
          {page==='tutor' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Support Team</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Tutor &amp; Advisor</h2></div>
              {teachersLoading || childLoading ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s400)'}}>Loading…</div>
              ) : !selectedChild ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s500)'}}>No child linked yet.</div>
              ) : teachers.length === 0 ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s500)'}}>
                  No tutors assigned to {selectedChild.name} yet.
                </div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(420px,1fr))',gap:14}}>
                  {teachers.map((t,i) => <TeacherCard key={`tutor-${t._id||i}-${i}`} teacher={t} onEmail={emailTeacher}/>)}
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGES ── */}
          {page==='messages' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:20}}>
                <div><div className="sec-tag">Communication</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Messages</h2></div>
                {!composeOpen && (
                  <button className="btn btn-p btn-sm" onClick={() => { setComposeOpen(true); setComposeRecipients([]); setComposeSubject(''); setComposeBody('') }}>
                    + New Message
                  </button>
                )}
              </div>

              {composeOpen && (
                <div className="card" style={{marginBottom:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                    <div className="ctitle">New Message</div>
                    <button className="btn btn-s btn-sm" onClick={() => setComposeOpen(false)}>Cancel</button>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label className="fl">To (Teachers & Admin)</label>
                    {composeRecipients.length === 0 ? (
                      <div style={{padding:'12px 14px',background:'var(--bg)',borderRadius:'var(--rmd)',fontSize:13,color:'var(--s500)'}}>
                        Pick a teacher below or click "Email" on any teacher card in Programme Details.
                      </div>
                    ) : (
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {composeRecipients.map((r,i) => (
                          <div key={i} style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--b50)',color:'var(--b700)',padding:'5px 10px',borderRadius:99,fontSize:12,fontWeight:600}}>
                            {r.name || r.email}
                            <button onClick={() => setComposeRecipients(rs => rs.filter((_,j) => j!==i))} style={{background:'transparent',border:'none',color:'inherit',cursor:'pointer',fontSize:14,lineHeight:1,padding:0}}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {teachers.length > 0 && (
                      <div style={{marginTop:10}}>
                        <div style={{fontSize:11,color:'var(--s400)',marginBottom:6}}>Pick from your child's teachers:</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                          {teachers.filter(t => t.email).map((t,i) => {
                            const tName = t.name || `${t.firstName||''} ${t.lastName||''}`.trim()
                            const already = composeRecipients.some(r => r.email === t.email)
                            return (
                              <button key={i} className="btn btn-s btn-sm" style={{fontSize:11.5}} disabled={already}
                                onClick={() => setComposeRecipients(rs => [...rs, {email: t.email, name: tName}])}>
                                {already ? 'Added: ' : '+ '}{tName}{t.subjectName ? ` (${t.subjectName})` : ''}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{marginBottom:12}}>
                    <label className="fl">Subject</label>
                    <input className="fi" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} placeholder="E.g. Question about Mathematics progress"/>
                  </div>
                  <div style={{marginBottom:14}}>
                    <label className="fl">Message</label>
                    <textarea className="fi" rows={8} value={composeBody} onChange={e => setComposeBody(e.target.value)} placeholder="Type your message…" style={{resize:'vertical',fontFamily:'inherit'}}/>
                  </div>
                  <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                    <button className="btn btn-s btn-sm" onClick={() => setComposeOpen(false)}>Cancel</button>
                    <button className="btn btn-p" onClick={sendMessage} disabled={composeSending}>
                      {composeSending ? 'Sending…' : 'Send Message'}
                    </button>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="ctitle" style={{marginBottom:14}}>Message History</div>
                {historyLoading ? (
                  <div style={{padding:20,color:'var(--s400)',fontSize:13,textAlign:'center'}}>Loading…</div>
                ) : messageHistory.length === 0 ? (
                  <div style={{padding:20,color:'var(--s400)',fontSize:13,textAlign:'center'}}>
                    No messages sent yet. Click "+ New Message" to email your child's teachers.
                  </div>
                ) : messageHistory.map((m,i) => (
                  <div key={m._id || i} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,flexWrap:'wrap',gap:6}}>
                      <span style={{fontWeight:700,fontSize:13.5}}>{m.subject}</span>
                      <span style={{fontSize:11,color:'var(--s400)'}}>{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</span>
                    </div>
                    <div style={{fontSize:12,color:'var(--s500)',marginBottom:6}}>
                      To: {m.recipientCount || (m.recipients?.length || 0)} recipient{(m.recipientCount||1) === 1 ? '' : 's'}
                      {m.sentCount !== undefined && <> · Delivered: {m.sentCount}</>}
                    </div>
                    <div style={{fontSize:12.5,color:'var(--s600)',lineHeight:1.5,whiteSpace:'pre-wrap',maxHeight:60,overflow:'hidden'}}>
                      {m.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              FEES & PAYMENTS — connected to real backend
              ══════════════════════════════════════════════ */}
          {page==='payments' && (
            <div>
              <div style={{marginBottom:20}}>
                <div className="sec-tag">Finance</div>
                <h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Fees &amp; Payments</h2>
              </div>

              {/* ── KPI row ── */}
              <div className="kpi-grid" style={{marginBottom:24}}>
                {[
                  {
                    v: 'KES ' + monthlyRate.toLocaleString(),
                    l: 'Monthly Plan',
                    d: 'Individual Premium',
                    dc: 'var(--b700)',
                  },
                  {
                    v: outstanding != null ? 'KES ' + outstanding.toLocaleString() : '—',
                    l: 'Outstanding Balance',
                    d: outstanding > 0 ? 'Due now' : outstanding === 0 ? 'All clear ✓' : 'Loading…',
                    dc: outstanding > 0 ? 'var(--r500)' : 'var(--g600)',
                  },
                  {
                    v: nextDueDate ? new Date(nextDueDate).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '—',
                    l: 'Next Due Date',
                    d: nextDueAmount ? 'KES ' + nextDueAmount.toLocaleString() : 'Contact admin',
                    dc: 'var(--a600)',
                  },
                  {
                    v: String(payHistory.length || store.payments?.length || 0),
                    l: 'Payments Made',
                    d: 'All-time',
                    dc: 'var(--s500)',
                  },
                ].map((k,i) => (
                  <div key={i} className="kpi">
                    <div className="kpi-v" style={{fontSize:i===0||i===1?14:undefined}}>{k.v}</div>
                    <div className="kpi-l">{k.l}</div>
                    <div className="kpi-d" style={{color:k.dc}}>{k.d}</div>
                  </div>
                ))}
              </div>

              {/* Outstanding balance alert */}
              {outstanding > 0 && (
                <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'var(--rmd)',padding:'12px 16px',marginBottom:20,display:'flex',gap:12,alignItems:'center'}}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#DC2626'}}>Outstanding balance: KES {outstanding.toLocaleString()}</div>
                    {nextDueDate && <div style={{fontSize:12,color:'#991B1B',marginTop:2}}>Due by {new Date(nextDueDate).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div>}
                  </div>
                  <button className="btn btn-sm" style={{background:'#DC2626',color:'#fff',borderColor:'#DC2626',fontWeight:700,flexShrink:0}}
                    onClick={() => { setPayAmount(String(outstanding)); setPayDescription('Outstanding balance'); }}>
                    Pay Now
                  </button>
                </div>
              )}

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>

                {/* ── Pay Now card ── */}
                <div className="card">
                  <div className="ctitle" style={{marginBottom:6}}>Pay Fees</div>
                  <div style={{fontSize:12.5,color:'var(--s500)',marginBottom:16,lineHeight:1.6}}>
                    Pay via Paystack — Card, M-Pesa, or Bank Transfer. Enter any amount below; useful for partial payments, registration fees, or one-off charges.
                  </div>

                  <div style={{marginBottom:12}}>
                    <label className="fl">Amount (KES) *</label>
                    <input className="fi" type="number" min="1" step="1" value={payAmount}
                      onChange={e => setPayAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="E.g. 5000"/>
                  </div>

                  <div style={{marginBottom:12}}>
                    <label className="fl">What is this payment for?</label>
                    <input className="fi" value={payDescription} onChange={e => setPayDescription(e.target.value)}
                      placeholder="E.g. May fees, Registration, Exam fees"/>
                  </div>

                  {/* Quick-fill buttons — driven by feeSummary if available */}
                  <div style={{marginBottom:6,fontSize:11,color:'var(--s400)',fontWeight:600}}>Quick fill</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:14}}>
                    {quickAmounts.map(q => (
                      <button key={q} className="btn btn-s btn-sm" onClick={() => setPayAmount(String(q))}
                        style={{justifyContent:'space-between'}}>
                        <span className="mono" style={{fontWeight:700}}>KES {q.toLocaleString()}</span>
                      </button>
                    ))}
                    {/* Outstanding shortcut */}
                    {outstanding > 0 && !quickAmounts.includes(outstanding) && (
                      <button className="btn btn-sm" onClick={() => { setPayAmount(String(outstanding)); setPayDescription('Outstanding balance') }}
                        style={{gridColumn:'span 2',justifyContent:'space-between',background:'var(--r50)',borderColor:'#FECACA',color:'#DC2626'}}>
                        <span>Pay outstanding</span>
                        <span className="mono" style={{fontWeight:700}}>KES {outstanding.toLocaleString()}</span>
                      </button>
                    )}
                    {/* Next due shortcut */}
                    {nextDueAmount > 0 && !quickAmounts.includes(nextDueAmount) && nextDueAmount !== outstanding && (
                      <button className="btn btn-sm" onClick={() => { setPayAmount(String(nextDueAmount)); setPayDescription('Monthly fees') }}
                        style={{gridColumn:'span 2',justifyContent:'space-between',background:'var(--a50)',borderColor:'var(--a200)',color:'var(--a700)'}}>
                        <span>Pay next due</span>
                        <span className="mono" style={{fontWeight:700}}>KES {nextDueAmount.toLocaleString()}</span>
                      </button>
                    )}
                  </div>

                  <button className="btn btn-ok" style={{width:'100%',justifyContent:'center'}}
                    onClick={startPaystack} disabled={payLoading || !payAmount}>
                    {payLoading ? 'Starting…' : `Pay KES ${parseInt(payAmount || '0', 10).toLocaleString()} via Paystack`}
                  </button>
                  <div style={{fontSize:11,color:'var(--s400)',marginTop:8,textAlign:'center'}}>
                    Secured by Paystack · Card, M-Pesa, and Bank Transfer accepted
                  </div>
                </div>

                {/* ── Payment history card ── */}
                <div className="card">
                  <div className="ctitle" style={{marginBottom:14}}>Payment History</div>
                  {payHistoryLoading ? (
                    <div style={{padding:20,color:'var(--s400)',fontSize:13,textAlign:'center'}}>Loading…</div>
                  ) : (payHistory.length === 0 && (store.payments||[]).length === 0) ? (
                    <div style={{padding:20,color:'var(--s400)',fontSize:13,textAlign:'center'}}>No payments yet.</div>
                  ) : (
                    [...payHistory, ...(store.payments||[]).filter(sp =>
                      !payHistory.some(rp => rp.reference === sp.ref)
                    )]
                    .slice(0, 10)
                    .map((p, i) => {
                      // Normalise — backend records vs store records have different shapes
                      const date = p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})
                        : (p.date || '—')
                      const desc = p.description || (p.desc||'').split('—')[0].trim() || 'Payment'
                      const amtDisplay = p.amountDisplay || p.amount || (p.amount ? 'KES ' + Number(p.amount).toLocaleString() : '—')
                      const status = p.status || 'success'
                      const ref = p.reference || p.ref || ''
                      return (
                        <div key={p._id || p.ref || i} style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:3}}>
                            <span style={{fontWeight:700,fontSize:13.5,flex:1}}>{desc}</span>
                            <span className="mono" style={{fontWeight:700,fontSize:13,flexShrink:0}}>{amtDisplay}</span>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                            <span style={{fontSize:11,color:'var(--s400)'}}>{date}{ref ? ` · ${ref.slice(0,14)}…` : ''}</span>
                            <PayBadge status={status}/>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── MSHAURI AI ── */}
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
                    {["How is my child doing?","Help with study plan","Explain IGCSE"].map(s => (
                      <button key={s} className="btn btn-s btn-sm" style={{fontSize:11.5,padding:'4px 10px'}} onClick={()=>{setAiInp(s);setTimeout(()=>sendAi(),50)}}>{s}</button>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <textarea className="chat-input" value={aiInp} onChange={e=>setAiInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAi()}}} rows={1} placeholder="Ask Mshauri about your child's education…" style={{flex:1}}/>
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
