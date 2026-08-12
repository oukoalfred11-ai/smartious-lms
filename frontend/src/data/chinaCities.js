// ═══════════════════════════════════════════════════════════════════
// CHINA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP — offered principally to families in the HONG KONG
// and MACAU SPECIAL ADMINISTRATIVE REGIONS, which have their own
// education systems, and on a strictly limited basis elsewhere.
// SECOND EAST ASIA BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// *** THE MOST IMPORTANT REGULATORY NOTE IN THE ENTIRE SYSTEM ***
// *** READ IN FULL BEFORE EDITING ANY PART OF THIS FILE ***
//
// THE "DOUBLE REDUCTION" POLICY (双减政策) DIRECTLY CONSTRAINS WHAT
// SMARTIOUS MAY LAWFULLY OFFER IN MAINLAND CHINA. This is not a
// hedge or a caution — it is a specific, published, in-force policy
// that speaks to exactly our business model. Facts:
// - Formally "Opinions on Further Reducing the Homework Burden and
//   Off-Campus Training Burden of Students in Compulsory Education",
//   issued 24 July 2021 by the General Office of the CPC Central
//   Committee and the State Council. Took effect on release.
// - It BANS ALL FORMS OF FOR-PROFIT TUTORING OF ACADEMIC SUBJECTS
//   for students receiving COMPULSORY EDUCATION.
// - "Subject-based" (学科类) covers exactly what we teach: Chinese
//   literature, history, geography, MATH, FOREIGN LANGUAGES
//   (including English), PHYSICS, CHEMISTRY, BIOLOGY, and morals
//   and law.
// - COMPULSORY EDUCATION = 6 years primary (from about age six) + 3
//   years junior secondary. Reporting indicates the Opinions are
//   ALSO LIKELY TO APPLY THROUGH UPPER MIDDLE SCHOOL.
// - *** IT PLACES A STRICT BAN ON FOREIGN TEACHERS PHYSICALLY BASED
//   OUTSIDE OF CHINA TEACHING STUDENTS IN CHINA. *** That sentence
//   describes Smartious exactly. It is the single most consequential
//   regulatory fact in our entire coverage.
// - Institutions CANNOT USE FOREIGN CURRICULA, and non-subject-based
//   institutions are prohibited from providing overseas education
//   courses.
// - Existing subject-based institutions must convert to NON-PROFIT;
//   foreign capital is prohibited from participating in them.
// - Training materials and OVERSEAS EDUCATION MATERIALS are subject
//   to a filing, review and supervision system.
// - Off-campus subject training is prohibited during national
//   holidays, weekends and winter/summer breaks.
// - ADVERTISING for training institutions is banned on mainstream
//   media platforms.
//
// CONSEQUENCE FOR THESE PAGES — NON-NEGOTIABLE:
// 1. WE DO NOT SOLICIT OR ENROL COMPULSORY-EDUCATION-AGE STUDENTS
//    RESIDENT IN MAINLAND CHINA for subject-based teaching. Say so
//    plainly and early on every mainland page and on the hub.
// 2. THE REAL OFFER IS HONG KONG AND MACAU, which are Special
//    Administrative Regions with their OWN EDUCATION SYSTEMS,
//    separate curricula and separate regulators. Lead with them.
// 3. Mainland pages are written for context and for families whose
//    circumstances fall outside the policy — and even then they must
//    direct the family to take their own advice FIRST. Never imply
//    we have assessed an individual family's position.
// 4. NEVER imply the policy can be worked around, that enforcement
//    is lax, or that others do it anyway. Do not mention that
//    tutoring persists in practice. That would be irresponsible and
//    would expose families, not us.
// 5. NO political commentary of any kind, on anything. Describe
//    education administration and economy only.
//
// TONE RULE: no political content, no commentary on any government,
// policy motive, territorial or constitutional question. Hong Kong
// and Macau are described accurately as Special Administrative
// Regions with their own education systems — that is an education-
// administration fact and nothing more. Do not go further.
//
// TIMEZONE: mainland China, Hong Kong and Macau all run UTC+8 with
// no seasonal changes. Our teaching base runs UTC+3. So China is
// FIVE HOURS AHEAD: 19:00 in Hong Kong is 14:00 for us, 20:00 is
// 15:00, 21:00 is 16:00. EVENING classes land in our afternoon —
// a workable relationship, and the natural configuration here.
//
// MARKET NOTE: Hong Kong has one of the deepest international school
// sectors anywhere — ESF schools, Harrow, Kellett, Chinese
// International School, German Swiss, Canadian International, plus a
// very large local sector — with IGCSE, A-Level and IB provision and
// among the highest fees and most competitive admissions in the
// world. Waiting lists are a genuine and well-known problem, which
// is our strongest Hong Kong argument. Macau has a smaller
// international sector alongside Portuguese-heritage and local
// schools. Mainland international schools are subject to their own
// enrolment rules, which vary and which families must confirm.
// ═══════════════════════════════════════════════════════════════════

export const CHINA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'hong-kong-cn',
    name: 'Hong Kong SAR',
    county: 'Hong Kong Special Administrative Region',
    region: 'A Special Administrative Region with its own education system and regulator · one of the deepest international school sectors anywhere · famously competitive admissions and long waiting lists · a global financial and professional community',
    primaryKeyword: 'Online school and international curriculum in Hong Kong',
    heroTagline: 'For Hong Kong families — a place in September, not a waiting list, and the A-Level sets even a strong school cannot always run.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Hong Kong families. Hong Kong is a Special Administrative Region with its own education system, curriculum and regulator, and one of the deepest international school sectors in the world — ESF, Harrow, Kellett, the Chinese International School, German Swiss, Canadian International and many more. The problem here has never been quality or availability of curriculum. It is places: admissions are among the most competitive anywhere and waiting lists are a well-known feature of the market. We have none.',
    heroImg: '/heroes/hong-kong-cn.jpg',
    altTexts: { hero: 'Hong Kong harbour' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Hong Kong families — no waiting list, evening classes, subject depth. From USD 400/month.',
    challenges: [
      'International school waiting lists are a long-standing feature of the market, particularly for mid-year arrivals.',
      'Fees are among the highest in the world, with debentures and capital levies on top at some schools.',
      'Specialist A-Level subjects often will not run for small cohorts even in excellent schools.',
      'Families relocating mid-year frequently find every preferred school full.',
      'Time zone: Hong Kong runs UTC+8, five hours ahead of our teaching base — so evening classes work well.',
    ],
    familySituations: [
      'Families arriving mid-year who cannot secure a place at a preferred school.',
      'Households on international school waiting lists needing continuity in the meantime.',
      'Financial, legal and professional families outside the top tier\'s fees.',
      'Students needing a subject their school cannot staff for a small group.',
      'Families in the local sector wanting an internationally examined track alongside.',
      'Households whose next posting may be another country entirely.',
    ],
    nearbyAreas: ['Hong Kong Island', 'Kowloon', 'New Territories', 'Sai Kung', 'Discovery Bay', 'Tung Chung', 'Lantau'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Chinese, French, Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Australian, Singaporean and Hong Kong university applications',
    ],
    whyChoose: [
      ['No waiting list', 'A child starts within a week of the assessment. In a market where waiting lists are the defining constraint, that is frequently the whole decision rather than one factor among several.'],
      ['The set your school cannot staff', 'Further Mathematics or a third science for four pupils is unviable on one timetable and routine in a live group drawn from several countries.'],
      ['A fee gap against one of the world\'s most expensive markets', 'Live small-group teaching at USD 2,160-6,480 a year, with no debenture and no capital levy.'],
      ['Evening classes that work', 'Hong Kong is five hours ahead of our teaching base, so a seven o\'clock evening class here is two in the afternoon for our teachers.'],
      ['A separate education system, clearly stated', 'Hong Kong is a Special Administrative Region with its own education system and regulator — distinct from the mainland framework, which we set out separately and carefully.'],
    ],
    growingReason: 'Hong Kong is a Special Administrative Region with its own education system and regulator, holding one of the deepest international school sectors in the world alongside a large local sector — with famously competitive admissions, long waiting lists and among the highest fees anywhere. Hong Kong runs UTC+8, five hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Hong Kong families, taught in evening blocks alongside a school enrolment, or as a bridge while a family waits for a place. Examinations at authorised centres confirmed per family per session; Hong Kong has extensive established provision.',
      cbc: 'Kenya CBC available for Hong Kong families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the territory\'s very substantial IB sector.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Hong Kong is a Special Administrative Region with its own education system, its own curriculum and its own regulator, separate from the mainland framework — and that distinction matters enough that we address the mainland position on its own pages rather than blurring the two. On home education specifically, we could not verify a settled Hong Kong framework and will not guess: education is compulsory and administered by the territory\'s own education authority, and a family whose plan depends on educating outside a registered school should take advice on their own position first. Smartious is not a registered Hong Kong school and issues no Hong Kong qualification — we do not teach toward the HKDSE. What we build here is what we build almost everywhere: live Cambridge or IB subject teaching alongside a school enrolment. In Hong Kong specifically there is a second common configuration worth naming — a family who has relocated and is on a waiting list, using us as a full interim programme so a child does not lose months of schooling while a place comes free. That is one of the most frequent reasons families in this market contact us at all.',
    homeTuitionDetail: 'Smartious delivers to Hong Kong families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Hong Kong runs five hours ahead of our teaching base with no seasonal changes on either side, so a seven or eight o\'clock evening class here sits in our afternoon, at the same time every week of the year, with every session recorded.',
    faqs: [
      { q: 'We have just relocated and every school has a waiting list — what can we do?', a: 'Start with us within a week of the assessment and keep an internationally examined pathway running while a place comes free. It is the single most common reason Hong Kong families come to us, and the programme is complete rather than a holding exercise.' },
      { q: 'Our school is excellent — what would we gain?', a: 'Usually one thing: a subject set your timetable cannot staff for four pupils. If your school covers what your child needs, we will tell you so.' },
      { q: 'Do you teach the HKDSE?', a: 'No. We are not a registered Hong Kong school and issue no Hong Kong qualification. We teach Cambridge, Pearson Edexcel, IB and AP, which sit alongside a school record rather than replacing it.' },
      { q: 'What time are classes?', a: 'Evening works best. Hong Kong is five hours ahead of our teaching base, so a seven o\'clock class here is two in the afternoon for our teachers.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'macau-cn',
    name: 'Macau SAR',
    county: 'Macau Special Administrative Region',
    region: 'A Special Administrative Region with its own education system · a Portuguese-heritage and local school sector with a small international one · an integrated resort and hospitality economy · Hong Kong an hour away by ferry',
    primaryKeyword: 'Online school and international curriculum in Macau',
    heroTagline: 'For Macau families — a small international sector, and Hong Kong\'s waiting lists an hour across the water.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Macau families. Macau is a Special Administrative Region with its own education system, running a distinctive mix of Portuguese-heritage, local Chinese and a small number of international schools alongside an integrated resort and hospitality economy that recruits management and specialist staff internationally. The international sector here is genuinely small for the size of that community, and Hong Kong — an hour away by ferry — has waiting lists of its own. Live delivery reaches Macau identically, in evening hours that suit both a school day and a hospitality household.',
    heroImg: '/heroes/macau-cn.jpg',
    altTexts: { hero: 'Macau' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Macau families — a small international sector, evening classes. From USD 400/month.',
    challenges: [
      'A small international school sector relative to the internationally recruited workforce.',
      'Hong Kong is an hour away by ferry and has waiting lists of its own.',
      'Hospitality and resort schedules that do not fit a standard school-support routine.',
      'Families arriving mid-year from several different national systems.',
      'Time zone: Macau runs UTC+8, five hours ahead of our teaching base — evening classes work well.',
    ],
    familySituations: [
      'Integrated resort management and hospitality specialist families.',
      'Portuguese-speaking and Portuguese-heritage households.',
      'Professional and commercial families outside the small international tier.',
      'Students needing subjects unavailable locally at A-Level standard.',
      'Households whose next posting may be another country entirely.',
    ],
    nearbyAreas: ['Macau Peninsula', 'Taipa', 'Coloane', 'Cotai', 'Hengqin border area', 'Zhuhai crossing', 'the Hong Kong ferry route'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Portuguese, Chinese, French and home language support',
      'Cambridge A-Level Mathematics, Physics, Chemistry, Biology, Economics',
      'Cambridge A-Level Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Microeconomics, AP Physics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Portuguese, Australian, Canadian and Macau university applications',
    ],
    whyChoose: [
      ['Portuguese kept as an examined subject', 'Cambridge Portuguese runs alongside the English-medium core, which matters in a territory with this heritage and keeps Portuguese and Brazilian university routes open.'],
      ['No ferry to Hong Kong for schooling', 'Hong Kong is an hour across the water and full. Live delivery removes the journey and the waiting list together.'],
      ['Built for hospitality schedules', 'Evening classes plus a complete recorded library suit households whose working week does not look like a standard one.'],
      ['Evening classes that work', 'Five hours ahead of our teaching base — a seven o\'clock class here is two in the afternoon for our teachers.'],
      ['A separate education system, clearly stated', 'Macau is a Special Administrative Region with its own education system, distinct from the mainland framework we set out separately.'],
    ],
    growingReason: 'Macau is a Special Administrative Region with its own education system, running a mix of Portuguese-heritage, local and a small number of international schools alongside an integrated resort economy that recruits internationally — with Hong Kong an hour away by ferry and full. Macau runs UTC+8, five hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Macau, taught in evening blocks alongside a school enrolment, with Portuguese available beside the English-medium core.',
      cbc: 'Kenya CBC available for Macau families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Macau is a Special Administrative Region with its own education system and regulator, separate from the mainland framework, which we address on its own pages rather than blurring the two. Education is compulsory and administered by the territory\'s own education authority; we could not verify a settled Macau framework for parental home education and will not guess, so a family whose plan depends on it should take advice on their own position first. Smartious is not a registered Macau school and issues no Macau qualification. Our arrangement is live Cambridge or IB subject teaching alongside a school enrolment. Internationally recruited resort and hospitality staff who are not resident in Macau follow their own country of residence\'s framework instead, which is a question for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to Macau families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in evening blocks, with the full recorded library built for hospitality shift patterns.',
    faqs: [
      { q: 'Is the ferry to Hong Kong really the alternative?', a: 'For some Macau families it has been, and Hong Kong schools have waiting lists of their own. Live delivery removes both the journey and the queue.' },
      { q: 'Can our children keep Portuguese?', a: 'Yes — Cambridge Portuguese runs alongside the English-medium core as a formal examined subject, which suits Macau\'s heritage and keeps Portuguese and Brazilian university routes open.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'shanghai-cn',
    name: 'Shanghai',
    county: 'Shanghai Municipality',
    region: 'The mainland\'s commercial and financial centre · a large international business community · an established international school sector operating under its own enrolment rules · the Yangtze delta economy',
    primaryKeyword: 'International curriculum information for Shanghai families',
    heroTagline: 'For Shanghai families — read this page before enquiring, because what we may offer here is genuinely limited.',
    intro: 'This page is written differently from the rest of our site, and deliberately so. Shanghai is the mainland\'s commercial and financial centre with a large international business community and an established international school sector — but mainland China regulates off-campus subject teaching in a way that directly affects a provider like us. The Double Reduction policy of July 2021 bans for-profit tutoring in academic subjects for students in compulsory education, and places a strict ban on foreign teachers physically based outside China teaching students in China. We are foreign teachers physically based outside China. So before anything else: we do not enrol compulsory-education-age students resident in mainland China for subject teaching, and we will not pretend otherwise to win a family.',
    heroImg: '/heroes/shanghai-cn.jpg',
    altTexts: { hero: 'Shanghai' },
    seoDesc: 'Information for Shanghai families on international curricula and the regulatory position on off-campus subject teaching in mainland China. Smartious does not enrol compulsory-education-age mainland students.',
    challenges: [
      'The Double Reduction policy bans for-profit academic tutoring for students in compulsory education.',
      'It places a strict ban on foreign teachers physically based outside China teaching students in China.',
      'Compulsory education covers six years of primary and three of junior secondary, and reporting indicates the policy is likely to apply through upper middle school.',
      'Institutions may not use foreign curricula, and overseas education materials are subject to review.',
      'Mainland international schools operate under their own enrolment rules, which families must confirm directly.',
    ],
    familySituations: [
      'Families seeking to understand the regulatory position before making enquiries.',
      'Households relocating from Shanghai to another country who want continuity planning.',
      'Families relocating to Hong Kong or Macau, where the education systems are separate.',
      'Households whose circumstances may fall outside the policy and who intend to take their own advice first.',
    ],
    nearbyAreas: ['Pudong', 'Jing\'an', 'Xuhui', 'Minhang', 'Hongqiao', 'Suzhou', 'the Yangtze delta'],
    subjects: [
      'Where a family\'s circumstances permit, and only after they have taken their own advice: Cambridge IGCSE and A-Level, Pearson Edexcel, IB Diploma and AP subjects as taught across our other markets',
      'University application support for families relocating out of the mainland — UCAS (UK), Common Application (US), and Canadian, Australian and Singaporean applications',
      'Continuity planning for families moving to Hong Kong, Macau or another country entirely',
    ],
    whyChoose: [
      ['We tell you the constraint before you enquire', 'Most providers marketing to mainland families do not put the Double Reduction policy on the page. We have put it in the opening paragraph.'],
      ['We do not enrol where we should not', 'Compulsory-education-age students resident in mainland China are not enrolled for subject teaching, regardless of what a family is willing to pay.'],
      ['Continuity if you relocate', 'Families leaving Shanghai for Hong Kong, Singapore, the Gulf or elsewhere can pick up a single pathway that continues unchanged.'],
      ['Hong Kong and Macau are separate systems', 'Both Special Administrative Regions have their own education systems and regulators, and we serve families there in the ordinary way.'],
      ['No claim we have assessed your position', 'We have not. Any family who believes their circumstances fall outside the policy should take their own advice before contacting us, not after.'],
    ],
    growingReason: 'Shanghai is the mainland\'s commercial and financial centre with a large international business community and an established international school sector — and a regulatory framework for off-campus subject teaching that directly constrains providers based outside China. Mainland China runs UTC+8, five hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Offered across our other markets. In mainland China, subject teaching is constrained by the Double Reduction policy and we do not enrol compulsory-education-age resident students.',
      cbc: 'Kenya CBC available where a family\'s circumstances permit and they have taken their own advice.',
      ib: 'IB Diploma Programme offered across our other markets, subject to the same constraint here.',
      american: 'American Curriculum with AP offered across our other markets, subject to the same constraint here.',
    },
    homeschoolDetail: 'We want to be as clear as we can be, because a family acting on a vague answer here carries the consequence rather than we do. Compulsory education in mainland China comprises six years of primary education, typically from about age six, followed by three years of junior secondary. The Double Reduction policy — formally the Opinions on Further Reducing the Homework Burden and Off-Campus Training Burden of Students in Compulsory Education, issued on 24 July 2021 by the General Office of the CPC Central Committee and the State Council, effective on release — bans all forms of for-profit tutoring in academic subjects for students receiving compulsory education. Subject-based training covers precisely what we teach: mathematics, foreign languages including English, physics, chemistry, biology, history, geography and Chinese literature. Reporting indicates the Opinions are also likely to apply through upper middle school. Two further provisions bear directly on us: the policy places a strict ban on foreign teachers physically based outside China teaching students in China, and institutions may not use foreign curricula, with training materials and overseas education materials subject to a filing and review system. Off-campus subject training is also prohibited during national holidays, weekends and school breaks. We are a for-profit provider, our teachers are physically based outside China, and we teach a foreign curriculum. That is three separate points of contact with the policy. Accordingly we do not enrol compulsory-education-age students resident in mainland China for subject teaching. We are also not a registered mainland school, hold no mainland licence, and do not teach toward the gaokao. Separately, mainland international schools operate under their own enrolment rules which vary and which a family must confirm with the school and the relevant authority directly. If you believe your circumstances fall outside the policy, take your own advice first — we have not assessed your position and cannot.',
    homeTuitionDetail: 'Not offered in mainland China.',
    onlineLearningDetail: 'Where a family\'s circumstances permit, live online delivery runs on a five-hour offset with evening classes in China falling in our afternoon. In mainland China this is subject to the constraints set out above.',
    faqs: [
      { q: 'Can our child in Shanghai study with Smartious?', a: 'If they are of compulsory-education age and resident in mainland China, we do not enrol them for subject teaching. The Double Reduction policy bans for-profit academic tutoring for compulsory-education students and places a strict ban on foreign teachers physically based outside China teaching students in China. We are exactly that.' },
      { q: 'Why are you telling us this rather than just selling?', a: 'Because a family who enrols on a claim that turns out to be wrong bears the consequence, not us. We would rather lose an enquiry than mislead one.' },
      { q: 'We are relocating to Hong Kong — does that change things?', a: 'Yes. Hong Kong is a Special Administrative Region with its own education system and regulator, and we serve families there in the ordinary way. The same applies to Macau.' },
      { q: 'We are leaving China for another country — can you help with continuity?', a: 'Yes, and that is one of the situations we can genuinely assist with. A single pathway can be set up to continue unchanged wherever the family goes next.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'beijing-cn',
    name: 'Beijing',
    county: 'Beijing Municipality',
    region: 'The capital · the diplomatic community and the country\'s leading universities · an established international school sector operating under its own enrolment rules · a large professional population',
    primaryKeyword: 'International curriculum information for Beijing families',
    heroTagline: 'For Beijing families — the same honest answer as Shanghai, and the reasons behind it.',
    intro: 'This page sets out the regulatory position rather than making an offer, because in mainland China that is the responsible order. Beijing holds the capital\'s diplomatic community, the country\'s leading universities and an established international school sector. It also sits under the Double Reduction policy, which bans for-profit tutoring in academic subjects for students in compulsory education and places a strict ban on foreign teachers physically based outside China teaching students in China. Smartious is a for-profit provider whose teachers are based outside China. We therefore do not enrol compulsory-education-age students resident in mainland China for subject teaching.',
    heroImg: '/heroes/beijing-cn.jpg',
    altTexts: { hero: 'Beijing' },
    seoDesc: 'Information for Beijing families on international curricula and the regulatory position on off-campus subject teaching in mainland China. Smartious does not enrol compulsory-education-age mainland students.',
    challenges: [
      'The Double Reduction policy bans for-profit academic tutoring for students in compulsory education.',
      'It places a strict ban on foreign teachers physically based outside China teaching students in China.',
      'Institutions may not use foreign curricula, and overseas education materials are subject to review.',
      'Advertising for training institutions is banned on mainstream media platforms.',
      'Mainland international schools operate under their own enrolment rules, which families must confirm directly.',
    ],
    familySituations: [
      'Families seeking to understand the regulatory position before making enquiries.',
      'Diplomatic households whose posting will move them to another country.',
      'Families relocating to Hong Kong or Macau, where the education systems are separate.',
      'Households whose circumstances may fall outside the policy and who intend to take their own advice first.',
    ],
    nearbyAreas: ['Chaoyang', 'Shunyi', 'Haidian', 'Dongcheng', 'Xicheng', 'Tianjin', 'the capital region'],
    subjects: [
      'Where a family\'s circumstances permit, and only after they have taken their own advice: Cambridge IGCSE and A-Level, Pearson Edexcel, IB Diploma and AP subjects as taught across our other markets',
      'University application support for families relocating out of the mainland — UCAS (UK), Common Application (US), and Canadian, Australian and Singaporean applications',
      'Continuity planning for diplomatic and corporate families moving to another posting',
    ],
    whyChoose: [
      ['The constraint stated before the offer', 'We put the Double Reduction policy in the opening paragraph rather than in a footnote or not at all.'],
      ['Built for a posting that moves', 'Diplomatic and corporate families leaving Beijing can set up a single pathway that continues unchanged in the next country.'],
      ['Hong Kong and Macau are separate systems', 'Both Special Administrative Regions have their own education systems and regulators, and we serve families there in the ordinary way.'],
      ['No claim we have assessed your position', 'We have not. Any family who believes their circumstances fall outside the policy should take their own advice before contacting us.'],
      ['We would rather lose the enquiry', 'A family who enrols on a claim that turns out to be wrong carries the consequence. We are not willing to trade that for revenue.'],
    ],
    growingReason: 'Beijing holds the capital\'s diplomatic community, the country\'s leading universities and an established international school sector — within a regulatory framework for off-campus subject teaching that directly constrains providers based outside China. Mainland China runs UTC+8, five hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Offered across our other markets. In mainland China, subject teaching is constrained by the Double Reduction policy and we do not enrol compulsory-education-age resident students.',
      cbc: 'Kenya CBC available where a family\'s circumstances permit and they have taken their own advice.',
      ib: 'IB Diploma Programme offered across our other markets, subject to the same constraint here.',
      american: 'American Curriculum with AP offered across our other markets, subject to the same constraint here.',
    },
    homeschoolDetail: 'The position is the same across mainland China and we set it out in full on our Shanghai page. In short: compulsory education comprises six years of primary followed by three of junior secondary; the Double Reduction policy of 24 July 2021 bans all forms of for-profit tutoring in academic subjects for students receiving compulsory education, with subject-based training covering mathematics, foreign languages including English, physics, chemistry, biology, history, geography and Chinese literature; reporting indicates it is also likely to apply through upper middle school; it places a strict ban on foreign teachers physically based outside China teaching students in China; institutions may not use foreign curricula, and overseas education materials are subject to filing and review. Smartious is a for-profit provider with teachers based outside China teaching a foreign curriculum, so we do not enrol compulsory-education-age students resident in mainland China for subject teaching. We hold no mainland licence, are not a registered mainland school, and do not teach toward the gaokao. Mainland international schools operate under their own enrolment rules which vary and which families must confirm directly with the school and the relevant authority. Diplomatic families should also note that their own status may bear on which framework applies to their children at all — that is a question for their mission and their own advisers, and we would not attempt to answer it.',
    homeTuitionDetail: 'Not offered in mainland China.',
    onlineLearningDetail: 'Where a family\'s circumstances permit, live online delivery runs on a five-hour offset with evening classes in China falling in our afternoon. In mainland China this is subject to the constraints set out above.',
    faqs: [
      { q: 'Can our child in Beijing study with Smartious?', a: 'If they are of compulsory-education age and resident in mainland China, we do not enrol them for subject teaching. The full reasoning is on our Shanghai page and in our China legal section.' },
      { q: 'We are a diplomatic family — does that change anything?', a: 'It may bear on which framework applies to your children, but that is a question for your mission and your own advisers. We have not assessed your position and would not claim to.' },
      { q: 'We are posted onward next year — can you help then?', a: 'Yes. Setting up a pathway that continues unchanged into the next posting is exactly the kind of continuity planning we do well, and we are glad to discuss it ahead of a move.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'shenzhen-cn',
    name: 'Shenzhen & the Greater Bay',
    county: 'Guangdong Province',
    region: 'The technology and manufacturing centre of the Pearl River delta · a young professional population · border crossings to Hong Kong · an international school sector operating under its own enrolment rules',
    primaryKeyword: 'International curriculum information for Shenzhen families',
    heroTagline: 'For Shenzhen and Greater Bay families — the mainland position, and what changes across the border.',
    intro: 'This page sets out the regulatory position rather than making an offer. Shenzhen anchors the technology and manufacturing economy of the Pearl River delta with a young professional population and border crossings to Hong Kong, and it sits under the same mainland framework as Beijing and Shanghai: the Double Reduction policy bans for-profit tutoring in academic subjects for students in compulsory education and places a strict ban on foreign teachers physically based outside China teaching students in China. We do not enrol compulsory-education-age students resident in mainland China for subject teaching. What differs here is proximity — Hong Kong and Macau are Special Administrative Regions with their own education systems, and families who move across follow a different framework entirely.',
    heroImg: '/heroes/shenzhen-cn.jpg',
    altTexts: { hero: 'Shenzhen and the Pearl River delta' },
    seoDesc: 'Information for Shenzhen and Greater Bay families on international curricula and the mainland regulatory position on off-campus subject teaching, and how Hong Kong and Macau differ.',
    challenges: [
      'The Double Reduction policy bans for-profit academic tutoring for students in compulsory education.',
      'It places a strict ban on foreign teachers physically based outside China teaching students in China.',
      'Families with connections on both sides of the boundary need to know which framework applies to them.',
      'Institutions may not use foreign curricula, and overseas education materials are subject to review.',
      'Mainland international schools operate under their own enrolment rules, which families must confirm directly.',
    ],
    familySituations: [
      'Families seeking to understand the regulatory position before making enquiries.',
      'Households with connections in both Shenzhen and Hong Kong.',
      'Technology and manufacturing professionals who may relocate internationally.',
      'Families relocating to Hong Kong or Macau, where the education systems are separate.',
      'Households whose circumstances may fall outside the policy and who intend to take their own advice first.',
    ],
    nearbyAreas: ['Futian', 'Nanshan', 'Bao\'an', 'Guangzhou', 'Dongguan', 'Zhuhai', 'the Hong Kong boundary'],
    subjects: [
      'Where a family\'s circumstances permit, and only after they have taken their own advice: Cambridge IGCSE and A-Level, Pearson Edexcel, IB Diploma and AP subjects as taught across our other markets',
      'Full provision for families resident in the Hong Kong and Macau Special Administrative Regions',
      'University application support and continuity planning for families relocating internationally',
    ],
    whyChoose: [
      ['Residence decides the framework, and we say so', 'Mainland China, Hong Kong and Macau have different education systems. Which applies to a family turns on where they legally reside, not on where they work or cross to.'],
      ['The constraint stated before the offer', 'The Double Reduction policy is in our opening paragraph rather than a footnote.'],
      ['Full provision across the boundary', 'Families resident in Hong Kong or Macau are served in the ordinary way, with no waiting list.'],
      ['Continuity for an international move', 'Technology and manufacturing careers move. A single pathway continues unchanged wherever the next country is.'],
      ['No claim we have assessed your position', 'We have not. Take your own advice before contacting us if you believe your circumstances differ.'],
    ],
    growingReason: 'Shenzhen anchors the technology and manufacturing economy of the Pearl River delta with a young professional population and border crossings to Hong Kong — within a mainland regulatory framework for off-campus subject teaching that directly constrains providers based outside China, and adjacent to two Special Administrative Regions with separate education systems. Mainland China runs UTC+8, five hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Full provision for Hong Kong and Macau residents. In mainland China, subject teaching is constrained by the Double Reduction policy and we do not enrol compulsory-education-age resident students.',
      cbc: 'Kenya CBC available where a family\'s circumstances permit and they have taken their own advice.',
      ib: 'IB Diploma Programme offered in the SARs and across our other markets, subject to the mainland constraint here.',
      american: 'American Curriculum with AP offered in the SARs and across our other markets, subject to the mainland constraint here.',
    },
    homeschoolDetail: 'The mainland position is set out in full on our Shanghai page and applies identically in Shenzhen and across Guangdong: the Double Reduction policy of 24 July 2021 bans all forms of for-profit tutoring in academic subjects for students receiving compulsory education, places a strict ban on foreign teachers physically based outside China teaching students in China, and prohibits institutions from using foreign curricula. We are a for-profit provider with teachers based outside China teaching a foreign curriculum, so we do not enrol compulsory-education-age students resident in mainland China for subject teaching. The Greater Bay area does raise one distinction more sharply than anywhere else, and it is worth stating precisely: Hong Kong and Macau are Special Administrative Regions with their own education systems, curricula and regulators, separate from the mainland framework. Which applies to a family is determined by where they legally reside, not by where they work or which boundary they cross. Families resident in the SARs are served in the ordinary way; families resident in the mainland are subject to the constraints above. A household with a foot on each side should establish which describes them before enquiring, and that is a question for their own advisers rather than for us.',
    homeTuitionDetail: 'Not offered in mainland China. Available in the ordinary way for Hong Kong and Macau residents.',
    onlineLearningDetail: 'Where a family\'s circumstances permit, live online delivery runs on a five-hour offset with evening classes falling in our afternoon. In mainland China this is subject to the constraints set out above.',
    faqs: [
      { q: 'We live in Shenzhen but work in Hong Kong — which framework applies?', a: 'Your country or territory of legal residence rather than where you work or cross to. Mainland China, Hong Kong and Macau have separate education systems, and this is a question for your own advisers before you enquire.' },
      { q: 'Can our child in Shenzhen study with Smartious?', a: 'If they are of compulsory-education age and resident in mainland China, we do not enrol them for subject teaching. The full reasoning is on our Shanghai page.' },
      { q: 'What if we move to Hong Kong?', a: 'Then you are served in the ordinary way, with no waiting list and evening classes that fall in our afternoon.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const CHINA_COUNTRY = {
  slug: 'china',
  name: 'China',
  longName: 'People\'s Republic of China',
  adjective: 'Chinese',
  flag: '🇨🇳',
  hub: '/online-school/china',
  hubPageId: 'homeschooling-china',
  cityPageId: 'china-city',

  currency: 'CNY',
  currencyName: 'Chinese Yuan / Hong Kong Dollar / Macanese Pataca',
  currencyPeg: 'Fees are invoiced in USD. For Hong Kong families the Hong Kong dollar\'s long-standing link to the US dollar makes that unusually predictable; Macau and mainland equivalents are confirmed at invoicing.',

  timezone: {
    code: 'CST / HKT',
    name: 'UTC+8 across mainland China, Hong Kong and Macau, with no seasonal clock changes',
    utcOffset: '+8',
    offsetFromEAT: 'Five hours ahead of our teaching base — so evening classes land comfortably in our afternoon',
  },

  examCentres: ['Extensive authorised Cambridge and Pearson Edexcel provision in Hong Kong through its very large international and local school sector, confirmed per family per session; Macau provision checked per session'],
  examCentreTiles: [
    { city: 'Hong Kong', centre: 'Authorised provision', area: 'Extensive external-candidate capacity, confirmed per family per session.' },
    { city: 'Macau', centre: 'Regional provision', area: 'Checked per family per session, with Hong Kong as the alternative.' },
    { city: 'Mainland China', centre: 'Not applicable to our offer', area: 'We do not enrol compulsory-education-age mainland residents for subject teaching, so we do not arrange sittings for them.' },
  ],
  examLogisticsProse: 'For Hong Kong and Macau families, Cambridge International and Pearson Edexcel examinations sit as external candidates at authorised provision, with capacity confirmed per family per session — Hong Kong has among the most extensive provision anywhere given the size of its school sector, and Macau families are checked locally first with Hong Kong an hour away as the alternative. Our arrangement runs alongside a school enrolment, which continues its own track unchanged; Smartious is not a registered school in Hong Kong or Macau, issues no local qualification, and does not teach toward the HKDSE. For mainland China the position is different and set out in full in our legal section: we do not enrol compulsory-education-age students resident in the mainland for subject teaching, and we therefore do not arrange examination sittings for them.',
  secondaryProgrammeExamRef: 'Authorised Hong Kong and Macau provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/china.jpg',
  heroEyebrow: 'Online school for Hong Kong and Macau',
  heroH1Suffix: 'Hong Kong, Macau and China',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for families in the Hong Kong and Macau Special Administrative Regions, which have their own education systems. For mainland China we set out the regulatory position honestly first: the Double Reduction policy constrains what a provider based outside China may offer, and we do not enrol compulsory-education-age mainland residents for subject teaching.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — no waiting list, evening classes, for Hong Kong and Macau families.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Hong Kong or Macau',

  citiesSectionTitle: 'Where we serve, and where we do not',
  citiesSectionBody: 'Smartious serves families in the Hong Kong Special Administrative Region (one of the deepest international school sectors anywhere, with famously competitive admissions and long waiting lists — which is where we help most) and the Macau Special Administrative Region (a small international sector relative to its internationally recruited workforce). Both have their own education systems and regulators. Our Shanghai, Beijing and Shenzhen pages exist to set out the mainland regulatory position rather than to make an offer, because the Double Reduction policy constrains what a provider based outside China may lawfully do, and we would rather say so plainly than let a family find out later.',

  trustSignals: [
    { h: 'We state the mainland constraint before anything else', p: 'The Double Reduction policy of July 2021 bans for-profit tutoring in academic subjects for students in compulsory education and places a strict ban on foreign teachers physically based outside China teaching students in China. That describes us. We do not enrol compulsory-education-age mainland residents for subject teaching, and we put that in the opening paragraph rather than a footnote.' },
    { h: 'Hong Kong and Macau are separate education systems', p: 'Both Special Administrative Regions have their own education systems, curricula and regulators, distinct from the mainland framework. Families resident there are served in the ordinary way, and which framework applies turns on legal residence rather than on where a family works.' },
    { h: 'No waiting list, which is the Hong Kong problem', p: 'Hong Kong has excellent schools and famously competitive admissions. Waiting lists — particularly for mid-year arrivals — are the defining constraint of that market, and a child starts with us within a week of the assessment.' },
    { h: 'Evening classes that work', p: 'Hong Kong and Macau run UTC+8 with no seasonal changes, five hours ahead of our teaching base, so a seven or eight o\'clock evening class sits comfortably in our afternoon every week of the year.' },
  ],

  universitiesInCountry: 'in Hong Kong, the University of Hong Kong, the Chinese University of Hong Kong, HKUST, City University and PolyU — several among the strongest in Asia; in Macau, the University of Macau and the Macau University of Science and Technology; and across the mainland, a very large university system led by institutions of global standing.',
  universityChannels: 'Hong Kong universities admit on the HKDSE and on international qualifications including Cambridge A-Levels, the IB Diploma and AP records, which they read directly — and Hong Kong students are among the most internationally mobile anywhere, applying in large numbers to the United Kingdom, the United States, Canada, Australia and Singapore. UCAS reads A-Levels natively, and A-Levels are accepted in 160+ countries. Macau institutions likewise admit international qualifications through their own procedures. For mainland universities, admission runs principally through the gaokao and we do not teach toward it; foreign qualifications enter through separate channels which a family must confirm per institution. Smartious provides personalised university guidance across UK (UCAS), US, Canadian, Australian, Singaporean, Hong Kong and Macau destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Hong Kong and Macau families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes in evening blocks — five hours ahead of our teaching base, so a seven o\'clock class is two in the afternoon for us — run alongside a school enrolment, or as a complete interim programme for a family waiting for a place. No waiting list. Cambridge Chinese and Portuguese available beside the English-medium core. Not offered to compulsory-education-age residents of mainland China.',
  britishCurriculumSuits: 'Hong Kong and Macau families targeting the Cambridge pathway. Best fit for: (1) families who have relocated to Hong Kong and are on school waiting lists, (2) students needing a subject their school cannot staff for a small cohort, (3) households outside the top tier\'s fees and debentures, (4) Macau families with a small local international sector, (5) families whose next posting may be another country entirely.',
  britishCurriculumDelivery: 'Live online classes in evening blocks, small groups 4-6 students, every session recorded, alongside a school enrolment or as a complete interim programme.',
  ibDiplomaSuits: 'Hong Kong and Macau families in the territory\'s substantial IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Hong Kong and Macau families targeting American universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. China is the one market in our coverage where we have narrowed the offer rather than widened it — the mainland regulatory framework speaks directly to providers based outside the country, and we would rather serve Hong Kong and Macau properly than pretend the mainland position is something it is not.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, which suits the Hong Kong students most often looking for a Further Mathematics or Physics set their school cannot run. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Hong Kong has one of the deepest and most competitive international school sectors in the world — ESF, Harrow, Kellett, the Chinese International School, German Swiss, Canadian International and many others — with fees among the highest anywhere and, at some schools, debentures and capital levies on top. Those are outstanding institutions and we would not pretend to improve on them. The gap in Hong Kong is not quality but access: waiting lists, mid-year arrivals with nowhere to go, and specialist A-Level sets that will not run for four students. Macau\'s international sector is much smaller relative to its internationally recruited workforce. For mainland China we are not competing at all, and our pages there say so.',
  competitors: [
    { name: 'ESF schools',                                     city: 'Hong Kong',             curriculum: 'IB continuum and IGCSE',                feesUsd: 'High, plus capital levies',                         feesAed: 'Long waiting lists',      rating: 4.7, capacityNote: 'Excellent and heavily oversubscribed — the waiting list is the constraint, not the teaching' },
    { name: 'Harrow, Kellett, Chinese International School',   city: 'Hong Kong',             curriculum: 'British, IB and bilingual',             feesUsd: 'Among the highest in the world',                    feesAed: 'Debentures common',       rating: 4.8, capacityNote: 'World-class and priced accordingly, with debentures and capital levies at some schools' },
    { name: 'German Swiss, Canadian International and others', city: 'Hong Kong',             curriculum: 'National-system and international',      feesUsd: 'Premium tier',                                      feesAed: 'Competitive places',      rating: 4.6, capacityNote: 'A deep second tier — and still oversubscribed for mid-year entry' },
    { name: 'The Macau international sector',                  city: 'Macau',                 curriculum: 'International, Portuguese and local',    feesUsd: 'Mid to premium tier',                               feesAed: 'Limited places',          rating: 4.2, capacityNote: 'Small relative to the internationally recruited workforce, with Hong Kong an hour away and full' },
    { name: 'Hong Kong tutoring sector',                       city: 'Hong Kong',             curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Very widespread',         rating: 4.1, capacityNote: 'Enormous and well established — usually one-to-one or large-group, and rarely a structured year' },
    { name: 'Mainland China',                                  city: 'Shanghai, Beijing, Shenzhen', curriculum: '—',                               feesUsd: 'Not a market we serve',                             feesAed: '—',                       rating: 0,   capacityNote: 'The Double Reduction policy constrains providers based outside China. We do not enrol compulsory-education-age mainland residents for subject teaching' },
    { name: 'Smartious Homeschool (Hong Kong and Macau)',      city: 'Delivered to both SARs', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP',   feesUsd: 'USD 2,160-6,480/year',                              feesAed: 'HKD/MOP at prevailing rate', rating: 4.8, capacityNote: 'No waiting list + a complete interim programme while a place comes free + the sets a timetable cannot staff + honest about the mainland position' },
  ],

  legalFrameworkIntro: 'This is the only country page in our coverage where we lead with a constraint on ourselves rather than a description of a system. It is important enough to warrant that.',
  legalFramework: [
    { h: 'Three separate education systems, not one', p: 'The first thing to establish is that this page covers three distinct education systems. Mainland China has its own framework. The Hong Kong Special Administrative Region has its own education system, curriculum and regulator. The Macau Special Administrative Region likewise. Which applies to a family is determined by where they legally reside, not by where they work or which boundary they cross. Almost everything that follows concerns the mainland; families resident in Hong Kong or Macau can read this section for context and then treat our offer as they would in any other market.' },
    { h: 'The Double Reduction policy, stated in full', p: 'In mainland China, the policy formally titled Opinions on Further Reducing the Homework Burden and Off-Campus Training Burden of Students in Compulsory Education was issued on 24 July 2021 by the General Office of the CPC Central Committee and the State Council, and took effect on release. It bans all forms of for-profit tutoring in academic subjects for students receiving compulsory education. Subject-based training is defined to cover the subjects taught in compulsory education schools — Chinese literature, history, geography, mathematics, foreign languages including English, physics, chemistry, biology, and morals and law. Compulsory education comprises six years of primary education, typically from about age six, followed by three years of junior secondary; reporting indicates the Opinions are also likely to apply through upper middle school. Existing subject-based institutions must convert to non-profit status, foreign capital is prohibited from participating in them, training materials and overseas education materials are subject to a filing and review system, subject training is prohibited during national holidays, weekends and school breaks, and advertising for training institutions is banned on mainstream media platforms.' },
    { h: 'The provision that speaks directly to us', p: 'One element matters more than all the others for a provider like Smartious, and we would be dishonest to bury it. The policy places a strict ban on foreign teachers physically based outside of China teaching students in China. Our teachers are physically based outside China. Separately, institutions may not use foreign curricula, and non-subject-based institutions are prohibited from providing overseas education courses — and Cambridge, Edexcel, the IB and AP are foreign curricula. And we are a for-profit provider. That is three distinct points of contact between our business model and the policy, and no reading of it that we find plausible leaves room for us to enrol compulsory-education-age students resident in mainland China for subject teaching.' },
    { h: 'What we therefore do, and will not do', p: 'We do not enrol compulsory-education-age students resident in mainland China for subject teaching, regardless of what a family is willing to pay or how the enquiry is framed. We hold no mainland licence, are not a registered mainland school, and do not teach toward the gaokao. We will not suggest that the policy can be worked around, that enforcement varies, or that other providers do it anyway — a family acting on that kind of hint carries the consequence, not us, and we are not willing to expose anyone to it in exchange for a subscription. If a family believes their particular circumstances fall outside the policy, they should take their own advice before contacting us rather than after; we have not assessed anyone\'s individual position and cannot. Mainland international schools operate under their own enrolment rules, which vary and which a family must confirm with the school and the relevant authority directly.' },
    { h: 'Hong Kong and Macau, where we do operate normally', p: 'Both Special Administrative Regions have their own education systems and regulators. Education is compulsory in both and administered by their own education authorities; we could not verify a settled framework for parental home education in either and will not guess, so a family whose plan depends on educating outside a registered school should take advice on their own position first. Smartious is not a registered school in either territory, issues no local qualification, and does not teach toward the HKDSE. What we offer there is what we offer across our coverage: live Cambridge, Edexcel, IB or AP subject teaching alongside a school enrolment — with one configuration particular to Hong Kong, which is a complete interim programme for a family on a school waiting list.' },
    { h: 'The clock, and why Hong Kong is the market that needs us most', p: 'Hong Kong, Macau and the mainland all run UTC+8 with no seasonal clock changes, five hours ahead of our teaching base. A seven o\'clock evening class in Hong Kong is two in the afternoon for our teachers and an eight o\'clock class is three — comfortable teaching hours, every week of the year. And the Hong Kong case is worth stating plainly: this is a territory with outstanding schools where the binding constraint is places rather than quality. Waiting lists, particularly for families arriving mid-year, are the defining feature of the market. A child who starts with us within a week of an assessment is not settling for less; they are avoiding losing a term or two of schooling while a place comes free, and a great many of our Hong Kong families use us exactly that way and then either stay for a subject or two or move on with our blessing.' },
  ],

  whySmartious: [
    { h: 'Honest about the mainland, in the first paragraph',            p: 'The Double Reduction policy constrains providers based outside China, and we say so before making any offer rather than after taking a fee.' },
    { h: 'No waiting list, which is the Hong Kong constraint',           p: 'Excellent schools, competitive admissions, long queues. A child starts with us within a week of the assessment.' },
    { h: 'A complete interim programme, not a holding exercise',         p: 'Families waiting for a Hong Kong place run a full internationally examined pathway in the meantime rather than losing a term.' },
    { h: 'The set your school cannot staff',                             p: 'Further Mathematics or a third science for four pupils is unviable on one timetable and routine in a live group drawn across countries.' },
    { h: 'Evening classes that work',                                    p: 'Five hours ahead, so a seven o\'clock evening class is two in the afternoon for our teachers.' },
    { h: 'Residence decides the framework, and we explain it',           p: 'Mainland China, Hong Kong and Macau are three separate systems. Which applies turns on legal residence, not on where a family works.' },
  ],

  faqs: [
    { q: 'Can a child in mainland China study with Smartious?', a: 'If they are of compulsory-education age and resident in mainland China, no — we do not enrol them for subject teaching. The Double Reduction policy bans for-profit academic tutoring for compulsory-education students and places a strict ban on foreign teachers physically based outside China teaching students in China. Our teachers are based outside China, we are for-profit, and we teach a foreign curriculum.' },
    { q: 'Why are you publishing this rather than just marketing?', a: 'Because a family who enrols on a claim that turns out to be wrong bears the consequence, not us. We would rather lose enquiries than expose anyone. Any provider telling mainland families something more comfortable should be asked which part of the policy they are relying on.' },
    { q: 'Is Hong Kong different?', a: 'Yes. Hong Kong is a Special Administrative Region with its own education system, curriculum and regulator, and we serve families resident there in the ordinary way. The same applies to Macau.' },
    { q: 'We live in Shenzhen and work in Hong Kong — which applies?', a: 'Your place of legal residence rather than where you work or cross to. That is a question for your own advisers before you enquire, and we would not attempt to answer it for you.' },
    { q: 'What is the main reason Hong Kong families come to you?', a: 'Waiting lists. Admissions are among the most competitive anywhere and mid-year arrivals routinely find every preferred school full. We have no waiting list, and a complete programme runs while a place comes free.' },
    { q: 'Do you teach the HKDSE or the gaokao?', a: 'Neither. We are not a registered school in Hong Kong, Macau or the mainland and issue no local qualification. We teach Cambridge, Edexcel, IB and AP.' },
    { q: 'What time are classes?', a: 'Evening. Hong Kong and Macau run UTC+8, five hours ahead of our teaching base, so a seven o\'clock class is two in the afternoon for our teachers and eight o\'clock is three.' },
    { q: 'Which places does Smartious cover here?', a: 'Hong Kong and Macau have full service pages. Our Shanghai, Beijing and Shenzhen pages set out the mainland regulatory position rather than making an offer.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process, for families resident in the Hong Kong and Macau Special Administrative Regions. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether you are on a school waiting list: in Hong Kong that is the most common reason families contact us, and it changes how we build the first term. For mainland China, please read our legal section before enquiring.',
}
