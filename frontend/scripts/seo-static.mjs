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
import { SERVICES } from '../src/data/services.js'
import { NAIROBI_AREAS } from '../src/data/nairobiAreas.js'
import { readdirSync } from 'node:fs'

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

// ── Titles the app sets at runtime (PAGE_META + per-page branches) ──
const LANDING = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'pages', 'LandingPage.jsx'), 'utf8').replace(/\r\n/g, '\n')
const PAGE_META = (() => {
  const i = LANDING.indexOf('const PAGE_META = {'); const j = LANDING.indexOf('\n}\n', i)
  return new Function('SITE', 'return ' + LANDING.slice(i + 'const PAGE_META = '.length, j + 2))(SITE)
})()
const unq = (x) => new Function("return '" + x + "'")()
const BRANCH = {}
for (const m of LANDING.matchAll(/page === '([a-z0-9-]+)'\) \{\n\s*metaTitle\s*=\s*'((?:[^'\\]|\\.)*)'\n\s*metaDesc\s*=\s*'((?:[^'\\]|\\.)*)'/g)) {
  BRANCH[m[1]] = { title: unq(m[2]), desc: unq(m[3]) }
}
const metaFor = (id) => BRANCH[id] || PAGE_META[id] || null
const policy = (name) => {
  const i = LANDING.indexOf('const ' + name + ' = ['); if (i < 0) return []
  const j = LANDING.indexOf('\n]', i)
  return new Function('return ' + LANDING.slice(i + ('const ' + name + ' = ').length, j + 2))()
}

// ── Countries: every *_COUNTRY / *_CITIES data file ──
const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const COUNTRIES = []
for (const f of readdirSync(DATA).filter(f => f.endsWith('Cities.js')).sort()) {
  const m = await import('../src/data/' + f)
  const country = Object.entries(m).find(([k]) => k.endsWith('_COUNTRY'))?.[1]
  const cities = Object.entries(m).find(([k, v]) => k.endsWith('_CITIES') && Array.isArray(v))?.[1] || []
  if (country && country.hub) COUNTRIES.push({ country, cities })
}
const KEY_HUBS = ['kenya', 'uae', 'united-kingdom', 'usa', 'canada', 'nigeria', 'south-africa', 'saudi-arabia', 'qatar', 'australia', 'india', 'germany']
const hubName = (c) => c.name || c.longName
const allHubLinks = () => COUNTRIES.map(({ country: c }) => ({ href: c.hub, label: 'Online school in ' + hubName(c) }))
const MAIN_LINKS = [
  { href: '/about', label: 'About Smartious' }, { href: '/curricula', label: 'Curricula' }, { href: '/programs', label: 'Programmes' },
  { href: '/homeschool', label: 'Homeschooling' }, { href: '/tuition', label: 'Private tuition' }, { href: '/pricing', label: 'Fees' },
  { href: '/teachers', label: 'Our team' }, { href: '/faq', label: 'FAQ' }, { href: '/blog', label: 'Guides and articles' },
  { href: '/contact', label: 'Contact' }, { href: '/assessment', label: 'Book an assessment' },
]
const SERVICE_LINKS = SERVICES.map(sv => ({ href: '/services/' + sv.slug, label: sv.h }))

// Home
{
  const m = PAGE_META.home
  pages.push({ path: '/', file: 'home.html', title: m.title, desc: m.desc, body: [
    '<h1>Online school, virtual school and homeschool</h1>', p(m.desc),
    h2('Programmes and services'), links([...SERVICE_LINKS, ...MAIN_LINKS.slice(0, 6)]),
    h2('Online school by country'), links(allHubLinks()),
    h2('Latest guides'), links(Object.entries(FULL_ARTICLES).slice(-24).reverse().map(([slug, a]) => ({ href: '/blog/' + slug, label: a.t }))),
  ] })
}
// Main pages with their own titles
for (const id of ['about', 'curricula', 'services', 'pricing', 'programs', 'faq', 'teachers', 'contact', 'homeschool', 'tuition', 'tuition-nairobi',
                  'languages', 'test-prep', 'study-abroad', 'iufp', 'pre-university', 'calendar', 'events', 'gallery', 'activities', 'assessment']) {
  const m = metaFor(id); if (!m) continue
  const body = ['<h1>' + esc(m.title.split(/ [|—–] /)[0]) + '</h1>', p(m.desc)]
  if (id === 'services' || id === 'programs') body.push(h2('Services'), links(SERVICE_LINKS))
  if (id === 'tuition-nairobi') body.push(h2('Tuition by area'), links(NAIROBI_AREAS.map(a => ({ href: '/tuition/' + a.slug, label: 'Tutors in ' + a.name }))))
  if (id === 'pricing' || id === 'about' || id === 'curricula') body.push(h2('Online school by country'), links(allHubLinks()))
  pages.push({ path: '/' + id, title: m.title, desc: m.desc, body })
}
// Blog index: every guide, as real links
pages.push({ path: '/blog', title: (PAGE_META.blog || {}).title || 'Guides | ' + SITE, desc: (PAGE_META.blog || {}).desc || 'Guides for families.', body: [
  '<h1>Guides and articles</h1>', links(Object.entries(FULL_ARTICLES).filter(([, a]) => a && a.t).map(([slug, a]) => ({ href: '/blog/' + slug, label: a.t }))),
] })
// Policies, in full
for (const [id, name] of [['privacy', 'PRIVACY_POLICY'], ['terms', 'TERMS_OF_SERVICE'], ['cookies', 'COOKIE_POLICY'], ['gdpr', 'GDPR_COMPLIANCE'],
                          ['child-protection', 'CHILD_PROTECTION_POLICY'], ['academic-integrity', 'ACADEMIC_INTEGRITY_POLICY'],
                          ['ai-policy', 'AI_USE_POLICY'], ['inclusion-policy', 'INCLUSION_POLICY'], ['language-policy', 'LANGUAGE_POLICY']]) {
  const m = metaFor(id); if (!m) continue
  pages.push({ path: '/' + id, title: m.title, desc: m.desc, body: ['<h1>' + esc(m.title.split(' | ')[0]) + '</h1>', ...policy(name).map(x => h2(x.h) + p(x.p))] })
}
// Services
for (const sv of SERVICES) {
  pages.push({ path: '/services/' + sv.slug, title: sv.seoTitle || sv.h + ' | ' + SITE, desc: sv.seoDesc || sv.desc, body: [
    '<h1>' + esc(sv.h) + '</h1>', p(sv.desc), p(typeof sv.detail === 'string' ? sv.detail : ''), h2('Other services'), links(SERVICE_LINKS.filter(l => l.href !== '/services/' + sv.slug)),
  ] })
}
// Nairobi tuition areas
for (const a of NAIROBI_AREAS) {
  pages.push({ path: '/tuition/' + a.slug, title: a.seoTitle || 'Tuition in ' + a.name + ', Nairobi | Smartious', desc: a.seoDesc || clip(a.intro), body: [
    '<h1>Tuition in ' + esc(a.name) + ', Nairobi</h1>', p(a.intro), p(a.introExtended), p(a.pricingNote), faqs(a.localFaqs),
    h2('Nearby areas'), links(NAIROBI_AREAS.filter(x => x !== a).slice(0, 12).map(x => ({ href: '/tuition/' + x.slug, label: 'Tutors in ' + x.name }))),
    h2('Online school in Kenya'), links([{ href: '/online-school/kenya', label: 'Online school and homeschool in Kenya' }, { href: '/tuition-nairobi', label: 'All Nairobi tuition' }]),
  ] })
}
// Country hubs and their city pages (UAE has its own, richer pages below)
for (const { country: c, cities } of COUNTRIES) {
  if (c.slug === 'uae') continue
  const m = metaFor(c.hubPageId)
  const name = hubName(c)
  const title = (m && m.title) || 'Online School in ' + name + ' | IGCSE, A-Level & IB | Smartious'
  const desc = (m && m.desc) || c.heroSubhead
  const cityLinks = cities.map(x => ({ href: '/homeschool-' + x.slug, label: 'Online school in ' + x.name }))
  pages.push({ path: c.hub, title, desc, body: [
    '<h1>Online school and homeschool in ' + esc(name) + '</h1>', p(c.heroSubhead), p(c.heroValueProp),
    cityLinks.length ? h2(c.citiesSectionTitle || 'Cities') + links(cityLinks) : '',
    h2('Why families choose Smartious'), bullets(c.whySmartious), faqs(c.faqs),
    h2('Fees and admission'), links([{ href: '/pricing', label: 'Fees: from USD 423/month for Primary' }, { href: '/assessment', label: 'Book a free assessment' }]),
  ] })
  for (const x of cities) {
    pages.push({ path: '/homeschool-' + x.slug,
      title: x.seoTitle || ((x.primaryKeyword || x.name) + ' — Online & Virtual School | Cambridge IGCSE & A-Level | Smartious'),
      desc: x.seoDesc || clip(x.intro), body: [
        '<h1>' + esc(x.primaryKeyword || 'Online school in ' + x.name) + '</h1>', p(x.heroTagline), p(x.intro),
        h2('Why ' + x.name + ' families choose Smartious'), bullets(x.whyChoose), faqs(x.faqs),
        h2('More in ' + name), links([{ href: c.hub, label: 'Online school in ' + name }, ...cityLinks.filter(l => l.href !== '/homeschool-' + x.slug)]),
      ] })
  }
}

pages.push({
  path: '/online-school/uae',
  title: 'Online School in the UAE | Dubai & Abu Dhabi Homeschooling, IGCSE & A-Level | Smartious',
  desc: 'Online, virtual school & homeschool. Live online Cambridge IGCSE and A-Level for UAE families across Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah. Wellington / Dubai College / BSAK / Repton / Brighton College alternative. Immediate enrolment, no KHDA/ADEK waiting lists. From USD 423/month (about AED 1,553), paid termly.',
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
  const hubs = KEY_HUBS.map(slug => COUNTRIES.find(x => x.country.slug === slug)).filter(Boolean)
  const nav = `<nav><a href="/">Smartious Homeschool</a>${MAIN_LINKS.map(l => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}</nav>`
  const foot = `<footer>${h2('Online school by country')}<p>${hubs.map(x => `<a href="${x.country.hub}">${esc(hubName(x.country))}</a>`).join(' · ')}</p></footer>`
  const body = `<div id="seo-static">${nav}${pg.body.filter(Boolean).join('')}${h2('Start with Smartious')}${links(CTA_LINKS)}${foot}</div>`
  return html.replace('<div id="root"></div>', body + '<div id="root"></div>')
}

let n = 0
for (const pg of pages) {
  if (!pg.title || !pg.desc) { console.warn('seo-static: skipped', pg.path, '(no title/description)'); continue }
  const out = join(DIST, pg.file || pg.path.replace(/^\/+/, '') + '.html')
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, render(pg))
  n++
}
console.log(`seo-static: wrote ${n} pages`)
