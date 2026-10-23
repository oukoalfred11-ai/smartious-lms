import React, { useState, useEffect, useCallback } from 'react'
import { useAuth, api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { DOSSpinner, PSection } from '../shared/ui.jsx'
import { LessonsToClose } from '../../../../components/lessons/LessonControl.jsx'
import { SchoolCalendarManager } from '../../../../components/lessons/SchoolCalendar.jsx'
import { ClickStat, useStatReport } from '../shared/StatReport.jsx'

export function DOSAnalyticsModule({ toast, refreshKey }) {
  const [overview, setOverview]   = useState(null)
  const [examData, setExamData]   = useState(null)
  const [hwData,   setHwData]     = useState(null)
  const [atRisk,   setAtRisk]     = useState(null)
  const [loading,  setLoading]    = useState(true)
  const [filters,  setFilters]    = useState({ termStart:'', termEnd:'', curriculum:'', subject:'' })
  const report = useStatReport(toast)

  const load = useCallback(() => {
    setLoading(true)
    const p = { params: Object.fromEntries(Object.entries(filters).filter(([,v])=>v)) }
    Promise.allSettled([
      api.get('/dos/overview'),
      api.get('/dos/exam-analytics', p),
      api.get('/dos/homework-compliance', p),
      api.get('/dos/at-risk'),
    ]).then(([ov,ex,hw,ar]) => {
      setOverview(ov.status==='fulfilled' ? ov.value.data?.data : null)
      setExamData(ex.status==='fulfilled' ? ex.value.data?.data : null)
      setHwData(hw.status==='fulfilled'   ? hw.value.data?.data : null)
      setAtRisk(ar.status==='fulfilled'   ? ar.value.data?.data : null)
    }).finally(() => setLoading(false))
  }, [filters, refreshKey])

  useEffect(() => { load() }, [load])

  const gc = s => s===null?TOKENS.s400:s>=80?'#065F46':s>=70?'#1E40AF':s>=60?'#92400E':s>=50?'#6B21A8':s>=40?'#9A3412':'#991B1B'
  // Mixed curricula grade differently (A*–G, 9–1, EE/ME…), so school-wide tables show a band, not a letter.
  const gl = s => s===null?'—':s>=80?'Strong':s>=60?'Secure':s>=40?'Developing':'Weak'

  return (
    <>
      <PSection tag="Dean of Studies" title="Performance" em="Analytics"
        sub="Live overview of student performance, exam results, homework tracking and at-risk flags."/>
      {report.modal}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap', alignItems:'center', background:'#fff', border:'1px solid '+TOKENS.line, borderRadius:10, padding:'12px 14px' }}>
        <input type="date" value={filters.termStart} onChange={e=>setFilters(p=>({...p,termStart:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}/>
        <span style={{ fontSize:12, color:TOKENS.s400 }}>to</span>
        <input type="date" value={filters.termEnd} onChange={e=>setFilters(p=>({...p,termEnd:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}/>
        <select value={filters.curriculum} onChange={e=>setFilters(p=>({...p,curriculum:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}>
          <option value="">All curricula</option>
          {['Cambridge IGCSE','Edexcel','A-Level','IB','CBC','American','BNC'].map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <input value={filters.subject} onChange={e=>setFilters(p=>({...p,subject:e.target.value}))}
          placeholder="Subject" style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, width:130, fontFamily:'inherit' }}/>
        <button onClick={load} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'8px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>Apply</button>
        <button onClick={()=>{ setFilters({ termStart:'', termEnd:'', curriculum:'', subject:'' }); setTimeout(load,50) }}
          style={{ background:'transparent', border:'1px solid '+TOKENS.line, color:TOKENS.s500, padding:'8px 12px', borderRadius:7, fontSize:12, cursor:'pointer' }}>Reset</button>
      </div>
      {loading ? <DOSSpinner/> : (
        <>
          {overview && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:24 }}>
              {[
                { label:'Active students',  val:overview.totalStudents,        color:TOKENS.crimson, spec:{ key:'students' } },
                { label:'Teachers',         val:overview.totalTeachers,        color:'#1E40AF', spec:{ key:'teachers', params:{ days:30 } } },
                { label:'Exams this month', val:overview.examsThisMonth,       color:'#6B21A8', spec:{ key:'examsSet', params:{ days:30 } } },
                { label:'Avg exam score',   val:overview.avgExamScore!==null?overview.avgExamScore+'%':'—', color:gc(overview.avgExamScore), spec:{ key:'exams', params:{ days:30 } } },
                { label:'HW compliance',    val:overview.hwComplianceRate!==null?overview.hwComplianceRate+'%':'—', color:overview.hwComplianceRate>=80?'#065F46':overview.hwComplianceRate>=60?'#D97706':'#991B1B', spec:{ key:'homework', params:{ days:30 } } },
                { label:'Attendance (7d)',  val:overview.attendanceRate!==null?overview.attendanceRate+'%':'—', color:overview.attendanceRate>=80?'#065F46':overview.attendanceRate>=60?'#D97706':'#991B1B', spec:{ key:'attendance', params:{ days:7 } } },
              ].map(k=>(
                <ClickStat key={k.label} onOpen={()=>report.open(k.spec)}>
                  <div className="card" style={{ padding:'14px 16px 20px', height:'100%', boxSizing:'border-box' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>{k.label}</div>
                    <div style={{ fontSize:22, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
                  </div>
                </ClickStat>
              ))}
            </div>
          )}
          {examData?.subjects?.length > 0 && (
            <div className="card" style={{ overflow:'hidden', marginBottom:18 }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, fontWeight:800, fontSize:13, color:TOKENS.s900 }}>Subject Performance</div>
              <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>
                  {['Subject','Curriculum','Class avg','Grade','Pass rate','Highest','Lowest','Exams'].map(h=>(
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10.5 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {examData.subjects.map(s => (
                    <tr key={s.subject} style={{ borderTop:'1px solid '+TOKENS.line }}>
                      <td style={{ padding:'9px 12px', fontWeight:700, fontSize:13 }}>{s.subject}</td>
                      <td style={{ padding:'9px 12px', fontSize:12, color:TOKENS.s500 }}>{s.curriculum}</td>
                      <td style={{ padding:'9px 12px', fontWeight:800, fontSize:14, color:gc(s.avgScore) }}>{s.avgScore!==null?s.avgScore+'%':'—'}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:800, background:gc(s.avgScore)+'18', color:gc(s.avgScore) }}>{gl(s.avgScore)}</span>
                      </td>
                      <td style={{ padding:'9px 12px', fontWeight:700, color:s.passRate>=60?'#065F46':'#991B1B' }}>{s.passRate!==null?s.passRate+'%':'—'}</td>
                      <td style={{ padding:'9px 12px', color:'#065F46', fontWeight:600 }}>{s.highest!==null?s.highest+'%':'—'}</td>
                      <td style={{ padding:'9px 12px', color:'#991B1B', fontWeight:600 }}>{s.lowest!==null?s.lowest+'%':'—'}</td>
                      <td style={{ padding:'9px 12px', color:TOKENS.s500 }}>{s.exams?.length||0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {hwData?.teachers?.length > 0 && (
              <div className="card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, fontWeight:800, fontSize:13, color:TOKENS.s900 }}>Teacher HW Compliance</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr>
                    {['Teacher','Missing HW','Mark rate','Score'].map(h=>(
                      <th key={h} style={{ padding:'7px 10px', textAlign:'left', fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', background:TOKENS.cream, borderBottom:'1px solid '+TOKENS.line }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {hwData.teachers.map(t => {
                      const cs = t.complianceScore
                      const cc = cs>=90?'#065F46':cs>=70?'#D97706':'#991B1B'
                      return (
                        <tr key={String(t.teacherId)} style={{ borderTop:'1px solid '+TOKENS.line }}>
                          <td style={{ padding:'8px 10px', fontWeight:600, fontSize:12 }}>{t.teacherName}</td>
                          <td style={{ padding:'8px 10px', textAlign:'center', fontSize:12, color:t.lessonsWithoutHW>0?'#991B1B':TOKENS.s400, fontWeight:t.lessonsWithoutHW>0?700:400 }}>
                            {t.lessonsWithoutHW>0?t.lessonsWithoutHW+' missing':'All covered'}
                          </td>
                          <td style={{ padding:'8px 10px', textAlign:'center', fontSize:12, fontWeight:700, color:t.markingRate>=80?'#065F46':t.markingRate>=60?'#D97706':'#991B1B' }}>
                            {t.markingRate!==null?t.markingRate+'%':'—'}
                          </td>
                          <td style={{ padding:'8px 10px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                              <div style={{ flex:1, height:6, background:'#F3F4F6', borderRadius:99 }}>
                                <div style={{ width:(cs||0)+'%', height:'100%', background:cc, borderRadius:99 }}/>
                              </div>
                              <span style={{ fontSize:11, fontWeight:700, color:cc, minWidth:30 }}>{cs!==null?cs+'%':'—'}</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {atRisk?.students?.length > 0 && (
              <div className="card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:800, fontSize:13, color:TOKENS.s900 }}>At-Risk Students</span>
                  <span style={{ fontSize:11.5, fontWeight:700, color:'#991B1B' }}>{atRisk.totalAtRisk} flagged</span>
                </div>
                <div style={{ maxHeight:320, overflowY:'auto' }}>
                  {atRisk.students.map(s => (
                    <div key={String(s.studentId)} style={{ padding:'10px 14px', borderBottom:'1px solid '+TOKENS.line }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <div style={{ fontSize:12.5, fontWeight:700, color:TOKENS.s900 }}>{s.studentName}</div>
                          <div style={{ fontSize:11, color:TOKENS.s500 }}>{s.curriculum} · {s.grade}</div>
                        </div>
                        <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:99,
                          background:s.riskLevel==='high'?'#FEE2E2':'#FEF9C3',
                          color:s.riskLevel==='high'?'#991B1B':'#92400E' }}>
                          {s.riskLevel==='high'?'High risk':'At risk'}
                        </span>
                      </div>
                      <div style={{ display:'flex', gap:12, marginTop:5, flexWrap:'wrap' }}>
                        {s.avg!==null&&<span style={{ fontSize:11, color:gc(s.avg), fontWeight:700 }}>Score: {s.avg}%</span>}
                        {s.attRate!==null&&<span style={{ fontSize:11, color:s.attRate<60?'#991B1B':'#D97706', fontWeight:700 }}>Attendance: {s.attRate}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {!overview && !examData && !hwData && (
            <div style={{ padding:'40px 0', textAlign:'center', color:TOKENS.s400, fontSize:13 }}>
              DOS analytics backend not yet deployed. Deploy <code>dos-analytics.js</code> and mount at <code>/api/dos</code>.
            </div>
          )}
        </>
      )}
    </>
  )
}

export function DOSExamsModule({ toast, refreshKey }) {
  const [exams,    setExams]    = useState([])
  const [selected, setSelected] = useState(null)
  const [subs,     setSubs]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [subLoading, setSubLoading] = useState(false)
  const [filters, setFilters]   = useState({ subject:'', curriculum:'', type:'all', search:'' })

  const load = useCallback(() => {
    setLoading(true)
    const params = {}
    if (filters.subject)    params.subject    = filters.subject
    if (filters.curriculum) params.curriculum = filters.curriculum
    api.get('/exams/all', { params })
      .then(r => {
        let list = r.data?.data?.exams || []
        if (filters.type==='weekly')  list = list.filter(e=>/weekly|assessment|quiz/i.test(e.title)||!(/end.?term|final|terminal/i.test(e.title)))
        if (filters.type==='endterm') list = list.filter(e=>/end.?term|final|terminal/i.test(e.title))
        if (filters.search) {
          const s = filters.search.toLowerCase()
          list = list.filter(e=>(e.title||'').toLowerCase().includes(s)||(e.subject||'').toLowerCase().includes(s))
        }
        setExams(list)
      })
      .catch(e => toast?.error?.('Failed to load exams: '+( e?.response?.data?.message||e.message)))
      .finally(() => setLoading(false))
  }, [filters, refreshKey])

  useEffect(() => { load() }, [load])

  const openExam = async (exam) => {
    setSelected(exam); setSubs([]); setSubLoading(true)
    try {
      const { data } = await api.get('/exams/'+exam._id+'/submissions')
      setSubs(data?.data?.submissions || data?.submissions || [])
    } catch { toast?.error?.('Could not load submissions.') }
    finally { setSubLoading(false) }
  }

  const gc = s => s===null?TOKENS.s400:s>=80?'#065F46':s>=70?'#1E40AF':s>=60?'#92400E':s>=50?'#6B21A8':s>=40?'#9A3412':'#991B1B'
  // Mixed curricula grade differently (A*–G, 9–1, EE/ME…), so school-wide tables show a band, not a letter.
  const gl = s => s===null?'—':s>=80?'Strong':s>=60?'Secure':s>=40?'Developing':'Weak'
  const fmtDate = d => d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'
  const isEndTerm = e => /end.?term|final|terminal/i.test(e.title||'')

  if (selected) {
    const scores = subs.filter(s=>s.status==='graded').map(s=>{
      const awarded = (s.answers||[]).reduce((t,a)=>t+(a.marksAwarded||0),0)
      const pct = selected.totalMarks>0?Math.round((awarded/selected.totalMarks)*100):0
      return { ...s, awarded, pct }
    }).sort((a,b)=>b.pct-a.pct)
    const all = scores.map(s=>s.pct)
    const avg = all.length?Math.round(all.reduce((a,b)=>a+b,0)/all.length):null
    const GKEYS = ['Strong','Secure','Developing','Weak']
    const GCOLS = { Strong:'#065F46', Secure:'#1E40AF', Developing:'#92400E', Weak:'#991B1B' }
    const dist = all.reduce((acc,sc)=>{ const g=gl(sc); acc[g]=(acc[g]||0)+1; return acc },{})
    return (
      <>
        <button onClick={()=>setSelected(null)} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, padding:0, marginBottom:16 }}>← Back to exams</button>
        <div className="card" style={{ padding:22, marginBottom:16, background:'linear-gradient(135deg,#7D1025,#5A0B1B)', color:'#fff' }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:8 }}>{isEndTerm(selected)?'End-of-Term Exam':'Weekly Assessment'} · {fmtDate(selected.startAt)}</div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#fff', margin:'0 0 4px' }}>{selected.title}</h2>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.65)' }}>{selected.subject} · {selected.curriculum} · {selected.grade} · {selected.totalMarks} marks</div>
          <div style={{ display:'flex', gap:20, marginTop:16, flexWrap:'wrap' }}>
            {[{ label:'Submissions',val:subs.length },{ label:'Graded',val:scores.length },{ label:'Class avg',val:avg!==null?avg+'%':'—',color:'#C9A030' },{ label:'Highest',val:all.length?Math.max(...all)+'%':'—',color:'#6EE7B7' },{ label:'Lowest',val:all.length?Math.min(...all)+'%':'—',color:'#FCA5A5' }].map(k=>(
              <div key={k.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:800, color:k.color||'#fff' }}>{k.val}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', marginTop:2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
        {all.length>0&&(
          <div className="card" style={{ padding:16, marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:TOKENS.s900, marginBottom:10 }}>Score bands <span style={{ fontWeight:400, color:TOKENS.s400 }}>(80%+ strong · 60–79 secure · 40–59 developing · under 40 weak; letter grades follow each student's curriculum on reports)</span></div>
            <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:60 }}>
              {GKEYS.map(g=>{ const c=dist[g]||0; const h=all.length?Math.max(4,(c/all.length)*60):0; return (
                <div key={g} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:GCOLS[g] }}>{c}</div>
                  <div style={{ width:'100%', height:h, background:GCOLS[g], borderRadius:'3px 3px 0 0' }}/>
                  <div style={{ fontSize:10.5, fontWeight:800, color:GCOLS[g] }}>{g}</div>
                </div>
              )})}
            </div>
          </div>
        )}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, fontWeight:800, fontSize:13, color:TOKENS.s900 }}>Student Results ({scores.length})</div>
          {subLoading?<div style={{ padding:30,textAlign:'center',color:TOKENS.s400 }}>Loading...</div>:scores.length===0?<div style={{ padding:30,textAlign:'center',color:TOKENS.s400 }}>No graded submissions yet.</div>:(
            <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Rank','Student','Score','%','Grade','Focus'].map(h=><th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10.5 }}>{h}</th>)}</tr></thead>
              <tbody>
                {scores.map((s,i)=>(
                  <tr key={String(s._id)} style={{ borderTop:'1px solid '+TOKENS.line }}>
                    <td style={{ padding:'9px 12px', fontWeight:700, color:i===0?'#C9A030':i<3?TOKENS.s900:TOKENS.s400, fontSize:i===0?15:13 }}>{i===0?'1st':i===1?'2nd':i===2?'3rd':i+1}</td>
                    <td style={{ padding:'9px 12px', fontWeight:700 }}>{s.student?.firstName||''} {s.student?.lastName||''}</td>
                    <td style={{ padding:'9px 12px', fontWeight:700 }}>{s.awarded}/{selected.totalMarks}</td>
                    <td style={{ padding:'9px 12px', fontWeight:800, fontSize:15, color:gc(s.pct) }}>{s.pct}%</td>
                    <td style={{ padding:'9px 12px' }}><span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:800, background:gc(s.pct)+'18', color:gc(s.pct) }}>{gl(s.pct)}</span></td>
                    <td style={{ padding:'9px 12px', fontSize:11.5, color: (s.tabSwitches||0)+(s.copyPasteAttempts||0) > 0 ? '#B45309' : TOKENS.s400 }}
                      title="Counted during the sitting and disclosed to the student. Context matters: a switch can be a dropped connection.">
                      {(s.tabSwitches||0)+(s.copyPasteAttempts||0) === 0 ? 'clean' : `${s.tabSwitches||0} away · ${s.copyPasteAttempts||0} paste`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <PSection tag="Dean of Studies" title="Exams &" em="Assessments" sub="All weekly assessments and end-of-term exams. Click any exam to see student scores and grade distribution."/>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input value={filters.search} onChange={e=>setFilters(p=>({...p,search:e.target.value}))} placeholder="Search exam or subject..."
          style={{ flex:'1 1 200px', padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }}/>
        <select value={filters.curriculum} onChange={e=>setFilters(p=>({...p,curriculum:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}>
          <option value="">All curricula</option>
          {['Cambridge IGCSE','Edexcel','A-Level','IB','CBC','American','BNC'].map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.type} onChange={e=>setFilters(p=>({...p,type:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}>
          <option value="all">All types</option>
          <option value="weekly">Weekly assessments</option>
          <option value="endterm">End-of-term exams</option>
        </select>
        <button onClick={load} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>Search</button>
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
        {[{ label:'Weekly assessment', color:'#1E40AF', bg:'#DBEAFE' },{ label:'End-of-term exam', color:'#7D1025', bg:'#FDE7EC' }].map(t=>(
          <div key={t.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:TOKENS.s600 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:t.bg, border:'1.5px solid '+t.color }}/>
            {t.label}
          </div>
        ))}
      </div>
      <div className="card" style={{ overflow:'hidden' }}>
        {loading?<div style={{ padding:30,textAlign:'center',color:TOKENS.s400 }}>Loading exams...</div>:exams.length===0?<div style={{ padding:40,textAlign:'center',color:TOKENS.s400,fontSize:13 }}>No exams found.</div>:(
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Title','Type','Subject','Curriculum','Grade','Date','Marks','Status'].map(h=><th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:10.5 }}>{h}</th>)}</tr></thead>
            <tbody>
              {exams.map(e=>{ const end=isEndTerm(e); return (
                <tr key={e._id} style={{ borderTop:'1px solid '+TOKENS.line, cursor:'pointer' }}
                  onMouseEnter={ev=>ev.currentTarget.style.background=TOKENS.cream}
                  onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}
                  onClick={()=>openExam(e)}>
                  <td style={{ padding:'10px 12px', fontWeight:700, fontSize:13, color:TOKENS.s900 }}>{e.title}</td>
                  <td style={{ padding:'10px 12px' }}><span style={{ padding:'2px 9px', borderRadius:99, fontSize:10.5, fontWeight:700, background:end?'#FDE7EC':'#DBEAFE', color:end?'#7D1025':'#1E40AF' }}>{end?'End-term':'Weekly'}</span></td>
                  <td style={{ padding:'10px 12px', fontSize:12.5, color:TOKENS.s700 }}>{e.subject||'—'}</td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:TOKENS.s500 }}>{e.curriculum||'—'}</td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:TOKENS.s500 }}>{e.grade||'—'}</td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:TOKENS.s500, whiteSpace:'nowrap' }}>{fmtDate(e.startAt)}</td>
                  <td style={{ padding:'10px 12px', fontSize:12.5 }}>{e.totalMarks||'—'}</td>
                  <td style={{ padding:'10px 12px' }}><span style={{ padding:'2px 8px', borderRadius:99, fontSize:10.5, fontWeight:700, background:e.status==='ended'?'#D1FAE5':e.status==='live'?'#FEF3C7':'#F3F4F6', color:e.status==='ended'?'#065F46':e.status==='live'?'#92400E':'#6B7280' }}>{e.status||'draft'}</span></td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export function DOSHomeworkModule({ toast, refreshKey }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ termStart:'', termEnd:'', subject:'', curriculum:'' })
  const [expanded, setExpanded] = useState({})

  const load = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([,v])=>v))
    api.get('/dos/homework-compliance', { params })
      .then(r => setData(r.data?.data))
      .catch(e => toast?.error?.('Failed to load: '+(e?.response?.data?.message||e.message)))
      .finally(() => setLoading(false))
  }, [filters, refreshKey])

  useEffect(() => { load() }, [load])

  const teachers = data?.teachers || []
  const totalLessons = teachers.reduce((s,t)=>s+t.totalLessons,0)
  const totalHW      = teachers.reduce((s,t)=>s+t.homeworkSet,0)
  const totalMissing = teachers.reduce((s,t)=>s+t.lessonsWithoutHW,0)
  const totalGraded  = teachers.reduce((s,t)=>s+t.gradedSubmissions,0)
  const totalSubs    = teachers.reduce((s,t)=>s+t.totalSubmissions,0)

  return (
    <>
      <PSection tag="Dean of Studies" title="Homework" em="Tracker" sub="Every lesson taught must have homework set, submitted and marked."/>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center', background:'#fff', border:'1px solid '+TOKENS.line, borderRadius:10, padding:'12px 14px' }}>
        <input type="date" value={filters.termStart} onChange={e=>setFilters(p=>({...p,termStart:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}/>
        <span style={{ fontSize:12, color:TOKENS.s400 }}>to</span>
        <input type="date" value={filters.termEnd} onChange={e=>setFilters(p=>({...p,termEnd:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}/>
        <input value={filters.subject} onChange={e=>setFilters(p=>({...p,subject:e.target.value}))}
          placeholder="Subject" style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, width:130, fontFamily:'inherit' }}/>
        <button onClick={load} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'8px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>Apply</button>
      </div>
      {!loading&&data&&(
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
          {[
            { label:'Lessons taught',    val:totalLessons,   color:TOKENS.s900 },
            { label:'HW sets',           val:totalHW,        color:TOKENS.s900 },
            { label:'Missing HW',        val:totalMissing,   color:totalMissing>0?'#991B1B':'#065F46' },
            { label:'Submissions',       val:totalSubs,      color:TOKENS.s900 },
            { label:'Graded',            val:totalGraded,    color:'#065F46' },
            { label:'Marking rate',      val:totalSubs>0?Math.round((totalGraded/totalSubs)*100)+'%':'—', color:totalSubs>0&&totalGraded/totalSubs>=0.8?'#065F46':'#D97706' },
          ].map(k=>(
            <div key={k.label} className="card" style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:5 }}>{k.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:k.color }}>{k.val}</div>
            </div>
          ))}
        </div>
      )}
      {loading?<DOSSpinner/>:teachers.length===0?(
        <div style={{ padding:'40px 0', textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No homework data found. Check that dos-analytics backend is deployed.</div>
      ):(
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {teachers.map(t=>{
            const cs=t.complianceScore; const cc=cs>=90?'#065F46':cs>=70?'#D97706':'#991B1B'
            const bg=cs<70?'#FFF5F5':cs<90?'#FFFBF0':'#F0FDF4'
            const isOpen=expanded[String(t.teacherId)]
            return (
              <div key={String(t.teacherId)} style={{ background:'#fff', border:'1.5px solid '+(cs<70?'#FCA5A5':cs<90?'#FDE68A':TOKENS.line), borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'14px 18px', background:bg, display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}
                  onClick={()=>setExpanded(p=>({...p,[String(t.teacherId)]:!p[String(t.teacherId)]}))}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:TOKENS.s900 }}>{t.teacherName}</div>
                    <div style={{ fontSize:11.5, color:TOKENS.s500, marginTop:2 }}>{t.totalLessons} lessons · {t.homeworkSet} HW sets · {t.totalSubmissions} submissions</div>
                  </div>
                  <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                    {t.lessonsWithoutHW>0&&<span style={{ fontSize:12, fontWeight:700, color:'#991B1B', background:'#FEE2E2', padding:'3px 10px', borderRadius:99 }}>{t.lessonsWithoutHW} lesson{t.lessonsWithoutHW>1?'s':''} missing HW</span>}
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:18, fontWeight:800, color:cc }}>{cs!==null?cs+'%':'—'}</div>
                      <div style={{ fontSize:9.5, color:TOKENS.s400 }}>Compliance</div>
                    </div>
                    <div style={{ width:4, height:12, borderTop:'2px solid '+TOKENS.s400, borderRight:'2px solid '+TOKENS.s400, transform:isOpen?'rotate(135deg)':'rotate(45deg)', transition:'transform .2s', marginTop:isOpen?4:-4 }}/>
                  </div>
                </div>
                <div style={{ height:4, background:'#F3F4F6' }}>
                  <div style={{ width:(cs||0)+'%', height:'100%', background:cc, transition:'width .4s' }}/>
                </div>
                {isOpen&&(
                  <div style={{ padding:'14px 18px', borderTop:'1px solid '+TOKENS.line }}>
                    {t.lessonsWithoutHW>0?(
                      <>
                        <div style={{ fontSize:11, fontWeight:700, color:'#991B1B', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Lessons without homework</div>
                        {t.missingHWLessons.map((l,i)=>(
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 10px', background:'#FFF5F5', borderRadius:7, border:'1px solid #FCA5A5', marginBottom:5 }}>
                            <div style={{ width:6, height:6, borderRadius:'50%', background:'#991B1B', flexShrink:0 }}/>
                            <div><div style={{ fontSize:12.5, fontWeight:600, color:TOKENS.s900 }}>{l.title}</div><div style={{ fontSize:11, color:TOKENS.s500 }}>{l.subject}</div></div>
                          </div>
                        ))}
                      </>
                    ):<div style={{ fontSize:12.5, color:'#065F46', fontWeight:600 }}>All lessons have homework assigned.</div>}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:14, paddingTop:12, borderTop:'1px solid '+TOKENS.line }}>
                      {[{ label:'Lessons',val:t.totalLessons },{ label:'With HW',val:t.lessonsWithHW+' / '+t.totalLessons },{ label:'Submissions',val:t.totalSubmissions },{ label:'Graded',val:t.gradedSubmissions+' / '+t.totalSubmissions }].map(k=>(
                        <div key={k.label} style={{ textAlign:'center' }}>
                          <div style={{ fontSize:18, fontWeight:800, color:TOKENS.s900 }}>{k.val}</div>
                          <div style={{ fontSize:10, color:TOKENS.s400, marginTop:2 }}>{k.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

/** LessonRegister: read-only view of one day's per-lesson registers.
 *  Student attendance is per lesson: joining a class marks the student
 *  present and the class teacher confirms or amends it in the class
 *  register (Teacher portal, past classes). The old day register is
 *  retired, so this view does not mark anything. */
function LessonRegister({ toast }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [rows, setRows] = useState([])
  const [gradeF, setGradeF] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/dos-reports/attendance-records', { params: { from: date, to: date } })
      .then(r => setRows(r.data?.data?.lessonRows || []))
      .catch(e => { setRows([]); toast?.error?.(e?.response?.data?.message || 'Could not load the lesson registers.') })
      .finally(() => setLoading(false))
  }, [date])

  const grades = [...new Set(rows.map(r => r.studentGrade).filter(Boolean))].sort()
  const list = rows.filter(r => !gradeF || r.studentGrade === gradeF)
  const byClass = {}
  list.forEach(r => {
    const k = r.class + '|' + r.date + '|' + r.teacher
    byClass[k] = byClass[k] || { title: r.class, subject: r.subject, teacher: r.teacher, date: r.date, rows: [] }
    byClass[k].rows.push(r)
  })
  const groups = Object.values(byClass).sort((x, y) => new Date(x.date) - new Date(y.date))
  const attended = list.filter(r => r.present === 'present').length

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid ' + TOKENS.line, borderRadius: 9, fontSize: 13 }} />
        <select value={gradeF} onChange={e => setGradeF(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid ' + TOKENS.line, borderRadius: 9, fontSize: 13 }}>
          <option value="">All grades</option>
          {grades.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        {!loading && list.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 800, color: TOKENS.s800 }}>
            {attended} of {list.length} student-lessons attended ({Math.round(attended / list.length * 100)}%)
          </span>
        )}
      </div>

      {loading ? <div style={{ padding: 30, textAlign: 'center', color: TOKENS.s500, fontSize: 13 }}>Loading lesson registers...</div> : (
        groups.length === 0
          ? <div style={{ background: '#fff', border: '1px solid ' + TOKENS.line, borderRadius: 12, padding: 24, textAlign: 'center', color: TOKENS.s500, fontSize: 13 }}>No lessons were held on this day.</div>
          : groups.map(g => {
            const n = g.rows.filter(r => r.present === 'present').length
            return (
              <div key={g.title + g.date + g.teacher} style={{ background: '#fff', border: '1px solid ' + TOKENS.line, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: TOKENS.cream, flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 13, color: TOKENS.s900 }}>{g.title}</b>
                  <span style={{ fontSize: 11.5, color: TOKENS.s500 }}>
                    {new Date(g.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}{g.teacher ? ' \u00b7 ' + g.teacher : ''}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: n === g.rows.length ? '#15803D' : '#B45309' }}>{n} of {g.rows.length} attended</span>
                </div>
                {g.rows.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', borderTop: '1px solid ' + TOKENS.line, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160, fontSize: 12.5 }}>
                      <b style={{ color: TOKENS.s900 }}>{r.student}</b>
                      <span style={{ color: TOKENS.s400 }}> {r.studentGrade}</span>
                    </div>
                    {r.source === 'teacher' && <span style={{ padding: '2px 8px', borderRadius: 999, background: '#FEF3C7', color: '#92400E', fontSize: 10, fontWeight: 800 }}>teacher-marked</span>}
                    {r.joined === 'yes' && <span style={{ padding: '2px 8px', borderRadius: 999, background: '#DBEAFE', color: '#1E40AF', fontSize: 10, fontWeight: 800 }}>joined</span>}
                    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: r.present === 'present' ? '#D1FAE5' : '#FEE2E2', color: r.present === 'present' ? '#065F46' : '#991B1B' }}>
                      {r.present === 'present' ? 'Attended' : 'Missed'}
                    </span>
                  </div>
                ))}
              </div>
            )
          })
      )}
      <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>
        Read only. Student attendance is recorded per lesson: joining the class marks a student present, and the class teacher confirms or amends it in the class register (Teacher portal → past classes → Register). The old daily register is retired; its records remain as history.
      </div>
    </div>
  )
}

export function DOSAttendanceModule({ toast, refreshKey }) {
  const report = useStatReport(toast)
  const [rec, setRec] = useState(null)               // { lessonRows }
  const [recRange, setRecRange] = useState({ from: new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) })
  const [recLoading, setRecLoading] = useState(false)
  const loadRecords = () => {
    setRecLoading(true)
    api.get('/dos-reports/attendance-records', { params: recRange })
      .then(r => setRec(r.data?.data || null))
      .catch(e => toast?.error?.(e?.response?.data?.message || 'Could not load records.'))
      .finally(() => setRecLoading(false))
  }
  const dlCSV = (rows, cols, name) => {
    const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
    const csv = [cols.map(c => esc(c[0])).join(',')]
      .concat(rows.map(r => cols.map(c => esc(typeof c[1] === 'function' ? c[1](r) : r[c[1]])).join(',')))
      .join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = name; a.click(); URL.revokeObjectURL(a.href)
  }
  const fmtD = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  // Per-person aggregates, computed from the pulled rows.
  const teacherSummary = () => {
    const by = {}
    ;(rec?.lessonRows || []).forEach(r => {
      const t = r.teacher || 'Unassigned'
      by[t] = by[t] || { name: t, lessons: new Set(), rows: 0, present: 0 }
      by[t].lessons.add(r.class + '|' + r.date)
      by[t].rows += 1
      if (r.present === 'present') by[t].present += 1
    })
    return Object.values(by).map(x => ({ name: x.name, lessons: x.lessons.size, rows: x.rows, pct: x.rows ? Math.round(x.present / x.rows * 100) : 0 })).sort((a, b) => b.lessons - a.lessons)
  }
  const studentSummary = () => {
    const by = {}
    ;(rec?.lessonRows || []).forEach(r => {
      by[r.student] = by[r.student] || { name: r.student, grade: r.studentGrade, sched: 0, joined: 0, present: 0, excused: 0 }
      // Excused lessons and closure days are listed but not counted.
      if (r.present === 'excused' || r.present === 'school closed') { by[r.student].excused += 1; return }
      by[r.student].sched += 1
      if (r.joined === 'yes') by[r.student].joined += 1
      if (r.present === 'present') by[r.student].present += 1
    })
    return Object.values(by).map(x => ({ ...x, pct: x.sched ? Math.round(x.present / x.sched * 100) : null })).sort((a, b) => a.name.localeCompare(b.name))
  }
  const printRecord = (kind, name) => {
    const lessons = (rec?.lessonRows || []).filter(r => (kind === 'teacher' ? r.teacher : r.student) === name)
    const sum = kind === 'teacher' ? teacherSummary().find(x => x.name === name) : studentSummary().find(x => x.name === name)
    const row = (cells) => '<tr>' + cells.map(c => `<td>${c ?? ''}</td>`).join('') + '</tr>'
    const table = (heads, rows) => `<table><thead><tr>${heads.map(h => '<th>' + h + '</th>').join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`
    const kpis = kind === 'teacher'
      ? `<div class="k"><div><b>${sum?.lessons ?? 0}</b>Lessons held</div><div><b>${sum?.rows ?? 0}</b>Student attendances</div><div><b>${sum?.pct ?? 0}%</b>Present rate</div></div>`
      : `<div class="k"><div><b>${sum?.sched ?? 0}</b>Lessons scheduled</div><div><b>${sum?.joined ?? 0}</b>Joined</div><div><b>${sum?.pct ?? '\u2013'}${sum?.pct !== null ? '%' : ''}</b>Lesson attendance</div><div><b>${sum?.excused ?? 0}</b>Excused / school closed</div></div>`
    const lessonTable = kind === 'teacher'
      ? table(['Date', 'Class', 'Student', 'Grade', 'Joined', 'Register'], lessons.map(r => row([fmtD(r.date), r.class, r.student, r.studentGrade, r.joined, r.present])))
      : table(['Date', 'Class', 'Subject', 'Teacher', 'Joined', 'Register'], lessons.map(r => row([fmtD(r.date), r.class, r.subject, r.teacher, r.joined, r.present])))
    const html = `<!doctype html><html><head><title>Attendance Record - ${name}</title><style>
      body{font-family:Georgia,serif;color:#1a1a1a;margin:36px;line-height:1.45}
      h1{font-size:20px;margin:0;color:#7D1025}.sub{color:#666;font-size:11.5px;margin-bottom:14px}
      h2{font-size:13px;margin:16px 0 6px;color:#7D1025;border-bottom:2px solid #C9A030;padding-bottom:3px}
      table{width:100%;border-collapse:collapse;font-size:10.5px}
      th{text-align:left;background:#F7F2EA;padding:5px 7px;border:1px solid #ddd}td{padding:4px 7px;border:1px solid #ddd}
      .k{display:flex;gap:24px;margin:12px 0}.k b{font-size:18px;display:block}
      .foot{font-size:9.5px;color:#777;margin-top:14px;border-top:1px solid #ddd;padding-top:6px}
      @media print{body{margin:14px}}
    </style></head><body>
      <h1>${kind === 'teacher' ? 'Teacher' : 'Student'} Attendance Record \u2014 ${name}</h1>
      <div class="sub">${fmtD(rec.from)} to ${fmtD(rec.to)} \u00b7 generated ${new Date().toDateString()}</div>
      ${kpis}<h2>${kind === 'teacher' ? 'Lessons held' : 'Lesson attendance'}</h2>${lessonTable}
      <div class="foot"><b>Method.</b> ${rec.method} Smartious Homeschool \u00b7 Est. 2018 \u00b7 smartioushomeschool.com</div>
    <script>window.onload = () => window.print()</` + `script></body></html>`
    const w = window.open('', '_blank')
    if (!w) return toast?.error?.('Allow pop-ups to print records.')
    w.document.write(html); w.document.close()
  }
  return (
    <>
      <PSection tag="Dean of Studies" title="Attendance" em="Analytics"
        sub="Lesson attendance for students, recorded when they join or when the teacher marks the register. Teachers' attendance is under the Teachers tab."/>
      {report.modal}

      {/* ── Attendance records: pull a range, download clean CSVs ── */}
      <div style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <b style={{ fontSize: 14, color: TOKENS.s900 }}>Attendance records</b>
          <span style={{ flex: 1 }} />
          <input type="date" value={recRange.from} onChange={e => setRecRange(r => ({ ...r, from: e.target.value }))} style={{ padding: '7px 9px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 8, fontSize: 12 }} />
          <span style={{ fontSize: 11, color: TOKENS.s400 }}>to</span>
          <input type="date" value={recRange.to} onChange={e => setRecRange(r => ({ ...r, to: e.target.value }))} style={{ padding: '7px 9px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 8, fontSize: 12 }} />
          <button onClick={loadRecords} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>{recLoading ? 'Loading...' : 'Pull records'}</button>
        </div>
        {rec && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: TOKENS.s800 }}>Lesson attendance: {rec.lessonRows.length} record(s)</span>
              <button onClick={() => dlCSV(rec.lessonRows, [['Date', r => fmtD(r.date)], ['Class', 'class'], ['Subject', 'subject'], ['Teacher', 'teacher'], ['Student', 'student'], ['Grade', 'studentGrade'], ['Joined', 'joined'], ['Register', 'present']], `lesson-attendance-${recRange.from}-to-${recRange.to}.csv`)}
                style={{ padding: '5px 12px', borderRadius: 7, border: `1.5px solid ${TOKENS.crimson}`, background: '#fff', color: TOKENS.crimson, fontSize: 10.5, fontWeight: 800, cursor: 'pointer' }}>Download CSV</button>
              <button onClick={() => report.open({ key: 'attendance', params: { from: recRange.from, to: recRange.to } })}
                style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 10.5, fontWeight: 800, cursor: 'pointer', marginLeft: 8 }}>Attendance report by student</button>
            </div>
            <div style={{ maxHeight: 220, overflow: 'auto', border: `1px solid ${TOKENS.line}`, borderRadius: 9 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead><tr>{['Date', 'Class', 'Teacher', 'Student', 'Joined', 'Register'].map(h => <th key={h} style={{ position: 'sticky', top: 0, textAlign: 'left', padding: '5px 8px', background: '#F7F2EA', borderBottom: `1px solid ${TOKENS.line}` }}>{h}</th>)}</tr></thead>
                <tbody>{rec.lessonRows.slice(0, 200).map((r, i) => (
                  <tr key={i}><td style={{ padding: '4px 8px' }}>{fmtD(r.date)}</td><td style={{ padding: '4px 8px' }}>{r.class}</td><td style={{ padding: '4px 8px' }}>{r.teacher}</td><td style={{ padding: '4px 8px' }}>{r.student}</td>
                    <td style={{ padding: '4px 8px', color: r.joined === 'yes' ? '#15803D' : '#B91C1C', fontWeight: 700 }}>{r.joined}</td>
                    <td style={{ padding: '4px 8px' }}>{r.present}</td></tr>
                ))}</tbody>
              </table>
            </div>
            {rec.lessonRows.length > 200 && <div style={{ fontSize: 10.5, color: TOKENS.s400 }}>Preview shows 200 of {rec.lessonRows.length} - the CSV contains everything.</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 6px' }}>
                  <b style={{ fontSize: 12.5, color: TOKENS.s900 }}>Teachers ({teacherSummary().length})</b>
                  <button onClick={() => dlCSV(teacherSummary(), [['Teacher', 'name'], ['Lessons', 'lessons'], ['Student attendances', 'rows'], ['Present %', 'pct']], `teacher-records-${recRange.from}-to-${recRange.to}.csv`)}
                    style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid ${TOKENS.line}`, background: '#fff', fontSize: 9.5, fontWeight: 800, cursor: 'pointer', color: TOKENS.s600 }}>CSV</button>
                </div>
                <div style={{ maxHeight: 200, overflow: 'auto', border: `1px solid ${TOKENS.line}`, borderRadius: 9 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr>{['Teacher', 'Lessons', 'Present %', ''].map(h => <th key={h} style={{ position: 'sticky', top: 0, textAlign: 'left', padding: '4px 8px', background: '#F7F2EA' }}>{h}</th>)}</tr></thead>
                    <tbody>{teacherSummary().map(t => (
                      <tr key={t.name}><td style={{ padding: '4px 8px' }}>{t.name}</td><td style={{ padding: '4px 8px' }}>{t.lessons}</td><td style={{ padding: '4px 8px' }}>{t.pct}%</td>
                        <td style={{ padding: '3px 6px' }}><button onClick={() => printRecord('teacher', t.name)} style={{ padding: '3px 10px', borderRadius: 6, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 9.5, fontWeight: 800, cursor: 'pointer' }}>Print</button></td></tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 6px' }}>
                  <b style={{ fontSize: 12.5, color: TOKENS.s900 }}>Students ({studentSummary().length})</b>
                  <button onClick={() => dlCSV(studentSummary(), [['Student', 'name'], ['Grade', 'grade'], ['Lessons scheduled', 'sched'], ['Joined', 'joined'], ['Lesson %', r => r.pct ?? ''], ['Excused / closed', 'excused']], `student-records-${recRange.from}-to-${recRange.to}.csv`)}
                    style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid ${TOKENS.line}`, background: '#fff', fontSize: 9.5, fontWeight: 800, cursor: 'pointer', color: TOKENS.s600 }}>CSV</button>
                </div>
                <div style={{ maxHeight: 200, overflow: 'auto', border: `1px solid ${TOKENS.line}`, borderRadius: 9 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr>{['Student', 'Grade', 'Lesson %', 'Excused', ''].map(h => <th key={h} style={{ position: 'sticky', top: 0, textAlign: 'left', padding: '4px 8px', background: '#F7F2EA' }}>{h}</th>)}</tr></thead>
                    <tbody>{studentSummary().map(st => (
                      <tr key={st.name}><td style={{ padding: '4px 8px' }}>{st.name}</td><td style={{ padding: '4px 8px' }}>{st.grade}</td>
                        <td style={{ padding: '4px 8px', fontWeight: 700, color: st.pct === null ? TOKENS.s400 : st.pct >= 80 ? '#15803D' : st.pct >= 60 ? '#B45309' : '#B91C1C' }}>{st.pct === null ? '\u2013' : st.pct + '%'}</td>
                        <td style={{ padding: '4px 8px' }}>{st.excused}</td>
                        <td style={{ padding: '3px 6px' }}><button onClick={() => printRecord('student', st.name)} style={{ padding: '3px 10px', borderRadius: 6, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 9.5, fontWeight: 800, cursor: 'pointer' }}>Print</button></td></tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 10.5, color: TOKENS.s400 }}>{rec.method}</div>
          </div>
        )}
      </div>
      {/* Each lesson's register, read-only (teachers keep it; the Dean corrects in Academic Oversight) */}
      <LessonRegister toast={toast} />
    </>
  )
}

export function DOSTimetableModule({ toast, refreshKey }) {
  // The school's master scheduling console. Under the one-system rule the
  // timetable IS the school: every slot here materializes real classes
  // for the coming week, so this page is where the DOS runs scheduling.
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const [ov, setOv] = useState(null)                  // { teachers, students, stats }
  const [sel, setSel] = useState(null)                // { kind:'teacher'|'student', _id, name }
  const [entries, setEntries] = useState([])
  const [loadingSel, setLoadingSel] = useState(false)
  const [tSearch, setTSearch] = useState('')
  const [sSearch, setSSearch] = useState('')
  const [modal, setModal] = useState(null)            // { entry|null } -> add/edit form
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadOverview = useCallback(() => {
    api.get('/timetable/overview')
      .then(r => setOv(r.data?.data || null))
      .catch(() => { setOv(null); toast?.error?.('Could not load the timetable overview.') })
  }, [])
  useEffect(() => { loadOverview() }, [loadOverview, refreshKey])

  const openPerson = async (kind, person) => {
    setSel({ kind, _id: person._id, name: person.name })
    setLoadingSel(true)
    try {
      const r = await api.get('/timetable/' + kind + '/' + person._id)
      setEntries(r.data?.data?.entries || [])
    } catch (e) { setEntries([]); toast?.error?.('Could not load the schedule.') }
    finally { setLoadingSel(false) }
  }
  const reloadSel = () => { if (sel) openPerson(sel.kind, { _id: sel._id, name: sel.name }); loadOverview() }

  // ── Printable timetables: school-wide, all students, or one person ──
  const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const printDoc = (title, bodyHtml) => {
    const html = `<!doctype html><html><head><title>${title}</title><style>
      body{font-family:Georgia,serif;color:#1a1a1a;margin:36px;line-height:1.45}
      h1{font-size:21px;margin:0;color:#7D1025}.sub{color:#666;font-size:11.5px;margin-bottom:16px}
      h2{font-size:13.5px;margin:18px 0 6px;color:#7D1025;border-bottom:2px solid #C9A030;padding-bottom:3px;page-break-after:avoid}
      table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:6px}
      th{text-align:left;background:#F7F2EA;padding:5px 7px;border:1px solid #ddd}td{padding:4px 7px;border:1px solid #ddd}
      .sec{page-break-inside:avoid}.foot{font-size:9.5px;color:#777;margin-top:16px;border-top:1px solid #ddd;padding-top:6px}
      .mx{table-layout:fixed}.mx th{background:#7D1025;color:#fff;text-align:center;padding:6px 4px;font-size:11px}
      .mx td{vertical-align:top;min-height:34px;padding:4px}.mx .tcol{width:52px;background:#F7F2EA;color:#7D1025;font-weight:700;text-align:center;font-size:10.5px}
      .lsn{background:#FBF8F3;border:1px solid #E5DFD3;border-radius:6px;padding:4px 6px;margin-bottom:4px}
      .lsn b{display:block;font-size:10.5px;color:#1a1a1a}.lsn span{display:block;font-size:9px;color:#6B7280}
      .none{font-size:11px;color:#777;font-style:italic}
      @media print{body{margin:14px}}
    </style></head><body>
      <h1>Smartious Homeschool \u2014 ${title}</h1>
      <div class="sub">Generated ${new Date().toDateString()} \u00b7 weekly pattern; classes are created automatically from these slots</div>
      ${bodyHtml}
      <div class="foot">Smartious Homeschool \u00b7 Est. 2018 \u00b7 smartioushomeschool.com</div>
    <script>window.onload = () => window.print()</` + `script></body></html>`
    const w = window.open('', '_blank')
    if (!w) return toast?.error?.('Allow pop-ups to print timetables.')
    w.document.write(html); w.document.close()
  }
  const entryRows = (list, cols) => {
    const sorted = [...list].sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) || (a.startTime < b.startTime ? -1 : 1))
    return sorted.map(e => '<tr>' + cols(e).map(c => `<td>${c ?? ''}</td>`).join('') + '</tr>').join('')
  }
  const printSchool = () => {
    const byTeacher = {}
    ;(ov.entries || []).forEach(e => { (byTeacher[e.teacher] = byTeacher[e.teacher] || []).push(e) })
    const body = Object.keys(byTeacher).sort().map(t => `<div class="sec"><h2>${t}</h2>
      <table><thead><tr><th>Day</th><th>Time</th><th>Class</th><th>Subject</th><th>Grade</th><th>Students</th></tr></thead>
      <tbody>${entryRows(byTeacher[t], e => [e.dayOfWeek, e.startTime + '-' + e.endTime, e.title, e.subject, e.grade, e.students.length])}</tbody></table></div>`).join('')
    printDoc('School Timetable (all teachers)', body || '<p>No active slots.</p>')
  }
  // The student-portal shape: a weekly matrix - time rows down the
  // left, day columns across the top, each lesson a card in its cell.
  const matrixHTML = (list, teacherField) => {
    const base = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const days = DAY_ORDER.filter(d => base.includes(d) || list.some(e => e.dayOfWeek === d))
    const times = [...new Set(list.map(e => e.startTime))].sort()
    if (!times.length) return '<p class="none">No lessons scheduled.</p>'
    const head = '<tr><th class="tcol"></th>' + days.map(d => `<th>${d}</th>`).join('') + '</tr>'
    const rows = times.map(t => '<tr><td class="tcol">' + t + '</td>' + days.map(d => {
      const cell = list.filter(e => e.dayOfWeek === d && e.startTime === t)
        .map(e => `<div class="lsn"><b>${e.subject}</b><span>${e.startTime}-${e.endTime}</span><span>${teacherField(e)}</span></div>`).join('')
      return `<td>${cell}</td>`
    }).join('') + '</tr>').join('')
    return `<table class="mx"><thead>${head}</thead><tbody>${rows}</tbody></table>`
  }
  const printAllStudents = () => {
    const byStudent = {}
    ;(ov.entries || []).forEach(e => e.students.forEach(st => {
      const k = st.name + (st.grade ? ' \u00b7 ' + st.grade : '')
      ;(byStudent[k] = byStudent[k] || []).push(e)
    }))
    const keys = Object.keys(byStudent).sort()
    const body = keys.map(k => `<div class="sec"><h2>${k}</h2>${matrixHTML(byStudent[k], e => e.teacher)}</div>`).join('')
    printDoc('Student Timetables (all students)', body || '<p>No students are assigned to any slot yet.</p>')
  }
  const printSelected = () => {
    if (!sel) return
    const tf = (e) => sel.kind === 'teacher'
      ? (Array.isArray(e.assignedStudents) ? e.assignedStudents.length + ' student(s)' : '')
      : (e.teacherId ? [e.teacherId.firstName, e.teacherId.lastName].filter(Boolean).join(' ') : '')
    const body = `<div class="sec"><h2>${sel.name}</h2>${matrixHTML(entries, tf)}</div>`
    printDoc((sel.kind === 'teacher' ? 'Teacher' : 'Student') + ' Timetable \u2014 ' + sel.name, entries.length ? body : '<p>No active slots for ' + sel.name + '.</p>')
  }

  const blank = () => ({ title: '', subject: '', curriculum: 'Cambridge', grade: '', dayOfWeek: 'Mon', startTime: '09:00', endTime: '10:00', assignedStudents: [], pickGrade: '', subjectId: '' })
  const openAdd = () => { setForm(blank()); setModal({ entry: null }) }
  const openEdit = (e) => {
    setForm({ title: e.title || '', subject: e.subject || '', curriculum: e.curriculum || '', grade: e.grade || '',
      dayOfWeek: e.dayOfWeek, startTime: e.startTime, endTime: e.endTime,
      assignedStudents: (e.assignedStudents || []).map(x => String(x?._id || x)), pickGrade: e.grade || '', subjectId: e.subjectId ? String(e.subjectId?._id || e.subjectId) : '' })
    setModal({ entry: e })
  }

  const overlap = (a1, a2, b1, b2) => a1 < b2 && b1 < a2
  const conflictNote = () => {
    if (!form || sel?.kind !== 'teacher') return null
    const clash = entries.find(e => (!modal?.entry || String(e._id) !== String(modal.entry._id)) &&
      e.dayOfWeek === form.dayOfWeek && overlap(form.startTime, form.endTime, e.startTime, e.endTime))
    return clash ? `Overlaps ${clash.subject || clash.title} (${clash.startTime}-${clash.endTime}) for this teacher.` : null
  }

  const save = async () => {
    if (!form.title.trim() || !form.subject.trim() || !form.curriculum.trim())
      return toast?.error?.('Title, subject and curriculum are required.')
    if (!(form.startTime < form.endTime)) return toast?.error?.('End time must be after start time.')
    setSaving(true)
    try {
      const body = { title: form.title.trim(), subject: form.subject.trim(), curriculum: form.curriculum.trim(),
        grade: form.grade.trim(), dayOfWeek: form.dayOfWeek, startTime: form.startTime, endTime: form.endTime,
        assignedStudents: form.assignedStudents, subjectId: form.subjectId || null }
      if (modal.entry) await api.patch('/timetable/' + modal.entry._id, body)
      else await api.post('/timetable', { ...body, teacherId: sel._id })
      toast?.ok?.(modal.entry ? 'Slot updated. Future classes follow the change immediately.' : 'Slot added. Classes for the coming week materialize now.')
      setModal(null); reloadSel()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not save the slot.') }
    finally { setSaving(false) }
  }

  const removeEntry = async (e) => {
    if (!window.confirm(`Remove the weekly slot "${e.title || e.subject}" (${e.dayOfWeek} ${e.startTime})? Future classes from it are cleaned up; taught history stays.`)) return
    try { await api.delete('/timetable/' + e._id); toast?.ok?.('Slot removed.'); reloadSel() }
    catch (err) { toast?.error?.(err?.response?.data?.message || 'Could not remove it.') }
  }

  const card = { background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12 }
  const chip = (bg, fg, text) => <span style={{ padding: '2px 9px', borderRadius: 999, fontSize: 10, fontWeight: 800, background: bg, color: fg }}>{text}</span>
  const inp = { padding: '8px 10px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 8, fontSize: 12.5 }

  if (!ov) return <DOSSpinner />
  const teachers = ov.teachers.filter(t => t.name.toLowerCase().includes(tSearch.toLowerCase()))
  const students = ov.students.filter(st => !sSearch.trim() || (st.name + ' ' + st.admissionNo + ' ' + st.grade).toLowerCase().includes(sSearch.toLowerCase()))
  const pickable = form ? ov.students.filter(st => !form.pickGrade || st.grade === form.pickGrade) : []
  const grades = [...new Set(ov.students.map(st => st.grade).filter(Boolean))].sort()

  return (
    <div>
      <PSection tag="Dean of Studies" title="Timetable" em="Manager"
        sub="The timetable dictates classes: every slot here creates the real lessons for the coming week, automatically, until edited." />

      {/* Lessons teachers have not closed for over 24 hours */}
      <div style={{ margin: '10px 0' }}><LessonsToClose toast={toast} staff /></div>
      <SchoolCalendarManager toast={toast} />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 4px' }}>
        <button onClick={printSchool} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>Print school timetable</button>
        <button onClick={printAllStudents} style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${TOKENS.crimson}`, background: '#fff', color: TOKENS.crimson, fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>Print all student timetables</button>
        {sel && <button onClick={printSelected} style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${TOKENS.line}`, background: '#fff', color: TOKENS.s700, fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>Print {sel.name}'s timetable</button>}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '10px 0 14px' }}>
        {[['Active weekly slots', ov.stats.activeSlots, TOKENS.s900],
          ['Teachers without a timetable', ov.stats.teachersWithout, ov.stats.teachersWithout ? '#B91C1C' : '#15803D'],
          ['Weekend slots', ov.stats.weekendSlots, ov.stats.weekendSlots ? '#B45309' : TOKENS.s500]].map(([l, v, c]) => (
          <div key={l} style={{ ...card, padding: '12px 16px' }}>
            <div style={{ fontSize: 21, fontWeight: 900, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: TOKENS.s500, fontWeight: 700 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(230px, 290px) 1fr', gap: 14, alignItems: 'start' }}>
        {/* Left: people */}
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ ...card, padding: 12 }}>
            <b style={{ fontSize: 13, color: TOKENS.s900 }}>Teachers</b>
            <input value={tSearch} onChange={e => setTSearch(e.target.value)} placeholder="Filter teachers..."
              style={{ ...inp, width: '100%', margin: '8px 0' }} />
            <div style={{ maxHeight: 340, overflow: 'auto', display: 'grid', gap: 4 }}>
              {teachers.map(t => (
                <button key={t._id} onClick={() => openPerson('teacher', t)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: sel?._id === t._id ? '#FBF3F5' : 'transparent' }}>
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: TOKENS.s800 }}>{t.name}</span>
                  {t.slots === 0 ? chip('#FEE2E2', '#B91C1C', 'no timetable') : chip('#EFEAE0', TOKENS.s600, t.slots + ' slots')}
                </button>
              ))}
              {teachers.length === 0 && <div style={{ fontSize: 12, color: TOKENS.s400, padding: 8 }}>No teachers match.</div>}
            </div>
          </div>
          <div style={{ ...card, padding: 12 }}>
            <b style={{ fontSize: 13, color: TOKENS.s900 }}>Student schedules <span style={{ fontWeight: 600, fontSize: 11, color: TOKENS.s400 }}>({ov.students.length})</span></b>
            <input value={sSearch} onChange={e => setSSearch(e.target.value)} placeholder="Filter by name, admission no or grade..."
              style={{ ...inp, width: '100%', margin: '8px 0' }} />
            <div style={{ maxHeight: 300, overflow: 'auto', display: 'grid', gap: 4 }}>
              {students.map(st => (
                <button key={st._id} onClick={() => openPerson('student', st)}
                  style={{ display: 'flex', gap: 8, padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: sel?._id === st._id ? '#FBF3F5' : 'transparent' }}>
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: TOKENS.s800 }}>{st.name}</span>
                  <span style={{ fontSize: 11, color: TOKENS.s400 }}>{st.grade}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: weekly grid */}
        <div style={{ ...card, padding: 16, minHeight: 320 }}>
          {!sel ? (
            <div style={{ textAlign: 'center', color: TOKENS.s500, fontSize: 13, padding: '80px 20px' }}>
              Pick a teacher or search a student to see their weekly schedule.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <b style={{ fontSize: 15.5, color: TOKENS.s900 }}>{sel.name}</b>
                <span style={{ fontSize: 11.5, color: TOKENS.s500 }}>{sel.kind === 'teacher' ? 'weekly teaching timetable' : 'weekly class schedule'}</span>
                <span style={{ flex: 1 }} />
                {sel.kind === 'teacher' && (
                  <button onClick={openAdd} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Add weekly slot</button>
                )}
              </div>
              {loadingSel ? <DOSSpinner /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))', gap: 8 }}>
                  {DAYS.map(d => {
                    const dayEntries = entries.filter(e => e.dayOfWeek === d).sort((a, b) => a.startTime < b.startTime ? -1 : 1)
                    return (
                      <div key={d} style={{ background: '#FBF8F3', borderRadius: 10, padding: 8, minHeight: 120 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 900, color: ['Sat', 'Sun'].includes(d) ? '#B45309' : TOKENS.s500, letterSpacing: '.06em', marginBottom: 6 }}>{d.toUpperCase()}</div>
                        {dayEntries.map(e => (
                          <div key={e._id} style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: '7px 8px', marginBottom: 6 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: TOKENS.crimson }}>{e.startTime}-{e.endTime}</div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: TOKENS.s900, margin: '2px 0' }}>{e.subject}</div>
                            <div style={{ fontSize: 10, color: TOKENS.s500 }}>{e.grade || e.curriculum}{Array.isArray(e.assignedStudents) ? ` \u00b7 ${e.assignedStudents.length} student(s)` : ''}</div>
                            {sel.kind === 'teacher' && (
                              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                <button onClick={() => openEdit(e)} style={{ flex: 1, padding: '3px 0', borderRadius: 6, border: `1px solid ${TOKENS.line}`, background: '#fff', fontSize: 9.5, fontWeight: 800, cursor: 'pointer', color: TOKENS.s600 }}>Edit</button>
                                <button onClick={() => removeEntry(e)} style={{ flex: 1, padding: '3px 0', borderRadius: 6, border: '1px solid #FCA5A5', background: '#fff', fontSize: 9.5, fontWeight: 800, cursor: 'pointer', color: '#B91C1C' }}>Remove</button>
                              </div>
                            )}
                          </div>
                        ))}
                        {dayEntries.length === 0 && <div style={{ fontSize: 10, color: TOKENS.s400 }}>free</div>}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add / edit slot modal */}
      {modal && form && (
        <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 'min(560px,100%)', maxHeight: '92vh', overflow: 'auto', padding: 22, display: 'grid', gap: 11 }}>
            <b style={{ fontSize: 16, color: TOKENS.s900 }}>{modal.entry ? 'Edit weekly slot' : 'New weekly slot'} \u00b7 {sel?.name}</b>
            <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>This repeats every week and creates the real classes automatically. One-off changes are made on the class itself in Live Classes.</div>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title, e.g. Year 10 Biology" style={{ ...inp, fontWeight: 700 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject" style={inp} />
              <input value={form.curriculum} onChange={e => setForm(f => ({ ...f, curriculum: e.target.value }))} placeholder="Curriculum" style={inp} />
              <input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="Grade / Year" style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))} style={inp}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={inp} />
              <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} style={inp} />
            </div>
            <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))} style={inp}>
              <option value="">Link syllabus spine (optional) — classes then advance topic by topic</option>
              {(ov.subjects || []).map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
            </select>
            {conflictNote() && <div style={{ fontSize: 11.5, fontWeight: 700, color: '#B45309', background: '#FEF3C7', borderRadius: 8, padding: '7px 10px' }}>{conflictNote()}</div>}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <b style={{ fontSize: 12.5, color: TOKENS.s900 }}>Students in this class ({form.assignedStudents.length})</b>
                <span style={{ flex: 1 }} />
                <select value={form.pickGrade} onChange={e => setForm(f => ({ ...f, pickGrade: e.target.value }))} style={{ ...inp, padding: '5px 8px', fontSize: 11.5 }}>
                  <option value="">All grades</option>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div style={{ maxHeight: 160, overflow: 'auto', border: `1px solid ${TOKENS.line}`, borderRadius: 9, padding: 8, marginTop: 6, display: 'grid', gap: 2 }}>
                {pickable.map(st => {
                  const on = form.assignedStudents.includes(String(st._id))
                  return (
                    <label key={st._id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, padding: '4px 6px', borderRadius: 6, cursor: 'pointer', background: on ? '#FBF3F5' : 'transparent' }}>
                      <input type="checkbox" checked={on} onChange={() => setForm(f => ({ ...f,
                        assignedStudents: on ? f.assignedStudents.filter(x => x !== String(st._id)) : [...f.assignedStudents, String(st._id)] }))} />
                      <span style={{ flex: 1, fontWeight: 600, color: TOKENS.s800 }}>{st.name}</span>
                      <span style={{ fontSize: 10.5, color: TOKENS.s400 }}>{st.grade}</span>
                    </label>
                  )
                })}
                {pickable.length === 0 && <div style={{ fontSize: 11.5, color: TOKENS.s400 }}>No students in this grade filter.</div>}
              </div>
              {form.assignedStudents.length === 0 && <div style={{ fontSize: 10.5, color: '#B91C1C', fontWeight: 700, marginTop: 4 }}>No students selected: the class will be created but nobody will see or join it.</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '9px 16px', borderRadius: 9, border: `1.5px solid ${TOKENS.line}`, background: '#fff', color: TOKENS.s600, fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
              <button disabled={saving} onClick={save} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>{saving ? 'Saving...' : modal.entry ? 'Save changes' : 'Add slot'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function DOSBreakModule({ toast, refreshKey }) {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(null)  // userId being saved
  const [search,  setSearch]  = useState('')
  const [roleF,   setRoleF]   = useState('student')
  const [modal,   setModal]   = useState(null)   // user to put on break
  const [form,    setForm]    = useState({ breakType:'mid_term_break', breakNote:'', breakStart:'', breakEnd:'' })

  const BREAK_LABELS = {
    mid_term_break:'Mid-term break', end_term_break:'End-term break',
    summer_break:'Summer break', medical_leave:'Medical leave', other:'Other',
  }

  const load = useCallback(() => {
    setLoading(true)
    api.get('/users', { params:{ role:roleF, limit:200 } })
      .then(r => setUsers(r.data?.users || r.data?.data?.users || []))
      .catch(() => toast?.error?.('Failed to load users.'))
      .finally(() => setLoading(false))
  }, [roleF, refreshKey])

  useEffect(() => { load() }, [load])

  const putOnBreak = async () => {
    if (!modal) return
    setSaving(modal._id)
    try {
      await api.post('/checkin/break', { userId:modal._id, ...form })
      toast?.ok?.(modal.firstName+' placed on break. Reminders are paused and missed lessons do not count; they can still log in.')
      setModal(null); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(null) }
  }

  const removeBreak = async (u) => {
    setSaving(u._id)
    try {
      await api.delete('/checkin/break/'+u._id)
      toast?.ok?.(u.firstName+' is back from break. Account reactivated.')
      load()
    } catch(e) { toast?.error?.('Failed to remove break.') }
    finally { setSaving(null) }
  }

  const onBreak    = users.filter(u=>u.onBreak)
  const active     = users.filter(u=>!u.onBreak)
  const filtActive = active.filter(u=>!search||(u.firstName+' '+u.lastName).toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <PSection tag="Dean of Studies" title="Manage" em="Breaks"
        sub="Place students or staff on break to pause reminders and absence alerts; lessons during a break are not counted as missed. They can still log in to the portal."/>

      <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center' }}>
        <div style={{ display:'flex', border:'1.5px solid '+TOKENS.line, borderRadius:7, overflow:'hidden' }}>
          {['student','teacher','sales','ops_manager','accountant','dos'].map(role=>(
            <button key={role} onClick={()=>setRoleF(role)} style={{
              padding:'8px 12px', border:'none', cursor:'pointer', fontSize:11.5, fontWeight:600,
              background:roleF===role?TOKENS.crimson:'#fff', color:roleF===role?'#fff':TOKENS.s500,
              borderRight:'1px solid '+TOKENS.line,
            }}>{role==='ops_manager'?'Ops':role==='accountant'?'Accounts':role.charAt(0).toUpperCase()+role.slice(1)}</button>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name..."
          style={{ flex:1, padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }}/>
      </div>

      {/* On break section */}
      {onBreak.length > 0 && (
        <div className="card" style={{ overflow:'hidden', marginBottom:16 }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, background:'#FEF9C3', display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontWeight:800, fontSize:13, color:'#92400E' }}>Currently on break ({onBreak.length})</span>
            <span style={{ fontSize:12, color:'#92400E' }}>On break — no reminders</span>
          </div>
          {onBreak.map(u=>(
            <div key={u._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{u.firstName} {u.lastName}</div>
                <div style={{ fontSize:11.5, color:TOKENS.s500 }}>{u.role} · {BREAK_LABELS[u.breakType]||'Break'}{u.breakNote?' · '+u.breakNote:''}</div>
              </div>
              <button onClick={()=>removeBreak(u)} disabled={saving===u._id} style={{
                background:'#065F46', color:'#fff', border:'none', padding:'7px 14px',
                borderRadius:7, fontSize:12, fontWeight:700, cursor:saving===u._id?'not-allowed':'pointer',
                opacity:saving===u._id?.6:1,
              }}>{saving===u._id?'Removing...':'Return from break'}</button>
            </div>
          ))}
        </div>
      )}

      {/* Active users table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, fontWeight:800, fontSize:13, color:TOKENS.s900 }}>
          Active {roleF}s ({filtActive.length})
        </div>
        {loading ? (
          <div style={{ padding:30,textAlign:'center',color:TOKENS.s400 }}>Loading...</div>
        ) : filtActive.length===0 ? (
          <div style={{ padding:30,textAlign:'center',color:TOKENS.s400,fontSize:13 }}>No active {roleF}s found.</div>
        ) : (
          <table className="tbl" style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead><tr>
              {['Name',roleF==='student'?'Grade / Curriculum':'Role','Email',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px',textAlign:'left',fontSize:10.5 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtActive.map(u=>(
                <tr key={u._id} style={{ borderTop:'1px solid '+TOKENS.line }}>
                  <td style={{ padding:'10px 14px',fontWeight:700,fontSize:13 }}>{u.firstName} {u.lastName}</td>
                  <td style={{ padding:'10px 14px',fontSize:12.5,color:TOKENS.s600 }}>{roleF==='student'?(u.gradeLevel||u.grade||'—')+' · '+(u.curriculum||'—'):u.role}</td>
                  <td style={{ padding:'10px 14px',fontSize:12,color:TOKENS.s500 }}>{u.email}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <button onClick={()=>{ setModal(u); setForm({ breakType:'mid_term_break', breakNote:'', breakStart:'', breakEnd:'' }) }}
                      style={{ background:'#FEF3C7',color:'#92400E',border:'1px solid #FDE68A',padding:'5px 12px',borderRadius:6,fontSize:12,fontWeight:700,cursor:'pointer' }}>
                      Place on break
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Break modal */}
      {modal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}
          onClick={()=>setModal(null)}>
          <div style={{ background:'#fff',borderRadius:14,padding:26,maxWidth:420,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15,fontWeight:800,color:TOKENS.s900,marginBottom:4 }}>Place on break</div>
            <div style={{ fontSize:12.5,color:TOKENS.s500,marginBottom:20 }}>{modal.firstName} {modal.lastName} · {modal.role}</div>

            <div style={{ display:'grid',gap:14 }}>
              <div>
                <label style={{ fontSize:11,fontWeight:700,color:TOKENS.crimson,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,display:'block' }}>Break type</label>
                <select value={form.breakType} onChange={e=>setForm(p=>({...p,breakType:e.target.value}))}
                  style={{ width:'100%',padding:'9px 11px',borderRadius:7,border:'1.5px solid '+TOKENS.line,fontSize:13,fontFamily:'inherit' }}>
                  {Object.entries(BREAK_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:TOKENS.crimson,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,display:'block' }}>Start date</label>
                  <input type="date" value={form.breakStart} onChange={e=>setForm(p=>({...p,breakStart:e.target.value}))}
                    style={{ width:'100%',padding:'9px 11px',borderRadius:7,border:'1.5px solid '+TOKENS.line,fontSize:13,fontFamily:'inherit',boxSizing:'border-box' }}/>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:TOKENS.crimson,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,display:'block' }}>End date (optional)</label>
                  <input type="date" value={form.breakEnd} onChange={e=>setForm(p=>({...p,breakEnd:e.target.value}))}
                    style={{ width:'100%',padding:'9px 11px',borderRadius:7,border:'1.5px solid '+TOKENS.line,fontSize:13,fontFamily:'inherit',boxSizing:'border-box' }}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11,fontWeight:700,color:TOKENS.crimson,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,display:'block' }}>Note (optional)</label>
                <input value={form.breakNote} onChange={e=>setForm(p=>({...p,breakNote:e.target.value}))}
                  placeholder="e.g. Medical leave for surgery"
                  style={{ width:'100%',padding:'9px 11px',borderRadius:7,border:'1.5px solid '+TOKENS.line,fontSize:13,fontFamily:'inherit',boxSizing:'border-box' }}/>
              </div>
            </div>

            <div style={{ background:'#FEF9C3',borderRadius:8,padding:'10px 14px',marginTop:16,fontSize:12,color:'#92400E',lineHeight:1.5 }}>
              {modal.firstName} keeps portal access. Reminders and absence alerts stop, and lessons are not counted as missed, until you remove the break.
            </div>

            <div style={{ display:'flex',gap:10,marginTop:18 }}>
              <button onClick={putOnBreak} disabled={!!saving} style={{ flex:1,background:'#D97706',color:'#fff',border:'none',padding:'11px 0',borderRadius:8,fontSize:13,fontWeight:700,cursor:saving?'not-allowed':'pointer' }}>
                {saving?'Saving...':'Confirm — place on break'}
              </button>
              <button onClick={()=>setModal(null)} style={{ background:'transparent',border:'1.5px solid '+TOKENS.line,color:TOKENS.s500,padding:'11px 16px',borderRadius:8,fontSize:13,cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
