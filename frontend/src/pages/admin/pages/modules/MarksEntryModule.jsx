/**
 * MarksEntryModule.jsx — the Dean keys in marks (/api/marks).
 *
 * For tests sat on paper, typically by centre (In-person / Hybrid)
 * students: each weekly test and the end-of-term exam, per subject.
 * Term reports combine these with marks from online exams.
 *
 * End-of-term reports from here: build or refresh the student's draft
 * report for the chosen term, preview it (the official PDF), download it,
 * publish it to the student and parents, publish every draft in the list,
 * and download the class's end-of-term results as a spreadsheet (CSV).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { DOSSpinner, PSection } from '../shared/ui.jsx'

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' })
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' })
const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const pctOf = (m) => Math.round((m.score / m.outOf) * 100)
const box = { background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: '14px 16px' }
const inp = { border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: '8px 10px', fontSize: 13.5, fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' }
const lbl = { display: 'grid', gap: 4, fontSize: 11.5, fontWeight: 700, color: TOKENS.inkMute }
// Term defaults: Sep–Dec term 1, Jan–Apr term 2, May–Aug term 3 (editable; the last choice is remembered).
function defaultTerm() {
  try { const t = JSON.parse(localStorage.getItem('smartious.marks.term') || 'null'); if (t?.academicYear && t?.term) return t } catch {}
  const d = new Date(), y = d.getFullYear(), m = d.getMonth()
  return m >= 8 ? { academicYear: `${y}/${y + 1}`, term: '1' } : { academicYear: `${y - 1}/${y}`, term: m >= 4 ? '3' : '2' }
}
const STATUS = { draft: ['Draft', '#8A5A00', '#FFF4DC'], published: ['Published', '#1C6B3A', '#E5F5EA'] }
const btn = (primary) => ({ border: primary ? 'none' : `1px solid ${TOKENS.line}`, background: primary ? TOKENS.crimson : '#fff', color: primary ? '#fff' : TOKENS.ink, borderRadius: 8, padding: '9px 14px', fontWeight: 800, fontSize: 13, cursor: 'pointer' })

export default function MarksEntryModule({ toast }) {
  const [centreOnly, setCentreOnly] = useState(true)
  const [q, setQ] = useState('')
  const [students, setStudents] = useState(null)
  const [student, setStudent] = useState(null)
  const [from, setFrom] = useState(daysAgo(90))
  const [to, setTo] = useState(today())
  const [marks, setMarks] = useState(null)
  const [saving, setSaving] = useState(false)
  const [f, setF] = useState({ subject: '', kind: 'weekly', label: '', date: today(), score: '', outOf: '100' })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const [termSel, setTermSel] = useState(defaultTerm)
  const setTerm = (k, v) => setTermSel(p => { const n = { ...p, [k]: v }; try { localStorage.setItem('smartious.marks.term', JSON.stringify(n)) } catch {} return n })
  const [report, setReport] = useState(undefined) // undefined loading · null none · { _id, status, … }
  const [busy, setBusy] = useState('')
  const [preview, setPreview] = useState(null)    // object URL of the report PDF
  const validYear = /^\d{4}\/\d{4}$/.test(termSel.academicYear)

  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/marks/students', { params: { centre: centreOnly ? 1 : 0, q } })
        .then(r => setStudents(r.data?.data || []))
        .catch(() => setStudents([]))
    }, 250)
    return () => clearTimeout(t)
  }, [centreOnly, q])

  const loadMarks = useCallback(() => {
    if (!student) return
    setMarks(null)
    api.get('/marks', { params: { studentId: student._id, from, to } })
      .then(r => setMarks(r.data?.data || []))
      .catch(e => { toast?.error?.(e?.response?.data?.message || 'Could not load marks.'); setMarks([]) })
  }, [student, from, to, toast])
  useEffect(() => { loadMarks() }, [loadMarks])

  const loadReport = useCallback(() => {
    if (!student || !validYear) { setReport(null); return }
    setReport(undefined)
    api.get('/marks/report', { params: { studentId: student._id, ...termSel } })
      .then(r => setReport(r.data?.data || null)).catch(() => setReport(null))
  }, [student, termSel, validYear])
  useEffect(() => { loadReport() }, [loadReport])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const errMsg = async (e, fallback) => {
    const d = e?.response?.data
    if (d instanceof Blob) { try { return JSON.parse(await d.text()).message || fallback } catch { return fallback } }
    return d?.message || fallback
  }
  // Build the draft (or refresh its scores from the latest marks; comments are kept).
  const buildReport = async () => {
    if (report?.status === 'published' && !window.confirm('This report is already published. Update it with the latest marks? The student and parents will see the new scores.')) return null
    const r = await api.post('/marks/report', { studentId: student._id, ...termSel, termStart: from, termEnd: to })
    setReport(r.data?.data || null)
    return r.data?.data
  }
  const pdfBlob = async (id, download) => {
    const r = await api.get('/reports/' + id + '/pdf', { params: download ? { download: 1 } : {}, responseType: 'blob' })
    return new Blob([r.data], { type: 'application/pdf' })
  }
  const fileName = () => `Report-${(student.admissionNo || `${student.firstName}-${student.lastName}`).replace(/[^A-Za-z0-9-]/g, '-')}-T${termSel.term}.pdf`
  const saveBlob = (blob, name) => {
    const url = URL.createObjectURL(blob), a = document.createElement('a')
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 30000)
  }
  const doPreview = async () => {
    setBusy('preview')
    try {
      const rep = await buildReport(); if (!rep) return
      setPreview(URL.createObjectURL(await pdfBlob(rep._id)))
    } catch (e) { toast?.error?.(await errMsg(e, 'Could not build the report.')) }
    finally { setBusy('') }
  }
  const doDownload = async () => {
    setBusy('download')
    try {
      const rep = report || await buildReport(); if (!rep) return
      saveBlob(await pdfBlob(rep._id, true), fileName())
    } catch (e) { toast?.error?.(await errMsg(e, 'Could not download the report.')) }
    finally { setBusy('') }
  }
  const doPublish = async () => {
    if (!report?._id) return
    if (!window.confirm(`Publish ${student.firstName}'s Term ${termSel.term} report? The student and parents will be able to see and download it, and parents are emailed.`)) return
    setBusy('publish')
    try {
      const r = await api.post('/reports/' + report._id + '/publish')
      toast?.ok?.(r.data?.message || 'Report published.')
      loadReport()
    } catch (e) { toast?.error?.(await errMsg(e, 'Could not publish.')) }
    finally { setBusy('') }
  }
  const publishAll = async () => {
    if (!students?.length || !validYear) return
    if (!window.confirm(`Publish every draft Term ${termSel.term} (${termSel.academicYear}) report for the ${students.length} students listed? Students and parents will see them, and parents are emailed. Build each student's report first: students without one are skipped.`)) return
    setBusy('all')
    try {
      const r = await api.post('/marks/publish', { ...termSel, studentIds: students.map(s => s._id) })
      const d = r.data?.data || {}
      toast?.ok?.(`${d.published || 0} report${d.published === 1 ? '' : 's'} published${d.notified ? `, ${d.notified} parent email${d.notified === 1 ? '' : 's'} sent` : ''}.${d.missing ? ` ${d.missing} student${d.missing === 1 ? ' has' : 's have'} no report for this term yet.` : ''}`)
      loadReport()
    } catch (e) { toast?.error?.(await errMsg(e, 'Could not publish.')) }
    finally { setBusy('') }
  }
  const downloadCsv = async () => {
    if (!validYear) return toast?.error?.('Enter the academic year as 2025/2026.')
    setBusy('csv')
    try {
      const r = await api.get('/marks/results.csv', { params: { ...termSel, from, to, centre: centreOnly ? 1 : 0, q }, responseType: 'blob' })
      saveBlob(new Blob([r.data], { type: 'text/csv' }), `end-of-term-results-${termSel.academicYear.replace('/', '-')}-T${termSel.term}.csv`)
    } catch (e) { toast?.error?.(await errMsg(e, 'Could not download the results.')) }
    finally { setBusy('') }
  }

  const subjects = useMemo(() => {
    const own = Array.isArray(student?.subjects) ? student.subjects : []
    return [...new Set([...own, ...(marks || []).map(m => m.subject)])].filter(Boolean)
  }, [student, marks])
  useEffect(() => { if (subjects.length && !subjects.includes(f.subject)) set('subject', subjects[0]) }, [subjects]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (e) => {
    e?.preventDefault()
    if (!f.subject) return toast?.error?.('Choose a subject.')
    if (f.score === '') return toast?.error?.('Enter the mark.')
    setSaving(true)
    try {
      await api.post('/marks', { studentId: student._id, ...f, score: Number(f.score), outOf: Number(f.outOf || 100), label: f.label || (f.kind === 'endterm' ? 'End-of-term exam' : 'Weekly test') })
      toast?.ok?.('Mark saved.')
      setF(p => ({ ...p, score: '', label: '' }))
      loadMarks()
    } catch (err) { toast?.error?.(err?.response?.data?.message || 'Could not save the mark.') }
    finally { setSaving(false) }
  }
  const remove = async (m) => {
    if (!window.confirm(`Delete ${m.label || 'this mark'} (${m.score}/${m.outOf}) in ${m.subject}?`)) return
    try { await api.delete('/marks/' + m._id); loadMarks() } catch { toast?.error?.('Could not delete.') }
  }

  const bySubject = useMemo(() => {
    const out = {}
    for (const s of subjects) out[s] = { weekly: [], end: null }
    for (const m of marks || []) {
      const r = out[m.subject] || (out[m.subject] = { weekly: [], end: null })
      if (m.kind === 'endterm') { if (!r.end || new Date(m.date) >= new Date(r.end.date)) r.end = m }
      else r.weekly.push(m)
    }
    return out
  }, [subjects, marks])

  return (
    <div>
      <PSection tag="Academics" title="Marks" em="Entry"
        sub="Key in weekly test and end-of-term marks for tests sat on paper, especially by centre students. Term reports combine them with marks from online exams (final = weekly average 30% + end of term 70%)." />

      <div style={{ ...box, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
        <label style={lbl}>Academic year<input value={termSel.academicYear} onChange={e => setTerm('academicYear', e.target.value.trim())} placeholder="2026/2027" style={{ ...inp, width: 110, borderColor: validYear ? TOKENS.line : TOKENS.crimson }} /></label>
        <label style={lbl}>Term
          <select value={termSel.term} onChange={e => setTerm('term', e.target.value)} style={inp}>
            <option value="1">Term 1</option><option value="2">Term 2</option><option value="3">Term 3</option>
          </select>
        </label>
        <label style={lbl}>Term from<input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inp} /></label>
        <label style={lbl}>to<input type="date" value={to} onChange={e => setTo(e.target.value)} style={inp} /></label>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={downloadCsv} disabled={!!busy} style={btn(false)}>{busy === 'csv' ? 'Preparing…' : '⬇ End-of-term results (CSV)'}</button>
        <button type="button" onClick={publishAll} disabled={!!busy || !students?.length || !validYear} style={btn(false)} title="Publish every draft report for the students listed">{busy === 'all' ? 'Publishing…' : 'Publish all drafts'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) minmax(0, 1fr)', gap: 14, alignItems: 'start' }} className="marks-grid">
        {/* Students */}
        <div style={{ ...box, padding: 12 }}>
          <input placeholder="Search name or admission no." value={q} onChange={e => setQ(e.target.value)} style={{ ...inp, width: '100%', marginBottom: 8 }} />
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5, marginBottom: 8 }}>
            <input type="checkbox" checked={centreOnly} onChange={e => setCentreOnly(e.target.checked)} /> Centre students only (In-person and Hybrid)
          </label>
          {students === null ? <DOSSpinner /> : !students.length ? (
            <p style={{ fontSize: 13, color: TOKENS.inkMute }}>{centreOnly ? 'No centre students found. Untick the box to see everyone.' : 'No students found.'}</p>
          ) : (
            <div style={{ display: 'grid', gap: 4, maxHeight: '60vh', overflow: 'auto' }}>
              {students.map(s => (
                <button key={s._id} type="button" onClick={() => setStudent(s)}
                  style={{ textAlign: 'left', border: `1px solid ${student?._id === s._id ? TOKENS.crimson : 'transparent'}`, background: student?._id === s._id ? '#FFF6F7' : 'transparent', borderRadius: 8, padding: '7px 9px', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: TOKENS.ink }}>{s.firstName} {s.lastName}</div>
                  <div style={{ fontSize: 11.5, color: TOKENS.inkMute }}>{[s.gradeLevel, s.curriculum, s.deliveryMode].filter(Boolean).join(' · ')}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Marks */}
        <div style={{ display: 'grid', gap: 12 }}>
          {!student ? (
            <div style={{ ...box, color: TOKENS.inkMute, fontSize: 14 }}>Choose a student on the left.</div>
          ) : <>
            <div style={{ ...box, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 220px' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: TOKENS.ink }}>{student.firstName} {student.lastName}</div>
                <div style={{ fontSize: 12.5, color: TOKENS.inkMute }}>{[student.admissionNo, student.gradeLevel, student.curriculum].filter(Boolean).join(' · ')}</div>
              </div>
              <div style={{ display: 'grid', gap: 6, justifyItems: 'end' }}>
                <div style={{ fontSize: 12, color: TOKENS.inkMute }}>
                  Term {termSel.term} report:{' '}
                  {report === undefined ? '…' : report ? (() => { const [t, c, bg] = STATUS[report.status] || STATUS.draft; return <span style={{ color: c, background: bg, borderRadius: 99, padding: '2px 9px', fontWeight: 800 }}>{t}</span> })() : <b>not created yet</b>}
                  {report?.overallAverage != null && <> · average <b>{report.overallAverage}%</b>{report.meanGrade ? ` (${report.meanGrade})` : ''}</>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={doPreview} disabled={!!busy || !validYear} style={btn(false)} title="Builds the report from the latest marks, then shows it">{busy === 'preview' ? 'Building…' : '👁 Preview report'}</button>
                  <button type="button" onClick={doDownload} disabled={!!busy || !validYear} style={btn(false)}>{busy === 'download' ? 'Downloading…' : '⬇ Download PDF'}</button>
                  <button type="button" onClick={doPublish} disabled={!!busy || !report?._id || report.status === 'published'} style={btn(true)}>{report?.status === 'published' ? '✓ Published' : busy === 'publish' ? 'Publishing…' : 'Publish'}</button>
                </div>
              </div>
            </div>

            <form onSubmit={save} style={{ ...box, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <label style={lbl}>Subject
                {subjects.length
                  ? <select value={f.subject} onChange={e => set('subject', e.target.value)} style={inp}>{subjects.map(s => <option key={s}>{s}</option>)}</select>
                  : <input value={f.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Mathematics" style={inp} />}
              </label>
              <label style={lbl}>Type
                <select value={f.kind} onChange={e => set('kind', e.target.value)} style={inp}>
                  <option value="weekly">Weekly test</option>
                  <option value="endterm">End-of-term exam</option>
                </select>
              </label>
              <label style={lbl}>Name (optional)<input value={f.label} onChange={e => set('label', e.target.value)} placeholder={f.kind === 'endterm' ? 'End-of-term exam' : 'e.g. Week 4 test'} style={{ ...inp, width: 150 }} maxLength={80} /></label>
              <label style={lbl}>Date<input type="date" value={f.date} onChange={e => set('date', e.target.value)} style={inp} /></label>
              <label style={lbl}>Mark<input type="number" min="0" step="0.5" value={f.score} onChange={e => set('score', e.target.value)} style={{ ...inp, width: 80 }} required /></label>
              <label style={lbl}>Out of<input type="number" min="1" value={f.outOf} onChange={e => set('outOf', e.target.value)} style={{ ...inp, width: 80 }} /></label>
              <button type="submit" disabled={saving} style={btn(true)}>{saving ? 'Saving…' : 'Save mark'}</button>
            </form>

            <div style={box}>
              {marks === null ? <DOSSpinner /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: TOKENS.inkMute, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      <th style={{ padding: '6px 8px' }}>Subject</th><th style={{ padding: '6px 8px' }}>Weekly tests</th>
                      <th style={{ padding: '6px 8px' }}>Weekly avg</th><th style={{ padding: '6px 8px' }}>End of term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(bySubject).map(([subj, r]) => {
                      const avg = r.weekly.length ? Math.round(r.weekly.reduce((a, m) => a + pctOf(m), 0) / r.weekly.length) : null
                      return (
                        <tr key={subj} style={{ borderTop: `1px solid ${TOKENS.line}`, verticalAlign: 'top' }}>
                          <td style={{ padding: '8px', fontWeight: 700 }}>{subj}</td>
                          <td style={{ padding: '8px' }}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {r.weekly.map(m => (
                                <span key={m._id} title={`${m.label} · ${fmt(m.date)}`} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', border: `1px solid ${TOKENS.line}`, borderRadius: 99, padding: '3px 4px 3px 10px', fontSize: 12.5 }}>
                                  {fmt(m.date)}: <b>{m.score}/{m.outOf}</b>
                                  <button type="button" onClick={() => remove(m)} aria-label="Delete" style={{ border: 'none', background: 'none', cursor: 'pointer', color: TOKENS.inkMute, fontSize: 14 }}>×</button>
                                </span>
                              ))}
                              {!r.weekly.length && <span style={{ color: TOKENS.inkMute, fontSize: 12.5 }}>None keyed in</span>}
                            </div>
                          </td>
                          <td style={{ padding: '8px', fontWeight: 700 }}>{avg != null ? avg + '%' : '—'}</td>
                          <td style={{ padding: '8px' }}>
                            {r.end ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><b>{r.end.score}/{r.end.outOf}</b> ({pctOf(r.end)}%)
                              <button type="button" onClick={() => remove(r.end)} aria-label="Delete" style={{ border: 'none', background: 'none', cursor: 'pointer', color: TOKENS.inkMute, fontSize: 14 }}>×</button></span>
                              : <span style={{ color: TOKENS.inkMute, fontSize: 12.5 }}>—</span>}
                          </td>
                        </tr>
                      )
                    })}
                    {!Object.keys(bySubject).length && <tr><td colSpan={4} style={{ padding: 10, color: TOKENS.inkMute }}>This student has no subjects on record yet: type the subject name above.</td></tr>}
                  </tbody>
                </table>
              )}
              <p style={{ fontSize: 12, color: TOKENS.inkMute, margin: '10px 0 0' }}>Online test results are added automatically when the report is generated; only paper tests need keying in here. Preview builds the report from the latest marks and keeps any comments already on it; add teacher, Dean and Principal comments in Reports.</p>
            </div>
          </>}
        </div>
      </div>
      {preview && (
        <div role="dialog" aria-modal="true" aria-label="Report preview" onClick={e => { if (e.target === e.currentTarget) setPreview(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,14,10,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: 'min(900px, 100%)', height: 'min(92vh, 1100px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', padding: '10px 14px', borderBottom: `1px solid ${TOKENS.line}` }}>
              <div style={{ fontWeight: 800, color: TOKENS.ink, flex: '1 1 200px' }}>
                {student?.firstName} {student?.lastName} · Term {termSel.term} {termSel.academicYear}
                {report && <span style={{ marginLeft: 8, fontSize: 12, color: (STATUS[report.status] || STATUS.draft)[1] }}>{(STATUS[report.status] || STATUS.draft)[0]}</span>}
              </div>
              <a href={preview} target="_blank" rel="noreferrer" style={{ ...btn(false), textDecoration: 'none' }}>Open in new tab</a>
              <a href={preview} download={student ? fileName() : 'report.pdf'} style={{ ...btn(false), textDecoration: 'none' }}>⬇ Download</a>
              {report?.status !== 'published' && <button type="button" onClick={doPublish} disabled={!!busy || !report?._id} style={btn(true)}>{busy === 'publish' ? 'Publishing…' : 'Publish'}</button>}
              <button type="button" onClick={() => setPreview(null)} aria-label="Close" style={btn(false)}>✕</button>
            </div>
            <iframe title="Report preview" src={preview} style={{ flex: 1, border: 'none', width: '100%' }} />
          </div>
        </div>
      )}
      <style>{'@media (max-width: 900px) { .marks-grid { grid-template-columns: 1fr !important; } }'}</style>
    </div>
  )
}
