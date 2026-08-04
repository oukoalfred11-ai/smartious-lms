/**
 * MIGRATE FLAT 'IB' CURRICULUM TO THE PYP/MYP/DP SPLIT
 * ===========================================================
 *
 * On 2026-08-04 the single 'IB' curriculum was split into three,
 * mirroring the Cambridge stage split:
 *
 *   IBPYP  - IB Primary Years (PYP Grade 1-5)
 *   IBMYP  - IB Middle Years  (MYP Grade 6-10)
 *   IBDP   - IB Diploma       (DP Year 1-2)
 *
 * Every subject seeded under the old flat 'IB' curriculum was
 * DP-level (HL/SL pairs, TOK, EE, CAS), so 'IB' records are
 * retagged to 'IBDP' as the safe default:
 *
 *   Old value  ->  New value
 *   ---------      ---------
 *   'IB'       ->  'IBDP'
 *
 * Special case: users whose gradeLevel clearly indicates PYP or
 * MYP (gradeLevel starts with 'PYP' or 'MYP') are retagged to
 * IBPYP / IBMYP instead, so the handful of younger IB students,
 * if any, land in the right programme automatically.
 *
 * Collections touched (same set as the earlier curriculum
 * migrations, plus questions and librarybooks which now carry
 * curriculum tags):
 *   subjects, allocations, timetables, liveclasses,
 *   questions, librarybooks,
 *   users (student top-level string, teacher array elements,
 *          teachingSpecialties array).
 *
 * Idempotent - safe to re-run. Running it twice changes nothing
 * the second time because no 'IB' values remain.
 *
 * USAGE:
 *   cd backend
 *   node src/scripts/migrate-ib-split.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const OLD = 'IB';
const DEFAULT_NEW = 'IBDP';

// All 17 valid new-catalog curriculum strings - used by the
// post-migration sanity check.
const NEW_CATALOG = new Set([
  'CambridgePrimary', 'CambridgeLowerSec', 'CambridgeIGCSE', 'CambridgeALevel',
  'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel',
  'AQALowerSec', 'AQAGCSE', 'AQAALevel',
  'IBPYP', 'IBMYP', 'IBDP',
  'BNC', 'American', 'Canadian', 'KenyaCBC',
]);

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected.');

  const db = mongoose.connection.db;
  let totalChanged = 0;

  // ── 1. Simple retag across curriculum-tagged collections ──
  const COLLECTIONS = ['subjects', 'allocations', 'timetables', 'liveclasses', 'questions', 'librarybooks'];

  for (const collName of COLLECTIONS) {
    const coll = db.collection(collName);
    const result = await coll.updateMany(
      { curriculum: OLD },
      { $set: { curriculum: DEFAULT_NEW } }
    );
    console.log(`${collName}: 'IB' -> 'IBDP': ${result.modifiedCount}`);
    totalChanged += result.modifiedCount;
  }

  const Users = db.collection('users');

  // ── 2. Students (top-level curriculum string) ──────────────
  // Grade-aware: PYP/MYP grade names route to the right programme.
  console.log('\nusers (student top-level curriculum):');

  let r = await Users.updateMany(
    { role: 'student', curriculum: OLD, gradeLevel: { $regex: '^PYP' } },
    { $set: { curriculum: 'IBPYP' } }
  );
  console.log(`  students with PYP grade -> 'IBPYP': ${r.modifiedCount}`);
  totalChanged += r.modifiedCount;

  r = await Users.updateMany(
    { role: 'student', curriculum: OLD, gradeLevel: { $regex: '^MYP' } },
    { $set: { curriculum: 'IBMYP' } }
  );
  console.log(`  students with MYP grade -> 'IBMYP': ${r.modifiedCount}`);
  totalChanged += r.modifiedCount;

  r = await Users.updateMany(
    { role: 'student', curriculum: OLD },
    { $set: { curriculum: DEFAULT_NEW } }
  );
  console.log(`  remaining students -> 'IBDP': ${r.modifiedCount}`);
  totalChanged += r.modifiedCount;

  // ── 3. Teachers (curriculum stored as array of strings) ────
  // Loop because $ positional only updates the first match.
  console.log('\nusers (teacher curriculum array elements):');
  let teacherLoops = 0;
  while (true) {
    const result = await Users.updateMany(
      { role: 'teacher', curriculum: OLD },
      { $set: { 'curriculum.$': DEFAULT_NEW } }
    );
    totalChanged += result.modifiedCount;
    teacherLoops += result.modifiedCount;
    if (result.modifiedCount === 0) break;
  }
  console.log(`  'IB' -> 'IBDP' in teacher arrays: ${teacherLoops}`);

  // ── 4. teachingSpecialties[].curriculum (all roles) ────────
  const rs = await Users.updateMany(
    { 'teachingSpecialties.curriculum': OLD },
    { $set: { 'teachingSpecialties.$[el].curriculum': DEFAULT_NEW } },
    { arrayFilters: [{ 'el.curriculum': OLD }] }
  );
  console.log(`\nteachingSpecialties 'IB' -> 'IBDP': ${rs.modifiedCount}`);
  totalChanged += rs.modifiedCount;

  console.log(`\nMigration complete. Total records updated: ${totalChanged}`);

  // ── 5. Post-migration sanity check ─────────────────────────
  console.log('\n==================================================');
  console.log('Post-migration sanity check');
  console.log('==================================================');

  let anyIBRemaining = false;

  for (const collName of [...COLLECTIONS, 'users']) {
    const coll = db.collection(collName);
    const distinct = await coll.aggregate([
      { $match: { curriculum: { $exists: true, $ne: null, $ne: '' } } },
      { $unwind: { path: '$curriculum', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$curriculum', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).toArray();

    const bad = distinct.filter(x => x._id === OLD);
    const unknown = distinct.filter(x => x._id && !NEW_CATALOG.has(x._id) && x._id !== OLD);

    console.log(`\n${collName}:`);
    distinct.forEach(x => console.log(`  ${x._id}: ${x.count}`));
    if (bad.length) { console.log(`  WARNING: 'IB' values remain in ${collName}`); anyIBRemaining = true; }
    if (unknown.length) console.log(`  NOTE: non-catalog values (legacy, left alone): ${unknown.map(x => x._id).join(', ')}`);
  }

  console.log(anyIBRemaining
    ? '\nRESULT: some IB values remain - re-run or inspect manually.'
    : '\nRESULT: clean - no flat IB values remain.');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
