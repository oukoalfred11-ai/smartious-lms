// ═══════════════════════════════════════════════════════════════════
// NEPAL — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for academic, business, migration-connected and
// Nepali families across Kathmandu, Pokhara, Biratnagar, Chitwan
// and Butwal.
// SECOND SOUTH ASIA BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// *** TIMEZONE — THE MOST UNUSUAL IN THE WORLD ***
// Nepal runs NPT at UTC+5:45 with no seasonal clock changes. It is
// the ONLY country in the world on a 45-minute offset, and this is
// the second half-hour-style offset in our coverage after Myanmar's
// UTC+6:30. Our teaching base runs UTC+3, so Nepal is TWO HOURS AND
// FORTY-FIVE MINUTES AHEAD:
//   Nepal 16:00 = 13:15 for us
//   Nepal 18:00 = 15:15 for us
//   Nepal 20:00 = 17:15 for us
// After-school and evening classes land squarely in our teaching
// day. Mention the 45-minute offset explicitly — it is a genuinely
// distinctive detail and Nepali readers will appreciate that we got
// it right rather than rounding it to a whole hour.
//
// LEGAL POSITIONING NOTE — HEDGE FIRMLY, SOURCING IS THIN:
// - We could NOT verify Nepal's position on parental home education
//   against a primary instrument.
// - What we can state: education is administered by the MINISTRY OF
//   EDUCATION, SCIENCE AND TECHNOLOGY; basic education is
//   compulsory; the national qualifications are the SECONDARY
//   EDUCATION EXAMINATION (SEE) at the end of grade 10 and the
//   NATIONAL EXAMINATIONS BOARD (NEB) examinations at grades 11-12;
//   private and institutional schools operate under government
//   registration and oversight arrangements.
// - State the compulsory range GENERALLY. Route families to the
//   Ministry.
// - PHRASE EVERY TIME: "we could not verify", plus "confirm with the
//   Ministry of Education, Science and Technology". NEVER assert
//   permitted, NEVER assert prohibited.
// - Reuse the absence-of-regulation-is-not-permission argument.
// - Smartious is NOT a registered Nepali school; say so, and say we
//   do not teach toward the SEE or the NEB examinations.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT.
//
// *** THE DISTINCTIVE MARKET ANGLE — LABOUR MIGRATION ***
// Nepal has one of the highest rates of labour migration and
// remittance dependence in the world. A very large number of
// households have a parent or older sibling working abroad — the
// Gulf states, Malaysia, Korea, Japan, India — and remittances fund
// a great deal of private education spending. TREAT THIS WITH
// DIGNITY AND PRECISION:
// - Frame it as: families investing remittance income in education,
//   and wanting a qualification that opens routes their own
//   generation did not have. That is accurate and respectful.
// - NEVER frame it as escape, rescue, or leaving. Never imply
//   migration is a problem to be solved. Many families are proud of
//   it and it funds the very thing we are selling.
// - The honest product point: a qualification read directly by
//   universities abroad is worth more to a household already
//   connected internationally than to one that is not.
//
// MARKET NOTE: A-Level provision in Nepal is concentrated almost
// entirely in Kathmandu — Budhanilkantha, St Xavier's, Rato Bangala,
// Ullens, Kathmandu University High School and a number of A-Level
// colleges. Outside the valley it is thin to non-existent, which is
// the core geographic argument. Pokhara is the second city and
// tourism/trekking centre with a growing professional population.
// Biratnagar anchors the eastern industrial and commercial belt.
// Bharatpur/Chitwan is the central hub with medical colleges and
// Chitwan National Park. Butwal and Bhairahawa anchor the west with
// Indian border trade and Lumbini nearby. Hydropower is a major and
// growing sector nationally. Currency: NPR, pegged to the Indian
// rupee; fees quoted in USD.
// ═══════════════════════════════════════════════════════════════════

export const NEPAL_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'kathmandu-np',
    name: 'Kathmandu',
    county: 'Bagmati Province',
    region: 'The capital and the valley · essentially all of Nepal\'s A-Level provision · the diplomatic, development and professional community · competitive admission to the leading schools and colleges',
    primaryKeyword: 'Online school and international curriculum in Kathmandu',
    heroTagline: 'For Kathmandu families — A-Levels exist here, and the subject you want may still not run for four students.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Kathmandu families. The valley holds essentially all of Nepal\'s A-Level provision — Budhanilkantha, St Xavier\'s, Rato Bangala, Ullens and the A-Level colleges — alongside the diplomatic and development community and a professional population that takes education seriously. Cambridge is not new here. What a school still cannot always do is run Further Mathematics or a third science for four students, and admission to the leading institutions is competitive. Both of those are what we answer, in after-school hours that fit our teaching day.',
    heroImg: '/heroes/kathmandu-np.jpg',
    altTexts: { hero: 'Kathmandu valley' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Kathmandu families — subject specialists and no waiting list. From USD 400/month.',
    challenges: [
      'Specialist A-Level subjects often will not run for small cohorts even at the leading colleges.',
      'Admission to the strongest schools and A-Level colleges is competitive.',
      'Students arriving mid-year or changing institution have limited options.',
      'We could not verify Nepal\'s position on parental home education from a primary instrument.',
      'Time zone: Nepal runs NPT (UTC+5:45), two hours and forty-five minutes ahead of our teaching base — after-school classes work well.',
    ],
    familySituations: [
      'Students at A-Level colleges needing a subject the institution cannot run.',
      'Diplomatic, development and international-organisation families.',
      'Professional and academic households in the valley.',
      'Families with a parent or sibling working abroad, investing in an internationally read qualification.',
      'Students targeting UK, Australian, Indian, Japanese or North American universities.',
      'Households arriving mid-year with no available place.',
    ],
    nearbyAreas: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Budhanilkantha', 'Lazimpat', 'Sanepa', 'the Kathmandu valley'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Nepali and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Australian, Indian, Japanese and Nepali university applications',
    ],
    whyChoose: [
      ['The set your college cannot run', 'Further Mathematics or a third science for four students is unviable even at a good A-Level college and routine in a live group drawn from several countries.'],
      ['No waiting list', 'A child starts within a week of the assessment, which matters where admission to the leading institutions is competitive.'],
      ['After-school hours that genuinely work', 'Nepal is two hours and forty-five minutes ahead of our teaching base, so a four o\'clock class in Kathmandu is quarter past one in the afternoon for our teachers.'],
      ['A record read directly abroad', 'UCAS reads Cambridge A-Levels natively, and Australian, Japanese, Indian and North American universities read A-Levels and the IB directly.'],
      ['Honest about the legal gap', 'We could not verify Nepal\'s home-education position and say so rather than guessing in either direction.'],
    ],
    growingReason: 'The Kathmandu valley holds essentially all of Nepal\'s A-Level provision, alongside the diplomatic and development community and a professional population that takes education seriously — with competitive admission to the leading schools and colleges. Nepal runs NPT (UTC+5:45), two hours and forty-five minutes ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Kathmandu families, taught in after-school blocks alongside a school or college enrolment. Examinations at authorised centres confirmed per family per session; Nepal has established Cambridge provision concentrated in the valley.',
      cbc: 'Kenya CBC available for Kathmandu families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the valley\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Nepali education is administered by the Ministry of Education, Science and Technology, basic education is compulsory, and the national qualifications are the Secondary Education Examination at the end of grade 10 and the National Examinations Board examinations at grades 11 and 12 — families should confirm the current age boundaries with the Ministry rather than take them from a provider. Private and institutional schools operate under government registration and oversight arrangements. On parental home education we could not verify Nepal\'s position against a primary instrument, and we will not guess: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to the Ministry directly and keep the answer. Smartious is not a registered Nepali school, issues no Nepali qualification, and does not teach toward the SEE or the NEB examinations. That distinction is reasonably familiar in Kathmandu, because families here already choose between the NEB route and the A-Level route at grade 11 and understand that they lead to different certificates. Our teaching sits in the second category, alongside whichever institution a student attends.',
    homeTuitionDetail: 'Smartious delivers to Kathmandu families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Nepal runs two hours and forty-five minutes ahead of our teaching base — the only forty-five-minute offset in the world — with no seasonal changes on either side, so a four or six o\'clock class in Kathmandu sits comfortably inside our teaching day at the same time every week, with every session recorded.',
    faqs: [
      { q: 'We are at an A-Level college already — what would we gain?', a: 'Usually one subject the college cannot run for four students: Further Mathematics, a third science, or a set that clashes. If your college covers what your child needs, we will tell you so.' },
      { q: 'Do you teach the SEE or the NEB examinations?', a: 'No. We are not a registered Nepali school and issue no Nepali qualification. We teach Cambridge, Edexcel, IB and AP, which sit alongside a school record — the same distinction families here already make between the NEB and A-Level routes at grade 11.' },
      { q: 'What time are classes?', a: 'After-school works particularly well. Nepal is two hours and forty-five minutes ahead of our teaching base, so a four o\'clock class in Kathmandu is quarter past one in the afternoon for our teachers.' },
      { q: 'Is there a waiting list?', a: 'No. A child starts within a week of the assessment, which matters in a market where admission to the leading institutions is genuinely competitive.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'pokhara-np',
    name: 'Pokhara',
    county: 'Gandaki Province',
    region: 'The second city and the trekking and tourism capital · a growing professional and hospitality economy · lakes, mountains and a substantial international visitor community · almost no A-Level provision',
    primaryKeyword: 'Online school and international curriculum in Pokhara',
    heroTagline: 'For Pokhara families — the second city, and A-Levels two hundred kilometres east in the valley.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Pokhara families. Nepal\'s second city anchors the trekking and tourism economy, with a growing professional and hospitality population, a substantial international visitor community and an international airport. What it does not have is A-Level provision — that is concentrated almost entirely in the Kathmandu valley, two hundred kilometres east, which for a Pokhara family has meant sending a child away at grade 11. Live delivery supplies the teaching where the family already is, in after-school hours that fit our day.',
    heroImg: '/heroes/pokhara-np.jpg',
    altTexts: { hero: 'Pokhara and the Annapurna range' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB and AP for Pokhara families — the second city, with A-Levels concentrated in Kathmandu. From USD 400/month.',
    challenges: [
      'Almost no A-Level provision locally, with the concentration in Kathmandu two hundred kilometres east.',
      'Families who would otherwise send a child to the valley at grade 11.',
      'A seasonal tourism economy that shapes the household year.',
      'We could not verify Nepal\'s position on parental home education.',
      'Time zone: two hours and forty-five minutes ahead of our teaching base — after-school classes work well.',
    ],
    familySituations: [
      'Trekking, tourism and hospitality business families.',
      'Professional and commercial households in the growing second city.',
      'Families with a parent or sibling working abroad.',
      'Students who would otherwise relocate to Kathmandu at grade 11.',
      'Households aiming at universities abroad from outside the valley.',
    ],
    nearbyAreas: ['Pokhara', 'Lakeside', 'Sarangkot', 'Lekhnath', 'Damauli', 'Baglung', 'the Annapurna region'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Nepali and home language support',
      'Cambridge A-Level Mathematics, Biology, Chemistry, Physics, Geography',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Australian, Indian, Japanese and Nepali university applications',
    ],
    whyChoose: [
      ['No move to Kathmandu at grade 11', 'Sending a child to the valley for A-Levels has been the standard answer for Pokhara families. Live delivery supplies the teaching without the second household.'],
      ['Geography and environmental science with real local ground', 'The Annapurna region, the lakes and the tourism economy make Cambridge Geography and Biology and AP Environmental Science unusually well grounded here.'],
      ['Business and economics for a tourism city', 'Cambridge A-Level Economics, Business and Mathematics suit families running hospitality and trekking operations.'],
      ['After-school hours that genuinely work', 'A four o\'clock class in Pokhara is quarter past one in the afternoon for our teachers.'],
      ['Every session recorded', 'Which suits a household whose working year peaks with the trekking seasons.'],
    ],
    growingReason: 'Pokhara is Nepal\'s second city and the centre of its trekking and tourism economy, with a growing professional and hospitality population and an international airport — and almost no A-Level provision, that being concentrated in the Kathmandu valley two hundred kilometres east. Nepal runs NPT (UTC+5:45), two hours and forty-five minutes ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Pokhara, taught in after-school blocks alongside a school enrolment. Examination travel planned per session ahead.',
      cbc: 'Kenya CBC available for Pokhara families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Pokhara: education is administered by the Ministry of Education, Science and Technology, basic education is compulsory, and the national qualifications are the SEE at grade 10 and the NEB examinations at grades 11 and 12, with private and institutional schools operating under government registration and oversight. We could not verify Nepal\'s position on parental home education against a primary instrument and decline to read that silence in either direction — confirm with the Ministry directly. Smartious is not a registered Nepali school, issues no Nepali qualification and does not teach toward the SEE or the NEB examinations. Our arrangement is live subject teaching alongside a Nepali school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Pokhara families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school blocks, with the full recorded library built for seasonal working patterns.',
    faqs: [
      { q: 'Would our child still need to move to Kathmandu for A-Levels?', a: 'Not for the teaching. Live delivery supplies A-Level subject specialists in Pokhara identically, with examination travel a few times a year rather than a permanent move.' },
      { q: 'Our family works the trekking season — can schooling fit?', a: 'It is built for it: live classes at whatever hour suits plus a complete recorded library, so the academic year holds through the busiest months.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'biratnagar-np',
    name: 'Biratnagar & the East',
    county: 'Koshi Province',
    region: 'The eastern industrial and commercial capital · jute, textiles and manufacturing · the Indian border trade corridor · tea gardens in the eastern hills · very limited A-Level provision',
    primaryKeyword: 'Online school and international curriculum in Biratnagar',
    heroTagline: 'For Biratnagar and eastern families — Nepal\'s industrial belt, a long way from where A-Levels are taught.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Biratnagar and eastern Nepali families. The east carries the country\'s industrial and commercial belt — jute, textiles and manufacturing — alongside the Indian border trade corridor and the tea gardens of the eastern hills at Ilam. It is a substantial regional economy and A-Level provision is very limited here, with the concentration in the Kathmandu valley a long way west. Live delivery reaches the east identically, in after-school hours that land squarely in our teaching day.',
    heroImg: '/heroes/biratnagar-np.jpg',
    altTexts: { hero: 'The eastern Nepal plains' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB and AP for Biratnagar and eastern Nepal families — the industrial belt, very limited provision. From USD 400/month.',
    challenges: [
      'Very limited A-Level provision across the eastern region.',
      'Kathmandu is a long way west and its institutions are competitive.',
      'Families dispersed across the plains, the border corridor and the eastern hills.',
      'We could not verify Nepal\'s position on parental home education.',
      'Time zone: two hours and forty-five minutes ahead of our teaching base — after-school classes work well.',
    ],
    familySituations: [
      'Jute, textile and manufacturing business families.',
      'Border trade and commercial households.',
      'Tea garden and agricultural families in the eastern hills.',
      'Households with a parent or sibling working abroad.',
      'Students aiming at engineering, medicine or business abroad.',
    ],
    nearbyAreas: ['Biratnagar', 'Dharan', 'Itahari', 'Damak', 'Birtamod', 'Ilam', 'the eastern corridor'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Nepali and home language support',
      'Cambridge A-Level Mathematics, Physics, Chemistry, Biology, Economics',
      'Cambridge A-Level Business, Accounting, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Chemistry, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Australian, Indian, Japanese and Nepali university applications',
    ],
    whyChoose: [
      ['The complete option far from the valley', 'Identical live delivery in Biratnagar as in Kathmandu — no relocation and no second household at grade 11.'],
      ['Business and economics for an industrial and trading belt', 'Cambridge A-Level Economics, Business, Accounting and Mathematics suit families who have run eastern commerce for generations.'],
      ['Engineering depth alongside', 'Cambridge A-Level Physics, Mathematics and Chemistry, led by a founder with a BEd in Mathematics and Physics.'],
      ['After-school hours that genuinely work', 'A four o\'clock class here is quarter past one in the afternoon for our teachers.'],
      ['Reaches the whole eastern corridor', 'Dharan, Itahari, Damak, Birtamod and Ilam get identical live teaching.'],
    ],
    growingReason: 'The east carries Nepal\'s industrial and commercial belt — jute, textiles and manufacturing — alongside the Indian border trade corridor and the tea gardens of the eastern hills, with very limited A-Level provision and the concentration in the Kathmandu valley a long way west. Nepal runs NPT (UTC+5:45), two hours and forty-five minutes ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the east, taught in after-school blocks alongside a school enrolment. Examination travel planned per session ahead.',
      cbc: 'Kenya CBC available for eastern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the east: education is administered by the Ministry of Education, Science and Technology, basic education is compulsory, and the national qualifications are the SEE at grade 10 and the NEB examinations at grades 11 and 12. We could not verify Nepal\'s position on parental home education against a primary instrument and will not guess — confirm with the Ministry directly, noting that an absence of clear regulation is an absence of protection rather than a permission. Smartious is not a registered Nepali school and does not teach toward the SEE or the NEB examinations. Our arrangement is live subject teaching alongside a Nepali school enrolment.',
    homeTuitionDetail: 'Smartious delivers to eastern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school blocks, with every session recorded.',
    faqs: [
      { q: 'Is there A-Level provision in the east?', a: 'Very limited, with the concentration in the Kathmandu valley a long way west. Live delivery reaches Biratnagar, Dharan, Itahari and the eastern corridor identically.' },
      { q: 'Would our child need to move to Kathmandu at grade 11?', a: 'Not for the teaching. Live delivery supplies the subject specialists where the family already is, with examination travel a few times a year.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'chitwan-np',
    name: 'Chitwan & Bharatpur',
    county: 'Bagmati Province, central Nepal',
    region: 'The central hub and one of Nepal\'s fastest-growing cities · a concentration of medical colleges and health-sector institutions · Chitwan National Park and its conservation and tourism work · agriculture across the central plains',
    primaryKeyword: 'Online school and international curriculum in Chitwan and Bharatpur',
    heroTagline: 'For Chitwan and Bharatpur families — a medical city with high ambition and A-Levels still concentrated in the valley.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Chitwan and Bharatpur families. Central Nepal has grown quickly, and Bharatpur now carries an unusual concentration of medical colleges and health-sector institutions alongside Chitwan National Park with its conservation, research and tourism work, and the agriculture of the central plains. Academic ambition here runs high — medicine in particular — and A-Level provision remains concentrated in the Kathmandu valley to the north. Live delivery supplies the teaching where the family already is.',
    heroImg: '/heroes/chitwan-np.jpg',
    altTexts: { hero: 'Chitwan and the central plains' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB and AP for Chitwan and Bharatpur families — a medical city with A-Levels concentrated in Kathmandu. From USD 400/month.',
    challenges: [
      'A-Level provision remains concentrated in the Kathmandu valley to the north.',
      'High medical and scientific ambition with limited local A-Level options.',
      'A fast-growing city whose schooling has not kept pace with its institutions.',
      'We could not verify Nepal\'s position on parental home education.',
      'Time zone: two hours and forty-five minutes ahead of our teaching base — after-school classes work well.',
    ],
    familySituations: [
      'Medical college, health-sector and academic families.',
      'Conservation, research and national park sector households.',
      'Agricultural and agro-business families across the central plains.',
      'Households with a parent or sibling working abroad.',
      'Students aiming at medicine, veterinary science or environmental programmes.',
    ],
    nearbyAreas: ['Bharatpur', 'Chitwan National Park', 'Sauraha', 'Narayangarh', 'Hetauda', 'Gorkha', 'the central plains'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Nepali and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Geography',
      'Cambridge A-Level Economics, Environmental Management-track subjects, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Chemistry, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Australian, Indian, Japanese and Nepali university applications',
    ],
    whyChoose: [
      ['Pre-medical depth for a medical city', 'Cambridge A-Level Biology and Chemistry with Mathematics — the classic spine, and one Bharatpur families aim at in numbers given the city\'s medical institutions.'],
      ['Conservation and environmental science with real local ground', 'Chitwan National Park and its research work make Cambridge Biology and Geography and AP Environmental Science unusually well grounded.'],
      ['No move to the valley at grade 11', 'Live delivery supplies A-Level subject specialists in Bharatpur identically.'],
      ['After-school hours that genuinely work', 'A four o\'clock class here is quarter past one in the afternoon for our teachers.'],
      ['No waiting list', 'A child starts within a week of the assessment.'],
    ],
    growingReason: 'Central Nepal has grown quickly, and Bharatpur now carries an unusual concentration of medical colleges and health-sector institutions alongside Chitwan National Park with its conservation and tourism work and the agriculture of the central plains — with A-Level provision still concentrated in the Kathmandu valley. Nepal runs NPT (UTC+5:45), two hours and forty-five minutes ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for central Nepal, taught in after-school blocks alongside a school enrolment.',
      cbc: 'Kenya CBC available for central families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in central Nepal: education is administered by the Ministry of Education, Science and Technology, basic education is compulsory, and the national qualifications are the SEE at grade 10 and the NEB examinations at grades 11 and 12, with private and institutional schools operating under government registration and oversight. We could not verify Nepal\'s position on parental home education against a primary instrument and will not guess in either direction — confirm with the Ministry directly. Smartious is not a registered Nepali school and does not teach toward the SEE or the NEB examinations. Our arrangement is live subject teaching alongside a Nepali school enrolment, which for a medically ambitious household is usually the configuration they wanted anyway.',
    homeTuitionDetail: 'Smartious delivers to central Nepal families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school blocks, with every session recorded.',
    faqs: [
      { q: 'Our child is aiming at medicine — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Mathematics form the classic spine, planned backward from the target university from IGCSE onward. It is the most common request we receive from this city.' },
      { q: 'Is there A-Level provision in Bharatpur?', a: 'Limited, with the concentration in the Kathmandu valley to the north. Live delivery reaches central Nepal identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'butwal-np',
    name: 'Butwal, Bhairahawa & the West',
    county: 'Lumbini Province',
    region: 'The western commercial corridor and the Indian border trade route · Lumbini and its international visitor community · an international airport at Bhairahawa · agriculture and industry across the western plains · thin A-Level provision',
    primaryKeyword: 'Online school and international curriculum in Butwal and Bhairahawa',
    heroTagline: 'For Butwal, Bhairahawa and western families — a growing commercial corridor with A-Levels a long way east.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Butwal, Bhairahawa and western Nepali families. The western corridor has grown into one of the country\'s significant commercial and industrial regions, running the Indian border trade route through Bhairahawa with its international airport, alongside Lumbini and the international visitor community it draws, and the agriculture and manufacturing of the western plains. A-Level provision is thin here and Kathmandu is a long way east. Live delivery reaches the west identically, in after-school hours that fit our teaching day.',
    heroImg: '/heroes/butwal-np.jpg',
    altTexts: { hero: 'The western Nepal plains' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB and AP for Butwal, Bhairahawa and western Nepal families — a growing corridor with thin provision. From USD 400/month.',
    challenges: [
      'Thin A-Level provision across the western region.',
      'Kathmandu is a long way east and its institutions are competitive.',
      'Families spread across the border corridor and the western plains.',
      'We could not verify Nepal\'s position on parental home education.',
      'Time zone: two hours and forty-five minutes ahead of our teaching base — after-school classes work well.',
    ],
    familySituations: [
      'Border trade, transport and commercial families.',
      'Manufacturing and industrial households along the corridor.',
      'Hospitality and visitor-sector families around Lumbini.',
      'Agricultural and agro-business households across the western plains.',
      'Families with a parent or sibling working abroad.',
    ],
    nearbyAreas: ['Butwal', 'Bhairahawa', 'Lumbini', 'Tilottama', 'Palpa', 'Nepalgunj', 'the western corridor'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Nepali and home language support',
      'Cambridge A-Level Mathematics, Biology, Chemistry, Physics, Economics',
      'Cambridge A-Level Business, Accounting, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Australian, Indian, Japanese and Nepali university applications',
    ],
    whyChoose: [
      ['The complete option far from the valley', 'Identical live delivery in Butwal and Bhairahawa as in Kathmandu — no relocation at grade 11.'],
      ['Business and economics for a trade corridor', 'Cambridge A-Level Economics, Business, Accounting and Mathematics suit families running border trade and manufacturing.'],
      ['Agricultural and biological science for the plains', 'Cambridge A-Level Biology and Chemistry feed agronomy, food science and veterinary routes directly.'],
      ['After-school hours that genuinely work', 'A four o\'clock class here is quarter past one in the afternoon for our teachers.'],
      ['Reaches the whole corridor', 'Butwal, Bhairahawa, Tilottama, Palpa and Nepalgunj get identical live teaching.'],
    ],
    growingReason: 'The western corridor has grown into one of Nepal\'s significant commercial and industrial regions, running the Indian border trade route through Bhairahawa with its international airport, alongside Lumbini and the agriculture and manufacturing of the western plains — with thin A-Level provision and Kathmandu a long way east. Nepal runs NPT (UTC+5:45), two hours and forty-five minutes ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the west, taught in after-school blocks alongside a school enrolment. Examination travel planned per session ahead.',
      cbc: 'Kenya CBC available for western families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the west: education is administered by the Ministry of Education, Science and Technology, basic education is compulsory, and the national qualifications are the SEE at grade 10 and the NEB examinations at grades 11 and 12. We could not verify Nepal\'s position on parental home education against a primary instrument and will not guess — confirm with the Ministry directly. Smartious is not a registered Nepali school and does not teach toward the SEE or the NEB examinations. Our arrangement is live subject teaching alongside a Nepali school enrolment.',
    homeTuitionDetail: 'Smartious delivers to western families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school blocks, with every session recorded.',
    faqs: [
      { q: 'Is there A-Level provision in the west?', a: 'Thin, with the concentration in the Kathmandu valley a long way east. Live delivery reaches Butwal, Bhairahawa, Tilottama and the western corridor identically.' },
      { q: 'Would our child need to move east at grade 11?', a: 'Not for the teaching. Live delivery supplies the subject specialists where the family already is, with examination travel a few times a year.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const NEPAL_COUNTRY = {
  slug: 'nepal',
  name: 'Nepal',
  longName: 'Federal Democratic Republic of Nepal',
  adjective: 'Nepali',
  flag: '🇳🇵',
  hub: '/online-school/nepal',
  hubPageId: 'homeschooling-nepal',
  cityPageId: 'nepal-city',

  currency: 'NPR',
  currencyName: 'Nepalese Rupee',
  currencyPeg: 'Fees are quoted and invoiced in USD; rupee equivalents are confirmed at invoicing. The Nepalese rupee\'s long-standing link to the Indian rupee makes local planning more predictable than in many of our markets.',

  timezone: {
    code: 'NPT',
    name: 'Nepal Time (UTC+5:45), with no seasonal clock changes — the only forty-five-minute offset in the world',
    utcOffset: '+5:45',
    offsetFromEAT: 'Two hours and forty-five minutes ahead of our teaching base — so after-school classes land squarely inside our teaching day',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Nepal\'s Cambridge provision is concentrated in the Kathmandu valley through its A-Level colleges and international schools'],
  examCentreTiles: [
    { city: 'Kathmandu valley', centre: 'Authorised provision', area: 'The country\'s external-candidate capacity, confirmed per family per session.' },
    { city: 'Pokhara and Chitwan', centre: 'Planned per session', area: 'Central and western families plan travel into each window ahead.' },
    { city: 'The east and the west', centre: 'Planned well ahead', area: 'Biratnagar and Butwal families plan sittings several weeks in advance.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Nepal-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Nepal\'s Cambridge provision is concentrated in the Kathmandu valley through its A-Level colleges and international schools, which is checked first, with travel planned ahead from Pokhara, Chitwan, Biratnagar and Butwal — journeys in Nepal are longer than the map suggests, so lead time matters and we plan it at enrolment rather than in the term before a series. Note what does not change: our arrangement runs alongside a Nepali school enrolment, which continues its own track unchanged. Smartious is not a registered Nepali school, issues no Nepali qualification, and does not teach toward the SEE or the NEB examinations.',
  secondaryProgrammeExamRef: 'Authorised Nepali Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/nepal.jpg',
  heroEyebrow: 'Online school for Nepal',
  heroH1Suffix: 'Nepal',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for academic, business and Nepali families across Kathmandu, Pokhara, Biratnagar, Chitwan and Butwal. A-Level provision sits almost entirely in the valley — we reach the rest of the country, in after-school hours that land squarely in our teaching day.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — after-school, alongside your school, with no waiting list.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Nepal',

  citiesSectionTitle: 'Where our Nepal families are',
  citiesSectionBody: 'Smartious Nepal families concentrate across Kathmandu (the valley, holding essentially all of the country\'s A-Level provision, with competitive admission), Pokhara (the second city and trekking capital, two hundred kilometres from the nearest A-Level college), Biratnagar and the east (the industrial and commercial belt with very limited provision), Chitwan and Bharatpur (a fast-growing medical city with A-Levels still concentrated in the valley), and Butwal and Bhairahawa (the western trade corridor). One qualification concentrated in one valley, and a timezone that makes after-school teaching straightforward.',

  trustSignals: [
    { h: 'A-Levels reach beyond the valley', p: 'Nepal\'s A-Level provision is concentrated almost entirely in Kathmandu, which has meant families outside it sending a child away at grade 11 — a second household and a separated family. Live delivery supplies the subject teaching where the family already is.' },
    { h: 'After-school hours that genuinely work', p: 'Nepal runs UTC+5:45 — the only forty-five-minute offset in the world — two hours and forty-five minutes ahead of our teaching base. A four o\'clock class in Kathmandu is quarter past one in the afternoon for our teachers.' },
    { h: 'A record read directly abroad', p: 'UCAS reads Cambridge A-Levels natively, and Australian, Japanese, Indian, Canadian and American universities read A-Levels and the IB directly. For households already connected internationally, that is worth more than a qualification requiring conversion in each country.' },
    { h: 'Honest about what we could not verify', p: 'We could not establish Nepal\'s position on parental home education from a primary instrument. Rather than guessing, we say so, note that an absence of clear regulation is not a permission, and send families to the Ministry of Education, Science and Technology.' },
  ],

  universitiesInCountry: 'Tribhuvan University, Kathmandu University, Pokhara University, Purbanchal University and the medical institutions including the Institute of Medicine and the Bharatpur medical colleges.',
  universityChannels: 'Nepali universities admit principally on the NEB grade 12 examinations, with holders of A-Levels and other international qualifications entering through equivalence procedures administered by the relevant authority and confirmed per institution — a family intending to enter the Nepali system should confirm that route early, and note the domestic side of a record has to come from a Nepali school rather than from us. Outward, Nepali students study abroad in very large numbers: Australia, Japan, India, the United Kingdom, the United States, Canada and South Korea are all common destinations. UCAS reads Cambridge A-Levels natively; Australian, Canadian and American universities read A-Levels, the IB Diploma and AP records directly; and A-Levels are accepted in 160+ countries. For households where a parent or sibling already works internationally, a qualification that needs no conversion in each destination is worth a great deal. Smartious provides personalised university guidance across UK (UCAS), Australian, Japanese, Indian, US, Canadian and Nepali destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Nepal families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes in after-school blocks — Nepal is two hours and forty-five minutes ahead of our teaching base, so a four o\'clock class in Kathmandu is quarter past one in the afternoon for us — run alongside a Nepali school enrolment that continues its own track unchanged. Cambridge Nepali and home language support available beside the English-medium core. No waiting list.',
  britishCurriculumSuits: 'Nepal families targeting the Cambridge pathway. Best fit for: (1) families outside the Kathmandu valley where A-Level provision is thin or absent, (2) students at A-Level colleges needing a subject the institution cannot run for a small cohort, (3) households investing in a qualification read directly by universities abroad, (4) students who would otherwise relocate to the valley at grade 11, (5) medically and scientifically ambitious households in Bharatpur and the regional cities.',
  britishCurriculumDelivery: 'Live online classes in after-school blocks, small groups 4-6 students, every session recorded, alongside a Nepali school enrolment.',
  ibDiplomaSuits: 'Nepal families in the valley\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Nepal families targeting American universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Nepal concentrates almost all of its A-Level teaching in a single valley, which has meant families elsewhere sending children away at sixteen. That is exactly the kind of geographic problem live delivery was built to solve.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Biratnagar\'s industrial households and every medicine-bound student in Bharatpur and Kathmandu. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Nepal\'s A-Level provision is concentrated almost entirely in the Kathmandu valley — Budhanilkantha, St Xavier\'s, Rato Bangala, Ullens and a number of A-Level colleges — and those are serious institutions with competitive admission. Outside the valley the picture is thin to non-existent, which has meant families in Pokhara, Biratnagar, Bharatpur and Butwal sending a child to Kathmandu at grade 11. The gaps here are therefore geographic first and subject-specific second: reaching the four-fifths of the country outside the valley, and running the specialist sets that will not fill even at a good college.',
  competitors: [
    { name: 'Budhanilkantha, St Xavier\'s, Rato Bangala',       city: 'Kathmandu valley',      curriculum: 'A-Level, IB and national',              feesUsd: 'Top of the local market',                           feesAed: 'Highly competitive',      rating: 4.7, capacityNote: 'Excellent and selective — the national benchmark, and concentrated in one valley' },
    { name: 'Ullens and the international schools',             city: 'Kathmandu valley',      curriculum: 'IB and international',                  feesUsd: 'Premium tier',                                      feesAed: 'Limited places',          rating: 4.6, capacityNote: 'Strong provision, valley-bound' },
    { name: 'The A-Level colleges',                             city: 'Kathmandu valley',      curriculum: 'Cambridge A-Level',                     feesUsd: 'Mid tier',                                          feesAed: 'Widespread in the valley', rating: 4.2, capacityNote: 'A well-established route at grade 11 — and specialist sets still rarely run for small cohorts' },
    { name: 'Pokhara, Biratnagar, Bharatpur and Butwal',        city: 'Outside the valley',    curriculum: 'Thin to none',                          feesUsd: 'Limited option',                                    feesAed: '—',                       rating: 0,   capacityNote: 'A second city, an industrial belt, a medical city and a trade corridor — none with real A-Level provision' },
    { name: 'Relocation to Kathmandu at grade 11',              city: 'Nationwide practice',   curriculum: '—',                                     feesUsd: 'Cost of a second household',                        feesAed: '—',                       rating: 0,   capacityNote: 'The traditional answer for families outside the valley, and an expensive and disruptive one' },
    { name: 'Private tuition and coaching institutes',          city: 'Nationwide',            curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Widespread',              rating: 4.0, capacityNote: 'Concentrated where the teachers already are, which is where the shortage is not' },
    { name: 'Smartious Homeschool (Nepal via online delivery)', city: 'Delivered nationwide',  curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP',   feesUsd: 'USD 2,160-6,480/year',                              feesAed: 'NPR at prevailing rate',   rating: 4.8, capacityNote: 'Every class live through A-Level + the four-fifths of the country outside the valley reached + after-school hours that fit + no relocation at grade 11' },
  ],

  legalFrameworkIntro: 'Nepal is one of the markets where we could not verify the central question, so we set out what we can establish and then the fact that shapes our offer here more than the law does.',
  legalFramework: [
    { h: 'What we can establish', p: 'Education in Nepal is administered by the Ministry of Education, Science and Technology. Basic education is compulsory, and families should confirm the current age boundaries with the Ministry rather than take them from any article. The national qualifications are the Secondary Education Examination at the end of grade 10 and the National Examinations Board examinations at grades 11 and 12. Private and institutional schools operate under government registration and oversight arrangements. Smartious is not a registered Nepali school, issues no Nepali qualification, and does not teach toward the SEE or the NEB examinations.' },
    { h: 'What we could not establish', p: 'Nepal\'s position on parental home education. We could not verify it against a primary instrument and are not going to fill that gap with confident prose. We will not tell you it is permitted and we will not tell you it is prohibited; both would exceed what we can evidence. What we would add is what we say in Jordan, Iraq, Lebanon and Bangladesh: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to the Ministry directly and keep the answer.' },
    { h: 'Why the distinction is familiar here', p: 'Nepali families already choose between the NEB route and the A-Level route at grade 11, and understand that the two lead to different certificates with different recognition. So when we say our teaching sits alongside a school rather than replacing it, and that we do not teach toward the SEE or the NEB examinations, that lands as an ordinary statement rather than a complication. What we teach is the internationally examined track, and the domestic record stays with the school.' },
    { h: 'The fact that matters more: one valley', p: 'This is the honest heart of what we offer Nepal. A-Level provision here is concentrated almost entirely in the Kathmandu valley — the leading schools and the A-Level colleges are essentially all within it. For a family in Pokhara, Biratnagar, Bharatpur or Butwal, choosing the A-Level route at grade 11 has traditionally meant sending a child to Kathmandu: a second household, a separated family and a considerable cost, at sixteen. That is a heavy price for a subject teacher, and it is a geographic problem rather than an educational one. A live class of four to six students drawn from several cities and several countries removes it entirely — the child stays home and the specialist comes to them.' },
    { h: 'And within the valley, a second problem', p: 'Even in Kathmandu the subject list is not unlimited. A good A-Level college still cannot justify a specialist teacher and a room for four students who want Further Mathematics, or three who want a third science, or two who want Computer Science at A-Level. That is the same arithmetic we describe in Cyprus, Bangladesh and Uruguay, and the same answer applies: in a live group drawn across countries, four becomes a full class.' },
    { h: 'The clock, which is the most unusual in the world', p: 'Nepal runs Nepal Time at UTC+5:45 with no seasonal clock changes — the only country in the world on a forty-five-minute offset, and worth stating precisely rather than rounding. Our teaching base runs UTC+3, so Nepal is two hours and forty-five minutes ahead of us: a four o\'clock class in Kathmandu is quarter past one in the afternoon for our teachers, six o\'clock is quarter past three, and eight in the evening is quarter past five. Every one of those is an ordinary teaching hour here. Across much of our Latin American coverage an after-school arrangement is impossible and we say so plainly; in Nepal it is the natural configuration, and it works identically in Pokhara, Biratnagar or Butwal.' },
  ],

  whySmartious: [
    { h: 'A-Levels outside the valley',                                   p: 'Nepal concentrates almost all its A-Level provision in Kathmandu. We reach the four-fifths of the country that is somewhere else.' },
    { h: 'No relocation at grade 11',                                     p: 'Sending a child to the valley has been the traditional answer for families outside it — a second household and a separated family. Live delivery removes the need.' },
    { h: 'After-school hours that genuinely work',                        p: 'Two hours forty-five ahead means a four o\'clock class in Kathmandu is quarter past one in the afternoon for our teachers.' },
    { h: 'The set even a good college cannot run',                        p: 'Further Mathematics or a third science for four students is unviable at one institution and routine in a live group drawn across countries.' },
    { h: 'A record read directly abroad',                                 p: 'UCAS reads A-Levels natively and Australian, Japanese, Indian, Canadian and American universities read them directly — valuable for households already connected internationally.' },
    { h: 'Honest about the question we could not verify',                 p: 'We could not establish Nepal\'s home-education position and say so rather than guessing in either direction.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Nepal?', a: 'We could not verify a position from a primary instrument and will not guess. Basic education is compulsory and administered by the Ministry of Education, Science and Technology. An absence of clear regulation is not a permission — put the question to the Ministry directly. Structured study alongside a school enrolment raises none of it.' },
    { q: 'Do you teach the SEE or the NEB examinations?', a: 'No. We are not a registered Nepali school and issue no Nepali qualification. We teach Cambridge, Edexcel, IB and AP — the same distinction families here already make between the NEB and A-Level routes at grade 11.' },
    { q: 'Would our child still need to move to Kathmandu at grade 11?', a: 'Not for the teaching. A-Level provision is concentrated in the valley, and relocating has been the traditional answer for families elsewhere. Live delivery supplies the subject specialists where you already are, with examination travel a few times a year.' },
    { q: 'What time are classes?', a: 'After-school works particularly well. Nepal runs UTC+5:45 — the only forty-five-minute offset in the world — two hours and forty-five minutes ahead of our teaching base, so a four o\'clock class in Kathmandu is quarter past one in the afternoon for our teachers.' },
    { q: 'We are already at an A-Level college — what would we gain?', a: 'Usually a subject it cannot run for four students. If your college covers what your child needs, we will tell you so.' },
    { q: 'Will Nepali universities accept A-Levels?', a: 'Holders of A-Levels enter through equivalence procedures administered by the relevant authority and confirmed per institution. Confirm that route early if a Nepali university is the plan; the domestic side of a record has to come from a Nepali school rather than from us.' },
    { q: 'Where would our child sit examinations?', a: 'At authorised provision confirmed per family per session, concentrated in the Kathmandu valley — with travel planned ahead from Pokhara, Chitwan, Biratnagar and Butwal, since journeys here are longer than the map suggests.' },
    { q: 'Which parts of Nepal does Smartious cover?', a: 'Kathmandu, Pokhara, Biratnagar and the east, Chitwan and Bharatpur, and Butwal, Bhairahawa and the west have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us where in Nepal you are and which subjects you need: outside the Kathmandu valley the first answer usually decides everything, and we would rather plan the examination travel with you from the start.',
}
