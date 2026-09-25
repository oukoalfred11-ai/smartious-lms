import React, { useState, useEffect, useCallback } from 'react'
import { useStore, useAuth, api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { fmtDate, fmtKsh } from '../shared/helpers.js'
import { PCard, PKpi, PSection } from '../shared/ui.jsx'
import { InvoiceGenerator, buildInvoiceHTML } from './DocumentsModule.jsx'
import { StatusBadge } from './CRMModule.jsx'


function InvoicesTab({ toast, refreshKey }) {
  const { user } = useAuth()
  // Only the admin may delete an invoice; the backend enforces
  // this too, this just hides the control from everyone else.
  const isAdmin = user?.role === 'admin'
  const [deleteModal, setDeleteModal] = useState(null)   // invoice pending deletion
  const [deleting, setDeleting]       = useState(false)
  const [view, setView]             = useState('list')  // list | create
  const [invoices, setInvoices]     = useState([])
  const [stats, setStats]           = useState({})
  const [loading, setLoading]       = useState(true)
  const [statusF, setStatusF]       = useState('all')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [paidModal, setPaidModal]   = useState(null)   // invoice to mark paid
  const [paidAmount, setPaidAmount] = useState('')
  const [paidDate, setPaidDate]     = useState(new Date().toISOString().split('T')[0])
  const [markingPaid, setMarkingPaid] = useState(false)

  // ── COLLECTIONS + REMINDERS ──
  // invView: 'invoices' | 'unpaid' | 'reminders'
  const [invView, setInvView]           = useState('invoices')
  const [collections, setCollections]   = useState(null)
  const [collLoading, setCollLoading]   = useState(false)
  const [bucketF, setBucketF]           = useState('all')   // all | overdue | dueSoon | current
  const [reminders, setReminders]       = useState([])
  const [remLoading, setRemLoading]     = useState(false)
  const [sendingId, setSendingId]       = useState(null)
  const [runningScan, setRunningScan]   = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, limit:30 }
    if (statusF !== 'all') params.status = statusF
    if (search.trim()) params.search = search.trim()
    Promise.all([
      api.get('/invoices', { params }),
      api.get('/invoices/stats'),
    ]).then(([r, sr]) => {
      setInvoices(r.data?.data?.invoices || [])
      setTotalPages(r.data?.data?.totalPages || 1)
      setStats(sr.data?.data || {})
    }).catch(() => toast?.error?.('Failed to load invoices.'))
    .finally(() => setLoading(false))
  }, [statusF, search, page])

  useEffect(() => { load() }, [load, refreshKey])
  useEffect(() => { setPage(1) }, [statusF, search])

  const money = (n, cur='USD') => Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' ' + cur

  const loadCollections = useCallback(() => {
    setCollLoading(true)
    api.get('/invoices/collections')
      .then(r => setCollections(r.data?.data || null))
      .catch(() => toast?.error?.('Could not load collections.'))
      .finally(() => setCollLoading(false))
  }, [])

  const loadReminders = useCallback(() => {
    setRemLoading(true)
    api.get('/invoices/reminders?limit=150')
      .then(r => setReminders(r.data?.reminders || []))
      .catch(() => toast?.error?.('Could not load reminder history.'))
      .finally(() => setRemLoading(false))
  }, [])

  useEffect(() => {
    if (invView === 'unpaid')    loadCollections()
    if (invView === 'reminders') loadReminders()
  }, [invView, loadCollections, loadReminders, refreshKey])

  const sendReminder = async (inv) => {
    setSendingId(inv._id)
    try {
      const { data } = await api.post('/invoices/' + inv._id + '/remind')
      toast?.success?.(data?.message || 'Reminder sent.')
      loadCollections()
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not send the reminder.')
    } finally { setSendingId(null) }
  }

  const toggleAutoRemind = async (inv) => {
    try {
      const { data } = await api.patch('/invoices/' + inv._id + '/auto-remind', { autoRemind: !inv.autoRemind })
      toast?.success?.(data?.message || 'Updated.')
      loadCollections()
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not update.')
    }
  }

  const runReminderScan = async (dryRun) => {
    setRunningScan(true)
    try {
      const { data } = await api.post('/invoices/reminders/run', { dryRun })
      const d = data?.data || {}
      toast?.success?.(dryRun
        ? `Preview: ${d.details?.filter(x => x.action === 'would send').length || 0} reminder(s) would be sent, ${d.skippedOnBreak || 0} skipped (on break).`
        : `Sent ${d.sent || 0} reminder(s). ${d.skippedOnBreak || 0} skipped because the student is on a break.`)
      if (!dryRun) { loadCollections(); loadReminders() }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Scan failed.')
    } finally { setRunningScan(false) }
  }

  const STATUS_COLOURS = {
    draft:     { bg:'#F3F4F6', fg:'#374151' },
    sent:      { bg:'#DBEAFE', fg:'#1E40AF' },
    paid:      { bg:'#D1FAE5', fg:'#065F46' },
    overdue:   { bg:'#FEE2E2', fg:'#991B1B' },
    cancelled: { bg:'#F3F4F6', fg:'#6B7280' },
  }
  const StatusBadge = ({ s }) => {
    const c = STATUS_COLOURS[s] || STATUS_COLOURS.sent
    return <span style={{ padding:'3px 10px', borderRadius:99, background:c.bg, color:c.fg, fontSize:11, fontWeight:700 }}>{s.charAt(0).toUpperCase()+s.slice(1)}</span>
  }

  const openMarkPaid = (inv) => {
    setPaidAmount(String(inv.totalDue || ''))
    setPaidDate(new Date().toISOString().split('T')[0])
    setPaidModal(inv)
  }

  const confirmMarkPaid = async () => {
    if (!paidModal) return
    setMarkingPaid(true)
    try {
      await api.patch('/invoices/'+paidModal._id+'/status', {
        status: 'paid',
        paidAmount: parseFloat(paidAmount) || paidModal.totalDue,
        paidAt: paidDate,
      })
      toast?.ok?.('Invoice marked paid — receipt emailed to ' + (paidModal.billedToEmail || 'parent') + '.')
      setPaidModal(null)
      // Refresh whichever view is open. Previously only load() ran, so
      // marking paid from "Who has not paid" left the row on screen and
      // the totals stale until a manual reload.
      load()
      if (invView === 'unpaid')    loadCollections()
      if (invView === 'reminders') loadReminders()
    } catch { toast?.error?.('Could not mark as paid.') }
    finally { setMarkingPaid(false) }
  }

  const openPdf = async (path, failMsg) => {
    const w = window.open('', '_blank')
    if (!w) { toast?.error?.('Please allow pop-ups to view the document.'); return }
    try {
      const res = await api.get(path, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      w.location.href = url
    } catch { w.close(); toast?.error?.(failMsg) }
  }

  const confirmDelete = async () => {
    if (!deleteModal) return
    setDeleting(true)
    try {
      const { data } = await api.delete('/invoices/'+deleteModal._id)
      toast?.success?.(data?.message || 'Invoice deleted.')
      setDeleteModal(null)
      load()
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not delete invoice.')
    } finally { setDeleting(false) }
  }

  const viewReceipt = (inv) => openPdf('/invoices/'+inv._id+'/receipt-pdf', 'Could not load receipt.')
  const viewInvoicePdf = (inv) => openPdf('/invoices/'+inv._id+'/pdf', 'Could not load invoice PDF.')

  const resend = async (inv) => {
    try {
      await api.post('/invoices/'+inv._id+'/resend', { email: inv.billedToEmail })
      toast?.ok?.('Invoice resent to '+inv.billedToEmail)
    } catch { toast?.error?.('Could not resend.') }
  }

  if (view === 'create') return <InvoiceGenerator toast={toast} onBack={() => { setView('list'); load() }}/>
  if (view === 'paystack') return <CardPayments toast={toast} onBack={() => setView('list')}/>

  // KPI strip from stats
  const byCurrency = stats.byCurrency || []
  const statusMap  = stats.statusMap  || {}

  const fmtD = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'

  return (
    <>
      {/* ── SUB-NAVIGATION ── */}
      <div style={{ display:'flex', gap:6, marginBottom:16, borderBottom:'1px solid '+TOKENS.line, flexWrap:'wrap' }}>
        {[['invoices','All invoices'],['unpaid','Who has not paid'],['reminders','Reminders sent']].map(([k,l]) => (
          <button key={k} onClick={()=>setInvView(k)}
            style={{ background:'none', border:'none', borderBottom:'2.5px solid '+(invView===k?TOKENS.crimson:'transparent'),
                     padding:'9px 14px', fontSize:13.5, fontWeight:invView===k?700:500,
                     color:invView===k?TOKENS.crimson:TOKENS.s500, cursor:'pointer', marginBottom:-1 }}>
            {l}
            {k==='unpaid' && collections?.counts?.overdue > 0 && (
              <span style={{ marginLeft:6, background:'#FEE2E2', color:'#991B1B', padding:'1px 7px', borderRadius:99, fontSize:10.5, fontWeight:800 }}>
                {collections.counts.overdue}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── WHO HAS NOT PAID ── */}
      {invView === 'unpaid' && (
        <>
          {collLoading && <div style={{ padding:28, textAlign:'center', color:TOKENS.s500, fontSize:13 }}>Loading collections...</div>}

          {!collLoading && collections && (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:10, marginBottom:16 }}>
                {[
                  ['Outstanding',        collections.totals.outstanding,        collections.counts.open,    TOKENS.crimson],
                  ['Overdue',            collections.totals.overdue,            collections.counts.overdue, '#991B1B'],
                  ['Due within 7 days',  collections.totals.dueSoon,            collections.counts.dueSoon, '#B45309'],
                  ['Collected this month',collections.totals.collectedThisMonth, null,                      '#065F46'],
                ].map(([label, val, count, colour]) => (
                  <div key={label} className="card" style={{ padding:'14px 16px' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:19, fontWeight:800, color:colour }}>
                      {Number(val||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
                    </div>
                    {count !== null && <div style={{ fontSize:11, color:TOKENS.s500, marginTop:2 }}>{count} invoice{count!==1?'s':''}</div>}
                  </div>
                ))}
              </div>

              {/* Aging */}
              {collections.totals.overdue > 0 && (
                <div className="card" style={{ padding:'14px 18px', marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:TOKENS.s500, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Overdue by age</div>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    {Object.entries(collections.aging).map(([bucket, amt]) => (
                      <div key={bucket} style={{ flex:'1 1 120px', background: amt>0 ? '#FEF2F2' : TOKENS.bg, border:'1px solid '+(amt>0?'#FCA5A5':TOKENS.line), borderRadius:8, padding:'10px 12px' }}>
                        <div style={{ fontSize:10.5, color:TOKENS.s500, fontWeight:700 }}>{bucket} days</div>
                        <div style={{ fontSize:15, fontWeight:800, color: amt>0 ? '#991B1B' : TOKENS.s400 }}>
                          {Number(amt).toLocaleString('en-US',{maximumFractionDigits:0})}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filters + scan */}
              <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
                {[['all','All unpaid'],['overdue','Overdue'],['dueSoon','Due soon'],['current','Current']].map(([k,l])=>(
                  <button key={k} onClick={()=>setBucketF(k)}
                    style={{ padding:'6px 13px', borderRadius:99, fontSize:12.5, fontWeight:700, cursor:'pointer',
                             border:'1.5px solid '+(bucketF===k?TOKENS.crimson:TOKENS.line),
                             background:bucketF===k?TOKENS.crimson:'#fff', color:bucketF===k?'#fff':TOKENS.s700 }}>{l}</button>
                ))}
                <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
                  <button onClick={()=>runReminderScan(true)} disabled={runningScan}
                    style={{ padding:'7px 14px', borderRadius:7, border:'1.5px solid '+TOKENS.line, background:'#fff', color:TOKENS.s700, fontSize:12.5, fontWeight:700, cursor:runningScan?'not-allowed':'pointer' }}>
                    Preview reminders
                  </button>
                  <button onClick={()=>runReminderScan(false)} disabled={runningScan}
                    style={{ padding:'7px 14px', borderRadius:7, border:'none', background:runningScan?'#C96773':TOKENS.crimson, color:'#fff', fontSize:12.5, fontWeight:700, cursor:runningScan?'not-allowed':'pointer' }}>
                    {runningScan ? 'Running...' : 'Send due reminders'}
                  </button>
                </div>
              </div>

              {collections.unpaid.filter(i => bucketF==='all' || i.bucket===bucketF).length === 0 ? (
                <div className="card" style={{ padding:36, textAlign:'center' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:TOKENS.s900, marginBottom:4 }}>Nothing outstanding here</div>
                  <div style={{ fontSize:12.5, color:TOKENS.s500 }}>Every invoice in this group has been settled.</div>
                </div>
              ) : (
                <div className="card" style={{ padding:0, overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:TOKENS.bg }}>
                        {['Invoice','Parent / Student','Period ends','Due','Outstanding','Reminders',''].map(h=>(
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10.5, fontWeight:700, color:TOKENS.s500, textTransform:'uppercase', letterSpacing:'.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {collections.unpaid.filter(i => bucketF==='all' || i.bucket===bucketF).map(inv => (
                        <tr key={inv._id} style={{ borderTop:'1px solid '+TOKENS.line, background: inv.bucket==='overdue' ? '#FFFBFB' : '#fff' }}>
                          <td style={{ padding:'11px 14px', fontFamily:'monospace', fontSize:11.5, fontWeight:700, color:TOKENS.crimson }}>
                            {inv.invoiceNo}
                            {inv.autoRemind === false && (
                              <div style={{ fontSize:9.5, color:TOKENS.s400, fontWeight:600 }}>auto paused</div>
                            )}
                          </td>
                          <td style={{ padding:'11px 14px' }}>
                            <div style={{ fontSize:13, fontWeight:600, color:TOKENS.s900 }}>{inv.billedToName}</div>
                            <div style={{ fontSize:11, color:TOKENS.s500 }}>{inv.studentName || '—'}</div>
                          </td>
                          <td style={{ padding:'11px 14px', fontSize:12, color:TOKENS.s700 }}>{fmtD(inv.servicePeriodEnd)}</td>
                          <td style={{ padding:'11px 14px', fontSize:12 }}>
                            <div style={{ color: inv.bucket==='overdue' ? '#991B1B' : TOKENS.s700, fontWeight: inv.bucket==='overdue'?700:400 }}>{fmtD(inv.dueDate)}</div>
                            {inv.daysPastDue > 0 && <div style={{ fontSize:10.5, color:'#991B1B', fontWeight:700 }}>{inv.daysPastDue} day{inv.daysPastDue!==1?'s':''} late</div>}
                          </td>
                          <td style={{ padding:'11px 14px', fontSize:13, fontWeight:700, color:TOKENS.s900, whiteSpace:'nowrap' }}>
                            {inv.currency} {Number(inv.outstanding).toLocaleString('en-US',{minimumFractionDigits:2})}
                          </td>
                          <td style={{ padding:'11px 14px', fontSize:12, color:TOKENS.s600 }}>
                            {inv.reminderCount || 0}
                            {inv.lastReminderAt && <div style={{ fontSize:10, color:TOKENS.s400 }}>last {fmtD(inv.lastReminderAt)}</div>}
                          </td>
                          <td style={{ padding:'11px 14px' }}>
                            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                              <button onClick={()=>sendReminder(inv)} disabled={sendingId===inv._id}
                                style={{ fontSize:11, background:TOKENS.crimson, color:'#fff', border:'none', padding:'5px 10px', borderRadius:5, fontWeight:700, cursor:sendingId===inv._id?'not-allowed':'pointer' }}>
                                {sendingId===inv._id ? 'Sending...' : (inv.reminderCount ? 'Send again' : 'Send reminder')}
                              </button>
                              {/* MARK PAID — this row previously offered only "Send reminder"
                                  and "Pause auto", so an invoice that had actually been paid
                                  could not be closed from the one screen finance staff live in,
                                  and reminders kept going out after payment. The backend route
                                  already existed; only the button was missing. */}
                              <button onClick={()=>openMarkPaid(inv)}
                                style={{ fontSize:11, background:'#D1FAE5', color:'#065F46', border:'none', padding:'4px 9px', borderRadius:5, cursor:'pointer', fontWeight:700 }}>
                                Mark paid
                              </button>
                              <button onClick={()=>toggleAutoRemind(inv)}
                                style={{ fontSize:11, background:'#fff', color:TOKENS.s600, border:'1px solid '+TOKENS.line, padding:'5px 10px', borderRadius:5, fontWeight:600, cursor:'pointer' }}>
                                {inv.autoRemind === false ? 'Resume auto' : 'Pause auto'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── REMINDERS SENT ── */}
      {invView === 'reminders' && (
        <>
          {remLoading && <div style={{ padding:28, textAlign:'center', color:TOKENS.s500, fontSize:13 }}>Loading reminder history...</div>}
          {!remLoading && reminders.length === 0 && (
            <div className="card" style={{ padding:36, textAlign:'center' }}>
              <div style={{ fontSize:14, fontWeight:700, color:TOKENS.s900, marginBottom:4 }}>No reminders sent yet</div>
              <div style={{ fontSize:12.5, color:TOKENS.s500 }}>
                Automatic reminders go out three days before each service period ends, unless the student is marked as on a break.
              </div>
            </div>
          )}
          {!remLoading && reminders.length > 0 && (
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:TOKENS.bg }}>
                    {['Sent','Invoice','Sent to','Type','By','Status'].map(h=>(
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10.5, fontWeight:700, color:TOKENS.s500, textTransform:'uppercase', letterSpacing:'.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((r,i) => (
                    <tr key={i} style={{ borderTop:'1px solid '+TOKENS.line }}>
                      <td style={{ padding:'10px 14px', fontSize:12, color:TOKENS.s700, whiteSpace:'nowrap' }}>
                        {new Date(r.sentAt).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                      </td>
                      <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:11.5, fontWeight:700, color:TOKENS.crimson }}>
                        {r.invoiceNo}
                        <div style={{ fontFamily:'inherit', fontSize:11, color:TOKENS.s500, fontWeight:400 }}>{r.billedToName}</div>
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:TOKENS.s600 }}>{r.sentTo}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:99, textTransform:'uppercase',
                          background: r.kind==='overdue' ? '#FEE2E2' : r.kind==='upcoming' ? '#FEF3C7' : TOKENS.s100,
                          color:      r.kind==='overdue' ? '#991B1B' : r.kind==='upcoming' ? '#92400E' : TOKENS.s600 }}>{r.kind}</span>
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:TOKENS.s600 }}>{r.sentByName || (r.automatic ? 'Automatic' : '—')}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ fontSize:10.5, fontWeight:700, color: r.status==='paid' ? '#065F46' : '#991B1B' }}>
                          {r.status === 'paid' ? 'Paid since' : 'Still unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {invView === 'invoices' && (<>
      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:20 }}>
        {byCurrency.map(c => (
          <div key={c._id} className="card" style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', marginBottom:4 }}>Total Issued ({c._id})</div>
            <div style={{ fontSize:18, fontWeight:800, color:TOKENS.crimson }}>{c._id} {Number(c.total).toLocaleString('en-US',{minimumFractionDigits:2})}</div>
            <div style={{ fontSize:11, color:TOKENS.s500, marginTop:2 }}>{c.count} invoice{c.count!==1?'s':''}</div>
          </div>
        ))}
        {[['sent','Awaiting Payment'],['paid','Paid'],['overdue','Overdue']].map(([k,l])=>(
          <div key={k} className="card" style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:22, fontWeight:800, color:k==='paid'?'#065F46':k==='overdue'?'#991B1B':TOKENS.crimson }}>{statusMap[k]||0}</div>
          </div>
        ))}
      </div>

      {/* Issued by */}
      {(stats.recentIssuers||[]).length > 0 && (
        <div className="card" style={{ padding:16, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:TOKENS.s900, marginBottom:10 }}>Invoices by staff member</div>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            {(stats.recentIssuers||[]).map(is => (
              <div key={is._id} style={{ fontSize:12.5, color:TOKENS.s700 }}>
                <strong style={{ color:TOKENS.s900 }}>{is.name}</strong>
                <span style={{ color:TOKENS.s500, marginLeft:6 }}>({is.count} invoice{is.count!==1?'s':''})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, invoice no, email..."
          style={{ flex:'1 1 220px', padding:'8px 12px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13 }}/>
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5 }}>
          <option value="all">All statuses</option>
          {Object.keys(STATUS_COLOURS).map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <button onClick={() => setView('paystack')} style={{ background:'#fff', color:TOKENS.crimson, border:'1.5px solid '+TOKENS.crimson, padding:'9px 16px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
          Card payment
        </button>
        <button onClick={() => setView('create')} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
          + New invoice
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:28, textAlign:'center', color:TOKENS.s500, fontSize:13 }}>Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div style={{ padding:40, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:10 }}>▤</div>
            <div style={{ fontSize:14, fontWeight:700, color:TOKENS.s900, marginBottom:4 }}>No invoices yet</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500 }}>Click "+ New invoice" to create your first.</div>
          </div>
        ) : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Invoice No.','Bill To','Student','Amount','Status','Issued By','Date','Actions'].map(h=>(
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id} style={{ borderTop:'1px solid '+TOKENS.line }}>
                  <td style={{ padding:'11px 14px', fontFamily:'monospace', fontSize:12, fontWeight:700, color:TOKENS.crimson }}>{inv.invoiceNo}</td>
                  <td style={{ padding:'11px 14px' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:TOKENS.s900 }}>{inv.billedToName}</div>
                    {inv.billedToEmail && <div style={{ fontSize:11, color:TOKENS.s500 }}>{inv.billedToEmail}</div>}
                  </td>
                  <td style={{ padding:'11px 14px', fontSize:12.5, color:TOKENS.s700 }}>{inv.studentName||'—'}</td>
                  <td style={{ padding:'11px 14px', fontSize:13, fontWeight:700, color:TOKENS.s900, whiteSpace:'nowrap' }}>
                    {inv.currency} {Number(inv.totalDue).toLocaleString('en-US',{minimumFractionDigits:2})}
                  </td>
                  <td style={{ padding:'11px 14px' }}><StatusBadge s={inv.status}/></td>
                  <td style={{ padding:'11px 14px', fontSize:12, color:TOKENS.s500 }}>
                    {inv.issuedBy ? `${inv.issuedBy.firstName} ${inv.issuedBy.lastName}` : '—'}
                    {inv.issuedBy?.role && <div style={{ fontSize:10 }}>{inv.issuedBy.role.replace('_',' ')}</div>}
                  </td>
                  <td style={{ padding:'11px 14px', fontSize:11.5, color:TOKENS.s500, whiteSpace:'nowrap' }}>
                    {new Date(inv.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                    {inv.emailSentAt && <div style={{ fontSize:10, color:'#059669' }}>✉ emailed</div>}
                  </td>
                  <td style={{ padding:'11px 14px' }}>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {/* An unpaid invoice must be closeable at ANY stage — the
                          cron flips sent -> overdue when it chases, and gating
                          this button on 'sent' made overdue invoices impossible
                          to mark paid, so reminders kept going to parents who
                          had already settled. */}
                      {['sent', 'overdue', 'draft'].includes(inv.status) && (
                        <button onClick={() => openMarkPaid(inv)} style={{ fontSize:11, background:'#D1FAE5', color:'#065F46', border:'none', padding:'4px 8px', borderRadius:5, cursor:'pointer', fontWeight:700 }}>Mark paid</button>
                      )}
                      {inv.status === 'paid' && (
                        <button onClick={() => viewReceipt(inv)} style={{ fontSize:11, background:'#065F46', color:'#fff', border:'none', padding:'4px 8px', borderRadius:5, cursor:'pointer', fontWeight:700 }}>▤ Receipt</button>
                      )}
                      <button onClick={() => viewInvoicePdf(inv)} style={{ fontSize:11, background:TOKENS.crimson, color:'#fff', border:'none', padding:'4px 8px', borderRadius:5, cursor:'pointer', fontWeight:700 }}>PDF</button>
                      {inv.billedToEmail && inv.status !== 'cancelled' && (
                        <button onClick={() => resend(inv)} style={{ fontSize:11, background:TOKENS.cream, color:TOKENS.crimson, border:'1px solid '+TOKENS.line, padding:'4px 8px', borderRadius:5, cursor:'pointer', fontWeight:700 }}>Resend</button>
                      )}
                      {isAdmin && (
                        <button onClick={() => setDeleteModal(inv)} title="Delete invoice (admin only)"
                          style={{ fontSize:11, background:'#fff', color:'#B91C1C', border:'1px solid #FCA5A5', padding:'4px 8px', borderRadius:5, cursor:'pointer', fontWeight:700 }}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:12 }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} style={{ padding:'6px 13px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page<=1?'not-allowed':'pointer', opacity:page<=1?.5:1 }}>‹</button>
          <span style={{ padding:'6px 12px', fontSize:12.5, color:TOKENS.s700 }}>Page {page} / {totalPages}</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages} style={{ padding:'6px 13px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page>=totalPages?'not-allowed':'pointer', opacity:page>=totalPages?.5:1 }}>›</button>
        </div>
      )}
      </>)}

      {/* Modals are shared across all three views */}
      {deleteModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={() => !deleting && setDeleteModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:420, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:'#B91C1C', marginBottom:4 }}>Delete this invoice?</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500, marginBottom:16 }}>
              {deleteModal.invoiceNo} &middot; {deleteModal.billedToName}
            </div>
            <div style={{ background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:8, padding:'12px 14px', marginBottom:18 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#7F1D1D', marginBottom:4 }}>
                {deleteModal.currency} {Number(deleteModal.totalDue).toLocaleString('en-US',{minimumFractionDigits:2})}
              </div>
              <div style={{ fontSize:12, color:'#7F1D1D', lineHeight:1.5 }}>
                This permanently removes the invoice from the financial records. It cannot be undone.
                {deleteModal.status === 'paid' && ' This invoice is marked PAID — deleting it will remove that payment from your reports.'}
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setDeleteModal(null)} disabled={deleting}
                style={{ flex:1, padding:'10px 0', borderRadius:8, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:13, fontWeight:700, color:TOKENS.s700, cursor:deleting?'not-allowed':'pointer' }}>
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                style={{ flex:1, padding:'10px 0', borderRadius:8, border:'none', background:deleting?'#FCA5A5':'#B91C1C', color:'#fff', fontSize:13, fontWeight:800, cursor:deleting?'not-allowed':'pointer' }}>
                {deleting ? 'Deleting...' : 'Delete invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {paidModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={() => setPaidModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:380, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:4 }}>Confirm Payment</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500, marginBottom:18 }}>{paidModal.invoiceNo} · {paidModal.billedToName}</div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:5 }}>Amount received ({paidModal.currency})</div>
              <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:14, fontWeight:700 }}/>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:5 }}>Date paid</div>
              <input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13 }}/>
            </div>
            {paidModal.billedToEmail && (
              <div style={{ background:'#F0FDF4', border:'1px solid #6EE7B7', borderRadius:8, padding:'10px 12px', fontSize:12, color:'#065F46', marginBottom:16, lineHeight:1.5 }}>
                ✓ Receipt will be auto-emailed to <strong>{paidModal.billedToEmail}</strong>
              </div>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={confirmMarkPaid} disabled={markingPaid} style={{
                flex:1, background:markingPaid?TOKENS.s300:'#065F46', color:'#fff', border:'none',
                padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700,
                cursor:markingPaid?'not-allowed':'pointer',
              }}>{markingPaid ? 'Processing...' : 'Confirm & send receipt'}</button>
              <button onClick={() => setPaidModal(null)} style={{
                background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500,
                padding:'11px 16px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer',
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function FeeCollectionModule({ toast, refreshKey }) {
  const [students,  setStudents]  = useState([])
  const [summary,   setSummary]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [searchQ,   setSearchQ]   = useState('')
  const [statusF,   setStatusF]   = useState('all')
  const [currF,     setCurrF]     = useState('')
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)
  const LIMIT = 30

  // Modals
  const [editModal,    setEditModal]    = useState(null)  // student being edited
  const [payModal,     setPayModal]     = useState(null)  // student recording payment for
  const [detailModal,  setDetailModal]  = useState(null)  // student detail view
  const [editForm,     setEditForm]     = useState({})
  const [payForm,      setPayForm]      = useState({ amount:'', currency:'USD', paidAt:'', paymentMethod:'Bank transfer', note:'', periodLabel:'' })
  const [saving,       setSaving]       = useState(false)
  const [reminding,    setReminding]    = useState(null)  // studentId being reminded
  const [remindingAll, setRemindingAll] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = { limit:LIMIT, page }
    if (searchQ)          params.search   = searchQ
    if (statusF !== 'all') params.status  = statusF
    if (currF)            params.currency = currF
    api.get('/fees', { params })
      .then(r => {
        setStudents(r.data?.data?.students || [])
        setSummary(r.data?.data?.summary   || null)
        setTotal(r.data?.data?.total       || 0)
      })
      .catch(e => toast?.error?.('Failed to load: '+(e?.response?.data?.message||e.message)))
      .finally(() => setLoading(false))
  }, [searchQ, statusF, currF, page, refreshKey])

  useEffect(() => { load() }, [load])

  const fmtDate  = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'
  const money    = (n,cur='USD') => ({ USD:'$',KES:'KES ',GBP:'£',EUR:'€',AED:'AED ' }[cur]||'')+(n||0).toLocaleString()

  const STATUS_S = {
    overdue:  { bg:'#FEE2E2', fg:'#991B1B', label:'Overdue' },
    'due-soon':{ bg:'#FEF3C7', fg:'#D97706', label:'Due soon' },
    current:  { bg:'#D1FAE5', fg:'#065F46', label:'Current' },
    'no-fee': { bg:'#F3F4F6', fg:'#6B7280', label:'No fee set' },
  }

  const INV_S = {
    paid:    { bg:'#D1FAE5', fg:'#065F46' },
    sent:    { bg:'#DBEAFE', fg:'#1E40AF' },
    overdue: { bg:'#FEE2E2', fg:'#991B1B' },
    draft:   { bg:'#F3F4F6', fg:'#6B7280' },
  }

  // Open edit modal
  const openEdit = (s) => {
    setEditForm({
      agreedFee:   s.agreedFee || '',
      feeCurrency: s.feeCurrency || 'USD',
      billingDay:  s.billingDay || 15,
      billingNote: s.billingNote || '',
      nextDueDate: s.nextDueDate ? new Date(s.nextDueDate).toISOString().split('T')[0] : '',
    })
    setEditModal(s)
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      await api.patch('/fees/'+editModal._id, editForm)
      toast?.ok?.('Billing updated for '+editModal.name+'.')
      setEditModal(null); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Save failed.') }
    finally { setSaving(false) }
  }

  // Open payment modal
  const openPay = (s) => {
    setPayForm({ amount: s.agreedFee||'', currency: s.feeCurrency||'USD', paidAt: new Date().toISOString().split('T')[0], paymentMethod:'Bank transfer', note:'', periodLabel: new Date().toLocaleDateString('en-GB',{month:'long',year:'numeric'}) })
    setPayModal(s)
  }

  const savePay = async () => {
    if (!payForm.amount) { toast?.error?.('Enter payment amount.'); return }
    setSaving(true)
    try {
      await api.post('/fees/'+payModal._id+'/record-payment', payForm)
      toast?.ok?.('Payment recorded. Invoice created.')
      setPayModal(null); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  // Send reminder
  const sendReminder = async (s) => {
    setReminding(s._id)
    try {
      const r = await api.post('/fees/'+s._id+'/remind')
      toast?.ok?.(r.data?.message || 'Reminder sent.')
      load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setReminding(null) }
  }

  const remindAll = async () => {
    setRemindingAll(true)
    try {
      const r = await api.post('/fees/remind-all')
      toast?.ok?.(r.data?.message || 'Reminders sent.')
      load()
    } catch(e) { toast?.error?.('Failed.') }
    finally { setRemindingAll(false) }
  }

  const inp = { width:'100%', padding:'9px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }
  const totalPages = Math.ceil(total/LIMIT)

  return (
    <>
      <PSection tag="Accountant" title="Fee" em="Collection"
        sub="All students, their billing cycles, outstanding balances, and payment history. Reminders are sent automatically 3 days before each due date."/>

      {/* Summary KPIs */}
      {summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:22 }}>
          {[
            { label:'Total students',  val:summary.total,       color:TOKENS.s900 },
            { label:'Overdue',         val:summary.overdue,     color:'#991B1B' },
            { label:'Due within 3d',   val:summary.dueSoon,     color:'#D97706' },
            { label:'Current',         val:summary.current,     color:'#065F46' },
            { label:'No fee set',      val:summary.noFee,       color:TOKENS.s400 },
            { label:'Monthly revenue', val:money(summary.totalMonthly,'USD'), color:TOKENS.crimson, wide:true },
          ].map(k=>(
            <div key={k.label} className="kpi" style={{ gridColumn:k.wide?'span 2':undefined }}>
              <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{k.label}</div>
              <div style={{ fontSize:k.wide?20:24, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'){setSearchQ(search);setPage(1)} }}
          placeholder="Search name, email, admission no..."
          style={{ flex:'1 1 220px', padding:'9px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }}/>
        <button onClick={()=>{setSearchQ(search);setPage(1)}} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:13, fontWeight:700, cursor:'pointer' }}>Search</button>

        {/* Status filter tabs */}
        <div style={{ display:'flex', border:'1.5px solid '+TOKENS.line, borderRadius:7, overflow:'hidden' }}>
          {[['all','All'],['overdue','Overdue'],['due-soon','Due soon'],['current','Current'],['no-fee','No fee']].map(([val,label])=>(
            <button key={val} onClick={()=>{setStatusF(val);setPage(1)}} style={{
              padding:'8px 12px', border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
              background:statusF===val?TOKENS.crimson:'#fff', color:statusF===val?'#fff':TOKENS.s500,
              borderRight:'1px solid '+TOKENS.line,
            }}>{label}{summary&&val==='overdue'&&summary.overdue>0?` (${summary.overdue})`:''}{summary&&val==='due-soon'&&summary.dueSoon>0?` (${summary.dueSoon})`:''}</button>
          ))}
        </div>

        <select value={currF} onChange={e=>setCurrF(e.target.value)}
          style={{ padding:'9px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}>
          <option value="">All currencies</option>
          {['USD','KES','GBP','EUR','AED'].map(c=><option key={c} value={c}>{c}</option>)}
        </select>

        <button onClick={remindAll} disabled={remindingAll} style={{
          marginLeft:'auto', background:remindingAll?TOKENS.s300:'#D97706', color:'#fff',
          border:'none', padding:'9px 16px', borderRadius:7, fontSize:12.5, fontWeight:700,
          cursor:remindingAll?'not-allowed':'pointer', whiteSpace:'nowrap',
        }}>
          {remindingAll ? 'Sending...' : 'Send all due reminders'}
        </button>
      </div>

      {/* Students table */}
      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading students...</div>
        ) : students.length===0 ? (
          <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No students found.</div>
        ) : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Student','Curriculum / Grade','Agreed fee','Billing day','Next due','Status','Last invoice',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10.5 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {students.map(s => {
                const ss   = STATUS_S[s.billingStatus] || STATUS_S['no-fee']
                const inv  = s.lastInvoice
                const iSS  = inv ? INV_S[inv.status]||INV_S.draft : null
                const days = s.daysUntilDue
                return (
                  <tr key={String(s._id)} style={{ borderTop:'1px solid '+TOKENS.line, background:s.billingStatus==='overdue'?'#FFF5F5':undefined }}>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{s.name}</div>
                      <div style={{ fontSize:11, color:TOKENS.s500, marginTop:1 }}>{s.admissionNo||s.email}</div>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s600 }}>
                      {s.curriculum}{s.grade?' · '+s.grade:''}
                      {s.programme&&<div style={{ fontSize:11, color:TOKENS.s400, marginTop:1 }}>{s.programme}</div>}
                    </td>
                    <td style={{ padding:'10px 14px', fontWeight:800, fontSize:14, color:s.agreedFee?TOKENS.crimson:TOKENS.s400 }}>
                      {s.agreedFee ? money(s.agreedFee, s.feeCurrency) : '—'}
                      {s.billingNote&&<div style={{ fontSize:10.5, color:TOKENS.s400, fontWeight:400, marginTop:1, maxWidth:140 }}>{s.billingNote}</div>}
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:13, color:TOKENS.s600 }}>
                      {s.agreedFee ? `${s.billingDay}th` : '—'}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontSize:13, color:TOKENS.s700 }}>{fmtDate(s.nextDueDate)}</div>
                      {days !== null && s.agreedFee > 0 && (
                        <div style={{ fontSize:11, fontWeight:700, marginTop:2, color:days<0?'#991B1B':days<=3?'#D97706':'#065F46' }}>
                          {days<0?Math.abs(days)+' days overdue':days===0?'Today':days===1?'Tomorrow':days+' days'}
                        </div>
                      )}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:ss.bg, color:ss.fg }}>
                        {ss.label}
                      </span>
                      {s.feeReminderSent && (
                        <div style={{ fontSize:10, color:TOKENS.s400, marginTop:3 }}>Reminded {fmtDate(s.feeReminderSent)}</div>
                      )}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      {inv ? (
                        <>
                          <div style={{ fontSize:11.5, fontWeight:700, color:TOKENS.s900 }}>{inv.invoiceNo}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                            <span style={{ padding:'1px 7px', borderRadius:99, fontSize:10, fontWeight:700, background:iSS.bg, color:iSS.fg }}>{inv.status}</span>
                            <span style={{ fontSize:11, color:TOKENS.s500 }}>{money(inv.amount, s.feeCurrency)}</span>
                          </div>
                        </>
                      ) : <span style={{ fontSize:12, color:TOKENS.s400 }}>No invoice yet</span>}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:5, flexWrap:'nowrap' }}>
                        <button onClick={()=>openEdit(s)} style={{ padding:'5px 10px', borderRadius:6, border:'1px solid '+TOKENS.line, background:'#fff', color:TOKENS.s700, fontSize:11.5, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>Edit</button>
                        <button onClick={()=>openPay(s)} style={{ padding:'5px 10px', borderRadius:6, border:'none', background:TOKENS.accentEmerald, color:'#fff', fontSize:11.5, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>Record payment</button>
                        <button onClick={()=>sendReminder(s)} disabled={reminding===s._id||!s.agreedFee}
                          style={{ padding:'5px 9px', borderRadius:6, border:'1px solid #FDE68A', background:reminding===s._id?TOKENS.s200:'#FFFBEB', color:'#D97706', fontSize:11.5, fontWeight:600, cursor:reminding===s._id||!s.agreedFee?'not-allowed':'pointer', opacity:!s.agreedFee?.5:1 }}>
                          {reminding===s._id?'Sending...':'Remind'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, marginTop:14 }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
            style={{ padding:'6px 14px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page<=1?'not-allowed':'pointer', opacity:page<=1?.5:1 }}>‹ Prev</button>
          <span style={{ fontSize:12.5, color:TOKENS.s600 }}>Page {page} of {totalPages} · {total} students</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}
            style={{ padding:'6px 14px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page>=totalPages?'not-allowed':'pointer', opacity:page>=totalPages?.5:1 }}>Next ›</button>
        </div>
      )}

      {/* ── Edit billing modal ── */}
      {editModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setEditModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:460, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:2 }}>Edit billing — {editModal.name}</div>
            <div style={{ fontSize:12, color:TOKENS.s500, marginBottom:20 }}>{editModal.curriculum} · {editModal.grade} · {editModal.admissionNo}</div>

            <div style={{ display:'grid', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Agreed monthly fee</label>
                  <input type="number" value={editForm.agreedFee} onChange={e=>setEditForm(p=>({...p,agreedFee:e.target.value}))} className="fi" placeholder="e.g. 400"/>
                </div>
                <div>
                  <label className="fl">Currency</label>
                  <select value={editForm.feeCurrency} onChange={e=>setEditForm(p=>({...p,feeCurrency:e.target.value}))} className="fsel">
                    {['USD','KES','GBP','EUR','AED'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Billing day of month</label>
                  <select value={editForm.billingDay} onChange={e=>setEditForm(p=>({...p,billingDay:e.target.value}))} className="fsel">
                    {Array.from({length:28},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}{d===1?'st':d===2?'nd':d===3?'rd':'th'} of month</option>)}
                  </select>
                </div>
                <div>
                  <label className="fl">Override next due date</label>
                  <input type="date" value={editForm.nextDueDate} onChange={e=>setEditForm(p=>({...p,nextDueDate:e.target.value}))} className="fi"/>
                </div>
              </div>
              <div>
                <label className="fl">Billing note</label>
                <input value={editForm.billingNote} onChange={e=>setEditForm(p=>({...p,billingNote:e.target.value}))} className="fi" placeholder="e.g. Pays via M-Pesa, Discount applied"/>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={saveEdit} disabled={saving} style={{ flex:1, background:saving?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
                {saving?'Saving...':'Save billing settings'}
              </button>
              <button onClick={()=>setEditModal(null)} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Record payment modal ── */}
      {payModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setPayModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:460, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:2 }}>Record payment — {payModal.name}</div>
            <div style={{ fontSize:12, color:TOKENS.s500, marginBottom:20 }}>Agreed fee: {payModal.agreedFee?({ USD:'$',KES:'KES ',GBP:'£',EUR:'€',AED:'AED ' }[payModal.feeCurrency]||'')+payModal.agreedFee:'Not set'}</div>

            <div style={{ display:'grid', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Amount received</label>
                  <input type="number" value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))} className="fi" placeholder={payModal.agreedFee||'0'}/>
                </div>
                <div>
                  <label className="fl">Currency</label>
                  <select value={payForm.currency} onChange={e=>setPayForm(p=>({...p,currency:e.target.value}))} className="fsel">
                    {['USD','KES','GBP','EUR','AED'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Date received</label>
                  <input type="date" value={payForm.paidAt} onChange={e=>setPayForm(p=>({...p,paidAt:e.target.value}))} className="fi"/>
                </div>
                <div>
                  <label className="fl">Payment method</label>
                  <select value={payForm.paymentMethod} onChange={e=>setPayForm(p=>({...p,paymentMethod:e.target.value}))} className="fsel">
                    {['Bank transfer','M-Pesa','Paystack','Cash','Cheque','Wire transfer','Other'].map(m=><option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="fl">Period label</label>
                <input value={payForm.periodLabel} onChange={e=>setPayForm(p=>({...p,periodLabel:e.target.value}))} className="fi" placeholder="e.g. July 2026"/>
              </div>
              <div>
                <label className="fl">Note (optional)</label>
                <input value={payForm.note} onChange={e=>setPayForm(p=>({...p,note:e.target.value}))} className="fi" placeholder="Transaction ID, reference, etc."/>
              </div>
            </div>

            <div style={{ background:'#F0FDF4', borderRadius:8, padding:'10px 14px', marginTop:14, fontSize:12, color:'#065F46' }}>
              A paid invoice will be created automatically. The next due date will be recalculated.
            </div>

            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button onClick={savePay} disabled={saving} style={{ flex:1, background:saving?TOKENS.s300:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
                {saving?'Saving...':'Record payment & create invoice'}
              </button>
              <button onClick={()=>setPayModal(null)} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function BillingModule({ refreshKey, toast }) {
  // Two working lanes only. The old "Paystack Payments" tab read a
  // retired payments collection (stale June data, 3 rows) - dead
  // code, removed. Paystack invoicing (checkout links emailed with
  // a Pay Now button) is the real card lane and now stands as its
  // own tab beside Invoices instead of hiding behind a button.
  const [billingTab, setBillingTab] = useState('invoices')  // invoices | paystack

  return (
    <>
      <PSection tag="Finance" title="Billing &" em="Payments" sub="Invoices, Paystack card invoicing, receipts and reminders"/>

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:5, marginBottom:20, borderBottom:'1.5px solid '+TOKENS.line, paddingBottom:0 }}>
        {[['invoices','Invoices'],['paystack','Paystack Invoicing']].map(([k,l])=>(
          <button key={k} onClick={()=>setBillingTab(k)} style={{
            padding:'9px 18px', border:'none', background:'transparent',
            borderBottom:billingTab===k?'2.5px solid '+TOKENS.crimson:'2.5px solid transparent',
            color:billingTab===k?TOKENS.crimson:TOKENS.s500,
            fontSize:13, fontWeight:billingTab===k?700:500, cursor:'pointer', marginBottom:-1.5,
          }}>{l}</button>
        ))}
      </div>

      {billingTab === 'invoices' && <InvoicesTab toast={toast} refreshKey={refreshKey}/>}
      {billingTab === 'paystack' && <CardPayments toast={toast} onBack={() => setBillingTab('invoices')}/>}
    </>
  )
}

export default BillingModule


// ═══════════════════════════════════════════════════════════
// CARD PAYMENTS (Paystack) — the quick lane. Enter an email and
// an amount; the parent receives a branded Pay Now email and pays
// by card. Fully separate from the invoice system.
// ═══════════════════════════════════════════════════════════
function CardPayments({ toast, onBack }) {
  const [f, setF] = React.useState({ payerName: '', email: '', amount: '', currency: 'KES', description: 'School fees' })
  const [sending, setSending] = React.useState(false)
  const [rows, setRows] = React.useState([])
  const [lastLink, setLastLink] = React.useState('')
  const [checking, setChecking] = React.useState('')

  const load = () => api.get('/paystack/requests')
    .then(r => setRows(r.data?.data?.requests || []))
    .catch(() => {})
  React.useEffect(() => { load() }, [])

  const set = (k) => (e) => setF(p => ({ ...p, [k]: e.target.value }))

  const send = async () => {
    if (!f.email || !/.+@.+\..+/.test(f.email)) return toast?.error?.('Enter a valid parent email.')
    if (!Number(f.amount) || Number(f.amount) <= 0) return toast?.error?.('Enter an amount greater than zero.')
    setSending(true)
    try {
      const r = await api.post('/paystack/request', { ...f, amount: Number(f.amount) })
      const doc = r.data?.data?.request
      setLastLink(doc?.authorizationUrl || '')
      toast?.ok?.('Payment request emailed to ' + f.email)
      setF(p => ({ ...p, payerName: '', email: '', amount: '' }))
      load()
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not create the payment link.')
    }
    setSending(false)
  }

  const verify = async (ref) => {
    setChecking(ref)
    try {
      const r = await api.get('/paystack/verify/' + ref)
      const st = r.data?.data?.request?.status
      toast?.ok?.(st === 'paid' ? 'Confirmed PAID by Paystack.' : 'Status from Paystack: ' + st)
      load()
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not verify.')
    }
    setChecking('')
  }

  const STATUS = { pending: '#B45309', paid: '#166534', failed: '#B91C1C', abandoned: '#5A5A62' }
  const inp = { width: '100%', padding: '9px 11px', border: '1.5px solid ' + TOKENS.line, borderRadius: 8, fontSize: 12.5 }
  const lbl = { fontSize: 11.5, fontWeight: 700, color: TOKENS.s600, display: 'block', marginBottom: 4 }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: TOKENS.crimson, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: 0 }}>{'\u2190'} Back to invoices</button>
      </div>

      <div style={{ background: '#fff', border: '1.5px solid ' + TOKENS.line, borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 2 }}>Request a card payment</div>
        <div style={{ fontSize: 11.5, color: TOKENS.s500, marginBottom: 14 }}>
          The parent receives a branded email with a secure Pay Now button. Payment is processed by Paystack and does not touch the invoice books.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div><label style={lbl}>Parent name</label><input value={f.payerName} onChange={set('payerName')} placeholder="Optional" style={inp}/></div>
          <div><label style={lbl}>Parent email *</label><input value={f.email} onChange={set('email')} placeholder="parent@email.com" style={inp}/></div>
          <div><label style={lbl}>Amount *</label><input type="number" min="1" value={f.amount} onChange={set('amount')} placeholder="e.g. 40000" style={inp}/></div>
          <div><label style={lbl}>Currency</label>
            <select value={f.currency} onChange={set('currency')} style={{ ...inp, background: '#fff' }}>
              {['KES', 'USD', 'NGN', 'GHS', 'ZAR'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>What is this payment for</label>
            <input value={f.description} onChange={set('description')} placeholder="e.g. Tuition fees, September 2026" style={inp}/>
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={send} disabled={sending}
            style={{ background: TOKENS.crimson, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {sending ? 'Creating link...' : 'Create link and email parent'}
          </button>
          {lastLink && (
            <button onClick={() => { navigator.clipboard?.writeText(lastLink); toast?.ok?.('Link copied. You can also share it on WhatsApp.') }}
              style={{ background: '#fff', color: TOKENS.crimson, border: '1.5px solid ' + TOKENS.crimson, padding: '10px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
              Copy last payment link
            </button>
          )}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1.5px solid ' + TOKENS.line, borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: TOKENS.s900, marginBottom: 10 }}>Recent card payment requests</div>
        {rows.length === 0 ? (
          <div style={{ fontSize: 12.5, color: TOKENS.s500 }}>No requests yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead><tr style={{ textAlign: 'left', color: TOKENS.s500 }}>
                {['Date', 'Payer', 'Amount', 'For', 'Status', ''].map(h => <th key={h} style={{ padding: '6px 8px', borderBottom: '1.5px solid ' + TOKENS.line, fontSize: 11, fontWeight: 700 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.reference}>
                    <td style={{ padding: '8px', borderBottom: '1px solid ' + TOKENS.line, whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid ' + TOKENS.line }}>
                      <div style={{ fontWeight: 700 }}>{r.payerName || '\u2014'}</div>
                      <div style={{ fontSize: 11, color: TOKENS.s500 }}>{r.email}</div>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid ' + TOKENS.line, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.currency} {Number(r.amount).toLocaleString()}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid ' + TOKENS.line, maxWidth: 180 }}>{r.description}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid ' + TOKENS.line }}>
                      <span style={{ color: STATUS[r.status] || TOKENS.s500, fontWeight: 800, fontSize: 11.5, textTransform: 'uppercase' }}>{r.status}</span>
                      {r.channel ? <span style={{ fontSize: 10.5, color: TOKENS.s500 }}> \u00b7 {r.channel}</span> : null}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid ' + TOKENS.line, whiteSpace: 'nowrap' }}>
                      {r.status !== 'paid' && (
                        <button onClick={() => verify(r.reference)} disabled={checking === r.reference}
                          style={{ background: '#fff', color: TOKENS.crimson, border: '1.5px solid ' + TOKENS.line, padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          {checking === r.reference ? 'Checking...' : 'Check status'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ fontSize: 10.5, color: TOKENS.s500, marginTop: 10, lineHeight: 1.5 }}>
          Check status asks Paystack directly, so a payment shows as PAID only when Paystack confirms the money. When a request turns PAID, accounts@ receives a confirmation email automatically.
        </div>
      </div>
    </div>
  )
}
