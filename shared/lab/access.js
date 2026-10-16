/**
 * access.js — who may do what in the Virtual Lab. Pure functions, enforced
 * by the backend on every request (the UI only mirrors them).
 *
 *   scope.studentIds  students a teacher teaches (Allocation, status Active)
 *   scope.childIds    a parent's linked children
 */
export const STAFF_ADMIN = ['admin', 'dos', 'ops_manager']
export const EDITABLE = ['in_progress', 'returned']

const id = (x) => (x == null ? '' : String(x._id ?? x))
const inList = (list, x) => (list || []).map(String).includes(id(x))

export function canViewSession(user, session, scope = {}) {
  if (!user || !session) return false
  if (STAFF_ADMIN.includes(user.role)) return true
  if (user.role === 'student') return id(session.studentId) === id(user)
  if (user.role === 'teacher') return inList(scope.studentIds, session.studentId)
  if (user.role === 'parent') return inList(scope.childIds, session.studentId) && session.status !== 'in_progress'
  return false
}

export function canEditSession(user, session) {
  return !!user && !!session && user.role === 'student' && id(session.studentId) === id(user) && EDITABLE.includes(session.status)
}

export function canSubmitSession(user, session) {
  return canEditSession(user, session)
}

export function canMarkSession(user, session, scope = {}) {
  if (!user || !session || !['submitted', 'marked', 'returned'].includes(session.status)) return false
  if (STAFF_ADMIN.includes(user.role)) return true
  return user.role === 'teacher' && inList(scope.studentIds, session.studentId)
}

/** A teacher may only assign to students they teach; admin/Dean to anyone. */
export function canAssign(user, studentIds, scope = {}) {
  if (!user || !Array.isArray(studentIds) || !studentIds.length) return false
  if (STAFF_ADMIN.includes(user.role)) return true
  return user.role === 'teacher' && studentIds.every(s => inList(scope.studentIds, s))
}

export const canManageContent = (user) => !!user && STAFF_ADMIN.includes(user.role)

/** Which experiments a role can open, given each one's publication status. */
export function canOpenExperiment(user, status, { assigned = false } = {}) {
  if (!user) return false
  if (STAFF_ADMIN.includes(user.role) || user.role === 'teacher') return true
  if (user.role === 'student') return status === 'published' || (assigned && ['approved', 'published'].includes(status))
  return false
}

/** Validate a teacher's rubric marks against the rubric rows. */
export function validateMarks(rows, marks) {
  const problems = []
  for (const [rowId, v] of Object.entries(marks || {})) {
    const r = rows.find(x => x.id === rowId)
    if (!r) { problems.push('Unknown rubric row: ' + rowId); continue }
    const n = Number(v)
    if (!Number.isFinite(n) || n < 0 || n > r.max || Math.round(n * 2) !== n * 2) problems.push(r.label + ': marks must be 0–' + r.max + ' in half marks')
  }
  return problems
}
