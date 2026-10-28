/**
 * PartnershipsPage — the public /partnerships page, rendered inside
 * LandingPage. A partner picks a type (university scholarships, exam
 * centres, training providers, co-curricular providers and the rest of
 * PARTNERSHIP_TYPES in data/careers.js); the form then asks that type's
 * own questions, so every enquiry arrives with what we need to act on it.
 * With `typeKey` it renders that type's own page (/partnerships/<slug>,
 * content in data/partnershipPages.js) with the form preset to the type.
 * Backend: routes/partnerships.js.
 */
import { useState } from 'react'
import { api } from '../context/ctx.jsx'
import { PARTNERSHIP_TYPES } from '../data/careers.js'
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
    if (!f.consent) { setErr('Please confirm that we may contact you about this enquiry.'); return }
    setBusy(true)
    try {
      const clean = Object.fromEntries(Object.entries(details).filter(([, v]) => v !== '' && v != null && !(Array.isArray(v) && !v.length)))
      const r = await api.post('/partnerships', { type, ...f, details: clean })
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
              <Input label="What do you have in mind?"><textarea style={{ ...field, minHeight: 120 }} value={f.message} onChange={e => set('message', e.target.value)} maxLength={4000} /></Input>
              <Input label="How did you hear about us?"><input style={field} value={f.howHeard} onChange={e => set('howHeard', e.target.value)} /></Input>
              {/* Honeypot: hidden from people, filled by bots. */}
              <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website2} onChange={e => set('website2', e.target.value)} style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14.5, color: C.ink }}>
                <input type="checkbox" style={{ marginTop: 4 }} checked={f.consent} onChange={e => set('consent', e.target.checked)} />
                Smartious may store these details and contact me about this enquiry.
              </label>
              {err && <div role="alert" style={{ color: C.red, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 12px', fontSize: 14 }}>{err}</div>}
              <div><button type="submit" disabled={busy} style={{ padding: '13px 26px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', background: C.cr, color: '#fff', cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit' }}>{busy ? 'Sending…' : 'Send enquiry'}</button></div>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
