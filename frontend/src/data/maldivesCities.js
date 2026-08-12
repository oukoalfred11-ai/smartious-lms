// ═══════════════════════════════════════════════════════════════════
// MALDIVES — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for atoll, resort-sector, professional and
// Maldivian families across Malé, Addu, Kulhudhuffushi, Fuvahmulah
// and the resort islands.
// FIRST INDIAN OCEAN / SOUTH ASIA BUILD OF THIS SERIES — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// *** THE HEADLINE FINDING — THIS CHANGES THE WHOLE PITCH ***
// CAMBRIDGE AND EDEXCEL ARE THE NATIONAL SECONDARY SYSTEM IN THE
// MALDIVES. This is the Mauritius situation, and it is stronger here.
// - IGCSE examinations were introduced in 2002 for GRADE 10 (O-level)
//   and GRADE 12 (A-level) students, to qualify for the DIPLOMA OF
//   LOWER AND UPPER SECONDARY EDUCATION. They are not a foreign
//   alternative — they ARE the certification route.
// - The national curriculum covers primary and middle school; the
//   SECONDARY CURRICULUM CONTENT IS DESIGNED AROUND THE O-LEVEL AND
//   A-LEVEL EXAMINATIONS OFFERED BY EDEXCEL. Islamic studies, Dhivehi
//   language and fisheries science are designed LOCALLY, even at
//   secondary level.
// - Lower secondary students prepare for IGCSE and GCE O level in
//   SIX SUBJECTS, INCLUDING TWO LOCAL SUBJECTS — ISLAM AND DHIVEHI.
// - Structure: primary 7 years from age 6; lower secondary 3 years
//   leading to the SSC; upper secondary 2 years leading to the HSSC.
//   British-patterned schools: primary 8 years, secondary 3 years to
//   IGCSE, upper secondary 2 years to A-Level.
// - NEVER pitch Cambridge as foreign, international or novel here.
//   It is the national route. The correct framing is SUBJECT ACCESS,
//   TEACHER DEPTH and DISTANCE — not curriculum introduction.
// - WE DO NOT TEACH ISLAM OR DHIVEHI. Those are locally designed and
//   belong to the school. SAY SO EXPLICITLY on every page — it is
//   both accurate and respectful, and it defines the arrangement:
//   the school carries the local subjects and the domestic record,
//   we carry the examined international subjects.
//
// *** THE EXAMINATION SYSTEM — UNUSUALLY GOOD FOR US ***
// The DEPARTMENT OF PUBLIC EXAMINATIONS (DPE), established
// 1 September 1989 under the Ministry of Education, organises
// NATIONAL AND INTERNATIONAL examinations and has ESTABLISHED
// EXAMINATION CENTRES AT DIFFERENT LOCATIONS ACROSS THE MALDIVES.
// It handles IGCSE / GCE O'Level, SSC, Edexcel A'Level, HSC,
// Cambridge English and On Demand examinations.
// CONSEQUENCE: the examination-logistics problem that dogs most of
// our markets is largely already solved here by the state. Say so.
//
// *** THE CAVEAT THAT MUST ALWAYS APPEAR ***
// Private-candidate availability VARIES BY SYLLABUS. For example,
// Cambridge IGCSE Marine Science (0697) is available to CENTRES IN
// THE MALDIVES ONLY and is NOT AVAILABLE TO PRIVATE CANDIDATES, with
// Cambridge schools allocated to one of six administrative zones each
// with its own timetable. NEVER promise a specific syllabus without
// confirming private-candidate eligibility per subject per session.
// This is the single most important operational caution on these
// pages — state it plainly.
//
// LEGAL POSITIONING NOTE:
// - Education is administered by the MINISTRY OF EDUCATION, with the
//   DEPARTMENT OF HIGHER EDUCATION alongside for the tertiary level.
// - Education is compulsory. State generally; route families to the
//   Ministry for current boundaries.
// - HOME EDUCATION: we could NOT verify a specific framework. Phrase
//   as "we could not verify" / "we are not aware of a specific
//   framework" plus "confirm with the Ministry of Education". NEVER
//   assert permitted, NEVER assert prohibited. Reuse the
//   absence-of-regulation-is-not-permission argument.
// - Smartious is NOT a Ministry-registered Maldivian school; say so.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT.
//
// TIMEZONE: MVT (UTC+5), no seasonal changes — TWO HOURS AHEAD of
// our teaching base. Maldivian after-school and evening hours land
// squarely in our teaching day: 16:00 Maldives = 14:00 for us,
// 18:00 = 16:00, 20:00 = 18:00. Excellent relationship.
//
// GEOGRAPHY — THE CORE MARKET CASE:
// The Maldives comprises 26 atolls with around 200 inhabited islands
// and a population scattered across them, with rapid internal
// migration toward Malé. Income disparity between Malé and the outer
// atolls has increased, and that disparity is reflected in schools:
// Malé's schools have a higher level of resources, both human and
// material. Atoll participation in O-levels has risen dramatically —
// from 821 atoll candidates in 1999 to 5,235 in 2009 — so demand is
// there and teaching capacity is the constraint. THIS IS THE
// ARGUMENT: not that Cambridge is unavailable, but that a subject
// specialist is, on an island of a few hundred people.
// ═══════════════════════════════════════════════════════════════════

export const MALDIVES_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'male-mv',
    name: 'Malé & Greater Malé',
    county: 'Kaafu Atoll',
    region: 'The capital and the country\'s administrative and commercial centre · Hulhumalé and Villimalé alongside · the schools with the deepest human and material resources in the country · a destination for internal migration from the atolls',
    primaryKeyword: 'Online school and international curriculum in Malé',
    heroTagline: 'For Malé families — Cambridge is already your national route. What we add is a subject specialist for the sets your timetable cannot fill.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Malé and Greater Malé families. We should be clear about something at the outset that distinguishes the Maldives from almost every market we serve: Cambridge and Edexcel are not a foreign alternative here — they are the national secondary route. IGCSE was introduced in 2002 for grade 10 and A-Level for grade 12, and the secondary curriculum is designed around those examinations. So we are not introducing anything. What we add in Malé is narrower and more useful: subject specialists for the A-Level sets a single school timetable cannot sustain.',
    heroImg: '/heroes/male-mv.jpg',
    altTexts: { hero: 'Malé and the atoll' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel and IB for Malé families — subject specialists for the sets your school cannot staff, on the national Cambridge route. From USD 400/month.',
    challenges: [
      'Specialist A-Level subjects often will not run for small cohorts even in well-resourced schools.',
      'Competitive places at the strongest Malé schools, with internal migration adding pressure.',
      'Private-candidate availability varies by syllabus and must be confirmed per subject per session.',
      'Education is compulsory and administered by the Ministry of Education.',
      'Time zone: the Maldives runs MVT (UTC+5), two hours ahead of us — so after-school and evening classes work well.',
    ],
    familySituations: [
      'Families whose school cannot run a specialist A-Level subject for a small group.',
      'Students aiming at competitive courses abroad who want a fuller subject set.',
      'Professional and administrative households in the capital.',
      'Families who have moved to Malé from the atolls for schooling.',
      'Students preparing for Edexcel A-Level alongside additional Cambridge subjects.',
      'Households wanting an IB or AP route alongside the national Cambridge one.',
    ],
    nearbyAreas: ['Malé', 'Hulhumalé', 'Villimalé', 'Hulhulé', 'Vilimalé', 'Thilafushi', 'North Malé Atoll'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level — the route most Maldivian schools follow',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Biology',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Malaysian, Australian, Indian, Sri Lankan and Maldivian university applications',
      'Note: we do not teach Islam or Dhivehi — those are locally designed subjects and belong to your school',
    ],
    whyChoose: [
      ['We are not introducing Cambridge — you already have it', 'IGCSE and Edexcel A-Level are the national secondary route here. Pretending otherwise would be absurd. What we add is teaching depth in specific subjects.'],
      ['The set your timetable cannot fill', 'Further Mathematics, a third science, or Computer Science at A-Level for four students is unviable on one timetable and routine in a live group drawn from several countries.'],
      ['Clear about what belongs to your school', 'Islam and Dhivehi are locally designed subjects and we do not teach them. Your school carries those and the domestic record; we carry the examined international subjects.'],
      ['After-school hours that work', 'Two hours ahead of our teaching base, so a four o\'clock class here is two o\'clock for our teachers.'],
      ['Honest about private-candidate rules', 'Availability varies by syllabus — some are restricted to centres in the Maldives and not open to private candidates. We confirm per subject per session rather than promise.'],
    ],
    growingReason: 'Malé is the country\'s administrative and commercial centre with Hulhumalé and Villimalé alongside, holding the schools with the deepest human and material resources in the country and absorbing steady internal migration from the atolls. The Maldives runs MVT (UTC+5), two hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — taught alongside your school\'s programme, which in the Maldives already runs on IGCSE and Edexcel A-Level. Our role is subject depth rather than curriculum substitution. Private-candidate eligibility confirmed per subject per session.',
      cbc: 'Kenya CBC available for Malé families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision for families wanting that route.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The Maldives is unusual in our coverage and it is worth stating the position accurately. The education system is overseen by the Ministry of Education, with the Department of Higher Education alongside at tertiary level, and education is compulsory — confirm the current boundaries with the Ministry rather than take them from a provider. Structurally, primary runs seven years from age six, lower secondary three years leading to the Secondary School Certificate, and upper secondary two years leading to the Higher Secondary School Certificate; British-patterned schools run primary for eight years, secondary three years to IGCSE, and upper secondary two years to A-Level. What makes the country distinctive is that the international examinations are the national route: IGCSE was introduced in 2002 for grade 10 and A-Level for grade 12 to qualify students for the diploma of lower and upper secondary education, and the secondary curriculum content is designed around the O-level and A-level examinations offered by Edexcel — while Islamic studies, Dhivehi language and fisheries science are designed locally even at secondary level. Lower secondary students prepare for IGCSE and GCE O level in six subjects, two of which are the local subjects Islam and Dhivehi. We do not teach Islam or Dhivehi and would not attempt to; those belong to your school, as does the domestic record. On parental home education we could not verify a specific Maldivian framework, and we will not guess in either direction — an absence of clear regulation is an absence of protection rather than a permission, and a family whose plan depends on it should put the question to the Ministry of Education directly. Smartious is not a Ministry-registered Maldivian school and issues no Maldivian qualification. Our arrangement is live subject teaching alongside a Maldivian school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Malé families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. The Maldives runs two hours ahead of our teaching base with no seasonal changes on either side, so a four or six o\'clock class here sits comfortably inside our teaching day, at the same time every week of the year, with every session recorded.',
    faqs: [
      { q: 'Cambridge is already our national system — why would we need you?', a: 'Exactly because it is. We are not introducing a curriculum; we are supplying a subject specialist for the A-Level sets a single school timetable cannot sustain — Further Mathematics, a third science, Computer Science. That is a teaching-capacity problem, not a curriculum one.' },
      { q: 'Do you teach Islam and Dhivehi?', a: 'No, and we would not attempt to. Those are locally designed subjects and belong to your school, along with the domestic record. We teach the examined international subjects alongside them.' },
      { q: 'Can our child enter any Cambridge subject as a private candidate?', a: 'Not necessarily — availability varies by syllabus, and some are restricted to centres in the Maldives and not open to private candidates. We confirm eligibility per subject per session before entering anyone, rather than promising a syllabus we have not checked.' },
      { q: 'What time are classes?', a: 'After-school or evening works well. The Maldives is two hours ahead of our teaching base, so a four o\'clock class here is two o\'clock for our teachers.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'addu-mv',
    name: 'Addu City',
    county: 'Addu Atoll',
    region: 'The southernmost atoll and the country\'s second urban centre · linked islands with a causeway network · an airport, a growing services sector and a long educational tradition · far fewer teaching resources than Malé',
    primaryKeyword: 'Online school and international curriculum in Addu City',
    heroTagline: 'For Addu families — the second city, five hundred kilometres south, with a fraction of the capital\'s teaching resources.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Addu City families. The southernmost atoll is the country\'s second urban centre — linked islands joined by a causeway network, an international airport, a growing services sector and an educational tradition older than most in the country. What Addu does not have is the depth of teaching resource concentrated in Malé, five hundred kilometres north, and that gap is human rather than curricular: the Cambridge and Edexcel route is the same one students follow everywhere in the Maldives. Live delivery closes the teaching gap without a family moving.',
    heroImg: '/heroes/addu-mv.jpg',
    altTexts: { hero: 'Addu Atoll' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel and IB for Addu City families — the second city with a fraction of Malé\'s teaching resources. From USD 400/month.',
    challenges: [
      'Far fewer human and material teaching resources than Malé, five hundred kilometres north.',
      'Specialist A-Level subjects rarely available locally for small cohorts.',
      'Families who would otherwise send a child to Malé for upper secondary.',
      'Private-candidate availability varies by syllabus and must be confirmed.',
      'Time zone: two hours ahead of our teaching base — after-school and evening classes work well.',
    ],
    familySituations: [
      'Families whose local school cannot staff a specialist A-Level subject.',
      'Households considering sending a child to Malé for upper secondary.',
      'Services, airport and commercial-sector families.',
      'Students aiming at competitive courses abroad from an outer atoll.',
      'Teaching and professional households across the linked islands.',
    ],
    nearbyAreas: ['Hithadhoo', 'Maradhoo', 'Feydhoo', 'Hulhudhoo', 'Meedhoo', 'Gan', 'the Addu causeway'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Physics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Malaysian, Australian, Indian, Sri Lankan and Maldivian university applications',
      'Note: we do not teach Islam or Dhivehi — those are locally designed subjects and belong to your school',
    ],
    whyChoose: [
      ['The alternative to sending a child north', 'Addu families have sent students to Malé for upper secondary for generations. Live delivery supplies the subject teaching without the move.'],
      ['A specialist for the subject nobody local can teach', 'On an atoll this size, Further Mathematics or A-Level Physics may have no available specialist. In a live group drawn from several countries, it does.'],
      ['The same examinations, better taught', 'Cambridge and Edexcel are the national route here. We are not changing the qualification, only who teaches it.'],
      ['After-school hours that work', 'Two hours ahead of our teaching base — a four o\'clock class here is two o\'clock for our teachers.'],
      ['Clear about what belongs to your school', 'Islam and Dhivehi are locally designed and we do not teach them.'],
    ],
    growingReason: 'Addu City is the southernmost atoll and the country\'s second urban centre — linked islands joined by a causeway network, an international airport, a growing services sector and a long educational tradition — with far fewer teaching resources than Malé five hundred kilometres north. The Maldives runs MVT (UTC+5), two hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — taught alongside your school\'s existing Cambridge or Edexcel programme, supplying subject depth rather than a different curriculum. Private-candidate eligibility confirmed per subject per session.',
      cbc: 'Kenya CBC available for Addu families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Addu: education is overseen by the Ministry of Education and is compulsory, the secondary curriculum is designed around the O-level and A-level examinations offered by Edexcel, and Islamic studies, Dhivehi and fisheries science are designed locally — we do not teach the local subjects and they belong to your school along with the domestic record. On parental home education we could not verify a specific Maldivian framework and decline to read that silence in either direction; confirm with the Ministry of Education directly. Smartious is not a Ministry-registered Maldivian school and issues no Maldivian qualification. One practical point in Addu\'s favour: the Department of Public Examinations has established examination centres at locations across the Maldives, so the examination logistics that complicate our work in most markets are largely already handled by the state here — though private-candidate availability varies by syllabus and we confirm it per subject per session.',
    homeTuitionDetail: 'Smartious delivers to Addu families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school and evening blocks, with every session recorded.',
    faqs: [
      { q: 'Would our child still need to move to Malé for upper secondary?', a: 'Not for the teaching. Live delivery supplies subject specialists from Addu identically, and the Department of Public Examinations has established examination centres at locations across the country — so the sitting is generally handled locally too.' },
      { q: 'Our school cannot offer Further Mathematics — can you?', a: 'Yes, and it is the most common request we get from the atolls. A subject that has no available specialist on one island runs routinely in a live group drawn from several countries.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'kulhudhuffushi-mv',
    name: 'Kulhudhuffushi & the North',
    county: 'Haa Dhaalu Atoll and the northern atolls',
    region: 'The northern regional centre · a hospital, a growing urban population and services for the surrounding atolls · fishing and boatbuilding traditions · thin specialist teaching capacity',
    primaryKeyword: 'Online school and international curriculum in Kulhudhuffushi',
    heroTagline: 'For Kulhudhuffushi and northern atoll families — a regional centre serving many islands, and specialist teaching that reaches none of them.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Kulhudhuffushi and northern atoll families. The northern regional centre serves a wide group of surrounding islands with a hospital, services and a growing urban population, alongside fishing and boatbuilding traditions that long predate any of it. Participation in O-levels across the atolls has risen dramatically over the past two decades — the demand is not in question. What is thin is specialist teaching capacity, particularly at A-Level, and that is precisely what live delivery supplies.',
    heroImg: '/heroes/kulhudhuffushi-mv.jpg',
    altTexts: { hero: 'The northern Maldivian atolls' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel and IB for Kulhudhuffushi and northern atoll families — specialist teaching where capacity is thin. From USD 400/month.',
    challenges: [
      'Thin specialist teaching capacity, particularly at A-Level.',
      'Malé is a long way south and moving a child there is the usual alternative.',
      'Students dispersed across the surrounding northern atolls.',
      'Private-candidate availability varies by syllabus and must be confirmed.',
      'Time zone: two hours ahead of our teaching base — after-school and evening classes work well.',
    ],
    familySituations: [
      'Families across the northern atolls whose islands have no subject specialist.',
      'Fishing, boatbuilding and marine-services households.',
      'Health-sector and regional services families.',
      'Students who would otherwise move to Malé for upper secondary.',
      'Households aiming at university abroad from an outer atoll.',
    ],
    nearbyAreas: ['Kulhudhuffushi', 'Hanimaadhoo', 'Dhidhdhoo', 'Nolhivaram', 'Vaikaradhoo', 'the Haa Alifu and Haa Dhaalu atolls', 'the northern islands'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Geography',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Malaysian, Indian, Sri Lankan and Maldivian university applications',
      'Note: we do not teach Islam or Dhivehi — those are locally designed subjects and belong to your school',
    ],
    whyChoose: [
      ['A specialist where the island has none', 'The constraint in the northern atolls is teaching capacity rather than curriculum. A live group drawn across countries supplies the specialist an island of a few thousand people cannot.'],
      ['Marine and environmental science that fit the place', 'Fishing, reef and ocean context makes Cambridge Biology and Geography and AP Environmental Science unusually well grounded here.'],
      ['The alternative to moving south', 'Live delivery removes the need to relocate a child to Malé for upper secondary subject teaching.'],
      ['After-school hours that work', 'Two hours ahead of our teaching base.'],
      ['Clear about what belongs to your school', 'Islam and Dhivehi are locally designed and we do not teach them.'],
    ],
    growingReason: 'Kulhudhuffushi is the northern regional centre serving a wide group of surrounding islands with a hospital, services and a growing urban population, alongside fishing and boatbuilding traditions — with atoll participation in O-levels risen dramatically and specialist teaching capacity still thin. The Maldives runs MVT (UTC+5), two hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — taught alongside your school\'s existing programme, supplying subject specialists. Private-candidate eligibility confirmed per subject per session.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the north: education is overseen by the Ministry of Education and is compulsory, the secondary curriculum is designed around the O-level and A-level examinations offered by Edexcel, and Islam, Dhivehi and fisheries science are locally designed — we do not teach the local subjects and they belong to your school along with the domestic record. We could not verify a specific Maldivian framework for parental home education and will not guess; confirm with the Ministry directly. Smartious is not a Ministry-registered Maldivian school. On examinations, the Department of Public Examinations has established centres at locations across the Maldives, which handles much of the logistics that complicates our work elsewhere — though private-candidate availability varies by syllabus and is confirmed per subject per session.',
    homeTuitionDetail: 'Smartious delivers to northern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school and evening blocks, with the full recorded library built for island connectivity.',
    faqs: [
      { q: 'Our island has no A-Level science teacher — what can you do?', a: 'Supply one. That is the whole product in the atolls: the curriculum is already Cambridge and Edexcel, and what is missing is a specialist. In a live group of four to six drawn across countries, the subject runs.' },
      { q: 'Where would our child sit examinations?', a: 'The Department of Public Examinations has established examination centres at locations across the Maldives, so sittings are generally handled closer to home than in most of our markets. Private-candidate eligibility varies by syllabus and we confirm it per subject per session.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'fuvahmulah-mv',
    name: 'Fuvahmulah & the Central Atolls',
    county: 'Gnaviyani Atoll and the central south',
    region: 'A single-island atoll with its own distinct character · freshwater lakes and an agricultural tradition unusual in the country · a growing dive tourism sector · a small population and very limited specialist teaching',
    primaryKeyword: 'Online school and international curriculum in Fuvahmulah',
    heroTagline: 'For Fuvahmulah and central atoll families — one island, one school system, and a subject list limited by how many teachers live there.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Fuvahmulah and central atoll families. Fuvahmulah is a single-island atoll with a character unlike anywhere else in the country — freshwater lakes, an agricultural tradition rare in the Maldives, and a dive tourism sector that has grown considerably. It is also small, and on an island this size the subject list a student can take is limited by how many specialist teachers happen to live there. That is a teaching-capacity constraint rather than a curriculum one, and it is exactly what live delivery is for.',
    heroImg: '/heroes/fuvahmulah-mv.jpg',
    altTexts: { hero: 'Fuvahmulah' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel and IB for Fuvahmulah and central atoll families — subject specialists a small island cannot house. From USD 400/month.',
    challenges: [
      'A small population, so the subject list is limited by resident teaching specialists.',
      'Malé and Addu are both a flight or a long sea journey away.',
      'Students wanting competitive courses abroad from a single-island atoll.',
      'Private-candidate availability varies by syllabus and must be confirmed.',
      'Time zone: two hours ahead of our teaching base — after-school and evening classes work well.',
    ],
    familySituations: [
      'Families on a single-island atoll with a limited local subject list.',
      'Dive tourism and marine-services business households.',
      'Agricultural and fishing families.',
      'Students aiming at marine biology, environmental science or medicine.',
      'Households that would otherwise relocate for upper secondary.',
    ],
    nearbyAreas: ['Fuvahmulah', 'Thoondu', 'Dhadimagi Kilhi', 'Gnaviyani Atoll', 'Laamu Atoll', 'Thaa Atoll', 'the central atolls'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge A-Level Biology, Chemistry, Geography, Mathematics, Physics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Malaysian, Australian, Indian and Maldivian university applications',
      'Note: we do not teach Islam or Dhivehi — those are locally designed subjects and belong to your school',
    ],
    whyChoose: [
      ['A subject list not limited by island population', 'On a small island the available subjects depend on which specialists live there. In a live group drawn across countries, they do not.'],
      ['Marine and environmental science with real local ground', 'Fuvahmulah\'s reefs, lakes and marine life make Cambridge Biology and Geography and AP Environmental Science unusually well grounded.'],
      ['The alternative to relocating for upper secondary', 'Live delivery supplies the teaching without a move to Malé or Addu.'],
      ['After-school hours that work', 'Two hours ahead of our teaching base.'],
      ['Clear about what belongs to your school', 'Islam and Dhivehi are locally designed and we do not teach them.'],
    ],
    growingReason: 'Fuvahmulah is a single-island atoll with a character unlike anywhere else in the country — freshwater lakes, an agricultural tradition rare in the Maldives and a growing dive tourism sector — with a small population and a subject list limited by resident teaching specialists. The Maldives runs MVT (UTC+5), two hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — taught alongside your school\'s existing programme, supplying subject specialists. Private-candidate eligibility confirmed per subject per session.',
      cbc: 'Kenya CBC available for central atoll families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Fuvahmulah: education is overseen by the Ministry of Education and is compulsory, the secondary curriculum is designed around the O-level and A-level examinations offered by Edexcel, and Islam, Dhivehi and fisheries science are locally designed and belong to your school along with the domestic record. We could not verify a specific Maldivian framework for parental home education and will not guess in either direction — confirm with the Ministry of Education. Smartious is not a Ministry-registered Maldivian school and issues no Maldivian qualification. The Department of Public Examinations has established examination centres at locations across the Maldives, which handles much of the sitting logistics; private-candidate availability varies by syllabus and is confirmed per subject per session.',
    homeTuitionDetail: 'Smartious delivers to Fuvahmulah families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school and evening blocks, with the full recorded library built for island connectivity.',
    faqs: [
      { q: 'Our island simply does not have a teacher for the subject our child wants — is that solvable?', a: 'Yes, and it is the core case for live delivery in the Maldives. The curriculum is already Cambridge and Edexcel; what is missing is a specialist, and a live group drawn across several countries supplies one.' },
      { q: 'Our child wants marine biology — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Geography or Mathematics, planned backward from the target university from IGCSE onward. Fuvahmulah is unusually good ground for the subject.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'resort-islands-mv',
    name: 'The Resort Islands',
    county: 'Across the atolls',
    region: 'Resort and hospitality communities dispersed across the atolls · international management and specialist staff on multi-year contracts · Maldivian staff families living on or near resort islands · no schooling built for any of it',
    primaryKeyword: 'Online school and international curriculum for Maldives resort island families',
    heroTagline: 'For resort island families — living where the work is, with no school within a boat ride built for it.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families living and working across the Maldives\' resort islands. The resort economy employs international management, chefs, dive and marine staff, engineers and hospitality specialists on multi-year contracts, alongside a large Maldivian workforce whose families live on or near the islands where the work is. It is a genuinely international population dispersed across dozens of atolls, and there is no schooling built for it — not because the curriculum is missing, since Cambridge and Edexcel are the national route, but because a resort island has no school and often no specialist teacher within a boat ride.',
    heroImg: '/heroes/resort-islands-mv.jpg',
    altTexts: { hero: 'A Maldivian resort island and atoll' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel and IB for Maldives resort island families — international staff and Maldivian workforce households with no local schooling. From USD 400/month.',
    challenges: [
      'No schooling on or near most resort islands, and dispersal across dozens of atolls.',
      'International staff on multi-year contracts who may move to another country afterwards.',
      'Maldivian staff families separated from schooling on their home islands.',
      'Private-candidate availability varies by syllabus and must be confirmed.',
      'Time zone: two hours ahead of our teaching base — after-school and evening classes work well.',
    ],
    familySituations: [
      'International resort management, chef and specialist staff on multi-year contracts.',
      'Dive, marine biology and watersports professionals.',
      'Engineering, maintenance and operations households.',
      'Maldivian staff families living on or near resort islands.',
      'Families whose next posting may be in another country entirely.',
    ],
    nearbyAreas: ['North and South Malé Atolls', 'Baa Atoll', 'Ari Atoll', 'Raa Atoll', 'Lhaviyani Atoll', 'Noonu Atoll', 'the wider atoll chain'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, Spanish, Chinese and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Geography, Physics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and European, Australian, Asian and Maldivian university applications',
      'Note: we do not teach Islam or Dhivehi — those are locally designed subjects and belong to a Maldivian school where a family holds an enrolment',
    ],
    whyChoose: [
      ['Schooling that reaches an island with no school', 'A resort island has no campus and often no specialist teacher within a boat ride. Live delivery is not the convenient option here — it is the only one that does not separate a family.'],
      ['Portable to the next contract', 'International resort staff move between countries. The curriculum, teachers and examination board continue unchanged wherever the next posting is.'],
      ['Marine and environmental science with the best ground anywhere', 'Reef, lagoon and ocean context makes Cambridge Biology and Geography and AP Environmental Science exceptionally well grounded for these students.'],
      ['Home languages kept as examined subjects', 'French, Spanish, Chinese and other home language support runs alongside the English-medium core for an internationally recruited workforce.'],
      ['After-school and evening hours that work', 'Two hours ahead of our teaching base, with every session recorded for shift patterns.'],
    ],
    growingReason: 'The Maldivian resort economy employs international management, chefs, dive and marine staff, engineers and hospitality specialists on multi-year contracts alongside a large Maldivian workforce, dispersed across dozens of atolls — with no schooling built for any of it. The Maldives runs MVT (UTC+5), two hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for resort island families, portable across international postings. Private-candidate eligibility confirmed per subject per session, and examination travel planned well ahead.',
      cbc: 'Kenya CBC available for resort families with East African ties — a common profile in international hospitality.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies across the atolls: education is overseen by the Ministry of Education and is compulsory, the secondary curriculum is designed around the O-level and A-level examinations offered by Edexcel, and Islam, Dhivehi and fisheries science are locally designed. Where a family holds a Maldivian school enrolment, those local subjects and the domestic record belong to that school and we teach the examined international subjects alongside. We could not verify a specific Maldivian framework for parental home education and will not guess — confirm with the Ministry of Education directly. Smartious is not a Ministry-registered Maldivian school. International staff who are not resident in the Maldives follow their own country of residence\'s framework instead, which is a question for their own advisers and arises constantly in this workforce. On examinations, the Department of Public Examinations has established centres at locations across the Maldives, which helps considerably from an outer atoll; private-candidate availability varies by syllabus and is confirmed per subject per session.',
    homeTuitionDetail: 'Smartious delivers to resort island families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school and evening blocks, with the full recorded library built for island connectivity and hospitality shift patterns.',
    faqs: [
      { q: 'We live and work on a resort island — is schooling realistic without sending our child away?', a: 'Yes, and it is the clearest case for live delivery anywhere in our coverage. There is no campus on a resort island and often no specialist teacher within a boat ride. We teach the full programme where the family already is.' },
      { q: 'Our contract may move us to another country — does the schooling follow?', a: 'Yes: the same curriculum, teachers and examination board continue wherever the next posting is, with examinations sat at authorised provision locally.' },
      { q: 'Where would our child sit examinations?', a: 'The Department of Public Examinations has established centres at locations across the Maldives, which helps from an outer atoll. We plan travel into each window well ahead, and confirm private-candidate eligibility per subject per session.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const MALDIVES_COUNTRY = {
  slug: 'maldives',
  name: 'Maldives',
  longName: 'Republic of Maldives',
  adjective: 'Maldivian',
  flag: '🇲🇻',
  hub: '/online-school/maldives',
  hubPageId: 'homeschooling-maldives',
  cityPageId: 'maldives-city',

  currency: 'MVR',
  currencyName: 'Maldivian Rufiyaa',
  currencyPeg: 'Fees are quoted and invoiced in USD, which is widely used in the Maldives for larger commitments given the structure of the economy.',

  timezone: {
    code: 'MVT',
    name: 'Maldives Time (UTC+5), with no seasonal clock changes',
    utcOffset: '+5',
    offsetFromEAT: 'Two hours ahead of our teaching base — so after-school and evening classes land comfortably inside our teaching day',
  },

  examCentres: ['The Department of Public Examinations, established in 1989 under the Ministry of Education, organises national and international examinations and has established examination centres at locations across the Maldives — an unusually favourable arrangement compared with most of our markets'],
  examCentreTiles: [
    { city: 'Malé', centre: 'DPE and school centres', area: 'The country\'s deepest capacity, confirmed per family per session.' },
    { city: 'The atolls', centre: 'DPE centres across locations', area: 'The Department of Public Examinations has established centres at locations across the country, so atoll families often sit closer to home than in most markets.' },
    { city: 'Per-subject eligibility', centre: 'Confirmed each session', area: 'Private-candidate availability varies by syllabus — some are restricted to centres in the Maldives. We confirm per subject per session.' },
  ],
  examLogisticsProse: 'The Maldives is unusual among our markets in that the examination question is largely already answered by the state. The Department of Public Examinations, established on 1 September 1989 under the Ministry of Education, organises both national and international examinations and has established examination centres at locations across the country — handling IGCSE and GCE O Level, the SSC, Edexcel A Level, the HSC, Cambridge English and on-demand examinations. For an atoll family that removes the single biggest practical obstacle we face almost everywhere else. One caution matters and we state it plainly rather than in a footnote: private-candidate availability varies by syllabus. Some Cambridge syllabuses are available to centres in the Maldives only and are not open to private candidates at all — Cambridge IGCSE Marine Science is one such example — and Cambridge schools here are allocated to administrative zones with their own timetables. We therefore confirm eligibility per subject per session before entering any student, rather than promising a syllabus we have not checked. Note also that our arrangement runs alongside a Maldivian school where a family holds an enrolment: Islam and Dhivehi are locally designed subjects that we do not teach, and the domestic record belongs to that school.',
  secondaryProgrammeExamRef: 'DPE and authorised Maldivian provision',
  finalCTABadgeExamRef: 'Private-candidate eligibility confirmed per subject, per session',

  heroImage: '/heroes/maldives.jpg',
  heroEyebrow: 'Online school for the Maldives',
  heroH1Suffix: 'the Maldives',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for atoll, resort-sector, professional and Maldivian families across Malé, Addu, Kulhudhuffushi, Fuvahmulah and the resort islands. Cambridge and Edexcel are already your national secondary route — so we are not introducing a curriculum. We are supplying the subject specialists a small island cannot house.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / Edexcel / IB / AP through to A-Level — after-school and evening, alongside your school.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in the Maldives',

  citiesSectionTitle: 'Where our Maldives families are',
  citiesSectionBody: 'Smartious Maldives families are spread across Malé and Greater Malé (the capital, with the deepest human and material teaching resources in the country), Addu City (the southernmost atoll and second urban centre, five hundred kilometres south), Kulhudhuffushi and the north (the regional centre serving a wide group of islands), Fuvahmulah and the central atolls (a single-island atoll where the subject list depends on which specialists live there), and the resort islands (an internationally recruited workforce dispersed across dozens of atolls with no schooling built for it). One national curriculum already running on Cambridge and Edexcel, and one constraint everywhere: teaching capacity.',

  trustSignals: [
    { h: 'Cambridge is your national route, not our import', p: 'IGCSE was introduced in 2002 for grade 10 and A-Level for grade 12 to qualify students for the diploma of lower and upper secondary education, and the secondary curriculum is designed around the O-level and A-level examinations offered by Edexcel. We are not introducing a curriculum here and would not pretend to.' },
    { h: 'The constraint is teachers, not qualifications', p: 'Atoll participation in O-levels rose from 821 candidates in 1999 to 5,235 in 2009 — the demand is not in question. What is thin outside Malé is specialist teaching capacity, and that is exactly what a live group drawn across several countries supplies.' },
    { h: 'We do not teach Islam or Dhivehi', p: 'Those are locally designed subjects, as is fisheries science, and they belong to your school along with the domestic record. We teach the examined international subjects alongside them. Saying that clearly is both accurate and the right way round.' },
    { h: 'Private-candidate rules stated, not glossed', p: 'Availability varies by syllabus. Some Cambridge syllabuses are available to centres in the Maldives only and not open to private candidates. We confirm eligibility per subject per session rather than promise a syllabus we have not checked.' },
  ],

  universitiesInCountry: 'the Maldives National University and the Islamic University of Maldives, alongside a growing private higher-education sector and international branch provision, with the Department of Higher Education overseeing the tertiary level.',
  universityChannels: 'Maldivian students hold an unusual advantage internationally, and it is worth stating plainly: because the national secondary route already runs on Cambridge IGCSE and Edexcel A-Level, a Maldivian student finishing school holds qualifications that UK admissions reads natively through UCAS and that American, Australian, Canadian, Malaysian, Indian and Sri Lankan universities read directly, with no equivalence process at all. That is a position most countries in our coverage would need years of reform to reach. Malaysia, Sri Lanka, India, Australia and the United Kingdom are the most common destinations, and A-Levels are accepted in 160+ countries. Within the Maldives, the SSC and HSSC route and the IGCSE and A-Level route both lead into the national higher-education system. Smartious provides personalised university guidance across UK (UCAS), Malaysian, Australian, Indian, Sri Lankan, US and Maldivian destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Maldives families, and here the framing is different from every other market we serve. Cambridge IGCSE and A-Level, and Pearson Edexcel, are already the national secondary route — so we are not offering an alternative curriculum but subject specialists within the one you already follow. Live small-group classes in after-school and evening blocks, two hours behind your clock, run alongside a Maldivian school enrolment that carries Islam, Dhivehi and the domestic record. Private-candidate eligibility confirmed per subject per session.',
  britishCurriculumSuits: 'Maldives families needing subject depth within the national Cambridge and Edexcel route. Best fit for: (1) atoll families whose island has no specialist for a subject their child wants, (2) students who would otherwise move to Malé for upper secondary, (3) resort island households with no school within a boat ride, (4) Malé families whose school cannot staff a specialist A-Level set, (5) students aiming at competitive courses abroad who need a fuller subject list.',
  britishCurriculumDelivery: 'Live online classes in after-school and evening blocks, small groups 4-6 students, every session recorded, alongside a Maldivian school enrolment.',
  ibDiplomaSuits: 'Maldives families wanting the IB Diploma route with live subject teaching, Theory of Knowledge, and Extended Essay supervision.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Maldives families targeting American universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. The Maldives is one of only a handful of countries where the Cambridge route we teach is already the national one — which makes our role here unusually clear. We are not changing what a student studies, only who teaches it, and for an island of a few hundred people that turns out to be the whole difference.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, which matters in a country where an entire island may have no A-Level Physics or Further Mathematics specialist. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'The Maldives does not have an international school sector in the sense most of our markets do, because it does not need one: the national secondary system already runs on Cambridge IGCSE and Edexcel A-Level. Malé has the schools with the deepest human and material resources in the country, and a small number of private schools run composite Cambridge and national programmes. The competitive picture here is therefore not about curriculum at all — it is about teaching capacity, and about geography. An island of a few thousand people cannot house a Further Mathematics specialist, and no amount of curriculum reform changes that.',
  competitors: [
    { name: 'The Malé government and private schools',          city: 'Malé and Greater Malé',  curriculum: 'National plus IGCSE and Edexcel A-Level', feesUsd: 'Government and mid-tier private',                 feesAed: 'Competitive places',      rating: 4.4, capacityNote: 'The deepest human and material resources in the country — and still constrained on specialist A-Level sets' },
    { name: 'Atoll education centres',                          city: 'Across the atolls',      curriculum: 'National plus IGCSE',                   feesUsd: 'Government provision',                              feesAed: '—',                       rating: 4.0, capacityNote: 'Long-established and serving their islands well — the constraint is specialist teaching capacity, not curriculum or commitment' },
    { name: 'Private Cambridge schools',                        city: 'Malé',                   curriculum: 'Composite Cambridge and national',      feesUsd: 'Mid to premium tier',                               feesAed: 'Limited places',          rating: 4.3, capacityNote: 'Good provision, concentrated in the capital' },
    { name: 'Relocation to Malé for upper secondary',           city: 'Nationwide practice',    curriculum: '—',                                     feesUsd: 'Cost of a second household',                        feesAed: '—',                       rating: 0,   capacityNote: 'The traditional answer for atoll families, and an expensive and disruptive one' },
    { name: 'The resort islands',                               city: 'Across the atolls',      curriculum: '—',                                     feesUsd: 'No schooling at all',                               feesAed: '—',                       rating: 0,   capacityNote: 'An internationally recruited workforce dispersed across dozens of atolls with nothing built for it' },
    { name: 'Private tuition',                                  city: 'Malé mainly',            curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Capital-weighted',        rating: 4.0, capacityNote: 'Concentrated where the teachers already are, which is precisely where the shortage is not' },
    { name: 'Smartious Homeschool (Maldives via online delivery)', city: 'Delivered to every atoll', curriculum: 'Cambridge IGCSE, A-Level, Edexcel, IB, AP', feesUsd: 'USD 2,160-6,480/year',                     feesAed: 'Quoted in USD',            rating: 4.8, capacityNote: 'A subject specialist delivered to any island + the national curriculum route already shared + after-school hours that work + honest that we do not teach Islam or Dhivehi' },
  ],

  legalFrameworkIntro: 'The Maldives is structurally unlike almost every market we serve, and the differences work in a family\'s favour. Here is the system, what it already gives you, and the two things we are careful about.',
  legalFramework: [
    { h: 'The system, and why Cambridge is not foreign here', p: 'Education is overseen by the Ministry of Education, with the Department of Higher Education alongside at tertiary level, and education is compulsory — confirm the current boundaries with the Ministry rather than take them from any article. Structurally, primary runs seven years from age six, lower secondary three years leading to the Secondary School Certificate, and upper secondary two years leading to the Higher Secondary School Certificate; British-patterned schools run primary for eight years, secondary three years to IGCSE, and upper secondary two years to A-Level. The crucial point is this: IGCSE examinations were introduced in 2002 for grade 10 and A-Level for grade 12 to qualify students for the diploma of lower and upper secondary education, and the secondary curriculum content is designed around the O-level and A-level examinations offered by Edexcel. Cambridge and Edexcel are the national route. Any provider marketing them to Maldivian families as an exciting international alternative has not understood the country.' },
    { h: 'What is locally designed, and therefore not ours', p: 'Islamic studies, Dhivehi language and fisheries science are designed locally, even at secondary level, and lower secondary students prepare for IGCSE and GCE O level in six subjects of which two are the local subjects Islam and Dhivehi. We do not teach Islam or Dhivehi and would not attempt to. Those belong to your school, as does the domestic record. Our role is the examined international subjects alongside them — and being explicit about that division is both accurate and, we think, the right way round.' },
    { h: 'The real constraint: teachers, not curriculum', p: 'The Maldives comprises twenty-six atolls with around two hundred inhabited islands and a population scattered across them. Income disparity between Malé and the outer atolls has increased, and that disparity is reflected in schools: Malé\'s have a higher level of resources, both human and material. Meanwhile demand from the atolls has risen dramatically — O-level candidates from the atolls went from 821 in 1999 to 5,235 in 2009. So the picture is not one of a country lacking a curriculum or lacking ambition. It is one where an island of a few thousand people cannot house a Further Mathematics or A-Level Physics specialist, and no curriculum reform can change that arithmetic. A live class of four to six students drawn from several countries can.' },
    { h: 'Examinations, which the state has largely solved', p: 'This is unusually favourable compared with most of our markets. The Department of Public Examinations, established on 1 September 1989 under the Ministry of Education, organises both national and international examinations and has established examination centres at locations across the Maldives, handling IGCSE and GCE O Level, the SSC, Edexcel A Level, the HSC, Cambridge English and on-demand examinations. In most countries we serve, examination logistics are the hardest practical problem for a family outside a capital; here the state has already built the network.' },
    { h: 'The caution we will not gloss over', p: 'Private-candidate availability varies by syllabus, and this matters enough to state plainly rather than bury. Some Cambridge syllabuses are available to centres in the Maldives only and are not open to private candidates at all — Cambridge IGCSE Marine Science is one such example — and Cambridge schools here are allocated to administrative zones each with their own examination timetable. We therefore confirm eligibility per subject per session before entering any student, and we will tell a family plainly if a subject they want cannot be entered privately. Promising a syllabus without checking would be the fastest way to fail a Maldivian family, and it is the single most important operational point on these pages.' },
    { h: 'Home education, and the clock', p: 'On parental home education we could not verify a specific Maldivian framework, and we will not guess in either direction; an absence of clear regulation is an absence of protection rather than a permission, and a family whose plan depends on it should put the question to the Ministry of Education directly. Smartious is not a Ministry-registered Maldivian school and issues no Maldivian qualification — our arrangement is live subject teaching alongside a Maldivian school enrolment. On timing, the Maldives runs UTC+5 with no seasonal changes against our UTC+3, so you are two hours ahead of us: a four o\'clock class here is two o\'clock for our teachers and a six o\'clock class is four. After-school and evening blocks work comfortably, every week of the year.' },
  ],

  whySmartious: [
    { h: 'The same curriculum you already follow, better staffed',        p: 'Cambridge and Edexcel are the national route here. We are not changing what a student studies, only who teaches it — which on a small island is the entire difference.' },
    { h: 'A specialist for an island that has none',                      p: 'Further Mathematics or A-Level Physics for four students is impossible on one island and routine in a live group drawn across several countries.' },
    { h: 'The alternative to sending a child to Malé',                    p: 'Relocating for upper secondary has been the traditional answer for atoll families. It is expensive and disruptive, and live delivery removes the need.' },
    { h: 'Explicit about what belongs to your school',                    p: 'Islam and Dhivehi are locally designed and we do not teach them. Your school carries those and the domestic record.' },
    { h: 'Honest about private-candidate eligibility',                    p: 'Availability varies by syllabus and some are closed to private candidates entirely. We confirm per subject per session rather than promise.' },
    { h: 'After-school hours that work',                                  p: 'Two hours ahead of our teaching base, with every session recorded for island connectivity.' },
  ],

  faqs: [
    { q: 'Cambridge is already our national system — what do you actually add?', a: 'Teaching capacity. IGCSE and Edexcel A-Level are the national secondary route here, so we are not introducing a curriculum. What we supply is a subject specialist for the sets a school — particularly on an outer atoll — cannot staff for a small cohort.' },
    { q: 'Do you teach Islam and Dhivehi?', a: 'No, and we would not attempt to. Those are locally designed subjects, as is fisheries science, and they belong to your school along with the domestic record. We teach the examined international subjects alongside them.' },
    { q: 'Can our child enter any Cambridge subject as a private candidate?', a: 'Not necessarily. Availability varies by syllabus and some are available to centres in the Maldives only, not to private candidates — Cambridge IGCSE Marine Science is one example. We confirm eligibility per subject per session before entering anyone.' },
    { q: 'Where would our child sit examinations?', a: 'The Department of Public Examinations, established in 1989 under the Ministry of Education, organises national and international examinations and has established centres at locations across the Maldives. That removes the biggest practical obstacle atoll families face in most of our markets.' },
    { q: 'Is homeschooling legal in the Maldives?', a: 'We could not verify a specific framework and will not guess. Education is compulsory and overseen by the Ministry of Education. An absence of clear regulation is not a permission — put the question to the Ministry directly. Structured study alongside a school enrolment raises none of it.' },
    { q: 'Would our child still need to move to Malé for upper secondary?', a: 'Not for the teaching. That has been the traditional answer for atoll families and it is expensive and disruptive. Live delivery supplies the specialist wherever the family already is.' },
    { q: 'What time are classes?', a: 'After-school and evening work well. The Maldives is two hours ahead of our teaching base, so a four o\'clock class here is two o\'clock for our teachers and six o\'clock is four.' },
    { q: 'Which parts of the Maldives does Smartious cover?', a: 'Malé and Greater Malé, Addu City, Kulhudhuffushi and the north, Fuvahmulah and the central atolls, and the resort islands have dedicated pages. Live online delivery works identically on any inhabited island in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which island you are on and which subjects your school cannot offer: in the Maldives that second answer is almost always the whole reason a family contacts us, and we will confirm private-candidate eligibility for each one before you commit.',
}
