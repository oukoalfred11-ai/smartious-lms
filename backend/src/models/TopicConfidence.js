/**
 * TopicConfidence — a student's own view of a topic in their lesson plan:
 * "I've got it" or "I need help", with an optional note for the teacher.
 * One record per (student, subject, topic key). The key is a Lesson id,
 * or "Topic||Subtopic" for subjects planned by syllabus subtopics.
 * Visible to the student, their parents and their teachers.
 */
const mongoose = require('mongoose')

const topicConfidenceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null, index: true },
  subject:   { type: String, default: '' },
  key:       { type: String, required: true, maxlength: 400 },
  title:     { type: String, default: '', maxlength: 300 },
  state:     { type: String, enum: ['got_it', 'need_help'], required: true },
  note:      { type: String, default: '', maxlength: 500 },
  // Set when a teacher has seen and dealt with a "need help".
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

topicConfidenceSchema.index({ studentId: 1, subjectId: 1, key: 1 }, { unique: true })
topicConfidenceSchema.index({ subjectId: 1, state: 1, resolvedAt: 1 })

module.exports = mongoose.model('TopicConfidence', topicConfidenceSchema)
