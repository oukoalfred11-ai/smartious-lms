/**
 * services/birthdayCron.js
 * ============================================================
 * Sends a Smartious Community birthday email to EVERY active
 * user (students, parents, teachers and staff) on their
 * birthday, once per year, at or after 07:00 EAT.
 *
 * Runs a check every 30 minutes; per-user lastBirthdayEmailYear
 * guarantees exactly one email per year even across restarts.
 * 29 February birthdays are celebrated on 28 February in
 * non-leap years.
 */
const User = require('../models/User')
const { sendBirthdayEmail } = require('./notificationEmails')

function eatNow() { return new Date(Date.now() + 3 * 60 * 60 * 1000) } // UTC+3

function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 }

async function runBirthdayCheck() {
  const eat = eatNow()
  if (eat.getUTCHours() < 7) return // deliver from 07:00 EAT onwards

  const year = eat.getUTCFullYear()
  const month = eat.getUTCMonth() + 1
  const day = eat.getUTCDate()

  // Match today's month/day; on 28 Feb of a non-leap year, also
  // include people born on 29 Feb.
  const dayMatches = [[month, day]]
  if (month === 2 && day === 28 && !isLeapYear(year)) dayMatches.push([2, 29])

  try {
    const celebrants = await User.find({
      isActive: true,
      email: { $nin: [null, ''] },
      dateOfBirth: { $ne: null },
      $or: dayMatches.map(([m, d]) => ({
        $expr: { $and: [
          { $eq: [{ $month: '$dateOfBirth' }, m] },
          { $eq: [{ $dayOfMonth: '$dateOfBirth' }, d] },
        ] }
      })),
      $and: [{ $or: [ { lastBirthdayEmailYear: { $exists: false } }, { lastBirthdayEmailYear: { $ne: year } } ] }],
    }).select('firstName lastName email role dateOfBirth').limit(200).lean()

    for (const u of celebrants) {
      const sent = await sendBirthdayEmail(u)
      if (sent) {
        await User.findByIdAndUpdate(u._id, { $set: { lastBirthdayEmailYear: year } })
        console.log('[birthday-cron] Sent birthday email to', u.firstName, u.lastName, '(' + u.role + ')')
      }
    }
  } catch (e) {
    console.error('[birthday-cron]', e.message)
  }
}

function startBirthdayCron() {
  setTimeout(runBirthdayCheck, 90 * 1000) // let the DB settle after boot
  setInterval(runBirthdayCheck, 30 * 60 * 1000)
  console.log('[birthday-cron] Community birthday cron started (every 30 min, delivers from 07:00 EAT)')
}

module.exports = { startBirthdayCron, runBirthdayCheck }
