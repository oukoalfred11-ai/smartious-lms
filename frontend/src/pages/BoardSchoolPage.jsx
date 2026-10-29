/**
 * BoardSchoolPage — /cambridge-online-school and
 * /pearson-edexcel-online-school, rendered inside LandingPage.
 * Content: data/boardSchools.js (the static HTML for search engines is
 * built from the same file by scripts/seo-static.mjs).
 */
import { useState } from 'react'
import { BOARD_SCHOOLS, FEE_LINE } from '../data/boardSchools.js'

const C = { cr: '#8B1A2E', gold: '#C9973A', ink: '#080C14', sl: '#2E3D55', mut: '#6B7280', bone: '#FDFAF4', bone2: '#F8F2E6', line: '#E8DFCC' }
const serif = "'DM Serif Display',Georgia,serif"
const wrap = { maxWidth: 1080, margin: '0 auto', padding: '0 20px' }
const h2 = { fontFamily: serif, fontWeight: 400, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: C.ink, margin: '0 0 14px', lineHeight: 1.25 }
const card = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: 12, padding: '20px 22px' }
const grid = (min) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 16 })
const cta = (primary) => ({ display: 'inline-block', padding: '13px 22px', borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none', background: primary ? C.cr : 'transparent', color: primary ? '#fff' : '#fff', border: primary ? 'none' : '1.5px solid rgba(255,255,255,.55)' })

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

export default function BoardSchoolPage({ boardKey }) {
  const pg = BOARD_SCHOOLS[boardKey]
  if (!pg) return null
  const other = BOARD_SCHOOLS[pg.other]
  return (
    <main style={{ background: C.bone, color: C.ink }}>
      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${C.ink} 0%, #1B2436 100%)`, color: '#fff', padding: '72px 0 56px' }}>
        <div style={wrap}>
          <div className="eyebrow" style={{ color: C.gold, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', fontSize: 12.5 }}>{pg.eyebrow}</div>
          <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.12, margin: '12px 0 16px', maxWidth: 860 }}>{pg.h1}</h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,.86)', maxWidth: 780, margin: '0 0 26px' }}>{pg.intro}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/assessment" style={cta(true)}>Book an assessment</a>
            <a href="#stages" style={cta(false)}>See the stages</a>
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.7)', margin: '18px 0 0' }}>{FEE_LINE}</p>
        </div>
      </section>

      {/* Status */}
      <section style={{ padding: '48px 0 8px' }}>
        <div style={{ ...wrap, ...grid(250) }}>
          {pg.status.map(([h, p]) => (
            <div key={h} style={{ ...card, borderLeft: `3px solid ${C.cr}` }}>
              <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: '1.2rem', margin: '0 0 8px' }}>{h}</h2>
              <p style={{ margin: 0, color: C.sl, lineHeight: 1.65, fontSize: 14.5 }}>{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stages */}
      <section id="stages" style={{ padding: '44px 0' }}>
        <div style={wrap}>
          <h2 style={h2}>{pg.board} stages we teach</h2>
          <div style={grid(230)}>
            {pg.stages.map(s => (
              <div key={s.name} style={card}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.ages}</div>
                <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: '1.2rem', margin: '6px 0 8px' }}>{s.name}</h3>
                <p style={{ margin: 0, color: C.sl, lineHeight: 1.65, fontSize: 14.5 }}>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section style={{ padding: '8px 0 44px' }}>
        <div style={wrap}>
          <h2 style={h2}>Subjects</h2>
          <div style={grid(300)}>
            {Object.entries(pg.subjects).map(([level, list]) => (
              <div key={level} style={card}>
                <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>{pg.board} {level}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {list.map(s => <span key={s} style={{ background: C.bone2, border: `1px solid ${C.line}`, borderRadius: 99, padding: '5px 11px', fontSize: 13, color: C.sl }}>{s}</span>)}
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: C.mut, fontSize: 13.5, margin: '12px 0 0' }}>{pg.subjectsNote}</p>
        </div>
      </section>

      {/* Included */}
      <section style={{ padding: '44px 0', background: '#fff', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div style={wrap}>
          <h2 style={h2}>What a {pg.board} student gets</h2>
          <div style={grid(260)}>
            {pg.included.map(([h, p]) => (
              <div key={h}>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, color: C.cr }}>{h}</h3>
                <p style={{ margin: 0, color: C.sl, lineHeight: 1.65, fontSize: 14.5 }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exams */}
      <section style={{ padding: '44px 0' }}>
        <div style={wrap}>
          <h2 style={h2}>{pg.board} examinations</h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: C.sl, lineHeight: 1.75, fontSize: 15, maxWidth: 860 }}>
            {pg.exams.map(x => <li key={x} style={{ marginBottom: 8 }}>{x}</li>)}
          </ul>
        </div>
      </section>

      {/* How to choose */}
      <section style={{ padding: '8px 0 44px' }}>
        <div style={wrap}>
          <h2 style={h2}>How to choose a {pg.board} online school</h2>
          <div style={grid(300)}>
            {pg.choose.map(([h, p], i) => (
              <div key={h} style={card}>
                <div style={{ fontFamily: serif, color: C.gold, fontSize: '1.4rem' }}>{String(i + 1).padStart(2, '0')}</div>
                <h3 style={{ margin: '4px 0 6px', fontSize: 16 }}>{h}</h3>
                <p style={{ margin: 0, color: C.sl, lineHeight: 1.65, fontSize: 14.5 }}>{p}</p>
              </div>
            ))}
          </div>
          <div style={{ ...card, marginTop: 18, background: C.bone2 }}>
            <p style={{ margin: 0, color: C.sl, lineHeight: 1.7, fontSize: 15 }}>
              {pg.compare} <a href={'/' + other.slug} style={{ color: C.cr, fontWeight: 700 }}>{other.board} online school</a>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '44px 0', background: '#fff', borderTop: `1px solid ${C.line}` }}>
        <div style={{ ...wrap, maxWidth: 860 }}>
          <h2 style={h2}>{pg.board} online school: questions families ask</h2>
          {pg.faqs.map(f => <Faq key={f.q} {...f} />)}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '52px 0', background: C.ink, color: '#fff', textAlign: 'center' }}>
        <div style={wrap}>
          <h2 style={{ ...h2, color: '#fff' }}>Start with an assessment</h2>
          <p style={{ color: 'rgba(255,255,255,.8)', maxWidth: 640, margin: '0 auto 22px', lineHeight: 1.7 }}>We place every student at the right {pg.board} stage and plan their subjects before they join a class.</p>
          <a href="/assessment" style={cta(true)}>Book an assessment</a>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.65)', margin: '18px 0 0' }}>
            Also: <a href="/curricula" style={{ color: C.gold }}>all curricula</a> {'·'} <a href={'/' + other.slug} style={{ color: C.gold }}>{other.board} online school</a> {'·'} <a href="/pricing" style={{ color: C.gold }}>fees</a>
          </p>
        </div>
      </section>
    </main>
  )
}
