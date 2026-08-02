import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { fmtDate } from '../shared/helpers.js'
import { PSection } from '../shared/ui.jsx'

function PayrollModule({ refreshKey, toast }) {
  const [records,   setRecords]   = useState([])
  const [teachers,  setTeachers]  = useState([])
  const [summary,   setSummary]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [filters,   setFilters]   = useState({ month: new Date().getMonth()+1, year: new Date().getFullYear(), status:'', teacherId:'' })

  // Modals
  const [createModal, setCreateModal] = useState(false)
  const [editModal,   setEditModal]   = useState(null)
  const [payModal,    setPayModal]    = useState(null)
  const [detailModal, setDetailModal] = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [deleting,    setDeleting]    = useState(null)

  // Create form
  const blankForm = { teacherId:'', periodMonth:new Date().getMonth()+1, periodYear:new Date().getFullYear(), basicSalary:'', currency:'KES', deductions:[{label:'NHIF',amount:''},{label:'NSSF',amount:''}], paymentMethod:'Bank transfer', paymentDate:'' }
  const [form,    setForm]    = useState(blankForm)

  // Pay modal form
  const [payForm, setPayForm] = useState({ paymentDate:new Date().toISOString().split('T')[0], paymentMethod:'Bank transfer', paymentRef:'', paymentNote:'' })

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const cur     = (r) => r?.currency||'KES'
  const money   = (n, c='KES') => ({KES:'KES ',USD:'$',GBP:'£'})[c]||''+(n||0).toLocaleString('en-US',{minimumFractionDigits:2})
  const fmtDate = d => d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'

  const STATUS_S = {
    draft:      { bg:'#F3F4F6', fg:'#6B7280', label:'Draft' },
    processing: { bg:'#DBEAFE', fg:'#1E40AF', label:'Processing' },
    paid:       { bg:'#D1FAE5', fg:'#065F46', label:'Paid' },
  }

  const load = useCallback(() => {
    setLoading(true)
    const p = { month:filters.month, year:filters.year }
    if (filters.status)    p.status    = filters.status
    if (filters.teacherId) p.teacherId = filters.teacherId
    api.get('/payroll', { params:p })
      .then(r => { setRecords(r.data?.data?.records||[]); setSummary(r.data?.data?.summary||null) })
      .catch(e => toast?.error?.('Failed to load payroll.'))
      .finally(() => setLoading(false))
  }, [filters, refreshKey])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    api.get('/payroll/teachers')
      .then(r => setTeachers(r.data?.data?.teachers||[]))
      .catch(() => {})
  }, [refreshKey])

  // Create
  const create = async () => {
    if (!form.teacherId || !form.basicSalary) { toast?.error?.('Select teacher and enter basic salary.'); return }
    setSaving(true)
    try {
      const deds = form.deductions.filter(d=>d.label&&parseFloat(d.amount)>0)
      await api.post('/payroll', { ...form, deductions:deds })
      toast?.ok?.('Payroll record created.')
      setCreateModal(false); setForm(blankForm); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  // Save edit
  const saveEdit = async () => {
    if (!editModal) return
    setSaving(true)
    try {
      const deds = (editModal._deds||editModal.deductions||[]).filter(d=>d.label&&parseFloat(d.amount)>0)
      await api.patch('/payroll/'+editModal._id, {
        basicSalary:  editModal._basic,
        currency:     editModal.currency,
        deductions:   deds,
        paymentMethod:editModal.paymentMethod,
      })
      toast?.ok?.('Payroll updated.'); setEditModal(null); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  // Mark paid
  const markPaid = async () => {
    if (!payModal) return
    setSaving(true)
    try {
      const r = await api.post('/payroll/'+payModal._id+'/mark-paid', payForm)
      toast?.ok?.(r.data?.message||'Marked as paid.')
      setPayModal(null); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  // Delete
  const del = async (id) => {
    if (!confirm('Delete this draft payroll record?')) return
    setDeleting(id)
    try { await api.delete('/payroll/'+id); toast?.ok?.('Deleted.'); load() }
    catch(e) { toast?.error?.(e?.response?.data?.message||'Cannot delete.') }
    finally { setDeleting(null) }
  }

  // Approve/reject extra
  const reviewExtra = async (recordId, extraId, action) => {
    try {
      await api.patch('/payroll/'+recordId+'/extras/'+extraId, { action })
      toast?.ok?.('Extra '+action+'d.'); load()
      if (detailModal?._id===recordId) {
        const r = await api.get('/payroll/'+recordId)
        setDetailModal(r.data?.data?.record)
      }
    } catch(e) { toast?.error?.('Failed.') }
  }

  // Payslip
  const openPayslip = async (id) => {
    try {
      const r = await api.get('/payroll/'+id+'/payslip-html')
      const w = window.open('','_blank'); w.document.write(r.data?.data?.html||''); w.document.close()
    } catch(e) { toast?.error?.('Could not load payslip.') }
  }

  const inp = { padding:'9px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit', width:'100%', boxSizing:'border-box' }

  // Pending extras across all records
  const allPendingExtras = records.flatMap(r => (r.tuitionExtras||[]).filter(e=>e.status==='pending').map(e=>({...e, _recordId:r._id, _teacherName:r.teacherName, _period:r.periodLabel})))

  return (
    <>
      <PSection tag="Finance" title="Teacher" em="Payroll"
        sub="Manage teacher salaries, deductions, and tuition extras. Mark paid to automatically email payslips."/>

      {/* Period filter */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <select value={filters.month} onChange={e=>setFilters(p=>({...p,month:parseInt(e.target.value,10)}))}
          style={{ padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }}>
          {MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
        </select>
        <select value={filters.year} onChange={e=>setFilters(p=>({...p,year:parseInt(e.target.value,10)}))}
          style={{ padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }}>
          {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <div style={{ display:'flex', border:'1.5px solid '+TOKENS.line, borderRadius:7, overflow:'hidden' }}>
          {['','draft','processing','paid'].map(s=>(
            <button key={s||'all'} onClick={()=>setFilters(p=>({...p,status:s}))} style={{
              padding:'8px 12px', border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
              background:filters.status===s?TOKENS.crimson:'#fff', color:filters.status===s?'#fff':TOKENS.s500,
              borderRight:'1px solid '+TOKENS.line,
            }}>{s?s.charAt(0).toUpperCase()+s.slice(1):'All'}</button>
          ))}
        </div>
        <button onClick={load} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 16px', borderRadius:7, fontSize:13, fontWeight:700, cursor:'pointer' }}>Refresh</button>
        <button onClick={()=>setCreateModal(true)} style={{ marginLeft:'auto', background:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:13, fontWeight:700, cursor:'pointer' }}>
          + New payroll
        </button>
      </div>

      {/* KPIs */}
      {summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
          {[
            { label:'On payroll',     val:summary.total,                     color:TOKENS.s900 },
            { label:'Paid',          val:summary.paid,                      color:'#065F46' },
            { label:'Draft',         val:summary.draft,                     color:'#6B7280' },
            { label:'Processing',    val:summary.processing,                color:'#1E40AF' },
            { label:'Total gross',   val:money(summary.totalGross,'KES'),   color:TOKENS.crimson },
            { label:'Total net',     val:money(summary.totalNet,'KES'),     color:TOKENS.accentEmerald },
            { label:'Pending extras', val:summary.pendingExtras,            color:summary.pendingExtras>0?'#D97706':TOKENS.s400 },
          ].map(k=>(
            <div key={k.label} className="kpi">
              <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{k.label}</div>
              <div style={{ fontSize:k.label.includes('Total')?18:24, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pending extras alert */}
      {allPendingExtras.length > 0 && (
        <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'14px 18px', marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:800, color:'#D97706', marginBottom:10 }}>
            {allPendingExtras.length} tuition extra{allPendingExtras.length>1?'s':''} awaiting approval
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {allPendingExtras.map((e,i) => (
              <div key={e._id||i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'8px 12px', background:'#fff', borderRadius:8, border:'1px solid #FDE68A' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{e._teacherName} — {e._period}</div>
                  <div style={{ fontSize:12, color:TOKENS.s500 }}>{e.description} · {e.sessions} session{e.sessions>1?'s':''}{e.studentName?' · '+e.studentName:''}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                  <span style={{ fontSize:13, fontWeight:800, color:TOKENS.s900 }}>{money(e.totalAmount,'KES')}</span>
                  <button onClick={()=>reviewExtra(e._recordId,e._id,'approve')} style={{ background:'#065F46', color:'#fff', border:'none', padding:'5px 12px', borderRadius:6, fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Approve</button>
                  <button onClick={()=>reviewExtra(e._recordId,e._id,'reject')} style={{ background:'#991B1B', color:'#fff', border:'none', padding:'5px 12px', borderRadius:6, fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payroll table */}
      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading payroll...</div>
        : records.length===0 ? (
          <div style={{ padding:48, textAlign:'center', color:TOKENS.s400 }}>
            <div style={{ fontSize:13, marginBottom:8 }}>No payroll records for {MONTHS[filters.month-1]} {filters.year}.</div>
            <button onClick={()=>setCreateModal(true)} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 20px', borderRadius:7, fontSize:13, fontWeight:700, cursor:'pointer' }}>Create first record</button>
          </div>
        ) : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Teacher','Period','Basic salary','Deductions','Extras','Net pay','Status','Payment date',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10.5 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {records.map(r => {
                const ss = STATUS_S[r.status]||STATUS_S.draft
                const pendingCount = (r.tuitionExtras||[]).filter(e=>e.status==='pending').length
                return (
                  <tr key={r._id} style={{ borderTop:'1px solid '+TOKENS.line }}>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{r.teacherName}</div>
                      <div style={{ fontSize:11, color:TOKENS.s500 }}>{r.teacherEmail}</div>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:13, color:TOKENS.s700 }}>{r.periodLabel}</td>
                    <td style={{ padding:'10px 14px', fontWeight:700, fontSize:13 }}>{money(r.basicSalary, cur(r))}</td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:'#991B1B' }}>
                      {r.totalDeductions>0?'('+money(r.totalDeductions,cur(r))+')':'—'}
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12.5 }}>
                      {r.totalApprovedExtras>0?<span style={{ color:'#065F46', fontWeight:700 }}>+{money(r.totalApprovedExtras,cur(r))}</span>:'—'}
                      {pendingCount>0&&<span style={{ marginLeft:6, fontSize:10, fontWeight:700, background:'#FEF3C7', color:'#D97706', padding:'1px 6px', borderRadius:99 }}>{pendingCount} pending</span>}
                    </td>
                    <td style={{ padding:'10px 14px', fontWeight:800, fontSize:14, color:TOKENS.accentEmerald }}>{money(r.netPay, cur(r))}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:ss.bg, color:ss.fg }}>{ss.label}</span>
                      {r.payslipEmailSentAt&&<div style={{ fontSize:10, color:TOKENS.s400, marginTop:2 }}>Email sent {fmtDate(r.payslipEmailSentAt)}</div>}
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s600 }}>{fmtDate(r.paymentDate)}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:5, flexWrap:'nowrap' }}>
                        {r.status!=='paid'&&<button onClick={()=>setEditModal({...r, _basic:r.basicSalary, _deds:JSON.parse(JSON.stringify(r.deductions||[]))})} style={{ padding:'5px 9px', borderRadius:6, border:'1px solid '+TOKENS.line, background:'#fff', color:TOKENS.s700, fontSize:11.5, fontWeight:600, cursor:'pointer' }}>Edit</button>}
                        {r.status!=='paid'&&<button onClick={()=>{ setPayModal(r); setPayForm({paymentDate:new Date().toISOString().split('T')[0],paymentMethod:r.paymentMethod||'Bank transfer',paymentRef:'',paymentNote:''}) }} style={{ padding:'5px 9px', borderRadius:6, border:'none', background:TOKENS.accentEmerald, color:'#fff', fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Mark paid</button>}
                        {r.status==='paid'&&<button onClick={()=>openPayslip(r._id)} style={{ padding:'5px 9px', borderRadius:6, border:'1px solid '+TOKENS.crimson, background:'#fff', color:TOKENS.crimson, fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Payslip</button>}
                        {r.status!=='paid'&&<button onClick={()=>del(r._id)} disabled={deleting===r._id} style={{ padding:'5px 9px', borderRadius:6, border:'1px solid #FCA5A5', background:'#fff', color:'#991B1B', fontSize:11.5, cursor:'pointer', opacity:deleting===r._id?.5:1 }}>
                          {deleting===r._id?'…':'Delete'}
                        </button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create modal ── */}
      {createModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, overflowY:'auto' }}
          onClick={()=>setCreateModal(false)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:520, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)', maxHeight:'90vh', overflowY:'auto' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:16, fontWeight:800, color:TOKENS.s900, marginBottom:20 }}>New payroll record</div>
            <div style={{ display:'grid', gap:14 }}>
              <div>
                <label className="fl">Teacher</label>
                <select value={form.teacherId} onChange={e=>setForm(p=>({...p,teacherId:e.target.value}))} style={{ ...{ padding:'9px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit', width:'100%' } }}>
                  <option value="">Select teacher...</option>
                  {teachers.map(t=><option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Month</label>
                  <select value={form.periodMonth} onChange={e=>setForm(p=>({...p,periodMonth:parseInt(e.target.value,10)}))} className="fsel">
                    {MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fl">Year</label>
                  <select value={form.periodYear} onChange={e=>setForm(p=>({...p,periodYear:parseInt(e.target.value,10)}))} className="fsel">
                    {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Basic salary</label>
                  <input type="number" value={form.basicSalary} onChange={e=>setForm(p=>({...p,basicSalary:e.target.value}))} className="fi" placeholder="e.g. 35000"/>
                </div>
                <div>
                  <label className="fl">Currency</label>
                  <select value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))} className="fsel">
                    {['KES','USD','GBP'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {/* Deductions */}
              <div>
                <label className="fl">Deductions</label>
                {form.deductions.map((d,i)=>(
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8, marginBottom:6 }}>
                    <input value={d.label} onChange={e=>{ const ds=[...form.deductions]; ds[i]={...ds[i],label:e.target.value}; setForm(p=>({...p,deductions:ds})) }} className="fi" placeholder="e.g. NHIF"/>
                    <input type="number" value={d.amount} onChange={e=>{ const ds=[...form.deductions]; ds[i]={...ds[i],amount:e.target.value}; setForm(p=>({...p,deductions:ds})) }} className="fi" placeholder="Amount"/>
                    <button onClick={()=>setForm(p=>({...p,deductions:p.deductions.filter((_,j)=>j!==i)}))} style={{ padding:'0 10px', borderRadius:6, border:'1px solid #FCA5A5', background:'#fff', color:'#991B1B', cursor:'pointer', fontSize:16 }}>×</button>
                  </div>
                ))}
                <button onClick={()=>setForm(p=>({...p,deductions:[...p.deductions,{label:'',amount:''}]}))} style={{ fontSize:12, color:TOKENS.crimson, background:'transparent', border:'1px solid '+TOKENS.line, padding:'5px 12px', borderRadius:6, cursor:'pointer', fontWeight:600 }}>+ Add deduction</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Payment method</label>
                  <select value={form.paymentMethod} onChange={e=>setForm(p=>({...p,paymentMethod:e.target.value}))} className="fsel">
                    {['Bank transfer','M-Pesa','Cash','Cheque','Other'].map(m=><option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fl">Expected payment date</label>
                  <input type="date" value={form.paymentDate} onChange={e=>setForm(p=>({...p,paymentDate:e.target.value}))} className="fi"/>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={create} disabled={saving} style={{ flex:1, background:saving?TOKENS.s300:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>{saving?'Saving...':'Create payroll record'}</button>
              <button onClick={()=>setCreateModal(false)} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, overflowY:'auto' }}
          onClick={()=>setEditModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:500, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)', maxHeight:'90vh', overflowY:'auto' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:4 }}>Edit payroll — {editModal.teacherName}</div>
            <div style={{ fontSize:12, color:TOKENS.s500, marginBottom:18 }}>{editModal.periodLabel}</div>
            <div style={{ display:'grid', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Basic salary</label>
                  <input type="number" value={editModal._basic} onChange={e=>setEditModal(p=>({...p,_basic:e.target.value}))} className="fi"/>
                </div>
                <div>
                  <label className="fl">Currency</label>
                  <select value={editModal.currency} onChange={e=>setEditModal(p=>({...p,currency:e.target.value}))} className="fsel">
                    {['KES','USD','GBP'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="fl">Deductions</label>
                {(editModal._deds||[]).map((d,i)=>(
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8, marginBottom:6 }}>
                    <input value={d.label} onChange={e=>{ const ds=[...editModal._deds]; ds[i]={...ds[i],label:e.target.value}; setEditModal(p=>({...p,_deds:ds})) }} className="fi" placeholder="Label"/>
                    <input type="number" value={d.amount} onChange={e=>{ const ds=[...editModal._deds]; ds[i]={...ds[i],amount:e.target.value}; setEditModal(p=>({...p,_deds:ds})) }} className="fi" placeholder="Amount"/>
                    <button onClick={()=>setEditModal(p=>({...p,_deds:p._deds.filter((_,j)=>j!==i)}))} style={{ padding:'0 10px', borderRadius:6, border:'1px solid #FCA5A5', background:'#fff', color:'#991B1B', cursor:'pointer', fontSize:16 }}>×</button>
                  </div>
                ))}
                <button onClick={()=>setEditModal(p=>({...p,_deds:[...(p._deds||[]),{label:'',amount:''}]}))} style={{ fontSize:12, color:TOKENS.crimson, background:'transparent', border:'1px solid '+TOKENS.line, padding:'5px 12px', borderRadius:6, cursor:'pointer', fontWeight:600 }}>+ Add deduction</button>
              </div>
              <div>
                <label className="fl">Payment method</label>
                <select value={editModal.paymentMethod} onChange={e=>setEditModal(p=>({...p,paymentMethod:e.target.value}))} className="fsel">
                  {['Bank transfer','M-Pesa','Cash','Cheque','Other'].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={saveEdit} disabled={saving} style={{ flex:1, background:saving?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>{saving?'Saving...':'Save changes'}</button>
              <button onClick={()=>setEditModal(null)} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mark paid modal ── */}
      {payModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setPayModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:440, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:4 }}>Mark as paid — {payModal.teacherName}</div>
            <div style={{ fontSize:12, color:TOKENS.s500, marginBottom:6 }}>{payModal.periodLabel}</div>
            <div style={{ fontSize:22, fontWeight:800, color:TOKENS.accentEmerald, marginBottom:20 }}>Net pay: {money(payModal.netPay, payModal.currency||'KES')}</div>
            <div style={{ display:'grid', gap:12 }}>
              <div>
                <label className="fl">Payment date</label>
                <input type="date" value={payForm.paymentDate} onChange={e=>setPayForm(p=>({...p,paymentDate:e.target.value}))} className="fi"/>
              </div>
              <div>
                <label className="fl">Payment method</label>
                <select value={payForm.paymentMethod} onChange={e=>setPayForm(p=>({...p,paymentMethod:e.target.value}))} className="fsel">
                  {['Bank transfer','M-Pesa','Cash','Cheque','Other'].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="fl">Payment reference</label>
                <input value={payForm.paymentRef} onChange={e=>setPayForm(p=>({...p,paymentRef:e.target.value}))} className="fi" placeholder="Transaction ID, cheque no., etc."/>
              </div>
              <div>
                <label className="fl">Note (optional)</label>
                <input value={payForm.paymentNote} onChange={e=>setPayForm(p=>({...p,paymentNote:e.target.value}))} className="fi" placeholder="Optional note"/>
              </div>
            </div>
            <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'10px 14px', marginTop:14, fontSize:12, color:'#065F46' }}>
              A payslip will be emailed to {payModal.teacherEmail} automatically.
            </div>
            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button onClick={markPaid} disabled={saving} style={{ flex:1, background:saving?TOKENS.s300:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>{saving?'Processing...':'Confirm payment & send payslip'}</button>
              <button onClick={()=>setPayModal(null)} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PayrollModule
