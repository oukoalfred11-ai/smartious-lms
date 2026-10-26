/**
 * lib/spineLibrary.js — the school's built-in syllabus library (the same
 * spine data the admin Curriculum module loads from,
 * frontend/src/pages/admin/pages/modules/spineData.js), read on the server.
 *
 * Used where a subject's syllabus was never loaded into the database
 * (no SyllabusTopic rows): the next-lesson choice still offers the
 * standard syllabus for the subject's curriculum instead of an empty
 * list. Read-only; loading the spine for good stays an admin action.
 */
const path = require('path')
const { pathToFileURL } = require('url')

const FILE = path.join(__dirname, '..', '..', '..', 'frontend', 'src', 'pages', 'admin', 'pages', 'modules', 'spineData.js')

// Curriculum (Subject.curriculum) → library export, as in CurriculumModule.
const LIBRARY_FOR = {
  CambridgePrimary: 'PRIMARY_LIBRARY', CambridgeLowerSec: 'LOWER_SEC_LIBRARY',
  CambridgeIGCSE: 'IGCSE_LIBRARY', EdexcelIGCSE: 'IGCSE_LIBRARY',
  CambridgeALevel: 'ALEVEL_LIBRARY', EdexcelALevel: 'IAL_LIBRARY',
  EdexcelPrimary: 'IPRIMARY_LIBRARY', EdexcelLowerSec: 'ILOWER_SEC_LIBRARY',
  IBPYP: 'PYP_LIBRARY', IBMYP: 'MYP_LIBRARY', IBDP: 'IBDP_LIBRARY',
  KenyaCBE: 'CBE_LIBRARY', KCSE: 'KCSE_LIBRARY',
}

let mod = null
async function load() {
  if (!mod) mod = import(pathToFileURL(FILE).href).catch(e => { mod = null; throw e })
  return mod
}

/** { topics: [{ topic, subtopics: [{ name }] }], source } or null. */
async function librarySpine(curriculum, subjectName) {
  const key = LIBRARY_FOR[String(curriculum || '')]
  if (!key || !subjectName) return null
  let lib
  try { lib = (await load())[key] } catch (e) { console.error('[spineLibrary] could not read the syllabus library:', e.message); return null }
  if (!Array.isArray(lib)) return null
  const found = lib.find(e => e && e.match && e.match.test(subjectName))
  const entry = (found && found.byCurriculum && found.byCurriculum[curriculum]) || found
  if (!entry || !Array.isArray(entry.const_)) return null
  const topics = entry.const_.filter(t => t && t.topic && Array.isArray(t.subtopics))
  return topics.length ? { topics, source: entry.source || '' } : null
}

module.exports = { librarySpine, LIBRARY_FOR }
