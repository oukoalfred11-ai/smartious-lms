/* ═══════════════════════════════════════════════════════════════════
   seo-static.mjs — build-time HTML, JSON-LD and sitemap for every
   indexable route.
   ───────────────────────────────────────────────────────────────────
   The Puppeteer prerender (prerender.js) is too slow for Netlify and is
   switched off, so without this script every URL would be served the bare
   index.html: homepage title, no canonical and an empty page until the
   whole app had downloaded and run.

   This script needs no browser. It reads the same data files the pages
   render from and writes, for each route, a copy of the built index.html
   with:
     · the page's own <title>, description, canonical, robots and Open Graph
     · the page's main text and links in plain HTML (#seo-static), so
       crawlers that do not run JavaScript still read the page
     · the page's JSON-LD (BreadcrumbList, FAQPage, Course, Service), tied
       to the Organization in index.html by its @id
     · hreflang only for real translations (the /ar/* Arabic pages and the
       English pages they translate)
   and then writes dist/sitemap.xml (and the public/sitemap.xml fallback)
   from exactly the set of indexable pages it generated. Each URL's
   <lastmod> is the last git commit date of the data file(s) the page is
   built from (pg.src), not the build date, so it only moves when the
   page's content does.

   JSON-LD written here carries data-ss. Pages that render their own
   JSON-LD in the app would otherwise show Google two FAQPage or
   BreadcrumbList blocks once the page has run; main.jsx drops a static
   block when the app renders one of the same @type (and all of them on
   the first client-side navigation).

   main.jsx removes #seo-static before React renders, so visitors see the
   normal page; until then it doubles as a readable loading state.

   TRAILING SLASHES: files are FLAT (dist/blog/x.html, never
   dist/blog/x/index.html). With a flat file Netlify serves /blog/x at 200
   and 301s /blog/x/ to /blog/x. A folder index would do the opposite and
   split every URL in two. Every href written here is slash-free too.

   NOINDEX: thin templated /homeschool-<city> pages outside the priority
   markets are marked noindex,follow and left out of the sitemap. The rule
   is in noindexRule() below; `node scripts/seo-static.mjs --noindex-only`
   (run by `npm run build` before vite) writes the chosen slugs to
   src/data/noindexSlugs.js so the React page emits the same robots tag.

   Titles here mirror the ones usePageMeta sets in LandingPage.jsx (read
   from PAGE_META and the page branches below); keep them in step.
═══════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { UAE_CITIES, UAE_COUNTRY } from '../src/data/uaeCities.js'
import { UAE_AREAS } from '../src/data/uaeAreas.js'
import { UK_AREAS } from '../src/data/ukAreas.js'
import { FULL_ARTICLES } from '../src/data/fullArticles.js'
import { SERVICES } from '../src/data/services.js'
import { CURRICULA } from '../src/data/curricula.js'
import { SOCIAL_LINKS } from '../src/data/social.js'
import { TEST_PREP } from '../src/data/testPrep.js'
import { LANGUAGES } from '../src/data/languages.js'
import { STUDY_ABROAD } from '../src/data/studyAbroad.js'
import { NAIROBI_AREAS } from '../src/data/nairobiAreas.js'
import { COUNTRIES as COUNTRY_DETAILS } from '../src/data/countries.js'
import { GOOGLE_RATING, GOOGLE_REVIEWS, GOOGLE_PROFILE_URL, reviewOffset } from '../src/data/googleReviews.js'
import { US_STATES } from '../src/data/usStates.js'
import { US_CITIES, US_CITIES_BY_STATE } from '../src/data/usCities.js'
import { CA_PROVINCES } from '../src/data/caProvinces.js'
import { CA_CITIES, CA_CITIES_BY_PROVINCE } from '../src/data/caCities.js'
import { PRIORITY_HUB_LINKS, PRIORITY_CITY_LINKS } from '../src/data/priorityLinks.js'
import { HUB_TITLES, guideTitle, nairobiAreaTitle, fitTitle, fitDesc } from '../src/data/seoTitles.js'
import { ARTICLES_INDEX } from '../src/data/generated/articlesIndex.js'
import { CONTINENTAL_SERIES, guideCountryRows, aboutGuideText, fmtMonthYear } from '../src/data/continentalGuides.js'
import { guidesFor } from '../src/data/geoGuides.js'
import { naMeta, usLead, caLead, US_HEADLINE, CA_HEADLINE } from '../src/data/naFocus.js'
import { VL_PATH, VL_META, VL_HERO, VL_IMAGES, VL_BONES, VL_MODEL_IMAGES, VL_FEATURES, VL_KENYA, VL_INTERNATIONAL, VL_FAQS, VL_CREDITS, VL_PRACTICALS, VL_MODELS } from '../src/data/virtualLab.js'
import { EXPERIMENTS } from '../../shared/lab/experiments/index.js'
import { MODELS } from '../src/lab/models/catalogue.js'

const NOINDEX_ONLY = process.argv.includes('--noindex-only')
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const DATA = join(ROOT, 'src', 'data')
const ORIGIN = 'https://smartioushomeschool.com'
const ORG_ID = ORIGIN + '/#organization'
const SITE = 'Smartious Homeschool & eSchool'
const BUILD_DATE = new Date().toISOString().slice(0, 10)
const BUILD_ID = (process.env.COMMIT_REF || '').slice(0, 10) || Date.now().toString(36)

// The only published prices (see pricing page): school from USD 423/month
// for Primary, payable termly; tuition USD 15/hour.
const FEE_SCHOOL = 'From USD 423/month for Primary, payable termly; varies by curriculum and level'
const FEE_TUITION = 'USD 15/hour'

// ── Text helpers ─────────────────────────────────────────────
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const clip = (s, n = 158) => {
  s = String(s || '').replace(/\s+/g, ' ').trim()
  return s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + '…'
}
const ENT = { amp: '&', middot: '·', mdash: '—', ndash: '–', nbsp: ' ', times: '×', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…', rarr: '→', larr: '←', pound: '£', euro: '€', quot: '"', apos: "'", lt: '<', gt: '>' }
const decode = (s) => String(s ?? '')
  .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\n/g, ' ').replace(/\\(['"`\\])/g, '$1')
  .replace(/&(#\d+|[a-z]+);/gi, (m, e) => e[0] === '#' ? String.fromCharCode(+e.slice(1)) : (ENT[e.toLowerCase()] ?? m))
const words = (html) => String(html).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
// Internal links are always written without a trailing slash (see header).
const href = (h) => /^\//.test(h) && h.length > 1 ? h.replace(/\/+(?=$|[?#])/, '') : h

// ── Page body helpers ────────────────────────────────────────
const p = (t) => (t ? `<p>${esc(t)}</p>` : '')
const h2 = (t) => (t ? `<h2>${esc(t)}</h2>` : '')
const h3 = (t) => (t ? `<h3>${esc(t)}</h3>` : '')
const links = (list) => list.length
  ? `<ul class="ss-links">${list.map(l => `<li><a href="${esc(href(l.href))}">${esc(l.label)}</a>${l.note ? ` — ${esc(l.note)}` : ''}</li>`).join('')}</ul>`
  : ''
const faqs = (list = [], title = 'Frequently asked questions') => list.length
  ? h2(title) + list.map(f => `<h3>${esc(f.q)}</h3>${p(f.a)}`).join('')
  : ''
const itemText = (x) => typeof x === 'string' ? x
  : Array.isArray(x) ? x.join(': ')
  : x && typeof x === 'object'
    ? [x.h || x.title || x.name || x.context || x.level || x.range || x.feature, x.p || x.text || x.desc || x.scenario || x.target || x.note || x.who]
      .filter(Boolean).join(': ') || Object.values(x).filter(v => typeof v === 'string' && !/^(https?:|\/|#)/.test(v)).join(' — ')
    : ''
const bullets = (list = []) => (list || []).length
  ? `<ul>${list.map(x => itemText(x)).filter(Boolean).map(t => `<li>${esc(t)}</li>`).join('')}</ul>`
  : ''
// { heading, intro|body, points|rows|modes|domestic|international…, note }
function section(o) {
  if (!o || typeof o !== 'object' || !o.heading) return ''
  let out = h2(o.heading) + p(o.intro) + p(o.body)
  for (const [k, v] of Object.entries(o)) {
    if (['heading', 'intro', 'body', 'note', 'caveat', 'compareNote', 'mapEmbed', 'linkLabel', 'linkHref', 'profileLink', 'reviews'].includes(k)) continue
    if (!Array.isArray(v)) continue
    if (k === 'modes') {
      for (const m of v) out += h3(m.mode) + bullets((m.plans || []).map(pl => [pl.name, pl.who, pl.usd && 'USD ' + pl.usd].filter(Boolean).join(' — ')))
    } else if (k === 'points') {
      out += v.map(x => typeof x === 'object' && !Array.isArray(x) && x.h ? h3(x.h) + p(x.p) : p(itemText(x))).join('')
    } else {
      out += bullets(v)
    }
  }
  out += p(o.note) + p(o.caveat) + p(o.compareNote)
  if (o.linkHref && o.linkLabel) out += links([{ href: o.linkHref, label: o.linkLabel }])
  return out
}

// ── JSON-LD helpers ──────────────────────────────────────────
const ORG = { '@id': ORG_ID }
const faqLd = (list) => (list && list.length) ? {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: list.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
} : null
const offer = (kind) => kind === 'tuition'
  ? { '@type': 'Offer', price: 15, priceCurrency: 'USD', description: FEE_TUITION + ' at every level',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: 15, priceCurrency: 'USD', unitCode: 'HUR', unitText: 'hour' } }
  : { '@type': 'Offer', price: 423, priceCurrency: 'USD', description: FEE_SCHOOL,
      priceSpecification: { '@type': 'UnitPriceSpecification', price: 423, priceCurrency: 'USD', unitCode: 'MON', unitText: 'month', description: FEE_SCHOOL } }
const serviceLd = ({ name, desc, path, area, kind = 'school' }) => ({
  '@context': 'https://schema.org', '@type': 'Service',
  name, description: clip(desc, 300), url: ORIGIN + path, provider: ORG,
  ...(area ? { areaServed: { '@type': 'Place', name: area } } : {}),
  serviceType: kind === 'tuition' ? 'Private tuition' : 'Online school and homeschooling',
  offers: offer(kind),
})

// ── Titles the app sets at runtime (PAGE_META + per-page branches) ──
const LANDING = readFileSync(join(ROOT, 'src', 'pages', 'LandingPage.jsx'), 'utf8').replace(/\r\n/g, '\n')
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
const fromLanding = (name, open = '[', close = '\n]') => {
  const i = LANDING.indexOf('const ' + name + ' = ' + open); if (i < 0) return null
  const j = LANDING.indexOf(close, i)
  try { return new Function('return ' + LANDING.slice(i + ('const ' + name + ' = ').length, j + close.length))() } catch { return null }
}
const policy = (name) => fromLanding(name) || []
const COMPARES = fromLanding('COMPARES') || []
// /online-school/<slug> values with their own explicit branch in applyPath
// (everything else in COUNTRIES renders the generic country-detail page).
const ONLINE_BRANCHES = new Set([...LANDING.slice(LANDING.indexOf("if (path.startsWith('/online-school/'))"), LANDING.indexOf("if (COUNTRY_SLUGS.has(slug))"))
  .matchAll(/slug === '([a-z-]+)'/g)].map(m => m[1]))

// ── Static text from a page's JSX block in LandingPage.jsx ──
// Keeps the static copy of hand-written pages (FAQ, homeschool, tuition,
// funding pages…) in step with what the page renders, without a browser.
function pageBlock(id) {
  const start = LANDING.indexOf(`{page === '${id}' && (`); if (start < 0) return ''
  const re = /\n {6}(\)\}|\}\)\(\)\})/g; re.lastIndex = start
  const e = re.exec(LANDING); return LANDING.slice(start, e ? e.index : start + 40000)
}
const PROSE = (s) => {
  s = s.trim()
  if (s.split(/\s+/).length < 3 || !/[a-z]{2,}\s+[a-z]{2,}/i.test(s)) return false
  return !/gradient|rgba?\(|cubic-bezier|translate|\d(px|rem|vw|vh)\b|solid #|#[0-9a-f]{3,6}\b|var\(--|^https?:|^\/|\.(jpg|png|webp|svg)\b|className|⇒|\$\{|^[a-zA-Z-]+:\s*['`]|\w+\(\)|→$|^\d+(\.\d+)?\s/i.test(s)
}
function jsxContent(id) {
  let b = pageBlock(id); if (!b) return { html: [], faqs: [], h1: '' }
  b = b.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/=>/g, '⇒')
    .replace(/<(form|button|label|select|textarea|svg|script|style)\b[\s\S]*?<\/\1>/g, '')
    .replace(/<[A-Z]\w*[^>]*\/>/g, '')
    .replace(/<div className="eyebrow"[^>]*>[^<]*<\/div>/g, '')
    .replace(/<(h[1-4]|p|li|div|section|tr|td|th)\b/g, '\n<$1').replace(/<\/(h[1-4]|p|li|div)>/g, '</$1>\n')
  const out = []
  let pendingTag = ''
  for (const line of b.split('\n')) {
    const t = line.trim(); if (!t) continue
    if (/^\/\/|^'[\w@-]+'\s*:|^(if|return|const|let|var)\b|^[a-zA-Z]+\s*:\s*(\{|[\w.]+,?$)/.test(t)) continue
    // JS data rows: ['Q?','A'], {h:'..', p:'..'}, bare 'string' list items
    if (/^['`]/.test(t) || (/^[[{]\s*['`a-zA-Z_]/.test(t) && /['`]/.test(t) && !t.startsWith('{['))) {
      const lits = [...t.matchAll(/'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)]
        .map(m => decode((m[1] ?? m[2]).replace(/\$\{[^}]*\}/g, ''))).filter(PROSE)
      if (/^['`]/.test(t)) { lits.forEach(s => out.push(['li', s])); continue }
      lits.forEach((s, i) => out.push([lits.length > 1 && i === 0 && (s.endsWith('?') || s.split(' ').length < 12) ? 'h3' : 'p', s]))
      continue
    }
    const tag = (t.match(/^<(h[1-4]|li|p)\b/) || [])[1]
    if (tag) pendingTag = tag
    const x = line.replace(/\{\s*[\w.?[\]'"]+\s*\}/g, '').replace(/\s[a-zA-Z-]+=\{\{[^{}]*\}\}/g, '').replace(/\s[a-zA-Z-]+=(\{[^{}]*\}|"[^"]*"|'[^']*')/g, '')
    const texts = []
    for (const m of (' ' + x + ' ').matchAll(/(?:^|>)([^<>{}]*)(?=<|$)/g)) {
      const s = decode(m[1]).trim(); if (s && !/[;=]|⇒|^\)|^\(|&&|\|\||^\}|^\{/.test(s)) texts.push(s)
    }
    const s = decode(texts.join(' ').replace(/\s+/g, ' ').trim()).replace(/\s+([.,;:!?])/g, '$1')
    // A line that only closes a heading ("</h2>") still ends it, or the
    // style-object lines that follow would be read as heading text.
    // Style-object lines ("padding:'36px 40px',") are never text.
    if (!s || /[→←]$/.test(s) || /^[a-z][a-zA-Z]*\s*:.*,$/.test(s) || !PROSE(s) && !/^h[1-4]$/.test(pendingTag || tag)) {
      if (/<\/(h[1-4]|p|li)>/.test(t)) pendingTag = ''
      continue
    }
    const use = tag || (/<\/(h[1-4])>/.exec(t) || [])[1] || pendingTag
    if (/^h[1-4]$/.test(use) && s.split(' ').length <= 24) out.push([use === 'h4' ? 'h3' : use, s])
    else if (s.split(' ').length >= 4) out.push([use === 'li' ? 'li' : 'p', s])
    if (/<\/(h[1-4]|p|li)>/.test(t)) pendingTag = ''
  }
  // Drop exact repeats, build HTML, pull out Q&A pairs for FAQPage.
  const seen = new Set(); const rows = out.filter(([, s]) => !seen.has(s) && seen.add(s))
  let h1 = ''; const html = []; const fq = []
  for (let i = 0; i < rows.length; i++) {
    const [tag, s] = rows[i]
    if (tag === 'h1' && !h1) { h1 = s; continue }
    if (tag === 'li') { const items = [s]; while (rows[i + 1]?.[0] === 'li') items.push(rows[++i][1]); html.push(`<ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`); continue }
    if ((tag === 'h3' || tag === 'h2') && s.endsWith('?') && rows[i + 1]?.[0] === 'p') fq.push({ q: s, a: rows[i + 1][1] })
    html.push(`<${tag === 'h1' ? 'h2' : tag}>${esc(s)}</${tag === 'h1' ? 'h2' : tag}>`)
  }
  return { html, faqs: fq, h1 }
}

// ── Countries: every *_COUNTRY / *_CITIES data file ──
// New *Cities.js files (e.g. nigeriaCities.js) are picked up automatically.
const CITY_FILES = []
for (const f of readdirSync(DATA).filter(f => f.endsWith('Cities.js')).sort()) {
  const m = await import(pathToFileURL(join(DATA, f)).href)
  const country = Object.entries(m).find(([k]) => k.endsWith('_COUNTRY'))?.[1]
  const cities = Object.entries(m).find(([k, v]) => k.endsWith('_CITIES') && Array.isArray(v))?.[1] || []
  if (country && country.hub) CITY_FILES.push({ file: f, country, cities })
}
const hubName = (c) => c.name || c.longName || c.country
const MAIN_LINKS = [
  { href: '/about', label: 'About Smartious' }, { href: '/curricula', label: 'Curricula' }, { href: '/programs', label: 'Programmes' },
  { href: '/homeschool', label: 'Homeschooling' }, { href: '/tuition', label: 'Private tuition' }, { href: '/pricing', label: 'Fees' },
  { href: '/teachers', label: 'Our team' }, { href: '/faq', label: 'FAQ' }, { href: '/blog', label: 'Guides and articles' },
  { href: '/contact', label: 'Contact' }, { href: '/virtual-lab', label: 'Virtual Lab' }, { href: '/assessment', label: 'Book an assessment' },
]
const SERVICE_LINKS = SERVICES.map(sv => ({ href: '/services/' + sv.slug, label: sv.h }))
const CURRICULA_LINKS = CURRICULA.map(c => ({ href: '/curricula/' + c.slug, label: c.h, note: c.badge }))
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
const CONTACT = {
  admissions: '+254 745 021 212', academic: '+254 182 071 920', email: 'hello@smartioushomeschool.com',
  address: 'Diamond Plaza I Parklands Annex, 3rd Floor, Nairobi, Kenya',
  centre: 'Karen West, Mokoyeti Road, past Galleria Mall, Nairobi, Kenya',
}
const contactBlock = () => h2('Contact Smartious') +
  `<address><p>${esc(SITE)}<br/>Head office: ${esc(CONTACT.address)}<br/>Second centre: ${esc(CONTACT.centre)}</p>` +
  `<p>Admissions: <a href="tel:+254745021212">${CONTACT.admissions}</a> (call or WhatsApp)<br/>` +
  `Academic office: <a href="tel:+254182071920">${CONTACT.academic}</a><br/>` +
  `Email: <a href="mailto:${CONTACT.email}">${CONTACT.email}</a></p></address>` +
  `<p>Follow Smartious: ${SOCIAL_LINKS.map(s => `<a href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="Smartious on ${s.name}">${s.name}</a>`).join(' · ')}</p>`

// ── Page registry ────────────────────────────────────────────
// { path, title, desc, h1, body[], related[], faqs[], ld[], crumbs[[name,path]],
//   noindex, lang, locale, alternates[], kind, file }
const pages = []
const byPath = new Map()
function add(pg) {
  pg.path = href(pg.path)
  if (byPath.has(pg.path)) return byPath.get(pg.path)
  pg.body = (pg.body || []).filter(Boolean); pg.related = (pg.related || []).filter(Boolean)
  pages.push(pg); byPath.set(pg.path, pg); return pg
}
const hubLinks = () => [...CITY_FILES.map(({ country: c }) => ({ href: c.hub, label: 'Online school in ' + hubName(c) })),
  ...COUNTRY_DETAILS.filter(c => !['uk', 'dubai'].includes(c.slug) && !CITY_FILES.some(x => x.country.hub === '/online-school/' + c.slug))
    .map(c => ({ href: '/online-school/' + c.slug, label: 'Online school in ' + c.country }))]
  .filter((l, i, a) => a.findIndex(x => x.href === l.href) === i)

// The guides written for a hub's country (src/data/geoGuides.js), as a
// related-links block; empty when the country has none.
const guideLinks = (hub, place, heading) => {
  const g = guidesFor(String(hub || '').split('/').pop(), place)
  return g.length ? [h2(heading), links(g.map(x => ({ href: '/blog/' + x.slug, label: x.title })))] : []
}

// Home
{
  const m = PAGE_META.home
  add({ path: '/', file: 'home.html', title: m.title, desc: m.desc, h1: 'Online School & Homeschool for IGCSE, A-Level, IB, American & CBC Students', body: [
    p(m.desc),
    h2('Online school in the Gulf, Nigeria and Kenya'),
    links(PRIORITY_HUB_LINKS.map(([href, label]) => ({ href, label: 'Online school and homeschool in ' + label }))),
    h2('Online school and homeschool by city'),
    links(PRIORITY_CITY_LINKS.map(([href, label]) => ({ href, label: 'Online school in ' + label }))),
    h2('Programmes and services'), links([...SERVICE_LINKS, ...MAIN_LINKS.slice(0, 6)]),
    h2('Curricula'), links(CURRICULA_LINKS),
    h2('Online school by country'), links(hubLinks()),
    h2('Latest guides'), links(Object.entries(FULL_ARTICLES).slice(-24).reverse().map(([slug, a]) => ({ href: '/blog/' + slug, label: a.t }))),
  ], crumbs: [], src: ['src/pages/LandingPage.jsx', 'src/data/priorityLinks.js'] })
}

// Main pages with their own titles; body = the page's own text + data.
const MAIN_IDS = ['about', 'curricula', 'services', 'pricing', 'programs', 'faq', 'teachers', 'contact', 'homeschool', 'tuition', 'tuition-nairobi',
  'languages', 'test-prep', 'study-abroad', 'iufp', 'pre-university', 'calendar', 'events', 'gallery', 'activities', 'assessment']
for (const id of MAIN_IDS) {
  const m = metaFor(id); if (!m) continue
  const x = id === 'teachers' ? { html: [], faqs: [], h1: '' } : jsxContent(id)
  const body = [p(m.desc)]
  // The contact page's details card is replaced by the canonical NAP block.
  if (id === 'contact') body.push(contactBlock(), ...x.html.filter(t => !/@|Diamond Plaza|Mokoyeti|Avenue|Accounts, support|Follow us/.test(t)))
  else body.push(...x.html)
  if (id === 'teachers') body.push(p('Smartious teachers are qualified subject specialists who teach live, small-group and one-to-one lessons in Cambridge, Pearson Edexcel, IB, American and Kenyan curricula. Team profiles load from our school system when the page opens.'),
    links([{ href: '/about', label: 'About Smartious and our founder' }, { href: '/curricula', label: 'Curricula we teach' }, { href: '/contact', label: 'Contact the academic office' }]))
  if (id === 'curricula' || id === 'programs' || id === 'homeschool') body.push(h2('Curricula'), links(CURRICULA_LINKS))
  if (id === 'services') body.push(...SERVICES.map(sv => h2(sv.h) + p(sv.detail?.summary || sv.desc) + bullets(sv.tags) + links([{ href: '/services/' + sv.slug, label: 'More about ' + sv.h }])),
    h2('Fees'), p(FEE_SCHOOL + '. One-to-one tuition: ' + FEE_TUITION + '.'))
  if (id === 'programs' || id === 'homeschool' || id === 'tuition') body.push(h2('Services'), links(SERVICE_LINKS))
  if (id === 'programs') body.push(h2('University pathways'), links([{ href: '/iufp', label: 'International University Foundation Programme (IUFP)' }, { href: '/study-abroad', label: 'Study abroad support' }, { href: '/pre-university', label: 'Pre-university programme' }, { href: '/test-prep', label: 'Test preparation' }, { href: '/languages', label: 'Languages' }]))
  if (id === 'tuition' || id === 'tuition-nairobi') body.push(h2('Tuition by area in Nairobi'), links(NAIROBI_AREAS.map(a => ({ href: '/tuition/' + a.slug, label: 'Tutors in ' + a.name }))))
  if (id === 'tuition') body.push(h2('Tuition in the UAE and the UK'), links([{ href: '/tuition-uae', label: 'Online tutors in Dubai and the UAE' }, { href: '/tuition-uk', label: 'Tutors in the UK' }]))
  if (id === 'test-prep') body.push(h2('Tests we prepare for'), links(TEST_PREP.map(t => ({ href: '/test-prep/' + t.slug, label: t.code + ' preparation', note: t.fullName }))))
  if (id === 'languages') body.push(h2('Languages'), links(LANGUAGES.map(l => ({ href: '/languages/' + l.slug, label: 'Learn ' + l.name }))))
  if (id === 'study-abroad') body.push(h2('Destinations'), links(STUDY_ABROAD.map(d => ({ href: '/study-abroad/' + d.slug, label: 'Study in ' + (d.fullName || d.name) }))))
  if (id === 'about' || id === 'contact' || id === 'pricing') body.push(id === 'contact' ? '' : contactBlock())
  const related = (id === 'pricing' || id === 'about' || id === 'curricula' || id === 'homeschool') ? [h2('Online school by country'), links(hubLinks())] : []
  const kind = /tuition/.test(id) ? 'tuition' : 'school'
  const ld = []
  if (id === 'pricing') ld.push(serviceLd({ name: 'Online school and homeschool', desc: FEE_SCHOOL, path: '/pricing' }), serviceLd({ name: 'Private tuition', desc: FEE_TUITION + ' at every level', path: '/pricing', kind: 'tuition' }))
  if (id === 'tuition' || id === 'tuition-nairobi') ld.push(serviceLd({ name: x.h1 || m.title, desc: m.desc, path: '/' + id, kind }))
  add({ path: '/' + id, title: m.title, desc: m.desc, h1: x.h1 || m.title.split(/ [|—–] /)[0], body, related, faqs: x.faqs, ld })
}
// Blog index: every guide, as real links
add({ path: '/blog', title: (PAGE_META.blog || {}).title || 'Guides | ' + SITE, desc: (PAGE_META.blog || {}).desc || 'Guides for families.', h1: 'Guides and articles', body: [
  links(Object.entries(FULL_ARTICLES).filter(([, a]) => a && a.t).map(([slug, a]) => ({ href: '/blog/' + slug, label: a.t }))),
] })
// Policies, in full
for (const [id, name] of [['privacy', 'PRIVACY_POLICY'], ['terms', 'TERMS_OF_SERVICE'], ['cookies', 'COOKIE_POLICY'], ['gdpr', 'GDPR_COMPLIANCE'],
                          ['child-protection', 'CHILD_PROTECTION_POLICY'], ['academic-integrity', 'ACADEMIC_INTEGRITY_POLICY'],
                          ['ai-policy', 'AI_USE_POLICY'], ['inclusion-policy', 'INCLUSION_POLICY'], ['language-policy', 'LANGUAGE_POLICY']]) {
  const m = metaFor(id); if (!m) continue
  add({ path: '/' + id, title: m.title, desc: m.desc, h1: m.title.split(' | ')[0], body: policy(name).map(x => h2(x.h) + p(x.p)) })
}
// Services
for (const sv of SERVICES) {
  const d = sv.detail || {}
  add({ path: '/services/' + sv.slug, title: sv.seoTitle || sv.h + ' — ' + SITE, desc: sv.seoDesc || sv.desc, h1: sv.h, body: [
    p(d.tagline), p(sv.desc), p(d.summary), p(d.overview), bullets(sv.tags),
    (d.photos || []).map(ph => `<figure><img src="${esc(ph.src)}" alt="${esc(ph.alt)}" width="${ph.w}" height="${ph.h}" loading="lazy"><figcaption>${esc(ph.caption)}</figcaption></figure>`).join(''),
    ...(d.sections || []).map(s => h2(s.h) + (Array.isArray(s.p) ? s.p.map(p).join('') : p(s.p)) + bullets(s.items)),
    d.whySmartious ? h2('Why Smartious') + p(d.whySmartious) : '',
    h2('Fees'), p(/tuition|tutor/i.test(sv.slug + sv.h) ? 'One-to-one tuition: ' + FEE_TUITION + ' at every level.' : FEE_SCHOOL + '. One-to-one tuition: ' + FEE_TUITION + '.'),
  ], related: [h2('Other services'), links(SERVICE_LINKS.filter(l => l.href !== '/services/' + sv.slug))],
  crumbs: [['Services', '/services'], [sv.h, '/services/' + sv.slug]], src: ['src/data/services.js'],
  ld: [{ ...serviceLd({ name: sv.h, desc: sv.seoDesc || sv.desc, path: '/services/' + sv.slug, kind: /tuition|tutor/i.test(sv.slug) ? 'tuition' : 'school' }),
    ...(d.photos?.length ? { image: d.photos.map(ph => ORIGIN + ph.src) } : {}) }] })
}
// Curricula
for (const c of CURRICULA) {
  const d = c.detail || {}
  const path = '/curricula/' + c.slug
  const desc = d.overview ? d.overview.slice(0, 158) : c.desc.slice(0, 158)
  add({ path, title: c.h + (/Curriculum$/.test(c.h) ? '' : ' Curriculum') + ' | Homeschooling & Online — ' + SITE, desc, h1: c.h + (d.tagline ? ': ' + d.tagline : ''), body: [
    p(c.badge + (d.ageRange ? ' · ' + d.ageRange : '')), p(c.desc), p(d.overview), bullets(c.meta), c.tags?.length ? h2('Subjects') + bullets(c.tags) : '',
    ...(d.sections || []).map(s => h2(s.h) + (Array.isArray(s.p) ? s.p.map(p).join('') : p(s.p)) + bullets(s.items)),
    d.whyChoose ? h2('Why choose ' + c.h) + p(d.whyChoose) : '',
    h2('Fees'), p(FEE_SCHOOL + '. One-to-one tuition: ' + FEE_TUITION + '.'),
  ], related: [h2('Other curricula'), links(CURRICULA_LINKS.filter(l => l.href !== path))],
  crumbs: [['Curricula', '/curricula'], [c.h, path]], src: ['src/data/curricula.js'],
  ld: [{ '@context': 'https://schema.org', '@type': 'Course', name: c.h + (d.tagline ? ' — ' + d.tagline : ''), description: clip(d.overview || c.desc, 300),
    url: ORIGIN + path, provider: ORG, ...(c.badge ? { educationalCredentialAwarded: c.badge } : {}),
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'Live classes on a weekly timetable' },
    offers: { ...offer('school'), category: 'Paid' } }] })
}
// Test prep, languages, study abroad
for (const t of TEST_PREP) {
  const path = '/test-prep/' + t.slug
  add({ path, title: t.seoTitle || t.code + ' Preparation | Smartious', desc: t.seoDesc || clip(t.intro), h1: t.code + ' preparation: ' + t.fullName, body: [
    p(t.heroTagline), p(t.intro),
    bullets([['Programme', [t.sessions && t.sessions + ' sessions', t.sessionLength, t.duration].filter(Boolean).join(' · ')], ['Fee', [t.fee, t.feeUsd].filter(Boolean).join(' / ')]].filter(r => r[1])),
    t.whoFor?.length ? h2('Who it is for') + bullets(t.whoFor) : '',
    ...(t.sections || []).map(s => h3(s.h) + p(s.p)),
    t.whatsIncluded?.length ? h2("What's included") + bullets(t.whatsIncluded) : '',
    t.bandTargets?.length ? h2('Score targets') + bullets(t.bandTargets) : '',
    t.keyFacts?.length ? h2('Key facts') + bullets(t.keyFacts) : '',
  ], faqs: t.faqs, related: [h2('Other tests'), links(TEST_PREP.filter(x => x !== t).map(x => ({ href: '/test-prep/' + x.slug, label: x.code + ' preparation' })))],
  crumbs: [['Test preparation', '/test-prep'], [t.code, path]], src: ['src/data/testPrep.js'] })
}
for (const l of LANGUAGES) {
  const path = '/languages/' + l.slug
  const pr = l.pricing || {}
  add({ path, title: l.seoTitle || 'Learn ' + l.name + ' | Smartious', desc: l.seoDesc || clip(l.intro), h1: 'Learn ' + l.name + (l.nativeName ? ' (' + l.nativeName + ')' : ''), body: [
    p(l.heroTagline), p(l.intro), bullets([['Speakers', l.speakers], ['Language family', l.family], ['Difficulty', l.difficulty]].filter(r => r[1])),
    l.whyLearn?.length ? h2('Why learn ' + l.name) + l.whyLearn.map(x => h3(x.h) + p(x.p)).join('') : '',
    l.whoFor?.length ? h2('Who it is for') + bullets(l.whoFor) : '',
    l.cefrLevels?.length ? h2('Levels') + bullets(l.cefrLevels) : '',
    l.examPrep?.length ? h2('Exam preparation') + bullets(l.examPrep) : '',
    pr.hourly ? h2('Fees') + (typeof pr.hourly === 'string' ? p(pr.hourly) : Array.isArray(pr.hourly) ? bullets(pr.hourly.map(r => [r.level, [r.rate, r.sessionLength && 'sessions of ' + r.sessionLength].filter(Boolean).join(', ')])) : p(itemText(pr.hourly))) + bullets(pr.packages || []) : '',
  ], faqs: l.faqs, related: [h2('Other languages'), links(LANGUAGES.filter(x => x !== l).map(x => ({ href: '/languages/' + x.slug, label: 'Learn ' + x.name })))],
  crumbs: [['Languages', '/languages'], [l.name, path]], src: ['src/data/languages.js'] })
}
for (const d of STUDY_ABROAD) {
  const path = '/study-abroad/' + d.slug
  const qf = d.quickFacts || {}
  add({ path, title: d.seoTitle || 'Study in ' + d.name + ' | Smartious', desc: d.seoDesc || clip(d.intro), h1: d.primaryKeyword || 'Study in ' + (d.fullName || d.name), body: [
    p(d.heroTagline), p(d.intro), bullets(Object.entries(qf).map(([k, v]) => [k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()), typeof v === 'string' ? v : itemText(v)])),
    d.whyStudy?.length ? h2('Why study in ' + (d.fullName || d.name)) + d.whyStudy.map(x => h3(x.h) + p(x.p)).join('') : '',
    d.topUniversities?.length ? h2('Top universities') + bullets(d.topUniversities.map(u => [u.name, [u.city, u.rank, u.specialty].filter(Boolean).join(' · ')])) : '',
    ...(d.requirements || []).map(r => h3(r.h) + bullets(r.items)),
    d.scholarships?.length ? h2('Scholarships') + bullets(d.scholarships.map(s => [s.name, [s.who, s.value].filter(Boolean).join(' · ')])) : '',
    d.timeline?.length ? h2('Application timeline') + bullets(d.timeline.map(x => [x.month, x.task])) : '',
    d.postStudy ? h2('After graduation') + p(d.postStudy) : '',
    d.smartiousHelp?.length ? h2('How Smartious helps') + bullets(d.smartiousHelp) : '',
  ], faqs: d.faqs, related: [h2('Other destinations'), links(STUDY_ABROAD.filter(x => x !== d).map(x => ({ href: '/study-abroad/' + x.slug, label: 'Study in ' + (x.fullName || x.name) })))],
  crumbs: [['Study abroad', '/study-abroad'], [d.name, path]], src: ['src/data/studyAbroad.js'] })
}
// Comparisons
for (const c of COMPARES) {
  if (!c || !c.slug || !c.seoTitle) continue
  const path = '/compare/' + c.slug
  add({ path, title: c.seoTitle, desc: c.seoDesc || clip(c.intro), h1: 'Smartious vs ' + (c.competitor || c.slug), body: [
    p(c.intro), p(c.competitorSummary), p(c.keyDifference),
    c.table?.length ? h2('Side by side') + `<table><thead><tr><th>Feature</th><th>${esc(c.competitor)}</th><th>Smartious</th></tr></thead><tbody>${c.table.map(r => `<tr><td>${esc(r.feature)}</td><td>${esc(Object.entries(r).find(([k]) => k !== 'feature' && k !== 'smartious')?.[1])}</td><td>${esc(r.smartious)}</td></tr>`).join('')}</tbody></table>` : '',
    ...Object.entries(c).filter(([k, v]) => Array.isArray(v) && k !== 'table' && k !== 'faqs').map(([, v]) => bullets(v)),
  ], faqs: c.faqs, crumbs: [['Compare', path], ['Smartious vs ' + (c.competitor || c.slug), path]].slice(1) })
}
// Nairobi tuition areas
for (const a of NAIROBI_AREAS) {
  const path = '/tuition/' + a.slug
  add({ path, title: nairobiAreaTitle(a), desc: a.seoDesc || clip(a.intro), h1: 'Tuition in ' + a.name + ', Nairobi', body: [
    p(a.intro), p(a.introExtended), p(a.parentProfile), p(a.pricingNote), a.commonSubjects?.length ? h2('Subjects') + bullets(a.commonSubjects) : '',
  ], faqs: a.localFaqs, related: [
    h2('Nearby areas'), links(NAIROBI_AREAS.filter(x => x !== a).slice(0, 12).map(x => ({ href: '/tuition/' + x.slug, label: 'Tutors in ' + x.name }))),
    h2('Online school in Kenya'), links([{ href: '/online-school/kenya', label: 'Online school and homeschool in Kenya' }, { href: '/tuition-nairobi', label: 'All Nairobi tuition' }]),
  ], crumbs: [['Tuition in Nairobi', '/tuition-nairobi'], [a.name, path]], kind: 'tuition', src: ['src/data/nairobiAreas.js'],
  ld: [serviceLd({ name: 'Tuition in ' + a.name + ', Nairobi', desc: a.seoDesc || a.intro, path, area: a.name + ', Nairobi, Kenya', kind: 'tuition' })] })
}
// UK tuition
{
  const m = metaFor('tuition-uk') || { title: 'Tutors in the UK | GCSE, A-Level & 11+ | Smartious', desc: 'Live online GCSE, IGCSE, A-Level, IB and 11+ tuition for UK families.' }
  const x = jsxContent('tuition-uk')
  const cities = [...new Set(UK_AREAS.map(a => a.city))]
  add({ path: '/tuition-uk', title: m.title, desc: m.desc, h1: x.h1 || 'Tutors in the UK', body: [p(m.desc), ...x.html,
    ...cities.map(city => h2('Tutors in ' + city) + links(UK_AREAS.filter(a => a.city === city).map(a => ({ href: '/tuition-uk/' + a.slug, label: 'Tutors in ' + a.name + ', ' + a.city })))),
  ], faqs: x.faqs, related: [h2('Online school in the UK'), links([{ href: '/online-school/united-kingdom', label: 'Online school and homeschool in the UK' }])],
  ld: [serviceLd({ name: 'Private tuition in the UK', desc: m.desc, path: '/tuition-uk', area: 'United Kingdom', kind: 'tuition' })] })
  for (const a of UK_AREAS) {
    const path = '/tuition-uk/' + a.slug
    add({ path, title: a.seoTitle || 'Online Tuition in ' + a.name + ', ' + a.city + ' | GCSE, A-Level & 11+ Tutors | Smartious',
      desc: a.seoDesc || (PAGE_META['uk-area'] || {}).desc || clip(a.intro), h1: 'Tuition in ' + a.name + ', ' + a.city, body: [
        p(a.region), p(a.intro), p(a.introExtended), p(a.parentProfile), p(a.commuteNote), p(a.pricingNote),
        a.commonSubjects?.length ? h2('Subjects') + bullets(a.commonSubjects) : '', a.localSchools?.length ? h2('Local schools we prepare students for') + bullets(a.localSchools) : '',
      ], faqs: a.localFaqs, related: [h2('Other areas in ' + a.city), links(UK_AREAS.filter(x => x !== a && x.city === a.city).map(x => ({ href: '/tuition-uk/' + x.slug, label: 'Tutors in ' + x.name }))),
        links([{ href: '/tuition-uk', label: 'All UK tuition' }])],
      crumbs: [['Tuition in the UK', '/tuition-uk'], [a.name, path]], src: ['src/data/ukAreas.js'],
      ld: [serviceLd({ name: 'Tuition in ' + a.name + ', ' + a.city, desc: a.seoDesc || a.intro, path, area: a.name + ', ' + a.city + ', United Kingdom', kind: 'tuition' })] })
  }
}
// Virtual school and funding pages (hand-written JSX pages)
const STATIC_META = {
  'ab-funding': { path: '/alberta-home-ed-funding', title: 'Alberta Home Education Funding | Use Your $850 CAD on Smartious', desc: 'How Alberta home education funding works and how families use their annual allocation on live online Cambridge IGCSE and A-Level classes with Smartious.' },
  'bc-funding': { path: '/bc-distributed-learning-funding', title: 'BC Distributed Learning Funding | Online Homeschool | Smartious', desc: 'How British Columbia distributed learning and home education funding works, and how BC families combine it with live online Cambridge IGCSE and A-Level classes.' },
  'sk-funding': { path: '/saskatchewan-homeschool-funding', title: 'Saskatchewan Homeschool Funding | Online Homeschool | Smartious', desc: 'How Saskatchewan home-based education funding works, and how families use it alongside live online Cambridge IGCSE and A-Level classes with Smartious.' },
  'virtual-school-kenya': { path: '/virtual-school-kenya' },
  'virtual-school-ukraine': { path: '/virtual-school-ukraine' },
}
for (const [id, s] of Object.entries(STATIC_META)) {
  const m = metaFor(id) || s
  const x = jsxContent(id)
  const isCa = id.endsWith('-funding')
  add({ path: s.path, title: m.title, desc: m.desc, h1: x.h1 || m.title.split(/ [|—–] /)[0], body: [p(m.desc), ...x.html], faqs: x.faqs,
    related: isCa ? [h2('Homeschooling in Canada'), links([{ href: '/online-school/canada', label: 'Online school for Canadian families' },
      ...Object.entries(STATIC_META).filter(([k]) => k.endsWith('-funding') && k !== id).map(([, v]) => ({ href: v.path, label: v.title.split(' | ')[0] }))])]
      : id === 'virtual-school-kenya' ? [h2('More for Kenyan families'), links([{ href: '/online-school/kenya', label: 'Online school and homeschool in Kenya' }, { href: '/tuition-nairobi', label: 'Tuition in Nairobi' }])]
      : [h2('More for Ukrainian families'), links([{ href: '/online-school/ukraine', label: 'Online school in Ukraine' }])],
    ld: [serviceLd({ name: x.h1 || m.title, desc: m.desc, path: s.path, area: isCa ? 'Canada' : id.includes('kenya') ? 'Kenya' : 'Ukraine' })] })
}

// Virtual Lab (src/data/virtualLab.js; the page is pages/VirtualLabPage.jsx)
{
  const practicalCount = VL_PRACTICALS.reduce((a, g) => a + g.items.length, 0)
  if (practicalCount !== EXPERIMENTS.length || VL_MODELS.length !== MODELS.length)
    console.warn(`seo-static: src/data/virtualLab.js lists ${practicalCount} practicals and ${VL_MODELS.length} models, the lab has ${EXPERIMENTS.length} and ${MODELS.length}: update the page`)
  const img = (i) => `<figure><img src="${esc(i.src)}" alt="${esc(i.alt)}" width="${i.w || 720}" height="${i.h || 576}" loading="lazy"/><figcaption>${esc(i.title || i.alt)}</figcaption></figure>`
  const SUBJ = { chemistry: 'Chemistry', biology: 'Biology', physics: 'Physics' }
  const url = ORIGIN + VL_PATH
  add({ path: VL_PATH, title: VL_META.title, desc: VL_META.desc, h1: VL_HERO.h1, image: VL_IMAGES.hero, ogImage: VL_META.ogImage,
    images: [VL_IMAGES.hero, VL_IMAGES.bench, VL_IMAGES.cupboard, ...VL_BONES, ...VL_MODEL_IMAGES],
    body: [
      p(VL_HERO.lead), img(VL_IMAGES.hero),
      h2('Try it now: an acid–base titration in 3D'), p('Find the concentration of an unknown acid: set up the bench, rinse and fill the burette, pipette 25.0 cm³ of acid, add the indicator, titrate to the end point and check your answer. Free, with no sign-up.'),
      h2('A real laboratory, not a slideshow'), ...VL_FEATURES.map(f => h3(f.h) + p(f.p)), img(VL_IMAGES.cupboard),
      h2('The human skeleton and bones in 3D'), ...VL_BONES.map(b => h3(b.title) + p(b.text) + img(b)),
      h2('3D models for biology and physics'), bullets(VL_MODELS.map(m => [m.title.replace(' (real anatomical model)', ''), m.topic])),
      h2(VL_INTERNATIONAL.h2), p(VL_INTERNATIONAL.intro), ...VL_INTERNATIONAL.items.map(it => h3(it.h + ' (' + it.sub + ')') + p(it.exam + '.') + p(it.p)), p(VL_INTERNATIONAL.note),
      h2(VL_KENYA.h2), p(VL_KENYA.intro), ...VL_KENYA.items.map(([h, t]) => h3(h) + p(t)), p(VL_KENYA.note),
      h2('All ' + practicalCount + ' virtual practicals'),
      ...['chemistry', 'biology', 'physics'].map(sub => h3(SUBJ[sub]) + VL_PRACTICALS.filter(g => g.subject === sub).map(g => p(g.group) + bullets(g.items)).join('')),
      h2('Get the full Virtual Lab with Smartious'), links([{ href: '/assessment', label: 'Book an assessment' }, { href: '/curricula', label: 'Curricula we teach' }, { href: '/homeschool', label: 'Online homeschool' }]),
      p(VL_CREDITS),
    ],
    faqs: VL_FAQS, faqsTitle: 'Virtual lab: frequently asked questions',
    related: [h2('Programmes with the Virtual Lab'), links([{ href: '/curricula/igcse', label: 'Cambridge IGCSE' }, { href: '/curricula/a-level', label: 'Cambridge A-Level' }, { href: '/online-school/kenya', label: 'Online school in Kenya' }, { href: '/homeschool', label: 'Online homeschool' }, { href: '/tuition', label: 'Private tuition' }].filter(l => !/^\/curricula\//.test(l.href) || CURRICULA.some(c => '/curricula/' + c.slug === l.href)))],
    crumbs: [['Virtual Lab', VL_PATH]],
    src: ['src/data/virtualLab.js', 'src/pages/VirtualLabPage.jsx'],
    ld: [
      { '@context': 'https://schema.org', '@type': 'WebApplication', '@id': url + '#app', name: 'Smartious Virtual Lab', url, description: VL_META.desc,
        applicationCategory: 'EducationalApplication', operatingSystem: 'Any (web browser)', browserRequirements: 'Requires a modern browser; 3D view uses WebGL',
        image: ORIGIN + VL_IMAGES.hero.src, screenshot: [VL_IMAGES.hero, VL_IMAGES.bench, VL_IMAGES.cupboard].map(i => ORIGIN + i.src),
        isAccessibleForFree: true, inLanguage: 'en', provider: { '@id': ORG_ID }, publisher: { '@id': ORG_ID },
        featureList: VL_FEATURES.map(f => f.h),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'The titration practical and the 3D skeleton on this page are free; the full lab is included in Smartious programmes.' } },
      { '@context': 'https://schema.org', '@type': 'LearningResource', '@id': url + '#titration', name: 'Acid–base titration: virtual practical in 3D', url: url + '#try',
        description: 'Find the concentration of an unknown acid by titration with 0.100 mol dm⁻³ sodium hydroxide, step by step on a 3D bench.',
        learningResourceType: ['Simulation', 'Virtual laboratory'], educationalLevel: ['Secondary school', 'IGCSE', 'A-Level', 'IB Diploma', 'KCSE'],
        teaches: ['Acid–base titration', 'Volumetric analysis', 'Reading a burette', 'Concordant titres', 'Mole calculations'],
        about: { '@type': 'Thing', name: 'Chemistry practical' }, isAccessibleForFree: true, inLanguage: 'en', image: ORIGIN + VL_IMAGES.hero.src, provider: { '@id': ORG_ID } },
      { '@context': 'https://schema.org', '@type': 'LearningResource', '@id': url + '#skeleton', name: 'The human skeleton in 3D: labelled bones', url: url + '#bones',
        description: VL_BONES[0].text, learningResourceType: ['3D model', 'Interactive resource'], educationalLevel: ['Secondary school', 'IGCSE', 'KCSE', 'CBE'],
        teaches: ['Bones of the human skeleton', 'Joints', 'Support and movement'], isAccessibleForFree: true, inLanguage: 'en', image: ORIGIN + VL_BONES[0].src, provider: { '@id': ORG_ID } },
    ] })
}

// ── Country hubs and city pages ──
const CITY_PAGES = []   // { slug, pg, countrySlug, cityName, countryName }
const isNoindexCandidateFile = (f) => !['usCities.js', 'caCities.js'].includes(f)
// countries.js pages (/online-school/<slug> → country-detail, or the USA /
// Canada families pages), unless a *Cities.js hub renders that route.
const US_STATE_LINKS = Object.entries(US_STATES).map(([slug, s]) => ({ href: '/homeschool-' + slug, label: 'Online homeschool in ' + s.name }))
const CA_PROV_LINKS = Object.entries(CA_PROVINCES).map(([slug, s]) => ({ href: '/homeschool-' + slug, label: 'Online homeschool in ' + s.name }))
for (const c of COUNTRY_DETAILS) {
  if (c.slug === 'uk' || c.slug === 'dubai') continue     // /online-school/uk 301s; /online-school/dubai duplicates /homeschool-dubai-ae
  if (c.slug === 'uae') continue                           // richer UAE page below
  const path = '/online-school/' + c.slug
  const cityHub = CITY_FILES.find(x => x.country.hub === path)
  if (cityHub && ONLINE_BRANCHES.has(c.slug)) continue     // the CountryHub page renders this route
  const branch = c.slug === 'usa' ? metaFor('us-families') : c.slug === 'canada' ? metaFor('ca-families') : null
  const extra = c.slug === 'usa' ? [h2('Homeschooling by state'), links(US_STATE_LINKS), h2('Homeschooling by city'), links(Object.entries(US_CITIES).map(([s, x]) => ({ href: '/homeschool-' + s, label: 'Online homeschool in ' + x.name })))]
    : c.slug === 'canada' ? [h2('Homeschooling by province'), links(CA_PROV_LINKS), h2('Provincial funding'), links(Object.values(STATIC_META).filter(v => v.title).map(v => ({ href: v.path, label: v.title.split(' | ')[0] }))),
      h2('Homeschooling by city'), links(Object.entries(CA_CITIES).map(([s, x]) => ({ href: '/homeschool-' + s, label: 'Online homeschool in ' + x.name })))]
    : c.slug === 'kenya' ? [h2('More for Kenyan families'), links([{ href: '/virtual-school-kenya', label: 'Virtual school in Kenya' }, { href: '/tuition-nairobi', label: 'Tuition in Nairobi' }])]
    : []
  const sections = Object.values(c).filter(v => v && typeof v === 'object' && !Array.isArray(v) && v.heading && !v.reviews).map(section)
  // The USA and Canada pages' H1 (LandingPage.jsx) names the search, not the slogan.
  const h1 = c.slug === 'usa' ? 'K-12 Online School & Homeschool in the USA' : c.slug === 'canada' ? 'Online OSSD School & Homeschool in Canada' : c.h
  add({ path, title: (branch && branch.title) || c.seoTitle, desc: (branch && branch.desc) || c.seoDesc, h1, body: [
    p(c.tagline), c.localFacts?.length ? bullets(c.localFacts) : '', p(c.pains),
    c.curricula?.length ? h2('Curricula') + bullets(c.curricula) : '',
    c.regulation ? h2('Is homeschooling legal in ' + c.country + '?') + p(c.regulation) : '',
    c.examCentres ? h2('Where students sit exams') + p(c.examCentres) : '',
    ...sections,
    c.cities?.length ? h2('Cities we serve in ' + c.country) + bullets(c.cities) : '',
    ...(cityHub ? [h2('Online school by city'), links(cityHub.cities.map(x => ({ href: '/homeschool-' + x.slug, label: 'Online school in ' + x.name })))] : []),
    ...extra,
  ], faqs: c.faqs, related: guideLinks(path, '', 'Guides for families in this country'), crumbs: [[c.country, path]], src: ['src/data/countries.js', ...(cityHub ? ['src/data/' + cityHub.file] : [])],
  ld: [serviceLd({ name: c.h, desc: c.seoDesc, path, area: c.country })] })
}
for (const { file, country: c, cities } of CITY_FILES) {
  if (c.slug === 'uae') continue
  const m = metaFor(c.hubPageId)
  const name = hubName(c)
  const cityLinks = cities.map(x => ({ href: '/homeschool-' + x.slug, label: 'Online school in ' + x.name }))
  // The country data's own seoTitle/seoDesc/h1 are the tuned values; the app uses them too.
  add({ path: c.hub, title: c.seoTitle || (m && m.title) || 'Online School in ' + name + ' | IGCSE, A-Level & IB | Smartious', desc: c.seoDesc || (m && m.desc) || c.heroSubhead,
    h1: c.h1 || 'Online School & Homeschool in ' + (c.heroH1Suffix || name), body: [
      p(c.heroSubhead), p(c.heroValueProp), c.seeAlso?.length ? links(c.seeAlso) : '',
      cityLinks.length ? h2(c.citiesSectionTitle || 'Cities') + p(c.citiesSectionBody) + links(cityLinks) : '',
      c.legalFramework?.length ? h2('Homeschool laws and regulation in ' + name) + p(c.legalFrameworkIntro) + c.legalFramework.map(x => h3(x.h) + p(x.p)).join('') : '',
      c.whySmartious?.length ? h2('Why ' + name + ' families choose Smartious') + c.whySmartious.map(x => x && x.h ? h3(x.h) + p(x.p) : p(itemText(x))).join('') : '',
      h2('Fees and admission'), p(FEE_SCHOOL + '. One-to-one tuition: ' + FEE_TUITION + '.'),
      c.slug === 'kenya' ? h2('More for Kenyan families') + links([{ href: '/virtual-school-kenya', label: 'Virtual school in Kenya' }, { href: '/tuition-nairobi', label: 'Tuition in Nairobi' }]) : '',
      c.slug === 'united-kingdom' ? h2('Tuition in the UK') + links([{ href: '/tuition-uk', label: 'Tutors in the UK' }]) : '',
      c.slug === 'ukraine' ? h2('Virtual school for Ukrainian families') + links([{ href: '/virtual-school-ukraine', label: 'Virtual school for Ukrainian families in Ukraine and abroad' }]) : '',
    ], faqs: c.faqs, related: guideLinks(c.hub, '', 'Guides for families in this country'), crumbs: [[name, c.hub]], src: ['src/data/' + file],
    ld: [serviceLd({ name: 'Online school and homeschool in ' + name, desc: (m && m.desc) || c.heroSubhead, path: c.hub, area: name })] })
  for (const x of cities) {
    const path = '/homeschool-' + x.slug
    const pg = add({ path,
      title: x.seoTitle || ((x.primaryKeyword || x.name) + ' — Online & Virtual School | Cambridge IGCSE & A-Level | Smartious'),
      desc: x.seoDesc || clip(x.intro), h1: 'Online School & Homeschool in ' + x.name, body: [
        p(x.primaryKeyword), p(x.heroTagline), p(x.intro),
        x.challenges?.length ? h2('Challenges ' + x.name + ' families face') + bullets(x.challenges) : '',
        x.whyChoose?.length ? h2('Why ' + x.name + ' families choose Smartious') + bullets(x.whyChoose) : '',
        p(x.homeschoolDetail), p(x.homeTuitionDetail), p(x.onlineLearningDetail), p(x.growingReason),
        x.familySituations?.length ? h2('Family situations we work with') + bullets(x.familySituations) : '',
        x.successScenarios?.length ? h2('How families use Smartious') + bullets(x.successScenarios) : '',
        x.nearbyAreas?.length ? h2(x.name + ' communities and nearby areas') + `<p>${x.nearbyAreas.map(esc).join(' · ')}</p>` : '',
      ], faqs: x.faqs, faqsTitle: 'Common questions from ' + x.name + ' families',
      related: [h2('More in ' + name), links([{ href: c.hub, label: 'Online school in ' + name }, ...cityLinks.filter(l => l.href !== path)]),
        ...guideLinks(c.hub, [x.name, x.nation], 'Guides for families in ' + name)],
      crumbs: [[name, c.hub], [x.name, path]], src: ['src/data/' + file],
      ld: [serviceLd({ name: x.primaryKeyword || 'Online school in ' + x.name, desc: x.seoDesc || x.intro, path, area: [x.name, x.county, name].filter(Boolean).join(', ') })] })
    if (pg.path === path && isNoindexCandidateFile(file)) CITY_PAGES.push({ slug: x.slug, pg, countrySlug: c.slug, cityName: x.name, countryName: name })
  }
}

// UAE (its own, richer pages)
add({
  path: '/online-school/uae',
  // Same title and description as the app's UAE hub (LandingPage.jsx, page 'homeschooling-uae').
  title: 'Homeschooling & Online School in Dubai and the UAE',
  desc: 'Live online classes for Dubai, Abu Dhabi and Sharjah families: IGCSE, A-Level, Edexcel, American. From USD 423/month (≈ AED 1,553). January 2027 intake.',
  h1: 'Homeschooling & Online School in Dubai and the UAE',
  body: [
    p(UAE_COUNTRY.heroSubhead), p(UAE_COUNTRY.heroValueProp),
    h2(UAE_COUNTRY.citiesSectionTitle || 'Cities we teach in'),
    links(UAE_CITIES.map(c => ({ href: '/homeschool-' + c.slug, label: 'Online school in ' + c.name, note: c.region }))),
    h2('Online tuition'), links([{ href: '/tuition-uae', label: 'Online tutors in Dubai and the UAE' }]),
    h2('Why families choose Smartious'), bullets(UAE_COUNTRY.whySmartious),
    h2('Fees and admission'), p(FEE_SCHOOL + '. One-to-one tuition: ' + FEE_TUITION + '.'),
  ],
  faqs: UAE_COUNTRY.faqs, related: guideLinks('/online-school/uae', '', 'Guides for families in this country'), crumbs: [['UAE', '/online-school/uae']], src: ['src/data/uaeCities.js', 'src/pages/LandingPage.jsx'],
  ld: [serviceLd({ name: 'Online school and homeschool in the UAE', desc: UAE_COUNTRY.heroSubhead, path: '/online-school/uae', area: 'United Arab Emirates' })],
})
for (const c of UAE_CITIES) {
  const path = '/homeschool-' + c.slug
  const pg = add({
    path, title: c.seoTitle || ('Online School & Homeschooling in ' + c.name + ' | IGCSE, A-Level, IB | Smartious'), desc: c.seoDesc,
    h1: 'Online school and homeschooling in ' + c.name,
    body: [
      p(c.heroTagline), p(c.intro),
      c.challenges?.length ? h2('Challenges ' + c.name + ' families face') + bullets(c.challenges) : '',
      h2('Why ' + c.name + ' families choose Smartious'), bullets(c.whyChoose),
      h2('Subjects'), bullets(c.subjects), p(c.onlineLearningDetail), p(c.homeschoolDetail),
      h2('Online tuition in ' + c.name),
      links(UAE_AREAS.filter(a => a.emirate === c.name).map(a => ({ href: '/tuition-uae/' + a.slug, label: 'Online tutors in ' + a.name }))),
    ],
    faqs: c.faqs, related: [h2('More in the UAE'), links([{ href: '/online-school/uae', label: 'Homeschooling and online school in Dubai and the UAE' },
      ...UAE_CITIES.filter(x => x !== c).map(x => ({ href: '/homeschool-' + x.slug, label: 'Online school in ' + x.name }))])],
    crumbs: [['UAE', '/online-school/uae'], [c.name, path]], src: ['src/data/uaeCities.js', 'src/data/uaeAreas.js'],
    ld: [serviceLd({ name: 'Online school in ' + c.name, desc: c.seoDesc, path, area: c.name + ', United Arab Emirates' })],
  })
  if (pg.path === path) CITY_PAGES.push({ slug: c.slug, pg, countrySlug: 'uae', cityName: c.name, countryName: 'UAE' })
}
add({
  path: '/tuition-uae',
  // Same title and description as the app (LandingPage.jsx, page 'tuition-uae').
  title: 'Online Tutors in Dubai & UAE | IGCSE, A-Level | Smartious',
  desc: 'Live online 1-on-1 tuition in Dubai, Abu Dhabi and Sharjah: IGCSE, A-Level, IB, Edexcel and AP with qualified tutors. From USD 15/hour (about AED 55).',
  h1: 'Online tutors in Dubai and the UAE',
  body: [
    p('Live online 1-on-1 tuition for Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and American AP, with lessons timed for the Gulf day. Smartious tuition in the UAE is online only.'),
    ...['Dubai', 'Abu Dhabi', 'Sharjah'].map(em => {
      const list = UAE_AREAS.filter(a => a.emirate === em)
      return list.length ? h2(em) + links(list.map(a => ({ href: '/tuition-uae/' + a.slug, label: 'Online tutors in ' + a.name }))) : ''
    }),
  ],
  related: [h2('Full-time online school'), links([UAE_PRODUCT_LINKS[0], UAE_PRODUCT_LINKS[2]])], src: ['src/data/uaeAreas.js', 'src/pages/LandingPage.jsx'],
  ld: [serviceLd({ name: 'Online tuition in the UAE', desc: 'Live online 1-on-1 tuition for UAE families.', path: '/tuition-uae', area: 'United Arab Emirates', kind: 'tuition' })],
})
for (const a of UAE_AREAS) {
  const path = '/tuition-uae/' + a.slug
  add({
    path, title: a.seoTitle || ('Online Tuition in ' + a.name + ', ' + a.emirate + ' | Smartious'), desc: a.seoDesc,
    h1: 'Online tuition in ' + a.name + ', ' + a.emirate,
    body: [p(a.intro), p(a.introExtended), p(a.onlineNote), p(a.pricingNote)],
    faqs: a.localFaqs, related: [
      h2('Nearby areas'), links((a.nearbyAreas || []).map(s => UAE_AREAS.find(x => x.slug === s)).filter(Boolean).map(x => ({ href: '/tuition-uae/' + x.slug, label: 'Online tutors in ' + x.name }))),
      h2('Smartious in the UAE'), links(UAE_PRODUCT_LINKS),
    ],
    crumbs: [['Tuition in the UAE', '/tuition-uae'], [a.name, path]], src: ['src/data/uaeAreas.js'],
    ld: [serviceLd({ name: 'Online tuition in ' + a.name, desc: a.seoDesc || a.intro, path, area: a.name + ', ' + a.emirate + ', United Arab Emirates', kind: 'tuition' })],
  })
}

// US states and cities, Canadian provinces and cities (/homeschool-<slug>)
function regionPage({ slug, s, country, hub, childLinks, parent, src }) {
  const path = '/homeschool-' + slug
  // USA: K-12 American curriculum; Canada: the OSSD (src/data/naFocus.js).
  const ca = country === 'Canada'
  const m = naMeta(ca ? 'ca' : 'us', { slug, name: s.name, oldTitle: s.metaTitle, oldDesc: s.metaDesc })
  return add({ path, title: m.title, desc: m.desc || clip(s.pitch),
    h1: (ca ? CA_HEADLINE : US_HEADLINE) + ' for ' + s.name + (parent ? ', ' + parent.name : '') + ' Families', body: [
      p(ca ? caLead(s.name) : usLead(s.name)), s.seeAlso?.length ? links(s.seeAlso) : '', p(s.pitch), p(s.proof), p(s.uniqueHook), p(s.metroPop),
      bullets([['Homeschool rules', [s.difficulty, s.difficultyDetail].filter(Boolean).join(' — ')], ['Paperwork', s.paperworkLevel], ['Live class times', [s.classTime, s.classTimeBenefit].filter(Boolean).join(' — ')], ['Exam centres', s.examCentre], ['Population', [s.pop, s.popLabel].filter(Boolean).join(' ')]].filter(r => r[1])),
      s.legalSummary ? h2('Homeschool law in ' + s.name) + p(s.legalSummary) : '',
      s.universities?.length || s.topUnis?.length ? h2('University pathways') + bullets(s.universities || s.topUnis) : '',
      s.neighborhoods?.length ? h2(s.name + ' neighbourhoods we serve') + `<p>${s.neighborhoods.map(esc).join(' · ')}</p>` : '',
      h2('Fees'), p(FEE_SCHOOL + '. One-to-one tuition: ' + FEE_TUITION + '.'),
      s.blogSlug && FULL_ARTICLES[s.blogSlug] ? links([{ href: '/blog/' + s.blogSlug, label: FULL_ARTICLES[s.blogSlug].t }]) : '',
    ], faqs: s.faqs, related: [childLinks?.length ? h2('Cities in ' + s.name) + links(childLinks) : '',
      h2('More in ' + country), links([...(parent ? [{ href: '/homeschool-' + parent.slug, label: 'Online homeschool in ' + parent.name }] : []), { href: hub, label: 'Online school for families in ' + country }]),
      ...guideLinks(hub, s.name, 'Guides for families in ' + country)],
    crumbs: [[country, hub], ...(parent ? [[parent.name, '/homeschool-' + parent.slug]] : []), [s.name, path]], src: [src],
    ld: [serviceLd({ name: 'Online homeschool in ' + s.name, desc: s.metaDesc || s.pitch, path, area: [s.name, parent?.name, country].filter(Boolean).join(', ') })] })
}
for (const [slug, s] of Object.entries(US_STATES))
  regionPage({ slug, s, src: 'src/data/usStates.js', country: 'the USA', hub: '/online-school/usa', childLinks: (US_CITIES_BY_STATE?.[slug] || []).filter(cs => US_CITIES[cs]).map(cs => ({ href: '/homeschool-' + cs, label: 'Online homeschool in ' + US_CITIES[cs].name })) })
for (const [slug, s] of Object.entries(US_CITIES))
  regionPage({ slug, s, src: 'src/data/usCities.js', country: 'the USA', hub: '/online-school/usa', parent: US_STATES[s.state] ? { slug: s.state, name: US_STATES[s.state].name } : null })
for (const [slug, s] of Object.entries(CA_PROVINCES))
  regionPage({ slug, s, src: 'src/data/caProvinces.js', country: 'Canada', hub: '/online-school/canada', childLinks: (CA_CITIES_BY_PROVINCE?.[slug] || []).filter(cs => CA_CITIES[cs]).map(cs => ({ href: '/homeschool-' + cs, label: 'Online homeschool in ' + CA_CITIES[cs].name })) })
for (const [slug, s] of Object.entries(CA_CITIES))
  regionPage({ slug, s, src: 'src/data/caCities.js', country: 'Canada', hub: '/online-school/canada', parent: CA_PROVINCES[s.province] ? { slug: s.province, name: CA_PROVINCES[s.province].name } : null })

// Blog posts, each linked to its country hub, the fees page and the
// January 2027 intake page.
const COUNTRY_ALIAS = { za: 'south-africa', uk: 'united-kingdom', 'bosnia-and-herzegovina': 'bosnia' }
const INTAKE = 'january-2027-intake'
const hubFor = (country) => {
  const s = COUNTRY_ALIAS[country] || country
  const pg = byPath.get('/online-school/' + s) || pages.find(x => x.path.startsWith('/online-school/') && CITY_FILES.some(f => f.country.hub === x.path && f.country.slug === s))
  return pg || null
}
let intakeMissing = !FULL_ARTICLES[INTAKE]
for (const [slug, a] of Object.entries(FULL_ARTICLES)) {
  if (!a || !a.t) continue
  const path = '/blog/' + slug
  const hub = hubFor(a.country || 'kenya')
  const money = [
    hub ? { href: hub.path, label: hub.h1 || hub.title.split(/ [|—–] /)[0] } : null,
    { href: '/pricing', label: 'Fees: ' + FEE_SCHOOL.replace(/^From/, 'from') },
    ...(() => {   // the country's own intake page when there is one, else the general one
      if (intakeMissing || slug.startsWith(INTAKE)) return []
      const own = INTAKE + '-' + (COUNTRY_ALIAS[a.country] || a.country || 'kenya')
      const s = FULL_ARTICLES[own] ? own : INTAKE
      return [{ href: '/blog/' + s, label: FULL_ARTICLES[s].t || 'January 2027 intake' }]
    })(),
  ].filter(Boolean)
  add({
    path, title: guideTitle(a.metaTitle, a.t), desc: a.metaDesc || clip(a.intro), h1: a.t,
    src: [ARTICLES_INDEX[slug]?.part ? 'src/data/' + ARTICLES_INDEX[slug].part + '.js' : 'src/data/fullArticles.js'],
    body: [
      a.author ? `<p class="ss-by">By ${esc(a.author)}${a.role ? ', ' + esc(a.role) : ''}${a.date ? ' · ' + esc(a.date) : ''}` +
        `${a.published ? ' · First published <time datetime="' + esc(a.published) + '">' + esc(fmtMonthYear(a.published)) + '</time>' : ''}` +
        `${a.updated ? ' · Updated <time datetime="' + esc(a.updated) + '">' + esc(fmtMonthYear(a.updated, true)) + '</time>' : ''}</p>` : '',
      p(a.intro),
      a.country === 'uae' ? h2('Smartious for families in Dubai and the UAE') + links(UAE_PRODUCT_LINKS) : '',
      ...(a.sections || []).map(s => h2(s.h) + (Array.isArray(s.p) ? s.p.map(p).join('') : p(s.p))),
      // Pillar link grids, as the app renders them (real links for crawlers
      // that do not run JavaScript).
      a.countryLinks?.length ? h2(a.countryLinksHeading || 'Every country we teach in this region') + p(a.countryLinksIntro) +
        links(a.countryLinks.map(cl => ({ href: '/online-school/' + cl.slug, label: cl.name, note: cl.note }))) : '',
      a.guideCountries ? (() => {
        const rows = guideCountryRows(a.countryLinks, ARTICLES_INDEX)
        return rows.length ? h2(a.guideCountriesHeading || 'Online school and virtual school guides, country by country') +
          `<ul class="ss-links">${rows.map(r => `<li><a href="${esc(href('/online-school/' + r.slug))}">${esc(r.name)}</a> — ` +
            r.guides.map(g => `<a href="${esc(href('/blog/' + g.slug))}">${esc(g.label)}</a>`).join(' · ') + '</li>').join('')}</ul>` : ''
      })() : '',
      a.articleLinks?.length ? h2(a.articleLinksHeading || 'Read next') + p(a.articleLinksIntro) +
        links(a.articleLinks.map(al => ({ href: '/blog/' + al.slug, label: al.name, note: al.note }))) : '',
      a.series === 'continental' ? h2('The Continental Guides') +
        links(CONTINENTAL_SERIES.filter(c => c.slug !== slug && FULL_ARTICLES[c.slug]).map(c => ({ href: '/blog/' + c.slug, label: c.name }))) +
        h2('About this guide') + p(aboutGuideText(a, slug).body) + p(aboutGuideText(a, slug).cite) : '',
      p(a.conclusion),
    ],
    faqs: a.faqs, related: [h2('Next steps'), links(money)],
    crumbs: [['Guides', '/blog'], [a.t, path]],
    ld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: clip(a.t, 110), description: clip(a.metaDesc || a.intro, 300), url: ORIGIN + path,
      mainEntityOfPage: ORIGIN + path, publisher: ORG, author: a.author ? { '@type': 'Person', name: a.author } : ORG,
      ...(a.published ? { datePublished: a.published } : {}), ...(a.updated || a.published ? { dateModified: a.updated || a.published } : {}),
      ...(a.img && /^https?:|^\//.test(a.img) ? { image: a.img.startsWith('/') ? ORIGIN + a.img : a.img } : {}) }],
  })
}
if (intakeMissing) console.warn('seo-static: /blog/' + INTAKE + ' does not exist yet — blog posts link only to their hub and /pricing')

// Arabic pages (src/data/arabicPages.js, optional) and their hreflang pairs
const ALTERNATES = new Map()
const arabicFile = join(DATA, 'arabicPages.js')
if (existsSync(arabicFile)) {
  const { ARABIC_PAGES = [] } = await import(pathToFileURL(arabicFile).href)
  for (const a of ARABIC_PAGES) {
    if (!a || !a.path || !a.title) continue
    const enPath = a.enPath ? href(a.enPath) : null
    add({ path: a.path, title: a.title, desc: a.description || clip(a.intro), h1: a.h1 || a.title, lang: 'ar',
      locale: /saudi|riyadh|jeddah|dammam|khobar|dhahran|-sa$/.test((a.slug || '') + ' ' + (enPath || '')) ? 'ar_SA' : 'ar_AE',
      body: [p(a.intro), ...(a.sections || []).map(s => h2(s.h) + (Array.isArray(s.p) ? s.p.map(p).join('') : p(s.p)))],
      faqs: a.faqs, faqsTitle: 'الأسئلة الشائعة',
      related: enPath ? [links([{ href: enPath, label: 'English version' }])] : [],
      crumbs: [[a.h1 || a.title, a.path]], src: ['src/data/arabicPages.js'] })
    if (enPath) {
      const pair = [{ hreflang: 'ar', href: ORIGIN + href(a.path) }, { hreflang: 'en', href: ORIGIN + enPath }, { hreflang: 'x-default', href: ORIGIN + enPath }]
      ALTERNATES.set(href(a.path), pair)
      ALTERNATES.set(enPath, pair)
    }
  }
  console.log(`seo-static: ${ARABIC_PAGES.length} Arabic pages, ${ALTERNATES.size / 2} hreflang pairs`)
} else {
  console.warn('seo-static: src/data/arabicPages.js not found — no Arabic pages')
}

// Short titles the app also uses (src/data/seoTitles.js): country hubs,
// then fitTitle for city, tuition-area, curriculum, language, test-prep,
// study-abroad and service pages.
for (const pg of pages) pg.title = fitTitle(pg.path, HUB_TITLES[pg.path] || pg.title)

// ── Thin / doorway city pages → noindex,follow ──────────────
// Uniqueness = share of a page's 6-word shingles that appear on no other
// /homeschool- page, with the city and country names normalised (the same
// metric as the content audit). Priority markets are always indexed.
const PRIORITY_MARKETS = new Set(['kenya', 'nigeria', 'uae', 'saudi-arabia', 'qatar', 'kuwait', 'bahrain', 'oman', 'uganda', 'tanzania',
  'rwanda', 'ethiopia', 'south-africa', 'ghana', 'united-kingdom', 'usa', 'canada'])
const UNIQUE_MIN = 0.55
// Small or low-demand places, judged by hand: towns well under ~150k people,
// resort islands and secondary cities with little English-medium private
// schooling demand. Only applied outside the priority markets.
const LOW_DEMAND = new Set([
  'billund-dk', 'gudauri-ge', 'zabljak-me', 'potosi-bo', 'bansko-bg', 'filadelfia-py', 'santa-rita-py',
  'fuvahmulah-mv', 'kulhudhuffushi-mv', 'resort-islands-mv', 'rocha-uy', 'salto-uy', 'coca-ec', 'peten-gt',
  'puerto-barrios-gt', 'fajardo-pr', 'rovaniemi-fi', 'lulea-se', 'tromso-no', 'peja-xk', 'brcko-ba', 'bor-rs',
  'ettelbruck-lu', 'grevenmacher-lu', 'differdange-lu', 'kranj-si', 'nova-gorica-si', 'quepos-cr', 'limon-cr',
  'oshakati-na', 'victoria-falls-zw', 'jwaneng-bw', 'hassi-messaoud-dz', 'kumanovo-mk', 'tetovo-mk',
])
const norm = (t, names) => {
  t = String(t).replace(/<[^>]+>/g, ' ')
  for (const n of names.filter(Boolean).sort((a, b) => b.length - a.length)) t = t.split(n).join(' NAMEX ')
  return t.toLowerCase().match(/[a-z0-9']+/g) || []
}
const shingles = (w, n = 6) => { const s = new Set(); for (let i = 0; i + n <= w.length; i++) s.add(w.slice(i, i + n).join(' ')); return s }
function noindexRule() {
  const sets = CITY_PAGES.map(c => shingles(norm([p(c.pg.h1), ...c.pg.body, faqs(c.pg.faqs)].join(' '), [c.cityName, c.countryName])))
  const count = new Map()
  for (const s of sets) for (const x of s) count.set(x, (count.get(x) || 0) + 1)
  const rows = CITY_PAGES.map((c, i) => {
    const s = sets[i]; let u = 0; for (const x of s) if (count.get(x) === 1) u++
    return { ...c, unique: s.size ? u / s.size : 0 }
  })
  const chosen = rows.filter(r => !PRIORITY_MARKETS.has(r.countrySlug) && (r.unique < UNIQUE_MIN || LOW_DEMAND.has(r.slug)))
  return { rows, chosen }
}
const { rows: UNIQ, chosen: NOINDEX } = noindexRule()
for (const r of NOINDEX) r.pg.noindex = true
{
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0 }
  console.log(`seo-static: ${UNIQ.length} city pages, median uniqueness ${(100 * med(UNIQ.map(r => r.unique))).toFixed(0)}%; ` +
    `${NOINDEX.length} marked noindex (outside priority markets and below ${Math.round(UNIQUE_MIN * 100)}% unique or low-demand):`)
  console.log('  ' + NOINDEX.map(r => `${r.slug} (${(100 * r.unique).toFixed(0)}%${LOW_DEMAND.has(r.slug) ? ', low-demand' : ''})`).join(', '))
}
{
  const slugs = NOINDEX.map(r => r.slug).sort()
  const out = join(DATA, 'noindexSlugs.js')
  const src = '/* eslint-disable */\n' +
    '// GENERATED by scripts/seo-static.mjs (noindexRule) — do not edit by hand.\n' +
    '// Templated /homeschool-<slug> city pages outside the priority markets whose\n' +
    '// content is under ' + Math.round(UNIQUE_MIN * 100) + '% unique (6-word shingles, city/country names\n' +
    '// normalised) or that are low-demand places. They render with\n' +
    '// <meta name="robots" content="noindex, follow"> and are left out of the\n' +
    '// sitemap; their internal links stay. `npm run build` regenerates this file.\n\n' +
    `export const NOINDEX_SLUGS = new Set(${JSON.stringify(slugs, null, 1)})\n\n` +
    'export const isNoindexSlug = (slug) => NOINDEX_SLUGS.has(slug)\n'
  const prev = existsSync(out) ? readFileSync(out, 'utf8') : ''
  if (prev !== src) { writeFileSync(out, src); console.log('seo-static: wrote src/data/noindexSlugs.js (' + slugs.length + ' slugs)') }
}
if (NOINDEX_ONLY) process.exit(0)

// ── Write ────────────────────────────────────────────────────
const indexPath = join(DIST, 'index.html')
if (!existsSync(indexPath)) {
  console.error('seo-static: dist/index.html not found — run vite build first')
  process.exit(1)
}
const shell = readFileSync(indexPath, 'utf8')
if (!shell.includes('<div id="root"></div>')) { console.error('seo-static: dist/index.html has no <div id="root"></div>'); process.exit(1) }

const STYLE = `<style>#seo-static{max-width:760px;margin:0 auto;padding:96px 20px 60px;font:16px/1.75 system-ui,-apple-system,'Segoe UI',sans-serif;color:#1C2230;background:#F7F3ED}#seo-static h1{font:700 2rem/1.2 Georgia,serif;margin:0 0 16px}#seo-static h2{font:700 1.35rem/1.3 Georgia,serif;margin:32px 0 10px}#seo-static h3{font-size:1rem;margin:18px 0 4px}#seo-static a{color:#8B1A2E}#seo-static .ss-by{color:#5B6475;font-size:14px}#seo-static nav a{margin-right:16px}#seo-static table{border-collapse:collapse;font-size:14px}#seo-static td,#seo-static th{border:1px solid #ddd;padding:6px 8px;text-align:start}#seo-static address{font-style:normal}</style>`

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`)
  const tag = `<meta ${attr}="${key}" content="${esc(value)}"/>`
  return re.test(html) ? html.replace(re, () => tag) : html.replace('</head>', () => `  ${tag}\n</head>`)
}
const ldTag = (o) => `<script type="application/ld+json" data-ss>${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`
const crumbLd = (pg) => {
  const list = [['Home', '/'], ...(pg.crumbs || [[pg.h1 || pg.title.split(/ [|—–] /)[0], pg.path]])]
    .filter((c, i, a) => a.findIndex(x => x[1] === c[1]) === i)
  return list.length < 2 ? null : {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: list.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name: clip(name, 80), item: ORIGIN + (path === '/' ? '/' : href(path)) })),
  }
}
const KEY_HUBS = ['kenya', 'uae', 'qatar', 'saudi-arabia', 'kuwait', 'bahrain', 'oman', 'nigeria', 'united-kingdom', 'usa', 'canada', 'south-africa', 'australia', 'india', 'germany', 'georgia']
const FOOT_HUBS = KEY_HUBS.map(s => byPath.get('/online-school/' + s)).filter(Boolean)
  .map(pg => `<a href="${pg.path}">${esc(pg.crumbs?.[0]?.[0] || pg.path.split('/').pop())}</a>`).join(' · ')

const FOOT_CITIES = PRIORITY_CITY_LINKS.filter(([pth]) => byPath.has(pth) && !byPath.get(pth).noindex)
  .map(([pth, label]) => `<a href="${pth}">${esc(label)}</a>`).join(' · ')
for (const [pth] of [...PRIORITY_HUB_LINKS, ...PRIORITY_CITY_LINKS]) {
  if (!byPath.has(pth) || byPath.get(pth).noindex) console.warn('seo-static: priority link ' + pth + ' is not an indexable page (src/data/priorityLinks.js)')
}

const FOOT_MORE = [['/services', 'Services'], ['/compare/wolsey-hall', 'Smartious vs Wolsey Hall'], ['/calendar', 'School calendar'], ['/events', 'Events'],
  ['/gallery', 'Gallery'], ['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/cookies', 'Cookies'], ['/gdpr', 'GDPR'], ['/child-protection', 'Child protection'],
  ['/academic-integrity', 'Academic integrity'], ['/ai-policy', 'AI policy'], ['/inclusion-policy', 'Inclusion'], ['/language-policy', 'Language policy']]
  .filter(([pth]) => byPath.has(pth)).map(([pth, label]) => `<a href="${pth}">${esc(label)}</a>`).join(' · ')

function render(pg) {
  const url = ORIGIN + (pg.path === '/' ? '/' : pg.path)
  const desc = pg.lang === 'ar' ? clip(pg.desc, 300) : fitDesc(pg.desc, pg.title)
  const ar = pg.lang === 'ar'
  let html = shell.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(pg.title)}</title>`)
  if (ar) html = html.replace(/<html lang="en">/, '<html lang="ar" dir="rtl">')
  html = setMeta(html, 'name', 'description', desc)
  html = setMeta(html, 'name', 'robots', pg.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1')
  html = setMeta(html, 'property', 'og:title', pg.title)
  html = setMeta(html, 'property', 'og:description', desc)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'property', 'og:locale', pg.locale || 'en_US')
  html = setMeta(html, 'name', 'twitter:title', pg.title)
  html = setMeta(html, 'name', 'twitter:description', desc)
  if (pg.image) {
    html = setMeta(html, 'property', 'og:image', ORIGIN + (pg.ogImage || pg.image.src))
    html = setMeta(html, 'property', 'og:image:alt', pg.image.alt)
    html = setMeta(html, 'name', 'twitter:image', ORIGIN + (pg.ogImage || pg.image.src))
    html = html.replace(/\s*<meta property="og:image:(width|height)" content="[^"]*"\s*\/?>/g, '')
    // The hero image is the largest thing on the page: fetch it early.
    html = html.replace('</head>', () => `  <link rel="preload" as="image" href="${esc(pg.image.src)}" fetchpriority="high"/>\n</head>`)
  }
  const alt = (ALTERNATES.get(pg.path) || []).map(a => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`).join('\n  ')
  const lds = [crumbLd(pg), faqLd(pg.faqs), ...(pg.ld || [])].filter(Boolean).map(ldTag).join('\n  ')
  html = html.replace('</head>', () => `  <link rel="canonical" href="${url}"/>\n  ${alt ? alt + '\n  ' : ''}${lds}\n  ${STYLE}\n</head>`)
  const nav = `<nav><a href="/">Smartious Homeschool</a>${MAIN_LINKS.map(l => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}</nav>`
  const foot = `<footer>${h2('Online school by country')}<p>${FOOT_HUBS}</p><p>Online school by city: ${FOOT_CITIES}</p><p>${FOOT_MORE}</p>${contactBlock().replace(/^<h2>[^<]*<\/h2>/, '')}</footer>`
  const arAlt = !ar && (ALTERNATES.get(pg.path) || []).find(a => a.hreflang === 'ar')
  const langLink = arAlt ? `<p lang="ar" dir="rtl"><a href="${esc(arAlt.href.slice(ORIGIN.length))}" hreflang="ar">النسخة العربية من هذه الصفحة</a></p>` : ''
  const main = `<h1>${esc(pg.h1 || pg.title.split(/ [|—–] /)[0])}</h1>${langLink}${pg.body.join('')}${faqs(pg.faqs, pg.faqsTitle)}${pg.related.join('')}`
  // Visible rating and one parent quote (text only, no review markup).
  const rv = GOOGLE_REVIEWS[reviewOffset(pg.path)]
  const reviews = ar ? '' : `${h2('What parents say')}<p>Rated ${GOOGLE_RATING.stars} out of 5 on Google from ${GOOGLE_RATING.count}+ reviews. <a href="${GOOGLE_PROFILE_URL}" rel="noopener">Read our Google reviews</a></p><blockquote>&ldquo;${esc(rv.text)}&rdquo; &mdash; ${esc(rv.name)}, Google review</blockquote>`
  const body = `<div id="seo-static"${ar ? ' lang="ar" dir="rtl"' : ''}>${nav}<main>${main}${reviews}</main>${h2(ar ? 'ابدأ مع Smartious' : 'Start with Smartious')}${links(CTA_LINKS)}${foot}</div>`
  // Function replacements: page text may contain "$`" or "$'", which a
  // string replacement expands into the rest of the document.
  return html.replace('<div id="root"></div>', () => body + '<div id="root"></div>')
}

let n = 0
const written = []
for (const pg of pages) {
  if (!pg.title || !pg.desc) { console.warn('seo-static: skipped', pg.path, '(no title/description)'); continue }
  const out = join(DIST, pg.file || pg.path.replace(/^\/+/, '') + '.html')
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, render(pg))
  written.push(pg); n++
}

// Fail the build (Netlify then keeps the last good deploy) rather than ship
// a site whose static pages or sitemap silently went missing.
if (n < 500) { console.error(`seo-static: only ${n} pages written — refusing to publish an incomplete site`); process.exit(1) }

// ── Sitemap: exactly the indexable pages written above ──
// lastmod = newest git commit date of the page's source files (pg.src,
// default LandingPage.jsx), falling back to the build date without git.
const GIT_DATES = new Map()
const gitDate = (file) => {
  if (!GIT_DATES.has(file)) {
    let d = ''
    try { d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() } catch {}
    GIT_DATES.set(file, /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : BUILD_DATE)
  }
  return GIT_DATES.get(file)
}
const lastmod = (pg) => (pg.src && pg.src.length ? pg.src : ['src/pages/LandingPage.jsx']).map(gitDate).sort().pop()
const sm = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<!-- GENERATED by scripts/seo-static.mjs at build time: every indexable page with static HTML. Do not edit by hand. -->\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
  written.filter(pg => !pg.noindex).map(pg => `  <url><loc>${esc(ORIGIN + (pg.path === '/' ? '/' : pg.path))}</loc><lastmod>${lastmod(pg)}</lastmod>${(pg.images || []).map(i => `<image:image><image:loc>${esc(ORIGIN + i.src)}</image:loc></image:image>`).join('')}</url>`).join('\n') +
  '\n</urlset>\n'
writeFileSync(join(DIST, 'sitemap.xml'), sm)
try { writeFileSync(join(ROOT, 'public', 'sitemap.xml'), sm) } catch (e) { console.warn('seo-static: could not refresh public/sitemap.xml:', e.message) }

// ── Service worker: version its caches per build ──
const swPath = join(DIST, 'sw.js')
if (existsSync(swPath)) {
  const sw = readFileSync(swPath, 'utf8')
  if (sw.includes('__BUILD_ID__')) writeFileSync(swPath, sw.split('__BUILD_ID__').join(BUILD_ID))
  else console.warn('seo-static: dist/sw.js has no __BUILD_ID__ placeholder')
}

const thin = written.filter(pg => !pg.noindex && words(pg.body.join(' ') + faqs(pg.faqs)) < 120).map(pg => pg.path)
console.log(`seo-static: wrote ${n} pages (${written.filter(x => x.noindex).length} noindex), sitemap ${written.filter(x => !x.noindex).length} URLs, build ${BUILD_ID}`)
if (thin.length) console.log(`seo-static: ${thin.length} indexable pages with under 120 words of body text: ${thin.slice(0, 30).join(' ')}`)
