/* eslint-disable */
/**
 * articlesPart18.js: UAE guides, November 2026. Written for the searches
 * the UAE pages were missing in Search Console: "online school(s) in UAE",
 * "home schooling in Abu Dhabi", "home schooling curriculum in UAE" and
 * "KHDA approved home schools in Dubai".
 *
 * Positioning, as on every UAE page: Smartious does not claim approval or
 * licensing from KHDA, ADEK or the Ministry of Education. What protects a
 * child's options is the qualification: Cambridge and Pearson Edexcel
 * certificates earned as a private candidate. Equivalency figures follow
 * the Ministry guide as summarised in articlesPart10.js
 * (online-school-recognised-uae); readers are always sent to the current
 * guide. Fees: from USD 423/month for Primary (about AED 1,553), varying by
 * curriculum and level. Smartious does not offer tutoring in the UAE.
 */

const UAE_PAGES = [
  { name: 'Online school and homeschooling in the UAE', href: '/online-school/uae', note: 'Our main page for UAE families: curricula, Gulf timetable, fees.' },
  { name: 'Online school and homeschooling in Dubai', href: '/homeschool-dubai-ae', note: 'Live classes for Dubai families, on UAE time.' },
  { name: 'Home schooling in Abu Dhabi', href: '/homeschool-abu-dhabi-ae', note: 'For families in the capital, Khalifa City to Saadiyat.' },
  { name: 'Online school in Sharjah', href: '/homeschool-sharjah-ae', note: 'For Sharjah families.' },
  { name: 'Book an assessment', href: '/assessment', note: 'Every admission starts with a placement assessment.' },
]
const COUNTRY = [{ name: 'Online school in the UAE', slug: 'uae', note: 'Our main page for UAE families.' }]

export const ARTICLES_PART_18 = {
 "online-school-uae-how-it-works": {
  "featured": true,
  "cat": "online-school",
  "country": "uae",
  "img": "linear-gradient(135deg,#0A1020,#8B1A2E)",
  "splash": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=75",
  "splashAlt": "The Dubai skyline at dusk",
  "t": "Online School in the UAE: How It Works, Who It Suits, and How It Differs From Homeschooling",
  "date": "November 2026 · 8 min read",
  "published": "2026-11-06",
  "author": "Alfred Ouko",
  "role": "Founder",
  "metaTitle": "Online School in UAE: How It Works (2026 Guide)",
  "metaDesc": "How online school works for UAE families: live classes on UAE time, exams as a private candidate, recognition, and the difference from homeschooling.",
  "intro": "Online school in the UAE means a full school day at home: live classes with qualified subject teachers, on a timetable, with marked work, reports and real exams at the end. It is not the same as homeschooling, where a parent plans and teaches, although many UAE families use the two words for the same thing. This guide explains how an online school works for families in Dubai, Abu Dhabi, Sharjah and the northern emirates, who it suits, and the questions to settle before you start.",
  "sections": [
   {
    "h": "Online school or homeschooling: the difference",
    "p": "With homeschooling, the parent chooses the curriculum, teaches the lessons and keeps the records. With an online school, the school does those things: subject teachers teach live classes, set and mark the work, track progress and enter students for exams, while the family supervises at home. Most UAE families who search for homeschooling want the second, because two working parents in Dubai or Abu Dhabi rarely have time to teach IGCSE Chemistry. Smartious is an online school: a timetable of live lessons, the same subject teachers all term, and termly reports."
   },
   {
    "h": "A school day on UAE time",
    "p": "The UAE runs on Gulf Standard Time, one hour ahead of our teachers in Nairobi, so a lesson at 9:00 in Nairobi is at 10:00 in Dubai. The live timetable therefore falls inside the normal UAE school day, Monday to Friday, with no evening or overnight classes. Classes are small, so every student is known by name, and the day ends early enough for sport, swimming, music and the Dubai summer routine."
   },
   {
    "h": "Is online school recognised in the UAE?",
    "p": [
     "An online school based outside the UAE is not a licensed UAE school. KHDA licenses private schools in Dubai and ADEK in Abu Dhabi, and both have said they do not recognise homeschooling programmes; Smartious does not claim approval from either, or from the Ministry of Education.",
     "What protects your child's options is the qualification. Smartious students sit Cambridge and Pearson Edexcel IGCSE, AS and A-Level exams as private candidates at authorised centres such as the British Council in the UAE, and receive the same certificates as school candidates. The Ministry of Education then decides equivalency. Its guide has asked for five IGCSE or GCSE passes and two AS Levels or one A-Level, not counting Arabic and Islamic Education. Read the current guide on moe.gov.ae before your child chooses subjects."
    ]
   },
   {
    "h": "Who online school suits in the UAE",
    "p": "Families waiting for a place at an oversubscribed school; families who arrive mid-year; families on rotation with companies, embassies or airlines who need one curriculum that travels; students who want to move faster or more slowly than a class of 25; athletes, performers and young people with health needs; and families in Ras Al Khaimah, Fujairah or the desert edge of Abu Dhabi who face long drives to the nearest British or American school. It suits expatriate families. Emirati families are subject to compulsory schooling rules and should speak to the Ministry of Education first."
   },
   {
    "h": "What it costs",
    "p": "Smartious fees start from USD 423 a month for Primary, about AED 1,553 at the fixed dirham rate, payable termly, and vary by curriculum and level. Exam entry fees are paid to the exam centre. Most families compare this with a premium Dubai or Abu Dhabi school; our guide to homeschooling fees in the UAE sets out the figures."
   },
   {
    "h": "Moving back into a UAE school",
    "p": "Many students return to a school in Dubai or Abu Dhabi after a year or two online. Schools decide admission and placement themselves, often after their own assessment. Keep reports, attendance records and exam certificates, ask the school you hope to join what it needs before you start, and check whether equivalency applies to the grades studied online. We provide reports, attendance records and transcripts for the application."
   },
   {
    "h": "Questions to settle before you start",
    "p": "Which curriculum will your child follow, and does it match the school or university they are aiming for? Where will they sit exams, and who registers them? What will your child need for Ministry equivalency or a return to a UAE school? And what does the school provide in writing: reports, attendance records, transcripts? A provider that answers these clearly, including what it is not, is one you can plan with."
   }
  ],
  "faqs": [
   { "q": "Is online school legal in the UAE?", "a": "For expatriate families, online school and homeschooling are widely used and the authorities have said homeschooling is not prohibited, although KHDA and ADEK do not license or recognise homeschooling programmes. Emirati families should speak to the Ministry of Education first." },
   { "q": "What is the difference between online school and homeschooling?", "a": "In homeschooling the parent teaches. In an online school, qualified teachers teach live classes, mark the work and write the reports, and the family supervises at home." },
   { "q": "Do online school students in the UAE sit real exams?", "a": "Yes. Students sit Cambridge or Pearson Edexcel IGCSE, AS and A-Level exams as private candidates at authorised centres such as the British Council in the UAE." },
   { "q": "How much is online school in the UAE?", "a": "Smartious starts from USD 423 a month for Primary (about AED 1,553), payable termly; fees vary by curriculum and level." }
  ],
  "conclusion": "Online school in the UAE works when the plan is clear from the start: the curriculum, the exams, and what your child will need next. Book an assessment and we will place your child and set out the route.",
  "countryLinksHeading": "Smartious in the UAE",
  "countryLinks": COUNTRY,
  "pageLinksHeading": "Online school pages for UAE families",
  "pageLinks": UAE_PAGES,
  "articleLinksHeading": "Read next",
  "articleLinks": [
   { "name": "Is Online School Recognised in the UAE?", "slug": "online-school-recognised-uae", "note": "KHDA, ADEK and equivalency." },
   { "name": "Homeschooling in UAE Fees", "slug": "online-school-fees-uae", "note": "Costs in AED." },
   { "name": "Home Schooling Curriculum in the UAE", "slug": "home-schooling-curriculum-uae", "note": "British, American or IB." }
  ]
 },

 "homeschooling-abu-dhabi": {
  "featured": true,
  "cat": "homeschool",
  "country": "uae",
  "img": "linear-gradient(135deg,#0A1020,#1B3A5C)",
  "splash": "https://images.unsplash.com/photo-1577086664693-894d8405334a?w=1200&q=75",
  "splashAlt": "Abu Dhabi skyline across the water",
  "t": "Home Schooling in Abu Dhabi: ADEK, Curriculum, Fees and How to Start",
  "date": "November 2026 · 8 min read",
  "published": "2026-11-06",
  "author": "Alfred Ouko",
  "role": "Founder",
  "metaTitle": "Home Schooling in Abu Dhabi: ADEK & Fees Guide (2026)",
  "metaDesc": "Home schooling in Abu Dhabi: what ADEK regulates, expat and Emirati families, curriculum choices, exams, fees and moving back into an Abu Dhabi school.",
  "intro": "Home schooling in Abu Dhabi has grown with the capital itself. Families in Khalifa City, Al Reem, Yas, Saadiyat and Mohammed Bin Zayed City face long drives, waiting lists and premium fees, and many have moved to an online school that keeps their child on a British or American route. This guide explains what ADEK regulates, which families it suits, how exams and recognition work, and what to check before you start.",
  "sections": [
   {
    "h": "What ADEK regulates",
    "p": "ADEK, the Abu Dhabi Department of Education and Knowledge, licenses and inspects private schools in the emirate. It does not license online schools based outside the UAE, and it has not set out a registration route for expatriate families who home-school. That is why the qualification, not the provider, is what protects your child's options. Smartious does not claim ADEK approval. Check the current position with ADEK for your family before you start."
   },
   {
    "h": "Expatriate and Emirati families",
    "p": "Expatriate families in Abu Dhabi commonly home-school through an international online programme, and press reports and official statements have said homeschooling is not prohibited for expatriates. Emirati families are subject to compulsory schooling rules, with Arabic, Islamic Education and social studies requirements, and should speak to ADEK or the Ministry of Education before choosing home schooling."
   },
   {
    "h": "Choosing a curriculum",
    "p": "Most Abu Dhabi families choose the British route, Cambridge or Pearson Edexcel through IGCSE and A-Level, because it matches the British schools in the capital and leads to Ministry equivalency. Families aiming for American universities, or coming from an American school, choose the American curriculum with AP. The IB Diploma suits families on diplomatic or corporate rotation who may move to an IB school next."
   },
   {
    "h": "Exams and equivalency",
    "p": "Students sit Cambridge and Pearson Edexcel exams as private candidates at authorised centres such as the British Council in the UAE, and receive the same certificates as school candidates. Entry deadlines fall months before each series, so plan the year around them. For Grade 12 equivalency, the Ministry of Education's guide has asked for five IGCSE or GCSE passes and two AS Levels or one A-Level, not counting Arabic and Islamic Education. Read the current guide on moe.gov.ae before subjects are chosen."
   },
   {
    "h": "A school day without the commute",
    "p": "Live classes run on Gulf Standard Time, inside the normal UAE school day, in small groups with the same subject teachers all term. For a family in Khalifa City or on Yas Island, the drive to a school on the main island can take an hour each way at peak time; online, the school day starts at the desk at home, and the afternoon is free for sport, the beach or the club."
   },
   {
    "h": "Fees",
    "p": "Smartious fees start from USD 423 a month for Primary, about AED 1,553 at the fixed dirham rate, payable termly, and vary by curriculum and level. Corporate education allowances often accept our termly invoices; check your employer's policy."
   },
   {
    "h": "Moving back into an Abu Dhabi school",
    "p": "Schools decide admission and placement themselves and often run their own assessment. Keep reports, attendance records and exam certificates, ask the school you hope to join what it needs, and check whether your child will need equivalency for the grades studied online. We provide the reports, attendance records and transcripts schools ask for."
   }
  ],
  "faqs": [
   { "q": "Is home schooling allowed in Abu Dhabi?", "a": "Expatriate families commonly home-school with an international online programme, and homeschooling has been described as not prohibited for expatriates. ADEK regulates private schools, not online schools abroad. Emirati families should ask ADEK or the Ministry of Education first." },
   { "q": "Does ADEK approve online schools?", "a": "ADEK licenses schools in Abu Dhabi. It does not license online schools based outside the UAE. Smartious does not claim ADEK approval." },
   { "q": "Where do Abu Dhabi home-schooled students sit IGCSE exams?", "a": "As private candidates at authorised centres such as the British Council in the UAE. Entry deadlines fall months before each series." },
   { "q": "How much does home schooling cost in Abu Dhabi?", "a": "Smartious starts from USD 423 a month for Primary (about AED 1,553), payable termly; fees vary by curriculum and level." }
  ],
  "conclusion": "Home schooling in Abu Dhabi works well for expatriate families who plan the route: curriculum, exams, and what the next school or university will ask for. Book an assessment and we will set it out for your child.",
  "countryLinksHeading": "Smartious in the UAE",
  "countryLinks": COUNTRY,
  "pageLinksHeading": "Online school pages for UAE families",
  "pageLinks": UAE_PAGES,
  "articleLinksHeading": "Read next",
  "articleLinks": [
   { "name": "Online School in the UAE: How It Works", "slug": "online-school-uae-how-it-works", "note": "Online school vs homeschooling." },
   { "name": "Is Online School Recognised in the UAE?", "slug": "online-school-recognised-uae", "note": "KHDA, ADEK and equivalency." },
   { "name": "Returning to School After Homeschooling in the Gulf", "slug": "return-to-school-after-homeschooling-gulf", "note": "Re-enrolment and transfer." }
  ]
 },

 "home-schooling-curriculum-uae": {
  "featured": false,
  "cat": "homeschool",
  "country": "uae",
  "img": "linear-gradient(135deg,#1A0A0A,#7D1025)",
  "splash": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=75",
  "splashAlt": "A child working through a lesson at a desk",
  "t": "Home Schooling Curriculum in the UAE: British, American or IB?",
  "date": "November 2026 · 7 min read",
  "published": "2026-11-06",
  "author": "Alfred Ouko",
  "role": "Founder",
  "metaTitle": "Home Schooling Curriculum in UAE: British, American, IB",
  "metaDesc": "Choosing a home schooling curriculum in the UAE: British (Cambridge, Edexcel), American with AP, or IB, and how each leads to exams and equivalency.",
  "intro": "The curriculum is the most important choice a UAE homeschooling family makes, because it decides which exams your child sits, which schools they can move back into, and how the Ministry of Education reads their certificates. Most families choose between three routes: British, American and IB. This guide compares them for families in Dubai, Abu Dhabi and the northern emirates.",
  "sections": [
   {
    "h": "The British route: Cambridge and Pearson Edexcel",
    "p": "The most common choice in the UAE, because it matches the large number of British schools in Dubai and Abu Dhabi. Children move through Primary and Lower Secondary to IGCSE at around 16 and AS and A-Level at 17 and 18. IGCSE and A-Level exams are sat as a private candidate at authorised centres such as the British Council in the UAE, and the certificates are the same as a school candidate's. For Grade 12 equivalency, the Ministry of Education's guide has asked for five IGCSE or GCSE passes and two AS Levels or one A-Level, not counting Arabic and Islamic Education."
   },
   {
    "h": "The American route: K-12 with AP",
    "p": "The American curriculum runs from Kindergarten to Grade 12, with Advanced Placement (AP) courses in the later years. It suits families coming from an American school in Dubai or Abu Dhabi, and students aiming for US universities. AP exams are sat at authorised schools and test centres. Equivalency for an American high school diploma follows its own Ministry rules, so check the current requirements early."
   },
   {
    "h": "The IB route",
    "p": "The IB Diploma suits families on diplomatic or corporate rotation who may move to an IB school in another country, and students who want breadth across six subjects plus the Extended Essay. It is demanding to deliver at home, so most families take it through a school or an online provider rather than teaching it themselves."
   },
   {
    "h": "Arabic and Islamic Education",
    "p": "UAE schools teach Arabic, and Islamic Education for Muslim students, and some families want to keep both going at home, especially if a return to a UAE school is likely. Ask the school you may join what it will expect, because requirements differ by nationality and grade."
   },
   {
    "h": "How to choose",
    "p": "Start from where your child is going next. If they may return to a British school in the UAE, stay British. If they are aiming for US universities, the American route with AP is the direct one. If the family moves every few years, choose the curriculum most widely taught in the places you are likely to live. And if you are not sure, choose the route that keeps the most doors open: for most UAE expatriate families, that is Cambridge or Pearson Edexcel through IGCSE and A-Level."
   },
   {
    "h": "Teaching it, or having it taught",
    "p": "A curriculum is a plan; somebody still has to teach it. Parents can teach Primary themselves with good materials, but IGCSE and A-Level sciences, mathematics and languages need specialist teachers. That is where an online school comes in: Smartious teaches the British and American curricula live on UAE time, with fees from USD 423 a month for Primary (about AED 1,553), varying by curriculum and level."
   }
  ],
  "faqs": [
   { "q": "What is the best home schooling curriculum in the UAE?", "a": "For most expatriate families, the British route (Cambridge or Pearson Edexcel through IGCSE and A-Level), because it matches UAE British schools and leads to Ministry equivalency. The American curriculum with AP suits families aiming for US universities." },
   { "q": "Can a homeschooled child in the UAE get Grade 12 equivalency?", "a": "Yes, through their exam certificates. For the British route, the Ministry's guide has asked for five IGCSE or GCSE passes and two AS or one A-Level, not counting Arabic and Islamic Education. Check the current guide on moe.gov.ae." },
   { "q": "Do homeschoolers in the UAE need to study Arabic?", "a": "It depends on nationality, grade and whether your child will return to a UAE school. Ask the school you may join, and the Ministry of Education, what will be required." }
  ],
  "conclusion": "Choose the curriculum for where your child is going next, then plan the exams around it. Book an assessment and we will recommend the route that fits.",
  "countryLinksHeading": "Smartious in the UAE",
  "countryLinks": COUNTRY,
  "pageLinksHeading": "Online school pages for UAE families",
  "pageLinks": UAE_PAGES,
  "articleLinksHeading": "Read next",
  "articleLinks": [
   { "name": "Online School in the UAE: How It Works", "slug": "online-school-uae-how-it-works", "note": "Online school vs homeschooling." },
   { "name": "IGCSE and A Level Exam Centres in the Gulf", "slug": "igcse-exam-centres-gulf", "note": "Registering as a private candidate." },
   { "name": "Homeschooling in UAE Fees", "slug": "online-school-fees-uae", "note": "Costs in AED." }
  ]
 },

 "khda-homeschooling-dubai": {
  "featured": false,
  "cat": "homeschool",
  "country": "uae",
  "img": "linear-gradient(135deg,#0A1220,#1B2B52)",
  "splash": "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=75",
  "splashAlt": "Dubai Marina towers",
  "t": "KHDA and Homeschooling in Dubai: What KHDA Approves, and What It Does Not",
  "date": "November 2026 · 6 min read",
  "published": "2026-11-06",
  "author": "Alfred Ouko",
  "role": "Founder",
  "metaTitle": "KHDA Approved Homeschooling in Dubai? What KHDA Covers",
  "metaDesc": "Is there KHDA approved homeschooling in Dubai? What KHDA licenses, its own scheme for enrolled students, and how online-school families protect their options.",
  "intro": "Parents searching for KHDA approved homeschooling in Dubai usually want one reassurance: that their child's education will count. The honest answer starts with what KHDA does. It licenses and inspects private schools in Dubai; it has said it does not recognise homeschooling programmes; and it runs its own scheme for students enrolled at Dubai private schools who learn partly at home. This guide explains each, and how families who choose an online school keep their options open.",
  "sections": [
   {
    "h": "What KHDA does",
    "p": "The Knowledge and Human Development Authority licenses, inspects and rates private schools in Dubai, and publishes those ratings. A school that operates in Dubai needs KHDA approval. An online school based outside the UAE is not a Dubai school, and KHDA approval is not something it can hold simply because Dubai students attend it."
   },
   {
    "h": "What KHDA has said about homeschooling",
    "p": "KHDA has stated publicly that it does not recognise homeschooling programmes. Press reports have also said homeschooling is not prohibited for expatriate families, and many expatriate families in Dubai have home-schooled for years through international online schools. Emirati families are subject to compulsory schooling rules and should speak to the Ministry of Education first. Statements change, so check the current position with KHDA."
   },
   {
    "h": "KHDA's own scheme for enrolled students",
    "p": "KHDA has offered a programme, Rahhal, under which a student stays registered at a participating Dubai private school while learning part of the time outside it. It is not independent homeschooling: the student remains enrolled at the school, which manages the arrangement. Ask your school whether it takes part and what the current terms are."
   },
   {
    "h": "Why the qualification matters more than the label",
    "p": "Because no online school abroad can be KHDA-approved, the question that decides your child's future is whether their certificates count. Smartious students sit Cambridge and Pearson Edexcel IGCSE, AS and A-Level exams as private candidates at authorised centres such as the British Council in the UAE, and receive the same certificates as Dubai school candidates. The Ministry of Education then decides equivalency. Smartious does not claim KHDA approval, and we think every provider should say plainly what it is and is not."
   },
   {
    "h": "Be careful with \"KHDA approved\" claims",
    "p": "Some providers advertise KHDA approval or permits. A permit can relate to a specific activity, such as a training centre, rather than to running a school. If a provider claims KHDA approval, ask exactly what it covers and check it against KHDA's published lists before you rely on it."
   },
   {
    "h": "Moving back into a KHDA school",
    "p": "Dubai schools decide admission and placement themselves, often with their own assessment, and may ask for a transfer certificate where one exists, reports and attendance records. Ask the school you hope to join what it needs before you start online school, and keep every report and certificate. We provide reports, attendance records and transcripts for the application."
   }
  ],
  "faqs": [
   { "q": "Is there KHDA approved homeschooling in Dubai?", "a": "KHDA licenses private schools, not homeschooling programmes; it has said it does not recognise homeschooling programmes. Its Rahhal scheme is for students who stay enrolled at a Dubai private school." },
   { "q": "Is Smartious approved by KHDA?", "a": "No. Smartious is an online school based outside the UAE and does not claim KHDA approval. Students sit Cambridge and Pearson Edexcel exams as private candidates, which is what counts for equivalency." },
   { "q": "Can my child return to a Dubai school after online school?", "a": "Usually, yes. Schools decide admission and placement themselves; keep reports, attendance records and exam certificates, and ask the school what it needs before you start." }
  ],
  "conclusion": "KHDA approval is the wrong test for an online school abroad; the right one is whether your child's qualifications will count and whether the next school will take them. Book an assessment and we will set out the route for your child.",
  "countryLinksHeading": "Smartious in the UAE",
  "countryLinks": COUNTRY,
  "pageLinksHeading": "Online school pages for UAE families",
  "pageLinks": [
   { "name": "KHDA", "href": "https://www.khda.gov.ae", "note": "Regulator of private schools in Dubai." },
   { "name": "UAE Ministry of Education", "href": "https://www.moe.gov.ae", "note": "Certificate equivalency guides." },
   ...UAE_PAGES
  ],
  "articleLinksHeading": "Read next",
  "articleLinks": [
   { "name": "Is Online School Recognised in the UAE?", "slug": "online-school-recognised-uae", "note": "KHDA, ADEK and equivalency." },
   { "name": "Homeschooling in Dubai: Complete Guide for Expats", "slug": "homeschooling-dubai-expats-2026", "note": "The full Dubai guide." },
   { "name": "Online School in the UAE: How It Works", "slug": "online-school-uae-how-it-works", "note": "Online school vs homeschooling." }
  ]
 }
}
