// ═══════════════════════════════════════════════════════════════════
// ARGENTINA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for corporate, energy, agro, and Argentine families
// across Buenos Aires, Córdoba, Rosario, Mendoza and Neuquén.
// FOURTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — READ BEFORE EDITING:
// - Governing statute: LEY DE EDUCACIÓN NACIONAL N° 26.206 (2006).
// - COMPULSORY RANGE — ONE OF THE LONGEST IN OUR COVERAGE:
//   education is obligatory from EARLY CHILDHOOD through the
//   COMPLETION OF THE SECONDARY LEVEL. The starting age was extended
//   downward to FOUR by later reform (Ley 27.045). So the obligation
//   runs roughly from four until secondary is completed, around
//   seventeen or eighteen. THERE IS NO POST-COMPULSORY WINDOW
//   before secondary completion. Never invent one.
// - EDUCACIÓN DOMICILIARIA Y HOSPITALARIA: Ley 26.206 provides for
//   this as a MODALITY of the system for students who cannot attend
//   for HEALTH REASONS — delivered by the system, not elected by a
//   parent. STATE IT FACTUALLY AND NEVER POSITION IT as a
//   homeschooling route. Same treatment as the Balkan health
//   provisions.
// - PARENTAL-CHOICE HOME EDUCATION: we are not aware of an
//   established route. Phrase as "not established / we are not aware
//   of" — NOT a categorical prohibition — plus "confirm with your
//   jurisdiction's education authority".
// - THE PROVINCIAL DIMENSION IS ESSENTIAL AND DISTINCTIVE:
//   Argentina's education system is administered by TWENTY-FOUR
//   JURISDICTIONS — the twenty-three provinces and the Ciudad
//   Autónoma de Buenos Aires — each with its own education ministry
//   operating within the national law's framework, coordinated
//   through the Consejo Federal de Educación. So the operative
//   detail for a family depends on their province. This is the
//   Bosnia/Switzerland pattern in a Latin American setting — use
//   that framing, it is genuinely informative.
// - CONSEQUENCE: SUPPLEMENTARY IS THE ONLY CONFIGURATION we offer
//   for resident children, throughout.
// - Private schools operate with official recognition through their
//   jurisdiction. Smartious is not a recognised Argentine school and
//   says so — same disclosure family as Mexico, Brazil, Ghana, DRC.
// TIMEZONE — WORKS WELL, LIKE BRAZIL: Argentina runs ART (UTC-3)
// nationwide with no daylight saving. Nairobi is UTC+3, so a
// SIX-HOUR gap. Argentine morning 09:00 = 15:00 Nairobi; early
// afternoon 13:00 = 19:00 Nairobi. BOTH work. Argentine schools also
// commonly run TURNO MAÑANA and TURNO TARDE, so most students have
// one of those windows genuinely free. Contrast usefully with
// Colombia and Mexico, where only mornings work.
// MARKET NOTE: Argentina has a long and unusually deep bilingual
// school tradition — St George's, Belgrano Day School, St Andrew's,
// Northlands, Cardenal Newman and a large Anglo-Argentine sector,
// plus the German, French and Italian schools — much of it dating to
// the nineteenth century, and much of it already offering IGCSE and
// the IB. Argentina is therefore a SOPHISTICATED market where our
// pitch must be narrow and honest: subject access, fee pressure in a
// high-inflation economy, and reach beyond Buenos Aires. Economy:
// CABA's corporate and financial centre; Córdoba's automotive,
// aerospace and university sector; Rosario's agro-export complex on
// the Paraná; Mendoza's wine, mining and Andean economy; and Neuquén
// and the VACA MUERTA shale formation, one of the largest
// unconventional oil and gas plays in the world, with an
// internationally recruited technical workforce.
// ═══════════════════════════════════════════════════════════════════

export const ARGENTINA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'buenos-aires-ar',
    name: 'Buenos Aires',
    county: 'CABA and Greater Buenos Aires',
    region: 'The corporate and financial capital · one of the oldest and deepest bilingual school traditions in the world · the diplomatic community · fees under sustained inflationary pressure',
    primaryKeyword: 'Online school and Cambridge tutoring in Buenos Aires',
    heroTagline: 'For Buenos Aires families — in a city that has taught the British curriculum since the nineteenth century, we add the subjects a timetable cannot.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Buenos Aires families. Few cities anywhere have a deeper bilingual school tradition than Buenos Aires — St George\'s, Belgrano Day School, St Andrew\'s, Northlands, Cardenal Newman and the wider Anglo-Argentine sector, alongside the German, French and Italian schools, much of it dating back more than a century and much of it already running IGCSE and the IB. We are not here to introduce the British curriculum to a city that has taught it since the 1800s. We are here for subject access, for fee pressure in a high-inflation economy, and for families the tier cannot seat.',
    heroImg: '/heroes/buenos-aires-ar.jpg',
    altTexts: { hero: 'Buenos Aires city' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Buenos Aires families — subject access and fee relief in a deep bilingual market. From USD 400/month.',
    challenges: [
      'Bilingual and international school fees under sustained pressure in a high-inflation economy.',
      'Competitive places at the strongest Anglo-Argentine schools, often with long waiting lists.',
      'Education is compulsory from early childhood through completion of secondary — one of the longest ranges in our coverage.',
      'Specialist A-Level subjects often do not run for small cohorts even in strong schools.',
      'Time zone: Argentina runs ART (UTC-3) with no daylight saving — six hours behind Nairobi, so our classes land in the Argentine morning or early afternoon.',
    ],
    familySituations: [
      'Corporate, financial, and professional families under fee pressure.',
      'Families on waiting lists at the bilingual tier needing a bridge.',
      'Students needing a subject their school cannot staff for a small group.',
      'Diplomatic and international-organisation households.',
      'Students in turno tarde with mornings free, or turno mañana with early afternoons free.',
      'Families targeting UK, Spanish, Italian, or American universities.',
    ],
    nearbyAreas: ['Recoleta and Palermo', 'Belgrano', 'San Isidro', 'Vicente López', 'Pilar', 'Nordelta', 'La Plata'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, Italian, German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Italian and Argentine university applications',
    ],
    whyChoose: [
      ['The subject a strong school still cannot staff', 'Further Mathematics or a third science for four pupils is unviable on any single timetable and routine in a live group drawn from several countries.'],
      ['Fee relief without leaving the qualification', 'Live small-group teaching at USD 2,160-6,480 a year, invoiced in USD, against bilingual fees under sustained inflationary pressure.'],
      ['Respectful of a tradition older than most', 'Buenos Aires has taught the British curriculum since the nineteenth century. We supplement that market; we do not lecture it.'],
      ['A workable clock', 'Six hours, fixed — Argentine mornings and early afternoons both land in our normal teaching day, and turno mañana/tarde leaves most students one window free.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core, protecting Argentine and Spanish university routes.'],
    ],
    growingReason: 'Buenos Aires holds one of the oldest and deepest bilingual school traditions in the world alongside Argentina\'s corporate and financial centre and its diplomatic community — with fees under sustained inflationary pressure and competitive places at the strongest schools. Argentina runs ART (UTC-3), six hours behind Nairobi with no daylight saving.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Buenos Aires families, taught alongside an Argentine school enrolment in the subjects a timetable cannot cover. Examinations at authorised centres confirmed per family per session; Argentina has long-established Cambridge provision.',
      cbc: 'Kenya CBC available for Buenos Aires families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the city\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Argentine education law is set by the Ley de Educación Nacional N° 26.206, under which education is obligatory from early childhood through the completion of the secondary level — with the starting age extended downward to four by subsequent reform. That is one of the longest compulsory ranges in our entire coverage, and it means Argentina has no post-compulsory window before secondary is completed. The law also provides for educación domiciliaria y hospitalaria as a modality of the system for students who cannot attend for health reasons; that is a system-delivered welfare provision rather than a parental election, and we state it factually rather than positioning it as a route. We are not aware of an established parental-choice home-education route in Argentine law, and we phrase it that way rather than asserting a categorical prohibition. One further feature matters a great deal here: Argentina\'s system is administered by twenty-four jurisdictions — the twenty-three provinces and the Ciudad Autónoma de Buenos Aires — each with its own education ministry operating within the national framework and coordinated through the Consejo Federal de Educación. So the operative detail for a family depends on their jurisdiction, and the position should be confirmed there rather than assumed from a national summary. Smartious is not a recognised Argentine school; we work alongside one.',
    homeTuitionDetail: 'Smartious delivers to Buenos Aires families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Argentina sits six hours behind Nairobi with no daylight saving on either side, so Argentine morning and early-afternoon classes both fall in our normal teaching day, at the same time every week of the year, with all sessions recorded.',
    faqs: [
      { q: 'Buenos Aires already has excellent bilingual schools — what would we gain?', a: 'Usually not a different curriculum, and we say so. What families come to us for is subject access — Further Mathematics, a third science, a set that will not run for four pupils — and fee relief in a high-inflation economy, invoiced in USD. If your school offers everything your child needs, we would rather tell you that.' },
      { q: 'Is homeschooling legal in Argentina?', a: 'Education is obligatory from early childhood through completion of secondary under Ley 26.206, and we are not aware of an established parental-choice home-education route. Educación domiciliaria exists in the law as a modality for students who cannot attend for health reasons, not as a parental election. Argentina\'s system is run by twenty-four jurisdictions, so confirm your position with your provincial or CABA authority.' },
      { q: 'How does the timezone work?', a: 'Six hours, fixed — Argentina has no daylight saving and neither does Kenya. Argentine mornings and early afternoons both land in our normal teaching day, and with schools commonly running turno mañana and turno tarde, most students have one window genuinely free.' },
      { q: 'Is Smartious a recognised Argentine school?', a: 'No, and we say so plainly. We work alongside your Argentine school, which holds the domestic recognition; the qualifications we teach carry Cambridge, Edexcel, IB or AP validity.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'cordoba-ar',
    name: 'Córdoba',
    county: 'Province of Córdoba',
    region: 'The industrial and university heartland — automotive assembly, aerospace and software · one of the oldest universities in the Americas · a large student and academic population · thinner international provision than Buenos Aires',
    primaryKeyword: 'Online school and Cambridge tutoring in Córdoba',
    heroTagline: 'For Córdoba families — automotive plants, an aerospace industry and a four-hundred-year-old university, with a fraction of the capital\'s school tier.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Córdoba families. Córdoba is Argentina\'s industrial and academic second city — automotive assembly and components, an aerospace and defence industry with a long history, a fast-growing software and services sector, and a university founded in the early seventeenth century that still anchors one of the largest student populations in the country. Its international provision is thinner than Buenos Aires\'s, and the capital is seven hundred kilometres east. We teach live in the Argentine morning or early afternoon, alongside your school.',
    heroImg: '/heroes/cordoba-ar.jpg',
    altTexts: { hero: 'Córdoba city and the sierras' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Córdoba families — industrial and university heartland, thinner provision. From USD 400/month.',
    challenges: [
      'International provision thinner than Buenos Aires, seven hundred kilometres east.',
      'Automotive and aerospace employers recruit internationally while schooling has not matched.',
      'Education is compulsory from early childhood through completion of secondary.',
      'Specialist A-Level subjects rarely run for small cohorts outside the capital.',
      'Time zone: Córdoba shares ART (UTC-3), six hours behind Nairobi with no daylight saving.',
    ],
    familySituations: [
      'Automotive assembly, components, and industrial engineering families.',
      'Aerospace and defence-sector households.',
      'Software and technology-services families.',
      'University academic and research families.',
      'Students in turno tarde with mornings free, or turno mañana with early afternoons free.',
    ],
    nearbyAreas: ['Córdoba', 'Villa Allende', 'Río Cuarto', 'Villa Carlos Paz', 'Alta Gracia', 'Villa María', 'the Sierras Chicas'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, Italian and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Computer Science',
      'Cambridge A-Level Economics, Business, Biology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Italian and Argentine university applications',
    ],
    whyChoose: [
      ['Engineering depth for an industrial city', 'Cambridge A-Level Mathematics, Further Mathematics, and Physics — led by a founder with a BEd in Mathematics and Physics — suit automotive and aerospace families precisely.'],
      ['The complete option seven hundred kilometres from the tier', 'Identical live delivery in Córdoba and Buenos Aires, without relocation.'],
      ['The set your school cannot run', 'A-Level subjects unviable for four pupils are routine in a live group drawn from several countries.'],
      ['A workable clock', 'Six hours, fixed — mornings and early afternoons both land in our teaching day.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core.'],
    ],
    growingReason: 'Córdoba is Argentina\'s industrial and academic second city — automotive assembly and components, aerospace and defence, a growing software sector, and one of the oldest universities in the Americas — with international provision thinner than the capital\'s, seven hundred kilometres east. Argentina runs ART (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Córdoba, taught alongside an Argentine school enrolment.',
      cbc: 'Kenya CBC available for Córdoba families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Córdoba, administered by the provincial education authority: education is obligatory from early childhood through completion of secondary under Ley 26.206, educación domiciliaria y hospitalaria exists as a system-delivered modality for students who cannot attend on health grounds rather than as a parental election, and we are not aware of an established parental-choice home-education route. Because Argentina\'s system runs through twenty-four jurisdictions, the operative detail is provincial — confirm your position with the Córdoba education authority. Smartious is not a recognised Argentine school; we work alongside yours.',
    homeTuitionDetail: 'Smartious delivers to Córdoba families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Argentine morning or early afternoon, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Córdoba?', a: 'Some, and thinner than in Buenos Aires seven hundred kilometres east. Live online delivery reaches Córdoba identically, alongside your school enrolment.' },
      { q: 'Our school will not run Further Mathematics — can you?', a: 'Yes, and it is the most common reason Argentine families come to us. A set that is unviable for four pupils runs routinely in a live group drawn from several countries.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'rosario-ar',
    name: 'Rosario & the Paraná Corridor',
    county: 'Province of Santa Fe',
    region: 'The agro-export capital — the Paraná river ports and the world\'s largest soy and grain complex · international commodity trading houses · a major university and medical centre',
    primaryKeyword: 'Online school and Cambridge tutoring in Rosario',
    heroTagline: 'For Rosario and Santa Fe families — one of the world\'s great grain corridors, staffed by international traders and served by local schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Rosario and Santa Fe families. The Paraná corridor around Rosario handles one of the largest concentrations of soy, grain, and vegetable-oil export capacity anywhere in the world, and the international commodity trading houses, crushing plants, and shipping agencies that come with it — an unusually international commercial community for a city its size. Rosario is also a major university and medical centre. International schooling has not matched the trade. Smartious teaches Cambridge and IB live alongside your school, on a six-hour offset that works.',
    heroImg: '/heroes/rosario-ar.jpg',
    altTexts: { hero: 'Rosario and the Paraná river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Rosario and Santa Fe families — the Paraná agro-export corridor. From USD 400/month.',
    challenges: [
      'An internationally staffed commodity trading and agro-export community with limited international schooling.',
      'Families spread along the Paraná corridor rather than clustered in one city.',
      'Education is compulsory from early childhood through completion of secondary.',
      'Trading and shipping postings move families between countries.',
      'Time zone: Rosario shares ART (UTC-3), six hours behind Nairobi with no daylight saving.',
    ],
    familySituations: [
      'International commodity trading, crushing, and shipping families.',
      'Agro-export, agribusiness, and logistics households.',
      'University and medical-sector academic families.',
      'Families along the Paraná corridor away from the city centre.',
      'Students in turno tarde with mornings free, or turno mañana with early afternoons free.',
    ],
    nearbyAreas: ['Rosario', 'San Lorenzo', 'Puerto General San Martín', 'Villa Gobernador Gálvez', 'Santa Fe city', 'Rafaela', 'the Paraná ports'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, Italian and home language support',
      'Cambridge A-Level Mathematics, Economics, Business, Biology, Chemistry',
      'Cambridge A-Level Physics, Geography, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Microeconomics, AP Biology',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Italian and Argentine university applications',
    ],
    whyChoose: [
      ['Economics and business depth for a trading corridor', 'Cambridge A-Level Economics, Business, and Mathematics suit the families who run one of the world\'s great grain complexes.'],
      ['Reaches the corridor, not just the city', 'San Lorenzo, Puerto General San Martín, and the river ports get identical live delivery.'],
      ['Portable for a trading career', 'Rosario now, Geneva, Singapore, or São Paulo next — the curriculum and examination board stay constant.'],
      ['A workable clock', 'Six hours, fixed — mornings and early afternoons both land in our teaching day.'],
      ['Pre-medical depth for a medical city', 'Cambridge A-Level Biology and Chemistry with Mathematics for the students Rosario sends to medicine in numbers.'],
    ],
    growingReason: 'The Paraná corridor around Rosario handles one of the largest concentrations of soy, grain, and vegetable-oil export capacity in the world, with the international trading houses, crushing plants, and shipping agencies that follow — alongside a major university and medical sector, and international schooling that has not matched the trade. Argentina runs ART (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Paraná corridor, taught alongside an Argentine school enrolment and portable across trading postings.',
      cbc: 'Kenya CBC available for Santa Fe families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Santa Fe, administered provincially: education is obligatory from early childhood through completion of secondary under Ley 26.206, educación domiciliaria y hospitalaria is a system-delivered modality on health grounds rather than a parental election, and we are not aware of an established parental-choice home-education route — confirm with the Santa Fe education authority, since Argentina\'s system runs through twenty-four jurisdictions. For internationally posted trading families the supplementary arrangement also travels, continuing unchanged to the next posting. Smartious is not a recognised Argentine school.',
    homeTuitionDetail: 'Smartious delivers to Santa Fe families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Argentine morning or early afternoon, with every session recorded.',
    faqs: [
      { q: 'We work for an international trading house — does the schooling follow a posting?', a: 'Yes: the same curriculum, teachers, and examination board continue to Geneva, Singapore, São Paulo, or wherever the next posting is, with examinations sat at authorised centres locally.' },
      { q: 'We live along the corridor rather than in Rosario — does that work?', a: 'Identically. Live delivery reaches San Lorenzo, Puerto General San Martín, and the river towns the same as the city.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'mendoza-ar',
    name: 'Mendoza',
    county: 'Province of Mendoza',
    region: 'The wine capital and Andean gateway · an international wine investment community · mining and energy across the province · the Chilean corridor over the Andes',
    primaryKeyword: 'Online school and Cambridge tutoring in Mendoza',
    heroTagline: 'For Mendoza families — an international wine industry, an Andean mining province, and a school map that stops at the city.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Mendoza families. Mendoza is Argentina\'s wine capital and its Andean gateway — an industry with substantial French, Italian, American, and Chilean investment behind it, bringing winemakers, viticulturists, and executives who often stay for years; a mining and energy sector across the province; and the corridor over the Andes to Chile that shapes its trade. The international community is real and the international schooling is limited, concentrated in the city while much of the industry sits in the valleys. Smartious teaches live alongside your school, on a six-hour offset that works.',
    heroImg: '/heroes/mendoza-ar.jpg',
    altTexts: { hero: 'Mendoza vineyards and the Andes' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Mendoza families — wine capital, Andean province, limited provision. From USD 400/month.',
    challenges: [
      'A genuinely international wine and mining community with limited international schooling.',
      'Provision is concentrated in the city while the industry sits across the valleys.',
      'Education is compulsory from early childhood through completion of secondary.',
      'Cross-border families on the Chilean corridor need to know which framework applies.',
      'Time zone: Mendoza shares ART (UTC-3), six hours behind Nairobi with no daylight saving.',
    ],
    familySituations: [
      'Wine industry investment, winemaking, and executive families — French, Italian, American, Chilean.',
      'Mining and energy-sector households across the province.',
      'Tourism, hospitality, and Andean-adventure business families.',
      'Families in the Uco Valley and Luján de Cuyo away from the city.',
      'Students in turno tarde with mornings free, or turno mañana with early afternoons free.',
    ],
    nearbyAreas: ['Mendoza city', 'Luján de Cuyo', 'Maipú', 'the Uco Valley', 'San Rafael', 'Tunuyán', 'the Chilean border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French, Italian and home language support',
      'Cambridge A-Level Chemistry, Biology, Mathematics, Physics, Geography',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Biology, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Italian, Spanish, Chilean and Argentine university applications',
    ],
    whyChoose: [
      ['French and Italian alongside the academic core', 'A wine industry built on French and Italian investment makes those languages practical rather than decorative — and both universities read the record routinely.'],
      ['Chemistry and biology depth', 'Cambridge A-Level Chemistry and Biology suit oenology, viticulture, and agricultural science routes precisely.'],
      ['Reaches the valleys, not just the city', 'Luján de Cuyo, Maipú, and the Uco Valley get identical live teaching without a daily run into Mendoza.'],
      ['A workable clock', 'Six hours, fixed — mornings and early afternoons both land in our teaching day.'],
      ['Residence stated precisely', 'Cross-border families on the Chilean corridor follow the framework of where they legally reside, a question for their own advisers.'],
    ],
    growingReason: 'Mendoza is Argentina\'s wine capital and Andean gateway — an industry with substantial French, Italian, American, and Chilean investment, a mining and energy sector across the province, and the Chilean corridor over the Andes — with international schooling concentrated in the city while the industry sits across the valleys. Argentina runs ART (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Mendoza, taught alongside an Argentine school enrolment, with French or Italian available beside the English-medium core.',
      cbc: 'Kenya CBC available for Mendoza families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Mendoza, administered provincially: education is obligatory from early childhood through completion of secondary under Ley 26.206, educación domiciliaria y hospitalaria is a system-delivered health modality rather than a parental election, and we are not aware of an established parental-choice home-education route — confirm with the Mendoza education authority, since the detail is jurisdictional. Families resident across the border in Chile follow Chilean law instead, a distinction decided by residence rather than by where a business operates, and one for their own advisers. Smartious is not a recognised Argentine school.',
    homeTuitionDetail: 'Smartious delivers to Mendoza families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Argentine morning or early afternoon, with every session recorded.',
    faqs: [
      { q: 'We came with a wine investment — can our children keep French or Italian?', a: 'Yes, and many of our Mendoza families do. Cambridge French or Italian runs alongside the English-medium core, and French and Italian universities read the resulting record routinely.' },
      { q: 'We live in the Uco Valley — is a daily run into Mendoza avoidable?', a: 'For the teaching, entirely. Live classes reach the valleys identically, with examinations sat at authorised centres a few times a year.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'neuquen-ar',
    name: 'Neuquén & Vaca Muerta',
    county: 'Neuquén and Río Negro',
    region: 'The Vaca Muerta shale formation — one of the largest unconventional oil and gas plays in the world · Añelo and the operations belt · an internationally recruited technical workforce · schooling that arrived nowhere near as fast as the rigs',
    primaryKeyword: 'Online school and Cambridge tutoring in Neuquén and Vaca Muerta',
    heroTagline: 'For Neuquén and Vaca Muerta families — one of the world\'s great shale plays, staffed from four continents and schooled like a provincial town.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across Neuquén and the Vaca Muerta belt. Vaca Muerta is one of the largest unconventional oil and gas formations in the world, and the operations around Añelo, Neuquén, and the Río Negro valley have drilled a global industry into a Patagonian province in barely more than a decade — bringing petroleum engineers, geologists, completion specialists, and management recruited from the United States, Canada, Europe, and across Latin America, much of it rotational. What did not arrive at the same pace was schooling. Smartious teaches live to the basin, on a six-hour offset that works.',
    heroImg: '/heroes/neuquen-ar.jpg',
    altTexts: { hero: 'The Neuquén basin and Patagonian steppe' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Neuquén and Vaca Muerta families — one of the world\'s great shale plays, minimal international schooling. From USD 400/month.',
    challenges: [
      'An internationally recruited shale workforce with essentially no international schooling in the basin.',
      'Añelo and the operations belt sit well outside any city\'s school map.',
      'Rotational contracts split households across countries for much of the year.',
      'Education is compulsory from early childhood through completion of secondary for resident children.',
      'Time zone: Neuquén shares ART (UTC-3), six hours behind Nairobi with no daylight saving.',
    ],
    familySituations: [
      'Petroleum engineering, geology, and completions families — Argentine and international.',
      'Oilfield-services and contractor households on rotational postings.',
      'Operations families based at Añelo and across the basin.',
      'Households split between Patagonia and a base elsewhere.',
      'Students aiming at petroleum engineering, geoscience, or related programmes abroad.',
    ],
    nearbyAreas: ['Neuquén city', 'Añelo', 'Rincón de los Sauces', 'Cutral Có', 'Cipolletti', 'General Roca', 'the Río Negro valley'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Geography',
      'Cambridge A-Level Biology, Economics, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including petroleum and geoscience programmes), Common Application (US), and Canadian, Spanish and Argentine university applications',
    ],
    whyChoose: [
      ['The energy-rotation case, run in ten countries already', 'Stavanger, Baku, Hassi Messaoud, Cabinda, Takoradi, Macaé, Kolwezi — and now Vaca Muerta. One live pathway across every posting.'],
      ['Geoscience and engineering depth', 'Cambridge A-Level Physics, Chemistry, Mathematics, and Geography — the exact spine a shale workforce\'s children aim at.'],
      ['Reaches Añelo and the basin', 'The operations belt is nowhere near a campus. Live teaching reaches the site instead of sending a child away.'],
      ['A workable clock, unusually for a remote posting', 'Six hours, fixed — Argentine mornings and early afternoons both land in our teaching day, whatever the roster.'],
      ['Portable to the next basin', 'Vaca Muerta now, Permian, North Sea, or the Gulf next — the curriculum and the board stay constant.'],
    ],
    growingReason: 'Vaca Muerta is one of the largest unconventional oil and gas formations in the world, and the operations around Añelo and Neuquén have drilled a global industry into a Patagonian province in barely more than a decade — bringing an internationally recruited technical workforce to a region whose schooling never matched the pace. Argentina runs ART (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Neuquén basin, portable across energy postings. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for basin families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American or Canadian universities.',
    },
    homeschoolDetail: 'The national framework applies across Neuquén and Río Negro, administered by each province: education is obligatory from early childhood through completion of secondary under Ley 26.206 for children resident in Argentina, educación domiciliaria y hospitalaria is a system-delivered health modality rather than a parental election, and we are not aware of an established parental-choice home-education route — confirm with your provincial education authority. For rotational energy families the supplementary configuration is the natural one: the local school carries the enrolment while the Cambridge track runs live alongside and continues unchanged to the next basin. Families not resident in Argentina follow their country of residence\'s framework, a status they determine with their own advisers. Smartious is not a recognised Argentine school.',
    homeTuitionDetail: 'Smartious delivers to basin families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Argentine morning or early afternoon, with every session recorded — built for rosters, remote sites, and split households.',
    faqs: [
      { q: 'We are on a Vaca Muerta rotation — does the schooling follow us?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next basin anywhere in the world, with examinations sat at authorised centres wherever the family is. It is the case we already run for families in Stavanger, Baku, Macaé, and Cabinda.' },
      { q: 'Is there any international schooling near Añelo?', a: 'Essentially none — the operations belt sits well outside any city\'s school map. Live delivery is the route that reaches the basin without splitting a household.' },
      { q: 'Our household is split between Patagonia and another country — how does that work?', a: 'The teaching is identical wherever the child is and the recorded library covers travel. Which national framework applies turns on the child\'s residence, which is a question for your own advisers.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const ARGENTINA_COUNTRY = {
  slug: 'argentina',
  name: 'Argentina',
  longName: 'Argentine Republic',
  adjective: 'Argentine',
  flag: '🇦🇷',
  hub: '/online-school/argentina',
  hubPageId: 'homeschooling-argentina',
  cityPageId: 'argentina-city',

  currency: 'ARS',
  currencyName: 'Argentine Peso',
  currencyPeg: 'Fees are invoiced in USD, which many Argentine families prefer for planning; peso equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'ART',
    name: 'Argentina Time (UTC-3) nationwide, no daylight saving',
    utcOffset: '-3',
    offsetFromEAT: '-6 hours — Argentine mornings and early afternoons both land in our teaching day, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Argentina has long-established Cambridge provision through its bilingual school sector'],
  examCentreTiles: [
    { city: 'Buenos Aires', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Córdoba and Rosario', centre: 'Regional provision', area: 'Checked first for interior and Paraná-corridor families.' },
    { city: 'Mendoza and Patagonia', centre: 'Planned per session', area: 'Mendoza and Neuquén families plan travel into each window well ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Argentina-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Argentina is an easier market than most for this: the bilingual school sector has run IGCSE and A-Level for decades, so provision and familiarity are both long established — Buenos Aires is checked first, with regional options in Córdoba and Rosario and travel planned ahead from Mendoza and the Neuquén basin. Note what does not change: our arrangement runs alongside an Argentine school, which continues its own national track unchanged. Smartious is not a recognised Argentine school, and the qualifications we teach carry Cambridge, Pearson Edexcel, IB, or AP validity rather than Argentine official recognition — a distinction we state plainly.',
  secondaryProgrammeExamRef: 'Authorised Argentine Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/argentina.jpg',
  heroEyebrow: 'Online school for Argentina',
  heroH1Suffix: 'Argentina',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for corporate, energy, agro-export, and Argentine families across Buenos Aires, Córdoba, Rosario, Mendoza, and Neuquén. In a country that has taught the British curriculum since the nineteenth century, our offer is narrow and honest: the subjects a timetable cannot staff, fee relief invoiced in USD, and reach beyond Buenos Aires. Six hours behind, so mornings and early afternoons both work.',
  heroValueProp: 'From USD 180/month, invoiced in USD. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — alongside your Argentine school.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Argentina',

  citiesSectionTitle: 'Where our Argentina families are',
  citiesSectionBody: 'Smartious Argentina families concentrate across Buenos Aires (one of the oldest and deepest bilingual school traditions in the world, under sustained fee pressure), Córdoba (the automotive, aerospace and university heartland, seven hundred kilometres from the capital\'s tier), Rosario and the Paraná corridor (one of the world\'s great grain and agro-export complexes, staffed by international trading houses), Mendoza (the wine capital and Andean gateway, with the industry spread across valleys the school map does not reach), and Neuquén and Vaca Muerta (one of the largest shale plays on earth, drilled into a Patagonian province faster than any school could follow). One long compulsory range, twenty-four jurisdictions, and a timezone that works.',

  trustSignals: [
    { h: 'An African school teaching Argentine families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023, serving students across more than seventy countries — an internationally accredited online school, not an Argentine one.' },
    { h: 'A timezone that works', p: 'Argentina runs ART (UTC-3) with no daylight saving and Kenya EAT (UTC+3) with none either — a fixed six-hour gap. Argentine morning and early-afternoon classes both land in our normal teaching day, and with schools commonly running turno mañana and turno tarde, most students have one window genuinely free.' },
    { h: 'The compulsory range, stated properly', p: 'Under Ley de Educación Nacional 26.206 education is obligatory from early childhood through completion of the secondary level, with the starting age extended down to four by later reform. That is one of the longest ranges in our coverage, and it means Argentina has no post-compulsory window before secondary is completed.' },
    { h: 'Twenty-four jurisdictions, not one', p: 'Argentina\'s system is administered by the twenty-three provinces and the Ciudad Autónoma de Buenos Aires, each with its own education ministry within the national framework and coordinated through the Consejo Federal de Educación. The operative detail depends on your province, and we say so rather than giving a single national answer.' },
  ],

  universitiesInCountry: 'The Universidad de Buenos Aires, the Universidad Nacional de Córdoba — one of the oldest in the Americas — the Universidad Nacional de Rosario, the Universidad Nacional de Cuyo, and a substantial private sector including UCA, Universidad Austral, UTDT and San Andrés.',
  universityChannels: 'Argentine universities admit on the national secondary título, and foreign qualifications enter through convalidación procedures with requirements confirmed per case rather than automatically — a family intending to enter Argentine higher education should begin that early. Outward, Argentine students are strongly oriented toward Spain and Italy, where citizenship ties are unusually common and both systems assess Cambridge A-Levels and the IB through their own equivalence routes; the United States and Canada follow, reading A-Levels, the IB, and AP records directly; and UCAS reads A-Levels natively. A-Levels are accepted in 160+ countries — including the petroleum, geoscience, and agricultural science programmes that our Neuquén, Mendoza, and Rosario families most often have in view. Smartious provides personalised university guidance across Spanish, Italian, US, Canadian, UK (UCAS), and Argentine destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Argentina families, in the only configuration Argentine law leaves open for a resident child: live Cambridge subjects alongside an Argentine school enrolment. Classes run in the Argentine morning or early afternoon on a fixed six-hour offset with no seasonal drift, and Cambridge Spanish, Italian, or French is available alongside the English-medium core. Fees are invoiced in USD, which many Argentine families prefer for planning. Examinations at authorised provision confirmed per session.',
  britishCurriculumSuits: 'Argentina families targeting the Cambridge pathway. Best fit for: (1) students needing a subject their school cannot staff for a small cohort, (2) families under fee pressure at the bilingual tier who want USD-denominated planning, (3) Vaca Muerta and energy families whose careers move between basins, (4) Rosario\'s international trading community and Mendoza\'s wine-investment households, (5) families in Córdoba, Mendoza, and Patagonia where provision thins sharply outside the capital.',
  britishCurriculumDelivery: 'Live online classes in the Argentine morning or early afternoon, small groups 4-6 students, every session recorded, alongside an Argentine school.',
  ibDiplomaSuits: 'Argentina families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Argentina families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Argentina families join students across more than seventy countries — and Argentina is one of the few markets where the British curriculum arrived long before we did, which shapes what we sensibly offer.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Vaca Muerta\'s petroleum and geoscience families, Córdoba\'s automotive and aerospace households, and every medicine-bound student in Rosario and Buenos Aires. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Argentina is the market where we are least willing to overclaim, because Buenos Aires has taught the British curriculum since the nineteenth century and does it well. St George\'s, Belgrano Day School, St Andrew\'s, Northlands, Cardenal Newman and the wider Anglo-Argentine sector, plus the German, French and Italian schools, form a tier with more history than almost any comparable market in the world. Our offer here is deliberately narrow: subject access where a timetable runs out, fee relief in a high-inflation economy with USD-denominated invoicing, and reach into the provinces where the tier does not exist.',
  competitors: [
    { name: 'The Anglo-Argentine bilingual tier',             city: 'Buenos Aires',          curriculum: 'Bilingual, IGCSE, A-Level and IB',      feesUsd: 'Premium, under inflationary pressure',              feesAed: 'Competitive places',      rating: 4.8, capacityNote: 'A tradition dating to the nineteenth century — genuinely excellent, and long waiting lists' },
    { name: 'The German, French and Italian schools',         city: 'Buenos Aires',          curriculum: 'National-system bilingual',              feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.6, capacityNote: 'Strong, long-established, and a different route entirely' },
    { name: 'Provincial bilingual schools',                   city: 'Córdoba, Rosario, Mendoza', curriculum: 'Bilingual, some IGCSE',             feesUsd: 'Mid to premium tier',                               feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Useful and much thinner than the capital — specialist A-Level sets rarely run' },
    { name: 'The Neuquén basin',                              city: 'Vaca Muerta, Añelo',    curriculum: '—',                                     feesUsd: 'Essentially nothing',                               feesAed: '—',                       rating: 0,   capacityNote: 'One of the world\'s great shale plays, with no international schooling to match' },
    { name: 'Private tuition (clases particulares)',           city: 'Nationwide',            curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Widespread',              rating: 3.9, capacityNote: 'The default answer to a timetable gap — usually one-to-one and unstructured across a year' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh (online)', city: 'Online',                curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious — UK providers are closer to Argentina on the clock than we are' },
    { name: 'Smartious Homeschool (Argentina via online delivery)', city: 'Delivered to all Argentina', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'Invoiced in USD', rating: 4.8, capacityNote: 'Every class live through A-Level + the sets a timetable cannot staff + USD-denominated planning + Vaca Muerta and the provinces reached + honest that Buenos Aires got here first' },
  ],

  legalFrameworkIntro: 'Argentina has one of the longest compulsory ranges in our coverage and one of the most decentralised systems. Both shape what we can honestly offer. Here is the framework.',
  legalFramework: [
    { h: 'The governing statute and the compulsory range', p: 'The Ley de Educación Nacional N° 26.206 governs the Argentine system. Education is obligatory from early childhood through the completion of the secondary level, and the starting age was extended downward to four by subsequent reform. That is one of the longest compulsory ranges we cover — comparable to Brazil\'s four to seventeen and longer than almost every European framework — and it has a direct consequence: Argentina has no post-compulsory window before secondary is completed. Any provider offering a full-time programme to a sixteen-year-old resident in Argentina on the basis that compulsory schooling has ended is describing another country\'s law.' },
    { h: 'Educación domiciliaria — what it is, and what it is not', p: 'Ley 26.206 provides for educación domiciliaria y hospitalaria as a modality of the system, for students who are unable to attend school for health reasons. It is delivered by the education system to a child who cannot come to it, not elected by a parent who would rather teach at home. We state it factually because families encounter the phrase and read hope into it, and we do not position it as a homeschooling route — the same treatment we give the equivalent provisions in Croatia, Albania, and North Macedonia.' },
    { h: 'Home education: what we can and cannot say', p: 'We are not aware of an established parental-choice home-education route in Argentine law, and we phrase it in those terms rather than asserting a categorical prohibition we cannot fully evidence. What is unrestricted is structured education alongside a school enrolment, which is the configuration we build — and given the length of the compulsory range, it is the configuration that applies for longer here than in most countries.' },
    { h: 'Twenty-four jurisdictions, which changes the answer', p: 'This is the feature most national summaries flatten. Argentina\'s education system is administered by the twenty-three provinces and the Ciudad Autónoma de Buenos Aires, each with its own education ministry operating within the national law\'s framework and coordinated through the Consejo Federal de Educación. The pattern will be familiar to readers of our Swiss and Bosnian pages: one national framework, many administering authorities, and operative detail that depends on where a family lives. So the position that governs your child is confirmed with your provincial or CABA education authority, not from a national article — ours included.' },
    { h: 'What we are, and are not', p: 'Private schools in Argentina operate with official recognition through their jurisdiction. Smartious does not hold Argentine recognition, does not operate premises in Argentina, and does not present itself as an alternative to a recognised school. The qualifications we deliver carry Cambridge, Pearson Edexcel, IB, or AP validity; your school carries the Argentine one. We state that as plainly here as we do in Mexico, Brazil, Ghana, and the DRC.' },
    { h: 'Why our offer here is deliberately narrow', p: 'Buenos Aires has taught the British curriculum since the nineteenth century, and the Anglo-Argentine bilingual tier is among the most established anywhere in the world. We are not going to tell Argentine families that Cambridge is unfamiliar or that their schools are failing them, because neither is true. What a strong school still cannot always do is staff Further Mathematics for four pupils, or a third science, or run an A-Level set that clashes with everything else. And what no school can do is insulate a family from a currency. Fees invoiced in USD at USD 2,160-6,480 a year are a different planning proposition in a high-inflation economy, and that — plus reach into Córdoba, Mendoza, the Paraná corridor, and the Neuquén basin — is the honest scope of what we add.' },
  ],

  whySmartious: [
    { h: 'Honest that Buenos Aires got here first',                        p: 'The Anglo-Argentine tier has taught this curriculum since the nineteenth century. We supplement a strong market rather than pretending to rescue it.' },
    { h: 'The set your timetable cannot staff',                            p: 'Further Mathematics or a third science for four pupils is unviable at one school and routine in a live group drawn from several countries.' },
    { h: 'USD-denominated planning',                                       p: 'Fees invoiced in USD at USD 2,160-6,480 a year — a different proposition from peso-denominated fees in a high-inflation economy.' },
    { h: 'Vaca Muerta and the provinces reached',                          p: 'One of the world\'s great shale plays, an Andean wine province, and a grain corridor — none of them served by the capital\'s school map.' },
    { h: 'Twenty-four jurisdictions, acknowledged',                        p: 'Argentina\'s detail is provincial. We route families to their own authority rather than giving a single national answer.' },
    { h: 'A timezone that genuinely works',                                p: 'Six hours, fixed, with mornings and early afternoons both inside our teaching day and turno mañana/tarde leaving most students a free window.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Argentina?', a: 'Education is obligatory from early childhood through completion of the secondary level under Ley de Educación Nacional 26.206, with the starting age extended down to four by later reform. We are not aware of an established parental-choice home-education route, and we put it in those terms rather than asserting a flat prohibition. Educación domiciliaria y hospitalaria exists in the law as a modality for students who cannot attend for health reasons, not as a parental election.' },
    { q: 'Why do you say to check with my province?', a: 'Because Argentina\'s system is administered by twenty-four jurisdictions — the twenty-three provinces and CABA — each with its own education ministry within the national framework, coordinated through the Consejo Federal de Educación. The operative detail depends on where you live, and any provider giving you a single national answer is simplifying.' },
    { q: 'Buenos Aires already has excellent bilingual schools — what do you add?', a: 'Deliberately little, and we would rather be straight about it. Subject access where a timetable runs out — Further Mathematics, a third science, a clashing set. Fee relief invoiced in USD in a high-inflation economy. And reach into Córdoba, Rosario, Mendoza, and the Neuquén basin where the tier does not exist. If your school covers everything your child needs, we will say so.' },
    { q: 'Is there a post-compulsory window at sixteen?', a: 'No. The obligation runs through completion of the secondary level — one of the longest ranges in our coverage. A provider suggesting otherwise is describing another country.' },
    { q: 'Is Smartious a recognised Argentine school?', a: 'No, and we say so plainly. Private schools here operate with recognition through their jurisdiction. We work alongside your Argentine school; the qualifications we teach carry Cambridge, Edexcel, IB or AP validity.' },
    { q: 'How does the timezone work?', a: 'Six hours, fixed — neither Argentina nor Kenya observes daylight saving. A nine o\'clock Argentine class is three in the afternoon for us and a one o\'clock class is seven in the evening; both are ordinary teaching hours. Turno mañana and turno tarde shifts mean most students have one window genuinely free.' },
    { q: 'We are posted at Vaca Muerta — what are the options?', a: 'Essentially none locally, which is why we built the page. Live teaching reaches the basin and continues unchanged to the next posting — the Permian, the North Sea, or the Gulf — with examinations sat at authorised centres wherever the family is.' },
    { q: 'Which parts of Argentina does Smartious cover?', a: 'Buenos Aires, Córdoba, Rosario and the Paraná corridor, Mendoza, and Neuquén and Vaca Muerta have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which province you are in and which subjects your school cannot offer: in Argentina those two facts are the whole conversation, and they belong in the first message.',
}
