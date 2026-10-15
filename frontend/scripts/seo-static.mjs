/* ═══════════════════════════════════════════════════════════════════
   seo-static.mjs — fast build-time HTML for key SEO routes.
   ───────────────────────────────────────────────────────────────────
   The Puppeteer prerender (prerender.js) is too slow for Netlify and is
   switched off, so every URL was served the bare index.html: homepage
   title, homepage description, no canonical and an empty page until the
   whole app had downloaded and run.

   This script needs no browser. It reads the same data files the pages
   render from and writes, for each route, a copy of the built
   index.html with:
     · the page's own <title>, description, canonical and Open Graph tags
     · the page's main text and links in plain HTML (#seo-static), so
       crawlers that do not run JavaScript still read the page

   main.jsx removes #seo-static before React renders, so visitors see the
   normal page; until then it doubles as a readable loading state.

   Files are FLAT (dist/blog/x.html, not dist/blog/x/index.html) so
   Netlify serves /blog/x at 200 with no trailing-slash redirect.

   Titles here mirror the ones usePageMeta sets in LandingPage.jsx; keep
   them in step when changing either.
═══════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { UAE_CITIES, UAE_COUNTRY } from '../src/data/uaeCities.js'
import { UAE_AREAS } from '../src/data/uaeAreas.js'
import { FULL_ARTICLES } from '../src/data/fullArticles.js'

const ORIGIN = 'https://smartioushomeschool.com'
const SITE = 'Smartious Homeschool & eSchool'
const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const clip = (s, n = 158) => {
  s = String(s || '').replace(/\s+/g, ' ').trim()
  return s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + '…'
}

// ── Page body helpers ────────────────────────────────────────
const p = (t) => (t ? `<p>${esc(t)}</p>` : '')
const h2 = (t) => `<h2>${esc(t)}</h2>`
const links = (list) => list.length
  ? `<ul class="ss-links">${list.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a>${l.note ? ` — ${esc(l.note)}` : ''}</li>`).join('')}</ul>`
  : ''
const faqs = (list = []) => list.length
  ? h2('Frequently asked questions') + list.map(f => `<h3>${esc(f.q)}</h3>${p(f.a)}`).join('')
  : ''
const bullets = (list = []) => list.length
  ? `<ul>${list.map(x => `<li>${esc(typeof x === 'string' ? x : Array.isArray(x) ? x.join(': ') : [x.h || x.title, x.p || x.text].filter(Boolean).join(': '))}</li>`).join('')}</ul>`
  : ''

const UAE_PRODUCT_LINKS = [
  { href: '/homeschool-dubai-ae', label: 'Online school in Dubai', note: 'Full-time live classes and homeschooling, IGCSE to A-Level and IB' },
  { href: '/tuition-uae', label: 'Online tutors in Dubai', note: '1-on-1 tuition in IGCSE, A-Level and IB subjects' },
  { href: '/online-school/uae', label: 'Abu Dhabi, Sharjah and the rest of the UAE', note: 'Every emirate we teach in' },
]
const CTA_LINKS = [
  { href: '/assessment', label: 'Book a free assessment' },
  { href: '/pricing', label: 'Fees' },
  { href: '/contact', label: 'Contact admissions' },
]

// ── Routes ───────────────────────────────────────────────────
const pages = []

pages.push({
  path: '/online-school/uae',
  title: 'Online School in the UAE | Dubai & Abu Dhabi Homeschooling, IGCSE & A-Level | Smartious',
  desc: 'Online, virtual school & homeschool. Live online Cambridge IGCSE and A-Level for UAE families across Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah. Wellington / Dubai College / BSAK / Repton / Brighton College alternative. Immediate enrolment, no KHDA/ADEK waiting lists. From USD 400/month (about AED 1,470).',
  body: [
    `<h1>Online school and homeschooling in the UAE</h1>`,
    p(UAE_COUNTRY.heroSubhead),
    h2(UAE_COUNTRY.citiesSectionTitle || 'Cities we teach in'),
    links(UAE_CITIES.map(c => ({ href: '/homeschool-' + c.slug, label: 'Online school in ' + c.name, note: c.region }))),
    h2('Online tuition'),
    links([{ href: '/tuition-uae', label: 'Online tutors in Dubai and the UAE' }]),
    h2('Why families choose Smartious'),
    bullets(UAE_COUNTRY.whySmartious),
    faqs(UAE_COUNTRY.faqs),
  ],
})

for (const c of UAE_CITIES) {
  pages.push({
    path: '/homeschool-' + c.slug,
    title: c.seoTitle || ('Online School & Homeschooling in ' + c.name + ' | IGCSE, A-Level, IB | Smartious'),
    desc: c.seoDesc,
    body: [
      `<h1>Online school and homeschooling in ${esc(c.name)}</h1>`,
      p(c.heroTagline),
      p(c.intro),
      h2('Why ' + c.name + ' families choose Smartious'),
      bullets(c.whyChoose),
      h2('Subjects'),
      bullets(c.subjects),
      p(c.onlineLearningDetail),
      p(c.homeschoolDetail),
      h2('Online tuition in ' + c.name),
      links(UAE_AREAS.filter(a => a.emirate === c.name).map(a => ({ href: '/tuition-uae/' + a.slug, label: 'Online tutors in ' + a.name }))),
      faqs(c.faqs),
      h2('Other emirates'),
      links(UAE_CITIES.filter(x => x !== c).map(x => ({ href: '/homeschool-' + x.slug, label: 'Online school in ' + x.name }))),
    ],
  })
}

pages.push({
  path: '/tuition-uae',
  title: 'Online Tutors in Dubai & the UAE | IGCSE, A-Level & IB Tuition | Smartious',
  desc: 'Live online tuition for families in Dubai, Abu Dhabi and Sharjah: Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and American AP. Qualified tutors, Gulf-time lessons, from USD 15/hour (about AED 55).',
  body: [
    `<h1>Online tutors in Dubai and the UAE</h1>`,
    p('Live online 1-on-1 tuition for Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and American AP, with lessons timed for the Gulf day. Smartious tuition in the UAE is online only.'),
    ...['Dubai', 'Abu Dhabi', 'Sharjah'].map(em => {
      const list = UAE_AREAS.filter(a => a.emirate === em)
      return list.length ? h2(em) + links(list.map(a => ({ href: '/tuition-uae/' + a.slug, label: 'Online tutors in ' + a.name }))) : ''
    }),
    h2('Full-time online school'),
    links([UAE_PRODUCT_LINKS[0], UAE_PRODUCT_LINKS[2]]),
  ],
})

for (const a of UAE_AREAS) {
  pages.push({
    path: '/tuition-uae/' + a.slug,
    title: a.seoTitle || ('Online Tuition in ' + a.name + ', ' + a.emirate + ' | Smartious'),
    desc: a.seoDesc,
    body: [
      `<h1>Online tuition in ${esc(a.name)}, ${esc(a.emirate)}</h1>`,
      p(a.intro),
      p(a.introExtended),
      p(a.onlineNote),
      p(a.pricingNote),
      faqs(a.localFaqs),
      h2('Nearby areas'),
      links((a.nearbyAreas || []).map(s => UAE_AREAS.find(x => x.slug === s)).filter(Boolean)
        .map(x => ({ href: '/tuition-uae/' + x.slug, label: 'Online tutors in ' + x.name }))),
      h2('Smartious in the UAE'),
      links(UAE_PRODUCT_LINKS),
    ],
  })
}

for (const [slug, a] of Object.entries(FULL_ARTICLES)) {
  if (!a || !a.t) continue
  pages.push({
    path: '/blog/' + slug,
    title: a.metaTitle || (a.t + ' | ' + SITE),
    desc: a.metaDesc || clip(a.intro),
    body: [
      `<h1>${esc(a.t)}</h1>`,
      a.author ? `<p class="ss-by">By ${esc(a.author)}${a.role ? ', ' + esc(a.role) : ''}${a.date ? ' · ' + esc(a.date) : ''}</p>` : '',
      p(a.intro),
      a.country === 'uae' ? h2('Smartious for families in Dubai and the UAE') + links(UAE_PRODUCT_LINKS) : '',
      ...(a.sections || []).map(s => h2(s.h) + p(s.p)),
      p(a.conclusion),
      faqs(a.faqs),
    ],
  })
}

// ── Write ────────────────────────────────────────────────────
const indexPath = join(DIST, 'index.html')
if (!existsSync(indexPath)) {
  console.error('seo-static: dist/index.html not found — run vite build first')
  process.exit(1)
}
const shell = readFileSync(indexPath, 'utf8')

const STYLE = `<style>#seo-static{max-width:760px;margin:0 auto;padding:96px 20px 60px;font:16px/1.75 system-ui,-apple-system,'Segoe UI',sans-serif;color:#1C2230;background:#F7F3ED}#seo-static h1{font:700 2rem/1.2 Georgia,serif;margin:0 0 16px}#seo-static h2{font:700 1.35rem/1.3 Georgia,serif;margin:32px 0 10px}#seo-static h3{font-size:1rem;margin:18px 0 4px}#seo-static a{color:#8B1A2E}#seo-static .ss-by{color:#5B6475;font-size:14px}#seo-static nav a{margin-right:16px}</style>`

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`)
  const tag = `<meta ${attr}="${key}" content="${esc(value)}"/>`
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `  ${tag}\n</head>`)
}

function render(pg) {
  const url = ORIGIN + pg.path
  const desc = clip(pg.desc, 300)
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(pg.title)}</title>`)
  html = setMeta(html, 'name', 'description', desc)
  html = setMeta(html, 'property', 'og:title', pg.title)
  html = setMeta(html, 'property', 'og:description', desc)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'name', 'twitter:title', pg.title)
  html = setMeta(html, 'name', 'twitter:description', desc)
  html = html.replace('</head>', `  <link rel="canonical" href="${url}"/>\n  ${STYLE}\n</head>`)
  const nav = `<nav><a href="/">Smartious Homeschool</a><a href="/online-school/uae">UAE</a><a href="/blog">Guides</a><a href="/pricing">Fees</a></nav>`
  const body = `<div id="seo-static">${nav}${pg.body.filter(Boolean).join('')}${h2('Start with Smartious')}${links(CTA_LINKS)}</div>`
  return html.replace('<div id="root"></div>', body + '<div id="root"></div>')
}

let n = 0
for (const pg of pages) {
  if (!pg.title || !pg.desc) { console.warn('seo-static: skipped', pg.path, '(no title/description)'); continue }
  const out = join(DIST, pg.path.replace(/^\/+/, '') + '.html')
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, render(pg))
  n++
}
console.log(`seo-static: wrote ${n} pages`)
