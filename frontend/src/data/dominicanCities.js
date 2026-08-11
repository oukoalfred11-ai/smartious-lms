// ═══════════════════════════════════════════════════════════════════
// DOMINICAN REPUBLIC — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for tourism, free-zone, diaspora, and Dominican
// families across Santo Domingo, Santiago, Punta Cana, Puerto Plata
// and La Romana.
// TENTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — HEDGE FIRMLY. SOURCING IS THIN:
// - CONSTITUTIONAL BASE WE CAN CITE: the 2010 Dominican Constitution,
//   ARTICLE 63.2, provides that the family is responsible for the
//   education of its members and therefore has the right to choose
//   the type of education for its children. That is a genuine
//   parental-choice provision and worth stating.
// - GOVERNING STATUTE: the LEY GENERAL DE EDUCACIÓN 66-97, with
//   MINERD as the authority. Educación básica is compulsory. State
//   the compulsory range generally and route families to MINERD
//   rather than quoting ages we have not verified.
// - HOME EDUCATION: we could NOT identify a specific Dominican
//   regulatory framework. PHRASE AS "we are not aware of a specific
//   framework" / "not specifically regulated so far as we can
//   establish" plus "confirm with MINERD". NEVER assert permitted,
//   NEVER assert prohibited.
// - A GENUINE MARKET OBSERVATION WORTH INCLUDING: Dominican
//   community discussion indicates that families who do educate at
//   home commonly do so THROUGH UNITED STATES VIRTUAL SCHOOLS THAT
//   ISSUE THE CERTIFICATE. Report that as a described practice, not
//   as legal advice — it tells a family what the de facto route has
//   been and is directly relevant to what we do and do not offer.
//   CRITICAL: we are NOT a US-accredited school issuing an American
//   diploma. We teach Cambridge, Edexcel, IB and AP examinations.
//   If a family specifically needs an American high school diploma,
//   a US-accredited virtual school is the better fit and we say so.
// - Private schools operate with MINERD authorisation; Smartious is
//   not a MINERD-authorised institution and says so.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT.
// - CONTRAST AVAILABLE AND USEFUL: Ecuador names and regulates the
//   modality; Costa Rica's ministry rejects it; the DR appears
//   simply not to address it. Three different silences and three
//   different risks.
// TIMEZONE: AST (UTC-4), no daylight saving — SEVEN HOURS behind
// Nairobi. Better than Costa Rica, Panama, Ecuador, Colombia and
// Peru. Dominican morning and very early afternoon both work:
// 08:00 DR = 15:00 Nairobi; 11:00 DR = 18:00 Nairobi. Dominican
// schools commonly run tanda matutina and vespertina.
// MARKET NOTE: Santo Domingo holds the international tier — Carol
// Morgan School, St George School, Saint Michael's, the Lincoln
// School, the Franco-Dominican lycée — with a substantial IB and
// American presence and fees at the top of the Caribbean market.
// Santiago is the Cibao's commercial and free-zone capital. Punta
// Cana and Bávaro run one of the largest tourism concentrations in
// the Caribbean with a very international resident workforce.
// Puerto Plata, Sosúa and Cabarete host a long-settled European and
// North American community. La Romana holds Casa de Campo, the
// sugar economy, the port and a cruise terminal. The DR has one of
// the largest diasporas in the United States, and return and
// dual-residence flows are constant.
// ═══════════════════════════════════════════════════════════════════

export const DOMINICAN_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'santo-domingo-do',
    name: 'Santo Domingo',
    county: 'Distrito Nacional and Santo Domingo Province',
    region: 'The capital and corporate centre of the Caribbean\'s largest economy · banking, telecoms and free-zone administration · the country\'s international school tier with substantial IB and American provision',
    primaryKeyword: 'Online school and international curriculum in Santo Domingo',
    heroTagline: 'For Santo Domingo families — Cambridge and IB taught live at a fraction of the capital tier\'s fees, seven hours ahead rather than nine.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Santo Domingo families. The capital carries the corporate weight of the Caribbean\'s largest economy — banking, telecoms, free-zone administration, the diplomatic community — and an international school tier to match, with substantial IB and American provision and fees at the top of the Caribbean market. Dominican law gives families a genuine constitutional footing on educational choice, and rather less by way of specific regulation, and we set out both accurately before anything else.',
    heroImg: '/heroes/santo-domingo-do.jpg',
    altTexts: { hero: 'Santo Domingo and the Caribbean coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Santo Domingo families — the capital tier\'s curriculum at a fraction of its fees. From USD 400/month.',
    challenges: [
      'International school fees in Santo Domingo sit at the top of the Caribbean market.',
      'Educación básica is compulsory under Ley 66-97 and administered by MINERD.',
      'We could not identify a specific Dominican framework for home education.',
      'Private schools operate with MINERD authorisation, and Smartious is not one.',
      'Time zone: the DR runs AST (UTC-4) with no daylight saving — a fixed seven-hour gap behind Nairobi.',
    ],
    familySituations: [
      'Banking, telecoms, and corporate families outside the international tier\'s fees.',
      'Free-zone administration and manufacturing management households.',
      'Diplomatic and international-organisation families.',
      'Returning diaspora families from the United States settling children mid-curriculum.',
      'Students in the tanda vespertina whose mornings are free.',
      'Students targeting US, Spanish, UK, or Dominican universities.',
    ],
    nearbyAreas: ['Piantini and Naco', 'Bella Vista', 'Arroyo Hondo', 'Zona Colonial', 'Santo Domingo Este', 'Boca Chica', 'San Cristóbal'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Dominican university applications',
    ],
    whyChoose: [
      ['A fee gap against the Caribbean\'s most expensive tier', 'Live small-group teaching at USD 2,160-6,480 a year against Santo Domingo fees at the top of the regional market.'],
      ['Seven hours, not nine', 'The DR is closer to our teaching day than Costa Rica, Panama, Ecuador, Colombia or Peru — Dominican mornings and very early afternoons both work.'],
      ['Built for the diaspora return', 'A child arriving mid-curriculum from New York or Florida keeps one internationally examined pathway rather than restarting.'],
      ['Honest about the legal gap', 'We could not identify a specific Dominican framework for home education, and we say so rather than guessing in either direction.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core, protecting Dominican and Spanish university routes.'],
    ],
    growingReason: 'Santo Domingo carries the corporate weight of the Caribbean\'s largest economy — banking, telecoms, free-zone administration and the diplomatic community — with an international school tier offering substantial IB and American provision at the top of the regional market. The DR runs AST (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Santo Domingo families, taught alongside a Dominican school enrolment. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Santo Domingo families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the capital\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities. Note that we teach the AP examinations rather than issuing an American high school diploma; if a family specifically needs the diploma, a US-accredited virtual school is the better fit.',
    },
    homeschoolDetail: 'Dominican education is governed by the Ley General de Educación 66-97, with MINERD as the authority, and educación básica is compulsory — families should confirm the current age boundaries with MINERD rather than take them from a provider. The constitutional footing is genuinely supportive: article 63.2 of the 2010 Constitution provides that the family is responsible for the education of its members and therefore has the right to choose the type of education for its children. What we could not identify is a specific Dominican regulatory framework for home education — no dedicated instrument setting out how a family would notify, be supervised, or have learning accredited. We will not read that silence as a permission and we will not read it as a prohibition; a family whose plan depends on the answer should put the question to MINERD directly. One market observation is worth passing on because it is directly relevant: Dominican community discussion indicates that families who do educate at home commonly do so through United States virtual schools that issue the certificate. That is a described practice rather than legal advice, and it points at something we should be clear about — Smartious is not a US-accredited school and does not issue an American high school diploma. We teach Cambridge, Pearson Edexcel, IB and AP examinations. If what a family specifically needs is an American diploma, a US-accredited virtual school is the better fit and we would say so. Smartious is also not a MINERD-authorised institution; we work alongside a Dominican school that is.',
    homeTuitionDetail: 'Smartious delivers to Santo Domingo families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. The DR sits seven hours behind Nairobi with no daylight saving on either side, so Dominican morning and very early afternoon classes both fall in our teaching day at a constant time every week of the year, with all sessions recorded.',
    faqs: [
      { q: 'Is homeschooling legal in the Dominican Republic?', a: 'We could not identify a specific Dominican regulatory framework for it, and we will not guess in either direction. Educación básica is compulsory under Ley 66-97 and administered by MINERD, while article 63.2 of the Constitution gives the family responsibility for its members\' education and the right to choose the type of education for its children. Put the question to MINERD directly before acting.' },
      { q: 'We have heard families here use US virtual schools — is that right?', a: 'Dominican community discussion indicates that is the common de facto route, with the US school issuing the certificate. We pass that on as a described practice rather than as advice, and note that we are not a US-accredited school and do not issue an American diploma — we teach Cambridge, Edexcel, IB and AP.' },
      { q: 'Is Smartious a MINERD-authorised institution?', a: 'No, and we say so plainly. We work alongside a Dominican school that holds authorisation, and teach internationally examined qualifications.' },
      { q: 'How does the timezone work?', a: 'Seven hours, fixed — better than most of our Latin American markets. Dominican mornings and very early afternoons both land in our teaching day, and with schools commonly running tanda matutina and vespertina, most students have one window free.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'santiago-do',
    name: 'Santiago & the Cibao',
    county: 'Santiago Province',
    region: 'The second city and commercial capital of the Cibao valley · free-zone manufacturing including medical devices and tobacco · a major university centre · thinner international provision than its size suggests',
    primaryKeyword: 'Online school and international curriculum in Santiago Dominican Republic',
    heroTagline: 'For Santiago and Cibao families — the Dominican Republic\'s manufacturing heartland, two hours from the capital\'s international schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Santiago and Cibao families. Santiago is the commercial capital of the Cibao valley and the centre of Dominican free-zone manufacturing — medical devices, electronics, and the tobacco industry that supplies a large share of the world\'s premium cigars — alongside a major university sector. Its international provision is thinner than the city\'s size and industrial profile suggest, and Santo Domingo is two hours south. Smartious teaches Cambridge and IB live across the Cibao.',
    heroImg: '/heroes/santiago-do.jpg',
    altTexts: { hero: 'Santiago and the Cibao valley' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Santiago and Cibao families — free-zone manufacturing heartland, thin provision. From USD 400/month.',
    challenges: [
      'International provision thinner than the city\'s size and industrial profile suggest.',
      'Santo Domingo is two hours south — a relocation rather than a commute.',
      'Free-zone manufacturing recruits internationally while local schooling has not kept pace.',
      'We could not identify a specific Dominican framework for home education.',
      'Time zone: Santiago shares AST (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'Free-zone manufacturing, medical-device, and electronics engineering families.',
      'Tobacco industry and agro-processing business households.',
      'University academic and medical-faculty families.',
      'Cibao commercial and trading families.',
      'Students in the tanda vespertina with mornings free.',
    ],
    nearbyAreas: ['Santiago de los Caballeros', 'Tamboril', 'Villa González', 'Moca', 'La Vega', 'San Francisco de Macorís', 'Jarabacoa'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Dominican university applications',
    ],
    whyChoose: [
      ['Engineering and biomedical depth for a free-zone city', 'Cambridge A-Level Physics, Chemistry, Mathematics, and Further Mathematics — led by a founder with a BEd in Mathematics and Physics — suit a medical-device and electronics manufacturing base.'],
      ['The complete option two hours from the tier', 'Identical live delivery in Santiago and Santo Domingo, without relocation.'],
      ['Pre-medical depth for a university city', 'Cambridge A-Level Biology and Chemistry with Mathematics, planned from IGCSE onward.'],
      ['Seven hours, not nine', 'Dominican mornings and very early afternoons both land in our teaching day.'],
      ['Honest about the legal gap', 'We could not identify a specific Dominican home-education framework and say so rather than guessing.'],
    ],
    growingReason: 'Santiago is the commercial capital of the Cibao and the centre of Dominican free-zone manufacturing — medical devices, electronics, and the premium tobacco industry — alongside a major university sector, with international provision thinner than its scale suggests and Santo Domingo two hours south. The DR runs AST (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Cibao, taught alongside a Dominican school enrolment.',
      cbc: 'Kenya CBC available for Cibao families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the Cibao: educación básica is compulsory under Ley 66-97 with MINERD as the authority, article 63.2 of the Constitution gives the family responsibility for its members\' education and the right to choose the type of education for its children, and we could not identify a specific Dominican regulatory framework for home education. We decline to read that silence as either permission or prohibition and would send any family whose plan depends on it to MINERD directly. Smartious is not a MINERD-authorised institution and is not a US-accredited school issuing an American diploma; we teach Cambridge, Edexcel, IB and AP alongside a Dominican school enrolment. For internationally posted free-zone families the arrangement also travels, continuing unchanged to the next site.',
    homeTuitionDetail: 'Smartious delivers to Cibao families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Dominican morning or very early afternoon, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Santiago?', a: 'Thinner than the city\'s size and industrial profile suggest, with Santo Domingo two hours south. Live delivery reaches the whole Cibao identically.' },
      { q: 'Our school will not run Further Mathematics — can you?', a: 'Yes. A set unviable for four pupils at one school runs routinely in a live group drawn from several countries.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'punta-cana-do',
    name: 'Punta Cana & Bávaro',
    county: 'La Altagracia Province',
    region: 'One of the largest tourism concentrations in the Caribbean · an international hotel and hospitality workforce · a fast-growing residential and remote-work community · schooling far behind the growth',
    primaryKeyword: 'Online school and international curriculum in Punta Cana',
    heroTagline: 'For Punta Cana and Bávaro families — the Caribbean\'s biggest resort economy, staffed from thirty countries and schooled for a small town.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Punta Cana and Bávaro families. The eastern coast holds one of the largest concentrations of tourism capacity anywhere in the Caribbean, and behind the resorts sits a genuinely international permanent workforce — hotel management, aviation, construction, real estate, hospitality services — drawn from across Latin America, Europe, and North America, alongside a fast-growing residential and remote-work community. The schooling has not kept pace with any of it, and Santo Domingo is more than two hours west. Smartious teaches live to the east.',
    heroImg: '/heroes/punta-cana-do.jpg',
    altTexts: { hero: 'The Punta Cana coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Punta Cana and Bávaro families — the Caribbean\'s largest resort economy, schooling far behind. From USD 400/month.',
    challenges: [
      'A large international permanent workforce with schooling far behind the region\'s growth.',
      'Santo Domingo is more than two hours west.',
      'Hotel and hospitality careers move between properties and countries.',
      'A resort economy that runs year-round rather than seasonally, shaping household schedules.',
      'Time zone: Punta Cana shares AST (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'Hotel and resort management families, often internationally recruited.',
      'Aviation, airport, and tour-operator households.',
      'Construction, real estate, and development business families.',
      'Remote-work and residential households in the growing communities.',
      'Students in the tanda vespertina with mornings free.',
    ],
    nearbyAreas: ['Punta Cana', 'Bávaro', 'Cap Cana', 'Verón', 'Uvero Alto', 'Higüey', 'Bayahíbe'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French and home language support',
      'Cambridge A-Level Mathematics, Economics, Business, Biology, Geography',
      'Cambridge A-Level Chemistry, Physics, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Microeconomics, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Dominican university applications',
    ],
    whyChoose: [
      ['Schooling that follows a hospitality career', 'Hotel management moves between properties and countries; the curriculum, teachers, and examination board stay constant across every move.'],
      ['The complete option in a boom region', 'Identical live delivery in Punta Cana and Santo Domingo, without the drive west.'],
      ['Business and economics for a resort economy', 'Cambridge A-Level Economics and Business suit the families who run the Caribbean\'s largest tourism concentration.'],
      ['Seven hours, not nine', 'Dominican mornings and very early afternoons both land in our teaching day.'],
      ['Honest about the legal gap', 'We could not identify a specific Dominican home-education framework and say so.'],
    ],
    growingReason: 'The Punta Cana and Bávaro coast holds one of the largest tourism concentrations in the Caribbean, with a genuinely international permanent workforce in hotel management, aviation, construction and real estate, and a fast-growing residential community — with schooling far behind the growth and Santo Domingo more than two hours west. The DR runs AST (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the east, taught alongside a Dominican school enrolment and portable across hospitality postings.',
      cbc: 'Kenya CBC available for eastern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the east: educación básica is compulsory under Ley 66-97 with MINERD as the authority, article 63.2 of the Constitution gives the family the right to choose the type of education for its children, and we could not identify a specific Dominican regulatory framework for home education — a silence we decline to read as either permission or prohibition. Confirm with MINERD directly. Smartious is not a MINERD-authorised institution and is not a US-accredited school issuing an American diploma. Internationally recruited hospitality families who remain resident elsewhere follow their country of residence\'s framework, a question for their own advisers, and one that arises often in a workforce drawn from this many countries.',
    homeTuitionDetail: 'Smartious delivers to eastern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Dominican morning or very early afternoon, with every session recorded — built for hospitality schedules.',
    faqs: [
      { q: 'We work in hotel management and move between properties — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next property or country, with examinations sat at authorised centres wherever the family is.' },
      { q: 'Is there international schooling in Punta Cana?', a: 'Far behind the region\'s growth, with Santo Domingo more than two hours west. Live delivery reaches the east identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'puerto-plata-do',
    name: 'Puerto Plata, Sosúa & Cabarete',
    county: 'Puerto Plata Province',
    region: 'The north coast · a long-settled European and North American resident community · watersports, tourism and amber · a port and cruise terminal · schooling built for a provincial town',
    primaryKeyword: 'Online school and international curriculum in Puerto Plata and Sosúa',
    heroTagline: 'For Puerto Plata, Sosúa and Cabarete families — a European community settled here for forty years, still without an international school.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for north coast families. Sosúa and Cabarete host one of the longest-settled European and North American resident communities in the Caribbean — German, Swiss, Italian, Canadian and American families, many of them second and third generation, alongside the watersports economy that made Cabarete internationally known and the tourism, port and cruise business at Puerto Plata. The community is decades old and there is still no international school on the coast. Smartious teaches Cambridge and IB live to the north.',
    heroImg: '/heroes/puerto-plata-do.jpg',
    altTexts: { hero: 'The Dominican north coast at Sosúa' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Puerto Plata, Sosúa and Cabarete families — a long-settled European community with no local provision. From USD 400/month.',
    challenges: [
      'A decades-old international resident community with no international school on the coast.',
      'Families spread from Puerto Plata through Sosúa to Cabarete rather than clustered anywhere.',
      'European heritage families often want a language kept that no local school offers.',
      'We could not identify a specific Dominican framework for home education.',
      'Time zone: the north coast shares AST (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'German, Swiss, Italian, Canadian and American resident families, often long-settled.',
      'Watersports, kitesurfing, and adventure-tourism businesses at Cabarete.',
      'Hotel, port, and cruise-terminal households at Puerto Plata.',
      'Remote-work families drawn to the north coast.',
      'Students in the tanda vespertina with mornings free.',
    ],
    nearbyAreas: ['Puerto Plata', 'Sosúa', 'Cabarete', 'Cofresí', 'Río San Juan', 'Luperón', 'Santiago road'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, German, French, Italian and home language support',
      'Cambridge A-Level Mathematics, Biology, Chemistry, Geography, Physics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and German, Italian, Spanish, Canadian and Dominican university applications',
    ],
    whyChoose: [
      ['German, Italian and French alongside the core', 'A coast settled by European families for decades can run Cambridge German, Italian or French beside the English-medium track — and those universities read the record routinely.'],
      ['The complete option on a coast with none', 'Identical live delivery from Puerto Plata to Río San Juan, without relocation.'],
      ['Marine and environmental science that fit the place', 'Cabarete\'s watersports economy and the north coast make good ground for Cambridge Biology and Geography.'],
      ['Seven hours, not nine', 'Dominican mornings and very early afternoons both land in our teaching day.'],
      ['Honest about the legal gap', 'We could not identify a specific Dominican home-education framework and say so.'],
    ],
    growingReason: 'Sosúa and Cabarete host one of the longest-settled European and North American resident communities in the Caribbean, alongside the watersports economy and the port and cruise business at Puerto Plata — a community decades old with still no international school on the coast. The DR runs AST (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the north coast, with German, Italian or French available alongside the English-medium core.',
      cbc: 'Kenya CBC available for north coast families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies on the north coast: educación básica is compulsory under Ley 66-97 with MINERD as the authority, article 63.2 of the Constitution gives the family the right to choose the type of education for its children, and we could not identify a specific Dominican regulatory framework for home education. We decline to read that silence in either direction and would send families to MINERD. One point matters especially here: European resident families who remain registered in Germany, Switzerland, Italy or elsewhere follow that country\'s framework, and those differ sharply from each other — Germany prohibits home education outright while others regulate it. Which applies to a particular household turns on residence and is a question for their own advisers. Smartious is not a MINERD-authorised institution and is not a US-accredited school issuing an American diploma.',
    homeTuitionDetail: 'Smartious delivers to north coast families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Dominican morning or very early afternoon, with every session recorded.',
    faqs: [
      { q: 'Can our children keep German or Italian?', a: 'Yes, and many north coast families do. Cambridge German, Italian or French runs alongside the English-medium core, and those university systems read the resulting record routinely.' },
      { q: 'We are German or Swiss residents spending most of the year here — whose rules apply?', a: 'Your country of residence, and those frameworks differ sharply — Germany prohibits home education outright, others regulate it. Where the residency line falls for your household is a question for your own advisers.' },
      { q: 'Is there international schooling on the north coast?', a: 'None. The community has been here for decades and the schooling has not followed. Live delivery reaches the whole coast identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'la-romana-do',
    name: 'La Romana & the Southeast',
    county: 'La Romana and San Pedro de Macorís',
    region: 'Casa de Campo and the resort economy · the sugar industry and the free zone · a cruise terminal and port · Bayahíbe and the southeastern coast',
    primaryKeyword: 'Online school and international curriculum in La Romana',
    heroTagline: 'For La Romana and southeastern families — a resort economy of international scale beside a sugar industry, and one school map that serves neither.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for La Romana and southeastern families. The province carries an unusual mix: Casa de Campo and the resort and residential economy around it, drawing an international owner and management community; the sugar industry and free-zone manufacturing that built the city; a cruise terminal and port; and the tourism belt running east to Bayahíbe. Santo Domingo is around ninety minutes west. International schooling locally is minimal. Smartious teaches Cambridge and IB live to the southeast.',
    heroImg: '/heroes/la-romana-do.jpg',
    altTexts: { hero: 'La Romana and the southeastern coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for La Romana and southeastern families — resort, sugar and free-zone economy, minimal provision. From USD 400/month.',
    challenges: [
      'Minimal international schooling for a province with an international resort and residential community.',
      'Santo Domingo is around ninety minutes west.',
      'A resort and residential economy whose owner community is internationally mobile.',
      'We could not identify a specific Dominican framework for home education.',
      'Time zone: the southeast shares AST (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'Casa de Campo resort, residential, and management families.',
      'Sugar industry and free-zone manufacturing households.',
      'Cruise terminal, port, and marine-services families.',
      'Tourism businesses along the Bayahíbe coast.',
      'Students in the tanda vespertina with mornings free.',
    ],
    nearbyAreas: ['La Romana', 'Casa de Campo', 'Bayahíbe', 'San Pedro de Macorís', 'Higüey', 'Boca de Yuma', 'the southeastern coast'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Economics, Business, Biology, Chemistry',
      'Cambridge A-Level Physics, Geography, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Microeconomics, AP Biology',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Dominican university applications',
    ],
    whyChoose: [
      ['The complete option in a province with almost none', 'Identical live delivery in La Romana and Santo Domingo, without the drive west.'],
      ['Continuity for an internationally mobile owner community', 'Casa de Campo households move between countries; the curriculum and examination board stay constant.'],
      ['Business and economics for a resort and trading economy', 'Cambridge A-Level Economics, Business and Accounting suit the families who run the southeast.'],
      ['Seven hours, not nine', 'Dominican mornings and very early afternoons both land in our teaching day.'],
      ['Honest about the legal gap', 'We could not identify a specific Dominican home-education framework and say so.'],
    ],
    growingReason: 'La Romana carries Casa de Campo and its international resort and residential community alongside the sugar industry, free-zone manufacturing, a cruise terminal and the Bayahíbe tourism belt — with minimal local international schooling and Santo Domingo ninety minutes west. The DR runs AST (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the southeast, taught alongside a Dominican school enrolment.',
      cbc: 'Kenya CBC available for southeastern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the southeast: educación básica is compulsory under Ley 66-97 with MINERD as the authority, article 63.2 of the Constitution gives the family the right to choose the type of education for its children, and we could not identify a specific Dominican regulatory framework for home education — a silence we decline to read as permission or prohibition. Confirm with MINERD directly. Internationally mobile resort and residential families who remain registered elsewhere follow their country of residence\'s framework, a question for their own advisers. Smartious is not a MINERD-authorised institution and is not a US-accredited school issuing an American diploma.',
    homeTuitionDetail: 'Smartious delivers to southeastern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Dominican morning or very early afternoon, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in La Romana?', a: 'Minimal, with Santo Domingo around ninety minutes west. Live delivery reaches the southeast identically.' },
      { q: 'We are based at Casa de Campo part of the year — whose rules apply?', a: 'Your country of residence rather than where you spend a season. Where that line falls for your household is a question for your own advisers; the teaching works identically either way.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const DOMINICAN_COUNTRY = {
  slug: 'dominican-republic',
  name: 'Dominican Republic',
  longName: 'Dominican Republic',
  adjective: 'Dominican',
  flag: '🇩🇴',
  hub: '/online-school/dominican-republic',
  hubPageId: 'homeschooling-dominican-republic',
  cityPageId: 'dominican-city',

  currency: 'DOP',
  currencyName: 'Dominican Peso',
  currencyPeg: 'Fees are invoiced in USD, which is widely used in the Dominican Republic for larger commitments; peso equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'AST',
    name: 'Atlantic Standard Time (UTC-4), no daylight saving',
    utcOffset: '-4',
    offsetFromEAT: '-7 hours — Dominican mornings and very early afternoons both land in our teaching day, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — the Dominican Republic has established Cambridge provision through its international school sector'],
  examCentreTiles: [
    { city: 'Santo Domingo', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Santiago and the Cibao', centre: 'Regional provision', area: 'Checked first for northern and interior families.' },
    { city: 'The coasts', centre: 'Planned per session', area: 'Punta Cana, Puerto Plata and La Romana families plan travel into each window ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Dominican-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — Santo Domingo is checked first, with regional options in Santiago and travel planned ahead from Punta Cana, Puerto Plata and La Romana. The island is compact enough that examination travel is a handful of day trips a year. One point of clarification specific to this market: Dominican families who educate outside school have commonly used United States virtual schools that issue an American certificate. Smartious is not a US-accredited school and does not issue an American high school diploma — we teach toward Cambridge, Pearson Edexcel, IB and AP examinations. Families who specifically need the American diploma are better served by a US-accredited provider, and we say so rather than blurring the distinction.',
  secondaryProgrammeExamRef: 'Authorised Dominican Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/dominican-republic.jpg',
  heroEyebrow: 'Online school for the Dominican Republic',
  heroH1Suffix: 'the Dominican Republic',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for tourism, free-zone, diaspora, and Dominican families across Santo Domingo, Santiago, Punta Cana, Puerto Plata, and La Romana. The Constitution gives families the right to choose the type of education for their children; we could not identify a specific framework for home education and say so rather than guessing. Seven hours behind us — closer than most of Latin America.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — alongside your Dominican school.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in the Dominican Republic',

  citiesSectionTitle: 'Where our Dominican families are',
  citiesSectionBody: 'Smartious Dominican families concentrate across Santo Domingo (the corporate capital of the Caribbean\'s largest economy, with an international tier at the top of the regional market), Santiago and the Cibao (free-zone manufacturing, medical devices and the premium tobacco industry, two hours from the capital), Punta Cana and Bávaro (one of the largest tourism concentrations in the Caribbean with an international permanent workforce), Puerto Plata, Sosúa and Cabarete (a European and North American community settled for decades with no international school on the coast), and La Romana and the southeast (Casa de Campo, sugar, free zones and a cruise terminal). One constitutional right, one regulatory silence we decline to interpret, and a seven-hour offset that works.',

  trustSignals: [
    { h: 'The constitutional right stated, and the silence too', p: 'Article 63.2 of the 2010 Constitution makes the family responsible for the education of its members and gives it the right to choose the type of education for its children. We could not identify a specific regulatory framework for home education, and we report that gap rather than filling it with a confident claim.' },
    { h: 'Seven hours — closer than most of Latin America', p: 'The DR runs AST (UTC-4) with no daylight saving, so Dominican mornings and very early afternoons both land in our teaching day. That is a materially easier relationship than Costa Rica or Mexico at nine hours.' },
    { h: 'Clear about the US-diploma question', p: 'Dominican families educating outside school have commonly used United States virtual schools that issue an American certificate. We are not a US-accredited school and do not issue an American diploma — we teach Cambridge, Edexcel, IB and AP. If the diploma is what you need, a US provider is the better fit.' },
    { h: 'What we are, stated plainly', p: 'Private schools operate with MINERD authorisation. Smartious is not a MINERD-authorised institution and does not present itself as one — we work alongside a Dominican school that is.' },
  ],

  universitiesInCountry: 'the Universidad Autónoma de Santo Domingo — the oldest university in the Americas — INTEC, PUCMM, UNIBE, and a substantial private sector, with several institutions teaching partly in English and a growing international medical-school segment.',
  universityChannels: 'Dominican universities admit on the national bachillerato through their own processes, with foreign qualifications going through recognition procedures confirmed per institution. The country also hosts an international medical-education segment that draws students from North America and reads international qualifications directly. Outward, Dominican students are overwhelmingly oriented toward the United States — the DR has one of the largest diasporas in the US and the return and dual-residence flows are constant — with Spain following, and both read Cambridge A-Levels, the IB Diploma and AP records directly. UCAS reads A-Levels natively, and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across US, Spanish, Canadian, UK (UCAS), and Dominican destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Dominican families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes on a fixed seven-hour offset with no seasonal drift — Dominican mornings and very early afternoons both work, which fits both tandas — run alongside a Dominican school enrolment that continues its own national track unchanged. Cambridge Spanish available beside the English-medium core, with German, Italian or French for the north coast\'s heritage communities. Examinations at authorised provision confirmed per session.',
  britishCurriculumSuits: 'Dominican families targeting the Cambridge pathway. Best fit for: (1) Punta Cana, Puerto Plata and La Romana families where provision is minimal or absent, (2) Santiago and Cibao free-zone households two hours from the capital tier, (3) Santo Domingo families outside the international tier\'s fees, (4) returning diaspora children arriving mid-curriculum from the United States, (5) north coast European families wanting a heritage language kept alongside.',
  britishCurriculumDelivery: 'Live online classes in the Dominican morning or very early afternoon, small groups 4-6 students, every session recorded, alongside a Dominican school enrolment.',
  ibDiplomaSuits: 'Dominican families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Dominican families targeting US universities via Common Application — the dominant destination given the scale of the diaspora. Note that we teach AP examinations rather than issuing an American high school diploma.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. The Dominican Republic is a market where families have historically reached for American virtual schools by default — and where we would rather explain the difference between an American diploma and an internationally examined qualification than let a family discover it late.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Santiago\'s free-zone engineering households and every medicine-bound student in Santo Domingo. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Santo Domingo has a strong international tier — Carol Morgan School, St George School, Saint Michael\'s, the Lincoln School, the Franco-Dominican lycée — with substantial IB and American provision and fees at the top of the Caribbean market. Outside the capital it thins fast, and in Punta Cana, Puerto Plata and La Romana it is minimal to absent despite each hosting a substantial international community. The most distinctive competitive feature here is not a school at all: American virtual schools have been the de facto home-education route for Dominican families, and understanding what they do differently from us matters more than any local comparison.',
  competitors: [
    { name: 'Carol Morgan School, St George, Saint Michael\'s', city: 'Santo Domingo',        curriculum: 'American, IB and international',        feesUsd: 'Top of the Caribbean market',                       feesAed: 'Premium tier',            rating: 4.7, capacityNote: 'Long-established and strong — the national benchmark' },
    { name: 'The Franco-Dominican and bilingual sector',       city: 'Santo Domingo, Santiago', curriculum: 'French-system and bilingual',         feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.4, capacityNote: 'A different route entirely, and capital-weighted' },
    { name: 'US-accredited virtual schools',                   city: 'Online',                curriculum: 'American diploma programmes',           feesUsd: 'Varies, often per-course',                          feesAed: 'The de facto route here',  rating: 4.3, capacityNote: 'They issue an American high school diploma; we do not. If that is what a family needs, they are the better fit and we say so' },
    { name: 'Punta Cana and the east',                         city: 'La Altagracia',         curriculum: 'Far behind the growth',                 feesUsd: 'Minimal international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'The Caribbean\'s largest resort economy with an international workforce and little schooling' },
    { name: 'Puerto Plata, Sosúa and Cabarete',                city: 'The north coast',       curriculum: '—',                                     feesUsd: 'No international provision',                         feesAed: '—',                       rating: 0,   capacityNote: 'A European community settled for decades, still without an international school' },
    { name: 'Santiago and La Romana',                          city: 'Cibao and southeast',   curriculum: 'Thin',                                  feesUsd: 'Limited international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'A free-zone manufacturing capital and an international resort province, both underserved' },
    { name: 'Smartious Homeschool (DR via online delivery)',    city: 'Delivered to all the DR', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year',                             feesAed: 'DOP equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + the coasts reached + seven hours rather than nine + clear that we teach Cambridge and IB rather than issuing an American diploma' },
  ],

  legalFrameworkIntro: 'The Dominican Republic gives families a genuine constitutional footing and very little specific regulation. Both facts matter, and the second one is where we stop rather than speculate.',
  legalFramework: [
    { h: 'The constitutional right', p: 'Article 63.2 of the 2010 Dominican Constitution provides that the family is responsible for the education of its members and therefore has the right to choose the type of education for its children. That is a real parental-choice provision, and it is stronger language than several frameworks we cover elsewhere. It is also, on its own, a statement of principle rather than an operating framework — it does not tell a family how to notify anyone, what standard applies, or how learning is accredited.' },
    { h: 'The governing statute', p: 'The Ley General de Educación 66-97 governs the Dominican system, with MINERD as the authority, and educación básica is compulsory. We state the compulsory range in general terms rather than quoting ages we have not verified against the current instruments, and we would tell any family to confirm the boundaries for their child with MINERD.' },
    { h: 'What we could not establish', p: 'A specific Dominican regulatory framework for home education — a dedicated instrument setting out notification, supervision, or accreditation. We could not identify one. As in Panama, we decline to read that silence as either a permission or a prohibition, because both would exceed what we can evidence. What we would say is that the constitutional provision in article 63.2 is a meaningfully better starting point than a bare silence, and that a family relying on it should still get MINERD\'s position in a form they can keep before building a school year around it.' },
    { h: 'The de facto route, reported as such', p: 'One observation from Dominican community discussion is worth passing on because it is practically useful and directly relevant to us: families who do educate at home in the DR have commonly done so through United States virtual schools that issue the certificate. That is a described practice rather than a legal position, and it reflects the country\'s deep orientation toward the United States. It also draws a line we want to be explicit about, because it is the most likely source of confusion in this market.' },
    { h: 'What we are not — the American diploma point', p: 'Smartious is not a United States-accredited school and does not issue an American high school diploma. We teach toward Cambridge IGCSE and A-Level, Pearson Edexcel, the IB Diploma, and Advanced Placement examinations, which carry their own international validity and are read directly by American, British, Spanish and Canadian universities. If what a Dominican family specifically needs is an accredited American diploma — because a particular US institution or pathway requires it — a US-accredited virtual school is the better fit, and we would tell them so rather than sell around it. We are also not a MINERD-authorised institution; we work alongside a Dominican school that is.' },
    { h: 'The timezone, which is unusually kind here', p: 'The DR runs AST at UTC-4 with no daylight saving while we teach from UTC+3, so the gap is a fixed seven hours — materially better than Costa Rica or Mexico at nine, Ecuador, Colombia, Panama and Peru at eight. A nine o\'clock Dominican class is four in the afternoon for us; an eleven o\'clock class is six in the evening. Both are ordinary teaching hours, which means Dominican morning and very early afternoon slots both work. And because schools commonly run tanda matutina and vespertina, most students have one of those windows genuinely free.' },
  ],

  whySmartious: [
    { h: 'The constitutional right and the silence, both stated',          p: 'Article 63.2 gives families the right to choose the type of education for their children. We could not identify a specific framework beyond that, and we report the gap rather than filling it.' },
    { h: 'Clear about the American diploma question',                      p: 'Dominican families have historically used US virtual schools that issue a diploma. We do not issue one — we teach Cambridge, Edexcel, IB and AP. If the diploma is the requirement, a US provider is the better fit.' },
    { h: 'Seven hours, not nine',                                          p: 'Dominican mornings and very early afternoons both land in our teaching day, and tanda matutina/vespertina leaves most students one window free.' },
    { h: 'The coasts reached',                                             p: 'Punta Cana, the north coast and La Romana host substantial international communities with minimal or no international schooling.' },
    { h: 'Heritage languages for the north coast',                         p: 'Cambridge German, Italian or French alongside the English-medium core for a community settled here for decades.' },
    { h: 'Built for the diaspora return',                                  p: 'One of the largest diasporas in the United States means children arriving mid-curriculum constantly. One pathway survives the move in both directions.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in the Dominican Republic?', a: 'Article 63.2 of the 2010 Constitution makes the family responsible for the education of its members and gives it the right to choose the type of education for its children, and the Ley General de Educación 66-97 governs the system with MINERD as the authority and educación básica compulsory. We could not identify a specific regulatory framework for home education — notification, supervision, accreditation — and we decline to read that silence as either permission or prohibition. Put the question to MINERD directly before acting.' },
    { q: 'We have heard Dominican families use US virtual schools — is that the normal route?', a: 'Dominican community discussion indicates that is the common de facto route, with the American school issuing the certificate. We pass that on as a described practice rather than advice, and it draws an important line: we are not a US-accredited school and do not issue an American diploma.' },
    { q: 'Do you issue an American high school diploma?', a: 'No. We teach toward Cambridge IGCSE and A-Level, Pearson Edexcel, IB Diploma and AP examinations, which are read directly by American, British, Spanish and Canadian universities. If a family specifically needs an accredited American diploma, a US-accredited virtual school is the better fit and we would tell them so.' },
    { q: 'Is Smartious a MINERD-authorised institution?', a: 'No, and we say so plainly. We work alongside a Dominican school that holds authorisation.' },
    { q: 'How does the timezone work?', a: 'Seven hours, fixed — better than most of our Latin American markets. Dominican mornings and very early afternoons both land in our teaching day, and with tanda matutina and vespertina most students have one window genuinely free.' },
    { q: 'Our child is arriving from New York or Florida mid-curriculum — what happens?', a: 'They keep their pathway. We run alongside a Dominican enrolment while the transition settles, and the record stays readable by American universities through AP and by British ones through A-Levels.' },
    { q: 'Where do Dominican students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session — Santo Domingo first, with regional options in Santiago and travel planned ahead from the coasts.' },
    { q: 'Which parts of the Dominican Republic does Smartious cover?', a: 'Santo Domingo, Santiago and the Cibao, Punta Cana and Bávaro, Puerto Plata with Sosúa and Cabarete, and La Romana and the southeast have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether your child needs an American diploma specifically or an internationally examined qualification: in the Dominican Republic that is the question that decides whether we are the right school for you, and it belongs in the first message.',
}
