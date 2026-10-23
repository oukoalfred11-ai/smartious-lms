const test = require('node:test')
const assert = require('node:assert')
const { mergeScores } = require('../src/lib/reportScores')

test('online and keyed-in weekly tests average together; final is 30/70', () => {
  const r = mergeScores(
    [{ subject: 'Biology', title: 'Week 1 test', date: '2026-09-07', pct: 60 }, { subject: 'Biology', title: 'End of Term Exam', date: '2026-11-20', pct: 70 }],
    [{ subject: 'Biology', kind: 'weekly', label: 'Week 2 test', date: '2026-09-14', score: 16, outOf: 20 }],
  )
  assert.deepStrictEqual(r.Biology.weekly.map(w => [w.pct, w.source]), [[60, 'online'], [80, 'keyed']])
  assert.strictEqual(r.Biology.weeklyAverage, 70)
  assert.strictEqual(r.Biology.endTerm, 70)
  assert.strictEqual(r.Biology.finalScore, 70)
})

test('a keyed-in end-of-term mark wins; the latest of several counts', () => {
  const r = mergeScores(
    [{ subject: 'Maths', title: 'Final exam', pct: 50 }],
    [{ subject: 'Maths', kind: 'endterm', date: '2026-11-20', score: 45, outOf: 50 }, { subject: 'Maths', kind: 'endterm', date: '2026-11-25', score: 40, outOf: 50 }],
  )
  assert.strictEqual(r.Maths.endTerm, 80)
  assert.strictEqual(r.Maths.endTermSource, 'keyed')
  assert.strictEqual(r.Maths.finalScore, 80)       // no weekly tests: end of term alone
})

test('missed tests do not count towards the average', () => {
  const r = mergeScores([{ subject: 'Physics', title: 'Week 1', pct: null }, { subject: 'Physics', title: 'Week 2', pct: 90 }], [])
  assert.strictEqual(r.Physics.weeklyAverage, 90)
  assert.strictEqual(r.Physics.endTerm, null)
  assert.strictEqual(r.Physics.finalScore, 90)
})
