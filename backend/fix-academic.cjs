/* fix-academic.cjs - one time correction of existing student records.
   Deploy to the backend repo ROOT (beside src/), then in the Render
   shell:
       DRY_RUN=1 node fix-academic.cjs     (report only, changes nothing)
       DRY_RUN=0 node fix-academic.cjs     (apply)
   What it corrects, per student:
   1. Legacy curriculum names resolved to the current catalog
      (IGCSE -> CambridgeIGCSE, KenyaCBC -> KenyaCBE, IB -> IBDP, ...).
   2. A grade stranded in the legacy grade field is lifted into
      gradeLevel when gradeLevel is empty.
   3. Enrolled subject names that do not exist in the student's own
      curriculum catalog are removed from the record.
   Safe to re-run: a corrected record produces no further changes. */
const mongoose = require('mongoose');

const DRY = process.env.DRY_RUN !== '0';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./src/models/User');
  const Subject = require('./src/models/Subject');
  const { canonCurriculum, aliasSet, effectiveGrade } = require('./src/lib/academic');

  const students = await User.find({ role: 'student' })
    .select('firstName lastName email admissionNumber admissionNo curriculum grade gradeLevel subjects isActive')
    .lean();
  console.log('students found:', students.length, DRY ? '(DRY RUN - nothing will be written)' : '(APPLYING)');

  // Catalog cache per curriculum+grade key so we hit Subject once per class.
  const cache = new Map();
  async function catalogNames(curriculum, grade) {
    const key = curriculum + '::' + (grade || '');
    if (cache.has(key)) return cache.get(key);
    const curFilter = { curriculum: { $in: aliasSet(curriculum) }, isActive: true };
    let rows = grade ? await Subject.find({ ...curFilter, grade }).select('subjectName').lean() : [];
    if (!rows.length) rows = await Subject.find(curFilter).select('subjectName').lean();
    const names = new Set(rows.map(x => x.subjectName));
    cache.set(key, names);
    return names;
  }

  let curriculaFixed = 0, gradesLifted = 0, subjectsPruned = 0, touched = 0, skippedNoCurriculum = 0;

  for (const s of students) {
    const sets = {};
    const pulls = [];
    const name = [s.firstName, s.lastName].filter(Boolean).join(' ') || s.email;
    const adm = s.admissionNumber || s.admissionNo || '';
    const notes = [];

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
      const grade = sets.gradeLevel || effectiveGrade(s);
      const names = await catalogNames(cur, grade);
      if (names.size) {
        const stale = s.subjects.filter(n => !names.has(n));
        if (stale.length) {
          pulls.push(...stale);
          notes.push('removed subjects: ' + stale.join(', '));
          subjectsPruned += stale.length;
        }
      } else {
        notes.push('no catalog found for ' + cur + ' - subjects left untouched');
      }
    } else if (!cur && Array.isArray(s.subjects) && s.subjects.length) {
      skippedNoCurriculum += 1;
      notes.push('no curriculum set - subjects left untouched, fix the curriculum first');
    }

    if (Object.keys(sets).length || pulls.length) {
      touched += 1;
      console.log((DRY ? '[DRY] ' : '[FIX] ') + name + (adm ? ' (' + adm + ')' : '') + ': ' + notes.join('; '));
      if (!DRY) {
        const update = {};
        if (Object.keys(sets).length) update.$set = sets;
        if (pulls.length) update.$pull = { subjects: { $in: pulls } };
        await User.updateOne({ _id: s._id }, update);
      }
    }
  }

  console.log('');
  console.log('summary: students', students.length,
    '| records ' + (DRY ? 'needing correction' : 'corrected') + ':', touched,
    '| curricula:', curriculaFixed,
    '| grades lifted:', gradesLifted,
    '| subject names removed:', subjectsPruned,
    '| no curriculum set:', skippedNoCurriculum);
  if (DRY) console.log('Nothing was written. Run with DRY_RUN=0 to apply.');
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
