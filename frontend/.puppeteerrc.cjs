/* ──────────────────────────────────────────────────────────────────
   Puppeteer configuration.
   
   Default cache directory (~/.cache/puppeteer on Linux, or
   /opt/buildhome/.cache/puppeteer on Netlify) is NOT persisted
   between Netlify build steps, so Chrome that gets downloaded during
   `npm install` is gone by the time the postbuild prerender step
   tries to launch it.
   
   Workaround: cache inside node_modules/, which Netlify DOES persist
   across builds via its standard build cache. First build downloads
   Chrome (~150 MB, ~30s); subsequent builds reuse the cached binary.
   
   The .cjs extension is required because package.json has
   `"type": "module"` — .js files would be parsed as ESM and the
   `module.exports` syntax would break. Keep this file as .cjs.
   ────────────────────────────────────────────────────────────────── */

const { join } = require('path')

module.exports = {
  cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
}
