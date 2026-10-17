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

## My Classes, end of lesson and homework (teacher portal)

- **My Classes** replaces the separate Schedule Classes and Timetable modules. Tabs: *This week* (lessons to close, coming lessons with Start, Lesson, Homework, Move, Cancel), *Weekly timetable* (the repeating slots), *Lesson order* (the order the syllabus is taught in) and *Past lessons* (registers). Old page ids `timetable`, `scheduleclasses` and `schedule` redirect to it.
- **End-of-lesson pop-up.** A teacher who leaves the classroom lands on `/teacher?ended=<liveClassId>`: a full-screen form with three steps (how the lesson went, its homework, what the next lesson teaches) and one Finish button. Finish sets the next lesson first (`PATCH /liveclasses/:id/lesson`), then closes the lesson (`POST /liveclasses/:id/close`), which sends the homework. "Do this later" leaves it under Lessons to close.
- **Homework plan.** `LiveClass.homeworkPlan { questions, edited, lessonKey }`. `GET /liveclasses/:id/homework` builds the list from the question bank on first open and keeps it, so what the teacher sees is what every student receives. `PUT` saves the teacher's list (add from the bank, write their own, edit, delete) or turns homework off; editing a bank question saves a copy, the bank is never changed. `POST …/homework/reset` makes a new selection; `GET …/homework/bank?q=` searches the bank. A list the teacher only viewed follows the lesson (ignored if the class is re-stamped to another topic); an edited list is always used. Lessons nobody reviewed keep per-student sampled papers.
- `GET /liveclasses/:id/next` returns the next lesson with the same students and the lessons it can teach (the plan queue, plus "continue today").

## Weekly reports and show cause

- `lib/weeklyReportsDue.js` is the single rule: a report is owed for every student the teacher had a lesson with this week (Monday 00:00 Nairobi; cancelled and not-held lessons do not count). It is cleared by a published weekly report for that student (linked by id, or by name for older typed reports) or a term report published in the last 14 days.
- The teacher's Weekly Reports page shows that list (*Reports due this week*, with Write report / Edit / Publish) from `GET /weekly-reports/due`; the Thursday 5 PM reminder and Friday 5 PM show cause use the same function, so a report the teacher sees as published is never chased.
- A published report stays published: auto-save and later edits no longer turn it back into a draft (this was why teachers who had published still got show-cause notices). Reports typed by name are linked to the student when the name is unambiguous. Deductions are applied once per student per week.
