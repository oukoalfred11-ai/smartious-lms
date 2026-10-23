/**
 * MarksEntryModule.jsx — the Dean keys in marks (/api/marks).
 *
 * For tests sat on paper, typically by centre (In-person / Hybrid)
 * students: each weekly test and the end-of-term exam, per subject.
 * Term reports combine these with marks from online exams.
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
              <label style={lbl}>Term from<input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inp} /></label>
              <label style={lbl}>to<input type="date" value={to} onChange={e => setTo(e.target.value)} style={inp} /></label>
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
              <p style={{ fontSize: 12, color: TOKENS.inkMute, margin: '10px 0 0' }}>Online test results are added automatically when the report is generated; only paper tests need keying in here.</p>
            </div>
          </>}
        </div>
      </div>
      <style>{'@media (max-width: 900px) { .marks-grid { grid-template-columns: 1fr !important; } }'}</style>
    </div>
  )
}
