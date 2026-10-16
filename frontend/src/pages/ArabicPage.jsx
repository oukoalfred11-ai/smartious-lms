/* ═══════════════════════════════════════════════════════════════════
   ArabicPage.jsx — right-to-left Arabic landing pages at /ar/<slug>.
   ───────────────────────────────────────────────────────────────────
   Content lives in src/data/arabicPages.js. This component reads
   window.location.pathname, finds the matching page, and renders it
   with dir="rtl" and lang="ar". While mounted it sets the document
   title, meta description, canonical, hreflang alternates (ar → this
   page, en → enPath) and <html lang="ar" dir="rtl">, and restores the
   previous values on unmount so the English SPA is unaffected.
═══════════════════════════════════════════════════════════════════ */

import { useEffect } from 'react'
import { ARABIC_PAGES, ARABIC_WHATSAPP } from '../data/arabicPages.js'

const ORIGIN = 'https://smartioushomeschool.com'
const CRIMSON = '#8B1A2E'
const INK = '#1A1A1A'
const MUTED = '#5A5A5A'
const BORDER = '#E8E2DA'
const FONT = '"Noto Naskh Arabic", "Segoe UI", Tahoma, sans-serif'

function normalisePath(p) {
  const clean = (p || '').split(/[?#]/)[0].replace(/\/+$/, '')
  return clean || '/'
}

function findPage(pathname) {
  const path = normalisePath(pathname)
  return ARABIC_PAGES.find(p => p.path === path) || null
}

// Sets (or creates) a <meta name=...> tag and returns a restore function.
function setMeta(name, content) {
  let el = document.head.querySelector(`meta[name="${name}"]`)
  const created = !el
  const prev = el ? el.getAttribute('content') : null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
  return () => {
    if (created) el.remove()
    else if (prev !== null) el.setAttribute('content', prev)
  }
}

// Sets the canonical link and returns a restore function.
function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  const created = !el
  const prev = el ? el.getAttribute('href') : null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
  return () => {
    if (created) el.remove()
    else if (prev !== null) el.setAttribute('href', prev)
  }
}

// Adds hreflang alternates (removing any existing ones while mounted)
// and returns a restore function.
function setHreflang(links) {
  const existing = [...document.head.querySelectorAll('link[rel="alternate"][hreflang]')]
  existing.forEach(el => el.remove())
  const added = links.map(({ lang, href }) => {
    const el = document.createElement('link')
    el.setAttribute('rel', 'alternate')
    el.setAttribute('hreflang', lang)
    el.setAttribute('href', href)
    document.head.appendChild(el)
    return el
  })
  return () => {
    added.forEach(el => el.remove())
    existing.forEach(el => document.head.appendChild(el))
  }
}

const S = {
  root: { direction: 'rtl', textAlign: 'right', background: '#FFFFFF', color: INK, fontFamily: FONT, fontSize: 18, lineHeight: 1.9, minHeight: '100vh' },
  header: { borderBottom: `1px solid ${BORDER}`, background: '#FFFFFF' },
  headerInner: { maxWidth: 860, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  brand: { color: CRIMSON, fontWeight: 700, fontSize: 20, textDecoration: 'none' },
  navLink: { color: CRIMSON, textDecoration: 'none', fontSize: 15, fontWeight: 600, border: `1px solid ${CRIMSON}`, borderRadius: 999, padding: '6px 14px', whiteSpace: 'nowrap' },
  main: { maxWidth: 860, margin: '0 auto', padding: '40px 16px 64px' },
  h1: { color: CRIMSON, fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', lineHeight: 1.4, margin: '0 0 20px', fontWeight: 700 },
  intro: { fontSize: 19, color: INK, margin: '0 0 28px', paddingRight: 16, borderRight: `4px solid ${CRIMSON}` },
  h2: { color: CRIMSON, fontSize: '1.45rem', lineHeight: 1.5, margin: '36px 0 12px', fontWeight: 700 },
  p: { margin: '0 0 14px', color: INK },
  cta: { display: 'inline-block', background: CRIMSON, color: '#FFFFFF', textDecoration: 'none', fontWeight: 700, fontSize: 18, borderRadius: 10, padding: '14px 26px', marginTop: 8 },
  ctaBox: { background: '#FBF7F2', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '24px 20px', margin: '40px 0 0', textAlign: 'center' },
  faq: { border: `1px solid ${BORDER}`, borderRadius: 10, padding: '14px 18px', marginBottom: 12, background: '#FFFFFF' },
  faqQ: { fontWeight: 700, cursor: 'pointer', color: INK },
  footer: { borderTop: `1px solid ${BORDER}`, color: MUTED, fontSize: 15, padding: '20px 16px', textAlign: 'center' },
}

function Header({ enPath }) {
  return (
    <header style={S.header}>
      <div style={S.headerInner}>
        <a href="/" style={S.brand}>Smartious</a>
        <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="/" style={S.navLink}>الصفحة الرئيسية</a>
          {enPath && <a href={enPath} hrefLang="en" lang="en" dir="ltr" style={S.navLink}>English</a>}
        </nav>
      </div>
    </header>
  )
}

function WhatsAppCta() {
  return (
    <div style={S.ctaBox}>
      <p style={{ ...S.p, fontWeight: 700, fontSize: 20 }}>تحدّثوا مع فريق القبول</p>
      <p style={S.p}>
        واتساب: <span dir="ltr">+254 745 021 212</span> · البريد الإلكتروني: <span dir="ltr">hello@smartioushomeschool.com</span>
      </p>
      <a href={ARABIC_WHATSAPP} target="_blank" rel="noopener noreferrer" style={S.cta}>راسلونا عبر واتساب</a>
    </div>
  )
}

export default function ArabicPage() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const page = findPage(pathname)

  useEffect(() => {
    const html = document.documentElement
    const prevLang = html.getAttribute('lang')
    const prevDir = html.getAttribute('dir')
    const prevTitle = document.title
    html.setAttribute('lang', 'ar')
    html.setAttribute('dir', 'rtl')

    const restores = []
    if (page) {
      document.title = page.title
      restores.push(setMeta('description', page.description))
      restores.push(setCanonical(ORIGIN + page.path))
      restores.push(setHreflang([
        { lang: 'ar', href: ORIGIN + page.path },
        { lang: 'en', href: ORIGIN + page.enPath },
      ]))
    } else {
      document.title = 'الصفحة غير موجودة | Smartious'
      restores.push(setMeta('robots', 'noindex'))
    }

    return () => {
      restores.reverse().forEach(fn => fn())
      document.title = prevTitle
      if (prevLang === null) html.removeAttribute('lang'); else html.setAttribute('lang', prevLang)
      if (prevDir === null) html.removeAttribute('dir'); else html.setAttribute('dir', prevDir)
    }
  }, [page])

  if (!page) {
    return (
      <div dir="rtl" lang="ar" style={S.root}>
        <Header enPath="/" />
        <main style={S.main}>
          <h1 style={S.h1}>الصفحة غير موجودة</h1>
          <p style={S.p}>عذرًا، لم نعثر على الصفحة التي تبحثون عنها. ربما نُقلت أو تغيّر عنوانها.</p>
          <ul style={{ paddingRight: 20, margin: '0 0 14px' }}>
            {ARABIC_PAGES.map(p => (
              <li key={p.slug}><a href={p.path} style={{ color: CRIMSON }}>{p.h1}</a></li>
            ))}
          </ul>
          <WhatsAppCta />
        </main>
      </div>
    )
  }

  return (
    <div dir="rtl" lang="ar" style={S.root}>
      <Header enPath={page.enPath} />
      <main style={S.main}>
        <article>
          <h1 style={S.h1}>{page.h1}</h1>
          <p style={S.intro}>{page.intro}</p>

          {page.sections.map((s, i) => (
            <section key={i}>
              <h2 style={S.h2}>{s.h}</h2>
              {s.p.map((para, j) => <p key={j} style={S.p}>{para}</p>)}
            </section>
          ))}

          <WhatsAppCta />

          {page.faqs && page.faqs.length > 0 && (
            <section>
              <h2 style={S.h2}>أسئلة شائعة</h2>
              {page.faqs.map((f, i) => (
                <details key={i} style={S.faq}>
                  <summary style={S.faqQ}>{f.q}</summary>
                  <p style={{ ...S.p, marginTop: 10, marginBottom: 0 }}>{f.a}</p>
                </details>
              ))}
            </section>
          )}
        </article>
      </main>
      <footer style={S.footer}>
        Smartious · تأسست في نيروبي عام 2018 ·{' '}
        <a href={page.enPath} hrefLang="en" style={{ color: CRIMSON }}>English version</a>
      </footer>
    </div>
  )
}
