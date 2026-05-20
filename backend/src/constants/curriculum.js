/**
 * CURRICULUM CONSTANTS
 * ============================================================
 * Smartious supports 15 curricula across boards and stages:
 *   Cambridge: Primary, Lower Secondary, IGCSE, A-Level
 *   Edexcel:   Lower Secondary, IGCSE, A-Level
 *   AQA:       Lower Secondary, GCSE, A-Level
 *   Other:     IB, BNC, American, Canadian, Kenya CBC
 *
 * Each curriculum has its own grade naming convention.
 * Subjects are organized by category and tagged with which
 * curricula they're available in.
 */

// ─────────────────────────────────────────────────────────
// SUPPORTED CURRICULA
// ─────────────────────────────────────────────────────────
const CURRICULA = [
  // ── CAMBRIDGE — full primary-through-A-Level pathway ──
  { id: 'CambridgePrimary',   name: 'Cambridge Primary',          region: 'International' },
  { id: 'CambridgeLowerSec',  name: 'Cambridge Lower Secondary',  region: 'International' },
  { id: 'CambridgeIGCSE',     name: 'Cambridge IGCSE',            region: 'International' },
  { id: 'CambridgeALevel',    name: 'Cambridge A-Level',          region: 'International' },
  // ── EDEXCEL — secondary stages only (no Edexcel Primary) ──
  { id: 'EdexcelLowerSec',    name: 'Edexcel Lower Secondary',    region: 'International' },
  { id: 'EdexcelIGCSE',       name: 'Edexcel IGCSE',              region: 'International' },
  { id: 'EdexcelALevel',      name: 'Edexcel A-Level',            region: 'International' },
  // ── AQA — secondary stages only ──
  { id: 'AQALowerSec',        name: 'AQA Lower Secondary',        region: 'United Kingdom' },
  { id: 'AQAGCSE',            name: 'AQA GCSE',                   region: 'United Kingdom' },
  { id: 'AQAALevel',          name: 'AQA A-Level',                region: 'United Kingdom' },
  // ── OTHER ──
  { id: 'IB',                 name: 'International Baccalaureate (IB)', region: 'International' },
  { id: 'BNC',                name: 'British National Curriculum',      region: 'United Kingdom' },
  { id: 'American',           name: 'American Curriculum',              region: 'USA' },
  { id: 'Canadian',           name: 'Canadian Curriculum',              region: 'Canada' },
  { id: 'KenyaCBC',           name: 'Kenya CBC',                        region: 'Kenya' },
]

// ─────────────────────────────────────────────────────────
// GRADE NAMING PER CURRICULUM
// ─────────────────────────────────────────────────────────
// Stored as ordered arrays. Frontend uses these to populate
// grade dropdowns based on selected curriculum.
const GRADES_BY_CURRICULUM = {
  // ── CAMBRIDGE — split into official stages ──
  CambridgePrimary:  ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'],
  CambridgeLowerSec: ['Year 7', 'Year 8', 'Year 9'],
  CambridgeIGCSE:    ['Year 10', 'Year 11'],
  CambridgeALevel:   ['Year 12 (AS)', 'Year 13 (A2)'],
  // ── EDEXCEL — secondary stages only ──
  EdexcelLowerSec:   ['Year 7', 'Year 8', 'Year 9'],
  EdexcelIGCSE:      ['Year 10', 'Year 11'],
  EdexcelALevel:     ['Year 12 (AS)', 'Year 13 (A2)'],
  // ── AQA — secondary stages only ──
  AQALowerSec:       ['Year 7', 'Year 8', 'Year 9'],
  AQAGCSE:           ['Year 10', 'Year 11'],
  AQAALevel:         ['Year 12 (AS)', 'Year 13 (A2)'],
  // ── OTHER ──
  BNC: [
    'Reception',
    'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6',
    'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11',
    'Year 12 (Sixth Form)', 'Year 13 (Sixth Form)',
  ],
  IB: [
    'PYP Grade 1', 'PYP Grade 2', 'PYP Grade 3', 'PYP Grade 4', 'PYP Grade 5',
    'MYP Grade 6', 'MYP Grade 7', 'MYP Grade 8', 'MYP Grade 9', 'MYP Grade 10',
    'DP Year 1 (Grade 11)', 'DP Year 2 (Grade 12)',
  ],
  American: [
    'Pre-K', 'Kindergarten',
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8',
    'Grade 9 (Freshman)', 'Grade 10 (Sophomore)', 'Grade 11 (Junior)', 'Grade 12 (Senior)',
  ],
  Canadian: [
    'Pre-K', 'Kindergarten',
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8',
    'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
  ],
  // ── KENYA CBC — Grades 11 & 12 are senior school, named with Form equivalents ──
  KenyaCBC: [
    'Grade 1', 'Grade 2', 'Grade 3',
    'Grade 4', 'Grade 5', 'Grade 6',
    'Grade 7', 'Grade 8', 'Grade 9',
    'Grade 10',
    'Grade 11 (Form 3)', 'Grade 12 (Form 4)',
  ],
}

// ─────────────────────────────────────────────────────────
// SUBJECT CATALOG
// ─────────────────────────────────────────────────────────
// Each subject lists which curricula it's available in.
// `availableIn: 'all'` means available across all 7 curricula.
const SUBJECTS = [
  // ── CAMBRIDGE PRIMARY (Year 1–6) ──────────────────────
  // Primary has its own deliberate, age-appropriate subject
  // set — it does NOT inherit the secondary `availableIn:'all'`
  // subjects (no Economics, separate sciences, etc. at primary).
  { id: 'primary_mathematics', name: 'Primary Mathematics', category: 'Mathematics', availableIn: ['CambridgePrimary'] },
  { id: 'primary_english',     name: 'Primary English',     category: 'English',     availableIn: ['CambridgePrimary'] },
  { id: 'primary_science',     name: 'Primary Science',     category: 'Sciences',    availableIn: ['CambridgePrimary'] },
  { id: 'primary_ict',         name: 'Primary Computing',   category: 'Technology',  availableIn: ['CambridgePrimary'] },
  { id: 'primary_global',      name: 'Primary Global Perspectives', category: 'Humanities', availableIn: ['CambridgePrimary'] },

  // ── CORE: MATHEMATICS ─────────────────────────────────
  { id: 'mathematics',         name: 'Mathematics',                category: 'Mathematics', availableIn: 'all' },
  { id: 'additional_math',     name: 'Additional Mathematics',     category: 'Mathematics', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE'] },
  { id: 'further_math',        name: 'Further Mathematics',        category: 'Mathematics', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC'] },
  { id: 'ap_calculus',         name: 'AP Calculus',                category: 'Mathematics', availableIn: ['American'] },
  { id: 'ap_statistics',       name: 'AP Statistics',              category: 'Mathematics', availableIn: ['American'] },
  { id: 'ib_math_aa',          name: 'IB Mathematics: Analysis & Approaches', category: 'Mathematics', availableIn: ['IB'] },
  { id: 'ib_math_ai',          name: 'IB Mathematics: Applications & Interpretation', category: 'Mathematics', availableIn: ['IB'] },

  // ── CORE: ENGLISH ─────────────────────────────────────
  { id: 'english_language',    name: 'English Language',           category: 'English', availableIn: 'all' },
  { id: 'english_literature',  name: 'English Literature',         category: 'English', availableIn: 'all' },
  { id: 'esl',                 name: 'English as a Second Language (ESL)', category: 'English', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IB'] },
  { id: 'world_literature',    name: 'World Literature',           category: 'English', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE'] },
  { id: 'ap_english_lang',     name: 'AP English Language & Composition', category: 'English', availableIn: ['American'] },
  { id: 'ap_english_lit',      name: 'AP English Literature & Composition', category: 'English', availableIn: ['American'] },

  // ── CORE: SCIENCES ────────────────────────────────────
  { id: 'physics',             name: 'Physics',                    category: 'Sciences', availableIn: 'all' },
  { id: 'chemistry',           name: 'Chemistry',                  category: 'Sciences', availableIn: 'all' },
  { id: 'biology',             name: 'Biology',                    category: 'Sciences', availableIn: 'all' },
  { id: 'combined_science',    name: 'Combined Science',           category: 'Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC'] },
  { id: 'general_science',     name: 'General Science',            category: 'Sciences', availableIn: ['American', 'Canadian'] },
  { id: 'environmental_sci',   name: 'Environmental Science',      category: 'Sciences', availableIn: ['IB', 'American', 'Canadian'] },
  { id: 'earth_science',       name: 'Earth & Space Science',      category: 'Sciences', availableIn: ['American', 'Canadian'] },
  { id: 'ap_physics',          name: 'AP Physics',                 category: 'Sciences', availableIn: ['American'] },
  { id: 'ap_chemistry',        name: 'AP Chemistry',               category: 'Sciences', availableIn: ['American'] },
  { id: 'ap_biology',          name: 'AP Biology',                 category: 'Sciences', availableIn: ['American'] },

  // ── HUMANITIES ────────────────────────────────────────
  { id: 'history',             name: 'History',                    category: 'Humanities', availableIn: 'all' },
  { id: 'geography',           name: 'Geography',                  category: 'Humanities', availableIn: 'all' },
  { id: 'religious_studies',   name: 'Religious Studies',          category: 'Humanities', availableIn: 'all' },
  { id: 'global_perspectives', name: 'Global Perspectives',        category: 'Humanities', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IB'] },
  { id: 'world_history',       name: 'World History',              category: 'Humanities', availableIn: ['IB', 'American', 'Canadian'] },
  { id: 'ap_world_history',    name: 'AP World History',           category: 'Humanities', availableIn: ['American'] },
  { id: 'ap_us_history',       name: 'AP US History',              category: 'Humanities', availableIn: ['American'] },
  { id: 'civics',              name: 'Civics & Government',        category: 'Humanities', availableIn: ['American', 'Canadian'] },

  // ── BUSINESS & SOCIAL SCIENCES ────────────────────────
  { id: 'business_studies',    name: 'Business Studies',           category: 'Business & Social Sciences', availableIn: 'all' },
  { id: 'economics',           name: 'Economics',                  category: 'Business & Social Sciences', availableIn: 'all' },
  { id: 'accounting',          name: 'Accounting',                 category: 'Business & Social Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC', 'American', 'Canadian'] },
  { id: 'psychology',          name: 'Psychology',                 category: 'Business & Social Sciences', availableIn: 'all' },
  { id: 'sociology',           name: 'Sociology',                  category: 'Business & Social Sciences', availableIn: 'all' },
  { id: 'travel_tourism',      name: 'Travel & Tourism',           category: 'Business & Social Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE'] },
  { id: 'ap_economics',        name: 'AP Economics (Macro/Micro)', category: 'Business & Social Sciences', availableIn: ['American'] },
  { id: 'ap_psychology',       name: 'AP Psychology',              category: 'Business & Social Sciences', availableIn: ['American'] },

  // ── TECHNOLOGY ────────────────────────────────────────
  { id: 'computer_science',    name: 'Computer Science',           category: 'Technology', availableIn: 'all' },
  { id: 'ict',                 name: 'Information & Communications Technology (ICT)', category: 'Technology', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC'] },
  { id: 'design_technology',   name: 'Design & Technology',        category: 'Technology', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IB', 'BNC'] },
  { id: 'ap_computer_science', name: 'AP Computer Science',        category: 'Technology', availableIn: ['American'] },

  // ── ARTS ──────────────────────────────────────────────
  { id: 'art_design',          name: 'Art & Design',               category: 'Arts', availableIn: 'all' },
  { id: 'visual_arts',         name: 'Visual Arts',                category: 'Arts', availableIn: ['IB', 'American', 'Canadian'] },
  { id: 'music',               name: 'Music',                      category: 'Arts', availableIn: 'all' },
  { id: 'drama',               name: 'Drama',                      category: 'Arts', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IB', 'BNC'] },
  { id: 'theatre_studies',     name: 'Theatre Studies',            category: 'Arts', availableIn: ['IB', 'BNC', 'American'] },
  { id: 'film_studies',        name: 'Film Studies',               category: 'Arts', availableIn: ['CambridgeIGCSE', 'EdexcelIGCSE', 'AQAGCSE', 'IB', 'BNC', 'American'] },
  { id: 'media_studies',       name: 'Media Studies',              category: 'Arts', availableIn: ['CambridgeIGCSE', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC'] },

  // ── PHYSICAL EDUCATION ────────────────────────────────
  { id: 'physical_education',  name: 'Physical Education',         category: 'Physical Education', availableIn: 'all' },
  { id: 'sports_science',      name: 'Sports Science',             category: 'Physical Education', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC'] },
  { id: 'health_education',    name: 'Health Education',           category: 'Physical Education', availableIn: ['American', 'Canadian'] },

  // ── MODERN LANGUAGES ──────────────────────────────────
  { id: 'french',              name: 'French',                     category: 'Modern Languages', availableIn: 'all' },
  { id: 'spanish',             name: 'Spanish',                    category: 'Modern Languages', availableIn: 'all' },
  { id: 'german',              name: 'German',                     category: 'Modern Languages', availableIn: 'all' },
  { id: 'italian',             name: 'Italian',                    category: 'Modern Languages', availableIn: 'all' },
  { id: 'portuguese',          name: 'Portuguese',                 category: 'Modern Languages', availableIn: 'all' },
  { id: 'mandarin',            name: 'Mandarin Chinese',           category: 'Modern Languages', availableIn: 'all' },
  { id: 'japanese',            name: 'Japanese',                   category: 'Modern Languages', availableIn: 'all' },
  { id: 'korean',              name: 'Korean',                     category: 'Modern Languages', availableIn: 'all' },
  { id: 'arabic',              name: 'Arabic',                     category: 'Modern Languages', availableIn: 'all' },
  { id: 'russian',             name: 'Russian',                    category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IB', 'American'] },
  { id: 'swahili',             name: 'Swahili (Kiswahili)',        category: 'Modern Languages', availableIn: 'all' },
  { id: 'hindi',               name: 'Hindi',                      category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'AQAGCSE', 'IB'] },
  { id: 'urdu',                name: 'Urdu',                       category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'AQAGCSE'] },
  { id: 'turkish',             name: 'Turkish',                    category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'AQAGCSE'] },
  { id: 'ap_spanish',          name: 'AP Spanish Language',        category: 'Modern Languages', availableIn: ['American'] },
  { id: 'ap_french',           name: 'AP French Language',         category: 'Modern Languages', availableIn: ['American'] },

  // ── CLASSICAL LANGUAGES ───────────────────────────────
  { id: 'latin',               name: 'Latin',                      category: 'Classical Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelLowerSec', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IB', 'BNC', 'American'] },
  { id: 'ancient_greek',       name: 'Ancient Greek',              category: 'Classical Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'AQAGCSE', 'IB', 'BNC'] },

  // ── IB-SPECIFIC CORE ──────────────────────────────────
  { id: 'tok',                 name: 'Theory of Knowledge (TOK)',  category: 'IB Core', availableIn: ['IB'] },
  { id: 'extended_essay',      name: 'Extended Essay',             category: 'IB Core', availableIn: ['IB'] },
  { id: 'cas',                 name: 'Creativity, Activity, Service (CAS)', category: 'IB Core', availableIn: ['IB'] },
]

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

/**
 * Get all subjects available for a given curriculum.
 * Returns subjects grouped by category.
 */
const getSubjectsForCurriculum = (curriculumId) => {
  // NOTE: `availableIn: 'all'` means all SECONDARY curricula — it
  // predates the Primary curriculum and must NOT auto-include it
  // (a Year 3 child does not take Economics or separate sciences).
  // Primary only gets subjects that explicitly list 'CambridgePrimary'.
  const filtered = SUBJECTS.filter(s => {
    if (curriculumId === 'CambridgePrimary') {
      return Array.isArray(s.availableIn) && s.availableIn.includes('CambridgePrimary')
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
  if (curriculumId === 'CambridgePrimary') {
    return Array.isArray(subject.availableIn) && subject.availableIn.includes('CambridgePrimary')
  }
  return subject.availableIn === 'all' || subject.availableIn.includes(curriculumId)
}

module.exports = {
  CURRICULA,
  GRADES_BY_CURRICULUM,
  SUBJECTS,
  getSubjectsForCurriculum,
  getGradesForCurriculum,
  isSubjectValidForCurriculum,
}
