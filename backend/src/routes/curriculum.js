/**
 * routes/curriculum.js
 * Serves curriculum options (curricula, grades, subjects) for the user form.
 * GET /api/curriculum/options
 * GET /api/curriculum/subjects/:curriculumId
 *
 * SOURCE OF TRUTH (fixed 2026-08-27)
 * The subject catalogue is the constants file MERGED with the live
 * Subject collection. Constants alone made every subject created in
 * the database — for example by a syllabus spine script — invisible
 * to the question bank and every form fed by this endpoint: American
 * Grade 7 Science existed, had a full spine, and could not be picked
 * because the constants only list AP courses under American. Now any
 * (subjectName, curriculum) pair present in the database appears in
 * the catalogue automatically: existing constant entries gain the
 * curriculum in availableIn, and genuinely new subjects are appended
 * as dynamic entries. Constants remain the base catalogue; the
 * database can only ADD availability, never remove it.
 */
const express = require('express')
const router  = express.Router()
const { auth } = require('../middleware/auth')

const { CURRICULA, SUBJECTS, GRADES_BY_CURRICULUM } = require('../constants/curriculum')
const Subject = require('../models/Subject')

// ── DB MERGE ──────────────────────────────────────────────
const normName = v => String(v || '').trim().toLowerCase()
const slug = v => normName(v).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

let _cache = { at: 0, subjects: null }
const CACHE_MS = 60 * 1000

const buildMergedSubjects = async () => {
  const now = Date.now()
  if (_cache.subjects && now - _cache.at < CACHE_MS) return _cache.subjects

  const merged = SUBJECTS.map(s => ({
    ...s,
    availableIn: s.availableIn === 'all' ? 'all' : [...s.availableIn],
  }))

  try {
    const dbRows = await Subject.find({ isActive: { $ne: false } })
      .select('subjectName curriculum category').lean()
    for (const d of dbRows) {
      if (!d.subjectName || !d.curriculum) continue
      const hit = merged.find(s => normName(s.name) === normName(d.subjectName))
      if (hit) {
        if (hit.availableIn !== 'all' && !hit.availableIn.includes(d.curriculum)) {
          hit.availableIn.push(d.curriculum)
        }
      } else {
        merged.push({
          id: 'db_' + slug(d.subjectName),
          name: d.subjectName,
          category: d.category || 'General',
          availableIn: [d.curriculum],
          fromDb: true,
        })
      }
    }
    _cache = { at: now, subjects: merged }
  } catch (e) {
    console.error('[curriculum] subject merge failed, serving constants only:', e.message)
    return merged
  }
  return merged
}

// ── HELPERS ───────────────────────────────────────────────
const getSubjectsForCurriculum = (curriculumId, catalogue = SUBJECTS) => {
  const EXPLICIT_ONLY = ['CambridgePrimary', 'IBPYP', 'IBMYP']
  const filtered = catalogue.filter(s => {
    if (EXPLICIT_ONLY.includes(curriculumId)) {
      return Array.isArray(s.availableIn) && s.availableIn.includes(curriculumId)
    }
    return s.availableIn === 'all' || s.availableIn.includes(curriculumId)
  })
  const grouped = {}
  filtered.forEach(s => {
    if (!grouped[s.category]) grouped[s.category] = []
    grouped[s.category].push(s)
  })
  return { flat: filtered, grouped }
}

const getGradesForCurriculum = (curriculumId) => GRADES_BY_CURRICULUM[curriculumId] || []

const isSubjectValidForCurriculum = (subjectId, curriculumId) => {
  const subject = SUBJECTS.find(s => s.id === subjectId)
  if (!subject) return false
  if (['CambridgePrimary', 'IBPYP', 'IBMYP'].includes(curriculumId)) {
    return Array.isArray(subject.availableIn) && subject.availableIn.includes(curriculumId)
  }
  return subject.availableIn === 'all' || subject.availableIn.includes(curriculumId)
}

// GET /api/curriculum/options
router.get('/options', auth, async (req, res) => {
  const subjects = await buildMergedSubjects()
  res.json({
    success: true,
    curricula: CURRICULA,
    gradesByCurriculum: GRADES_BY_CURRICULUM,
    subjects,
  })
})

// GET /api/curriculum/subjects/:curriculumId
router.get('/subjects/:curriculumId', auth, async (req, res) => {
  const { curriculumId } = req.params
  const catalogue = await buildMergedSubjects()
  const { flat } = getSubjectsForCurriculum(curriculumId, catalogue)
  res.json({ success: true, subjects: flat })
})

module.exports = router
module.exports.SUBJECTS = SUBJECTS
