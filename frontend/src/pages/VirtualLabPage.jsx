/**
 * VirtualLabPage — the public Smartious Virtual Lab page at /virtual-lab,
 * rendered inside LandingPage (site header, footer and .lp styles).
 *
 * Text, images and lists come from data/virtualLab.js, which the static SEO
 * build (scripts/seo-static.mjs) reads too. The two live demos (the
 * titration bench and the 3D skeleton) load three.js only when the visitor
 * presses Start, so the page itself stays light.
 */
import { lazy, Suspense, useState } from 'react'
import {
  VL_HERO, VL_IMAGES, VL_BONES, VL_MODEL_IMAGES, VL_FEATURES, VL_KENYA, VL_INTERNATIONAL,
  VL_FAQS, VL_CREDITS, VL_PRACTICALS, VL_MODELS,
} from '../data/virtualLab.js'

const LabDemo = lazy(() => import('../lab/LabDemo.jsx'))
const ModelViewer = lazy(() => Promise.all([import('../lab/models/ModelsPage.jsx'), import('../lab/lab.css')])
  .then(([m]) => ({ default: () => <m.ModelViewer modelId="skeleton" embedded /> })))

const C = { cr: '#8B1A2E', gold: '#C9973A', ink: '#080C14', ink2: '#0D1220', sl: '#2E3D55', bone: '#FDFAF4', bone2: '#F8F2E6', line: '#E8DFCC' }
const SUBJECT = { chemistry: 'Chemistry', biology: 'Biology', physics: 'Physics' }

function Img({ img, style, eager = false }) {
  return <img src={img.src} alt={img.alt} width={img.w || 720} height={img.h || 576} loading={eager ? 'eager' : 'lazy'} decoding="async"
    fetchpriority={eager ? 'high' : undefined} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 14, background: '#121928', ...style }} />
}

function Btn({ href, onClick, children, solid = true }) {
  return (
    <a href={href} onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 28px', borderRadius: 10, fontSize: 15.5, fontWeight: 800, textDecoration: 'none', cursor: 'pointer',
      background: solid ? C.gold : 'transparent', color: solid ? C.ink : '#fff', border: solid ? 'none' : '2px solid rgba(255,255,255,.55)',
    }}>{children}</a>
  )
}

function Loading({ text }) {
  return <div style={{ padding: 40, textAlign: 'center', color: C.sl, background: '#fff', borderRadius: 14, border: `1px solid ${C.line}` }}>{text}</div>
}

export default function VirtualLabPage({ go }) {
  const [demo, setDemo] = useState(false)
  const [bones, setBones] = useState(false)
  const toAssessment = (e) => { e.preventDefault(); go('/assessment') }
  const jump = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const startDemo = () => { setDemo(true); setTimeout(() => document.getElementById('try')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }

  const sec = (bg) => ({ background: bg, padding: '72px 0' })
  const h2 = { fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 'clamp(1.9rem,3.2vw,2.8rem)', fontWeight: 400, lineHeight: 1.12, color: C.ink, margin: '0 0 14px' }
  const lead = { fontSize: 16.5, color: C.sl, lineHeight: 1.75, maxWidth: 820, margin: '0 0 28px' }
  const grid = (min) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: 18 })
  const card = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }

  return (
    <main>
      {/* ── Hero ── */}
      <section style={{ background: `linear-gradient(135deg, ${C.ink} 0%, #1A2238 55%, ${C.cr} 140%)`, color: '#fff', padding: '72px 0 64px', overflow: 'hidden' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(460px, 100%), 1fr))', gap: 40, alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ color: C.gold }}>{VL_HERO.eyebrow}</div>
            <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 'clamp(2.2rem,4.4vw,3.5rem)', fontWeight: 400, lineHeight: 1.06, margin: '0 0 20px', color: '#fff' }}>
              Smartious <em style={{ color: C.gold }}>Virtual Lab</em>: 3D science practicals you do with your own hands
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: 'rgba(255,255,255,.9)', margin: '0 0 28px', maxWidth: 640 }}>{VL_HERO.lead}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
              <Btn href="#try" onClick={(e) => { e.preventDefault(); startDemo() }}>Try the titration free →</Btn>
              <Btn href="#bones" onClick={jump('bones')} solid={false}>Explore the skeleton in 3D</Btn>
            </div>
            <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
              {VL_HERO.stats.map(([n, l]) => (
                <div key={l}><div style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 30, color: C.gold, lineHeight: 1 }}>{n}</div><div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.75)', marginTop: 4 }}>{l}</div></div>
              ))}
            </div>
          </div>
          <figure style={{ margin: 0 }}>
            <Img img={VL_IMAGES.hero} eager style={{ boxShadow: '0 30px 70px rgba(0,0,0,.45)' }} />
            <figcaption style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', marginTop: 10 }}>The end point: one drop of alkali turns the phenolphthalein pink. A real screenshot from the lab.</figcaption>
          </figure>
        </div>
      </section>

      {/* ── Try it ── */}
      <section id="try" style={sec(C.bone)}>
        <div className="wrap">
          <div className="eyebrow">Free practical · no sign-up</div>
          <h2 style={h2}>Try it now: an acid–base titration in 3D</h2>
          <p style={lead}>Find the concentration of an unknown acid. Set up your bench from the cupboard, put on your goggles, rinse and fill the burette, pipette 25.0 cm³ of acid, add the indicator and titrate to the end point. Repeat until two titres agree within 0.10 cm³, then check your answer. Every new bench has a different acid.</p>
          {demo ? (
            <Suspense fallback={<Loading text="Opening the lab…" />}><LabDemo /></Suspense>
          ) : (
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setDemo(true)}>
              <Img img={VL_IMAGES.bench} />
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, rgba(8,12,20,.05), rgba(8,12,20,.55))', borderRadius: 14 }}>
                <button type="button" onClick={(e) => { e.stopPropagation(); setDemo(true) }} style={{ padding: '18px 34px', borderRadius: 12, border: 'none', background: C.cr, color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer', boxShadow: '0 12px 30px rgba(0,0,0,.35)' }}>
                  ▶ Start the titration
                </button>
              </div>
            </div>
          )}
          <p style={{ fontSize: 13, color: C.sl, marginTop: 12 }}>Works best on a laptop or tablet. On an older device, choose the 2D view or low graphics in the lab.</p>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={sec('#fff')}>
        <div className="wrap">
          <div className="eyebrow">Why it works</div>
          <h2 style={h2}>A real laboratory, not a slideshow</h2>
          <div style={grid(340)}>
            {VL_FEATURES.map(f => <div key={f.h} style={card}><h3 style={{ margin: '0 0 8px', fontSize: 17.5, color: C.ink }}>{f.h}</h3><p style={{ margin: 0, color: C.sl, lineHeight: 1.7, fontSize: 15 }}>{f.p}</p></div>)}
          </div>
          <div style={{ ...grid(420), marginTop: 28 }}>
            <figure style={{ margin: 0 }}><Img img={VL_IMAGES.cupboard} style={{ aspectRatio: '16/9' }} /><figcaption style={{ fontSize: 13, color: C.sl, marginTop: 8 }}>Set up your bench: fetch the apparatus from the cupboard and the reagents from the rack.</figcaption></figure>
            <figure style={{ margin: 0 }}><Img img={VL_IMAGES.bench} style={{ aspectRatio: '16/9' }} /><figcaption style={{ fontSize: 13, color: C.sl, marginTop: 8 }}>The titration bench, ready to record concordant titres.</figcaption></figure>
          </div>
        </div>
      </section>

      {/* ── Bones ── */}
      <section id="bones" style={sec(C.bone2)}>
        <div className="wrap">
          <div className="eyebrow">Biology in 3D</div>
          <h2 style={h2}>The human skeleton and bones in 3D</h2>
          <p style={lead}>Turn a real human skeleton in your hands, click any bone to read what it does, and test yourself. The skull, vertebral column, hand and wrist, knee and hip are separate models, so students can open a joint and see the cartilage and ligaments inside.</p>
          {bones ? (
            <div className="lab-app" style={{ minHeight: 0, background: 'transparent', marginBottom: 24 }}><Suspense fallback={<Loading text="Loading the skeleton…" />}><ModelViewer /></Suspense></div>
          ) : (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
              <button type="button" onClick={() => setBones(true)} style={{ padding: '14px 26px', borderRadius: 10, border: 'none', background: C.cr, color: '#fff', fontSize: 15.5, fontWeight: 800, cursor: 'pointer' }}>▶ Open the 3D skeleton</button>
              <span style={{ fontSize: 13, color: C.sl }}>Free, no sign-up. About a 7 MB download.</span>
            </div>
          )}
          <div style={grid(200)}>
            {VL_BONES.map(b => (
              <figure key={b.id} style={{ ...card, padding: 10, margin: 0 }}>
                <Img img={b} style={{ aspectRatio: '5/4' }} />
                <figcaption style={{ padding: '10px 4px 2px' }}><h3 style={{ margin: '0 0 4px', fontSize: 16, color: C.ink }}>{b.title}</h3><p style={{ margin: 0, fontSize: 13.5, color: C.sl, lineHeight: 1.6 }}>{b.text}</p></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3D models ── */}
      <section style={sec('#fff')}>
        <div className="wrap">
          <div className="eyebrow">28 labelled 3D models</div>
          <h2 style={h2}>3D models for biology and physics</h2>
          <p style={lead}>Every model is labelled and has a self-test. Watch the heart beat, focus the eye, run an electric motor or a four-stroke engine, and explore NASA spacecraft from the Saturn V to the Perseverance rover.</p>
          <div style={grid(240)}>
            {VL_MODEL_IMAGES.map(m => (
              <figure key={m.id} style={{ margin: 0 }}><Img img={m} style={{ aspectRatio: '5/4' }} /><figcaption style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginTop: 8 }}>{m.title}</figcaption></figure>
            ))}
          </div>
          <details style={{ marginTop: 24 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 800, color: C.cr }}>See all {VL_MODELS.length} models</summary>
            <ul style={{ columns: '260px', marginTop: 12, color: C.sl, lineHeight: 1.8 }}>{VL_MODELS.map(m => <li key={m.id}>{m.title.replace(' (real anatomical model)', '')} <span style={{ color: '#8A8F98' }}>· {m.topic}</span></li>)}</ul>
          </details>
        </div>
      </section>

      {/* ── IGCSE, A Level and IB ── */}
      <section id="igcse-a-level-ib" style={sec(C.bone)}>
        <div className="wrap">
          <div className="eyebrow">Cambridge · Pearson Edexcel · IB</div>
          <h2 style={h2}>{VL_INTERNATIONAL.h2}</h2>
          <p style={lead}>{VL_INTERNATIONAL.intro}</p>
          <div style={grid(330)}>
            {VL_INTERNATIONAL.items.map(it => (
              <div key={it.h} style={card}>
                <h3 style={{ margin: 0, fontSize: 18, color: C.cr }}>{it.h}</h3>
                <div style={{ fontSize: 12.5, color: '#8A8F98', margin: '2px 0 10px' }}>{it.sub}</div>
                <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: C.ink, background: C.bone2, borderRadius: 8, padding: '8px 10px' }}>{it.exam}</p>
                <p style={{ margin: 0, color: C.sl, lineHeight: 1.7, fontSize: 15 }}>{it.p}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: C.sl, marginTop: 22, maxWidth: 900 }}>{VL_INTERNATIONAL.note}</p>
        </div>
      </section>

      {/* ── KCSE and CBE ── */}
      <section id="kcse-cbe" style={{ ...sec(C.ink2), color: '#fff' }}>
        <div className="wrap">
          <div className="eyebrow" style={{ color: C.gold }}>For students in Kenya</div>
          <h2 style={{ ...h2, color: '#fff' }}>{VL_KENYA.h2}</h2>
          <p style={{ ...lead, color: 'rgba(255,255,255,.85)' }}>{VL_KENYA.intro}</p>
          <div style={grid(260)}>
            {VL_KENYA.items.map(([h, p]) => (
              <div key={h} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 14, padding: 20 }}>
                <h3 style={{ margin: '0 0 8px', color: C.gold, fontSize: 17 }}>{h}</h3><p style={{ margin: 0, color: 'rgba(255,255,255,.85)', lineHeight: 1.7, fontSize: 15 }}>{p}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 22, maxWidth: 900 }}>{VL_KENYA.note}</p>
        </div>
      </section>

      {/* ── Practicals ── */}
      <section id="practicals" style={sec(C.bone)}>
        <div className="wrap">
          <div className="eyebrow">The full lab</div>
          <h2 style={h2}>All 78 virtual practicals</h2>
          <p style={lead}>Chemistry, biology and physics practicals, each with a plan, a 3D bench, a results table, a graph, analysis questions and a lab report.</p>
          <div style={{ ...grid(300), alignItems: 'start' }}>
            {['chemistry', 'biology', 'physics'].map(sub => (
              <div key={sub} style={card}>
                <h3 style={{ margin: '0 0 10px', fontSize: 19, color: C.cr }}>{SUBJECT[sub]} <span style={{ fontSize: 13, color: C.sl, fontWeight: 400 }}>({VL_PRACTICALS.filter(g => g.subject === sub).reduce((a, g) => a + g.items.length, 0)})</span></h3>
                {VL_PRACTICALS.filter(g => g.subject === sub).map(g => (
                  <details key={g.group} open={sub !== 'physics' || g.group === 'Core practicals'} style={{ marginBottom: 6 }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 14, color: C.ink }}>{g.group}</summary>
                    <ul style={{ margin: '6px 0 8px', paddingLeft: 20, color: C.sl, fontSize: 14, lineHeight: 1.7 }}>{g.items.map(t => <li key={t}>{t}</li>)}</ul>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={sec(C.bone2)}>
        <div className="wrap" style={{ maxWidth: 980 }}>
          <div className="eyebrow">Questions</div>
          <h2 style={h2}>Virtual lab: frequently asked questions</h2>
          {VL_FAQS.map(f => (
            <details key={f.q} style={{ ...card, marginBottom: 10 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 800, color: C.ink, fontSize: 16 }}>{f.q}</summary>
              <p style={{ margin: '10px 0 0', color: C.sl, lineHeight: 1.75 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: `linear-gradient(135deg, ${C.cr}, #5E0F1E)`, color: '#fff', padding: '64px 0' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 style={{ ...h2, color: '#fff' }}>Get the full Virtual Lab with Smartious</h2>
          <p style={{ ...lead, color: 'rgba(255,255,255,.88)', margin: '0 auto 26px' }}>All 78 practicals, 28 models, saved work, lab reports and marking by qualified science teachers, as part of our live online school and homeschool programmes.</p>
          <Btn href="/assessment" onClick={toAssessment}>Book an assessment →</Btn>
        </div>
      </section>

      <div className="wrap" style={{ paddingTop: 22, paddingBottom: 22 }}>
        <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{VL_CREDITS}</p>
      </div>
    </main>
  )
}
