# Lesson scheduling — how it works

## The rules
1. **The real lesson is the only truth.** Weekly slots (TimetableEntry) are a pattern; the materializer turns them into real lessons (LiveClass) for the next 7 days. Reminders, timetables, homework, attendance and parent views read the real lessons.
2. **Lessons belong to the teacher once they exist.** The materializer never re-creates a lesson the teacher moved or cancelled (each lesson remembers its weekly occurrence, `originalScheduledAt`), and topics a teacher pinned survive slot edits.
3. **Auto-scheduling proposes.** A slot picked without both sides' declared availability is marked *proposed*; the teacher confirms it (the family is emailed the weekly time) or edits it.
4. **The teacher closes every lesson** (`POST /api/liveclasses/:id/close`): *taught* (topic, full or partial), *student absent*, or *not held* (reason, family told, make-up offered). From `LESSON_CLOSE_CUTOVER` (default 2026-10-26) a past lesson counts as held only if closed, ended by the teacher, or attended. Homework and topic progress follow only *taught*. Unclosed lessons are listed for the teacher, for DOS after 24 h, and in a 07:00 digest to the academic office.
5. **Teachers have control**: extra and make-up lessons, move, cancel (with reason), reorder topics, clash check on slots.
6. **Every student has a lesson plan** (`/api/lesson-plan/me`): topics in the teacher's order — done (with attendance), in progress, next, planned (with date) — and marks each topic *I've got it* / *I need help*. Parents see it read-only; teachers get a *Students asking for help* panel.
7. **The calendar knows real life**: school holidays and breaks (`/api/school-calendar`, managed in the DOS timetable console) create no lessons; approved teacher leave hands lessons to the replacement teacher or flags them *needs cover*; paused students are not counted absent; families' time zones are detected by the browser and shown in lesson emails.
8. **Attendance alerts go to parents**: 10 minutes into a lesson in the Smartious classroom, the student and parents are emailed if the student has not joined; the academic office is alerted after 2 (and 4) missed lessons in a row.

## Settings (environment)
- `LESSON_CLOSE_CUTOVER` — date close-the-lesson takes effect (default 2026-10-26).
- `ACADEMIC_EMAIL` — recipient of absence-streak alerts and the unconfirmed-lessons digest (default academics@smartioushomeschool.com).
- `SCHEDULING_ALERT_EMAIL` — recipient of "no slot could be made" alerts.

## Code
- Pure logic, unit-tested: `backend/src/lib/scheduling.js`, `backend/src/lib/schoolTime.js` (`backend/test/scheduling.test.js`).
- Materializer: `backend/src/lib/timetableMaterializer.js`; plans: `lib/lessonPlan.js`, `lib/studentPlan.js`; notices: `lib/lessonNotices.js`; alerts: `lib/absenceAlerts.js`; leave: `lib/leaveCover.js`.
- UI: `frontend/src/components/lessons/` (LessonControl, LessonPlan, SchoolCalendar).
