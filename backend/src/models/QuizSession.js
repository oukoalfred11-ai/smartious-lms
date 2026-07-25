/**
 * models/QuizSession.js
 * Tracks a quiz game session — solo or competition.
 */
const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  answer:     { type: mongoose.Schema.Types.Mixed },
  correct:    { type: Boolean, default: false },
  timeTaken:  { type: Number, default: 0 },  // milliseconds
  points:     { type: Number, default: 0 },
}, { _id: false })

const participantSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String },
  avatar:      { type: String, default: '' },
  answers:     [answerSchema],
  score:       { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  correctCount:{ type: Number, default: 0 },
  streak:      { type: Number, default: 0 },
  maxStreak:   { type: Number, default: 0 },
  completedAt: { type: Date, default: null },
  rank:        { type: Number, default: 0 },
}, { _id: false })

const quizSessionSchema = new mongoose.Schema({
  // Session identity
  code:        { type: String, unique: true, index: true }, // 6-char competition code
  mode:        { type: String, enum: ['solo','competition'], default: 'solo' },
  status:      { type: String, enum: ['waiting','active','finished'], default: 'waiting', index: true },

  // Quiz content
  subject:     { type: String, required: true },
  topic:       { type: String, default: '' },
  curriculum:  { type: String, default: '' },
  questions:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  questionCount:{ type: Number, default: 10 },
  timePerQ:    { type: Number, default: 30 }, // seconds per question

  // Host (teacher or student)
  hostId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hostName:    { type: String },

  // Participants
  participants: [participantSchema],

  // Timing
  startedAt:   { type: Date, default: null },
  finishedAt:  { type: Date, default: null },

  // Class context
  classId:     { type: String, default: '' },
  curriculum:  { type: String, default: '' },
}, { timestamps: true })

// Generate unique 6-char code
quizSessionSchema.statics.generateCode = function() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

module.exports = mongoose.model('QuizSession', quizSessionSchema)
