const express = require('express');
const Curriculum = require('../models/Curriculum');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();
const {
  CURRICULA,
  GRADES_BY_CURRICULUM,
  SUBJECTS,
  getSubjectsForCurriculum,
  getGradesForCurriculum,
} = require('../constants/curriculum');

function logAudit(user, action, details) {
  // TODO: Implement persistent audit logging
  console.log(`[AUDIT] ${user}: ${action}`, details);
}

// GET /api/curriculum - List all curricula
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const curricula = await Curriculum.find();
    res.json({ success: true, curricula });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/curriculum - Create curriculum
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const curriculum = new Curriculum(req.body);
    await curriculum.save();
    logAudit(req.user?.email || 'system', 'create_curriculum', curriculum);
    res.status(201).json({ success: true, curriculum });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/curriculum/:id - Update curriculum
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const curriculum = await Curriculum.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    logAudit(req.user?.email || 'system', 'update_curriculum', curriculum);
    res.json({ success: true, curriculum });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// DELETE /api/curriculum/:id - Delete curriculum
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const curriculum = await Curriculum.findByIdAndDelete(req.params.id);
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    logAudit(req.user?.email || 'system', 'delete_curriculum', curriculum);
    res.json({ success: true, message: 'Curriculum deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// CATALOG ENDPOINTS — read-only enrollment options
// These return the hardcoded Smartious-supported catalog
// (7 curricula, grades per curriculum, subjects).
// Used by frontend to populate enrollment dropdowns.
// ─────────────────────────────────────────────────────────

// GET /api/curriculum/options — full catalog
router.get('/options', auth, (req, res) => {
  return res.json({
    success: true,
    curricula: CURRICULA,
    gradesByCurriculum: GRADES_BY_CURRICULUM,
    subjects: SUBJECTS,
  });
});

// GET /api/curriculum/grades/:curriculumId — grades for one curriculum
router.get('/grades/:curriculumId', auth, (req, res) => {
  const grades = getGradesForCurriculum(req.params.curriculumId);
  if (grades.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Unknown curriculum: ' + req.params.curriculumId,
    });
  }
  return res.json({
    success: true,
    curriculumId: req.params.curriculumId,
    grades,
  });
});

// GET /api/curriculum/subjects/:curriculumId — subjects for one curriculum
router.get('/subjects/:curriculumId', auth, (req, res) => {
  const result = getSubjectsForCurriculum(req.params.curriculumId);
  return res.json({
    success: true,
    curriculumId: req.params.curriculumId,
    subjects: result.flat,
    subjectsByCategory: result.grouped,
  });
});

module.exports = router;

