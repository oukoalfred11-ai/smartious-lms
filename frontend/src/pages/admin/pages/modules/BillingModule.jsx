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
                      {inv.status === 'sent' && (
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
  const store = useStore()
  const [billingTab, setBillingTab] = useState('payments')  // payments | invoices

  // ── Real payment data from backend ───────────────────
  const [payments,       setPayments]       = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [revSummary,     setRevSummary]     = useState(null)   // { totalRevenue, totalConfirmed, total }
  const [monthlyRev,     setMonthlyRev]     = useState([])     // [{ _id:{year,month}, total, count }]
  const [students,       setStudents]       = useState([])

  // Filters
  const [statusFilter,  setStatusFilter]  = useState('')
  const [searchInput,   setSearchInput]   = useState('')
  const [search,        setSearch]        = useState('')
  const [listPage,      setListPage]      = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [totalCount,    setTotalCount]    = useState(0)

  // Detail modal
  const [selected,       setSelected]       = useState(null)
  const [detailLoading,  setDetailLoading]  = useState(false)
  const [overrideStatus, setOverrideStatus] = useState('')
  const [overrideNote,   setOverrideNote]   = useState('')
  const [overrideSaving, setOverrideSaving] = useState(false)

  const fetchPayments = useCallback(async (pg = 1) => {
    setPaymentsLoading(true)
    try {
      const params = new URLSearchParams({ page: pg, limit: 25 })
      if (statusFilter) params.append('status', statusFilter)
      if (search)       params.append('search', search)
      const { data } = await api.get('/payments/admin/all?' + params)
      if (data?.success) {
        setPayments(data.data.payments || [])
        setTotalCount(data.data.total || 0)
        setTotalPages(data.data.totalPages || 1)
        setRevSummary({ totalRevenue: data.data.totalRevenue, totalConfirmed: data.data.totalConfirmed })
        setListPage(pg)
      }
    } catch { toast.error('Could not load payments') }
    setPaymentsLoading(false)
  }, [statusFilter, search])

  useEffect(() => { fetchPayments(1) }, [fetchPayments, refreshKey])

  useEffect(() => {
    api.get('/payments/admin/revenue/monthly?months=6')
      .then(r => { if (r.data?.success) setMonthlyRev(r.data.data || []) })
      .catch(() => {})
    api.get('/users/students/list')
      .then(r => setStudents(r.data.students || []))
      .catch(() => {})
  }, [refreshKey])

  // Open detail
  const openDetail = async (p) => {
    setSelected({ ...p, _loading: true })
    setOverrideStatus(p.status || 'pending')
    setOverrideNote('')
    setDetailLoading(true)
    try {
      const { data } = await api.get('/payments/admin/' + p._id)
      if (data?.success) { setSelected(data.data); setOverrideStatus(data.data.status || 'pending') }
    } catch { setSelected(p) }
    setDetailLoading(false)
  }

  const saveOverride = async () => {
    if (!selected) return
    setOverrideSaving(true)
    try {
      const { data } = await api.patch('/payments/admin/' + selected._id + '/status', { status: overrideStatus, note: overrideNote })
      if (data?.success) {
        toast.ok('Status updated')
        setSelected(data.data)
        setPayments(ps => ps.map(p => String(p._id) === String(selected._id) ? { ...p, status: overrideStatus } : p))
      } else { toast.error(data?.message || 'Update failed') }
    } catch { toast.error('Could not update status') }
    setOverrideSaving(false)
  }

  // Helpers
  const parentName = (p) => {
    const u = p.parentId
    if (!u) return '—'
    return typeof u === 'object' ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '—' : '—'
  }
  const studentName = (p) => {
    const s = p.studentId
    if (!s || typeof s !== 'object') return '—'
    return `${s.firstName || ''} ${s.lastName || ''}`.trim() || '—'
  }
  const StatusBadge = ({ status }) => {
    const cfg = { success: ['#DCFCE7','#15803D'], pending: ['#FEF9C3','#854D0E'], failed: ['#FEE2E2','#DC2626'] }[status] || ['#EFF6FF','#1D4ED8']
    const label = { success:'Paid', pending:'Pending', failed:'Failed' }[status] || status
    return <span style={{ background: cfg[0], color: cfg[1], fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, border: '1px solid ' + cfg[1] + '30' }}>{label}</span>
  }

  // Revenue derived values
  const totalRevenue   = revSummary?.totalRevenue ?? 0
  const totalConfirmed = revSummary?.totalConfirmed ?? 0

  // Payment-method split computed from the confirmed payments actually
  // loaded, rather than fixed percentages. Returns [label, pct] pairs
  // sorted largest first.
  const methodSplit = React.useMemo(() => {
    const confirmed = (payments || []).filter(p => (p.status || '').toLowerCase() === 'success' || (p.status || '').toLowerCase() === 'confirmed' || (p.status || '').toLowerCase() === 'paid')
    const pool = confirmed.length ? confirmed : (payments || [])
    if (!pool.length) return []
    const counts = {}
    pool.forEach(p => {
      const m = (p.method || 'Other').trim() || 'Other'
      counts[m] = (counts[m] || 0) + 1
    })
    const total = pool.length
    return Object.entries(counts)
      .map(([label, n]) => [label, Math.round((n / total) * 100)])
      .sort((a, b) => b[1] - a[1])
  }, [payments])
  const monthlyAvg     = monthlyRev.length > 0 ? Math.round(monthlyRev.reduce((s, m) => s + m.total, 0) / monthlyRev.length) : 0
  const lastMonthRev   = monthlyRev.length > 0 ? monthlyRev[monthlyRev.length - 1]?.total ?? 0 : 0

  const monthLabel = (m) => {
    const d = new Date(m._id.year, m._id.month - 1)
    return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
  }
  const maxBar = Math.max(...monthlyRev.map(m => m.total), 1)

  return (
    <>
      <PSection tag="Finance" title="Billing &" em="Payments" sub="All student payments, Paystack transactions and revenue analytics"/>

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:5, marginBottom:20, borderBottom:'1.5px solid '+TOKENS.line, paddingBottom:0 }}>
        {[['payments','Paystack Payments'],['invoices','Invoices']].map(([k,l])=>(
          <button key={k} onClick={()=>setBillingTab(k)} style={{
            padding:'9px 18px', border:'none', background:'transparent',
            borderBottom:billingTab===k?'2.5px solid '+TOKENS.crimson:'2.5px solid transparent',
            color:billingTab===k?TOKENS.crimson:TOKENS.s500,
            fontSize:13, fontWeight:billingTab===k?700:500, cursor:'pointer', marginBottom:-1.5,
          }}>{l}</button>
        ))}
      </div>

      {billingTab === 'invoices' && <InvoicesTab toast={toast} refreshKey={refreshKey}/>}
      {billingTab === 'payments' && (<>

      {/* ── KPI row ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total Revenue" value={fmtKsh(totalRevenue)} delta={totalConfirmed + ' confirmed payments'} accent={TOKENS.accentEmerald}/>
        <PKpi label="Last Month" value={fmtKsh(lastMonthRev)} delta="Confirmed only" accent={TOKENS.crimson}/>
        <PKpi label="Monthly Avg" value={fmtKsh(monthlyAvg)} delta="6-month average" accent={TOKENS.accentNavy}/>
        <PKpi label="All Transactions" value={totalCount} delta={statusFilter || 'Any status'} accent={TOKENS.s500}/>
      </div>

      {/* ── Monthly bar chart ── */}
      {monthlyRev.length > 0 && (
        <PCard accent={TOKENS.accentEmerald} style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: TOKENS.s900, marginBottom: 18, fontWeight: 600 }}>Monthly Revenue</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
            {monthlyRev.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: TOKENS.s500, fontWeight: 700 }}>
                  {fmtKsh(m.total).replace('KSh ', '')}
                </div>
                <div style={{ width: '100%', background: TOKENS.accentEmerald, borderRadius: '4px 4px 0 0', height: Math.max(4, Math.round((m.total / maxBar) * 72)) + 'px', opacity: i === monthlyRev.length - 1 ? 1 : 0.55 }}/>
                <div style={{ fontSize: 10, color: TOKENS.s500, whiteSpace: 'nowrap' }}>{monthLabel(m)}</div>
              </div>
            ))}
          </div>
        </PCard>
      )}

      {/* ── Filters ── */}
      <PCard style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="fl">Search reference or description</label>
            <input className="fi" value={searchInput} onChange={e => setSearchInput(e.target.value)}
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
          <button className="btn btn-p btn-sm" onClick={() => { setSearch(searchInput); fetchPayments(1) }}>Search</button>
          <button className="btn btn-s btn-sm" onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter('') }}>Clear</button>
        </div>
      </PCard>

      {/* ── Payments table ── */}
      <PCard>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: TOKENS.s900, marginBottom: 16, fontWeight: 600 }}>
          Transactions
          {totalCount > 0 && <span style={{ fontSize: 13, fontWeight: 500, color: TOKENS.s500, marginLeft: 10 }}>{totalCount} total</span>}
        </h3>

        {paymentsLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: TOKENS.s400 }}>Loading…</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: TOKENS.s500 }}>
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
                  <tr key={p._id || i} style={{ cursor: 'pointer' }} onClick={() => openDetail(p)}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12.5 }}>{fmtDate(p.createdAt)}</div>
                      <div style={{ fontSize: 11, color: TOKENS.s400 }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{parentName(p)}</div>
                      {typeof p.parentId === 'object' && p.parentId?.email && (
                        <div style={{ fontSize: 11, color: TOKENS.s400 }}>{p.parentId.email}</div>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: TOKENS.s600 }}>{studentName(p)}</td>
                    <td style={{ fontSize: 13 }}>{p.description || '—'}</td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: TOKENS.accentEmerald }}>
                        {fmtKsh(p.amount)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: TOKENS.s500 }}>
                        {p.reference || '—'}
                      </span>
                    </td>
                    <td><StatusBadge status={p.status}/></td>
                    <td>
                      <button className="btn btn-s btn-sm" onClick={e => { e.stopPropagation(); openDetail(p) }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', paddingTop: 16, flexWrap: 'wrap' }}>
                <button className="btn btn-s btn-sm" disabled={listPage <= 1} onClick={() => fetchPayments(listPage - 1)}>← Prev</button>
                <span style={{ fontSize: 13, color: TOKENS.s500, lineHeight: '30px' }}>Page {listPage} of {totalPages}</span>
                <button className="btn btn-s btn-sm" disabled={listPage >= totalPages} onClick={() => fetchPayments(listPage + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </PCard>

      {/* ── Fee structure (store-based, admin-editable in future) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        <PCard accent={TOKENS.crimson}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: TOKENS.s900, marginBottom: 14, fontWeight: 600 }}>Standard Fee Schedule</h3>
          {[
            ['Individual Basic',   store.fees?.individual_basic   || 1499],
            ['Individual Premium', store.fees?.individual_premium || 2999],
            ['Family Plan',        store.fees?.family_plan        || 4999],
            ['IGCSE Pack',         store.fees?.igcse_pack         || 18000],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid ' + TOKENS.s100 }}>
              <span style={{ fontSize: 13, color: TOKENS.s700 }}>{label}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: TOKENS.crimson }}>{fmtKsh(val)}</span>
            </div>
          ))}
        </PCard>
        <PCard accent={TOKENS.accentEmerald}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: TOKENS.s900, marginBottom: 14, fontWeight: 600 }}>Payment Methods</h3>
          {methodSplit.length === 0 ? (
            <div style={{ fontSize: 13, color: TOKENS.s500, padding: '12px 0' }}>
              No confirmed payments yet, so there is nothing to break down.
            </div>
          ) : methodSplit.map(([label, pct]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid ' + TOKENS.s100 }}>
              <span style={{ fontSize: 13, color: TOKENS.s700, flex: 1 }}>{label}</span>
              <div style={{ flex: 2, height: 6, background: TOKENS.s100, borderRadius: 99 }}>
                <div style={{ width: pct + '%', height: '100%', background: TOKENS.accentEmerald, borderRadius: 99 }}/>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: TOKENS.s900, width: 50, textAlign: 'right' }}>{pct}%</span>
            </div>
          ))}
        </PCard>
      </div>

      {/* ══ DETAIL MODAL ══════════════════════════════════════ */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: TOKENS.white, borderRadius: 20, padding: 28, maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.22)' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: TOKENS.s500, marginBottom: 6 }}>Payment Detail</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: TOKENS.s900 }}>{selected.description || 'Payment'}</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>

            {detailLoading ? (
              <div style={{ padding: 30, textAlign: 'center', color: TOKENS.s400 }}>Loading…</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[
                    ['Amount',    fmtKsh(selected.amount)],
                    ['Status',    null],
                    ['Reference', selected.reference || '—'],
                    ['Method',    selected.method || '—'],
                    ['Parent',    parentName(selected)],
                    ['Student',   studentName(selected)],
                    ['Date',      fmtDate(selected.createdAt)],
                    ['Paid At',   selected.paidAt ? fmtDate(selected.paidAt) : '—'],
                  ].map(([l, v]) => (
                    <div key={l} style={{ padding: '10px 12px', background: TOKENS.s50, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: TOKENS.s400, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{l}</div>
                      {l === 'Status'
                        ? <StatusBadge status={selected.status}/>
                        : <div style={{ fontSize: 13.5, fontWeight: 600, color: TOKENS.s800, wordBreak: 'break-all' }}>{v}</div>
                      }
                    </div>
                  ))}
                </div>

                {selected.adminNote && (
                  <div style={{ background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 10, padding: '10px 12px', marginBottom: 18, fontSize: 12.5, color: '#854D0E' }}>
                    <strong>Admin note:</strong> {selected.adminNote}
                  </div>
                )}

                <div style={{ borderTop: '1px solid ' + TOKENS.s100, paddingTop: 18 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: TOKENS.s900, marginBottom: 6 }}>Override Status</div>
                  <div style={{ fontSize: 12.5, color: TOKENS.s500, marginBottom: 12, lineHeight: 1.6 }}>
                    Manually confirm bank transfers or M-Pesa payments received outside Paystack.
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
                      placeholder="E.g. Confirmed via M-Pesa screenshot from parent"/>
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-s btn-sm" onClick={() => setSelected(null)}>Cancel</button>
                    <button className="btn btn-p" onClick={saveOverride} disabled={overrideSaving}>
                      {overrideSaving ? 'Saving…' : 'Save Override'}
                    </button>
                  </div>
                </div>

                {selected.paystackData && (
                  <details style={{ marginTop: 16 }}>
                    <summary style={{ fontSize: 12, color: TOKENS.s400, cursor: 'pointer', userSelect: 'none' }}>Raw Paystack data</summary>
                    <pre style={{ marginTop: 8, fontSize: 11, color: TOKENS.s600, background: TOKENS.s50, padding: 12, borderRadius: 10, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(selected.paystackData, null, 2)}
                    </pre>
                  </details>
                )}
              </>
            )}
          </div>
        </div>
      )}
      </>
      )}
    </>
  )
}

export default BillingModule
