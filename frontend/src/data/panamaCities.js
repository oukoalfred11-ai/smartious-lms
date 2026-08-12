// ═══════════════════════════════════════════════════════════════════
// PANAMA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for canal, banking, expatriate, and Panamanian
// families across Panama City, Colón, David, Bocas del Toro and the
// Pacific coast.
// EIGHTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — HEDGE HARDER HERE THAN ANYWHERE IN LATIN
// AMERICA. OUR SOURCING ON PANAMA IS THIN:
// - We could not verify Panamanian home-education law against a
//   primary source. The only indication available is secondary
//   commentary placing Panama among countries where home education
//   is NOT SPECIFICALLY REGULATED — no dedicated policy and no legal
//   framework clearly defining rights and obligations.
// - PHRASE ACCORDINGLY, EVERY TIME: "we are not aware of a specific
//   regulatory framework", "reported as not specifically regulated",
//   and ALWAYS "confirm with MEDUCA". NEVER assert that home
//   education is permitted, and NEVER assert it is prohibited. Both
//   would exceed what we can evidence.
// - What we can say with confidence: education is administered by
//   the MINISTERIO DE EDUCACIÓN (MEDUCA); educación básica general
//   is compulsory; and private schools operate with MEDUCA
//   authorisation.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT, stated more firmly
//   here precisely because the framework is unclear — where we
//   cannot evidence a route, we do not build around one.
// - Smartious is NOT a MEDUCA-authorised school and says so.
// - CONTRAST WITH ECUADOR IS INSTRUCTIVE AND WORTH DRAWING: Ecuador
//   names and regulates the modality in detail; Panama, so far as we
//   can establish, does not regulate it at all. An absence of
//   regulation is not a permission, and families should not read it
//   as one.
// TIMEZONE: EST (UTC-5), no daylight saving — EIGHT HOURS behind
// Nairobi, same as Ecuador, Colombia and Peru. Our teaching lands in
// the full day (two teaching teams in different time zones). Panamanian schools commonly run
// morning and afternoon turnos, so an afternoon-turno student has
// mornings free.
// MARKET NOTE: Panama City has an unusually deep international tier
// for a country its size — Balboa Academy, the International School
// of Panama, the Metropolitan School of Panama, King's College
// Panama, the French and German schools — driven by the canal, the
// banking and maritime sector, the multinational regional
// headquarters regime, and a very large expatriate population.
// Fees sit at the top of the Central American market. Outside the
// capital provision collapses: Colón has the free zone and the
// Atlantic ports and little else; David and Chiriquí anchor a large
// North American retiree community around Boquete; Bocas del Toro
// and the Pacific beach corridor host scattered expatriate and
// tourism households. Panama is DOLLARISED (the balboa is pegged
// 1:1 and USD circulates), so fees carry no FX exposure.
// ═══════════════════════════════════════════════════════════════════

export const PANAMA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'panama-city-pa',
    name: 'Panama City',
    county: 'Panamá Province',
    region: 'The canal, banking and maritime capital · a multinational regional-headquarters hub · an unusually deep international school tier for the country\'s size · a very large expatriate population',
    primaryKeyword: 'Online school and international curriculum in Panama City',
    heroTagline: 'For Panama City families — one of the deepest international school tiers in Central America, and the fees that come with it.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Panama City families. The capital runs the canal, the banking and maritime sector, and a multinational regional-headquarters regime that has drawn corporate families from across the Americas, Europe, and Asia — and with them an international school tier unusually deep for a country of Panama\'s size: Balboa Academy, the International School of Panama, the Metropolitan School, King\'s College Panama, the French and German schools. The fees sit at the top of the Central American market. We teach Cambridge and IB live in the Panamanian morning, alongside a school enrolment.',
    heroImg: '/heroes/panama-city-pa.jpg',
    altTexts: { hero: 'Panama City skyline and the bay' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Panama City families — the capital tier\'s curriculum at a fraction of its fees. From USD 400/month.',
    challenges: [
      'International school fees in Panama City sit at the top of the Central American market.',
      'Places at the strongest schools are competitive, and the regional-headquarters regime keeps demand high.',
      'Educación básica general is compulsory and administered by MEDUCA.',
      'We teach eight hours ahead, so our classes land in the Panamanian morning, not the afternoon.',
      'Private schools operate with MEDUCA authorisation, and Smartious is not one.',
    ],
    familySituations: [
      'Multinational regional-headquarters and corporate families.',
      'Canal, maritime, logistics, and banking households.',
      'Panamanian professional families outside the international tier\'s fees.',
      'Students in the afternoon turno whose mornings are free.',
      'Expatriate families arriving mid-curriculum from the Americas, Europe, and Asia.',
      'Students targeting US, UK, Spanish, or Panamanian universities.',
    ],
    nearbyAreas: ['Costa del Este', 'Punta Pacífica', 'Clayton and Panamá Pacífico', 'Albrook', 'Coronado corridor', 'Chorrera', 'Gamboa'],
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
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Panamanian university applications',
    ],
    whyChoose: [
      ['The tier\'s examinations at a professional family\'s budget', 'Live small-group Cambridge teaching at USD 2,160-6,480 a year against a capital tier priced at the top of Central America.'],
      ['No exchange-rate exposure', 'Panama uses the US dollar alongside the balboa, so our fees are quoted in the currency families already hold.'],
      ['Built for a regional-headquarters posting', 'Corporate families move on; the curriculum, teachers, and examination board continue unchanged to the next country.'],
      ['Morning classes that fit the afternoon turno', 'We are eight hours ahead, so our block lands in the Panamanian morning.'],
      ['What we are, stated plainly', 'Smartious is not a MEDUCA-authorised school. We work alongside one that is.'],
    ],
    growingReason: 'Panama City runs the canal, the banking and maritime sector, and a multinational regional-headquarters regime, with an international school tier unusually deep for the country\'s size and fees at the top of the Central American market. Panama runs EST (UTC-5) with no daylight saving, eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Panama City families, taught in the Panamanian morning alongside a school enrolment. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Panama City families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the city\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Panamanian education is administered by the Ministerio de Educación, MEDUCA, and educación básica general is compulsory. On home education we are going to be more cautious than on any other page in our Latin American coverage, because our sourcing is thin: we could not verify the position against a primary Panamanian instrument, and the indication available is secondary commentary placing Panama among countries where home education is not specifically regulated — no dedicated policy, and no framework clearly defining rights and obligations. We will not tell you that means it is permitted, and we will not tell you it is prohibited. Both would exceed what we can evidence, and an absence of regulation is not a permission. What we can say is that a family whose plan depends on the answer should put the question directly to MEDUCA before acting, and that our own arrangement raises none of it: structured teaching alongside a school enrolment. Smartious is not a MEDUCA-authorised school, does not operate premises in Panama, and does not issue Panamanian recognition — we teach Cambridge, Pearson Edexcel, IB and AP qualifications with their own international validity.',
    homeTuitionDetail: 'Smartious delivers to Panama City families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Panamanian morning. With a fixed eight-hour gap and no daylight saving on either side, a 07:00-10:00 Panamanian block sits in our normal late-afternoon teaching hours every week of the year, with all sessions recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Panama?', a: 'We will not give you a confident answer, because we could not verify one. Educación básica general is compulsory and administered by MEDUCA; the indication available is secondary commentary placing Panama among countries where home education is not specifically regulated. An absence of regulation is not a permission, and a family whose plan depends on this should put the question directly to MEDUCA. Structured study alongside a school enrolment raises none of it, and that is what we offer.' },
      { q: 'Is Smartious a MEDUCA-authorised school?', a: 'No, and we say so plainly. Private schools operate with MEDUCA authorisation. We work alongside a Panamanian school that holds it, and teach Cambridge, Edexcel, IB and AP qualifications.' },
      { q: 'How do the fees compare with the Panama City tier?', a: 'The capital\'s international fees sit at the top of the Central American market. Smartious runs USD 2,160-6,480 a year for live small-group teaching toward the same Cambridge examinations, quoted in the dollars Panama already uses.' },
      { q: 'What are the class times?', a: 'We are eight hours ahead, so our classes land in the Panamanian morning. For a student in the afternoon turno that is the free half of the day. After-school and morning blocks are both available, since we run two teaching teams in different time zones.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'colon-pa',
    name: 'Colón & the Atlantic',
    county: 'Colón Province',
    region: 'The Colón Free Zone — one of the largest free ports in the world · the Atlantic canal entrance and container terminals · logistics and transhipment · almost no international schooling',
    primaryKeyword: 'Online school and international curriculum in Colón',
    heroTagline: 'For Colón and Atlantic families — one of the world\'s great free ports, an hour and a half from the capital\'s schools and a world away from them.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Colón and Atlantic-side families. Colón hosts one of the largest free zones in the world, the Atlantic entrance to the canal, and container terminals handling transhipment for the whole hemisphere — an economy that trades with every continent daily, run by logistics, shipping, and commercial families. What it does not have is international schooling: for that, the capital is an hour and a half across the isthmus. Smartious teaches Cambridge and IB live in the Panamanian morning, alongside a school enrolment.',
    heroImg: '/heroes/colon-pa.jpg',
    altTexts: { hero: 'Colón and the Atlantic canal entrance' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Colón and Atlantic families — the free zone and container ports, no local provision. From USD 400/month.',
    challenges: [
      'Almost no international schooling on the Atlantic side, with the capital an hour and a half away.',
      'A free-zone and transhipment economy trading globally with schooling built for a provincial city.',
      'Educación básica general is compulsory and administered by MEDUCA.',
      'We teach eight hours ahead, so our classes land in the Panamanian morning.',
      'Time zone: Colón shares EST (UTC-5) with no daylight saving.',
    ],
    familySituations: [
      'Free-zone trading, import-export, and commercial families.',
      'Container terminal, shipping, and transhipment households.',
      'Logistics and canal-operations families on the Atlantic side.',
      'Families commuting to the capital who would rather not commute their children.',
      'Students in the afternoon turno with mornings free.',
    ],
    nearbyAreas: ['Colón', 'the Colón Free Zone', 'Cristóbal', 'Portobelo', 'Sabanitas', 'Gamboa', 'Costa Arriba'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Economics, Business, Accounting, Physics',
      'Cambridge A-Level Chemistry, Biology, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Microeconomics, AP Physics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish and Panamanian university applications',
    ],
    whyChoose: [
      ['The complete option on a side with none', 'Identical live delivery in Colón and Panama City — no crossing the isthmus twice a day.'],
      ['Economics and business depth for a free port', 'Cambridge A-Level Economics, Business, and Accounting suit the families who run one of the world\'s great trading zones.'],
      ['No exchange-rate exposure', 'Fees quoted in the dollars Panama already uses.'],
      ['Morning classes that fit the afternoon turno', 'Our block lands in the Panamanian morning.'],
      ['What we are, stated plainly', 'Not a MEDUCA-authorised school; we work alongside one.'],
    ],
    growingReason: 'Colón hosts one of the largest free zones in the world, the Atlantic entrance to the canal, and container terminals handling hemispheric transhipment — an economy trading with every continent daily, with almost no international schooling and the capital an hour and a half across the isthmus. Panama runs EST (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Atlantic side, taught in the Panamanian morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for Colón families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Colón: educación básica general is compulsory and administered by MEDUCA, and we could not verify Panama\'s position on home education against a primary instrument — the indication available is secondary commentary placing the country among those where it is not specifically regulated. We decline to characterise that as either permission or prohibition, and would tell any family whose plan depends on it to put the question to MEDUCA directly. Our arrangement is teaching alongside a school enrolment, which raises none of it. Smartious is not a MEDUCA-authorised school.',
    homeTuitionDetail: 'Smartious delivers to Colón families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Panamanian morning on a fixed eight-hour offset, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Colón?', a: 'Almost none — the tier is in Panama City, an hour and a half across the isthmus. Live online delivery reaches the Atlantic side identically.' },
      { q: 'We already commute to the capital for work — does that change things?', a: 'It usually does. Families crossing the isthmus daily rarely want to add a school run, and live delivery removes it entirely for the child.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'david-pa',
    name: 'David, Boquete & Chiriquí',
    county: 'Chiriquí Province',
    region: 'The agricultural and commercial capital of the west · Boquete\'s large North American retiree and expatriate community · coffee, cattle and highland agriculture · the Costa Rican border corridor',
    primaryKeyword: 'Online school and international curriculum in David and Boquete',
    heroTagline: 'For David, Boquete and Chiriquí families — one of Latin America\'s best-known retiree destinations, with school-age children and nowhere to send them.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Chiriquí families. David is the commercial capital of western Panama, and in the highlands above it Boquete has become one of the best-known North American retiree and expatriate destinations in Latin America — increasingly with younger families alongside the retirees, drawn by the climate, the coffee economy, and the cost of living. The border corridor to Costa Rica runs west. International schooling in the province is minimal and the capital is a flight or a long drive east. Smartious teaches live to Chiriquí in the Panamanian morning.',
    heroImg: '/heroes/david-pa.jpg',
    altTexts: { hero: 'Boquete highlands and the Chiriquí valley' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for David, Boquete and Chiriquí families — retiree and expat highlands, minimal provision. From USD 400/month.',
    challenges: [
      'A large and growing expatriate community with minimal international schooling in the province.',
      'Panama City is a flight or a long drive east.',
      'Families spread between David, the Boquete highlands, and the border corridor.',
      'Educación básica general is compulsory and administered by MEDUCA.',
      'We teach eight hours ahead, so our classes land in the Panamanian morning.',
    ],
    familySituations: [
      'North American and European expatriate households with school-age children.',
      'Coffee, agriculture, and cattle business families.',
      'Remote-work families drawn to the highlands.',
      'Cross-border trading households toward Costa Rica.',
      'Students in the afternoon turno with mornings free.',
    ],
    nearbyAreas: ['David', 'Boquete', 'Volcán', 'Bugaba', 'Puerto Armuelles', 'Cerro Punta', 'the Costa Rican border'],
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
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Panamanian university applications',
    ],
    whyChoose: [
      ['A record that travels home again', 'North American families here frequently return. Cambridge and AP records are read directly by US and Canadian universities, unlike a purely local record.'],
      ['Reaches the highlands and the border corridor', 'Boquete, Volcán, and Cerro Punta get identical live teaching without the drive into David.'],
      ['No exchange-rate exposure', 'Fees quoted in the dollars Panama already uses.'],
      ['Morning classes that fit the afternoon turno', 'Our block lands in the Panamanian morning.'],
      ['Careful where the law is unclear', 'We could not verify Panama\'s home-education position and say so rather than guessing. Our arrangement runs alongside a school enrolment.'],
    ],
    growingReason: 'David anchors western Panama\'s commercial economy and Boquete above it has become one of the best-known North American retiree and expatriate destinations in Latin America, increasingly with younger families alongside — with minimal international schooling in the province and the capital a flight or a long drive east. Panama runs EST (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Chiriquí, taught in the Panamanian morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for Chiriquí families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for the many North American families here targeting US universities.',
    },
    homeschoolDetail: 'The national picture applies in Chiriquí, and expatriate families here deserve the careful version. Educación básica general is compulsory and administered by MEDUCA. We could not verify Panama\'s position on home education against a primary instrument; the indication available is secondary commentary placing the country among those where it is not specifically regulated, with no framework clearly defining rights and obligations. That is not the same as a permission, and we decline to present it as one — a family whose plan depends on the answer should put the question directly to MEDUCA before acting. It is worth noting the contrast with Ecuador, where the ministry names and regulates the modality in detail: an absence of rules can feel like freedom and is in fact an absence of protection. Our own arrangement raises none of it: teaching alongside a school enrolment. Smartious is not a MEDUCA-authorised school. Families resident elsewhere follow their country of residence\'s framework, a status they determine with their own advisers.',
    homeTuitionDetail: 'Smartious delivers to Chiriquí families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Panamanian morning on a fixed eight-hour offset, with every session recorded — which suits households that set their own schedule.',
    faqs: [
      { q: 'We moved to Boquete and assumed we could homeschool freely — can we?', a: 'We will not tell you yes and we will not tell you no, because we could not verify it. Panama is reported as not specifically regulating home education, which is an absence of rules rather than a permission — and an absence of rules is also an absence of protection. Put the question to MEDUCA directly before you act.' },
      { q: 'We may return to the US or Canada — does that affect the choice?', a: 'It affects the qualification. Cambridge and AP records are read directly by American and Canadian universities, whereas a purely local record needs equivalence assessment. For a family who may go home, that is the practical argument.' },
      { q: 'Is there international schooling in Chiriquí?', a: 'Minimal, and the capital is a flight or a long drive east. Live delivery reaches David, Boquete, and the highlands identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'bocas-del-toro-pa',
    name: 'Bocas del Toro',
    county: 'Bocas del Toro Province',
    region: 'The Caribbean archipelago · a tourism and hospitality economy of international scale · a scattered expatriate and remote-work community across the islands · banana plantations on the mainland',
    primaryKeyword: 'Online school and international curriculum in Bocas del Toro',
    heroTagline: 'For Bocas del Toro families — an island province where the nearest international school is a flight and a boat away.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Bocas del Toro families. The archipelago runs a tourism and hospitality economy of genuinely international scale, with hotel, dive, and adventure businesses owned and staffed by families from North America, Europe, and across Latin America, alongside a scattered remote-work community and the banana plantations of the mainland province. Getting a child to an international school from here means a flight and a boat. Smartious teaches live to the islands in the Panamanian morning, with a rhythm built for a season.',
    heroImg: '/heroes/bocas-del-toro-pa.jpg',
    altTexts: { hero: 'Bocas del Toro archipelago' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Bocas del Toro families — Caribbean archipelago, no realistic school access. From USD 400/month.',
    challenges: [
      'An island province where reaching an international school means a flight and a boat.',
      'A scattered expatriate community across several islands rather than one settlement.',
      'A tourism season that shapes the household for much of the year.',
      'Educación básica general is compulsory and administered by MEDUCA.',
      'We teach eight hours ahead, so our classes land in the Panamanian morning.',
    ],
    familySituations: [
      'Hotel, dive, and adventure-tourism business families.',
      'Expatriate households settled across the archipelago.',
      'Remote-work families drawn to the islands.',
      'Banana and agricultural households on the mainland province.',
      'Students in the afternoon turno with mornings free.',
    ],
    nearbyAreas: ['Bocas Town (Isla Colón)', 'Isla Carenero', 'Bastimentos', 'Isla Solarte', 'Almirante', 'Changuinola', 'the mainland plantations'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Biology, Geography, Mathematics, Chemistry',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Panamanian university applications',
    ],
    whyChoose: [
      ['The only realistic option on an archipelago', 'Identical live delivery on Isla Colón, Bastimentos, and the mainland — no flight, no boat, no boarding.'],
      ['Marine biology and environmental science that fit the place', 'A Caribbean reef archipelago is unusually good ground for Cambridge Biology and Geography and AP Environmental Science.'],
      ['Built for a tourism season', 'Live morning classes plus unlimited recordings hold the academic year through the busiest months.'],
      ['No exchange-rate exposure', 'Fees quoted in the dollars Panama already uses.'],
      ['Careful where the law is unclear', 'We could not verify Panama\'s home-education position and say so rather than guessing.'],
    ],
    growingReason: 'The Bocas del Toro archipelago runs a tourism and hospitality economy of international scale with expatriate and remote-work households scattered across several islands, alongside the mainland banana plantations — and reaching an international school from here means a flight and a boat. Panama runs EST (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the archipelago, taught in the Panamanian morning alongside a school enrolment. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for Bocas families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Bocas del Toro: educación básica general is compulsory and administered by MEDUCA, and we could not verify Panama\'s home-education position against a primary instrument — the indication available is secondary commentary placing it among countries where the matter is not specifically regulated. We decline to characterise that as permission or prohibition, and would tell any family whose plan depends on it to ask MEDUCA directly. Our arrangement is teaching alongside a school enrolment. Smartious is not a MEDUCA-authorised school. Families resident elsewhere follow their country of residence\'s framework, which is a common question on an archipelago with this much international movement and one for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to Bocas families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Panamanian morning on a fixed eight-hour offset, with the full recorded library carrying the season and island connectivity in mind.',
    faqs: [
      { q: 'Is there any schooling option for international families here?', a: 'Not an international one — reaching a campus means a flight and a boat. Live delivery reaches the islands identically, with examination travel a few times a year.' },
      { q: 'Our family runs a hotel or dive business — can schooling fit the season?', a: 'It is built for it: live morning classes with a complete recorded library, so the academic year holds through the busiest months.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'coronado-pa',
    name: 'Coronado & the Pacific Coast',
    county: 'Panamá Oeste and Coclé',
    region: 'The Pacific beach corridor · one of Panama\'s largest expatriate residential belts · retirement, second-home and remote-work households · an hour and a half from the capital\'s schools',
    primaryKeyword: 'Online school and international curriculum in Coronado',
    heroTagline: 'For Coronado and Pacific coast families — a residential belt built for retirees, now full of households with school-age children.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families along Panama\'s Pacific coast. The corridor running west from the capital through Coronado, Gorgona, and out toward Farallón has become one of the largest expatriate residential belts in Central America — built initially around retirement and second homes, and increasingly occupied by younger remote-work households with school-age children. The capital\'s international schools are an hour and a half east on a road nobody wants to drive twice a day. Smartious teaches live to the coast in the Panamanian morning.',
    heroImg: '/heroes/coronado-pa.jpg',
    altTexts: { hero: 'The Panamanian Pacific coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Coronado and Pacific coast families — a large expat belt an hour and a half from the capital tier. From USD 400/month.',
    challenges: [
      'A large expatriate residential belt with the international tier an hour and a half east.',
      'A corridor of scattered communities rather than one town with a campus.',
      'Households arriving mid-curriculum from North America and Europe, and often moving again.',
      'Educación básica general is compulsory and administered by MEDUCA.',
      'We teach eight hours ahead, so our classes land in the Panamanian morning.',
    ],
    familySituations: [
      'Expatriate retirement, second-home, and remote-work households with children.',
      'Hospitality, property, and services business families along the corridor.',
      'Families who moved out of the capital for cost or space and lost school access.',
      'Households arriving mid-curriculum from the US, Canada, and Europe.',
      'Students in the afternoon turno with mornings free.',
    ],
    nearbyAreas: ['Coronado', 'Gorgona', 'Nueva Gorgona', 'San Carlos', 'Farallón', 'Chame', 'Penonomé'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Biology, Chemistry, Economics, Business',
      'Cambridge A-Level Physics, Geography, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP US History',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Panamanian university applications',
    ],
    whyChoose: [
      ['No daily run to the capital', 'The corridor is an hour and a half from the tier on a busy road. Live delivery removes the commute for the child entirely.'],
      ['A record that travels home again', 'North American families here often return, and Cambridge and AP records are read directly by US and Canadian universities.'],
      ['Continuity for households that move again', 'One curriculum, one teaching team, one examination board wherever the next country is.'],
      ['No exchange-rate exposure', 'Fees quoted in the dollars Panama already uses.'],
      ['Careful where the law is unclear', 'We could not verify Panama\'s home-education position and say so rather than guessing.'],
    ],
    growingReason: 'The Pacific corridor west of Panama City — Coronado, Gorgona, and out toward Farallón — has become one of the largest expatriate residential belts in Central America, built around retirement and second homes and increasingly occupied by younger remote-work households with school-age children, an hour and a half from the capital\'s international tier. Panama runs EST (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Pacific corridor, taught in the Panamanian morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for corridor families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for the many North American families here targeting US universities.',
    },
    homeschoolDetail: 'The national picture applies along the Pacific corridor: educación básica general is compulsory and administered by MEDUCA, and we could not verify Panama\'s home-education position against a primary instrument — the indication available is secondary commentary placing it among countries where the matter is not specifically regulated, which is an absence of rules rather than a permission. A family whose plan depends on the answer should ask MEDUCA directly. Our arrangement is teaching alongside a school enrolment, and Smartious is not a MEDUCA-authorised school. Households resident elsewhere follow their country of residence\'s framework, a common question in a corridor with this much international movement and one for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to Pacific corridor families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Panamanian morning on a fixed eight-hour offset, with every session recorded.',
    faqs: [
      { q: 'Is the drive into Panama City really the alternative?', a: 'For many corridor families it has been — an hour and a half each way on a busy road, twice a day. Live delivery removes it for the child entirely, with examinations sat a few times a year.' },
      { q: 'We arrived mid-curriculum from the US — what happens?', a: 'The child keeps their pathway. We run alongside a local enrolment while the transition settles, and the record stays readable by American and Canadian universities.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const PANAMA_COUNTRY = {
  slug: 'panama',
  name: 'Panama',
  longName: 'Republic of Panama',
  adjective: 'Panamanian',
  flag: '🇵🇦',
  hub: '/online-school/panama',
  hubPageId: 'homeschooling-panama',
  cityPageId: 'panama-city-page',

  currency: 'USD',
  currencyName: 'US Dollar (alongside the balboa, pegged 1:1)',
  currencyPeg: 'Panama uses the US dollar alongside the balboa at parity, so our fees are quoted and invoiced in the currency families already hold — no exchange-rate exposure.',

  timezone: {
    code: 'EST',
    name: 'Eastern Standard Time (UTC-5), no daylight saving',
    utcOffset: '-5',
    offsetFromEAT: '-8 hours — our teaching lands in the Panamanian morning, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Panama has established Cambridge provision through its international school sector'],
  examCentreTiles: [
    { city: 'Panama City', centre: 'Authorised provision', area: 'The country\'s external-candidate capacity, confirmed per family per session.' },
    { city: 'Colón and the corridor', centre: 'Planned per session', area: 'Atlantic-side and Pacific-corridor families plan travel into each window ahead.' },
    { city: 'Chiriquí and Bocas', centre: 'Planned well ahead', area: 'Western and island families plan sittings with flights or long drives scheduled several weeks in advance.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Panama-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — Panama City is checked first, with travel planned ahead from Colón, the Pacific corridor, Chiriquí, and Bocas del Toro. Panama is geographically compact on the isthmus and awkward at its edges, so the island and western families plan sittings several weeks in advance. Note what does not change: our arrangement runs alongside a Panamanian school, which continues its own national track unchanged. Smartious is not a MEDUCA-authorised school, and the qualifications we teach carry Cambridge, Pearson Edexcel, IB, or AP validity rather than Panamanian official recognition.',
  secondaryProgrammeExamRef: 'Authorised Panamanian Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/panama.jpg',
  heroEyebrow: 'Online school for Panama',
  heroH1Suffix: 'Panama',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for canal, banking, expatriate, and Panamanian families across Panama City, Colón, David and Boquete, Bocas del Toro, and the Pacific coast. Educación básica general is compulsory and administered by MEDUCA; on home education we could not verify a position and say so rather than guessing. Fees in USD, because Panama already uses it.',
  heroValueProp: 'From USD 180/month, quoted in the currency you already hold. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — morning teaching, alongside your school.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Panama',

  citiesSectionTitle: 'Where our Panama families are',
  citiesSectionBody: 'Smartious Panama families concentrate across Panama City (the canal, banking and maritime capital with an international tier unusually deep for the country\'s size and fees to match), Colón and the Atlantic (one of the world\'s great free ports and container hubs, with almost no local provision), David, Boquete and Chiriquí (one of Latin America\'s best-known expatriate and retiree regions, now with school-age children), Bocas del Toro (an archipelago where reaching a campus means a flight and a boat), and Coronado and the Pacific coast (a large expatriate residential belt an hour and a half from the capital tier). One compulsory framework, one unverified question we decline to guess at, and a morning teaching window.',

  trustSignals: [
    { h: 'Dollarised, so no exchange-rate exposure', p: 'Panama uses the US dollar alongside the balboa at parity, and our fees are quoted and invoiced in USD. For a Panamanian family that removes the currency question entirely.' },
    { h: 'We say when we cannot verify something', p: 'We could not establish Panama\'s home-education position from a primary instrument. Rather than guessing in either direction, we report what the available commentary indicates, note that an absence of regulation is not a permission, and send families to MEDUCA.' },
    { h: 'Morning teaching, and why it fits Panama', p: 'We are eight hours ahead, so our classes land in the Panamanian morning. Schools commonly run morning and afternoon turnos — and for an afternoon-turno student, our block is precisely the free half of the day.' },
    { h: 'What we are, stated plainly', p: 'Private schools in Panama operate with MEDUCA authorisation. Smartious is not a MEDUCA-authorised school and does not present itself as one — we work alongside one that is.' },
  ],

  universitiesInCountry: 'Universidad de Panamá, Universidad Tecnológica de Panamá, Universidad Santa María La Antigua, Florida State University Panama and other international branch campuses — Panama has positioned itself as a regional education and services hub.',
  universityChannels: 'Panamanian universities admit on the national secondary certificate through their own processes, with foreign qualifications going through recognition procedures confirmed per institution. Panama\'s branch-campus sector, including US institutions operating locally, reads Cambridge, IB and AP records more directly. Outward, Panamanian and expatriate students here are overwhelmingly oriented toward the United States — reinforced by dollarisation, the canal economy\'s American ties, and the size of the North American community — with Spain and Canada following, and all of them read Cambridge A-Levels, the IB Diploma and AP records directly. UCAS reads A-Levels natively, and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across US, Canadian, Spanish, UK (UCAS), and Panamanian destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Panama families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes in the Panamanian morning on a fixed eight-hour offset with no seasonal drift — which fits students in the afternoon turno and full-time learners — run alongside a Panamanian school enrolment that continues its own national track unchanged. Fees quoted in USD, the currency Panama already uses. Examinations at authorised provision confirmed per session.',
  britishCurriculumSuits: 'Panama families targeting the Cambridge pathway. Best fit for: (1) expatriate households in Boquete, Bocas del Toro, and the Pacific corridor with no realistic campus access, (2) Colón and Atlantic-side families an hour and a half from the tier, (3) Panama City families outside the international tier\'s fees, (4) multinational regional-headquarters households whose postings move on, (5) students in the afternoon turno whose mornings are free.',
  britishCurriculumDelivery: 'Live online classes in the Panamanian morning, small groups 4-6 students, every session recorded, alongside a Panamanian school enrolment.',
  ibDiplomaSuits: 'Panama families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Panama families targeting US universities via Common Application — the dominant overseas destination, reinforced by dollarisation and the size of the North American community.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Panama is the market where we have had to be most explicit about the limits of what we know — we could not verify the home-education position from a primary source, and we would rather say that than invent an answer.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the canal and maritime sector\'s engineering households and every medicine-bound student in the capital. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Panama City has an international school tier unusually deep for a country of four and a half million — Balboa Academy, the International School of Panama, the Metropolitan School, King\'s College Panama, the French and German schools — driven by the canal, the banking sector, the regional-headquarters regime, and a very large expatriate population. Those schools are good and their fees sit at the top of the Central American market. Outside the capital the picture collapses almost completely: Colón, Chiriquí, Bocas del Toro, and the Pacific corridor together hold a substantial share of Panama\'s international residents and almost none of its international schooling.',
  competitors: [
    { name: 'Balboa Academy, International School of Panama, Metropolitan School', city: 'Panama City', curriculum: 'American, IB and British',      feesUsd: 'Top of the Central American market',                feesAed: 'Premium tier',            rating: 4.7, capacityNote: 'Deep provision for a country this size — and priced accordingly' },
    { name: 'King\'s College Panama and the British-curriculum sector', city: 'Panama City',      curriculum: 'British / IGCSE and A-Level',           feesUsd: 'Premium tier',                                      feesAed: 'Competitive places',      rating: 4.5, capacityNote: 'The closest local comparison to our track — capital-bound' },
    { name: 'The French and German schools',                   city: 'Panama City',           curriculum: 'National-system bilingual',              feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.4, capacityNote: 'Strong heritage schools — a different route entirely' },
    { name: 'Chiriquí and Boquete',                            city: 'Western Panama',        curriculum: 'Minimal',                               feesUsd: 'Little international option',                       feesAed: '—',                       rating: 0,   capacityNote: 'One of Latin America\'s best-known expatriate regions, with almost no international schooling' },
    { name: 'Bocas del Toro and the Pacific corridor',         city: 'Islands and coast',     curriculum: '—',                                     feesUsd: 'No realistic campus access',                        feesAed: '—',                       rating: 0,   capacityNote: 'An archipelago and a large residential belt, both outside the school map' },
    { name: 'US-based online schools',                         city: 'Online',                curriculum: 'American online',                       feesUsd: 'Varies, often per-course',                          feesAed: 'Varies',                  rating: 4.3, capacityNote: 'Much closer to Panama on the clock and culturally familiar to the large US community — families should weigh that honestly against price and class size' },
    { name: 'Smartious Homeschool (Panama via online delivery)', city: 'Delivered to all Panama', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year',                            feesAed: 'Quoted in USD — no FX exposure', rating: 4.8, capacityNote: 'Every class live through A-Level + Chiriquí, Bocas and the corridor reached + honest that we could not verify the home-education position and will not guess' },
  ],

  legalFrameworkIntro: 'Panama is the country in our Latin American coverage where we know the least, and we would rather open by saying so than write around it. Here is what we can establish, what we cannot, and what follows.',
  legalFramework: [
    { h: 'What we can establish', p: 'Education in Panama is administered by the Ministerio de Educación, MEDUCA. Educación básica general is compulsory. Private schools operate with MEDUCA authorisation, and Smartious does not hold it — we do not operate premises in Panama, we do not claim Panamanian recognition, and the qualifications we deliver carry Cambridge, Pearson Edexcel, IB, or AP validity rather than a Panamanian one.' },
    { h: 'What we could not establish, stated plainly', p: 'We could not verify Panama\'s position on parental home education against a primary Panamanian instrument. The indication available to us is secondary commentary placing Panama among countries where home education is not specifically regulated — no dedicated policy, and no framework clearly defining the rights and obligations of families who choose it. We are not going to build a page on that. We will not tell you home education is permitted in Panama, and we will not tell you it is prohibited; both would exceed what we can evidence, and a family that acts on an overconfident claim in either direction pays for it rather than we do.' },
    { h: 'Why an absence of rules is not a permission', p: 'It is worth drawing the contrast with Ecuador, which we also serve. There, the ministry names educación en casa as a modality, regulates it by acuerdo, sets conditions, and provides an accreditation route — and families who ignored the conditions have faced child-protection proceedings. A regulated route is a demanding thing, but it is also a protection: a family knows what compliance looks like. Where a matter is simply unregulated, there is no compliance to demonstrate and no framework to rely on if the question is ever raised. That is a weaker position for a family, not a stronger one, and it is why we would send any Panamanian household planning around this to MEDUCA before acting rather than after.' },
    { h: 'What we therefore offer', p: 'Structured teaching alongside a school enrolment, throughout, and stated more firmly here than almost anywhere in our coverage precisely because the framework is unclear. The school carries the compulsory-education duty and the daily routine; Smartious teaches the Cambridge or IB track live in a Panamanian morning block toward external examinations. Nothing in that arrangement depends on the unresolved question, which is exactly why it is the arrangement we build.' },
    { h: 'The timezone, and the school day that makes it work', p: 'We teach from Nairobi at UTC+3 and Panama runs EST at UTC-5 with no daylight saving, so the gap is a fixed eight hours — the same as Ecuador, Colombia and Peru. Our teaching lands in the Panamanian morning, which means Both after-school and morning blocks are available, since we run two teaching teams in different time zones. What makes it workable is the Panamanian school day: schools commonly run morning and afternoon turnos, so a student on the afternoon turno has mornings entirely free. Families whose child is on the morning turno should talk to us before enrolling so we can be realistic about which subjects and days are possible.' },
    { h: 'Dollarisation, and where qualifications lead', p: 'One practical advantage worth stating. Panama uses the US dollar alongside the balboa at parity, so our fees are quoted and invoiced in the currency families already hold — no exchange-rate exposure at all, which is unusual across our coverage and shared here only with Ecuador. As to destinations, Panamanian and expatriate students are overwhelmingly oriented toward the United States, reinforced by dollarisation, the canal economy\'s American ties, and the size of the North American community; Spain and Canada follow. All read Cambridge A-Levels, the IB Diploma, and AP records directly, UCAS reads A-Levels natively, and Panama\'s branch-campus sector reads them more directly than a purely local record.' },
  ],

  whySmartious: [
    { h: 'We say when we cannot verify something',                        p: 'Panama\'s home-education position could not be established from a primary source. We report that, decline to guess in either direction, and send families to MEDUCA.' },
    { h: 'An absence of rules explained as a risk, not a freedom',        p: 'Where a matter is unregulated there is no compliance to demonstrate and no framework to rely on. We draw the contrast with Ecuador rather than letting families read silence as permission.' },
    { h: 'No exchange-rate exposure',                                     p: 'Panama uses the dollar and our fees are in USD — one of only two markets in our coverage where a family faces no currency question.' },
    { h: 'Chiriquí, Bocas and the corridor reached',                      p: 'A substantial share of Panama\'s international residents live where there is no international schooling at all. Live delivery reaches all of it.' },
    { h: 'Morning teaching that fits the afternoon turno',                p: 'Eight hours ahead means our classes land in the Panamanian morning — the free half of the day for afternoon-turno students.' },
    { h: 'Honest that US providers are closer on the clock',              p: 'For a country this American-oriented, a US online school is nearer in time zone and culture. Families should weigh that against price and class size, and we say so.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Panama?', a: 'We could not verify a position from a primary Panamanian instrument, and we will not guess. Educación básica general is compulsory and administered by MEDUCA; the indication available is secondary commentary placing Panama among countries where home education is not specifically regulated. That is an absence of rules rather than a permission — and an absence of rules is also an absence of protection. Put the question directly to MEDUCA before acting.' },
    { q: 'Why does Ecuador get a clearer answer than Panama on your site?', a: 'Because Ecuador\'s ministry names and regulates the modality in detail and Panama, so far as we can establish, does not address it. We would rather show that difference than flatten both into a confident sentence.' },
    { q: 'Is Smartious a MEDUCA-authorised school?', a: 'No, and we say so plainly. Private schools operate with MEDUCA authorisation. We work alongside a Panamanian school that holds it, and teach Cambridge, Edexcel, IB and AP qualifications.' },
    { q: 'How do fees work given dollarisation?', a: 'Panama uses the US dollar alongside the balboa at parity, so our fees are quoted and invoiced in the currency you already hold — USD 2,160-6,480 a year, with no exchange-rate exposure.' },
    { q: 'Eight hours behind — how does the timetable work?', a: 'Our classes land in the Panamanian morning, not the afternoon. For students on the afternoon turno that is the free half of the day; for full-time learners mornings are natural anyway. It does not work after school, and morning-turno families should talk to us before enrolling.' },
    { q: 'We live in Boquete, Bocas, or along the Pacific corridor — is there anything local?', a: 'Almost nothing. A substantial share of Panama\'s international residents live outside the capital and the international tier does not follow them. Live delivery reaches all of it identically.' },
    { q: 'Would a US online school suit us better?', a: 'Possibly, and we would rather raise it than have you discover it. A US provider is closer on the clock and culturally familiar to Panama\'s large American community. What we offer against that is price, live groups of four to six, and Cambridge and IB alongside the American route.' },
    { q: 'Which parts of Panama does Smartious cover?', a: 'Panama City, Colón and the Atlantic, David, Boquete and Chiriquí, Bocas del Toro, and Coronado and the Pacific coast have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us where in Panama you are and whether your child is on the morning or afternoon turno: the first decides how far you are from any campus, the second decides whether our timetable fits yours.',
}
