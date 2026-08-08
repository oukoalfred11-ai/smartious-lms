/* ═══════════════════════════════════════════════════════════════════
   CountryHub — Shared v2-depth country hub renderer.
   ───────────────────────────────────────────────────────────────────
   Replaces the 6 duplicated country hub blocks (Egypt, Morocco, South
   Korea, Japan, Vietnam, Thailand) that previously lived inside
   LandingPage.jsx. Fully data-driven from the country and cities props.
   
   This refactor ALSO fixes several substitution-leftover bugs that were
   live in production:
     · "In Egypt, established examination centres serve..." appearing
       in Morocco/Korea/Japan/Vietnam/Thailand hubs
     · "CAS coordination through local Egyptian community partnerships"
       appearing in IB Diploma delivery cards across all non-Egypt hubs
     · "Egyptian universities including AUC, GUC and BUE" appearing in
       Alfred's founder bio specialism line across all non-Egypt hubs
   
   All country-specific text now lives in the country data file (see
   the "v2-hub fields" section of each *_COUNTRY export). To add a new
   country with v2-depth content, populate the 16 v2-hub fields in the
   data file and Smartious renders the full hub automatically.
═══════════════════════════════════════════════════════════════════ */

import { useEffect } from 'react'

/* ────────────────────────────────────────────────────────────────
   Country-awareness helpers for cross-market content cleanup.
   
   EAST_AFRICA_HUBS: hubs where Nairobi-specific content (Diamond
   Plaza Parklands / Karen Hardy centre names, Kenya CBC in the
   curricula list) is genuinely locally relevant. On all other
   hubs (Gulf, North Africa, East Asia, Southeast Asia, Southern
   Africa) that content is replaced with country-neutral operational
   language to avoid diluting local search intent.
   
   REGION_LABELS: used in the "14+ countries served" trust card to
   frame the geographic distribution around the current country's
   region rather than always leading with East Africa.
   ──────────────────────────────────────────────────────────────── */
const EAST_AFRICA_HUBS = new Set(['kenya', 'ethiopia', 'rwanda'])

const REGION_LABELS = {
  kenya:         'East Africa, the Gulf and Asia',
  ethiopia:      'East Africa, the Gulf and Asia',
  rwanda:        'East Africa, the Gulf and Asia',
  'south-africa':'Africa, the Gulf and Asia',
  egypt:         'North Africa, the Gulf and East Asia',
  morocco:       'North Africa, Europe, the Gulf and Asia',
  uae:           'the Gulf, North Africa and Asia',
  qatar:         'the Gulf, North Africa and Asia',
  'saudi-arabia':'the Gulf, North Africa and Asia',
  japan:         'East Asia, the Gulf and Africa',
  'south-korea': 'East Asia, the Gulf and Africa',
  vietnam:       'Southeast Asia, the Gulf and Africa',
  thailand:      'Southeast Asia, the Gulf and Africa',
  malaysia:      'Southeast Asia, the Gulf and East Asia',
  turkey:        'the Middle East, Europe, and East Africa',
  kuwait:        'the Middle East, the Gulf, and East Africa',
  oman:          'the Gulf, East Africa, and Southeast Asia',
  taiwan:        'East Asia, Southeast Asia, and East Africa',
  ireland:       'Europe, North America, and East Africa',
  'united-kingdom': 'Europe, North America, and East Africa',
  india:         'South Asia, East Africa, and the Gulf',
  germany:       'Central Europe, North America, and East Africa',
  romania:       'Eastern Europe, the Gulf, and East Africa',
  ukraine:       'Eastern Europe, the diaspora, and East Africa',
}

/* ISO country codes for hreflang. Format: en-<CC> tells Google
   the page is English-language content targeting a specific
   country. Improves regional search indexation. */
const HREFLANG_MAP = {
  kenya:'en-ke', ethiopia:'en-et', rwanda:'en-rw',
  'south-africa':'en-za',
  egypt:'en-eg', morocco:'en-ma',
  uae:'en-ae', qatar:'en-qa', 'saudi-arabia':'en-sa',
  japan:'en-jp', 'south-korea':'en-kr',
  vietnam:'en-vn', thailand:'en-th',
  malaysia:'en-my',
  turkey:'en-tr',
  kuwait:'en-kw',
  oman:'en-om',
  taiwan:'en-tw',
  ireland:'en-ie',
  'united-kingdom':'en-gb',
  india:'en-in',
  germany:'en-de',
  romania:'en-ro',
  ukraine:'en-ua',
  spain:'en-es',
  denmark:'en-dk',
  france:'en-fr',
  italy:'en-it',
  poland:'en-pl',
}

/* Idempotent hreflang tag injection. Adds one rel=alternate tag for
   the current country's en-<CC>, one for the general en fallback,
   and one x-default pointing to the homepage. Cleanup removes any
   Smartious hreflang tags this instance created, so navigating to
   another hub doesn't leave stale tags in the head. */
function useHreflang(countrySlug) {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const hreflangCC = HREFLANG_MAP[countrySlug]
    if (!hreflangCC) return
    
    const url = `https://smartioushomeschool.com/online-school/${countrySlug}`
    const tags = [
      { rel: 'alternate', hreflang: hreflangCC, href: url },
      { rel: 'alternate', hreflang: 'en',       href: url },
      { rel: 'alternate', hreflang: 'x-default', href: 'https://smartioushomeschool.com/' },
    ]
    
    const created = tags.map(({ rel, hreflang, href }) => {
      const el = document.createElement('link')
      el.setAttribute('rel', rel)
      el.setAttribute('hreflang', hreflang)
      el.setAttribute('href', href)
      el.setAttribute('data-smartious-hreflang', '1')
      document.head.appendChild(el)
      return el
    })
    
    return () => {
      created.forEach(el => { try { el.remove() } catch (_) {} })
    }
  }, [countrySlug])
}

function CountryHub({
  country, cities, setCurrentCity,
  P, V, nav,
  SMARTIOUS_RATING, SMARTIOUS_REVIEWS,
  GOOGLE_REVIEWS_URL, LEAVE_REVIEW_URL,
}) {
  useHreflang(country.slug)
  // Rotate which 3 of the 5 verified reviews display, keyed off the country
  // slug. Same real reviews everywhere (never fabricated per-country) — this
  // just avoids every hub page rendering byte-identical review HTML.
  const reviewOffset = country.slug
    ? country.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % SMARTIOUS_REVIEWS.length
    : 0
  const displayReviews = [...SMARTIOUS_REVIEWS.slice(reviewOffset), ...SMARTIOUS_REVIEWS.slice(0, reviewOffset)].slice(0, 3)
  return (
    <>
      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context':'https://schema.org','@type':'EducationalOrganization',
        '@id':'https://smartioushomeschool.com' + country.hub + '#org',
        'name':'Smartious — Online Homeschooling Across ' + country.name,
        'url':'https://smartioushomeschool.com' + country.hub,
        'aggregateRating': {
          '@type':'AggregateRating',
          'ratingValue': SMARTIOUS_RATING.stars,
          'reviewCount': SMARTIOUS_RATING.count,
          'bestRating': 5,
          'worstRating': 1,
        },
        'description': country.heroSubhead + ' ' + country.heroValueProp,
        'areaServed': cities.map(c => ({ '@type':'Place','name': c.name + ', ' + c.county })),
        'offers': country.competitors.filter(c => c.isUs).map(c => ({
          '@type':'Offer', 'price': c.feesUsd, 'priceCurrency':'USD',
          'description': 'Annual tuition range for ' + c.curriculum,
        })),
      })}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context':'https://schema.org','@type':'BreadcrumbList',
        'itemListElement':[
          {'@type':'ListItem','position':1,'name':'Home','item':'https://smartioushomeschool.com/'},
          {'@type':'ListItem','position':2,'name':'Homeschooling ' + country.name,'item':'https://smartioushomeschool.com' + country.hub},
        ],
      })}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context':'https://schema.org','@type':'FAQPage',
        'mainEntity': country.faqs.map(f => ({
          '@type':'Question','name': f.q,
          'acceptedAnswer':{'@type':'Answer','text': f.a},
        })),
      })}}/>

      {/* ─── HERO ─── */}
      <section className="sec" style={{
        position:'relative',
        background:`linear-gradient(135deg, ${V.ink} 0%, ${V.cr} 100%)`,
        color:'#fff', padding:'72px 0 56px', overflow:'hidden',
      }}>
        <img src={country.heroImage} alt="" aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={e => { e.currentTarget.style.display='none' }}
          style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.55,zIndex:0}}/>
        <div style={{position:'absolute',inset:0,background:`linear-gradient(135deg, ${V.ink}80 0%, ${V.cr}66 100%)`,zIndex:1}}/>
        <div className="wrap" style={{maxWidth:920,margin:'0 auto',position:'relative',zIndex:2}}>
          <div className="eyebrow" style={{color:V.gold3,marginBottom:10}}>{country.heroEyebrow} · Virtual school</div>
          <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'clamp(2.2rem, 4.8vw, 3.4rem)',fontWeight:400,color:'#fff',lineHeight:1.05,marginBottom:18,letterSpacing:'-.01em'}}>
            Online School &amp; Homeschool in <em style={{color:V.gold3,fontStyle:'italic'}}>{country.heroH1Suffix}</em>
          </h1>
          <p style={{fontSize:17,color:'rgba(255,255,255,.92)',lineHeight:1.7,marginBottom:16,maxWidth:760}}>{country.heroSubhead}</p>
          <p style={{fontSize:15,color:'rgba(255,255,255,.86)',lineHeight:1.7,marginBottom:24,maxWidth:760}}>{country.heroValueProp}</p>
          <div style={{display:'flex',gap:14,flexWrap:'wrap',alignItems:'center'}}>
            <button onClick={() => nav('/assessment?from=' + country.slug)}
              style={{background:V.gold3,color:V.ink,border:'none',padding:'18px 36px',borderRadius:10,fontSize:16,fontWeight:800,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,letterSpacing:'.01em',boxShadow:'0 8px 24px rgba(201,151,58,.35)',transition:'all .18s ease'}}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(201,151,58,.5)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,151,58,.35)' }}>
              Book assessment
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button onClick={() => nav('/consult')}
              style={{background:'transparent',color:'#fff',border:'2px solid rgba(255,255,255,.55)',padding:'16px 32px',borderRadius:10,fontSize:16,fontWeight:700,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,letterSpacing:'.01em',transition:'all .18s ease'}}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = V.gold3; e.currentTarget.style.color = V.gold3; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.55)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Book Free Consultation
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <span style={{fontSize:12.5,color:'rgba(255,255,255,.62)',letterSpacing:'.01em',width:'100%'}}>
              Admissions reviews every request &middot; assessment fee billed only on acceptance
            </span>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section style={{background:V.ink,color:'#fff',padding:'28px 0',borderTop:`1px solid rgba(255,255,255,.08)`,borderBottom:`1px solid rgba(255,255,255,.08)`}}>
        <div className="wrap">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:18,maxWidth:1100,margin:'0 auto',textAlign:'center'}}>
            {country.trustSignals.map((t,i) => (
              <div key={i}>
                <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.9rem',color:V.gold3,lineHeight:1,marginBottom:4,fontWeight:400}}>{t.value}</div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#fff',marginBottom:3}}>{t.metric}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.65)',lineHeight:1.4}}>{t.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CITIES GRID ─── */}
      <section className="sec" style={{background:V.white,paddingTop:64,paddingBottom:64}}><div className="wrap">
        <div style={{textAlign:'center',marginBottom:44,maxWidth:720,margin:'0 auto 44px'}}>
          <div className="eyebrow" style={{justifyContent:'center'}}>Cities we serve</div>
          <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
            {country.citiesSectionTitle}
          </h2>
          <p style={{fontSize:15,color:V.sl,lineHeight:1.7}}>{country.citiesSectionBody}</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:14,maxWidth:1100,margin:'0 auto'}}>
          {cities.map(c => (
            <a key={c.slug} href={'/homeschool-' + c.slug}
              onClick={(e) => { e.preventDefault(); setCurrentCity(c.slug); nav('/homeschool-' + c.slug); P(country.cityPageId) }}
              style={{display:'block',background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:12,padding:'20px 22px',textDecoration:'none',color:'inherit',transition:'all .2s',cursor:'pointer'}}
              onMouseEnter={e => { e.currentTarget.style.borderColor = V.cr; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(8,12,20,.06)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = V.bone3; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{fontSize:10.5,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:V.gold3,marginBottom:6}}>{c.county}</div>
              <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.25rem',color:V.ink,marginBottom:6,lineHeight:1.3}}>{c.name}</div>
              <p style={{fontSize:13,color:V.sl,lineHeight:1.55,margin:'6px 0 12px'}}>{c.region}</p>
              <div style={{fontSize:12,color:V.cr,fontWeight:700,display:'inline-flex',alignItems:'center',gap:5}}>
                View {c.name} details
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </a>
          ))}
        </div>
      </div></section>

      {/* ─── COMPETITOR ANALYSIS ─── */}
      <section className="sec" style={{background:V.bone,paddingTop:56,paddingBottom:56}}><div className="wrap">
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
            <div className="eyebrow" style={{justifyContent:'center'}}>Honest comparison</div>
            <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.95rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.2}}>
              How Smartious compares to top {country.name} schools
            </h2>
            <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{country.competitorsIntro}</p>
          </div>
          <div style={{background:V.white,borderRadius:12,border:`1px solid ${V.bone3}`,overflow:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,minWidth:760}}>
              <thead>
                <tr style={{background:V.ink,color:'#fff'}}>
                  <th style={{padding:'14px 16px',textAlign:'left',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>School</th>
                  <th style={{padding:'14px 16px',textAlign:'left',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Curriculum</th>
                  <th style={{padding:'14px 16px',textAlign:'left',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Fees ({country.currency}/year)</th>
                  <th style={{padding:'14px 16px',textAlign:'left',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Status / Rating</th>
                  <th style={{padding:'14px 16px',textAlign:'left',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Reality check</th>
                </tr>
              </thead>
              <tbody>
                {country.competitors.map((c, i) => (
                  <tr key={i} style={{
                    background: c.isUs ? `rgba(139,26,46,.06)` : (i % 2 === 0 ? V.white : V.bone),
                    borderTop: c.isUs ? `2px solid ${V.cr}` : `1px solid ${V.bone3}`,
                  }}>
                    <td style={{padding:'14px 16px',verticalAlign:'top'}}>
                      <div style={{fontWeight:700,color:c.isUs?V.cr:V.ink,marginBottom:2,fontSize:13.5}}>{c.name}{c.isUs && <span style={{marginLeft:8,fontSize:9.5,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold3,fontWeight:700}}>← us</span>}</div>
                      <div style={{fontSize:11.5,color:V.sl}}>{c.city}</div>
                    </td>
                    <td style={{padding:'14px 16px',verticalAlign:'top',color:V.sl,fontSize:12.5}}>{c.curriculum}</td>
                    <td style={{padding:'14px 16px',verticalAlign:'top',color:V.ink,fontSize:12.5,fontWeight:600,whiteSpace:'nowrap'}}>{c.feesAed}</td>
                    <td style={{padding:'14px 16px',verticalAlign:'top',color:V.sl,fontSize:12}}>{c.rating}</td>
                    <td style={{padding:'14px 16px',verticalAlign:'top',color:V.sl,fontSize:12,fontStyle:c.isUs?'normal':'italic'}}>{c.capacityNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{fontSize:11.5,color:V.sl,textAlign:'center',marginTop:14,fontStyle:'italic'}}>
            Fee ranges reflect published 2026 tuition for Year 7-13 across the school's tier structure. Specific fees vary by year group and additional school charges (registration, capital fee, books, transport, uniforms). Smartious USD pricing translates to fixed {country.currency} via the {country.currencyPeg.rate} peg.
          </p>
        </div>
      </div></section>

      {/* ─── HOMESCHOOL LEGAL FRAMEWORK ─── */}
      <section className="sec" style={{background:V.white,paddingTop:56,paddingBottom:56}}><div className="wrap">
        <div style={{maxWidth:880,margin:'0 auto'}}>
          <div className="eyebrow">Regulatory framework</div>
          <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.95rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:16,lineHeight:1.2}}>
            Homeschool laws &amp; regulatory framework in the {country.name}
          </h2>
          <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7,marginBottom:28}}>{country.legalFrameworkIntro}</p>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {country.legalFramework.map((item, i) => (
              <div key={i} style={{background:V.bone,border:`1px solid ${V.bone3}`,borderLeft:`3px solid ${V.cr}`,borderRadius:8,padding:'18px 22px'}}>
                <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.05rem',color:V.ink,marginBottom:8,lineHeight:1.3,fontWeight:400}}>{item.h}</h3>
                <p style={{fontSize:14,color:V.sl,lineHeight:1.7,margin:0}}>{item.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div></section>

      {/* ─── WHY SMARTIOUS — EXPANDED ─── */}
      <section className="sec" style={{background:V.bone,paddingTop:56,paddingBottom:56}}><div className="wrap">
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:40,maxWidth:780,margin:'0 auto 40px'}}>
            <div className="eyebrow" style={{justifyContent:'center'}}>Why families choose us</div>
            <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.95rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
              Why {country.name} families choose Smartious
            </h2>
            <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>Reasons grounded in the realities of {country.name} education — local school capacity constraints, corporate transfer and diplomatic timing, commute and logistics, currency stability, and the curriculum portability that mobile expat and dual-nationality families need.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(310px,1fr))',gap:14}}>
            {country.whySmartious.map((r, i) => (
              <div key={i} style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:12,padding:'22px 24px',display:'flex',flexDirection:'column',gap:10}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:`rgba(139,26,46,.08)`,color:V.cr,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,flexShrink:0}}>{i+1}</div>
                <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.1rem',color:V.cr,margin:'0 0 6px',lineHeight:1.3,fontWeight:400}}>{r.h}</h3>
                <p style={{fontSize:13.5,color:V.sl,lineHeight:1.7,margin:0}}>{r.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div></section>

      {/* ─── TRUST / SOCIAL PROOF ─── */}
      <section className="sec" style={{background:V.white,paddingTop:56,paddingBottom:56}}><div className="wrap">
        <div style={{maxWidth:980,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:34,maxWidth:720,margin:'0 auto 34px'}}>
            <div className="eyebrow" style={{justifyContent:'center'}}>Trust signals</div>
            <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.95rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
              What you can verify about Smartious
            </h2>
            <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>We publish only facts we can substantiate — operational history, curriculum coverage, teacher base, and infrastructure. No invented testimonials or pass-rate claims.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14,marginBottom:32}}>
            {[
              {h:'Founder-led education company', p: EAST_AFRICA_HUBS.has(country.slug)
                ? 'Founded 2019 by Alfred Ouko (BEd Mathematics & Physics, University of Nairobi). Smartious is a registered education company operating two physical centres (Diamond Plaza Parklands HQ established 2022, Karen Hardy centre established 2023) alongside the online platform.'
                : 'Founded 2019 by Alfred Ouko (BEd Mathematics & Physics). Smartious operates a full teaching team of 11 with two international-standard operational centres established 2022 and 2023. Not a marketplace, not a freelance network.'},
              {h: EAST_AFRICA_HUBS.has(country.slug) ? 'Two physical Nairobi centres' : 'Two operational centres',
                p: EAST_AFRICA_HUBS.has(country.slug)
                  ? 'Diamond Plaza Parklands HQ (established 2022) and Karen Hardy centre (established 2023). Online tutors operate from these centres, providing accountability and infrastructure beyond pure-online models.'
                  : `Live teaching is delivered to ${country.name} families from two international-standard operational centres, established 2022 and 2023. Teachers work from professional academic facilities with accountability and infrastructure beyond marketplace or freelance models.`},
              {h:'Cambridge-trained PGCE specialists', p:'Teachers are PGCE-qualified subject specialists with Cambridge International training. Subject specialism means a Chemistry teacher teaches only Chemistry — not generalist primary-style teaching.'},
              {h:'14+ countries served', p: `Active students in ${country.name} and 13 other markets across ${REGION_LABELS[country.slug] || 'Africa, the Gulf, Europe and Asia'}. Verifiable through cross-country cohort interaction in live classes.`},
              {h:'Ontario Diploma (OSSD) partnership', p:'Smartious students can earn the Ontario Secondary School Diploma through our partnership with Canadian Cross International School (Ontario-inspected private school). The OSSD is recognised by Canadian universities (OUAC), US universities (Common Application), UK universities (UCAS) and globally — particularly valuable for Canadian U15 applications.'},
              {h: EAST_AFRICA_HUBS.has(country.slug) ? '6 international curricula' : '5 international curricula',
                p: EAST_AFRICA_HUBS.has(country.slug)
                  ? 'Cambridge IGCSE & A-Level (primary offering), Pearson Edexcel International GCSE & A-Level, IB Diploma Programme, American Curriculum with AP, Ontario Secondary School Diploma (OSSD) via Canadian Cross International School partnership, Kenya CBC. Multiple credential pathways per family.'
                  : 'Cambridge IGCSE & A-Level (primary offering), Pearson Edexcel International GCSE & A-Level, IB Diploma Programme, American Curriculum with AP, Ontario Secondary School Diploma (OSSD) via Canadian Cross International School partnership. Multiple credential pathways per family.'},
              {h:'Live class transparency', p:'Every class is live with recorded sessions for review. Parents can audit class quality directly. This is materially different from pre-recorded video courses with light tutor support.'},
            ].map((t, i) => (
              <div key={i} style={{padding:'18px 20px',background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:10}}>
                <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1rem',color:V.ink,margin:'0 0 6px',lineHeight:1.3,fontWeight:400}}>{t.h}</h3>
                <p style={{fontSize:13,color:V.sl,lineHeight:1.65,margin:0}}>{t.p}</p>
              </div>
            ))}
          </div>
          {/* ─── REAL GOOGLE REVIEWS ─── */}
          <div style={{marginTop:32,paddingTop:32,borderTop:`1px solid ${V.bone3}`}}>
            <div style={{textAlign:'center',marginBottom:28}}>
              <div className="eyebrow" style={{justifyContent:'center'}}>What parents say</div>
              <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.6rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.2}}>
                {SMARTIOUS_RATING.stars} from {SMARTIOUS_RATING.count}+ verified Google reviews
              </h3>
              <div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'8px 16px',background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:24,fontSize:12.5,color:V.sl}}>
                <span style={{color:V.gold3,fontSize:16,letterSpacing:'.05em'}}>{'\u2605\u2605\u2605\u2605\u2605'}</span>
                <span style={{fontWeight:700,color:V.ink}}>{SMARTIOUS_RATING.stars} / 5</span>
                <span>·</span>
                <span>{SMARTIOUS_RATING.count}+ Google reviews</span>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:16,marginBottom:24}}>
              {displayReviews.map((r, i) => (
                <div key={i} style={{padding:'20px 22px',background:V.white,border:`1px solid ${V.bone3}`,borderRadius:10,display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{color:V.gold3,fontSize:15,letterSpacing:'.05em'}}>{'\u2605'.repeat(r.rating)}</div>
                  <p style={{fontSize:13,color:V.ink,lineHeight:1.65,margin:0,flex:1}}>&ldquo;{r.text}&rdquo;</p>
                  <div style={{fontSize:11,color:V.sl,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',marginTop:4}}>[+] {r.source}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginTop:8}}>
              <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="btn-o" style={{textDecoration:'none'}}>
                Read all reviews on Google &raquo;
              </a>
              <a href={LEAVE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="btn-p" style={{textDecoration:'none'}}>
                Leave us a review &raquo;
              </a>
            </div>
            <p style={{fontSize:11.5,color:V.sl,lineHeight:1.6,textAlign:'center',marginTop:18,fontStyle:'italic',maxWidth:680,margin:'18px auto 0'}}>
              Reviews above are from our verified Google Business Profile. For {country.name}-specific parent references during your decision-making, request these during your free assessment — we can introduce you to current {country.name} families happy to share their experience directly.
            </p>
          </div>
        </div>
      </div></section>

      {/* ─── ACCREDITATION, RECOGNITION & UNIVERSITY PATHWAYS ─── */}
      <section className="sec" style={{background:V.white,paddingTop:64,paddingBottom:64,borderTop:`1px solid ${V.bone3}`}}><div className="wrap">
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36,maxWidth:780,marginLeft:'auto',marginRight:'auto'}}>
            <div className="eyebrow" style={{justifyContent:'center'}}>Accreditation &amp; Recognition</div>
            <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.2}}>
              Accreditation, Recognition &amp; University Pathways
            </h2>
            <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>
              Smartious students earn qualifications administered by independent international examination boards. Recognition flows from the board itself &mdash; not from the school that delivered the curriculum. Below is the accreditation, examination and verification framework that connects {country.adjective} Smartious students to universities worldwide.
            </p>
          </div>

          {/* Five curriculum pathways */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:18,marginBottom:40}}>
            {[
              {h:'Cambridge International',sub:'Cambridge Assessment International Education · University of Cambridge',p:country.cambridgeCardDescription},
              {h:'Pearson Edexcel International',sub:'Pearson · UK Edexcel curriculum adapted for international delivery',p:'International GCSE and International A-Level qualifications, administered by Pearson. Three examination series annually (January, May/June, October/November) providing additional flexibility versus the Cambridge twice-yearly schedule.'},
              {h:'International Baccalaureate Organisation',sub:'IB Diploma Programme · IBO Geneva',p:'IB Diploma administered by the International Baccalaureate Organisation in Geneva. Recognised by leading universities globally with particularly strong weighting at US Ivy League, US selective liberal arts colleges, Canadian U15 and top European universities.'},
              {h:'College Board',sub:'American Curriculum with Advanced Placement (AP)',p:'AP courses and examinations administered by the College Board, the US non-profit responsible for the SAT and AP programmes. AP scores are widely recognised by US universities for university credit, plus by Canadian, UK, Australian and many universities worldwide.'},
              {h:'Ontario Secondary School Diploma (OSSD)',sub:'Canadian Cross International School · Ontario Ministry of Education',p:'OSSD earned through Smartious\'s partnership with Canadian Cross International School, an Ontario-inspected private school. Smartious students enrol concurrently with CCIS to complete the OSSD curriculum and credit requirements alongside Cambridge or other pathways. OSSD is one of the most recognised secondary credentials worldwide — particularly strong for Canadian U15 admissions via OUAC, US universities via Common Application, and UK universities via UCAS.'},
            ].map((c,i) => (
              <div key={i} style={{padding:'22px 22px',background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:10,borderLeft:`3px solid ${V.cr}`}}>
                <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.1rem',color:V.ink,margin:'0 0 4px',lineHeight:1.3,fontWeight:400}}>{c.h}</h3>
                <p style={{fontSize:11.5,color:V.gold3,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',margin:'0 0 10px'}}>{c.sub}</p>
                <p style={{fontSize:13,color:V.sl,lineHeight:1.65,margin:0}}>{c.p}</p>
              </div>
            ))}
          </div>

          {/* Examination centre arrangements */}
          <div style={{padding:'28px 30px',background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:10,marginBottom:32}}>
            <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.3rem',color:V.ink,margin:'0 0 12px',lineHeight:1.3,fontWeight:400}}>Examination centre arrangements in {country.name}</h3>
            <p style={{fontSize:14,color:V.sl,lineHeight:1.7,margin:'0 0 14px'}}>
              International examinations require attendance at authorised examination centres on specific dates. In {country.name}, established examination centres serve Cambridge International, Pearson Edexcel and other major international qualifications.
            </p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:12}}>
              {country.examCentreTiles.map((c,i) => (
                <div key={i} style={{padding:'12px 14px',background:V.white,borderRadius:8,border:`1px solid ${V.bone3}`}}>
                  <div style={{fontSize:11,color:V.gold3,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',marginBottom:4}}>{c.city}</div>
                  <div style={{fontSize:13.5,color:V.ink,fontWeight:600,marginBottom:2}}>{c.centre}</div>
                  <div style={{fontSize:12,color:V.sl}}>{c.area}</div>
                </div>
              ))}
            </div>
            <p style={{fontSize:13,color:V.sl,lineHeight:1.65,margin:'14px 0 0',fontStyle:'italic'}}>
              Smartious manages examination registration logistics including centre selection, registration paperwork and deadline compliance. {country.examLogisticsProse}
            </p>
          </div>

          {/* University recognition worldwide */}
          <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.3rem',color:V.ink,marginTop:24,marginBottom:14,lineHeight:1.3,fontWeight:400,textAlign:'center'}}>University recognition worldwide</h3>
          <p style={{fontSize:14,color:V.sl,lineHeight:1.7,marginBottom:20,textAlign:'center',maxWidth:780,marginLeft:'auto',marginRight:'auto'}}>
            Cambridge International, Pearson Edexcel, IB Diploma and American AP qualifications are recognised across the major university systems globally.
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:14,marginBottom:32}}>
            {[
              {region: country.name, unis: country.universitiesInCountry},
              {region:'United Kingdom',unis:'Cambridge · Oxford · Imperial College London · UCL · LSE · King\'s College London · Edinburgh · Manchester · Bristol · Birmingham · Warwick · Durham · the Russell Group · the broader UK system via UCAS'},
              {region:'United States',unis:'Harvard · Yale · Princeton · Columbia · Penn · Brown · Dartmouth · Cornell · Amherst · Williams · Pomona · UC Berkeley · UCLA · Michigan · Virginia · top liberal arts and public research universities via the Common Application'},
              {region:'Canada',unis:'Toronto · McGill · UBC · McMaster · Waterloo · Western · Queen\'s · the U15 research universities · OUAC for Ontario applications'},
              {region:'Australia',unis:'Melbourne · Sydney · ANU · Monash · Queensland · UWA · Adelaide · UNSW · the Group of Eight via UAC'},
              {region:'Gulf & Saudi Arabia',unis:'NYU Abu Dhabi · Sorbonne Abu Dhabi · Khalifa · AUS · AUD · UAE branch campuses · KFUPM · KAUST · KSU · KAU · Saudi national universities · Education City Doha (Georgetown · Northwestern · CMU · Cornell · Texas A&M · HEC Paris · UCL)'},
              {region:'Europe',unis:'Berlin Humboldt · Munich LMU · Heidelberg · RWTH Aachen · TU Munich · French Grandes Écoles · Amsterdam · Leiden · Utrecht · Bologna · Sapienza · ETH Zurich · EPFL'},
            ].map((r,i) => (
              <div key={i} style={{padding:'18px 20px',background:V.white,border:`1px solid ${V.bone3}`,borderRadius:10}}>
                <div style={{fontSize:11,color:V.gold3,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>{r.region}</div>
                <p style={{fontSize:12.5,color:V.sl,lineHeight:1.65,margin:0}}>{r.unis}</p>
              </div>
            ))}
          </div>

          {/* How universities verify */}
          <div style={{padding:'24px 28px',background:`linear-gradient(135deg, ${V.bone} 0%, ${V.white} 100%)`,border:`1px solid ${V.bone3}`,borderLeft:`3px solid ${V.gold3}`,borderRadius:10}}>
            <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.2rem',color:V.ink,margin:'0 0 10px',lineHeight:1.3,fontWeight:400}}>How universities verify qualifications</h3>
            <p style={{fontSize:13.5,color:V.sl,lineHeight:1.7,margin:0}}>
              Universities verify Cambridge International, Pearson Edexcel, IB Diploma and American AP qualifications directly with the issuing examination boards through standard verification services &mdash; Cambridge International Verification of Awards, Pearson's Verification of Results, the IB Organisation's verification service, and the College Board AP Score Reporting service. The qualification's credibility comes from the examination board itself, which is why these qualifications are equally valid whether earned at a physical school or through Smartious.
            </p>
          </div>
        </div>
      </div></section>

      {/* ─── CURRICULUM DEEP DIVES ─── */}
      <section className="sec" style={{background:V.bone,paddingTop:64,paddingBottom:64}}><div className="wrap">
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36,maxWidth:780,marginLeft:'auto',marginRight:'auto'}}>
            <div className="eyebrow" style={{justifyContent:'center'}}>Curriculum pathways</div>
            <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.2}}>
              Curriculum approaches we offer {country.adjective} families
            </h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:18}}>
            {[
              {
                h:'British Curriculum',
                sub:'Cambridge IGCSE & A-Level · Pearson Edexcel',
                structure:'Cambridge IGCSE: Years 10-11, eight to ten subjects. Cambridge A-Level: Years 12-13, three or four subjects in depth. Pearson Edexcel as British alternative with three examination series annually.',
                suits: country.britishCurriculumSuits,
                delivery: country.britishCurriculumDelivery,
              },
              {
                h:'IB Diploma Programme',
                sub:'International Baccalaureate Organisation',
                structure:'Grades 11-12. Six subjects (three Higher Level, three Standard Level), plus Theory of Knowledge, the Extended Essay (4,000-word independent research paper), and Creativity, Activity and Service (CAS).',
                suits: country.ibDiplomaSuits,
                delivery: country.ibDiplomaDelivery,
              },
              {
                h:'American Curriculum',
                sub:'College Board · AP · SAT & ACT',
                structure:'US high school curriculum through Grade 12. Advanced Placement courses Grades 9-12 with college-level subject specialisation. SAT or ACT preparation integrated alongside curriculum delivery.',
                suits: country.americanCurriculumSuits,
                delivery: country.americanCurriculumDelivery,
              },
              {
                h:'Ontario Secondary School Diploma',
                sub:'OSSD · via Canadian Cross International School partnership',
                structure:'Grades 9-12 Ontario curriculum delivered through Smartious\'s partnership with Canadian Cross International School (Ontario-inspected private secondary school). Students complete the 30 credits required for OSSD including the Ontario Secondary School Literacy Test (OSSLT) and 40 community involvement hours.',
                suits:`${country.adjective} families targeting Canadian U15 universities (Toronto, McGill, UBC, McMaster, Waterloo, Western, Queen's) via OUAC, US universities via the Common Application, UK universities via UCAS, and Australian universities. The OSSD is particularly strong for direct Canadian university applications because students apply as Ontario secondary graduates rather than international students.`,
                delivery:'Live online instruction by qualified subject teachers, concurrent enrolment with Canadian Cross International School for official OSSD transcripting, Ontario course codes (ENG4U, MHF4U, SCH4U etc.) recorded against each student. CCIS issues the official Ontario diploma and transcript on successful completion of the OSSD requirements.',
              },
            ].map((c,i) => (
              <div key={i} style={{padding:'24px 24px',background:V.white,border:`1px solid ${V.bone3}`,borderRadius:10,display:'flex',flexDirection:'column',gap:14}}>
                <div>
                  <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.2rem',color:V.ink,margin:'0 0 4px',lineHeight:1.3,fontWeight:400}}>{c.h}</h3>
                  <p style={{fontSize:11,color:V.gold3,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',margin:0}}>{c.sub}</p>
                </div>
                <div>
                  <div style={{fontSize:11,color:V.ink,fontWeight:700,letterSpacing:'.04em',textTransform:'uppercase',marginBottom:4}}>Structure</div>
                  <p style={{fontSize:13,color:V.sl,lineHeight:1.65,margin:0}}>{c.structure}</p>
                </div>
                <div>
                  <div style={{fontSize:11,color:V.ink,fontWeight:700,letterSpacing:'.04em',textTransform:'uppercase',marginBottom:4}}>Suits families targeting</div>
                  <p style={{fontSize:13,color:V.sl,lineHeight:1.65,margin:0}}>{c.suits}</p>
                </div>
                <div>
                  <div style={{fontSize:11,color:V.ink,fontWeight:700,letterSpacing:'.04em',textTransform:'uppercase',marginBottom:4}}>Smartious delivery</div>
                  <p style={{fontSize:13,color:V.sl,lineHeight:1.65,margin:0}}>{c.delivery}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div></section>

      {/* ─── PRIMARY / SECONDARY / SIXTH FORM PROGRAMMES ─── */}
      <section className="sec" style={{background:V.white,paddingTop:64,paddingBottom:64}}><div className="wrap">
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36,maxWidth:780,marginLeft:'auto',marginRight:'auto'}}>
            <div className="eyebrow" style={{justifyContent:'center'}}>School programmes</div>
            <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.2}}>
              Primary, Secondary &amp; Sixth Form
            </h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:18}}>
            {[
              {
                h:'Primary Programmes',
                age:'Ages 5-11 · Years 1-6 · Grades 1-5 · IB PYP',
                p:`Cambridge Primary, Common Core or IB Primary Years Programme. Live classes are age-appropriate in length (40-50 minutes), scheduled in your local ${country.timezone?.code || 'EAT'} time zone to suit Primary-age attention spans. Small group sizes support individual attention. Weekly parent dashboards and monthly written reports cover academic and developmental progress.`,
              },
              {
                h:'Secondary Programmes',
                age:'Years 7-11 · Grades 6-11',
                p:`Lower Secondary (Years 7-9) builds the foundations for IGCSE entry. IGCSE Years (10-11) cover eight to ten subjects with examination registration at ${country.secondaryProgrammeExamRef}. One-on-one subject choice consultation at IGCSE entry aligns subjects with university targets. Mid-year arrivals accepted with academic catch-up support.`,
              },
              {
                h:'Sixth Form & University Preparation',
                age:'Years 12-13 · Grades 11-12',
                p: country.universityChannels,
              },
            ].map((c,i) => (
              <div key={i} style={{padding:'24px 24px',background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:10}}>
                <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.2rem',color:V.ink,margin:'0 0 6px',lineHeight:1.3,fontWeight:400}}>{c.h}</h3>
                <p style={{fontSize:11,color:V.gold3,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',margin:'0 0 12px'}}>{c.age}</p>
                <p style={{fontSize:13,color:V.sl,lineHeight:1.7,margin:0}}>{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div></section>

      {/* ─── WHY FAMILIES TRUST SMARTIOUS — 8 PILLARS ─── */}
      <section className="sec" style={{background:V.bone,paddingTop:64,paddingBottom:64}}><div className="wrap">
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36,maxWidth:780,marginLeft:'auto',marginRight:'auto'}}>
            <div className="eyebrow" style={{justifyContent:'center'}}>Why families trust Smartious</div>
            <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.2}}>
              Eight reasons {country.adjective} families choose Smartious
            </h2>
            <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>
              Each reason is grounded in something verifiable &mdash; not in marketing claims.
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:14}}>
            {[
              {h:'Experienced international educators',p:'Subject-specific degree-qualified teaching staff with cumulative experience across Cambridge International, Pearson Edexcel, IB Diploma and American Curriculum. Many hold advanced teaching credentials including PGCE, Cambridge PDT certification, or national teaching registration in their home jurisdiction.'},
              {h:'Personalised learning plans',p:'Every student begins with an initial assessment. The learning plan that follows is tailored to academic level, subject preferences, target universities and family situation &mdash; not a one-size-fits-all schedule.'},
              {h:'Academic assessments',p:'Initial diagnostic assessment. Weekly informal assessment within classes. Monthly formal assessments. Mock examinations under timed conditions during IGCSE and A-Level years. Results inform teaching adjustments.'},
              {h:'Small class sizes',p:'Online tier classes have four to six students. Online Plus has smaller groups. Premium is one-on-one. Class size affects individual attention, question response time, and student speaking time during class.'},
              {h:'Progress monitoring',p:'Weekly parent dashboards showing attendance and assessment results. Monthly written subject reports from each teacher. Termly comprehensive reports covering academic progress, study habits and university preparation.'},
              {h:'Parent communication',p:'Direct communication with subject teachers and form tutors via the parent portal. Email for admissions and pastoral matters, with response within one business day. Scheduled parent-teacher meetings each term.'},
              {h:'Global student community',p:'Live classes bring together students from across 14 countries. Wednesday afternoon enrichment programmes &mdash; coding, robotics, debate, Model UN, chess, journalism, leadership &mdash; develop collaborative learning across geographies.'},
              {h:'University admissions guidance',p:'Progressive guidance from Year 10 onwards. UCAS, Common Application, OUAC, UAC and direct university application support. Personal statement coaching, interview preparation and offer-management guidance.'},
            ].map((c,i) => (
              <div key={i} style={{padding:'20px 22px',background:V.white,border:`1px solid ${V.bone3}`,borderRadius:10,borderTop:`3px solid ${V.gold3}`}}>
                <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.05rem',color:V.ink,margin:'0 0 8px',lineHeight:1.3,fontWeight:400}}>{c.h}</h3>
                <p style={{fontSize:13,color:V.sl,lineHeight:1.65,margin:0}}>{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div></section>

      {/* ─── ABOUT THE FOUNDER — Alfred Ouko ─── */}
      <section className="sec" style={{background:V.white,paddingTop:64,paddingBottom:64,borderTop:`1px solid ${V.bone3}`}}><div className="wrap">
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:36,alignItems:'start'}}>
            <div style={{width:180,height:180,borderRadius:'50%',overflow:'hidden',flexShrink:0,boxShadow:'0 8px 24px rgba(139,26,46,.25)',border:`3px solid ${V.gold3}`,background:V.bone}}>
              <img src="/alfred-ouko-founder.jpg"
                alt="Alfred Ouko, founder and CEO of Smartious Homeschool"
                loading="lazy"
                style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
            </div>
            <div>
              <div className="eyebrow">About the founder</div>
              <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.9rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:6,lineHeight:1.2}}>Alfred Ouko</h2>
              <p style={{fontSize:13.5,color:V.gold3,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',margin:'0 0 18px'}}>Founder, Smartious Homeschool &amp; eSchool</p>

              <p style={{fontSize:14.5,color:V.sl,lineHeight:1.75,margin:'0 0 16px'}}>
                Alfred Ouko is the founder of Smartious Homeschool &amp; eSchool, established in 2019 while studying at the University of Nairobi. He has grown the organisation from a tuition support service into an international online school serving families across 14 countries, including {country.founderBioCountrySpecific}.
              </p>

              <div style={{marginBottom:18}}>
                <div style={{fontSize:11,color:V.ink,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>Qualifications</div>
                <p style={{fontSize:14,color:V.sl,lineHeight:1.7,margin:0}}>
                  Bachelor of Education (Science) &mdash; Mathematics and Physics, University of Nairobi (2022)
                </p>
              </div>

              <div style={{marginBottom:18}}>
                <div style={{fontSize:11,color:V.ink,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>Experience</div>
                <ul style={{fontSize:13.5,color:V.sl,lineHeight:1.75,margin:0,paddingLeft:20}}>
                  <li style={{marginBottom:6}}>Over six years supporting students through international curriculum pathways &mdash; Cambridge International (IGCSE and A-Level), Pearson Edexcel International, IB Diploma Programme, American Curriculum with AP, and homeschooling pathways.</li>
                  <li style={{marginBottom:6}}>Direct teaching experience in secondary-level Mathematics and Physics across multiple international curriculum boards.</li>
                  <li style={{marginBottom:6}}>{ EAST_AFRICA_HUBS.has(country.slug)
                    ? "Leadership of curriculum development, teacher recruitment and academic standards across Smartious's two Nairobi-based physical centres (Diamond Plaza Parklands HQ and Karen Hardy) and online programmes."
                    : "Leadership of curriculum development, teacher recruitment and academic standards across Smartious's two international-standard operational centres and online programmes serving " + country.name + " families." }</li>
                  <li>Specialism in supporting students through university admissions to {country.founderUniversitySpecialism}.</li>
                </ul>
              </div>

              <div style={{padding:'16px 18px',background:V.bone,borderLeft:`3px solid ${V.cr}`,borderRadius:6}}>
                <p style={{fontSize:13,color:V.sl,lineHeight:1.7,margin:0,fontStyle:'italic'}}>
                  &ldquo;International curriculum mastery is achievable for students from any background when subject specialists, small class sizes, and individual academic plans are combined with the discipline and structure good schools provide.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div></section>

      {/* ─── COMPREHENSIVE FAQ ─── */}
      <section className="sec" style={{background:V.bone,paddingTop:56,paddingBottom:56}}><div className="wrap">
        <div style={{maxWidth:880,margin:'0 auto'}}>
          <div className="eyebrow">FAQs</div>
          <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.95rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:24,lineHeight:1.2}}>
            Common questions from {country.name} families
          </h2>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {country.faqs.map((f, i) => (
              <details key={i} style={{background:V.white,padding:'16px 22px',borderRadius:10,cursor:'pointer',border:`1px solid ${V.bone3}`}}>
                <summary style={{fontWeight:600,color:V.ink,fontSize:14.5,listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                  <span>{f.q}</span>
                  <span style={{color:V.cr,fontSize:18,lineHeight:1,flexShrink:0,marginTop:2}}>+</span>
                </summary>
                <p style={{color:V.sl,fontSize:14,lineHeight:1.75,margin:'14px 0 0'}}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div></section>


      {/* ─── SMARTIOUS WORLDWIDE — internal linking + global cohort signal ─── */}
      <section className="sec" style={{background:V.white,paddingTop:64,paddingBottom:64,borderTop:`1px solid ${V.bone3}`}}><div className="wrap">
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:40,maxWidth:780,marginLeft:'auto',marginRight:'auto'}}>
            <div className="eyebrow" style={{justifyContent:'center'}}>Smartious worldwide</div>
            <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'2rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.2}}>
              {country.adjective} students join a 14+ country global cohort
            </h2>
            <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>
              Live classes bring together students from across Africa, the Gulf, Europe and Asia. A {country.name} student in our Year 11 IGCSE Mathematics class will be alongside peers in Cairo, Dubai, Bangkok, Seoul, Casablanca and Kigali. The Wednesday enrichment programmes (debate, Model UN, robotics, journalism) operate as one global classroom rather than thirteen separate national ones.
            </p>
          </div>
          {[
            {region:'East & Southern Africa', hubs:[
              {slug:'kenya', name:'Kenya', note:'Nairobi HQ · founding market'},
              {slug:'ethiopia', name:'Ethiopia', note:'Addis Ababa diplomatic + AU corporate'},
              {slug:'rwanda', name:'Rwanda', note:'Kigali tech + East African Community'},
              {slug:'south-africa', name:'South Africa', note:'Johannesburg + Cape Town expat'},
            ]},
            {region:'North Africa', hubs:[
              {slug:'egypt', name:'Egypt', note:'Cairo · Alexandria · New Capital'},
              {slug:'morocco', name:'Morocco', note:'Casablanca · Rabat · Marrakech'},
            ]},
            {region:'Gulf & Middle East', hubs:[
              {slug:'uae', name:'UAE', note:'Dubai · Abu Dhabi · Sharjah'},
              {slug:'qatar', name:'Qatar', note:'Doha · Education City'},
              {slug:'saudi-arabia', name:'Saudi Arabia', note:'Riyadh · Jeddah · Dammam'},
            ]},
            {region:'East & Southeast Asia', hubs:[
              {slug:'japan', name:'Japan', note:'Tokyo · Yokohama · Osaka · Kobe'},
              {slug:'south-korea', name:'South Korea', note:'Seoul · Songdo · Busan'},
              {slug:'vietnam', name:'Vietnam', note:'HCMC · Hanoi · Da Nang'},
              {slug:'thailand', name:'Thailand', note:'Bangkok · Chiang Mai · Phuket'},
            ]},
          ].map((group, gi) => (
            <div key={gi} style={{marginBottom:24}}>
              <div style={{fontSize:11,color:V.gold3,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12}}>{group.region}</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',gap:10}}>
                {group.hubs.map((h, i) => {
                  const isCurrent = country.slug === h.slug
                  const href = `/online-school/${h.slug}`
                  return isCurrent ? (
                    <div key={i} style={{padding:'14px 16px',background:`rgba(139,26,46,.06)`,border:`1px solid ${V.cr}`,borderRadius:8}}>
                      <div style={{fontSize:13.5,fontWeight:700,color:V.cr,marginBottom:2}}>{h.name} <span style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold3,fontWeight:700,marginLeft:6}}>← you are here</span></div>
                      <div style={{fontSize:11.5,color:V.sl}}>{h.note}</div>
                    </div>
                  ) : (
                    <a key={i} href={href}
                      onClick={(e)=>{e.preventDefault(); nav(href)}}
                      style={{display:'block',padding:'14px 16px',background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:8,textDecoration:'none',color:'inherit',transition:'all .15s'}}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = V.cr; e.currentTarget.style.background = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = V.bone3; e.currentTarget.style.background = V.bone }}>
                      <div style={{fontSize:13.5,fontWeight:700,color:V.ink,marginBottom:2}}>{h.name} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={V.cr} strokeWidth="3" strokeLinecap="round" style={{marginLeft:4,verticalAlign:'middle'}}><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                      <div style={{fontSize:11.5,color:V.sl}}>{h.note}</div>
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div></section>

      {/* ─── FINAL CTA ─── */}
      <section className="sec" style={{background:V.ink,color:'#fff',paddingTop:64,paddingBottom:64,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-50px',right:'-50px',width:300,height:300,borderRadius:'50%',background:`radial-gradient(circle, ${V.cr}40 0%, transparent 70%)`,filter:'blur(40px)'}}/>
        <div className="wrap" style={{maxWidth:820,textAlign:'center',position:'relative',zIndex:1}}>
          <div className="eyebrow" style={{justifyContent:'center',color:V.gold3,marginBottom:14}}>Start here</div>
          <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'clamp(1.9rem,4.5vw,2.6rem)',margin:'0 0 16px',color:'#fff',lineHeight:1.15}}>{country.ctaH}</h2>
          <p style={{color:'rgba(255,255,255,.78)',fontSize:16,lineHeight:1.7,margin:'0 0 30px',maxWidth:620,marginLeft:'auto',marginRight:'auto'}}>{country.ctaSubhead}</p>
          {/* SINGLE primary CTA: Book Assessment.
              Two-gate funnel: form submission → admissions review → fee invoice on
              acceptance → assessment → enrolment decision. No other CTAs anywhere. */}
          <div style={{display:'flex',justifyContent:'center',marginBottom:18,gap:14,flexWrap:'wrap'}}>
            <button onClick={() => nav('/assessment?from=' + country.slug)} style={{background:V.gold3,color:V.ink,border:'none',padding:'20px 40px',borderRadius:10,fontSize:16,fontWeight:800,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,letterSpacing:'.01em',boxShadow:'0 10px 28px rgba(201,151,58,.4)',transition:'all .18s ease'}}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(201,151,58,.55)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(201,151,58,.4)' }}>
              Book assessment
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button onClick={() => nav('/consult')}
              style={{background:'transparent',color:'#fff',border:'2px solid rgba(255,255,255,.55)',padding:'18px 36px',borderRadius:10,fontSize:16,fontWeight:700,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,letterSpacing:'.01em',transition:'all .18s ease'}}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = V.gold3; e.currentTarget.style.color = V.gold3; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.55)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Book Free Consultation
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Process explanation — replaces the old fee-transparency paragraph */}
          <div style={{maxWidth:680,margin:'0 auto 24px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.12)',borderRadius:8,padding:'18px 22px'}}>
            <div style={{fontSize:11,color:V.gold3,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:10,textAlign:'center'}}>How the process works</div>
            <ol style={{margin:0,paddingLeft:20,fontSize:13,color:'rgba(255,255,255,.82)',lineHeight:1.75}}>
              <li><strong style={{color:'#fff'}}>Submit the assessment request form.</strong> Full student and family details, curriculum interest, target universities. No payment at this stage.</li>
              <li><strong style={{color:'#fff'}}>Admissions reviews the request.</strong> Our Head of Admissions evaluates fit against current cohort, year-group capacity, and curriculum alignment. We respond to every request within three business days regardless of decision.</li>
              <li><strong style={{color:'#fff'}}>Assessment fee invoiced on acceptance.</strong> If the request is accepted, the family receives an invoice for the assessment fee. The fee is required before the diagnostic is scheduled, and is credited against the first month's tuition if the family proceeds to enrolment.</li>
              <li><strong style={{color:'#fff'}}>Diagnostic assessment and curriculum recommendation.</strong> Structured testing across English, Mathematics and Science, written report, and a 30-minute consultation with the Head of Academics.</li>
              <li><strong style={{color:'#fff'}}>Enrolment decision.</strong> Admission is determined on the basis of the assessment results, not the form alone. Families that are a good fit receive a formal enrolment offer; families that aren't receive an honest recommendation of better-suited alternatives.</li>
            </ol>
          </div>

          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',fontSize:12,color:'rgba(255,255,255,.55)'}}>
            <span>[+] Immediate enrolment</span>
            <span>[+] No school waiting lists</span>
            <span>[+] USD pricing stability</span>
            <span>[+] Ontario OSSD pathway via CCIS partnership</span>
            <span>[+] {country.finalCTABadgeExamRef}</span>
          </div>
        </div>
      </section>
    </>
  )
}

export default CountryHub
