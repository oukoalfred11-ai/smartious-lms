/**
 * fatten-spines-2.js — batch two. Run in the Render Shell after deploy.
 *
 * Rebuilds three more thin Edexcel IGCSE spines to teaching depth:
 *   English as a Second Language — 4ES1 (skills based, all papers)
 *   English Literature           — 4ET1 (skills + most taught set
 *                                  texts as tagged Option topics;
 *                                  remove options you do not teach)
 *   Sociology                    — modelled on Cambridge IGCSE 0495,
 *                                  the paper IGCSE sociologists sit
 *                                  (Pearson offers no International
 *                                  GCSE Sociology)
 *
 * Also DEACTIVATES (never deletes) the empty duplicate subjects:
 *   Information & Communication Technology  (duplicate of ICT)
 *   Art and Design                          (duplicate of Art & Design)
 *   Travel and Tourism                      (duplicate of Travel & Tourism)
 * Deactivation is reversible from the admin panel; nothing is lost.
 *
 * Existing spines are backed up to SpineBackup before replacement.
 *
 * Deploy to: backend/src/scripts/fatten-spines-2.js
 * Run:       node src/scripts/fatten-spines-2.js
 */
const mongoose = require('mongoose');

const SPINES = [
  {
    curriculum: 'EdexcelIGCSE',
    subjectName: 'English as a Second Language',
    sourceSyllabus: 'Pearson Edexcel International GCSE (9-1) English as a Second Language 4ES1',
    topics: [
      { topic: 'Reading skills', lessons: [
        'Skimming for gist and scanning for detail',
        'Multiple choice reading questions',
        'Multiple matching: people and opinions',
        'Note completion and short answers',
        'Understanding writer attitude and purpose',
        'Dealing with unknown words from context',
        'Reading longer texts under time pressure',
      ]},
      { topic: 'Writing skills', lessons: [
        'Informal emails and messages',
        'Formal letters and emails',
        'Articles for magazines and websites',
        'Reviews and reports',
        'Essays: for and against, and opinion',
        'Planning, paragraphing and linking words',
        'Register: matching tone to audience',
        'Checking work: common errors and self correction',
      ]},
      { topic: 'Listening skills', lessons: [
        'Predicting before you listen',
        'Listening for gist and specific information',
        'Multiple choice listening questions',
        'Note and sentence completion tasks',
        'Understanding opinion and attitude in speech',
        'Coping with different accents and speeds',
      ]},
      { topic: 'Speaking skills', lessons: [
        'Talking about yourself with confidence',
        'The picture description task',
        'Giving and justifying opinions',
        'Discussion strategies: turn taking and asking back',
        'Fillers, hesitation and sounding natural',
        'Pronunciation focus: stress and intonation',
      ]},
      { topic: 'Grammar for accuracy', lessons: [
        'Present tenses: simple, continuous and perfect',
        'Past tenses and used to',
        'Future forms',
        'Conditionals and wishes',
        'Passive voice',
        'Reported speech',
        'Modal verbs for advice, obligation and possibility',
        'Articles, prepositions and countability',
        'Relative clauses and connectors',
      ]},
      { topic: 'Vocabulary by theme', lessons: [
        'Education and school life',
        'Travel, transport and holidays',
        'Health, sport and lifestyle',
        'Technology and media',
        'Environment and the natural world',
        'Work, money and future plans',
        'Family, friends and celebrations',
      ]},
      { topic: 'Exam technique', lessons: [
        'Paper 1 walkthrough: reading and writing timing',
        'Paper 2 walkthrough: listening strategy',
        'Understanding the mark schemes',
        'Common errors from examiner reports',
      ]},
    ],
  },
  {
    curriculum: 'EdexcelIGCSE',
    subjectName: 'English Literature',
    sourceSyllabus: 'Pearson Edexcel International GCSE (9-1) English Literature 4ET1 — skills plus most taught set texts; remove Option topics not taught',
    topics: [
      { topic: 'Core analysis skills', lessons: [
        'Reading for meaning: surface and deeper layers',
        'Analysing language: imagery, sound and word choice',
        'Analysing form and structure',
        'Writing about writers methods with evidence',
        'Context: using it without bolting it on',
        'Building an argument: thesis led essays',
        'Embedding quotations and analysing them closely',
      ]},
      { topic: 'Unseen poetry', lessons: [
        'First readings: annotating an unseen poem',
        'Voice, speaker and situation',
        'Imagery and figurative language in unseens',
        'Form, rhythm and rhyme choices',
        'Structuring the unseen poetry response',
        'Practice unseens across styles and eras',
      ]},
      { topic: 'Anthology poetry', lessons: [
        'Approaching the anthology: themes and connections',
        'Poems of relationships and family',
        'Poems of conflict and power',
        'Poems of identity and belonging',
        'Comparing two anthology poems',
        'Revision: key quotations across the anthology',
      ]},
      { topic: 'Option: Of Mice and Men — John Steinbeck', lessons: [
        'Context: 1930s America and the Depression',
        'George and Lennie: friendship and dreams',
        'Curleys wife, Crooks and Candy: isolation',
        'The American Dream and its failure',
        'Violence, foreshadowing and the ending',
        'Steinbecks methods: setting, cycles and symbolism',
      ]},
      { topic: 'Option: To Kill a Mockingbird — Harper Lee', lessons: [
        'Context: the Deep South and segregation',
        'Scout, Jem and growing up',
        'Atticus and moral courage',
        'The trial of Tom Robinson',
        'Boo Radley, prejudice and empathy',
        'Lees methods: narrative voice and symbolism',
      ]},
      { topic: 'Option: An Inspector Calls — J B Priestley', lessons: [
        'Context: 1912 setting, 1945 audience',
        'The Inspector: role and dramatic function',
        'Responsibility across the generations',
        'Class, gender and power in the play',
        'Dramatic devices: timing, lighting and the ending',
        'Priestleys message and how it is delivered',
      ]},
      { topic: 'Option: A View from the Bridge — Arthur Miller', lessons: [
        'Context: Red Hook, immigration and the American Dream',
        'Eddie Carbone: protagonist and tragic flaw',
        'Justice, law and the community code',
        'Masculinity, honour and betrayal',
        'Alfieri and the structure of tragedy',
        'Millers methods: tension and inevitability',
      ]},
      { topic: 'Option: Macbeth — William Shakespeare', lessons: [
        'Context: kingship, the supernatural and Jacobean England',
        'Ambition and the corrupting nature of power',
        'Macbeth and Lady Macbeth: partnership and unravelling',
        'The witches, fate and free will',
        'Guilt, sleep and blood imagery',
        'Key scenes: analysis and quotation banks',
      ]},
      { topic: 'Option: Romeo and Juliet — William Shakespeare', lessons: [
        'Context: Verona, honour and patriarchy',
        'Love in its many forms',
        'Conflict, fate and the prologue',
        'Youth against age: haste and authority',
        'Language: sonnets, oxymorons and light imagery',
        'Key scenes: analysis and quotation banks',
      ]},
      { topic: 'Essay and exam technique', lessons: [
        'Understanding the question: focus words and coverage',
        'Planning in five minutes',
        'Paragraphing: point, evidence, analysis, development',
        'Reaching the top bands: conceptual responses',
        'Timing across the papers and examiner report pitfalls',
      ]},
    ],
  },
  {
    curriculum: 'EdexcelIGCSE',
    subjectName: 'Sociology',
    sourceSyllabus: 'Modelled on Cambridge IGCSE Sociology 0495 (Pearson offers no International GCSE Sociology; this is the paper IGCSE candidates sit)',
    topics: [
      { topic: 'Theory and methods', lessons: [
        'What sociology is: structure, agency and perspectives',
        'The research process: aims, hypotheses and pilot studies',
        'Sampling methods and representativeness',
        'Questionnaires and interviews',
        'Observation: participant and non participant',
        'Secondary data and official statistics',
        'Positivism against interpretivism',
        'Ethics in sociological research',
        'Evaluating research: validity, reliability and bias',
      ]},
      { topic: 'Culture, identity and socialisation', lessons: [
        'Culture, norms, values and roles',
        'Nature against nurture and feral children',
        'Primary and secondary socialisation',
        'Agencies of socialisation: family, school, peers, media, religion',
        'Identity: how class, gender, ethnicity and age shape who we are',
        'Conformity, sanctions and social control',
        'Subcultures and cultural diversity',
      ]},
      { topic: 'Social inequality', lessons: [
        'Social stratification: class systems and mobility',
        'Wealth, income and poverty',
        'Gender inequality at home and at work',
        'Ethnicity, racism and discrimination',
        'Age and inequality: youth and the elderly',
        'Explanations of inequality: functionalist, Marxist, feminist',
        'Welfare, aid and attempts to reduce inequality',
      ]},
      { topic: 'The family', lessons: [
        'Family forms across societies',
        'Functions of the family: consensus views',
        'Critical views: Marxist and feminist perspectives',
        'Marriage, divorce and changing relationships',
        'Changing roles within the family',
        'Children, childhood and the elderly in families',
        'The dark side of family life',
      ]},
      { topic: 'Education', lessons: [
        'Functions of education: consensus and conflict views',
        'Formal and hidden curriculum',
        'Class differences in achievement',
        'Gender differences in achievement',
        'Ethnicity and educational achievement',
        'Processes in schools: labelling, streaming and subcultures',
        'Educational systems compared globally',
      ]},
      { topic: 'Crime, deviance and social control', lessons: [
        'Crime against deviance: definitions and relativity',
        'Formal and informal social control',
        'Measuring crime: statistics, surveys and their problems',
        'Explanations of crime: subcultures, labelling and strain',
        'Class, gender, ethnicity and age patterns in crime',
        'Policing, punishment and prisons',
        'Youth crime and responses to it',
      ]},
      { topic: 'The media', lessons: [
        'Traditional and new media: ownership and control',
        'Media representations: gender, ethnicity, class and age',
        'How audiences use and are affected by media',
        'The media and crime: moral panics and folk devils',
        'Social media, identity and everyday life',
        'Bias, censorship and the power of the press',
      ]},
      { topic: 'Exam technique', lessons: [
        'Command words: describe, explain, discuss, evaluate',
        'Using studies and examples as evidence',
        'Structuring the extended evaluation answers',
        'Balancing arguments and reaching judgements',
        'Timing and examiner report pitfalls',
      ]},
    ],
  },
];

// Empty duplicate subjects to deactivate (kept twin listed for clarity)
const DEACTIVATE = [
  { curriculum: 'EdexcelIGCSE', subjectName: 'Information & Communication Technology', keep: 'ICT' },
  { curriculum: 'EdexcelIGCSE', subjectName: 'Art and Design', keep: 'Art & Design' },
  { curriculum: 'EdexcelIGCSE', subjectName: 'Travel and Tourism', keep: 'Travel & Tourism' },
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
        reason: 'replaced by fatten-spines-2 script',
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

  // ── Deactivate empty duplicates (reversible; only if truly empty) ──
  for (const d of DEACTIVATE) {
    const subj = await Subject.findOne({ curriculum: d.curriculum, subjectName: d.subjectName });
    if (!subj) { console.log('[dedupe] not found, skipping:', d.subjectName); continue; }
    const topicCount = await SyllabusTopic.countDocuments({ subjectId: subj._id });
    if (topicCount > 0) {
      console.log('[dedupe] SKIPPED', d.subjectName, '- it has', topicCount, 'topics, so it is not the empty twin');
      continue;
    }
    await Subject.updateOne({ _id: subj._id }, { $set: { isActive: false } });
    console.log('[dedupe] deactivated empty duplicate:', d.subjectName, '(kept:', d.keep + ')');
  }

  console.log('Done.');
  process.exit(0);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
