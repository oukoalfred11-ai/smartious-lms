/**
 * scripts/check-teacher-curricula.js
 * ══════════════════════════════════════════════════════════════════
 * Reports the TRUE shape of User.curriculum for every teacher.
 *
 * WHY A SPECIAL QUERY IS NEEDED
 * { curriculum: { $type: 'string' } } does NOT mean "the field is a
 * string". On an array field, $type matches if any ELEMENT is a string —
 * the same array semantics that caused the original migration bug. So
 * that query reports arrays as strings and cannot distinguish the two.
 *
 * $expr with $type applied to "$curriculum" evaluates the FIELD, not its
 * elements, and gives the real answer.
 *
 * Read-only. Changes nothing.
 */

const mongoose = require('mongoose')
require('dotenv').config()

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI
  if (!uri) throw new Error('MONGODB_URI not set')
  await mongoose.connect(uri)
  const users = mongoose.connection.db.collection('users')

  const rows = await users.aggregate([
    { $match: { teachingSpecialties: { $exists: true, $ne: [] } } },
    { $project: {
        email: 1,
        shape: { $type: '$curriculum' },
        value: '$curriculum',
        specCount: { $size: { $ifNull: ['$teachingSpecialties', []] } },
    } },
  ]).toArray()

  const byShape = {}
  rows.forEach(r => { (byShape[r.shape] = byShape[r.shape] || []).push(r) })

  console.log('\nTEACHER curriculum FIELD — true shapes\n')
  Object.entries(byShape).forEach(([shape, arr]) => {
    console.log(`  ${shape.padEnd(10)} ${arr.length} teacher(s)`)
  })

  const strings = byShape.string || []
  if (strings.length) {
    console.log('\n  STILL FLATTENED (curriculum is a plain string):')
    strings.forEach(r => console.log(`    ${(r.email || r._id).padEnd(34)} "${r.value}"   ${r.specCount} specialties`))
  } else {
    console.log('\n  No teacher holds a flattened string. Clean.')
  }

  const arrays = byShape.array || []
  if (arrays.length) {
    console.log('\n  ARRAYS (correct shape) — first five:')
    arrays.slice(0, 5).forEach(r =>
      console.log(`    ${(r.email || r._id).padEnd(34)} [${r.value.length}] ${r.value.slice(0, 4).join(', ')}${r.value.length > 4 ? ' …' : ''}`))
    // Flag any array holding a value that is not a known curriculum id
    const VALID = new Set(['CambridgePrimary','CambridgeLowerSec','CambridgeIGCSE','CambridgeALevel',
      'EdexcelPrimary','EdexcelLowerSec','EdexcelIGCSE','EdexcelALevel','AQALowerSec','AQAGCSE',
      'AQAALevel','IBPYP','IBMYP','IBDP','BNC','American','Canadian','KenyaCBE','KCSE'])
    const bad = arrays.filter(r => (r.value || []).some(v => !VALID.has(v)))
    console.log(`\n  arrays containing an unknown curriculum id: ${bad.length}`)
    bad.slice(0, 5).forEach(r =>
      console.log(`    ${(r.email || r._id).padEnd(34)} ${(r.value || []).filter(v => !VALID.has(v)).join(', ')}`))
  }

  const legacy = await users.countDocuments({ curriculum: 'KenyaCBC' })
  const legacyNested = await users.countDocuments({ 'teachingSpecialties.curriculum': 'KenyaCBC' })
  console.log(`\n  any KenyaCBC left: curriculum ${legacy}, specialties ${legacyNested}`)

  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
