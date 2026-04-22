const mongoose = require('mongoose');

// ── LESSON ────────────────────────────────────────
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  curriculum: String,
  grade: String,
  description: String,
  content: String,
  objectives: [String],
  duration: { type: Number, default: 60 },
  difficulty: { type: String, enum: ['beginner','intermediate','advanced'], default: 'intermediate' },
  status: { type: String, enum: ['draft','published','archived'], default: 'draft' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  completions: { type: Number, default: 0 },
}, { timestamps: true });

// ── EXAM ─────────────────────────────────────────
const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: String,
  curriculum: String,
  grade: String,
  description: String,
  duration: { type: Number, default: 60 },
  totalMarks: { type: Number, default: 100 },
  passMark: { type: Number, default: 50 },
  status: { type: String, enum: ['draft','published','archived'], default: 'draft' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [{
    type: { type: String, enum: ['mcq','short','essay','photo'], default: 'mcq' },
    question: String,
    options: [String],
    correctAnswer: String,
    marks: { type: Number, default: 2 },
    explanation: String,
  }],
  security: {
    tabSwitchDetection: { type: Boolean, default: true },
    copyPasteDisabled: { type: Boolean, default: true },
    questionRandomisation: { type: Boolean, default: true },
    answerRandomisation: { type: Boolean, default: true },
    timeLimitEnforced: { type: Boolean, default: true },
  },
}, { timestamps: true });

// ── PROGRESS ─────────────────────────────────────
const progressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  type: { type: String, enum: ['lesson','exam'], required: true },
  status: { type: String, enum: ['in_progress','completed','graded'], default: 'in_progress' },
  score: Number,
  percentage: Number,
  grade: String,
  feedback: String,
  answers: [{
    questionId: String,
    answer: String,
    isCorrect: Boolean,
    marksAwarded: Number,
  }],
  timeSpent: Number,
  attempts: { type: Number, default: 1 },
  completedAt: Date,
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: Date,
  integrityFlags: {
    aiGenerated: Number,
    plagiarism: Number,
    copyPaste: Number,
  },
}, { timestamps: true });

// ── MESSAGE ───────────────────────────────────────
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientRole: String,
  subject: String,
  body: { type: String, required: true },
  type: { type: String, enum: ['direct','announcement','notification'], default: 'direct' },
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });

// ── CONSULTATION ──────────────────────────────────
const consultationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  grade: String,
  curriculum: String,
  mode: { type: String, enum: ['online','inperson'], default: 'online' },
  preferredDate: String,
  preferredTime: String,
  topic: String,
  status: { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  notes: String,
}, { timestamps: true });

module.exports = {
  Lesson: mongoose.model('Lesson', lessonSchema),
  Exam: mongoose.model('Exam', examSchema),
  Progress: mongoose.model('Progress', progressSchema),
  Message: mongoose.model('Message', messageSchema),
  Consultation: mongoose.model('Consultation', consultationSchema),
};


// ── MASTERY PROFILE ───────────────────────────────────────
// One document per student. Stores mastery 0-100 per topic.
// Updated every time a student completes a practice set or exam.
const masterySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  curriculum: { type: String, default: 'IGCSE' },
  subjects: [{
    name:  { type: String, required: true },
    color: { type: String, default: '#3B82F6' },
    overallPct: { type: Number, default: 0, min: 0, max: 100 },
    topics: [{
      name:        String,
      pct:         { type: Number, default: 0, min: 0, max: 100 },
      attempts:    { type: Number, default: 0 },
      lastScore:   Number,
      lastAttempt: Date,
      // prerequisite topic name (must be >=60% before this unlocks)
      prerequisite: String,
    }],
    // Velocity: positive = improving, negative = declining
    velocity:    { type: Number, default: 0 },
    lastStudied: Date,
  }],
  // What Mshauri should focus on right now
  focusTopic:   String,
  focusSubject: String,
  // Personalised daily goal (minutes)
  dailyGoalMins:  { type: Number, default: 30 },
  studyTimeToday: { type: Number, default: 0 }, // minutes today
  // XP and streak (mirrored from User for fast reads)
  xp:     { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  // Badges earned
  badges: [{ id: String, name: String, earnedAt: Date }],
}, { timestamps: true });

// ── LEARNING PATH ─────────────────────────────────────────
// Defines the canonical topic order per curriculum+subject.
// Teachers can reorder; students follow their own progress through it.
const learningPathSchema = new mongoose.Schema({
  curriculum: { type: String, required: true },
  subject:    { type: String, required: true },
  grade:      String,
  topics: [{
    order:        Number,
    name:         String,
    description:  String,
    prerequisite: String,   // must score >=60 on this topic first
    difficulty:   { type: String, enum: ['foundation','core','extended'], default: 'core' },
    estimatedMins: { type: Number, default: 45 },
    // Adaptive practice questions for this topic (MCQ bank)
    practiceBank: [{
      question:      String,
      options:       [String],
      correctAnswer: String,
      explanation:   String,
      difficulty:    { type: String, enum: ['easy','medium','hard'], default: 'medium' },
      marks:         { type: Number, default: 2 },
    }],
  }],
}, { timestamps: true });

// ── ADAPTIVE SESSION ──────────────────────────────────────
// Records each practice / quiz session for analytics.
const adaptiveSessionSchema = new mongoose.Schema({
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:    String,
  topic:      String,
  sessionType: { type: String, enum: ['practice','flashcard','quiz','exam'], default: 'practice' },
  questionsAttempted: Number,
  correctAnswers:     Number,
  score:      Number,   // percentage 0-100
  xpEarned:   Number,
  timeMins:   Number,
  // Mastery delta: how much did mastery change this session?
  masteryDelta: Number,
  // Questions that were wrong (for spaced repetition)
  wrongTopics: [String],
}, { timestamps: true });

module.exports = {
  Lesson:          mongoose.model('Lesson',          lessonSchema),
  Exam:            mongoose.model('Exam',            examSchema),
  Progress:        mongoose.model('Progress',        progressSchema),
  Message:         mongoose.model('Message',         messageSchema),
  Consultation:    mongoose.model('Consultation',    consultationSchema),
  Mastery:         mongoose.model('Mastery',         masterySchema),
  LearningPath:    mongoose.model('LearningPath',    learningPathSchema),
  AdaptiveSession: mongoose.model('AdaptiveSession', adaptiveSessionSchema),
};
