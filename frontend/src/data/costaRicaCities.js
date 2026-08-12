// ═══════════════════════════════════════════════════════════════════
// COSTA RICA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for expatriate, free-zone, tourism, and Costa Rican
// families across San José, Heredia, Guanacaste, Limón and Quepos.
// NINTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — SOURCES CONFLICT AND WE MUST SIDE WITH THE
// COSTA RICAN ONES. READ ALL OF THIS BEFORE EDITING:
// - WHAT COSTA RICAN SOURCES SAY: the MEP does NOT accept
//   homeschooling as a modality. Costa Rican press reporting states
//   plainly that "esta modalidad no es aceptada por el Ministerio de
//   Educación Pública". A 2025 Universidad Nacional analysis of
//   distance and home education records that homeschooling IS
//   practised in Costa Rica but "sin respaldo legal ni supervisión
//   estatal" — without legal backing or state supervision — and
//   raises child-rights concerns about that.
// - WHAT SOME EXPAT RELOCATION SITES SAY: that homeschooling is
//   "legal in Costa Rica" and "regulated by the MEP" with a
//   notification-and-approval process. THAT CLAIM CONFLICTS WITH
//   COSTA RICAN SOURCES AND WE DO NOT REPEAT IT. Where we mention it
//   at all, we mention it as a claim expatriate families encounter
//   and should treat with caution. This correction is one of the
//   most useful things on the Costa Rica pages — lead with it on the
//   Guanacaste and San José pages especially.
// - PENDING LEGISLATION: a legislative proposal, EXPEDIENTE 24648,
//   would explicitly regulate distance and home education. Report as
//   PENDING, never as enacted. An earlier bill contemplated an
//   "Escuela en el Hogar" with annual registration and a rule that
//   registered students could not be enrolled at any official
//   institution while in that condition.
// - CONSTITUTIONAL/STATUTORY BASE: Constitution ARTICLE 78 makes
//   preescolar, Educación General Básica and Educación Diversificada
//   COMPULSORY, and free in the public system. Ley Fundamental de
//   Educación No. 2160 of 1957 is the governing statute.
// - THE GENUINELY VALUABLE MECHANISM — EDUCACIÓN ABIERTA: the MEP,
//   through the Dirección de Gestión y Evaluación de la Calidad
//   (DGEC), administers Educación Abierta, comprising (1) EDUCACIÓN
//   DIVERSIFICADA A DISTANCIA, for youth and adults who have
//   completed the ninth grade of Educación General Básica, and
//   (2) BACHILLERATO POR MADUREZ SUFICIENTE, for people over 18 —
//   with exceptions — who did not complete studies in the
//   traditional system. BOTH AWARD DIPLOMAS WITH THE SAME ACADEMIC
//   AND LEGAL VALUE AS THE TRADITIONAL BACHILLERATO. Say that; it is
//   the single most useful fact for a Costa Rican family outside the
//   ordinary system.
// - EL MAESTRO EN CASA: a formal open educational offering that
//   includes a route for students UNDER 18 BUT OVER 15, with two
//   comprehensive tests and a final test per subject across Español,
//   Ciencias, Matemática, Estudios Sociales, Idioma and Educación
//   Cívica, comprehensives passed at a minimum of 70 and weighted
//   40% against a final worth 60%, leading to the Bachiller en
//   Educación Media. Mention factually; it is a genuine under-18
//   route and families do not know it exists.
// - RISK TO STATE: university admission may be complicated by the
//   lack of official MEP recognition of homeschooling. Put this on
//   the page.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT. We do not administer
//   Educación Abierta, El Maestro en Casa, or any MEP examination,
//   and we are not an MEP-accredited institution.
// TIMEZONE — TIED WITH MEXICO AS OUR HARDEST: CST (UTC-6), no
// daylight saving — NINE HOURS behind Nairobi. Our teaching lands in
// Two teaching teams in different time zones = classes available across the full day. A 07:00
// Costa Rican class is 16:00 in Nairobi. State the constraint
// plainly and give the morning solution.
// MARKET NOTE: the Central Valley holds a strong international tier
// — Country Day School, Lincoln School, the American International
// School at Cariari in Belén, the British School, Marian Baker, the
// European School — much of it clustered in Escazú, Santa Ana and
// Heredia. Fees sit at the top of the Central American market.
// Economy: the Escazú–Santa Ana corporate and services belt; the
// Heredia and Belén free zones with medical devices and technology
// manufacturing; Guanacaste's tourism, retiree and digital-nomad
// belt around Tamarindo, Nosara and Papagayo; Limón's Caribbean port
// and banana economy; and the Central Pacific tourism corridor
// around Quepos and Manuel Antonio. Costa Rica introduced a
// digital-nomad visa route in 2022 and the inflow is visible.
// ═══════════════════════════════════════════════════════════════════

export const COSTA_RICA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'san-jose-cr',
    name: 'San José & the Central Valley',
    county: 'San José Province',
    region: 'The capital and the Escazú–Santa Ana corporate belt · the country\'s strongest international school tier · the diplomatic and services community · a large expatriate and remote-work population',
    primaryKeyword: 'Online school and international curriculum in San José Costa Rica',
    heroTagline: 'For San José and Central Valley families — the Cambridge route at a fraction of Escazú\'s fees, and an honest account of what the MEP does and does not accept.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for San José and Central Valley families. The Escazú and Santa Ana belt holds Costa Rica\'s corporate and services sector, its diplomatic community, and the strongest international school tier in Central America outside Panama City — Country Day School, Lincoln School, the British School, Marian Baker, the European School — with fees to match. Costa Rica also has one of the more misreported legal positions in the region, and we set it out plainly: the MEP does not accept homeschooling as a modality, whatever some relocation websites tell arriving families.',
    heroImg: '/heroes/san-jose-cr.jpg',
    altTexts: { hero: 'San José and the Central Valley' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for San José and Central Valley families — the MEP position stated accurately, morning classes. From USD 400/month.',
    challenges: [
      'International school fees in the Central Valley sit at the top of the Central American market.',
      'The MEP does not accept homeschooling as a modality, despite what several expat relocation sites claim.',
      'Constitutional article 78 makes preescolar, general básica and diversificada education compulsory.',
      'We teach nine hours ahead, so our classes land in the Costa Rican morning, not the afternoon.',
      'University admission can be complicated by the absence of official MEP recognition for home education.',
    ],
    familySituations: [
      'Corporate, services, and professional families outside the international tier\'s fees.',
      'Diplomatic and international-organisation households.',
      'Remote-work and digital-nomad families arriving under the 2022 visa route.',
      'Families supplementing a Costa Rican school with Cambridge subjects.',
      'Students preparing for US, Canadian, UK, or Costa Rican universities.',
      'Students over 15 exploring MEP open-education certification routes alongside an international track.',
    ],
    nearbyAreas: ['Escazú', 'Santa Ana', 'Curridabat', 'Rohrmoser', 'Ciudad Colón', 'Alajuela', 'Cartago'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French, German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Costa Rican university applications',
    ],
    whyChoose: [
      ['The MEP position stated accurately, not conveniently', 'Costa Rican sources are clear that the ministry does not accept homeschooling as a modality, and that it is practised without legal backing or state supervision. Several expat relocation sites say the opposite. We follow the Costa Rican sources.'],
      ['A fee gap against Central America\'s strongest tier', 'Live small-group teaching at USD 2,160-6,480 a year against Escazú and Santa Ana fees at the top of the regional market.'],
      ['Morning classes, which is the only option at nine hours', 'A seven o\'clock Costa Rican class is four in the afternoon for our teachers. Both morning and after-school blocks are available, since we run two teaching teams in different time zones.'],
      ['The MEP open-education routes explained', 'Educación Abierta and El Maestro en Casa are real certification mechanisms and most families do not know the under-18 route exists. We explain them; we do not administer them.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core, protecting Costa Rican and Spanish university routes.'],
    ],
    growingReason: 'The Escazú and Santa Ana belt holds Costa Rica\'s corporate and services sector, its diplomatic community, and the strongest international school tier in Central America outside Panama City, with fees to match — in a country where the MEP does not accept homeschooling as a modality. Costa Rica runs CST (UTC-6), nine hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Central Valley families, taught in the Costa Rican morning alongside a school enrolment. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Central Valley families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the Valley\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Costa Rica is one of the countries where we most often have to correct what a family has already read. Constitutional article 78 makes preescolar, Educación General Básica and Educación Diversificada compulsory and free in the public system, with the Ley Fundamental de Educación No. 2160 of 1957 as the governing statute. On home education, Costa Rican sources are consistent and unflattering to the marketing: press reporting states plainly that the modality is not accepted by the Ministerio de Educación Pública, and a 2025 Universidad Nacional analysis of distance and home education records that homeschooling is nonetheless practised in the country without legal backing or state supervision, raising child-rights concerns. Several expatriate relocation websites tell arriving families the opposite — that homeschooling is legal and regulated by the MEP through a notification-and-approval process. We do not repeat that claim, because it conflicts with the Costa Rican record, and a family who plans around it may find university admission complicated by the absence of official MEP recognition. A legislative proposal, expediente 24648, would explicitly regulate distance and home education; it is pending rather than law, and we report it as such. What does exist, and is genuinely useful, is the MEP\'s open-education machinery. Through the Dirección de Gestión y Evaluación de la Calidad, the ministry administers Educación Abierta: Educación Diversificada a Distancia for those who have completed the ninth grade of Educación General Básica, and Bachillerato por Madurez Suficiente for people over 18 with exceptions — both awarding diplomas with the same academic and legal value as the traditional bachillerato. El Maestro en Casa operates as a formal open offering and includes a route for students under 18 but over 15, with two comprehensive tests and a final test in each of Español, Ciencias, Matemática, Estudios Sociales, Idioma and Educación Cívica. We do not administer any of those examinations and are not an MEP-accredited institution; we teach Cambridge, Edexcel, IB and AP alongside whatever Costa Rican arrangement a family holds.',
    homeTuitionDetail: 'Smartious delivers to Central Valley families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Costa Rican morning. With a fixed nine-hour gap and no daylight saving on either side, a 07:00-10:00 Costa Rican block sits in our normal late-afternoon teaching hours every week of the year, with all sessions recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Costa Rica?', a: 'Costa Rican sources say the MEP does not accept it as a modality, and a 2025 Universidad Nacional analysis records that it is practised without legal backing or state supervision. Some expatriate relocation websites claim it is legal and MEP-regulated; that conflicts with the Costa Rican record and we do not repeat it. A proposal to regulate distance and home education, expediente 24648, is pending rather than law. Confirm your position with the MEP before acting.' },
      { q: 'What are Educación Abierta and El Maestro en Casa?', a: 'MEP open-education routes administered through the DGEC. Educación Abierta comprises Educación Diversificada a Distancia, for those who have completed ninth grade, and Bachillerato por Madurez Suficiente for people over 18 with exceptions — both awarding diplomas with the same academic and legal value as the traditional bachillerato. El Maestro en Casa includes a route for students under 18 but over 15. We explain them; we do not administer them.' },
      { q: 'Does Smartious hold MEP accreditation?', a: 'No, and we say so plainly. We teach Cambridge, Pearson Edexcel, IB and AP qualifications with their own international validity, alongside whatever Costa Rican arrangement your family holds.' },
      { q: 'Nine hours — how does this work?', a: 'In one direction. Classes are available across the day, including after-school, because we run two teaching teams in different time zones. A seven o\'clock class here is four in the afternoon in Nairobi, an ordinary teaching slot for us.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'heredia-cr',
    name: 'Heredia & the Free Zones',
    county: 'Heredia Province',
    region: 'The medical-device and technology manufacturing corridor · the Belén and Cariari free zones · an internationally recruited engineering workforce · several international schools clustered nearby',
    primaryKeyword: 'Online school and international curriculum in Heredia',
    heroTagline: 'For Heredia, Belén and free-zone families — Costa Rica\'s advanced manufacturing corridor, staffed internationally and priced out of its own schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Heredia and free-zone families. The Belén, Cariari and Heredia corridor carries Costa Rica\'s advanced manufacturing economy — medical devices, technology, and shared services in free zones that have drawn multinational operations and an internationally recruited engineering workforce with them. Several international schools sit in the same corridor, including the American International School at Cariari, and their fees reflect the corporate packages around them. Smartious teaches Cambridge and IB live in the Costa Rican morning, alongside a school enrolment.',
    heroImg: '/heroes/heredia-cr.jpg',
    altTexts: { hero: 'Heredia and the Central Valley free-zone corridor' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Heredia, Belén and free-zone families — medical devices and technology corridor. From USD 400/month.',
    challenges: [
      'International school fees in the corridor are set by corporate packages, not local salaries.',
      'Multinational postings arrive on production timelines rather than admission cycles.',
      'The MEP does not accept homeschooling as a modality, despite claims on some relocation sites.',
      'We teach nine hours ahead, so our classes land in the Costa Rican morning.',
      'Engineering and science subject sets are often unavailable outside the international tier.',
    ],
    familySituations: [
      'Medical-device, technology, and precision-manufacturing engineering families.',
      'Shared-services and multinational operations households.',
      'Costa Rican professional families in the corridor outside the tier\'s fees.',
      'Internationally posted staff whose assignments move on.',
      'Students aiming at engineering, biomedical, or computing programmes abroad.',
    ],
    nearbyAreas: ['Heredia', 'Belén', 'Cariari', 'San Antonio de Belén', 'Alajuela', 'Santo Domingo', 'Barva'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Computer Science',
      'Cambridge A-Level Biology, Economics, Design and Technology-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, German and Costa Rican university applications',
    ],
    whyChoose: [
      ['Engineering and biomedical depth for a device corridor', 'Cambridge A-Level Physics, Chemistry, Mathematics, and Further Mathematics — led by a founder with a BEd in Mathematics and Physics — suit a medical-device and precision-manufacturing workforce precisely.'],
      ['Portable across a multinational posting', 'Heredia now, Ireland, Singapore, or another site after — the curriculum, teachers, and examination board stay constant.'],
      ['Fees a non-package household can meet', 'Corridor school fees are set by corporate relocation budgets; ours are not.'],
      ['Morning classes that work at nine hours', 'Our block lands in the Costa Rican morning — the only direction that functions at this distance.'],
      ['The MEP position stated accurately', 'The ministry does not accept homeschooling as a modality, whatever relocation sites claim. We follow the Costa Rican sources.'],
    ],
    growingReason: 'The Belén, Cariari and Heredia corridor carries Costa Rica\'s medical-device, technology and shared-services economy in free zones that have drawn multinational operations and an internationally recruited engineering workforce — with corridor school fees set by corporate packages. Costa Rica runs CST (UTC-6), nine hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the free-zone corridor, taught in the Costa Rican morning alongside a school enrolment and portable across postings.',
      cbc: 'Kenya CBC available for corridor families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Heredia: constitutional article 78 makes preescolar, general básica and diversificada education compulsory, and Costa Rican sources are clear that the MEP does not accept homeschooling as a modality, with a 2025 Universidad Nacional analysis recording that it is practised without legal backing or state supervision. Expediente 24648, which would regulate distance and home education, is pending rather than law. The MEP\'s open-education routes — Educación Abierta through the DGEC, and El Maestro en Casa including a route for students under 18 but over 15 — are real certification mechanisms that we explain but do not administer. Smartious is not an MEP-accredited institution. For internationally posted corridor families the supplementary configuration is the natural one, and it continues unchanged to the next site anywhere in the world.',
    homeTuitionDetail: 'Smartious delivers to corridor families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Costa Rican morning on a fixed nine-hour offset, with every session recorded — built for shift patterns and multinational schedules.',
    faqs: [
      { q: 'We came with a medical-device or technology operation — does the schooling travel?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next site anywhere in the world, with examinations sat at authorised centres wherever the family is.' },
      { q: 'Our school will not run Further Mathematics — can you?', a: 'Yes, and it is a common request in this corridor. A set unviable for four pupils at one school runs routinely in a live group drawn from several countries.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'guanacaste-cr',
    name: 'Guanacaste & the North Pacific',
    county: 'Guanacaste Province',
    region: 'The Pacific tourism, retiree and digital-nomad belt · Tamarindo, Nosara, Papagayo and Sámara · a fast-growing international resident population · schooling that has not kept pace',
    primaryKeyword: 'Online school and international curriculum in Guanacaste',
    heroTagline: 'For Guanacaste families — the coast the remote-work world moved to, where most of what arrivals read about homeschooling is wrong.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Guanacaste families. The North Pacific coast — Tamarindo, Nosara, Sámara, the Papagayo peninsula — has drawn one of the fastest-growing international resident populations in Central America: tourism and hospitality businesses, second-home owners, retirees, and since the 2022 visa route a substantial digital-nomad community, many with school-age children. The schooling has not kept pace. Neither, in most cases, has the information: much of what arriving families read about home education in Costa Rica conflicts with what Costa Rican sources say.',
    heroImg: '/heroes/guanacaste-cr.jpg',
    altTexts: { hero: 'The Guanacaste Pacific coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Guanacaste, Tamarindo and Nosara families — the MEP position corrected, morning classes. From USD 400/month.',
    challenges: [
      'A fast-growing international resident population with schooling that has not kept pace.',
      'Much of the relocation advice arriving families read about homeschooling conflicts with Costa Rican sources.',
      'Families spread along a long coast rather than clustered near one campus.',
      'A tourism season that shapes the household for much of the year.',
      'We teach nine hours ahead, so our classes land in the Costa Rican morning.',
    ],
    familySituations: [
      'Tourism, hospitality, and property business families.',
      'Digital-nomad and remote-work households arriving under the 2022 visa route.',
      'Retiree and second-home families with school-age children or grandchildren.',
      'Surf, yoga, and wellness-economy businesses along the coast.',
      'Families who may return to North America or Europe.',
    ],
    nearbyAreas: ['Tamarindo', 'Nosara', 'Sámara', 'Playa Flamingo', 'Papagayo', 'Liberia', 'Santa Cruz'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Biology, Geography, Mathematics, Chemistry, Physics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Costa Rican university applications',
    ],
    whyChoose: [
      ['We correct what you have probably already read', 'Relocation sites tell arriving families homeschooling is legal and MEP-regulated in Costa Rica. Costa Rican press and a 2025 Universidad Nacional analysis say the ministry does not accept it and that it happens without legal backing or supervision. We follow the Costa Rican sources.'],
      ['A record that travels home again', 'Many Guanacaste families will return to North America or Europe. Cambridge and AP records are read directly by universities there; an informal record is not.'],
      ['Reaches the whole coast', 'Tamarindo, Nosara, Sámara and Papagayo get identical live teaching — no daily run to a single campus along a long coastline.'],
      ['Built for a season', 'Live morning classes plus unlimited recordings hold the academic year through the busiest months.'],
      ['Environmental science that fits the place', 'Guanacaste\'s coastline and dry forest make unusually good ground for Cambridge Geography and AP Environmental Science.'],
    ],
    growingReason: 'The Guanacaste North Pacific coast has drawn one of the fastest-growing international resident populations in Central America — tourism and hospitality, retirees, second-home owners and a substantial digital-nomad community since the 2022 visa route — with schooling that has not kept pace. Costa Rica runs CST (UTC-6), nine hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the North Pacific, taught in the Costa Rican morning alongside a school enrolment. Examination sittings planned per session with travel scheduled ahead.',
      cbc: 'Kenya CBC available for Guanacaste families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for the many North American families here targeting US universities.',
    },
    homeschoolDetail: 'Guanacaste deserves the fullest correction, because more families arrive here with the wrong picture than anywhere else in Costa Rica. Constitutional article 78 makes preescolar, Educación General Básica and Educación Diversificada compulsory. Costa Rican press reporting states that homeschooling as a modality is not accepted by the Ministerio de Educación Pública, and a 2025 Universidad Nacional analysis of distance and home education records that it is practised in the country without legal backing or state supervision, raising child-rights concerns. Several expatriate relocation websites tell arriving families the opposite — that it is legal and MEP-regulated with a notification-and-approval process. We do not repeat that, and a family planning around it should know that university admission can be complicated by the absence of official MEP recognition. Expediente 24648, which would regulate distance and home education explicitly, is pending rather than law. What does exist is the MEP\'s open-education machinery — Educación Abierta through the DGEC, and El Maestro en Casa with a route for students under 18 but over 15 — which we explain but do not administer. Smartious is not an MEP-accredited institution. Families resident elsewhere follow their country of residence\'s framework, a common question along this coast and one for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to Guanacaste families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Costa Rican morning on a fixed nine-hour offset, with the full recorded library carrying the season.',
    faqs: [
      { q: 'We read that homeschooling is legal and regulated in Costa Rica — is it?', a: 'That claim appears on several expatriate relocation sites and conflicts with Costa Rican sources. Press reporting says the modality is not accepted by the MEP, and a 2025 Universidad Nacional analysis records that it happens without legal backing or state supervision. A bill to regulate it, expediente 24648, is pending rather than law. Confirm with the MEP before acting.' },
      { q: 'We may return to the US, Canada or Europe — does that affect the choice?', a: 'It affects the qualification. Cambridge and AP records are read directly by universities there; an informal or unrecognised record is not, and university admission can be complicated by the absence of MEP recognition.' },
      { q: 'Our family works the tourism season — can schooling fit?', a: 'It is built for it: live morning classes with a complete recorded library, so the academic year holds through the busiest months.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'limon-cr',
    name: 'Limón & the Caribbean',
    county: 'Limón Province',
    region: 'The Caribbean port and container terminal handling most of the country\'s trade · the banana and pineapple export economy · Puerto Viejo and the southern Caribbean coast · almost no international schooling',
    primaryKeyword: 'Online school and international curriculum in Limón',
    heroTagline: 'For Limón and Caribbean families — the port that moves Costa Rica\'s exports, three hours from the schools that serve them.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Limón and Caribbean families. The province handles the container terminal through which most of Costa Rica\'s trade passes, alongside the banana and pineapple export economy that feeds European and North American supermarkets, and the tourism belt running south through Cahuita and Puerto Viejo with its own international resident community. The Central Valley\'s international schools are three hours west over the mountains. Smartious teaches Cambridge and IB live to the Caribbean side in the Costa Rican morning.',
    heroImg: '/heroes/limon-cr.jpg',
    altTexts: { hero: 'Limón and the Costa Rican Caribbean coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Limón and Caribbean families — the country\'s main port, no local international provision. From USD 400/month.',
    challenges: [
      'Almost no international schooling on the Caribbean side, with the Central Valley three hours west.',
      'A port and export economy trading globally with schooling built for a provincial city.',
      'The MEP does not accept homeschooling as a modality, despite claims on some relocation sites.',
      'We teach nine hours ahead, so our classes land in the Costa Rican morning.',
      'Families spread from the port south to Puerto Viejo rather than clustered anywhere.',
    ],
    familySituations: [
      'Port, container terminal, and logistics families.',
      'Banana, pineapple, and agro-export business households.',
      'Tourism and hospitality families along the southern Caribbean coast.',
      'International residents settled around Cahuita and Puerto Viejo.',
      'Families weighing relocation to the Central Valley for schooling.',
    ],
    nearbyAreas: ['Limón', 'Moín', 'Cahuita', 'Puerto Viejo', 'Guápiles', 'Siquirres', 'Manzanillo'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Biology, Geography, Mathematics, Economics, Business',
      'Cambridge A-Level Chemistry, Physics, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Costa Rican university applications',
    ],
    whyChoose: [
      ['The complete option on a coast with none', 'Identical live delivery in Limón and the Central Valley — no relocation over the mountains.'],
      ['Business and economics for a port province', 'Cambridge A-Level Economics, Business, and Mathematics suit the families who move Costa Rica\'s trade.'],
      ['Biology and environmental science that fit the Caribbean', 'Rainforest, reef, and plantation agriculture make serious ground for Cambridge Biology and Geography.'],
      ['Reaches the southern coast', 'Cahuita and Puerto Viejo get identical live teaching, without a three-hour commute.'],
      ['The MEP position stated accurately', 'The ministry does not accept homeschooling as a modality; we follow the Costa Rican sources rather than relocation marketing.'],
    ],
    growingReason: 'Limón handles the container terminal through which most of Costa Rica\'s trade passes, alongside the banana and pineapple export economy and the southern Caribbean tourism belt with its own international community — with almost no international schooling and the Central Valley three hours west. Costa Rica runs CST (UTC-6), nine hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Caribbean side, taught in the Costa Rican morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for Caribbean families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Limón: constitutional article 78 makes preescolar, general básica and diversificada education compulsory, Costa Rican sources are clear that the MEP does not accept homeschooling as a modality, and a 2025 Universidad Nacional analysis records that it is practised without legal backing or state supervision. Expediente 24648 is pending rather than law. The MEP\'s open-education routes — Educación Abierta and El Maestro en Casa, including a route for students under 18 but over 15 — are real certification mechanisms we explain but do not administer. Smartious is not an MEP-accredited institution and teaches Cambridge, Edexcel, IB and AP alongside whatever Costa Rican arrangement a family holds.',
    homeTuitionDetail: 'Smartious delivers to Caribbean families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Costa Rican morning on a fixed nine-hour offset, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Limón?', a: 'Almost none — the tier is in the Central Valley, three hours west over the mountains. Live delivery reaches the whole Caribbean side identically.' },
      { q: 'We live down at Puerto Viejo — does that work?', a: 'Identically. The southern coast gets the same live teaching, with examination travel a few times a year.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'quepos-cr',
    name: 'Quepos, Manuel Antonio & the Central Pacific',
    county: 'Puntarenas Province',
    region: 'The Central Pacific tourism corridor · Manuel Antonio and Dominical · sport fishing, marina and hospitality businesses · a settled international resident community with no local schooling',
    primaryKeyword: 'Online school and international curriculum in Quepos and Manuel Antonio',
    heroTagline: 'For Quepos, Manuel Antonio and Central Pacific families — an international community on a coast the school map never reached.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Central Pacific families. The corridor around Quepos, Manuel Antonio, and south through Dominical and Uvita runs on tourism, sport fishing, marina and hospitality businesses, much of it owned or managed by families from North America and Europe who settled rather than visited. The national park draws visitors from everywhere; the schooling stayed provincial. San José is three hours inland. Smartious teaches live to the coast in the Costa Rican morning, with a rhythm built for a season.',
    heroImg: '/heroes/quepos-cr.jpg',
    altTexts: { hero: 'Manuel Antonio and the Central Pacific coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Quepos, Manuel Antonio and Central Pacific families — settled expat community, no local provision. From USD 400/month.',
    challenges: [
      'A settled international resident community with no international schooling on the corridor.',
      'San José is three hours inland — a relocation rather than a commute.',
      'A tourism season that shapes the household for much of the year.',
      'The MEP does not accept homeschooling as a modality, despite claims on some relocation sites.',
      'We teach nine hours ahead, so our classes land in the Costa Rican morning.',
    ],
    familySituations: [
      'Hotel, lodge, and hospitality business families.',
      'Sport fishing, marina, and tour-operator households.',
      'International residents settled along the corridor.',
      'Remote-work families drawn to the Central Pacific.',
      'Families who may return to North America or Europe.',
    ],
    nearbyAreas: ['Quepos', 'Manuel Antonio', 'Dominical', 'Uvita', 'Jacó', 'Parrita', 'Pérez Zeledón'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Biology, Geography, Mathematics, Chemistry',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Costa Rican university applications',
    ],
    whyChoose: [
      ['The only realistic option on the corridor', 'Identical live delivery from Jacó to Uvita — no three-hour run inland.'],
      ['Biology and environmental science that fit a national park', 'Manuel Antonio and the Pacific coast make unusually good context for Cambridge Biology and Geography and AP Environmental Science.'],
      ['Built for a season', 'Live morning classes plus unlimited recordings hold the academic year through the busiest months.'],
      ['A record that travels home again', 'Many corridor families will return to North America or Europe, where Cambridge and AP records are read directly.'],
      ['The MEP position stated accurately', 'The ministry does not accept homeschooling as a modality; we follow the Costa Rican sources.'],
    ],
    growingReason: 'The Central Pacific corridor around Quepos, Manuel Antonio and south to Uvita runs on tourism, sport fishing, marina and hospitality businesses, much of it owned by settled North American and European families — with no international schooling and San José three hours inland. Costa Rica runs CST (UTC-6), nine hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Central Pacific, taught in the Costa Rican morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for Central Pacific families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies on the Central Pacific: constitutional article 78 makes preescolar, general básica and diversificada education compulsory, Costa Rican sources say the MEP does not accept homeschooling as a modality, and a 2025 Universidad Nacional analysis records that it is practised without legal backing or state supervision. Several relocation websites claim otherwise and we do not repeat them. Expediente 24648 is pending rather than law. The MEP\'s open-education routes — Educación Abierta and El Maestro en Casa, including the route for students under 18 but over 15 — are genuine certification mechanisms we explain but do not administer. Smartious is not an MEP-accredited institution. Families resident elsewhere follow their country of residence\'s framework, a question for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to Central Pacific families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Costa Rican morning on a fixed nine-hour offset, with the full recorded library carrying the season.',
    faqs: [
      { q: 'Is there any international schooling on the Central Pacific?', a: 'None — San José is three hours inland. Live delivery reaches the whole corridor identically, with examination travel a few times a year.' },
      { q: 'Our family runs a lodge or fishing business — can schooling fit the season?', a: 'It is built for it: live morning classes with a complete recorded library, so the academic year holds through the busiest months.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const COSTA_RICA_COUNTRY = {
  slug: 'costa-rica',
  name: 'Costa Rica',
  longName: 'Republic of Costa Rica',
  adjective: 'Costa Rican',
  flag: '🇨🇷',
  hub: '/online-school/costa-rica',
  hubPageId: 'homeschooling-costa-rica',
  cityPageId: 'costa-rica-city',

  currency: 'CRC',
  currencyName: 'Costa Rican Colón',
  currencyPeg: 'Fees are invoiced in USD, which is widely used in Costa Rica for larger commitments; colón equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'CST',
    name: 'Central Standard Time (UTC-6), no daylight saving',
    utcOffset: '-6',
    offsetFromEAT: '-9 hours — our teaching lands in the Costa Rican morning, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Costa Rica has established Cambridge provision through its international school sector'],
  examCentreTiles: [
    { city: 'San José and the Central Valley', centre: 'Authorised provision', area: 'The country\'s external-candidate capacity, confirmed per family per session.' },
    { city: 'Guanacaste and the Pacific', centre: 'Planned per session', area: 'Coastal families plan travel into each window ahead.' },
    { city: 'Limón and the Caribbean', centre: 'Planned per session', area: 'Caribbean-side families plan the drive over the mountains well in advance.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Costa Rica-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — the Central Valley is checked first, and coastal families plan travel into each series ahead. Costa Rica has a second and entirely separate certification system that we do not administer and that should not be confused with ours: the MEP, through the Dirección de Gestión y Evaluación de la Calidad, runs Educación Abierta, comprising Educación Diversificada a Distancia for those who have completed ninth grade and Bachillerato por Madurez Suficiente for people over 18 with exceptions — both awarding diplomas with the same academic and legal value as the traditional bachillerato. El Maestro en Casa operates as a formal open offering including a route for students under 18 but over 15. Those are MEP examinations administered by the MEP. What we plan is the Cambridge or IB calendar around whichever Costa Rican arrangement a family holds.',
  secondaryProgrammeExamRef: 'Authorised Costa Rican Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/costa-rica.jpg',
  heroEyebrow: 'Online school for Costa Rica',
  heroH1Suffix: 'Costa Rica',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for expatriate, free-zone, tourism, and Costa Rican families across San José, Heredia, Guanacaste, Limón, and the Central Pacific. Costa Rica is one of the most misreported legal positions in the region — the MEP does not accept homeschooling as a modality, whatever relocation websites tell arriving families — and we set that out before anything else.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — morning teaching, alongside your school.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Costa Rica',

  citiesSectionTitle: 'Where our Costa Rica families are',
  citiesSectionBody: 'Smartious Costa Rica families concentrate across San José and the Central Valley (the Escazú and Santa Ana corporate belt and the strongest international tier in Central America outside Panama City), Heredia and the free zones (medical devices, technology and shared services with an internationally recruited engineering workforce), Guanacaste and the North Pacific (one of the fastest-growing international resident populations in Central America, and the region where arriving families are most often misinformed), Limón and the Caribbean (the container terminal handling most national trade, three hours from the Valley), and Quepos, Manuel Antonio and the Central Pacific (a settled international community on a coast the school map never reached). One misreported legal position corrected, one real MEP certification system explained, and a morning teaching window.',

  trustSignals: [
    { h: 'We correct what relocation sites tell you', p: 'Several expatriate websites state that homeschooling is legal in Costa Rica and regulated by the MEP. Costa Rican press reporting says the modality is not accepted by the ministry, and a 2025 Universidad Nacional analysis records that it is practised without legal backing or state supervision. We follow the Costa Rican sources.' },
    { h: 'The real MEP routes explained', p: 'Educación Abierta — Educación Diversificada a Distancia and Bachillerato por Madurez Suficiente — awards diplomas with the same academic and legal value as the traditional bachillerato, and El Maestro en Casa includes a route for students under 18 but over 15. Most families do not know that exists. We explain it; we do not administer it.' },
    { h: 'Timetabling, and why we run two teaching teams', p: 'We run two teaching teams in different time zones, so live classes are available across the full day rather than inside one window. Classes are available across the day, including after-school, because we run two teaching teams in different time zones. We lead with that rather than bury it.' },
    { h: 'The pending bill reported as pending', p: 'Expediente 24648 would explicitly regulate distance and home education in Costa Rica. It has not been enacted, and we report it as a proposal rather than as law.' },
  ],

  universitiesInCountry: 'the Universidad de Costa Rica, the Tecnológico de Costa Rica, the Universidad Nacional, the Universidad Estatal a Distancia, and a substantial private sector including Universidad Latina and ULACIT — with Costa Rica also hosting international institutions including the UN-mandated University for Peace.',
  universityChannels: 'Costa Rican universities admit through their own entrance examinations on the basis of the bachillerato, and foreign qualifications go through recognition procedures with requirements confirmed per institution. One risk deserves naming directly: university admission can be complicated by the absence of official MEP recognition where a student has been educated outside the accepted system, which is precisely why the MEP\'s own open-education routes matter and why an internationally examined record matters alongside them. Outward, Costa Rican and expatriate students here are heavily oriented toward the United States and Canada, with Spain following, and all of them read Cambridge A-Levels, the IB Diploma, and AP records directly. UCAS reads A-Levels natively, and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across US, Canadian, Spanish, UK (UCAS), and Costa Rican destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Costa Rica families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes in the Costa Rican morning on a fixed nine-hour offset with no seasonal drift, run alongside a Costa Rican school enrolment or whatever MEP arrangement a family holds. Cambridge Spanish available beside the English-medium core. Examinations at authorised provision confirmed per session; MEP certification, where a family pursues it, runs separately through the ministry.',
  britishCurriculumSuits: 'Costa Rica families targeting the Cambridge pathway. Best fit for: (1) Guanacaste, Central Pacific and Caribbean families with no local international provision, (2) free-zone engineering households in the Heredia corridor, (3) Central Valley families outside the international tier\'s fees, (4) expatriate and digital-nomad families who may return to North America or Europe, (5) students over 15 combining an international track with MEP open-education certification.',
  britishCurriculumDelivery: 'Live online classes in the Costa Rican morning, small groups 4-6 students, every session recorded, alongside a Costa Rican school or MEP arrangement.',
  ibDiplomaSuits: 'Costa Rica families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Costa Rica families targeting US universities via Common Application — the dominant overseas destination for the country\'s large North American community.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Costa Rica is the market where we most often have to correct something a family has already read — and where the state\'s own open-education system turns out to be more useful than the marketing that surrounds it.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the free-zone corridor\'s medical-device and engineering households and every medicine-bound student in the Central Valley. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Costa Rica has a strong international tier concentrated in the Central Valley — Country Day School, Lincoln School, the American International School at Cariari, the British School, Marian Baker, the European School — with fees at the top of the Central American market. Outside the Valley the picture collapses: Guanacaste has one of the fastest-growing international populations in the region and almost no matching provision, and Limón and the Central Pacific have none. There is also an unusual competitive feature here: the MEP\'s own open-education system, which is not a competitor to us so much as a parallel certification route families should understand.',
  competitors: [
    { name: 'Country Day School, Lincoln School, American International School', city: 'Central Valley', curriculum: 'American, IB and international',  feesUsd: 'Top of the Central American market',                feesAed: 'Premium tier',            rating: 4.7, capacityNote: 'Long-established and strong — the national benchmark' },
    { name: 'British School, Marian Baker, European School',   city: 'Central Valley',        curriculum: 'British, IB and bilingual',             feesUsd: 'Premium tier',                                      feesAed: 'Competitive places',      rating: 4.5, capacityNote: 'The closest local comparison to our track — Valley-bound' },
    { name: 'MEP Educación Abierta and El Maestro en Casa',    city: 'Nationwide',            curriculum: 'Costa Rican national certification',    feesUsd: 'State-administered',                                feesAed: '—',                       rating: 4.0, capacityNote: 'Not a competitor — a parallel state certification route, including a path for students over 15. We explain it and do not administer it' },
    { name: 'Guanacaste and the Pacific',                      city: 'Coastal Costa Rica',    curriculum: 'Little to none',                        feesUsd: 'No real international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'One of Central America\'s fastest-growing international populations, with almost no matching schooling' },
    { name: 'Limón and the Central Pacific',                   city: 'The coasts',            curriculum: '—',                                     feesUsd: 'No international provision',                        feesAed: '—',                       rating: 0,   capacityNote: 'The main port and a settled expatriate corridor, both three hours from the Valley' },
    { name: 'US-based online schools',                         city: 'Online',                curriculum: 'American online',                       feesUsd: 'Varies, often per-course',                          feesAed: 'Varies',                  rating: 4.3, capacityNote: 'Much closer to Costa Rica on the clock and familiar to the large North American community — families should weigh that honestly against price and class size' },
    { name: 'Smartious Homeschool (Costa Rica via online delivery)', city: 'Delivered to all Costa Rica', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'CRC equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + the MEP position corrected + the state open-education routes explained + the coasts reached + honest that we are nine hours away' },
  ],

  legalFrameworkIntro: 'Costa Rica is the country where we most often have to correct something a family has already read, and where the state\'s own certification machinery turns out to be more useful than the advice circulating around it. Here is the position from Costa Rican sources.',
  legalFramework: [
    { h: 'What is compulsory', p: 'Article 78 of the Costa Rican Constitution makes preescolar education, Educación General Básica and Educación Diversificada compulsory, and free in the public system where the State bears the cost. The Ley Fundamental de Educación No. 2160 of 1957 is the governing statute, and the Ministerio de Educación Pública administers the system. Costa Rica devotes an unusually high share of national output to education and its literacy rate is among the highest in the Americas — this is a country that takes its school system seriously, and that context matters for what follows.' },
    { h: 'What Costa Rican sources say about home education', p: 'Costa Rican press reporting states plainly that home education as a modality is not accepted by the Ministerio de Educación Pública. A 2025 Universidad Nacional analysis of distance and home education goes further and is worth reading carefully: it records that homeschooling is already practised in Costa Rica but without legal backing or state supervision, notes that MEP initiatives such as El Maestro en Casa and the pandemic-era Aprendo en Casa showed significant limitations in academic outcomes, and raises concerns about guaranteeing the rights of minors in an unsupervised arrangement. That is the domestic record, and it is not ambiguous in the way Colombia\'s is.' },
    { h: 'What some relocation websites say, and why we do not repeat it', p: 'Several expatriate relocation sites tell arriving families that homeschooling is legal in Costa Rica and regulated by the MEP through a notification-and-approval process, with curriculum requirements and periodic evaluations. That description conflicts with the Costa Rican sources above, and we are not going to repeat it because a family who plans a school year around it is exposed. If you have read that and are relying on it, take it to the MEP directly and get the answer in a form you can keep. We would rather be the provider that contradicted a convenient claim than the one that echoed it.' },
    { h: 'The pending bill', p: 'A legislative proposal, expediente 24648, would explicitly regulate distance and home education in Costa Rica. An earlier bill contemplated an "Escuela en el Hogar" with annual registration in a register created for the purpose, with parents responsible for registering minors and registered students barred from concurrent enrolment at any official institution. Neither has been enacted. We report this as pending because families planning a school year need the law as it is, not as it may become — though it is worth knowing the direction of travel.' },
    { h: 'The state machinery that does exist, and is genuinely useful', p: 'This is the part most families miss. The MEP, through the Dirección de Gestión y Evaluación de la Calidad, administers Educación Abierta, which comprises Educación Diversificada a Distancia — directed at youth and adults who have completed the ninth grade of Educación General Básica — and Bachillerato por Madurez Suficiente, directed at people over 18, with exceptions, who did not complete their studies in the traditional system. Both award diplomas with the same academic and legal value as the traditional bachillerato, which is the single most important sentence for a Costa Rican family outside the ordinary route. Separately, El Maestro en Casa operates as a formal open educational offering and includes a path for students under 18 but over 15, with two comprehensive tests and a final test in each of Español, Ciencias, Matemática, Estudios Sociales, Idioma and Educación Cívica, the comprehensives passed at a minimum of seventy and weighted at forty per cent against a final worth sixty, leading to the Bachiller en Educación Media. We do not administer any of it and are not an MEP-accredited institution; we explain it because families deserve to know the state route exists.' },
    { h: 'The admissions risk, and the timezone', p: 'Two closing practicalities. First, university admission can be complicated by the absence of official MEP recognition where a student has been educated outside the accepted system — which is exactly why the open-education routes above matter, and why an internationally examined Cambridge or IB record alongside them is worth holding. Second, the clock: Costa Rica runs CST at UTC-6 with no daylight saving while we teach from UTC+3, a fixed nine-hour gap tied with Mexico as the widest in our coverage. Our classes land in the Costa Rican morning — a seven o\'clock class here is four in the afternoon for our teachers — and Both after-school and morning blocks are available, since we run two teaching teams in different time zones. Families whose child is in a full-day school should talk to us before enrolling so we can be realistic about which subjects and days work.' },
  ],

  whySmartious: [
    { h: 'We contradict the convenient claim',                             p: 'Relocation sites say homeschooling is MEP-regulated here. Costa Rican press and a 2025 Universidad Nacional analysis say otherwise. We follow the Costa Rican sources even though the other version would sell better.' },
    { h: 'The state routes explained, including the under-18 one',         p: 'Educación Abierta awards diplomas with the same legal value as the traditional bachillerato, and El Maestro en Casa has a path for students over 15. Most families have never heard of it.' },
    { h: 'Honest about the nine-hour gap',                                 p: 'Tied with Mexico as our widest. Morning classes only, stated on the first page rather than the third.' },
    { h: 'The coasts and the corridor reached',                            p: 'Guanacaste, Limón and the Central Pacific hold a large share of Costa Rica\'s international residents and almost none of its international schooling.' },
    { h: 'The admissions risk named',                                      p: 'University admission can be complicated by the absence of MEP recognition. That is a reason to plan carefully, and we say so rather than leaving it out.' },
    { h: 'Honest that US providers are closer on the clock',               p: 'For a country this North-American-oriented, a US online school is nearer in time zone. Families should weigh that against price and class size.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Costa Rica?', a: 'Costa Rican sources say the modality is not accepted by the Ministerio de Educación Pública, and a 2025 Universidad Nacional analysis records that it is practised without legal backing or state supervision, raising child-rights concerns. Several expatriate relocation websites claim the opposite — that it is legal and MEP-regulated — and we do not repeat that because it conflicts with the domestic record. A bill to regulate distance and home education, expediente 24648, is pending rather than law. Confirm your position with the MEP directly.' },
    { q: 'I read on a relocation site that the MEP approves homeschooling plans. Is that right?', a: 'It conflicts with Costa Rican press reporting and academic analysis, and we would not plan around it. Take the question to the MEP and get the answer in writing. We would rather contradict a convenient claim than echo it.' },
    { q: 'What is Educación Abierta?', a: 'A MEP open-education system run through the Dirección de Gestión y Evaluación de la Calidad, comprising Educación Diversificada a Distancia for those who have completed ninth grade and Bachillerato por Madurez Suficiente for people over 18 with exceptions. Both award diplomas with the same academic and legal value as the traditional bachillerato.' },
    { q: 'Is there a route for a student under 18?', a: 'El Maestro en Casa includes a path for students under 18 but over 15, with two comprehensive tests and a final test in each of Español, Ciencias, Matemática, Estudios Sociales, Idioma and Educación Cívica, leading to the Bachiller en Educación Media. We explain it; we do not administer it.' },
    { q: 'Does Smartious hold MEP accreditation?', a: 'No, and we say so plainly. We teach Cambridge, Pearson Edexcel, IB and AP qualifications with their own international validity, alongside whatever Costa Rican arrangement your family holds.' },
    { q: 'Will university admission be affected?', a: 'It can be. Admission may be complicated by the absence of official MEP recognition where a student was educated outside the accepted system — which is why the state\'s open-education routes matter and why an internationally examined record alongside them is worth holding.' },
    { q: 'Nine hours behind — how does the timetable work?', a: 'Classes are available across the day, including after-school, because we run two teaching teams in different time zones. A seven o\'clock Costa Rican class is four in the afternoon for our teachers. Families whose child is in a full-day school should talk to us before enrolling.' },
    { q: 'Which parts of Costa Rica does Smartious cover?', a: 'San José and the Central Valley, Heredia and the free zones, Guanacaste and the North Pacific, Limón and the Caribbean, and Quepos, Manuel Antonio and the Central Pacific have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us what you have already been told about homeschooling in Costa Rica: in this market that is often the most important thing to correct before anything else is planned.',
}
