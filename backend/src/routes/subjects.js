const router = require('express').Router();
const Subject = require('../models/Subject');
const { auth, requireRole } = require('../middleware/auth');

// GET all subjects, optionally filtered by curriculum
router.get('/', async (req, res) => {
  try {
    const { curriculum } = req.query;
    const filter = curriculum ? { curriculum, isActive: true } : { isActive: true };
    
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
router.post('/', auth, requireRole('admin'), async (req, res) => {
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
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
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
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    console.log(`✓ Subject deleted: ${subject.subjectName}`);
    res.json({ success: true, message: 'Subject deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// SEED ENDPOINT — POST /api/subjects/seed-defaults
// Idempotent: re-running skips subjects already in DB.
// Admin only. Used to bootstrap the Subject collection.
// ─────────────────────────────────────────────────────────
const DEFAULT_SUBJECTS = {
  // ── Cambridge IGCSE ──
  IGCSE: [
    // Sciences
    { name: 'Mathematics',                       category: 'Sciences' },
    { name: 'Additional Mathematics',            category: 'Sciences' },
    { name: 'Further Mathematics',               category: 'Sciences' },
    { name: 'Physics',                           category: 'Sciences' },
    { name: 'Chemistry',                         category: 'Sciences' },
    { name: 'Biology',                           category: 'Sciences' },
    { name: 'Combined Science',                  category: 'Sciences' },
    { name: 'Environmental Management',          category: 'Sciences' },
    // Humanities
    { name: 'History',                           category: 'Humanities' },
    { name: 'Geography',                         category: 'Humanities' },
    { name: 'Religious Studies',                 category: 'Humanities' },
    { name: 'Sociology',                         category: 'Humanities' },
    { name: 'Global Perspectives',               category: 'Humanities' },
    { name: 'Psychology',                        category: 'Humanities' },
    // Business / Commerce
    { name: 'Accounting',                        category: 'Business' },
    { name: 'Economics',                         category: 'Business' },
    { name: 'Business Studies',                  category: 'Business' },
    { name: 'Travel & Tourism',                  category: 'Business' },
    // Technology
    { name: 'Computer Science',                  category: 'Technology' },
    { name: 'Information & Communications Technology (ICT)', category: 'Technology' },
    { name: 'Design & Technology',               category: 'Technology' },
    // Arts
    { name: 'Music',                             category: 'Arts' },
    { name: 'Media Studies',                     category: 'Arts' },
    { name: 'Art & Design',                      category: 'Arts' },
    { name: 'Film Studies',                      category: 'Arts' },
    { name: 'Drama',                             category: 'Arts' },
    // PE
    { name: 'Sports Science',                    category: 'Physical Education' },
    { name: 'Physical Education',                category: 'Physical Education' },
    // Languages — English
    { name: 'English Language',                  category: 'Languages' },
    { name: 'English Literature',                category: 'Languages' },
    { name: 'English as a Second Language (ESL)', category: 'Languages' },
    { name: 'World Literature',                  category: 'Languages' },
    // Languages — Modern foreign
    { name: 'French',                            category: 'Languages' },
    { name: 'Italian',                           category: 'Languages' },
    { name: 'Spanish',                           category: 'Languages' },
    { name: 'German',                            category: 'Languages' },
    { name: 'Portuguese',                        category: 'Languages' },
    { name: 'Japanese',                          category: 'Languages' },
    { name: 'Russian',                           category: 'Languages' },
    { name: 'Korean',                            category: 'Languages' },
    { name: 'Turkish',                           category: 'Languages' },
    { name: 'Hindi',                             category: 'Languages' },
    { name: 'Urdu',                              category: 'Languages' },
    { name: 'Arabic',                            category: 'Languages' },
    { name: 'Mandarin Chinese',                  category: 'Languages' },
    { name: 'Swahili (Kiswahili)',               category: 'Languages' },
    // Languages — Classical
    { name: 'Latin',                             category: 'Languages' },
    { name: 'Ancient Greek',                     category: 'Languages' },
  ],

  // ── Cambridge / Edexcel A-Level ──
  'A-Level': [
    { name: 'Mathematics',                       category: 'Sciences' },
    { name: 'Further Mathematics',               category: 'Sciences' },
    { name: 'Physics',                           category: 'Sciences' },
    { name: 'Chemistry',                         category: 'Sciences' },
    { name: 'Biology',                           category: 'Sciences' },
    { name: 'Computer Science',                  category: 'Technology' },
    { name: 'Information Technology',            category: 'Technology' },
    { name: 'Design & Technology',               category: 'Technology' },
    { name: 'History',                           category: 'Humanities' },
    { name: 'Geography',                         category: 'Humanities' },
    { name: 'Religious Studies',                 category: 'Humanities' },
    { name: 'Psychology',                        category: 'Humanities' },
    { name: 'Sociology',                         category: 'Humanities' },
    { name: 'Philosophy',                        category: 'Humanities' },
    { name: 'Politics',                          category: 'Humanities' },
    { name: 'Law',                               category: 'Humanities' },
    { name: 'Economics',                         category: 'Business' },
    { name: 'Business',                          category: 'Business' },
    { name: 'Accounting',                        category: 'Business' },
    { name: 'English Language',                  category: 'Languages' },
    { name: 'English Literature',                category: 'Languages' },
    { name: 'French',                            category: 'Languages' },
    { name: 'Spanish',                           category: 'Languages' },
    { name: 'German',                            category: 'Languages' },
    { name: 'Mandarin Chinese',                  category: 'Languages' },
    { name: 'Latin',                             category: 'Languages' },
    { name: 'Art & Design',                      category: 'Arts' },
    { name: 'Music',                             category: 'Arts' },
    { name: 'Drama & Theatre Studies',           category: 'Arts' },
    { name: 'Media Studies',                     category: 'Arts' },
    { name: 'Film Studies',                      category: 'Arts' },
    { name: 'Physical Education',                category: 'Physical Education' },
  ],

  // ── International Baccalaureate Diploma ──
  // Six groups + Theory of Knowledge + Extended Essay + CAS
  'IB Diploma': [
    // Group 1 — Studies in Language and Literature
    { name: 'English A: Language and Literature',  category: 'Studies in Language and Literature' },
    { name: 'English A: Literature',               category: 'Studies in Language and Literature' },
    // Group 2 — Language Acquisition
    { name: 'English B',                           category: 'Language Acquisition' },
    { name: 'French B',                            category: 'Language Acquisition' },
    { name: 'Spanish B',                           category: 'Language Acquisition' },
    { name: 'German B',                            category: 'Language Acquisition' },
    { name: 'Mandarin B',                          category: 'Language Acquisition' },
    { name: 'Spanish ab initio',                   category: 'Language Acquisition' },
    { name: 'French ab initio',                    category: 'Language Acquisition' },
    // Group 3 — Individuals and Societies
    { name: 'History',                             category: 'Individuals and Societies' },
    { name: 'Geography',                           category: 'Individuals and Societies' },
    { name: 'Economics',                           category: 'Individuals and Societies' },
    { name: 'Psychology',                          category: 'Individuals and Societies' },
    { name: 'Business Management',                 category: 'Individuals and Societies' },
    { name: 'Global Politics',                     category: 'Individuals and Societies' },
    { name: 'Philosophy',                          category: 'Individuals and Societies' },
    { name: 'Information Technology in a Global Society', category: 'Individuals and Societies' },
    // Group 4 — Sciences
    { name: 'Biology',                             category: 'Sciences' },
    { name: 'Chemistry',                           category: 'Sciences' },
    { name: 'Physics',                             category: 'Sciences' },
    { name: 'Computer Science',                    category: 'Sciences' },
    { name: 'Environmental Systems and Societies', category: 'Sciences' },
    { name: 'Sports, Exercise and Health Science', category: 'Sciences' },
    { name: 'Design Technology',                   category: 'Sciences' },
    // Group 5 — Mathematics
    { name: 'Mathematics: Analysis and Approaches', category: 'Mathematics' },
    { name: 'Mathematics: Applications and Interpretation', category: 'Mathematics' },
    // Group 6 — The Arts
    { name: 'Visual Arts',                         category: 'The Arts' },
    { name: 'Music',                               category: 'The Arts' },
    { name: 'Theatre',                             category: 'The Arts' },
    { name: 'Film',                                category: 'The Arts' },
    { name: 'Dance',                               category: 'The Arts' },
    { name: 'Literature and Performance',          category: 'The Arts' },
    // Core
    { name: 'Theory of Knowledge',                 category: 'Core' },
    { name: 'Extended Essay',                      category: 'Core' },
  ],

  // ── IB Middle Years Programme (8 subject groups) ──
  'IB MYP': [
    { name: 'Language and Literature (English)',   category: 'Language and Literature' },
    { name: 'Language Acquisition (French)',       category: 'Language Acquisition' },
    { name: 'Language Acquisition (Spanish)',      category: 'Language Acquisition' },
    { name: 'Language Acquisition (Mandarin)',     category: 'Language Acquisition' },
    { name: 'Individuals and Societies',           category: 'Individuals and Societies' },
    { name: 'Sciences',                            category: 'Sciences' },
    { name: 'Mathematics',                         category: 'Mathematics' },
    { name: 'Arts (Visual Arts)',                  category: 'Arts' },
    { name: 'Arts (Music)',                        category: 'Arts' },
    { name: 'Arts (Drama)',                        category: 'Arts' },
    { name: 'Physical and Health Education',       category: 'Physical and Health Education' },
    { name: 'Design',                              category: 'Design' },
  ],

  // ── Kenya CBC (Junior Secondary onwards) ──
  'Kenya CBC': [
    { name: 'English',                             category: 'Languages' },
    { name: 'Kiswahili',                           category: 'Languages' },
    { name: 'French',                              category: 'Languages' },
    { name: 'German',                              category: 'Languages' },
    { name: 'Arabic',                              category: 'Languages' },
    { name: 'Mandarin Chinese',                    category: 'Languages' },
    { name: 'Kenyan Sign Language',                category: 'Languages' },
    { name: 'Mathematics',                         category: 'STEM' },
    { name: 'Integrated Science',                  category: 'STEM' },
    { name: 'Pre-Technical Studies',               category: 'STEM' },
    { name: 'Agriculture',                         category: 'STEM' },
    { name: 'Computer Science',                    category: 'STEM' },
    { name: 'Health Education',                    category: 'STEM' },
    { name: 'Social Studies',                      category: 'Humanities' },
    { name: 'Religious Education',                 category: 'Humanities' },
    { name: 'Christian Religious Education',       category: 'Humanities' },
    { name: 'Islamic Religious Education',         category: 'Humanities' },
    { name: 'Hindu Religious Education',           category: 'Humanities' },
    { name: 'Life Skills Education',               category: 'Life Skills' },
    { name: 'Performing Arts',                     category: 'Arts' },
    { name: 'Visual Arts',                         category: 'Arts' },
    { name: 'Physical Education and Sports',       category: 'Physical Education' },
    { name: 'Business Studies',                    category: 'Business' },
    { name: 'Home Science',                        category: 'Practical' },
  ],

  // ── British National Curriculum (Years 1–11) ──
  BNC: [
    { name: 'English',                             category: 'Core' },
    { name: 'Mathematics',                         category: 'Core' },
    { name: 'Science',                             category: 'Core' },
    { name: 'Biology',                             category: 'Sciences' },
    { name: 'Chemistry',                           category: 'Sciences' },
    { name: 'Physics',                             category: 'Sciences' },
    { name: 'History',                             category: 'Humanities' },
    { name: 'Geography',                           category: 'Humanities' },
    { name: 'Religious Studies',                   category: 'Humanities' },
    { name: 'Citizenship',                         category: 'Humanities' },
    { name: 'Computing',                           category: 'Technology' },
    { name: 'Design & Technology',                 category: 'Technology' },
    { name: 'Art & Design',                        category: 'Arts' },
    { name: 'Music',                               category: 'Arts' },
    { name: 'Drama',                               category: 'Arts' },
    { name: 'Physical Education',                  category: 'Physical Education' },
    { name: 'French',                              category: 'Languages' },
    { name: 'Spanish',                             category: 'Languages' },
    { name: 'German',                              category: 'Languages' },
    { name: 'Personal, Social, Health Education (PSHE)', category: 'Life Skills' },
  ],

  // ── American (K–12 common course list) ──
  American: [
    // English
    { name: 'English Language Arts',               category: 'English' },
    { name: 'AP English Language and Composition', category: 'English' },
    { name: 'AP English Literature and Composition', category: 'English' },
    // Math
    { name: 'Algebra I',                           category: 'Mathematics' },
    { name: 'Geometry',                            category: 'Mathematics' },
    { name: 'Algebra II',                          category: 'Mathematics' },
    { name: 'Pre-Calculus',                        category: 'Mathematics' },
    { name: 'Calculus',                            category: 'Mathematics' },
    { name: 'AP Calculus AB',                      category: 'Mathematics' },
    { name: 'AP Calculus BC',                      category: 'Mathematics' },
    { name: 'AP Statistics',                       category: 'Mathematics' },
    // Sciences
    { name: 'Biology',                             category: 'Sciences' },
    { name: 'Chemistry',                           category: 'Sciences' },
    { name: 'Physics',                             category: 'Sciences' },
    { name: 'Environmental Science',               category: 'Sciences' },
    { name: 'AP Biology',                          category: 'Sciences' },
    { name: 'AP Chemistry',                        category: 'Sciences' },
    { name: 'AP Physics 1',                        category: 'Sciences' },
    { name: 'AP Physics 2',                        category: 'Sciences' },
    // Social Studies
    { name: 'US History',                          category: 'Social Studies' },
    { name: 'World History',                       category: 'Social Studies' },
    { name: 'Government',                          category: 'Social Studies' },
    { name: 'Economics',                           category: 'Social Studies' },
    { name: 'AP US History',                       category: 'Social Studies' },
    { name: 'AP World History',                    category: 'Social Studies' },
    { name: 'AP Psychology',                       category: 'Social Studies' },
    // Languages
    { name: 'Spanish',                             category: 'Languages' },
    { name: 'French',                              category: 'Languages' },
    { name: 'Mandarin Chinese',                    category: 'Languages' },
    { name: 'Latin',                               category: 'Languages' },
    // Technology
    { name: 'Computer Science',                    category: 'Technology' },
    { name: 'AP Computer Science A',               category: 'Technology' },
    // Arts
    { name: 'Visual Arts',                         category: 'Arts' },
    { name: 'Music',                               category: 'Arts' },
    { name: 'Drama',                               category: 'Arts' },
    // PE
    { name: 'Physical Education',                  category: 'Physical Education' },
    { name: 'Health',                              category: 'Physical Education' },
  ],

  // ── IUFP — International University Foundation Programme ──
  // Default foundation module set. Adjust via the admin subject tools
  // if Smartious's IUFP curriculum differs.
  IUFP: [
    { name: 'Academic English Skills',             category: 'Core Skills' },
    { name: 'Study & Research Skills',             category: 'Core Skills' },
    { name: 'Mathematics for Foundation',          category: 'Core Skills' },
    { name: 'Business & Economics',                category: 'Pathway Modules' },
    { name: 'Physics',                             category: 'Pathway Modules' },
    { name: 'Chemistry',                           category: 'Pathway Modules' },
    { name: 'Biology',                             category: 'Pathway Modules' },
    { name: 'Computing & IT',                      category: 'Pathway Modules' },
  ],
};

router.post('/seed-defaults', auth, requireRole('admin'), async (req, res) => {
  try {
    let created = 0;
    let skipped = 0;
    const summary = {};

    for (const [curriculum, list] of Object.entries(DEFAULT_SUBJECTS)) {
      summary[curriculum] = { created: 0, skipped: 0 };
      for (const entry of list) {
        const exists = await Subject.findOne({
          curriculum,
          subjectName: entry.name,
        });
        if (exists) {
          skipped++;
          summary[curriculum].skipped++;
          continue;
        }
        await Subject.create({
          curriculum,
          subjectName: entry.name,
          category: entry.category,
          isActive: true,
        });
        created++;
        summary[curriculum].created++;
      }
    }

    res.json({
      success: true,
      message: `Seeded ${created} subject${created === 1 ? '' : 's'} (${skipped} already existed).`,
      created, skipped, summary,
    });
  } catch (e) {
    console.error('[subjects seed-defaults]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
