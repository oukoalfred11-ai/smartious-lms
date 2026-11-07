/**
 * AdmissionsPage — the 2027 admissions pages, rendered inside LandingPage:
 *   /a-level-admissions-2027  data/aLevelAdmissions2027.js (A_LEVEL_ADMISSION)
 *   /igcse-admissions-2027    data/igcseAdmissions2027.js  (IGCSE_ADMISSION)
 * The static HTML for search engines is built from the same files by
 * scripts/seo-static.mjs.
 */
import { useState } from 'react'

const C = { cr: '#7D1025', cr2: '#8B1A2E', gold: '#C9973A', ink: '#1A0A0E', sl: '#3D3438', mut: '#6B6266', bone: '#F7F1E8', bone2: '#EFE6D6', line: '#E6DACB' }
const serif = "'DM Serif Display',Georgia,serif"
const wrap = { maxWidth: 1120, margin: '0 auto', padding: '0 20px' }
const h2 = { fontFamily: serif, fontWeight: 400, fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: C.ink, margin: '0 0 14px', lineHeight: 1.2 }
const card = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, padding: '20px 22px' }
const grid = (min) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: 16 })
const btn = (primary) => ({ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 26px', borderRadius: 999, fontWeight: 800, fontSize: 14, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none',
  background: primary ? C.cr : 'transparent', color: primary ? '#fff' : C.cr, border: primary ? 'none' : `1.5px solid ${C.cr}` })
const chip = { background: C.bone, border: `1px solid ${C.line}`, borderRadius: 99, padding: '6px 12px', fontSize: 13.5, color: C.sl }

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderTop: `1px solid ${C.line}` }}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '16px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: C.ink }}>
        <span>{q}</span><span aria-hidden style={{ color: C.cr }}>{open ? '−' : '+'}</span>
      </button>
      {open && <p style={{ margin: '0 0 16px', color: C.sl, lineHeight: 1.7, fontSize: 15 }}>{a}</p>}
    </div>
  )
}

function SubjectBoard({ name, groups }) {
  const total = Object.values(groups).flat().length
  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: '1.35rem', margin: 0, color: C.cr }}>{name}</h3>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.mut }}>{total} subjects</span>
      </div>
      {Object.entries(groups).map(([area, list]) => (
        <div key={area} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: C.gold, marginBottom: 7 }}>{area}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>{list.map(s => <span key={s} style={chip}>{s}</span>)}</div>
        </div>
      ))}
    </div>
  )
}

export default function AdmissionsPage({ nav, admission }) {
  const { pg, subjects, all, fee, level, boardNames, routesHeading, ctaText, also } = admission
  const go = (path) => (e) => { if (nav && !e.metaKey && !e.ctrlKey) { e.preventDefault(); nav(path) } }
  return (
    <main style={{ background: C.bone, color: C.ink }}>
      {/* Banner: the school's admissions artwork, then the same message as text */}
      <section style={{ background: C.bone }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <picture>
            <source media="(max-width: 760px)" srcSet={pg.banner.srcSmall} />
            <img src={pg.banner.src} alt={pg.banner.alt} width={pg.banner.width} height={pg.banner.height} fetchpriority="high"
              style={{ display: 'block', width: '100%', height: 'auto' }} />
          </picture>
        </div>
      </section>

      <section style={{ padding: '44px 0 28px' }}>
        <div style={wrap}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: C.cr, fontWeight: 800, fontSize: 12.5, letterSpacing: '.22em', textTransform: 'uppercase' }}>
            <span style={{ width: 40, height: 1.5, background: C.gold }} />{pg.eyebrow}
          </div>
          <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3.3rem)', lineHeight: 1.1, margin: '14px 0 16px', maxWidth: 900 }}>{pg.h1}</h1>
          <p style={{ fontSize: 17.5, lineHeight: 1.7, color: C.sl, maxWidth: 820, margin: '0 0 24px' }}>{pg.intro}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/assessment" onClick={go('/assessment')} style={btn(true)}>Book an assessment <span aria-hidden style={{ color: C.gold }}>→</span></a>
            <a href="#subjects" style={btn(false)}>See all subjects</a>
          </div>
          <p style={{ fontSize: 13.5, color: C.mut, margin: '16px 0 0' }}>{fee}</p>
        </div>
      </section>

      {/* Key facts */}
      <section style={{ padding: '8px 0 36px' }}>
        <div style={{ ...wrap, ...grid(170) }}>
          {pg.facts.map(([k, v]) => (
            <div key={k} style={{ ...card, padding: '16px 18px', borderTop: `3px solid ${C.gold}` }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: C.cr }}>{k}</div>
              <div style={{ marginTop: 6, fontSize: 14.5, color: C.sl, lineHeight: 1.5 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Two boards */}
      <section style={{ padding: '28px 0' }}>
        <div style={wrap}>
          <h2 style={h2}>{routesHeading}</h2>
          <div style={grid(320)}>
            {pg.boards.map(b => (
              <div key={b.h} style={{ ...card, borderLeft: `3px solid ${C.cr}` }}>
                <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: '1.3rem', margin: '0 0 4px' }}>{b.h}</h3>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 10 }}>{b.sub}</div>
                <p style={{ margin: '0 0 12px', color: C.sl, lineHeight: 1.65, fontSize: 14.5 }}>{b.p}</p>
                <a href={b.link} onClick={go(b.link)} style={{ color: C.cr, fontWeight: 700, fontSize: 14 }}>More about this board →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" style={{ padding: '36px 0', background: '#fff', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div style={wrap}>
          <h2 style={h2}>{level} subjects we teach</h2>
          <p style={{ color: C.sl, lineHeight: 1.7, fontSize: 15, maxWidth: 860, margin: '0 0 20px' }}>{all.length} subjects across the two boards. {pg.subjectsNote}</p>
          <div style={grid(340)}>
            <SubjectBoard name={boardNames.cambridge} groups={subjects.cambridge} />
            <SubjectBoard name={boardNames.edexcel} groups={subjects.edexcel} />
          </div>
        </div>
      </section>

      {/* Who it suits */}
      <section style={{ padding: '40px 0 20px' }}>
        <div style={wrap}>
          <h2 style={h2}>Who joins in January 2027</h2>
          <div style={grid(240)}>
            {pg.who.map(([h, p]) => (
              <div key={h} style={card}>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, color: C.cr }}>{h}</h3>
                <p style={{ margin: 0, color: C.sl, lineHeight: 1.65, fontSize: 14.5 }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How admission works */}
      <section style={{ padding: '28px 0 40px' }}>
        <div style={wrap}>
          <h2 style={h2}>How {level} admission works</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, ...grid(200) }}>
            {pg.steps.map(([h, p], i) => (
              <li key={h} style={card}>
                <div style={{ fontFamily: serif, color: C.gold, fontSize: '1.6rem', lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</div>
                <h3 style={{ margin: '8px 0 6px', fontSize: 15.5 }}>{h}</h3>
                <p style={{ margin: 0, color: C.sl, lineHeight: 1.6, fontSize: 14 }}>{p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Exams and universities */}
      <section style={{ padding: '36px 0', background: '#fff', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ ...wrap, ...grid(340) }}>
          <div>
            <h2 style={h2}>Exams, wherever you live</h2>
            <p style={{ margin: 0, color: C.sl, lineHeight: 1.7, fontSize: 15 }}>{pg.exams}</p>
          </div>
          <div>
            <h2 style={h2}>{pg.leadsHeading || 'Where ' + level + 's lead'}</h2>
            <p style={{ margin: 0, color: C.sl, lineHeight: 1.7, fontSize: 15 }}>{pg.universities}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '40px 0' }}>
        <div style={{ ...wrap, maxWidth: 880 }}>
          <h2 style={h2}>{level} admissions 2027: questions families ask</h2>
          {pg.faqs.map(f => <Faq key={f.q} {...f} />)}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '52px 0', background: C.cr, color: '#fff', textAlign: 'center' }}>
        <div style={wrap}>
          <h2 style={{ ...h2, color: '#fff' }}>{pg.ctaH || 'Begin ' + level} in <em style={{ color: C.gold }}>January 2027</em></h2>
          <p style={{ color: 'rgba(255,255,255,.85)', maxWidth: 640, margin: '0 auto 22px', lineHeight: 1.7 }}>{ctaText}</p>
          <a href="/assessment" onClick={go('/assessment')} style={{ ...btn(false), background: '#fff', border: 'none' }}>Book an assessment <span aria-hidden>→</span></a>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.75)', margin: '18px 0 0' }}>
            Also: {also.map(([href, label], i) => <span key={href}>{i ? ' · ' : ''}<a href={href} onClick={go(href)} style={{ color: '#F3D9A4' }}>{label}</a></span>)}
          </p>
        </div>
      </section>
    </main>
  )
}
