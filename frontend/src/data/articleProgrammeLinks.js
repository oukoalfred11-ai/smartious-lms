/**
 * articleProgrammeLinks.js: links from a guide to the programme it is about.
 *
 * Search Console (Aug to Nov 2026) showed the IGCSE, A-Level, Cambridge and
 * Edexcel guides ranking on page one while the programme pages they describe
 * sat on pages two to five. Each such guide now links to its programme
 * pages, in the app (LandingPage.jsx) and in the static HTML
 * (scripts/seo-static.mjs), from this one list.
 */
const LINKS = [
  { test: /igcse/, href: '/curricula/igcse', label: 'IGCSE homeschooling and online school', note: 'Live Cambridge IGCSE classes, ages 14 to 16' },
  { test: /a-?levels?\b/, href: '/curricula/a-level', label: 'A-Level homeschooling and online school', note: 'Live Cambridge A-Level classes, ages 16 to 19' },
  { test: /edexcel|pearson/, href: '/pearson-edexcel-online-school', label: 'Pearson Edexcel online school', note: 'International GCSE and International A Level' },
  { test: /cambridge|igcse|a-?levels?\b|checkpoint/, href: '/cambridge-online-school', label: 'Cambridge online school', note: 'Primary, Lower Secondary, IGCSE and A Level' },
]

/** Programme pages a guide should link to, from its slug and title. */
export function programmeLinks(slug, article) {
  const text = (String(slug || '') + ' ' + String(article?.t || '')).toLowerCase()
  return LINKS.filter(l => l.test.test(text)).map(({ href, label, note }) => ({ href, label, note }))
}
export const PROGRAMME_LINKS_HEADING = 'Study this with Smartious'
