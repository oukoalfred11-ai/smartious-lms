export const TOKENS = {
  // Brand
  crimson: '#7D1025',
  crimsonDeep: '#5A0B1B',
  crimsonLight: '#A51C2E',
  gold: '#C9A030',
  goldLight: '#F0CC5A',
  goldPale: '#FBF6E3',
  cream: '#FBFAF5',
  // Module accents (warm, refined Apple-style)
  accentTeal: '#0F766E',
  accentEmerald: '#15803D',
  accentNavy: '#1E3A8A',
  accentAmber: '#B45309',
  accentPurple: '#6B21A8',
  accentRose: '#BE123C',
  accentSlate: '#475569',
  accentOcean: '#0369A1',
  // Neutrals
  ink: '#1A0F0E',
  s900: '#231715',
  s700: '#564844',
  s500: '#857973',
  s400: '#A89E99',
  s300: '#CFC7C2',
  s200: '#E8E1DC',
  s100: '#F4EFEB',
  s50: '#FAF7F4',
  white: '#FFFFFF',
  // Spacing scale (premium = generous)
  spacing: { xs: 4, sm: 8, md: 14, lg: 22, xl: 32, xxl: 48 },
}

// ⚠ Keep in step with backend constants/curriculum.js — that is the
// source of truth. This list drives the admin Teachers and Allocations
// modules; a curriculum missing here cannot be assigned to a teacher,
// which is how KCSE could be created, spined and loaded yet still be
// unselectable when saving teaching specialties.
export const SCHOOL_CURRICULA = [
  { id: 'CambridgePrimary',   name: 'Cambridge Primary' },
  { id: 'CambridgeLowerSec',  name: 'Cambridge Lower Secondary' },
  { id: 'CambridgeIGCSE',     name: 'Cambridge IGCSE' },
  { id: 'CambridgeALevel',    name: 'Cambridge A-Level' },
  { id: 'EdexcelPrimary',     name: 'Edexcel iPrimary' },
  { id: 'EdexcelLowerSec',    name: 'Edexcel Lower Secondary' },
  { id: 'EdexcelIGCSE',       name: 'Edexcel IGCSE' },
  { id: 'EdexcelALevel',      name: 'Edexcel A-Level' },
  { id: 'AQALowerSec',        name: 'AQA Lower Secondary' },
  { id: 'AQAGCSE',            name: 'AQA GCSE' },
  { id: 'AQAALevel',          name: 'AQA A-Level' },
  { id: 'IBPYP',              name: 'IB Primary Years (PYP)' },
  { id: 'IBMYP',              name: 'IB Middle Years (MYP)' },
  { id: 'IBDP',               name: 'IB Diploma (DP)' },
  { id: 'BNC',                name: 'British National Curriculum' },
  { id: 'American',           name: 'American Curriculum' },
  { id: 'Canadian',           name: 'Canadian Curriculum' },
  { id: 'KenyaCBE',           name: 'Kenya CBE' },
  { id: 'KCSE',               name: 'KCSE (Form 3-4)' },
]
