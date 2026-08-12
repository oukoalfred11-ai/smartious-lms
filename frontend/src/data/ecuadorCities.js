// ═══════════════════════════════════════════════════════════════════
// ECUADOR — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for expat, energy, agro-export, and Ecuadorian
// families across Quito, Guayaquil, Cuenca, Manta and the Amazon.
// SEVENTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — ECUADOR NAMES HOMESCHOOLING AS A MODALITY,
// WHICH IS RARE — AND ONE ARTICLE CONSTRAINS US SHARPLY. READ ALL:
// - The Ministerio de Educación recognises "en casa o homeschooling"
//   among the educational modalities alongside presencial,
//   semipresencial, a distancia, and a distancia virtual. That is
//   unusual: most countries we cover do not name it at all.
// - FOUNDATIONAL INSTRUMENT: ACUERDO MINISTERIAL No. 0067-13-A of
//   8 April 2013, under which Educación en Casa is regulated as an
//   "servicio extraordinario", with MINEDUC publishing implementation
//   guidance ("Lineamiento de implementación de Educación en Casa").
// - CURRENT REGULATION: the 2023 acuerdos — MINEDUC-2023-00063-A,
//   the "Normativa para la oferta educativa extraordinaria", and
//   MINEDUC-MINEDUC-2023-00069-A, which regulates educación en casa
//   and sets the procedures for accrediting learning (arts. 31-37).
// - *** THE ARTICLE THAT CONSTRAINS US — ART. 31 ***: educación en
//   casa is a type of NON-FORMAL DISTANCE EDUCATION and its
//   development is the EXCLUSIVE RESPONSIBILITY OF THE FAMILY. A
//   private, municipal or fiscomisional school MAY NOT offer
//   homeschooling as though it were an ordinary school modality, NOR
//   directly issue promotions or titles for that service.
//   CONSEQUENCE — ABSOLUTE: Smartious must NEVER present itself as
//   providing "educación en casa" as a school service in Ecuador,
//   never imply it issues Ecuadorian promotions or títulos, and never
//   suggest a family's Ecuadorian accreditation runs through us. We
//   teach Cambridge, Edexcel, IB and AP. Full stop.
// - Art. 32: educación en casa may be developed in the family
//   environment, individually or in a group.
// - ACCREDITATION: for learning to have official recognition, the
//   student must sit evaluations before the education system.
// - TWO DISTINCT EXTRAORDINARY OFFERINGS — families confuse them and
//   the confusion is costly. Explain both:
//   * EDUCACIÓN ABIERTA: the child is formally ENROLLED at an
//     accredited Ecuadorian public or private school licensed to
//     offer a distance programme. Commonly the more practical route
//     for expatriate families.
//   * EDUCACIÓN EN CASA: non-formal, the family's exclusive
//     responsibility, accredited by evaluation before the system.
// - THE NATIONAL CURRICULUM IS MANDATORY: any programme must adhere
//   to the currículo nacional obligatorio's learning objectives.
// - CONSTITUTIONAL BASE: art. 26 recognises education as a lifelong
//   right with family participation; art. 29 provides that parents
//   are free to choose for their children an education in accordance
//   with their principles, beliefs and pedagogical choices; LOEI
//   art. 12 confirms the right to choose the type of institution.
//   LOEI art. 50 makes non-formal education optional, complementary
//   and flexible; art. 62 regulates presencial, semipresencial and
//   a distancia.
// - ENFORCEMENT RISK — STATE IT HONESTLY: reporting indicates that
//   families who attempted home education WITHOUT meeting the
//   conditions in the acuerdo have been brought before the District
//   Board of Protection of Children and Adolescents and required to
//   enrol their children. Mention this plainly; it is the reason
//   the conditions matter.
// - Compulsory education is reported as running roughly ages five to
//   seventeen, covering inicial, básica and bachillerato. Cite it as
//   reported and tell families to confirm with MINEDUC.
// TIMEZONE: ECT (UTC-5) on the mainland, no daylight saving —
// EIGHT HOURS behind Nairobi, same as Colombia and Peru. Our teaching
// Two teaching teams = classes available across the full day. Ecuadorian schools commonly
// run jornada matutina and vespertina, so a vespertina student has
// mornings free. Galápagos runs UTC-6, an hour further.
// MARKET NOTE: Quito and Guayaquil hold the international tier
// (Academia Cotopaxi, Colegio Menor, Inter-American Academy, the
// German and French schools) with a substantial IB presence. Cuenca
// has one of the largest North American retiree and expatriate
// communities in Latin America — and a visible expat home-education
// demand. Economy: Quito's government and services; Guayaquil's port,
// banana, shrimp and agro-export complex; Cuenca's expat, artisan and
// university economy; Manta's tuna, fishing and port sector; and the
// Amazon oil region around Coca and Lago Agrio.
// ═══════════════════════════════════════════════════════════════════

export const ECUADOR_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'quito-ec',
    name: 'Quito',
    county: 'Pichincha',
    region: 'The capital and government centre · the diplomatic and development community · the country\'s deepest international school tier with a substantial IB presence · the Andean highlands',
    primaryKeyword: 'Online school and international curriculum in Quito',
    heroTagline: 'For Quito families — Cambridge and IB taught live in the morning, in the one Andean country that actually names homeschooling in its regulations.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Quito families. The capital holds Ecuador\'s government, its diplomatic and development community, and the country\'s deepest international school tier — Academia Cotopaxi, Colegio Menor, the Inter-American Academy, the German and French schools — with a substantial IB presence and fees at the top of the Ecuadorian market. Ecuador is also unusual: its Ministry of Education names educación en casa among the recognised modalities and regulates it by ministerial acuerdo. That matters, and so does one article inside it that determines exactly what a provider like us may and may not claim.',
    heroImg: '/heroes/quito-ec.jpg',
    altTexts: { hero: 'Quito and the Andean highlands' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Quito families — the educación en casa rules explained precisely, morning classes. From USD 400/month.',
    challenges: [
      'International school fees in Quito sit at the top of the Ecuadorian market, with competitive places.',
      'Educación en casa and educación abierta are two different routes, and families confuse them at real cost.',
      'The national curriculum is mandatory, and official recognition requires evaluation before the education system.',
      'We teach eight hours ahead, so our classes land in the Ecuadorian morning, not the afternoon.',
      'Time zone: mainland Ecuador runs ECT (UTC-5) with no daylight saving — a fixed eight-hour gap behind Nairobi.',
    ],
    familySituations: [
      'Diplomatic, development, and international-organisation families.',
      'Government, corporate, and professional households outside the international tier\'s fees.',
      'Students in jornada vespertina whose mornings are free.',
      'Families pursuing educación abierta or educación en casa who want an internationally examined academic spine.',
      'Students targeting UK, American, Spanish, or Ecuadorian universities.',
    ],
    nearbyAreas: ['Cumbayá and Tumbaco', 'La Carolina', 'González Suárez', 'Valle de los Chillos', 'Nayón', 'Sangolquí', 'Otavalo'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French, German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Ecuadorian university applications',
    ],
    whyChoose: [
      ['The two extraordinary routes explained apart', 'Educación abierta means enrolment at an accredited Ecuadorian school with a distance programme; educación en casa is non-formal and the family\'s own responsibility. Families confuse them, and we set them out separately.'],
      ['Honest about what article 31 means for us', 'A school may not offer homeschooling as an ordinary modality or issue promotions for it. We do not claim to provide educación en casa, and we do not issue Ecuadorian títulos — we teach Cambridge, Edexcel, IB and AP.'],
      ['Morning classes that fit the jornada vespertina', 'We are eight hours ahead, so our block lands in the Ecuadorian morning — the free half of the day for afternoon-shift students.'],
      ['A fee gap against the capital tier', 'Live small-group teaching at USD 2,160-6,480 a year.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core, protecting Ecuadorian and Spanish university routes.'],
    ],
    growingReason: 'Quito holds Ecuador\'s government, its diplomatic and development community, and the country\'s deepest international school tier with a substantial IB presence — inside a framework that, unusually, names educación en casa among the recognised modalities. Mainland Ecuador runs ECT (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Quito families, taught in the Ecuadorian morning alongside a school enrolment or as the academic spine behind an extraordinary route the family arranges itself. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Quito families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the city\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Ecuador is one of the few countries in our coverage whose ministry names homeschooling as a modality rather than ignoring it, and the regulation deserves setting out carefully. The Ministerio de Educación recognises educación en casa alongside presencial, semipresencial, a distancia and a distancia virtual. The foundational instrument is Acuerdo Ministerial No. 0067-13-A of 8 April 2013, which regulates Educación en Casa as an extraordinary service; the current framework sits in the 2023 acuerdos, including the Normativa para la oferta educativa extraordinaria and the acuerdo regulating educación en casa and the procedures for accrediting learning. Article 31 is the provision that matters most, both for families and for us: educación en casa is a type of non-formal distance education, its development is the exclusive responsibility of the family, and a private, municipal or fiscomisional school may not offer homeschooling as though it were an ordinary school modality nor directly issue promotions or títulos for that service. We state the consequence plainly — Smartious does not provide educación en casa as a school service, does not issue Ecuadorian promotions or títulos, and is not an accredited Ecuadorian institution. We teach Cambridge, Pearson Edexcel, IB and AP qualifications with their own international validity. Two further points families need. The national curriculum is mandatory, so any programme must address its learning objectives, and for learning to gain official recognition the student must sit evaluations before the education system. And there are two distinct extraordinary offerings that are frequently confused: educación abierta, where the child is formally enrolled at an accredited Ecuadorian school licensed to run a distance programme — often the more practical route for expatriate families — and educación en casa, which is non-formal and the family\'s own responsibility. Choosing the wrong one creates real bureaucratic difficulty. Reporting also indicates that families who attempted home education without meeting the acuerdo\'s conditions have been brought before the District Board of Protection of Children and Adolescents and required to enrol their children, which is why the conditions are worth taking seriously rather than skimming. Confirm your position with MINEDUC and your distrito educativo.',
    homeTuitionDetail: 'Smartious delivers to Quito families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Ecuadorian morning. With a fixed eight-hour gap and no daylight saving on either side, a 07:00-10:00 Ecuadorian block sits in our normal late-afternoon teaching hours every week of the year, with all sessions recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Ecuador?', a: 'Ecuador names educación en casa among the recognised modalities and regulates it — the foundational instrument is Acuerdo Ministerial No. 0067-13-A of 2013, with the current framework in the 2023 acuerdos. It is treated as non-formal distance education and is the family\'s exclusive responsibility, with official recognition obtained by sitting evaluations before the education system. Confirm your own position with MINEDUC and your distrito educativo, because families who have not met the conditions have faced enforcement.' },
      { q: 'What is the difference between educación abierta and educación en casa?', a: 'Educación abierta means the child is formally enrolled at an accredited Ecuadorian school licensed to offer a distance programme — often the more practical route for expatriate families. Educación en casa is non-formal, developed under the family\'s own responsibility, with learning accredited by evaluation before the system. They are separate offerings and choosing the wrong one creates real difficulty.' },
      { q: 'Can Smartious provide educación en casa for us?', a: 'No, and the regulation is explicit about why. Article 31 provides that a school may not offer homeschooling as though it were an ordinary school modality, nor directly issue promotions or títulos for that service — and educación en casa is the family\'s exclusive responsibility. We are not an accredited Ecuadorian institution. We teach Cambridge, Edexcel, IB and AP qualifications alongside whatever Ecuadorian arrangement a family holds.' },
      { q: 'What are the class times?', a: 'We are eight hours ahead, so our classes land in the Ecuadorian morning. For a student in jornada vespertina that is the free half of the day. After-school and morning blocks are both available, since we run two teaching teams in different time zones.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'guayaquil-ec',
    name: 'Guayaquil',
    county: 'Guayas',
    region: 'The commercial capital and principal port · the banana, shrimp and agro-export complex feeding global markets · banking and industry · a strong private school sector',
    primaryKeyword: 'Online school and international curriculum in Guayaquil',
    heroTagline: 'For Guayaquil families — Ecuador\'s commercial engine, exporting to three continents and schooling for one city.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Guayaquil families. Guayaquil is Ecuador\'s commercial capital and principal port — the banana, shrimp and agro-export complex that makes the country one of the world\'s largest suppliers of both, alongside banking, industry, and a substantial private school sector. Its export businesses trade with Europe, North America, and Asia every day. Smartious teaches Cambridge and IB live in the Ecuadorian morning, alongside a school enrolment or as the academic spine behind whichever extraordinary route a family arranges with MINEDUC.',
    heroImg: '/heroes/guayaquil-ec.jpg',
    altTexts: { hero: 'Guayaquil and the Guayas river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Guayaquil families — commercial capital and agro-export hub, morning classes. From USD 400/month.',
    challenges: [
      'A globally trading export economy with an international school tier priced at the top of the market.',
      'Educación en casa and educación abierta are separate routes and families confuse them.',
      'The national curriculum is mandatory, and recognition requires evaluation before the education system.',
      'We teach eight hours ahead, so our classes land in the Ecuadorian morning.',
      'Time zone: Guayaquil shares ECT (UTC-5) with no daylight saving.',
    ],
    familySituations: [
      'Banana, shrimp, and agro-export business families trading globally.',
      'Port, shipping, and logistics households.',
      'Banking, industry, and professional families outside the international tier\'s fees.',
      'Students in jornada vespertina with mornings free.',
      'Students targeting UK, American, or Spanish universities.',
    ],
    nearbyAreas: ['Samborondón', 'Urdesa', 'Ceibos', 'Vía a la Costa', 'Durán', 'Daule', 'Salinas'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Biology, Chemistry, Economics, Business',
      'Cambridge A-Level Physics, Geography, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Ecuadorian university applications',
    ],
    whyChoose: [
      ['Economics and business depth for an export capital', 'Cambridge A-Level Economics, Business, and Mathematics suit the families who run Ecuador\'s trade into global markets.'],
      ['Biology and agricultural science for the agro complex', 'Cambridge A-Level Biology and Chemistry feed agronomy, food science, and aquaculture routes — directly relevant to a shrimp and banana economy.'],
      ['Morning classes that fit the jornada vespertina', 'Our block lands in the Ecuadorian morning, free for every afternoon-shift student.'],
      ['The two extraordinary routes explained apart', 'Educación abierta and educación en casa are different things; we set them out separately and say what we are not.'],
      ['A fee gap against the top of the market', 'Live small-group teaching at USD 2,160-6,480 a year.'],
    ],
    growingReason: 'Guayaquil is Ecuador\'s commercial capital and principal port — the banana, shrimp and agro-export complex that makes the country a leading global supplier of both, alongside banking and industry — with an international tier priced at the top of the market. Ecuador runs ECT (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Guayaquil, taught in the Ecuadorian morning alongside a school enrolment or an extraordinary route the family arranges.',
      cbc: 'Kenya CBC available for Guayaquil families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Guayas. Ecuador names educación en casa among its modalities and regulates it through Acuerdo Ministerial No. 0067-13-A of 2013 and the 2023 acuerdos, which treat it as non-formal distance education developed under the family\'s exclusive responsibility — with a school prohibited from offering it as an ordinary modality or issuing promotions or títulos for it. Educación abierta, where a child is formally enrolled at an accredited Ecuadorian school running a distance programme, is a separate offering and often the more practical route for internationally mobile families. The national curriculum is mandatory and official recognition requires evaluation before the education system. Smartious is not an accredited Ecuadorian institution, does not provide educación en casa, and does not issue Ecuadorian promotions — we teach Cambridge, Edexcel, IB and AP alongside whatever arrangement a family holds. Confirm your position with MINEDUC and your distrito educativo.',
    homeTuitionDetail: 'Smartious delivers to Guayaquil families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Ecuadorian morning on a fixed eight-hour offset, with every session recorded.',
    faqs: [
      { q: 'Our business exports to Europe and Asia — which qualification travels best?', a: 'Cambridge A-Levels are read natively by UK universities through UCAS and directly by American, Canadian, and Spanish institutions, and are accepted in 160+ countries. For a family whose children may study anywhere, that breadth is the argument.' },
      { q: 'Where do Guayaquil students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with capacity checked per series.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'cuenca-ec',
    name: 'Cuenca',
    county: 'Azuay',
    region: 'One of the largest North American expatriate and retiree communities in Latin America · a UNESCO colonial centre · a strong university sector · a visible expat home-education demand',
    primaryKeyword: 'Online school and international curriculum in Cuenca',
    heroTagline: 'For Cuenca families — the expatriate capital of the Andes, where more households ask about home education than anywhere else in Ecuador.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Cuenca families. Cuenca has drawn one of the largest North American expatriate and retiree communities in Latin America to a UNESCO-listed colonial city with a serious university sector, and with those families has come a visible demand for home education — enough that Ecuadorian lawyers now publish guidance on it for foreigners in Cuenca specifically. That demand collides with a regulation most arrivals have not read. We teach Cambridge and IB live in the Ecuadorian morning, and we set out the rules before anything else.',
    heroImg: '/heroes/cuenca-ec.jpg',
    altTexts: { hero: 'Cuenca colonial centre' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Cuenca families — the expat capital of the Andes, with the educación en casa rules explained. From USD 400/month.',
    challenges: [
      'A large expatriate community arriving with assumptions about home education that Ecuadorian regulation does not match.',
      'Educación abierta and educación en casa are different routes, and the wrong choice creates real difficulty.',
      'The national curriculum is mandatory, and recognition requires evaluation before the education system.',
      'Families who have not met the acuerdo\'s conditions have faced enforcement.',
      'We teach eight hours ahead, so our classes land in the Ecuadorian morning.',
    ],
    familySituations: [
      'North American and European expatriate and retiree households with school-age children.',
      'Families who arrived expecting an unregulated home-education environment.',
      'Remote-work households drawn to the city and the cost of living.',
      'University and academic families.',
      'Students in jornada vespertina with mornings free.',
    ],
    nearbyAreas: ['Cuenca centro histórico', 'Challuabamba', 'Ricaurte', 'Baños', 'Gualaceo', 'Azogues', 'Loja'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, History, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP US History',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Ecuadorian university applications',
    ],
    whyChoose: [
      ['The regulation explained before the sale', 'Most expatriate families in Cuenca arrive believing home education here is unregulated. It is named, regulated, and conditioned — and families who ignored the conditions have faced enforcement. We say that on the page.'],
      ['Educación abierta is often the better route for expats', 'Formal enrolment at an accredited Ecuadorian school with a distance programme is usually simpler for a foreign family than the non-formal route, and we explain why rather than steering.'],
      ['A record that travels home again', 'North American families frequently return. Cambridge and AP records are read directly by US and Canadian universities, unlike a purely local record.'],
      ['Morning classes that fit the jornada vespertina', 'Our block lands in the Ecuadorian morning, free for every afternoon-shift student.'],
      ['Honest about what we are not', 'Not an accredited Ecuadorian institution, and not a provider of educación en casa. We teach Cambridge, Edexcel, IB and AP.'],
    ],
    growingReason: 'Cuenca has drawn one of the largest North American expatriate and retiree communities in Latin America to a UNESCO colonial city with a serious university sector — and with it a visible home-education demand that Ecuadorian regulation treats far more specifically than most arrivals expect. Ecuador runs ECT (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Cuenca, taught in the Ecuadorian morning alongside a school enrolment or an extraordinary route the family arranges with MINEDUC.',
      cbc: 'Kenya CBC available for Cuenca families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for the many North American families here targeting US universities.',
    },
    homeschoolDetail: 'Cuenca deserves the fullest version of this explanation, because more families here arrive with the wrong assumption than anywhere else in Ecuador. Home education is not unregulated in this country. The Ministerio de Educación names educación en casa among the recognised modalities; Acuerdo Ministerial No. 0067-13-A of 8 April 2013 regulates it as an extraordinary service; and the 2023 acuerdos — including the Normativa para la oferta educativa extraordinaria — set out the current framework and the procedures for accrediting learning. Under article 31, educación en casa is non-formal distance education and its development is the exclusive responsibility of the family, with schools prohibited from offering it as an ordinary modality or issuing promotions or títulos for it. There are two separate extraordinary offerings and the distinction is where expatriate families most often go wrong: educación abierta means formal enrolment at an accredited Ecuadorian school licensed to run a distance programme, which is frequently the more practical route for a foreign family; educación en casa is the non-formal route under the family\'s own responsibility, with learning accredited by evaluation before the system. The national curriculum is mandatory in either case. And reporting indicates that families who attempted home education without meeting the acuerdo\'s conditions have been brought before the District Board of Protection of Children and Adolescents and required to enrol their children. None of that makes home education impossible here — it makes it a documented process rather than an assumption. Confirm your own position with MINEDUC and your distrito educativo. Smartious is not an accredited Ecuadorian institution and does not provide educación en casa; we teach Cambridge, Edexcel, IB and AP alongside whatever arrangement you hold.',
    homeTuitionDetail: 'Smartious delivers to Cuenca families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Ecuadorian morning on a fixed eight-hour offset, with every session recorded — which suits households that set their own schedule.',
    faqs: [
      { q: 'We moved here assuming homeschooling was unregulated — is it?', a: 'No. Ecuador names educación en casa as a modality and regulates it by ministerial acuerdo, with conditions, a mandatory national curriculum, and accreditation by evaluation before the education system. Families who did not meet the conditions have faced enforcement through the child-protection boards. It is a documented process rather than an open field.' },
      { q: 'Which route should an expatriate family use?', a: 'Many find educación abierta simpler — formal enrolment at an accredited Ecuadorian school licensed to run a distance programme — rather than the non-formal educación en casa route. We explain the difference rather than steer, and the choice belongs with you, MINEDUC, and your distrito educativo.' },
      { q: 'We may return to the US or Canada — does that affect the choice?', a: 'It affects the qualification. Cambridge and AP records are read directly by American and Canadian universities, whereas a purely local record requires equivalence assessment. For a family who may go home, that is the practical argument for an internationally examined track.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'manta-ec',
    name: 'Manta & the Coast',
    county: 'Manabí',
    region: 'The tuna and fishing capital — one of the largest tuna processing centres in the Americas · a deep-water port · a coastal expatriate and surf community · agro-industry across Manabí',
    primaryKeyword: 'Online school and international curriculum in Manta',
    heroTagline: 'For Manta and Manabí families — a global tuna industry and a coastal expat belt, four hours from the nearest international school.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Manta and Manabí families. Manta runs one of the largest tuna fishing and processing complexes in the Americas, with a deep-water port, an international seafood trade, and the industrial and agro-processing economy of Manabí behind it — alongside a growing coastal expatriate and remote-work community strung along the beaches north and south. International schooling is in Quito and Guayaquil, hours away. Smartious teaches Cambridge and IB live to the coast in the Ecuadorian morning.',
    heroImg: '/heroes/manta-ec.jpg',
    altTexts: { hero: 'Manta port and the Ecuadorian coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Manta and Manabí families — tuna capital and coastal expat belt, no local provision. From USD 400/month.',
    challenges: [
      'No international schooling on the coast, with Quito and Guayaquil hours away.',
      'A coastal expatriate community spread along the beaches rather than clustered near a campus.',
      'Educación en casa and educación abierta are separate routes with different requirements.',
      'We teach eight hours ahead, so our classes land in the Ecuadorian morning.',
      'Time zone: Manta shares ECT (UTC-5) with no daylight saving.',
    ],
    familySituations: [
      'Tuna, fishing, and seafood-processing business families.',
      'Port, shipping, and export households.',
      'Coastal expatriate, surf, and remote-work communities.',
      'Agro-industrial families across Manabí.',
      'Students in jornada vespertina with mornings free.',
    ],
    nearbyAreas: ['Manta', 'Montecristi', 'Portoviejo', 'Bahía de Caráquez', 'Puerto López', 'Canoa', 'Salinas'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Geography, Physics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Ecuadorian university applications',
    ],
    whyChoose: [
      ['The complete option on a coast with none', 'Identical live delivery in Manta and Quito — no relocation, no boarding decision.'],
      ['Marine biology and environmental science that fit the place', 'A tuna and fishing economy on the Pacific makes unusually good context for Cambridge Biology and Geography and AP Environmental Science.'],
      ['Reaches the beach communities', 'Bahía, Canoa, and Puerto López get identical live teaching without a commute.'],
      ['Morning classes that fit the jornada vespertina', 'Our block lands in the Ecuadorian morning, free for every afternoon-shift student.'],
      ['The regulation explained properly', 'Educación abierta and educación en casa set out separately, with what we are not stated plainly.'],
    ],
    growingReason: 'Manta runs one of the largest tuna fishing and processing complexes in the Americas with a deep-water port and an international seafood trade, alongside Manabí\'s agro-industry and a growing coastal expatriate community — with international schooling hours away in Quito and Guayaquil. Ecuador runs ECT (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the coast, taught in the Ecuadorian morning alongside a school enrolment or an extraordinary route the family arranges.',
      cbc: 'Kenya CBC available for coastal families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies on the coast: educación en casa is a named modality regulated by Acuerdo Ministerial No. 0067-13-A and the 2023 acuerdos, treated as non-formal distance education under the family\'s exclusive responsibility, with schools prohibited from offering it as an ordinary modality or issuing promotions for it; educación abierta, through formal enrolment at an accredited Ecuadorian school with a distance programme, is a separate and often more practical route. The national curriculum is mandatory and recognition requires evaluation before the education system. Smartious is not an accredited Ecuadorian institution and does not provide educación en casa. Confirm your position with MINEDUC and your distrito educativo.',
    homeTuitionDetail: 'Smartious delivers to coastal families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Ecuadorian morning on a fixed eight-hour offset, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Manta?', a: 'None — the tier is in Quito and Guayaquil, hours away. Live online delivery reaches the whole coast identically.' },
      { q: 'Our child is interested in marine biology — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Geography or Mathematics, planned backward from the target university from IGCSE onward.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'coca-ec',
    name: 'Coca, Lago Agrio & the Amazon',
    county: 'Orellana and Sucumbíos',
    region: 'Ecuador\'s oil heartland — the Amazon fields and the trans-Andean pipeline · an internationally recruited technical workforce · rainforest communities hours from any city · essentially no international schooling',
    primaryKeyword: 'Online school and international curriculum in Coca and the Ecuadorian Amazon',
    heroTagline: 'For Coca, Lago Agrio and Amazon families — Ecuador\'s oil economy, run from the rainforest with schooling built for a frontier town.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across Ecuador\'s Amazon oil region. Orellana and Sucumbíos hold the fields that have funded much of the national economy for half a century — the operations around Coca and Lago Agrio, the trans-Andean pipeline, and a technical workforce of engineers, geologists, and operations management recruited from across the Americas and beyond, much of it rotational. Quito is a flight or a long road over the Andes. International schooling in the region does not exist. Smartious teaches live to the Amazon in the Ecuadorian morning.',
    heroImg: '/heroes/coca-ec.jpg',
    altTexts: { hero: 'The Ecuadorian Amazon and the Napo river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Coca, Lago Agrio and Amazon families — Ecuador\'s oil heartland, no international schooling. From USD 400/month.',
    challenges: [
      'An internationally recruited oil workforce with no international schooling in the region.',
      'Quito is a flight or a long road journey over the Andes.',
      'Rotational contracts split households across countries for much of the year.',
      'Educación en casa and educación abierta are separate routes with different requirements.',
      'We teach eight hours ahead, so our classes land in the Ecuadorian morning.',
    ],
    familySituations: [
      'Oil operations, drilling, and engineering families — Ecuadorian and international.',
      'Oilfield-services and contractor households on rotational postings.',
      'Pipeline, logistics, and camp-support families.',
      'Households split between the Amazon and a base elsewhere.',
      'Students aiming at petroleum engineering, geoscience, or environmental programmes abroad.',
    ],
    nearbyAreas: ['El Coca (Francisco de Orellana)', 'Lago Agrio', 'Shushufindi', 'Joya de los Sachas', 'Tena', 'Puyo', 'the Napo corridor'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Geography',
      'Cambridge A-Level Biology, Economics, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including petroleum and geoscience programmes), Common Application (US), and Canadian and Ecuadorian university applications',
    ],
    whyChoose: [
      ['The energy-rotation case, run in eleven countries', 'Stavanger, Baku, Hassi Messaoud, Cabinda, Takoradi, Macaé, Neuquén — and now the Oriente. One live pathway across every posting.'],
      ['Geoscience and engineering depth', 'Cambridge A-Level Physics, Chemistry, Mathematics, and Geography — the spine an oil workforce\'s children aim at.'],
      ['An alternative to a separated household', 'Amazon families have kept children in Quito or abroad for decades. Live teaching reaches the field instead.'],
      ['Environmental science that fits a difficult place honestly', 'The Oriente is one of the most studied environments on earth. Cambridge Geography and AP Environmental Science make serious use of that.'],
      ['Portable to the next basin', 'Coca now, Colombia, Peru, the Gulf, or West Africa next — the curriculum and the board stay constant.'],
    ],
    growingReason: 'Orellana and Sucumbíos hold Ecuador\'s Amazon oil fields — the operations around Coca and Lago Agrio and the trans-Andean pipeline — with an internationally recruited rotational workforce, Quito a flight or a long road over the Andes, and no international schooling in the region. Ecuador runs ECT (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Amazon region, portable across postings. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for Amazon families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in the Oriente: educación en casa is a named modality regulated by Acuerdo Ministerial No. 0067-13-A and the 2023 acuerdos, treated as non-formal distance education under the family\'s exclusive responsibility, with schools prohibited from offering it as an ordinary modality; educación abierta, through enrolment at an accredited Ecuadorian school with a distance programme, is a separate route. Notably, the original conditions in the acuerdo contemplated circumstances including a family living far from an educational institution — which describes a great many Amazon households directly, though whether it applies to yours is for MINEDUC and your distrito educativo to say rather than us. The national curriculum is mandatory and recognition requires evaluation before the system. Smartious is not an accredited Ecuadorian institution and does not provide educación en casa. Families not resident in Ecuador follow their country of residence\'s framework, a status they determine with their own advisers.',
    homeTuitionDetail: 'Smartious delivers to Amazon families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Ecuadorian morning on a fixed eight-hour offset, with every session recorded — built for rotations, camps, and remote sites.',
    faqs: [
      { q: 'We are on an Amazon rotation — does the schooling follow us?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next basin anywhere in the world, with examinations sat at authorised centres wherever the family is.' },
      { q: 'Does living far from a school affect our position?', a: 'The acuerdo\'s conditions have contemplated circumstances including distance from an educational institution, which describes many Amazon households. Whether it applies to yours is for MINEDUC and your distrito educativo to determine, not for us to assert.' },
      { q: 'Is there any international schooling in the Oriente?', a: 'None. Quito is a flight or a long road over the Andes. Live delivery is the route that reaches the field without splitting a household.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const ECUADOR_COUNTRY = {
  slug: 'ecuador',
  name: 'Ecuador',
  longName: 'Republic of Ecuador',
  adjective: 'Ecuadorian',
  flag: '🇪🇨',
  hub: '/online-school/ecuador',
  hubPageId: 'homeschooling-ecuador',
  cityPageId: 'ecuador-city',

  currency: 'USD',
  currencyName: 'United States Dollar',
  currencyPeg: 'Ecuador is dollarised, so our fees are quoted and invoiced in the currency families already use — no exchange-rate exposure at all.',

  timezone: {
    code: 'ECT',
    name: 'Ecuador Time (UTC-5) on the mainland, no daylight saving; Galápagos runs UTC-6',
    utcOffset: '-5',
    offsetFromEAT: '-8 hours — our teaching lands in the Ecuadorian morning, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Ecuador has established Cambridge provision through its international school sector'],
  examCentreTiles: [
    { city: 'Quito', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Guayaquil', centre: 'Regional provision', area: 'Checked first for coastal and southern families.' },
    { city: 'The regions', centre: 'Planned per session', area: 'Cuenca, Manta, and Amazon families plan travel into each window well ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Ecuador-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — Quito is checked first, with Guayaquil for the coast and travel planned ahead from Cuenca, Manta, and the Amazon. Ecuador has a second and entirely separate accreditation question that we do not handle and should not be confused with ours: where a family is following educación en casa, official recognition of learning is obtained by sitting evaluations before the Ecuadorian education system under the applicable acuerdo, and where a family is in educación abierta, the accredited Ecuadorian school running the distance programme handles promotion. Neither runs through Smartious. What we plan is the Cambridge or IB calendar around whichever Ecuadorian arrangement a family holds.',
  secondaryProgrammeExamRef: 'Authorised Ecuadorian Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/ecuador.jpg',
  heroEyebrow: 'Online school for Ecuador',
  heroH1Suffix: 'Ecuador',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for expatriate, energy, agro-export, and Ecuadorian families across Quito, Guayaquil, Cuenca, Manta, and the Amazon. Ecuador is one of the few countries anywhere that names educación en casa as a modality and regulates it — and one article in that regulation determines exactly what a provider like us may claim. We set both out before anything else. Fees in USD, because Ecuador already uses it.',
  heroValueProp: 'From USD 180/month, quoted in the currency you already use. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — morning teaching.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Ecuador',

  citiesSectionTitle: 'Where our Ecuador families are',
  citiesSectionBody: 'Smartious Ecuador families concentrate across Quito (the capital, the diplomatic community, and the country\'s deepest international tier), Guayaquil (the commercial capital and the banana, shrimp and agro-export complex trading with three continents), Cuenca (one of the largest North American expatriate communities in Latin America, and the city where home-education questions arrive most often), Manta and the coast (a global tuna industry and a coastal expat belt with no local provision), and Coca, Lago Agrio and the Amazon (Ecuador\'s oil heartland, run from the rainforest with schooling built for a frontier town). One named and regulated modality, two extraordinary routes families confuse, and a morning teaching window.',

  trustSignals: [
    { h: 'Dollarised, so no exchange-rate exposure', p: 'Ecuador uses the US dollar, and our fees are quoted and invoiced in USD. For an Ecuadorian family that removes the currency question entirely — unusual in Latin America and worth saying plainly.' },
    { h: 'The regulation set out, including what limits us', p: 'Ecuador names educación en casa as a modality and regulates it by ministerial acuerdo. Article 31 makes it non-formal, the family\'s exclusive responsibility, and prohibits schools from offering it as an ordinary modality or issuing promotions for it. We state that because it defines what we cannot claim.' },
    { h: 'Two extraordinary routes, explained apart', p: 'Educación abierta means enrolment at an accredited Ecuadorian school running a distance programme. Educación en casa is the non-formal family route. Expatriate families confuse them and pay for it in bureaucracy; we separate them clearly.' },
    { h: 'Morning teaching, and why it fits Ecuador', p: 'We are eight hours ahead, so our classes land in the Ecuadorian morning. Schools commonly run jornada matutina and vespertina — and for an afternoon-shift student, our block is precisely the free half of the day.' },
  ],

  universitiesInCountry: 'Universidad San Francisco de Quito, Pontificia Universidad Católica del Ecuador, Universidad de Especialidades Espíritu Santo, ESPOL in Guayaquil, Universidad de Cuenca, and Yachay Tech — with several institutions teaching substantially in English.',
  universityChannels: 'Ecuadorian universities admit on the bachillerato and their own admission processes, and foreign qualifications go through homologación and recognition procedures with requirements confirmed per case — a family intending to enter Ecuadorian higher education should begin that early, and note that the Ministry has described a route in which a foreign institution\'s certification of a home-educated student\'s academic work may be homologated domestically. Outward, Ecuadorian students are strongly oriented toward the United States — reinforced by dollarisation and by the size of the North American community here — with Spain and Canada following, and all of them read Cambridge A-Levels, the IB Diploma, and AP records directly. UCAS reads A-Levels natively, and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across US, Spanish, Canadian, UK (UCAS), and Ecuadorian destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Ecuador families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes in the Ecuadorian morning on a fixed eight-hour offset with no seasonal drift — which fits students in jornada vespertina and full-time learners — run alongside a school enrolment or as the academic spine behind whichever extraordinary route a family arranges with MINEDUC. Fees quoted in USD, the currency Ecuador already uses. Examinations at authorised provision confirmed per session.',
  britishCurriculumSuits: 'Ecuador families targeting the Cambridge pathway. Best fit for: (1) expatriate families in Cuenca and the coast who need the regulation explained before they act, (2) oil families in the Amazon where no provision exists, (3) Manta and coastal households hours from any campus, (4) Quito and Guayaquil families outside the international tier\'s fees, (5) students in jornada vespertina whose mornings are free.',
  britishCurriculumDelivery: 'Live online classes in the Ecuadorian morning, small groups 4-6 students, every session recorded, alongside a school enrolment or a family-arranged extraordinary route.',
  ibDiplomaSuits: 'Ecuador families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Ecuador families targeting US universities via Common Application — the single most common overseas destination, reinforced by dollarisation and the size of the North American community.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Ecuador is one of the few countries anywhere whose ministry names homeschooling as a modality — and one of the few where a regulation tells a provider directly what it may not claim, which we would rather quote than work around.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the Amazon\'s petroleum and geoscience families, Manta\'s marine-industry households, and every medicine-bound student in Quito and Guayaquil. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Ecuador\'s international schooling concentrates in Quito and Guayaquil and is genuinely good — Academia Cotopaxi, Colegio Menor, the Inter-American Academy, the German and French schools, with a substantial IB presence — and priced at the top of the local market. Outside those two cities it thins to almost nothing: Cuenca hosts one of the largest expatriate communities in Latin America without a matching tier, Manta and the coast have none, and the Amazon oil region has none at all. There is also an Ecuadorian sector of accredited schools licensed to offer educación abierta distance programmes, which is a different service from ours and often the right one for a family needing Ecuadorian accreditation.',
  competitors: [
    { name: 'Academia Cotopaxi, Colegio Menor, Inter-American Academy', city: 'Quito',        curriculum: 'American, IB and international',        feesUsd: 'Top of the Ecuadorian market',                      feesAed: 'Premium tier',            rating: 4.7, capacityNote: 'Long-established and strong — the national benchmark' },
    { name: 'Guayaquil international and bilingual schools',   city: 'Guayaquil',             curriculum: 'IB, American and bilingual',            feesUsd: 'Premium tier',                                      feesAed: 'Competitive places',      rating: 4.4, capacityNote: 'A real second centre — still concentrated in one city' },
    { name: 'Accredited educación abierta providers',          city: 'Nationwide',            curriculum: 'Ecuadorian national, distance modality', feesUsd: 'Local pricing',                                    feesAed: '—',                       rating: 4.1, capacityNote: 'They hold the Ecuadorian accreditation and issue promotions; we do not. Often the right choice for families needing domestic recognition' },
    { name: 'Cuenca',                                          city: 'Azuay',                 curriculum: 'Thin relative to its expat community',  feesUsd: 'Limited international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'One of Latin America\'s largest expatriate communities without a matching school tier' },
    { name: 'The coast and the Amazon',                        city: 'Manta, Coca, Lago Agrio', curriculum: '—',                                   feesUsd: 'No international provision',                         feesAed: '—',                       rating: 0,   capacityNote: 'A global tuna industry and an oil heartland, neither with international schooling' },
    { name: 'US-based online schools',                         city: 'Online',                curriculum: 'American online',                       feesUsd: 'Varies, often per-course',                          feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Closer to Ecuador on the clock than we are — families should weigh that against price and class size' },
    { name: 'Smartious Homeschool (Ecuador via online delivery)', city: 'Delivered to all Ecuador', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'Quoted in USD — no FX exposure', rating: 4.8, capacityNote: 'Every class live through A-Level + the regulation explained including what limits us + morning teaching that fits the jornada vespertina + the coast and the Amazon reached' },
  ],

  legalFrameworkIntro: 'Ecuador is one of a small number of countries anywhere whose education ministry names homeschooling as a modality and regulates it in detail. That is good news for families and a constraint on providers, and both halves belong on this page.',
  legalFramework: [
    { h: 'A named modality, which is rare', p: 'The Ministerio de Educación recognises educación en casa — homeschooling — among the educational modalities, alongside presencial, semipresencial, a distancia, and a distancia virtual. Most of the seventy-plus countries we serve do not name it at all; in Ecuador it sits in the ministry\'s own taxonomy. The foundational instrument is Acuerdo Ministerial No. 0067-13-A of 8 April 2013, under which Educación en Casa is regulated as an extraordinary service, with MINEDUC publishing implementation guidance. The current framework sits in the 2023 acuerdos, including the Normativa para la oferta educativa extraordinaria and the acuerdo regulating educación en casa and the procedures for accrediting learning.' },
    { h: 'Article 31, and what it forbids a provider from doing', p: 'This is the provision that shapes our entire Ecuadorian offer, and we would rather quote it than work around it. Educación en casa is a type of non-formal distance education, and its development is the exclusive responsibility of the family. A private, municipal or fiscomisional school may not offer homeschooling as though it were an ordinary school modality, nor directly issue promotions or títulos for that service. The consequences for us are absolute and we state them plainly: Smartious does not provide educación en casa as a school service, does not issue Ecuadorian promotions or títulos, and is not an accredited Ecuadorian institution. What we do is teach Cambridge, Pearson Edexcel, IB and AP qualifications, which carry their own international validity, alongside whatever Ecuadorian arrangement a family holds.' },
    { h: 'Two extraordinary routes, and the confusion that costs families', p: 'The single most expensive mistake an expatriate family makes here is assuming homeschooling is one undifferentiated category. It is not. Educación abierta means the child is formally enrolled at an accredited Ecuadorian public or private school licensed to offer a distance programme — the school holds the accreditation and handles promotion, and this is frequently the more practical route for a foreign family. Educación en casa is the non-formal route: the family\'s exclusive responsibility, with learning accredited by sitting evaluations before the education system. Different requirements, different paperwork, different relationship with the ministry. Choose deliberately, and confirm with MINEDUC and your distrito educativo.' },
    { h: 'The national curriculum is not optional', p: 'Whichever route a family takes, the currículo nacional obligatorio applies: any programme must address its learning objectives, and accredited institutions build their distance offerings around that framework. That is why our default recommendation in Ecuador, as almost everywhere, is that the Cambridge or IB track runs alongside an Ecuadorian arrangement rather than pretending to replace it. The overlap in mathematics and the sciences is heavy; the genuine additional work concentrates in language, national history, and civics.' },
    { h: 'The enforcement point, stated honestly', p: 'Reporting indicates that families who attempted home education without meeting the conditions set out in the acuerdo have been brought before the District Board of Protection of Children and Adolescents and required to enrol their children. We include that not to alarm anyone but because it is the reason the conditions matter. Ecuador has given families a real route; it has not given them an unregulated one, and the difference is enforced. A family who reads only that "homeschooling is legal in Ecuador" and stops there is the family most at risk.' },
    { h: 'Constitutional footing, and where qualifications lead', p: 'The framework rests on a genuinely supportive constitutional base: article 26 recognises education as a lifelong right with family participation, article 29 provides that parents are free to choose for their children an education in accordance with their principles, beliefs and pedagogical choices, and LOEI article 12 confirms the right to choose the type of institution, with article 50 treating non-formal education as optional, complementary and flexible. As to destinations, Ecuadorian universities admit on the bachillerato with foreign qualifications going through homologación; and the ministry has described a route in which a foreign institution\'s certification of a home-educated student\'s work may be homologated domestically. Outward, the United States dominates — reinforced by dollarisation and by the size of the North American community here — with Spain and Canada following, and all read Cambridge, IB and AP records directly.' },
  ],

  whySmartious: [
    { h: 'We quote article 31 rather than working around it',              p: 'The regulation says a school may not offer educación en casa or issue promotions for it. We state that, say we do not, and describe exactly what we do instead.' },
    { h: 'The two extraordinary routes separated',                         p: 'Educación abierta and educación en casa are different offerings with different requirements. Confusing them is the costliest mistake expatriate families make here.' },
    { h: 'No exchange-rate exposure',                                      p: 'Ecuador is dollarised and our fees are in USD — one of the very few markets where a family faces no currency question at all.' },
    { h: 'Morning teaching that fits the jornada vespertina',              p: 'Eight hours ahead means our classes land in the Ecuadorian morning — the free half of the day for afternoon-shift students.' },
    { h: 'The coast and the Amazon reached',                               p: 'Manta\'s tuna industry and the Oriente\'s oil fields have no international schooling at all. Live delivery reaches both.' },
    { h: 'The enforcement risk stated, not hidden',                        p: 'Families who ignored the acuerdo\'s conditions have faced child-protection proceedings. We put that on the page because it is why the conditions matter.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Ecuador?', a: 'Ecuador names educación en casa among the recognised modalities and regulates it — Acuerdo Ministerial No. 0067-13-A of 2013 is the foundational instrument, with the current framework in the 2023 acuerdos. It is treated as non-formal distance education and is the family\'s exclusive responsibility, with official recognition obtained by sitting evaluations before the education system. It is a documented process with conditions rather than an open field, and families who did not meet the conditions have faced enforcement through the child-protection boards. Confirm your own position with MINEDUC and your distrito educativo.' },
    { q: 'What is the difference between educación abierta and educación en casa?', a: 'Educación abierta means formal enrolment at an accredited Ecuadorian school licensed to offer a distance programme, with that school holding the accreditation and handling promotion — often the more practical route for expatriate families. Educación en casa is the non-formal route under the family\'s own responsibility, accredited by evaluation before the system. Confusing them is the most common and most expensive mistake families make here.' },
    { q: 'Can Smartious provide educación en casa or issue Ecuadorian promotions?', a: 'No to both, and the regulation is explicit. Article 31 provides that educación en casa is the family\'s exclusive responsibility and that a school may not offer it as an ordinary modality nor directly issue promotions or títulos for it. We are not an accredited Ecuadorian institution. We teach Cambridge, Edexcel, IB and AP qualifications alongside whatever Ecuadorian arrangement you hold.' },
    { q: 'Does the national curriculum still apply?', a: 'Yes — the currículo nacional obligatorio applies whichever route a family takes, and any programme must address its learning objectives. That is why our track runs alongside an Ecuadorian arrangement rather than replacing it.' },
    { q: 'How do fees work given dollarisation?', a: 'Ecuador uses the US dollar, so our fees are quoted and invoiced in the currency you already use — USD 2,160-6,480 a year, with no exchange-rate exposure. That is unusual across our Latin American coverage and worth noting.' },
    { q: 'Eight hours behind — how does the timetable work?', a: 'Our classes land in the Ecuadorian morning, not the afternoon. For students in jornada vespertina that is the free half of the day; for full-time learners mornings are natural anyway. It does not work after school, and jornada matutina families should talk to us before enrolling.' },
    { q: 'Where do Ecuadorian students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session — Quito first, with Guayaquil for the coast and travel planned ahead from Cuenca, Manta, and the Amazon.' },
    { q: 'Which parts of Ecuador does Smartious cover?', a: 'Quito, Guayaquil, Cuenca, Manta and the coast, and Coca, Lago Agrio and the Amazon have dedicated pages. Live online delivery works identically anywhere in the country, including Galápagos, which runs an hour further behind.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which Ecuadorian arrangement you hold or intend — an ordinary school enrolment, educación abierta with an accredited provider, or educación en casa — because in Ecuador that determines the whole plan, and it belongs in the first message.',
}
