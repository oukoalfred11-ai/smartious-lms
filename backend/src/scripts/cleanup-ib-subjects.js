/**
 * CLEAN UP IB SUBJECTS AFTER THE PYP/MYP/DP SPLIT
 * ===========================================================
 *
 * The audit (audit-ib-subjects.js) showed three vintages of IB
 * subject records mixed together under IBDP:
 *
 *   1. Original records (legacy names, no HL/SL) - these carry
 *      all the real references and are treated as CANONICAL.
 *   2. An earlier quick-add batch of six "(HL)" records holding
 *      only teacher specialties - MERGED into the canonical one.
 *   3. Today's reseed (HL/SL pairs) with zero references -
 *      DELETED as duplicates.
 *
 * It also showed that MYP subjects already existed under their
 * own names and were wrongly retagged to IBDP by the split
 * migration. Those originals are MOVED to IBMYP (keeping their
 * data), and the empty "MYP ..." records seeded today are
 * deleted.
 *
 * Names are never changed: users.subjects stores subject NAMES
 * as strings, so renaming would orphan student records.
 *
 * DRY RUN BY DEFAULT - prints the plan and writes nothing.
 *
 * USAGE:
 *   node src/scripts/cleanup-ib-subjects.js              (dry run)
 *   node src/scripts/cleanup-ib-subjects.js --apply      (execute)
 *   node src/scripts/cleanup-ib-subjects.js --apply --move-mathematics
 *
 * The --move-mathematics flag additionally moves the plain
 * "Mathematics" record (47 references) from IBDP to IBMYP. Read
 * the grade-level report in the dry run before using it.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const APPLY = process.argv.includes('--apply');
const MOVE_MATHS = process.argv.includes('--move-mathematics');

// ── 1. Original MYP subject groups wrongly tagged IBDP ────
// Moved to IBMYP with all their references intact.
const MOVE_TO_MYP = [
  'Language and Literature (English)',
  'Language Acquisition (French)',
  'Language Acquisition (Spanish)',
  'Language Acquisition (Mandarin)',
  'Individuals and Societies',
  'Sciences',
  'Design',
  'Arts (Drama)',
  'Arts (Music)',
  'Arts (Visual Arts)',
  'Physical and Health Education',
];

// ── 2. Quick-add "(HL)" records merged into canonical ─────
// from -> into. References are repointed, then the source is removed.
const MERGE = {
  'Biology (HL)':                             'Biology',
  'Chemistry (HL)':                           'Chemistry',
  'Economics (HL)':                           'Economics',
  'History (HL)':                             'History',
  'Physics (HL)':                             'Physics',
  'Mathematics: Analysis and Approaches (HL)':'Mathematics: Analysis and Approaches',
};

// ── 3. Extra unused duplicates not caught by the HL/SL rule ─
const DELETE_EXTRA = ['Environmental Systems & Societies'];

// Collections holding a single Subject ObjectId
const SIMPLE_REFS = [
  { coll: 'lessons',                   field: 'subjectId' },
  { coll: 'lessonprogresses',          field: 'subjectId' },
  { coll: 'librarybooks',              field: 'subjectId' },
  { coll: 'studentsyllabusprogresses', field: 'subjectId' },
  { coll: 'syllabustopics',            field: 'subjectId' },
  { coll: 'timetables',                field: 'subjectId' },
  { coll: 'timetableentries',          field: 'subjectId' },
  { coll: 'liveclasses',               field: 'subjectId' },
  { coll: 'exams',                     field: 'subjectId' },
  { coll: 'homeworks',                 field: 'subjectId' },
];

async function countRefs(db, id, existing) {
  let total = 0;
  for (const r of SIMPLE_REFS) {
    if (!existing.has(r.coll)) continue;
    total += await db.collection(r.coll).countDocuments({ [r.field]: id });
  }
  total += await db.collection('allocations').countDocuments({ subjectId: id });
  total += await db.collection('users').countDocuments({ subjectRefs: id });
  total += await db.collection('users').countDocuments({ 'teachingSpecialties.subjectId': id });
  return total;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const existing = new Set((await db.listCollections().toArray()).map(c => c.name));

  console.log(APPLY ? '*** APPLY MODE - writing changes ***'
                    : '*** DRY RUN - nothing will be written (use --apply) ***');
  console.log('');

  const Subjects = db.collection('subjects');
  const byName = async (name, curr) =>
    Subjects.findOne({ subjectName: name, curriculum: curr || { $in: ['IBDP','IBMYP','IBPYP'] } });

  // ══ STEP 0: grade report for the ambiguous "Mathematics" ══
  const maths = await byName('Mathematics', 'IBDP');
  if (maths) {
    const grades = await db.collection('users').aggregate([
      { $match: { role: 'student', subjects: 'Mathematics',
                  curriculum: { $in: ['IBDP','IBMYP','IBPYP','IB'] } } },
      { $group: { _id: '$gradeLevel', n: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).toArray();
    console.log('=== AMBIGUOUS: plain "Mathematics" under IBDP ===');
    console.log('Students holding it, by grade level:');
    if (!grades.length) console.log('  (no students found by name)');
    grades.forEach(g => console.log(`  ${g._id || '(no grade set)'}: ${g.n}`));
    console.log(MOVE_MATHS
      ? '  --move-mathematics given: it WILL be moved to IBMYP.'
      : '  Leaving it under IBDP. If the grades above are MYP Grade 6-10,');
    if (!MOVE_MATHS) console.log('  re-run with --move-mathematics to move it.');
    console.log('');
  }

  // ══ STEP 1: move original MYP groups IBDP -> IBMYP ══
  console.log('=== STEP 1: move original MYP subject groups to IBMYP ===');
  const toMove = [...MOVE_TO_MYP];
  if (MOVE_MATHS) toMove.push('Mathematics');
  for (const name of toMove) {
    const doc = await Subjects.findOne({ subjectName: name, curriculum: 'IBDP' });
    if (!doc) { console.log(`  skip (not found under IBDP): ${name}`); continue; }
    const refs = await countRefs(db, doc._id, existing);
    console.log(`  IBDP -> IBMYP: "${name}" (refs=${refs})`);
    if (APPLY) {
      await Subjects.updateOne({ _id: doc._id }, { $set: { curriculum: 'IBMYP' } });
    }
  }

  // ══ STEP 2: delete the empty seeded "MYP ..." records ══
  console.log('\n=== STEP 2: remove empty seeded "MYP ..." placeholders ===');
  const seededMyp = await Subjects.find({
    curriculum: 'IBMYP', subjectName: { $regex: '^MYP ' },
  }).toArray();
  for (const doc of seededMyp) {
    const refs = await countRefs(db, doc._id, existing);
    if (refs > 0) { console.log(`  KEEP (has ${refs} refs): ${doc.subjectName}`); continue; }
    console.log(`  delete: ${doc.subjectName}`);
    if (APPLY) await Subjects.deleteOne({ _id: doc._id });
  }

  // ══ STEP 3: merge the quick-add "(HL)" records ══
  console.log('\n=== STEP 3: merge quick-add (HL) records into canonical ===');
  for (const [fromName, intoName] of Object.entries(MERGE)) {
    const from = await Subjects.findOne({ subjectName: fromName, curriculum: 'IBDP' });
    const into = await Subjects.findOne({ subjectName: intoName, curriculum: 'IBDP' });
    if (!from) { console.log(`  skip (source missing): ${fromName}`); continue; }
    if (!into) { console.log(`  SKIP (target missing, source kept): ${fromName}`); continue; }

    const refs = await countRefs(db, from._id, existing);
    console.log(`  merge "${fromName}" (refs=${refs}) -> "${intoName}"`);
    if (!APPLY) continue;

    // simple single-ref collections
    for (const r of SIMPLE_REFS) {
      if (!existing.has(r.coll)) continue;
      await db.collection(r.coll).updateMany(
        { [r.field]: from._id }, { $set: { [r.field]: into._id } });
    }
    // allocations: unique on (studentId, subjectId) - drop rather than clash
    const allocs = await db.collection('allocations').find({ subjectId: from._id }).toArray();
    for (const a of allocs) {
      const clash = await db.collection('allocations')
        .findOne({ studentId: a.studentId, subjectId: into._id });
      if (clash) await db.collection('allocations').deleteOne({ _id: a._id });
      else await db.collection('allocations')
        .updateOne({ _id: a._id }, { $set: { subjectId: into._id } });
    }
    // user.subjectRefs array
    await db.collection('users').updateMany(
      { subjectRefs: from._id }, { $addToSet: { subjectRefs: into._id } });
    await db.collection('users').updateMany(
      { subjectRefs: from._id }, { $pull: { subjectRefs: from._id } });
    // teachingSpecialties: repoint, then drop duplicates per user
    const teachers = await db.collection('users')
      .find({ 'teachingSpecialties.subjectId': from._id }).toArray();
    for (const t of teachers) {
      const seen = new Set();
      const cleaned = [];
      for (const sp of (t.teachingSpecialties || [])) {
        const sid = String(sp.subjectId) === String(from._id) ? into._id : sp.subjectId;
        const key = String(sid) + '|' + (sp.curriculum || '');
        if (seen.has(key)) continue;
        seen.add(key);
        cleaned.push({ ...sp, subjectId: sid });
      }
      await db.collection('users')
        .updateOne({ _id: t._id }, { $set: { teachingSpecialties: cleaned } });
    }
    // student subject NAME strings
    await db.collection('users').updateMany(
      { role: 'student', subjects: fromName }, { $addToSet: { subjects: intoName } });
    await db.collection('users').updateMany(
      { role: 'student', subjects: fromName }, { $pull: { subjects: fromName } });

    await Subjects.deleteOne({ _id: from._id });
  }

  // ══ STEP 4: delete unused HL/SL duplicates from today's reseed ══
  console.log('\n=== STEP 4: delete unused HL/SL duplicates ===');
  const candidates = await Subjects.find({
    curriculum: 'IBDP',
    $or: [{ subjectName: { $regex: '\\((HL|SL)\\)$' } },
          { subjectName: { $in: DELETE_EXTRA } }],
  }).toArray();
  let deleted = 0, kept = 0;
  for (const doc of candidates) {
    const refs = await countRefs(db, doc._id, existing);
    const nameRefs = await db.collection('users')
      .countDocuments({ role: 'student', subjects: doc.subjectName });
    if (refs + nameRefs > 0) {
      console.log(`  KEEP (has ${refs + nameRefs} refs): ${doc.subjectName}`); kept++; continue;
    }
    console.log(`  delete: ${doc.subjectName}`);
    if (APPLY) await Subjects.deleteOne({ _id: doc._id });
    deleted++;
  }
  console.log(`  (${deleted} to delete, ${kept} kept because they hold data)`);

  // ══ FINAL COUNTS ══
  console.log('\n=== RESULTING COUNTS ===');
  const counts = await Subjects.aggregate([
    { $match: { curriculum: { $in: ['IBPYP','IBMYP','IBDP','IB'] } } },
    { $group: { _id: '$curriculum', n: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();
  counts.forEach(c => console.log(`  ${c._id}: ${c.n}`));
  if (!APPLY) console.log('\n(dry run - counts above are unchanged; re-run with --apply)');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
