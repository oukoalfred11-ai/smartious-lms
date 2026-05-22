/**
 * MIGRATE SUBJECT CATEGORIES — split Mathematics out of Sciences
 * ===========================================================
 *
 * Following the category taxonomy decisions made on 2026-05-20:
 *
 *   Final 8 categories:
 *     Mathematics (NEW — split out of Sciences)
 *     Sciences
 *     Languages
 *     Arts
 *     Business
 *     Humanities
 *     Technology
 *     Physical Education
 *
 * This script moves the 3 maths subjects from 'Sciences' to
 * 'Mathematics':
 *   - Mathematics
 *   - Additional Mathematics
 *   - Further Mathematics
 *
 * Idempotent — safe to re-run.
 *
 * USAGE:
 *   cd backend
 *   node src/scripts/migrate-subject-categories.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MATHS_SUBJECTS = [
  'Mathematics',
  'Additional Mathematics',
  'Further Mathematics',
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected.');

  const db = mongoose.connection.db;
  const Subjects = db.collection('subjects');

  // Before snapshot
  console.log('\nBefore — Mathematics subjects categorisation:');
  const before = await Subjects.find({ subjectName: { $in: MATHS_SUBJECTS } })
    .project({ subjectName: 1, curriculum: 1, category: 1 })
    .toArray();
  for (const s of before) {
    console.log(`  ${s.subjectName} (${s.curriculum}) — category: '${s.category}'`);
  }

  // Apply the rename
  const result = await Subjects.updateMany(
    { subjectName: { $in: MATHS_SUBJECTS }, category: 'Sciences' },
    { $set: { category: 'Mathematics' } }
  );

  console.log(`\nUpdated ${result.modifiedCount} subject(s).`);

  // After snapshot — confirm
  console.log('\nAfter — Mathematics subjects categorisation:');
  const after = await Subjects.find({ subjectName: { $in: MATHS_SUBJECTS } })
    .project({ subjectName: 1, curriculum: 1, category: 1 })
    .toArray();
  for (const s of after) {
    console.log(`  ${s.subjectName} (${s.curriculum}) — category: '${s.category}'`);
  }

  // Sanity check — distinct categories now in use
  console.log('\nDistinct categories now in subjects collection:');
  const distinct = await Subjects.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();
  for (const row of distinct) {
    console.log(`  '${row._id}': ${row.count}`);
  }

  // Final check — anything not in the new taxonomy?
  const ALLOWED = new Set([
    'Mathematics', 'Sciences', 'Languages', 'Arts',
    'Business', 'Humanities', 'Technology', 'Physical Education',
  ]);
  const unexpected = distinct.filter(r => !ALLOWED.has(r._id));
  if (unexpected.length > 0) {
    console.warn('\n⚠  WARNING: Categories outside the new 8-category taxonomy:');
    for (const r of unexpected) console.warn(`     '${r._id}': ${r.count}`);
    console.warn('   These will be REJECTED once the Subject model enum is tightened.');
    console.warn('   Either rename them to a valid category before enforcing the enum,');
    console.warn('   or expand the enum to include them.');
  } else {
    console.log('\n✓  All subject categories are within the new 8-category taxonomy.');
    console.log('   Safe to deploy the tightened enum on Subject.category.');
  }

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
