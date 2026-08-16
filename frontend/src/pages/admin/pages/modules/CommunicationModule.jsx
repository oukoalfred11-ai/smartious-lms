/**
 * CommunicationModule.jsx
 *
 * HISTORY / WHY THIS FILE IS A RE-EXPORT
 * --------------------------------------
 * This file used to contain a full copy of the Curriculum Manager
 * (SubjectsTab + SyllabusSpineTab + CurriculumModule), taken at an
 * earlier point in time and never updated since. The Dashboard mounts
 * it on the "Communication" page, so the admin sidebar's Communication
 * entry has in fact been showing a SECOND, OUTDATED spine editor:
 * it carried only five spine loaders (IGCSE Maths, Primary, Year 5,
 * Lower Secondary, IGCSE) and none of the later ones (CBE, PYP, MYP,
 * IB Diploma, KCSE, iPrimary, Edexcel Lower Secondary, Edexcel IAL,
 * Cambridge A Level, Import spine JSON), plus a stale Lower Secondary
 * error message.
 *
 * Two editors for the same SyllabusTopic spine is drift waiting to
 * happen, so the fork is collapsed: this file now re-exports the ONE
 * canonical Curriculum Manager. The Communication page keeps working
 * exactly as it does today (it has only ever shown the curriculum
 * manager), but it now shows the current one.
 *
 * When a real Communication feature is built (announcements, messages
 * via routes/communication.js), replace this re-export with it.
 */
export { default } from './CurriculumModule.jsx'
