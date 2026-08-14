/**
 * scripts/migrate-cbc-to-cbe.js
 * ══════════════════════════════════════════════════════════════════
 * Renames the curriculum identifier KenyaCBC -> KenyaCBE everywhere.
 *
 * WHY THIS IS A SCRIPT AND NOT A FIND-AND-REPLACE
 * The curriculum is stored as a plain string in 23 collections. Changing
 * the enum in the models without migrating the data would leave every
 * existing KenyaCBC record failing validation on its next save, and
 * invisible to any query filtering on the new value.
 *
 * THREE FIELD SHAPES, THREE DIFFERENT UPDATES
 *   1. plain string   — curriculum: 'KenyaCBC'          (most collections)
 *   2. array of string— curricula: ['KenyaCBC', ...]    (Question, Teacher,
 *                       and User.curriculum when the user is a teacher)
 *   3. nested subdoc  — User.teachingSpecialties[].curriculum
 *
 * A single updateMany on a string field silently misses 2 and 3, which is
 * how half-migrated data happens.
 *
 * SAFE TO RUN TWICE. Every update is conditional on the old value still
 * being present, so a second run reports zero changes rather than
 * corrupting anything.
 *
 * RUN:  node scripts/migrate-cbc-to-cbe.js          (dry run, changes nothing)
 *       node scripts/migrate-cbc-to-cbe.js --apply  (performs the migration)
 */

const mongoose = require('mongoose')
require('dotenv').config()

const OLD = 'KenyaCBC'
const NEW = 'KenyaCBE'
const APPLY = process.argv.includes('--apply')

// Collections with a plain `curriculum` string.
const STRING_COLLECTIONS = [
  'allocations', 'attendances', 'exams', 'frontdesksubmissions', 'grouprooms',
  'homeworks', 'inquiries', 'lessons', 'librarybooks', 'liveclasses',
  'questions', 'quizsessions', 'reports', 'spinebackups',
  'studentsyllabusprogresses', 'subjects', 'syllabustopics', 'teachers',
  'timetables', 'timetableentries', 'users', 'weeklyreports',
]

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI
  if (!uri) throw new Error('MONGODB_URI not set')
  await mongoose.connect(uri)
  const db = mongoose.connection.db
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN'} — ${OLD} -> ${NEW}\n`)

  let totalFound = 0, totalChanged = 0

  // ── 1. plain string fields ──────────────────────────────
  for (const name of STRING_COLLECTIONS) {
    const col = db.collection(name)
    const n = await col.countDocuments({ curriculum: OLD })
    if (!n) continue
    totalFound += n
    if (APPLY) {
      const r = await col.updateMany({ curriculum: OLD }, { $set: { curriculum: NEW } })
      totalChanged += r.modifiedCount
      console.log(`  ${name.padEnd(28)} curriculum      ${String(n).padStart(5)} -> ${r.modifiedCount} updated`)
    } else {
      console.log(`  ${name.padEnd(28)} curriculum      ${String(n).padStart(5)} would update`)
    }
  }

  // ── 2. array fields ─────────────────────────────────────
  // Question.curricula and Teacher.curriculum are arrays; User.curriculum
  // is a string for students but an array for teachers, so the same
  // collection needs both treatments.
  const ARRAY_TARGETS = [
    ['questions', 'curricula'],
    ['teachers',  'curriculum'],
    ['users',     'curriculum'],
  ]
  for (const [name, field] of ARRAY_TARGETS) {
    const col = db.collection(name)
    // $elemMatch only matches when the field really is an array
    const n = await col.countDocuments({ [field]: { $elemMatch: { $eq: OLD } } })
    if (!n) continue
    totalFound += n
    if (APPLY) {
      // positional $ updates the matched element in place
      const r = await col.updateMany(
        { [field]: OLD },
        { $set: { [`${field}.$[el]`]: NEW } },
        { arrayFilters: [{ el: OLD }] })
      totalChanged += r.modifiedCount
      console.log(`  ${name.padEnd(28)} ${field.padEnd(15)} ${String(n).padStart(5)} -> ${r.modifiedCount} updated (array)`)
    } else {
      console.log(`  ${name.padEnd(28)} ${field.padEnd(15)} ${String(n).padStart(5)} would update (array)`)
    }
  }

  // ── 3. nested subdocuments ──────────────────────────────
  {
    const col = db.collection('users')
    const n = await col.countDocuments({ 'teachingSpecialties.curriculum': OLD })
    if (n) {
      totalFound += n
      if (APPLY) {
        const r = await col.updateMany(
          { 'teachingSpecialties.curriculum': OLD },
          { $set: { 'teachingSpecialties.$[s].curriculum': NEW } },
          { arrayFilters: [{ 's.curriculum': OLD }] })
        totalChanged += r.modifiedCount
        console.log(`  ${'users'.padEnd(28)} ${'teachingSpec'.padEnd(15)} ${String(n).padStart(5)} -> ${r.modifiedCount} updated (nested)`)
      } else {
        console.log(`  ${'users'.padEnd(28)} ${'teachingSpec'.padEnd(15)} ${String(n).padStart(5)} would update (nested)`)
      }
    }
  }

  console.log(`\n  documents holding "${OLD}": ${totalFound}`)
  if (APPLY) {
    console.log(`  documents updated:        ${totalChanged}`)
    // Verify nothing was missed.
    let left = 0
    for (const name of STRING_COLLECTIONS) {
      left += await db.collection(name).countDocuments({ curriculum: OLD })
    }
    left += await db.collection('questions').countDocuments({ curricula: OLD })
    left += await db.collection('teachers').countDocuments({ curriculum: OLD })
    left += await db.collection('users').countDocuments({ curriculum: OLD })
    left += await db.collection('users').countDocuments({ 'teachingSpecialties.curriculum': OLD })
    console.log(`  remaining "${OLD}" anywhere: ${left}${left ? '   >> INVESTIGATE' : '   clean'}`)
  } else {
    console.log('\n  Nothing was changed. Re-run with --apply to perform the migration.')
  }

  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
