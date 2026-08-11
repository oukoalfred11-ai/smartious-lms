// ═══════════════════════════════════════════════════════════════════
// BOSNIA AND HERZEGOVINA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for expat, diaspora, industrial, and Bosnian
// families across Sarajevo, Banja Luka, Mostar, Tuzla, Zenica and
// Brčko District.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent, the component's onError handler hides the image and the
// ink→crimson gradient shows instead. Do NOT paste in guessed
// stock-photo IDs — an unverified ID either 404s or renders a photo
// of the wrong place, and both are worse than the gradient.
//
// LEGAL POSITIONING NOTE — READ BEFORE EDITING. TWO HARD RULES:
// 1. FRAGMENTATION IS THE DEFINING FEATURE, AND IT COMES FIRST.
//    The Framework Law on Primary and Secondary Education in Bosnia
//    and Herzegovina (Official Gazette of BiH 18/03) sets the
//    principles, but the COMPETENT EDUCATION AUTHORITIES are, in the
//    Framework Law's own words, the bodies responsible for organising
//    the education system in BRČKO DISTRICT, REPUBLIKA SRPSKA, the
//    FEDERATION OF BiH, AND THE CANTONS — and all entity, cantonal
//    and Brčko laws must be harmonised with the Framework Law. In
//    the Federation, education policy — including adopting education
//    regulations and ensuring provision — is an EXCLUSIVE CANTONAL
//    competence. Practically that means a family's rules depend on
//    which of the ten cantons, which entity, or the district they
//    live in. ALWAYS tell families to confirm with the competent
//    education authority for their own canton, entity, or district.
//    This is the Switzerland pattern applied to a stricter baseline —
//    draw that comparison, it helps readers orient.
// 2. THE BASELINE IS STRICT. Nine-year primary education is
//    compulsory (roughly ages six to fifteen), and PARENTAL-CHOICE
//    HOMESCHOOLING IS NOT ESTABLISHED in BiH law at any level we can
//    identify. Say so plainly. Where laws provide for teaching at
//    home it follows the regional pattern — a school- or
//    authority-organised measure for children who cannot attend, on
//    health grounds. State that factually only; never position it.
//    Because of rule 1, phrase the negative carefully: "not
//    established" rather than "banned in all fourteen jurisdictions",
//    and always route families to their own authority.
// SO: SUPPLEMENTARY IS THE DEFAULT — the school enrolment carries
// the obligation, Cambridge or IB runs live alongside in the
// after-school slot. Full-time Smartious is for the post-compulsory
// phase and for non-resident families.
// THE WINDOW — HEDGE IT PROPERLY: secondary education is generally
// not compulsory in BiH, so the A-Level years generally fall outside
// the obligation. But because competence sits with entities and
// cantons, DO NOT assert this as uniform: say "generally not
// compulsory" and send families to their competent authority. Do not
// give this the prominence the Croatia/Albania pages give their
// windows.
// LANGUAGE NOTE — HANDLE WITH CARE AND RESPECT: teaching is
// delivered in the official languages — Bosnian, Croatian, Serbian —
// in both Latin and Cyrillic script, with minority-language
// provision. Treat this as the ordinary feature of the system that
// it is. NEVER editorialise on ethnic politics, the constitutional
// structure, the war, or schooling disputes. Mention language only
// where practically useful to a family choosing subjects.
// MARKET NOTE: the international tier is thin and Sarajevo-weighted
// — the International School of Sarajevo, QSI, and Richmond Park /
// Sarajevo College among the private international-leaning schools.
// MOSTAR IS THE EXCEPTION AND MUST BE CREDITED GENEROUSLY: United
// World College Mostar runs the IB Diploma and is one of the most
// respected schools in the region, admitting selectively and
// internationally. We do not position against it — we serve the
// families around it. Economy: ArcelorMittal steel at Zenica, the
// Tuzla salt-and-chemical and power belt, Banja Luka's
// administration and services, Sarajevo's IT and BPO growth, Mostar
// and Trebinje tourism, aluminium and hydropower, and one of
// Europe's largest diasporas relative to population (Germany,
// Austria, Croatia, Sweden, Switzerland, US) with real return flow.
// TIMEZONE: CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind
// Nairobi EAT, the standard European framing.
// ═══════════════════════════════════════════════════════════════════

export const BOSNIA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'sarajevo-ba',
    name: 'Sarajevo',
    county: 'Sarajevo Canton',
    region: 'Capital · a growing IT and outsourcing sector · the diplomatic and international-organisation community · what international schooling the country has',
    primaryKeyword: 'Online school and international curriculum in Sarajevo',
    heroTagline: 'For Sarajevo families — live Cambridge delivery in a country where the rules depend on which canton you live in, and we tell you so first.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Sarajevo families. Sarajevo holds Bosnia and Herzegovina\'s diplomatic and international-organisation community, a technology and outsourcing sector that has grown steadily and pulled diaspora talent home, and most of what international schooling the country has — the International School of Sarajevo, QSI, and the private international-leaning schools around them. Bosnian education law is unusual and families deserve the structure first: a state Framework Law sets the principles, but the rules that actually govern your child are made by your canton, your entity, or Brčko District. Nine-year primary education is compulsory, parental-choice homeschooling is not established, and our clean default is supplementary — your enrolment carries the obligation while we teach the international track live alongside it.',
    heroImg: '/heroes/sarajevo-ba.jpg',
    altTexts: { hero: 'Sarajevo old town and the surrounding hills' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Sarajevo families — supplementary beside your enrolment, with the cantonal framework explained. From USD 400/month.',
    challenges: [
      'Nine-year primary education is compulsory and parental-choice homeschooling is not established in Bosnian law.',
      'Education competence sits with the cantons, the entities, and Brčko District — so the detail depends on where you live, and must be confirmed with your own authority.',
      'The international tier is small and concentrated in the capital, with limited places at the strongest entry points.',
      'Returning diaspora children arrive mid-stream from German, Austrian, Croatian, Swedish, or Swiss systems with no matching route locally.',
      'Time zone: Bosnia and Herzegovina runs CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT, so live teaching lands inside the school day.',
    ],
    familySituations: [
      'Diplomatic, international-organisation, and development-sector families.',
      'IT, outsourcing, and technology families in the capital\'s growing sector.',
      'Returning diaspora families from Germany, Austria, Croatia, Sweden, and the US.',
      'Families outside the international tier\'s fees or capacity, supplementing a local enrolment.',
      'Students building a UCAS or Common Application record alongside the national pathway.',
      'Students past the compulsory phase running the full A-Level years.',
    ],
    nearbyAreas: ['Centar and Baščaršija', 'Novo Sarajevo', 'Ilidža', 'Vogošća', 'Hadžići', 'East Sarajevo', 'Pale'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Turkish, Arabic and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Bosnian, Croatian, Austrian, German and wider EU university applications',
    ],
    whyChoose: [
      ['The structure explained before anything is sold', 'A state Framework Law, two entities, ten cantons, and a district — the rules that govern your child depend on where you live, and we say so rather than describing a country-wide position that does not exist.'],
      ['The Cambridge track beside a small tier', 'Live small-group teaching at USD 2,160-6,480 a year — the supplement, the bridge while a place is found, or the alternative for families outside the capital tier.'],
      ['Built for the diaspora return', 'A child arriving mid-stream from Germany, Austria, or Sweden keeps one internationally examined pathway instead of restarting inside a new system.'],
      ['Computing depth for a growing sector', 'Cambridge A-Level Computer Science, Mathematics, and Further Mathematics — led by a founder with a BEd in Mathematics and Physics — suit the capital\'s technology households.'],
      ['Timezone that lands in the school day', 'Sarajevo is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Sarajevo holds Bosnia and Herzegovina\'s diplomatic and international-organisation community, a growing technology and outsourcing sector, and most of the country\'s international schooling — inside an education system where the governing rules are made by the canton, the entity, or the district rather than the state. Bosnia and Herzegovina runs CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Sarajevo families, run supplementary alongside a school enrolment. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Sarajevo families with East African ties.',
      ib: 'IB Diploma Programme — supplements and support alongside the country\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Bosnia and Herzegovina requires two explanations rather than one, and the structural point comes first. The Framework Law on Primary and Secondary Education in Bosnia and Herzegovina sets the principles the whole country works to, but it names the competent education authorities as the bodies responsible for organising education in Brčko District, Republika Srpska, the Federation of BiH, and the cantons — and in the Federation, education policy, including adopting regulations and ensuring provision, is an exclusive cantonal competence. So there is no single national answer to give a family: the rules that govern your child are made where you live, and they must be confirmed with the competent education authority for your canton, entity, or district. What we can say at the level of the framework is that nine-year primary education is compulsory, roughly from six to fifteen, and that parental-choice homeschooling is not established in Bosnian law. Where laws provide for teaching at home, it follows the regional pattern — a school- or authority-organised measure for children who cannot attend, on health grounds — and we state that factually rather than as a pathway. Our clean default is therefore supplementary: the school enrolment carries the obligation entirely, and the Cambridge or IB track runs live alongside it. Secondary education is generally not compulsory, so the A-Level years generally fall outside the obligation — but given how competence is distributed, that is worth confirming locally rather than assumed.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation for Sarajevo families during examination preparation periods, subject to associate teacher availability.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes land inside the Sarajevo school day given the 1-2 hour offset — the after-school slot for supplementary students — with every session recorded for unlimited rewatch.',
    faqs: [
      { q: 'Is homeschooling legal in Bosnia and Herzegovina?', a: 'Parental-choice homeschooling is not established in Bosnian law, and nine-year primary education is compulsory. The important structural point is that education competence sits with the cantons, the entities, and Brčko District rather than the state — so the detail that governs your child is set where you live and should be confirmed with your competent education authority.' },
      { q: 'Why does the answer depend on where we live?', a: 'The state Framework Law sets principles, but it names the competent education authorities as Brčko District, Republika Srpska, the Federation, and the cantons — and in the Federation, education policy is an exclusive cantonal competence. It is the Swiss pattern applied to a stricter baseline: one country, many rulebooks.' },
      { q: 'So how does Smartious work here?', a: 'Supplementary. Your child stays enrolled at their school, which carries the legal obligation, and takes Cambridge or IB subjects with us live in the after-school slot — building toward external examinations at authorised centres.' },
      { q: 'How does Smartious compare with the International School of Sarajevo or QSI?', a: 'They are established campuses with in-person culture and a local peer group we cannot replicate. Smartious runs live small-group teaching at USD 2,160-6,480 a year — the supplement beside a campus or a national school, and the only complete option outside the capital.' },
      { q: 'Where do Sarajevo students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with regional options where local capacity is limited.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'banja-luka-ba',
    name: 'Banja Luka',
    county: 'Republika Srpska',
    region: 'The second city and Republika Srpska\'s administrative centre · banking, administration and a growing IT sector · the University of Banja Luka · a different education authority from the Federation',
    primaryKeyword: 'Online school and international curriculum in Banja Luka',
    heroTagline: 'For Banja Luka families — the second city, under a different education authority from Sarajevo, and with no international school of its own.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Banja Luka families. Banja Luka is Bosnia and Herzegovina\'s second city and Republika Srpska\'s administrative centre — banking, public administration, a university with a substantial student population, and a technology sector that has grown quickly and works largely for clients in Austria, Germany, and Scandinavia. Zagreb is under three hours west and Belgrade around four east, which shapes where families look. What the city does not have is an international school. It also sits under its own education authority, distinct from the cantons of the Federation, which is the first thing any honest guide should mention. Smartious delivers the international pathways live — supplementary alongside your school enrolment.',
    heroImg: '/heroes/banja-luka-ba.jpg',
    altTexts: { hero: 'Banja Luka and the Vrbas river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Banja Luka families — second city, own education authority, no international school. From USD 400/month.',
    challenges: [
      'No international school in the second city, with Sarajevo around three hours away.',
      'Education rules here are set by a different competent authority from the Federation\'s cantons — confirm your position locally.',
      'A technology sector working for Austrian, German, and Scandinavian clients, with no matching English-medium schooling.',
      'Returning diaspora children arrive mid-curriculum from German, Austrian, and Swedish systems.',
      'Time zone: Banja Luka shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'IT and outsourcing families working for Austrian, German, and Scandinavian clients.',
      'Banking, administration, and professional families in the regional centre.',
      'University of Banja Luka academic and research families.',
      'Returning diaspora families from Germany, Austria, Sweden, and Switzerland.',
      'Students preparing for universities in Croatia, Serbia, Austria, or further afield.',
    ],
    nearbyAreas: ['Banja Luka', 'Laktaši', 'Gradiška', 'Prijedor', 'Prnjavor', 'Doboj', 'the Croatian border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Russian and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Bosnian, Serbian, Croatian, Austrian and German university applications',
    ],
    whyChoose: [
      ['The complete option three hours from the tier', 'Identical live delivery in Banja Luka and Sarajevo — no relocation, no boarding decision.'],
      ['Computing depth for an export IT sector', 'Cambridge A-Level Computer Science, Mathematics, and Further Mathematics suit a sector that already works in English for foreign clients.'],
      ['Your own authority, named properly', 'Education rules here are set separately from the Federation\'s cantons; we say so and point families to the right place rather than describing a national position that does not exist.'],
      ['Built for the diaspora return', 'A child coming back mid-curriculum from Germany, Austria, or Sweden keeps one internationally examined pathway.'],
      ['Timezone that lands in the school day', 'Banja Luka is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Banja Luka is Bosnia and Herzegovina\'s second city and Republika Srpska\'s administrative centre — banking, administration, a large university, and an IT sector working for Austrian, German, and Scandinavian clients — with its own education authority and no international school. Banja Luka shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Banja Luka and the north-west, run supplementary alongside a school enrolment. Examinations at authorised centres confirmed per session, with Croatian options practical given the border.',
      cbc: 'Kenya CBC available for Banja Luka families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The structural point matters here more than anywhere: education in Bosnia and Herzegovina is organised by the competent authorities of Brčko District, Republika Srpska, the Federation, and the Federation\'s cantons, working to the principles of the state Framework Law. Banja Luka therefore sits under a different competent authority from Sarajevo, and a family here should confirm their position with that authority rather than with guidance written for a canton. At the framework level, nine-year primary education is compulsory and parental-choice homeschooling is not established, with teaching-at-home provisions following the regional pattern as an authority-organised measure for children who cannot attend on health grounds. Our default is supplementary — the school enrolment carries the obligation while the Cambridge track runs live alongside — and secondary education is generally not compulsory, though that too is worth confirming locally.',
    homeTuitionDetail: 'In-person tuition supplementation in Banja Luka is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the Banja Luka school day on the 1-2 hour offset, with every session recorded.',
    faqs: [
      { q: 'Do the same education rules apply here as in Sarajevo?', a: 'Not necessarily. Education competence in Bosnia and Herzegovina sits with Brčko District, Republika Srpska, the Federation, and the Federation\'s cantons, all working to the state Framework Law\'s principles — so Banja Luka is governed by a different competent authority from Sarajevo, and your position should be confirmed there.' },
      { q: 'Is there an international school in Banja Luka?', a: 'No — the country\'s provision is Sarajevo-weighted, around three hours away. Live online delivery is the complete option, run supplementary alongside your school enrolment.' },
      { q: 'Where do Banja Luka students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with Croatian centres practical given the proximity of the border.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'mostar-ba',
    name: 'Mostar & Herzegovina',
    county: 'Herzegovina-Neretva Canton',
    region: 'Herzegovina\'s capital · United World College Mostar and its IB Diploma · a tourism economy of international scale · Trebinje, Čapljina and the Adriatic hinterland',
    primaryKeyword: 'Online school and international curriculum in Mostar',
    heroTagline: 'For Mostar and Herzegovina families — home to one of the region\'s most respected IB schools, and to many families who will never get a place in it.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Mostar and Herzegovina families. Mostar is unusual in Bosnia and Herzegovina for having something genuinely world-class: United World College Mostar runs the IB Diploma and is among the most respected schools in this part of Europe, admitting selectively and internationally. We are not positioning against it, and no honest provider would. But a selective two-year IB programme serves a specific cohort, and around it sits a city with an international tourism economy, a returning diaspora, and families whose children are eleven, or not selected, or need a different route. Herzegovina beyond Mostar — Trebinje, Čapljina, Široki Brijeg — has nothing at all. Smartious delivers the pathways live across the region, supplementary alongside your school enrolment.',
    heroImg: '/heroes/mostar-ba.jpg',
    altTexts: { hero: 'The Old Bridge at Mostar above the Neretva' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Mostar and Herzegovina families — beside UWC Mostar, and for the wider region with nothing. From USD 400/month.',
    challenges: [
      'The region\'s outstanding IB provision is selective and covers the final two years only — the earlier years and the unselected have no international route.',
      'Herzegovina outside Mostar has no international schooling at all.',
      'Nine-year primary education is compulsory and parental-choice homeschooling is not established; cantonal rules govern the detail.',
      'A tourism season that runs the household from spring to autumn.',
      'Time zone: Mostar shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Families preparing a child for selective IB admission and wanting examined preparation behind it.',
      'Tourism, hospitality, and heritage-sector families across Mostar and the Neretva valley.',
      'Returning diaspora families from Croatia, Germany, and Austria.',
      'Families in Trebinje, Čapljina, and Široki Brijeg with no local international option.',
      'Students past the compulsory phase running the full A-Level years.',
    ],
    nearbyAreas: ['Mostar', 'Blagaj', 'Čapljina', 'Široki Brijeg', 'Konjic', 'Trebinje', 'Neum and the coast'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Italian and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography, History',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Bosnian, Croatian and wider EU university applications',
    ],
    whyChoose: [
      ['Preparation for a selective route, and a route for everyone else', 'UWC Mostar is excellent and selective. Live Cambridge IGCSEs build exactly the examined record a competitive application benefits from — and a complete pathway for students who take a different road.'],
      ['The years the two-year programme does not cover', 'A selective IB Diploma serves sixteen to eighteen. Our track runs from primary through IGCSE and on to A-Level, so the earlier years are not left to chance.'],
      ['The complete option across Herzegovina', 'Trebinje, Čapljina, and Široki Brijeg have nothing; live delivery reaches all of them identically.'],
      ['Built for the season', 'Live classes plus unlimited recordings hold the academic year through a tourism summer.'],
      ['Timezone that lands in the school day', 'Mostar is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Mostar hosts United World College Mostar and its IB Diploma — among the most respected schools in the region, and selective — alongside an international tourism economy and a Herzegovina hinterland from Trebinje to Široki Brijeg with no international provision at all. Mostar shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Herzegovina: the examined record beneath a selective application, and the complete pathway for everyone else. Run supplementary alongside a school enrolment.',
      cbc: 'Kenya CBC available for Herzegovina families with East African ties.',
      ib: 'IB Diploma Programme — live support across all six subject groups, including for students already in an IB programme.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national structure applies in Mostar with the cantonal layer on top: education competence in the Federation sits with the cantons, so Herzegovina-Neretva sets the detail that governs a family here, working to the principles of the state Framework Law. Nine-year primary education is compulsory, parental-choice homeschooling is not established, and teaching-at-home provisions follow the regional pattern as an authority-organised measure on health grounds. The supplementary configuration therefore carries the compulsory years, with the recorded library carrying the tourism season, and secondary education is generally not compulsory — worth confirming with the cantonal authority rather than assumed.',
    homeTuitionDetail: 'In-person tuition supplementation in Herzegovina is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the Mostar school day on the 1-2 hour offset, with the full recorded library carrying the summer season.',
    faqs: [
      { q: 'We are hoping for a place at UWC Mostar — can Smartious help?', a: 'Indirectly and usefully. UWC Mostar admits selectively for a two-year IB Diploma; live Cambridge IGCSEs in the years before build precisely the examined academic record a competitive application benefits from. And if a place does not come, the same track continues into A-Levels without a break.' },
      { q: 'What about the years before sixteen?', a: 'That is the gap a selective two-year programme cannot fill. Our pathway runs from primary through IGCSE, so the earlier years have structure rather than waiting.' },
      { q: 'Is there anything in Trebinje or Čapljina?', a: 'No international provision at all. Live delivery reaches the whole of Herzegovina identically, supplementary alongside a local enrolment.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'tuzla-ba',
    name: 'Tuzla',
    county: 'Tuzla Canton',
    region: 'The industrial north-east · salt, chemicals and the country\'s largest power plant · a major university city · the largest canton by population · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Tuzla',
    heroTagline: 'For Tuzla families — the industrial north-east, its own canton, its own rules, and no international school in any of it.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Tuzla families. Tuzla anchors Bosnia and Herzegovina\'s industrial north-east — a salt and chemicals tradition that gave the city its name, the country\'s largest thermal power plant, an engineering and manufacturing base, and a university whose faculties draw students from across the region. Tuzla Canton is among the most populous in the Federation and sets its own education rules within the state framework. What it does not have is international schooling. Smartious delivers the international pathways live across the north-east — supplementary alongside your school enrolment.',
    heroImg: '/heroes/tuzla-ba.jpg',
    altTexts: { hero: 'Tuzla city centre and the surrounding hills' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Tuzla families — industrial north-east, own cantonal rules, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling in one of the country\'s most populous cantons.',
      'Cantonal education rules govern the detail here and should be confirmed with the Tuzla Canton authority.',
      'Industrial and energy employment with international investment but no matching schooling.',
      'Exam sittings mean Sarajevo windows, planned ahead.',
      'Time zone: Tuzla shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Chemicals, salt, energy, and heavy-industry engineering families.',
      'University of Tuzla academic and medical-faculty families.',
      'Manufacturing and export-business families across the north-east.',
      'Returning diaspora families from Germany, Austria, and Slovenia.',
      'Students preparing for universities abroad from a regional base.',
    ],
    nearbyAreas: ['Tuzla', 'Lukavac', 'Živinice', 'Gračanica', 'Srebrenik', 'Gradačac', 'Bijeljina'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German, Turkish and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Further Mathematics, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Physics, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Bosnian, Croatian, Austrian and German university applications',
    ],
    whyChoose: [
      ['Chemistry and engineering depth for an industrial canton', 'Cambridge A-Level Chemistry, Physics, and Mathematics — led by a founder with a BEd in Mathematics and Physics — suit the salt, chemicals, and energy sectors precisely.'],
      ['The complete option in a canton with none', 'Identical live delivery in Tuzla and Sarajevo — no relocation, no boarding decision.'],
      ['Your canton named, not glossed over', 'Tuzla Canton sets its own education rules within the state framework; we point families to the right authority rather than describing a national position.'],
      ['Built for shift patterns', 'Live classes plus unlimited recordings work around an industrial household\'s week.'],
      ['Timezone that lands in the school day', 'Tuzla is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Tuzla anchors Bosnia and Herzegovina\'s industrial north-east — salt and chemicals, the country\'s largest thermal power plant, an engineering base, and a major university — in one of the Federation\'s most populous cantons, with no international schooling. Tuzla shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the north-east, run supplementary alongside a school enrolment. Examinations at authorised centres confirmed per session, Sarajevo around two hours away.',
      cbc: 'Kenya CBC available for north-eastern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Education competence in the Federation is exclusively cantonal, so Tuzla Canton sets the rules that govern a family here, working to the principles of the state Framework Law. At framework level, nine-year primary education is compulsory and parental-choice homeschooling is not established, with teaching-at-home provisions following the regional pattern as an authority-organised measure on health grounds. The supplementary configuration carries the compulsory years, and secondary education is generally not compulsory — a point worth confirming with the cantonal authority rather than assumed.',
    homeTuitionDetail: 'In-person tuition supplementation in Tuzla is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the Tuzla school day on the 1-2 hour offset, with every session recorded — built for shift-pattern industrial households.',
    faqs: [
      { q: 'Is there international schooling in Tuzla?', a: 'No — the country\'s provision is Sarajevo-weighted, around two hours away. Live online delivery is the complete option for the north-east, run supplementary alongside your school enrolment.' },
      { q: 'Whose rules apply to us?', a: 'Tuzla Canton\'s, within the principles of the state Framework Law. Education policy in the Federation is an exclusive cantonal competence, so confirm your position with the cantonal education authority.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'zenica-ba',
    name: 'Zenica & Central Bosnia',
    county: 'Zenica-Doboj Canton',
    region: 'The steel city — ArcelorMittal Zenica · central Bosnia\'s industrial corridor · Travnik, Kakanj and the Vranduk valley · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Zenica',
    heroTagline: 'For Zenica and central Bosnian families — a steel city with global ownership and local schooling only.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Zenica and central Bosnian families. Zenica is the country\'s steel city — the ArcelorMittal works sit at the centre of an industrial corridor running through Kakanj, Visoko, and Travnik, with a metallurgical faculty and an engineering tradition behind them. Global ownership brings international management and technical staff into a valley whose schooling was built for a domestic workforce, and Sarajevo\'s small tier is an hour and a half south. Smartious delivers the international pathways live across central Bosnia — supplementary alongside your school enrolment.',
    heroImg: '/heroes/zenica-ba.jpg',
    altTexts: { hero: 'Zenica and the central Bosnian valley' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Zenica and central Bosnia families — steel city, no international schooling. From USD 400/month.',
    challenges: [
      'International management and technical staff in a valley with no international schooling.',
      'Sarajevo\'s small tier is an hour and a half south and priced at capital level.',
      'Cantonal education rules govern the detail here and should be confirmed with the Zenica-Doboj authority.',
      'Exam sittings mean Sarajevo windows, planned ahead.',
      'Time zone: Zenica shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Steel, metallurgy, and industrial engineering families, international and local.',
      'Mining and energy families across the Kakanj and Breza corridor.',
      'University of Zenica academic and metallurgical-faculty families.',
      'Returning diaspora families across central Bosnia.',
      'Students preparing for engineering programmes abroad.',
    ],
    nearbyAreas: ['Zenica', 'the steelworks', 'Kakanj', 'Visoko', 'Travnik', 'Vitez', 'Doboj'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Design and Technology-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Bosnian, Croatian, Austrian and German university applications',
    ],
    whyChoose: [
      ['Engineering and metallurgy depth', 'Cambridge A-Level Physics, Chemistry, Mathematics, and Further Mathematics — the exact spine a steel city\'s children tend to aim at.'],
      ['The international track a global employer\'s city never got', 'Zenica\'s ownership is international and its schooling is not; the Cambridge IGCSE-to-A-Level route comes live from Smartious.'],
      ['Portable across postings', 'Zenica now, another group site after — the curriculum, teachers, and examination board stay constant.'],
      ['Your canton named, not glossed over', 'Zenica-Doboj sets its own education rules within the state framework; we point families to the right authority.'],
      ['Timezone that lands in the school day', 'Zenica is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Zenica is Bosnia and Herzegovina\'s steel city — the ArcelorMittal works anchoring an industrial corridor through Kakanj, Visoko, and Travnik, with a metallurgical faculty behind them — bringing international management into a valley with no international schooling. Zenica shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for central Bosnia, run supplementary alongside a school enrolment. Examinations at authorised centres confirmed per session, Sarajevo an hour and a half away.',
      cbc: 'Kenya CBC available for central Bosnian families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Education competence in the Federation is exclusively cantonal, so Zenica-Doboj Canton sets the rules governing a family here, within the principles of the state Framework Law. Nine-year primary education is compulsory, parental-choice homeschooling is not established, and teaching-at-home provisions follow the regional pattern as an authority-organised measure on health grounds. For the works\' international families the supplementary configuration is the natural one — the local enrolment carries the obligation while the Cambridge track runs live alongside and travels to the next posting.',
    homeTuitionDetail: 'In-person tuition supplementation in central Bosnia is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the Zenica school day on the 1-2 hour offset, with every session recorded — built for shift-pattern industrial households.',
    faqs: [
      { q: 'We came with the steel group — is there an international school here?', a: 'No. The works are internationally owned and the schooling is local, with Sarajevo an hour and a half south. Smartious delivers the Cambridge pathway live, supplementary alongside a local enrolment.' },
      { q: 'Where do Zenica students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with Sarajevo an hour and a half away.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'brcko-ba',
    name: 'Brčko District',
    county: 'Brčko District of BiH',
    region: 'A self-governing district under state sovereignty · its own education authority, separate from both entities · a Sava river port and trade corridor toward Croatia and Serbia · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Brčko District',
    heroTagline: 'For Brčko families — a district with its own education authority, its own rules, and a river border with two countries.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families in Brčko District. Brčko is unlike anywhere else in the country: a self-governing district under state sovereignty, belonging to neither entity exclusively, with its own administration and — importantly for any family reading about Bosnian education law — its own competent education authority, named as such in the state Framework Law alongside Republika Srpska, the Federation, and the cantons. Its economy runs on the Sava river port, the trade corridor into Croatia and Serbia, and the agriculture of the Posavina plain. It has no international schooling. Smartious delivers the international pathways live to the district — supplementary alongside your school enrolment.',
    heroImg: '/heroes/brcko-ba.jpg',
    altTexts: { hero: 'Brčko and the Sava river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Brčko District families — its own education authority, Sava trade corridor, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling in the district, with Sarajevo three hours away and Tuzla the nearest city of size.',
      'Brčko has its own competent education authority — guidance written for a canton or an entity may not apply.',
      'Cross-border trade households need to know that education law follows residence, not business ties.',
      'Exam sittings mean travel, planned ahead, with Croatian and Serbian options worth checking.',
      'Time zone: Brčko shares CET (UTC+1) / CEST (UTC+2 summer) — 1-2 hours behind Nairobi EAT.',
    ],
    familySituations: [
      'Port, logistics, and trade families on the Sava corridor.',
      'Agricultural and agribusiness families across the Posavina plain.',
      'Administration and professional families in the district.',
      'Returning diaspora families from Germany, Austria, and Croatia.',
      'Students preparing for universities in Croatia, Serbia, or further afield.',
    ],
    nearbyAreas: ['Brčko', 'the Sava port', 'Gunja (HR) across the river', 'Bijeljina', 'Orašje', 'Gradačac', 'the Posavina plain'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Bosnian, Croatian and Serbian university applications',
    ],
    whyChoose: [
      ['The complete option in a district with none', 'Identical live delivery in Brčko and Sarajevo, with no relocation.'],
      ['Your own authority, correctly named', 'Brčko District is a competent education authority in its own right under the state Framework Law — guidance written for a canton does not necessarily apply here, and we say so.'],
      ['A qualification that reads across the river', 'Cambridge A-Levels are assessed routinely by Croatian and Serbian universities as well as by UCAS — useful where both borders are minutes away.'],
      ['Business and economics depth for a trade corridor', 'Cambridge A-Level Economics, Business, and Mathematics suit the families who run the district\'s trade.'],
      ['Timezone that lands in the school day', 'Brčko is 1-2 hours behind Nairobi EAT.'],
    ],
    growingReason: 'Brčko is a self-governing district under state sovereignty with its own competent education authority, named alongside the entities and cantons in the state Framework Law — running a Sava river port, a trade corridor into Croatia and Serbia, and the Posavina agricultural plain, with no international schooling. Brčko shares CET (UTC+1) / CEST (UTC+2), 1-2 hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the district, run supplementary alongside a school enrolment. Examinations at authorised centres confirmed per session, with Croatian and Serbian options worth checking.',
      cbc: 'Kenya CBC available for Brčko families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Brčko illustrates the Bosnian structure better than anywhere: the state Framework Law names the competent education authorities as the bodies organising education in Brčko District, Republika Srpska, the Federation, and the cantons — so the district sets its own rules within the framework\'s principles, and guidance written for a Federation canton or for Republika Srpska does not automatically apply here. At framework level, nine-year primary education is compulsory and parental-choice homeschooling is not established, with teaching-at-home provisions following the regional pattern as an authority-organised measure on health grounds. Our default is supplementary, and families should confirm their position with the district\'s own education authority. Households resident across the Sava in Croatia fall under Croatian law instead, where parental-choice homeschooling is likewise not permitted at primary level — decided by residence rather than by where a business trades.',
    homeTuitionDetail: 'In-person tuition supplementation in Brčko is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the local school day on the 1-2 hour offset, with every session recorded.',
    faqs: [
      { q: 'Which education rules apply in Brčko District?', a: 'The district\'s own. The state Framework Law names Brčko District as a competent education authority alongside Republika Srpska, the Federation, and the cantons — so guidance written for a canton or an entity does not automatically apply, and your position should be confirmed with the district authority.' },
      { q: 'We trade across the Croatian and Serbian borders — whose rules govern our children?', a: 'Your country of residence, not where your business trades. Croatian residents are under Croatian law, where parental-choice homeschooling is not permitted at primary level; Serbian residents are under Serbia\'s framework, which does establish a parental route. Your own advisers can confirm your household\'s position.' },
      { q: 'Where do Brčko students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with Croatian and Serbian options worth checking given the distances.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const BOSNIA_COUNTRY = {
  slug: 'bosnia-and-herzegovina',
  name: 'Bosnia and Herzegovina',
  longName: 'Bosnia and Herzegovina',
  adjective: 'Bosnian',
  flag: '🇧🇦',
  hub: '/online-school/bosnia-and-herzegovina',
  hubPageId: 'homeschooling-bosnia',
  cityPageId: 'bosnia-city',

  currency: 'BAM',
  currencyName: 'Convertible Mark',
  currencyPeg: 'Approximate BAM conversion at ~BAM 1.80 per USD (2026 indicative rate; final invoicing in USD).',

  timezone: {
    code: 'CET/CEST',
    name: 'Central European Time (CET UTC+1, CEST UTC+2 summer)',
    utcOffset: '+1',
    offsetFromEAT: '-2 hours (CEST -1 hour summer)',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Sarajevo checked first, with Croatian, Serbian and Montenegrin regional options where practical'],
  examCentreTiles: [
    { city: 'Sarajevo', centre: 'Authorised provision', area: 'The country\'s main external-candidate capacity, confirmed per family per session.' },
    { city: 'The regions', centre: 'Planned per session', area: 'Banja Luka, Tuzla, Zenica, Mostar, and Brčko families plan Sarajevo windows with travel scheduled ahead.' },
    { city: 'Cross-border options', centre: 'Croatia, Serbia, Montenegro', area: 'Worth checking where local capacity is limited — Banja Luka and Brčko sit close to Croatian centres, Mostar to the Adriatic corridor.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Bosnia-based students sit as external candidates at authorised provision, with Sarajevo checked first and capacity confirmed per family per session. Geography helps in a country this shape: Banja Luka and Brčko sit near Croatian centres, Mostar near the Adriatic corridor, and Croatian, Serbian, and Montenegrin options are all worth reviewing where local capacity is limited. Regional families plan Sarajevo travel into each series well ahead. Note what does not apply: a Smartious arrangement here is supplementary during the compulsory years, so the school enrolment carries the obligation and its own assessment while the Cambridge calendar runs alongside. Secondary education is generally not compulsory, so the A-Level years generally sit outside the obligation — but because education competence rests with the cantons, the entities, and Brčko District rather than the state, that is a point to confirm with your own competent authority rather than assume.',
  secondaryProgrammeExamRef: 'Authorised Sarajevo and regional provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/bosnia-and-herzegovina.jpg',
  heroEyebrow: 'Online international school for Bosnia and Herzegovina',
  heroH1Suffix: 'Bosnia and Herzegovina',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for expat, diaspora, industrial, and Bosnian families across Sarajevo, Banja Luka, Mostar, Tuzla, Zenica, and Brčko District. One structural fact shapes everything here: a state Framework Law sets the principles, but the rules governing your child are made by your canton, your entity, or your district. Nine-year primary education is compulsory and parental-choice homeschooling is not established — so we run supplementary alongside your school, and we tell you where to check the rest.',
  heroValueProp: 'From USD 180/month (~BAM 325/month). Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — supplementary beside any enrolment, delivered identically anywhere in the country.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Bosnia and Herzegovina',

  citiesSectionTitle: 'Where our Bosnia and Herzegovina families are',
  citiesSectionBody: 'Smartious families here concentrate across Sarajevo (the diplomatic community, a growing IT sector, and most of the country\'s international schooling), Banja Luka (the second city, under its own education authority, with an export IT sector and no international school), Mostar and Herzegovina (home to United World College Mostar\'s selective IB Diploma, and to a hinterland with nothing), Tuzla (the industrial north-east and one of the Federation\'s most populous cantons), Zenica and central Bosnia (the steel corridor under global ownership), and Brčko District (its own education authority, its own rules, and a river border with two countries). Fourteen ways of governing schooling, one supplementary configuration, and five regions out of six with nothing.',

  trustSignals: [
    { h: 'Two operational teaching centres', p: 'Live teaching to Bosnia and Herzegovina families is delivered from two international-standard operational centres established 2022 and 2023.' },
    { h: 'CET/CEST timezone alignment', p: 'Bosnia and Herzegovina runs CET (UTC+1) / CEST (UTC+2 summer) — only 1-2 hours behind Nairobi EAT, so live teaching lands naturally inside the school day.' },
    { h: 'The structure explained before anything is sold', p: 'The state Framework Law names the competent education authorities as Brčko District, Republika Srpska, the Federation, and the cantons — and in the Federation, education policy is an exclusive cantonal competence. There is no single national answer, and we do not pretend to give one.' },
    { h: 'The baseline, stated plainly', p: 'Nine-year primary education is compulsory and parental-choice homeschooling is not established in Bosnian law. We build only the lawful configuration: supplementary study alongside your school enrolment.' },
  ],

  universitiesInCountry: 'The University of Sarajevo — among the oldest in the region — alongside the universities of Banja Luka, Tuzla, Mostar, Zenica, and East Sarajevo, plus private institutions including the International University of Sarajevo, International Burch University, and Sarajevo School of Science and Technology, several of which teach substantially in English.',
  universityChannels: 'Bosnian universities admit holders of foreign secondary qualifications through recognition procedures, with programme-specific requirements and local-language proficiency where a degree is taught in Bosnian, Croatian, or Serbian — Cambridge A-Levels and the IB Diploma are established international qualifications, confirmed per programme rather than assumed. The country also has a real English-medium private tier for its size: the International University of Sarajevo, International Burch University, and Sarajevo School of Science and Technology teach in English and read Cambridge and IB qualifications more directly. Beyond that, Bosnian students are among the most internationally mobile in Europe, with Croatian, Serbian, Austrian, German, Slovenian, and Turkish universities all assessing these qualifications routinely and one of Europe\'s largest diasporas making Western Europe a natural destination. UCAS reads A-Levels natively, the Common Application serves US plans, and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across Bosnian, regional, UK (UCAS), and US destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Bosnia and Herzegovina families, in the configuration the framework leaves open: live supplementary Cambridge subjects beside a school enrolment during the compulsory years, with the full pathway continuing into A-Levels afterwards. Classes land inside the school day on the 1-2 hour offset, typically in the after-school slot; examinations at authorised provision confirmed per session, with Croatian, Serbian, and Montenegrin regional options for border families. Pathway read natively by UK universities via UCAS, recognised for Bosnian university admission per programme, and accepted in 160+ countries.',
  britishCurriculumSuits: 'Bosnia and Herzegovina families targeting the Cambridge pathway. Best fit for: (1) returning diaspora children arriving mid-stream from German, Austrian, Croatian, Swedish, or Swiss systems, (2) international management and technical families in Zenica, Tuzla, and the industrial corridors, (3) the regions — Banja Luka, Mostar\'s hinterland, Brčko — where international provision does not exist, (4) families preparing a child for selective IB admission who want an examined record behind the application, (5) students past the compulsory phase running the full A-Level years.',
  britishCurriculumDelivery: 'Live online classes landing inside the school day on the 1-2 hour offset, small groups 4-6 students, run supplementary alongside a school enrolment. Cambridge examinations at authorised provision, confirmed per session.',
  ibDiplomaSuits: 'Bosnia and Herzegovina families targeting the IB Diploma\'s breadth — including support for students already in an IB programme, and preparation for those applying to one.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Bosnia and Herzegovina families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in 2019 to make international qualifications (Cambridge, IB, American) accessible to families across emerging markets and international communities at online-delivery fees. Bosnia and Herzegovina families join students in 48 other countries — from Sarajevo to Nairobi\'s own Diamond Plaza HQ, the Neretva to the Sava.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Zenica\'s metallurgists, Tuzla\'s chemical and energy families, and every medicine-bound student in the capital. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'International schooling in Bosnia and Herzegovina is thin and Sarajevo-weighted, with one significant exception: United World College Mostar runs the IB Diploma and is among the most respected schools in this part of Europe. We do not position against it — a selective two-year programme and a live supplementary track serve different families, and frequently the same family at different ages. Everywhere else, from Banja Luka to Brčko, there is essentially nothing, which leaves the competitive space unusually clear.',
  competitors: [
    { name: 'United World College Mostar',                    city: 'Mostar',                curriculum: 'IB Diploma',                            feesUsd: 'Scholarship-based, selective',                      feesAed: 'Highly selective',        rating: 4.9, capacityNote: 'Outstanding and genuinely selective — a two-year programme for a specific cohort' },
    { name: 'International School of Sarajevo',               city: 'Sarajevo',              curriculum: 'International',                         feesUsd: 'Premium capital tier',                              feesAed: 'Varies by grade',         rating: 4.3, capacityNote: 'The diplomatic-community school' },
    { name: 'QSI International School of Sarajevo',           city: 'Sarajevo',              curriculum: 'American international',                feesUsd: 'Premium capital tier',                              feesAed: 'Varies',                  rating: 4.3, capacityNote: 'The American-track option' },
    { name: 'Private international-leaning schools',          city: 'Sarajevo and regions',  curriculum: 'Bilingual, international-leaning',      feesUsd: 'Mid-premium tier',                                  feesAed: 'Varies',                  rating: 4.1, capacityNote: 'A small private sector — not a full British or IB route' },
    { name: 'Banja Luka, Tuzla, Zenica, Brčko',               city: 'The regions',           curriculum: '—',                                     feesUsd: 'No international provision',                        feesAed: '—',                       rating: 0,   capacityNote: 'The second city, the industrial north-east, the steel corridor, and the district — nothing' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh / bina (online)', city: 'Online',        curriculum: 'Cambridge self-paced / UK online / own to 15', feesUsd: 'Per-subject / GBP 9,000-11,000 / consultation', feesAed: 'Varies',      rating: 4.2, capacityNote: 'Self-paced, priced far above Smartious, or stopping at 15 — and none explains that the governing rules here are cantonal and entity-level' },
    { name: 'Smartious Homeschool (BiH via online delivery)', city: 'Delivered to all BiH',  curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP',  feesUsd: 'USD 2,160-6,480/year',                              feesAed: '~BAM 3,900-11,700/year',  rating: 4.8, capacityNote: 'Every class live through A-Level + the fourteen-authority structure explained + the regions served identically + IB preparation beside a selective programme' },
  ],

  legalFrameworkIntro: 'Bosnia and Herzegovina cannot be summarised the way other countries can, because the country does not have one education law — it has a framework and fourteen ways of applying it. Here is the structure, and what it means for a family.',
  legalFramework: [
    { h: 'One framework, many authorities', p: 'The Framework Law on Primary and Secondary Education in Bosnia and Herzegovina sets the principles that the whole country works to — and it identifies the competent education authorities as the bodies responsible for organising the education system in Brčko District, Republika Srpska, the Federation of Bosnia and Herzegovina, and the cantons. All entity, cantonal, and Brčko laws must be harmonised with it. In the Federation, education policy — including adopting education regulations and ensuring provision — is an exclusive cantonal competence, spread across ten cantons. The practical consequence for a family is unusual and worth stating first: the rules that govern your child are made where you live, and guidance written for a different canton or entity may not apply to you.' },
    { h: 'The baseline: nine years, compulsory, school-based', p: 'What the framework does establish across the country is that primary education runs nine years and is compulsory, roughly from six to fifteen. Parental-choice homeschooling is not established in Bosnian law. Where laws provide for teaching at home, they follow the pattern seen across the region — an authority- or school-organised measure for children who cannot attend, on health grounds — and we describe that factually rather than as a pathway. We phrase the negative carefully rather than sweepingly: not established, and worth confirming with your own competent authority, which is the honest position when fourteen bodies hold the pen.' },
    { h: 'Teaching languages, stated plainly', p: 'Teaching is delivered in the official languages — Bosnian, Croatian, and Serbian — in both Latin and Cyrillic script, with provision for minority languages where communities require it. That is the ordinary structure of the system, and it matters practically for a family choosing subjects alongside school: an English-medium academic track has to fit around whichever language of instruction the child\'s school uses, and our timetable is built to do exactly that.' },
    { h: 'What that leaves: one honest configuration', p: 'For a child resident here, the arrangement we offer is supplementary. The school enrolment carries every legal obligation and the daily routine; Smartious teaches the Cambridge or IB track live alongside it in the after-school hours, given the one-to-two-hour offset from our teaching base, building toward external IGCSE and A-Level examinations at authorised provision. It requires nothing to be applied for, nothing to be approved, and nothing to be confirmed with any authority — which in a country with fourteen of them is a substantial practical advantage.' },
    { h: 'After the compulsory phase', p: 'Secondary education is generally not compulsory in Bosnia and Herzegovina, so the A-Level years generally fall outside the obligation. We state that with the hedge it deserves rather than the prominence our Croatian or Albanian pages give their equivalents: because competence sits with the entities, cantons, and district, this is precisely the kind of point that can differ, and it should be confirmed with your own competent education authority before a family plans around it.' },
    { h: 'Where the qualifications lead', p: 'Bosnian universities admit foreign secondary qualifications through recognition procedures with requirements confirmed per programme, and the country has a genuine English-medium private tier for its size — the International University of Sarajevo, International Burch University, and Sarajevo School of Science and Technology among them — reading Cambridge and IB qualifications more directly. Beyond that, Bosnian students are among the most internationally mobile in Europe: Croatian, Serbian, Austrian, German, Slovenian, and Turkish universities assess these qualifications routinely, UCAS reads A-Levels natively, the Common Application serves US plans, and A-Levels are accepted in 160+ countries. With a diaspora this large, that portability is usually the whole point.' },
  ],

  whySmartious: [
    { h: 'The fourteen-authority structure explained first',                p: 'A state framework, two entities, ten cantons, and a district. We tell families the rules are made where they live and point them to the right authority, instead of inventing a national position.' },
    { h: 'The baseline stated plainly',                                     p: 'Nine-year primary education is compulsory and parental-choice homeschooling is not established. We build only the lawful configuration.' },
    { h: 'One configuration that needs nothing approved',                   p: 'Supplementary study alongside your school enrolment requires no application to any of the fourteen authorities — a real practical advantage here.' },
    { h: 'Beside a selective IB programme, not against it',                 p: 'UWC Mostar is outstanding and selective. Live Cambridge IGCSEs build the examined record beneath an application, and a complete pathway for students who take another road.' },
    { h: 'The regions served identically',                                  p: 'Banja Luka, Tuzla, Zenica, Herzegovina, and Brčko have no international provision at all. Live delivery closes every gap the same way.' },
    { h: 'CET/CEST timezone alignment',                                     p: 'Only 1-2 hours behind Nairobi EAT — live teaching lands naturally inside the school day.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Bosnia and Herzegovina?', a: 'Parental-choice homeschooling is not established in Bosnian law, and nine-year primary education is compulsory. The structural point matters as much: education competence sits with Brčko District, Republika Srpska, the Federation, and the Federation\'s ten cantons, so the detail governing your child is set where you live and should be confirmed with your competent education authority.' },
    { q: 'Why can you not just tell us the national rule?', a: 'Because there is not one to tell. The state Framework Law sets principles and names the competent authorities as the district, the entities, and the cantons — and in the Federation, education policy is an exclusive cantonal competence. Any provider giving you a single national answer is simplifying something that is genuinely not simple.' },
    { q: 'So what can Smartious offer us?', a: 'Supplementary study alongside your school enrolment: the school carries every legal obligation, and we teach Cambridge or IB subjects live in the after-school slot toward external examinations. It requires no application to any authority.' },
    { q: 'Does the same rule apply in Banja Luka, Sarajevo, and Brčko?', a: 'Not necessarily — those three sit under three different competent authorities. It is the Swiss cantonal pattern applied to a stricter baseline, and it is why we route every family to their own authority for the detail.' },
    { q: 'Is secondary education compulsory?', a: 'Generally not, so the A-Level years generally fall outside the obligation. Given how competence is distributed we state that with a hedge rather than as a country-wide certainty — confirm it with your own authority before planning around it.' },
    { q: 'How does Smartious relate to United World College Mostar?', a: 'Not as a competitor. UWC Mostar runs a selective two-year IB Diploma and is among the most respected schools in the region. Live Cambridge IGCSEs in the years before build the examined record a competitive application benefits from, and the same track continues into A-Levels if a place does not come.' },
    { q: 'We are returning from Germany or Austria mid-curriculum — what are our options?', a: 'Enrol locally, which carries every legal obligation, and keep the international pathway running alongside it with us — the same curriculum, teachers, and examination board continuing across the move rather than restarting inside a new system.' },
    { q: 'Where do Bosnian students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session — Sarajevo first, with Croatian, Serbian, and Montenegrin centres worth checking where local capacity is limited, particularly from Banja Luka, Brčko, and Mostar.' },
    { q: 'Can my child access universities here with A-Levels or an IB Diploma?', a: 'Bosnian universities admit foreign secondary qualifications through recognition procedures with requirements confirmed per programme, and the English-medium private tier — the International University of Sarajevo, International Burch University, and Sarajevo School of Science and Technology — reads them more directly. Croatian, Serbian, Austrian, German, Slovenian, and Turkish universities assess them routinely, and UCAS and the Common Application stand open internationally.' },
    { q: 'Which parts of the country does Smartious cover?', a: 'Sarajevo, Banja Luka, Mostar and Herzegovina, Tuzla, Zenica and central Bosnia, and Brčko District have dedicated pages with local context. Live online delivery works identically anywhere in the country — which outside Sarajevo is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which canton, entity, or district you live in: in Bosnia and Herzegovina that single fact determines which rules govern your child, and it belongs at the start of the conversation rather than the end.',
}
