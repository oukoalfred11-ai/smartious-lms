/* ═══════════════════════════════════════════════════════════════════
   priorityLinks.js — internal links to the priority markets
   ───────────────────────────────────────────────────────────────────
   The country hubs and main city pages for the January 2027 intake
   markets (the Gulf, Nigeria and Kenya), plus Hong Kong, where the site
   already ranks for "homeschool" and "online school", and Tbilisi and Atlanta
   (Georgia the country and Georgia, USA). The city links are used by the
   home page and the footer in LandingPage.jsx; both lists are used by
   scripts/seo-static.mjs (static home page and footer), so the app and the
   crawler HTML link to the same pages. Every href must be an indexable
   page that seo-static.mjs writes; it warns if one is not.
═══════════════════════════════════════════════════════════════════ */

// [href, anchor text]
export const PRIORITY_HUB_LINKS = [
  ['/online-school/uae', 'Dubai & the UAE'],
  ['/online-school/qatar', 'Qatar'],
  ['/online-school/saudi-arabia', 'Saudi Arabia'],
  ['/online-school/kuwait', 'Kuwait'],
  ['/online-school/bahrain', 'Bahrain'],
  ['/online-school/oman', 'Oman'],
  ['/online-school/nigeria', 'Nigeria'],
  ['/online-school/kenya', 'Kenya'],
]

export const PRIORITY_CITY_LINKS = [
  ['/homeschool-dubai-ae', 'Dubai'],
  ['/homeschool-abu-dhabi-ae', 'Abu Dhabi'],
  ['/homeschool-sharjah-ae', 'Sharjah'],
  ['/homeschool-doha-qa', 'Doha'],
  ['/homeschool-riyadh-sa', 'Riyadh'],
  ['/homeschool-jeddah-sa', 'Jeddah'],
  ['/homeschool-kuwait-city-kw', 'Kuwait City'],
  ['/homeschool-manama-bh', 'Manama'],
  ['/homeschool-saar-bh', 'Saar'],
  ['/homeschool-muscat-om', 'Muscat'],
  ['/homeschool-lagos-ng', 'Lagos'],
  ['/homeschool-abuja-ng', 'Abuja'],
  ['/homeschool-port-harcourt-ng', 'Port Harcourt'],
  ['/homeschool-nairobi', 'Nairobi'],
  ['/homeschool-mombasa', 'Mombasa'],
  ['/homeschool-hong-kong-cn', 'Hong Kong'],
  ['/homeschool-tbilisi-ge', 'Tbilisi, Georgia'],
  ['/homeschool-atlanta-ga', 'Atlanta, Georgia (USA)'],
]
