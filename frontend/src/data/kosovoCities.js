// ═══════════════════════════════════════════════════════════════════
// KOSOVO — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for diaspora, expat, tech, and Kosovar families
// across Prishtina, Prizren, Peja, Gjakova, Ferizaj and Gjilan.
// COMPLETES THE WESTERN BALKANS.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent, the component's onError handler hides the image and the
// ink→crimson gradient shows. Do NOT paste in guessed stock-photo
// IDs — an unverified ID either 404s or shows the wrong place.
//
// EDITORIAL NOTE — READ FIRST AND FOLLOW EXACTLY:
// Kosovo's political status is contested internationally. These
// pages are commercial education pages and must remain STRICTLY
// NEUTRAL. Rules:
// - Describe the education system, the market, and the economy.
//   NEVER comment on status, recognition, statehood, borders, the
//   1998-99 conflict, or relations with any neighbouring country.
// - Use institutional names as they officially exist (MASHTI, DKA,
//   Law No. 04/L-032) without commentary.
// - We do NOT include a Mitrovica page. The city's administration is
//   the subject of ongoing political arrangements that we cannot
//   describe without taking a position, and a schooling page is the
//   wrong place to attempt it. Five other cities cover the market.
// - Language: teaching is delivered in Albanian and, for
//   communities, in Serbian, Bosnian, Turkish and others. Mention
//   only where practically useful to a family choosing subjects.
//   Never as politics.
// If any future edit would require characterising a political
// dispute to make sense, cut the sentence instead.
//
// LEGAL POSITIONING NOTE:
// - The Law on Pre-University Education in the Republic of Kosovo
//   (Law No. 04/L-032, Official Gazette No. 17, 16 September 2011)
//   regulates pre-university education from ISCED level 0 to 4. The
//   ministry is MASHTI; municipalities run schools through their
//   Municipal Education Directorates (DKA).
// - COMPULSORY: primary (grades 1-5) and lower secondary (grades
//   6-9) are compulsory for all. Municipalities must establish and
//   maintain schools at these levels in every municipality, and must
//   ensure provision in all languages of instruction even below
//   minimum enrolment thresholds, or provide alternatives including
//   subsidised transport.
// - THE WINDOW — WELL ATTESTED, USE IT: upper secondary (three or
//   four years, general or vocational) is VOLUNTARY. So the A-Level
//   years sit outside compulsory education entirely, from around 15.
// - PARENTAL HOME EDUCATION: we are not aware of an established
//   parental-choice home-education route under the Law on
//   Pre-University Education. PHRASE IT THAT WAY — "not established
//   / we are not aware of" plus "confirm with MASHTI and your
//   municipal education directorate (DKA)" — rather than asserting
//   a flat prohibition we cannot fully evidence.
// - CONSEQUENCE: SUPPLEMENTARY is the default for the compulsory
//   grades; the full pathway opens for the voluntary upper-secondary
//   phase.
// - ASSESSMENT LANDMARKS: the semimatura achievement test after
//   grade 9 (orienting in character) and the State Matura at the end
//   of upper secondary (certifying). Useful for explaining what a
//   family keeps or leaves.
// MARKET NOTE: Kosovo has the youngest population in Europe and one
// of the largest diasporas relative to population — Germany,
// Switzerland, Austria above all — with remittances a major share of
// the economy and a very large summer return. English proficiency
// among the young is comparatively high. RIT Kosovo (A.U.K) awards
// US-accredited degrees taught in English and is the strongest
// domestic destination for an internationally examined record;
// UBT and Universum also teach in English. International schooling
// otherwise concentrates in Prishtina — the American School of
// Kosova, International School of Prishtina, Mehmet Akif and peers —
// with essentially nothing outside it. Economy: a fast-growing IT
// and outsourcing sector, construction and real estate, Prizren's
// heritage tourism and Dokufest, Peja's Rugova mountains, Ferizaj's
// manufacturing near the airport, and agriculture across the plain.
// TIMEZONE: CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind
// Nairobi EAT, the standard European framing.
// ═══════════════════════════════════════════════════════════════════

export const KOSOVO_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'prishtina-xk',
    name: 'Prishtina',
    county: 'Prishtina Municipality',
    region: 'Capital · a fast-growing IT and outsourcing sector · RIT Kosovo (A.U.K) and the English-taught universities · the diplomatic community · the country\'s entire international-school tier',
    primaryKeyword: 'Online school and international curriculum in Prishtina',
    heroTagline: 'For Prishtina families — Europe\'s youngest capital, an English-taught university sector, and school provision that has not caught up with either.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Prishtina families. Prishtina is the centre of one of Europe\'s youngest and fastest-changing economies — a technology and outsourcing sector that has grown quickly on the back of strong English among young professionals, a construction and services boom, the diplomatic and development community, and an unusually strong English-medium university tier led by RIT Kosovo (A.U.K), which awards US-accredited degrees. It also holds essentially all of the country\'s international schooling. Under the Law on Pre-University Education, grades 1 to 9 are compulsory, so our clean default for those years is supplementary — your enrolment carries the obligation while we teach the international track live alongside it — with the full pathway opening for the voluntary upper-secondary phase.',
    heroImg: '/heroes/prishtina-xk.jpg',
    altTexts: { hero: 'Prishtina city centre' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Prishtina families — supplementary through grades 1-9, full pathway for the voluntary upper-secondary years. From USD 400/month.',
    challenges: [
      'Grades 1 to 9 are compulsory under the Law on Pre-University Education, and we are not aware of an established parental home-education route.',
      'The international tier is small, concentrated in the capital, and priced at the top of the local market.',
      'A large diaspora means children arriving mid-curriculum from German, Swiss, and Austrian systems with no matching route locally.',
      'The national upper-secondary route leads to the State Matura rather than to UCAS or the Common Application.',
      'Time zone: Kosovo runs CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT, so live teaching lands inside the school day.',
    ],
    familySituations: [
      'IT, outsourcing, and technology families in the capital\'s growing sector.',
      'Diplomatic, development, and international-organisation families.',
      'Returning diaspora families from Germany, Switzerland, and Austria.',
      'Families outside the international tier\'s fees or capacity, supplementing a local enrolment.',
      'Students aiming at RIT Kosovo (A.U.K) or other English-taught programmes.',
      'Students past grade 9 running the full A-Level phase, which sits outside compulsory education.',
    ],
    nearbyAreas: ['Prishtina centre', 'Dardania', 'Ulpiana', 'Matiçan', 'Fushë Kosovë', 'Obiliq', 'Podujeva'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Turkish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), RIT Kosovo (A.U.K) and the English-taught domestic programmes, and German, Swiss, Austrian and wider EU university applications',
    ],
    whyChoose: [
      ['A record the local English-taught universities read directly', 'RIT Kosovo (A.U.K) awards US-accredited degrees in English; Cambridge A-Levels and the IB are exactly the qualifications such programmes are built to read.'],
      ['The Cambridge track beside a small tier', 'Live small-group teaching at USD 2,160-6,480 a year — the supplement, the waitlist bridge, or the alternative for families outside the capital tier.'],
      ['Built for the diaspora return', 'A child arriving mid-curriculum from Germany, Switzerland, or Austria keeps one internationally examined pathway instead of restarting inside a new system.'],
      ['Computing depth for a young tech economy', 'Cambridge A-Level Computer Science, Mathematics, and Further Mathematics — led by a founder with a BEd in Mathematics and Physics — suit the sector that is defining Prishtina.'],
      ['Timezone that lands in the school day', 'Prishtina is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Prishtina anchors one of Europe\'s youngest economies — a fast-growing IT and outsourcing sector, a strong English-medium university tier led by RIT Kosovo (A.U.K), and the diplomatic community — while holding essentially all the country\'s international schooling. Kosovo runs CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Prishtina families: supplementary alongside a school enrolment during grades 1 to 9, and the full pathway through the voluntary upper-secondary years. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Prishtina families with East African ties.',
      ib: 'IB Diploma Programme — supplements and support alongside the capital\'s campus routes.',
      american: 'American Curriculum with AP — for families targeting American universities, including via RIT Kosovo (A.U.K).',
    },
    homeschoolDetail: 'Under the Law on Pre-University Education in the Republic of Kosovo (Law No. 04/L-032), primary education in grades 1 to 5 and lower secondary education in grades 6 to 9 are compulsory for all children, and municipalities are required to establish and maintain schools at those levels — including, where enrolment falls below the minimum, providing alternatives such as subsidised transport. We are not aware of an established parental-choice home-education route under that law, and we state it that way rather than asserting a flat prohibition we cannot fully evidence: a family considering it should confirm the current position with MASHTI and their municipal education directorate. What the law clearly leaves open is substantial. Structured education alongside a school enrolment is unrestricted, and that is our clean default for the compulsory grades. And upper secondary — three or four years, general or vocational, ending in the State Matura — is voluntary, so from around fifteen the A-Level years sit entirely outside compulsory education. Families not resident in Kosovo follow their country of residence\'s framework, a status they determine with their own advisers.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation for Prishtina families during examination preparation periods, subject to associate teacher availability.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes land inside the Prishtina school day given the 1-2 hour offset — the after-school slot for supplementary students — with every session recorded for unlimited rewatch.',
    faqs: [
      { q: 'Is homeschooling legal in Kosovo?', a: 'Grades 1 to 9 are compulsory under the Law on Pre-University Education, and we are not aware of an established parental-choice home-education route under that law — a position worth confirming with MASHTI and your municipal education directorate. What is clearly open: structured study alongside a school enrolment, and the upper-secondary years, which are voluntary.' },
      { q: 'So how does Smartious work during the compulsory grades?', a: 'Supplementary. Your child stays enrolled at their school, which carries the legal obligation entirely, and takes Cambridge or IB subjects with us live in the after-school slot — building toward external examinations at authorised centres.' },
      { q: 'What changes after grade 9?', a: 'Upper secondary is voluntary in Kosovo, so from around fifteen the A-Level years run entirely at the family\'s choice, with no attendance obligation to satisfy.' },
      { q: 'Will RIT Kosovo (A.U.K) accept A-Levels or the IB?', a: 'Those programmes are taught in English and award US-accredited degrees, so an internationally examined record is exactly what they are built to read — with entry requirements confirmed with the institution per programme. The same record feeds UCAS and the Common Application.' },
      { q: 'Where do Prishtina students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with regional options where local capacity is limited.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'prizren-xk',
    name: 'Prizren',
    county: 'Prizren Municipality',
    region: 'The historic and cultural capital · Dokufest and a heritage tourism economy · a multilingual city · the Šar mountains and the Albanian border · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Prizren',
    heroTagline: 'For Prizren families — the country\'s cultural capital, internationally visited every summer and internationally schooled never.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Prizren families. Prizren is Kosovo\'s historic and cultural capital — an Ottoman-era old town beneath a hilltop fortress, a genuinely multilingual civic life, the Dokufest documentary festival that brings international visitors and filmmakers every August, and a heritage tourism economy that has grown steadily. The Šar mountains and the Albanian border sit close by, and Prizren\'s diaspora ties to Switzerland and Germany are among the strongest in the country. What the city does not have is international schooling. Smartious delivers the international pathways live — supplementary alongside your school enrolment during the compulsory grades, and full-time through the voluntary upper-secondary years.',
    heroImg: '/heroes/prizren-xk.jpg',
    altTexts: { hero: 'Prizren old town beneath the fortress' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Prizren families — cultural capital and tourism economy, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling in the country\'s second city, with Prishtina an hour and a half away.',
      'Grades 1 to 9 are compulsory; the supplementary configuration carries those years.',
      'A summer festival and tourism season that runs the household from June to September.',
      'Strong diaspora ties mean children returning mid-curriculum from Swiss and German systems.',
      'Time zone: Prizren shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Heritage tourism, hospitality, and festival-economy families.',
      'Returning diaspora families from Switzerland, Germany, and Austria.',
      'Multilingual households wanting an English-medium academic track alongside.',
      'Business and trade families toward the Albanian border.',
      'Students past grade 9 running the full A-Level phase.',
    ],
    nearbyAreas: ['Prizren', 'the old town and Kalaja', 'Suharekë', 'Rahovec', 'Dragash', 'Malishevë', 'the Albanian border at Morina'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Turkish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography, History',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), RIT Kosovo (A.U.K), and Swiss, German and Austrian university applications',
    ],
    whyChoose: [
      ['The complete option in a city with none', 'Identical live delivery in Prizren and Prishtina — no relocation, no daily commute.'],
      ['Built for the season', 'Live classes plus unlimited recordings hold the academic year together through the summer festival and tourism months.'],
      ['A record that reads where the family already is', 'Cambridge A-Levels are assessed routinely by Swiss, German, and Austrian universities as well as by UCAS — which matters where so many relatives already live.'],
      ['The law stated before anything is sold', 'Grades 1 to 9 are compulsory; we run supplementary alongside your enrolment and reserve the full pathway for the voluntary upper-secondary years.'],
      ['Timezone that lands in the school day', 'Prizren is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Prizren is Kosovo\'s historic and cultural capital — an Ottoman old town beneath its fortress, a multilingual civic life, the Dokufest festival, and a growing heritage tourism economy with strong Swiss and German diaspora ties — and no international schooling. Prizren shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Prizren: supplementary during the compulsory grades, full pathway through the voluntary upper-secondary years. Examinations at authorised centres confirmed per session, Prishtina an hour and a half away.',
      cbc: 'Kenya CBC available for Prizren families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Prizren: grades 1 to 5 and 6 to 9 are compulsory under the Law on Pre-University Education, with municipalities required to provide schooling at those levels, and we are not aware of an established parental-choice home-education route — a position to confirm with MASHTI and the municipal education directorate. The supplementary configuration therefore carries the compulsory grades, with the recorded library carrying the summer season, and upper secondary is voluntary so the A-Level years sit outside the obligation entirely.',
    homeTuitionDetail: 'In-person tuition supplementation in Prizren is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the Prizren school day on the 1-2 hour offset, with the full recorded library carrying the festival and tourism season.',
    faqs: [
      { q: 'Is there international schooling in Prizren?', a: 'No — the country\'s provision sits in Prishtina, an hour and a half away. Live online delivery is the complete option, supplementary during the compulsory grades and full-time through upper secondary.' },
      { q: 'We are returning from Switzerland mid-curriculum — what are our options?', a: 'Enrol locally, which carries the legal obligation, and keep the international pathway running alongside. The curriculum, teachers, and examination board continue across the move rather than restarting.' },
      { q: 'Where do Prizren students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with Prishtina an hour and a half away.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'peja-xk',
    name: 'Peja & the Rugova Valley',
    county: 'Peja Municipality',
    region: 'The western gateway · the Rugova canyon and the Accursed Mountains · a growing adventure-tourism economy · the Peja brewing and food industry · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Peja',
    heroTagline: 'For Peja and Rugova families — mountains that draw the world in summer, and schooling that stops at the valley mouth.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Peja and Rugova valley families. Peja sits at the western edge of the plain where the Accursed Mountains rise — the Rugova canyon behind it has become one of the region\'s fastest-growing adventure-tourism destinations, on the Peaks of the Balkans trail that runs into Albania and Montenegro, while the city itself carries a brewing and food-industry tradition and a strong diaspora economy. The mountains bring international visitors; nothing brings international schooling. Smartious delivers the pathways live across the west — supplementary alongside your school enrolment during the compulsory grades, and full-time through the voluntary upper-secondary years.',
    heroImg: '/heroes/peja-xk.jpg',
    altTexts: { hero: 'The Rugova canyon and the mountains above Peja' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Peja and Rugova families — adventure tourism and mountain economy, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling in the west, with Prishtina around an hour and a half east.',
      'Grades 1 to 9 are compulsory; the supplementary configuration carries those years.',
      'A trekking and tourism season that runs the household through summer.',
      'Mountain and valley geography puts any campus option out of reach.',
      'Time zone: Peja shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Adventure-tourism, guesthouse, and hospitality families across Rugova.',
      'Brewing, food-industry, and manufacturing families in the city.',
      'Returning diaspora families from Switzerland, Germany, and Austria.',
      'Mountain-sport families whose training will not fit a fixed timetable.',
      'Students past grade 9 running the full A-Level phase.',
    ],
    nearbyAreas: ['Peja', 'the Rugova canyon', 'Deçan', 'Istog', 'Klina', 'Junik', 'the Montenegrin border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Environmental Science, AP Biology',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), RIT Kosovo (A.U.K), and Swiss, German and Austrian university applications',
    ],
    whyChoose: [
      ['The complete option where no campus exists', 'Identical live delivery from Peja to the Rugova villages — the international pathway the west never had.'],
      ['Built for the season and for mountain sport', 'Live classes plus unlimited recordings hold the academic pace through the trekking summer and a competition calendar.'],
      ['Geography and environmental science that fit the place', 'The Accursed Mountains and the Rugova canyon make unusually good context for Cambridge Geography and AP Environmental Science.'],
      ['The law stated before anything is sold', 'Grades 1 to 9 are compulsory; we run supplementary alongside your enrolment and reserve the full pathway for the voluntary upper-secondary years.'],
      ['Timezone that lands in the school day', 'Peja is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Peja sits where the plain meets the Accursed Mountains — the Rugova canyon behind it now a fast-growing adventure-tourism destination on the Peaks of the Balkans trail, with a brewing and food-industry tradition in the city — and no international schooling anywhere in the west. Peja shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the west: supplementary during the compulsory grades, full pathway through the voluntary upper-secondary years. Examination sittings planned per session with Prishtina travel scheduled ahead.',
      cbc: 'Kenya CBC available for western families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Peja: grades 1 to 9 are compulsory under the Law on Pre-University Education, with municipalities required to provide schooling at those levels and to offer alternatives such as subsidised transport where enrolment is thin — a provision that matters in valley communities. We are not aware of an established parental-choice home-education route, and families considering one should confirm with MASHTI and the municipal education directorate. The supplementary configuration carries the compulsory grades, and upper secondary is voluntary so the A-Level years sit outside the obligation.',
    homeTuitionDetail: 'In-person tuition supplementation in the west is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the local school day on the 1-2 hour offset, with the full recorded library carrying the trekking season.',
    faqs: [
      { q: 'Our family runs a guesthouse through the trekking season — can schooling fit that?', a: 'It is built for it: live classes with a complete recorded library, so the academic year holds together through the busiest months.' },
      { q: 'Is there international schooling in Peja or Rugova?', a: 'None — Prishtina is around an hour and a half east. Live online delivery is the complete option for the west.' },
      { q: 'Where do western families sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, typically Prishtina windows planned ahead.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'gjakova-xk',
    name: 'Gjakova',
    county: 'Gjakova Municipality',
    region: 'The old bazaar city of the Dukagjini plain · a craft and trade tradition · one of the strongest diaspora economies in the country · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Gjakova',
    heroTagline: 'For Gjakova families — a city half of whose extended families live in Germany and Switzerland, and whose schools prepare for neither.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Gjakova families. Gjakova sits on the Dukagjini plain around one of the region\'s great old bazaars — a craft and trade city with a long commercial tradition, an airport nearby, and one of the strongest diaspora economies in the country: a large share of families here have relatives established in Germany, Switzerland, and Austria, with children who split their lives between the two. What the city does not have is any schooling that prepares a child for a future in those countries or anywhere else internationally. Smartious delivers the pathways live — supplementary alongside your school enrolment during the compulsory grades, and full-time through the voluntary upper-secondary years.',
    heroImg: '/heroes/gjakova-xk.jpg',
    altTexts: { hero: 'The old bazaar at Gjakova' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Gjakova families — strong diaspora economy, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling in the city, with Prishtina around ninety minutes away.',
      'Children moving between Kosovo and German-speaking countries face two systems and no bridge.',
      'Grades 1 to 9 are compulsory; the supplementary configuration carries those years.',
      'Exam sittings mean Prishtina windows, planned ahead.',
      'Time zone: Gjakova shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Diaspora-connected families with children moving between Kosovo and German-speaking countries.',
      'Craft, trade, and small-manufacturing business families.',
      'Agricultural and agribusiness families across the Dukagjini plain.',
      'Returning families settling children mid-curriculum.',
      'Students past grade 9 running the full A-Level phase.',
    ],
    nearbyAreas: ['Gjakova', 'the old bazaar', 'Rahovec', 'Deçan', 'Junik', 'Malishevë', 'the Albanian border at Qafë Prush'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), RIT Kosovo (A.U.K), and German, Swiss and Austrian university applications',
    ],
    whyChoose: [
      ['One pathway for a family living in two countries', 'Children who move between Gjakova and Germany or Switzerland keep a single curriculum, teaching team, and examination board rather than restarting each time.'],
      ['German alongside the academic core', 'Where so many futures run through German-speaking countries, Cambridge German sits naturally beside the English-medium track.'],
      ['The complete option in a city with none', 'Identical live delivery in Gjakova and Prishtina, with the capital needed only for examinations.'],
      ['The law stated before anything is sold', 'Grades 1 to 9 are compulsory; we run supplementary alongside your enrolment and reserve the full pathway for the voluntary upper-secondary years.'],
      ['Timezone that lands in the school day', 'Gjakova is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Gjakova sits on the Dukagjini plain around one of the region\'s great old bazaars — a craft and trade city with one of the strongest diaspora economies in the country, tying families closely to Germany, Switzerland, and Austria — and no international schooling. Gjakova shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Gjakova and the Dukagjini plain: supplementary during the compulsory grades, full pathway through the voluntary upper-secondary years. Examinations at authorised centres confirmed per session.',
      cbc: 'Kenya CBC available for Gjakova families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Gjakova: grades 1 to 9 are compulsory under the Law on Pre-University Education, and we are not aware of an established parental-choice home-education route — a position to confirm with MASHTI and the municipal education directorate. The supplementary configuration carries the compulsory grades, and upper secondary is voluntary so the A-Level years sit outside the obligation. For families splitting time between Kosovo and a German-speaking country, note that education law follows residence: a child resident in Germany, Switzerland, or Austria is under that country\'s framework, each of which differs, and that question belongs with the family\'s own advisers.',
    homeTuitionDetail: 'In-person tuition supplementation in Gjakova is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the Gjakova school day on the 1-2 hour offset, with every session recorded.',
    faqs: [
      { q: 'Our children move between Kosovo and Switzerland — how does that work?', a: 'The curriculum, teachers, and examination board stay constant wherever the family is, with examinations sat at authorised centres in either country. Only the local legal framework changes, and education law follows residence — a question for your own advisers.' },
      { q: 'Is there international schooling in Gjakova?', a: 'No — Prishtina is around ninety minutes away. Live online delivery is the complete option, run supplementary alongside your school enrolment.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'ferizaj-xk',
    name: 'Ferizaj',
    county: 'Ferizaj Municipality',
    region: 'The industrial and logistics city on the north-south corridor · manufacturing and trade near the international airport · a young and fast-growing population · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Ferizaj',
    heroTagline: 'For Ferizaj families — the corridor city, minutes from the airport and outside everything the capital offers.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Ferizaj families. Ferizaj grew up on the north-south corridor and has become one of Kosovo\'s manufacturing and logistics centres — furniture, plastics, food processing, and trade, with the international airport a short drive north and the routes toward North Macedonia running south. Its population is young even by Kosovar standards and growing quickly. Prishtina\'s small international tier is forty minutes away, which is close enough to consider and far enough not to serve the city. Smartious delivers the international pathways live — supplementary alongside your school enrolment during the compulsory grades, and full-time through the voluntary upper-secondary years.',
    heroImg: '/heroes/ferizaj-xk.jpg',
    altTexts: { hero: 'Ferizaj city centre on the central corridor' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Ferizaj families — manufacturing and logistics corridor, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling in a fast-growing manufacturing city, with Prishtina forty minutes away and priced at capital level.',
      'Grades 1 to 9 are compulsory; the supplementary configuration carries those years.',
      'Manufacturing and trade families with export ties and no matching English-medium schooling.',
      'Exam sittings mean Prishtina windows, planned ahead.',
      'Time zone: Ferizaj shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Manufacturing, furniture, plastics, and food-processing business families.',
      'Logistics and trade families on the corridor and near the airport.',
      'Returning diaspora families across the central plain.',
      'Families outside Prishtina\'s tier by fees or commute.',
      'Students past grade 9 running the full A-Level phase.',
    ],
    nearbyAreas: ['Ferizaj', 'Hani i Elezit', 'Kaçanik', 'Shtime', 'Lipjan', 'the airport corridor', 'the North Macedonian border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Turkish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), RIT Kosovo (A.U.K), and German, Swiss and Austrian university applications',
    ],
    whyChoose: [
      ['The tier\'s curriculum without the daily commute', 'Live small-group Cambridge teaching delivered to Ferizaj homes at USD 2,160-6,480 a year, with Prishtina needed only for examinations.'],
      ['Business and engineering depth for a manufacturing city', 'Cambridge A-Level Economics, Business, Mathematics, and Physics suit the families who run and manage the corridor\'s industry.'],
      ['Built around a working household', 'Live classes plus unlimited recordings fit a family running a business rather than a school schedule.'],
      ['The law stated before anything is sold', 'Grades 1 to 9 are compulsory; we run supplementary alongside your enrolment and reserve the full pathway for the voluntary upper-secondary years.'],
      ['Timezone that lands in the school day', 'Ferizaj is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Ferizaj is one of Kosovo\'s manufacturing and logistics centres — furniture, plastics, food processing, and trade on the north-south corridor with the international airport minutes north — with a young, fast-growing population and no international schooling. Ferizaj shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the corridor: supplementary during the compulsory grades, full pathway through the voluntary upper-secondary years. Examinations at authorised centres confirmed per session, Prishtina forty minutes away.',
      cbc: 'Kenya CBC available for Ferizaj families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Ferizaj: grades 1 to 9 are compulsory under the Law on Pre-University Education, and we are not aware of an established parental-choice home-education route — a position to confirm with MASHTI and the municipal education directorate. The supplementary configuration carries the compulsory grades, and upper secondary is voluntary so the A-Level years sit outside the obligation entirely.',
    homeTuitionDetail: 'In-person tuition supplementation in Ferizaj is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the Ferizaj school day on the 1-2 hour offset, with every session recorded.',
    faqs: [
      { q: 'Should we just commute to Prishtina?', a: 'Some families do, at capital-tier fees plus a daily run on a busy corridor. Smartious delivers live international curriculum to Ferizaj homes at USD 2,160-6,480 a year, with Prishtina needed only for exam sittings.' },
      { q: 'Where do Ferizaj students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with Prishtina forty minutes away.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'gjilan-xk',
    name: 'Gjilan & the East',
    county: 'Gjilan Municipality',
    region: 'The eastern regional centre · trade and light manufacturing · a university faculty base · the corridor toward North Macedonia and Serbia · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Gjilan',
    heroTagline: 'For Gjilan and eastern families — the regional centre of the east, with every international school an hour or more away.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Gjilan and eastern families. Gjilan anchors Kosovo\'s east — a regional trade and light-manufacturing centre with university faculties, a young population, and corridors running toward North Macedonia and Serbia that shape its commerce. It is also, in schooling terms, on the wrong side of the country: everything international sits in Prishtina, an hour or more west. For eastern families whose children are aiming beyond the region — and for a diaspora that returns every summer — live delivery is the practical answer. Smartious runs supplementary alongside your school enrolment during the compulsory grades, and full-time through the voluntary upper-secondary years.',
    heroImg: '/heroes/gjilan-xk.jpg',
    altTexts: { hero: 'Gjilan and the eastern hills' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Gjilan and eastern Kosovo families — regional centre, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling in the east, with Prishtina an hour or more west.',
      'Grades 1 to 9 are compulsory; the supplementary configuration carries those years.',
      'Trade and manufacturing families with cross-border commerce and no matching English-medium schooling.',
      'Exam sittings mean Prishtina windows, planned ahead.',
      'Time zone: Gjilan shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Trade, light-manufacturing, and commercial business families.',
      'University faculty and academic families in the eastern centre.',
      'Returning diaspora families across the east.',
      'Multilingual households wanting an English-medium academic track alongside.',
      'Students past grade 9 running the full A-Level phase.',
    ],
    nearbyAreas: ['Gjilan', 'Viti', 'Kamenica', 'Novo Brdo', 'Ranilug', 'Kllokot', 'the eastern corridors'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Turkish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), RIT Kosovo (A.U.K), and German, Swiss and Austrian university applications',
    ],
    whyChoose: [
      ['The complete option on the far side of the country', 'Identical live delivery in Gjilan and Prishtina — no relocation, no boarding decision.'],
      ['Computing and business depth for a trading region', 'Cambridge A-Level Computer Science, Economics, and Mathematics suit the families who run the east\'s commerce.'],
      ['Built for the diaspora return', 'A child coming back mid-curriculum keeps one internationally examined pathway instead of restarting.'],
      ['The law stated before anything is sold', 'Grades 1 to 9 are compulsory; we run supplementary alongside your enrolment and reserve the full pathway for the voluntary upper-secondary years.'],
      ['Timezone that lands in the school day', 'Gjilan is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Gjilan anchors Kosovo\'s east — a regional trade and light-manufacturing centre with university faculties and corridors running toward North Macedonia and Serbia — with every international school an hour or more west in Prishtina. Gjilan shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the east: supplementary during the compulsory grades, full pathway through the voluntary upper-secondary years. Examinations at authorised centres confirmed per session with Prishtina travel planned ahead.',
      cbc: 'Kenya CBC available for eastern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Gjilan: grades 1 to 9 are compulsory under the Law on Pre-University Education, and we are not aware of an established parental-choice home-education route — a position to confirm with MASHTI and the municipal education directorate. The supplementary configuration carries the compulsory grades, and upper secondary is voluntary so the A-Level years sit outside the obligation.',
    homeTuitionDetail: 'In-person tuition supplementation in the east is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the Gjilan school day on the 1-2 hour offset, with every session recorded.',
    faqs: [
      { q: 'Can families in the east realistically run an international pathway?', a: 'Yes — the teaching is identical to Prishtina\'s, delivered home, and only examination sittings require travel, planned into Prishtina windows a few times a year.' },
      { q: 'Where do Gjilan students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, typically Prishtina windows planned ahead.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const KOSOVO_COUNTRY = {
  slug: 'kosovo',
  name: 'Kosovo',
  longName: 'Kosovo',
  adjective: 'Kosovar',
  flag: '🇽🇰',
  hub: '/online-school/kosovo',
  hubPageId: 'homeschooling-kosovo',
  cityPageId: 'kosovo-city',

  currency: 'EUR',
  currencyName: 'Euro',
  currencyPeg: 'Approximate EUR conversion at ~EUR 0.92 per USD (2026 indicative rate; final invoicing in USD).',

  timezone: {
    code: 'CET/CEST',
    name: 'Central European Time (CET UTC+1, CEST UTC+2 summer)',
    utcOffset: '+1',
    offsetFromEAT: '-2 hours (CEST -1 hour summer)',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Prishtina checked first, with North Macedonian, Albanian and Montenegrin regional options where practical'],
  examCentreTiles: [
    { city: 'Prishtina', centre: 'Authorised provision', area: 'The country\'s main external-candidate capacity, confirmed per family per session.' },
    { city: 'The regions', centre: 'Planned per session', area: 'Prizren, Peja, Gjakova, Ferizaj and Gjilan families plan Prishtina windows with travel scheduled ahead — nowhere is more than about ninety minutes away.' },
    { city: 'Regional alternatives', centre: 'Neighbouring centres', area: 'North Macedonian, Albanian and Montenegrin options are worth checking where local capacity is limited.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Kosovo-based students sit as external candidates at authorised provision, with Prishtina checked first and capacity confirmed per family per session. Kosovo\'s compact geography helps more than in most countries we serve: no city on these pages is more than about ninety minutes from the capital, so examination travel is a handful of day trips a year rather than a relocation question. Neighbouring centres in North Macedonia, Albania, and Montenegro are worth reviewing where local capacity is limited. Note what does not apply: during the compulsory grades a Smartious arrangement is supplementary, so the school enrolment carries the obligation and its own assessment — including the semimatura achievement test at the end of grade 9 — while the Cambridge calendar runs alongside. Upper secondary is voluntary, so from around fifteen the Cambridge calendar is simply the student\'s calendar, and a family chooses whether to continue toward the State Matura as well.',
  secondaryProgrammeExamRef: 'Authorised Prishtina and regional provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/kosovo.jpg',
  heroEyebrow: 'Online international school for Kosovo',
  heroH1Suffix: 'Kosovo',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for diaspora, expat, technology, and Kosovar families across Prishtina, Prizren, Peja, Gjakova, Ferizaj, and Gjilan. Grades 1 to 9 are compulsory under the Law on Pre-University Education, so we run supplementary alongside your school for those years — and upper secondary is voluntary, so the A-Level years open completely from around fifteen.',
  heroValueProp: 'From USD 180/month (~EUR 165/month). Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — supplementary beside any enrolment, and the full pathway once upper secondary becomes optional.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Kosovo',

  citiesSectionTitle: 'Where our Kosovo families are',
  citiesSectionBody: 'Smartious Kosovo families concentrate across Prishtina (the technology sector, the diplomatic community, the English-taught universities, and the country\'s entire international-school tier), Prizren (the cultural capital and its tourism economy), Peja and the Rugova valley (adventure tourism on the Peaks of the Balkans trail), Gjakova (one of the strongest diaspora economies in the country), Ferizaj (manufacturing and logistics on the central corridor), and Gjilan (the eastern regional centre). One compulsory phase, one voluntary one, and five cities out of six with nothing.',

  trustSignals: [
    { h: 'Two operational teaching centres', p: 'Live teaching to Kosovo families is delivered from two international-standard operational centres established 2022 and 2023.' },
    { h: 'CET/CEST timezone alignment', p: 'Kosovo runs CET (UTC+1) / CEST (UTC+2 summer) — only 1-2 hours behind Nairobi EAT, so live teaching lands naturally inside the school day.' },
    { h: 'The law stated before anything is sold', p: 'Under the Law on Pre-University Education (Law No. 04/L-032), grades 1 to 5 and 6 to 9 are compulsory, and municipalities must provide schooling at those levels. We are not aware of an established parental-choice home-education route, and we say so in those terms rather than overstating.' },
    { h: 'The voluntary phase, stated plainly', p: 'Upper secondary — three or four years, general or vocational, ending in the State Matura — is voluntary. So from around fifteen the A-Level years sit outside compulsory education entirely.' },
  ],

  universitiesInCountry: 'The University of Prishtina, alongside RIT Kosovo (A.U.K), which awards US-accredited Rochester Institute of Technology degrees taught in English, and the public universities at Prizren, Peja, Gjakova, Gjilan, and Mitrovica, plus private institutions including UBT and Universum with English-taught programmes.',
  universityChannels: 'Kosovo\'s universities admit holders of foreign secondary qualifications through recognition procedures, with programme-specific requirements and Albanian-language proficiency where a degree is taught in Albanian — confirmed per programme rather than assumed. The country has an unusually strong English-medium destination for its size: RIT Kosovo (A.U.K) awards US-accredited degrees taught entirely in English, and UBT and Universum run English-taught programmes — all of them built to read Cambridge A-Levels, the IB Diploma, and AP records directly. Beyond that, Kosovar students are among the most internationally mobile in Europe, with a diaspora concentrated in Germany, Switzerland, and Austria whose universities assess these qualifications routinely, alongside Turkish, Albanian, and North Macedonian institutions. UCAS reads A-Levels natively, the Common Application serves US plans, and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across Kosovar, regional, UK (UCAS), and US destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Kosovo families, in the two shapes the law leaves open: live supplementary Cambridge subjects beside a school enrolment through the compulsory grades 1 to 9, and the full Cambridge IGCSE and A-Level pathway once upper secondary becomes voluntary. Classes land inside the school day on the 1-2 hour offset; examinations at authorised provision confirmed per session, with regional options in North Macedonia, Albania, and Montenegro. Pathway read natively by UK universities via UCAS, read directly by RIT Kosovo (A.U.K) and the English-taught domestic programmes, and accepted in 160+ countries.',
  britishCurriculumSuits: 'Kosovo families targeting the Cambridge pathway. Best fit for: (1) diaspora-connected families whose children move between Kosovo and Germany, Switzerland, or Austria, (2) technology and professional families in Prishtina\'s growing sector, (3) students aiming at RIT Kosovo (A.U.K) or the English-taught domestic programmes, (4) the regions — Prizren, Peja, Gjakova, Ferizaj, Gjilan — where international provision does not exist, (5) students past grade 9 running the full A-Level phase outside compulsory education.',
  britishCurriculumDelivery: 'Live online classes landing inside the school day on the 1-2 hour offset, small groups 4-6 students. Cambridge examinations at authorised provision, confirmed per session.',
  ibDiplomaSuits: 'Kosovo families targeting the IB Diploma\'s breadth — an alternative to the capital\'s campus routes.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Kosovo families targeting US universities via Common Application, and those aiming at RIT Kosovo (A.U.K)\'s US-accredited degrees.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in 2019 to make international qualifications (Cambridge, IB, American) accessible to families across emerging markets and international communities at online-delivery fees. Kosovo families join students in 49 other countries — from Prishtina to Nairobi\'s own Diamond Plaza HQ, the Rugova valley to the Dukagjini plain.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Prishtina\'s technology households, Ferizaj\'s manufacturing families, and every medicine- or engineering-bound student in the country. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'International schooling in Kosovo is a Prishtina story — the American School of Kosova, the International School of Prishtina, Mehmet Akif and a small private tier — with essentially nothing in Prizren, Peja, Gjakova, Ferizaj, or Gjilan. What is unusual here is the university end: RIT Kosovo (A.U.K) awards US-accredited degrees taught in English, and UBT and Universum teach in English too. So the country produces real demand for an internationally examined school record without having built the schools to supply it. That gap is the competitive space.',
  competitors: [
    { name: 'American School of Kosova',                      city: 'Prishtina',             curriculum: 'American international',                feesUsd: 'Premium local tier',                                feesAed: 'Varies by grade',         rating: 4.3, capacityNote: 'The established American-track campus' },
    { name: 'International School of Prishtina',              city: 'Prishtina',             curriculum: 'International',                         feesUsd: 'Premium local tier',                                feesAed: 'Varies',                  rating: 4.2, capacityNote: 'The diplomatic-community option' },
    { name: 'Mehmet Akif and the private colleges',           city: 'Prishtina and regions', curriculum: 'Bilingual, international-leaning',      feesUsd: 'Mid-premium tier',                                  feesAed: 'Varies',                  rating: 4.2, capacityNote: 'The widest private network — strong, and not a full British or IB route' },
    { name: 'Prizren, Peja, Gjakova, Ferizaj, Gjilan',        city: 'The regions',           curriculum: '—',                                     feesUsd: 'No international provision',                        feesAed: '—',                       rating: 0,   capacityNote: 'The cultural capital, the mountains, the diaspora heartland, the industrial corridor and the east — nothing' },
    { name: 'RIT Kosovo (A.U.K) — the destination, not a competitor', city: 'Prishtina',     curriculum: 'US-accredited degrees in English',      feesUsd: 'University level',                                  feesAed: '—',                       rating: 4.6, capacityNote: 'Reads Cambridge, IB and AP records directly — the clearest domestic reason to hold one' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh / bina (online)', city: 'Online',        curriculum: 'Cambridge self-paced / UK online / own to 15', feesUsd: 'Per-subject / GBP 9,000-11,000 / consultation', feesAed: 'Varies',      rating: 4.2, capacityNote: 'Self-paced, priced far above Smartious, or stopping at 15 — and none states the compulsory grades or the voluntary upper-secondary phase' },
    { name: 'Smartious Homeschool (Kosovo via online delivery)', city: 'Delivered to all Kosovo', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: '~EUR 2,000-6,000/year', rating: 4.8, capacityNote: 'Every class live through A-Level + both lawful configurations + the voluntary upper-secondary phase used properly + the regions served identically' },
  ],

  legalFrameworkIntro: 'Kosovo\'s framework is compact and easy to state accurately, which is a relief after some of its neighbours. Here it is exactly, including the point that changes senior planning.',
  legalFramework: [
    { h: 'The law and the authorities', p: 'The Law on Pre-University Education in the Republic of Kosovo (Law No. 04/L-032, published in the Official Gazette on 16 September 2011) regulates pre-university education from ISCED level 0 to level 4. The ministry — MASHTI — sets policy and issues administrative instructions, including the framework for student assessment, while municipalities deliver schooling through their education directorates. That is a simpler structure than Bosnia\'s fourteen authorities or Switzerland\'s twenty-six cantons: one law, one ministry, municipal delivery.' },
    { h: 'What is compulsory', p: 'Primary education, grades 1 to 5, and lower secondary education, grades 6 to 9, are compulsory for all children. Municipalities are required to establish and maintain schools at these levels in every municipality, and — a provision that matters in valley and rural communities — to ensure provision in all languages of instruction even below the minimum enrolment thresholds, or to offer alternatives including subsidised transport. At the end of grade 9 students sit the semimatura achievement test, which is orienting rather than certifying in character.' },
    { h: 'Home education: what we can and cannot say', p: 'We are not aware of an established parental-choice home-education route under the Law on Pre-University Education, and we phrase it that way deliberately. A confident assertion that home education is prohibited outright is more than we can evidence from the framework text, and a suggestion that it is available would be worse. What a family should do is straightforward: confirm the current position with MASHTI and with their municipal education directorate before making any plan that depends on it. What is not in doubt is that structured education alongside a school enrolment is unrestricted, which is why that is the configuration we build for the compulsory grades.' },
    { h: 'The phase that changes senior planning', p: 'Upper secondary education in Kosovo lasts three or four years, is divided into general and vocational streams, ends in the State Matura — and participation in it is voluntary. That single fact reshapes the senior years for an internationally minded family. From around fifteen, a student may run full-time live Cambridge A-Levels with no attendance obligation to satisfy, either instead of the national upper-secondary route or, for families who want both records, alongside a place at a gymnasium. Kosovo joins Croatia, Albania, Greece, Serbia, Bulgaria, and Montenegro in our coverage\'s post-compulsory pattern.' },
    { h: 'Why the university end matters more here than usual', p: 'In most countries an internationally examined school record is an argument about leaving. In Kosovo it is also an argument about staying. RIT Kosovo (A.U.K) awards US-accredited Rochester Institute of Technology degrees taught entirely in English; UBT and Universum run English-taught programmes. Those institutions are built to read Cambridge A-Levels, IB Diplomas, and AP records directly, with entry requirements confirmed per programme. A student who takes the A-Level route can therefore apply to a US-accredited degree in Prishtina and to a UK university through UCAS in the same season, on the same record.' },
    { h: 'Residency and the diaspora question', p: 'Kosovo has one of the largest diasporas in Europe relative to its population, concentrated in Germany, Switzerland, and Austria, and a great many families move children between the two. Education law follows residence: a child resident in Germany, Switzerland, or Austria is under that country\'s framework — each of which differs, and none of which we would summarise for a family without knowing their situation. Where the line falls belongs with their own advisers. What travels regardless is the curriculum: the same live teaching, teachers, and examination board work identically on either side of the move, which is precisely the problem the diaspora pattern creates and the one an online school is best placed to solve.' },
  ],

  whySmartious: [
    { h: 'The law stated before anything is sold',                          p: 'Grades 1 to 9 are compulsory, and we are not aware of an established parental home-education route — stated in those terms, with MASHTI and your municipal directorate named as the place to confirm.' },
    { h: 'The voluntary upper-secondary phase used properly',               p: 'Upper secondary is optional in Kosovo, so the A-Level years run at the family\'s choice from around fifteen — and we plan whole pathways backward from that.' },
    { h: 'A record that works at home as well as abroad',                    p: 'RIT Kosovo (A.U.K) awards US-accredited degrees in English and reads Cambridge, IB and AP records directly. One record, two directions.' },
    { h: 'Built for a diaspora that moves',                                 p: 'Children splitting time between Kosovo and Germany, Switzerland, or Austria keep one curriculum, one teaching team, and one examination board across every move.' },
    { h: 'The regions served identically',                                  p: 'Prizren, Peja, Gjakova, Ferizaj, and Gjilan have no international provision at all — and none is more than about ninety minutes from the capital, so examinations are day trips rather than relocations.' },
    { h: 'CET/CEST timezone alignment',                                     p: 'Only 1-2 hours behind Nairobi EAT — live teaching lands naturally inside the school day.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Kosovo?', a: 'Grades 1 to 5 and 6 to 9 are compulsory under the Law on Pre-University Education (Law No. 04/L-032), and we are not aware of an established parental-choice home-education route under that law. We put it in those terms rather than overstating, and we would tell any family considering it to confirm the current position with MASHTI and their municipal education directorate.' },
    { q: 'So what can Smartious offer during the compulsory grades?', a: 'Structured study alongside your school enrolment, which is unrestricted: the school carries every legal obligation and the daily routine, while we teach Cambridge or IB subjects live in the after-school slot toward external examinations.' },
    { q: 'Is upper secondary really voluntary?', a: 'Yes — upper secondary runs three or four years, general or vocational, ends in the State Matura, and participation is voluntary. From around fifteen the A-Level years sit outside compulsory education entirely.' },
    { q: 'Can we do A-Levels and keep a gymnasium place?', a: 'Families do both. The gymnasium route continues toward the State Matura while the Cambridge track runs alongside, which suits students who want a domestic record and an internationally read one. It is a heavier year, so subject choice has to be disciplined.' },
    { q: 'Will RIT Kosovo (A.U.K) accept Cambridge or IB qualifications?', a: 'Those programmes award US-accredited degrees taught in English and are built to read international qualifications directly, with entry requirements confirmed with the institution per programme. UBT and Universum also run English-taught programmes.' },
    { q: 'Our children move between Kosovo and Switzerland or Germany — how does that work?', a: 'The curriculum, teachers, and examination board stay constant wherever the family is. Education law follows residence, and the German, Swiss, and Austrian frameworks each differ — a question for your own advisers, while the schooling itself continues unchanged.' },
    { q: 'How does Smartious compare with the American School of Kosova or the International School of Prishtina?', a: 'They are established campuses with in-person culture and a local peer group we cannot replicate. Smartious runs live small-group teaching at USD 2,160-6,480 a year — the supplement beside a campus or a national school, and the only complete option outside the capital.' },
    { q: 'Where do Kosovar students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session — Prishtina first, with North Macedonian, Albanian, and Montenegrin options worth checking where capacity is limited. No city we cover is more than about ninety minutes from the capital.' },
    { q: 'How does live class scheduling work given the time difference?', a: 'Kosovo runs CET (UTC+1) in winter and CEST (UTC+2) in summer — only 1-2 hours behind Nairobi EAT — so live teaching lands naturally inside the school day, with the after-school slot suiting supplementary students.' },
    { q: 'Which parts of Kosovo does Smartious cover?', a: 'Prishtina, Prizren, Peja and the Rugova valley, Gjakova, Ferizaj, and Gjilan have dedicated pages with local context. Live online delivery works identically anywhere in the country — which outside Prishtina is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us your child\'s grade: in Kosovo the difference between the compulsory grades and the voluntary upper-secondary years changes the whole plan, and that conversation belongs at the start.',
}
