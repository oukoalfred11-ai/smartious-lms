/**
 * src/data/curriculumList.js
 * ══════════════════════════════════════════════════════════════════
 * ONE source for the curriculum dropdown.
 *
 * WHY THIS EXISTS
 * The list was hardcoded in three places — twice in CurriculumModule.jsx
 * and once in TeacherPortal.jsx — and none of them read the backend. So
 * adding a curriculum server-side left it invisible in the UI until
 * someone remembered all three files. That is exactly how Edexcel
 * iPrimary and KCSE were added correctly to the API, passed every
 * backend check, and still could not be selected.
 *
 * fetchCurricula() reads GET /api/curriculum/options, which is generated
 * from constants/curriculum.js — the backend's single source. Add a
 * curriculum there and it appears here with no frontend change at all.
 *
 * FALLBACK_CURRICULA is a last resort for when the request fails: an
 * empty dropdown would make the page useless, so a stale list beats
 * nothing. It is not the source of truth and should not be edited to add
 * a curriculum — edit the backend.
 */

export const FALLBACK_CURRICULA = [
  { id: 'CambridgePrimary',   name: 'Cambridge Primary' },
  { id: 'CambridgeLowerSec',  name: 'Cambridge Lower Secondary' },
  { id: 'CambridgeIGCSE',     name: 'Cambridge IGCSE' },
  { id: 'CambridgeALevel',    name: 'Cambridge A-Level' },
  { id: 'EdexcelPrimary',     name: 'Edexcel iPrimary' },
  { id: 'EdexcelLowerSec',    name: 'Edexcel Lower Secondary' },
  { id: 'EdexcelIGCSE',       name: 'Edexcel IGCSE' },
  { id: 'EdexcelALevel',      name: 'Edexcel A-Level' },
  { id: 'AQALowerSec',        name: 'AQA Lower Secondary' },
  { id: 'AQAGCSE',            name: 'AQA GCSE' },
  { id: 'AQAALevel',          name: 'AQA A-Level' },
  { id: 'IBPYP',              name: 'IB Primary Years (PYP)' },
  { id: 'IBMYP',              name: 'IB Middle Years (MYP)' },
  { id: 'IBDP',               name: 'IB Diploma (DP)' },
  { id: 'BNC',                name: 'British National Curriculum' },
  { id: 'American',           name: 'American Curriculum' },
  { id: 'Canadian',           name: 'Canadian Curriculum' },
  { id: 'KenyaCBE',           name: 'Kenya CBE' },
  { id: 'KCSE',               name: 'KCSE (Form 3-4)' },
]

let cache = null

/**
 * Fetch the curriculum list from the backend.
 *
 * @param {object} api  the configured axios instance
 * @returns {Promise<Array<{id: string, name: string}>>}
 *
 * Cached after the first successful call — the list changes when a
 * developer edits the backend, not during a session, so refetching on
 * every dropdown render would be wasted requests.
 */
export async function fetchCurricula(api) {
  if (cache) return cache
  try {
    const { data } = await api.get('/curriculum/options')
    const rows = data?.curricula || data?.data?.curricula || data?.options?.curricula
    if (Array.isArray(rows) && rows.length) {
      cache = rows.map(c => ({ id: c.id, name: c.name }))
      return cache
    }
    return FALLBACK_CURRICULA
  } catch (e) {
    // Network failure, auth failure, backend down — a stale list is more
    // useful than an empty dropdown.
    return FALLBACK_CURRICULA
  }
}

/** Clear the cache. Useful after a curriculum is added without a reload. */
export function clearCurriculaCache() { cache = null }
