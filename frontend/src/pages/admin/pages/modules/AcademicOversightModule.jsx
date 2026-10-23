/**
 * AcademicOversightModule.jsx — the Dean checks, monitors and corrects
 * every student's academic record (/api/oversight): attendance per lesson,
 * keyed-in and online marks, teachers' comments, and the class teacher.
 * Every correction is logged and shown under History.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { DOSSpinner, PSection } from '../shared/ui.jsx'

const ymd = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' })
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Nairobi' }) : '—')
const fmtT = (d) => (d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }) : '')
const errMsg = (e, fb) => e?.response?.data?.message || fb
const box = { background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: '14px 16px' }
const inp = { border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: '7px 9px', fontSize: 13, fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' }
const lbl = { display: 'grid', gap: 4, fontSize: 11.5, fontWeight: 700, color: TOKENS.inkMute }
const btn = (primary, small) => ({ border: primary ? 'none' : `1px solid ${TOKENS.line}`, background: primary ? TOKENS.crimson : '#fff', color: primary ? '#fff' : TOKENS.ink, borderRadius: 8, padding: small ? '4px 9px' : '8px 13px', fontWeight: 800, fontSize: small ? 12 : 13, cursor: 'pointer' })
const th = { padding: '6px 8px', textAlign: 'left', color: TOKENS.inkMute, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }
const td = { padding: '7px 8px', borderTop: `1px solid ${TOKENS.line}`, verticalAlign: 'top' }
const rateColor = (r) => (r == null ? TOKENS.inkMute : r >= 85 ? '#065F46' : r >= 70 ? '#92400E' : '#991B1B')

const MARK = {
  present: { label: 'Present', bg: '#D1FAE5', fg: '#065F46' },
  absent:  { label: 'Absent',  bg: '#FEE2E2', fg: '#991B1B' },
  excused: { label: 'Excused', bg: '#E0E7FF', fg: '#3730A3' },
  closure: { label: 'School closed', bg: '#F3F4F6', fg: '#4B5563' },
}
const Pill = ({ k }) => { const m = MARK[k] || MARK.absent; return <span style={{ background: m.bg, color: m.fg, borderRadius: 99, padding: '2px 9px', fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap' }}>{m.label}</span> }

function useTeachers() {
  const [list, setList] = useState([])
  useEffect(() => { api.get('/oversight/teachers').then(r => setList(r.data?.data || [])).catch(() => {}) }, [])
  return list
}

export default function AcademicOversightModule({ toast }) {
  const teachers = useTeachers()
  const [q, setQ] = useState('')
  const [ctFilter, setCtFilter] = useState('')
  const [students, setStudents] = useState(null)
  const [picked, setPicked] = useState(() => new Set())
  const [bulkTeacher, setBulkTeacher] = useState('')
  const [student, setStudent] = useState(null)
  const [from, setFrom] = useState(ymd(Date.now() - 90 * 864e5))
  const [to, setTo] = useState(ymd(Date.now()))

  const loadStudents = useCallback(() => {
    setStudents(null)
    api.get('/oversight/students', { params: { q, classTeacher: ctFilter || undefined, from, to } })
      .then(r => setStudents(r.data?.data?.students || []))
      .catch(e => { toast?.error?.(errMsg(e, 'Could not load students.')); setStudents([]) })
  }, [q, ctFilter, from, to, toast])
  useEffect(() => { const t = setTimeout(loadStudents, 300); return () => clearTimeout(t) }, [loadStudents])

  const togglePick = (id) => setPicked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const assignBulk = async () => {
    if (!picked.size) return toast?.error?.('Tick the students first.')
    try {
      const r = await api.post('/oversight/class-teacher/bulk', { studentIds: [...picked], teacherId: bulkTeacher || null })
      toast?.ok?.(r.data?.message || 'Saved.'); setPicked(new Set()); loadStudents()
    } catch (e) { toast?.error?.(errMsg(e, 'Could not assign.')) }
  }

  return (
    <div>
      <PSection tag="Dean of Studies" title="Academic" em="Oversight"
        sub="Check and correct every student's attendance, marks and teachers' comments, and assign class teachers. Every correction is recorded with your name." />

      <div style={{ ...box, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
        <label style={lbl}>Search<input value={q} onChange={e => setQ(e.target.value)} placeholder="Name or admission no." style={{ ...inp, width: 200 }} /></label>
        <label style={lbl}>Class teacher
          <select value={ctFilter} onChange={e => setCtFilter(e.target.value)} style={inp}>
            <option value="">All students</option>
            <option value="none">No class teacher yet</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </label>
        <label style={lbl}>From<input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inp} /></label>
        <label style={lbl}>To<input type="date" value={to} onChange={e => setTo(e.target.value)} style={inp} /></label>
        <div style={{ flex: 1 }} />
        <label style={lbl}>Class teacher for ticked ({picked.size})
          <span style={{ display: 'flex', gap: 6 }}>
            <select value={bulkTeacher} onChange={e => setBulkTeacher(e.target.value)} style={inp}>
              <option value="">None (remove)</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <button type="button" onClick={assignBulk} disabled={!picked.size} style={btn(true)}>Assign</button>
          </span>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: student ? 'minmax(260px, 340px) minmax(0, 1fr)' : '1fr', gap: 14, alignItems: 'start' }} className="ov-grid">
        <div style={{ ...box, padding: 0, overflow: 'auto', maxHeight: student ? '75vh' : 'none' }}>
          {students === null ? <div style={{ padding: 16 }}><DOSSpinner /></div> : !students.length ? (
            <p style={{ padding: 16, fontSize: 13, color: TOKENS.inkMute }}>No students match.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr><th style={th}></th><th style={th}>Student</th>{!student && <th style={th}>Class teacher</th>}<th style={th}>Attendance</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} style={{ background: student?._id === s._id ? '#FFF6F7' : undefined, cursor: 'pointer' }} onClick={() => setStudent(s)}>
                    <td style={{ ...td, width: 26 }} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={picked.has(s._id)} onChange={() => togglePick(s._id)} aria-label={'Tick ' + s.name} />
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: TOKENS.ink }}>{s.name}</div>
                      <div style={{ fontSize: 11.5, color: TOKENS.inkMute }}>{[s.gradeLevel, s.curriculum, s.deliveryMode].filter(Boolean).join(' · ')}</div>
                      {student && <div style={{ fontSize: 11.5, color: TOKENS.inkMute }}>Class teacher: {s.classTeacher?.name || '—'}</div>}
                    </td>
                    {!student && <td style={td}>{s.classTeacher?.name || <span style={{ color: '#92400E' }}>Not assigned</span>}</td>}
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      {s.attendance?.scheduled ? <><b style={{ color: rateColor(s.attendance.rate) }}>{s.attendance.rate}%</b> <span style={{ fontSize: 11.5, color: TOKENS.inkMute }}>{s.attendance.attended}/{s.attendance.scheduled}</span></> : <span style={{ color: TOKENS.inkMute }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {student && <StudentRecord key={student._id + from + to} id={student._id} from={from} to={to} teachers={teachers} toast={toast}
          onClose={() => setStudent(null)} onChanged={loadStudents} />}
      </div>
      <style>{'@media (max-width: 960px) { .ov-grid { grid-template-columns: 1fr !important; } }'}</style>
    </div>
  )
}

function StudentRecord({ id, from, to, teachers, toast, onClose, onChanged }) {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('attendance')
  const load = useCallback(() => {
    api.get('/oversight/students/' + id, { params: { from, to } })
      .then(r => setData(r.data?.data || null))
      .catch(e => { toast?.error?.(errMsg(e, 'Could not load the record.')); setData(false) })
  }, [id, from, to, toast])
  useEffect(() => { load() }, [load])
  const refresh = () => { load(); onChanged?.() }

  if (data === null) return <div style={box}><DOSSpinner /></div>
  if (!data) return <div style={box}>Could not load this student.</div>
  const s = data.student

  const setTeacher = async (teacherId) => {
    try { await api.patch(`/oversight/students/${id}/class-teacher`, { teacherId: teacherId || null }); toast?.ok?.('Class teacher saved.'); refresh() }
    catch (e) { toast?.error?.(errMsg(e, 'Could not save.')) }
  }

  const TABS = [['attendance', 'Attendance'], ['marks', 'Marks'], ['comments', "Teachers' comments"], ['history', 'History']]
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ ...box, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 220px' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: TOKENS.ink }}>{s.name}</div>
          <div style={{ fontSize: 12.5, color: TOKENS.inkMute }}>{[s.admissionNo, s.gradeLevel, s.curriculum, s.deliveryMode].filter(Boolean).join(' · ')}</div>
        </div>
        <label style={lbl}>Class teacher
          <select value={s.classTeacher?._id || ''} onChange={e => setTeacher(e.target.value)} style={inp}>
            <option value="">Not assigned</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </label>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: TOKENS.inkMute, textTransform: 'uppercase', letterSpacing: '.06em' }}>Attendance</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: rateColor(data.attendance.rate) }}>{data.attendance.rate != null ? data.attendance.rate + '%' : '—'}</div>
          <div style={{ fontSize: 11.5, color: TOKENS.inkMute }}>{data.attendance.attended} of {data.attendance.scheduled} lessons</div>
        </div>
        <button type="button" onClick={onClose} style={btn(false, true)}>Close</button>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TABS.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            style={{ ...btn(tab === k, true), padding: '6px 12px' }}>{l}</button>
        ))}
      </div>

      {tab === 'attendance' && <AttendanceTab data={data} id={id} toast={toast} refresh={refresh} />}
      {tab === 'marks' && <MarksTab data={data} toast={toast} refresh={refresh} />}
      {tab === 'comments' && <CommentsTab data={data} toast={toast} refresh={refresh} />}
      {tab === 'history' && <HistoryTab rows={data.corrections || []} />}
    </div>
  )
}

function AttendanceTab({ data, id, toast, refresh }) {
  const [busy, setBusy] = useState('')
  const [ex, setEx] = useState({ from: '', to: '', note: '' })
  const lessons = data.attendance.lessons || []

  const mark = async (l, status) => {
    let note = ''
    if (status === 'excused') { note = window.prompt('Reason (shown in the record), e.g. mid-term break:', l.excuseNote || 'Mid-term break'); if (note === null) return }
    setBusy(String(l.liveClassId))
    try { await api.patch('/oversight/attendance', { liveClassId: l.liveClassId, studentId: id, status, note }); toast?.ok?.('Attendance corrected.'); refresh() }
    catch (e) { toast?.error?.(errMsg(e, 'Could not save.')) }
    finally { setBusy('') }
  }
  const excuseRange = async (e) => {
    e.preventDefault()
    if (!ex.from || !ex.to) return toast?.error?.('Give the first and last day.')
    try {
      const r = await api.post(`/oversight/students/${id}/excuse`, { from: ex.from, to: ex.to, note: ex.note || 'Excused by the Dean' })
      toast?.ok?.(r.data?.message || 'Done.'); setEx({ from: '', to: '', note: '' }); refresh()
    } catch (err) { toast?.error?.(errMsg(err, 'Could not excuse.')) }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <form onSubmit={excuseRange} style={{ ...box, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 100%', fontSize: 13, fontWeight: 800, color: TOKENS.ink }}>Excuse a period (e.g. mid-term, sick leave)</div>
        <label style={lbl}>First day<input type="date" value={ex.from} onChange={e => setEx(p => ({ ...p, from: e.target.value }))} style={inp} /></label>
        <label style={lbl}>Last day<input type="date" value={ex.to} onChange={e => setEx(p => ({ ...p, to: e.target.value }))} style={inp} /></label>
        <label style={{ ...lbl, flex: '1 1 180px' }}>Reason<input value={ex.note} onChange={e => setEx(p => ({ ...p, note: e.target.value }))} placeholder="Mid-term break" maxLength={300} style={inp} /></label>
        <button type="submit" style={btn(true)}>Excuse missed lessons</button>
        <p style={{ flex: '1 1 100%', margin: 0, fontSize: 12, color: TOKENS.inkMute }}>Lessons the student attended stay present. Excused lessons are not counted as absences on reports. For a whole-school break, add it to the school calendar instead.</p>
      </form>

      <div style={{ ...box, padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr><th style={th}>Lesson</th><th style={th}>Teacher</th><th style={th}>Mark</th><th style={th}>Correct</th></tr></thead>
          <tbody>
            {lessons.map(l => (
              <tr key={String(l.liveClassId)}>
                <td style={td}>
                  <div style={{ fontWeight: 700 }}>{l.subject || l.title}</div>
                  <div style={{ fontSize: 11.5, color: TOKENS.inkMute }}>{fmt(l.scheduledAt)} {fmtT(l.scheduledAt)}{l.late ? ' · late' : ''}</div>
                </td>
                <td style={{ ...td, fontSize: 12.5 }}>{l.teacher || '—'}</td>
                <td style={td}>
                  <Pill k={l.mark} />
                  {(l.excuseNote || l.markedBy) && <div style={{ fontSize: 11, color: TOKENS.inkMute, marginTop: 3 }}>{[l.excuseNote, l.markedBy && 'by ' + l.markedBy].filter(Boolean).join(' · ')}</div>}
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  {['present', 'absent', 'excused'].filter(k => k !== l.mark).map(k => (
                    <button key={k} type="button" disabled={busy === String(l.liveClassId)} onClick={() => mark(l, k)} style={{ ...btn(false, true), marginRight: 4 }}>{MARK[k].label}</button>
                  ))}
                </td>
              </tr>
            ))}
            {!lessons.length && <tr><td colSpan={4} style={{ ...td, color: TOKENS.inkMute }}>No lessons held in this period.</td></tr>}
          </tbody>
        </table>
      </div>
      {!!data.attendance.legacyRecords?.length && (
        <p style={{ fontSize: 12, color: TOKENS.inkMute, margin: 0 }}>{data.attendance.legacyRecords.length} day(s) before the lesson register began come from the old daily register and cannot be corrected here.</p>
      )}
    </div>
  )
}

function MarksTab({ data, toast, refresh }) {
  const [open, setOpen] = useState('')
  const editKeyed = async (m) => {
    const v = window.prompt(`${m.subject} · ${m.label || m.kind}: new mark out of ${m.outOf}`, String(m.score))
    if (v === null) return
    const reason = window.prompt('Reason for the correction (kept in the record):', '') ?? ''
    try { await api.patch('/oversight/marks/' + m._id, { score: Number(v), reason }); toast?.ok?.('Mark corrected.'); refresh() }
    catch (e) { toast?.error?.(errMsg(e, 'Could not save.')) }
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={box}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Online exams and tests</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr><th style={th}>Paper</th><th style={th}>Score</th><th style={th}>Grade</th><th style={th}>Marked by</th><th style={th}></th></tr></thead>
          <tbody>
            {(data.exams || []).map(x => (
              <React.Fragment key={x._id}>
                <tr>
                  <td style={td}><div style={{ fontWeight: 700 }}>{x.subject} {x.paper}</div><div style={{ fontSize: 11.5, color: TOKENS.inkMute }}>{x.title} · {fmt(x.date)}</div></td>
                  <td style={td}>{x.status === 'in_progress' ? <span style={{ color: TOKENS.inkMute }}>Not submitted</span> : x.status === 'submitted' ? <span style={{ color: '#92400E' }}>Awaiting marking</span> : <><b>{x.totalScore}/{x.maxScore}</b> ({x.percentage}%)</>}</td>
                  <td style={{ ...td, fontWeight: 800, color: TOKENS.crimson }}>{x.grade || '—'}</td>
                  <td style={{ ...td, fontSize: 12.5 }}>{x.markedBy || '—'}</td>
                  <td style={td}>{x.answers.length > 0 && <button type="button" onClick={() => setOpen(open === x._id ? '' : x._id)} style={btn(false, true)}>{open === x._id ? 'Close' : 'Check marks'}</button>}</td>
                </tr>
                {open === x._id && <tr><td colSpan={5} style={{ ...td, background: TOKENS.cream || '#FBF8F2' }}><ExamCorrector exam={x} toast={toast} onSaved={() => { setOpen(''); refresh() }} /></td></tr>}
              </React.Fragment>
            ))}
            {!data.exams?.length && <tr><td colSpan={5} style={{ ...td, color: TOKENS.inkMute }}>No online exams in this period.</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={box}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Marks keyed in (paper tests)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr><th style={th}>Subject</th><th style={th}>Test</th><th style={th}>Mark</th><th style={th}>Entered by</th><th style={th}></th></tr></thead>
          <tbody>
            {(data.keyedMarks || []).map(m => (
              <tr key={m._id}>
                <td style={{ ...td, fontWeight: 700 }}>{m.subject}</td>
                <td style={td}>{m.label || (m.kind === 'endterm' ? 'End-of-term exam' : 'Weekly test')}<div style={{ fontSize: 11.5, color: TOKENS.inkMute }}>{fmt(m.date)}</div></td>
                <td style={td}><b>{m.score}/{m.outOf}</b> ({Math.round((m.score / m.outOf) * 100)}%)</td>
                <td style={{ ...td, fontSize: 12.5 }}>{m.enteredBy || '—'}</td>
                <td style={td}><button type="button" onClick={() => editKeyed(m)} style={btn(false, true)}>Correct</button></td>
              </tr>
            ))}
            {!data.keyedMarks?.length && <tr><td colSpan={5} style={{ ...td, color: TOKENS.inkMute }}>None in this period. Key in paper tests under Marks Entry.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ExamCorrector({ exam, toast, onSaved }) {
  const [rows, setRows] = useState(() => exam.answers.map(a => ({ ...a })))
  const [feedback, setFeedback] = useState(exam.feedback || '')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const total = useMemo(() => rows.reduce((t, r) => t + (Number(r.marksAwarded) || 0), 0), [rows])
  const set = (i, k, v) => setRows(p => p.map(r => (r.i === i ? { ...r, [k]: v } : r)))
  const save = async () => {
    setSaving(true)
    try {
      const changed = rows.filter((r, n) => Number(r.marksAwarded) !== exam.answers[n].marksAwarded || r.teacherComment !== exam.answers[n].teacherComment)
      await api.patch('/oversight/exam-submissions/' + exam._id, { answers: changed.map(r => ({ i: r.i, marksAwarded: Number(r.marksAwarded) || 0, teacherComment: r.teacherComment })), feedback, note })
      toast?.ok?.('Exam marks corrected.'); onSaved()
    } catch (e) { toast?.error?.(errMsg(e, 'Could not save.')) }
    finally { setSaving(false) }
  }
  const part = (p) => (p.length ? ' (' + p.map((x, d) => (d % 2 ? ['i', 'ii', 'iii', 'iv', 'v', 'vi'][x] || x + 1 : String.fromCharCode(97 + x))).join(')(') + ')' : '')
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead><tr><th style={th}>Answer</th><th style={th}>Marks</th><th style={th}>Teacher's comment</th></tr></thead>
        <tbody>
          {rows.map((r, n) => (
            <tr key={r.i}>
              <td style={{ ...td, maxWidth: 260 }}><b>Q{n + 1}{part(r.part)}</b> <span style={{ color: TOKENS.inkMute }}>{r.answer || '(no text answer)'}</span></td>
              <td style={td}><input type="number" min="0" step="0.5" value={r.marksAwarded} onChange={e => set(r.i, 'marksAwarded', e.target.value)} style={{ ...inp, width: 70 }} /></td>
              <td style={td}><input value={r.teacherComment} onChange={e => set(r.i, 'teacherComment', e.target.value)} style={{ ...inp, width: '100%' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <label style={lbl}>Overall feedback<textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} /></label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label style={{ ...lbl, flex: '1 1 220px' }}>Reason for the correction<input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Q3 marked against the wrong scheme" maxLength={300} style={inp} /></label>
        <div style={{ fontSize: 13 }}>New total: <b>{total}/{exam.maxScore}</b></div>
        <button type="button" disabled={saving} onClick={save} style={btn(true)}>{saving ? 'Saving…' : 'Save corrections'}</button>
      </div>
    </div>
  )
}

function CommentsTab({ data, toast, refresh }) {
  const save = async (url, body) => {
    try { await api.patch(url, body); toast?.ok?.('Saved.'); refresh() } catch (e) { toast?.error?.(errMsg(e, 'Could not save.')) }
  }
  const edit = (title, current, onText) => {
    const v = window.prompt(title, current || '')
    if (v !== null && v !== current) onText(v)
  }
  const FIELDS = [['classTeacherReport', "Class teacher's report"], ['hodRemarks', "Dean's comment"], ['principalComment', "Principal's comment"]]
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {(data.reports || []).map(r => (
        <div key={r._id} style={box}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{r.termLabel || 'Term ' + r.term} · {r.academicYear}</div>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: r.status === 'published' ? '#065F46' : '#92400E' }}>{r.status === 'published' ? 'Published' : 'Draft'}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <tbody>
              {(r.subjects || []).map(sub => (
                <tr key={sub.subject}>
                  <td style={{ ...td, fontWeight: 700, width: 150 }}>{sub.subject}<div style={{ fontWeight: 400, color: TOKENS.inkMute }}>{sub.weightedScore != null ? sub.weightedScore + '% · ' + (sub.letterGrade || '') : ''}</div></td>
                  <td style={{ ...td, fontStyle: sub.teacherComment ? 'italic' : 'normal', color: sub.teacherComment ? TOKENS.ink : TOKENS.inkMute }}>{sub.teacherComment || 'No comment yet'}</td>
                  <td style={{ ...td, width: 60 }}><button type="button" style={btn(false, true)} onClick={() => edit(`${sub.subject}: teacher's comment`, sub.teacherComment, (text) => save(`/oversight/reports/${r._id}/comment`, { field: 'teacherComment', subject: sub.subject, text }))}>Edit</button></td>
                </tr>
              ))}
              {FIELDS.map(([f, label]) => (
                <tr key={f}>
                  <td style={{ ...td, fontWeight: 700 }}>{label}</td>
                  <td style={{ ...td, color: r[f] ? TOKENS.ink : TOKENS.inkMute }}>{r[f] || '—'}</td>
                  <td style={td}><button type="button" style={btn(false, true)} onClick={() => edit(label, r[f], (text) => save(`/oversight/reports/${r._id}/comment`, { field: f, text }))}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {!data.reports?.length && <div style={{ ...box, color: TOKENS.inkMute, fontSize: 13 }}>No term reports yet. Generate them under Reports.</div>}

      <div style={box}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Weekly reports</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <tbody>
            {(data.weekly || []).map(w => (
              <tr key={w._id}>
                <td style={{ ...td, width: 170 }}><b>{w.subject}</b><div style={{ color: TOKENS.inkMute }}>{[w.week, w.teacherName].filter(Boolean).join(' · ')}</div></td>
                <td style={{ ...td, color: w.remarks ? TOKENS.ink : TOKENS.inkMute }}>{w.remarks || 'No remark'}</td>
                <td style={{ ...td, width: 60 }}><button type="button" style={btn(false, true)} onClick={() => edit(`${w.subject} (${w.week || w.period}): remark`, w.remarks, (remarks) => save('/oversight/weekly/' + w._id, { remarks }))}>Edit</button></td>
              </tr>
            ))}
            {!data.weekly?.length && <tr><td style={{ ...td, color: TOKENS.inkMute }}>No weekly reports in this period.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const KIND = { attendance: 'Attendance', exam_mark: 'Exam mark', keyed_mark: 'Keyed mark', report_comment: 'Report comment', weekly_comment: 'Weekly remark', class_teacher: 'Class teacher' }
function HistoryTab({ rows }) {
  return (
    <div style={{ ...box, padding: 0, overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead><tr><th style={th}>When</th><th style={th}>What</th><th style={th}>Change</th><th style={th}>By</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r._id}>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>{fmt(r.createdAt)} {fmtT(r.createdAt)}</td>
              <td style={td}><b>{KIND[r.kind] || r.kind}</b><div style={{ color: TOKENS.inkMute }}>{r.label}</div></td>
              <td style={td}>{r.before || '—'} → <b>{r.after || '—'}</b>{r.note && <div style={{ color: TOKENS.inkMute }}>{r.note}</div>}</td>
              <td style={td}>{r.byName}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={4} style={{ ...td, color: TOKENS.inkMute }}>No corrections yet.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
