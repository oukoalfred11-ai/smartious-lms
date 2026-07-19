import { useState, useEffect, useCallback } from 'react'
import { useStore, useToast, useAuth, api } from '../../context/ctx.jsx'


// ── SF-style icons (no emojis) ────────────────────────────
const Icon = ({ name, size=16, color='currentColor', style={} }) => {
  const s = { width:size, height:size, display:'inline-block', flexShrink:0, ...style }
  const paths = {
    chart:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={s}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    exam:        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    homework:    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    trend:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={s}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    trophy:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={s}><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4a2 2 0 0 0-2 2v4a4 4 0 0 0 4 4h1"/><path d="M17 4h3a2 2 0 0 1 2 2v4a4 4 0 0 1-4 4h-1"/><rect x="7" y="2" width="10" height="9" rx="1"/></svg>,
    warning:     <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={s}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    report:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/></svg>,
    download:    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    check:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={s}><polyline points="20 6 9 17 4 12"/></svg>,
    arrow_right: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" style={s}><polyline points="9 18 15 12 9 6"/></svg>,
    medal1:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={s}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    flag:        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={s}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    signout:     <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  }
  return paths[name] || null
}

const CR = '#7D1025', GD = '#C9A030', CREAM = '#FBFAF5'
const LINE = '#E8E2D6', S900 = '#1A0F0E', S500 = '#6B6B6B', S400 = '#9A9A9A'

const money = n => Number(n||0).toFixed(0)
const pct   = n => n===null||n===undefined ? '—' : Math.round(n)+'%'

function gradeColor(score) {
  if (score===null) return S400
  if (score>=80) return '#065F46'
  if (score>=70) return '#1E40AF'
  if (score>=60) return '#92400E'
  if (score>=50) return '#6B21A8'
  if (score>=40) return '#9A3412'
  return '#991B1B'
}
function gradeLetter(score) {
  if (score===null) return '—'
  if (score>=80) return 'A*'
  if (score>=70) return 'B'
  if (score>=60) return 'C'
  if (score>=50) return 'D'
  if (score>=40) return 'E'
  return 'U'
}

const inp = { padding:'8px 11px', borderRadius:7, border:'1.5px solid '+LINE, fontSize:13, fontFamily:'inherit', background:'#fff' }
const Kpi = ({ label, val, sub, color=CR, big=false }) => (
  <div style={{ background:'#fff', border:'1px solid '+LINE, borderRadius:12, padding:'16px 18px' }}>
    <div style={{ fontSize:11, fontWeight:700, color:S400, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>{label}</div>
    <div style={{ fontSize:big?20:26, fontWeight:800, color, lineHeight:1 }}>{val}</div>
    {sub && <div style={{ fontSize:11, color:S500, marginTop:4 }}>{sub}</div>}
  </div>
)

export default function DOSPortal() {
  const toast = useToast()
  const [page, setPage] = useState('overview')

  const NAV = [
    { id:'overview',     label:'Overview',            icon:'chart'   },
    { id:'exams',        label:'Exam Analytics',      icon:'exam'    },
    { id:'homework',     label:'Homework Compliance', icon:'homework'},
    { id:'trends',       label:'Student Trends',      icon:'trend'   },
    { id:'class',        label:'Class Performance',   icon:'trophy'  },
    { id:'atrisk',       label:'At-Risk Students',    icon:'warning' },
    { id:'reports',      label:'Reports',             icon:'report'  },
  ]

  const { user, logout } = useAuth()

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:CREAM, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width:220, background:'linear-gradient(180deg,#7D1025 0%,#5A0B1B 100%)', display:'flex', flexDirection:'column', flexShrink:0, position:'fixed', top:0, bottom:0, zIndex:10 }}>
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <div style={{ fontSize:18, fontWeight:800, color:'#fff', letterSpacing:-.3 }}>Smart<em style={{ fontStyle:'italic', color:GD }}>ious</em></div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', letterSpacing:'.12em', textTransform:'uppercase', marginTop:2 }}>Dean of Studies</div>
        </div>
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              padding:'10px 12px', borderRadius:8, border:'none', cursor:'pointer',
              background: page===n.id ? 'rgba(255,255,255,.15)' : 'transparent',
              color: page===n.id ? '#fff' : 'rgba(255,255,255,.6)',
              fontSize:13, fontWeight: page===n.id ? 700 : 500,
              marginBottom:2, textAlign:'left',
              borderLeft: page===n.id ? '3px solid '+GD : '3px solid transparent',
            }}>
              <Icon name={n.icon} size={15} color={page===n.id?'#fff':'rgba(255,255,255,.6)'}/>
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:12, borderTop:'1px solid rgba(255,255,255,.1)' }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginBottom:4 }}>{user?.firstName} {user?.lastName}</div>
          <button onClick={logout} style={{ fontSize:11, color:'rgba(255,255,255,.4)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:5 }}>
            <Icon name="signout" size={12} color="rgba(255,255,255,.4)"/> Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft:220, flex:1, padding:'28px 36px', maxWidth:1400, width:'100%' }}>
        {page==='overview'  && <DOSOverview  toast={toast}/>}
        {page==='exams'     && <ExamAnalytics toast={toast}/>}
        {page==='homework'  && <HomeworkCompliance toast={toast}/>}
        {page==='trends'    && <StudentTrends toast={toast}/>}
        {page==='class'     && <ClassPerformance toast={toast}/>}
        {page==='atrisk'    && <AtRiskStudents toast={toast}/>}
        {page==='reports'   && <DOSReports toast={toast}/>}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Overview ───────────────────────────────────────────────
function DOSOverview({ toast }) {
  const [d, setD] = useState(null), [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/dos/overview')
      .then(r => setD(r.data?.data))
      .catch(() => toast?.error?.('Failed to load overview.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner/>
  if (!d) return null

  return (
    <>
      <h1 style={{ fontSize:26, fontWeight:800, color:S900, marginBottom:4 }}>Dean of Studies</h1>
      <div style={{ fontSize:13, color:S500, marginBottom:24 }}>Academic performance overview across all students and subjects.</div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:28 }}>
        <Kpi label="Active students"     val={d.totalStudents}        color={CR}/>
        <Kpi label="Teachers"            val={d.totalTeachers}        color='#1E40AF'/>
        <Kpi label="Exams this month"    val={d.examsThisMonth}       color='#6B21A8'/>
        <Kpi label="Avg exam score"      val={d.avgExamScore!==null?d.avgExamScore+'%':'—'} color={gradeColor(d.avgExamScore)}/>
        <Kpi label="HW compliance"       val={d.hwComplianceRate!==null?d.hwComplianceRate+'%':'—'} color={d.hwComplianceRate>=80?'#065F46':d.hwComplianceRate>=60?'#D97706':'#991B1B'}/>
        <Kpi label="Attendance (7 days)" val={d.attendanceRate!==null?d.attendanceRate+'%':'—'} color={d.attendanceRate>=80?'#065F46':d.attendanceRate>=60?'#D97706':'#991B1B'}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <Card title="Homework tracking">
          <StatRow label="Homework sets this month" val={d.hwThisMonth}/>
          <StatRow label="Graded submissions" val={d.hwGraded}/>
          <StatRow label="Compliance rate" val={d.hwComplianceRate!==null?d.hwComplianceRate+'%':'—'} color={d.hwComplianceRate>=70?'#065F46':'#991B1B'}/>
        </Card>
        <Card title="Attendance this week">
          <StatRow label="Records logged" val={d.attendanceRecordsThisWeek}/>
          <StatRow label="Attendance rate" val={d.attendanceRate!==null?d.attendanceRate+'%':'—'} color={d.attendanceRate>=80?'#065F46':d.attendanceRate>=60?'#D97706':'#991B1B'}/>
        </Card>
      </div>
    </>
  )
}

// ── Exam Analytics ─────────────────────────────────────────
function ExamAnalytics({ toast }) {
  const [d, setD] = useState(null), [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ termStart:'', termEnd:'', curriculum:'', subject:'', grade:'' })

  const load = useCallback(() => {
    setLoading(true)
    api.get('/dos/exam-analytics', { params: filters })
      .then(r => setD(r.data?.data))
      .catch(() => toast?.error?.('Failed to load exam analytics.'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  const GRADE_KEYS = ['A*','B','C','D','E','U']
  const GRADE_COLS = { 'A*':'#065F46','B':'#1E40AF','C':'#92400E','D':'#6B21A8','E':'#9A3412','U':'#991B1B' }

  return (
    <>
      <PageHeader title="Exam Analytics" sub="Subject-by-subject performance across all students." />
      <Filters filters={filters} setFilters={setFilters} onApply={load} showSubject showCurriculum showGrade showDates/>

      {loading ? <Spinner/> : !d ? null : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <Kpi label="Exams in period"   val={d.totalExams}/>
            <Kpi label="Total submissions" val={d.totalSubmissions}/>
            <Kpi label="Subjects tracked"  val={d.subjects?.length}/>
          </div>

          {(d.subjects||[]).map(s => (
            <div key={s.subject} style={{ background:'#fff', border:'1px solid '+LINE, borderRadius:12, marginBottom:14, overflow:'hidden' }}>
              <div style={{ padding:'12px 18px', borderBottom:'1px solid '+LINE, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:S900 }}>{s.subject}</div>
                  <div style={{ fontSize:11.5, color:S500 }}>{s.curriculum} · {s.grade} · {s.totalStudents} students</div>
                </div>
                <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:28, fontWeight:900, color:gradeColor(s.avgScore), lineHeight:1 }}>{s.avgScore!==null?s.avgScore+'%':'—'}</div>
                    <div style={{ fontSize:10, color:S400 }}>Class avg</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:20, fontWeight:800, color:gradeColor(s.avgScore) }}>{gradeLetter(s.avgScore)}</div>
                    <div style={{ fontSize:10, color:S400 }}>Grade</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:16, fontWeight:700, color:s.passRate>=60?'#065F46':'#991B1B' }}>{s.passRate!==null?s.passRate+'%':'—'}</div>
                    <div style={{ fontSize:10, color:S400 }}>Pass rate</div>
                  </div>
                </div>
              </div>

              {/* Grade distribution bar */}
              <div style={{ padding:'10px 18px', borderBottom:'1px solid '+LINE }}>
                <div style={{ fontSize:10, fontWeight:700, color:S400, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Grade distribution</div>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  {GRADE_KEYS.map(g => {
                    const count = s.gradeDistribution[g] || 0
                    const total = Object.values(s.gradeDistribution).reduce((a,b)=>a+b,0)
                    const w = total>0 ? (count/total)*100 : 0
                    return w>0 ? (
                      <div key={g} style={{ flex:w, height:24, background:GRADE_COLS[g], borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', minWidth:28 }}>
                        <span style={{ fontSize:9.5, fontWeight:800, color:'#fff' }}>{g} ({count})</span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>

              {/* Exam list */}
              <div style={{ padding:'10px 18px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:S400, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Exams</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {s.exams.map((e,i) => (
                    <div key={i} style={{ background:CREAM, border:'1px solid '+LINE, borderRadius:8, padding:'6px 12px', minWidth:100 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:S900 }}>{e.title}</div>
                      <div style={{ fontSize:10, color:S500 }}>{new Date(e.date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
                      <div style={{ fontSize:13, fontWeight:800, color:gradeColor(e.avg), marginTop:2 }}>{e.avg!==null?e.avg+'%':'—'}</div>
                      <div style={{ fontSize:9.5, color:S400 }}>{e.students} students</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  )
}

// ── Homework Compliance ─────────────────────────────────────
function HomeworkCompliance({ toast }) {
  const [d, setD] = useState(null), [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ termStart:'', termEnd:'', subject:'', curriculum:'' })

  const load = useCallback(() => {
    setLoading(true)
    api.get('/dos/homework-compliance', { params: filters })
      .then(r => setD(r.data?.data))
      .catch(() => toast?.error?.('Failed to load homework compliance.'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  return (
    <>
      <PageHeader title="Homework Compliance" sub="Every lesson taught should have homework set, submitted and marked." />
      <Filters filters={filters} setFilters={setFilters} onApply={load} showSubject showCurriculum showDates/>

      {loading ? <Spinner/> : !d ? null : (
        <>
          {/* Summary */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            <Kpi label="Teachers tracked" val={(d.teachers||[]).length}/>
            <Kpi label="Fully compliant" val={(d.teachers||[]).filter(t=>t.complianceScore>=90).length} color='#065F46'/>
            <Kpi label="Needs attention" val={(d.teachers||[]).filter(t=>t.complianceScore<70).length} color='#991B1B'/>
            <Kpi label="Avg marking rate" val={(() => { const t=(d.teachers||[]).filter(t=>t.markingRate!==null); return t.length?Math.round(t.reduce((s,x)=>s+x.markingRate,0)/t.length)+'%':'—' })()}/>
          </div>

          {/* Teacher table */}
          <div style={{ background:'#fff', border:'1px solid '+LINE, borderRadius:12, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:CREAM }}>
                  {['Teacher','Lessons taught','HW set','Lessons with HW','Lessons missing HW','Submissions','Marking rate','Compliance'].map(h=>(
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:10.5, fontWeight:700, color:CR, textTransform:'uppercase', letterSpacing:'.04em', borderBottom:'1.5px solid '+LINE }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(d.teachers||[]).map(t => {
                  const cs = t.complianceScore
                  const csColor = cs>=90?'#065F46':cs>=70?'#D97706':'#991B1B'
                  return (
                    <tr key={String(t.teacherId)} style={{ borderTop:'1px solid '+LINE }}>
                      <td style={{ padding:'10px 12px', fontWeight:700, fontSize:13 }}>{t.teacherName}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center' }}>{t.totalLessons}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center' }}>{t.homeworkSet}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center', color:'#065F46', fontWeight:700 }}>{t.lessonsWithHW}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center', color:t.lessonsWithoutHW>0?'#991B1B':S400, fontWeight:t.lessonsWithoutHW>0?700:400 }}>
                        {t.lessonsWithoutHW>0 ? (
                          <span title={t.missingHWLessons.map(l=>l.title).join(', ')} style={{ cursor:'help', borderBottom:'1px dashed #991B1B' }}>
                            {t.lessonsWithoutHW} missing
                          </span>
                        ) : 'All covered'}
                      </td>
                      <td style={{ padding:'10px 12px', textAlign:'center' }}>{t.totalSubmissions}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center', fontWeight:700, color:t.markingRate>=80?'#065F46':t.markingRate>=60?'#D97706':'#991B1B' }}>
                        {t.markingRate!==null?t.markingRate+'%':'—'}
                      </td>
                      <td style={{ padding:'10px 12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ flex:1, height:8, background:'#F3F4F6', borderRadius:99 }}>
                            <div style={{ width:(cs||0)+'%', height:'100%', background:csColor, borderRadius:99, transition:'width .3s' }}/>
                          </div>
                          <span style={{ fontSize:12, fontWeight:700, color:csColor, minWidth:36 }}>{cs!==null?cs+'%':'—'}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

// ── Student Trends ─────────────────────────────────────────
function StudentTrends({ toast }) {
  const [d, setD] = useState(null), [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ termStart:'', termEnd:'', curriculum:'', subject:'', grade:'' })

  const load = useCallback(() => {
    setLoading(true)
    api.get('/dos/student-trends', { params: filters })
      .then(r => setD(r.data?.data))
      .catch(() => toast?.error?.('Failed to load trends.'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  return (
    <>
      <PageHeader title="Student Performance Trends" sub="Individual student trajectory across exams, attendance and homework." />
      <Filters filters={filters} setFilters={setFilters} onApply={load} showCurriculum showGrade showDates showSubject/>

      {loading ? <Spinner/> : !d ? null : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {(d.students||[]).map(s => {
            const rc = s.riskLevel==='high'?'#991B1B':s.riskLevel==='medium'?'#92400E':'#065F46'
            const rb = s.riskLevel==='high'?'#FEE2E2':s.riskLevel==='medium'?'#FEF9C3':'#D1FAE5'
            const scores = s.trend.filter(t=>!t.absent&&t.score!==null)
            const maxScore = Math.max(...scores.map(t=>t.score), 1)

            return (
              <div key={String(s.studentId)} style={{ background:'#fff', border:'1px solid '+LINE, borderRadius:12, overflow:'hidden' }}>
                {/* Student header */}
                <div style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid '+LINE }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:S900 }}>{s.studentName}</div>
                    <div style={{ fontSize:11.5, color:S500 }}>{s.curriculum} · {s.grade} · Adm: {s.admissionNo}</div>
                  </div>
                  <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:22, fontWeight:900, color:gradeColor(s.avg) }}>{s.avg!==null?s.avg+'%':'—'}</div>
                      <div style={{ fontSize:10, color:S400 }}>Avg score</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:16, fontWeight:700, color:s.attRate>=80?'#065F46':s.attRate>=60?'#D97706':'#991B1B' }}>{s.attRate!==null?s.attRate+'%':'—'}</div>
                      <div style={{ fontSize:10, color:S400 }}>Attendance</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:16, fontWeight:700 }}>{s.hwSubmissions}</div>
                      <div style={{ fontSize:10, color:S400 }}>HW submitted</div>
                    </div>
                    <span style={{ padding:'4px 10px', borderRadius:99, background:rb, color:rc, fontSize:11, fontWeight:700 }}>
                      {s.riskLevel==='high'?'High risk':s.riskLevel==='medium'?'Medium':'On track'}
                    </span>
                  </div>
                </div>

                {/* Mini trend chart */}
                {scores.length > 1 && (
                  <div style={{ padding:'10px 16px' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:S400, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Score trend</div>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:48 }}>
                      {s.trend.map((t,i) => (
                        <div key={i} title={`${t.title}: ${t.score!==null?t.score+'%':'absent'}`}
                          style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                          <div style={{
                            width:'100%', minWidth:6,
                            height: t.score!==null ? Math.max(4,(t.score/100)*48) : 4,
                            background: t.score!==null ? gradeColor(t.score) : '#F3F4F6',
                            borderRadius:'2px 2px 0 0',
                            opacity: t.absent&&t.score===null ? 0.3 : 1,
                          }}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {(d.students||[]).length===0 && <EmptyState msg="No student data found for selected filters."/>}
        </div>
      )}
    </>
  )
}

// ── Class Performance ──────────────────────────────────────
function ClassPerformance({ toast }) {
  const [d, setD] = useState(null), [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ curriculum:'Cambridge IGCSE', grade:'', subject:'', termStart:'', termEnd:'' })

  const load = useCallback(() => {
    if (!filters.curriculum) return
    setLoading(true)
    api.get('/dos/class-performance', { params: filters })
      .then(r => setD(r.data?.data))
      .catch(() => toast?.error?.('Failed to load class performance.'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  return (
    <>
      <PageHeader title="Class Performance" sub="Compare all students in the same curriculum and grade side by side." />
      <Filters filters={filters} setFilters={setFilters} onApply={load} showCurriculum showGrade showSubject showDates required={['curriculum']}/>

      {loading ? <Spinner/> : !d ? null : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            <Kpi label="Students"    val={d.totalStudents}/>
            <Kpi label="Class avg"   val={d.classAvg!==null?d.classAvg+'%':'—'} color={gradeColor(d.classAvg)}/>
            <Kpi label="Mean grade"  val={gradeLetter(d.classAvg)} color={gradeColor(d.classAvg)}/>
            <Kpi label="Curriculum"  val={d.curriculum} color='#1E40AF'/>
          </div>

          {/* Grade distribution */}
          <div style={{ background:'#fff', border:'1px solid '+LINE, borderRadius:12, padding:18, marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:S900, marginBottom:12 }}>Grade distribution</div>
            <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:80 }}>
              {Object.entries(d.gradeDistribution).map(([g,count]) => {
                const total = Object.values(d.gradeDistribution).reduce((a,b)=>a+b,0)
                const h = total>0 ? Math.max(6,(count/total)*80) : 0
                const COLS = {'A*':'#065F46',B:'#1E40AF',C:'#92400E',D:'#6B21A8',E:'#9A3412',U:'#991B1B'}
                return (
                  <div key={g} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:COLS[g]||S400 }}>{count}</div>
                    <div style={{ width:'100%', height:h, background:COLS[g]||'#F3F4F6', borderRadius:'3px 3px 0 0' }}/>
                    <div style={{ fontSize:10, fontWeight:700, color:COLS[g]||S400 }}>{g}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{ background:'#fff', border:'1px solid '+LINE, borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid '+LINE, fontWeight:800, fontSize:13, color:S900 }}>Student rankings</div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:CREAM }}>
                {['Rank','Student','Adm No.','Avg score','Grade','Exams sat'].map(h=>(
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:CR, textTransform:'uppercase', letterSpacing:'.04em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(d.students||[]).map((s,i) => (
                  <tr key={String(s._id)} style={{ borderTop:'1px solid '+LINE, background:i===0?'#FFF9E6':i===1?'#F9FEFF':i===2?'#FFF6F6':'transparent' }}>
                    <td style={{ padding:'10px 12px', fontWeight:800, color:i===0?GD:i<3?S900:S400, fontSize:i===0?16:13 }}>
                      {i===0?'1st':i===1?'2nd':i===2?'3rd':`#${i+1}`}
                    </td>
                    <td style={{ padding:'10px 12px', fontWeight:700 }}>{s.firstName} {s.lastName}</td>
                    <td style={{ padding:'10px 12px', color:S500, fontSize:12 }}>{s.admissionNo}</td>
                    <td style={{ padding:'10px 12px', fontWeight:800, color:gradeColor(s.avg), fontSize:15 }}>{s.avg!==null?s.avg+'%':'—'}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:99, fontSize:12, fontWeight:800,
                        background:gradeColor(s.avg)+'15', color:gradeColor(s.avg) }}>
                        {gradeLetter(s.avg)}
                      </span>
                    </td>
                    <td style={{ padding:'10px 12px', color:S500 }}>{s.examsAttempted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

// ── At-Risk Students ───────────────────────────────────────
function AtRiskStudents({ toast }) {
  const [d, setD] = useState(null), [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ termStart:'', termEnd:'' })

  const load = useCallback(() => {
    setLoading(true)
    api.get('/dos/at-risk', { params: filters })
      .then(r => setD(r.data?.data))
      .catch(() => toast?.error?.('Failed to load at-risk data.'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  const FLAG_ICONS = {}

  return (
    <>
      <PageHeader title="At-Risk Students" sub="Students flagged for low scores, poor attendance or missing exams." />
      <Filters filters={filters} setFilters={setFilters} onApply={load} showDates/>

      {loading ? <Spinner/> : !d ? null : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <Kpi label="At-risk students" val={d.totalAtRisk} color='#991B1B'/>
            <Kpi label="High risk"  val={(d.students||[]).filter(s=>s.riskLevel==='high').length}  color='#991B1B'/>
            <Kpi label="Medium risk" val={(d.students||[]).filter(s=>s.riskLevel==='medium').length} color='#D97706'/>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {(d.students||[]).map(s => (
              <div key={String(s.studentId)} style={{ background:'#fff', border:'2px solid '+(s.riskLevel==='high'?'#FCA5A5':'#FDE68A'), borderRadius:12, padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:S900 }}>{s.studentName}</div>
                    <div style={{ fontSize:11.5, color:S500, marginTop:2 }}>{s.curriculum} · {s.grade} · Adm: {s.admissionNo}</div>
                  </div>
                  <span style={{ padding:'4px 12px', borderRadius:99, fontSize:11, fontWeight:700,
                    background:s.riskLevel==='high'?'#FEE2E2':'#FEF9C3',
                    color:s.riskLevel==='high'?'#991B1B':'#92400E' }}>
                    {s.riskLevel==='high'?'High risk':'Medium risk'}
                  </span>
                </div>
                <div style={{ display:'flex', gap:20, marginTop:12, flexWrap:'wrap' }}>
                  {s.avg!==null&&<div><div style={{ fontSize:10, color:S400 }}>Avg score</div><div style={{ fontSize:18, fontWeight:800, color:gradeColor(s.avg) }}>{s.avg}%</div></div>}
                  {s.attRate!==null&&<div><div style={{ fontSize:10, color:S400 }}>Attendance</div><div style={{ fontSize:18, fontWeight:700, color:s.attRate<60?'#991B1B':'#D97706' }}>{s.attRate}%</div></div>}
                  <div><div style={{ fontSize:10, color:S400 }}>Exams attempted</div><div style={{ fontSize:18, fontWeight:700 }}>{s.examsAttempted}</div></div>
                </div>
                <div style={{ marginTop:10, display:'flex', gap:8, flexWrap:'wrap' }}>
                  {s.flags.map((f,i) => (
                    <span key={i} style={{ fontSize:12, background:s.riskLevel==='high'?'#FEE2E2':'#FEF9C3', color:s.riskLevel==='high'?'#991B1B':'#92400E', padding:'3px 10px', borderRadius:99, fontWeight:600 }}>
                      {''} {f.msg}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {(d.students||[]).length===0 && <EmptyState msg="No at-risk students found in this period."/>}
          </div>
        </>
      )}
    </>
  )
}

// ── Reports (links to report generator) ───────────────────
function DOSReports({ toast }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/reports', { params: { limit:50 } })
      .then(r => setReports(r.data?.data?.reports || []))
      .catch(() => toast?.error?.('Failed to load reports.'))
      .finally(() => setLoading(false))
  }, [])

  const downloadPdf = async (id) => {
    try {
      const { data } = await api.get('/reports/'+id+'/pdf-html')
      if (data.success) {
        const w = window.open('','_blank')
        w.document.write(data.data.html); w.document.close()
      }
    } catch { toast?.error?.('Could not load report.') }
  }

  const GRADE_COLORS = {'A*':'#065F46',A:'#065F46',B:'#1E40AF',C:'#92400E',D:'#6B21A8',E:'#9A3412',U:'#991B1B'}

  return (
    <>
      <PageHeader title="Academic Reports" sub="View and download end-of-term reports generated by Admin/Ops." />
      {loading ? <Spinner/> : (
        <div style={{ background:'#fff', border:'1px solid '+LINE, borderRadius:12, overflow:'hidden' }}>
          {reports.length===0 ? <EmptyState msg="No reports generated yet."/> : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:CREAM }}>
                {['Student','Term','Year','Curriculum','Grade','Mean','Avg','Status',''].map(h=>(
                  <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:CR, textTransform:'uppercase', letterSpacing:'.04em', borderBottom:'1.5px solid '+LINE }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {reports.map(r => {
                  const gc = GRADE_COLORS[r.meanGrade]||S400
                  return (
                    <tr key={r._id} style={{ borderTop:'1px solid '+LINE }}>
                      <td style={{ padding:'10px 14px', fontWeight:700, fontSize:13 }}>{r.studentName}</td>
                      <td style={{ padding:'10px 14px', fontSize:12.5 }}>Term {r.term}</td>
                      <td style={{ padding:'10px 14px', fontSize:12.5, color:S500 }}>{r.academicYear}</td>
                      <td style={{ padding:'10px 14px', fontSize:12.5, color:S500 }}>{r.curriculum}</td>
                      <td style={{ padding:'10px 14px', fontSize:12.5, color:S500 }}>{r.yearGrade}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ padding:'2px 8px', borderRadius:99, fontSize:12, fontWeight:800, background:gc+'15', color:gc }}>{r.meanGrade||'—'}</span>
                      </td>
                      <td style={{ padding:'10px 14px', fontWeight:700 }}>{r.overallAverage!==null?r.overallAverage+'%':'—'}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
                          background:r.status==='published'?'#D1FAE5':'#FEF3C7',
                          color:r.status==='published'?'#065F46':'#92400E' }}>
                          {r.status==='published'?'Published':'Draft'}
                        </span>
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        <button onClick={()=>downloadPdf(r._id)}
                          style={{ background:CR, color:'#fff', border:'none', padding:'5px 12px', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  )
}

// ── Shared helpers ─────────────────────────────────────────
function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom:20 }}>
      <h2 style={{ fontSize:22, fontWeight:800, color:S900, margin:'0 0 4px' }}>{title}</h2>
      <div style={{ fontSize:13, color:S500 }}>{sub}</div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background:'#fff', border:'1px solid '+LINE, borderRadius:12, padding:18 }}>
      {title && <div style={{ fontSize:12, fontWeight:800, color:S900, marginBottom:12, paddingBottom:8, borderBottom:'1px solid '+LINE }}>{title}</div>}
      {children}
    </div>
  )
}

function StatRow({ label, val, color }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid '+LINE, fontSize:13 }}>
      <span style={{ color:S500 }}>{label}</span>
      <span style={{ fontWeight:700, color:color||S900 }}>{val}</span>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ padding:'60px 0', textAlign:'center' }}>
      <div style={{ width:36, height:36, border:'3px solid #F0EBE6', borderTopColor:CR, borderRadius:'50%', animation:'spin .75s linear infinite', margin:'0 auto' }}/>
    </div>
  )
}

function EmptyState({ msg }) {
  return <div style={{ padding:'40px 0', textAlign:'center', color:S400, fontSize:13 }}>{msg}</div>
}

function Filters({ filters, setFilters, onApply, showDates, showSubject, showCurriculum, showGrade }) {
  const set = (k,v) => setFilters(p=>({...p,[k]:v}))
  return (
    <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap', alignItems:'center', background:'#fff', border:'1px solid '+LINE, borderRadius:10, padding:'12px 14px' }}>
      {showDates && <>
        <input type="date" value={filters.termStart||''} onChange={e=>set('termStart',e.target.value)} style={{ ...inp, fontSize:12.5 }} title="Term start"/>
        <span style={{ fontSize:12, color:S400 }}>to</span>
        <input type="date" value={filters.termEnd||''} onChange={e=>set('termEnd',e.target.value)} style={{ ...inp, fontSize:12.5 }} title="Term end"/>
      </>}
      {showCurriculum && (
        <select value={filters.curriculum||''} onChange={e=>set('curriculum',e.target.value)} style={{ ...inp, fontSize:12.5 }}>
          <option value="">All curricula</option>
          {['Cambridge IGCSE','Edexcel','A-Level','IB','CBC','American','BNC'].map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      )}
      {showGrade && <input value={filters.grade||''} onChange={e=>set('grade',e.target.value)} placeholder="Grade e.g. Year 10" style={{ ...inp, width:140 }}/>}
      {showSubject && <input value={filters.subject||''} onChange={e=>set('subject',e.target.value)} placeholder="Subject" style={{ ...inp, width:140 }}/>}
      <button onClick={onApply} style={{ background:CR, color:'#fff', border:'none', padding:'8px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>Apply</button>
      <button onClick={()=>{ setFilters(Object.fromEntries(Object.keys(filters).map(k=>[k,'']))); setTimeout(onApply,50) }}
        style={{ background:'transparent', border:'1px solid '+LINE, color:S500, padding:'8px 12px', borderRadius:7, fontSize:12, cursor:'pointer' }}>Reset</button>
    </div>
  )
}
