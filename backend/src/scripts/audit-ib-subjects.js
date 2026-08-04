/**
 * AUDIT IB SUBJECTS (READ ONLY - CHANGES NOTHING)
 * ===========================================================
 *
 * After the 2026-08-04 IB split and reseed, the IBDP curriculum
 * holds more records than expected. Three groups are mixed in:
 *
 *   1. Legacy DP names with no HL/SL suffix (e.g. "Biology")
 *   2. Seed-file DP names with HL/SL   (e.g. "Biology (HL)")
 *   3. MYP subject groups wrongly retagged to IBDP by the
 *      migration (e.g. "Individuals and Societies", "Design")
 *
 * This script reports every IBPYP / IBMYP / IBDP subject with a
 * count of every record that points at it, so nothing is merged
 * or deleted blindly. It writes NOTHING to the database.
 *
 * USAGE:
 *   cd backend
 *   node src/scripts/audit-ib-subjects.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Collections that hold a Subject ObjectId, and the field to check.
const REFS = [
  { coll: 'allocations',              field: 'subjectId' },
  { coll: 'lessons',                  field: 'subjectId' },
  { coll: 'lessonprogresses',         field: 'subjectId' },
  { coll: 'librarybooks',             field: 'subjectId' },
  { coll: 'studentsyllabusprogresses',field: 'subjectId' },
  { coll: 'syllabustopics',           field: 'subjectId' },
  { coll: 'timetables',               field: 'subjectId' },
  { coll: 'timetableentries',         field: 'subjectId' },
  { coll: 'liveclasses',              field: 'subjectId' },
  { coll: 'exams',                    field: 'subjectId' },
  { coll: 'homeworks',                field: 'subjectId' },
  { coll: 'users',                    field: 'subjectRefs' },
  { coll: 'users',                    field: 'teachingSpecialties.subjectId' },
  { coll: 'teachers',                 field: 'subjects' },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const existing = new Set((await db.listCollections().toArray()).map(c => c.name));
  const activeRefs = REFS.filter(r => existing.has(r.coll));

  const subjects = await db.collection('subjects')
    .find({ curriculum: { $in: ['IBPYP', 'IBMYP', 'IBDP', 'IB'] } })
    .sort({ curriculum: 1, subjectName: 1 })
    .toArray();

  console.log(`Found ${subjects.length} IB-family subjects.\n`);

  const rows = [];
  for (const s of subjects) {
    let total = 0;
    const hits = [];
    for (const r of activeRefs) {
      const n = await db.collection(r.coll).countDocuments({ [r.field]: s._id });
      if (n > 0) { total += n; hits.push(`${r.coll}.${r.field}=${n}`); }
    }
    // Students store subject NAMES as strings too - check that separately
    const byName = await db.collection('users').countDocuments({
      role: 'student', subjects: s.subjectName,
    });
    if (byName > 0) { total += byName; hits.push(`users.subjects(name)=${byName}`); }

    rows.push({
      curriculum: s.curriculum,
      subjectName: s.subjectName,
      category: s.category,
      id: String(s._id),
      refs: total,
      detail: hits.join(', ') || '-',
    });
  }

  // ── Report 1: everything with references (DO NOT DELETE THESE) ──
  console.log('=========================================================');
  console.log('IN USE - records with attached data (keep these)');
  console.log('=========================================================');
  const used = rows.filter(r => r.refs > 0);
  if (!used.length) console.log('(none)');
  used.forEach(r => console.log(
    `${r.curriculum.padEnd(6)} | ${r.subjectName.padEnd(50)} | ${String(r.refs).padStart(4)} | ${r.detail}`));

  // ── Report 2: unreferenced (safe to merge or deactivate) ──
  console.log('\n=========================================================');
  console.log('UNUSED - no attached data (safe to merge/deactivate)');
  console.log('=========================================================');
  const unused = rows.filter(r => r.refs === 0);
  unused.forEach(r => console.log(`${r.curriculum.padEnd(6)} | ${r.subjectName}`));
  console.log(`\n(${used.length} in use, ${unused.length} unused)`);

  // ── Report 3: likely duplicate pairs by normalised name ──
  console.log('\n=========================================================');
  console.log('LIKELY DUPLICATE GROUPS (normalised name match)');
  console.log('=========================================================');
  const norm = n => n.toLowerCase()
    .replace(/\s*\((hl|sl)\)\s*$/i, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');
  const groups = {};
  rows.forEach(r => {
    const k = r.curriculum + '::' + norm(r.subjectName);
    (groups[k] = groups[k] || []).push(r);
  });
  Object.values(groups).filter(g => g.length > 1).forEach(g => {
    console.log(`\n  ${g[0].curriculum}:`);
    g.forEach(r => console.log(`    - "${r.subjectName}"  refs=${r.refs}  id=${r.id}`));
  });

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
