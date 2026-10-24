// Spacecraft from NASA's 3D Resources (github.com/nasa/NASA-3D-Resources), which
// NASA publishes free of copyright. The NASA insignia and logotype and the JPL
// logo were painted out of the textures (NASA's guidelines restrict their use);
// the descriptions are Smartious's own. Not endorsed by NASA.
import { fromGLTF } from './gltfModel.js'

// The rocket's body is one mesh in the file, so its stages are labelled by height.
export const saturnV = fromGLTF({
  url: '/models/saturn-v-v1.glb',
  size: 0.9,
  animations: false,
  view: { yaw: 0.3, pitch: 0.05 },
  parts: [
    { id: 'les', name: 'Launch escape tower', at: 0.975, info: 'A small solid rocket on top. In an emergency at launch it would pull the command module and crew away from the rocket; otherwise it was thrown away after the second stage lit.' },
    { id: 'cm', name: 'Command module', at: 0.92, info: 'The cone-shaped capsule where the three astronauts lived. It was the only part to return to Earth, protected by its heat shield.' },
    { id: 'sm', name: 'Service module', at: 0.885, info: 'Held the main engine, fuel, oxygen and electrical power for the command module. It was let go just before re-entry.' },
    { id: 'sla', name: 'Lunar module adapter', at: 0.82, info: 'The tapered section that carried the lunar module, folded up inside, until the spacecraft was on its way to the Moon.' },
    { id: 'iu', name: 'Instrument unit', at: 0.77, info: 'A ring of computers and gyroscopes that steered the rocket during launch.' },
    { id: 's4b', name: 'Third stage (S-IVB)', at: 0.7, info: 'One J-2 engine burning liquid hydrogen and liquid oxygen. It finished putting the spacecraft into Earth orbit, then fired again to send it towards the Moon.' },
    { id: 's2', name: 'Second stage (S-II)', at: 0.5, info: 'Five J-2 engines burning liquid hydrogen and liquid oxygen, from about 67 km up to the edge of space.' },
    { id: 's1', name: 'First stage (S-IC)', at: 0.25, info: 'Five F-1 engines burning kerosene and liquid oxygen, giving about 34 million newtons of thrust for the first 2½ minutes. Empty stages are dropped, so the rocket’s mass falls and its acceleration rises.' },
    { id: 'f1', name: 'F-1 engines', match: /^polySurfa/, at: 0.02, info: 'Hot gas is pushed out of the nozzles downwards at high speed; by Newton’s third law the gas pushes the rocket upwards with an equal and opposite force.' },
    { id: 'fins', name: 'Fins', match: /^(group6 pCu|group7 pCu|pCube1 gr)/, side: 1, at: 0.045, info: 'Four fins at the base keep the rocket stable in the lower atmosphere.' },
  ],
  status: () => 'The Saturn V: 110 m tall and almost 3 000 tonnes at launch. It carried the Apollo astronauts to the Moon from 1969 to 1972.',
})

export const lunarModule = fromGLTF({
  url: '/models/apollo-lunar-module-v1.glb',
  size: 0.6,
  animations: false,
  view: { yaw: 0.5, pitch: 0.15 },
  parts: [
    { id: 'ascent', name: 'Ascent stage (crew cabin)', match: /^polySurfac002/, info: 'The pressurised cabin where two astronauts flew down to the Moon. To leave, it took off on its own engine, using the descent stage as a launch pad.' },
    { id: 'descent', name: 'Descent stage', match: /^pCylinder1$/, info: 'The lower stage, wrapped in gold-coloured foil that reflects heat. Its rocket engine slowed the module down to land; it stayed on the Moon.' },
    { id: 'legs', name: 'Landing legs and footpads', match: /^group31/, side: 1, info: 'Four legs with crushable shock absorbers and wide footpads that spread the weight over the dusty ground, giving a low pressure.' },
    { id: 'ladder', name: 'Ladder', match: /^polySurfa1$/, info: 'Fixed to the front leg. The astronauts climbed down it to step onto the Moon.' },
    { id: 'hatch', name: 'Forward hatch and porch', match: /^(pCube27|pCube3|pCylinde11|pCylinder2)$/, info: 'The square hatch the astronauts crawled through, and the small platform outside it at the top of the ladder.' },
    { id: 'rcs', name: 'Thruster quads', match: /^polySurfa[34]$/, side: 1, info: 'Clusters of four small rocket thrusters at the corners of the cabin, used to turn and steer the module.' },
  ],
  status: () => 'The Apollo lunar module landed twelve astronauts on the Moon between 1969 and 1972.',
})

export const perseverance = fromGLTF({
  url: '/models/perseverance-v1.glb',
  size: 0.6,
  view: { yaw: 0.6, pitch: 0.2 },
  pose: 10,   // mast raised and arm out, as on Mars
  parts: [
    { id: 'mast', name: 'Remote sensing mast', match: /^(Cylinder|bottom|top|Cylinder\.002)$/, not: /^(head|lens|Mastcam_Z_cams|NavCams|microphones\.001)$/, info: 'The rover’s “neck”, about 2 m above the ground. It turns the cameras and instruments on its head to look around.' },
    { id: 'mastcam', name: 'Mastcam-Z cameras', match: /^Mastcam_Z_cams$/, info: 'Two zoomable colour cameras set apart like eyes, so together they take 3D (stereo) images.' },
    { id: 'supercam', name: 'SuperCam', match: /^(head|lens)$/, not: /^(Mastcam_Z_cams|NavCams|microphones\.001)$/, info: 'Fires a laser at rocks up to 7 m away and studies the light from the glowing vapour (spectroscopy) to find which elements they contain.' },
    { id: 'navcams', name: 'Navigation cameras', match: /^NavCams$/, info: 'Black-and-white cameras that the rover uses to see the ground ahead and plan a safe path.' },
    { id: 'hazcams', name: 'Hazard cameras', match: /^hazcams_(front|rear)$/, info: 'Wide-angle cameras low down at the front and back that spot rocks and slopes to avoid.' },
    { id: 'arm', name: 'Robotic arm', match: /^arm\.00[0-4]$|^arm$/, not: /^turret_obj/, info: 'A 2 m arm with five joints that places the tools on its end against rocks.' },
    { id: 'drill', name: 'Coring drill', match: /^corring_drill$/, info: 'Drills out rock cores about the size of a piece of chalk, which are sealed in tubes and left for a later mission to bring back to Earth.' },
    { id: 'pixl', name: 'PIXL', match: /^(PIXL|PIXL_cover_01)$/, info: 'Shines X-rays on a rock and measures the X-rays given off, to map the chemical elements in it.' },
    { id: 'watson', name: 'WATSON camera', match: /^WATSON$/, info: 'A close-up camera on the arm, like a hand lens, that photographs rock grains and textures.' },
    { id: 'rtg', name: 'Power source (MMRTG)', match: /^rtg$/, info: 'Heat from decaying plutonium-238 is changed into electricity by thermocouples, about 110 W, day and night, for many years.' },
    { id: 'hga', name: 'High-gain antenna', match: /^antenna_hg$/, info: 'A flat, steerable antenna that sends radio signals straight to Earth.' },
    { id: 'uhf', name: 'UHF antenna', match: /^antenna_uhf$/, info: 'Sends most of the data to spacecraft orbiting Mars, which relay it to Earth.' },
    { id: 'wheels', name: 'Wheels', match: /^Wheels_objs$/, info: 'Six aluminium wheels with treads (grousers) for grip; each has its own motor.' },
    { id: 'suspension', name: 'Rocker-bogie suspension', match: /^suspension$/, info: 'Lets each wheel move up and down over rocks while the body stays level, without any springs.' },
  ],
  status: () => 'NASA’s Perseverance rover landed in Jezero Crater on Mars in 2021 to look for signs of ancient life.',
})

export const ingenuity = fromGLTF({
  url: '/models/ingenuity-v1.glb',
  size: 0.5,
  animations: false,
  view: { yaw: 0.4, pitch: 0.25 },
  parts: [
    { id: 'rotors', name: 'Rotors', match: /^rotors_0[12]$/, info: 'Two rotors, 1.2 m across, spin in opposite directions at about 2 400 rpm. Mars’s air is about 100 times thinner than Earth’s, so they must spin very fast to push enough air down for lift.' },
    { id: 'solar', name: 'Solar panel', match: /^solar_panel$/, info: 'Charges the batteries from sunlight between flights.' },
    { id: 'bus', name: 'Fuselage', match: /^bus$/, info: 'The box holding the batteries, computers and heaters that keep the electronics warm through the freezing Martian night.' },
    { id: 'cams', name: 'Cameras', match: /^cams$/, info: 'A navigation camera looks down to track the ground and a colour camera takes pictures.' },
    { id: 'legs', name: 'Landing legs', match: /^leg_0[1-4]$/, side: 1, info: 'Four thin, springy carbon-fibre legs for landing.' },
  ],
  status: () => 'Ingenuity, a 1.8 kg helicopter, made the first powered flight on another planet on 19 April 2021 and flew 72 times on Mars.',
})
