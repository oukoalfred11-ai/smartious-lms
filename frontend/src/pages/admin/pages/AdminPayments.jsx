/**
 * AdminPayments.jsx
 * ─────────────────────────────────────────────────────────────
 * Drop-in payments management page for the Smartious Admin Portal.
 *
 * Usage — inside AdminDashboard's page switch:
 *
 *   import AdminPayments from './AdminPayments.jsx'
 *
 *   // In the nav array:
 *   { id:'payments', label:'Payments', svg:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>' }
 *
 *   // In the render:
 *   {page === 'payments' && <AdminPayments />}
 *
 * Requires: api from ../../context/ctx.jsx  (your existing axios wrapper)
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react'
import { api, useToast } from '../../context/ctx.jsx'

const fmt = (n) => 'KES ' + Number(n || 0).toLocaleString()
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : ''

function StatusBadge({ status }) {
  const cfg = {
    success:   { cls:'badge-green', label:'Paid' },
    pending:   { cls:'badge-amber', label:'Pending' },
    failed:    { cls:'badge-red',   label:'Failed' },
  }[status] || { cls:'badge-blue', label: status || 'Unknown' }
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
}

export default function AdminPayments() {
  const toast = useToast()

  // ── List state ────────────────────────────────────────
  const [payments, setPayments]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalConfirmed, setTotalConfirmed] = useState(0)

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch]             = useState('')
  const [searchInput, setSearchInput]   = useState('')

  // ── Detail / override modal ───────────────────────────
  const [selected, setSelected]       = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [overrideStatus, setOverrideStatus] = useState('')
  const [overrideNote, setOverrideNote]     = useState('')
  const [overrideSaving, setOverrideSaving] = useState(false)

  // ── Fetch list ────────────────────────────────────────
  const fetchPayments = useCallback(async (pg = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: pg, limit: 30 })
      if (statusFilter) params.append('status', statusFilter)
      if (search)       params.append('search', search)

      const { data } = await api.get(`/payments/admin/all?${params}`)
      if (data?.success) {
        setPayments(data.data.payments || [])
        setTotal(data.data.total || 0)
        setTotalPages(data.data.totalPages || 1)
        setTotalRevenue(data.data.totalRevenue || 0)
        setTotalConfirmed(data.data.totalConfirmed || 0)
        setPage(pg)
      }
    } catch (err) {
      toast.error('Could not load payments.')
      console.error(err)
    }
    setLoading(false)
  }, [statusFilter, search])

  useEffect(() => { fetchPayments(1) }, [fetchPayments])

  // ── Fetch single payment detail ───────────────────────
  const openDetail = async (payment) => {
    setSelected({ ...payment, _loading: true })
    setOverrideStatus(payment.status || 'pending')
    setOverrideNote('')
    setDetailLoading(true)
    try {
      const { data } = await api.get(`/payments/admin/${payment._id}`)
      if (data?.success) {
        setSelected(data.data)
        setOverrideStatus(data.data.status || 'pending')
      }
    } catch {
      // Use the list data if the detail endpoint fails
      setSelected(payment)
    }
    setDetailLoading(false)
  }

  // ── Override status ───────────────────────────────────
  const saveOverride = async () => {
    if (!selected || !overrideStatus) return
    setOverrideSaving(true)
    try {
      const { data } = await api.patch(`/payments/admin/${selected._id}/status`, {
        status: overrideStatus,
        note:   overrideNote,
      })
      if (data?.success) {
        toast.ok('Payment status updated.')
        setSelected(data.data)
        // Refresh list entry inline
        setPayments(ps => ps.map(p =>
          String(p._id) === String(selected._id)
            ? { ...p, status: overrideStatus }
            : p
        ))
      } else {
        toast.error(data?.message || 'Update failed.')
      }
    } catch {
      toast.error('Could not update status.')
    }
    setOverrideSaving(false)
  }

  // ── Helpers ───────────────────────────────────────────
  const parentName = (p) => {
    const u = p.parentId
    if (!u) return '—'
    return typeof u === 'object'
      ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '—'
      : String(u)
  }

  const studentName = (p) => {
    const s = p.studentId
    if (!s) return '—'
    return typeof s === 'object'
      ? `${s.firstName || ''} ${s.lastName || ''}`.trim() || '—'
      : String(s)
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <div className="sec-tag">Finance</div>
        <h2 className="serif" style={{ fontSize: 26, color: 'var(--s900)' }}>
          Payments
        </h2>
      </div>

      {/* ── Revenue KPI row ── */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {[
          { v: fmt(totalRevenue),   l: 'Total Revenue',      d: 'Confirmed payments', dc: 'var(--g600)' },
          { v: totalConfirmed,       l: 'Confirmed',          d: 'All-time',           dc: 'var(--b700)' },
          { v: total,                l: 'All Transactions',   d: 'Any status',         dc: 'var(--s500)' },
          {
            v: payments.filter(p => p.status === 'pending').length,
            l: 'Pending (this page)',
            d: 'Awaiting verification',
            dc: 'var(--a600)',
          },
        ].map((k, i) => (
          <div key={i} className="kpi">
            <div className="kpi-v" style={{ fontSize: i === 0 ? 15 : undefined }}>{k.v}</div>
            <div className="kpi-l">{k.l}</div>
            <div className="kpi-d" style={{ color: k.dc }}>{k.d}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="fl">Search reference or description</label>
            <input className="fi" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput) }}
              placeholder="E.g. SM-1234, April fees…"/>
          </div>
          <div style={{ minWidth: 160 }}>
            <label className="fl">Status</label>
            <select className="fsel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="success">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <button className="btn btn-p btn-sm"
            onClick={() => { setSearch(searchInput); fetchPayments(1) }}>
            Search
          </button>
          <button className="btn btn-s btn-sm"
            onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter(''); }}>
            Clear
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--s400)' }}>Loading…</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--s500)' }}>
            No payments found{statusFilter ? ` with status "${statusFilter}"` : ''}.
          </div>
        ) : (
          <>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Parent</th>
                  <th>Student</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p._id || i} style={{ cursor: 'pointer' }}
                    onClick={() => openDetail(p)}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12.5 }}>{fmtDate(p.createdAt)}</div>
                      <div style={{ fontSize: 11, color: 'var(--s400)' }}>{fmtTime(p.createdAt)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{parentName(p)}</div>
                      {typeof p.parentId === 'object' && p.parentId?.email && (
                        <div style={{ fontSize: 11, color: 'var(--s400)' }}>{p.parentId.email}</div>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--s600)' }}>{studentName(p)}</td>
                    <td style={{ fontSize: 13 }}>{p.description || '—'}</td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700 }}>
                        {fmt(p.amount)}
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--s500)' }}>
                        {p.reference || '—'}
                      </span>
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <button className="btn btn-s btn-sm"
                        onClick={e => { e.stopPropagation(); openDetail(p) }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', paddingTop: 16, flexWrap: 'wrap' }}>
                <button className="btn btn-s btn-sm" disabled={page <= 1}
                  onClick={() => fetchPayments(page - 1)}>← Prev</button>
                <span style={{ fontSize: 13, color: 'var(--s500)', lineHeight: '30px' }}>
                  Page {page} of {totalPages} &nbsp;·&nbsp; {total} records
                </span>
                <button className="btn btn-s btn-sm" disabled={page >= totalPages}
                  onClick={() => fetchPayments(page + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          DETAIL MODAL
          ══════════════════════════════════════════════════ */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
          onClick={() => setSelected(null)}>
          <div style={{
            background: '#fff', borderRadius: 'var(--rxl)', padding: 28,
            maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,.22)',
          }}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div className="sec-tag">Payment Detail</div>
                <div className="serif" style={{ fontSize: 20, color: 'var(--s900)' }}>
                  {selected.description || 'Payment'}
                </div>
              </div>
              <button className="btn btn-s btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>

            {detailLoading ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--s400)' }}>Loading detail…</div>
            ) : (
              <>
                {/* ── Key fields ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[
                    ['Amount',    fmt(selected.amount)],
                    ['Status',    null],   // rendered separately
                    ['Reference', selected.reference || '—'],
                    ['Method',    selected.method || '—'],
                    ['Parent',    parentName(selected)],
                    ['Student',   studentName(selected)],
                    ['Date',      fmtDate(selected.createdAt) + (selected.paidAt ? ' · Paid ' + fmtDate(selected.paidAt) : '')],
                    ['Currency',  selected.currency || 'KES'],
                  ].map(([l, v], idx) => (
                    <div key={l} style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--rmd)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--s400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{l}</div>
                      {l === 'Status'
                        ? <StatusBadge status={selected.status} />
                        : <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--s800)', wordBreak: 'break-all' }}>{v}</div>
                      }
                    </div>
                  ))}
                </div>

                {/* Admin note if present */}
                {selected.adminNote && (
                  <div style={{ background: 'var(--a50)', border: '1px solid var(--a200)', borderRadius: 'var(--rmd)', padding: '10px 12px', marginBottom: 18, fontSize: 12.5, color: 'var(--a700)' }}>
                    <strong>Admin note:</strong> {selected.adminNote}
                  </div>
                )}

                {/* ── Override status ── */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                  <div className="ctitle" style={{ marginBottom: 10 }}>Override Status</div>
                  <div style={{ fontSize: 12.5, color: 'var(--s500)', marginBottom: 12, lineHeight: 1.6 }}>
                    Use this to manually confirm a bank transfer or M-Pesa payment that arrived outside Paystack.
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label className="fl">Status</label>
                    <select className="fsel" value={overrideStatus} onChange={e => setOverrideStatus(e.target.value)}>
                      <option value="success">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label className="fl">Admin note (optional)</label>
                    <input className="fi" value={overrideNote} onChange={e => setOverrideNote(e.target.value)}
                      placeholder="E.g. Confirmed via M-Pesa message from parent"/>
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-s btn-sm" onClick={() => setSelected(null)}>Cancel</button>
                    <button className="btn btn-p" onClick={saveOverride} disabled={overrideSaving}>
                      {overrideSaving ? 'Saving…' : 'Save Override'}
                    </button>
                  </div>
                </div>

                {/* Raw Paystack data (collapsed) */}
                {selected.paystackData && (
                  <details style={{ marginTop: 16 }}>
                    <summary style={{ fontSize: 12, color: 'var(--s400)', cursor: 'pointer', userSelect: 'none' }}>
                      Raw Paystack data
                    </summary>
                    <pre style={{ marginTop: 8, fontSize: 11, color: 'var(--s600)', background: 'var(--bg)', padding: 12, borderRadius: 'var(--rmd)', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(selected.paystackData, null, 2)}
                    </pre>
                  </details>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
