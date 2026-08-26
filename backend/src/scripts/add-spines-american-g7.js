/**
 * add-spines-american-g7.js — Grade 7 American Curriculum.
 *
 * Creates the four Grade 7 core subjects (if missing) and builds
 * full teaching spines on the standards American schools actually
 * follow: Common Core (ELA and Mathematics), NGSS middle school
 * (Science), and a standard World History and Geography course
 * for Social Studies.
 *
 * Existing spines are backed up to SpineBackup before replacement.
 *
 * Deploy to: backend/src/scripts/add-spines-american-g7.js
 * Run:       node src/scripts/add-spines-american-g7.js
 */
const mongoose = require('mongoose');

const GRADE = 'Grade 7';
const CURRICULUM = 'American';

const SPINES = [
  {
    subjectName: 'English Language Arts',
    category: 'Languages',
    sourceSyllabus: 'Common Core State Standards, Grade 7 ELA',
    topics: [
      { topic: 'Reading literature', lessons: [
        'Citing textual evidence to support analysis',
        'Determining theme and how it develops',
        'Summarizing a text objectively',
        'How story elements interact: setting, plot and character',
        'Point of view and how authors develop contrasting perspectives',
        'Analyzing figurative language: simile, metaphor and allusion',
        'Sound devices in poetry: rhyme, rhythm and alliteration',
        'Comparing a story to its film or stage version',
      ]},
      { topic: 'Reading informational text', lessons: [
        'Central ideas and how they are developed',
        'How authors organize text: cause and effect, compare and contrast, problem and solution',
        'Determining author purpose and point of view',
        'Tracing and evaluating an argument and its claims',
        'Distinguishing fact, opinion and reasoned judgment',
        'Comparing two authors writing about the same topic',
        'Reading charts, graphs and text features',
      ]},
      { topic: 'Writing: argument', lessons: [
        'Claims, reasons and evidence',
        'Introducing a claim and acknowledging the other side',
        'Organizing an argument logically',
        'Transitions that connect claims and evidence',
        'Formal style and a strong conclusion',
        'Revising an argument for clarity and force',
      ]},
      { topic: 'Writing: informative and narrative', lessons: [
        'Informative writing: introducing and developing a topic',
        'Using facts, definitions, details and quotations',
        'Narrative writing: establishing situation and narrator',
        'Dialogue, pacing and description in narratives',
        'Strong openings and satisfying endings',
        'The writing process: planning, drafting, revising, editing',
      ]},
      { topic: 'Language and grammar', lessons: [
        'Phrases and clauses in sentences',
        'Simple, compound and complex sentences',
        'Misplaced and dangling modifiers',
        'Commas, coordinate adjectives and punctuation review',
        'Spelling patterns and commonly confused words',
        'Precise word choice and eliminating wordiness',
        'Context clues and Greek and Latin roots',
        'Connotation and denotation',
      ]},
      { topic: 'Speaking, listening and research', lessons: [
        'Collaborative discussions: preparing and contributing',
        'Presenting claims with relevant evidence',
        'Evaluating a speaker: reasoning and evidence',
        'Research: gathering and assessing sources',
        'Quoting, paraphrasing and avoiding plagiarism',
        'Citing sources in a standard format',
      ]},
      { topic: 'Novel study', lessons: [
        'Entering the novel: context and predictions',
        'Tracking character change across chapters',
        'Theme development through key scenes',
        'Author craft: style, structure and voice',
        'Socratic discussion of the novel',
        'Culminating essay on the novel',
      ]},
    ],
  },
  {
    subjectName: 'Mathematics',
    category: 'Mathematics',
    sourceSyllabus: 'Common Core State Standards, Grade 7 Mathematics',
    topics: [
      { topic: 'Ratios and proportional relationships', lessons: [
        'Unit rates, including with fractions',
        'Recognizing proportional relationships in tables and graphs',
        'The constant of proportionality',
        'Writing equations for proportional relationships',
        'Solving multistep ratio problems',
        'Percent problems: tax, tips, discounts and markups',
        'Percent increase, decrease and simple interest',
        'Percent error',
      ]},
      { topic: 'The number system: rational numbers', lessons: [
        'Adding integers with number lines and rules',
        'Subtracting integers as adding the opposite',
        'Multiplying and dividing integers',
        'Adding and subtracting rational numbers',
        'Multiplying and dividing rational numbers',
        'Converting rational numbers to decimals',
        'Solving real world problems with the four operations',
      ]},
      { topic: 'Expressions and equations', lessons: [
        'Properties of operations to simplify expressions',
        'Combining like terms with rational coefficients',
        'Expanding and factoring linear expressions',
        'Rewriting expressions to see problems differently',
        'Solving two step equations',
        'Solving equations with variables on both sides',
        'Writing and solving inequalities',
        'Graphing inequality solutions',
        'Word problems into equations and inequalities',
      ]},
      { topic: 'Geometry', lessons: [
        'Scale drawings and scale factor',
        'Drawing geometric shapes from conditions',
        'Cross sections of three dimensional figures',
        'Circles: circumference and area',
        'Angle relationships: complementary, supplementary, vertical and adjacent',
        'Solving equations from angle relationships',
        'Area of composite figures',
        'Surface area of prisms and pyramids',
        'Volume of prisms and composite solids',
      ]},
      { topic: 'Statistics and probability', lessons: [
        'Sampling: representative samples and inference',
        'Drawing inferences from two data sets',
        'Measures of center and variability in comparison',
        'Probability of a chance event',
        'Experimental versus theoretical probability',
        'Probability models',
        'Compound events: lists, tables and tree diagrams',
        'Simulations of compound events',
      ]},
      { topic: 'Problem solving and exam readiness', lessons: [
        'Multistep problems mixing the four strands',
        'Explaining reasoning in words and working',
        'Common errors and how to check answers',
        'Timed practice and test strategy',
      ]},
    ],
  },
  {
    subjectName: 'Science',
    category: 'Sciences',
    sourceSyllabus: 'NGSS middle school, Grade 7 integrated course',
    topics: [
      { topic: 'Matter and chemical reactions', lessons: [
        'Atoms, elements and the structure of matter',
        'States of matter and particle motion',
        'Physical versus chemical changes',
        'Evidence of chemical reactions',
        'Conservation of mass in reactions',
        'Synthetic materials and their impacts',
        'Thermal energy in chemical processes',
      ]},
      { topic: 'Cells and living systems', lessons: [
        'The cell as the unit of life',
        'Comparing plant and animal cells',
        'Cell organelles and their functions',
        'From cells to tissues, organs and systems',
        'The human body: major systems working together',
        'How the body responds to stimuli',
      ]},
      { topic: 'Energy in organisms and ecosystems', lessons: [
        'Photosynthesis: how plants capture energy',
        'Cellular respiration and energy release',
        'Food chains, food webs and energy flow',
        'Cycling of matter in ecosystems',
        'Interactions in ecosystems: competition, predation, symbiosis',
        'Ecosystem changes and their effects on populations',
        'Biodiversity and ecosystem services',
      ]},
      { topic: 'Reproduction, heredity and growth', lessons: [
        'Sexual and asexual reproduction',
        'Genes, chromosomes and inherited traits',
        'Punnett squares and predicting traits',
        'Mutations and their effects',
        'Environmental and genetic influences on growth',
        'Plant reproduction and animal behaviors that aid it',
      ]},
      { topic: 'Earth processes', lessons: [
        'The rock cycle and Earth materials',
        'Plate tectonics and evidence for moving plates',
        'Earthquakes and volcanoes: patterns and hazards',
        'The water cycle driven by the sun',
        'Weather, climate and air circulation',
        'Human impact on Earth systems',
        'Natural resources and sustainable use',
      ]},
      { topic: 'Science and engineering practices', lessons: [
        'Asking questions and defining problems',
        'Planning fair investigations and controlling variables',
        'Collecting, graphing and interpreting data',
        'Constructing explanations from evidence',
        'Engineering design: criteria, constraints and testing',
        'Communicating findings like a scientist',
      ]},
    ],
  },
  {
    subjectName: 'Social Studies',
    category: 'Humanities',
    sourceSyllabus: 'Grade 7 World History and Geography (standard US middle school course)',
    topics: [
      { topic: 'Geography skills', lessons: [
        'Maps, projections and the tools of geography',
        'Latitude, longitude and locating places',
        'Physical and human characteristics of place',
        'Population patterns and movement',
        'Reading historical maps and timelines',
      ]},
      { topic: 'The Roman world and its fall', lessons: [
        'The Roman Empire at its height',
        'Roman law, engineering and daily life',
        'Why Rome declined and fell',
        'The Byzantine Empire and Constantinople',
        'Rome\u2019s legacy in the modern world',
      ]},
      { topic: 'The Islamic world and Africa', lessons: [
        'The rise and spread of Islam',
        'Achievements of the Islamic Golden Age',
        'Trade routes across the Sahara',
        'Ghana, Mali and Songhai: West African empires',
        'Mansa Musa and Timbuktu',
        'East African trading cities and the Swahili coast',
      ]},
      { topic: 'Medieval Asia', lessons: [
        'Imperial China: dynasties, inventions and the civil service',
        'The Silk Road and cultural exchange',
        'The Mongol Empire',
        'Medieval Japan: shoguns and samurai',
        'India and Southeast Asia in the medieval era',
      ]},
      { topic: 'Medieval Europe', lessons: [
        'Feudalism and manor life',
        'The medieval Church and daily life',
        'The Crusades: causes and consequences',
        'The Black Death and its aftermath',
        'The Magna Carta and the growth of rights',
      ]},
      { topic: 'The Americas before contact', lessons: [
        'The Maya: cities, calendars and mathematics',
        'The Aztec Empire',
        'The Inca and their mountain engineering',
        'North American peoples and cultures',
      ]},
      { topic: 'Renaissance, Reformation and exploration', lessons: [
        'The Renaissance: art, ideas and the printing press',
        'The Reformation and religious change',
        'The Age of Exploration: motives and voyages',
        'The Columbian Exchange and its consequences',
        'The Scientific Revolution',
      ]},
      { topic: 'Civics and skills', lessons: [
        'Comparing forms of government across history',
        'Citizenship: rights and responsibilities',
        'Analyzing primary and secondary sources',
        'Detecting bias and corroborating evidence',
        'Writing a historical argument with evidence',
      ]},
    ],
  },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const Subject = require('../models/Subject');
  const SyllabusTopic = require('../models/SyllabusTopic');
  let SpineBackup = null;
  try { SpineBackup = require('../models/SpineBackup'); } catch (e) {}

  for (const spec of SPINES) {
    let subject = await Subject.findOne({
      curriculum: CURRICULUM,
      grade: GRADE,
      subjectName: new RegExp('^' + spec.subjectName + '$', 'i'),
    });
    if (!subject) {
      // A subject may exist for the curriculum without a grade set
      subject = await Subject.findOne({
        curriculum: CURRICULUM,
        subjectName: new RegExp('^' + spec.subjectName + '$', 'i'),
        $or: [{ grade: { $exists: false } }, { grade: '' }, { grade: null }],
      });
      if (subject) { subject.grade = GRADE; await subject.save(); }
    }
    if (!subject) {
      subject = await Subject.create({
        curriculum: CURRICULUM,
        subjectName: spec.subjectName,
        category: spec.category,
        grade: GRADE,
        isActive: true,
      });
      console.log('[created subject]', CURRICULUM, '/', GRADE, '/', spec.subjectName);
    } else {
      console.log('[found subject]', CURRICULUM, '/', subject.grade || '(no grade)', '/', subject.subjectName);
    }

    const existing = await SyllabusTopic.find({ subjectId: subject._id }).lean();
    if (existing.length && SpineBackup) {
      await SpineBackup.create({
        subjectId: subject._id,
        curriculum: CURRICULUM,
        subjectName: subject.subjectName,
        topics: existing,
        reason: 'replaced by add-spines-american-g7 script',
      });
      console.log('  backed up', existing.length, 'existing topics');
    }
    await SyllabusTopic.deleteMany({ subjectId: subject._id });

    let topicOrder = 0, lessonTotal = 0;
    for (const t of spec.topics) {
      const subtopics = t.lessons.map((name, i) => ({
        name,
        code: String(lessonTotal + i + 1).padStart(3, '0'),
        subOrder: i,
        suggestedLessons: 1,
        objectives: [],
      }));
      lessonTotal += subtopics.length;
      await SyllabusTopic.create({
        subjectId: subject._id,
        curriculum: CURRICULUM,
        subjectName: subject.subjectName,
        topic: t.topic,
        topicOrder: topicOrder++,
        subtopics,
        sourceSyllabus: spec.sourceSyllabus,
        isActive: true,
      });
    }
    console.log('  SPINE BUILT:', spec.subjectName, '(' + GRADE + ') -', spec.topics.length, 'topics,', lessonTotal, 'subtopics');
  }
  console.log('Done.');
  process.exit(0);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
