/* ═══════════════════════════════════════════════════════════════════
   seoTitles.js — short <title>s for country hubs, Nairobi tuition areas
   and guides
   ───────────────────────────────────────────────────────────────────
   Google shows about 60 characters of a title. Many hub, tuition-area and
   guide titles ran to 75–125 characters, so the query words came first
   but the rest was cut or rewritten. These helpers keep every title at
   60 characters or less: primary query first, "| Smartious" last only
   when it still fits.

   Used by LandingPage.jsx (usePageMeta) and scripts/seo-static.mjs, so
   the app and the static HTML carry the same title.
═══════════════════════════════════════════════════════════════════ */

const MAX = 60
const BRAND = ' | Smartious'
// First candidate that fits; the last one is the fallback.
const fit = (...c) => c.filter(Boolean).find(t => t.length <= MAX) || c.filter(Boolean).pop()

// ── Country hubs (/online-school/<slug>) ─────────────────────
// [slug, name as used in the title, 1 = homeschool hub (the page's
// existing title already targeted "homeschool"), 0 = online-school /
// international-curriculum hub]
const HUBS = [
  ['albania', 'Albania', 0], ['algeria', 'Algeria', 0], ['angola', 'Angola', 0], ['argentina', 'Argentina', 0],
  ['australia', 'Australia', 1], ['austria', 'Austria', 1], ['azerbaijan', 'Azerbaijan', 1], ['bangladesh', 'Bangladesh', 0],
  ['belgium', 'Belgium', 1], ['bolivia', 'Bolivia', 0], ['bosnia-and-herzegovina', 'Bosnia and Herzegovina', 0], ['botswana', 'Botswana', 0],
  ['brazil', 'Brazil', 0], ['bulgaria', 'Bulgaria', 1], ['canada', 'Canada', 1], ['chile', 'Chile', 0],
  ['china', 'Hong Kong & China', 0], ['colombia', 'Colombia', 0], ['costa-rica', 'Costa Rica', 0], ['croatia', 'Croatia', 0],
  ['cyprus', 'Cyprus', 0], ['czech-republic', 'the Czech Republic', 1], ['denmark', 'Denmark', 1], ['dominican-republic', 'the Dominican Republic', 0],
  ['drc', 'DR Congo', 0], ['ecuador', 'Ecuador', 0], ['egypt', 'Egypt', 1], ['ethiopia', 'Ethiopia', 1],
  ['finland', 'Finland', 1], ['france', 'France', 1], ['georgia', 'Georgia', 1], ['germany', 'Germany', 1],
  ['ghana', 'Ghana', 0], ['greece', 'Greece', 0], ['guatemala', 'Guatemala', 0], ['hungary', 'Hungary', 1],
  ['india', 'India', 1], ['iraq', 'Iraq', 0], ['ireland', 'Ireland', 1], ['israel', 'Israel', 0],
  ['italy', 'Italy', 1], ['japan', 'Japan', 1], ['jordan', 'Jordan', 0], ['kosovo', 'Kosovo', 0],
  ['lebanon', 'Lebanon', 0], ['luxembourg', 'Luxembourg', 1], ['malaysia', 'Malaysia', 1], ['maldives', 'the Maldives', 0],
  ['mauritius', 'Mauritius', 0], ['mexico', 'Mexico', 0], ['montenegro', 'Montenegro', 1], ['morocco', 'Morocco', 1],
  ['myanmar', 'Myanmar', 0], ['namibia', 'Namibia', 1], ['nepal', 'Nepal', 0], ['netherlands', 'the Netherlands', 0],
  ['new-zealand', 'New Zealand', 1], ['north-macedonia', 'North Macedonia', 0], ['norway', 'Norway', 1], ['pakistan', 'Pakistan', 1],
  ['panama', 'Panama', 0], ['paraguay', 'Paraguay', 0], ['peru', 'Peru', 0], ['poland', 'Poland', 1],
  ['portugal', 'Portugal', 1], ['puerto-rico', 'Puerto Rico', 0], ['romania', 'Romania', 1], ['rwanda', 'Rwanda', 1],
  ['serbia', 'Serbia', 1], ['slovakia', 'Slovakia', 1], ['slovenia', 'Slovenia', 1], ['somalia', 'Somalia', 1],
  ['south-africa', 'South Africa', 1], ['south-korea', 'South Korea', 1], ['spain', 'Spain', 1], ['sweden', 'Sweden', 1],
  ['switzerland', 'Switzerland', 1], ['taiwan', 'Taiwan', 1], ['tanzania', 'Tanzania', 1], ['thailand', 'Thailand', 1],
  ['tunisia', 'Tunisia', 0], ['turkey', 'Türkiye', 1], ['uganda', 'Uganda', 1], ['ukraine', 'Ukraine', 1],
  ['united-kingdom', 'the UK', 1], ['uruguay', 'Uruguay', 0], ['usa', 'the USA', 1], ['venezuela', 'Venezuela', 0],
  ['vietnam', 'Vietnam', 1], ['zambia', 'Zambia', 0], ['zimbabwe', 'Zimbabwe', 0],
]
export function hubTitle(name, homeschool) {
  if (homeschool) {
    const k = 'Homeschooling & Online School in ' + name
    return fit(k + BRAND, k, 'Online School & Homeschool in ' + name)
  }
  const k = 'Online School in ' + name
  return fit(k + ' | IGCSE & A-Level' + BRAND, k + ' | IGCSE & A-Level', k + BRAND, k)
}
// path → title, for the hubs whose titles were over 60 characters
export const HUB_TITLES = Object.fromEntries(HUBS.map(([slug, name, h]) => ['/online-school/' + slug, hubTitle(name, h)]))
HUB_TITLES['/online-school/uae'] = 'Homeschooling & Online School in Dubai & UAE | Smartious'

// ── Nairobi tuition areas (/tuition/<slug>) ──────────────────
// Keeps the area's own wording: "Tuition Along Thika Road", and no
// ", Nairobi" for areas whose title never said Nairobi (Ruaka, Syokimau,
// Kitengela are outside the city).
export const nairobiAreaTitle = (area) => {
  const old = String(area.seoTitle || '')
  const along = /^Tuition Along /.test(old)
  const inNairobi = !old || new RegExp('^Tuition (?:in|Along) ' + area.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ',? Nairobi').test(old)
  const k = (along ? 'Tuition Along ' : 'Tuition in ') + area.name + (inNairobi ? ', Nairobi' : '')
  return fit(k + ' | Home & Online Tutors' + BRAND, k + ' | Home & Online Tutors', k + BRAND, k)
}

// ── Guides (/blog/<slug>) ────────────────────────────────────
// Takes the article's metaTitle (or its title), drops any brand suffix,
// then keeps as much as fits: the whole title; else the part before the
// colon (or " | ") plus the longest run of whole subtitle phrases; else
// the part before the colon. "| Smartious" is added only when it still
// fits. Titles that name accreditation or recognition, or that lead with
// the brand, are left exactly as written.
const BRAND_SUFFIX = /\s*(?:[|—–-]\s*)?Smartious(?: Homeschool(?: (?:&|and) eSchool| Global)?)?\s*$/i
const SEP = /( — | – |, )/
const KEEP = /accredit|recogni|licens/i
export function guideTitle(metaTitle, t) {
  const original = String(metaTitle || t || 'Article').replace(/\s+/g, ' ').trim()
  if (KEEP.test(original) || /^Smartious\b/.test(original)) return original
  let full = original
  const stripped = full.replace(BRAND_SUFFIX, '').trim()
  if (stripped.length >= 15) full = stripped
  if (full.length + BRAND.length <= MAX) return full + BRAND
  if (full.length <= MAX) return full
  const paren = full.replace(/\s*\([^()]*\)$/, '')            // "… (2026 Guide)"
  if (paren !== full && paren.length >= 20) {
    if (paren.length <= MAX) return fit(paren + BRAND, paren)
    full = paren
  }
  const m = /: | \| /.exec(full)
  if (m && m.index >= 22) {
    const head = full.slice(0, m.index)
    const parts = full.slice(m.index + m[0].length).split(SEP)   // phrases and their separators
    let best = ''
    if (m[0] === ': ') {
      for (let n = 1; n <= parts.length; n += 2) {
        const sub = parts.slice(0, n).join('').trim()
        if (sub.length >= 12 && (head + ': ' + sub).length <= MAX) best = head + ': ' + sub
      }
    }
    if (best) return best.length + BRAND.length <= MAX ? best + BRAND : best
    return fit(head + BRAND, head)
  }
  // No colon: cut at the last " — " that leaves a title that fits.
  const dash = full.lastIndexOf(' — ', MAX)
  if (dash >= 20) return fit(full.slice(0, dash) + BRAND, full.slice(0, dash))
  return full
}
