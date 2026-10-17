/* ═══════════════════════════════════════════════════════════════════
   geoGuides.js — the guides written for a country, for its hub and city
   pages
   ───────────────────────────────────────────────────────────────────
   Country hubs and city pages did not link to the guides written for the
   same country (and the guides only linked back to the hub), so neither
   helped the other rank. guidesFor() returns that country's guides, the
   ones naming the place first. Used by LandingPage.jsx (hub pages),
   CountryCityPage.jsx and scripts/seo-static.mjs, so the app and the
   static HTML carry the same links.
═══════════════════════════════════════════════════════════════════ */
import { ARTICLES_INDEX } from './generated/articlesIndex.js'

// Hub slug → the article index's country code, where they differ.
const ALIAS = { 'south-africa': 'za' }

/** [{ slug, title }] for a hub slug ('china', 'south-africa' …), place-named first. */
export function guidesFor(hubSlug, place = '', n = 4) {
  const code = ALIAS[hubSlug] || hubSlug
  const p = String(place || '').replace(/\s+SAR$/, '').toLowerCase()
  return Object.entries(ARTICLES_INDEX)
    .filter(([, a]) => a.country === code)
    .map(([slug, a]) => ({ slug, title: a.t, named: p && (a.t + ' ' + slug.replace(/-/g, ' ')).toLowerCase().includes(p) }))
    .sort((a, b) => Number(b.named) - Number(a.named))
    .slice(0, n)
    .map(({ slug, title }) => ({ slug, title }))
}
