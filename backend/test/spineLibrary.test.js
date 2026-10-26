const test = require('node:test')
const assert = require('node:assert')
const { librarySpine } = require('../src/lib/spineLibrary')

test('built-in syllabus is found by curriculum and subject name', async () => {
  const a = await librarySpine('CambridgeALevel', 'Chemistry')
  assert.ok(a && a.topics.length > 0 && /9701/.test(a.source))
  const e = await librarySpine('EdexcelIGCSE', 'Chemistry')
  assert.ok(e && /4CH1/.test(e.source))
  assert.strictEqual(await librarySpine('CambridgeALevel', 'No such subject'), null)
  assert.strictEqual(await librarySpine('UnknownCurriculum', 'Chemistry'), null)
})
