// ═══════════════════════════════════════════════════════════════════
// URUGUAY — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for expatriate, agro-export, tech, and Uruguayan
// families across Montevideo, Punta del Este, Colonia, Salto and Rocha.
// ELEVENTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — URUGUAY IS THE MOST ACTIVELY CONTESTED
// POSITION IN OUR ENTIRE COVERAGE, WITH LIVE LITIGATION. READ ALL:
// - THE CONSTITUTIONAL ARGUMENT (the families' side): ARTICLE 68 of
//   the Uruguayan Constitution establishes that every parent has the
//   right to choose the teachers or schools they wish for their
//   children's education. Article 70 is also referenced in the LGE.
// - THE 2020 STATUTORY CHANGE — CENTRAL AND MUST BE STATED
//   ACCURATELY: article 7 of the Ley General de Educación (2009)
//   originally obliged parents "a inscribirlos en un centro de
//   enseñanza y observar su asistencia y aprendizaje" — to enrol
//   children at a teaching centre and observe their attendance and
//   learning. In 2020, via the Ley de Urgente Consideración (LUC),
//   ARTICLE 7 WAS AMENDED. The amended text makes inicial (from age
//   four), primaria and media compulsory, and provides that parents
//   or legal guardians "tienen el deber de contribuir al
//   cumplimiento de esta obligación" — a duty to CONTRIBUTE TO
//   COMPLIANCE — without specifying WHERE education must occur.
//   The removal of the express enrolment obligation is the whole
//   legal argument.
// - THE LUC WAS CHALLENGED BY REFERENDUM and CONFIRMED at the polls
//   in MARCH 2022, with this article among those impugned — one
//   argument for repeal being precisely that it opened the door to
//   homeschooling. State this; it is a striking fact.
// - THE AUTHORITIES' POSITION (must be given equal weight):
//   * ANEP president Robert Silva: "En Uruguay la obligatoriedad va
//     unida a la asistencia al centro" — the obligation is tied to
//     attendance at a centre — referencing article 16 of the Código
//     de la Niñez y la Adolescencia, under which parents have a duty
//     to ensure regular attendance at study centres and participate
//     in the educational process.
//   * National Education director Gonzalo Baroni: Uruguay cannot
//     carry out homeschooling EVEN IF THE CONSTITUTION PERMITS IT,
//     because THERE IS NO MECHANISM FOR VALIDATING KNOWLEDGE without
//     having passed through a formal institution in compulsory
//     education. THIS IS THE OPERATIVE OBSTACLE — quote its
//     substance, it is more decisive than the constitutional debate.
//   * Codicen president Virginia Cáceres: "No hay norma que habilite
//     la educación en casa" — there is no rule enabling home
//     education.
// - LIVE LITIGATION: in 2024 the ANEP brought legal proceedings
//   against families of a MENNONITE COMMUNITY IN FLORIDA DEPARTMENT
//   who do not send their children to public or private centres.
//   The Codicen majority voted to take the case to the courts; a
//   dissenting councillor, Juan Gabito, argued there were juridical
//   and philosophical grounds to permit homeschooling. Report
//   NEUTRALLY and factually — do not editorialise about a religious
//   community or take sides in ongoing litigation.
// - GROWTH DATA: interest in homeschooling has reportedly risen
//   around 15% over five years per Ministerio de Educación y Cultura
//   figures cited in Uruguayan reporting. Attribute it.
// - THE PRACTICAL CONSEQUENCE — THIS DRIVES OUR OFFER: the absence
//   of official recognition of titles and certifications for those
//   who study at home creates real uncertainty. So even the most
//   optimistic reading of article 68 does not solve the
//   certification problem. SUPPLEMENTARY IS THE DEFAULT, firmly.
// - We are not an ANEP-recognised institution and say so.
// TIMEZONE: UYT (UTC-3), no daylight saving since 2015 — SIX HOURS
// behind Nairobi, same as Brazil and Argentina. Uruguayan mornings
// and early afternoons BOTH work. Uruguayan schools commonly run
// turnos matutino and vespertino.
// MARKET NOTE: Montevideo holds the international tier — British
// Schools Montevideo (founded 1908), Uruguayan American School,
// Colegio Alemán, Lycée Français, Woodlands, St Brendan's, St
// Catherine's — an unusually deep British-heritage sector for a
// country of 3.4 million, much of it IGCSE/IB-offering. Punta del
// Este has become a genuine year-round residential and financial
// destination with substantial Argentine and Brazilian settlement
// plus a tech and remote-work inflow. Uruguay runs one of Latin
// America's strongest digital economies (Zonamerica free zone,
// software export, Google/Microsoft data centres) and a major
// agro-export sector — beef, soy, dairy, and the UPM and Montes del
// Plata pulp mills with Finnish and Chilean investment.
// ═══════════════════════════════════════════════════════════════════

export const URUGUAY_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'montevideo-uy',
    name: 'Montevideo',
    county: 'Montevideo Department',
    region: 'The capital and corporate centre · an unusually deep British-heritage school tradition for a country of three million · Zonamerica and the free-zone technology sector · the diplomatic and Mercosur community',
    primaryKeyword: 'Online school and international curriculum in Montevideo',
    heroTagline: 'For Montevideo families — Cambridge subjects a timetable cannot staff, in a city that has taught the British curriculum since 1908.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Montevideo families. Few cities of three million anywhere have a British-heritage school tradition as deep as Montevideo\'s — the British Schools founded in 1908, the Uruguayan American School, Woodlands, St Brendan\'s, St Catherine\'s, the German and French schools — much of it already offering IGCSE and the IB. We are not here to introduce Cambridge to this city. We are here for the subject sets a single timetable cannot sustain, for families outside the tier\'s fees, and for the free-zone and technology community that keeps arriving. And we set out Uruguay\'s genuinely contested legal position honestly, because it is more contested than almost anywhere we teach.',
    heroImg: '/heroes/montevideo-uy.jpg',
    altTexts: { hero: 'Montevideo and the Río de la Plata' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Montevideo families — subject depth beside a deep British-heritage tier, and the legal position stated fairly. From USD 400/month.',
    challenges: [
      'A strong bilingual and British-heritage tier with competitive places and premium fees.',
      'Specialist A-Level sets often do not run for small cohorts even in good schools.',
      'Uruguay\'s legal position on home education is actively contested, with live litigation.',
      'There is no established mechanism for validating learning acquired outside a formal institution.',
      'Time zone: Uruguay runs UYT (UTC-3) with no daylight saving — six hours behind Nairobi, so mornings and early afternoons both work.',
    ],
    familySituations: [
      'Corporate, financial, and professional families outside the international tier\'s fees.',
      'Zonamerica and free-zone technology and services households.',
      'Diplomatic, Mercosur, and international-organisation families.',
      'Students needing a subject their school cannot staff for a small group.',
      'Students in turno vespertino with mornings free, or matutino with early afternoons free.',
      'Families targeting UK, Spanish, American, or Uruguayan universities.',
    ],
    nearbyAreas: ['Carrasco', 'Pocitos', 'Punta Carretas', 'Ciudad de la Costa', 'Zonamerica', 'Canelones', 'La Barra de Carrasco'],
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
      'University application support — UCAS (UK), Common Application (US), and Spanish, Argentine and Uruguayan university applications',
    ],
    whyChoose: [
      ['The set your school cannot staff', 'Further Mathematics or a third science for four pupils is unviable on one timetable and routine in a live group drawn from several countries.'],
      ['Computing depth for a digital economy', 'Cambridge A-Level Computer Science, Mathematics, and Further Mathematics suit the free-zone software and services sector that has made Uruguay a regional technology leader.'],
      ['Respectful of a tradition older than most', 'Montevideo has taught the British curriculum since 1908. We supplement that market rather than lecture it.'],
      ['A workable clock', 'Six hours, fixed since Uruguay ended daylight saving in 2015 — mornings and early afternoons both land in our teaching day.'],
      ['The contested law given fairly', 'The constitutional argument and the authorities\' position both stated, along with the validation gap that matters more than either.'],
    ],
    growingReason: 'Montevideo holds Uruguay\'s corporate and financial centre, the Zonamerica free zone and its technology sector, the Mercosur and diplomatic community, and a British-heritage school tradition dating to 1908 — inside a legal framework on home education that is actively contested. Uruguay runs UYT (UTC-3), six hours behind Nairobi with no daylight saving.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Montevideo families, taught alongside a Uruguayan school enrolment in the subjects a timetable cannot cover. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Montevideo families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the city\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Uruguay has the most actively contested position in our entire coverage, and it is worth setting out properly because both sides are arguing in good faith and there is live litigation. The constitutional argument rests on article 68, which establishes that every parent has the right to choose the teachers or schools they wish for their children\'s education. The statutory picture changed in 2020: article 7 of the Ley General de Educación of 2009 had obliged parents to enrol children at a teaching centre and observe their attendance and learning, and the Ley de Urgente Consideración amended it so that inicial education from age four, primaria and media are compulsory while parents have a duty to contribute to compliance with that obligation — without specifying where the education must take place. That removal of the express enrolment wording is the whole legal argument, and it was contentious enough that the article was among those challenged in the referendum against the LUC, one argument for repeal being precisely that it opened the door to home education; the law was confirmed at the polls in March 2022. The authorities read it differently and their position deserves equal weight. ANEP president Robert Silva has said that in Uruguay the obligation is tied to attendance at a centre, referencing article 16 of the Código de la Niñez y la Adolescencia under which parents must ensure regular attendance at study centres and participate in the educational process. Codicen president Virginia Cáceres has stated there is no rule enabling education at home. And the national director of education, Gonzalo Baroni, made the point that matters most practically: Uruguay cannot carry out homeschooling even if the Constitution permits it, because there is no mechanism for validating knowledge without having passed through a formal institution in compulsory education. In 2024 the ANEP brought proceedings against families of a Mennonite community in Florida department who do not send their children to public or private centres, with the Codicen majority voting to take the matter to the courts and a dissenting councillor arguing there were juridical grounds to permit home education. We report that neutrally; it is ongoing. Reporting also indicates interest in home education has risen around fifteen per cent over five years on Ministerio de Educación y Cultura figures. What all of this means for a family is straightforward even while the law is unsettled: the absence of official recognition of titles and certifications for those who study at home creates real uncertainty, so our arrangement is teaching alongside a Uruguayan school enrolment. Smartious is not an ANEP-recognised institution.',
    homeTuitionDetail: 'Smartious delivers to Montevideo families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Uruguay sits six hours behind Nairobi with no daylight saving since 2015, so Uruguayan morning and early-afternoon classes both fall in our teaching day at a constant time every week of the year, with all sessions recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Uruguay?', a: 'It is actively contested and there is live litigation. Article 68 of the Constitution gives parents the right to choose the teachers or schools for their children, and the 2020 LUC amendment to article 7 of the Ley General de Educación removed the express obligation to enrol at a teaching centre, replacing it with a duty to contribute to compliance without specifying where education occurs. The authorities read it otherwise: ANEP has said the obligation is tied to attendance at a centre, and Codicen\'s president has said no rule enables education at home. Confirm your own position with ANEP.' },
      { q: 'What is the practical obstacle even if the constitutional argument succeeds?', a: 'Validation. Uruguay\'s national director of education has said the country cannot carry out homeschooling even if the Constitution permits it, because there is no mechanism for validating knowledge without having passed through a formal institution in compulsory education. That is why titles and certifications for home-educated students are not officially recognised, and why we build alongside a school rather than instead of one.' },
      { q: 'What is the Florida case?', a: 'In 2024 the ANEP brought legal proceedings against families of a Mennonite community in Florida department whose children do not attend public or private centres, with the Codicen majority voting to take the matter to the courts. It is ongoing and we report it factually without taking a position.' },
      { q: 'Why would a Montevideo family with good schools use Smartious?', a: 'Usually for a subject their school cannot staff for four pupils, or because the tier\'s fees are out of reach. Montevideo has taught Cambridge since 1908 and we would not pretend to be introducing it.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'punta-del-este-uy',
    name: 'Punta del Este & Maldonado',
    county: 'Maldonado Department',
    region: 'A year-round residential and financial destination · substantial Argentine and Brazilian settlement · a growing tech and remote-work community · schooling that has not matched the residential growth',
    primaryKeyword: 'Online school and international curriculum in Punta del Este',
    heroTagline: 'For Punta del Este and Maldonado families — the resort that became a residence, with a school map still built for a season.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Punta del Este and Maldonado families. Punta has changed: what was a summer destination has become a genuine year-round residence, with substantial Argentine and Brazilian settlement drawn by Uruguay\'s stability and residency regime, a financial and wealth-management presence, and an increasing technology and remote-work population from further afield. Families who once came for January now live here in June. The schooling has not fully caught up, and Montevideo is around two hours west. Smartious teaches Cambridge and IB live to the coast.',
    heroImg: '/heroes/punta-del-este-uy.jpg',
    altTexts: { hero: 'Punta del Este peninsula and coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Punta del Este and Maldonado families — year-round residence, schooling built for a season. From USD 400/month.',
    challenges: [
      'A residential population that grew faster than the year-round schooling around it.',
      'Argentine and Brazilian families arriving mid-curriculum from different systems.',
      'Montevideo\'s tier is around two hours west.',
      'Uruguay\'s legal position on home education is actively contested.',
      'Time zone: Punta shares UYT (UTC-3) with no daylight saving — six hours behind Nairobi.',
    ],
    familySituations: [
      'Argentine and Brazilian families settled under Uruguay\'s residency regime.',
      'Financial services, wealth management, and professional households.',
      'Technology and remote-work families drawn to the coast.',
      'Property, hospitality, and construction business families.',
      'Students arriving mid-curriculum from Argentine or Brazilian systems.',
    ],
    nearbyAreas: ['Punta del Este', 'Maldonado', 'La Barra', 'José Ignacio', 'Manantiales', 'Piriápolis', 'Garzón'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, Portuguese and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Argentine, Brazilian and Uruguayan university applications',
    ],
    whyChoose: [
      ['Continuity for a family that has just moved countries', 'Argentine and Brazilian children arriving mid-curriculum keep one internationally examined pathway instead of restarting inside a third system.'],
      ['Portuguese and Spanish alongside', 'Cambridge Portuguese for Brazilian families and Spanish throughout — both kept rather than traded away.'],
      ['The complete option two hours from the tier', 'Identical live delivery in Punta and Montevideo, without relocating again.'],
      ['A workable clock', 'Six hours, fixed — mornings and early afternoons both land in our teaching day.'],
      ['The contested law given fairly', 'Both the constitutional argument and the authorities\' position, plus the validation gap that decides the practical answer.'],
    ],
    growingReason: 'Punta del Este has become a year-round residence rather than a summer destination, with substantial Argentine and Brazilian settlement under Uruguay\'s residency regime, a financial and wealth-management presence, and a growing technology and remote-work population — with schooling that has not fully matched the growth and Montevideo two hours west. Uruguay runs UYT (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Maldonado, taught alongside a Uruguayan school enrolment, with Portuguese or Spanish available beside the English-medium core.',
      cbc: 'Kenya CBC available for Maldonado families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national position applies in Maldonado and it is contested: article 68 of the Constitution gives parents the right to choose teachers or schools, the 2020 LUC amendment to article 7 of the Ley General de Educación removed the express enrolment obligation and replaced it with a duty to contribute to compliance, and the authorities read that as leaving the obligation tied to attendance at a centre, with Codicen stating no rule enables education at home. The decisive practical point is the absence of a mechanism for validating knowledge acquired outside a formal institution, which means titles and certifications for home-educated students are not officially recognised. Our arrangement is therefore teaching alongside a Uruguayan school enrolment. Families resident in Argentina or Brazil rather than Uruguay follow their own country\'s framework — Brazil\'s STF has held there is no right to home education, and Argentina has no established parental route — which is a question for their advisers and arises frequently in this community.',
    homeTuitionDetail: 'Smartious delivers to Maldonado families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Uruguayan morning or early afternoon, with every session recorded.',
    faqs: [
      { q: 'We have just moved from Buenos Aires or São Paulo — what happens to our child\'s schooling?', a: 'They keep one internationally examined pathway rather than restarting inside a third national system. We run alongside a Uruguayan enrolment while the transition settles, with Portuguese or Spanish kept alongside the English-medium core.' },
      { q: 'Is there international schooling in Punta del Este?', a: 'Some, and less than the year-round residential population now warrants, with Montevideo around two hours west. Live delivery reaches Maldonado identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'colonia-uy',
    name: 'Colonia & the Litoral',
    county: 'Colonia and Río Negro Departments',
    region: 'The Buenos Aires ferry corridor · the UPM and Montes del Plata pulp industry with Finnish and Chilean investment · dairy and agro-industry across the litoral · almost no international schooling',
    primaryKeyword: 'Online school and international curriculum in Colonia',
    heroTagline: 'For Colonia and litoral families — Finnish pulp mills, an hour from Buenos Aires by ferry, and no international school on either count.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Colonia and litoral families. The western departments carry an unusual concentration of international capital for their size: the UPM and Montes del Plata pulp operations built on Finnish and Chilean investment, the dairy and agro-industrial economy of the litoral, and the ferry corridor that puts Buenos Aires an hour across the river. The engineering and management community around the mills is genuinely international; the schooling is not. Montevideo is around two and a half hours east. Smartious teaches Cambridge and IB live across the litoral.',
    heroImg: '/heroes/colonia-uy.jpg',
    altTexts: { hero: 'Colonia del Sacramento and the Río de la Plata' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Colonia, Fray Bentos and litoral families — pulp industry and agro-export, no local provision. From USD 400/month.',
    challenges: [
      'An internationally financed pulp and agro-industrial economy with no international schooling locally.',
      'Montevideo is around two and a half hours east.',
      'Finnish, Chilean and other international staff arrive on project and posting timelines.',
      'Uruguay\'s legal position on home education is actively contested.',
      'Time zone: the litoral shares UYT (UTC-3) with no daylight saving.',
    ],
    familySituations: [
      'Pulp mill engineering, forestry, and operations families — Finnish, Chilean and Uruguayan.',
      'Dairy, agro-industrial, and export business households.',
      'Ferry corridor and cross-river commercial families.',
      'International staff on multi-year postings.',
      'Students aiming at forestry, engineering, or agricultural science programmes abroad.',
    ],
    nearbyAreas: ['Colonia del Sacramento', 'Carmelo', 'Nueva Palmira', 'Fray Bentos', 'Mercedes', 'Young', 'Conchillas'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, Portuguese and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Biology, Geography',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Finnish, Spanish, Argentine and Uruguayan university applications',
    ],
    whyChoose: [
      ['Chemistry and environmental science that fit a pulp economy', 'Cambridge A-Level Chemistry, Biology and Geography suit forestry, process engineering and environmental science routes directly.'],
      ['Portable across a Nordic or Chilean posting', 'The curriculum, teachers, and examination board continue unchanged to the next operation or country.'],
      ['The complete option in a province with none', 'Identical live delivery in Colonia, Fray Bentos and Mercedes as in Montevideo.'],
      ['A workable clock', 'Six hours, fixed — mornings and early afternoons both land in our teaching day.'],
      ['The contested law given fairly', 'Both readings stated, with the validation gap that decides the practical answer.'],
    ],
    growingReason: 'The western litoral carries the UPM and Montes del Plata pulp operations built on Finnish and Chilean investment, the dairy and agro-industrial economy, and the Buenos Aires ferry corridor — with an internationally recruited engineering community and no international schooling, and Montevideo two and a half hours east. Uruguay runs UYT (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the litoral, taught alongside a Uruguayan school enrolment and portable across postings.',
      cbc: 'Kenya CBC available for litoral families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national position applies in the litoral and it is contested: article 68 of the Constitution supports parental choice of teachers and schools, the 2020 LUC amendment to article 7 of the Ley General de Educación removed the express enrolment wording, and the authorities maintain that the obligation remains tied to attendance at a centre. The decisive practical obstacle is the absence of a mechanism for validating learning acquired outside a formal institution, which means home-educated students\' titles are not officially recognised. Our arrangement is teaching alongside a Uruguayan school enrolment, and Smartious is not an ANEP-recognised institution. Internationally posted mill families who are not resident in Uruguay follow their own country\'s framework — Finland requires no permission and does not treat schooling as compulsory in the attendance sense, Chile provides exámenes libres — which are questions for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to litoral families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Uruguayan morning or early afternoon, with every session recorded — built for mill shift patterns.',
    faqs: [
      { q: 'We came with the pulp industry — does the schooling follow if we move on?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next operation anywhere in the world, with examinations sat at authorised centres wherever the family is.' },
      { q: 'Is there international schooling in Colonia or Fray Bentos?', a: 'None. Montevideo is around two and a half hours east. Live delivery reaches the whole litoral identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'salto-uy',
    name: 'Salto & the North',
    county: 'Salto and Paysandú Departments',
    region: 'The northern agro-export and citrus capital · the Salto Grande hydroelectric complex on the Argentine border · thermal tourism · a university regional centre · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Salto',
    heroTagline: 'For Salto, Paysandú and northern families — Uruguay\'s citrus and energy north, five hundred kilometres from any international school.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Salto and northern Uruguayan families. The north runs the country\'s citrus and horticultural export economy, the binational Salto Grande hydroelectric complex on the Argentine border, a thermal tourism sector, and regional university faculties — an economy that exports to Europe and North America and shares a major piece of infrastructure with a neighbouring country. International schooling in the north does not exist, and Montevideo is around five hundred kilometres south. Smartious teaches Cambridge and IB live across northern Uruguay.',
    heroImg: '/heroes/salto-uy.jpg',
    altTexts: { hero: 'Salto and the Uruguay river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Salto, Paysandú and northern Uruguay families — citrus, energy and no local provision. From USD 400/month.',
    challenges: [
      'No international schooling in northern Uruguay, with Montevideo five hundred kilometres south.',
      'A citrus and horticultural export economy trading with Europe and North America.',
      'Cross-border households on the Argentine frontier need to know which framework applies.',
      'Uruguay\'s legal position on home education is actively contested.',
      'Time zone: the north shares UYT (UTC-3) with no daylight saving.',
    ],
    familySituations: [
      'Citrus, horticulture, and agro-export business families.',
      'Salto Grande hydroelectric and engineering households.',
      'Thermal tourism and hospitality businesses.',
      'University faculty and regional professional families.',
      'Cross-border households on the Argentine frontier.',
    ],
    nearbyAreas: ['Salto', 'Paysandú', 'Termas del Daymán', 'Constitución', 'Bella Unión', 'Concordia across the river', 'Tacuarembó'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Geography',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Argentine and Uruguayan university applications',
    ],
    whyChoose: [
      ['The complete option five hundred kilometres from the tier', 'Identical live delivery in Salto and Montevideo — no relocation, no boarding decision.'],
      ['Biology and agricultural science for a citrus economy', 'Cambridge A-Level Biology and Chemistry feed agronomy, food science and horticultural research routes directly.'],
      ['Engineering depth for a binational energy project', 'Cambridge A-Level Physics and Mathematics suit the Salto Grande engineering community.'],
      ['A workable clock', 'Six hours, fixed — mornings and early afternoons both land in our teaching day.'],
      ['Residence stated precisely', 'Cross-border families on the Argentine frontier follow the framework of where they legally reside.'],
    ],
    growingReason: 'Northern Uruguay runs the citrus and horticultural export economy, the binational Salto Grande hydroelectric complex, a thermal tourism sector and regional university faculties — with no international schooling anywhere in the region and Montevideo five hundred kilometres south. Uruguay runs UYT (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for northern Uruguay, taught alongside a Uruguayan school enrolment. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national position applies in the north and it is contested: article 68 of the Constitution supports parental choice, the 2020 LUC amendment to article 7 of the Ley General de Educación removed the express enrolment obligation, and the authorities maintain the obligation is tied to attendance at a centre with no rule enabling education at home. The practical obstacle is the absence of a validation mechanism for learning acquired outside a formal institution, so titles are not officially recognised. Our arrangement is teaching alongside a Uruguayan school enrolment. Cross-border households resident in Argentina follow Argentine law, where we are not aware of an established parental home-education route and where education is compulsory through completion of secondary — a distinction decided by residence rather than proximity, and one for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to northern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Uruguayan morning or early afternoon, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in northern Uruguay?', a: 'None — Montevideo is around five hundred kilometres south. Live delivery reaches Salto, Paysandú and the north identically, with examination travel a few times a year.' },
      { q: 'We have family and business across the river in Argentina — whose rules apply?', a: 'Your country of residence rather than where you trade. Argentina makes education compulsory through completion of secondary and we are not aware of an established parental home-education route there; Uruguay\'s position is contested. Your own advisers can confirm your household\'s position.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'rocha-uy',
    name: 'Rocha & the Eastern Coast',
    county: 'Rocha Department',
    region: 'The eastern beaches — La Paloma, La Pedrera, Cabo Polonio and Punta del Diablo · a settled alternative and remote-work community · the Brazilian border corridor · conservation and coastal ecology',
    primaryKeyword: 'Online school and international curriculum in Rocha',
    heroTagline: 'For Rocha and eastern coast families — the quiet coast that filled with remote workers, and the department where home education questions arrive most.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Rocha and eastern coast families. The east — La Paloma, La Pedrera, Cabo Polonio, Punta del Diablo, Valizas — has drawn a settled alternative, artistic and increasingly remote-working community from Uruguay, Argentina, Brazil and Europe, alongside conservation and coastal-ecology work and the corridor to the Brazilian border at Chuy. It is also, anecdotally, the part of Uruguay where interest in educating outside school runs highest, which makes getting the legal position right more important here than anywhere. Smartious teaches Cambridge and IB live to the eastern coast.',
    heroImg: '/heroes/rocha-uy.jpg',
    altTexts: { hero: 'The Rocha coast at La Pedrera' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Rocha, La Paloma and eastern coast families — remote-work community, contested legal position explained. From USD 400/month.',
    challenges: [
      'A dispersed coastal community with no international schooling anywhere in the department.',
      'High local interest in educating outside school, against an actively contested legal position.',
      'Families spread across small coastal towns rather than clustered in one place.',
      'Cross-border households near the Brazilian frontier follow the framework of where they reside.',
      'Time zone: Rocha shares UYT (UTC-3) with no daylight saving.',
    ],
    familySituations: [
      'Remote-work and creative households settled along the eastern coast.',
      'Conservation, ecology, and environmental-sector families.',
      'Tourism, hospitality, and small-business owners in the coastal towns.',
      'Argentine, Brazilian and European families who settled after visiting.',
      'Families who have considered educating outside school and need the position explained.',
    ],
    nearbyAreas: ['La Paloma', 'La Pedrera', 'Cabo Polonio', 'Punta del Diablo', 'Valizas', 'Rocha city', 'Chuy and the Brazilian border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, Portuguese and home language support',
      'Cambridge A-Level Biology, Geography, Mathematics, Chemistry',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Brazilian, Argentine and Uruguayan university applications',
    ],
    whyChoose: [
      ['The legal position explained where it matters most', 'Rocha is where interest in educating outside school runs highest in Uruguay, and where the contested position and the missing validation mechanism most need setting out honestly.'],
      ['The complete option on a dispersed coast', 'La Paloma, La Pedrera, Punta del Diablo and Valizas get identical live teaching without a commute to anywhere.'],
      ['Ecology and environmental science that fit the place', 'Cabo Polonio, the lagoons and the coastal reserves make unusually serious ground for Cambridge Biology and Geography and AP Environmental Science.'],
      ['Portuguese alongside for the border corridor', 'Cambridge Portuguese runs beside the English-medium core for families with Brazilian ties.'],
      ['A workable clock', 'Six hours, fixed — mornings and early afternoons both land in our teaching day.'],
    ],
    growingReason: 'The Rocha coast — La Paloma, La Pedrera, Cabo Polonio, Punta del Diablo — has drawn a settled alternative and remote-working community from Uruguay, Argentina, Brazil and Europe, alongside conservation work and the Brazilian border corridor, with no international schooling anywhere in the department. Uruguay runs UYT (UTC-3), six hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the eastern coast, taught alongside a Uruguayan school enrolment. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for eastern coast families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Rocha deserves the fullest version of this explanation, because interest in educating outside school runs high here and the position is genuinely unsettled. The constitutional argument rests on article 68, which gives every parent the right to choose the teachers or schools they wish for their children. The 2020 LUC amendment to article 7 of the Ley General de Educación removed the express obligation to enrol children at a teaching centre and replaced it with a duty to contribute to compliance without specifying where education occurs — a change contentious enough that the article was among those challenged in the referendum that confirmed the law in March 2022. The authorities read it otherwise: ANEP has stated the obligation is tied to attendance at a centre, referencing the Código de la Niñez y la Adolescencia, and Codicen\'s president has said no rule enables education at home. Most decisively for planning purposes, the national director of education has said Uruguay cannot carry out homeschooling even if the Constitution permits it, because there is no mechanism for validating knowledge without having passed through a formal institution — which is why titles and certifications for home-educated students are not officially recognised. In 2024 the ANEP brought proceedings against families of a Mennonite community in Florida department, which we report neutrally and which remains ongoing. What that means practically is that even a family persuaded by the constitutional argument still faces the certification problem, and our arrangement is therefore teaching alongside a Uruguayan school enrolment. Households resident in Brazil follow Brazilian law, where the STF has held there is no right to home education. Smartious is not an ANEP-recognised institution.',
    homeTuitionDetail: 'Smartious delivers to eastern coast families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed six-hour offset, landing in the Uruguayan morning or early afternoon, with every session recorded — which suits households that set their own schedule.',
    faqs: [
      { q: 'A lot of families here talk about educating outside school — where does that stand?', a: 'It is genuinely contested. Article 68 supports parental choice and the 2020 amendment removed the express enrolment wording, but ANEP maintains the obligation is tied to attendance, Codicen says no rule enables home education, and there is ongoing litigation. The decisive practical point is that there is no mechanism for validating learning acquired outside a formal institution, so titles are not officially recognised.' },
      { q: 'So what can we actually do?', a: 'Keep a Uruguayan school enrolment and run Cambridge or IB live alongside it. That produces an internationally examined record without depending on an unresolved question, and it is what we build here.' },
      { q: 'We have Brazilian ties across the border — whose rules apply?', a: 'Your country of residence. Brazil\'s Supreme Court has held there is no right to home education there, and educação básica is compulsory from four to seventeen. Your own advisers can confirm your household\'s position.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const URUGUAY_COUNTRY = {
  slug: 'uruguay',
  name: 'Uruguay',
  longName: 'Oriental Republic of Uruguay',
  adjective: 'Uruguayan',
  flag: '🇺🇾',
  hub: '/online-school/uruguay',
  hubPageId: 'homeschooling-uruguay',
  cityPageId: 'uruguay-city',

  currency: 'UYU',
  currencyName: 'Uruguayan Peso',
  currencyPeg: 'Fees are invoiced in USD, which is widely used in Uruguay for larger commitments; peso equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'UYT',
    name: 'Uruguay Time (UTC-3), no daylight saving since 2015',
    utcOffset: '-3',
    offsetFromEAT: '-6 hours — Uruguayan mornings and early afternoons both land in our teaching day, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Uruguay has long-established Cambridge provision through its British-heritage school sector'],
  examCentreTiles: [
    { city: 'Montevideo', centre: 'Authorised provision', area: 'The country\'s external-candidate capacity, confirmed per family per session.' },
    { city: 'Punta del Este', centre: 'Regional provision', area: 'Checked first for Maldonado and eastern families.' },
    { city: 'The interior and the north', centre: 'Planned per session', area: 'Colonia, Salto and Rocha families plan travel into each window well ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Uruguay-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Uruguay is an easier market than most for this: the British-heritage school sector has run IGCSE and A-Level for generations, so provision and familiarity are long established — Montevideo is checked first, with options for Maldonado and travel planned ahead from Colonia, Salto and Rocha. One point of clarity specific to Uruguay: our arrangement runs alongside a Uruguayan school enrolment, which continues its own national track unchanged, and Smartious is not an ANEP-recognised institution. That matters more here than in most markets because there is no established mechanism for validating learning acquired outside a formal institution in compulsory education — so the Uruguayan side of a student\'s record has to come from a Uruguayan school.',
  secondaryProgrammeExamRef: 'Authorised Uruguayan Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/uruguay.jpg',
  heroEyebrow: 'Online school for Uruguay',
  heroH1Suffix: 'Uruguay',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for expatriate, agro-export, technology, and Uruguayan families across Montevideo, Punta del Este, Colonia, Salto, and Rocha. Uruguay has the most actively contested home-education position in our coverage — a constitutional argument, a 2020 statutory change, and live litigation — and we set out all three sides before anything else.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — alongside your Uruguayan school.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Uruguay',

  citiesSectionTitle: 'Where our Uruguay families are',
  citiesSectionBody: 'Smartious Uruguay families concentrate across Montevideo (the corporate capital, the Zonamerica technology sector, and a British-heritage school tradition dating to 1908), Punta del Este and Maldonado (a resort that became a year-round residence, with substantial Argentine and Brazilian settlement), Colonia and the litoral (the UPM and Montes del Plata pulp industry on Finnish and Chilean investment, with the Buenos Aires ferry corridor), Salto and the north (citrus export, the binational Salto Grande complex, five hundred kilometres from any international school), and Rocha and the eastern coast (a settled remote-work and creative community, and the department where home-education questions arrive most). One contested legal position, one missing validation mechanism, and a timezone that works.',

  trustSignals: [
    { h: 'The contested position given all three sides', p: 'Article 68 of the Constitution supports parental choice; the 2020 LUC amendment removed the express enrolment obligation from article 7 of the Ley General de Educación; and ANEP maintains the obligation is tied to attendance at a centre, with Codicen stating no rule enables education at home. We present all of it rather than the version that suits us.' },
    { h: 'The validation gap, which decides the practical answer', p: 'Uruguay\'s national director of education has said the country cannot carry out homeschooling even if the Constitution permits it, because there is no mechanism for validating knowledge without having passed through a formal institution. That, rather than the constitutional debate, is why we build alongside a school.' },
    { h: 'A timezone that works', p: 'Uruguay runs UYT (UTC-3) with no daylight saving since 2015, and Kenya observes none either — a fixed six-hour gap. Uruguayan mornings and early afternoons both land in our teaching day, and turno matutino/vespertino leaves most students one window free.' },
    { h: 'Honest about a market that got here first', p: 'The British Schools Montevideo were founded in 1908. We are not introducing Cambridge to Uruguay — we add the subject sets a single timetable cannot staff and reach the departments the tier never left the capital for.' },
  ],

  universitiesInCountry: 'the Universidad de la República — one of the largest and oldest in the region — the Universidad ORT Uruguay, the Universidad Católica del Uruguay, the Universidad de Montevideo, and the Universidad Tecnológica with campuses across the interior.',
  universityChannels: 'Uruguayan universities admit on the national bachillerato, and foreign qualifications go through reválida and recognition procedures with requirements confirmed per institution — a family intending to enter the Uruguayan system should begin that early, and note that the absence of a validation mechanism for learning acquired outside a formal institution is precisely why a Uruguayan school enrolment matters alongside our teaching. Outward, Uruguayan students are strongly oriented toward Spain and Argentina, with the United States and Canada growing, and all of them read Cambridge A-Levels, the IB Diploma and AP records directly. UCAS reads A-Levels natively, and A-Levels are accepted in 160+ countries — including the forestry, agricultural science and engineering programmes our litoral and northern families most often have in view. Smartious provides personalised university guidance across Spanish, Argentine, US, Canadian, UK (UCAS), and Uruguayan destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Uruguay families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes on a fixed six-hour offset with no seasonal drift — Uruguayan mornings and early afternoons both work, which suits both turnos — run alongside a Uruguayan school enrolment that continues its own national track unchanged. Cambridge Spanish and Portuguese available beside the English-medium core. Examinations at authorised provision confirmed per session.',
  britishCurriculumSuits: 'Uruguay families targeting the Cambridge pathway. Best fit for: (1) students needing a subject their school cannot staff for a small cohort, (2) Colonia, Salto and Rocha families with no international provision in their department, (3) Punta del Este households that arrived recently from Argentina or Brazil, (4) Montevideo families outside the international tier\'s fees, (5) internationally posted pulp, agro-export and technology families whose assignments move.',
  britishCurriculumDelivery: 'Live online classes in the Uruguayan morning or early afternoon, small groups 4-6 students, every session recorded, alongside a Uruguayan school enrolment.',
  ibDiplomaSuits: 'Uruguay families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Uruguay families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Uruguay is the market where the law is most actively being argued while we write — a constitutional provision, a 2020 amendment, a referendum, and a case before the courts — and where we would rather set out all of it than pick the version that helps us.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the litoral\'s pulp and process-engineering families, the north\'s agricultural science households, and Montevideo\'s technology community. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Uruguay has a British-heritage school tradition out of all proportion to its size — the British Schools Montevideo founded in 1908, the Uruguayan American School, Woodlands, St Brendan\'s, St Catherine\'s, the German and French schools — much of it already offering IGCSE and the IB, and all of it concentrated in and around the capital. We are not competing with that tradition and would not pretend to. The gaps are the subject sets no single timetable can sustain, the fees, and the four departments outside Montevideo where international provision simply does not exist.',
  competitors: [
    { name: 'British Schools Montevideo (est. 1908)',          city: 'Montevideo',            curriculum: 'British, IGCSE and IB',                 feesUsd: 'Premium tier',                                      feesAed: 'Competitive places',      rating: 4.8, capacityNote: 'More than a century of Cambridge teaching — the national benchmark' },
    { name: 'Uruguayan American School, Woodlands, St Brendan\'s', city: 'Montevideo',        curriculum: 'American, IB and bilingual',            feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.6, capacityNote: 'A deep second tier for a country of three million — capital-bound' },
    { name: 'The German and French schools',                   city: 'Montevideo',            curriculum: 'National-system bilingual',              feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.5, capacityNote: 'Strong heritage schools — a different route entirely' },
    { name: 'Punta del Este and Maldonado',                    city: 'The east coast',        curriculum: 'Thin for a year-round population',       feesUsd: 'Limited international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'A resort that became a residence, with schooling still catching up' },
    { name: 'Colonia, Salto and Rocha',                        city: 'The interior and coasts', curriculum: '—',                                   feesUsd: 'No international provision',                         feesAed: '—',                       rating: 0,   capacityNote: 'Pulp mills on Finnish investment, a citrus export economy, and a settled coastal community — none with international schooling' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh (online)',  city: 'Online',                curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious — UK providers are closer to Uruguay on the clock than we are' },
    { name: 'Smartious Homeschool (Uruguay via online delivery)', city: 'Delivered to all Uruguay', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year',                            feesAed: 'UYU equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + the sets a timetable cannot staff + the four departments reached + all three sides of the contested legal position' },
  ],

  legalFrameworkIntro: 'Uruguay has the most actively contested position in our entire coverage — a constitutional provision, a statutory change, a referendum, and a case before the courts. We are going to set out all of it, including the argument that runs against our commercial interest.',
  legalFramework: [
    { h: 'The constitutional argument', p: 'Article 68 of the Uruguayan Constitution establishes that every parent has the right to choose the teachers or schools they wish for the education of their children. Families and advocates read that as constitutional protection for educating outside a formal institution, and Uruguayan reporting has placed the country alongside Chile and Colombia in the category where home education is legal but lacks specific regulation defining requirements, supervision, and official recognition of learning.' },
    { h: 'The 2020 statutory change, which is the crux', p: 'Article 7 of the Ley General de Educación of 2009 originally obliged parents, mothers, or legal guardians to enrol children at a teaching centre and observe their attendance and learning. In 2020, through the Ley de Urgente Consideración, that article was amended: the new text makes inicial education from age four, primaria and media compulsory, and provides that parents and legal guardians have a duty to contribute to compliance with that obligation — without specifying where the education must occur. The removal of the express enrolment wording is the whole legal argument, and it was contentious enough that the article was among those challenged in the referendum against the LUC, with one argument for repeal being precisely that it opened the door to home education. The law was confirmed at the polls in March 2022.' },
    { h: 'The authorities\' position, given equal weight', p: 'The education authorities read the same texts differently and their view deserves stating fully. ANEP president Robert Silva has said that in Uruguay the obligation is tied to attendance at a centre, referencing article 16 of the Código de la Niñez y la Adolescencia, under which parents have a duty to ensure regular attendance at study centres and to participate in the educational process. Codicen president Virginia Cáceres has stated flatly that there is no rule enabling education at home. Both are the operative authorities for compulsory education in Uruguay, and a family planning around the constitutional argument alone is planning against the institutions that administer the system.' },
    { h: 'The obstacle that decides the practical question', p: 'Set the constitutional debate aside for a moment, because there is a more decisive point. Uruguay\'s national director of education, Gonzalo Baroni, has made it plainly: Uruguay has no possibility of carrying out homeschooling even if the Constitution permits it, because there is no mechanism for validating knowledge without having passed through a formal institution in compulsory education. That is why the absence of official recognition of titles and certifications for those who study at home creates real uncertainty for families. Even the most optimistic reading of article 68 leaves a student without a route to a recognised Uruguayan qualification — and that, rather than the philosophical argument, is why our arrangement runs alongside a Uruguayan school.' },
    { h: 'The case before the courts', p: 'In 2024 the ANEP brought legal proceedings against families of a Mennonite community in Florida department whose children do not attend public or private centres, with the Codicen majority voting to take the matter to the courts; a dissenting councillor argued there were juridical and philosophical grounds to permit home education. We report this factually and without taking a position — it is ongoing, it involves a religious community, and it is not our place to litigate it on a school website. What it does tell a Uruguayan family is that the question is live rather than theoretical, and that enforcement happens.' },
    { h: 'What we therefore offer, and the clock', p: 'Live Cambridge or IB teaching alongside a Uruguayan school enrolment. The school carries the compulsory-education obligation and the recognised national record; we teach the internationally examined track alongside it. Smartious is not an ANEP-recognised institution and does not issue Uruguayan qualifications. On timing, Uruguay is one of our easier relationships: UYT at UTC-3 with no daylight saving since 2015, against our UTC+3, gives a fixed six-hour gap, so Uruguayan morning and early-afternoon classes both fall in our normal teaching day — and with schools commonly running turno matutino and vespertino, most students have one of those windows genuinely free.' },
  ],

  whySmartious: [
    { h: 'All three sides of a live argument',                             p: 'The constitutional case, the 2020 amendment, and the authorities\' position — including the parts that cut against us. Uruguayan families are well informed and deserve the whole picture.' },
    { h: 'The validation gap named as decisive',                           p: 'Even if the constitutional argument succeeds, there is no mechanism to validate learning acquired outside a formal institution. That is why we build alongside a school.' },
    { h: 'The set your timetable cannot staff',                            p: 'Montevideo has taught Cambridge since 1908. What a strong school still cannot do is run Further Mathematics for four pupils.' },
    { h: 'Four departments the tier never reached',                        p: 'Colonia\'s pulp industry, Salto\'s citrus economy, Rocha\'s coastal community and Maldonado\'s year-round residents — none with international schooling.' },
    { h: 'A timezone that works',                                          p: 'Six hours, fixed since 2015 — mornings and early afternoons both inside our teaching day, with turno matutino/vespertino leaving most students one free window.' },
    { h: 'Portuguese and Spanish kept',                                     p: 'For a country between Argentina and Brazil with settlement from both, the languages stay alongside the English-medium core rather than being traded away.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Uruguay?', a: 'It is actively contested. Article 68 of the Constitution gives parents the right to choose teachers or schools, and the 2020 LUC amendment to article 7 of the Ley General de Educación removed the express obligation to enrol at a teaching centre, replacing it with a duty to contribute to compliance without specifying where education occurs — a change challenged in the referendum that confirmed the law in March 2022. The authorities read it otherwise: ANEP says the obligation is tied to attendance at a centre and Codicen\'s president has said no rule enables education at home. There is also ongoing litigation. Confirm your own position with ANEP.' },
    { q: 'Even if the constitutional argument is right, what stops it working?', a: 'Validation. Uruguay\'s national director of education has said the country cannot carry out homeschooling even if the Constitution permits it, because there is no mechanism for validating knowledge without having passed through a formal institution in compulsory education. Titles and certifications for home-educated students are not officially recognised, which is the practical obstacle regardless of how the constitutional question resolves.' },
    { q: 'What is the ANEP case in Florida department?', a: 'In 2024 the ANEP brought legal proceedings against families of a Mennonite community whose children do not attend public or private centres, with the Codicen majority voting to take the matter to the courts and a dissenting councillor arguing there were grounds to permit home education. We report it factually; it is ongoing and we do not take a position.' },
    { q: 'So what does Smartious actually offer in Uruguay?', a: 'Live Cambridge or IB teaching alongside a Uruguayan school enrolment. The school carries the compulsory obligation and the recognised national record; we teach the internationally examined track alongside it. We are not an ANEP-recognised institution.' },
    { q: 'Why would a Montevideo family with excellent schools need us?', a: 'Usually one thing: a subject set the timetable cannot sustain — Further Mathematics, a third science, a clash. Beyond that, fees, and reach if you are in Colonia, Salto, Rocha or Maldonado. Montevideo has taught Cambridge since 1908 and we would not pretend otherwise.' },
    { q: 'How does the timezone work?', a: 'Six hours, fixed — Uruguay ended daylight saving in 2015 and Kenya observes none. Uruguayan mornings and early afternoons both land in our teaching day, and turno matutino/vespertino means most students have one window genuinely free.' },
    { q: 'Where do Uruguayan students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session. Uruguay\'s British-heritage sector has run IGCSE and A-Level for generations, so provision is well established — Montevideo first, with travel planned ahead from the interior.' },
    { q: 'Which parts of Uruguay does Smartious cover?', a: 'Montevideo, Punta del Este and Maldonado, Colonia and the litoral, Salto and the north, and Rocha and the eastern coast have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which school your child attends and which subjects it cannot offer: in Uruguay the school enrolment does work our teaching cannot replace, and that conversation belongs at the start.',
}
