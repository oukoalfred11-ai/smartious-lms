/* ═══════════════════════════════════════════════════════════════════
   teacherSlug.js — the URL of each public team profile.
   ───────────────────────────────────────────────────────────────────
   Every member of the team on /teachers has a page at
   /teachers/<slug>, the slug made from their name ("Jane Doe" becomes
   /teachers/jane-doe). Two people with the same name are told apart by
   the end of their record id (/teachers/jane-doe-4f2a), in list order,
   so the first one keeps the plain name.

   Used by the website (pages/LandingPage.jsx) and by the build
   (scripts/seo-static.mjs, which writes a static page and a sitemap
   entry for each profile), so both always agree on the URLs.
   The team list comes from GET /api/users/public-teachers.
═══════════════════════════════════════════════════════════════════ */

export function slugifyName(name) {
  return String(name || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // é → e
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** The team list with a unique `slug` added to every person. */
export function withTeacherSlugs(team) {
  const seen = new Set()
  return (team || []).filter(t => t && t.name).map(t => {
    const base = slugifyName(t.name) || 'team-member'
    let slug = base
    if (seen.has(slug)) slug = base + '-' + String(t.id || '').slice(-4).toLowerCase()
    let n = 2
    while (seen.has(slug)) slug = base + '-' + n++
    seen.add(slug)
    return { ...t, slug }
  })
}

export const teacherPath = (t) => '/teachers/' + t.slug

// Page title and meta description of a profile page. Shared with the
// build so the static HTML and the live page say the same thing.
export function teacherTitle(t) {
  return t.name + (t.title ? ', ' + t.title : '') + ' | Smartious Homeschool'
}

export function teacherDescription(t) {
  const bio = String(t.bio || '').replace(/\s+/g, ' ').trim()
  if (bio.length >= 60) return bio.length <= 158 ? bio : bio.slice(0, bio.lastIndexOf(' ', 157)) + '…'
  const years = t.yearsOfExperience > 0 ? ', with ' + t.yearsOfExperience + ' year' + (t.yearsOfExperience === 1 ? '' : 's') + ' of experience' : ''
  return t.name + ' is ' + (t.title ? t.title : 'a member of the team') + ' at Smartious Homeschool' + years
    + '. Meet the qualified teachers behind every live Smartious lesson.'
}
