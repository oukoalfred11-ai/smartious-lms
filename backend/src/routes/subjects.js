const router = require('express').Router();
const Subject = require('../models/Subject');
const { auth, requireRole } = require('../middleware/auth');

// GET all subjects, optionally filtered by curriculum.
// By default returns only Active subjects (correct for student/teacher
// dropdowns and lesson/question forms). Pass ?includeInactive=true to
// also return deactivated subjects (used by the admin Subjects UI so
// admins can see and reactivate them).
router.get('/', async (req, res) => {
  try {
    const { curriculum, includeInactive } = req.query;
    const filter = {};
    if (curriculum) filter.curriculum = curriculum;
    if (includeInactive !== 'true') filter.isActive = true;

    const subjects = await Subject.find(filter)
      .sort('subjectName')
      .lean();

    res.json({ success: true, subjects });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET subjects grouped by curriculum (for dropdowns)
router.get('/by-curriculum', async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .select('curriculum subjectName category code')
      .lean();
    
    // Group by curriculum
    const grouped = {};
    subjects.forEach(subject => {
      if (!grouped[subject.curriculum]) {
        grouped[subject.curriculum] = [];
      }
      grouped[subject.curriculum].push(subject);
    });
    
    res.json({ success: true, subjectsByProgramme: grouped });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET subjects for a specific curriculum
router.get('/curriculum/:curriculum', async (req, res) => {
  try {
    const { curriculum } = req.params;
    
    const subjects = await Subject.find({
      curriculum: { $regex: new RegExp(`^${curriculum}$`, 'i') },
      isActive: true
    })
      .select('_id subjectName category code')
      .sort('subjectName')
      .lean();
    
    res.json({ success: true, subjects, curriculum });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// CREATE new subject (admin only) — "Quick Add" feature
router.post('/', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const { curriculum, subjectName, category, code } = req.body;
    
    // Validate required fields
    if (!curriculum || !subjectName || !category) {
      return res.status(400).json({
        success: false,
        message: 'curriculum, subjectName, and category are required'
      });
    }
    
    // Check if subject already exists for this curriculum
    const existing = await Subject.findOne({
      curriculum,
      subjectName: { $regex: new RegExp(`^${subjectName}$`, 'i') }
    });
    
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Subject "${subjectName}" already exists for ${curriculum}`
      });
    }
    
    // Create new subject
    const subject = await Subject.create({
      curriculum,
      subjectName: subjectName.trim(),
      category: category.trim(),
      code: code ? code.trim() : undefined,
      isActive: true
    });
    
    console.log(`✓ Subject created: ${subjectName} (${curriculum})`);
    res.status(201).json({ success: true, subject });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// UPDATE subject (admin only)
router.patch('/:id', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const { subjectName, category, code, isActive } = req.body;
    
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { subjectName, category, code, isActive },
      { new: true, runValidators: true }
    );
    
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    console.log(`✓ Subject updated: ${subject.subjectName}`);
    res.json({ success: true, subject });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// DELETE subject (admin only)
router.delete('/:id', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Subject deletion is disabled. Use PATCH with isActive: false to deactivate. ' +
             'Hard-deleting a Subject would orphan Lesson, SyllabusTopic, Allocation, and ' +
             'Question records that reference it.'
  });
});

module.exports = router;
