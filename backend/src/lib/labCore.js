/**
 * labCore.js — loads the shared Virtual Lab engine (ESM, in /shared/lab at
 * the repository root) into this CommonJS backend. The same code runs in
 * the browser, so the server re-marks exactly what the student saw.
 * Render clones the whole repository, so ../../../shared is present at runtime.
 */
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..', '..', '..', 'shared', 'lab');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);

let cached = null;
function labCore() {
  if (!cached) {
    cached = Promise.all([load('engine.js'), load('experiments/index.js'), load('access.js'), load('sessionOps.js'), load('apparatus.js')])
      .then(([engine, experiments, access, ops, apparatus]) => ({ engine, experiments, access, ops, apparatus }))
      .catch((e) => { cached = null; throw e; });
  }
  return cached;
}

module.exports = { labCore, LAB_ROOT: ROOT };
