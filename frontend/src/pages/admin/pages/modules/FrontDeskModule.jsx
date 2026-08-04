import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PCard, PSection } from '../shared/ui.jsx'

const FD_STATUS = {
  new:       { label: 'New',       bg: '#FEF3C7', fg: '#92400E' },
  contacted: { label: 'Contacted', bg: '#DBEAFE', fg: '#1E40AF' },
  converted: { label: 'Converted', bg: '#DCFCE7', fg: '#15803D' },
  closed:    { label: 'Closed',    bg: '#F1F1F1', fg: '#6B6B6B' },
}

const FD_TYPE = {
  registration: { label: 'Registration', bg: '#7B0D0D', fg: '#fff' },
  consultation: { label: 'Consultation', bg: '#C9A030', fg: '#3A2A00' },
  contact:      { label: 'Message',      bg: '#E8E2D6', fg: '#3A3A3A' },
}

function FrontDeskModule({ refreshKey, toast }) {
  const [view, setView] = useState('leads')   // leads | insights

  return (
    <>
      <PSection
        tag="Front Desk"
        title="Website"
        em="Leads"
        sub="Every consultation, registration and message captured from the landing page."
      />

      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[
          { id: 'leads',    label: 'Leads' },
          { id: 'insights', label: 'Insights' },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 99,
              border: `1.5px solid ${view === t.id ? TOKENS.crimson : (TOKENS.line || '#E8E2D6')}`,
              background: view === t.id ? TOKENS.crimson : '#fff',
              color: view === t.id ? '#fff' : TOKENS.crimson,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {view === 'leads'
        ? <FrontDeskLeads refreshKey={refreshKey} toast={toast} />
        : <FrontDeskInsights refreshKey={refreshKey} toast={toast} />}
    </>
  )
}

function FrontDeskLeads({ refreshKey, toast }) {
  const [subs, setSubs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [typeF, setTypeF]     = useState('all')
  const [statusF, setStatusF] = useState('all')
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(null)   // expanded lead

  // Per-lesson coverage widget state (self-contained)
  const [cov,     setCov]     = useState(null)
  const [covSubj, setCovSubj] = useState({ subject:'Biology', curriculum:'EdexcelIGCSE' })
  const CURRICULA = ['EdexcelIGCSE','CambridgeIGCSE','CambridgeALevel','EdexcelALevel','IBPYP','IBMYP','IBDP','KenyaCBC','American','BNC']
  const loadCoverage = async () => {
    try {
      const r = await api.get('/questions/coverage', { params: covSubj })
      setCov(r.data?.data || null)
    } catch (e) { toast?.error?.('Could not load coverage.') }
  }

  const load = useCallback(() => {
    setLoading(true)
    api.get('/frontdesk/submissions')
      .then(r => setSubs(r.data.data?.submissions || []))
      .catch(() => toast?.error?.('Failed to load leads.'))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => { load() }, [load, refreshKey])

  const filtered = subs.filter(s => {
    if (typeF !== 'all' && s.type !== typeF) return false
    if (statusF !== 'all' && s.status !== statusF) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const hay = `${s.name || ''} ${s.email || ''} ${s.phone || ''} ${s.message || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const setStatus = async (id, status) => {
    try {
      const { data } = await api.patch('/frontdesk/' + id, { status })
      if (data?.success) {
        setSubs(list => list.map(s => s._id === id ? { ...s, status } : s))
        if (selected && selected._id === id) setSelected(s => ({ ...s, status }))
        toast?.ok?.('Status updated.')
      }
    } catch (e) {
      toast?.error?.('Update failed.')
    }
  }

  const saveNotes = async (id, adminNotes) => {
    try {
      const { data } = await api.patch('/frontdesk/' + id, { adminNotes })
      if (data?.success) {
        setSubs(list => list.map(s => s._id === id ? { ...s, adminNotes } : s))
        toast?.ok?.('Notes saved.')
      }
    } catch (e) {
      toast?.error?.('Could not save notes.')
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this lead permanently?')) return
    try {
      const { data } = await api.delete('/frontdesk/' + id)
      if (data?.success) {
        setSubs(list => list.filter(s => s._id !== id))
        if (selected && selected._id === id) setSelected(null)
        toast?.ok?.('Lead deleted.')
      }
    } catch (e) {
      toast?.error?.('Delete failed.')
    }
  }

  const counts = {
    all: subs.length,
    new: subs.filter(s => s.status === 'new').length,
    contacted: subs.filter(s => s.status === 'contacted').length,
    converted: subs.filter(s => s.status === 'converted').length,
  }

  const pill = (active) => ({
    padding: '5px 12px', borderRadius: 99,
    border: `1.5px solid ${active ? TOKENS.crimson : (TOKENS.line || '#E8E2D6')}`,
    background: active ? TOKENS.crimson : '#fff',
    color: active ? '#fff' : TOKENS.s600 || '#555',
    fontSize: 11.5, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
  })

  if (loading) {
    return <PCard padding={40}><div style={{ textAlign: 'center', color: TOKENS.s500 }}>Loading leads…</div></PCard>
  }

  return (
    <>
      {/* Snapshot row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[
          ['Total leads', counts.all, TOKENS.crimson],
          ['New', counts.new, '#B45309'],
          ['Contacted', counts.contacted, '#1E40AF'],
          ['Converted', counts.converted, '#15803D'],
        ].map(([label, val, col]) => (
          <div key={label} style={{
            flex: '1 1 130px', background: '#fff',
            border: '1px solid ' + (TOKENS.line || '#E8E2D6'),
            borderRadius: 10, padding: '12px 16px',
          }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, color: col, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.s500, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Per-lesson coverage */}
      <PCard style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginBottom:cov?14:0 }}>
          <div style={{ fontSize:11, fontWeight:800, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.08em' }}>Coverage per lesson</div>
          <input className="fi" value={covSubj.subject} onChange={e=>setCovSubj(s=>({...s,subject:e.target.value}))} placeholder="Subject" style={{ width:150 }}/>
          <select className="fsel" value={covSubj.curriculum} onChange={e=>setCovSubj(s=>({...s,curriculum:e.target.value}))} style={{ width:170 }}>
            {CURRICULA.map(x=><option key={x} value={x}>{x}</option>)}
          </select>
          <button onClick={loadCoverage} style={{ background:TOKENS.s100, border:'none', padding:'8px 16px', borderRadius:7, fontWeight:700, fontSize:12.5, cursor:'pointer', color:TOKENS.s700 }}>Check</button>
          {cov && <span style={{ fontSize:12.5, color:TOKENS.s500 }}>
            <strong style={{ color:TOKENS.ink }}>{cov.totals.withQuestions}</strong> of <strong style={{ color:TOKENS.ink }}>{cov.totals.lessons}</strong> lessons have questions · {cov.totals.questions} total
          </span>}
        </div>
        {cov && cov.topics.length>0 && (
          <div style={{ maxHeight:260, overflowY:'auto', border:`1px solid ${TOKENS.s100}`, borderRadius:8 }}>
            {cov.topics.map(t=>(
              <div key={t.topic} style={{ borderBottom:`1px solid ${TOKENS.s100}` }}>
                <div style={{ padding:'8px 14px', background:'#FBFAF5', fontSize:12, fontWeight:800, color:TOKENS.ink }}>
                  {t.code?t.code+' · ':''}{t.topic}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, padding:'8px 14px' }}>
                  {t.subtopics.map(s=>{
                    const good = s.questions>=20, some = s.questions>0
                    return (
                      <span key={s.code||s.name} title={`${s.name} — ${s.questions} question(s)`}
                        style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:99,
                          background: good?'#D1FAE5':some?'#FEF3C7':'#FEE2E2',
                          color: good?'#065F46':some?'#92400E':'#991B1B' }}>
                        {s.code||''} {s.questions}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </PCard>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
        {['all', 'registration', 'consultation', 'contact'].map(t => (
          <button key={t} onClick={() => setTypeF(t)} style={pill(typeF === t)}>
            {t === 'all' ? 'All types' : (FD_TYPE[t]?.label || t)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {['all', 'new', 'contacted', 'converted', 'closed'].map(s => (
          <button key={s} onClick={() => setStatusF(s)} style={pill(statusF === s)}>
            {s === 'all' ? 'All statuses' : s}
          </button>
        ))}
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search name, email, phone, message…"
        style={{
          width: '100%', boxSizing: 'border-box', marginBottom: 14,
          padding: '9px 12px', borderRadius: 8,
          border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'), fontSize: 13,
        }}/>

      {filtered.length === 0 ? (
        <PCard padding={36}><div style={{ textAlign: 'center', color: TOKENS.s500 }}>
          {subs.length === 0 ? 'No leads captured yet.' : 'No leads match these filters.'}
        </div></PCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => {
            const open = selected && selected._id === s._id
            const t = FD_TYPE[s.type] || FD_TYPE.contact
            const st = FD_STATUS[s.status] || FD_STATUS.new
            return (
              <div key={s._id} style={{
                background: '#fff', border: '1px solid ' + (TOKENS.line || '#E8E2D6'),
                borderRadius: 10, overflow: 'hidden',
              }}>
                {/* Row header */}
                <div onClick={() => setSelected(open ? null : s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: TOKENS.ink || '#1A1A1A' }}>
                      {s.name || s.email || 'Unnamed lead'}
                    </div>
                    <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 1 }}>
                      {[s.email, s.phone, s.country].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: t.bg, color: t.fg }}>
                    {t.label}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: st.bg, color: st.fg }}>
                    {st.label}
                  </span>
                  <span style={{ fontSize: 11, color: TOKENS.s400, minWidth: 78, textAlign: 'right' }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                {/* Expanded detail */}
                {open && (
                  <div style={{ borderTop: '1px solid ' + (TOKENS.line || '#E8E2D6'), padding: 16, background: '#FCFBF8' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px 18px', marginBottom: 14 }}>
                      {[
                        ['Programme', s.programme],
                        ['Curriculum', s.curriculum],
                        ['Learning mode', s.learningMode],
                        ['Country', s.country],
                        ['Pathway', s.pathway],
                        ['Destination', s.destination],
                        ['Student', [s.studentFirstName, s.studentLastName].filter(Boolean).join(' ')],
                        ['Student DOB', s.studentDob],
                        ['Current school', s.currentSchool],
                        ['Heard from', s.heardFrom],
                        ['Consultation format', s.consultFormat],
                        ['Address', s.address],
                        ['Source page', s.sourcePage],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400 }}>{k}</div>
                          <div style={{ fontSize: 12.5, color: TOKENS.ink || '#1A1A1A' }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {s.subject && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400 }}>Subject</div>
                        <div style={{ fontSize: 12.5, color: TOKENS.ink || '#1A1A1A' }}>{s.subject}</div>
                      </div>
                    )}
                    {s.message && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400, marginBottom: 3 }}>Message</div>
                        <div style={{ fontSize: 12.5, color: TOKENS.ink || '#1A1A1A', background: '#fff', border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 6, padding: '8px 11px', lineHeight: 1.55 }}>
                          {s.message}
                        </div>
                      </div>
                    )}

                    {/* Status workflow */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {Object.keys(FD_STATUS).map(k => (
                        <button key={k} onClick={() => setStatus(s._id, k)}
                          style={{
                            padding: '5px 12px', borderRadius: 6,
                            border: `1.5px solid ${s.status === k ? FD_STATUS[k].fg : (TOKENS.line || '#E8E2D6')}`,
                            background: s.status === k ? FD_STATUS[k].bg : '#fff',
                            color: s.status === k ? FD_STATUS[k].fg : (TOKENS.s500 || '#777'),
                            fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          }}>
                          {FD_STATUS[k].label}
                        </button>
                      ))}
                    </div>

                    {/* Admin notes */}
                    <NotesEditor
                      initial={s.adminNotes || ''}
                      onSave={(txt) => saveNotes(s._id, txt)}
                    />

                    {/* Emails already sent to this lead */}
                    {Array.isArray(s.emailsSent) && s.emailsSent.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400, marginBottom: 4 }}>
                          Emails sent ({s.emailsSent.length})
                        </div>
                        {s.emailsSent.slice().reverse().map((em, i) => (
                          <div key={i} style={{ fontSize: 11.5, color: TOKENS.s500, padding: '2px 0' }}>
                            {em.subject} · {em.sentAt ? new Date(em.sentAt).toLocaleDateString() : ''}
                            {em.delivered === false && <span style={{ color: '#B91C1C', fontWeight: 700 }}> · failed</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Email composer */}
                    {s.email ? (
                      <LeadEmailComposer lead={s} toast={toast}
                        onSent={(updated) => {
                          setSubs(list => list.map(x => x._id === s._id
                            ? { ...x, status: updated.status, emailsSent: updated.emailsSent }
                            : x))
                          if (selected && selected._id === s._id)
                            setSelected(x => ({ ...x, status: updated.status, emailsSent: updated.emailsSent }))
                        }}/>
                    ) : (
                      <div style={{ marginTop: 12, fontSize: 12, color: TOKENS.s400, fontStyle: 'italic' }}>
                        This lead has no email address — cannot send email.
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button onClick={() => remove(s._id)}
                        style={{
                          background: 'transparent', color: '#B91C1C',
                          border: '1px solid #FCA5A5', borderRadius: 6,
                          padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        }}>
                        Delete lead
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

function NotesEditor({ initial, onSave }) {
  const [val, setVal] = useState(initial)
  const [dirty, setDirty] = useState(false)
  useEffect(() => { setVal(initial); setDirty(false) }, [initial])
  return (
    <div>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400, marginBottom: 4 }}>
        Admin notes
      </div>
      <textarea value={val}
        onChange={e => { setVal(e.target.value); setDirty(true) }}
        rows={2} placeholder="Internal notes about this lead…"
        style={{
          width: '100%', boxSizing: 'border-box', resize: 'vertical',
          padding: '8px 11px', borderRadius: 6, fontSize: 12.5, fontFamily: 'inherit',
          border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
        }}/>
      {dirty && (
        <button onClick={() => { onSave(val); setDirty(false) }}
          style={{
            marginTop: 6, background: TOKENS.crimson, color: '#fff', border: 'none',
            borderRadius: 6, padding: '6px 14px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
          }}>
          Save notes
        </button>
      )}
    </div>
  )
}

function leadEmailTemplates(lead) {
  const first = (lead.name || '').split(/\s+/)[0] || 'there'
  const prog  = lead.programme || lead.curriculum || 'your chosen programme'
  return {
    registration: {
      label: 'Registration Successful',
      subject: 'Your Smartious Registration — Next Steps',
      body:
`Dear ${first},

Thank you for registering with Smartious Homeschool & eSchool. We are delighted to welcome ${lead.studentFirstName || 'your child'} to the Smartious family.

Your registration for ${prog} has been received successfully.

NEXT STEPS

1. Invoice — Please find your registration invoice attached to this email.

2. Fee Payment — Kindly complete payment using the details on the invoice.

3. Portal Access — Once your payment is confirmed, you will receive a follow-up email containing:
   • A one-time password to log in to the Student Portal
   • Your child's placement assessment, which will already be set up and ready in the exam module

4. Begin Learning — After the placement assessment, our team will match a tutor and your child's learning journey begins.

If you have any questions, simply reply to this email or reach us on WhatsApp at +254 745 021 212.

Warm regards,`,
    },
    consultation: {
      label: 'Consultation Follow-up',
      subject: 'Your Smartious Consultation',
      body:
`Dear ${first},

Thank you for requesting a consultation with Smartious Homeschool & eSchool.

We would be glad to discuss ${prog} and how we can support ${lead.studentFirstName || 'your child'}'s learning.

Please let us know a date and time that suits you, and whether you would prefer an online call or an in-person meeting. We will confirm the appointment and send you everything you need beforehand.

You can also reach us directly on WhatsApp at +254 745 021 212.

Warm regards,`,
    },
    welcome: {
      label: 'General Reply',
      subject: 'Thank You for Contacting Smartious',
      body:
`Dear ${first},

Thank you for getting in touch with Smartious Homeschool & eSchool.

We have received your message and a member of our team will respond to you shortly with the information you need.

If your enquiry is urgent, please reach us on WhatsApp at +254 745 021 212.

Warm regards,`,
    },
    custom: {
      label: 'Blank',
      subject: '',
      body: '',
    },
  }
}

function LeadEmailComposer({ lead, toast, onSent }) {
  const [open, setOpen]       = useState(false)
  const [kind, setKind]       = useState(lead.type === 'registration' ? 'registration'
                                       : lead.type === 'consultation' ? 'consultation' : 'welcome')
  const templates             = leadEmailTemplates(lead)
  const [subject, setSubject] = useState(templates[kind].subject)
  const [body, setBody]       = useState(templates[kind].body)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading]     = useState(false)
  const [sending, setSending]         = useState(false)
  const [confirm, setConfirm]         = useState(false)

  const applyTemplate = (k) => {
    setKind(k)
    setSubject(templates[k].subject)
    setBody(templates[k].body)
    setConfirm(false)
  }

  const uploadFile = async (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast?.error?.('File exceeds 10 MB.'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/communication/upload-attachment', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data?.success) {
        setAttachments(a => [...a, data.data])
        toast?.ok?.('Attached ' + data.data.name)
      } else {
        toast?.error?.(data?.message || 'Upload failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const send = async () => {
    if (!subject.trim() || !body.trim()) { toast?.error?.('Subject and message are required.'); return }
    setSending(true)
    try {
      const { data } = await api.post('/frontdesk/' + lead._id + '/email', {
        subject: subject.trim(),
        body,
        template: kind,
        attachments,
      })
      if (data?.success) {
        toast?.ok?.(data.message || 'Email sent.')
        onSent?.(data.data)
        setOpen(false); setConfirm(false); setAttachments([])
      } else {
        toast?.error?.(data?.message || 'Send failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Send failed.')
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        style={{
          marginTop: 12, background: TOKENS.crimson, color: '#fff', border: 'none',
          borderRadius: 6, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
        }}>
        Send Email to Lead
      </button>
    )
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 11px', borderRadius: 6, fontSize: 12.5, fontFamily: 'inherit',
    border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
  }

  return (
    <div style={{ marginTop: 12, background: '#fff', border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 8, padding: 14 }}>
      {/* Template chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {Object.entries(templates).map(([k, t]) => (
          <button key={k} onClick={() => applyTemplate(k)}
            style={{
              padding: '5px 11px', borderRadius: 99,
              border: `1.5px solid ${kind === k ? TOKENS.crimson : (TOKENS.line || '#E8E2D6')}`,
              background: kind === k ? TOKENS.crimson : '#fff',
              color: kind === k ? '#fff' : TOKENS.crimson,
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: TOKENS.s500, marginBottom: 8 }}>
        To: <strong style={{ color: TOKENS.ink || '#1A1A1A' }}>{lead.email}</strong>
      </div>

      <input value={subject} onChange={e => { setSubject(e.target.value); setConfirm(false) }}
        placeholder="Subject" style={{ ...inp, marginBottom: 8 }}/>
      <textarea value={body} onChange={e => { setBody(e.target.value); setConfirm(false) }}
        rows={10} placeholder="Message" style={{ ...inp, resize: 'vertical', lineHeight: 1.5, marginBottom: 8 }}/>

      {/* Attachments — invoice etc. */}
      {attachments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
          {attachments.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 9px', background: '#FBFAF5',
              border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 6, fontSize: 11.5,
            }}>
              <span style={{ flex: 1, color: TOKENS.ink || '#1A1A1A' }}>{a.name}</span>
              <button onClick={() => setAttachments(list => list.filter((_, idx) => idx !== i))}
                style={{ background: 'transparent', border: 'none', color: '#B91C1C', cursor: 'pointer', fontSize: 10.5, fontWeight: 700 }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <label style={{
        display: 'inline-block', marginBottom: 10,
        background: '#fff', color: TOKENS.crimson,
        border: '1.5px solid ' + TOKENS.crimson,
        padding: '6px 12px', borderRadius: 6,
        cursor: uploading ? 'wait' : 'pointer', fontSize: 11.5, fontWeight: 700,
      }}>
        <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }}
          onChange={e => { uploadFile(e.target.files?.[0]); e.target.value = '' }}/>
        {uploading ? 'Uploading…' : '+ Attach Invoice / File'}
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
        <button onClick={() => { setOpen(false); setConfirm(false) }} disabled={sending}
          style={{
            background: 'transparent', color: TOKENS.s500,
            border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 6,
            padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
          Cancel
        </button>
        {!confirm ? (
          <button onClick={() => {
            if (!subject.trim() || !body.trim()) { toast?.error?.('Subject and message are required.'); return }
            setConfirm(true)
          }}
            style={{
              background: TOKENS.crimson, color: '#fff', border: 'none',
              borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
            Review &amp; Send
          </button>
        ) : (
          <button onClick={send} disabled={sending}
            style={{
              background: sending ? '#9CA3AF' : '#15803D', color: '#fff', border: 'none',
              borderRadius: 6, padding: '7px 18px', fontSize: 12, fontWeight: 700,
              cursor: sending ? 'not-allowed' : 'pointer',
            }}>
            {sending ? 'Sending…' : 'Confirm Send'}
          </button>
        )}
      </div>
    </div>
  )
}

function FrontDeskInsights({ refreshKey, toast }) {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/frontdesk/stats')
      .then(r => setStats(r.data.data))
      .catch(() => toast?.error?.('Failed to load insights.'))
      .finally(() => setLoading(false))
  }, [refreshKey, toast])

  if (loading) {
    return <PCard padding={40}><div style={{ textAlign: 'center', color: TOKENS.s500 }}>Loading insights…</div></PCard>
  }
  if (!stats || stats.total === 0) {
    return <PCard padding={40}><div style={{ textAlign: 'center', color: TOKENS.s500 }}>
      No leads yet — insights appear once submissions come in.
    </div></PCard>
  }

  const BarList = ({ title, rows }) => {
    const max = Math.max(1, ...rows.map(r => r.count))
    return (
      <PCard padding={18}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          {title}
        </div>
        {rows.length === 0 ? (
          <div style={{ fontSize: 12, color: TOKENS.s400 }}>No data.</div>
        ) : rows.slice(0, 8).map(r => (
          <div key={r.label} style={{ marginBottom: 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: TOKENS.ink || '#1A1A1A', fontWeight: 600 }}>{r.label}</span>
              <span className="mono" style={{ color: TOKENS.s500, fontWeight: 700 }}>{r.count}</span>
            </div>
            <div style={{ height: 7, background: '#F1ECDD', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: (r.count / max * 100) + '%', height: '100%', background: TOKENS.gold || '#C9A030', borderRadius: 99 }}/>
            </div>
          </div>
        ))}
      </PCard>
    )
  }

  // 30-day trend — simple sparkline-ish bar row
  const trendMax = Math.max(1, ...stats.trend.map(t => t.count))

  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[
          ['Total leads', stats.total],
          ['Registrations', (stats.byType.find(t => t.label === 'registration') || {}).count || 0],
          ['Consultations', (stats.byType.find(t => t.label === 'consultation') || {}).count || 0],
          ['Messages', (stats.byType.find(t => t.label === 'contact') || {}).count || 0],
        ].map(([label, val]) => (
          <div key={label} style={{
            flex: '1 1 130px', background: '#fff',
            border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 10, padding: '12px 16px',
          }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, color: TOKENS.crimson, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.s500, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* 30-day trend */}
      <PCard padding={18} style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Last 30 days
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 70 }}>
          {stats.trend.map((d, i) => (
            <div key={i} title={`${d.date}: ${d.count}`}
              style={{
                flex: 1,
                height: Math.max(2, d.count / trendMax * 70),
                background: d.count > 0 ? (TOKENS.gold || '#C9A030') : '#F1ECDD',
                borderRadius: 2,
              }}/>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: TOKENS.s400, marginTop: 6 }}>
          <span>{stats.trend[0]?.date}</span>
          <span>{stats.trend[stats.trend.length - 1]?.date}</span>
        </div>
      </PCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        <BarList title="By Country" rows={stats.byCountry} />
        <BarList title="By Source Channel" rows={stats.bySource} />
        <BarList title="By Programme" rows={stats.byProgramme} />
        <BarList title="By Curriculum" rows={stats.byCurriculum} />
      </div>
    </>
  )
}

export default FrontDeskModule
