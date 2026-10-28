/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════
// partnershipPages.js — one landing page per partnership type, at
// /partnerships/<slug>, written for what that partner searches for.
// Rendered by pages/PartnershipsPage.jsx (with the enquiry form preset to
// the type) and by scripts/seo-static.mjs (static HTML, FAQ, sitemap).
//
// Keys match PARTNERSHIP_TYPES in data/careers.js. Claims stay to what
// the site already states (students in 40+ countries, the curricula we
// teach, live small classes); no partner names, numbers or outcomes we
// cannot show.
// ═══════════════════════════════════════════════════════════════════

export const PARTNERSHIP_PAGES = {
  university_scholarships: {
    slug: 'universities-and-scholarships',
    title: 'University Partnerships & Scholarships | Smartious',
    desc: 'Universities and scholarship providers: reach Cambridge, Pearson Edexcel, IB and AP students in 40+ countries through a live online school that plans university entry from Grade 9.',
    h1: 'University partnerships and scholarships for internationally qualified students',
    intro: 'Smartious teaches Cambridge IGCSE and A Level, Pearson Edexcel, the IB Diploma and Advanced Placement live to students in more than forty countries, and plans every student’s route to university from the start of their qualification years. Universities, colleges, foundation providers and scholarship funds partner with us to put their programmes and awards in front of students who already hold the qualifications they admit on.',
    forWho: ['Universities and university colleges recruiting international students', 'Foundation and pathway providers', 'Scholarship foundations and award programmes', 'Admissions and international recruitment teams'],
    offer: [
      ['Students on the qualifications you admit', 'A Level, IB Diploma and AP students, and IGCSE students choosing their next step, across Africa, the Gulf, Europe, Asia and the Americas.'],
      ['University guidance built into the school', 'Our academic team plans subject choices against entry requirements, so a scholarship with subject conditions reaches students who can meet them.'],
      ['Information sessions and visits', 'Live online information sessions with our students and families, scheduled across time zones.'],
      ['Scholarship administration', 'We publicise awards to eligible students, collect applications to your criteria and pass on complete files.'],
    ],
    steps: ['Tell us about your institution, programmes and any scholarships.', 'We agree the students, countries and qualifications the partnership is for.', 'We run information sessions and share award details with eligible students and families.', 'Applications go to you; we support students through the process.'],
    ask: 'Clear published entry requirements for international qualifications, and scholarship criteria we can share with families.',
    faqs: [
      { q: 'Which qualifications do Smartious students hold?', a: 'Cambridge IGCSE, AS and A Level, Pearson Edexcel International GCSE and International A Level, the IB Diploma and Advanced Placement, examined by the independent boards.' },
      { q: 'Where are your students?', a: 'In more than forty countries, with large groups in Africa and the Gulf and families in Europe, Asia and the Americas.' },
      { q: 'Do you charge universities for a partnership?', a: 'Tell us what you have in mind and we will agree terms that fit the partnership, from information sessions to administered scholarships.' },
      { q: 'Can you run a scholarship for us?', a: 'Yes. We can publicise an award to eligible students, collect applications against your criteria and send you complete files to decide on.' },
    ],
  },

  exam_centre: {
    slug: 'exam-centres',
    title: 'Exam Centre Partnerships: Private Candidates',
    desc: 'Authorised Cambridge, Pearson Edexcel, IB, AP and IELTS centres: host Smartious students as private candidates, with entries planned early and candidates prepared.',
    h1: 'Exam centre partnerships: host our students as private candidates',
    intro: 'Smartious students sit Cambridge, Pearson Edexcel, IB and AP examinations at authorised centres in the countries they live in, as private candidates. We partner with centres that accept external candidates so that every student has a confirmed seat, entries arrive on time and in order, and candidates turn up prepared.',
    forWho: ['Cambridge International and Pearson Edexcel examination centres', 'IB World Schools and College Board AP test centres', 'British Council and other English-language test venues', 'Schools able to host science practical examinations'],
    offer: [
      ['Planned, early entries', 'We confirm subjects and candidate numbers well before entry deadlines, so you are not handling late entries.'],
      ['Prepared candidates', 'Students arrive having sat full mocks under timed conditions and knowing the centre’s rules.'],
      ['One contact for every candidate', 'A named coordinator handles candidate details, documents and questions for all our students at your centre.'],
      ['Steady demand across series', 'Candidates across the January, May/June and October/November series, depending on the board.'],
    ],
    steps: ['Tell us your centre number, boards, series and capacity for external candidates.', 'We agree fees, seats and the entry timetable with you.', 'We submit candidate details and entries to your deadlines.', 'Candidates sit with you; we follow up on results and any post-results services.'],
    ask: 'Authorisation for the boards you list, a clear fee schedule for private candidates, and, where relevant, the ability to host practical or speaking components.',
    faqs: [
      { q: 'Who pays the examination entry fees?', a: 'Families pay entry fees to the centre, at the centre’s published rate for private candidates. We coordinate the entries so the centre deals with one organised list.' },
      { q: 'Which boards do your students sit?', a: 'Mostly Cambridge International and Pearson Edexcel, with IB and AP candidates and English-language tests such as IELTS.' },
      { q: 'Can you send candidates for science practicals?', a: 'Yes, where a centre can host practical examinations; tell us in your enquiry and we will plan those candidates separately.' },
      { q: 'How many candidates would you send?', a: 'It depends on where our students live and the series. Tell us your capacity and we will agree numbers per series.' },
    ],
  },

  training_provider: {
    slug: 'teacher-training-providers',
    title: 'Teacher Training & CPD Partnerships with an Online School',
    desc: 'Teacher-training and CPD providers: train Smartious teachers in online pedagogy, safeguarding, assessment, examiner skills, SEN and leadership.',
    h1: 'Teacher training and CPD partnerships',
    intro: 'Every Smartious teacher has a development record in our portal, with training, observations and certificates in one place. We partner with training providers whose courses make our teachers better at live online teaching, assessment and safeguarding, and whose certificates belong on a teacher’s file.',
    forWho: ['Teacher-training colleges and universities', 'CPD and professional-development providers', 'Examination-board and examiner-training providers', 'Safeguarding, SEN and educational-technology trainers'],
    offer: [
      ['A teaching team to train', 'Subject specialists teaching Cambridge, Edexcel, IB and AP live, across several countries.'],
      ['Training that is recorded and used', 'Completed courses go into each teacher’s development record and are followed up in lesson observations.'],
      ['Online and Nairobi delivery', 'Live online cohorts, or in person at our Nairobi centres.'],
      ['A long-term relationship', 'Training planned across the year rather than one-off sessions.'],
    ],
    steps: ['Tell us your courses, accreditation and delivery.', 'We match courses to our teachers’ development priorities.', 'We agree cohorts, dates and terms.', 'Certificates go into teachers’ records and we review the impact.'],
    ask: 'Clear learning outcomes, certificates for participants, and recognition or accreditation where you have it.',
    faqs: [
      { q: 'What training do you need most?', a: 'Live online pedagogy, assessment and feedback, examiner training for Cambridge and Edexcel, safeguarding, SEN and inclusion, and leadership.' },
      { q: 'Can training be delivered online?', a: 'Yes. Most of our teachers work online across time zones, so online cohorts suit us; in-person sessions are possible in Nairobi.' },
      { q: 'Do participants need certificates?', a: 'We strongly prefer them, because completed training is recorded on each teacher’s file.' },
      { q: 'How do you choose providers?', a: 'By fit with our teachers’ development priorities, the quality and recognition of the course, and delivery that works across time zones.' },
    ],
  },

  co_curricular: {
    slug: 'co-curricular-providers',
    title: 'Co-curricular & After-School Provider Partnerships',
    desc: 'Coding, robotics, music, sport, debate and STEM providers: run clubs and activities for Smartious students online or in Nairobi.',
    h1: 'Co-curricular and after-school provider partnerships',
    intro: 'Smartious students learn online and at our Nairobi centres, and they need the clubs, sport, music and competitions a campus school offers. We partner with co-curricular providers who can run high-quality activities for our students, live online or in person in Nairobi, with proper safeguarding.',
    forWho: ['Coding, robotics and STEM programmes', 'Music, art and drama teachers and schools', 'Sports academies and coaches', 'Debate, Model UN, chess and enrichment programmes', 'Award schemes and outdoor-education providers'],
    offer: [
      ['Students who want more than lessons', 'Learners aged 5 to 18 looking for clubs, competitions and creative work alongside their studies.'],
      ['Online and Nairobi', 'Activities run live online for students worldwide, or in person at our Nairobi centres.'],
      ['Clubs built into the school', 'Activities appear in our clubs system, with sign-ups, attendance and communication with families.'],
      ['Flexible arrangements', 'Per-student, per-term or revenue-share pricing, agreed with you.'],
    ],
    steps: ['Tell us your activities, age groups and delivery.', 'We check safeguarding arrangements and agree a pilot.', 'We promote the activity to families and manage sign-ups.', 'We review attendance and feedback each term.'],
    ask: 'A safeguarding policy and checked staff, a clear programme for each age group, and reliable delivery.',
    faqs: [
      { q: 'Can activities be online?', a: 'Yes. Many of our students are online-only and in different countries, so live online clubs reach the most students.' },
      { q: 'Which activities are you looking for?', a: 'Coding and robotics, STEM, music, art, drama, debate and Model UN, chess, languages, sport and award schemes.' },
      { q: 'What safeguarding do you require?', a: 'A written safeguarding policy, checked staff for anyone working with children, and our code of conduct for online sessions.' },
      { q: 'How is pricing agreed?', a: 'Per student, per session, per term or as a revenue share, whichever suits the activity.' },
    ],
  },

  school_partnership: {
    slug: 'schools',
    title: 'School Partnerships: Subjects Taught Live Online',
    desc: 'Schools: add subjects you cannot staff, Cambridge or Edexcel courses alongside your curriculum, exam preparation and the Virtual Lab, taught live by Smartious.',
    h1: 'School partnerships: subjects, specialists and international courses, taught live',
    intro: 'Every school has subjects it cannot staff for a small group: Further Mathematics, separate sciences at A Level, Computer Science, a third language. Smartious teaches those subjects live, online, to students who stay at their own school, and offers Cambridge and Pearson Edexcel courses alongside national curricula. Schools partner with us to widen what they offer without hiring for every subject.',
    forWho: ['Independent and international schools', 'Public and government schools with small-cohort subjects', 'Schools adding Cambridge or Edexcel alongside a national curriculum', 'Homeschool co-operatives'],
    offer: [
      ['Subjects you cannot staff', 'Live lessons for small groups in subjects your timetable cannot carry.'],
      ['International courses alongside yours', 'Cambridge and Edexcel IGCSE and A Level taught alongside your national curriculum.'],
      ['Examination preparation', 'Revision courses and mock examinations before each series.'],
      ['The Virtual Lab', 'Interactive 3D practicals for science classes.'],
    ],
    steps: ['Tell us your school, curriculum and the subjects or courses you need.', 'We propose timetabled live lessons and agree terms.', 'Your students join our classes from school or home.', 'You receive reports on attendance, progress and results.'],
    ask: 'A named coordinator at your school and timetable slots for the students taking our classes.',
    faqs: [
      { q: 'Do students stay enrolled at our school?', a: 'Yes. Your school keeps the student; we teach the agreed subjects live and report progress back to you.' },
      { q: 'Which subjects can you teach?', a: 'Most Cambridge, Pearson Edexcel, IB and AP subjects, including Further Mathematics, separate sciences, Computer Science, Economics and languages.' },
      { q: 'Can lessons fit our timetable?', a: 'We run two teaching teams in different time zones, so we can usually find slots inside your school day or straight after it.' },
      { q: 'How is it priced?', a: 'Per student per subject, agreed with your school.' },
    ],
  },

  technology: {
    slug: 'edtech',
    title: 'EdTech Partnerships with a Live Online School',
    desc: 'EdTech, platform, assessment and connectivity companies: pilot and integrate with Smartious’s live classroom, learning platform and Virtual Lab.',
    h1: 'EdTech and technology partnerships',
    intro: 'Smartious runs its own live classroom, learning platform and 3D Virtual Lab, used every day by teachers and students in many countries and on every kind of connection. We partner with technology companies whose products make that teaching better, whether through integrations, pilots with real classes or connectivity for students who need it.',
    forWho: ['Learning platform and assessment companies', 'AI and educational-content tools', 'Devices and connectivity providers', 'Video, whiteboard and collaboration tools'],
    offer: [
      ['Real classes to pilot with', 'Live teaching across curricula and time zones, with teachers who give clear feedback.'],
      ['An in-house platform', 'Our own classroom, portal and Virtual Lab, so integrations are decided and built directly.'],
      ['Demanding conditions', 'Students on fibre, mobile data and satellite, on phones, tablets and laptops.'],
    ],
    steps: ['Tell us your product and what you propose.', 'We agree a scoped pilot with clear measures.', 'We run it with real classes and share results.', 'If it works, we agree terms for wider use or integration.'],
    ask: 'Strong data protection and privacy practices, suitable for children’s data, and a product that works on modest connections.',
    faqs: [
      { q: 'Do you build your own platform?', a: 'Yes. Our live classroom, learning portal and Virtual Lab are built in-house, so integrations are decided and built directly with us.' },
      { q: 'Can you run a pilot?', a: 'Yes, with defined classes, a fixed period and measures agreed in advance.' },
      { q: 'What do you require on data protection?', a: 'Children’s data must be protected to a high standard, with clear agreements on what is collected, where it is stored and who can see it.' },
    ],
  },

  content_publisher: {
    slug: 'publishers',
    title: 'Publisher Partnerships: Cambridge, IB & AP',
    desc: 'Educational publishers: supply textbooks, digital resources and assessment content to Smartious teachers and students on Cambridge, Pearson Edexcel, IB and AP courses.',
    h1: 'Publisher and content partnerships',
    intro: 'Smartious teachers plan from the syllabus and teach live, and they need excellent textbooks, digital resources and assessment material for Cambridge, Pearson Edexcel, IB and AP courses. We partner with publishers whose resources our teachers will use and recommend to families.',
    forWho: ['Educational publishers with international-curriculum titles', 'Digital-resource and question-bank providers', 'Revision-guide and past-paper publishers', 'Video and interactive-content producers'],
    offer: [
      ['Teachers who choose and use resources', 'Subject specialists who set reading and homework from the materials they rate.'],
      ['Families who buy what teachers recommend', 'Recommended resources reach families across many countries.'],
      ['Feedback from live teaching', 'Detailed feedback on how resources work in practice.'],
    ],
    steps: ['Tell us your titles, boards and formats.', 'Our subject leads review the resources.', 'We agree access, pricing for families and recommendation terms.', 'We share usage and feedback.'],
    ask: 'Resources endorsed or closely aligned to the current syllabuses, and digital access that works internationally.',
    faqs: [
      { q: 'Which boards do you teach?', a: 'Cambridge International, Pearson Edexcel, the IB and Advanced Placement, from Primary to A Level.' },
      { q: 'Do you prefer print or digital?', a: 'Digital access suits our international students best, but we recommend print titles where they are the best resource.' },
      { q: 'Can teachers review titles first?', a: 'Yes; review copies or trial access let our subject leads decide.' },
    ],
  },

  corporate_family: {
    slug: 'employers-and-relocation',
    title: 'Corporate Education Benefits for Employees’ Children',
    desc: 'Employers, mobility and relocation teams: online schooling and subject support for employees’ children through postings, relocations and remote assignments.',
    h1: 'Education benefits for your employees’ children',
    intro: 'When an employee is posted to a new country, a remote site or a short assignment, the hardest question is often their children’s schooling. Smartious teaches Cambridge, Pearson Edexcel, IB and AP live online, so a child keeps the same curriculum, teachers and examination board through every move. Employers and relocation teams partner with us to offer that continuity as part of an assignment package.',
    forWho: ['HR and global-mobility teams', 'Mining, energy and engineering companies with remote sites', 'Relocation companies', 'International organisations, NGOs and embassies'],
    offer: [
      ['Continuity through every move', 'The same curriculum, teachers and examination board before, during and after a posting.'],
      ['Remote and hardship locations', 'Live lessons on modest connections, recorded for rewatching, with a data-saver mode.'],
      ['Flexible packages', 'Full-time online school, subjects alongside a local school, examination preparation or tuition.'],
      ['One contact for your families', 'A named coordinator for your employees’ families.'],
    ],
    steps: ['Tell us your locations and how many families you support.', 'We agree the options and terms for your employees.', 'Families join through a single assessment and enrolment route.', 'You receive reporting on enrolment and use.'],
    ask: 'A named contact in HR or mobility, and clarity on what the benefit covers.',
    faqs: [
      { q: 'What happens when a family moves again?', a: 'The child continues the same subjects with the same teachers and board, and examinations are sat at authorised centres wherever the family is.' },
      { q: 'Can children study alongside a local school?', a: 'Yes. Many children take one to three subjects with us while attending a local or international school at the posting.' },
      { q: 'How is it billed?', a: 'Directly to the employer, to families, or split, as agreed in the partnership.' },
    ],
  },

  education_agent: {
    slug: 'education-agents',
    title: 'Education Agent Partnership Programme | Smartious',
    desc: 'Education agents and counsellors: refer families to Smartious for live online Cambridge, Pearson Edexcel, IB and AP schooling, with clear terms and admissions support.',
    h1: 'Education agent and counsellor partnerships',
    intro: 'Education agents and school counsellors advise families who need an internationally recognised education without a campus nearby, or with a move on the horizon. Smartious works with agents and counsellors who refer families to us for live online schooling and subject support, with clear terms and a straightforward admissions route.',
    forWho: ['Licensed education agents', 'Independent school and university counsellors', 'Relocation consultants advising families', 'Homeschool advisers'],
    offer: [
      ['A clear admissions route', 'Every referred family goes through our assessment, with progress visible to you.'],
      ['Agreed terms', 'Referral terms agreed in writing before any referral.'],
      ['Materials for families', 'Country guides, curriculum information and fee information you can share.'],
    ],
    steps: ['Tell us the countries you cover and the families you advise.', 'We agree referral terms in writing.', 'You refer families to our assessment.', 'We keep you informed as families enrol.'],
    ask: 'Registration or licensing where your country requires it, and honest advice to families about what we offer.',
    faqs: [
      { q: 'How do referrals work?', a: 'You introduce a family; the family books an assessment; we keep you informed as they progress through admissions.' },
      { q: 'Which countries do you cover?', a: 'We teach students in more than forty countries and publish guides for ninety-nine; tell us where you work.' },
      { q: 'Do you require agents to be licensed?', a: 'Where your country licenses education agents, yes.' },
    ],
  },

  ngo_foundation: {
    slug: 'ngos-and-foundations',
    title: 'NGO & Foundation Education Partnerships: Sponsored Places',
    desc: 'NGOs and foundations: sponsored places and education programmes with Smartious, live online Cambridge and Edexcel teaching for learners who need access.',
    h1: 'NGO and foundation partnerships',
    intro: 'Live online teaching can bring specialist teachers and internationally recognised qualifications to learners who would otherwise have no access to them: in remote areas, in displacement, or where a subject is simply not taught. Smartious works with NGOs and foundations to fund and run places and programmes for those learners.',
    forWho: ['Education NGOs', 'Foundations and philanthropic funds', 'Community and faith organisations', 'Corporate social-responsibility programmes'],
    offer: [
      ['Sponsored places', 'Full or part places in our live classes for learners you select or we select together.'],
      ['Programmes designed with you', 'Subject, examination or digital-skills programmes for a defined group.'],
      ['Reporting you can use', 'Attendance, progress and results reporting for your funders.'],
    ],
    steps: ['Tell us your focus and the learners you hope to reach.', 'We design the programme and budget with you.', 'Learners are selected and enrolled.', 'We report on attendance, progress and results.'],
    ask: 'A clear selection approach for learners, and agreement on reporting and safeguarding.',
    faqs: [
      { q: 'Can learners without devices take part?', a: 'Programmes can include devices and connectivity, or use a partner’s learning centre; we plan this with you.' },
      { q: 'What reporting do you provide?', a: 'Attendance, progress and examination results for each learner, in a format agreed for your funders.' },
      { q: 'Can a programme be co-funded?', a: 'Yes. Tell us whether you are seeking full funding, part funding or a co-funding partner.' },
    ],
  },

  media: {
    slug: 'media-and-events',
    title: 'Media & Education Events: Speakers, Fairs and Features',
    desc: 'Journalists, education fairs and conference organisers: interviews, expert commentary and speakers on online schooling, homeschooling and international curricula.',
    h1: 'Media, education fairs and events',
    intro: 'Smartious publishes country-by-country guides to online schooling and home education across ninety-nine countries, and teaches students in more than forty. We are glad to help journalists, education fairs and conference organisers with commentary, speakers and exhibitors on online schooling, home education and international curricula.',
    forWho: ['Journalists and editors', 'Education fair and exhibition organisers', 'Conference and webinar organisers', 'Podcasts and broadcasters'],
    offer: [
      ['Expert commentary', 'On online schooling, home-education law, international curricula and university entry.'],
      ['Speakers', 'Our founder and academic leaders for panels, talks and webinars.'],
      ['Exhibitors', 'A Smartious presence at education fairs, online or in person.'],
    ],
    steps: ['Tell us the outlet or event, the topic and the date.', 'We confirm a spokesperson or speaker.', 'We prepare and deliver.'],
    ask: 'The topic, the audience and the deadline or date.',
    faqs: [
      { q: 'What topics can you comment on?', a: 'Online and virtual schooling, home-education law by country, Cambridge, Edexcel, IB and AP, examinations and university entry.' },
      { q: 'How quickly can you respond?', a: 'Tell us your deadline in the enquiry and we will tell you straight away whether we can meet it.' },
    ],
  },
}

export const PARTNERSHIP_SLUG_TO_KEY = Object.fromEntries(Object.entries(PARTNERSHIP_PAGES).map(([k, p]) => [p.slug, k]))
