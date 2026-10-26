/**
 * lib/joinClassroom.js — open the Smartious Classroom in THIS tab, and
 * remember the portal page it was opened from so leaving the class
 * returns there (pages/ClassroomPage.jsx). No new tab: on phones and
 * tablets a second tab was easy to lose, and rejoining after a power or
 * internet cut is simply the Join button again.
 */
const KEY = 'smartious.classroomReturn'

export function joinClassroom(liveClassId) {
  try { sessionStorage.setItem(KEY, window.location.pathname + window.location.search + window.location.hash) } catch (e) { /* private mode */ }
  window.location.assign('/classroom/' + liveClassId)
}

/** Where to go when leaving the classroom, or null to use the default. */
export function classroomReturnPath() {
  try {
    const p = sessionStorage.getItem(KEY)
    return p && p.startsWith('/') && !p.startsWith('/classroom/') ? p : null
  } catch (e) { return null }
}
