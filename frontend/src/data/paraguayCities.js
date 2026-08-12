// ═══════════════════════════════════════════════════════════════════
// PARAGUAY — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for agro-export, border-commerce, Mennonite-colony,
// and Paraguayan families across Asunción, Ciudad del Este,
// Encarnación, the Chaco and the soy belt.
// THIRTEENTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — PARAGUAY IS A GENUINE GREY AREA WITH
// RULINGS REPORTED IN BOTH DIRECTIONS. READ ALL OF THIS:
// - CONSTITUTIONAL BASE: ARTICLE 73 establishes the right to
//   education; ARTICLE 76 makes basic school education COMPULSORY.
// - GOVERNING STATUTE: LEY 1264 of 26 May 1998, the Ley General de
//   Educación, with the Ministerio de Educación y Ciencias (MEC) as
//   the authority. Ley 4088 of 2010 establishes free preschool and
//   media education. Ley 5749 sets the MEC's Carta Orgánica.
//   * ARTS. 29 and 32: compulsory basic education including
//     preschool. Educación Escolar Básica (EEB) = NINE GRADES.
//   * ART. 14: the FAMILY IS RECOGNISED AS THE NATURAL SETTING FOR
//     EDUCATION — this is the families' strongest textual hook and
//     should be cited fairly.
//   * ARTS. 129-130: parental rights AND duties in basic school
//     education.
// - COMPULSORY AGE RANGE reported as 6-17 for basic education. Cite
//   as reported and tell families to confirm with the MEC.
// - HOME EDUCATION: NO EXPLICIT LAW authorising or regulating it in
//   official sources. It exists in a GREY AREA — supported by
//   parental rights under the Constitution, in tension with the
//   compulsory basic education mandate. There is NO FORMAL
//   NOTIFICATION REQUIREMENT in law; families are nonetheless
//   expected to adhere to MEC national curriculum standards and keep
//   records of progress. Families operate with uncertainty and often
//   RELY ON EXAM VALIDATION FOR RE-ENTRY into formal education.
// - COURT RULINGS BOTH WAYS: commentary reports that in Bolivia and
//   Paraguay, without clear mention in their norms, there have been
//   rulings both in favour of and against home education. STATE
//   THIS — it is the single most useful honest fact for a Paraguayan
//   family, and it is why we do not give a confident answer.
// - *** THE DISCLOSURE HOOK — ART. 74 OF LEY 1264 ***: private
//   institutions may only grant OFFICIAL certificates or titles WITH
//   MEC AUTHORISATION. Smartious does not hold MEC authorisation,
//   does not issue Paraguayan official certificates or títulos, and
//   says so on every page. Also relevant: the título de bachiller
//   requires positive evaluation in all subjects prescribed in the
//   MEC curricular design.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT.
// TIMEZONE: Paraguay ended seasonal clock changes and now runs
// UTC-3 year-round — a SIX-HOUR gap behind Nairobi, same as Brazil,
// Argentina and Uruguay. Paraguayan mornings AND early afternoons
// both work. Verify current arrangements if the family plans around
// a fixed slot. Paraguayan schools commonly run turnos mañana and
// tarde.
// MARKET NOTE: Asunción holds the international tier — American
// School of Asunción, Colegio Internacional, St Anne's, Colegio
// Goethe, the Dante Alighieri — with IB and American provision and
// fees at the top of the local market. Ciudad del Este sits on the
// Triple Frontier with Brazil and Argentina, running one of the
// largest commercial re-export economies in South America plus the
// Itaipú binational dam. Encarnación anchors the Yacyretá dam and
// the Argentine border. The Chaco holds the MENNONITE COLONIES —
// Filadelfia, Loma Plata, Neuland — which are German-speaking,
// agriculturally sophisticated, run their own cooperatives and
// schools, and are a genuinely distinctive market. The eastern soy
// belt (Alto Paraná, Canindeyú, Itapúa) is farmed substantially by
// Brazilian-descended "brasiguayo" families and is one of the
// world's major soy export regions. Paraguay also has a growing
// maquila and services sector and an unusually favourable tax
// regime that has drawn European and Brazilian residents.
// ═══════════════════════════════════════════════════════════════════

export const PARAGUAY_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'asuncion-py',
    name: 'Asunción',
    county: 'Asunción and Central Department',
    region: 'The capital and corporate centre · the diplomatic community · an international school tier with IB and American provision · a growing European and Brazilian resident population drawn by the tax regime',
    primaryKeyword: 'Online school and international curriculum in Asunción',
    heroTagline: 'For Asunción families — Cambridge and IB taught live alongside your school, with the grey area in Paraguayan law stated honestly.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Asunción families. The capital carries Paraguay\'s corporate and financial weight, the diplomatic community, and an international school tier — the American School of Asunción, Colegio Internacional, St Anne\'s, the German and Italian schools — with IB and American provision and fees at the top of the local market. Paraguay is also one of the genuine grey areas in our coverage: there is no explicit law authorising or regulating home education, and rulings have reportedly gone in both directions. We say that rather than pick the convenient version.',
    heroImg: '/heroes/asuncion-py.jpg',
    altTexts: { hero: 'Asunción and the Paraguay river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Asunción families — the grey area explained, morning or early-afternoon classes. From USD 400/month.',
    challenges: [
      'International school fees in Asunción sit at the top of the local market with competitive places.',
      'Basic school education is compulsory under article 76 of the Constitution and Ley 1264.',
      'Home education sits in a grey area, with rulings reportedly going both ways.',
      'Private institutions may only issue official certificates with MEC authorisation, which Smartious does not hold.',
      'Time zone: Paraguay runs UTC-3 year-round — six hours behind Nairobi, so mornings and early afternoons both work.',
    ],
    familySituations: [
      'Corporate, financial, and professional families outside the international tier\'s fees.',
      'Diplomatic and international-organisation households.',
      'European and Brazilian residents drawn by Paraguay\'s tax and residency regime.',
      'Students in turno tarde with mornings free, or turno mañana with early afternoons free.',
      'Students needing a subject their school cannot staff for a small group.',
      'Families targeting UK, Spanish, Brazilian, Argentine, or Paraguayan universities.',
    ],
    nearbyAreas: ['Villa Morra', 'Carmelitas', 'Luque', 'San Bernardino', 'Lambaré', 'Fernando de la Mora', 'Areguá'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, Portuguese, German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Brazilian, Argentine and Paraguayan university applications',
    ],
    whyChoose: [
      ['The grey area stated, not resolved', 'There is no explicit law authorising or regulating home education in Paraguay, and rulings have reportedly gone both ways. We set that out and send families to the MEC rather than offering a confident answer we cannot support.'],
      ['What article 74 means for any provider', 'Private institutions may only grant official certificates or títulos with MEC authorisation. Smartious does not hold it and does not issue Paraguayan official qualifications — we teach Cambridge, Edexcel, IB and AP.'],
      ['A fee gap against the capital tier', 'Live small-group teaching at USD 2,160-6,480 a year.'],
      ['A workable clock', 'Six hours, fixed — Paraguayan mornings and early afternoons both land in our teaching day, and turno mañana/tarde leaves most students one window free.'],
      ['Spanish, Portuguese and German kept alongside', 'For a country between Brazil and Argentina with substantial German-speaking communities, the languages stay rather than being traded away.'],
    ],
    growingReason: 'Asunción carries Paraguay\'s corporate and financial centre, the diplomatic community, an international school tier with IB and American provision, and a growing European and Brazilian resident population drawn by the tax regime — inside a legal framework where home education has no explicit regulation. Paraguay runs UTC-3, six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Asunción families, taught alongside a Paraguayan school enrolment. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Asunción families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the capital\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Paraguayan education law starts with the Constitution: article 73 establishes the right to education and article 76 makes basic school education compulsory. The Ley General de Educación — Ley 1264 of 26 May 1998 — governs the system with the Ministerio de Educación y Ciencias as the authority, and articles 29 and 32 make basic education compulsory including preschool, with Educación Escolar Básica running nine grades. The compulsory range is reported as roughly six to seventeen for basic education, and families should confirm the current boundaries with the MEC. Two provisions cut the other way and deserve fair statement: article 14 of Ley 1264 recognises the family as the natural setting for education, and articles 129 and 130 set out parental rights as well as duties in basic school education. What does not exist is an explicit law authorising or regulating home education. There is no formal notification requirement in law, and yet families are expected to adhere to MEC national curriculum standards and keep records of their children\'s progress — which is the shape of a grey area rather than a route. Commentary reports that in Paraguay, as in Bolivia, without clear mention in the norms there have been rulings both in favour of and against educating at home, and families operate with real uncertainty, often relying on examination validation to re-enter formal education. We are not going to resolve that for you: confirm your position with the MEC before building a school year around it. One further point matters for choosing any provider. Under article 74 of Ley 1264, private institutions may only grant official certificates or títulos with MEC authorisation, and the título de bachiller requires positive evaluation in all subjects prescribed in the MEC curricular design. Smartious does not hold MEC authorisation, does not issue Paraguayan official certificates, and says so plainly — we teach Cambridge, Pearson Edexcel, IB and AP qualifications with their own international validity, alongside a Paraguayan school that holds the domestic side.',
    homeTuitionDetail: 'Smartious delivers to Asunción families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Paraguay sits six hours behind Nairobi, so Paraguayan morning and early-afternoon classes both fall in our normal teaching day, with all sessions recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Paraguay?', a: 'It sits in a grey area. There is no explicit law authorising or regulating it: the Constitution makes basic school education compulsory under article 76 while Ley 1264 recognises the family as the natural setting for education under article 14 and sets out parental rights in articles 129 and 130. Commentary reports rulings going both ways. There is no formal notification requirement in law, yet families are expected to follow MEC curriculum standards and keep records. Confirm your position with the MEC.' },
      { q: 'Can Smartious issue a Paraguayan certificate?', a: 'No, and article 74 of Ley 1264 is the reason: private institutions may only grant official certificates or títulos with MEC authorisation. We do not hold it. We teach Cambridge, Edexcel, IB and AP qualifications alongside a Paraguayan school that carries the domestic side.' },
      { q: 'What do families here actually do?', a: 'Reporting indicates families operating outside the formal system often rely on examination validation to re-enter it. That is a practical description rather than advice, and it is one reason we build alongside a school enrolment instead of instead of one.' },
      { q: 'How does the timezone work?', a: 'Six hours — Paraguayan mornings and early afternoons both land in our teaching day, and with schools commonly running turno mañana and tarde, most students have one window genuinely free.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'ciudad-del-este-py',
    name: 'Ciudad del Este & the Triple Frontier',
    county: 'Alto Paraná',
    region: 'One of South America\'s largest commercial re-export economies · the Itaipú binational dam · the Brazilian and Argentine border · a Lebanese, Chinese, Korean and Brazilian trading community',
    primaryKeyword: 'Online school and international curriculum in Ciudad del Este',
    heroTagline: 'For Ciudad del Este and Alto Paraná families — a genuinely international trading city with schooling built for a provincial one.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Ciudad del Este and Alto Paraná families. The Triple Frontier city runs one of the largest commercial re-export economies in South America, with Lebanese, Chinese, Korean, Brazilian and Paraguayan trading families who have built businesses across three countries, alongside the Itaipú binational dam and its engineering community. It is one of the most genuinely international commercial populations anywhere in the region, and the schooling has never matched it. Asunción is around three hundred kilometres west. Smartious teaches Cambridge and IB live to the border.',
    heroImg: '/heroes/ciudad-del-este-py.jpg',
    altTexts: { hero: 'Ciudad del Este and the Paraná river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Ciudad del Este and Alto Paraná families — Triple Frontier commerce and Itaipú, thin provision. From USD 400/month.',
    challenges: [
      'A genuinely international trading community with schooling built for a provincial city.',
      'Asunción is around three hundred kilometres west.',
      'Cross-border households need to know which country\'s framework applies.',
      'Home education sits in a grey area, with rulings reportedly going both ways.',
      'Time zone: Alto Paraná shares UTC-3 — six hours behind Nairobi.',
    ],
    familySituations: [
      'Import-export and commercial trading families — Lebanese, Chinese, Korean, Brazilian and Paraguayan.',
      'Itaipú dam engineering and operations households.',
      'Logistics, customs, and cross-border services families.',
      'Households with business or residence across the Brazilian or Argentine border.',
      'Students in turno tarde with mornings free.',
    ],
    nearbyAreas: ['Ciudad del Este', 'Hernandarias', 'Presidente Franco', 'Minga Guazú', 'Itaipú', 'Foz do Iguaçu across the border', 'Puerto Iguazú'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, Portuguese, Chinese and home language support',
      'Cambridge A-Level Mathematics, Economics, Business, Accounting, Physics',
      'Cambridge A-Level Chemistry, Computer Science, Further Mathematics',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Microeconomics, AP Physics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Brazilian, Spanish and Paraguayan university applications',
    ],
    whyChoose: [
      ['Economics and business depth for a trading city', 'Cambridge A-Level Economics, Business, Accounting and Mathematics suit the families who run one of South America\'s great commercial hubs.'],
      ['Engineering depth for Itaipú', 'Cambridge A-Level Physics and Mathematics suit the binational dam\'s engineering community.'],
      ['Home languages kept alongside', 'Portuguese, Chinese and other home language support runs beside the English-medium core — which matters in a city built by trading diasporas.'],
      ['The complete option three hundred kilometres from the tier', 'Identical live delivery in Ciudad del Este and Asunción.'],
      ['Residence stated precisely', 'Cross-border families follow the framework of where they legally reside — Brazil, Argentina and Paraguay differ sharply, and we say so.'],
    ],
    growingReason: 'Ciudad del Este runs one of the largest commercial re-export economies in South America with Lebanese, Chinese, Korean and Brazilian trading communities, alongside the Itaipú binational dam and its engineering workforce — with schooling that has never matched the commerce and Asunción three hundred kilometres west. Paraguay runs UTC-3, six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Alto Paraná, taught alongside a Paraguayan school enrolment.',
      cbc: 'Kenya CBC available for Alto Paraná families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Alto Paraná: the Constitution makes basic school education compulsory under article 76, Ley 1264 makes basic education compulsory under articles 29 and 32 while recognising the family as the natural setting for education under article 14, and there is no explicit law authorising or regulating home education — a grey area in which rulings have reportedly gone both ways. Smartious does not hold MEC authorisation and, under article 74 of Ley 1264, does not issue Paraguayan official certificates. One point matters more here than almost anywhere in Paraguay: on the Triple Frontier, education law follows residence rather than where a business trades. Households resident in Brazil follow Brazilian law, where the Supreme Federal Court has held there is no subjective right to home education and educação básica is compulsory from four to seventeen; households resident in Argentina follow Argentine law, where education is obligatory through completion of secondary. Which framework applies to a particular family is a question for their own advisers, and it is worth answering before a school year starts.',
    homeTuitionDetail: 'Smartious delivers to Alto Paraná families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Paraguayan morning or early afternoon, with every session recorded.',
    faqs: [
      { q: 'We have business in Brazil and Argentina as well — whose education rules apply?', a: 'Your country of residence rather than where you trade. Brazil\'s Supreme Federal Court has held there is no right to home education there; Argentina makes education obligatory through completion of secondary; Paraguay is a grey area. Your own advisers can confirm your household\'s position.' },
      { q: 'Can our child keep Portuguese or Chinese?', a: 'Yes — home language support runs alongside the English-medium core, which matters a great deal in a city built by trading communities from several countries.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'encarnacion-py',
    name: 'Encarnación & Itapúa',
    county: 'Itapúa',
    region: 'The Yacyretá binational dam · the Argentine border at Posadas · a substantial German, Ukrainian and Japanese agricultural settlement history · yerba mate, soy and agro-industry',
    primaryKeyword: 'Online school and international curriculum in Encarnación',
    heroTagline: 'For Encarnación and Itapúa families — a dam, a border and a century of European and Japanese settlement, with no international school between them.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Encarnación and Itapúa families. The southern department carries the Yacyretá binational dam and its engineering community, the Argentine border crossing to Posadas, and an agricultural economy shaped by more than a century of German, Ukrainian, Polish and Japanese settlement — colonies that still farm yerba mate, soy and grain and maintain their own institutions. It is internationally connected in a way its school provision does not reflect, and Asunción is around three hundred and seventy kilometres north. Smartious teaches Cambridge and IB live across Itapúa.',
    heroImg: '/heroes/encarnacion-py.jpg',
    altTexts: { hero: 'Encarnación and the Paraná river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Encarnación and Itapúa families — Yacyretá, the Argentine border and settler colonies. From USD 400/month.',
    challenges: [
      'No international schooling in a department with a long international settlement history.',
      'Asunción is around three hundred and seventy kilometres north.',
      'Cross-border households at Posadas need to know which framework applies.',
      'Home education sits in a grey area, with rulings reportedly going both ways.',
      'Time zone: Itapúa shares UTC-3 — six hours behind Nairobi.',
    ],
    familySituations: [
      'Yacyretá dam engineering and operations families.',
      'Yerba mate, soy, and agro-industrial business households.',
      'German, Ukrainian, Polish and Japanese-descended colony families.',
      'Cross-border households toward Posadas and Misiones.',
      'Students in turno tarde with mornings free.',
    ],
    nearbyAreas: ['Encarnación', 'Hohenau', 'Obligado', 'Bella Vista', 'Coronel Bogado', 'Yacyretá', 'Posadas across the border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, German, Portuguese and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Geography',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and German, Japanese, Argentine and Paraguayan university applications',
    ],
    whyChoose: [
      ['German alongside for the colony communities', 'Itapúa\'s settler colonies can run Cambridge German beside the English-medium core, and German universities read the resulting record routinely.'],
      ['Agricultural and environmental science that fit the department', 'Cambridge A-Level Biology, Chemistry and Geography feed agronomy, food science and agricultural business directly.'],
      ['Engineering depth for Yacyretá', 'Cambridge A-Level Physics and Mathematics for the binational dam\'s engineering families.'],
      ['The complete option in a department with none', 'Identical live delivery in Encarnación and Asunción.'],
      ['A workable clock', 'Six hours, fixed — mornings and early afternoons both land in our teaching day.'],
    ],
    growingReason: 'Itapúa carries the Yacyretá binational dam, the Argentine border crossing at Posadas, and an agricultural economy shaped by more than a century of German, Ukrainian, Polish and Japanese settlement — internationally connected in a way its schooling does not reflect, with Asunción three hundred and seventy kilometres north. Paraguay runs UTC-3, six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Itapúa, taught alongside a Paraguayan school enrolment, with German available beside the English-medium core.',
      cbc: 'Kenya CBC available for Itapúa families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Itapúa: basic school education is compulsory under article 76 of the Constitution and articles 29 and 32 of Ley 1264, while article 14 recognises the family as the natural setting for education and articles 129 and 130 set out parental rights and duties. There is no explicit law authorising or regulating home education, and reporting indicates rulings have gone both ways — a grey area rather than a route. Smartious does not hold MEC authorisation and, under article 74 of Ley 1264, does not issue Paraguayan official certificates. Cross-border households resident in Argentina follow Argentine law, where education is obligatory through completion of secondary and we are not aware of an established parental home-education route — a distinction decided by residence rather than proximity to a bridge.',
    homeTuitionDetail: 'Smartious delivers to Itapúa families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Paraguayan morning or early afternoon, with every session recorded.',
    faqs: [
      { q: 'Can our children keep German?', a: 'Yes — Cambridge German runs alongside the English-medium core, which suits Itapúa\'s colony communities and keeps German university routes open.' },
      { q: 'Is there international schooling in Encarnación?', a: 'None. Asunción is around three hundred and seventy kilometres north. Live delivery reaches the whole department identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'filadelfia-py',
    name: 'Filadelfia & the Chaco',
    county: 'Boquerón and Presidente Hayes',
    region: 'The Mennonite colonies — Filadelfia, Loma Plata and Neuland · German-speaking cooperative agriculture and dairy at industrial scale · cattle ranching across the Chaco · one of the most remote inhabited regions in South America',
    primaryKeyword: 'Online school and international curriculum in Filadelfia and the Paraguayan Chaco',
    heroTagline: 'For Chaco and colony families — German-speaking cooperatives farming one of the emptiest places in South America, four hundred kilometres from Asunción.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across the Paraguayan Chaco. The central Chaco holds the Mennonite colonies — Filadelfia, Loma Plata and Neuland — German-speaking communities that built cooperative dairy and agricultural operations of genuinely industrial scale in one of the most difficult environments in South America, alongside cattle ranching across the wider region. The colonies run their own institutions and do so well; what they do not have is an internationally examined pathway, and Asunción is four hundred and fifty kilometres east across the Chaco road. Smartious teaches Cambridge and IB live to the Chaco.',
    heroImg: '/heroes/filadelfia-py.jpg',
    altTexts: { hero: 'The Paraguayan Chaco' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Filadelfia, Loma Plata and Chaco families — German-speaking colonies, no international examinations locally. From USD 400/month.',
    challenges: [
      'One of the most remote inhabited regions in South America, four hundred and fifty kilometres from Asunción.',
      'Strong local institutions but no internationally examined pathway.',
      'German-speaking households wanting the language kept formally alongside English.',
      'Home education sits in a grey area, with rulings reportedly going both ways.',
      'Time zone: the Chaco shares UTC-3 — six hours behind Nairobi.',
    ],
    familySituations: [
      'Mennonite colony families in Filadelfia, Loma Plata and Neuland.',
      'Cooperative dairy, agricultural, and food-processing households.',
      'Cattle ranching families across the Chaco.',
      'Families whose children may study in Germany, Canada or the United States.',
      'Students needing subjects a colony school cannot staff for a small cohort.',
    ],
    nearbyAreas: ['Filadelfia', 'Loma Plata', 'Neuland', 'Mariscal Estigarribia', 'Villa Hayes', 'Pozo Colorado', 'the Chaco road'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE German, Spanish and home language support',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Geography',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and German, Canadian and Paraguayan university applications',
    ],
    whyChoose: [
      ['German as a formal examined subject', 'Cambridge German alongside the English-medium core turns a home language into a qualification German and Swiss universities read directly.'],
      ['Agricultural and food science depth', 'Cambridge A-Level Biology and Chemistry feed agronomy, dairy science and food technology — the disciplines the colonies\' own economy runs on.'],
      ['The complete option four hundred and fifty kilometres out', 'Identical live delivery in Filadelfia and Asunción, with examination travel a few times a year.'],
      ['Small live groups rather than self-paced modules', 'Four to six students with a subject specialist, which is what a small community cannot assemble locally.'],
      ['A workable clock', 'Six hours, fixed — mornings and early afternoons both land in our teaching day.'],
    ],
    growingReason: 'The central Chaco holds the Mennonite colonies of Filadelfia, Loma Plata and Neuland — German-speaking communities running cooperative dairy and agricultural operations at industrial scale — alongside cattle ranching across one of South America\'s most remote inhabited regions, four hundred and fifty kilometres from Asunción. Paraguay runs UTC-3, six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Chaco, with German available as an examined subject beside the English-medium core. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for Chaco families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American or Canadian universities.',
    },
    homeschoolDetail: 'The national picture applies in the Chaco: basic school education is compulsory under article 76 of the Constitution and articles 29 and 32 of Ley 1264, article 14 recognises the family as the natural setting for education, and there is no explicit law authorising or regulating home education — a grey area in which reporting indicates rulings have gone both ways. Smartious does not hold MEC authorisation and, under article 74 of Ley 1264, does not issue Paraguayan official certificates or títulos. Our arrangement here is what it is everywhere in Paraguay: live Cambridge or IB teaching alongside the school a family already has, which in the colonies means alongside the community\'s own well-run institutions rather than in place of them. We are adding an internationally examined qualification, not replacing local schooling.',
    homeTuitionDetail: 'Smartious delivers to Chaco families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Paraguayan morning or early afternoon, with the full recorded library built for remote connectivity.',
    faqs: [
      { q: 'Our children already attend a colony school — what would we add?', a: 'An internationally examined qualification. The colonies\' institutions are well run and we are not replacing them; Cambridge IGCSEs and A-Levels sit alongside and are read directly by universities in Germany, Canada, the United States and the UK.' },
      { q: 'Can German be examined rather than just spoken?', a: 'Yes — Cambridge German runs as a formal examined subject alongside the English-medium core, which turns a home language into a qualification.' },
      { q: 'Where would our children sit examinations?', a: 'At authorised centres confirmed per family per session, with travel from the Chaco planned several weeks ahead of each window.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'santa-rita-py',
    name: 'Santa Rita & the Soy Belt',
    county: 'Alto Paraná, Canindeyú and northern Itapúa',
    region: 'One of the world\'s major soy export regions · Brazilian-descended farming communities across the eastern departments · agricultural machinery, silos and agro-industry · Portuguese widely spoken',
    primaryKeyword: 'Online school and international curriculum in the Paraguayan soy belt',
    heroTagline: 'For Santa Rita, Katueté and soy belt families — Portuguese-speaking farms feeding global markets, and a school map that never followed the crop.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across Paraguay\'s eastern soy belt. Alto Paraná, Canindeyú and northern Itapúa produce soy, maize and wheat at a scale that puts Paraguay among the world\'s significant exporters, farmed substantially by Brazilian-descended families whose households often speak Portuguese first and whose commercial relationships run to Brazil, Europe and Asia. The machinery dealerships, silos and agro-industry follow the crop; international schooling never did. Smartious teaches Cambridge and IB live across the belt, with Portuguese kept alongside.',
    heroImg: '/heroes/santa-rita-py.jpg',
    altTexts: { hero: 'The Paraguayan soy belt' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Santa Rita, Katueté and Paraguayan soy belt families — Portuguese kept alongside. From USD 400/month.',
    challenges: [
      'A globally significant agricultural export region with no international schooling.',
      'Families spread across farming towns rather than clustered in one city.',
      'Portuguese-first households needing the language kept formally.',
      'Home education sits in a grey area, with rulings reportedly going both ways.',
      'Time zone: the soy belt shares UTC-3 — six hours behind Nairobi.',
    ],
    familySituations: [
      'Brazilian-descended farming families across the eastern departments.',
      'Agricultural machinery, silo, and input-supply business households.',
      'Agro-industrial processing and export families.',
      'Households with commercial and family ties across the Brazilian border.',
      'Students aiming at agronomy, veterinary or agricultural business programmes abroad.',
    ],
    nearbyAreas: ['Santa Rita', 'Naranjal', 'Katueté', 'Salto del Guairá', 'Campo 9', 'Hernandarias', 'Bella Vista Norte'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Portuguese, Spanish and home language support',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Geography, Physics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Brazilian, Spanish and Paraguayan university applications',
    ],
    whyChoose: [
      ['Portuguese as an examined subject', 'Cambridge Portuguese alongside the English-medium core turns a household language into a qualification, and Brazilian universities read the record.'],
      ['Agronomy and agricultural science depth', 'Cambridge A-Level Biology and Chemistry with Geography feed agronomy, veterinary and agricultural business routes precisely.'],
      ['Reaches farming towns, not just cities', 'Santa Rita, Naranjal, Katueté and Salto del Guairá get identical live teaching.'],
      ['Economics for an export business', 'Cambridge A-Level Economics and Business suit families running commodity operations into global markets.'],
      ['Residence stated precisely', 'Households resident in Brazil follow Brazilian law, where the Supreme Federal Court has held there is no right to home education.'],
    ],
    growingReason: 'Paraguay\'s eastern soy belt across Alto Paraná, Canindeyú and northern Itapúa produces soy, maize and wheat at globally significant scale, farmed substantially by Brazilian-descended Portuguese-speaking families with commercial ties to Brazil, Europe and Asia — with agro-industry following the crop and international schooling never arriving. Paraguay runs UTC-3, six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the soy belt, with Portuguese available as an examined subject beside the English-medium core.',
      cbc: 'Kenya CBC available for soy belt families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies across the soy belt: basic school education is compulsory under article 76 of the Constitution and articles 29 and 32 of Ley 1264, article 14 recognises the family as the natural setting for education, and there is no explicit law authorising or regulating home education, with rulings reportedly going both ways. Smartious does not hold MEC authorisation and does not issue Paraguayan official certificates under article 74 of Ley 1264. The residency point matters particularly here, because many soy belt households have Brazilian nationality, Brazilian family and Brazilian business: education law follows residence, and Brazil\'s Supreme Federal Court has held there is no subjective right to home education with educação básica compulsory from four to seventeen. Which framework governs a particular household is a question for their own advisers, and worth settling before a school year rather than during one.',
    homeTuitionDetail: 'Smartious delivers to soy belt families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Paraguayan morning or early afternoon, with every session recorded — built for farming schedules and harvest season.',
    faqs: [
      { q: 'Our household speaks Portuguese — can that be examined?', a: 'Yes. Cambridge Portuguese runs as a formal examined subject alongside the English-medium core, which turns a household language into a qualification Brazilian and Portuguese universities read directly.' },
      { q: 'We hold Brazilian nationality and farm in Paraguay — whose rules apply?', a: 'Your country of residence rather than your nationality or where the farm is. Brazil\'s Supreme Federal Court has held there is no right to home education there. Your own advisers can confirm your household\'s position.' },
      { q: 'Is there international schooling in the soy belt?', a: 'None. Live delivery reaches Santa Rita, Naranjal, Katueté and Salto del Guairá identically, with examination travel a few times a year.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const PARAGUAY_COUNTRY = {
  slug: 'paraguay',
  name: 'Paraguay',
  longName: 'Republic of Paraguay',
  adjective: 'Paraguayan',
  flag: '🇵🇾',
  hub: '/online-school/paraguay',
  hubPageId: 'homeschooling-paraguay',
  cityPageId: 'paraguay-city',

  currency: 'PYG',
  currencyName: 'Paraguayan Guaraní',
  currencyPeg: 'Fees are invoiced in USD, which is widely used in Paraguay for larger commitments; guaraní equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'PYT',
    name: 'Paraguay Time (UTC-3) year-round following the end of seasonal clock changes',
    utcOffset: '-3',
    offsetFromEAT: '-6 hours — Paraguayan mornings and early afternoons both land in our teaching day',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Paraguay has established Cambridge provision through its international school sector in Asunción'],
  examCentreTiles: [
    { city: 'Asunción', centre: 'Authorised provision', area: 'The country\'s external-candidate capacity, confirmed per family per session.' },
    { city: 'Ciudad del Este and Encarnación', centre: 'Planned per session', area: 'Border-department families plan travel into each window ahead.' },
    { city: 'The Chaco and the soy belt', centre: 'Planned well ahead', area: 'Filadelfia and eastern farming families plan sittings several weeks in advance.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Paraguay-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — Asunción is checked first, with travel planned ahead from Ciudad del Este, Encarnación, the Chaco and the soy belt. Distances matter here: Filadelfia is around four hundred and fifty kilometres from the capital and the eastern departments three hundred or more, so those families plan sittings several weeks in advance. One point of clarity: under article 74 of Ley 1264, private institutions may only grant official certificates or títulos with MEC authorisation, and the título de bachiller requires positive evaluation in all subjects prescribed in the MEC curricular design. Smartious does not hold MEC authorisation and issues nothing domestic — the Paraguayan side of a student\'s record comes from a Paraguayan school, and the Cambridge, Edexcel, IB or AP side comes from us.',
  secondaryProgrammeExamRef: 'Authorised Paraguayan Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/paraguay.jpg',
  heroEyebrow: 'Online school for Paraguay',
  heroH1Suffix: 'Paraguay',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for agro-export, border-commerce, colony, and Paraguayan families across Asunción, Ciudad del Este, Encarnación, the Chaco and the soy belt. Paraguay is a genuine grey area — no explicit law authorising or regulating home education, and rulings reportedly going both ways — and we say so rather than picking a version.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — alongside your Paraguayan school, with German and Portuguese kept.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Paraguay',

  citiesSectionTitle: 'Where our Paraguay families are',
  citiesSectionBody: 'Smartious Paraguay families concentrate across Asunción (the capital, the diplomatic community and the international tier), Ciudad del Este and the Triple Frontier (one of South America\'s largest commercial re-export economies plus the Itaipú dam), Encarnación and Itapúa (the Yacyretá dam, the Argentine border and a century of German, Ukrainian and Japanese settlement), Filadelfia and the Chaco (the German-speaking Mennonite colonies farming one of the most remote regions in South America), and Santa Rita and the soy belt (Portuguese-speaking farming communities producing for global markets). One grey area stated honestly, three languages kept alongside, and a timezone that works.',

  trustSignals: [
    { h: 'A grey area described as a grey area', p: 'There is no explicit law authorising or regulating home education in Paraguay. The Constitution makes basic school education compulsory under article 76 while Ley 1264 recognises the family as the natural setting for education under article 14 — and reporting indicates rulings have gone both ways. We set that out and send families to the MEC.' },
    { h: 'Article 74, and what it means for any provider', p: 'Private institutions may only grant official certificates or títulos with MEC authorisation. Smartious does not hold it and issues nothing domestic. Any provider marketing Paraguayan qualifications to families should be asked about that article directly.' },
    { h: 'Three languages kept, not traded', p: 'German for the Chaco colonies and Itapúa, Portuguese for the soy belt and the Brazilian border, Spanish throughout — all available as examined Cambridge subjects alongside the English-medium core.' },
    { h: 'A timezone that works', p: 'Paraguay runs UTC-3 year-round, six hours behind our teaching base, so Paraguayan mornings and early afternoons both land in our normal day — and with schools commonly running turno mañana and tarde, most students have one window genuinely free.' },
  ],

  universitiesInCountry: 'the Universidad Nacional de Asunción, the Universidad Católica Nuestra Señora de la Asunción, the Universidad Americana, and regional faculties across Itapúa and Alto Paraná.',
  universityChannels: 'Paraguayan universities admit on the título de bachiller, which requires positive evaluation in all subjects prescribed in the MEC curricular design, with foreign qualifications going through recognition procedures confirmed per institution — a family intending to enter the Paraguayan system should confirm that route early, and note that the domestic side of the record has to come from an MEC-authorised institution rather than from us. Outward, Paraguayan students look most often to Argentina, Brazil and Spain, with the United States and Canada growing, and all of them read Cambridge A-Levels, the IB Diploma and AP records directly; German universities read the record routinely for the Chaco and Itapúa colony families who often have that destination in view. UCAS reads A-Levels natively, and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across Brazilian, Argentine, Spanish, German, US, UK (UCAS), and Paraguayan destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Paraguay families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes on a six-hour offset — Paraguayan mornings and early afternoons both work, which suits both turnos — run alongside a Paraguayan school enrolment that continues its own national track unchanged. Cambridge Spanish, Portuguese and German available beside the English-medium core, which matters more here than in most markets. Examinations at authorised provision confirmed per session; Smartious holds no MEC authorisation and issues no Paraguayan certificates.',
  britishCurriculumSuits: 'Paraguay families targeting the Cambridge pathway. Best fit for: (1) Chaco colony families wanting German examined alongside an international academic track, (2) soy belt households wanting Portuguese examined and an agronomy-facing subject set, (3) Ciudad del Este and Encarnación families in border departments with no international provision, (4) Asunción families outside the international tier\'s fees, (5) students needing a subject their school cannot staff.',
  britishCurriculumDelivery: 'Live online classes in the Paraguayan morning or early afternoon, small groups 4-6 students, every session recorded, alongside a Paraguayan school enrolment.',
  ibDiplomaSuits: 'Paraguay families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Paraguay families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Paraguay is unusual in our coverage for how much of its internationally connected population lives outside the capital — German-speaking cooperatives in the Chaco, Portuguese-speaking farms in the east, and trading families on the Triple Frontier — and for how little schooling followed any of them.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the Itaipú and Yacyretá engineering communities and the agricultural science households across the Chaco and the soy belt. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Paraguay\'s international schooling is an Asunción story — the American School of Asunción, Colegio Internacional, St Anne\'s, the German and Italian schools — with IB and American provision and fees at the top of the local market. Outside the capital there is essentially nothing international, which is striking given how much of the country\'s internationally connected population lives in the border departments, the Chaco colonies and the soy belt. Those communities often run good local institutions; what none of them offers is an internationally examined qualification.',
  competitors: [
    { name: 'American School of Asunción, Colegio Internacional',  city: 'Asunción',           curriculum: 'American, IB and international',        feesUsd: 'Top of the Paraguayan market',                      feesAed: 'Premium tier',            rating: 4.6, capacityNote: 'Strong provision — capital-bound and priced accordingly' },
    { name: 'St Anne\'s, Colegio Goethe, Dante Alighieri',        city: 'Asunción',            curriculum: 'British, German and Italian heritage',   feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.4, capacityNote: 'Established heritage schools — different routes, all in the capital' },
    { name: 'Mennonite colony schools',                           city: 'Filadelfia, Loma Plata, Neuland', curriculum: 'German-language community schools', feesUsd: 'Cooperative-supported',                    feesAed: '—',                       rating: 4.2, capacityNote: 'Well run and locally strong — not an internationally examined pathway, which is what we add rather than replace' },
    { name: 'Ciudad del Este and Encarnación',                    city: 'Border departments',  curriculum: 'No international provision',            feesUsd: '—',                                                 feesAed: '—',                       rating: 0,   capacityNote: 'A major commercial economy and two binational dams, neither with international schooling' },
    { name: 'The soy belt',                                       city: 'Eastern departments', curriculum: '—',                                     feesUsd: 'No international option',                           feesAed: '—',                       rating: 0,   capacityNote: 'A globally significant agricultural export region with no international schooling at all' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh (online)',     city: 'Online',              curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious — UK providers are closer to Paraguay on the clock than we are' },
    { name: 'Smartious Homeschool (Paraguay via online delivery)', city: 'Delivered to all Paraguay', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year',                      feesAed: 'PYG equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + German and Portuguese examined + the Chaco, the border and the soy belt reached + the grey area stated honestly' },
  ],

  legalFrameworkIntro: 'Paraguay is a genuine grey area — not a settled prohibition like Costa Rica\'s ministerial position, not a regulated modality like Ecuador\'s, and not a simple silence like Panama\'s. Here is what the texts say and what has actually happened.',
  legalFramework: [
    { h: 'The constitutional and statutory base', p: 'Article 73 of the Paraguayan Constitution establishes the right to education and article 76 makes basic school education compulsory. The Ley General de Educación — Ley 1264 of 26 May 1998 — governs the system, with the Ministerio de Educación y Ciencias as the authority under its Carta Orgánica in Ley 5749; Ley 4088 of 2010 established free preschool and media education. Articles 29 and 32 of Ley 1264 make basic education compulsory including preschool, with Educación Escolar Básica running nine grades, and the compulsory range is reported as approximately six to seventeen — worth confirming with the MEC for a particular child.' },
    { h: 'The provisions that cut the other way', p: 'Two parts of the same statute support parental choice and deserve equal statement. Article 14 of Ley 1264 recognises the family as the natural setting for education. Articles 129 and 130 set out parental rights as well as duties in basic school education. That is a genuine textual basis, and it is why Paraguay reads as a grey area rather than a prohibition — the compulsory-education mandate and the parental-rights provisions sit in tension inside the same law, and no instrument resolves it.' },
    { h: 'What does not exist, and what happens instead', p: 'There is no explicit law authorising or regulating home education in Paraguay, and no formal notification requirement. Families are nonetheless expected to adhere to MEC national curriculum standards and keep records of their children\'s progress and achievements — an expectation without a procedure, which is the definition of operating with uncertainty. In practice, reporting indicates that families outside the formal system frequently rely on examination validation to re-enter it. And commentary records that in Paraguay, as in Bolivia, without clear mention in the norms there have been rulings both in favour of and against educating at home. We think that last fact is the most useful thing a Paraguayan family can know, and it is precisely why we will not give a confident answer.' },
    { h: 'Article 74, and what it means for choosing a provider', p: 'This matters commercially and we would rather state it than have a family discover it. Under article 74 of Ley 1264, private institutions may only grant official certificates or títulos with the authorisation of the Ministerio de Educación y Ciencias, and the título de bachiller requires positive evaluation in all subjects prescribed in the MEC curricular design for all educational institutions. Smartious does not hold MEC authorisation. We do not issue Paraguayan official certificates or títulos and do not claim to. What we deliver are Cambridge, Pearson Edexcel, IB and AP qualifications with their own international validity. Any online provider marketing Paraguayan qualifications should be asked about that article directly.' },
    { h: 'What we therefore build', p: 'Live Cambridge or IB teaching alongside a Paraguayan school enrolment. The school carries the compulsory-education duty and the domestic record that only an MEC-authorised institution can issue; we teach the internationally examined track alongside it. Nothing in that arrangement depends on how the grey area resolves, which is exactly why it is the arrangement we build — and in a country where rulings have gone both ways, that matters more than in most.' },
    { h: 'Languages, and the timezone', p: 'Two practical points that shape Paraguay specifically. First, this is one of the few markets where three languages beyond English genuinely matter: German for the Chaco colonies and the Itapúa settlements, Portuguese for the soy belt and the Brazilian border, and Spanish throughout — all available as examined Cambridge subjects rather than merely spoken at home. Second, the clock: Paraguay runs UTC-3 year-round following the end of seasonal changes, six hours behind our teaching base, so Paraguayan morning and early-afternoon classes both fall in our normal day. Families planning around a fixed weekly slot should confirm current arrangements with us at enrolment.' },
  ],

  whySmartious: [
    { h: 'The grey area described honestly',                               p: 'No explicit law either way, parental-rights provisions in tension with compulsory education, and rulings reportedly going both directions. We state all of it and send families to the MEC.' },
    { h: 'Article 74 disclosed upfront',                                   p: 'Private institutions need MEC authorisation to issue official certificates. We do not hold it and issue nothing domestic — stated before enrolment rather than after.' },
    { h: 'German and Portuguese as examined subjects',                     p: 'For the Chaco colonies and the soy belt, a household language becomes a qualification that German and Brazilian universities read directly.' },
    { h: 'The whole country outside Asunción reached',                     p: 'The Triple Frontier, two binational dams, the Mennonite colonies and one of the world\'s major soy regions — none with international schooling.' },
    { h: 'A workable clock',                                              p: 'Six hours, with Paraguayan mornings and early afternoons both inside our teaching day and turno mañana/tarde leaving most students one free window.' },
    { h: 'Residence stated precisely on three borders',                    p: 'Brazil, Argentina and Paraguay differ sharply, and Paraguay\'s borders are working ones. We say which framework follows a family rather than blurring it.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Paraguay?', a: 'It sits in a genuine grey area. There is no explicit law authorising or regulating it: article 76 of the Constitution makes basic school education compulsory and articles 29 and 32 of Ley 1264 make basic education compulsory including preschool, while article 14 recognises the family as the natural setting for education and articles 129 and 130 set out parental rights. Reporting indicates rulings have gone both ways. Confirm your position with the Ministerio de Educación y Ciencias.' },
    { q: 'Is there a notification process?', a: 'No formal notification requirement exists in law. Families are nonetheless expected to adhere to MEC national curriculum standards and keep records of progress — an expectation without a procedure, which is why families here operate with uncertainty.' },
    { q: 'Can Smartious issue a Paraguayan certificate or título?', a: 'No. Under article 74 of Ley 1264, private institutions may only grant official certificates or títulos with MEC authorisation, and we do not hold it. We teach Cambridge, Edexcel, IB and AP qualifications alongside a Paraguayan school that carries the domestic side.' },
    { q: 'What do families outside the formal system do about qualifications?', a: 'Reporting indicates they frequently rely on examination validation to re-enter formal education. That is a practical description rather than advice — and it is one reason our arrangement runs alongside a school enrolment.' },
    { q: 'Can German or Portuguese be examined?', a: 'Yes, and it matters here more than in most markets. Cambridge German suits the Chaco colonies and Itapúa\'s settlements; Cambridge Portuguese suits the soy belt and the Brazilian border. Both run alongside the English-medium core.' },
    { q: 'We live on a border — whose rules apply?', a: 'Your country of residence rather than where you trade or farm. Brazil\'s Supreme Federal Court has held there is no right to home education there; Argentina makes education obligatory through completion of secondary; Paraguay is a grey area. Your own advisers can confirm your household\'s position.' },
    { q: 'How does the timezone work?', a: 'Paraguay runs UTC-3 year-round, six hours behind our teaching base, so mornings and early afternoons both land in our teaching day. With schools commonly running turno mañana and tarde, most students have one window genuinely free.' },
    { q: 'Which parts of Paraguay does Smartious cover?', a: 'Asunción, Ciudad del Este and the Triple Frontier, Encarnación and Itapúa, Filadelfia and the Chaco, and Santa Rita and the soy belt have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which language your household speaks at home and where in Paraguay you are: German in the Chaco, Portuguese in the soy belt and Spanish throughout all shape the subject plan, and distance shapes the examination one.',
}
