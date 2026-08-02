import React, { useState, useEffect, useCallback } from 'react'
import { useAuth, api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { fmtDate } from '../shared/helpers.js'
import { PSection } from '../shared/ui.jsx'

function CRMModule({ toast, refreshKey }) {
  const [view, setView] = useState('list')   // list | detail | add
  const [selectedId, setSelectedId] = useState(null)
  return (
    <>
      <PSection tag="Sales" title="Inquiry" em="CRM" sub="Track every lead from first contact through to enrolment."/>
      {view === 'list'   && <CRMList   toast={toast} refreshKey={refreshKey} onOpen={id => { setSelectedId(id); setView('detail') }} onAdd={() => setView('add')}/>}
      {view === 'detail' && <CRMDetail toast={toast} id={selectedId} onBack={() => { setView('list'); setSelectedId(null) }}/>}
      {view === 'add'    && <CRMForm   toast={toast} onBack={() => setView('list')} onSaved={id => { setSelectedId(id); setView('detail') }}/>}
    </>
  )
}

const STATUS_META = {
  new:            { label:'New',              bg:'#EFF6FF', fg:'#1D4ED8' },
  contacted:      { label:'Contacted',        bg:'#FEF9C3', fg:'#854D0E' },
  interested:     { label:'Interested',       bg:'#FEF3C7', fg:'#92400E' },
  proposal_sent:  { label:'Proposal Sent',    bg:'#F3E8FF', fg:'#6B21A8' },
  assessment_req: { label:'Assessment Req.',  bg:'#DBEAFE', fg:'#1E40AF' },
  enrolled:       { label:'Enrolled ✓',       bg:'#D1FAE5', fg:'#065F46' },
  lost:           { label:'Lost',             bg:'#F3F4F6', fg:'#374151' },
  unqualified:    { label:'Unqualified',      bg:'#FEE2E2', fg:'#991B1B' },
}

const SOURCE_META = {
  whatsapp:'WhatsApp', phone:'Phone', email:'Email', website:'Website',
  instagram:'Instagram', facebook:'Facebook', linkedin:'LinkedIn',
  tiktok:'TikTok', referral:'Referral', walk_in:'Walk-in', other:'Other',
}

const PRIORITY_META = {
  high:   { label:'High',   color:'#DC2626' },
  medium: { label:'Medium', color:'#D97706' },
  low:    { label:'Low',    color:'#6B7280' },
}

const NOTE_TYPE_META = {
  call:'📞', whatsapp:'💬', email:'✉️', meeting:'🤝', other:'📝',
}

export const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.new
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:99, background:m.bg, color:m.fg, fontSize:11, fontWeight:700 }}>{m.label}</span>
}

function CRMList({ toast, refreshKey, onOpen, onAdd }) {
  const [inquiries, setInquiries] = useState([])
  const [counts, setCounts]       = useState({})
  const [loading, setLoading]     = useState(true)
  const [stats, setStats]         = useState({})
  const [statusF, setStatusF]     = useState('all')
  const [sourceF, setSourceF]     = useState('all')
  const [search, setSearch]       = useState('')
  const [overdue, setOverdue]     = useState(false)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 30 }
    if (statusF !== 'all') params.status = statusF
    if (sourceF !== 'all') params.source = sourceF
    if (search.trim()) params.search = search.trim()
    if (overdue) params.overdue = 'true'
    Promise.all([
      api.get('/inquiries', { params }),
      api.get('/inquiries/stats'),
    ]).then(([r, sr]) => {
      setInquiries(r.data?.data?.inquiries || [])
      setCounts(r.data?.data?.counts || {})
      setTotalPages(r.data?.data?.totalPages || 1)
      setStats(sr.data?.data || {})
    }).catch(() => toast?.error?.('Failed to load inquiries.'))
    .finally(() => setLoading(false))
  }, [statusF, sourceF, search, overdue, page])

  useEffect(() => { load() }, [load, refreshKey])
  useEffect(() => { setPage(1) }, [statusF, sourceF, search, overdue])

  const STATUS_TABS = [
    { id:'all', label:'All' },
    ...Object.entries(STATUS_META).map(([id, m]) => ({ id, label:m.label, count:counts[id] }))
  ]

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : '—'
  const isOverdueDate = d => d && new Date(d) < new Date()

  return (
    <>
      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:20 }}>
        {[
          { label:'Total Leads',   val:Object.values(counts).reduce((a,b)=>a+b,0) || 0, color:TOKENS.crimson },
          { label:'New This Month', val:stats.recent || 0, color:'#1D4ED8' },
          { label:'Overdue Callbacks', val:stats.overdueCount || stats.overdue || 0, color:'#DC2626' },
          { label:'Enrolled',      val:counts.enrolled || 0, color:'#065F46' },
          { label:'In Pipeline',   val:(counts.new||0)+(counts.contacted||0)+(counts.interested||0)+(counts.proposal_sent||0)+(counts.assessment_req||0), color:'#6B21A8' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:22, fontWeight:800, color:k.color }}>{k.val}</div>
            <div style={{ fontSize:11, color:TOKENS.s500, marginTop:2, lineHeight:1.3 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, email..."
          style={{ flex:'1 1 220px', padding:'8px 12px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13 }}/>
        <select value={sourceF} onChange={e => setSourceF(e.target.value)}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5 }}>
          <option value="all">All sources</option>
          {Object.entries(SOURCE_META).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12.5, cursor:'pointer', color:overdue?'#DC2626':TOKENS.s700 }}>
          <input type="checkbox" checked={overdue} onChange={e => setOverdue(e.target.checked)}/>
          Overdue only
        </label>
        <button onClick={onAdd} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
          + New inquiry
        </button>
      </div>

      {/* Status tabs */}
      <div style={{ display:'flex', gap:5, marginBottom:14, flexWrap:'wrap', borderBottom:'1.5px solid '+TOKENS.line, paddingBottom:0 }}>
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setStatusF(t.id)} style={{
            padding:'8px 14px', border:'none', background:'transparent',
            borderBottom: statusF===t.id ? '2.5px solid '+TOKENS.crimson : '2.5px solid transparent',
            color: statusF===t.id ? TOKENS.crimson : TOKENS.s500,
            fontSize:12, fontWeight: statusF===t.id ? 700 : 500, cursor:'pointer', marginBottom:-1.5,
            display:'flex', alignItems:'center', gap:5,
          }}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{ background:statusF===t.id?TOKENS.crimson+'20':'#F3F4F6', color:statusF===t.id?TOKENS.crimson:TOKENS.s500, padding:'1px 6px', borderRadius:99, fontSize:10, fontWeight:700 }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:30, textAlign:'center', color:TOKENS.s500, fontSize:13 }}>Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div style={{ padding:40, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:10 }}>📋</div>
            <div style={{ fontSize:14, fontWeight:700, color:TOKENS.s900, marginBottom:4 }}>No inquiries found</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500 }}>{search || statusF !== 'all' ? 'Try different filters.' : 'Click "+ New inquiry" to record your first lead.'}</div>
          </div>
        ) : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Contact</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Student</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Source</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Status</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Priority</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Next Callback</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Added</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(inq => {
                const pm = PRIORITY_META[inq.priority] || PRIORITY_META.medium
                const cbOverdue = inq.nextCallbackDate && !inq.nextCallbackDone && isOverdueDate(inq.nextCallbackDate)
                return (
                  <tr key={inq._id} onClick={() => onOpen(inq._id)}
                    style={{ borderTop:'1px solid '+TOKENS.line, cursor:'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background=TOKENS.cream}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{inq.parentName}</div>
                      <div style={{ fontSize:11.5, color:TOKENS.s500 }}>{inq.parentPhone || inq.parentEmail || '—'}</div>
                      {inq.city && <div style={{ fontSize:11, color:TOKENS.s500 }}>{inq.city}{inq.country ? ', '+inq.country : ''}</div>}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12.5, color:TOKENS.s700 }}>
                      {inq.studentName || '—'}
                      {inq.studentGrade && <div style={{ fontSize:11, color:TOKENS.s500 }}>{inq.studentGrade}</div>}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12.5, color:TOKENS.s700 }}>{SOURCE_META[inq.source] || inq.source}</td>
                    <td style={{ padding:'12px 16px' }}><StatusBadge status={inq.status}/></td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11.5, fontWeight:700, color:pm.color }}>● {pm.label}</span>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12.5, color:cbOverdue?'#DC2626':TOKENS.s700, fontWeight:cbOverdue?700:400 }}>
                      {inq.nextCallbackDate ? (cbOverdue ? '⚠ ' : '') + fmtDate(inq.nextCallbackDate) : '—'}
                      {inq.nextCallbackDone && <span style={{ color:TOKENS.s400, fontWeight:400 }}> (done)</span>}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:11.5, color:TOKENS.s500, whiteSpace:'nowrap' }}>
                      {fmtDate(inq.createdAt)}
                      {inq.notes?.length > 0 && <div style={{ fontSize:10.5, color:TOKENS.s400 }}>{inq.notes.length} note{inq.notes.length>1?'s':''}</div>}
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
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:14 }}>
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page<=1}
            style={{ padding:'7px 14px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page<=1?'not-allowed':'pointer', opacity:page<=1?.5:1 }}>‹ Prev</button>
          <span style={{ padding:'7px 14px', fontSize:12.5, color:TOKENS.s700 }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page>=totalPages}
            style={{ padding:'7px 14px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page>=totalPages?'not-allowed':'pointer', opacity:page>=totalPages?.5:1 }}>Next ›</button>
        </div>
      )}
    </>
  )
}

function CRMDetail({ toast, id, onBack }) {
  const [inq, setInq]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [noteForm, setNoteForm] = useState({ type:'call', summary:'', outcome:'', callbackDate:'' })
  const [addingNote, setAddingNote] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/inquiries/' + id)
      .then(r => setInq(r.data?.data?.inquiry))
      .catch(() => toast?.error?.('Failed to load inquiry.'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  const updateStatus = async (status) => {
    try {
      const { data } = await api.patch('/inquiries/' + id, { status })
      if (data.success) { setInq(data.data.inquiry); toast?.ok?.('Status updated.') }
    } catch { toast?.error?.('Could not update status.') }
  }

  const addNote = async () => {
    if (!noteForm.summary.trim()) { toast?.error?.('Enter a note summary.'); return }
    setAddingNote(true)
    try {
      const { data } = await api.post('/inquiries/' + id + '/notes', noteForm)
      if (data.success) {
        setInq(data.data.inquiry)
        setNoteForm({ type:'call', summary:'', outcome:'', callbackDate:'' })
        setShowNoteForm(false)
        toast?.ok?.('Note added.')
      }
    } catch { toast?.error?.('Could not add note.') }
    finally { setAddingNote(false) }
  }

  const markCallbackDone = async (noteId, done) => {
    try {
      const { data } = await api.patch('/inquiries/' + id + '/notes/' + noteId, { callbackDone: done })
      if (data.success) setInq(data.data.inquiry)
    } catch { toast?.error?.('Could not update.') }
  }

  if (loading) return <div style={{ padding:30, textAlign:'center', color:TOKENS.s500, fontSize:13 }}>Loading...</div>
  if (!inq) return <div style={{ padding:30, color:TOKENS.s500 }}>Inquiry not found.</div>

  const pm = PRIORITY_META[inq.priority] || PRIORITY_META.medium
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'
  const fmtDT = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'
  const inp = { width:'100%', boxSizing:'border-box', padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }

  return (
    <>
      <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, display:'flex', alignItems:'center', gap:6, marginBottom:16, padding:0 }}>
        ‹ Back to all inquiries
      </button>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:18, alignItems:'start' }}>
        {/* Main */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Header card */}
          <div className="card" style={{ padding:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <h2 className="serif" style={{ fontSize:22, color:TOKENS.s900, margin:'0 0 4px' }}>{inq.parentName}</h2>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <StatusBadge status={inq.status}/>
                  <span style={{ fontSize:11.5, fontWeight:700, color:pm.color }}>● {pm.label} priority</span>
                  <span style={{ fontSize:11.5, color:TOKENS.s500 }}>{SOURCE_META[inq.source] || inq.source}</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {inq.parentPhone && <a href={'tel:'+inq.parentPhone} style={{ background:TOKENS.crimson, color:'#fff', padding:'7px 14px', borderRadius:7, fontSize:12, fontWeight:700, textDecoration:'none' }}>📞 Call</a>}
                {inq.parentPhone && <a href={'https://wa.me/'+inq.parentPhone.replace(/\D/g,'')} target="_blank" rel="noopener" style={{ background:'#25D366', color:'#fff', padding:'7px 14px', borderRadius:7, fontSize:12, fontWeight:700, textDecoration:'none' }}>💬 WhatsApp</a>}
              </div>
            </div>

            {/* Contact details */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'8px 24px' }}>
              {[
                { label:'Phone', val:inq.parentPhone },
                { label:'Email', val:inq.parentEmail },
                { label:'Alt phone', val:inq.parentPhone2 },
                { label:'Location', val:[inq.city, inq.country].filter(Boolean).join(', ') },
                { label:'Timezone', val:inq.timezone },
                { label:'Student', val:inq.studentName },
                { label:'Grade', val:inq.studentGrade },
                { label:'Curriculum', val:inq.curriculum },
                { label:'Referred by', val:inq.referredBy },
                { label:'Campaign', val:inq.campaignTag },
              ].filter(f => f.val).map(f => (
                <div key={f.label}>
                  <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>{f.label}</div>
                  <div style={{ fontSize:13, color:TOKENS.s900 }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact log */}
          <div className="card" style={{ padding:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:800, color:TOKENS.s900 }}>Contact Log</div>
              <button onClick={() => setShowNoteForm(v => !v)} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'7px 14px', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                {showNoteForm ? 'Cancel' : '+ Log contact'}
              </button>
            </div>

            {showNoteForm && (
              <div style={{ background:TOKENS.cream, borderRadius:8, padding:16, marginBottom:16, border:'1.5px solid '+TOKENS.line }}>
                <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:10, marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:TOKENS.s500, marginBottom:4 }}>TYPE</div>
                    <select value={noteForm.type} onChange={e => setNoteForm(n => ({...n, type:e.target.value}))} style={inp}>
                      {Object.entries(NOTE_TYPE_META).map(([k,v]) => <option key={k} value={k}>{v} {k.charAt(0).toUpperCase()+k.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:TOKENS.s500, marginBottom:4 }}>CALLBACK DATE (optional)</div>
                    <input type="datetime-local" value={noteForm.callbackDate} onChange={e => setNoteForm(n => ({...n, callbackDate:e.target.value}))} style={inp}/>
                  </div>
                </div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:TOKENS.s500, marginBottom:4 }}>SUMMARY *</div>
                  <textarea value={noteForm.summary} onChange={e => setNoteForm(n => ({...n, summary:e.target.value}))} rows={3} placeholder="What was discussed, what happened..." style={{...inp, resize:'vertical', fontFamily:'inherit'}}/>
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:TOKENS.s500, marginBottom:4 }}>OUTCOME</div>
                  <input value={noteForm.outcome} onChange={e => setNoteForm(n => ({...n, outcome:e.target.value}))} placeholder="e.g. Agreed to send brochure, callback next week..." style={inp}/>
                </div>
                <button onClick={addNote} disabled={addingNote} style={{ background:addingNote?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 20px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:addingNote?'not-allowed':'pointer' }}>
                  {addingNote ? 'Saving...' : 'Save note'}
                </button>
              </div>
            )}

            {(!inq.notes || inq.notes.length === 0) && !showNoteForm ? (
              <div style={{ padding:'20px 0', textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No contact notes yet. Log your first interaction above.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {(inq.notes || []).map(note => (
                  <div key={note._id} style={{ background:TOKENS.cream, borderRadius:8, padding:14, border:'1px solid '+TOKENS.line }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:16 }}>{NOTE_TYPE_META[note.type] || '📝'}</span>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:TOKENS.s900 }}>
                            {note.type?.charAt(0).toUpperCase() + note.type?.slice(1)}
                            {note.recordedBy && <span style={{ fontWeight:400, color:TOKENS.s500 }}> by {note.recordedBy.firstName} {note.recordedBy.lastName}</span>}
                          </div>
                          <div style={{ fontSize:11, color:TOKENS.s400 }}>{fmtDT(note.date)}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize:13, color:TOKENS.s900, lineHeight:1.6, marginBottom:note.outcome?6:0 }}>{note.summary}</div>
                    {note.outcome && <div style={{ fontSize:12, color:TOKENS.s700, fontStyle:'italic' }}>→ {note.outcome}</div>}
                    {note.callbackDate && (
                      <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11.5, color:note.callbackDone?TOKENS.s400:'#D97706', fontWeight:600 }}>
                          📅 Callback: {fmtDT(note.callbackDate)}
                        </span>
                        {!note.callbackDone ? (
                          <button onClick={() => markCallbackDone(note._id, true)} style={{ fontSize:11, background:'#D1FAE5', color:'#065F46', border:'none', padding:'2px 8px', borderRadius:4, cursor:'pointer', fontWeight:700 }}>Mark done</button>
                        ) : (
                          <span style={{ fontSize:11, color:TOKENS.s400 }}>✓ Done</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Status panel */}
          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:TOKENS.s900, marginBottom:12 }}>Pipeline Stage</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {Object.entries(STATUS_META).map(([k, m]) => (
                <button key={k} onClick={() => updateStatus(k)}
                  style={{ textAlign:'left', padding:'8px 12px', borderRadius:7, border:'1.5px solid '+(inq.status===k?m.fg:TOKENS.line), background:inq.status===k?m.bg:'transparent', color:inq.status===k?m.fg:TOKENS.s700, fontSize:12, fontWeight:inq.status===k?700:500, cursor:'pointer' }}>
                  {inq.status===k ? '✓ ' : ''}{m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick info */}
          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:TOKENS.s900, marginBottom:10 }}>Callback</div>
            {inq.nextCallbackDate ? (
              <div style={{ fontSize:13, color: !inq.nextCallbackDone && new Date(inq.nextCallbackDate) < new Date() ? '#DC2626' : TOKENS.s700, fontWeight:600 }}>
                📅 {new Date(inq.nextCallbackDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                {inq.nextCallbackDone && <div style={{ fontSize:11, color:TOKENS.s400, fontWeight:400, marginTop:2 }}>✓ Completed</div>}
              </div>
            ) : (
              <div style={{ fontSize:12.5, color:TOKENS.s400 }}>No callback scheduled</div>
            )}
          </div>

          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:11, color:TOKENS.s500, lineHeight:1.7 }}>
              <div><strong>Added</strong><br/>{fmtDate(inq.createdAt)}</div>
              {inq.createdBy && <div style={{ marginTop:6 }}><strong>By</strong><br/>{inq.createdBy.firstName} {inq.createdBy.lastName}</div>}
              {inq.assignedTo && <div style={{ marginTop:6 }}><strong>Assigned to</strong><br/>{inq.assignedTo.firstName} {inq.assignedTo.lastName}</div>}
              <div style={{ marginTop:6 }}><strong>Notes</strong><br/>{inq.notes?.length || 0} log {inq.notes?.length === 1 ? 'entry' : 'entries'}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function CRMForm({ toast, onBack, onSaved }) {
  const [form, setForm] = useState({
    parentName:'', parentPhone:'', parentEmail:'', parentPhone2:'',
    country:'', city:'', timezone:'',
    studentName:'', studentGrade:'', curriculum:'',
    source:'whatsapp', referredBy:'', campaignTag:'',
    status:'new', priority:'medium',
    nextCallbackDate:'',
    internalNote:'',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm(f => ({...f, [k]:v}))

  const save = async () => {
    setError('')
    if (!form.parentName.trim()) { setError('Contact name is required.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/inquiries', form)
      if (data.success) {
        toast?.ok?.('Inquiry created.')
        onSaved(data.data.inquiry._id)
      } else {
        setError(data.message || 'Could not save.')
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not save inquiry.')
    } finally { setSaving(false) }
  }

  const inp   = { width:'100%', boxSizing:'border-box', padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }
  const lbl   = { fontSize:11, fontWeight:700, color:TOKENS.crimson, letterSpacing:'.05em', textTransform:'uppercase', marginBottom:4, display:'block' }
  const field = (label, key, opts={}) => (
    <div>
      <label style={lbl}>{label}{opts.required && ' *'}</label>
      {opts.select ? (
        <select value={form[key]} onChange={e => set(key, e.target.value)} style={inp}>
          {opts.options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : (
        <input type={opts.type||'text'} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={opts.placeholder||''} style={inp}/>
      )}
    </div>
  )

  const S = (label, children) => (
    <div className="card" style={{ padding:22, marginBottom:14 }}>
      <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:14, paddingBottom:8, borderBottom:'1px solid '+TOKENS.line }}>{label}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>{children}</div>
    </div>
  )

  return (
    <>
      <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, display:'flex', alignItems:'center', gap:6, marginBottom:16, padding:0 }}>
        ‹ Back
      </button>
      <h2 className="serif" style={{ fontSize:22, color:TOKENS.s900, margin:'0 0 20px' }}>New Inquiry</h2>

      {error && <div style={{ background:'#FDE7EC', border:'1px solid #F8B4C0', borderRadius:8, padding:'10px 14px', fontSize:13, color:TOKENS.crimson, marginBottom:16 }}>{error}</div>}

      {S('Contact / Parent', <>
        {field('Full name', 'parentName', { required:true, placeholder:'e.g. Jane Mwangi' })}
        {field('Phone (WhatsApp)', 'parentPhone', { placeholder:'+254 700 000 000' })}
        {field('Email', 'parentEmail', { type:'email', placeholder:'jane@email.com' })}
        {field('Secondary phone', 'parentPhone2', { placeholder:'+254 ...' })}
        {field('Country', 'country', { placeholder:'e.g. Kenya' })}
        {field('City', 'city', { placeholder:'e.g. Nairobi' })}
        {field('Timezone', 'timezone', { placeholder:'e.g. Africa/Nairobi' })}
      </>)}

      {S('Student', <>
        {field('Student name', 'studentName', { placeholder:'e.g. Michael Mwangi' })}
        {field('Grade / Year', 'studentGrade', { placeholder:'e.g. Year 9' })}
        {field('Curriculum interest', 'curriculum', { placeholder:'e.g. Cambridge IGCSE' })}
      </>)}

      {S('Source & Pipeline', <>
        {field('Source channel', 'source', { select:true, options:Object.entries(SOURCE_META) })}
        {field('Referred by', 'referredBy', { placeholder:'Name of referrer (if referral)' })}
        {field('Campaign / ad tag', 'campaignTag', { placeholder:'e.g. IG-Jun25, Google-Search' })}
        {field('Initial status', 'status', { select:true, options:Object.entries(STATUS_META).map(([k,m])=>[k,m.label]) })}
        {field('Priority', 'priority', { select:true, options:Object.entries(PRIORITY_META).map(([k,m])=>[k,m.label]) })}
        {field('First callback date', 'nextCallbackDate', { type:'datetime-local' })}
      </>)}

      <div className="card" style={{ padding:22, marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:10 }}>Internal note (optional)</div>
        <textarea value={form.internalNote} onChange={e => set('internalNote', e.target.value)} rows={3}
          placeholder="Any context for the team — not shown to the family"
          style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}/>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={save} disabled={saving} style={{ background:saving?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'11px 28px', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
          {saving ? 'Saving...' : 'Save inquiry'}
        </button>
        <button onClick={onBack} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s700, padding:'11px 20px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
          Cancel
        </button>
      </div>
    </>
  )
}

export function SalesPerformanceModule({ toast, refreshKey }) {
  const { user } = useAuth()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [cycle,   setCycle]   = useState('')   // '' = current
  const [cycles,  setCycles]  = useState([])

  const load = useCallback((c) => {
    setLoading(true)
    const params = c ? { cycle: c } : {}
    api.get('/invoices/sales-performance', { params })
      .then(r => {
        setData(r.data?.data)
        setCycles(r.data?.data?.availableCycles || [])
      })
      .catch(() => toast?.error?.('Failed to load sales performance.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(cycle) }, [cycle, refreshKey])

  const money = (n, cur='') => {
    const v = Number(n||0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })
    return cur ? `${cur} ${v}` : v
  }
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'

  const STATUS_COLOURS = {
    draft:     { bg:'#F3F4F6', fg:'#374151' },
    sent:      { bg:'#DBEAFE', fg:'#1E40AF' },
    paid:      { bg:'#D1FAE5', fg:'#065F46' },
    overdue:   { bg:'#FEE2E2', fg:'#991B1B' },
    cancelled: { bg:'#F3F4F6', fg:'#6B7280' },
  }

  const viewReceipt = async (inv) => {
    try {
      const { data: rd } = await api.get('/invoices/'+inv._id+'/receipt-html')
      if (rd.success) {
        const w = window.open('','_blank')
        if (!w) { toast?.error?.('Allow pop-ups to view receipt.'); return }
        w.document.write(rd.data.html); w.document.close()
      }
    } catch { toast?.error?.('Could not load receipt.') }
  }

  if (loading) return (
    <div style={{padding:'60px 0',textAlign:'center'}}>
      <div style={{width:40,height:40,border:'3px solid #F0EBE6',borderTopColor:TOKENS.crimson,borderRadius:'50%',animation:'spin .75s linear infinite',margin:'0 auto 14px'}}/>
      <div style={{fontSize:13,color:TOKENS.s500}}>Loading your performance data...</div>
    </div>
  )

  if (!data) return null

  const { summary, earnings, invoices, trend, cycle: cycleInfo } = data

  const maxBar = Math.max(...(trend||[]).map(t=>t.sales), 1)

  return (
    <>
      <PSection tag="Sales" title="My" em="Performance" sub={`Cycle: ${cycleInfo?.label || '—'} · Commission 3% + KES 40,000 retainer`}/>

      {/* Cycle picker */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{fontSize:12.5,fontWeight:700,color:TOKENS.s700}}>Billing cycle:</div>
        <select value={cycle} onChange={e=>setCycle(e.target.value)}
          style={{padding:'8px 12px',borderRadius:7,border:'1.5px solid '+TOKENS.line,fontSize:13,background:'#fff',minWidth:280}}>
          <option value="">Current cycle</option>
          {cycles.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>

      {/* KPI strip */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        {[
          { label:'Invoices Issued',   val:summary.totalInvoiced,  color:TOKENS.crimson,      sub:'This cycle' },
          { label:'Paid',              val:summary.totalPaid,       color:'#065F46',            sub:'Invoices confirmed' },
          { label:'Pending',           val:summary.totalPending,    color:'#D97706',            sub:'Awaiting payment' },
          { label:'Sales Volume',      val:'USD '+money(summary.salesVolume), color:TOKENS.crimson, sub:'Paid invoices only', big:true },
        ].map(k=>(
          <div key={k.label} className="card" style={{padding:'16px 18px'}}>
            <div style={{fontSize:11,fontWeight:700,color:TOKENS.s400,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6}}>{k.label}</div>
            <div style={{fontSize:k.big?16:26,fontWeight:800,color:k.color,lineHeight:1.1}}>{k.val}</div>
            <div style={{fontSize:11,color:TOKENS.s500,marginTop:4}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Earnings card */}
      <div className="card" style={{padding:24,marginBottom:20,background:'linear-gradient(135deg,#7D1025,#5A0B1B)',color:'#fff',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,width:120,height:120,borderRadius:'50%',background:'rgba(201,160,48,.12)'}}/>
        <div style={{position:'absolute',bottom:-30,left:-10,width:80,height:80,borderRadius:'50%',background:'rgba(201,160,48,.08)'}}/>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.6)',marginBottom:10}}>
          Your earnings this cycle
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16,position:'relative'}}>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.55)',marginBottom:4}}>Retainer (fixed)</div>
            <div style={{fontSize:28,fontWeight:800,color:'#C9A030'}}>KES 40,000</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.45)'}}>Paid monthly</div>
          </div>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.55)',marginBottom:4}}>Commission (3% of sales)</div>
            <div style={{fontSize:28,fontWeight:800,color:'#C9A030'}}>
              USD {money(earnings.commissionUSD)}
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.45)'}}>
              3% × USD {money(earnings.salesVolume)} sales
            </div>
          </div>
          {Object.entries(summary.byCurrency||{}).filter(([k])=>k!=='USD').map(([cur,amt])=>(
            <div key={cur}>
              <div style={{fontSize:11,color:'rgba(255,255,255,.55)',marginBottom:4}}>Commission ({cur} sales)</div>
              <div style={{fontSize:22,fontWeight:800,color:'#C9A030'}}>
                {cur} {money(amt*0.03)}
              </div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.45)'}}>3% × {cur} {money(amt)}</div>
            </div>
          ))}
          <div style={{borderLeft:'1px solid rgba(255,255,255,.15)',paddingLeft:16}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.55)',marginBottom:4}}>Total this cycle</div>
            <div style={{fontSize:24,fontWeight:800,color:'#fff'}}>
              KES 40,000 + {Object.entries(summary.byCurrency||{}).map(([c,a])=>`${c} ${money(a*0.03)}`).join(' + ') || 'USD 0.00'}
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.45)',marginTop:4}}>Retainer + 3% commission on all currencies</div>
          </div>
        </div>
      </div>

      {/* Trend bar chart */}
      {trend && trend.length > 1 && (
        <div className="card" style={{padding:20,marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:800,color:TOKENS.s900,marginBottom:16}}>Sales trend (last 7 cycles)</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:8,height:80}}>
            {[...trend].reverse().map((t,i)=>(
              <div key={t.key||i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <div style={{fontSize:9,color:TOKENS.s500,fontWeight:600}}>
                  {t.sales>0?'$'+money(t.sales):'—'}
                </div>
                <div style={{
                  width:'100%',
                  height: Math.max(4, (t.sales/maxBar)*60),
                  background: t.key === cycle || (!cycle && i===trend.length-1)
                    ? TOKENS.crimson : TOKENS.crimson+'40',
                  borderRadius:'3px 3px 0 0',
                  transition:'height .3s',
                }}/>
                <div style={{fontSize:8,color:TOKENS.s500,textAlign:'center',lineHeight:1.2}}>
                  {(t.cycle||'').split('–')[0]?.trim().slice(0,6)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice list */}
      <div className="card" style={{overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid '+TOKENS.line,fontWeight:800,fontSize:13,color:TOKENS.s900}}>
          Invoices this cycle
          <span style={{fontWeight:400,color:TOKENS.s500,marginLeft:8,fontSize:12}}>({invoices.length})</span>
        </div>
        {invoices.length === 0 ? (
          <div style={{padding:32,textAlign:'center',color:TOKENS.s500,fontSize:13}}>No invoices issued this cycle yet.</div>
        ) : (
          <table className="tbl" style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>{['Invoice No.','Bill To','Student','Amount','Status','Date',''].map(h=>(
                <th key={h} style={{padding:'9px 14px',textAlign:'left',fontSize:11}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {invoices.map(inv=>{
                const sc = STATUS_COLOURS[inv.status]||STATUS_COLOURS.sent
                return (
                  <tr key={inv._id} style={{borderTop:'1px solid '+TOKENS.line}}>
                    <td style={{padding:'10px 14px',fontFamily:'monospace',fontSize:12,fontWeight:700,color:TOKENS.crimson}}>{inv.invoiceNo}</td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{fontSize:13,fontWeight:600,color:TOKENS.s900}}>{inv.billedToName}</div>
                      {inv.billedToEmail&&<div style={{fontSize:11,color:TOKENS.s500}}>{inv.billedToEmail}</div>}
                    </td>
                    <td style={{padding:'10px 14px',fontSize:12.5,color:TOKENS.s700}}>{inv.studentName||'—'}</td>
                    <td style={{padding:'10px 14px',fontSize:13,fontWeight:700,color:TOKENS.s900,whiteSpace:'nowrap'}}>
                      {inv.currency} {money(inv.totalDue)}
                    </td>
                    <td style={{padding:'10px 14px'}}>
                      <span style={{padding:'3px 10px',borderRadius:99,background:sc.bg,color:sc.fg,fontSize:11,fontWeight:700}}>
                        {inv.status.charAt(0).toUpperCase()+inv.status.slice(1)}
                      </span>
                    </td>
                    <td style={{padding:'10px 14px',fontSize:11.5,color:TOKENS.s500,whiteSpace:'nowrap'}}>{fmtDate(inv.createdAt)}</td>
                    <td style={{padding:'10px 14px'}}>
                      {inv.status==='paid'&&(
                        <button onClick={()=>viewReceipt(inv)} style={{fontSize:11,background:'#065F46',color:'#fff',border:'none',padding:'4px 8px',borderRadius:5,cursor:'pointer',fontWeight:700}}>
                          🧾 Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Note */}
      <div style={{fontSize:12,color:TOKENS.s500,marginTop:12,lineHeight:1.6}}>
        Cycle runs from the <strong>15th of each month</strong> to the <strong>14th of the following month</strong>.
        Commission is calculated on <strong>paid invoices only</strong> at <strong>3%</strong> of the total invoice value.
        Retainer of <strong>KES 40,000</strong> is paid monthly regardless of sales volume.
      </div>
    </>
  )
}

export default CRMModule
