// The A Level admissions page lists every A Level subject in the database:
// frontend/src/data/aLevelAdmissions2027.js must match the seed list in
// backend/src/routes/seed-subjects.js, board by board.
const test = require('node:test')
const assert = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const seed = fs.readFileSync(path.join(__dirname, '../src/routes/seed-subjects.js'), 'utf8')
const fromSeed = (cur) => [...seed.matchAll(new RegExp(`curriculum:'${cur}', subjectName:'([^']+)'`, 'g'))].map(m => m[1]).sort()

test('A Level admissions page lists every A Level subject in the database', async () => {
  const { A_LEVEL_SUBJECTS } = await import(pathToFileURL(path.join(__dirname, '../../frontend/src/data/aLevelAdmissions2027.js')).href)
  const page = (b) => Object.values(A_LEVEL_SUBJECTS[b]).flat().sort()
  assert.deepStrictEqual(page('cambridge'), fromSeed('CambridgeALevel'))
  assert.deepStrictEqual(page('edexcel'), fromSeed('EdexcelALevel'))
})
