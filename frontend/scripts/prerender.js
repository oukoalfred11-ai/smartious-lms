/* ═══════════════════════════════════════════════════════════════════
   prerender.js — Build-time static HTML generator for SEO routes.
   ───────────────────────────────────────────────────────────────────
   Runs after `vite build` completes (as `npm run postbuild`).
   
   For each public-facing route, headless Chrome:
     1. Loads dist/index.html in a virtual server
     2. Navigates to the route (React Router renders the matching page)
     3. Waits for React to mount + usePageMeta to set title/canonical
     4. Captures the full rendered HTML
     5. Writes it to dist/<route>/index.html
   
   Netlify serves the prerendered HTML directly when crawlers (or users)
   request that URL. The SPA fallback /* → /index.html in netlify.toml
   only fires for routes that have no prerendered file.
   
   ── Performance optimisations (vs. v1) ──────────────────────────────
   v1 timed out on Netlify's 18-minute build limit. v2 fixes this:
     · Concurrency=4 → 4 pages render in parallel (~4x speedup)
     · Request blocking → drop GTM/analytics/fonts/CDN images that
       slow render but don't affect output HTML
     · waitUntil='domcontentloaded' → skip networkidle0 (which never
       fires cleanly with GTM/gtag.js continuous pings)
     · Per-page timeout 15s (was 45s) → fail fast on broken routes
     · MAX_URLS cap → discovery can't run away
   
   Adding a new public route: drop it into ROUTES_TO_PRERENDER.
═══════════════════════════════════════════════════════════════════ */

import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import handler from 'serve-handler'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const PORT = 5051

const CONCURRENCY = 2
const PAGE_TIMEOUT_MS = 15_000
const WAIT_AFTER_MOUNT_MS = 250
const MAX_URLS = 300

/* Third-party domains blocked during render — they don't change the
   output HTML but slow each page substantially. GTM and Google Ads
   never resolve cleanly because they send heartbeat pings, which is
   why v1's networkidle0 wait stalled forever. */
const BLOCKED_DOMAINS = [
  'googletagmanager.com',
  'google-analytics.com',
  'googleadservices.com',
  'googlesyndication.com',
  'doubleclick.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'res.cloudinary.com',
  'images.unsplash.com',
  'formsubmit.co',
  'connect.facebook.net',
  'snap.licdn.com',
  'analytics.tiktok.com',
]

/* Routes to prerender. SEO-critical public pages only.
   City pages and other dynamic routes auto-discover via internal links
   from country hubs (see CRAWL_FROM_HUBS_PATTERN). */
const ROUTES_TO_PRERENDER = [
  '/',
  '/about', '/curricula', '/services', '/programs', '/pricing', '/teachers',
  '/global', '/contact', '/faq', '/enroll', '/consult',
  '/calendar', '/events', '/gallery', '/activities',
  '/blog', '/test-prep', '/languages', '/study-abroad',
  // Europe 2026 article batch — prerendered so the SEO articles actually index
  '/blog/homeschooling-europe-2026-compared',
  '/blog/homeschooling-italy-age-16-rule',
  '/blog/online-school-poland-cambridge-track',
  '/blog/online-school-spain-visa-families',
  '/blog/virtual-school-denmark-guide',
  '/blog/homeschooling-denmark-grundlov-guide',
  '/blog/online-school-denmark-corporate-families',
  '/blog/virtual-school-france-2022-rules',
  '/blog/homeschooling-portugal-degree-rule',
  '/blog/online-school-portugal-cascais-waitlists',
  '/blog/virtual-school-portugal-nomad-families',
  '/blog/homeschooling-czech-republic-age-15',
  '/blog/online-school-czech-prague-fees',
  '/blog/virtual-school-czech-skoda-families',
  '/blog/homeschooling-belgium-checkpoint-exams',
  '/blog/online-school-belgium-eu-nato-families',
  '/blog/virtual-school-belgium-status-question',
  '/blog/homeschooling-sweden-what-is-actually-legal',
  '/blog/online-school-sweden-after-16',
  '/blog/virtual-school-sweden-queues-and-supplements',
  '/blog/homeschooling-norway-notification-and-tilsyn',
  '/blog/online-school-norway-energy-families',
  '/blog/virtual-school-norway-two-nordic-answers',
  '/blog/homeschooling-new-zealand-exemption-guide',
  '/blog/online-school-new-zealand-cambridge-track',
  '/blog/virtual-school-new-zealand-regions-and-after-16',
  '/blog/homeschooling-austria-three-dates',
  '/blog/online-school-austria-vienna-un-families',
  '/blog/virtual-school-austria-dual-track',
  '/blog/homeschooling-hungary-egyeni-munkarend',
  '/blog/online-school-hungary-auto-corridor',
  '/blog/virtual-school-hungary-after-16',
  '/blog/homeschooling-finland-kotiopetus-guide',
  '/blog/online-school-finland-tech-families',
  '/blog/virtual-school-finland-lapland-and-after-16',
  '/blog/homeschooling-greece-what-the-law-allows',
  '/blog/online-school-greece-shipping-and-frontistirio',
  '/blog/virtual-school-greece-after-gymnasio',
  '/blog/homeschooling-azerbaijan-legal-guide',
  '/blog/online-school-azerbaijan-energy-families',
  '/blog/virtual-school-azerbaijan-after-grade-9',
  '/blog/homeschooling-georgia-eksternati-guide',
  '/blog/online-school-georgia-relocation-families',
  '/blog/virtual-school-georgia-after-grade-10',
  '/blog/homeschooling-pakistan-legal-and-ibcc-guide',
  '/blog/online-school-pakistan-beyond-the-waitlist',
  '/blog/virtual-school-pakistan-regions-and-after-sixteen',
  '/blog/homeschooling-australia-state-by-state',
  '/blog/online-school-australia-diaspora-and-returning-families',
  '/blog/virtual-school-australia-regional-and-remote',
  '/blog/homeschooling-luxembourg-authorisation-guide',
  '/blog/online-school-luxembourg-institutions-and-places',
  '/blog/virtual-school-luxembourg-frontalier-families',
  '/blog/homeschooling-switzerland-canton-guide',
  '/blog/online-school-switzerland-fee-gap',
  '/blog/virtual-school-switzerland-alpine-valleys',
  '/blog/homeschooling-slovakia-individualne-vzdelavanie',
  '/blog/online-school-slovakia-auto-corridor',
  '/blog/virtual-school-slovakia-after-sixteen',
  '/blog/homeschooling-slovenia-a-right-and-a-reckoning',
  '/blog/online-school-slovenia-one-city-tier',
  '/blog/virtual-school-slovenia-after-basic-school',
  '/blog/homeschooling-croatia-what-the-law-allows',
  '/blog/online-school-croatia-coast-and-diaspora',
  '/blog/virtual-school-croatia-after-primary-school',
  '/blog/homeschooling-serbia-the-right-and-the-exams',
  '/blog/online-school-serbia-tech-and-industry',
  '/blog/virtual-school-serbia-diaspora-and-regions',
  '/blog/homeschooling-bulgaria-samostoyatelna-forma',
  '/blog/online-school-bulgaria-industry-and-nomads',
  '/blog/virtual-school-bulgaria-after-sixteen-and-the-regions',
  '/blog/homeschooling-albania-what-the-law-allows',
  '/blog/online-school-albania-coast-and-diaspora',
  '/blog/virtual-school-albania-after-sixteen',
  '/blog/homeschooling-north-macedonia-what-the-law-allows',
  '/blog/online-school-north-macedonia-regions-and-diaspora',
  '/blog/virtual-school-north-macedonia-supplementary-model',
  '/blog/homeschooling-montenegro-a-semester-at-a-time',
  '/blog/online-school-montenegro-coast-and-north',
  '/blog/virtual-school-montenegro-cycle-checks-and-after-fifteen',
  '/blog/homeschooling-bosnia-fourteen-rulebooks',
  '/blog/online-school-bosnia-regions-and-diaspora',
  '/blog/virtual-school-bosnia-supplementary-and-universities',
  '/blog/homeschooling-kosovo-what-the-law-allows',
  '/blog/online-school-kosovo-diaspora-and-regions',
  '/blog/virtual-school-kosovo-after-grade-nine',
  '/blog/homeschooling-in-europe-country-by-country',
  '/blog/homeschooling-zambia-what-the-law-says',
  '/blog/online-school-zambia-copperbelt-and-beyond',
  '/blog/homeschooling-zimbabwe-cambridge-country',
  '/blog/online-school-zimbabwe-regions-and-diaspora',
  '/blog/homeschooling-botswana-what-the-law-says',
  '/blog/online-school-botswana-diamond-towns-and-beyond',
  '/blog/homeschooling-namibia-registered-route',
  '/blog/online-school-namibia-coast-and-north',
  '/blog/homeschooling-algeria-what-the-law-says',
  '/blog/online-school-algeria-french-system-gap',
  '/blog/homeschooling-tunisia-what-the-law-says',
  '/blog/online-school-tunisia-sfax-sahel-and-diaspora',
  '/blog/homeschooling-mauritius-cambridge-country',
  '/blog/online-school-mauritius-subject-gaps',
  '/blog/homeschooling-ghana-what-the-law-says',
  '/blog/online-school-ghana-wassce-and-cambridge',
  '/blog/homeschooling-angola-what-the-law-says',
  '/blog/online-school-angola-oil-coast-and-corridor',
  '/blog/homeschooling-drc-loi-cadre-liberties',
  '/blog/online-school-drc-cobalt-belt',
  '/blog/homeschooling-mexico-what-the-law-says',
  '/blog/online-school-mexico-turno-vespertino',
  '/blog/virtual-school-mexico-bajio-and-coast',
  '/blog/homeschooling-brazil-stf-tema-822',
  '/blog/online-school-brazil-alongside-your-school',
  '/blog/virtual-school-brazil-energy-mining-and-tech',
  '/blog/homeschooling-colombia-the-disputed-position',
  '/blog/online-school-colombia-validacion-and-jornadas',
  '/blog/virtual-school-colombia-after-fifteen',
  '/blog/homeschooling-argentina-what-the-law-says',
  '/blog/online-school-argentina-subject-access-and-fees',
  '/blog/virtual-school-argentina-vaca-muerta-and-provinces',
  '/blog/homeschooling-chile-examenes-libres',
  '/blog/online-school-chile-full-time-option',
  '/blog/virtual-school-chile-copper-north-and-south',
  '/blog/homeschooling-peru-what-the-law-says',
  '/blog/online-school-peru-turno-tarde-and-regions',
  '/blog/virtual-school-peru-mining-and-agro-corridors',
  '/blog/homeschooling-ecuador-educacion-en-casa',
  '/blog/online-school-ecuador-abierta-vs-en-casa',
  '/blog/virtual-school-ecuador-coast-and-amazon',
  '/blog/homeschooling-panama-what-we-can-verify',
  '/blog/online-school-panama-beyond-the-capital',
  '/blog/virtual-school-panama-expat-belts',
  '/blog/homeschooling-costa-rica-what-the-mep-says',
  '/blog/online-school-costa-rica-educacion-abierta',
  '/blog/virtual-school-costa-rica-coasts-and-corridor',
  '/blog/homeschooling-dominican-republic-what-the-law-says',
  '/blog/online-school-dominican-republic-diploma-question',
  '/blog/virtual-school-dominican-republic-coasts-and-cibao',
  '/blog/homeschooling-uruguay-the-contested-position',
  '/blog/online-school-uruguay-subject-access-and-departments',
  '/blog/virtual-school-uruguay-litoral-north-and-coast',
  '/blog/homeschooling-guatemala-what-we-can-verify',
  '/blog/online-school-guatemala-beyond-the-capital',
  '/blog/virtual-school-guatemala-highlands-peten-izabal',
  '/homeschool', '/tuition', '/tuition-nairobi', '/tuition-uae',
  '/tuition-uk',
  '/iufp', '/pre-university',
  '/alberta-home-ed-funding',
  '/bc-distributed-learning-funding',
  '/saskatchewan-homeschool-funding',
  '/privacy', '/terms', '/cookies', '/gdpr',

  /* v2-depth country hubs (full <CountryHub> rendering) */
  '/online-school/kenya',
  '/virtual-school-kenya',
  '/virtual-school-ukraine',
  '/online-school/ethiopia',
  '/online-school/rwanda',
  '/online-school/south-africa',
  '/online-school/qatar',
  '/online-school/saudi-arabia',
  '/online-school/uae',
  '/online-school/egypt',
  '/online-school/morocco',
  '/online-school/south-korea',
  '/online-school/japan',
  '/online-school/vietnam',
  '/online-school/thailand',
  '/online-school/malaysia',
  '/online-school/turkey',
  '/online-school/kuwait',
  '/online-school/oman',
  '/online-school/taiwan',
  '/online-school/ireland',
  '/online-school/united-kingdom',
  '/online-school/india',
  '/online-school/germany',
  '/online-school/romania',
  '/online-school/ukraine',
  '/online-school/netherlands',
  '/online-school/norway',
  '/online-school/new-zealand',
  '/online-school/austria',
  '/online-school/hungary',
  '/online-school/finland',
  '/online-school/greece',
  '/online-school/azerbaijan',
  '/online-school/georgia',
  '/online-school/spain',
  '/online-school/denmark',
  '/online-school/france',
  '/online-school/italy',
  '/online-school/poland',
  '/online-school/portugal',
  '/online-school/czech-republic',
  '/online-school/belgium',
  '/online-school/sweden',

  /* Topical cluster articles (Malaysia — will scale to other countries) */
  '/online-igcse-malaysia',
  '/ossd-malaysia',
  '/international-school-alternative-malaysia',
  '/branch-campus-universities-malaysia',

  /* Country detail pages (lighter template, from COUNTRIES list) */
  '/online-school/usa',
  '/online-school/canada',
  '/online-school/australia',
  '/online-school/luxembourg',
  '/online-school/switzerland',
  '/online-school/slovakia',
  '/online-school/slovenia',
  '/online-school/croatia',
  '/online-school/serbia',
  '/online-school/bulgaria',
  '/online-school/albania',
  '/online-school/north-macedonia',
  '/online-school/montenegro',
  '/online-school/bosnia-and-herzegovina',
  '/online-school/kosovo',
  '/online-school/zambia',
  '/online-school/zimbabwe',
  '/online-school/botswana',
  '/online-school/namibia',
  '/online-school/algeria',
  '/online-school/tunisia',
  '/online-school/mauritius',
  '/online-school/ghana',
  '/online-school/angola',
  '/online-school/drc',
  '/online-school/mexico',
  '/online-school/brazil',
  '/online-school/colombia',
  '/online-school/argentina',
  '/online-school/chile',
  '/online-school/peru',
  '/online-school/ecuador',
  '/online-school/panama',
  '/online-school/costa-rica',
  '/online-school/dominican-republic',
  '/online-school/uruguay',
  '/online-school/guatemala',
  '/online-school/nigeria',
  '/online-school/tanzania',
  '/online-school/uganda',
  '/online-school/pakistan',
  '/online-school/bahrain',
  '/online-school/somalia',

  /* Test prep details */
  '/test-prep/ielts',
  '/test-prep/toefl',
  '/test-prep/pte',
  '/test-prep/gre',
  '/test-prep/gmat',
  '/test-prep/sat',
]

/* Only crawl internal links from the 13 v2-depth country hubs.
   Excluding /online-school/usa etc. because their pages list ~120
   US city links each, which would blow past MAX_URLS instantly.
   US/Canada city pages fall back to SPA rendering (Google's JS
   second-pass crawl will still index them via sitemap.xml). */
const CRAWL_FROM_HUBS_PATTERN = /^\/online-school\/(kenya|ethiopia|rwanda|south-africa|qatar|saudi-arabia|uae|egypt|morocco|south-korea|japan|vietnam|thailand|malaysia|turkey|kuwait|oman|taiwan|ireland|united-kingdom|india|germany|romania|ukraine|netherlands|spain|denmark|france|italy|poland|portugal|czech-republic|belgium|sweden|norway|new-zealand|austria|hungary|finland|greece|azerbaijan|georgia|pakistan|australia|luxembourg|switzerland|slovakia|slovenia|croatia|serbia|bulgaria|albania|north-macedonia|montenegro|bosnia-and-herzegovina|kosovo|zambia|zimbabwe|botswana|namibia|algeria|tunisia|mauritius|ghana|angola|drc|mexico|brazil|colombia|argentina|chile|peru|ecuador|panama|costa-rica|dominican-republic|uruguay|guatemala)$/
const CRAWL_LINK_PATTERN = /^\/(?:homeschool-|homeschooling\/)[a-z0-9-]+$/

/* ────────────────────────────────────────────────────────────────
   Local static server — serves dist/ with SPA fallback that matches
   netlify.toml's /* → /index.html redirect.
   ──────────────────────────────────────────────────────────────── */
function startServer() {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      return handler(req, res, {
        public: DIST,
        rewrites: [{ source: '**', destination: '/index.html' }],
        cleanUrls: false,
      })
    })
    server.on('error', reject)
    server.listen(PORT, () => resolve(server))
  })
}

function routeToOutputPath(route) {
  if (route === '/' || route === '') return join(DIST, 'index.html')
  const clean = route.replace(/^\/+|\/+$/g, '')
  // Write FLAT .html files (e.g. dist/online-school/kenya.html) instead of
  // folder-based (dist/online-school/kenya/index.html) so Netlify serves
  // /online-school/kenya at 200 without redirecting to /online-school/kenya/.
  // This prevents Google Search Console 'Page with redirect' and
  // 'Alternative page with proper canonical tag' issues that were caused
  // by folder-based output triggering trailing slash normalization.
  return join(DIST, clean + '.html')
}

function sanitize(html) {
  return html.replace(new RegExp(`http://localhost:${PORT}`, 'g'), 'https://smartioushomeschool.com')
}

/* ────────────────────────────────────────────────────────────────
   Render one route. Returns { success, html?, links?, error? }.
   Each call gets its own page (Puppeteer best practice for parallel
   rendering — tab reuse across concurrent renders causes flakiness).
   ──────────────────────────────────────────────────────────────── */
async function renderRoute(browser, route) {
  let page
  
  try {
    /* newPage() must be inside try — if Chromium has crashed on
       Netlify (memory pressure with large bundle), this throws and
       we want to catch it per-route, not let it kill the build. */
    page = await browser.newPage()
    
    /* Block third-party requests — don't affect output, slow render. */
    await page.setRequestInterception(true)
    page.on('request', req => {
      const url = req.url()
      if (BLOCKED_DOMAINS.some(d => url.includes(d))) {
        return req.abort()
      }
      return req.continue()
    })
    
    /* Silently absorb console errors — they're often analytics-related
       and don't affect the rendered HTML. */
    page.on('pageerror', () => {})
    
    const url = `http://localhost:${PORT}${route}`
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_TIMEOUT_MS,
    })
    
    /* Wait for React to mount. */
    await page.waitForFunction(
      () => document.getElementById('root')?.childElementCount > 0,
      { timeout: PAGE_TIMEOUT_MS },
    )
    
    /* Brief pause for usePageMeta to write canonical/title into <head>. */
    await new Promise(r => setTimeout(r, WAIT_AFTER_MOUNT_MS))
    
    const html = sanitize(await page.content())
    
    /* Discover internal links from v2-depth country hubs only. */
    let links = []
    if (CRAWL_FROM_HUBS_PATTERN.test(route)) {
      links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.getAttribute('href'))
          .filter(Boolean)
      })
    }
    
    return { success: true, html, links }
  } catch (err) {
    return { success: false, error: err.message }
  } finally {
    if (page) await page.close().catch(() => {})
  }
}

/* ────────────────────────────────────────────────────────────────
   Main — set up server + browser, run worker pool, write outputs.
   ──────────────────────────────────────────────────────────────── */
async function prerender() {
  if (!existsSync(DIST)) {
    console.error(`[prerender] dist/ not found — run \`vite build\` first.`)
    process.exit(1)
  }

  const startTime = Date.now()
  console.log(`[prerender] Starting local server on port ${PORT}`)
  const server = await startServer()

  console.log('[prerender] Launching headless Chrome')
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
    ],
  })

  const discovered = new Set(ROUTES_TO_PRERENDER)
  const queue = [...ROUTES_TO_PRERENDER]
  let successCount = 0
  let failCount = 0
  
  console.log(`[prerender] Rendering ${queue.length} initial routes (concurrency=${CONCURRENCY}, max=${MAX_URLS})`)

  const queueLink = (href) => {
    if (discovered.size >= MAX_URLS) return
    if (!CRAWL_LINK_PATTERN.test(href)) return
    if (discovered.has(href)) return
    discovered.add(href)
    queue.push(href)
  }

  /* Worker: pull from queue, render, write, queue any discovered links.
     Run CONCURRENCY workers in parallel. Each shares the browser but
     uses its own page. */
  const runWorker = async (workerId) => {
    while (queue.length > 0) {
      const route = queue.shift()
      if (!route) return
      
      const result = await renderRoute(browser, route)
      
      if (result.success) {
        const outPath = routeToOutputPath(route)
        mkdirSync(dirname(outPath), { recursive: true })
        writeFileSync(outPath, result.html)
        const sizeKB = (result.html.length / 1024).toFixed(0)
        console.log(`[prerender] ✓ ${route} (${sizeKB} KB)`)
        successCount++
        
        for (const href of result.links || []) queueLink(href)
      } else {
        console.warn(`[prerender] ✗ ${route} — ${result.error}`)
        failCount++
      }
    }
  }

  try {
    await Promise.all(
      Array.from({ length: CONCURRENCY }, (_, i) => runWorker(i))
    )
  } finally {
    await browser.close()
    server.close()
  }

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`[prerender] Done in ${elapsedSec}s. ${successCount} succeeded, ${failCount} failed, ${discovered.size} total discovered`)
  
  /* Only fail the build if EVERY route failed — partial failures shouldn't
     block deploy because Netlify SPA fallback still serves the failed routes. */
  if (successCount === 0 && failCount > 0) {
    console.error('[prerender] All routes failed — likely a config issue')
    process.exit(1)
  }
}

prerender().catch(err => {
  console.error('[prerender] Fatal error:', err)
  process.exit(1)
})
