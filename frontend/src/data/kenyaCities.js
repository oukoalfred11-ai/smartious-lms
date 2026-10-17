// ═══════════════════════════════════════════════════════════════════
// KENYA — city pages (/homeschool-<slug>) and the Kenya hub data.
//
// Facts used on every page (keep them in step with the rest of the site):
// - Fees: from USD 423/month for Primary, payable termly; fees vary by
//   curriculum and level. One-to-one tuition USD 15/hour. Fees are
//   non-refundable once the assessment is done, the timetable created
//   and lessons started.
// - Local-currency figures are approximate, at about KSh 129/USD
//   (Oct 2026 rate): USD 423 ≈ KSh 54,600, USD 15 ≈ KSh 1,940.
// - Smartious was founded in Nairobi in 2018. Head office and learning
//   centre: Diamond Plaza I Annex, Parklands. Second centre in Karen.
// - Contacts: admissions +254 745 021 212, academic +254 182 071 920,
//   hello@smartioushomeschool.com.
// - January 2027 intake: Term 2 starts 5 January 2027.
// - Exams: Cambridge and Pearson Edexcel private-candidate entries go
//   through British Council Kenya; KCSE (remaining 8-4-4 candidates) and
//   KJSEA (end of Grade 9, CBE) are run by KNEC.
// Keep each city's content local: estates, roads, schools nearby and the
// questions parents in that city actually ask.
// ═══════════════════════════════════════════════════════════════════

const HERO_STUDY      = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1400&q=80&auto=format&fit=crop'
const HERO_TUTOR      = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1400&q=80&auto=format&fit=crop'
const HERO_CLASSROOM  = 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1400&q=80&auto=format&fit=crop'
const HERO_NOTEBOOK   = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400&q=80&auto=format&fit=crop'
const HERO_LIBRARY    = 'https://images.unsplash.com/photo-1568667256549-094345857637?w=1400&q=80&auto=format&fit=crop'

// Short shared phrases. Kept deliberately brief so each page's text is
// mostly its own.
const FEES_KE = 'Online school is from USD 423/month for Primary (≈ KSh 54,600/month at the Oct 2026 rate of about KSh 129/USD), payable termly; secondary, IGCSE, A Level and IB fees vary by curriculum and level. One-to-one tuition is USD 15/hour (≈ KSh 1,940). Fees are non-refundable once the assessment is done, the timetable created and lessons started.'
const INTAKE_KE = 'The January 2027 intake is open: Term 2 starts on 5 January 2027, and students can also join during the year after an assessment.'
const CONTACT_KE = 'Admissions: +254 745 021 212 (call or WhatsApp). Academic office: +254 182 071 920. Email: hello@smartioushomeschool.com.'
const PAY_KE = 'Families in Kenya usually pay by M-Pesa or bank transfer; card payments go through Paystack. Admissions sends the payment details with your invoice.'
const CBE_KE = 'Under Competency-Based Education (CBE, formerly CBC), learners sit KPSEA at the end of Grade 6 and KJSEA at the end of Grade 9, then move to senior school in Grade 10 with a pathway (STEM, Social Sciences, or Arts and Sports Science). KCSE continues for the remaining 8-4-4 candidates. Both are run by KNEC.'
const EXAMS_KE = 'Cambridge IGCSE and A Level, and Pearson Edexcel International GCSE and A Level, are taken as a private candidate. In Kenya, private-candidate entries are made through British Council Kenya, whose exams team is in Nairobi; entry deadlines fall several months before each series, so check the British Council Kenya website for the current dates and fees. KNEC exams (KJSEA, KCSE) are registered through a KNEC-registered centre within KNEC\'s registration window.'

export const KENYA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  // NAIROBI
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'nairobi', name: 'Nairobi', county: 'Nairobi County', region: 'Capital city · Smartious head office', heroImg: HERO_CLASSROOM,
    seoTitle: 'Online School & Homeschool Nairobi | Live IGCSE, CBC',
    seoDesc: 'Online school and homeschool in Nairobi with live IGCSE, A-Level and CBC classes. Parklands and Karen centres. From USD 423/month. January 2027 intake.',
    primaryKeyword: 'Online school and homeschooling in Nairobi',
    heroTagline: 'Live online classes and in-person homeschooling for families in Karen, Westlands, Kilimani, Lavington, Runda, Kileleshwa and across the city, from our Parklands head office.',
    intro: 'Smartious was founded in Nairobi in 2018 and Nairobi is still home: our head office and learning centre are at Diamond Plaza I Annex in Parklands, and we have a second centre in Karen. Nairobi families use us in three ways. Some enrol full time in the online school, with live lessons on a weekly timetable and recordings of every class. Some choose in-person homeschooling at one of our centres, which keeps a school-day routine without the long cross-city school run. Others keep their child at their current school and book one-to-one tuition for one or two subjects. We teach Cambridge Primary, Lower Secondary, IGCSE and A Level, Pearson Edexcel, the IB, the American curriculum with AP, and Kenya\'s CBE (CBC), all in East Africa Time.',
    challenges: [
      'The school run. A 7.30 am start at a school across town can mean leaving Runda, Karen or South C before 6 am. Waiyaki Way, Ngong Road, Langata Road, Thika Road and Mombasa Road are slow in both directions at peak times, and the Expressway helps only some routes.',
      'Fees at the leading Cambridge and IB schools in Karen, Gigiri, Runda and Westlands have risen faster than many family budgets, and many add development levies, transport, lunch and exam fees on top.',
      'Places. Popular schools can have waiting lists for particular year groups, which is hard for families relocating to Nairobi mid-year or returning from abroad.',
      'The CBE change. Parents of Grade 8 and Grade 9 children want to understand KJSEA, senior school placement in Grade 10 and pathway choice, or whether to move to IGCSE instead.',
      'Finding a specialist. Good A Level Further Mathematics, Physics or IB Higher Level Chemistry teachers are in demand, and freelance tutors are hard to vet.',
    ],
    whyChoose: [
      { h: 'Two Nairobi centres plus live online classes', p: 'Our Parklands head office (Diamond Plaza I Annex) and our Karen centre host in-person homeschooling and tuition. Families anywhere in the city can also learn fully online on the same timetable.' },
      { h: 'Less time in traffic', p: 'A Lavington or Kileleshwa student learning online starts lessons at home instead of on Waiyaki Way or James Gichuru Road. Families in Parklands, Westlands and Highridge can reach the Parklands centre quickly. Karen and Langata families can use the Karen centre.' },
      { h: 'Every major curriculum under one roof', p: 'Cambridge, Pearson Edexcel, IB, American with AP and CBE (CBC). Siblings on different curricula can study with the same school, and a CBE learner can move to IGCSE at Year 10 with a planned bridge.' },
      { h: 'Exams handled with you', p: 'For Cambridge and Pearson Edexcel we plan each private-candidate entry through British Council Kenya, whose exams team is in Nairobi. For KJSEA and KCSE we work with you on registering through a KNEC-registered centre.' },
      { h: 'Tuition at a clear rate', p: 'One-to-one tuition is USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate), online or at our centres. For home visits in Nairobi estates, see our Nairobi tuition page at /tuition-nairobi.' },
    ],
    homeschoolDetail: 'Full-time Smartious students in Nairobi get a personal timetable on the Smartious LMS, live small-group lessons with subject teachers, recordings of every lesson, homework and assessments marked online, and termly reports. Families who want structure outside the home can choose in-person homeschooling at Parklands or Karen. Students come to the centre for taught lessons and supervised study, then go home without crossing the city.',
    homeTuitionDetail: 'One-to-one tuition is USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate). It runs online, at our Parklands or Karen centre, or, in many Nairobi estates, at your home. Some estates further from our centres carry a small transport contribution. Our Nairobi tuition page (/tuition-nairobi) lists the areas we cover, including Karen, Westlands, Kilimani, Lavington, Runda, Kileleshwa, Parklands, Langata, Muthaiga, South B and C, Syokimau and Kitengela, with the details for each.',
    onlineLearningDetail: 'Live lessons run in East Africa Time, so there is no time-zone adjustment: a 9 am lesson is 9 am in Nairobi. Safaricom, Zuku, Faiba and other fibre services in Nairobi estates are fine for live classes. A laptop, a headset and a quiet room are what matter most. Recordings mean that a power cut or a dropped connection does not mean a lost lesson.',
    curricula: {
      cambridge: 'Cambridge Primary, Lower Secondary, IGCSE (Years 10 to 11) and International AS and A Level (Years 12 to 13). Cambridge is the most common international route in Nairobi. Entries for IGCSE and A Level are made as a private candidate through British Council Kenya, for the May/June or October/November series.',
      ib: 'IB-style teaching for MYP-age students and subject support for IB Diploma students at Nairobi IB schools. Full IB Diploma registration needs an IB World School, so we discuss the best route for your child at assessment.',
      cbc: 'CBE (CBC) from Grade 1 to Grade 9, aligned to KICD designs, with KPSEA and KJSEA preparation, and senior-school (Grade 10 onwards) support by pathway.',
      american: 'American curriculum from elementary to high school, with AP courses. AP exams are taken at an authorised College Board test centre, and several Nairobi international schools run AP testing.',
    },
    subjects: ['Mathematics', 'Additional and Further Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Language', 'English Literature', 'Kiswahili', 'Computer Science', 'Business', 'Economics', 'Accounting', 'Geography', 'History', 'French'],
    nearbyAreas: ['Parklands (head office)', 'Karen (centre)', 'Westlands', 'Kilimani', 'Lavington', 'Kileleshwa', 'Runda', 'Muthaiga', 'Gigiri', 'Spring Valley', 'Loresho', 'Langata', 'South B', 'South C', 'Upper Hill', 'Riverside', 'Highridge', 'Kasarani', 'Embakasi', 'Syokimau'],
    growingReason: 'More Nairobi parents now see online and centre-based homeschooling as a serious option. Many have lived with the cost and stress of the cross-city school run. Others are returning diaspora families who need a school place mid-year, or have a teenager who needs a particular A Level combination that their school does not timetable. The move from 8-4-4 to CBE has also led many families to compare the national route and the IGCSE route side by side.',
    familySituations: [
      { context: 'Karen to town', scenario: 'A Karen family whose two children were spending well over an hour each way on Langata and Ngong Road. They now learn at our Karen centre in the morning and do sports in the afternoon.' },
      { context: 'Grade 9 decision', scenario: 'A Kileleshwa family with a Grade 9 learner deciding between Grade 10 senior school on the STEM pathway and starting Cambridge IGCSE at Year 10.' },
      { context: 'Returning diaspora', scenario: 'A family moving back to Runda from the UK in the middle of the year who want their Year 10 child to continue IGCSE without a gap while they settle in.' },
      { context: 'One subject, one-to-one', scenario: 'A Westlands Year 12 student at a Cambridge school who needs A Level Further Mathematics, which the school cannot timetable, taught one-to-one.' },
    ],
    faqs: [
      { q: 'Which estates are closest to the Parklands centre?', a: 'Parklands, Westlands, Highridge, Spring Valley, Loresho, Muthaiga and Gigiri are the closest, via the Ring Road Westlands, Limuru Road and Waiyaki Way. Families from Runda and Kitisuru often come down Limuru Road or Kiambu Road outside peak hours.' },
      { q: 'Is the Karen centre practical for Langata, Lavington or Kilimani families?', a: 'Karen and Langata families usually find the Karen centre easiest. Lavington and Kilimani families often choose between Karen and Parklands depending on which way they already drive, Ngong Road or Waiyaki Way. Many simply learn online on the days the traffic is worst.' },
      { q: 'My child attends an international school in Gigiri or Karen. Can we just take tuition?', a: 'Yes. Many Nairobi students keep their school place and take one-to-one lessons with us in one or two subjects, online, at a centre or at home, at USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate).' },
      { q: 'Where are your Nairobi centres?', a: 'Our head office and learning centre is at Diamond Plaza I Annex, Parklands. Our second centre is in Karen. You are welcome to visit either centre. Call admissions on +254 745 021 212 to arrange a time.' },
      { q: 'What does online school cost in Nairobi?', a: FEES_KE },
      { q: 'Can my child homeschool in person in Nairobi instead of online?', a: 'Yes. In-person homeschooling runs at our Parklands and Karen centres for families who want a daily routine and a teacher in the room. Many families mix the two: centre days plus online lessons at home.' },
      { q: 'Do you offer home tuition in my estate?', a: 'In many Nairobi estates, yes. Tuition is USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate), and some estates further from our centres carry a small transport contribution. Our Nairobi tuition page (/tuition-nairobi) lists the areas and details.' },
      { q: 'Where does my child sit IGCSE or A Level exams in Nairobi?', a: EXAMS_KE },
      { q: 'My child is in Grade 9. Should we go to Grade 10 senior school or switch to IGCSE?', a: CBE_KE + ' Both routes lead to Kenyan and international universities. At the assessment we look at your child\'s strengths, the subjects they want, and where they hope to study, and we explain how each route would work for them.' },
      { q: 'Is homeschooling legal in Kenya?', a: 'The Basic Education Act 2013 makes basic education compulsory, and Kenyan law does not yet set out a separate registration process for homeschooling. Homeschooling is practised in Kenya and has been discussed in the courts and in education policy. We recommend that families who are unsure take advice. We provide timetables, schemes of work and reports, which families find useful if they are asked about their child\'s education.' },
      { q: 'When can we start?', a: INTAKE_KE + ' The first step is to book an assessment online. Admissions reviews each request and replies within three business days.' },
      { q: 'How do we pay?', a: PAY_KE },
      { q: 'How do I contact Smartious?', a: CONTACT_KE },
    ],
    keywords: ['online school Nairobi', 'homeschool Nairobi', 'homeschooling in Nairobi', 'homeschools in Nairobi', 'IGCSE online Nairobi', 'CBC homeschool Nairobi', 'virtual school Nairobi', 'Karen homeschool', 'Parklands learning centre'],
    altTexts: {
      hero: 'Student in Nairobi in a live online Smartious lesson',
      curriculum: 'Cambridge IGCSE study notes for a Nairobi student',
      tutor: 'Smartious teacher giving a one-to-one lesson to a Nairobi student',
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // MOMBASA
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'mombasa', name: 'Mombasa', county: 'Mombasa County', region: 'Coastal Kenya', heroImg: HERO_LIBRARY,
    seoTitle: 'Online School & Homeschool Mombasa | Live IGCSE, CBC',
    seoDesc: 'Homeschooling in Mombasa: live online IGCSE, A-Level and CBC classes for Nyali, Bamburi and Kizingo families. From USD 423/month. January 2027 intake.',
    primaryKeyword: 'Online school and homeschooling in Mombasa',
    heroTagline: 'Live online classes for families in Nyali, Bamburi, Shanzu, Kizingo, Tudor, Mtwapa and Likoni. No Nyali Bridge or ferry queue on school mornings.',
    intro: 'For many Mombasa families, the school run comes down to two bottlenecks: Nyali Bridge and the Likoni Ferry. Add the Makupa Causeway and the Malindi road at Mtwapa, and an island school can be a long way from a mainland home. Smartious teaches Mombasa students live online from Nairobi, in the same time zone, on a timetable that can work around the coastal heat. We teach Cambridge IGCSE and A Level, Pearson Edexcel, IB subject support, the American curriculum with AP, and CBE (CBC). Families use us as a full-time online school or for one-to-one tuition alongside their current school.',
    challenges: [
      'Commuting between the mainland and the island. Nyali Bridge, the Likoni Ferry and the Makupa Causeway all slow down at peak hours, and Mtwapa families also face the Malindi road.',
      'A smaller choice of international schools than Nairobi. Families compare a handful of Cambridge and IB schools on the north coast and the island, and places in some year groups are limited.',
      'Heat and humidity make long afternoons on a bus tiring. Many coastal parents prefer lessons in the cooler morning and study at home in the afternoon.',
      'Specialist A Level and IB Higher Level teachers, for example in Further Mathematics, Physics or Chemistry, are harder to find on the coast.',
      'Exams mean planning. Cambridge and Pearson private-candidate entries go through British Council Kenya, so families should check early where their child will sit and plan any travel.',
    ],
    whyChoose: [
      { h: 'No bridge or ferry on school days', p: 'Lessons start at home in Nyali, Bamburi or Likoni, so there is no queue at the Likoni Ferry and no Nyali Bridge traffic.' },
      { h: 'Morning-weighted timetable', p: 'Live lessons run in East Africa Time. Most families put taught lessons in the morning and keep the hot afternoon for homework, the beach or sport.' },
      { h: 'Specialists the coast is short of', p: 'A Level Further Mathematics, Physics, Chemistry and Computer Science, and IB Higher Level support, are taught live by subject teachers.' },
      { h: 'A plan for exam entries', p: 'We plan Cambridge and Pearson Edexcel private-candidate entries with you through British Council Kenya, and KCSE or KJSEA registration through a KNEC-registered centre in Mombasa County.' },
      { h: 'Clear fees', p: 'From USD 423/month for Primary (≈ KSh 54,600 at the Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour (≈ KSh 1,940).' },
    ],
    homeschoolDetail: 'Full-time Mombasa students get a personal timetable, live small-group lessons, recordings, marked work and termly reports through the Smartious LMS. Many coastal families also use local swimming, sailing, football and music clubs, so their children keep a strong social life outside lessons.',
    homeTuitionDetail: 'In Mombasa, tuition is delivered online: live one-to-one lessons with a shared whiteboard, at USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate). We do not run a physical centre in Mombasa, so online is the way we teach coastal families. It also means no tutor travelling across the bridge in traffic.',
    onlineLearningDetail: 'Fibre from Safaricom, Zuku, Faiba and others is available in Nyali, Bamburi, Kizingo and most of the island. Mobile 4G works well as a backup. Because every lesson is recorded, a power cut in the middle of a lesson does not mean the lesson is lost.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level. Coastal families often choose IGCSE for its international recognition. Exam entries are made as a private candidate through British Council Kenya. Check early where your child can sit the exam for your series and plan any travel to Nairobi.',
      ib: 'Subject tuition for students at coastal IB schools, including Higher Level Mathematics and sciences, Extended Essay guidance and exam revision.',
      cbc: 'CBE (CBC) from Grade 1 to Grade 9 with KPSEA and KJSEA preparation, and senior school (Grade 10 onwards) subject support.',
      american: 'American curriculum with AP for coastal families aiming at US universities. AP exams are taken at an authorised College Board centre.',
    },
    subjects: ['Mathematics', 'Additional Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kiswahili', 'Business', 'Economics', 'Computer Science', 'Geography', 'History', 'French', 'Islamic Religious Education', 'Arabic'],
    nearbyAreas: ['Nyali', 'Links Road', 'Bamburi', 'Shanzu', 'Mtwapa (Kilifi County)', 'Kizingo', 'Tudor', 'Ganjoni', 'Old Town', 'Likoni', 'Mkomani', 'Kilifi', 'Diani (Kwale County)'],
    growingReason: 'Mombasa families are turning to online school for practical reasons. The bridge and ferry make the school run long. There are fewer international schools to choose from than in Nairobi, and parents in shipping, logistics, tourism and the port often work irregular hours. Online learning lets a child on the north coast get the same subject teachers as a student in Nairobi.',
    familySituations: [
      { context: 'Likoni to the island', scenario: 'A Likoni family who were losing every morning to the ferry queue and now keep their Year 9 child at home for live lessons.' },
      { context: 'North coast IGCSE', scenario: 'A Shanzu family whose Year 10 child is starting IGCSE Mathematics, Physics and Chemistry, with exams planned through British Council Kenya.' },
      { context: 'Port shift work', scenario: 'Parents with shifts at the port who need lessons that are recorded and a timetable that does not depend on a school bus.' },
      { context: 'CBE to IGCSE', scenario: 'A Nyali family with a Grade 8 learner planning a move from CBE to IGCSE at Year 10.' },
    ],
    faqs: [
      { q: 'We live on the south coast in Diani or Ukunda. Can my child join?', a: 'Yes. Online lessons work the same in Diani, Ukunda and Kwale as in Nyali. There is no ferry or Dongo Kundu bypass drive on school mornings.' },
      { q: 'Can the timetable fit Ramadan?', a: 'Yes. Families can ask us to adjust lesson times during Ramadan, and recordings help when evenings are busy. Islamic Religious Education and Arabic are available as subjects.' },
      { q: 'Do you teach families in Kilifi, Watamu and Malindi?', a: 'Yes. Families along the north coast learn online on the same timetable as Mombasa students.' },
      { q: 'Do you have a centre in Mombasa?', a: 'No. Our centres are in Nairobi (Parklands and Karen). Mombasa families learn live online, on the same timetable and with the same teachers as our Nairobi students.' },
      { q: 'What does it cost in Mombasa?', a: FEES_KE },
      { q: 'Where can my child sit IGCSE or A Level exams from Mombasa?', a: EXAMS_KE + ' For coastal families, it is worth asking British Council Kenya early which venue is available for your series, and planning travel to Nairobi if needed.' },
      { q: 'Can my child still sit KCSE or KJSEA?', a: 'Yes. KNEC exams are registered through a KNEC-registered centre in Mombasa County within KNEC\'s registration window. We prepare students for the syllabus and help you plan the registration. ' + CBE_KE },
      { q: 'Can lessons avoid the hottest part of the day?', a: 'Yes. Live lessons run in East Africa Time and most coastal families choose a morning-weighted timetable. Recordings let students review in the cooler evening.' },
      { q: 'Will my child feel isolated learning online on the coast?', a: 'Live classes include peers from Kenya and other countries. Most of our coastal families also use local clubs for swimming, sailing, football and music, so children have plenty of contact with other young people.' },
      { q: 'When can we join?', a: INTAKE_KE },
      { q: 'How do we pay and who do we contact?', a: PAY_KE + ' ' + CONTACT_KE },
    ],
    keywords: ['homeschooling Mombasa', 'online school Mombasa', 'IGCSE Mombasa', 'CBC homeschool Mombasa', 'Nyali online tuition', 'Bamburi homeschool'],
    altTexts: {
      hero: 'Mombasa student studying at home with Smartious online school',
      curriculum: 'IGCSE textbook for a Mombasa student',
      tutor: 'Smartious online tutor teaching a Mombasa student',
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // KISUMU
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'kisumu', name: 'Kisumu', county: 'Kisumu County', region: 'Lake Victoria · Western Kenya', heroImg: HERO_STUDY,
    seoTitle: 'Homeschooling in Kisumu | Live IGCSE & CBC Online',
    seoDesc: 'Online school and homeschool in Kisumu: live IGCSE, A-Level and CBC classes for Milimani and Riat Hills families. From USD 423/month. January 2027 intake.',
    primaryKeyword: 'Online school and homeschooling in Kisumu',
    heroTagline: 'Live online classes for families in Milimani, Tom Mboya, Riat Hills, Mamboleo, Kanyakwar and Lolwe, with the same teachers as our Nairobi students.',
    intro: 'Kisumu has strong national schools, but families looking for Cambridge IGCSE, A Level or the American curriculum find far fewer options than in Nairobi. Some end up considering boarding school hundreds of kilometres away. Smartious gives Kisumu children a live international curriculum at home, in East Africa Time, with subject teachers in Nairobi. Families in Milimani, Riat Hills, Mamboleo and along the Kakamega and Busia roads use us as a full online school, as a bridge from CBE to IGCSE, or for one-to-one tuition in a single subject.',
    challenges: [
      'Few Cambridge, IB or American curriculum schools in the lake region. Families often weigh up boarding in Nairobi or Nakuru against staying in Kisumu.',
      'Traffic on the Kisumu to Kakamega road, Jomo Kenyatta Highway and Busia Road at peak times, especially for schools on the edges of the city.',
      'International exams need planning. Cambridge and Pearson private-candidate entries go through British Council Kenya, whose exams team is in Nairobi. Find out early where your child will sit, and allow for a trip by road or a short flight.',
      'Finding specialist A Level teachers locally, for example in Further Mathematics, Computer Science or Economics.',
      'Parents who work for NGOs, health research programmes or county government may move on short notice, so they need a school that moves with them.',
    ],
    whyChoose: [
      { h: 'International curriculum without boarding', p: 'Your child can follow IGCSE or A Level and stay at home in Kisumu, instead of boarding in another city.' },
      { h: 'Same time zone, same teachers', p: 'Lessons run in East Africa Time with the same subject teachers who teach our Nairobi students. There is no time difference to plan around.' },
      { h: 'Exam logistics planned early', p: 'We plan British Council Kenya private-candidate entries with you well before the deadlines, including travel to Nairobi if your series needs it. KCSE and KJSEA are registered through a KNEC-registered centre in Kisumu County.' },
      { h: 'Works when you move', p: 'NGO, research and government postings change. Online enrolment continues if your family moves to Nairobi, Kampala or further afield.' },
      { h: 'Clear fees', p: 'From USD 423/month for Primary (≈ KSh 54,600 at the Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour (≈ KSh 1,940).' },
    ],
    homeschoolDetail: 'Full-time Kisumu students get a personal timetable, live small-group lessons, recordings, marked work and termly reports on the Smartious LMS. Many families pair online school with local activities, such as sailing and rowing on the lake, football, athletics and church or mosque youth groups.',
    homeTuitionDetail: 'In Kisumu, tuition is delivered online: live one-to-one lessons at USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate). We have no physical centre in Kisumu, so online lessons give lake-region families access to specialist teachers without travel.',
    onlineLearningDetail: 'Fibre is available in Milimani, Tom Mboya and much of the central city, and 4G covers most estates. A laptop, a headset and a quiet room are what matter most. Every lesson is recorded, so a power cut does not mean the lesson is lost.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level. For many Kisumu families this is the main reason to choose Smartious, as Cambridge schools are scarce in the region. Entries are made as a private candidate through British Council Kenya.',
      ib: 'Subject tuition for IB students, including those who board elsewhere and study at home during the holidays.',
      cbc: 'CBE (CBC) Grades 1 to 9 with KPSEA and KJSEA preparation, and support for senior school (Grade 10 onwards) by pathway.',
      american: 'American curriculum with AP, often chosen by families with links to US universities or US-funded programmes. AP exams are taken at an authorised College Board centre.',
    },
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kiswahili', 'Computer Science', 'Economics', 'Business', 'Geography', 'History', 'Agriculture', 'French'],
    nearbyAreas: ['Milimani', 'Tom Mboya', 'Riat Hills', 'Mamboleo', 'Kanyakwar', 'Lolwe', 'Nyalenda', 'Kibos', 'Dunga', 'Kondele', 'Maseno', 'Ahero', 'Kakamega', 'Siaya'],
    growingReason: 'Kisumu\'s professional community has grown with the county government, health research, NGOs and lake trade. Many of these parents want an international qualification for their children without sending them away to board. Online school has made that possible.',
    familySituations: [
      { context: 'Instead of boarding', scenario: 'A Milimani family who had planned to send their Year 10 child to board in Nairobi for IGCSE, and chose online school at home instead.' },
      { context: 'Research posting', scenario: 'A family on a three-year health research posting in Kisumu who want continuity in the American curriculum.' },
      { context: 'CBE learner, A Level goal', scenario: 'A Riat Hills Grade 8 learner preparing to move to IGCSE at Year 10 with a clear plan for the switch.' },
      { context: 'Single subject', scenario: 'A student at a Kisumu national school who wants one-to-one Mathematics tuition for KCSE.' },
    ],
    faqs: [
      { q: 'Can my child sit KCSE in Kisumu as a private candidate?', a: 'Yes. KNEC registers private candidates through designated centres, including in Kisumu County. Registration is within KNEC\'s window early in the exam year, so plan ahead. We prepare students for the syllabus.' },
      { q: 'If we move from Kisumu to Nairobi, can my child switch to a centre?', a: 'Yes. Your child keeps the same timetable and teachers and can add centre days at Parklands or Karen after the move.' },
      { q: 'Do families in Kakamega, Siaya or Homa Bay use Smartious?', a: 'Yes. The lessons are online, so families anywhere in the lake region can join with a reliable connection.' },
      { q: 'Is there a Smartious centre in Kisumu?', a: 'No. Kisumu students learn live online. Our centres are in Nairobi (Parklands and Karen), and families travelling to Nairobi are welcome to visit.' },
      { q: 'What does online school cost for a Kisumu family?', a: FEES_KE },
      { q: 'Where would my child sit Cambridge exams?', a: EXAMS_KE + ' From Kisumu, plan for travel to Nairobi by road or a short flight unless British Council Kenya confirms a venue nearer to you for your series.' },
      { q: 'Can my child do KCSE or KJSEA instead?', a: 'Yes. We teach to the KNEC syllabus, and registration is through a KNEC-registered centre in Kisumu County. ' + CBE_KE },
      { q: 'Will Kenyan universities accept IGCSE and A Level?', a: 'Kenyan universities admit students with IGCSE and A Level results. Applicants are usually asked for an equivalence or recognition letter from the Kenya National Qualifications Authority (KNQA). Check the requirements with the admissions office of the university and programme your child is aiming for.' },
      { q: 'When can we start?', a: INTAKE_KE },
      { q: 'How do we pay and contact you?', a: PAY_KE + ' ' + CONTACT_KE },
    ],
    keywords: ['homeschooling Kisumu', 'online school Kisumu', 'IGCSE Kisumu', 'CBC homeschool Kisumu', 'Milimani tuition'],
    altTexts: {
      hero: 'Kisumu student in a live online Smartious class',
      curriculum: 'Study materials for a Kisumu IGCSE student',
      tutor: 'Smartious online tutor teaching a Kisumu student',
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // NAKURU
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'nakuru', name: 'Nakuru', county: 'Nakuru County', region: 'Rift Valley', heroImg: HERO_TUTOR,
    seoTitle: 'Homeschooling in Nakuru | Live IGCSE & CBC Classes',
    seoDesc: 'Online school and homeschool in Nakuru: live IGCSE, A-Level and CBC classes for Milimani, Section 58 and Lanet families. From USD 423/month. Jan 2027 intake.',
    primaryKeyword: 'Online school and homeschooling in Nakuru',
    heroTagline: 'Live online classes for families in Milimani, Section 58, Lanet, Kiamunyi, Naka and Free Area, without boarding and without the highway.',
    intro: 'Nakuru became a city in 2021 and has grown quickly, but families still find that many Cambridge and international options in the Rift Valley are boarding schools outside town. Smartious lets Nakuru children follow IGCSE, A Level, the American curriculum or CBE (CBC) at home, with live lessons in East Africa Time. Families in Milimani, Section 58, Lanet and Kiamunyi use us as a full online school, as a day-school alternative to boarding, or for one-to-one tuition.',
    challenges: [
      'Many of the region\'s international schools are boarding or semi-boarding, outside town towards Naivasha, Njoro or Molo. Day options in town are fewer.',
      'The Nairobi to Nakuru highway (A104) is often congested around Nakuru, Gilgil and Naivasha, which matters for families thinking of schools further away or travelling to Nairobi for exams.',
      'Parents in farming, agribusiness, the flower industry and county government often have early starts and irregular weeks.',
      'Cambridge and Pearson exams are taken as a private candidate through British Council Kenya, so families need to plan where their child will sit and any trip to Nairobi.',
      'Grade 9 families want clear advice on KJSEA, senior school placement and pathways compared with switching to IGCSE.',
    ],
    whyChoose: [
      { h: 'A day-school alternative to boarding', p: 'Your child follows an international curriculum at home in Nakuru instead of boarding outside town.' },
      { h: 'Rift Valley timetable, EAT', p: 'Lessons run in East Africa Time. Early-starting farming families often choose morning lessons and use recordings for review.' },
      { h: 'Exams planned with you', p: 'We plan British Council Kenya private-candidate entries well before the deadlines, including travel to Nairobi. KCSE and KJSEA go through a KNEC-registered centre in Nakuru County.' },
      { h: 'Specialist subjects', p: 'A Level Further Mathematics, Physics, Chemistry, Economics and Computer Science are taught live by subject teachers.' },
      { h: 'Clear fees', p: 'From USD 423/month for Primary (≈ KSh 54,600 at the Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour (≈ KSh 1,940).' },
    ],
    homeschoolDetail: 'Full-time Nakuru students get a personal timetable, live small-group lessons, recordings, marked assignments and termly reports on the Smartious LMS. Families often add local sport, such as athletics, rugby, swimming and riding, and outdoor learning around Lake Nakuru and Menengai.',
    homeTuitionDetail: 'In Nakuru, tuition is delivered online: live one-to-one lessons at USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate). We have no centre in Nakuru. Families visiting Nairobi are welcome at our Parklands or Karen centre.',
    onlineLearningDetail: 'Fibre is available in Milimani, Section 58 and much of central Nakuru, and 4G covers Lanet, Kiamunyi and most estates. For farms further out, a 4G router or satellite backup helps, and every lesson is recorded.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level, taken as a private candidate through British Council Kenya. Many Nakuru families choose IGCSE for its recognition by universities abroad.',
      ib: 'Subject tuition for IB students, including those boarding at IB schools who want holiday support at home in Nakuru.',
      cbc: 'CBE (CBC) Grades 1 to 9 with KPSEA and KJSEA preparation, and senior school (Grade 10 onwards) support by pathway.',
      american: 'American curriculum with AP for families aiming at US or Canadian universities. AP exams are taken at an authorised College Board centre.',
    },
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kiswahili', 'Agriculture', 'Business', 'Economics', 'Geography', 'Computer Science', 'History'],
    nearbyAreas: ['Milimani', 'Section 58', 'Lanet', 'Kiamunyi', 'Naka', 'Free Area', 'Shabab', 'London', 'Pipeline', 'Njoro', 'Bahati', 'Naivasha', 'Gilgil'],
    growingReason: 'Nakuru\'s growth as a city has brought more professional families who want an international curriculum but do not want their young children boarding. Online school with live teachers gives them a day option at home.',
    familySituations: [
      { context: 'Not ready to board', scenario: 'A Milimani family whose Year 7 child was offered a boarding place but who preferred a live online curriculum at home for two more years.' },
      { context: 'Farming family', scenario: 'A family on a farm outside Njoro who need recorded lessons as a backup when connectivity drops.' },
      { context: 'Grade 9 choices', scenario: 'A Section 58 family comparing Grade 10 STEM placement with starting IGCSE sciences.' },
      { context: 'A Level gap', scenario: 'A Lanet student at a local school who needs A Level Further Mathematics taught one-to-one.' },
    ],
    faqs: [
      { q: 'We live in Naivasha or Gilgil. Is that covered?', a: 'Yes. Families in Naivasha, Gilgil, Njoro and Molo learn online on the same timetable as Nakuru students.' },
      { q: 'Can online school fit around riding, rugby or athletics?', a: 'Yes. Most families put live lessons in the morning and keep the afternoon for sport, with recordings for anything missed.' },
      { q: 'Do you have a Nakuru centre?', a: 'No. Nakuru families learn live online. Our centres are in Nairobi (Parklands and Karen).' },
      { q: 'What are the fees for a Nakuru family?', a: FEES_KE },
      { q: 'Where would my child sit IGCSE exams?', a: EXAMS_KE + ' From Nakuru this usually means planning a trip to Nairobi, so allow for highway traffic around Naivasha.' },
      { q: 'Is this an alternative to boarding school?', a: 'For many families, yes. Your child follows a live international curriculum at home and can join local clubs. Some families use Smartious for a few years and then move their child to boarding for the sixth form, or the other way round.' },
      { q: 'Can my child take KJSEA or KCSE?', a: 'Yes, through a KNEC-registered centre in Nakuru County. ' + CBE_KE },
      { q: 'When is the next intake?', a: INTAKE_KE },
      { q: 'How do we pay and contact you?', a: PAY_KE + ' ' + CONTACT_KE },
    ],
    keywords: ['homeschooling Nakuru', 'online school Nakuru', 'IGCSE Nakuru', 'CBC homeschool Nakuru'],
    altTexts: {
      hero: 'Nakuru student in a live online Smartious lesson',
      curriculum: 'IGCSE study notes for a Nakuru student',
      tutor: 'Smartious online tutor teaching a Nakuru student',
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // ELDORET
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'eldoret', name: 'Eldoret', county: 'Uasin Gishu County', region: 'North Rift', heroImg: HERO_NOTEBOOK,
    seoTitle: 'Homeschooling in Eldoret | Live IGCSE & CBC Online',
    seoDesc: 'Online school and homeschool in Eldoret: live IGCSE, A-Level and CBC classes for Elgon View and Kapsoya families. From USD 423/month. January 2027 intake.',
    primaryKeyword: 'Online school and homeschooling in Eldoret',
    heroTagline: 'Live online classes for families in Elgon View, Kapsoya, Pioneer, Annex, Kimumu and Langas, and for athletes\' families who travel to compete.',
    intro: 'Eldoret, now a city, is the hub of the North Rift. It is a university town, a farming centre and, through Iten and Kaptagat nearby, a home of world athletics. Families here often find that Cambridge and international options mean boarding elsewhere. Smartious offers a live international curriculum at home in East Africa Time, plus CBE (CBC) and one-to-one tuition. We also offer recorded lessons for families whose training and race calendar takes them abroad.',
    challenges: [
      'Few international curriculum schools in the North Rift. Families often weigh boarding in Nairobi, Nakuru or further afield.',
      'Traffic on the Uganda Road through town and the busy roads around the town centre at school times.',
      'Athletes\' families travel for races and training camps, so a fixed school calendar is hard to follow.',
      'Cambridge and Pearson exams are taken as a private candidate through British Council Kenya. Plan the venue early and allow for a flight or drive to Nairobi.',
      'Parents linked to Moi University and other institutions often want A Level sciences and Mathematics taught at a high level.',
    ],
    whyChoose: [
      { h: 'Learning that travels', p: 'Lessons are recorded and the timetable is personal, so an athlete\'s child can keep up during a race season in Europe or Asia.' },
      { h: 'International curriculum at home', p: 'IGCSE and A Level in Eldoret, without boarding.' },
      { h: 'Exams planned with you', p: 'British Council Kenya entries are planned early, with travel to Nairobi if needed. KCSE and KJSEA go through a KNEC-registered centre in Uasin Gishu County.' },
      { h: 'Strong sciences and Mathematics', p: 'A Level Mathematics, Further Mathematics, Physics, Chemistry and Biology are taught live by subject teachers.' },
      { h: 'Clear fees', p: 'From USD 423/month for Primary (≈ KSh 54,600 at the Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour (≈ KSh 1,940).' },
    ],
    homeschoolDetail: 'Full-time Eldoret students get a personal timetable, live small-group lessons, recordings, marked work and termly reports through the Smartious LMS. Many families combine online school with local athletics clubs, football and church youth programmes.',
    homeTuitionDetail: 'In Eldoret, tuition is delivered online: live one-to-one lessons at USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate). We have no physical centre in Eldoret.',
    onlineLearningDetail: 'Fibre is available in Elgon View and the central estates, and 4G covers most of town. Families on farms or in Iten and Kaptagat often use a 4G router. When the family travels abroad, students join from wherever they are, and recordings cover any lessons missed because of time differences.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level, entered as a private candidate through British Council Kenya.',
      ib: 'Subject tuition for IB students studying elsewhere who want support at home in Eldoret.',
      cbc: 'CBE (CBC) Grades 1 to 9 with KPSEA and KJSEA preparation, and senior school (Grade 10 onwards) support, including Sports Science pathway learners who need flexible academic study.',
      american: 'American curriculum with AP, sometimes chosen by athletes\' families with links to US college athletics. AP exams are taken at an authorised College Board centre.',
    },
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kiswahili', 'Agriculture', 'Business', 'Geography', 'Computer Science', 'Physical Education'],
    nearbyAreas: ['Elgon View', 'Kapsoya', 'Pioneer', 'Annex', 'Kimumu', 'Langas', 'West Indies', 'Racecourse', 'Kapseret', 'Iten (Elgeyo-Marakwet)', 'Kaptagat', 'Kitale', 'Kapsabet'],
    growingReason: 'Eldoret families who want an international curriculum have usually had to choose boarding. Families in athletics also need schooling that fits a travel calendar. Online school with recorded lessons meets both needs.',
    familySituations: [
      { context: 'Race season', scenario: 'An athlete\'s family who spend part of the year at races abroad and need their Grade 7 child\'s learning to continue from anywhere.' },
      { context: 'University family', scenario: 'An Elgon View family with a lecturer parent who want their Year 12 child to take A Level Mathematics, Physics and Chemistry.' },
      { context: 'Staying home', scenario: 'A Kapsoya family who chose online IGCSE instead of sending their 14-year-old to board in Nairobi.' },
      { context: 'KCSE support', scenario: 'A student at an Eldoret secondary school who wants one-to-one Chemistry tuition before KCSE.' },
    ],
    faqs: [
      { q: 'We live in Iten or Kaptagat. Will the internet be good enough?', a: 'Usually, yes, with 4G. A 4G router positioned well in the house helps, and every lesson is recorded in case the connection drops.' },
      { q: 'My child trains in athletics. Can lessons fit around training?', a: 'Yes. Many families keep early-morning training and start live lessons later in the morning, with recordings for review in the evening.' },
      { q: 'Is there a Smartious centre in Eldoret?', a: 'No. Eldoret families learn live online. Our centres are in Nairobi (Parklands and Karen).' },
      { q: 'What are the fees?', a: FEES_KE },
      { q: 'Can my child keep studying while we travel for races?', a: 'Yes. Lessons are recorded and timetables are personal. Students can join live from another time zone or catch up from recordings, and teachers set work that keeps them on track.' },
      { q: 'Where would my child sit IGCSE exams?', a: EXAMS_KE + ' From Eldoret, plan for a flight or drive to Nairobi unless British Council Kenya confirms a nearer venue for your series.' },
      { q: 'Can my child take KJSEA or KCSE?', a: 'Yes, through a KNEC-registered centre in Uasin Gishu County. ' + CBE_KE },
      { q: 'When can we start?', a: INTAKE_KE },
      { q: 'How do we pay and contact you?', a: PAY_KE + ' ' + CONTACT_KE },
    ],
    keywords: ['homeschooling Eldoret', 'online school Eldoret', 'IGCSE Eldoret', 'CBC homeschool Eldoret'],
    altTexts: {
      hero: 'Eldoret student in a live online Smartious lesson',
      curriculum: 'IGCSE notes for an Eldoret student',
      tutor: 'Smartious online tutor teaching an Eldoret student',
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // THIKA
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'thika', name: 'Thika', county: 'Kiambu County', region: 'Thika Superhighway corridor', heroImg: HERO_CLASSROOM,
    seoTitle: 'Homeschooling in Thika | Live IGCSE & CBC Online',
    seoDesc: 'Online school and homeschool in Thika: live IGCSE, A-Level and CBC classes for Section 9, Makongeni and Ngoingwa families. From USD 423/month. Jan 2027 intake.',
    primaryKeyword: 'Online school and homeschooling in Thika',
    heroTagline: 'Live online classes for families in Section 9, Makongeni, Ngoingwa, Landless, Kiganjo and along the Thika Superhighway.',
    intro: 'Many Thika parents commute to Nairobi on the Thika Superhighway, and some send their children the same way to school in Ruiru, Kasarani or the city. That makes for long days for everyone. Smartious offers a live international curriculum and CBE (CBC) at home in Thika, in East Africa Time. Families can also bring their child to our Parklands centre in Nairobi when it suits their commute.',
    challenges: [
      'Long school days for children who commute towards Ruiru or Nairobi on the Superhighway, with jams at Juja, Ruiru and the Roysambu interchanges.',
      'Fewer international curriculum day schools in Thika itself, so families often look along the Superhighway.',
      'Parents working in Nairobi, in Thika\'s factories or at JKUAT in Juja often have long days of their own and need a reliable routine for their children.',
      'Grade 8 and Grade 9 families want clear guidance on KJSEA, senior school placement and pathways.',
      'Finding vetted specialist tutors for IGCSE and A Level sciences in town.',
    ],
    whyChoose: [
      { h: 'Off the Superhighway', p: 'Lessons start at home in Ngoingwa or Section 9 instead of in Juja or Ruiru traffic.' },
      { h: 'Nairobi centre on your commute', p: 'Families who commute into Nairobi can use our Parklands centre for in-person homeschooling or tuition on some days.' },
      { h: 'CBE and IGCSE side by side', p: 'We teach CBE and Cambridge, so families can follow either route or plan a switch at Year 10 with a clear bridge.' },
      { h: 'Exams planned with you', p: 'KJSEA and KCSE go through a KNEC-registered centre in Kiambu County. Cambridge and Pearson entries go through British Council Kenya in Nairobi, about an hour away outside peak traffic.' },
      { h: 'Clear fees', p: 'From USD 423/month for Primary (≈ KSh 54,600 at the Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour (≈ KSh 1,940).' },
    ],
    homeschoolDetail: 'Full-time Thika students get a personal timetable, live small-group lessons, recordings, marked work and termly reports through the Smartious LMS.',
    homeTuitionDetail: 'Tuition is USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate), online or at our Parklands centre in Nairobi. Most Thika families choose online one-to-one lessons in the evening after the commute.',
    onlineLearningDetail: 'Fibre is available in central Thika, Section 9 and many newer estates in Ngoingwa and Thika Greens, and 4G covers the rest. Every lesson is recorded.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level. Entries are made as a private candidate through British Council Kenya in Nairobi, within easy reach of Thika.',
      ib: 'Subject tuition for students at IB schools in Nairobi and along the Superhighway.',
      cbc: 'CBE (CBC) Grades 1 to 9 with KPSEA and KJSEA preparation, and senior school (Grade 10 onwards) support by pathway.',
      american: 'American curriculum with AP for families aiming at North American universities.',
    },
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kiswahili', 'Business', 'Agriculture', 'Computer Science', 'Geography', 'History'],
    nearbyAreas: ['Section 9', 'Makongeni', 'Ngoingwa', 'Landless', 'Kiganjo', 'Thika Greens', 'Gatuanyaga', 'Juja', 'Ruiru', 'Kenol', 'Gatundu'],
    growingReason: 'Thika has grown as a commuter town for Nairobi. Parents who already spend hours on the Superhighway are looking for schooling that does not add the same commute for their children.',
    familySituations: [
      { context: 'Commuter family', scenario: 'Two parents who commute to Nairobi and want their Year 8 child to stop leaving home before 6 am for a school in Ruiru.' },
      { context: 'Grade 9 to Grade 10', scenario: 'A Ngoingwa family preparing their child for KJSEA and senior school on the STEM pathway, with extra Mathematics.' },
      { context: 'Centre days', scenario: 'A family that drops their child at the Parklands centre on commute days and keeps online learning at home on the others.' },
      { context: 'KCSE revision', scenario: 'A Makongeni Form 4 student who needs one-to-one Physics and Chemistry before KCSE.' },
    ],
    faqs: [
      { q: 'We live in Juja near JKUAT. Can we use the Parklands centre?', a: 'Yes. Juja and Ruiru families often combine online days with centre days at Parklands, using the Thika Superhighway outside peak hours.' },
      { q: 'Can my Grade 9 child prepare for KJSEA online?', a: 'Yes. We teach the Grade 9 learning areas and practise KJSEA-style tasks, and help you plan Grade 10 pathway choices.' },
      { q: 'Can my Thika child attend your Nairobi centre?', a: 'Yes. Our head office and learning centre is at Diamond Plaza I Annex, Parklands. It is a practical choice for families who commute into Nairobi on some days.' },
      { q: 'What are the fees?', a: FEES_KE },
      { q: 'Where would my child sit KJSEA, KCSE or IGCSE?', a: EXAMS_KE },
      { q: 'How does Grade 10 senior school work under CBE?', a: CBE_KE + ' We teach the pathway subjects and help you understand placement and subject choices.' },
      { q: 'When can we start?', a: INTAKE_KE },
      { q: 'How do we pay and contact you?', a: PAY_KE + ' ' + CONTACT_KE },
    ],
    keywords: ['homeschooling Thika', 'online school Thika', 'IGCSE Thika', 'CBC homeschool Thika', 'Thika tuition'],
    altTexts: {
      hero: 'Thika student in a live online Smartious lesson',
      curriculum: 'CBE and IGCSE study materials for a Thika student',
      tutor: 'Smartious online tutor teaching a Thika student',
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // KIAMBU
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'kiambu', name: 'Kiambu', county: 'Kiambu County', region: 'Nairobi\'s northern edge', heroImg: HERO_TUTOR,
    seoTitle: 'Homeschooling in Kiambu | Live IGCSE & CBC Online',
    seoDesc: 'Online school and homeschool in Kiambu, Ruaka and Ndenderu: live IGCSE, A-Level and CBC classes. Parklands centre nearby. From USD 423/month. Jan 2027 intake.',
    primaryKeyword: 'Online school and homeschooling in Kiambu',
    heroTagline: 'Live online classes and in-person homeschooling in nearby Parklands for families in Kiambu town, Ruaka, Ndenderu, Kirigiti, Banana and Tinganga.',
    intro: 'Kiambu sits on Nairobi\'s northern edge, close to the city\'s international schools in Runda, Gigiri and Muthaiga but separated from them by Kiambu Road, Limuru Road and the Northern Bypass at rush hour. Smartious offers Kiambu families a live international curriculum or CBE (CBC) at home, plus in-person homeschooling and tuition at our Parklands centre, which is a short drive down Limuru Road outside peak hours.',
    challenges: [
      'Rush-hour traffic on Kiambu Road, Limuru Road through Ruaka and the Northern Bypass makes even short school runs slow.',
      'Fees at the Runda, Gigiri and Muthaiga international schools are high, and places in popular year groups can be limited.',
      'Ruaka and Ndenderu have grown fast, and good schools within walking distance have not kept pace.',
      'CBE families want guidance on KJSEA, Grade 10 placement and pathways, or on moving to IGCSE.',
      'Many parents work in Nairobi with long days and need a dependable routine for their children.',
    ],
    whyChoose: [
      { h: 'Parklands centre nearby', p: 'Our head office and learning centre at Diamond Plaza I Annex, Parklands, is a short drive from Ruaka and Kiambu outside peak traffic. You can use it for in-person homeschooling or tuition.' },
      { h: 'Or learn at home', p: 'Live online lessons mean no Limuru Road queue on school mornings.' },
      { h: 'CBE and international routes', p: 'We teach CBE, Cambridge, Pearson Edexcel, IB subjects and the American curriculum, so families can choose a route or plan a switch.' },
      { h: 'Exams close by', p: 'British Council Kenya, for Cambridge and Pearson private-candidate entries, is in Nairobi. KJSEA and KCSE are registered through a KNEC-registered centre in Kiambu County.' },
      { h: 'Clear fees', p: 'From USD 423/month for Primary (≈ KSh 54,600 at the Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour (≈ KSh 1,940).' },
    ],
    homeschoolDetail: 'Full-time Kiambu students get a personal timetable, live small-group lessons, recordings, marked work and termly reports on the Smartious LMS, with the option of centre days at Parklands.',
    homeTuitionDetail: 'Tuition is USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate), online or at our Parklands centre. We also offer home visits in parts of Ruaka and nearby areas, sometimes with a small transport contribution; see /tuition-nairobi for the areas we cover.',
    onlineLearningDetail: 'Fibre is widely available in Ruaka, Ndenderu and Kiambu town, and 4G covers most estates. Every lesson is recorded.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level. Entries are made as a private candidate through British Council Kenya in Nairobi.',
      ib: 'Subject tuition for students at IB schools in Runda, Gigiri and the wider city.',
      cbc: 'CBE (CBC) Grades 1 to 9 with KPSEA and KJSEA preparation, and senior school (Grade 10 onwards) support by pathway.',
      american: 'American curriculum with AP. Families near Gigiri and Runda often have links to US universities.',
    },
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kiswahili', 'French', 'Business', 'Economics', 'Computer Science', 'Geography', 'History', 'Agriculture'],
    nearbyAreas: ['Kiambu town', 'Ruaka', 'Ndenderu', 'Kirigiti', 'Banana', 'Tinganga', 'Karura', 'Runda (Nairobi)', 'Ridgeways (Nairobi)', 'Kiambu Road', 'Limuru'],
    growingReason: 'Kiambu and Ruaka have grown quickly as Nairobi families move north for space. School options nearby have not kept up, and the traffic into the city is a daily cost. Online school, with a city centre nearby, fits many of these families.',
    familySituations: [
      { context: 'Ruaka commute', scenario: 'A Ruaka family tired of the Limuru Road jam who moved their Year 6 child to online school with one centre day a week at Parklands.' },
      { context: 'Fee pressure', scenario: 'A Kiambu Road family with two children at a Runda school who moved the younger child to online Cambridge Primary.' },
      { context: 'Grade 9', scenario: 'A Ndenderu family preparing their child for KJSEA and choosing between the STEM pathway and IGCSE.' },
      { context: 'A Level subject', scenario: 'A Banana student who needs A Level Economics taught one-to-one alongside their school timetable.' },
    ],
    faqs: [
      { q: 'Is the Limuru Road traffic a problem for centre days?', a: 'Peak-hour traffic through Ruaka can be slow, so most families choose centre days and times that avoid it, and learn online on other days.' },
      { q: 'My child attends a school in Runda. Can they take just one subject with you?', a: 'Yes. One-to-one tuition is USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate), online or at our Parklands centre.' },
      { q: 'How close is your centre to Kiambu?', a: 'Our head office and learning centre is at Diamond Plaza I Annex, Parklands, a short drive down Limuru Road or Kiambu Road outside peak hours. We also have a centre in Karen.' },
      { q: 'What are the fees?', a: FEES_KE },
      { q: 'Do you offer home tuition in Ruaka?', a: 'In parts of Ruaka and nearby areas, yes, at USD 15/hour (≈ KSh 1,940 at the Oct 2026 rate), sometimes with a small transport contribution. See /tuition-nairobi for the areas and details.' },
      { q: 'Where would my child sit exams?', a: EXAMS_KE },
      { q: 'When can we start?', a: INTAKE_KE },
      { q: 'How do we pay and contact you?', a: PAY_KE + ' ' + CONTACT_KE },
    ],
    keywords: ['homeschooling Kiambu', 'online school Kiambu', 'Ruaka homeschool', 'IGCSE Kiambu', 'CBC homeschool Kiambu'],
    altTexts: {
      hero: 'Kiambu student in a live online Smartious lesson',
      curriculum: 'IGCSE study materials for a Kiambu student',
      tutor: 'Smartious teacher giving a one-to-one lesson to a Kiambu student',
    },
  },
]

export const KENYA_COUNTRY = {
  slug: 'kenya',
  name: 'Kenya',
  longName: 'Republic of Kenya',
  flag: '🇰🇪',
  hub: '/online-school/kenya',
  hubPageId: 'homeschooling-kenya',
  cityPageId: 'kenya-city',
  seoTitle: 'Homeschooling & Online School in Kenya | Smartious',
  seoDesc: 'Online school and homeschool in Kenya: live CBC, IGCSE, A-Level and IB classes from Nairobi. From USD 423/month (≈ KSh 54,600). January 2027 intake open.',
  currency: 'KES',
  currencyName: 'Kenyan Shilling',
  currencyPeg: { rate: 129, since: null, note: 'KES floats; figures use about KSh 129/USD (Oct 2026 rate) and are approximate' },
  timezone: { code: 'EAT', name: 'East Africa Time', utcOffset: 3, offsetFromEAT: 0 },
  examCentres: [
    'British Council Kenya (Nairobi): private-candidate entries for Cambridge and Pearson Edexcel',
    'KNEC-registered centres: KJSEA and KCSE',
  ],
  heroImage: 'https://images.unsplash.com/photo-1535397459466-3a01a3ba6b21?w=1600&q=80&auto=format&fit=crop',
  heroEyebrow: 'Online school in Kenya · Live classes',
  heroH1Suffix: 'Kenya',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP plus CBE (CBC), for Kenyan families in Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika and Kiambu, and for Kenyan families abroad. From USD 423/month for Primary (≈ KSh 54,600, Oct 2026 rate), payable termly. January 2027 intake: Term 2 starts 5 January 2027.',
  heroValueProp: 'The Brookhouse / Braeburn / Aga Khan Academy / Hillcrest / GEMS Cambridge / Strathmore / Pembroke House alternative. Built for Kenyan families across all 47 counties — plus Kenyan diaspora globally seeking curriculum continuity for return home. Founded in Nairobi in 2018, with our head office at Diamond Plaza I Annex, Parklands, and a second centre in Karen.',
  whatsappTrigger: 'Hi Smartious, I would like online homeschooling for my child in Kenya.',
  citiesSectionTitle: 'Online homeschooling across Kenya',
  citiesSectionBody: 'Seven Kenyan city pages: Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika and Kiambu. Each covers local estates, the school run, where to sit exams, CBE and Grade 10 choices, fees and the questions parents in that city ask.',

  trustSignals: [
    { metric: 'Established', value: '2018', sub: 'Nairobi-based — HQ in Kenya' },
    { metric: 'Curricula', value: '5', sub: 'Cambridge · Edexcel · IB · American AP · CBC' },
    { metric: 'January 2027 intake', value: '5 Jan', sub: 'Term 2 starts 5 January 2027' },
    { metric: 'Countries served', value: '40+', sub: 'Africa · Gulf · Europe · Americas' },
    { metric: 'Nairobi centres', value: '2', sub: 'Parklands head office · Karen' },
    { metric: 'Founded by', value: 'Alfred Ouko', sub: 'UoN-trained Maths & Physics educator' },
  ],

  competitorsIntro: 'Kenya has one of Africa\'s most developed international school sectors, concentrated in Nairobi with established options in Mombasa, Nakuru, Naivasha, and other towns. Below are major Cambridge, IB, and American curriculum schools Kenyan families compare with Smartious.',
  competitors: [
    {
      name: 'Brookhouse Schools',
      city: 'Nairobi (Karen, Runda campuses)',
      curriculum: 'British / Cambridge IGCSE & A-Level',
      feesAed: 'Approx. KSh 1.6M – 2.4M / year',
      feesUsd: '12,400 – 18,600',
      rating: 'Established Cambridge school',
      capacityNote: 'Selective admissions',
    },
    {
      name: 'Braeburn Schools (Network)',
      city: 'Nairobi multiple campuses + Mombasa, Nakuru, Eldoret',
      curriculum: 'British / Cambridge IGCSE & A-Level',
      feesAed: 'Approx. KSh 1.4M – 2.2M / year',
      feesUsd: '10,900 – 17,100',
      rating: 'Established Cambridge network',
      capacityNote: 'Multiple campus locations',
    },
    {
      name: 'Aga Khan Academy Nairobi',
      city: 'Nairobi',
      curriculum: 'IB Diploma + IB MYP',
      feesAed: 'Approx. KSh 1.8M – 2.6M / year',
      feesUsd: '14,000 – 20,200',
      rating: 'Established IB school',
      capacityNote: 'Highly selective',
    },
    {
      name: 'GEMS Cambridge International School Nairobi',
      city: 'Nairobi (Karen)',
      curriculum: 'British / Cambridge IGCSE & A-Level',
      feesAed: 'Approx. KSh 1.4M – 2.0M / year',
      feesUsd: '10,900 – 15,500',
      rating: 'GEMS network school',
      capacityNote: 'Established programme',
    },
    {
      name: 'Hillcrest International Schools',
      city: 'Nairobi (Karen)',
      curriculum: 'British / Cambridge IGCSE & A-Level',
      feesAed: 'Approx. KSh 1.5M – 2.2M / year',
      feesUsd: '11,600 – 17,100',
      rating: 'Established Karen school',
      capacityNote: 'Established admissions',
    },
    {
      name: 'Strathmore School',
      city: 'Nairobi',
      curriculum: 'Cambridge IGCSE & A-Level',
      feesAed: 'Approx. KSh 800K – 1.4M / year',
      feesUsd: '6,200 – 10,900',
      rating: 'Established boys school, Cambridge',
      capacityNote: 'Selective boys school',
    },
    {
      name: 'Pembroke House',
      city: 'Gilgil (rural Rift Valley)',
      curriculum: 'British prep school / Cambridge',
      feesAed: 'Approx. KSh 1.8M – 2.4M / year',
      feesUsd: '14,000 – 18,600',
      rating: 'Established boarding prep',
      capacityNote: 'Boarding school commitment',
    },
    {
      name: 'Smartious (live online)',
      city: 'All 47 Kenyan counties',
      curriculum: 'Cambridge IGCSE & A-Level · Edexcel · IB · American AP · CBC',
      feesAed: 'From ≈ KSh 54,600/month for Primary (Oct 2026 rate)',
      feesUsd: 'From 423/month (Primary), payable termly',
      rating: 'Live online · subject teachers · Nairobi head office',
      capacityNote: 'Immediate enrolment — accessible from any county',
      isUs: true,
    },
  ],

  legalFrameworkIntro: 'What Kenyan families should know about the law, the national curriculum, exams and university entry. This is general information, not legal advice.',
  legalFramework: [
    {
      h: 'The law on homeschooling',
      p: 'The Basic Education Act 2013 makes basic education compulsory. Kenyan law does not yet set out a separate registration process for homeschooling. Homeschooling is practised in Kenya and has been discussed in the courts and in education policy. Families who are unsure should take advice. Smartious provides timetables, schemes of work and reports.',
    },
    {
      h: 'CBE (CBC) and the move to senior school',
      p: 'Competency-Based Education (CBE, formerly CBC) is overseen by the Ministry of Education with curriculum designs from KICD. Learners sit KPSEA at the end of Grade 6 and KJSEA at the end of Grade 9, then move to senior school in Grade 10 on a pathway: STEM, Social Sciences, or Arts and Sports Science. KCSE continues for the remaining 8-4-4 candidates. KNEC runs all of these assessments.',
    },
    {
      h: 'Cambridge and Pearson Edexcel as a private candidate',
      p: 'Home-educated and online students take Cambridge IGCSE and A Level, or Pearson Edexcel International GCSE and A Level, as private candidates. In Kenya, entries are made through British Council Kenya, whose exams team is in Nairobi. Entry deadlines fall several months before each series, so check the British Council Kenya website for current dates and fees.',
    },
    {
      h: 'University entry in Kenya',
      p: 'Kenyan universities admit students with IGCSE and A Level results. Applicants are usually asked for an equivalence or recognition letter from the Kenya National Qualifications Authority (KNQA), and each programme sets its own requirements. Check with the admissions office early.',
    },
    {
      h: 'Kenyan families abroad',
      p: 'Families abroad who plan to return can keep their children on the same Cambridge, Pearson Edexcel or IB route online, in East Africa Time or with recordings, and continue after the move without changing curriculum.',
    },
  ],

  whySmartious: [
    {
      h: 'Nairobi-based — we are Kenyan',
      p: 'Smartious was founded in Nairobi in 2018. Our head office and learning centre is at Diamond Plaza I Annex, Parklands, and we have a second centre in Karen. Founded by Alfred Ouko, University of Nairobi-trained Mathematics and Physics educator. We are Kenyan-built, Kenyan-led, and Kenyan-serving — with global reach to 40+ countries.',
    },
    {
      h: 'Brookhouse / Braeburn / Aga Khan Academy alternative pricing',
      p: 'Brookhouse KES 1.6M-2.4M/year, Braeburn KES 1.4M-2.2M/year, Aga Khan Academy KES 1.8M-2.6M/year, GEMS Cambridge KES 1.4M-2.0M/year, Hillcrest KES 1.5M-2.2M/year. Smartious online school is from USD 423/month for Primary (≈ KSh 54,600 at the Oct 2026 rate), payable termly; fees vary by curriculum and level.',
    },
    {
      h: 'Accessible from any of Kenya\'s 47 counties',
      p: 'Top Cambridge schools are concentrated in Nairobi (Karen, Runda, Westlands) and a few other major towns. For families in Kisumu, Eldoret, Kakamega, Meru, Nyeri, Machakos, Kitui, Kilifi, Lamu, Garissa, Lodwar — and all other Kenyan counties — Cambridge international school access historically required Nairobi relocation. Smartious eliminates this — Cambridge curriculum from any Kenyan county with reliable internet.',
    },
    {
      h: 'EAT live class scheduling — exact match Kenyan school hours',
      p: 'Live classes run in East Africa Time (EAT, UTC+3), during normal Kenyan school hours. Same time zone whether you\'re in Nairobi Karen, Mombasa Nyali, Kisumu Milimani, or Eldoret town.',
    },
    {
      h: 'Five curricula — CBC plus four international',
      p: 'Smartious delivers CBC (Kenyan national), Cambridge IGCSE/A-Level (British), Pearson Edexcel, IB Diploma, plus American AP. Families can choose national curriculum (CBC) for domestic Kenyan university pathways, international curriculum (Cambridge/IB/American) for global university pathways, or combine for maximum optionality.',
    },
    {
      h: 'Live teachers, not pre-recorded video',
      p: 'Every Smartious class is taught live by a qualified subject teacher, and every lesson is recorded for review. Real-time questions, real-time clarifications. Distinct from pre-recorded online providers.',
    },
    {
      h: 'Diaspora-friendly — global delivery for Kenyan families abroad',
      p: 'For Kenyan diaspora families in UK, US, Canada, Australia, UAE, South Africa, Germany, Smartious provides curriculum continuity for eventual return home. Children continue international curriculum without disruption.',
    },
  ],

  faqs: [
    {
      q: 'How much does homeschooling cost in Kenya?',
      a: 'With Smartious, online school is from USD 423/month for Primary (≈ KSh 54,600/month at the Oct 2026 rate of about KSh 129/USD), payable termly. Secondary, IGCSE, A Level and IB fees vary by curriculum and level, and we confirm them after the assessment. One-to-one tuition is USD 15/hour (≈ KSh 1,940). Exam board entry fees (British Council Kenya or KNEC) are paid separately. Fees are non-refundable once the assessment is done, the timetable created and lessons started.',
    },
    {
      q: 'How does Smartious compare to Brookhouse, Braeburn, Aga Khan Academy, GEMS Cambridge, Hillcrest, Strathmore?',
      a: 'Top Cambridge schools in Kenya — Brookhouse (KES 1.6M-2.4M/year), Braeburn (KES 1.4M-2.2M/year), Aga Khan Academy (KES 1.8M-2.6M/year — IB), GEMS Cambridge International School (KES 1.4M-2.0M/year), Hillcrest International (KES 1.5M-2.2M/year), Strathmore School (KES 800K-1.4M/year) — provide physical campus education with established sports, arts, and pastoral programmes. Smartious provides live online Cambridge, IB, American or CBE (CBC) teaching from USD 423/month for Primary (≈ KSh 54,600 at the Oct 2026 rate), payable termly; fees vary by curriculum and level. The trade-off: no full campus, but the same exam boards and qualifications, small live classes, and access from any county, with centres in Parklands and Karen for Nairobi families.',
    },
    {
      q: 'My family lives outside Nairobi (Mombasa / Kisumu / Eldoret / Kakamega / Meru / Nyeri / rural Kenya). How does Smartious work?',
      a: 'Smartious works from any Kenyan county with reliable internet — Mombasa, Kisumu, Nakuru, Eldoret, Kakamega, Meru, Nyeri, Machakos, Kitui, Kilifi, Malindi, Lamu, Garissa, Kitale, Lodwar — every county. Live online classes deliver in East Africa Time matching standard Kenyan school hours nationally. Cambridge and Pearson Edexcel private-candidate entries go through British Council Kenya, whose exams team is in Nairobi; families outside Nairobi should check the venue for their series early and plan any travel. Safaricom and Airtel 4G LTE plus growing fibre coverage make live online learning viable across most of Kenya.',
    },
    {
      q: 'Should I choose CBC, 8-4-4, or Cambridge IGCSE/A-Level?',
      a: 'It depends on where your child hopes to study and how they learn best. Under CBE (CBC), learners sit KJSEA at the end of Grade 9 and move to senior school in Grade 10 with a pathway; KCSE continues for the remaining 8-4-4 candidates. Cambridge IGCSE and A Level are accepted by Kenyan universities (usually with a KNQA equivalence letter) and are widely recognised abroad. Smartious teaches both routes, and many families plan a switch from CBE to IGCSE at Year 10. We explain the options for your child at the assessment.',
    },
    {
      q: 'Can my Kenyan child apply to UoN, Strathmore, USIU-Africa, Aga Khan University with Cambridge qualifications?',
      a: 'Kenyan universities, including the University of Nairobi, Strathmore, USIU-Africa, Kenyatta University and Aga Khan University, admit students with Cambridge IGCSE and A Level results. Applicants are usually asked for an equivalence or recognition letter from the Kenya National Qualifications Authority (KNQA), and each programme sets its own subject and grade requirements, so check with the university\'s admissions office early.',
    },
    {
      q: 'How does Smartious work for Kenyan diaspora families considering return home?',
      a: 'For Kenyan diaspora families in UK, US, Canada, Australia, UAE, South Africa, Germany, considering return to Kenya over 2-5 year timelines, Smartious provides curriculum continuity. Children continue Cambridge IGCSE/A-Level, IB Diploma, or American curriculum while abroad, with seamless continuation upon return to Kenya (either continued Smartious enrolment from any Kenyan county or transition to Kenyan international school like Brookhouse, Braeburn). No curriculum bridging required.',
    },
    {
      q: 'Will my child miss out on sports, arts, and social development without a physical school?',
      a: 'A physical school provides a complete daily environment that an online programme does not replicate. However, Kenyan families combine Smartious academic instruction with sports clubs (athletics — Kenya has world-class running culture, football, rugby, swimming, equestrian, golf), music academies, scouts, debate, plus religious community involvement. Smartious classes themselves provide live peer interaction across 40+ countries.',
    },
    {
      q: 'Are Smartious teachers qualified to deliver Cambridge curriculum?',
      a: 'Yes. Smartious teachers are qualified subject specialists who teach the Cambridge, Pearson Edexcel, IB, American and CBE programmes they deliver. They teach from Nairobi, at our Parklands and Karen centres.',
    },
    {
      q: 'Is homeschooling legal in Kenya?',
      a: 'The Basic Education Act 2013 makes basic education compulsory, and Kenyan law does not yet set out a separate registration process for homeschooling. Homeschooling is practised in Kenya and has been discussed in the courts and in education policy. Families who are unsure should take advice. Smartious provides timetables, schemes of work, assessments and termly reports, which families find useful if they are asked about their child\'s education.',
    },
    {
      q: 'How does payment work — KES or USD?',
      a: 'Fees are set in USD: online school is from USD 423/month for Primary (≈ KSh 54,600/month at the Oct 2026 rate of about KSh 129/USD), payable termly; fees vary by curriculum and level. One-to-one tuition is USD 15/hour (≈ KSh 1,940). Families in Kenya usually pay by M-Pesa or bank transfer, and card payments go through Paystack. Fees are non-refundable once the assessment is done, the timetable created and lessons started.',
    },
    {
      q: 'How reliable is internet connectivity for live online learning in Kenya?',
      a: 'Safaricom 4G LTE and growing 5G provides excellent connectivity across Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, and all major Kenyan cities. Fibre internet (Safaricom Home Fibre, Zuku, Faiba) is increasingly available in Nairobi, Mombasa, Kisumu, Eldoret. Airtel Kenya provides additional coverage. For more rural locations (Kitui, Marsabit, Turkana, parts of Garissa), Starlink satellite provides reliable backup. Smartious recorded sessions ensure no lost lessons regardless of connectivity events.',
    },
    {
      q: 'Where do Kenyan students sit Cambridge IGCSE and A-Level examinations?',
      a: 'Cambridge and Pearson Edexcel exams are taken as a private candidate, with entries made through British Council Kenya, whose exams team is in Nairobi. Cambridge runs May/June and October/November series, and entry deadlines fall several months before each series, so check the British Council Kenya website for current dates and fees. KJSEA and KCSE are run by KNEC and registered through a KNEC-registered centre.',
    },
    {
      q: 'How do we know if Smartious is the right fit for our family?',
      a: 'Book a free consultation. We will talk through your child\'s current grade or year, the universities they may aim for, your county and routine, and whether CBE or an international curriculum fits best. We will tell you honestly if another option suits your family better. You can also visit our Parklands or Karen centre. Admissions: +254 745 021 212. Academic office: +254 182 071 920. Email: hello@smartioushomeschool.com. The January 2027 intake is open: Term 2 starts on 5 January 2027.',
    },
    { q: 'How do live online classes work?', a: 'Students follow a weekly timetable of live lessons with qualified teachers, in small groups or one to one, and every lesson is recorded for catch-up. Families receive assessments and termly reports. Each student starts with a placement assessment, so we can place them at the right level.' },
    { q: 'When is the next intake?', a: 'The January 2027 intake is open: Term 2 starts on 5 January 2027. Students can also join during the year after an assessment.' },
    { q: 'How do we contact Smartious?', a: 'Admissions: +254 745 021 212 (call or WhatsApp). Academic office: +254 182 071 920. Email: hello@smartioushomeschool.com.' },
  ],

  ctaH: 'Ready to start your child\'s Cambridge journey from Kenya?',
  ctaSubhead: 'Free 15-minute consultation. We\'ll walk through your child\'s year group, target universities, and curriculum fit. Visit our Parklands or Karen centre, or join online. January 2027 intake: Term 2 starts 5 January 2027. No commitment.',
}
