/**
 * add-spines-gc-italian.js — run in the Render Shell.
 *
 * Adds two complete syllabus spines:
 *   1. Global Citizenship — Edexcel International GCSE (9-1), 4GL1
 *   2. Italian — Cambridge IGCSE Foreign Language, 0535
 *      (Pearson offers no International GCSE Italian; students sit
 *       the Cambridge paper. Flip ITALIAN_CURRICULUM below to
 *       'EdexcelIGCSE' if you want it listed there for timetabling.)
 *
 * Creates the Subject if missing, then builds the spine. If a spine
 * already exists for the subject it is backed up to SpineBackup
 * before being replaced, matching the platform's own safety pattern.
 *
 * Deploy to: backend/src/scripts/add-spines-gc-italian.js
 * Then run in the Render Shell:
 *   node src/scripts/add-spines-gc-italian.js
 */
const mongoose = require('mongoose');

const ITALIAN_CURRICULUM = 'CambridgeIGCSE';   // or 'EdexcelIGCSE'

const SPINES = [
  {
    curriculum: 'EdexcelIGCSE',
    subjectName: 'Global Citizenship',
    category: 'Humanities',
    grade: 'Year 10',
    sourceSyllabus: 'Pearson Edexcel International GCSE (9-1) Global Citizenship 4GL1',
    topics: [
      { topic: 'Politics and governance', lessons: [
        'What is a citizen: local, national and global citizenship',
        'Government systems across the world: democracies and authoritarian states',
        'How democracy works: elections, parliaments and representation',
        'Perspectives on democracy: strengths, criticisms and alternatives',
        'Rights and freedoms: human rights and where they come from',
        'Law and justice: how rules are made and enforced',
        'Power beyond the state: the UN, AU, EU and international bodies',
        'Non state actors: NGOs, pressure groups and the media',
        'Participation: voting, campaigning and civil society',
      ]},
      { topic: 'Economic development and the environment', lessons: [
        'Measuring development: income, HDI and inequality',
        'Why some countries are richer than others',
        'Globalisation: trade, multinationals and supply chains',
        'Aid, debt and fair trade: helping or harming',
        'Sustainable development and the SDGs',
        'Climate change: causes, evidence and impacts',
        'Responses to climate change: mitigation, adaptation and agreements',
        'Resource pressure: water, energy and food security',
        'Population change and its economic effects',
      ]},
      { topic: 'Identity, culture and communities', lessons: [
        'Identity and diversity: what shapes who we are',
        'Multiculturalism and integration in modern societies',
        'Migration: causes, patterns and effects on communities',
        'Refugees and displacement: rights and responses',
        'How sport and culture shape and connect communities',
        'Prejudice, discrimination and promoting equality',
        'Religion, tradition and change in communities',
        'Youth voice: how young people shape society',
      ]},
      { topic: 'Technology and change', lessons: [
        'How technology changes communities and daily life',
        'The digital divide: access and inequality between and within countries',
        'Social media: connection, misinformation and influence',
        'Rights and freedoms online: privacy, surveillance and censorship',
        'Technology and politics: campaigns, activism and control',
        'Technology and the environment: problem and solution',
        'Automation, AI and the future of work',
      ]},
      { topic: 'The community action project', lessons: [
        'Choosing a global issue with a local face',
        'Primary and secondary research methods',
        'Planning an action: aims, stakeholders and resources',
        'Carrying out the action and gathering evidence',
        'Measuring impact: what changed and how you know',
        'Reflection and evaluation: what worked, what would improve',
        'Writing up the project for Paper 1 Section A',
      ]},
      { topic: 'Sources, arguments and exam technique', lessons: [
        'Reading sources critically: fact, opinion and bias',
        'Using the resource booklet effectively',
        'Comparing perspectives on a global issue',
        'Building a balanced argument with evidence',
        'Answering short response and data questions',
        'Structuring the 9 mark and extended questions',
        'Command words and timing across the paper',
      ]},
    ],
  },
  {
    curriculum: ITALIAN_CURRICULUM,
    subjectName: 'Italian',
    category: 'Languages',
    grade: 'Year 10',
    sourceSyllabus: 'Cambridge IGCSE Italian Foreign Language 0535 (topic areas A to E)',
    topics: [
      { topic: 'Foundations: sounds, greetings and classroom Italian', lessons: [
        'Italian pronunciation, alphabet and accents',
        'Greetings, introductions and courtesy phrases',
        'Numbers, dates, days and telling the time',
        'Classroom instructions and asking for help',
        'Essere and avere in the present tense',
        'Nouns, gender and articles',
        'Adjective agreement and word order',
        'Basic questions: chi, cosa, dove, quando, perche',
      ]},
      { topic: 'Everyday activities: home life and daily routine', lessons: [
        'My daily routine and reflexive verbs',
        'The house and rooms: describing where I live',
        'Household chores and helping at home',
        'Meals of the day and Italian food culture',
        'Present tense of regular are, ere, ire verbs',
        'Common irregular verbs: fare, andare, uscire',
        'Telling the time in context: timetables and routines',
      ]},
      { topic: 'School life and studies', lessons: [
        'School subjects and opinions with perche',
        'Describing my school day and timetable',
        'Comparing school systems: Italy and my country',
        'Teachers, rules and school facilities',
        'Modal verbs: dovere, potere, volere',
        'Adverbs of frequency and time expressions',
        'Future plans for study',
      ]},
      { topic: 'Personal and social life: family, friends and free time', lessons: [
        'Describing family members and relationships',
        'Physical descriptions and personality',
        'Hobbies, sport and music',
        'Making arrangements and invitations',
        'Piacere and expressing likes and dislikes',
        'Possessive adjectives with family',
        'Direct object pronouns in conversation',
      ]},
      { topic: 'Food, health and the body', lessons: [
        'Ordering in a cafe and restaurant',
        'Shopping for food: quantities and prices',
        'Healthy living: diet, exercise and sleep',
        'Illness, the body and visiting the doctor',
        'The partitive and expressions of quantity',
        'Imperatives for advice and instructions',
      ]},
      { topic: 'Town, region and the world around us', lessons: [
        'My town and neighbourhood: places and directions',
        'Comparing town and countryside',
        'The weather and seasons',
        'The environment: problems and green habits',
        'Prepositions of place and giving directions',
        'Comparatives and superlatives',
        'Ci and ne in everyday sentences',
      ]},
      { topic: 'Travel, holidays and transport', lessons: [
        'Holiday destinations and activities',
        'Booking accommodation and buying tickets',
        'Transport and travel problems',
        'Describing a past holiday',
        'The passato prossimo with avere',
        'The passato prossimo with essere',
        'The imperfetto: descriptions in the past',
        'Passato prossimo versus imperfetto',
      ]},
      { topic: 'The world of work and future plans', lessons: [
        'Jobs, professions and places of work',
        'Part time work and pocket money',
        'Applying for a job: CV basics and interviews',
        'Ambitions and plans: the simple future tense',
        'The conditional for polite requests and dreams',
        'Technology in work and communication',
      ]},
      { topic: 'Italy and the international world', lessons: [
        'Italian regions, cities and landmarks',
        'Festivals and traditions in Italy',
        'Italian food, fashion and culture worldwide',
        'Famous Italians past and present',
        'Italy in Europe: travel and connections',
        'Comparing cultures: Italy and East Africa',
      ]},
      { topic: 'Grammar consolidation', lessons: [
        'Present tense revision across verb families',
        'Past tenses revision and common pitfalls',
        'Future and conditional revision',
        'Pronouns: subject, object, reflexive together',
        'Negatives and question formation',
        'Connectives for extended speaking and writing',
      ]},
      { topic: 'Exam skills: the four papers', lessons: [
        'Listening: prediction, keywords and distractors',
        'Reading: skimming, scanning and inference',
        'Speaking: role play technique',
        'Speaking: topic conversation and photo card',
        'Writing: the short message and form filling',
        'Writing: the extended piece with three tenses',
        'Vocabulary learning strategies and revision plan',
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
    // Find or create the subject
    let subject = await Subject.findOne({
      curriculum: spec.curriculum,
      subjectName: new RegExp('^' + spec.subjectName + '$', 'i'),
    });
    if (!subject) {
      subject = await Subject.create({
        curriculum: spec.curriculum,
        subjectName: spec.subjectName,
        category: spec.category,
        grade: spec.grade,
        isActive: true,
      });
      console.log('[created subject]', spec.curriculum, '/', spec.subjectName);
    } else {
      console.log('[found subject]', spec.curriculum, '/', subject.subjectName);
    }

    // Back up any existing spine before replacing (platform pattern)
    const existing = await SyllabusTopic.find({ subjectId: subject._id }).lean();
    if (existing.length && SpineBackup) {
      await SpineBackup.create({
        subjectId: subject._id,
        curriculum: spec.curriculum,
        subjectName: subject.subjectName,
        topics: existing,
        reason: 'replaced by add-spines-gc-italian script',
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
        curriculum: spec.curriculum,
        subjectName: subject.subjectName,
        topic: t.topic,
        topicOrder: topicOrder++,
        subtopics,
        sourceSyllabus: spec.sourceSyllabus,
        isActive: true,
      });
    }
    console.log('  SPINE BUILT:', spec.subjectName, '-', spec.topics.length, 'topics,', lessonTotal, 'subtopics');
  }
  console.log('Done.');
  process.exit(0);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
