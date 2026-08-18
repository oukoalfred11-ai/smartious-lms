/* ═══════════════════════════════════════════════════════════════════
   Storage shim — MUST be the first import in main.jsx.

   In-app browsers (WhatsApp, Instagram, Facebook) and phones set to
   "block cookies / site data" deny ALL access to localStorage: even
   reading window.localStorage throws a SecurityError. The app touches
   storage during startup (saved login token, preferences), so on those
   browsers it crashed before React could mount — the "Smartious
   Startup Error: Failed to read the localStorage property" screen a
   parent hit when opening the site from a WhatsApp link.

   This shim probes storage once. If the browser denies it, the shim
   installs an in-memory replacement with the same API, so every
   localStorage call in the app simply works. The only difference the
   user sees: nothing persists after the tab closes, so they stay
   logged in for the session but log in again next visit — which is
   exactly how a privacy-locked browser should behave.
═══════════════════════════════════════════════════════════════════ */
;(function installStorageShim() {
  const makeMemoryStorage = () => {
    let store = {}
    return {
      getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
      setItem: (k, v) => { store[String(k)] = String(v) },
      removeItem: (k) => { delete store[String(k)] },
      clear: () => { store = {} },
      key: (i) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length },
    }
  }

  const ensure = (name) => {
    try {
      const s = window[name]
      const probe = '__sm_probe__'
      s.setItem(probe, '1')          // also catches "quota 0" private modes
      s.removeItem(probe)
    } catch (err) {
      try {
        Object.defineProperty(window, name, {
          value: makeMemoryStorage(),
          configurable: true,
        })
        console.warn('[Smartious] ' + name + ' is blocked by this browser; using in-memory storage for this session.')
      } catch (err2) {
        // Nothing more we can do; the app's own try/catches take over.
      }
    }
  }

  ensure('localStorage')
  ensure('sessionStorage')
})()
