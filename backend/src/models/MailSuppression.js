/**
 * MailSuppression.js — an email address that must not be mailed again,
 * because mail to it bounced or was rejected (lib/mailSuppression.js).
 *
 * Every outgoing email passes lib/mailPolicy.js, which drops suppressed
 * addresses, so one dead address no longer bounces on every reminder,
 * timetable and report. Staff can lift a suppression once the address
 * is corrected (routes/mail-suppressions.js).
 */
const mongoose = require('mongoose')

const mailSuppressionSchema = new mongoose.Schema({
  email:   { type: String, required: true, unique: true, lowercase: true, trim: true },
  // bounce: a delivery failure notice came back; rejected: the mail server
  // refused it when we sent; manual: added by staff.
  reason:  { type: String, enum: ['bounce', 'rejected', 'manual'], default: 'bounce' },
  detail:  { type: String, default: '' },      // the server's words, trimmed
  count:   { type: Number, default: 1 },       // failures seen
  firstAt: { type: Date, default: Date.now },
  lastAt:  { type: Date, default: Date.now },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

module.exports = mongoose.model('MailSuppression', mailSuppressionSchema)
