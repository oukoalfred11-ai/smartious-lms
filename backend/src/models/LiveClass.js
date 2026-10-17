/**
 * LIVE CLASS MODEL
 * ============================================================
 * A scheduled live class session. Created by a teacher, attended by
 * specifically-assigned students at a future scheduled time.
 *
 * Distinct from the GroupRoom model:
 *   - GroupRoom = an ongoing classroom (e.g. "Year 11 Maths Group A")
 *     with persistent membership and an associated Zoom link.
 *   - LiveClass = a single scheduled session at a specific date/time,
 *     with a specific topic and meeting URL.
 *
 * Lifecycle:
 *   scheduled → live → ended
 *   (teacher can also mark cancelled at any pre-live point)
 *
 * The computed status is derived from `scheduledAt`, `durationMins`, and
 * the explicit `status` field. Teachers can manually flip 'live' early
 * for technical issues.
 */

const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────
  title:        { type: String, required: true, trim: true },
  description:  { type: String, default: '', trim: true },

  // ── Academic context ────────────────────────────
  subject:      { type: String, required: true, trim: true },
  curriculum:   { type: String, required: true, trim: true },
  grade:        { type: String, required: true, trim: true },
  // Optional pointer to a Lesson when the Lesson model exists.
  // Used by the future "Prepare for lesson" button on the student card.
  preparationLessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null,
  },

  // ── Spine linkage (added 2026-05-22) ────────────────
  // When a teacher schedules a class, they can optionally pick a
  // topic + subtopic from the subject's loaded syllabus spine.
  // Both fields nullable; existing classes without spine linkage
  // continue to work unchanged. Denormalised strings (not refs)
  // because: (a) the spine sub-document _ids may change when a
  // spine is reloaded; (b) the names are what we display anyway;
  // (c) this avoids the complication of populating embedded
  // subdocuments. Reporting (% syllabus remaining) will match
  // on (subject, curriculum, grade, syllabusSubtopicName).
  syllabusTopicName:    { type: String, default: null, trim: true },
  syllabusSubtopicName: { type: String, default: null, trim: true },

  // ── Scheduling ──────────────────────────────────
  scheduledAt:  { type: Date, required: true },
  durationMins: { type: Number, required: true, min: 5, max: 240 },

  // ── Classroom mode ──────────────────────────────
  // 'link'   = external meeting link (Zoom/Meet) — the original flow.
  // 'native' = the built-in Smartious Classroom at /classroom/:id
  //            (WebRTC + shared whiteboard). No external link needed.
  classroomMode: {
    type: String,
    enum: ['link', 'native'],
    default: 'link',
  },

  // ── Meeting link ────────────────────────────────
  // Required only for link-mode classes; native classes leave it empty.
  meetingLink: {
    type: String,
    trim: true,
    default: '',
    required: function () { return this.classroomMode !== 'native'; },
  },

  // ── Delivery mode ───────────────────────────────
  // 'virtual' = online via meetingLink; 'physical' = in-person.
  // Defaults to virtual. Set per class.
  deliveryMode: {
    type: String,
    enum: ['virtual', 'physical'],
    default: 'virtual',
  },

  // Set when this class was auto-created by the timetable
  // roll-forward promotion (vs. manually scheduled).
  // Teacher pinned a specific lesson to THIS class; subject-level
  // reorders and restamps must not overwrite it.
  lessonPinned: { type: Boolean, default: false },
  fromTimetable: { type: Boolean, default: false },
  // The weekly timetable entry this instance was materialized from.
  // The reconciler (lib/timetableMaterializer.js) keys on this to keep
  // future instances in step with the teacher's timetable edits.
  timetableEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimetableEntry', default: null, index: true },
  // A materialized instance that was individually edited or cancelled.
  // Detached instances are EXCEPTIONS: the reconciler never deletes,
  // moves, or recreates over them - one-off changes survive the series.
  detached: { type: Boolean, default: false },
  // The weekly occurrence a template-born class stands for. Set when the
  // reconciler creates it and kept when the class is later moved or
  // cancelled, so that occurrence stays "taken" and is never re-created
  // on the original day. Null on manual classes and on template classes
  // made before this field existed (the reconciler backfills those).
  originalScheduledAt: { type: Date, default: null },

  // ── Reminders ───────────────────────────────────
  // Who has been sent the 30-minute reminder (student ids, plus
  // 'teacher'), and when the reminder pass for this class completed.
  // Persisted so a restart or a second sweep never repeats a reminder.
  remindedRecipients: { type: [String], default: [] },
  reminderSentAt:     { type: Date, default: null },

  // ── Closing the lesson (the teacher's record of what happened) ──
  // A lesson whose time has passed is NOT assumed to have happened. The
  // teacher closes it: taught (full or partial coverage of a topic),
  // student absent, or not held (with a reason). Until then it is
  // "unconfirmed": no homework, no topic progress, no absences counted,
  // and after 24h it is flagged to the Director of Studies.
  outcome:        { type: String, enum: ['taught', 'student_absent', 'not_held', null], default: null },
  coverage:       { type: String, enum: ['full', 'partial', null], default: null },
  coveredTopic:   { type: String, default: '' },
  coveredSubtopic:{ type: String, default: '' },
  notHeldReason:  { type: String, default: '' },
  teacherNote:    { type: String, default: '' },
  outcomeAt:      { type: Date, default: null },
  outcomeBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Set by the auto-end sweep when a lesson's time lapsed with nobody
  // pressing End: "ended" then means only "its time is over".
  autoEnded:      { type: Boolean, default: false },

  // ── Extra and make-up lessons a teacher adds ──
  extraLesson:    { type: Boolean, default: false },
  makeUpFor:      { type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass', default: null },

  // ── Cover while the teacher is on approved leave ──
  // With a replacement teacher, teacherId is the cover teacher and
  // originalTeacherId the absent one; without, needsCover flags the
  // lesson for the Director of Studies. coverLeaveId undoes it if the
  // leave is cancelled.
  originalTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  coverLeaveId:   { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherLeaveRequest', default: null },
  needsCover:     { type: Boolean, default: false, index: true },

  // ── Absence alerts to families ──
  // Students whose parents were told the student had not joined.
  absenceAlerted: { type: [String], default: [] },

  // Clubs. A club meeting is a live class with clubId set; it opens in
  // the classroom's meeting (conference) view instead of the whiteboard,
  // and its recording becomes part of the club's archive.
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', default: null, index: true },
  kind:   { type: String, enum: ['lesson', 'club', 'competition', 'event', 'assembly'], default: 'lesson' },

  // ── Ownership ───────────────────────────────────
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // ── Assigned students (one-by-one this phase) ───
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  }],

  // ── Recordings (native Smartious Classroom) ─────
  // Uploaded by the teacher's browser during/after the lesson.
  // url points at the public R2 object (WebM video).
  recordings: [{
    url:        { type: String, required: true },
    key:        { type: String, default: '' },     // R2 object key, for deletion
    sizeBytes:  { type: Number, default: 0 },
    durationSec:{ type: Number, default: 0 },
    recordedAt: { type: Date, default: Date.now },
    // Curation. A recording is private by default; admin reviews it and
    // marks the good ones 'featured', which is what makes it visible to
    // students beyond the class it came from (the growing public library).
    featured:   { type: Boolean, default: false },
    title:      { type: String, trim: true, default: '' },   // admin-set label for the library
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  }],

  // ── Lifecycle ───────────────────────────────────
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled',
  },
  startedAt:  Date,     // when teacher flipped status to live
  endedAt:    Date,     // when teacher flipped status to ended OR auto-ended
  cancelledAt: Date,
  cancelReason: String,

  // ── Resources / handouts (optional) ─────────────
  // Attachments shared before or during the class.
  attachments: [{
    url:       { type: String, required: true },
    publicId:  String,
    filename:  String,
    mimeType:  String,
    sizeBytes: Number,
  }],

  notes: { type: String, default: '', trim: true },

  // ── Auto-homework (set when the scheduled end time passes) ──
  autoHomeworkEnabled:     { type: Boolean, default: true },
  autoHomeworkGeneratedAt: { type: Date,    default: null, index: true },
  autoHomeworkNote:        { type: String,  default: '' },
  // The teacher's reviewed homework for this lesson (My Classes). Null =
  // not reviewed: each student gets their own sampled paper. Set = every
  // student gets exactly these questions (Homework question snapshots).
  homeworkPlan: {
    type: new mongoose.Schema({
      questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
      edited:    { type: Boolean, default: false },
      lessonKey: { type: String, default: '' },
      updatedAt: { type: Date, default: null },
    }, { _id: false }),
    default: null,
  },

}, { timestamps: true });

// Compound indexes for student/teacher dashboards
liveClassSchema.index({ assignedStudents: 1, scheduledAt: -1 });
liveClassSchema.index({ teacherId: 1, scheduledAt: -1 });
// One class per weekly occurrence of a timetable entry. Partial: only
// template-born classes that carry their occurrence take part, so manual
// classes and older documents are unaffected and the build cannot fail
// on existing data.
liveClassSchema.index(
  { timetableEntryId: 1, originalScheduledAt: 1 },
  {
    unique: true,
    name: 'uniq_timetable_occurrence',
    partialFilterExpression: { timetableEntryId: { $type: 'objectId' }, originalScheduledAt: { $type: 'date' } },
  },
);
// Reminder sweep: scheduled classes starting soon that are not done yet.
liveClassSchema.index({ status: 1, scheduledAt: 1, reminderSentAt: 1 });
// Lessons waiting to be closed by their teacher.
liveClassSchema.index({ teacherId: 1, outcome: 1, scheduledAt: -1 });

// Virtual: computed status — accounts for the actual date even if the
// `status` field hasn't been flipped yet.
liveClassSchema.virtual('computedStatus').get(function() {
  if (this.status === 'cancelled' || this.status === 'ended') return this.status;
  if (this.status === 'live') return 'live';
  const now = Date.now();
  const start = new Date(this.scheduledAt).getTime();
  const end   = start + (this.durationMins || 0) * 60000;
  if (now < start)  return 'scheduled';
  if (now <= end)   return 'live';
  return 'ended';
});

liveClassSchema.set('toJSON',   { virtuals: true });
liveClassSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LiveClass', liveClassSchema);
