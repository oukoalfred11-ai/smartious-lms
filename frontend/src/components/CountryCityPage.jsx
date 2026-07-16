/* ═══════════════════════════════════════════════════════════════════
   CountryCityPage — Shared city-page renderer for all country cities
   ───────────────────────────────────────────────────────────────────
   Replaces the 13 duplicated city renderer blocks that previously
   lived inside LandingPage.jsx. Fully data-driven from:
     - country: the *_COUNTRY object (provides name, hub, hubPageId)
     - cities: the *_CITIES array
     - currentCitySlug: the active city slug from page state
   
   Design tokens (V), navigation (P) and Footer are passed via props
   to keep this component decoupled from LandingPage's internal scope.
   
   Section structure (identical to prior per-country blocks):
     1. JSON-LD: BreadcrumbList + Service schemas
     2. Hero (background image + intro + dual CTA)
     3. Challenges list (numbered cards)
     4. Why Choose grid (six reason cards)
     5. Family situations list ([+] tagged)
     6. Communities and nearby areas (chip cloud)
     7. FAQs (accordion)
     8. Final CTA (dark band + Footer)
═══════════════════════════════════════════════════════════════════ */

export default function CountryCityPage({ country, cities, currentCitySlug, P, V, nav, Footer }) {
  const city = cities.find(c => c.slug === currentCitySlug)
  if (!city) return null

  const hubUrl = country.hub
  const hubPageId = country.hubPageId
  const countryName = country.name
  const cityUrl = 'https://smartioushomeschool.com/homeschool-' + city.slug
  const hubFullUrl = 'https://smartioushomeschool.com' + hubUrl

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        '@context':'https://schema.org','@type':'BreadcrumbList',
        'itemListElement':[
          {'@type':'ListItem','position':1,'name':'Home','item':'https://smartioushomeschool.com/'},
          {'@type':'ListItem','position':2,'name':'Homeschooling ' + countryName,'item': hubFullUrl},
          {'@type':'ListItem','position':3,'name': city.name,'item': cityUrl},
        ],
      })}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        '@context':'https://schema.org','@type':'Service',
        'name': city.primaryKeyword,
        'description': city.seoDesc,
        'provider':{'@type':'EducationalOrganization','name':'Smartious Homeschool Global','url':'https://smartioushomeschool.com'},
        'areaServed':{'@type':'Place','name': city.name + ', ' + city.county + ', ' + countryName},
        'serviceType':'Online homeschooling and international curriculum delivery',
      })}}/>

      {/* HERO */}
      <section className="sec" style={{
        position:'relative',
        background:`linear-gradient(135deg, ${V.ink} 0%, ${V.cr} 100%)`,
        color:'#fff', padding:'60px 0 48px', overflow:'hidden',
      }}>
        {city.heroImg && (
          <>
            <img src={city.heroImg} alt={city.altTexts?.hero || ''} aria-hidden="true"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={e => { e.currentTarget.style.display='none' }}
              style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.55,zIndex:0}}/>
            <div style={{position:'absolute',inset:0,background:`linear-gradient(135deg, ${V.ink}80 0%, ${V.cr}66 100%)`,zIndex:1}}/>
          </>
        )}
        <div className="wrap" style={{position:'relative',zIndex:2}}>
          <a href={hubUrl}
            onClick={(e)=>{e.preventDefault(); P(hubPageId)}}
            style={{color:'rgba(255,255,255,.7)',textDecoration:'none',fontSize:12,letterSpacing:'.04em',marginBottom:16,display:'inline-flex',alignItems:'center',gap:6}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Homeschooling {countryName}
          </a>
          <div className="eyebrow" style={{color:V.gold3,marginBottom:10}}>Online school &middot; Virtual school &middot; Homeschool &middot; {city.county}</div>
          <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'clamp(2rem,4.5vw,3rem)',fontWeight:400,color:'#fff',lineHeight:1.1,marginBottom:14,letterSpacing:'-.01em'}}>
            Online School &amp; Homeschool in <em style={{color:V.gold3,fontStyle:'italic'}}>{city.name}</em>
          </h1>
          <p style={{fontSize:14,color:V.gold3,fontStyle:'italic',marginBottom:18,maxWidth:720,lineHeight:1.5}}>{city.heroTagline}</p>
          <p style={{fontSize:16,color:'rgba(255,255,255,.9)',lineHeight:1.65,marginBottom:22,maxWidth:760}}>
            {city.intro}
          </p>
          <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
            <button onClick={() => nav('/assessment')}
              style={{background:V.gold3,color:V.ink,border:'none',padding:'18px 34px',borderRadius:10,fontSize:15,fontWeight:800,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,boxShadow:'0 8px 24px rgba(201,151,58,.35)',transition:'all .18s ease'}}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(201,151,58,.5)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,151,58,.35)' }}>
              Book assessment
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button onClick={() => nav('/consult')}
              style={{background:'transparent',color:'#fff',border:'2px solid rgba(255,255,255,.55)',padding:'16px 30px',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,transition:'all .18s ease'}}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = V.gold3; e.currentTarget.style.color = V.gold3; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.55)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Book Free Consultation
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* CHALLENGES */}
      <section className="sec" style={{background:V.bone,paddingTop:48,paddingBottom:48}}><div className="wrap">
        <div style={{maxWidth:880,margin:'0 auto'}}>
          <div className="eyebrow">Education in {city.name}</div>
          <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.7rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:20,lineHeight:1.25}}>
            Challenges {city.name} families face
          </h2>
          <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:12}}>
            {city.challenges.map((ch, i) => (
              <li key={i} style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:10,padding:'14px 18px',fontSize:14,color:V.sl,lineHeight:1.7,display:'flex',gap:12}}>
                <span style={{flexShrink:0,width:24,height:24,borderRadius:'50%',background:`rgba(139,26,46,.1)`,color:V.cr,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12}}>{i+1}</span>
                <span>{ch}</span>
              </li>
            ))}
          </ul>
        </div>
      </div></section>

      {/* WHY CHOOSE */}
      <section className="sec" style={{background:V.white,paddingTop:48,paddingBottom:48}}><div className="wrap">
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <div className="eyebrow">Why Smartious for {city.name}</div>
          <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.7rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:24,lineHeight:1.25}}>
            Six reasons {city.name} families choose Smartious
          </h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:14}}>
            {city.whyChoose.map(([h, p], i) => (
              <div key={i} style={{background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:12,padding:'20px 22px'}}>
                <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1rem',color:V.cr,marginBottom:8,lineHeight:1.3,fontWeight:400}}>{h}</h3>
                <p style={{fontSize:13.5,color:V.sl,lineHeight:1.65,margin:0}}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div></section>

      {/* FAMILY SITUATIONS */}
      <section className="sec" style={{background:V.bone,paddingTop:48,paddingBottom:48}}><div className="wrap">
        <div style={{maxWidth:880,margin:'0 auto'}}>
          <div className="eyebrow">Who we serve in {city.name}</div>
          <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.7rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:20,lineHeight:1.25}}>
            Family situations we work with
          </h2>
          <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:10}}>
            {city.familySituations.map((sit, i) => (
              <li key={i} style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:10,padding:'12px 18px',fontSize:14,color:V.sl,lineHeight:1.65}}>
                <span style={{color:V.cr,fontWeight:700,marginRight:8}}>[+]</span>{sit}
              </li>
            ))}
          </ul>
        </div>
      </div></section>

      {/* AREAS WE SERVE */}
      <section className="sec" style={{background:V.white,paddingTop:48,paddingBottom:48}}><div className="wrap">
        <div style={{maxWidth:880,margin:'0 auto'}}>
          <div className="eyebrow">Areas served</div>
          <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.7rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:20,lineHeight:1.25}}>
            {city.name} communities and nearby areas
          </h2>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {city.nearbyAreas.map((area, i) => (
              <span key={i} style={{background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:99,padding:'6px 14px',fontSize:13,color:V.sl}}>{area}</span>
            ))}
          </div>
        </div>
      </div></section>

      {/* FAQs */}
      <section className="sec" style={{background:V.bone,paddingTop:48,paddingBottom:48}}><div className="wrap">
        <div style={{maxWidth:840,margin:'0 auto'}}>
          <div className="eyebrow">FAQs</div>
          <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.7rem',fontWeight:400,color:V.ink,marginTop:8,marginBottom:24,lineHeight:1.25}}>
            Common questions from {city.name} families
          </h2>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {city.faqs.map((f, i) => (
              <details key={i} style={{background:V.white,padding:'14px 20px',borderRadius:8,cursor:'pointer',border:`1px solid ${V.bone3}`}}>
                <summary style={{fontWeight:600,color:V.ink,fontSize:15,listStyle:'none'}}>{f.q}</summary>
                <p style={{color:V.sl,fontSize:14,lineHeight:1.65,margin:'12px 0 0'}}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div></section>

      {/* FINAL CTA */}
      <section className="sec" style={{background:V.ink,color:'#fff',paddingTop:56,paddingBottom:64}}>
        <div className="wrap" style={{maxWidth:760,textAlign:'center'}}>
          <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'clamp(1.8rem,4vw,2.4rem)',margin:'0 0 14px',color:'#fff'}}>Ready to start your child's Cambridge journey from {city.name}?</h2>
          <p style={{color:V.bone3,fontSize:16,lineHeight:1.6,margin:'0 0 24px'}}>Free 15-minute consultation. No commitment.</p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={() => nav('/assessment')}
              style={{background:V.gold3,color:V.ink,border:'none',padding:'18px 34px',borderRadius:10,fontSize:15,fontWeight:800,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,boxShadow:'0 8px 24px rgba(201,151,58,.4)',transition:'all .18s ease'}}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(201,151,58,.55)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,151,58,.4)' }}>
              Book assessment
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button onClick={() => nav('/consult')}
              style={{background:'transparent',color:'#fff',border:'2px solid rgba(255,255,255,.55)',padding:'16px 30px',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,transition:'all .18s ease'}}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = V.gold3; e.currentTarget.style.color = V.gold3; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.55)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Book Free Consultation
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </section>
      <Footer P={P}/>
    </>
  )
}
