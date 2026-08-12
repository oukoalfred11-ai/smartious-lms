// ═══════════════════════════════════════════════════════════════════
// IRAQ — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for energy, corporate, academic and Iraqi families
// across Baghdad, Basra, Erbil, Sulaymaniyah and Duhok.
// THIRD MIDDLE EAST BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// *** TONE RULE — ABSOLUTE, READ BEFORE EDITING ANYTHING ***
// NO political content. NO commentary on any conflict, past or
// present. NO security commentary. NO commentary on any government,
// party, group or event. NO territorial or constitutional opinion.
// We are a school.
// - Describe cities by their universities, industries, rivers and
//   communities only.
// - Do NOT use the words crisis, war, conflict, unrest, instability,
//   danger, rebuild, recovery or reconstruction.
// - Iraq has one of the oldest continuous educational traditions
//   anywhere and its universities have produced engineers, doctors
//   and scientists who work worldwide. SAY SO. The framing is depth
//   and continuity, never rescue.
// - Where continuity of schooling is mentioned, mention it exactly
//   as on our Puerto Rico pages — one neutral sentence about
//   recorded lessons covering interruption, with NO cause attributed
//   and no elaboration. If in doubt, cut it.
//
// *** TIMEZONE: ZERO OFFSET, like Jordan ***
// Iraq runs UTC+3 year-round with no seasonal clock changes, and our
// teaching base runs UTC+3 year-round. There is no offset at all and
// no seasonal drift. Every hour of our teaching day is available at
// exactly the hour it shows on an Iraqi family's clock. Lead with it.
//
// LEGAL POSITIONING NOTE — TWO AUTHORITIES, AND A HEDGE:
// - *** THE STRUCTURAL FACT THAT MATTERS MOST ***: education in Iraq
//   is administered on TWO tracks. The FEDERAL MINISTRY OF EDUCATION
//   administers schooling in the governorates under federal
//   administration, and the KURDISTAN REGION has its OWN MINISTRY OF
//   EDUCATION administering schooling in the Region — Erbil,
//   Sulaymaniyah, Duhok and Halabja. Curricula, languages of
//   instruction and school administration differ between the two.
//   A family's operative authority therefore depends on WHERE THEY
//   LIVE. This is the Bosnia / Argentina / Switzerland pattern and
//   it is genuinely informative — use that framing.
// - Education is compulsory at the primary level. State it generally
//   and route families to their own ministry; do not quote ages we
//   have not verified.
// - Private and international schools operate with licensing from
//   the relevant ministry. Smartious holds no such licence in either
//   track and says so.
// - HOME EDUCATION: we could NOT verify a position in either track.
//   PHRASE EVERY TIME: "we could not verify", "we are not aware of a
//   specific framework", plus "confirm with the ministry that
//   administers education where you live — the federal Ministry of
//   Education, or the Kurdistan Region's Ministry of Education".
//   NEVER assert permitted, NEVER assert prohibited.
// - Reuse the absence-of-regulation-is-not-permission argument.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT.
// - The national qualification in the federal track is commonly
//   referred to as the Baccalaureate / Sixth Form examinations; the
//   Kurdistan Region administers its own. We teach toward NEITHER
//   and say so.
//
// CURRENCY: IQD, with USD widely used in practice for larger
// commitments. Fees quoted in USD.
//
// MARKET NOTE: Erbil has the deepest international school provision
// in the country — several British-curriculum and international
// schools serving the diplomatic, energy and business community —
// and the University of Kurdistan Hewlêr teaches in English.
// Sulaymaniyah hosts the American University of Iraq Sulaimani, an
// English-medium institution with a strong regional reputation, and
// a long university tradition. Baghdad holds the federal
// institutions, the University of Baghdad and the largest
// professional population in the country. Basra is the southern oil
// capital — the fields, the ports at Umm Qasr and the international
// energy workforce around them. Duhok anchors the northern
// governorate with agriculture, trade toward Turkey and its own
// university. Iraq is one of the world's major oil producers and the
// technical workforce is internationally recruited and mobile.
// ═══════════════════════════════════════════════════════════════════

export const IRAQ_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'baghdad-iq',
    name: 'Baghdad',
    county: 'Baghdad Governorate',
    region: 'The federal capital and the country\'s largest professional population · the University of Baghdad and a deep academic tradition · the diplomatic and international-organisation community · a long-established medical and engineering sector',
    primaryKeyword: 'Online school and international curriculum in Baghdad',
    heroTagline: 'For Baghdad families — Cambridge and IB taught live on exactly your clock, alongside the school your child already attends.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Baghdad families. The capital holds the federal institutions, the University of Baghdad and one of the oldest continuous academic traditions anywhere, the country\'s largest professional population, and a long-established medical and engineering sector whose graduates practise worldwide. What families here most often want from us is not a different education but an additional record: an internationally examined qualification alongside the Iraqi one, read directly by universities abroad. And Iraq shares our teaching clock exactly, so any hour of our day is available.',
    heroImg: '/heroes/baghdad-iq.jpg',
    altTexts: { hero: 'Baghdad and the Tigris' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Baghdad families — an internationally examined record alongside the Iraqi one. From USD 400/month.',
    challenges: [
      'International school places are limited relative to the size of the professional population.',
      'Families whose children may study abroad need a record read directly rather than converted.',
      'Education is compulsory and administered by the federal Ministry of Education.',
      'We could not verify Iraq\'s position on parental home education in either administrative track.',
      'Time zone: none. Iraq runs UTC+3 year-round and so does our teaching base.',
    ],
    familySituations: [
      'Medical, engineering and academic families with a long professional tradition.',
      'Corporate and professional households outside the international tier\'s fees.',
      'Diplomatic and international-organisation families.',
      'Students who will apply to universities in the UK, US, Canada, the Gulf or Jordan.',
      'Families whose children need a subject their school cannot staff for a small group.',
      'Households returning mid-curriculum from another country\'s system.',
    ],
    nearbyAreas: ['Karrada', 'Mansour', 'Jadriya', 'Al-Harithiya', 'Zayouna', 'Baghdad Al-Jadida', 'the Tigris corridor'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Gulf, Jordanian and Iraqi university applications',
    ],
    whyChoose: [
      ['Exactly your clock, all year', 'Iraq runs UTC+3 year-round and so do we. No offset, no seasonal drift — any hour of our teaching day is available at the hour it shows on your clock.'],
      ['Pre-medical and engineering depth', 'Cambridge A-Level Biology, Chemistry, Mathematics and Physics — the spines a city with this medical and engineering tradition aims at, taught by subject specialists in groups of four to six.'],
      ['A record read directly abroad', 'UCAS reads A-Levels natively; American, Canadian and Gulf universities read A-Levels and the IB without conversion.'],
      ['Alongside the Iraqi record, never instead of it', 'We are not a licensed Iraqi school and issue no Iraqi qualification. Your school carries the domestic side.'],
      ['Arabic kept as an examined subject', 'Cambridge Arabic runs alongside the English-medium core rather than being traded away.'],
    ],
    growingReason: 'Baghdad holds the federal institutions, the University of Baghdad and one of the oldest continuous academic traditions anywhere, the country\'s largest professional population, and a long-established medical and engineering sector whose graduates practise worldwide. Iraq runs UTC+3 year-round — exactly our teaching clock, with no offset at all.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Baghdad families, taught alongside an Iraqi school enrolment at whatever hour suits. Examinations at authorised provision confirmed per family per session.',
      cbc: 'Kenya CBC available for Baghdad families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Iraqi education is administered on two tracks, and this is the first thing a family should understand about the framework. The federal Ministry of Education administers schooling in the governorates under federal administration, including Baghdad, while the Kurdistan Region has its own Ministry of Education administering schooling in Erbil, Sulaymaniyah, Duhok and Halabja — with differences in curriculum, language of instruction and school administration between the two. So the ministry that governs a family\'s situation depends on where they live, in the same way that Bosnian, Argentine and Swiss families deal with different administering authorities within one country. For Baghdad, that is the federal Ministry of Education. Education is compulsory at the primary level and private and international schools operate with ministerial licensing; Smartious holds no such licence, does not operate premises in Iraq, and issues no Iraqi qualification. On parental home education we could not verify a position in either track, and we are not going to guess. We will not tell you it is permitted and we will not tell you it is prohibited; both would exceed what we can evidence. What we would add is what we say in Panama, Guatemala, Venezuela and Jordan: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Confirm your own position with the ministry that administers education where you live. Our arrangement raises none of it: live Cambridge or IB teaching alongside an Iraqi school enrolment, with the school carrying the domestic record and the national examinations, toward which we do not teach.',
    homeTuitionDetail: 'Smartious delivers to Baghdad families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Iraq runs UTC+3 year-round and our teaching base runs UTC+3 year-round, so there is no offset whatsoever and nothing drifts seasonally — a class sits at the same hour on both clocks, every week of the year. Every session is recorded, so a class that cannot be attended is never a class lost.',
    faqs: [
      { q: 'Is homeschooling legal in Iraq?', a: 'We could not verify a position and will not guess. Education is compulsory at the primary level, administered federally in Baghdad and the federal governorates and by the Kurdistan Region\'s own Ministry of Education in the Region. An absence of clear regulation is not a permission — confirm with the ministry that administers education where you live. Structured study alongside a school enrolment raises none of it.' },
      { q: 'Do you teach the Iraqi national examinations?', a: 'No. We are not a licensed Iraqi school and issue no Iraqi qualification. We teach Cambridge, Pearson Edexcel, IB and AP examinations, which sit alongside the Iraqi record rather than replacing it.' },
      { q: 'What time are classes?', a: 'Any hour of our teaching day, at exactly the time it shows on your clock. Iraq and our teaching base both run UTC+3 year-round with no seasonal changes — a zero offset.' },
      { q: 'Our child may study abroad — which qualification helps?', a: 'Cambridge A-Levels and the IB Diploma are read directly by UK, American, Canadian and Gulf universities rather than converted through recognition procedures. AP serves US-focused applications alongside.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'basra-iq',
    name: 'Basra',
    county: 'Basra Governorate',
    region: 'The southern oil capital — the major fields and the international energy workforce around them · the ports at Umm Qasr and the Shatt al-Arab · petrochemicals and heavy industry · a long-standing commercial tradition',
    primaryKeyword: 'Online school and international curriculum in Basra',
    heroTagline: 'For Basra and southern families — one of the world\'s great oil provinces, staffed internationally and schooled locally.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Basra families. The south holds the major oil fields that make Iraq one of the world\'s significant producers, the ports at Umm Qasr and along the Shatt al-Arab, petrochemicals and heavy industry, and a commercial tradition that long predates any of it. The technical workforce is recruited internationally and moves between operations and countries. Cambridge A-Level Physics, Chemistry and Mathematics is the spine that profession runs on, and we teach it live on exactly your clock.',
    heroImg: '/heroes/basra-iq.jpg',
    altTexts: { hero: 'Basra and the Shatt al-Arab' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Basra families — the southern oil province and its international workforce. From USD 400/month.',
    challenges: [
      'An internationally recruited energy workforce with limited international schooling locally.',
      'Field and operations postings that move families between countries.',
      'Baghdad is a long way north and Erbil further still.',
      'We could not verify Iraq\'s position on parental home education in either administrative track.',
      'Time zone: none — Iraq and our teaching base both run UTC+3 year-round.',
    ],
    familySituations: [
      'Petroleum engineering, geoscience and operations families — Iraqi and international.',
      'Oilfield services and contractor households on rotational postings.',
      'Port, shipping and logistics families at Umm Qasr and the waterway.',
      'Petrochemical and heavy-industry engineering households.',
      'Students aiming at petroleum engineering, chemistry or geoscience abroad.',
    ],
    nearbyAreas: ['Basra', 'Umm Qasr', 'Al-Zubair', 'Shatt al-Arab', 'Rumaila area', 'Az Zubayr', 'the southern fields'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic and home language support',
      'Cambridge A-Level Physics, Chemistry, Mathematics, Further Mathematics, Geography',
      'Cambridge A-Level Biology, Economics, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Physics, AP Chemistry, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including petroleum and geoscience programmes), Common Application (US), and Canadian, Gulf and Iraqi university applications',
    ],
    whyChoose: [
      ['The energy cohort we teach on four continents', 'Stavanger, Baku, Hassi Messaoud, Macaé, Neuquén, Cabinda, Takoradi — and now Basra. The same Physics, Chemistry, Mathematics and Geography spine, in the same live groups.'],
      ['Portable to the next posting', 'Basra now, the Gulf, the North Sea or West Africa after — the curriculum, teachers and examination board stay constant. Only the address changes.'],
      ['Exactly your clock, all year', 'Zero offset with no seasonal drift, and every session recorded — which suits rotational rosters better than any fixed timetable could.'],
      ['A record read directly abroad', 'A-Levels are read in 160+ countries, including the petroleum and geoscience programmes these families most often have in view.'],
      ['Alongside the Iraqi record, never instead of it', 'We are not a licensed Iraqi school and issue no Iraqi qualification.'],
    ],
    growingReason: 'Basra holds the major oil fields that make Iraq one of the world\'s significant producers, the ports at Umm Qasr and along the Shatt al-Arab, petrochemicals and heavy industry, and a long commercial tradition — with an internationally recruited technical workforce and limited international schooling. Iraq runs UTC+3 year-round, exactly our teaching clock.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the south, taught alongside an Iraqi school enrolment and portable across energy postings. Examination arrangements planned per family well ahead.',
      cbc: 'Kenya CBC available for Basra families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Basra sits under the federal Ministry of Education, which administers schooling in the governorates under federal administration — as distinct from the Kurdistan Region, which has its own Ministry of Education for Erbil, Sulaymaniyah, Duhok and Halabja. Education is compulsory at the primary level and private and international schools operate with ministerial licensing; Smartious holds no such licence and issues no Iraqi qualification. We could not verify Iraq\'s position on parental home education in either track and decline to characterise it in either direction — confirm with the federal Ministry of Education. For internationally posted energy families who are not resident in Iraq, their country of residence\'s framework applies instead, which is a question for their own advisers and one that arises constantly in this sector.',
    homeTuitionDetail: 'Smartious delivers to Basra families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on exactly Iraq\'s clock with no offset at all, and the full recorded library built for rotational rosters and field schedules.',
    faqs: [
      { q: 'We are on an energy rotation — does the schooling follow us?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next basin or country, with examinations sat at authorised centres wherever the family is. It is the case we already run for families in Stavanger, Baku, Macaé, Neuquén and Cabinda.' },
      { q: 'Our child wants petroleum engineering — what should they take?', a: 'Cambridge A-Level Physics, Chemistry and Mathematics, with Geography as a fourth for geoscience routes. Those are read directly by petroleum programmes in the UK, North America and the Gulf.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'erbil-iq',
    name: 'Erbil',
    county: 'Erbil Governorate, Kurdistan Region',
    region: 'The Kurdistan Region\'s capital and its business centre · the country\'s deepest international school provision · a substantial diplomatic, energy and commercial community · the University of Kurdistan Hewlêr teaching in English',
    primaryKeyword: 'Online school and international curriculum in Erbil',
    heroTagline: 'For Erbil families — the country\'s deepest international provision, and the subjects even a good school cannot staff.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Erbil families. The Kurdistan Region\'s capital carries its business and administrative centre, a substantial diplomatic, energy and commercial community, and the deepest international school provision in the country — several British-curriculum and international schools, alongside the University of Kurdistan Hewlêr teaching in English. Those schools are good. What a school of any size still cannot always do is staff Further Mathematics for four students, or a third science, or an A-Level set that clashes with everything else. That is most of what we do here.',
    heroImg: '/heroes/erbil-iq.jpg',
    altTexts: { hero: 'Erbil citadel and city' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Erbil families — the subject sets a timetable cannot staff, on exactly your clock. From USD 400/month.',
    challenges: [
      'Specialist A-Level subjects often will not run for small cohorts even in strong schools.',
      'International school fees are set at regional levels with competitive places.',
      'Education in the Region is administered by the Kurdistan Region\'s own Ministry of Education.',
      'We could not verify a position on parental home education in either administrative track.',
      'Time zone: none — Iraq and our teaching base both run UTC+3 year-round.',
    ],
    familySituations: [
      'Diplomatic, consular and international-organisation families.',
      'Energy, commercial and corporate households.',
      'Families in the international school sector needing a subject their timetable cannot cover.',
      'Students targeting UK, American, Canadian or Gulf universities.',
      'Households arriving mid-curriculum from another country\'s system.',
      'Academic families connected to the Region\'s English-medium universities.',
    ],
    nearbyAreas: ['Erbil', 'Ainkawa', 'Masif', 'Shaqlawa', 'Koya', 'Soran', 'the Erbil plain'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic, Kurdish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Gulf and Iraqi university applications',
    ],
    whyChoose: [
      ['The set your school cannot staff', 'Further Mathematics or a third science for four pupils is unviable on one timetable and routine in a live group drawn from several countries.'],
      ['Respectful of provision that already exists', 'Erbil has the country\'s best international schools and we are not pretending otherwise. We supplement them.'],
      ['Exactly your clock, all year', 'Zero offset with no seasonal drift — after-school, mid-morning or evening all work equally.'],
      ['The two education authorities explained', 'The Kurdistan Region has its own Ministry of Education, distinct from the federal one. Which applies to a family depends on where they live, and we set that out.'],
      ['Continuity for a posting that moves', 'The curriculum, teachers and examination board continue unchanged to the next country.'],
    ],
    growingReason: 'Erbil is the Kurdistan Region\'s capital and business centre, with a substantial diplomatic, energy and commercial community, the deepest international school provision in the country, and the University of Kurdistan Hewlêr teaching in English. Iraq runs UTC+3 year-round, exactly our teaching clock.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Erbil, taught alongside a school enrolment in the subjects a timetable cannot cover. Examinations at authorised provision confirmed per family per session.',
      cbc: 'Kenya CBC available for Erbil families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Erbil sits within the Kurdistan Region, which has its own Ministry of Education administering schooling in Erbil, Sulaymaniyah, Duhok and Halabja — distinct from the federal Ministry of Education, which administers the governorates under federal administration, with differences in curriculum, language of instruction and school administration between the two tracks. That is the structural fact families here should hold onto: the ministry that governs your situation is determined by where you live, in the same way that Bosnian, Argentine and Swiss families deal with different administering authorities inside one country. Education is compulsory at the primary level, private and international schools operate with licensing from the relevant ministry, and Smartious holds no such licence and issues no Iraqi or Regional qualification. We could not verify a position on parental home education in either track and will not guess in either direction — confirm with the Kurdistan Region\'s Ministry of Education if you live in the Region, and note that an absence of clear regulation is an absence of protection rather than a permission. Our arrangement is live international teaching alongside a school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Erbil families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on exactly Iraq\'s clock with no offset at all, and every session recorded.',
    faqs: [
      { q: 'Our school is one of the best in the country — what would we gain?', a: 'Usually one specific thing: a subject set your timetable cannot staff. Further Mathematics, a third science, or a set that clashes with everything else. If your school covers what your child needs, we will tell you so.' },
      { q: 'Which ministry applies to us?', a: 'If you live in the Kurdistan Region — Erbil, Sulaymaniyah, Duhok or Halabja — the Region\'s own Ministry of Education administers schooling. Elsewhere it is the federal Ministry of Education. Curricula and administration differ between the two.' },
      { q: 'What time are classes?', a: 'Any hour of our teaching day, at exactly the time it shows on your clock — Iraq and our teaching base both run UTC+3 year-round with no seasonal changes.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'sulaymaniyah-iq',
    name: 'Sulaymaniyah',
    county: 'Sulaymaniyah Governorate, Kurdistan Region',
    region: 'The Region\'s cultural and academic city · the American University of Iraq Sulaimani teaching in English · a long university and publishing tradition · a mountain setting with dispersed surrounding communities',
    primaryKeyword: 'Online school and international curriculum in Sulaymaniyah',
    heroTagline: 'For Sulaymaniyah families — an English-medium university city with high academic ambition and thin school-level international provision.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Sulaymaniyah families. The city is the Kurdistan Region\'s cultural and academic centre, home to the American University of Iraq Sulaimani — an English-medium institution with a strong regional reputation — alongside a long university and publishing tradition and a mountain setting whose surrounding communities are dispersed. Academic ambition here is high and school-level international provision is thinner than in Erbil. We teach Cambridge and IB live, at whatever hour suits, on a clock with no offset at all.',
    heroImg: '/heroes/sulaymaniyah-iq.jpg',
    altTexts: { hero: 'Sulaymaniyah and the surrounding mountains' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Sulaymaniyah families — an English-medium university city with thin school provision. From USD 400/month.',
    challenges: [
      'Thinner school-level international provision than Erbil, three hours west.',
      'High academic ambition in a city with English-medium higher education.',
      'Dispersed communities in the surrounding mountain districts.',
      'We could not verify a position on parental home education in either administrative track.',
      'Time zone: none — Iraq and our teaching base both run UTC+3 year-round.',
    ],
    familySituations: [
      'University academic, research and medical-faculty families.',
      'Students already aiming at English-medium higher education.',
      'Professional and commercial households in the city.',
      'Families in the surrounding districts far from any campus.',
      'Students targeting UK, American, Canadian or Gulf universities.',
    ],
    nearbyAreas: ['Sulaymaniyah', 'Halabja', 'Chamchamal', 'Ranya', 'Dukan', 'Penjwen', 'the surrounding districts'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic, Kurdish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, History',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Gulf and Iraqi university applications',
    ],
    whyChoose: [
      ['Built for a city already studying in English', 'Students heading to English-medium higher education benefit from an English-medium examined record before they get there — IGCSE and A-Level do exactly that.'],
      ['Pre-medical and STEM depth', 'Cambridge A-Level Biology, Chemistry, Mathematics and Physics, taught by subject specialists in groups of four to six.'],
      ['Reaches the surrounding districts', 'Halabja, Chamchamal, Ranya and the mountain communities get identical live teaching.'],
      ['Exactly your clock, all year', 'Zero offset with no seasonal drift — an academic household can build the week it wants.'],
      ['Kurdish and Arabic kept alongside', 'Home language support runs beside the English-medium core rather than displacing it.'],
    ],
    growingReason: 'Sulaymaniyah is the Kurdistan Region\'s cultural and academic centre, home to the American University of Iraq Sulaimani teaching in English, with a long university and publishing tradition and dispersed surrounding mountain communities — and thinner school-level international provision than Erbil. Iraq runs UTC+3 year-round, exactly our teaching clock.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Sulaymaniyah, taught alongside a school enrolment. Examination travel planned per session ahead.',
      cbc: 'Kenya CBC available for Sulaymaniyah families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Sulaymaniyah sits within the Kurdistan Region, whose own Ministry of Education administers schooling in the Region — distinct from the federal Ministry of Education administering the governorates under federal administration, with differences in curriculum, language of instruction and school administration between the two. The operative authority depends on where a family lives. Education is compulsory at the primary level, private and international schools operate with licensing from the relevant ministry, and Smartious holds no such licence and issues no Iraqi or Regional qualification. We could not verify a position on parental home education in either track and decline to characterise it either way — confirm with the Kurdistan Region\'s Ministry of Education. Our arrangement is live international teaching alongside a school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Sulaymaniyah families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on exactly Iraq\'s clock with no offset at all, and every session recorded.',
    faqs: [
      { q: 'Our child is heading for English-medium university — does an English examined record help?', a: 'Considerably. IGCSE and A-Level are English-medium and externally examined, so a student arrives at an English-medium university with a demonstrated record in the language of instruction rather than only a test score.' },
      { q: 'Is there international schooling in Sulaymaniyah?', a: 'Thinner than in Erbil, three hours west. Live delivery reaches the city and the surrounding districts identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'duhok-iq',
    name: 'Duhok & the North',
    county: 'Duhok Governorate, Kurdistan Region',
    region: 'The northern governorate — agriculture, trade toward Turkey and the Ibrahim Khalil corridor · its own university · mountain and valley communities spread across a wide area · minimal international provision',
    primaryKeyword: 'Online school and international curriculum in Duhok',
    heroTagline: 'For Duhok and northern families — a trade and agricultural governorate spread across mountains, with almost no international schooling.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Duhok and northern families. The northern governorate carries agriculture, the trade corridor running toward Turkey, and its own university, with communities spread across mountains and valleys over a wide area. International provision is minimal, Erbil is a couple of hours south-east, and for many families the distance is the whole constraint. Live delivery reaches all of it, on a clock with no offset at all — and every session is recorded, so a week that cannot be attended is never a week lost.',
    heroImg: '/heroes/duhok-iq.jpg',
    altTexts: { hero: 'Duhok and the northern mountains' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Duhok and northern Iraq families — trade and agriculture, minimal provision. From USD 400/month.',
    challenges: [
      'Minimal international provision across a wide and mountainous governorate.',
      'Erbil is a couple of hours south-east and Baghdad much further.',
      'Communities dispersed across mountain and valley districts.',
      'We could not verify a position on parental home education in either administrative track.',
      'Time zone: none — Iraq and our teaching base both run UTC+3 year-round.',
    ],
    familySituations: [
      'Agricultural and agri-business families across the governorate.',
      'Trade, transport and border-corridor commercial households.',
      'University academic and professional families in the city.',
      'Households in dispersed mountain and valley districts.',
      'Students aiming at agronomy, engineering or medicine abroad.',
    ],
    nearbyAreas: ['Duhok', 'Zakho', 'Amedi', 'Semel', 'Akre', 'Ibrahim Khalil corridor', 'the northern districts'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic, Kurdish and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Geography, Physics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Gulf, Turkish and Iraqi university applications',
    ],
    whyChoose: [
      ['The complete option in a governorate with almost none', 'Identical live delivery in Duhok, Zakho, Amedi and the mountain districts as in Erbil.'],
      ['Agricultural and environmental science that fit the region', 'Cambridge A-Level Biology and Chemistry with Geography feed agronomy, food science and environmental routes directly.'],
      ['Reaches dispersed communities', 'No commute to a campus that does not exist, and every session recorded.'],
      ['Exactly your clock, all year', 'Zero offset with no seasonal drift.'],
      ['Kurdish and Arabic kept alongside', 'Home language support runs beside the English-medium core.'],
    ],
    growingReason: 'Duhok governorate carries agriculture, the trade corridor toward Turkey, and its own university, with communities spread across mountains and valleys over a wide area and minimal international provision. Iraq runs UTC+3 year-round, exactly our teaching clock.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the north, taught alongside a school enrolment. Examination travel planned per session well ahead.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Duhok sits within the Kurdistan Region, whose own Ministry of Education administers schooling in the Region — distinct from the federal Ministry of Education administering the governorates under federal administration. Education is compulsory at the primary level, private and international schools operate with licensing from the relevant ministry, and Smartious holds no such licence and issues no Iraqi or Regional qualification. We could not verify a position on parental home education in either track and will not guess — confirm with the Kurdistan Region\'s Ministry of Education, and note that an absence of clear regulation is an absence of protection rather than a permission. Our arrangement is live international teaching alongside a school enrolment.',
    homeTuitionDetail: 'Smartious delivers to northern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on exactly Iraq\'s clock with no offset at all, and the full recorded library built for dispersed districts and long journeys.',
    faqs: [
      { q: 'Is there international schooling in Duhok?', a: 'Minimal, with Erbil a couple of hours south-east. Live delivery reaches Duhok, Zakho, Amedi and the mountain districts identically.' },
      { q: 'Our child wants agronomy or environmental science — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Geography, planned backward from the target university from IGCSE onward.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const IRAQ_COUNTRY = {
  slug: 'iraq',
  name: 'Iraq',
  longName: 'Republic of Iraq',
  adjective: 'Iraqi',
  flag: '🇮🇶',
  hub: '/online-school/iraq',
  hubPageId: 'homeschooling-iraq',
  cityPageId: 'iraq-city',

  currency: 'IQD',
  currencyName: 'Iraqi Dinar',
  currencyPeg: 'Fees are quoted and invoiced in USD, which is widely used in Iraq for larger commitments — so a multi-year education decision is a single figure to plan around.',

  timezone: {
    code: 'UTC+3',
    name: 'UTC+3 year-round, with no seasonal clock changes',
    utcOffset: '+3',
    offsetFromEAT: 'None. Iraq runs UTC+3 and our teaching base runs UTC+3 — a zero offset, all year, with no seasonal drift',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — availability is checked carefully for each family, with Erbil holding the country\'s deepest capacity'],
  examCentreTiles: [
    { city: 'Erbil', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Baghdad', centre: 'Regional provision', area: 'Checked first for federal-governorate families.' },
    { city: 'Basra, Sulaymaniyah and Duhok', centre: 'Planned well ahead', area: 'Southern and northern families plan arrangements several weeks in advance of each window.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Iraq-based students sit as external candidates at authorised provision, and this is a market where we plan the examination question earlier and more carefully than most. Erbil holds the country\'s deepest capacity through its international school sector and is checked first, with Baghdad for federal-governorate families and arrangements planned several weeks ahead for Basra, Sulaymaniyah and Duhok. Where a domestic sitting is not practical for a particular series, we discuss alternatives with the family in good time rather than at the entry deadline — families with relatives or business in Jordan, the Gulf or Türkiye sometimes sit there, and we help plan that properly. Note what does not change: our arrangement runs alongside an Iraqi school, which continues its own national track unchanged. Smartious holds no licence from either the federal Ministry of Education or the Kurdistan Region\'s Ministry of Education, issues no Iraqi qualification, and does not teach toward the national examinations.',
  secondaryProgrammeExamRef: 'Authorised Cambridge provision, planned per family',
  finalCTABadgeExamRef: 'Examination arrangements planned individually, well ahead',

  heroImage: '/heroes/iraq.jpg',
  heroEyebrow: 'Online school for Iraq',
  heroH1Suffix: 'Iraq',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for energy, corporate, academic and Iraqi families across Baghdad, Basra, Erbil, Sulaymaniyah and Duhok. Iraq shares our teaching clock exactly — UTC+3 year-round on both sides, no offset and no drift — so every hour of our day is available at the hour it shows on yours.',
  heroValueProp: 'From USD 180/month, quoted in USD. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — alongside your school, at any hour.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Iraq',

  citiesSectionTitle: 'Where our Iraq families are',
  citiesSectionBody: 'Smartious Iraq families concentrate across Baghdad (the federal capital, the University of Baghdad and the country\'s largest professional population), Basra (the southern oil province, the ports and an internationally recruited technical workforce), Erbil (the Kurdistan Region\'s capital and the country\'s deepest international school provision), Sulaymaniyah (the Region\'s academic city, with English-medium higher education and thinner school provision), and Duhok and the north (agriculture, the trade corridor and dispersed mountain communities). Two education authorities depending on where you live, one honest legal hedge, and no timezone at all.',

  trustSignals: [
    { h: 'Exactly our clock, all year', p: 'Iraq runs UTC+3 year-round and our teaching base runs UTC+3 year-round. There is no offset and no seasonal drift, so every hour of our teaching day is available at the hour it shows on your own clock.' },
    { h: 'Two education authorities, explained', p: 'The federal Ministry of Education administers schooling in the governorates under federal administration; the Kurdistan Region has its own Ministry of Education for Erbil, Sulaymaniyah, Duhok and Halabja, with differences in curriculum and administration. Which applies depends on where you live, and we set that out rather than flattening it.' },
    { h: 'Honest about what we could not verify', p: 'We could not establish a position on parental home education in either administrative track. Rather than guessing in either direction, we say so, note that an absence of clear regulation is not a permission, and send families to the ministry that governs where they live.' },
    { h: 'Examinations planned early, not assumed', p: 'We raise the examination question at enrolment rather than in the term before a series, plan travel into each window, and discuss alternatives — including sittings arranged in Jordan, the Gulf or Türkiye — well before an entry deadline.' },
  ],

  universitiesInCountry: 'the University of Baghdad, the University of Basrah, the University of Technology, Salahaddin University in Erbil and the University of Sulaimani, alongside the English-medium American University of Iraq Sulaimani and the University of Kurdistan Hewlêr — a higher-education tradition among the oldest and deepest in the region.',
  universityChannels: 'Iraqi universities admit on the national secondary examinations through their own processes, with international qualifications entering through equivalency procedures confirmed per institution — a family intending to enter the Iraqi system should confirm that route early, and note that the Iraqi side of a student\'s record has to come from an Iraqi school rather than from us. Two of the country\'s institutions teach in English, which makes an English-medium examined record valuable even for students staying in Iraq. Outward, Iraqi students apply in numbers to the United Kingdom, the United States, Canada, the Gulf, Jordan and Türkiye: UCAS reads Cambridge A-Levels natively, American and Canadian universities read A-Levels, the IB Diploma and AP records directly, and Gulf institutions — many of them branch campuses of British and American universities — read them equally directly. A-Levels are accepted in 160+ countries, including the petroleum and geoscience programmes our Basra families most often have in view. Smartious provides personalised university guidance across UK (UCAS), US, Canadian, Gulf, Jordanian and Iraqi destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Iraq families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes at whatever hour suits — Iraq and our teaching base both run UTC+3 year-round, so there is no offset and nothing drifts — run alongside an Iraqi school enrolment that continues its own national track unchanged. Cambridge Arabic and Kurdish home language support available beside the English-medium core. Every session recorded. Fees quoted in USD.',
  britishCurriculumSuits: 'Iraq families targeting the Cambridge pathway. Best fit for: (1) energy families in Basra whose postings move between countries, (2) Duhok and Sulaymaniyah families where provision is thin or minimal, (3) Erbil families needing a subject their school cannot staff for a small cohort, (4) Baghdad households wanting an internationally examined record alongside the Iraqi one, (5) students heading for English-medium higher education whether in Iraq or abroad.',
  britishCurriculumDelivery: 'Live online classes at any hour of our teaching day, small groups 4-6 students, every session recorded, alongside an Iraqi school enrolment.',
  ibDiplomaSuits: 'Iraq families in the country\'s international school sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Iraq families targeting US universities via Common Application, or preparing for English-medium institutions closer to home.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Iraq has one of the oldest continuous educational traditions anywhere and a university system that has produced engineers, doctors and scientists working worldwide — and it shares our teaching clock exactly, which makes it one of the easiest markets we serve to timetable.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Basra\'s petroleum engineering households and every medicine-bound student in Baghdad, Erbil and Sulaymaniyah. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Erbil holds the country\'s deepest international school provision — several British-curriculum and international schools built around the diplomatic, energy and business community — and Baghdad has an established private sector with international options. Those schools are good and their places are competitive. The picture is thinner in Sulaymaniyah, thinner again in Basra relative to the scale of its energy workforce, and minimal across Duhok governorate. The most common reason families come to us is not the absence of good teaching but the absence of a particular subject set, or of any international provision at all where they happen to live.',
  competitors: [
    { name: 'The Erbil international school sector',            city: 'Erbil',                 curriculum: 'British, American and international',   feesUsd: 'Regional international tier',                       feesAed: 'Competitive places',      rating: 4.5, capacityNote: 'The country\'s deepest provision — good schools, and concentrated in one city' },
    { name: 'Baghdad private and international schools',        city: 'Baghdad',               curriculum: 'National plus international options',   feesUsd: 'Mid to premium tier',                               feesAed: 'Varies',                  rating: 4.2, capacityNote: 'An established sector serving the largest professional population in the country' },
    { name: 'English-medium universities',                      city: 'Sulaymaniyah, Erbil',   curriculum: 'Higher education in English',           feesUsd: '—',                                                 feesAed: '—',                       rating: 4.6, capacityNote: 'Not competitors — but they raise the value of an English-medium examined school record for students staying in Iraq' },
    { name: 'Basra',                                            city: 'The south',             curriculum: 'Thin relative to the energy workforce', feesUsd: 'Limited international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'One of the world\'s significant oil provinces with an internationally recruited workforce and little matching provision' },
    { name: 'Duhok and the northern districts',                 city: 'The north',             curriculum: 'Minimal',                               feesUsd: 'No real international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'A wide mountainous governorate with dispersed communities and almost no international schooling' },
    { name: 'Private tuition',                                  city: 'Nationwide',            curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Widespread',              rating: 4.0, capacityNote: 'The default answer to a subject gap — usually one-to-one and unstructured across a year' },
    { name: 'Smartious Homeschool (Iraq via online delivery)',   city: 'Delivered nationwide',  curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP',   feesUsd: 'USD 2,160-6,480/year',                              feesAed: 'Quoted in USD',            rating: 4.8, capacityNote: 'Every class live through A-Level + zero timezone offset year-round + Basra, Duhok and Sulaymaniyah reached + both education authorities explained + examinations planned early' },
  ],

  legalFrameworkIntro: 'Iraq has one structural feature that shapes everything else about its education framework, and one question we could not verify. Both belong at the top.',
  legalFramework: [
    { h: 'Two administering authorities, not one', p: 'This is the fact families most need and the one most often flattened. Education in Iraq is administered on two tracks: the federal Ministry of Education administers schooling in the governorates under federal administration, and the Kurdistan Region has its own Ministry of Education administering schooling in Erbil, Sulaymaniyah, Duhok and Halabja — with differences in curriculum, language of instruction and school administration between them. So the ministry that governs a family\'s situation is determined by where they live. Readers of our Bosnian, Argentine and Swiss pages will recognise the pattern: one country, more than one administering authority, and operative detail that depends on address rather than nationality.' },
    { h: 'What is compulsory, and what licensing applies', p: 'Education is compulsory at the primary level, and families should confirm the current boundaries with the ministry that administers education where they live rather than take them from any article. Private and international schools operate with licensing from the relevant ministry. Smartious holds no licence from either the federal Ministry of Education or the Kurdistan Region\'s Ministry of Education, does not operate premises in Iraq, and issues no Iraqi or Regional qualification. The national secondary examinations are administered within each track; we do not teach toward either of them.' },
    { h: 'What we could not establish', p: 'A position on parental home education in either administrative track. We could not verify it against a primary instrument, and we are not going to fill that gap with confident prose. We will not tell you it is permitted and we will not tell you it is prohibited; both would exceed what we can evidence. What we would add is the point we make in Panama, Guatemala, Venezuela and Jordan: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to the ministry that administers education where you live.' },
    { h: 'What we therefore build', p: 'Live Cambridge or IB teaching alongside an Iraqi school enrolment. The school carries the compulsory-education duty, the national curriculum and the domestic record; we teach the internationally examined track alongside it. Nothing in that arrangement depends on the unresolved question, which is exactly why it is the arrangement we build.' },
    { h: 'Why an English-medium examined record matters even at home', p: 'One point specific to Iraq is worth drawing out. Two of the country\'s well-regarded institutions — the American University of Iraq Sulaimani and the University of Kurdistan Hewlêr — teach in English, and a great many Iraqi students head for English-medium higher education whether in Iraq, the Gulf, Jordan, Türkiye or further afield. Cambridge IGCSE and A-Level are English-medium and externally examined, which means a student arrives at that kind of institution holding a demonstrated academic record in the language of instruction rather than only a language test score. That is a benefit which applies even to families with no intention of leaving the country.' },
    { h: 'The clock, and how we plan examinations', p: 'Iraq runs UTC+3 year-round with no seasonal clock changes, and our teaching base runs UTC+3 year-round. That is a zero offset — not a small one, not one that shifts in summer, but none at all. Every hour of our teaching day is available at exactly the hour it appears on an Iraqi family\'s clock. On examinations, we plan earlier here than in most markets: Erbil holds the deepest capacity and is checked first, Baghdad serves federal-governorate families, and arrangements for Basra, Sulaymaniyah and Duhok are planned several weeks ahead of each window. Where a domestic sitting is not practical for a particular series we discuss alternatives in good time, including sittings arranged where families have relatives or business in Jordan, the Gulf or Türkiye. Every class is also recorded, so a session that cannot be attended is never a session lost.' },
  ],

  whySmartious: [
    { h: 'Zero timezone offset, year-round',                              p: 'Iraq and our teaching base both run UTC+3 with no seasonal changes — every hour of our day available at the hour it shows on your clock.' },
    { h: 'Both education authorities explained',                          p: 'Federal Ministry of Education or the Kurdistan Region\'s own, depending on where you live. We set out the distinction rather than flattening it.' },
    { h: 'An English-medium record for English-medium universities',      p: 'Valuable even for students staying in Iraq, given the country\'s English-medium institutions.' },
    { h: 'Basra, Duhok and Sulaymaniyah reached',                         p: 'An oil province, a mountain governorate and an academic city, all thinner on provision than their profiles suggest.' },
    { h: 'Examinations planned at enrolment',                             p: 'Raised early, travel planned into each window, and alternatives discussed well before an entry deadline.' },
    { h: 'Every session recorded',                                        p: 'A class that cannot be attended is never a class lost — pacing is adjusted per student rather than assumed.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Iraq?', a: 'We could not verify a position in either administrative track and will not guess. Education is compulsory at the primary level, administered by the federal Ministry of Education in the federal governorates and by the Kurdistan Region\'s own Ministry of Education in the Region. An absence of clear regulation is not a permission — confirm with the ministry that administers education where you live.' },
    { q: 'Which ministry applies to my family?', a: 'It depends on where you live. The Kurdistan Region — Erbil, Sulaymaniyah, Duhok and Halabja — has its own Ministry of Education; elsewhere it is the federal Ministry of Education. Curriculum, language of instruction and school administration differ between the two tracks.' },
    { q: 'Do you teach the Iraqi national examinations?', a: 'No. We hold no licence from either ministry and issue no Iraqi or Regional qualification. We teach Cambridge, Edexcel, IB and AP examinations, which sit alongside the Iraqi record rather than replacing it.' },
    { q: 'What time are classes?', a: 'Any hour of our teaching day, at exactly the time it shows on your clock. Iraq and our teaching base both run UTC+3 year-round with no seasonal changes — a zero offset.' },
    { q: 'Our child may stay in Iraq for university — is an international record still worth it?', a: 'Often yes. Two well-regarded Iraqi institutions teach in English, and an English-medium externally examined record means a student arrives with demonstrated academic work in the language of instruction rather than only a test score.' },
    { q: 'Where would our child sit examinations?', a: 'We plan this at enrolment. Erbil holds the deepest capacity and is checked first, Baghdad serves federal-governorate families, and arrangements for Basra, Sulaymaniyah and Duhok are planned several weeks ahead. Where a domestic sitting is not practical we discuss alternatives in good time.' },
    { q: 'We are on an energy posting in Basra — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next basin or country, with examinations sat at authorised centres wherever the family is.' },
    { q: 'Which parts of Iraq does Smartious cover?', a: 'Baghdad, Basra, Erbil, Sulaymaniyah, and Duhok and the north have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us where in Iraq you are: it determines which education authority applies to your family, and how we plan examination arrangements — both of which belong in the first message.',
}
