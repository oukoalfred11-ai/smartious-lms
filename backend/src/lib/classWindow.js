/**
 * lib/classWindow.js — when a lesson's room is open to join.
 *
 * A lesson stays joinable for its whole set period, from its start to its
 * scheduled end plus REJOIN_GRACE_MIN, whatever its stored status says:
 * a teacher closing the lesson record, the auto-end sweep, or a teacher's
 * power or internet cutting out must not shut the room on everyone, and
 * anyone who drops out can come straight back in. Only a cancelled lesson
 * is never joinable.
 */
const REJOIN_GRACE_MIN = Number(process.env.CLASS_REJOIN_GRACE_MIN || 15)

const startOf = (c) => new Date(c.scheduledAt).getTime()
const endOf = (c) => startOf(c) + (c.durationMins || 60) * 60000
const closesAt = (c) => endOf(c) + REJOIN_GRACE_MIN * 60000

/** 'scheduled' | 'live' | 'ended' | 'cancelled', as shown to people. */
function classStatus(c, now = Date.now()) {
  if (!c) return 'scheduled'
  if (c.status === 'cancelled') return 'cancelled'
  const t = typeof now === 'number' ? now : new Date(now).getTime()
  if (t > closesAt(c)) return 'ended'
  if (c.status === 'live') return 'live'      // started early by the teacher
  if (t < startOf(c)) return 'scheduled'
  return 'live'
}

module.exports = { classStatus, closesAt, endOf, REJOIN_GRACE_MIN }
