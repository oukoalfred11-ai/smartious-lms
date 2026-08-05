/**
 * lib/reminderScheduler.js
 *
 * Runs the invoice reminder scan once a day.
 *
 * Deliberately uses a plain timer rather than a cron dependency, so
 * nothing new has to be installed. The scan is cheap (one indexed
 * query plus a per-invoice date comparison) and is safe to run more
 * than once a day, because reminderKindFor() enforces a minimum gap
 * between reminders on the same invoice.
 *
 * Set REMINDERS_ENABLED=false to turn it off without a deploy.
 * Set REMINDER_HOUR (0-23, server time) to choose when it runs.
 */

const { runDueReminders } = require('./invoiceReminders')

const HOUR_MS = 3600 * 1000
let timer = null

function hoursUntilNextRun(targetHour) {
  const now = new Date()
  const next = new Date(now)
  next.setHours(targetHour, 0, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  return next - now
}

async function runOnce(label = 'scheduled') {
  const started = Date.now()
  try {
    const summary = await runDueReminders()
    console.log(
      `[reminders:${label}] scanned=${summary.scanned} sent=${summary.sent} ` +
      `onBreak=${summary.skippedOnBreak} noEmail=${summary.skippedNoEmail} ` +
      `failed=${summary.failed} in ${Date.now() - started}ms`
    )
    return summary
  } catch (e) {
    console.error(`[reminders:${label}] run failed:`, e.message)
    return null
  }
}

function startReminderScheduler() {
  if (String(process.env.REMINDERS_ENABLED || 'true').toLowerCase() === 'false') {
    console.log('[reminders] scheduler disabled by REMINDERS_ENABLED=false')
    return
  }
  if (timer) return

  const targetHour = Math.min(23, Math.max(0, parseInt(process.env.REMINDER_HOUR || '8', 10)))
  const delay = hoursUntilNextRun(targetHour)
  console.log(`[reminders] scheduler armed for ${targetHour}:00 (first run in ${Math.round(delay / HOUR_MS)}h)`)

  setTimeout(() => {
    runOnce('daily')
    timer = setInterval(() => runOnce('daily'), 24 * HOUR_MS)
  }, delay)
}

function stopReminderScheduler() {
  if (timer) { clearInterval(timer); timer = null }
}

module.exports = { startReminderScheduler, stopReminderScheduler, runOnce }
