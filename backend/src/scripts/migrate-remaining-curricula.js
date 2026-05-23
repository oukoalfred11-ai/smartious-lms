/**
 * MIGRATE REMAINING LEGACY CURRICULUM STRINGS
 * ===========================================================
 *
 * Migration #2 for top-level curriculum strings. Today's earlier
 * migration covered: IGCSE, Primary, Cambridge (the A/AS umbrella),
 * Edexcel. This one covers the four legacy strings that were missed:
 *
 *   Old value      →  New value
 *   --------------    ----------------
 *   'A-Level'      →  'CambridgeALevel'
 *   'IB Diploma'   →  'IB'    (collapse — single IB curriculum)
 *   'IB MYP'       →  'IB'    (collapse)
 *   'Kenya CBC'    →  'KenyaCBC'   (space removed)
 *
 * Touches the same 4 collections as today's earlier curriculum
 * migration: subjects, allocations, timetables, liveclasses.
 *
 * Idempotent — safe to re-run.
 *
 * AFTER this migration runs successfully:
 *   - Update Subject.js to remove the 9 legacy values from the
 *     curriculum enum (Phase 3.6 enum tightening). Only do this
 *     AFTER the post-migration sanity check confirms no legacy
 *     values remain.
 *
 * USAGE:
 *   cd backend
 *   node src/scripts/migrate-remaining-curricula.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const RENAMES = {
  'A-Level':    'CambridgeALevel',
  'IB Diploma': 'IB',
  'IB MYP':     'IB',
  'Kenya CBC':  'KenyaCBC',
};

// All 15 valid new-catalog curriculum strings — used by the
// post-migration sanity check.
const NEW_CATALOG = new Set([
  'CambridgePrimary', 'CambridgeLowerSec', 'CambridgeIGCSE', 'CambridgeALevel',
  'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel',
  'AQALowerSec', 'AQAGCSE', 'AQAALevel',
  'IB', 'BNC', 'American', 'Canadian', 'KenyaCBC',
]);

// Legacy strings we recognise (used to flag known-bad values).
const LEGACY_VALUES = new Set([
  'IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC',
  'IUFP', 'Primary', 'Cambridge', 'Edexcel',
]);

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected.');

  const db = mongoose.connection.db;
  let totalChanged = 0;

  // ── 1. Apply renames across collections ────────────────────
  const COLLECTIONS = ['subjects', 'allocations', 'timetables', 'liveclasses'];

  for (const collName of COLLECTIONS) {
    const coll = db.collection(collName);
    console.log(`\n── ${collName} ──`);

    for (const [oldVal, newVal] of Object.entries(RENAMES)) {
      const result = await coll.updateMany(
        { curriculum: oldVal },
        { $set: { curriculum: newVal } }
      );
      if (result.modifiedCount > 0) {
        console.log(`  '${oldVal}' → '${newVal}': ${result.modifiedCount}`);
        totalChanged += result.modifiedCount;
      }
    }
  }

  // ── 2. Also migrate users.curriculum (top-level — for students) ──
  //    Earlier migration didn't catch A-Level, IB Diploma, IB MYP,
  //    or Kenya CBC if any students held those values.
  const Users = db.collection('users');
  console.log(`\n── users (student top-level curriculum) ──`);
  for (const [oldVal, newVal] of Object.entries(RENAMES)) {
    const result = await Users.updateMany(
      { role: 'student', curriculum: oldVal },
      { $set: { curriculum: newVal } }
    );
    if (result.modifiedCount > 0) {
      console.log(`  '${oldVal}' → '${newVal}': ${result.modifiedCount}`);
      totalChanged += result.modifiedCount;
    }
  }

  // ── 3. Also migrate users.curriculum array elements (for teachers) ──
  console.log(`\n── users (teacher curriculum array elements) ──`);
  for (const [oldVal, newVal] of Object.entries(RENAMES)) {
    const result = await Users.updateMany(
      { role: 'teacher', curriculum: oldVal },
      { $set: { 'curriculum.$': newVal } }
    );
    if (result.modifiedCount > 0) {
      console.log(`  '${oldVal}' → '${newVal}': ${result.modifiedCount}`);
      totalChanged += result.modifiedCount;
    }
  }

  console.log(`\nMigration complete. Total records updated: ${totalChanged}`);

  // ── 4. Post-migration sanity check ─────────────────────────
  console.log('\n══════════════════════════════════════════════════');
  console.log('Post-migration sanity check');
  console.log('══════════════════════════════════════════════════');

  let anyLegacyRemaining = false;

  for (const collName of COLLECTIONS) {
    const coll = db.collection(collName);
    const distinct = await coll.aggregate([
      { $group: { _id: '$curriculum', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).toArray();

    const legacyHere = distinct.filter(r => LEGACY_VALUES.has(r._id));
    const unknownHere = distinct.filter(r =>
      r._id !== null && !NEW_CATALOG.has(r._id) && !LEGACY_VALUES.has(r._id)
    );

    if (legacyHere.length === 0 && unknownHere.length === 0) {
      console.log(`✓  ${collName}: all clean`);
    } else {
      anyLegacyRemaining = true;
      console.log(`⚠  ${collName}: issues found`);
      for (const r of legacyHere) {
        console.log(`     LEGACY '${r._id}': ${r.count}`);
      }
      for (const r of unknownHere) {
        console.log(`     UNKNOWN '${r._id}': ${r.count}`);
      }
    }
  }

  // Users — check both student top-level and teacher arrays
  console.log('\n── users top-level curriculum (students) ──');
  const studentDistinct = await Users.aggregate([
    { $match: { role: 'student' } },
    { $group: { _id: '$curriculum', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();
  for (const r of studentDistinct) {
    const status = NEW_CATALOG.has(r._id) ? '✓' : LEGACY_VALUES.has(r._id) ? '⚠ LEGACY' : '? UNKNOWN';
    console.log(`  ${status} '${r._id}': ${r.count}`);
    if (!NEW_CATALOG.has(r._id) && r._id !== null) anyLegacyRemaining = true;
  }

  console.log('\n── users teacher curriculum array (unwound) ──');
  const teacherDistinct = await Users.aggregate([
    { $match: { role: 'teacher' } },
    { $unwind: '$curriculum' },
    { $group: { _id: '$curriculum', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();
  for (const r of teacherDistinct) {
    const status = NEW_CATALOG.has(r._id) ? '✓' : LEGACY_VALUES.has(r._id) ? '⚠ LEGACY' : '? UNKNOWN';
    console.log(`  ${status} '${r._id}': ${r.count}`);
    if (!NEW_CATALOG.has(r._id) && r._id !== null) anyLegacyRemaining = true;
  }

  console.log('\n══════════════════════════════════════════════════');
  if (anyLegacyRemaining) {
    console.log('⚠  WARNING: legacy or unknown curriculum values remain.');
    console.log('   DO NOT tighten the Subject.curriculum enum yet.');
    console.log('   Investigate the entries above before proceeding.');
  } else {
    console.log('✓  All curriculum strings are in the new 15-curriculum catalog.');
    console.log('   Safe to tighten the Subject.curriculum enum (Phase 3.6).');
  }
  console.log('══════════════════════════════════════════════════');

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
