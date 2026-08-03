import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { fmtDate, initials } from '../shared/helpers.js'
import { PSection } from '../shared/ui.jsx'

function ReportsModule({ toast, refreshKey }) {
  const [view, setView] = useState('list') // list | generate | detail
  const [selected, setSelected] = useState(null)
  return (
    <>
      <PSection tag="Academic" title="Student" em="Reports"
        sub="Generate end-of-term reports with auto-calculated scores and attendance."/>
      {view === 'list'     && <ReportList     toast={toast} refreshKey={refreshKey}
                                onOpen={r => { setSelected(r); setView('detail') }}
                                onNew={() => setView('generate')}/>}
      {view === 'generate' && <ReportGenerator toast={toast}
                                onBack={() => setView('list')}
                                onSaved={r => { setSelected(r); setView('detail') }}/>}
      {view === 'detail'   && <ReportDetail   toast={toast} report={selected}
                                onBack={() => { setSelected(null); setView('list') }}/>}
    </>
  )
}

function ReportList({ toast, refreshKey, onOpen, onNew }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [termF,   setTermF]   = useState('all')
  const [yearF,   setYearF]   = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 30 }
    if (termF !== 'all') params.term = termF
    if (yearF) params.academicYear = yearF
    api.get('/reports', { params })
      .then(r => { setReports(r.data?.data?.reports || []); setTotalPages(r.data?.data?.totalPages||1) })
      .catch(() => toast?.error?.('Failed to load reports.'))
      .finally(() => setLoading(false))
  }, [termF, yearF, page])

  useEffect(() => { load() }, [load, refreshKey])

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'

  const GRADE_COLORS = {
    'A*':'#065F46','A':'#065F46','B':'#1E40AF','C':'#92400E',
    'D':'#6B21A8','E':'#9A3412','U':'#991B1B',
  }

  const filtered = reports.filter(r => {
    if (!search) return true
    const name = (r.studentId?.firstName + ' ' + r.studentId?.lastName).toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <>
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student name..."
          style={{ flex:'1 1 200px', padding:'8px 12px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13 }}/>
        <select value={termF} onChange={e=>setTermF(e.target.value)}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5 }}>
          <option value="all">All terms</option>
          <option value="1">Term 1</option>
          <option value="2">Term 2</option>
          <option value="3">Term 3</option>
        </select>
        <input value={yearF} onChange={e=>setYearF(e.target.value)} placeholder="Year e.g. 2025/2026"
          style={{ width:140, padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5 }}/>
        <button onClick={onNew} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
          + Generate report
        </button>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:30, textAlign:'center', color:TOKENS.s500, fontSize:13 }}>Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:40, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:10 }}>▤</div>
            <div style={{ fontSize:14, fontWeight:700, color:TOKENS.s900, marginBottom:4 }}>No reports yet</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500 }}>Click "+ Generate report" to create your first.</div>
          </div>
        ) : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Student','Curriculum','Year/Grade','Term','Academic Year','Mean Grade','Avg Score','Status','Date Issued',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(r => {
                const gc = GRADE_COLORS[r.meanGrade] || TOKENS.s700
                return (
                  <tr key={r._id} style={{ borderTop:'1px solid '+TOKENS.line, cursor:'pointer' }}
                    onMouseEnter={e=>e.currentTarget.style.background=TOKENS.cream}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    onClick={() => onOpen(r)}>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>
                        {r.studentId?.firstName} {r.studentId?.lastName}
                      </div>
                      <div style={{ fontSize:11, color:TOKENS.s500 }}>Adm: {r.admissionNo}</div>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s700 }}>{r.curriculum}</td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s700 }}>{r.yearGrade}</td>
                    <td style={{ padding:'10px 14px', fontSize:12.5 }}>Term {r.term}</td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s500 }}>{r.academicYear}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, background:gc+'15', color:gc, fontSize:12, fontWeight:800 }}>
                        {r.meanGrade || '—'}
                      </span>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:TOKENS.s900 }}>
                      {r.overallAverage !== null ? r.overallAverage+'%' : '—'}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700,
                        background:r.status==='published'?'#D1FAE5':'#FEF3C7',
                        color:r.status==='published'?'#065F46':'#92400E' }}>
                        {r.status==='published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:11.5, color:TOKENS.s500, whiteSpace:'nowrap' }}>{fmtDate(r.dateIssued)}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={TOKENS.crimson} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:12 }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
            style={{ padding:'6px 13px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page<=1?'not-allowed':'pointer', opacity:page<=1?.5:1 }}>‹</button>
          <span style={{ padding:'6px 12px', fontSize:12.5, color:TOKENS.s700 }}>Page {page} / {totalPages}</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}
            style={{ padding:'6px 13px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page>=totalPages?'not-allowed':'pointer', opacity:page>=totalPages?.5:1 }}>›</button>
        </div>
      )}
    </>
  )
}

function ReportGenerator({ toast, onBack, onSaved }) {
  const today = new Date()
  const [students, setStudents] = useState([])
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [preview,  setPreview]  = useState(null) // computed subject scores from API

  const currentYear = today.getFullYear()
  const [f, setF] = useState({
    studentId: '',
    academicYear: `${currentYear-1}/${currentYear}`,
    term: '3',
    termLabel: 'Term 3 · Final Term',
    termStart: `${currentYear}-01-15`,
    termEnd:   `${currentYear}-04-15`,
    scheduledDays: '60',
    classTeacher: '',
    classStream: '',
    programme: '',
    // Subject comments: { [subject]: { comment, initials, teacherId } }
    subjectComments: {},
    learningHabits: {
      effort:4, participation:3, homework:3, organisation:3,
      conduct:4, collaboration:3, feedback:3, digital:3,
    },
    coCurricular: '',
    agreedTargets: ['', '', ''],
    classTeacherReport: '',
    hodRemarks: '',
    issuedBy: 'Ms. Brendaliz Chelangat — Head of Academics',
    promotionDecision: '',
    nextTermStart: '',
    reportingTime: '',
  })

  const set = (k,v) => setF(p=>({...p,[k]:v}))

  useEffect(() => {
    api.get('/users', { params: { role:'student', limit:200 } })
      .then(r => setStudents(r.data?.data?.users || r.data?.users || []))
      .catch(() => {})
  }, [])

  // When student+term is chosen, fetch preview of exam scores
  useEffect(() => {
    if (!f.studentId || !f.termStart || !f.termEnd) return
    setPreview(null)
    api.get('/reports/preview', { params: {
      studentId: f.studentId,
      termStart: f.termStart,
      termEnd: f.termEnd,
    }}).then(r => {
      setPreview(r.data?.data)
      // Pre-fill subjectComments keys
      const subjects = r.data?.data?.subjects || []
      setF(p => ({
        ...p,
        subjectComments: subjects.reduce((acc, s) => ({
          ...acc,
          [s.subject]: p.subjectComments[s.subject] || { comment:'', initials:'', teacherId:'' }
        }), p.subjectComments)
      }))
    }).catch(() => {})
  }, [f.studentId, f.termStart, f.termEnd])

  const generate = async () => {
    setError('')
    if (!f.studentId) { setError('Select a student.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/reports/generate', {
        ...f,
        term: parseInt(f.term),
        scheduledDays: parseInt(f.scheduledDays) || 60,
        agreedTargets: f.agreedTargets.filter(Boolean),
      })
      if (data.success) {
        toast?.ok?.('Report generated.')
        onSaved(data.data.report)
      } else {
        setError(data.message || 'Generation failed.')
      }
    } catch(e) {
      setError(e?.response?.data?.message || 'Could not generate report.')
    } finally { setSaving(false) }
  }

  const inp  = { width:'100%', boxSizing:'border-box', padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }
  const lbl  = { fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4, display:'block' }
  const card = { background:'#fff', border:'1px solid '+TOKENS.line, borderRadius:12, padding:18, marginBottom:14 }

  const HABIT_LABELS = [
    ['effort','Effort & diligence'],
    ['participation','Class participation'],
    ['homework','Homework completion'],
    ['organisation','Organisation & study'],
    ['conduct','Conduct & courtesy'],
    ['collaboration','Collaboration'],
    ['feedback','Responsiveness to feedback'],
    ['digital','Digital learning discipline'],
  ]
  const HABIT_OPTS = ['Concern','Developing','Good','Excellent']

  return (
    <>
      <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, display:'flex', alignItems:'center', gap:5, padding:0, marginBottom:16 }}>
        ← Back to reports
      </button>
      <h2 className="serif" style={{ fontSize:22, color:TOKENS.s900, margin:'0 0 20px' }}>Generate Academic Report</h2>

      {error && <div style={{ background:'#FDE7EC', border:'1px solid #F8B4C0', borderRadius:8, padding:'10px 14px', fontSize:13, color:TOKENS.crimson, marginBottom:16 }}>{error}</div>}

      {/* Student & Term */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:14 }}>Student & Term</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
          <div>
            <label style={lbl}>Student *</label>
            <select value={f.studentId} onChange={e=>set('studentId',e.target.value)} style={inp}>
              <option value="">Select student...</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.firstName} {s.lastName} {s.admissionNo?'('+s.admissionNo+')':''}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>Academic Year</label>
            <input value={f.academicYear} onChange={e=>set('academicYear',e.target.value)} placeholder="2025/2026" style={inp}/>
          </div>
          <div>
            <label style={lbl}>Term</label>
            <select value={f.term} onChange={e=>set('term',e.target.value)} style={inp}>
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3 (Final)</option>
            </select>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12 }}>
          <div>
            <label style={lbl}>Term label</label>
            <input value={f.termLabel} onChange={e=>set('termLabel',e.target.value)} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Term start date</label>
            <input type="date" value={f.termStart} onChange={e=>set('termStart',e.target.value)} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Term end date</label>
            <input type="date" value={f.termEnd} onChange={e=>set('termEnd',e.target.value)} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Scheduled days</label>
            <input type="number" value={f.scheduledDays} onChange={e=>set('scheduledDays',e.target.value)} style={inp}/>
          </div>
        </div>
      </div>

      {/* Class info */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:14 }}>Class Information</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <div><label style={lbl}>Class teacher</label><input value={f.classTeacher} onChange={e=>set('classTeacher',e.target.value)} placeholder="e.g. Cynthia Kemunto" style={inp}/></div>
          <div><label style={lbl}>Class / stream</label><input value={f.classStream} onChange={e=>set('classStream',e.target.value)} placeholder="e.g. A or —" style={inp}/></div>
          <div><label style={lbl}>Programme</label><input value={f.programme} onChange={e=>set('programme',e.target.value)} placeholder="e.g. In-Person (Centre)" style={inp}/></div>
        </div>
      </div>

      {/* Subject scores preview + teacher comments */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:6 }}>Subject Scores & Teacher Comments</div>
        <div style={{ fontSize:11.5, color:TOKENS.s500, marginBottom:14 }}>
          Pulled from LMS exams in the selected date range. Weekly average (30%) + End-term (70%) = weighted score.
        </div>

        {!f.studentId ? (
          <div style={{ padding:20, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Select a student first.</div>
        ) : !preview ? (
          <div style={{ padding:20, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading exam data...</div>
        ) : preview.subjects?.length === 0 ? (
          <div style={{ padding:16, background:'#FEF9C3', borderRadius:8, fontSize:13, color:'#92400E' }}>
            No graded exams found for this student in the selected date range. You can still generate the report — add comments below and scores will show as "—".
          </div>
        ) : null}

        {(preview?.subjects || []).length > 0 && (
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
            <thead>
              <tr style={{ background:TOKENS.cream }}>
                {['Subject','Weekly avg (30%)','End-term (70%)','Weighted','Grade'].map(h=>(
                  <th key={h} style={{ padding:'7px 10px', fontSize:10.5, fontWeight:700, textAlign:h==='Subject'?'left':'center', color:TOKENS.crimson, letterSpacing:'.04em', textTransform:'uppercase', borderBottom:'1.5px solid '+TOKENS.line }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(preview?.subjects || []).map(s => (
                <tr key={s.subject} style={{ borderBottom:'1px solid '+TOKENS.line }}>
                  <td style={{ padding:'8px 10px', fontWeight:700, fontSize:13 }}>{s.subject}</td>
                  <td style={{ padding:'8px 10px', textAlign:'center', fontSize:12.5 }}>
                    {s.missedWeekly ? <span style={{ color:'#9A2434', fontStyle:'italic', fontSize:11 }}>Missed</span> : (s.weeklyAverage !== null ? s.weeklyAverage+'%' : '—')}
                  </td>
                  <td style={{ padding:'8px 10px', textAlign:'center', fontSize:12.5 }}>
                    {s.missedEndTerm ? <span style={{ color:TOKENS.s400, fontSize:11 }}>—</span> : (s.endTermScore !== null ? s.endTermScore+'%' : '—')}
                  </td>
                  <td style={{ padding:'8px 10px', textAlign:'center', fontWeight:700, fontSize:13 }}>
                    {s.weightedScore !== null ? s.weightedScore+'%' : '—'}
                  </td>
                  <td style={{ padding:'8px 10px', textAlign:'center' }}>
                    <span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:800,
                      background:s.letterGrade==='U'?'#FEE2E2':s.letterGrade==='A*'||s.letterGrade==='A'?'#D1FAE5':'#EFF6FF',
                      color:s.letterGrade==='U'?'#991B1B':s.letterGrade==='A*'||s.letterGrade==='A'?'#065F46':'#1E40AF',
                    }}>{s.letterGrade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Teacher comments per subject */}
        {Object.keys(f.subjectComments).map(subj => (
          <div key={subj} style={{ background:TOKENS.cream, borderRadius:8, padding:12, marginBottom:10, border:'1px solid '+TOKENS.line }}>
            <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:8 }}>{subj} — Teacher comment</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 80px', gap:8 }}>
              <textarea value={f.subjectComments[subj]?.comment||''} rows={2}
                onChange={e => setF(p=>({...p, subjectComments:{...p.subjectComments,[subj]:{...p.subjectComments[subj],comment:e.target.value}}}))}
                placeholder="Teacher's comment for this subject..."
                style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}/>
              <input value={f.subjectComments[subj]?.initials||''} placeholder="Init."
                onChange={e => setF(p=>({...p, subjectComments:{...p.subjectComments,[subj]:{...p.subjectComments[subj],initials:e.target.value}}}))}
                style={{ ...inp, textAlign:'center', fontWeight:700 }}/>
            </div>
          </div>
        ))}

        {/* Add subject manually */}
        <button onClick={() => {
          const s = prompt('Subject name:')
          if (s?.trim()) setF(p=>({...p, subjectComments:{...p.subjectComments,[s.trim()]:{comment:'',initials:'',teacherId:''}}}))
        }} style={{ background:'transparent', border:'1.5px dashed '+TOKENS.line, color:TOKENS.s500, padding:'6px 14px', borderRadius:7, fontSize:12, cursor:'pointer' }}>
          + Add subject manually
        </button>
      </div>

      {/* Learning Habits */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:14 }}>Learning Habits & Personal Development</div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:TOKENS.cream }}>
              <th style={{ padding:'7px 10px', textAlign:'left', fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.04em', width:'45%' }}>Area</th>
              {HABIT_OPTS.map(o=><th key={o} style={{ padding:'7px 10px', fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.04em', textAlign:'center' }}>{o}</th>)}
            </tr>
          </thead>
          <tbody>
            {HABIT_LABELS.map(([key, label], i) => (
              <tr key={key} style={{ borderTop:'1px solid '+TOKENS.line, background:i%2===0?'transparent':TOKENS.cream }}>
                <td style={{ padding:'8px 10px', fontSize:12.5 }}>{label}</td>
                {[4,3,2,1].map(val => (
                  <td key={val} style={{ padding:'8px 10px', textAlign:'center' }}>
                    <input type="radio" name={key} value={val}
                      checked={f.learningHabits[key]===val}
                      onChange={() => setF(p=>({...p, learningHabits:{...p.learningHabits,[key]:val}}))}
                      style={{ accentColor:TOKENS.crimson, cursor:'pointer', width:16, height:16 }}/>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Co-curricular + targets */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Co-Curricular & Targets</div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Co-curricular participation & achievements</label>
          <textarea value={f.coCurricular} onChange={e=>set('coCurricular',e.target.value)} rows={3}
            placeholder="e.g. Football — regular participant. Head of Students' Co-Curricular Activities."
            style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}/>
        </div>
        <div>
          <label style={lbl}>Agreed targets (with student)</label>
          {f.agreedTargets.map((t,i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
              <span style={{ fontSize:12, color:TOKENS.s500, paddingTop:9 }}>{i+1}.</span>
              <input value={t} onChange={e=>setF(p=>({...p,agreedTargets:p.agreedTargets.map((v,j)=>j===i?e.target.value:v)}))}
                placeholder={`Target ${i+1}, e.g. Mathematics — 60%`} style={{ ...inp, flex:1 }}/>
            </div>
          ))}
          <button onClick={()=>setF(p=>({...p,agreedTargets:[...p.agreedTargets,'']}))}
            style={{ background:'transparent', border:'none', color:TOKENS.crimson, cursor:'pointer', fontSize:12, fontWeight:700 }}>
            + Add target
          </button>
        </div>
      </div>

      {/* Teacher + HoD remarks */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Remarks</div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Class teacher's report</label>
          <textarea value={f.classTeacherReport} onChange={e=>set('classTeacherReport',e.target.value)} rows={4}
            placeholder="Class teacher's narrative for this student this term..."
            style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}/>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Head of Academics' remarks</label>
          <textarea value={f.hodRemarks} onChange={e=>set('hodRemarks',e.target.value)} rows={4}
            placeholder="HoD's remarks..."
            style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <div><label style={lbl}>Issued by</label><input value={f.issuedBy} onChange={e=>set('issuedBy',e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Next term start</label><input value={f.nextTermStart} onChange={e=>set('nextTermStart',e.target.value)} placeholder="e.g. 10 September 2026" style={inp}/></div>
          <div><label style={lbl}>Reporting time</label><input value={f.reportingTime} onChange={e=>set('reportingTime',e.target.value)} placeholder="e.g. 7:30 AM" style={inp}/></div>
        </div>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={generate} disabled={saving} style={{ background:saving?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'12px 28px', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
          {saving ? 'Generating...' : 'Generate & save report'}
        </button>
        <button onClick={onBack} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'12px 20px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>Cancel</button>
      </div>
    </>
  )
}

function ReportDetail({ toast, report: initialReport, onBack }) {
  const [report, setReport] = useState(initialReport)
  const [publishing, setPublishing] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : '—'

  const downloadPdf = async () => {
    setLoadingPdf(true)
    try {
      const { data } = await api.get('/reports/'+report._id+'/pdf-html')
      if (data.success) {
        const w = window.open('','_blank')
        if (!w) { toast?.error?.('Allow pop-ups to open the report.'); return }
        w.document.write(data.data.html)
        w.document.close()
      }
    } catch { toast?.error?.('Could not load report PDF.') }
    finally { setLoadingPdf(false) }
  }

  const publish = async () => {
    setPublishing(true)
    try {
      const { data } = await api.patch('/reports/'+report._id, { status:'published' })
      if (data.success) { setReport(data.data.report); toast?.ok?.('Report published.') }
    } catch { toast?.error?.('Could not publish.') }
    finally { setPublishing(false) }
  }

  const GRADE_COLORS = { 'A*':'#065F46','A':'#065F46','B':'#1E40AF','C':'#92400E','D':'#6B21A8','E':'#9A3412','U':'#991B1B' }
  const gc = GRADE_COLORS[report.meanGrade] || TOKENS.s700

  return (
    <>
      <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, display:'flex', alignItems:'center', gap:5, padding:0, marginBottom:16 }}>
        ← Back to reports
      </button>

      {/* Header card */}
      <div className="card" style={{ padding:22, marginBottom:16, background:'linear-gradient(135deg,#7D1025,#5A0B1B)', color:'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.55)', marginBottom:8 }}>
              {report.termLabel} · {report.academicYear}
            </div>
            <h2 className="serif" style={{ fontSize:26, color:'#fff', margin:'0 0 6px' }}>{report.studentName}</h2>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.7)' }}>
              {report.curriculum} · {report.yearGrade} · Adm: {report.admissionNo}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:40, fontWeight:900, color:'#C9A030', lineHeight:1 }}>{report.meanGrade || '—'}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', marginTop:4 }}>Mean Grade</div>
            {report.overallAverage !== null && (
              <div style={{ fontSize:18, fontWeight:700, color:'#fff', marginTop:4 }}>{report.overallAverage}%</div>
            )}
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap' }}>
          <button onClick={downloadPdf} disabled={loadingPdf} style={{ background:'#C9A030', color:'#7D1025', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:800, cursor:loadingPdf?'not-allowed':'pointer' }}>
            {loadingPdf ? 'Loading...' : '⬇ Download PDF'}
          </button>
          {report.status === 'draft' && (
            <button onClick={publish} disabled={publishing} style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1.5px solid rgba(255,255,255,.3)', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:publishing?'not-allowed':'pointer' }}>
              {publishing ? 'Publishing...' : '✓ Publish report'}
            </button>
          )}
          {report.status === 'published' && (
            <span style={{ padding:'9px 14px', background:'rgba(34,197,94,.2)', borderRadius:7, fontSize:12, fontWeight:700, color:'#6EE7B7' }}>✓ Published</span>
          )}
        </div>
      </div>

      {/* Attendance */}
      <div className="card" style={{ padding:18, marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Attendance</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
          {[
            { label:'Scheduled', val:report.scheduledDays||60 },
            { label:'Attended',  val:report.attendedDays, color:'#065F46' },
            { label:'Absent',    val:report.absentDays,   color:'#991B1B' },
            { label:'Attendance rate', val:report.punctualityPct+'%', color: report.punctualityPct>=80?'#065F46':report.punctualityPct>=60?'#92400E':'#991B1B' },
            { label:'Class teacher', val:report.classTeacher||'—' },
          ].map(k=>(
            <div key={k.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, color:k.color||TOKENS.s900 }}>{k.val}</div>
              <div style={{ fontSize:11, color:TOKENS.s500, marginTop:2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject results table */}
      <div className="card" style={{ overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, fontWeight:800, fontSize:13, color:TOKENS.s900 }}>
          Academic Performance
        </div>
        <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>
            {['Subject','Weekly avg (30%)','End-term (70%)','Weighted','Grade','Teacher comment'].map(h=>(
              <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {(report.subjects||[]).map(s => {
              const gc2 = GRADE_COLORS[s.letterGrade] || TOKENS.s700
              return (
                <tr key={s.subject} style={{ borderTop:'1px solid '+TOKENS.line }}>
                  <td style={{ padding:'10px 12px', fontWeight:700, fontSize:13 }}>{s.subject}</td>
                  <td style={{ padding:'10px 12px', textAlign:'center', fontSize:12.5 }}>
                    {s.missedWeekly ? <span style={{ color:'#9A2434', fontStyle:'italic', fontSize:11 }}>Missed</span> : (s.weeklyAverage!==null?s.weeklyAverage+'%':'—')}
                  </td>
                  <td style={{ padding:'10px 12px', textAlign:'center', fontSize:12.5 }}>{s.endTermScore!==null?s.endTermScore+'%':'—'}</td>
                  <td style={{ padding:'10px 12px', textAlign:'center', fontWeight:700, fontSize:13 }}>{s.weightedScore!==null?s.weightedScore+'%':'—'}</td>
                  <td style={{ padding:'10px 12px', textAlign:'center' }}>
                    <span style={{ padding:'2px 8px', borderRadius:99, fontSize:12, fontWeight:800, background:gc2+'15', color:gc2 }}>{s.letterGrade}</span>
                  </td>
                  <td style={{ padding:'10px 12px', fontSize:11.5, color:TOKENS.s700, lineHeight:1.5 }}>{s.teacherComment||'—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Summary */}
        <div style={{ padding:'12px 16px', background:TOKENS.cream, borderTop:'2px solid '+TOKENS.crimson, display:'flex', gap:24 }}>
          <div><div style={{ fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em' }}>End-term average</div><div style={{ fontSize:16, fontWeight:800 }}>{report.endTermAverage!==null?report.endTermAverage+'%':'—'}</div></div>
          <div><div style={{ fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em' }}>Weighted average</div><div style={{ fontSize:16, fontWeight:800 }}>{report.overallAverage!==null?report.overallAverage+'%':'—'}</div></div>
          <div><div style={{ fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em' }}>Mean grade</div>
            <div style={{ fontSize:16, fontWeight:800, color:gc }}>{report.meanGrade||'—'}</div>
          </div>
        </div>
      </div>

      {/* Remarks */}
      {(report.classTeacherReport || report.hodRemarks) && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Class Teacher's Report</div>
            <div style={{ fontSize:12.5, color:TOKENS.s700, lineHeight:1.65 }}>{report.classTeacherReport||'—'}</div>
          </div>
          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Head of Academics</div>
            <div style={{ fontSize:12.5, color:TOKENS.s700, lineHeight:1.65 }}>{report.hodRemarks||'—'}</div>
          </div>
        </div>
      )}

      <div style={{ fontSize:12, color:TOKENS.s400, textAlign:'center', marginTop:8 }}>
        Generated {fmtDate(report.createdAt)} · {report.status==='published'?'Published':'Draft'}
      </div>
    </>
  )
}

export default ReportsModule
