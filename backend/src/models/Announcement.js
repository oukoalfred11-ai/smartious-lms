/**
 * Announcement.js — broadcast announcements shown on the student and
 * parent dashboards. Created by admins and teachers, they carry a
 * title, message, optional call to action, category styling, and a
 * schedule window so repeated information (webinars, term dates,
 * programmes) can be set once and shown for as long as it is relevant.
 */
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true, maxlength: 120 },
  body:    { type: String, required: true, trim: true, maxlength: 1000 },

  // Visual category — drives the icon and colour on the dashboard card.
  category: {
    type: String,
    enum: ['general', 'event', 'academic', 'holiday', 'achievement', 'reminder'],
    default: 'general',
  },

  // Optional call to action button (like the mockup cards).
  ctaLabel: { type: String, trim: true, maxlength: 40, default: '' },
  ctaUrl:   { type: String, trim: true, maxlength: 500, default: '' },

  // Who sees it. 'all' covers students and parents; the others narrow it.
  audience: {
    type: String,
    enum: ['all', 'students', 'parents'],
    default: 'all',
    index: true,
  },

  // Scheduling window for repeated information. showFrom defaults to now;
  // showUntil is optional (null = shows until unpublished or removed).
  showFrom:  { type: Date, default: Date.now, index: true },
  showUntil: { type: Date, default: null },

  pinned:    { type: Boolean, default: false },   // floats to the top
  published: { type: Boolean, default: true, index: true },
  // Email broadcast. Set once the announcement has been emailed to its
  // audience, so a scheduled announcement mails exactly once when it
  // goes live and an edit never re-sends.
  emailSentAt:   { type: Date, default: null },
  emailCount:    { type: Number, default: 0 },

  author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, default: '' },      // snapshot so it survives staff changes
}, { timestamps: true });

// Fast lookup for the live feed: published, within window, newest first.
announcementSchema.index({ published: 1, showFrom: 1, showUntil: 1 });

/** Is this announcement live right now? */
announcementSchema.methods.isLive = function (now = new Date()) {
  if (!this.published) return false;
  if (this.showFrom && this.showFrom > now) return false;
  if (this.showUntil && this.showUntil < now) return false;
  return true;
};

module.exports = mongoose.model('Announcement', announcementSchema);
