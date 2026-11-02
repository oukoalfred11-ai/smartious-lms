/**
 * LeadsModule.jsx — every lead (assessment requests and CRM enquiries)
 * in one list, filtered by converted / not converted, and premium email
 * campaigns to the families who have not enrolled. Backend: routes/leads.js.
 *
 * Converted = the family now has a student account (or the CRM enquiry is
 * marked enrolled). Campaigns only ever go to NOT-converted leads, one email
 * per address, skipping unsubscribed, bounced and recently emailed families.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { DOSSpinner, PSection } from '../shared/ui.jsx'

const box = { background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: '14px 16px' }
const inp = { border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', background: '#fff' }
const btn = (primary, small) => ({ border: primary ? 'none' : `1px solid ${TOKENS.line}`, background: primary ? TOKENS.crimson : '#fff', color: primary ? '#fff' : TOKENS.s900, borderRadius: 8, padding: small ? '6px 10px' : '9px 14px', fontWeight: 800, fontSize: small ? 12 : 13, cursor: 'pointer' })
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'
const STAGE_TONE = { payment_pending: ['#8A5A00', '#FFF4DC'], payment_received: ['#1C6B3A', '#E5F5EA'], declined: ['#7A7A7A', '#F1F1F1'], lost: ['#7A7A7A', '#F1F1F1'], unqualified: ['#7A7A7A', '#F1F1F1'] }

export default function LeadsModule({ toast }) {
  const [f, setF] = useState({ converted: 'no', source: 'all', stage: 'all', country: '', from: '', to: '', q: '' })
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [sel, setSel] = useState(() => new Set())
  const [composer, setComposer] = useState(false)
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setPage(1); setSel(new Set()) }

  const load = useCallback(() => {
    setData(d => d && { ...d, loading: true })
    api.get('/leads', { params: { ...f, page } })
      .then(r => setData(r.data?.data || null))
      .catch(e => { toast?.error?.(e?.response?.data?.message || 'Could not load leads.'); setData({ items: [], counts: {}, countries: [], stages: {} }) })
  }, [f, page, toast])
  useEffect(() => { const t = setTimeout(load, f.q ? 300 : 0); return () => clearTimeout(t) }, [load, f.q])

  const c = data?.counts || {}
  const exportCsv = async () => {
    try {
      const r = await api.get('/leads/export.csv', { params: f, responseType: 'blob' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.data], { type: 'text/csv' })); a.download = 'leads.csv'; a.click()
    } catch { toast?.error?.('Could not export.') }
  }
  const toggle = (id) => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const pageIds = (data?.items || []).filter(l => !l.converted).map(l => l.id)

  return (
    <div>
      <PSection tag="Admissions" title="Leads" em="& Campaigns"
        sub="Every assessment request and CRM enquiry in one list. Converted means the family now has a student at Smartious; paying or being invoiced for the assessment is not enough. Email the families who have not enrolled with premium templates." />

      {/* Converted / not converted: the main switch */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginBottom: 12 }}>
        {[
          ['no', 'Not converted', c.notConverted, TOKENS.crimson, () => { setF(p => ({ ...p, converted: 'no', stage: p.stage === 'invoiced_not_enrolled' ? 'all' : p.stage })); setPage(1); setSel(new Set()) }],
          ['yes', 'Converted', c.converted, '#1C6B3A', () => { setF(p => ({ ...p, converted: 'yes', stage: p.stage === 'invoiced_not_enrolled' ? 'all' : p.stage })); setPage(1); setSel(new Set()) }],
          ['all', 'All leads', c.all, TOKENS.s900, () => { setF(p => ({ ...p, converted: 'all', stage: p.stage === 'invoiced_not_enrolled' ? 'all' : p.stage })); setPage(1); setSel(new Set()) }],
          ['inv', 'Invoiced, never enrolled', c.invoicedNotEnrolled, '#8A5A00', () => { setF(p => ({ ...p, converted: 'no', stage: 'invoiced_not_enrolled' })); setPage(1) }],
        ].map(([k, label, n, col, on]) => {
          const active = k === 'inv' ? f.stage === 'invoiced_not_enrolled' : f.converted === k && f.stage !== 'invoiced_not_enrolled'
          return (
            <button key={k} type="button" onClick={on} style={{ ...box, textAlign: 'left', cursor: 'pointer', borderColor: active ? col : TOKENS.line, boxShadow: active ? `0 0 0 2px ${col}22` : 'none' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: col }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: TOKENS.s900 }}>{n ?? '—'}</div>
            </button>
          )
        })}
      </div>

      <div style={{ ...box, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <input placeholder="Search name, email, phone, reference" value={f.q} onChange={e => set('q', e.target.value)} style={{ ...inp, flex: '1 1 220px' }} />
        <select value={f.source} onChange={e => set('source', e.target.value)} style={inp}>
          <option value="all">All sources</option><option value="assessment">Assessment requests</option><option value="inquiry">CRM enquiries</option>
        </select>
        <select value={f.stage} onChange={e => set('stage', e.target.value)} style={inp}>
          <option value="all">Any stage</option>
          <option value="invoiced_not_enrolled">Invoiced or paid, never enrolled</option>
          <optgroup label="Assessment requests">{Object.entries(data?.stages?.assessment || {}).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</optgroup>
          <optgroup label="CRM enquiries">{Object.entries(data?.stages?.inquiry || {}).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</optgroup>
        </select>
        <select value={f.country} onChange={e => set('country', e.target.value)} style={inp}>
          <option value="">All countries</option>{(data?.countries || []).map(x => <option key={x}>{x}</option>)}
        </select>
        <input type="date" value={f.from} onChange={e => set('from', e.target.value)} style={inp} title="Received from" />
        <input type="date" value={f.to} onChange={e => set('to', e.target.value)} style={inp} title="Received to" />
        <button type="button" onClick={exportCsv} style={btn(false)}>Export CSV</button>
        <button type="button" onClick={() => setComposer(true)} disabled={f.converted === 'yes'} style={{ ...btn(true), opacity: f.converted === 'yes' ? 0.5 : 1 }}
          title={f.converted === 'yes' ? 'Campaigns only go to families who have not enrolled' : ''}>
          ✉ Email {sel.size ? `${sel.size} selected` : 'these families'}
        </button>
      </div>

      <div style={box}>
        {!data ? <DOSSpinner /> : !data.items.length ? <p style={{ color: TOKENS.s500, fontSize: 13.5 }}>No leads match these filters.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: TOKENS.s500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  <th style={{ padding: 6 }}><input type="checkbox" checked={pageIds.length > 0 && pageIds.every(id => sel.has(id))} onChange={e => setSel(s => { const n = new Set(s); pageIds.forEach(id => e.target.checked ? n.add(id) : n.delete(id)); return n })} /></th>
                  <th style={{ padding: 6 }}>Family</th><th style={{ padding: 6 }}>Source</th><th style={{ padding: 6 }}>Stage</th>
                  <th style={{ padding: 6 }}>Country</th><th style={{ padding: 6 }}>Received</th><th style={{ padding: 6 }}>Last emailed</th><th style={{ padding: 6 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(l => {
                  const [tc, tb] = STAGE_TONE[l.stage] || [TOKENS.s900, '#F4F1EE']
                  return (
                    <tr key={l.type + l.id} style={{ borderTop: `1px solid ${TOKENS.line}` }}>
                      <td style={{ padding: 6 }}>{!l.converted && <input type="checkbox" checked={sel.has(l.id)} onChange={() => toggle(l.id)} />}</td>
                      <td style={{ padding: 6 }}>
                        <div style={{ fontWeight: 700, color: TOKENS.s900 }}>{l.parentName || '—'}{l.childName ? <span style={{ fontWeight: 500, color: TOKENS.s500 }}> · {l.childName}{l.grade ? ` (${l.grade})` : ''}</span> : null}</div>
                        <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{[l.email, l.phone].filter(Boolean).join(' · ')}</div>
                      </td>
                      <td style={{ padding: 6, fontSize: 12 }}>{l.type === 'assessment' ? 'Assessment' : 'CRM'}{l.ref ? <div style={{ fontSize: 11, color: TOKENS.s500 }}>{l.ref}</div> : null}</td>
                      <td style={{ padding: 6 }}><span style={{ background: tb, color: tc, borderRadius: 99, padding: '3px 9px', fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{l.stageLabel}</span>{l.invoiceNo ? <div style={{ fontSize: 11, color: TOKENS.s500 }}>{l.invoiceNo}</div> : null}</td>
                      <td style={{ padding: 6 }}>{l.country || '—'}</td>
                      <td style={{ padding: 6, whiteSpace: 'nowrap' }}>{fmt(l.createdAt)}</td>
                      <td style={{ padding: 6, whiteSpace: 'nowrap', color: TOKENS.s500 }}>{fmt(l.lastEmailedAt)}</td>
                      <td style={{ padding: 6 }}>{l.converted
                        ? <span title={l.convertedHow} style={{ color: '#1C6B3A', fontWeight: 800, fontSize: 12 }}>✓ Converted</span>
                        : <span style={{ color: TOKENS.crimson, fontWeight: 800, fontSize: 12 }}>Not converted</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {data.pages > 1 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', marginTop: 10, fontSize: 12.5 }}>
                <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={btn(false, true)}>‹ Prev</button>
                Page {page} of {data.pages} · {data.total} leads
                <button type="button" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)} style={btn(false, true)}>Next ›</button>
              </div>
            )}
          </div>
        )}
      </div>

      <Campaigns toast={toast} />
      {composer && <Composer toast={toast} filters={f} ids={[...sel]} reachable={sel.size || c.reachable || 0} onClose={() => setComposer(false)} onSent={() => { setComposer(false); setSel(new Set()); load() }} />}
    </div>
  )
}

// ── Compose and send a campaign ─────────────────────────────
function Composer({ toast, filters, ids, reachable, onClose, onSent }) {
  const [templates, setTemplates] = useState([])
  const [tpl, setTpl] = useState(filters.stage === 'invoiced_not_enrolled' ? 'complete' : 'intake')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [cooldown, setCooldown] = useState(7)
  const [preview, setPreview] = useState({ subject: '', html: '' })
  const [sampleType, setSampleType] = useState(filters.source === 'inquiry' ? 'inquiry' : 'assessment')
  const [busy, setBusy] = useState('')
  useEffect(() => { api.get('/leads/templates').then(r => setTemplates(r.data?.data || [])).catch(() => {}) }, [])
  const t = templates.find(x => x.key === tpl)
  useEffect(() => {
    const h = setTimeout(() => {
      api.post('/leads/preview', { template: tpl, subject, message, sampleType }).then(r => setPreview(r.data?.data || {})).catch(() => {})
    }, 300)
    return () => clearTimeout(h)
  }, [tpl, subject, message, sampleType])

  const send = async (test) => {
    if (!test && !window.confirm(`Send "${preview.subject}" to up to ${reachable} famil${reachable === 1 ? 'y' : 'ies'} who have not enrolled? Families who unsubscribed, bounced or were emailed in the last ${cooldown} days are skipped.`)) return
    setBusy(test ? 'test' : 'send')
    try {
      const r = await api.post('/leads/send', { template: tpl, subject, message, filters, ids, cooldownDays: cooldown, test, sampleType })
      toast?.ok?.(r.data?.message || 'Sent.')
      if (!test) onSent()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not send.') }
    finally { setBusy('') }
  }

  return (
    <div role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(20,14,10,.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
      <div style={{ background: '#FBFAF5', borderRadius: 14, width: 'min(1120px, 100%)', maxHeight: '94vh', overflow: 'auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)', gap: 0 }} className="leads-composer">
        <div style={{ padding: 20, display: 'grid', gap: 12, alignContent: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: TOKENS.s900, flex: 1 }}>Email families who have not enrolled</div>
            <button type="button" onClick={onClose} style={btn(false, true)}>✕</button>
          </div>
          <div style={{ fontSize: 12.5, color: TOKENS.s500 }}>
            Goes to <b style={{ color: TOKENS.s900 }}>up to {reachable}</b> {ids.length ? 'selected ' : ''}families (one email per address). Converted families are never included.
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {templates.map(x => (
              <button key={x.key} type="button" onClick={() => { setTpl(x.key); setSubject('') }}
                style={{ textAlign: 'left', border: `1.5px solid ${tpl === x.key ? TOKENS.crimson : TOKENS.line}`, background: tpl === x.key ? '#FFF6F7' : '#fff', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: TOKENS.s900 }}>{x.label}</div>
                <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{x.audience}</div>
              </button>
            ))}
          </div>
          <label style={{ display: 'grid', gap: 4, fontSize: 11.5, fontWeight: 700, color: TOKENS.s500 }}>Subject{tpl !== 'custom' ? ' (leave blank for the template\'s)' : ''}
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder={t?.subject || ''} maxLength={160} style={inp} />
          </label>
          <label style={{ display: 'grid', gap: 4, fontSize: 11.5, fontWeight: 700, color: TOKENS.s500 }}>{tpl === 'custom' ? 'Your message' : 'Personal note (optional, shown in a highlighted box)'}
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} maxLength={4000} style={{ ...inp, resize: 'vertical' }}
              placeholder={tpl === 'custom' ? 'Write your message…' : 'e.g. We have two places left in our Year 9 Cambridge class.'} />
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5 }}>
            Skip families emailed in the last
            <input type="number" min="0" max="60" value={cooldown} onChange={e => setCooldown(Math.max(0, Math.min(60, +e.target.value || 0)))} style={{ ...inp, width: 64 }} /> days
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => send(true)} disabled={!!busy} style={btn(false)}>{busy === 'test' ? 'Sending…' : 'Send me a test'}</button>
            <button type="button" onClick={() => send(false)} disabled={!!busy || !reachable} style={btn(true)}>{busy === 'send' ? 'Starting…' : `Send to ${reachable} famil${reachable === 1 ? 'y' : 'ies'}`}</button>
          </div>
          <div style={{ fontSize: 11, color: TOKENS.s500, lineHeight: 1.5 }}>
            Every email has an unsubscribe link and is sent one at a time (about one a second), so a large campaign takes a few minutes; progress shows under Campaigns. Applicants get a "Continue my application" button; enquiries get "Book your child's assessment".
          </div>
        </div>
        <div style={{ background: '#EFE9DD', padding: 14, display: 'grid', gap: 8, alignContent: 'start', borderLeft: `1px solid ${TOKENS.line}` }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
            <b style={{ flex: 1, color: TOKENS.s900 }}>Preview: {preview.subject}</b>
            {[['assessment', 'Applicant'], ['inquiry', 'Enquiry']].map(([k, l]) => <button key={k} type="button" onClick={() => setSampleType(k)} style={{ ...btn(sampleType === k, true) }}>{l}</button>)}
          </div>
          <iframe title="Email preview" srcDoc={preview.html} sandbox="" style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 10, background: '#fff' }} />
        </div>
      </div>
      <style>{'@media (max-width: 860px) { .leads-composer { grid-template-columns: 1fr !important; } }'}</style>
    </div>
  )
}

// ── Campaign history with live progress ─────────────────────
function Campaigns({ toast }) {
  const [list, setList] = useState(null)
  const timer = useRef(null)
  const load = useCallback(() => {
    api.get('/leads/campaigns').then(r => setList(r.data?.data || [])).catch(() => setList([]))
  }, [])
  useEffect(() => { load() }, [load])
  const sending = useMemo(() => (list || []).some(c => c.status === 'sending' && Date.now() - new Date(c.updatedAt) < 15 * 60e3), [list])
  useEffect(() => {
    if (!sending) return
    timer.current = setInterval(load, 4000)
    return () => clearInterval(timer.current)
  }, [sending, load])
  if (!list || !list.length) return null
  return (
    <div style={{ ...box, marginTop: 14 }}>
      <div style={{ fontWeight: 900, color: TOKENS.s900, marginBottom: 8 }}>Campaigns</div>
      {list.map(c => {
        const stale = c.status === 'sending' && Date.now() - new Date(c.updatedAt) > 15 * 60e3
        const done = c.sent + c.failed
        return (
          <div key={c._id} style={{ borderTop: `1px solid ${TOKENS.line}`, padding: '8px 0', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', fontSize: 12.5 }}>
            <div style={{ flex: '1 1 260px' }}>
              <div style={{ fontWeight: 700, color: TOKENS.s900 }}>{c.subject}</div>
              <div style={{ color: TOKENS.s500 }}>{fmt(c.createdAt)} · {c.sentByName} · {c.template}</div>
            </div>
            <div style={{ flex: '0 1 220px' }}>
              <div style={{ height: 6, background: TOKENS.line, borderRadius: 99, overflow: 'hidden' }}><div style={{ width: (c.total ? 100 * done / c.total : 0) + '%', height: '100%', background: c.failed ? '#B45309' : '#1C6B3A' }} /></div>
              <div style={{ color: TOKENS.s500, marginTop: 3 }}>
                {c.sent} sent{c.failed ? `, ${c.failed} failed` : ''} of {c.total}{c.skipped ? ` · ${c.skipped} skipped` : ''} · {stale ? 'interrupted (server restarted)' : c.status === 'sending' ? 'sending…' : c.status}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
