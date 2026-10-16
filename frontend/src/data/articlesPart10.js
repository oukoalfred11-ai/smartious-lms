/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════
// ARTICLES PART 10 — LAW, EXAMS AND RECOGNITION CLUSTER (Oct 2026)
//
// Kenya, Nigeria, the UAE and Saudi Arabia: is home education legal,
// how private candidates enter IGCSE and A Level, CBC/CBE online,
// equivalency and returning to school.
//
// ACCURACY RULES FOR THIS CLUSTER
// • Never say Smartious is approved or licensed by KHDA, ADEK, the UAE
//   MOE, the Saudi MOE, Qatar MOEHE, KICD, KNEC or any Nigerian body.
// • Legal statements are careful: what the law says, what is unclear,
//   and "check with the authority", with the official site named.
// • Exams: students sit Cambridge and Pearson Edexcel exams as private
//   candidates at authorised centres such as the British Council.
//   Registration specifics are phrased cautiously; dates change.
// • Fees: from USD 423/month for Primary, payable termly; fees vary by
//   curriculum and level. One-to-one tuition USD 15/hour.
// ═══════════════════════════════════════════════════════════════════

const WA = 'https://wa.me/254745021212'
const AUTHOR = { author: 'Alfred Ouko', role: 'Founder' }
const IMG_KE = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=75'
const IMG_NG = 'https://images.unsplash.com/photo-1577086664693-894d8405334a?w=1200&q=75'
const IMG_GULF = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=75'
const IMG_EXAM = 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=75'

const PRICING = { name: 'Fees and payment', href: '/pricing', note: 'From USD 423 a month for Primary, payable termly. Fees vary by curriculum and level.' }
const CONTACT = { name: 'Contact admissions', href: '/contact', note: 'Admissions +254 745 021 212 (WhatsApp), academic +254 182 071 920, hello@smartioushomeschool.com' }
const WHATSAPP = { name: 'Message admissions on WhatsApp', href: WA, note: '+254 745 021 212' }

export const ARTICLES_PART_10 = {

  // ═══════════════ LEGAL: KENYA ═══════════════
  'is-homeschooling-legal-in-kenya': {
    cat: 'homeschool', country: 'kenya',
    img: 'linear-gradient(135deg,#1A0F14,#8B1A2E)', splash: IMG_KE, splashAlt: 'A Kenyan parent reading education law guidance at home',
    t: 'Is Homeschooling Legal in Kenya? A Careful Guide for Parents',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Is Homeschooling Legal in Kenya? (2026 Guide)',
    metaDesc: 'What the Constitution, the Basic Education Act 2013 and the courts say about homeschooling in Kenya, what is unclear, and what parents should check.',
    intro: "Kenyan parents ask us this question more than any other, and it deserves a careful answer rather than a quick yes or no. The honest position is that Kenyan law does not set out a clear framework for parent-led homeschooling, the Basic Education Act 2013 places strong duties on parents, and the courts have discussed the question without creating a simple rule. This guide explains what the law says, where it is unclear, how an online school differs from homeschooling, and what we suggest families do. It is general information, not legal advice. If your situation is sensitive, speak to an advocate and to the Ministry of Education.",
    sections: [
      { h: 'The starting point: the Constitution', p: "Article 53 of the Constitution of Kenya gives every child the right to free and compulsory basic education. The word compulsory matters. It means the state treats basic education as something every child must receive, not something a family can opt out of. It does not, on its own, say where or how that education must happen. That detail comes from the Basic Education Act 2013 and the policies made under it." },
      { h: 'What the Basic Education Act 2013 says', p: "The Basic Education Act 2013 makes basic education compulsory and places a duty on parents and guardians to ensure their children attend school, with offences for failing to do so. The Act is built around registered institutions of basic education, and it does not set up a separate registration system for families who teach their own children at home. That is the heart of the uncertainty. Some officials have read the Act as excluding homeschooling. Homeschooling families have argued that the Act simply does not address home education, and that parents may choose how their children are educated. You can read the Act on the Kenya Law website, kenyalaw.org." },
      { h: 'What the courts have said', p: "Kenyan courts have heard petitions on homeschooling. In a 2023 High Court judgment on a petition about homeschooling, the court discussed the question in detail. As reported, the court said that for homeschooling to be adopted in Kenyan law it would need to be anchored on the minimum educational standards set by the national government, and that a parent’s right to choose a child’s education is not absolute and can be limited under Article 24 of the Constitution. We would not read that as either a ban or an approval. It is a signal that standards, curriculum and assessment are what the law cares about. Read the judgments themselves on kenyalaw.org rather than relying on summaries, including ours." },
      { h: 'Curriculum and assessment: KICD and KNEC', p: "The national curriculum is developed by the Kenya Institute of Curriculum Development, KICD, and national assessments are run by the Kenya National Examinations Council, KNEC. Under Competency-Based Education, learners take national assessments at key points, including the Kenya Junior School Education Assessment at the end of Grade 9. If your child follows the Kenyan curriculum outside a registered school, ask KNEC how they would be entered for each assessment, because entry rules apply to assessment centres. If your child follows an international curriculum such as Cambridge or Pearson Edexcel, they can sit those exams as private candidates at authorised centres such as the British Council. Later recognition of foreign qualifications in Kenya is handled by bodies such as the Kenya National Qualifications Authority." },
      { h: 'Homeschooling and online school are not the same', p: "In parent-led homeschooling, the parent decides what to teach and teaches it. In an online school, qualified teachers teach live lessons on a timetable, set and mark work and write reports, while the child learns at home. Families sometimes call both homeschooling. The difference matters for the legal question, because the concerns in the law are about standards, curriculum and assessment. We do not suggest that choosing an online school settles every legal question for you. Ask any provider, including us, exactly what it is, where it is registered and what that means for your child, and check the answer yourself." },
      { h: 'What we suggest families do', p: "Read the Basic Education Act and the relevant judgments on kenyalaw.org. Contact the Ministry of Education, education.go.ke, or your county education office if you are unsure. Choose a recognised curriculum with external assessment, so that your child’s learning can be measured against a standard. Keep good records: a timetable, samples of work, reports and exam results. Make sure your child has regular contact with other children through classes, clubs, sport or faith groups. And plan the exit routes early, because the documents a Kenyan school or university will want to see later are easier to collect as you go than years afterwards." },
      { h: 'If you are challenged', p: "Occasionally a family is asked by a local official why their child is not in school. Stay calm and cooperative. Explain what education your child is receiving, show your records, timetable and reports, and the curriculum and exam route you follow. If the matter becomes formal, take advice from an advocate. Families who keep good records and follow a structured, externally assessed programme are in a much stronger position than families who cannot show what their child is learning." },
    ],
    faqs: [
      { q: 'Is homeschooling legal in Kenya?', a: 'Kenyan law does not set out a clear framework for parent-led homeschooling. The Basic Education Act 2013 makes basic education compulsory and places duties on parents. Courts have discussed the issue without creating a simple rule. Check with the Ministry of Education and take legal advice if your situation is sensitive.' },
      { q: 'Is Smartious approved by the Ministry of Education or KICD?', a: 'No. We do not claim approval from the Ministry, KICD or KNEC. Ask us what we are and check it yourself.' },
      { q: 'Can a homeschooled child sit IGCSE in Kenya?', a: 'Yes. Students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres such as the British Council.' },
      { q: 'What records should we keep?', a: 'A timetable, samples of work, reports, assessment and exam results, and any correspondence with education officials.' },
    ],
    conclusion: "The legal position of homeschooling in Kenya is genuinely unsettled, and anyone who tells you it is simple is oversimplifying. Focus on what the law cares about: a recognised curriculum, real standards, external assessment and good records. If you want to talk through options, message our admissions team on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Kenya',
    countryLinks: [
      { name: 'Online school in Kenya', slug: 'kenya', note: 'Programmes, timetables and fees for Kenyan families.' },
    ],
    pageLinksHeading: 'Kenyan pages and next steps',
    pageLinks: [
      { name: 'Homeschool in Nairobi', href: '/homeschool-nairobi', note: 'Live online schooling for Nairobi families.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Online CBC/CBE School in Kenya', slug: 'online-cbc-school-kenya', note: 'Grade 1 to 12 online.' },
      { name: 'Private Candidate IGCSE in Kenya', slug: 'private-candidate-igcse-kenya', note: 'Registering through the British Council.' },
      { name: 'Cost of Homeschooling in Kenya', slug: 'homeschool-fees-kenya', note: 'KSh per term and per month.' },
    ],
  },

  // ═══════════════ LEGAL: NIGERIA ═══════════════
  'is-homeschooling-legal-in-nigeria': {
    cat: 'homeschool', country: 'nigeria',
    img: 'linear-gradient(135deg,#1A0F14,#0A1A0F)', splash: IMG_NG, splashAlt: 'A Nigerian parent reviewing education guidance with a child',
    t: 'Is Homeschooling Legal in Nigeria? A Careful Guide for Parents',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Is Homeschooling Legal in Nigeria? (2026 Guide)',
    metaDesc: 'What the UBE Act 2004, the Child’s Rights Act and state laws say about homeschooling in Nigeria, what is unclear, and what parents should check.',
    intro: "Nigerian parents considering home education want to know where they stand. The careful answer is that Nigerian law does not expressly authorise or regulate parent-led homeschooling, the Universal Basic Education Act places a duty on parents to send children to primary and junior secondary school, and enforcement has historically been rare. Bills on the subject have been proposed in the National Assembly, but we are not aware of any that has become law. This guide explains what the law says, where it is unclear and what we suggest families do. It is general information, not legal advice.",
    sections: [
      { h: 'The Universal Basic Education Act 2004', p: "The Compulsory, Free Universal Basic Education Act 2004 requires governments to provide free, compulsory basic education, covering primary and junior secondary school. Section 2 also places a duty on parents to ensure their child receives that education, framed as endeavouring to send the child to primary and junior secondary school, and the Act creates offences for parents who fail in that duty. The Act does not mention home education as an alternative. The Universal Basic Education Commission, ubec.gov.ng, oversees the programme at federal level, and State Universal Basic Education Boards run it in each state." },
      { h: 'The Child’s Rights Act and state laws', p: "The Child’s Rights Act 2003 also provides for every child’s right to free, compulsory basic education and places duties on parents. Because Nigeria is a federation, many states have passed their own version of the Child’s Rights law and their own education laws, and the details differ between states. A family in Lagos may face a different legal text from a family in Kano or Enugu. If you are planning to home educate, look at your own state’s education law and speak to your State Universal Basic Education Board." },
      { h: 'Enforcement in practice', p: "Reviews of Nigerian case law have found very few, if any, prosecutions of parents under the penalty provisions of the UBE Act, which suggests the parental duty is rarely enforced through the courts. That does not make homeschooling legal. It means the risk of prosecution has historically been low, which is a different thing. A family relying on that should understand the distinction, and should be ready to explain their child’s education clearly if asked." },
      { h: 'Proposed changes', p: "Bills have been introduced in the National Assembly in recent years that touch on this area, including proposals that would give parents a legal right to educate children at home, and others that would strengthen penalties for parents who do not enrol their children. A bill passing a first reading is not law. Check the current status on the National Assembly website, nass.gov.ng, before relying on any reported change." },
      { h: 'Homeschooling and online school are not the same', p: "In parent-led homeschooling, the parent plans and teaches. In an online school, qualified teachers teach live lessons on a timetable, mark work and write reports, while the child learns at home. Many Nigerian families call both homeschooling. We do not suggest that choosing an online school answers every legal question. Ask any provider, including us, exactly what it is and where it is registered, and check the answer with the Federal Ministry of Education, education.gov.ng, or your state board if it matters to your situation." },
      { h: 'Exams and later admission', p: "Whatever route you choose, think about exams early. Students can sit Cambridge and Pearson Edexcel IGCSE and A Level as private candidates at authorised centres such as the British Council, which has run sittings in Lagos, Abuja, Port Harcourt and Kano. WAEC and NECO run exams for private candidates too, and Nigerian university admission runs through JAMB. Check with each university which qualifications it accepts and how, because requirements differ. Good results from an external exam board make every later conversation easier." },
      { h: 'What we suggest families do', p: "Read the UBE Act and your state’s education and Child’s Rights laws. Speak to your State Universal Basic Education Board if you are unsure. Choose a recognised curriculum with external exams. Keep good records: a timetable, samples of work, reports and results. Make sure your child has regular contact with other children through clubs, sport, faith groups or classes. And take advice from a lawyer if your situation is unusual or contested." },
      { h: "Socialisation and wellbeing", p: "Legal questions are only part of the picture. Whatever route you choose, make sure your child spends regular time with other children: sports clubs, music, church or mosque groups, scouts, coding clubs, and family friends. Live online classes, where a child sees and works with the same classmates every day, help too. Children who learn at home do best when the family plans this deliberately rather than leaving it to chance, especially in busy cities where it is easy for days to pass indoors." },
    ],
    faqs: [
      { q: 'Is homeschooling legal in Nigeria?', a: 'Nigerian law does not expressly authorise or regulate parent-led homeschooling. The UBE Act 2004 places a duty on parents to send children to primary and junior secondary school. Enforcement has been rare. Check your state’s law and speak to your State Universal Basic Education Board.' },
      { q: 'Is Smartious approved by the Nigerian government?', a: 'No. We do not claim approval from the Federal Ministry of Education, UBEC or any state board.' },
      { q: 'Can a homeschooled child sit IGCSE in Nigeria?', a: 'Yes, as a private candidate at an authorised centre such as the British Council.' },
      { q: 'Can a homeschooled child go to a Nigerian university?', a: 'Admission runs through JAMB and each university’s own requirements. Check with the university which qualifications it accepts.' },
    ],
    conclusion: "Homeschooling in Nigeria sits in a legal grey area: not expressly permitted, rarely enforced against, and subject to proposals that may change it. Choose a structured, externally assessed route, keep records and check your state’s rules. To talk through options, message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Nigeria',
    countryLinks: [
      { name: 'Online school in Nigeria', slug: 'nigeria', note: 'Programmes, timetables and fees for Nigerian families.' },
    ],
    pageLinksHeading: 'Nigerian cities and next steps',
    pageLinks: [
      { name: 'Homeschool in Lagos', href: '/homeschool-lagos-ng', note: 'Live online schooling for Lagos families.' },
      { name: 'Homeschool in Abuja', href: '/homeschool-abuja-ng', note: 'For families in the FCT.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'IGCSE vs WAEC', slug: 'igcse-vs-waec', note: 'Choosing an exam route.' },
      { name: 'Private Candidate IGCSE in Nigeria', slug: 'private-candidate-igcse-nigeria', note: 'Registering through the British Council.' },
      { name: 'Homeschooling in Lagos: A Practical Guide', slug: 'homeschool-lagos', note: 'How to start, costs and exams.' },
    ],
  },

  // ═══════════════ IGCSE VS WAEC ═══════════════
  'igcse-vs-waec': {
    cat: 'igcse', country: 'nigeria',
    img: 'linear-gradient(135deg,#0A1A0F,#C9973A)', splash: IMG_EXAM, splashAlt: 'A student revising for exams at a desk',
    t: 'IGCSE vs WAEC: Which Should Your Child Take?',
    date: 'October 2026 · 10 min read',
    ...AUTHOR,
    metaTitle: 'IGCSE vs WAEC: Which Should Your Child Take?',
    metaDesc: 'A fair comparison of IGCSE and WAEC WASSCE for Nigerian and West African families: content, grading, university entry and how to decide.',
    intro: "IGCSE and WAEC’s WASSCE are both respected secondary qualifications, but they are built for different purposes, and the right choice depends on where your child is likely to go next. Many Nigerian families end up taking one, the other, or both. This guide compares them fairly: who sets them, how they are structured and graded, how universities in Nigeria and abroad treat them, and how homeschooled students can sit each. We teach the IGCSE route, but we do not think it is the right answer for every child, and we say so below.",
    sections: [
      { h: 'Who sets each exam', p: "IGCSE is an international qualification. The Cambridge IGCSE is set by Cambridge International Education, part of the University of Cambridge, and the Pearson Edexcel International GCSE is set by Pearson. Both are taken in many countries. WASSCE, the West African Senior School Certificate Examination, is set by the West African Examinations Council, WAEC, which serves Nigeria, Ghana, Sierra Leone, Liberia and The Gambia. WAEC’s Nigerian office publishes its timetable and rules at waecnigeria.org. NECO, the National Examinations Council, offers a Nigerian alternative to WASSCE." },
      { h: 'Age and stage', p: "IGCSE is usually taken at about 16, at the end of Year 11 in the British system, and leads on to AS and A Level, which are the main university entry qualifications in the British route. WASSCE is usually taken at the end of SS3, at about 17 or 18, and is itself the school leaving certificate used for Nigerian university entry together with JAMB’s UTME. That difference matters: IGCSE is a stage on the way to A Level, while WASSCE is the end of secondary school in the Nigerian system." },
      { h: 'Content and style', p: "Both cover the core subjects, English, mathematics and the sciences, and a range of others. IGCSE syllabuses are designed for an international audience and many subjects offer Core and Extended tiers, so a student can be entered at the level that suits them. Assessment often includes practical work or coursework options depending on the subject. WASSCE syllabuses are aligned with the Nigerian and West African senior secondary curriculum, with content and examples set in a West African context. Both reward steady study. Students who enjoy problem solving and extended writing often do well in IGCSE, while students taught in Nigerian schools will find WASSCE aligned with their classroom learning." },
      { h: 'Grading', p: "Cambridge IGCSE grades run from A* to G, and some syllabuses use a 9 to 1 scale instead. Pearson Edexcel International GCSEs mostly use 9 to 1. WASSCE grades run from A1 to F9, with C6 or better counted as a credit. Nigerian universities typically ask for credits in five subjects, including English and mathematics, at O Level, which can come from WASSCE, NECO or an accepted equivalent." },
      { h: 'University entry in Nigeria', p: "For Nigerian universities, WASSCE or NECO is the familiar route. Applicants also sit JAMB’s UTME. Many Nigerian universities accept IGCSE results in place of WASSCE for O Level requirements, but practice differs between institutions and courses, so check with each university and with JAMB how IGCSE results are treated before you rely on them. Some families have their child sit both, using IGCSE and A Level for options abroad and WASSCE for Nigerian entry." },
      { h: 'University entry abroad', p: "For universities in the United Kingdom and many other countries, the British route of IGCSE followed by A Level is widely understood. Universities generally make offers on A Level results, with IGCSE grades used as supporting evidence, for example for English and mathematics. WASSCE is also accepted by many overseas universities, often alongside a foundation year or additional qualifications, depending on the course. Check the international entry requirements page of each university your child is considering." },
      { h: 'Sitting each exam as a homeschooler', p: "Homeschooled and online school students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres such as the British Council, which has run sittings in Lagos, Abuja, Port Harcourt and Kano. WAEC runs a WASSCE for private candidates, and NECO runs an external exam for private candidates, each with its own registration window and rules. Check the official sites for current dates, because they change each year." },
      { h: 'How to decide', p: "Ask three questions. Where is your child most likely to go to university: Nigeria, abroad or either? Which system is your child learning in now, and how much would a change disrupt them? And what will the full route cost, including exams, in naira? If Nigeria is the clear destination, WASSCE or NECO is the natural route. If abroad is likely, IGCSE and A Level usually give more options. If you are unsure, IGCSE and A Level keep options open, and some families add WASSCE as a private candidate. Talk to the universities, not only to schools." },
    ],
    faqs: [
      { q: 'Is IGCSE better than WAEC?', a: 'Neither is better in general. IGCSE leads to A Level and suits families looking abroad. WASSCE is the familiar route for Nigerian universities. The right choice depends on where your child will study.' },
      { q: 'Do Nigerian universities accept IGCSE?', a: 'Many do for O Level requirements, but practice differs. Check with each university and with JAMB.' },
      { q: 'Can my child take both?', a: 'Yes. Some families sit IGCSE and A Level for options abroad and WASSCE as a private candidate for Nigerian entry.' },
      { q: 'How do homeschoolers sit IGCSE in Nigeria?', a: 'As private candidates at authorised centres such as the British Council.' },
    ],
    conclusion: "IGCSE and WASSCE are both serious qualifications; the better one is the one that fits your child’s next step. Decide with the destination in mind, check with the universities, and plan exam registration early. Smartious teaches the IGCSE and A Level route on a WAT timetable; message admissions on WhatsApp at +254 745 021 212 to talk it through.",
    countryLinksHeading: 'Smartious in Nigeria',
    countryLinks: [
      { name: 'Online school in Nigeria', slug: 'nigeria', note: 'IGCSE and A Level on a WAT timetable.' },
    ],
    pageLinksHeading: 'Nigerian cities and next steps',
    pageLinks: [
      { name: 'Homeschool in Lagos', href: '/homeschool-lagos-ng', note: 'Live online schooling for Lagos families.' },
      { name: 'Homeschool in Abuja', href: '/homeschool-abuja-ng', note: 'For families in the FCT.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Private Candidate IGCSE in Nigeria', slug: 'private-candidate-igcse-nigeria', note: 'Step by step.' },
      { name: 'WAEC and IGCSE Tutors in Nigeria', slug: 'waec-igcse-tutors-nigeria', note: 'Finding the right help.' },
      { name: 'Online School Fees in Nigeria', slug: 'online-school-fees-nigeria', note: 'Approximate naira figures.' },
    ],
  },

  // ═══════════════ PRIVATE CANDIDATE: KENYA ═══════════════
  'private-candidate-igcse-kenya': {
    cat: 'igcse', country: 'kenya',
    img: 'linear-gradient(135deg,#0A1A10,#C9973A)', splash: IMG_EXAM, splashAlt: 'A Kenyan student preparing for IGCSE exams',
    t: 'Private Candidate IGCSE and A Level in Kenya: How to Register',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Private Candidate IGCSE in Kenya: How to Register',
    metaDesc: 'How homeschooled and online school students in Kenya register for Cambridge and Edexcel IGCSE and A Level as private candidates.',
    intro: "If your child learns at home or with an online school in Kenya, they can still sit Cambridge and Pearson Edexcel IGCSE and A Level exams. They do it as private candidates, entering through an authorised exam centre rather than through their own school. The British Council in Kenya is the best known centre for private candidates, and some schools also accept external entries. This guide explains how the process generally works, the deadlines to watch, the costs and how we help. Specifics change every series, so always check the centre’s own pages before you act.",
    sections: [
      { h: 'What a private candidate is', p: "A private candidate is a student who enters for an exam through a centre other than a school they attend full time. Cambridge and Pearson do not let individuals enter directly; entries go through authorised centres. Private candidates sit the same papers, on the same dates, under the same rules, and receive the same certificates as school candidates. The certificate does not say the student was homeschooled." },
      { h: 'Where to register in Kenya', p: "The British Council in Kenya runs private candidate registration for Cambridge and Pearson Edexcel exams and publishes the process on its website, britishcouncil.co.ke, under exams for private candidates. Some international schools in Nairobi and other cities also accept private candidates, usually for a fee and subject to space. Ask each centre which boards, subjects and series it offers, and whether it can supervise practical or speaking components." },
      { h: 'The exam series and deadlines', p: "Cambridge runs two main series a year for most IGCSE and A Level subjects: May/June and October/November. Pearson Edexcel International GCSE and International A Level have their own series. Each centre sets a registration window, and closing dates come months before the exams. For the May/June 2026 series, for example, the British Council Kenya private candidate page listed a closing date in mid-February, with later registration possible for a penalty fee. Dates for 2027 will be published by the centre; check them as soon as you know which series your child will sit." },
      { h: 'Costs', p: "Entry fees are charged per subject by the centre, and are separate from any school or tuition fees. Late entries cost more. The British Council in Kenya has also stated that payments must include an additional fee per candidate to cover the KNEC fee, and that applications without it may be rejected, so check the current amount on its page. Budget for each subject your child will sit, plus any practical or speaking component arrangements and travel to the centre." },
      { h: 'Practicals, coursework and speaking', p: "Some subjects include components that a private candidate may find harder to arrange. Science subjects often offer an Alternative to Practical paper that does not need a lab. Some language and English subjects include speaking tests, and a few subjects include coursework that must be supervised and marked by a centre. Before choosing subjects, check with the centre which components it can offer to private candidates. We plan subject choices with this in mind." },
      { h: 'Step by step', p: "One: choose the board, subjects and series with your child’s teachers, a year or more ahead for IGCSE. Two: check the centre’s list of subjects and components available to private candidates. Three: gather identity documents, usually a birth certificate or passport, and passport photos if required. Four: register within the normal window and pay the fees, including any KNEC fee. Five: check the statement of entry carefully when it arrives, including the spelling of your child’s name, which will appear on the certificate. Six: collect the timetable and candidate number and plan travel to the centre. Seven: results are released on the board’s published results days, and certificates follow later through the centre." },
      { h: 'How Smartious helps', p: "Our teachers prepare students for the specific syllabus and components they will sit, set mock exams under timed conditions and track progress against grade boundaries. We help families choose subjects, plan which series to target and prepare the information they need for registration. The registration itself is made by the family with the exam centre. Fees for teaching start from USD 423 a month for Primary, payable termly, and vary by curriculum and level; one-to-one exam preparation is USD 15 an hour." },
      { h: "Choosing between Cambridge and Pearson Edexcel", p: "Both boards are widely accepted. Cambridge IGCSE offers a very wide range of subjects, often with Core and Extended tiers, and May/June and October/November series. Pearson Edexcel International GCSE has its own series and a strong reputation in mathematics and sciences. The right choice depends on your child’s strengths, the subjects and components your centre can offer private candidates, and which series fits your plans. Mixing boards across subjects is possible, but plan the timetable carefully so that exam dates do not clash and your child is not sitting too many papers in one week." },
    ],
    faqs: [
      { q: 'Can a homeschooled child sit IGCSE in Kenya?', a: 'Yes, as a private candidate through an authorised centre such as the British Council in Kenya.' },
      { q: 'When should we register?', a: 'Early. Closing dates come months before the exams. For May/June 2026 the British Council Kenya deadline was in mid-February. Check the centre’s current dates.' },
      { q: 'Is the certificate different for private candidates?', a: 'No. Private candidates receive the same certificates as school candidates.' },
      { q: 'What about science practicals?', a: 'Many science syllabuses offer an Alternative to Practical paper. Check with the centre which components it offers to private candidates.' },
    ],
    conclusion: "Private candidate entry is routine for homeschooled students in Kenya, but the deadlines are early and the details change each series. Choose subjects with components your centre can offer, register in the normal window and check every detail on the statement of entry. To plan your child’s exams, message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Kenya',
    countryLinks: [
      { name: 'Online school in Kenya', slug: 'kenya', note: 'IGCSE and A Level taught live on East Africa Time.' },
    ],
    pageLinksHeading: 'Official pages and next steps',
    pageLinks: [
      { name: 'British Council Kenya: private candidates', href: 'https://www.britishcouncil.co.ke/exam/igcse-school/register/private', note: 'The official registration page. Check dates and fees here.' },
      { name: 'Homeschool in Nairobi', href: '/homeschool-nairobi', note: 'Live online schooling for Nairobi families.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Is Homeschooling Legal in Kenya?', slug: 'is-homeschooling-legal-in-kenya', note: 'A careful look at the law.' },
      { name: 'Cost of Homeschooling in Kenya', slug: 'homeschool-fees-kenya', note: 'KSh per term and per month.' },
      { name: 'January 2027 Intake: Kenya', slug: 'january-2027-intake-kenya', note: 'Start on 5 January 2027.' },
    ],
  },

  // ═══════════════ PRIVATE CANDIDATE: NIGERIA ═══════════════
  'private-candidate-igcse-nigeria': {
    cat: 'igcse', country: 'nigeria',
    img: 'linear-gradient(135deg,#0A1A0F,#C9973A)', splash: IMG_EXAM, splashAlt: 'A Nigerian student preparing for IGCSE exams',
    t: 'Private Candidate IGCSE and A Level in Nigeria: How to Register',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Private Candidate IGCSE in Nigeria: How to Register',
    metaDesc: 'How homeschooled and online school students in Nigeria register for Cambridge and Edexcel IGCSE and A Level as private candidates.',
    intro: "Homeschooled and online school students in Nigeria sit Cambridge and Pearson Edexcel IGCSE and A Level exams as private candidates, entering through an authorised centre. The British Council in Nigeria has long run private candidate sittings in cities including Lagos, Abuja, Port Harcourt and Kano, and some schools accept external candidates too. This guide explains how the process generally works, the deadlines and fees to plan for, and how we help. The details change each series, so always check the centre’s own pages before you act.",
    sections: [
      { h: 'What a private candidate is', p: "A private candidate enters for an exam through a centre other than a school they attend full time. Individuals cannot enter Cambridge or Pearson exams directly. Private candidates sit the same papers on the same dates and receive the same certificates as school candidates." },
      { h: 'Where to register in Nigeria', p: "The British Council in Nigeria publishes private candidate guides and fee lists for each series on britishcouncil.org.ng. Its guides have described registering online through its school exams portal, selecting the board, qualification and venue, and paying the quoted amount. Some schools in Lagos, Abuja and Port Harcourt also accept private candidates. Ask each centre which boards, subjects, series and components it offers to private candidates." },
      { h: 'Series and deadlines', p: "Cambridge runs May/June and October/November series for most IGCSE and A Level subjects, and Pearson Edexcel has its own series. Registration closes months before the exams. For the October/November 2026 Cambridge series, for example, the British Council Nigeria fee list showed a normal registration period from late June to early August 2026, followed by a late period with higher fees. Dates for 2027 will be published by the centre. Check them as soon as you know your child’s series." },
      { h: 'Fees in naira', p: "The British Council Nigeria publishes fees per subject in naira for each series, with higher amounts for late entries. Because entry fees are per subject, a student taking eight IGCSEs pays eight entries, so build that into your budget early. The naira fluctuates, and fee lists are updated each series, so use the current list rather than last year’s. Entry fees are separate from teaching fees." },
      { h: 'Practicals, coursework and speaking', p: "Some subject components are harder for private candidates to arrange. Many science syllabuses offer an Alternative to Practical paper. Speaking tests and coursework need a centre that can supervise them. Check with the centre which components are available before choosing subjects, and plan choices with your child’s teachers." },
      { h: 'Step by step', p: "One: choose the board, subjects and series with your child’s teachers, ideally a year ahead. Two: check which subjects and components the centre offers to private candidates. Three: prepare identity documents and photos as required. Four: register and pay within the normal window. Five: check the statement of entry, especially the spelling of your child’s name. Six: note the timetable, candidate number and venue, and plan travel, including traffic in Lagos on exam mornings. Seven: results come out on the board’s published days, and certificates follow through the centre." },
      { h: 'IGCSE alongside WAEC', p: "Some Nigerian families have their child sit IGCSE and A Level for options abroad and also WAEC’s WASSCE or NECO as a private candidate for Nigerian university entry. If you plan to do both, map the dates early, because series can overlap, and confirm with your target universities and JAMB how each result is treated." },
      { h: 'How Smartious helps', p: "Our teachers prepare students for the exact syllabus and components they will sit, run timed mock exams and track progress. We help families choose subjects and series and prepare the information they need for registration; the registration itself is made by the family with the centre. Teaching fees start from USD 423 a month for Primary, payable termly, and vary by curriculum and level. One-to-one exam preparation is USD 15 an hour, roughly NGN 23,000 at about NGN 1,550 to the dollar (approximate, October 2026; the naira fluctuates)." },
      { h: "Choosing between Cambridge and Pearson Edexcel", p: "Both boards are widely accepted by universities in Nigeria and abroad. Cambridge IGCSE offers a wide range of subjects with Core and Extended tiers in many of them. Pearson Edexcel International GCSE has its own series and is popular for mathematics and sciences. Choose based on your child’s strengths, the subjects and components your centre can offer and which series fits your plans. Mixing boards is possible, but check that exam dates do not clash." },
      { h: "Exam day in practice", p: "Arrive early with the candidate’s identity document and statement of entry, and allow extra time for traffic. Check the centre’s rules on what may be brought into the hall, including calculators and water. Make sure your child knows the timetable for the whole series, including morning and afternoon sessions, so there are no surprises." },
    ],
    faqs: [
      { q: 'Can a homeschooled child sit IGCSE in Nigeria?', a: 'Yes, as a private candidate through an authorised centre such as the British Council in Nigeria.' },
      { q: 'Where are the exams held?', a: 'The British Council has run private candidate sittings in cities including Lagos, Abuja, Port Harcourt and Kano. Check the current venues on its site.' },
      { q: 'How much are IGCSE fees in Nigeria?', a: 'Fees are per subject and published in naira by the centre for each series. Late entries cost more. Use the current fee list.' },
      { q: 'Can my child sit IGCSE and WAEC?', a: 'Yes. Map the dates early and check how universities treat each result.' },
    ],
    conclusion: "Private candidate entry works well in Nigeria if you plan ahead: choose subjects your centre can support, register in the normal window and budget per subject in naira. To plan your child’s exams, message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Nigeria',
    countryLinks: [
      { name: 'Online school in Nigeria', slug: 'nigeria', note: 'IGCSE and A Level taught live on a WAT timetable.' },
    ],
    pageLinksHeading: 'Official pages and next steps',
    pageLinks: [
      { name: 'British Council Nigeria: exams', href: 'https://www.britishcouncil.org.ng/exam', note: 'Official private candidate guides, fees and dates.' },
      { name: 'Homeschool in Lagos', href: '/homeschool-lagos-ng', note: 'Live online schooling for Lagos families.' },
      { name: 'Homeschool in Abuja', href: '/homeschool-abuja-ng', note: 'For families in the FCT.' },
      { name: 'Homeschool in Port Harcourt', href: '/homeschool-port-harcourt-ng', note: 'For families in Rivers State.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'IGCSE vs WAEC', slug: 'igcse-vs-waec', note: 'Choosing an exam route.' },
      { name: 'Online School Fees in Nigeria', slug: 'online-school-fees-nigeria', note: 'Approximate naira figures.' },
      { name: 'January 2027 Intake: Nigeria', slug: 'january-2027-intake-nigeria', note: 'Start on 5 January 2027.' },
    ],
  },

  // ═══════════════ EXAM CENTRES: GULF ═══════════════
  'igcse-exam-centres-gulf': {
    cat: 'igcse', country: 'uae',
    img: 'linear-gradient(135deg,#0A1020,#C9973A)', splash: IMG_EXAM, splashAlt: 'An exam hall prepared for IGCSE papers',
    t: 'IGCSE and A Level Exam Centres in the Gulf for Private Candidates',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'IGCSE Exam Centres in the Gulf: Private Candidates',
    metaDesc: 'How homeschoolers in the UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain register for IGCSE and A Level as private candidates.',
    intro: "Families across the Gulf who homeschool or use an online school can still sit Cambridge and Pearson Edexcel IGCSE and A Level exams. They do it as private candidates, entering through an authorised centre such as the British Council or a school that accepts external candidates. The process is similar in the UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain, but centres, fees and dates differ by country. This guide explains the common steps, the differences to watch and how to plan. Always check the centre’s own pages for current details.",
    sections: [
      { h: 'How private candidate entry works', p: "Cambridge and Pearson do not accept entries from individuals. Entries go through authorised centres, which register the candidate, collect fees, host the exams and pass on results and certificates. Private candidates sit the same papers on the same dates as school candidates and receive the same certificates. In the Gulf, the British Council runs exam services in several countries, and many international schools are authorised centres that may accept external candidates when they have space." },
      { h: 'Finding a centre in your country', p: "Start with the British Council website for your country, which you can find from britishcouncil.org, and look for school exams or private candidates. In the UAE, Saudi Arabia and Qatar the British Council has run exam services for private candidates. Cambridge also publishes a search for its centres on cambridgeinternational.org, and Pearson has a centre search on qualifications.pearson.com, but not every centre accepts private candidates, so contact them directly. In smaller markets, you may find that only one or two centres accept external candidates for a given series." },
      { h: 'Deadlines', p: "Cambridge runs May/June and October/November series for most subjects, and in some Gulf countries a February/March series is also available for certain subjects. Pearson Edexcel International GCSE and International A Level have their own series. Centres set registration windows that close months before the exams, with late fees afterwards. Plan to register as soon as the centre opens entries for your series, and do not assume this year’s dates match last year’s." },
      { h: 'Fees and currency', p: "Fees are charged per subject by the centre, usually in local currency, and late entries cost more. For context, the Gulf currencies are pegged or managed against the dollar: AED 3.6725, SAR 3.75, QAR 3.64, BHD 0.376 and OMR 0.385 per dollar, with the Kuwaiti dinar at about KWD 0.307 (approximate, October 2026). Entry fees are separate from school or tuition fees. Ask the centre for its current fee list." },
      { h: 'Practicals, speaking and coursework', p: "Science subjects often offer an Alternative to Practical paper suitable for private candidates. Language subjects may include speaking tests, and some subjects include coursework that needs a centre to supervise and mark it. Some centres cannot offer these components to external candidates. Check before you choose subjects, and plan choices with your child’s teachers." },
      { h: 'Thinking ahead to equivalency', p: "If your child may study at a Gulf university or return to a Gulf school, check the equivalency rules early. In the UAE the Ministry of Education sets certificate equivalency rules for British curriculum qualifications, including a number of IGCSE and AS or A Level passes, and in Saudi Arabia and Qatar the ministries run their own equivalency services. Requirements on Arabic and Islamic studies may apply to some students. Confirm with the ministry and with the institution what they need, including whether they accept results gained as a private candidate." },
      { h: 'Step by step', p: "One: choose board, subjects and series with your child’s teachers, a year or more ahead. Two: find centres in your country that accept private candidates, and check which components they offer. Three: prepare identity documents, usually passport and residence ID. Four: register and pay in the normal window. Five: check the statement of entry, especially your child’s name as it should appear on the certificate. Six: note the timetable and venue. Seven: collect results on the board’s results day and certificates through the centre later." },
      { h: 'How Smartious helps', p: "We teach Cambridge and Pearson Edexcel IGCSE and A Level live on Gulf time and prepare students for the specific papers and components they will sit, with timed mocks and feedback. We help families plan subjects and series and prepare for registration, which the family completes with the centre. Fees start from USD 423 a month for Primary, payable termly, and vary by curriculum and level; one-to-one exam preparation is USD 15 an hour." },
      { h: "Exam day in practice", p: "Arrive early with your child’s passport or residence ID and statement of entry. Check the centre’s rules on calculators, stationery and water, and plan for summer heat and traffic in the May/June series. Make sure your child knows the full timetable, including morning and afternoon sessions and any speaking tests scheduled on separate days." },
    ],
    faqs: [
      { q: 'Can homeschoolers sit IGCSE in the UAE or Saudi Arabia?', a: 'Yes, as private candidates through an authorised centre such as the British Council or a school that accepts external candidates.' },
      { q: 'Which centres accept private candidates?', a: 'Start with the British Council site for your country, then contact Cambridge and Pearson centres directly, because not every centre accepts external candidates.' },
      { q: 'Will a private candidate result count for equivalency?', a: 'Ask the ministry and the institution directly. Rules differ by country and may include subject counts and Arabic or Islamic studies for some students.' },
      { q: 'When should we register?', a: 'As soon as entries open for your series. Deadlines come months before the exams.' },
    ],
    conclusion: "Private candidate entry is a normal route for Gulf homeschoolers, but centres, dates and fees differ by country. Find your centre early, check its components, register in the normal window and think about equivalency from the start. Message admissions on WhatsApp at +254 745 021 212 to plan your child’s exams.",
    countryLinksHeading: 'Smartious in the Gulf',
    countryLinks: [
      { name: 'Online school in the UAE', slug: 'uae', note: 'British, IB and American pathways on Gulf time.' },
      { name: 'Online school in Saudi Arabia', slug: 'saudi-arabia', note: 'Same clock as Riyadh.' },
      { name: 'Online school in Qatar', slug: 'qatar', note: 'For families in Doha and beyond.' },
      { name: 'Online school in Kuwait', slug: 'kuwait', note: 'For families across Kuwait.' },
      { name: 'Online school in Oman', slug: 'oman', note: 'For families in Muscat and beyond.' },
      { name: 'Online school in Bahrain', slug: 'bahrain', note: 'For families across Bahrain.' },
    ],
    pageLinksHeading: 'Official pages and next steps',
    pageLinks: [
      { name: 'British Council worldwide', href: 'https://www.britishcouncil.org', note: 'Find your country office and its exam pages.' },
      { name: 'Cambridge International', href: 'https://www.cambridgeinternational.org', note: 'Exam series, syllabuses and centre search.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Is Online School Recognised in the UAE?', slug: 'online-school-recognised-uae', note: 'KHDA, ADEK and equivalency.' },
      { name: 'Saudi MOE Equivalency for IGCSE & A Level', slug: 'saudi-moe-equivalency-igcse', note: 'What to check, and where.' },
      { name: 'Returning to School After Homeschooling in the Gulf', slug: 'return-to-school-after-homeschooling-gulf', note: 'Re-enrolment and transfer.' },
    ],
  },

  // ═══════════════ CBC / CBE ONLINE: KENYA ═══════════════
  'online-cbc-school-kenya': {
    cat: 'online-school', country: 'kenya',
    img: 'linear-gradient(135deg,#0A1A10,#8B1A2E)', splash: IMG_KE, splashAlt: 'A Kenyan learner working on a CBC project at home',
    t: 'Online CBC/CBE School in Kenya (Grade 1–12)',
    date: 'October 2026 · 10 min read',
    ...AUTHOR,
    metaTitle: 'Online CBC/CBE School in Kenya (Grade 1–12)',
    metaDesc: 'Live online CBC/CBE lessons in Kenya from Grade 1 to 12, including Junior School, KJSEA and the move to Senior School pathways at Grade 10.',
    intro: "Kenya’s Competency-Based Curriculum, now usually described as Competency-Based Education, CBE, has reshaped schooling from Grade 1 to Grade 12. In January 2026 the first cohort moved into Senior School at Grade 10, choosing a pathway for the first time. Families who want their child to follow the Kenyan curriculum but learn at home ask us how online CBC/CBE works, how assessments fit and what the Senior School transition means. This guide answers those questions plainly. It also explains, carefully, what an online school can and cannot do inside a national system.",
    sections: [
      { h: 'How CBC/CBE is structured', p: "CBE is organised into Early Years Education, covering pre-primary and Lower Primary, Grades 1 to 3; Upper Primary, Grades 4 to 6; Junior School, Grades 7 to 9; and Senior School, Grades 10 to 12. The curriculum designs are developed by KICD, the Kenya Institute of Curriculum Development, and national assessments are run by KNEC, the Kenya National Examinations Council. The approach emphasises competencies such as communication, critical thinking, creativity and digital literacy, with projects and practical tasks alongside written work." },
      { h: 'Junior School and KJSEA', p: "At the end of Grade 9, learners sit the Kenya Junior School Education Assessment, KJSEA, run by KNEC. KJSEA results, together with earlier school-based assessments and the learner’s choices, inform placement into Senior School and into a pathway. If your child is learning outside a registered school, ask KNEC how they would be registered for KJSEA and other national assessments, because entries are made through assessment centres." },
      { h: 'Senior School at Grade 10: the pathways', p: "Senior School introduces three pathways: STEM; Social Sciences; and Arts and Sports Science. Learners take core subjects, including English, Kiswahili or Kenyan Sign Language, mathematics and community service learning, plus electives linked to their pathway. The Ministry has described core mathematics for STEM learners and essential mathematics for other pathways. The first Grade 10 learners reported to Senior School in January 2026. For families, the key decision is the pathway, because it shapes subject choices for the next three years and, later, university and career options." },
      { h: 'What online CBC/CBE looks like with Smartious', p: "Our CBC/CBE students join live lessons with qualified teachers on East Africa Time, following the KICD curriculum designs for their grade. Teachers set projects and practical tasks that can be done at home, give feedback against the competencies, and write regular reports. Younger learners have shorter lessons with more activity and need a parent or carer nearby. Junior School learners follow a fuller timetable across the learning areas. For Grade 10 and above, we discuss pathway and subject choices with each family before placement." },
      { h: 'Practical learning at home', p: "CBE expects learners to do things, not only read about them: experiments, models, community projects, agriculture, art, music and sport. At home, that means planning. We set tasks that use everyday materials and the local environment, and we encourage families to add clubs, sport and community activities. Parents of younger learners often find this the most enjoyable part, because it brings learning into daily life." },
      { h: 'Switching between CBE and Cambridge', p: "Some families start with CBE and later move to Cambridge IGCSE, or the other way round, often because of a planned move abroad or a university goal. The systems differ in structure and assessment, so a switch is easiest at natural transition points, such as the start of Junior School or Senior School, or before starting IGCSE. Our placement assessment checks your child’s level so they are placed correctly in the new system. Plan any switch with future exams and admissions in mind." },
      { h: 'A careful note on recognition', p: "We teach the Kenyan curriculum online; we do not claim approval from KICD, KNEC or the Ministry of Education. National assessments are run by KNEC through registered assessment centres, and the legal position of home education in Kenya is not straightforward. Before you choose an online CBC/CBE route, read our guide on whether homeschooling is legal in Kenya, check with KNEC how your child would sit KJSEA and later national assessments, and keep good records." },
      { h: 'Fees and joining', p: "Fees start from USD 423 a month for Primary, payable termly, about KSh 54,600 at roughly KSh 129 to the dollar (approximate, October 2026). Fees vary by curriculum and level. One-to-one tuition is USD 15 an hour. Fees are non-refundable once the assessment is done, the timetable has been created and lessons have started. Our next intake is Term 2, starting on 5 January 2027; apply by December." },
      { h: "Choosing a Senior School pathway", p: "Choosing a pathway is a big decision for a fifteen year old. Start with your child’s interests and strengths across Junior School, not only their test scores. Look at what each pathway leads to: STEM for engineering, medicine and technology; Social Sciences for law, business, humanities and languages; Arts and Sports Science for creative, performance and sports careers. Check the subject requirements of courses your child may want later. Talk to teachers, and give your child time to think. A good pathway choice is one your child understands and owns." },
    ],
    faqs: [
      { q: 'Do you teach CBC/CBE online?', a: 'Yes, from Grade 1 to Grade 12, live on East Africa Time, following the KICD curriculum designs.' },
      { q: 'How will my child sit KJSEA?', a: 'KJSEA is run by KNEC through assessment centres. Ask KNEC how a learner outside a registered school would be registered.' },
      { q: 'What are the Senior School pathways?', a: 'STEM; Social Sciences; and Arts and Sports Science, each with core subjects and pathway electives.' },
      { q: 'Can my child switch to Cambridge later?', a: 'Yes. A switch is easiest at a transition point. Our placement assessment helps place your child correctly.' },
    ],
    conclusion: "Online CBC/CBE lets Kenyan families keep their child in the national curriculum while learning at home with qualified teachers. Think early about national assessments and the Senior School pathway, and keep records as you go. To talk it through, message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Kenya',
    countryLinks: [
      { name: 'Online school in Kenya', slug: 'kenya', note: 'CBC/CBE, Cambridge and Edexcel on East Africa Time.' },
    ],
    pageLinksHeading: 'Kenyan pages and next steps',
    pageLinks: [
      { name: 'Homeschool in Nairobi', href: '/homeschool-nairobi', note: 'Live online schooling for Nairobi families.' },
      { name: 'KICD', href: 'https://kicd.ac.ke', note: 'Official curriculum designs.' },
      { name: 'KNEC', href: 'https://www.knec.ac.ke', note: 'Official national assessments.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Is Homeschooling Legal in Kenya?', slug: 'is-homeschooling-legal-in-kenya', note: 'A careful look at the law.' },
      { name: 'January 2027 Intake: Kenya', slug: 'january-2027-intake-kenya', note: 'Start on 5 January 2027.' },
      { name: 'Cost of Homeschooling in Kenya', slug: 'homeschool-fees-kenya', note: 'KSh per term and per month.' },
    ],
  },

  // ═══════════════ RECOGNITION: UAE ═══════════════
  'online-school-recognised-uae': {
    cat: 'online-school', country: 'uae',
    img: 'linear-gradient(135deg,#0A1020,#8B1A2E)', splash: IMG_GULF, splashAlt: 'A parent in Dubai checking education regulations online',
    t: 'Is Online School Recognised in the UAE? KHDA, ADEK & Equivalency',
    date: 'October 2026 · 10 min read',
    ...AUTHOR,
    metaTitle: 'Is Online School Recognised in the UAE?',
    metaDesc: 'KHDA, ADEK and UAE Ministry of Education equivalency explained for online school and homeschooling families, and what to check before enrolling.',
    intro: "This is the most important question for UAE families considering online school, and it is also the one most often answered loosely. The careful answer has three parts. First, who regulates schools in the UAE. Second, what the authorities have said about homeschooling and distance learning. Third, how qualifications are recognised through Ministry of Education equivalency. Smartious does not claim approval or licensing from KHDA, ADEK or the Ministry of Education, and we think every provider should be equally clear about its own position. This guide is general information; check your situation with the authorities.",
    sections: [
      { h: 'Who regulates schools in the UAE', p: "Private schools in Dubai are regulated by the Knowledge and Human Development Authority, KHDA, khda.gov.ae. In Abu Dhabi, private schools are regulated by the Abu Dhabi Department of Education and Knowledge, ADEK, adek.gov.ae. In the other emirates, the federal Ministry of Education, moe.gov.ae, oversees schools, working with local bodies such as Sharjah’s education authority. These bodies license schools that operate in their emirate. An online school based outside the UAE is not a licensed UAE school simply because UAE students attend it." },
      { h: 'What has been said about homeschooling', p: "KHDA has stated publicly that it does not recognise homeschooling programmes, and has pointed families interested in alternatives to its own schemes for students enrolled in Dubai private schools. Press reports have also said that homeschooling is not prohibited for expatriate families, and many expat families have homeschooled in the UAE for years. The Ministry of Education has offered its own home-schooling route for certain students within the national system. These statements are not the same as approval, and they can change. Check the current position directly with KHDA, ADEK or the Ministry." },
      { h: 'Why the qualification matters most', p: "For most expat families, the practical question is not whether an online school is licensed in the UAE, but whether the qualifications their child earns will be accepted later. That is where equivalency comes in. A student who follows the British route and sits Cambridge or Pearson Edexcel exams as a private candidate at an authorised centre, such as the British Council in the UAE, earns the same certificates as a school candidate. Whether those certificates meet UAE equivalency rules is decided by the Ministry, not by the school that taught the student." },
      { h: 'Ministry of Education equivalency', p: "The UAE Ministry of Education publishes a guide to academic certificate equivalency on moe.gov.ae. For British curriculum qualifications, its guide for private schools has set out conditions for Grade 12 equivalency including completing 12 years of schooling, passing five subjects at IGCSE or GCSE and two at AS Level or one at A Level, with Arabic and Islamic Education not counted towards those totals. The guide also requires that the certificate qualifies the student for university admission in the issuing country. These rules are updated, so read the current guide and contact the Ministry before your child chooses subjects." },
      { h: 'Returning to a UAE school', p: "If your child may move back into a UAE school, the school will usually want reports, attendance records and a transfer certificate where one exists, and may run its own placement test. Students coming from outside the UAE system may also need equivalency for their previous grades, and Arabic and Islamic Education requirements can apply to some students. Ask the school you hope to join exactly what it will need, ideally before you leave its system or start online school. Our guide on returning to school after homeschooling in the Gulf goes through this." },
      { h: 'University entry in the UAE', p: "UAE universities set their own admission requirements on top of Ministry equivalency. Many publish requirements for British curriculum applicants, typically a number of IGCSE passes and AS or A Level passes, plus English requirements. Check each university’s admissions page, and ask directly whether they accept results gained as a private candidate and what documents they need." },
      { h: 'Questions to ask any online school', p: "Ask: where are you registered, and by whom? Do you claim any approval in the UAE, and can you show it? Which exam boards do your students sit, and where? Do you help with private candidate registration? Have your students obtained Ministry equivalency, and what did they need? And what documents will you provide: reports, attendance records, transcripts? A provider that answers these clearly, including saying what it is not, is one you can plan with." },
    ],
    faqs: [
      { q: 'Is online school recognised in the UAE?', a: 'Online schools based outside the UAE are not licensed UAE schools. What matters for most families is whether qualifications such as IGCSE and A Level meet Ministry of Education equivalency rules. Check moe.gov.ae.' },
      { q: 'Is Smartious approved by KHDA or ADEK?', a: 'No. Smartious does not claim approval or licensing from KHDA, ADEK or the UAE Ministry of Education.' },
      { q: 'Is homeschooling legal in Dubai?', a: 'KHDA has said it does not recognise homeschooling programmes, and press reports say it is not prohibited for expatriate families. Check the current position with KHDA.' },
      { q: 'What does equivalency need for British qualifications?', a: 'The Ministry’s guide has listed conditions including five IGCSE or GCSE passes and two AS or one A Level, excluding Arabic and Islamic Education. Read the current guide on moe.gov.ae.' },
    ],
    conclusion: "Recognition in the UAE is about qualifications and equivalency more than about which online school taught your child. Choose an externally examined route, check the Ministry’s current rules, and ask any school or university your child may join what it needs. To talk through a plan, message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in the UAE',
    countryLinks: [
      { name: 'Online school in the UAE', slug: 'uae', note: 'Our main page for UAE families.' },
    ],
    pageLinksHeading: 'Official sites and next steps',
    pageLinks: [
      { name: 'KHDA (Dubai)', href: 'https://www.khda.gov.ae', note: 'Regulator of private schools in Dubai.' },
      { name: 'ADEK (Abu Dhabi)', href: 'https://www.adek.gov.ae', note: 'Regulator of private schools in Abu Dhabi.' },
      { name: 'UAE Ministry of Education', href: 'https://www.moe.gov.ae', note: 'Certificate equivalency guides and services.' },
      { name: 'Homeschool in Dubai', href: '/homeschool-dubai-ae', note: 'Live online schooling for Dubai families.' },
      { name: 'Homeschool in Abu Dhabi', href: '/homeschool-abu-dhabi-ae', note: 'For families in the capital.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Homeschooling in UAE Fees', slug: 'online-school-fees-uae', note: 'AED figures explained.' },
      { name: 'IGCSE Exam Centres in the Gulf', slug: 'igcse-exam-centres-gulf', note: 'Registering as a private candidate.' },
      { name: 'Returning to School After Homeschooling in the Gulf', slug: 'return-to-school-after-homeschooling-gulf', note: 'Re-enrolment and transfer.' },
    ],
  },

  // ═══════════════ EQUIVALENCY: SAUDI ═══════════════
  'saudi-moe-equivalency-igcse': {
    cat: 'igcse', country: 'saudi-arabia',
    img: 'linear-gradient(135deg,#06140C,#8B1A2E)', splash: IMG_GULF, splashAlt: 'A student in Saudi Arabia reviewing IGCSE certificates',
    t: 'Saudi MOE Equivalency for Online IGCSE & A Level',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Saudi MOE Equivalency for Online IGCSE & A Level',
    metaDesc: 'How Saudi Ministry of Education equivalency works for IGCSE and A Level earned through online school, what universities ask for and what to check.',
    intro: "Families in Saudi Arabia who choose an online British curriculum want to know whether IGCSE and A Level results will count in the Kingdom. In most cases the answer runs through Ministry of Education equivalency and the admission rules of each university. This guide explains how that generally works, what universities commonly ask for and the questions to settle before your child chooses subjects. Smartious does not claim approval or licensing from the Saudi Ministry of Education. Requirements change, so confirm everything on moe.gov.sa and with the institution concerned.",
    sections: [
      { h: 'What equivalency is', p: "Equivalency, sometimes called muadala, is the Ministry of Education’s process for confirming that a secondary certificate from another system is equivalent to the Saudi general secondary certificate, or to a particular grade. Universities and some employers and scholarship bodies ask for it. The Ministry runs the service, and the current procedure, documents and any fees are published on its official channels. Check moe.gov.sa for the current process." },
      { h: 'IGCSE and A Level in the Saudi context', p: "IGCSE and A Level are widely taught in international schools in Saudi Arabia, and Saudi universities are familiar with them. University requirements for British curriculum applicants commonly combine a number of IGCSE or O Level passes with AS or A Level passes, often with minimum grades and subject requirements. Some universities accept a stamped original certificate; others ask for a Ministry letter confirming equivalence. Requirements differ between institutions, so check each university’s admissions page." },
      { h: 'National tests', p: "Many Saudi universities also ask applicants to sit national tests run by the Education and Training Evaluation Commission, such as the General Aptitude Test, often called Qudurat, and the achievement test, Tahsili. Requirements for students with foreign certificates vary. Check the Commission’s site, etec.gov.sa, and the university’s rules." },
      { h: 'Private candidate results', p: "Students who learn online sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres such as the British Council in Saudi Arabia. They receive the same certificates as school candidates. Even so, ask the Ministry and your target universities directly whether they have any additional requirements for applicants who did not attend a licensed school in the Kingdom, such as school records, attendance documents or attested transcripts. Settle this early rather than in the final year." },
      { h: 'Arabic and Islamic studies', p: "For some students, particularly Saudi nationals and in some cases Arab or Muslim students, requirements on Arabic language and Islamic studies may apply for equivalency or admission. These rules differ by nationality and institution. If they may apply to your child, raise them with the Ministry and with us before choosing subjects, so the timetable can include what is needed." },
      { h: 'Choosing subjects with equivalency in mind', p: "Work backwards from the destination. List the universities and courses your child may apply to. Note their IGCSE and A Level requirements, including required subjects such as mathematics or sciences for STEM courses. Check how many subjects the Ministry and the university count, and which subjects they exclude. Then plan IGCSE and A Level choices that meet every requirement with a margin. Keep every certificate, statement of results and report safely, and in the formats you may need to attest." },
      { h: 'Documents to keep', p: "Keep original certificates and statements of results, passports and residence documents, reports and transcripts from every school or online school your child has attended, and any previous equivalency letters. Some processes ask for documents to be attested by the issuing country’s authorities and the Saudi embassy there, so ask early whether this applies." },
      { h: 'How Smartious helps', p: "We teach Cambridge and Pearson Edexcel IGCSE and A Level live on the same clock as Riyadh, help families plan subjects with equivalency and admission in mind, and provide reports and records of study. We cannot apply for equivalency on your behalf or promise an outcome. Fees start from USD 423 a month for Primary, about SAR 1,586 at the pegged SAR 3.75 rate (October 2026), payable termly, and vary by curriculum and level." },
      { h: "A planning timeline", p: "In the year before IGCSE begins, list target universities and their requirements and confirm the Ministry’s current equivalency rules. During IGCSE, choose subjects that meet those rules with a margin, and register for exams on time. Before AS and A Level, check required subjects for the courses your child is considering. In the final year, prepare documents, attestations and any national tests, and apply for equivalency as the Ministry’s process requires. Keep copies of everything at each stage." },
      { h: "Common mistakes to avoid", p: "The mistakes we see most are avoidable. Choosing too few IGCSE subjects, or subjects that a university or the Ministry does not count. Leaving equivalency questions to the final year. Losing original certificates or reports from earlier schools. Assuming that one university’s rules apply to another. And registering late for exams, which adds fees and stress. A short checklist reviewed each year prevents almost all of them." },
    ],
    faqs: [
      { q: 'Does the Saudi Ministry of Education accept IGCSE and A Level?', a: 'British curriculum qualifications are widely known in the Kingdom, and the Ministry runs an equivalency service. Requirements and procedures change, so check moe.gov.sa and your target universities.' },
      { q: 'Is Smartious approved by the Saudi Ministry of Education?', a: 'No. Smartious does not claim Ministry approval or licensing.' },
      { q: 'Do universities need Qudurat and Tahsili?', a: 'Many do. Check etec.gov.sa and the university’s own rules for applicants with foreign certificates.' },
      { q: 'Do private candidate results count?', a: 'The certificates are the same as for school candidates, but ask the Ministry and university whether they need any extra documents.' },
    ],
    conclusion: "Equivalency is manageable if you plan from the destination backwards: know what the Ministry and your universities require, choose subjects to meet it with a margin, and keep every document. To plan your child’s route, message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Saudi Arabia',
    countryLinks: [
      { name: 'Online school in Saudi Arabia', slug: 'saudi-arabia', note: 'IGCSE and A Level on the same clock as Riyadh.' },
    ],
    pageLinksHeading: 'Official sites and next steps',
    pageLinks: [
      { name: 'Saudi Ministry of Education', href: 'https://moe.gov.sa', note: 'Official equivalency information and services.' },
      { name: 'Education and Training Evaluation Commission', href: 'https://etec.gov.sa', note: 'Qudurat and Tahsili tests.' },
      { name: 'Homeschool in Riyadh', href: '/homeschool-riyadh-sa', note: 'Live online schooling for Riyadh families.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Online School Fees in Saudi Arabia', slug: 'online-school-fees-saudi-arabia', note: 'SAR figures explained.' },
      { name: 'IGCSE Exam Centres in the Gulf', slug: 'igcse-exam-centres-gulf', note: 'Registering as a private candidate.' },
      { name: 'Returning to School After Homeschooling in the Gulf', slug: 'return-to-school-after-homeschooling-gulf', note: 'Re-enrolment and transfer.' },
    ],
  },

  // ═══════════════ RETURN TO SCHOOL: GULF ═══════════════
  'return-to-school-after-homeschooling-gulf': {
    cat: 'homeschool', country: 'uae',
    img: 'linear-gradient(135deg,#0A1020,#1E2F5F)', splash: IMG_GULF, splashAlt: 'A child arriving at a school gate in the Gulf',
    t: 'Returning to School After Homeschooling in the Gulf',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Returning to School After Homeschooling in the Gulf',
    metaDesc: 'How to move a child from homeschooling or online school back into a school in the UAE, Saudi Arabia, Qatar, Kuwait, Oman or Bahrain.',
    intro: "Many Gulf families use homeschooling or online school for a period, during a relocation, while waiting for a school place, through the IGCSE years or because a child needed a break from a school setting, and then return to a school. The return goes smoothly when families plan for it from the start. This guide explains what Gulf schools commonly ask for, how grade placement and equivalency work, the documents to keep and how to prepare your child. Rules differ by country and emirate, so always confirm with the school and the relevant authority.",
    sections: [
      { h: 'Start with the end in mind', p: "The best time to plan a return to school is before you leave school. Ask the school you hope to join later what it will need to see: reports, attendance records, a transfer certificate, evidence of curriculum followed, exam results and any equivalency. Write the answers down. If you are already homeschooling, ask now. Requirements are easier to meet as you go than to reconstruct years later." },
      { h: 'Documents to keep', p: "Keep every report, transcript and record of study from each school or online school your child attends, with dates, grade or year group and curriculum. Keep exam certificates and statements of results. Keep transfer certificates from previous schools. Keep passports, residence documents and birth certificates. Some processes require documents to be attested, so ask early whether this applies. Smartious provides written reports and records of study for our students; ask us for them each term." },
      { h: 'Grade placement', p: "Gulf schools usually place children by age and by the grade they have completed, and many run their own entrance or placement assessments. A child coming from homeschooling may be asked to sit tests in English, mathematics and sometimes Arabic. If your child followed the same curriculum as the school, such as the British curriculum, placement is usually more straightforward. If they followed a different curriculum, the school will look at equivalency between grades." },
      { h: 'Equivalency in the UAE', p: "In the UAE, the Ministry of Education sets rules for the equivalency of school certificates from other systems, and private schools in Dubai and Abu Dhabi work within the frameworks of KHDA and ADEK. Students joining from outside the UAE system may need equivalency for their previous grades, particularly at higher grades, and Arabic and Islamic Education requirements can apply to some students. Check moe.gov.ae, khda.gov.ae or adek.gov.ae, and ask the school’s registrar." },
      { h: 'Saudi Arabia, Qatar, Kuwait, Oman and Bahrain', p: "In Saudi Arabia, the Ministry of Education, moe.gov.sa, runs equivalency for certificates from other systems, and schools register students through the Ministry’s systems. In Qatar, the Ministry of Education and Higher Education, edu.gov.qa, runs certificate equivalency through its online services. Kuwait, Oman and Bahrain each have a Ministry of Education that sets its own rules. In every country, ask the school what it needs and confirm with the ministry, because requirements differ by nationality, grade and curriculum." },
      { h: 'Timing the return', p: "Natural transition points make a return easier: the start of a school year, the start of a term, or the start of a new stage, such as Year 7 or Year 12. A return in the middle of the IGCSE or A Level years can be harder, because schools may follow different syllabuses or boards. If your child will return for the sixth form, plan IGCSE subjects and boards that the school can build on." },
      { h: 'Preparing your child', p: "Academically, children returning from a structured online school usually adjust quickly, because they are used to timetables, teachers and deadlines. Socially and practically, a school day is different: uniforms, early starts, larger classes, break times and the noise of a campus. Visit the school together, talk about routines, and keep up friendships and activities. Children who have kept regular contact with other children through clubs and sport settle fastest." },
      { h: 'How Smartious helps', p: "We provide termly reports and records of study, follow recognised curricula with external exams, and can write a summary of a student’s programme and level for a receiving school. We cannot guarantee any school’s placement decision or any ministry’s equivalency outcome. Fees start from USD 423 a month for Primary, payable termly, and vary by curriculum and level." },
      { h: "Questions to ask the receiving school", p: "Ask: which documents do you need, and do any need attestation? Will my child sit an entrance or placement test, and in which subjects? Which grade or year group would they join, and how do you decide? Do you need Ministry equivalency for previous grades? Are there Arabic or Islamic Education requirements for my child? Which exam boards and syllabuses do you follow for IGCSE and A Level? And when do applications open for the year or term we want? Write the answers down and keep them with your child’s records." },
    ],
    faqs: [
      { q: 'Can my child go back to school after homeschooling in the Gulf?', a: 'Yes. Schools usually ask for reports, records and sometimes equivalency and placement tests. Ask the school what it needs and confirm with the ministry.' },
      { q: 'Will my child have to repeat a year?', a: 'Not necessarily. Placement depends on age, grade completed, curriculum and the school’s own assessment.' },
      { q: 'What documents should we keep?', a: 'Reports, transcripts, records of study, exam certificates, transfer certificates and identity documents, with attestations if needed.' },
      { q: 'When is the best time to return?', a: 'At a natural transition point, such as the start of a school year or a new stage.' },
    ],
    conclusion: "A return to school is straightforward when you plan for it from the start: keep records, follow a recognised curriculum, check what the receiving school and ministry need, and time the move well. To talk through your plan, message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in the Gulf',
    countryLinks: [
      { name: 'Online school in the UAE', slug: 'uae', note: 'For families across the emirates.' },
      { name: 'Online school in Saudi Arabia', slug: 'saudi-arabia', note: 'Same clock as Riyadh.' },
      { name: 'Online school in Qatar', slug: 'qatar', note: 'For families in Doha and beyond.' },
      { name: 'Online school in Kuwait', slug: 'kuwait', note: 'For families across Kuwait.' },
      { name: 'Online school in Oman', slug: 'oman', note: 'For families in Muscat and beyond.' },
      { name: 'Online school in Bahrain', slug: 'bahrain', note: 'For families across Bahrain.' },
    ],
    pageLinksHeading: 'Official sites and next steps',
    pageLinks: [
      { name: 'UAE Ministry of Education', href: 'https://www.moe.gov.ae', note: 'Equivalency in the UAE.' },
      { name: 'Saudi Ministry of Education', href: 'https://moe.gov.sa', note: 'Equivalency in Saudi Arabia.' },
      { name: 'Qatar MOEHE', href: 'https://www.edu.gov.qa', note: 'Equivalency in Qatar.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Is Online School Recognised in the UAE?', slug: 'online-school-recognised-uae', note: 'KHDA, ADEK and equivalency.' },
      { name: 'Saudi MOE Equivalency for IGCSE & A Level', slug: 'saudi-moe-equivalency-igcse', note: 'What to check, and where.' },
      { name: 'IGCSE Exam Centres in the Gulf', slug: 'igcse-exam-centres-gulf', note: 'Registering as a private candidate.' },
    ],
  },
}
