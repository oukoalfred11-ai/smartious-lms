import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PSection } from '../shared/ui.jsx'

function AssessmentModule({ refreshKey, toast }) {
  const [view, setView] = useState('list')   // list | detail
  const [selectedId, setSelectedId] = useState(null)

  return (
    <>
      <PSection
        tag="Admissions"
        title="Assessment"
        em="Requests"
        sub="Every academic assessment request submitted from the public site, awaiting your review."
      />

      {view === 'list' ? (
        <AssessmentRequestsList
          refreshKey={refreshKey}
          toast={toast}
          onOpen={(id) => { setSelectedId(id); setView('detail') }}
        />
      ) : (
        <AssessmentRequestDetail
          id={selectedId}
          toast={toast}
          onBack={() => { setView('list'); setSelectedId(null) }}
        />
      )}
    </>
  )
}

function AssessmentRequestsList({ refreshKey, toast, onOpen }) {
  const [requests, setRequests] = useState([])
  const [counts, setCounts]     = useState({ awaiting_review: 0, info_requested: 0, payment_pending: 0, payment_received: 0, accepted: 0, declined: 0 })
  const [loading, setLoading]   = useState(true)
  const [statusF, setStatusF]   = useState('all')
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 25 }
    if (statusF !== 'all') params.status = statusF
    if (search.trim()) params.search = search.trim()

    api.get('/assessment/requests', { params })
      .then(r => {
        setRequests(r.data?.data?.requests || [])
        setCounts(r.data?.data?.counts || {})
        setTotalPages(r.data?.data?.totalPages || 1)
      })
      .catch(() => toast?.error?.('Failed to load assessment requests.'))
      .finally(() => setLoading(false))
  }, [statusF, search, page, toast])

  useEffect(() => { load() }, [load, refreshKey])
  useEffect(() => { setPage(1) }, [statusF, search])

  const STATUS_TABS = [
    { id: 'all',              label: 'All' },
    { id: 'awaiting_review',  label: 'Awaiting Review',  count: counts.awaiting_review },
    { id: 'info_requested',   label: 'Info Requested',   count: counts.info_requested },
    { id: 'payment_pending',  label: 'Invoice Sent',     count: counts.payment_pending },
    { id: 'payment_received', label: 'Paid',             count: counts.payment_received },
    { id: 'accepted',         label: 'Accepted',         count: counts.accepted },
    { id: 'declined',         label: 'Declined',         count: counts.declined },
  ]

  const statusBadge = (status) => {
    const map = {
      awaiting_review:  { bg: '#FEF3C7', fg: '#92400E', label: 'Awaiting Review' },
      info_requested:   { bg: '#DBEAFE', fg: '#1E40AF', label: 'Info Requested' },
      payment_pending:  { bg: '#FEF9C3', fg: '#854D0E', label: 'Invoice Sent' },
      payment_received: { bg: '#D1FAE5', fg: '#065F46', label: 'Paid ✓' },
      accepted:         { bg: '#DCFCE7', fg: '#166534', label: 'Accepted' },
      declined:         { bg: '#F3F4F6', fg: '#374151', label: 'Declined' },
    }
    const s = map[status] || map.awaiting_review
    return (
      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 99,
        background: s.bg, color: s.fg, fontSize: 11, fontWeight: 700,
      }}>{s.label}</span>
    )
  }

  return (
    <>
      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setStatusF(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 99,
              border: `1.5px solid ${statusF === t.id ? TOKENS.crimson : (TOKENS.line || '#E8E2D6')}`,
              background: statusF === t.id ? TOKENS.crimson : '#fff',
              color: statusF === t.id ? '#fff' : TOKENS.crimson,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            {t.label}
            {t.count !== undefined && (
              <span style={{
                background: statusF === t.id ? 'rgba(255,255,255,.25)' : (TOKENS.crimson + '15'),
                padding: '1px 7px', borderRadius: 99, fontSize: 11,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16, maxWidth: 380 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by student, parent, email or reference..."
          style={{
            width: '100%', boxSizing: 'border-box', padding: '9px 13px',
            borderRadius: 8, border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
            fontSize: 13, background: TOKENS.cream,
          }}/>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#9A9A9A', fontSize: 13, fontStyle: 'italic' }}>
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.s900, marginBottom: 4 }}>No requests found</div>
            <div style={{ fontSize: 12.5, color: TOKENS.s500 }}>
              {search || statusF !== 'all' ? 'Try adjusting your filters.' : 'New assessment requests will appear here.'}
            </div>
          </div>
        ) : (
          <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Reference</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Student</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Parent</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Country</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Curriculum</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Submitted</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id} onClick={() => onOpen(r._id)}
                  style={{ borderTop: '1px solid ' + (TOKENS.line || '#E8E2D6'), cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = TOKENS.cream}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12.5, color: TOKENS.crimson, fontWeight: 700 }}>
                    {r.requestRef}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: TOKENS.s900 }}>
                    {r.studentFirstName} {r.studentLastName}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12.5, color: TOKENS.s700 }}>
                    {r.parent1FirstName} {r.parent1LastName}<br/>
                    <span style={{ color: TOKENS.s500, fontSize: 11.5 }}>{r.parent1Email}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12.5, color: TOKENS.s700 }}>{r.countryIso}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: TOKENS.s500, maxWidth: 200 }}>
                    {(r.curriculumInterest || []).slice(0, 1).join('')}
                    {r.curriculumInterest?.length > 1 && ` +${r.curriculumInterest.length - 1}`}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: TOKENS.s500, whiteSpace: 'nowrap' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            style={{
              padding: '7px 14px', borderRadius: 6, border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
              background: '#fff', fontSize: 12, fontWeight: 700, cursor: page <= 1 ? 'not-allowed' : 'pointer',
              opacity: page <= 1 ? .5 : 1,
            }}>‹ Prev</button>
          <span style={{ padding: '7px 14px', fontSize: 12.5, color: TOKENS.s700 }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            style={{
              padding: '7px 14px', borderRadius: 6, border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
              background: '#fff', fontSize: 12, fontWeight: 700, cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              opacity: page >= totalPages ? .5 : 1,
            }}>Next ›</button>
        </div>
      )}
    </>
  )
}

function AssessmentRequestDetail({ id, toast, onBack }) {
  const [req, setReq]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes]     = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [actionPanel, setActionPanel] = useState(null) // 'info_requested' | 'declined' | null
  const [actionMessage, setActionMessage] = useState('')
  const [submittingAction, setSubmittingAction] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/assessment/requests/' + id)
      .then(r => {
        const data = r.data?.data?.request
        setReq(data)
        setNotes(data?.internalNotes || '')
      })
      .catch(() => toast?.error?.('Failed to load request.'))
      .finally(() => setLoading(false))
  }, [id, toast])

  useEffect(() => { load() }, [load])

  const saveNotes = async () => {
    setSavingNotes(true)
    try {
      const { data } = await api.patch('/assessment/requests/' + id, { internalNotes: notes })
      if (data?.ok) {
        toast?.ok?.('Notes saved.')
        setReq(r => ({ ...r, internalNotes: notes }))
      }
    } catch (e) {
      toast?.error?.('Could not save notes.')
    } finally {
      setSavingNotes(false)
    }
  }

  const setStatus = async (status, message) => {
    setSubmittingAction(true)
    try {
      const { data } = await api.patch('/assessment/requests/' + id, { status, message })
      if (data?.ok) {
        setReq(data.data.request)
        setActionPanel(null)
        setActionMessage('')
        const labels = {
          payment_pending:  'accepted — invoice sent to parent',
          info_requested:   'info request sent to parent',
          declined:         'declined — parent notified',
        }
        toast?.ok?.(`Request ${labels[status] || 'updated'}.`)
      } else {
        toast?.error?.(data?.error || 'Could not update status.')
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e.message || 'Could not update status.'
      toast?.error?.(msg)
    } finally {
      setSubmittingAction(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 30, textAlign: 'center', color: '#9A9A9A', fontSize: 13, fontStyle: 'italic' }}>Loading request...</div>
  }
  if (!req) {
    return <div style={{ padding: 30, textAlign: 'center', color: '#9A9A9A', fontSize: 13 }}>Request not found.</div>
  }

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6,
        borderBottom: '1px solid ' + (TOKENS.line || '#E8E2D6'),
      }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px 24px' }}>
        {children}
      </div>
    </div>
  )

  const Field = ({ label, value }) => {
    if (!value) return null
    return (
      <div>
        <div style={{ fontSize: 10.5, color: TOKENS.s500, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: TOKENS.s900, lineHeight: 1.5 }}>{value}</div>
      </div>
    )
  }

  const statusColors = {
    awaiting_review: { bg: '#FEF3C7', fg: '#92400E' },
    info_requested:  { bg: '#DBEAFE', fg: '#1E40AF' },
    accepted:        { bg: '#D1FAE5', fg: '#065F46' },
    declined:        { bg: '#F3F4F6', fg: '#374151' },
  }
  const sc = statusColors[req.status] || statusColors.awaiting_review

  return (
    <>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: TOKENS.crimson, fontSize: 12.5, fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0,
      }}>
        ‹ Back to all requests
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Main detail column */}
        <div className="card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h2 className="serif" style={{ fontSize: 24, color: TOKENS.s900, margin: '0 0 4px' }}>
                {req.studentFirstName} {req.studentLastName}
              </h2>
              <div style={{ fontSize: 12.5, color: TOKENS.s500, fontFamily: 'monospace' }}>{req.requestRef}</div>
            </div>
            <span style={{
              padding: '5px 14px', borderRadius: 99, background: sc.bg, color: sc.fg,
              fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
            }}>{req.status.replace('_', ' ')}</span>
          </div>

          <Section title="Student">
            <Field label="Full name" value={`${req.studentFirstName} ${req.studentLastName}`}/>
            <Field label="Date of birth" value={req.studentDOB}/>
            <Field label="Grade level" value={req.studentGrade}/>
            <Field label="Current school" value={req.currentSchool}/>
            <Field label="Student email" value={req.studentEmail}/>
            <Field label="Home language(s)" value={req.studentLanguages}/>
          </Section>
          {req.learningNeeds && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10.5, color: TOKENS.s500, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Learning needs</div>
              <div style={{ fontSize: 13, color: TOKENS.s900, lineHeight: 1.6, background: TOKENS.cream, padding: '10px 14px', borderRadius: 8 }}>{req.learningNeeds}</div>
            </div>
          )}

          <Section title="Parent / Guardian">
            <Field label="Name" value={`${req.parent1FirstName} ${req.parent1LastName} (${req.parent1Relationship})`}/>
            <Field label="Email" value={<a href={`mailto:${req.parent1Email}`} style={{ color: TOKENS.crimson }}>{req.parent1Email}</a>}/>
            <Field label="Phone" value={req.parent1Phone}/>
            <Field label="Preferred contact" value={req.preferredContact}/>
            <Field label="Preferred time" value={req.preferredContactTime}/>
            {req.hasParent2 && (
              <Field label="Second parent" value={`${req.parent2FirstName} ${req.parent2LastName} (${req.parent2Relationship}) — ${req.parent2Email || ''} ${req.parent2Phone || ''}`}/>
            )}
          </Section>

          <Section title="Location">
            <Field label="Country" value={req.countryIso === 'OTHER' ? 'Other (remote)' : req.countryIso}/>
            <Field label="State / Province" value={req.stateProvince}/>
            <Field label="City" value={req.city}/>
            <Field label="Timezone" value={req.timezone}/>
          </Section>

          <Section title="Academic">
            <Field label="Curriculum interest" value={(req.curriculumInterest || []).join(', ')}/>
            <Field label="Target university region" value={(req.targetUniversity || []).join(', ')}/>
            <Field label="Why considering Smartious" value={(req.whyConsidering || []).join(', ')}/>
            <Field label="Preferred schedule" value={req.preferredSchedule}/>
          </Section>

          <Section title="Additional">
            <Field label="How they heard about us" value={req.howDidYouHear}/>
          </Section>
          {req.additionalInfo && (
            <div>
              <div style={{ fontSize: 10.5, color: TOKENS.s500, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Additional info</div>
              <div style={{ fontSize: 13, color: TOKENS.s900, lineHeight: 1.6, background: TOKENS.cream, padding: '10px 14px', borderRadius: 8 }}>{req.additionalInfo}</div>
            </div>
          )}
        </div>

        {/* Action sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.s900, marginBottom: 14 }}>Actions</div>

            {actionPanel ? (
              <div>
                <div style={{ fontSize: 11.5, color: TOKENS.s700, fontWeight: 600, marginBottom: 8 }}>
                  {actionPanel === 'info_requested' ? 'What information do you need?' : 'Reason for decline (optional, sent to parent)'}
                </div>
                <textarea value={actionMessage} onChange={e => setActionMessage(e.target.value)}
                  rows={4} placeholder={actionPanel === 'info_requested'
                    ? 'e.g. Could you share a recent school report or recent grades for...'
                    : 'Optional — explain why, or leave blank for a generic message.'}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '9px 11px',
                    borderRadius: 7, border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
                    fontSize: 12.5, fontFamily: 'inherit', resize: 'vertical', marginBottom: 10,
                  }}/>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setStatus(actionPanel, actionMessage)} disabled={submittingAction}
                    style={{
                      flex: 1, background: TOKENS.crimson, color: '#fff', border: 'none',
                      padding: '9px 0', borderRadius: 7, fontSize: 12.5, fontWeight: 700,
                      cursor: submittingAction ? 'not-allowed' : 'pointer', opacity: submittingAction ? .6 : 1,
                    }}>
                    {submittingAction ? 'Sending...' : 'Send & update'}
                  </button>
                  <button onClick={() => { setActionPanel(null); setActionMessage('') }} disabled={submittingAction}
                    style={{
                      background: 'transparent', color: TOKENS.s500, border: '1px solid ' + (TOKENS.line || '#E8E2D6'),
                      padding: '9px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                    }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => setStatus('accepted')}
                  disabled={['accepted','payment_pending','payment_received'].includes(req.status)}
                  style={{
                    background: '#059669', color: '#fff', border: 'none',
                    padding: '10px 0', borderRadius: 7, fontSize: 12.5, fontWeight: 700,
                    cursor: ['accepted','payment_pending','payment_received'].includes(req.status) ? 'not-allowed' : 'pointer',
                    opacity: ['accepted','payment_pending','payment_received'].includes(req.status) ? .5 : 1,
                  }}>
                  Accept & send invoice
                </button>
                <div style={{ fontSize: 10.5, color: TOKENS.s500, lineHeight: 1.4, marginTop: -4, marginBottom: 2 }}>
                  Generates a Paystack payment link and emails the family.
                </div>
                {req.status === 'payment_pending' && req.paystackAuthUrl && (
                  <a href={req.paystackAuthUrl} target="_blank" rel="noopener noreferrer" style={{
                    display: 'block', textAlign: 'center', fontSize: 11.5, color: TOKENS.crimson,
                    marginTop: 2, wordBreak: 'break-all',
                  }}>View payment link ↗</a>
                )}
                {req.status === 'payment_received' && (
                  <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 700, marginTop: 2 }}>
                    ✓ Payment received
                    {req.paidAt && ` · ${new Date(req.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                  </div>
                )}
                <button onClick={() => setActionPanel('info_requested')} disabled={req.status === 'accepted' || req.status === 'declined'}
                  style={{
                    background: '#fff', color: '#1E40AF', border: '1.5px solid #1E40AF',
                    padding: '10px 0', borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                    opacity: (req.status === 'accepted' || req.status === 'declined') ? .5 : 1,
                  }}>
                  Request more info
                </button>
                <button onClick={() => setActionPanel('declined')} disabled={req.status === 'accepted'}
                  style={{
                    background: '#fff', color: '#B91C1C', border: '1.5px solid #E8E2D6',
                    padding: '10px 0', borderRadius: 7, fontSize: 12.5, fontWeight: 700,
                    cursor: req.status === 'accepted' ? 'not-allowed' : 'pointer',
                    opacity: req.status === 'accepted' ? .5 : 1,
                  }}>
                  Decline
                </button>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.s900, marginBottom: 10 }}>Internal notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={5} placeholder="Notes visible only to admin staff..."
              style={{
                width: '100%', boxSizing: 'border-box', padding: '9px 11px',
                borderRadius: 7, border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
                fontSize: 12.5, fontFamily: 'inherit', resize: 'vertical', marginBottom: 10,
              }}/>
            <button onClick={saveNotes} disabled={savingNotes}
              style={{
                width: '100%', background: TOKENS.crimson, color: '#fff', border: 'none',
                padding: '9px 0', borderRadius: 7, fontSize: 12.5, fontWeight: 700,
                cursor: savingNotes ? 'not-allowed' : 'pointer', opacity: savingNotes ? .6 : 1,
              }}>
              {savingNotes ? 'Saving...' : 'Save notes'}
            </button>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: TOKENS.s500, lineHeight: 1.6 }}>
              <div style={{ marginBottom: 6 }}>
                <strong style={{ color: TOKENS.s900 }}>Submitted</strong><br/>
                {new Date(req.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              {req.reviewedAt && (
                <div>
                  <strong style={{ color: TOKENS.s900 }}>Last reviewed</strong><br/>
                  {new Date(req.reviewedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default AssessmentModule
