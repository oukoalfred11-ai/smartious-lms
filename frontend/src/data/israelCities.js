// ═══════════════════════════════════════════════════════════════════
// ISRAEL — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for olim, high-tech, academic, and Israeli families
// across Tel Aviv, Jerusalem, Haifa, Be'er Sheva and the Sharon.
// FIRST MIDDLE EAST BUILD OF THIS SERIES — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// *** TONE RULE — ABSOLUTE ***
// NO political content of any kind. No commentary on any conflict,
// no territorial framing, no security commentary, no opinions on any
// party, policy or event. We are a school. Cities are described by
// their universities, industries and communities only. Where school
// disruption is mentioned it is mentioned exactly as it is on our
// Puerto Rico pages — as a neutral continuity argument for recorded
// lessons — in one sentence, with no cause attributed and no
// elaboration. If in doubt, cut it.
//
// LEGAL POSITIONING NOTE — ISRAEL IS A PERMISSION TIER, THE SAME
// FAMILY AS HUNGARY, SLOVAKIA, BULGARIA AND AUSTRIA IN OUR EUROPEAN
// COVERAGE. GET THE DETAIL RIGHT:
// - GOVERNING STATUTE: the COMPULSORY EDUCATION LAW, 1949 (with
//   amendments). Education is compulsory for children from age three
//   to fifteen inclusive, or until completion of TEN YEARS OF
//   SCHOOLING, beginning at the latest at age five. Free education
//   continues beyond that. HEDGE the exact boundaries — there have
//   been amendments — and route families to the Ministry.
// - AUTHORITY: the Ministry of Education (Misrad HaHinuch), edu.gov.il.
// - STREAMS: the law recognises State education (Mamlachti) and
//   State religious education (Mamlachti Dati), plus recognised but
//   not official institutions supervised by the Ministry (such as
//   Chinuch Atzmai and Maayan HaTorah), and independent institutions
//   recognised but not supervised. Parents may choose the STREAM but
//   NOT the specific school — the local school board refers children
//   in accordance with social integration policy. That last point is
//   genuinely useful and rarely explained to newcomers.
// - *** HOME EDUCATION IS PERMIT-BASED — THE CORE FACTS ***:
//   * The Director General's directive states the position of the
//     Israeli education system is that THE PLACE OF STUDENTS OF
//     COMPULSORY EDUCATION AGE IS WITHIN THE INSTITUTIONAL
//     EDUCATIONAL FRAMEWORK, and that educational authorities should
//     do everything possible to allocate a suitable learning
//     environment for each student. QUOTE THE SUBSTANCE — it sets
//     the formal posture.
//   * A PERMIT IS GRANTED FOR ONE SCHOOL YEAR ONLY and must be
//     renewed ANNUALLY.
//   * A child for whom home education is approved MUST MEET THE
//     STANDARDS SET BY THE EDUCATIONAL SYSTEM.
//   * DESPITE the stringent formal stance, the Ministry IN FACT
//     APPROVES THE VAST MAJORITY of requests — in 2006/2007 it
//     approved 155 and denied 8. Cite as a reported historical
//     figure, not as current data.
//   * Ministry policy SINCE 2009 has allowed home education on
//     condition the family fulfils state requirements, which the
//     SUPREME COURT wrote in a decision applies to most families who
//     request permission — the 2009 case commonly referenced as
//     ZINIGRAD. Report factually.
//   * Official Ministry internal guidelines for processing
//     applications have been published in Hebrew.
//   * REPORTED SCRUTINY — INCLUDE IT, IT IS FAIR AND USEFUL:
//     families have reported being summoned to Ministry tribunals
//     with concerns raised ranging from socialisation to other
//     matters, and threats to revoke permission. Report NEUTRALLY as
//     something families have reported; do not editorialise.
//   * The actual number of home-educated children is reported to be
//     higher than the official figure. Attribute as reported.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT, but unlike most
//   markets a lawful permitted route genuinely exists — so we can
//   describe full-time as available TO FAMILIES HOLDING A CURRENT
//   PERMIT, and only in those terms. NEVER imply we can obtain,
//   influence or substitute for a permit.
// - Smartious is not a Ministry of Education recognised institution
//   and issues no Israeli qualification. We do not teach toward the
//   Bagrut. Say both.
// TIMEZONE — *** THE CLOSEST IN OUR ENTIRE 89-COUNTRY COVERAGE ***:
// Israel runs IST at UTC+2, moving to IDT at UTC+3 for the summer.
// Our teaching base is UTC+3 year-round. So Israel is ONE HOUR
// BEHIND us in winter and EXACTLY THE SAME TIME in summer. Every
// hour of our teaching day is available. LEAD WITH THIS — no other
// country we serve is this close, and after-school, mid-morning and
// evening slots all work.
// MARKET NOTE: Israel has a large English-speaking and French-
// speaking olim population, a high-tech economy of global scale, and
// a strong university system (Hebrew University, Technion, Tel Aviv,
// Ben-Gurion, Weizmann, Bar-Ilan, Haifa). International schools
// exist but are few for the country's size — the Walworth Barbour
// American International School, the Anglican International School
// Jerusalem, Tabeetha School in Jaffa, the Eastern Mediterranean
// International School, and Jerusalem American International School.
// The national qualification is the BAGRUT. Many olim families want
// their children to retain a route back to UK, US, French or
// Canadian universities, and that is the central commercial case.
// ═══════════════════════════════════════════════════════════════════

export const ISRAEL_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'tel-aviv-il',
    name: 'Tel Aviv',
    county: 'Tel Aviv District',
    region: 'The commercial and technology capital · one of the world\'s densest start-up ecosystems · a large international and returning-diaspora professional community · few international schools for the city\'s profile',
    primaryKeyword: 'Online school and international curriculum in Tel Aviv',
    heroTagline: 'For Tel Aviv families — Cambridge and IB taught live in your own hours, because Israel is the closest country to our clock we teach.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Tel Aviv families. The city runs one of the densest technology and start-up ecosystems anywhere, with a professional community drawn from across the English-speaking and French-speaking world, and yet remarkably few international schools for that profile. Families who arrived mid-schooling, or who want their children to keep a route back to a university in London, New York, Paris or Toronto, come to us for one specific thing: an internationally examined record alongside the Israeli one. And Israel sits closer to our teaching clock than any country we serve.',
    heroImg: '/heroes/tel-aviv-il.jpg',
    altTexts: { hero: 'Tel Aviv and the Mediterranean' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Tel Aviv families — an internationally examined record alongside the Israeli one, in your own hours. From USD 400/month.',
    challenges: [
      'Few international schools relative to the city\'s international professional population.',
      'Children arriving mid-curriculum from English-speaking or French-speaking systems.',
      'Families wanting to keep a route back to UK, US, French or Canadian universities.',
      'Home education requires an annual Ministry permit and the child must meet system standards.',
      'Time zone: Israel is one hour behind us in winter and exactly the same time in summer — the closest in our coverage.',
    ],
    familySituations: [
      'Technology, start-up and venture families with international backgrounds.',
      'Olim who arrived mid-schooling from the UK, US, France, Canada or South Africa.',
      'Families whose children may apply to universities abroad.',
      'Households wanting A-Levels or the IB alongside the Israeli route.',
      'Students needing a subject their school cannot staff for a small group.',
      'Families holding a current home-education permit who need subject teaching.',
    ],
    nearbyAreas: ['Ramat Aviv', 'Jaffa', 'Herzliya Pituach', 'Ramat Gan', 'Givatayim', 'Petah Tikva', 'Rishon LeZion'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Canadian and Israeli university applications',
    ],
    whyChoose: [
      ['The closest clock we have', 'Israel is one hour behind our teaching base in winter and exactly level in summer, so every hour of our day is available — after school, mid-morning or evening, whichever suits.'],
      ['Computing and mathematics depth for a technology city', 'Cambridge A-Level Computer Science, Mathematics and Further Mathematics suit the sector that defines Tel Aviv.'],
      ['A route back for olim families', 'Cambridge A-Levels are read natively by UCAS and directly by American, French and Canadian universities — a record that travels in the direction many families came from.'],
      ['Live small groups, not self-study', 'Four to six students with a subject specialist, which is a different product from a curriculum package.'],
      ['Honest about the permit', 'Home education in Israel needs an annual Ministry permit and we cannot obtain or influence one. We teach; the permit is between the family and the Ministry.'],
    ],
    growingReason: 'Tel Aviv runs one of the densest technology and start-up ecosystems anywhere, with an international and returning-diaspora professional community and remarkably few international schools for that profile. Israel runs IST (UTC+2), moving to IDT (UTC+3) in summer — one hour behind our teaching base in winter and exactly level in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Tel Aviv families, taught alongside an Israeli school enrolment, or full-time for families holding a current home-education permit. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Tel Aviv families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the country\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Israeli education is governed by the Compulsory Education Law of 1949 and its amendments, administered by the Ministry of Education. Education is compulsory for children from age three to fifteen inclusive, or until completion of ten years of schooling beginning at the latest at age five, with free education continuing beyond that — and because the law has been amended over the years, families should confirm the boundaries applying to their own child with the Ministry rather than take them from an article. The law recognises State education and State religious education, alongside recognised but not official institutions supervised by the Ministry and independent institutions that are recognised but not supervised. One point newcomers often miss: parents may choose the stream their children attend but not the specific school, since the local school board refers children in accordance with social integration policy. On home education, Israel operates a permission tier rather than a prohibition or a free framework. The Director General\'s directive states that the position of the Israeli education system is that the place of students of compulsory education age is within the institutional educational framework, and that educational authorities should do everything possible to allocate a suitable learning environment for each student. A permit is granted for one school year only and must be renewed annually, and a child for whom home education is approved must meet the standards set by the educational system. In practice the picture is more accommodating than that formal posture suggests: the Ministry approves the great majority of requests — in 2006/2007 it approved 155 and denied 8 — and policy since 2009 has allowed home education on condition the family fulfils state requirements, which the Supreme Court noted in a decision applies to most families who request permission. Ministry internal guidelines for processing applications have been published in Hebrew. Families have also reported being summoned to Ministry tribunals over concerns ranging from socialisation to other matters, with the possibility of permission being revoked; we report that neutrally because a family planning around a permit should know it is reviewed rather than granted once. The number of children educated at home is reported to be higher than the official figure. What that means for us is simple: we teach, and the permit is entirely a matter between the family and the Ministry. Smartious is not a Ministry of Education recognised institution, issues no Israeli qualification, and does not teach toward the Bagrut.',
    homeTuitionDetail: 'Smartious delivers to Tel Aviv families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Israel sits one hour behind our teaching base in winter and exactly level in summer, so the entire teaching day is available — after-school, mid-morning and evening slots all work, which is true of no other country we serve. Every session is recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Israel?', a: 'It is permitted by annual permit from the Ministry of Education. The Director General\'s directive holds that students of compulsory education age belong within the institutional educational framework, a permit is granted for one school year only, and an approved child must meet the standards set by the educational system. In practice the Ministry approves the great majority of requests, and policy since 2009 has allowed home education where the family fulfils state requirements — which the Supreme Court noted applies to most families who apply. Apply to the Ministry directly.' },
      { q: 'Can Smartious get us a permit?', a: 'No, and no provider can. The permit is between your family and the Ministry of Education. What we do is teach the subjects, live and in small groups, whether you hold a permit or your child is enrolled at an Israeli school.' },
      { q: 'Do you teach the Bagrut?', a: 'No. We are not a Ministry of Education recognised institution and issue no Israeli qualification. We teach Cambridge, Pearson Edexcel, IB and AP examinations, which sit alongside the Israeli record rather than replacing it.' },
      { q: 'What are the class times?', a: 'Whatever suits — Israel is one hour behind us in winter and exactly level in summer, so our entire teaching day is available to you. No other country we serve is this close on the clock.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'jerusalem-il',
    name: 'Jerusalem',
    county: 'Jerusalem District',
    region: 'The seat of national institutions · the Hebrew University and a deep academic sector · a large English-speaking and French-speaking olim community · several long-established international schools',
    primaryKeyword: 'Online school and international curriculum in Jerusalem',
    heroTagline: 'For Jerusalem families — an internationally examined record for children who may study abroad, taught in your own hours.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Jerusalem families. The city holds national institutions, the Hebrew University and one of the deepest academic sectors in the region, and an unusually large English-speaking and French-speaking olim community — families who arrived from London, New York, Paris, Toronto or Johannesburg and who frequently want their children to keep a route back to universities there. A few long-established international schools serve part of that need. For everyone else, an internationally examined track alongside the Israeli one is the practical answer, and we teach it live in whichever hours suit.',
    heroImg: '/heroes/jerusalem-il.jpg',
    altTexts: { hero: 'Jerusalem hills and skyline' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Jerusalem families — a route back to UK, US, French and Canadian universities. From USD 400/month.',
    challenges: [
      'A large olim community with more demand for international qualifications than local places.',
      'Children arriving mid-curriculum from several different national systems.',
      'Families wanting to retain a route back to universities abroad.',
      'Home education requires an annual Ministry permit and the child must meet system standards.',
      'Time zone: Israel is one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'English-speaking and French-speaking olim families.',
      'Academic, research and university-sector households.',
      'Families whose children may apply to universities in the UK, US, France or Canada.',
      'Students who arrived mid-curriculum and do not want to restart.',
      'Families holding a current home-education permit who need subject teaching.',
    ],
    nearbyAreas: ['Rehavia', 'Baka', 'Talpiot', 'German Colony', 'Beit HaKerem', 'Mevaseret Zion', 'Modiin'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, History, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP World History',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Canadian and Israeli university applications',
    ],
    whyChoose: [
      ['A route back for olim families', 'Cambridge A-Levels are read natively by UCAS and directly by American, French and Canadian universities — the destinations Jerusalem\'s olim community most often has in view.'],
      ['French kept as an examined subject', 'For the substantial French-speaking community, Cambridge French runs alongside the English-medium core and French universities read the record routinely.'],
      ['Continuity for a mid-curriculum arrival', 'A child who has just changed country, language and school system does not need a fourth disruption. One pathway, taught live.'],
      ['The closest clock we have', 'One hour behind in winter, level in summer — our whole teaching day is available.'],
      ['Honest about the permit', 'We cannot obtain or influence a home-education permit. That is between the family and the Ministry; we teach the subjects.'],
    ],
    growingReason: 'Jerusalem holds national institutions, the Hebrew University and one of the deepest academic sectors in the region, alongside an unusually large English-speaking and French-speaking olim community whose children frequently keep university options abroad. Israel runs IST (UTC+2), moving to IDT (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Jerusalem families, taught alongside an Israeli school enrolment, or full-time for families holding a current home-education permit.',
      cbc: 'Kenya CBC available for Jerusalem families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Jerusalem. Education is compulsory under the Compulsory Education Law of 1949 and its amendments, from age three to fifteen inclusive or until completion of ten years of schooling beginning at the latest at age five, with free education continuing beyond — confirm the boundaries for your own child with the Ministry. Home education is permitted by annual permit: the Director General\'s directive holds that students of compulsory education age belong within the institutional educational framework, a permit runs for one school year only, and an approved child must meet the standards set by the educational system. In practice the Ministry approves the great majority of applications, and policy since 2009 has allowed home education where the family fulfils state requirements, which the Supreme Court noted in a decision applies to most families who request permission. Families have reported being summoned to Ministry tribunals over concerns including socialisation, with the possibility of permission being revoked, and we report that neutrally so that families understand a permit is reviewed rather than granted once. Smartious is not a Ministry of Education recognised institution, issues no Israeli qualification and does not teach toward the Bagrut — the permit and the Israeli record are matters between the family and the Ministry, and what we provide is the internationally examined track alongside them.',
    homeTuitionDetail: 'Smartious delivers to Jerusalem families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS across our full teaching day, with every session recorded so that a missed class is never a lost one.',
    faqs: [
      { q: 'We made aliyah mid-schooling — what happens to our child\'s record?', a: 'They keep an internationally examined pathway rather than restarting inside a new system. Cambridge A-Levels are read natively by UCAS and directly by American, French and Canadian universities, so the route back to where you came from stays open.' },
      { q: 'Can our children keep French formally?', a: 'Yes — Cambridge French runs alongside the English-medium core, which matters for Jerusalem\'s substantial French-speaking community and keeps French university routes open.' },
      { q: 'Do you handle the home-education permit?', a: 'No. Permits are granted annually by the Ministry of Education and no provider can obtain or influence one. We teach the subjects.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'haifa-il',
    name: 'Haifa & the North',
    county: 'Haifa District and the Galilee',
    region: 'The Technion and a major engineering and research sector · the country\'s principal port and petrochemical complex · a mixed and multilingual population · the Galilee and Krayot beyond the city',
    primaryKeyword: 'Online school and international curriculum in Haifa',
    heroTagline: 'For Haifa and northern families — a Technion city with engineering ambitions and few international options outside the centre.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Haifa and northern families. The city is built around the Technion and a major engineering, research and technology sector, alongside the country\'s principal port and its petrochemical complex, with the Krayot and the Galilee beyond. It is a strongly academic and multilingual region whose students aim at engineering and the sciences in numbers, and whose international school options are far fewer than in the centre of the country. We teach Cambridge and IB live across the north, in whichever hours suit.',
    heroImg: '/heroes/haifa-il.jpg',
    altTexts: { hero: 'Haifa bay and Mount Carmel' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Haifa and northern Israel families — Technion country, few international options. From USD 400/month.',
    challenges: [
      'Far fewer international school options than the centre of the country.',
      'A strongly academic region whose students aim at competitive engineering courses.',
      'Families in the Krayot and Galilee spread well beyond the city.',
      'Home education requires an annual Ministry permit and the child must meet system standards.',
      'Time zone: Israel is one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'Technion, engineering and research academic families.',
      'Port, petrochemical and industrial engineering households.',
      'Technology-sector families in the northern corridor.',
      'Multilingual households wanting a language kept formally alongside.',
      'Students aiming at engineering or the sciences abroad.',
    ],
    nearbyAreas: ['Carmel Centre', 'Neve Shaanan', 'Krayot', 'Nesher', 'Tirat Carmel', 'Nahariya', 'the Galilee'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Computer Science',
      'Cambridge A-Level Biology, Economics, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Canadian and Israeli university applications',
    ],
    whyChoose: [
      ['Engineering depth for a Technion city', 'Cambridge A-Level Mathematics, Further Mathematics, Physics and Computer Science — led by a founder with a BEd in Mathematics and Physics — for a region that produces engineers by tradition.'],
      ['The complete option outside the centre', 'Identical live delivery in Haifa, the Krayot and the Galilee as in Tel Aviv.'],
      ['Home languages kept formally', 'Cambridge Arabic and French run alongside the English-medium core in a genuinely multilingual region.'],
      ['The closest clock we have', 'One hour behind in winter, level in summer — our whole teaching day is available.'],
      ['Honest about the permit', 'We cannot obtain or influence a home-education permit; that is between the family and the Ministry.'],
    ],
    growingReason: 'Haifa is built around the Technion and a major engineering, research and technology sector, alongside the principal port and petrochemical complex, with the Krayot and Galilee beyond — a strongly academic and multilingual region with far fewer international school options than the centre. Israel runs IST (UTC+2), moving to IDT (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the north, taught alongside an Israeli school enrolment, or full-time for families holding a current home-education permit.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in the north: education is compulsory under the Compulsory Education Law of 1949 and its amendments, from age three to fifteen inclusive or until ten years of schooling are completed, and home education is permitted by annual permit from the Ministry of Education. The Director General\'s directive holds that students of compulsory education age belong within the institutional educational framework; a permit runs for one school year only; and an approved child must meet the standards set by the educational system. In practice the Ministry approves the great majority of requests, and policy since 2009 has allowed home education where the family fulfils state requirements, which the Supreme Court noted applies to most applicants. Families have reported Ministry tribunals reviewing permissions, which we note so that families plan for renewal rather than assume permanence. Smartious is not a Ministry of Education recognised institution, issues no Israeli qualification and does not teach toward the Bagrut.',
    homeTuitionDetail: 'Smartious delivers to northern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS across our full teaching day, with every session recorded.',
    faqs: [
      { q: 'Our child wants engineering — what should they take?', a: 'Cambridge A-Level Mathematics, Further Mathematics and Physics, with Computer Science or Chemistry as a fourth depending on the target course. It is the most common request we get from this city and the set we teach most.' },
      { q: 'Is there international schooling in Haifa?', a: 'Far less than in the centre of the country. Live delivery reaches Haifa, the Krayot and the Galilee identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'beer-sheva-il',
    name: 'Be\'er Sheva & the Negev',
    county: 'Southern District',
    region: 'Ben-Gurion University and a fast-growing technology and cyber sector · desert agriculture and water research of global significance · a large area with dispersed communities · minimal international schooling',
    primaryKeyword: 'Online school and international curriculum in Be\'er Sheva',
    heroTagline: 'For Be\'er Sheva and Negev families — a research and technology city in a very large district, with essentially no international schooling.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Be\'er Sheva and Negev families. The southern capital is built around Ben-Gurion University and a fast-growing technology, cyber and research sector, alongside desert agriculture and water research that is studied internationally. It is also a very large district with dispersed communities, and international schooling in the south is essentially non-existent — the centre of the country is an hour or more north. Live delivery closes that distance without a family moving, and Israel\'s clock means every hour of our teaching day is available.',
    heroImg: '/heroes/beer-sheva-il.jpg',
    altTexts: { hero: 'Be\'er Sheva and the Negev' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Be\'er Sheva and Negev families — research and technology city, no international schooling. From USD 400/month.',
    challenges: [
      'Essentially no international schooling in the southern district.',
      'A very large area with dispersed communities and long journeys.',
      'A research and technology sector whose families expect academic depth.',
      'Home education requires an annual Ministry permit and the child must meet system standards.',
      'Time zone: Israel is one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'Ben-Gurion University academic and research families.',
      'Technology, cyber and data-sector households in the growing southern hub.',
      'Desert agriculture, water research and environmental science families.',
      'Households in dispersed Negev communities far from any campus.',
      'Students aiming at competitive science and engineering courses.',
    ],
    nearbyAreas: ['Be\'er Sheva', 'Omer', 'Meitar', 'Lehavim', 'Arad', 'Dimona', 'the Negev communities'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Computer Science, Geography, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Computer Science A, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Canadian and Israeli university applications',
    ],
    whyChoose: [
      ['The complete option in a district with none', 'Identical live delivery in Be\'er Sheva, Omer, Arad and the dispersed Negev communities.'],
      ['Computing and mathematics depth for a cyber hub', 'Cambridge A-Level Computer Science, Mathematics and Further Mathematics suit the sector reshaping the southern capital.'],
      ['Environmental science that fits the place', 'Desert agriculture and water research make unusually serious ground for Cambridge Geography and AP Environmental Science.'],
      ['The closest clock we have', 'One hour behind in winter, level in summer — our whole teaching day is available.'],
      ['Reaches dispersed communities', 'No commute to a campus that does not exist, and every session recorded.'],
    ],
    growingReason: 'Be\'er Sheva is built around Ben-Gurion University and a fast-growing technology, cyber and research sector, alongside internationally studied desert agriculture and water research — in a very large district with dispersed communities and essentially no international schooling. Israel runs IST (UTC+2), moving to IDT (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the south, taught alongside an Israeli school enrolment, or full-time for families holding a current home-education permit. Examination travel planned per session well ahead.',
      cbc: 'Kenya CBC available for Negev families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in the south: education is compulsory under the Compulsory Education Law of 1949 and its amendments, and home education is permitted by annual permit from the Ministry of Education, granted for one school year only, with the approved child required to meet the standards set by the educational system. The Director General\'s directive holds that students of compulsory education age belong within the institutional educational framework, while in practice the Ministry approves the great majority of applications and policy since 2009 has allowed home education where the family fulfils state requirements — a position the Supreme Court noted applies to most applicants. Families have reported tribunals reviewing permissions, so plan for annual renewal rather than assuming permanence. Smartious is not a Ministry of Education recognised institution, issues no Israeli qualification and does not teach toward the Bagrut.',
    homeTuitionDetail: 'Smartious delivers to Negev families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS across our full teaching day, with every session recorded — which matters in a district where journeys are long.',
    faqs: [
      { q: 'Is there international schooling in the Negev?', a: 'Essentially none. The centre of the country is an hour or more north. Live delivery reaches Be\'er Sheva and the dispersed communities identically.' },
      { q: 'Our child is aiming at cyber or computer science — what should they take?', a: 'Cambridge A-Level Computer Science with Mathematics and Further Mathematics, and Physics where the target course wants it. Planned backward from the university from IGCSE onward.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'raanana-il',
    name: 'Ra\'anana & the Sharon',
    county: 'Central District',
    region: 'The heartland of Israel\'s English-speaking and French-speaking olim communities · a technology and corporate corridor · Herzliya, Kfar Saba and Netanya alongside · families with strong ties to the countries they came from',
    primaryKeyword: 'Online school and international curriculum in Ra\'anana',
    heroTagline: 'For Ra\'anana, Herzliya and Sharon families — the olim heartland, where keeping a route home matters as much as settling in.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Ra\'anana and Sharon families. The corridor through Ra\'anana, Herzliya, Kfar Saba and Netanya is the heartland of Israel\'s English-speaking and French-speaking olim communities — families who arrived from Britain, the United States, France, Canada and South Africa, often mid-schooling, and who keep close ties to the countries they came from. Alongside them runs a technology and corporate corridor with an internationally recruited workforce. The common question in both is the same: how does a child keep a record that reads back home? We teach exactly that, live, in whichever hours suit.',
    heroImg: '/heroes/raanana-il.jpg',
    altTexts: { hero: 'The Sharon corridor' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Ra\'anana, Herzliya and Sharon families — the olim heartland, with a record that reads back home. From USD 400/month.',
    challenges: [
      'Families arriving mid-curriculum from British, American, French, Canadian and South African systems.',
      'Strong demand for international qualifications and few local places.',
      'Children who may return abroad for university and need a readable record.',
      'Home education requires an annual Ministry permit and the child must meet system standards.',
      'Time zone: Israel is one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'English-speaking olim from the UK, US, Canada and South Africa.',
      'French-speaking olim communities across the Sharon and Netanya.',
      'Technology and corporate corridor households with international staff.',
      'Students who arrived mid-curriculum and do not want to restart.',
      'Families whose children will apply to universities abroad.',
    ],
    nearbyAreas: ['Ra\'anana', 'Herzliya', 'Kfar Saba', 'Netanya', 'Hod HaSharon', 'Even Yehuda', 'Ramat HaSharon'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE French, Spanish and home language support',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP US History',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Canadian, South African and Israeli university applications',
    ],
    whyChoose: [
      ['A record that reads where you came from', 'UCAS reads A-Levels natively; American, French, Canadian and South African universities read them and the IB directly. For an olim family that is the practical answer to the question they actually have.'],
      ['French and English both examined', 'Cambridge French for the francophone community and English Language and Literature throughout — both as formal qualifications rather than household languages.'],
      ['Continuity for a mid-curriculum arrival', 'A child who has just changed country, language and school system keeps one pathway instead of starting a third.'],
      ['The closest clock we have', 'One hour behind in winter, level in summer — after-school, mid-morning or evening, whichever fits your week.'],
      ['Honest about the permit', 'We cannot obtain or influence a home-education permit; that is between the family and the Ministry.'],
    ],
    growingReason: 'The Sharon corridor through Ra\'anana, Herzliya, Kfar Saba and Netanya is the heartland of Israel\'s English-speaking and French-speaking olim communities, alongside a technology and corporate corridor with an internationally recruited workforce — with strong demand for international qualifications and few local places. Israel runs IST (UTC+2), moving to IDT (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Sharon, taught alongside an Israeli school enrolment, or full-time for families holding a current home-education permit.',
      cbc: 'Kenya CBC available for Sharon families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision.',
      american: 'American Curriculum with AP — for the many families here targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies across the Sharon: education is compulsory under the Compulsory Education Law of 1949 and its amendments, from age three to fifteen inclusive or until ten years of schooling are completed, and home education is permitted by annual permit from the Ministry of Education. A permit runs for one school year only and the approved child must meet the standards set by the educational system; the Director General\'s directive holds that students of compulsory education age belong within the institutional educational framework. In practice the Ministry approves the great majority of applications, and policy since 2009 has allowed home education where the family fulfils state requirements, which the Supreme Court noted applies to most applicants. Families have reported being summoned to Ministry tribunals over concerns including socialisation, with permission potentially revoked — worth knowing when planning, because renewal is annual. One further point for olim families specifically: parents may choose the educational stream but not the specific school, since the local school board refers children in accordance with social integration policy, which frequently surprises newcomers. Smartious is not a Ministry of Education recognised institution, issues no Israeli qualification and does not teach toward the Bagrut.',
    homeTuitionDetail: 'Smartious delivers to Sharon families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS across our full teaching day, with every session recorded.',
    faqs: [
      { q: 'We made aliyah from London or New York — how does our child keep a route back?', a: 'With an internationally examined record. UCAS reads Cambridge A-Levels natively, and American, French, Canadian and South African universities read A-Levels and the IB directly. That runs alongside the Israeli record rather than replacing it.' },
      { q: 'We are a French-speaking family — can French be examined?', a: 'Yes. Cambridge French runs alongside the English-medium core as a formal qualification, and French universities read the record routinely.' },
      { q: 'Can we choose our child\'s school here?', a: 'Parents may choose the educational stream but not the specific school — the local school board refers children in accordance with social integration policy. It surprises many newcomers, and it is one reason families look at supplementary international teaching.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const ISRAEL_COUNTRY = {
  slug: 'israel',
  name: 'Israel',
  longName: 'State of Israel',
  adjective: 'Israeli',
  flag: '🇮🇱',
  hub: '/online-school/israel',
  hubPageId: 'homeschooling-israel',
  cityPageId: 'israel-city',

  currency: 'ILS',
  currencyName: 'Israeli New Shekel',
  currencyPeg: 'Fees are invoiced in USD; shekel equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'IST / IDT',
    name: 'Israel Standard Time (UTC+2), moving to Israel Daylight Time (UTC+3) for the summer',
    utcOffset: '+2 / +3',
    offsetFromEAT: 'One hour behind our teaching base in winter and exactly level in summer — the closest of any country we serve',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Israel has established Cambridge and IB provision through its international school sector, and AP testing is available through College Board arrangements'],
  examCentreTiles: [
    { city: 'Tel Aviv and the centre', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Jerusalem', centre: 'Regional provision', area: 'Checked first for Jerusalem and surrounding families.' },
    { city: 'Haifa and the south', centre: 'Planned per session', area: 'Northern and Negev families plan travel into each window ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Israel-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — the Tel Aviv area and Jerusalem are checked first, with travel planned ahead from Haifa, the Galilee and the Negev. Israel is geographically compact, so examination travel is generally a handful of day trips a year rather than a logistical exercise. Note what does not change: our arrangement runs alongside the Israeli record, which comes from an Israeli school or from whatever arrangement a family holds under a Ministry permit. Smartious is not a Ministry of Education recognised institution, issues no Israeli qualification, and does not teach toward the Bagrut — what we teach carries Cambridge, Pearson Edexcel, IB or AP validity instead.',
  secondaryProgrammeExamRef: 'Authorised Israeli Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/israel.jpg',
  heroEyebrow: 'Online school for Israel',
  heroH1Suffix: 'Israel',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for olim, high-tech, academic and Israeli families across Tel Aviv, Jerusalem, Haifa, Be\'er Sheva and the Sharon. Israel sits closer to our teaching clock than any country we serve — one hour behind in winter, exactly level in summer — so our entire teaching day is available to you.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — alongside your Israeli school, at whatever hour suits.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Israel',

  citiesSectionTitle: 'Where our Israel families are',
  citiesSectionBody: 'Smartious Israel families concentrate across Tel Aviv (the commercial and technology capital with few international schools for its profile), Jerusalem (national institutions, the Hebrew University and a large English- and French-speaking olim community), Haifa and the north (the Technion, the port and a strongly academic multilingual region), Be\'er Sheva and the Negev (Ben-Gurion University and a growing technology and cyber sector in a district with essentially no international schooling), and Ra\'anana and the Sharon (the olim heartland, where keeping a route back matters as much as settling in). One permit-based framework explained properly, and the closest timezone in our entire coverage.',

  trustSignals: [
    { h: 'The closest clock we have anywhere', p: 'Israel runs UTC+2 in winter and UTC+3 in summer against our UTC+3 year-round — one hour behind us in winter and exactly level in summer. Every hour of our teaching day is available, which is true of no other country in our coverage. After-school, mid-morning and evening slots all work.' },
    { h: 'The permit framework explained properly', p: 'Home education is permitted by annual Ministry permit, granted for one school year at a time, with the child required to meet the standards set by the educational system. The formal posture is stringent — and in practice the Ministry approves the great majority of applications.' },
    { h: 'What we cannot do, said first', p: 'We cannot obtain, influence or substitute for a Ministry permit, we are not a Ministry-recognised institution, we issue no Israeli qualification, and we do not teach toward the Bagrut. We teach subjects toward externally examined international qualifications.' },
    { h: 'Built for olim families', p: 'Many families here arrived from Britain, the United States, France, Canada or South Africa, often mid-schooling. Cambridge A-Levels are read natively by UCAS and directly by universities in all of those countries — a record that keeps the route back open.' },
  ],

  universitiesInCountry: 'the Hebrew University of Jerusalem, the Technion, Tel Aviv University, Ben-Gurion University of the Negev, Bar-Ilan University, the University of Haifa, the Weizmann Institute of Science and the Reichman University.',
  universityChannels: 'Israeli universities admit principally on the Bagrut together with the psychometric examination, and holders of foreign qualifications go through institutional recognition procedures with requirements confirmed per case — a family intending to enter the Israeli system should confirm that route early, and note that the Israeli side of a student\'s record has to come from an Israeli school or arrangement rather than from us. Outward, Israeli students apply in numbers to the United Kingdom, the United States, Canada and France, which reflects where a great many families came from: UCAS reads Cambridge A-Levels natively, American and Canadian universities read A-Levels, the IB Diploma and AP records directly, and French institutions assess Cambridge and IB qualifications through their own equivalence routes. A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across UK (UCAS), US, Canadian, French and Israeli destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Israel families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes at whatever hour suits — Israel sits one hour behind our teaching base in winter and exactly level in summer, so our full day is available — run alongside an Israeli school enrolment, or as a full programme for families holding a current Ministry home-education permit. Cambridge French and other home languages available beside the English-medium core. Examinations at authorised provision confirmed per session; Smartious issues no Israeli qualification and does not teach toward the Bagrut.',
  britishCurriculumSuits: 'Israel families targeting the Cambridge pathway. Best fit for: (1) olim families who arrived mid-schooling and want a route back to UK, US, French or Canadian universities, (2) families holding a current home-education permit who need live subject teaching, (3) Negev, Galilee and northern families where international schooling is minimal or absent, (4) technology-sector households wanting Computer Science and Further Mathematics at A-Level, (5) students needing a subject their school cannot staff for a small group.',
  britishCurriculumDelivery: 'Live online classes across our full teaching day, small groups 4-6 students, every session recorded, alongside an Israeli school or a permitted home-education arrangement.',
  ibDiplomaSuits: 'Israel families wanting the IB Diploma with live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Israel families targeting US universities via Common Application — a major destination given the size of the American olim community.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Israel is the closest country to us on the clock of the eighty-nine we serve — one hour in winter and none at all in summer — which makes it the one market where a family can genuinely pick any hour of our teaching day that suits them.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Haifa\'s Technion-facing families, Be\'er Sheva\'s technology and cyber households, and Tel Aviv\'s start-up community. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Israel has a small number of long-established international schools — the Walworth Barbour American International School, the Anglican International School Jerusalem, Tabeetha School in Jaffa, the Eastern Mediterranean International School and the Jerusalem American International School — which is remarkably few for a country with this scale of English-speaking and French-speaking immigration and this size of technology sector. They are good, their places are limited, and they are concentrated in the centre and Jerusalem. Outside that, most international qualification demand is met through private tuition or not at all.',
  competitors: [
    { name: 'Walworth Barbour American International School',  city: 'Even Yehuda / centre',   curriculum: 'American and AP',                       feesUsd: 'International tier',                                feesAed: 'Premium',                 rating: 4.7, capacityNote: 'Long-established and strong — limited places, centre-bound' },
    { name: 'Anglican International School Jerusalem',         city: 'Jerusalem',              curriculum: 'British / IGCSE and IB',                feesUsd: 'International tier',                                feesAed: 'Competitive places',      rating: 4.5, capacityNote: 'The closest local comparison to our Cambridge track' },
    { name: 'Eastern Mediterranean International School',      city: 'Hakfar Hayarok',         curriculum: 'IB Diploma, boarding',                  feesUsd: 'Premium tier',                                      feesAed: 'Selective',               rating: 4.6, capacityNote: 'Selective IB boarding — a different proposition entirely' },
    { name: 'Tabeetha School',                                 city: 'Jaffa',                  curriculum: 'British / IGCSE',                       feesUsd: 'Mid to premium tier',                               feesAed: 'Limited places',          rating: 4.3, capacityNote: 'Long history and small — one of very few British-curriculum options' },
    { name: 'Haifa, the Galilee and the Negev',                city: 'North and south',        curriculum: 'Minimal to none',                       feesUsd: 'No real international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'A Technion city and a growing technology capital, neither with international schooling' },
    { name: 'Private tuition',                                 city: 'Nationwide',             curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Widespread',              rating: 4.0, capacityNote: 'The default answer to an international qualification gap — usually one-to-one and unstructured across a year' },
    { name: 'Smartious Homeschool (Israel via online delivery)', city: 'Delivered nationwide',  curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP',   feesUsd: 'USD 2,160-6,480/year',                              feesAed: 'ILS equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + our entire teaching day available on Israel\'s clock + the north and Negev reached + honest that we cannot help with a permit' },
  ],

  legalFrameworkIntro: 'Israel operates a permission tier: home education is lawful but requires an annual permit, and the formal posture is stricter than the practice. Both halves matter, and so does what a provider like us cannot do.',
  legalFramework: [
    { h: 'The governing statute and what is compulsory', p: 'The Compulsory Education Law of 1949, with its amendments, governs Israeli education, administered by the Ministry of Education. Education is compulsory for children from age three to fifteen inclusive, or until the completion of ten years of schooling, beginning at the latest at age five, with free education continuing beyond that point. Because the law has been amended over the decades, a family should confirm the boundaries applying to their own child with the Ministry rather than take them from any article, ours included.' },
    { h: 'Streams, and the choice parents do not have', p: 'The law recognises State education and State religious education, alongside institutions that are recognised but not official and supervised by the Ministry, and independent institutions that are recognised but not supervised. Parents have the right to choose the stream their children attend — and, this often surprises newcomers, not the specific school: the local school board refers children in accordance with social integration policy. For olim families arriving with expectations formed elsewhere, that is one of the more consequential things to know early, and it is a common reason families begin looking at supplementary international teaching.' },
    { h: 'Home education: a permit, renewed every year', p: 'Israel permits home education by permit from the Ministry of Education, and the framework has three features families should plan around. The permit is granted for one school year only and must be renewed annually. A child for whom home education is approved must meet the standards set by the educational system. And the formal position is stringent: the Director General\'s directive states that the position of the Israeli education system is that the place of students of compulsory education age is within the institutional educational framework, and that educational authorities ought to do everything possible to allocate a suitable learning environment for each student.' },
    { h: 'And the practice, which is more accommodating', p: 'Despite that formal posture, the Ministry in fact approves the great majority of requests — in the 2006/2007 year it approved 155 applications and denied 8, which we cite as a reported historical figure rather than current data. Ministry policy since 2009 has allowed home education on condition the family fulfils state requirements, a position the Supreme Court noted in a decision applies to most families who request permission. The Ministry has published internal guidelines in Hebrew for processing applications. The number of children actually educated at home is reported to be higher than the official figure. Families have also reported being summoned to Ministry tribunals over concerns ranging from socialisation to other matters, with the possibility of permission being revoked — we mention that not to alarm anyone but because a permit is reviewed annually rather than granted once, and a family should plan on that basis.' },
    { h: 'What we can and cannot do', p: 'This needs saying plainly. Smartious cannot obtain a Ministry permit, cannot influence one, and cannot substitute for one — that relationship is entirely between a family and the Ministry of Education, and any provider suggesting otherwise should be treated with caution. We are not a Ministry-recognised institution, we issue no Israeli qualification, and we do not teach toward the Bagrut. What we do is teach subjects: live small-group Cambridge, Pearson Edexcel, IB and AP classes toward externally examined international qualifications, either alongside an Israeli school enrolment or as the academic programme for a family that already holds a permit.' },
    { h: 'The clock, which is the best in our coverage', p: 'One practical advantage worth stating clearly because it is unique. Israel runs Israel Standard Time at UTC+2, moving to Israel Daylight Time at UTC+3 for the summer. Our teaching base runs UTC+3 year-round. That puts Israel one hour behind us in winter and exactly level in summer — closer than any of the other eighty-eight countries we serve. Every hour of our teaching day is available to an Israeli family: an after-school class at four in the afternoon, a mid-morning session for a student on a permitted home-education programme, or an evening slot all work equally. In most of our markets the timetable is a constraint to be worked around. Here it simply is not one.' },
  ],

  whySmartious: [
    { h: 'The closest clock of any country we serve',                     p: 'One hour behind in winter, exactly level in summer. Our entire teaching day is available — after-school, mid-morning or evening.' },
    { h: 'A route back for olim families',                                p: 'UCAS reads Cambridge A-Levels natively, and American, French, Canadian and South African universities read A-Levels and the IB directly.' },
    { h: 'The permit framework explained, including what we cannot do',   p: 'Annual permits, system standards, a stringent formal posture and an accommodating practice — and no ability on our part to obtain or influence one.' },
    { h: 'The north and the Negev reached',                               p: 'Haifa, the Galilee and the southern district have minimal or no international schooling. Live delivery reaches all of them identically.' },
    { h: 'French and home languages examined',                            p: 'Cambridge French for the substantial francophone community, alongside English Language and Literature — formal qualifications rather than household languages.' },
    { h: 'Computing depth for a technology economy',                      p: 'Cambridge A-Level Computer Science, Mathematics and Further Mathematics for Tel Aviv\'s start-up sector and Be\'er Sheva\'s cyber hub.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Israel?', a: 'Yes, by permit. The Ministry of Education grants home-education permits for one school year at a time, renewable annually, and a child for whom home education is approved must meet the standards set by the educational system. The Director General\'s directive holds that students of compulsory education age belong within the institutional educational framework — but in practice the Ministry approves the great majority of requests, and policy since 2009 has allowed home education where the family fulfils state requirements, which the Supreme Court noted applies to most applicants.' },
    { q: 'Can Smartious help us get a permit?', a: 'No, and no provider can. The permit is entirely between your family and the Ministry of Education. We teach the subjects — live, in small groups — whether you hold a permit or your child is enrolled at an Israeli school.' },
    { q: 'Do you teach the Bagrut?', a: 'No. We are not a Ministry of Education recognised institution and issue no Israeli qualification. We teach Cambridge, Pearson Edexcel, IB and AP examinations, which sit alongside the Israeli record rather than replacing it.' },
    { q: 'How close is the timezone really?', a: 'Closer than any country we serve. Israel runs UTC+2 in winter and UTC+3 in summer; we teach from UTC+3 year-round. So you are one hour behind us in winter and exactly level in summer, and every hour of our teaching day is available to you.' },
    { q: 'We made aliyah mid-schooling — what happens to our child\'s record?', a: 'They keep an internationally examined pathway rather than restarting. Cambridge A-Levels are read natively by UCAS and directly by American, French, Canadian and South African universities, so the route back to where you came from stays open alongside the Israeli one.' },
    { q: 'Can we choose our child\'s school in Israel?', a: 'Parents may choose the educational stream but not the specific school — the local school board refers children in accordance with social integration policy. It surprises many newcomers and is a common reason families look at supplementary international teaching.' },
    { q: 'Where do Israeli students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session — the Tel Aviv area and Jerusalem are checked first, with travel planned ahead from Haifa, the Galilee and the Negev. Israel is compact enough that this is a handful of day trips a year.' },
    { q: 'Which parts of Israel does Smartious cover?', a: 'Tel Aviv, Jerusalem, Haifa and the north, Be\'er Sheva and the Negev, and Ra\'anana and the Sharon have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether your child is at an Israeli school or on a permitted home-education programme, and which country you would want their record to read in: those two answers shape the whole plan.',
}
