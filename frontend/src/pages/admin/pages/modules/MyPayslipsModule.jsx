/**
 * MyPayslipsModule: every staff member's own pay, month by month.
 * ============================================================
 * Basic monthly salary, approved tuitions (sessions x rate) and every
 * deduction, with the net pay. Visible as soon as Finance creates the
 * month's record, not only once it is paid, so nobody waits for the
 * email to see their figures. Reads /api/payroll/my (own records only).
 */
import { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PSection } from '../shared/ui.jsx'

const CR = TOKENS.crimson
const LINE = '#E8E2D6'
const MUTED = '#7A6652'
const GREEN = '#065F46'
const RED = '#991B1B'

const money = (n, c = 'KES') => (({ KES: 'KES ', USD: '$', GBP: '£' })[c] || '') +
  (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const STATUS = {
  draft:      { bg: '#F3F4F6', fg: '#4B5563', label: 'Draft' },
  processing: { bg: '#DBEAFE', fg: '#1E40AF', label: 'Processing' },
  paid:       { bg: '#D1FAE5', fg: GREEN,     label: 'Paid' },
}
const CLAIM = {
  approved: { bg: '#D1FAE5', fg: GREEN,     label: 'Approved' },
  pending:  { bg: '#FEF3C7', fg: '#92400E', label: 'Awaiting approval' },
  rejected: { bg: '#F3F4F6', fg: '#6B7280', label: 'Not approved' },
}

const lab = { fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }

export default function MyPayslipsModule({ toast }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true); setError('')
    api.get('/payroll/my')
      .then(r => setRecords(r.data?.data?.records || []))
      .catch(e => setError(e?.response?.data?.message || 'Could not load your payslips.'))
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const openPayslip = async (id) => {
    try {
      const r = await api.get('/payroll/' + id + '/payslip-html')
      const w = window.open('', '_blank')
      if (!w) { toast?.error?.('Allow pop-ups to open the payslip.'); return }
      w.document.write(r.data?.data?.html || ''); w.document.close()
    } catch { toast?.error?.('Payslip not available.') }
  }

  const year = new Date().getFullYear()
  const paidThisYear = records.filter(r => r.status === 'paid' && r.periodYear === year)
  const ytdNet = paidThisYear.reduce((s, r) => s + (r.netPay || 0), 0)
  const ytdTuition = records.filter(r => r.periodYear === year).reduce((s, r) => s + (r.totalApprovedExtras || 0), 0)
  const ytdDed = paidThisYear.reduce((s, r) => s + (r.totalDeductions || 0), 0)
  const cur0 = records[0]?.currency || 'KES'

  return (
    <>
      <PSection tag="Me" title="My" em="payslips"
        sub="Your monthly salary, approved tuitions and deductions. Figures appear as soon as Finance prepares the month, and stay here for your records." />

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: MUTED, fontSize: 13 }}>Loading your payslips…</div>
      : error ? <div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, color: RED, fontSize: 13 }}>{error}</div>
      : records.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: '#fff', border: '1px solid ' + LINE, borderRadius: 14 }}>
          <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 20, color: '#231715', marginBottom: 6 }}>No payslips yet</div>
          <div style={{ fontSize: 13, color: MUTED }}>Your figures will appear here as soon as Finance prepares your first month.</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
            {[
              ['Net pay received ' + year, money(ytdNet, cur0), GREEN],
              ['Approved tuitions ' + year, money(ytdTuition, cur0), CR],
              ['Deductions ' + year, money(ytdDed, cur0), RED],
              ['Months paid ' + year, String(paidThisYear.length), '#231715'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background: '#fff', border: '1px solid ' + LINE, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ ...lab, color: MUTED }}>{l}</div>
                <div style={{ fontSize: 21, fontWeight: 800, color: c, lineHeight: 1.1 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {records.map(r => {
              const ss = STATUS[r.status] || STATUS.draft
              const cur = r.currency || 'KES'
              const deds = r.deductions || []
              const claims = r.tuitionExtras || []
              const approved = claims.filter(e => e.status === 'approved')
              const gross = (r.basicSalary || 0) + (r.totalApprovedExtras || 0)
              return (
                <div key={r._id} style={{ background: '#fff', border: '1px solid ' + LINE, borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid ' + LINE, background: '#FBFAF5' }}>
                    <div>
                      <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 19, fontWeight: 700, color: '#231715' }}>{r.periodLabel}</div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.fg }}>{ss.label}</span>
                        <span style={{ fontSize: 12, color: MUTED }}>
                          {r.status === 'paid' ? `Paid ${fmtDate(r.paymentDate)}${r.paymentMethod ? ' via ' + r.paymentMethod : ''}` : 'Not yet paid. Figures may still change.'}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ ...lab, color: MUTED, marginBottom: 2 }}>Net pay</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: GREEN }}>{money(r.netPay, cur)}</div>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                    <div>
                      <div style={{ ...lab, color: CR }}>Basic monthly salary</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#231715' }}>{money(r.basicSalary, cur)}</div>
                    </div>
                    <div>
                      <div style={{ ...lab, color: GREEN }}>Approved tuitions</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: GREEN }}>{r.totalApprovedExtras > 0 ? '+' + money(r.totalApprovedExtras, cur) : money(0, cur)}</div>
                      <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>{approved.length} approved</div>
                    </div>
                    <div>
                      <div style={{ ...lab, color: RED }}>Deductions</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: RED }}>{r.totalDeductions > 0 ? '−' + money(r.totalDeductions, cur) : money(0, cur)}</div>
                      {deds.map((d, i) => <div key={i} style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>{d.label}: {money(d.amount, cur)}</div>)}
                    </div>
                    <div>
                      <div style={{ ...lab, color: MUTED }}>Gross pay</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#231715' }}>{money(gross, cur)}</div>
                    </div>
                  </div>

                  {claims.length > 0 && (
                    <div style={{ padding: '12px 20px 14px', borderTop: '1px solid ' + LINE }}>
                      <div style={{ ...lab, color: CR, marginBottom: 8 }}>Tuitions this month</div>
                      {claims.map((e, i) => {
                        const cs = CLAIM[e.status] || CLAIM.pending
                        return (
                          <div key={e._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < claims.length - 1 ? '1px solid #F4EFEB' : 'none' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#231715' }}>{e.description}</div>
                              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 1 }}>
                                {[e.subject, e.studentName, `${e.sessions || 1} session${(e.sessions || 1) > 1 ? 's' : ''}${e.ratePerSession ? ' × ' + money(e.ratePerSession, cur) : ''}`, e.date ? fmtDate(e.date) : ''].filter(Boolean).join(' · ')}
                              </div>
                              {e.status === 'rejected' && e.rejectedNote && <div style={{ fontSize: 11.5, color: RED, marginTop: 2 }}>Reason: {e.rejectedNote}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 800, color: e.status === 'approved' ? GREEN : e.status === 'rejected' ? '#9CA3AF' : '#231715', textDecoration: e.status === 'rejected' ? 'line-through' : 'none' }}>{money(e.totalAmount, cur)}</span>
                              <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 10.5, fontWeight: 700, background: cs.bg, color: cs.fg }}>{cs.label}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div style={{ padding: '11px 20px', borderTop: '1px solid ' + LINE, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => openPayslip(r._id)} style={{ background: CR, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                      {r.status === 'paid' ? 'View / print payslip' : 'View draft payslip'}
                    </button>
                    {r.payslipEmailSentAt && <span style={{ fontSize: 12, color: MUTED }}>Emailed {fmtDate(r.payslipEmailSentAt)}</span>}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 14 }}>
            Questions about a figure? Contact the finance office within 30 days of the payment date.
          </div>
        </>
      )}
    </>
  )
}
