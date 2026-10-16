/* chunkReload.js — recover when a deploy has replaced the app's files.
 *
 * The portals and pages are separate files whose names change on every
 * build (OpsPortal-2vCeDPIg.js). A tab opened before a deploy still asks
 * for the old names, which no longer exist, and the import fails. The fix
 * is to load the page again, which fetches the new index.html and the new
 * file names. Reloads are limited to one per 30 seconds per tab, so a file
 * that is genuinely missing shows the error screen instead of looping.
 */
const KEY = 'sm_chunk_reload_at'

export const isChunkError = (e) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Loading (CSS )?chunk .* failed|Unable to preload CSS/i
    .test(String(e?.message || e || ''))

/** Reload once to pick up the new build. Returns false if we reloaded very recently. */
export function reloadForNewVersion() {
  let last = 0
  try { last = Number(sessionStorage.getItem(KEY)) || 0 } catch {}
  if (Date.now() - last < 30000) return false
  try { sessionStorage.setItem(KEY, String(Date.now())) } catch {}
  window.location.reload()
  return true
}

/** Drop the service worker's caches and worker, then reload (keeps the user signed in). */
export async function hardReload() {
  try { const keys = await caches.keys(); await Promise.all(keys.filter(k => k.startsWith('sm-')).map(k => caches.delete(k))) } catch {}
  try { const regs = await navigator.serviceWorker?.getRegistrations?.(); await Promise.all((regs || []).map(r => r.unregister())) } catch {}
  try { sessionStorage.removeItem(KEY) } catch {}
  window.location.reload()
}

/** Vite fires vite:preloadError when a dynamic import or its CSS fails to load. */
export function installChunkRecovery() {
  if (typeof window === 'undefined') return
  window.addEventListener('vite:preloadError', (e) => { if (reloadForNewVersion()) e.preventDefault() })
}
