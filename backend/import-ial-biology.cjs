/**
 * import-ial-biology.cjs
 * ============================================================
 * One off maintenance script. Imports the 156 Smartious IAL Biology
 * lesson notes as published Lesson docs on the Edexcel IAL Biology
 * subject, carries existing class progress over from subtopic mode to
 * lesson mode, and adds the complete course notes booklet to the Library.
 *
 * Inputs: ial-biology-manifest.json next to this file (fill every
 * PASTE_DRIVE_ID first; files must be shared "Anyone with the link").
 *
 * Usage (Render shell, from backend/):
 *   DRY_RUN=1 node import-ial-biology.cjs     # read only: validates, probes Drive, prints the plan
 *   node import-ial-biology.cjs               # does it
 *
 * Optional env:
 *   AUTHOR_EMAIL=someone@...   lesson author / library uploader (default: oldest active admin)
 *   SUBJECT_ID=<ObjectId>      pin the Subject if the lookup is ambiguous
 *   FORCE=1                    proceed even if the subject already has lessons not made by this import
 *   SKIP_LESSONS=1             skip lesson upload + lesson DB + progress migration
 *   SKIP_BOOKLET=1             skip the library booklet
 *   SKIP_MASTERY=1             do not mirror syllabus progress marks into LessonProgress
 *   SKIP_RECORDINGS=1          do not attach existing published class recordings to the new lessons
 *   PROBE=0                    in DRY_RUN, do not probe the Drive links
 *   MANIFEST=path.json         use another manifest file
 *
 * Safe to re-run: R2 keys are deterministic (an existing object of the
 * right size is skipped), lessons are upserted by (subjectId, subtopicName),
 * migration steps only fill empty fields, the library record is keyed by
 * its r2Key. Nothing is deleted. Ctrl-C stops after the current step
 * (press twice to force); re-run to resume.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Constants ────────────────────────────────────────────────
const EXPECTED_LESSONS = 156;
const LESSON_KEY_PREFIX = 'lessons/notes/ial-biology/';
const BOOKLET_SLUG = 'ial-biology-complete-course-notes';
const COVER_KEY = `covers/${BOOKLET_SLUG}.png`;
const BOOKLET_AUTHOR = 'Smartious Homeschool';
const BOOKLET_GRADES = ['Year 12 (AS)', 'Year 13 (A2)']; // constants/curriculum.js GRADES_BY_CURRICULUM.EdexcelALevel
const BOOKLET_DESCRIPTION =
  'The complete Smartious course notes for Edexcel International A Level Biology in a single volume. ' +
  'All 156 lessons across Units 1 to 6, from biological molecules and cardiovascular health to ' +
  'respiration, coordination and gene technology, with every core practical and a closing section ' +
  'on exam technique and revision. Organised lesson by lesson to follow the specification and the ' +
  'Smartious lesson plan.';
const DOWNLOAD_RETRIES = 3;
const DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000;
const PLACEHOLDER_RE = /^(|PASTE.*|TODO.*|PART\d*_ID|.*PLACEHOLDER.*|\.\.\.)$/i;

// termIndex: the lesson player and Manage Subject group by termIndex (1..3)
// and the API sorts by { termIndex, order }; the materializer, Lesson Plan
// Manager and curriculum progress sort by order only. termIndex must
// therefore rise with order so every view shows the same sequence.
// Term 1 = AS (Units 1 to 3, Year 12), Term 2 = A2 (Units 4 to 6, Year 13),
// Term 3 = Exam technique and revision.
function termIndexForCode(code) {
  const m = /^U(\d+)\./.exec(String(code || ''));
  if (m) return Number(m[1]) <= 3 ? 1 : 2;
  return 3;
}

// ── Pure helpers (exported for tests) ────────────────────────
class StopRequested extends Error { constructor() { super('Stopped by user (Ctrl-C).'); this.name = 'StopRequested'; } }
class DriveError extends Error {
  constructor(msg, retryable) { super(msg); this.name = 'DriveError'; this.retryable = !!retryable; }
}

function parseDriveId(v) {
  const s = String(v || '').trim();
  if (!s || PLACEHOLDER_RE.test(s)) return null;
  let m = /\/d\/([A-Za-z0-9_-]{10,})/.exec(s) || /[?&]id=([A-Za-z0-9_-]{10,})/.exec(s);
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
      if (l.n !== i + 1) warnings.push(`${at}: n is ${l.n} but position is ${i + 1}.`);
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

/** Flatten SyllabusTopic docs: topicOrder, then subOrder (array order breaks ties). */
function flattenSpine(topics) {
  const warnings = [];
  const sortedTopics = [...topics].sort((a, b) => (a.topicOrder || 0) - (b.topicOrder || 0));
  const flat = [];
  sortedTopics.forEach((t) => {
    const subs = (t.subtopics || []).map((s, ix) => ({ s, ix }));
    const bySub = [...subs].sort((a, b) => ((a.s.subOrder || 0) - (b.s.subOrder || 0)) || (a.ix - b.ix));
    if (bySub.some((x, i) => x.ix !== i)) {
      warnings.push(`Topic "${t.topic}": subOrder differs from stored array order (the timetable uses array order).`);
    }
    if (t.isActive === false) warnings.push(`Topic "${t.topic}" is marked inactive but is still part of the plan.`);
    bySub.forEach(({ s }) => flat.push({
      code: String(s.code || '').trim(), name: s.name, subId: s._id,
      topicId: t._id, topicName: t.topic, position: flat.length + 1,
    }));
  });
  return { flat, warnings };
}

/** Match the flattened spine to manifest lessons BY CODE. */
function matchSpineToManifest(flat, lessons) {
  const errors = [], warnings = [], pairs = [];
  if (flat.length !== EXPECTED_LESSONS) errors.push(`Spine has ${flat.length} subtopics, expected ${EXPECTED_LESSONS}.`);
  const byCode = new Map();
  flat.forEach((f) => {
    if (!f.code) errors.push(`Spine subtopic "${f.name}" has no code.`);
    else if (byCode.has(f.code)) errors.push(`Spine code ${f.code} appears twice.`);
    else byCode.set(f.code, f);
  });
  const names = new Map();
  flat.forEach((f) => {
    if (names.has(f.name)) errors.push(`Spine subtopic name "${f.name}" appears twice (lessons are keyed by name).`);
    names.set(f.name, f);
  });
  const seen = new Set();
  lessons.forEach((l) => {
    const f = byCode.get(l.code);
    if (!f) { errors.push(`Manifest code ${l.code} (lesson ${l.n}) is not in the spine.`); return; }
    seen.add(l.code);
    if (f.name !== l.title) warnings.push(`${l.code}: spine name "${f.name}" differs from manifest title "${l.title}" (the spine name is used).`);
    if (f.position !== l.n) warnings.push(`${l.code}: lesson ${l.n} sits at spine position ${f.position}; order follows n.`);
    if (f.name.length > 200) errors.push(`${l.code}: spine name is longer than 200 characters.`);
    pairs.push({ lesson: l, spine: f });
  });
  flat.forEach((f) => { if (f.code && !seen.has(f.code)) errors.push(`Spine code ${f.code} ("${f.name}") has no manifest lesson.`); });
  return { pairs, errors, warnings };
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
// While true, the first Ctrl-C waits: the Mongo lesson + migration block takes
// seconds, has no network I/O, and should not leave the subject half switched.
let inCriticalSection = false;
const stopController = new AbortController();
const checkStop = () => { if (stopRequested) throw new StopRequested(); };

function installSignalHandlers() {
  const handler = (sig) => {
    if (stopRequested) { console.log(`\n${sig} again: forcing exit. Re-run the script to resume.`); process.exit(130); }
    stopRequested = true;
    stopController.abort();
    console.log(inCriticalSection
      ? `\n${sig} received: finishing the lesson and progress writes first (a few seconds), then stopping. Press again to force.`
      : `\n${sig} received: stopping after the current step (press again to force). Re-run to resume.`);
  };
  process.on('SIGINT', handler);
  process.on('SIGTERM', handler);
}

async function main() {
  const DRY = flag('DRY_RUN');
  const FORCE = flag('FORCE');
  const tStart = Date.now();
  const summary = { lessons: {}, migration: {}, booklet: {}, warnings: [] };
  installSignalHandlers();

  console.log(`IAL Biology import${DRY ? ' (DRY RUN: no writes to R2 or Mongo)' : ''}`);

  // 0. Manifest
  const manifestPath = env('MANIFEST') ? path.resolve(env('MANIFEST')) : path.join(__dirname, 'ial-biology-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const mv = validateManifest(manifest);
  mv.warnings.forEach((w) => console.log('  WARN ' + w));
  if (mv.errors.length) { mv.errors.forEach((e) => console.log('  ERROR ' + e)); throw new Error(`Manifest has ${mv.errors.length} error(s); nothing was changed.`); }
  if (mv.missingDriveIds) {
    const msg = `${mv.missingDriveIds} Drive id(s) are still placeholders.`;
    if (!DRY) throw new Error(msg + ' Fill them in first; nothing was changed.');
    console.log('  WARN ' + msg + ' Those files are not probed.');
  }
  console.log(`Manifest OK: ${manifest.lessons.length} lessons, booklet ${manifest.booklet ? fmtMB(manifest.booklet.bytes) + ' in ' + manifest.booklet.parts.length + ' parts' : 'absent'}.`);

  // Heavy deps are loaded here so the pure helpers can be tested without node_modules.
  require('dotenv').config();
  const mongoose = require('mongoose');
  const S3 = require('@aws-sdk/client-s3');
  const Subject = require('./src/models/Subject');
  const SyllabusTopic = require('./src/models/SyllabusTopic');
  const Lesson = require('./src/models/Lesson');
  const LiveClass = require('./src/models/LiveClass');
  const TimetableEntry = require('./src/models/TimetableEntry');
  const StudentSyllabusProgress = require('./src/models/StudentSyllabusProgress');
  const LessonProgress = require('./src/models/LessonProgress');
  const LibraryBook = require('./src/models/LibraryBook');
  const User = require('./src/models/User');
  const ClassroomSession = require('./src/models/ClassroomSession');

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

  try {
    // 1. Subject + spine
    const want = manifest.subject || { curriculum: 'EdexcelALevel', subjectName: 'Biology' };
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

    const topics = await SyllabusTopic.find({ subjectId: subject._id }).sort({ topicOrder: 1 }).lean();
    const { flat, warnings: spineWarn } = flattenSpine(topics);
    spineWarn.forEach((w) => console.log('  WARN ' + w));
    const match = matchSpineToManifest(flat, manifest.lessons);
    match.warnings.forEach((w) => console.log('  WARN ' + w));
    if (match.errors.length) { match.errors.forEach((e) => console.log('  ERROR ' + e)); throw new Error('Spine and manifest do not line up by code; nothing was changed.'); }
    console.log(`Spine OK: ${topics.length} topics, ${flat.length} subtopics, every code matched.`);
    const pairs = match.pairs.sort((a, b) => a.lesson.n - b.lesson.n);
    const spineByName = new Map(flat.map((f) => [f.name, f]));
    const spineByNorm = new Map();
    flat.forEach((f) => { const k = normName(f.name); spineByNorm.set(k, spineByNorm.has(k) ? null : f); });
    const resolveName = (s) => {
      if (!s) return null;
      const t = String(s).trim();
      if (spineByName.has(t)) return { f: spineByName.get(t), fuzzy: false };
      const f = spineByNorm.get(normName(t));
      return f ? { f, fuzzy: true } : null;
    };

    // 2. Author
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

    // 3. Existing lessons on this subject
    const existing = await Lesson.find({ subjectId: subject._id }).select('subjectId curriculum title subtopicName status order notesPdfUrl notesPdfPublicId topicRef termIndex').lean();
    const ours = existing.filter((l) => String(l.notesPdfPublicId || '').startsWith(LESSON_KEY_PREFIX));
    const foreign = existing.filter((l) => !String(l.notesPdfPublicId || '').startsWith(LESSON_KEY_PREFIX));
    const bySubName = new Map();
    for (const l of existing) {
      const k = l.subtopicName || '';
      if (!k) continue;
      if (bySubName.has(k)) throw new Error(`Two lessons on this subject share subtopicName "${k}" (${bySubName.get(k)._id}, ${l._id}); fix by hand first.`);
      bySubName.set(k, l);
    }
    console.log(`Existing lessons on the subject: ${existing.length} (${ours.length} from this import, ${foreign.length} other).`);
    const skipLessons = flag('SKIP_LESSONS');
    if (foreign.length && !skipLessons) {
      foreign.slice(0, 40).forEach((l) => console.log(`    other: ${l._id} [${l.status}] order ${l.order} "${l.title}"${l.subtopicName ? ' / ' + l.subtopicName : ''}`));
      if (foreign.length > 40) console.log(`    ... and ${foreign.length - 40} more`);
      if (!FORCE) {
        const msg = 'The subject already has lessons that this import did not create. Re-run with FORCE=1 to proceed: ' +
          'ones whose subtopicName matches a spine subtopic are adopted (notes replaced, title and videos kept), the rest are left as they are.';
        if (!DRY) throw new Error(msg + ' Nothing was changed.');
        console.log('  WARN ' + msg + ' A real run would abort here.');
        summary.warnings.push('Foreign lessons present: a real run needs FORCE=1.');
      }
    }
    if (!existing.length) console.log('The subject is currently in SUBTOPIC mode; this import switches it to LESSON mode.');

    // 4. Progress migration plan (read only; expressed by spine name)
    const plan = skipLessons ? null : await planMigration();
    async function planMigration() {
      const now = new Date();
      const entries = await TimetableEntry.find({ subjectId: subject._id }).select('teacherId assignedStudents isActive lessonOrder topicPlanOrder dayOfWeek startTime').lean();
      const entryIds = entries.map((e) => e._id);
      const classes = await LiveClass.find({
        $or: [
          { timetableEntryId: { $in: entryIds } },
          { subject: new RegExp('^\\s*' + escRe(subject.subjectName) + '\\s*$', 'i'), curriculum: subject.curriculum },
        ],
        syllabusSubtopicName: { $nin: [null, ''] },
      }).select('title scheduledAt status syllabusTopicName syllabusSubtopicName preparationLessonId lessonPinned timetableEntryId assignedStudents recordings teacherId').lean();

      const link = [], alreadyOurs = [], linkedElsewhere = [], unmatched = [], fuzzy = [], topicDiffers = [];
      const ourIds = new Set(ours.map((l) => String(l._id)));
      for (const c of classes) {
        const r = resolveName(c.syllabusSubtopicName);
        if (!r) { unmatched.push(c); continue; }
        c._spine = r.f;
        if (r.fuzzy) fuzzy.push(c);
        if (c.syllabusTopicName && c.syllabusTopicName !== r.f.topicName) topicDiffers.push(c);
        if (!c.preparationLessonId) link.push(c);
        else {
          const target = bySubName.get(r.f.name);
          if (target && String(target._id) === String(c.preparationLessonId)) alreadyOurs.push(c);
          else if (ourIds.has(String(c.preparationLessonId))) alreadyOurs.push(c);
          else linkedElsewhere.push(c);
        }
      }

      // Lesson Plan Manager custom order: topicPlanOrder ("Topic||Subtopic") -> lessonOrder (Lesson ids)
      const orders = [];
      for (const e of entries) {
        if (!Array.isArray(e.topicPlanOrder) || !e.topicPlanOrder.length) continue;
        if (Array.isArray(e.lessonOrder) && e.lessonOrder.length) { orders.push({ e, skip: 'already has a lessonOrder' }); continue; }
        const names = [], unknown = [];
        e.topicPlanOrder.forEach((k) => {
          const sub = String(k).split('||').slice(1).join('||');
          const r = resolveName(sub);
          if (r) { if (!names.includes(r.f.name)) names.push(r.f.name); } else unknown.push(k);
        });
        orders.push({ e, names, unknown });
      }

      // StudentSyllabusProgress -> LessonProgress (mastery) and the lesson-mode coverage preview
      const ssp = await StudentSyllabusProgress.find({ subjectId: subject._id, status: 'Done' }).lean();
      const marks = [], sspUnmatched = [];
      ssp.forEach((p) => { const r = resolveName(p.syllabusSubtopicName); if (r) marks.push({ p, name: r.f.name }); else sspUnmatched.push(p); });
      const existingLP = ours.length
        ? await LessonProgress.find({ subjectId: subject._id, lessonId: { $in: ours.map((l) => l._id) } }).select('studentId lessonId').lean()
        : [];
      const lessonIdToName = new Map(ours.map((l) => [String(l._id), l.subtopicName]));
      const haveLP = new Set(existingLP.map((x) => `${x.studentId}|${lessonIdToName.get(String(x.lessonId))}`));
      const mastery = marks.filter((m) => !haveLP.has(`${m.p.studentId}|${m.name}`));

      // Preview of the student lesson plan view (routes/curriculum.js, lesson mode) for marked subtopics.
      const matchedClasses = classes.filter((c) => c._spine && (!c.preparationLessonId || alreadyOurs.includes(c)));
      const pastIds = matchedClasses.filter((c) => new Date(c.scheduledAt) <= now && c.status !== 'cancelled').map((c) => c._id);
      const sess = pastIds.length ? await ClassroomSession.find({ liveClassId: { $in: pastIds } }).select('liveClassId userId present joinCount').lean() : [];
      const attendedSet = new Set(sess.filter((s) => ((s.joinCount || 0) > 0 || s.present === true) && s.present !== false).map((s) => `${s.liveClassId}|${s.userId}`));
      const preview = { attended: 0, missed: 0, scheduled: 0, cancelled: 0, projected: 0 };
      const projectedSample = [];
      for (const m of marks) {
        const sid = String(m.p.studentId);
        const cl = matchedClasses
          .filter((c) => c._spine.name === m.name && (c.assignedStudents || []).some((x) => String(x) === sid))
          .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];
        if (!cl) { preview.projected++; if (projectedSample.length < 8) projectedSample.push(`${sid} / ${m.name}`); continue; }
        if (cl.status === 'cancelled') preview.cancelled++;
        else if (new Date(cl.scheduledAt) > now) preview.scheduled++;
        else if (attendedSet.has(`${cl._id}|${sid}`)) preview.attended++;
        else preview.missed++;
      }

      // Published class recordings to attach to the lessons' videos (what the lesson player shows).
      const recs = [];
      for (const c of matchedClasses) for (const r of c.recordings || []) if (r.featured && r.url) recs.push({ c, r, name: c._spine.name });

      return { entries, classes, link, alreadyOurs, linkedElsewhere, unmatched, fuzzy, topicDiffers, orders, ssp, marks, sspUnmatched, mastery, preview, projectedSample, recs };
    }

    if (plan) {
      const p = plan;
      const fmtC = (c) => `${c._id} ${new Date(c.scheduledAt).toISOString().slice(0, 16)} [${c.status}${c.lessonPinned ? ', pinned' : ''}] "${c.syllabusSubtopicName}"`;
      console.log('\nProgress carry over plan:');
      console.log(`  Timetable entries for the subject: ${p.entries.length}`);
      console.log(`  Classes stamped with a subtopic: ${p.classes.length}`);
      console.log(`    to link (preparationLessonId set): ${p.link.length}` +
        ` (past ${p.link.filter((c) => new Date(c.scheduledAt) <= new Date()).length}, future ${p.link.filter((c) => new Date(c.scheduledAt) > new Date()).length}, pinned ${p.link.filter((c) => c.lessonPinned).length}, cancelled ${p.link.filter((c) => c.status === 'cancelled').length})`);
      p.link.slice(0, 8).forEach((c) => console.log('      ' + fmtC(c)));
      console.log(`    already linked to this import: ${p.alreadyOurs.length}`);
      console.log(`    linked to some other lesson (left alone): ${p.linkedElsewhere.length}`);
      p.linkedElsewhere.slice(0, 5).forEach((c) => console.log('      ' + fmtC(c) + ' -> ' + c.preparationLessonId));
      console.log(`    matched by normalised name only: ${p.fuzzy.length}`);
      p.fuzzy.slice(0, 5).forEach((c) => console.log(`      "${c.syllabusSubtopicName}" -> "${c._spine.name}"`));
      console.log(`    subtopic not in the spine (cannot be carried): ${p.unmatched.length}`);
      p.unmatched.slice(0, 5).forEach((c) => console.log('      ' + fmtC(c)));
      if (p.topicDiffers.length) console.log(`    stamped topic name differs from the spine (subtopic mode did not count these as taught; lesson mode will): ${p.topicDiffers.length}`);
      const conv = p.orders.filter((o) => !o.skip);
      console.log(`  Lesson Plan Manager custom orders to convert (topicPlanOrder -> lessonOrder): ${conv.length}` +
        `${p.orders.length - conv.length ? `, skipped ${p.orders.length - conv.length} that already have a lessonOrder` : ''}`);
      conv.forEach((o) => console.log(`      entry ${o.e._id} ${o.e.dayOfWeek} ${o.e.startTime}: ${o.names.length} keys${o.unknown.length ? `, ${o.unknown.length} unknown dropped` : ''}`));
      console.log(`  Syllabus progress marks (StudentSyllabusProgress, kept as they are): ${p.ssp.length}, ${p.sspUnmatched.length} not in the spine`);
      console.log(`    mirrored into LessonProgress (lesson player mastery): ${flag('SKIP_MASTERY') ? 'skipped (SKIP_MASTERY)' : p.mastery.length + ' new'}`);
      console.log(`    how those marks will read in the student lesson plan view after the switch: attended ${p.preview.attended}, missed ${p.preview.missed}, scheduled ${p.preview.scheduled}, cancelled ${p.preview.cancelled}, projected (no linked class, cannot be carried) ${p.preview.projected}`);
      p.projectedSample.forEach((s) => console.log('      projected: student ' + s));
      console.log(`  Published class recordings to attach to lesson videos: ${flag('SKIP_RECORDINGS') ? 'skipped (SKIP_RECORDINGS)' : p.recs.length + ' candidate(s)'}`);
      summary.migration.plan = {
        link: p.link.length, alreadyLinked: p.alreadyOurs.length, linkedElsewhere: p.linkedElsewhere.length,
        unmatched: p.unmatched.length, orders: conv.length, mastery: p.mastery.length, projected: p.preview.projected,
      };
    }

    // 5. Lesson PDFs -> R2 (no DB writes yet)
    const lessonState = [];
    if (!skipLessons) {
      console.log(`\nLesson notes -> R2 (${LESSON_KEY_PREFIX}):`);
      let up = 0, skip = 0, fail = 0, probedBad = 0;
      for (const { lesson: l, spine: f } of pairs) {
        if (stopRequested) break;
        const key = LESSON_KEY_PREFIX + l.fileName;
        const tag = `[${String(l.n).padStart(3)}/${pairs.length}] ${l.code.padEnd(6)} ${f.name.slice(0, 50)}`;
        try {
          const h = await head(key);
          if (isCurrent(h, l.bytes, l.sha256)) { skip++; lessonState.push({ l, f, key, ok: true }); console.log(`${tag}  already in R2`); continue; }
          const id = parseDriveId(l.driveId);
          if (DRY) {
            if (!id) { console.log(`${tag}  would upload (${fmtMB(l.bytes)}); Drive id missing`); lessonState.push({ l, f, key, ok: true }); continue; }
            if (env('PROBE') === '0') { console.log(`${tag}  would upload (${fmtMB(l.bytes)})`); lessonState.push({ l, f, key, ok: true }); continue; }
            const pr = await probeDrive(id, { expectedBytes: l.bytes, stopSignal: stopController.signal });
            if (!pr.ok) probedBad++;
            console.log(`${tag}  would upload (${fmtMB(l.bytes)}); Drive ${pr.ok ? 'OK' : 'PROBLEM'}: ${pr.detail}`);
            lessonState.push({ l, f, key, ok: true });
            continue;
          }
          const buf = await fetchDrive(id, { expectedBytes: l.bytes, expectedSha: l.sha256, expectPdf: true, stopSignal: stopController.signal, log: (s) => console.log(s) });
          await withRetry('upload', () => r2.send(new S3.PutObjectCommand({
            Bucket: BUCKET, Key: key, Body: buf, ContentLength: buf.length,
            ContentType: 'application/pdf', ContentDisposition: 'inline',
            Metadata: { sha256: sha256(buf) },
          })));
          up++;
          lessonState.push({ l, f, key, ok: true });
          console.log(`${tag}  uploaded ${fmtMB(buf.length)}`);
        } catch (e) {
          if (e instanceof StopRequested) break;
          fail++;
          lessonState.push({ l, f, key, ok: false, error: e.message });
          console.log(`${tag}  FAILED: ${e.message}`);
        }
      }
      summary.lessons.r2 = { uploaded: up, alreadyThere: skip, failed: fail, probeProblems: probedBad };
      checkStop();

      // 6. Lessons in Mongo + progress migration (one tight block, after every upload succeeded)
      const failed = lessonState.filter((s) => !s.ok);
      if (failed.length) {
        summary.warnings.push(`${failed.length} lesson upload(s) failed; lessons and migration were NOT written. Fix and re-run.`);
        console.log(`\n${failed.length} upload(s) failed; skipping the lesson and migration writes so the subject stays in subtopic mode. Re-run to resume.`);
      } else if (DRY) {
        const toCreate = pairs.filter(({ spine: f }) => !bySubName.has(f.name)).length;
        console.log(`\nWould upsert ${pairs.length} lessons (${toCreate} new, ${pairs.length - toCreate} existing), status published, termIndex 1/2/3 = AS/A2/Exam, order = n.`);
        const s = pairs[0];
        console.log(`  sample: ${JSON.stringify({ subtopicName: s.spine.name, title: s.spine.name, topicName: s.spine.topicName, order: s.lesson.n, termIndex: termIndexForCode(s.lesson.code), notesPdfUrl: publicUrl(LESSON_KEY_PREFIX + s.lesson.fileName) })}`);
      } else {
        console.log('\nWriting lessons:');
        inCriticalSection = true;
        const idByName = new Map();
        let created = 0, updated = 0, unchanged = 0, adopted = 0;
        for (const { l, f, key } of lessonState) {
          const prev = bySubName.get(f.name);
          const set = {
            subjectId: subject._id, curriculum: subject.curriculum, topicRef: f.topicId, subtopicName: f.name,
            order: l.n, termIndex: termIndexForCode(l.code), notesPdfUrl: publicUrl(key), notesPdfPublicId: key, status: 'published',
          };
          const changed = !prev || Object.keys(set).some((k) => String(prev[k] ?? '') !== String(set[k] ?? ''));
          const doc = await Lesson.findOneAndUpdate(
            { subjectId: subject._id, subtopicName: f.name },
            {
              $set: set,
              $setOnInsert: {
                title: f.name.slice(0, 200),
                description: `Smartious course notes, lesson ${l.n} of ${pairs.length} (${l.code}), ${f.topicName}.`.slice(0, 2000),
                teacherId: author._id,
              },
            },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
          ).lean();
          // topicName is not in the Lesson schema (strict mode would drop it), but the
          // materializer, Lesson Plan Manager, liveclasses pin and curriculum progress all
          // read lesson.topicName; without it the class topic falls back to the title.
          await Lesson.collection.updateOne({ _id: doc._id }, { $set: { topicName: f.topicName } });
          idByName.set(f.name, doc._id);
          if (!prev) created++;
          else if (!String(prev.notesPdfPublicId || '').startsWith(LESSON_KEY_PREFIX)) { adopted++; console.log(`  adopted ${doc._id} (previous notes: ${prev.notesPdfUrl || 'none'})`); }
          else if (changed) updated++; else unchanged++;
        }
        summary.lessons.db = { created, updated, unchanged, adopted };
        console.log(`  lessons: ${created} created, ${updated} updated, ${unchanged} unchanged, ${adopted} adopted`);

        // Migration
        const p = plan;
        let linked = 0;
        const byName = {};
        p.link.forEach((c) => { (byName[c._spine.name] = byName[c._spine.name] || []).push(c._id); });
        for (const [name, ids] of Object.entries(byName)) {
          const r = await LiveClass.updateMany({ _id: { $in: ids }, preparationLessonId: null }, { $set: { preparationLessonId: idByName.get(name) } }, { timestamps: false });
          linked += r.modifiedCount;
        }
        console.log(`  classes linked to their lesson: ${linked}`);

        let ordersDone = 0;
        for (const o of p.orders) {
          if (o.skip || !o.names.length) continue;
          const ids = o.names.map((n) => idByName.get(n)).filter(Boolean);
          const r = await TimetableEntry.updateOne(
            { _id: o.e._id, $or: [{ lessonOrder: { $exists: false } }, { lessonOrder: { $size: 0 } }] },
            { $set: { lessonOrder: ids } }, { timestamps: false });
          ordersDone += r.modifiedCount;
        }
        console.log(`  custom orders converted: ${ordersDone}`);

        let mastered = 0;
        if (!flag('SKIP_MASTERY') && p.mastery.length) {
          const ops = p.mastery.map((m) => ({
            updateOne: {
              filter: { studentId: m.p.studentId, lessonId: idByName.get(m.name) },
              update: { $setOnInsert: {
                studentId: m.p.studentId, lessonId: idByName.get(m.name), subjectId: subject._id, mastered: true,
                masteredAt: m.p.markedAt || m.p.updatedAt || new Date(), masteredBy: m.p.markedBy || author._id,
                teacherNotes: m.p.notes || '',
              } },
              upsert: true,
            },
          }));
          for (let i = 0; i < ops.length; i += 500) {
            const r = await LessonProgress.bulkWrite(ops.slice(i, i + 500), { ordered: false });
            mastered += r.upsertedCount || 0;
          }
        }
        console.log(`  mastery records added: ${mastered}`);

        let recAttached = 0;
        if (!flag('SKIP_RECORDINGS')) {
          for (const { c, r, name } of p.recs) {
            const lid = c.preparationLessonId && String(c.preparationLessonId) !== String(idByName.get(name)) ? null : idByName.get(name);
            if (!lid) continue;
            // Same dedupe rule as routes/classroom.js attachRecordingToLesson.
            const cur = await Lesson.findById(lid).select('videos').lean();
            if ((cur && cur.videos || []).some((v) => v.source === 'recording' && v.r2Url === r.url)) continue;
            const res = await Lesson.updateOne(
              { _id: lid, 'videos.r2Url': { $ne: r.url } },
              { $push: { videos: {
                source: 'recording', title: r.title || c.title || 'Recorded class', r2Url: r.url, r2Key: r.key || '',
                durationMins: Math.round((r.durationSec || 0) / 60), liveClassId: c._id, recordedAt: r.recordedAt || null,
                createdBy: c.teacherId || null,
              } } });
            recAttached += res.modifiedCount;
          }
        }
        console.log(`  recordings attached: ${recAttached}`);
        summary.migration.done = { linked, ordersConverted: ordersDone, mastery: mastered, recordings: recAttached };
        inCriticalSection = false;
        checkStop();
      }
    }

    // 7. Library booklet
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
            console.log('  would create LibraryBook ' + JSON.stringify({ ...record, description: record.description.slice(0, 60) + '...' }));
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
  } finally {
    // 8. Summary
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
  EXPECTED_LESSONS, LESSON_KEY_PREFIX, termIndexForCode, parseDriveId, driveDownloadUrl, validateManifest,
  flattenSpine, matchSpineToManifest, looksLikeHtml, parseDriveConfirm, checkDriveBody, fetchDrive, probeDrive,
  DriveError, StopRequested, normName, normTitle,
};
