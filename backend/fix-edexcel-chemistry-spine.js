/**
 * fix-edexcel-chemistry-spine.js
 * The Pearson Edexcel International GCSE Chemistry (4CH1) spine for the
 * Edexcel IGCSE Chemistry subject(s), which teachers reported as missing
 * Section 1 · Principles of Chemistry: states of matter; elements,
 * compounds and mixtures; atomic structure; the Periodic Table; writing
 * equations; the mole.
 *
 * The spine is stored per subject (SyllabusTopic). The Edexcel version
 * only loads when "Edexcel IGCSE" is selected in Admin → Curriculum; a
 * subject loaded earlier, or loaded with Cambridge IGCSE selected, holds
 * the Cambridge 0620 spine or an incomplete one. This shows what each
 * Edexcel Chemistry subject holds and fixes it from the same spine data
 * the Curriculum module uses (frontend/.../spineData.js).
 *
 * Usage (Render shell, from backend/):
 *   node fix-edexcel-chemistry-spine.js            # preview: what is stored, what is missing
 *   node fix-edexcel-chemistry-spine.js --apply    # add the missing 4CH1 topics/subtopics (nothing removed)
 *   node fix-edexcel-chemistry-spine.js --replace  # replace the spine with 4CH1 (refuses if questions
 *                                                   # would lose their subtopic; add --accept-orphans)
 * A backup of the current spine is saved (SpineBackup) before any change;
 * restore it with POST /api/syllabus/restore/<backupId>.
 */
require('dotenv').config()
const path = require('path')
const { pathToFileURL } = require('url')
const mongoose = require('mongoose')

const APPLY = process.argv.includes('--apply')
const REPLACE = process.argv.includes('--replace')
const ACCEPT_ORPHANS = process.argv.includes('--accept-orphans')
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// What the teacher listed, to say plainly whether each is there.
const REPORTED = [
  ['Principles of Chemistry (section)', /principles of chemistry/],
  ['States of matter', /states? of matter/],
  ['Elements, compounds and mixtures', /elements.*compounds.*mixtures|compounds.*mixtures/],
  ['Atomic structure', /atomic structure/],
  ['The Periodic Table', /periodic table/],
  ['Writing equations', /equation/],
  ['The mole', /\bmoles?\b/],
]

async function main() {
  if (!process.env.MONGODB_URI) { console.error('MONGODB_URI is not set.'); process.exit(1) }
  const spineFile = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'admin', 'pages', 'modules', 'spineData.js')
  const { IGCSE_LIBRARY } = await import(pathToFileURL(spineFile).href)
  const entry = IGCSE_LIBRARY.find(e => e.match.test('Chemistry'))?.byCurriculum?.EdexcelIGCSE
  if (!entry) { console.error('The Edexcel 4CH1 spine was not found in spineData.js.'); process.exit(1) }
  const SPINE = entry.const_, SOURCE = entry.source

  await mongoose.connect(process.env.MONGODB_URI)
  const Subject = require('./src/models/Subject')
  const SyllabusTopic = require('./src/models/SyllabusTopic')
  const SpineBackup = require('./src/models/SpineBackup')
  const Question = require('./src/models/Question')

  const subjects = await Subject.find({ subjectName: /chemistry/i, curriculum: /edexcel/i }).lean()
  const igcse = subjects.filter(s => !/a.?level|ial|international a/i.test(s.curriculum + ' ' + s.subjectName))
  if (!igcse.length) {
    console.log('No Edexcel IGCSE Chemistry subject found. Subjects named Chemistry:')
    for (const s of await Subject.find({ subjectName: /chemistry/i }).select('subjectName curriculum').lean()) console.log(`  ${s.curriculum} · ${s.subjectName} (${s._id})`)
    await mongoose.disconnect(); return
  }

  for (const subject of igcse) {
    console.log(`\n══ ${subject.curriculum} · ${subject.subjectName} (${subject._id}) ══`)
    const topics = await SyllabusTopic.find({ subjectId: subject._id }).sort({ topicOrder: 1 }).lean()
    const sources = [...new Set(topics.map(t => t.sourceSyllabus).filter(Boolean))]
    console.log(`Stored: ${topics.length} topic(s), ${topics.reduce((n, t) => n + (t.subtopics || []).length, 0)} subtopic(s)${sources.length ? ' · source: ' + sources.join('; ') : ''}`)
    topics.forEach(t => console.log(`  ${t.code ? t.code + ' ' : ''}${t.topic} (${(t.subtopics || []).length})`))
    if (sources.some(s => /0620|cambridge/i.test(s))) console.log('  ⚠ This subject holds the CAMBRIDGE 0620 spine, not Edexcel 4CH1.')

    const allText = topics.flatMap(t => [t.topic, ...(t.subtopics || []).map(s => s.name)]).join(' | ').toLowerCase()
    console.log('\nThe teacher’s list:')
    for (const [label, re] of REPORTED) console.log(`  ${re.test(allText) ? '✓ present' : '✗ MISSING'}  ${label}`)

    // What 4CH1 has that this spine lacks (by subtopic name).
    const have = new Set(topics.flatMap(t => (t.subtopics || []).map(s => norm(s.name))))
    const missing = SPINE.map(t => ({ ...t, subtopics: t.subtopics.filter(s => !have.has(norm(s.name))) })).filter(t => t.subtopics.length)
    const nMissing = missing.reduce((n, t) => n + t.subtopics.length, 0)
    console.log(`\n4CH1 subtopics not in this spine: ${nMissing} of ${SPINE.reduce((n, t) => n + t.subtopics.length, 0)}`)
    missing.forEach(t => console.log(`  ${t.topic}: ${t.subtopics.length} (${t.subtopics.slice(0, 3).map(s => s.name).join('; ')}${t.subtopics.length > 3 ? '; …' : ''})`))

    if (!APPLY && !REPLACE) continue
    if (APPLY && !nMissing) { console.log('Nothing to add.'); continue }

    let backupId = null
    if (topics.length) {
      const b = await SpineBackup.create({ subjectId: subject._id, subjectName: subject.subjectName, curriculum: subject.curriculum, topics, reason: 'fix-edexcel-chemistry-spine ' + (REPLACE ? '--replace' : '--apply') })
      backupId = b._id
      console.log(`Backup saved: ${backupId}`)
    }
    const doc = (t, i) => ({
      subjectId: subject._id, curriculum: subject.curriculum, subjectName: subject.subjectName,
      topic: t.topic, code: t.code || '', topicOrder: i, sourceSyllabus: SOURCE,
      subtopics: t.subtopics.map((s, j) => ({ name: s.name, code: s.code || '', subOrder: j, suggestedLessons: s.suggestedLessons ?? 1, objectives: s.objectives || [] })),
    })

    if (REPLACE) {
      const incoming = new Set(SPINE.flatMap(t => t.subtopics.map(s => s.name.trim())))
      const losing = topics.flatMap(t => (t.subtopics || []).map(s => s.name)).filter(n => !incoming.has(String(n).trim()))
      const orphaned = losing.length ? await Question.countDocuments({ subject: subject.subjectName, curriculum: subject.curriculum, subtopic: { $in: losing } }) : 0
      if (orphaned && !ACCEPT_ORPHANS) {
        console.log(`Not replaced: ${orphaned} question(s) are filed under subtopics 4CH1 does not have (e.g. ${losing.slice(0, 3).join('; ')}). Use --apply to add what is missing instead, or add --accept-orphans.`)
        continue
      }
      await SyllabusTopic.deleteMany({ subjectId: subject._id })
      await SyllabusTopic.insertMany(SPINE.map(doc))
      console.log(`Replaced with ${SOURCE}: ${SPINE.length} sections, ${SPINE.reduce((n, t) => n + t.subtopics.length, 0)} subtopics.${orphaned ? ' ' + orphaned + ' question(s) lost their subtopic.' : ''}`)
      continue
    }

    // --apply: add missing subtopics to the matching section (same name or
    // code), or add the section, keeping everything already there.
    let added = 0
    for (const t of missing) {
      const i = SPINE.findIndex(x => x.topic === t.topic)
      const match = topics.find(x => norm(x.topic) === norm(t.topic) || (x.code && x.code === t.code && /section/i.test(x.topic)))
      if (match) {
        const start = (match.subtopics || []).length
        await SyllabusTopic.updateOne({ _id: match._id }, { $push: { subtopics: { $each: t.subtopics.map((s, j) => ({ name: s.name, code: s.code || '', subOrder: start + j, suggestedLessons: s.suggestedLessons ?? 1, objectives: [] })) } } })
      } else {
        await SyllabusTopic.create(doc(t, topics.length + i))
      }
      added += t.subtopics.length
    }
    // Put the sections in 4CH1 order (1-4); any other topics follow, as they were.
    const now = await SyllabusTopic.find({ subjectId: subject._id }).sort({ topicOrder: 1 }).lean()
    const rank = (t) => { const k = SPINE.findIndex(x => norm(x.topic) === norm(t.topic)); return k < 0 ? SPINE.length + now.indexOf(t) : k }
    const ordered = [...now].sort((a, b) => rank(a) - rank(b))
    for (let k = 0; k < ordered.length; k++) await SyllabusTopic.updateOne({ _id: ordered[k]._id }, { $set: { topicOrder: k } })
    console.log(`Added ${added} subtopic(s). Nothing was removed.${backupId ? ' Restore with POST /api/syllabus/restore/' + backupId : ''}`)
  }
  if (!APPLY && !REPLACE) console.log('\nPreview only. --apply adds what is missing (nothing removed); --replace loads the full 4CH1 spine.')
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
