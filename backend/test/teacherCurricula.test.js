const { test } = require('node:test')
const assert = require('node:assert')
const { TEACHER_CURRICULUM_IDS, CURRICULA } = require('../src/constants/curriculum')

test('every catalogue curriculum, Edexcel iPrimary included, can be a teacher speciality', () => {
  for (const c of CURRICULA) assert.ok(TEACHER_CURRICULUM_IDS.includes(c.id), c.id)
  assert.ok(TEACHER_CURRICULUM_IDS.includes('EdexcelPrimary'))
})

test('it matches the curricula the teacher record accepts (models/User.js)', () => {
  // Read the enum from the model source (mongoose is not needed for this).
  const src = require('fs').readFileSync(require('path').join(__dirname, '../src/models/User.js'), 'utf8')
  const start = src.indexOf('enum: [', src.indexOf('teachingSpecialties: [{'))
  const block = src.slice(start, src.indexOf(']', start)).replace(/\/\/.*$/gm, '')
  const enumIds = [...block.matchAll(/'([^']+)'/g)].map(m => m[1])
  assert.deepEqual([...TEACHER_CURRICULUM_IDS].sort(), [...enumIds].sort())
})
