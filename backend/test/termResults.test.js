const test = require('node:test')
const assert = require('node:assert')
const { mergeScores } = require('../src/lib/reportScores')
const { subjectRows, totals } = require('../src/lib/termResults')

const scores = mergeScores([], [
  { subject: 'Biology', kind: 'weekly', date: '2026-09-10', score: 6, outOf: 10 },
  { subject: 'Biology', kind: 'endterm', date: '2026-11-20', score: 80, outOf: 100 },
  { subject: 'Physics', kind: 'weekly', date: '2026-09-12', score: 50, outOf: 100 },
])

test('subject rows carry scores, grades and missed flags', () => {
  const rows = subjectRows(scores, (p) => (p >= 70 ? 'A' : 'C'))
  const bio = rows.find(r => r.subject === 'Biology'), phy = rows.find(r => r.subject === 'Physics')
  assert.strictEqual(bio.weightedScore, 74)
  assert.strictEqual(bio.letterGrade, 'A')
  assert.strictEqual(bio.endTermSource, 'keyed')
  assert.strictEqual(phy.missedEndTerm, true)
  assert.deepStrictEqual(totals(rows), { overallAverage: 62, endTermAverage: 80 })
})

test('refreshing keeps teacher comments unless new ones are given', () => {
  const previous = [{ subject: 'Biology', teacherComment: 'Strong practical work', teacherInitials: 'AO' }]
  const kept = subjectRows(scores, () => '', {}, previous).find(r => r.subject === 'Biology')
  assert.strictEqual(kept.teacherComment, 'Strong practical work')
  assert.strictEqual(kept.teacherInitials, 'AO')
  const replaced = subjectRows(scores, () => '', { Biology: { comment: 'New' } }, previous).find(r => r.subject === 'Biology')
  assert.strictEqual(replaced.teacherComment, 'New')
})

test('no scores: no averages', () => {
  assert.deepStrictEqual(totals([]), { overallAverage: null, endTermAverage: null })
})
