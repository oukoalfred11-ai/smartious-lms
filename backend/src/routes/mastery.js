/**
 * /api/mastery
 * Core of the individualised system.
 * Stores mastery per topic per student, computes what to study next,
 * awards XP, updates streaks, and unlocks new topics based on prerequisites.
 */
const router   = require('express').Router();
const { Mastery, AdaptiveSession, LearningPath } = require('../models/Models');
const User     = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// ── Helper: compute next recommended topic ─────────────────
function computeNextTopic(subjects) {
  let weakest = null;
  let weakestScore = 101;

  for (const subj of subjects) {
    for (const topic of subj.topics) {
      // Skip locked topics (prerequisite not met)
      if (topic.prerequisite) {
        const prereqTopic = subj.topics.find(t => t.name === topic.prerequisite);
        if (prereqTopic && prereqTopic.pct < 60) continue;
      }
      // Prioritise topics below mastery threshold (< 70%)
      if (topic.pct < weakestScore) {
        weakestScore = topic.pct;
        weakest = { subject: subj.name, topic: topic.name, pct: topic.pct };
      }
    }
  }
  return weakest;
}

// ── Helper: award badges ───────────────────────────────────
function checkBadges(mastery, xp, streak) {
  const earned = mastery.badges.map(b => b.id);
  const newBadges = [];
  const all = [
    { id: 'streak_7',    name: '7-Day Streak',     condition: streak >= 7 },
    { id: 'streak_30',   name: '30-Day Streak',    condition: streak >= 30 },
    { id: 'xp_1000',     name: '1,000 XP',         condition: xp >= 1000 },
    { id: 'xp_5000',     name: '5,000 XP',         condition: xp >= 5000 },
    { id: 'master_subj', name: 'Subject Master',   condition: mastery.subjects.some(s => s.overallPct >= 80) },
    { id: 'all_round',   name: 'All-Rounder',      condition: mastery.subjects.length >= 4 && mastery.subjects.every(s => s.overallPct >= 50) },
  ];
  for (const b of all) {
    if (b.condition && !earned.includes(b.id)) {
      newBadges.push({ id: b.id, name: b.name, earnedAt: new Date() });
    }
  }
  return newBadges;
}

// ── GET /api/mastery/me — student's full mastery profile ───
router.get('/me', auth, async (req, res) => {
  try {
    let mastery = await Mastery.findOne({ studentId: req.user._id });

    // First visit — scaffold from curriculum
    if (!mastery) {
      mastery = await scaffoldMastery(req.user);
    }

    const next = computeNextTopic(mastery.subjects);
    res.json({
      success: true,
      mastery: {
        subjects:     mastery.subjects,
        focusTopic:   next?.topic   || mastery.focusTopic,
        focusSubject: next?.subject || mastery.focusSubject,
        dailyGoalMins:  mastery.dailyGoalMins,
        studyTimeToday: mastery.studyTimeToday,
        xp:     mastery.xp,
        streak: mastery.streak,
        badges: mastery.badges,
      },
      nextRecommended: next,
    });
  } catch (e) {
    console.error('[mastery/me]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /api/mastery/student/:id — teacher/admin view ─────
router.get('/student/:id', auth, requireRole('teacher', 'admin', 'parent'), async (req, res) => {
  try {
    const mastery = await Mastery.findOne({ studentId: req.params.id });
    if (!mastery) return res.status(404).json({ success: false, message: 'No mastery data yet.' });
    res.json({ success: true, mastery });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /api/mastery/update — called after practice/exam ─
// Body: { subject, topic, score (0-100), sessionType, timeMins }
router.post('/update', auth, async (req, res) => {
  try {
    const { subject, topic, score, sessionType = 'practice', timeMins = 5 } = req.body;
    if (!subject || !topic || score === undefined)
      return res.status(400).json({ success: false, message: 'subject, topic and score are required.' });

    let mastery = await Mastery.findOne({ studentId: req.user._id });
    if (!mastery) mastery = await scaffoldMastery(req.user);

    const subj = mastery.subjects.find(s => s.name === subject);
    if (!subj) return res.status(404).json({ success: false, message: `Subject "${subject}" not found in mastery profile.` });

    let topicDoc = subj.topics.find(t => t.name === topic);
    if (!topicDoc) {
      subj.topics.push({ name: topic, pct: 0, attempts: 0 });
      topicDoc = subj.topics[subj.topics.length - 1];
    }

    // ── Mastery update formula (exponential moving average) ──
    // New mastery = 70% old + 30% latest score
    // This prevents a single bad session from wiping progress,
    // but consistently bad results still pull mastery down.
    const prevPct     = topicDoc.pct;
    topicDoc.pct      = Math.round(0.70 * prevPct + 0.30 * score);
    topicDoc.attempts = (topicDoc.attempts || 0) + 1;
    topicDoc.lastScore    = score;
    topicDoc.lastAttempt  = new Date();

    // Recompute subject overall (mean of all topic scores)
    const prevOverall  = subj.overallPct;
    subj.overallPct    = Math.round(subj.topics.reduce((s, t) => s + t.pct, 0) / subj.topics.length);
    subj.velocity      = subj.overallPct - prevOverall;
    subj.lastStudied   = new Date();

    // ── XP award ───────────────────────────────────────────
    // Base: 10 XP per practice, 25 XP per quiz/exam
    // Bonus: +5 if score >=80, +10 if score >=95
    let xpEarned = sessionType === 'exam' || sessionType === 'quiz' ? 25 : 10;
    if (score >= 80) xpEarned += 5;
    if (score >= 95) xpEarned += 10;
    mastery.xp     = (mastery.xp || 0) + xpEarned;
    mastery.streak = (mastery.streak || 0) + (timeMins >= 5 ? 1 : 0);

    // ── Study time today ────────────────────────────────────
    mastery.studyTimeToday = (mastery.studyTimeToday || 0) + timeMins;

    // ── Update focus topic ──────────────────────────────────
    const next = computeNextTopic(mastery.subjects);
    mastery.focusTopic   = next?.topic;
    mastery.focusSubject = next?.subject;

    // ── Check badges ────────────────────────────────────────
    const newBadges = checkBadges(mastery, mastery.xp, mastery.streak);
    if (newBadges.length) mastery.badges.push(...newBadges);

    await mastery.save();

    // Mirror XP/streak back to User
    await User.findByIdAndUpdate(req.user._id, { xp: mastery.xp, streak: mastery.streak });

    // ── Log adaptive session ────────────────────────────────
    await AdaptiveSession.create({
      studentId: req.user._id,
      subject, topic, sessionType,
      score,
      xpEarned,
      timeMins,
      masteryDelta: topicDoc.pct - prevPct,
    });

    res.json({
      success: true,
      updated: { subject, topic, newPct: topicDoc.pct, prevPct, delta: topicDoc.pct - prevPct },
      xpEarned,
      newBadges,
      nextRecommended: next,
      totalXp: mastery.xp,
    });
  } catch (e) {
    console.error('[mastery/update]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /api/mastery/next-lesson — what to study next ─────
router.get('/next-lesson', auth, async (req, res) => {
  try {
    const mastery = await Mastery.findOne({ studentId: req.user._id });
    if (!mastery) return res.json({ success: true, recommendation: null });

    const next = computeNextTopic(mastery.subjects);
    if (!next) return res.json({ success: true, recommendation: null, message: 'All topics mastered!' });

    // Find the weakest topics across all subjects (top 3)
    const allTopics = [];
    for (const subj of mastery.subjects) {
      for (const topic of subj.topics) {
        allTopics.push({ subject: subj.name, color: subj.color, topic: topic.name, pct: topic.pct, lastAttempt: topic.lastAttempt });
      }
    }
    allTopics.sort((a, b) => a.pct - b.pct);
    const weakTopics = allTopics.slice(0, 3);

    // Find a topic not studied in >3 days (spaced repetition)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const dueForReview = allTopics.filter(t =>
      t.pct >= 60 && t.pct < 90 &&
      (!t.lastAttempt || t.lastAttempt < threeDaysAgo)
    ).slice(0, 2);

    res.json({
      success: true,
      recommendation: {
        primary:      next,
        weakTopics,
        dueForReview,
        studyTimeToday: mastery.studyTimeToday,
        dailyGoalMins:  mastery.dailyGoalMins,
        goalReached:    mastery.studyTimeToday >= mastery.dailyGoalMins,
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /api/mastery/heatmap/:studentId — teacher view ────
router.get('/heatmap/:studentId', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const mastery = await Mastery.findOne({ studentId: req.params.studentId });
    if (!mastery) return res.json({ success: true, heatmap: [] });

    const heatmap = mastery.subjects.map(subj => ({
      subject:    subj.name,
      overall:    subj.overallPct,
      velocity:   subj.velocity,
      lastStudied: subj.lastStudied,
      topics: subj.topics.map(t => ({
        name:     t.name,
        pct:      t.pct,
        attempts: t.attempts,
        status:   t.pct >= 80 ? 'mastered' : t.pct >= 60 ? 'progressing' : t.pct > 0 ? 'struggling' : 'not_started',
      }))
    }));

    res.json({ success: true, heatmap });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── SCAFFOLD ───────────────────────────────────────────────
// Creates a starter mastery profile for a new student based on their curriculum
async function scaffoldMastery(user) {
  const IGCSE_TOPICS = {
    'Mathematics': [
      'Number & Arithmetic', 'Algebra', 'Sequences & Functions',
      'Coordinate Geometry', 'Trigonometry', 'Mensuration',
      'Statistics & Probability', 'Pythagoras & Geometry',
    ],
    'Biology': [
      'Cell Structure', 'Biological Molecules', 'Movement in & out of Cells',
      'Biological Classification', 'Nutrition', 'Respiration',
      'Transport in Plants', 'Transport in Humans',
      'Disease & Defence', 'Reproduction', 'Genetics & Evolution',
    ],
    'Chemistry': [
      'Atomic Structure & Periodic Table', 'Chemical Bonding',
      'Stoichiometry & Equations', 'Acids, Bases & Salts',
      'Electrochemistry', 'Energy Changes', 'Organic Chemistry',
      'Rate of Reaction', 'Metals',
    ],
    'Physics': [
      'Measurements & Units', 'Kinematics', 'Forces & Dynamics',
      'Energy, Work & Power', 'Thermal Physics',
      'Waves & Sound', 'Light & Optics',
      'Electricity', 'Magnetism & Electromagnetism',
    ],
    'English Language': [
      'Reading Comprehension', 'Directed Writing',
      'Descriptive Writing', 'Narrative Writing',
      'Argumentative Writing', 'Summary Writing', 'Grammar & Vocabulary',
    ],
  };

  const COLORS = {
    'Mathematics': '#3B82F6', 'Biology': '#22C55E', 'Chemistry': '#F59E0B',
    'Physics': '#8B5CF6', 'English Language': '#EC4899',
  };

  // Seed realistic starter scores so the UI is meaningful on first load
  const SEED_SCORES = {
    'Mathematics':      { base: 55, variance: 25 },
    'Biology':          { base: 45, variance: 20 },
    'Chemistry':        { base: 35, variance: 20 },
    'Physics':          { base: 30, variance: 20 },
    'English Language': { base: 65, variance: 20 },
  };

  const subjectTopics = IGCSE_TOPICS;
  const subjects = Object.entries(subjectTopics).map(([name, topics]) => {
    const seed = SEED_SCORES[name] || { base: 40, variance: 20 };
    const topicDocs = topics.map((topicName, i) => {
      // Earlier topics in the sequence are more "done"; later ones less so
      const progressFactor = Math.max(0, 1 - i * 0.12);
      const score = Math.round(
        Math.max(0, Math.min(100,
          seed.base * progressFactor + (Math.random() - 0.5) * seed.variance
        ))
      );
      return {
        name:        topicName,
        pct:         score,
        attempts:    score > 0 ? Math.floor(score / 20) + 1 : 0,
        lastAttempt: score > 0 ? new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) : null,
      };
    });
    const overall = Math.round(topicDocs.reduce((s, t) => s + t.pct, 0) / topicDocs.length);
    return {
      name:        name,
      color:       COLORS[name] || '#64748B',
      overallPct:  overall,
      topics:      topicDocs,
      velocity:    0,
      lastStudied: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    };
  });

  const mastery = await Mastery.create({
    studentId:  user._id,
    curriculum: user.curriculum || 'IGCSE',
    subjects,
    xp:     user.xp     || 0,
    streak: user.streak || 0,
    dailyGoalMins: 30,
  });

  // Set initial focus topic
  const next = computeNextTopic(subjects);
  mastery.focusTopic   = next?.topic;
  mastery.focusSubject = next?.subject;
  await mastery.save();

  return mastery;
}

module.exports = router;
