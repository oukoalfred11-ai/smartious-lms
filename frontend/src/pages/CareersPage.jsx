/**
 * CareersPage — the public /careers page, rendered inside LandingPage.
 *
 * A six-step application: about you, role and subjects, experience and
 * setup, documents (the teacher portal's personnel file), the demo lesson,
 * and the declarations. Step 1 starts a draft on the server
 * (POST /careers/applications/start) so documents and the demo recording
 * upload straight to storage as the applicant goes; the form is kept in
 * sessionStorage so a reload does not lose it. Backend: routes/careers.js.
 */
import { useEffect, useMemo, useState } from 'react'
import { api } from '../context/ctx.jsx'
import { POSITIONS, TEACHING_POSITIONS, APPLICANT_DOCS, CURRICULA, SUBJECTS, LEVELS, QUALIFICATIONS } from '../data/careers.js'

const C = { cr: '#8B1A2E', gold: '#C9973A', ink: '#080C14', sl: '#2E3D55', mut: '#6B7280', bone: '#FDFAF4', bone2: '#F8F2E6', line: '#E8DFCC', green: '#15803D', red: '#B91C1C' }
const STORE = 'smartious.careers.draft'
const STEPS = ['About you', 'Role & subjects', 'Experience', 'Documents', 'Demo lesson', 'Review & submit']
const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '', country: '', city: '', timezone: '', linkedin: '',
  position: 'online_teacher', roleTitle: '', employment: '', hoursPerWeek: '', availableFrom: '', expectedPay: '',
  curricula: [], subjects: [], levels: [],
  yearsExperience: '', yearsOnline: '', highestQualification: '', teachingQualification: '', registration: '', examinerExperience: '',
  setup: { internet: '', backupPower: false, headsetWebcam: false, pentablet: false },
  coverLetter: '', howHeard: '',
  documents: {},            // category → { file:{key,filename,mimeType,sizeBytes} } | { pending:true, note }
  demoLesson: { file: null, url: '', subject: '', level: '', topic: '', minutes: '', notes: '' },
  consents: { accurate: false, safeguarding: false, data: false },
}

const field = { width: '100%', boxSizing: 'border-box', border: `1px solid ${C.line}`, borderRadius: 9, padding: '11px 12px', fontSize: 15, fontFamily: 'inherit', color: C.ink, background: '#fff' }
const lbl = { display: 'block', fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 6 }
const hintS = { fontSize: 12.5, color: C.mut, marginTop: 4, lineHeight: 1.5 }

function Field({ label, hint, children, req }) {
  return <label style={{ display: 'block' }}><span style={lbl}>{label}{req && <span style={{ color: C.cr }}> *</span>}</span>{children}{hint && <div style={hintS}>{hint}</div>}</label>
}

function Chips({ options, value, onChange, max }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const on = value.includes(o)
        return (
          <button type="button" key={o} onClick={() => onChange(on ? value.filter(x => x !== o) : (max && value.length >= max ? value : [...value, o]))}
            style={{ padding: '8px 13px', borderRadius: 99, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              border: `1.5px solid ${on ? C.cr : C.line}`, background: on ? '#FBF0F2' : '#fff', color: on ? C.cr : C.sl }}>
            {on ? '✓ ' : ''}{o}
          </button>
        )
      })}
    </div>
  )
}

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

export default function CareersPage() {
  const saved = useMemo(() => { try { return JSON.parse(sessionStorage.getItem(STORE) || 'null') } catch { return null } }, [])
  const [f, setF] = useState(() => ({ ...EMPTY, ...(saved?.form || {}) }))
  const [draft, setDraft] = useState(saved?.draft || null)     // { id, token }
  const [step, setStep] = useState(saved?.step || 0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [up, setUp] = useState({})                             // key → % while uploading
  const [done, setDone] = useState(null)

  useEffect(() => { try { sessionStorage.setItem(STORE, JSON.stringify({ form: f, draft, step })) } catch { /* private mode */ } }, [f, draft, step])

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const setIn = (k, sub, v) => setF(p => ({ ...p, [k]: { ...p[k], [sub]: v } }))
  const teaching = TEACHING_POSITIONS.includes(f.position)
  const isRequired = (d) => teaching ? d.required : d.staffRequired
  const go = (n) => { setErr(''); setStep(n); document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  // Per-step checks, so the applicant fixes things where they are.
  const stepError = (s) => {
    if (s === 0) {
      if (!f.firstName.trim() || !f.lastName.trim()) return 'Enter your first and last name.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return 'Enter a valid email address.'
      if (!f.phone.trim()) return 'Enter a phone number with the country code.'
      if (!f.country.trim()) return 'Enter the country you live in.'
    }
    if (s === 1) {
      if (f.position === 'non_teaching' && !f.roleTitle.trim()) return 'Tell us which role you are applying for.'
      if (teaching && !f.subjects.length) return 'Select at least one subject.'
      if (teaching && !f.curricula.length) return 'Select at least one curriculum.'
    }
    if (s === 2 && teaching && f.yearsExperience === '') return 'Enter your years of teaching experience.'
    if (s === 3) {
      const miss = APPLICANT_DOCS.filter(d => isRequired(d) && !f.documents[d.key]?.file && !f.documents[d.key]?.pending)
      if (miss.length) return 'Still needed: ' + miss.map(d => d.label).join(', ') + '.'
    }
    if (s === 4 && teaching) {
      if (!f.demoLesson.file && !f.demoLesson.url.trim()) return 'Upload your demo lesson or share a link to it.'
      if (!f.demoLesson.topic.trim()) return 'Tell us the topic of your demo lesson.'
    }
    return ''
  }

  const next = async () => {
    const e = stepError(step)
    if (e) { setErr(e); return }
    if (step === 0 && !draft) {
      setBusy(true)
      try {
        const r = await api.post('/careers/applications/start', { firstName: f.firstName, lastName: f.lastName, email: f.email, position: f.position })
        setDraft(r.data.data)
      } catch (x) { setErr(x?.response?.data?.message || 'Could not start your application. Please try again.'); setBusy(false); return }
      setBusy(false)
    }
    // Non-teaching roles skip the demo lesson step.
    go(step === 3 && !teaching ? 5 : step + 1)
  }
  const back = () => go(step === 5 && !teaching ? 3 : step - 1)

  const upload = async (kind, category, file) => {
    if (!file || !draft) return
    setErr('')
    const slot = kind === 'demo' ? 'demo' : category
    setUp(u => ({ ...u, [slot]: 0 }))
    try {
      const r = await api.post(`/careers/applications/${draft.id}/presign`, { token: draft.token, kind, fileName: file.name, mimeType: file.type, fileSize: file.size })
      await put(r.data.data.uploadUrl, file, pct => setUp(u => ({ ...u, [slot]: pct })))
      const ref = { key: r.data.data.key, filename: file.name, mimeType: file.type, sizeBytes: file.size }
      if (kind === 'demo') setIn('demoLesson', 'file', ref)
      else set('documents', { ...f.documents, [category]: { file: ref } })
    } catch (x) {
      setErr(x?.response?.data?.message || x.message || 'Upload failed.')
    } finally { setUp(u => { const n = { ...u }; delete n[slot]; return n }) }
  }

  const submit = async () => {
    setErr('')
    if (!f.consents.accurate || !f.consents.data || (teaching && !f.consents.safeguarding)) { setErr('Please confirm the declarations.'); return }
    setBusy(true)
    try {
      const body = {
        ...f, token: draft.token,
        documents: Object.entries(f.documents).map(([category, d]) => ({ category, ...d })),
      }
      const r = await api.post(`/careers/applications/${draft.id}/submit`, body)
      setDone(r.data.data.ref)
      try { sessionStorage.removeItem(STORE) } catch { /* noop */ }
      document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (x) {
      const d = x?.response?.data
      setErr(d?.errors?.length ? d.errors.join(' ') : (d?.message || 'Could not submit. Please try again.'))
      // The draft expired or was closed: start again, without files that belonged to it.
      if (x?.response?.status === 404 || x?.response?.status === 403) { setDraft(null); setStep(0); setF(p => ({ ...p, documents: {}, demoLesson: { ...p.demoLesson, file: null } })) }
    } finally { setBusy(false) }
  }

  const sec = (bg) => ({ background: bg, padding: '64px 0' })
  const h2 = { fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 400, color: C.ink, margin: '0 0 12px', lineHeight: 1.15 }
  const card = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }
  const grid = (min) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: 16 })
  const btn = (primary) => ({ padding: '13px 24px', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit', border: primary ? 'none' : `1.5px solid ${C.line}`, background: primary ? C.cr : '#fff', color: primary ? '#fff' : C.ink })

  return (
    <main>
      <section style={{ background: `linear-gradient(135deg, ${C.ink} 0%, #1A2238 55%, ${C.cr} 140%)`, color: '#fff', padding: '72px 0 60px' }}>
        <div className="wrap" style={{ maxWidth: 980 }}>
          <div className="eyebrow" style={{ color: C.gold }}>Careers at Smartious</div>
          <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 'clamp(2.2rem,5vw,3.6rem)', fontWeight: 400, lineHeight: 1.08, margin: '8px 0 16px' }}>
            Teach live, small classes of motivated students, <em style={{ color: C.gold }}>from wherever you are</em>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,.82)', maxWidth: 760, margin: '0 0 26px' }}>
            Smartious teaches Cambridge, Pearson Edexcel, IB and AP students in more than forty countries, live. We hire subject specialists who teach well on camera, mark carefully and care about each learner. Apply below with your documents and a short demo lesson.
          </p>
          <a href="#apply" onClick={e => { e.preventDefault(); document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' }) }}
            style={{ display: 'inline-block', background: C.gold, color: C.ink, padding: '15px 28px', borderRadius: 10, fontWeight: 800, textDecoration: 'none' }}>Apply to teach</a>
        </div>
      </section>

      <section style={sec(C.bone)}>
        <div className="wrap" style={{ maxWidth: 1080 }}>
          <h2 style={h2}>What teaching with us looks like</h2>
          <div style={grid(240)}>
            {[
              ['Live, small classes', 'You teach in real time, on our own classroom with a shared whiteboard, screen sharing and a Virtual Lab, to small groups rather than lecture halls.'],
              ['International qualifications', 'Cambridge Primary to A Level, Pearson Edexcel, the IB and Advanced Placement, examined by independent boards.'],
              ['Two teaching teams', 'We teach across time zones, so we hire in different regions and agree a timetable that fits your day.'],
              ['A structured school', 'Schemes of work, lesson plans, homework and reports in one portal, with academic leadership and quality assurance behind you.'],
              ['Development', 'A teacher development programme, lesson observations and feedback, and training records in your staff file.'],
              ['Remote or in Nairobi', 'Most roles are fully online; our learning centres in Parklands and Karen also hire teachers in person.'],
            ].map(([t, p]) => <div key={t} style={card}><div style={{ fontWeight: 800, fontSize: 16, color: C.ink, marginBottom: 6 }}>{t}</div><div style={{ fontSize: 14.5, color: C.sl, lineHeight: 1.65 }}>{p}</div></div>)}
          </div>
        </div>
      </section>

      <section style={sec('#fff')}>
        <div className="wrap" style={{ maxWidth: 1080 }}>
          <h2 style={h2}>How we hire</h2>
          <div style={grid(170)}>
            {[['1', 'Apply', 'Your details, subjects, documents and a demo lesson.'], ['2', 'Screening', 'We check qualifications, registration and documents.'],
              ['3', 'Demo review', 'Subject leads score your demo lesson against our teaching criteria.'], ['4', 'Interview', 'A live conversation and, for some roles, a short live teach.'],
              ['5', 'Offer and onboarding', 'Safeguarding checks completed, contract signed, timetable agreed.']].map(([n, t, p]) => (
              <div key={n} style={{ ...card, background: C.bone }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.cr, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, marginBottom: 10 }}>{n}</div>
                <div style={{ fontWeight: 800, color: C.ink, marginBottom: 4 }}>{t}</div><div style={{ fontSize: 14, color: C.sl, lineHeight: 1.6 }}>{p}</div>
              </div>))}
          </div>
          <div style={{ ...card, marginTop: 18, background: '#FFFBEB', borderColor: '#FDE68A' }}>
            <div style={{ fontWeight: 800, color: C.ink, marginBottom: 6 }}>Have these ready</div>
            <div style={{ fontSize: 14.5, color: C.sl, lineHeight: 1.7 }}>
              Your CV, degree certificates, teaching qualification, ID or passport, teaching licence or registration, police clearance and a safeguarding certificate (the last three can be marked &ldquo;in progress&rdquo;), and a demo lesson of 10 to 20 minutes taught online, as a video file (up to 1 GB) or a link. PDF, Word or photo files up to 15 MB each.
            </div>
          </div>
        </div>
      </section>

      <section id="apply" style={sec(C.bone2)}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <h2 style={h2}>Apply to teach with Smartious</h2>
          {done ? (
            <div style={{ ...card, borderColor: '#A7F3D0', background: '#ECFDF5' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.green, marginBottom: 8 }}>Application received</div>
              <p style={{ fontSize: 15.5, color: C.sl, lineHeight: 1.7, margin: 0 }}>Thank you. Your reference is <strong>{done}</strong>, and we have emailed you a confirmation. Our academic team reviews every application, including the demo lesson, and will contact you if your profile matches what our learners need.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                {STEPS.map((s, i) => (i === 4 && !teaching) ? null : (
                  <span key={s} style={{ padding: '6px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, background: i === step ? C.cr : i < step ? '#E7F5EC' : '#fff', color: i === step ? '#fff' : i < step ? C.green : C.mut, border: `1px solid ${i === step ? C.cr : C.line}` }}>{i < step ? '✓ ' : ''}{s}</span>
                ))}
              </div>
              <div style={{ ...card, padding: 24, display: 'grid', gap: 16 }}>
                {step === 0 && (<>
                  <div style={grid(220)}>
                    <Field label="First name" req><input style={field} value={f.firstName} onChange={e => set('firstName', e.target.value)} autoComplete="given-name" /></Field>
                    <Field label="Last name" req><input style={field} value={f.lastName} onChange={e => set('lastName', e.target.value)} autoComplete="family-name" /></Field>
                    <Field label="Email" req><input style={field} type="email" value={f.email} onChange={e => set('email', e.target.value)} autoComplete="email" disabled={!!draft} /></Field>
                    <Field label="Phone / WhatsApp" req hint="With country code, e.g. +254 7…"><input style={field} value={f.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" /></Field>
                    <Field label="Country you live in" req><input style={field} value={f.country} onChange={e => set('country', e.target.value)} autoComplete="country-name" /></Field>
                    <Field label="City"><input style={field} value={f.city} onChange={e => set('city', e.target.value)} /></Field>
                    <Field label="Time zone" hint="e.g. East Africa Time, GMT, GST"><input style={field} value={f.timezone} onChange={e => set('timezone', e.target.value)} /></Field>
                    <Field label="LinkedIn or profile link"><input style={field} value={f.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://" /></Field>
                  </div>
                </>)}

                {step === 1 && (<>
                  <Field label="Position" req>
                    <select style={field} value={f.position} onChange={e => set('position', e.target.value)}>
                      {POSITIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                    <div style={hintS}>{POSITIONS.find(p => p.key === f.position)?.hint}</div>
                  </Field>
                  {!teaching && <Field label="Which role?" req><input style={field} value={f.roleTitle} onChange={e => set('roleTitle', e.target.value)} placeholder="e.g. Admissions officer" /></Field>}
                  {teaching && (<>
                    <Field label="Subjects you would teach" req hint="Select every subject you can teach to examination level."><Chips options={SUBJECTS} value={f.subjects} onChange={v => set('subjects', v)} /></Field>
                    <Field label="Curricula you can teach" req><Chips options={CURRICULA} value={f.curricula} onChange={v => set('curricula', v)} /></Field>
                    <Field label="Levels"><Chips options={LEVELS} value={f.levels} onChange={v => set('levels', v)} /></Field>
                  </>)}
                  <div style={grid(200)}>
                    <Field label="Availability">
                      <select style={field} value={f.employment} onChange={e => set('employment', e.target.value)}>
                        <option value="">Choose…</option><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="either">Either</option>
                      </select>
                    </Field>
                    <Field label="Hours a week you can teach"><input style={field} type="number" min="0" max="80" value={f.hoursPerWeek} onChange={e => set('hoursPerWeek', e.target.value)} /></Field>
                    <Field label="Available from"><input style={field} type="date" value={f.availableFrom} onChange={e => set('availableFrom', e.target.value)} /></Field>
                    <Field label="Expected pay" hint="Per hour or per month, in your currency."><input style={field} value={f.expectedPay} onChange={e => set('expectedPay', e.target.value)} /></Field>
                  </div>
                </>)}

                {step === 2 && (<>
                  <div style={grid(200)}>
                    <Field label="Years of teaching" req={teaching}><input style={field} type="number" min="0" max="60" value={f.yearsExperience} onChange={e => set('yearsExperience', e.target.value)} /></Field>
                    <Field label="Years teaching online"><input style={field} type="number" min="0" max="60" value={f.yearsOnline} onChange={e => set('yearsOnline', e.target.value)} /></Field>
                    <Field label="Highest qualification">
                      <select style={field} value={f.highestQualification} onChange={e => set('highestQualification', e.target.value)}>
                        <option value="">Choose…</option>{QUALIFICATIONS.map(q => <option key={q}>{q}</option>)}
                      </select>
                    </Field>
                    <Field label="Teaching qualification" hint="e.g. PGCE, B.Ed, Dip.Ed"><input style={field} value={f.teachingQualification} onChange={e => set('teachingQualification', e.target.value)} /></Field>
                    <Field label="Teaching registration number" hint="e.g. TSC, QTS, SACE"><input style={field} value={f.registration} onChange={e => set('registration', e.target.value)} /></Field>
                    <Field label="Examiner experience" hint="Boards, components and years, if any"><input style={field} value={f.examinerExperience} onChange={e => set('examinerExperience', e.target.value)} /></Field>
                  </div>
                  <div>
                    <span style={lbl}>Your teaching setup</span>
                    <div style={grid(200)}>
                      <Field label="Internet connection">
                        <select style={field} value={f.setup.internet} onChange={e => setIn('setup', 'internet', e.target.value)}>
                          <option value="">Choose…</option>{['Fibre', 'Cable / DSL', '4G / 5G', 'Satellite', 'Other'].map(x => <option key={x}>{x}</option>)}
                        </select>
                      </Field>
                      {[['backupPower', 'Backup power (UPS, inverter or generator)'], ['headsetWebcam', 'Headset and webcam'], ['pentablet', 'Pen tablet or touchscreen for writing']].map(([k, l]) => (
                        <label key={k} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, color: C.sl, paddingTop: 22 }}>
                          <input type="checkbox" checked={!!f.setup[k]} onChange={e => setIn('setup', k, e.target.checked)} /> {l}
                        </label>
                      ))}
                    </div>
                  </div>
                  <Field label="Why you would like to teach with Smartious" hint="A few paragraphs: your teaching, your results, and what you would bring."><textarea style={{ ...field, minHeight: 150 }} value={f.coverLetter} onChange={e => set('coverLetter', e.target.value)} maxLength={6000} /></Field>
                  <Field label="How did you hear about us?"><input style={field} value={f.howHeard} onChange={e => set('howHeard', e.target.value)} /></Field>
                </>)}

                {step === 3 && (<>
                  <p style={{ margin: 0, fontSize: 14.5, color: C.sl, lineHeight: 1.65 }}>The same documents every Smartious teacher keeps on file. PDF, Word or a clear photo, up to 15 MB each. Licence, police clearance and safeguarding may be marked &ldquo;in progress&rdquo; if you are still obtaining them.</p>
                  {APPLICANT_DOCS.map(d => {
                    const cur = f.documents[d.key]
                    const pct = up[d.key]
                    return (
                      <div key={d.key} style={{ border: `1px solid ${cur?.file ? '#A7F3D0' : C.line}`, background: cur?.file ? '#F0FDF4' : '#fff', borderRadius: 11, padding: '12px 14px', display: 'grid', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ fontWeight: 700, color: C.ink, fontSize: 14.5 }}>{d.label}{isRequired(d) ? <span style={{ color: C.cr }}> *</span> : <span style={{ color: C.mut, fontWeight: 500 }}> (optional)</span>}</div>
                            <div style={{ fontSize: 12.5, color: C.mut }}>{d.hint}</div>
                          </div>
                          {pct != null ? <span style={{ fontSize: 13, fontWeight: 700, color: C.cr }}>Uploading {pct}%</span>
                            : cur?.file ? <span style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>{'✓'} {cur.file.filename}</span> : null}
                          <label style={{ ...btn(false), padding: '8px 14px', fontSize: 13.5 }}>
                            {cur?.file ? 'Replace' : 'Upload'}
                            <input type="file" hidden accept=".pdf,.doc,.docx,image/png,image/jpeg,image/webp" onChange={e => { upload('document', d.key, e.target.files?.[0]); e.target.value = '' }} />
                          </label>
                        </div>
                        {d.mayBePending && !cur?.file && (
                          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5, color: C.sl }}>
                            <input type="checkbox" checked={!!cur?.pending} onChange={e => set('documents', { ...f.documents, [d.key]: e.target.checked ? { pending: true, note: cur?.note || '' } : undefined })} />
                            In progress: I will provide this before starting
                          </label>
                        )}
                        {cur?.pending && <input style={{ ...field, padding: '8px 10px', fontSize: 13.5 }} placeholder="Optional note, e.g. applied on 3 November" value={cur.note || ''} onChange={e => set('documents', { ...f.documents, [d.key]: { pending: true, note: e.target.value } })} />}
                      </div>
                    )
                  })}
                </>)}

                {step === 4 && teaching && (<>
                  <p style={{ margin: 0, fontSize: 14.5, color: C.sl, lineHeight: 1.65 }}>
                    Record 10 to 20 minutes of yourself <strong>teaching online</strong>: a real lesson segment for the level you want to teach, with your screen, whiteboard or slides and your camera on. We look at subject knowledge, how you explain, how you check understanding and how you hold attention on screen. Upload the video (MP4, WebM or MOV, up to 1 GB) or share a link (YouTube unlisted, Google Drive, Vimeo or similar) that anyone with the link can open.
                  </p>
                  <div style={{ border: `1px solid ${f.demoLesson.file ? '#A7F3D0' : C.line}`, background: f.demoLesson.file ? '#F0FDF4' : '#fff', borderRadius: 11, padding: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 700, color: C.ink }}>Demo lesson video</div>
                      <div style={{ fontSize: 13, color: up.demo != null ? C.cr : f.demoLesson.file ? C.green : C.mut, fontWeight: up.demo != null || f.demoLesson.file ? 700 : 400 }}>
                        {up.demo != null ? `Uploading ${up.demo}%… keep this page open` : f.demoLesson.file ? '✓ ' + f.demoLesson.file.filename : 'No file yet'}
                      </div>
                    </div>
                    <label style={{ ...btn(false), padding: '9px 16px', fontSize: 14 }}>
                      {f.demoLesson.file ? 'Replace video' : 'Upload video'}
                      <input type="file" hidden accept="video/mp4,video/webm,video/quicktime,video/x-matroska" onChange={e => { upload('demo', null, e.target.files?.[0]); e.target.value = '' }} />
                    </label>
                  </div>
                  <Field label="…or a link to your demo lesson"><input style={field} value={f.demoLesson.url} onChange={e => setIn('demoLesson', 'url', e.target.value)} placeholder="https://" /></Field>
                  <div style={grid(200)}>
                    <Field label="Topic taught" req><input style={field} value={f.demoLesson.topic} onChange={e => setIn('demoLesson', 'topic', e.target.value)} placeholder="e.g. Moles and molar mass" /></Field>
                    <Field label="Subject">
                      <select style={field} value={f.demoLesson.subject} onChange={e => setIn('demoLesson', 'subject', e.target.value)}>
                        <option value="">Choose…</option>{(f.subjects.length ? f.subjects : SUBJECTS).map(s => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Level">
                      <select style={field} value={f.demoLesson.level} onChange={e => setIn('demoLesson', 'level', e.target.value)}>
                        <option value="">Choose…</option>{LEVELS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Length (minutes)"><input style={field} type="number" min="1" max="240" value={f.demoLesson.minutes} onChange={e => setIn('demoLesson', 'minutes', e.target.value)} /></Field>
                  </div>
                  <Field label="Anything we should know about the recording?"><textarea style={{ ...field, minHeight: 80 }} value={f.demoLesson.notes} onChange={e => setIn('demoLesson', 'notes', e.target.value)} maxLength={1000} /></Field>
                </>)}

                {step === 5 && (<>
                  <div style={{ fontSize: 14.5, color: C.sl, lineHeight: 1.7 }}>
                    <div><strong>{f.firstName} {f.lastName}</strong> · {f.email} · {f.phone} · {[f.city, f.country].filter(Boolean).join(', ')}</div>
                    <div>{POSITIONS.find(p => p.key === f.position)?.label}{f.roleTitle ? ': ' + f.roleTitle : ''}</div>
                    {teaching && <div>{f.subjects.join(', ')} · {f.curricula.join(', ')}</div>}
                    <div>Documents: {APPLICANT_DOCS.filter(d => f.documents[d.key]?.file).length} uploaded{APPLICANT_DOCS.some(d => f.documents[d.key]?.pending) ? ', ' + APPLICANT_DOCS.filter(d => f.documents[d.key]?.pending).length + ' in progress' : ''}</div>
                    {teaching && <div>Demo lesson: {f.demoLesson.file ? f.demoLesson.file.filename : f.demoLesson.url || 'not added'}{f.demoLesson.topic ? ' · ' + f.demoLesson.topic : ''}</div>}
                  </div>
                  {[['accurate', 'The information and documents I have provided are true and complete.'],
                    ...(teaching ? [['safeguarding', 'I have no criminal record or safeguarding concern that would prevent me from working with children, and I consent to background and reference checks.']] : []),
                    ['data', 'Smartious may store and review my application and documents for recruitment, and contact me about it.']].map(([k, t]) => (
                    <label key={k} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14.5, color: C.ink, lineHeight: 1.55 }}>
                      <input type="checkbox" style={{ marginTop: 4 }} checked={!!f.consents[k]} onChange={e => setIn('consents', k, e.target.checked)} /> {t}
                    </label>
                  ))}
                </>)}

                {err && <div role="alert" style={{ color: C.red, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 12px', fontSize: 14 }}>{err}</div>}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  {step > 0 ? <button type="button" style={btn(false)} onClick={back} disabled={busy}>Back</button> : <span />}
                  {step < 5
                    ? <button type="button" style={btn(true)} onClick={next} disabled={busy || Object.keys(up).length > 0}>{busy ? 'Please wait…' : 'Continue'}</button>
                    : <button type="button" style={btn(true)} onClick={submit} disabled={busy}>{busy ? 'Submitting…' : 'Submit application'}</button>}
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: C.mut, marginTop: 12 }}>Your progress is kept in this browser tab until you submit. Questions: hello@smartioushomeschool.com</p>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
