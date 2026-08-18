import './lib/storageShim.js'   // MUST stay first: keeps the app booting when a browser blocks localStorage (WhatsApp/Instagram in-app browsers, blocked-cookies settings)
import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

/* ═══════════════════════════════════════════════════════════════════
   Global error boundary — catches any React render crash and shows a
   readable error instead of a blank page. Unchanged from prior version.
═══════════════════════════════════════════════════════════════════ */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  componentDidCatch(e, info) { console.error('React crash:', e, info) }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#0f172a', color: '#fff', minHeight: '100vh' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ color: '#f87171', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
              Smartious — Startup Error
            </div>
            <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, marginBottom: 20, color: '#fca5a5', fontSize: 14, lineHeight: 1.7 }}>
              {this.state.error.toString()}
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
              This error prevents the app from loading. Common causes:
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Old cached files — delete node_modules/.vite/ and restart</li>
                <li>Wrong file replaced — check all files match the ZIP</li>
                <li>Missing import — a component references something that doesnt exist</li>
              </ul>
            </div>
            <button onClick={() => { localStorage.clear(); window.location.reload() }}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              Clear Cache &amp; Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
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
const AUTHENTICATED_PREFIXES = ['/admin', '/teacher', '/student', '/parent', '/login']
const isAuthedRoute = AUTHENTICATED_PREFIXES.some(p =>
  window.location.pathname === p || window.location.pathname.startsWith(p + '/'))

if (container.hasChildNodes() && !isAuthedRoute) {
  hydrateRoot(container, tree)
} else {
  // Clear any prerendered markup so React does not paint it twice.
  if (isAuthedRoute) container.innerHTML = ''
  createRoot(container).render(tree)
}
