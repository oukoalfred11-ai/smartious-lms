// ═══════════════════════════════════════════════════════════════════
// MYANMAR — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for professional, academic, agricultural and
// Myanmar families across Yangon, Mandalay, Naypyidaw, Taunggyi and
// Mawlamyine.
// FIRST SOUTHEAST ASIA BUILD OF THIS SERIES — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// *** TONE RULE — THE STRICTEST IN THE ENTIRE SYSTEM. READ TWICE ***
// NO political content of ANY kind. NO commentary on any conflict,
// any government, any party, any group, any event, any period, any
// security matter, any sanction, any humanitarian question. NONE.
// - Describe cities ONLY by geography, rivers, universities,
//   agriculture, trade, crafts and industry.
// - Do NOT use: crisis, conflict, unrest, instability, coup, regime,
//   military, transition, sanctions, displacement, danger, security,
//   emergency, reform, opening, isolation.
// - Do NOT reference dates or periods in a way that implies events.
// - Myanmar has a deep educational and scholarly tradition and its
//   universities have long histories. That, plus geography and
//   economy, is the entire permitted frame.
// - Where continuity of schooling is mentioned, use exactly ONE
//   neutral sentence about recorded lessons covering a class that
//   cannot be attended, with NO cause attributed whatsoever.
// - If any sentence cannot be written without implying something
//   political, DELETE IT. There is no sentence here worth the risk.
//
// *** TIMEZONE — THE FIRST HALF-HOUR OFFSET IN OUR COVERAGE ***
// Myanmar runs MMT at UTC+6:30 with no seasonal changes. Our
// teaching base runs UTC+3 year-round. So Myanmar is THREE AND A
// HALF HOURS AHEAD of us — the first and only half-hour offset in
// the system, and it runs in the favourable direction:
//   Myanmar 16:00 = 12:30 for us
//   Myanmar 18:00 = 14:30 for us
//   Myanmar 20:00 = 16:30 for us
// Myanmar AFTER-SCHOOL and EVENING slots land squarely in the middle
// of our teaching day. This is one of the better relationships we
// have — an after-school arrangement, which fails in most of Latin
// America, works perfectly here. Lead with it.
//
// LEGAL POSITIONING NOTE — HEDGE FIRMLY, SOURCING IS THIN:
// - We could NOT verify Myanmar's position on parental home
//   education against a primary instrument.
// - What we can state: education is administered by the MINISTRY OF
//   EDUCATION; basic education is compulsory at the primary level;
//   private schools operate with ministry registration.
// - State the compulsory range GENERALLY. Do not quote ages we have
//   not verified. Route families to the Ministry of Education.
// - PHRASE EVERY TIME: "we could not verify", "we are not aware of a
//   specific framework", plus "confirm with the Ministry of
//   Education". NEVER assert permitted, NEVER assert prohibited.
// - Reuse the absence-of-regulation-is-not-permission argument.
// - Smartious is NOT a registered Myanmar school; say so.
// - The national qualification is commonly referred to as the
//   MATRICULATION examination. We do NOT teach toward it and say so.
//   Many Myanmar private schools already offer IGCSE and A-Level
//   alongside, so the parallel-track idea is familiar here.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT.
//
// CURRENCY: MMK, with USD used for larger commitments. Fees quoted
// in USD. State neutrally, nothing further.
//
// MARKET NOTE: Yangon holds the deepest international school
// provision — the International School Yangon, Dulwich College
// Yangon, the International School of Myanmar, Yangon Academy and
// others — with IGCSE, A-Level and IB provision and fees at
// international levels. Mandalay is the second city, a centre of
// trade, crafts, gemstones and agriculture with a long university
// tradition. Naypyidaw is the administrative capital. Taunggyi
// anchors Shan State's highland agriculture, tea and horticulture
// with Inle Lake nearby. Mawlamyine is the southern coastal city and
// port at the Thanlwin river mouth, with rubber and agriculture
// through Mon State. Myanmar students have used IGCSE and A-Level
// through private schools for many years, so Cambridge is familiar.
// ═══════════════════════════════════════════════════════════════════

export const MYANMAR_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'yangon-mm',
    name: 'Yangon',
    county: 'Yangon Region',
    region: 'The commercial capital and largest city · the country\'s deepest international school provision · a long university tradition and a professional community · the Yangon river port',
    primaryKeyword: 'Online school and international curriculum in Yangon',
    heroTagline: 'For Yangon families — Cambridge and IB taught live in your after-school hours, which land squarely in our teaching day.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Yangon families. The commercial capital holds the country\'s deepest international school provision, a long university tradition, a substantial professional community and the river port that has shaped its trade for centuries. Cambridge is well understood here — Myanmar private schools have offered IGCSE and A-Level for many years. What we add is the subject sets a single timetable cannot sustain, fees below the international tier, and a timetable that fits an ordinary Yangon school day: our teaching hours land squarely in your after-school and evening.',
    heroImg: '/heroes/yangon-mm.jpg',
    altTexts: { hero: 'Yangon' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Yangon families — after-school and evening classes that fit our teaching day. From USD 400/month.',
    challenges: [
      'International school fees in Yangon are set at international levels with competitive places.',
      'Specialist A-Level subjects often will not run for small cohorts even in strong schools.',
      'Basic education is compulsory and administered by the Ministry of Education.',
      'We could not verify Myanmar\'s position on parental home education from a primary instrument.',
      'Time zone: Myanmar runs UTC+6:30, three and a half hours ahead of our teaching base — so after-school and evening slots work well.',
    ],
    familySituations: [
      'Professional and commercial families outside the international tier\'s fees.',
      'Students in Myanmar private schools already following IGCSE who need additional subjects.',
      'Academic and university-connected households.',
      'Families whose children will apply to universities abroad.',
      'Students needing a subject their school cannot staff for a small group.',
      'Households arriving mid-curriculum from another country\'s system.',
    ],
    nearbyAreas: ['Downtown Yangon', 'Bahan', 'Golden Valley', 'Mayangone', 'Thingangyun', 'Hlaing', 'Thanlyin'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Chinese, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Singaporean, Australian, Thai and Myanmar university applications',
    ],
    whyChoose: [
      ['After-school hours that genuinely work', 'Myanmar runs three and a half hours ahead of our teaching base, so a four or six o\'clock class in Yangon lands in the middle of our day. An after-school arrangement fails in most of our markets and works cleanly here.'],
      ['The set your school cannot staff', 'Further Mathematics or a third science for four pupils is unviable on one timetable and routine in a live group drawn from several countries.'],
      ['A fee gap against the international tier', 'Live small-group teaching at USD 2,160-6,480 a year, quoted in USD.'],
      ['Cambridge is already familiar here', 'Myanmar private schools have offered IGCSE and A-Level for many years, so families understand where an examined international track sits.'],
      ['Honest about the legal gap', 'We could not verify Myanmar\'s home-education position and say so rather than guessing in either direction.'],
    ],
    growingReason: 'Yangon is the commercial capital and largest city, holding the country\'s deepest international school provision, a long university tradition, a substantial professional community and the river port that has shaped its trade for centuries. Myanmar runs MMT (UTC+6:30), three and a half hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Yangon families, taught alongside a Myanmar school enrolment in after-school and evening blocks. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Yangon families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the city\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Myanmar education is administered by the Ministry of Education, basic education is compulsory at the primary level, and private schools operate with ministry registration — families should confirm the current age boundaries with the Ministry rather than take them from a provider. On parental home education we could not verify Myanmar\'s position against a primary instrument, and we are not going to guess. We will not tell you it is permitted and we will not tell you it is prohibited; both would exceed what we can evidence. What we would add is the point we make in Jordan, Iraq, Lebanon and elsewhere: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to the Ministry of Education directly and keep the answer. Two clarifications: the national qualification is commonly referred to as the matriculation examination and we do not teach toward it, and Smartious is not a registered Myanmar school and issues no Myanmar qualification. That distinction is less confusing here than in many markets, because Myanmar private schools have offered IGCSE and A-Level alongside the national route for many years — an internationally examined track sitting beside the national record is a familiar arrangement.',
    homeTuitionDetail: 'Smartious delivers to Yangon families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Myanmar runs three and a half hours ahead of our teaching base with no seasonal changes on either side, so a four, six or eight o\'clock evening class in Yangon sits comfortably inside our teaching day, at the same time every week of the year. Every session is recorded, so a class that cannot be attended is never a class lost.',
    faqs: [
      { q: 'Is homeschooling legal in Myanmar?', a: 'We could not verify a position from a primary instrument and will not guess. Basic education is compulsory at the primary level and administered by the Ministry of Education. An absence of clear regulation is not a permission — put the question to the Ministry directly. Structured study alongside a school enrolment raises none of it.' },
      { q: 'Do you teach the matriculation examination?', a: 'No. We are not a registered Myanmar school and issue no Myanmar qualification. We teach Cambridge, Pearson Edexcel, IB and AP examinations, which sit alongside the national record — a familiar arrangement here, since private schools have offered IGCSE and A-Level for many years.' },
      { q: 'What time are classes?', a: 'After-school and evening work particularly well. Myanmar is three and a half hours ahead of our teaching base, so a four o\'clock class in Yangon is half past twelve for our teachers and a six o\'clock class is half past two — squarely in our day.' },
      { q: 'Our school already offers IGCSE — what would we gain?', a: 'Usually a subject it cannot staff for a small cohort: Further Mathematics, a third science, or a set that clashes. If your school covers what your child needs, we will tell you so.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'mandalay-mm',
    name: 'Mandalay',
    county: 'Mandalay Region',
    region: 'The second city and the historic cultural centre · trade, crafts, gemstones and agriculture across the central dry zone · a long university tradition · far thinner international provision than Yangon',
    primaryKeyword: 'Online school and international curriculum in Mandalay',
    heroTagline: 'For Mandalay families — the second city and its trading tradition, with a fraction of Yangon\'s international provision.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Mandalay families. The second city sits at the centre of the country\'s trade routes and its historic cultural life — crafts, gemstones, textiles and the agriculture of the central dry zone, alongside a long university tradition. It is a substantial commercial and academic population, and international school provision here is a fraction of Yangon\'s, six hundred kilometres south. Live delivery reaches Mandalay identically, in after-school and evening hours that fit our teaching day.',
    heroImg: '/heroes/mandalay-mm.jpg',
    altTexts: { hero: 'Mandalay and the Ayeyarwady' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Mandalay families — the second city, thin international provision. From USD 400/month.',
    challenges: [
      'International provision is a fraction of Yangon\'s, six hundred kilometres south.',
      'A substantial commercial and academic population with few local options.',
      'Basic education is compulsory and administered by the Ministry of Education.',
      'We could not verify Myanmar\'s position on parental home education.',
      'Time zone: Myanmar runs UTC+6:30 — after-school and evening slots work well.',
    ],
    familySituations: [
      'Trading, crafts and gemstone business families.',
      'Agricultural and agro-processing households across the central region.',
      'University academic and professional families.',
      'Students aiming at universities abroad or English-medium institutions.',
      'Households that would otherwise consider relocating to Yangon for schooling.',
    ],
    nearbyAreas: ['Mandalay', 'Amarapura', 'Sagaing', 'Pyin Oo Lwin', 'Monywa', 'Meiktila', 'the central region'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Chinese and home language support',
      'Cambridge A-Level Mathematics, Physics, Chemistry, Biology, Economics',
      'Cambridge A-Level Business, Computer Science, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Singaporean, Thai, Chinese and Myanmar university applications',
    ],
    whyChoose: [
      ['The complete option six hundred kilometres from the tier', 'Identical live delivery in Mandalay and Yangon — no relocation and no boarding decision.'],
      ['Business and economics for a trading city', 'Cambridge A-Level Economics, Business, Accounting and Mathematics suit families who have run central Myanmar\'s commerce for generations.'],
      ['After-school hours that genuinely work', 'A six o\'clock class in Mandalay is half past two for our teachers — squarely in our teaching day.'],
      ['Chinese kept as an examined subject', 'Cambridge Chinese runs alongside the English-medium core, which suits the city\'s long trading connections.'],
      ['Honest about the legal gap', 'We could not verify Myanmar\'s home-education position and say so.'],
    ],
    growingReason: 'Mandalay sits at the centre of the country\'s trade routes and historic cultural life — crafts, gemstones, textiles and central dry zone agriculture — alongside a long university tradition, with international school provision a fraction of Yangon\'s six hundred kilometres south. Myanmar runs MMT (UTC+6:30), three and a half hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the central region, taught alongside a Myanmar school enrolment in after-school and evening blocks.',
      cbc: 'Kenya CBC available for Mandalay families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Mandalay: education is administered by the Ministry of Education, basic education is compulsory at the primary level, and private schools operate with ministry registration. We could not verify Myanmar\'s position on parental home education against a primary instrument and decline to characterise it in either direction — confirm with the Ministry of Education directly, noting that an absence of clear regulation is an absence of protection rather than a permission. Smartious is not a registered Myanmar school, issues no Myanmar qualification and does not teach toward the matriculation examination. Our arrangement is live international teaching alongside a Myanmar school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Mandalay families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school and evening blocks, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Mandalay?', a: 'A fraction of Yangon\'s, six hundred kilometres south. Live delivery reaches Mandalay and the central region identically, with examination travel planned into each window ahead.' },
      { q: 'Can our child keep Chinese?', a: 'Yes — Cambridge Chinese runs alongside the English-medium core as a formal examined subject, which suits the city\'s long trading connections.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'naypyidaw-mm',
    name: 'Naypyidaw',
    county: 'Naypyidaw Union Territory',
    region: 'The administrative capital · government institutions and the professional community around them · a planned city with dispersed districts · very limited international school provision',
    primaryKeyword: 'Online school and international curriculum in Naypyidaw',
    heroTagline: 'For Naypyidaw families — the administrative capital, with very little international schooling built for it.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Naypyidaw families. The administrative capital holds the country\'s government institutions and the professional community that works around them, laid out as a planned city with widely dispersed districts. International school provision is very limited, and Yangon is around three hundred and twenty kilometres south. For families here the constraint is straightforward — distance and availability — and live delivery answers both, in after-school and evening hours that fit our teaching day.',
    heroImg: '/heroes/naypyidaw-mm.jpg',
    altTexts: { hero: 'Naypyidaw' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Naypyidaw families — the administrative capital, very limited provision. From USD 400/month.',
    challenges: [
      'Very limited international school provision in the administrative capital.',
      'Yangon is around three hundred and twenty kilometres south.',
      'A planned city with widely dispersed districts and long internal journeys.',
      'We could not verify Myanmar\'s position on parental home education.',
      'Time zone: Myanmar runs UTC+6:30 — after-school and evening slots work well.',
    ],
    familySituations: [
      'Professional and administrative families in the capital.',
      'Households posted to the capital from elsewhere in the country.',
      'Families whose children will apply to universities abroad.',
      'Students needing subjects unavailable locally at A-Level standard.',
      'Households in the outer districts far from any school with international provision.',
    ],
    nearbyAreas: ['Naypyidaw', 'Pyinmana', 'Lewe', 'Tatkon', 'Zabuthiri', 'Ottarathiri', 'the surrounding townships'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Chinese and home language support',
      'Cambridge A-Level Mathematics, Physics, Chemistry, Biology, Economics',
      'Cambridge A-Level Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Biology',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Singaporean, Thai and Myanmar university applications',
    ],
    whyChoose: [
      ['The complete option where provision is very limited', 'Identical live delivery in Naypyidaw and Yangon, without relocating south.'],
      ['No long internal journey', 'A planned city with dispersed districts makes a daily school run substantial. Live delivery removes it.'],
      ['After-school hours that genuinely work', 'A six o\'clock class here is half past two for our teachers.'],
      ['Small live groups with subject specialists', 'Four to six students taught live, which is a different product from a curriculum package.'],
      ['Honest about the legal gap', 'We could not verify Myanmar\'s home-education position and say so.'],
    ],
    growingReason: 'Naypyidaw is the administrative capital, holding the country\'s government institutions and the professional community around them, laid out as a planned city with widely dispersed districts and very limited international school provision. Myanmar runs MMT (UTC+6:30), three and a half hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the capital, taught alongside a Myanmar school enrolment. Examination travel planned per session well ahead.',
      cbc: 'Kenya CBC available for Naypyidaw families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Naypyidaw: education is administered by the Ministry of Education, basic education is compulsory at the primary level, and private schools operate with ministry registration. We could not verify Myanmar\'s position on parental home education against a primary instrument and will not guess — confirm with the Ministry of Education directly. Smartious is not a registered Myanmar school, issues no Myanmar qualification and does not teach toward the matriculation examination. Our arrangement is live international teaching alongside a Myanmar school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Naypyidaw families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school and evening blocks, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Naypyidaw?', a: 'Very limited. Yangon is around three hundred and twenty kilometres south. Live delivery reaches the capital identically, with examination travel planned into each window ahead.' },
      { q: 'What time would classes be?', a: 'After-school or evening. Myanmar is three and a half hours ahead of our teaching base, so a six o\'clock class here is half past two for our teachers.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'taunggyi-mm',
    name: 'Taunggyi & the Shan Highlands',
    county: 'Shan State',
    region: 'The highland agricultural centre — tea, coffee, horticulture and market gardening · Inle Lake and its communities · a cooler climate and a distinct regional economy · essentially no international schooling',
    primaryKeyword: 'Online school and international curriculum in Taunggyi',
    heroTagline: 'For Taunggyi and Shan highland families — tea, coffee and horticulture at altitude, with no international schooling at all.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Taunggyi and Shan highland families. The highlands carry a distinct regional economy — tea, coffee, horticulture and market gardening in a cooler climate than the plains, with Inle Lake and its communities nearby and agricultural trade running through Taunggyi. It is a genuinely productive region and international schooling here does not exist; Mandalay is a long journey north-west and Yangon further still. Live delivery reaches the highlands identically, in after-school and evening hours that fit our teaching day.',
    heroImg: '/heroes/taunggyi-mm.jpg',
    altTexts: { hero: 'The Shan highlands and Inle Lake' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Taunggyi and Shan highland families — tea and horticulture country, no local provision. From USD 400/month.',
    challenges: [
      'Essentially no international schooling in the highlands.',
      'Mandalay is a long journey north-west and Yangon further still.',
      'Communities dispersed across highland townships and the lake.',
      'We could not verify Myanmar\'s position on parental home education.',
      'Time zone: Myanmar runs UTC+6:30 — after-school and evening slots work well.',
    ],
    familySituations: [
      'Tea, coffee and horticulture business families.',
      'Market gardening and agricultural trade households.',
      'Families around Inle Lake and the highland townships.',
      'Students aiming at agronomy, food science or environmental programmes.',
      'Households far from any school with international provision.',
    ],
    nearbyAreas: ['Taunggyi', 'Nyaungshwe', 'Inle Lake', 'Kalaw', 'Pindaya', 'Heho', 'the Shan highlands'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Chinese and home language support',
      'Cambridge A-Level Biology, Chemistry, Geography, Mathematics, Physics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Singaporean, Thai and Myanmar university applications',
    ],
    whyChoose: [
      ['The complete option where nothing exists', 'Identical live delivery in Taunggyi and Yangon — a long journey closed by a connection rather than a move.'],
      ['Agricultural and environmental science that fit the highlands', 'Cambridge A-Level Biology and Chemistry with Geography feed agronomy, food science and horticulture directly — the disciplines this region\'s economy runs on.'],
      ['Reaches the lake and the townships', 'Nyaungshwe, Kalaw, Pindaya and the highland communities get identical live teaching.'],
      ['After-school hours that genuinely work', 'A six o\'clock class here is half past two for our teachers.'],
      ['Every session recorded', 'A class that cannot be attended is never a class lost.'],
    ],
    growingReason: 'The Shan highlands carry a distinct regional economy — tea, coffee, horticulture and market gardening in a cooler climate — with Inle Lake and its communities nearby and agricultural trade running through Taunggyi, and no international schooling at all. Myanmar runs MMT (UTC+6:30), three and a half hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the highlands, taught alongside a Myanmar school enrolment. Examination travel planned per session well ahead.',
      cbc: 'Kenya CBC available for highland families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the highlands: education is administered by the Ministry of Education, basic education is compulsory at the primary level, and private schools operate with ministry registration. We could not verify Myanmar\'s position on parental home education against a primary instrument and decline to read that silence in either direction — confirm with the Ministry of Education directly. Smartious is not a registered Myanmar school, issues no Myanmar qualification and does not teach toward the matriculation examination. Our arrangement is live international teaching alongside a Myanmar school enrolment.',
    homeTuitionDetail: 'Smartious delivers to highland families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school and evening blocks, with the full recorded library built for dispersed highland communities.',
    faqs: [
      { q: 'Is there any international schooling in the Shan highlands?', a: 'None. Mandalay is a long journey north-west and Yangon further still. Live delivery reaches Taunggyi, Nyaungshwe, Kalaw and the highland townships identically.' },
      { q: 'Our child wants agronomy or food science — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Geography or Mathematics, planned backward from the target university from IGCSE onward.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'mawlamyine-mm',
    name: 'Mawlamyine & the South',
    county: 'Mon State and the southern regions',
    region: 'The southern coastal city and port at the Thanlwin river mouth · rubber, agriculture and fisheries through Mon State · a long trading and maritime tradition · no international school provision',
    primaryKeyword: 'Online school and international curriculum in Mawlamyine',
    heroTagline: 'For Mawlamyine and southern families — a river-mouth port with a long trading tradition and nothing international to school in.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Mawlamyine and southern Myanmar families. The southern coastal city sits at the mouth of the Thanlwin river with a long trading and maritime tradition, at the centre of a regional economy built on rubber, agriculture and fisheries through Mon State and the coast beyond. International school provision does not exist here and Yangon is around three hundred kilometres north-west. Live delivery reaches the south identically, in after-school and evening hours that fit our teaching day.',
    heroImg: '/heroes/mawlamyine-mm.jpg',
    altTexts: { hero: 'Mawlamyine and the Thanlwin river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Mawlamyine and southern Myanmar families — port and rubber country, no local provision. From USD 400/month.',
    challenges: [
      'No international school provision in the southern regions.',
      'Yangon is around three hundred kilometres north-west.',
      'Families spread along the coast and through the agricultural districts.',
      'We could not verify Myanmar\'s position on parental home education.',
      'Time zone: Myanmar runs UTC+6:30 — after-school and evening slots work well.',
    ],
    familySituations: [
      'Rubber, agricultural and plantation business families.',
      'Port, shipping and fisheries households.',
      'Commercial and trading families with a long maritime tradition.',
      'University and professional households in the city.',
      'Students aiming at universities abroad or English-medium institutions.',
    ],
    nearbyAreas: ['Mawlamyine', 'Thaton', 'Ye', 'Kyaikto', 'Hpa-an', 'Dawei', 'the southern coast'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Chinese and home language support',
      'Cambridge A-Level Biology, Chemistry, Geography, Mathematics, Economics',
      'Cambridge A-Level Business, Physics, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Singaporean, Thai and Myanmar university applications',
    ],
    whyChoose: [
      ['The complete option in a region with none', 'Identical live delivery in Mawlamyine and Yangon, without relocating north-west.'],
      ['Biology and geography that fit a coastal agricultural region', 'Rubber, fisheries and the river mouth make serious ground for Cambridge Biology and Geography and AP Environmental Science.'],
      ['Business and economics for a trading port', 'Cambridge A-Level Economics, Business and Mathematics suit families who have run southern commerce for generations.'],
      ['After-school hours that genuinely work', 'A six o\'clock class here is half past two for our teachers.'],
      ['Reaches the coast and the districts', 'Thaton, Hpa-an, Ye and the coastal towns get identical live teaching.'],
    ],
    growingReason: 'Mawlamyine sits at the mouth of the Thanlwin river with a long trading and maritime tradition, at the centre of a regional economy built on rubber, agriculture and fisheries through Mon State and the coast beyond — with no international school provision and Yangon three hundred kilometres north-west. Myanmar runs MMT (UTC+6:30), three and a half hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the south, taught alongside a Myanmar school enrolment. Examination travel planned per session well ahead.',
      cbc: 'Kenya CBC available for southern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the south: education is administered by the Ministry of Education, basic education is compulsory at the primary level, and private schools operate with ministry registration. We could not verify Myanmar\'s position on parental home education against a primary instrument and will not guess in either direction — confirm with the Ministry of Education directly, noting that an absence of clear regulation is an absence of protection rather than a permission. Smartious is not a registered Myanmar school, issues no Myanmar qualification and does not teach toward the matriculation examination.',
    homeTuitionDetail: 'Smartious delivers to southern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school and evening blocks, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in the south?', a: 'None. Yangon is around three hundred kilometres north-west. Live delivery reaches Mawlamyine, Hpa-an, Thaton and the coastal districts identically.' },
      { q: 'What time would classes be?', a: 'After-school or evening. Myanmar is three and a half hours ahead of our teaching base, so those hours land squarely in our teaching day.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const MYANMAR_COUNTRY = {
  slug: 'myanmar',
  name: 'Myanmar',
  longName: 'Republic of the Union of Myanmar',
  adjective: 'Myanmar',
  flag: '🇲🇲',
  hub: '/online-school/myanmar',
  hubPageId: 'homeschooling-myanmar',
  cityPageId: 'myanmar-city',

  currency: 'MMK',
  currencyName: 'Myanmar Kyat',
  currencyPeg: 'Fees are quoted and invoiced in USD, which is used in Myanmar for larger commitments — so a multi-year education decision is a single figure to plan around.',

  timezone: {
    code: 'MMT',
    name: 'Myanmar Time (UTC+6:30), with no seasonal clock changes',
    utcOffset: '+6:30',
    offsetFromEAT: 'Three and a half hours ahead of our teaching base — so after-school and evening classes in Myanmar land in the middle of our teaching day',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Yangon holds the country\'s deepest capacity through its international school sector'],
  examCentreTiles: [
    { city: 'Yangon', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Mandalay', centre: 'Planned per session', area: 'Central-region families plan travel into each window ahead.' },
    { city: 'The regions', centre: 'Planned well ahead', area: 'Naypyidaw, Taunggyi and southern families plan arrangements several weeks in advance.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Myanmar-based students sit as external candidates at authorised provision, and this is a market where we plan the examination question earlier than most. Yangon holds the deepest capacity through its international school sector and is checked first, with Mandalay for central-region families and arrangements planned several weeks ahead for Naypyidaw, Taunggyi and the south — the country is large and journeys are long, so lead time matters. Where a domestic sitting is not practical for a particular series, we discuss alternatives with the family in good time rather than at the entry deadline. Note what does not change: our arrangement runs alongside a Myanmar school, which continues its own national track unchanged. Smartious is not a registered Myanmar school, issues no Myanmar qualification, and does not teach toward the matriculation examination.',
  secondaryProgrammeExamRef: 'Authorised Cambridge provision, planned per family',
  finalCTABadgeExamRef: 'Examination arrangements planned individually, well ahead',

  heroImage: '/heroes/myanmar.jpg',
  heroEyebrow: 'Online school for Myanmar',
  heroH1Suffix: 'Myanmar',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for professional, academic, agricultural and Myanmar families across Yangon, Mandalay, Naypyidaw, Taunggyi and Mawlamyine. Myanmar sits three and a half hours ahead of our teaching base, which means after-school and evening classes land squarely in the middle of our day — one of the better fits in our coverage.',
  heroValueProp: 'From USD 180/month, quoted in USD. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — after-school and evening, alongside your school.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Myanmar',

  citiesSectionTitle: 'Where our Myanmar families are',
  citiesSectionBody: 'Smartious Myanmar families concentrate across Yangon (the commercial capital and the country\'s deepest international school provision), Mandalay (the second city and its trading, crafts and agricultural economy, six hundred kilometres north), Naypyidaw (the administrative capital, with very limited provision and widely dispersed districts), Taunggyi and the Shan highlands (tea, coffee and horticulture at altitude with no international schooling at all), and Mawlamyine and the south (a river-mouth port with rubber, agriculture and fisheries through Mon State). One honest legal hedge, and a timezone that makes after-school teaching straightforward.',

  trustSignals: [
    { h: 'After-school hours that actually work', p: 'Myanmar runs UTC+6:30, three and a half hours ahead of our teaching base. A four o\'clock class in Yangon is half past twelve for our teachers and a six o\'clock class is half past two. An after-school arrangement fails in most of our Latin American markets and works cleanly here.' },
    { h: 'Cambridge is already familiar', p: 'Myanmar private schools have offered IGCSE and A-Level for many years, so families here understand where an internationally examined track sits beside the national record. That makes the conversation shorter than in most markets.' },
    { h: 'Honest about what we could not verify', p: 'We could not establish Myanmar\'s position on parental home education from a primary instrument. Rather than guessing in either direction, we say so, note that an absence of clear regulation is not a permission, and send families to the Ministry of Education.' },
    { h: 'Examinations planned early, not assumed', p: 'The country is large and journeys are long, so we raise the examination question at enrolment rather than in the term before a series, and plan travel into each window well ahead.' },
  ],

  universitiesInCountry: 'the University of Yangon, the University of Mandalay, Yangon Technological University, the University of Medicine Yangon and the regional universities — a higher-education tradition with a long history in the region.',
  universityChannels: 'Myanmar universities admit on the matriculation examination through their own processes, with international qualifications entering through recognition procedures confirmed per institution — a family intending to enter the Myanmar system should confirm that route early, and note that the domestic side of a student\'s record has to come from a Myanmar school rather than from us. Outward, Myanmar students apply in numbers to Singapore, Thailand, Malaysia, Australia, the United Kingdom, the United States and Japan: UCAS reads Cambridge A-Levels natively, Australian, Singaporean and Malaysian universities read A-Levels and the IB directly and are among the most familiar destinations from this country, and American and Canadian institutions read A-Levels, the IB and AP records without conversion. A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across Singaporean, Australian, Thai, Malaysian, UK (UCAS), US and Myanmar destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Myanmar families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes in after-school and evening blocks — Myanmar runs three and a half hours ahead of our teaching base, so those hours sit in the middle of our day — run alongside a Myanmar school enrolment that continues its own national track unchanged. Cambridge Chinese and home language support available beside the English-medium core. Every session recorded. Fees quoted in USD.',
  britishCurriculumSuits: 'Myanmar families targeting the Cambridge pathway. Best fit for: (1) Taunggyi, Mawlamyine and Naypyidaw families where provision is minimal or absent, (2) Mandalay households six hundred kilometres from the tier, (3) Yangon families outside the international tier\'s fees, (4) students already following IGCSE at a Myanmar private school who need additional subjects, (5) students heading for Singaporean, Australian or UK universities.',
  britishCurriculumDelivery: 'Live online classes in after-school and evening blocks, small groups 4-6 students, every session recorded, alongside a Myanmar school enrolment.',
  ibDiplomaSuits: 'Myanmar families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Myanmar families targeting American universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Myanmar has a deep scholarly tradition and universities with long histories, and it sits three and a half hours ahead of us — which makes after-school teaching straightforward here in a way it is not across much of our coverage.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the highlands\' agricultural science households and every medicine-bound student in Yangon and Mandalay. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Yangon holds the deepest international school provision in Myanmar — the International School Yangon, Dulwich College Yangon, the International School of Myanmar, Yangon Academy and others — with IGCSE, A-Level and IB provision and fees at international levels. Alongside them sits a substantial Myanmar private school sector that has offered IGCSE and A-Level for many years, which means Cambridge is well understood here. Outside Yangon the picture thins sharply: Mandalay has a fraction of it despite being the second city, Naypyidaw very little, and Taunggyi and the southern regions essentially none.',
  competitors: [
    { name: 'International School Yangon, Dulwich College Yangon',  city: 'Yangon',            curriculum: 'IB, British and American',              feesUsd: 'International tier',                                feesAed: 'Competitive places',      rating: 4.7, capacityNote: 'The country\'s deepest provision — concentrated in one city and priced internationally' },
    { name: 'The International School of Myanmar and Yangon Academy', city: 'Yangon',          curriculum: 'American and international',            feesUsd: 'International tier',                                feesAed: 'Varies',                  rating: 4.4, capacityNote: 'Established options, all within the commercial capital' },
    { name: 'Myanmar private schools offering IGCSE',              city: 'Yangon and Mandalay', curriculum: 'National plus IGCSE and A-Level',      feesUsd: 'Mid tier',                                          feesAed: 'Widespread',              rating: 4.2, capacityNote: 'The model most families know — and the reason Cambridge is already familiar here. Specialist A-Level sets still rarely run for small cohorts' },
    { name: 'Mandalay and Naypyidaw',                              city: 'Central Myanmar',    curriculum: 'Thin to very limited',                  feesUsd: 'Limited international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'A second city and an administrative capital, both far thinner than their populations suggest' },
    { name: 'The Shan highlands and the south',                    city: 'Regional Myanmar',   curriculum: '—',                                     feesUsd: 'No international provision',                        feesAed: '—',                       rating: 0,   capacityNote: 'A productive highland agricultural economy and a southern port region, neither with international schooling' },
    { name: 'Private tuition',                                     city: 'Nationwide',         curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Widespread',              rating: 4.0, capacityNote: 'The default answer to a subject gap — usually one-to-one and unstructured across a year' },
    { name: 'Smartious Homeschool (Myanmar via online delivery)',   city: 'Delivered nationwide', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year',                              feesAed: 'Quoted in USD',            rating: 4.8, capacityNote: 'Every class live through A-Level + after-school hours that genuinely work + Mandalay, the highlands and the south reached + examinations planned early' },
  ],

  legalFrameworkIntro: 'Myanmar is one of the markets where we could not verify the central question, and we would rather open by saying so than write around it. Here is what we can establish, and the practical facts that shape our offer here.',
  legalFramework: [
    { h: 'What we can establish', p: 'Education in Myanmar is administered by the Ministry of Education. Basic education is compulsory at the primary level, and families should confirm the current age boundaries with the Ministry rather than take them from any article. Private schools operate with ministry registration, and Smartious does not hold it: we do not operate premises in Myanmar, we claim no Myanmar recognition, and the qualifications we deliver carry Cambridge, Pearson Edexcel, IB or AP validity rather than a domestic one.' },
    { h: 'What we could not establish', p: 'Myanmar\'s position on parental home education. We could not verify it against a primary instrument and are not going to fill that gap with confident prose. We will not tell you it is permitted and we will not tell you it is prohibited; both would exceed what we can evidence. What we would add is the point we make in Jordan, Iraq, Lebanon, Panama and Guatemala: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to the Ministry of Education directly.' },
    { h: 'The matriculation examination, and where our track sits', p: 'The national qualification is commonly referred to as the matriculation examination, and we do not teach toward it. That distinction is less confusing in Myanmar than in many markets: private schools here have offered IGCSE and A-Level alongside the national route for many years, so a great many families have direct experience of a child following an international programme in parallel. Ours sits in exactly that category — an internationally examined track beside the Myanmar record rather than instead of it. Myanmar universities admit on the matriculation examination with international qualifications entering through recognition procedures, so confirm that route early if a Myanmar university is the plan.' },
    { h: 'What we therefore build', p: 'Live Cambridge or IB teaching alongside a Myanmar school enrolment. The school carries the compulsory-education duty, the national curriculum and the domestic record; we teach the internationally examined track alongside it. Nothing in that arrangement depends on the unresolved question, which is exactly why it is the arrangement we build.' },
    { h: 'The clock, which works unusually well here', p: 'Myanmar runs Myanmar Time at UTC+6:30 with no seasonal clock changes — the only half-hour offset in our entire coverage — and our teaching base runs UTC+3 year-round. Myanmar is therefore three and a half hours ahead of us, and crucially in the favourable direction: a four o\'clock class in Yangon is half past twelve for our teachers, a six o\'clock class is half past two, and an eight o\'clock evening class is half past four. Every one of those is an ordinary teaching hour for us. Across much of our Latin American coverage an after-school arrangement is impossible and we say so plainly; in Myanmar it is the natural configuration. Families whose child is at school in the morning and free from mid-afternoon have the easiest scheduling relationship we can offer.' },
    { h: 'Examinations, planned earlier than usual', p: 'One practical commitment specific to this market. Myanmar is a large country and journeys between regions are long, so we raise the examination question at enrolment rather than in the term before a series. Yangon holds the deepest capacity and is checked first, Mandalay serves central-region families, and arrangements for Naypyidaw, Taunggyi and the south are planned several weeks ahead of each window. Where a domestic sitting is not practical for a particular series, we discuss alternatives in good time rather than at the entry deadline. Every class is also recorded, so a session that cannot be attended is never a session lost.' },
  ],

  whySmartious: [
    { h: 'After-school teaching that genuinely works',                    p: 'Three and a half hours ahead means Myanmar\'s after-school and evening hours land in the middle of our teaching day — the natural configuration here, unlike much of our coverage.' },
    { h: 'Cambridge already familiar',                                    p: 'Myanmar private schools have offered IGCSE and A-Level for many years, so the parallel-track idea needs less explaining here than almost anywhere.' },
    { h: 'Mandalay, the highlands and the south reached',                 p: 'A second city, a productive highland agricultural region and a southern port economy, none with matching international provision.' },
    { h: 'Examinations planned at enrolment',                             p: 'A large country with long journeys means lead time matters. We raise it early and plan travel into each window.' },
    { h: 'Honest about the question we could not verify',                 p: 'We could not establish Myanmar\'s home-education position and say so rather than guessing in either direction.' },
    { h: 'Every session recorded',                                        p: 'A class that cannot be attended is never a class lost — pacing adjusted per student rather than assumed.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Myanmar?', a: 'We could not verify a position from a primary instrument and will not guess. Basic education is compulsory at the primary level and administered by the Ministry of Education. An absence of clear regulation is not a permission — put the question to the Ministry directly. Structured study alongside a school enrolment raises none of it.' },
    { q: 'Do you teach the matriculation examination?', a: 'No. We are not a registered Myanmar school and issue no Myanmar qualification. We teach Cambridge, Edexcel, IB and AP examinations, which sit alongside the national record — a familiar arrangement here, since private schools have offered IGCSE and A-Level for many years.' },
    { q: 'What time are classes?', a: 'After-school and evening work particularly well. Myanmar runs three and a half hours ahead of our teaching base, so a four o\'clock class in Yangon is half past twelve for our teachers, six o\'clock is half past two, and eight o\'clock is half past four.' },
    { q: 'Our school already offers IGCSE — what would we gain?', a: 'Usually a subject it cannot staff for a small cohort — Further Mathematics, a third science, or a clashing set. If your school covers what your child needs, we will tell you so.' },
    { q: 'Where would our child sit examinations?', a: 'We plan this at enrolment. Yangon holds the deepest capacity and is checked first, Mandalay serves central-region families, and arrangements for Naypyidaw, Taunggyi and the south are planned several weeks ahead of each window.' },
    { q: 'Where do Myanmar students usually apply abroad?', a: 'Singapore, Thailand, Malaysia, Australia, the United Kingdom, the United States and Japan are all common. UCAS reads A-Levels natively, and Australian, Singaporean and Malaysian universities read A-Levels and the IB directly — they are among the most familiar destinations from this country.' },
    { q: 'How are fees handled?', a: 'Quoted and invoiced in USD, which is used here for larger commitments — USD 2,160-6,480 a year for live small-group teaching.' },
    { q: 'Which parts of Myanmar does Smartious cover?', a: 'Yangon, Mandalay, Naypyidaw, Taunggyi and the Shan highlands, and Mawlamyine and the south have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us where in Myanmar you are and what time your child finishes school: after-school hours land squarely in our teaching day here, and knowing them lets us build the timetable properly from the start.',
}
