/**
 * lib/schoolTime.js — wall-clock <-> UTC conversion for school time zones.
 *
 * Timetable slots are stored as wall-clock "HH:MM" in a named zone
 * (TimetableEntry.timezone, Africa/Nairobi by default). Everything that
 * turns a slot into a real instant, or an instant back into a weekday and
 * time, goes through here instead of hard-coding "+3 hours", so that a
 * slot with another zone (or a zone with DST) still lands on the right
 * instant. Pure: no database, no models.
 */
const DEFAULT_TZ = 'Africa/Nairobi';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const fmtCache = new Map();
function formatterFor(tz) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    fmtCache.set(tz, f);
  }
  return f;
}

/** A usable IANA zone name: the given one if Intl knows it, else the default. */
function resolveTz(tz) {
  if (!tz || typeof tz !== 'string') return DEFAULT_TZ;
  try { formatterFor(tz); return tz; } catch { return DEFAULT_TZ; }
}

/**
 * Wall-clock parts of an instant in a zone.
 * @returns {{year, month, day, hour, minute, second, weekday}} month 1-12, weekday 'Mon'..
 */
function zonedParts(date, tz = DEFAULT_TZ) {
  const d = new Date(date);
  const parts = {};
  for (const p of formatterFor(resolveTz(tz)).formatToParts(d)) parts[p.type] = p.value;
  const year = Number(parts.year), month = Number(parts.month), day = Number(parts.day);
  const out = {
    year, month, day,
    hour: Number(parts.hour) % 24, minute: Number(parts.minute), second: Number(parts.second),
  };
  out.weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return out;
}

/** Offset of the zone from UTC at that instant, in ms (Nairobi = +3h). */
function tzOffsetMs(date, tz = DEFAULT_TZ) {
  const t = new Date(date).getTime();
  const p = zonedParts(t, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(t / 1000) * 1000;
}

/** The UTC instant at which the zone's wall clock reads y-m-d h:min. */
function zonedTimeToUtc(year, month, day, hour, minute, tz = DEFAULT_TZ) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const off1 = tzOffsetMs(guess, tz);
  let t = guess - off1;
  const off2 = tzOffsetMs(t, tz);
  if (off2 !== off1) t = guess - off2;
  return new Date(t);
}

/** "YYYY-MM-DD" calendar day of an instant in the zone. */
function zonedDayKey(date, tz = DEFAULT_TZ) {
  const p = zonedParts(date, tz);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

function sameZonedDay(a, b, tz = DEFAULT_TZ) {
  return zonedDayKey(a, tz) === zonedDayKey(b, tz);
}

/** UTC instant of 00:00 on the zone's calendar day containing `date`. */
function startOfZonedDay(date, tz = DEFAULT_TZ) {
  const p = zonedParts(date, tz);
  return zonedTimeToUtc(p.year, p.month, p.day, 0, 0, tz);
}

/** "HH:MM" wall-clock time of an instant in the zone. */
function zonedHHMM(date, tz = DEFAULT_TZ) {
  const p = zonedParts(date, tz);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}

module.exports = {
  DEFAULT_TZ, WEEKDAYS,
  resolveTz, zonedParts, tzOffsetMs, zonedTimeToUtc, zonedDayKey, sameZonedDay,
  startOfZonedDay, zonedHHMM,
};
