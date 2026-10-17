// Sessions started on the one-click bench (before the step-by-step bench
// existed) keep their original controls so they can be finished; every new
// session works step by step. Used by the controls, the 2D view and the 3D scenes.
export const oneClickTitration = (v) => !!v && !v.handsOn && (v.burette.fills > 0 || v.flask.hasAcid || v.runs.some(r => r.initial != null))
export const oneClickOsmosis = (v) => !!v && !v.handsOn && (v.immersed || v.tubes.some(t => t.m0 != null))
