// ═══════════════════════════════════════════════════════════════════
// PAKISTAN — Smartious city-level + country-level data (v2 UPGRADE)
// Live online Cambridge IGCSE/O-Level, A-Level, Pearson Edexcel, IB
// Diploma, and American AP for Pakistani, expat, and internationally
// mobile families across Karachi, Lahore, Islamabad & Rawalpindi,
// Faisalabad, Peshawar, and Multan.
//
// UPGRADE NOTE: Pakistan previously ran as a legacy simple page via
// data/countries.js (isPakistan rich sections). This v2 file takes
// over the /online-school/pakistan route through the standard hub
// dispatch. The legacy object in countries.js is left untouched and
// simply becomes unused for that route. Legacy material worth
// keeping has been carried across: waitlists at the top schools,
// schedule conflicts, curriculum portability, the Karachi/Lahore
// traffic argument, and tutoring economics.
//
// LEGAL POSITIONING NOTE — READ BEFORE EDITING:
// Pakistan is a LIGHTLY-REGULATED, PROVINCIAL market — closest to
// our Gulf/Africa pattern, NOT to any European permission tier.
// - Article 25-A of the Constitution (inserted 2010) obliges the
//   STATE to provide free and compulsory education to all children
//   aged five to sixteen, and education is a PROVINCIAL subject
//   since the 18th Amendment: Sindh, Punjab, Khyber Pakhtunkhwa,
//   Balochistan, and the Islamabad Capital Territory each legislate
//   their own right-to-education acts.
// - Those acts are framed around ensuring children are IN education
//   and are aimed at out-of-school children; none establishes a
//   registration regime for home-educating families, and parental
//   choice in private and international education is long-standing
//   and unrestricted in practice. State it that way — a duty on the
//   state and an unregulated space for families — NOT as a positive
//   statutory "right to homeschool". Do not overclaim.
// - Families should confirm anything specific to their province
//   with their own advisers; we never assert provincial outcomes.
// - THE WINDOW: Article 25-A runs to sixteen — which is Matric /
//   O-Level age. Intermediate (grades XI-XII) and A-Levels sit
//   beyond it, so the A-Level phase is entirely a family choice.
// THE SIGNATURE DIFFERENTIATOR — IBCC EQUIVALENCE:
// Pakistani university admission on foreign qualifications runs
// through the Inter Board Committee of Chairmen (IBCC) equivalence
// certificate. IBCC has generally required Pakistani nationals to
// have taken Pakistan Studies, Urdu, and Islamiyat for O-Level
// equivalence, with subject-count and grade rules for A-Level
// equivalence. ALWAYS hedge — "requirements are confirmed with
// IBCC per case, and change" — but ALWAYS raise it: no competitor
// plans for it, and a family that discovers it at eighteen has a
// real problem. Plan those subjects into the timetable early.
// - O-LEVEL vs IGCSE NUANCE: Pakistan's Cambridge tradition runs
//   through O Level more than IGCSE, and IBCC equivalence practice
//   is built around it. Offer both; plan the choice deliberately.
// MARKET NOTE: Pakistan has genuinely world-class private schools —
// Karachi Grammar (KGS), Aitchison College, Lahore Grammar (LGS),
// Beaconhouse, The City School, The Lyceum, Cedar College, Roots
// Millennium, Headstart, ISOI. Position with RESPECT, never against
// them: waitlists, timetable rigidity, portability, and traffic are
// the wedges — not quality. Fees: premium tier quoted locally in
// PKR; hedge rather than inventing figures.
// EXAM INFRASTRUCTURE: strong — British Council Pakistan runs
// Cambridge, Pearson Edexcel and OxfordAQA for private candidates
// in Karachi, Lahore, Islamabad and Rawalpindi among others.
// Registration deadlines fall well ahead of each series; hedge as
// always with "confirmed per family per session".
// TIMEZONE: PKT (UTC+5), no daylight saving — TWO HOURS AHEAD of
// Nairobi EAT year-round. Live afternoon Nairobi teaching lands in
// the Pakistani late afternoon and early evening.
// ═══════════════════════════════════════════════════════════════════

export const PAKISTAN_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'karachi-pk',
    name: 'Karachi',
    county: 'Sindh',
    region: 'The commercial capital · the port and the corporate headquarters · Karachi Grammar, The Lyceum, Cedar College and the country\'s deepest Cambridge tradition · and its worst school commute',
    primaryKeyword: 'Online school and homeschool in Karachi',
    heroTagline: 'For Karachi families from Clifton to DHA — live Cambridge delivery that recovers two hours of traffic a day and never has a waitlist.',
    intro: 'Live online Cambridge IGCSE and O-Level, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Karachi families. Karachi is Pakistan\'s commercial capital — the port, the banks, the corporate headquarters — and the home of the country\'s deepest Cambridge tradition: Karachi Grammar School, The Lyceum, Cedar College, Bay View, and the Beaconhouse and City School campuses have prepared generations for LUMS, IBA, and universities abroad. Smartious is not built to replace them. It is built for the families those schools cannot fit today: the multi-year waitlist, the cricket or music schedule the timetable will not bend around, the business life that moves between Karachi and Dubai, and the ninety minutes a day that Clifton and DHA traffic simply take. Live small-group classes, unlimited recordings, year-round admission — with British Council Karachi carrying the examinations and IBCC equivalence planned from the first term.',
    heroImg: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Karachi skyline and the Arabian Sea coast' },
    seoDesc: 'Live online Cambridge IGCSE, O-Level, A-Level, Pearson Edexcel, IB Diploma and American AP for Karachi families — no waitlist, IBCC equivalence planned, British Council Karachi exams. From USD 400/month.',
    challenges: [
      'Multi-year waitlists at the most established Cambridge schools — a real barrier for families relocating mid-year or deciding late.',
      'Fixed timetables that clash with serious cricket, hockey, music, or competitive training commitments.',
      'Clifton, DHA, and city-centre traffic that can add sixty to a hundred and twenty minutes to a child\'s day.',
      'IBCC equivalence requirements for Pakistani university admission — discovered late by families who never planned the subject set.',
      'Time zone: Pakistan runs PKT (UTC+5) year-round — two hours ahead of Nairobi EAT, so live teaching lands in the Karachi late afternoon and early evening.',
    ],
    familySituations: [
      'Business and corporate families moving between Karachi, the Gulf, and the UK.',
      'Families waitlisted at KGS, The Lyceum, Cedar College, or the top Beaconhouse and City School campuses.',
      'Serious young athletes and musicians whose training will not fit a fixed timetable.',
      'Families adding Cambridge subjects their current school does not offer, or deepening exam preparation.',
      'Students past Matric or O-Level running the full A-Level phase.',
      'Families planning IBCC equivalence for LUMS, IBA, NUST, Habib, or AKU admission.',
    ],
    nearbyAreas: ['Clifton', 'DHA Phases I-VIII', 'PECHS', 'Gulshan-e-Iqbal', 'North Nazimabad', 'Bahria Town Karachi', 'Gulistan-e-Johar'],
    subjects: [
      'Cambridge IGCSE and O Level Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE and O Level Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge O Level Pakistan Studies, Urdu, and Islamiyat — planned for IBCC equivalence',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Pakistani admissions with IBCC equivalence (LUMS, IBA, NUST, Habib, AKU, GIKI)',
    ],
    whyChoose: [
      ['No waitlist, any week of the year', 'Admission is not a queue: students typically begin within a week of the assessment, mid-term transfers from Cambridge schools included.'],
      ['Two hours of traffic returned to the family', 'The Clifton and DHA school run disappears — and the recovered hours go into deeper study, training, or simply being at home.'],
      ['IBCC equivalence planned, not discovered', 'Pakistan Studies, Urdu, and Islamiyat sit in the timetable from the start for families who may want Pakistani university admission — with current requirements confirmed with IBCC per case.'],
      ['A school that follows the family', 'Karachi this year, Dubai or London next — same teachers, same board, no enrolment break.'],
      ['Examinations at British Council Karachi', 'Cambridge, Edexcel, and OxfordAQA sittings as private candidates, registration handled and confirmed per session.'],
    ],
    growingReason: 'Karachi is Pakistan\'s commercial capital and the home of its deepest Cambridge tradition — KGS, The Lyceum, Cedar College, Bay View, Beaconhouse and City School — where the constraints are waitlists, timetable rigidity, portability, and a school commute measured in hours rather than minutes. Pakistan runs PKT (UTC+5), two hours ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and O Level, and Cambridge A-Level — Smartious\'s primary offer for Karachi families, with the O-Level route planned deliberately where IBCC equivalence matters. Examinations at British Council Karachi as private candidates, confirmed per family per session.',
      cbc: 'Kenya CBC available for Karachi families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Pakistan places the duty on the state rather than a registration burden on families: Article 25-A obliges the state to provide free and compulsory education for children aged five to sixteen, education is a provincial subject, and the provincial right-to-education acts are aimed at bringing out-of-school children into education — none establishes a registration regime for home-educating families, and parental choice in private and international education is long-standing and unrestricted in practice. Families enrol with Smartious directly and sit examinations as British Council private candidates. Two planning points do the real work in Karachi: IBCC equivalence subjects for anyone who may want a Pakistani university, planned from the first term rather than discovered at eighteen; and the post-sixteen phase, where Article 25-A no longer applies and the A-Level years run entirely at the family\'s choice. Anything specific to a family\'s circumstances in Sindh is worth confirming with their own advisers.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation for Karachi families during Cambridge and IB examination preparation periods, subject to associate teacher availability.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes land in the Karachi late afternoon and early evening — Pakistan is two hours ahead of Nairobi EAT — with every session recorded for unlimited rewatch, which is what makes the model work for training schedules and travelling families.',
    faqs: [
      { q: 'Is online homeschooling legal in Karachi and Pakistan generally?', a: 'Pakistan has no registration regime for home-educating or online-schooled families. Article 25-A obliges the state to provide free and compulsory education for children aged five to sixteen, education is a provincial subject, and the provincial acts are aimed at out-of-school children rather than at regulating parental choice in private international education. Families enrol with Smartious directly and sit examinations as British Council private candidates.' },
      { q: 'What is IBCC equivalence and why does it matter?', a: 'Pakistani university admission on foreign qualifications runs through an Inter Board Committee of Chairmen equivalence certificate. IBCC has generally required Pakistani nationals to have taken Pakistan Studies, Urdu, and Islamiyat for O-Level equivalence, with subject and grade rules at A-Level. Requirements change and are confirmed with IBCC per case — which is exactly why we plan those subjects into the timetable early rather than leaving a family to discover them at eighteen.' },
      { q: 'How does Smartious compare to Karachi Grammar, The Lyceum, or Cedar College?', a: 'Those are excellent schools and we are not built to replace them for families they fit — they offer prestige, in-person culture, and an established local peer network an online school cannot match. Smartious differs on flexibility (live classes plus unlimited recordings, year-round admission, no waitlist), portability (the same school follows the family to the Gulf, UK, or Canada), and a global cohort rather than a single-city one.' },
      { q: 'Where do Karachi students sit Cambridge and Edexcel examinations?', a: 'At British Council Pakistan centres in Karachi, as private candidates — Cambridge IGCSE and O Level, Cambridge A-Level, Pearson Edexcel, and OxfordAQA. Smartious handles registration and confirms the centre and series per family, with mock examinations run beforehand.' },
      { q: 'Can my child do Smartious alongside their current Cambridge school?', a: 'Yes — it is one of the most common configurations in Karachi: the school carries the enrolment and the daily routine, while Smartious adds subjects the school does not offer, deepens exam preparation, or runs the A-Level phase. Recordings make it workable alongside a full school day.' },
      { q: 'Will Pakistani universities accept these qualifications?', a: 'Cambridge, Edexcel, and IB qualifications are long-established routes into LUMS, IBA Karachi, NUST, Habib University, AKU, and GIKI — through IBCC equivalence, with requirements confirmed per case. UCAS and the Common Application stand open internationally.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'lahore-pk',
    name: 'Lahore',
    county: 'Punjab',
    region: 'The cultural and academic capital · Aitchison College, Lahore Grammar School, and the LUMS pipeline · Punjab\'s corporate and industrial centre',
    primaryKeyword: 'Online school and homeschool in Lahore',
    heroTagline: 'For Lahore families from Gulberg to DHA — live Cambridge delivery beside the country\'s most established schools, with no queue and no timetable to fight.',
    intro: 'Live online Cambridge IGCSE and O-Level, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Lahore families. Lahore is Pakistan\'s cultural and academic capital — Aitchison College, Lahore Grammar School, the Beaconhouse and City School networks, and the LUMS pipeline that runs through them all. It is also a city where the best schools are the hardest to enter, where serious sport and music collide with fixed timetables, and where the Gulberg and DHA school run takes what it takes. Smartious works alongside that ecosystem rather than against it: live small-group Cambridge teaching, unlimited recordings, year-round admission, British Council Lahore examinations, and IBCC equivalence planned from the first term.',
    heroImg: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Lahore Badshahi Mosque and the old city' },
    seoDesc: 'Live online Cambridge IGCSE, O-Level, A-Level, Pearson Edexcel, IB Diploma and American AP for Lahore families — no waitlist, IBCC equivalence planned, British Council Lahore exams. From USD 400/month.',
    challenges: [
      'The most established schools — Aitchison, LGS, the top network campuses — are the hardest to enter, especially mid-year.',
      'Fixed timetables that clash with serious cricket, hockey, music, or competitive training.',
      'Gulberg, DHA, and Cantt traffic taking an hour or more out of the school day.',
      'IBCC equivalence requirements for Pakistani university admission — planned early or discovered late.',
      'Time zone: Lahore runs PKT (UTC+5) year-round — two hours ahead of Nairobi EAT.',
    ],
    familySituations: [
      'Families waitlisted at Aitchison, LGS, or the top network campuses.',
      'Business and industrial families with interests across Punjab, the Gulf, and the UK.',
      'Serious young athletes and musicians needing schedule flexibility.',
      'Families adding Cambridge subjects their school does not offer, or deepening exam preparation.',
      'Students past Matric or O-Level running the full A-Level phase toward LUMS or abroad.',
    ],
    nearbyAreas: ['Gulberg', 'DHA Lahore', 'Model Town', 'Johar Town', 'Bahria Town Lahore', 'Cantt', 'Askari'],
    subjects: [
      'Cambridge IGCSE and O Level Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE and O Level Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge O Level Pakistan Studies, Urdu, and Islamiyat — planned for IBCC equivalence',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Pakistani admissions with IBCC equivalence (LUMS, NUST, FAST, UET)',
    ],
    whyChoose: [
      ['No waitlist at the hardest doors', 'Admission is year-round, mid-term transfers routine, and students typically start within a week of the assessment.'],
      ['The timetable bends to the training', 'Live classes plus unlimited recordings — built for children whose cricket, hockey, or music schedule is not negotiable.'],
      ['IBCC equivalence planned, not discovered', 'Pakistan Studies, Urdu, and Islamiyat planned in from the start where Pakistani university admission may matter — requirements confirmed with IBCC per case.'],
      ['A school that follows the family', 'Lahore this year, London or Dubai next — same teachers, same board, no break.'],
      ['Examinations at British Council Lahore', 'Cambridge, Edexcel, and OxfordAQA as private candidates, registration handled and confirmed per session.'],
    ],
    growingReason: 'Lahore is Pakistan\'s cultural and academic capital — Aitchison, LGS, the network campuses, and the LUMS pipeline — where the constraint is rarely quality and almost always access, timing, and schedule. Lahore runs PKT (UTC+5), two hours ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and O Level, and Cambridge A-Level — Smartious\'s primary offer for Lahore families, with the O-Level route planned deliberately where IBCC equivalence matters. Examinations at British Council Lahore, confirmed per session.',
      cbc: 'Kenya CBC available for Lahore families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Punjab as elsewhere: Article 25-A places the duty on the state to provide free and compulsory education for children aged five to sixteen, education is a provincial subject, and Punjab\'s right-to-education framework is aimed at out-of-school children rather than at regulating parental choice in private international education — with no registration regime for home-educating families. Smartious families enrol directly and sit examinations as British Council private candidates, with IBCC equivalence subjects planned early and the post-sixteen A-Level phase entirely at the family\'s choice. Province-specific questions belong with a family\'s own advisers.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation for Lahore families during examination preparation periods, subject to associate teacher availability.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes land in the Lahore late afternoon and early evening on the +2 hour offset, with every session recorded for unlimited rewatch.',
    faqs: [
      { q: 'How does Smartious compare to Aitchison or LGS?', a: 'They are excellent institutions with prestige and in-person culture an online school cannot match, and we do not position against them. Smartious differs on access (no waitlist, year-round admission), flexibility (live classes plus unlimited recordings), and portability (the same school continues if the family moves).' },
      { q: 'Where do Lahore students sit Cambridge examinations?', a: 'At British Council Pakistan centres in Lahore as private candidates, with registration handled by Smartious and the centre and series confirmed per family.' },
      { q: 'Can my child study with Smartious alongside their current school?', a: 'Yes — the school carries the daily routine while Smartious adds subjects it does not offer, deepens exam preparation, or runs the A-Level phase. Recordings make it workable alongside a full timetable.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'islamabad-pk',
    name: 'Islamabad & Rawalpindi',
    county: 'Islamabad Capital Territory / Punjab',
    region: 'The capital and its twin city · the diplomatic and development community · ISOI, Roots Millennium, Headstart · NUST and the university corridor',
    primaryKeyword: 'Online school and homeschool in Islamabad and Rawalpindi',
    heroTagline: 'For Islamabad and Rawalpindi families — the capital\'s diplomatic and professional community, served live, with British Council examinations in both cities.',
    intro: 'Live online Cambridge IGCSE and O-Level, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Islamabad and Rawalpindi families. The twin cities carry Pakistan\'s diplomatic corps, its development and international-organisation community, its federal institutions, and a professional class whose careers regularly move between Islamabad, the Gulf, and the West. Their schooling — the International School of Islamabad, Roots Millennium, Headstart, the Beaconhouse and City School campuses — is strong and finite, and postings rarely arrive on admission cycles. Smartious delivers the international pathways live: year-round admission, unlimited recordings, British Council examinations in both cities, and IBCC equivalence planned from the first term.',
    heroImg: 'https://images.unsplash.com/photo-1589129140837-67287c22521f?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Faisal Mosque and the Margalla Hills, Islamabad' },
    seoDesc: 'Live online Cambridge IGCSE, O-Level, A-Level, Pearson Edexcel, IB Diploma and American AP for Islamabad and Rawalpindi families — diplomatic community, no waitlist, British Council exams. From USD 400/month.',
    challenges: [
      'Diplomatic and development postings arrive mid-year, not on admission cycles — and the capital\'s international provision is finite.',
      'Families rotating between Islamabad, the Gulf, and Western capitals need curriculum that transfers without a repeated year.',
      'IBCC equivalence requirements for Pakistani university admission — planned early or discovered late.',
      'Sector-to-sector and twin-city commuting takes real time out of the day.',
      'Time zone: the capital runs PKT (UTC+5) year-round — two hours ahead of Nairobi EAT.',
    ],
    familySituations: [
      'Diplomatic, development, and international-organisation families across the capital.',
      'Federal-institution and professional families in both cities.',
      'Returning diaspora families keeping an international curriculum continuous.',
      'Families waitlisted at ISOI, Roots Millennium, or Headstart.',
      'Students past Matric or O-Level running the full A-Level phase toward NUST or abroad.',
    ],
    nearbyAreas: ['F-6 / F-7 / F-8', 'E-11', 'DHA Islamabad', 'Bahria Town', 'Rawalpindi Cantt', 'Bani Gala', 'Gulberg Greens'],
    subjects: [
      'Cambridge IGCSE and O Level Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE and O Level Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge O Level Pakistan Studies, Urdu, and Islamiyat — planned for IBCC equivalence',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Pakistani admissions with IBCC equivalence (NUST, QAU, FAST, Air University)',
    ],
    whyChoose: [
      ['Enrolment at posting speed', 'Families arrive mid-year; students typically start within a week of the assessment, with no waitlist anywhere in the year.'],
      ['Built for rotation', 'Islamabad, then Doha, then Geneva — the curriculum, teachers, and examination board stay constant across every posting.'],
      ['IBCC equivalence planned, not discovered', 'Pakistan Studies, Urdu, and Islamiyat planned in early where Pakistani university admission may matter — confirmed with IBCC per case.'],
      ['Examinations in both cities', 'British Council Pakistan serves private candidates in Islamabad and Rawalpindi, confirmed per family per session.'],
      ['Live teaching, small groups', 'Every Smartious class is live, real-time, in groups of 4-6, with unlimited recordings behind them.'],
    ],
    growingReason: 'Islamabad and Rawalpindi carry Pakistan\'s diplomatic corps, development community, federal institutions, and a rotating professional class — with strong but finite international schooling and postings that rarely arrive on admission cycles. The capital runs PKT (UTC+5), two hours ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and O Level, and Cambridge A-Level — Smartious\'s primary offer for the twin cities, with the O-Level route planned where IBCC equivalence matters. Examinations at British Council Islamabad and Rawalpindi, confirmed per session.',
      cbc: 'Kenya CBC available for capital families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the Islamabad Capital Territory as elsewhere: Article 25-A places the duty on the state, the capital territory has its own right-to-education legislation aimed at out-of-school children, and no registration regime exists for home-educating families — parental choice in private international education is unrestricted in practice. Smartious families enrol directly and sit examinations as British Council private candidates, with IBCC equivalence planned early and the post-sixteen A-Level phase at the family\'s choice.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation for Islamabad and Rawalpindi families during examination preparation periods, subject to associate teacher availability.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes land in the capital\'s late afternoon and early evening on the +2 hour offset, with every session recorded — which is what makes the model work across postings and travel.',
    faqs: [
      { q: 'We are a diplomatic family posted to Islamabad — how does continuity work?', a: 'One pathway, held constant: the same live curriculum, teachers, and examination board across Islamabad and every posting after it, with examinations sat at authorised centres wherever the family is. Enrolment happens the week you arrive.' },
      { q: 'Where do Islamabad and Rawalpindi students sit Cambridge examinations?', a: 'At British Council Pakistan centres in both cities as private candidates, with registration handled by Smartious and the centre and series confirmed per family.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'faisalabad-pk',
    name: 'Faisalabad',
    county: 'Punjab',
    region: 'The textile capital · Pakistan\'s industrial engine and export heartland · a business-owning class with international trade ties · thin Cambridge provision outside a few campuses',
    primaryKeyword: 'Online school and homeschool in Faisalabad',
    heroTagline: 'For Faisalabad families — the textile capital\'s business families, served by a Cambridge tier far thinner than Lahore\'s.',
    intro: 'Live online Cambridge IGCSE and O-Level, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Faisalabad families. Faisalabad is Pakistan\'s textile capital and one of its industrial engines — an export economy whose business-owning families trade with buyers in Europe, the Gulf, and North America, and whose children increasingly need the qualifications those markets read. The city\'s Cambridge provision is real but far thinner than Lahore\'s, and the strongest campuses fill quickly. Smartious delivers the full international pathway live across Punjab\'s industrial belt — year-round admission, unlimited recordings, Lahore exam windows planned per session, and IBCC equivalence planned from the first term.',
    heroImg: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Faisalabad clock tower and the city centre' },
    seoDesc: 'Live online Cambridge IGCSE, O-Level, A-Level, Pearson Edexcel, IB Diploma and American AP for Faisalabad families — textile capital, thin Cambridge tier, IBCC equivalence planned. From USD 400/month.',
    challenges: [
      'A Cambridge tier far thinner than Lahore\'s, with the strongest campuses filling quickly.',
      'Export-business families need qualifications their trading partners read — and often travel on the trade calendar.',
      'IBCC equivalence requirements for Pakistani university admission — planned early or discovered late.',
      'Exam sittings typically mean Lahore windows, planned ahead.',
      'Time zone: Faisalabad runs PKT (UTC+5) year-round — two hours ahead of Nairobi EAT.',
    ],
    familySituations: [
      'Textile and export business-owning families with international trade ties.',
      'Industrial and professional families across the Punjab belt.',
      'Families outside the reach of the strongest local Cambridge campuses.',
      'Students adding subjects their school does not offer, or deepening exam preparation.',
      'Students past Matric or O-Level running the full A-Level phase.',
    ],
    nearbyAreas: ['Faisalabad centre', 'Madina Town', 'Peoples Colony', 'Jhang Road', 'Chiniot', 'Jaranwala', 'Sargodha'],
    subjects: [
      'Cambridge IGCSE and O Level Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE and O Level Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge O Level Pakistan Studies, Urdu, and Islamiyat — planned for IBCC equivalence',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Pakistani admissions with IBCC equivalence',
    ],
    whyChoose: [
      ['The Lahore-tier education without the Lahore address', 'Identical live small-group Cambridge teaching delivered to Faisalabad homes, with no relocation and no boarding decision.'],
      ['Business and accounting depth for an export city', 'Cambridge A-Level Economics, Business, and Accounting suit the trading families the city is built on.'],
      ['IBCC equivalence planned, not discovered', 'Pakistan Studies, Urdu, and Islamiyat planned in early — requirements confirmed with IBCC per case.'],
      ['Built around the trade calendar', 'Live classes plus unlimited recordings survive buying seasons and travel.'],
      ['Live teaching, small groups', 'Every Smartious class is live, real-time, in groups of 4-6.'],
    ],
    growingReason: 'Faisalabad is Pakistan\'s textile capital — an export economy whose business families trade with Europe, the Gulf, and North America — with a Cambridge tier far thinner than Lahore\'s ninety minutes away. Faisalabad runs PKT (UTC+5), two hours ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and O Level, and Cambridge A-Level — Smartious\'s primary offer for the industrial belt. Examinations at British Council centres with Lahore windows planned per session.',
      cbc: 'Kenya CBC available for Punjab families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies: Article 25-A places the duty on the state, Punjab\'s right-to-education framework targets out-of-school children, and no registration regime exists for home-educating families. Smartious families enrol directly, sit examinations as British Council private candidates, plan IBCC equivalence subjects early, and run the A-Level years past sixteen entirely at their own choice.',
    homeTuitionDetail: 'In-person tuition supplementation in Faisalabad is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes land in the Faisalabad late afternoon and early evening on the +2 hour offset, with every session recorded for unlimited rewatch.',
    faqs: [
      { q: 'Is the teaching the same as in Karachi or Lahore?', a: 'Identical — the same live small-group classes, the same subject specialists, the same examination boards. Location changes nothing except where the family sits the examinations.' },
      { q: 'Where do Faisalabad students sit Cambridge examinations?', a: 'At British Council Pakistan centres, typically Lahore windows, as private candidates — registration handled by Smartious and confirmed per family per session.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'peshawar-pk',
    name: 'Peshawar',
    county: 'Khyber Pakhtunkhwa',
    region: 'The gateway to the northwest · KP\'s provincial capital · a trading and professional city · a Cambridge tier that thins quickly beyond a few campuses',
    primaryKeyword: 'Online school and homeschool in Peshawar',
    heroTagline: 'For Peshawar and KP families — the northwest\'s capital, with international qualifications delivered live where the campuses run out.',
    intro: 'Live online Cambridge IGCSE and O-Level, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Peshawar and Khyber Pakhtunkhwa families. Peshawar is the gateway to the northwest — KP\'s provincial capital, a trading city with deep regional reach, a medical and engineering university tradition, and a professional class whose children increasingly aim at NUST, LUMS, and universities abroad. Its Cambridge provision runs through a handful of established campuses and thins quickly beyond them, and the province beyond the city has very little. Smartious delivers the full international pathway live across KP — year-round admission, unlimited recordings, Islamabad and Rawalpindi exam windows within reach, and IBCC equivalence planned from the first term.',
    heroImg: 'https://images.unsplash.com/photo-1589129140837-67287c22521f?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Peshawar old city and the surrounding hills' },
    seoDesc: 'Live online Cambridge IGCSE, O-Level, A-Level, Pearson Edexcel, IB Diploma and American AP for Peshawar and KP families — thin Cambridge tier, IBCC equivalence planned. From USD 400/month.',
    challenges: [
      'A Cambridge tier concentrated in a handful of campuses, thinning quickly across the province.',
      'Families beyond Peshawar have very little international provision at any distance.',
      'IBCC equivalence requirements for Pakistani university admission — planned early or discovered late.',
      'Exam sittings mean Islamabad or Rawalpindi windows, planned ahead.',
      'Time zone: Peshawar runs PKT (UTC+5) year-round — two hours ahead of Nairobi EAT.',
    ],
    familySituations: [
      'Professional, medical, and academic families across the provincial capital.',
      'Trading and business families with regional and Gulf ties.',
      'Families across KP with no local international option.',
      'Students adding subjects their school does not offer, or deepening exam preparation.',
      'Students past Matric or O-Level running the full A-Level phase.',
    ],
    nearbyAreas: ['Peshawar Cantt', 'University Town', 'Hayatabad', 'Nowshera', 'Mardan', 'Abbottabad', 'Swat'],
    subjects: [
      'Cambridge IGCSE and O Level Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE and O Level Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge O Level Pakistan Studies, Urdu, and Islamiyat — planned for IBCC equivalence',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Biology',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Pakistani admissions with IBCC equivalence',
    ],
    whyChoose: [
      ['The complete option where campuses run out', 'Identical live delivery in Peshawar, Mardan, Abbottabad, and Swat — the international pathway the province never carried at scale.'],
      ['Pre-medical and engineering depth', 'Cambridge A-Level Biology, Chemistry, Physics, and Mathematics — led by a founder with a BEd in Mathematics and Physics — suit a city built around medicine and engineering.'],
      ['IBCC equivalence planned, not discovered', 'Pakistan Studies, Urdu, and Islamiyat planned in early — requirements confirmed with IBCC per case.'],
      ['Examinations within reach', 'British Council Islamabad and Rawalpindi serve KP families, confirmed per session with travel planned ahead.'],
      ['Live teaching, small groups', 'Every Smartious class is live, real-time, in groups of 4-6.'],
    ],
    growingReason: 'Peshawar is KP\'s provincial capital and the gateway to the northwest — a trading and professional city with a medical and engineering tradition — served by a Cambridge tier concentrated in a few campuses and thinning fast beyond the city. Peshawar runs PKT (UTC+5), two hours ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and O Level, and Cambridge A-Level — Smartious\'s primary offer for KP. Examinations at British Council Islamabad and Rawalpindi, confirmed per session with travel planned ahead.',
      cbc: 'Kenya CBC available for KP families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Khyber Pakhtunkhwa as elsewhere: Article 25-A places the duty on the state, the province\'s right-to-education framework targets out-of-school children, and no registration regime exists for home-educating families. Smartious families enrol directly, sit examinations as British Council private candidates, plan IBCC equivalence subjects early, and run the A-Level years past sixteen at their own choice.',
    homeTuitionDetail: 'In-person tuition supplementation in KP is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes land in the Peshawar late afternoon and early evening on the +2 hour offset, with every session recorded for unlimited rewatch.',
    faqs: [
      { q: 'Can families outside Peshawar access the same teaching?', a: 'Yes — delivery is identical in Mardan, Abbottabad, or Swat as in the provincial capital. Only examination sittings require travel, planned into Islamabad or Rawalpindi windows per session.' },
      { q: 'Where do KP students sit Cambridge examinations?', a: 'At British Council Pakistan centres in Islamabad and Rawalpindi as private candidates, with registration handled by Smartious and confirmed per family per session.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'multan-pk',
    name: 'Multan & South Punjab',
    county: 'Punjab',
    region: 'South Punjab\'s capital · agribusiness, mango and cotton export, and a growing professional class · the region\'s international provision thinner than anywhere in Punjab',
    primaryKeyword: 'Online school and homeschool in Multan',
    heroTagline: 'For Multan and South Punjab families — a region of millions with international schooling you can count on one hand.',
    intro: 'Live online Cambridge IGCSE and O-Level, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Multan and South Punjab families. Multan anchors South Punjab — an agribusiness economy of cotton, mango, and export trade, a medical and engineering university tradition, and a professional and landowning class whose children aim at LUMS, NUST, and universities abroad. What the region does not have is international schooling at scale: provision is thinner here than anywhere else in Punjab, and Lahore is a long way for a school run. Smartious delivers the full international pathway live across the south — year-round admission, unlimited recordings, Lahore exam windows planned per session, and IBCC equivalence planned from the first term.',
    heroImg: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Multan shrine domes and the old city' },
    seoDesc: 'Live online Cambridge IGCSE, O-Level, A-Level, Pearson Edexcel, IB Diploma and American AP for Multan and South Punjab families — thinnest provision in Punjab, IBCC equivalence planned. From USD 400/month.',
    challenges: [
      'International provision thinner than anywhere in Punjab, for a region of millions.',
      'Lahore is a long way for a daily school run — boarding or relocation are the usual alternatives.',
      'IBCC equivalence requirements for Pakistani university admission — planned early or discovered late.',
      'Exam sittings mean Lahore windows, planned well ahead.',
      'Time zone: Multan runs PKT (UTC+5) year-round — two hours ahead of Nairobi EAT.',
    ],
    familySituations: [
      'Agribusiness, export, and landowning families across South Punjab.',
      'Professional, medical, and academic families in the regional capital.',
      'Families weighing boarding in Lahore against staying together.',
      'Students adding subjects their school does not offer, or deepening exam preparation.',
      'Students past Matric or O-Level running the full A-Level phase.',
    ],
    nearbyAreas: ['Multan Cantt', 'Gulgasht', 'Bosan Road', 'Bahawalpur', 'Dera Ghazi Khan', 'Vehari', 'Rahim Yar Khan'],
    subjects: [
      'Cambridge IGCSE and O Level Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE and O Level Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge O Level Pakistan Studies, Urdu, and Islamiyat — planned for IBCC equivalence',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Pakistani admissions with IBCC equivalence',
    ],
    whyChoose: [
      ['The alternative to sending a child away', 'South Punjab\'s usual answer is boarding in Lahore. Live small-group Cambridge teaching at home keeps the family together without costing the education.'],
      ['Identical delivery, wherever the address is', 'Multan, Bahawalpur, or Rahim Yar Khan — the same teachers, classes, and examination boards as Karachi and Lahore.'],
      ['IBCC equivalence planned, not discovered', 'Pakistan Studies, Urdu, and Islamiyat planned in early — requirements confirmed with IBCC per case.'],
      ['Built around the agricultural year', 'Live classes plus unlimited recordings survive harvest and export seasons.'],
      ['Live teaching, small groups', 'Every Smartious class is live, real-time, in groups of 4-6.'],
    ],
    growingReason: 'Multan anchors South Punjab — cotton, mango, and export agribusiness with a medical and engineering university tradition — in a region of millions whose international schooling is thinner than anywhere else in the province. Multan runs PKT (UTC+5), two hours ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and O Level, and Cambridge A-Level — Smartious\'s primary offer for South Punjab. Examinations at British Council centres with Lahore windows planned per session.',
      cbc: 'Kenya CBC available for South Punjab families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies across South Punjab: Article 25-A places the duty on the state, the province\'s right-to-education framework targets out-of-school children, and no registration regime exists for home-educating families. Smartious families enrol directly, sit examinations as British Council private candidates, plan IBCC equivalence subjects early, and run the A-Level years past sixteen entirely at their own choice.',
    homeTuitionDetail: 'In-person tuition supplementation in South Punjab is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes land in the Multan late afternoon and early evening on the +2 hour offset, with every session recorded for unlimited rewatch.',
    faqs: [
      { q: 'Is this a real alternative to boarding in Lahore?', a: 'For many South Punjab families, yes — the teaching, subject specialists, and examination boards are identical to the capitals, delivered at home. The family stays together and the education does not compromise; only exam sittings require Lahore travel.' },
      { q: 'Where do South Punjab students sit Cambridge examinations?', a: 'At British Council Pakistan centres, typically Lahore windows, as private candidates — registration handled by Smartious and confirmed per family per session.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const PAKISTAN_COUNTRY = {
  slug: 'pakistan',
  name: 'Pakistan',
  longName: 'Islamic Republic of Pakistan',
  adjective: 'Pakistani',
  flag: '🇵🇰',
  hub: '/online-school/pakistan',
  hubPageId: 'homeschooling-pakistan',
  cityPageId: 'pakistan-city',

  currency: 'PKR',
  currencyName: 'Pakistani Rupee',
  currencyPeg: 'PKR equivalents are indicative only and move with the exchange rate; final invoicing is in USD, with PKR bank transfer accepted at the prevailing rate.',

  timezone: {
    code: 'PKT',
    name: 'Pakistan Standard Time (UTC+5, no daylight saving)',
    utcOffset: '+5',
    offsetFromEAT: '+2 hours year-round (ahead of Nairobi)',
  },

  examCentres: ['British Council Pakistan centres serving private candidates in Karachi, Lahore, Islamabad and Rawalpindi among others — Cambridge, Pearson Edexcel and OxfordAQA, confirmed per family per session'],
  examCentreTiles: [
    { city: 'Karachi', centre: 'British Council Pakistan', area: 'Cambridge IGCSE and O Level, A-Level, Pearson Edexcel and OxfordAQA for private candidates; series and centre confirmed per family.' },
    { city: 'Lahore', centre: 'British Council Pakistan', area: 'The Punjab centre of gravity — Faisalabad and South Punjab families plan Lahore windows.' },
    { city: 'Islamabad & Rawalpindi', centre: 'British Council Pakistan', area: 'Serving the capital region and KP families, with travel planned into each series.' },
  ],
  examLogisticsProse: 'Pakistan is one of the strongest examination jurisdictions we serve. Cambridge IGCSE and O Level, Cambridge A-Level, Pearson Edexcel, and OxfordAQA examinations are sat as private candidates through British Council Pakistan, whose centres serve Karachi, Lahore, Islamabad and Rawalpindi among others — a network Pakistani families have used for decades. Smartious handles registration through the private-candidate system, tracks the entry deadlines that fall well ahead of each series, confirms the centre with each family per session, and runs full mock examination programmes beforehand. Regional families — Faisalabad, South Punjab, KP — plan sittings into the nearest centre\'s windows with travel scheduled ahead. Separately, families who may want Pakistani university admission plan IBCC equivalence from the start: the subject set matters, requirements change, and they are confirmed with IBCC per case rather than assumed.',
  secondaryProgrammeExamRef: 'British Council Pakistan centres',
  finalCTABadgeExamRef: 'British Council centres confirmed per family, per session',

  heroImage: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1600&q=80&auto=format&fit=crop',
  heroEyebrow: 'Online homeschool for Pakistan',
  heroH1Suffix: 'Pakistan',
  heroSubhead: 'Live online Cambridge IGCSE and O-Level, A-Level, Pearson Edexcel, IB Diploma, and American AP for families across Karachi, Lahore, Islamabad and Rawalpindi, Faisalabad, Peshawar, and Multan. Pakistan has world-class Cambridge schools — and waitlists, fixed timetables, and school runs measured in hours. Smartious is for the families those schools cannot fit today: year-round admission, unlimited recordings, British Council examinations, and IBCC equivalence planned from the first term.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — with no waitlist, full portability if the family moves, and the IBCC subject set planned in from the start.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Pakistan',

  citiesSectionTitle: 'Where our Pakistan families are',
  citiesSectionBody: 'Smartious Pakistan families concentrate across Karachi (the commercial capital, the deepest Cambridge tradition, and the longest school run), Lahore (Aitchison, LGS, and the LUMS pipeline, where access is the constraint rather than quality), Islamabad and Rawalpindi (the diplomatic and development community, arriving on posting rather than admission cycles), Faisalabad (the textile capital whose Cambridge tier is far thinner than Lahore\'s), Peshawar (KP\'s capital, where provision thins fast beyond a few campuses), and Multan and South Punjab (a region of millions where boarding in Lahore has been the usual answer). One lightly regulated national picture, British Council examinations everywhere, and IBCC equivalence planned from the first term.',

  trustSignals: [
    { h: 'Two operational teaching centres', p: 'Live teaching to Pakistan families is delivered from two international-standard operational centres established 2022 and 2023.' },
    { h: 'No waitlist, any week of the year', p: 'Admission is year-round and mid-term transfers from Cambridge schools are routine — students typically begin within a week of the assessment.' },
    { h: 'IBCC equivalence planned from the first term', p: 'Pakistani university admission on foreign qualifications runs through IBCC equivalence, and the subject set matters. We plan Pakistan Studies, Urdu, and Islamiyat in early for families who may need it — with current requirements confirmed with IBCC per case rather than assumed.' },
    { h: 'A school that follows the family', p: 'Karachi this year, Dubai or London next: same teachers, same curriculum, same examination board, no enrolment break — the strongest single reason internationally mobile Pakistani families choose us.' },
  ],

  universitiesInCountry: 'LUMS, IBA Karachi, NUST, Habib University, Aga Khan University, GIKI, FAST National University, Quaid-i-Azam University, UET Lahore, and the major public universities — admitting foreign qualifications through IBCC equivalence, with requirements confirmed per case.',
  universityChannels: 'Smartious Pakistan students hold Cambridge IGCSE/O Level and A-Level, Pearson Edexcel, or IB Diploma qualifications — long-established routes into Pakistani universities through IBCC equivalence (LUMS, IBA Karachi, NUST, Habib, AKU, GIKI and the public sector), where the subject set and grade rules are confirmed with IBCC per case and planned from the start rather than discovered late. Internationally, Cambridge A-Levels are read natively by UK universities via UCAS and accepted in 160+ countries; the Common Application serves US plans; Canadian, Australian, and Gulf universities assess these qualifications routinely. Smartious provides personalised university guidance across Pakistani, UK (UCAS), US (Common Application), and Gulf destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Pakistan families. Cambridge IGCSE and O Level (Years 10-11) and Cambridge A-Level (Years 12-13) delivered as live online classes landing in the Pakistani late afternoon and early evening on the +2 hour offset, with unlimited recordings behind every session. The O-Level route is planned deliberately where IBCC equivalence matters, with Pakistan Studies, Urdu, and Islamiyat scheduled from the first term. Examinations sat as private candidates through British Council Pakistan, confirmed per session. Pathway accepted by Pakistani universities via IBCC equivalence, UK universities via UCAS, and internationally in 160+ countries.',
  britishCurriculumSuits: 'Pakistan families targeting the Cambridge pathway. Best fit for: (1) families waitlisted at the top Cambridge schools or arriving mid-year, (2) serious young athletes and musicians whose training will not fit a fixed timetable, (3) internationally mobile business, diplomatic, and development families needing portability, (4) Faisalabad, Peshawar, and South Punjab families where provision thins or disappears, (5) students past Matric or O-Level running the full A-Level phase, (6) students supplementing an existing Cambridge school with subjects it does not offer.',
  britishCurriculumDelivery: 'Live online classes landing in the Pakistani late afternoon and early evening, small groups 4-6 students, every session recorded. Examinations as private candidates through British Council Pakistan, confirmed per session.',
  ibDiplomaSuits: 'Pakistan families targeting the IB Diploma\'s breadth — including those continuing an IB pathway begun abroad.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Pakistan families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in 2019 to make international qualifications (Cambridge, IB, American) accessible to families across emerging markets and international communities at online-delivery fees. Pakistan families join students in 36 other countries — from Clifton and Gulberg to Nairobi\'s own Diamond Plaza HQ, Dubai\'s expat districts to London.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the pre-medical and pre-engineering trajectories that dominate Pakistani university ambition. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Pakistan has genuinely world-class private schools, and we say so plainly: Karachi Grammar, Aitchison College, Lahore Grammar, The Lyceum, Cedar College, and the Beaconhouse, City School, Roots Millennium and Headstart networks do excellent work for the families they fit. Smartious is not built to replace them. It is built for the constraints they cannot solve — multi-year waitlists, fixed timetables, single-city peer groups, and no portability when a family moves — and for the regions where that tier thins or disappears entirely.',
  competitors: [
    { name: 'Karachi Grammar School (KGS)',                 city: 'Karachi',              curriculum: 'Cambridge O Level + A-Level',           feesUsd: 'Premium tier, quoted locally in PKR',              feesAed: 'Established fee scale',    rating: 4.7, capacityNote: 'The country\'s most established school — multi-year waitlists' },
    { name: 'Aitchison College',                            city: 'Lahore',               curriculum: 'Cambridge + national tracks',           feesUsd: 'Premium tier, quoted locally in PKR',              feesAed: 'Established fee scale',    rating: 4.7, capacityNote: 'Historic institution, highly competitive entry' },
    { name: 'Lahore Grammar School (LGS)',                  city: 'Lahore',               curriculum: 'Cambridge O Level + A-Level',           feesUsd: 'Premium tier',                                     feesAed: 'Varies by campus',         rating: 4.5, capacityNote: 'The Punjab network standard' },
    { name: 'The Lyceum / Cedar College / Bay View',        city: 'Karachi',              curriculum: 'Cambridge A-Level focused',             feesUsd: 'Premium tier',                                     feesAed: 'Varies',                   rating: 4.5, capacityNote: 'The A-Level specialists' },
    { name: 'Beaconhouse / The City School networks',       city: 'Nationwide',           curriculum: 'Cambridge + national',                  feesUsd: 'Mid-to-premium tier',                              feesAed: 'Varies by campus',         rating: 4.2, capacityNote: 'The broadest national reach — strongest campuses fill quickly' },
    { name: 'ISOI / Roots Millennium / Headstart',          city: 'Islamabad',            curriculum: 'International + Cambridge',             feesUsd: 'Premium capital tier',                             feesAed: 'Varies',                   rating: 4.3, capacityNote: 'The capital\'s international provision — finite' },
    { name: 'Faisalabad, Peshawar & South Punjab',          city: 'Beyond the big three', curriculum: '—',                                     feesUsd: 'Provision thins or disappears',                    feesAed: '—',                        rating: 0,   capacityNote: 'Millions of people; boarding or relocation has been the usual answer' },
    { name: 'Local home tutoring',                          city: 'Nationwide',           curriculum: 'Subject tuition',                       feesUsd: 'Charged hourly, widely used',                      feesAed: 'Cultural norm',            rating: 4.0, capacityNote: 'Already a normal part of ambitious families\' budgets — proof the supplementary model fits' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh / bina (online)', city: 'Online',      curriculum: 'Cambridge self-paced / UK online / own to 15', feesUsd: 'Per-subject / GBP 9,000-11,000 / consultation', feesAed: 'Varies',      rating: 4.2, capacityNote: 'Self-paced, priced far above Smartious, or stopping at 15 — and none plans IBCC equivalence' },
    { name: 'Smartious Homeschool (Pakistan via online delivery)', city: 'Delivered to all Pakistan', curriculum: 'Cambridge IGCSE/O Level, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'PKR equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + no waitlist + full portability + IBCC equivalence planned from the first term + the regions finally served' },
  ],

  legalFrameworkIntro: 'Pakistan\'s position is simpler than most countries we serve, and the complications sit elsewhere — in university equivalence rather than in permission. Here is the whole picture exactly.',
  legalFramework: [
    { h: 'The constitutional duty — on the state, not on the family', p: 'Article 25-A of the Constitution, inserted in 2010, obliges the State to provide free and compulsory education to all children aged five to sixteen. It is framed as a duty on the state to provide, and it sits alongside the 18th Amendment, which made education a provincial subject: Sindh, Punjab, Khyber Pakhtunkhwa, Balochistan, and the Islamabad Capital Territory each legislate their own right-to-education acts.' },
    { h: 'What the provincial acts actually target', p: 'Those provincial acts are built around getting out-of-school children into education — enrolment drives, obligations on institutions, and the machinery of universal access. None of them establishes a registration regime for home-educating families, and parental choice in private and international education has been long-standing and unrestricted in practice: Pakistani families have used Cambridge programmes through hundreds of schools since the 1970s. We state that carefully rather than dressing it up as a positive statutory right to homeschool. It is an unregulated space, not a codified permission — and anything specific to a family\'s province or circumstances belongs with their own advisers.' },
    { h: 'How families actually enrol and examine', p: 'In practice the mechanics are straightforward: families enrol with Smartious directly, with no separate government registration, and sit examinations as private candidates through British Council Pakistan — Cambridge IGCSE and O Level, Cambridge A-Level, Pearson Edexcel, and OxfordAQA, at centres serving Karachi, Lahore, Islamabad and Rawalpindi among others. Smartious handles registration, tracks the deadlines ahead of each series, and runs mock examinations before every sitting.' },
    { h: 'The real complication: IBCC equivalence', p: 'The genuine planning issue in Pakistan is not permission but equivalence. Admission to Pakistani universities on foreign qualifications runs through an Inter Board Committee of Chairmen equivalence certificate — and IBCC has generally required Pakistani nationals to have taken Pakistan Studies, Urdu, and Islamiyat for O-Level equivalence, with subject-count and grade rules applying at A-Level. Requirements are periodically revised and are confirmed with IBCC per case, never assumed. What matters is that a family decides early: a student who may want LUMS, IBA, NUST, Habib, or AKU should have those subjects in the timetable from the first term, not discover the gap at eighteen. This is the single most valuable thing an adviser can tell a Pakistani family choosing an international pathway, and it is the one no online competitor plans for.' },
    { h: 'O Level or IGCSE — a choice worth making deliberately', p: 'Pakistan\'s Cambridge tradition runs more through O Level than IGCSE, and equivalence practice has been built around it. Both are Cambridge qualifications of equal international standing, and Smartious teaches both — but the choice should be made with the destination in mind rather than by default: families whose plans may include a Pakistani university generally have the cleaner route through O Level with the IBCC subject set, while families certain of an international destination can take either. We plan that decision explicitly at enrolment.' },
    { h: 'After sixteen: the window', p: 'Article 25-A runs to sixteen — which is Matric and O-Level age. Intermediate (grades XI-XII) and the A-Level years sit entirely beyond it: no obligation, no framework, nothing to satisfy. For internationally bound students the A-Level phase is therefore purely a matter of choice and planning, feeding UCAS natively, the Common Application, Gulf and Commonwealth universities, and Pakistani universities via IBCC equivalence.' },
  ],

  whySmartious: [
    { h: 'No waitlist, ever',                                              p: 'The country\'s best schools queue for years. Smartious admits year-round, and mid-term transfers from Cambridge schools are routine — most students start within a week of the assessment.' },
    { h: 'IBCC equivalence planned from the first term',                   p: 'The subject set that Pakistani university admission depends on goes into the timetable early, with requirements confirmed with IBCC per case. No online competitor plans for it at all.' },
    { h: 'The school follows the family',                                  p: 'Karachi to Dubai to London — same teachers, same curriculum, same examination board, no enrolment break. For internationally mobile Pakistani families this is the whole argument.' },
    { h: 'The timetable bends to the child',                               p: 'Live classes plus unlimited recordings — built for serious cricket and music schedules, business travel, and the hours that Karachi and Lahore traffic simply take.' },
    { h: 'The regions finally served',                                     p: 'Faisalabad, Peshawar, and South Punjab hold millions of people and very little provision. Boarding in Lahore has been the usual answer; identical live delivery at home is now the alternative.' },
    { h: 'Respect for what already works',                                 p: 'KGS, Aitchison, LGS and the networks are excellent, and we say so. Smartious solves what they cannot — access, flexibility, and portability — and works alongside them as a supplement where that fits better.' },
  ],

  faqs: [
    { q: 'Is online homeschooling legal in Pakistan?', a: 'Pakistan has no registration regime for home-educating or online-schooled families. Article 25-A obliges the state to provide free and compulsory education for children aged five to sixteen, education is a provincial subject, and the provincial right-to-education acts are aimed at out-of-school children rather than at regulating parental choice in private international education. Families enrol with Smartious directly and sit examinations as British Council private candidates. Anything specific to your province or circumstances is worth confirming with your own advisers.' },
    { q: 'What is IBCC equivalence, and why do you raise it so early?', a: 'Admission to Pakistani universities on foreign qualifications runs through an Inter Board Committee of Chairmen equivalence certificate. IBCC has generally required Pakistani nationals to have taken Pakistan Studies, Urdu, and Islamiyat for O-Level equivalence, with subject and grade rules at A-Level. Requirements change and are confirmed with IBCC per case — which is precisely why the subjects belong in the timetable from the first term rather than being discovered at eighteen.' },
    { q: 'Should my child take O Level or IGCSE?', a: 'Both are Cambridge qualifications of equal international standing and we teach both. Pakistan\'s tradition and equivalence practice run more through O Level, so families whose plans may include a Pakistani university generally have the cleaner route there with the IBCC subject set; families certain of an international destination can take either. We plan the decision explicitly at enrolment.' },
    { q: 'How does Smartious compare to KGS, Aitchison, LGS, or Beaconhouse?', a: 'They are excellent schools with prestige, in-person culture, and local peer networks an online school cannot match, and we are not built to replace them for families they fit. Smartious solves what they cannot: waitlists, fixed timetables, single-city peer groups, and the loss of continuity when a family moves.' },
    { q: 'Where do Pakistani students sit examinations?', a: 'As private candidates through British Council Pakistan — Cambridge IGCSE and O Level, Cambridge A-Level, Pearson Edexcel, and OxfordAQA — at centres serving Karachi, Lahore, Islamabad and Rawalpindi among others. Smartious handles registration, tracks the deadlines ahead of each series, and confirms the centre per family per session.' },
    { q: 'Can my child study with Smartious alongside their current school?', a: 'Yes — one of the most common configurations in Pakistan. The school carries the enrolment and daily routine while Smartious adds subjects it does not offer, deepens examination preparation, or runs the A-Level phase. Unlimited recordings make it workable alongside a full school day.' },
    { q: 'Will my child still socialise learning online?', a: 'Smartious classes are live and small — 4 to 6 students — with classmates across Pakistan, the Gulf, Africa, the UK, and beyond, plus enrichment programmes. It complements rather than replaces local community: families continue with cricket and hockey clubs, music, and neighbourhood life, which is exactly how we recommend it.' },
    { q: 'What happens after Matric or O Level, at sixteen?', a: 'Article 25-A runs to sixteen, so the A-Level and intermediate years sit entirely outside any obligation — the A-Level phase is purely a matter of family choice, feeding UCAS natively, the Common Application, Gulf and Commonwealth universities, and Pakistani universities through IBCC equivalence.' },
    { q: 'How does live class scheduling work given the Pakistan-Nairobi time difference?', a: 'Pakistan runs PKT (UTC+5) year-round — two hours ahead of Nairobi EAT — so live afternoon teaching from our base lands in the Pakistani late afternoon and early evening, with every session recorded for unlimited rewatch.' },
    { q: 'Which Pakistani cities does Smartious cover?', a: 'Karachi, Lahore, Islamabad and Rawalpindi, Faisalabad, Peshawar, and Multan and South Punjab have dedicated pages with local market context. Live online delivery works identically anywhere in the country — which outside the big three cities is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. If Pakistani university admission may matter later, say so in the form — the IBCC equivalence conversation belongs at the start of the plan, not the end.',
}
