/**
 * models/StudentAchievement.js
 * Tracks student XP, badges, streaks, and quiz performance.
 */
const mongoose = require('mongoose')

const badgeSchema = new mongoose.Schema({
  id:        { type: String },
  name:      { type: String },
  icon:      { type: String },
  earnedAt:  { type: Date, default: Date.now },
  reason:    { type: String, default: '' },
}, { _id: false })

const achievementSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  studentName: { type: String },

  // XP system
  totalXP:     { type: Number, default: 0 },
  level:       { type: Number, default: 1 },
  weeklyXP:    { type: Number, default: 0 },
  weeklyReset: { type: Date, default: Date.now },

  // Quiz stats
  quizzesTaken:  { type: Number, default: 0 },
  totalCorrect:  { type: Number, default: 0 },
  totalAnswered: { type: Number, default: 0 },
  bestStreak:    { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  lastQuizDate:  { type: Date, default: null },

  // Subject breakdown
  subjectStats: [{
    subject:      { type: String },
    xp:           { type: Number, default: 0 },
    correct:      { type: Number, default: 0 },
    answered:     { type: Number, default: 0 },
    lastPlayed:   { type: Date, default: Date.now },
    _id: false,
  }],

  // Badges
  badges: [badgeSchema],

  // Leaderboard
  rank: { type: Number, default: 0 },
}, { timestamps: true })

// XP thresholds per level
achievementSchema.statics.xpForLevel = (level) => level * level * 100

module.exports = mongoose.model('StudentAchievement', achievementSchema)
