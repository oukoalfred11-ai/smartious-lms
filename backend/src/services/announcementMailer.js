/**
 * announcementMailer.js
 *
 * Emails every announcement to its audience the moment it goes live.
 *
 *   - A normal announcement mails immediately on publish.
 *   - A scheduled one (showFrom in the future) mails when that time
 *     arrives, via a light interval that runs every few minutes.
 *   - Each announcement mails exactly once (emailSentAt). Editing the
 *     text later never re-sends. Unpublishing before showFrom cancels it.
 *
 * Audience -> who gets it:
 *   all       every active Smartious user (students, parents, teachers, staff)
 *   students  active students
 *   parents   active parents
 */
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { sendAnnouncementEmail } = require('./notificationEmails');

const ROLES_FOR = {
  all:      ['student', 'parent', 'teacher', 'admin', 'dos', 'ops_manager', 'accountant', 'sales'],
  students: ['student'],
  parents:  ['parent'],
};

// Don't blast very old announcements if email was misconfigured for a
// while and then fixed: only announcements that went live in the last
// 3 days are eligible; older unsent ones are marked as skipped.
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

let running = false;

async function recipientsFor(audience) {
  const roles = ROLES_FOR[audience] || ROLES_FOR.all;
  const users = await User.find({ role: { $in: roles }, isActive: { $ne: false }, email: { $exists: true, $ne: '' } })
    .select('email').lean();
  return users.map(u => u.email);
}

async function dispatchOne(a) {
  const recipients = await recipientsFor(a.audience);
  const sent = await sendAnnouncementEmail({ announcement: a, recipients });
  // Mark sent even when 0 (no recipients / email off) so we never loop on it.
  await Announcement.updateOne({ _id: a._id }, { $set: { emailSentAt: new Date(), emailCount: sent } });
  console.log(`[announcements] "${a.title}" emailed to ${sent} of ${recipients.length} (${a.audience})`);
  return sent;
}

/** Email every published announcement that is live and not yet emailed. */
async function dispatchDueAnnouncements() {
  if (running) return;
  running = true;
  try {
    const now = new Date();
    const due = await Announcement.find({
      published: true,
      emailSentAt: null,
      showFrom: { $lte: now },
      $or: [{ showUntil: null }, { showUntil: { $gt: now } }],
    }).sort({ showFrom: 1 }).limit(20).lean();

    for (const a of due) {
      if (now - new Date(a.showFrom) > MAX_AGE_MS) {
        await Announcement.updateOne({ _id: a._id }, { $set: { emailSentAt: now, emailCount: 0 } });
        console.log(`[announcements] skipped stale announcement "${a.title}"`);
        continue;
      }
      await dispatchOne(a);
    }
  } catch (e) {
    console.error('[announcements] dispatch failed:', e.message);
  } finally {
    running = false;
  }
}

/** Fire-and-forget: try to send a specific announcement now if it is live. */
function dispatchSoon() {
  setTimeout(() => dispatchDueAnnouncements().catch(() => {}), 1500);
}

function startAnnouncementMailer() {
  // First pass shortly after boot, then every 3 minutes for scheduled ones.
  setTimeout(() => dispatchDueAnnouncements().catch(() => {}), 20 * 1000);
  setInterval(() => dispatchDueAnnouncements().catch(() => {}), 3 * 60 * 1000);
  console.log('[announcements] mailer started (checks every 3 min)');
}

module.exports = { startAnnouncementMailer, dispatchDueAnnouncements, dispatchSoon };
