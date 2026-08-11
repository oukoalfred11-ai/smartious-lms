// ═══════════════════════════════════════════════════════════════════
// BRAZIL — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for corporate, expat, tech, and Brazilian families
// across São Paulo, Rio, Brasília, Belo Horizonte and Florianópolis.
// SECOND LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — BRAZIL IS THE MOST JUDICIALLY SETTLED
// STRICT-TIER COUNTRY IN OUR ENTIRE COVERAGE. GET IT EXACTLY RIGHT:
// - COMPULSORY EDUCATION: educação básica is obligatory from FOUR TO
//   SEVENTEEN years of age. There is NO post-compulsory window
//   before eighteen. Never invent one.
// - THE DEFINING AUTHORITY — STF, RE 888815, TEMA 822 (September
//   2018), with repercussão geral. The fixed thesis is:
//   "Não existe direito público subjetivo do aluno ou de sua família
//   ao ensino domiciliar, inexistente na legislação brasileira."
//   — There is NO subjective public right of the student or their
//   family to home education, which does not exist in Brazilian
//   legislation.
// - THE NUANCE THAT MUST ALWAYS ACCOMPANY IT: the Court held the
//   Constitution does NOT forbid homeschooling; it held that home
//   education can only be created and regulated by FEDERAL LAW
//   enacted by the National Congress. Report both halves. The Court
//   also indicated conditions any future federal law would have to
//   meet: compliance with the 4-17 obligation, the solidary
//   Family/State duty, a core of academic subjects, supervision,
//   evaluation and inspection by public authorities, avoiding school
//   dropout, and guaranteeing socialisation.
// - CONSEQUENCE FOR SUB-NATIONAL LAWS: state, municipal and district
//   laws creating homeschooling are unconstitutional, invading the
//   União's exclusive competence over diretrizes e bases da educação
//   nacional (CF art. 22, XXIV). The STF has upheld this repeatedly
//   — Santa Catarina's LC 775/2021 struck down (ARE 1459567) and a
//   Distrito Federal law struck down (RE 1492951). Mention that
//   families may see local laws reported and that those have been
//   invalidated.
// - PENDING LEGISLATION: bills to regulate ensino domiciliar have
//   been debated in Congress without producing an enacted federal
//   law. Report as pending/unresolved ONLY; never imply it is close.
// - CONSEQUENCE: SUPPLEMENTARY IS THE ONLY CONFIGURATION we offer
//   for resident children, at every age up to seventeen. This is the
//   North Macedonia situation — narrow offer, stated honestly.
// - Private schools are authorised and supervised through the state
//   education systems under the LDB (Lei 9.394/96); Smartious is not
//   an authorised Brazilian school and says so.
// TIMEZONE — WORKABLE, UNLIKE MEXICO: Brazil's populated southeast
// runs BRT (UTC-3), no daylight saving since 2019. Nairobi is UTC+3,
// so a SIX-HOUR gap. Brazilian morning 09:00 = 15:00 Nairobi; early
// afternoon 13:00 = 19:00 Nairobi. BOTH work. Brazilian schools also
// commonly run manhã and tarde shifts, so a tarde student has
// mornings free and a manhã student has early afternoons free —
// either way there is a window. Say this clearly; it contrasts
// usefully with Mexico.
// MARKET NOTE: Brazil has a large, sophisticated bilingual and
// international school market — St Paul's, Graded, Chapel and the
// British/American schools in São Paulo, the British School and
// Escola Americana in Rio, the American School of Brasília, and a
// very large "escola bilíngue" sector that has grown fast. Fees at
// the top are among the highest in Latin America. Economy: São
// Paulo's financial and corporate centre; Rio's energy sector
// (Petrobras and the pre-salt operators) and creative industries;
// Brasília's federal government and diplomatic community; Minas
// Gerais mining and its medical faculties; and Florianópolis's
// technology and remote-work cluster.
// ═══════════════════════════════════════════════════════════════════

export const BRAZIL_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'sao-paulo-br',
    name: 'São Paulo',
    county: 'State of São Paulo',
    region: 'Latin America\'s financial and corporate capital · the deepest international and bilingual school market in South America · fees among the highest in the region · a vast professional class outside them',
    primaryKeyword: 'Online school and Cambridge tutoring in São Paulo',
    heroTagline: 'For São Paulo families — Cambridge and IB taught live alongside your school, at a fraction of what the Morumbi tier charges.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for São Paulo families. São Paulo is the financial and corporate capital of Latin America, with the deepest international and bilingual school market in South America — the British and American schools, the German, French, Italian, and Japanese schools, and a fast-growing escola bilíngue sector. Fees at the top of that market are among the highest in the region, and the professional class outside them is enormous. Brazilian law is settled and strict on educating outside school, so our role here is unambiguous: alongside your school, never instead of it. The six-hour offset means our classes land in the Brazilian morning or early afternoon — both of which work.',
    heroImg: '/heroes/sao-paulo-br.jpg',
    altTexts: { hero: 'São Paulo skyline' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for São Paulo families — alongside your school, at a fraction of the international tier\'s fees. From USD 400/month.',
    challenges: [
      'International school fees in São Paulo are among the highest in Latin America.',
      'Educação básica is compulsory from four to seventeen, and the STF has held there is no right to home education.',
      'The bilingual sector has grown fast, but Cambridge A-Level provision is thinner than IB and American provision.',
      'Corporate and financial postings move families in and out of Brazil regularly.',
      'Time zone: Brazil runs BRT (UTC-3) with no daylight saving since 2019 — six hours behind Nairobi, so classes land in the Brazilian morning or early afternoon.',
    ],
    familySituations: [
      'Financial, corporate, and professional-services families outside the top tier\'s fees.',
      'Multinational and expatriate households on Brazilian postings.',
      'Families in the bilingual sector wanting a full international examination track.',
      'Students targeting UK, Portuguese, American, or Canadian universities.',
      'Brazilian families adding Cambridge subjects alongside the national route toward ENEM.',
      'Students on the tarde shift with mornings free, or manhã with early afternoons free.',
    ],
    nearbyAreas: ['Morumbi', 'Jardins', 'Vila Nova Conceição', 'Alphaville', 'Granja Viana', 'Campinas', 'ABC region'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Portuguese, Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Portuguese, Canadian and Brazilian university applications',
    ],
    whyChoose: [
      ['A fee gap measured against the region\'s most expensive tier', 'Live small-group teaching at USD 2,160-6,480 a year against São Paulo international fees among the highest in Latin America.'],
      ['Cambridge A-Levels where the market runs to IB and bilingual', 'Families applying through UCAS frequently find their bilingual school does not offer an A-Level route. That is what we teach.'],
      ['Alongside the national route, not instead of it', 'Brazilian law is settled: there is no right to home education. Your school keeps the enrolment and the ENEM track; we add the international one.'],
      ['A workable clock, unlike much of the Americas', 'Six hours, fixed — Brazilian mornings and early afternoons both land in our normal teaching day, with no seasonal drift since Brazil ended daylight saving in 2019.'],
      ['Portuguese kept alongside', 'Cambridge Portuguese runs beside the English-medium core, protecting Brazilian and Portuguese university routes.'],
    ],
    growingReason: 'São Paulo is Latin America\'s financial and corporate capital, with the deepest international and bilingual school market in South America and fees among the highest in the region — inside a legal framework where the STF has held there is no subjective right to home education. Brazil runs BRT (UTC-3), six hours behind Nairobi with no daylight saving.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for São Paulo families, taught alongside a Brazilian school enrolment. Examinations at authorised centres confirmed per family per session; Brazil has established Cambridge provision.',
      cbc: 'Kenya CBC available for São Paulo families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the city\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Brazil is the most judicially settled strict-tier country in our coverage, and a family here deserves the ruling stated exactly. Educação básica is compulsory from four to seventeen. In September 2018 the Supremo Tribunal Federal decided RE 888815 with repercussão geral, fixing the thesis for Tema 822: there is no subjective public right of the student or their family to home education, which does not exist in Brazilian legislation. The Court did not hold homeschooling unconstitutional in principle — it held that it could only be created and regulated by federal law enacted by the National Congress, and indicated the conditions such a law would have to satisfy, including compliance with the four-to-seventeen obligation, the solidary duty of family and State, a core of academic subjects, supervision and evaluation by public authorities, avoidance of school dropout, and guaranteed socialisation. Two consequences follow that families encounter directly. State, municipal, and district laws purporting to create home education are unconstitutional for invading the União\'s exclusive competence over the directives and bases of national education, and the STF has struck several down, including a Santa Catarina law and a Distrito Federal law — so a local law reported in the press is not a route. And bills to regulate ensino domiciliar have been debated in Congress without producing an enacted federal law. Our configuration in Brazil is therefore supplementary at every age up to seventeen: the school carries the enrolment and the national track, and we teach the international one alongside it. Smartious is not an authorised Brazilian school.',
    homeTuitionDetail: 'Smartious delivers to São Paulo families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Brazil sits six hours behind Nairobi with no daylight saving since 2019, so Brazilian morning and early-afternoon classes both fall in our normal teaching day, at the same time every week of the year, with all sessions recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Brazil?', a: 'No, as the law currently stands. In 2018 the STF fixed the thesis in Tema 822 that there is no subjective public right of the student or their family to home education, which does not exist in Brazilian legislation. The Court did not rule it unconstitutional in principle — it held that only federal law enacted by Congress could create and regulate it, and no such law has been enacted. Educação básica remains compulsory from four to seventeen.' },
      { q: 'We have seen a state law allowing it — does that help?', a: 'No. State, municipal and district laws creating home education have been held unconstitutional for invading the União\'s exclusive competence over national education directives; the STF has struck down laws from Santa Catarina and the Distrito Federal among others. A local law reported in the press is not a route.' },
      { q: 'So what can Smartious do here?', a: 'Teach alongside your school. Your child keeps their Brazilian enrolment and the national track toward ENEM; we teach Cambridge or IB subjects live in a Brazilian morning or early-afternoon block toward external examinations.' },
      { q: 'How does the timezone work?', a: 'Six hours, fixed — Brazil ended daylight saving in 2019, so nothing drifts. A 09:00 Brazilian class is 15:00 in Nairobi and a 13:00 class is 19:00; both are normal teaching hours for us. With Brazilian schools commonly running manhã and tarde shifts, most students have one of those windows free.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'rio-de-janeiro-br',
    name: 'Rio de Janeiro',
    county: 'State of Rio de Janeiro',
    region: 'The energy capital — Petrobras and the pre-salt operators · creative industries and a large international community · established British and American schools · Macaé and the offshore corridor to the north',
    primaryKeyword: 'Online school and Cambridge tutoring in Rio de Janeiro',
    heroTagline: 'For Rio and Macaé families — the pre-salt capital, where an internationally recruited energy workforce meets a short list of schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Rio de Janeiro families. Rio is Brazil\'s energy capital — Petrobras and the international pre-salt operators, the subsea and oilfield-services sector strung north to Macaé, and the engineers and managers recruited from around the world who come with it — alongside creative industries, a large diplomatic and consular presence, and long-established British and American schools whose places are competitive and whose fees are high. Brazilian law is settled on educating outside school, so we work alongside your school. The six-hour offset puts our classes in the Brazilian morning or early afternoon.',
    heroImg: '/heroes/rio-de-janeiro-br.jpg',
    altTexts: { hero: 'Rio de Janeiro and Guanabara Bay' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Rio de Janeiro and Macaé families — pre-salt energy capital, competitive school places. From USD 400/month.',
    challenges: [
      'A short list of international schools with competitive places and high fees.',
      'Energy postings arrive and depart on project timelines rather than admission cycles.',
      'Macaé and the offshore corridor are well north of the city\'s schools.',
      'Educação básica is compulsory from four to seventeen, and there is no right to home education.',
      'Time zone: Rio runs BRT (UTC-3), six hours behind Nairobi with no daylight saving.',
    ],
    familySituations: [
      'Petrobras, pre-salt operator, and oilfield-services engineering families.',
      'Subsea and offshore-services households in Macaé and the northern corridor.',
      'Diplomatic, consular, and international-organisation families.',
      'Creative-industry and professional households outside the international tier\'s fees.',
      'Students targeting UK, Portuguese, American, or Norwegian universities.',
    ],
    nearbyAreas: ['Barra da Tijuca', 'Botafogo', 'Gávea', 'Niterói', 'Macaé', 'Cabo Frio', 'Petrópolis'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Portuguese, Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Geography',
      'Cambridge A-Level Economics, Business, Biology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including petroleum and geoscience programmes), Common Application (US), and Portuguese, Norwegian and Brazilian university applications',
    ],
    whyChoose: [
      ['The energy-rotation case, run in eight countries already', 'Stavanger, Baku, Hassi Messaoud, Cabinda, Takoradi, Fier, Esbjerg — and now the pre-salt. One live pathway across every posting.'],
      ['Reaches Macaé and the northern corridor', 'The offshore-services belt sits well north of Rio\'s schools; live delivery removes the distance entirely.'],
      ['Geoscience and engineering depth', 'Cambridge A-Level Physics, Chemistry, Mathematics, and Geography — the spine an energy workforce\'s children aim at.'],
      ['A workable clock', 'Six hours, fixed — Brazilian mornings and early afternoons both land in our normal teaching day.'],
      ['Alongside the national route, not instead of it', 'Brazilian law is settled; your school keeps the enrolment and the ENEM track.'],
    ],
    growingReason: 'Rio is Brazil\'s energy capital — Petrobras and the international pre-salt operators, the subsea and oilfield-services sector running north to Macaé, creative industries, and a large consular presence — with a short list of established international schools at competitive fees. Brazil runs BRT (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Rio and the northern corridor, taught alongside a Brazilian school enrolment and portable across energy postings.',
      cbc: 'Kenya CBC available for Rio families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Rio: educação básica is compulsory from four to seventeen, and the STF fixed in Tema 822 that there is no subjective public right to home education, which does not exist in Brazilian legislation — creatable only by federal law that Congress has not enacted. Our arrangement is therefore supplementary at every age: the school carries the enrolment and the national track, and the Cambridge or IB track runs alongside. For internationally posted energy families the arrangement also travels, continuing unchanged to the next basin — the North Sea, West Africa, or the Gulf — with only the local framework changing around it. Smartious is not an authorised Brazilian school.',
    homeTuitionDetail: 'Smartious delivers to Rio and Macaé families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Brazilian morning or early afternoon, with every session recorded — built for offshore rosters and project timelines.',
    faqs: [
      { q: 'We are on a pre-salt rotation — does the schooling follow us?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next basin anywhere in the world, with examinations sat at authorised centres wherever the family is. It is the case we already run for families in Stavanger, Baku, Cabinda, and Takoradi.' },
      { q: 'We are based in Macaé rather than Rio — does that work?', a: 'Identically. The offshore-services belt is well north of the city\'s schools, and live delivery removes that distance entirely.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'brasilia-br',
    name: 'Brasília',
    county: 'Distrito Federal',
    region: 'The federal capital · one of the largest diplomatic communities in the Southern Hemisphere · federal government, courts and regulators · an international school market shaped by rotation',
    primaryKeyword: 'Online school and Cambridge tutoring in Brasília',
    heroTagline: 'For Brasília families — a capital built for rotation, where a curriculum that survives the next posting matters more than a campus.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Brasília families. The federal capital hosts one of the largest diplomatic communities in the Southern Hemisphere alongside the federal government, the courts, the regulators, and the international organisations that cluster around them — which makes it a city defined by three- and four-year postings. Its international school market reflects that, and its places are competitive. For a family who will be in Bogotá or Geneva or Pretoria next, a curriculum that continues unchanged matters more than any single campus. Brazilian law is settled on educating outside school, so we work alongside whichever school a family holds.',
    heroImg: '/heroes/brasilia-br.jpg',
    altTexts: { hero: 'Brasília and the Esplanada dos Ministérios' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Brasília families — a diplomatic capital built for rotation. From USD 400/month.',
    challenges: [
      'A city defined by three- and four-year postings, so children change systems repeatedly.',
      'International school places are competitive and fees are high.',
      'Educação básica is compulsory from four to seventeen, and there is no right to home education.',
      'Diplomatic arrivals rarely align with admission cycles.',
      'Time zone: Brasília runs BRT (UTC-3), six hours behind Nairobi with no daylight saving.',
    ],
    familySituations: [
      'Diplomatic and consular families on rotation.',
      'International-organisation and development-sector households.',
      'Federal government, judiciary, and regulator professional families.',
      'Brazilian families whose children will apply abroad.',
      'Students who have already changed school systems twice and cannot afford a third disruption.',
    ],
    nearbyAreas: ['Asa Sul', 'Asa Norte', 'Lago Sul', 'Lago Norte', 'Sudoeste', 'Águas Claras', 'Goiânia'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Portuguese, Spanish, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Politics-track subjects, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Portuguese, Spanish, Canadian and Brazilian university applications',
    ],
    whyChoose: [
      ['Built for a posting cycle', 'The curriculum, teachers, and examination board continue unchanged from Brasília to the next capital — which for a diplomatic family is worth more than any single campus.'],
      ['Enrolment on the posting\'s timeline', 'Mid-year arrivals start within a week of the assessment, with no waitlist.'],
      ['Cambridge A-Levels for UCAS', 'A record read natively by UK universities, and directly by Portuguese, Spanish, Canadian, and American ones — useful when the destination is genuinely unknown.'],
      ['A workable clock', 'Six hours, fixed — Brazilian mornings and early afternoons both land in our normal teaching day.'],
      ['Alongside the national route, not instead of it', 'Brazilian law is settled; your school keeps the enrolment and the national track.'],
    ],
    growingReason: 'Brasília hosts one of the largest diplomatic communities in the Southern Hemisphere alongside the federal government, courts, regulators, and international organisations — a capital defined by three- and four-year postings, with a competitive international school market. Brazil runs BRT (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Brasília families, taught alongside a school enrolment and portable to the next posting.',
      cbc: 'Kenya CBC available for Brasília families with East African ties — common in the development community.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the capital\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in the Distrito Federal, and one local detail is worth knowing here specifically: a Distrito Federal law creating home education was held unconstitutional, a decision upheld by the STF in RE 1492951, on the basis that only federal law may institute this modality. That sits within the Court\'s wider position from Tema 822 — no subjective public right to home education, which does not exist in Brazilian legislation. Educação básica remains compulsory from four to seventeen. Our arrangement is therefore supplementary at every age: the school carries the enrolment and the national track, and the Cambridge or IB track runs alongside. Smartious is not an authorised Brazilian school.',
    homeTuitionDetail: 'Smartious delivers to Brasília families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Brazilian morning or early afternoon, with every session recorded — which suits diplomatic travel and mid-year arrivals.',
    faqs: [
      { q: 'A Distrito Federal law allowed homeschooling — what happened to it?', a: 'It was held unconstitutional, and the STF upheld that in RE 1492951, confirming that only federal law can institute this modality. Local laws on the subject invade the União\'s exclusive competence over national education directives.' },
      { q: 'We are posted here for three years — does an international track make sense?', a: 'It is the strongest case for one. The curriculum, teachers, and examination board continue unchanged to the next capital, which is worth more to a rotating family than any single campus.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'belo-horizonte-br',
    name: 'Belo Horizonte & Minas Gerais',
    county: 'Minas Gerais',
    region: 'The mining and metallurgy capital — iron ore, the Quadrilátero Ferrífero and the international mining houses · a major medical and engineering academic centre · thinner international provision than its size suggests',
    primaryKeyword: 'Online school and Cambridge tutoring in Belo Horizonte',
    heroTagline: 'For Belo Horizonte and Minas families — the iron-ore capital, with an international workforce and a short list of schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Belo Horizonte and Minas Gerais families. Minas is Brazil\'s mining and metallurgy heartland — the Quadrilátero Ferrífero, the iron-ore operations and the international mining houses working them, steel and industrial processing, and the engineering and geoscience community that surrounds all of it, alongside one of the country\'s strongest medical and academic sectors. For a state this size and this internationally connected, international schooling is thinner than families expect, and it is concentrated in the capital. Smartious teaches Cambridge and IB live alongside your school, on a six-hour offset that works.',
    heroImg: '/heroes/belo-horizonte-br.jpg',
    altTexts: { hero: 'Belo Horizonte and the Minas hills' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Belo Horizonte and Minas Gerais families — mining and metallurgy capital, thin provision. From USD 400/month.',
    challenges: [
      'International provision is thinner than the state\'s size and industrial profile suggest.',
      'Mining and metallurgy families are spread across the Quadrilátero rather than clustered in the capital.',
      'Educação básica is compulsory from four to seventeen, and there is no right to home education.',
      'Mining assignments move families between operations and countries.',
      'Time zone: Minas runs BRT (UTC-3), six hours behind Nairobi with no daylight saving.',
    ],
    familySituations: [
      'Iron-ore, mining-house, and metallurgy engineering families.',
      'Steel and industrial-processing professional households.',
      'Medical and academic families in one of Brazil\'s strongest university cities.',
      'Families across the Quadrilátero Ferrífero away from the capital.',
      'Students aiming at mining engineering, geoscience, or medicine abroad.',
    ],
    nearbyAreas: ['Belo Horizonte', 'Nova Lima', 'Contagem', 'Betim', 'Ouro Preto and Mariana', 'Itabira', 'Congonhas'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Portuguese and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Further Mathematics, Geography',
      'Cambridge A-Level Biology, Economics, Business',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Physics, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including mining and geoscience programmes), Common Application (US), and Portuguese, Canadian and Brazilian university applications',
    ],
    whyChoose: [
      ['Metallurgy and geoscience depth', 'Cambridge A-Level Chemistry, Physics, Mathematics, and Geography — led by a founder with a BEd in Mathematics and Physics — suit an iron-ore capital precisely.'],
      ['Reaches the Quadrilátero, not just the capital', 'Mining families in Nova Lima, Itabira, Mariana, and Congonhas get identical live delivery without a commute to Belo Horizonte.'],
      ['Pre-medical depth for a major medical city', 'Cambridge A-Level Biology and Chemistry with Mathematics for the medicine-bound students Minas produces in numbers.'],
      ['Portable across the mining world', 'Minas now, Australia, Chile, or the Copperbelt next — one curriculum and one examination board across every posting.'],
      ['Alongside the national route, not instead of it', 'Brazilian law is settled; your school keeps the enrolment and the ENEM track.'],
    ],
    growingReason: 'Minas Gerais is Brazil\'s mining and metallurgy heartland — the Quadrilátero Ferrífero, the iron-ore operations and international mining houses, steel and industrial processing — alongside one of the country\'s strongest medical and academic sectors, with international provision thinner than the state\'s size suggests. Brazil runs BRT (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Minas, taught alongside a Brazilian school enrolment and portable across mining postings.',
      cbc: 'Kenya CBC available for Minas families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Minas: educação básica is compulsory from four to seventeen, and the STF fixed in Tema 822 that there is no subjective public right to home education, which does not exist in Brazilian legislation and could only be created by federal law that Congress has not enacted. Our arrangement is supplementary at every age. For internationally posted mining families it also travels: the curriculum and examination board continue unchanged to the next operation, whether that is Chile, Australia, or the Central African copper belt. Smartious is not an authorised Brazilian school.',
    homeTuitionDetail: 'Smartious delivers to Minas families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Brazilian morning or early afternoon, with every session recorded — built for industrial rosters and towns away from the capital.',
    faqs: [
      { q: 'We live in the Quadrilátero rather than Belo Horizonte — does that work?', a: 'Identically. Live delivery reaches Nova Lima, Itabira, Mariana, and Congonhas the same as the capital, with examinations sat at authorised centres a few times a year.' },
      { q: 'Our contract moves us to Chile or Australia — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next operation anywhere in the world.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'florianopolis-br',
    name: 'Florianópolis & Santa Catarina',
    county: 'Santa Catarina',
    region: 'Brazil\'s technology and remote-work capital · a fast-growing international resident community · Joinville and Blumenau\'s German-heritage industrial belt · schooling that has not matched the inflow',
    primaryKeyword: 'Online school and Cambridge tutoring in Florianópolis',
    heroTagline: 'For Florianópolis and Santa Catarina families — the island the tech industry moved to, and the state whose homeschooling law was struck down.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Florianópolis and Santa Catarina families. Florianópolis has become Brazil\'s technology and remote-work capital — a software and startup cluster, a fast-growing international resident community drawn from across Europe and the Americas, and a lifestyle-migration inflow that has outpaced the schools serving it. Inland, Joinville and Blumenau carry a German-heritage industrial belt with its own international connections. Santa Catarina is also where a state homeschooling law was passed and then struck down, which makes the legal position here worth stating precisely rather than vaguely.',
    heroImg: '/heroes/florianopolis-br.jpg',
    altTexts: { hero: 'Florianópolis island and coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Florianópolis and Santa Catarina families — tech and remote-work capital, and the truth about the struck-down state law. From USD 400/month.',
    challenges: [
      'An international resident and remote-work community growing faster than the schools serving it.',
      'Families spread across the island, the mainland, and the industrial belt rather than clustered near one campus.',
      'Santa Catarina\'s state homeschooling law was held unconstitutional — families may still see it referenced.',
      'Educação básica is compulsory from four to seventeen, and there is no right to home education.',
      'Time zone: Santa Catarina runs BRT (UTC-3), six hours behind Nairobi with no daylight saving.',
    ],
    familySituations: [
      'Software, startup, and technology-sector families.',
      'International remote-work and lifestyle-migration households.',
      'Joinville and Blumenau industrial and German-heritage families.',
      'Families who arrived mid-curriculum from Europe or the Americas.',
      'Students targeting UK, Portuguese, German, or American universities.',
    ],
    nearbyAreas: ['Florianópolis', 'Jurerê', 'Campeche', 'São José and Palhoça', 'Joinville', 'Blumenau', 'Balneário Camboriú'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Portuguese, German, Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Computer Science, Chemistry',
      'Cambridge A-Level Economics, Business, Biology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Computer Science A, AP Physics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Portuguese, German, Canadian and Brazilian university applications',
    ],
    whyChoose: [
      ['Computing depth for Brazil\'s tech capital', 'Cambridge A-Level Computer Science, Mathematics, and Further Mathematics suit the sector that has reshaped the island.'],
      ['The legal position stated precisely', 'Santa Catarina\'s homeschooling law was struck down as unconstitutional. We say so clearly rather than letting a family act on a law that no longer stands.'],
      ['German alongside for the industrial belt', 'Joinville and Blumenau families can run Cambridge German beside the English-medium core, and German universities read the record routinely.'],
      ['Built for remote-work households', 'A family that already sets its own day builds around a morning or early-afternoon teaching block easily.'],
      ['A workable clock', 'Six hours, fixed, no drift since Brazil ended daylight saving in 2019.'],
    ],
    growingReason: 'Florianópolis has become Brazil\'s technology and remote-work capital — a software and startup cluster with a fast-growing international resident community — alongside the German-heritage industrial belt at Joinville and Blumenau, with schooling that has not matched the inflow. Brazil runs BRT (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Santa Catarina, taught alongside a Brazilian school enrolment.',
      cbc: 'Kenya CBC available for Santa Catarina families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Santa Catarina is worth a precise answer, because families here encounter a specific piece of misinformation. A Santa Catarina state law providing for home education was held unconstitutional by the state court, and the STF upheld that decision in ARE 1459567, on the basis that legislating on home education falls within the União\'s exclusive competence. That sits within the Court\'s wider position from Tema 822: there is no subjective public right of the student or their family to home education, which does not exist in Brazilian legislation, and could only be created by federal law enacted by Congress. Educação básica is compulsory from four to seventeen. So a family who has read about the Santa Catarina law should know it does not provide a route. Our arrangement is supplementary at every age: the school carries the enrolment and the national track, and the Cambridge or IB track runs alongside. Smartious is not an authorised Brazilian school.',
    homeTuitionDetail: 'Smartious delivers to Santa Catarina families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Brazilian morning or early afternoon, with every session recorded.',
    faqs: [
      { q: 'Santa Catarina passed a homeschooling law — can we use it?', a: 'No. It was held unconstitutional by the state court and the STF upheld that in ARE 1459567, because legislating on home education is within the União\'s exclusive competence. Only a federal law enacted by Congress could create the modality, and none has been.' },
      { q: 'We are a remote-work family here — how does the timetable work?', a: 'Well, usually. Brazil is six hours behind our teaching base, so morning and early-afternoon Brazilian classes both land in our normal day — and a household that already sets its own schedule finds either window easy to build around.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const BRAZIL_COUNTRY = {
  slug: 'brazil',
  name: 'Brazil',
  longName: 'Federative Republic of Brazil',
  adjective: 'Brazilian',
  flag: '🇧🇷',
  hub: '/online-school/brazil',
  hubPageId: 'homeschooling-brazil',
  cityPageId: 'brazil-city',

  currency: 'BRL',
  currencyName: 'Brazilian Real',
  currencyPeg: 'Fees are invoiced in USD; real equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'BRT',
    name: 'Brasília Time (UTC-3) across the populated southeast, no daylight saving since 2019',
    utcOffset: '-3',
    offsetFromEAT: '-6 hours — Brazilian mornings and early afternoons both land in our teaching day, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Brazil has established Cambridge provision through its international and bilingual school sector'],
  examCentreTiles: [
    { city: 'São Paulo', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Rio and Brasília', centre: 'Regional provision', area: 'Checked first for southeastern and capital families.' },
    { city: 'Minas and the south', centre: 'Planned per session', area: 'Belo Horizonte and Santa Catarina families plan travel into each window ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Brazil-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Brazil\'s large international and bilingual school sector means Cambridge provision is established here — São Paulo is checked first, with regional options in Rio, Brasília, and Belo Horizonte and travel planned ahead from the south. Note what does not change: our arrangement runs alongside a Brazilian school, which continues its own national track unchanged, including the ENEM route at the end of ensino médio. Smartious is not an authorised Brazilian school, and the qualifications we teach carry Cambridge, Pearson Edexcel, IB, or AP validity rather than Brazilian official validity — a distinction we state plainly.',
  secondaryProgrammeExamRef: 'Authorised Brazilian Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/brazil.jpg',
  heroEyebrow: 'Online school for Brazil',
  heroH1Suffix: 'Brazil',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for corporate, energy, technology, and Brazilian families across São Paulo, Rio de Janeiro, Brasília, Belo Horizonte, and Florianópolis. Brazilian law is settled: the STF held in 2018 that there is no right to home education, and educação básica is compulsory from four to seventeen. So we teach alongside your school — never instead of it — on a six-hour offset that puts our classes in your morning or early afternoon.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — alongside your Brazilian school, with Portuguese kept intact.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Brazil',

  citiesSectionTitle: 'Where our Brazil families are',
  citiesSectionBody: 'Smartious Brazil families concentrate across São Paulo (Latin America\'s financial capital and the deepest international and bilingual school market in South America, at regional-record fees), Rio de Janeiro (the pre-salt energy capital, with the offshore-services belt running north to Macaé), Brasília (one of the largest diplomatic communities in the Southern Hemisphere, defined by three- and four-year postings), Belo Horizonte and Minas Gerais (the iron-ore and metallurgy heartland with thinner provision than its size suggests), and Florianópolis and Santa Catarina (the technology and remote-work capital, and the state whose homeschooling law was struck down). One settled legal position, one supplementary configuration, and a timezone that actually works.',

  trustSignals: [
    { h: 'An African school teaching Brazilian families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023, serving students in 67 countries — an internationally accredited online school, not a Brazilian one.' },
    { h: 'A timezone that works', p: 'Brazil runs BRT (UTC-3) with no daylight saving since 2019 and Kenya EAT (UTC+3) with none either — a fixed six-hour gap. Brazilian morning and early-afternoon classes both land in our normal teaching day, and with schools commonly running manhã and tarde shifts, most students have one of those windows free.' },
    { h: 'The law stated exactly, including the nuance', p: 'The STF fixed in Tema 822 (RE 888815, 2018) that there is no subjective public right to home education, which does not exist in Brazilian legislation. The Court did not rule it unconstitutional in principle — it held only federal law enacted by Congress could create it, and none has been. Educação básica is compulsory from four to seventeen.' },
    { h: 'State laws you may have read about', p: 'Santa Catarina and the Distrito Federal both passed homeschooling laws and both were struck down, upheld by the STF, because the subject falls within the União\'s exclusive competence. A local law reported in the press is not a route, and we would rather say so than let a family act on it.' },
  ],

  universitiesInCountry: 'USP, Unicamp, UFRJ, UFMG, UnB, UFSC and the federal university system, alongside PUC and the large private sector — one of the largest higher-education systems in the world, with entry principally through ENEM and institutional vestibulares.',
  universityChannels: 'Brazilian universities admit principally through ENEM and institutional vestibulares, and foreign qualifications enter through revalidação and equivalence procedures with requirements confirmed per institution — a family intending to return into the Brazilian system should confirm that route specifically rather than assume it. Outward, Brazilian students are strongly oriented toward Portugal, which admits Brazilian and international candidates in large numbers and reads Cambridge A-Levels and the IB through its own equivalence routes; the United States and Canada follow, both reading A-Levels, the IB, and AP records directly; and UCAS reads A-Levels natively. A-Levels are accepted in 160+ countries — including the petroleum, mining, and geoscience programmes that our Rio and Minas families most often have in view. Smartious provides personalised university guidance across Portuguese, US, Canadian, UK (UCAS), and Brazilian destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Brazil families, in the only configuration Brazilian law leaves open for a resident child: live supplementary Cambridge subjects beside a Brazilian school enrolment, at every age up to seventeen. Classes run in the Brazilian morning or early afternoon on a fixed six-hour offset with no seasonal drift, and Cambridge Portuguese is available alongside the English-medium core. The school keeps the national track toward ENEM; we add the internationally examined one. Examinations at authorised provision confirmed per session.',
  britishCurriculumSuits: 'Brazil families targeting the Cambridge pathway. Best fit for: (1) families in the bilingual sector wanting a full international examination track, (2) energy families in Rio and Macaé and mining families across Minas whose careers move, (3) diplomatic and rotating households in Brasília, (4) professional families outside the international tier\'s fees, (5) students applying through UCAS who find no local A-Level route.',
  britishCurriculumDelivery: 'Live online classes in the Brazilian morning or early afternoon, small groups 4-6 students, every session recorded, alongside a Brazilian school.',
  ibDiplomaSuits: 'Brazil families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Brazil families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Brazil families join students in 67 other countries — and, unusually for the Americas, the timezone works: six hours, fixed, with Brazilian mornings and early afternoons both inside our teaching day.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Minas\'s metallurgy and geoscience families, Rio\'s pre-salt households, and Florianópolis\'s technology community. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Brazil has a large and sophisticated international and bilingual school market — St Paul\'s, Graded, Chapel and the British and American schools in São Paulo, the British School and Escola Americana in Rio, the American School of Brasília, and an escola bilíngue sector that has expanded rapidly. These are strong institutions. Two gaps are real and neither is about quality: the fees at the top of the market are among the highest in Latin America, and Cambridge A-Level provision is thinner than IB and American provision, which matters for anyone applying through UCAS.',
  competitors: [
    { name: 'St Paul\'s, Graded, Chapel and the São Paulo tier',  city: 'São Paulo',           curriculum: 'British, American and IB',              feesUsd: 'Among the highest in Latin America',                feesAed: 'Premium tier',            rating: 4.8, capacityNote: 'Excellent and long-established — the regional benchmark' },
    { name: 'The British School and Escola Americana',         city: 'Rio de Janeiro',        curriculum: 'British, American and IB',              feesUsd: 'Premium tier',                                      feesAed: 'Competitive places',      rating: 4.6, capacityNote: 'A short list of strong options for a large energy community' },
    { name: 'The escola bilíngue sector',                      city: 'Nationwide',            curriculum: 'Bilingual Brazilian',                   feesUsd: 'Mid to premium tier',                               feesAed: 'Widespread',              rating: 4.3, capacityNote: 'Fast-growing and useful — but bilingual is not the same as an international examination track' },
    { name: 'Minas and the south',                             city: 'Outside the big three', curriculum: 'Thinner provision',                     feesUsd: 'Limited international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'An iron-ore heartland and a tech capital, both thinner than their profiles suggest' },
    { name: 'Cambridge A-Level provision',                     city: 'Nationwide',            curriculum: 'Comparatively scarce',                  feesUsd: '—',                                                 feesAed: '—',                       rating: 0,   capacityNote: 'In an IB, American and bilingual market, UCAS applicants often find no local A-Level route' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh (online)',  city: 'Online',                curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious — though UK providers are closer to Brazil on the clock than we are' },
    { name: 'Smartious Homeschool (Brazil via online delivery)', city: 'Delivered to all Brazil', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'BRL equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + the A-Level route the market lacks + a six-hour offset that works + the STF position stated exactly, including the struck-down state laws' },
  ],

  legalFrameworkIntro: 'Brazil is the most judicially settled country in our entire coverage on this question, which makes it one of the easiest to describe honestly and one of the easiest to describe dishonestly. Here is the ruling, exactly.',
  legalFramework: [
    { h: 'The obligation: four to seventeen', p: 'Educação básica in Brazil is compulsory from the age of four to the age of seventeen. That is a long compulsory range by international standards — longer than almost every country in our European coverage — and it means Brazil has no post-compulsory window before eighteen. Any provider offering a full-time programme to a sixteen-year-old resident in Brazil on the basis that compulsory schooling has ended is describing another country\'s law.' },
    { h: 'Tema 822: the thesis, quoted', p: 'In September 2018 the Plenary of the Supremo Tribunal Federal decided Recurso Extraordinário 888815 with repercussão geral, and fixed the thesis for Tema 822: there is no subjective public right of the student or their family to home education, which does not exist in Brazilian legislation. The case had come from a family in Canela, Rio Grande do Sul, who sought permission to educate their daughter at home. The recurso was denied, and the thesis binds.' },
    { h: 'The nuance that must always accompany it', p: 'The Court did not hold homeschooling unconstitutional in principle, and an honest account has to say so. It held that the modality could be created and regulated only by federal law enacted by the National Congress — and it indicated what such a law would have to contain: compliance with the four-to-seventeen obligation, respect for the solidary duty of family and State, a core of academic subjects, supervision, evaluation and inspection by the public authorities, measures to avoid school dropout, and guaranteed socialisation through family and community life. Bills have been debated in Congress; none has produced an enacted federal law. Until one does, the position is as the thesis states.' },
    { h: 'The state laws families read about — and why they do not help', p: 'This matters practically, because several states and the Distrito Federal have passed their own homeschooling laws and the reporting travels further than the outcomes. Santa Catarina\'s law was held unconstitutional and the STF upheld that in ARE 1459567; a Distrito Federal law met the same fate, upheld by the First Panel in RE 1492951. The reasoning is consistent: legislating on the directives and bases of national education is within the União\'s exclusive competence, so state, municipal, and district laws creating this modality are unconstitutional. If you have seen a local law reported, it is not a route, and we would rather tell you now than have you discover it through an enforcement conversation.' },
    { h: 'What that leaves — one configuration, stated honestly', p: 'For a child resident in Brazil, the arrangement we offer is supplementary and it runs from four to seventeen without exception. The school carries the enrolment, the national curriculum, and the route toward ENEM; Smartious teaches the Cambridge or IB track live alongside it, in a Brazilian morning or early-afternoon block, toward external examinations. Smartious is not an authorised Brazilian school and does not claim Brazilian official validity for the studies it delivers — those carry Cambridge, Pearson Edexcel, IB, or AP validity instead. It is a narrower offer than we make in most countries and we would rather state it plainly than blur it.' },
    { h: 'Why the clock is unusually kind here', p: 'One practical advantage worth stating after all that. Brazil ended daylight saving in 2019 and Kenya has never observed it, so the six-hour gap between our teaching base and Brazil\'s populated southeast is fixed year-round. A nine o\'clock Brazilian class is three in the afternoon for us; a one o\'clock Brazilian class is seven in the evening. Both are ordinary teaching hours. And because Brazilian schools very commonly run manhã and tarde shifts, most students have either a morning or an early afternoon genuinely free — so unlike some markets at this distance, the supplementary model fits the school day rather than fighting it.' },
  ],

  whySmartious: [
    { h: 'The STF position stated exactly, both halves',                   p: 'No subjective right to home education, which does not exist in Brazilian law — and not unconstitutional in principle, creatable only by a federal law Congress has not passed. We give families the whole ruling.' },
    { h: 'The struck-down state laws, named',                             p: 'Santa Catarina and the Distrito Federal both passed laws and both were invalidated. We say so rather than letting a family act on reporting.' },
    { h: 'The A-Level route a large market lacks',                        p: 'Brazil is well served for the IB, the American curriculum, and bilingual schooling, and comparatively thin on Cambridge A-Levels — which is what UCAS reads most directly.' },
    { h: 'A six-hour offset that genuinely works',                        p: 'Fixed year-round since Brazil ended daylight saving, with Brazilian mornings and early afternoons both inside our teaching day — and manhã/tarde shifts leaving most students one free window.' },
    { h: 'Portuguese kept alongside',                                     p: 'Cambridge Portuguese runs beside the English-medium core, protecting Brazilian and Portuguese university routes while adding UK, US, and Canadian ones.' },
    { h: 'Honest about what we are',                                      p: 'Not an authorised Brazilian school, and no claim to Brazilian official validity. We work alongside the school that has it.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Brazil?', a: 'No, as the law currently stands. In 2018 the STF fixed the thesis in Tema 822 (RE 888815) that there is no subjective public right of the student or their family to home education, which does not exist in Brazilian legislation. Importantly, the Court did not rule it unconstitutional in principle — it held that only a federal law enacted by the National Congress could create and regulate it, and no such law has been enacted. Educação básica remains compulsory from four to seventeen.' },
    { q: 'But my state passed a homeschooling law — can I use it?', a: 'No. Santa Catarina\'s law was struck down and the STF upheld that in ARE 1459567; a Distrito Federal law was struck down and upheld in RE 1492951. Legislating on this falls within the União\'s exclusive competence over the directives and bases of national education, so state, municipal, and district laws creating the modality are unconstitutional.' },
    { q: 'What would a future federal law have to include?', a: 'The STF indicated the conditions: compliance with the four-to-seventeen compulsory range, the solidary duty of family and State, a core of academic subjects, supervision, evaluation and inspection by the public authorities, measures against school dropout, and guaranteed socialisation. Bills have been debated without an enacted law, and we report that as unresolved rather than imminent.' },
    { q: 'So what can Smartious offer in Brazil?', a: 'One thing, done properly: live Cambridge or IB teaching alongside your Brazilian school, from age four to seventeen and beyond. The school keeps the enrolment and the national track toward ENEM; we add the internationally examined one.' },
    { q: 'Is Smartious an authorised Brazilian school?', a: 'No, and we say so plainly. The qualifications we teach carry Cambridge, Pearson Edexcel, IB, or AP validity rather than Brazilian official validity. We work alongside the school that holds the Brazilian one.' },
    { q: 'How does the timezone work?', a: 'Better than most of the Americas. Brazil ended daylight saving in 2019 and Kenya has never observed it, so the six-hour gap is fixed year-round — a nine o\'clock Brazilian class is three in the afternoon for us, a one o\'clock class is seven in the evening, and both are ordinary teaching hours. Brazilian schools commonly run manhã and tarde shifts, so most students have one window genuinely free.' },
    { q: 'Why Cambridge when Brazil has so many bilingual and IB schools?', a: 'Because bilingual is not the same as an international examination track, and Cambridge A-Level provision is comparatively thin here. Families applying through UCAS frequently find their school offers no A-Level route, and A-Levels are what UK admissions reads most directly.' },
    { q: 'Which parts of Brazil does Smartious cover?', a: 'São Paulo, Rio de Janeiro, Brasília, Belo Horizonte and Minas Gerais, and Florianópolis and Santa Catarina have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether your child studies manhã or tarde: in Brazil that decides which of our two teaching windows fits your family, and it belongs in the first message.',
}
