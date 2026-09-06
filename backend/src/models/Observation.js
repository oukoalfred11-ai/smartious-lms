/**
 * Observation.js — a structured lesson observation, usually scored
 * against a class recording. Converts the teacher league from
 * outcomes-only to outcomes-plus-practice: fairer, and coachable.
 * Five criteria, 1-5 each, with a note the teacher can be shown.
 */
const mongoose = require('mongoose');

const CRITERIA = ['objectives', 'engagement', 'pacing', 'boardUse', 'checksForUnderstanding'];

const observationSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  liveClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass', default: null },
  observerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scores: {
    objectives: { type: Number, min: 1, max: 5, required: true },              // objectives clear and met
    engagement: { type: Number, min: 1, max: 5, required: true },              // student participation
    pacing: { type: Number, min: 1, max: 5, required: true },                  // time well used
    boardUse: { type: Number, min: 1, max: 5, required: true },                // whiteboard/materials
    checksForUnderstanding: { type: Number, min: 1, max: 5, required: true },  // questioning, feedback
  },
  note: { type: String, default: '', maxlength: 1000 },   // shared with the teacher
}, { timestamps: true });

observationSchema.statics.CRITERIA = CRITERIA;
module.exports = mongoose.model('Observation', observationSchema);
