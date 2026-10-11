/**
 * appShell.js — the bridge between the website and the Smartious apps.
 * ============================================================
 * The iOS/Android app (apps/mobile, Capacitor) and the Windows app
 * (apps/desktop, Electron) are thin native shells that load the live
 * portal, so every deploy reaches the apps without a store release.
 * This module is the web side of that contract:
 *
 *   - detects which shell (if any) is hosting the page and tags <html>
 *     with sm-app / sm-ios / sm-android / sm-desktop / sm-standalone,
 *     so app-only styling lives in styles/app.css;
 *   - gives native touch behaviour: haptic ticks, the Android hardware
 *     back button, status-bar colour, hiding the launch splash;
 *   - shows a quiet offline pill instead of a broken page.
 *
 * Everything degrades to a no-op in an ordinary browser.
 */

const UA = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const cap = () => (typeof window !== 'undefined' ? window.Capacitor : undefined)
const plugin = (name) => cap()?.Plugins?.[name]

export const isNativeApp = () =>
  /SmartiousApp/i.test(UA) || !!cap()?.isNativePlatform?.()

export const isDesktopApp = () =>
  /SmartiousDesktop/i.test(UA) || !!(typeof window !== 'undefined' && window.smartiousDesktop)

export const isStandalone = () => {
  try {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      window.navigator.standalone === true
  } catch { return false }
}

/** True inside any installed experience: native app, desktop app or installed PWA. */
export const isAppMode = () => isNativeApp() || isDesktopApp() || isStandalone()

export const platform = () => {
  const p = cap()?.getPlatform?.()
  if (p && p !== 'web') return p
  if (isDesktopApp()) return 'desktop'
  if (/iPhone|iPad|iPod/.test(UA)) return 'ios'
  if (/Android/.test(UA)) return 'android'
  return 'web'
}

/** A light tap of the Taptic Engine / vibration motor. */
export function haptic(kind = 'light') {
  const h = plugin('Haptics')
  try {
    if (h) {
      if (kind === 'select') return void h.selectionChanged?.()
      if (kind === 'success' || kind === 'warning' || kind === 'error')
        return void h.notification?.({ type: kind.toUpperCase() })
      return void h.impact?.({ style: kind === 'medium' ? 'MEDIUM' : 'LIGHT' })
    }
    if (isAppMode() && navigator.vibrate) navigator.vibrate(kind === 'medium' ? 12 : 6)
  } catch { /* haptics are decoration; never let them throw */ }
}

let booted = false

export function bootAppShell() {
  if (booted || typeof document === 'undefined') return
  booted = true
  const root = document.documentElement
  const p = platform()
  if (isAppMode()) root.classList.add('sm-app')
  if (isNativeApp()) root.classList.add('sm-native')
  if (isStandalone()) root.classList.add('sm-standalone')
  if (p !== 'web') root.classList.add('sm-' + p)

  if (!isAppMode()) return

  // Haptic tick on navigation controls. Opt-in by selector so ordinary
  // buttons stay silent — a buzz on every tap quickly feels cheap.
  document.addEventListener('pointerdown', (e) => {
    const el = e.target?.closest?.('[data-haptic], .nav-item, .sm-tab')
    if (el) haptic(el.getAttribute('data-haptic') || 'select')
  }, { passive: true })

  // Status bar: ivory, matching the portals' top bars, with dark icons
  // ('LIGHT' is Capacitor's name for the light-background style).
  const sb = plugin('StatusBar')
  try {
    sb?.setStyle?.({ style: 'LIGHT' })
    if (p === 'android') sb?.setBackgroundColor?.({ color: '#FBFAF5' })
  } catch {}

  // Android back button: walk back through the app, and only leave
  // (minimise, not kill) from the first screen.
  const App = plugin('App')
  try {
    App?.addListener?.('backButton', ({ canGoBack }) => {
      // Portals keep their page in React state, not the URL, so they get
      // first refusal: close a drawer, or step back to the dashboard.
      const ev = new CustomEvent('sm-back', { cancelable: true })
      window.dispatchEvent(ev)
      if (ev.defaultPrevented) return
      if (canGoBack && window.history.length > 1) window.history.back()
      else App.minimizeApp?.()
    })
  } catch {}

  if (isNativeApp()) interceptDownloads(p)

  // Offline pill.
  const pill = document.createElement('div')
  pill.className = 'sm-offline-pill'
  pill.setAttribute('role', 'status')
  pill.textContent = "You're offline — showing what's saved"
  const sync = () => pill.classList.toggle('show', navigator.onLine === false)
  window.addEventListener('online', sync)
  window.addEventListener('offline', sync)
  document.body.appendChild(pill)
  sync()
}

/**
 * A phone's WebView ignores <a download> for files the page generated
 * itself (blob:/data: URLs: report PDFs, CSVs, Studio exports). Hand those
 * to the app: Android saves to Downloads through the SmartiousAndroid
 * bridge (apps/mobile/scripts/patch-native.mjs), iOS opens the share
 * sheet, where "Save to Files" is the native way to keep a file.
 */
function interceptDownloads(p) {
  const wants = (a) => a && a.hasAttribute?.('download') && /^(blob|data):/.test(a.href || '')
  const save = async (a) => {
    const name = a.getAttribute('download') || 'download'
    try {
      const blob = await (await fetch(a.href)).blob()
      if (p === 'android' && window.SmartiousAndroid?.save) {
        const b64 = await new Promise((res, rej) => {
          const r = new FileReader()
          r.onload = () => res(String(r.result).split(',')[1] || '')
          r.onerror = rej
          r.readAsDataURL(blob)
        })
        window.SmartiousAndroid.save(b64, name, blob.type || 'application/octet-stream')
        haptic('success')
        return
      }
      const file = new File([blob], name, { type: blob.type || 'application/octet-stream' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: name })
      else window.open(a.href, '_blank')
    } catch (e) {
      if (e?.name !== 'AbortError') console.warn('[app] download failed', e)
    }
  }
  // Pages revoke the object URL right after click(); the save above reads it
  // asynchronously, so give it a minute first.
  const revoke = URL.revokeObjectURL.bind(URL)
  URL.revokeObjectURL = (u) => { setTimeout(() => revoke(u), 60000) }
  // Links in the page…
  document.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a')
    if (!wants(a)) return
    e.preventDefault()
    save(a)
  }, true)
  // …and the usual createElement('a').click() pattern, which never reaches
  // the document because the anchor is not attached to it.
  const A = window.HTMLAnchorElement
  const click = A.prototype.click
  A.prototype.click = function () {
    if (!this.isConnected && wants(this)) return void save(this)
    return click.call(this)
  }
}

/** Call once the first screen has painted, so the splash hands over without a flash. */
export function appReady() {
  try { plugin('SplashScreen')?.hide?.({ fadeOutDuration: 250 }) } catch {}
  try { window.smartiousDesktop?.ready?.() } catch {}
}
