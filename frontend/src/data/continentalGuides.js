/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════
// continentalGuides.js — the Continental Guides series (articlesPart7).
//
// Smartious started this series in August 2026: one guide per continent
// comparing home-education law, examination access and time zones
// country by country, each linking to every country hub in it. Shared by
// the article page (LandingPage.jsx) and the static build
// (scripts/seo-static.mjs), so both render the same things:
//
//   CONTINENTAL_SERIES   the series, in reading order (series nav)
//   guideCountryRows()   per country: its "online school" and "virtual
//                        school" guides, found in the article index, so a
//                        guide added later is linked with no edit here
//   aboutGuideText()     the "About this guide" note: first published,
//                        last updated, and how to cite it
//   fmtMonthYear()       '2026-08-01' → 'August 2026'
//
// Article fields that switch these on (only continental guides use them):
//   series: 'continental'   → series nav + About this guide
//   published / updated     → ISO dates (also datePublished/dateModified
//                             in the static Article JSON-LD)
//   guideCountries: true    → the per-country guide list for countryLinks
// ═══════════════════════════════════════════════════════════════════

export const CONTINENTAL_SERIES = [
  { slug: 'best-online-virtual-homeschool-africa',         name: 'Africa' },
  { slug: 'best-online-virtual-homeschool-europe',         name: 'Europe' },
  { slug: 'best-online-virtual-homeschool-asia',           name: 'Asia' },
  { slug: 'best-online-virtual-homeschool-north-america',  name: 'North America' },
  { slug: 'best-online-virtual-homeschool-south-america',  name: 'South America' },
  { slug: 'best-online-virtual-homeschool-oceania',        name: 'Oceania' },
  { slug: 'best-online-virtual-homeschool-americas',       name: 'The Americas (overview)' },
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** '2026-08-01' → 'August 2026'; '2026-10-28' with day → '28 October 2026'. */
export function fmtMonthYear(iso, withDay = false) {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(String(iso || ''))
  if (!m) return ''
  const month = MONTHS[Number(m[2]) - 1] || ''
  return (withDay && m[3] ? Number(m[3]) + ' ' : '') + month + ' ' + m[1]
}

// Hub slug → other country codes used in the article index.
const COUNTRY_ALIASES = { 'south-africa': ['za'], 'united-kingdom': ['uk'], 'bosnia-and-herzegovina': ['bosnia'] }
const KIND = [
  [/^online-school/, 'Online school guide'],
  [/^virtual-school/, 'Virtual school guide'],
  [/^homeschooling-/, 'Homeschooling guide'],
]

/** The online-school, virtual-school and homeschooling guides of each linked country. */
export function guideCountryRows(countryLinks, index) {
  const all = Object.entries(index || {})
  return (countryLinks || []).map(cl => {
    const codes = [cl.slug, ...(COUNTRY_ALIASES[cl.slug] || [])]
    const kindOf = (slug) => KIND.findIndex(([re]) => re.test(slug))
    const guides = all
      .filter(([slug, g]) => g && codes.includes(g.country) && kindOf(slug) >= 0)
      .sort(([a], [b]) => kindOf(a) - kindOf(b) || a.localeCompare(b))
      .map(([slug, g]) => ({ slug, label: KIND[kindOf(slug)][1], title: g.t || '' }))
    return { name: cl.name, slug: cl.slug, guides }
  }).filter(r => r.guides.length)
}

/** The "About this guide" paragraphs. */
export function aboutGuideText(a, slug) {
  const first = fmtMonthYear(a.published)
  // "Updated" only once the guide has changed since it was first published.
  const upd = a.updated && a.updated !== a.published ? fmtMonthYear(a.updated, true) : ''
  const url = 'smartioushomeschool.com/blog/' + slug
  return {
    body: (first ? `Smartious first published this guide in ${first}` : 'Smartious publishes this guide') +
      ' as part of the Continental Guides, a series comparing home-education law, examination access and time zones country by country, ' +
      'continent by continent, with a researched page behind every country it names. It is kept up to date as laws and examination arrangements change' +
      (upd ? `; last updated ${upd}.` : '.'),
    cite: `To cite this guide: Smartious, "${a.t}"${first ? ', first published ' + first : ''}${upd ? ', updated ' + upd : ''}, ${url}.`,
  }
}
