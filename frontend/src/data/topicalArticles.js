// ═══════════════════════════════════════════════════════════════════
// TOPICAL CLUSTER ARTICLES — supporting pages for the country hubs.
// Each article is a long-form landing page targeting a specific
// long-tail keyword cluster (e.g. "online IGCSE Malaysia", "OSSD
// Malaysia", "international school alternative Malaysia").
//
// Consumed by TopicalArticlePage.jsx which renders any article by
// slug. The Malaysia country hub's topicalClusterLinks field points
// to these URLs.
//
// SEO strategy: each article is 1,200-2,000 words of substantive
// content, internal-linked back to the country hub and cross-linked
// to related articles. Together they form a topical authority
// cluster that Google rewards with higher hub-page ranking.
//
// Adding an article: append an object to TOPICAL_ARTICLES with
// slug (= URL path), title, metaDesc, country, hubSlug, hubTitle,
// eyebrow, headline, subhead, sections (array of {h, ps} — heading
// plus paragraphs array), keyStats (optional), and relatedLinks.
// ═══════════════════════════════════════════════════════════════════

export const TOPICAL_ARTICLES = [
  // ═════════════════════════════════════════════════════════════════
  // 1. Cambridge IGCSE homeschooling in Malaysia — private candidate guide
  // ═════════════════════════════════════════════════════════════════
  {
    slug: 'online-igcse-malaysia',
    title: 'Online Cambridge IGCSE homeschooling in Malaysia — private candidate guide | Smartious',
    metaDesc: 'Complete guide to sitting Cambridge IGCSE as a private candidate in Malaysia. British Council Kuala Lumpur and Penang exam centres, RM 600-900/subject fees, live online delivery from USD 180/month.',
    country: 'Malaysia',
    hubSlug: '/online-school/malaysia',
    hubTitle: 'Online homeschool Malaysia',
    eyebrow: 'Malaysia · Cambridge IGCSE',
    headline: 'Online Cambridge IGCSE homeschooling in Malaysia',
    subhead: 'The complete guide to sitting Cambridge IGCSE as a private candidate in Malaysia — exam centres, fees, curriculum options, and what Malaysian families need to know.',
    keyStats: [
      { number: '217',       label: 'Cambridge-registered schools in Malaysia' },
      { number: '2',         label: 'British Council exam centres (KL + Penang)' },
      { number: 'RM 600-900', label: 'Private candidate fee per subject' },
      { number: 'USD 180',   label: 'Smartious monthly delivery cost' },
    ],
    sections: [
      { h: 'Why Cambridge IGCSE dominates Malaysian homeschooling',
        ps: [
          'Cambridge IGCSE (International General Certificate of Secondary Education) is the most widely adopted international curriculum among Malaysian homeschoolers, with 217 registered Cambridge schools across 14 states. For families opting out of the SPM national track — whether Malaysian citizens seeking international university pathways, Chinese Malaysian families targeting Australian or Canadian universities, or expat families needing continuous international qualifications through relocations — IGCSE is the pragmatic first choice.',
          'The qualification is recognised by every Malaysian university (University of Malaya, USM, UKM, UPM), every Malaysian branch campus of a foreign university (Monash Malaysia, Nottingham Malaysia, Heriot-Watt Malaysia, Xiamen Malaysia, Newcastle Medicine Malaysia, Southampton Malaysia, Reading Malaysia), and universities globally — UK Russell Group, US Ivy League, Canadian U15, Australian Group of Eight, Singapore NUS/NTU.',
          'Unlike SPM, which is locked to the Malaysian education system, Cambridge IGCSE is fully portable. A student who sits IGCSE in Kuala Lumpur can articulate directly into A-Level, IB Diploma, American High School, or Ontario Secondary School Diploma pathways without re-taking secondary qualifications.',
        ],
      },
      { h: 'Sitting Cambridge IGCSE as a private candidate in Malaysia',
        ps: [
          'Malaysia has two British Council examination centres accepting Cambridge private candidates: British Council Kuala Lumpur (primary Malaysia centre) and British Council Penang. Cambridge IGCSE examinations are hosted in the May/June and October/November series each year.',
          'Private candidate fees run approximately RM 600 to RM 900 per subject all-in (Cambridge International Education entry fee plus centre administrative fee), with late entry adding RM 100 to RM 250 per subject. A full 8-subject IGCSE sitting as a private candidate costs approximately RM 5,000 to RM 7,500 in examination fees alone — separate from tuition or curriculum delivery costs.',
          'Some Malaysian international schools also accept external candidates for their examination sessions, which can be an alternative for families in cities without a British Council centre (particularly East Coast, Sabah, Sarawak). Worth investigating locally in each state.',
          'Smartious handles the private candidate registration logistics for enrolled families — securing examination centre slots, submitting entries, coordinating results release, and issuing statements of results for university applications.',
        ],
      },
      { h: 'Recommended subject combinations for Malaysian IGCSE candidates',
        ps: [
          'A standard 8-subject IGCSE sitting for a Malaysian candidate typically includes: English as a Second Language (compulsory for non-native English speakers) or First Language English, Mathematics, Additional Mathematics (for A-Level Maths and STEM tracks), Combined Sciences or three separate sciences (Biology, Chemistry, Physics — recommended for medical and STEM tracks), plus 2-3 humanities or elective subjects from Geography, History, Business Studies, Economics, Accounting, ICT, Computer Science, and language options (Malay, Mandarin, Tamil).',
          'For Chinese Malaysian families targeting Canadian universities via Ontario OSSD, the IGCSE portfolio is complemented by concurrent Ontario Secondary School course enrolment through the Canadian Cross International School (CCIS) partnership. Students earn both credentials simultaneously.',
          'For Malaysian families targeting Newcastle University Medicine Malaysia (Iskandar Puteri) or other medical pathways, the essential subjects are Biology, Chemistry, Physics at Grade A or A* — plus Mathematics for statistical rigour.',
        ],
      },
      { h: 'Cost comparison: online IGCSE vs Malaysian physical international schools',
        ps: [
          'Malaysian premium international schools charge RM 55,000 to RM 165,000+ per year at the top tier (Alice Smith School, Garden International, British International School of Kuala Lumpur, Marlborough College Malaysia, International School of Kuala Lumpur, Mont\'Kiara International School). Mid-tier schools charge RM 22,000 to RM 45,000 per year.',
          'Since 1 September 2025, the Royal Malaysian Customs Department applies 6% Service Tax (SST) on private and international school annual fees exceeding RM 60,000 per student. A family paying RM 100,000/year at BSKL or ISKL now pays an additional RM 2,400 in SST on the fee portion above RM 60,000. Online education delivery is not subject to this SST.',
          'Smartious IGCSE delivery is USD 180 per month (approximately RM 850/month, or RM 10,200/year) for the small-group Online tier, USD 300/month (~RM 1,400/month) for Online Plus, and USD 540/month (~RM 2,500/month, ~RM 30,000/year) for Premium 1-on-1 with home tuition supplementation. Effective annual saving vs a RM 100,000/year physical school is approximately RM 70,000 to RM 90,000 depending on tier, with identical Cambridge qualifications.',
        ],
      },
      { h: 'How Smartious delivers Cambridge IGCSE in Malaysian time zones',
        ps: [
          'Live online classes are scheduled 2 PM to 6 PM Malaysia Standard Time (MYT, UTC+8), matching Malaysian post-school hours. Malaysian national school children can dual-track — attending sekolah kebangsaan in the morning plus Smartious Cambridge IGCSE in the afternoon. A 6 PM to 9 PM MYT evening window serves older students and evening-preferring families.',
          'Class sizes are small (4-6 students) with subject specialism — a Chemistry teacher teaches only Chemistry, a Mathematics teacher only Mathematics, unlike generalist primary-style teaching. Teachers are PGCE-qualified with Cambridge International training. Recorded sessions available 24/7.',
          'Classes work across TIME Fibre, Unifi (Telekom Malaysia), Maxis Fibre, and 5G mobile — Kuala Lumpur, Penang, Johor Bahru have strong residential fibre infrastructure, and Cyberjaya has gigabit-class MSC Malaysia legacy connectivity.',
        ],
      },
      { h: 'Progression from Cambridge IGCSE to A-Level, IB, or Ontario OSSD',
        ps: [
          'Cambridge IGCSE (Years 10-11 equivalent) is the foundation for multiple sixth form pathways. Cambridge A-Level (Years 12-13) is the natural continuation for UK Russell Group applications and Malaysian branch campus foundation pathways (Monash Malaysia, Nottingham Malaysia, Heriot-Watt Malaysia). IB Diploma Programme is chosen by families targeting US Ivy League, Canadian U15, or Singapore NUS/NTU where holistic breadth is valued.',
          'Chinese Malaysian families targeting Canadian universities frequently transition to Ontario Secondary School Diploma at Year 12 via the Smartious Canadian Cross International School (CCIS) partnership. Applying to Canadian universities via the Ontario Universities Application Centre (OUAC) as an Ontario secondary graduate is materially more advantageous than applying as an international student with A-Level or IB from Malaysia.',
          'American Advanced Placement (AP) courses complement the Cambridge track for families with US Common Application ambitions — Smartious offers AP Calculus, AP Statistics, AP Physics, AP Chemistry, AP Biology, AP Computer Science, AP English Literature, AP US and World History, and AP Economics.',
        ],
      },
    ],
    relatedLinks: [
      { title: 'Cambridge A-Level online in Malaysia', href: '/online-a-level-malaysia' },
      { title: 'Ontario OSSD for Malaysian families', href: '/ossd-malaysia' },
      { title: 'International school alternatives in Malaysia', href: '/international-school-alternative-malaysia' },
      { title: 'Malaysian branch campus universities', href: '/branch-campus-universities-malaysia' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════
  // 2. Ontario OSSD for Malaysian families
  // ═════════════════════════════════════════════════════════════════
  {
    slug: 'ossd-malaysia',
    title: 'Ontario Secondary School Diploma (OSSD) for Malaysian families | Smartious',
    metaDesc: 'Ontario OSSD via Canadian Cross International School partnership for Malaysian families targeting Canadian U15 universities. Apply via OUAC as Ontario secondary graduate. From USD 180/month.',
    country: 'Malaysia',
    hubSlug: '/online-school/malaysia',
    hubTitle: 'Online homeschool Malaysia',
    eyebrow: 'Malaysia · Ontario OSSD pathway',
    headline: 'Ontario Secondary School Diploma (OSSD) for Malaysian families',
    subhead: 'The Canadian university pathway for Chinese Malaysian and Malaysian families targeting the University of Toronto, McGill, UBC, McMaster, Waterloo, Western, Queen\'s. Only Sunway International offers Ontario locally in the Klang Valley — Smartious extends OSSD access to all Malaysian cities via Canadian Cross International School partnership.',
    keyStats: [
      { number: 'U15',        label: 'Canadian research universities accepting OSSD via OUAC' },
      { number: '30 credits', label: 'Required for Ontario Secondary School Diploma' },
      { number: '40 hours',   label: 'Community involvement requirement' },
      { number: '1',          label: 'Physical Ontario school in KL area (Sunway International)' },
    ],
    sections: [
      { h: 'Why Ontario OSSD matters for Malaysian families targeting Canadian universities',
        ps: [
          'Chinese Malaysian families represent approximately 23% of Malaysia\'s population and are disproportionately represented in premium international school enrolment. Historically, Chinese Malaysian families have targeted Canadian U15 research universities — University of Toronto, McGill, University of British Columbia, McMaster, Waterloo, Western, and Queen\'s — at rates materially higher than the general Malaysian population.',
          'When applying to Canadian universities, applicants fall into two categories: Canadian secondary school graduates (applying via the Ontario Universities Application Centre / OUAC as domestic applicants) and international students (applying with foreign qualifications like Cambridge A-Level, IB Diploma, or SPM). Ontario secondary graduates enjoy materially advantageous admission consideration, including access to specific programmes not open to international applicants and eligibility for certain scholarships and residency streams.',
          'Only Sunway International School (Subang Jaya, Sunway City) offers the Ontario curriculum physically in the Klang Valley. Families in Mont Kiara, Damansara Heights, Bangsar, Ampang, Petaling Jaya, Penang, Johor Bahru, and East Malaysia previously had no local Ontario option. Smartious extends OSSD access via our Canadian Cross International School (CCIS) partnership.',
        ],
      },
      { h: 'How the Smartious CCIS partnership works',
        ps: [
          'Canadian Cross International School (CCIS) is an Ontario-inspected private school with authority to issue the Ontario Secondary School Diploma. Smartious partners with CCIS to enrol students concurrently — students receive Smartious teaching delivery (live online classes matching Malaysian post-school hours) with CCIS academic record-keeping and diploma issuance.',
          'Students complete the 30 credits required for OSSD (18 compulsory + 12 optional), the Ontario Secondary School Literacy Test (OSSLT) or equivalent literacy course, and 40 community involvement hours. On completion, CCIS issues the official Ontario Secondary School Diploma.',
          'Canadian universities receive OUAC applications from CCIS students on identical terms to Ontario domestic secondary graduates. The Malaysian residence is no barrier — the diploma is Ontario-issued.',
        ],
      },
      { h: 'Ontario course structure for the Malaysian OSSD candidate',
        ps: [
          'The Ontario 30-credit structure includes compulsory subjects: English (ENG1D through ENG4U — four credits), Mathematics (MPM1D, MPM2D, plus a Grade 11 Mathematics course), Science (SNC1D, SNC2D, plus a Grade 11 science), Canadian History (CHC2D), Canadian Geography (CGC1D), Civics + Careers (CHV2O + GLC2O), and Physical Education (PPL1O).',
          'Optional credits (12 required) typically include additional Mathematics (MHF4U Advanced Functions, MCV4U Calculus & Vectors, MDM4U Data Management), Sciences (SBI4U Biology, SCH4U Chemistry, SPH4U Physics), and Grade 12 university-preparation English (ENG4U). Chinese Malaysian families often take Mandarin as an International Language credit — recognised by Ontario.',
          'For target-university strategy: University of Toronto Engineering typically requires ENG4U, MHF4U, MCV4U, SCH4U, SPH4U (5 university-preparation credits). McGill Science asks similar. McMaster and Waterloo Engineering ask specifically for MHF4U, MCV4U, and often specific science combinations.',
        ],
      },
      { h: 'Which Canadian universities Smartious OSSD graduates apply to',
        ps: [
          'The Canadian U15 group of research universities: University of Toronto (Ontario), McGill University (Quebec), University of British Columbia (BC), McMaster University (Ontario), University of Waterloo (Ontario), Western University (Ontario), Queen\'s University (Ontario), University of Alberta (Alberta), University of Ottawa (Ontario), Université de Montréal (Quebec), Dalhousie University (Nova Scotia), Université Laval (Quebec), University of Calgary (Alberta), University of Manitoba (Manitoba), University of Saskatchewan (Saskatchewan).',
          'Ontario universities (Toronto, McMaster, Waterloo, Western, Queen\'s, Ottawa) apply exclusively via OUAC. British Columbia, Alberta, Quebec universities have their own application portals but accept OSSD identically to Ontario transcripts.',
          'Beyond the U15, popular Canadian destinations for Malaysian families include Simon Fraser University (BC), University of Victoria (BC), York University (Ontario), and Concordia University (Quebec).',
        ],
      },
      { h: 'Cost comparison: Smartious OSSD vs Sunway International vs relocation to Canada',
        ps: [
          'Sunway International School (physical Ontario curriculum in Subang Jaya, Sunway City) charges approximately RM 45,000 to RM 90,000 per year depending on year group, plus registration and capital fees. Smartious OSSD delivery via CCIS partnership is USD 180 to USD 540 per month (~RM 850 to RM 2,500 per month, ~RM 10,000 to RM 30,000 per year) — a saving of RM 35,000 to RM 60,000+ per year with the same Ontario Secondary School Diploma outcome.',
          'Relocating to Canada for high school (Ontario public secondary or Ontario private schools like Bayview Glen, Havergal, UCC) typically costs CAD 25,000 to CAD 45,000+ per year in tuition alone, plus accommodation, plus separation from Malaysian family. Smartious OSSD keeps the child in Malaysia at Malaysian cost while producing an Ontario Secondary School Diploma equivalent to an Ontario-resident student\'s.',
        ],
      },
    ],
    relatedLinks: [
      { title: 'Cambridge IGCSE online in Malaysia', href: '/online-igcse-malaysia' },
      { title: 'International school alternatives in Malaysia', href: '/international-school-alternative-malaysia' },
      { title: 'Chinese Malaysian families targeting Canadian universities', href: '/chinese-malaysian-canadian-universities' },
      { title: 'Malaysian branch campus universities', href: '/branch-campus-universities-malaysia' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════
  // 3. International school alternatives in Malaysia
  // ═════════════════════════════════════════════════════════════════
  {
    slug: 'international-school-alternative-malaysia',
    title: 'International school alternatives in Malaysia — online homeschool comparison 2026 | Smartious',
    metaDesc: 'Alternative to Alice Smith, Garden International, BSKL, ISKL, M\'KIS, Marlborough College Malaysia at online-delivery fees. Post-September-2025 SST exempt. From USD 180/month. Cambridge, IB, AP, OSSD.',
    country: 'Malaysia',
    hubSlug: '/online-school/malaysia',
    hubTitle: 'Online homeschool Malaysia',
    eyebrow: 'Malaysia · Alternatives to premium schools',
    headline: 'International school alternatives in Malaysia',
    subhead: 'For Malaysian families evaluating the RM 55,000-165,000+/year premium international school investment against online delivery producing identical Cambridge, IB, American, or Ontario OSSD qualifications at a fraction of the fee.',
    keyStats: [
      { number: 'RM 55K-165K+', label: 'Premium KL international school annual fees' },
      { number: '6%',         label: 'SST added to fees above RM 60,000 (since Sept 2025)' },
      { number: 'USD 2,160',  label: 'Smartious annual delivery cost from' },
      { number: 'Identical',  label: 'Cambridge / IB / AP qualifications' },
    ],
    sections: [
      { h: 'The Malaysian premium international school fee landscape',
        ps: [
          'Malaysia\'s premium international school tier includes: Alice Smith School (Malaysia\'s oldest British international school since 1946, Jalan Bellamy + Equine Park campuses, RM 55,000-92,000/year Reception through Sixth Form), Garden International School (Mont Kiara, RM 65,000-130,000/year, established 1951, largest private co-ed in Malaysia at 2,000+ students), British International School of Kuala Lumpur (BSKL Nord Anglia, Sri Hartamas, RM 100,000-165,000+/year), International School of Kuala Lumpur (ISKL, Ampang Hilir purpose-built campus 2018, USD 15,000-30,000/year ~ RM 70,000-140,000, non-profit, IB + AP), Mont\'Kiara International School (M\'KIS, RM 65,000-130,000/year, IB continuum), Marlborough College Malaysia (Iskandar Puteri, RM 100,000-160,000+/year, premium British boarding + day), Cempaka International School.',
          'Fees exclude registration (RM 5,000-20,000), capital development (RM 8,000-25,000+), learning support / English as Additional Language (EAL, RM 10,000-35,000+/year), and external examination fees. Total annual cost at premium tier routinely exceeds RM 120,000 for a Sixth Form student.',
          'Since 1 September 2025, the Royal Malaysian Customs Department applies 6% Service Tax on private and international school annual fees exceeding RM 60,000 per student. A family at BSKL paying RM 130,000/year adds RM 4,200 in SST on the RM 70,000 above the threshold.',
        ],
      },
      { h: 'What the fees actually purchase — and where the value diverges',
        ps: [
          'Premium Malaysian international schools deliver excellent facilities (purpose-built campuses, science and computer labs, sports complexes, arts centres), pastoral programmes (year-round enrichment, house systems, Duke of Edinburgh, Model UN), and university placement infrastructure. For families whose children benefit from full campus life, this justifies the investment.',
          'However, the qualifications students earn — Cambridge IGCSE, Cambridge A-Level, IB Diploma, American AP courses — are examination-board qualifications recognised on the certificate, not the school. A Cambridge IGCSE Mathematics grade A* is recognised identically by University of Malaya, Monash Malaysia, University of Toronto, Cambridge University, and every other university globally, regardless of whether it was earned at Alice Smith, Garden International, an alternative provider, or as a private candidate.',
          'For families whose children thrive in smaller cohorts, want schedule flexibility, need mid-year enrolment, or simply want to preserve capital for university tuition and living costs, the online delivery alternative preserves the qualification outcome without the physical campus overhead cost.',
        ],
      },
      { h: 'Smartious as the alternative — what changes and what doesn\'t',
        ps: [
          'What doesn\'t change: the examination board (Cambridge International Education, Pearson Edexcel, IB Organization, College Board AP, Ontario Ministry of Education for OSSD), the qualifications earned, university recognition, or academic content standards. A Smartious Year 11 IGCSE Chemistry student sits identical papers to an Alice Smith Year 11 IGCSE Chemistry student on the same day at British Council Kuala Lumpur.',
          'What does change: fee (USD 2,160-6,480/year ≈ RM 10,000-30,000/year vs RM 55,000-165,000+/year), delivery mode (live online small groups of 4-6 vs physical campus with class sizes of 18-24), schedule (MYT afternoon 2 PM – 6 PM or evening 6 PM – 9 PM vs fixed 8 AM – 3 PM), enrolment timing (immediate vs waiting lists at premium schools), and cohort (cross-country 14+ nationalities vs Malaysian + expat national mix).',
          'For families where the physical campus is genuinely essential — young children needing structured daycare hours during dual-working-parent schedules, or teenagers whose social development depends on daily peer physical presence — Smartious is not a substitute. For families where the qualification is the primary goal and physical campus is a nice-to-have, Smartious delivers the qualification at 10-20% of the fee.',
        ],
      },
      { h: 'Curriculum flexibility Smartious offers vs single-curriculum schools',
        ps: [
          'Most Malaysian physical international schools deliver one primary curriculum. Alice Smith, Garden International, BSKL, Marlborough College Malaysia are Cambridge-focused (with some IB Diploma at Sixth Form). ISKL, M\'KIS, IGBIS are IB-focused (with limited Cambridge). Only Sunway International School (Subang Jaya) offers Ontario curriculum locally in the Klang Valley.',
          'Smartious offers Cambridge IGCSE + A-Level, Pearson Edexcel (with three exam sessions per year for scheduling flexibility), IB Diploma Programme, American AP courses, and Ontario Secondary School Diploma via Canadian Cross International School partnership — all under one school, with the choice made per student per year based on target universities. A student can move from IGCSE (Years 10-11) to A-Level (Years 12-13) for UK universities, or to IB Diploma for US/Canadian breadth, or to Ontario OSSD for a Canadian domestic-application advantage — without changing schools.',
        ],
      },
      { h: 'Cost calculation examples for Malaysian families',
        ps: [
          'Example 1: Family with two children (Year 8 and Year 11) at BSKL Nord Anglia paying RM 130,000/year each = RM 260,000/year total, plus RM 8,400 SST on fees above RM 60,000 per child = RM 268,400/year. Smartious online delivery: USD 180/month × 2 children × 12 months = USD 4,320/year = ~RM 20,300. Effective annual saving: RM 248,000/year, or RM 1.9M+ across a five-year secondary school period.',
          'Example 2: Family with one child (Year 6) at Alice Smith School Jalan Bellamy paying RM 78,000/year, plus RM 1,080 SST on fees above RM 60,000 = RM 79,080/year. Smartious Online Plus tier: USD 300/month × 12 months = USD 3,600 = ~RM 17,000/year. Effective annual saving: RM 62,000/year.',
          'Example 3: Family with one child (Year 12 IB Diploma) at ISKL paying USD 27,000 ≈ RM 127,000/year. Smartious IB Diploma delivery at USD 540/month Premium tier × 12 months = USD 6,480 = ~RM 30,000/year. Effective annual saving: RM 97,000/year.',
        ],
      },
    ],
    relatedLinks: [
      { title: 'Cambridge IGCSE online in Malaysia', href: '/online-igcse-malaysia' },
      { title: 'Ontario OSSD for Malaysian families', href: '/ossd-malaysia' },
      { title: 'Malaysian branch campus universities', href: '/branch-campus-universities-malaysia' },
      { title: 'Expatriate education in Malaysia', href: '/expat-education-malaysia' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════
  // 4. Malaysian branch campus universities
  // ═════════════════════════════════════════════════════════════════
  {
    slug: 'branch-campus-universities-malaysia',
    title: 'Malaysian branch campus universities — Monash, Nottingham, Heriot-Watt, Newcastle Medicine | Smartious',
    metaDesc: 'Complete guide to Malaysian branch campuses of foreign universities. Monash Malaysia, Nottingham Malaysia, Heriot-Watt Malaysia, Xiamen Malaysia, Newcastle Medicine, Southampton, Reading Malaysia. Cambridge A-Level and IB entry pathways.',
    country: 'Malaysia',
    hubSlug: '/online-school/malaysia',
    hubTitle: 'Online homeschool Malaysia',
    eyebrow: 'Malaysia · University pathways',
    headline: 'Malaysian branch campus universities',
    subhead: 'Malaysia hosts nine foreign university branch campuses awarding the same degrees as their home campuses — at branch-campus fees. Cambridge A-Level and IB Diploma from Smartious feed directly into these pathways.',
    keyStats: [
      { number: '9',        label: 'Foreign university branch campuses in Malaysia' },
      { number: 'UK + AU + CN', label: 'Home countries of parent universities' },
      { number: 'MBBS + IB', label: 'Medical + Engineering degrees available' },
      { number: 'Same',     label: 'Degree awarded as home campus' },
    ],
    sections: [
      { h: 'Why branch campus universities matter for Malaysian families',
        ps: [
          'A Malaysian branch campus of a foreign university awards the identical degree parchment as the home campus — a Monash Malaysia Engineering graduate receives a Monash University Bachelor of Engineering, indistinguishable from a Monash Melbourne graduate\'s degree. The tuition fees, however, are set at Malaysian levels (approximately 30-60% below home-country pricing), and the graduate lives in Malaysia during their degree.',
          'For Malaysian families weighing the cost-benefit of sending a child to Melbourne, Nottingham, Newcastle, Southampton, or Reading for university — international tuition (typically GBP 25,000-40,000/year for UK, AUD 40,000-60,000/year for Australia), accommodation (GBP 12,000-25,000/year), and separation — the branch campus option delivers the same qualification at a fraction of the total cost, with the child staying in Malaysia.',
          'For international families with children in Malaysia (through parental corporate assignment or dual nationality), the branch campus route retains a foreign university qualification without requiring return to the home country for university.',
        ],
      },
      { h: 'The nine Malaysian branch campuses at a glance',
        ps: [
          'Monash University Malaysia (Bandar Sunway, Selangor) — Australian Group of Eight member. Established 1998. Degree awarded: Monash University. Strong across Business, Engineering, IT, Medicine (five-year MBBS), Pharmacy, Science.',
          'University of Nottingham Malaysia (Semenyih, Selangor) — UK Russell Group member. Established 2000, first UK university campus in Malaysia. Degree awarded: University of Nottingham. Strong across Engineering, Computer Science, Business, Biosciences.',
          'Heriot-Watt University Malaysia (Putrajaya) — Established 2014. Degree awarded: Heriot-Watt University Edinburgh. Particularly strong in Engineering, Business, Actuarial Science, Computer Science.',
          'Xiamen University Malaysia (Sepang, Selangor) — Chinese "985 Project" university. Degree awarded: Xiamen University China. Strong across Business, Chinese Studies, Computer Science.',
          'Newcastle University Medicine Malaysia (NUMed, Iskandar Puteri, Johor) — UK Russell Group. Established 2011. Degree awarded: Newcastle University MBBS (Bachelor of Medicine + Bachelor of Surgery). One of the rare foreign-degree MBBS pathways in Malaysia.',
          'University of Southampton Malaysia (Iskandar Puteri, Johor) — UK Russell Group. Established 2012. Degree awarded: University of Southampton. Engineering focus (Mechanical, Electrical, Aeronautics).',
          'University of Reading Malaysia (Iskandar Puteri, Johor) — Established 2016. Degree awarded: University of Reading. Business, Property, Finance strong areas.',
          'Curtin University Malaysia (Miri, Sarawak) — Australian degree awarded. East Malaysia campus, established 1999.',
          'Swinburne University of Technology Sarawak (Kuching, Sarawak) — Australian degree awarded. East Malaysia campus.',
        ],
      },
      { h: 'Entry requirements — how Smartious qualifications feed into these',
        ps: [
          'Direct undergraduate entry to Malaysian branch campuses typically requires Cambridge A-Level with 3 subjects at grades BBB to AAA (depending on programme competitiveness) or IB Diploma with total points 30 to 38+ (again depending on programme). Foundation programme entry (e.g., Monash University Foundation Year / MUFY, Nottingham UNM Foundation, Heriot-Watt Foundation, Taylor\'s Foundation) accepts Cambridge IGCSE with grades A*-C in specified subjects, or completed Grade 11 in equivalent curricula.',
          'For Newcastle Medicine Malaysia specifically: A-Level Biology, Chemistry, Physics at AAA is the standard, with UCAT (UK-standard university clinical aptitude test) required. IB Diploma with 38+ points including Higher Level Sciences also accepted. Interview stage follows shortlisting.',
          'For Monash Malaysia Engineering / Business / Medicine: Monash Foundation Year accepts a wide range of entry qualifications; direct A-Level entry requires ABB to AAA depending on major.',
          'Smartious A-Level Sciences delivery is specifically structured for medical school preparation, including UCAT preparation. Smartious A-Level Mathematics + Further Mathematics + Physics is optimised for engineering university applications.',
        ],
      },
      { h: 'Cost comparison — branch campus vs home campus',
        ps: [
          'Monash Malaysia Engineering degree: approximately RM 45,000-70,000 per year tuition. Monash Melbourne equivalent: AUD 45,000-55,000 per year (~RM 145,000-180,000/year) plus accommodation. Three-year saving from branch campus: RM 250,000-350,000+.',
          'Nottingham Malaysia Business degree: approximately RM 55,000-75,000 per year tuition. Nottingham UK: GBP 25,000-30,000 per year (~RM 130,000-160,000/year) plus accommodation. Three-year saving: RM 220,000-280,000+.',
          'Newcastle Medicine Malaysia MBBS (5 years): approximately RM 100,000-130,000 per year tuition. Newcastle UK MBBS: GBP 45,000+ per year for international students (~RM 235,000+/year), and international students face additional restrictions on medical training placements. Five-year saving: RM 675,000-1M+, plus the child stays in Malaysia during medical training.',
        ],
      },
      { h: 'Iskandar Puteri EduCity — the concentration in South Johor',
        ps: [
          'Iskandar Puteri (formerly Nusajaya, South Johor near the Singapore Causeway) hosts a concentration of foreign university branch campuses in a purpose-built EduCity township: Newcastle University Medicine Malaysia (NUMed), University of Southampton Malaysia, University of Reading Malaysia, plus Marlborough College Malaysia (secondary + Sixth Form). This is Malaysia\'s densest UK-degree-awarding cluster.',
          'For Malaysian families in Johor, the Iskandar Puteri pathway means Cambridge A-Level via Smartious → NUMed or Southampton or Reading in Iskandar Puteri → UK degree earned while remaining in Johor. For families in Kuala Lumpur or Penang, Iskandar Puteri is a domestic move rather than international.',
          'Marlborough College Malaysia (RM 100,000-160,000+/year) provides Sixth Form on the same EduCity township for families that want the physical campus. Smartious online provides the same Cambridge Sixth Form outcome at RM 10,000-30,000/year — the fee difference funds the branch campus university tuition and then some.',
        ],
      },
    ],
    relatedLinks: [
      { title: 'Cambridge IGCSE online in Malaysia', href: '/online-igcse-malaysia' },
      { title: 'Cambridge A-Level online in Malaysia', href: '/online-a-level-malaysia' },
      { title: 'International school alternatives in Malaysia', href: '/international-school-alternative-malaysia' },
      { title: 'Ontario OSSD for Malaysian families', href: '/ossd-malaysia' },
    ],
  },
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'online-a-level-malaysia',
    title: 'Cambridge A-Level online in Malaysia — Sixth Form guide for Malaysian families | Smartious',
    metaDesc: 'Live online Cambridge A-Level for Malaysian families. British Council KL + Penang exam centres, direct entry to Monash Malaysia, Nottingham Malaysia, UK Russell Group, Australian Group of Eight. From USD 180/month.',
    country: 'Malaysia',
    hubSlug: '/online-school/malaysia',
    hubTitle: 'Online homeschool Malaysia',
    eyebrow: 'Malaysia · Cambridge A-Level',
    headline: 'Cambridge A-Level online for Malaysian Sixth Form',
    subhead: 'The Malaysian Sixth Form pathway families use to reach Malaysian branch campuses (Monash, Nottingham, Heriot-Watt), UK Russell Group, Australian Group of Eight, and Singapore universities — delivered live in MYT afternoon hours.',
    keyStats: [
      { number: '3-4',      label: 'A-Level subjects Malaysian universities require' },
      { number: 'RM 600-900', label: 'Private candidate fee per A-Level subject' },
      { number: 'AAA-BBB',  label: 'Typical Russell Group + branch campus offer range' },
      { number: 'USD 180+', label: 'Smartious monthly A-Level delivery' },
    ],
    sections: [
      { h: 'Why Cambridge A-Level is the dominant Malaysian Sixth Form choice',
        ps: [
          'Cambridge A-Level is the dominant Sixth Form qualification among Malaysian families targeting international universities and Malaysian branch campuses. It is accepted by every Malaysian university (University of Malaya, USM, UKM, UPM), every Malaysian branch campus of a foreign university (Monash Malaysia, University of Nottingham Malaysia, Heriot-Watt Malaysia, Xiamen Malaysia, Newcastle Medicine Malaysia, Southampton Malaysia, Reading Malaysia, Curtin Sarawak, Swinburne Sarawak), and by UK Russell Group, Australian Group of Eight, Singapore NUS/NTU, Canadian U15, and US universities via subject-specific credit recognition.',
          'For Malaysian Sixth Form families the natural pathways are: Cambridge IGCSE (Years 10-11) → Cambridge A-Level (Years 12-13) → target university. This route works whether the university destination is Universiti Malaya, Monash Bandar Sunway, Newcastle Medicine in Iskandar Puteri, Oxford, Melbourne, or Toronto.',
          'The A-Level structure — 3 to 4 subjects studied in depth — differs meaningfully from IB Diploma\'s six-subject breadth. Families choosing between the two typically weight A-Level for direct subject specialism (particularly for Medicine, Engineering, and STEM tracks) and IB for holistic breadth and US application competitiveness.',
        ],
      },
      { h: 'Sitting Cambridge A-Level as a private candidate in Malaysia',
        ps: [
          'Malaysia has two British Council examination centres accepting Cambridge private candidates for A-Level: British Council Kuala Lumpur (primary Malaysia centre) and British Council Penang. Cambridge A-Level examinations are hosted in the May/June and October/November series each year, with results issued approximately eight weeks after the last examination paper.',
          'Private candidate fees run approximately RM 600 to RM 900 per subject per series all-in, with late entry adding RM 100 to RM 250 per subject. A student sitting 3 A-Level subjects (typical for Malaysian branch campus + UK Russell Group applications) pays approximately RM 1,800 to RM 2,700 per series. A student sitting 4 A-Level subjects for elite university applications (Cambridge, Imperial, LSE, medical schools) pays approximately RM 2,400 to RM 3,600 per series.',
          'Sabah, Sarawak, and East Coast Malaysian families sit A-Level examinations at British Council KL or Penang — flight or drive required for the examination period. Some Malaysian international schools also accept external candidates for their examination sessions, worth investigating locally in each state.',
          'Smartious handles the private candidate registration logistics for enrolled Malaysian families: securing examination centre slots, submitting entries, coordinating results release, and issuing statements of results for university applications via UCAS, UAC, OUAC, and Common App portals.',
        ],
      },
      { h: 'Recommended A-Level subject combinations for Malaysian university targets',
        ps: [
          'For Newcastle University Medicine Malaysia (NUMed, Iskandar Puteri EduCity) or any medical pathway: Cambridge A-Level Biology, Chemistry, Physics is the standard, typically at grades AAA. UCAT (UK-standard university clinical aptitude test) is required. Some pathways accept alternatives, but Chemistry is universally required.',
          'For Monash University Malaysia (Bandar Sunway) Engineering, Business, or IT: Cambridge A-Level Mathematics, Physics, plus Chemistry or Further Mathematics for Engineering; Mathematics, Economics, Business for Business; Mathematics, Physics, Computer Science for IT. Typical offer: BBB to AAA depending on programme.',
          'For University of Nottingham Malaysia (Semenyih) Engineering, Business, Biosciences: Mathematics + Physics + Chemistry for Engineering, Mathematics + Economics + Business for Business, Biology + Chemistry + Mathematics for Biosciences.',
          'For Heriot-Watt Malaysia (Putrajaya) Engineering, Actuarial Science, Computer Science: Mathematics + Physics + Further Mathematics or Computer Science, or Mathematics + Physics + Chemistry.',
          'For Universiti Malaya (UM) — a range of subject combinations accepted via international admissions or foundation entry. Direct A-Level entry typically requires BBB to ABB depending on faculty.',
          'For UK Russell Group and Oxbridge: subject specificity matters. Oxford Medicine requires Biology, Chemistry, and either Physics or Mathematics at A*A*A. Cambridge Engineering requires Mathematics, Physics, plus Further Mathematics (strongly preferred). LSE Economics requires Mathematics + two facilitating subjects at A*AA.',
        ],
      },
      { h: 'How Smartious delivers Cambridge A-Level in Malaysian time zones',
        ps: [
          'Live online Cambridge A-Level classes are scheduled 2 PM to 6 PM Malaysia Standard Time (MYT, UTC+8) matching Malaysian post-school hours. A 6 PM to 9 PM MYT evening window serves working-parent families and older students. Recorded sessions available 24/7 across TIME Fibre, Unifi (Telekom Malaysia), Maxis Fibre — Kuala Lumpur, Penang, Johor Bahru have strong residential fibre infrastructure; Cyberjaya has gigabit-class MSC Malaysia legacy connectivity.',
          'Class sizes are small (4-6 students Online, smaller Online Plus, 1-on-1 Premium) with subject specialism — a Chemistry teacher teaches only Chemistry, a Mathematics teacher only Mathematics. Teachers are PGCE-qualified with Cambridge International training.',
          'Smartious A-Level Mathematics delivery specifically covers Pure Mathematics 1, 2, 3, Mechanics 1 and 2, Statistics 1 and 2, and Further Mathematics options — the depth required for engineering and medical university applications.',
          'A-Level Sciences delivery includes structured laboratory work simulation via Smartious LMS, practical skill assessment preparation (paper 3 / paper 5 / paper 34-36 depending on syllabus), and comprehensive past-paper practice.',
        ],
      },
      { h: 'Cost comparison: A-Level online vs Malaysian Sixth Form colleges',
        ps: [
          'Malaysian premium Sixth Form colleges charge substantial fees: Kolej Yayasan UEM Sixth Form (part of Alice Smith School), Garden International Sixth Form (RM 95,000-130,000/year), BSKL Sixth Form (RM 120,000-165,000/year), Marlborough College Malaysia Sixth Form (RM 100,000-160,000+/year), Cempaka Sixth Form. Post-September-2025 6% SST applies on fees above RM 60,000/year.',
          'Malaysian A-Level colleges (non-international-school Sixth Form) charge RM 20,000-45,000/year — mid-tier options like Taylor\'s College Subang Jaya, Sunway College, KDU College, INTEC Education College, HELP Academy.',
          'Smartious A-Level delivery is USD 180-540 per month (approximately RM 10,000-30,000 per year), fully exempt from the 6% SST. Effective annual saving vs a premium physical Sixth Form college is RM 65,000-135,000 per year, or RM 10,000-15,000 per year vs a mid-tier college — with identical Cambridge A-Level qualifications and university recognition.',
        ],
      },
      { h: 'A-Level results and Malaysian university application timing',
        ps: [
          'Cambridge A-Level results for the May/June examination series are released in mid-August. October/November series results are released in mid-January. Malaysian branch campus intake cycles typically align with January or September intake; UK universities on UCAS have January (15th) main deadline for autumn entry with earlier deadlines for Oxbridge and Medicine (mid-October).',
          'For Malaysian families targeting September UK Russell Group entry, taking A-Level in May/June of Year 13 works with grades released before UCAS confirmation. For families targeting Malaysian branch campus January intake, October/November A-Level series works with grades in time.',
          'Australian Group of Eight (Melbourne, Sydney, Monash, UNSW, Queensland, Adelaide, Western Australia, ANU) typically accept A-Level for direct undergraduate entry via Semester 1 (February) or Semester 2 (July) intake — with results-based conditional offers accepted.',
        ],
      },
    ],
    relatedLinks: [
      { title: 'Cambridge IGCSE online in Malaysia', href: '/online-igcse-malaysia' },
      { title: 'IB Diploma online in Malaysia', href: '/online-ib-malaysia' },
      { title: 'Malaysian branch campus universities', href: '/branch-campus-universities-malaysia' },
      { title: 'International school alternatives in Malaysia', href: '/international-school-alternative-malaysia' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'online-ib-malaysia',
    title: 'IB Diploma online in Malaysia — International Baccalaureate for Malaysian families | Smartious',
    metaDesc: 'Live online IB Diploma Programme for Malaysian families. Six subjects across three levels, Theory of Knowledge, Extended Essay, CAS. Alternative to ISKL, M\'KIS, IGBIS. From USD 180/month.',
    country: 'Malaysia',
    hubSlug: '/online-school/malaysia',
    hubTitle: 'Online homeschool Malaysia',
    eyebrow: 'Malaysia · IB Diploma Programme',
    headline: 'IB Diploma online for Malaysian families',
    subhead: 'The holistic pathway to US Ivy League, Canadian U15, Singapore NUS/NTU, and IB-preferred UK universities — delivered as live online IB Diploma classes in Malaysia Standard Time.',
    keyStats: [
      { number: '6',        label: 'IB Diploma subjects across three levels' },
      { number: '45',       label: 'Maximum IB Diploma points achievable' },
      { number: 'RM 65,000-140,000', label: 'Annual fees at ISKL, M\'KIS, IGBIS IB Diploma' },
      { number: 'USD 180+', label: 'Smartious IB Diploma monthly delivery' },
    ],
    sections: [
      { h: 'Why some Malaysian families choose IB Diploma over Cambridge A-Level',
        ps: [
          'The International Baccalaureate (IB) Diploma Programme is a two-year Sixth Form curriculum studied in six subjects (across three levels: Higher Level for depth, Standard Level for breadth), plus three "core" components: Theory of Knowledge (TOK), Extended Essay (EE), and Creativity, Activity, Service (CAS). Points are scored out of 45 (7 points per subject + 3 bonus points from TOK + EE).',
          'Malaysian families choose IB over Cambridge A-Level typically for three reasons: (1) preferred pathway for US Common Application competitiveness — top US universities weight IB\'s breadth positively, (2) preferred pathway for Canadian U15 universities beyond OSSD alternative, (3) preferred pathway for holistic education emphasising research (Extended Essay), critical thinking (TOK), and community engagement (CAS) — often driven by family philosophy rather than pure university strategy.',
          'For Malaysian families targeting Singapore NUS or NTU, either A-Level or IB works — both are highly competitive. For UK Oxbridge and Russell Group, both are accepted but A-Level maps more directly to UK university subject expectations. For US Ivy League and top liberal arts, IB is arguably slightly preferred.',
        ],
      },
      { h: 'IB Diploma physical schools in Malaysia',
        ps: [
          'IB Diploma is offered at a limited number of Malaysian international schools: International School of Kuala Lumpur (ISKL, Ampang Hilir) — offers IB Diploma and Advanced Placement (AP), USD 15,000-30,000/year (~RM 70,000-140,000/year); Mont\'Kiara International School (M\'KIS, Mont Kiara) — full IB continuum PYP/MYP/DP, RM 65,000-130,000/year; IGB International School (IGBIS, Sierramas) — full IB continuum, competitive tier; British International School of Kuala Lumpur (BSKL, Nord Anglia) — IB Diploma as sixth form option alongside A-Level; Uplands International School (Batu Ferringhi, Penang) — IB Diploma; Marlborough College Malaysia (Iskandar Puteri, Johor) — IB Diploma as alternative to A-Level Sixth Form.',
          'These are premium-tier fees, and since September 2025 the 6% SST applies on fees above RM 60,000/year. A typical IB Diploma family at ISKL or M\'KIS pays RM 100,000-140,000 in tuition, plus RM 2,400-4,800 in SST, plus registration, capital, and examination fees. Two-year Sixth Form total cost RM 200,000-300,000+.',
          'Smartious IB Diploma delivery at USD 180-540 per month (approximately RM 10,000-30,000 per year) is 80-90% cheaper than premium physical IB schools with identical IB certification. The IB Diploma is awarded by the International Baccalaureate Organisation (IBO) in Geneva — the awarding body, not the school, determines the qualification.',
        ],
      },
      { h: 'How Smartious delivers all six IB Diploma subject groups',
        ps: [
          'IB Diploma requires one subject from each of six groups (with Group 6 substitutable). Smartious delivers all six groups: Group 1 Language and Literature (English, plus mother-tongue options); Group 2 Language Acquisition (French, Spanish, Mandarin, plus others); Group 3 Individuals and Societies (History, Geography, Economics, Business, Psychology, Global Politics); Group 4 Sciences (Biology, Chemistry, Physics, Environmental Systems, Computer Science); Group 5 Mathematics (Analysis and Approaches HL/SL, or Applications and Interpretation HL/SL); Group 6 The Arts (Visual Arts, Music, Theatre) or substituted with a second subject from Groups 3 or 4.',
          'Three subjects are taken at Higher Level (HL — 240 teaching hours each), three at Standard Level (SL — 150 teaching hours each). Typical Malaysian family combinations: for STEM-target students, HL Mathematics AA + HL Chemistry + HL Physics + SL English + SL Economics + SL Mandarin (or Malay); for Business-target students, HL Economics + HL English + HL Mathematics AA + SL Business + SL Chemistry + SL Mandarin.',
          'The three IB core components — Theory of Knowledge (TOK, ~100 hours over two years), the Extended Essay (EE, 4,000 word independent research paper), and Creativity, Activity, Service (CAS, ~150 hours engagement) — are supervised by Smartious IB coordinators as part of Sixth Form delivery.',
        ],
      },
      { h: 'IB examinations and Malaysia',
        ps: [
          'IB Diploma final examinations are hosted at authorised IB World Schools each May and (for a limited subject set) November. Malaysian IB Diploma students sit examinations at authorised centres including ISKL, M\'KIS, IGBIS, BSKL, Uplands, plus other IB World Schools willing to accept external candidates.',
          'Smartious IB Diploma students are registered as private candidates through partner IB World Schools — the arrangement is coordinated by the Smartious Head of Academics. Registration fees, per-subject examination fees, and TOK/EE assessment fees are approximately GBP 2,000-3,000 (~RM 11,000-17,000) for the full two-year IB Diploma cycle including all six subjects.',
          'Results are released in early July (May session) via the IBO candidate portal, in time for UK UCAS autumn confirmation and Northern Hemisphere university intake.',
        ],
      },
      { h: 'Universities and IB Diploma — what Malaysian families need to know',
        ps: [
          'US universities: IB Diploma is highly competitive. Top scores (38-45 points) with HL grades of 6-7 map to Common App applications with the same weighting as top A-Level results. Ivy League typical unconditional offer: 40+ points with 6/7 at all HLs.',
          'Canadian U15 universities: Ontario (via OUAC) accepts IB Diploma with typical offer of 30-38 points depending on programme. McGill, Toronto, UBC, McMaster, Waterloo, Western, Queen\'s all accept. For Chinese Malaysian families targeting Canada, note that Ontario OSSD via CCIS partnership (see the OSSD Malaysia guide) may be a strategically stronger route than IB for OUAC applications.',
          'UK Russell Group: IB Diploma widely accepted. Oxford typical offer: 38-40 points with 6/6/6 at HL. Cambridge: 40-41 with 7/7/6 at HL for competitive subjects. Imperial, UCL, LSE, Warwick, Bristol, Manchester: 34-38 range typical.',
          'Australian Group of Eight: IB Diploma accepted directly. Melbourne, Sydney, ANU, UNSW, Monash, Queensland, Adelaide, Western Australia all accept 30-38 point range depending on programme.',
          'Singapore NUS/NTU: highly competitive. Typical successful applicant IB scores 38+ points with HL grades of 6-7.',
          'Malaysian universities and branch campuses: IB Diploma accepted for direct entry. Monash Malaysia typical offer: 28-35 points. Nottingham Malaysia: similar. Universiti Malaya via international admissions: 28-32 points typical.',
        ],
      },
      { h: 'IB Diploma vs A-Level: choosing for Malaysian families',
        ps: [
          'A-Level suits families targeting: UK Oxbridge and Russell Group where subject depth in Chemistry/Mathematics/Physics matters (Medicine, Engineering); Malaysian branch campus Sixth Form entry with specific subject requirements; Australian Group of Eight direct entry; students who thrive with 3-4 subject depth rather than 6-subject breadth.',
          'IB Diploma suits families targeting: US Common Application where breadth and CAS/EE are valued; Canadian U15 where holistic evaluation is common; Singapore NUS/NTU where breadth signals capability; students who thrive with the additional research (Extended Essay) and philosophical (TOK) components.',
          'Both are respected internationally. Neither is universally "better" — the choice is a function of university destination, family philosophy, and student learning style.',
        ],
      },
    ],
    relatedLinks: [
      { title: 'Cambridge A-Level online in Malaysia', href: '/online-a-level-malaysia' },
      { title: 'Cambridge IGCSE online in Malaysia', href: '/online-igcse-malaysia' },
      { title: 'Ontario OSSD for Malaysian families', href: '/ossd-malaysia' },
      { title: 'Malaysian branch campus universities', href: '/branch-campus-universities-malaysia' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'expat-education-malaysia',
    title: 'Expatriate homeschooling in Malaysia — guide for expat families 2026 | Smartious',
    metaDesc: 'Guide to homeschooling as an expat family in Malaysia. No MOE exemption required for non-citizens. Cambridge IGCSE, A-Level, IB, American AP, Ontario OSSD live online. Mont Kiara, Damansara, Ampang, Iskandar Puteri, Penang, Kota Kinabalu.',
    country: 'Malaysia',
    hubSlug: '/online-school/malaysia',
    hubTitle: 'Online homeschool Malaysia',
    eyebrow: 'Malaysia · Expatriate families',
    headline: 'Expatriate homeschooling in Malaysia',
    subhead: 'The complete guide for British, Australian, Japanese, Korean, US, French, German, Indian, and other expat corporate families in Malaysia — regulatory status, curriculum options, exam logistics, and pathway continuity across rotational assignments.',
    keyStats: [
      { number: 'Unrestricted', label: 'Non-citizen expat homeschool status in Malaysia' },
      { number: 'RM 100,000+', label: 'Typical premium international school annual fee' },
      { number: '6%',           label: 'SST added on international fees above RM 60,000 (Sept 2025)' },
      { number: 'USD 180+',     label: 'Smartious monthly delivery for expat families' },
    ],
    sections: [
      { h: 'Malaysian regulatory framework for expat homeschooling',
        ps: [
          'Malaysia\'s Education Act 1996 Section 135(1) requires Malaysian citizen children aged 6-12 to attend formal primary school unless granted a homeschool exemption by their State Education Department (JPN). Critically, this restriction applies only to Malaysian citizens. Children of non-citizen expatriate families are not bound by Section 135 and may homeschool without MOE exemption.',
          'This makes Malaysia one of the most straightforward homeschooling jurisdictions in Southeast Asia for expat families. Documentation of your home-country curriculum provider — for Smartious students, the enrolment confirmation and Cambridge/IB registration documentation — is sufficient. No JPN application, no state-level bureaucracy.',
          'Pre-primary (under 6) and secondary (12+) homeschooling is fully unrestricted for both Malaysian citizens and non-citizens. So the Malaysian citizen families using Smartious in the Cambridge IGCSE (Years 10-11), A-Level (Years 12-13), and IB Diploma (final two years) window also face no regulatory friction.',
        ],
      },
      { h: 'Why expat families in Malaysia choose online homeschool over local international schools',
        ps: [
          'Malaysian premium international schools are among the highest-priced in Southeast Asia: Alice Smith School (RM 55,000-92,000/year), Garden International (RM 65,000-130,000/year), British International School of Kuala Lumpur (BSKL Nord Anglia, RM 100,000-165,000+/year), International School of Kuala Lumpur (ISKL, USD 15,000-30,000/year), Mont\'Kiara International School (RM 65,000-130,000/year), Marlborough College Malaysia (RM 100,000-160,000+/year). Post-September-2025 6% SST adds RM 1,800-6,300+ to annual bills above RM 60,000.',
          'For expat families on typical corporate packages, education allowance often does not fully cover premium tier fees. British, Australian, US, and Japanese corporate expat allowances typically cap at USD 20,000-40,000/year per child — enough for mid-tier schools but not premium tier.',
          'Additionally, Klang Valley traffic reality (45-90 minute commutes from Mont Kiara / Damansara to Alice Smith Bandar Baru Bangi campus, ISKL Ampang Hilir, or M\'KIS Mont Kiara during rush hour) locks family logistics around school location. Smartious online delivery eliminates the commute entirely — the child studies from home in Mont Kiara, Damansara, Bangsar, Ampang, Sri Hartamas, KLCC, or wherever the corporate housing allocation places the family.',
          'Rotational assignment cycles (typical 3-5 years for corporate expats) mean mid-assignment moves. Smartious enrolment is portable — the family that moves from Penang Bayan Lepas Intel to Portland Oregon Intel next quarter continues the same Cambridge IGCSE cohort without re-enrolment friction.',
        ],
      },
      { h: 'Where Smartious expat families concentrate in Malaysia',
        ps: [
          'Mont Kiara (Kuala Lumpur) is the primary Klang Valley expat concentration, adjacent to Garden International School on Jalan Kiara, Mont\'Kiara International School, French School Kuala Lumpur (Lycée Français), Australian International School Malaysia. British, Australian, French, German, Japanese, Korean, and mixed-nationality Malaysian professional families concentrated in Mont Kiara high-rise residential complexes.',
          'Damansara Heights (Bukit Damansara) hosts premium residential adjacent to Alice Smith Jalan Bellamy campus. Bangsar (Bangsar Baru, Lucky Garden, Jalan Ara) hosts urban expat and Malaysian professional families. Sri Hartamas hosts BSKL Nord Anglia catchment. Ampang and Ampang Hilir host diplomatic families (multiple embassies) and the International School of Kuala Lumpur.',
          'Iskandar Puteri (Johor) hosts Marlborough College Malaysia, Raffles American School, Newcastle Medicine Malaysia (NUMed), Southampton Malaysia, Reading Malaysia branch campuses. Cross-border Singapore commuter expat families (Singapore working residents living in JB for cost efficiency) also concentrate here.',
          'Penang Tanjung Bungah and Tanjung Tokong host semiconductor expat families — Intel Malaysia (established 1972 as Intel\'s first offshore facility), AMD Penang, Bosch Penang, Osram, Broadcom. Bayan Lepas Free Trade Zone is the daytime workplace.',
          'Cyberjaya hosts tech corporate expat families — Microsoft, IBM, HP, DXC Technology, Shell IT Malaysia. Kota Kinabalu (Sabah) has smaller expat concentrations from offshore oil-and-gas and palm oil corporate operations.',
        ],
      },
      { h: 'Curriculum choice by expat nationality — what Smartious families typically choose',
        ps: [
          'British expat families (BAT, Shell, HSBC Malaysia, Standard Chartered, PwC/KPMG/EY/Deloitte partners): Cambridge IGCSE + A-Level or IB Diploma. Both track back to UK Russell Group and Oxbridge. A-Level is the more familiar pathway for UK families; IB is chosen for more mobile families expecting multiple international moves.',
          'Australian expat families (BHP, Rio Tinto, Woodside): Cambridge A-Level or IB Diploma both work for Group of Eight Australian university direct entry. Some families use Australian Curriculum via home-state distance education (e.g., NSW Distance Ed, Queensland Distance Ed) as a complementary alternative.',
          'Japanese expat families (Panasonic, Sony, Mitsubishi Corporation, Toyota Tsusho, MUFG, Mizuho): situation varies. Some target return to Japan and use Japanese Curriculum (kaigai-hojukou correspondence or Japanese School of Kuala Lumpur in Saujana). Others target permanent international pathways and use Cambridge or IB.',
          'Korean expat families (Samsung, LG, POSCO): Cambridge IGCSE + A-Level or IB Diploma. Return to Korea options via kaigai-hojukou-style Korean provisions less common than for Japanese families.',
          'US expat families (Google Malaysia, Microsoft Malaysia, US Embassy diplomatic): American Curriculum with AP is the most familiar option, with SAT/ACT preparation integrated. Some choose IB Diploma for the US Ivy League track.',
          'French expat families (Air Liquide, L\'Oreal, Schneider Electric): often prioritise the French School Kuala Lumpur locally. For families wanting international rather than French system, IB Diploma is the common choice.',
          'German expat families (Siemens, BASF, Bosch, Mercedes-Benz Malaysia): situation varies. German School Kuala Lumpur is one option. Cambridge or IB for international families targeting non-German university destinations.',
          'Indian expat families (TCS, Infosys, plus Malaysian Indian professional families): Cambridge IGCSE + A-Level is dominant, with UK, Australian, or US universities as typical destinations.',
        ],
      },
      { h: 'Time zone reality for expat family delivery',
        ps: [
          'Malaysia Standard Time (MYT, UTC+8) is a genuinely convenient time zone for cross-Asian family coordination. Same time zone as Singapore, Hong Kong, Beijing, Perth. One hour ahead of Thailand and Vietnam (UTC+7), one hour behind Japan and Korea (UTC+9). Five hours ahead of Nairobi (EAT UTC+3), where the majority of Smartious teaching is delivered from.',
          'Live classes are scheduled 2 PM to 6 PM MYT matching Malaysian post-school hours and coordinating with parents returning from Klang Valley corporate workplaces. Evening 6 PM to 9 PM MYT slot serves families where both parents work full-time and want family-time protected in the late afternoon.',
          'For families expecting eventual return to home time zones (UK, US, Australia, Japan, Korea), Smartious cohort recorded sessions provide continuity through the transition — the same teachers, curriculum, and cohort continue whether the family is in Mont Kiara, Tokyo, London, or San Francisco.',
        ],
      },
      { h: 'Practical logistics — what expat families should know',
        ps: [
          'Enrolment: Smartious admissions process starts with a diagnostic assessment. Non-citizen expat families provide passport/visa documentation, current school transcripts (if any), and target university destinations to help admissions match the right curriculum. No MOE or JPN application required.',
          'Payment: fees in USD (via Paystack international payments accepting card and bank transfer). No MYR/RM conversion friction. Enrolment fees credit forward on family relocation.',
          'Cambridge examinations: private candidate registration through British Council Kuala Lumpur or British Council Penang, handled by Smartious. Fees per subject approximately RM 600-900 (~USD 130-190). Some expat families may find it more convenient to sit examinations at other British Council locations during scheduled home leave — Smartious can coordinate.',
          'Universities: Smartious admissions guidance supports UCAS (UK), Common Application (US), OUAC (Ontario Canada), UAC (Australia), plus Malaysian branch campus applications. For expat families expecting to return home before university, standard home-country application pathways continue seamlessly.',
        ],
      },
    ],
    relatedLinks: [
      { title: 'Cambridge IGCSE online in Malaysia', href: '/online-igcse-malaysia' },
      { title: 'Cambridge A-Level online in Malaysia', href: '/online-a-level-malaysia' },
      { title: 'International school alternatives in Malaysia', href: '/international-school-alternative-malaysia' },
      { title: 'IB Diploma online in Malaysia', href: '/online-ib-malaysia' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'chinese-malaysian-canadian-universities',
    title: 'Chinese Malaysian families targeting Canadian universities — Ontario OSSD pathway | Smartious',
    metaDesc: 'Chinese Malaysian family guide to Canadian U15 universities via Ontario OSSD. Toronto, McGill, UBC, McMaster, Waterloo, Western, Queen\'s. Apply as Ontario secondary graduate via OUAC. Smartious CCIS partnership.',
    country: 'Malaysia',
    hubSlug: '/online-school/malaysia',
    hubTitle: 'Online homeschool Malaysia',
    eyebrow: 'Malaysia · Canadian universities',
    headline: 'The Canadian university pathway for Chinese Malaysian families',
    subhead: 'Why Chinese Malaysian families concentrate on Canadian U15 universities, and how the Ontario OSSD pathway via the Smartious CCIS partnership materially strengthens applications.',
    keyStats: [
      { number: '~23%',    label: 'Chinese Malaysian share of Malaysian population' },
      { number: '15',      label: 'U15 Canadian research universities (target set)' },
      { number: '1',       label: 'Local Ontario curriculum school in Malaysia (Sunway International, Subang Jaya)' },
      { number: 'OUAC',    label: 'Ontario Universities Application Centre — the target application portal' },
    ],
    sections: [
      { h: 'Why Chinese Malaysian families target Canadian universities',
        ps: [
          'Chinese Malaysian families (approximately 23% of Malaysia\'s population, disproportionately represented in international school enrolment) increasingly target Canadian U15 universities — the group of 15 Canadian research-intensive universities including University of Toronto, McGill, University of British Columbia (UBC), McMaster, University of Waterloo, Western, Queen\'s, University of Alberta, University of Calgary, University of Ottawa, Université de Montréal, Université Laval, University of Saskatchewan, University of Manitoba, and Dalhousie.',
          'The reasons are structural. Canada offers permanent residency pathways for international students post-graduation (particularly through the Post-Graduation Work Permit and Canadian Experience Class), addressing the family\'s long-term security consideration. Canadian universities are internationally respected — Toronto, McGill, and UBC consistently rank in global top-30. Fees for international students are meaningful (approximately CAD 40,000-65,000/year at U15 undergraduate) but lower than US Ivy League. Canadian society is broadly welcoming of skilled migrants.',
          'For Chinese Malaysian families, Canada also has the specific advantage of established Chinese-Canadian community networks in Toronto (Markham, Richmond Hill, Scarborough), Vancouver (Richmond, Burnaby), and Montreal — supporting the family transition.',
          'Australian Group of Eight (Melbourne, Sydney, Monash Melbourne, UNSW, Queensland) is a competing target, but Canada\'s post-graduation permanent residency pathway is generally cleaner for Malaysian families thinking long-term.',
        ],
      },
      { h: 'The Ontario OSSD advantage vs applying as international student with A-Level or IB',
        ps: [
          'Canadian universities accept applications through provincial application centres — Ontario universities via OUAC (Ontario Universities Application Centre), British Columbia universities directly, Quebec universities via their own portals, others directly.',
          'For Ontario universities (which include Toronto, McMaster, Western, Queen\'s, Waterloo, Ottawa — 6 of the 15 U15 universities), applying as an Ontario Secondary School Diploma (OSSD) holder is a materially different application experience than applying as an international student. OSSD applicants apply via OUAC as Ontario secondary graduates, evaluated by Ontario Grade 12 course results (U-level courses: ENG4U, MHF4U, SCH4U, MCV4U, MDM4U, SBI4U, SPH4U, etc.), and evaluated within the Ontario secondary graduate application pool.',
          'International students applying with Cambridge A-Level or IB Diploma apply through the same OUAC portal but are evaluated within the international student pool — a competitive but separate stream with generally higher grade thresholds and additional documentation requirements. Additionally, English-language proficiency documentation (IELTS or TOEFL) is typically required for international students even from Malaysian schools that use English medium.',
          'OSSD holders skip the international student pool and skip the English-proficiency documentation requirement (Ontario secondary graduates are presumed English-proficient given the U-level English course requirement).',
        ],
      },
      { h: 'How the Smartious CCIS partnership works',
        ps: [
          'Canadian Cross International School (CCIS) is an Ontario-inspected private school authorised to award the Ontario Secondary School Diploma. Through the Smartious partnership, Malaysian students enrol concurrently with CCIS and complete the OSSD requirements: 30 credits (18 compulsory, 12 elective), the Ontario Secondary School Literacy Test (OSSLT) or Ontario Secondary School Literacy Course (OSSLC), and 40 hours of community involvement.',
          'The 30 credits typically break down as: 4 English (ENG1D, ENG2D, ENG3U, ENG4U), 3 Mathematics (MPM1D, MPM2D, MCR3U + one Grade 12 option: MHF4U, MCV4U, MDM4U), 2 Science (SNC1D, SNC2D + Grade 11/12 options), plus History, Geography, French/Second Language, Physical Education, Arts, Careers, Civics, plus 12 electives.',
          'Students earn both Ontario course credits AND their Cambridge IGCSE / A-Level or IB Diploma qualifications simultaneously — Smartious delivery is structured so overlapping content in Mathematics, Sciences, English efficiently satisfies both credential requirements.',
          'On completion, CCIS issues the official Ontario Secondary School Diploma. Canadian university applications proceed via OUAC as Ontario secondary graduates.',
        ],
      },
      { h: 'Beyond OUAC — Canadian universities outside Ontario',
        ps: [
          'The Ontario OSSD pathway is specifically advantageous for Ontario universities (Toronto, McMaster, Western, Queen\'s, Waterloo, Ottawa). For other Canadian universities — UBC, McGill, Alberta, Calgary, Dalhousie, Montreal, Laval — OSSD holders can apply directly, and Ontario secondary graduation is widely recognised across Canada as equivalent to that province\'s secondary graduation.',
          'For McGill (Quebec) specifically, applying with OSSD requires 90% top-6 U-level courses for competitive programmes. For UBC (British Columbia), OSSD holders are evaluated within their standard admission pool for out-of-province Canadian applicants.',
          'For Chinese Malaysian families weighing the target university carefully: Toronto (top Canadian university, competitive), McGill (French-Canadian bilingual advantage, competitive), UBC (Vancouver, Chinese-Canadian community, competitive), McMaster (health sciences strength), Waterloo (engineering + computer science strength), Western (business strength), Queen\'s (medicine strength).',
        ],
      },
      { h: 'Comparison with other Chinese Malaysian pathways',
        ps: [
          'Malaysian branch campuses of Australian universities: Monash Malaysia (Bandar Sunway) and Curtin/Swinburne in Sarawak award Australian degrees at Malaysian branch fees. This is competitive with the Canadian pathway for families prioritising cost and geographic proximity — approximately RM 45,000-70,000 per year at Monash Malaysia vs approximately CAD 40,000-65,000 at Canadian U15 (approximately RM 140,000-230,000 including accommodation).',
          'Australian direct entry (going to Melbourne or Sydney rather than Monash Malaysia): approximately AUD 40,000-55,000 tuition + AUD 25,000+ accommodation = approximately RM 200,000-260,000/year total. Competitive with Canada but without Canada\'s post-graduation permanent residency pathway.',
          'US Ivy League + top liberal arts: approximately USD 60,000-90,000 tuition per year (approximately RM 280,000-425,000). Significantly more expensive; more competitive admissions. Ivy League Chinese Malaysian applicants typically use SAT + AP portfolio rather than Cambridge or IB.',
          'Singapore NUS/NTU: significantly cheaper (SGD 20,000-30,000 per year for Singapore residents; higher for international). Highly competitive Singapore university admissions.',
          'UK Russell Group: GBP 25,000-35,000 tuition + GBP 12,000+ accommodation = approximately RM 210,000-260,000/year total. Similar to Canadian pathway cost. Post-graduation UK Graduate Route visa lasts 2 years (3 for PhD) then requires transitioning to skilled worker visa. Less streamlined than Canadian post-graduation permanent residency route.',
        ],
      },
      { h: 'Practical implementation for Chinese Malaysian families',
        ps: [
          'Timing: OSSD requires typically 3-4 years of secondary study. Students starting at Year 9 (Grade 9) have optimal time. Students starting at Year 10 or Year 11 can compress OSSD into 2-3 years using summer credit acceleration and Prior Learning Assessment and Recognition (PLAR).',
          'Concurrent enrolment: Chinese Malaysian Smartious families typically maintain Cambridge IGCSE + A-Level as the primary international qualification (universally recognised) plus Ontario OSSD as the strategic Canadian application credential. Both credentials are earned; the Cambridge track provides fallback UK / Australian / Singapore university options.',
          'Language requirements: Ontario OSSD requires ENG4U (Grade 12 U-level English). Smartious delivery includes this course; students do not need separate English tutoring provided literacy foundation is present.',
          'Cost: Ontario OSSD via CCIS through Smartious partnership adds approximately USD 3,000-5,000 per year on top of Smartious base tuition (USD 2,160-6,480/year). Total annual cost approximately USD 5,000-11,000 — a small fraction of Canadian international student tuition savings if the OSSD pathway improves university admission chances or shifts fee category.',
          'University fees: OSSD graduates admitted to Ontario universities pay Ontario domestic fees only if they are also permanent residents or Canadian citizens — international students without residency status still pay international fees. The OSSD advantage is admission competitiveness, not automatic fee reduction. Chinese Malaysian families targeting fee reduction typically pair OSSD with Canadian permanent residency application via family sponsorship or Skilled Worker Program routes.',
        ],
      },
    ],
    relatedLinks: [
      { title: 'Ontario OSSD for Malaysian families', href: '/ossd-malaysia' },
      { title: 'Cambridge A-Level online in Malaysia', href: '/online-a-level-malaysia' },
      { title: 'IB Diploma online in Malaysia', href: '/online-ib-malaysia' },
      { title: 'Malaysian branch campus universities', href: '/branch-campus-universities-malaysia' },
    ],
  },
]

// Lookup helper: get an article by slug
export function findTopicalArticle(slug) {
  const cleanSlug = slug.replace(/^\//, '')
  return TOPICAL_ARTICLES.find(a => a.slug === cleanSlug)
}

// Return all article slugs (for sitemap + prerender)
export const TOPICAL_ARTICLE_SLUGS = TOPICAL_ARTICLES.map(a => a.slug)
