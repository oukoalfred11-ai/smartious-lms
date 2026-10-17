# Smartious Virtual Science Laboratory

A browser laboratory inside the Smartious LMS. Students run simulated chemistry, physics and biology practicals on a 3D bench (or a 2D diagram), keep a lab notebook and submit their work. Teachers assign experiments to their own students, mark them against a rubric and return work for correction. Admin and the Dean review and publish experiments.

It uses the LMS login, roles and student records. There is no second account system and no copy of the student database.

## What is in this release

| Area | Status |
|---|---|
| Acid–base titration (chemistry) | Implemented: strong or weak acid, three indicators, burette scale close-up, rough and concordant runs, done **step by step** (goggles and coat, rinse, funnel, jet, eye level, pipette filler, swirl) with technique marked |
| Ohm's law (physics) | Implemented: free wiring, short-circuit trip, meter resistances, V–I graph |
| Osmosis in potato tissue (biology) | Implemented as a **simplified** model, labelled as such; done **step by step** (cork borer, ruler and scalpel, blotting, tared balance, labelled tubes, lab clock) with technique marked |
| 3D bench (Three.js) with 2D fallback, low-graphics mode | Implemented; **not yet run in a browser** (see Verification) |
| School laboratory room around the bench (titration and osmosis) | Implemented (`scene/labRoom.js`); **not yet seen in a browser** |
| A-to-Z practical flow: plan, bench, student-built results table, hand-drawn graphs, working, conclusion, formal report | Implemented |
| Autosave, offline copy on the device, conflict detection, idempotent submit | Implemented |
| Automatic rubric checks re-run on the server, teacher rubric marking, return for correction | Implemented |
| Teacher dashboard: assign to own students, deadlines, progress, review, CSV class report | Implemented |
| Content review: draft → review → approved → published | Implemented (status only; experiment content is edited in code) |
| PDF lab report | Implemented; **not yet generated on a server** |
| Parent view | Access rule only (parents may read their children's submitted work through the API); no parent page yet |
| **AS & A Level Physics practicals (67)**, chapters 1–16 | Implemented on one shared practical engine (`shared/lab/practical.js`); every one passes a careful-student test on 6 seeds |
| Stockroom: students collect the apparatus for each practical (with distractors) | Implemented; 96 apparatus items, each with a procedural 3D model (`scene/apparatus3d.js`) |
| Bulk publishing (publish a whole collection in one step) | Implemented, with each experiment checked first |
| Further curricula and subjects, microscopy, editing experiments from the admin screen | Not implemented |

## A-to-Z practical (student's own data handling)

Every experiment runs as seven steps, in the order of a school practical:

1. **Plan**: aim, hypothesis, variables, risk assessment, apparatus and method (plus planning questions where the practical has them).
2. **Experiment**: the 3D/2D bench. Readings the student records here form the *bench record*.
3. **Results table**: the student draws up their own table. Headings are quantity / unit; readings are typed (or copied from the bench record, measured columns only); calculated columns use a spreadsheet-style formula (`A/B`, `1/A`, `mean(B,C,D)`, `lg(A)`) with a chosen precision.
4. **Graph**: scatter, line or bar chart from the student's table, with their own axes, labels and scales on graph paper, optional error bars, and a line of best fit, worst acceptable line or tangent **dragged by hand** (mouse, touch or arrow keys). A gradient triangle reads Δy/Δx from the line; best − worst gives the uncertainty. The computer's least-squares line is only a check, shown on request, and the report and teacher see that it was used.
5. **Analysis**: working set out line by line (`gradient`, `worst_gradient`, `intercept`… from the graph; named results reused in later lines; templates for % uncertainty and % difference), plus the result questions.
6. **Conclusion** and evaluation.
7. **Report and submit**: a formal lab report (sections 1 to 11, Table 1, Figures) that prints or saves as PDF from the browser; the server PDF has the same content.

The **lab coach** checks what an examiner would: headings and units, consistent decimal places, significant figures of calculated values, enough rows, labelled axes, scales using more than half the grid, points inside the scale, a balanced line of best fit, a large triangle, a worst line, and units on results. It is formative and never changes marks.

Code: `shared/lab/analysis.js` (formula parser, table, lines, checks, input cleaning; tested in `test/analysis.test.js`), `frontend/src/lab/analysis/*` (ResultsTable, GraphCanvas, GraphStudio, Working, Coach, Report), `frontend/src/lab/Workspace.jsx` (steps). Saved as `analysis` on the session (`applySave` cleans it); bench tables mark their calculated columns with `derived` so copying leaves those to the student.

## Hands-on bench

- **Apparatus on the bench.** Every practical starts with its apparatus laid out, and listed reagents appear as labelled bottles. A teacher can tick "Students choose the apparatus themselves from the stockroom" when assigning; the apparatus choice is then marked.
- **Wiring with leads.** Circuits are built from a tray of red and black leads: drag from one terminal post to another, or tap one post then the other (touch). Click a lead to select and remove it; click the switch to open or close it. Leads attach to the real posts on the 3D models. A keyboard alternative ("Connect using menus instead") is in the controls panel.
- **Real behaviour when wired wrongly.** The circuit the student builds is solved with the same circuit solver. When it is correct, meters show the practical's model readings. When it is wrong, they show what that wiring would really give (for example a voltmeter in series reads about the e.m.f. with no current) or 0 where no resistive model is given, and the bench lists what is wrong. A short circuit trips the supply. The "Circuit built correctly" mark counts the readings taken with a correct circuit.
- **Circuit practicals:** Ohm's law, 1.3 and 20 practicals in chapters 6–16. Not wired yet: 7.3 (needs a three-terminal sliding contact), 13.1 and 13.2 (need a two-way charge/discharge switch), 13.3, 13.5, 13.6, 14.5 (teacher demonstration) and practicals with no meter circuit. In practicals whose currents are in mA, or that use lamps, LEDs or a.c., a wrongly wired meter reads 0 rather than a solved value.
- **Titration.** All the apparatus and reagents of the manual are on the bench (burette in its clamp, pipette and filler, funnel, flask on a white tile, NaOH and acid bottles, three indicator dropper bottles, wash bottle, beakers, goggles and a lab coat). The burette reading is never printed: students read the scale close-up. See *Step-by-step technique* below.
- **Osmosis.** A potato and cork borer, a ruler and scalpel on a white tile, a paper towel, a balance with a weighing boat, six labelled boiling tubes of sucrose solution and a lab clock. See *Step-by-step technique* below.
- **The room.** The titration and osmosis benches stand in a school laboratory (`scene/labRoom.js`): a service ledge with gas taps and sockets, tiled splashback, a window with daylight, shelves of reagent bottles, a sink with a swan-neck tap, a fume cupboard, safety signs, a periodic table, a wall clock, a stool, a tiled floor and ceiling lights. Nothing in the room is clickable or affects results. Ambient motion (a drip from the tap every few seconds, steam from a beaker in the fume cupboard, the clock's second hand) runs on a one-second timer, is switched off in low graphics and under *reduced motion*, and stops when the 3D view closes. The physics practicals' generic bench does not use the room yet; adding it is one call, `addLabRoom(lab, { width: W, depth: DEPTH })`, in `practicalScene.js`.

## Step-by-step technique (titration and osmosis)

Every new titration and osmosis session is done with the student's hands, step by step, as in a school lab. Each step is an engine action, validated with a clear message and replayed on the server, so it can be marked. In the 3D view a click on a piece of apparatus does the obvious thing or opens a short menu (shown in the bench overlay) of what can be done with it, including the wrong things; the 2D view has the same menus; the controls panel has every step as a button and a **Next** prompt that says what a teacher would say next, without giving away a reading.

**Titration** (`wearPPE`, `rinseBurette`, `burFunnel`, `pourIntoBurette`, `runToWaste`, `eyeLevel`, `attachFiller`, `rinsePipette`, `fillPipette`, `adjustPipette`, `deliverPipette`, `rinseFlask`, `swirl`, plus the existing `chooseIndicator`, `addIndicator`, `addBase`, `recordReading`, `markRough`, `newRun`):

1. Put on goggles and a lab coat. Handling the sodium hydroxide or the acid without them is refused. Pipetting without a filler is refused ("Never pipette by mouth").
2. Rinse the burette with the alkali; put the funnel in; pour (the level lands just above or near 0.00); take the funnel out; run a little into the waste beaker to fill the jet and bring the meniscus onto the scale (a reading above 0.00 is refused).
3. Read the initial volume. The student is standing (eye above the meniscus) until they choose to crouch; the close-up is drawn from where their eye is, so from above or below the scale really is misread by 0.15 cm³ (the graduation rings and meniscus look like ellipses). In 3D, *Crouch* moves the camera level with the meniscus.
4. Rinse the pipette with the acid, draw the acid above the mark with the filler, let it down to the mark, deliver it into the flask on the white tile; add 2 drops of indicator.
5. Open the tap (one drop, two drops, faster portions, or hold to run) and swirl. Unswirled alkali gives a flash of colour where it lands (it is locally far more alkaline); swirling makes it fade until, at the end point, the colour stays. Overshooting is possible and real.
6. Read the final volume; rough run first, then accurate runs. Between runs the flask must be washed out with distilled water before the next portion of acid (refused otherwise); refill the burette through the funnel when it is low.

Mistakes are allowed and have the effect they would have at a real bench: an unrinsed burette dilutes the alkali (0.6 cm³ of water: titre too large), an unrinsed pipette dilutes the acid (0.3 cm³: titre too small), a pipette not let down to the mark delivers 0.5–1.2 cm³ too much, a flask rinsed with acid holds 1.0 cm³ extra, an air bubble left in the jet (0.15–0.35 cm³) comes out during the titration (titre too large), a funnel left in drips 0.05 cm³ into the burette each time the tap is used (titre too small), reading off eye level gives a parallax error, and judging the end point without swirling is recorded. Each mistake is written to the session's **technique notes** (run number and an examiner's sentence), which appear in the controls panel, as a "Technique notes" table in the bench record (so the teacher's review and the PDF report show it), and in the new automatic rubric row **Burette and pipette technique (3 marks; one lost per kind of mistake)**. The existing readings and accuracy marks are affected too, because the readings really are wrong.

**Osmosis** (`cutCylinders`, `trimCylinder`, `blot`, `putOnPan`, `clearPan`, `tareBalance`, `placeInTube`, `startTimer`, plus `select`, `recordInitial`, `wait`, `remove`, `recordFinal`):

1. Cut six cylinders with the cork borer (they come out 42–58 mm long and wet with sap).
2. Read each cylinder's length against the ruler (drawn, not printed) and trim it with the scalpel to a length the student chooses (good to about ±0.4 mm). Initial mass follows the length (0.054 g per mm).
3. Blot each cylinder, tare the balance with the weighing boat on it (refused with a cylinder on the pan), put each cylinder on the pan and record its mass.
4. Place each cylinder in its labelled tube (the student may choose the wrong tube), start the timer and fast-forward the lab clock (it reads 09:00 at the start; its hands sweep round in 3D).
5. Take each cylinder out, blot it, reweigh it.

Mistakes: not blotting after cutting adds 0.03–0.07 g of sap to the first weighing; not blotting after the solution adds 0.08–0.15 g (final masses too large, so the line crosses zero at too high a concentration); not taring adds the boat (1.2–1.6 g) to every mass, so every % change is too small; unequal lengths are not a fair test (shorter pieces also change slightly faster); a cylinder in the wrong tube really sat in that concentration. Each is recorded in the technique notes and marked in the rubric row **Preparing and weighing the cylinders (3 marks)**. The initial/final mass rows now compare what the student wrote with what the balance showed.

**Older sessions** (saved before this release) used one-click steps (`fillBurette`, `pipetteAcid`, `immerse` on ready-cut cylinders). They still replay and keep their original controls, 2D and 3D bench so they can be finished, and they are not marked on technique (the row does not apply). Once a session has used a step-by-step action, the one-click shortcuts are refused. Code: `shared/lab/experiments/titration.js`, `osmosis.js`; tests: `test/handsOnTitration.test.js`, `test/handsOnOsmosis.test.js`; UI: `frontend/src/lab/handsOnControls.jsx`, the hands-on views in `views2d.jsx`, `scene/titrationScene.js`, the osmosis scene in `scene/scenes.js`.

## AS & A Level Physics practicals

67 practicals across 16 chapters, from "Using apparatus" to "Quantum physics, nuclear physics and medical imaging". The topic list follows a standard AS & A Level practical course. **All procedures, models, questions and wording are Smartious's own; no textbook text is reproduced**, and nothing claims endorsement by an examination board. Curriculum links are marked unverified.

Each practical is a short specification passed to `definePractical()` (`shared/lab/practical.js`). The engine gives every practical the same workflow:

1. **Collect apparatus** from the stockroom. It contains everything needed plus a few unnecessary items; a complete first choice with at most one extra earns the apparatus mark.
2. **One-off measurements** (a diameter, a mass). The student reads the instrument and types the value.
3. **Vary the independent variable** and read the instruments. Readings come from the physics model with a seeded random error of the size typical for that instrument, so repeats differ and a reload gives the same readings. Some practicals have extra conditions (for example a lid on or off) plotted as separate series.
4. **Choose the graph axes**, including transforms (squared, square root, reciprocal, ln, lg), to get a straight line.
5. **Answer** with the result(s) from the gradient or intercept, plus conceptual and evaluation questions.

**Automatic marks:** apparatus, readings match the instruments, range and number of values, repeats where required, correct axes, each result (one mark for agreeing with the student's own data, one for agreeing with the model's true value) and conceptual multiple-choice questions. **Teacher marks:** table, graph, working and evaluation, plus the plan for planning practicals.

**Planning practicals** (9.1, 9.3, 9.5, 9.7, 12.3, 13.1, 13.3, 13.5, 14.2, 14.3, 15.1, 15.3, 15.4) add four planning questions marked by the teacher, and still provide a full simulated bench so the student can test the plan.

**Models labelled "simplified"** are idealised beyond textbook physics (for example rubber-band stretching, filament lamps, LDRs, levitating rings and eddy currents) and say what they leave out. Practicals that schools cannot do with real equipment (planetary motion, gravitational potential, X-ray attenuation, the Larmor frequency) are clearly labelled as simulations. Practicals with high voltage (the electron deflection tube) or radioactive sources are marked as teacher-only in their safety notes.

**Calibration:** for every practical, a simulated careful student scores every automatic mark on 6 test seeds (`test/practicals.test.js`). During writing, each was also run on 200–500 seeds. Tolerances on the true value are 5–12 % and were set above the worst error seen, never loosened to hide a noisy method. A rare miss remains for 5.1 (Young modulus of nylon, about 1 run in 300), caused by the real uncertainty of measuring a 0.3 mm line with a 0.01 mm micrometer.

**Stand-in apparatus:** a few items use the closest stockroom item: steel wire for the stationary-wave wire (8.1), a ray box as the illuminated object (8.3), a d.c. supply for the EHT supply (14.5), a GM tube for the X-ray detector (16.3), and a coil for the NMR probe (16.4). The protactinium source (16.2) is described in the procedure but has no stockroom item.

### Adding another curriculum

Create a folder such as `shared/lab/experiments/<collection>/` with chapter files that export `definePractical({...})` specifications (see `physics-al/ch01.js`), give them a `collection: { id, name, code, chapter }`, and add the array to `experiments/index.js`. Use only ids from `shared/lab/apparatus.js`; add new items there first and give each a 3D model in `frontend/src/lab/scene/apparatus3d.js`. While writing, check a file with:

```bash
cd shared/lab && node test/checkChapter.mjs experiments/<collection>/ch01.js
```

New experiments start **in review**: publish them from Content review.

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
  scene/                    engine3d.js (Three.js framework), equipment.js, labRoom.js (the room), scenes.js, titrationScene.js, LabViewport.jsx
  handsOnControls.jsx       step-by-step titration and osmosis panels; benchMode.js tells old one-click sessions apart
  views2d.jsx, controls.jsx, panels.jsx
  TeacherDashboard.jsx, SessionReview.jsx, ContentAdmin.jsx, lab.css
```

**The action log is the record.** A session stores a server-generated seed and the list of actions the student took (for example `addBase {volume: 0.05}` or `recordReading {which: 'final', value: 23.45}`). The browser replays the actions for an instant response; on every save the server replays them again with the same engine and refuses any action that is not valid. Marks are computed on the server at submission from that replay, so changing values in the browser cannot change a grade.

**Hidden values.** Each attempt has its own hidden quantities (the acid concentration, the exact resistance, the isotonic point), derived from the seed. Students read instruments, record readings and calculate; the rubric compares what they recorded with what the instrument showed and what they calculated with what their own data give.

### Scientific models

- **Titration:** exact charge balance for a monoprotic acid and a strong base, `[H⁺] + [Na⁺] = [OH⁻] + [A⁻]`, solved numerically for each added volume. Weak acids use their Ka (ethanoic acid 1.74 × 10⁻⁵). Indicator colour comes from the indicator equilibrium (pKIn), so the endpoint seen depends on the indicator chosen. The burette is read to 0.05 cm³.
- **Ohm's law:** the wired circuit is solved with modified nodal analysis. Supply internal resistance 0.5 Ω, ammeter 0.01 Ω, voltmeter 10 MΩ. A current above 5 A trips the supply. Resistors are E12 values with ±5 % tolerance.
- **Osmosis (simplified):** % change in mass = 40 × (C_iso − C) at equilibrium, capped at +18 % and −32 %, approached as 1 − e^(−t/45 min) for a 40 mm cylinder (τ scales with the cylinder's volume-to-surface ratio), with ±0.02 g blotting error. Sucrose uptake, cut-surface damage and temperature are not modelled. The interface and the report say so.

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
- **After deploying:** sign in as admin or Dean → Virtual Lab → Content review. Use "Change many at once" to publish a whole collection, or set experiments one by one.

## Tests

```bash
cd shared/lab && node --test test/*.test.js     # science models, experiments, grading, access, save/submit rules, view contract
cd backend   && node --test test/*.test.js      # /api/lab routes with in-memory models
```

Science tests check the models against known values: pH of strong and weak acids, equivalence points, half-equivalence pH = pKa, indicator transitions, series and parallel circuits, meter resistances, reversed leads, a voltmeter wired in series, short circuits, osmosis limits and time behaviour. Experiment tests run a full student walkthrough of each practical and check grading for correct and incorrect work.

## Verification status

What has been checked:

- 163 tests in `shared/lab` and 11 route tests in `backend` pass. One route test publishes a practical in bulk and runs it end to end: a student does it and the server marks the submission. The step-by-step titration and osmosis tests check a careful student scores every automatic mark (several seeds, and replay gives the same state), every refusal message, and the direction and size of every technique mistake.
- The new titration and osmosis scenes, 2D views and control panels were driven through whole practicals (by clicking the 3D apparatus and menus, in high and low graphics) with stand-ins for Three.js and React, and every button and hotspot was clicked at several points: no errors, and the careful runs left no technique notes. This checks the code paths, not what the scenes look like.
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
- To add a non-practical experiment (custom bench like the titration), write a definition in `shared/lab/experiments/` (the tests check its structure), add a 3D scene, a 2D view and controls, and register it in `experiments/index.js`.
- Experiment content is changed in code and released through review. The admin screen changes publication status only.
- There is no microscopy experiment. Any future one must use properly sourced, credited images or clearly labelled illustrations, never invented images presented as real specimens.
