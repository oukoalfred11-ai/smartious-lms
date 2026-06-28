/* ═══════════════════════════════════════════════════════════════════
   AssessmentForm.jsx — Comprehensive intake form for the academic
   assessment REQUEST. Rendered at /assessment route.
   
   Two-gate admissions funnel (intentional, filters out jokers):
     Gate 1: this form. Detailed student + family + academic info.
             No payment collected. Admissions reviews every request.
     Gate 2: if admissions accepts, family is invoiced for the
             assessment fee via Paystack. Assessment is only
             scheduled after payment is received.
   
   Flow on this page:
     1. User clicks "Book assessment" on a country hub
     2. Lands here with ?from=<country-slug> in URL (pre-fills country)
     3. On mount, attempts to auto-detect location via ipapi.co for
        any fields not already filled from the URL
     4. User completes 5 sections: Student, Parent, Location, Academic, Notes
     5. Acknowledges the two-gate process (checkbox)
     6. Submits the REQUEST — no payment at this stage
     7. Backend creates a pending record with status='awaiting_review',
        notifies admissions, sends family a confirmation receipt
     8. Admissions reviews in their Admin Portal (separate flow)
     9. If accepted, admissions triggers a Paystack invoice from the
        Admin Portal — that's where payment happens, not here
   
   ── Wiring ─────────────────────────────────────────────────────────
   Add a route in LandingPage.jsx that renders <AssessmentForm nav={nav}/>
   when the URL path matches /assessment. See INTEGRATION_NOTES at the
   bottom of this file for the exact pattern.
   
   The component pulls `from` query param from URL on its own — no need
   to pass the country in as a prop.
   ═══════════════════════════════════════════════════════════════════ */

import React, { useEffect, useMemo, useState } from 'react'

/* Brand tokens — match the rest of the Smartious site */
const V = {
  cr: '#8B1A2E',
  gold3: '#C9973A',
  ink: '#080C14',
  bone: '#FDFAF4',
  bone3: '#E5E0D2',
  white: '#FFFFFF',
  sl: '#52616B',
  slLight: '#7A8691',
  line: '#E5E0D2',
  danger: '#B91C1C',
}

/* Assessment fee — single source of truth. Update here if the fee
   policy changes. Used for display copy + Paystack amount. */
const ASSESSMENT_FEE_USD = 45
const ASSESSMENT_FEE_KES = 5800  /* approx, set per current FX */

/* Countries Smartious serves. Maps slug → display name + ISO code +
   default phone prefix. Used to populate the country select with
   the served countries first, then "Other" for everyone else. */
const SERVED_COUNTRIES = [
  { slug:'kenya',         name:'Kenya',                iso:'KE', dial:'+254' },
  { slug:'ethiopia',      name:'Ethiopia',             iso:'ET', dial:'+251' },
  { slug:'rwanda',        name:'Rwanda',               iso:'RW', dial:'+250' },
  { slug:'tanzania',      name:'Tanzania',             iso:'TZ', dial:'+255' },
  { slug:'uganda',        name:'Uganda',               iso:'UG', dial:'+256' },
  { slug:'south-africa',  name:'South Africa',         iso:'ZA', dial:'+27'  },
  { slug:'nigeria',       name:'Nigeria',              iso:'NG', dial:'+234' },
  { slug:'egypt',         name:'Egypt',                iso:'EG', dial:'+20'  },
  { slug:'morocco',       name:'Morocco',              iso:'MA', dial:'+212' },
  { slug:'somalia',       name:'Somalia',              iso:'SO', dial:'+252' },
  { slug:'uae',           name:'United Arab Emirates', iso:'AE', dial:'+971' },
  { slug:'qatar',         name:'Qatar',                iso:'QA', dial:'+974' },
  { slug:'saudi-arabia',  name:'Saudi Arabia',         iso:'SA', dial:'+966' },
  { slug:'bahrain',       name:'Bahrain',              iso:'BH', dial:'+973' },
  { slug:'pakistan',      name:'Pakistan',             iso:'PK', dial:'+92'  },
  { slug:'japan',         name:'Japan',                iso:'JP', dial:'+81'  },
  { slug:'south-korea',   name:'South Korea',          iso:'KR', dial:'+82'  },
  { slug:'vietnam',       name:'Vietnam',              iso:'VN', dial:'+84'  },
  { slug:'thailand',      name:'Thailand',             iso:'TH', dial:'+66'  },
  { slug:'uk',            name:'United Kingdom',       iso:'GB', dial:'+44'  },
  { slug:'usa',           name:'United States',        iso:'US', dial:'+1'   },
  { slug:'canada',        name:'Canada',               iso:'CA', dial:'+1'   },
  { slug:'australia',     name:'Australia',            iso:'AU', dial:'+61'  },
]

/* Grade levels — covers Cambridge/British, IB, American, Kenya CBC, Ontario.
   Grouped for the select dropdown. */
const GRADE_OPTIONS = [
  { group:'Primary',           items:['Year 1 / Grade 1 / IB PYP Year 1','Year 2 / Grade 2 / IB PYP Year 2','Year 3 / Grade 3 / IB PYP Year 3','Year 4 / Grade 4 / IB PYP Year 4','Year 5 / Grade 5 / IB PYP Year 5','Year 6 / Grade 6 / IB PYP Year 6'] },
  { group:'Lower Secondary',   items:['Year 7 / Grade 7 / IB MYP Year 1','Year 8 / Grade 8 / IB MYP Year 2','Year 9 / Grade 9 / IB MYP Year 3'] },
  { group:'IGCSE Years',       items:['Year 10 / Grade 10 / IB MYP Year 4 (IGCSE Year 1)','Year 11 / Grade 11 / IB MYP Year 5 (IGCSE Year 2)'] },
  { group:'Sixth Form / DP',   items:['Year 12 / Grade 11 / IB DP Year 1 (AS-Level / Grade 11)','Year 13 / Grade 12 / IB DP Year 2 (A-Level / Grade 12)'] },
  { group:'Other',             items:['Not yet enrolled in school','Gap year / unsure'] },
]

const CURRICULUM_OPTIONS = [
  'Cambridge IGCSE & A-Level (primary preference)',
  'Pearson Edexcel International GCSE & A-Level',
  'IB Diploma Programme',
  'American Curriculum with AP',
  'Ontario Secondary School Diploma (OSSD)',
  'Kenya CBC',
  'Not sure — please recommend',
]

const TARGET_UNIVERSITY_OPTIONS = [
  'United Kingdom (UCAS — Oxbridge, Russell Group)',
  'United States (Common App — Ivy League, top liberal arts)',
  'Canada (OUAC — U15 universities)',
  'Australia (Group of Eight)',
  'Japan (English-medium degree programmes)',
  'South Korea',
  'Continental Europe',
  'Within home country',
  'Open / not yet decided',
]

const WHY_CONSIDERING_OPTIONS = [
  'International school fees too high in our area',
  'Dissatisfied with current school',
  'Mid-year move / relocation',
  'Returnee (kikokushijo / repatriating family)',
  'Special educational needs accommodation',
  'Gifted / accelerated learning',
  'Flexible schedule for sports / arts / professional commitments',
  'Expatriate family',
  'Frequent travel / military / diplomatic family',
  'Health-related — extended treatment or recovery',
  'Other (please describe in notes)',
]

const HEAR_ABOUT_OPTIONS = [
  'Google search',
  'Social media (Instagram, TikTok, LinkedIn, Facebook)',
  'YouTube',
  'Word of mouth — friend or family',
  'Education consultant or admissions agent',
  'Diplomatic / corporate HR referral',
  'Other',
]

const CONTACT_METHOD_OPTIONS = ['WhatsApp', 'Email', 'Phone call', 'Video call']

const RELATIONSHIP_OPTIONS = ['Mother', 'Father', 'Guardian', 'Other']

/* ────────────────────────────────────────────────────────────────
   AssessmentForm component
   ──────────────────────────────────────────────────────────────── */
export default function AssessmentForm({ nav }) {
  /* Parse ?from= URL param to pre-fill country selection */
  const fromSlug = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('from') || ''
  }, [])

  const initialCountry = useMemo(() => {
    const match = SERVED_COUNTRIES.find(c => c.slug === fromSlug)
    return match ? match.iso : ''
  }, [fromSlug])

  const [form, setForm] = useState({
    /* Student */
    studentFirstName: '',
    studentLastName: '',
    studentDOB: '',
    studentGrade: '',
    currentSchool: '',
    studentEmail: '',
    studentLanguages: '',
    learningNeeds: '',
    /* Parent 1 */
    parent1FirstName: '',
    parent1LastName: '',
    parent1Relationship: '',
    parent1Email: '',
    parent1Phone: '',
    /* Parent 2 (optional) */
    hasParent2: false,
    parent2FirstName: '',
    parent2LastName: '',
    parent2Relationship: '',
    parent2Email: '',
    parent2Phone: '',
    /* Contact preferences */
    preferredContact: '',
    preferredContactTime: '',
    /* Location */
    countryIso: initialCountry,
    stateProvince: '',
    city: '',
    timezone: '',
    /* Academic */
    curriculumInterest: [],
    targetUniversity: [],
    whyConsidering: [],
    preferredSchedule: '',
    /* Additional */
    howDidYouHear: '',
    additionalInfo: '',
    /* Fee acknowledgment */
    feeAcknowledged: false,
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [autoDetected, setAutoDetected] = useState(null)

  /* ── Auto-detect location via ipapi.co on mount ─────────────────
     Free tier, no API key required for low traffic. Used to pre-fill
     country (if not already set from URL), city, and timezone.
     Silently fails — user can fill manually. */
  useEffect(() => {
    let cancelled = false
    fetch('https://ipapi.co/json/')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data) return
        setAutoDetected({
          country: data.country_name,
          countryIso: data.country_code,
          city: data.city,
          region: data.region,
          timezone: data.timezone,
        })
        setForm(f => ({
          ...f,
          countryIso: f.countryIso || data.country_code || '',
          city: f.city || data.city || '',
          stateProvince: f.stateProvince || data.region || '',
          timezone: f.timezone || data.timezone || '',
        }))
      })
      .catch(() => { /* silent — manual fill is the fallback */ })
    return () => { cancelled = true }
  }, [])

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  /* Toggle a value in a multi-select array field */
  const toggleArr = (key, value) => {
    setForm(f => {
      const arr = f[key] || []
      const next = arr.includes(value)
        ? arr.filter(x => x !== value)
        : [...arr, value]
      return { ...f, [key]: next }
    })
  }

  /* Validation — fields marked * in the UI are required. */
  const validate = () => {
    const e = {}
    if (!form.studentFirstName.trim()) e.studentFirstName = 'Required'
    if (!form.studentLastName.trim())  e.studentLastName  = 'Required'
    if (!form.studentDOB)              e.studentDOB       = 'Required'
    if (!form.studentGrade)            e.studentGrade     = 'Required'
    if (!form.parent1FirstName.trim()) e.parent1FirstName = 'Required'
    if (!form.parent1LastName.trim())  e.parent1LastName  = 'Required'
    if (!form.parent1Relationship)     e.parent1Relationship = 'Required'
    if (!form.parent1Email.trim())     e.parent1Email     = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parent1Email))
                                       e.parent1Email     = 'Invalid email'
    if (!form.parent1Phone.trim())     e.parent1Phone     = 'Required'
    if (!form.preferredContact)        e.preferredContact = 'Required'
    if (!form.countryIso)              e.countryIso       = 'Required'
    if (!form.city.trim())             e.city             = 'Required'
    if (form.curriculumInterest.length === 0)
                                       e.curriculumInterest = 'Select at least one'
    if (!form.feeAcknowledged)         e.feeAcknowledged  = 'Required to proceed'
    return e
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      /* Scroll to first error */
      const firstField = Object.keys(e)[0]
      const el = document.getElementById(`af-${firstField}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSubmitting(true)

    /* ── TODO (backend wiring) ───────────────────────────────────
       1. POST form payload to backend `/api/assessment/request`
          → backend creates a pending assessment-request record with
            status='awaiting_review', emails the family a receipt
            confirmation, notifies admissions@smartioushomeschool.com
       2. Admissions team reviews the request in their admin panel
          (separate Admin Portal flow — not part of this form)
       3. If admissions ACCEPTS:
            - Admin panel triggers backend to issue a Paystack invoice
              for the assessment fee
            - Family receives accept email + invoice link
            - On payment, assessment is scheduled
          If admissions REQUESTS MORE INFO:
            - Admin sends clarifying email; status='info_requested'
          If admissions DECLINES:
            - Admin sends decline email with alternative recommendations;
              status='declined'
       4. All correspondence is logged against the request record
       
       This form does NOT take any payment. The fee is invoiced via
       Paystack only after admissions accepts the request.
       
       For now we simulate by waiting 800ms and showing success state,
       so Alfred can see the full UX flow end-to-end. Replace the
       setTimeout with the real backend POST. */
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 800)
  }

  if (submitted) return <SuccessState form={form} nav={nav}/>

  /* ────────────────────────────────────────────────────────────
     Inline style helpers — match Smartious aesthetic
     ──────────────────────────────────────────────────────────── */
  const sectionStyle = { background:V.white, border:`1px solid ${V.bone3}`, borderRadius:12, padding:'28px 28px 22px', marginBottom:22 }
  const sectionLabel = { fontSize:11, color:V.gold3, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', marginBottom:8 }
  const sectionTitle = { fontFamily:"'DM Serif Display',Georgia,serif", fontSize:24, color:V.ink, margin:'0 0 6px', lineHeight:1.2 }
  const sectionSub   = { fontSize:13.5, color:V.sl, lineHeight:1.6, marginBottom:20 }
  const fieldRow     = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:14, marginBottom:14 }
  const labelStyle   = { display:'block', fontSize:12, color:V.ink, fontWeight:600, marginBottom:6, letterSpacing:'.01em' }
  const inputStyle   = { width:'100%', padding:'10px 12px', border:`1px solid ${V.bone3}`, borderRadius:6, fontSize:14, fontFamily:'inherit', color:V.ink, background:V.bone, boxSizing:'border-box' }
  const errInputStyle = { ...inputStyle, borderColor:V.danger, background:'#FEF2F2' }
  const errMsgStyle  = { fontSize:11, color:V.danger, marginTop:4, fontWeight:600 }
  const chipStyle    = (selected) => ({
    display:'inline-block', padding:'7px 13px', margin:'0 6px 6px 0',
    border:`1px solid ${selected ? V.cr : V.bone3}`,
    background: selected ? `${V.cr}10` : V.bone,
    color: selected ? V.cr : V.ink,
    borderRadius:20, fontSize:12.5, fontWeight: selected ? 700 : 500,
    cursor:'pointer', userSelect:'none', transition:'all .15s',
  })

  const fld = (key, label, opts = {}) => {
    const { type='text', placeholder, required, ...rest } = opts
    return (
      <div id={`af-${key}`}>
        <label style={labelStyle}>{label}{required && <span style={{color:V.cr}}> *</span>}</label>
        <input
          type={type}
          value={form[key]}
          onChange={e => set(key, e.target.value)}
          placeholder={placeholder || ''}
          style={errors[key] ? errInputStyle : inputStyle}
          {...rest}
        />
        {errors[key] && <div style={errMsgStyle}>{errors[key]}</div>}
      </div>
    )
  }

  return (
    <div style={{background:V.bone,minHeight:'100vh',paddingBottom:80,fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:V.ink}}>
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <header style={{background:V.ink,color:'#fff',padding:'30px 24px 36px'}}>
        <div style={{maxWidth:820,margin:'0 auto'}}>
          <button onClick={() => nav('/')} style={{background:'transparent',color:'rgba(255,255,255,.7)',border:'none',cursor:'pointer',fontSize:12,padding:0,marginBottom:18,display:'flex',alignItems:'center',gap:6}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Smartious
          </button>
          <div style={{fontSize:11,color:V.gold3,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:8}}>Assessment request</div>
          <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'clamp(1.7rem,3.6vw,2.4rem)',margin:'0 0 12px',lineHeight:1.2,color:'#fff'}}>
            Request an academic assessment for your child
          </h1>
          <p style={{fontSize:14.5,color:'rgba(255,255,255,.78)',lineHeight:1.65,maxWidth:680,margin:0}}>
            This form is the first step of our admissions process. Our Head of Admissions reviews every request before any assessment is scheduled. We respond within three business days regardless of decision. Please complete every section honestly &mdash; the more we know about your child, the better we can determine fit.
          </p>
        </div>
      </header>

      {/* ── PROCESS EXPLANATION ───────────────────────────────────── */}
      <div style={{background:`${V.cr}08`,borderBottom:`1px solid ${V.bone3}`,padding:'22px 24px'}}>
        <div style={{maxWidth:820,margin:'0 auto'}}>
          <div style={{fontSize:11,color:V.cr,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:14}}>How the process works</div>
          <ol style={{margin:0,paddingLeft:0,listStyle:'none',counterReset:'step'}}>
            {[
              {h:'Submit this request',           p:`Complete the five sections below. No payment is collected at this stage.`},
              {h:'Admissions review',              p:`Our Head of Admissions evaluates fit against current cohort, year-group capacity, and curriculum alignment. We respond to every request within three business days regardless of decision.`},
              {h:'Assessment fee invoiced on acceptance', p:`If the request is accepted, the family receives an invoice for the assessment fee of USD ${ASSESSMENT_FEE_USD} (approximately KES ${ASSESSMENT_FEE_KES.toLocaleString()}). Payment is required before the diagnostic is scheduled. The fee is credited against the first month's tuition if the family proceeds to enrolment.`},
              {h:'Diagnostic assessment',          p:`Structured testing across English, Mathematics and Science (approximately 90 minutes), a written report with subject-specific recommendations, and a 30-minute consultation with the Head of Academics.`},
              {h:'Enrolment decision',             p:`Admission is determined on the basis of the assessment results, not the request form alone. Families that are a good fit receive a formal enrolment offer.`},
            ].map((s,i) => (
              <li key={i} style={{display:'flex',gap:14,marginBottom:i===4?0:14,alignItems:'flex-start'}}>
                <div style={{flexShrink:0,width:26,height:26,borderRadius:'50%',background:V.cr,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,fontFamily:"'DM Serif Display',serif"}}>{i+1}</div>
                <div style={{fontSize:13,lineHeight:1.6,color:V.ink}}>
                  <strong style={{color:V.ink,fontWeight:700}}>{s.h}.</strong> <span style={{color:V.sl}}>{s.p}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── FORM ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} style={{maxWidth:820,margin:'30px auto 0',padding:'0 24px'}}>

        {/* Auto-detection notice */}
        {autoDetected && (
          <div style={{background:`${V.gold3}10`,border:`1px solid ${V.gold3}40`,borderRadius:8,padding:'10px 14px',fontSize:12.5,color:V.ink,marginBottom:22,lineHeight:1.5}}>
            <strong style={{color:V.gold3,fontWeight:700}}>Location detected:</strong> {autoDetected.city}, {autoDetected.country} ({autoDetected.timezone}). We've pre-filled the location fields below — please correct anything that's wrong.
          </div>
        )}

        {/* ───────────── SECTION 1: STUDENT ───────────── */}
        <section style={sectionStyle}>
          <div style={sectionLabel}>Section 1 of 5</div>
          <h2 style={sectionTitle}>About the student</h2>
          <p style={sectionSub}>Details about the child being assessed.</p>

          <div style={fieldRow}>
            {fld('studentFirstName', 'First name', { required:true, placeholder:'e.g. Amani' })}
            {fld('studentLastName',  'Last name',  { required:true, placeholder:'e.g. Odhiambo' })}
          </div>
          <div style={fieldRow}>
            {fld('studentDOB', 'Date of birth', { type:'date', required:true })}
            <div id="af-studentGrade">
              <label style={labelStyle}>Current year / grade level <span style={{color:V.cr}}>*</span></label>
              <select value={form.studentGrade} onChange={e => set('studentGrade', e.target.value)} style={errors.studentGrade ? errInputStyle : inputStyle}>
                <option value="">Select grade level...</option>
                {GRADE_OPTIONS.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map(it => <option key={it} value={it}>{it}</option>)}
                  </optgroup>
                ))}
              </select>
              {errors.studentGrade && <div style={errMsgStyle}>{errors.studentGrade}</div>}
            </div>
          </div>
          <div style={fieldRow}>
            {fld('currentSchool', 'Current school (optional)', { placeholder:"e.g. Tokyo International School, or 'home tutored'" })}
            {fld('studentEmail',  "Student's email (optional)", { type:'email', placeholder:'For Year 7+ students who use email' })}
          </div>
          <div>
            <label style={labelStyle}>Home language(s) (optional)</label>
            <input value={form.studentLanguages} onChange={e => set('studentLanguages', e.target.value)} placeholder="e.g. English, Japanese, Kiswahili" style={inputStyle}/>
          </div>
          <div style={{marginTop:14}}>
            <label style={labelStyle}>Learning needs or accommodations we should know about (optional)</label>
            <textarea value={form.learningNeeds} onChange={e => set('learningNeeds', e.target.value)} rows={3} placeholder="e.g. dyslexia diagnosis, ADHD, English as additional language, gifted, recent illness, anything that would help our examiners structure the assessment fairly." style={{...inputStyle,resize:'vertical',fontFamily:'inherit'}}/>
          </div>
        </section>

        {/* ───────────── SECTION 2: PARENT ───────────── */}
        <section style={sectionStyle}>
          <div style={sectionLabel}>Section 2 of 5</div>
          <h2 style={sectionTitle}>About the parent or guardian</h2>
          <p style={sectionSub}>Primary contact for the assessment and any follow-up communication.</p>

          <div style={fieldRow}>
            {fld('parent1FirstName', 'First name', { required:true })}
            {fld('parent1LastName',  'Last name',  { required:true })}
          </div>
          <div style={fieldRow}>
            <div id="af-parent1Relationship">
              <label style={labelStyle}>Relationship to student <span style={{color:V.cr}}>*</span></label>
              <select value={form.parent1Relationship} onChange={e => set('parent1Relationship', e.target.value)} style={errors.parent1Relationship ? errInputStyle : inputStyle}>
                <option value="">Select...</option>
                {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.parent1Relationship && <div style={errMsgStyle}>{errors.parent1Relationship}</div>}
            </div>
            {fld('parent1Email', 'Email', { type:'email', required:true, placeholder:'parent@example.com' })}
          </div>
          <div style={fieldRow}>
            {fld('parent1Phone', 'Phone (with country code)', { type:'tel', required:true, placeholder:'+254 745 021 212' })}
            <div id="af-preferredContact">
              <label style={labelStyle}>Preferred contact method <span style={{color:V.cr}}>*</span></label>
              <select value={form.preferredContact} onChange={e => set('preferredContact', e.target.value)} style={errors.preferredContact ? errInputStyle : inputStyle}>
                <option value="">Select...</option>
                {CONTACT_METHOD_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.preferredContact && <div style={errMsgStyle}>{errors.preferredContact}</div>}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Preferred contact time (optional)</label>
            <input value={form.preferredContactTime} onChange={e => set('preferredContactTime', e.target.value)} placeholder="e.g. weekday evenings JST 7-9 PM, or anytime weekends" style={inputStyle}/>
          </div>

          {/* Toggle: add second parent */}
          <div style={{marginTop:18,paddingTop:18,borderTop:`1px dashed ${V.bone3}`}}>
            <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontSize:13,color:V.ink}}>
              <input type="checkbox" checked={form.hasParent2} onChange={e => set('hasParent2', e.target.checked)} style={{width:16,height:16}}/>
              Add a second parent or guardian (optional)
            </label>
          </div>
          {form.hasParent2 && (
            <div style={{marginTop:14,paddingLeft:14,borderLeft:`3px solid ${V.gold3}30`}}>
              <div style={fieldRow}>
                {fld('parent2FirstName', 'First name')}
                {fld('parent2LastName',  'Last name')}
              </div>
              <div style={fieldRow}>
                <div>
                  <label style={labelStyle}>Relationship to student</label>
                  <select value={form.parent2Relationship} onChange={e => set('parent2Relationship', e.target.value)} style={inputStyle}>
                    <option value="">Select...</option>
                    {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {fld('parent2Email', 'Email', { type:'email' })}
              </div>
              <div>{fld('parent2Phone', 'Phone (with country code)', { type:'tel' })}</div>
            </div>
          )}
        </section>

        {/* ───────────── SECTION 3: LOCATION ───────────── */}
        <section style={sectionStyle}>
          <div style={sectionLabel}>Section 3 of 5</div>
          <h2 style={sectionTitle}>Where you are</h2>
          <p style={sectionSub}>We use this to schedule the live assessment in your local time zone and to send the right local exam-centre and admissions information.</p>

          <div style={fieldRow}>
            <div id="af-countryIso">
              <label style={labelStyle}>Country <span style={{color:V.cr}}>*</span></label>
              <select value={form.countryIso} onChange={e => set('countryIso', e.target.value)} style={errors.countryIso ? errInputStyle : inputStyle}>
                <option value="">Select country...</option>
                <optgroup label="Countries we currently serve">
                  {SERVED_COUNTRIES.map(c => <option key={c.iso} value={c.iso}>{c.name}</option>)}
                </optgroup>
                <option value="OTHER">Other (we'll arrange remote assessment)</option>
              </select>
              {errors.countryIso && <div style={errMsgStyle}>{errors.countryIso}</div>}
            </div>
            {fld('stateProvince', 'State / province / region (optional)', { placeholder:'e.g. Tokyo, Cairo Governorate, Nairobi County' })}
          </div>
          <div style={fieldRow}>
            {fld('city', 'City', { required:true, placeholder:'e.g. Tokyo, Cairo, Nairobi, Riyadh' })}
            {fld('timezone', 'Time zone (auto-detected)', { placeholder:'e.g. Asia/Tokyo' })}
          </div>
        </section>

        {/* ───────────── SECTION 4: ACADEMIC SITUATION ───────────── */}
        <section style={sectionStyle}>
          <div style={sectionLabel}>Section 4 of 5</div>
          <h2 style={sectionTitle}>Academic situation & preferences</h2>
          <p style={sectionSub}>Helps our admissions team match the right curriculum, examiner, and class group to your child.</p>

          <div style={{marginBottom:18}}>
            <label style={labelStyle}>Curriculum interest (select all that apply) <span style={{color:V.cr}}>*</span></label>
            <div id="af-curriculumInterest">
              {CURRICULUM_OPTIONS.map(opt => (
                <span key={opt} onClick={() => toggleArr('curriculumInterest', opt)} style={chipStyle(form.curriculumInterest.includes(opt))}>{opt}</span>
              ))}
            </div>
            {errors.curriculumInterest && <div style={errMsgStyle}>{errors.curriculumInterest}</div>}
          </div>

          <div style={{marginBottom:18}}>
            <label style={labelStyle}>Target university region (select all that apply)</label>
            {TARGET_UNIVERSITY_OPTIONS.map(opt => (
              <span key={opt} onClick={() => toggleArr('targetUniversity', opt)} style={chipStyle(form.targetUniversity.includes(opt))}>{opt}</span>
            ))}
          </div>

          <div style={{marginBottom:18}}>
            <label style={labelStyle}>Why are you considering Smartious? (select all that apply)</label>
            {WHY_CONSIDERING_OPTIONS.map(opt => (
              <span key={opt} onClick={() => toggleArr('whyConsidering', opt)} style={chipStyle(form.whyConsidering.includes(opt))}>{opt}</span>
            ))}
          </div>

          <div>
            <label style={labelStyle}>Preferred class schedule (relative to your local time zone)</label>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:4}}>
              {['Morning (local time)','Afternoon (local time)','Evening (local time)','Flexible — recommend based on cohort'].map(opt => (
                <label key={opt} style={{display:'flex',alignItems:'center',gap:8,fontSize:13.5,color:V.ink,cursor:'pointer',padding:'8px 12px',border:`1px solid ${form.preferredSchedule===opt ? V.cr : V.bone3}`,borderRadius:6,background: form.preferredSchedule===opt ? `${V.cr}08` : V.bone}}>
                  <input type="radio" name="schedule" value={opt} checked={form.preferredSchedule===opt} onChange={e => set('preferredSchedule', e.target.value)}/>
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── SECTION 5: ADDITIONAL ───────────── */}
        <section style={sectionStyle}>
          <div style={sectionLabel}>Section 5 of 5</div>
          <h2 style={sectionTitle}>One more thing</h2>
          <p style={sectionSub}>So we can give credit where due and prepare any specific responses.</p>

          <div style={fieldRow}>
            <div>
              <label style={labelStyle}>How did you hear about Smartious?</label>
              <select value={form.howDidYouHear} onChange={e => set('howDidYouHear', e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                {HEAR_ABOUT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Anything else we should know? (optional)</label>
            <textarea value={form.additionalInfo} onChange={e => set('additionalInfo', e.target.value)} rows={4} placeholder="Specific questions, timing constraints, university application deadlines, anything that would help us prepare a relevant response." style={{...inputStyle,resize:'vertical',fontFamily:'inherit'}}/>
          </div>
        </section>

        {/* ───────────── ACKNOWLEDGMENT + SUBMIT ───────────── */}
        <section style={{...sectionStyle, background:V.ink, border:'none', color:'#fff'}}>
          <div style={{...sectionLabel, color:V.gold3}}>Submit your request</div>
          <h2 style={{...sectionTitle, color:'#fff'}}>Acknowledge and submit</h2>
          <p style={{...sectionSub, color:'rgba(255,255,255,.78)'}}>
            By submitting this request you confirm that the information provided is accurate. Our Head of Admissions will review your request and respond within three business days. If the request is accepted, you'll receive an invoice for the assessment fee. The assessment is only scheduled after the fee is paid.
          </p>

          <label id="af-feeAcknowledged" style={{display:'flex',alignItems:'flex-start',gap:12,padding:'14px 16px',background:'rgba(255,255,255,.06)',border:`1px solid ${errors.feeAcknowledged ? V.danger : 'rgba(255,255,255,.18)'}`,borderRadius:8,cursor:'pointer',fontSize:13.5,lineHeight:1.55,color:'rgba(255,255,255,.9)',marginBottom:14}}>
            <input type="checkbox" checked={form.feeAcknowledged} onChange={e => set('feeAcknowledged', e.target.checked)} style={{width:16,height:16,marginTop:3,flexShrink:0}}/>
            <span>I understand that this is an admissions request, not a confirmed booking. If our request is accepted, I will be required to pay the <strong style={{color:V.gold3}}>USD {ASSESSMENT_FEE_USD}</strong> assessment fee before the assessment is scheduled. The fee is non-refundable and is credited against the first month's tuition if my family proceeds to enrolment. <span style={{color:'rgba(255,255,255,.65)'}}>(Required to submit.)</span></span>
          </label>
          {errors.feeAcknowledged && <div style={{...errMsgStyle, color:'#FCA5A5', marginBottom:14}}>{errors.feeAcknowledged}</div>}

          <button type="submit" disabled={submitting} style={{background:submitting ? '#A07A2E' : V.gold3,color:V.ink,border:'none',padding:'16px 32px',borderRadius:8,fontSize:15,fontWeight:800,cursor:submitting ? 'wait' : 'pointer',width:'100%',letterSpacing:'.01em',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:10}}>
            {submitting ? 'Submitting...' : <>Submit assessment request <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
          </button>

          <p style={{textAlign:'center',fontSize:11.5,color:'rgba(255,255,255,.55)',marginTop:16,lineHeight:1.5}}>
            We respond to every request within three business days regardless of decision.<br/>
            Your information is used solely for admissions evaluation and is not shared with third parties.
          </p>
        </section>

      </form>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   SuccessState — shown after successful submission + payment.
   ──────────────────────────────────────────────────────────────── */
function SuccessState({ form, nav }) {
  return (
    <div style={{background:V.bone,minHeight:'100vh',fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:V.ink}}>
      <div style={{maxWidth:680,margin:'0 auto',padding:'80px 24px',textAlign:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:V.gold3,color:V.ink,display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:24,fontSize:28}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{fontSize:11,color:V.gold3,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:12}}>Request received</div>
        <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'clamp(1.7rem,3.6vw,2.4rem)',margin:'0 0 16px',color:V.ink,lineHeight:1.2}}>
          Thank you, {form.parent1FirstName}.
        </h1>
        <p style={{fontSize:15,color:V.sl,lineHeight:1.7,marginBottom:28}}>
          We've received your assessment request for {form.studentFirstName}. Our Head of Admissions will review the request and respond to <strong style={{color:V.ink}}>{form.parent1Email}</strong> within three business days, regardless of decision.
        </p>
        <div style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:10,padding:'18px 22px',textAlign:'left',marginBottom:30}}>
          <div style={{fontSize:11,color:V.gold3,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:10}}>What happens next</div>
          <ol style={{margin:0,paddingLeft:18,fontSize:13.5,lineHeight:1.8,color:V.ink}}>
            <li>Confirmation email (within minutes) acknowledging receipt of your request</li>
            <li>Admissions decision email within three business days &mdash; one of three outcomes:
              <ul style={{margin:'4px 0 0 0',paddingLeft:18,color:V.sl,fontSize:12.5}}>
                <li><strong style={{color:V.ink}}>Accepted:</strong> you receive an invoice for the assessment fee. The diagnostic is scheduled after payment is received.</li>
                <li><strong style={{color:V.ink}}>Request more information:</strong> we may ask for clarifying details before deciding.</li>
                <li><strong style={{color:V.ink}}>Not a current fit:</strong> we explain why and recommend better-suited alternatives where we can.</li>
              </ul>
            </li>
            <li>If accepted and the assessment fee is paid: structured diagnostic across English, Mathematics and Science (approx 90 minutes total)</li>
            <li>Written report and a 30-minute consultation with the Head of Academics</li>
            <li>Curriculum pathway recommendation and enrolment offer (if the assessment results indicate fit)</li>
          </ol>
        </div>
        <button onClick={() => nav('/')} style={{background:V.cr,color:'#fff',border:'none',padding:'13px 28px',borderRadius:8,fontSize:14,fontWeight:700,cursor:'pointer'}}>
          Back to Smartious
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   INTEGRATION NOTES
   ────────────────────────────────────────────────────────────────
   1. Add this to your LandingPage.jsx routing (wherever you handle
      pageId state from the URL path):
   
        if (path === '/assessment') return setPageId('assessment')
   
      Then in the render switch:
   
        case 'assessment':
          return <AssessmentForm nav={nav}/>
   
   2. Add the import at the top of LandingPage.jsx:
   
        import AssessmentForm from '../components/AssessmentForm.jsx'
   
   3. Backend wiring — see the TODO block inside handleSubmit() above.
      The shape of the data POSTed to your backend should be the
      `form` state object. The backend creates an assessment-request
      record with status='awaiting_review' and notifies admissions.
      
      THIS FORM TAKES NO PAYMENT. The assessment fee is invoiced
      separately via Paystack only after admissions accepts the
      request — that workflow lives in your Admin Portal, not here.
   
   4. Set ASSESSMENT_FEE_USD and ASSESSMENT_FEE_KES at the top of the
      file to match your current fee policy. These constants drive
      the process-explanation copy ("USD 45 / KES ~5,800") and the
      acknowledgment checkbox copy — single source of truth.
   
   5. The ipapi.co free tier handles ~1000 requests/day without an
      API key. If traffic exceeds that, sign up for a free key and
      replace the fetch URL with their authenticated endpoint, or
      swap to ip-api.com or ipify.org.
   
   6. This is the ONLY conversion path on the public site. No
      WhatsApp CTAs, no Direct Admission, no Free Consultation,
      no Enrolment buttons. Every interested family files through
      this form, and only assessment-accepted families ever proceed
      to enrolment. The two-gate filter (detailed form + paid
      assessment) is intentional — it keeps the admissions team's
      time focused on serious prospects.
   ════════════════════════════════════════════════════════════════ */
