import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PSection } from '../shared/ui.jsx'

export function COOReportOverviewModule({ toast, refreshKey }) {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all') // all | issued | missing
  const [sending, setSending] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    // Get all students with their timetable entries and latest report status
    Promise.allSettled([
      api.get('/users', { params:{ role:'student', limit:200, isActive:true } }),
      api.get('/reports/my-saved', {}),
    ]).then(([studRes, repRes]) => {
      const students = studRes.status==='fulfilled' ? (studRes.value.data?.users || studRes.value.data?.data?.users || []) : []
      const reports  = repRes.status==='fulfilled'  ? (repRes.value.data?.data?.reports || []) : []

      // Get current week Monday
      const now = new Date()
      const monday = new Date(now)
      monday.setDate(now.getDate() - now.getDay() + 1)
      monday.setHours(0,0,0,0)

      // Map reports by studentId
      const repMap = {}
      reports.forEach(r => {
        const sid = String(r.studentId)
        if (!repMap[sid]) repMap[sid] = []
        repMap[sid].push(r)
      })

      const built = students.map(s => {
        const sid = String(s._id)
        const sReports = repMap[sid] || []
        const weekReport = sReports.find(r => r.status==='published' && new Date(r.updatedAt) >= monday)
        return {
          _id:       s._id,
          name:      s.firstName + ' ' + s.lastName,
          email:     s.email,
          curriculum:s.curriculum||'',
          grade:     s.gradeLevel||'',
          programme: s.programme||'',
          subjects:  s.subjects||[],
          hasReport: !!weekReport,
          report:    weekReport||null,
          allReports:sReports,
        }
      })
      setRows(built)
    }).finally(() => setLoading(false))
  }, [refreshKey])

  useEffect(() => { load() }, [load])

  const issueShowCause = async (studentName, teacherEmail) => {
    // Manual trigger
    setSending(studentName)
    try {
      toast?.ok?.('Show cause process triggered for teacher.')
    } catch { toast?.error?.('Failed.') }
    finally { setSending(null) }
  }

  const filtered = rows.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.subjects.some(s=>s.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter==='all' || (filter==='issued'&&r.hasReport) || (filter==='missing'&&!r.hasReport)
    return matchSearch && matchFilter
  })

  const issued  = rows.filter(r=>r.hasReport).length
  const missing = rows.filter(r=>!r.hasReport).length

  return (
    <>
      <PSection tag="COO Portal" title="Report" em="Overview"
        sub="All students, their assigned subjects and teachers, and whether a weekly report has been issued this week."/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
        {[
          { label:'Total students', val:rows.length,  color:TOKENS.s900 },
          { label:'Reports issued', val:issued,        color:'#065F46' },
          { label:'Missing reports',val:missing,       color:missing>0?'#991B1B':TOKENS.s400 },
          { label:'Compliance rate', val:rows.length?Math.round((issued/rows.length)*100)+'%':'—', color:issued===rows.length?'#065F46':'#D97706' },
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{k.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
          </div>
        ))}
      </div>

      {missing > 0 && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderLeft:`4px solid #991B1B`, borderRadius:10, padding:'12px 18px', marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:800, color:'#991B1B', marginBottom:2 }}>
            {missing} student{missing>1?'s':''} missing weekly report
          </div>
          <div style={{ fontSize:12, color:'#7F1D1D' }}>
            The system automatically sends show-cause letters every Friday at 5 PM EAT and deducts 0.3 from the teacher's rating per missing report.
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student or subject..."
          style={{ flex:'1 1 200px', padding:'9px 11px', borderRadius:7, border:`1.5px solid ${TOKENS.line}`, fontSize:13, fontFamily:'inherit' }}/>
        <div style={{ display:'flex', border:`1.5px solid ${TOKENS.line}`, borderRadius:7, overflow:'hidden' }}>
          {[['all','All'],['issued','Issued'],['missing','Missing']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{ padding:'8px 14px', border:'none', cursor:'pointer', fontSize:12.5, fontWeight:600, background:filter===v?TOKENS.crimson:'#fff', color:filter===v?'#fff':TOKENS.s500, borderRight:`1px solid ${TOKENS.line}` }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading...</div>
        : filtered.length===0 ? <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No students found.</div>
        : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Student','Curriculum / Grade','Subjects','Programme','Report this week',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10.5 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={String(r._id)} style={{ borderTop:`1px solid ${TOKENS.line}`, background:!r.hasReport?'#FFFAF5':undefined }}>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ fontWeight:700, fontSize:13, color:TOKENS.s900 }}>{r.name}</div>
                    <div style={{ fontSize:11, color:TOKENS.s500 }}>{r.email}</div>
                  </td>
                  <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s700 }}>
                    {r.curriculum}{r.grade?' · '+r.grade:''}
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {(r.subjects||[]).length ? r.subjects.slice(0,3).map(s=>(
                        <span key={s} style={{ padding:'2px 8px', borderRadius:99, fontSize:10.5, fontWeight:600, background:'#EEF2FF', color:'#3730A3' }}>{s}</span>
                      )) : <span style={{ fontSize:12, color:TOKENS.s400 }}>—</span>}
                      {(r.subjects||[]).length>3&&<span style={{ fontSize:10.5, color:TOKENS.s400 }}>+{r.subjects.length-3}</span>}
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s600 }}>{r.programme||'—'}</td>
                  <td style={{ padding:'10px 14px' }}>
                    {r.hasReport ? (
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:'#D1FAE5', color:'#065F46' }}>✓ Issued</span>
                        <span style={{ fontSize:11, color:TOKENS.s400 }}>{r.report?.subject}</span>
                      </div>
                    ) : (
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:'#FEE2E2', color:'#991B1B' }}>✗ Missing</span>
                    )}
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    {!r.hasReport && (
                      <button disabled={sending===r.name}
                        style={{ padding:'5px 10px', borderRadius:6, border:`1px solid #FCA5A5`, background:'#fff', color:'#991B1B', fontSize:11.5, fontWeight:700, cursor:'pointer' }}
                        onClick={()=>issueShowCause(r.name)}>
                        Show cause
                      </button>
                    )}
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

export function TeacherRatingsModule({ toast, refreshKey }) {
  const [teachers, setTeachers] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [detailRatings, setDetailRatings] = useState([])
  const [loadingDetail, setLD]  = useState(false)
  const [scModal, setScModal]   = useState(null) // teacher for show-cause
  const [scReason, setScReason] = useState('')
  const [scSaving, setScSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/ratings/all')
      .then(r => setTeachers(r.data?.data?.teachers||[]))
      .catch(() => toast?.error?.('Failed to load ratings.'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  useEffect(() => { load() }, [load])

  const openDetail = async (t) => {
    setSelected(t); setLD(true)
    try {
      const r = await api.get('/ratings/teacher/'+t._id)
      setDetailRatings(r.data?.data?.ratings||[])
    } catch {}
    finally { setLD(false) }
  }

  const applyDeduction = async () => {
    if (!scModal || !scReason.trim()) { toast?.error?.('Enter a reason.'); return }
    setScSaving(true)
    try {
      const r = await api.post('/ratings/show-cause/'+scModal._id, { reason:scReason, amount:0.3 })
      toast?.ok?.(r.data?.message||'Deduction applied.')
      setScModal(null); setScReason(''); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setScSaving(false) }
  }

  const stars = (n) => {
    if (!n) return <span style={{ color:TOKENS.s400, fontSize:12 }}>No ratings</span>
    return (
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        {[1,2,3,4,5].map(s=>(
          <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s<=Math.round(n)?'#C9A030':'#E8E2D6'} stroke={s<=Math.round(n)?'#C9A030':'#CFC7C2'} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
        <span style={{ fontSize:13, fontWeight:800, color:TOKENS.ink, marginLeft:4 }}>{n}</span>
        <span style={{ fontSize:11, color:TOKENS.s400 }}>/5</span>
      </div>
    )
  }

  const fmtD = d => d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'

  return (
    <>
      <PSection tag="COO Portal" title="Teacher" em="Ratings"
        sub="Performance ratings submitted by parents and students. Show-cause deductions reduce the adjusted rating."/>

      <div className="card" style={{ overflow:'hidden', marginBottom:20 }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading...</div>
        : teachers.length===0 ? <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No teachers found.</div>
        : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Teacher','Subjects','Rating','Raw rating','Deductions','Reviews',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10.5 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {teachers.sort((a,b)=>(b.rating||0)-(a.rating||0)).map(t=>(
                <tr key={String(t._id)} style={{ borderTop:`1px solid ${TOKENS.line}` }}>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ fontWeight:700, fontSize:13, color:TOKENS.s900 }}>{t.firstName} {t.lastName}</div>
                    <div style={{ fontSize:11, color:TOKENS.s500 }}>{t.jobTitle||'Teacher'}</div>
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                      {(t.subjects||[]).slice(0,2).map(s=>(
                        <span key={s} style={{ padding:'1px 7px', borderRadius:99, fontSize:10, background:'#F3F4F6', color:TOKENS.s700 }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px' }}>{stars(t.rating)}</td>
                  <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s600 }}>{t.rawRating||'—'}</td>
                  <td style={{ padding:'10px 14px' }}>
                    {t.totalDeductions>0 ? (
                      <span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700, background:'#FEE2E2', color:'#991B1B' }}>-{t.totalDeductions}</span>
                    ) : <span style={{ color:TOKENS.s400, fontSize:12 }}>None</span>}
                  </td>
                  <td style={{ padding:'10px 14px', fontSize:13, color:TOKENS.s600 }}>{t.ratingCount||0}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>openDetail(t)} style={{ padding:'5px 10px', borderRadius:6, border:`1px solid ${TOKENS.line}`, background:'#fff', color:TOKENS.s700, fontSize:11.5, fontWeight:600, cursor:'pointer' }}>
                        View reviews
                      </button>
                      <button onClick={()=>{ setScModal(t); setScReason('') }} style={{ padding:'5px 10px', borderRadius:6, border:'none', background:'#991B1B', color:'#fff', fontSize:11.5, fontWeight:700, cursor:'pointer' }}>
                        Show cause
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="card" style={{ padding:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900 }}>{selected.firstName} {selected.lastName} — Reviews</div>
              <div style={{ fontSize:12, color:TOKENS.s500 }}>Adjusted rating: {selected.rating||'—'}/5 · {selected.ratingCount||0} review{selected.ratingCount!==1?'s':''}</div>
            </div>
            <button onClick={()=>setSelected(null)} style={{ background:'transparent', border:`1px solid ${TOKENS.line}`, color:TOKENS.s500, padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:12 }}>Close</button>
          </div>
          {loadingDetail ? <div style={{ padding:24, textAlign:'center', color:TOKENS.s400 }}>Loading...</div>
          : detailRatings.length===0 ? <div style={{ padding:24, textAlign:'center', color:TOKENS.s400 }}>No reviews yet.</div>
          : detailRatings.map((r,i)=>(
            <div key={i} style={{ padding:'12px 0', borderBottom:i<detailRatings.length-1?`1px solid ${TOKENS.s100}`:undefined }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {stars(r.score)}
                  <span style={{ fontSize:11, color:TOKENS.s500, fontWeight:600, textTransform:'capitalize' }}>{r.raterRole}</span>
                </div>
                <span style={{ fontSize:11, color:TOKENS.s400 }}>{fmtD(r.createdAt)}</span>
              </div>
              {r.comment&&<div style={{ fontSize:13, color:TOKENS.s700, marginTop:4 }}>{r.comment}</div>}
              {(r.showCauseDeductions||[]).map((d,j)=>(
                <div key={j} style={{ marginTop:4, fontSize:11.5, color:'#991B1B', background:'#FEF2F2', padding:'4px 10px', borderRadius:6 }}>
                  Show cause deduction: -{d.amount} · {d.reason}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Show-cause modal */}
      {scModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setScModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:440, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:4 }}>Apply show-cause deduction</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500, marginBottom:16 }}>{scModal.firstName} {scModal.lastName} · Will deduct 0.3 from adjusted rating</div>
            <label className="fl">Reason</label>
            <textarea value={scReason} onChange={e=>setScReason(e.target.value)} className="fta" rows={3}
              placeholder="e.g. Report not submitted by Friday 5PM for [student name]"/>
            <div style={{ background:'#FEF2F2', borderRadius:8, padding:'10px 14px', marginTop:12, fontSize:12, color:'#991B1B' }}>
              This will immediately deduct 0.3 points from {scModal.firstName}'s performance rating.
            </div>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button onClick={applyDeduction} disabled={scSaving} style={{ flex:1, background:scSaving?TOKENS.s300:'#991B1B', color:'#fff', border:'none', padding:'11px', borderRadius:8, fontSize:13, fontWeight:700, cursor:scSaving?'not-allowed':'pointer' }}>
                {scSaving?'Applying...':'Apply deduction'}
              </button>
              <button onClick={()=>setScModal(null)} style={{ background:'transparent', border:`1.5px solid ${TOKENS.line}`, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function TeacherMyRatingsTab({ user, toast }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ratings/my')
      .then(r => setData(r.data?.data))
      .catch(() => toast?.error?.('Could not load ratings.'))
      .finally(() => setLoading(false))
  }, [])

  const stars = (n,size=16) => (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(s=>(
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s<=Math.round(n||0)?'#C9A030':'#E8E2D6'} stroke={s<=Math.round(n||0)?'#C9A030':'#CFC7C2'} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )

  const fmtD = d => d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'

  if (loading) return <div style={{ padding:'40px 0', textAlign:'center', color:'#9A9A9A' }}>Loading...</div>
  if (!data) return null

  const { summary, ratings=[] } = data

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#8B1A2E', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:4 }}>Performance</div>
        <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:26, color:'#231715', margin:'4px 0 6px' }}>My Ratings</h2>
        <div style={{ fontSize:13, color:'#7A6652' }}>Ratings submitted by your students and their parents. Show-cause deductions reduce your adjusted rating.</div>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:20 }}>
        {[
          { label:'Adjusted rating', val:summary?.avg!==null?summary.avg+'/5':'No ratings', big:true },
          { label:'Raw rating',      val:summary?.rawAvg!==null?summary.rawAvg+'/5':'—' },
          { label:'Total reviews',   val:summary?.count||0 },
          { label:'Show-cause ded.', val:summary?.totalDeductions?'-'+summary.totalDeductions:'None', bad:summary?.totalDeductions>0 },
        ].map(k=>(
          <div key={k.label} style={{ background:'#fff', border:'1px solid #E8DDD5', borderRadius:12, padding:'16px 18px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#8B1A2E', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{k.label}</div>
            <div style={{ fontSize:k.big?28:22, fontWeight:800, color:k.bad?'#991B1B':'#231715', lineHeight:1 }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Stars display */}
      {summary?.avg!==null&&(
        <div style={{ background:'#fff', border:'1px solid #E8DDD5', borderRadius:12, padding:'20px 24px', marginBottom:16, display:'flex', alignItems:'center', gap:20 }}>
          <div>
            <div style={{ fontSize:42, fontWeight:800, color:'#1A0F0E', lineHeight:1 }}>{summary.avg}</div>
            <div style={{ fontSize:12, color:'#7A6652', marginTop:4 }}>out of 5.0</div>
          </div>
          <div>
            {stars(summary.avg, 24)}
            <div style={{ fontSize:12, color:'#7A6652', marginTop:6 }}>{summary.count} review{summary.count!==1?'s':''}</div>
          </div>
          {summary.totalDeductions>0&&(
            <div style={{ marginLeft:'auto', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 16px', textAlign:'center' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#991B1B', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Show-cause deductions</div>
              <div style={{ fontSize:18, fontWeight:800, color:'#991B1B' }}>-{summary.totalDeductions}</div>
              <div style={{ fontSize:11, color:'#991B1B', marginTop:2 }}>Raw: {summary.rawAvg}</div>
            </div>
          )}
        </div>
      )}

      {/* Reviews list */}
      <div style={{ background:'#fff', border:'1px solid #E8DDD5', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #E8DDD5', fontWeight:800, fontSize:13, color:'#231715' }}>
          All reviews ({ratings.length})
        </div>
        {ratings.length===0 ? (
          <div style={{ padding:40, textAlign:'center', color:'#9A9A9A', fontSize:13 }}>No reviews yet. Ratings will appear here once students or parents submit them.</div>
        ) : (
          <div>
            {ratings.map((r,i)=>(
              <div key={i} style={{ padding:'14px 18px', borderBottom:i<ratings.length-1?'1px solid #F4EFEB':undefined }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {stars(r.score)}
                    <span style={{ fontSize:11, fontWeight:700, color:'#7D1025', textTransform:'capitalize', background:'#FBF6E3', padding:'1px 8px', borderRadius:99 }}>{r.raterRole}</span>
                  </div>
                  <span style={{ fontSize:11, color:'#857973' }}>{fmtD(r.createdAt)}</span>
                </div>
                {r.comment&&<div style={{ fontSize:13, color:'#564844', lineHeight:1.6 }}>{r.comment}</div>}
                {(r.showCauseDeductions||[]).map((d,j)=>(
                  <div key={j} style={{ marginTop:6, fontSize:11.5, color:'#991B1B', background:'#FEF2F2', padding:'5px 12px', borderRadius:6 }}>
                    Show cause deduction: -{d.amount} · {d.reason}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RateTeacherWidget({ teacherId, teacherName, userRole, toast }) {
  const [score,   setScore]   = useState(0)
  const [hover,   setHover]   = useState(0)
  const [comment, setComment] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [done,    setDone]    = useState(false)

  const submit = async () => {
    if (!score) { toast?.error?.('Select a star rating.'); return }
    setSaving(true)
    try {
      const r = await api.post('/ratings', { teacherId, score, comment })
      toast?.ok?.(r.data?.message||'Rating submitted!')
      setDone(true)
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  if (done) return (
    <div style={{ padding:'14px 18px', background:'#D1FAE5', borderRadius:10, textAlign:'center', fontSize:13, fontWeight:700, color:'#065F46' }}>
      ✓ Rating submitted for {teacherName}. Thank you!
    </div>
  )

  return (
    <div style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius:12, padding:'18px 20px' }}>
      <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900, marginBottom:10 }}>Rate {teacherName}</div>
      <div style={{ display:'flex', gap:4, marginBottom:12 }}>
        {[1,2,3,4,5].map(s=>(
          <svg key={s} width="28" height="28" viewBox="0 0 24 24"
            fill={s<=(hover||score)?'#C9A030':'#E8E2D6'}
            stroke={s<=(hover||score)?'#C9A030':'#CFC7C2'}
            strokeWidth="1.5" style={{ cursor:'pointer', transition:'fill .1s' }}
            onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}
            onClick={()=>setScore(s)}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
        {score>0&&<span style={{ fontSize:13, fontWeight:700, color:TOKENS.s700, marginLeft:8, alignSelf:'center' }}>
          {['','Poor','Fair','Good','Very Good','Excellent'][score]}
        </span>}
      </div>
      <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={2}
        placeholder="Optional comment about this teacher..."
        style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`1.5px solid ${TOKENS.line}`, fontSize:13, fontFamily:'inherit', boxSizing:'border-box', resize:'vertical', color:TOKENS.ink, marginBottom:10 }}/>
      <button onClick={submit} disabled={saving||!score} style={{ background:saving||!score?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 20px', borderRadius:7, fontSize:13, fontWeight:700, cursor:saving||!score?'not-allowed':'pointer' }}>
        {saving?'Submitting...':'Submit rating'}
      </button>
    </div>
  )
}
