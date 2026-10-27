import './lib/storageShim.js'   // MUST stay first: keeps the app booting when a browser blocks localStorage (WhatsApp/Instagram in-app browsers, blocked-cookies settings)
import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import './styles/app.css'
import { bootAppShell, appReady, isAppMode } from './lib/appShell.js'
import { installChunkRecovery, isChunkError, reloadForNewVersion, hardReload } from './lib/chunkReload.js'

installChunkRecovery()

bootAppShell()

// Inside the apps the marketing homepage is not a destination: the
// app is the portal. Rewrite before React mounts so nothing flashes.
if (isAppMode() && window.location.pathname === '/') {
  window.history.replaceState(null, '', '/portal' + window.location.search)
}

/* ═══════════════════════════════════════════════════════════════════
   Global error boundary — catches any React render crash and shows a
   readable message instead of a blank page. A failed load of one of the
   app's files almost always means a new version was deployed while this
   tab was open: reload once to pick it up (lib/chunkReload.js).
═══════════════════════════════════════════════════════════════════ */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null, reloading: false } }
  static getDerivedStateFromError(e) { return { error: e } }
  componentDidCatch(e, info) {
    console.error('React crash:', e, info)
    // Reported to the server log (index.html watchdog's sender).
    if (!isChunkError(e)) { try { window.__smReportError?.('react-crash', e && e.message, (e && e.stack || '') + ' | ' + (info?.componentStack || '').slice(0, 300)) } catch (x) { /* noop */ } }
    if (isChunkError(e) && reloadForNewVersion()) this.setState({ reloading: true })
  }
  render() {
    const { error, reloading } = this.state
    if (!error) return this.props.children
    const update = isChunkError(error)
    const btn = { border: 'none', padding: '12px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 700 }
    return (
      <div style={{ padding: '48px 20px', fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', background: '#FDFAF4', color: '#080C14', minHeight: '100vh', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', background: '#fff', border: '1px solid #F0E8D4', borderRadius: 14, padding: 28 }}>
          <div style={{ color: '#8B1A2E', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
            {update ? 'Smartious has been updated' : 'Something went wrong'}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#2E3D55', margin: '0 0 18px' }}>
            {reloading ? 'Loading the latest version…'
              : update ? 'A new version of Smartious was released while this page was open. Reload to continue; your work and sign-in are kept.'
                : 'This page could not be shown. Reloading usually fixes it. If it keeps happening, contact support and mention the message below.'}
          </p>
          {!reloading && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => window.location.reload()} style={{ ...btn, background: '#8B1A2E', color: '#fff' }}>Reload</button>
              <button onClick={hardReload} style={{ ...btn, background: '#fff', color: '#8B1A2E', border: '1px solid #8B1A2E' }}>Clear cached files &amp; reload</button>
            </div>
          )}
          {!update && <pre style={{ marginTop: 18, whiteSpace: 'pre-wrap', fontSize: 12, color: '#6B6B6B', background: '#F8F2E6', borderRadius: 8, padding: 12 }}>{String(error)}</pre>}
        </div>
      </div>
    )
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Conditional hydration for prerendered HTML.
   
   scripts/prerender.js writes fully-rendered HTML into dist/<route>/index.html
   for each public route at build time. When a visitor (or crawler) loads
   that page, React must HYDRATE the existing DOM rather than render from
   scratch — otherwise React discards the prerendered HTML and the page
   flickers blank for one frame before re-rendering.
   
   We detect prerendered content by checking whether #root has any
   children. If yes, the HTML came from prerender and we hydrate. If no
   (e.g. during dev, or a dynamic route not in the prerender include
   list), we render fresh.
═══════════════════════════════════════════════════════════════════ */
const container = document.getElementById('root')

// Static text baked in by scripts/seo-static.mjs for crawlers; the app
// renders the real page now, so drop it.
document.getElementById('seo-static')?.remove()

// The static JSON-LD in <head> (marked data-ss) describes the URL the visit
// started on. Once the app renders its own block of the same @type, drop the
// static one, so Google never sees two FAQPage or BreadcrumbList blocks;
// drop them all on the first client-side navigation, when they no longer
// describe the page.
{
  const staticLd = [...document.querySelectorAll('script[type="application/ld+json"][data-ss]')]
  if (staticLd.length) {
    const firstPath = window.location.pathname
    const typeOf = (el) => { try { return String(JSON.parse(el.textContent)['@type']) } catch { return '' } }
    let queued = false
    const observer = new MutationObserver(() => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        const moved = window.location.pathname !== firstPath
        const live = new Set([...document.querySelectorAll('script[type="application/ld+json"]:not([data-ss])')].map(typeOf))
        for (const el of staticLd) if (el.isConnected && (moved || live.has(typeOf(el)))) el.remove()
        if (staticLd.every(el => !el.isConnected)) observer.disconnect()
      })
    })
    observer.observe(container, { childList: true, subtree: true })
  }
}
const tree = <ErrorBoundary><App /></ErrorBoundary>

/* Hydrate ONLY on prerendered public routes.
 *
 * The old test was "does #root have children" — but Netlify's SPA
 * fallback serves the prerendered index.html for ANY unmatched path,
 * including /admin and the portals. Those were prerendered logged-OUT,
 * so hydrating them against a logged-IN render mismatches on every node:
 * React throws #418 (text content mismatch), then #423 as it gives up and
 * re-renders client-side.
 *
 * The page still worked — React recovers — but it threw on every load and
 * discarded the prerendered HTML anyway, so hydration bought nothing.
 *
 * Authenticated routes now always render fresh, which is both correct and
 * what was effectively happening after React bailed out.
 */
const AUTHENTICATED_PREFIXES = ['/admin', '/teacher', '/student', '/parent', '/login', '/portal']
const isAuthedRoute = AUTHENTICATED_PREFIXES.some(p =>
  window.location.pathname === p || window.location.pathname.startsWith(p + '/'))

if (container.hasChildNodes() && !isAuthedRoute) {
  hydrateRoot(container, tree)
} else {
  // Clear any prerendered markup so React does not paint it twice.
  if (isAuthedRoute) container.innerHTML = ''
  createRoot(container).render(tree)
}

// Hand over from the native splash once the first frame is on screen.
requestAnimationFrame(() => requestAnimationFrame(appReady))
