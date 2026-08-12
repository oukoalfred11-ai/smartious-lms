// ═══════════════════════════════════════════════════════════════════
// VENEZUELA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for professional, industrial, energy, and Venezuelan
// families across Caracas, Maracaibo, Valencia, Puerto Ordaz and Mérida.
// FIFTEENTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// *** TONE RULE — READ BEFORE EDITING ANYTHING ***
// Venezuela has been through a great deal and many of our readers here
// have families split across several countries. WRITE WITH DIGNITY.
// - NO political commentary of any kind. Not one line. We are a
//   school, not a commentator, and families here have heard enough
//   from outsiders.
// - Do NOT describe the country as broken, collapsed, failed, or in
//   crisis. Do NOT use the word "exodus".
// - Describe educational facts only, factually: that many families
//   have members living in other countries, that international
//   qualifications travel, that fees quoted in USD are easier to plan
//   around. Those are true and useful without editorialising.
// - Venezuelan families are among the best-educated in the region
//   and their universities have a strong history. SAY SO. The
//   respectful framing is continuity and portability, never rescue.
//
// LEGAL POSITIONING NOTE — HEDGE FIRMLY, SOURCING IS THIN:
// - We could NOT verify Venezuela's position on parental home
//   education against a primary instrument.
// - What we can state: education is governed by the LEY ORGÁNICA DE
//   EDUCACIÓN (2009), administered by the MINISTERIO DEL PODER
//   POPULAR PARA LA EDUCACIÓN; education is compulsory; private
//   institutions operate with ministerial authorisation.
// - State the compulsory range GENERALLY. Do not quote ages we have
//   not verified. Route families to the ministry.
// - PHRASE EVERY TIME: "we are not aware of a specific framework",
//   "we could not verify", plus "confirm with the Ministerio del
//   Poder Popular para la Educación". NEVER assert permitted, NEVER
//   assert prohibited.
// - Reuse the Panama/Guatemala argument: an absence of regulation is
//   an absence of protection rather than a permission.
// - Smartious is NOT an authorised Venezuelan institution; say so.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT.
// CURRENCY: the USD is widely used in practice for larger
// commitments. Our fees are quoted in USD, which removes the
// planning question entirely. State this plainly and without
// commentary — it is a practical fact and a genuine advantage.
// TIMEZONE: VET (UTC-4), no daylight saving — SEVEN HOURS behind
// Nairobi, same as Bolivia and the Dominican Republic. Venezuelan
// mornings and very early afternoons both work. Venezuelan schools
// commonly run turnos mañana and tarde.
// MARKET NOTE: Caracas holds the historic international tier —
// Colegio Internacional de Caracas, Escuela Campo Alegre, the British
// School, the French and German schools — with IB and American
// provision. Maracaibo and Zulia are the historic oil capital.
// Valencia and Carabobo hold the industrial belt. Puerto Ordaz and
// Ciudad Guayana carry the Orinoco mining, steel and aluminium
// complex on the Guayana shield — iron ore, bauxite, gold. Mérida is
// the Andean university city, home to the Universidad de Los Andes.
// Venezuela has one of the largest professional diasporas in the
// Americas, and many families have members in Spain, the United
// States, Colombia, Chile, Panama and Portugal — which is precisely
// why an internationally readable qualification matters here.
// ═══════════════════════════════════════════════════════════════════

export const VENEZUELA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'caracas-ve',
    name: 'Caracas',
    county: 'Distrito Capital and Miranda',
    region: 'The capital and corporate centre · a historic international school tier with IB and American provision · the diplomatic community · a professional class with family in several countries',
    primaryKeyword: 'Online school and international curriculum in Caracas',
    heroTagline: 'For Caracas families — Cambridge and IB taught live, in USD, with a record that reads anywhere your family already is.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Caracas families. The capital holds Venezuela\'s corporate and professional centre, the diplomatic community, and a long-established international school tier — the Colegio Internacional de Caracas, Escuela Campo Alegre, the British, French and German schools — with IB and American provision behind it. Many Caracas families now have members living in Spain, the United States, Colombia, Chile, Panama or Portugal, and an internationally examined qualification is read directly in all of them. We quote in USD, which removes the planning question entirely.',
    heroImg: '/heroes/caracas-ve.jpg',
    altTexts: { hero: 'Caracas and El Ávila' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Caracas families — fees in USD, a qualification read in every country your family is in. From USD 400/month.',
    challenges: [
      'Families frequently have members in several countries, and a qualification needs to read in all of them.',
      'International school places in Caracas are competitive and fees are set at international levels.',
      'Education is compulsory under the Ley Orgánica de Educación and administered by the ministry.',
      'We could not verify Venezuela\'s position on parental home education from a primary instrument.',
      'Time zone: Venezuela runs VET (UTC-4) with no daylight saving — seven hours behind Nairobi, so mornings and very early afternoons work.',
    ],
    familySituations: [
      'Professional and corporate families with relatives abroad.',
      'Families planning for children to study in Spain, the United States, Colombia, Chile or Portugal.',
      'Diplomatic and international-organisation households.',
      'Students in turno tarde with mornings free.',
      'Families outside the international tier\'s fees who still want an examined international track.',
      'Students returning to Venezuela mid-curriculum from another system.',
    ],
    nearbyAreas: ['Altamira and Chacao', 'La Castellana', 'El Hatillo', 'Los Palos Grandes', 'Baruta', 'La Lagunita', 'Valle Arriba'],
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
      'University application support — Spanish, US, Colombian, Chilean, Portuguese, Canadian and UK (UCAS) applications',
    ],
    whyChoose: [
      ['A qualification that reads where your family already is', 'Cambridge A-Levels and the IB are read directly in Spain, the United States, Colombia, Chile, Portugal and Canada — the countries Venezuelan families most often have ties to.'],
      ['Fees quoted in USD', 'Our invoicing is in dollars, which are widely used here for larger commitments. That removes the planning question from a multi-year education decision.'],
      ['Continuity if a household moves', 'The curriculum, teachers, and examination board continue unchanged wherever the family is next — one pathway rather than a restart.'],
      ['Honest where we could not verify', 'We could not establish Venezuela\'s position on home education from a primary instrument and say so rather than guessing in either direction.'],
      ['Seven hours, and both turnos covered', 'Venezuelan mornings and very early afternoons both land in our teaching day.'],
    ],
    growingReason: 'Caracas holds Venezuela\'s corporate and professional centre, the diplomatic community, and a long-established international school tier with IB and American provision — in a country whose professional families frequently have members in Spain, the United States, Colombia, Chile, Panama and Portugal. Venezuela runs VET (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Caracas families, taught alongside a Venezuelan school enrolment. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Caracas families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the capital\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Venezuelan education is governed by the Ley Orgánica de Educación of 2009 and administered by the Ministerio del Poder Popular para la Educación, and education is compulsory — families should confirm the current age boundaries with the ministry rather than take them from a provider. On parental home education we are going to be careful, because we could not verify Venezuela\'s position against a primary instrument. We will not tell you it is permitted and we will not tell you it is prohibited; both would exceed what we can evidence, and a family that plans a school year around an overconfident claim carries the cost of it rather than we do. What we would say is what we say in Panama and Guatemala: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to the ministry directly and get the answer in a form you can keep. Our own arrangement raises none of it: live Cambridge or IB teaching alongside a Venezuelan school enrolment. Private institutions operate with ministerial authorisation and Smartious does not hold it — we issue no Venezuelan qualification and teach Cambridge, Pearson Edexcel, IB and AP examinations with their own international validity.',
    homeTuitionDetail: 'Smartious delivers to Caracas families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Venezuela sits seven hours behind Nairobi with no daylight saving, so Venezuelan morning and very early afternoon classes both fall in our teaching day at a constant time every week, with all sessions recorded — and the full recorded library means a missed session is never a lost one.',
    faqs: [
      { q: 'Is homeschooling legal in Venezuela?', a: 'We could not verify a position from a primary Venezuelan instrument and will not guess. Education is compulsory under the Ley Orgánica de Educación of 2009 and administered by the Ministerio del Poder Popular para la Educación. Put the question to the ministry directly. Structured study alongside a school enrolment raises none of it, and that is what we offer.' },
      { q: 'Our family is spread across several countries — does that shape the choice?', a: 'It shapes the qualification. Cambridge A-Levels and the IB Diploma are read directly by universities in Spain, the United States, Colombia, Chile, Portugal and Canada, whereas a purely national record is assessed through recognition procedures in each. For a family with ties in more than one country, that difference is the whole argument.' },
      { q: 'How do fees work?', a: 'We quote and invoice in USD, which is widely used here for larger commitments — USD 2,160-6,480 a year for live small-group teaching. That makes a multi-year education commitment straightforward to plan.' },
      { q: 'How does the timezone work?', a: 'Seven hours, fixed. Venezuelan mornings and very early afternoons both land in our teaching day, and with schools commonly running turno mañana and tarde, most students have one window genuinely free.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'maracaibo-ve',
    name: 'Maracaibo & Zulia',
    county: 'Zulia',
    region: 'The historic oil capital on Lake Maracaibo · a long-established petroleum engineering community · the Colombian border corridor · a strong regional university sector',
    primaryKeyword: 'Online school and international curriculum in Maracaibo',
    heroTagline: 'For Maracaibo and Zulia families — a century of petroleum engineering, and a qualification that travels with the profession.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Maracaibo and Zulia families. Lake Maracaibo has been the centre of Venezuelan petroleum since the 1920s, and the region built one of the most experienced petroleum engineering and geoscience communities in the Americas around it, alongside a strong regional university sector and the corridor to the Colombian border. It is a profession that has always been internationally mobile, and Cambridge A-Level Physics, Chemistry and Mathematics is the spine it runs on. We teach live to Zulia in the Venezuelan morning, in USD.',
    heroImg: '/heroes/maracaibo-ve.jpg',
    altTexts: { hero: 'Lake Maracaibo and the bridge' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Maracaibo and Zulia families — petroleum engineering heartland, fees in USD. From USD 400/month.',
    challenges: [
      'An experienced petroleum engineering community whose profession is internationally mobile.',
      'Caracas is a flight east and international provision in Zulia is limited.',
      'Cross-border households toward Colombia need to know which framework applies.',
      'We could not verify Venezuela\'s position on parental home education.',
      'Time zone: Zulia shares VET (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'Petroleum engineering, geoscience, and oilfield-services families.',
      'University academic and research households.',
      'Regional professional and commercial families.',
      'Cross-border households toward the Colombian frontier.',
      'Families whose children may study or work internationally.',
    ],
    nearbyAreas: ['Maracaibo', 'Cabimas', 'Ciudad Ojeda', 'Lagunillas', 'Santa Bárbara del Zulia', 'Machiques', 'the Colombian border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Physics, Chemistry, Mathematics, Further Mathematics, Geography',
      'Cambridge A-Level Biology, Economics, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Physics, AP Chemistry, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including petroleum and geoscience programmes), Common Application (US), and Spanish, Colombian and Venezuelan university applications',
    ],
    whyChoose: [
      ['The petroleum spine, taught by specialists', 'Cambridge A-Level Physics, Chemistry and Mathematics — led by a founder with a BEd in Mathematics and Physics — is exactly the set this region\'s families aim at.'],
      ['A qualification that travels with the profession', 'Petroleum careers have always been international, and A-Levels are read in 160+ countries including the petroleum and geoscience programmes these students target.'],
      ['Fees quoted in USD', 'Straightforward planning for a multi-year commitment.'],
      ['The complete option a flight from the capital', 'Identical live delivery in Maracaibo and Caracas.'],
      ['Residence stated precisely', 'Cross-border households follow the framework of where they legally reside — Colombia\'s position is itself disputed and differs from Venezuela\'s.'],
    ],
    growingReason: 'Lake Maracaibo has been the centre of Venezuelan petroleum since the 1920s, building one of the most experienced petroleum engineering and geoscience communities in the Americas, alongside a strong regional university sector and the Colombian border corridor. Venezuela runs VET (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Zulia, taught alongside a Venezuelan school enrolment and portable across international postings.',
      cbc: 'Kenya CBC available for Zulia families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Zulia: education is governed by the Ley Orgánica de Educación of 2009, administered by the Ministerio del Poder Popular para la Educación, and compulsory. We could not verify Venezuela\'s position on parental home education against a primary instrument and decline to characterise it as either permission or prohibition — confirm with the ministry directly. Smartious is not an authorised Venezuelan institution and issues no Venezuelan qualification. Cross-border households resident in Colombia follow Colombian law, where the position is itself genuinely disputed between Colombian sources and where the validation machinery runs through authorised institutions and ICFES — a question for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to Zulia families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Venezuelan morning or very early afternoon, with every session recorded.',
    faqs: [
      { q: 'Our family works in petroleum and may move abroad — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue wherever the family is next, with examinations sat at authorised centres locally. It is the case we already run for petroleum families in Stavanger, Baku, Macaé, Neuquén and Cabinda.' },
      { q: 'Is there international schooling in Maracaibo?', a: 'Limited, with the historic tier concentrated in Caracas a flight east. Live delivery reaches Zulia identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'valencia-ve',
    name: 'Valencia & Carabobo',
    county: 'Carabobo',
    region: 'The historic industrial and manufacturing belt · the Puerto Cabello port complex · automotive, chemical and food-processing plants · a strong regional university and medical sector',
    primaryKeyword: 'Online school and international curriculum in Valencia Venezuela',
    heroTagline: 'For Valencia and Carabobo families — Venezuela\'s manufacturing belt and its principal port, with an engineering tradition worth building on.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Valencia and Carabobo families. Carabobo built Venezuela\'s industrial heartland — automotive assembly, chemicals, food processing and manufacturing — alongside Puerto Cabello, the country\'s principal port, and a strong regional university and medical sector. The engineering and commercial tradition here is deep, and the qualification that carries it furthest is one universities abroad read directly. We teach Cambridge and IB live to Carabobo in the Venezuelan morning, in USD.',
    heroImg: '/heroes/valencia-ve.jpg',
    altTexts: { hero: 'Valencia and the Carabobo valley' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Valencia and Carabobo families — the industrial belt and Puerto Cabello. From USD 400/month.',
    challenges: [
      'International provision in Carabobo is limited relative to the region\'s industrial and academic depth.',
      'Caracas is around two hours east.',
      'Families with members abroad need a record that reads in several countries.',
      'We could not verify Venezuela\'s position on parental home education.',
      'Time zone: Carabobo shares VET (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'Manufacturing, automotive, and chemical engineering families.',
      'Port, logistics, and commercial households around Puerto Cabello.',
      'University academic and medical-faculty families.',
      'Regional professional families outside the Caracas tier.',
      'Students in turno tarde with mornings free.',
    ],
    nearbyAreas: ['Valencia', 'Naguanagua', 'San Diego', 'Puerto Cabello', 'Guacara', 'Maracay', 'Lake Valencia'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Chemistry, AP Physics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — Spanish, US, Colombian, Chilean and UK (UCAS) applications',
    ],
    whyChoose: [
      ['Engineering depth for an industrial region', 'Cambridge A-Level Mathematics, Further Mathematics, Physics and Chemistry suit a manufacturing and chemical belt precisely.'],
      ['Pre-medical depth for a university city', 'Cambridge A-Level Biology and Chemistry with Mathematics, planned from IGCSE onward.'],
      ['A qualification that reads abroad', 'Read directly by universities in Spain, the United States, Colombia, Chile, Portugal and Canada.'],
      ['Fees quoted in USD', 'Straightforward planning for a multi-year commitment.'],
      ['The complete option two hours from the capital', 'Identical live delivery in Valencia and Caracas.'],
    ],
    growingReason: 'Carabobo built Venezuela\'s industrial heartland — automotive assembly, chemicals, food processing and manufacturing — alongside Puerto Cabello, the principal port, and a strong regional university and medical sector, with limited international provision relative to that depth. Venezuela runs VET (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Carabobo, taught alongside a Venezuelan school enrolment.',
      cbc: 'Kenya CBC available for Carabobo families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Carabobo: education is governed by the Ley Orgánica de Educación of 2009, administered by the Ministerio del Poder Popular para la Educación, and compulsory. We could not verify Venezuela\'s position on parental home education against a primary instrument, decline to characterise it in either direction, and would send any family whose plan depends on it to the ministry. Smartious is not an authorised Venezuelan institution and issues no Venezuelan qualification — we teach the internationally examined track alongside a Venezuelan school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Carabobo families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Venezuelan morning or very early afternoon, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Valencia?', a: 'Limited relative to the region\'s industrial and academic depth, with the historic tier in Caracas around two hours east. Live delivery reaches Carabobo identically.' },
      { q: 'Our child is aiming at medicine — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Mathematics form the classic spine, planned backward from the target university from IGCSE onward.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'puerto-ordaz-ve',
    name: 'Puerto Ordaz & Ciudad Guayana',
    county: 'Bolívar',
    region: 'The Orinoco heavy-industry complex — iron ore, steel, aluminium and bauxite on the Guayana shield · the Guri hydroelectric project · a metallurgical engineering community · the Brazilian border corridor south',
    primaryKeyword: 'Online school and international curriculum in Puerto Ordaz',
    heroTagline: 'For Puerto Ordaz and Guayana families — iron, steel and aluminium on the Orinoco, and an engineering tradition that reads anywhere.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Ciudad Guayana families. The Orinoco industrial complex at Puerto Ordaz and San Félix was built around the Guayana shield\'s iron ore and bauxite — steel, aluminium and the Guri hydroelectric project that powers them — producing a metallurgical and industrial engineering community with few equivalents in the region, and the corridor running south toward the Brazilian border. Caracas is a long way north. We teach Cambridge and IB live to Guayana in the Venezuelan morning.',
    heroImg: '/heroes/puerto-ordaz-ve.jpg',
    altTexts: { hero: 'The Orinoco and Caroní confluence at Puerto Ordaz' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Puerto Ordaz and Ciudad Guayana families — the Orinoco heavy-industry belt. From USD 400/month.',
    challenges: [
      'A metallurgical and heavy-industry region with limited international provision.',
      'Caracas is a long way north.',
      'Cross-border households toward Brazil need to know which framework applies.',
      'We could not verify Venezuela\'s position on parental home education.',
      'Time zone: Bolívar shares VET (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'Steel, aluminium, and metallurgical engineering families.',
      'Mining, bauxite, and iron-ore sector households.',
      'Hydroelectric and power engineering families around Guri.',
      'Commercial and logistics households on the Orinoco.',
      'Students aiming at metallurgy, mining or materials engineering abroad.',
    ],
    nearbyAreas: ['Puerto Ordaz', 'San Félix', 'Ciudad Bolívar', 'Guri', 'Upata', 'El Callao', 'the southern corridor'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, Portuguese and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Further Mathematics, Geography',
      'Cambridge A-Level Biology, Economics, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Physics, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including mining and materials programmes), Common Application (US), and Spanish, Brazilian and Venezuelan university applications',
    ],
    whyChoose: [
      ['Metallurgy and materials depth', 'Cambridge A-Level Chemistry, Physics and Mathematics — the spine that mining, metallurgy and materials engineering run on, and one Guayana families aim at in numbers.'],
      ['The mining cohort across four continents', 'Guayana students sit in the same live classes as families in Antofagasta, Potosí, Kolwezi, Arequipa and the Copperbelt.'],
      ['A qualification that travels with the profession', 'Metallurgical and mining careers are international, and A-Levels are read in 160+ countries.'],
      ['Fees quoted in USD', 'Straightforward planning for a multi-year commitment.'],
      ['The complete option far from the capital', 'Identical live delivery in Puerto Ordaz and Caracas.'],
    ],
    growingReason: 'The Orinoco industrial complex at Ciudad Guayana was built around the Guayana shield\'s iron ore and bauxite — steel, aluminium and the Guri hydroelectric project — producing a metallurgical engineering community with few equivalents in the region, a long way from the capital. Venezuela runs VET (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Guayana, taught alongside a Venezuelan school enrolment and portable across international postings.',
      cbc: 'Kenya CBC available for Guayana families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Bolívar: education is governed by the Ley Orgánica de Educación of 2009, administered by the Ministerio del Poder Popular para la Educación, and compulsory. We could not verify Venezuela\'s position on parental home education against a primary instrument and decline to characterise it either way — confirm with the ministry. Smartious is not an authorised Venezuelan institution and issues no Venezuelan qualification. Households resident in Brazil follow Brazilian law, where the Supreme Federal Court has held there is no subjective right to home education and educação básica is compulsory from four to seventeen.',
    homeTuitionDetail: 'Smartious delivers to Guayana families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Venezuelan morning or very early afternoon, with every session recorded — built for industrial shift patterns.',
    faqs: [
      { q: 'Our child wants metallurgy or mining engineering — what should they take?', a: 'Cambridge A-Level Chemistry and Mathematics with Physics, planned backward from the target university from IGCSE onward, with Geography a useful fourth for geoscience routes.' },
      { q: 'Is there international schooling in Ciudad Guayana?', a: 'Limited, with the historic tier concentrated in Caracas a long way north. Live delivery reaches Guayana identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'merida-ve',
    name: 'Mérida & the Andes',
    county: 'Mérida and Táchira',
    region: 'The Andean university city and home of the Universidad de Los Andes · a long academic and research tradition · highland agriculture and coffee · the Colombian border corridor at San Cristóbal',
    primaryKeyword: 'Online school and international curriculum in Mérida Venezuela',
    heroTagline: 'For Mérida and Andean families — one of Latin America\'s notable university cities, with an academic tradition worth carrying abroad.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Mérida and Andean families. Mérida is one of Latin America\'s notable university cities — the Universidad de Los Andes has shaped it for two centuries, giving the highlands an academic and research culture that few regional cities match — alongside highland agriculture, coffee, and the corridor to the Colombian border at San Cristóbal. Academic families here aim high, and a qualification that foreign universities read directly is the practical way to carry that ambition. We teach live to the Andes in the Venezuelan morning.',
    heroImg: '/heroes/merida-ve.jpg',
    altTexts: { hero: 'Mérida and the Venezuelan Andes' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Mérida and Andean Venezuela families — a university city with international ambitions. From USD 400/month.',
    challenges: [
      'No international schooling in a region with a strong academic tradition.',
      'Caracas is a long journey or flight north-east.',
      'Cross-border households at San Cristóbal need to know which framework applies.',
      'We could not verify Venezuela\'s position on parental home education.',
      'Time zone: the Andes share VET (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'University academic, research, and medical-faculty families.',
      'Highland agriculture, coffee, and agro-business households.',
      'Professional families in the Andean cities.',
      'Cross-border households toward the Colombian frontier.',
      'Students aiming at competitive university courses abroad.',
    ],
    nearbyAreas: ['Mérida', 'Ejido', 'El Vigía', 'Tovar', 'San Cristóbal', 'Trujillo', 'the Colombian border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Geography',
      'Cambridge A-Level Economics, Business, Psychology, History',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Chemistry, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — Spanish, US, Colombian, Chilean, Portuguese and UK (UCAS) applications',
    ],
    whyChoose: [
      ['Built for academic families', 'Small live groups with subject specialists suit households that already take education seriously — which in Mérida is most of them.'],
      ['Pre-medical and science depth', 'Cambridge A-Level Biology and Chemistry with Mathematics, the spine a university city\'s students aim at.'],
      ['A qualification read directly abroad', 'Spain, the United States, Colombia, Chile, Portugal and the UK all read A-Levels and the IB natively rather than through recognition procedures.'],
      ['The complete option far from the capital', 'Identical live delivery in Mérida and Caracas.'],
      ['Fees quoted in USD', 'Straightforward planning for a multi-year commitment.'],
    ],
    growingReason: 'Mérida is one of Latin America\'s notable university cities, shaped by the Universidad de Los Andes for two centuries and giving the Venezuelan highlands an academic and research culture few regional cities match, alongside highland agriculture and the Colombian border corridor. Venezuela runs VET (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Andes, taught alongside a Venezuelan school enrolment.',
      cbc: 'Kenya CBC available for Andean families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the Andes: education is governed by the Ley Orgánica de Educación of 2009, administered by the Ministerio del Poder Popular para la Educación, and compulsory. We could not verify Venezuela\'s position on parental home education against a primary instrument and decline to characterise it either way — confirm with the ministry directly. Smartious is not an authorised Venezuelan institution and issues no Venezuelan qualification. Cross-border households resident in Colombia follow Colombian law, where the position is genuinely disputed between Colombian sources — a question for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to Andean families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Venezuelan morning or very early afternoon, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Mérida?', a: 'None — the historic tier is in Caracas, a long journey north-east. Live delivery reaches the Andes identically, with examination travel a few times a year.' },
      { q: 'Our family is academic and expects a competitive university — does that fit?', a: 'It is the profile we teach best. Small live groups with subject specialists, A-Levels chosen strictly for the target course, and a record read directly by universities in Spain, the US, Chile, Portugal and the UK.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const VENEZUELA_COUNTRY = {
  slug: 'venezuela',
  name: 'Venezuela',
  longName: 'Bolivarian Republic of Venezuela',
  adjective: 'Venezuelan',
  flag: '🇻🇪',
  hub: '/online-school/venezuela',
  hubPageId: 'homeschooling-venezuela',
  cityPageId: 'venezuela-city',

  currency: 'USD',
  currencyName: 'United States Dollar',
  currencyPeg: 'Our fees are quoted and invoiced in USD, which is widely used in Venezuela for larger commitments — so a multi-year education decision can be planned in a single stable figure.',

  timezone: {
    code: 'VET',
    name: 'Venezuela Time (UTC-4), no daylight saving',
    utcOffset: '-4',
    offsetFromEAT: '-7 hours — Venezuelan mornings and very early afternoons both land in our teaching day, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — availability is checked carefully for each family, and where a regional sitting is not practical we plan alternatives in advance'],
  examCentreTiles: [
    { city: 'Caracas', centre: 'Authorised provision', area: 'Checked first, with capacity confirmed per family per session.' },
    { city: 'The regions', centre: 'Planned per session', area: 'Maracaibo, Valencia, Guayana and Mérida families plan travel into each window well ahead.' },
    { city: 'Alternative arrangements', centre: 'Discussed per family', area: 'Where a domestic sitting is not practical, we discuss options with the family well before the entry deadline rather than at it.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Venezuela-based students sit as external candidates at authorised provision, and this is one market where we plan the examination question earlier and more carefully than most. Caracas is checked first, with regional families planning travel into each window well ahead — and where a domestic sitting is not practical for a particular series, we discuss alternatives with the family in good time rather than at the entry deadline. Families with relatives in Colombia, Panama, Spain or the United States sometimes sit there, and we help plan that properly. Note also what does not change: our arrangement runs alongside a Venezuelan school, which continues its own national track unchanged. Smartious is not an authorised Venezuelan institution and issues no Venezuelan qualification.',
  secondaryProgrammeExamRef: 'Authorised Cambridge provision, planned per family',
  finalCTABadgeExamRef: 'Examination arrangements planned individually, well ahead',

  heroImage: '/heroes/venezuela.jpg',
  heroEyebrow: 'Online school for Venezuela',
  heroH1Suffix: 'Venezuela',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for professional, energy, industrial, and Venezuelan families across Caracas, Maracaibo, Valencia, Ciudad Guayana and Mérida. Fees quoted in USD, a qualification read directly in every country your family may already have ties to, and honest about the one legal question we could not verify.',
  heroValueProp: 'From USD 180/month, quoted in USD. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — alongside your Venezuelan school.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Venezuela',

  citiesSectionTitle: 'Where our Venezuela families are',
  citiesSectionBody: 'Smartious Venezuela families concentrate across Caracas (the corporate and professional centre with a historic international tier), Maracaibo and Zulia (a century of petroleum engineering on the lake), Valencia and Carabobo (the industrial belt and Puerto Cabello), Puerto Ordaz and Ciudad Guayana (the Orinoco iron, steel and aluminium complex), and Mérida and the Andes (one of Latin America\'s notable university cities). One qualification that reads in every country, fees in a single stable currency, and a timezone that works.',

  trustSignals: [
    { h: 'A qualification that reads wherever your family is', p: 'Many Venezuelan families now have members in Spain, the United States, Colombia, Chile, Panama or Portugal. Cambridge A-Levels, the IB Diploma and AP records are read directly in all of them, rather than through recognition procedures that differ country by country.' },
    { h: 'Fees in a single stable currency', p: 'We quote and invoice in USD, which is widely used here for larger commitments — so a five-year education commitment is one figure a family can plan around.' },
    { h: 'Honest about what we could not verify', p: 'We could not establish Venezuela\'s position on parental home education from a primary instrument. Rather than guessing in either direction, we say so, note that an absence of clear regulation is not a permission, and send families to the ministry.' },
    { h: 'Examinations planned early, not assumed', p: 'This is a market where we raise the examination question at enrolment rather than in the term before the series, and where families with relatives abroad sometimes sit elsewhere. We plan it with you properly.' },
  ],

  universitiesInCountry: 'the Universidad Central de Venezuela, the Universidad de Los Andes in Mérida, the Universidad Simón Bolívar, the Universidad Católica Andrés Bello, the Universidad del Zulia and the Universidad de Carabobo — a higher-education system with a long and distinguished history in the region.',
  universityChannels: 'Venezuelan universities admit on the national bachillerato through their own processes, with foreign qualifications going through recognition procedures confirmed per institution. Outward, Venezuelan students study across an unusually wide range of countries — Spain, the United States, Colombia, Chile, Portugal, Panama and Canada are all common — which is precisely the case for holding a qualification that is read directly rather than assessed differently in each. Cambridge A-Levels, the IB Diploma and AP records are read natively or near-natively in all of those, UCAS reads A-Levels directly, and A-Levels are accepted in 160+ countries — including the petroleum, metallurgy and geoscience programmes our Zulia and Guayana families most often have in view. Smartious provides personalised university guidance across Spanish, US, Colombian, Chilean, Portuguese, Canadian, UK (UCAS) and Venezuelan destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Venezuela families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes on a fixed seven-hour offset with no seasonal drift — Venezuelan mornings and very early afternoons both work, which suits both turnos — run alongside a Venezuelan school enrolment that continues its own national track unchanged. Fees quoted in USD. Cambridge Spanish available beside the English-medium core, and every session is recorded so that a missed class is never a lost one.',
  britishCurriculumSuits: 'Venezuela families targeting the Cambridge pathway. Best fit for: (1) families whose children may study in Spain, the United States, Colombia, Chile or Portugal, (2) petroleum and metallurgical households in Zulia and Guayana whose professions are internationally mobile, (3) academic families in Mérida and the university cities, (4) Caracas and Valencia families outside the international tier\'s fees, (5) students returning mid-curriculum from another country\'s system.',
  britishCurriculumDelivery: 'Live online classes in the Venezuelan morning or very early afternoon, small groups 4-6 students, every session recorded, alongside a Venezuelan school enrolment.',
  ibDiplomaSuits: 'Venezuela families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Venezuela families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Venezuela has one of the strongest academic traditions in the region and a great many families with relatives in several countries — which makes a qualification read directly everywhere worth more here than almost anywhere we teach.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Zulia\'s petroleum engineering families, Guayana\'s metallurgical households, and every medicine-bound student in Mérida, Valencia and Caracas. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Venezuela built one of the strongest international school traditions in the region — the Colegio Internacional de Caracas, Escuela Campo Alegre, the British, French and German schools — and a national university system with a long and distinguished history. Provision is concentrated in Caracas, and outside it international options are limited relative to the industrial and academic depth of Zulia, Carabobo, Guayana and the Andes. The most common reason families come to us is not a shortage of good teaching but the need for a qualification that reads directly in whichever country their children ultimately study.',
  competitors: [
    { name: 'Colegio Internacional de Caracas, Escuela Campo Alegre', city: 'Caracas',         curriculum: 'IB and American',                       feesUsd: 'International tier',                                feesAed: 'Premium',                 rating: 4.6, capacityNote: 'Long-established and well regarded — concentrated in the capital' },
    { name: 'The British, French and German schools',          city: 'Caracas',               curriculum: 'National-system and bilingual',          feesUsd: 'International tier',                                feesAed: 'Varies',                  rating: 4.4, capacityNote: 'Heritage schools with strong traditions — capital-bound' },
    { name: 'Venezuelan private and bilingual schools',        city: 'Nationwide',            curriculum: 'National, some bilingual',              feesUsd: 'Varies widely',                                     feesAed: '—',                       rating: 4.0, capacityNote: 'A strong national tradition — bilingual is not the same as an international examination track' },
    { name: 'Zulia, Carabobo, Guayana and the Andes',          city: 'Outside Caracas',       curriculum: 'Limited international provision',       feesUsd: '—',                                                 feesAed: '—',                       rating: 0,   capacityNote: 'Petroleum, industry, metallurgy and a major university city, all thinner than their profiles suggest' },
    { name: 'US and Spanish online schools',                   city: 'Online',                curriculum: 'American or Spanish online',            feesUsd: 'Varies, often per-course',                          feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Closer on the clock or in language — families should weigh that against price, class size and live teaching' },
    { name: 'Private tuition',                                 city: 'Nationwide',            curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Widespread',              rating: 3.9, capacityNote: 'The default answer to a subject gap — usually one-to-one and unstructured across a year' },
    { name: 'Smartious Homeschool (Venezuela via online delivery)', city: 'Delivered to all Venezuela', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year',                   feesAed: 'Quoted in USD',            rating: 4.8, capacityNote: 'Every class live through A-Level + a qualification read directly in every country + fees in one stable currency + examination logistics planned early' },
  ],

  legalFrameworkIntro: 'Venezuela is one of the markets where we could not verify the central question, and we would rather open by saying so than write around it. Here is what we can establish and what follows from it.',
  legalFramework: [
    { h: 'What we can establish', p: 'Education in Venezuela is governed by the Ley Orgánica de Educación of 2009 and administered by the Ministerio del Poder Popular para la Educación. Education is compulsory, and families should confirm the current age boundaries with the ministry rather than take them from a provider\'s article. Private institutions operate with ministerial authorisation, and Smartious does not hold it — we do not operate premises in Venezuela, we do not claim Venezuelan recognition, and the qualifications we deliver carry Cambridge, Pearson Edexcel, IB or AP validity rather than a domestic one.' },
    { h: 'What we could not establish', p: 'Venezuela\'s position on parental home education. We could not verify it against a primary instrument, and we are not going to fill that gap with confident prose. We will not tell you home education is permitted in Venezuela and we will not tell you it is prohibited; both would exceed what we can evidence, and a family that plans a school year on an overconfident claim carries the cost of it. What we would add is the point we make in Panama and Guatemala: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to the ministry directly.' },
    { h: 'What we therefore build', p: 'Live Cambridge or IB teaching alongside a Venezuelan school enrolment. The school carries the compulsory-education duty and the domestic record; we teach the internationally examined track alongside it. Nothing in that arrangement depends on the unresolved question, which is exactly why it is the arrangement we build.' },
    { h: 'Why the qualification matters more here than the schooling', p: 'This is the honest heart of what we offer Venezuelan families, and it has nothing to do with the quality of Venezuelan teaching, which has a long and distinguished record. It is that a great many families now have members living in Spain, the United States, Colombia, Chile, Panama, Portugal or Canada — and a student\'s record has to work in whichever of those they end up applying from. A national qualification is assessed through recognition procedures that differ in every one of those countries. Cambridge A-Levels, the IB Diploma and AP records are read directly in all of them. For a family whose future geography is genuinely open, that is not a marginal advantage; it is the whole point.' },
    { h: 'Fees, stated simply', p: 'We quote and invoice in USD, which is widely used in Venezuela for larger commitments. USD 2,160-6,480 a year for live small-group teaching through to A-Level is one figure a family can plan a five-year commitment around, and we would rather present it that way than in a form that has to be recalculated.' },
    { h: 'Examinations, planned earlier than usual', p: 'One practical commitment specific to this market. We raise the examination question at enrolment rather than in the term before a series. Caracas provision is checked first and regional families plan travel into each window well ahead — and where a domestic sitting is not practical for a particular series, we discuss alternatives with the family in good time, including sittings arranged where relatives live in Colombia, Panama, Spain or the United States. That planning is part of what a family is buying here, and we would rather over-prepare it than assume it.' },
  ],

  whySmartious: [
    { h: 'One qualification, every destination',                          p: 'Spain, the United States, Colombia, Chile, Portugal, Canada and the UK all read Cambridge A-Levels and the IB directly. For families with ties in several countries, that is the argument.' },
    { h: 'Fees in a single stable currency',                              p: 'Quoted and invoiced in USD, so a multi-year commitment is one figure rather than a moving one.' },
    { h: 'Examination logistics planned at enrolment',                    p: 'We raise it early, plan travel into each window, and discuss alternatives well before an entry deadline rather than at one.' },
    { h: 'Honest about the question we could not verify',                 p: 'We could not establish Venezuela\'s home-education position and say so rather than guessing in either direction.' },
    { h: 'The regions served like the capital',                           p: 'Zulia\'s petroleum community, Guayana\'s metallurgy, Carabobo\'s industry and Mérida\'s university city all reached identically.' },
    { h: 'Every session recorded',                                        p: 'A missed class is never a lost one, which matters more in some households than others and costs nothing to provide.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Venezuela?', a: 'We could not verify a position from a primary Venezuelan instrument and will not guess. Education is compulsory under the Ley Orgánica de Educación of 2009 and administered by the Ministerio del Poder Popular para la Educación. An absence of clear regulation is not a permission — put the question to the ministry directly. Structured study alongside a school enrolment raises none of it.' },
    { q: 'Is Smartious an authorised Venezuelan institution?', a: 'No, and we say so plainly. We work alongside a Venezuelan school that holds authorisation, and teach Cambridge, Edexcel, IB and AP qualifications with their own international validity.' },
    { q: 'Our family has members in several countries — which qualification travels best?', a: 'Cambridge A-Levels and the IB Diploma, with AP for US-focused applications. All are read directly in Spain, the United States, Colombia, Chile, Portugal, Canada and the UK, whereas a national record is assessed through different recognition procedures in each.' },
    { q: 'How are fees handled?', a: 'Quoted and invoiced in USD, which is widely used here for larger commitments — USD 2,160-6,480 a year for live small-group teaching. One figure to plan a multi-year commitment around.' },
    { q: 'Where would our child sit examinations?', a: 'We plan this at enrolment rather than late. Caracas provision is checked first, regional families plan travel into each window ahead, and where a domestic sitting is not practical we discuss alternatives in good time — including sittings arranged where relatives live abroad.' },
    { q: 'What if our family moves country mid-programme?', a: 'The curriculum, teachers, and examination board continue unchanged. Only the address changes, and examinations are sat at authorised centres wherever the family is — this is a case we handle regularly across our coverage.' },
    { q: 'How does the timezone work?', a: 'Seven hours, fixed. Venezuelan mornings and very early afternoons both land in our teaching day, and with schools commonly running turno mañana and tarde, most students have one window genuinely free.' },
    { q: 'Which parts of Venezuela does Smartious cover?', a: 'Caracas, Maracaibo and Zulia, Valencia and Carabobo, Puerto Ordaz and Ciudad Guayana, and Mérida and the Andes have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which countries your family has ties to: in Venezuela that shapes the university plan and the examination plan together, and it belongs in the first message.',
}
