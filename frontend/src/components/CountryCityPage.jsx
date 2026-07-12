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
          <div className="eyebrow" style={{color:V.gold3,marginBottom:10}}>{city.county} · {city.region}</div>
          <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'clamp(2rem,4.5vw,3rem)',fontWeight:400,color:'#fff',lineHeight:1.1,marginBottom:14,letterSpacing:'-.01em'}}>
            {city.primaryKeyword}
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
            <a href={`https://wa.me/254745021212?text=${encodeURIComponent('Hi, I would like to enquire about Smartious for our family in ' + city.name)}`}
              target="_blank" rel="noopener noreferrer"
              style={{background:'#25D366',color:'#fff',border:'none',padding:'18px 30px',borderRadius:10,fontSize:15,fontWeight:800,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,textDecoration:'none',boxShadow:'0 8px 24px rgba(37,211,102,.35)',transition:'all .18s ease'}}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,211,102,.5)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,211,102,.35)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
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
            <a href={`https://wa.me/254745021212?text=${encodeURIComponent('Hi, I would like to enquire about Smartious for our family in ' + city.name)}`}
              target="_blank" rel="noopener noreferrer"
              style={{background:'#25D366',color:'#fff',border:'none',padding:'18px 30px',borderRadius:10,fontSize:15,fontWeight:800,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,textDecoration:'none',boxShadow:'0 8px 24px rgba(37,211,102,.4)',transition:'all .18s ease'}}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,211,102,.55)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,211,102,.4)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
      <Footer P={P}/>
    </>
  )
}
