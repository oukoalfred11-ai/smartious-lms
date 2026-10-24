/**
 * lib/leavers.js
 * Analysis of students who have graduated or left (lib/studentExit.js),
 * for the alumni list and for understanding why students leave.
 *
 *   graduated  studentStatus Graduated (the exit door, or year promotion)
 *   left       every other leaver: archived as left, or status Removed
 *
 * Dates: the exit is statusChangedAt (else archivedAt); the start is the
 * earliest enrollment record (else the account's createdAt). Time with
 * the school is the months between the two.
 */
const MONTH = 30.44 * 24 * 3600 * 1000

const exitDate = s => s.statusChangedAt || s.archivedAt || null
const kindOf = s => (s.studentStatus === 'Graduated' ? 'graduated' : 'left')

/** Count rows by a key; [{ key, count }] largest first. */
function countBy(rows, key) {
  const m = new Map()
  for (const r of rows) { const k = key(r) || 'Not recorded'; m.set(k, (m.get(k) || 0) + 1) }
  return [...m].map(([k, count]) => ({ key: k, count })).sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)))
}

/**
 * students: leaver User docs (lean); enrollments: their Enrollment docs.
 * Returns { rows, summary }.
 */
function analyseLeavers(students, enrollments = [], now = new Date()) {
  const byStudent = new Map()
  for (const e of enrollments) {
    const k = String(e.studentId)
    if (!byStudent.has(k)) byStudent.set(k, [])
    byStudent.get(k).push(e)
  }
  const rows = students.map(s => {
    const recs = (byStudent.get(String(s._id)) || []).slice().sort((a, b) => String(a.academicYear).localeCompare(String(b.academicYear)))
    const exit = exitDate(s)
    const firstStart = recs.map(r => r.startedAt).filter(Boolean).sort((a, b) => new Date(a) - new Date(b))[0]
    const start = firstStart || s.createdAt || null
    const last = recs[recs.length - 1]
    // Linked parent accounts (populated), when the free-text fields are empty.
    const linked = (s.linkedParents || []).filter(p => p && typeof p === 'object' && p.email !== undefined)
    const months = start && exit ? Math.max(0, Math.round((new Date(exit) - new Date(start)) / MONTH)) : null
    return {
      studentId: s._id,
      kind: kindOf(s),
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
      admissionNumber: s.admissionNumber || '',
      curriculum: s.curriculum || (last && last.curriculum) || '',
      grade: s.gradeLevel || (last && last.grade) || '',
      programme: s.programme || '',
      mode: s.deliveryMode || 'Virtual',
      reason: s.statusReason || '',
      exitDate: exit,
      exitYear: exit ? new Date(exit).getUTCFullYear() : null,
      academicYear: (last && last.academicYear) || s.academicYear || '',
      joined: start,
      months,
      years: recs.map(r => r.academicYear),
      email: s.email || '',
      phone: s.phone || '',
      parentName: s.parentName || linked.map(p => `${p.firstName || ''} ${p.lastName || ''}`.trim()).filter(Boolean).join('; '),
      parentEmail: s.parentEmail || linked.map(p => p.email).filter(Boolean).join('; '),
      parentPhone: s.parentPhone || linked.map(p => p.phone).filter(Boolean).join('; '),
      archived: !!s.archived,
    }
  }).sort((a, b) => new Date(b.exitDate || 0) - new Date(a.exitDate || 0))

  const grads = rows.filter(r => r.kind === 'graduated')
  const left = rows.filter(r => r.kind === 'left')
  const withMonths = left.filter(r => r.months !== null)
  const median = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2) }
  const since = (d) => new Date(now.getTime() - d * 24 * 3600 * 1000)

  const years = [...new Set(rows.map(r => r.exitYear).filter(Boolean))].sort((a, b) => b - a)
  return {
    rows,
    summary: {
      graduated: grads.length,
      left: left.length,
      leftLast90Days: left.filter(r => r.exitDate && new Date(r.exitDate) >= since(90)).length,
      graduatedLast365Days: grads.filter(r => r.exitDate && new Date(r.exitDate) >= since(365)).length,
      // Left within their first 6 months: usually a fit or onboarding issue.
      leftWithin6Months: withMonths.filter(r => r.months < 6).length,
      medianMonthsBeforeLeaving: median(withMonths.map(r => r.months)),
      byYear: years.map(y => ({ year: y, graduated: grads.filter(r => r.exitYear === y).length, left: left.filter(r => r.exitYear === y).length })),
      leftBy: {
        byReason: countBy(left, r => r.reason.trim()),
        byGrade: countBy(left, r => r.grade),
        byCurriculum: countBy(left, r => r.curriculum),
        byProgramme: countBy(left, r => r.programme),
        byMode: countBy(left, r => r.mode),
      },
      graduatedBy: {
        byCurriculum: countBy(grads, r => r.curriculum),
        byGrade: countBy(grads, r => r.grade),
        byYear: countBy(grads, r => r.exitYear && String(r.exitYear)),
      },
    },
  }
}

module.exports = { analyseLeavers, countBy }
