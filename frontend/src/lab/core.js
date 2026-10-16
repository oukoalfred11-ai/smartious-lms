// Single import point for the shared Virtual Lab engine (repo-root /shared/lab).
// The same code runs on the server, which re-marks every submission.
export { paramsFor, applyAction, replay, viewOf, gradeSession, validateDefinition, LabActionError } from '../../../shared/lab/engine.js'
export { EXPERIMENTS, getExperiment, catalogueEntry } from '../../../shared/lab/experiments/index.js'
export { NOTEBOOK_SECTIONS } from '../../../shared/lab/sessionOps.js'
export { INDICATORS } from '../../../shared/lab/science/indicators.js'
export { terminalsOf } from '../../../shared/lab/science/circuit.js'
