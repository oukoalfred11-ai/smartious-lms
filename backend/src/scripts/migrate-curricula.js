/**
 * MIGRATE CURRICULA — ONE-SHOT SCRIPT
 * ===========================================================
 *
 * Updates existing database records to use the new curriculum
 * ids introduced in the catalog restructure.
 *
 *   Old string        →  New string
 *   ----------------     ----------------
 *   'Primary'         →  'CambridgePrimary'
 *   'IGCSE'           →  'CambridgeIGCSE'
 *   'Cambridge'       →  'CambridgeALevel'      (was Cambridge A/AS)
 *   'Edexcel'         →  'EdexcelIGCSE'         (best-guess default;
 *                                                see below)
 *
 * Notes & honest caveats:
 *  - The old 'Edexcel' umbrella covered Primary + Lower Sec + IGCSE
 *    + A-Level. We can't tell from a single string which stage a
 *    given Edexcel student is actually in. This script defaults
 *    them to 'EdexcelIGCSE' (the most common Edexcel International
 *    enrolment). After running, REVIEW any Edexcel students and
 *    re-assign Year 7-9 ones to 'EdexcelLowerSec' and Year 12-13
 *    ones to 'EdexcelALevel'.
 *  - The old 'IGCSE' ran Year 1-13. Yr 7-9 students are now
 *    structurally invalid under 'CambridgeIGCSE' (which is
 *    Yr 10-11 only). After running, REVIEW any IGCSE students
 *    in Yr 7-9 and re-assign them to 'CambridgeLowerSec'.
 *  - Touches three collections:
 *      • Users  (student.curriculum is a string for students)
 *      • Subjects  (subject.curriculum)
 *      • SyllabusTopics  (no curriculum field — attached via
 *        Subject._id, which doesn't change, so spine survives)
 *
 * USAGE:
 *   cd backend
 *   node src/scripts/migrate-curricula.js
 *
 * The script connects to MONGODB_URI from your .env, runs, and
 * prints what it changed. It is idempotent — running twice is safe
 * (the second run will find nothing to update).
 */

require('dotenv').config();
const mongoose = require('mongoose');

const RENAMES = {
  Primary:   'CambridgePrimary',
  IGCSE:     'CambridgeIGCSE',
  Cambridge: 'CambridgeALevel',
  Edexcel:   'EdexcelIGCSE',   // best-guess default — see notes above
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected.');

  const db = mongoose.connection.db;
  let totalChanged = 0;

  // 1. USERS — student.curriculum is a string for students, array for teachers
  const Users = db.collection('users');
  for (const [oldVal, newVal] of Object.entries(RENAMES)) {
    // Students: curriculum is a string
    const r1 = await Users.updateMany(
      { role: 'student', curriculum: oldVal },
      { $set: { curriculum: newVal } }
    );
    if (r1.modifiedCount) {
      console.log(`  users (student): ${oldVal} → ${newVal}: ${r1.modifiedCount}`);
      totalChanged += r1.modifiedCount;
    }
    // Teachers: curriculum is an array — replace any matching elements
    const r2 = await Users.updateMany(
      { role: 'teacher', curriculum: oldVal },
      { $set: { 'curriculum.$': newVal } }
    );
    if (r2.modifiedCount) {
      console.log(`  users (teacher): ${oldVal} → ${newVal} (array element): ${r2.modifiedCount}`);
      totalChanged += r2.modifiedCount;
    }
  }

  // 2. SUBJECTS — subject.curriculum is a string
  const Subjects = db.collection('subjects');
  for (const [oldVal, newVal] of Object.entries(RENAMES)) {
    const r = await Subjects.updateMany(
      { curriculum: oldVal },
      { $set: { curriculum: newVal } }
    );
    if (r.modifiedCount) {
      console.log(`  subjects: ${oldVal} → ${newVal}: ${r.modifiedCount}`);
      totalChanged += r.modifiedCount;
    }
  }

  // 3. Anything else with a `.curriculum` string field?
  //    Timetables snapshot the curriculum string when generated. Update those too.
  const Timetables = db.collection('timetables');
  for (const [oldVal, newVal] of Object.entries(RENAMES)) {
    const r = await Timetables.updateMany(
      { curriculum: oldVal },
      { $set: { curriculum: newVal } }
    );
    if (r.modifiedCount) {
      console.log(`  timetables: ${oldVal} → ${newVal}: ${r.modifiedCount}`);
      totalChanged += r.modifiedCount;
    }
  }

  // 4. LiveClasses also store a curriculum snapshot.
  const Live = db.collection('liveclasses');
  for (const [oldVal, newVal] of Object.entries(RENAMES)) {
    const r = await Live.updateMany(
      { curriculum: oldVal },
      { $set: { curriculum: newVal } }
    );
    if (r.modifiedCount) {
      console.log(`  liveclasses: ${oldVal} → ${newVal}: ${r.modifiedCount}`);
      totalChanged += r.modifiedCount;
    }
  }

  console.log(`\nMigration complete. Total records updated: ${totalChanged}`);

  // Final sanity report
  console.log('\nRemaining records with OLD curriculum strings (should be 0 of each):');
  for (const oldVal of Object.keys(RENAMES)) {
    const u = await Users.countDocuments({ curriculum: oldVal });
    const s = await Subjects.countDocuments({ curriculum: oldVal });
    const t = await Timetables.countDocuments({ curriculum: oldVal });
    console.log(`  '${oldVal}': users=${u}, subjects=${s}, timetables=${t}`);
  }

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
