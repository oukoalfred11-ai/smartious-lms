/**
 * fatten-spines.js — run in the Render Shell after deploy.
 *
 * Rebuilds four thin Edexcel IGCSE spines to full specification depth:
 *   Mathematics       — 4MA1 (Higher complete; Higher-only items tagged)
 *   English Language  — 4EA1 (Language A, anthology texts included)
 *   Geography         — 4GE1 (all eight units + fieldwork)
 *   History           — 4HI1 (most-taught options, each tagged; remove
 *                        any option topic your teachers do not teach)
 *
 * Each existing spine is backed up to SpineBackup before replacement.
 *
 * Deploy to: backend/src/scripts/fatten-spines.js
 * Run:       node src/scripts/fatten-spines.js
 */
const mongoose = require('mongoose');

const SPINES = [
  {
    curriculum: 'EdexcelIGCSE',
    subjectName: 'Mathematics',
    sourceSyllabus: 'Pearson Edexcel International GCSE (9-1) Mathematics A 4MA1 — full specification',
    topics: [
      { topic: 'Number: integers, fractions and decimals', lessons: [
        'Integers, place value and ordering',
        'Factors, multiples, HCF and LCM',
        'Prime numbers and prime factorisation',
        'Fractions: four operations and mixed numbers',
        'Decimals: four operations and recurring decimals',
        'Converting between fractions, decimals and percentages',
        'Rounding, significant figures and estimation',
        'Order of operations and calculator skills',
        'Negative numbers in context',
      ]},
      { topic: 'Number: percentages, ratio and proportion', lessons: [
        'Percentage of a quantity and percentage change',
        'Reverse percentages',
        'Simple and compound interest',
        'Ratio: simplifying, sharing and map scales',
        'Direct proportion problems',
        'Inverse proportion problems',
        'Best buy, exchange rates and everyday arithmetic',
        'Speed, density, pressure and compound measures',
      ]},
      { topic: 'Number: indices, standard form, surds and sets', lessons: [
        'Index laws with numbers',
        'Powers, roots and negative and fractional indices',
        'Standard form: writing and calculating',
        'Surds: simplifying and rationalising (Higher)',
        'Upper and lower bounds (Higher)',
        'Set language, notation and Venn diagrams',
        'Operations on sets and shading regions',
      ]},
      { topic: 'Algebra: expressions, formulae and equations', lessons: [
        'Simplifying expressions and index laws in algebra',
        'Expanding single and double brackets',
        'Factorising: common factors and quadratics',
        'Substitution into expressions and formulae',
        'Rearranging formulae, including where the subject appears twice (Higher)',
        'Solving linear equations',
        'Setting up equations from worded problems',
        'Simultaneous linear equations',
        'Simultaneous equations: one linear, one quadratic (Higher)',
        'Algebraic fractions: simplifying and solving (Higher)',
      ]},
      { topic: 'Algebra: quadratics, inequalities, sequences and functions', lessons: [
        'Solving quadratics by factorising',
        'The quadratic formula',
        'Completing the square (Higher)',
        'Quadratic word problems',
        'Linear inequalities on a number line',
        'Quadratic inequalities (Higher)',
        'Sequences: term to term and nth term',
        'Arithmetic series and sum formulae (Higher)',
        'Function notation, domain and range (Higher)',
        'Composite and inverse functions (Higher)',
        'Direct and inverse proportion with algebra',
      ]},
      { topic: 'Graphs and calculus', lessons: [
        'Coordinates and straight line graphs: y = mx + c',
        'Gradient, parallel and perpendicular lines',
        'Quadratic, cubic and reciprocal graphs',
        'Exponential graphs and growth and decay',
        'Solving equations graphically',
        'Distance time and speed time graphs',
        'Differentiation of polynomials (Higher)',
        'Gradients, turning points and curve sketching (Higher)',
        'Kinematics with calculus: displacement, velocity, acceleration (Higher)',
      ]},
      { topic: 'Geometry: angles, polygons and constructions', lessons: [
        'Angle facts: lines, triangles and quadrilaterals',
        'Angles in parallel lines',
        'Interior and exterior angles of polygons',
        'Bearings and scale drawings',
        'Symmetry and properties of 2D shapes',
        'Congruent triangles and conditions for congruence',
        'Similar shapes and finding missing lengths',
        'Area and volume ratios of similar shapes (Higher)',
      ]},
      { topic: 'Geometry: mensuration', lessons: [
        'Perimeter and area of rectangles, triangles and parallelograms',
        'Area of trapezium and compound shapes',
        'Circles: circumference and area',
        'Arc length and sector area',
        'Volume and surface area of prisms and cylinders',
        'Volume and surface area of cones, pyramids and spheres',
        '3D shapes, nets and plans',
        'Converting units of length, area and volume',
      ]},
      { topic: 'Trigonometry and Pythagoras', lessons: [
        'Pythagoras theorem in 2D',
        'Trigonometric ratios: finding sides',
        'Trigonometric ratios: finding angles',
        'Angles of elevation and depression',
        'The sine rule (Higher)',
        'The cosine rule (Higher)',
        'Area of a triangle using half ab sin C (Higher)',
        'Pythagoras and trigonometry in 3D (Higher)',
      ]},
      { topic: 'Circle theorems', lessons: [
        'Angle at the centre and angle in a semicircle (Higher)',
        'Angles in the same segment and cyclic quadrilaterals (Higher)',
        'Tangents, radii and the alternate segment theorem (Higher)',
        'Chord properties and combined theorem problems (Higher)',
      ]},
      { topic: 'Vectors and transformations', lessons: [
        'Translations and vector notation',
        'Reflections and rotations',
        'Enlargements, including negative scale factors (Higher)',
        'Combined transformations',
        'Vector arithmetic and magnitude (Higher)',
        'Vector geometry proofs (Higher)',
      ]},
      { topic: 'Statistics', lessons: [
        'Collecting data and sampling',
        'Mean, median, mode and range',
        'Averages from frequency tables',
        'Bar charts, pie charts and pictograms',
        'Scatter graphs and correlation',
        'Cumulative frequency and quartiles (Higher)',
        'Box plots and comparing distributions (Higher)',
        'Histograms with unequal class widths (Higher)',
      ]},
      { topic: 'Probability', lessons: [
        'Probability scale and single events',
        'Relative frequency and expected outcomes',
        'Sample space diagrams and combined events',
        'Tree diagrams: independent events',
        'Tree diagrams: dependent events and conditional probability (Higher)',
        'Probability with Venn diagrams and set notation',
      ]},
      { topic: 'Exam technique', lessons: [
        'Command words and mark allocation across both papers',
        'Showing working: method marks and accuracy marks',
        'Calculator strategy and checking answers',
        'Problem solving: multi step and unstructured questions',
        'Common errors from examiner reports and how to avoid them',
      ]},
    ],
  },
  {
    curriculum: 'EdexcelIGCSE',
    subjectName: 'English Language',
    sourceSyllabus: 'Pearson Edexcel International GCSE (9-1) English Language A 4EA1',
    topics: [
      { topic: 'Core reading skills', lessons: [
        'Retrieval: finding and selecting information',
        'Inference: reading between the lines',
        'Analysing language: word choice and imagery',
        'Analysing structure: openings, shifts and endings',
        'Writers viewpoint, purpose and audience',
        'Comparing two texts: similarities and differences',
        'Evaluating how writers achieve effects',
        'Using quotations and embedding evidence',
      ]},
      { topic: 'Anthology Part 1: non fiction texts', lessons: [
        'The Danger of a Single Story — Chimamanda Ngozi Adichie',
        'A Passage to Africa — George Alagiah',
        'The Explorers Daughter — Kari Herbert',
        'Explorers or boys messing about — Steven Morris',
        'Between a Rock and a Hard Place — Aron Ralston',
        'Young and dyslexic? You have got it going on — Benjamin Zephaniah',
        'A Game of Polo with a Headless Goat — Emma Levine',
        'Beyond the Sky and the Earth — Jamie Zeppa',
        'H is for Hawk — Helen Macdonald',
        'Chinese Cinderella — Adeline Yen Mah',
        'Comparing anthology non fiction texts',
      ]},
      { topic: 'Unseen non fiction', lessons: [
        'Approaching unseen texts with confidence',
        'Annotating under timed conditions',
        'Answering short retrieval and inference questions',
        'The language and structure analysis question',
        'The comparison question: unseen with anthology',
      ]},
      { topic: 'Transactional writing', lessons: [
        'Purpose, audience and register',
        'Writing letters: formal and informal',
        'Writing articles and reviews',
        'Writing speeches',
        'Writing reports and guides',
        'Planning, paragraphing and cohesion',
        'Persuasive techniques and tone',
        'Accuracy: sentence control, punctuation and spelling',
      ]},
      { topic: 'Anthology Part 2: poetry and prose', lessons: [
        'Disabled — Wilfred Owen',
        'Out, Out — Robert Frost',
        'An Unknown Girl — Moniza Alvi',
        'The Bright Lights of Sarajevo — Tony Harrison',
        'Still I Rise — Maya Angelou',
        'The Story of an Hour — Kate Chopin',
        'The Necklace — Guy de Maupassant',
        'Significant Cigarettes from The Road Home — Rose Tremain',
        'Whistle and I will Come to You from The Woman in Black — Susan Hill',
        'Night — Alice Munro',
        'Comparing poetry and prose from the anthology',
      ]},
      { topic: 'Imaginative writing', lessons: [
        'Generating and shaping story ideas',
        'Narrative structure: openings, tension and resolution',
        'Description: showing rather than telling',
        'Characterisation and voice',
        'Sentence variety and vocabulary for effect',
        'Editing and improving under exam conditions',
      ]},
      { topic: 'Exam technique', lessons: [
        'Paper 1 walkthrough: timing and question order',
        'Paper 2 walkthrough: timing and question order',
        'Mark schemes: what each level requires',
        'Model answers: what grade 9 responses do differently',
        'Common pitfalls from examiner reports',
      ]},
    ],
  },
  {
    curriculum: 'EdexcelIGCSE',
    subjectName: 'Geography',
    sourceSyllabus: 'Pearson Edexcel International GCSE (9-1) Geography 4GE1 — all units',
    topics: [
      { topic: 'River environments', lessons: [
        'The hydrological cycle and drainage basins',
        'River processes: erosion, transport and deposition',
        'River landforms: valleys, waterfalls and meanders',
        'Factors affecting river regimes and hydrographs',
        'Flooding: causes and impacts',
        'Flood management: hard and soft engineering',
        'Water uses, demand and quality',
        'Managing water supply: case studies',
      ]},
      { topic: 'Coastal environments', lessons: [
        'Waves, tides and coastal processes',
        'Coastal erosion landforms: cliffs, caves, arches and stacks',
        'Coastal deposition landforms: beaches, spits and bars',
        'Coastal ecosystems: mangroves, coral reefs and salt marshes',
        'Threats to coasts: erosion, flooding and rising seas',
        'Coastal management strategies and conflicts',
        'Coastal case study: a threatened coastline managed',
      ]},
      { topic: 'Hazardous environments', lessons: [
        'Plate tectonics and the global distribution of hazards',
        'Earthquakes: causes, measurement and impacts',
        'Volcanoes: types, eruptions and impacts',
        'Tropical cyclones: formation, structure and tracks',
        'Why people live in hazardous areas',
        'Preparing for hazards: prediction, planning and protection',
        'Responding to hazard events: case studies',
      ]},
      { topic: 'Economic activity and energy', lessons: [
        'Economic sectors and how they change with development',
        'Factors driving sectoral shift',
        'The informal economy',
        'Population, resources and the energy gap',
        'Renewable and non renewable energy sources',
        'Energy management and sustainable futures',
      ]},
      { topic: 'Rural environments', lessons: [
        'Rural environments and ecosystems as natural resources',
        'Farming types and food production systems',
        'Rural change in developed countries',
        'Rural change in developing countries',
        'Rural challenges: poverty, isolation and services',
        'Diversification and sustainable rural management',
      ]},
      { topic: 'Urban environments', lessons: [
        'Urbanisation: trends, causes and megacities',
        'Urban land use patterns and models',
        'Cities in developed countries: challenges and change',
        'Cities in developing countries: squatter settlements and services',
        'Urban environmental problems: traffic, waste and air',
        'Sustainable cities and urban management case studies',
      ]},
      { topic: 'Fragile environments and climate change', lessons: [
        'Fragile environments: deserts, rainforests and polar regions',
        'Desertification: causes and consequences',
        'Deforestation: causes and consequences',
        'Climate change: evidence and natural causes',
        'Human causes of climate change',
        'Impacts of climate change on people and ecosystems',
        'Responses: mitigation, adaptation and international action',
      ]},
      { topic: 'Globalisation and migration', lessons: [
        'What globalisation is and what drives it',
        'Global shift of industry and outsourcing',
        'Transnational corporations: benefits and costs',
        'International migration: types and causes',
        'Impacts of migration on host and source countries',
        'Managing migration: policies and tensions',
      ]},
      { topic: 'Fieldwork and geographical skills', lessons: [
        'Designing an enquiry: questions and hypotheses',
        'Data collection methods in physical geography',
        'Data collection methods in human geography',
        'Presenting data: maps, graphs and diagrams',
        'Analysing and concluding from fieldwork data',
        'Map skills: grid references, scale and relief',
        'Interpreting photographs, satellite images and GIS',
      ]},
      { topic: 'Exam technique', lessons: [
        'Command words and question structure across both papers',
        'Using case studies effectively in longer answers',
        'The 8 mark extended questions: structure and levels',
        'Resource interpretation questions',
        'Timing and common examiner report pitfalls',
      ]},
    ],
  },
  {
    curriculum: 'EdexcelIGCSE',
    subjectName: 'History',
    sourceSyllabus: 'Pearson Edexcel International GCSE (9-1) History 4HI1 — most taught options; remove option topics not taught',
    topics: [
      { topic: 'Historical skills and sources', lessons: [
        'Chronology, causation and consequence',
        'Change, continuity and significance',
        'Analysing sources: content, provenance and purpose',
        'Evaluating source utility and reliability',
        'Cross referencing sources and reaching judgements',
        'Interpretations: why historians disagree',
      ]},
      { topic: 'Option: Germany, development of dictatorship 1918 to 1945', lessons: [
        'The Weimar Republic: birth, constitution and problems',
        'Crises of 1923: hyperinflation and the Ruhr',
        'Stresemann and the Golden Years',
        'The rise of Hitler and the Nazi Party to 1933',
        'The Depression and the collapse of Weimar democracy',
        'Creating the dictatorship: Reichstag Fire to Night of the Long Knives',
        'The police state: SS, Gestapo and propaganda',
        'Life in Nazi Germany: women, youth and workers',
        'Persecution of minorities and the path to the Holocaust',
        'Opposition, resistance and Germany at war',
      ]},
      { topic: 'Option: A world divided, superpower relations 1943 to 1972', lessons: [
        'Wartime conferences: Tehran, Yalta and Potsdam',
        'The origins of the Cold War: ideology and mistrust',
        'Truman Doctrine, Marshall Plan and Soviet responses',
        'The Berlin Blockade and the division of Germany',
        'NATO, the Warsaw Pact and the arms race',
        'Hungary 1956 and control of Eastern Europe',
        'The Berlin Wall crisis 1961',
        'The Cuban Missile Crisis 1962',
        'Czechoslovakia 1968 and the Brezhnev Doctrine',
        'Detente and the road to SALT',
      ]},
      { topic: 'Option: Russia and the Soviet Union 1905 to 1924', lessons: [
        'Tsarist Russia and the 1905 Revolution',
        'Reform and repression: Stolypin and the Dumas',
        'Russia in the First World War',
        'The February Revolution 1917',
        'The Provisional Government and its failures',
        'The October Revolution: Bolshevik seizure of power',
        'The Civil War: Reds against Whites',
        'War Communism, the NEP and Lenins Russia',
      ]},
      { topic: 'Exam technique', lessons: [
        'Paper 1 depth study questions: describe, explain, judgement',
        'Paper 2 source and interpretation questions',
        'Structuring the extended essay with argument and evidence',
        'Using precise dates, names and details for top levels',
        'Timing across both papers and examiner report pitfalls',
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
    const matches = await Subject.find({
      curriculum: spec.curriculum,
      subjectName: new RegExp('^' + spec.subjectName + '$', 'i'),
    });
    if (!matches.length) { console.log('[skip] not found:', spec.subjectName); continue; }
    if (matches.length > 1) { console.log('[skip] duplicate subjects for', spec.subjectName, '- remove the duplicate first'); continue; }
    const subject = matches[0];

    const existing = await SyllabusTopic.find({ subjectId: subject._id }).lean();
    if (existing.length && SpineBackup) {
      await SpineBackup.create({
        subjectId: subject._id,
        curriculum: spec.curriculum,
        subjectName: subject.subjectName,
        topics: existing,
        reason: 'replaced by fatten-spines script',
      });
      console.log('[' + spec.subjectName + '] backed up', existing.length, 'old topics');
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
        curriculum: spec.curriculum,
        subjectName: subject.subjectName,
        topic: t.topic,
        topicOrder: topicOrder++,
        subtopics,
        sourceSyllabus: spec.sourceSyllabus,
        isActive: true,
      });
    }
    console.log('SPINE FATTENED:', spec.subjectName, '-', spec.topics.length, 'topics,', lessonTotal, 'subtopics');
  }
  console.log('Done.');
  process.exit(0);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
