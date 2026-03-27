/**
 * /api/adaptive
 * Generates personalised practice questions and flashcards
 * based on each student's current mastery gaps.
 * No two students get the same questions in the same order.
 */
const router = require('express').Router();
const { Mastery, LearningPath } = require('../models/Models');
const { auth } = require('../middleware/auth');

// ── Built-in question bank (expandable per topic) ──────────
const QUESTION_BANK = {
  'Pythagoras & Geometry': {
    easy: [
      { q: 'In a right-angled triangle with legs 3 cm and 4 cm, the hypotenuse is:', opts: ['5 cm','6 cm','7 cm','8 cm'], ans: '5 cm', exp: 'c² = 3² + 4² = 9 + 16 = 25, so c = 5 cm.' },
      { q: 'Which set forms a Pythagorean triple?', opts: ['2, 3, 4','3, 4, 5','4, 5, 6','5, 6, 7'], ans: '3, 4, 5', exp: '3² + 4² = 9 + 16 = 25 = 5²' },
    ],
    medium: [
      { q: 'A ladder 10 m long leans against a wall. Its foot is 6 m from the wall. How high does it reach?', opts: ['8 m','7 m','9 m','6.5 m'], ans: '8 m', exp: 'h² = 10² − 6² = 100 − 36 = 64, h = 8 m' },
      { q: 'If c = 13 and a = 5, find b:', opts: ['12','10','8','11'], ans: '12', exp: 'b² = 13² − 5² = 169 − 25 = 144, b = 12' },
    ],
    hard: [
      { q: 'A square has diagonal 10 cm. What is the side length to 1 d.p.?', opts: ['7.1 cm','6.8 cm','7.5 cm','8.0 cm'], ans: '7.1 cm', exp: 'side = 10 / √2 ≈ 7.07 ≈ 7.1 cm' },
      { q: 'Two roads meet at right angles. A shortcut diagonally across a 300 m × 400 m field saves how much distance?', opts: ['200 m','250 m','300 m','500 m'], ans: '200 m', exp: 'Diagonal = √(300²+400²) = 500. Savings = (300+400) − 500 = 200 m' },
    ],
  },
  'Algebra': {
    easy: [
      { q: 'Solve: 2x + 5 = 13', opts: ['x = 4','x = 3','x = 9','x = 6'], ans: 'x = 4', exp: '2x = 13 − 5 = 8, x = 4' },
      { q: 'Expand: 3(x + 4)', opts: ['3x + 12','3x + 4','x + 12','3x + 7'], ans: '3x + 12', exp: 'Distribute 3 to each term: 3·x + 3·4 = 3x + 12' },
    ],
    medium: [
      { q: 'Solve: x² − 5x + 6 = 0', opts: ['x = 2 or 3','x = −2 or −3','x = 1 or 6','x = −1 or −6'], ans: 'x = 2 or 3', exp: 'Factorise: (x−2)(x−3) = 0' },
      { q: 'Simplify: 2x + 3y − x + 5y', opts: ['x + 8y','3x + 8y','x + 2y','3x + 2y'], ans: 'x + 8y', exp: '(2x−x) + (3y+5y) = x + 8y' },
    ],
    hard: [
      { q: 'Solve simultaneously: 2x + y = 7, x − y = 2', opts: ['x=3, y=1','x=2, y=3','x=4, y=−1','x=1, y=5'], ans: 'x=3, y=1', exp: 'Add equations: 3x = 9, x = 3. Then y = 7 − 2(3) = 1' },
    ],
  },
  'Stoichiometry & Equations': {
    easy: [
      { q: 'Balance: H₂ + O₂ → H₂O. The balanced equation is:', opts: ['2H₂ + O₂ → 2H₂O','H₂ + O₂ → H₂O','H₂ + 2O₂ → 2H₂O','2H₂ + 2O₂ → 2H₂O'], ans: '2H₂ + O₂ → 2H₂O', exp: '4 H atoms and 2 O atoms on each side.' },
    ],
    medium: [
      { q: 'The molar mass of H₂O is:', opts: ['18 g/mol','16 g/mol','20 g/mol','10 g/mol'], ans: '18 g/mol', exp: '2(1) + 16 = 18 g/mol' },
      { q: 'How many moles in 44 g of CO₂? (Mr = 44)', opts: ['1 mol','2 mol','0.5 mol','4 mol'], ans: '1 mol', exp: 'moles = mass ÷ Mr = 44 ÷ 44 = 1' },
    ],
    hard: [
      { q: '2.4 g of Mg reacts with O₂ to form MgO (Ar Mg=24, O=16). Mass of MgO produced:', opts: ['4.0 g','3.2 g','2.4 g','6.4 g'], ans: '4.0 g', exp: '2Mg + O₂ → 2MgO. 2.4g / 24 = 0.1 mol Mg → 0.1 mol MgO = 0.1 × 40 = 4.0 g' },
    ],
  },
  'Cell Structure': {
    easy: [
      { q: 'Which organelle is the powerhouse of the cell?', opts: ['Mitochondria','Nucleus','Ribosome','Vacuole'], ans: 'Mitochondria', exp: 'Mitochondria carry out aerobic respiration, producing ATP.' },
      { q: 'The cell membrane is described as:', opts: ['Partially permeable','Fully permeable','Impermeable','Rigid'], ans: 'Partially permeable', exp: 'It allows small molecules (e.g. water) through but blocks large ones.' },
    ],
    medium: [
      { q: 'Which structure is present in plant cells but NOT animal cells?', opts: ['Cell wall','Nucleus','Mitochondria','Ribosomes'], ans: 'Cell wall', exp: 'Plant cells have a cellulose cell wall; animal cells do not.' },
    ],
    hard: [
      { q: 'A student observes a cell with a large vacuole, chloroplasts, and cell wall. It is most likely a:', opts: ['Palisade mesophyll cell','Sperm cell','Red blood cell','Neuron'], ans: 'Palisade mesophyll cell', exp: 'Palisade cells are adapted for photosynthesis with many chloroplasts and a large vacuole.' },
    ],
  },
  'Kinematics': {
    easy: [
      { q: 'An object travels 60 m in 3 s. Its average speed is:', opts: ['20 m/s','18 m/s','63 m/s','15 m/s'], ans: '20 m/s', exp: 'speed = distance ÷ time = 60 ÷ 3 = 20 m/s' },
    ],
    medium: [
      { q: 'A car accelerates from 10 m/s to 30 m/s in 5 s. Acceleration =', opts: ['4 m/s²','5 m/s²','6 m/s²','2 m/s²'], ans: '4 m/s²', exp: 'a = (v−u)/t = (30−10)/5 = 20/5 = 4 m/s²' },
      { q: 'On a distance-time graph, a horizontal line means:', opts: ['Object is stationary','Constant speed','Accelerating','Decelerating'], ans: 'Object is stationary', exp: 'No change in distance over time = stationary.' },
    ],
    hard: [
      { q: 'Using v² = u² + 2as, find v when u=0, a=5 m/s², s=20 m:', opts: ['14.1 m/s','10 m/s','20 m/s','100 m/s'], ans: '14.1 m/s', exp: 'v² = 0 + 2(5)(20) = 200, v = √200 ≈ 14.1 m/s' },
    ],
  },
  'Reading Comprehension': {
    easy: [
      { q: 'When a question asks "In your own words…", you should:', opts: ['Paraphrase the text','Copy sentences directly','Write only one word','Skip the passage'], ans: 'Paraphrase the text', exp: 'Own words means rewriting the idea — not copying from the passage.' },
    ],
    medium: [
      { q: 'The word "perspicacious" most likely means:', opts: ['Having good judgement','Being very fast','Feeling tired','Thinking slowly'], ans: 'Having good judgement', exp: 'Perspicacious = having a ready insight; of keen understanding.' },
    ],
    hard: [
      { q: 'An author uses "the city was a jungle" — this is:', opts: ['A metaphor','A simile','Personification','Alliteration'], ans: 'A metaphor', exp: 'Direct comparison (no "like" or "as") = metaphor. If it said "like a jungle" it would be a simile.' },
    ],
  },
};

// ── Flashcard bank ─────────────────────────────────────────
const FLASHCARD_BANK = {
  'Pythagoras & Geometry': [
    { q: 'State Pythagoras Theorem.', a: 'c² = a² + b², where c is the hypotenuse.' },
    { q: 'What is a Pythagorean triple?', a: 'Three integers satisfying c² = a² + b². Example: (3, 4, 5).' },
    { q: 'How do you find the hypotenuse?', a: 'c = √(a² + b²)' },
    { q: 'How do you find a shorter side?', a: 'a = √(c² − b²)' },
  ],
  'Algebra': [
    { q: 'What does "solve" mean in algebra?', a: 'Find the value(s) of the variable that make the equation true.' },
    { q: 'Quadratic formula?', a: 'x = (−b ± √(b²−4ac)) / 2a' },
    { q: 'Difference of two squares:', a: 'a² − b² = (a+b)(a−b)' },
  ],
  'Stoichiometry & Equations': [
    { q: 'Define mole.', a: '6.02 × 10²³ particles of a substance (Avogadro\'s number).' },
    { q: 'Formula for moles?', a: 'moles = mass (g) ÷ molar mass (g/mol)' },
    { q: 'How to balance an equation?', a: 'Adjust coefficients so atoms of each element are equal on both sides.' },
  ],
  'Cell Structure': [
    { q: 'Function of the nucleus?', a: 'Controls cell activities; contains DNA / genetic information.' },
    { q: 'Function of mitochondria?', a: 'Site of aerobic respiration — produces ATP energy.' },
    { q: 'What is the cell membrane made of?', a: 'A phospholipid bilayer with embedded proteins.' },
  ],
  'Kinematics': [
    { q: 'Difference between speed and velocity?', a: 'Speed is scalar (magnitude only); velocity is vector (magnitude + direction).' },
    { q: 'SUVAT equations — list them.', a: 'v=u+at, s=ut+½at², v²=u²+2as, s=½(u+v)t' },
    { q: 'What does the gradient of a v-t graph represent?', a: 'Acceleration' },
  ],
  'Reading Comprehension': [
    { q: 'What is a metaphor?', a: 'A direct comparison saying one thing IS another (without like/as).' },
    { q: 'What is a simile?', a: 'A comparison using "like" or "as".' },
    { q: 'What does "infer" mean?', a: 'To work out meaning from clues in the text, not stated directly.' },
  ],
};

// ── Difficulty selector based on mastery ──────────────────
function selectDifficulty(pct) {
  if (pct < 40) return 'easy';
  if (pct < 70) return 'medium';
  return 'hard';
}

// ── GET /api/adaptive/practice — personalised questions ───
router.get('/practice', auth, async (req, res) => {
  try {
    const { subject, topic, count = 5 } = req.query;

    const mastery = await Mastery.findOne({ studentId: req.user._id });

    // Determine target topic + difficulty
    let targetSubject = subject;
    let targetTopic   = topic;
    let currentPct    = 50; // default if no mastery data

    if (mastery) {
      if (!targetSubject || !targetTopic) {
        // Auto-select the weakest topic
        const next = computeNextTopic(mastery.subjects);
        targetSubject = targetSubject || next?.subject || 'Mathematics';
        targetTopic   = targetTopic   || next?.topic   || 'Algebra';
      }
      const subjDoc  = mastery.subjects.find(s => s.name === targetSubject);
      const topicDoc = subjDoc?.topics.find(t => t.name === targetTopic);
      currentPct = topicDoc?.pct ?? 50;
    }

    const difficulty = selectDifficulty(currentPct);
    const bank = QUESTION_BANK[targetTopic];

    let questions = [];
    if (bank) {
      // Pull questions: some from target difficulty, some from easier for confidence
      const targetQs  = bank[difficulty]         || [];
      const easierQs  = difficulty !== 'easy' ? (bank['easy'] || []) : [];
      const combined  = [...targetQs, ...easierQs];
      // Shuffle
      const shuffled  = combined.sort(() => Math.random() - 0.5);
      questions = shuffled.slice(0, Number(count)).map((q, i) => ({
        id:       i + 1,
        question: q.q,
        options:  q.opts.sort(() => Math.random() - 0.5), // randomise option order
        correct:  q.ans,
        explanation: q.exp,
        marks:    difficulty === 'hard' ? 5 : difficulty === 'medium' ? 3 : 2,
        difficulty,
      }));
    } else {
      // Fallback generic questions if topic not in bank
      questions = [
        { id: 1, question: `Define "${targetTopic}" in the context of IGCSE ${targetSubject}.`, options: [], correct: '', explanation: '', marks: 3, difficulty, type: 'short' },
        { id: 2, question: `Give one real-world application of ${targetTopic}.`, options: [], correct: '', explanation: '', marks: 3, difficulty, type: 'short' },
      ];
    }

    res.json({
      success: true,
      practice: {
        subject:    targetSubject,
        topic:      targetTopic,
        difficulty,
        currentMastery: currentPct,
        questions,
        totalMarks: questions.reduce((s, q) => s + (q.marks || 2), 0),
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /api/adaptive/flashcards — topic-matched flashcards
router.get('/flashcards', auth, async (req, res) => {
  try {
    const { topic, count = 6 } = req.query;

    const mastery = await Mastery.findOne({ studentId: req.user._id });
    let targetTopic = topic;
    if (!targetTopic && mastery) {
      const next = computeNextTopic(mastery.subjects);
      targetTopic = next?.topic || 'Algebra';
    }

    const bank  = FLASHCARD_BANK[targetTopic] || FLASHCARD_BANK['Algebra'];
    const cards = [...bank].sort(() => Math.random() - 0.5).slice(0, Number(count));

    res.json({
      success: true,
      topic: targetTopic,
      flashcards: cards,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /api/adaptive/study-plan — weekly personalised plan
router.get('/study-plan', auth, async (req, res) => {
  try {
    const mastery = await Mastery.findOne({ studentId: req.user._id });
    if (!mastery) return res.json({ success: true, plan: [] });

    // Sort all topics by mastery ascending (most urgent first)
    const allTopics = [];
    for (const subj of mastery.subjects) {
      for (const t of subj.topics) {
        allTopics.push({ subject: subj.name, color: subj.color, topic: t.name, pct: t.pct, attempts: t.attempts });
      }
    }
    allTopics.sort((a, b) => a.pct - b.pct);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const plan = days.map((day, i) => {
      const idx         = i % allTopics.length;
      const focus       = allTopics[idx];
      const isWeekend   = i >= 5;
      const sessionMins = isWeekend ? 60 : 45;
      return {
        day,
        subject:  focus.subject,
        topic:    focus.topic,
        color:    focus.color,
        mastery:  focus.pct,
        mins:     sessionMins,
        tasks: [
          `Watch lesson video on ${focus.topic} (20 min)`,
          `Complete adaptive practice set — ${selectDifficulty(focus.pct)} difficulty`,
          focus.pct < 50 ? `Review key flashcards for ${focus.topic}` : `Attempt a timed exam question`,
        ],
        priority: focus.pct < 50 ? 'high' : focus.pct < 70 ? 'medium' : 'review',
      };
    });

    res.json({ success: true, plan });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /api/adaptive/mshauri-context — feeds Mshauri AI ──
// Returns a structured context string that Mshauri uses to
// give hyper-personalised advice based on actual mastery data.
router.get('/mshauri-context', auth, async (req, res) => {
  try {
    const mastery = await Mastery.findOne({ studentId: req.user._id });
    if (!mastery) return res.json({ success: true, context: '' });

    const weak = mastery.subjects
      .flatMap(s => s.topics.map(t => ({ subject: s.name, topic: t.name, pct: t.pct })))
      .filter(t => t.pct < 60)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 3);

    const strong = mastery.subjects
      .flatMap(s => s.topics.map(t => ({ subject: s.name, topic: t.name, pct: t.pct })))
      .filter(t => t.pct >= 80)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 2);

    const context = `
STUDENT MASTERY CONTEXT (use this to personalise every response):
- Student: ${req.user.firstName} ${req.user.lastName}, ${req.user.grade || 'IGCSE Form 3'}, ${req.user.curriculum || 'IGCSE'}
- Total XP: ${mastery.xp} | Streak: ${mastery.streak} days
- Focus topic right now: ${mastery.focusTopic || 'not set'} (${mastery.focusSubject || ''})
- Weakest topics needing help: ${weak.map(t => `${t.topic} (${t.pct}%)`).join(', ') || 'none below 60%'}
- Strong topics (no need to revise heavily): ${strong.map(t => `${t.topic} (${t.pct}%)`).join(', ') || 'none above 80% yet'}
- Subject averages: ${mastery.subjects.map(s => `${s.name}: ${s.overallPct}%`).join(', ')}
INSTRUCTIONS: Reference this data in your answer. If student asks about a weak topic, be encouraging and provide step-by-step guidance. If they ask about a strong topic, affirm and extend. Always connect advice to their actual performance data.
`.trim();

    res.json({ success: true, context });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Helper (duplicated from mastery.js for self-containment)
function computeNextTopic(subjects) {
  let weakest = null, weakestScore = 101;
  for (const subj of subjects) {
    for (const topic of subj.topics) {
      if (topic.prerequisite) {
        const prereq = subj.topics.find(t => t.name === topic.prerequisite);
        if (prereq && prereq.pct < 60) continue;
      }
      if (topic.pct < weakestScore) {
        weakestScore = topic.pct;
        weakest = { subject: subj.name, color: subj.color, topic: topic.name, pct: topic.pct };
      }
    }
  }
  return weakest;
}

module.exports = router;
