import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'

/**
 * MasteryModule: per-student mastery evidence and early-warning indicators.
 * Every flag shows the transparent rule behind it, so staff can defend the
 * numbers to parents and accreditation visitors.
 */
const RISK = {
  high: { label: 'At risk', bg: '#FEE2E2', fg: '#B91C1C' },
  watch: { label: 'Watch', bg: '#FEF3C7', fg: '#92400E' },
  ok: { label: 'On track', bg: '#DCFCE7', fg: '#15803D' },
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'never')
const Val = ({ v, suffix = '%' }) => (v === null || v === undefined ? <span style={{ color: TOKENS.s400 }}>&ndash;</span> : <>{v}{suffix}</>)

export default function MasteryModule({ toast }) {
  const [rows, setRows] = useState([])
  const [rules, setRules] = useState({})
  const [loading, setLoading] = useState(true)
  const [grade, setGrade] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(null)      // drill-down payload
  const [openBusy, setOpenBusy] = useState(false)
  const [ivTab, setIvTab] = useState(false)         // false = cohort, true = interventions
  const [ivRows, setIvRows] = useState([])
  const [logFor, setLogFor] = useState(null)         // { studentId, name, flags, metric }
  const [ivForm, setIvForm] = useState({ flag: '', action: '', dueDate: '' })

  const loadInterventions = () => api.get('/snapshots/interventions')
    .then(r => setIvRows(r.data?.data?.rows || [])).catch(() => setIvRows([]))
  useEffect(() => { loadInterventions() }, [])

  const load = useCallback(() => {
    setLoading(true)
    api.get('/mastery/overview', { params: grade ? { grade } : {} })
      .then(r => { setRows(r.data?.data?.rows || []); setRules(r.data?.data?.rules || {}) })
      .catch(() => toast?.error?.('Could not load mastery data.'))
      .finally(() => setLoading(false))
  }, [grade])
  useEffect(() => { load() }, [load])

  const drill = async (r) => {
    setOpenBusy(true)
    try { const res = await api.get('/mastery/student/' + r._id); setOpen(res.data?.data) }
    catch { toast?.error?.('Could not load the student breakdown.') }
    finally { setOpenBusy(false) }
  }

  const grades = [...new Set(rows.map(r => r.grade).filter(Boolean))].sort()
  const filtered = rows.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()))
  const counts = { high: rows.filter(r => r.risk === 'high').length, watch: rows.filter(r => r.risk === 'watch').length }

  const th = { padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.s500, borderBottom: `1.5px solid ${TOKENS.line}` }
  const td = { padding: '10px 12px', fontSize: 13, color: TOKENS.s800, borderBottom: `1px solid ${TOKENS.line}` }

  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 1080 }}>
      <div>
        <h2 style={{ fontSize: 21, fontWeight: 800, color: TOKENS.s900, margin: 0 }}>Mastery & Early Warning</h2>
        <p style={{ fontSize: 13, color: TOKENS.s500, margin: '4px 0 0' }}>
          Per-student mastery from exams, homework, quizzes and attendance. Flags use transparent rules, listed under the table, so every number can be explained to a parent or an accreditation visitor.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {['high', 'watch'].map(k => (
          <span key={k} style={{ padding: '8px 14px', borderRadius: 10, background: RISK[k].bg, color: RISK[k].fg, fontSize: 13, fontWeight: 800 }}>
            {counts[k]} {RISK[k].label.toLowerCase()}
          </span>
        ))}
        <select value={grade} onChange={e => setGrade(e.target.value)} style={{ padding: '8px 12px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 9, fontSize: 13 }}>
          <option value="">All grades</option>
          {grades.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..."
          style={{ flex: 1, minWidth: 180, padding: '8px 12px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 9, fontSize: 13 }} />
      </div>

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: TOKENS.s500 }}>Crunching the evidence...</div> : (
        <div style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead><tr>
              <th style={th}>Student</th><th style={th}>Exam avg</th><th style={th}>Quiz acc.</th>
              <th style={th}>Attend. 30d</th><th style={th}>Last active</th><th style={th}>Flags</th><th style={th}>Status</th><th style={th}></th>
            </tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id} onClick={() => drill(r)} style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = TOKENS.cream} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={td}><b>{r.name}</b><span style={{ color: TOKENS.s400, fontSize: 11.5 }}> {r.grade}</span></td>
                  <td style={td}><Val v={r.examAvg} />{r.examCount ? <span style={{ color: TOKENS.s400, fontSize: 11 }}> ({r.examCount})</span> : null}</td>
                  <td style={td}><Val v={r.quizAcc} />{r.quizTrend !== null && r.quizTrend !== undefined && <span style={{ fontSize: 11, fontWeight: 800, color: r.quizTrend < 0 ? '#B91C1C' : '#15803D' }}> {r.quizTrend > 0 ? '+' : ''}{r.quizTrend}</span>}</td>
                  <td style={td}><Val v={r.attendance30} /></td>
                  <td style={td}>{fmtDate(r.lastActive)}</td>
                  <td style={td}>{r.flags.map(f => <span key={f.code} title={f.rule} style={{ display: 'inline-block', padding: '2px 8px', marginRight: 4, borderRadius: 999, background: '#FEF3C7', color: '#92400E', fontSize: 10.5, fontWeight: 800 }}>{f.code}</span>)}</td>
                  <td style={td}><span style={{ padding: '3px 10px', borderRadius: 999, background: RISK[r.risk].bg, color: RISK[r.risk].fg, fontSize: 11.5, fontWeight: 800 }}>{RISK[r.risk].label}</span></td>
                  <td style={td}><button onClick={(e) => { e.stopPropagation(); setLogFor({ studentId: r._id, name: r.name, flags: r.flags, metric: 'attendance ' + (r.attendance30 ?? '?') + '% / exam ' + (r.examAvg ?? '?') + '%' }); setIvForm({ flag: r.flags[0]?.code || 'OTHER', action: '', dueDate: new Date(Date.now() + 14 * 864e5).toISOString().split('T')[0] }) }} style={{ padding: '4px 10px', borderRadius: 7, border: `1px solid ${TOKENS.line}`, background: '#fff', fontSize: 10.5, fontWeight: 800, cursor: 'pointer', color: TOKENS.crimson }}>Act</button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td style={td} colSpan={8}>No students match.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ fontSize: 11.5, color: TOKENS.s500, lineHeight: 1.7 }}>
        <b>Flag rules:</b> {Object.entries(rules).map(([k, v]) => <span key={k}>{k}: {v}. </span>)}
      </div>

      {openBusy && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.25)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>Loading breakdown...</div>}
      {open && (
        <div onClick={() => setOpen(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 95, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: 'min(860px,100%)', maxHeight: '92vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 19, fontWeight: 900, color: TOKENS.s900 }}>{open.student.name} <span style={{ fontWeight: 600, fontSize: 13, color: TOKENS.s500 }}>{open.student.grade}</span></div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 999, background: RISK[open.summary.risk].bg, color: RISK[open.summary.risk].fg, fontSize: 11.5, fontWeight: 800 }}>{RISK[open.summary.risk].label}</span>
                  {open.summary.flags.map(f => <span key={f.code} style={{ padding: '3px 10px', borderRadius: 999, background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 700 }}>{f.rule}</span>)}
                </div>
              </div>
              <button onClick={() => setOpen(null)} style={{ background: TOKENS.cream, border: 'none', borderRadius: 999, width: 32, height: 32, cursor: 'pointer', fontWeight: 800, color: TOKENS.s500 }}>&times;</button>
            </div>

            {open.subjects.length === 0 && <p style={{ color: TOKENS.s500, fontSize: 13, marginTop: 16 }}>No graded work yet for this student.</p>}
            <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
              {open.subjects.map(s => (
                <div key={s.subject} style={{ border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                    <b style={{ fontSize: 15, color: TOKENS.s900 }}>{s.subject}</b>
                    <span style={{ fontSize: 12.5, color: TOKENS.s600 }}>Exams: <b><Val v={s.examAvg} /></b>{s.examCount ? ` (${s.examCount})` : ''}</span>
                    <span style={{ fontSize: 12.5, color: TOKENS.s600 }}>Quiz accuracy: <b><Val v={s.quizAcc} /></b>{s.quizN ? ` (${s.quizN} answers)` : ''}</span>
                    <span style={{ fontSize: 12.5, color: TOKENS.s600 }}>Homework submitted: <b>{s.hwCount}</b></span>
                  </div>
                  {s.examSeries?.length > 1 && (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 44, marginTop: 12 }}>
                      {s.examSeries.map((e, i) => (
                        <div key={i} title={`${e.title}: ${Math.round(e.p)}% (${fmtDate(e.at)})`}
                          style={{ width: 22, height: Math.max(4, e.p * .4), borderRadius: 3, background: e.p >= 50 ? '#15803D' : '#B91C1C', opacity: .85 }} />
                      ))}
                    </div>
                  )}
                  {(s.weakest?.length || 0) > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '.08em' }}>Needs work</div>
                        {s.weakest.map(t => <div key={t.topic} style={{ fontSize: 12.5, color: TOKENS.s700, marginTop: 4 }}>{t.topic} <b>{t.accuracy}%</b> <span style={{ color: TOKENS.s400, fontSize: 11 }}>({t.attempts})</span></div>)}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#15803D', textTransform: 'uppercase', letterSpacing: '.08em' }}>Strengths</div>
                        {s.strongest.map(t => <div key={t.topic} style={{ fontSize: 12.5, color: TOKENS.s700, marginTop: 4 }}>{t.topic} <b>{t.accuracy}%</b> <span style={{ color: TOKENS.s400, fontSize: 11 }}>({t.attempts})</span></div>)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {open.attendance?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: TOKENS.s500, textTransform: 'uppercase', letterSpacing: '.08em' }}>Attendance, last 60 days</div>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 8 }}>
                  {open.attendance.map((a, i) => (
                    <span key={i} title={`${fmtDate(a.date)}: ${a.status}`} style={{ width: 12, height: 12, borderRadius: 3, background: a.status === 'present' ? '#15803D' : a.status === 'late' || a.status === 'half_day' ? '#D97706' : '#B91C1C', opacity: .85 }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Intervention register: the act-and-verify half of early warning */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <b style={{ fontSize: 14.5, color: TOKENS.s900 }}>Interventions</b>
        <span style={{ fontSize: 11.5, color: TOKENS.s500 }}>what we did about each flag, and whether it worked</span>
        <span style={{ flex: 1 }} />
        <button onClick={() => setIvTab(v => !v)} style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${TOKENS.line}`, background: '#fff', color: TOKENS.s600, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>{ivTab ? 'Hide' : `Show (${ivRows.filter(r => r.status === 'open').length} open)`}</button>
      </div>
      {ivTab && (
        <div style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead><tr>{['Student', 'Flag', 'Action', 'Owner', 'Review by', 'Status', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>{ivRows.map(iv => {
              const overdue = iv.status === 'open' && new Date(iv.dueDate) < new Date()
              return (
                <tr key={iv._id}>
                  <td style={{ ...td, fontWeight: 700 }}>{iv.studentId ? `${iv.studentId.firstName || ''} ${iv.studentId.lastName || ''}` : '?'}</td>
                  <td style={td}>{iv.flag}</td>
                  <td style={{ ...td, maxWidth: 260 }}>{iv.action}<div style={{ fontSize: 10.5, color: TOKENS.s400 }}>{iv.metricAtStart}</div></td>
                  <td style={td}>{iv.owner ? `${iv.owner.firstName || ''} ${iv.owner.lastName || ''}` : ''}</td>
                  <td style={{ ...td, fontWeight: 700, color: overdue ? '#B91C1C' : TOKENS.s800 }}>{new Date(iv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{overdue ? ' · overdue' : ''}</td>
                  <td style={td}>{iv.status === 'closed'
                    ? <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 800, background: iv.outcome === 'improved' ? '#DCFCE7' : iv.outcome === 'worse' ? '#FEE2E2' : '#F3F4F6', color: iv.outcome === 'improved' ? '#15803D' : iv.outcome === 'worse' ? '#B91C1C' : TOKENS.s600 }}>{iv.outcome === 'no_change' ? 'no change' : iv.outcome}</span>
                    : <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 800, background: '#FEF3C7', color: '#92400E' }}>open</span>}</td>
                  <td style={td}>{iv.status === 'open' && ['improved', 'no_change', 'worse'].map(o => (
                    <button key={o} onClick={async () => {
                      try { await api.patch(`/snapshots/interventions/${iv._id}/close`, { outcome: o }); toast?.ok?.('Closed: ' + o); loadInterventions() }
                      catch (e) { toast?.error?.('Could not close.') }
                    }} style={{ padding: '3px 8px', marginRight: 4, borderRadius: 6, border: `1px solid ${TOKENS.line}`, background: '#fff', fontSize: 9.5, fontWeight: 800, cursor: 'pointer', color: o === 'improved' ? '#15803D' : o === 'worse' ? '#B91C1C' : TOKENS.s600 }}>{o === 'no_change' ? 'same' : o}</button>
                  ))}</td>
                </tr>
              )
            })}
            {ivRows.length === 0 && <tr><td style={td} colSpan={7}>No interventions logged yet. Press Act on a flagged student to start the loop.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Log intervention modal */}
      {logFor && (
        <div onClick={() => setLogFor(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 'min(460px,100%)', padding: 22, display: 'grid', gap: 11 }}>
            <b style={{ fontSize: 16, color: TOKENS.s900 }}>Intervention for {logFor.name}</b>
            <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>Baseline: {logFor.metric}</div>
            <select value={ivForm.flag} onChange={e => setIvForm(f => ({ ...f, flag: e.target.value }))} style={{ padding: '9px 11px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 9, fontSize: 13 }}>
              {[...new Set([...(logFor.flags || []).map(f => f.code), 'OTHER'])].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea value={ivForm.action} onChange={e => setIvForm(f => ({ ...f, action: e.target.value }))} rows={3} placeholder="What are we doing about it? e.g. Parent call + extra maths session Tuesdays; teacher to report weekly."
              style={{ padding: '9px 11px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 9, fontSize: 13, resize: 'vertical' }} />
            <label style={{ fontSize: 11.5, color: TOKENS.s500, fontWeight: 700 }}>Review date (when we check it worked)
              <input type="date" value={ivForm.dueDate} onChange={e => setIvForm(f => ({ ...f, dueDate: e.target.value }))} style={{ display: 'block', marginTop: 4, padding: '9px 11px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 9, fontSize: 13, width: '100%' }} />
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setLogFor(null)} style={{ padding: '8px 16px', borderRadius: 9, border: `1.5px solid ${TOKENS.line}`, background: '#fff', color: TOKENS.s600, fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
              <button onClick={async () => {
                if (!ivForm.action.trim() || !ivForm.dueDate) return toast?.error?.('Action and review date are required.')
                try {
                  await api.post('/snapshots/interventions', { studentId: logFor.studentId, flag: ivForm.flag, action: ivForm.action.trim(), dueDate: ivForm.dueDate, metricAtStart: logFor.metric })
                  toast?.ok?.('Intervention logged. It will appear in the register and the weekly digest.')
                  setLogFor(null); setIvTab(true); loadInterventions()
                } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not log it.') }
              }} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>Log intervention</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
