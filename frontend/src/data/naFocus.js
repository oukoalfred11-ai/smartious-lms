/* ═══════════════════════════════════════════════════════════════════
   naFocus.js — what the USA and Canada pages lead with
   ───────────────────────────────────────────────────────────────────
   USA: a K-12 online school and homeschool on the American curriculum,
   with Advanced Placement (AP). Canada: the Ontario Secondary School
   Diploma (OSSD), earned from anywhere in Canada through our Ontario
   partner school. Cambridge and IB stay as options, not the headline.

   One place for the titles, descriptions, headings and opening lines of
   the US state and city pages and the Canadian province and city pages,
   used by LandingPage.jsx and scripts/seo-static.mjs alike. Titles that
   carry their own hook (a voucher or funding programme) are kept.
═══════════════════════════════════════════════════════════════════ */

const MAX_T = 60
const MAX_D = 158
const fit = (max, ...c) => c.filter(Boolean).find(t => t.length <= max) || c.filter(Boolean).pop()
const HOOK = /voucher|funding|ESA\b|\bDL\b|scholarship/i

// "houston-tx" -> "TX", "toronto-on" -> "ON"; state/province pages have none.
const codeOf = (slug) => { const m = /-([a-z]{2})$/.exec(String(slug || '')); return m ? m[1].toUpperCase() : '' }

export const US_HEADLINE = 'K-12 Online School & Homeschool'
export const CA_HEADLINE = 'Online OSSD School & Homeschool'

export function usLead(place) {
  return `The American curriculum from Kindergarten to Grade 12, with Advanced Placement (AP), taught live by qualified teachers in US time zones: a full online school or homeschool programme for ${place} families, with Cambridge and IB as options.`
}
export function caLead(place) {
  return `Earn the Ontario Secondary School Diploma (OSSD) from anywhere in Canada: live online OSSD courses for ${place} families through our Ontario partner school, a diploma universities across Canada and the US know well.`
}

/** { title, desc } for a US state or city page (country 'us') or a Canadian province or city page ('ca'). */
export function naMeta(country, { slug, name, oldTitle = '', oldDesc = '' }) {
  if (oldTitle && HOOK.test(oldTitle)) return { title: oldTitle, desc: oldDesc }
  const code = codeOf(slug)
  const place = code ? `${name}, ${code}` : name
  if (country === 'ca') {
    return {
      title: fit(MAX_T, `${CA_HEADLINE} in ${place} | Smartious`, `${CA_HEADLINE} in ${name} | Smartious`, `Online OSSD School in ${place} | Smartious`, `Online OSSD School in ${name}`),
      desc: fit(MAX_D,
        `Online OSSD school for ${name} families: earn the Ontario Secondary School Diploma through our Ontario partner school, with live classes. From USD 423/month.`,
        `Online OSSD school for ${name}: the Ontario Secondary School Diploma through our Ontario partner school, live classes. From USD 423/month.`),
    }
  }
  return {
    title: fit(MAX_T, `${US_HEADLINE} in ${place} | Smartious`, `${US_HEADLINE} in ${name} | Smartious`, `K-12 Online School in ${place} | Smartious`, `K-12 Online School in ${name}`),
    desc: fit(MAX_D,
      `K-12 online school and homeschool for ${name} families: the American curriculum with AP, taught live in US time zones. From USD 423/month.`,
      `K-12 online school and homeschool in ${name}: American curriculum with AP, taught live. From USD 423/month.`),
  }
}
