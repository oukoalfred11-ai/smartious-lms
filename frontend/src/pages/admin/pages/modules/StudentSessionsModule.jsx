import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PCard } from '../shared/ui.jsx'

/**
 * StudentSessionsModule
 * ============================================================
 * Pause / Report Back sessions for student accounts.
 * Used by Admin, DOS, Operations Manager and Finance.
 *
 * A pause suspends portal access for the student AND any
 * linked parent until Report Back — manual, or automatic when
 * the expected return date passes (sessions that expire).
 */

const TYPES = [
  ['holiday',        'Holiday'],
  ['mid_term_break', 'Mid-term break'],
  ['end_term_break', 'End-term break'],
  ['summer_break',   'Summer break'],
  ['medical_leave',  'Medical leave'],
  ['fee_hold',       'Late fee payment hold'],
  ['other',          'Other'],
]
const TYPE_LABELS = Object.fromEntries(TYPES)
const TYPE_COLORS = {
  holiday: '#B45309', mid_term_break: '#1D4ED8', end_term_break: '#1D4ED8',
  summer_break: '#0E7490', medical_leave: '#6D28D9', fee_hold: '#B91C1C', other: '#374151',
}

const fmtD = d => {
  if (!d) return null
  const dt = new Date(d)
  return isNaN(dt) ? null : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const pill = (bg, color) => ({ display: 'inline-block', background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999 })
const btn = (bg, color, extra = {}) => ({ fontSize: 11, background: bg, color, border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontWeight: 700, ...extra })
const inp = { width: '100%', padding: '9px 12px', border: '1px solid ' + TOKENS.line, borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }
const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: TOKENS.s500 || '#6B7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }

function StudentSessionsModule({ toast, refreshKey }) {
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState({ total: 0, paused: 0, active: 0, byType: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('all')
  const [saving, setSaving] = useState(null)
  const [yearsData, setYearsData] = useState(null)   // { cohorts, retention, method }
  const [exiting, setExiting] = useState(null)       // student being exited: { s, kind, reason }
  const loadYears = useCallback(() => {
    api.get('/student-sessions/years').then(r => setYearsData(r.data?.data || null)).catch(() => {})
  }, [])
  useEffect(() => { loadYears() }, [loadYears])

  const currentYearGuess = () => {
    const now = new Date(); const y = now.getFullYear()
    return now.getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`
  }
  const initYear = async () => {
    const year = window.prompt('Initialize which academic year? (every active student is enrolled at their current grade)', currentYearGuess())
    if (!year) return
    try { const r = await api.post('/student-sessions/years/init', { academicYear: year.trim() }); toast?.ok?.(r.data?.message); loadYears() }
    catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not initialize the year.') }
  }
  const promoteYear = async () => {
    const from = window.prompt('Promote FROM which academic year?', currentYearGuess())
    if (!from) return
    const [a, b] = from.trim().split('/').map(Number)
    const to = window.prompt('Promote INTO which academic year?', `${a + 1}/${b + 1}`)
    if (!to) return
    if (!window.confirm(`Promote ${from.trim()} into ${to.trim()}?\n\nEvery continuing student moves up one grade, terminal grades (Year 13, Grade 12, Form 4, DP Year 2) GRADUATE, and ${from.trim()} closes. This is the end-of-year operation - run it once.`)) return
    try { const r = await api.post('/student-sessions/years/promote', { fromYear: from.trim(), toYear: to.trim(), confirm: true }); toast?.ok?.(r.data?.message); loadYears(); load() }
    catch (e) { toast?.error?.(e?.response?.data?.message || 'Promotion failed.') }
  }
  const doExit = async () => {
    if (!exiting?.s) return
    try {
      const r = await api.patch('/student-sessions/exit/' + exiting.s._id, { kind: exiting.kind, reason: exiting.reason })
      toast?.ok?.(r.data?.message); setExiting(null); load(); loadYears()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not update the student.') }
  }
  const [pauseModal, setPauseModal] = useState(null)     // student being paused
  const [form, setForm] = useState({ type: 'holiday', note: '', expectedEnd: '', blockAccess: false })
  const [historyModal, setHistoryModal] = useState(null) // { student, history }
  const [confirmBack, setConfirmBack] = useState(null)   // student to report back

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/student-sessions', { params: { search: search || undefined, status: statusF } }),
      api.get('/student-sessions/stats'),
    ]).then(([r1, r2]) => {
      setStudents(r1.data?.data?.students || [])
      setStats(r2.data?.data || { total: 0, paused: 0, active: 0, byType: {} })
    }).catch(() => toast?.error?.('Failed to load student sessions.'))
      .finally(() => setLoading(false))
  }, [search, statusF, refreshKey])

  useEffect(() => { const t = setTimeout(load, search ? 350 : 0); return () => clearTimeout(t) }, [load])

  const openPause = (s) => { setForm({ type: 'holiday', note: '', expectedEnd: '', blockAccess: false }); setPauseModal(s) }

  const doPause = async () => {
    if (!pauseModal) return
    if (form.type !== 'fee_hold' && !form.expectedEnd) {
      toast?.error?.('Set an expected return date, or use a fee hold for open-ended pauses.'); return
    }
    setSaving(pauseModal._id)
    try {
      const { data } = await api.post('/student-sessions/pause', {
        studentId: pauseModal._id, type: form.type, note: form.note,
        expectedEnd: form.expectedEnd || null, blockAccess: form.blockAccess,
      })
      toast?.ok?.(data.message)
      setPauseModal(null); load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Failed to pause.') }
    finally { setSaving(null) }
  }

  const doReportBack = async () => {
    const s = confirmBack
    if (!s) return
    setSaving(s._id)
    try {
      const { data } = s.activePause
        ? await api.patch('/student-sessions/' + s.activePause._id + '/report-back')
        : await api.patch('/student-sessions/report-back-by-student/' + s._id)
      toast?.ok?.(data.message)
      setConfirmBack(null); load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Failed to report back.') }
    finally { setSaving(null) }
  }

  const openHistory = async (s) => {
    try {
      const { data } = await api.get('/student-sessions/history/' + s._id)
      setHistoryModal({ student: s, history: data?.data?.history || [] })
    } catch { toast?.error?.('Failed to load history.') }
  }

  const parentLabel = (s) => {
    const linked = (s.linkedParents || []).map(p => (p.firstName + ' ' + p.lastName).trim()).filter(Boolean)
    if (linked.length) return linked.join(', ')
    return s.parentName || '—'
  }

  const modalBox = { position: 'fixed', inset: 0, background: 'rgba(8,12,20,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }
  const modalCard = { background: '#fff', borderRadius: 14, padding: '26px 28px', width: 460, maxWidth: '92vw', maxHeight: '86vh', overflowY: 'auto' }

  return (
    <div>
      {/* ── Academic years, cohorts and retention ── */}
      <div style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <b style={{ fontSize: 14.5, color: TOKENS.s900 }}>Academic years</b>
          <span style={{ fontSize: 11.5, color: TOKENS.s500 }}>cohorts like 2026/2027 Year 7, and the retention they produce</span>
          <span style={{ flex: 1 }} />
          <button onClick={initYear} style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${TOKENS.crimson}`, background: '#fff', color: TOKENS.crimson, fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>Initialize year</button>
          <button onClick={promoteYear} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>Promote year (end of year)</button>
        </div>
        {yearsData && yearsData.retention?.length > 0 && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            {yearsData.retention.map(r => (
              <div key={r.from} style={{ background: '#FBF8F3', borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: r.pct === null ? TOKENS.s400 : r.pct >= 85 ? '#15803D' : r.pct >= 70 ? '#B45309' : '#B91C1C' }}>{r.pct === null ? '\u2013' : r.pct + '%'}</div>
                <div style={{ fontSize: 10.5, color: TOKENS.s500, fontWeight: 700 }}>Retention {r.from} \u2192 {r.to}</div>
                <div style={{ fontSize: 10, color: TOKENS.s400 }}>{r.retained} of {r.eligible} continued</div>
              </div>
            ))}
          </div>
        )}
        {yearsData && yearsData.cohorts?.length > 0 ? yearsData.cohorts.map(c => (
          <details key={c.academicYear} style={{ marginBottom: 6 }}>
            <summary style={{ fontSize: 12.5, fontWeight: 800, color: TOKENS.s800, cursor: 'pointer' }}>{c.academicYear} \u00b7 {c.total} student(s)</summary>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, marginTop: 6 }}>
              <thead><tr>{['Grade', 'Total', 'Active', 'On break', 'Withdrawn', 'Graduated', 'Completed'].map(h => <th key={h} style={{ textAlign: 'left', padding: '5px 8px', background: '#F7F2EA', border: `1px solid ${TOKENS.line}` }}>{h}</th>)}</tr></thead>
              <tbody>{c.grades.map(g => <tr key={g.grade}>{[g.grade, g.total, g.active || 0, g.break || 0, g.withdrawn || 0, g.graduated || 0, g.completed || 0].map((v, i) => <td key={i} style={{ padding: '4px 8px', border: `1px solid ${TOKENS.line}` }}>{v}</td>)}</tr>)}</tbody>
            </table>
          </details>
        )) : (
          <div style={{ fontSize: 12, color: TOKENS.s500 }}>
            No academic years yet. Press <b>Initialize year</b> to enroll every active student into the current year at their grade \u2014 cohorts and retention start from that snapshot.
          </div>
        )}
      </div>

      {/* ── Exit modal: left or graduated ── */}
      {exiting && (
        <div onClick={() => setExiting(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 'min(430px,100%)', padding: 20, display: 'grid', gap: 10 }}>
            <b style={{ fontSize: 15, color: TOKENS.s900 }}>{exiting.kind === 'graduated' ? 'Mark graduated' : 'Mark as left'} \u00b7 {exiting.s.firstName} {exiting.s.lastName}</b>
            <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>Closes their enrollment record and account together: they leave rosters, timetables and portals, their history stays, and retention data records the exit.</div>
            <textarea value={exiting.reason} onChange={e => setExiting(x => ({ ...x, reason: e.target.value }))} rows={2}
              placeholder={exiting.kind === 'graduated' ? 'e.g. Completed Year 13, June 2027' : 'Reason, e.g. relocated, moved schools, fees'}
              style={{ padding: '8px 10px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 8, fontSize: 12.5, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setExiting(null)} style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${TOKENS.line}`, background: '#fff', color: TOKENS.s600, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
              <button onClick={doExit} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: exiting.kind === 'graduated' ? '#15803D' : '#B91C1C', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{exiting.kind === 'graduated' ? 'Graduate student' : 'Confirm left'}</button>
            </div>
          </div>
        </div>
      )}
      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        {[
          ['Total students', stats.total, TOKENS.ink || '#080C14'],
          ['Active', stats.active, '#065F46'],
          ['Paused', stats.paused, TOKENS.crimson],
          ['Fee holds', stats.byType?.fee_hold || 0, '#B91C1C'],
        ].map(([label, val, color]) => (
          <PCard key={label} style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.s500 || '#6B7280', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>{val}</div>
          </PCard>
        ))}
      </div>

      <PCard style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid ' + TOKENS.line, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email or admission number" style={{ ...inp, width: 280 }} />
          <select value={statusF} onChange={e => setStatusF(e.target.value)} style={{ ...inp, width: 160 }}>
            <option value="all">All students</option>
            <option value="paused">Paused only</option>
            <option value="active">Active only</option>
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: TOKENS.s500 || '#6B7280' }}>
            Fee holds block portal access for student and parent; holidays and breaks keep access while pausing reminders and check-in.
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: TOKENS.s500 || '#6B7280' }}>Loading student sessions...</div>
        ) : students.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: TOKENS.s500 || '#6B7280' }}>No students match this filter.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: TOKENS.cream || '#FDFAF4', textAlign: 'left' }}>
                {['Student', 'Grade / Curriculum', 'Linked parent', 'Status', 'Session window', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: TOKENS.s500 || '#6B7280', textTransform: 'uppercase', letterSpacing: '.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const tColor = TYPE_COLORS[s.breakType] || '#374151'
                return (
                  <tr key={s._id} style={{ borderTop: '1px solid ' + TOKENS.line, background: s.onBreak ? '#FFFBF5' : '#fff' }}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontWeight: 700 }}>{s.firstName} {s.lastName}</div>
                      <div style={{ fontSize: 11, color: TOKENS.s500 || '#6B7280' }}>{s.admissionNumber || s.email}</div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12 }}>
                      {[s.gradeLevel, s.curriculum].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12 }}>{parentLabel(s)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      {s.onBreak ? (
                        <div>
                          <span style={pill('#FEF3C7', tColor)}>{TYPE_LABELS[s.breakType] || 'Paused'}</span>
                          <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, color: s.breakBlocksAccess ? '#B91C1C' : '#065F46' }}>
                            {s.breakBlocksAccess ? 'ACCESS BLOCKED' : 'ACCESS ALLOWED'}
                          </div>
                        </div>
                      ) : <span style={pill('#D1FAE5', '#065F46')}>Active</span>}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12 }}>
                      {s.onBreak ? (
                        <div>
                          <div>{fmtD(s.breakStart) || '—'} → {fmtD(s.breakEnd) || 'until further notice'}</div>
                          {s.breakEnd && <div style={{ fontSize: 10.5, color: '#065F46', fontWeight: 700 }}>Auto-restores on return date</div>}
                          {s.breakNote && <div style={{ fontSize: 11, color: TOKENS.s500 || '#6B7280', marginTop: 2 }}>{s.breakNote}</div>}
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {s.onBreak ? (
                          <button disabled={saving === s._id} onClick={() => setConfirmBack(s)} style={btn('#065F46', '#fff')}>Report Back</button>
                        ) : (
                          <button disabled={saving === s._id} onClick={() => openPause(s)} style={btn(TOKENS.crimson, '#fff')}>Pause</button>
                        )}
                        <button onClick={() => openHistory(s)} style={btn(TOKENS.cream || '#FDFAF4', TOKENS.crimson, { border: '1px solid ' + TOKENS.line })}>History</button>
              <button onClick={() => setExiting({ s, kind: 'withdrawn', reason: '' })}
                style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #FCA5A5', background: '#fff', fontSize: 10.5, fontWeight: 800, cursor: 'pointer', color: '#B91C1C' }}>Left</button>
              <button onClick={() => setExiting({ s, kind: 'graduated', reason: '' })}
                style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #86EFAC', background: '#fff', fontSize: 10.5, fontWeight: 800, cursor: 'pointer', color: '#15803D' }}>Graduate</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </PCard>

      {/* Pause modal */}
      {pauseModal && (
        <div style={modalBox} onClick={() => setPauseModal(null)}>
          <div style={modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Pause {pauseModal.firstName} {pauseModal.lastName}</div>
            <div style={{ fontSize: 12.5, color: TOKENS.s500 || '#6B7280', marginBottom: 16 }}>
              The student and any linked parent will lose portal access until Report Back. Their data, progress and materials are unaffected.
            </div>

            <label style={lbl}>Pause type</label>
            <select value={form.type} onChange={e => { const t = e.target.value; setForm(f => ({ ...f, type: t, blockAccess: t === 'fee_hold' })) }} style={{ ...inp, marginBottom: 14 }}>
              {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>

            <label style={lbl}>Expected return date {form.type === 'fee_hold' ? '(optional — fee holds stay until cleared)' : ''}</label>
            <input type="date" value={form.expectedEnd} onChange={e => setForm(f => ({ ...f, expectedEnd: e.target.value }))} style={{ ...inp, marginBottom: 6 }} />
            <div style={{ fontSize: 11.5, color: '#065F46', fontWeight: 600, marginBottom: 14 }}>
              With a return date set, the session expires and access is restored automatically — no manual step needed.
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: form.blockAccess ? '#FEF2F2' : '#F0FDF4', border: '1px solid ' + (form.blockAccess ? '#FECACA' : '#BBF7D0'), borderRadius: 8, padding: '10px 12px', marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.blockAccess} onChange={e => setForm(f => ({ ...f, blockAccess: e.target.checked }))} style={{ marginTop: 2 }} />
              <span style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                <strong>{form.blockAccess ? 'Portal access suspended' : 'Portal access kept'}</strong><br />
                {form.blockAccess
                  ? 'The student and linked parent cannot log in until Report Back. Standard for fee holds.'
                  : 'The student can still log in for homework and personal studies. Reminders and check-in are paused. Standard for holidays and breaks.'}
              </span>
            </label>

            <label style={lbl}>Note (shown to the family{form.blockAccess ? ' on their paused screen' : ''})</label>
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical', marginBottom: 18 }} placeholder="e.g. Resumes after the December holiday. Contact accounts to settle Term 3 fees." />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setPauseModal(null)} style={btn(TOKENS.cream || '#FDFAF4', TOKENS.ink || '#080C14', { border: '1px solid ' + TOKENS.line, padding: '9px 16px' })}>Cancel</button>
              <button disabled={saving === pauseModal._id} onClick={doPause} style={btn(TOKENS.crimson, '#fff', { padding: '9px 16px' })}>
                {saving === pauseModal._id ? 'Pausing...' : 'Pause account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Back confirm */}
      {confirmBack && (
        <div style={modalBox} onClick={() => setConfirmBack(null)}>
          <div style={{ ...modalCard, width: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>Mark as Reported Back</div>
            <div style={{ fontSize: 13.5, color: TOKENS.s500 || '#6B7280', lineHeight: 1.6, marginBottom: 18 }}>
              Restore portal access for <strong>{confirmBack.firstName} {confirmBack.lastName}</strong> and their linked parent immediately?
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmBack(null)} style={btn(TOKENS.cream || '#FDFAF4', TOKENS.ink || '#080C14', { border: '1px solid ' + TOKENS.line, padding: '9px 16px' })}>Cancel</button>
              <button disabled={saving === confirmBack._id} onClick={doReportBack} style={btn('#065F46', '#fff', { padding: '9px 16px' })}>
                {saving === confirmBack._id ? 'Restoring...' : 'Report Back'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History modal */}
      {historyModal && (
        <div style={modalBox} onClick={() => setHistoryModal(null)}>
          <div style={{ ...modalCard, width: 540 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14 }}>
              Session history — {historyModal.student.firstName} {historyModal.student.lastName}
            </div>
            {historyModal.history.length === 0 ? (
              <div style={{ color: TOKENS.s500 || '#6B7280', fontSize: 13, padding: '12px 0' }}>No pause sessions recorded for this student.</div>
            ) : historyModal.history.map(h => (
              <div key={h._id} style={{ borderTop: '1px solid ' + TOKENS.line, padding: '11px 2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <span style={pill(h.status === 'active' ? '#FEF3C7' : '#F3F4F6', h.status === 'active' ? (TYPE_COLORS[h.type] || '#374151') : '#6B7280')}>
                    {TYPE_LABELS[h.type] || h.type}{h.blockAccess ? ' · access blocked' : ''}{h.status === 'active' ? ' · ACTIVE' : ''}
                  </span>
                  <span style={{ fontSize: 11.5, color: TOKENS.s500 || '#6B7280' }}>
                    {fmtD(h.startAt)} → {h.status === 'ended' ? (fmtD(h.endedAt) || '—') : (fmtD(h.expectedEnd) || 'open')}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: TOKENS.s500 || '#6B7280', marginTop: 5 }}>
                  Paused by {h.createdBy ? `${h.createdBy.firstName} ${h.createdBy.lastName} (${h.createdBy.role})` : '—'}
                  {h.status === 'ended' && (h.autoEnded
                    ? ' · auto-restored on expiry'
                    : h.endedBy ? ` · reported back by ${h.endedBy.firstName} ${h.endedBy.lastName}` : '')}
                </div>
                {h.note && <div style={{ fontSize: 12, marginTop: 4 }}>{h.note}</div>}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setHistoryModal(null)} style={btn(TOKENS.cream || '#FDFAF4', TOKENS.ink || '#080C14', { border: '1px solid ' + TOKENS.line, padding: '9px 16px' })}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentSessionsModule
