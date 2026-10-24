const { test } = require('node:test')
const assert = require('node:assert')
const Module = require('module')

// A tiny in-memory collection: enough of Mongo's filters for lib/studentExit.
const eq = (a, b) => String(a) === String(b)
function matches(doc, f) {
  return Object.entries(f).every(([k, c]) => {
    if (k === '$or') return c.some(x => matches(doc, x))
    const v = doc[k]
    if (c && typeof c === 'object' && !(c instanceof Date) && !Array.isArray(c)) {
      return Object.entries(c).every(([op, x]) => {
        if (op === '$in') return Array.isArray(v) ? v.some(y => x.some(z => eq(y, z))) : x.some(z => z === null ? v == null : eq(v, z))
        if (op === '$nin') return !x.some(z => eq(v, z))
        if (op === '$ne') return !eq(v, x)
        if (op === '$gte') return v >= x
        if (op === '$size') return (v || []).length === x
        throw new Error('op ' + op)
      })
    }
    return eq(v, c)
  })
}
function collection(docs) {
  return {
    docs,
    find: (f) => ({ select: () => ({ lean: async () => docs.filter(d => matches(d, f)).map(d => ({ ...d })) }) }),
    updateMany: async (f, u) => {
      let n = 0
      for (const d of docs.filter(x => matches(x, f))) {
        if (u.$pull) for (const [k, c] of Object.entries(u.$pull)) d[k] = d[k].filter(y => !c.$in.some(z => eq(y, z)))
        if (u.$set) Object.assign(d, u.$set)
        n++
      }
      return { modifiedCount: n }
    },
  }
}

const now = new Date('2026-10-24T08:00:00Z')
const later = new Date('2026-10-30T08:00:00Z'), earlier = new Date('2026-10-01T08:00:00Z')
const lessons = collection([
  { _id: 'L1', kind: 'lesson', status: 'scheduled', scheduledAt: later, assignedStudents: ['grad'] },
  { _id: 'L2', kind: 'lesson', status: 'scheduled', scheduledAt: later, assignedStudents: ['grad', 'stay'] },
  { _id: 'L3', kind: 'lesson', status: 'ended', scheduledAt: earlier, assignedStudents: ['grad'] },
  { _id: 'L4', kind: 'lesson', status: 'scheduled', scheduledAt: later, assignedStudents: ['stay'] },
])
const slots = collection([
  { _id: 'T1', isActive: true, assignedStudents: ['grad'], audienceCurriculum: '', audienceGrade: '' },
  { _id: 'T2', isActive: true, assignedStudents: ['grad', 'stay'], audienceCurriculum: '', audienceGrade: '' },
  { _id: 'T3', isActive: true, assignedStudents: ['grad'], audienceCurriculum: 'Cambridge', audienceGrade: 'Year 13' },
])
const load = Module._load
Module._load = function (req, ...rest) {
  if (/models\/LiveClass$/.test(req)) return lessons
  if (/models\/TimetableEntry$/.test(req)) return slots
  if (/\/models\//.test(req)) return {}
  return load.call(this, req, ...rest)
}
const { hasLeft, detachFromSchedule } = require('../src/lib/studentExit')
const { analyseLeavers } = require('../src/lib/leavers')
Module._load = load

test('graduated, removed and archived students have left; others have not', () => {
  assert.equal(hasLeft({ studentStatus: 'Graduated' }), true)
  assert.equal(hasLeft({ studentStatus: 'Removed' }), true)
  assert.equal(hasLeft({ archived: true, studentStatus: 'Active' }), true)
  assert.equal(hasLeft({ studentStatus: 'Active' }), false)
  assert.equal(hasLeft({ studentStatus: 'Inactive', onBreak: true }), false)
  assert.equal(hasLeft(null), false)
})

test('a leaver comes off upcoming lessons and slots; past lessons are kept', async () => {
  const r = await detachFromSchedule(['grad'], { now })
  const L = id => lessons.docs.find(d => d._id === id), T = id => slots.docs.find(d => d._id === id)
  assert.deepEqual(L('L1').assignedStudents, [])
  assert.equal(L('L1').status, 'cancelled')                // nobody left on it
  assert.deepEqual(L('L2').assignedStudents, ['stay'])
  assert.equal(L('L2').status, 'scheduled')
  assert.deepEqual(L('L3').assignedStudents, ['grad'])      // the past is untouched
  assert.equal(L('L4').status, 'scheduled')                 // other students' lessons untouched
  assert.equal(T('T1').isActive, false)                     // empty slot switched off
  assert.equal(T('T2').isActive, true)
  assert.equal(T('T3').isActive, true)                      // still has a grade audience
  assert.deepEqual(r, { lessons: 2, lessonsCancelled: 1, slots: 3, slotsOff: 1 })
  assert.deepEqual(await detachFromSchedule(['grad'], { now }), { lessons: 0, lessonsCancelled: 0, slots: 0, slotsOff: 0 })
})

test('leaver analysis: alumni, early leavers and reasons', () => {
  const d = (s) => new Date(s)
  const students = [
    { _id: 'a', firstName: 'Amani', lastName: 'K', studentStatus: 'Graduated', statusChangedAt: d('2026-07-01'), createdAt: d('2024-09-01'), curriculum: 'Cambridge', gradeLevel: 'Year 13' },
    { _id: 'b', firstName: 'Baraka', lastName: 'O', studentStatus: 'Removed', archived: true, statusChangedAt: d('2026-10-01'), createdAt: d('2026-07-01'), statusReason: 'Relocated', gradeLevel: 'Year 9' },
    { _id: 'c', firstName: 'Chiku', lastName: 'M', studentStatus: 'Removed', archived: true, statusChangedAt: d('2026-03-01'), createdAt: d('2025-01-01'), statusReason: 'Relocated', gradeLevel: 'Year 9' },
  ]
  const enrol = [{ studentId: 'a', academicYear: '2025/2026', grade: 'Year 13', startedAt: d('2024-01-10') }]
  const { rows, summary } = analyseLeavers(students, enrol, d('2026-10-24'))
  assert.equal(summary.graduated, 1)
  assert.equal(summary.left, 2)
  assert.equal(summary.leftWithin6Months, 1)
  assert.equal(summary.leftLast90Days, 1)
  assert.deepEqual(summary.leftBy.byReason, [{ key: 'Relocated', count: 2 }])
  assert.deepEqual(summary.byYear, [{ year: 2026, graduated: 1, left: 2 }])
  const amani = rows.find(r => r.name === 'Amani K')
  assert.equal(amani.kind, 'graduated')
  assert.equal(amani.academicYear, '2025/2026')
  assert.equal(amani.months, 30)                            // from the first enrollment, not the account
  assert.equal(rows[0].name, 'Baraka O')                    // newest exit first
})
