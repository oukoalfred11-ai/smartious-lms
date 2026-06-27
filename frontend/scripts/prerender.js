/* ═══════════════════════════════════════════════════════════════════
   prerender.js — Build-time static HTML generator for SEO routes.
   ───────────────────────────────────────────────────────────────────
   Runs after `vite build` completes (as `npm run postbuild`).
   
   For each public-facing route, Puppeteer:
     1. Loads dist/index.html in a headless browser
     2. Navigates to the route (so React Router renders the matching page)
     3. Waits for React to mount and for usePageMeta to set title/canonical
     4. Captures the full rendered HTML
     5. Writes it to dist/<route>/index.html
   
   Netlify then serves the prerendered HTML directly when crawlers
   (or users) request that URL. The SPA fallback redirect /* → /index.html
   in netlify.toml only fires for routes that have no prerendered file
   (e.g. dynamically-routed pages that aren't in this list).
   
   Adding a new public route: drop it into ROUTES_TO_PRERENDER.
   The build is idempotent — re-running just overwrites previous snapshots.
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
const PORT = 5051  /* avoid collision with `vite preview` default 4173 */

/* ────────────────────────────────────────────────────────────────
   Routes to prerender. These are the SEO-critical public pages.
   Keep in sync with the sitemap generator's STATIC_PAGES + the
   country hubs list. City pages and other dynamic routes will be
   discovered via internal link-following (see CRAWL_FROM_HUBS).
   
   Pages NOT to include: auth-gated routes (/login, /dashboard),
   API routes, anything that requires a logged-in session.
   ──────────────────────────────────────────────────────────────── */
const ROUTES_TO_PRERENDER = [
  /* Static top-level */
  '/',
  '/about', '/curricula', '/services', '/programs', '/pricing', '/teachers',
  '/global', '/contact', '/faq', '/enroll', '/consult',
  '/calendar', '/events', '/gallery', '/activities',
  '/blog', '/test-prep', '/languages', '/study-abroad',
  '/homeschool', '/tuition', '/tuition-nairobi', '/tuition-uae',
  '/iufp', '/pre-university',
  '/alberta-home-ed-funding',
  '/bc-distributed-learning-funding',
  '/saskatchewan-homeschool-funding',
  '/privacy', '/terms', '/cookies', '/gdpr',

  /* Country hubs — v2-depth (full <CountryHub> rendering) */
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

  /* Country detail pages (broader COUNTRIES list, lighter template) */
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

  /* Test prep details (in sitemap) */
  '/test-prep/ielts',
  '/test-prep/toefl',
  '/test-prep/pte',
  '/test-prep/gre',
  '/test-prep/gmat',
  '/test-prep/sat',
]

/* Hub pages whose internal links should be followed and prerendered
   too. This catches the country city pages without listing all 80+
   of them explicitly. Set CRAWL_FROM_HUBS=false to disable. */
const CRAWL_FROM_HUBS = true
const CRAWL_LINK_PATTERN = /^\/(?:homeschool-|homeschooling\/)/  /* country city URLs */

/* Per-page render timeout. The hub pages are heavy (lots of JSON-LD,
   structured data, dozens of sections) so allow generous time. */
const PAGE_TIMEOUT_MS = 45_000
const WAIT_AFTER_MOUNT_MS = 800  /* let usePageMeta finish setting canonical/title */

/* ────────────────────────────────────────────────────────────────
   Local static server — serves dist/ on PORT so Puppeteer can hit
   real URLs (file:// breaks SPA routing). The SPA fallback rewrites
   any non-file request to /index.html, matching Netlify's behaviour.
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

/* Convert a route path to its output file path under dist/.
   '/' → 'dist/index.html'  (overwrite the root)
   '/about' → 'dist/about/index.html'
   '/online-school/egypt' → 'dist/online-school/egypt/index.html' */
function routeToOutputPath(route) {
  if (route === '/' || route === '') return join(DIST, 'index.html')
  const clean = route.replace(/^\/+|\/+$/g, '')
  return join(DIST, clean, 'index.html')
}

/* Sanitize the rendered HTML before writing:
   - Strip any Puppeteer artifacts
   - Ensure no localhost URLs leaked into the output
   - Keep React's hydration data attributes intact */
function sanitize(html) {
  return html.replace(new RegExp(`http://localhost:${PORT}`, 'g'), 'https://smartioushomeschool.com')
}

/* ────────────────────────────────────────────────────────────────
   Main.
   ──────────────────────────────────────────────────────────────── */
async function prerender() {
  if (!existsSync(DIST)) {
    console.error(`[prerender] dist/ not found — run \`vite build\` first.`)
    process.exit(1)
  }

  console.log('[prerender] Starting local server on port', PORT)
  const server = await startServer()

  console.log('[prerender] Launching headless Chrome')
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  const discovered = new Set(ROUTES_TO_PRERENDER)
  const completed = new Set()
  const queue = [...ROUTES_TO_PRERENDER]
  let successCount = 0
  let failCount = 0

  try {
    while (queue.length > 0) {
      const route = queue.shift()
      if (completed.has(route)) continue
      completed.add(route)

      const url = `http://localhost:${PORT}${route}`
      const page = await browser.newPage()
      page.setDefaultTimeout(PAGE_TIMEOUT_MS)

      /* Mute most console noise from the rendered page, but keep errors. */
      page.on('pageerror', err => {
        console.warn(`[prerender] ${route} JS error: ${err.message}`)
      })

      try {
        await page.goto(url, { waitUntil: 'networkidle0' })

        /* Wait for React to mount — #root must have children. */
        await page.waitForFunction(
          () => document.getElementById('root')?.childElementCount > 0,
          { timeout: PAGE_TIMEOUT_MS },
        )

        /* Give usePageMeta a moment to write canonical/title into <head>. */
        await new Promise(r => setTimeout(r, WAIT_AFTER_MOUNT_MS))

        const html = sanitize(await page.content())

        /* Optionally crawl internal links to discover city/dynamic routes. */
        if (CRAWL_FROM_HUBS && route.startsWith('/online-school/')) {
          const internalLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href]'))
              .map(a => a.getAttribute('href'))
              .filter(Boolean)
          })
          for (const href of internalLinks) {
            if (CRAWL_LINK_PATTERN.test(href) && !discovered.has(href)) {
              discovered.add(href)
              queue.push(href)
            }
          }
        }

        const outPath = routeToOutputPath(route)
        mkdirSync(dirname(outPath), { recursive: true })
        writeFileSync(outPath, html)
        console.log(`[prerender] ✓ ${route} (${(html.length / 1024).toFixed(0)} KB)`)
        successCount++
      } catch (err) {
        console.warn(`[prerender] ✗ ${route} — ${err.message}`)
        failCount++
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
    server.close()
  }

  console.log(`[prerender] Done. ${successCount} succeeded, ${failCount} failed, ${discovered.size} total discovered`)
  if (failCount > 0 && successCount === 0) {
    /* All routes failed — likely a config issue, fail the build. */
    process.exit(1)
  }
}

prerender().catch(err => {
  console.error('[prerender] Fatal error:', err)
  process.exit(1)
})
