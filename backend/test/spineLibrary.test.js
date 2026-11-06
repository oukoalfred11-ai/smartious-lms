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

test('Cambridge Lower Secondary Religious Studies has its own scheme', async () => {
  const r = await librarySpine('CambridgeLowerSec', 'Religious Studies')
  assert.ok(r && /Religious Studies/.test(r.source))
  assert.ok(r.topics.length >= 10)
  const h = await librarySpine('CambridgeLowerSec', 'History')
  assert.ok(h && /History/.test(h.source))
})

test('Edexcel IGCSE Global Citizenship and Italian, and Kenya CBE Art and Design, have schemes', async () => {
  const gc = await librarySpine('EdexcelIGCSE', 'Global Citizenship')
  assert.ok(gc && /Global Citizenship 4GL1/.test(gc.source) && gc.topics.length === 6)
  const it = await librarySpine('EdexcelIGCSE', 'Italian')
  assert.ok(it && /Italian/.test(it.source) && it.topics.length === 7)
  const fr = await librarySpine('EdexcelIGCSE', 'French')
  assert.ok(fr && /French/.test(fr.source))
  const art = await librarySpine('KenyaCBE', 'Art and Design')
  assert.ok(art && /Art and Design/.test(art.source) && art.topics.length === 7)
  const phy = await librarySpine('KenyaCBE', 'Physics')
  assert.ok(phy && /Physics/.test(phy.source))
})
