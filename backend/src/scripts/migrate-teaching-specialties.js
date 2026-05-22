/**
 * MIGRATE TEACHING SPECIALTIES — PHASE 1
 * ===========================================================
 *
 * Updates the nested `teachingSpecialties[].curriculum` field on
 * User documents (role='teacher') from old curriculum strings to
 * the new 15-curriculum catalog values.
 *
 *   Old value      →  New value
 *   --------------    ----------------
 *   'IGCSE'        →  'CambridgeIGCSE'
 *   'A-Level'      →  'CambridgeALevel'
 *   'IB Diploma'   →  'IB'
 *   'IB MYP'       →  'IB'
 *   'Kenya CBC'    →  'KenyaCBC'
 *
 * NOT migrated (deliberate decision):
 *   'IUFP'         →  unchanged. The new catalog doesn't include
 *                     IUFP yet; pending product decision on whether
 *                     to re-add it. The User model's enum was made
 *                     backwards-compatible earlier today so 'IUFP'
 *                     remains a valid stored value.
 *
 * This unblocks the "no teacher registered for that subject"
 * symptom in the Admin Allocations UI. After today's earlier
 * top-level migration, students have curriculum='CambridgeIGCSE'
 * but teachers' teachingSpecialties still held curriculum='IGCSE'
 * (and similar for other curricula). The suggest-teachers query
 * filters by exact match — old !== new, so no teachers returned.
 *
 * Idempotent — safe to run twice. The second run finds nothing
 * to update.
 *
 * USAGE:
 *   cd backend
 *   node src/scripts/migrate-teaching-specialties.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const RENAMES = {
  'IGCSE':      'CambridgeIGCSE',
  'A-Level':    'CambridgeALevel',
  'IB Diploma': 'IB',
  'IB MYP':     'IB',
  'Kenya CBC':  'KenyaCBC',
  // IUFP: deliberately not migrated. See header.
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected.');

  const db = mongoose.connection.db;
  const Users = db.collection('users');

  // First, report current state of teachingSpecialties curriculum values
  console.log('\nBefore migration — teachingSpecialties.curriculum value counts:');
  const before = await Users.aggregate([
    { $match: { role: 'teacher' } },
    { $unwind: '$teachingSpecialties' },
    { $group: { _id: '$teachingSpecialties.curriculum', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();
  for (const row of before) {
    console.log(`  '${row._id}': ${row.count}`);
  }

  let totalChanged = 0;

  // Apply each rename in turn using arrayFilters to target
  // individual array elements without overwriting the whole array.
  for (const [oldVal, newVal] of Object.entries(RENAMES)) {
    const result = await Users.updateMany(
      { role: 'teacher', 'teachingSpecialties.curriculum': oldVal },
      { $set: { 'teachingSpecialties.$[elem].curriculum': newVal } },
      { arrayFilters: [{ 'elem.curriculum': oldVal }] }
    );
    if (result.modifiedCount > 0) {
      console.log(`\n  teachers: '${oldVal}' → '${newVal}': ${result.modifiedCount} users updated`);
      totalChanged += result.modifiedCount;
    }
  }

  console.log(`\nMigration complete. Total user records updated: ${totalChanged}`);
  console.log('(Note: one user may have had multiple specialty entries renamed; modifiedCount counts users, not specialty entries.)');

  // Final report — what's left in teachingSpecialties.curriculum now
  console.log('\nAfter migration — teachingSpecialties.curriculum value counts:');
  const after = await Users.aggregate([
    { $match: { role: 'teacher' } },
    { $unwind: '$teachingSpecialties' },
    { $group: { _id: '$teachingSpecialties.curriculum', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();
  for (const row of after) {
    console.log(`  '${row._id}': ${row.count}`);
  }

  // Sanity check: no old strings should remain (except IUFP)
  const oldStillThere = after.filter(r =>
    Object.keys(RENAMES).includes(r._id)
  );
  if (oldStillThere.length > 0) {
    console.warn('\n⚠  WARNING: Some old curriculum strings remain after migration:');
    for (const r of oldStillThere) console.warn(`     '${r._id}': ${r.count}`);
    console.warn('   This is unexpected. The migration should have caught these.');
  } else {
    console.log('\n✓  No legacy curriculum strings remain in teachingSpecialties (apart from IUFP if present, which is intentional).');
  }

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
