// ═══════════════════════════════════════════════════════════════════
// MONTENEGRO — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for expat, yachting, tourism, industrial, and
// Montenegrin families across Podgorica, the Bay of Kotor, Budva,
// Nikšić, Bar and Žabljak.
//
// IMAGE NOTE — READ BEFORE EDITING:
// heroImg / heroImage use LOCAL PATHS under /heroes/, not external
// image URLs. Drop a file at frontend/public/heroes/<slug>.jpg and
// it appears; if the file is absent the component's onError handler
// hides the image and the ink→crimson gradient shows instead, which
// is a clean, intentional fallback. Do NOT paste in guessed
// stock-photo IDs — an unverified ID either 404s or renders a photo
// of the wrong place, and both are worse than the gradient.
//
// LEGAL POSITIONING NOTE — READ BEFORE EDITING:
// Montenegro is its own tier and does NOT match its neighbours.
// - The Law on Primary Education and Upbringing makes primary
//   education COMPULSORY for all children aged SIX TO FIFTEEN, over
//   NINE YEARS, and the parent must ensure the child fulfils that
//   obligation. A pupil who turns fifteen during the school year
//   may not leave school before the end of that school year.
// - THE DISTINCTIVE PROVISION — STATE IT PROMINENTLY: by way of
//   EXCEPTION, a parent or guardian MAY ORGANISE the child's
//   primary education AT HOME FOR ONE SEMESTER (polugodište) OR ONE
//   SCHOOL YEAR, in accordance with the law. This is a genuine
//   parental route — unlike Croatia, Albania, and North Macedonia,
//   which do not permit one — but it is TIME-LIMITED and framed as
//   an exception rather than an open-ended right. Never describe it
//   as indefinite; describe it as a semester or a year at a time.
// - OVERSIGHT IS LIGHTER THAN THE REGIONAL NORM: the SCHOOL KEEPS
//   THE RECORDS AND DOCUMENTATION of a child educated at home, and
//   the KNOWLEDGE CHECK for a home-educated pupil is carried out AT
//   THE END OF THE CYCLE — Montenegro's nine years run in three
//   cycles — rather than annually in every subject as in Slovenia,
//   Serbia, and Bulgaria. That contrast is worth drawing, carefully
//   and without overclaiming: it means fewer checkpoints, not fewer
//   standards. Always tell families to confirm the current
//   arrangement with their school and the Ministry, since the
//   detail sits partly in by-laws.
// - AFTER FIFTEEN: compulsory education ends with the obligation at
//   fifteen (subject to the end-of-school-year rule), and primary
//   education for those over fifteen falls under adult-education
//   rules. Secondary education — gimnazija or vocational — is not
//   compulsory. So the A-Level years sit outside the obligation.
// - RESIDENCY: the obligation attaches to children resident in
//   Montenegro. Non-resident families follow their country of
//   residence. Relevant here because of the yachting, second-home
//   and residence-by-investment inflow around the coast.
// MARKET NOTE: the international tier is thin even by regional
// standards — a small number of private and international-leaning
// schools in Podgorica and around the coast, and nothing at scale.
// Economy: tourism dominates (Budva, Kotor, Sveti Stefan), Porto
// Montenegro at Tivat is one of the Mediterranean's major superyacht
// marinas with a genuinely international resident community, Bar is
// the main port, Nikšić carries the steel and brewing industry and
// EPCG's power generation, Podgorica holds government, banking and
// the university, and Durmitor and the north run mountain tourism.
// Large diaspora in Serbia, Germany, Switzerland, Turkey and the US.
// TIMEZONE: CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind
// Nairobi EAT, the standard European framing.
// ═══════════════════════════════════════════════════════════════════

export const MONTENEGRO_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'podgorica-me',
    name: 'Podgorica',
    county: 'Podgorica Capital City',
    region: 'Capital · government, banking and the University of Montenegro · the diplomatic community · what little international schooling the country has',
    primaryKeyword: 'Online school and international curriculum in Podgorica',
    heroTagline: 'For Podgorica families — the capital of a country whose law lets you teach at home a semester at a time, and whose international schooling is thin either way.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Podgorica families. Podgorica holds Montenegro\'s government, its banking and telecoms sector, the University of Montenegro, and the diplomatic and development community that comes with EU accession negotiations — a small capital with an unusually international professional class. Its international schooling is thin even by regional standards. Montenegrin law is also more accommodating than its neighbours\' in one specific way: primary education is compulsory from six to fifteen, but a parent may, by exception, organise a child\'s primary education at home for a semester or a school year at a time. Smartious delivers the international pathways live — supplementary alongside your enrolment, or as the academic spine within that arrangement.',
    heroImg: '/heroes/podgorica-me.jpg',
    altTexts: { hero: 'Podgorica and the Morača river below the mountains' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Podgorica families — Montenegro\'s semester-at-a-time home education explained, supplementary track available. From USD 400/month.',
    challenges: [
      'International schooling is thin even by regional standards, and concentrated in and around the capital.',
      'Home education is permitted by exception for one semester or one school year at a time — it is not an open-ended right.',
      'A pupil who turns fifteen during the school year may not leave school before that year ends.',
      'Diplomatic, development, and banking postings arrive mid-year rather than on admission cycles.',
      'Time zone: Montenegro runs CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT, so live teaching lands inside the school day.',
    ],
    familySituations: [
      'Diplomatic, EU-accession, and development-sector families in the capital.',
      'Banking, telecoms, and professional families with international ties.',
      'University of Montenegro academic families.',
      'Montenegrin families using the semester-at-a-time home provision who want an externally examined track behind it.',
      'Returning diaspora families from Serbia, Germany, Switzerland, and the US.',
      'Students past the compulsory obligation running the full A-Level phase.',
    ],
    nearbyAreas: ['Podgorica centre', 'Stari Aerodrom', 'Tološi', 'Zlatica', 'Danilovgrad', 'Cetinje', 'Skadar Lake'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Italian, Russian and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Montenegrin, Serbian, Italian and wider EU university applications',
    ],
    whyChoose: [
      ['The semester-at-a-time provision explained properly', 'Montenegro permits home education by exception for a semester or a school year — genuinely more than Croatia, Albania, or North Macedonia allow, and genuinely less than an open-ended right. We describe it as it is.'],
      ['Lighter checkpoints than the regional norm', 'Knowledge checks for home-educated pupils fall at the end of the cycle rather than annually in every subject — fewer checkpoints, not lower standards, and we plan for them either way.'],
      ['The Cambridge track where the tier is thin', 'Live small-group teaching at USD 2,160-6,480 a year — the supplement, the bridge, or the alternative in a country with very little to choose from.'],
      ['Enrolment at posting speed', 'Diplomatic and development families arrive mid-year; students typically begin within a week of the assessment.'],
      ['Timezone that lands in the school day', 'Podgorica is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Podgorica holds Montenegro\'s government, banking, university, and the diplomatic community around EU accession — a small capital with an international professional class and thin international schooling, in a country whose law permits home education by exception for a semester or a school year at a time. Montenegro runs CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Podgorica families, supplementary alongside an enrolment or as the academic spine within a home-education semester or year. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Podgorica families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Montenegro sits between its neighbours, and the detail matters. Primary education is compulsory for all children aged six to fifteen, across nine years, and the parent must ensure the child fulfils that obligation — a pupil who turns fifteen during the school year may not leave before it ends. But the law then provides something Croatia, Albania, and North Macedonia do not: by way of exception, a parent may organise the child\'s primary education at home for one semester or one school year, in accordance with the law. It is a real parental route, and it is framed as an exception with a defined duration rather than an open-ended right, so families plan it a semester or a year at a time. The oversight is lighter than the regional norm: the school keeps the records and documentation of a child educated at home, and the knowledge check for a home-educated pupil is carried out at the end of the cycle — Montenegro\'s nine years run in three cycles — rather than annually in every subject as in Slovenia, Serbia, or Bulgaria. That means fewer checkpoints, not lower standards. Because the working detail sits partly in by-laws and school practice, families should confirm the current arrangement with their school and the Ministry. After the obligation ends, primary education for those over fifteen falls under adult-education rules, and secondary school is not compulsory — so the A-Level years sit outside the framework.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation for Podgorica families during examination preparation periods, subject to associate teacher availability.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes land inside the Podgorica school day given the 1-2 hour offset, with every session recorded for unlimited rewatch.',
    faqs: [
      { q: 'Is homeschooling legal in Montenegro?', a: 'Yes, by exception and for a defined period: primary education is compulsory from six to fifteen, but a parent may organise the child\'s primary education at home for one semester or one school year in accordance with the law. The school keeps records and documentation, and the knowledge check falls at the end of the cycle. Confirm the current arrangement with your school and the Ministry.' },
      { q: 'How does that compare with the neighbouring countries?', a: 'It is more than Croatia, Albania, or North Macedonia permit — none of them establishes a parental route at all — and lighter on checkpoints than Slovenia, Serbia, or Bulgaria, which examine home-educated pupils every year in every subject. Montenegro checks at the end of the cycle instead.' },
      { q: 'Can we do it indefinitely?', a: 'It is framed as an exception covering a semester or a school year, so families plan it in those blocks rather than as an open-ended arrangement. What that means in practice for consecutive periods is worth confirming with your school and the Ministry.' },
      { q: 'What happens after fifteen?', a: 'The compulsory obligation ends at fifteen, subject to the rule that a pupil turning fifteen mid-year finishes that school year. Secondary education is not compulsory, so the A-Level years run entirely at the family\'s choice.' },
      { q: 'Where do Podgorica students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with regional options where local capacity is limited.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'kotor-me',
    name: 'Kotor, Tivat & the Bay',
    county: 'Bay of Kotor',
    region: 'The UNESCO bay · Porto Montenegro at Tivat, one of the Mediterranean\'s major superyacht marinas · a genuinely international resident community · no international schooling at scale',
    primaryKeyword: 'Online school and international curriculum in Kotor and Tivat',
    heroTagline: 'For Kotor, Tivat and Bay families — a superyacht marina with residents from thirty countries, and no school built for their children.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families around the Bay of Kotor. The bay is UNESCO-listed and, since Porto Montenegro transformed Tivat, one of the Mediterranean\'s significant superyacht centres — bringing marina operators, yacht crew and management, brokerage and refit businesses, and a permanent international residential community that lives here year-round rather than seasonally. Kotor, Herceg Novi, and Perast add tourism and second-home economies around the same water. What the bay does not have is international schooling at scale. Smartious delivers the pathways live around the bay — supplementary alongside a local enrolment, or as the academic spine within Montenegro\'s semester-at-a-time home provision.',
    heroImg: '/heroes/kotor-me.jpg',
    altTexts: { hero: 'The Bay of Kotor and the old town below the mountains' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Kotor, Tivat and Bay of Kotor families — Porto Montenegro\'s international community, no international schooling. From USD 400/month.',
    challenges: [
      'A genuinely international year-round community around Porto Montenegro with no international schooling at scale.',
      'Yacht crew and marine-industry careers move between Mediterranean and Caribbean seasons.',
      'Home education is permitted by exception for a semester or a school year at a time — it is not open-ended.',
      'Second-home and residence-permit families need to know which framework applies, and that turns on residence.',
      'Time zone: the bay shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Marina, yacht management, brokerage, and refit business families at Porto Montenegro.',
      'Yacht crew families moving between Mediterranean and Caribbean seasons.',
      'International residents and second-home owners around the bay.',
      'Tourism and hospitality families in Kotor, Perast, and Herceg Novi.',
      'Students past the compulsory obligation running the full A-Level phase.',
    ],
    nearbyAreas: ['Kotor', 'Tivat and Porto Montenegro', 'Herceg Novi', 'Perast', 'Risan', 'Lustica', 'Prčanj'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Italian, Russian, German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Montenegrin, Italian and wider EU university applications',
    ],
    whyChoose: [
      ['Schooling that moves with a marine career', 'One live pathway held constant across Mediterranean and Caribbean seasons — same teachers, same examination board — the case our Piraeus, Rijeka, and Esbjerg families have proven.'],
      ['The complete option on a bay with none', 'Identical live delivery from Herceg Novi to Tivat, without relocation.'],
      ['The framework explained properly', 'Home education by exception for a semester or a year, with checks at the end of the cycle; supplementary alongside an enrolment where that is simpler.'],
      ['Residency stated precisely', 'Which framework applies turns on where a family legally resides, not where the boat is berthed — and that question belongs with your own advisers.'],
      ['Timezone that lands in the school day', 'The bay is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'The Bay of Kotor is UNESCO-listed and, since Porto Montenegro transformed Tivat, one of the Mediterranean\'s significant superyacht centres — with a permanent international residential community and no international schooling at scale. The bay shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the bay, portable across marine seasons. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Bay families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies around the bay: primary education is compulsory from six to fifteen, with the parent responsible for ensuring the obligation is met, and — by exception — a parent may organise the child\'s primary education at home for one semester or one school year. The school keeps the records, and the knowledge check falls at the end of the cycle rather than annually. For marine-industry families the supplementary configuration is often simpler still: the local enrolment carries the obligation while the Cambridge track runs live alongside and continues unchanged when the season moves the family on. Households resident elsewhere — including second-home owners and those on residence permits who remain registered abroad — follow their country of residence\'s framework, a status they determine with their own advisers.',
    homeTuitionDetail: 'In-person tuition supplementation around the bay is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the local school day on the 1-2 hour offset, with the full recorded library built for charter seasons and travel.',
    faqs: [
      { q: 'We work in yachting and move with the seasons — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue across Mediterranean and Caribbean seasons, with examinations sat at authorised centres wherever the family is. Only the local legal framework changes, and we plan that part.' },
      { q: 'Are there international schools around the Bay of Kotor?', a: 'Nothing at scale. Live online delivery is the complete option for the bay, supplementary alongside a local enrolment or as the academic spine within Montenegro\'s home-education provision.' },
      { q: 'Where do Bay students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into exam windows ahead.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'budva-me',
    name: 'Budva & the Riviera',
    county: 'Budva Riviera',
    region: 'Montenegro\'s tourism capital · Sveti Stefan, Bečići and the Riviera · a summer economy of international scale · a growing year-round international residential community',
    primaryKeyword: 'Online school and international curriculum in Budva',
    heroTagline: 'For Budva and Riviera families — the coast that fills every summer and empties of schooling every September.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Budva and Riviera families. Budva is Montenegro\'s tourism capital — Sveti Stefan, Bečići, Rafailovići, and a season that draws visitors from across Europe and the region into a town whose permanent population is a fraction of its August one. Behind the season sits a growing year-round international community: hospitality and property businesses, second-home owners, and families who arrived for a summer and stayed. International schooling on the Riviera does not exist. Smartious delivers the pathways live along the coast, with a rhythm built for the season and Montenegro\'s framework explained properly.',
    heroImg: '/heroes/budva-me.jpg',
    altTexts: { hero: 'Budva old town and the Riviera coastline' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Budva and Riviera families — tourism capital, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling on the Riviera, despite a growing year-round international community.',
      'A summer season that runs the whole household from May to September.',
      'Home education is permitted by exception for a semester or a school year at a time — it is not open-ended.',
      'Second-home and residence-permit families need to know which framework applies, and that turns on residence.',
      'Time zone: Budva shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Hospitality, hotel, and property-business families along the Riviera.',
      'Second-home and lifestyle-migration families who settled after a season.',
      'Returning diaspora families from Serbia, Germany, and Switzerland.',
      'Remote-work households drawn by the coast and the cost of living.',
      'Students past the compulsory obligation running the full A-Level phase.',
    ],
    nearbyAreas: ['Budva', 'Bečići and Rafailovići', 'Sveti Stefan', 'Petrovac', 'Pržno', 'Tivat side of the pass', 'Bar road'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Russian, Italian, German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Montenegrin, Serbian and EU university applications',
    ],
    whyChoose: [
      ['The complete option on a coast with none', 'Identical live delivery from Petrovac to Bečići — the international pathway the Riviera never had.'],
      ['Built for a five-month season', 'Live classes plus unlimited recordings hold the academic year together when the whole family works from May to September.'],
      ['The framework explained properly', 'Home education by exception for a semester or a year, with checks at the end of the cycle; supplementary alongside an enrolment where that is simpler.'],
      ['Residency stated precisely', 'Which framework applies turns on where a family legally resides — a question we send to your own advisers while planning the education either way.'],
      ['Timezone that lands in the school day', 'Budva is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Budva is Montenegro\'s tourism capital — Sveti Stefan, Bečići, and a season that multiplies the town\'s population — with a growing year-round international residential community behind it and no international schooling on the Riviera. Budva shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Riviera. Examination sittings planned per session with travel scheduled ahead.',
      cbc: 'Kenya CBC available for Riviera families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies on the Riviera: primary education is compulsory from six to fifteen, and by exception a parent may organise the child\'s primary education at home for one semester or one school year, with the school keeping records and the knowledge check falling at the end of the cycle. For hospitality families the semester framing can suit the season unusually well, though the supplementary configuration alongside a local enrolment remains the simplest arrangement for most. Families resident elsewhere follow their country of residence\'s framework, a status they determine with their own advisers.',
    homeTuitionDetail: 'In-person tuition supplementation on the Riviera is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the local school day on the 1-2 hour offset, with the full recorded library carrying the summer season.',
    faqs: [
      { q: 'Are there international schools in Budva?', a: 'No — the Riviera has none. Live online delivery is the complete option, supplementary alongside a local enrolment or as the academic spine within Montenegro\'s home-education provision.' },
      { q: 'Our whole family works the summer season — can schooling fit that?', a: 'It is built for it: live classes with a complete recorded library, so the academic year holds together through the busiest months.' },
      { q: 'Where do Riviera students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into exam windows ahead.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'niksic-me',
    name: 'Nikšić',
    county: 'Nikšić Municipality',
    region: 'The industrial capital · the steelworks tradition and EPCG\'s power generation · Montenegro\'s second city and a university town · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Nikšić',
    heroTagline: 'For Nikšić families — the industrial second city, an hour inland from the coast and outside everything it offers.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Nikšić families. Nikšić is Montenegro\'s second city and its industrial one — the steelworks tradition that shaped the town, EPCG\'s power generation on the Zeta, a brewing industry known across the region, and faculties of the University of Montenegro. It is an hour from Podgorica and further from the coast, with no international schooling anywhere in reach. Smartious delivers the international pathways live across the interior — supplementary alongside a local enrolment, or as the academic spine within Montenegro\'s semester-at-a-time home provision.',
    heroImg: '/heroes/niksic-me.jpg',
    altTexts: { hero: 'Nikšić and the surrounding Montenegrin highlands' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Nikšić families — industrial second city, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling in the second city, with Podgorica an hour away and thin provision even there.',
      'Industrial and energy employment with international investment but no matching schooling.',
      'Home education is permitted by exception for a semester or a school year at a time.',
      'Exam sittings mean Podgorica windows, planned ahead.',
      'Time zone: Nikšić shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Steel, energy, and industrial engineering families.',
      'University faculty and academic families.',
      'Professional families across the interior with no local international option.',
      'Montenegrin families using the semester-at-a-time home provision.',
      'Students past the compulsory obligation running the full A-Level phase.',
    ],
    nearbyAreas: ['Nikšić', 'the steelworks and industrial zone', 'Plužine', 'Šavnik', 'Danilovgrad', 'the Zeta valley', 'Vilusi'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Russian and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Montenegrin, Serbian and EU university applications',
    ],
    whyChoose: [
      ['The complete option in the interior', 'Identical live delivery in Nikšić and Podgorica — no relocation, no boarding decision.'],
      ['Engineering and chemistry depth for an industrial city', 'Cambridge A-Level Physics, Chemistry, and Mathematics — led by a founder with a BEd in Mathematics and Physics — suit the steel and energy sectors\' families precisely.'],
      ['Built for shift patterns', 'Live classes plus unlimited recordings work around an industrial household\'s week.'],
      ['The framework explained properly', 'Home education by exception for a semester or a year, with checks at the end of the cycle; supplementary alongside an enrolment where that is simpler.'],
      ['Timezone that lands in the school day', 'Nikšić is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Nikšić is Montenegro\'s industrial second city — the steelworks tradition, EPCG\'s power generation on the Zeta, a regional brewing industry, and university faculties — an hour from Podgorica with no international schooling anywhere in reach. Nikšić shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the interior. Examinations at authorised centres confirmed per session, Podgorica an hour away.',
      cbc: 'Kenya CBC available for interior families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Nikšić: primary education is compulsory from six to fifteen, and by exception a parent may organise the child\'s primary education at home for one semester or one school year, with the school keeping records and the knowledge check falling at the end of the cycle rather than annually. The supplementary configuration alongside a local enrolment remains the simplest arrangement for most families, and after fifteen the A-Level years sit outside the obligation entirely.',
    homeTuitionDetail: 'In-person tuition supplementation in the interior is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the Nikšić school day on the 1-2 hour offset, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Nikšić?', a: 'No — and provision is thin even in Podgorica, an hour away. Live online delivery is the complete option for the interior.' },
      { q: 'Where do Nikšić students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with Podgorica an hour away.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'bar-me',
    name: 'Bar & the Southern Coast',
    county: 'Bar Municipality',
    region: 'Montenegro\'s main port · the Adriatic freight and ferry gateway to Italy · Ulcinj and the southern beaches · the Albanian border · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Bar',
    heroTagline: 'For Bar and southern coast families — the country\'s port, its ferries to Italy, and no international school in either direction.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Bar and southern coast families. Bar is Montenegro\'s principal port — the country\'s freight gateway, the ferry link to Bari and Ancona, the rail terminus of the Belgrade line, and a shipping and logistics community that works internationally by definition. South of it, Ulcinj and the long beaches run their own tourism economy toward the Albanian border. Neither has international schooling. Smartious delivers the pathways live across the southern coast — supplementary alongside a local enrolment, or as the academic spine within Montenegro\'s semester-at-a-time home provision.',
    heroImg: '/heroes/bar-me.jpg',
    altTexts: { hero: 'The port of Bar on the Montenegrin coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Bar and Ulcinj families — main port and southern coast, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling on the southern coast, for a port community that works internationally by definition.',
      'Shipping and freight rotations, and a summer season in Ulcinj, both cut across a fixed timetable.',
      'Home education is permitted by exception for a semester or a school year at a time.',
      'Cross-border households on the Albanian frontier follow the framework of where they reside.',
      'Time zone: Bar shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Port, shipping, freight, and logistics families.',
      'Ferry and maritime-services families working toward Italy.',
      'Tourism and hospitality families in Ulcinj and along the southern beaches.',
      'Cross-border households near the Albanian frontier.',
      'Students past the compulsory obligation running the full A-Level phase.',
    ],
    nearbyAreas: ['Bar', 'the port and Sutomore', 'Ulcinj', 'Velika Plaža', 'Virpazar and Skadar Lake', 'Petrovac', 'the Albanian border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Italian, Albanian community support, and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Montenegrin, Italian and Albanian university applications',
    ],
    whyChoose: [
      ['Schooling that survives a rotation and a season', 'Live classes plus unlimited recordings hold the academic pace through freight schedules and the Ulcinj summer.'],
      ['Italian alongside the academic core', 'In a port whose ferries run to Bari and Ancona, Cambridge Italian sits naturally beside the English-medium track.'],
      ['The complete option where none exists', 'Identical live delivery from Sutomore to Ulcinj.'],
      ['The framework explained properly', 'Home education by exception for a semester or a year, with checks at the end of the cycle; supplementary alongside an enrolment where that is simpler.'],
      ['Timezone that lands in the school day', 'Bar is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Bar is Montenegro\'s principal port — the freight gateway, the ferry link to Italy, and the rail terminus of the Belgrade line — with Ulcinj\'s tourism economy south toward the Albanian border and no international schooling on either stretch. Bar shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the southern coast. Examinations at authorised centres confirmed per session with travel planned ahead.',
      cbc: 'Kenya CBC available for southern coast families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Bar: primary education is compulsory from six to fifteen, and by exception a parent may organise the child\'s primary education at home for one semester or one school year, with the school keeping records and the knowledge check at the end of the cycle. For shipping families the supplementary configuration is usually simpler — the local enrolment carries the obligation while the Cambridge track runs live alongside and travels with the family. Households resident across the border in Albania fall under Albanian law, where parental-choice home education is not established at all — a distinction decided by residence rather than workplace.',
    homeTuitionDetail: 'In-person tuition supplementation on the southern coast is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the local school day on the 1-2 hour offset, with the full recorded library built for rotations and the season.',
    faqs: [
      { q: 'Our family works at sea or in freight — can schooling hold together?', a: 'It is built for it: live classes with a complete recorded library, so the academic pace holds through long absences, with examinations sat at authorised centres wherever the family is.' },
      { q: 'We have ties across the Albanian border — whose rules apply?', a: 'Your country of residence. Montenegro permits home education by exception for a semester or a year; Albania does not establish a parental route at all. Where the line sits for your household is a question for your own advisers.' },
      { q: 'Where do southern coast students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into exam windows ahead.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'zabljak-me',
    name: 'Žabljak & the North',
    county: 'Durmitor and the northern municipalities',
    region: 'The Durmitor national park and Montenegro\'s highest town · the Tara canyon · a mountain tourism economy · Pljevlja, Bijelo Polje and Berane · no international schooling in the entire north',
    primaryKeyword: 'Online school and international curriculum in Žabljak and northern Montenegro',
    heroTagline: 'For Žabljak and northern families — Durmitor, the Tara canyon, and the part of the country the school map forgot.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across Žabljak and northern Montenegro. The north is the country\'s wild half — Durmitor national park and the Tara canyon draw rafting, hiking, and ski visitors from across Europe, Žabljak sits higher than any other town in Montenegro, and Pljevlja, Bijelo Polje, and Berane carry the region\'s industry, coal, and administration. It is also the part of the country furthest from anything: no international schooling exists in the entire north, and Podgorica is two to three hours over the mountains. Smartious delivers the pathways live at altitude — supplementary alongside a local enrolment, or as the academic spine within Montenegro\'s semester-at-a-time home provision.',
    heroImg: '/heroes/zabljak-me.jpg',
    altTexts: { hero: 'Durmitor national park and the northern Montenegrin mountains' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Žabljak and northern Montenegro families — Durmitor and the Tara, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling anywhere in the north, with Podgorica two to three hours over the mountains.',
      'Ski and rafting seasons run against the school calendar for tourism families.',
      'Home education is permitted by exception for a semester or a school year at a time.',
      'Winter access and mountain logistics shape every plan.',
      'Time zone: the north shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Mountain tourism, rafting, and ski-economy business families.',
      'Industry, mining, and administration families in Pljevlja, Bijelo Polje, and Berane.',
      'Mountain-sport families whose training will not fit a fixed timetable.',
      'Returning diaspora families across the northern municipalities.',
      'Students past the compulsory obligation running the full A-Level phase.',
    ],
    nearbyAreas: ['Žabljak', 'Durmitor and the Tara canyon', 'Pljevlja', 'Bijelo Polje', 'Berane', 'Kolašin', 'Mojkovac'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Russian and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Environmental Science, AP Biology',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Montenegrin, Serbian and EU university applications',
    ],
    whyChoose: [
      ['The complete option where the map stops', 'Identical live delivery from Žabljak to Berane — the international pathway the north never had.'],
      ['Built for the season and for mountain sport', 'Live classes plus unlimited recordings hold the academic pace through the ski and rafting seasons — the pattern our Austrian, Swiss, Slovak, and Georgian mountain families run.'],
      ['Geography and environmental science that fit the place', 'A national park and one of Europe\'s deepest canyons make unusually good context for Cambridge Geography and AP Environmental Science.'],
      ['The framework explained properly', 'Home education by exception for a semester or a year, with checks at the end of the cycle; supplementary alongside an enrolment where that is simpler.'],
      ['Timezone that lands in the school day', 'The north is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Northern Montenegro runs Durmitor national park, the Tara canyon, and a mountain tourism economy alongside the industry and administration of Pljevlja, Bijelo Polje, and Berane — with no international schooling anywhere in the region and Podgorica two to three hours over the mountains. The north shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the north. Examination sittings planned per session with travel scheduled well ahead and around the season.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in the north: primary education is compulsory from six to fifteen, and by exception a parent may organise the child\'s primary education at home for one semester or one school year, with the school keeping records and the knowledge check at the end of the cycle. In a region where winter access can be genuinely difficult, the semester framing and the cycle-based check are more workable than the annual all-subject regimes across the borders — though the supplementary configuration alongside a local enrolment remains the simplest arrangement for most families.',
    homeTuitionDetail: 'In-person tuition supplementation in the north is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the local school day on the 1-2 hour offset, with the full recorded library built for winter access and the seasons.',
    faqs: [
      { q: 'Is there any international schooling in northern Montenegro?', a: 'None — and Podgorica is two to three hours over the mountains. Live online delivery is the complete option for the north.' },
      { q: 'Our family runs a season business at Durmitor — can schooling fit that?', a: 'It is built for it: live classes with a complete recorded library, so the academic pace holds through the ski and rafting seasons.' },
      { q: 'Where do northern students sit Cambridge examinations?', a: 'At authorised centres confirmed per session, with travel planned well ahead and around winter access.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const MONTENEGRO_COUNTRY = {
  slug: 'montenegro',
  name: 'Montenegro',
  longName: 'Montenegro',
  adjective: 'Montenegrin',
  flag: '🇲🇪',
  hub: '/online-school/montenegro',
  hubPageId: 'homeschooling-montenegro',
  cityPageId: 'montenegro-city',

  currency: 'EUR',
  currencyName: 'Euro',
  currencyPeg: 'Approximate EUR conversion at ~EUR 0.92 per USD (2026 indicative rate; final invoicing in USD).',

  timezone: {
    code: 'CET/CEST',
    name: 'Central European Time (CET UTC+1, CEST UTC+2 summer)',
    utcOffset: '+1',
    offsetFromEAT: '-2 hours (CEST -1 hour summer)',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Podgorica checked first, with Serbian, Croatian, Albanian and Italian regional options where practical'],
  examCentreTiles: [
    { city: 'Podgorica', centre: 'Authorised provision', area: 'The country\'s main external-candidate capacity, confirmed per family per session.' },
    { city: 'The coast and the north', centre: 'Planned per session', area: 'Bay, Riviera, Bar, and northern families plan Podgorica windows with travel scheduled ahead.' },
    { city: 'Regional alternatives', centre: 'Four neighbours and Italy', area: 'Serbian, Croatian, Albanian, and — by ferry from Bar — Italian centres are worth checking where local capacity is limited.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Montenegro-based students sit as external candidates at authorised provision, with Podgorica checked first and capacity confirmed per family per session. Montenegro is small and well-connected for its size, so alternatives matter: Serbian, Croatian, and Albanian centres are within reach for border families, and Bar\'s ferries reach Italy directly. Coastal and northern families plan travel into each series well ahead, with winter access a real factor above Kolašin. Separately, note what a Smartious arrangement does and does not carry: in the supplementary configuration the school enrolment holds the Montenegrin obligation and its own assessment, and the Cambridge calendar simply runs alongside. For families using the home-education exception, the school keeps the records and the knowledge check falls at the end of the cycle — a lighter rhythm than the annual all-subject examinations in Slovenia, Serbia, or Bulgaria, and one we still plan around deliberately rather than leaving to the last cycle.',
  secondaryProgrammeExamRef: 'Authorised Podgorica and regional provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/montenegro.jpg',
  heroEyebrow: 'Online international school for Montenegro',
  heroH1Suffix: 'Montenegro',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for expat, yachting, tourism, industrial, and Montenegrin families across Podgorica, the Bay of Kotor, Budva, Nikšić, Bar, and the north. Montenegro sits between its neighbours: primary education is compulsory from six to fifteen, but a parent may — by exception — organise a child\'s primary education at home for a semester or a school year at a time, with the knowledge check falling at the end of the cycle rather than every year.',
  heroValueProp: 'From USD 180/month (~EUR 165/month). Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — supplementary beside any enrolment, or as the academic spine within the home-education exception.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Montenegro',

  citiesSectionTitle: 'Where our Montenegro families are',
  citiesSectionBody: 'Smartious Montenegro families concentrate across Podgorica (government, banking, the university, and what little international schooling exists), the Bay of Kotor and Tivat (Porto Montenegro\'s superyacht community, international and year-round), Budva and the Riviera (the tourism capital and a growing residential community), Nikšić (the industrial second city), Bar and the southern coast (the main port, the ferries to Italy, and Ulcinj), and Žabljak and the north (Durmitor, the Tara canyon, and the part of the country furthest from anything). One home-education exception measured in semesters, checks at the end of the cycle, and five regions out of six with nothing.',

  trustSignals: [
    { h: 'Two operational teaching centres', p: 'Live teaching to Montenegro families is delivered from two international-standard operational centres established 2022 and 2023.' },
    { h: 'CET/CEST timezone alignment', p: 'Montenegro runs CET (UTC+1) / CEST (UTC+2 summer) — only 1-2 hours behind Nairobi EAT, so live teaching lands naturally inside the school day.' },
    { h: 'The framework stated exactly', p: 'Primary education is compulsory from six to fifteen. By exception, a parent may organise the child\'s primary education at home for one semester or one school year — a real parental route, framed with a defined duration rather than as an open-ended right.' },
    { h: 'Lighter checkpoints than the neighbours', p: 'The school keeps the records, and the knowledge check for a home-educated pupil falls at the end of the cycle rather than annually in every subject as in Slovenia, Serbia, and Bulgaria. Fewer checkpoints, not lower standards.' },
  ],

  universitiesInCountry: 'The University of Montenegro at Podgorica with faculties across Nikšić, Kotor, Cetinje and Bijelo Polje, alongside the University of Donja Gorica and Mediterranean University — with a modest English-taught offer and strong regional links to Serbian and Croatian institutions.',
  universityChannels: 'Montenegrin universities admit holders of foreign secondary qualifications through recognition procedures, with programme-specific requirements and Montenegrin-language proficiency where a degree is taught in Montenegrin — Cambridge A-Levels and the IB Diploma are established international qualifications, confirmed per programme rather than assumed. In practice Montenegrin students are among the most regionally mobile in Europe: Serbian and Croatian universities admit them in large numbers and read these qualifications routinely, Italian universities are a ferry away from Bar and equally familiar with them, and German, Austrian, Slovenian, and Turkish institutions follow. UCAS reads A-Levels natively, the Common Application serves US plans, and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across Montenegrin, regional, UK (UCAS), and US destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Montenegro families, in either lawful shape: live supplementary Cambridge subjects beside a school enrolment, which needs nothing from anyone; or the academic spine within the home-education exception, where a parent organises primary education at home for a semester or a school year and the knowledge check falls at the end of the cycle. Classes land inside the school day on the 1-2 hour offset; examinations at authorised provision confirmed per session, with Serbian, Croatian, Albanian, and Italian regional options. Pathway read natively by UK universities via UCAS, recognised for Montenegrin university admission per programme, and accepted in 160+ countries.',
  britishCurriculumSuits: 'Montenegro families targeting the Cambridge pathway. Best fit for: (1) the international community around Porto Montenegro and the Bay of Kotor, (2) yachting and marine-industry families needing a curriculum that moves with the seasons, (3) coastal tourism and second-home families along the Riviera and in Ulcinj, (4) Nikšić\'s industrial and the north\'s mountain communities, where nothing exists at all, (5) Montenegrin families using the home-education exception who want an externally examined record behind it, (6) students past the compulsory obligation running the full A-Level phase.',
  britishCurriculumDelivery: 'Live online classes landing inside the school day on the 1-2 hour offset, small groups 4-6 students. Cambridge examinations at authorised provision, confirmed per session.',
  ibDiplomaSuits: 'Montenegro families targeting the IB Diploma\'s breadth — an alternative in a country with very little campus provision.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Montenegro families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in 2019 to make international qualifications (Cambridge, IB, American) accessible to families across emerging markets and international communities at online-delivery fees. Montenegro families join students in 47 other countries — from the Bay of Kotor to Nairobi\'s own Diamond Plaza HQ, Durmitor to the Adriatic.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Nikšić\'s industrial families, the marine-engineering households around Tivat, and every medicine-bound student in the capital. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Montenegro has the thinnest international-school market in our European coverage — a small number of private and international-leaning schools in and around Podgorica and the coast, and nothing at scale anywhere. That is not a criticism of the country; it is a function of a population smaller than most European cities. It does mean the competitive space here is unusually open: live delivery is frequently the only way a family reaches an internationally examined curriculum without leaving the country.',
  competitors: [
    { name: 'Private and international-leaning schools',      city: 'Podgorica and the coast', curriculum: 'Bilingual and international-leaning',  feesUsd: 'Local premium tier',                                feesAed: 'Varies',                  rating: 4.1, capacityNote: 'A small handful of options, none at scale' },
    { name: 'The Bay of Kotor and Tivat',                     city: 'Porto Montenegro area', curriculum: '—',                                     feesUsd: 'No international schooling at scale',                feesAed: '—',                       rating: 0,   capacityNote: 'One of the Mediterranean\'s superyacht centres, with an international community and no school built for it' },
    { name: 'The Riviera and the southern coast',             city: 'Budva, Bar, Ulcinj',    curriculum: '—',                                     feesUsd: 'No international provision',                        feesAed: '—',                       rating: 0,   capacityNote: 'The tourism capital and the main port — nothing' },
    { name: 'The interior and the north',                     city: 'Nikšić, Žabljak, Pljevlja', curriculum: '—',                                 feesUsd: 'No international provision',                        feesAed: '—',                       rating: 0,   capacityNote: 'The second city and the entire northern half of the country' },
    { name: 'Cross-border schools',                           city: 'Croatia, Serbia, Albania', curriculum: 'National systems',                   feesUsd: 'Varies',                                            feesAed: 'Cross-border',            rating: 4.0, capacityNote: 'Occasionally used by border families — and a different legal framework entirely' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh / bina (online)', city: 'Online',        curriculum: 'Cambridge self-paced / UK online / own to 15', feesUsd: 'Per-subject / GBP 9,000-11,000 / consultation', feesAed: 'Varies',      rating: 4.2, capacityNote: 'Self-paced, priced far above Smartious, or stopping at 15 — and none explains the semester-at-a-time exception or the cycle-based check' },
    { name: 'Smartious Homeschool (Montenegro via online delivery)', city: 'Delivered to all Montenegro', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: '~EUR 2,000-6,000/year', rating: 4.8, capacityNote: 'Every class live through A-Level + the home-education exception explained precisely + both configurations planned + the coast, the interior and the north served identically' },
  ],

  legalFrameworkIntro: 'Montenegro does not fit either regional pattern. It permits what Croatia, Albania, and North Macedonia forbid, and it checks less often than Slovenia, Serbia, and Bulgaria. Here is the framework exactly.',
  legalFramework: [
    { h: 'The obligation: six to fifteen, nine years', p: 'Under the Law on Primary Education and Upbringing, primary education is compulsory for all children aged six to fifteen and runs for nine years, and the parent must ensure the child fulfils that obligation — a pupil has met it after nine years of school attendance. One practical rule catches families out: a pupil who turns fifteen during the school year may not leave school before the end of that year. Primary education for those over fifteen falls under adult-education regulations, and secondary school is not compulsory.' },
    { h: 'The exception that makes Montenegro different', p: 'By way of exception to the ordinary rule, the law provides that a parent or guardian may organise the child\'s primary education at home during one semester, or one school year, in accordance with the law. That single sentence puts Montenegro in a category of its own in this region. Croatia, Albania, and North Macedonia establish no parental route at all — their "teaching at home" provisions are state-organised health measures. Montenegro genuinely does allow a parent to take the decision. What it does not do is make it open-ended: the provision is framed as an exception with a defined duration, so families plan it a semester or a year at a time, and what that means for consecutive periods is a question for the school and the Ministry rather than for us.' },
    { h: 'The oversight: records at the school, checks at the end of the cycle', p: 'Two features define how the arrangement is supervised, and both are lighter than the regional norm. The school keeps the records and documentation of a pupil educated at home — so the relationship stays with the school rather than a regional directorate or an inspectorate. And the knowledge check for a home-educated pupil is carried out at the end of the cycle: Montenegro\'s nine years run in three cycles, so checkpoints fall roughly every three years rather than every June. Set that beside Slovenia, Serbia, and Bulgaria, where home-educated pupils face annual examinations in every subject, and the difference in rhythm is substantial. We would put it carefully, though: fewer checkpoints are not lower standards, and a cycle-end check that arrives after three years of drift is harder to recover from than an annual one. The right response is to plan the national-curriculum coverage continuously anyway.' },
    { h: 'The two configurations, and which we usually recommend', p: 'Most international and expat families in Montenegro are better served by the supplementary arrangement: the local school enrolment carries the obligation entirely, needs nothing from anyone, and the Cambridge or IB track runs live alongside in the after-school slot. It is simple, it requires no exception to be invoked, and it produces the same externally examined record. Families who genuinely need to step out of daily schooling — because of a season, a relocation, a child the classroom is not serving — have a real route available, and we act as the academic spine within it: live teaching, continuous assessment of our own, documented progress, and Montenegrin-curriculum coverage kept visible so the cycle-end check is a formality.' },
    { h: 'Residency, not nationality', p: 'The obligation attaches to children resident in Montenegro. That matters more here than in most of the region, because the coast has drawn second-home owners, residence-permit holders, and yachting families who spend part of the year here while remaining registered elsewhere. Those families follow their country of residence\'s framework, whatever it provides — and in this neighbourhood that can differ sharply an hour\'s drive away. Where the line falls for a particular household depends on registration, permits, duration, and intent, and it belongs with their own advisers.' },
    { h: 'Where the qualifications lead', p: 'Montenegrin universities admit foreign secondary qualifications through recognition procedures with requirements confirmed per programme. Beyond that, Montenegrin students are among the most regionally mobile in Europe: Serbian and Croatian universities admit them in large numbers and read Cambridge and IB qualifications routinely, Italian universities are a ferry ride from Bar and equally familiar with them, and German, Austrian, Slovenian, and Turkish institutions follow. UCAS reads A-Levels natively, the Common Application serves US plans, and A-Levels are accepted in 160+ countries. For a country of this size, that breadth is the whole argument for an internationally examined record.' },
  ],

  whySmartious: [
    { h: 'The exception explained precisely, not oversold',                 p: 'A semester or a school year at a time, by exception — more than Croatia, Albania, or North Macedonia permit, and not an open-ended right. We describe it as the law does.' },
    { h: 'The cycle-end check planned for anyway',                          p: 'Checks fall at the end of the cycle rather than every June. That is a lighter rhythm, and it is also easier to drift through — so we keep national-curriculum coverage visible continuously.' },
    { h: 'The simpler configuration recommended where it fits',             p: 'For most international families, an ordinary enrolment plus a live Cambridge track after school produces the same record with no exception invoked at all.' },
    { h: 'Built for a coast that moves',                                    p: 'Porto Montenegro\'s yachting community and the Riviera\'s season both run on rhythms no fixed timetable matches. Live classes plus unlimited recordings do.' },
    { h: 'The interior and the north served identically',                   p: 'Nikšić, Žabljak, Pljevlja, and Berane have nothing at all, and Podgorica is hours away over mountains. Live delivery closes every gap the same way.' },
    { h: 'CET/CEST timezone alignment',                                     p: 'Only 1-2 hours behind Nairobi EAT — live teaching lands naturally inside the school day.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Montenegro?', a: 'Yes, by exception and for a defined period. Primary education is compulsory for children aged six to fifteen over nine years, but the law provides that a parent may organise the child\'s primary education at home during one semester or one school year. The school keeps the records and documentation, and the knowledge check for a home-educated pupil falls at the end of the cycle.' },
    { q: 'How does that compare with the neighbouring countries?', a: 'It is more than Croatia, Albania, or North Macedonia permit — none of them establishes a parental route, only state-organised health provisions — and lighter on checkpoints than Slovenia, Serbia, or Bulgaria, which examine home-educated pupils annually in every subject. Montenegro checks at the end of the cycle instead.' },
    { q: 'Can we use the exception indefinitely?', a: 'The law frames it as covering a semester or a school year, so families plan in those blocks. What that means for consecutive periods is a question for your school and the Ministry rather than for a provider\'s website.' },
    { q: 'Which configuration do you recommend?', a: 'For most international and expat families, the supplementary one: the local school enrolment carries the obligation and needs nothing from anyone, while the Cambridge or IB track runs live alongside after school. The exception is there for families who genuinely need to step out of daily schooling, and we act as the academic spine within it.' },
    { q: 'What happens after fifteen?', a: 'The compulsory obligation ends at fifteen, subject to the rule that a pupil turning fifteen mid-year finishes that school year, and primary education beyond that falls under adult-education rules. Secondary school is not compulsory, so the A-Level years run entirely at the family\'s choice.' },
    { q: 'We are here on a residence permit or part of the year — does the obligation apply?', a: 'It attaches to children resident in Montenegro. Where the residency line sits for your household depends on registration, permits, and circumstances — a question for your own advisers. We plan the education around whichever side of it you are on.' },
    { q: 'How much international schooling is there in Montenegro?', a: 'Very little — a small number of private and international-leaning schools in and around Podgorica and the coast, and nothing at scale. It is a function of a population smaller than most European cities, and it is why live delivery is frequently the only route to an internationally examined curriculum without leaving the country.' },
    { q: 'Where do Montenegrin students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session — Podgorica first, with Serbian, Croatian, Albanian, and Italian centres worth checking where local capacity is limited, and Bar\'s ferries reaching Italy directly.' },
    { q: 'Can my child access universities in the region with A-Levels?', a: 'Serbian and Croatian universities admit Montenegrin students in large numbers and read Cambridge and IB qualifications routinely; Italian, German, Austrian, Slovenian, and Turkish institutions follow. Montenegrin universities admit foreign qualifications through recognition procedures with requirements confirmed per programme, and UCAS and the Common Application stand open internationally.' },
    { q: 'Which parts of Montenegro does Smartious cover?', a: 'Podgorica, Kotor and Tivat and the Bay, Budva and the Riviera, Nikšić, Bar and the southern coast, and Žabljak and the north have dedicated pages with local context. Live online delivery works identically anywhere in the country — which in the north is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether your child is currently enrolled: in Montenegro the supplementary arrangement and the home-education exception are genuinely different plans, and that conversation belongs at the start.',
}
