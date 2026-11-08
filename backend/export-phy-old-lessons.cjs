/**
 * export-phy-old-lessons.cjs
 * ============================================================
 * READ ONLY. Dumps every live lesson of the Cambridge A Level Physics subject (plus the
 * published class recordings grouped by the subtopic they were stamped with) to a JSON file,
 * so the old-lesson -> new-lesson mapping for import-cie-notes.cjs can be reviewed in full.
 * It performs find/count queries only: no insert, update, delete or index change.
 *
 * Usage (Render shell, from backend/):
 *   node export-phy-old-lessons.cjs                 # writes /tmp/phy_old_lessons.json
 *   OUT=/tmp/x.json SUBJECT_ID=<id> node export-phy-old-lessons.cjs
 */
'use strict';

const fs = require('fs');

const env = (k) => String(process.env[k] || '').trim();
const sid = (x) => String(x);
const escRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function main() {
  require('dotenv').config();
  const mongoose = require('mongoose');
  const Subject = require('./src/models/Subject');
  const SyllabusTopic = require('./src/models/SyllabusTopic');
  const Lesson = require('./src/models/Lesson');
  const LiveClass = require('./src/models/LiveClass');
  const TimetableEntry = require('./src/models/TimetableEntry');

  const uri = env('MONGODB_URI');
  if (!uri) throw new Error('MONGODB_URI is not set.');
  await mongoose.connect(uri);
  console.log('Connected to Mongo (read only).');

  try {
    let subject;
    if (env('SUBJECT_ID')) subject = await Subject.findById(env('SUBJECT_ID')).lean();
    else {
      const rows = await Subject.find({ curriculum: 'CambridgeALevel', subjectName: 'Physics' }).lean();
      if (rows.length > 1) throw new Error(`${rows.length} subjects match: ${rows.map((r) => r._id).join(', ')}. Set SUBJECT_ID.`);
      subject = rows[0];
    }
    if (!subject) throw new Error('Physics (CambridgeALevel) subject not found.');
    console.log(`Subject: ${subject.subjectName} (${subject.curriculum}) ${subject._id}`);

    const topics = await SyllabusTopic.find({ subjectId: subject._id }).sort({ topicOrder: 1 }).lean();
    const spine = topics.map((t) => ({
      topicName: t.topic || '', code: t.code || '',
      subtopics: (t.subtopics || []).map((s) => ({ code: s.code || '', name: s.name || '' })),
    }));

    const lessons = await Lesson.collection.find({ subjectId: subject._id }).sort({ order: 1, _id: 1 }).toArray();
    const out = lessons.map((d) => {
      const vids = (d.videos || []).map((v) => ({
        source: v.source || '', title: v.title || '', embedId: v.embedId || '', r2Url: v.r2Url || '', durationMins: v.durationMins || 0,
      }));
      const yt = d.videoEmbedId || '';
      return {
        id: sid(d._id),
        order: d.order,
        title: d.title || '',
        subtopicName: String(d.subtopicName || '').trim(),
        status: d.status || '',
        hasNotesPdf: !!(d.notesPdfUrl || d.notesPdfPublicId),
        videoEmbedId: yt,
        videoUrl: d.videoUrl || '',
        videos: vids,
        videoCount: vids.length + (yt && !vids.some((v) => v.embedId === yt) ? 1 : 0) + (!yt && d.videoUrl ? 1 : 0),
        hasVideo: !!(yt || d.videoUrl || vids.length),
        hasRecording: vids.some((v) => v.source === 'recording'),
        teacherId: d.teacherId ? sid(d.teacherId) : null,
      };
    });

    // Class recordings (what the importer would attach to lessons as videos), by stamped subtopic.
    const entries = await TimetableEntry.find({ subjectId: subject._id }).select('_id').lean();
    const classes = await LiveClass.find({
      $or: [
        { timetableEntryId: { $in: entries.map((e) => e._id) } },
        { subject: new RegExp('^\\s*' + escRe(subject.subjectName) + '\\s*$', 'i'), curriculum: subject.curriculum },
      ],
    }).select('title scheduledAt status syllabusTopicName syllabusSubtopicName preparationLessonId recordings').lean();
    const classRows = classes.map((c) => ({
      id: sid(c._id), title: c.title || '', scheduledAt: c.scheduledAt || null, status: c.status || '',
      syllabusTopicName: c.syllabusTopicName || '', syllabusSubtopicName: c.syllabusSubtopicName || '',
      preparationLessonId: c.preparationLessonId ? sid(c.preparationLessonId) : null,
      recordings: (c.recordings || []).length,
      featuredRecordings: (c.recordings || []).filter((r) => r.featured && r.url).length,
    }));

    const file = env('OUT') || '/tmp/phy_old_lessons.json';
    fs.writeFileSync(file, JSON.stringify({
      exportedAt: new Date().toISOString(),
      subject: { id: sid(subject._id), subjectName: subject.subjectName, curriculum: subject.curriculum },
      spine, lessons: out, classes: classRows,
    }, null, 1));

    const by = (f) => out.filter(f).length;
    const names = new Map();
    out.forEach((l) => names.set(l.subtopicName, (names.get(l.subtopicName) || 0) + 1));
    console.log(`\nWrote ${file}`);
    console.log(`Lessons: ${out.length} (published ${by((l) => l.status === 'published')}, draft ${by((l) => l.status === 'draft')}, other ${by((l) => !['published', 'draft'].includes(l.status))})`);
    console.log(`With any video: ${by((l) => l.hasVideo)}; with a class recording video: ${by((l) => l.hasRecording)}; with notes PDF: ${by((l) => l.hasNotesPdf)}`);
    console.log(`Distinct subtopic names: ${names.size}; names shared by more than one lesson: ${[...names.values()].filter((k) => k > 1).length}`);
    console.log(`Classes: ${classRows.length}; with featured recordings: ${classRows.filter((c) => c.featuredRecordings).length} (${classRows.reduce((a, c) => a + c.featuredRecordings, 0)} recording(s))`);
    console.log('\nNext: cat or download the file and send it back.');
  } finally {
    await mongoose.disconnect();
  }
}

main().then(() => process.exit(0), (e) => { console.error('FAILED: ' + e.message); process.exit(1); });
