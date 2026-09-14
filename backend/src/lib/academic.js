/**
 * academic.js - canonical curriculum and grade resolution.
 * Legacy curriculum names still live on older student records; every
 * reader must resolve them to the current catalog so a student's
 * profile, subject list and assignments always speak one language.
 */

// Legacy value -> canonical catalog value.
const CANON = {
  IGCSE: 'CambridgeIGCSE',
  ALevel: 'CambridgeALevel',
  'A-Level': 'CambridgeALevel',
  'A Level': 'CambridgeALevel',
  KenyaCBC: 'KenyaCBE',
  CBC: 'KenyaCBE',
  CBE: 'KenyaCBE',
  IB: 'IBDP',
};

function canonCurriculum(value) {
  const v = String(value || '').trim();
  return CANON[v] || v;
}

// All names (canonical + legacy spellings) that mean the same
// curriculum - used when querying subjects that may have been seeded
// under a legacy name.
function aliasSet(value) {
  const canon = canonCurriculum(value);
  const set = new Set([canon]);
  for (const [legacy, target] of Object.entries(CANON)) {
    if (target === canon) set.add(legacy);
  }
  if (String(value || '').trim()) set.add(String(value).trim());
  return [...set];
}

// The student's effective grade: gradeLevel is the live field; the
// legacy grade field is honoured when gradeLevel was never set.
function effectiveGrade(user) {
  return (user && (user.gradeLevel || user.grade)) || '';
}

module.exports = { canonCurriculum, aliasSet, effectiveGrade };
