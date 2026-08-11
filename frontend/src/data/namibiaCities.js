// ═══════════════════════════════════════════════════════════════════
// NAMIBIA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for mining, marine, expat, and Namibian families
// across Windhoek, Walvis Bay and the coast, and the northern regions.
// AFRICA BUILD — 3 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
// Do NOT paste guessed stock-photo IDs.
//
// LEGAL POSITIONING NOTE — NAMIBIA IS THE STRONGEST HOME-EDUCATION
// PROVISION IN OUR AFRICAN COVERAGE. GET THIS RIGHT:
// - Governing statute: the BASIC EDUCATION ACT 3 OF 2020 (GG 7257),
//   which replaced the Education Act of 2001, with the BASIC
//   EDUCATION REGULATIONS 2023 (Government Notice 331 of 2023)
//   made under section 125.
// - COMPULSORY ATTENDANCE, section 9(1): it is compulsory for a
//   learner to attend school during school hours from the first
//   school day of the academic year in which he or she reaches the
//   age of SIX YEARS, until the last school day of the year in which
//   the learner attains the upper age set by that section. HEDGE THE
//   UPPER AGE — cite it as "the upper age set by section 9(1)" and
//   tell families to confirm the current figure, rather than
//   asserting a number we have not verified against the text.
// - EXEMPTION POWER: the Act allows a learner to be exempted
//   "entirely, partially or conditionally from compulsory school
//   attendance if it is in the best interests of the learner". The
//   regulations also contemplate a regional director approving, in
//   writing on a request from the parent, that a child was unable to
//   attend. State factually; not a marketing route.
// - THE DISTINCTIVE PART — HOME SCHOOLING IS DEFINED IN THE ACT:
//   the Act defines "home schooling" as educational instruction in
//   which parents and care-givers, or other privately appointed
//   tutors or service providers, teach a learner A LEGALLY APPROVED
//   ACADEMIC CURRICULUM at home instead of at a public or private
//   school. Two things follow and BOTH must always appear:
//   (1) REGISTRATION IS REQUIRED — parents are required to register
//       a child for home schooling. Commentary notes the Act does
//       not attach fines for failing to register or failing to
//       ensure attendance, but the requirements stand regardless;
//       do NOT present the absence of a penalty as permission.
//   (2) "A LEGALLY APPROVED ACADEMIC CURRICULUM" IS THE HINGE. Do
//       NOT claim that a Cambridge or IB programme automatically
//       satisfies it. Whether a given international curriculum is
//       legally approved for this purpose is confirmed with the
//       Ministry of Education and the regional director — never
//       asserted by us.
// - CONSEQUENCE: Namibia genuinely has a named, registration-based
//   parental home-education route, which is rare in Africa and worth
//   stating. But our clean default remains SUPPLEMENTARY beside a
//   school enrolment, because that needs no registration and no
//   curriculum-approval question, and because we cannot warrant that
//   our programme is "legally approved" for the home-schooling route.
// MARKET NOTE: Namibia's national senior certificate (the NSSC) has
// deep Cambridge lineage, so international qualifications are
// familiar here rather than exotic — say so without overclaiming
// current arrangements. Economy: uranium (Rössing, Husab) and
// diamonds (including marine mining off the coast), the Walvis Bay
// port and its logistics corridor into Zambia, Botswana and the DRC,
// fishing, tourism at Swakopmund and Sossusvlei, and a strong German
// heritage and language community. Windhoek holds the international
// tier — including a well-established German-language school and IB
// provision — and the north, where the largest share of Namibians
// live, has essentially none.
// TIMEZONE: CAT (UTC+2) year-round — Namibia abolished seasonal time
// changes in 2017 — exactly ONE HOUR behind Nairobi EAT, alongside
// Zambia, Zimbabwe and Botswana.
// ═══════════════════════════════════════════════════════════════════

export const NAMIBIA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'windhoek-na',
    name: 'Windhoek',
    county: 'Khomas Region',
    region: 'Capital · government, financial services and the mining sector\'s commercial centre · a substantial German-heritage community · the country\'s international-school tier including IB provision',
    primaryKeyword: 'Online school and homeschool in Windhoek',
    heroTagline: 'For Windhoek families — Cambridge taught live from Nairobi, one hour ahead, in the African country with the clearest home-education statute we have found.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Windhoek families. Windhoek holds Namibia\'s government, its financial and mining-sector commercial centre, a diplomatic and development community, and a long-established German-heritage population that has shaped the city\'s schools as much as its architecture. It also holds the country\'s international-school tier, including IB provision and German-language schooling, priced at the top of the local market. Namibia is unusual in our African coverage for another reason: the Basic Education Act 3 of 2020 actually defines home schooling and requires it to be registered — a named statutory route rather than a grey area. We set out exactly what that does and does not settle.',
    heroImg: '/heroes/windhoek-na.jpg',
    altTexts: { hero: 'Windhoek city centre' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Windhoek families — Namibia\'s registered home-schooling route explained, supplementary default. From USD 400/month.',
    challenges: [
      'International school fees in Windhoek sit at the top of the local market, beyond many professional Namibian families.',
      'Compulsory school attendance runs under section 9 of the Basic Education Act 3 of 2020 from the year a learner turns six.',
      'Namibia\'s home-schooling route requires registration and a legally approved academic curriculum — the second part is not automatic for an international programme.',
      'Mining, diplomatic, and development postings arrive and depart on contract timelines.',
      'Time zone: Namibia runs CAT (UTC+2) year-round with no seasonal change since 2017 — exactly one hour behind Nairobi EAT.',
    ],
    familySituations: [
      'Government, financial services, and mining-sector commercial families.',
      'Diplomatic, development, and international-organisation families on rotation.',
      'German-heritage and German-speaking families wanting an English-medium international track alongside.',
      'Namibian professional families outside the international tier\'s fees.',
      'Families registered for home schooling who want an examined academic spine behind it.',
      'Students preparing for South African, Namibian, German, or UK universities.',
    ],
    nearbyAreas: ['Windhoek centre', 'Klein Windhoek', 'Olympia', 'Pioneers Park', 'Katutura', 'Okahandja', 'Rehoboth'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Afrikaans and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Namibian, South African and German university applications',
    ],
    whyChoose: [
      ['The statute explained precisely, including its limits', 'Namibia defines home schooling in the Basic Education Act and requires registration and a legally approved academic curriculum. We explain both halves — and we do not claim our programme automatically satisfies the second.'],
      ['German alongside the English-medium core', 'In a city with a long German-heritage community and strong ties to Germany, Cambridge German sits naturally beside the academic track.'],
      ['The tier\'s curriculum at a professional family\'s budget', 'Live small-group teaching at USD 2,160-6,480 a year against Windhoek international fees at the top of the local market.'],
      ['One hour from your teachers, all year', 'Namibia has run CAT year-round since 2017 and Kenya observes no daylight saving either, so classes land in the ordinary school day every week of the year.'],
      ['An African school teaching African families', 'Nairobi-built and Nairobi-taught, serving families in 51 countries — not an overseas provider reaching in.'],
    ],
    growingReason: 'Windhoek holds Namibia\'s government, financial and mining commercial centre, a diplomatic community, and a long-established German-heritage population, alongside the country\'s international-school tier — in a system whose Basic Education Act 3 of 2020 defines and requires registration of home schooling. Namibia runs CAT (UTC+2) year-round, exactly one hour behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Windhoek families, run supplementary alongside a school enrolment or as the academic spine behind a registered home-schooling arrangement. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Windhoek families with East African ties.',
      ib: 'IB Diploma Programme — supplements and support alongside the capital\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Namibia has the clearest statutory home-education provision we have found anywhere in our African coverage, and it comes with a condition families should understand before anything else. Under the Basic Education Act 3 of 2020, school attendance is compulsory from the first school day of the academic year in which a learner reaches the age of six, until the last school day of the year in which the learner reaches the upper age set by section 9(1) — a figure worth confirming against the current text rather than taking from a provider. The Act also allows a learner to be exempted entirely, partially, or conditionally from compulsory attendance where that is in the learner\'s best interests. What makes Namibia distinctive is that the Act actually defines home schooling: educational instruction in which parents and care-givers, or other privately appointed tutors or service providers, teach a learner a legally approved academic curriculum at home instead of at a public or private school. Registration for home schooling is required. Commentary has noted that the Act does not attach fines for failing to register or failing to ensure attendance, and we mention that only to say plainly that an absent penalty is not permission — the requirements stand. The phrase that matters most for a family choosing an international programme is "a legally approved academic curriculum", and we will not tell you that Cambridge or the IB automatically satisfies it. That question belongs with the Ministry of Education and your regional director. Which is why our clean default here is supplementary: alongside a school enrolment, no registration and no curriculum-approval question arises at all, and the academic outcome is the same.',
    homeTuitionDetail: 'Smartious delivers to Windhoek families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. With Namibia on CAT year-round and Kenya an hour ahead, classes land in the ordinary school day and afternoon every week of the year, with every session recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Namibia?', a: 'Namibia is unusual in Africa for defining it in statute. The Basic Education Act 3 of 2020 defines home schooling as instruction in which parents, care-givers, or privately appointed tutors or service providers teach a learner a legally approved academic curriculum at home instead of at a school — and registration for home schooling is required. School attendance is otherwise compulsory from the year a learner turns six under section 9.' },
      { q: 'Does a Cambridge programme count as a "legally approved academic curriculum"?', a: 'We will not claim that it automatically does. That phrase is the hinge of the whole provision, and whether a particular international curriculum satisfies it for home-schooling purposes is a question for the Ministry of Education and your regional director. Our clean default is supplementary alongside a school enrolment, where the question does not arise.' },
      { q: 'The Act has no fines for failing to register — does that matter?', a: 'Not in the way it might sound. Commentary has noted the absence of penalties, but the registration and attendance requirements stand regardless, and we would not advise any family to treat a missing penalty as permission.' },
      { q: 'What are the class times like?', a: 'Namibia has run CAT year-round since abolishing seasonal time changes in 2017, and Kenya observes no daylight saving either — so our teaching hours fall inside the ordinary Namibian school day and afternoon every week of the year.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'walvis-bay-na',
    name: 'Walvis Bay & the Coast',
    county: 'Erongo Region',
    region: 'The national port and logistics corridor · fishing and marine industry · Swakopmund\'s tourism and German heritage · the uranium mines at Rössing and Husab inland · thin international schooling',
    primaryKeyword: 'Online school and homeschool in Walvis Bay and Swakopmund',
    heroTagline: 'For Walvis Bay, Swakopmund and Erongo families — a port serving four countries, uranium mines inland, and almost no international schooling.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for coastal Namibian families. The Erongo coast carries an outsized share of the national economy: Walvis Bay is Namibia\'s principal port and the head of a logistics corridor running inland to Botswana, Zambia, and the DRC, with a substantial fishing and marine-industry sector alongside it; Swakopmund runs tourism and a strong German-heritage community; and the uranium operations at Rössing and Husab sit in the desert behind them, employing an internationally recruited technical workforce. International schooling on the coast is thin, and Windhoek is around four hours inland. Smartious delivers the Cambridge and IB pathways live along the coast, one hour ahead of you all year.',
    heroImg: '/heroes/walvis-bay-na.jpg',
    altTexts: { hero: 'The Namibian coast at Walvis Bay' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Walvis Bay, Swakopmund and Erongo families — port, uranium and marine industry, thin international schooling. From USD 400/month.',
    challenges: [
      'Thin international schooling on a coast carrying the port, the uranium mines, and the fishing industry.',
      'Windhoek\'s tier is around four hours inland, so boarding has been the traditional answer.',
      'Mining and maritime rotations move families between sites, countries, and continents.',
      'Compulsory school attendance runs under section 9 of the Basic Education Act 3 of 2020.',
      'Time zone: the coast runs CAT (UTC+2) year-round — exactly one hour behind Nairobi EAT.',
    ],
    familySituations: [
      'Uranium mining engineering, geology, and management families at Rössing and Husab.',
      'Port, logistics, and freight-corridor families at Walvis Bay.',
      'Fishing and marine-industry families, including officers working at sea.',
      'Swakopmund tourism, hospitality, and German-heritage families.',
      'Students aiming at engineering, geoscience, or marine programmes abroad.',
    ],
    nearbyAreas: ['Walvis Bay', 'Swakopmund', 'Henties Bay', 'Arandis', 'Rössing and Husab', 'Usakos', 'the Namib coast'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Afrikaans and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Geography',
      'Cambridge A-Level Biology, Economics, Business',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including geoscience and marine programmes), Common Application (US), and Namibian, South African and German university applications',
    ],
    whyChoose: [
      ['Physics, chemistry and geology taught properly', 'Cambridge A-Level Physics, Chemistry, Mathematics, and Geography — led by a founder with a BEd in Mathematics and Physics — suit a uranium and marine-industry coast precisely.'],
      ['The alternative to boarding inland', 'Erongo families have sent children to Windhoek or South Africa for the senior years. Identical live teaching reaches the coast instead.'],
      ['Built for rotations and sea time', 'Live classes plus unlimited recordings hold the academic pace through mining rosters and time at sea.'],
      ['German alongside the academic core', 'Swakopmund\'s German-heritage community can run Cambridge German beside the English-medium track.'],
      ['One hour from your teachers, all year', 'The coast and Nairobi are an hour apart with no seasonal change on either side.'],
    ],
    growingReason: 'The Erongo coast carries Namibia\'s principal port and its logistics corridor into Botswana, Zambia, and the DRC, a substantial fishing and marine sector, Swakopmund\'s tourism and German-heritage community, and the Rössing and Husab uranium operations inland — with thin international schooling and Windhoek four hours away. The coast runs CAT (UTC+2) year-round, one hour behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the coast, run supplementary alongside a school enrolment or as the academic spine behind a registered home-schooling arrangement. Examinations at authorised centres confirmed per session with travel planned ahead.',
      cbc: 'Kenya CBC available for coastal families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies on the coast. School attendance is compulsory under section 9 of the Basic Education Act 3 of 2020 from the year a learner turns six, and the Act allows exemption entirely, partially, or conditionally where that is in the learner\'s best interests. Namibia also defines home schooling in the Act — instruction in which parents, care-givers, or privately appointed tutors or service providers teach a legally approved academic curriculum at home instead of at a school — and requires registration for it. Whether a particular international programme counts as a legally approved academic curriculum is a question for the Ministry of Education and the regional director, not for us, which is why our clean default is supplementary alongside a school enrolment. For mining and maritime families that configuration is usually simplest anyway: the local school carries the enrolment while the Cambridge track runs live alongside and continues unchanged to the next posting.',
    homeTuitionDetail: 'Smartious delivers to coastal Namibian families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing in the ordinary school day on the one-hour offset, with every session recorded — built for mining rosters, sea time, and remote sites.',
    faqs: [
      { q: 'We are posted at Rössing or Husab — do we have to board our child inland?', a: 'That has been the default and it no longer needs to be. Identical live teaching reaches the coast, with examination travel a few times a year rather than a child living away from home.' },
      { q: 'Our family works at sea — can schooling survive the rotations?', a: 'It is built for it: live classes with a complete recorded library, so the academic pace holds through long absences.' },
      { q: 'Where do coastal students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into each series ahead.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'oshakati-na',
    name: 'Oshakati & the Northern Regions',
    county: 'Oshana, Ohangwena, Omusati and Oshikoto',
    region: 'The four northern regions where the largest share of Namibians live · Oshakati, Ondangwa and Ongwediva as the commercial centre · trade toward Angola · no international schooling anywhere in the north',
    primaryKeyword: 'Online school and homeschool in Oshakati and northern Namibia',
    heroTagline: 'For Oshakati, Ondangwa and Ongwediva families — where most Namibians live, and where no international school has ever been built.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for northern Namibian families. The four north-central regions hold the largest share of Namibia\'s population, and the Oshakati-Ondangwa-Ongwediva corridor is their commercial heart — retail and wholesale trade, transport, health and education services, a university presence, and cross-border commerce toward Angola. It is also the part of the country with no international schooling of any kind, and Windhoek is around seven hundred kilometres south. For northern families whose children are academically ambitious, the historical answer has been boarding in the capital or in South Africa. Smartious delivers the international pathways live to the north instead, one hour ahead of you all year.',
    heroImg: '/heroes/oshakati-na.jpg',
    altTexts: { hero: 'Northern Namibia' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Oshakati, Ondangwa and northern Namibia families — no international schooling in the region. From USD 400/month.',
    challenges: [
      'No international schooling anywhere in the northern regions, with Windhoek around seven hundred kilometres south.',
      'Boarding in the capital or South Africa has been the only route to an internationally examined record.',
      'Compulsory school attendance runs under section 9 of the Basic Education Act 3 of 2020.',
      'Exam sittings mean travel, planned well ahead.',
      'Time zone: the north runs CAT (UTC+2) year-round — exactly one hour behind Nairobi EAT.',
    ],
    familySituations: [
      'Trade, retail, and transport business families across the northern corridor.',
      'Health, education, and public-service professional families.',
      'University and academic families in the north.',
      'Cross-border commerce families trading toward Angola.',
      'Students aiming at Namibian, South African, or overseas universities from a northern base.',
    ],
    nearbyAreas: ['Oshakati', 'Ondangwa', 'Ongwediva', 'Outapi', 'Eenhana', 'Tsumeb', 'the Angolan border at Oshikango'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Business Studies, Economics, Geography',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Namibian and South African university applications',
    ],
    whyChoose: [
      ['The complete option where none has ever existed', 'Identical live delivery in Oshakati and Windhoek — the international pathway the north has never had.'],
      ['The alternative to sending a child seven hundred kilometres away', 'Boarding in the capital or South Africa has been the only route. Live teaching reaches the north instead.'],
      ['Pre-medical and commerce depth', 'Cambridge A-Level Biology and Chemistry for medicine-bound students, Economics and Mathematics for the trading families who run the corridor.'],
      ['One hour from your teachers, all year', 'The north and Nairobi are an hour apart with no seasonal change on either side.'],
      ['An African school teaching African families', 'Nairobi-built and Nairobi-taught, working to African school calendars and examination realities.'],
    ],
    growingReason: 'The four north-central regions hold the largest share of Namibia\'s population, with the Oshakati-Ondangwa-Ongwediva corridor as their commercial heart and cross-border trade toward Angola — and no international schooling anywhere in the region, with Windhoek seven hundred kilometres south. The north runs CAT (UTC+2) year-round, one hour behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for northern Namibia, run supplementary alongside a school enrolment or as the academic spine behind a registered home-schooling arrangement. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in the north. School attendance is compulsory under section 9 of the Basic Education Act 3 of 2020 from the year a learner turns six, with an exemption power where that is in the learner\'s best interests. Namibia defines home schooling in the Act — instruction in which parents, care-givers, or privately appointed tutors or service providers teach a legally approved academic curriculum at home instead of at a school — and requires registration. Whether a particular international programme is a legally approved academic curriculum for that purpose is a question for the Ministry of Education and the regional director rather than for us, so our clean default is supplementary alongside a local school enrolment. In a region seven hundred kilometres from the nearest international campus, that configuration delivers the examined record without anyone leaving home.',
    homeTuitionDetail: 'Smartious delivers to northern Namibian families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing in the ordinary school day on the one-hour offset, with every session recorded.',
    faqs: [
      { q: 'Is there any international schooling in northern Namibia?', a: 'None — the country\'s provision sits in Windhoek, around seven hundred kilometres south. Live online delivery is the complete option for the north, run alongside a local school enrolment.' },
      { q: 'Do we have to send our child to board in Windhoek or South Africa?', a: 'That has been the historical answer for academically ambitious northern students. It no longer needs to be: the same teaching reaches Oshakati, with examination travel a few times a year instead of a child living away.' },
      { q: 'Where do northern students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned well ahead of each series.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const NAMIBIA_COUNTRY = {
  slug: 'namibia',
  name: 'Namibia',
  longName: 'Republic of Namibia',
  adjective: 'Namibian',
  flag: '🇳🇦',
  hub: '/online-school/namibia',
  hubPageId: 'homeschooling-namibia',
  cityPageId: 'namibia-city',

  currency: 'NAD',
  currencyName: 'Namibian Dollar',
  currencyPeg: 'Fees are invoiced in USD; Namibian dollar equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'CAT',
    name: 'Central Africa Time (UTC+2) year-round, no seasonal change since 2017',
    utcOffset: '+2',
    offsetFromEAT: '-1 hour, every week of the year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Windhoek checked first, with coastal and northern families planning travel per series'],
  examCentreTiles: [
    { city: 'Windhoek', centre: 'Authorised provision', area: 'The country\'s main external-candidate capacity, confirmed per family per session.' },
    { city: 'The Erongo coast', centre: 'Regional provision', area: 'Walvis Bay and Swakopmund options checked for coastal and mining families.' },
    { city: 'The northern regions', centre: 'Planned per session', area: 'Oshakati and Ondangwa families plan travel into each examination window well ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Namibia-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Windhoek is checked first; coastal families review Erongo options, and northern families plan travel into each series well ahead given the distances involved. Note what does and does not apply. In the supplementary configuration — our default — the school enrolment carries the compulsory-attendance duty under section 9 of the Basic Education Act 3 of 2020 and continues its own national examination track unchanged, while the Cambridge calendar runs alongside. For a family registered for home schooling under the Act, the registration and the legally-approved-curriculum requirement are theirs to settle with the Ministry and the regional director; we supply the teaching, the assessment, the documentation, and the external examinations within whatever arrangement they hold.',
  secondaryProgrammeExamRef: 'Authorised Namibian Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/namibia.jpg',
  heroEyebrow: 'Online school for Namibia',
  heroH1Suffix: 'Namibia',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for mining, marine, expat, and Namibian families across Windhoek, Walvis Bay and the coast, and the northern regions. Taught live from Nairobi — one hour ahead, every week of the year. Namibia is unusual in Africa for defining home schooling in statute and requiring it to be registered, and we explain exactly what that does and does not settle.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — supplementary beside your school, or the academic spine behind a registered home-schooling arrangement.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Namibia',

  citiesSectionTitle: 'Where our Namibia families are',
  citiesSectionBody: 'Smartious Namibia families concentrate across Windhoek (government, financial services, the mining sector\'s commercial centre, the German-heritage community, and the country\'s international tier), Walvis Bay and the Erongo coast (the national port and its corridor into three countries, the fishing and marine industry, Swakopmund\'s tourism, and the Rössing and Husab uranium operations inland), and Oshakati and the northern regions (where the largest share of Namibians live, and where no international school has ever been built). One statutory framework explained precisely, two working configurations, and the closest timezone alignment we have anywhere.',

  trustSignals: [
    { h: 'An African school teaching African families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023 — an African school with international accreditation, serving students in 51 countries.' },
    { h: 'One hour apart, every week of the year', p: 'Namibia has run CAT (UTC+2) year-round since abolishing seasonal time changes in 2017, and Kenya observes no daylight saving either. Live classes land in the ordinary Namibian school day and afternoon all year, with no seasonal drift.' },
    { h: 'The statute explained, including its hinge', p: 'The Basic Education Act 3 of 2020 defines home schooling as teaching a learner a legally approved academic curriculum at home instead of at a school, and requires registration. That phrase — legally approved academic curriculum — is the hinge, and whether a given international programme satisfies it is for the Ministry and your regional director to say, not us.' },
    { h: 'What we do not claim', p: 'We do not warrant that our programme is a legally approved academic curriculum for home-schooling registration purposes, and we do not present an absent penalty in the Act as permission. Our clean default is supplementary, where neither question arises.' },
  ],

  universitiesInCountry: 'The University of Namibia (UNAM) with campuses across the country including the northern regions, the Namibia University of Science and Technology (NUST) in Windhoek, and the International University of Management.',
  universityChannels: 'Namibian universities admit holders of Cambridge and other international qualifications through established procedures, with programme-specific requirements confirmed per institution — and because Namibia\'s national senior certificate has deep Cambridge lineage, international qualifications are familiar in this market rather than exotic. Regionally, South African universities are a principal destination for Namibian students and read Cambridge A-Levels and the IB routinely. Germany is a further meaningful destination given Namibia\'s long-standing German-heritage community and language ties, and German universities assess these qualifications routinely. Internationally, Cambridge A-Levels are read natively by UK universities via UCAS and accepted in 160+ countries, and the Common Application serves US plans — including the geoscience, mining, and marine programmes the Erongo coast\'s families most often have in view. Smartious provides personalised university guidance across Namibian, South African, German, UK (UCAS), and US destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Namibia families. Cambridge IGCSE (Years 10-11) and Cambridge A-Level (Years 12-13) delivered as live online classes landing in the ordinary Namibian school day on a one-hour offset with no seasonal drift — run supplementary alongside a school enrolment, which is our clean default, or as the academic spine behind a registered home-schooling arrangement under the Basic Education Act 3 of 2020. Examinations at authorised Namibian provision confirmed per session. Pathway familiar to Namibian and South African universities, assessed routinely in Germany, read natively by UK universities via UCAS, and accepted in 160+ countries.',
  britishCurriculumSuits: 'Namibia families targeting the Cambridge pathway. Best fit for: (1) uranium, mining, and marine-industry families on the Erongo coast where boarding inland has been the default, (2) northern families in Oshakati, Ondangwa, and Ongwediva with no international provision within seven hundred kilometres, (3) Windhoek professional families outside the international tier\'s fees, (4) German-heritage families wanting an English-medium international track with Cambridge German alongside, (5) families registered for home schooling who want an examined academic spine behind the arrangement.',
  britishCurriculumDelivery: 'Live online classes in the ordinary Namibian school day, small groups 4-6 students, every session recorded. Cambridge examinations at authorised provision, confirmed per session.',
  ibDiplomaSuits: 'Namibia families targeting the IB Diploma\'s breadth — support and an alternative beside Windhoek\'s IB provision.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Namibia families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to African and internationally mobile families at online-delivery fees rather than campus ones. Namibia families join students in 51 other countries — and, like our Zambian, Zimbabwean, and Batswana families, they are an hour from their teachers rather than a continent away.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the Erongo coast\'s uranium and marine-engineering families and every medicine-bound student in Windhoek and the north. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Namibia\'s international schooling is a Windhoek story — a strong tier including IB provision and long-established German-language schooling, priced at the top of the local market. The Erongo coast has thin provision for an economy carrying the national port and the uranium mines, and the four northern regions, where the largest share of Namibians live, have none at all. Because the national senior certificate has deep Cambridge lineage, the qualification itself is familiar here; the gap is access to live teaching outside the capital.',
  competitors: [
    { name: 'Windhoek international schools',                 city: 'Windhoek',              curriculum: 'IB, British and German tracks',         feesUsd: 'Top of the local market',                           feesAed: 'Premium tier',            rating: 4.6, capacityNote: 'Strong provision including IB and long-established German-language schooling' },
    { name: 'Private and church schools',                     city: 'Windhoek and regions',  curriculum: 'Namibian national tracks',              feesUsd: 'Mid tier',                                          feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Good schools, national curriculum — not an international route' },
    { name: 'The Erongo coast',                               city: 'Walvis Bay, Swakopmund', curriculum: 'Thin provision',                       feesUsd: 'Little international option',                       feesAed: '—',                       rating: 0,   capacityNote: 'The national port, the fishing industry and the uranium mines, four hours from the capital tier' },
    { name: 'The northern regions',                           city: 'Oshakati, Ondangwa, Ongwediva', curriculum: '—',                             feesUsd: 'No international provision',                        feesAed: '—',                       rating: 0,   capacityNote: 'Where most Namibians live — and no international school has ever been built' },
    { name: 'South African boarding',                         city: 'Cape Town, Johannesburg', curriculum: 'South African and international',      feesUsd: 'Fees plus travel plus a child living away',         feesAed: '—',                       rating: 4.4, capacityNote: 'The traditional answer for coastal and northern families' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh (online)', city: 'Online',                curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious, and taught from a timezone that puts classes at awkward hours' },
    { name: 'Smartious Homeschool (Namibia via online delivery)', city: 'Delivered to all Namibia', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'NAD equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + one hour from your teachers + the coast and the north served identically + the home-schooling statute explained including what we cannot warrant' },
  ],

  legalFrameworkIntro: 'Namibia has the clearest statutory home-education provision we have found anywhere in our African coverage — and one phrase inside it decides everything. Here is the framework exactly.',
  legalFramework: [
    { h: 'The governing statute', p: 'The Basic Education Act 3 of 2020 (Government Gazette 7257) replaced the Education Act of 2001 and is the governing law, with the Basic Education Regulations 2023 (Government Notice 331 of 2023) made under section 125. It is a substantially more detailed statute than its predecessor, and it addresses home schooling directly rather than by implication — which is rare enough in the region to be worth stating.' },
    { h: 'Compulsory attendance under section 9', p: 'Section 9(1) makes it compulsory for a learner to attend school during school hours from the first school day of the academic year in which he or she reaches the age of six years, until the last school day of the year in which the learner attains the upper age the section sets. We deliberately cite that upper age as "the age set by section 9(1)" rather than quoting a number, because it is the kind of figure that should be read from the current text rather than taken from a provider\'s article. The Act also permits a learner to be exempted entirely, partially, or conditionally from compulsory school attendance where that is in the learner\'s best interests, and the regulations contemplate a regional director approving in writing, on a parent\'s request, that a child was unable to attend.' },
    { h: 'The definition that makes Namibia distinctive', p: 'The Act defines home schooling: educational instruction in which parents and care-givers, or other privately appointed tutors or service providers, teach a learner a legally approved academic curriculum at home instead of at a public or private school. That is a genuine, named, statutory route — and note the breadth of who may teach, which expressly includes privately appointed tutors and service providers rather than parents alone. Registration for home schooling is required. Commentary has observed that the Act does not attach fines for failing to register or failing to ensure attendance; we mention that only to say plainly that an absent penalty is not permission, and we would not advise any family to treat it as one.' },
    { h: 'The hinge: "a legally approved academic curriculum"', p: 'Everything turns on that phrase, and it is where we stop and hand the question back. We will not tell a Namibian family that a Cambridge or IB programme automatically constitutes a legally approved academic curriculum for home-schooling registration purposes. It may; it is not ours to determine, and a family who registers on the strength of a provider\'s assurance and finds otherwise has lost far more than a fee. Whether a given international curriculum satisfies the requirement is confirmed with the Ministry of Education and the regional director. That is the single most important sentence on this page.' },
    { h: 'Which is why our default is supplementary', p: 'Alongside a school enrolment, none of the above arises: the school carries the compulsory-attendance duty under section 9, no registration is needed, and no curriculum-approval question has to be answered — while the child gains exactly the same live teaching and the same externally examined Cambridge or IB record. For families who do hold or seek a home-schooling registration, we act as the academic spine within it: live teaching, continuous assessment, documented progress, and external examinations, with the registration and approval questions remaining theirs and the Ministry\'s.' },
    { h: 'Where the qualifications lead', p: 'Namibia\'s national senior certificate has deep Cambridge lineage, so an international qualification is familiar here rather than exotic. UNAM, NUST, and the private sector admit international qualifications through established procedures with requirements confirmed per institution. South African universities are a principal destination for Namibian students and read Cambridge A-Levels and the IB routinely; German universities assess them routinely too, which matters given Namibia\'s long-standing language and heritage ties. Internationally, UCAS reads A-Levels natively, the Common Application serves US plans, and A-Levels are accepted in 160+ countries — including the geoscience, mining, and marine programmes the Erongo coast\'s families most often have in view.' },
  ],

  whySmartious: [
    { h: 'One hour from your teachers, all year',                          p: 'Namibia has run CAT year-round since 2017 and Kenya observes no daylight saving — classes land in the ordinary school day every week of the year, with no seasonal drift.' },
    { h: 'The statute explained, including what we cannot warrant',        p: 'Namibia defines home schooling and requires registration against a legally approved academic curriculum. We explain both, and we do not claim our programme automatically satisfies the second.' },
    { h: 'The coast and the north served identically',                     p: 'Erongo carries the port and the uranium mines with thin provision; the northern regions hold most of the population and have none. Live delivery closes both gaps the same way.' },
    { h: 'The alternative to boarding',                                    p: 'Windhoek or South Africa has been the answer for coastal and northern families for decades. Identical live teaching reaches Walvis Bay and Oshakati instead.' },
    { h: 'German alongside the academic core',                             p: 'For Namibia\'s German-heritage community, Cambridge German sits naturally beside the English-medium track — and German universities read the record routinely.' },
    { h: 'An African school teaching African families',                    p: 'Nairobi-built and Nairobi-taught, serving 51 countries, working to African school calendars and examination realities.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Namibia?', a: 'Namibia is unusual in Africa for addressing it directly. The Basic Education Act 3 of 2020 defines home schooling as instruction in which parents, care-givers, or privately appointed tutors or service providers teach a learner a legally approved academic curriculum at home instead of at a public or private school, and registration for home schooling is required. School attendance is otherwise compulsory under section 9 from the academic year in which a learner turns six.' },
    { q: 'Does a Cambridge or IB programme count as a "legally approved academic curriculum"?', a: 'We will not claim it automatically does — that is the single most important sentence on this page. The phrase is the hinge of the whole provision, and whether a particular international curriculum satisfies it for registration purposes is for the Ministry of Education and your regional director to confirm. Our clean default is supplementary alongside a school enrolment, where the question does not arise at all.' },
    { q: 'The Act has no penalties for failing to register — does that mean it is optional?', a: 'No. Commentary has noted the absence of fines, and we mention it only to say plainly that an absent penalty is not permission. The registration and attendance requirements stand, and we would not advise anyone to plan around a gap in enforcement.' },
    { q: 'What is the compulsory age range?', a: 'Attendance is compulsory from the first school day of the academic year in which a learner reaches six, until the last school day of the year in which the learner reaches the upper age set by section 9(1). We cite it that way deliberately — read the current figure from the Act rather than from any provider\'s summary.' },
    { q: 'How do class times work from Nairobi?', a: 'Namibia has run CAT year-round since abolishing seasonal time changes in 2017 and Kenya observes no daylight saving, so our teaching hours fall inside the ordinary Namibian school day and afternoon every week of the year.' },
    { q: 'We are on the Erongo coast or in the north — do we have to board our child?', a: 'That has been the traditional answer, and it no longer needs to be. Identical live teaching reaches Walvis Bay, Swakopmund, and Oshakati, with examination travel a few times a year rather than a child living away from home.' },
    { q: 'Will Namibian, South African, or German universities accept Cambridge A-Levels?', a: 'Namibia\'s national senior certificate has deep Cambridge lineage, so the qualification is familiar here; UNAM, NUST, and the private sector admit international qualifications with requirements confirmed per institution. South African universities read A-Levels and the IB routinely, as do German universities — relevant given Namibia\'s heritage and language ties. UCAS and the Common Application stand open internationally.' },
    { q: 'Which parts of Namibia does Smartious cover?', a: 'Windhoek, Walvis Bay and the Erongo coast including Swakopmund and the uranium operations, and Oshakati and the northern regions have dedicated pages. Live online delivery works identically anywhere in the country — which in the north and on the coast is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether your child is enrolled at a school or whether you hold a home-schooling registration: in Namibia those are genuinely different plans, and that conversation belongs at the start.',
}
