/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════
// ARTICLES PART 11 — DIASPORA, EAST AFRICA, GULF STATES AND NIGERIAN
// CITY GUIDES (Oct 2026)
//
// • Diaspora guides (Indian, Pakistani, Filipino families in the Gulf)
//   are practical and respectful: home-country exam and equivalence
//   routes, no stereotypes.
// • Country guides fill the gap for Uganda, Tanzania, Rwanda, Qatar,
//   Kuwait, Oman and Bahrain.
// • Lagos, Abuja and Port Harcourt are how-to guides that link to the
//   city pages; they do not duplicate them.
//
// ACCURACY RULES: fees from USD 423/month for Primary, payable termly,
// varying by curriculum and level; tuition USD 15/hour; local figures
// approximate with the month (October 2026). No approval or licensing
// claims. Students sit Cambridge and Pearson Edexcel exams as private
// candidates at authorised centres such as the British Council.
// ═══════════════════════════════════════════════════════════════════

const WA = 'https://wa.me/254745021212'
const AUTHOR = { author: 'Alfred Ouko', role: 'Founder' }
const IMG_AFR = 'https://images.unsplash.com/photo-1577086664693-894d8405334a?w=1200&q=75'
const IMG_EA = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=75'
const IMG_GULF = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=75'
const IMG_HOME = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=75'

const FEE = 'Fees start from USD 423 a month for Primary, payable termly, and vary by curriculum and level. One-to-one tuition is USD 15 an hour. Fees are non-refundable once the assessment is done, the timetable has been created and lessons have started.'
const PRICING = { name: 'Fees and payment', href: '/pricing', note: 'From USD 423 a month for Primary, payable termly. Fees vary by curriculum and level.' }
const CONTACT = { name: 'Contact admissions', href: '/contact', note: 'Admissions +254 745 021 212 (WhatsApp), academic +254 182 071 920, hello@smartioushomeschool.com' }
const WHATSAPP = { name: 'Message admissions on WhatsApp', href: WA, note: '+254 745 021 212' }
const GULF_LINKS = [
  { name: 'Online school in the UAE', slug: 'uae', note: 'For families across the emirates.' },
  { name: 'Online school in Saudi Arabia', slug: 'saudi-arabia', note: 'Same clock as Riyadh.' },
  { name: 'Online school in Qatar', slug: 'qatar', note: 'For families in Doha and beyond.' },
  { name: 'Online school in Kuwait', slug: 'kuwait', note: 'For families across Kuwait.' },
  { name: 'Online school in Oman', slug: 'oman', note: 'For families in Muscat and beyond.' },
  { name: 'Online school in Bahrain', slug: 'bahrain', note: 'For families across Bahrain.' },
]
const GULF_READ = [
  { name: 'IGCSE Exam Centres in the Gulf', slug: 'igcse-exam-centres-gulf', note: 'Registering as a private candidate.' },
  { name: 'Returning to School After Homeschooling in the Gulf', slug: 'return-to-school-after-homeschooling-gulf', note: 'Re-enrolment and transfer.' },
  { name: 'January 2027 Intake', slug: 'january-2027-intake', note: 'Start on 5 January 2027.' },
]

export const ARTICLES_PART_11 = {

  // ═══════════════ DIASPORA: INDIAN FAMILIES ═══════════════
  'online-school-indian-families-gulf': {
    cat: 'online-school', country: 'uae',
    img: 'linear-gradient(135deg,#1A120A,#8B1A2E)', splash: IMG_HOME, splashAlt: 'A student in the Gulf studying at home with a live online teacher',
    t: 'Online School for Indian Families in the Gulf: A Practical Guide',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Online School for Indian Families in the Gulf',
    metaDesc: 'A practical guide for Indian families in the UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain: CBSE, NIOS, IGCSE and returning to India.',
    intro: "Indian families make up one of the largest communities in the Gulf, and their children study in a wide range of settings: CBSE and other Indian-curriculum schools, British and American international schools, and increasingly online and home-based options. The questions Indian parents bring to us are usually practical. Which curriculum keeps options open in India and abroad? How do exams work from the Gulf? What happens if the family returns to India? This guide answers those questions carefully, and points to the official bodies that make the decisions.",
    sections: [
      { h: 'Three common routes', p: "Most Indian families in the Gulf choose between three broad routes. The first is an Indian curriculum, most often CBSE, through a Gulf school affiliated to the board. The second is an international curriculum such as Cambridge IGCSE and A Level, Pearson Edexcel or IB. The third, for some students who learn outside a regular school, is the National Institute of Open Schooling, NIOS, which has offered study and exam centres outside India. Each route has different strengths for university in India and abroad, and families sometimes move between them at transition points." },
      { h: 'Where Smartious fits', p: "Smartious teaches the Cambridge and Pearson Edexcel British route, alongside IB and American programmes, live on Gulf time. We do not teach the CBSE curriculum or prepare students for NIOS exams. Families who come to us are usually choosing an international route, or using online school for a period such as a relocation or the IGCSE years. Students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres such as the British Council in their Gulf country." },
      { h: 'Returning to India: equivalence', p: "If your child may study at a university in India, check how Indian institutions treat foreign qualifications. The Association of Indian Universities, aiu.ac.in, publishes guidance on the equivalence of foreign qualifications, including British curriculum awards, for admission to Indian universities, and individual universities set their own conditions on subjects and grades. For national entrance tests such as those run by the National Testing Agency, nta.ac.in, check the eligibility rules for students with foreign board qualifications, including required subjects, before choosing A Level subjects." },
      { h: 'Moving between systems', p: "Moves between CBSE and the British route are common and workable, but they are easiest at natural transition points: before Year 7, before IGCSE starts in Year 10, or before AS and A Level in Year 12. The structures differ. CBSE students sit board exams in Class 10 and Class 12; British route students take IGCSE at about 16 and A Level at about 18. Our placement assessment checks your child’s level in English and mathematics, so they are placed by level rather than by label." },
      { h: 'Languages', p: "Many Indian families want their children to keep a home language such as Hindi, Malayalam, Tamil, Telugu, Urdu or Gujarati, and some Gulf countries require Arabic for certain students in schools. If languages matter for your child’s future plans, raise them early. Some international qualifications offer exams in Hindi and other languages, and community classes are widely available across the Gulf." },
      { h: 'Timetables and fees', p: "Lessons run on Gulf time. Saudi Arabia, Qatar, Kuwait and Bahrain share East Africa Time with our teachers in Nairobi; the UAE and Oman are one hour ahead. " + FEE + " In dirhams, USD 423 is about AED 1,553 at the pegged AED 3.6725 rate, and in riyals about SAR 1,586 at SAR 3.75 (approximate, October 2026)." },
      { h: 'Questions to ask before you choose', p: "Where is your child most likely to go to university: India, the Gulf or elsewhere? Which entrance tests might they need, and what do those tests require of a foreign board student? Will the family stay in the Gulf for the whole of secondary school? How would your child handle a change of system, academically and socially? Write down your answers, then check the official requirements. A choice that works backwards from the destination is far easier to live with than one made for the next year only." },
      { h: 'Keeping records', p: "Whatever route you choose, keep every report, transcript, transfer certificate and exam certificate, with dates and curriculum. Some processes in India and the Gulf require attested documents, so ask early whether attestation applies to you. Smartious provides termly reports and records of study for our students." },
      { h: "Thinking about university abroad", p: "Many Indian families in the Gulf look at universities in the UK, Canada, Australia, the United States and elsewhere, as well as in India and the Gulf. For the UK and many other countries, A Levels are the main entry qualification, with IGCSE grades used as supporting evidence. For North America, a strong transcript and, at some universities, standardised tests matter too. Check each university’s international entry requirements before choosing subjects." },
    ],
    faqs: [
      { q: 'Do you teach CBSE?', a: 'No. Smartious teaches Cambridge and Pearson Edexcel, IB and American programmes. Families wanting CBSE usually choose an affiliated school.' },
      { q: 'Will IGCSE and A Level be accepted in India?', a: 'Indian universities generally consider British curriculum qualifications through equivalence. Check guidance from the Association of Indian Universities and each university’s conditions.' },
      { q: 'Can my child sit NEET or JEE with A Levels?', a: 'Check the current eligibility rules on nta.ac.in for students with foreign board qualifications, including required subjects, before choosing A Level subjects.' },
      { q: 'What are fees in AED?', a: 'From USD 423 a month for Primary, about AED 1,553 (approximate, October 2026), payable termly.' },
    ],
    conclusion: "Indian families in the Gulf have more choice than ever. Choose the route that fits your child’s likely destination, check equivalence and entrance test rules early, and keep good records. To talk through the British route, message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in the Gulf',
    countryLinks: GULF_LINKS,
    pageLinksHeading: 'Official sites and next steps',
    pageLinks: [
      { name: 'Association of Indian Universities', href: 'https://www.aiu.ac.in', note: 'Equivalence of foreign qualifications.' },
      { name: 'National Testing Agency', href: 'https://nta.ac.in', note: 'National entrance test eligibility.' },
      { name: 'Homeschool in Dubai', href: '/homeschool-dubai-ae', note: 'Live online schooling for Dubai families.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: GULF_READ,
  },

  // ═══════════════ DIASPORA: PAKISTANI FAMILIES ═══════════════
  'online-school-pakistani-families-gulf': {
    cat: 'online-school', country: 'saudi-arabia',
    img: 'linear-gradient(135deg,#06140C,#1E2F5F)', splash: IMG_HOME, splashAlt: 'A student in the Gulf preparing for O Level exams at home',
    t: 'Online School for Pakistani Families in the Gulf: A Practical Guide',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Online School for Pakistani Families in the Gulf',
    metaDesc: 'A practical guide for Pakistani families in the Gulf: O and A Level online, IBCC equivalence, FBISE and returning to Pakistan.',
    intro: "Many Pakistani families in Saudi Arabia, the UAE, Qatar, Kuwait, Oman and Bahrain already know the British route well, because O Level and A Level are long established in Pakistan. Others follow the Pakistani national curriculum through schools affiliated to the Federal Board. When families look at online school, their questions are usually about equivalence: will the results count back home, and what does IBCC need? This guide covers those questions carefully and points to the official bodies.",
    sections: [
      { h: 'Two familiar routes', p: "The first route is the Pakistani national curriculum, with SSC and HSSC exams, offered in the Gulf through schools affiliated to the Federal Board of Intermediate and Secondary Education, FBISE, fbise.edu.pk. The second is the British route: Cambridge O Level or IGCSE, then AS and A Level, or the Pearson Edexcel equivalents. Smartious teaches the British route live on Gulf time, along with IB and American programmes. We do not teach the FBISE curriculum." },
      { h: 'IGCSE or O Level?', p: "In Pakistan, Cambridge O Level is the familiar name; internationally, IGCSE is more common. Both are taken at about 16 and lead to AS and A Level. For a student in the Gulf, the practical difference is which syllabuses and exam series the local centre offers to private candidates. Students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres such as the British Council in their country." },
      { h: 'IBCC equivalence', p: "If your child may study in Pakistan, their British curriculum results will usually need an equivalence certificate from the Inter Board Committee of Chairmen, IBCC, ibcc.edu.pk. IBCC converts O Level or IGCSE and A Level grades into Pakistani marks using its published tables, and issues separate equivalence for each level. IBCC sets subject requirements, and these have differed for students who sat exams abroad and those who sat them in Pakistan, including rules on Urdu, Islamiyat and Pakistan Studies. Read the current rules on the IBCC website before choosing subjects, because subject choices made at 14 decide what is possible at 18." },
      { h: 'University entry in Pakistan', p: "Pakistani universities, and professional admissions such as medicine and engineering, set their own requirements on top of IBCC equivalence, often including entrance tests. Check each university and the relevant admission authority for current rules, including required A Level subjects and minimum grades, and how they treat predicted grades and results gained as a private candidate." },
      { h: 'Universities in the Gulf and abroad', p: "If your child may stay in the Gulf, check the country’s equivalency rules for British qualifications, such as those of the UAE Ministry of Education or the Saudi Ministry of Education. For universities in the UK and elsewhere, A Levels are the main entry qualification. Planning for more than one destination is common, and the British route keeps those options open if subjects are chosen carefully." },
      { h: 'Languages and faith', p: "Many families want their children to keep Urdu and, for some, to study Islamiyat. Cambridge offers Urdu and Islamiyat syllabuses at O Level, and some Gulf countries have their own Arabic and Islamic studies requirements for certain students. If these matter for equivalence or for your family, raise them at the placement stage so we can plan subjects and timetables accordingly." },
      { h: 'Timetables and fees', p: "Lessons run on Gulf time: Saudi Arabia, Qatar, Kuwait and Bahrain share East Africa Time with our teachers, and the UAE and Oman are one hour ahead. " + FEE + " In riyals, USD 423 is about SAR 1,586 at the pegged SAR 3.75 rate, and in dirhams about AED 1,553 at AED 3.6725 (approximate, October 2026)." },
      { h: 'A planning checklist', p: "List the countries and universities your child may apply to. Note their requirements, including IBCC rules for Pakistan and ministry equivalency in the Gulf. Choose O Level or IGCSE subjects that satisfy all of them, with English and mathematics as a minimum and the sciences if medicine or engineering are possible. Register for exams on time. Keep every certificate and statement of results; IBCC has stated that statements of results are accepted only for a limited period before original certificates are needed. Review the plan each year." },
      { h: "Exam day in the Gulf", p: "Private candidates sit exams at the centre’s venue, which may be some distance from home. Arrive early with your child’s passport or residence ID and statement of entry, and check the rules on calculators, stationery and water. In the May/June series, plan for summer heat and traffic." },
    ],
    faqs: [
      { q: 'Do you teach O Level?', a: 'We teach Cambridge IGCSE and Pearson Edexcel International GCSE, leading to AS and A Level. Ask us about specific O Level syllabuses.' },
      { q: 'Will my child need IBCC equivalence?', a: 'Usually, for study in Pakistan. Check current rules on ibcc.edu.pk, including subject requirements for students who sat exams abroad.' },
      { q: 'Do you teach the FBISE curriculum?', a: 'No. Families wanting FBISE usually choose an affiliated school.' },
      { q: 'What are fees in SAR?', a: 'From USD 423 a month for Primary, about SAR 1,586 (approximate, October 2026), payable termly.' },
    ],
    conclusion: "The British route is familiar ground for many Pakistani families; the key is planning subjects with IBCC and Gulf equivalency rules in mind. Check the official requirements early and keep every document. To plan your child’s route, message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in the Gulf',
    countryLinks: GULF_LINKS,
    pageLinksHeading: 'Official sites and next steps',
    pageLinks: [
      { name: 'IBCC Pakistan', href: 'https://www.ibcc.edu.pk', note: 'Equivalence of O and A Level results.' },
      { name: 'FBISE', href: 'https://www.fbise.edu.pk', note: 'Federal Board exams.' },
      { name: 'Homeschool in Riyadh', href: '/homeschool-riyadh-sa', note: 'Live online schooling for Riyadh families.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Saudi MOE Equivalency for IGCSE & A Level', slug: 'saudi-moe-equivalency-igcse', note: 'What to check, and where.' },
      ...GULF_READ,
    ],
  },

  // ═══════════════ DIASPORA: FILIPINO FAMILIES ═══════════════
  'online-school-filipino-families-gulf': {
    cat: 'online-school', country: 'uae',
    img: 'linear-gradient(135deg,#0A1020,#1E5AA8)', splash: IMG_HOME, splashAlt: 'A child in the Gulf joining a live online lesson at home',
    t: 'Online School for Filipino Families in the Gulf: A Practical Guide',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Online School for Filipino Families in the Gulf',
    metaDesc: 'A practical guide for Filipino families in the Gulf: DepEd K to 12, Philippine schools overseas, international routes and returning home.',
    intro: "Filipino families across the Gulf often want two things at once: a good education where they live now, and a smooth path back into the Philippine system if the family returns home. That makes the choice of school more complicated than it looks. This guide sets out the main routes, how they connect to DepEd’s K to 12 system, how international qualifications fit, and what to check before you choose. It points to official bodies for the decisions that matter.",
    sections: [
      { h: 'The main routes', p: "The first route is a Philippine school overseas, following the DepEd K to 12 curriculum, which makes a return to a school in the Philippines straightforward. The second is an international school or online school following a British, American or IB curriculum. The third, for some families, is a combination: an international route for most of school, with careful planning for a return. Smartious teaches the British route, IB and American programmes live on Gulf time. We do not teach the DepEd curriculum." },
      { h: 'How K to 12 compares', p: "The Philippine K to 12 system covers Kindergarten, six years of elementary school, four years of Junior High School and two years of Senior High School, with Senior High School tracks. The British route runs from Year 1 to Year 13, with IGCSE at about 16 and A Level at about 18. The ages line up broadly, but content and assessment differ, so moving between systems is easiest at a natural transition point, such as the start of Junior High or Senior High." },
      { h: 'Returning to the Philippines', p: "If your family may return, check DepEd’s current rules for learners coming from foreign schools. Schools in the Philippines usually ask for report cards and school records, which may need authentication, and DepEd has assessment routes such as the Philippine Educational Placement Test for learners who need placement. Check deped.gov.ph and ask the receiving school what it needs before you leave your current school. For university, check each institution’s rules for applicants with foreign credentials, and the guidance of the Commission on Higher Education, ched.gov.ph." },
      { h: 'Why some families choose an international route', p: "Some families choose a British or American route because they expect to stay in the Gulf, plan for university in another country, or want a curriculum recognised across many systems. Students on the British route sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres such as the British Council in their Gulf country. If a return to the Philippines is possible, keep detailed records so that a Philippine school can place your child fairly." },
      { h: 'Language and culture', p: "English is a strength for many Filipino children, which helps in a British or American curriculum. Families often want their children to keep Filipino and regional languages too, and some Gulf countries require Arabic for certain students in schools. Community and church groups, sports and cultural activities across the Gulf help children stay connected with friends and heritage." },
      { h: 'Timetables and fees', p: "Lessons run on Gulf time: Saudi Arabia, Qatar, Kuwait and Bahrain share East Africa Time with our teachers, and the UAE and Oman are one hour ahead. " + FEE + " In dirhams, USD 423 is about AED 1,553 at the pegged AED 3.6725 rate (approximate, October 2026)." },
      { h: 'Questions to ask before you choose', p: "How long do you expect to stay in the Gulf? If you return, at what grade would your child re-enter a Philippine school? Where might they go to university? Can your family supervise online learning at home, especially for younger children? And what documents will each school provide? Answer these honestly and check the official requirements; the right route is the one that fits your family’s likely path." },
      { h: 'Keeping records', p: "Keep every report card, school record, certificate and transfer document, with dates and grade levels. Ask early whether documents need authentication or an Apostille for use in the Philippines. Smartious provides termly reports and records of study for our students." },
      { h: "Thinking about university", p: "If your child may study in the Philippines, check each university’s rules for applicants with foreign credentials, including any entrance tests. If they may study elsewhere, the British route of IGCSE and A Level is widely understood by universities in the UK and many other countries. Plan subjects with the likely destination in mind, and keep every certificate safe." },
    ],
    faqs: [
      { q: 'Do you teach the DepEd curriculum?', a: 'No. Smartious teaches British, IB and American programmes. Families wanting DepEd K to 12 usually choose a Philippine school overseas.' },
      { q: 'Can my child return to a school in the Philippines?', a: 'Yes, but check DepEd’s current rules and the receiving school’s requirements, including school records and any placement test.' },
      { q: 'Is English a problem in a British curriculum?', a: 'Rarely. English is a strength for many Filipino children, and our placement assessment checks level.' },
      { q: 'What are fees in AED?', a: 'From USD 423 a month for Primary, about AED 1,553 (approximate, October 2026), payable termly.' },
    ],
    conclusion: "Filipino families in the Gulf can choose an international route with confidence if they plan for a possible return home and keep good records. Check DepEd’s rules early and ask the receiving school what it needs. To talk through options, message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in the Gulf',
    countryLinks: GULF_LINKS,
    pageLinksHeading: 'Official sites and next steps',
    pageLinks: [
      { name: 'Department of Education (Philippines)', href: 'https://www.deped.gov.ph', note: 'K to 12 and learner placement.' },
      { name: 'Commission on Higher Education', href: 'https://ched.gov.ph', note: 'University guidance.' },
      { name: 'Homeschool in Dubai', href: '/homeschool-dubai-ae', note: 'Live online schooling for Dubai families.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: GULF_READ,
  },

  // ═══════════════ UGANDA ═══════════════
  'online-school-uganda': {
    cat: 'online-school', country: 'uganda',
    img: 'linear-gradient(135deg,#0A1A10,#C9973A)', splash: IMG_EA, splashAlt: 'A Ugandan student learning online at home in Kampala',
    t: 'Online School in Uganda: A Guide for Parents (2026/27)',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Online School in Uganda: Parent Guide 2026/27',
    metaDesc: 'Online school in Uganda: UNEB and IGCSE routes, timetables on East Africa Time, fees in USD and what to check before you enrol.',
    intro: "Ugandan families looking at online school usually want a structured option with qualified teachers and a route to recognised exams, without depending on a long daily commute or a single local school. Smartious teaches families in Kampala, Entebbe and across Uganda from Nairobi, on the same East Africa Time. This guide explains how online school works in Uganda, the exam routes, fees, and the questions to check with Ugandan authorities.",
    sections: [
      { h: 'The Ugandan system in brief', p: "Uganda’s system runs through primary school to the Primary Leaving Examinations, then lower secondary to the Uganda Certificate of Education, and upper secondary to the Uganda Advanced Certificate of Education. National exams are run by the Uganda National Examinations Board, UNEB, uneb.ac.ug, and the curriculum is developed by the National Curriculum Development Centre, NCDC, ncdc.go.ug, which has introduced a competency-based lower secondary curriculum. Smartious does not teach the Ugandan national curriculum." },
      { h: 'The international route', p: "Smartious teaches the Cambridge pathway from Primary through IGCSE and AS and A Level, with Pearson Edexcel, IB and American options. Students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres, such as the British Council in Uganda or schools that accept external candidates. Check with the centre which subjects, components and series it offers to private candidates, and register early." },
      { h: 'Recognition in Uganda', p: "If your child may join a Ugandan university or return to a Ugandan school, check how foreign results are treated. UNEB has handled the equating of foreign secondary qualifications, and universities set their own entry requirements. Smartious does not claim approval from the Ministry of Education and Sports, UNEB or NCDC. Confirm current procedures with UNEB and the institutions concerned." },
      { h: 'Is learning at home allowed?', p: "Uganda’s laws on education are built around schools, and we are not aware of a clear framework for parent-led homeschooling. If you are considering home education, check with the Ministry of Education and Sports, education.go.ug, and keep good records of your child’s learning. An online school is different from parent-led homeschooling, but ask any provider, including us, exactly what it is and check what that means for your child." },
      { h: 'Timetable and connectivity', p: "Uganda shares East Africa Time with Nairobi, so lessons run in a normal Ugandan school day. Plan for a reliable internet connection with a mobile data backup, and a power backup for lesson hours. A laptop with a webcam and headset is best, and a quiet place to learn makes a real difference." },
      { h: 'Fees', p: FEE + " Exam entry fees are paid separately to the exam centre. Fees are invoiced in US dollars, so the shilling amount moves with the exchange rate; we can give you the dollar figure for your child after the assessment." },
      { h: 'Who online school suits in Uganda', p: "Families who move often, for work with NGOs, embassies or companies. Families who want an international curriculum without a daily commute across Kampala. Students who need a particular subject or level that is not available locally. Families returning from abroad mid-year. And children who need a calmer setting than a large school. It suits less well a family that cannot supervise a younger child during the school day, or where internet access is very unreliable." },
      { h: 'How to start', p: "Message admissions on WhatsApp at +254 745 021 212. We arrange an online placement assessment, recommend a class and level, share the timetable and send the termly invoice. Our next intake is Term 2, starting on 5 January 2027. Apply by December." },
      { h: "What a school day looks like", p: "A typical day for a secondary student starts with registration and a first live lesson in the Kampala morning, followed by a timetable of subject lessons with short breaks, much like a school day without the commute. Teachers set and mark homework on the learning platform, and students can message them with questions between lessons. Younger children have shorter lessons and need an adult nearby to help them settle. Parents receive written reports each term and can meet teachers online to talk about progress. Afternoons are free for homework, sport, music, languages and time with friends, which matter just as much for a child who learns at home." },
      { h: "National or international route?", p: "The choice depends on your child’s likely next step. If they will study at a Ugandan university and stay in the national system, UNEB exams are the familiar route. If university abroad is likely, or the family moves within the region, IGCSE and A Level usually keep more options open. Moving between systems is easiest at natural transition points, such as the start of secondary school or before IGCSE. Check with the universities your child may apply to how they treat each qualification." },
    ],
    faqs: [
      { q: 'Do you teach the Ugandan curriculum?', a: 'No. We teach Cambridge, Pearson Edexcel, IB and American programmes.' },
      { q: 'Where do students sit IGCSE in Uganda?', a: 'As private candidates at authorised centres, such as the British Council in Uganda or schools that accept external candidates.' },
      { q: 'What time are lessons?', a: 'Uganda shares East Africa Time with Nairobi, so lessons run in a normal school day.' },
      { q: 'How much does it cost?', a: 'From USD 423 a month for Primary, payable termly, varying by curriculum and level. One-to-one tuition is USD 15 an hour.' },
    ],
    conclusion: "Online school can give Ugandan families an international route on their own time zone. Check recognition with UNEB and your target universities, plan connectivity, and apply early. Message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in East Africa',
    countryLinks: [
      { name: 'Online school in Uganda', slug: 'uganda', note: 'Programmes and timetables for Ugandan families.' },
      { name: 'Online school in Kenya', slug: 'kenya', note: 'Where our teachers are based.' },
    ],
    pageLinksHeading: 'Official sites and next steps',
    pageLinks: [
      { name: 'UNEB', href: 'https://uneb.ac.ug', note: 'Uganda National Examinations Board.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Online School in Tanzania', slug: 'online-school-tanzania', note: 'The Tanzanian guide.' },
      { name: 'Online School in Rwanda', slug: 'online-school-rwanda', note: 'The Rwandan guide.' },
      { name: 'January 2027 Intake', slug: 'january-2027-intake', note: 'Start on 5 January 2027.' },
    ],
  },

  // ═══════════════ TANZANIA ═══════════════
  'online-school-tanzania': {
    cat: 'online-school', country: 'tanzania',
    img: 'linear-gradient(135deg,#0A1A20,#C9973A)', splash: IMG_EA, splashAlt: 'A Tanzanian student in a live online lesson at home',
    t: 'Online School in Tanzania: A Guide for Parents (2026/27)',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Online School in Tanzania: Parent Guide 2026/27',
    metaDesc: 'Online school in Tanzania: NECTA and IGCSE routes, East Africa Time timetables, fees in USD and what to check before you enrol.',
    intro: "Families in Dar es Salaam, Arusha, Dodoma, Mwanza and Zanzibar ask us about online school for many reasons: a move for work, a wish for an international curriculum, or a need for a particular subject or level. Smartious teaches from Nairobi on the same East Africa Time as Tanzania. This guide explains the Tanzanian context, the exam routes, fees and the questions to check with Tanzanian authorities.",
    sections: [
      { h: 'The Tanzanian system in brief', p: "Tanzania’s national exams are run by the National Examinations Council of Tanzania, NECTA, necta.go.tz, including the Certificate of Secondary Education Examination at the end of Form Four and the Advanced Certificate of Secondary Education Examination at the end of Form Six. Education policy is set by the Ministry of Education, Science and Technology, which has been reforming the curriculum. Smartious does not teach the Tanzanian national curriculum." },
      { h: 'The international route', p: "Smartious teaches the Cambridge pathway from Primary through IGCSE and AS and A Level, with Pearson Edexcel, IB and American options, in English. Students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres, such as the British Council in Tanzania or schools that accept external candidates. Check which subjects and components the centre offers to private candidates, and register early." },
      { h: 'Recognition in Tanzania', p: "If your child may attend a Tanzanian university or return to a Tanzanian school, check how foreign results are treated. NECTA has handled the equivalence of foreign secondary certificates, and the Tanzania Commission for Universities, tcu.go.tz, sets guidance on university admission. Smartious does not claim approval from the Ministry, NECTA or any Tanzanian authority. Confirm current procedures directly." },
      { h: 'Learning at home and the law', p: "Tanzania’s education laws are built around schools, and we are not aware of a clear framework for parent-led homeschooling. If you are considering home education, check with the Ministry of Education, Science and Technology and keep good records. Ask any online provider, including us, exactly what it is and check what that means for your child." },
      { h: 'Timetable and connectivity', p: "Tanzania shares East Africa Time with Nairobi, so lessons run in a normal school day. Plan for reliable internet with a mobile data backup and a power backup, a laptop with a webcam and headset, and a quiet learning space. Families on Zanzibar and in smaller towns should test their connection at lesson times before term starts." },
      { h: 'Fees', p: FEE + " Exam entry fees are paid separately to the exam centre. Fees are invoiced in US dollars, so the shilling amount moves with the exchange rate." },
      { h: 'Who online school suits in Tanzania', p: "Families who relocate within East Africa, families who want an English-medium international curriculum, students who need A Level subjects not offered locally, and children who learn better in a smaller, calmer setting. It suits less well a family that cannot supervise a younger child during the day, or where connectivity is very unreliable." },
      { h: 'How to start', p: "Message admissions on WhatsApp at +254 745 021 212. We arrange an online placement assessment, recommend a class and level, share the timetable and send the termly invoice. Our next intake is Term 2, starting on 5 January 2027. Apply by December, so your child is placed and ready in time." },
      { h: "What a school day looks like", p: "A typical day for a secondary student starts with registration and a first live lesson in the Dar es Salaam morning, followed by a timetable of subject lessons with short breaks, much like a school day without the commute. Teachers set and mark homework on the learning platform, and students can message them with questions between lessons. Younger children have shorter lessons and need an adult nearby to help them settle. Parents receive written reports each term and can meet teachers online to talk about progress. Afternoons are free for homework, sport, music, languages and time with friends, which matter just as much for a child who learns at home." },
      { h: "National or international route?", p: "If your child will study at a Tanzanian university and stay in the national system, NECTA exams are the familiar route. If university abroad is likely, or the family may move, IGCSE and A Level usually keep more options open. Language matters too: the international route is taught in English throughout. Moving between systems is easiest at a transition point, such as the start of secondary school or before IGCSE. Ask your target universities how they treat each qualification, and check NECTA’s rules on equivalence." },
      { h: "Exams in practice", p: "Find out early which centres in Tanzania accept private candidates for your child’s subjects, and where they are. Families outside Dar es Salaam may need to plan travel and accommodation for exam days, so map the exam timetable as soon as it is published." },
    ],
    faqs: [
      { q: 'Do you teach the Tanzanian curriculum?', a: 'No. We teach Cambridge, Pearson Edexcel, IB and American programmes in English.' },
      { q: 'Where do students sit IGCSE in Tanzania?', a: 'As private candidates at authorised centres, such as the British Council in Tanzania or schools that accept external candidates.' },
      { q: 'What time are lessons?', a: 'Tanzania shares East Africa Time with Nairobi.' },
      { q: 'How much does it cost?', a: 'From USD 423 a month for Primary, payable termly, varying by curriculum and level.' },
    ],
    conclusion: "Online school gives Tanzanian families an English-medium international route on their own time zone. Check recognition with NECTA and your target universities, test your connectivity and apply early. Message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in East Africa',
    countryLinks: [
      { name: 'Online school in Tanzania', slug: 'tanzania', note: 'Programmes and timetables for Tanzanian families.' },
      { name: 'Online school in Kenya', slug: 'kenya', note: 'Where our teachers are based.' },
    ],
    pageLinksHeading: 'Official sites and next steps',
    pageLinks: [
      { name: 'NECTA', href: 'https://www.necta.go.tz', note: 'National Examinations Council of Tanzania.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Online School in Uganda', slug: 'online-school-uganda', note: 'The Ugandan guide.' },
      { name: 'Online School in Rwanda', slug: 'online-school-rwanda', note: 'The Rwandan guide.' },
      { name: 'January 2027 Intake', slug: 'january-2027-intake', note: 'Start on 5 January 2027.' },
    ],
  },

  // ═══════════════ RWANDA ═══════════════
  'online-school-rwanda': {
    cat: 'online-school', country: 'rwanda',
    img: 'linear-gradient(135deg,#0A1A20,#1E5AA8)', splash: IMG_EA, splashAlt: 'A Rwandan student learning online at home in Kigali',
    t: 'Online School in Rwanda: A Guide for Parents (2026/27)',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Online School in Rwanda: Parent Guide 2026/27',
    metaDesc: 'Online school in Rwanda: NESA and IGCSE routes, timetables on Central Africa Time, fees in USD and what to check before you enrol.',
    intro: "Kigali has become home to many international families, and Rwandan families increasingly look beyond the local system for international qualifications. Online school is one way to do that without being limited to the schools nearest your home. Smartious teaches from Nairobi, one hour ahead of Rwanda. This guide explains the Rwandan context, the exam routes, timetables, fees and what to check with Rwandan authorities.",
    sections: [
      { h: 'The Rwandan system in brief', p: "Rwanda follows a competency-based curriculum, with national exams at the end of primary, at the end of lower secondary, known as O Level, and at the end of upper secondary, known as A Level. National exams and school inspection are the responsibility of the National Examination and School Inspection Authority, NESA, nesa.gov.rw. English is the main language of instruction. Smartious does not teach the Rwandan national curriculum." },
      { h: 'The international route', p: "Smartious teaches the Cambridge pathway from Primary through IGCSE and AS and A Level, with Pearson Edexcel, IB and American options. Students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres. In Kigali, check with the British Council in Rwanda and with Cambridge and Pearson centres which accept private candidates, and for which subjects and components." },
      { h: 'Recognition in Rwanda', p: "If your child may attend a Rwandan university or return to a Rwandan school, ask how foreign results are treated. Ask NESA about secondary equivalence and the Higher Education Council, hec.gov.rw, about university admission. Smartious does not claim approval from the Ministry of Education, NESA or any Rwandan authority. Confirm current procedures directly." },
      { h: 'Timetable on Central Africa Time', p: "Rwanda is on Central Africa Time, two hours ahead of GMT and one hour behind Nairobi. A lesson at 9am in Nairobi is at 8am in Kigali. We plan timetables for Rwandan families so the school day sits in sensible local hours, and we send the full timetable in Rwandan time before you accept a place." },
      { h: 'Learning at home', p: "Rwanda’s education system is built around schools, and we are not aware of a clear framework for parent-led homeschooling. If you are considering home education, check with the Ministry of Education, mineduc.gov.rw, and keep good records. An online school is different from parent-led homeschooling; ask any provider, including us, what it is and check what that means for your child." },
      { h: 'Fees', p: FEE + " Exam entry fees are paid separately to the exam centre. Fees are invoiced in US dollars, so the franc amount moves with the exchange rate." },
      { h: 'Who online school suits in Rwanda', p: "International families on postings in Kigali, families who move often within the region, students who want IGCSE and A Level subjects not available locally, and children who need a calmer setting. It suits less well a family that cannot supervise a younger child during the day. Rwanda’s connectivity in Kigali is generally good, but test it at lesson times." },
      { h: 'How to start', p: "Message admissions on WhatsApp at +254 745 021 212. We arrange an online placement assessment, recommend a class and level, share the timetable in Rwandan time and send the termly invoice. Our next intake is Term 2, starting on 5 January 2027. Apply by December." },
      { h: "What a school day looks like", p: "A typical day for a secondary student starts with registration and a first live lesson in the Kigali morning, followed by a timetable of subject lessons with short breaks, much like a school day without the commute. Teachers set and mark homework on the learning platform, and students can message them with questions between lessons. Younger children have shorter lessons and need an adult nearby to help them settle. Parents receive written reports each term and can meet teachers online to talk about progress. Afternoons are free for homework, sport, music, languages and time with friends, which matter just as much for a child who learns at home." },
      { h: "National or international route?", p: "If your child will study at a Rwandan university and stay in the national system, NESA exams are the familiar route. If university abroad is likely, or your family is on a posting, IGCSE and A Level usually keep more options open. Moving between systems is easiest at a transition point, such as the start of secondary school or before IGCSE. Ask your target universities how they treat each qualification." },
      { h: "Exams in practice", p: "Check early which centres in Rwanda accept private candidates for your child’s subjects and components, and confirm the venue for each series. Some families plan to sit certain exams in a neighbouring country if a component is not available locally; plan travel well in advance if so." },
    ],
    faqs: [
      { q: 'Do you teach the Rwandan curriculum?', a: 'No. We teach Cambridge, Pearson Edexcel, IB and American programmes.' },
      { q: 'What time are lessons in Kigali?', a: 'Rwanda is one hour behind Nairobi. We plan timetables in sensible Rwandan hours.' },
      { q: 'Where do students sit IGCSE in Rwanda?', a: 'As private candidates at authorised centres. Check with the British Council in Rwanda and local Cambridge and Pearson centres.' },
      { q: 'How much does it cost?', a: 'From USD 423 a month for Primary, payable termly, varying by curriculum and level.' },
    ],
    conclusion: "Online school gives families in Rwanda an international route with qualified teachers, one hour from Kigali’s clock. Check recognition with NESA and your target universities, and apply early. Message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in East Africa',
    countryLinks: [
      { name: 'Online school in Rwanda', slug: 'rwanda', note: 'Programmes and timetables for Rwandan families.' },
      { name: 'Online school in Kenya', slug: 'kenya', note: 'Where our teachers are based.' },
    ],
    pageLinksHeading: 'Kigali and next steps',
    pageLinks: [
      { name: 'Homeschool in Kigali', href: '/homeschool-kigali-rw', note: 'Live online schooling for Kigali families.' },
      { name: 'NESA', href: 'https://www.nesa.gov.rw', note: 'National exams and school inspection.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Online School in Uganda', slug: 'online-school-uganda', note: 'The Ugandan guide.' },
      { name: 'Online School in Tanzania', slug: 'online-school-tanzania', note: 'The Tanzanian guide.' },
      { name: 'January 2027 Intake', slug: 'january-2027-intake', note: 'Start on 5 January 2027.' },
    ],
  },

  // ═══════════════ QATAR ═══════════════
  'online-school-qatar-guide': {
    cat: 'online-school', country: 'qatar',
    img: 'linear-gradient(135deg,#1A0A14,#8B1A2E)', splash: IMG_GULF, splashAlt: 'A student in Doha learning online at home',
    t: 'Online School in Qatar: A Guide for Parents (2026/27)',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Online School in Qatar: Parent Guide 2026/27',
    metaDesc: 'Online school in Qatar: IGCSE and A Level as a private candidate, MOEHE equivalency, fees in QAR and Doha timetables.',
    intro: "Families in Doha, Al Wakrah, Al Khor and Lusail look at online school for many reasons: a mid-year move, a wait for a school place, a wish for a particular curriculum, or a child who needs a different setting. Qatar shares our time zone, so lessons run on the same clock as Nairobi. This guide covers how online school works in Qatar, exams, equivalency through the Ministry of Education and Higher Education, fees in riyals, and what to check.",
    sections: [
      { h: 'Who regulates schools in Qatar', p: "Schools in Qatar, including private schools, are overseen by the Ministry of Education and Higher Education, MOEHE, edu.gov.qa. The Ministry licenses private schools and runs certificate equivalency. An online school based outside Qatar is not a licensed Qatari school. Smartious does not claim approval or licensing from MOEHE." },
      { h: 'Curricula and exams', p: "Most of our Qatar families follow the British route: Cambridge Primary and Lower Secondary, IGCSE and AS and A Level, with Pearson Edexcel options. We also teach IB and American programmes. Students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres, such as the British Council in Qatar or schools that accept external candidates. Register early; deadlines come months before the exams." },
      { h: 'Equivalency through MOEHE', p: "If your child may study at a Qatari university, apply for certain scholarships or return to a school in Qatar, check MOEHE’s equivalency rules. The Ministry runs a certificate equivalency service for certificates that do not follow the Qatari curriculum, through its online services, and has issued conditions for equating British curriculum secondary certificates. Requirements for Arabic language and Islamic education can apply to Arab and Muslim students. Check the current rules on edu.gov.qa before your child chooses subjects." },
      { h: 'University entry', p: "Qatari universities set their own requirements. Qatar University, for example, has published requirements for British curriculum applicants including a number of IGCSE passes and AS or A Level passes, with subject requirements. Check qu.edu.qa and the admissions page of every university your child may apply to, and ask whether results gained as a private candidate need any extra documents." },
      { h: 'Timetable', p: "Qatar is on Arabia Standard Time, three hours ahead of GMT, the same as Nairobi. Qatar’s weekend is Friday and Saturday, so we plan timetables for Qatar families around the Sunday to Thursday week where needed, and send the full timetable before you accept a place." },
      { h: 'Fees in QAR', p: FEE + " The riyal is pegged at about QAR 3.64 to the dollar, so USD 423 is about QAR 1,540 a month and USD 15 is about QAR 55 (approximate, October 2026). Exam entry fees are paid separately to the exam centre." },
      { h: 'Returning to a school in Qatar', p: "If your child may return to a school in Qatar, ask that school now what it will need: reports, records of study, transfer certificates, equivalency and any placement tests. Keep every document, and ask whether attestation applies. Our guide to returning to school after homeschooling in the Gulf covers this in detail." },
      { h: 'How to start', p: "Message admissions on WhatsApp at +254 745 021 212. We arrange an online placement assessment, recommend a class and level, share the timetable and send the termly invoice. Our next intake is Term 2, starting on 5 January 2027. Apply by December." },
      { h: "What a school day looks like", p: "A typical day for a secondary student starts with registration and a first live lesson in the Doha morning, followed by a timetable of subject lessons with short breaks, much like a school day without the commute. Teachers set and mark homework on the learning platform, and students can message them with questions between lessons. Younger children have shorter lessons and need an adult nearby to help them settle. Parents receive written reports each term and can meet teachers online to talk about progress. Afternoons are free for homework, sport, music, languages and time with friends, which matter just as much for a child who learns at home." },
      { h: "Choosing a curriculum", p: "Families in Qatar usually choose between the British route, IB and an American programme. The British route, with IGCSE at about 16 and A Level at about 18, is widely understood by universities in the Gulf, the UK and many other countries. IB suits students who want breadth across subjects. An American programme suits families heading to North America. If your child may study at a Qatari university, check early how each route is treated for MOEHE equivalency and admission. The placement assessment is a good moment to talk this through, because the right answer depends on where your child is likely to study next." },
      { h: "Questions to ask any online school", p: "Ask where the school is registered and by whom, and whether it claims any approval in Qatar. Ask which exam boards its students sit and where, and whether it helps with private candidate registration. Ask how many live lessons a week the fee includes, the class size, and what reports and records it provides. Clear answers, including what a school is not, make planning much easier." },
    ],
    faqs: [
      { q: 'Is Smartious licensed in Qatar?', a: 'No. Smartious does not claim approval or licensing from MOEHE.' },
      { q: 'Where do students sit IGCSE in Qatar?', a: 'As private candidates at authorised centres, such as the British Council in Qatar or schools that accept external candidates.' },
      { q: 'What are fees in QAR?', a: 'From USD 423 a month for Primary, about QAR 1,540 at roughly QAR 3.64 to the dollar (October 2026), payable termly.' },
      { q: 'Will my child need equivalency?', a: 'Often, for Qatari universities, scholarships or schools. Check MOEHE’s current rules on edu.gov.qa.' },
    ],
    conclusion: "Online school can work well in Qatar on the same clock as Nairobi. Plan exams and MOEHE equivalency early, keep records and apply by December for January. Message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Qatar',
    countryLinks: [
      { name: 'Online school in Qatar', slug: 'qatar', note: 'Programmes, timetables and fees for Qatar families.' },
    ],
    pageLinksHeading: 'Qatar pages and next steps',
    pageLinks: [
      { name: 'Homeschool in Doha', href: '/homeschool-doha-qa', note: 'Live online schooling for Doha families.' },
      { name: 'Homeschool in Lusail', href: '/homeschool-lusail-qa', note: 'For families in Lusail.' },
      { name: 'Qatar MOEHE', href: 'https://www.edu.gov.qa', note: 'Equivalency and school regulation.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: GULF_READ,
  },

  // ═══════════════ KUWAIT ═══════════════
  'online-school-kuwait-guide': {
    cat: 'online-school', country: 'kuwait',
    img: 'linear-gradient(135deg,#0A1A14,#8B1A2E)', splash: IMG_GULF, splashAlt: 'A student in Kuwait joining a live online class at home',
    t: 'Online School in Kuwait: A Guide for Parents (2026/27)',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Online School in Kuwait: Parent Guide 2026/27',
    metaDesc: 'Online school in Kuwait: IGCSE and A Level as a private candidate, Ministry of Education rules, fees in KWD and Kuwait timetables.',
    intro: "Families in Kuwait City, Salmiya, Hawally, Salwa and Ahmadi ask us about online school when they arrive mid-year, want a particular curriculum, or need a different setting for a child. Kuwait shares our time zone, so lessons run on the same clock as Nairobi. This guide explains how online school works in Kuwait, exams, recognition questions for the Ministry of Education, fees in dinars and what to check.",
    sections: [
      { h: 'Who regulates schools in Kuwait', p: "Schools in Kuwait, including private schools, are overseen by the Ministry of Education, moe.edu.kw. An online school based outside Kuwait is not a licensed Kuwaiti school. Smartious does not claim approval or licensing from the Kuwaiti Ministry of Education." },
      { h: 'Curricula and exams', p: "Most of our Kuwait families follow the British route: Cambridge Primary and Lower Secondary, IGCSE and AS and A Level, with Pearson Edexcel options. We also teach IB and American programmes. Students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres, such as the British Council in Kuwait or schools that accept external candidates. Check which subjects and components the centre offers and register early." },
      { h: 'Recognition and equivalency', p: "If your child may study at a university in Kuwait or return to a Kuwaiti school, ask the Ministry of Education how foreign certificates are evaluated and what documents are needed. Universities, including Kuwait University, set their own requirements for applicants with British qualifications. Requirements for Arabic and Islamic studies can apply to some students. Confirm everything directly with the Ministry and the institution." },
      { h: 'Timetable', p: "Kuwait is three hours ahead of GMT, the same as Nairobi. Kuwait’s weekend is Friday and Saturday, so we plan timetables around the Sunday to Thursday week where needed. We send the full timetable before you accept a place." },
      { h: 'Fees in KWD', p: FEE + " At about KWD 0.307 to the dollar, USD 423 is about KWD 130 a month and USD 15 is about KWD 4.6 (approximate, October 2026). Exam entry fees are paid separately to the exam centre." },
      { h: 'Who online school suits in Kuwait', p: "Families arriving mid-year without a school place, families who want a British, IB or American curriculum not easily available nearby, students who need particular IGCSE or A Level subjects, and children who learn better in a smaller, calmer setting. It suits less well a family that cannot supervise a younger child during the school day." },
      { h: 'Returning to a school in Kuwait', p: "If a return to a Kuwaiti school is likely, ask that school now what it will need, such as reports, records of study, transfer certificates, Ministry evaluation and placement tests. Keep every document and ask whether attestation applies." },
      { h: 'How to start', p: "Message admissions on WhatsApp at +254 745 021 212. We arrange an online placement assessment, recommend a class and level, share the timetable and send the termly invoice. Our next intake is Term 2, starting on 5 January 2027. Apply by December, ideally before the winter break." },
      { h: "What a school day looks like", p: "A typical day for a secondary student starts with registration and a first live lesson in the Kuwait morning, followed by a timetable of subject lessons with short breaks, much like a school day without the commute. Teachers set and mark homework on the learning platform, and students can message them with questions between lessons. Younger children have shorter lessons and need an adult nearby to help them settle. Parents receive written reports each term and can meet teachers online to talk about progress. Afternoons are free for homework, sport, music, languages and time with friends, which matter just as much for a child who learns at home." },
      { h: "Choosing a curriculum", p: "Families in Kuwait usually choose between the British route, IB and an American programme. The British route, with IGCSE at about 16 and A Level at about 18, is widely understood by universities in the Gulf, the UK and many other countries. IB suits students who want breadth across subjects. An American programme suits families heading to North America. If your child may study at a university in Kuwait, ask early how each route is evaluated by the Ministry and the university. The placement assessment is a good moment to talk this through, because the right answer depends on where your child is likely to study next." },
      { h: "Questions to ask any online school", p: "Ask where the school is registered and whether it claims any approval in Kuwait. Ask which exam boards its students sit, where, and whether it helps with registration. Ask about live hours, class sizes, teacher qualifications, and the reports and records it provides. A provider that answers clearly, including saying what it is not, is one you can plan with." },
    ],
    faqs: [
      { q: 'Is Smartious licensed in Kuwait?', a: 'No. Smartious does not claim approval or licensing from the Kuwaiti Ministry of Education.' },
      { q: 'Where do students sit IGCSE in Kuwait?', a: 'As private candidates at authorised centres, such as the British Council in Kuwait or schools that accept external candidates.' },
      { q: 'What are fees in KWD?', a: 'From USD 423 a month for Primary, about KWD 130 at roughly KWD 0.307 to the dollar (October 2026), payable termly.' },
      { q: 'What time are lessons?', a: 'Kuwait shares the same clock as Nairobi.' },
    ],
    conclusion: "Online school in Kuwait runs on the same clock as our teachers. Plan exams and recognition early, keep every document, and apply by December for a January start. Message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Kuwait',
    countryLinks: [
      { name: 'Online school in Kuwait', slug: 'kuwait', note: 'Programmes, timetables and fees for Kuwait families.' },
    ],
    pageLinksHeading: 'Kuwait pages and next steps',
    pageLinks: [
      { name: 'Homeschool in Kuwait City', href: '/homeschool-kuwait-city-kw', note: 'Live online schooling for Kuwait City families.' },
      { name: 'Homeschool in Salmiya', href: '/homeschool-salmiya-kw', note: 'For families in Salmiya.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: GULF_READ,
  },

  // ═══════════════ OMAN ═══════════════
  'online-school-oman-guide': {
    cat: 'online-school', country: 'oman',
    img: 'linear-gradient(135deg,#1A0F0A,#8B1A2E)', splash: IMG_GULF, splashAlt: 'A student in Muscat learning online at home',
    t: 'Online School in Oman: A Guide for Parents (2026/27)',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Online School in Oman: Parent Guide 2026/27',
    metaDesc: 'Online school in Oman: IGCSE and A Level as a private candidate, Ministry of Education rules, fees in OMR and Muscat timetables.',
    intro: "Families in Muscat, Seeb, Sohar, Salalah, Nizwa and Sur look at online school when they move to Oman mid-year, live far from an international school, or want a particular curriculum. Oman is one hour ahead of Nairobi, so lessons sit comfortably in the Omani school day. This guide explains how online school works in Oman, exams, recognition questions, fees in rials and what to check.",
    sections: [
      { h: 'Who regulates schools in Oman', p: "Schools in Oman, including private schools, are overseen by the Ministry of Education, moe.gov.om. Higher education and university admission involve the Ministry of Higher Education, Research and Innovation. An online school based outside Oman is not a licensed Omani school. Smartious does not claim approval or licensing from any Omani ministry." },
      { h: 'Curricula and exams', p: "Most of our Oman families follow the British route: Cambridge Primary and Lower Secondary, IGCSE and AS and A Level, with Pearson Edexcel options. We also teach IB and American programmes. Students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres, such as the British Council in Oman or schools that accept external candidates. Families outside Muscat should check travel to the centre for each exam." },
      { h: 'Recognition and equivalency', p: "If your child may study at a university in Oman or return to an Omani school, ask the Ministry of Education how foreign certificates are evaluated and what documents are needed. Undergraduate admission to many Omani public institutions runs through a central admissions system with its own rules. Requirements for Arabic and Islamic studies can apply to some students. Confirm everything directly with the ministries and institutions concerned." },
      { h: 'Timetable', p: "Oman is four hours ahead of GMT, one hour ahead of Nairobi. A lesson at 9am in Nairobi is at 10am in Muscat. Oman’s weekend is Friday and Saturday, so we plan timetables around the Sunday to Thursday week where needed, and send the full timetable before you accept a place." },
      { h: 'Fees in OMR', p: FEE + " The rial is pegged at about OMR 0.385 to the dollar, so USD 423 is about OMR 163 a month and USD 15 is about OMR 5.8 (approximate, October 2026). Exam entry fees are paid separately to the exam centre." },
      { h: 'Who online school suits in Oman', p: "Families in Sohar, Salalah, Nizwa and other towns far from international schools; families arriving mid-year; students who need particular IGCSE or A Level subjects; and children who learn better in a smaller setting. It suits less well a family that cannot supervise a younger child during the school day or where connectivity is weak." },
      { h: 'Returning to a school in Oman', p: "If a return to an Omani school is likely, ask that school now what it will need: reports, records of study, transfer certificates, Ministry evaluation and placement tests. Keep every document and ask whether attestation applies." },
      { h: 'How to start', p: "Message admissions on WhatsApp at +254 745 021 212. We arrange an online placement assessment, recommend a class and level, share the timetable in Omani time and send the termly invoice. Our next intake is Term 2, starting on 5 January 2027. Apply by December." },
      { h: "What a school day looks like", p: "A typical day for a secondary student starts with registration and a first live lesson in the Muscat morning, followed by a timetable of subject lessons with short breaks, much like a school day without the commute. Teachers set and mark homework on the learning platform, and students can message them with questions between lessons. Younger children have shorter lessons and need an adult nearby to help them settle. Parents receive written reports each term and can meet teachers online to talk about progress. Afternoons are free for homework, sport, music, languages and time with friends, which matter just as much for a child who learns at home." },
      { h: "Choosing a curriculum", p: "Families in Oman usually choose between the British route, IB and an American programme. The British route, with IGCSE at about 16 and A Level at about 18, is widely understood by universities in the Gulf, the UK and many other countries. IB suits students who want breadth across subjects. An American programme suits families heading to North America. If your child may apply to an Omani university, check early how each route is treated in the central admissions process and by the Ministry. The placement assessment is a good moment to talk this through, because the right answer depends on where your child is likely to study next." },
      { h: "Questions to ask any online school", p: "Ask where the school is registered and whether it claims any approval in Oman. Ask which exam boards its students sit and where, how it helps with registration, how many live hours the fee includes, and what records it provides. Clear answers make planning easier." },
    ],
    faqs: [
      { q: 'Is Smartious licensed in Oman?', a: 'No. Smartious does not claim approval or licensing from any Omani ministry.' },
      { q: 'Where do students sit IGCSE in Oman?', a: 'As private candidates at authorised centres, such as the British Council in Oman or schools that accept external candidates.' },
      { q: 'What are fees in OMR?', a: 'From USD 423 a month for Primary, about OMR 163 at roughly OMR 0.385 to the dollar (October 2026), payable termly.' },
      { q: 'What time are lessons?', a: 'Oman is one hour ahead of Nairobi; lessons sit in the Omani school day.' },
    ],
    conclusion: "Online school can bring an international curriculum to families anywhere in Oman. Plan exams and recognition early, check travel to your exam centre, and apply by December. Message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Oman',
    countryLinks: [
      { name: 'Online school in Oman', slug: 'oman', note: 'Programmes, timetables and fees for Oman families.' },
    ],
    pageLinksHeading: 'Oman pages and next steps',
    pageLinks: [
      { name: 'Homeschool in Muscat', href: '/homeschool-muscat-om', note: 'Live online schooling for Muscat families.' },
      { name: 'Homeschool in Salalah', href: '/homeschool-salalah-om', note: 'For families in Dhofar.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: GULF_READ,
  },

  // ═══════════════ BAHRAIN ═══════════════
  'online-school-bahrain-guide': {
    cat: 'online-school', country: 'bahrain',
    img: 'linear-gradient(135deg,#1A0A0A,#8B1A2E)', splash: IMG_GULF, splashAlt: 'A student in Manama learning in a live online class',
    t: 'Online School in Bahrain: A Guide for Parents (2026/27)',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Online School in Bahrain: Parent Guide 2026/27',
    metaDesc: 'Online school in Bahrain: IGCSE and A Level as a private candidate, Ministry of Education rules, fees in BHD and Bahrain timetables.',
    intro: "Bahrain is small, but families there have the same questions as families anywhere in the Gulf: what to do after a mid-year move, how to access a particular curriculum, and how to keep options open for university. Bahrain shares our time zone, so lessons run on the same clock as Nairobi. This guide explains how online school works in Bahrain, exams, recognition, fees in dinars and what to check.",
    sections: [
      { h: 'Who regulates schools in Bahrain', p: "Schools in Bahrain, including private schools, are overseen by the Ministry of Education, moe.gov.bh. Higher education is overseen by the Higher Education Council. An online school based outside Bahrain is not a licensed Bahraini school. Smartious does not claim approval or licensing from any Bahraini authority." },
      { h: 'Curricula and exams', p: "Most of our Bahrain families follow the British route: Cambridge Primary and Lower Secondary, IGCSE and AS and A Level, with Pearson Edexcel options. We also teach IB and American programmes. Students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres, such as the British Council in Bahrain or schools that accept external candidates. Register early; deadlines come months before the exams." },
      { h: 'Recognition and equivalency', p: "If your child may study at a university in Bahrain or return to a Bahraini school, ask the Ministry of Education how foreign certificates are evaluated and what documents are needed, and check each university’s requirements for British curriculum applicants. Requirements for Arabic and Islamic studies can apply to some students. Confirm everything with the Ministry and the institution." },
      { h: 'Timetable', p: "Bahrain is three hours ahead of GMT, the same as Nairobi. Bahrain’s weekend is Friday and Saturday, so we plan timetables around the Sunday to Thursday week where needed, and send the full timetable before you accept a place." },
      { h: 'Fees in BHD', p: FEE + " The dinar is pegged at about BHD 0.376 to the dollar, so USD 423 is about BHD 159 a month and USD 15 is about BHD 5.6 (approximate, October 2026). Exam entry fees are paid separately to the exam centre." },
      { h: 'Who online school suits in Bahrain', p: "Families arriving mid-year, families who commute across the causeway or move often in the region, students who need particular IGCSE or A Level subjects, and children who learn better in a smaller setting. It suits less well a family that cannot supervise a younger child during the school day." },
      { h: 'Returning to a school in Bahrain', p: "If a return to a Bahraini school is likely, ask that school now what it will need: reports, records of study, transfer certificates, Ministry evaluation and placement tests. Keep every document and ask whether attestation applies." },
      { h: 'How to start', p: "Message admissions on WhatsApp at +254 745 021 212. We arrange an online placement assessment, recommend a class and level, share the timetable and send the termly invoice. Our next intake is Term 2, starting on 5 January 2027. Apply by December." },
      { h: "What a school day looks like", p: "A typical day for a secondary student starts with registration and a first live lesson in the Manama morning, followed by a timetable of subject lessons with short breaks, much like a school day without the commute. Teachers set and mark homework on the learning platform, and students can message them with questions between lessons. Younger children have shorter lessons and need an adult nearby to help them settle. Parents receive written reports each term and can meet teachers online to talk about progress. Afternoons are free for homework, sport, music, languages and time with friends, which matter just as much for a child who learns at home." },
      { h: "Choosing a curriculum", p: "Families in Bahrain usually choose between the British route, IB and an American programme. The British route, with IGCSE at about 16 and A Level at about 18, is widely understood by universities in the Gulf, the UK and many other countries. IB suits students who want breadth across subjects. An American programme suits families heading to North America. If your child may stay in Bahrain or Saudi Arabia for university, check early how each route is evaluated. The placement assessment is a good moment to talk this through, because the right answer depends on where your child is likely to study next." },
      { h: "Questions to ask any online school", p: "Ask where the school is registered and whether it claims any approval in Bahrain. Ask which exam boards its students sit, where, and whether it helps with registration. Ask about live hours, class sizes, teacher qualifications and the reports it provides. Clear answers, including what a school is not, make planning easier." },
    ],
    faqs: [
      { q: 'Is Smartious licensed in Bahrain?', a: 'No. Smartious does not claim approval or licensing from any Bahraini authority.' },
      { q: 'Where do students sit IGCSE in Bahrain?', a: 'As private candidates at authorised centres, such as the British Council in Bahrain or schools that accept external candidates.' },
      { q: 'What are fees in BHD?', a: 'From USD 423 a month for Primary, about BHD 159 at roughly BHD 0.376 to the dollar (October 2026), payable termly.' },
      { q: 'What time are lessons?', a: 'Bahrain shares the same clock as Nairobi.' },
    ],
    conclusion: "Online school in Bahrain runs on the same clock as our teachers. Plan exams and recognition early, keep records, and apply by December for a January start. Message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Bahrain',
    countryLinks: [
      { name: 'Online school in Bahrain', slug: 'bahrain', note: 'Programmes, timetables and fees for Bahrain families.' },
      { name: 'Online school in Saudi Arabia', slug: 'saudi-arabia', note: 'For families across the causeway.' },
    ],
    pageLinksHeading: 'Next steps',
    pageLinks: [
      { name: 'Bahrain Ministry of Education', href: 'https://www.moe.gov.bh', note: 'School regulation in Bahrain.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: GULF_READ,
  },

  // ═══════════════ CITY GUIDE: LAGOS ═══════════════
  'homeschool-lagos': {
    cat: 'homeschool', country: 'nigeria',
    img: 'linear-gradient(135deg,#0A1A0F,#8B1A2E)', splash: IMG_AFR, splashAlt: 'A Lagos student learning at home in a live online class',
    t: 'Homeschooling in Lagos: A Practical Guide for Parents',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Homeschooling in Lagos: A Practical Guide',
    metaDesc: 'How to homeschool in Lagos: choosing a model, power and internet, costs in naira, IGCSE and WAEC exams, and staying social.',
    intro: "Lagos families turn to homeschooling and online school for reasons every Lagosian will recognise: hours lost in traffic, rising school fees, crowded classrooms, and children who need a different pace. Learning at home can solve some of those problems, but it brings its own: power, internet, supervision and social life. This guide is a practical how-to for Lagos parents. For our Lagos programme itself, see our Lagos page.",
    sections: [
      { h: 'Choose your model first', p: "There are three models. Parent-led homeschooling, where a parent plans and teaches everything. Tutor-supported homeschooling, where a parent leads but hires tutors for difficult subjects. And online school, where qualified teachers teach live lessons on a timetable and the parent supervises. In Lagos, where many households have two working parents, the third model is often the only sustainable one beyond primary school. Be honest about the hours you can give." },
      { h: 'Power and internet', p: "This is where Lagos homeschooling succeeds or fails. Plan a power backup for lesson hours: an inverter with batteries, solar, or a generator. Have two internet options, such as fibre or a router plus mobile data on a different network. Test both at lesson times before term starts. A laptop with a webcam and headset is far better than a phone. Families who solve power and internet in advance rarely have problems; families who hope for the best usually do." },
      { h: 'Space and routine', p: "Lagos homes can be busy. Set aside a consistent, quiet place for learning, away from the television and household traffic. Keep a fixed start time and a written weekly timetable. Children who learn at home need routine even more than children in school, because there is no bell to mark the day." },
      { h: 'Costs in naira', p: "Costs depend on the model. Parent-led homeschooling costs mainly materials, exam fees and activities. With Smartious, " + FEE.charAt(0).toLowerCase() + FEE.slice(1) + " At about NGN 1,550 to the dollar (October 2026; the naira fluctuates), USD 423 is roughly NGN 656,000 a month, and USD 15 is roughly NGN 23,000. Add power, internet, equipment and exam entry fees. Subtract transport, uniforms and school levies. Our Nigeria fees guide goes into detail." },
      { h: 'Exams from Lagos', p: "For the British route, students sit Cambridge and Pearson Edexcel IGCSE and A Level as private candidates at authorised centres such as the British Council, which has run private candidate sittings in Lagos. WAEC and NECO also run exams for private candidates, and Nigerian university admission runs through JAMB. Plan travel to the exam centre on exam mornings with Lagos traffic in mind. Our IGCSE vs WAEC guide helps you choose." },
      { h: 'Staying social in Lagos', p: "Lagos has a lot to offer children learning at home: sports academies, swimming clubs, music and art classes, coding clubs, church and mosque youth groups, and homeschool meet-ups. Plan at least two regular activities a week outside the home. Live online classes, where a child sees the same classmates daily, help too, but they are not a substitute for running around with friends." },
      { h: 'The law', p: "Nigerian law does not expressly authorise or regulate parent-led homeschooling, and the Universal Basic Education Act places a duty on parents in relation to primary and junior secondary education. Lagos State has its own education laws. If you are unsure, check with the Lagos State Universal Basic Education Board or the Lagos State Ministry of Basic and Secondary Education, and keep good records. Our guide to whether homeschooling is legal in Nigeria explains this carefully." },
      { h: 'How to start', p: "Message admissions on WhatsApp at +254 745 021 212. We arrange a placement assessment, recommend a class and level, and share the timetable in Nigerian time. Our next intake starts on 5 January 2027. Apply by December." },
      { h: "A sample week", p: "Monday to Friday, live lessons start at a fixed time in the morning, with breaks between subjects and a longer lunch. Homework fills part of the afternoon. Two afternoons a week are for sport or swimming, one for music or art, and one for a club or meet-up. Saturday is for family, outings and any catch-up. Write the week down and put it on the wall; children cope with change much better when they can see the plan." },
      { h: "Common mistakes to avoid", p: "Starting without a power and internet backup. Letting the start time drift later each week. Leaving exam registration to the last minute and paying late fees. Expecting a young child to work alone for hours. And letting friendships and activities slip during busy months. Each is easy to prevent with a written plan that you review once a term." },
    ],
    faqs: [
      { q: 'Is homeschooling common in Lagos?', a: 'It is growing, especially among families looking for flexibility, smaller classes or international curricula. We cannot give reliable numbers.' },
      { q: 'What about power cuts during lessons?', a: 'Plan a power backup and a second internet option, and test them at lesson times before term starts.' },
      { q: 'Where do Lagos homeschoolers sit IGCSE?', a: 'As private candidates at authorised centres such as the British Council, which has run sittings in Lagos.' },
      { q: 'How much does online school cost in Lagos?', a: 'From USD 423 a month for Primary, roughly NGN 656,000 at about NGN 1,550 to the dollar (October 2026; the naira fluctuates), payable termly.' },
    ],
    conclusion: "Homeschooling in Lagos works when you plan power, internet, routine and social life as carefully as the curriculum. Choose the model you can sustain, check the law, and plan exams early. Message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Nigeria',
    countryLinks: [
      { name: 'Online school in Nigeria', slug: 'nigeria', note: 'Programmes, timetables and fees for Nigerian families.' },
    ],
    pageLinksHeading: 'Our Lagos page and next steps',
    pageLinks: [
      { name: 'Homeschool in Lagos', href: '/homeschool-lagos-ng', note: 'Our Lagos programme, timetable and fees.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Home Lessons in Lagos', slug: 'home-lessons-lagos', note: 'Home tutoring in Lagos explained.' },
      { name: 'Online School Fees in Nigeria', slug: 'online-school-fees-nigeria', note: 'Approximate naira figures.' },
      { name: 'Is Homeschooling Legal in Nigeria?', slug: 'is-homeschooling-legal-in-nigeria', note: 'A careful look at the law.' },
    ],
  },

  // ═══════════════ CITY GUIDE: ABUJA ═══════════════
  'homeschool-abuja': {
    cat: 'homeschool', country: 'nigeria',
    img: 'linear-gradient(135deg,#0A1A0F,#1E2F5F)', splash: IMG_AFR, splashAlt: 'An Abuja student studying at home with a live online teacher',
    t: 'Homeschooling in Abuja: A Practical Guide for Parents',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Homeschooling in Abuja: A Practical Guide',
    metaDesc: 'How to homeschool in Abuja: choosing a model, costs in naira, IGCSE and WAEC exams, FCT rules and building a social life.',
    intro: "Abuja has a large community of diplomatic, civil service, NGO and professional families, many of whom move in and out of the city on postings. That makes homeschooling and online school attractive: a child’s education can continue unchanged when the family moves. This guide is a practical how-to for Abuja parents, covering models, costs, exams, the rules in the FCT and social life. For our Abuja programme itself, see our Abuja page.",
    sections: [
      { h: 'Why Abuja families choose to learn at home', p: "The most common reasons we hear are mobility, curriculum and fit. Families on postings want continuity across moves. Others want a British, IB or American route with qualified teachers but cannot find the right school place, or find fees at their preferred schools out of reach. And some children simply need a calmer setting or a different pace than a large school can give." },
      { h: 'Choose your model', p: "Parent-led homeschooling gives the most freedom and asks the most of a parent. Tutor-supported homeschooling adds hired help for difficult subjects. Online school puts qualified teachers in charge of live lessons on a timetable while the child learns at home. For secondary school, and for families where both parents work, online school is usually the most sustainable." },
      { h: 'Setting up at home', p: "Plan reliable power for lesson hours, such as an inverter, solar system or generator, and two internet options. Use a laptop with a webcam and headset. Choose a quiet, consistent learning space and a fixed daily start time. Test everything at lesson times in the week before term begins." },
      { h: 'Costs in naira', p: "With Smartious, " + FEE.charAt(0).toLowerCase() + FEE.slice(1) + " At about NGN 1,550 to the dollar (October 2026; the naira fluctuates), USD 423 is roughly NGN 656,000 a month. Families who earn in dollars or on international contracts face less exchange risk. Add equipment, internet, power and exam entry fees, and subtract transport, uniforms and levies." },
      { h: 'Exams from Abuja', p: "For the British route, students sit Cambridge and Pearson Edexcel IGCSE and A Level as private candidates at authorised centres such as the British Council, which has run private candidate sittings in Abuja. WAEC and NECO run exams for private candidates, and Nigerian university entry runs through JAMB. Families planning to move abroad often find the IGCSE and A Level route keeps the most options open." },
      { h: 'Rules in the FCT', p: "Nigerian law does not expressly authorise or regulate parent-led homeschooling, and the Universal Basic Education Act places duties on parents in relation to basic education. In the FCT, basic education is overseen by the FCT Universal Basic Education Board under the FCT Education Secretariat. If you are unsure, check with them, and keep good records. Diplomatic families should also check any rules that apply through their own country or organisation." },
      { h: 'Social life in Abuja', p: "Abuja has sports clubs, swimming, tennis, music and art classes, faith groups and international community events. Plan at least two regular activities a week outside the home, and keep up friendships from any previous school. Children who learn at home thrive when social time is planned, not left to chance." },
      { h: 'How to start', p: "Message admissions on WhatsApp at +254 745 021 212. We arrange a placement assessment, recommend a class and level, and share the timetable in Nigerian time. Our next intake starts on 5 January 2027. Apply by December." },
      { h: "A sample week", p: "Live lessons start at a fixed time each weekday morning, with breaks between subjects. Homework and reading fill part of the afternoon. Two afternoons a week are for sport, one for music or art, and one for a club or community activity. Weekends are for family and outings. If a move is coming, keep the weekly pattern the same in the new home, so the only change is the view from the window." },
      { h: "Common mistakes to avoid", p: "Starting without power and internet backups. Letting the start time drift later each week. Leaving exam registration until the last minute. Assuming a younger child can work alone all day. And letting social activities slip during busy months. Each is easy to prevent with a written plan reviewed once a term." },
      { h: "Keeping records", p: "Keep a simple file for each child: the weekly timetable, termly reports, samples of work, exam entries and results. If you move abroad or back into a school, the receiving school will want to see what your child has studied. Records also help if anyone asks about your child’s education." },
    ],
    faqs: [
      { q: 'Can my child keep the same school if we leave Abuja?', a: 'With an online school, yes. Lessons continue wherever you live, with the timetable adjusted for your new time zone.' },
      { q: 'Where do Abuja homeschoolers sit IGCSE?', a: 'As private candidates at authorised centres such as the British Council, which has run sittings in Abuja.' },
      { q: 'Who oversees basic education in the FCT?', a: 'The FCT Universal Basic Education Board, under the FCT Education Secretariat.' },
      { q: 'How much does it cost?', a: 'From USD 423 a month for Primary, roughly NGN 656,000 (approximate, October 2026; the naira fluctuates), payable termly.' },
    ],
    conclusion: "Homeschooling in Abuja suits mobile families and children who need a different setting, as long as you plan power, routine, exams and social life. Check the FCT rules and keep records. Message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Nigeria',
    countryLinks: [
      { name: 'Online school in Nigeria', slug: 'nigeria', note: 'Programmes, timetables and fees for Nigerian families.' },
    ],
    pageLinksHeading: 'Our Abuja page and next steps',
    pageLinks: [
      { name: 'Homeschool in Abuja', href: '/homeschool-abuja-ng', note: 'Our Abuja programme, timetable and fees.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Private Candidate IGCSE in Nigeria', slug: 'private-candidate-igcse-nigeria', note: 'Registering through the British Council.' },
      { name: 'IGCSE vs WAEC', slug: 'igcse-vs-waec', note: 'Choosing an exam route.' },
      { name: 'Is Homeschooling Legal in Nigeria?', slug: 'is-homeschooling-legal-in-nigeria', note: 'A careful look at the law.' },
    ],
  },

  // ═══════════════ CITY GUIDE: PORT HARCOURT ═══════════════
  'homeschool-port-harcourt': {
    cat: 'homeschool', country: 'nigeria',
    img: 'linear-gradient(135deg,#0A1A0F,#C9973A)', splash: IMG_AFR, splashAlt: 'A Port Harcourt student in a live online lesson at home',
    t: 'Homeschooling in Port Harcourt: A Practical Guide for Parents',
    date: 'October 2026 · 9 min read',
    ...AUTHOR,
    metaTitle: 'Homeschooling in Port Harcourt: A Practical Guide',
    metaDesc: 'How to homeschool in Port Harcourt: choosing a model, power and internet, costs in naira, IGCSE and WAEC exams and Rivers State rules.',
    intro: "Port Harcourt families, many connected to the energy sector, often face rotations, relocations and long working hours, and some live far from the schools they would choose. Homeschooling and online school offer a way to keep a child’s education steady through all of that. This guide is a practical how-to for Port Harcourt parents, covering models, setup, costs, exams, the rules in Rivers State and social life. For our programme itself, see our Port Harcourt page.",
    sections: [
      { h: 'Why Port Harcourt families learn at home', p: "We hear three reasons most. Work patterns, such as rotations and relocations, that make a fixed school difficult. A wish for a British, IB or American curriculum with qualified teachers. And a child who needs a smaller, calmer setting. Online school answers the first two directly, and often helps with the third." },
      { h: 'Choose your model', p: "Parent-led homeschooling works for some families with a parent at home and confidence across subjects. Tutor-supported homeschooling adds hired help. Online school puts qualified teachers in charge of live lessons on a timetable. For families with a parent on rotation, online school is usually the most reliable, because the timetable does not depend on who is at home." },
      { h: 'Power, internet and space', p: "Plan a power backup for lesson hours and two internet options, and test both at lesson times before term starts. Use a laptop with a webcam and headset. Choose a quiet, consistent learning space and a fixed start time. Families in estates with shared power should check supply during school hours." },
      { h: 'Costs in naira', p: "With Smartious, " + FEE.charAt(0).toLowerCase() + FEE.slice(1) + " At about NGN 1,550 to the dollar (October 2026; the naira fluctuates), USD 423 is roughly NGN 656,000 a month. Families paid in dollars face less exchange risk. Add equipment, internet, power and exam entry fees, and subtract transport, uniforms and levies." },
      { h: 'Exams from Port Harcourt', p: "For the British route, students sit Cambridge and Pearson Edexcel IGCSE and A Level as private candidates at authorised centres such as the British Council, which has run private candidate sittings in Port Harcourt. WAEC and NECO run exams for private candidates, and Nigerian university entry runs through JAMB. Check the venue for each series, since centres can change." },
      { h: 'Rules in Rivers State', p: "Nigerian law does not expressly authorise or regulate parent-led homeschooling, and the Universal Basic Education Act places duties on parents in relation to basic education. Rivers State has its own education laws and a State Universal Basic Education Board. If you are unsure, check with the board or the Rivers State Ministry of Education, and keep good records." },
      { h: 'Social life', p: "Plan regular activities outside the home: sports clubs, swimming, music, faith groups and community events. If a parent is away on rotation, make these part of the fixed weekly routine so they do not drop. Live online classes help with daily contact, but children also need time with friends in person." },
      { h: 'How to start', p: "Message admissions on WhatsApp at +254 745 021 212. We arrange a placement assessment, recommend a class and level, and share the timetable in Nigerian time. Our next intake starts on 5 January 2027. Apply by December." },
      { h: "A sample week", p: "Live lessons start at a fixed time each weekday morning, with breaks between subjects and a longer lunch. Homework fills part of the afternoon. Two afternoons a week are for sport or swimming, one for music or art, and one for a club or faith group. Weekends are for family. Put the plan on the wall, so whoever is at home that week can keep to it." },
      { h: "Common mistakes to avoid", p: "Relying on a single power source or network. Letting routines slip when a parent is away. Registering late for exams. Expecting a young child to work unsupervised. And neglecting friendships. A written weekly plan, a backup for power and internet, and a calendar of exam dates prevent almost all of them." },
      { h: "Keeping records", p: "Keep a file for each child with the timetable, termly reports, samples of work, exam entries and results. If the family relocates, or your child returns to a school, the receiving school will want to see what has been studied. Good records also help if an official asks about your child’s education, and they make it easier to spot gaps early. Smartious provides termly reports and records of study." },
      { h: "Planning for a move", p: "If a relocation is likely, plan exams and records with it in mind. Ask us early how the timetable would change in your new time zone, and check which exam centres serve the new location." },
    ],
    faqs: [
      { q: 'Does online school work with rotation schedules?', a: 'Yes. The timetable runs whether a parent is home or away, and the parent at home supervises.' },
      { q: 'Where do Port Harcourt homeschoolers sit IGCSE?', a: 'As private candidates at authorised centres such as the British Council, which has run sittings in Port Harcourt. Check the venue for each series.' },
      { q: 'What about power cuts?', a: 'Plan a power backup and a second internet option, and test them before term starts.' },
      { q: 'How much does it cost?', a: 'From USD 423 a month for Primary, roughly NGN 656,000 (approximate, October 2026; the naira fluctuates), payable termly.' },
    ],
    conclusion: "Homeschooling in Port Harcourt can give your child stability through rotations and relocations. Plan power, routine, exams and social life, check Rivers State rules, and keep records. Message admissions on WhatsApp at +254 745 021 212.",
    countryLinksHeading: 'Smartious in Nigeria',
    countryLinks: [
      { name: 'Online school in Nigeria', slug: 'nigeria', note: 'Programmes, timetables and fees for Nigerian families.' },
    ],
    pageLinksHeading: 'Our Port Harcourt page and next steps',
    pageLinks: [
      { name: 'Homeschool in Port Harcourt', href: '/homeschool-port-harcourt-ng', note: 'Our Port Harcourt programme, timetable and fees.' },
      PRICING, CONTACT, WHATSAPP,
    ],
    articleLinksHeading: 'Read next',
    articleLinks: [
      { name: 'Online School Fees in Nigeria', slug: 'online-school-fees-nigeria', note: 'Approximate naira figures.' },
      { name: 'Private Candidate IGCSE in Nigeria', slug: 'private-candidate-igcse-nigeria', note: 'Registering through the British Council.' },
      { name: 'Homeschooling in Lagos', slug: 'homeschool-lagos', note: 'The Lagos guide.' },
    ],
  },
}
