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

// ── City, tuition-area, curriculum, language, test-prep, study-abroad
//    and service pages ───────────────────────────────────────────
// Their titles are "<query> — <phrase> | <phrase> | Smartious". fitTitle
// keeps the leading phrases that fit (whole phrases, or a list cut at a
// comma or "·"), then adds "| Smartious" if it still fits, so each page
// keeps its own wording and intent. Titles of 60 characters or less, other
// paths, and titles naming accreditation, recognition or licensing are
// returned unchanged.
const FIT_PATHS = /^\/(?:homeschool-[^/]+|tuition-uae\/[^/]+|tuition-uk(?:\/[^/]+)?|study-abroad(?:\/[^/]+)?|curricula\/[^/]+|languages(?:\/[^/]+)?|test-prep(?:\/[^/]+)?|services\/[^/]+)$/
const PHRASE_SEP = /( \| | — | – )/
const LIST_SEP = /(, | · )/
// City pages whose title leads with a generic phrase ("Online school and
// international curriculum in Hong Kong") say what families search for
// instead, the same words as the page's H1: "Online School & Homeschool in
// Hong Kong". Searches are for "homeschool <city>" and "online school
// <city>"; "international curriculum" is rarely typed.
const GENERIC_CITY = /^Online school and (?:international curriculum|Cambridge tutoring|Cambridge curriculum|homeschool) (?:in|for) /
// US and Canadian state, province and city pages: "Online Homeschool
// Houston Texas | Smartious" also targets "online school <place>".
// Titles carrying their own hook ("— FES-EO Voucher Eligible") are kept.
export function fitTitle(path, title) {
  const t = fitTitleBase(path, title)
  if (t && /^\/homeschool-/.test(path || '')) {
    const m = /^Online Homeschool ([^—|]+?)(?: \| Smartious)?$/.exec(t)
    if (m) {
      const n = 'Online School & Homeschool in ' + m[1]
      if (n.length + BRAND.length <= MAX) return n + BRAND
      if (n.length <= MAX) return n
    }
  }
  return t
}
function fitTitleBase(path, title) {
  if (title && /^\/homeschool-/.test(path || '') && GENERIC_CITY.test(title) && !KEEP.test(title)) {
    const rest = title.replace(GENERIC_CITY, '')
    const place = rest.split(PHRASE_SEP)[0].trim()
    const t = 'Online School & Homeschool in ' + place
    if (t.length + BRAND.length <= MAX) return t + BRAND
    if (t.length <= MAX) return t
  }
  if (!title || title.length <= MAX || !FIT_PATHS.test(path || '') || KEEP.test(title)) return title
  const parts = title.split(PHRASE_SEP)                 // [phrase, sep, phrase, sep, …]
  while (parts.length > 1 && /^Smartious\b/.test(parts[parts.length - 1].trim())) parts.splice(-2, 2)
  let best = ''
  let next = 0
  for (let n = 1; n <= parts.length; n += 2) {
    const t = parts.slice(0, n).join('').trim()
    if (t.length > MAX) break
    best = t; next = n                                 // index of the separator after it
  }
  if (!best) {
    // First phrase alone is too long ("Online school and international
    // curriculum in Valparaíso and Viña del Mar"): say the same thing in
    // the short form, then drop a trailing "and <area>" if still needed.
    let first = parts[0].trim()
      .replace(/^Online school and homeschool in /, 'Online School & Homeschool in ')
      .replace(/^Online school and (?:international curriculum|Cambridge tutoring|Cambridge curriculum) (in|for) /, 'Online School $1 ')
    if (first.length > MAX) {
      const and = first.lastIndexOf(' and ')
      if (and >= 25) first = first.slice(0, and)
    }
    if (first.length > MAX) return title                 // leave as written
    best = first; next = parts.length
  }
  if (next < parts.length - 1) {                         // part of the next phrase, cut at a list separator
    const items = parts[next + 1].split(LIST_SEP)
    const base = best
    for (let n = 3; n < items.length; n += 2) {          // at least two list items
      const t = base + parts[next] + items.slice(0, n).join('')
      if (t.length <= MAX) best = t
    }
  }
  return best.length + BRAND.length <= MAX ? best + BRAND : best
}

// ── Meta descriptions ────────────────────────────────────────
// Google shows about 155–160 characters of a description. Most country
// and city descriptions ran to 200–300, so the price and the end of the
// sentence were cut. fitDesc keeps whole sentences that fit, always keeps
// "From USD 423/month." when the description had it, and when even the
// first sentence is too long writes a short one for the place named in
// the title. Descriptions naming accreditation, recognition or licensing
// are left exactly as written. Used by LandingPage.jsx and seo-static.mjs.
const DMAX = 158
export function fitDesc(desc, title) {
  let d = String(desc || '').replace(/\s+/g, ' ').trim()
  if (d.length <= DMAX || KEEP.test(d)) return d
  d = d.replace(/^Online, virtual school & homeschool(?: for [^.]+)?\.\s*/, '')
  const pm = d.match(/From USD 423(?:\/month| per month)[^.]*\./)
  const price = pm ? 'From USD 423/month.' : ''
  const rest = (pm ? d.replace(pm[0], '') : d).replace(/\s+/g, ' ').trim()
  const room = DMAX - (price ? price.length + 1 : 0)
  const sents = rest.match(/[^.!?]+[.!?]+(?=\s|$)/g) || [rest]
  let out = ''
  for (const x of sents) {
    const t = (out + ' ' + x.trim()).trim()
    if (t.length <= room) out = t
    else break
  }
  if (out.length >= 70) return (out + (price ? ' ' + price : '')).trim()
  if (price) {                                   // the price does not fit with the opening: keep the opening
    let o2 = ''
    for (const x of sents) { const t = (o2 + ' ' + x.trim()).trim(); if (t.length <= DMAX) o2 = t; else break }
    if (o2.length >= 100) return o2
  }
  const m = / in (?:the )?(.+?)(?: \| | — | – |$)/.exec(String(title || '')) || /^Online Homeschool (?:in )?(.+?)(?: \| | — | – |$)/.exec(String(title || ''))
  const place = m ? m[1].trim() : ''
  // The short form is a sales line, so it only replaces a description that
  // already is one ("Live online …"); informational ones (e.g. mainland
  // China's regulatory position) are cut, never reworded.
  if (place && place.length <= 40 && /^Live online\b/.test(rest)) {
    const end = price || 'Small live classes.'
    const c = [
      `Live online Cambridge IGCSE, A-Level, IB and American AP classes for families in ${place}. Homeschool or full-time online school. ${end}`,
      `Live online IGCSE, A-Level, IB and American AP for families in ${place}. Homeschool or full-time online school. ${end}`,
      `Live online IGCSE, A-Level and IB for families in ${place}. Homeschool or online school. ${end}`,
    ].find(x => x.length <= DMAX)
    if (c) return c
  }
  // No place: cut the first sentence at the last comma or dash that fits.
  const first = sents[0].trim().replace(/[.!?]+$/, '')
  // Prefer a dash (a clause ends there) over a comma (often mid-list).
  const dash = first.lastIndexOf(' — ', room - 2)
  const cut = dash >= 60 ? dash : first.lastIndexOf(', ', room - 2)
  if (cut >= 60) return (first.slice(0, cut) + '.' + (price ? ' ' + price : '')).trim()
  return d.slice(0, d.lastIndexOf(' ', DMAX - 1)) + '…'
}
