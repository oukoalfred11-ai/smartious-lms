/* ═══════════════════════════════════════════════════════════════════
   generate-sitemap.js — Auto-generates public/sitemap.xml at build time.
   ───────────────────────────────────────────────────────────────────
   Run via npm prebuild hook (`node scripts/generate-sitemap.js`) so the
   sitemap is regenerated on every deploy. Reads from the same data files
   as the React app so country/city additions stay in sync automatically.
   
   URL pattern conventions (mirrors the actual routing in LandingPage.jsx):
     · Country hub:       /online-school/<country.slug>
     · Country-detail:    /online-school/<COUNTRIES[i].slug>  (broader list)
     · Kenya cities:      /homeschooling/<city.slug>          (legacy pattern)
     · All other cities:  /homeschool-<city.slug>             (newer pattern)
     · US states:         /homeschool-<state.slug>
     · US cities:         /homeschool-<city.slug>             (slug already has -<state>)
     · CA provinces:      /homeschool-<province.slug>
     · CA cities:         /homeschool-<city.slug>             (slug already has -<province>)
     · Test prep detail:  /test-prep/<slug>
     · Languages detail:  /languages/<slug>
     · Study abroad:      /study-abroad/<slug>
     · Articles/blog:     /article/<slug>
   
   Adding a new country: drop the country data file in src/data/, add an
   entry to COUNTRY_DATA below (one line), and the sitemap picks up the
   hub plus every city automatically on the next build.
═══════════════════════════════════════════════════════════════════ */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/* Data imports — match the imports at the top of LandingPage.jsx */
import { COUNTRIES } from '../src/data/countries.js'
import { SERVICES } from '../src/data/services.js'
import { FULL_ARTICLES } from '../src/data/fullArticles.js'
import { US_STATES_LIST } from '../src/data/usStates.js'
import { US_CITIES_LIST } from '../src/data/usCities.js'
import { CA_PROVINCES_LIST } from '../src/data/caProvinces.js'
import { CA_CITIES_LIST } from '../src/data/caCities.js'
import { TEST_PREP } from '../src/data/testPrep.js'
import { LANGUAGES } from '../src/data/languages.js'
import { STUDY_ABROAD } from '../src/data/studyAbroad.js'
import { KENYA_CITIES, KENYA_COUNTRY } from '../src/data/kenyaCities.js'
import { ETHIOPIA_CITIES, ETHIOPIA_COUNTRY } from '../src/data/ethiopiaCities.js'
import { RWANDA_CITIES, RWANDA_COUNTRY } from '../src/data/rwandaCities.js'
import { SOUTH_AFRICA_CITIES, SOUTH_AFRICA_COUNTRY } from '../src/data/southAfricaCities.js'
import { QATAR_CITIES, QATAR_COUNTRY } from '../src/data/qatarCities.js'
import { SAUDI_ARABIA_CITIES, SAUDI_ARABIA_COUNTRY } from '../src/data/saudiArabiaCities.js'
import { UAE_CITIES, UAE_COUNTRY } from '../src/data/uaeCities.js'
import { EGYPT_CITIES, EGYPT_COUNTRY } from '../src/data/egyptCities.js'
import { MOROCCO_CITIES, MOROCCO_COUNTRY } from '../src/data/moroccoCities.js'
import { SOUTH_KOREA_CITIES, SOUTH_KOREA_COUNTRY } from '../src/data/southKoreaCities.js'
import { JAPAN_CITIES, JAPAN_COUNTRY } from '../src/data/japanCities.js'
import { MALAYSIA_CITIES, MALAYSIA_COUNTRY } from '../src/data/malaysiaCities.js'
import { TURKEY_CITIES, TURKEY_COUNTRY } from '../src/data/turkeyCities.js'
import { TOPICAL_ARTICLE_SLUGS } from '../src/data/topicalArticles.js'
import { VIETNAM_CITIES, VIETNAM_COUNTRY } from '../src/data/vietnamCities.js'
import { THAILAND_CITIES, THAILAND_COUNTRY } from '../src/data/thailandCities.js'

const BASE_URL = 'https://smartioushomeschool.com'
const TODAY = new Date().toISOString().split('T')[0]

/* ────────────────────────────────────────────────────────────────
   Static top-level pages — priority and changefreq mirror what was
   already in the hand-written sitemap so Search Console doesn't see
   a sudden shift in signals.
   ──────────────────────────────────────────────────────────────── */
const STATIC_PAGES = [
  { path: '/',             priority: 1.0, changefreq: 'daily'  },
  { path: '/about',        priority: 0.8, changefreq: 'weekly' },
  { path: '/curricula',    priority: 0.8, changefreq: 'weekly' },
  { path: '/services',     priority: 0.8, changefreq: 'weekly' },
  { path: '/programs',     priority: 0.8, changefreq: 'weekly' },
  { path: '/pricing',      priority: 0.8, changefreq: 'weekly' },
  { path: '/teachers',     priority: 0.8, changefreq: 'weekly' },
  { path: '/global',       priority: 0.8, changefreq: 'weekly' },
  { path: '/contact',      priority: 0.8, changefreq: 'monthly' },
  { path: '/faq',          priority: 0.7, changefreq: 'monthly' },
  { path: '/enroll',       priority: 0.8, changefreq: 'weekly' },
  { path: '/consult',      priority: 0.8, changefreq: 'monthly' },
  { path: '/calendar',     priority: 0.6, changefreq: 'monthly' },
  { path: '/events',       priority: 0.6, changefreq: 'monthly' },
  { path: '/gallery',      priority: 0.6, changefreq: 'monthly' },
  { path: '/activities',   priority: 0.7, changefreq: 'monthly' },
  { path: '/blog',         priority: 0.8, changefreq: 'weekly' },
  { path: '/test-prep',    priority: 0.8, changefreq: 'weekly' },
  { path: '/languages',    priority: 0.8, changefreq: 'weekly' },
  { path: '/study-abroad', priority: 0.8, changefreq: 'weekly' },
  /* Service / product pages */
  { path: '/homeschool',       priority: 0.8, changefreq: 'weekly' },
  { path: '/tuition',          priority: 0.8, changefreq: 'weekly' },
  { path: '/tuition-nairobi',  priority: 0.8, changefreq: 'weekly' },
  { path: '/tuition-uae',      priority: 0.8, changefreq: 'weekly' },
  { path: '/iufp',             priority: 0.8, changefreq: 'weekly' },
  { path: '/pre-university',   priority: 0.8, changefreq: 'weekly' },
  /* Canadian provincial funding pages */
  { path: '/alberta-home-ed-funding',         priority: 0.7, changefreq: 'monthly' },
  { path: '/bc-distributed-learning-funding', priority: 0.7, changefreq: 'monthly' },
  { path: '/saskatchewan-homeschool-funding', priority: 0.7, changefreq: 'monthly' },
  /* Footer legal pages — low priority but indexable */
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms',   priority: 0.3, changefreq: 'yearly' },
  { path: '/cookies', priority: 0.3, changefreq: 'yearly' },
  { path: '/gdpr',    priority: 0.3, changefreq: 'yearly' },
]

/* ────────────────────────────────────────────────────────────────
   Country hubs + cities — the 13 v2-depth country data files.
   Each entry pairs a *_COUNTRY object with its *_CITIES array.
   Adding country #14: drop the data file in src/data/, import it
   above, and add one entry to this array.
   ──────────────────────────────────────────────────────────────── */
const COUNTRY_DATA = [
  { country: KENYA_COUNTRY,        cities: KENYA_CITIES,        cityUrlPattern: 'kenya-legacy' },
  { country: ETHIOPIA_COUNTRY,     cities: ETHIOPIA_CITIES                                       },
  { country: RWANDA_COUNTRY,       cities: RWANDA_CITIES                                         },
  { country: SOUTH_AFRICA_COUNTRY, cities: SOUTH_AFRICA_CITIES                                   },
  { country: QATAR_COUNTRY,        cities: QATAR_CITIES                                          },
  { country: SAUDI_ARABIA_COUNTRY, cities: SAUDI_ARABIA_CITIES                                   },
  { country: UAE_COUNTRY,          cities: UAE_CITIES                                            },
  { country: EGYPT_COUNTRY,        cities: EGYPT_CITIES                                          },
  { country: MOROCCO_COUNTRY,      cities: MOROCCO_CITIES                                        },
  { country: SOUTH_KOREA_COUNTRY,  cities: SOUTH_KOREA_CITIES                                    },
  { country: JAPAN_COUNTRY,        cities: JAPAN_CITIES                                          },
  { country: VIETNAM_COUNTRY,      cities: VIETNAM_CITIES                                        },
  { country: THAILAND_COUNTRY,     cities: THAILAND_CITIES                                       },
  { country: MALAYSIA_COUNTRY,     cities: MALAYSIA_CITIES                                       },
  { country: TURKEY_COUNTRY,       cities: TURKEY_CITIES                                         },
]

/* ────────────────────────────────────────────────────────────────
   URL builders — encapsulate the per-section URL conventions.
   ──────────────────────────────────────────────────────────────── */
function urlsForCountry({ country, cities, cityUrlPattern }) {
  const urls = [{
    loc: BASE_URL + country.hub,
    priority: 0.9, changefreq: 'weekly', lastmod: TODAY,
  }]
  for (const city of cities) {
    /* Skip the "country" placeholder entry that some _CITIES arrays
       include as a self-reference (slug === country.slug). */
    if (city.slug === country.slug) continue
    const path = cityUrlPattern === 'kenya-legacy'
      ? `/homeschooling/${city.slug}`
      : `/homeschool-${city.slug}`
    urls.push({
      loc: BASE_URL + path,
      priority: 0.7, changefreq: 'monthly', lastmod: TODAY,
    })
  }
  return urls
}

function urlsForCountryDetail(c) {
  return [{
    loc: `${BASE_URL}/online-school/${c.slug}`,
    priority: 0.8, changefreq: 'weekly', lastmod: TODAY,
  }]
}

function urlsForUSRegion(state) {
  return [{
    loc: `${BASE_URL}/homeschool-${state.slug}`,
    priority: 0.8, changefreq: 'weekly', lastmod: TODAY,
  }]
}

function urlsForUSCity(city) {
  return [{
    loc: `${BASE_URL}/homeschool-${city.slug}`,
    priority: 0.7, changefreq: 'monthly', lastmod: TODAY,
  }]
}

function urlsForCAProvince(prov) {
  return [{
    loc: `${BASE_URL}/homeschool-${prov.slug}`,
    priority: 0.8, changefreq: 'weekly', lastmod: TODAY,
  }]
}

function urlsForCACity(city) {
  return [{
    loc: `${BASE_URL}/homeschool-${city.slug}`,
    priority: 0.7, changefreq: 'monthly', lastmod: TODAY,
  }]
}

function urlsForTestPrep(t) {
  return [{
    loc: `${BASE_URL}/test-prep/${t.slug}`,
    priority: 0.7, changefreq: 'monthly', lastmod: TODAY,
  }]
}

function urlsForLanguage(l) {
  return [{
    loc: `${BASE_URL}/languages/${l.slug}`,
    priority: 0.7, changefreq: 'monthly', lastmod: TODAY,
  }]
}

function urlsForStudyAbroad(s) {
  return [{
    loc: `${BASE_URL}/study-abroad/${s.slug}`,
    priority: 0.7, changefreq: 'monthly', lastmod: TODAY,
  }]
}

function urlsForArticle(slug, article) {
  return [{
    loc: `${BASE_URL}/blog/${slug}`,
    priority: 0.7, changefreq: 'monthly',
    /* Articles have human-readable date strings like "May 2026 · 7 min read"
       that aren't ISO-parseable, so fall back to today's date for lastmod. */
    lastmod: TODAY,
  }]
}

function urlsForCurriculum(c) {
  return [{
    loc: `${BASE_URL}/curriculum/${c.slug}`,
    priority: 0.7, changefreq: 'monthly', lastmod: TODAY,
  }]
}

function urlsForService(s) {
  return [{
    loc: `${BASE_URL}/services/${s.slug}`,
    priority: 0.7, changefreq: 'monthly', lastmod: TODAY,
  }]
}

/* ────────────────────────────────────────────────────────────────
   Build, dedupe, render.
   ──────────────────────────────────────────────────────────────── */
function buildAllUrls() {
  const urls = []

  for (const p of STATIC_PAGES) {
    urls.push({
      loc: BASE_URL + p.path,
      priority: p.priority, changefreq: p.changefreq, lastmod: TODAY,
    })
  }
  for (const c of COUNTRIES)          urls.push(...urlsForCountryDetail(c))
  for (const cd of COUNTRY_DATA)      urls.push(...urlsForCountry(cd))
  for (const s of US_STATES_LIST)     urls.push(...urlsForUSRegion(s))
  for (const c of US_CITIES_LIST)     urls.push(...urlsForUSCity(c))
  for (const p of CA_PROVINCES_LIST)  urls.push(...urlsForCAProvince(p))
  for (const c of CA_CITIES_LIST)     urls.push(...urlsForCACity(c))
  for (const t of TEST_PREP)          urls.push(...urlsForTestPrep(t))
  for (const l of LANGUAGES)          urls.push(...urlsForLanguage(l))
  for (const s of STUDY_ABROAD)       urls.push(...urlsForStudyAbroad(s))
  /* FULL_ARTICLES is an object keyed by slug, not an array.
     Article URL pattern in the app is /blog/<slug>. */
  for (const [slug, article] of Object.entries(FULL_ARTICLES)) {
    urls.push(...urlsForArticle(slug, article))
  }
  for (const s of SERVICES)           urls.push(...urlsForService(s))
  /* Topical cluster articles — long-form landing pages per country.
     URL pattern: /<slug> (e.g. /online-igcse-malaysia). */
  for (const slug of TOPICAL_ARTICLE_SLUGS) {
    urls.push({
      loc: BASE_URL + '/' + slug,
      priority: '0.7', changefreq: 'monthly', lastmod: TODAY,
    })
  }
  /* CURRICULA has no per-curriculum URL route in the app — the
     curriculum-detail page is state-routed not URL-routed — so we
     deliberately don't emit /curriculum/<slug> URLs that would 404. */

  /* Dedupe by loc, keeping the highest-priority entry when a URL
     appears more than once. The COUNTRIES list and COUNTRY_DATA hub
     URLs commonly overlap (e.g. /online-school/kenya appears in both)
     and the COUNTRY_DATA hub entry — at priority 0.9 — should win. */
  const seen = new Map()
  for (const u of urls) {
    const existing = seen.get(u.loc)
    if (!existing || existing.priority < u.priority) seen.set(u.loc, u)
  }

  /* Stable sort so diff'ing successive sitemap.xml outputs is easy. */
  return Array.from(seen.values()).sort((a, b) => a.loc.localeCompare(b.loc))
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function renderXml(urls) {
  const entries = urls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`
}

/* ────────────────────────────────────────────────────────────────
   Main.
   ──────────────────────────────────────────────────────────────── */
const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public')
const outPath = join(outDir, 'sitemap.xml')

mkdirSync(outDir, { recursive: true })

const urls = buildAllUrls()
const xml = renderXml(urls)
writeFileSync(outPath, xml)

/* Console summary so the build log shows what was generated. */
const counts = {
  static: STATIC_PAGES.length,
  countryDetails: COUNTRIES.length,
  countryHubs: COUNTRY_DATA.length,
  countryCities: COUNTRY_DATA.reduce((n, cd) => n + cd.cities.filter(c => c.slug !== cd.country.slug).length, 0),
  usStates: US_STATES_LIST.length,
  usCities: US_CITIES_LIST.length,
  caProvinces: CA_PROVINCES_LIST.length,
  caCities: CA_CITIES_LIST.length,
  testPrep: TEST_PREP.length,
  languages: LANGUAGES.length,
  studyAbroad: STUDY_ABROAD.length,
  articles: Object.keys(FULL_ARTICLES).length,
  services: SERVICES.length,
  topicalArticles: TOPICAL_ARTICLE_SLUGS.length,
}

console.log(`[sitemap] generated ${urls.length} URLs at ${outPath}`)
console.log(`[sitemap] breakdown:`, counts)
