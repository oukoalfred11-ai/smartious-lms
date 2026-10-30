/**
 * PartnershipsPage — the public /partnerships page, rendered inside
 * LandingPage. A partner picks a type (university scholarships, exam
 * centres, training providers, co-curricular providers and the rest of
 * PARTNERSHIP_TYPES in data/careers.js); the form then asks that type's
 * own questions, so every enquiry arrives with what we need to act on it.
 * With `typeKey` it renders that type's own page (/partnerships/<slug>,
 * content in data/partnershipPages.js) with the form preset to the type.
 * Every organisation must upload its government registration, operating
 * licence and proof of operations (PARTNER_DOCS) before it can send the
 * enquiry; files go straight to private storage via a signed upload link.
 * Backend: routes/partnerships.js.
 */
import { useState } from 'react'
import { api } from '../context/ctx.jsx'
import { PARTNERSHIP_TYPES, PARTNER_DOCS } from '../data/careers.js'
import { PARTNERSHIP_PAGES } from '../data/partnershipPages.js'

const C = { cr: '#8B1A2E', gold: '#C9973A', ink: '#080C14', sl: '#2E3D55', mut: '#6B7280', bone: '#FDFAF4', bone2: '#F8F2E6', line: '#E8DFCC', green: '#15803D', red: '#B91C1C' }
const field = { width: '100%', boxSizing: 'border-box', border: `1px solid ${C.line}`, borderRadius: 9, padding: '11px 12px', fontSize: 15, fontFamily: 'inherit', color: C.ink, background: '#fff' }
const lbl = { display: 'block', fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 6 }

const TYPE_LABEL = (k) => PARTNERSHIP_TYPES.find(t => t.key === k)?.label || ''

const WHY = [
  ['Students in more than forty countries', 'Cambridge, Pearson Edexcel, IB and AP learners, taught live, from Primary to A Level.'],
  ['A school, not a marketplace', 'One academic team, one timetable and one record per student, so a partnership reaches real learners and is measured.'],
  ['Structured to work with', 'A named contact, a reference for every enquiry, and a clear route from conversation to agreement.'],
]

const ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp'
const MAX_MB = 15

function put(url, file, onPct) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.upload.onprogress = e => { if (e.total) onPct(Math.round(100 * e.loaded / e.total)) }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed (' + xhr.status + '). Please try again.')))
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'))
    xhr.send(file)
  })
}

// One document slot: pick a file, it uploads at once, with progress.
function DocSlot({ d, value, onPick, onClear }) {
  const v = value || {}
  return (
    <div style={{ border: `1px solid ${v.status === 'done' ? '#A7F3D0' : v.status === 'error' ? '#FECACA' : C.line}`, background: v.status === 'done' ? '#F0FDF4' : '#fff', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px' }}>
          <div style={{ fontWeight: 800, fontSize: 14.5, color: C.ink }}>{d.label}{d.required ? <span style={{ color: C.cr }}> *</span> : <span style={{ color: C.mut, fontWeight: 600 }}> (optional)</span>}</div>
          <div style={{ fontSize: 12.5, color: C.mut, lineHeight: 1.5, marginTop: 2 }}>{d.hint}</div>
        </div>
        <label style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${C.cr}`, color: C.cr, fontWeight: 800, fontSize: 13, cursor: v.status === 'uploading' ? 'wait' : 'pointer', whiteSpace: 'nowrap', background: '#fff' }}>
          {v.status === 'done' ? 'Replace' : 'Choose file'}
          <input type="file" accept={ACCEPT} hidden disabled={v.status === 'uploading'} onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) onPick(file) }} />
        </label>
      </div>
      {v.status && (
        <div style={{ marginTop: 8, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {v.status === 'uploading' && <><div style={{ flex: '1 1 160px', height: 6, background: C.line, borderRadius: 99, overflow: 'hidden' }}><div style={{ width: (v.pct || 0) + '%', height: '100%', background: C.cr }} /></div><span style={{ color: C.mut }}>{v.pct || 0}%</span></>}
          {v.status === 'done' && <><span style={{ color: C.green, fontWeight: 800 }}>✓ Uploaded</span><span style={{ color: C.sl, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{v.filename}</span>
            <button type="button" onClick={onClear} style={{ background: 'none', border: 'none', color: C.mut, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 12.5 }}>Remove</button></>}
          {v.status === 'error' && <span style={{ color: C.red }}>{v.error}</span>}
        </div>
      )}
    </div>
  )
}

function Input({ label, req, children }) {
  return <label style={{ display: 'block' }}><span style={lbl}>{label}{req && <span style={{ color: C.cr }}> *</span>}</span>{children}</label>
}

function DetailField({ fd, value, onChange }) {
  if (fd.type === 'select') return (
    <select style={field} value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">Choose…</option>{fd.options.map(o => <option key={o}>{o}</option>)}
    </select>
  )
  if (fd.type === 'multi') {
    const v = Array.isArray(value) ? value : []
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {fd.options.map(o => {
          const on = v.includes(o)
          return <button type="button" key={o} onClick={() => onChange(on ? v.filter(x => x !== o) : [...v, o])}
            style={{ padding: '7px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${on ? C.cr : C.line}`, background: on ? '#FBF0F2' : '#fff', color: on ? C.cr : C.sl }}>{on ? '✓ ' : ''}{o}</button>
        })}
      </div>
    )
  }
  if (fd.type === 'textarea') return <textarea style={{ ...field, minHeight: 90 }} value={value || ''} onChange={e => onChange(e.target.value)} />
  return <input style={field} type={fd.type === 'number' ? 'number' : fd.type === 'date' ? 'date' : 'text'} min={fd.type === 'number' ? 0 : undefined}
    placeholder={fd.placeholder || ''} value={value ?? ''} onChange={e => onChange(fd.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)} />
}

export default function PartnershipsPage({ typeKey = '' }) {
  const [type, setType] = useState(typeKey)
  const [f, setF] = useState({ organisation: '', website: '', country: '', city: '', contactName: '', contactRole: '', email: '', phone: '', message: '', howHeard: '', consent: false, website2: '' })
  const [details, setDetails] = useState({})
  const [docs, setDocs] = useState({})     // category → { status, pct, error, key, sig, filename, mimeType, sizeBytes }
  const setDoc = (k, v) => setDocs(d => ({ ...d, [k]: v }))
  const uploadDoc = async (category, file) => {
    if (file.size > MAX_MB * 1024 * 1024) { setDoc(category, { status: 'error', error: `Each document must be under ${MAX_MB} MB.` }); return }
    setDoc(category, { status: 'uploading', pct: 0, filename: file.name })
    try {
      const r = await api.post('/partnerships/upload', { category, fileName: file.name, mimeType: file.type, fileSize: file.size })
      const { uploadUrl, key, sig } = r.data.data
      await put(uploadUrl, file, pct => setDoc(category, { status: 'uploading', pct, filename: file.name }))
      setDoc(category, { status: 'done', key, sig, filename: file.name, mimeType: file.type, sizeBytes: file.size })
    } catch (x) {
      setDoc(category, { status: 'error', error: x?.response?.data?.message || x.message || 'Upload failed. Please try again.' })
    }
  }
  const missingDocs = PARTNER_DOCS.filter(d => d.required && docs[d.key]?.status !== 'done')
  const uploading = Object.values(docs).some(v => v?.status === 'uploading')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(null)
  const t = PARTNERSHIP_TYPES.find(x => x.key === type)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const choose = (k, scroll = true) => { setType(k); setDetails({}); setErr(''); if (scroll) setTimeout(() => document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30) }
  const page = typeKey ? PARTNERSHIP_PAGES[typeKey] : null

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!type) { setErr('Choose the kind of partnership.'); return }
    if (uploading) { setErr('Wait for your documents to finish uploading.'); return }
    if (missingDocs.length) { setErr('Upload your ' + missingDocs.map(d => d.label.toLowerCase()).join(', ') + '.'); document.getElementById('partner-docs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    if (!f.consent) { setErr('Please confirm that we may contact you about this enquiry.'); return }
    setBusy(true)
    try {
      const clean = Object.fromEntries(Object.entries(details).filter(([, v]) => v !== '' && v != null && !(Array.isArray(v) && !v.length)))
      const documents = Object.entries(docs).filter(([, v]) => v?.status === 'done').map(([category, v]) => ({ category, key: v.key, sig: v.sig, filename: v.filename, mimeType: v.mimeType, sizeBytes: v.sizeBytes }))
      const r = await api.post('/partnerships', { type, ...f, details: clean, documents })
      setDone(r.data.data.ref)
    } catch (x) {
      const d = x?.response?.data
      setErr(d?.errors?.length ? d.errors.join(' ') : (d?.message || 'Could not send your enquiry. Please try again.'))
    } finally { setBusy(false) }
  }

  const h2 = { fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 400, color: C.ink, margin: '0 0 12px', lineHeight: 1.15 }
  const card = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }
  const grid = (min) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: 14 })

  return (
    <main>
      <section style={{ background: `linear-gradient(135deg, ${C.ink} 0%, #1A2238 55%, ${C.cr} 140%)`, color: '#fff', padding: '72px 0 60px' }}>
        <div className="wrap" style={{ maxWidth: 980 }}>
          <div className="eyebrow" style={{ color: C.gold }}>{page ? <><a href="/partnerships" style={{ color: C.gold, textDecoration: 'none' }}>Partnerships</a> {'\u203A'} {TYPE_LABEL(typeKey)}</> : 'Partnerships'}</div>
          <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 'clamp(2.2rem,5vw,3.6rem)', fontWeight: 400, lineHeight: 1.08, margin: '8px 0 16px' }}>
            {page ? page.h1 : <>Partner with Smartious <em style={{ color: C.gold }}>to reach learners in more than forty countries</em></>}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,.82)', maxWidth: 760, margin: '0 0 26px' }}>
            {page ? page.intro : 'Universities offering scholarships, examination centres, teacher-training and co-curricular providers, schools, employers and more. Choose the kind of partnership below and tell us what you have in mind; every enquiry gets a reference and a named contact.'}
          </p>
          {page && <a href="#enquire" onClick={e => { e.preventDefault(); document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' }) }}
            style={{ display: 'inline-block', background: C.gold, color: C.ink, padding: '15px 28px', borderRadius: 10, fontWeight: 800, textDecoration: 'none' }}>Start an enquiry</a>}
        </div>
      </section>

      {page && (
        <section style={{ background: C.bone, padding: '56px 0' }}>
          <div className="wrap" style={{ maxWidth: 1100, display: 'grid', gap: 30 }}>
            <div>
              <h2 style={h2}>Who this partnership is for</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{page.forWho.map(w => <span key={w} style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 99, padding: '8px 14px', fontSize: 14, color: C.sl }}>{w}</span>)}</div>
            </div>
            <div>
              <h2 style={h2}>What partners get</h2>
              <div style={grid(250)}>{page.offer.map(([h, p]) => <div key={h} style={card}><div style={{ fontWeight: 800, color: C.ink, marginBottom: 6 }}>{h}</div><div style={{ fontSize: 14.5, color: C.sl, lineHeight: 1.65 }}>{p}</div></div>)}</div>
            </div>
            <div>
              <h2 style={h2}>How it works</h2>
              <div style={grid(220)}>{page.steps.map((st, i) => (
                <div key={i} style={card}><div style={{ width: 28, height: 28, borderRadius: '50%', background: C.cr, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, marginBottom: 8 }}>{i + 1}</div><div style={{ fontSize: 14.5, color: C.sl, lineHeight: 1.6 }}>{st}</div></div>
              ))}</div>
              <p style={{ fontSize: 15, color: C.sl, lineHeight: 1.7, marginTop: 16 }}><strong style={{ color: C.ink }}>What we ask of partners:</strong> {page.ask}</p>
            </div>
            <div>
              <h2 style={h2}>Questions partners ask</h2>
              <div style={{ display: 'grid', gap: 10 }}>{page.faqs.map(q => (
                <details key={q.q} style={{ ...card, padding: '14px 18px' }}><summary style={{ fontWeight: 700, color: C.ink, cursor: 'pointer' }}>{q.q}</summary><p style={{ fontSize: 14.5, color: C.sl, lineHeight: 1.7, margin: '10px 0 0' }}>{q.a}</p></details>
              ))}</div>
            </div>
            <div style={{ fontSize: 14, color: C.sl }}>
              Other partnerships: {PARTNERSHIP_TYPES.filter(pt => pt.key !== typeKey && PARTNERSHIP_PAGES[pt.key]).map((pt, i, a) => <span key={pt.key}><a href={'/partnerships/' + PARTNERSHIP_PAGES[pt.key].slug} style={{ color: C.cr }}>{pt.label}</a>{i < a.length - 1 ? ' \u00b7 ' : ''}</span>)}
            </div>
          </div>
        </section>
      )}

      {!page && <section style={{ background: C.bone, padding: '56px 0' }}>
        <div className="wrap" style={{ maxWidth: 1100 }}>
          <div style={{ ...grid(260), marginBottom: 34 }}>
            {WHY.map(([h, p]) => <div key={h} style={card}><div style={{ fontWeight: 800, color: C.ink, marginBottom: 6 }}>{h}</div><div style={{ fontSize: 14.5, color: C.sl, lineHeight: 1.65 }}>{p}</div></div>)}
          </div>
          <h2 style={h2}>Ways to partner</h2>
          <div style={grid(250)}>
            {PARTNERSHIP_TYPES.map(pt => {
              const pg = PARTNERSHIP_PAGES[pt.key]
              return (
                <div key={pt.key} style={{ ...card, display: 'flex', flexDirection: 'column', borderColor: type === pt.key ? C.cr : C.line }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: C.gold, marginBottom: 4 }}>{pt.short}</div>
                  {pg ? <a href={'/partnerships/' + pg.slug} style={{ fontWeight: 800, fontSize: 16, color: C.ink, marginBottom: 6, textDecoration: 'none' }}>{pt.label}</a>
                    : <div style={{ fontWeight: 800, fontSize: 16, color: C.ink, marginBottom: 6 }}>{pt.label}</div>}
                  <div style={{ fontSize: 14, color: C.sl, lineHeight: 1.6, flex: 1 }}>{pt.pitch}</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 13.5, fontWeight: 700 }}>
                    {pg && <a href={'/partnerships/' + pg.slug} style={{ color: C.cr }}>Learn more</a>}
                    <button type="button" onClick={() => choose(pt.key)} style={{ background: 'none', border: 'none', padding: 0, color: C.sl, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5 }}>Enquire</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>}

      <section id="enquire" style={{ background: C.bone2, padding: '56px 0' }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <h2 style={h2}>{page ? 'Start a ' + TYPE_LABEL(typeKey).toLowerCase() + ' partnership enquiry' : 'Start a partnership enquiry'}</h2>
          {done ? (
            <div style={{ ...card, borderColor: '#A7F3D0', background: '#ECFDF5' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.green, marginBottom: 8 }}>Enquiry received</div>
              <p style={{ fontSize: 15.5, color: C.sl, lineHeight: 1.7, margin: 0 }}>Thank you. Your reference is <strong>{done}</strong>, and we have emailed a confirmation. The right person on our team will reply, usually within five working days.</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ ...card, padding: 24, display: 'grid', gap: 16 }}>
              <Input label="Kind of partnership" req>
                <select style={field} value={type} onChange={e => choose(e.target.value)}>
                  <option value="">Choose…</option>
                  {PARTNERSHIP_TYPES.map(pt => <option key={pt.key} value={pt.key}>{pt.label}</option>)}
                </select>
                {t && <div style={{ fontSize: 13, color: C.mut, marginTop: 5 }}>{t.pitch}</div>}
              </Input>
              <div style={grid(220)}>
                <Input label="Organisation" req><input style={field} value={f.organisation} onChange={e => set('organisation', e.target.value)} autoComplete="organization" /></Input>
                <Input label="Website"><input style={field} value={f.website} onChange={e => set('website', e.target.value)} placeholder="https://" /></Input>
                <Input label="Country" req><input style={field} value={f.country} onChange={e => set('country', e.target.value)} autoComplete="country-name" /></Input>
                <Input label="City"><input style={field} value={f.city} onChange={e => set('city', e.target.value)} /></Input>
                <Input label="Your name" req><input style={field} value={f.contactName} onChange={e => set('contactName', e.target.value)} autoComplete="name" /></Input>
                <Input label="Your role"><input style={field} value={f.contactRole} onChange={e => set('contactRole', e.target.value)} autoComplete="organization-title" /></Input>
                <Input label="Email" req><input style={field} type="email" value={f.email} onChange={e => set('email', e.target.value)} autoComplete="email" /></Input>
                <Input label="Phone / WhatsApp"><input style={field} value={f.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" /></Input>
              </div>
              {t && t.fields.length > 0 && (
                <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14, display: 'grid', gap: 14 }}>
                  <div style={{ fontWeight: 800, color: C.cr, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase' }}>About your {t.label.toLowerCase()} offer</div>
                  <div style={grid(240)}>
                    {t.fields.map(fd => (
                      <div key={fd.key} style={fd.type === 'multi' || fd.type === 'textarea' ? { gridColumn: '1 / -1' } : undefined}>
                        <Input label={fd.label}><DetailField fd={fd} value={details[fd.key]} onChange={v => setDetails(d => ({ ...d, [fd.key]: v }))} /></Input>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div id="partner-docs" style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14, display: 'grid', gap: 10 }}>
                <div style={{ fontWeight: 800, color: C.cr, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase' }}>Verification documents</div>
                <p style={{ margin: 0, fontSize: 13.5, color: C.sl, lineHeight: 1.6 }}>
                  We partner only with registered organisations. Upload your government registration, your operating licence and a recent proof of operations; we cannot review an enquiry without them. PDF, Word or an image, up to {MAX_MB} MB each. Documents are kept private and seen only by our partnerships team.
                </p>
                {PARTNER_DOCS.map(d => <DocSlot key={d.key} d={d} value={docs[d.key]} onPick={file => uploadDoc(d.key, file)} onClear={() => setDoc(d.key, null)} />)}
              </div>
              <Input label="What do you have in mind?"><textarea style={{ ...field, minHeight: 120 }} value={f.message} onChange={e => set('message', e.target.value)} maxLength={4000} /></Input>
              <Input label="How did you hear about us?"><input style={field} value={f.howHeard} onChange={e => set('howHeard', e.target.value)} /></Input>
              {/* Honeypot: hidden from people, filled by bots. */}
              <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website2} onChange={e => set('website2', e.target.value)} style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14.5, color: C.ink }}>
                <input type="checkbox" style={{ marginTop: 4 }} checked={f.consent} onChange={e => set('consent', e.target.checked)} />
                Smartious may store these details and contact me about this enquiry.
              </label>
              {err && <div role="alert" style={{ color: C.red, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 12px', fontSize: 14 }}>{err}</div>}
              <div><button type="submit" disabled={busy || uploading} style={{ padding: '13px 26px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', background: C.cr, color: '#fff', cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit' }}>{busy ? 'Sending…' : uploading ? 'Uploading documents…' : 'Send enquiry'}</button>
                {missingDocs.length > 0 && <div style={{ fontSize: 12.5, color: C.mut, marginTop: 6 }}>Still needed: {missingDocs.map(d => d.label).join(', ')}.</div>}</div>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
