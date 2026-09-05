import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'

/**
 * DOSPerformanceModule: the DOS's evidence room.
 * School -> grades -> teachers -> students, every table downloadable as
 * CSV and the whole thing printable as one branded report for in-person
 * analysis with the Operations Manager and the CEO. Every metric states
 * its method, and attendance always reads attended-of-scheduled.
 */
const fmtD = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const V = ({ v, s = '%' }) => (v === null || v === undefined ? <span style={{ color: TOKENS.s400 }}>&ndash;</span> : <>{v}{s}</>)
const attCol = (p) => (p === null || p === undefined ? TOKENS.s400 : p >= 85 ? '#15803D' : p >= 70 ? '#D97706' : '#B91C1C')

const toCSV = (headers, rows) => {
  const esc = (x) => { const t = x === null || x === undefined ? '' : String(x); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t }
  return [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n')
}
const download = (name, text) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  a.download = name; a.click(); URL.revokeObjectURL(a.href)
}

export default function DOSPerformanceModule({ toast }) {
  const today = new Date().toISOString().split('T')[0]
  const ago90 = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString().split('T')[0]
  const [from, setFrom] = useState(ago90)
  const [to, setTo] = useState(today)
  const [school, setSchool] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [risk, setRisk] = useState(null)
  const [gradeOpen, setGradeOpen] = useState(null)   // { grade, rows }
  const [qb, setQb] = useState(null)
  const [qbTarget, setQbTarget] = useState(() => { try { return Number(localStorage.getItem('sm_qb_target')) || 10 } catch (e) { return 10 } })
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = { from, to }
    Promise.all([
      api.get('/dos-reports/school', { params }),
      api.get('/dos-reports/teachers', { params }),
      api.get('/mastery/overview'),
      api.get('/dos-reports/question-bank'),
    ]).then(([s, t, m, q]) => {
      setQb(q.data?.data || null)
      setSchool(s.data?.data || null)
      setTeachers(t.data?.data?.rows || [])
      const rows = m.data?.data?.rows || []
      setRisk({ high: rows.filter(r => r.risk === 'high').length, watch: rows.filter(r => r.risk === 'watch').length, byGrade: rows.reduce((acc, r) => { if (r.risk !== 'ok') { acc[r.grade || 'Unassigned'] = (acc[r.grade || 'Unassigned'] || 0) + 1 } return acc }, {}) })
    }).catch(() => toast?.error?.('Could not load the performance data.'))
      .finally(() => setLoading(false))
  }, [from, to])
  useEffect(() => { load() }, [load])

  useEffect(() => { try { localStorage.setItem('sm_qb_target', String(qbTarget)) } catch (e) { /* noop */ } }, [qbTarget])

  const openGrade = async (g) => {
    try { const r = await api.get('/dos-reports/grade/' + encodeURIComponent(g), { params: { from, to } }); setGradeOpen(r.data?.data) }
    catch { toast?.error?.('Could not load the grade breakdown.') }
  }

  const printReport = () => {
    if (!school) return
    const k = school.kpis
    const row = (cells) => '<tr>' + cells.map(c => `<td>${c ?? '&ndash;'}</td>`).join('') + '</tr>'
    const table = (title, headers, rows) => `<h2>${title}</h2><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`
    const html = `<!doctype html><html><head><title>Smartious Academic Performance Report</title><style>
      body{font-family:Georgia,serif;color:#1a1a1a;margin:40px;line-height:1.5}
      h1{font-size:24px;margin:0;color:#7D1025} .sub{color:#666;font-size:12px;margin-bottom:24px}
      h2{font-size:15px;margin:26px 0 8px;color:#7D1025;border-bottom:2px solid #C9A030;padding-bottom:4px}
      table{width:100%;border-collapse:collapse;font-size:11.5px}
      th{text-align:left;background:#F7F2EA;padding:6px 8px;border:1px solid #ddd}
      td{padding:5px 8px;border:1px solid #ddd}
      .kpis{display:flex;gap:24px;margin:16px 0} .kpi b{font-size:20px;display:block}
      .method{font-size:10px;color:#777;margin-top:20px;border-top:1px solid #ddd;padding-top:8px}
      @media print { body{margin:16px} }
    </style></head><body>
      <h1>Smartious Homeschool: Academic Performance Report</h1>
      <div class="sub">Window: ${fmtD(school.window.from)} to ${fmtD(school.window.to)} &middot; Generated ${fmtD(new Date())} &middot; Prepared by the Dean of Studies</div>
      <div class="kpis">
        <div class="kpi"><b>${k.students}</b>Active students</div>
        <div class="kpi"><b>${k.sessionsHeld}</b>Lessons held</div>
        <div class="kpi"><b>${k.attendancePct ?? '&ndash;'}%</b>Attendance (${k.attended} of ${k.scheduled})</div>
        <div class="kpi"><b>${k.examAvg ?? '&ndash;'}%</b>Exam average (${k.examsGraded} graded)</div>
        <div class="kpi"><b>${(risk?.high || 0)}</b>Students at risk</div>
      </div>
      ${table('Performance by grade', ['Grade', 'Students', 'Attendance', 'Attended/Scheduled', 'Exam avg', 'Exams', 'Quiz acc.', 'HW subs', 'Flagged'],
        school.grades.map(g => row([g.grade, g.students, g.attendancePct !== null ? g.attendancePct + '%' : null, `${g.attended}/${g.scheduled}`, g.examAvg !== null ? g.examAvg + '%' : null, g.examN, g.quizAcc !== null ? g.quizAcc + '%' : null, g.hwSubmissions, risk?.byGrade?.[g.grade] || 0])))}
      ${table('Performance by subject', ['Subject', 'Exam avg', 'Exams graded', 'Lessons held'],
        school.subjects.map(s => row([s.subject, s.examAvg !== null ? s.examAvg + '%' : null, s.examN, s.sessionsHeld])))}
      ${table('Teacher accountability', ['Teacher', 'Lessons held', 'Class attendance', 'Exam avg', 'Exams', 'Marking (days)', 'Rating'],
        teachers.map(t => row([t.name, t.sessionsHeld, t.classAttendancePct !== null ? t.classAttendancePct + '%' : null, t.examAvg !== null ? t.examAvg + '%' : null, t.examN, t.markingDays, t.rating !== null ? t.rating + '/5 (' + t.ratingN + ')' : null])))}
      ${qb ? table('Question bank: teacher output (weekly target ' + qbTarget + ')', ['Teacher', 'This week', 'Weekly avg (8w)', 'Total (8w)', 'vs target'],
        qb.teachers.map(t => row([t.name, t.thisWeek, t.weeklyAvg, t.total8w, t.thisWeek >= qbTarget ? 'On target' : (qbTarget - t.thisWeek) + ' short']))) : ''}
      ${qb ? table('Question bank: debts', ['Category', 'Subject', 'Count'],
        [...qb.pendingArtwork.map(r => row(['Pending artwork', r.subject, r.n])),
         ...qb.missingScheme.map(r => row(['Missing marking scheme', r.subject, r.n])),
         ...qb.subjectCounts.slice(0, 10).map(r => row(['Thinnest subjects', r.subject, r.n]))]) : ''}
      ${gradeOpen ? table('Grade detail: ' + gradeOpen.grade, ['Student', 'Attended/Scheduled', 'Attendance', 'Exam avg', 'Exams', 'Quiz acc.'],
        gradeOpen.rows.map(s => row([s.name, `${s.attended}/${s.scheduled}`, s.attendancePct !== null ? s.attendancePct + '%' : null, s.examAvg !== null ? s.examAvg + '%' : null, s.examN, s.quizAcc !== null ? s.quizAcc + '%' : null]))) : ''}
      <div class="method"><b>Method.</b> ${school.method} Teacher metrics: ${'sessions and class attendance from the teacher\'s own ended lesson classes; exam average and marking turnaround from exams they set; ratings all-time.'} Smartious Homeschool &middot; Est. 2018 &middot; smartioushomeschool.com</div>
    <script>window.onload = () => window.print()</script></body></html>`
    const w = window.open('', '_blank')
    if (!w) return toast?.error?.('Allow pop-ups to print the report.')
    w.document.write(html); w.document.close()
  }

  const th = { padding: '8px 11px', textAlign: 'left', fontSize: 10.5, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.s500, borderBottom: `1.5px solid ${TOKENS.line}` }
  const td = { padding: '9px 11px', fontSize: 12.5, color: TOKENS.s800, borderBottom: `1px solid ${TOKENS.line}` }
  const card = { background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, overflow: 'auto' }
  const csvBtn = (onClick) => (
    <button onClick={onClick} style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${TOKENS.line}`, background: '#fff', color: TOKENS.s600, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>CSV</button>
  )
  const secHead = (title, extra) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}>
      <b style={{ fontSize: 14.5, color: TOKENS.s900 }}>{title}</b>
      <span style={{ flex: 1 }} />{extra}
    </div>
  )

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: TOKENS.s500 }}>Building the evidence...</div>
  if (!school) return <div style={{ padding: 40, textAlign: 'center', color: TOKENS.s500 }}>No data for this window.</div>
  const k = school.kpis

  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: TOKENS.s900, margin: 0 }}>Performance & Reports</h2>
          <p style={{ fontSize: 13, color: TOKENS.s500, margin: '4px 0 0' }}>
            School, grade, teacher and student, on factual denominators: attendance is attended-of-scheduled, never a percentage of only-the-recorded days.
          </p>
        </div>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '8px 10px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 9, fontSize: 12.5 }} />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '8px 10px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 9, fontSize: 12.5 }} />
        <button onClick={printReport} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>Print full report</button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[['Active students', k.students, ''], ['Lessons held', k.sessionsHeld, ''],
          ['Attendance', k.attendancePct ?? '\u2013', k.attendancePct !== null ? `% (${k.attended} of ${k.scheduled})` : ''],
          ['Exam average', k.examAvg ?? '\u2013', k.examAvg !== null ? `% (${k.examsGraded} graded)` : ''],
          ['At risk', risk?.high ?? 0, ` students (${risk?.watch ?? 0} on watch)`]].map(([l, v, s]) => (
          <div key={l} style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: TOKENS.s900 }}>{v}<span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.s500 }}>{s}</span></div>
            <div style={{ fontSize: 11.5, color: TOKENS.s500, fontWeight: 700, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Grades */}
      {secHead('Performance by grade', csvBtn(() => download('grades-report.csv', toCSV(
        ['Grade', 'Students', 'Attendance %', 'Attended', 'Scheduled', 'Exam avg %', 'Exams graded', 'Quiz accuracy %', 'Homework submissions', 'Flagged students'],
        school.grades.map(g => [g.grade, g.students, g.attendancePct, g.attended, g.scheduled, g.examAvg, g.examN, g.quizAcc, g.hwSubmissions, risk?.byGrade?.[g.grade] || 0])))))}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead><tr>{['Grade', 'Students', 'Attendance', 'Exam avg', 'Quiz acc.', 'HW subs', 'Flagged', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>{school.grades.map(g => (
            <tr key={g.grade}>
              <td style={{ ...td, fontWeight: 800 }}>{g.grade}</td>
              <td style={td}>{g.students}</td>
              <td style={{ ...td, fontWeight: 800, color: attCol(g.attendancePct) }}><V v={g.attendancePct} /> <span style={{ fontWeight: 400, fontSize: 11, color: TOKENS.s400 }}>{g.scheduled ? `${g.attended}/${g.scheduled}` : 'no lessons'}</span></td>
              <td style={td}><V v={g.examAvg} /> <span style={{ fontSize: 11, color: TOKENS.s400 }}>({g.examN})</span></td>
              <td style={td}><V v={g.quizAcc} /></td>
              <td style={td}>{g.hwSubmissions}</td>
              <td style={td}>{(risk?.byGrade?.[g.grade] || 0) > 0 ? <b style={{ color: '#B91C1C' }}>{risk.byGrade[g.grade]}</b> : 0}</td>
              <td style={td}><button onClick={() => openGrade(g.grade)} style={{ padding: '4px 10px', borderRadius: 7, border: `1px solid ${TOKENS.line}`, background: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: TOKENS.s600 }}>Students</button></td>
            </tr>))}</tbody>
        </table>
      </div>

      {/* Grade drill-down */}
      {gradeOpen && (
        <>
          {secHead(`Grade detail: ${gradeOpen.grade}`, <>
            {csvBtn(() => download(`grade-${gradeOpen.grade}-students.csv`, toCSV(
              ['Student', 'Attended', 'Scheduled', 'Attendance %', 'Exam avg %', 'Exams', 'Quiz accuracy %'],
              gradeOpen.rows.map(s => [s.name, s.attended, s.scheduled, s.attendancePct, s.examAvg, s.examN, s.quizAcc]))))}
            <button onClick={() => setGradeOpen(null)} style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${TOKENS.line}`, background: '#fff', color: TOKENS.s500, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Close</button>
          </>)}
          <div style={card}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead><tr>{['Student', 'Attendance', 'Exam avg', 'Quiz acc.'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{gradeOpen.rows.map(s => (
                <tr key={s._id}>
                  <td style={{ ...td, fontWeight: 700 }}>{s.name}</td>
                  <td style={{ ...td, fontWeight: 800, color: attCol(s.attendancePct) }}><V v={s.attendancePct} /> <span style={{ fontWeight: 400, fontSize: 11, color: TOKENS.s400 }}>{s.scheduled ? `${s.attended}/${s.scheduled}` : 'no lessons'}</span></td>
                  <td style={td}><V v={s.examAvg} /> <span style={{ fontSize: 11, color: TOKENS.s400 }}>({s.examN})</span></td>
                  <td style={td}><V v={s.quizAcc} /></td>
                </tr>))}</tbody>
            </table>
          </div>
        </>
      )}

      {/* Subjects */}
      {secHead('Performance by subject', csvBtn(() => download('subjects-report.csv', toCSV(
        ['Subject', 'Exam avg %', 'Exams graded', 'Lessons held'],
        school.subjects.map(s => [s.subject, s.examAvg, s.examN, s.sessionsHeld])))))}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead><tr>{['Subject', 'Exam avg', 'Exams graded', 'Lessons held'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>{school.subjects.map(s => (
            <tr key={s.subject}>
              <td style={{ ...td, fontWeight: 700 }}>{s.subject}</td>
              <td style={td}><V v={s.examAvg} /></td>
              <td style={td}>{s.examN}</td>
              <td style={td}>{s.sessionsHeld}</td>
            </tr>))}</tbody>
        </table>
      </div>

      {/* Teachers */}
      {secHead('Teacher accountability', csvBtn(() => download('teachers-report.csv', toCSV(
        ['Teacher', 'Lessons held', 'Class attendance %', 'Exam avg %', 'Exams graded', 'Marking turnaround days', 'Rating', 'Rating count'],
        teachers.map(t => [t.name, t.sessionsHeld, t.classAttendancePct, t.examAvg, t.examN, t.markingDays, t.rating, t.ratingN])))))}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead><tr>{['Teacher', 'Lessons held', 'Class attendance', 'Exam avg', 'Marking (days)', 'Rating'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>{teachers.map(t => (
            <tr key={t._id}>
              <td style={{ ...td, fontWeight: 700 }}>{t.name}</td>
              <td style={td}>{t.sessionsHeld}</td>
              <td style={{ ...td, fontWeight: 800, color: attCol(t.classAttendancePct) }}><V v={t.classAttendancePct} /></td>
              <td style={td}><V v={t.examAvg} /> <span style={{ fontSize: 11, color: TOKENS.s400 }}>({t.examN})</span></td>
              <td style={td}><V v={t.markingDays} s="" /></td>
              <td style={td}>{t.rating !== null ? `${t.rating}/5` : '\u2013'} <span style={{ fontSize: 11, color: TOKENS.s400 }}>({t.ratingN})</span></td>
            </tr>))}</tbody>
        </table>
      </div>

      {/* Question bank analysis */}
      {qb && (
        <>
          {secHead('Question bank: teacher output', <>
            <span style={{ fontSize: 11.5, color: TOKENS.s500, fontWeight: 700 }}>Weekly target</span>
            <input type="number" min={1} max={200} value={qbTarget} onChange={e => setQbTarget(Math.max(1, Number(e.target.value) || 1))}
              style={{ width: 64, padding: '5px 8px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 8, fontSize: 12, fontWeight: 800 }} />
            {csvBtn(() => download('question-bank-teachers.csv', toCSV(
              ['Teacher', 'This week', 'Weekly average (8w)', 'Total (8w)', 'Weekly target', 'On target'],
              qb.teachers.map(t => [t.name, t.thisWeek, t.weeklyAvg, t.total8w, qbTarget, t.thisWeek >= qbTarget ? 'yes' : 'no']))))}
          </>)}
          <div style={card}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead><tr>{['Teacher', 'This week', 'Weekly avg (8w)', 'Total (8w)', 'vs target'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{qb.teachers.map(t => (
                <tr key={t._id}>
                  <td style={{ ...td, fontWeight: 700 }}>{t.name}</td>
                  <td style={{ ...td, fontWeight: 800 }}>{t.thisWeek}</td>
                  <td style={td}>{t.weeklyAvg}</td>
                  <td style={td}>{t.total8w}</td>
                  <td style={td}><span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: t.thisWeek >= qbTarget ? '#DCFCE7' : '#FEE2E2', color: t.thisWeek >= qbTarget ? '#15803D' : '#B91C1C' }}>{t.thisWeek >= qbTarget ? 'On target' : `${qbTarget - t.thisWeek} short`}</span></td>
                </tr>))}</tbody>
            </table>
          </div>

          {secHead('Question bank: debts and thin subjects', csvBtn(() => download('question-bank-debts.csv', toCSV(
            ['Category', 'Subject', 'Count'],
            [...qb.pendingArtwork.map(r => ['Pending artwork', r.subject, r.n]),
             ...qb.missingScheme.map(r => ['Missing marking scheme', r.subject, r.n]),
             ...qb.subjectCounts.map(r => ['Questions in subject', r.subject, r.n])]))))}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            <div style={{ ...card, padding: 14, overflow: 'visible' }}>
              <b style={{ fontSize: 13, color: '#B45309' }}>Pending artwork ({qb.pendingArtworkTotal})</b>
              {qb.pendingArtwork.length === 0 ? <div style={{ fontSize: 12, color: TOKENS.s400, marginTop: 6 }}>None. Clean.</div>
                : qb.pendingArtwork.slice(0, 8).map(r => <div key={r.subject} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '5px 0', borderBottom: `1px solid ${TOKENS.line}` }}><span>{r.subject}</span><b>{r.n}</b></div>)}
            </div>
            <div style={{ ...card, padding: 14, overflow: 'visible' }}>
              <b style={{ fontSize: 13, color: '#B91C1C' }}>Missing marking scheme ({qb.missingSchemeTotal})</b>
              {qb.missingScheme.length === 0 ? <div style={{ fontSize: 12, color: TOKENS.s400, marginTop: 6 }}>None. Clean.</div>
                : qb.missingScheme.slice(0, 8).map(r => <div key={r.subject} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '5px 0', borderBottom: `1px solid ${TOKENS.line}` }}><span>{r.subject}</span><b>{r.n}</b></div>)}
            </div>
            <div style={{ ...card, padding: 14, overflow: 'visible' }}>
              <b style={{ fontSize: 13, color: TOKENS.s900 }}>Thinnest subjects</b>
              {qb.subjectCounts.slice(0, 8).map(r => <div key={r.subject} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '5px 0', borderBottom: `1px solid ${TOKENS.line}` }}><span>{r.subject}</span><b style={{ color: r.n < 50 ? '#B91C1C' : TOKENS.s900 }}>{r.n}</b></div>)}
            </div>
          </div>
        </>
      )}

      <div style={{ fontSize: 11.5, color: TOKENS.s500, lineHeight: 1.7 }}>
        <b>Method.</b> {school.method} Per-student drill-downs with topic strengths and weaknesses live in Mastery & Early Warning.
      </div>
    </div>
  )
}
