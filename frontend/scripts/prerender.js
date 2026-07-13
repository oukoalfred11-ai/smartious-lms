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
  '/homeschool', '/tuition', '/tuition-nairobi', '/tuition-uae',
  '/tuition-uk',
  '/iufp', '/pre-university',
  '/alberta-home-ed-funding',
  '/bc-distributed-learning-funding',
  '/saskatchewan-homeschool-funding',
  '/privacy', '/terms', '/cookies', '/gdpr',

  /* v2-depth country hubs (full <CountryHub> rendering) */
  '/online-school/kenya',
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

  /* Topical cluster articles (Malaysia — will scale to other countries) */
  '/online-igcse-malaysia',
  '/ossd-malaysia',
  '/international-school-alternative-malaysia',
  '/branch-campus-universities-malaysia',

  /* Country detail pages (lighter template, from COUNTRIES list) */
  '/online-school/usa',
  '/online-school/canada',
  '/online-school/uk',
  '/online-school/australia',
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
const CRAWL_FROM_HUBS_PATTERN = /^\/online-school\/(kenya|ethiopia|rwanda|south-africa|qatar|saudi-arabia|uae|egypt|morocco|south-korea|japan|vietnam|thailand|malaysia|turkey|kuwait|oman|taiwan|ireland|united-kingdom|india|germany)$/
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
  return join(DIST, clean, 'index.html')
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
