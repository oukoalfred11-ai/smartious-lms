// ═══════════════════════════════════════════════════════════════════
// LEBANON — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for professional, academic, diaspora-connected and
// Lebanese families across Beirut, Tripoli, Saida, Zahle and Jounieh.
// FIFTH MIDDLE EAST BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// *** TONE RULE — ABSOLUTE ***
// NO political commentary of any kind. NO commentary on economic or
// banking conditions, on any government, party, event or period. NO
// use of the words crisis, collapse, instability, recovery or
// rebuild. We are a school.
// - Lebanon has one of the strongest educational traditions in the
//   region and its universities are among the best known in the
//   Arab world. SAY SO. The framing is depth, continuity and
//   portability — never rescue.
// - Where fees or currency are mentioned, state only the neutral
//   operational fact: we quote in USD, which is widely used here for
//   larger commitments. Nothing further.
// - Where continuity of schooling is mentioned, one neutral sentence
//   about recorded lessons, no cause attributed. If in doubt, cut it.
//
// LEGAL POSITIONING NOTE — HEDGE FIRMLY, SOURCING IS THIN:
// - We could NOT verify Lebanon's position on parental home
//   education against a primary instrument.
// - What we can state: education is administered by the MINISTRY OF
//   EDUCATION AND HIGHER EDUCATION (MEHE); education is compulsory;
//   private schools operate under MEHE licensing and supervision.
// - State the compulsory range GENERALLY. Do not quote ages we have
//   not verified. Route families to MEHE.
// - PHRASE EVERY TIME: "we could not verify", "we are not aware of a
//   specific framework", plus "confirm with MEHE". NEVER assert
//   permitted, NEVER assert prohibited.
// - Reuse the absence-of-regulation-is-not-permission argument.
// - Smartious is NOT a MEHE-licensed school; say so.
// - The national qualification is the LEBANESE BACCALAUREATE. We do
//   NOT teach toward it and say so. Note that Lebanon's private
//   sector already runs French Baccalauréat, IB and American
//   programmes alongside the national one, so families here
//   understand parallel tracks better than in most markets.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT.
//
// TIMEZONE: Lebanon runs EET (UTC+2), moving to EEST (UTC+3) for the
// summer. Our teaching base runs UTC+3 year-round. So Lebanon is ONE
// HOUR BEHIND us in winter and EXACTLY LEVEL in summer — the same
// relationship as Cyprus and Israel, and among the closest in our
// coverage. Effectively the whole teaching day is available.
//
// MARKET NOTE: Lebanon has one of the highest private-school
// participation rates anywhere in our coverage, and an unusually
// plural one — the French system dominates (Grand Lycée Franco-
// Libanais, Collège Notre-Dame de Jamhour, Collège Protestant),
// alongside American-system schools (International College, the
// American Community School), IB schools and the national programme.
// Universities: the American University of Beirut and the Lebanese
// American University are English-medium and among the best known
// in the Arab world; Université Saint-Joseph is francophone; the
// Lebanese University is the national institution; Balamand and NDU
// alongside. Lebanon also has one of the largest and most
// professionally established diasporas in the world — West Africa,
// the Gulf, France, Brazil, the United States, Canada and Australia
// — which makes a portable qualification unusually valuable here.
// ═══════════════════════════════════════════════════════════════════

export const LEBANON_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'beirut-lb',
    name: 'Beirut',
    county: 'Beirut and the coastal suburbs',
    region: 'The capital and academic centre · the American University of Beirut and the Lebanese American University · one of the most plural private school markets in the region · a professional community with family across four continents',
    primaryKeyword: 'Online school and international curriculum in Beirut',
    heroTagline: 'For Beirut families — a record read directly in every country your family already has ties to, taught at whatever hour suits.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Beirut families. The capital holds one of the region\'s great academic traditions — the American University of Beirut and the Lebanese American University teach in English and are among the best known institutions in the Arab world — alongside an unusually plural private school market running French, American, IB and national programmes side by side. Beirut families understand parallel academic tracks better than almost any market we serve. What we add is one more that travels: an internationally examined record read directly wherever a family\'s relatives already are.',
    heroImg: '/heroes/beirut-lb.jpg',
    altTexts: { hero: 'Beirut and the Mediterranean' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Beirut families — a portable record, fees in USD, at whatever hour suits. From USD 400/month.',
    challenges: [
      'Families frequently have members across several countries, and a record needs to read in all of them.',
      'Private school places in the strongest institutions are competitive.',
      'Education is compulsory and administered by MEHE.',
      'We could not verify Lebanon\'s position on parental home education from a primary instrument.',
      'Time zone: Lebanon runs EET (UTC+2) moving to EEST (UTC+3) in summer — one hour behind us in winter, level in summer.',
    ],
    familySituations: [
      'Professional and academic families with relatives abroad.',
      'Households planning for children to study at AUB, LAU or abroad.',
      'Families in the French-system sector adding an English-medium examined track.',
      'Students needing a subject their school cannot staff for a small group.',
      'Diaspora-connected families who may relocate or return.',
      'Households arriving mid-curriculum from another country\'s system.',
    ],
    nearbyAreas: ['Achrafieh', 'Hamra', 'Verdun', 'Baabda', 'Hazmieh', 'Antelias', 'Dbayeh'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Canadian, Gulf and Lebanese university applications',
    ],
    whyChoose: [
      ['A record read wherever your family is', 'Lebanese families have ties across West Africa, the Gulf, France, Brazil, North America and Australia. Cambridge A-Levels and the IB are read directly in all of them rather than converted country by country.'],
      ['English-medium preparation for English-medium universities', 'AUB and LAU teach in English. An externally examined English-medium school record demonstrates years of academic work in the language of instruction, not only a test score.'],
      ['French kept as an examined subject', 'For families in the francophone sector, Cambridge French runs alongside the English-medium core rather than being traded away.'],
      ['Almost no timezone at all', 'One hour behind us in winter and exactly level in summer — after-school, mid-morning and evening slots all work.'],
      ['Honest about the legal gap', 'We could not verify Lebanon\'s home-education position and say so rather than guessing in either direction.'],
    ],
    growingReason: 'Beirut holds one of the region\'s great academic traditions — AUB and LAU teaching in English among the best known institutions in the Arab world — alongside an unusually plural private school market running French, American, IB and national programmes side by side. Lebanon runs EET (UTC+2), moving to EEST (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Beirut families, taught alongside a Lebanese school enrolment at whatever hour suits. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Beirut families with East African ties — a common profile given long-standing Lebanese communities across the continent.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the city\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities or American-system institutions closer to home.',
    },
    homeschoolDetail: 'Lebanese education is administered by the Ministry of Education and Higher Education, education is compulsory, and private schools operate under MEHE licensing and supervision — families should confirm the current age boundaries with the ministry rather than take them from a provider. On parental home education we could not verify Lebanon\'s position against a primary instrument, and we are not going to guess. We will not tell you it is permitted and we will not tell you it is prohibited; both would exceed what we can evidence. What we would add is the point we make in Jordan, Iraq and elsewhere: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to MEHE directly and keep the answer. Two further clarifications. The national qualification is the Lebanese Baccalaureate and we do not teach toward it; Smartious is not a MEHE-licensed school and issues no Lebanese qualification. And this is less confusing here than in most markets, because Lebanon\'s private sector already runs the French Baccalauréat, the IB and American programmes alongside the national one — parallel academic tracks are the norm rather than the exception, and ours sits in that same category.',
    homeTuitionDetail: 'Smartious delivers to Beirut families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Lebanon runs one hour behind our teaching base in winter and exactly level in summer, so effectively our whole teaching day is available — and every session is recorded, so a class that cannot be attended is never a class lost.',
    faqs: [
      { q: 'Is homeschooling legal in Lebanon?', a: 'We could not verify a position from a primary instrument and will not guess. Education is compulsory and administered by MEHE, and private schools operate under ministry licensing. An absence of clear regulation is not a permission — put the question to MEHE directly. Structured study alongside a school enrolment raises none of it.' },
      { q: 'Do you teach the Lebanese Baccalaureate?', a: 'No. We are not a MEHE-licensed school and issue no Lebanese qualification. We teach Cambridge, Pearson Edexcel, IB and AP examinations, which sit alongside the Lebanese record — a familiar arrangement here, since the private sector already runs French, IB and American programmes in parallel.' },
      { q: 'Our family has relatives in several countries — which qualification travels?', a: 'Cambridge A-Levels and the IB Diploma, with AP for US-focused applications. All are read directly in France, the Gulf, North America, Brazil, Australia and the UK, whereas a national record is assessed through different procedures in each.' },
      { q: 'What are the class times?', a: 'Effectively any hour of our teaching day — Lebanon is one hour behind us in winter and exactly level in summer.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'tripoli-lb',
    name: 'Tripoli & the North',
    county: 'North Governorate',
    region: 'The second city and the northern commercial centre · the port and its trading tradition · the University of Balamand nearby · a substantial population with thin international school provision',
    primaryKeyword: 'Online school and international curriculum in Tripoli Lebanon',
    heroTagline: 'For Tripoli and northern families — the second city, an hour and a half from where the international schools are.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Tripoli and northern Lebanese families. The north holds the country\'s second city, its port and a long commercial and trading tradition, with the University of Balamand and the Koura district nearby. It is a substantial population, and international school provision here is thin relative to it — the concentration is in Beirut, an hour and a half south along the coast. Live delivery reaches the north identically, and Lebanon sits within an hour of our teaching clock all year.',
    heroImg: '/heroes/tripoli-lb.jpg',
    altTexts: { hero: 'Tripoli and the northern Lebanese coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Tripoli and northern Lebanon families — thin provision outside Beirut. From USD 400/month.',
    challenges: [
      'International school provision is thin relative to the size of the population.',
      'Beirut is an hour and a half south along the coast.',
      'Families with relatives abroad needing a portable record.',
      'We could not verify Lebanon\'s position on parental home education.',
      'Time zone: one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'Commercial, trading and port-sector families.',
      'University academic and professional households.',
      'Families with relatives across the Gulf, West Africa and North America.',
      'Students aiming at AUB, LAU, Balamand or universities abroad.',
      'Households that would otherwise consider relocating to Beirut for schooling.',
    ],
    nearbyAreas: ['Tripoli', 'El Mina', 'Koura', 'Zgharta', 'Batroun', 'Chekka', 'Bcharre'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic, French and home language support',
      'Cambridge A-Level Mathematics, Biology, Chemistry, Physics, Economics',
      'Cambridge A-Level Business, Computer Science, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Gulf, Canadian and Lebanese university applications',
    ],
    whyChoose: [
      ['The complete option outside the capital', 'Identical live delivery in Tripoli and Beirut — no relocation and no daily coastal commute.'],
      ['Business and economics for a trading city', 'Cambridge A-Level Economics, Business, Accounting and Mathematics suit families who have run northern commerce for generations.'],
      ['A record read wherever your family is', 'Read directly in the Gulf, West Africa, France, North America and the UK.'],
      ['Almost no timezone at all', 'One hour behind in winter, level in summer.'],
      ['French and Arabic kept as examined subjects', 'Both run alongside the English-medium core.'],
    ],
    growingReason: 'Tripoli holds Lebanon\'s second city, its port and a long commercial and trading tradition, with the University of Balamand and the Koura district nearby — and international school provision thin relative to the population, concentrated instead in Beirut. Lebanon runs EET (UTC+2), moving to EEST (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the north, taught alongside a Lebanese school enrolment.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the north: education is compulsory and administered by MEHE, private schools operate under ministry licensing, and we could not verify Lebanon\'s position on parental home education against a primary instrument — a silence we decline to read in either direction. Confirm with MEHE directly. Smartious is not a MEHE-licensed school, issues no Lebanese qualification and does not teach toward the Lebanese Baccalaureate. Our arrangement is live international teaching alongside a Lebanese school enrolment.',
    homeTuitionDetail: 'Smartious delivers to northern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, effectively across our whole teaching day given the near-zero offset, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Tripoli?', a: 'Thin relative to the size of the population, with the concentration in Beirut an hour and a half south. Live delivery reaches the whole north identically.' },
      { q: 'Our child is aiming at AUB or LAU — does an international record help?', a: 'Both teach in English, and an externally examined English-medium school record demonstrates sustained academic work in the language of instruction rather than only a test score.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'saida-lb',
    name: 'Saida & the South',
    county: 'South Governorate',
    region: 'The southern coastal city and its port · citrus and agricultural hinterland · a strong commercial tradition and deep diaspora links · limited international school provision',
    primaryKeyword: 'Online school and international curriculum in Saida',
    heroTagline: 'For Saida and southern families — deep diaspora links, and a qualification that reads in every country they lead to.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Saida and southern Lebanese families. The south carries the coastal city and its port, a citrus and agricultural hinterland, and a commercial tradition with some of the deepest diaspora links in the country — families with relatives established in West Africa, the Gulf, Brazil, North America and Australia, often across several generations. International school provision locally is limited, and the qualification question here is genuinely practical: a record has to work wherever a child ends up applying from.',
    heroImg: '/heroes/saida-lb.jpg',
    altTexts: { hero: 'Saida and the southern Lebanese coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Saida and southern Lebanon families — deep diaspora links, portable qualifications. From USD 400/month.',
    challenges: [
      'Limited international school provision in the south.',
      'Beirut is around forty minutes north but its tier is priced for a different market.',
      'Families with relatives established across four continents.',
      'We could not verify Lebanon\'s position on parental home education.',
      'Time zone: one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'Commercial, trading and port-sector families.',
      'Citrus, agricultural and agro-business households.',
      'Families with established relatives in West Africa, the Gulf, Brazil and North America.',
      'Students who may study or work abroad.',
      'Households outside the Beirut tier\'s fees.',
    ],
    nearbyAreas: ['Saida', 'Ghazieh', 'Jezzine', 'Tyre', 'Nabatieh', 'Zahrani', 'the southern coast'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic, French and home language support',
      'Cambridge A-Level Mathematics, Biology, Chemistry, Economics, Business',
      'Cambridge A-Level Physics, Geography, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Brazilian, Gulf, West African and Lebanese university applications',
    ],
    whyChoose: [
      ['One record for a family spread across continents', 'Read directly in West Africa, the Gulf, Brazil, France, North America and the UK rather than converted separately in each.'],
      ['Kenya CBC available, which matters here', 'Lebanese communities are long established across West and East Africa, and CBC continuity is a real option rather than a token one.'],
      ['The complete option in a region with little', 'Identical live delivery in Saida and Beirut, without relocating or paying capital fees.'],
      ['Almost no timezone at all', 'One hour behind in winter, level in summer.'],
      ['Arabic and French kept as examined subjects', 'Both run alongside the English-medium core.'],
    ],
    growingReason: 'Saida carries the southern coastal city and its port, a citrus and agricultural hinterland, and a commercial tradition with some of the deepest diaspora links in Lebanon — with limited international school provision locally. Lebanon runs EET (UTC+2), moving to EEST (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the south, taught alongside a Lebanese school enrolment.',
      cbc: 'Kenya CBC available for southern families with East African ties — a genuinely used option given long-standing Lebanese communities across Africa.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the south: education is compulsory and administered by MEHE, private schools operate under ministry licensing, and we could not verify Lebanon\'s position on parental home education against a primary instrument. We decline to characterise it in either direction and would send families to MEHE. Smartious is not a MEHE-licensed school, issues no Lebanese qualification and does not teach toward the Lebanese Baccalaureate. Families resident abroad rather than in Lebanon follow their country of residence\'s framework, which given the depth of southern diaspora ties is a question that arises often and belongs with their own advisers.',
    homeTuitionDetail: 'Smartious delivers to southern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, effectively across our whole teaching day given the near-zero offset, with every session recorded.',
    faqs: [
      { q: 'Our family has relatives in West Africa and Brazil — which qualification works everywhere?', a: 'Cambridge A-Levels and the IB are read directly in all of those, whereas a national record is assessed through different recognition procedures in each country. For a family with ties this wide, that is the practical argument.' },
      { q: 'Is there international schooling in the south?', a: 'Limited. Beirut is around forty minutes north but its tier is priced for a different market. Live delivery reaches the south identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'zahle-lb',
    name: 'Zahle & the Bekaa',
    county: 'Bekaa and Baalbek-Hermel',
    region: 'The agricultural heartland — vineyards, wine production and intensive farming · food processing and agro-industry · a valley of dispersed towns · almost no international school provision',
    primaryKeyword: 'Online school and international curriculum in Zahle and the Bekaa',
    heroTagline: 'For Zahle and Bekaa families — Lebanon\'s wine and farming valley, an hour over the mountain from any international school.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Zahle and Bekaa families. The valley is Lebanon\'s agricultural heartland — vineyards and a wine industry with an international reputation, intensive farming, food processing and agro-industry — spread across towns from Zahle north through Baalbek and south toward the Litani. It is a substantial economy with almost no international school provision, and Beirut is an hour over the mountain. Live delivery reaches the whole valley, and Lebanon sits within an hour of our teaching clock all year.',
    heroImg: '/heroes/zahle-lb.jpg',
    altTexts: { hero: 'The Bekaa valley' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Zahle and Bekaa families — wine and farming valley, no local provision. From USD 400/month.',
    challenges: [
      'Almost no international school provision across the valley.',
      'Beirut is an hour over the mountain, and its tier is priced for a different market.',
      'Families spread across towns from Zahle to Baalbek rather than clustered.',
      'We could not verify Lebanon\'s position on parental home education.',
      'Time zone: one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'Vineyard, wine production and viticulture families.',
      'Intensive farming, food processing and agro-industry households.',
      'Commercial and professional families across the valley towns.',
      'Students aiming at agronomy, food science or oenology.',
      'Families who would otherwise consider relocating for schooling.',
    ],
    nearbyAreas: ['Zahle', 'Chtaura', 'Baalbek', 'Rayak', 'Kefraya', 'Anjar', 'the Bekaa towns'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic, French and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Geography, Physics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Chemistry, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Gulf, Canadian and Lebanese university applications',
    ],
    whyChoose: [
      ['Biology and chemistry for a wine and farming valley', 'Cambridge A-Level Biology and Chemistry feed agronomy, food science and oenology directly — the disciplines this valley\'s own economy runs on.'],
      ['Reaches the whole valley', 'Zahle, Chtaura, Baalbek and the surrounding towns get identical live teaching without a mountain crossing.'],
      ['French kept as an examined subject', 'Cambridge French alongside the English-medium core, which suits both the local francophone tradition and French university routes.'],
      ['Almost no timezone at all', 'One hour behind in winter, level in summer.'],
      ['Honest about the legal gap', 'We could not verify Lebanon\'s home-education position and say so.'],
    ],
    growingReason: 'The Bekaa is Lebanon\'s agricultural heartland — vineyards and a wine industry with an international reputation, intensive farming, food processing and agro-industry — spread across towns from Zahle to Baalbek, with almost no international school provision and Beirut an hour over the mountain. Lebanon runs EET (UTC+2), moving to EEST (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the valley, taught alongside a Lebanese school enrolment.',
      cbc: 'Kenya CBC available for Bekaa families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the Bekaa: education is compulsory and administered by MEHE, private schools operate under ministry licensing, and we could not verify Lebanon\'s position on parental home education against a primary instrument. We decline to read that silence in either direction — confirm with MEHE. Smartious is not a MEHE-licensed school, issues no Lebanese qualification and does not teach toward the Lebanese Baccalaureate. Our arrangement is live international teaching alongside a Lebanese school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Bekaa families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, effectively across our whole teaching day given the near-zero offset, with every session recorded — which suits agricultural seasons.',
    faqs: [
      { q: 'Our child wants oenology or agronomy — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Mathematics or Geography, planned backward from the target university from IGCSE onward. Both are the standard entry route into those disciplines.' },
      { q: 'Is there international schooling in the Bekaa?', a: 'Almost none. Beirut is an hour over the mountain. Live delivery reaches Zahle, Chtaura, Baalbek and the valley towns identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'jounieh-lb',
    name: 'Jounieh & Mount Lebanon',
    county: 'Mount Lebanon',
    region: 'The coastal and mountain belt north of the capital · a dense residential and commercial corridor · several long-established schools and universities nearby · families commuting to Beirut daily',
    primaryKeyword: 'Online school and international curriculum in Jounieh',
    heroTagline: 'For Jounieh, Keserwan and Mount Lebanon families — commuting to Beirut for work without commuting the children too.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Jounieh and Mount Lebanon families. The coastal and mountain belt running north from the capital through Jounieh, Keserwan and the surrounding villages is one of the densest residential and commercial corridors in the country, with several long-established schools and universities in reach and a great many households commuting into Beirut daily. For families already making that journey, the question is usually whether the children need to make it too. Live delivery answers that, and Lebanon sits within an hour of our teaching clock.',
    heroImg: '/heroes/jounieh-lb.jpg',
    altTexts: { hero: 'Jounieh bay and Mount Lebanon' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Jounieh, Keserwan and Mount Lebanon families — no second commute for the children. From USD 400/month.',
    challenges: [
      'Households already commuting to Beirut daily for work.',
      'Mountain villages spread well above the coastal corridor.',
      'Competitive places at the strongest schools in the belt.',
      'We could not verify Lebanon\'s position on parental home education.',
      'Time zone: one hour behind us in winter and exactly level in summer.',
    ],
    familySituations: [
      'Professional households commuting into Beirut.',
      'Commercial, hospitality and services business families along the coast.',
      'Families in the mountain villages above the corridor.',
      'Students needing a subject their school cannot staff for a small group.',
      'Households with relatives abroad who may relocate.',
    ],
    nearbyAreas: ['Jounieh', 'Kaslik', 'Zouk', 'Jbeil (Byblos)', 'Broummana', 'Bikfaya', 'the Keserwan villages'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Psychology',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Gulf, Canadian and Lebanese university applications',
    ],
    whyChoose: [
      ['No second commute', 'Families already driving into Beirut rarely want to add a school run in the other direction. Live delivery removes it for the child entirely.'],
      ['Reaches the mountain villages', 'Broummana, Bikfaya and the Keserwan villages get identical live teaching without descending to the coast.'],
      ['The set your school cannot staff', 'Further Mathematics or a third science for four pupils is unviable on one timetable and routine in a live group drawn from several countries.'],
      ['Almost no timezone at all', 'One hour behind in winter, level in summer.'],
      ['French kept as an examined subject', 'Cambridge French alongside the English-medium core, which suits this belt\'s strong francophone tradition.'],
    ],
    growingReason: 'The coastal and mountain belt north of Beirut through Jounieh and Keserwan is one of the densest residential and commercial corridors in Lebanon, with several long-established schools and universities in reach and a great many households commuting into the capital daily. Lebanon runs EET (UTC+2), moving to EEST (UTC+3) in summer.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Mount Lebanon, taught alongside a Lebanese school enrolment.',
      cbc: 'Kenya CBC available for Mount Lebanon families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Mount Lebanon: education is compulsory and administered by MEHE, private schools operate under ministry licensing, and we could not verify Lebanon\'s position on parental home education against a primary instrument. Confirm with MEHE directly. Smartious is not a MEHE-licensed school, issues no Lebanese qualification and does not teach toward the Lebanese Baccalaureate. Our arrangement is live international teaching alongside a Lebanese school enrolment — which in this belt is frequently a supplementary subject or two rather than a full programme, and we would rather build what a family actually needs.',
    homeTuitionDetail: 'Smartious delivers to Mount Lebanon families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, effectively across our whole teaching day given the near-zero offset, with every session recorded.',
    faqs: [
      { q: 'We commute to Beirut for work — does that shape the decision?', a: 'It usually does. Families already making that journey rarely want to add a school run, and live delivery removes it for the child while keeping an internationally examined track.' },
      { q: 'We live in a mountain village — does that work?', a: 'Identically. Broummana, Bikfaya and the Keserwan villages get the same live teaching, with examination travel a few times a year.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const LEBANON_COUNTRY = {
  slug: 'lebanon',
  name: 'Lebanon',
  longName: 'Lebanese Republic',
  adjective: 'Lebanese',
  flag: '🇱🇧',
  hub: '/online-school/lebanon',
  hubPageId: 'homeschooling-lebanon',
  cityPageId: 'lebanon-city',

  currency: 'USD',
  currencyName: 'United States Dollar',
  currencyPeg: 'Our fees are quoted and invoiced in USD, which is widely used in Lebanon for larger commitments — so a multi-year education decision is a single figure to plan around.',

  timezone: {
    code: 'EET / EEST',
    name: 'Eastern European Time (UTC+2), moving to Eastern European Summer Time (UTC+3) for the summer',
    utcOffset: '+2 / +3',
    offsetFromEAT: 'One hour behind our teaching base in winter and exactly level in summer — among the closest in our coverage',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Lebanon has established Cambridge and IB provision through its large private school sector'],
  examCentreTiles: [
    { city: 'Beirut', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Mount Lebanon', centre: 'Regional provision', area: 'Checked first for Jounieh, Keserwan and the coastal belt.' },
    { city: 'The north, south and Bekaa', centre: 'Planned per session', area: 'Tripoli, Saida and valley families plan travel into each window ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Lebanon-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Lebanon is an easier market than most for this: the private school sector is very large and has run international programmes for generations, so provision and familiarity are both well established, and the country is compact enough that examination travel is a handful of short journeys a year. Beirut is checked first, with Mount Lebanon for the coastal belt and travel planned ahead from Tripoli, Saida and the Bekaa. Note what does not change: our arrangement runs alongside a Lebanese school, which continues its own track unchanged. Smartious is not a MEHE-licensed school, issues no Lebanese qualification and does not teach toward the Lebanese Baccalaureate.',
  secondaryProgrammeExamRef: 'Authorised Lebanese Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/lebanon.jpg',
  heroEyebrow: 'Online school for Lebanon',
  heroH1Suffix: 'Lebanon',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for professional, academic and Lebanese families across Beirut, Tripoli, Saida, the Bekaa and Mount Lebanon. A qualification read directly in every country your family already has ties to, fees quoted in USD, and a teaching clock within an hour of yours all year.',
  heroValueProp: 'From USD 180/month, quoted in USD. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — alongside your Lebanese school, at whatever hour suits.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Lebanon',

  citiesSectionTitle: 'Where our Lebanon families are',
  citiesSectionBody: 'Smartious Lebanon families concentrate across Beirut (the academic centre, with AUB and LAU teaching in English and one of the most plural private school markets in the region), Tripoli and the north (the second city and its commercial tradition, thin on provision), Saida and the south (some of the deepest diaspora links in the country), Zahle and the Bekaa (the wine and farming valley, an hour over the mountain from anything), and Jounieh and Mount Lebanon (a dense corridor whose households already commute to the capital). One honest legal hedge, one very plural school market, and almost no timezone at all.',

  trustSignals: [
    { h: 'A qualification that reads wherever your family is', p: 'Lebanon has one of the largest and most professionally established diasporas in the world — West Africa, the Gulf, France, Brazil, North America and Australia. Cambridge A-Levels, the IB Diploma and AP records are read directly in all of them rather than converted country by country.' },
    { h: 'Parallel tracks are already normal here', p: 'Lebanon\'s private sector runs the French Baccalauréat, the IB and American programmes alongside the national one. Families here understand an international examination track sitting beside the Lebanese record better than in almost any market we serve.' },
    { h: 'Honest about what we could not verify', p: 'We could not establish Lebanon\'s position on parental home education from a primary instrument. Rather than guessing, we say so, note that an absence of clear regulation is not a permission, and send families to MEHE.' },
    { h: 'Almost no timezone at all', p: 'Lebanon runs UTC+2 in winter and UTC+3 in summer against our UTC+3 year-round — one hour apart in winter and exactly level in summer. Effectively our whole teaching day is available.' },
  ],

  universitiesInCountry: 'the American University of Beirut and the Lebanese American University — both English-medium and among the best known institutions in the Arab world — alongside Université Saint-Joseph, the Lebanese University, the University of Balamand, Notre Dame University and Haigazian.',
  universityChannels: 'Lebanese universities admit on the Lebanese Baccalaureate or on equivalent foreign qualifications through recognition procedures confirmed per institution — and notably, the English-medium American-system universities here read Cambridge A-Levels, the IB Diploma and AP records directly, which makes an internationally examined record valuable even for a student who never leaves the country. Outward, Lebanese students apply across an unusually wide range of destinations reflecting where their families already are: France, the Gulf, the United States, Canada, the United Kingdom, Brazil, West Africa and Australia. UCAS reads A-Levels natively, American and Canadian universities read A-Levels and the IB directly, French institutions assess them through established equivalence routes, and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across UK (UCAS), US, French, Canadian, Gulf and Lebanese destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Lebanon families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes at effectively any hour of our teaching day — Lebanon is one hour behind us in winter and level in summer — run alongside a Lebanese school enrolment that continues its own track unchanged. Cambridge French and Arabic available beside the English-medium core, which matters in a market this plural. Fees quoted in USD.',
  britishCurriculumSuits: 'Lebanon families targeting the Cambridge pathway. Best fit for: (1) families with relatives across several countries who need one record that reads in all of them, (2) students heading for AUB, LAU or English-medium universities abroad, (3) Bekaa, Tripoli and Saida families where provision is thin or absent, (4) Mount Lebanon households already commuting to the capital, (5) students needing a subject their school cannot staff.',
  britishCurriculumDelivery: 'Live online classes at effectively any hour of our teaching day, small groups 4-6 students, every session recorded, alongside a Lebanese school enrolment.',
  ibDiplomaSuits: 'Lebanon families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Lebanon families targeting US universities via Common Application, or preparing for the American-system institutions in Beirut.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Lebanon has one of the strongest educational traditions in the region and one of the most internationally connected populations anywhere — which makes a qualification that needs no translating worth more here than in most markets we serve.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the Bekaa\'s agricultural science households and every medicine-bound student in Beirut, Tripoli and Saida. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Lebanon has one of the highest private-school participation rates anywhere in our coverage and an unusually plural market — the French system runs deep through the Grand Lycée Franco-Libanais, Collège Notre-Dame de Jamhour and Collège Protestant, alongside American-system schools including International College and the American Community School, IB schools and the national programme. Those are serious institutions with long histories and we would not pretend to improve on them. The gaps are specific: subject sets no single timetable can sustain, fees, and the regions outside Beirut and Mount Lebanon where provision thins sharply.',
  competitors: [
    { name: 'International College and the American Community School', city: 'Beirut',         curriculum: 'American, IB and Lebanese',             feesUsd: 'Top of the local market',                           feesAed: 'Competitive places',      rating: 4.7, capacityNote: 'Long-established and strong — the national benchmark' },
    { name: 'Grand Lycée Franco-Libanais, Jamhour, Collège Protestant', city: 'Beirut and Mount Lebanon', curriculum: 'French Baccalauréat and Lebanese', feesUsd: 'Premium tier',                            feesAed: 'Widespread',              rating: 4.6, capacityNote: 'The French system runs deep here — a different route entirely, and a very good one' },
    { name: 'The wider private school sector',                  city: 'Nationwide',            curriculum: 'Lebanese, French, some international',  feesUsd: 'Varies widely',                                     feesAed: '—',                       rating: 4.2, capacityNote: 'Unusually large by international standards — but a national or French record is assessed differently in each foreign country' },
    { name: 'The Bekaa, the north and the south',               city: 'Outside the capital belt', curriculum: 'Thin to none',                       feesUsd: 'Limited international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'A farming valley, a second city and a southern commercial region, none with matching provision' },
    { name: 'Private tuition',                                  city: 'Nationwide',            curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Widespread',              rating: 4.0, capacityNote: 'The default answer to a subject gap — usually one-to-one and unstructured across a year' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh (online)',  city: 'Online',                curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious — UK providers are close to Lebanon on the clock, which families should weigh' },
    { name: 'Smartious Homeschool (Lebanon via online delivery)', city: 'Delivered nationwide', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP',   feesUsd: 'USD 2,160-6,480/year',                              feesAed: 'Quoted in USD',            rating: 4.8, capacityNote: 'Every class live through A-Level + a record read in every country your family is in + the Bekaa, north and south reached + fees in one stable figure' },
  ],

  legalFrameworkIntro: 'Lebanon is one of the markets where we could not verify the central question, and we would rather open by saying so than write around it. Here is what we can establish, and the two facts that shape our offer here more than the law does.',
  legalFramework: [
    { h: 'What we can establish', p: 'Education in Lebanon is administered by the Ministry of Education and Higher Education. Education is compulsory, and families should confirm the current age boundaries with the ministry rather than take them from any article. Private schools operate under MEHE licensing and supervision, and Smartious does not hold such a licence: we do not operate premises in Lebanon, we claim no Lebanese recognition, and the qualifications we deliver carry Cambridge, Pearson Edexcel, IB or AP validity rather than a domestic one.' },
    { h: 'What we could not establish', p: 'Lebanon\'s position on parental home education. We could not verify it against a primary instrument and are not going to fill that gap with confident prose. We will not tell you it is permitted and we will not tell you it is prohibited; both would exceed what we can evidence. What we would add is what we say in Jordan, Iraq, Panama and Guatemala: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to MEHE directly.' },
    { h: 'The Lebanese Baccalaureate, and why parallel tracks are normal here', p: 'The national qualification is the Lebanese Baccalaureate and we do not teach toward it. In most markets that statement needs careful explanation; in Lebanon it usually does not. The private sector already runs the French Baccalauréat, the IB and American programmes alongside the national one, and a great many Lebanese families have direct experience of a child following a foreign programme in a Lebanese school. Ours sits in exactly that category — an internationally examined track beside the Lebanese record rather than instead of it.' },
    { h: 'Why the qualification matters more here than the legal question', p: 'This is the honest heart of what we offer, and it has nothing to do with the quality of Lebanese teaching, which is among the strongest in the region. It is that Lebanon has one of the largest and most professionally established diasporas in the world, and a great many families have members in West Africa, the Gulf, France, Brazil, the United States, Canada or Australia. A child\'s record has to work in whichever of those they end up applying from — and a national or French qualification is assessed through recognition procedures that differ in every one of them. Cambridge A-Levels, the IB Diploma and AP records are read directly across that whole range. For a family whose geography five years out is genuinely open, that is not a marginal advantage.' },
    { h: 'And a second reason that applies even without leaving', p: 'The American University of Beirut and the Lebanese American University teach in English and read Cambridge, IB and AP records directly. A student who arrives at either holding an externally examined English-medium school record has demonstrated years of academic work in the language of instruction rather than a single test score. That benefit applies to families with no intention of leaving the country at all, and it is one of the more useful things we can offer here.' },
    { h: 'Fees and the clock', p: 'Two operational points. We quote and invoice in USD, which is widely used in Lebanon for larger commitments, so a multi-year education decision is one figure to plan around. And Lebanon runs UTC+2 in winter and UTC+3 in summer against our UTC+3 year-round, so we are one hour apart in winter and exactly level in summer — effectively the whole teaching day is available, after-school, mid-morning or evening. Every class is also recorded, so a session that cannot be attended is never a session lost.' },
  ],

  whySmartious: [
    { h: 'One record, every country your family is in',                   p: 'West Africa, the Gulf, France, Brazil, North America, Australia and the UK all read Cambridge A-Levels and the IB directly rather than through separate recognition procedures.' },
    { h: 'English-medium preparation for AUB and LAU',                    p: 'Both teach in English and read international qualifications directly — valuable even for a student staying in Lebanon.' },
    { h: 'Parallel tracks, which Lebanon already understands',            p: 'French, IB and American programmes already run alongside the national one here. Ours sits in the same category and needs less explaining than in most markets.' },
    { h: 'The Bekaa, the north and the south reached',                    p: 'A farming valley, a second city and a southern commercial region, none with matching international provision.' },
    { h: 'Fees in one figure',                                           p: 'Quoted and invoiced in USD, widely used here for larger commitments.' },
    { h: 'Almost no timezone at all',                                     p: 'One hour behind in winter, level in summer — evenings included.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Lebanon?', a: 'We could not verify a position from a primary instrument and will not guess. Education is compulsory and administered by MEHE, and private schools operate under ministry licensing. An absence of clear regulation is not a permission — put the question to MEHE directly. Structured study alongside a school enrolment raises none of it.' },
    { q: 'Do you teach the Lebanese Baccalaureate?', a: 'No. We are not a MEHE-licensed school and issue no Lebanese qualification. We teach Cambridge, Edexcel, IB and AP examinations alongside the Lebanese record — an arrangement Lebanese families already understand, since French, IB and American programmes run in parallel here.' },
    { q: 'Our family has relatives in several countries — which qualification travels?', a: 'Cambridge A-Levels and the IB Diploma, with AP for US-focused applications. All are read directly in France, the Gulf, North and South America, Australia, West Africa and the UK, whereas a national or French record is assessed through different procedures in each.' },
    { q: 'Our child will study at AUB or LAU — is an international record still worth it?', a: 'Often yes. Both teach in English and read Cambridge, IB and AP records directly, so a student arrives having demonstrated sustained academic work in the language of instruction rather than only a test score.' },
    { q: 'How are fees handled?', a: 'Quoted and invoiced in USD, which is widely used here for larger commitments — USD 2,160-6,480 a year for live small-group teaching, one figure to plan a multi-year commitment around.' },
    { q: 'How does the timezone work?', a: 'One hour behind us in winter and exactly level in summer, so effectively our whole teaching day is available — after-school, mid-morning or evening.' },
    { q: 'Where do Lebanese students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session — Beirut first, with Mount Lebanon for the coastal belt and travel planned ahead from Tripoli, Saida and the Bekaa. The country is compact enough that this is a handful of short journeys a year.' },
    { q: 'Which parts of Lebanon does Smartious cover?', a: 'Beirut, Tripoli and the north, Saida and the south, Zahle and the Bekaa, and Jounieh and Mount Lebanon have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which countries your family has ties to and which programme your child\'s school follows: in Lebanon those two answers shape the whole plan.',
}
