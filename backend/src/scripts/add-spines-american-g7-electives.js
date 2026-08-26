/**
 * add-spines-american-g7-electives.js — Grade 7 American electives.
 *
 * Adds the two subjects that complete a standard American middle
 * school programme alongside the four cores:
 *   Health and Physical Education (SHAPE America aligned)
 *   Computer Science (CSTA middle school standards aligned)
 *
 * Same behaviour as the core script: finds or creates the subjects,
 * backs up any existing spine to SpineBackup, idempotent.
 *
 * Deploy to: backend/src/scripts/add-spines-american-g7-electives.js
 * Run:       node src/scripts/add-spines-american-g7-electives.js
 */
const mongoose = require('mongoose');

const GRADE = 'Grade 7';
const CURRICULUM = 'American';

const SPINES = [
  {
    subjectName: 'Health and Physical Education',
    category: 'Physical Education',
    sourceSyllabus: 'SHAPE America national standards, middle school',
    topics: [
      { topic: 'Fitness foundations', lessons: [
        'The five components of fitness',
        'Warming up and cooling down properly',
        'Finding and using your target heart rate',
        'The FITT principle: frequency, intensity, time, type',
        'Setting and tracking personal fitness goals',
        'Muscular strength versus muscular endurance',
        'Flexibility and safe stretching',
      ]},
      { topic: 'Movement and sport skills', lessons: [
        'Invasion games: passing, moving and creating space',
        'Net and wall games: serving, rallying and positioning',
        'Striking and fielding games: batting, bowling and backing up',
        'Athletics: running form, pacing and relay exchanges',
        'Jumping and throwing events with safe technique',
        'Cooperative games and problem solving through movement',
        'Officiating basics: rules, fairness and respect for decisions',
      ]},
      { topic: 'Personal health and hygiene', lessons: [
        'Why sleep matters and building a sleep routine',
        'Personal hygiene through adolescence',
        'Posture, screens and healthy device habits',
        'Sun safety and staying safe in heat',
        'Oral health and everyday self care',
        'Preventing the spread of common illnesses',
      ]},
      { topic: 'Nutrition basics', lessons: [
        'Food groups and what each does for the body',
        'Building a balanced plate',
        'Hydration and drinks: what to choose and why',
        'Reading a food label',
        'Energy balance: food as fuel for activity',
        'Eating well on a budget and with local foods',
      ]},
      { topic: 'Growth, development and safety', lessons: [
        'Adolescence: the changes every body goes through',
        'First aid basics: cuts, sprains and when to call for help',
        'Water safety and road safety',
        'Preventing sports injuries: equipment, rules and technique',
        'Recognizing and responding to emergencies',
        'Safe use of medicines and avoiding harmful substances',
      ]},
      { topic: 'Social and emotional wellness', lessons: [
        'Managing stress in healthy ways',
        'Peer pressure and practising refusal skills',
        'Respectful communication and resolving conflict',
        'Being a good teammate: encouragement and sportsmanship',
        'Digital wellbeing and balancing online time',
        'Healthy friendships: respect, trust and boundaries',
      ]},
    ],
  },
  {
    subjectName: 'Computer Science',
    category: 'Technology',
    sourceSyllabus: 'CSTA K-12 Computer Science Standards, middle school (6-8)',
    topics: [
      { topic: 'Computing systems', lessons: [
        'Hardware and software: what each part does',
        'Input, processing, output and storage',
        'Operating systems and managing files and folders',
        'Troubleshooting: a step by step approach to fixing problems',
        'Choosing the right device and software for a task',
        'How computers represent information with binary',
      ]},
      { topic: 'Networks and the internet', lessons: [
        'How the internet moves information',
        'Websites, addresses and how a page reaches your screen',
        'The cloud: storing and sharing beyond one device',
        'Strong passwords and protecting accounts',
        'Spotting phishing and online scams',
        'Being safe and kind online: your digital footprint',
      ]},
      { topic: 'Data and analysis', lessons: [
        'Collecting data with purpose',
        'Spreadsheets: entering, sorting and filtering data',
        'Formulas and functions in a spreadsheet',
        'Turning data into charts that tell the truth',
        'Finding patterns and drawing conclusions from data',
        'Data privacy: what apps collect and why it matters',
      ]},
      { topic: 'Algorithms and programming fundamentals', lessons: [
        'What an algorithm is: precise steps for a task',
        'Sequences and events in a program',
        'Variables: naming and storing information',
        'Making decisions with conditionals',
        'Repeating work with loops',
        'Breaking programs into functions',
        'Debugging: finding and fixing errors systematically',
      ]},
      { topic: 'Building projects', lessons: [
        'From idea to plan: designing before coding',
        'Building an interactive story or animation',
        'Creating a simple game with score and rules',
        'Testing with users and improving from feedback',
        'Documenting and presenting your project',
        'Working in a team on shared code',
      ]},
      { topic: 'Impacts of computing', lessons: [
        'Computing careers and the people behind technology',
        'Artificial intelligence in everyday life',
        'Giving credit: using and licensing others\u2019 work honestly',
        'Accessibility: designing technology everyone can use',
        'Technology and society: benefits, risks and fairness',
        'Becoming a responsible digital citizen',
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
        reason: 'replaced by add-spines-american-g7-electives script',
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
