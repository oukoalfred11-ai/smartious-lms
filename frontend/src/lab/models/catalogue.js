// The 3D models library. No three.js here, so the gallery loads quickly;
// each model's code is fetched only when it is opened.
//
// Models from real 3D files (frontend/public/models/*.glb, loaded with
// gltfModel.js) must carry a credit, shown on the model's page:
//   credit: { title, author, source, url, licence, licenceUrl, changes }
// Only files whose licence allows use in a school platform are added
// (CC0, CC BY, CC BY-SA with the same licence kept on our changes).
export const MODELS = [
  { id: 'heart', subject: 'biology', topic: 'Transport in animals', title: 'The human heart', summary: 'A section through the heart: four chambers, valves, septum and the great vessels. Watch it beat and follow the blood through it.', load: () => import('./heart.js').then(m => m.default) },
  { id: 'skeleton', subject: 'biology', topic: 'Movement and support', title: 'The human skeleton (real anatomical model)', summary: 'A complete adult skeleton from real anatomical data: every bone named, from the cranium to the toes. Turn it, click any bone and test yourself on 28 bones and groups.', load: () => import('./skeleton.js').then(m => m.default),
    credit: { title: 'Z-Biomechanics', author: 'BodyParts3D, © The Database Center for Life Science; mixed and modified by Z-anatomy.com', source: 'Z-Anatomy', url: 'https://www.z-anatomy.com', licence: 'CC BY-SA 2.1 Japan', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en', changes: 'Converted to glTF and simplified for the web by Smartious; the converted file is shared under the same licence.' } },
  { id: 'eye', subject: 'biology', topic: 'Coordination and response', title: 'The human eye', summary: 'A cut-away eye from cornea to optic nerve. See how the ciliary muscle and lens change shape to focus near and far.', load: () => import('./eye.js').then(m => m.default) },
  { id: 'animal-cell', subject: 'biology', topic: 'Cell structure', title: 'Animal cell', summary: 'An animal cell cut open: nucleus, mitochondria, ribosomes, rough ER, Golgi apparatus, membrane and cytoplasm.', load: () => import('./cells.js').then(m => m.animalCell) },
  { id: 'plant-cell', subject: 'biology', topic: 'Cell structure', title: 'Plant cell', summary: 'A plant cell cut open: cell wall, vacuole, chloroplasts and the organelles it shares with animal cells. Watch the chloroplasts stream.', load: () => import('./cells.js').then(m => m.plantCell) },
  { id: 'motor', subject: 'physics', topic: 'Electromagnetic effects', title: 'D.C. electric motor', summary: 'Magnets, coil, split-ring commutator and brushes, with the field, current and forces drawn. Run it to see why the coil keeps turning.', load: () => import('./motor.js').then(m => m.default) },
  { id: 'engine', subject: 'physics', topic: 'Energy and machines', title: 'Four-stroke petrol engine', summary: 'A cut-away single-cylinder engine. Run it through induction, compression, power and exhaust and watch the valves, piston and crankshaft.', load: () => import('./engine.js').then(m => m.default) },
]
export const getModel = (id) => MODELS.find(m => m.id === id) || null
