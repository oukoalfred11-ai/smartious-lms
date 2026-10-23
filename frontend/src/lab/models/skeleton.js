// The human skeleton: a real anatomical model (Z-Anatomy, from BodyParts3D),
// converted from Blender to public/models/skeleton.glb. Labels are matched to
// the file's own anatomical names; left and right bones are labelled once,
// pointing at the one on the viewer's right (side: 1, chosen by position:
// the file's .l/.r/.001 suffixes are not consistent in the hands).
import { fromGLTF } from './gltfModel.js'

const R = 'right'   // left–right pair: label the one on the viewer's right
const part = (id, name, match, info, from = null) => ({ id, name, match, info, side: 1, ...(from && from !== R ? { anchorFrom: from } : {}) })
// The arm and shoulder labels point at the bones on the viewer's left, so the two label columns balance.
const left = (p) => ({ ...p, side: -1 })

export default fromGLTF({
  url: '/models/skeleton-v1.glb',
  size: 0.9,
  view: { yaw: 0.35, pitch: 0.08 },
  parts: [
    part('cranium', 'Cranium (skull)', /^(Frontal bone|Parietal bone|Occipital bone|Temporal bone|Sphenoid bone|Ethmoid bone|Nasal bone|Zygomatic bone|Maxilla|Lacrimal bone|Palatine bone|Vomer|Inferior nasal concha|Sinus of)/,
      'Fused bones that protect the brain and support the face. The joints between them (sutures) do not move.', /^Parietal bone/),
    part('mandible', 'Mandible (lower jaw)', /^Mandible$/, 'The only skull bone that moves. It holds the lower teeth and hinges on the temporal bones for chewing and speaking.'),
    left(part('teeth', 'Teeth', /(incisor|canine|premolar|molar)/i, 'Incisors cut, canines tear, premolars and molars grind food. An adult has 32 teeth.', /^Upper (canine|first premolar)/)),
    part('cervical', 'Cervical vertebrae', /^(Atlas \(C1\)|Axis \(C2\)|Vertebra C\d)$/, 'Seven vertebrae of the neck. The top two (atlas and axis) let the head nod and turn.', /^Vertebra C4$/),
    part('thoracic', 'Thoracic vertebrae', /^Vertebra T\d+$/, 'Twelve vertebrae of the chest; each one joins a pair of ribs.', /^Vertebra T10$/),
    part('lumbar', 'Lumbar vertebrae', /^Vertebra L\d$/, 'Five large vertebrae of the lower back that carry most of the body’s weight.', /^Vertebra L3$/),
    part('sacrum', 'Sacrum', /^Sacrum$/, 'Five fused vertebrae that join the spine to the pelvis.'),
    part('coccyx', 'Coccyx', /^Coccyx$/, 'The tail bone: a few small fused vertebrae at the base of the spine.'),
    left(part('clavicle', 'Clavicle (collar bone)', /^Clavicle/, 'Holds the shoulder out from the body and joins the scapula to the sternum.', R)),
    left(part('scapula', 'Scapula (shoulder blade)', /^Scapula/, 'A flat, triangular bone. Its socket forms the shoulder joint with the humerus, and many arm muscles attach to it.', R)),
    part('sternum', 'Sternum (breastbone)', /^(Sternum|Manubrium of sternum|Xiphoid process)$/, 'The flat bone at the front of the chest. The ribs are joined to it by costal cartilage.', /^Sternum$/),
    left(part('ribs', 'Ribs', /\brib\.(l|r)$/, 'Twelve pairs of curved bones forming the rib cage, which protects the heart and lungs and moves in breathing.', /^Sixth rib/)),
    part('cartilage', 'Costal cartilage', /^Costal cartilage/, 'Flexible cartilage joining the ribs to the sternum, so the rib cage can move when you breathe.', /^Costal cartilage of 7th rib/),
    left(part('humerus', 'Humerus', /^Humerus/, 'The long bone of the upper arm, from the shoulder (ball and socket joint) to the elbow (hinge joint).', R)),
    left(part('radius', 'Radius', /^Radius/, 'The forearm bone on the thumb side. It rolls around the ulna to turn the palm up and down.', R)),
    left(part('ulna', 'Ulna', /^Ulna/, 'The forearm bone on the little-finger side; it forms the hinge of the elbow with the humerus.', R)),
    left(part('carpals', 'Carpals (wrist bones)', /^(Scaphoid|Lunate|Triquetrum|Pisiform|Trapezium|Trapezoid|Capitate|Hamate) bone/, 'Eight small bones in two rows that make the wrist flexible.', /^Capitate bone/)),
    left(part('metacarpals', 'Metacarpals', /metacarpal/, 'Five bones forming the palm of the hand.', /^Third metacarpal bone/)),
    left(part('handphal', 'Phalanges (fingers)', /phalanx.*of hand/, 'Fourteen finger bones: three in each finger and two in the thumb.', /^Middle phalanx of third finger of hand/)),
    part('pelvis', 'Pelvis (hip bones)', /^Hip bone/, 'Each hip bone is three fused bones (ilium, ischium and pubis). With the sacrum they form the pelvis, which supports the trunk and protects the organs in it.', R),
    part('femur', 'Femur (thigh bone)', /^Femur/, 'The longest and strongest bone. Its ball-shaped head fits the hip socket (ball and socket joint); at the knee it forms a hinge joint.', R),
    part('patella', 'Patella (kneecap)', /^Patella/, 'A small bone inside the tendon at the front of the knee. It protects the joint and helps the thigh muscles straighten the leg.', R),
    part('tibia', 'Tibia (shin bone)', /^Tibia/, 'The larger bone of the lower leg, which carries the body’s weight from the knee to the ankle.', R),
    part('fibula', 'Fibula', /^Fibula/, 'The thin bone beside the tibia. It carries little weight but muscles attach to it and it steadies the ankle.', R),
    part('tarsals', 'Tarsals (ankle bones)', /^(Calcaneus|Talus|Navicular bone|Cuboid bone|Medial cuneiform|Intermediate cuneiform|Lateral cuneiform)/, 'Seven bones of the ankle and back of the foot, including the heel bone (calcaneus).', /^Calcaneus/),
    part('metatarsals', 'Metatarsals', /metatarsal/, 'Five long bones of the foot that form its arches with the tarsals.', /^Third metatarsal bone/),
    part('footphal', 'Phalanges (toes)', /phalanx.*of foot/, 'Fourteen toe bones: two in the big toe and three in each of the others.', /^Proximal phalanx of third finger of foot/),
    part('hyoid', 'Hyoid bone', /^Hyoid bone$/, 'A U-shaped bone in the neck, not joined to any other bone. It supports the tongue and helps with swallowing.'),
  ],
  status: () => 'An adult skeleton has 206 bones. It supports the body, protects organs, lets muscles move it at joints, and makes blood cells in the bone marrow.',
})
