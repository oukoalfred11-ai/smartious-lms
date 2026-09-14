/* fix-academic.cjs v2 - correction of existing student records,
   built after the first dry run proved that "stale" subject names
   are usually spelling variants or a mis-set curriculum field, not
   subjects to delete. Deploy to the backend repo ROOT, then:
       DRY_RUN=1 node fix-academic.cjs     (report only)
       DRY_RUN=0 node fix-academic.cjs     (apply safe changes only)
   What it does, per student:
   1. Legacy curriculum names resolved to the current catalog.
   2. A grade stranded in the legacy grade field lifted to gradeLevel.
   3. RENAME: an enrolled subject whose name is a spelling variant of
      a catalog subject in the student's own curriculum (colons,
      ampersands, parentheses, spacing) is renamed to the catalog
      spelling. Safe, applied.
   4. REVIEW: enrolled subjects that exist in a DIFFERENT curriculum's
      catalog are reported with that curriculum named - the student's
      curriculum field is probably wrong. NOTHING is changed; a human
      decides.
   5. ORPHAN: a name found in no curriculum at all and matching
      nothing by spelling is removed - but never if that would empty
      the student's list.
   Safe to re-run at any time. */
const mongoose = require('mongoose');

const DRY = process.env.DRY_RUN !== '0';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./src/models/User');
  const Subject = require('./src/models/Subject');
  const { canonCurriculum, aliasSet, effectiveGrade, normName } = require('./src/lib/academic');

  const students = await User.find({ role: 'student' })
    .select('firstName lastName email admissionNumber admissionNo curriculum grade gradeLevel subjects isActive')
    .lean();
  const allSubjects = await Subject.find({ isActive: true }).select('subjectName curriculum').lean();
  console.log('students:', students.length, '| catalog subjects:', allSubjects.length, DRY ? '| DRY RUN - nothing will be written' : '| APPLYING');
  console.log('');

  // Global index: normalized name -> [{ subjectName, curriculum }]
  const globalByNorm = new Map();
  for (const x of allSubjects) {
    const k = normName(x.subjectName);
    if (!globalByNorm.has(k)) globalByNorm.set(k, []);
    globalByNorm.get(k).push(x);
  }

  let curriculaFixed = 0, gradesLifted = 0, renamed = 0, reviews = 0, orphansRemoved = 0, touched = 0;

  for (const s of students) {
    const name = [s.firstName, s.lastName].filter(Boolean).join(' ') || s.email;
    const adm = s.admissionNumber || s.admissionNo || '';
    const tag = name + (adm ? ' (' + adm + ')' : '');
    const sets = {};
    const notes = [];
    const reviewNotes = [];

    const canon = canonCurriculum(s.curriculum);
    if (s.curriculum && canon !== s.curriculum) {
      sets.curriculum = canon;
      notes.push('curriculum ' + s.curriculum + ' -> ' + canon);
      curriculaFixed += 1;
    }
    if (!s.gradeLevel && s.grade) {
      sets.gradeLevel = s.grade;
      notes.push('gradeLevel <- ' + s.grade);
      gradesLifted += 1;
    }

    const cur = canon || s.curriculum;
    if (cur && Array.isArray(s.subjects) && s.subjects.length) {
      const aliases = new Set(aliasSet(cur));
      const own = allSubjects.filter(x => aliases.has(x.curriculum));
      const ownExact = new Set(own.map(x => x.subjectName));
      const ownByNorm = new Map(own.map(x => [normName(x.subjectName), x.subjectName]));

      const corrected = [];
      const foreignHits = {};   // curriculum -> [names]
      const orphans = [];
      for (const n of s.subjects) {
        if (ownExact.has(n)) { corrected.push(n); continue; }
        const fuzzy = ownByNorm.get(normName(n));
        if (fuzzy) {
          corrected.push(fuzzy);
          notes.push('rename "' + n + '" -> "' + fuzzy + '"');
          renamed += 1;
          continue;
        }
        const elsewhere = globalByNorm.get(normName(n)) || [];
        if (elsewhere.length) {
          const curs = [...new Set(elsewhere.map(x => x.curriculum))];
          curs.forEach(c => { (foreignHits[c] = foreignHits[c] || []).push(n); });
          corrected.push(n);   // kept untouched, pending review
          continue;
        }
        orphans.push(n);
      }

      for (const [c, names] of Object.entries(foreignHits)) {
        reviewNotes.push(names.length + ' subject(s) belong to ' + c + ' (' + names.join(', ') + ') but the student is marked ' + cur + '. The curriculum field is probably wrong. No change made; review.');
        reviews += 1;
      }

      if (orphans.length && orphans.length < s.subjects.length) {
        notes.push('removed (found in no curriculum): ' + orphans.join(', '));
        orphansRemoved += orphans.length;
      } else if (orphans.length) {
        reviewNotes.push('every enrolled subject is unknown to the catalog (' + orphans.join(', ') + '). Nothing removed; review.');
        reviews += 1;
        orphans.length = 0;
        for (const n of s.subjects) if (!corrected.includes(n)) corrected.push(n);
      }

      const changedList = JSON.stringify(corrected) !== JSON.stringify(s.subjects);
      if (changedList) sets.subjects = corrected;
    }

    if (notes.length || reviewNotes.length) {
      touched += 1;
      if (notes.length) console.log((DRY ? '[DRY] ' : '[FIX] ') + tag + ': ' + notes.join('; '));
      reviewNotes.forEach(rn => console.log('[REVIEW] ' + tag + ': ' + rn));
      if (!DRY && Object.keys(sets).length) await User.updateOne({ _id: s._id }, { $set: sets });
    }
  }

  console.log('');
  console.log('summary: students', students.length,
    '| flagged:', touched,
    '| curricula fixed:', curriculaFixed,
    '| grades lifted:', gradesLifted,
    '| names renamed to catalog spelling:', renamed,
    '| review items (no change made):', reviews,
    '| true orphans removed:', orphansRemoved);
  if (DRY) console.log('Nothing was written. Run with DRY_RUN=0 to apply renames and orphan removals; REVIEW items always need a human.');
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
