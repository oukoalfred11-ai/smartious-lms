// Real anatomical models from the Z-Anatomy atlas (from BodyParts3D), converted
// with tools/models/blend2glb.py. Labels match the file's own anatomical names
// or Z-Anatomy materials; the descriptions are Smartious's own.
import * as THREE from 'three'
import { fromGLTF } from './gltfModel.js'

const R = 1   // label the one on the viewer's right of a left–right pair

export const heart = fromGLTF({
  url: '/models/heart-v1.glb',
  size: 0.5,
  view: { yaw: 0.35, pitch: 0.12 },
  // The chambers are closed shells: cut the front off and show their insides.
  cutaway: { normal: [0, 0, -1], at: 0.55 },
  materials: (m) => { m.material.side = THREE.DoubleSide },
  parts: [
    { id: 'ra', name: 'Right atrium', match: /^Right atrium$/, info: 'Receives deoxygenated blood from the body through the venae cavae and passes it to the right ventricle.' },
    { id: 'rv', name: 'Right ventricle', match: /^Right ventricle$/, info: 'Pumps deoxygenated blood to the lungs through the pulmonary artery. Its wall is thinner than the left ventricle’s.' },
    { id: 'la', name: 'Left atrium', match: /^Left atrium$/, info: 'Receives oxygenated blood from the lungs through the pulmonary veins and passes it to the left ventricle.' },
    { id: 'lv', name: 'Left ventricle', match: /^Left ventricle$/, info: 'Pumps oxygenated blood to the whole body through the aorta. It has the thickest muscular wall, to make the highest pressure.' },
    { id: 'tricuspid', name: 'Tricuspid valve', match: /leaflet of right atrioventricular valve/, info: 'The valve between the right atrium and right ventricle. Its leaflets close when the ventricle contracts, so blood cannot flow back.' },
    { id: 'bicuspid', name: 'Bicuspid (mitral) valve', match: /leaflet of left atrioventricular valve/, info: 'The valve between the left atrium and left ventricle. It stops blood flowing back into the atrium when the ventricle contracts.' },
    { id: 'pulmvalve', name: 'Pulmonary (semilunar) valve', match: /semilunar leaflet of pulmonary valve/, info: 'Three pocket-shaped cusps at the start of the pulmonary artery. They stop blood flowing back into the right ventricle.' },
    { id: 'aorticvalve', name: 'Aortic (semilunar) valve', match: /^(Left coronary|Right coronary|Non-coronary) leaflet$/, info: 'Three cusps at the start of the aorta. They stop blood flowing back into the left ventricle; the coronary arteries begin just above two of them.' },
    { id: 'papillary', name: 'Papillary muscles', match: /papillary muscle/, info: 'Small muscles inside the ventricles. Through the tendons (chordae tendineae) they hold the valve leaflets so they do not turn inside out.' },
    { id: 'pulmtrunk', name: 'Pulmonary artery (trunk)', match: /^Pulmonary trunk$/, info: 'Carries deoxygenated blood from the right ventricle to the lungs.' },
  ],
  status: () => 'A real human heart, cut open at the front to show the chambers and valves. (The aorta and the great veins are not part of this model.)',
})

export const organs = fromGLTF({
  url: '/models/organs-v1.glb',
  size: 0.6,
  view: { yaw: 0.25, pitch: 0.05 },
  parts: [
    { id: 'trachea', name: 'Trachea (windpipe)', match: /^Trachea$/, info: 'Carries air to and from the lungs. Rings of cartilage keep it open.' },
    { id: 'lungs', name: 'Lungs', match: /lobe of (right|left) lung/, side: R, info: 'Where gas exchange takes place: oxygen diffuses into the blood and carbon dioxide out of it, across millions of alveoli. The right lung has three lobes, the left two.' },
    { id: 'liver', name: 'Liver', match: /^Liver$/, info: 'The largest internal organ. It makes bile, stores glycogen, breaks down excess amino acids (making urea) and removes toxins such as alcohol.' },
    { id: 'gallbladder', name: 'Gallbladder', match: /^Gallbladder$/, info: 'Stores bile made by the liver and releases it into the duodenum, where it emulsifies fats.' },
    { id: 'stomach', name: 'Stomach', match: /^Stomach$/, info: 'Churns food with gastric juice: hydrochloric acid kills microorganisms and pepsin (protease) starts protein digestion.' },
    { id: 'duodenum', name: 'Duodenum (small intestine)', match: /^Duodenum$/, info: 'The first part of the small intestine, where pancreatic juice and bile are added to food.' },
    { id: 'pancreas', name: 'Pancreas', match: /^Pancreas$/, info: 'Makes digestive enzymes (amylase, protease, lipase) and the hormones insulin and glucagon that control blood glucose.' },
    { id: 'colon', name: 'Large intestine (colon)', match: /colon$/, anchorFrom: /^Transverse colon$/, info: 'Absorbs water from the remaining undigested food, forming faeces.' },
    { id: 'appendix', name: 'Appendix', match: /^Vermiform appendix$/, info: 'A small tube attached to the start of the large intestine.' },
    { id: 'bladder', name: 'Urinary bladder', match: /^Urinary bladder$/, info: 'Stores urine made by the kidneys until it is released.' },
    { id: 'thyroid', name: 'Thyroid gland', match: /^Thyroid gland$/, info: 'An endocrine gland in the neck that makes thyroxine, which controls the rate of metabolism.' },
    { id: 'adrenal', name: 'Adrenal glands', match: /^Suprarenal gland/, side: R, info: 'Endocrine glands on top of the kidneys that make adrenaline, the “fight or flight” hormone.' },
  ],
  status: () => 'Real organs of the chest and abdomen. (The oesophagus, small intestine, spleen and kidneys are not part of this model.)',
})

export const brain = fromGLTF({
  url: '/models/brain-v1.glb',
  size: 0.45,
  view: { yaw: 1.25, pitch: 0.2 },
  parts: [
    { id: 'frontal', name: 'Frontal lobe', material: /^Frontal lobe$/, not: /^(Corpus callosum|Midbrain)/, side: R, info: 'At the front of the cerebrum. It controls voluntary movement (the motor cortex), speech, planning, decisions and personality.' },
    { id: 'parietal', name: 'Parietal lobe', material: /^Parietal lobe$/, side: R, info: 'Behind the frontal lobe. It receives touch, temperature and pain from the skin (the sensory cortex) and works out where things are.' },
    { id: 'temporal', name: 'Temporal lobe', material: /^Temporal lobe$/, side: R, info: 'At the side of the cerebrum. It deals with hearing, understanding language and memory.' },
    { id: 'occipital', name: 'Occipital lobe', material: /^Occipital lobe$/, side: R, info: 'At the back of the cerebrum. It processes what we see (the visual cortex).' },
    { id: 'cerebellum', name: 'Cerebellum', material: /^Cerebellum$/, side: R, info: 'Below the back of the cerebrum. It coordinates movement and balance and keeps posture steady.' },
    { id: 'brainstem', name: 'Brainstem', match: /^(Medulla oblongata|Pons|Midbrain|Base of peduncle)/, side: R, info: 'The midbrain, pons and medulla join the brain to the spinal cord. The medulla controls breathing rate, heart rate and other automatic actions.' },
    { id: 'callosum', name: 'Corpus callosum', match: /^Corpus callosum$/, info: 'A thick band of nerve fibres that connects the left and right halves of the cerebrum.' },
    { id: 'central', name: 'Central sulcus', match: /^Central sulcus/, side: R, info: 'The groove between the frontal and parietal lobes: the motor cortex lies in front of it and the sensory cortex behind it.' },
  ],
  status: () => 'A real human brain. Each lobe of the cerebrum has its own colour; the grooves (sulci) between them show where one lobe ends and the next begins.',
})

// Superficial muscles over the skeleton. Muscles hidden under others were left
// out when converting (tools/models/README.md), so the file stays small.
const L = -1   // label the one on the viewer's left
export const muscles = fromGLTF({
  url: '/models/muscles-v1.glb',
  size: 0.9,
  view: { yaw: 0.3, pitch: 0.05 },
  parts: [
    { id: 'masseter', at: 0.895, name: 'Masseter', match: /masseter/, side: R, info: 'A strong muscle at the side of the jaw. It contracts to close the jaw when you chew.' },
    { id: 'scm', at: 0.855, name: 'Sternocleidomastoid', match: /^Sternocleidomastoid/, side: R, info: 'Runs from behind the ear to the sternum and clavicle. It turns and bends the head.' },
    { id: 'trapezius', name: 'Trapezius', match: /trapezius muscle/, side: R, info: 'A large diamond-shaped muscle of the upper back and neck. It raises, pulls back and turns the shoulder blades.' },
    { id: 'deltoid', at: 0.8, name: 'Deltoid', match: /deltoid muscle/, side: L, info: 'The rounded muscle over the shoulder joint. It lifts the arm out to the side, forwards and backwards.' },
    { id: 'pectoralis', at: 0.745, name: 'Pectoralis major', match: /pectoralis major/, side: R, info: 'The large chest muscle. It pulls the arm forwards and across the body, as in a push-up.' },
    { id: 'biceps', at: 0.7, name: 'Biceps', match: /biceps brachii/, side: L, info: 'At the front of the upper arm. When it contracts it bends (flexes) the arm at the elbow. Biceps and triceps are an antagonistic pair: when one contracts, the other relaxes.' },
    { id: 'triceps', name: 'Triceps', match: /triceps brachii/, side: L, info: 'At the back of the upper arm. When it contracts it straightens (extends) the arm at the elbow, working against the biceps.' },
    { id: 'latissimus', name: 'Latissimus dorsi', match: /^Latissimus dorsi/, side: R, info: 'A broad, flat muscle of the lower back that pulls the arm down and backwards, as in climbing or swimming.' },
    { id: 'oblique', at: 0.58, name: 'Abdominal muscles (external oblique)', match: /^External abdominal oblique/, side: R, info: 'Muscles of the abdominal wall. They bend and twist the trunk, hold the organs in place and help force air out in heavy breathing.' },
    { id: 'gluteus', name: 'Gluteus maximus', match: /^Gluteus maximus/, side: R, info: 'The large muscle of the buttock, the biggest in the body. It straightens the hip when you stand up, climb or run.' },
    { id: 'quadriceps', at: 0.37, name: 'Quadriceps', match: /^(Rectus femoris|Vastus)/, side: R, info: 'Four muscles at the front of the thigh that straighten the leg at the knee. The hamstrings are their antagonists.' },
    { id: 'hamstrings', name: 'Hamstrings', match: /^(Long head of biceps femoris|Short head of biceps femoris|Semitendinosus|Semimembranosus)/, side: R, info: 'Three muscles at the back of the thigh that bend the leg at the knee and straighten the hip.' },
    { id: 'sartorius', at: 0.43, name: 'Sartorius', match: /^Sartorius/, side: R, info: 'The longest muscle in the body, a strap running across the front of the thigh. It helps bend the hip and knee.' },
    { id: 'calf', name: 'Calf (gastrocnemius and soleus)', match: /gastrocnemius|^Soleus/, side: R, info: 'The calf muscles pull on the heel through the Achilles tendon, raising the heel so you can stand on tiptoe, walk and jump.' },
    { id: 'tibialis', at: 0.18, name: 'Tibialis anterior', match: /^Tibialis anterior/, side: R, info: 'At the front of the shin. It lifts the front of the foot, the antagonist of the calf muscles.' },
  ],
  status: () => 'Skeletal muscles move the body by contracting and pulling on bones through tendons. A muscle can only pull, so muscles work in antagonistic pairs.',
})
