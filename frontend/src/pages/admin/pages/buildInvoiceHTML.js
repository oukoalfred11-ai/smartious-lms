// Auto-generated — do not edit JSX in this file.
// Called from Dashboard.jsx.

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
</style></head><body>

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

// ═══════════════════════════════════════════════════════════
// InvoicesTab — inside BillingModule
// Shows invoice list + stats + generator
// ═══════════════════════════════════════════════════════════
function InvoicesTab({ toast, refreshKey }) {
  const [view, setView]           = useState('list')  // list | create
  const [invoices, setInvoices]   = useState([])
  const [stats, setStats]         = useState({})
  const [loading, setLoading]     = useState(true)
  const [statusF, setStatusF]     = useState('all')
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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

  const markPaid = async (id) => {
    try {
      await api.patch('/invoices/'+id+'/status', { status:'paid', paidAmount:0 })
      toast?.ok?.('Marked as paid.')
      load()
    } catch { toast?.error?.('Could not update status.') }
  }

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

  return (
    <>
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
            <div style={{ fontSize:28, marginBottom:10 }}>🧾</div>
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
                    <div style={{ display:'flex', gap:6 }}>
                      {inv.status === 'sent' && (
                        <button onClick={() => markPaid(inv._id)} style={{ fontSize:11, background:'#D1FAE5', color:'#065F46', border:'none', padding:'4px 8px', borderRadius:5, cursor:'pointer', fontWeight:700 }}>Mark paid</button>
                      )}
                      {inv.billedToEmail && inv.status !== 'cancelled' && (
                        <button onClick={() => resend(inv)} style={{ fontSize:11, background:TOKENS.cream, color:TOKENS.crimson, border:'1px solid '+TOKENS.line, padding:'4px 8px', borderRadius:5, cursor:'pointer', fontWeight:700 }}>Resend</button>
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
    </>
  )
}
