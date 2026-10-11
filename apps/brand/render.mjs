// Renders the app icons and splash screens from crest.mjs.
//   node apps/brand/render.mjs        (needs Playwright + Chromium)
// Outputs are committed, so this only needs re-running when the art changes.
import { createRequire } from 'module'
import { mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { placeCrest } from './crest.mjs'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')
const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..', '..')

const ivoryBg = (s) => `
  <defs>
    <radialGradient id="iv" cx=".5" cy=".38" r=".75">
      <stop offset="0" stop-color="#FFFEFB"/><stop offset="1" stop-color="#F1E8D8"/>
    </radialGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#iv)"/>`

const crimsonBg = (s) => `
  <defs>
    <radialGradient id="cr" cx=".5" cy=".42" r=".8">
      <stop offset="0" stop-color="#9A1B33"/><stop offset=".6" stop-color="#6E1022"/><stop offset="1" stop-color="#3E0712"/>
    </radialGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#cr)"/>`

// Full-bleed square icon: iOS, Windows, PWA "any".
const icon = (s, crestH = 0.62) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  ${ivoryBg(s)}${placeCrest(s / 2, s / 2 + s * 0.01, s * crestH, 'i')}</svg>`

// Android adaptive foreground: crest inside the 66% safe circle, transparent around it.
const foreground = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  ${placeCrest(s / 2, s / 2 + s * 0.008, s * 0.5, 'f')}</svg>`

const solid = (s, c) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="${s}" height="${s}" fill="${c}"/></svg>`

// Splash: crest and wordmark on deep crimson. Kept inside the central
// third so every phone and tablet crop still shows all of it.
const splash = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  ${crimsonBg(s)}
  ${placeCrest(s / 2, s / 2 - 120, 520, 's')}
  <text x="${s / 2}" y="${s / 2 + 290}" text-anchor="middle" font-family="Caladea, Georgia, serif" font-size="150" fill="#FBF6EA" font-weight="700">Smart<tspan font-style="italic" font-weight="400" fill="#E9C766">ious</tspan></text>
  <text x="${s / 2}" y="${s / 2 + 380}" text-anchor="middle" font-family="Inter, sans-serif" font-size="40" letter-spacing="14" fill="#E9C766" fill-opacity=".85" font-weight="600">HOMESCHOOL · GLOBAL</text>
</svg>`

const jobs = [
  // Capacitor (@capacitor/assets) sources
  ['apps/mobile/assets/icon-only.png', icon(1024)],
  ['apps/mobile/assets/icon-foreground.png', foreground(1024)],
  ['apps/mobile/assets/icon-background.png', solid(1024, '#FBF6EC')],
  ['apps/mobile/assets/splash.png', splash(2732)],
  ['apps/mobile/assets/splash-dark.png', splash(2732)],
  // Windows app
  ['apps/desktop/build/icon.png', icon(1024)],
  // Installed web app + iOS home screen
  ['frontend/public/icons/icon-512.png', icon(512)],
  ['frontend/public/icons/icon-192.png', icon(192)],
  ['frontend/public/icons/maskable-512.png', icon(512, 0.5)],
  ['frontend/public/apple-touch-icon.png', icon(180)],
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const [out, svg] of jobs) {
  const size = Number(svg.match(/width="(\d+)"/)[1])
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`)
  await page.evaluate(() => document.fonts.ready)
  const file = resolve(root, out)
  mkdirSync(dirname(file), { recursive: true })
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } })
  console.log('wrote', out)
}
await browser.close()
