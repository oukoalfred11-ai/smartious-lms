/**
 * routes/curriculum.js
 * Serves curriculum options for the user form dropdowns.
 * GET /api/curriculum/options — returns curricula, grades by curriculum, and all subjects
 */
const express  = require('express')
const router   = express.Router()
const {
  CURRICULA,
  GRADES_BY_CURRICULUM,
  SUBJECTS,
} = require('../curriculum')   // the constants file

const { auth } = require('../middleware/auth')

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
