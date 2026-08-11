// ═══════════════════════════════════════════════════════════════════
// CHILE — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for mining, corporate, expat, and Chilean families
// across Santiago, Valparaíso, Antofagasta, Concepción and Puerto Montt.
// FIFTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — CHILE IS THE MOST PERMISSIVE FRAMEWORK IN
// OUR ENTIRE LATIN AMERICAN COVERAGE. THIS CHANGES OUR OFFER:
// - EXÁMENES LIBRES are a FORMAL MINEDUC MECHANISM allowing a person
//   to certify completion of an educational level — from 1° BÁSICO
//   through 4° MEDIO — WITHOUT HAVING BEEN ENROLLED at a regular
//   establishment. Regulated by DECRETO 2272/2007, which defines
//   procedures, deadlines, examining commissions and requirements.
// - ADMINISTERED REGIONALLY: each SECREDUC (Secretaría Regional
//   Ministerial de Educación) runs the examinations in its region —
//   designating the commission, defining the venues, and issuing the
//   certificates.
// - CONSEQUENCE — STATE IT CLEARLY AND USE IT: Chile is the ONE
//   Latin American market in our coverage where a FULL-TIME
//   programme for a resident child is genuinely workable, because a
//   state-administered validation route exists. Mexico, Brazil,
//   Argentina, Colombia and Peru are supplementary-only for us.
// - THE CONDITIONS THAT MUST ALWAYS ACCOMPANY IT:
//   * The student must NOT be enrolled at a Chilean educational
//     establishment for the year in which they sit.
//   * For minors, registration must be made by the mother, father,
//     or legal guardian.
//   * Registration windows OPEN AND CLOSE and places are subject to
//     cupos; if there is no capacity in your comuna you may be
//     assigned an establishment in another.
//   * BÁSICA and MEDIA are TWO SEPARATE PROCESSES — básica must be
//     completed and approved before registering for media.
//   * Children sitting 1° básico must be able to read and write
//     Spanish at the time of examination.
//   * The papers are standardised, set by MINEDUC professionals
//     against the Objetivos Fundamentales and Contenidos Mínimos
//     Obligatorios, and NO CURRICULAR ADAPTATION IS POSSIBLE.
//     Students with NEE or disability register IN PERSON at Ayuda
//     MINEDUC offices with the required certificates.
//   * Aranceles are set by MINEDUC and are generally low.
// - VERIFY AT ayudamineduc.cl. Dates, fees and procedures change,
//   and we say so on every page.
// - DO NOT parrot competitors' "100% legal" marketing. State the
//   mechanism accurately, note that compulsory education still
//   exists, and route families to MINEDUC and their SECREDUC.
// - WE DO NOT ADMINISTER exámenes libres and do not prepare students
//   for the Chilean national curriculum. Say so — see competitor note.
// COMPETITIVE NOTE — CHILE IS A MATURE ONLINE-SCHOOL MARKET, unlike
// most we enter. Colegio Online LAT has operated since 2007 and
// bills itself as Chile's first online school; Wited and others
// support exámenes libres candidates. THEY DO SOMETHING WE DO NOT —
// Chilean national curriculum and exámenes libres preparation — and
// we do something they do not: Cambridge, Edexcel, IB and AP.
// Be straight about the distinction; do not pretend to be a
// substitute for a Chilean-curriculum provider.
// TIMEZONE — THE ONLY LATIN AMERICAN COUNTRY IN OUR COVERAGE WHERE
// THE OFFSET MOVES: continental Chile runs CLT (UTC-4) in winter and
// CLST (UTC-3) during the southern summer, observing daylight saving
// unlike Peru, Colombia, Argentina, Brazil and Mexico. Nairobi is
// UTC+3, so the gap is SEVEN HOURS in Chilean winter and SIX HOURS
// in Chilean summer. State it plainly — the timetable shifts by an
// hour twice a year and we schedule around it.
// MARKET NOTE: Santiago has a deep international tier (Grange, Craighouse,
// Nido de Águilas, Santiago College, the German and French schools)
// and a large bilingual sector. JORNADA ESCOLAR COMPLETA means most
// Chilean schools run a full day — so unlike Colombia and Mexico
// there is no free half-day to schedule into, which is exactly why
// the exámenes libres route matters here. Economy: Santiago's
// corporate and financial centre; Antofagasta and the northern
// copper belt (Escondida, Chuquicamata, Calama) with an
// internationally recruited mining workforce; Valparaíso's port and
// Viña's coastal community; Concepción's forestry, steel and
// university sector; and Puerto Montt's salmon industry and the
// Patagonian gateway.
// ═══════════════════════════════════════════════════════════════════

export const CHILE_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'santiago-cl',
    name: 'Santiago',
    county: 'Región Metropolitana',
    region: 'The corporate and financial capital of one of Latin America\'s most stable economies · a deep international and bilingual school tier · the mining sector\'s head offices · jornada escolar completa across most schools',
    primaryKeyword: 'Online school and international curriculum in Santiago',
    heroTagline: 'For Santiago families — the one Latin American country where a full-time international programme genuinely works, because Chile built the validation route.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Santiago families. Santiago holds Chile\'s corporate and financial weight, the mining sector\'s head offices, and one of the strongest international school tiers in South America — Grange, Craighouse, Nido de Águilas, Santiago College, the German and French schools — with fees to match. Chile is also the one country in our Latin American coverage where a full-time international programme is genuinely workable for a resident child, because MINEDUC operates a formal validation route: exámenes libres, regulated by Decreto 2272/2007 and administered regionally by each SECREDUC.',
    heroImg: '/heroes/santiago-cl.jpg',
    altTexts: { hero: 'Santiago and the Andes' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Santiago families — the exámenes libres route explained, full-time or supplementary. From USD 400/month.',
    challenges: [
      'International school fees in Santiago sit among the highest in South America, with competitive places.',
      'Jornada escolar completa means most Chilean schools run a full day — there is no free half-day to schedule around.',
      'Exámenes libres have registration windows, cupos, and conditions that catch families out if left late.',
      'Chile observes daylight saving, so the gap to our teaching base moves by an hour twice a year.',
      'We do not administer exámenes libres or teach the Chilean national curriculum — that is a different service.',
    ],
    familySituations: [
      'Corporate, financial, and mining head-office families outside the international tier\'s fees.',
      'Families using the exámenes libres route who want an internationally examined academic spine behind it.',
      'Students needing a subject their school cannot staff for a small cohort.',
      'Expatriate and returning-diaspora households.',
      'Students targeting UK, American, Spanish, or Chilean universities.',
      'Families whose child is not thriving in a full-day school environment.',
    ],
    nearbyAreas: ['Las Condes', 'Vitacura', 'Lo Barnechea', 'Providencia', 'La Dehesa', 'Chicureo', 'Colina'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, German, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Chilean university applications',
    ],
    whyChoose: [
      ['Full-time is genuinely possible here', 'Chile\'s exámenes libres route means a resident child can follow a full international programme and still certify Chilean school levels — which is not true in Mexico, Brazil, Argentina, Colombia, or Peru.'],
      ['The conditions explained before you commit', 'Registration windows, cupos, separate básica and media processes, no enrolment at a Chilean school in the same year — we set these out upfront rather than after enrolment.'],
      ['A fee gap against South America\'s strongest tier', 'Live small-group teaching at USD 2,160-6,480 a year against Santiago international fees among the highest in the region.'],
      ['Honest about what we are not', 'We do not administer exámenes libres and do not teach the Chilean national curriculum. Chilean online schools do that well; we teach Cambridge, Edexcel, IB and AP.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core, protecting Chilean and Spanish university routes.'],
    ],
    growingReason: 'Santiago holds Chile\'s corporate and financial centre, the mining sector\'s head offices, and one of South America\'s strongest international school tiers at premium fees — inside the one Latin American framework in our coverage that provides a formal state route for certifying school levels without enrolment. Continental Chile runs CLT (UTC-4) or CLST (UTC-3) in summer, six to seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Santiago families, available full-time alongside the exámenes libres route or supplementary beside a school enrolment. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Santiago families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the city\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Chile is the most accommodating framework in our Latin American coverage, and the reason is a specific piece of state machinery. Exámenes libres are a formal MINEDUC mechanism that allows a person to certify the approval of an educational level — from 1° básico through 4° medio — without having been enrolled at a regular establishment. They are regulated by Decreto 2272/2007, which defines the procedures, deadlines, examining commissions and requirements, and each SECREDUC administers them in its own region, designating the commission, defining the venues, and issuing the certificates. The certification is recognised for entry into state-recognised establishments at básica, media, and higher levels. The conditions matter as much as the mechanism, and families who read only the headline get caught. The student must not be enrolled at a Chilean educational establishment for the year in which they sit. For minors, registration must be made by the mother, father, or legal guardian. Registration windows open and close, and places are subject to cupos — if there is no capacity in your comuna, an establishment in another may be assigned. Básica and media are two separate processes: básica must be completed and approved before registering for media. A child sitting 1° básico must be able to read and write Spanish at the time of examination. The papers are standardised, set by MINEDUC professionals against the Objetivos Fundamentales and Contenidos Mínimos Obligatorios, and no curricular adaptation is possible — students with special educational needs or disability register in person at Ayuda MINEDUC offices with the required certificates. Aranceles are set by MINEDUC and are generally low. Dates, fees and procedures change, so verify at ayudamineduc.cl and with your SECREDUC before committing to a plan. Two honest notes: compulsory education still exists in Chile and this is a validation route rather than an exemption from it; and we do not administer exámenes libres or teach the Chilean national curriculum ourselves.',
    homeTuitionDetail: 'Smartious delivers to Santiago families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Chile observes daylight saving, so the gap to our Nairobi base is seven hours in Chilean winter and six in summer — our classes land in the Chilean morning, and we adjust the timetable at each changeover rather than letting it drift.',
    faqs: [
      { q: 'Is homeschooling legal in Chile?', a: 'Chile operates a formal MINEDUC mechanism — exámenes libres, regulated by Decreto 2272/2007 — allowing certification of educational levels from 1° básico to 4° medio without enrolment at a regular establishment, administered regionally by each SECREDUC. That makes home education workable here in a way it is not in most of Latin America. Compulsory education still exists and this is a validation route rather than an exemption, so confirm your position with MINEDUC and your SECREDUC.' },
      { q: 'Do you administer the exámenes libres?', a: 'No, and we say so plainly. Those are run by MINEDUC through your SECREDUC, and Chilean online schools specialise in preparing students for them against the national curriculum. We teach Cambridge, Pearson Edexcel, IB and AP. Some families use both, and that is a sensible combination.' },
      { q: 'What catches families out?', a: 'The conditions rather than the concept: registration windows that close, cupos that may send you to another comuna, básica and media being two separate processes, and the rule that a student must not be enrolled at a Chilean school in the year they sit. Verify current detail at ayudamineduc.cl.' },
      { q: 'How does the timezone work?', a: 'Chile is the only Latin American country in our coverage that observes daylight saving, so the gap is seven hours in Chilean winter and six in summer. Our classes land in the Chilean morning, and we reset the timetable at each changeover.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'antofagasta-cl',
    name: 'Antofagasta & the Copper North',
    county: 'Antofagasta Region',
    region: 'The world\'s greatest copper district — Escondida, Chuquicamata and the Atacama operations · an internationally recruited mining workforce · Calama and the mine towns · a port shipping to Asia',
    primaryKeyword: 'Online school and international curriculum in Antofagasta',
    heroTagline: 'For Antofagasta, Calama and Atacama families — the largest copper district on earth, staffed from four continents and schooled like a regional town.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across Chile\'s copper north. The Antofagasta region holds the most significant concentration of copper mining anywhere in the world — Escondida, Chuquicamata, and the operations spread across the Atacama — with a technical workforce of engineers, geologists, metallurgists, and management recruited from Australia, Canada, Europe, North America, and across Latin America, much of it on rotation. Calama and the mine towns sit hours inland. Schooling has never matched the industry, and Santiago is a flight south. Smartious teaches Cambridge and IB live to the north, full-time or alongside a school.',
    heroImg: '/heroes/antofagasta-cl.jpg',
    altTexts: { hero: 'The Atacama and the northern Chilean coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Antofagasta, Calama and Atacama families — the world\'s copper capital, thin international schooling. From USD 400/month.',
    challenges: [
      'An internationally recruited mining workforce with limited international schooling, and Santiago a flight away.',
      'Calama and the mine towns sit hours inland from the regional capital.',
      'Rotational contracts move families between operations, countries, and continents.',
      'Exámenes libres have windows, cupos, and separate básica and media processes.',
      'The timezone gap moves by an hour twice a year with Chilean daylight saving.',
    ],
    familySituations: [
      'Mining engineering, geology, metallurgy, and operations families — Chilean and international.',
      'Contractor and mining-services households on rotational postings.',
      'Families at Calama and the inland mine towns.',
      'Port, logistics, and export households at Antofagasta and Mejillones.',
      'Students aiming at mining engineering, metallurgy, or geoscience programmes abroad.',
    ],
    nearbyAreas: ['Antofagasta', 'Calama', 'Chuquicamata', 'Mejillones', 'Tocopilla', 'San Pedro de Atacama', 'the Escondida operations'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Further Mathematics, Geography',
      'Cambridge A-Level Biology, Economics, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Physics, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including mining and geoscience programmes), Common Application (US), and Australian, Canadian and Chilean university applications',
    ],
    whyChoose: [
      ['The mining cohort we already teach across four continents', 'Jwaneng, Solwezi, Kolwezi, Rössing, the Copperbelt — and now the Atacama. The same A-Level spine, the same live groups, the same portability.'],
      ['Metallurgy and geoscience depth', 'Cambridge A-Level Chemistry, Physics, Mathematics, and Geography — led by a founder with a BEd in Mathematics and Physics — suit the world\'s copper capital precisely.'],
      ['The alternative to boarding in Santiago', 'Northern families have sent senior students south for decades. Live teaching reaches Antofagasta and Calama instead.'],
      ['Full-time is possible here', 'Chile\'s exámenes libres route makes a full international programme workable for a resident child — rare in Latin America and useful on a rotation.'],
      ['Portable to the next operation', 'Antofagasta now, Australia, Peru, Zambia, or Canada next — the curriculum and the board stay constant.'],
    ],
    growingReason: 'The Antofagasta region holds the greatest concentration of copper mining on earth — Escondida, Chuquicamata, and the Atacama operations — with an internationally recruited technical workforce, mine towns hours inland, and schooling that has never matched the industry. Continental Chile runs six to seven hours behind Nairobi depending on the season.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the copper north, portable across postings. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American or Canadian universities.',
    },
    homeschoolDetail: 'The national framework applies in the north, and it is unusually useful for a mining region. Exámenes libres, regulated by Decreto 2272/2007 and administered by each SECREDUC, allow certification of levels from 1° básico to 4° medio without enrolment at a regular establishment — which means a rotational family can run a full international programme and still certify Chilean levels. The conditions apply as everywhere: registration windows and cupos, no enrolment at a Chilean school in the year of sitting, básica and media as separate processes, standardised papers with no curricular adaptation, and current detail to be verified at ayudamineduc.cl and with the regional SECREDUC. Families not resident in Chile follow their country of residence\'s framework, a status they determine with their own advisers. We do not administer exámenes libres or teach the Chilean national curriculum.',
    homeTuitionDetail: 'Smartious delivers to northern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Chilean morning, with the timetable reset at each daylight-saving changeover, and every session recorded — built for rosters and remote sites.',
    faqs: [
      { q: 'We are on a mining rotation — does the schooling follow us?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next operation anywhere in the world. It is the case we already run for families in Jwaneng, Solwezi, Kolwezi, and the Namibian uranium coast.' },
      { q: 'Do we have to send our child to board in Santiago?', a: 'That has been the default for northern families. Live teaching reaches Antofagasta and Calama, with examination travel a few times a year rather than a child living away.' },
      { q: 'Can our child study full-time with you in Chile?', a: 'Chile is the one Latin American country in our coverage where that is genuinely workable for a resident child, because exámenes libres provide a state route to certifying school levels. The conditions are real — windows, cupos, separate básica and media processes — and we set them out before you commit.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'valparaiso-cl',
    name: 'Valparaíso & Viña del Mar',
    county: 'Región de Valparaíso',
    region: 'The principal port and the coastal metropolitan area · the National Congress and naval institutions · a substantial university sector · a growing international resident community along the coast',
    primaryKeyword: 'Online school and international curriculum in Valparaíso and Viña del Mar',
    heroTagline: 'For Valparaíso and Viña families — Chile\'s port and coastal capital, an hour and a half from the Santiago tier and priced out of it.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Valparaíso and Viña del Mar families. The coastal metropolitan area carries Chile\'s principal port, the National Congress, the naval institutions, and one of the country\'s largest concentrations of universities — alongside a growing international resident community drawn to the coast, and a long-standing British and German heritage that shaped the region\'s schools. Santiago\'s tier is an hour and a half inland and priced accordingly. Smartious teaches live to the coast, full-time or alongside a school.',
    heroImg: '/heroes/valparaiso-cl.jpg',
    altTexts: { hero: 'Valparaíso hills and harbour' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Valparaíso and Viña del Mar families — port and coastal region, Santiago tier priced away. From USD 400/month.',
    challenges: [
      'Santiago\'s international tier is an hour and a half inland and priced at capital level.',
      'A growing international resident community along the coast with limited local provision.',
      'Jornada escolar completa leaves little room for a supplementary block during term.',
      'Exámenes libres have windows, cupos, and separate básica and media processes.',
      'The timezone gap moves by an hour twice a year with Chilean daylight saving.',
    ],
    familySituations: [
      'Port, naval, and maritime-services families.',
      'University and academic households across the coastal universities.',
      'International residents and remote-work families along the coast.',
      'Families with British and German heritage ties in the region.',
      'Households commuting to Santiago who would rather not commute their children.',
    ],
    nearbyAreas: ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana', 'Casablanca', 'San Antonio'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, German, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, German and Chilean university applications',
    ],
    whyChoose: [
      ['No commute to Santiago, for the child at least', 'Coastal families who work inland do not need to send their children inland too — live delivery reaches the whole region identically.'],
      ['German and French alongside the core', 'The region\'s heritage communities can run Cambridge German or French beside the English-medium track, and both university systems read the record routinely.'],
      ['Full-time is possible here', 'Chile\'s exámenes libres route makes a full international programme workable for a resident child.'],
      ['A fee gap against a capital tier', 'Live small-group teaching at USD 2,160-6,480 a year.'],
      ['Honest about what we are not', 'We do not administer exámenes libres or teach the Chilean national curriculum.'],
    ],
    growingReason: 'The Valparaíso coastal metropolitan area carries Chile\'s principal port, the National Congress, the naval institutions, and a large university sector, alongside a growing international resident community — with Santiago\'s tier an hour and a half inland and priced at capital level. Continental Chile runs six to seven hours behind Nairobi depending on the season.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the coast, available full-time alongside the exámenes libres route or supplementary beside a school enrolment.',
      cbc: 'Kenya CBC available for coastal families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies on the coast: exámenes libres under Decreto 2272/2007, administered by the regional SECREDUC, allow certification of levels from 1° básico to 4° medio without enrolment at a regular establishment, subject to registration windows, cupos, the separation of básica and media processes, and the rule that a student must not be enrolled at a Chilean school in the year of sitting. Papers are standardised with no curricular adaptation, and current detail should be verified at ayudamineduc.cl. We do not administer exámenes libres or teach the Chilean national curriculum — we teach Cambridge, Edexcel, IB and AP, full-time or alongside a school.',
    homeTuitionDetail: 'Smartious delivers to coastal families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Chilean morning, with the timetable reset at each daylight-saving changeover, and every session recorded.',
    faqs: [
      { q: 'We live on the coast and work in Santiago — does that shape the choice?', a: 'It usually does. Families already commuting inland rarely want to add a school run to it, and live delivery reaches Valparaíso, Viña, and Concón identically.' },
      { q: 'Can our child keep German?', a: 'Yes — Cambridge German runs alongside the English-medium core, which suits the region\'s heritage community and keeps German university routes open.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'concepcion-cl',
    name: 'Concepción & the Biobío',
    county: 'Región del Biobío',
    region: 'The industrial and university capital of the south · forestry, pulp, steel and petrochemicals · one of Chile\'s largest student populations · thin international provision for its scale',
    primaryKeyword: 'Online school and international curriculum in Concepción',
    heroTagline: 'For Concepción and Biobío families — Chile\'s industrial and academic south, with a fraction of the capital\'s international provision.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Concepción and Biobío families. Concepción is the industrial and academic capital of southern Chile — forestry and pulp at a scale that shapes national exports, steel and petrochemicals around Talcahuano and San Vicente, a major port, and one of the country\'s largest student and academic populations across several universities. Its international provision is thin relative to that profile, and Santiago is five hundred kilometres north. Smartious teaches live across the Biobío, full-time or alongside a school.',
    heroImg: '/heroes/concepcion-cl.jpg',
    altTexts: { hero: 'Concepción and the Biobío river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Concepción and Biobío families — industrial and university south, thin provision. From USD 400/month.',
    challenges: [
      'International provision thin relative to the region\'s industrial and academic scale.',
      'Santiago is five hundred kilometres north — a relocation rather than a commute.',
      'Jornada escolar completa leaves little room for a supplementary block during term.',
      'Exámenes libres have windows, cupos, and separate básica and media processes.',
      'The timezone gap moves by an hour twice a year with Chilean daylight saving.',
    ],
    familySituations: [
      'Forestry, pulp, steel, and petrochemical engineering families.',
      'Port and industrial-services households around Talcahuano and San Vicente.',
      'University academic, research, and medical-faculty families.',
      'Regional business families with export ties to Asia and Europe.',
      'Students aiming at engineering, forestry science, or medicine abroad.',
    ],
    nearbyAreas: ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Chiguayante', 'Coronel', 'Los Ángeles', 'Chillán'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Further Mathematics, Biology',
      'Cambridge A-Level Economics, Business, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Physics, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Chilean university applications',
    ],
    whyChoose: [
      ['Engineering and chemistry depth for an industrial region', 'Cambridge A-Level Chemistry, Physics, and Mathematics suit forestry, pulp, steel, and petrochemical families precisely.'],
      ['The complete option five hundred kilometres from the tier', 'Identical live delivery in Concepción and Santiago, without relocation.'],
      ['Environmental science that fits the place', 'Forestry, coastal industry, and the Biobío make unusually good context for Cambridge Geography and AP Environmental Science.'],
      ['Full-time is possible here', 'Chile\'s exámenes libres route makes a full international programme workable for a resident child.'],
      ['Honest about what we are not', 'We do not administer exámenes libres or teach the Chilean national curriculum.'],
    ],
    growingReason: 'Concepción is the industrial and academic capital of southern Chile — forestry and pulp at national-export scale, steel and petrochemicals around Talcahuano, a major port, and one of the country\'s largest student populations — with international provision thin relative to that profile and Santiago five hundred kilometres north. Continental Chile runs six to seven hours behind Nairobi depending on the season.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Biobío, available full-time alongside the exámenes libres route or supplementary beside a school enrolment.',
      cbc: 'Kenya CBC available for Biobío families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in the Biobío: exámenes libres under Decreto 2272/2007, administered by the regional SECREDUC, certify levels from 1° básico to 4° medio without enrolment at a regular establishment — subject to registration windows and cupos, the separation of básica and media, standardised papers with no curricular adaptation, and the rule that a student must not be enrolled at a Chilean school in the year of sitting. Verify current detail at ayudamineduc.cl. We do not administer exámenes libres or teach the Chilean national curriculum.',
    homeTuitionDetail: 'Smartious delivers to Biobío families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Chilean morning, with the timetable reset at each daylight-saving changeover, and every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Concepción?', a: 'Thin relative to the region\'s scale, with Santiago five hundred kilometres north. Live delivery reaches the whole Biobío identically.' },
      { q: 'Where do Biobío students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into each window ahead.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'puerto-montt-cl',
    name: 'Puerto Montt & the Lakes',
    county: 'Los Lagos Region',
    region: 'The salmon farming capital — one of the world\'s largest aquaculture industries · Norwegian and Japanese investment · the Patagonian gateway · a German-heritage community around the lakes',
    primaryKeyword: 'Online school and international curriculum in Puerto Montt',
    heroTagline: 'For Puerto Montt and Lakes families — a global aquaculture industry with Norwegian capital behind it, and a school map that stops well north.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Puerto Montt and Los Lagos families. Southern Chile hosts one of the largest salmon farming industries in the world, built substantially on Norwegian and Japanese investment and employing aquaculture scientists, veterinarians, engineers, and management from across Europe, Asia, and the Americas. Around it sit the German-heritage communities of the lake district, a growing tourism economy, and the gateway to Patagonia. International schooling stops well north of here. Smartious teaches live to the south, full-time or alongside a school.',
    heroImg: '/heroes/puerto-montt-cl.jpg',
    altTexts: { hero: 'Puerto Montt and the southern Chilean lakes' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Puerto Montt and Los Lagos families — global salmon industry, no international schooling. From USD 400/month.',
    challenges: [
      'A globally significant aquaculture industry with essentially no international schooling in the region.',
      'International staff arrive from Norway, Japan, and elsewhere on multi-year assignments.',
      'Families spread across the lakes, the fjords, and the island of Chiloé.',
      'Exámenes libres have windows, cupos, and separate básica and media processes.',
      'The timezone gap moves by an hour twice a year with Chilean daylight saving.',
    ],
    familySituations: [
      'Salmon farming, aquaculture science, and veterinary families — Chilean and international.',
      'Norwegian, Japanese, and European investment and management households.',
      'German-heritage families around Puerto Varas, Frutillar, and Osorno.',
      'Tourism and Patagonian-gateway business families.',
      'Students aiming at marine biology, aquaculture, or veterinary programmes abroad.',
    ],
    nearbyAreas: ['Puerto Montt', 'Puerto Varas', 'Frutillar', 'Osorno', 'Castro and Chiloé', 'Llanquihue', 'the Patagonian fjords'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, German and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Geography',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Norwegian, German, Canadian and Chilean university applications',
    ],
    whyChoose: [
      ['Biology and environmental science that fit the industry', 'Cambridge A-Level Biology and Chemistry with Geography suit aquaculture, marine biology, and veterinary routes precisely.'],
      ['German alongside for the lake district', 'The region\'s heritage community can run Cambridge German beside the English-medium core, and German universities read the record routinely.'],
      ['Reaches the fjords and Chiloé', 'Families spread across the lakes and islands get identical live teaching without relocating.'],
      ['Full-time is possible here', 'Chile\'s exámenes libres route makes a full international programme workable for a resident child — useful this far from any campus.'],
      ['Portable across a Norwegian or Japanese posting', 'The curriculum and examination board continue unchanged to the next country.'],
    ],
    growingReason: 'Southern Chile hosts one of the largest salmon farming industries in the world, built substantially on Norwegian and Japanese investment, alongside the German-heritage lake communities and the Patagonian gateway — with international schooling stopping well north. Continental Chile runs six to seven hours behind Nairobi depending on the season.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Los Lagos, available full-time alongside the exámenes libres route or supplementary beside a school enrolment.',
      cbc: 'Kenya CBC available for southern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in the south, and it matters more here than almost anywhere in Chile because the alternatives are so distant. Exámenes libres under Decreto 2272/2007, administered by the regional SECREDUC, certify levels from 1° básico to 4° medio without enrolment at a regular establishment — subject to registration windows and cupos, the separation of básica and media processes, standardised papers with no curricular adaptation, and the requirement not to be enrolled at a Chilean school in the year of sitting. Verify current detail at ayudamineduc.cl. Families not resident in Chile follow their country of residence\'s framework, a status they determine with their own advisers — relevant for the Norwegian and Japanese secondment community here. We do not administer exámenes libres or teach the Chilean national curriculum.',
    homeTuitionDetail: 'Smartious delivers to Los Lagos families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Chilean morning, with the timetable reset at each daylight-saving changeover, and every session recorded — built for remote sites and island communities.',
    faqs: [
      { q: 'We are here on a Norwegian or Japanese aquaculture posting — does the schooling travel?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next country, with examinations sat at authorised centres wherever the family is.' },
      { q: 'Is there any international schooling in Los Lagos?', a: 'Essentially none — provision stops well north. Live delivery is the route that reaches the lakes, the fjords, and Chiloé.' },
      { q: 'Our child wants marine biology — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Geography or Mathematics, planned backward from the target university from IGCSE onward.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const CHILE_COUNTRY = {
  slug: 'chile',
  name: 'Chile',
  longName: 'Republic of Chile',
  adjective: 'Chilean',
  flag: '🇨🇱',
  hub: '/online-school/chile',
  hubPageId: 'homeschooling-chile',
  cityPageId: 'chile-city',

  currency: 'CLP',
  currencyName: 'Chilean Peso',
  currencyPeg: 'Fees are invoiced in USD; peso equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'CLT / CLST',
    name: 'Chile Time (UTC-4), with daylight saving to UTC-3 during the southern summer',
    utcOffset: '-4 / -3',
    offsetFromEAT: '-7 hours in Chilean winter, -6 hours in Chilean summer — the offset moves twice a year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Chile has established Cambridge provision through its international and bilingual school sector'],
  examCentreTiles: [
    { city: 'Santiago', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Valparaíso and Concepción', centre: 'Regional provision', area: 'Checked first for coastal and southern families.' },
    { city: 'Antofagasta and the south', centre: 'Planned per session', area: 'Northern mining and Los Lagos families plan travel into each window well ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Chile-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — Santiago first, with regional options in Valparaíso and Concepción and travel planned ahead from Antofagasta and Los Lagos. Chile has a second examination calendar that most of our markets do not, and the two need planning together. Exámenes libres, regulated by Decreto 2272/2007, are administered by each SECREDUC in its own region, which designates the examining commission, defines the venues, and issues the certificates. Registration windows open and close, places are subject to cupos, and básica and media are two separate processes with básica to be completed first. We do not administer those examinations and we do not prepare students against the Chilean national curriculum — Chilean online schools specialise in exactly that, and some of our families use both. What we plan is the Cambridge or IB calendar around whichever Chilean route a family is following, and we tell every family to verify current dates and procedures at ayudamineduc.cl.',
  secondaryProgrammeExamRef: 'Authorised Chilean Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/chile.jpg',
  heroEyebrow: 'Online school for Chile',
  heroH1Suffix: 'Chile',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for mining, corporate, aquaculture, and Chilean families across Santiago, Valparaíso, Antofagasta, Concepción, and Puerto Montt. Chile is the one country in our Latin American coverage where a full-time international programme genuinely works for a resident child — because MINEDUC operates exámenes libres, a state route to certifying school levels without enrolment.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — full-time or alongside your school.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Chile',

  citiesSectionTitle: 'Where our Chile families are',
  citiesSectionBody: 'Smartious Chile families concentrate across Santiago (the corporate and financial capital with one of South America\'s strongest international tiers, priced accordingly), Antofagasta and the copper north (the greatest concentration of copper mining on earth, with an internationally recruited workforce and mine towns hours inland), Valparaíso and Viña del Mar (the port, the Congress, the universities and a growing coastal international community), Concepción and the Biobío (the industrial and academic south, thin on provision for its scale), and Puerto Montt and the Lakes (one of the world\'s largest salmon industries, built on Norwegian and Japanese investment, with no international schooling within hundreds of kilometres). One state validation route, two possible configurations, and a timezone that moves twice a year.',

  trustSignals: [
    { h: 'An African school teaching Chilean families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023, serving students across more than seventy countries — an internationally accredited online school.' },
    { h: 'The one Latin American market where full-time works', p: 'Exámenes libres, regulated by Decreto 2272/2007 and administered by each SECREDUC, certify levels from 1° básico to 4° medio without enrolment at a regular establishment. Mexico, Brazil, Argentina, Colombia and Peru are supplementary-only for us; Chile is not.' },
    { h: 'The conditions stated before you commit', p: 'Registration windows and cupos, básica and media as separate processes, no enrolment at a Chilean school in the year of sitting, standardised papers with no curricular adaptation. Verify current detail at ayudamineduc.cl and with your SECREDUC.' },
    { h: 'Honest about what we do not do', p: 'We do not administer exámenes libres and we do not teach the Chilean national curriculum. Chilean online schools do that well and have done for years; we teach Cambridge, Pearson Edexcel, IB and AP. Some families sensibly use both.' },
  ],

  universitiesInCountry: 'Universidad de Chile, Pontificia Universidad Católica, Universidad de Concepción, Universidad Técnica Federico Santa María, Universidad Austral and the wider CRUCH system, with admission principally through the PAES.',
  universityChannels: 'Chilean universities admit principally through the PAES, and holders of foreign qualifications go through recognition and revalidación procedures with requirements confirmed per institution — a family intending to enter Chilean higher education should confirm that route early, and note that exámenes libres certification is itself recognised for entry into state-recognised establishments at básica, media, and higher levels. Outward, Chilean students are strongly oriented toward the United States and Spain, with Australia and Canada meaningful for the mining and resource sectors, and all of them read Cambridge A-Levels, the IB Diploma, and AP records directly. UCAS reads A-Levels natively, and A-Levels are accepted in 160+ countries — including the mining engineering, metallurgy, and marine science programmes our Antofagasta and Los Lagos families most often have in view. Smartious provides personalised university guidance across US, Spanish, Australian, Canadian, UK (UCAS), and Chilean destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Chile families, and here it comes in two genuine shapes rather than one. Full-time: a complete Cambridge IGCSE and A-Level programme, with Chilean school levels certified separately through exámenes libres — workable in Chile in a way it is not elsewhere in Latin America. Or supplementary: live Cambridge subjects alongside a school enrolment. Classes land in the Chilean morning; because Chile observes daylight saving, the offset is seven hours in winter and six in summer and we reset the timetable at each changeover. Cambridge Spanish available alongside the English-medium core.',
  britishCurriculumSuits: 'Chile families targeting the Cambridge pathway. Best fit for: (1) families using the exámenes libres route who want an internationally examined academic spine behind it, (2) mining families in Antofagasta, Calama, and the Atacama where boarding in Santiago has been the default, (3) Los Lagos aquaculture families with no provision within hundreds of kilometres, (4) coastal and southern families priced out of or distant from the Santiago tier, (5) students whose school cannot staff a specialist A-Level set.',
  britishCurriculumDelivery: 'Live online classes in the Chilean morning, small groups 4-6 students, every session recorded, full-time or alongside a school enrolment.',
  ibDiplomaSuits: 'Chile families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Chile families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Chile is the only Latin American market where we can offer a resident child a full-time programme, because Chile built the validation route that makes it possible — and it is also one of the few markets where an established local online-school sector got there before us.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the copper north\'s metallurgy and geoscience families, the Biobío\'s industrial households, and the aquaculture scientists of Los Lagos. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Chile is one of the few markets we enter where an established online-school sector already exists. Colegio Online LAT has operated since 2007 and describes itself as Chile\'s first online school; Wited and others support exámenes libres candidates with live classes and tutoring. They do something we do not — teach the Chilean national curriculum and prepare students specifically for MINEDUC examinations — and we do something they do not, in Cambridge, Edexcel, IB and AP. A family should know which one they are buying, and some sensibly buy both. Alongside that sits a strong Santiago international tier at premium fees, and very little provision in the mining north or the deep south.',
  competitors: [
    { name: 'Grange, Craighouse, Nido de Águilas, Santiago College', city: 'Santiago',       curriculum: 'British, American and IB',              feesUsd: 'Among the highest in South America',                feesAed: 'Premium tier',            rating: 4.8, capacityNote: 'Excellent and long-established — the regional benchmark' },
    { name: 'Colegio Online LAT',                             city: 'Online, Chile',         curriculum: 'Chilean national + exámenes libres prep', feesUsd: 'Local pricing',                                  feesAed: '—',                       rating: 4.4, capacityNote: 'Operating since 2007 — genuinely established, and a different service from ours' },
    { name: 'Wited and exámenes libres support providers',    city: 'Online, Chile',         curriculum: 'National curriculum tutoring',           feesUsd: 'Per-subject or package',                            feesAed: '—',                       rating: 4.2, capacityNote: 'Specialists in MINEDUC examination preparation — complementary to what we teach, not competing' },
    { name: 'The German, French and Italian schools',         city: 'Santiago, Valparaíso',  curriculum: 'National-system bilingual',              feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.6, capacityNote: 'Strong heritage schools — a different route entirely' },
    { name: 'The copper north and the deep south',            city: 'Antofagasta, Los Lagos', curriculum: 'Little to none',                       feesUsd: 'No real international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'The world\'s copper capital and a global salmon industry, both without international schooling' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh (online)', city: 'Online',                curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious — UK providers are closer to Chile on the clock than we are' },
    { name: 'Smartious Homeschool (Chile via online delivery)', city: 'Delivered to all Chile', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'CLP equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + full-time genuinely possible via exámenes libres + the copper north and Los Lagos reached + honest that we do not teach the Chilean curriculum' },
  ],

  legalFrameworkIntro: 'Chile has the most accommodating framework in our Latin American coverage, and it is accommodating for a specific structural reason rather than a permissive attitude. Here is the mechanism, its conditions, and what we can and cannot do within it.',
  legalFramework: [
    { h: 'Exámenes libres: what the mechanism actually is', p: 'Exámenes libres are a formal MINEDUC mechanism allowing a person to certify approval of an educational level — from 1° básico through 4° medio — without having been enrolled at a regular establishment. They are regulated by Decreto 2272/2007, which defines the procedures, deadlines, examining commissions, and requirements, and each SECREDUC administers them within its own region: designating the commission, defining the venues, and issuing the certificates. The resulting certification is recognised for entry into state-recognised establishments at básica, media, and higher levels. That is a genuine state route, and it is why Chile is the only country in our Latin American coverage where a resident child can realistically follow a full-time international programme.' },
    { h: 'The conditions, which matter as much as the mechanism', p: 'Families who read only the headline get caught by the detail, so here it is. The student must not be enrolled at a Chilean educational establishment for the year in which they sit. For minors, registration must be made by the mother, father, or legal guardian. Registration windows open and close, and places are subject to cupos — if there is no capacity in your comuna, an establishment in another may be assigned. Básica and media are two separate registration processes, and básica must be completed and approved before media can be attempted. A child sitting 1° básico must be able to read and write Spanish at the time of examination. The papers are standardised, prepared by MINEDUC professionals against the Objetivos Fundamentales and Contenidos Mínimos Obligatorios, and no curricular adaptation is possible; students with special educational needs or a disability register in person at Ayuda MINEDUC offices with the required certificates. Aranceles are set by MINEDUC and are generally low.' },
    { h: 'What we say about legality, and what we do not', p: 'Some Chilean providers advertise homeschooling as "100% legal" on the strength of this mechanism. We would put it more carefully. Compulsory education exists in Chile, and exámenes libres are a validation route rather than an exemption from it — the state\'s position is that levels can be certified this way, not that schooling is optional. Chilean academic work on the subject describes home education as a non-formal modality in which parents directly exercise the preferential right to educate, and notes how little evidence exists about outcomes. That is a fair description, and it is enough for a family to plan on. Confirm your own position with MINEDUC and your SECREDUC, and verify current dates, fees, and procedures at ayudamineduc.cl before committing, because they change.' },
    { h: 'Jornada escolar completa, and why it changes our offer here', p: 'One practical contrast with our other Latin American markets is worth drawing. In Mexico, Colombia, Argentina, and Brazil, schools commonly run morning and afternoon shifts, which leaves a large share of students with half a day genuinely free — and that free half-day is what makes a supplementary arrangement work at long distance. Chile\'s jornada escolar completa means most schools run a full day, so that window largely does not exist here. Which is precisely why the exámenes libres route matters: in Chile the answer is not to fit around a shift system, but that a full programme is actually available.' },
    { h: 'What we are, and are not', p: 'Smartious is not a Chilean educational establishment, does not administer exámenes libres, and does not teach the Chilean national curriculum. We deliver Cambridge, Pearson Edexcel, IB, and AP qualifications with their own international validity. Chile already has online schools that prepare students against the national curriculum for MINEDUC examinations — Colegio Online LAT has done it since 2007, and others alongside — and they do that well. A family choosing between us and them is choosing between two different products, and some families run both. We would rather draw that line clearly than blur it.' },
    { h: 'The timezone, which moves', p: 'Chile is the only country in our Latin American coverage that observes daylight saving. Continental Chile runs UTC-4 in winter and UTC-3 during the southern summer, while our teaching base runs UTC+3 year-round — so the gap is seven hours in Chilean winter and six in Chilean summer. Our classes land in the Chilean morning either way, and we reset the timetable at each changeover rather than letting it drift. It is a minor operational point and we mention it because families planning around a fixed weekly slot deserve to know it moves twice a year.' },
  ],

  whySmartious: [
    { h: 'Full-time is genuinely possible in Chile',                       p: 'Exámenes libres give a resident child a state route to certifying school levels without enrolment — which no other Latin American market in our coverage offers.' },
    { h: 'The conditions set out before you commit',                       p: 'Windows, cupos, separate básica and media processes, no concurrent enrolment, standardised papers. We put these on the page rather than in a follow-up call.' },
    { h: 'Honest that Chile already has online schools',                   p: 'Colegio Online LAT has run since 2007 and others prepare exámenes libres candidates. They teach the Chilean curriculum; we teach Cambridge, Edexcel, IB and AP. Different products.' },
    { h: 'The copper north and the deep south reached',                    p: 'Antofagasta, Calama, Puerto Montt and Chiloé have essentially no international schooling. Live delivery reaches all of them.' },
    { h: 'Mining and marine science depth',                                p: 'Chemistry, Physics and Geography for the Atacama; Biology and Chemistry for Los Lagos aquaculture. The subject spines these regions actually aim at.' },
    { h: 'Straight about the shifting clock',                              p: 'Chile observes daylight saving, so the offset is seven hours in winter and six in summer. We reset the timetable rather than pretending it is fixed.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Chile?', a: 'Chile operates exámenes libres — a formal MINEDUC mechanism, regulated by Decreto 2272/2007 and administered by each SECREDUC, allowing certification of levels from 1° básico to 4° medio without enrolment at a regular establishment. That makes home education workable here in a way it is not elsewhere in Latin America. We would avoid the phrase "100% legal" that some providers use: compulsory education exists and this is a validation route rather than an exemption. Confirm your position with MINEDUC and your SECREDUC.' },
    { q: 'Can our child study full-time with Smartious in Chile?', a: 'Yes — Chile is the one Latin American market in our coverage where that is realistic for a resident child, with Chilean school levels certified separately through exámenes libres. The conditions are real and we set them out before you enrol.' },
    { q: 'Do you administer or prepare for exámenes libres?', a: 'No, and we say so plainly. Those are MINEDUC examinations against the Chilean national curriculum, administered through your SECREDUC, and Chilean online schools specialise in preparing students for them. We teach Cambridge, Pearson Edexcel, IB and AP. Some families use both, which is a sensible combination.' },
    { q: 'What conditions catch families out?', a: 'Registration windows that close; cupos that may assign you an establishment in another comuna; básica and media being two separate processes with básica first; the rule that a student must not be enrolled at a Chilean school in the year they sit; and standardised papers with no curricular adaptation. Verify current detail at ayudamineduc.cl.' },
    { q: 'Why does Chile not have the shift-system option other countries do?', a: 'Because jornada escolar completa means most Chilean schools run a full day, so there is no free half-day to schedule a supplementary block into — unlike Mexico, Colombia, Argentina, or Brazil. That is precisely why the exámenes libres route matters more here.' },
    { q: 'How does the timezone work?', a: 'Chile is the only Latin American country in our coverage observing daylight saving, so the gap is seven hours in Chilean winter and six in summer. Our classes land in the Chilean morning either way, and we reset the timetable at each changeover.' },
    { q: 'Will Chilean universities accept Cambridge A-Levels?', a: 'Chilean universities admit principally through the PAES, with foreign qualifications going through recognition and revalidación procedures confirmed per institution — start early if a Chilean university is the plan. Exámenes libres certification is itself recognised for entry into state-recognised establishments. Outward, US, Spanish, Australian, Canadian and UK universities read A-Levels and the IB directly.' },
    { q: 'Which parts of Chile does Smartious cover?', a: 'Santiago, Antofagasta and the copper north, Valparaíso and Viña del Mar, Concepción and the Biobío, and Puerto Montt and the Lakes have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether you are pursuing exámenes libres or keeping a school enrolment: in Chile those are two genuinely different plans, and that conversation belongs at the start rather than after the first term.',
}
