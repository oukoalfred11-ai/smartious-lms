// ═══════════════════════════════════════════════════════════════════
// AUSTRALIA — Smartious city-level + country-level data (v2 UPGRADE)
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for diaspora, returning-expat, regional, and
// Cambridge-pathway Australian families across Sydney, Melbourne,
// Brisbane, Perth, Adelaide, and regional & remote Australia.
//
// UPGRADE NOTE: Australia previously ran as a legacy simple page via
// data/countries.js (isAustralia rich sections). This v2 file takes
// over the /online-school/australia route through the standard hub
// dispatch; the legacy object is left untouched and becomes unused
// for that route. Legacy research carried across in full: the
// state-by-state registration map, the diaspora personas, returning
// expats, regional/rural reach, and A-Level-to-ATAR conversion.
//
// LEGAL POSITIONING NOTE — READ BEFORE EDITING. THE CRITICAL RULE:
// Australia is the one market where our own regulatory position
// must be disclosed on every page. Homeschooling is legal in every
// state and territory, but EACH STATE LEGISLATES SEPARATELY and
// REGISTRATION WITH THE STATE AUTHORITY IS REQUIRED:
//   - Queensland — Home Education Unit (HEU): plan-based
//     registration, no home visits, annual report. Most permissive.
//   - Victoria — VRQA: registration plus a brief education plan; no
//     mandatory home visits or testing. Moderate.
//   - NSW — NESA: registration, curriculum alignment with the NSW
//     syllabuses/Australian Curriculum, home visits, renewal.
//   - Western Australia, South Australia, Northern Territory: more
//     regulated — registration, alignment, periodic moderator or
//     home visits, renewal.
//   - Tasmania (THEAC) and the ACT sit in the moderate band.
//   - NO RECIPROCAL RECOGNITION between states: moving from
//     Queensland to NSW means registering again from scratch.
// SMARTIOUS IS NOT AUSTRALIAN-REGISTERED AND DOES NOT SUBSTITUTE
// FOR STATE HOMESCHOOL REGISTRATION. Say so plainly and often. We
// supply curriculum, live teaching, assessment, and the progress
// documentation a registration application needs; the registration
// relationship is between the family and the state authority. Never
// imply otherwise, never state a state's decision in advance, and
// always point families to their own state authority for specifics.
// COMPULSORY PARTICIPATION — NO POST-16 WINDOW HERE, STATE IT:
// Australian states require participation in education, training,
// or employment until about 17 after Year 10 ("earn or learn").
// Unlike Hungary, Greece, Azerbaijan or Georgia, THERE IS NO free
// post-16 window in Australia — never claim one. The A-Level years
// run inside registration or alongside an enrolment.
// MARKET NOTE: Australian public schools are free and broadly
// capable and we do NOT compete with them — say so. The real
// segments are (1) South Asian diaspora wanting Cambridge, (2)
// African/Caribbean diaspora wanting academic connection home,
// (3) returning expats mid-IGCSE/IB, (4) Cambridge-pathway
// registered homeschoolers, (5) regional and remote families with
// no local IB/Cambridge option. Private school comparison: roughly
// AUD 25,000-45,000+ senior years; IB schools AUD 25,000-40,000.
// ATAR: Cambridge A-Level results convert to ATAR equivalents
// through UAC (NSW/ACT), VTAC (VIC), QTAC (QLD) and the equivalent
// centres — hedge with "conversion and requirements confirmed with
// the relevant admissions centre".
// TIMEZONE: AEST UTC+10 (AEDT +11 summer), ACST +9.5, AWST +8.
// Nairobi EAT is UTC+3, so Australia is 5-8 HOURS AHEAD. Nairobi
// MORNING teaching lands in the Australian AFTERNOON and early
// evening — Perth (AWST, +5) is the best-aligned. Frame it that
// way; never reuse the European "behind EAT" language.
// ═══════════════════════════════════════════════════════════════════

export const AUSTRALIA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'sydney-au',
    name: 'Sydney',
    county: 'New South Wales',
    region: 'The largest city · Greater Western Sydney\'s South Asian heartland — Parramatta, Westmead, Blacktown · returning-expat corridor · NESA\'s regulated registration regime',
    primaryKeyword: 'Online school and homeschool in Sydney',
    heroTagline: 'For Sydney families from Parramatta to the Northern Beaches — live Cambridge delivery in the Australian afternoon, alongside your NESA registration.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Sydney families. Sydney holds Australia\'s largest and most internationally connected population — Greater Western Sydney\'s South Asian communities around Parramatta, Westmead, and Blacktown; African and Caribbean diaspora families across the metropolitan area; and a steady flow of Australian families returning from postings in Singapore, the UAE, Hong Kong, and London with children mid-stream in IGCSE or IB. Australian public schools are free and capable and we are not built to compete with them. Smartious serves the families whose academic needs sit alongside or outside that system: Cambridge continuity, diaspora connection, and pathway flexibility to UK, US, Indian, and African universities as well as Australian ones. In NSW, home education means registration with NESA — Smartious is not Australian-registered and does not replace that registration; we supply the curriculum, live teaching, and documentation it asks for.',
    heroImg: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Sydney Harbour Bridge and Opera House' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Sydney families — Cambridge alongside NESA registration, diaspora and returning-expat pathways. From USD 400/month.',
    challenges: [
      'NSW is among the more regulated states: NESA registration, curriculum alignment, home visits, and periodic renewal.',
      'Returning expat children mid-IGCSE or mid-IB find most Australian schools follow the state curriculum and ATAR pathway instead.',
      'Diaspora families wanting Cambridge for academic alignment with home have few local options outside expensive independent schools.',
      'Independent and IB school fees run roughly AUD 25,000-45,000 in the senior years.',
      'Time zone: Sydney runs AEST (UTC+10, AEDT +11 in summer) — 7 to 8 hours ahead of Nairobi EAT, so live morning teaching from our base lands in the Sydney afternoon and early evening.',
    ],
    familySituations: [
      'South Asian families across Greater Western Sydney wanting the Cambridge pathway.',
      'African and Caribbean diaspora families keeping academic connection to home university systems.',
      'Australian families returning from Singapore, the UAE, Hong Kong, or the UK mid-IGCSE or mid-IB.',
      'NESA-registered homeschooling families wanting a structured school behind the registration.',
      'Students running Cambridge A-Levels alongside or instead of ATAR for UK and US applications.',
      'Families supplementing an existing school with subjects it does not offer.',
    ],
    nearbyAreas: ['Parramatta', 'Westmead', 'Blacktown', 'Liverpool', 'Hills District', 'North Shore', 'Northern Beaches'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Hindi, Urdu and home language support, French, Spanish',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UAC and ATAR-equivalent conversion, UCAS (UK), Common Application (US), and Indian and African university applications',
    ],
    whyChoose: [
      ['Cambridge continuity the state system cannot offer', 'A child mid-IGCSE or mid-IB returning from abroad keeps the same curriculum, teachers, and examination board — no lost year to curriculum mismatch.'],
      ['Documentation your NESA application needs', 'Structured curriculum, live teaching records, assessment, and progress reports — produced continuously, in the form a registration application asks for. The registration itself remains between the family and NESA.'],
      ['A-Levels that convert and travel', 'Cambridge A-Level results convert to ATAR equivalents through UAC — confirmed with the admissions centre — while also being read natively by UCAS and recognised in 160+ countries.'],
      ['Built for diaspora ambition', 'One school record that opens Australian, UK, US, Indian, and African universities at once.'],
      ['Live classes in the Sydney afternoon', 'Our morning teaching lands in the Australian afternoon and early evening — no late-night classes — with every session recorded.'],
    ],
    growingReason: 'Sydney holds Australia\'s largest internationally connected population — Greater Western Sydney\'s South Asian communities, African and Caribbean diaspora families, and a constant returning-expat flow — inside NSW\'s more regulated NESA registration regime and an independent-school tier at AUD 25,000-45,000. Sydney runs AEST (UTC+10 / AEDT +11), 7-8 hours ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Sydney families. Examinations at authorised private-candidate centres in Sydney, confirmed per family per session.',
      cbc: 'Kenya CBC available for Sydney families with East African ties.',
      ib: 'IB Diploma Programme — continuity for families returning mid-programme from international schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Home education is legal in every Australian state and territory, and in New South Wales it means registration with NESA — one of the more regulated regimes, involving curriculum alignment, home visits, and periodic renewal. We are direct about our own position: Smartious is an internationally accredited online school based in Nairobi, we are not Australian-registered, and we do not substitute for state homeschool registration. What we provide is what a registration application actually needs — a structured Cambridge curriculum, live teaching, continuous assessment, and documented progress reports — and we discuss each family\'s state-specific setup during admissions, pointing families to NESA for anything that is theirs to decide. Note too that Australia has no free post-16 window: states require participation in education, training, or employment until about seventeen, so the A-Level years run inside registration or alongside an enrolment.',
    homeTuitionDetail: 'Smartious does not operate in-person tuition in Australia; the live online programme is complete on its own, and families typically pair it with local homeschool co-ops, sports clubs, and community groups.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes are scheduled so Australian students join during their own afternoon and early evening rather than late at night, with every session recorded for unlimited rewatch — which is what makes the model work across the Australian time zones.',
    faqs: [
      { q: 'Is online homeschooling legal in Sydney and NSW?', a: 'Home education is legal in every Australian state and territory, and in NSW it requires registration with NESA — including curriculum alignment, home visits, and periodic renewal. Smartious is not Australian-registered and does not replace that registration: we provide the curriculum, live teaching, assessment, and progress documentation a registration application needs, and NESA remains the authority on your registration.' },
      { q: 'We are returning from Singapore or Dubai mid-IGCSE — can our child continue?', a: 'Yes, and it is one of our most common Australian scenarios. Most Australian schools follow the state curriculum and ATAR pathway, so a child mid-Cambridge or mid-IB cannot simply continue. Smartious keeps the same curriculum, examination board, and teaching, with mid-term enrolment year-round.' },
      { q: 'Will Australian universities accept Cambridge A-Levels?', a: 'Cambridge A-Level results convert to ATAR equivalents through UAC in NSW and the ACT, with the conversion and any programme requirements confirmed with the admissions centre. Many families choose A-Levels precisely for the wider optionality — UCAS reads them natively and they are recognised in 160+ countries.' },
      { q: 'How do the fees compare with Sydney independent schools?', a: 'Independent and IB schools commonly run AUD 25,000-45,000 in the senior years. Smartious runs USD 2,160-6,480 a year. We do not position on price — the value is internationally recognised qualifications, live small-group teaching, and a school that travels with the family.' },
      { q: 'Can my child study with Smartious alongside their Australian school?', a: 'Yes — a common configuration: the school carries the enrolment and the ATAR pathway while Smartious runs a parallel Cambridge track for diaspora continuity or UK and US applications, using recordings around the school day.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'melbourne-au',
    name: 'Melbourne',
    county: 'Victoria',
    region: 'The second city · Wyndham, Tarneit and the west\'s South Asian growth corridor · the largest African-Australian community · VRQA\'s moderate registration regime',
    primaryKeyword: 'Online school and homeschool in Melbourne',
    heroTagline: 'For Melbourne families from Wyndham to Box Hill — Cambridge delivered live in the Australian afternoon, in the state with the lightest registration path.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Melbourne families. Melbourne\'s western growth corridor — Wyndham, Tarneit, Hoppers Crossing, Point Cook — has become one of Australia\'s densest South Asian communities, and Victoria holds the country\'s largest African-Australian population. Both groups share a specific ambition: an education that connects academically to home and opens universities on several continents at once. Victoria also runs one of the more workable registration regimes — VRQA registration with a brief education plan, without mandatory home visits or testing. Smartious supplies the curriculum, live teaching, and documentation that supports it; the registration itself stays between the family and the VRQA.',
    heroImg: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Melbourne skyline over the Yarra' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Melbourne families — Cambridge alongside VRQA registration, diaspora pathways. From USD 400/month.',
    challenges: [
      'Victoria requires VRQA registration with an education plan — lighter than NSW, but still a formal process the family owns.',
      'The western growth corridor\'s schools are stretched by rapid population growth.',
      'Diaspora families wanting Cambridge alignment with home systems have few affordable local options.',
      'Independent and IB school fees run roughly AUD 25,000-45,000 in the senior years.',
      'Time zone: Melbourne runs AEST (UTC+10, AEDT +11 summer) — 7 to 8 hours ahead of Nairobi EAT, so live teaching lands in the Melbourne afternoon and early evening.',
    ],
    familySituations: [
      'South Asian families across Wyndham, Tarneit, Point Cook, and the eastern suburbs.',
      'African-Australian families — Victoria holds the largest such community in the country.',
      'Returning expat families mid-IGCSE or mid-IB.',
      'VRQA-registered homeschooling families wanting a structured school behind the plan.',
      'Students running Cambridge A-Levels alongside or instead of VCE for UK and US applications.',
    ],
    nearbyAreas: ['Wyndham Vale', 'Tarneit', 'Point Cook', 'Hoppers Crossing', 'Box Hill', 'Dandenong', 'Craigieburn'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Hindi, Urdu and home language support, French',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — VTAC and ATAR-equivalent conversion, UCAS (UK), Common Application (US), and Indian and African university applications',
    ],
    whyChoose: [
      ['Fits Victoria\'s lighter registration path', 'VRQA registration runs on a plan rather than home visits — and a structured Cambridge curriculum with documented progress is exactly the substance a plan describes. The registration stays yours; the documentation is ours.'],
      ['Built for the west\'s growth corridor', 'Live small-group teaching regardless of how stretched local enrolments are, with no catchment and no waitlist.'],
      ['Diaspora ambition, one record', 'Australian, UK, US, Indian, and African universities from a single Cambridge school record.'],
      ['A-Levels that convert and travel', 'Conversion to ATAR equivalents through VTAC — confirmed with the admissions centre — plus native UCAS recognition.'],
      ['Live classes in the Melbourne afternoon', 'Our morning teaching lands in the Australian afternoon, with every session recorded.'],
    ],
    growingReason: 'Melbourne\'s western corridor — Wyndham, Tarneit, Point Cook — is one of Australia\'s densest South Asian communities, and Victoria holds the country\'s largest African-Australian population, inside a moderate VRQA registration regime and an independent tier at AUD 25,000-45,000. Melbourne runs AEST (UTC+10 / AEDT +11), 7-8 hours ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Melbourne families. Examinations at authorised private-candidate centres in Melbourne, confirmed per session.',
      cbc: 'Kenya CBC available for Melbourne families with East African ties — Victoria\'s African-Australian community is the country\'s largest.',
      ib: 'IB Diploma Programme — continuity for families returning mid-programme.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Home education is legal across Australia, and Victoria\'s regime is among the more workable: registration with the VRQA and a brief education plan, without mandatory home visits or testing. Our position is stated plainly — Smartious is not Australian-registered and does not substitute for VRQA registration. We provide the structured Cambridge curriculum, live teaching, assessment, and progress documentation that give a plan its substance, and we discuss each family\'s setup during admissions while pointing them to the VRQA for what is theirs to decide. Australia also has no free post-16 window: participation in education, training, or employment is required until about seventeen.',
    homeTuitionDetail: 'Smartious does not operate in-person tuition in Australia; families typically pair the live online programme with local homeschool co-ops and community activities.',
    onlineLearningDetail: 'Live online via Smartious LMS, scheduled so Melbourne students join in their own afternoon and early evening rather than late at night, with every session recorded.',
    faqs: [
      { q: 'How does Victoria\'s registration compare with NSW?', a: 'Victoria is lighter: VRQA registration with an education plan, and no mandatory home visits or testing, where NSW involves NESA registration with curriculum alignment and home visits. Either way the registration is the family\'s, not ours — Smartious is not Australian-registered and supplies the curriculum and documentation rather than the registration.' },
      { q: 'Is Smartious a fit for African-Australian families in Victoria?', a: 'It is one of our core Australian groups. Cambridge IGCSE and A-Level keep a child academically connected to home systems while opening Australian, UK, and African universities from the same record — and our Kenya CBC option exists for families who want it.' },
      { q: 'Where do Melbourne students sit examinations?', a: 'At authorised private-candidate centres in Melbourne, confirmed per family per session, with mock examinations run beforehand.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'brisbane-au',
    name: 'Brisbane & the Gold Coast',
    county: 'Queensland',
    region: 'The fast-growing southeast · Queensland\'s Home Education Unit — the country\'s most workable registration regime · a large migrant and diaspora population',
    primaryKeyword: 'Online school and homeschool in Brisbane',
    heroTagline: 'For Brisbane and Gold Coast families — Cambridge delivered live into the state with Australia\'s most workable homeschool registration.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Brisbane and Gold Coast families. Southeast Queensland is one of Australia\'s fastest-growing regions, drawing interstate movers, migrants, and a substantial diaspora population — and Queensland runs the country\'s most workable home education regime: plan-based registration with the Home Education Unit, no home visits, and an annual report. For families wanting an internationally recognised curriculum with real structure behind it, that combination is unusually favourable. Smartious supplies the curriculum, live teaching, and the annual-report substance; the HEU registration remains the family\'s own.',
    heroImg: 'https://images.unsplash.com/photo-1566734904496-9309bb1798ae?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Brisbane river and city skyline' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Brisbane and Gold Coast families — Cambridge alongside Queensland HEU registration. From USD 400/month.',
    challenges: [
      'Rapid southeast Queensland growth is stretching school enrolments and catchments.',
      'Registration is plan-based with an annual report — workable, but it still needs real curriculum substance behind it.',
      'Diaspora and migrant families wanting Cambridge alignment have limited affordable local options.',
      'Independent and IB school fees run roughly AUD 25,000-45,000 in the senior years.',
      'Time zone: Queensland runs AEST (UTC+10) with no daylight saving — 7 hours ahead of Nairobi EAT, so live teaching lands in the Brisbane afternoon.',
    ],
    familySituations: [
      'Queensland homeschooling families registered with the HEU wanting a structured international school.',
      'Migrant and diaspora families across Brisbane, Logan, and the Gold Coast.',
      'Returning expat families mid-IGCSE or mid-IB.',
      'Students running Cambridge A-Levels alongside or instead of the QCE for UK and US applications.',
      'Families in Sunshine Coast and Gold Coast corridors with limited local Cambridge or IB options.',
    ],
    nearbyAreas: ['Brisbane CBD', 'Logan', 'Ipswich', 'Gold Coast', 'Sunshine Coast', 'Redlands', 'Moreton Bay'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE home language support, French, Spanish',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — QTAC and ATAR-equivalent conversion, UCAS (UK), Common Application (US)',
    ],
    whyChoose: [
      ['Matched to Queensland\'s plan-based regime', 'The HEU asks for a plan and an annual report; a structured Cambridge curriculum with continuous assessment and progress records is exactly that substance. Registration stays with the family.'],
      ['No catchment, no waitlist', 'Growth-corridor enrolment pressure stops mattering when the school has no geography.'],
      ['A-Levels that convert and travel', 'Conversion to ATAR equivalents through QTAC — confirmed with the admissions centre — plus native UCAS recognition.'],
      ['Live classes in the Brisbane afternoon', 'Queensland\'s no-daylight-saving clock keeps the schedule stable year-round, with every session recorded.'],
      ['Live teaching, small groups', 'Every Smartious class is live, real-time, in groups of 4-6.'],
    ],
    growingReason: 'Southeast Queensland is one of Australia\'s fastest-growing regions, with a substantial migrant and diaspora population — and the country\'s most workable home education regime: plan-based HEU registration, no home visits, annual report. Queensland runs AEST (UTC+10) year-round, 7 hours ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Queensland families. Examinations at authorised private-candidate centres in Brisbane, confirmed per session.',
      cbc: 'Kenya CBC available for Queensland families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Queensland runs Australia\'s most workable home education regime: registration with the Home Education Unit on a plan, no home visits, and an annual report on the child\'s progress. Smartious is not Australian-registered and does not substitute for HEU registration — what we provide is the structured Cambridge curriculum, live teaching, continuous assessment, and progress documentation that make both the plan and the annual report straightforward to write. Note that no reciprocal recognition exists between states: a family moving to NSW registers again from scratch with NESA, though the Smartious curriculum simply continues. And Australia has no free post-16 window — participation is required until about seventeen.',
    homeTuitionDetail: 'Smartious does not operate in-person tuition in Australia; families typically pair the live online programme with Queensland\'s active homeschool co-op network.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing in the Brisbane afternoon on a stable year-round offset, with every session recorded for unlimited rewatch.',
    faqs: [
      { q: 'Why is Queensland considered easier for homeschooling?', a: 'The Home Education Unit registers families on a plan, without home visits, and asks for an annual report on progress — a lighter touch than NSW, WA, SA, or the NT. It still needs genuine curriculum substance, which is what a structured Cambridge programme with documented assessment provides.' },
      { q: 'What happens if we move interstate?', a: 'There is no reciprocal recognition between Australian states — moving to NSW means registering again from scratch with NESA. The Smartious curriculum, teachers, and examination board continue unchanged through the move, which is precisely what makes the transition manageable.' },
      { q: 'Where do Brisbane students sit examinations?', a: 'At authorised private-candidate centres in Brisbane, confirmed per family per session, with mock examinations beforehand.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'perth-au',
    name: 'Perth',
    county: 'Western Australia',
    region: 'The Indian Ocean capital · the mining and resources economy with its FIFO rotations · a large South Asian and South African community · the best-aligned Australian time zone',
    primaryKeyword: 'Online school and homeschool in Perth',
    heroTagline: 'For Perth families — the Indian Ocean capital, closest of all Australian cities to our teaching clock, and built for FIFO rhythms.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Perth families. Perth faces the Indian Ocean rather than the Pacific, and its economy reflects it: mining and resources, fly-in fly-out rotations to the Pilbara and beyond, and a workforce recruited from South Africa, the UK, India, and across the Gulf. Western Australia runs one of the more regulated registration regimes, and Perth\'s independent tier carries capital-city fees. Smartious delivers the international pathways live on the best-aligned Australian clock — AWST is five hours ahead of our Nairobi base, so classes land comfortably in the Perth afternoon — with every session recorded, which is what makes the model work for rotation families.',
    heroImg: 'https://images.unsplash.com/photo-1573935448851-e0f6b2d80d5e?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Perth skyline and the Swan River' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Perth families — mining and FIFO rhythms, best Australian timezone alignment. From USD 400/month.',
    challenges: [
      'Western Australia runs one of the more regulated registration regimes — registration, curriculum alignment, and periodic visits.',
      'FIFO rotations mean a parent is regularly away and family rhythms do not match a fixed school week.',
      'Resources-sector families frequently relocate between Perth, the Pilbara, South Africa, and the Gulf.',
      'Independent and IB school fees run roughly AUD 25,000-45,000 in the senior years.',
      'Time zone: Perth runs AWST (UTC+8, no daylight saving) — five hours ahead of Nairobi EAT, the closest alignment of any Australian city.',
    ],
    familySituations: [
      'Mining, resources, and FIFO families across Perth and the Pilbara corridor.',
      'South African, South Asian, and British expatriate families in the resources workforce.',
      'Families relocating between Perth, the Gulf, and southern Africa who need curriculum continuity.',
      'WA-registered homeschooling families wanting a structured international school.',
      'Students running Cambridge A-Levels alongside or instead of WACE for UK and US applications.',
    ],
    nearbyAreas: ['Perth CBD', 'Joondalup', 'Fremantle', 'Rockingham', 'Mandurah', 'Karratha and the Pilbara', 'Kalgoorlie'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE home language support, Afrikaans-community support, French',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — TISC and ATAR-equivalent conversion, UCAS (UK), Common Application (US), South African university applications',
    ],
    whyChoose: [
      ['The best Australian timezone alignment we have', 'AWST is five hours ahead of Nairobi — the closest of any Australian city, so live classes sit comfortably in the Perth afternoon.'],
      ['Built for FIFO rhythms', 'Live classes plus unlimited recordings hold the academic pace through rotation weeks, travel, and the swing-shift household.'],
      ['Curriculum that crosses the Indian Ocean', 'Perth, the Pilbara, Johannesburg, or Dubai — same teachers, same examination board, no enrolment break.'],
      ['Documentation for a regulated state', 'WA registration asks for alignment and evidence; structured curriculum, assessment, and progress records are produced continuously. The registration stays the family\'s.'],
      ['A-Levels that convert and travel', 'Conversion to ATAR equivalents through TISC — confirmed with the admissions centre — plus native UCAS recognition and South African university access.'],
    ],
    growingReason: 'Perth is the Indian Ocean capital of Australia\'s mining and resources economy — FIFO rotations, and a workforce recruited from South Africa, the UK, India, and the Gulf — inside one of the more regulated registration regimes. Perth runs AWST (UTC+8) year-round, five hours ahead of Nairobi EAT: the closest Australian alignment.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Perth families. Examinations at authorised private-candidate centres in Perth, confirmed per session.',
      cbc: 'Kenya CBC available for Perth families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Western Australia sits among the more regulated states: registration with the state authority, curriculum alignment, and periodic moderator or home visits. Smartious is not Australian-registered and does not substitute for that registration — we supply the structured Cambridge curriculum, live teaching, assessment, and documented progress that a regulated review expects to see, and families take that evidence to their own state authority. For resources families the portability matters as much: the curriculum continues unchanged across a move to the Pilbara, the Gulf, or southern Africa. Australia has no free post-16 window — participation is required until about seventeen.',
    homeTuitionDetail: 'Smartious does not operate in-person tuition in Australia; the live online programme is complete on its own.',
    onlineLearningDetail: 'Live online via Smartious LMS on the closest Australian offset — five hours ahead of our Nairobi base — so classes land in the Perth afternoon, with every session recorded for rotation weeks and travel.',
    faqs: [
      { q: 'Does this work for FIFO families?', a: 'It is one of the strongest fits we have: live classes with unlimited recordings hold the academic pace regardless of rotation weeks, and the schedule lands in the Perth afternoon rather than late at night.' },
      { q: 'We may relocate to the Gulf or South Africa — does the school follow?', a: 'Yes — same teachers, same curriculum, same examination board, with examinations sat at authorised centres wherever the family is. Resources careers move; the school does not have to.' },
      { q: 'Where do Perth students sit examinations?', a: 'At authorised private-candidate centres in Perth, confirmed per family per session.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'adelaide-au',
    name: 'Adelaide',
    county: 'South Australia',
    region: 'The compact capital · defence, space, and university industries · a growing migrant intake · South Australia\'s more regulated registration regime',
    primaryKeyword: 'Online school and homeschool in Adelaide',
    heroTagline: 'For Adelaide families — the defence and space capital, with Cambridge delivered live into the South Australian afternoon.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Adelaide families. Adelaide has rebuilt itself around defence shipbuilding, the national space agency, and a strong university sector — industries that recruit internationally and bring families on project timelines rather than admission cycles. South Australia runs one of the more regulated home education regimes, and the city\'s independent tier carries the usual Australian fees. Smartious delivers the international pathways live into the Adelaide afternoon, with the structured curriculum and documented progress a regulated registration expects — and the portability that project-based careers need.',
    heroImg: 'https://images.unsplash.com/photo-1566734904496-9309bb1798ae?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Adelaide city and parklands' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Adelaide families — defence and space sector, Cambridge alongside SA registration. From USD 400/month.',
    challenges: [
      'South Australia runs a more regulated registration regime — registration, alignment, and periodic review.',
      'Defence, space, and university contracts bring families mid-year and move them again.',
      'A compact international-school market relative to Sydney or Melbourne.',
      'Independent and IB school fees run roughly AUD 25,000-45,000 in the senior years.',
      'Time zone: Adelaide runs ACST (UTC+9:30, ACDT +10:30 summer) — about 6.5 to 7.5 hours ahead of Nairobi EAT.',
    ],
    familySituations: [
      'Defence, shipbuilding, and space-sector families recruited internationally.',
      'University and research families across Adelaide\'s institutions.',
      'Migrant and diaspora families wanting Cambridge alignment with home systems.',
      'SA-registered homeschooling families wanting a structured international school.',
      'Students running Cambridge A-Levels alongside or instead of the SACE for UK and US applications.',
    ],
    nearbyAreas: ['Adelaide CBD', 'North Adelaide', 'Osborne and the shipyards', 'Mawson Lakes', 'Glenelg', 'Adelaide Hills', 'Gawler'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE home language support, French, Spanish',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Computer Science, Design and Technology-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — SATAC and ATAR-equivalent conversion, UCAS (UK), Common Application (US)',
    ],
    whyChoose: [
      ['STEM depth for a defence and space city', 'Cambridge A-Level Mathematics, Further Mathematics, and Physics — led by a founder with a BEd in Mathematics and Physics — suit the sector\'s families precisely.'],
      ['Enrolment on the project\'s timeline', 'Families arrive mid-contract; admission is year-round with no waitlist.'],
      ['Documentation for a regulated state', 'Structured curriculum, assessment, and progress records produced continuously — with the registration itself remaining the family\'s own.'],
      ['A-Levels that convert and travel', 'Conversion to ATAR equivalents through SATAC — confirmed with the admissions centre — plus native UCAS recognition.'],
      ['Live classes in the Adelaide afternoon', 'Our morning teaching lands in the South Australian afternoon, with every session recorded.'],
    ],
    growingReason: 'Adelaide has rebuilt around defence shipbuilding, the space agency, and its universities — industries recruiting internationally on project timelines — inside one of the more regulated registration regimes and a compact international-school market. Adelaide runs ACST (UTC+9:30 / ACDT +10:30), about 6.5-7.5 hours ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Adelaide families. Examinations at authorised private-candidate centres in Adelaide, confirmed per session.',
      cbc: 'Kenya CBC available for Adelaide families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'South Australia sits among the more regulated states: registration with the state authority, curriculum alignment, and periodic review. Smartious is not Australian-registered and does not substitute for that registration — we supply the structured Cambridge curriculum, live teaching, assessment, and documented progress a regulated review expects, and the family takes it to their own authority. Australia has no free post-16 window: participation in education, training, or employment is required until about seventeen.',
    homeTuitionDetail: 'Smartious does not operate in-person tuition in Australia; the live online programme is complete on its own.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing in the Adelaide afternoon and early evening, with every session recorded for unlimited rewatch.',
    faqs: [
      { q: 'We arrived on a defence or space contract mid-year — how fast can schooling start?', a: 'Admission is year-round with no waitlist, and students typically begin within a week of the assessment — with the curriculum continuing unchanged if the contract later moves the family on.' },
      { q: 'Where do Adelaide students sit examinations?', a: 'At authorised private-candidate centres in Adelaide, confirmed per family per session.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'regional-au',
    name: 'Regional & Remote Australia',
    county: 'All states and territories',
    region: 'Regional NSW, Victoria, Queensland, WA, the Top End and Tasmania · a century-old distance-education tradition · almost no local Cambridge or IB provision anywhere',
    primaryKeyword: 'Online school and homeschool in regional and remote Australia',
    heroTagline: 'For regional and remote families — the country that invented schooling by radio, now served by live international classes.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across regional and remote Australia. No country understands distance education like this one: schooling by radio and correspondence has served the outback for generations, and Australians take remote learning seriously because it built the bush. What regional Australia has never had is international curriculum — local Cambridge or IB options are limited or non-existent across regional NSW, Victoria, Queensland, Western Australia, the Top End, and Tasmania, and boarding in a capital has been the standard answer for families who wanted them. Smartious changes that arithmetic: identical live small-group teaching to any address with a stable connection, alongside whichever state registration applies.',
    heroImg: 'https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Regional Australian landscape at golden hour' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for regional and remote Australian families — international curriculum where none exists locally. From USD 400/month.',
    challenges: [
      'Local Cambridge and IB options are limited or absent across most of regional and remote Australia.',
      'Boarding in a capital city has been the traditional answer — expensive, and it separates the family.',
      'Registration requirements differ by state and territory, and the family owns that relationship wherever they live.',
      'Examination sittings mean travel to an authorised centre in the nearest capital, planned per series.',
      'Time zone: regional Australia spans AEST, ACST, and AWST — 5 to 8 hours ahead of Nairobi EAT, with classes landing in the local afternoon.',
    ],
    familySituations: [
      'Farming, station, and agricultural families across the interior.',
      'Mining, energy, and resources families in regional postings.',
      'Regional professional families — medical, education, and local government.',
      'Registered homeschooling families wanting structured international curriculum.',
      'Families weighing capital-city boarding against staying together.',
      'Students running Cambridge A-Levels for UK and US applications from anywhere.',
    ],
    nearbyAreas: ['Regional NSW', 'Regional Victoria', 'Regional Queensland and Cairns', 'Regional WA and the Pilbara', 'The Top End and Darwin', 'Tasmania', 'Central Australia'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Geography, Business Studies, home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — state ATAR-equivalent conversion, UCAS (UK), Common Application (US)',
    ],
    whyChoose: [
      ['International curriculum where none exists locally', 'The same live Cambridge teaching a Sydney student gets, delivered to a station, a regional town, or a mining community.'],
      ['An alternative to sending a child away', 'Boarding in a capital has been the default answer for regional families wanting more. Live small-group teaching at home keeps the family together without costing the education.'],
      ['Built for distance the way this country understands it', 'Live classes plus unlimited recordings, designed for connectivity that varies and seasons that do not negotiate.'],
      ['Whatever state you are in', 'Registration differs by state and territory and stays the family\'s own; the curriculum, teaching, and documentation are identical wherever you live — and continue unchanged if you move.'],
      ['A-Levels that convert and travel', 'Conversion to ATAR equivalents through the relevant state admissions centre — confirmed with them — plus native UCAS recognition.'],
    ],
    growingReason: 'Regional and remote Australia has a century-old distance-education tradition and almost no local Cambridge or IB provision — leaving capital-city boarding as the traditional answer for families wanting international curriculum. Regional Australia spans AEST, ACST, and AWST, 5-8 hours ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for regional Australia. Examinations at authorised private-candidate centres in the nearest capital, confirmed per session with travel planned well ahead.',
      cbc: 'Kenya CBC available for regional families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Home education is legal in every state and territory, and the requirements differ sharply: Queensland registers on a plan with an annual report and no home visits; Victoria on a plan with the VRQA; NSW, Western Australia, South Australia, and the Northern Territory run more regulated regimes with alignment and periodic visits; Tasmania and the ACT sit in the moderate band. There is no reciprocal recognition between states, so an interstate move means registering again from scratch. Smartious is not Australian-registered and does not substitute for any of it — we supply the curriculum, live teaching, assessment, and documented progress those applications and reviews rely on, and the family holds the relationship with their own authority. Australia also has no free post-16 window: participation in education, training, or employment is required until about seventeen.',
    homeTuitionDetail: 'Smartious does not operate in-person tuition in Australia; regional families typically pair the live online programme with local co-ops, sports, and community groups.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing in the local afternoon across every Australian time zone, with every session recorded — built for variable regional connectivity and seasonal workloads.',
    faqs: [
      { q: 'Does this really work from a remote property?', a: 'With a stable connection, yes — and the recorded library covers the sessions a patchy day interrupts. Australia has run remote education successfully for a century; what we add is the international curriculum that was never part of it.' },
      { q: 'Is this an alternative to boarding?', a: 'For many regional families it is exactly that: the same live teaching and examination boards as a capital-city student, delivered home, with travel needed only for examination sittings a few times a year.' },
      { q: 'How does registration work if we move states?', a: 'There is no reciprocal recognition — you register again from scratch with the new state authority, which remains the family\'s relationship. The Smartious curriculum, teachers, and examination board continue unchanged through the move.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const AUSTRALIA_COUNTRY = {
  slug: 'australia',
  name: 'Australia',
  longName: 'Commonwealth of Australia',
  adjective: 'Australian',
  flag: '🇦🇺',
  hub: '/online-school/australia',
  hubPageId: 'homeschooling-australia',
  cityPageId: 'australia-city',

  currency: 'AUD',
  currencyName: 'Australian Dollar',
  currencyPeg: 'AUD equivalents are indicative and move with the exchange rate; final invoicing is in USD, with Australian dollar payment accepted by card, bank transfer, or international wire.',

  timezone: {
    code: 'AEST/ACST/AWST',
    name: 'Australian time zones (AEST UTC+10, AEDT +11 summer; ACST +9:30; AWST +8)',
    utcOffset: '+10',
    offsetFromEAT: '+5 to +8 hours ahead of Nairobi — Perth closest, eastern states furthest',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel private-candidate centres in Sydney, Melbourne, Brisbane, Perth, Adelaide and Canberra — confirmed per family per session; IB Diploma examinations through authorised IB World Schools; regional families plan capital-city travel per series'],
  examCentreTiles: [
    { city: 'Sydney, Melbourne, Brisbane', centre: 'Authorised private-candidate centres', area: 'Cambridge IGCSE, A-Level and Pearson Edexcel sittings in the eastern capitals, confirmed per session.' },
    { city: 'Perth, Adelaide, Canberra', centre: 'Authorised private-candidate centres', area: 'Serving Western Australia, South Australia, and the ACT, with regional families planning travel per series.' },
    { city: 'Regional & remote', centre: 'Nearest capital, planned ahead', area: 'A few examination trips a year against a full year of teaching delivered home.' },
  ],
  examLogisticsProse: 'Cambridge IGCSE, Cambridge A-Level, and Pearson Edexcel examinations are sat at authorised private-candidate centres in the Australian capitals — Sydney, Melbourne, Brisbane, Perth, Adelaide, and Canberra — with IB Diploma examinations administered through authorised IB World Schools, of which Australia has many. Smartious handles examination registration, advises on the most practical centre for each family, tracks the entry deadlines ahead of the May/June and October/November series, and runs full mock examination programmes beforehand. Regional and remote families plan capital-city travel per series — a few trips a year against a full year of teaching delivered home. Separately, families should note the examinations are only half the planning: A-Level results convert to ATAR equivalents through the relevant state admissions centre (UAC, VTAC, QTAC, TISC, SATAC and equivalents), and the conversion and any programme-specific requirements are confirmed with that centre rather than assumed.',
  secondaryProgrammeExamRef: 'Authorised centres in the Australian capitals',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&q=80&auto=format&fit=crop',
  heroEyebrow: 'Online international school for Australia',
  heroH1Suffix: 'Australia',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for diaspora, returning-expat, regional, and Cambridge-pathway families across Sydney, Melbourne, Brisbane, Perth, Adelaide, and regional Australia. Australian public schools are free and capable and we do not compete with them — Smartious is for families whose academic needs sit alongside or outside that system. Classes run in the Australian afternoon, not late at night, and we are clear about one thing: we are not Australian-registered and do not replace your state homeschool registration.',
  heroValueProp: 'From USD 180/month (~AUD 250). Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — against an independent-school tier at roughly AUD 25,000-45,000, with A-Level results converting to ATAR equivalents through your state admissions centre.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Australia',

  citiesSectionTitle: 'Where our Australia families are',
  citiesSectionBody: 'Smartious Australia families concentrate across Sydney (Greater Western Sydney\'s South Asian heartland and the returning-expat corridor, inside NSW\'s regulated NESA regime), Melbourne (the Wyndham-Tarneit growth corridor and the country\'s largest African-Australian community, under Victoria\'s lighter VRQA path), Brisbane and the Gold Coast (Queensland\'s plan-based HEU regime, the most workable in the country), Perth (mining, FIFO, and the best-aligned Australian time zone), Adelaide (defence, space, and universities), and regional and remote Australia (a century of distance education, and no local Cambridge or IB anywhere). Six markets, eight registration regimes, and one curriculum that travels between all of them.',

  trustSignals: [
    { h: 'Two operational teaching centres', p: 'Live teaching to Australia families is delivered from two international-standard operational centres established 2022 and 2023.' },
    { h: 'Classes in the Australian afternoon, not at midnight', p: 'Australia sits 5 to 8 hours ahead of our Nairobi base, so live morning teaching lands in the Australian afternoon and early evening — with every session recorded for unlimited rewatch.' },
    { h: 'Clear about what we are not', p: 'Smartious is not Australian-registered and does not substitute for state homeschool registration. We provide the curriculum, live teaching, assessment, and progress documentation your registration needs; the registration relationship stays between your family and your state authority.' },
    { h: 'A curriculum that survives an interstate move', p: 'There is no reciprocal recognition between Australian states — a move means registering again from scratch. The curriculum, teachers, and examination board continue unchanged, which is exactly what makes the transition manageable.' },
  ],

  universitiesInCountry: 'The Group of Eight — Melbourne, Sydney, ANU, UNSW, Queensland, Monash, Adelaide, and Western Australia — alongside Macquarie, RMIT, QUT, Deakin, La Trobe, UTS, Wollongong and the wider Australian sector, all of which recognise Cambridge IGCSE and A-Level, the IB Diploma, and Pearson Edexcel qualifications.',
  universityChannels: 'Cambridge A-Level results convert to ATAR equivalents through the state admissions centres — UAC (NSW and ACT), VTAC (Victoria), QTAC (Queensland), TISC (WA), SATAC (SA) and equivalents — with the conversion and any programme-specific requirements confirmed with the relevant centre rather than assumed; some Australian universities also award advanced standing credit for matching A-Level subjects. Internationally, Cambridge A-Levels are read natively by UK universities via UCAS and accepted in 160+ countries, the IB Diploma is recognised globally, and the Common Application serves US plans. For diaspora families the same record also supports applications to Indian, South African, Nigerian, Kenyan, and wider African universities — one school record, several continents. Smartious provides personalised university guidance across Australian, UK (UCAS), US (Common Application), and diaspora-home destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Australia families. Cambridge IGCSE (Years 10-11) and Cambridge A-Level (Years 12-13) delivered as live online classes scheduled into the Australian afternoon and early evening, with unlimited recordings behind every session. Built for three situations the state system handles poorly: continuity for children returning mid-IGCSE or mid-IB from abroad, Cambridge alignment for diaspora families, and international curriculum for regional families with no local option. Examinations at authorised private-candidate centres in the capitals, confirmed per session. A-Level results convert to ATAR equivalents through your state admissions centre and are read natively by UCAS.',
  britishCurriculumSuits: 'Australia families targeting the Cambridge pathway. Best fit for: (1) South Asian diaspora families wanting curriculum alignment with home systems, (2) African and Caribbean diaspora families keeping academic connection home, (3) Australians returning from Singapore, the UAE, Hong Kong or the UK mid-programme, (4) registered homeschooling families wanting a structured school behind the registration, (5) regional and remote families with no local Cambridge or IB option, (6) students wanting A-Levels alongside or instead of ATAR for UK and US applications.',
  britishCurriculumDelivery: 'Live online classes scheduled into the Australian afternoon and early evening, small groups 4-6 students, every session recorded. Examinations at authorised private-candidate centres in the capitals, confirmed per session.',
  ibDiplomaSuits: 'Australia families continuing an IB pathway begun at an international school abroad, and families wanting the Diploma\'s breadth without the campus fees.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Australia families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in 2019 to make international qualifications (Cambridge, IB, American) accessible to families across emerging markets and international communities at online-delivery fees. Australia families join students in 37 other countries — from Parramatta and Tarneit to Nairobi\'s own Diamond Plaza HQ, the Pilbara to London.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Adelaide\'s defence and space families, Perth\'s resources engineers, and the medicine-and-engineering ambitions common across the diaspora communities we serve. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Australia is a market where we are deliberately narrow about what we compete with. Public schools are free and broadly capable, and the ATAR pathway is well-developed — we are not built to replace either. The comparison that matters is with independent and IB schools at roughly AUD 25,000-45,000 in the senior years, with capital-city boarding for regional families, and with distance-education providers that offer the state curriculum rather than an international one. Against those, the Smartious case is specific: Cambridge and IB continuity, diaspora pathway flexibility, regional reach, and a school that survives an interstate or international move.',
  competitors: [
    { name: 'Independent schools (Scotch, Geelong Grammar, Sydney Grammar, MLC and peers)', city: 'Capital cities', curriculum: 'State curriculum + ATAR, some IB', feesUsd: '~AUD 25,000-45,000+/year senior', feesAed: 'Premium tier', rating: 4.6, capacityNote: 'Excellent, expensive, and tied to one campus and one state' },
    { name: 'IB World Schools',                                  city: 'Capital cities',        curriculum: 'IB continuum',                          feesUsd: '~AUD 25,000-40,000/year',                          feesAed: 'Premium tier',            rating: 4.5, capacityNote: 'The international option — concentrated in the capitals' },
    { name: 'Australian public schools',                         city: 'Nationwide',            curriculum: 'State curriculum + ATAR',               feesUsd: 'Free',                                             feesAed: '—',                       rating: 4.2, capacityNote: 'Free and broadly capable — we do not compete with them, and say so' },
    { name: 'State distance education providers',                city: 'Per state',             curriculum: 'State curriculum by distance',          feesUsd: 'Low or free where eligible',                       feesAed: '—',                       rating: 4.0, capacityNote: 'A century-old tradition — but state curriculum, not Cambridge or IB' },
    { name: 'Capital-city boarding',                             city: 'For regional families', curriculum: 'Varies',                                feesUsd: 'AUD 30,000-60,000+ with boarding',                 feesAed: 'Premium tier',            rating: 4.3, capacityNote: 'The traditional regional answer — expensive, and it separates the family' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh / bina (online)', city: 'Online',           curriculum: 'Cambridge self-paced / UK online / own to 15', feesUsd: 'Per-subject / GBP 9,000-11,000 / consultation', feesAed: 'Varies',      rating: 4.2, capacityNote: 'Self-paced, priced far above Smartious, or stopping at 15 — and mostly timetabled for UK hours, not Australian ones' },
    { name: 'Smartious Homeschool (Australia via online delivery)', city: 'Delivered to all Australia', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: '~AUD 3,000-9,000/year', rating: 4.8, capacityNote: 'Every class live through A-Level, timetabled into the Australian afternoon + diaspora and returning-expat continuity + regional reach + a curriculum that survives an interstate move' },
  ],

  legalFrameworkIntro: 'Australia is the one country we serve where the most important thing to say is about our own position. Homeschooling is legal everywhere here — but registration is a state matter, the states differ sharply, and no online school can register on your behalf. Here is the whole picture, plainly.',
  legalFramework: [
    { h: 'Legal everywhere, legislated separately', p: 'Home education is legal in every Australian state and territory, and each writes its own law — which means the requirements a family faces depend entirely on where they live. Queensland is the most workable: plan-based registration with the Home Education Unit, no home visits, and an annual report. Victoria is moderate: registration with the VRQA and a brief education plan, without mandatory home visits or testing. New South Wales, Western Australia, South Australia, and the Northern Territory are more regulated: registration with the state authority, formal curriculum alignment, periodic home or moderator visits, and regular renewal. Tasmania and the ACT sit in the moderate band.' },
    { h: 'No reciprocal recognition between states', p: 'This surprises families more than anything else in the Australian system: registration does not travel. A family registered in Queensland who moves to New South Wales registers again from scratch with NESA, on that state\'s terms. It is worth knowing before a move rather than after — and it is one of the reasons an interstate-portable curriculum matters here: the registration resets, but the child\'s education does not have to.' },
    { h: 'What we are, and what we are not', p: 'Smartious is an internationally accredited online school based in Nairobi, Kenya. We are not Australian-registered, we are not a registered Australian school, and we cannot and do not substitute for state homeschool registration. We say this on every Australian page because families deserve to know it before enrolling, not after. What we do provide is what a registration application or review actually asks for: a structured international curriculum, live teaching by degree-qualified subject specialists, continuous assessment, and documented progress reports. Cambridge IGCSE and A-Level are widely accepted as equivalents to the Australian Curriculum for registration purposes in most states — but that judgement belongs to your state authority, and we never predict it. We discuss each family\'s state-specific setup during admissions and point you to your own authority for the rest.' },
    { h: 'No free window after sixteen — stated plainly', p: 'Many countries we serve end compulsory education at fifteen or sixteen, opening a framework-free window for the A-Level years. Australia does not. States require participation in education, training, or employment until about seventeen after Year 10 — the "earn or learn" requirement — so the senior years run inside registration or alongside an enrolment. We will not tell an Australian family they have a window they do not have.' },
    { h: 'Where the qualifications lead', p: 'Cambridge A-Level results convert to ATAR equivalents through the state admissions centres — UAC, VTAC, QTAC, TISC, SATAC and equivalents — with the conversion and programme requirements confirmed with the relevant centre; some universities also award advanced standing credit for matching subjects. Every Australian university recognises Cambridge, Edexcel, and IB qualifications, including the Group of Eight. Internationally the same results are read natively by UCAS, serve the Common Application, and support applications to Indian, South African, Nigerian, and Kenyan universities — which for diaspora families is frequently the entire point: one school record, several continents.' },
    { h: 'Who this actually suits', p: 'We are specific about this because Australia deserves specificity. Smartious is built for South Asian diaspora families wanting Cambridge alignment with home systems; African and Caribbean diaspora families keeping their children academically connected home; Australians returning from postings abroad whose children are mid-IGCSE or mid-IB and would otherwise lose a year to curriculum mismatch; registered homeschooling families — particularly in Queensland and Victoria — wanting a real school\'s structure behind their registration; regional and remote families with no local Cambridge or IB option; and students who want A-Levels alongside or instead of ATAR for wider university optionality. Families well served by their local public school generally do not need us, and we would rather say so.' },
  ],

  whySmartious: [
    { h: 'Honest about our position',                                       p: 'Not Australian-registered, not a substitute for state registration — stated on every page. What we supply is the curriculum, teaching, assessment, and documentation your registration needs.' },
    { h: 'Classes in the Australian afternoon',                             p: 'Timetabled so students join during their own afternoon and early evening rather than at midnight, with every session recorded for unlimited rewatch.' },
    { h: 'Continuity for returning expats',                                 p: 'A child mid-IGCSE or mid-IB keeps the same curriculum, teachers, and examination board instead of losing a year to ATAR-curriculum mismatch.' },
    { h: 'Diaspora ambition, one record',                                   p: 'Australian, UK, US, Indian, and African universities from a single Cambridge or IB school record — which is exactly what diaspora families ask us for.' },
    { h: 'Regional reach without boarding',                                 p: 'The same live teaching a Sydney student gets, delivered to a station or a regional town — the alternative to sending a fourteen-year-old away.' },
    { h: 'A curriculum that survives the move',                             p: 'Interstate or international, registration resets but the education does not: same teachers, same board, no enrolment break.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Australia?', a: 'Yes — in every state and territory, though each legislates separately. Queensland is the most workable (plan-based HEU registration, no home visits, annual report); Victoria is moderate (VRQA registration with an education plan); NSW, WA, SA and the NT are more regulated (alignment, home visits, renewal); Tasmania and the ACT sit in between.' },
    { q: 'Can Smartious register my child for homeschooling?', a: 'No — and this matters. Smartious is not Australian-registered and does not substitute for state homeschool registration. We provide the structured curriculum, live teaching, assessment, and progress documentation your registration application or review needs; the registration relationship stays between your family and your state authority.' },
    { q: 'What happens if we move interstate?', a: 'There is no reciprocal recognition between states — you register again from scratch with the new authority. The Smartious curriculum, teachers, and examination board continue unchanged, which is what makes the transition manageable.' },
    { q: 'Will Australian universities accept Cambridge A-Levels?', a: 'Yes — every Australian university recognises Cambridge, Edexcel, and IB qualifications, and A-Level results convert to ATAR equivalents through UAC, VTAC, QTAC, TISC, SATAC and the equivalent centres, with conversion and programme requirements confirmed with the relevant centre. Some universities also award advanced standing credit for matching subjects.' },
    { q: 'We are returning from Singapore or the UAE mid-IGCSE — can our child continue?', a: 'Yes, and it is one of our most common Australian scenarios. Most Australian schools follow the state curriculum and ATAR pathway, so a child mid-Cambridge or mid-IB cannot simply continue. Smartious keeps the curriculum, examination board, and teaching intact, with mid-term enrolment year-round.' },
    { q: 'Is there a free window after Year 10, like other countries?', a: 'No. Australian states require participation in education, training, or employment until about seventeen, so the senior years run inside registration or alongside an enrolment. We will not claim a window that does not exist here.' },
    { q: 'How do the fees compare with Australian private schooling?', a: 'Independent and IB schools commonly run AUD 25,000-45,000 in the senior years; Smartious runs USD 2,160-6,480 annually. We do not position on price — the value is internationally recognised qualifications, live small-group teaching, and portability.' },
    { q: 'Where do Australian students sit examinations?', a: 'At authorised Cambridge and Pearson Edexcel private-candidate centres in Sydney, Melbourne, Brisbane, Perth, Adelaide and Canberra, with IB examinations through authorised IB World Schools. Smartious handles registration and confirms the centre per family per session; regional families plan capital-city travel per series.' },
    { q: 'How do live classes work given the time difference?', a: 'Australia sits 5 to 8 hours ahead of our Nairobi teaching base — Perth closest, the eastern states furthest — so live morning teaching lands in the Australian afternoon and early evening, not late at night. Every session is recorded for unlimited rewatch.' },
    { q: 'Which parts of Australia does Smartious cover?', a: 'Sydney, Melbourne, Brisbane and the Gold Coast, Perth, Adelaide, and regional and remote Australia have dedicated pages with local market and registration context. Live online delivery works identically anywhere with a stable connection — which in regional Australia is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which state you are in: registration requirements differ sharply across Australia, and that conversation shapes how we set the year up with you.',
}
