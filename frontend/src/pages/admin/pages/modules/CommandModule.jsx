import React, { useState, useEffect } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { AnalyticsStrip } from '../shared/charts.jsx'

/**
 * CommandModule: the landing page for academic and business leadership.
 * Six KPI cards with week-over-week arrows, one exception list titled
 * "Needs you today", and the school trend. Everything else in the portal
 * is one click deeper; this page answers "how are we, and what needs me"
 * in ten seconds.
 */
const Arrow = ({ now, prev, goodUp = true, suffix = '' }) => {
  if (now === null || now === undefined || prev === null || prev === undefined) return null
  const d = Math.round((now - prev) * 10) / 10
  if (d === 0) return <span style={{ fontSize: 11, color: TOKENS.s400, fontWeight: 700 }}>{'\u2192'} level</span>
  const up = d > 0
  const good = up === goodUp
  return <span style={{ fontSize: 11, fontWeight: 800, color: good ? '#15803D' : '#B91C1C' }}>{up ? '\u2191' : '\u2193'} {Math.abs(d)}{suffix} wk</span>
}

const fmtMoney = (n) => (n === null || n === undefined) ? '\u2013' : new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(n)

export default function CommandModule({ toast, role = 'dos' }) {
  const [wk, setWk] = useState(null)         // this week rollup
  const [pwk, setPwk] = useState(null)       // prior week
  const [mastery, setMastery] = useState(null)
  const [ivs, setIvs] = useState([])
  const [churn, setChurn] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [funnel, setFunnel] = useState(null)
  const [past, setPast] = useState([])
  const isOps = role === 'ops_manager' || role === 'admin'

  useEffect(() => {
    api.get('/snapshots', { params: { scope: 'school', days: 7 } }).then(r => setWk(r.data?.data?.summary)).catch(() => {})
    api.get('/snapshots', { params: { scope: 'school', days: 14 } }).then(r => {
      // prior week = 14d summary minus this week is messy; fetch rows and compute
      const rows = r.data?.data?.rows || []
      const split = rows.length - 7
      const sum = (rs) => {
        const t = { att: 0, sch: 0, es: 0, en: 0, sess: 0 }
        rs.forEach(x => { t.att += x.attended || 0; t.sch += x.scheduled || 0; t.es += (x.examAvg || 0) * (x.examN || 0); t.en += x.examN || 0; t.sess += x.sessionsHeld || 0 })
        return { attendancePct: t.sch ? Math.round((t.att / t.sch) * 1000) / 10 : null, examAvg: t.en ? Math.round((t.es / t.en) * 10) / 10 : null, sessionsHeld: t.sess }
      }
      setPwk(sum(rows.slice(0, Math.max(split, 0))))
    }).catch(() => {})
    api.get('/mastery/overview').then(r => {
      const rows = r.data?.data?.rows || []
      setMastery({ high: rows.filter(x => x.risk === 'high').length, watch: rows.filter(x => x.risk === 'watch').length, top: rows.filter(x => x.risk === 'high').slice(0, 5) })
    }).catch(() => {})
    api.get('/snapshots/interventions', { params: { status: 'open' } }).then(r => setIvs(r.data?.data?.rows || [])).catch(() => {})
    api.get('/classroom/live/all').then(r => setPast((r.data?.data?.past || []).filter(c => c.joined === 0 && c.kind === 'lesson').slice(0, 5))).catch(() => {})
    if (isOps) {
      api.get('/ops-reports/churn').then(r => setChurn(r.data?.data)).catch(() => {})
      api.get('/ops-reports/revenue').then(r => setRevenue(r.data?.data)).catch(() => {})
      api.get('/ops-reports/funnel').then(r => setFunnel(r.data?.data)).catch(() => {})
    }
  }, [isOps])

  const dueIvs = ivs.filter(i => new Date(i.dueDate) <= new Date())
  const card = (label, value, sub, arrow) => (
    <div key={label} style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: TOKENS.s900 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: TOKENS.s500, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>{label} {arrow}</div>
      {sub && <div style={{ fontSize: 10.5, color: TOKENS.s400, marginTop: 2 }}>{sub}</div>}
    </div>
  )

  const need = []
  if (mastery?.high) need.push({ tag: 'ACADEMIC', color: '#B91C1C', text: `${mastery.high} student(s) at high risk`, detail: mastery.top.map(t => t.name).join(', '), go: 'Mastery & Early Warning' })
  if (dueIvs.length) need.push({ tag: 'REVIEW', color: '#B45309', text: `${dueIvs.length} intervention(s) past review date`, detail: dueIvs.slice(0, 3).map(i => i.studentId ? `${i.studentId.firstName || ''} ${i.studentId.lastName || ''}` : '?').join(', '), go: 'Mastery \u2192 Interventions' })
  if (past.length) need.push({ tag: 'DELIVERY', color: '#B91C1C', text: `${past.length} recent class(es) DID NOT RUN`, detail: past.map(p => p.teacher || p.title).join(', '), go: 'Live Classes \u2192 Past' })
  if (isOps && churn?.high) need.push({ tag: 'RETENTION', color: '#B91C1C', text: `${churn.high} family(ies) at leaving risk`, detail: churn.rows.slice(0, 3).map(r => `${r.name} (${r.signals[0] || ''})`).join('; '), go: 'Business \u2192 Churn' })
  if (isOps && revenue?.aging?.length) {
    const old = revenue.aging.filter(a => a.bucket === '31-60d' || a.bucket === '60d+')
    const amt = old.reduce((t, a) => t + a.amount, 0)
    if (amt > 0) need.push({ tag: 'CASH', color: '#B45309', text: `${fmtMoney(amt)} unpaid over 30 days (${old.reduce((t, a) => t + a.n, 0)} invoices)`, detail: 'Oldest first in Billing \u2192 aging', go: 'Billing & Invoices' })
  }

  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 1100 }}>
      <div>
        <h2 style={{ fontSize: 21, fontWeight: 800, color: TOKENS.s900, margin: 0 }}>Command</h2>
        <p style={{ fontSize: 13, color: TOKENS.s500, margin: '4px 0 0' }}>How the school is doing this week, and what needs you today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {card('Attendance', wk?.attendancePct !== null && wk?.attendancePct !== undefined ? wk.attendancePct + '%' : '\u2013',
          wk ? `${wk.attended} of ${wk.scheduled} this week` : '', <Arrow now={wk?.attendancePct} prev={pwk?.attendancePct} suffix="pp" />)}
        {card('Exam average', wk?.examAvg !== null && wk?.examAvg !== undefined ? wk.examAvg + '%' : '\u2013',
          wk ? `${wk.examN} graded` : '', <Arrow now={wk?.examAvg} prev={pwk?.examAvg} suffix="pp" />)}
        {card('Lessons held', wk?.sessionsHeld ?? '\u2013', 'this week', <Arrow now={wk?.sessionsHeld} prev={pwk?.sessionsHeld} />)}
        {card('At risk', mastery ? mastery.high : '\u2013', mastery ? `${mastery.watch} on watch` : '', null)}
        {isOps && card('Leaving risk', churn ? churn.high : '\u2013', churn ? `${churn.watch} families on watch` : '', null)}
        {isOps && card('Collected this month', revenue ? fmtMoney(revenue.collected) : '\u2013',
          revenue ? `of ${fmtMoney(revenue.issued)} issued (${revenue.collectionPct ?? '\u2013'}%)` : '', null)}
        {isOps && card('Pipeline', funnel ? funnel.activePipeline : '\u2013',
          funnel ? `${funnel.conversionPct ?? '\u2013'}% convert to enrolled (90d)` : '', null)}
      </div>

      {/* Needs you today */}
      <div style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: '14px 16px' }}>
        <b style={{ fontSize: 14, color: TOKENS.s900 }}>Needs you today</b>
        {need.length === 0 ? (
          <div style={{ fontSize: 12.5, color: '#15803D', fontWeight: 700, marginTop: 8 }}>Nothing urgent. The exceptions list is clear.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {need.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', padding: '8px 10px', background: '#FBF8F3', borderRadius: 9 }}>
                <span style={{ fontSize: 9.5, fontWeight: 900, color: '#fff', background: n.color, padding: '2px 8px', borderRadius: 999, letterSpacing: '.05em' }}>{n.tag}</span>
                <b style={{ fontSize: 12.5, color: TOKENS.s900 }}>{n.text}</b>
                <span style={{ fontSize: 11.5, color: TOKENS.s500, flex: 1, minWidth: 160 }}>{n.detail}</span>
                <span style={{ fontSize: 10.5, color: TOKENS.s400, fontWeight: 700 }}>{n.go}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ops: revenue + funnel snapshot rows */}
      {isOps && revenue && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          <div style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: '14px 16px' }}>
            <b style={{ fontSize: 13, color: TOKENS.s900 }}>Unpaid invoice aging</b>
            {revenue.aging.map(a => (
              <div key={a.bucket} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '5px 0', borderBottom: `1px solid ${TOKENS.line}` }}>
                <span>{a.bucket} <span style={{ color: TOKENS.s400, fontSize: 11 }}>({a.n})</span></span>
                <b style={{ color: a.bucket === '60d+' ? '#B91C1C' : TOKENS.s900 }}>{fmtMoney(a.amount)}</b>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '7px 0 0', fontWeight: 800 }}>
              <span>Outstanding</span><span>{fmtMoney(revenue.outstandingTotal)}</span>
            </div>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: '14px 16px' }}>
            <b style={{ fontSize: 13, color: TOKENS.s900 }}>Monthly value by curriculum</b>
            {revenue.arpu.slice(0, 6).map(a => (
              <div key={a.curriculum} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '5px 0', borderBottom: `1px solid ${TOKENS.line}` }}>
                <span>{a.curriculum} <span style={{ color: TOKENS.s400, fontSize: 11 }}>({a.students} students)</span></span>
                <b>{fmtMoney(a.monthlyValue)}</b>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '7px 0 0', fontWeight: 800 }}>
              <span>Expected monthly</span><span>{fmtMoney(revenue.expectedMonthly)}</span>
            </div>
          </div>
          {funnel && (
            <div style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: '14px 16px' }}>
              <b style={{ fontSize: 13, color: TOKENS.s900 }}>Funnel (90 days)</b>
              {['new', 'contacted', 'interested', 'proposal_sent', 'assessment_req', 'enrolled'].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <span style={{ fontSize: 11.5, width: 110, color: TOKENS.s600 }}>{s.replace('_', ' ')}</span>
                  <div style={{ flex: 1, height: 10, background: '#F3EFE8', borderRadius: 999 }}>
                    <div style={{ width: Math.min(100, (funnel.counts[s] / Math.max(funnel.total, 1)) * 100) + '%', height: '100%', background: s === 'enrolled' ? '#15803D' : TOKENS.crimson, borderRadius: 999, opacity: 0.85 }} />
                  </div>
                  <b style={{ fontSize: 12, width: 30, textAlign: 'right' }}>{funnel.counts[s]}</b>
                </div>
              ))}
              <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 6 }}>Best source: {funnel.sources[0] ? `${funnel.sources[0].source} (${funnel.sources[0].conversionPct ?? 0}% convert)` : '\u2013'}</div>
            </div>
          )}
        </div>
      )}

      <AnalyticsStrip scope="school" days={30} title="School trend: last 30 days" show={['attendance', 'exams', 'sessions']} />
    </div>
  )
}
