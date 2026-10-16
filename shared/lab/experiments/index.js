/**
 * Registry of experiments. Add a definition file and list it here; the app
 * (library, workspace, grading, teacher views) picks it up without UI code
 * changes beyond its scene/controls.
 */
import titration from './titration.js'
import ohmsLaw from './ohms-law.js'
import osmosis from './osmosis.js'
import { PHYSICS_AL } from './physics-al/index.js'

export const EXPERIMENTS = [titration, ohmsLaw, osmosis, ...PHYSICS_AL]
export const getExperiment = (id) => EXPERIMENTS.find(e => e.id === id) || null

/** Catalogue entry safe to send to any client (no functions, nothing hidden). */
export function catalogueEntry(def) {
  return {
    id: def.id, version: def.version, subject: def.subject, title: def.title, summary: def.summary, collection: def.collection || null,
    durationMin: def.durationMin, difficulty: def.difficulty, curriculum: def.curriculum.filter(c => !c.syllabusRef || c.verified),
    skills: def.skills, objectives: def.objectives, prerequisites: def.prerequisites, safety: def.safety,
    apparatus: def.apparatus, materials: def.materials, procedure: def.procedure,
    model: { kind: def.model.kind, summary: def.model.summary, assumptions: def.model.assumptions },
    notebook: def.notebook,
    questions: def.questions.map(({ id, type, unit, prompt, hint, options }) => ({ id, type, unit, prompt, hint, options })),
    rubric: def.rubric.map(({ id, label, marks, auto, guidance }) => ({ id, label, marks, auto: !!auto, guidance: guidance || '' })),
  }
}
