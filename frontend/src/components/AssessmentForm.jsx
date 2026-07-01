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

const ASSESSMENT_FEE_USD = 45
const ASSESSMENT_FEE_KES = 5800

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

// ─────────────────────────────────────────────────────────
// API base — same env var used across the rest of the site
// ─────────────────────────────────────────────────────────
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export default function AssessmentForm({ nav }) {
  const fromSlug = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('from') || ''
  }, [])

  const initialCountry = useMemo(() => {
    const match = SERVED_COUNTRIES.find(c => c.slug === fromSlug)
    return match ? match.iso : ''
  }, [fromSlug])

  const [form, setForm] = useState({
    studentFirstName: '', studentLastName: '', studentDOB: '', studentGrade: '',
    currentSchool: '', studentEmail: '', studentLanguages: '', learningNeeds: '',
    parent1FirstName: '', parent1LastName: '', parent1Relationship: '',
    parent1Email: '', parent1Phone: '',
    hasParent2: false,
    parent2FirstName: '', parent2LastName: '', parent2Relationship: '',
    parent2Email: '', parent2Phone: '',
    preferredContact: '', preferredContactTime: '',
    countryIso: initialCountry, stateProvince: '', city: '', timezone: '',
    curriculumInterest: [], targetUniversity: [], whyConsidering: [],
    preferredSchedule: '',
    howDidYouHear: '', additionalInfo: '',
    feeAcknowledged: false,
  })

  const [errors, setErrors]       = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [requestRef, setRequestRef]   = useState('')
  const [autoDetected, setAutoDetected] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('https://ipapi.co/json/')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data) return
        setAutoDetected({ country: data.country_name, countryIso: data.country_code, city: data.city, region: data.region, timezone: data.timezone })
        setForm(f => ({
          ...f,
          countryIso:    f.countryIso    || data.country_code || '',
          city:          f.city          || data.city         || '',
          stateProvince: f.stateProvince || data.region       || '',
          timezone:      f.timezone      || data.timezone     || '',
        }))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  const toggleArr = (key, value) => {
    setForm(f => {
      const arr = f[key] || []
      return { ...f, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] }
    })
  }

  const validate = () => {
    const e = {}
    if (!form.studentFirstName.trim()) e.studentFirstName = 'Required'
    if (!form.studentLastName.trim())  e.studentLastName  = 'Required'
    if (!form.studentDOB)              e.studentDOB       = 'Required'
    if (!form.studentGrade)            e.studentGrade     = 'Required'
    if (!form.parent1FirstName.trim()) e.parent1FirstName = 'Required'
    if (!form.parent1LastName.trim())  e.parent1LastName  = 'Required'
    if (!form.parent1Relationship)     e.parent1Relationship = 'Required'
    if (!form.parent1Email.trim())     e.parent1Email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parent1Email)) e.parent1Email = 'Invalid email'
    if (!form.parent1Phone.trim())     e.parent1Phone = 'Required'
    if (!form.preferredContact)        e.preferredContact = 'Required'
    if (!form.countryIso)              e.countryIso = 'Required'
    if (!form.city.trim())             e.city = 'Required'
    if (form.curriculumInterest.length === 0) e.curriculumInterest = 'Select at least one'
    if (!form.feeAcknowledged)         e.feeAcknowledged = 'Required to proceed'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setSubmitError('')
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      const firstField = Object.keys(e)[0]
      document.getElementById(`af-${firstField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/assessment/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (data.ok) {
        setRequestRef(data.requestRef || '')
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        // Show field-level errors if backend returned them
        if (data.fieldErrors) setErrors(data.fieldErrors)
        setSubmitError(data.error || 'Submission failed. Please try again.')
      }
    } catch (err) {
      setSubmitError('Could not reach the server. Please check your connection and try again, or email hellosmartious@gmail.com directly.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return <SuccessState form={form} requestRef={requestRef} nav={nav}/>

  const sectionStyle  = { background:V.white, border:`1px solid ${V.bone3}`, borderRadius:12, padding:'28px 28px 22px', marginBottom:22 }
  const sectionLabel  = { fontSize:11, color:V.gold3, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', marginBottom:8 }
  const sectionTitle  = { fontFamily:"'DM Serif Display',Georgia,serif", fontSize:24, color:V.ink, margin:'0 0 6px', lineHeight:1.2 }
  const sectionSub    = { fontSize:13.5, color:V.sl, lineHeight:1.6, marginBottom:20 }
  const fieldRow      = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:14, marginBottom:14 }
  const labelStyle    = { display:'block', fontSize:12, color:V.ink, fontWeight:600, marginBottom:6, letterSpacing:'.01em' }
  const inputStyle    = { width:'100%', padding:'10px 12px', border:`1px solid ${V.bone3}`, borderRadius:6, fontSize:14, fontFamily:'inherit', color:V.ink, background:V.bone, boxSizing:'border-box' }
  const errInputStyle = { ...inputStyle, borderColor:V.danger, background:'#FEF2F2' }
  const errMsgStyle   = { fontSize:11, color:V.danger, marginTop:4, fontWeight:600 }
  const chipStyle     = (selected) => ({
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
        <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
          placeholder={placeholder || ''} style={errors[key] ? errInputStyle : inputStyle} {...rest}/>
        {errors[key] && <div style={errMsgStyle}>{errors[key]}</div>}
      </div>
    )
  }

  return (
    <div style={{background:V.bone,minHeight:'100vh',paddingBottom:80,fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:V.ink}}>
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
            This form is the first step of our admissions process. Our Head of Admissions reviews every request before any assessment is scheduled. We respond within three business days regardless of decision.
          </p>
        </div>
      </header>

      <div style={{background:`${V.cr}08`,borderBottom:`1px solid ${V.bone3}`,padding:'22px 24px'}}>
        <div style={{maxWidth:820,margin:'0 auto'}}>
          <div style={{fontSize:11,color:V.cr,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:14}}>How the process works</div>
          <ol style={{margin:0,paddingLeft:0,listStyle:'none',counterReset:'step'}}>
            {[
              {h:'Submit this request',                    p:`Complete the five sections below. No payment is collected at this stage.`},
              {h:'Admissions review',                      p:`Our Head of Admissions evaluates fit. We respond to every request within three business days regardless of decision.`},
              {h:'Assessment fee invoiced on acceptance',  p:`USD ${ASSESSMENT_FEE_USD} (approx KES ${ASSESSMENT_FEE_KES.toLocaleString()}). Fee is credited against the first month's tuition on enrolment.`},
              {h:'Diagnostic assessment',                  p:`Structured testing across English, Mathematics and Science (~90 minutes), written report, and 30-minute consultation.`},
              {h:'Enrolment decision',                     p:`Admission is determined on assessment results, not this form alone.`},
            ].map((s,i) => (
              <li key={i} style={{display:'flex',gap:14,marginBottom:i===4?0:14,alignItems:'flex-start'}}>
                <div style={{flexShrink:0,width:26,height:26,borderRadius:'50%',background:V.cr,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700}}>{i+1}</div>
                <div style={{fontSize:13,lineHeight:1.6,color:V.ink}}>
                  <strong style={{color:V.ink,fontWeight:700}}>{s.h}.</strong>{' '}<span style={{color:V.sl}}>{s.p}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{maxWidth:820,margin:'30px auto 0',padding:'0 24px'}}>

        {autoDetected && (
          <div style={{background:`${V.gold3}10`,border:`1px solid ${V.gold3}40`,borderRadius:8,padding:'10px 14px',fontSize:12.5,color:V.ink,marginBottom:22,lineHeight:1.5}}>
            <strong style={{color:V.gold3,fontWeight:700}}>Location detected:</strong> {autoDetected.city}, {autoDetected.country} ({autoDetected.timezone}). We've pre-filled the location fields below.
          </div>
        )}

        {/* SECTION 1: STUDENT */}
        <section style={sectionStyle}>
          <div style={sectionLabel}>Section 1 of 5</div>
          <h2 style={sectionTitle}>About the student</h2>
          <p style={sectionSub}>Details about the child being assessed.</p>
          <div style={fieldRow}>
            {fld('studentFirstName','First name',{required:true,placeholder:'e.g. Amani'})}
            {fld('studentLastName','Last name',{required:true,placeholder:'e.g. Odhiambo'})}
          </div>
          <div style={fieldRow}>
            {fld('studentDOB','Date of birth',{type:'date',required:true})}
            <div id="af-studentGrade">
              <label style={labelStyle}>Current year / grade level <span style={{color:V.cr}}>*</span></label>
              <select value={form.studentGrade} onChange={e => set('studentGrade',e.target.value)} style={errors.studentGrade ? errInputStyle : inputStyle}>
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
            {fld('currentSchool','Current school (optional)',{placeholder:"e.g. Tokyo International School"})}
            {fld('studentEmail',"Student's email (optional)",{type:'email',placeholder:'For Year 7+ students'})}
          </div>
          <div>
            <label style={labelStyle}>Home language(s) (optional)</label>
            <input value={form.studentLanguages} onChange={e => set('studentLanguages',e.target.value)} placeholder="e.g. English, Japanese, Kiswahili" style={inputStyle}/>
          </div>
          <div style={{marginTop:14}}>
            <label style={labelStyle}>Learning needs or accommodations (optional)</label>
            <textarea value={form.learningNeeds} onChange={e => set('learningNeeds',e.target.value)} rows={3} placeholder="e.g. dyslexia, ADHD, English as additional language, gifted..." style={{...inputStyle,resize:'vertical',fontFamily:'inherit'}}/>
          </div>
        </section>

        {/* SECTION 2: PARENT */}
        <section style={sectionStyle}>
          <div style={sectionLabel}>Section 2 of 5</div>
          <h2 style={sectionTitle}>About the parent or guardian</h2>
          <p style={sectionSub}>Primary contact for the assessment and follow-up communication.</p>
          <div style={fieldRow}>
            {fld('parent1FirstName','First name',{required:true})}
            {fld('parent1LastName','Last name',{required:true})}
          </div>
          <div style={fieldRow}>
            <div id="af-parent1Relationship">
              <label style={labelStyle}>Relationship to student <span style={{color:V.cr}}>*</span></label>
              <select value={form.parent1Relationship} onChange={e => set('parent1Relationship',e.target.value)} style={errors.parent1Relationship ? errInputStyle : inputStyle}>
                <option value="">Select...</option>
                {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.parent1Relationship && <div style={errMsgStyle}>{errors.parent1Relationship}</div>}
            </div>
            {fld('parent1Email','Email',{type:'email',required:true,placeholder:'parent@example.com'})}
          </div>
          <div style={fieldRow}>
            {fld('parent1Phone','Phone (with country code)',{type:'tel',required:true,placeholder:'+254 745 021 212'})}
            <div id="af-preferredContact">
              <label style={labelStyle}>Preferred contact method <span style={{color:V.cr}}>*</span></label>
              <select value={form.preferredContact} onChange={e => set('preferredContact',e.target.value)} style={errors.preferredContact ? errInputStyle : inputStyle}>
                <option value="">Select...</option>
                {CONTACT_METHOD_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.preferredContact && <div style={errMsgStyle}>{errors.preferredContact}</div>}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Preferred contact time (optional)</label>
            <input value={form.preferredContactTime} onChange={e => set('preferredContactTime',e.target.value)} placeholder="e.g. weekday evenings JST 7-9 PM" style={inputStyle}/>
          </div>
          <div style={{marginTop:18,paddingTop:18,borderTop:`1px dashed ${V.bone3}`}}>
            <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontSize:13,color:V.ink}}>
              <input type="checkbox" checked={form.hasParent2} onChange={e => set('hasParent2',e.target.checked)} style={{width:16,height:16}}/>
              Add a second parent or guardian (optional)
            </label>
          </div>
          {form.hasParent2 && (
            <div style={{marginTop:14,paddingLeft:14,borderLeft:`3px solid ${V.gold3}30`}}>
              <div style={fieldRow}>
                {fld('parent2FirstName','First name')}
                {fld('parent2LastName','Last name')}
              </div>
              <div style={fieldRow}>
                <div>
                  <label style={labelStyle}>Relationship to student</label>
                  <select value={form.parent2Relationship} onChange={e => set('parent2Relationship',e.target.value)} style={inputStyle}>
                    <option value="">Select...</option>
                    {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {fld('parent2Email','Email',{type:'email'})}
              </div>
              <div>{fld('parent2Phone','Phone (with country code)',{type:'tel'})}</div>
            </div>
          )}
        </section>

        {/* SECTION 3: LOCATION */}
        <section style={sectionStyle}>
          <div style={sectionLabel}>Section 3 of 5</div>
          <h2 style={sectionTitle}>Where you are</h2>
          <p style={sectionSub}>Used to schedule the assessment in your local time zone.</p>
          <div style={fieldRow}>
            <div id="af-countryIso">
              <label style={labelStyle}>Country <span style={{color:V.cr}}>*</span></label>
              <select value={form.countryIso} onChange={e => set('countryIso',e.target.value)} style={errors.countryIso ? errInputStyle : inputStyle}>
                <option value="">Select country...</option>
                <optgroup label="Countries we currently serve">
                  {SERVED_COUNTRIES.map(c => <option key={c.iso} value={c.iso}>{c.name}</option>)}
                </optgroup>
                <option value="OTHER">Other (we'll arrange remote assessment)</option>
              </select>
              {errors.countryIso && <div style={errMsgStyle}>{errors.countryIso}</div>}
            </div>
            {fld('stateProvince','State / province / region (optional)',{placeholder:'e.g. Nairobi County'})}
          </div>
          <div style={fieldRow}>
            {fld('city','City',{required:true,placeholder:'e.g. Nairobi'})}
            {fld('timezone','Time zone (auto-detected)',{placeholder:'e.g. Africa/Nairobi'})}
          </div>
        </section>

        {/* SECTION 4: ACADEMIC */}
        <section style={sectionStyle}>
          <div style={sectionLabel}>Section 4 of 5</div>
          <h2 style={sectionTitle}>Academic situation & preferences</h2>
          <p style={sectionSub}>Helps our admissions team match the right curriculum and class group.</p>
          <div style={{marginBottom:18}}>
            <label style={labelStyle}>Curriculum interest (select all that apply) <span style={{color:V.cr}}>*</span></label>
            <div id="af-curriculumInterest">
              {CURRICULUM_OPTIONS.map(opt => (
                <span key={opt} onClick={() => toggleArr('curriculumInterest',opt)} style={chipStyle(form.curriculumInterest.includes(opt))}>{opt}</span>
              ))}
            </div>
            {errors.curriculumInterest && <div style={errMsgStyle}>{errors.curriculumInterest}</div>}
          </div>
          <div style={{marginBottom:18}}>
            <label style={labelStyle}>Target university region (select all that apply)</label>
            {TARGET_UNIVERSITY_OPTIONS.map(opt => (
              <span key={opt} onClick={() => toggleArr('targetUniversity',opt)} style={chipStyle(form.targetUniversity.includes(opt))}>{opt}</span>
            ))}
          </div>
          <div style={{marginBottom:18}}>
            <label style={labelStyle}>Why are you considering Smartious? (select all that apply)</label>
            {WHY_CONSIDERING_OPTIONS.map(opt => (
              <span key={opt} onClick={() => toggleArr('whyConsidering',opt)} style={chipStyle(form.whyConsidering.includes(opt))}>{opt}</span>
            ))}
          </div>
          <div>
            <label style={labelStyle}>Preferred class schedule</label>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:4}}>
              {['Morning (local time)','Afternoon (local time)','Evening (local time)','Flexible — recommend based on cohort'].map(opt => (
                <label key={opt} style={{display:'flex',alignItems:'center',gap:8,fontSize:13.5,color:V.ink,cursor:'pointer',padding:'8px 12px',border:`1px solid ${form.preferredSchedule===opt ? V.cr : V.bone3}`,borderRadius:6,background:form.preferredSchedule===opt ? `${V.cr}08` : V.bone}}>
                  <input type="radio" name="schedule" value={opt} checked={form.preferredSchedule===opt} onChange={e => set('preferredSchedule',e.target.value)}/>
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: ADDITIONAL */}
        <section style={sectionStyle}>
          <div style={sectionLabel}>Section 5 of 5</div>
          <h2 style={sectionTitle}>One more thing</h2>
          <p style={sectionSub}>So we can give credit where due and prepare specific responses.</p>
          <div style={fieldRow}>
            <div>
              <label style={labelStyle}>How did you hear about Smartious?</label>
              <select value={form.howDidYouHear} onChange={e => set('howDidYouHear',e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                {HEAR_ABOUT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Anything else we should know? (optional)</label>
            <textarea value={form.additionalInfo} onChange={e => set('additionalInfo',e.target.value)} rows={4} placeholder="Specific questions, timing constraints, university application deadlines..." style={{...inputStyle,resize:'vertical',fontFamily:'inherit'}}/>
          </div>
        </section>

        {/* ACKNOWLEDGMENT + SUBMIT */}
        <section style={{...sectionStyle,background:V.ink,border:'none',color:'#fff'}}>
          <div style={{...sectionLabel,color:V.gold3}}>Submit your request</div>
          <h2 style={{...sectionTitle,color:'#fff'}}>Acknowledge and submit</h2>
          <p style={{...sectionSub,color:'rgba(255,255,255,.78)'}}>
            By submitting you confirm the information is accurate. Our Head of Admissions will review and respond within three business days. If accepted, you'll receive an invoice for the assessment fee.
          </p>
          <label id="af-feeAcknowledged" style={{display:'flex',alignItems:'flex-start',gap:12,padding:'14px 16px',background:'rgba(255,255,255,.06)',border:`1px solid ${errors.feeAcknowledged ? V.danger : 'rgba(255,255,255,.18)'}`,borderRadius:8,cursor:'pointer',fontSize:13.5,lineHeight:1.55,color:'rgba(255,255,255,.9)',marginBottom:14}}>
            <input type="checkbox" checked={form.feeAcknowledged} onChange={e => set('feeAcknowledged',e.target.checked)} style={{width:16,height:16,marginTop:3,flexShrink:0}}/>
            <span>I understand this is an admissions request, not a confirmed booking. If accepted, I will pay the <strong style={{color:V.gold3}}>USD {ASSESSMENT_FEE_USD}</strong> assessment fee before the assessment is scheduled. The fee is credited against the first month's tuition on enrolment. <span style={{color:'rgba(255,255,255,.65)'}}>(Required to submit.)</span></span>
          </label>
          {errors.feeAcknowledged && <div style={{...errMsgStyle,color:'#FCA5A5',marginBottom:14}}>{errors.feeAcknowledged}</div>}

          {submitError && (
            <div style={{background:'rgba(185,28,28,.15)',border:'1px solid rgba(185,28,28,.4)',borderRadius:8,padding:'12px 16px',fontSize:13,color:'#FCA5A5',marginBottom:14,lineHeight:1.5}}>
              {submitError}
            </div>
          )}

          <button type="submit" disabled={submitting} style={{background:submitting ? '#A07A2E' : V.gold3,color:V.ink,border:'none',padding:'16px 32px',borderRadius:8,fontSize:15,fontWeight:800,cursor:submitting ? 'wait' : 'pointer',width:'100%',letterSpacing:'.01em',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:10}}>
            {submitting ? 'Submitting...' : <>Submit assessment request <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
          </button>
          <p style={{textAlign:'center',fontSize:11.5,color:'rgba(255,255,255,.55)',marginTop:16,lineHeight:1.5}}>
            We respond to every request within three business days.<br/>Your information is not shared with third parties.
          </p>
        </section>

      </form>
    </div>
  )
}

function SuccessState({ form, requestRef, nav }) {
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
          We've received your assessment request for {form.studentFirstName}. Our Head of Admissions will review the request and respond to <strong style={{color:V.ink}}>{form.parent1Email}</strong> within three business days.
        </p>
        {requestRef && (
          <div style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:10,padding:'16px 22px',marginBottom:24,display:'inline-block'}}>
            <div style={{fontSize:11,color:V.sl,marginBottom:4}}>Your reference number</div>
            <div style={{fontSize:22,fontFamily:'monospace',color:V.cr,fontWeight:700}}>{requestRef}</div>
          </div>
        )}
        <div style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:10,padding:'18px 22px',textAlign:'left',marginBottom:30}}>
          <div style={{fontSize:11,color:V.gold3,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:10}}>What happens next</div>
          <ol style={{margin:0,paddingLeft:18,fontSize:13.5,lineHeight:1.8,color:V.ink}}>
            <li>Confirmation email sent to {form.parent1Email}</li>
            <li>Admissions decision within three business days</li>
            <li>If accepted: invoice for USD {ASSESSMENT_FEE_USD} assessment fee</li>
            <li>Diagnostic assessment after payment (English, Maths, Science — ~90 min)</li>
            <li>Written report + 30-minute consultation with Head of Academics</li>
          </ol>
        </div>
        <button onClick={() => nav('/')} style={{background:V.cr,color:'#fff',border:'none',padding:'13px 28px',borderRadius:8,fontSize:14,fontWeight:700,cursor:'pointer'}}>
          Back to Smartious
        </button>
      </div>
    </div>
  )
}
