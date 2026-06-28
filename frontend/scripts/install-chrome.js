/* ──────────────────────────────────────────────────────────────────
   install-chrome.js — postinstall hook.
   
   Ensures Chrome is downloaded for Puppeteer after `npm install`.
   Netlify's default puppeteer cache path isn't preserved between
   install and postbuild steps, so we use .puppeteerrc.cjs to cache
   inside node_modules/ (which Netlify DOES preserve) and run the
   official `puppeteer browsers install` command explicitly here.
   
   This script is idempotent — if Chrome is already cached, the
   install command skips the download. Safe to run on every install.
   
   Failure is non-fatal: if Chrome can't download for any reason,
   we warn but don't fail npm install. The prerender step will then
   fail with a clear error and the build operator can investigate.
   ────────────────────────────────────────────────────────────────── */

import { spawnSync } from 'node:child_process'

console.log('[postinstall] Installing Chrome for Puppeteer (idempotent — fast if cached)...')

const result = spawnSync(
  'npx',
  ['puppeteer', 'browsers', 'install', 'chrome'],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
)

if (result.status !== 0) {
  console.warn('[postinstall] Chrome install command exited with status', result.status)
  console.warn('[postinstall] Prerender step may fail. Continuing npm install.')
  // Exit 0 — don't fail npm install. Let the build try to proceed.
  process.exit(0)
}

console.log('[postinstall] Chrome ready at', process.env.PUPPETEER_CACHE_DIR || 'node_modules/.cache/puppeteer')
