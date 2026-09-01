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
const CURRICULA = [
  // ── CAMBRIDGE — full primary-through-A-Level pathway ──
  { id: 'CambridgePrimary',   name: 'Cambridge Primary',          region: 'International' },
  { id: 'CambridgeLowerSec', name: 'Cambridge Lower Secondary',  region: 'International' },
  { id: 'CambridgeIGCSE',     name: 'Cambridge IGCSE',            region: 'International' },
  { id: 'CambridgeALevel',    name: 'Cambridge A-Level',          region: 'International' },
  // ── EDEXCEL ──
  { id: 'EdexcelPrimary',    name: 'Edexcel iPrimary',           region: 'International' },
  { id: 'EdexcelLowerSec',   name: 'Edexcel Lower Secondary',    region: 'International' },
  { id: 'EdexcelIGCSE',       name: 'Edexcel IGCSE',              region: 'International' },
  { id: 'EdexcelALevel',      name: 'Edexcel A-Level',            region: 'International' },
  // ── AQA — secondary stages only ──
  { id: 'AQALowerSec',        name: 'AQA Lower Secondary',        region: 'United Kingdom' },
  { id: 'AQAGCSE',            name: 'AQA GCSE',                   region: 'United Kingdom' },
  { id: 'AQAALevel',          name: 'AQA A-Level',                region: 'United Kingdom' },
  // ── OTHER ──
  { id: 'IBPYP',              name: 'IB Primary Years (PYP)',           region: 'International' },
  { id: 'IBMYP',              name: 'IB Middle Years (MYP)',            region: 'International' },
  { id: 'IBDP',               name: 'IB Diploma (DP)',                  region: 'International' },
  { id: 'BNC',                name: 'British National Curriculum',      region: 'United Kingdom' },
  { id: 'American',           name: 'American Curriculum',              region: 'USA' },
  { id: 'Canadian',           name: 'Canadian Curriculum',              region: 'Canada' },
  { id: 'KenyaCBE',           name: 'Kenya CBE',                        region: 'Kenya' },
  // KCSE is its own curriculum, not CBE grades in disguise. It is being
  // phased out, and keeping it separate means it can be deactivated in a
  // single move when the last cohort sits the exam — rather than
  // unpicking Form 3 records from Grade 11 records afterwards.
  { id: 'KCSE',               name: 'KCSE (Form 3-4, phasing out)',     region: 'Kenya' },
]

// ─────────────────────────────────────────────────────────
// GRADE NAMING PER CURRICULUM
// ─────────────────────────────────────────────────────────
// Stored as ordered arrays. Frontend uses these to populate
// grade dropdowns based on selected curriculum.
const GRADES_BY_CURRICULUM = {
  // ── CAMBRIDGE — split into official stages ──
  CambridgePrimary:  ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'],
  EdexcelPrimary:   ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'],
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
  IBPYP: ['PYP Grade 1', 'PYP Grade 2', 'PYP Grade 3', 'PYP Grade 4', 'PYP Grade 5'],
  IBMYP: ['MYP Grade 6', 'MYP Grade 7', 'MYP Grade 8', 'MYP Grade 9', 'MYP Grade 10'],
  IBDP:  ['DP Year 1 (Grade 11)', 'DP Year 2 (Grade 12)'],
  // Legacy alias — existing records tagged 'IB' before the
  // 2026-08-04 PYP/MYP/DP split. Kept so stale values still
  // resolve to a sensible grade list. Do not use for new writes.
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
  // CBE runs Grade 1-12. The previous list ended 'Grade 11 (Form 3)' and
  // 'Grade 12 (Form 4)' because KCSE was being hosted in CBE grade slots.
  // KCSE now has its own curriculum, so those strokes are gone.
  KenyaCBE: [
    'Grade 1', 'Grade 2', 'Grade 3',
    'Grade 4', 'Grade 5', 'Grade 6',
    'Grade 7', 'Grade 8', 'Grade 9',
    'Grade 10', 'Grade 11', 'Grade 12',
  ],
  KCSE: ['Form 3', 'Form 4'],
}

// ─────────────────────────────────────────────────────────
// SUBJECT CATALOG
// ─────────────────────────────────────────────────────────
// Each subject lists which curricula it's available in.
// `availableIn: 'all'` means available across all 7 curricula.
const SUBJECTS = [
  // ── Kenya CBE (Grade 1-12) ─────────────────────────────────
  // CBE previously offered NOTHING here: no subject listed KenyaCBC, so
  // enrolling a CBE student produced an empty dropdown.
  //
  // Grade 1-9 take the junior-school learning areas; Grade 10-12 add the
  // senior pathway subjects. Listed as one set because the grade field
  // already distinguishes the level.
  //
  // Kept in step with the seeder — a mismatch there is what produced
  // duplicate records like Computer Studies beside Computer Science.
  { id: 'cbe_english',           name: 'English',                         category: 'Languages',                   availableIn: ['KenyaCBE'] },
  { id: 'cbe_kiswahili',         name: 'Kiswahili',                       category: 'Languages',                   availableIn: ['KenyaCBE'] },
  { id: 'cbe_ksl',               name: 'Kenyan Sign Language',            category: 'Languages',                   availableIn: ['KenyaCBE'] },
  { id: 'cbe_arabic',            name: 'Arabic',                          category: 'Languages',                   availableIn: ['KenyaCBE'] },
  { id: 'cbe_french',            name: 'French',                          category: 'Languages',                   availableIn: ['KenyaCBE'] },
  { id: 'cbe_german',            name: 'German',                          category: 'Languages',                   availableIn: ['KenyaCBE'] },
  { id: 'cbe_mandarin',          name: 'Mandarin Chinese',                category: 'Languages',                   availableIn: ['KenyaCBE'] },
  { id: 'cbe_mathematics',       name: 'Mathematics',                     category: 'Mathematics',                 availableIn: ['KenyaCBE'] },
  { id: 'cbe_integrated_sci',    name: 'Integrated Science',              category: 'Sciences',                    availableIn: ['KenyaCBE'] },
  { id: 'cbe_biology',           name: 'Biology',                         category: 'Sciences',                    availableIn: ['KenyaCBE'] },
  { id: 'cbe_chemistry',         name: 'Chemistry',                       category: 'Sciences',                    availableIn: ['KenyaCBE'] },
  { id: 'cbe_physics',           name: 'Physics',                         category: 'Sciences',                    availableIn: ['KenyaCBE'] },
  { id: 'cbe_agriculture',       name: 'Agriculture',                     category: 'Sciences',                    availableIn: ['KenyaCBE'] },
  { id: 'cbe_home_science',      name: 'Home Science',                    category: 'Sciences',                    availableIn: ['KenyaCBE'] },
  { id: 'cbe_social_studies',    name: 'Social Studies',                  category: 'Humanities',                  availableIn: ['KenyaCBE'] },
  { id: 'cbe_history',           name: 'History and Government',          category: 'Humanities',                  availableIn: ['KenyaCBE'] },
  { id: 'cbe_geography',         name: 'Geography',                       category: 'Humanities',                  availableIn: ['KenyaCBE'] },
  { id: 'cbe_cre',               name: 'Christian Religious Education',   category: 'Humanities',                  availableIn: ['KenyaCBE'] },
  { id: 'cbe_ire',               name: 'Islamic Religious Education',     category: 'Humanities',                  availableIn: ['KenyaCBE'] },
  { id: 'cbe_hre',               name: 'Hindu Religious Education',       category: 'Humanities',                  availableIn: ['KenyaCBE'] },
  { id: 'cbe_business',          name: 'Business Studies',                category: 'Business & Social Sciences',  availableIn: ['KenyaCBE'] },
  { id: 'cbe_computer_sci',      name: 'Computer Science',                category: 'Technology',                  availableIn: ['KenyaCBE'] },
  { id: 'cbe_pretech',           name: 'Pre-Technical Studies',           category: 'Technology',                  availableIn: ['KenyaCBE'] },
  { id: 'cbe_music',             name: 'Music',                           category: 'Creative Arts',               availableIn: ['KenyaCBE'] },
  { id: 'cbe_pe_sports',         name: 'Physical Education and Sports',   category: 'Physical Education',          availableIn: ['KenyaCBE'] },
  { id: 'cbe_health',            name: 'Health Education',                category: 'Life Skills',                 availableIn: ['KenyaCBE'] },
  { id: 'cbe_life_skills',       name: 'Life Skills Education',           category: 'Life Skills',                 availableIn: ['KenyaCBE'] },

  // ── KCSE (Form 3-4, phasing out) ───────────────────────────
  // Deliberately its own set. When the last cohort sits the exam, these
  // entries and the curriculum go together in one move.
  { id: 'kcse_english',        name: 'English',                    category: 'Languages',   availableIn: ['KCSE'] },
  { id: 'kcse_kiswahili',      name: 'Kiswahili',                  category: 'Languages',   availableIn: ['KCSE'] },
  { id: 'kcse_mathematics',    name: 'Mathematics',                category: 'Mathematics', availableIn: ['KCSE'] },
  { id: 'kcse_biology',        name: 'Biology',                    category: 'Sciences',    availableIn: ['KCSE'] },
  { id: 'kcse_chemistry',      name: 'Chemistry',                  category: 'Sciences',    availableIn: ['KCSE'] },
  { id: 'kcse_physics',        name: 'Physics',                    category: 'Sciences',    availableIn: ['KCSE'] },
  { id: 'kcse_geography',      name: 'Geography',                  category: 'Humanities',  availableIn: ['KCSE'] },
  { id: 'kcse_history',        name: 'History & Government',       category: 'Humanities',  availableIn: ['KCSE'] },
  { id: 'kcse_cre',            name: 'Christian Religious Education', category: 'Humanities', availableIn: ['KCSE'] },
  { id: 'kcse_ire',            name: 'Islamic Religious Education', category: 'Humanities', availableIn: ['KCSE'] },
  { id: 'kcse_business',       name: 'Business Studies',           category: 'Business & Social Sciences', availableIn: ['KCSE'] },
  { id: 'kcse_agriculture',    name: 'Agriculture',                category: 'Sciences',    availableIn: ['KCSE'] },
  { id: 'kcse_computer',       name: 'Computer Studies',           category: 'Technology',  availableIn: ['KCSE'] },

  // ── Edexcel iPrimary (Years 1-6) ───────────────────────────
  // Pearson iPrimary covers four subjects. Listed explicitly rather than
  // inherited, for the same reason Lower Secondary is: a Year 2 pupil
  // should not be offered Economics.
  { id: 'iprim_english',     name: 'English',            category: 'Languages',   availableIn: ['EdexcelPrimary'] },
  { id: 'iprim_mathematics', name: 'Mathematics',        category: 'Mathematics', availableIn: ['EdexcelPrimary'] },
  { id: 'iprim_science',     name: 'Science',            category: 'Sciences',    availableIn: ['EdexcelPrimary'] },
  { id: 'iprim_computing',   name: 'Computing',          category: 'Technology',  availableIn: ['EdexcelPrimary'] },

  // ── Lower Secondary (Years 7-9) ────────────────────────────
  // Listed explicitly rather than inherited from the IGCSE set. The
  // catalogue previously offered a Year 7 student Accounting, Travel &
  // Tourism and Additional Mathematics, because both Lower Secondary keys
  // had been added to every IGCSE subject. Lower Secondary teaches
  // integrated Science, not separate Physics/Chemistry/Biology, and none
  // of the specialist IGCSE options.
  { id: 'ls_mathematics',       name: 'Mathematics',         category: 'Mathematics', availableIn: ['CambridgeLowerSec', 'EdexcelLowerSec'] },
  { id: 'ls_english',           name: 'English',             category: 'Languages',   availableIn: ['CambridgeLowerSec', 'EdexcelLowerSec'] },
  { id: 'ls_science',           name: 'Science',             category: 'Sciences',    availableIn: ['CambridgeLowerSec', 'EdexcelLowerSec'] },
  { id: 'ls_computer_science',  name: 'Computer Science',    category: 'Technology',  availableIn: ['CambridgeLowerSec', 'EdexcelLowerSec'] },
  { id: 'ls_geography',         name: 'Geography',           category: 'Humanities',  availableIn: ['CambridgeLowerSec', 'EdexcelLowerSec'] },
  { id: 'ls_history',           name: 'History',             category: 'Humanities',  availableIn: ['CambridgeLowerSec', 'EdexcelLowerSec'] },
  // Cambridge only — Edexcel iLowerSecondary has no equivalent.
  { id: 'ls_global_persp',      name: 'Global Perspectives', category: 'Humanities',  availableIn: ['CambridgeLowerSec'] },
  { id: 'ls_art_design',        name: 'Art & Design',        category: 'Creative Arts', availableIn: ['CambridgeLowerSec'] },

  // ── CAMBRIDGE PRIMARY (Year 1–6) ──────────────────────
  // Primary has its own deliberate, age-appropriate subject
  // set — it does NOT inherit the secondary `availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian']`
  // subjects (no Economics, separate sciences, etc. at primary).
  { id: 'primary_mathematics', name: 'Primary Mathematics', category: 'Mathematics', availableIn: ['CambridgePrimary'] },
  { id: 'primary_english',     name: 'Primary English',     category: 'English',     availableIn: ['CambridgePrimary'] },
  { id: 'primary_science',     name: 'Primary Science',     category: 'Sciences',    availableIn: ['CambridgePrimary'] },
  { id: 'primary_ict',         name: 'Primary Computing',   category: 'Technology',  availableIn: ['CambridgePrimary'] },
  { id: 'primary_global',      name: 'Primary Global Perspectives', category: 'Humanities', availableIn: ['CambridgePrimary'] },

  // ── CORE: MATHEMATICS ─────────────────────────────────
  { id: 'mathematics',         name: 'Mathematics',                category: 'Mathematics', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'additional_math',     name: 'Additional Mathematics',     category: 'Mathematics', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE'] },
  { id: 'further_math',        name: 'Further Mathematics',        category: 'Mathematics', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC'] },
  { id: 'ap_calculus',         name: 'AP Calculus',                category: 'Mathematics', availableIn: ['American'] },
  { id: 'ap_statistics',       name: 'AP Statistics',              category: 'Mathematics', availableIn: ['American'] },
  { id: 'ib_math_aa',          name: 'IB Mathematics: Analysis & Approaches', category: 'Mathematics', availableIn: ['IBDP'] },
  { id: 'ib_math_ai',          name: 'IB Mathematics: Applications & Interpretation', category: 'Mathematics', availableIn: ['IBDP'] },

  // ── CORE: ENGLISH ─────────────────────────────────────
  { id: 'english_language',    name: 'English Language',           category: 'English', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'english_literature',  name: 'English Literature',         category: 'English', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'esl',                 name: 'English as a Second Language (ESL)', category: 'English', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IBDP'] },
  { id: 'world_literature',    name: 'World Literature',           category: 'English', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE'] },
  { id: 'ap_english_lang',     name: 'AP English Language & Composition', category: 'English', availableIn: ['American'] },
  { id: 'ap_english_lit',      name: 'AP English Literature & Composition', category: 'English', availableIn: ['American'] },

  // ── CORE: SCIENCES ────────────────────────────────────
  { id: 'physics',             name: 'Physics',                    category: 'Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'chemistry',           name: 'Chemistry',                  category: 'Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'biology',             name: 'Biology',                    category: 'Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'combined_science',    name: 'Combined Science',           category: 'Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC'] },
  { id: 'general_science',     name: 'General Science',            category: 'Sciences', availableIn: ['American', 'Canadian'] },
  { id: 'environmental_sci',   name: 'Environmental Science',      category: 'Sciences', availableIn: ['IBDP', 'American', 'Canadian'] },
  { id: 'earth_science',       name: 'Earth & Space Science',      category: 'Sciences', availableIn: ['American', 'Canadian'] },
  { id: 'ap_physics',          name: 'AP Physics',                 category: 'Sciences', availableIn: ['American'] },
  { id: 'ap_chemistry',        name: 'AP Chemistry',               category: 'Sciences', availableIn: ['American'] },
  { id: 'ap_biology',          name: 'AP Biology',                 category: 'Sciences', availableIn: ['American'] },

  // ── HUMANITIES ────────────────────────────────────────
  { id: 'history',             name: 'History',                    category: 'Humanities', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'geography',           name: 'Geography',                  category: 'Humanities', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'religious_studies',   name: 'Religious Studies',          category: 'Humanities', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'global_perspectives', name: 'Global Perspectives',        category: 'Humanities', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IBDP'] },
  { id: 'world_history',       name: 'World History',              category: 'Humanities', availableIn: ['IBDP', 'American', 'Canadian'] },
  { id: 'ap_world_history',    name: 'AP World History',           category: 'Humanities', availableIn: ['American'] },
  { id: 'ap_us_history',       name: 'AP US History',              category: 'Humanities', availableIn: ['American'] },
  { id: 'civics',              name: 'Civics & Government',        category: 'Humanities', availableIn: ['American', 'Canadian'] },

  // ── BUSINESS & SOCIAL SCIENCES ────────────────────────
  { id: 'business_studies',    name: 'Business Studies',           category: 'Business & Social Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'economics',           name: 'Economics',                  category: 'Business & Social Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'accounting',          name: 'Accounting',                 category: 'Business & Social Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC', 'American', 'Canadian'] },
  { id: 'psychology',          name: 'Psychology',                 category: 'Business & Social Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'sociology',           name: 'Sociology',                  category: 'Business & Social Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'travel_tourism',      name: 'Travel & Tourism',           category: 'Business & Social Sciences', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE'] },
  { id: 'ap_economics',        name: 'AP Economics (Macro/Micro)', category: 'Business & Social Sciences', availableIn: ['American'] },
  { id: 'ap_psychology',       name: 'AP Psychology',              category: 'Business & Social Sciences', availableIn: ['American'] },

  // ── TECHNOLOGY ────────────────────────────────────────
  { id: 'computer_science',    name: 'Computer Science',           category: 'Technology', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'ict',                 name: 'Information & Communications Technology (ICT)', category: 'Technology', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC'] },
  { id: 'design_technology',   name: 'Design & Technology',        category: 'Technology', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IBDP', 'BNC'] },
  { id: 'ap_computer_science', name: 'AP Computer Science',        category: 'Technology', availableIn: ['American'] },

  // ── ARTS ──────────────────────────────────────────────
  { id: 'art_design',          name: 'Art & Design',               category: 'Arts', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'visual_arts',         name: 'Visual Arts',                category: 'Arts', availableIn: ['IBDP', 'American', 'Canadian'] },
  { id: 'music',               name: 'Music',                      category: 'Arts', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'drama',               name: 'Drama',                      category: 'Arts', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IBDP', 'BNC'] },
  { id: 'theatre_studies',     name: 'Theatre Studies',            category: 'Arts', availableIn: ['IBDP', 'BNC', 'American'] },
  { id: 'film_studies',        name: 'Film Studies',               category: 'Arts', availableIn: ['CambridgeIGCSE', 'EdexcelIGCSE', 'AQAGCSE', 'IBDP', 'BNC', 'American'] },
  { id: 'media_studies',       name: 'Media Studies',              category: 'Arts', availableIn: ['CambridgeIGCSE', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC'] },

  // ── PHYSICAL EDUCATION ────────────────────────────────
  { id: 'physical_education',  name: 'Physical Education',         category: 'Physical Education', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'sports_science',      name: 'Sports Science',             category: 'Physical Education', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'BNC'] },
  { id: 'health_education',    name: 'Health Education',           category: 'Physical Education', availableIn: ['American', 'Canadian'] },

  // ── MODERN LANGUAGES ──────────────────────────────────
  { id: 'french',              name: 'French',                     category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'spanish',             name: 'Spanish',                    category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'german',              name: 'German',                     category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'italian',             name: 'Italian',                    category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'portuguese',          name: 'Portuguese',                 category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'mandarin',            name: 'Mandarin Chinese',           category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'japanese',            name: 'Japanese',                   category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'korean',              name: 'Korean',                     category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'arabic',              name: 'Arabic',                     category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'russian',             name: 'Russian',                    category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IBDP', 'American'] },
  { id: 'swahili',             name: 'Swahili (Kiswahili)',        category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'AQAALevel', 'IBDP', 'BNC', 'American', 'Canadian'] },
  { id: 'hindi',               name: 'Hindi',                      category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'AQAGCSE', 'IBDP'] },
  { id: 'urdu',                name: 'Urdu',                       category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'AQAGCSE'] },
  { id: 'turkish',             name: 'Turkish',                    category: 'Modern Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'AQAGCSE'] },
  { id: 'ap_spanish',          name: 'AP Spanish Language',        category: 'Modern Languages', availableIn: ['American'] },
  { id: 'ap_french',           name: 'AP French Language',         category: 'Modern Languages', availableIn: ['American'] },

  // ── CLASSICAL LANGUAGES ───────────────────────────────
  { id: 'latin',               name: 'Latin',                      category: 'Classical Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'EdexcelALevel', 'AQAGCSE', 'IBDP', 'BNC', 'American'] },
  { id: 'ancient_greek',       name: 'Ancient Greek',              category: 'Classical Languages', availableIn: ['CambridgeIGCSE', 'CambridgeALevel', 'EdexcelIGCSE', 'AQAGCSE', 'IBDP', 'BNC'] },


  // ── IB PYP (Primary Years, Grade 1-5) ─────────────────
  { id: 'pyp_language',        name: 'PYP Language',                category: 'English',     availableIn: ['IBPYP'] },
  { id: 'pyp_mathematics',     name: 'PYP Mathematics',             category: 'Mathematics', availableIn: ['IBPYP'] },
  { id: 'pyp_science',         name: 'PYP Science',                 category: 'Sciences',    availableIn: ['IBPYP'] },
  { id: 'pyp_social_studies',  name: 'PYP Social Studies',          category: 'Humanities',  availableIn: ['IBPYP'] },
  { id: 'pyp_arts',            name: 'PYP Arts',                    category: 'Arts',        availableIn: ['IBPYP'] },
  { id: 'pyp_pspe',            name: 'PYP Personal, Social & Physical Education', category: 'Physical Education', availableIn: ['IBPYP'] },

  // ── IB MYP (Middle Years, Grade 6-10) ─────────────────
  { id: 'myp_lang_lit',        name: 'MYP Language & Literature (English)', category: 'English',     availableIn: ['IBMYP'] },
  { id: 'myp_lang_acq',        name: 'MYP Language Acquisition',    category: 'Modern Languages', availableIn: ['IBMYP'] },
  { id: 'myp_individuals_soc', name: 'MYP Individuals & Societies', category: 'Humanities',  availableIn: ['IBMYP'] },
  { id: 'myp_sciences',        name: 'MYP Sciences',                category: 'Sciences',    availableIn: ['IBMYP'] },
  { id: 'myp_mathematics',     name: 'MYP Mathematics',             category: 'Mathematics', availableIn: ['IBMYP'] },
  { id: 'myp_design',          name: 'MYP Design',                  category: 'Technology',  availableIn: ['IBMYP'] },
  { id: 'myp_arts',            name: 'MYP Arts',                    category: 'Arts',        availableIn: ['IBMYP'] },
  { id: 'myp_pe_health',       name: 'MYP Physical & Health Education', category: 'Physical Education', availableIn: ['IBMYP'] },

  // ── IB-SPECIFIC CORE ──────────────────────────────────
  { id: 'tok',                 name: 'Theory of Knowledge (TOK)',  category: 'IB Core', availableIn: ['IBDP'] },
  { id: 'extended_essay',      name: 'Extended Essay',             category: 'IB Core', availableIn: ['IBDP'] },
  { id: 'cas',                 name: 'Creativity, Activity, Service (CAS)', category: 'IB Core', availableIn: ['IBDP'] },
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
  // Explicit-only curricula get ONLY subjects that list them by id:
  //   - CambridgePrimary: its own age-appropriate primary set
  //   - IBPYP: the six PYP transdisciplinary subject areas
  //   - IBMYP: the eight MYP subject groups (their own framework
  //     names — an MYP student takes 'MYP Sciences', not 'Physics')
  // Every subject now lists its curricula explicitly — `availableIn: 'all'`
  // has been removed, because it silently offered Physics, Economics and
  // Psychology to Primary and Lower Secondary pupils. EXPLICIT_ONLY is
  // kept as a guard in case an 'all' entry is ever reintroduced.
  const EXPLICIT_ONLY = ['CambridgePrimary', 'EdexcelPrimary', 'CambridgeLowerSec',
                         'EdexcelLowerSec', 'KenyaCBE', 'KCSE', 'IBPYP']
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
  // Explicit-only curricula match only subjects that list them by id
  // ('all' means all secondary curricula — see getSubjectsForCurriculum).
  if (['CambridgePrimary', 'EdexcelPrimary', 'CambridgeLowerSec',
       'EdexcelLowerSec', 'KenyaCBE', 'KCSE', 'IBPYP'].includes(curriculumId)) {
    return Array.isArray(subject.availableIn) && subject.availableIn.includes(curriculumId)
  }
  return subject.availableIn === 'all' || subject.availableIn.includes(curriculumId)
}

// ⚠ SINGLE SOURCE OF TRUTH
// This list was duplicated in routes/curriculum.js, and the two copies
// drifted: the route served a corrected catalogue while question
// validation still used the old one, which offered Accounting and
// Travel & Tourism to Lower Secondary and knew nothing of EdexcelPrimary.
// routes/curriculum.js now imports from here. Edit this file only.
module.exports = {
  CURRICULA,
  GRADES_BY_CURRICULUM,
  SUBJECTS,
  getSubjectsForCurriculum,
  getGradesForCurriculum,
  isSubjectValidForCurriculum,
}
