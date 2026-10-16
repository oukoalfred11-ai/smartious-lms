# Smartious Virtual Science Laboratory

A browser laboratory inside the Smartious LMS. Students run simulated chemistry, physics and biology practicals on a 3D bench (or a 2D diagram), keep a lab notebook and submit their work. Teachers assign experiments to their own students, mark them against a rubric and return work for correction. Admin and the Dean review and publish experiments.

It uses the LMS login, roles and student records. There is no second account system and no copy of the student database.

## What is in this release

| Area | Status |
|---|---|
| Acid–base titration (chemistry) | Implemented: strong or weak acid, three indicators, burette scale close-up, rough and concordant runs |
| Ohm's law (physics) | Implemented: free wiring, short-circuit trip, meter resistances, V–I graph |
| Osmosis in potato tissue (biology) | Implemented as a **simplified** model, labelled as such |
| 3D bench (Three.js) with 2D fallback, low-graphics mode | Implemented; **not yet run in a browser** (see Verification) |
| Notebook (9 sections), raw-data tables, graph, questions | Implemented |
| Autosave, offline copy on the device, conflict detection, idempotent submit | Implemented |
| Automatic rubric checks re-run on the server, teacher rubric marking, return for correction | Implemented |
| Teacher dashboard: assign to own students, deadlines, progress, review, CSV class report | Implemented |
| Content review: draft → review → approved → published | Implemented (status only; experiment content is edited in code) |
| PDF lab report | Implemented; **not yet generated on a server** |
| Parent view | Access rule only (parents may read their children's submitted work through the API); no parent page yet |
| Further experiments per subject, microscopy, editing experiments from the admin screen | Not implemented |

## How it works

```
shared/lab/                 one engine, used by both browser and server (no dependencies)
  science/                  numeric, random (seeded), acidbase, indicators, circuit, osmosis
  experiments/              titration.js, ohms-law.js, osmosis.js, index.js (registry)
  engine.js                 params → replay(actions) → view → grade
  access.js                 who may view, edit, submit, mark, assign, manage
  sessionOps.js             save / submit / mark rules (revision checks, limits)
  test/                     node:test suites
backend/src/
  routes/lab.js             /api/lab/* (mounted in index.js)
  models/LabSession.js, LabAssignment.js, LabContent.js
  lib/labCore.js            loads shared/lab into the CommonJS backend
  lib/labReportPdf.js       PDF report (pdfkit)
frontend/src/lab/
  LabApp.jsx                /lab/* routes, header, library, "my work"
  Workspace.jsx             the student's experiment page
  useLabSession.js          local replay, autosave, backup, submit
  scene/                    engine3d.js (Three.js framework), equipment.js, scenes.js, LabViewport.jsx
  views2d.jsx, controls.jsx, panels.jsx
  TeacherDashboard.jsx, SessionReview.jsx, ContentAdmin.jsx, lab.css
```

**The action log is the record.** A session stores a server-generated seed and the list of actions the student took (for example `addBase {volume: 0.05}` or `recordReading {which: 'final', value: 23.45}`). The browser replays the actions for an instant response; on every save the server replays them again with the same engine and refuses any action that is not valid. Marks are computed on the server at submission from that replay, so changing values in the browser cannot change a grade.

**Hidden values.** Each attempt has its own hidden quantities (the acid concentration, the exact resistance, the isotonic point), derived from the seed. Students read instruments, record readings and calculate; the rubric compares what they recorded with what the instrument showed and what they calculated with what their own data give.

### Scientific models

- **Titration:** exact charge balance for a monoprotic acid and a strong base, `[H⁺] + [Na⁺] = [OH⁻] + [A⁻]`, solved numerically for each added volume. Weak acids use their Ka (ethanoic acid 1.74 × 10⁻⁵). Indicator colour comes from the indicator equilibrium (pKIn), so the endpoint seen depends on the indicator chosen. The burette is read to 0.05 cm³.
- **Ohm's law:** the wired circuit is solved with modified nodal analysis. Supply internal resistance 0.5 Ω, ammeter 0.01 Ω, voltmeter 10 MΩ. A current above 5 A trips the supply. Resistors are E12 values with ±5 % tolerance.
- **Osmosis (simplified):** % change in mass = 40 × (C_iso − C) at equilibrium, capped at +18 % and −32 %, approached as 1 − e^(−t/45 min), with ±0.02 g blotting error. Sucrose uptake, cut-surface damage and temperature are not modelled. The interface and the report say so.

Every experiment lists its assumptions, and every screen and report states that the data are simulated, not real measurements.

### Permissions (enforced on the server)

| Role | May |
|---|---|
| Student | Open published experiments, or approved ones assigned to them; edit and submit only their own attempts while in progress or returned |
| Teacher | See and mark only students allocated to them (`Allocation`, status `Active`); assign only to those students |
| Admin, Dean (`dos`, `ops_manager`) | Everything above for all students; change experiment status |
| Parent | Read their linked children's submitted work (API only) |

Experiments start in **review**. Until admin or the Dean set one to **approved** (teachers may assign it) or **published** (all students may open it), students cannot open it. Approval is refused if the definition fails its structural checks.

### Curriculum mapping

Each experiment lists the boards, levels and topics it supports (Cambridge IGCSE and AS & A Level, Pearson Edexcel International GCSE, IB Diploma). These are Smartious's own mapping. Syllabus reference codes are blank and marked unverified, and unverified references are never shown to students. Nothing in the lab claims endorsement by an examination board, and the lab does not replace any practical work a board requires.

## Configuration

No new environment variables. The lab uses the backend's existing `MONGODB_URI`, `JWT_SECRET` and auth middleware, and the frontend's existing API base URL. No keys reach the browser.

## Deployment

- **Frontend (Netlify):** unchanged settings (`base = frontend`). Netlify clones the whole repository, so `shared/lab` is available to the build. Three.js (`three@^0.169.0`) is a new dependency, added to `package.json` and `package-lock.json` (the lock entry has no integrity hash because the registry was not reachable from the build machine; `npm` fills it in on install). Three.js is loaded only when a student opens the 3D bench.
- **Backend (Render):** redeploy manually. The service must run from a full checkout of the repository, because `backend/src/lib/labCore.js` loads `../../../shared/lab`. If that folder is missing, `/api/lab/*` answers 503 "The Virtual Lab engine is not available on the server" and the rest of the LMS keeps working.
- **After deploying:** sign in as admin or Dean → Virtual Lab → Content review, check each experiment, and set it to approved or published.

## Tests

```bash
cd shared/lab && node --test test/*.test.js     # science models, experiments, grading, access, save/submit rules, view contract
cd backend   && node --test test/*.test.js      # /api/lab routes with in-memory models
```

Science tests check the models against known values: pH of strong and weak acids, equivalence points, half-equivalence pH = pKa, indicator transitions, series and parallel circuits, meter resistances, reversed leads, a voltmeter wired in series, short circuits, osmosis limits and time behaviour. Experiment tests run a full student walkthrough of each practical and check grading for correct and incorrect work.

## Verification status

What has been checked:

- 67 tests in `shared/lab` and 10 route tests in `backend` pass.
- Every new frontend file bundles with Bun (syntax and import resolution). External packages were left out of that check.

What has **not** been checked, because the build machine had no package registry, no React or Three.js, and no database:

- The pages have not been rendered in a browser, and the 3D scenes have not been seen.
- No end-to-end test (student → submit → teacher marks) has been run against a live server.
- The PDF report has not been generated (pdfkit was not installed).
- The routes have been tested against in-memory model stand-ins, not MongoDB.

Before telling students the lab is ready, run one practical end to end on the deployed site, as a student and as a teacher, on a laptop and a tablet. Download one PDF report.

## Known limitations

- Hidden values come from the seed, which the browser receives so it can replay the experiment. A determined student with developer tools could work them out. Marks still come only from the server's replay of what the student recorded, and teachers see the student's raw readings.
- Undo works only for steps that have not been saved yet. Saved steps are part of the record; use Restart to begin the attempt again.
- Three experiments only. To add one, write a definition in `shared/lab/experiments/` (the tests check its structure), add a 3D scene, a 2D view and controls, and register it in `experiments/index.js`.
- Experiment content is changed in code and released through review. The admin screen changes publication status only.
- There is no microscopy experiment. Any future one must use properly sourced, credited images or clearly labelled illustrations, never invented images presented as real specimens.
