/* ═══════════════════════════════════════════════════════════════════
   countriesListing.js — the home page countries section
   ───────────────────────────────────────────────────────────────────
   COUNTRY_PLATES: the eight photo plates (priority markets for the
   January 2027 intake). A plate shows its photo when
   /images/countries/<slug>-plate-600.webp and -1200.webp exist and
   `img: true` is set; otherwise it shows the crimson plate with the
   country code.
   ALL_COUNTRIES: every /online-school/<slug> hub, for the searchable
   list. Every slug must be a hub that seo-static.mjs writes.
   Used by components/CountriesSection.jsx and scripts/seo-static.mjs.
═══════════════════════════════════════════════════════════════════ */

export const COUNTRY_PLATES = [
  { slug: 'nigeria', name: 'Nigeria', region: 'West Africa', cities: 'Lagos, Abuja, Port Harcourt', code: 'NG', img: true },
  { slug: 'kenya', name: 'Kenya', region: 'East Africa', cities: 'Nairobi, Mombasa', code: 'KE', img: true },
  { slug: 'uae', name: 'UAE', region: 'Gulf', cities: 'Dubai, Abu Dhabi, Sharjah', code: 'AE', img: true },
  { slug: 'saudi-arabia', name: 'Saudi Arabia', region: 'Gulf', cities: 'Riyadh, Jeddah', code: 'SA', img: true },
  { slug: 'qatar', name: 'Qatar', region: 'Gulf', cities: 'Doha', code: 'QA' },
  { slug: 'kuwait', name: 'Kuwait', region: 'Gulf', cities: 'Kuwait City', code: 'KW' },
  { slug: 'bahrain', name: 'Bahrain', region: 'Gulf', cities: 'Manama, Saar', code: 'BH' },
  { slug: 'oman', name: 'Oman', region: 'Gulf', cities: 'Muscat', code: 'OM' },
]

// [name, slug?] — slug defaults to the lower-case, hyphenated name
const LIST = [['Albania'], ['Algeria'], ['Angola'], ['Argentina'], ['Australia'], ['Austria'], ['Azerbaijan'], ['Bahrain'], ['Bangladesh'], ['Belgium'],
  ['Bolivia'], ['Bosnia and Herzegovina'], ['Botswana'], ['Brazil'], ['Bulgaria'], ['Canada'], ['Chile'], ['China'], ['Colombia'], ['Costa Rica'],
  ['Croatia'], ['Cyprus'], ['Czech Republic'], ['Denmark'], ['Dominican Republic'], ['DR Congo', 'drc'], ['Ecuador'], ['Egypt'], ['Ethiopia'], ['Finland'],
  ['France'], ['Georgia'], ['Germany'], ['Ghana'], ['Greece'], ['Guatemala'], ['Hungary'], ['India'], ['Indonesia'], ['Iraq'],
  ['Ireland'], ['Israel'], ['Italy'], ['Japan'], ['Jordan'], ['Kenya'], ['Kosovo'], ['Kuwait'], ['Lebanon'], ['Luxembourg'],
  ['Malaysia'], ['Maldives'], ['Mauritius'], ['Mexico'], ['Montenegro'], ['Morocco'], ['Myanmar'], ['Namibia'], ['Nepal'], ['Netherlands'],
  ['New Zealand'], ['Nigeria'], ['North Macedonia'], ['Norway'], ['Oman'], ['Pakistan'], ['Panama'], ['Paraguay'], ['Peru'], ['Poland'],
  ['Portugal'], ['Puerto Rico'], ['Qatar'], ['Romania'], ['Rwanda'], ['Saudi Arabia'], ['Serbia'], ['Singapore'], ['Slovakia'], ['Slovenia'],
  ['Somalia'], ['South Africa'], ['South Korea'], ['Spain'], ['Sweden'], ['Switzerland'], ['Taiwan'], ['Tanzania'], ['Thailand'], ['Tunisia'],
  ['Türkiye', 'turkey'], ['UAE', 'uae'], ['Uganda'], ['Ukraine'], ['United Kingdom'], ['United States', 'usa'], ['Uruguay'], ['Venezuela'], ['Vietnam'], ['Zambia'],
  ['Zimbabwe']]

export const ALL_COUNTRIES = LIST.map(([name, slug]) => ({ name, slug: slug || name.toLowerCase().replace(/ /g, '-') }))
