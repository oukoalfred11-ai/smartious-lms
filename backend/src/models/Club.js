/**
 * Club.js
 *
 * A Smartious club: a co-curricular group (Debate & MUN, Coding & AI,
 * Chess...) run by one or more teachers, open to students across
 * curricula. Meetings are live classes (LiveClass with clubId), so they
 * happen in the live classroom, auto-record, and the recordings become
 * the club's archive, which old and new members can rewatch.
 */
const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, maxlength: 80 },
  slug:        { type: String, required: true, unique: true, trim: true, lowercase: true },
  tagline:     { type: String, trim: true, maxlength: 200, default: '' },
  description: { type: String, trim: true, maxlength: 2000, default: '' },

  // Card appearance (matches the clubs hub design): a cover image, a
  // circular icon badge, and a brand colour used for the button.
  icon:        { type: String, default: 'star' },      // key into the frontend icon set
  color:       { type: String, default: '#7D1025' },
  coverImage:  { type: String, default: '' },          // URL (R2 or any https)
  category:    { type: String, default: 'General', trim: true },

  // Teacher(s) in charge. They can schedule and run meetings.
  leaders:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Student members.
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // When the club usually meets (display text) + typical length.
  meetingSchedule: { type: String, trim: true, default: '' },   // e.g. "Fridays, 4:00 PM EAT"
  durationMins:    { type: Number, default: 60, min: 15, max: 240 },

  capacity:    { type: Number, default: 0 },   // 0 = unlimited
  isActive:    { type: Boolean, default: true },
  featured:    { type: Boolean, default: false },
  sortOrder:   { type: Number, default: 0 },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

clubSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Club', clubSchema);
