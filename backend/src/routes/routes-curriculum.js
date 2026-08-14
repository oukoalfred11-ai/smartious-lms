/**
 * routes/curriculum.js
 * Serves curriculum options (curricula, grades, subjects) for the user form.
 * Constants are inlined to avoid path resolution issues.
 * GET /api/curriculum/options
 * GET /api/curriculum/subjects/:curriculumId
 */
const express = require('express')
const router  = express.Router()
const { auth } = require('../middleware/auth')

// ── Inlined curriculum constants ──────────────────────────
/**
 * CURRICULUM CONSTANTS
 * ============================================================
 * Smartious supports 15 curricula across boards and stages:
 *   Cambridge: Primary, Lower Secondary, IGCSE, A-Level
 *   Edexcel:   Lower Secondary, IGCSE, A-Level
 *   AQA:       Lower Secondary, GCSE, A-Level
 *   IB:        PYP, MYP, DP (split 2026-08-04)
 *   Other:     BNC, American, Canadian, Kenya CBC
 *
 * Each curriculum has its own grade naming convention.
 * Subjects are organized by category and tagged with which
 * curricula they're available in.
 */

// ─────────────────────────────────────────────────────────
// SUPPORTED CURRICULA
// ─────────────────────────────────────────────────────────
// ⚠ Catalogue lives in constants/curriculum.js — do not redefine it here.
// These lists used to be duplicated in both files and drifted apart:
// the API served a corrected catalogue while question validation used a
// stale copy. One source of truth now.
const { CURRICULA, SUBJECTS, GRADES_BY_CURRICULUM } = require('../constants/curriculum')

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

/**
 * Get all subjects available for a given curriculum.
 * Returns subjects grouped by category.
 */
const getSubjectsForCurriculum = (curriculumId) => {
  // NOTE: `availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBMYP', 'IBDP', 'BNC', 'American', 'Canadian']` means all SECONDARY curricula — it
  // predates the Primary curriculum and must NOT auto-include it
  // (a Year 3 child does not take Economics or separate sciences).
  // Primary only gets subjects that explicitly list 'CambridgePrimary'.
  const EXPLICIT_ONLY = ['CambridgePrimary', 'IBPYP', 'IBMYP']
  const filtered = SUBJECTS.filter(s => {
    if (EXPLICIT_ONLY.includes(curriculumId)) {
      return Array.isArray(s.availableIn) && s.availableIn.includes(curriculumId)
    }
    return s.availableIn === 'all' || s.availableIn.includes(curriculumId)
  })
  // Group by category
  const grouped = {}
  filtered.forEach(s => {
    if (!grouped[s.category]) grouped[s.category] = []
    grouped[s.category].push(s)
  })
  return { flat: filtered, grouped }
}

/**
 * Get grade options for a curriculum.
 */
const getGradesForCurriculum = (curriculumId) => {
  return GRADES_BY_CURRICULUM[curriculumId] || []
}

/**
 * Validate that a subject is available in a given curriculum.
 */
const isSubjectValidForCurriculum = (subjectId, curriculumId) => {
  const subject = SUBJECTS.find(s => s.id === subjectId)
  if (!subject) return false
  // Primary only matches subjects that explicitly list 'CambridgePrimary'
  // ('all' means all secondary curricula — see getSubjectsForCurriculum).
  if (['CambridgePrimary', 'IBPYP', 'IBMYP'].includes(curriculumId)) {
    return Array.isArray(subject.availableIn) && subject.availableIn.includes(curriculumId)
  }
  return subject.availableIn === 'all' || subject.availableIn.includes(curriculumId)
}




// GET /api/curriculum/options
router.get('/options', auth, (req, res) => {
  res.json({
    success: true,
    curricula: CURRICULA,
    gradesByCurriculum: GRADES_BY_CURRICULUM,
    subjects: SUBJECTS,
  })
})

// GET /api/curriculum/subjects/:curriculumId
router.get('/subjects/:curriculumId', auth, (req, res) => {
  const { curriculumId } = req.params
  const filtered = SUBJECTS.filter(s =>
    s.availableIn === 'all' ||
    (Array.isArray(s.availableIn) && s.availableIn.includes(curriculumId))
  )
  res.json({ success: true, subjects: filtered })
})

module.exports = router
// Exported so the duplicate resolver can prefer the name the enrolment
// form actually offers when choosing which of two records survives.
module.exports.SUBJECTS = SUBJECTS
