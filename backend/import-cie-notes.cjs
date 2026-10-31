/**
 * import-cie-notes.cjs
 * ============================================================
 * One off script that puts a finished Smartious notes course into the LMS
 * (used for Cambridge AS & A Level Psychology and Sociology).
 *
 *   1. Uploads every lesson note PDF to R2 (verified) before any Mongo write.
 *   2. Replaces the subject's spine with the new one in the manifest, like POST /api/syllabus/bulk
 *      (SpineBackup first).
 *   3. Gives the subject exactly one lesson per new subtopic. Existing lessons whose name matches a new
 *      subtopic are updated in place (same _id, videos and teacher kept, new notes); duplicates are merged
 *      into the first; missing lessons are created. Old lessons that match nothing are kept as drafts
 *      (UNMATCHED=hide), never deleted. Originals are copied to the backup collection first.
 *   4. Renames old subtopic names to the new ones wherever they are stamped (classes, syllabus progress,
 *      questions, timetable lesson plans) so student progress carries over.
 *   5. Adds the complete course notes booklet to the Library.
 *
 * Usage (Render shell, from backend/):
 *   DRY_RUN=1 node import-cie-notes.cjs <manifest.json>     # read only: validates, probes Drive, prints the plan
 *   UNMATCHED=hide node import-cie-notes.cjs <manifest.json> # does it
 *
 * Optional env: AUTHOR_EMAIL, SUBJECT_ID, SKIP_LESSONS, SKIP_BOOKLET, SKIP_MASTERY, SKIP_RECORDINGS, PROBE=0, UNMATCHED=hide
 * Idempotent and resumable: re-run the same command after any failure.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Constants ────────────────────────────────────────────────
let EXPECTED_LESSONS = 0;
let LESSON_KEY_PREFIX = '';
let BOOKLET_SLUG = '';
let COVER_KEY = '';
let BOOKLET_AUTHOR = 'Smartious Homeschool';
let BOOKLET_GRADES = [];
let BOOKLET_DESCRIPTION = '';
let LABEL = '';
/** Everything subject specific comes from manifest.config. */
function applyConfig(c) {
  if (!c || !c.lessonKeyPrefix || !c.bookletSlug || !c.label || !Array.isArray(c.grades)) throw new Error('manifest.config incomplete.');
  EXPECTED_LESSONS = c.expectedLessons; LESSON_KEY_PREFIX = c.lessonKeyPrefix; BOOKLET_SLUG = c.bookletSlug;
  COVER_KEY = `covers/${BOOKLET_SLUG}.png`; BOOKLET_AUTHOR = c.author || 'Smartious Homeschool';
  BOOKLET_GRADES = c.grades; BOOKLET_DESCRIPTION = c.description || ''; LABEL = c.label;
}
const DOWNLOAD_RETRIES = 3;
const DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000;
const PLACEHOLDER_RE = /^(|PASTE.*|TODO.*|PART\d*_ID|.*PLACEHOLDER.*|\.\.\.)$/i;

// ── Pure helpers (exported for tests) ────────────────────────
class StopRequested extends Error { constructor() { super('Stopped by user (Ctrl-C).'); this.name = 'StopRequested'; } }
class DriveError extends Error {
  constructor(msg, retryable) { super(msg); this.name = 'DriveError'; this.retryable = !!retryable; }
}

function parseDriveId(v) {
  const s = String(v || '').trim();
  if (!s || PLACEHOLDER_RE.test(s)) return null;
  const m = /\/d\/([A-Za-z0-9_-]{10,})/.exec(s) || /[?&]id=([A-Za-z0-9_-]{10,})/.exec(s);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{10,}$/.test(s)) return s;
  return undefined; // present but malformed
}

function driveDownloadUrl(id, extra) {
  let u = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;
  if (extra && extra.uuid) u += `&uuid=${encodeURIComponent(extra.uuid)}`;
  return u;
}

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const isInt = (x) => Number.isInteger(x) && x > 0;
const isHex64 = (x) => typeof x === 'string' && /^[0-9a-f]{64}$/.test(x);
const fmtMB = (n) => (n / 1048576).toFixed(n >= 10485760 ? 0 : 1) + ' MB';
const normName = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const normTitle = (s) => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, ''); // routes/library.js rule
const escRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sid = (x) => (x == null ? '' : String(x));

// Same patterns as models/Lesson.js extractYouTubeId.
function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return '';
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) { const m = url.match(re); if (m) return m[1]; }
  return '';
}

/** Spine flattened in array order (the order the bulk loader stores and the timetable reads). */
function flattenTopics(topics) {
  const out = [];
  [...(topics || [])].sort((a, b) => (a.topicOrder || 0) - (b.topicOrder || 0)).forEach((t) => {
    (t.subtopics || []).forEach((s) => out.push({
      name: s.name, code: String(s.code || '').trim(), topicName: t.topic, topicCode: t.code || '',
      topicId: t._id || null, position: out.length + 1,
    }));
  });
  return out;
}

/** Normalised fingerprint of a spine, used to decide whether the live one is already the new one. */
function spineSignature(topics, sourceSyllabus) {
  return JSON.stringify([...(topics || [])].sort((a, b) => (a.topicOrder || 0) - (b.topicOrder || 0)).map((t) => ({
    topic: String(t.topic || '').trim(), code: String(t.code || '').trim(), topicOrder: t.topicOrder || 0,
    sourceSyllabus: String(sourceSyllabus !== undefined ? sourceSyllabus : (t.sourceSyllabus || '')).trim(),
    subtopics: (t.subtopics || []).map((s) => ({
      name: String(s.name || '').trim(), code: String(s.code || '').trim(), subOrder: s.subOrder || 0,
      suggestedLessons: typeof s.suggestedLessons === 'number' ? s.suggestedLessons : 1,
      objectives: Array.isArray(s.objectives) ? s.objectives : [],
    })),
  })));
}

/** The SyllabusTopic documents, built exactly as routes/syllabus.js POST /bulk builds them. */
function buildSpineDocs(subject, spine) {
  const sourceSyllabus = spine.sourceSyllabus || '';
  return spine.topics.map((t, i) => ({
    subjectId: subject._id,
    curriculum: subject.curriculum || '',
    subjectName: subject.subjectName || subject.name || '',
    topic: (t.topic || '').trim(),
    code: (t.code || '').trim(),
    topicOrder: typeof t.topicOrder === 'number' ? t.topicOrder : i,
    sourceSyllabus: (sourceSyllabus || t.sourceSyllabus || '').trim(),
    subtopics: (Array.isArray(t.subtopics) ? t.subtopics : []).map((s, j) => ({
      name: (s.name || '').trim(),
      code: (s.code || '').trim(),
      subOrder: typeof s.subOrder === 'number' ? s.subOrder : j,
      suggestedLessons: typeof s.suggestedLessons === 'number' ? s.suggestedLessons : 1,
      objectives: Array.isArray(s.objectives) ? s.objectives : [],
    })),
  })).filter((d) => d.topic);
}

/**
 * Build the migration plan from the manifest: target lessons, PRIMARY/MERGED roles,
 * and the old name -> new name table. Returns { errors, target, byN, byOrder, renames }.
 */
function buildPlan(manifest) {
  const errors = [];
  const target = flattenTopics((manifest.spine && manifest.spine.topics) || []).map((f, ix) => ({ ...f, n: ix + 1 }));
  const byName = new Map(target.map((t) => [t.name, t]));
  const mig = manifest.migration || {};
  const old = Array.isArray(mig.oldLessons) ? mig.oldLessons : [];
  const byN = new Map(target.map((t) => [t.n, { primaryOrder: null, mergedOrders: [] }]));
  const byOrder = new Map();
  const renames = new Map();
  [...old].sort((a, b) => a.order - b.order).forEach((o) => {
    if (!isInt(o.order) || byOrder.has(o.order)) { errors.push(`migration.oldLessons: bad or duplicate order ${o.order}.`); return; }
    if (!o.subtopicName) { errors.push(`migration.oldLessons order ${o.order}: subtopicName missing.`); return; }
    const slot = byN.get(o.newN);
    if (!slot) { errors.push(`migration.oldLessons order ${o.order}: newN ${o.newN} is not a lesson.`); return; }
    const role = slot.primaryOrder === null ? 'PRIMARY' : 'MERGED';
    if (o.role && o.role !== role) errors.push(`migration.oldLessons order ${o.order}: role ${o.role} but the first-order rule makes it ${role}.`);
    if (role === 'PRIMARY') slot.primaryOrder = o.order; else slot.mergedOrders.push(o.order);
    byOrder.set(o.order, { ...o, role });
    const to = target[o.newN - 1].name;
    if (renames.has(o.subtopicName) && renames.get(o.subtopicName) !== to) errors.push(`Old name "${o.subtopicName}" maps to two different lessons.`);
    renames.set(o.subtopicName, to);
  });
  // Every new name maps to itself, unless an old lesson already claims that string for another lesson.
  target.forEach((t) => { if (!renames.has(t.name)) renames.set(t.name, t.name); else if (renames.get(t.name) !== t.name) errors.push(`New name "${t.name}" is also an old name mapped elsewhere.`); });
  Object.entries(mig.extraRenames || {}).forEach(([from, to]) => {
    if (!byName.has(to)) errors.push(`extraRenames: "${to}" is not a new spine name.`);
    else if (renames.has(from) && renames.get(from) !== to) errors.push(`extraRenames: "${from}" already maps to "${renames.get(from)}".`);
    else renames.set(from, to);
  });
  const norm = new Map();
  for (const [from, to] of renames) { const k = normName(from); norm.set(k, norm.has(k) && norm.get(k) !== to ? null : to); }
  return { errors, target, byName, byN, byOrder, renames, norm };
}

/** Resolve a stamped name to a new spine name: exact, then by normalised spelling. */
function resolveName(plan, name) {
  if (!name) return null;
  const t = String(name).trim();
  if (plan.renames.has(t)) return { name: plan.renames.get(t), fuzzy: false, changed: plan.renames.get(t) !== t };
  const n = plan.norm.get(normName(t));
  return n ? { name: n, fuzzy: true, changed: n !== t } : null;
}

/** Pair live (or backed up) lesson docs with the listing by subtopicName, order breaking ties. */
function identifyOriginals(docs, oldLessons) {
  const errors = [];
  const want = new Map();
  [...oldLessons].sort((a, b) => a.order - b.order).forEach((o) => { (want.get(o.subtopicName) || want.set(o.subtopicName, []).get(o.subtopicName)).push(o); });
  const have = new Map();
  docs.forEach((d) => { const k = String(d.subtopicName || '').trim(); (have.get(k) || have.set(k, []).get(k)).push(d); });
  const pairs = [];
  for (const [name, list] of have) {
    const exp = want.get(name);
    if (!exp) { list.forEach((d) => errors.push(`Lesson ${d._id} "${d.title}" (subtopicName "${name}") is not in the expected listing.`)); continue; }
    if (exp.length !== list.length) { errors.push(`subtopicName "${name}": ${list.length} live lesson(s), the listing expects ${exp.length}.`); continue; }
    const sorted = [...list].sort((a, b) => ((a.order || 0) - (b.order || 0)) || sid(a._id).localeCompare(sid(b._id)));
    sorted.forEach((d, i) => pairs.push({ doc: d, entry: exp[i] }));
  }
  for (const [name, exp] of want) if (!have.has(name)) exp.forEach((o) => errors.push(`Expected old lesson ${o.order} "${name}" is missing.`));
  return { pairs, errors };
}

const videoKey = (v) => (v.source === 'recording' ? 'r2:' + (v.r2Url || v.r2Key) : 'yt:' + v.embedId);

/** Video keys a lesson shows, the way LessonPlayerTab builds its list. */
function lessonVideoKeys(lesson) {
  const s = new Set();
  if (lesson.videoEmbedId) s.add('yt:' + lesson.videoEmbedId);
  (lesson.videos || []).forEach((v) => s.add(videoKey(v)));
  return s;
}

/** Videos to push onto a primary from merged lessons, without duplicates. */
function planVideoMerge(primary, mergedDocs) {
  const seen = lessonVideoKeys(primary);
  const add = [], lost = [];
  let dup = 0;
  for (const m of mergedDocs) {
    const cands = [];
    const yt = m.videoEmbedId || extractYouTubeId(m.videoUrl || '');
    if (yt) cands.push({ source: 'youtube', title: String(m.title || '').slice(0, 200), embedId: yt, r2Url: '', r2Key: '', posterUrl: '', durationMins: m.durationMins || 0, liveClassId: null, recordedAt: null, createdBy: m.teacherId || null, createdAt: m.createdAt || new Date() });
    else if (m.videoUrl) lost.push({ lessonId: m._id, videoUrl: m.videoUrl });
    (m.videos || []).forEach((v) => cands.push(v));
    for (const c of cands) {
      const k = videoKey(c);
      if (seen.has(k)) { dup++; continue; }
      seen.add(k); add.push(c);
    }
  }
  return { add, dup, lost };
}

/** Rename "Topic||Subtopic" keys; unknown keys are kept as they are. */
function remapTopicPlanOrder(keys, plan) {
  const out = [], unknown = [];
  for (const k of keys || []) {
    const sub = String(k).split('||').slice(1).join('||');
    const r = resolveName(plan, sub);
    const nk = r ? `${plan.byName.get(r.name).topicName}||${r.name}` : k;
    if (!r) unknown.push(k);
    if (!out.includes(nk)) out.push(nk);
  }
  return { keys: out, unknown, changed: JSON.stringify(out) !== JSON.stringify(keys || []) };
}

/** Replace ids through a map and drop duplicates, keeping first occurrences. */
function remapIdArray(ids, idMap) {
  const out = [], seen = new Set();
  for (const id of ids || []) {
    const to = idMap.get(sid(id)) || id;
    if (seen.has(sid(to))) continue;
    seen.add(sid(to)); out.push(to);
  }
  return { ids: out, changed: out.length !== (ids || []).length || out.some((x, i) => sid(x) !== sid(ids[i])) };
}

/** Validate the manifest. Returns { errors, warnings, missingDriveIds }. */
function validateManifest(m) {
  const errors = [], warnings = [];
  let missingDriveIds = 0;
  if (!m || typeof m !== 'object') return { errors: ['Manifest is not an object.'], warnings, missingDriveIds };
  const L = m.lessons;
  if (!Array.isArray(L)) errors.push('lessons must be an array.');
  else {
    if (L.length !== EXPECTED_LESSONS) errors.push(`lessons has ${L.length} entries, expected ${EXPECTED_LESSONS}.`);
    const codes = new Set(), files = new Set(), ns = new Set();
    L.forEach((l, i) => {
      const at = `lessons[${i}]` + (l && l.code ? ` (${l.code})` : '');
      if (!l || typeof l !== 'object') { errors.push(`${at} is not an object.`); return; }
      if (!isInt(l.n)) errors.push(`${at}: n must be a positive integer.`);
      else if (ns.has(l.n)) errors.push(`${at}: duplicate n ${l.n}.`); else ns.add(l.n);
      if (l.n !== i + 1) errors.push(`${at}: n is ${l.n} but position is ${i + 1}.`);
      if (!l.code || typeof l.code !== 'string') errors.push(`${at}: code missing.`);
      else if (codes.has(l.code)) errors.push(`${at}: duplicate code.`); else codes.add(l.code);
      if (!l.title || typeof l.title !== 'string') errors.push(`${at}: title missing.`);
      if (!/^[A-Za-z0-9._-]+\.pdf$/.test(String(l.fileName || ''))) errors.push(`${at}: fileName must be a plain .pdf name (letters, digits, . _ -).`);
      else if (files.has(l.fileName)) errors.push(`${at}: duplicate fileName.`); else files.add(l.fileName);
      if (!isInt(l.bytes)) errors.push(`${at}: bytes must be a positive integer.`);
      if (l.sha256 !== undefined && !isHex64(l.sha256)) errors.push(`${at}: sha256 must be 64 lowercase hex characters.`);
      const id = parseDriveId(l.driveId);
      if (id === null) missingDriveIds++;
      else if (id === undefined) errors.push(`${at}: driveId "${l.driveId}" is not a Drive id or link.`);
    });
  }
  // Spine: the lessons must be the spine, in order.
  if (!m.spine || !Array.isArray(m.spine.topics) || !m.spine.topics.length) errors.push('spine.topics missing.');
  else {
    const flat = flattenTopics(m.spine.topics);
    if (flat.length !== EXPECTED_LESSONS) errors.push(`spine has ${flat.length} subtopics, expected ${EXPECTED_LESSONS}.`);
    if (new Set(flat.map((f) => f.code)).size !== flat.length) errors.push('spine codes are not unique.');
    if (new Set(flat.map((f) => f.name)).size !== flat.length) errors.push('spine names are not unique.');
    if (flat.some((f) => !f.name || f.name.length > 200)) errors.push('spine names must be 1 to 200 characters.');
    if (new Set(m.spine.topics.map((t) => t.topic)).size !== m.spine.topics.length) errors.push('spine topic names are not unique.');
    if (Array.isArray(L)) L.forEach((l, i) => {
      if (flat[i] && (flat[i].code !== l.code || flat[i].name !== l.title)) errors.push(`lessons[${i}] ${l.code} "${l.title}" is not spine subtopic ${i + 1} ${flat[i].code} "${flat[i].name}".`);
    });
  }
  if (!m.migration || !Array.isArray(m.migration.oldLessons)) errors.push('migration.oldLessons missing.');
  else if (!errors.length) errors.push(...buildPlan(m).errors);
  if (m.migration && !/^[A-Za-z0-9_]+$/.test(String(m.migration.backupCollection || ''))) errors.push('migration.backupCollection must be a plain collection name.');
  if (m.migration && !/^[A-Za-z0-9_]+$/.test(String(m.migration.changeBackupCollection || ''))) errors.push('migration.changeBackupCollection must be a plain collection name.');
  const b = m.booklet;
  if (b !== undefined) {
    if (!b || typeof b !== 'object') errors.push('booklet must be an object.');
    else {
      if (!b.title || String(b.title).length > 200) errors.push('booklet.title missing or longer than 200.');
      if (!/^[A-Za-z0-9._-]+\.pdf$/.test(String(b.fileName || ''))) errors.push('booklet.fileName invalid.');
      if (!isInt(b.bytes)) errors.push('booklet.bytes must be a positive integer.');
      if (!isHex64(b.sha256)) errors.push('booklet.sha256 must be 64 lowercase hex characters.');
      if (!Array.isArray(b.parts) || !b.parts.length) errors.push('booklet.parts must be a non empty array.');
      else {
        if (b.parts.length > 10000) errors.push('booklet.parts: too many parts.');
        let sum = 0;
        b.parts.forEach((p, i) => {
          const at = `booklet.parts[${i}]`;
          if (!p || !isInt(p.bytes)) { errors.push(`${at}: bytes must be a positive integer.`); return; }
          sum += p.bytes;
          if (p.sha256 !== undefined && !isHex64(p.sha256)) errors.push(`${at}: sha256 invalid.`);
          const id = parseDriveId(p.driveId);
          if (id === null) missingDriveIds++;
          else if (id === undefined) errors.push(`${at}: driveId "${p.driveId}" is not a Drive id or link.`);
        });
        const first = b.parts[0] && b.parts[0].bytes;
        // S3 needs every part but the last >= 5 MiB; R2 also needs them all the same size.
        b.parts.slice(0, -1).forEach((p, i) => {
          if (p && p.bytes !== first) errors.push(`booklet.parts[${i}]: every part except the last must be the same size (R2 rule).`);
          if (p && p.bytes < 5 * 1024 * 1024) errors.push(`booklet.parts[${i}]: parts except the last must be at least 5 MiB.`);
        });
        const last = b.parts[b.parts.length - 1];
        if (last && first && last.bytes > first) errors.push('booklet: the last part must not be larger than the others.');
        if (isInt(b.bytes) && sum !== b.bytes) errors.push(`booklet: parts add up to ${sum} bytes, booklet.bytes is ${b.bytes}.`);
      }
    }
    if (typeof m.coverPngBase64 !== 'string' || !m.coverPngBase64.length) errors.push('coverPngBase64 missing.');
    else {
      const png = Buffer.from(m.coverPngBase64, 'base64');
      if (png.length < 100 || png.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') errors.push('coverPngBase64 is not a PNG.');
    }
  }
  return { errors, warnings, missingDriveIds };
}

function looksLikeHtml(buf) {
  const head = buf.slice(0, 512).toString('latin1').trimStart().toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html') || head.startsWith('<head') || (head.startsWith('<') && head.includes('<title'));
}

/** Drive's "can't scan for viruses" page carries a uuid to confirm with. */
function parseDriveConfirm(html) {
  const m = /name="uuid"\s+value="([^"]+)"/.exec(html);
  return m ? { uuid: m[1] } : null;
}

/** Judge one Drive response body. Throws DriveError. */
function checkDriveBody({ status, contentType, buf, expectedBytes, expectPdf, expectedSha }) {
  if (status === 404) throw new DriveError('Drive says 404: wrong id, or the file was deleted.', false);
  if (status === 401 || status === 403) throw new DriveError(`Drive refused (${status}): not shared as "Anyone with the link", or the download quota is exceeded.`, true);
  if (status === 429 || status >= 500) throw new DriveError(`Drive returned ${status}.`, true);
  if (status !== 200) throw new DriveError(`Unexpected HTTP ${status}.`, true);
  if (/text\/html/i.test(contentType || '') || looksLikeHtml(buf)) {
    const html = buf.slice(0, 20000).toString('utf8');
    const confirm = parseDriveConfirm(html);
    const err = new DriveError(confirm
      ? 'Drive returned its virus scan confirmation page.'
      : 'Drive returned an HTML page instead of the file (sign in page: share the file as "Anyone with the link").', true);
    err.confirm = confirm;
    throw err;
  }
  if (expectPdf && buf.slice(0, 5).toString('latin1') !== '%PDF-') throw new DriveError('Body does not start with %PDF.', false);
  if (buf.length !== expectedBytes) throw new DriveError(`Got ${buf.length} bytes, manifest says ${expectedBytes}.`, true);
  if (expectedSha && sha256(buf) !== expectedSha) throw new DriveError('sha256 does not match the manifest (wrong file on Drive?).', false);
  return true;
}

function linkedSignal(timeoutMs, stopSignal) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(new Error('timeout')), timeoutMs);
  const onStop = () => ac.abort(new StopRequested());
  if (stopSignal) { if (stopSignal.aborted) onStop(); else stopSignal.addEventListener('abort', onStop, { once: true }); }
  return { signal: ac.signal, done: () => { clearTimeout(t); if (stopSignal) stopSignal.removeEventListener('abort', onStop); } };
}

/** Download one Drive file into memory, verified. Retries DOWNLOAD_RETRIES times with backoff. */
async function fetchDrive(id, { expectedBytes, expectPdf = true, expectedSha, fetchImpl = globalThis.fetch,
  retries = DOWNLOAD_RETRIES, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), log = () => {},
  stopSignal = null, timeoutMs = DOWNLOAD_TIMEOUT_MS } = {}) {
  let extra = null, lastErr = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (stopSignal && stopSignal.aborted) throw new StopRequested();
    if (attempt > 0) {
      const wait = 2000 * Math.pow(3, attempt - 1);
      log(`    retry ${attempt}/${retries} in ${wait / 1000}s (${lastErr.message})`);
      await sleep(wait);
    }
    const { signal, done } = linkedSignal(timeoutMs, stopSignal);
    try {
      const res = await fetchImpl(driveDownloadUrl(id, extra), { redirect: 'follow', signal });
      const buf = Buffer.from(await res.arrayBuffer());
      checkDriveBody({ status: res.status, contentType: res.headers.get('content-type'), buf, expectedBytes, expectPdf, expectedSha });
      return buf;
    } catch (e) {
      if (e instanceof StopRequested || (signal.reason instanceof StopRequested)) throw new StopRequested();
      if (e instanceof DriveError) {
        if (e.confirm) extra = e.confirm;
        if (!e.retryable) throw e;
        lastErr = e;
      } else {
        lastErr = new DriveError(`network: ${e.message}`, true);
      }
    } finally { done(); }
  }
  throw lastErr;
}

/** Cheap DRY_RUN check: first bytes only (Range), never the whole file. */
async function probeDrive(id, { expectedBytes, expectPdf = true, fetchImpl = globalThis.fetch, stopSignal = null } = {}) {
  const { signal, done } = linkedSignal(60000, stopSignal);
  try {
    const res = await fetchImpl(driveDownloadUrl(id), { redirect: 'follow', signal, headers: { Range: 'bytes=0-1023' } });
    let buf;
    if (res.status === 206 || !res.body || !res.body.getReader) {
      buf = Buffer.from(await res.arrayBuffer());
    } else {
      const reader = res.body.getReader();
      const first = await reader.read();
      buf = Buffer.from(first.value || []);
      try { await reader.cancel(); } catch (_) { /* ignore */ }
    }
    const status = res.status === 206 ? 200 : res.status;
    let total = null;
    const cr = res.headers.get('content-range');
    if (cr && /\/(\d+)$/.test(cr)) total = Number(/\/(\d+)$/.exec(cr)[1]);
    else if (res.status === 200 && res.headers.get('content-length')) total = Number(res.headers.get('content-length'));
    try {
      checkDriveBody({ status, contentType: res.headers.get('content-type'), buf, expectedBytes: buf.length, expectPdf });
    } catch (e) { return { ok: false, detail: e.message }; }
    if (total !== null && total !== expectedBytes) return { ok: false, detail: `Drive reports ${total} bytes, manifest says ${expectedBytes}.` };
    return { ok: true, detail: total !== null ? `size ${total} ok` : 'reachable (size not reported)' };
  } catch (e) {
    return { ok: false, detail: e instanceof StopRequested ? 'stopped' : `network: ${e.message}` };
  } finally { done(); }
}

// ── Runtime ──────────────────────────────────────────────────
const env = (k) => String(process.env[k] || '').trim();
const flag = (k) => /^(1|true|yes|y)$/i.test(env(k));

let stopRequested = false;
// While true, the first Ctrl-C waits: the Mongo block has no network I/O,
// takes seconds, and should not leave the subject half migrated.
let inCriticalSection = false;
const stopController = new AbortController();
const checkStop = () => { if (stopRequested) throw new StopRequested(); };

function installSignalHandlers() {
  const handler = (sig) => {
    if (stopRequested) { console.log(`\n${sig} again: forcing exit. Re-run the script to resume.`); process.exit(130); }
    stopRequested = true;
    stopController.abort();
    console.log(inCriticalSection
      ? `\n${sig} received: finishing the Mongo migration block first (a few seconds), then stopping. Press again to force.`
      : `\n${sig} received: stopping after the current step (press again to force). Re-run to resume.`);
  };
  process.on('SIGINT', handler);
  process.on('SIGTERM', handler);
}

async function main() {
  const DRY = flag('DRY_RUN');
  const tStart = Date.now();
  const summary = { spine: {}, lessons: {}, migration: {}, booklet: {}, unmatched: {}, warnings: [] };
  installSignalHandlers();

  
  // 0. Manifest
  const manifestPath = path.resolve(env('MANIFEST') || process.argv[2] || '');
  if (!env('MANIFEST') && !process.argv[2]) throw new Error('Usage: node import-cie-notes.cjs <manifest.json>');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  applyConfig(manifest.config);
  console.log(`${LABEL} import${DRY ? ' (DRY RUN: no writes to R2 or Mongo)' : ''}`);
  const mv = validateManifest(manifest);
  mv.warnings.forEach((w) => console.log('  WARN ' + w));
  if (mv.errors.length) { mv.errors.forEach((e) => console.log('  ERROR ' + e)); throw new Error(`Manifest has ${mv.errors.length} error(s); nothing was changed.`); }
  if (mv.missingDriveIds) {
    const msg = `${mv.missingDriveIds} Drive id(s) are still placeholders.`;
    if (!DRY) throw new Error(msg + ' Fill them in first; nothing was changed.');
    console.log('  WARN ' + msg + ' Those files are not probed.');
  }
  let plan = buildPlan(manifest);
  const target = plan.target;
  const nPrimary = [...plan.byN.values()].filter((s) => s.primaryOrder !== null).length;
  console.log(`Manifest OK: ${manifest.lessons.length} lessons, new spine ${manifest.spine.topics.length} topics / ${target.length} subtopics, ` +
    `${plan.byOrder.size} old lessons (${nPrimary} primary, ${plan.byOrder.size - nPrimary} merged), booklet ${fmtMB(manifest.booklet.bytes)} in ${manifest.booklet.parts.length} parts.`);

  // Heavy deps are loaded here so the pure helpers can be tested without node_modules.
  require('dotenv').config();
  const mongoose = require('mongoose');
  const S3 = require('@aws-sdk/client-s3');
  const Subject = require('./src/models/Subject');
  const SyllabusTopic = require('./src/models/SyllabusTopic');
  const SpineBackup = require('./src/models/SpineBackup');
  const Lesson = require('./src/models/Lesson');
  const LiveClass = require('./src/models/LiveClass');
  const TimetableEntry = require('./src/models/TimetableEntry');
  const StudentSyllabusProgress = require('./src/models/StudentSyllabusProgress');
  const LessonProgress = require('./src/models/LessonProgress');
  const Question = require('./src/models/Question');
  const LibraryBook = require('./src/models/LibraryBook');
  const User = require('./src/models/User');

  const R2_VARS = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL'];
  const missingR2 = R2_VARS.filter((k) => !env(k));
  if (missingR2.length && !DRY) throw new Error('Missing env: ' + missingR2.join(', '));
  const r2 = missingR2.length ? null : new S3.S3Client({
    region: 'auto',
    endpoint: `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env('R2_ACCESS_KEY_ID'), secretAccessKey: env('R2_SECRET_ACCESS_KEY') },
  });
  if (!r2) console.log('  WARN R2 env not set: R2 checks are skipped in this dry run.');
  const BUCKET = env('R2_BUCKET_NAME');
  const PUBLIC = env('R2_PUBLIC_URL').replace(/\/+$/, '');
  const publicUrl = (key) => `${PUBLIC}/${key}`;

  async function head(key) {
    if (!r2) return null;
    try {
      const h = await r2.send(new S3.HeadObjectCommand({ Bucket: BUCKET, Key: key }));
      return { size: Number(h.ContentLength), sha256: (h.Metadata || {}).sha256 || null };
    } catch (e) {
      if (e.name === 'NotFound' || e.name === 'NoSuchKey' || (e.$metadata && e.$metadata.httpStatusCode === 404)) return null;
      throw e;
    }
  }
  async function withRetry(label, fn) {
    let last;
    for (let i = 0; i <= 3; i++) {
      checkStop();
      if (i) { console.log(`    ${label}: retry ${i}/3 (${last.message})`); await new Promise((r) => setTimeout(r, 2000 * Math.pow(3, i - 1))); }
      try { return await fn(); } catch (e) { last = e; }
    }
    throw last;
  }
  const isCurrent = (h, bytes, sha) => !!h && h.size === bytes && (!sha || !h.sha256 || h.sha256 === sha);

  const uri = env('MONGODB_URI');
  if (!uri) throw new Error('MONGODB_URI is not set.');
  await mongoose.connect(uri);
  console.log('Connected to Mongo.');
  const db = mongoose.connection.db;

  try {
    // 1. Subject
    const want = manifest.subject;
    let subject;
    if (env('SUBJECT_ID')) subject = await Subject.findById(env('SUBJECT_ID')).lean();
    else {
      let rows = await Subject.find({ curriculum: want.curriculum, subjectName: want.subjectName }).lean();
      if (!rows.length) rows = await Subject.find({ curriculum: want.curriculum, subjectName: new RegExp('^\\s*' + escRe(want.subjectName) + '\\s*$', 'i') }).lean();
      if (rows.length > 1) throw new Error(`${rows.length} subjects match ${want.curriculum} ${want.subjectName}: ${rows.map((r) => r._id).join(', ')}. Set SUBJECT_ID.`);
      subject = rows[0];
    }
    if (!subject) throw new Error(`Subject ${want.curriculum} ${want.subjectName} not found.`);
    console.log(`Subject: ${subject.subjectName} (${subject.curriculum}) ${subject._id}`);

    // 2. Author (for newly created lessons and the library record)
    let author;
    if (env('AUTHOR_EMAIL')) {
      author = await User.findOne({ email: env('AUTHOR_EMAIL').toLowerCase() }).select('firstName lastName email role isActive').lean();
      if (!author) throw new Error(`AUTHOR_EMAIL ${env('AUTHOR_EMAIL')} not found.`);
      if (!['admin', 'teacher', 'dos'].includes(author.role)) console.log(`  WARN author role is "${author.role}".`);
    } else {
      author = await User.findOne({ role: 'admin', isActive: { $ne: false } }).sort({ createdAt: 1 }).select('firstName lastName email role').lean();
      if (!author) throw new Error('No active admin user found. Set AUTHOR_EMAIL.');
    }
    const authorName = [author.firstName, author.lastName].filter(Boolean).join(' ');
    console.log(`Author / uploader: ${authorName} <${author.email}> (${author.role})`);

    const skipLessons = flag('SKIP_LESSONS');
    let lessonsOk = skipLessons;

    if (!skipLessons) {
      const BK = manifest.migration.backupCollection;
      const CBK = manifest.migration.changeBackupCollection;
      const targetSig = spineSignature(manifest.spine.topics, manifest.spine.sourceSyllabus);
      const targetNames = new Set(target.map((t) => t.name));

      // 3. Spine state and diff
      const liveTopics = await SyllabusTopic.find({ subjectId: subject._id }).sort({ topicOrder: 1 }).lean();
      const liveFlat = flattenTopics(liveTopics);
      const spineCurrent = liveTopics.length > 0 && spineSignature(liveTopics) === targetSig;
      console.log('\nSpine:');
      if (spineCurrent) console.log(`  live spine already equals the new one (${liveTopics.length} topics, ${liveFlat.length} subtopics); no change.`);
      else {
        const kept = liveFlat.filter((f) => targetNames.has(f.name));
        const renamed = liveFlat.filter((f) => !targetNames.has(f.name) && resolveName(plan, f.name));
        const unmapped = liveFlat.filter((f) => !targetNames.has(f.name) && !resolveName(plan, f.name));
        const reached = new Set(liveFlat.map((f) => (resolveName(plan, f.name) || {}).name).filter(Boolean));
        console.log(`  live: ${liveTopics.length} topics, ${liveFlat.length} subtopics -> new: ${manifest.spine.topics.length} topics, ${target.length} subtopics (replaced like POST /api/syllabus/bulk, SpineBackup first)`);
        console.log(`  old names kept verbatim ${kept.length}, renamed by the lesson map ${renamed.length}, with no new name ${unmapped.length}; new subtopics with no old name ${target.filter((t) => !reached.has(t.name)).length}`);
        unmapped.forEach((f) => console.log(`    old spine name with no new name: ${f.code} "${f.name}"`));
        summary.spine = { live: liveFlat.length, target: target.length, kept: kept.length, renamed: renamed.length, unmapped: unmapped.map((f) => f.name) };
      }

      // 4. Original lessons: the backup once it exists, else the live set (which must match the listing)
      const bkCount = await db.collection(BK).countDocuments({});
      const liveLessons = await Lesson.collection.find({ subjectId: subject._id }).toArray();
      let originals;
      if (bkCount > 0) {
        originals = await db.collection(BK).find({}).toArray();
        if (originals.some((d) => sid(d.subjectId) !== sid(subject._id))) throw new Error(`Backup collection ${BK} holds lessons of another subject; nothing was changed.`);
        console.log(`\nOriginal lessons: read from backup ${BK} (${bkCount} docs, written by an earlier run).`);
      } else {
        originals = liveLessons;
        console.log(`\nOriginal lessons: ${liveLessons.length} live lessons on the subject.`);
      }
      // The old lessons are discovered, not listed: an old lesson whose name matches a new subtopic
      // (same spelling or via migration.extraMap) becomes that lesson's PRIMARY (the first one by order)
      // or is MERGED into it. Anything else is hidden (draft) when UNMATCHED=hide, otherwise the run stops.
      const normToN = new Map(target.map((t) => [normName(t.name), t.n]));
      const extraMap = (manifest.migration && manifest.migration.extraMap) || {};
      const sortedOrig = [...originals].sort((a, b) => ((a.order || 0) - (b.order || 0)) || sid(a._id).localeCompare(sid(b._id)));
      const ident = { pairs: [], errors: [] };
      const hiddenDocs = [];
      sortedOrig.forEach((d) => {
        const nm = String(d.subtopicName || '').trim();
        let n = normToN.get(normName(nm));
        if (!n && extraMap[nm]) { const t = plan.byName.get(extraMap[nm]); if (t) n = t.n; }
        if (!n) { hiddenDocs.push(d); return; }
        ident.pairs.push({ doc: d, entry: { order: ident.pairs.length + 1, subtopicName: nm, newN: n } });
      });
      plan = buildPlan({ ...manifest, migration: { ...manifest.migration, oldLessons: ident.pairs.map((p) => p.entry) } });
      if (plan.errors.length) { plan.errors.forEach((e) => console.log('  ERROR ' + e)); throw new Error('Old lesson mapping is inconsistent; nothing was changed.'); }
      if (hiddenDocs.length) {
        console.log(`\nOld lessons with no matching new subtopic: ${hiddenDocs.length}`);
        hiddenDocs.slice(0, 80).forEach((d) => console.log(`  ${sid(d._id)} order ${d.order} "${d.subtopicName || d.title}" status ${d.status}`));
        if (!/^hide$/i.test(env('UNMATCHED'))) throw new Error('Re-run with UNMATCHED=hide to set those lessons to draft (kept, with their videos, hidden from students), or map them in migration.extraMap. Nothing was changed.');
      }
      const roleById = new Map();   // original _id -> { entry, role, newN }
      const idByOrder = new Map();
      ident.pairs.forEach(({ doc, entry }) => { const r = plan.byOrder.get(entry.order); roleById.set(sid(doc._id), { doc, entry, role: r.role, newN: r.newN }); idByOrder.set(entry.order, doc._id); });
      const primaryIdByN = new Map();
      const mergedToPrimary = new Map(); // merged _id string -> primary _id
      for (const [n, slot] of plan.byN) {
        if (slot.primaryOrder === null) continue;
        const pid = idByOrder.get(slot.primaryOrder);
        primaryIdByN.set(n, pid);
        slot.mergedOrders.forEach((o) => mergedToPrimary.set(sid(idByOrder.get(o)), pid));
      }
      const createNs = target.filter((t) => !primaryIdByN.has(t.n)).map((t) => t.n);

      // Live lessons must be originals or this import's own new lessons, nothing else.
      const originalIds = new Set([...ident.pairs.map((p) => sid(p.doc._id)), ...hiddenDocs.map((d) => sid(d._id))]);
      const liveById = new Map(liveLessons.map((l) => [sid(l._id), l]));
      const strangers = liveLessons.filter((l) => !originalIds.has(sid(l._id)) &&
        !(String(l.notesPdfPublicId || '').startsWith(LESSON_KEY_PREFIX) && targetNames.has(l.subtopicName) && createNs.includes(plan.byName.get(l.subtopicName).n)));
      if (strangers.length) {
        strangers.forEach((l) => console.log(`  ERROR unexpected lesson ${l._id} "${l.title}" (${l.subtopicName || 'no subtopic'})`));
        throw new Error('The subject has lessons that are neither original lessons nor created by this import; nothing was changed.');
      }

      // Lesson table
      console.log(`\nOld lessons -> new lessons (${ident.pairs.length}):`);
      const primarySeen = new Map(); // n -> running copy of the primary's video keys for merge accounting
      let videosMoved = 0, videosDup = 0;
      const lostVideos = [];
      const sortedPairs = [...ident.pairs].sort((a, b) => a.entry.order - b.entry.order);
      for (const { doc, entry } of sortedPairs) {
        const r = roleById.get(sid(doc._id));
        const t = target[r.newN - 1];
        const live = liveById.get(sid(doc._id));
        const rename = entry.subtopicName === t.name ? '' : `  "${entry.subtopicName}" -> "${t.name}"`;
        if (r.role === 'PRIMARY') {
          const base = live || doc;
          primarySeen.set(r.newN, { videoEmbedId: base.videoEmbedId, videos: [...(base.videos || [])] });
          console.log(`  old ${String(entry.order).padStart(3)} -> n ${String(t.n).padStart(3)} ${t.code.padEnd(6)} PRIMARY  keeps ${lessonVideoKeys(base).size} video(s)${live ? '' : ' (GONE?)'}${rename || '  "' + t.name + '"'}`);
        } else {
          let txt;
          if (!live) txt = 'already merged and deleted';
          else {
            const p = primarySeen.get(r.newN);
            const vm = planVideoMerge(p, [live]);
            p.videos.push(...vm.add);
            videosMoved += vm.add.length; videosDup += vm.dup; lostVideos.push(...vm.lost);
            txt = `+${vm.add.length} video(s) moved${vm.dup ? `, ${vm.dup} duplicate(s) skipped` : ''}${vm.lost.length ? `, ${vm.lost.length} non YouTube videoUrl NOT movable` : ''}`;
          }
          console.log(`  old ${String(entry.order).padStart(3)} -> n ${String(t.n).padStart(3)} ${t.code.padEnd(6)} MERGED   ${txt}${rename}`);
        }
      }
      const willHaveVideo = [...primarySeen.values()].filter((p) => lessonVideoKeys(p).size > 0).length;
      console.log(`  ${primaryIdByN.size} primary lessons kept (${willHaveVideo} with video), ${mergedToPrimary.size} merged (${videosMoved} video(s) moved, ${videosDup} duplicate(s) skipped), ${createNs.length} to create, final lesson count ${primaryIdByN.size + createNs.length}.`);
      lostVideos.forEach((x) => console.log(`  WARN merged lesson ${x.lessonId} has a non YouTube videoUrl that the videos list cannot hold: ${x.videoUrl}`));
      const existingCreated = liveLessons.filter((l) => !originalIds.has(sid(l._id)));
      console.log(`  to create (${createNs.length}${existingCreated.length ? `, ${existingCreated.length} already created by an earlier run` : ''}): ` +
        createNs.map((n) => target[n - 1].code).join(', '));
      if (primaryIdByN.size + createNs.length !== EXPECTED_LESSONS) throw new Error(`Plan does not produce ${EXPECTED_LESSONS} lessons; nothing was changed.`);
      summary.lessons.plan = { primary: primaryIdByN.size, merged: mergedToPrimary.size, create: createNs.length, final: primaryIdByN.size + createNs.length, videosMoved, withVideo: willHaveVideo };

      // 5. Progress and reference plan (read only)
      const entries = await TimetableEntry.find({ subjectId: subject._id }).lean();
      const classes = await LiveClass.find({
        $or: [
          { timetableEntryId: { $in: entries.map((e) => e._id) } },
          { subject: new RegExp('^\\s*' + escRe(subject.subjectName) + '\\s*$', 'i'), curriculum: subject.curriculum },
        ],
      }).select('title scheduledAt status syllabusTopicName syllabusSubtopicName preparationLessonId lessonPinned timetableEntryId assignedStudents recordings teacherId').lean();
      const nOfLessonId = (id) => {
        if (!id) return null;
        const p = mergedToPrimary.get(sid(id));
        const r = roleById.get(sid(p || id));
        if (r) return r.newN;
        const l = liveById.get(sid(id));
        return l && plan.byName.get(l.subtopicName) ? plan.byName.get(l.subtopicName).n : null;
      };
      const cls = { rename: 0, topicOnly: 0, repoint: 0, link: 0, fuzzy: 0, disagree: [], unmatched: new Map(), empty: 0, otherLink: 0 };
      const classOps = [];
      for (const c of classes) {
        const name = c.syllabusSubtopicName;
        const r = name ? resolveName(plan, name) : null;
        const set = {};
        if (r) {
          const tt = plan.byName.get(r.name);
          if (r.name !== name) set.syllabusSubtopicName = r.name;
          if (c.syllabusTopicName !== tt.topicName) set.syllabusTopicName = tt.topicName;
          if (r.fuzzy) cls.fuzzy++;
        } else if (name) cls.unmatched.set(name, (cls.unmatched.get(name) || 0) + 1);
        else cls.empty++;
        let prep = null;
        if (c.preparationLessonId && mergedToPrimary.has(sid(c.preparationLessonId))) { prep = { repointTo: mergedToPrimary.get(sid(c.preparationLessonId)) }; cls.repoint++; }
        else if (!c.preparationLessonId && r) { prep = { linkN: plan.byName.get(r.name).n }; cls.link++; }
        else if (c.preparationLessonId && nOfLessonId(c.preparationLessonId) === null) cls.otherLink++;
        const linkedN = nOfLessonId(c.preparationLessonId);
        if (r && linkedN !== null && linkedN !== plan.byName.get(r.name).n) cls.disagree.push(c);
        if (set.syllabusSubtopicName) cls.rename++; else if (set.syllabusTopicName) cls.topicOnly++;
        if (Object.keys(set).length || prep) classOps.push({ c, set, prep });
      }
      console.log('\nProgress and references:');
      console.log(`  classes for the subject: ${classes.length}; subtopic renamed ${cls.rename}, topic name corrected only ${cls.topicOnly}, repointed from a merged lesson ${cls.repoint}, linked (no lesson before) ${cls.link}, matched by spelling only ${cls.fuzzy}, no name (left alone) ${cls.empty}`);
      if (cls.otherLink) console.log(`  WARN ${cls.otherLink} class(es) link to a lesson that is not on this subject; left alone.`);
      cls.disagree.slice(0, 10).forEach((c) => console.log(`  WARN class ${c._id} is linked to lesson n ${nOfLessonId(c.preparationLessonId)} but stamped "${c.syllabusSubtopicName}" (n ${plan.byName.get(resolveName(plan, c.syllabusSubtopicName).name).n}); the link is kept.`));
      if (cls.disagree.length > 10) console.log(`  ... ${cls.disagree.length - 10} more such classes`);
      for (const [name, k] of cls.unmatched) console.log(`  UNMATCHED class subtopic "${name}" x${k} (left as it is; add it to migration.extraRenames to map it)`);

      const ssp = await StudentSyllabusProgress.find({ subjectId: subject._id }).lean();
      const sspOps = [], sspUnmatched = [];
      const sspFinalKey = new Set();
      ssp.forEach((p) => { const r = resolveName(plan, p.syllabusSubtopicName); if (!r || !r.changed) sspFinalKey.add(`${p.studentId}|${r ? r.name : p.syllabusSubtopicName}`); });
      for (const p of ssp) {
        const r = resolveName(plan, p.syllabusSubtopicName);
        if (!r) { sspUnmatched.push(p); continue; }
        const topic = plan.byName.get(r.name).topicName;
        if (!r.changed && p.syllabusTopicName === topic) continue;
        const k = `${p.studentId}|${r.name}`;
        const merge = r.changed && sspFinalKey.has(k);
        sspFinalKey.add(k);
        sspOps.push({ p, name: r.name, topic, merge });
      }
      console.log(`  syllabus progress records: ${ssp.length}; renamed ${sspOps.filter((o) => !o.merge && o.p.syllabusSubtopicName !== o.name).length}, topic name corrected ${sspOps.filter((o) => o.p.syllabusSubtopicName === o.name).length}, merged into an existing record ${sspOps.filter((o) => o.merge).length}, unmatched ${sspUnmatched.length}`);
      sspOps.forEach((o) => console.log(o.p.syllabusSubtopicName === o.name
        ? `    progress ${o.p._id}: "${o.name}" (topic name corrected to "${o.topic}")`
        : `    progress ${o.p._id}: "${o.p.syllabusSubtopicName}" -> "${o.name}"${o.merge ? ' (merged into the existing record)' : ''}`));
      sspUnmatched.forEach((p) => console.log(`  UNMATCHED progress ${p._id} "${p.syllabusSubtopicName}"`));

      const questions = await Question.find({ subject: subject.subjectName, curriculum: subject.curriculum }).select('subtopic topicRef lessonCode').lean();
      const qOps = [], qUnmatched = new Map();
      let qUntagged = 0;
      for (const q of questions) {
        if (!q.subtopic) { qUntagged++; continue; }
        const r = resolveName(plan, q.subtopic);
        if (!r) { qUnmatched.set(q.subtopic, (qUnmatched.get(q.subtopic) || 0) + 1); continue; }
        const tt = plan.byName.get(r.name);
        const liveTid = spineCurrent ? sid((liveFlat.find((f) => f.name === r.name) || {}).topicId) : null;
        const willChange = q.subtopic !== r.name || (q.lessonCode && q.lessonCode !== tt.code) || (q.topicRef && sid(q.topicRef) !== liveTid);
        if (willChange) qOps.push({ q, name: r.name, code: tt.code, topicName: tt.topicName });
      }
      const otherCurrQ = await Question.countDocuments({ subject: subject.subjectName, curriculum: { $ne: subject.curriculum }, curricula: subject.curriculum, subtopic: { $in: [...plan.renames.keys()].filter((k) => plan.renames.get(k) !== k) } });
      console.log(`  questions (${subject.subjectName} / ${subject.curriculum}): ${questions.length}; to update ${qOps.length} (subtopic renamed ${qOps.filter((o) => o.q.subtopic !== o.name).length}, topicRef moved to the new topic ${qOps.filter((o) => o.q.topicRef).length}), untagged ${qUntagged} (left alone), unmatched ${[...qUnmatched.values()].reduce((a, b) => a + b, 0)}`);
      qOps.forEach((o) => console.log(`    question ${o.q._id}: "${o.q.subtopic}"${o.q.subtopic !== o.name ? ` -> "${o.name}"` : ''}${o.q.lessonCode && o.q.lessonCode !== o.code ? ` (lessonCode ${o.q.lessonCode} -> ${o.code})` : ''}${o.q.topicRef ? ' (topicRef -> new topic)' : ''}`));
      for (const [name, k] of qUnmatched) console.log(`  UNMATCHED question subtopic "${name}" x${k}`);
      if (otherCurrQ) console.log(`  WARN ${otherCurrQ} question(s) of another primary curriculum also list ${subject.curriculum} and carry an old name; left alone.`);

      const ttOps = [];
      const ttUnknown = [];
      for (const e of entries) {
        const tpo = remapTopicPlanOrder(e.topicPlanOrder || [], plan);
        const lo = remapIdArray(e.lessonOrder || [], mergedToPrimary);
        tpo.unknown.forEach((k) => ttUnknown.push(`${e._id}: "${k}"`));
        const derive = !(e.lessonOrder || []).length && tpo.keys.length;
        if (tpo.changed || lo.changed || derive) ttOps.push({ e, tpo, lo, derive });
      }
      console.log(`  timetable entries for the subject: ${entries.length}; lesson plan changed on ${ttOps.length} (topicPlanOrder renamed ${ttOps.filter((o) => o.tpo.changed).length}, lessonOrder repointed ${ttOps.filter((o) => o.lo.changed).length}, lessonOrder derived ${ttOps.filter((o) => o.derive).length})`);
      ttUnknown.forEach((k) => console.log(`  UNMATCHED timetable plan key ${k} (kept)`));

      const lpMerged = await LessonProgress.find({ lessonId: { $in: [...mergedToPrimary.keys()].map((x) => new mongoose.Types.ObjectId(x)) } }).lean();
      console.log(`  mastery records on merged lessons to repoint: ${lpMerged.length}`);
      const sspDoneNames = ssp.filter((p) => p.status === 'Done').map((p) => ({ p, r: resolveName(plan, p.syllabusSubtopicName) })).filter((x) => x.r);
      console.log(`  syllabus progress marks to mirror as lesson mastery: ${flag('SKIP_MASTERY') ? 'skipped (SKIP_MASTERY)' : sspDoneNames.length + ' candidate(s) (existing ones are kept)'}`);
      const recCands = [];
      for (const c of classes) for (const rec of c.recordings || []) if (rec.featured && rec.url) recCands.push({ c, rec });
      console.log(`  published class recordings to keep attached to lesson videos: ${flag('SKIP_RECORDINGS') ? 'skipped (SKIP_RECORDINGS)' : recCands.length + ' candidate(s) (already attached ones are skipped)'}`);
      summary.migration.plan = {
        classesRenamed: cls.rename, classesTopicOnly: cls.topicOnly, classesRepointed: cls.repoint, classesLinked: cls.link,
        progressChanged: sspOps.length, questionsChanged: qOps.length, timetableEntriesChanged: ttOps.length, masteryRepoint: lpMerged.length,
      };
      summary.unmatched = {
        classes: Object.fromEntries(cls.unmatched), progress: sspUnmatched.map((p) => p.syllabusSubtopicName),
        questions: Object.fromEntries(qUnmatched), timetableKeys: ttUnknown.length, spine: (summary.spine.unmapped || []),
      };

      // 6. Lesson notes -> R2 (no DB writes yet)
      console.log(`\nLesson notes -> R2 (${LESSON_KEY_PREFIX}):`);
      const lessonState = [];
      let up = 0, skip = 0, fail = 0, probedBad = 0, dryUploads = 0;
      for (const l of manifest.lessons) {
        if (stopRequested) break;
        const key = LESSON_KEY_PREFIX + l.fileName;
        const tag = `[${String(l.n).padStart(3)}/${manifest.lessons.length}] ${l.code.padEnd(6)} ${l.title.slice(0, 50)}`;
        try {
          const h = await head(key);
          if (isCurrent(h, l.bytes, l.sha256)) { skip++; lessonState.push({ l, key, ok: true }); if (!DRY) console.log(`${tag}  already in R2`); continue; }
          const id = parseDriveId(l.driveId);
          if (DRY) {
            // One line per problem only; the totals follow the loop.
            if (!id) console.log(`${tag}  Drive id missing`);
            else if (env('PROBE') !== '0') { const pr = await probeDrive(id, { expectedBytes: l.bytes, stopSignal: stopController.signal }); if (!pr.ok) { probedBad++; console.log(`${tag}  Drive PROBLEM: ${pr.detail}`); } }
            dryUploads++;
            lessonState.push({ l, key, ok: true });
            continue;
          }
          const buf = await fetchDrive(id, { expectedBytes: l.bytes, expectedSha: l.sha256, expectPdf: true, stopSignal: stopController.signal, log: (s) => console.log(s) });
          await withRetry('upload', () => r2.send(new S3.PutObjectCommand({
            Bucket: BUCKET, Key: key, Body: buf, ContentLength: buf.length,
            ContentType: 'application/pdf', ContentDisposition: 'inline',
            Metadata: { sha256: sha256(buf) },
          })));
          up++;
          lessonState.push({ l, key, ok: true });
          console.log(`${tag}  uploaded ${fmtMB(buf.length)}`);
        } catch (e) {
          if (e instanceof StopRequested) break;
          fail++;
          lessonState.push({ l, key, ok: false, error: e.message });
          console.log(`${tag}  FAILED: ${e.message}`);
        }
      }
      if (DRY) console.log(`  ${skip} already in R2, ${dryUploads} would be uploaded${env('PROBE') !== '0' ? `; Drive probes: ${dryUploads - probedBad} OK, ${probedBad} problem(s)` : ' (Drive not probed)'}`);
      summary.lessons.r2 = { uploaded: up, alreadyThere: skip, failed: fail, probeProblems: probedBad, ...(DRY ? { wouldUpload: dryUploads } : {}) };
      checkStop();

      const failed = lessonState.filter((s) => !s.ok);
      if (failed.length || lessonState.length !== manifest.lessons.length) {
        summary.warnings.push(`${failed.length} lesson upload(s) failed; nothing was written to Mongo. Fix and re-run.`);
        console.log(`\n${failed.length} upload(s) failed; skipping every Mongo write for lessons, spine and progress. Re-run to resume.`);
      } else if (DRY) {
        console.log('\nDry run: the Mongo migration above would run now, then the booklet step.');
        lessonsOk = true;
      } else {
        // 7. Mongo migration block
        console.log('\nMigrating (Mongo):');
        inCriticalSection = true;
        const counts = {};
        const snapshot = async (coll, docs, fields) => {
          if (!docs.length) return;
          const ops = docs.map((d) => ({
            updateOne: {
              filter: { _id: `${coll}:${d._id}` },
              update: { $setOnInsert: { coll, docId: d._id, before: Object.fromEntries(fields.map((f) => [f, d[f] === undefined ? null : d[f]])), at: new Date() } },
              upsert: true,
            },
          }));
          for (let i = 0; i < ops.length; i += 500) await db.collection(CBK).bulkWrite(ops.slice(i, i + 500), { ordered: false });
        };

        // 7a. Lessons backup, once
        if (!bkCount && !originals.length) {
          console.log('  no original lessons on the subject: nothing to back up');
        } else if (!bkCount) {
          await db.collection(BK).insertMany(originals.map((d) => ({ ...d })), { ordered: true });
          const n = await db.collection(BK).countDocuments({});
          if (n !== originals.length) throw new Error(`Backup ${BK} has ${n} docs after insert, expected ${originals.length}.`);
          console.log(`  backed up ${n} original lessons to ${BK}`);
          originals.forEach((d) => { if (roleById.get(sid(d._id))) console.log(`    old notes kept in R2: ${roleById.get(sid(d._id)).entry.order} ${d.notesPdfPublicId || ''} ${d.notesPdfUrl || ''}`); });
        } else console.log(`  lessons backup ${BK} already present (${bkCount})`);

        // 7b. Spine, exactly as POST /api/syllabus/bulk
        if (!spineCurrent) {
          const existing = await SyllabusTopic.find({ subjectId: subject._id }).lean();
          if (existing.length) {
            const b = await SpineBackup.create({
              subjectId: subject._id, subjectName: subject.subjectName, curriculum: subject.curriculum,
              topics: existing, replacedBy: author._id, reason: manifest.spine.sourceSyllabus || 'bulk load',
            });
            console.log(`  spine backed up: SpineBackup ${b._id} (restore with POST /api/syllabus/restore/${b._id})`);
          }
          await SyllabusTopic.deleteMany({ subjectId: subject._id });
          const created = await SyllabusTopic.insertMany(buildSpineDocs(subject, manifest.spine));
          console.log(`  spine replaced: ${existing.length} topic(s) -> ${created.length} topics, ${target.length} subtopics`);
        }
        const nowTopics = await SyllabusTopic.find({ subjectId: subject._id }).sort({ topicOrder: 1 }).lean();
        if (spineSignature(nowTopics) !== targetSig) throw new Error('The live spine does not equal the new spine after the replace. Stop and inspect.');
        const topicIdOf = new Map();
        flattenTopics(nowTopics).forEach((f) => topicIdOf.set(f.name, f.topicId));

        const lessonSet = (t, key) => ({
          subjectId: subject._id, curriculum: subject.curriculum, topicRef: topicIdOf.get(t.name), subtopicName: t.name,
          title: t.name.slice(0, 200), order: t.n, termIndex: manifest.lessons[t.n - 1].term || 1,
          notesPdfUrl: publicUrl(key), notesPdfPublicId: key, status: 'published',
        });
        const keyOfN = (n) => LESSON_KEY_PREFIX + manifest.lessons[n - 1].fileName;

        // Skip writes that would change nothing, so a re-run does not even touch updatedAt.
        const differs = (doc, set) => !doc || Object.keys(set).some((k) => sid(doc[k]) !== sid(set[k]));

        // 7c. Primaries in place
        let pUpd = 0, pSame = 0;
        for (const [n, pid] of primaryIdByN) {
          const t = target[n - 1];
          const set = lessonSet(t, keyOfN(n));
          const cur = liveById.get(sid(pid));
          if (differs(cur, set)) { await Lesson.updateOne({ _id: pid, subjectId: subject._id }, { $set: set }, { runValidators: true }); pUpd++; } else pSame++;
          await Lesson.collection.updateOne({ _id: pid, topicName: { $ne: t.topicName } }, { $set: { topicName: t.topicName } });
        }
        console.log(`  primary lessons updated in place: ${pUpd}${pSame ? `, ${pSame} already current` : ''}`);

        // 7d. Merges: videos to primary, repoint references, then delete
        let mMoved = 0, mDeleted = 0, mClasses = 0, mEntries = 0, mLP = 0;
        for (const [mId, pid] of mergedToPrimary) {
          const m = await Lesson.collection.findOne({ _id: new mongoose.Types.ObjectId(mId) });
          const mOid = new mongoose.Types.ObjectId(mId);
          if (m) {
            const p = await Lesson.collection.findOne({ _id: pid });
            const vm = planVideoMerge(p, [m]);
            const add = vm.add.map((v) => (v._id ? v : { _id: new mongoose.Types.ObjectId(), ...v }));
            if (add.length) { await Lesson.collection.updateOne({ _id: pid }, { $push: { videos: { $each: add } } }); mMoved += add.length; }
          }
          const cl = await LiveClass.find({ preparationLessonId: mOid }).select('preparationLessonId syllabusSubtopicName syllabusTopicName').lean();
          await snapshot('liveclasses', cl, ['preparationLessonId', 'syllabusSubtopicName', 'syllabusTopicName']);
          mClasses += (await LiveClass.updateMany({ preparationLessonId: mOid }, { $set: { preparationLessonId: pid } }, { timestamps: false })).modifiedCount;
          const te = await TimetableEntry.find({ lessonOrder: mOid }).lean();
          await snapshot('timetableentries', te, ['lessonOrder', 'topicPlanOrder']);
          for (const e of te) { await TimetableEntry.updateOne({ _id: e._id }, { $set: { lessonOrder: remapIdArray(e.lessonOrder, mergedToPrimary).ids } }, { timestamps: false }); mEntries++; }
          const lps = await LessonProgress.find({ lessonId: mOid }).lean();
          await snapshot('lessonprogresses', lps, ['lessonId', 'studentId', 'subjectId', 'mastered', 'masteredAt', 'masteredBy', 'teacherNotes']);
          for (const lp of lps) {
            const clash = await LessonProgress.findOne({ studentId: lp.studentId, lessonId: pid }).lean();
            if (clash) await LessonProgress.deleteOne({ _id: lp._id }); else await LessonProgress.updateOne({ _id: lp._id }, { $set: { lessonId: pid } });
            mLP++;
          }
          if (m) { await Lesson.collection.deleteOne({ _id: mOid, subjectId: subject._id }); mDeleted++; }
        }
        console.log(`  merged lessons: ${mDeleted} deleted after moving ${mMoved} video(s); repointed ${mClasses} class(es), ${mEntries} timetable entr(ies), ${mLP} mastery record(s)`);

        // 7e. New lessons
        let created = 0, unchangedNew = 0;
        for (const n of createNs) {
          const t = target[n - 1];
          const set = lessonSet(t, keyOfN(n));
          delete set.title;
          const cur = liveLessons.find((l) => l.subtopicName === t.name && !originalIds.has(sid(l._id)));
          if (differs(cur, set)) {
            const r = await Lesson.updateOne(
              { subjectId: subject._id, subtopicName: t.name },
              { $set: set, $setOnInsert: { title: t.name.slice(0, 200), description: `Smartious course notes, lesson ${t.n} of ${target.length} (${t.code}), ${t.topicName}.`.slice(0, 2000), teacherId: author._id } },
              { upsert: true, runValidators: true, setDefaultsOnInsert: true });
            if (r.upsertedCount) created++; else unchangedNew++;
          } else unchangedNew++;
          await Lesson.collection.updateOne({ subjectId: subject._id, subtopicName: t.name, topicName: { $ne: t.topicName } }, { $set: { topicName: t.topicName } });
        }
        console.log(`  new lessons: ${created} created, ${unchangedNew} already there`);

        // 7f. Final lesson set
        const finalLessons = await Lesson.collection.find({ subjectId: subject._id, notesPdfPublicId: { $regex: '^' + escRe(LESSON_KEY_PREFIX) } }).project({ subtopicName: 1, videos: 1, videoEmbedId: 1, notesPdfPublicId: 1 }).toArray();
        const idByName = new Map(finalLessons.map((l) => [l.subtopicName, l._id]));
        const finalOk = finalLessons.length === EXPECTED_LESSONS && idByName.size === EXPECTED_LESSONS &&
          target.every((t) => idByName.has(t.name)) && finalLessons.every((l) => String(l.notesPdfPublicId || '').startsWith(LESSON_KEY_PREFIX));
        console.log(`  lessons with the new notes now: ${finalLessons.length}, one per new subtopic: ${finalOk ? 'yes' : 'NO'}`);
        if (!finalOk) throw new Error(`Final lesson set is not exactly the ${EXPECTED_LESSONS} new lessons. Stop and inspect (re-running is safe).`);
        if (hiddenDocs.length) {
          const hid = await Lesson.collection.updateMany({ _id: { $in: hiddenDocs.map((d) => d._id) }, status: { $ne: 'draft' } }, { $set: { status: 'draft' } });
          console.log(`  old lessons with no new subtopic set to draft: ${hid.modifiedCount} of ${hiddenDocs.length}`);
        }
        const lidOfN = (n) => idByName.get(target[n - 1].name);

        // 7g. Classes: rename stamps, repoint merged links, link unlinked ones
        await snapshot('liveclasses', classOps.map((o) => o.c), ['preparationLessonId', 'syllabusSubtopicName', 'syllabusTopicName']);
        let cRen = 0, cLinked = 0;
        for (const { c, set, prep } of classOps) {
          if (Object.keys(set).length) cRen += (await LiveClass.updateOne({ _id: c._id }, { $set: set }, { timestamps: false })).modifiedCount;
          if (prep && prep.linkN) {
            cLinked += (await LiveClass.updateOne({ _id: c._id, $or: [{ preparationLessonId: null }, { preparationLessonId: { $exists: false } }] },
              { $set: { preparationLessonId: lidOfN(prep.linkN) } }, { timestamps: false })).modifiedCount;
          }
        }
        // Belt and braces: nothing may still point at a merged lesson.
        let cRepoint = 0;
        for (const [mId, pid] of mergedToPrimary) {
          cRepoint += (await LiveClass.updateMany({ preparationLessonId: new mongoose.Types.ObjectId(mId) }, { $set: { preparationLessonId: pid } }, { timestamps: false })).modifiedCount;
        }
        const cDone = cRen + cLinked + cRepoint;
        console.log(`  classes: ${cRen} renamed, ${cLinked} linked to their lesson${cRepoint ? `, ${cRepoint} more repointed` : ''}`);

        // 7h. Syllabus progress (unique on student + subject + subtopic: merge, never duplicate)
        await snapshot('studentsyllabusprogresses', sspOps.map((o) => o.p), ['syllabusSubtopicName', 'syllabusTopicName', 'markedAt', 'markedBy', 'notes', 'status']);
        let sRen = 0, sMerged = 0;
        for (const o of sspOps) {
          const clash = o.p.syllabusSubtopicName !== o.name
            ? await StudentSyllabusProgress.findOne({ studentId: o.p.studentId, subjectId: subject._id, syllabusSubtopicName: o.name }).lean()
            : null;
          if (clash) {
            const upd = { syllabusTopicName: o.topic };
            if (o.p.markedAt && (!clash.markedAt || new Date(o.p.markedAt) < new Date(clash.markedAt))) { upd.markedAt = o.p.markedAt; upd.markedBy = o.p.markedBy; }
            if (!clash.notes && o.p.notes) upd.notes = o.p.notes;
            await snapshot('studentsyllabusprogresses', [clash], ['syllabusSubtopicName', 'syllabusTopicName', 'markedAt', 'markedBy', 'notes', 'status']);
            await StudentSyllabusProgress.updateOne({ _id: clash._id }, { $set: upd });
            await StudentSyllabusProgress.deleteOne({ _id: o.p._id });
            sMerged++;
          } else {
            sRen += (await StudentSyllabusProgress.updateOne({ _id: o.p._id }, { $set: { syllabusSubtopicName: o.name, syllabusTopicName: o.topic } })).modifiedCount;
          }
        }
        console.log(`  syllabus progress: ${sRen} renamed, ${sMerged} merged`);

        // 7i. Questions
        const qWrites = [];
        for (const o of qOps) {
          const set = {};
          if (o.q.subtopic !== o.name) set.subtopic = o.name;
          const tid = topicIdOf.get(o.name);
          if (o.q.topicRef && sid(o.q.topicRef) !== sid(tid)) set.topicRef = tid;
          if (o.q.lessonCode && o.q.lessonCode !== o.code) set.lessonCode = o.code;
          if (Object.keys(set).length) qWrites.push({ q: o.q, set });
        }
        await snapshot('questions', qWrites.map((w) => w.q), ['subtopic', 'topicRef', 'lessonCode']);
        let qDone = 0;
        for (const w of qWrites) qDone += (await Question.updateOne({ _id: w.q._id }, { $set: w.set }, { timestamps: false })).modifiedCount;
        console.log(`  questions updated: ${qDone}`);

        // 7j. Timetable lesson plans
        const freshEntries = await TimetableEntry.find({ subjectId: subject._id }).lean();
        await snapshot('timetableentries', freshEntries, ['lessonOrder', 'topicPlanOrder']);
        let tDone = 0;
        for (const e of freshEntries) {
          const tpo = remapTopicPlanOrder(e.topicPlanOrder || [], plan);
          const lo = remapIdArray(e.lessonOrder || [], mergedToPrimary);
          const set = {};
          if (tpo.changed) set.topicPlanOrder = tpo.keys;
          if (lo.changed) set.lessonOrder = lo.ids;
          if (!(e.lessonOrder || []).length && tpo.keys.length) {
            const ids = [];
            tpo.keys.forEach((k) => { const id = idByName.get(String(k).split('||').slice(1).join('||')); if (id && !ids.some((x) => sid(x) === sid(id))) ids.push(id); });
            if (ids.length) set.lessonOrder = ids;
          }
          if (Object.keys(set).length) { await TimetableEntry.updateOne({ _id: e._id }, { $set: set }, { timestamps: false }); tDone++; }
        }
        console.log(`  timetable entries updated: ${tDone}`);

        // 7k. Any mastery record still on a merged lesson (crash safety)
        const strayLP = await LessonProgress.countDocuments({ lessonId: { $in: [...mergedToPrimary.keys()].map((x) => new mongoose.Types.ObjectId(x)) } });
        if (strayLP) summary.warnings.push(`${strayLP} LessonProgress record(s) still point at merged lessons.`);

        // 7l. Mirror syllabus progress marks as lesson mastery
        let mastered = 0;
        if (!flag('SKIP_MASTERY')) {
          const marks = await StudentSyllabusProgress.find({ subjectId: subject._id, status: 'Done' }).lean();
          // Raw driver: Model.bulkWrite would add $set updatedAt and touch existing records on every run.
          const nowTs = new Date();
          const ops = marks.filter((p) => idByName.has(p.syllabusSubtopicName)).map((p) => ({
            updateOne: {
              filter: { studentId: p.studentId, lessonId: idByName.get(p.syllabusSubtopicName) },
              update: { $setOnInsert: {
                studentId: p.studentId, lessonId: idByName.get(p.syllabusSubtopicName), subjectId: subject._id, mastered: true,
                masteredAt: p.markedAt || p.updatedAt || nowTs, masteredBy: p.markedBy || author._id, teacherNotes: p.notes || '',
                createdAt: nowTs, updatedAt: nowTs, __v: 0,
              } },
              upsert: true,
            },
          }));
          for (let i = 0; i < ops.length; i += 500) mastered += (await LessonProgress.collection.bulkWrite(ops.slice(i, i + 500), { ordered: false })).upsertedCount || 0;
        }
        console.log(`  mastery records added: ${mastered}`);

        // 7m. Published class recordings onto their lesson's videos (classroom.js shape and dedupe)
        let recAttached = 0;
        if (!flag('SKIP_RECORDINGS')) {
          const recClasses = await LiveClass.find({ _id: { $in: recCands.map((x) => x.c._id) } }).select('preparationLessonId syllabusSubtopicName title teacherId recordings').lean();
          for (const c of recClasses) {
            const lid = c.preparationLessonId && finalLessons.some((l) => sid(l._id) === sid(c.preparationLessonId)) ? c.preparationLessonId : idByName.get(c.syllabusSubtopicName);
            if (!lid) continue;
            for (const rec of c.recordings || []) {
              if (!rec.featured || !rec.url) continue;
              const cur = await Lesson.findById(lid).select('videos').lean();
              if ((cur && cur.videos || []).some((v) => v.source === 'recording' && v.r2Url === rec.url)) continue;
              recAttached += (await Lesson.updateOne({ _id: lid }, { $push: { videos: {
                source: 'recording', title: rec.title || c.title || 'Recorded class', r2Url: rec.url, r2Key: rec.key || '',
                durationMins: Math.round((rec.durationSec || 0) / 60), liveClassId: c._id, recordedAt: rec.recordedAt || null, createdBy: c.teacherId || null,
              } } })).modifiedCount;
            }
          }
        }
        console.log(`  recordings attached: ${recAttached}`);

        // 7n. Verification
        const after = await Lesson.collection.find({ subjectId: subject._id, status: 'published' }).project({ videos: 1, videoEmbedId: 1 }).toArray();
        const withVideo = after.filter((l) => lessonVideoKeys(l).size > 0).length;
        const dangling = await LiveClass.countDocuments({ preparationLessonId: { $in: [...mergedToPrimary.keys()].map((x) => new mongoose.Types.ObjectId(x)) } });
        console.log(`  check: ${after.length} published lessons, ${withVideo} with video, ${dangling} class(es) still linked to a merged lesson`);
        Object.assign(counts, { primaryUpdated: pUpd, mergedDeleted: mDeleted, videosMoved: mMoved, created, classesUpdated: cDone + mClasses, progressRenamed: sRen, progressMerged: sMerged, questions: qDone, timetable: tDone + mEntries, mastery: mastered, recordings: recAttached, lessons: after.length, withVideo });
        summary.migration.done = counts;
        if (dangling) summary.warnings.push(`${dangling} class(es) still linked to merged lessons.`);
        inCriticalSection = false;
        lessonsOk = true;
        checkStop();
      }
    }

    // 8. Library booklet
    if (manifest.booklet && !flag('SKIP_BOOKLET')) {
      checkStop();
      const b = manifest.booklet;
      const key = `library/${subject.curriculum}/${subject.subjectName}/${BOOKLET_SLUG}.pdf`;
      console.log(`\nLibrary booklet -> ${key}`);
      const book = await LibraryBook.findOne({ r2Key: key }).select('_id title isActive').lean();
      if (book) {
        console.log(`  already in the library (${book._id}, ${book.isActive ? 'active' : 'inactive'}); skipped.`);
        summary.booklet = { status: 'exists', id: String(book._id) };
      } else {
        const others = await LibraryBook.find({}).select('title r2Key').lean();
        const dup = others.find((x) => normTitle(x.title) === normTitle(b.title));
        if (dup) {
          console.log(`  ERROR a different book already has this title ("${dup.title}", ${dup._id}, ${dup.r2Key}); booklet skipped.`);
          summary.booklet = { status: 'title clash', id: String(dup._id) };
        } else {
          const h = await head(key);
          const pdfReady = isCurrent(h, b.bytes, b.sha256) && h.sha256 === b.sha256;
          if (pdfReady) console.log('  PDF already in R2 (size and sha256 match).');
          else if (DRY) {
            console.log(`  would multipart upload ${fmtMB(b.bytes)} in ${b.parts.length} parts`);
            if (env('PROBE') !== '0') {
              for (const [i, p] of b.parts.entries()) {
                const id = parseDriveId(p.driveId);
                if (!id) { console.log(`    part ${i + 1}: Drive id missing`); continue; }
                const pr = await probeDrive(id, { expectedBytes: p.bytes, expectPdf: i === 0, stopSignal: stopController.signal });
                console.log(`    part ${i + 1}: Drive ${pr.ok ? 'OK' : 'PROBLEM'}: ${pr.detail}`);
              }
            }
          } else {
            await multipartUpload(key, b);
          }
          const png = Buffer.from(manifest.coverPngBase64, 'base64');
          const ch = await head(COVER_KEY);
          if (ch && ch.size === png.length) console.log('  cover already in R2.');
          else if (DRY) console.log(`  would upload cover ${COVER_KEY} (${png.length} bytes)`);
          else {
            await withRetry('cover', () => r2.send(new S3.PutObjectCommand({ Bucket: BUCKET, Key: COVER_KEY, Body: png, ContentType: 'image/png', ContentDisposition: 'inline' })));
            console.log('  cover uploaded.');
          }
          const record = {
            title: b.title, description: BOOKLET_DESCRIPTION, author: BOOKLET_AUTHOR,
            section: 'coursebook', shelf: 'academic',
            subjectId: subject._id, subjectName: subject.subjectName, curriculum: subject.curriculum, grades: BOOKLET_GRADES,
            r2Key: key, url: publicUrl(key), coverUrl: publicUrl(COVER_KEY), coverImage: publicUrl(COVER_KEY), coverR2Key: COVER_KEY,
            fileName: b.fileName, sizeBytes: b.bytes, mimeType: 'application/pdf',
            uploadedBy: author._id, uploadedByName: authorName, isActive: true,
          };
          if (DRY) {
            console.log(`  would create LibraryBook "${record.title}" (${record.section}, ${record.shelf}, grades ${record.grades.join(' / ')}, ${fmtMB(record.sizeBytes)})`);
            summary.booklet = { status: 'would create' };
          } else {
            checkStop();
            const created = await LibraryBook.create(record);
            console.log(`  LibraryBook created ${created._id}`);
            summary.booklet = { status: 'created', id: String(created._id) };
          }
        }
      }
    }

    async function multipartUpload(key, b) {
      // Clear stale uploads from a crashed run (the hash cannot be resumed mid file).
      try {
        const lst = await r2.send(new S3.ListMultipartUploadsCommand({ Bucket: BUCKET, Prefix: key }));
        for (const u of lst.Uploads || []) {
          if (u.Key !== key) continue;
          await r2.send(new S3.AbortMultipartUploadCommand({ Bucket: BUCKET, Key: key, UploadId: u.UploadId }));
          console.log(`  aborted a stale multipart upload ${u.UploadId}`);
        }
      } catch (e) { console.log(`  WARN could not list stale multipart uploads (${e.name || e.message}); continuing.`); }

      const { UploadId } = await r2.send(new S3.CreateMultipartUploadCommand({
        Bucket: BUCKET, Key: key, ContentType: 'application/pdf', ContentDisposition: 'inline',
        Metadata: { sha256: b.sha256 },
      }));
      const hash = crypto.createHash('sha256');
      const done = [];
      let completed = false;
      try {
        for (const [i, p] of b.parts.entries()) {
          checkStop();
          let buf = await fetchDrive(parseDriveId(p.driveId), {
            expectedBytes: p.bytes, expectedSha: p.sha256, expectPdf: i === 0,
            stopSignal: stopController.signal, log: (s) => console.log(s),
          });
          if (i === b.parts.length - 1 && !buf.slice(-2048).toString('latin1').includes('%%EOF')) console.log('  WARN last part has no %%EOF marker near its end.');
          hash.update(buf);
          const r = await withRetry(`part ${i + 1}`, () => r2.send(new S3.UploadPartCommand({
            Bucket: BUCKET, Key: key, UploadId, PartNumber: i + 1, Body: buf, ContentLength: buf.length,
          })));
          done.push({ ETag: r.ETag, PartNumber: i + 1 });
          console.log(`  part ${i + 1}/${b.parts.length} uploaded (${fmtMB(buf.length)})`);
          buf = null; // keep about one part in memory
        }
        const digest = hash.digest('hex');
        if (digest !== b.sha256) throw new Error(`booklet sha256 ${digest} does not match the manifest; upload aborted.`);
        checkStop();
        await r2.send(new S3.CompleteMultipartUploadCommand({ Bucket: BUCKET, Key: key, UploadId, MultipartUpload: { Parts: done } }));
        completed = true;
        const h = await head(key);
        if (!h || h.size !== b.bytes) throw new Error(`after upload R2 reports ${h ? h.size : 'no object'}, expected ${b.bytes}.`);
        console.log(`  booklet uploaded and verified (sha256 ${digest.slice(0, 12)}...).`);
      } finally {
        if (!completed) {
          try { await r2.send(new S3.AbortMultipartUploadCommand({ Bucket: BUCKET, Key: key, UploadId })); console.log('  multipart upload aborted.'); }
          catch (e) { console.log(`  WARN abort failed (${e.message}); the next run clears it.`); }
        }
      }
    }
    if (!lessonsOk) process.exitCode = 1;
  } finally {
    // 9. Summary
    console.log('\n──────── Summary ────────');
    console.log(JSON.stringify(summary, null, 2));
    summary.warnings.forEach((w) => console.log('WARN ' + w));
    console.log(`Took ${Math.round((Date.now() - tStart) / 1000)}s.${DRY ? ' Dry run: nothing was written.' : ''}`);
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main()
    .then(() => { if (stopRequested) process.exitCode = 130; })
    .catch((e) => {
      if (e instanceof StopRequested) { console.error('\nStopped. Re-run the same command to resume.'); process.exitCode = 130; return; }
      console.error('\nFAILED:', e.message);
      process.exitCode = 1;
    });
}

module.exports = {
  applyConfig, EXPECTED_LESSONS, LESSON_KEY_PREFIX, parseDriveId, driveDownloadUrl, validateManifest,
  flattenTopics, spineSignature, buildSpineDocs, buildPlan, resolveName, identifyOriginals, lessonVideoKeys,
  planVideoMerge, remapTopicPlanOrder, remapIdArray, extractYouTubeId,
  looksLikeHtml, parseDriveConfirm, checkDriveBody, fetchDrive, probeDrive,
  DriveError, StopRequested, normName, normTitle,
};
