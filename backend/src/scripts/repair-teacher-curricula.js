/**
 * scripts/repair-teacher-curricula.js
 * ══════════════════════════════════════════════════════════════════
 * Rebuilds `User.curriculum` for teachers whose array was flattened to a
 * single string by migrate-cbc-to-cbe.js.
 *
 * WHAT WENT WRONG
 * In MongoDB, { curriculum: 'KenyaCBC' } matches BOTH a string equal to
 * that value AND an array containing it. The migration ran its string
 * pass first with $set: { curriculum: 'KenyaCBE' }, which replaces the
 * whole field — so a teacher holding
 *     ['CambridgeIGCSE', 'KenyaCBC', 'IBDP']
 * became the plain string
 *     'KenyaCBE'
 * losing every other curriculum. The array branch then found nothing to
 * do, because the arrays no longer existed.
 *
 * The string pass should have been guarded with { curriculum: { $type:
 * 'string' } }, or the array pass should have run first.
 *
 * WHY THIS IS RECOVERABLE
 * teachingSpecialties[].curriculum was updated by a separate, correct
 * nested update and was never touched by the string pass. It records
 * which curricula each teacher actually teaches, so the array can be
 * rebuilt from it exactly.
 *
 * WHAT IT DOES
 * For every teacher whose `curriculum` is a STRING and who has
 * teachingSpecialties, rebuild `curriculum` as the distinct set of
 * specialty curricula. Legacy names found in older records (e.g.
 * 'Kenya CBC', 'IGCSE', 'A-Level') are normalised to current ids, and
 * anything unrecognised is dropped rather than written back.
 *
 * SAFE TO RUN TWICE — it only touches teachers whose curriculum is still
 * a string, so a second run reports zero changes.
 *
 * RUN:  node scripts/repair-teacher-curricula.js          (dry run)
 *       node scripts/repair-teacher-curricula.js --apply
 */

const mongoose = require('mongoose')
require('dotenv').config()

const APPLY = process.argv.includes('--apply')

// Valid curriculum ids, from constants/curriculum.js
const VALID = new Set([
  'CambridgePrimary', 'CambridgeLowerSec', 'CambridgeIGCSE', 'CambridgeALevel',
  'EdexcelPrimary', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel',
  'AQALowerSec', 'AQAGCSE', 'AQAALevel',
  'IBPYP', 'IBMYP', 'IBDP',
  'BNC', 'American', 'Canadian', 'KenyaCBE', 'KCSE',
])

// Older records carry display names rather than ids. Map what can be
// mapped; drop the rest rather than writing an invalid value.
const LEGACY = {
  'Kenya CBC': 'KenyaCBE',
  'Kenya CBE': 'KenyaCBE',
  'KenyaCBC':  'KenyaCBE',
  'IGCSE':     'CambridgeIGCSE',
  'A-Level':   'CambridgeALevel',
  'IB Diploma':'IBDP',
  'IB MYP':    'IBMYP',
  'IB PYP':    'IBPYP',
  'IB':        'IBDP',
}

const normalise = v => {
  const s = String(v || '').trim()
  if (VALID.has(s)) return s
  const mapped = LEGACY[s]
  return VALID.has(mapped) ? mapped : null
}

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI
  if (!uri) throw new Error('MONGODB_URI not set')
  await mongoose.connect(uri)
  const users = mongoose.connection.db.collection('users')

  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN'} — rebuilding flattened teacher curriculum arrays\n`)

  // A teacher whose curriculum is a plain string, with specialties to
  // rebuild from. Students legitimately hold a string, so the presence of
  // teachingSpecialties is what identifies a damaged teacher record.
  const damaged = await users.find({
    curriculum: { $type: 'string' },
    teachingSpecialties: { $exists: true, $ne: [] },
  }).toArray()

  if (!damaged.length) {
    console.log('  No flattened teacher records found. Nothing to do.')
    await mongoose.disconnect(); return
  }

  let fixed = 0, skipped = 0
  for (const u of damaged) {
    const rebuilt = [...new Set(
      (u.teachingSpecialties || []).map(s => normalise(s.curriculum)).filter(Boolean)
    )]
    const dropped = [...new Set(
      (u.teachingSpecialties || []).map(s => s.curriculum).filter(c => c && !normalise(c))
    )]

    if (!rebuilt.length) {
      skipped++
      console.log(`  SKIP  ${(u.email || u._id).padEnd(34)} no recognisable curricula in specialties`)
      continue
    }

    console.log(`  ${APPLY ? 'FIX ' : 'WOULD'}  ${(u.email || u._id).padEnd(34)} ` +
      `"${u.curriculum}" -> [${rebuilt.length}] ${rebuilt.slice(0, 5).join(', ')}${rebuilt.length > 5 ? ' …' : ''}` +
      (dropped.length ? `   (dropped unknown: ${dropped.join(', ')})` : ''))

    if (APPLY) {
      await users.updateOne({ _id: u._id }, { $set: { curriculum: rebuilt } })
      fixed++
    }
  }

  console.log(`\n  teachers examined: ${damaged.length}`)
  if (APPLY) {
    console.log(`  repaired:          ${fixed}`)
    console.log(`  skipped:           ${skipped}`)
    const left = await users.countDocuments({
      curriculum: { $type: 'string' },
      teachingSpecialties: { $exists: true, $ne: [] },
    })
    console.log(`  still flattened:   ${left}${left ? '   >> INVESTIGATE' : '   clean'}`)
  } else {
    console.log('\n  Nothing was changed. Re-run with --apply to repair.')
  }

  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
