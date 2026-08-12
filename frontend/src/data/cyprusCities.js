// ═══════════════════════════════════════════════════════════════════
// CYPRUS — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for shipping, fintech, expatriate and Cypriot
// families across Nicosia, Limassol, Larnaca, Paphos and the
// Famagusta district.
// FOURTH MIDDLE EAST / EASTERN MEDITERRANEAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// *** SCOPE AND TONE RULE — ABSOLUTE ***
// These pages cover the Republic of Cyprus and the areas under its
// effective control only. Do NOT discuss, characterise or allude to
// the island's political situation, its division, any territorial
// question, or any related history. No commentary of any kind. Cities
// are described by their industries, universities and communities.
// If a topic cannot be written without touching politics, cut it.
//
// LEGAL POSITIONING NOTE — SOURCES GENUINELY CONFLICT. PRESENT ALL
// READINGS AND RESOLVE NONE:
// - AUTHORITY: the Ministry of Education, Sports and Youth (MoECSY),
//   also referred to in some sources as the Ministry of Education,
//   Culture, Sport and Youth.
// - COMPULSORY EDUCATION: full-time education is compulsory for
//   children aged 5 to 15 (one source gives the lower bound more
//   precisely as 5 years 8 months). The system runs pre-primary
//   3-6, primary 6-12, secondary 12-18. State the range as reported
//   and route families to MoECSY.
// - PRIVATE SCHOOLS require Ministry approval.
// - *** THE CONFLICT — ALL THREE READINGS MUST APPEAR ***:
//   (1) RESTRICTED-TO-SEN READING: homeschooling is legal only for
//       students at pre-primary, primary and secondary levels who
//       have SPECIAL EDUCATIONAL NEEDS, a form of disability, or
//       SERIOUS HEALTH PROBLEMS; general elective homeschooling is
//       NOT permitted; parents must obtain MoECSY approval and only
//       MINISTRY-APPROVED TEACHERS may deliver instruction, based on
//       the NATIONAL CURRICULUM.
//   (2) PERMITTED-BUT-STRINGENT READING: homeschooling is legal but
//       regulations and procedures are stringent; parents must apply
//       for permission and meet criteria set by the Ministry,
//       providing a curriculum aligned to the national one with
//       regular assessments.
//   (3) UNREGULATED-GREY READING: the Education Law addresses formal
//       schooling rather than alternative approaches, so home
//       education is "not technically illegal but not formally
//       recognised", with NO official approval process and NO
//       standardised framework.
//   PLUS: at least one comparative source lists Cyprus among
//   countries that PROHIBIT homeschooling.
// - SCALE: one source reports approximately 200-300 families in
//   Cyprus practising some form of home education, noting exact
//   numbers are hard to verify given the lack of an official
//   registry. ATTRIBUTE it and flag it as unverifiable.
// - There have been public campaigns seeking clearer legal status,
//   and one source reports the Ministry has begun preliminary
//   discussions about formalising home-education policy, with no
//   concrete change. Report as reported; do NOT imply it is close.
// - RISK TO STATE: homeschooled students must meet the same
//   university admission requirements as traditionally schooled ones.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT, stated firmly. Where
//   readings conflict this sharply, we build only what none of them
//   puts in question.
// - Smartious is NOT a MoECSY-approved school and says so.
//
// TIMEZONE: Cyprus runs EET (UTC+2), moving to EEST (UTC+3) for the
// summer. Our teaching base runs UTC+3 year-round. So Cyprus is ONE
// HOUR BEHIND us in winter and EXACTLY LEVEL in summer — the same
// relationship as Israel, and among the closest in our coverage.
// Every hour of our teaching day is effectively available.
//
// MARKET NOTE: Cyprus has one of the largest private and
// international school sectors per head anywhere in our coverage —
// The English School and the American Academy in Nicosia, the
// Grammar School, Falcon, Heritage, Foley's, Pascal, The Island
// Private School, Silvertree, King's School Paphos and Aspire among
// many others — much of it British-curriculum and IGCSE/A-Level
// based, with fees well below UK levels but significant locally.
// Economy: Nicosia's government, legal, banking and university
// sector; Limassol's ship management industry (one of the largest
// such centres in the world) plus forex, fintech and a very large
// Russian-speaking, Ukrainian, Israeli and Lebanese resident
// community; Larnaca's airport, port and fast residential growth;
// Paphos's long-established British and northern European retiree
// and residential belt; and the Famagusta district's tourism
// economy around Ayia Napa and Protaras. Cyprus is an EU member,
// which matters for university routes.
// ═══════════════════════════════════════════════════════════════════

export const CYPRUS_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'nicosia-cy',
    name: 'Nicosia',
    county: 'Nicosia District',
    region: 'The capital — government, legal, banking and the university sector · long-established British-curriculum schools · a professional and diplomatic community · the island\'s academic centre',
    primaryKeyword: 'Online school and international curriculum in Nicosia',
    heroTagline: 'For Nicosia families — the subjects a strong school still cannot staff, taught live at whatever hour suits.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Nicosia families. The capital carries the government, legal and banking sectors, the island\'s academic centre, and some of the oldest British-curriculum schools in the eastern Mediterranean — The English School, the American Academy, the Grammar School and others that have taught IGCSE and A-Level for generations. We are not introducing Cambridge to this city. What we add is narrower: the subject sets a single timetable cannot sustain, and fees a professional family can meet. And Cyprus sits within an hour of our teaching clock all year.',
    heroImg: '/heroes/nicosia-cy.jpg',
    altTexts: { hero: 'Nicosia' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Nicosia families — subject depth beside a long British-curriculum tradition. From USD 400/month.',
    challenges: [
      'Specialist A-Level subjects often will not run for small cohorts even in strong schools.',
      'Private school fees are significant locally even where modest by UK standards.',
      'Full-time education is compulsory for children aged 5 to 15.',
      'Cypriot sources conflict sharply on whether elective home education is permitted at all.',
      'Time zone: Cyprus runs EET (UTC+2) moving to EEST (UTC+3) in summer — one hour behind us in winter and level in summer.',
    ],
    familySituations: [
      'Professional, legal and banking families outside the top private tier\'s fees.',
      'University academic and research households.',
      'Diplomatic and international-organisation families.',
      'Students needing a subject their school cannot staff for a small group.',
      'Families targeting UK, EU, American or Cypriot universities.',
      'Households arriving mid-curriculum from another country\'s system.',
    ],
    nearbyAreas: ['Nicosia', 'Strovolos', 'Engomi', 'Latsia', 'Aglantzia', 'Lakatamia', 'Dali'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Greek, Russian, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and EU, Greek and Cypriot university applications',
    ],
    whyChoose: [
      ['The set your school cannot staff', 'Further Mathematics or a third science for four pupils is unviable on one timetable and routine in a live group drawn from several countries.'],
      ['Respectful of a long tradition', 'Nicosia\'s British-curriculum schools have taught IGCSE and A-Level for generations. We supplement that rather than lecture it.'],
      ['Almost no timezone at all', 'One hour behind us in winter and exactly level in summer — after-school, mid-morning or evening all work.'],
      ['The conflicting legal readings set out fairly', 'Cypriot sources genuinely disagree about elective home education. We present all of them and send families to the Ministry rather than picking one.'],
      ['Greek and Russian kept as examined subjects', 'Home languages run alongside the English-medium core rather than being traded away.'],
    ],
    growingReason: 'Nicosia carries the government, legal and banking sectors, the island\'s academic centre and some of the oldest British-curriculum schools in the eastern Mediterranean — inside a legal framework on home education where Cypriot sources reach sharply different conclusions. Cyprus runs EET (UTC+2), moving to EEST (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Nicosia families, taught alongside a Cypriot school enrolment in the subjects a timetable cannot cover. Examinations at authorised centres confirmed per family per session; Cyprus has long-established Cambridge provision.',
      cbc: 'Kenya CBC available for Nicosia families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the island\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Cyprus is one of the countries where we most need to describe a disagreement rather than a rule. What is not in dispute: education is administered by the Ministry of Education, Sports and Youth, full-time education is compulsory for children aged 5 to 15 — one source gives the lower bound more precisely as five years and eight months — and private schools require Ministry approval. What is in dispute is whether elective home education is available at all, and the readings differ sharply. One holds that home education is legal only for students with special educational needs, a form of disability or serious health problems, that general elective homeschooling is not permitted, and that where it is approved only Ministry-approved teachers may deliver instruction based on the national curriculum. A second holds that it is legal but stringently regulated, with parents applying for permission, submitting a curriculum aligned to the national one and accepting regular assessments. A third holds that the Education Law addresses formal schooling rather than alternative approaches, so home education is not technically illegal but is not formally recognised either, with no official approval process and no standardised framework — and one comparative source simply lists Cyprus among countries that prohibit it. We are not going to resolve that, and any provider who tells you it is settled is selling rather than advising: put your own position to the Ministry of Education, Sports and Youth and get the answer in a form you can keep. One source reports approximately 200 to 300 families practising some form of home education, noting that exact numbers are hard to verify given the absence of an official registry, and that campaigns have sought clearer legal status with preliminary ministerial discussion reported but no concrete change. One risk is worth flagging regardless of which reading proves right: home-educated students must meet the same university admission requirements as traditionally schooled ones. Our arrangement raises none of it — live Cambridge or IB teaching alongside a Cypriot school enrolment — and Smartious is not a MoECSY-approved school and issues no Cypriot qualification.',
    homeTuitionDetail: 'Smartious delivers to Nicosia families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Cyprus runs one hour behind our teaching base in winter and exactly level in summer, so effectively our whole teaching day is available — after-school, mid-morning or evening — with every session recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Cyprus?', a: 'Cypriot and international sources genuinely disagree. One reading limits it to students with special educational needs, a disability or serious health problems, with Ministry approval and Ministry-approved teachers on the national curriculum. Another describes it as legal but stringently regulated by permission. A third describes it as not formally recognised, with no official approval process. At least one comparative source lists Cyprus among countries that prohibit it. Confirm your own position with the Ministry of Education, Sports and Youth.' },
      { q: 'Why would a Nicosia family with excellent schools use Smartious?', a: 'Usually one thing: a subject set your timetable cannot staff — Further Mathematics, a third science, or a clash. Beyond that, fees. If your school covers everything your child needs, we would rather tell you that.' },
      { q: 'Does Smartious hold Ministry approval?', a: 'No. Private schools in Cyprus require Ministry approval and we do not hold it. We teach Cambridge, Pearson Edexcel, IB and AP qualifications alongside a Cypriot school that carries the domestic side.' },
      { q: 'What time are classes?', a: 'Effectively any hour of our teaching day — Cyprus is one hour behind us in winter and exactly level in summer, so after-school, mid-morning and evening slots all work.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'limassol-cy',
    name: 'Limassol',
    county: 'Limassol District',
    region: 'One of the world\'s largest ship management centres · a substantial forex, fintech and professional-services sector · a very large Russian-speaking, Ukrainian, Israeli and Lebanese resident community · the fastest-growing private school demand on the island',
    primaryKeyword: 'Online school and international curriculum in Limassol',
    heroTagline: 'For Limassol families — a genuinely international city where school places are the scarce commodity, not schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Limassol families. The city runs one of the largest ship management industries in the world, a substantial forex, fintech and professional-services sector, and one of the most genuinely international resident populations in the eastern Mediterranean — Russian-speaking, Ukrainian, Israeli, Lebanese, British and more. Private school demand here has grown faster than places, and families arriving mid-year frequently find the schools they want are full. Live delivery starts within a week of the assessment, with no waitlist.',
    heroImg: '/heroes/limassol-cy.jpg',
    altTexts: { hero: 'Limassol seafront' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Limassol families — shipping and fintech capital, school places scarce. From USD 400/month.',
    challenges: [
      'Private school demand has grown faster than places, and mid-year arrivals often find schools full.',
      'Children arriving mid-curriculum from Russian, Ukrainian, Israeli, Lebanese and British systems.',
      'Shipping and fintech careers that move families between countries.',
      'Cypriot sources conflict sharply on whether elective home education is permitted.',
      'Time zone: one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'Ship management, maritime and shipping-services families.',
      'Forex, fintech and professional-services households.',
      'Russian-speaking, Ukrainian, Israeli and Lebanese resident families.',
      'Households arriving mid-year and finding preferred schools full.',
      'Families whose next posting may be another country entirely.',
      'Students targeting UK, EU, American or Cypriot universities.',
    ],
    nearbyAreas: ['Limassol', 'Germasogeia', 'Agios Athanasios', 'Mouttagiaka', 'Ypsonas', 'Pissouri', 'Kolossi'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Russian, Greek, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Economics',
      'Cambridge A-Level Business, Computer Science, Accounting, Biology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Microeconomics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and EU, Greek and Cypriot university applications',
    ],
    whyChoose: [
      ['No waitlist', 'Mid-year arrivals start within a week of the assessment. In a city where preferred schools fill early, that is frequently the entire decision.'],
      ['Economics and business depth for a shipping and finance city', 'Cambridge A-Level Economics, Business, Accounting and Mathematics suit the sectors that define Limassol.'],
      ['Russian and Greek kept as examined subjects', 'Cambridge Russian and Greek run alongside the English-medium core — a formal qualification rather than a household language.'],
      ['Continuity if the family moves again', 'One curriculum, one teaching team, one examination board, wherever the next country is.'],
      ['Almost no timezone at all', 'One hour behind in winter, level in summer.'],
    ],
    growingReason: 'Limassol runs one of the largest ship management industries in the world alongside a substantial forex, fintech and professional-services sector and one of the most internationally mixed resident populations in the eastern Mediterranean — with private school demand growing faster than places. Cyprus runs EET (UTC+2), moving to EEST (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Limassol families, taught alongside a Cypriot school enrolment, with no waitlist for mid-year starts.',
      cbc: 'Kenya CBC available for Limassol families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Limassol, and it is genuinely contested. Education is administered by the Ministry of Education, Sports and Youth and full-time education is compulsory for children aged 5 to 15, with private schools requiring Ministry approval. On elective home education the readings conflict sharply: one limits it to students with special educational needs, a disability or serious health problems, with Ministry approval and Ministry-approved teachers on the national curriculum; another describes it as legal but stringently regulated by permission with an aligned curriculum and regular assessments; a third describes it as not formally recognised, with no official approval process or standardised framework; and at least one comparative source lists Cyprus among countries that prohibit it. We present all of them and resolve none — confirm with the Ministry directly. Smartious is not a MoECSY-approved school and issues no Cypriot qualification. For internationally mobile shipping and fintech families the supplementary configuration is the natural one, and it travels unchanged to the next country.',
    homeTuitionDetail: 'Smartious delivers to Limassol families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, effectively across our whole teaching day given the near-zero offset, with every session recorded.',
    faqs: [
      { q: 'We arrived mid-year and the schools we want are full — what are the options?', a: 'We have no waitlist. A child starts within a week of the assessment, and keeps one internationally examined pathway rather than being placed wherever there happens to be a space.' },
      { q: 'Our household speaks Russian — can that be examined?', a: 'Yes. Cambridge Russian runs alongside the English-medium core as a formal qualification, which is more useful at university application than fluency alone.' },
      { q: 'Our next posting may be another country — does the schooling follow?', a: 'Yes: the same curriculum, teachers and examination board continue unchanged, with examinations sat at authorised centres wherever the family is.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'larnaca-cy',
    name: 'Larnaca',
    county: 'Larnaca District',
    region: 'The island\'s main airport and a growing port and marina · fast residential growth and a broadening international community · logistics and aviation services · a shorter school list than its growth suggests',
    primaryKeyword: 'Online school and international curriculum in Larnaca',
    heroTagline: 'For Larnaca families — the island\'s gateway, growing faster than the schools around it.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Larnaca families. The city holds the island\'s main airport, a growing port and marina development, and the aviation and logistics services around them — and has drawn an international residential population expanding faster than the schools serving it. Families here often find themselves choosing between a commute to Nicosia or Limassol and a shorter local list. Live delivery removes that choice, and Cyprus sits within an hour of our teaching clock all year.',
    heroImg: '/heroes/larnaca-cy.jpg',
    altTexts: { hero: 'Larnaca seafront and salt lake' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Larnaca families — the island gateway, growing faster than its schools. From USD 400/month.',
    challenges: [
      'Residential growth has outpaced local school provision.',
      'Commutes to Nicosia or Limassol are the usual alternative.',
      'Families arriving from several different national systems.',
      'Cypriot sources conflict sharply on whether elective home education is permitted.',
      'Time zone: one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'Aviation, airport and logistics-services families.',
      'Port, marina and maritime-services households.',
      'International residents in the fast-growing coastal developments.',
      'Families commuting to Nicosia or Limassol who would rather not commute their children.',
      'Students targeting UK, EU, American or Cypriot universities.',
    ],
    nearbyAreas: ['Larnaca', 'Oroklini', 'Pyla', 'Aradippou', 'Dhekelia road', 'Kiti', 'Lefkara'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Greek, Russian, French and home language support',
      'Cambridge A-Level Mathematics, Physics, Chemistry, Biology, Economics',
      'Cambridge A-Level Business, Computer Science, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and EU, Greek and Cypriot university applications',
    ],
    whyChoose: [
      ['No commute to another city', 'Families already driving to Nicosia or Limassol for work rarely want to add a school run. Live delivery removes it for the child entirely.'],
      ['No waitlist', 'Mid-year arrivals start within a week of the assessment, which matters in a district growing this quickly.'],
      ['Home languages kept as examined subjects', 'Cambridge Greek, Russian and French alongside the English-medium core.'],
      ['Almost no timezone at all', 'One hour behind in winter, level in summer.'],
      ['The conflicting legal readings set out fairly', 'All three Cypriot readings presented, with the family sent to the Ministry rather than given a convenient answer.'],
    ],
    growingReason: 'Larnaca holds the island\'s main airport, a growing port and marina development and the aviation and logistics services around them, and has drawn an international residential population expanding faster than local school provision. Cyprus runs EET (UTC+2), moving to EEST (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Larnaca, taught alongside a Cypriot school enrolment.',
      cbc: 'Kenya CBC available for Larnaca families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Larnaca and it is contested. Education is administered by the Ministry of Education, Sports and Youth, full-time education is compulsory for children aged 5 to 15, and private schools require Ministry approval. On elective home education the readings conflict: restricted to special educational needs, disability or serious health problems with Ministry-approved teachers on the national curriculum; or legal but stringently regulated by permission; or not formally recognised at all with no official approval process; with at least one comparative source listing Cyprus among countries that prohibit it. We present all readings and resolve none — confirm with the Ministry. Smartious is not a MoECSY-approved school and issues no Cypriot qualification; our arrangement is live teaching alongside a Cypriot school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Larnaca families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, effectively across our whole teaching day given the near-zero offset, with every session recorded.',
    faqs: [
      { q: 'Is the drive to Nicosia or Limassol really the alternative?', a: 'For many Larnaca families it has been. Live delivery removes it for the child, with examination travel a few times a year rather than a daily journey.' },
      { q: 'We have just moved to Cyprus — how quickly can our child start?', a: 'Within a week of the assessment. There is no waitlist, which in a fast-growing district is often the deciding factor.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'paphos-cy',
    name: 'Paphos',
    county: 'Paphos District',
    region: 'A long-established British and northern European residential belt · tourism, property and services · coastal and hill villages spread across a wide district · a short local school list',
    primaryKeyword: 'Online school and international curriculum in Paphos',
    heroTagline: 'For Paphos families — a British residential belt decades old, spread across a district with a short school list.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Paphos families. The west has one of the longest-established British and northern European residential communities in the eastern Mediterranean — families and retirees who have been here for decades, alongside tourism, property and services businesses and a growing remote-work population. Households are spread across coastal towns and hill villages over a wide district, and the local school list is short. Live delivery reaches all of it, and for families who may return to the UK the qualification question answers itself.',
    heroImg: '/heroes/paphos-cy.jpg',
    altTexts: { hero: 'Paphos coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Paphos families — a long-established British belt with a short school list. From USD 400/month.',
    challenges: [
      'A short local school list for a long-established international community.',
      'Households spread across coastal towns and hill villages over a wide district.',
      'Families who may return to the UK and need a record read natively there.',
      'Cypriot sources conflict sharply on whether elective home education is permitted.',
      'Time zone: one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'British and northern European resident families, many long-settled.',
      'Tourism, property and services business households.',
      'Remote-work families drawn to the west.',
      'Households in hill villages far from any school.',
      'Students intending to apply through UCAS to UK universities.',
    ],
    nearbyAreas: ['Paphos', 'Kato Paphos', 'Peyia', 'Coral Bay', 'Polis and Latchi', 'Tala', 'the hill villages'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Greek, French and home language support',
      'Cambridge A-Level Mathematics, Biology, Chemistry, Physics, Geography',
      'Cambridge A-Level Economics, Business, Psychology, History',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Calculus, AP Psychology',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and EU, Greek and Cypriot university applications',
    ],
    whyChoose: [
      ['A record read natively where you came from', 'UCAS reads Cambridge A-Levels directly, which for a family who may return to the UK is the practical answer to the question they actually have.'],
      ['Reaches the whole district', 'Peyia, Polis, Tala and the hill villages get identical live teaching — no single campus is convenient to all of them.'],
      ['The complete option where the list is short', 'Identical live delivery in Paphos and Nicosia, without relocating east.'],
      ['Almost no timezone at all', 'One hour behind in winter, level in summer.'],
      ['The conflicting legal readings set out fairly', 'All three Cypriot readings, with the family sent to the Ministry.'],
    ],
    growingReason: 'Paphos holds one of the longest-established British and northern European residential communities in the eastern Mediterranean alongside tourism, property and services businesses and a growing remote-work population — spread across coastal towns and hill villages with a short local school list. Cyprus runs EET (UTC+2), moving to EEST (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the west, taught alongside a Cypriot school enrolment, and read natively by UK admissions.',
      cbc: 'Kenya CBC available for Paphos families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Paphos and it is contested. Education is administered by the Ministry of Education, Sports and Youth, full-time education is compulsory for children aged 5 to 15, and private schools require Ministry approval. On elective home education Cypriot and international sources conflict — restricted to special educational needs, disability or serious health problems with Ministry-approved teachers; or legal but stringently regulated by permission; or not formally recognised with no official approval process; with at least one comparative source listing Cyprus among countries that prohibit it. We present all readings and resolve none. One risk applies whichever proves right and matters here particularly: home-educated students must meet the same university admission requirements as traditionally schooled ones, which is precisely why an externally examined record is worth holding. Confirm your position with the Ministry. Smartious is not a MoECSY-approved school and issues no Cypriot qualification. Families who remain resident in the United Kingdom rather than Cyprus follow the framework of where they legally reside, which is a question for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to Paphos families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, effectively across our whole teaching day given the near-zero offset, with every session recorded.',
    faqs: [
      { q: 'We may return to the UK — does that shape the choice?', a: 'It shapes the qualification. UCAS reads Cambridge A-Levels natively, so a child who returns is presenting the record British admissions expects rather than one requiring conversion.' },
      { q: 'We live in a hill village — is that a problem?', a: 'Not for the teaching. Peyia, Polis, Tala and the villages get identical live delivery, with examination travel a few times a year.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'famagusta-cy',
    name: 'The Famagusta District & Eastern Coast',
    county: 'Famagusta District (government-controlled area)',
    region: 'The Ayia Napa and Protaras tourism economy · hotel, marina and hospitality businesses · a seasonal working pattern that shapes the household year · minimal local school provision',
    primaryKeyword: 'Online school and international curriculum in Ayia Napa and Protaras',
    heroTagline: 'For Ayia Napa, Protaras and eastern coast families — a tourism economy that peaks when the school year does not.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across the eastern coast. Ayia Napa, Protaras and the surrounding district run one of the most concentrated tourism economies in the eastern Mediterranean — hotels, marinas, restaurants and the hospitality and services businesses around them, many owned or managed by families who came for a season and stayed. It is a working pattern that peaks hard and leaves little slack, and local school provision is minimal. Live classes with a complete recorded library are built for exactly that.',
    heroImg: '/heroes/famagusta-cy.jpg',
    altTexts: { hero: 'The eastern Cyprus coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Ayia Napa, Protaras and eastern Cyprus families — seasonal work, minimal provision. From USD 400/month.',
    challenges: [
      'Minimal local school provision across the district.',
      'A tourism season that peaks hard and shapes the whole household year.',
      'Larnaca and Nicosia are the nearest alternatives, both a drive away.',
      'Cypriot sources conflict sharply on whether elective home education is permitted.',
      'Time zone: one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'Hotel, marina and hospitality business families.',
      'Restaurant, retail and services households.',
      'International residents who arrived for a season and settled.',
      'Families whose working year peaks in the summer months.',
      'Students targeting UK, EU, American or Cypriot universities.',
    ],
    nearbyAreas: ['Ayia Napa', 'Protaras', 'Paralimni', 'Deryneia', 'Sotira', 'Cape Greco', 'the eastern coast'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Greek, Russian and home language support',
      'Cambridge A-Level Biology, Geography, Mathematics, Economics, Business',
      'Cambridge A-Level Chemistry, Physics, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and EU, Greek and Cypriot university applications',
    ],
    whyChoose: [
      ['Built for a season', 'Live classes plus a complete recorded library hold the academic year together through the months when the business cannot pause.'],
      ['The complete option in a district with little', 'Identical live delivery on the eastern coast as in Nicosia, without a daily drive.'],
      ['Marine and environmental science that fit the coast', 'Cape Greco and the eastern shoreline make good ground for Cambridge Biology and Geography and AP Environmental Science.'],
      ['Almost no timezone at all', 'One hour behind in winter, level in summer — and evening slots work, which suits a hospitality household.'],
      ['Home languages kept as examined subjects', 'Cambridge Greek and Russian alongside the English-medium core.'],
    ],
    growingReason: 'Ayia Napa, Protaras and the surrounding district run one of the most concentrated tourism economies in the eastern Mediterranean — hotels, marinas and hospitality businesses, many owned by families who came for a season and stayed — with a hard-peaking working year and minimal local school provision. Cyprus runs EET (UTC+2), moving to EEST (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the eastern coast, taught alongside a Cypriot school enrolment, with the recorded library carrying the season.',
      cbc: 'Kenya CBC available for eastern coast families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies across the district and it is contested. Education is administered by the Ministry of Education, Sports and Youth, full-time education is compulsory for children aged 5 to 15, and private schools require Ministry approval. On elective home education the readings conflict — restricted to special educational needs, disability or serious health problems with Ministry-approved teachers on the national curriculum; or legal but stringently regulated by permission; or not formally recognised with no official approval process; with at least one comparative source listing Cyprus among countries that prohibit it. We present all readings and resolve none, and note that home-educated students must meet the same university admission requirements as traditionally schooled ones. Confirm with the Ministry. Smartious is not a MoECSY-approved school and issues no Cypriot qualification.',
    homeTuitionDetail: 'Smartious delivers to eastern coast families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, effectively across our whole teaching day given the near-zero offset, with the full recorded library carrying the season.',
    faqs: [
      { q: 'Our family works the tourism season — can schooling fit?', a: 'It is built for it: live classes at whatever hour suits, including evenings, plus a complete recorded library so the academic year holds through the busiest months.' },
      { q: 'Is there international schooling in the district?', a: 'Minimal, with Larnaca and Nicosia both a drive away. Live delivery reaches Ayia Napa, Protaras and Paralimni identically.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const CYPRUS_COUNTRY = {
  slug: 'cyprus',
  name: 'Cyprus',
  longName: 'Republic of Cyprus',
  adjective: 'Cypriot',
  flag: '🇨🇾',
  hub: '/online-school/cyprus',
  hubPageId: 'homeschooling-cyprus',
  cityPageId: 'cyprus-city',

  currency: 'EUR',
  currencyName: 'Euro',
  currencyPeg: 'Fees are invoiced in USD; euro equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'EET / EEST',
    name: 'Eastern European Time (UTC+2), moving to Eastern European Summer Time (UTC+3) for the summer',
    utcOffset: '+2 / +3',
    offsetFromEAT: 'One hour behind our teaching base in winter and exactly level in summer — among the closest in our coverage',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Cyprus has long-established Cambridge provision through one of the largest private school sectors per head in our coverage'],
  examCentreTiles: [
    { city: 'Nicosia', centre: 'Authorised provision', area: 'Deep external-candidate capacity, confirmed per family per session.' },
    { city: 'Limassol and Larnaca', centre: 'Regional provision', area: 'Checked first for coastal and southern families.' },
    { city: 'Paphos and the east', centre: 'Planned per session', area: 'Western and eastern district families plan travel into each window ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Cyprus-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Cyprus is one of the easier markets in our coverage for this: the private school sector has run IGCSE and A-Level for generations, so provision and familiarity are both long established, and the island is small enough that examination travel is a handful of short journeys a year. Nicosia is checked first, with Limassol and Larnaca for coastal families and travel planned ahead from Paphos and the eastern district. Note what does not change: our arrangement runs alongside a Cypriot school, which continues its own track unchanged. Smartious is not a MoECSY-approved school and issues no Cypriot qualification — what we teach carries Cambridge, Pearson Edexcel, IB or AP validity instead.',
  secondaryProgrammeExamRef: 'Authorised Cypriot Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/cyprus.jpg',
  heroEyebrow: 'Online school for Cyprus',
  heroH1Suffix: 'Cyprus',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for shipping, fintech, expatriate and Cypriot families across Nicosia, Limassol, Larnaca, Paphos and the eastern coast. Cypriot sources genuinely disagree about elective home education — we set out every reading rather than picking one — and Cyprus sits within an hour of our teaching clock all year.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — no waitlist, alongside your Cypriot school.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Cyprus',

  citiesSectionTitle: 'Where our Cyprus families are',
  citiesSectionBody: 'Smartious Cyprus families concentrate across Nicosia (the capital, the academic centre and some of the oldest British-curriculum schools in the eastern Mediterranean), Limassol (one of the world\'s largest ship management centres, with fintech and a very internationally mixed resident community), Larnaca (the island\'s gateway, growing faster than its schools), Paphos (a British and northern European residential belt decades old, spread across a wide district), and the Famagusta district (a concentrated tourism economy with minimal local provision). One genuinely disputed legal question, one very deep private school sector, and almost no timezone at all.',

  trustSignals: [
    { h: 'A disputed question, described as disputed', p: 'Cypriot and international sources reach sharply different conclusions about elective home education — restricted to special educational needs and health grounds, or permitted but stringently regulated, or not formally recognised at all. We set out every reading and send families to the Ministry rather than choosing the convenient one.' },
    { h: 'Honest that Cyprus got here first', p: 'The island has one of the largest private and international school sectors per head in our coverage, much of it British-curriculum and teaching IGCSE and A-Level for generations. We are not introducing Cambridge to Cyprus — we supplement it.' },
    { h: 'Almost no timezone at all', p: 'Cyprus runs UTC+2 in winter and UTC+3 in summer against our UTC+3 year-round — one hour behind in winter and exactly level in summer. Effectively our whole teaching day is available.' },
    { h: 'No waitlist', p: 'Mid-year arrivals start within a week of the assessment. In Limassol and Larnaca, where demand has grown faster than places, that is frequently the deciding factor.' },
  ],

  universitiesInCountry: 'the University of Cyprus, the Cyprus University of Technology, the Open University of Cyprus, and a substantial private sector including the University of Nicosia, European University Cyprus and Frederick University — much of it teaching in English and drawing students from across the region.',
  universityChannels: 'Cypriot universities admit on the Apolytirion together with entrance examinations for public institutions, while the large private sector teaching in English admits international qualifications directly. As an EU member state, Cyprus also places students across European universities, and Greek institutions are a long-standing route. Outward, Cypriot and resident students apply in numbers to the United Kingdom — where UCAS reads Cambridge A-Levels natively and where the historical ties run deep — as well as to Greece, other EU states, and the United States, all of which read A-Levels, the IB Diploma and AP records directly. A-Levels are accepted in 160+ countries. One risk worth naming: home-educated students must meet the same university admission requirements as traditionally schooled ones, which is precisely why an externally examined record matters. Smartious provides personalised university guidance across UK (UCAS), EU, Greek, US and Cypriot destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Cyprus families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes at effectively any hour of our teaching day — Cyprus is one hour behind us in winter and level in summer — run alongside a Cypriot school enrolment that continues its own track unchanged. Cambridge Greek and Russian available beside the English-medium core, which matters more here than in most markets. No waitlist for mid-year starts.',
  britishCurriculumSuits: 'Cyprus families targeting the Cambridge pathway. Best fit for: (1) students needing a subject their school cannot staff for a small cohort, (2) Limassol and Larnaca families arriving mid-year to full schools, (3) Paphos and eastern district households where local provision is short, (4) families who may return to the UK and want a record UCAS reads natively, (5) internationally mobile shipping and fintech households whose next posting may be elsewhere.',
  britishCurriculumDelivery: 'Live online classes at effectively any hour of our teaching day, small groups 4-6 students, every session recorded, alongside a Cypriot school enrolment.',
  ibDiplomaSuits: 'Cyprus families in the island\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Cyprus families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Cyprus is one of the few markets where the British curriculum arrived long before we did and where the private school sector is unusually deep for the population — which shapes what we sensibly offer, and what we do not claim.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Limassol\'s maritime and fintech households and every medicine-bound student in Nicosia. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Cyprus has one of the largest private and international school sectors per head anywhere in our coverage — The English School and the American Academy in Nicosia, the Grammar School, Falcon, Heritage, Foley\'s, Pascal, The Island Private School, Silvertree, King\'s School Paphos and Aspire among many others — much of it British-curriculum and teaching IGCSE and A-Level for generations. Those are established institutions and we would not pretend to improve on them. The gaps are specific: subject sets no single timetable can sustain, places in Limassol and Larnaca that fill faster than families arrive, and districts in the west and east where the local list is short.',
  competitors: [
    { name: 'The English School and the American Academy',      city: 'Nicosia',               curriculum: 'British, IGCSE, A-Level and American',  feesUsd: 'Established tier',                                  feesAed: 'Competitive places',      rating: 4.7, capacityNote: 'Generations of Cambridge teaching — the island benchmark' },
    { name: 'The Island Private School, Pascal, Heritage, Foley\'s', city: 'Limassol and island-wide', curriculum: 'British and international',      feesUsd: 'Mid to premium tier',                               feesAed: 'Demand exceeds places',   rating: 4.5, capacityNote: 'A deep and growing sector — and in Limassol, places fill faster than families arrive' },
    { name: 'King\'s School Paphos and the western schools',    city: 'Paphos',                curriculum: 'British curriculum',                    feesUsd: 'Mid tier',                                          feesAed: 'Limited places',          rating: 4.3, capacityNote: 'A short list for a large and long-established residential community' },
    { name: 'The Famagusta district',                           city: 'Eastern coast',         curriculum: 'Minimal',                               feesUsd: 'Little international option',                       feesAed: '—',                       rating: 0,   capacityNote: 'A concentrated tourism economy with very little local provision' },
    { name: 'Private tuition (frontistiria and tutors)',        city: 'Island-wide',           curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Widespread',              rating: 4.0, capacityNote: 'The default answer to a subject gap — usually one-to-one and unstructured across a year' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh (online)',  city: 'Online',                curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious — and UK providers are close to Cyprus on the clock, which families should weigh' },
    { name: 'Smartious Homeschool (Cyprus via online delivery)', city: 'Delivered island-wide', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP',   feesUsd: 'USD 2,160-6,480/year',                              feesAed: 'EUR equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + no waitlist + the sets a timetable cannot staff + all three legal readings set out + Paphos and the east reached' },
  ],

  legalFrameworkIntro: 'Cyprus is one of the few countries where we cannot give a single answer, because the available sources give at least three different ones. Here is what is agreed, what is disputed, and what follows.',
  legalFramework: [
    { h: 'What is agreed', p: 'Education is administered by the Ministry of Education, Sports and Youth. The system runs pre-primary education from three to six, primary from six to twelve and secondary from twelve to eighteen, and full-time education is compulsory for children aged five to fifteen — one source gives the lower bound more precisely as five years and eight months, and families should confirm the boundaries applying to their own child with the Ministry. Private schools require Ministry approval. None of that is in dispute.' },
    { h: 'What is disputed — three readings, and a fourth position', p: 'The first reading holds that home education is legal only for students at pre-primary, primary and secondary levels who have special educational needs, a form of disability or serious health problems; that general elective homeschooling is not permitted; and that where it is approved, only Ministry-approved teachers may deliver instruction, based on the national curriculum. The second holds that home education is legal but stringently regulated, with parents applying to the Ministry for permission, submitting a curriculum aligned to the national one and accepting regular assessments. The third holds that the Education Law addresses formal schooling rather than alternative approaches, so home education is not technically illegal but is not formally recognised either — with no official approval process and no standardised framework to follow. And at least one comparative source simply lists Cyprus among countries that prohibit homeschooling. Those cannot all be right, and we are not in a position to say which is.' },
    { h: 'What that means for a family', p: 'It means the answer has to come from the Ministry of Education, Sports and Youth rather than from any provider, and it should come in a form you can keep. Any online school that tells a Cypriot family the position is settled is telling them something the available sources do not support. One source reports approximately 200 to 300 families practising some form of home education, noting that exact numbers are hard to verify given the absence of an official registry, and that campaigns have sought clearer legal status with preliminary ministerial discussion reported but no concrete change. We pass that on as reported rather than as a basis for planning.' },
    { h: 'The risk that applies whichever reading is right', p: 'One point cuts across all of them and deserves stating separately: home-educated students in Cyprus must meet the same university admission requirements as traditionally schooled students. There is no separate or easier route. That is precisely why an externally examined record matters here — Cambridge IGCSE and A-Level, Pearson Edexcel, the IB Diploma and AP are set and marked by independent boards, which is exactly the kind of evidence a university admissions office is looking for from any applicant, home-educated or otherwise.' },
    { h: 'What we therefore build, and what we are not', p: 'Live Cambridge or IB teaching alongside a Cypriot school enrolment. Where readings conflict this sharply, we build only the arrangement that none of them puts in question — the school carries the compulsory-education duty and the domestic record, and we teach the internationally examined track alongside it. Smartious is not a MoECSY-approved school, does not operate premises in Cyprus, and issues no Cypriot qualification.' },
    { h: 'Honest about a market that arrived first, and the clock', p: 'Two closing points. Cyprus has one of the largest private and international school sectors per head in our entire coverage, much of it British-curriculum and teaching IGCSE and A-Level for generations. We are not introducing Cambridge to this island and would not pretend to; what we add is the subject sets no single timetable can sustain, places for families who arrive mid-year to full schools, and reach into the western and eastern districts where the local list is short. And on timing: Cyprus runs UTC+2 in winter and UTC+3 in summer against our UTC+3 year-round, so we are one hour apart in winter and exactly level in summer. Effectively the whole teaching day is available — after-school, mid-morning or evening all work, which suits a hospitality household in Protaras as readily as a professional one in Nicosia.' },
  ],

  whySmartious: [
    { h: 'Three legal readings, all set out',                             p: 'Restricted to special educational needs, or permitted but stringent, or not formally recognised — Cypriot and international sources disagree, and we present all of it rather than the convenient version.' },
    { h: 'Honest that Cyprus taught Cambridge first',                     p: 'One of the largest private school sectors per head in our coverage, running IGCSE and A-Level for generations. We supplement it.' },
    { h: 'The set your timetable cannot staff',                           p: 'Further Mathematics or a third science for four pupils is unviable at one school and routine in a live group drawn from several countries.' },
    { h: 'No waitlist',                                                   p: 'Mid-year arrivals start within a week of the assessment — which in Limassol and Larnaca is frequently the whole decision.' },
    { h: 'Greek and Russian as examined subjects',                        p: 'Home languages become qualifications rather than staying household ones, which matters in a market this internationally mixed.' },
    { h: 'Almost no timezone at all',                                     p: 'One hour behind in winter, level in summer — evenings included, which suits seasonal and hospitality households.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Cyprus?', a: 'Sources genuinely conflict. One reading limits it to students with special educational needs, a disability or serious health problems, with Ministry approval and Ministry-approved teachers delivering the national curriculum. Another describes it as legal but stringently regulated by permission, with an aligned curriculum and regular assessments. A third describes it as not formally recognised, with no official approval process or standardised framework. At least one comparative source lists Cyprus among countries that prohibit it. Confirm your own position with the Ministry of Education, Sports and Youth.' },
    { q: 'Why will you not just give a straight answer?', a: 'Because the available sources give at least three different ones, and a family that plans a school year on the wrong one loses more than a subscription. Any provider claiming the position is settled is going beyond what the sources support.' },
    { q: 'Do home-educated students get an easier university route?', a: 'No. Home-educated students must meet the same university admission requirements as traditionally schooled ones. That is exactly why an externally examined Cambridge, Edexcel, IB or AP record is worth holding.' },
    { q: 'Is Smartious approved by the Ministry?', a: 'No. Private schools in Cyprus require Ministry approval and we do not hold it. We work alongside a Cypriot school that does, and teach internationally examined qualifications.' },
    { q: 'Cyprus already has excellent British-curriculum schools — what do you add?', a: 'Deliberately little: a subject set your timetable cannot staff, a place if you arrive mid-year to a full school, and reach into Paphos and the eastern district where the list is short. If your school covers what your child needs, we will say so.' },
    { q: 'How does the timezone work?', a: 'Cyprus runs UTC+2 in winter and UTC+3 in summer against our UTC+3 year-round — one hour apart in winter and exactly level in summer. Effectively our whole teaching day is available, evenings included.' },
    { q: 'Can our child keep Greek or Russian formally?', a: 'Yes. Cambridge Greek and Russian run alongside the English-medium core as examined subjects, which is more useful at university application than fluency alone.' },
    { q: 'Which parts of Cyprus does Smartious cover?', a: 'Nicosia, Limassol, Larnaca, Paphos and the Famagusta district have dedicated pages. Live online delivery works identically anywhere in the areas we serve.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which subjects your school cannot offer and when you need to start: in Cyprus those two answers usually decide whether we are useful to you at all.',
}
