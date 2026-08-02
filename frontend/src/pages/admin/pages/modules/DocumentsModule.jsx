import React, { useState } from 'react'
import { useAuth, api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'

function DocumentsModule({ toast }) {
  const [docType, setDocType] = useState(null)

  if (docType === 'invoice') {
    return <InvoiceGenerator toast={toast} onBack={() => setDocType(null)} />
  }
  if (docType === 'receipt') {
    return <ReceiptGenerator toast={toast} onBack={() => setDocType(null)} />
  }

  const card = {
    background: '#fff', border: '1px solid ' + TOKENS.line, borderRadius: 14,
    padding: 22, cursor: 'pointer', transition: 'all .18s',
  }
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: TOKENS.s900, margin: 0 }}>
          Documents
        </h1>
        <div style={{ fontSize: 13, color: TOKENS.s500, marginTop: 2 }}>
          Generate branded financial documents.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        <div style={card} onClick={() => setDocType('invoice')}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: 'rgba(125,16,37,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TOKENS.crimson} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: TOKENS.s900 }}>Invoice</div>
          <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 4, lineHeight: 1.5 }}>
            A branded invoice — billed-to details, line items, auto-calculated totals and payment instructions.
          </div>
        </div>
        <div style={card} onClick={() => setDocType('receipt')}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: 'rgba(125,16,37,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TOKENS.crimson} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: TOKENS.s900 }}>Receipt</div>
          <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 4, lineHeight: 1.5 }}>
            An official payment receipt — amount, reference, payment method and authorisation.
          </div>
        </div>
      </div>
    </div>
  )
}

export function InvoiceGenerator({ toast, onBack }) {
  const today = new Date().toISOString().split('T')[0]
  const auth  = useAuth()

  const [f, setF] = useState({
    billedToName:'', billedToAddress:'', billedToEmail:'',
    studentName:'', studentGrade:'', subject:'', programmeLabel:'',
    invoiceNo:'', issueDate:today, dueDate:'',
    currency:'USD',
    items:[{ description:'', sessions:'', duration:'1 hr', ratePerHr:'15', amount:'' }],
    discount:'', vatPct:'0',
    paymentNote:'', notes:'',
    sendEmail:true,
  })
  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(null)  // saved invoice doc

  const set = (k,v) => setF(p => ({...p,[k]:v}))
  const itemSet = (i,k,v) => setF(p => ({...p, items:p.items.map((r,idx)=>idx===i?{...r,[k]:v}:r)}))
  const itemAdd = () => setF(p => ({...p, items:[...p.items,{description:'',sessions:'',duration:'1 hr',ratePerHr:'15',amount:''}]}))
  const itemDel = i  => setF(p => { const n=p.items.filter((_,idx)=>idx!==i); return{...p,items:n.length?n:[{description:'',sessions:'',duration:'1 hr',ratePerHr:'15',amount:''}]} })

  const subtotal = f.items.reduce((s,it)=>s+(parseFloat(it.amount)||0),0)
  const discount = parseFloat(f.discount)||0
  const vatPct   = parseFloat(f.vatPct)||0
  const vatAmount = (subtotal-discount)*(vatPct/100)
  const totalDue  = subtotal-discount+vatAmount
  const money = n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})

  // Auto-calc amount when sessions+rate change
  const calcAmount = (i, sessions, rate) => {
    const s = parseInt(String(sessions||'').match(/\d+/)?.[0]||'0')
    const r = parseFloat(rate)||0
    if (s && r) itemSet(i,'amount',String(s*r))
  }

  const generate = () => {
    if (!f.billedToName.trim()) { toast?.error?.('Billed-to name is required.'); return }
    const html = buildInvoiceHTML(f, { subtotal, discount, vatAmount, vatPct, totalDue })
    const w = window.open('','_blank')
    if (!w) { toast?.error?.('Please allow pop-ups to preview the invoice.'); return }
    w.document.write(html); w.document.close()
  }

  const saveAndSend = async () => {
    if (!f.billedToName.trim()) { toast?.error?.('Billed-to name is required.'); return }
    if (!f.items.some(it=>it.description?.trim())) { toast?.error?.('Add at least one line item.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/invoices', {
        ...f, lineItems: f.items, discount, vatPct, sendEmail: f.sendEmail,
      })
      if (data.success) {
        setSaved(data.data.invoice)
        toast?.ok?.('Invoice saved' + (f.sendEmail && f.billedToEmail ? ' and emailed to ' + f.billedToEmail : '') + '.')
      } else {
        toast?.error?.(data.message || 'Could not save invoice.')
      }
    } catch(e) {
      toast?.error?.(e?.response?.data?.message || 'Could not save invoice.')
    } finally { setSaving(false) }
  }

  const lbl = { display:'block', fontSize:11, fontWeight:700, letterSpacing:'.04em', textTransform:'uppercase', color:TOKENS.crimson, marginBottom:5 }
  const inp = { width:'100%', boxSizing:'border-box', padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }
  const card = { background:'#fff', border:'1px solid '+TOKENS.line, borderRadius:12, padding:18, marginBottom:14 }

  if (saved) return (
    <div style={card}>
      <div style={{ fontSize:14, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>✅ Invoice saved</div>
      <div style={{ fontSize:13, color:TOKENS.s700, marginBottom:16, lineHeight:1.7 }}>
        <strong>{saved.invoiceNo}</strong> · {saved.currency} {money(saved.totalDue)} · {saved.billedToName}
        {saved.emailSentTo && <div style={{ fontSize:12, color:TOKENS.s500, marginTop:4 }}>Email sent to {saved.emailSentTo}</div>}
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={generate} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>
          Preview & Download PDF
        </button>
        <button onClick={() => { setSaved(null) }} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s700, padding:'9px 16px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>
          New invoice
        </button>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:TOKENS.s500, padding:'9px 0', fontSize:12.5, cursor:'pointer' }}>← Back</button>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, display:'flex', alignItems:'center', gap:5, padding:0 }}>← All invoices</button>
        <div style={{ flex:1 }}/>
        <button onClick={generate} style={{ background:'transparent', border:'1.5px solid '+TOKENS.crimson, color:TOKENS.crimson, padding:'8px 16px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>Preview PDF</button>
        <button onClick={saveAndSend} disabled={saving} style={{ background:saving?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
          {saving ? 'Saving...' : 'Save & send'}
        </button>
      </div>

      {/* Header */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:14 }}>Invoice details</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
          <div><label style={lbl}>Invoice no.</label><input value={f.invoiceNo} onChange={e=>set('invoiceNo',e.target.value)} placeholder="Auto-generated" style={inp}/></div>
          <div><label style={lbl}>Issue date</label><input type="date" value={f.issueDate} onChange={e=>set('issueDate',e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Due date</label><input type="date" value={f.dueDate} onChange={e=>set('dueDate',e.target.value)} style={inp}/></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div><label style={lbl}>Currency</label>
            <select value={f.currency} onChange={e=>set('currency',e.target.value)} style={inp}>
              {['USD','KES','GBP','EUR','AED'].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Programme label</label><input value={f.programmeLabel} onChange={e=>set('programmeLabel',e.target.value)} placeholder="e.g. HOME TUITION PROGRAMME · 13 July – 21 August 2026" style={inp}/></div>
        </div>
      </div>

      {/* Bill To + Student */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <div style={card}>
          <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Bill to</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div><label style={lbl}>Full name *</label><input value={f.billedToName} onChange={e=>set('billedToName',e.target.value)} placeholder="e.g. Lola Coker" style={inp}/></div>
            <div><label style={lbl}>Address</label><input value={f.billedToAddress} onChange={e=>set('billedToAddress',e.target.value)} placeholder="e.g. Lavington, Nairobi, Kenya" style={inp}/></div>
            <div><label style={lbl}>Email</label><input type="email" value={f.billedToEmail} onChange={e=>set('billedToEmail',e.target.value)} placeholder="parent@email.com" style={inp}/></div>
          </div>
        </div>
        <div style={card}>
          <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Student</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div><label style={lbl}>Student name</label><input value={f.studentName} onChange={e=>set('studentName',e.target.value)} placeholder="e.g. Fikayomi Adewakun" style={inp}/></div>
            <div><label style={lbl}>Grade</label><input value={f.studentGrade} onChange={e=>set('studentGrade',e.target.value)} placeholder="e.g. Grade 4" style={inp}/></div>
            <div><label style={lbl}>Subject</label><input value={f.subject} onChange={e=>set('subject',e.target.value)} placeholder="e.g. English (Literacy — Writing & Spelling)" style={inp}/></div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Line items</div>
        <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:10 }}>
          <thead>
            <tr style={{ background:TOKENS.cream }}>
              {['Description','Sessions','Duration','Rate / hr',f.currency+' Amount',''].map((h,i)=>(
                <th key={i} style={{ padding:'8px 10px', textAlign:i>=3?'right':'left', fontSize:11, fontWeight:700, color:TOKENS.s700, letterSpacing:'.04em', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {f.items.map((it,i)=>(
              <tr key={i} style={{ borderTop:'1px solid '+TOKENS.line }}>
                <td style={{ padding:'8px 10px', width:'36%' }}>
                  <input value={it.description} onChange={e=>itemSet(i,'description',e.target.value)} placeholder="e.g. Week 1 — 13 to 17 July" style={{...inp,padding:'6px 8px'}}/>
                </td>
                <td style={{ padding:'8px 10px', width:'14%' }}>
                  <input value={it.sessions} onChange={e=>{ itemSet(i,'sessions',e.target.value); calcAmount(i,e.target.value,it.ratePerHr) }} placeholder="3 sessions" style={{...inp,padding:'6px 8px'}}/>
                </td>
                <td style={{ padding:'8px 10px', width:'10%' }}>
                  <input value={it.duration} onChange={e=>itemSet(i,'duration',e.target.value)} placeholder="1 hr" style={{...inp,padding:'6px 8px'}}/>
                </td>
                <td style={{ padding:'8px 10px', width:'12%' }}>
                  <input type="number" value={it.ratePerHr} onChange={e=>{ itemSet(i,'ratePerHr',e.target.value); calcAmount(i,it.sessions,e.target.value) }} placeholder="15" style={{...inp,padding:'6px 8px',textAlign:'right'}}/>
                </td>
                <td style={{ padding:'8px 10px', width:'14%' }}>
                  <input type="number" value={it.amount} onChange={e=>itemSet(i,'amount',e.target.value)} placeholder="45" style={{...inp,padding:'6px 8px',textAlign:'right'}}/>
                </td>
                <td style={{ padding:'8px 6px', textAlign:'center' }}>
                  <button onClick={()=>itemDel(i)} style={{ background:'transparent', border:'none', color:'#B91C1C', cursor:'pointer', fontSize:16, lineHeight:1 }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={itemAdd} style={{ background:'transparent', border:'1.5px dashed '+TOKENS.gold, color:'#9A7B16', borderRadius:7, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add line</button>

        {/* Totals */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
          <div style={{ width:280 }}>
            {[
              ['Subtotal ('+f.items.reduce((s,it)=>{ const n=parseInt(String(it.sessions).match(/\d+/)?.[0]||'0'); return s+n },0)+' hours)', money(subtotal)],
              ['Discount', discount>0?money(discount):'—'],
            ].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:12.5, color:TOKENS.s700 }}>
                <span>{k}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:TOKENS.crimson, borderRadius:8, marginTop:6 }}>
              <span style={{ color:'#fff', fontWeight:800, fontSize:13 }}>TOTAL DUE ({f.currency})</span>
              <span style={{ color:'#fff', fontWeight:800, fontSize:15 }}>{money(totalDue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Email option */}
      <div style={card}>
        <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:13 }}>
          <input type="checkbox" checked={f.sendEmail} onChange={e=>set('sendEmail',e.target.checked)} style={{ width:16, height:16, accentColor:TOKENS.crimson }}/>
          <span>Auto-email invoice to <strong>{f.billedToEmail || 'parent email above'}</strong> when saved</span>
        </label>
      </div>
    </div>
  )
}

function ReceiptGenerator({ toast, onBack }) {
  const now = new Date()
  const today = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeNow = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

  const [f, setF] = useState({
    currency: 'KES',
    amount: '',
    receivedBy: 'Smartious Edtech',
    mpesaAccount: '745021',
    referenceNo: '',
    paymentMethod: 'M-Pesa Paybill — 247247',
    dateTime: today + ' | ' + timeNow + ' hrs',
    status: 'Confirmed',
    paidFor: '',
    authName: '',
    authRole: 'Principal, Smartious Homeschool Global',
    paidDate: today,
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const generate = () => {
    if (!f.amount || !(parseFloat(f.amount) > 0)) { toast?.error?.('A valid amount is required.'); return }
    if (!f.referenceNo.trim()) { toast?.error?.('Reference number is required.'); return }
    if (!f.authName.trim())    { toast?.error?.('Authoriser name is required.'); return }
    const html = buildReceiptHTML(f)
    const w = window.open('', '_blank')
    if (!w) { toast?.error?.('Please allow pop-ups to generate the receipt.'); return }
    w.document.write(html); w.document.close()
  }

  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
    textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 5 }
  const inp = { width: '100%', boxSizing: 'border-box', padding: '8px 11px',
    borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit' }
  const card = { background: '#fff', border: '1px solid ' + TOKENS.line, borderRadius: 12,
    padding: 18, marginBottom: 14 }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={onBack} style={{
          background: '#fff', border: '1.5px solid ' + TOKENS.line, borderRadius: 8,
          padding: '7px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: TOKENS.crimson,
        }}>← Documents</button>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: TOKENS.s900, margin: 0 }}>Official Receipt</h1>
          <div style={{ fontSize: 12, color: TOKENS.s500 }}>Confirm a payment received, then generate the branded PDF.</div>
        </div>
      </div>

      {/* Amount + payment details */}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div><label style={lbl}>Currency</label>
            <select value={f.currency} onChange={e => set('currency', e.target.value)} style={inp}>
              <option value="KES">KES</option><option value="USD">USD</option>
            </select></div>
          <div><label style={lbl}>Amount Paid *</label>
            <input value={f.amount} onChange={e => set('amount', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="e.g. 158200" style={inp}/></div>
          <div><label style={lbl}>Reference No. *</label>
            <input value={f.referenceNo} onChange={e => set('referenceNo', e.target.value)}
              placeholder="e.g. UE5S8BDTRX" style={inp}/></div>
          <div><label style={lbl}>Received By</label>
            <input value={f.receivedBy} onChange={e => set('receivedBy', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>M-Pesa Account</label>
            <input value={f.mpesaAccount} onChange={e => set('mpesaAccount', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Payment Method</label>
            <input value={f.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Date &amp; Time</label>
            <input value={f.dateTime} onChange={e => set('dateTime', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Status</label>
            <select value={f.status} onChange={e => set('status', e.target.value)} style={inp}>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cleared">Cleared</option>
            </select></div>
        </div>
        <div style={{ marginTop: 12 }}><label style={lbl}>Payment For (optional)</label>
          <input value={f.paidFor} onChange={e => set('paidFor', e.target.value)}
            placeholder="e.g. A-Level Mathematics Tuition — May 2026" style={inp}/></div>
      </div>

      {/* Authorisation */}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div><label style={lbl}>Authorised By (Name) *</label>
            <input value={f.authName} onChange={e => set('authName', e.target.value)}
              placeholder="e.g. Alfred Ouko" style={inp}/></div>
          <div><label style={lbl}>Role / Title</label>
            <input value={f.authRole} onChange={e => set('authRole', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Paid Date (stamp)</label>
            <input value={f.paidDate} onChange={e => set('paidDate', e.target.value)} style={inp}/></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 30 }}>
        <button onClick={generate} style={{
          background: TOKENS.crimson, color: '#fff', border: 'none', borderRadius: 8,
          padding: '12px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>Generate Receipt</button>
      </div>
    </div>
  )
}

function buildReceiptHTML(f) {
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const cur = esc(f.currency || 'KES')
  const amt = Number(parseFloat(f.amount) || 0)
    .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Receipt ${esc(f.referenceNo)} — Smartious</title>
<style>
  :root{--crimson:#7D1025;--crimsonD:#5A0B1B;--gold:#C9A030;--ink:#1A1A1A;--mute:#6B6B6B;--line:#E8E2D6;--cream:#FBFAF5;--green:#15803D;}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#e9e6df;color:var(--ink)}
  .page{width:210mm;min-height:297mm;background:#fff;margin:18px auto;position:relative;display:flex;flex-direction:column;box-shadow:0 4px 24px rgba(0,0,0,.13)}
  .page-body{padding:0 22mm;flex:1}
  .topbar{height:8mm;background:linear-gradient(90deg,var(--crimsonD),var(--crimson))}
  .hd{display:flex;justify-content:space-between;align-items:flex-start;padding:11mm 22mm 0}
  .brand{display:flex;align-items:center;gap:10px}
  .shield{width:50px;height:55px;flex-shrink:0}
  .brand-tx .name{font-size:22px;font-weight:800;letter-spacing:-.5px;line-height:1}
  .brand-tx .name em{font-style:italic;color:var(--crimson)}
  .brand-tx .tag{font-size:7px;letter-spacing:3px;color:var(--mute);margin-top:3px;font-weight:600}
  .hd-r{text-align:right}
  .doc-title{font-size:26px;font-weight:800;letter-spacing:.5px;color:var(--ink);line-height:1}
  .doc-sub{font-size:9px;color:var(--mute);margin-top:4px;letter-spacing:.5px}
  .gold-rule{height:2px;background:var(--gold);margin:9mm 22mm 0}
  .badge-wrap{text-align:center;margin-top:9mm}
  .badge{display:inline-block;background:var(--green);color:#fff;font-size:11px;font-weight:800;letter-spacing:.6px;padding:8px 20px;border-radius:6px}
  .amount-box{background:var(--cream);border:1px solid var(--line);border-radius:10px;text-align:center;padding:18px;margin-top:6mm}
  .amount-lbl{font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--mute);text-transform:uppercase}
  .amount-val{font-size:34px;font-weight:800;color:var(--crimson);margin-top:4px;letter-spacing:-.5px}
  .amount-for{font-size:10px;color:var(--mute);margin-top:6px}
  .details{margin:7mm 0 0;border-collapse:collapse;width:100%}
  .details tr td{padding:9px 13px;font-size:11px}
  .details .k{background:var(--crimson);color:#fff;font-weight:700;width:34%;font-size:10px;letter-spacing:.3px}
  .details .v{border:1px solid var(--line);color:var(--ink)}
  .details tr:nth-child(even) .v{background:var(--cream)}
  .details .v.accent{color:var(--crimson);font-weight:700}
  .details .v.green{color:var(--green);font-weight:700}
  .auth-row{display:flex;justify-content:space-between;align-items:flex-end;margin-top:11mm;gap:24px}
  .auth-by{flex:1}
  .auth-lbl{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--mute);text-transform:uppercase;margin-bottom:14px}
  .sig{font-family:'Brush Script MT','Segoe Script','Snell Roundhand',cursive;font-size:26px;color:var(--ink);line-height:1;margin-bottom:3px;padding-left:6px}
  .sig-line{border-bottom:1px solid var(--ink);width:62mm}
  .auth-name{font-size:11px;font-weight:800;color:var(--ink);margin-top:5px}
  .auth-role{font-size:9.5px;color:var(--mute)}
  .paid-stamp{border:1.5px solid var(--line);border-radius:7px;padding:11px 18px;text-align:center;min-width:50mm}
  .paid-stamp .org{font-size:8.5px;font-weight:800;color:var(--ink);letter-spacing:.4px}
  .paid-stamp .addr{font-size:7.5px;color:var(--mute);margin-top:2px}
  .paid-stamp .paid{font-size:15px;font-weight:800;color:var(--green);letter-spacing:1px;margin-top:6px}
  .paid-stamp .pdate{font-size:8px;color:var(--mute);margin-top:1px}
  .note{margin-top:9mm;background:var(--cream);border:1px solid var(--line);border-radius:6px;padding:10px 14px;text-align:center;font-size:9.5px;font-style:italic;color:var(--mute)}
  .ft{margin-top:auto;border-top:1px solid var(--line);padding:5mm 22mm;text-align:center;font-size:8.5px;color:var(--mute);line-height:1.6}
  .ft b{color:var(--crimson);font-size:9.5px;letter-spacing:.5px}
  .toolbar{position:fixed;top:0;left:0;right:0;background:#7D1025;color:#fff;padding:10px 20px;display:flex;justify-content:space-between;align-items:center;z-index:99}
  .toolbar button{background:#fff;color:#7D1025;border:none;padding:8px 18px;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer}
  .toolbar .hint{font-size:12px;opacity:.85}
  @media print{
    body{background:#fff}.toolbar{display:none}
    .page{margin:0;box-shadow:none;width:100%;min-height:auto}
    @page{size:A4;margin:0}
  }
</style></head><body>
<div class="toolbar">
  <span class="hint">Review the receipt, then download. Use "Save as PDF" as the destination.</span>
  <button onclick="window.print()">Download PDF</button>
</div>
<div style="height:48px"></div>

<div class="page">
  <div class="topbar"></div>
  <div class="hd">
    <div class="brand">
      <svg class="shield" viewBox="0 0 60 66">
        <path d="M30 2 L56 9 V32 C56 47 44 58 30 63 C16 58 4 47 4 32 V9 Z" fill="#8A1228" stroke="#C9A030" stroke-width="2"/>
        <path d="M30 13 l2.3 4.7 5.2 .75 -3.75 3.65 .9 5.15 -4.65 -2.45 -4.65 2.45 .9 -5.15 -3.75 -3.65 5.2 -.75 Z" fill="#C9A030"/>
        <g transform="translate(30 40)">
          <path d="M0 -6 C-4 -9 -11 -9 -14 -7 L-14 9 C-11 7 -4 7 0 10 Z" fill="#FFFFFF" stroke="#E3D9C4" stroke-width="0.6"/>
          <path d="M0 -6 C4 -9 11 -9 14 -7 L14 9 C11 7 4 7 0 10 Z" fill="#FFFFFF" stroke="#E3D9C4" stroke-width="0.6"/>
          <line x1="-10" y1="-3.5" x2="-3.5" y2="-2" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="-10" y1="0" x2="-3.5" y2="1.5" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="-10" y1="3.5" x2="-3.5" y2="5" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="3.5" y1="-2" x2="10" y2="-3.5" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="3.5" y1="1.5" x2="10" y2="0" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="3.5" y1="5" x2="10" y2="3.5" stroke="#E7B7C0" stroke-width="0.8"/>
        </g>
      </svg>
      <div class="brand-tx"><div class="name">Smart<em>ious</em></div>
        <div class="tag">HOMESCHOOL&nbsp;·&nbsp;GLOBAL</div></div>
    </div>
    <div class="hd-r"><div class="doc-title">OFFICIAL RECEIPT</div>
      <div class="doc-sub">Payment Confirmation</div></div>
  </div>
  <div class="gold-rule"></div>

  <div class="page-body">
    <div class="badge-wrap"><span class="badge">&#10003;&nbsp;&nbsp;PAYMENT RECEIVED</span></div>

    <div class="amount-box">
      <div class="amount-lbl">Amount Paid</div>
      <div class="amount-val">${cur} ${amt}</div>
      ${f.paidFor ? `<div class="amount-for">${esc(f.paidFor)}</div>` : ''}
    </div>

    <table class="details">
      <tr><td class="k">Received By</td><td class="v">${esc(f.receivedBy)}</td></tr>
      <tr><td class="k">M-Pesa Account</td><td class="v">${esc(f.mpesaAccount)}</td></tr>
      <tr><td class="k">Reference No.</td><td class="v accent">${esc(f.referenceNo)}</td></tr>
      <tr><td class="k">Payment Method</td><td class="v">${esc(f.paymentMethod)}</td></tr>
      <tr><td class="k">Date &amp; Time</td><td class="v">${esc(f.dateTime)}</td></tr>
      <tr><td class="k">Amount</td><td class="v accent">${cur} ${amt}</td></tr>
      <tr><td class="k">Status</td><td class="v green">${esc(f.status)}</td></tr>
    </table>

    <div class="auth-row">
      <div class="auth-by">
        <div class="auth-lbl">Authorised By</div>
        <div class="sig">${esc(f.authName)}</div>
        <div class="sig-line"></div>
        <div class="auth-name">${esc(f.authName)}</div>
        <div class="auth-role">${esc(f.authRole)}</div>
      </div>
      <div class="paid-stamp">
        <div class="org">SMARTIOUS HOMESCHOOL GLOBAL</div>
        <div class="addr">Diamond Plaza I, Parklands</div>
        <div class="addr">Nairobi, Kenya</div>
        <div class="paid">PAID</div>
        <div class="pdate">${esc(f.paidDate)}</div>
      </div>
    </div>

    <div class="note">
      This is an official computer-generated receipt and is valid without a wet signature. Please retain for your records.
    </div>
  </div>

  <div class="ft">
    <b>Smartious Homeschool Global</b><br>
    Diamond Plaza I, Parklands, Nairobi, Kenya<br>
    +254 745 021 212 &nbsp;|&nbsp; hellosmartious@gmail.com &nbsp;|&nbsp; smartioushomeschool.com
  </div>
</div>
</body></html>`
}


export function buildInvoiceHTML(f, t) {
  const esc   = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const money = n => Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  const cur   = esc(f.currency||'USD')
  const isUSD = (f.currency||'USD') !== 'KES'
  const items = (f.items||[]).filter(it=>(it.description||'').trim())
  const totalHours = items.reduce((s,it)=>{const n=parseInt(String(it.sessions||'').match(/\d+/)?.[0]||'0');return s+n},0)

  const itemRows = items.map(it=>`<tr>
    <td class="desc">${esc(it.description).replace(/\n/g,'<br>')}</td>
    <td class="c">${esc(it.sessions)}</td>
    <td class="c">${esc(it.duration)}</td>
    <td class="r">${it.ratePerHr?'$'+money(parseFloat(it.ratePerHr)||0):''}</td>
    <td class="r">$${money(parseFloat(it.amount)||0)}</td>
  </tr>`).join('')

  const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) } catch { return String(d||'') } }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Invoice ${esc(f.invoiceNo)} — Smartious</title>
<style>
  :root{--cr:#7D1025;--crD:#5A0B1B;--gold:#C9A030;--ink:#1A1A1A;--mute:#6B6B6B;--line:#E8E2D6;--cream:#FBFAF5;}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#ddd;color:var(--ink)}
  .page{width:210mm;min-height:297mm;background:#fff;margin:60px auto 20px;position:relative;display:flex;flex-direction:column;box-shadow:0 4px 24px rgba(0,0,0,.15);page-break-after:always}
  .page-body{padding:0 20mm;flex:1}
  .topbar{height:6mm;background:linear-gradient(90deg,var(--crD),var(--cr))}
  .hd{display:flex;justify-content:space-between;align-items:flex-start;padding:10mm 20mm 0}
  .brand{display:flex;align-items:center;gap:10px}
  .shield{width:46px;height:52px;flex-shrink:0}
  .brand-tx .name{font-size:22px;font-weight:800;letter-spacing:-.5px;line-height:1}
  .brand-tx .name em{font-style:italic;color:var(--cr)}
  .brand-tx .sub{font-size:7px;letter-spacing:3px;color:var(--mute);margin-top:3px;font-weight:600}
  .hd-r{text-align:right}
  .doc-eyebrow{font-size:9px;letter-spacing:2px;color:var(--mute);text-transform:uppercase;margin-bottom:4px}
  .doc-title{font-size:36px;font-weight:800;color:var(--cr);line-height:1}
  .doc-rule{height:2.5px;background:var(--gold);margin-top:5px}
  .inv-meta{margin-top:5mm;display:flex;justify-content:flex-end}
  .inv-tbl{font-size:10.5px;min-width:68mm}
  .inv-tbl tr td{padding:3px 0}
  .inv-tbl td:first-child{color:var(--mute);padding-right:20px;font-weight:600;text-transform:uppercase;font-size:9px;letter-spacing:.5px}
  .inv-tbl td:last-child{font-weight:700;color:var(--ink);text-align:right}
  .bill-row{display:flex;justify-content:space-between;margin-top:7mm;gap:20px;padding-bottom:6mm;border-bottom:1px solid var(--line)}
  .bill-lbl{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--gold);text-transform:uppercase;margin-bottom:5px}
  .bill-name{font-size:17px;font-weight:800;color:var(--ink)}
  .bill-sub{font-size:11px;color:var(--mute);margin-top:2px}
  .prog-banner{background:#FBFAF5;border-left:3px solid var(--gold);padding:8px 14px;margin:6mm 0;font-size:11px;font-weight:700;color:var(--ink);letter-spacing:.3px}
  .prog-banner em{color:var(--gold);font-style:normal}
  .items{border-collapse:collapse;width:100%;margin-top:2mm}
  .items thead td{background:var(--cr);color:#fff;font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:8px 11px}
  .items thead td.r{text-align:right}.items thead td.c{text-align:center}
  .items tbody tr:nth-child(even){background:#FAFAFA}
  .items tbody td{border-bottom:1px solid var(--line);padding:9px 11px;font-size:11px;vertical-align:top}
  .items tbody td.r{text-align:right}.items tbody td.c{text-align:center}
  .desc{font-weight:600}
  .totals{margin-top:5mm;display:flex;justify-content:flex-end}
  .totals-box{width:76mm}
  .tr{display:flex;justify-content:space-between;padding:5px 11px;font-size:11px}
  .tr .tk{color:var(--mute)}.tr .tv{font-weight:600}
  .tr.total{background:var(--cr);color:#fff;padding:10px 11px;margin-top:4px;border-radius:3px}
  .tr.total .tk,.tr.total .tv{color:#fff;font-weight:800;font-size:13px}
  .note-italic{font-size:9.5px;font-style:italic;color:var(--mute);margin-top:5mm;line-height:1.6}
  .ft{margin-top:auto;border-top:1px solid var(--line);padding:4mm 20mm;display:flex;justify-content:space-between;align-items:center;font-size:8.5px;color:var(--mute)}
  /* Page 2 */
  .p2-sec-h{font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--gold);text-transform:uppercase;margin:7mm 0 4mm}
  .p2-title{font-size:22px;font-weight:300;color:var(--ink);margin-bottom:6mm}
  .p2-title em{font-style:italic;color:var(--cr)}
  .pay-tbl{border-collapse:collapse;width:100%;margin-bottom:7mm}
  .pay-tbl th{background:var(--cr);color:#fff;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:9px 12px;text-align:left}
  .pay-tbl td{border:1px solid var(--line);padding:9px 12px;font-size:11px;vertical-align:top}
  .pay-tbl tr:nth-child(even) td{background:#FAFAFA}
  .pay-tbl td:first-child{font-weight:700;color:var(--ink)}
  .bank-h{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--gold);text-transform:uppercase;margin-bottom:4mm}
  .bank-tbl{border-collapse:collapse;width:100%}
  .bank-tbl td{border:1px solid var(--line);padding:8px 12px;font-size:11px;vertical-align:top}
  .bank-tbl td:first-child{background:#FAFAFA;font-weight:700;color:var(--cr);width:38%}
  .closing{font-size:11px;color:var(--ink);line-height:1.7;margin-top:7mm}
  .closing .ref-note{font-style:italic;color:var(--mute);font-size:10px;margin-bottom:5mm}
  .toolbar{position:fixed;top:0;left:0;right:0;background:#7D1025;color:#fff;padding:10px 24px;display:flex;justify-content:space-between;align-items:center;z-index:99;box-shadow:0 2px 8px rgba(0,0,0,.3)}
  .toolbar .hint{font-size:12px;opacity:.8}
  .toolbar button{background:#C9A030;color:#7D1025;border:none;padding:9px 22px;border-radius:6px;font-weight:800;font-size:13px;cursor:pointer}
  @media print{body{background:#fff}.toolbar{display:none}.page{margin:0;box-shadow:none;width:100%}@page{size:A4;margin:0}}
<' + '/style><' + '/head><body>

<div class="toolbar">
  <span class="hint">Review then click Download PDF — set destination to "Save as PDF" in the print dialog.</span>
  <button onclick="window.print()">⬇ Download PDF</button>
</div>

<!-- PAGE 1 -->
<div class="page">
  <div class="topbar"></div>
  <div class="hd">
    <div class="brand">
      <svg class="shield" viewBox="0 0 60 66">
        <path d="M30 2 L56 9 V32 C56 47 44 58 30 63 C16 58 4 47 4 32 V9 Z" fill="#8A1228" stroke="#C9A030" stroke-width="1.5"/>
        <path d="M30 13 l2.3 4.7 5.2 .75 -3.75 3.65 .9 5.15 -4.65 -2.45 -4.65 2.45 .9 -5.15 -3.75 -3.65 5.2 -.75 Z" fill="#C9A030"/>
        <g transform="translate(30 42)">
          <path d="M0 -7 C-4 -10 -11 -10 -14 -8 L-14 9 C-11 7 -4 7 0 10 Z" fill="#fff" stroke="#E3D9C4" stroke-width="0.5"/>
          <path d="M0 -7 C4 -10 11 -10 14 -8 L14 9 C11 7 4 7 0 10 Z" fill="#fff" stroke="#E3D9C4" stroke-width="0.5"/>
        </g>
      </svg>
      <div class="brand-tx">
        <div class="name">Smart<em>ious</em></div>
        <div class="sub">HOMESCHOOL&nbsp;·&nbsp;GLOBAL</div>
        <div style="font-size:8px;color:var(--mute);margin-top:2px">EST. 2018</div>
      </div>
    </div>
    <div class="hd-r">
      <div class="doc-eyebrow">INVOICE</div>
      <div class="doc-title">INVOICE</div>
      <div class="doc-rule"></div>
      <div style="margin-top:8px">
        <table class="inv-tbl">
          <tr><td>Invoice No.</td><td>${esc(f.invoiceNo)}</td></tr>
          <tr><td>Issue Date</td><td>${esc(fmtDate(f.issueDate))}</td></tr>
          ${f.dueDate?`<tr><td>Due Date</td><td style="color:var(--cr)">${esc(fmtDate(f.dueDate))}</td></tr>`:''}
        </table>
      </div>
    </div>
  </div>

  <div class="page-body">
    <div style="font-size:9px;color:var(--mute);margin-top:4mm;margin-bottom:2mm">Smartious Homeschool Global · Diamond Plaza, 4th Avenue, Parklands, Nairobi · hellosmartious@gmail.com · +254 745 021 212</div>
    <div class="bill-row">
      <div>
        <div class="bill-lbl">Bill To</div>
        <div class="bill-name">${esc(f.billedToName)}</div>
        ${f.billedToAddress?`<div class="bill-sub">${esc(f.billedToAddress)}</div>`:''}
      </div>
      ${f.studentName?`<div>
        <div class="bill-lbl">Student</div>
        <div class="bill-name">${esc(f.studentName)}</div>
        <div class="bill-sub">${[f.studentGrade,f.subject].filter(Boolean).map(s=>`<span>${esc(s)}</span>`).join(' &nbsp;·&nbsp; ')}</div>
      </div>`:''}
    </div>

    ${f.programmeLabel?`<div class="prog-banner">${esc(f.programmeLabel)}</div>`:'<div style="margin-top:6mm"></div>'}

    <table class="items">
      <thead><tr>
        <td>Description</td>
        <td class="c">Sessions</td>
        <td class="c">Duration</td>
        <td class="r">Rate / hr</td>
        <td class="r">Amount</td>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="totals"><div class="totals-box">
      <div class="tr"><span class="tk">Subtotal${totalHours?' ('+totalHours+' hours)':''}</span><span class="tv">$${money(t.subtotal)}</span></div>
      <div class="tr"><span class="tk">Discount</span><span class="tv">${t.discount>0?'$'+money(t.discount):'—'}</span></div>
      <div class="tr total"><span class="tk">TOTAL DUE (${cur})</span><span class="tv">$${money(t.totalDue)}</span></div>
    </div></div>

    <p class="note-italic">Amount payable in ${cur}, or the KES equivalent at the prevailing exchange rate. No Smartious markup is applied to currency conversion.</p>
  </div>

  <div class="ft">
    <span>smartioushomeschool.com · hellosmartious@gmail.com · +254 745 021 212</span>
    <span>Page 1</span>
  </div>
</div>

<!-- PAGE 2: Payment methods -->
<div class="page">
  <div class="topbar"></div>
  <div class="hd" style="padding-bottom:0">
    <div class="brand">
      <svg class="shield" viewBox="0 0 60 66">
        <path d="M30 2 L56 9 V32 C56 47 44 58 30 63 C16 58 4 47 4 32 V9 Z" fill="#8A1228" stroke="#C9A030" stroke-width="1.5"/>
        <path d="M30 13 l2.3 4.7 5.2 .75 -3.75 3.65 .9 5.15 -4.65 -2.45 -4.65 2.45 .9 -5.15 -3.75 -3.65 5.2 -.75 Z" fill="#C9A030"/>
      </svg>
      <div class="brand-tx"><div class="name">Smart<em>ious</em></div><div class="sub">HOMESCHOOL&nbsp;·&nbsp;GLOBAL</div></div>
    </div>
    <div class="hd-r doc-eyebrow" style="align-self:flex-end">INVOICE</div>
  </div>

  <div class="page-body" style="padding-top:0">
    <div class="p2-sec-h">HOW TO PAY</div>
    <div class="p2-title">Payment <em>methods</em></div>

    <table class="pay-tbl">
      <thead><tr><th>Method</th><th>Via</th><th>Notes</th></tr></thead>
      <tbody>
        <tr>
          <td>M-Pesa</td>
          <td>Paybill 247247</td>
          <td>Account Number: 745021. Quote invoice number ${esc(f.invoiceNo)}.</td>
        </tr>
        <tr>
          <td>Bank Transfer / SWIFT</td>
          <td>Equity Bank Kenya</td>
          <td>See full beneficiary details below.</td>
        </tr>
      </tbody>
    </table>

    <div class="bank-h">BANK TRANSFER — FULL BENEFICIARY DETAILS</div>
    <table class="bank-tbl">
      <tr><td>Beneficiary Name</td><td>Smartious Edtech</td></tr>
      <tr><td>Bank Name</td><td>Equity Bank Kenya Limited</td></tr>
      <tr><td>Account Number</td><td>0910186607556</td></tr>
      <tr><td>Account Type</td><td>Savings Account</td></tr>
      <tr><td>Branch</td><td>Tea Room Branch, Nairobi, Kenya</td></tr>
      <tr><td>SWIFT / BIC Code</td><td>EQBLKENA (use EQBLKENAXXX if an 11-character code is required)</td></tr>
      <tr><td>Bank Head Office</td><td>Equity Bank Kenya Limited, Equity Centre, 9th Floor, Hospital Road, Upper Hill, P.O. Box 75104-00200, Nairobi, Kenya</td></tr>
      <tr><td>Central Bank</td><td>Central Bank of Kenya</td></tr>
    </table>

    <div class="closing">
      <p class="ref-note">Please share the payment confirmation (M-Pesa message or SWIFT copy) with hellosmartious@gmail.com, quoting invoice number ${esc(f.invoiceNo)}, so it can be matched and receipted promptly.</p>
      <p>Thank you for choosing Smartious Homeschool Global${f.studentName?' for '+esc(f.studentName)+"'s learning journey":''}.</p>
    </div>
  </div>

  <div class="ft">
    <span>smartioushomeschool.com · hellosmartious@gmail.com · +254 745 021 212</span>
    <span>Page 2</span>
  </div>
</div>

</body></html>`
}

export default DocumentsModule
