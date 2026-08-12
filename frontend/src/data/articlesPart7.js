/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════
// ARTICLES PART 7 — CONTINENTAL PILLAR ARTICLES
//
// These four articles exist for two reasons at once:
// 1. They are genuinely the most useful things on the site. Nobody
//    else has compared home-education law, timezones and examination
//    access across ninety-nine countries, because nobody else has
//    written ninety-nine country pages first.
// 2. They carry the internal linking. Each uses the `countryLinks`
//    field, which renders as REAL <a href="/online-school/..."> tags
//    in LandingPage.jsx — crawlable, followable, and present in the
//    prerendered static HTML. Between them these four pages create
//    108 internal links into country hubs that were previously one
//    hop from the homepage and zero hops from anything related.
//
// SCHEMA NOTE — new optional fields used only here:
//   countryLinks:        [{ name, slug, note }]  → the link grid
//   countryLinksHeading: string (optional)
//   countryLinksIntro:   string (optional)
// All three are ignored by every other article. Backward compatible.
//
// EDITING RULE: if a new country is built, add it to the relevant
// pillar's countryLinks array in the same session. A country hub with
// no pillar link is a leaf page, which is the problem these solve.
// ═══════════════════════════════════════════════════════════════════

export const ARTICLES_PART_7 = {

  // ═══════════════ AFRICA ═══════════════
  'best-online-virtual-homeschool-africa': {
    cat:'online-school', country:'', featured:true,
    img:'linear-gradient(135deg,#0A1020,#8B1A2E)', splash:'/blog/homeschool-africa.jpg', splashAlt:'A student in Africa working through a live online lesson at home',
    t:'Online, Virtual and Homeschool Education in Africa: A Country-by-Country Guide',
    date:'August 2026 \u00b7 12 min read',
    author:'Alfred Ouko', role:'Founder',
    metaTitle:'Best Online & Virtual School in Africa 2026 | 20-Country Homeschool Guide \u2014 Smartious',
    metaDesc:'Home-education law, examination access and timezones compared across twenty African countries \u2014 from Kenya and Nigeria to Morocco, Ghana, South Africa and the Copperbelt. Written from Nairobi.',
    intro:'We teach from Nairobi, so this is the guide I have the least excuse for getting wrong. Africa is not one education market and the differences between its countries are larger than most international providers acknowledge \u2014 South Africa regulates home education by statute, Kenya runs a curriculum being actively reformed, and several countries in between have no framework at all. This guide sets out what actually differs, and links to every African country we teach.',
    sections:[
      {h:'Four different legal shapes, not one',p:'The single most useful thing to understand about African home-education law is that it does not move in one direction. South Africa regulates it explicitly and has done for years, with registration through provincial education departments. Kenya, Ghana and Nigeria administer compulsory education through ministries whose position on parental home education is either unstated or unsettled, which is a different situation entirely from prohibition. Several countries we serve have no published framework we could verify at all. And in every case the practical answer for a family is the same: put the question to your own ministry in writing before you build a school year around it, because an absence of clear regulation is an absence of protection rather than a permission.'},
      {h:'Where Cambridge is already the national system',p:'Two African markets in our coverage do something most people outside them do not realise: they use Cambridge qualifications as the national secondary route rather than as a foreign alternative. Mauritius is the clearest case, with the School Certificate and Higher School Certificate built on Cambridge examinations. That changes the entire pitch \u2014 in those markets we are not introducing a curriculum, we are supplying subject specialists for the sets a single school timetable cannot fill. Elsewhere on the continent, Cambridge and Pearson Edexcel sit alongside strong national systems that families choose between deliberately, and both routes have their own logic.'},
      {h:'The timezone advantage nobody else has',p:'This is the one structural advantage of teaching from Nairobi and it is worth stating plainly. Kenya, Tanzania, Uganda, Somalia and Ethiopia sit on or within an hour of our clock. Southern Africa \u2014 South Africa, Zimbabwe, Zambia, Botswana, Namibia \u2014 runs one hour behind us. West Africa is two to three hours behind, and North Africa one to two. Across the whole continent the widest gap we deal with is three hours, which means after-school teaching works everywhere in Africa. A UK or American provider serving the same families is working across five to eight hours and offering recordings where we offer a live class at four in the afternoon.'},
      {h:'The extractive belt, which is one market across six countries',p:'Something we did not expect when we started building these pages: the mining and energy families across Zambia\u2019s Copperbelt, the DRC\u2019s Katanga, Botswana\u2019s diamond towns, Namibia\u2019s uranium coast, Ghana\u2019s Takoradi and Angola\u2019s Cabinda want almost exactly the same thing. Cambridge A-Level Chemistry, Physics, Mathematics and Geography, taught by a specialist, portable to the next posting. They sit in the same live classes as our families in Antofagasta, Potos\u00ed and Basra, because metallurgy and petroleum engineering are the same subjects everywhere. If you are in that sector, the country page matters less than the subject spine.'},
      {h:'Examination access, which is the real constraint outside capitals',p:'Across most of Africa the binding practical problem is not curriculum and not law \u2014 it is where a student sits the paper. Cambridge and Edexcel provision concentrates in capitals and a handful of second cities, so a family in Kitwe, Takoradi, Bulawayo or Ouarzazate is planning travel into every examination window. We raise that question at enrolment rather than in the term before a series, and it is the thing most likely to catch out a family who has planned everything else well. Ask any provider you are considering how they handle it, and be suspicious of a vague answer.'},
      {h:'What we would tell an African family choosing a provider',p:'Three questions worth asking anyone, including us. First: what exactly does the law in my country say, and can you show me the instrument rather than a summary? Second: where will my child physically sit the examination, and have you confirmed capacity for the specific subjects I want? Third: is the teaching live, and how many students are in the class? Those three answers separate a genuine school from a curriculum package with a login, and the second one is where most providers become evasive.'},
    ],
    countryLinksHeading:'Every African country we teach',
    countryLinksIntro:'Twenty countries, each with a dedicated hub covering the legal position, the cities we reach, examination access and the local school market. The one-line notes below are the thing that most distinguishes each market.',
    countryLinks:[
      {name:'Kenya', slug:'kenya', note:'Our home market. CBC reform, a deep international sector, and no timezone gap at all.'},
      {name:'Nigeria', slug:'nigeria', note:'The continent\u2019s largest market. Lagos, Abuja and Port Harcourt, with WAEC alongside Cambridge.'},
      {name:'South Africa', slug:'south-africa', note:'Home education regulated by statute, with registration through provincial departments \u2014 the clearest framework in Africa.'},
      {name:'Ghana', slug:'ghana', note:'Accra and the Takoradi energy corridor, with WAEC and Cambridge running in parallel.'},
      {name:'Egypt', slug:'egypt', note:'A very large private sector, with Cairo and Alexandria running IGCSE at scale.'},
      {name:'Morocco', slug:'morocco', note:'A strong French-system tradition, with Casablanca, Rabat and Tangier.'},
      {name:'Tunisia', slug:'tunisia', note:'French-medium schooling and a Mediterranean professional class.'},
      {name:'Algeria', slug:'algeria', note:'Hassi Messaoud and the hydrocarbon south, with an internationally recruited workforce.'},
      {name:'Ethiopia', slug:'ethiopia', note:'Addis Ababa\u2019s diplomatic and African Union community. No timezone gap.'},
      {name:'Tanzania', slug:'tanzania', note:'Dar es Salaam and Arusha, on exactly our clock.'},
      {name:'Uganda', slug:'uganda', note:'Kampala and the lake region, on exactly our clock.'},
      {name:'Rwanda', slug:'rwanda', note:'Kigali\u2019s fast-growing professional and technology sector.'},
      {name:'Somalia', slug:'somalia', note:'Mogadishu, Hargeisa and a substantial diaspora-connected population.'},
      {name:'Zambia', slug:'zambia', note:'The Copperbelt. Mining engineering families and a portable subject spine.'},
      {name:'DR Congo', slug:'drc', note:'Kinshasa and the Katanga mining belt at Kolwezi and Lubumbashi.'},
      {name:'Zimbabwe', slug:'zimbabwe', note:'A strong academic tradition, with Harare and Bulawayo.'},
      {name:'Botswana', slug:'botswana', note:'Gaborone and the diamond towns \u2014 Jwaneng, Orapa, Selebi-Phikwe.'},
      {name:'Namibia', slug:'namibia', note:'Windhoek, Walvis Bay and the uranium coast at R\u00f6ssing.'},
      {name:'Angola', slug:'angola', note:'Luanda and Cabinda, with Portuguese kept as an examined subject.'},
      {name:'Mauritius', slug:'mauritius', note:'Cambridge is the national route here \u2014 we supply specialists, not a curriculum.'},
    ],
    faqs:[
      {q:'Which African country has the clearest home-education law?',a:'South Africa, which regulates it by statute with registration through provincial education departments. Most other countries in our coverage either do not address parental home education explicitly or we could not verify a position \u2014 and we say which is which on each country page rather than generalising.'},
      {q:'Does the timezone really matter?',a:'More than families expect. Teaching from Nairobi, the widest gap anywhere in Africa is about three hours, so a live after-school class works across the whole continent. A UK or US provider serving the same family is working across five to eight hours and usually offering recordings instead.'},
      {q:'We are in mining or energy and may move country \u2014 does the schooling follow?',a:'Yes, and it is the most common reason our extractive-sector families enrol. The curriculum, teachers and examination board continue unchanged to the next posting, with examinations sat at authorised centres wherever the family lands.'},
      {q:'Where will my child sit examinations?',a:'At authorised Cambridge or Edexcel provision, which across most of Africa concentrates in capitals and a few second cities. We confirm capacity per family per session and plan travel into each window \u2014 and we raise it at enrolment rather than late, because outside capitals it is the hardest practical problem.'},
    ],
    conclusion:'Twenty countries, four different legal shapes, one continent where the clock finally works in a family\u2019s favour. Pick your country above for the detail that actually applies to you, or book an assessment for your child.',
  },

  // ═══════════════ ASIA AND THE PACIFIC ═══════════════
  'best-online-virtual-homeschool-asia': {
    cat:'online-school', country:'', featured:true,
    img:'linear-gradient(135deg,#06121A,#8B1A2E)', splash:'/blog/homeschool-asia.jpg', splashAlt:'A student in Asia joining a live online class from home',
    t:'Online, Virtual and Homeschool Education in Asia and the Pacific: A Country-by-Country Guide',
    date:'August 2026 \u00b7 13 min read',
    author:'Alfred Ouko', role:'Founder',
    metaTitle:'Best Online & Virtual School in Asia 2026 | 28-Country Homeschool Guide \u2014 Smartious',
    metaDesc:'Home-education law, examination access and timezones compared across twenty-eight countries in Asia and the Pacific \u2014 from the Gulf and the Levant to South Asia, Southeast Asia and Australasia.',
    intro:'Asia contains the widest range of education frameworks we have written about anywhere, and lumping them together does families a disservice. One country in this region runs Cambridge as its national curriculum. Another grants annual home-education permits and approves most of them. A third bans foreign teachers based outside the country from teaching its students at all. This guide sets out those differences honestly \u2014 including the one market where we have narrowed our own offer rather than widened it.',
    sections:[
      {h:'The regulatory range, from freest to strictest',p:'At one end sits Israel, which permits home education by annual Ministry permit and in practice approves the great majority of applications, despite a formal directive that reads restrictively. In the middle sit a great many countries \u2014 Jordan, Iraq, Lebanon, Bangladesh, Nepal, Myanmar, the Maldives \u2014 where we could not verify a published position on parental home education and say so rather than guessing. At the far end sits mainland China, where the 2021 Double Reduction policy bans for-profit tutoring in academic subjects for compulsory-education students and places a strict ban on foreign teachers physically based outside China teaching students in China. We do not enrol compulsory-education-age mainland residents for subject teaching, and our China pages open with that rather than bury it.'},
      {h:'The best timezone relationships we have anywhere',p:'This surprised us. Jordan and Iraq both run UTC+3 year-round \u2014 exactly our teaching clock, with no offset at all and no seasonal drift. Israel is one hour behind us in winter and exactly level in summer; Cyprus and Lebanon the same. Further east the gap opens but stays workable and, crucially, runs in the favourable direction: Bangladesh at three hours ahead, Nepal at two hours forty-five, the Maldives at two, Myanmar at three and a half, and Hong Kong at five. In every one of those, an after-school or evening class in the student\u2019s local time lands squarely inside our teaching day. Across most of Latin America an after-school arrangement is impossible from our side and we say so plainly. Across Asia it is the natural configuration.'},
      {h:'Where Cambridge is the national route, not an alternative',p:'The Maldives is the standout and it inverted our entire pitch there. IGCSE was introduced in 2002 for grade 10 and A-Level for grade 12 to qualify students for the diploma of lower and upper secondary education, and the secondary curriculum is designed around the Edexcel examinations. Cambridge is not foreign in the Maldives \u2014 it is the certification route, and any provider marketing it as an exciting international alternative has not understood the country. Bangladesh is a softer version of the same thing: the English-medium sector has run O-Levels and A-Levels for decades and the qualifications are thoroughly understood. In both, our role is teaching capacity rather than curriculum.'},
      {h:'The geography problem, which is sharper here than anywhere',p:'Three markets in this region have a distribution problem rather than an education problem. The Maldives spreads a population across around two hundred inhabited islands, where an island of a few thousand people cannot house a Further Mathematics specialist at any budget. Nepal concentrates almost its entire A-Level sector inside the Kathmandu valley, so a family in Pokhara or Biratnagar choosing that route at grade 11 has traditionally meant sending a sixteen-year-old away and paying for a second household. Hong Kong has outstanding schools and waiting lists that mean a family arriving in October frequently has nowhere to put a child at all. None of those is fixed by a better curriculum. All three are fixed by a live class of four to six students drawn across cities and countries.'},
      {h:'The Gulf, which is its own market',p:'The UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain share a pattern worth naming: very large expatriate populations, deep international school sectors, high fees, and families whose next posting may be another country entirely. Portability matters more here than almost anywhere \u2014 a child who changes school system with each move pays in curriculum alignment and sometimes a repeated year, while a child on one live pathway pays nothing because only the address changes. Gulf universities, many of them branch campuses of British and American institutions, read Cambridge A-Levels and the IB directly.'},
      {h:'What we would tell an Asian family choosing a provider',p:'The same three questions we would put anywhere, plus one specific to this region. What does the law in my country actually say, with the instrument rather than a summary? Where will my child sit the paper, and is that subject open to private candidates \u2014 which in the Maldives genuinely varies by syllabus? Is the teaching live, and how large is the class? And the regional one: if you are in mainland China, ask any provider which part of the Double Reduction policy they are relying on. If they cannot answer, that tells you something.'},
    ],
    countryLinksHeading:'Every country we teach across Asia and the Pacific',
    countryLinksIntro:'Twenty-eight countries and territories, each with a dedicated hub covering the legal position, the cities we reach, examination access and the local school market. The note against each is what most distinguishes it.',
    countryLinks:[
      {name:'United Arab Emirates', slug:'uae', note:'Dubai and Abu Dhabi \u2014 one of the deepest international school markets in the world.'},
      {name:'Saudi Arabia', slug:'saudi-arabia', note:'Riyadh, Jeddah and the Eastern Province energy corridor.'},
      {name:'Qatar', slug:'qatar', note:'Doha\u2019s Education City and a heavily internationally recruited professional class.'},
      {name:'Kuwait', slug:'kuwait', note:'A long-established British-curriculum sector and a large expatriate population.'},
      {name:'Oman', slug:'oman', note:'Muscat, Sohar and Salalah, with energy and logistics families.'},
      {name:'Bahrain', slug:'bahrain', note:'A compact market with deep British-curriculum roots.'},
      {name:'Israel', slug:'israel', note:'Home education by annual Ministry permit, most of which are approved. Closest clock we have.'},
      {name:'Jordan', slug:'jordan', note:'Zero timezone offset year-round, and dinar fees effectively fixed by the dollar peg.'},
      {name:'Iraq', slug:'iraq', note:'Two education authorities \u2014 federal and the Kurdistan Region \u2014 depending on where you live.'},
      {name:'Lebanon', slug:'lebanon', note:'One record read across four continents of family ties, plus AUB and LAU in English.'},
      {name:'Cyprus', slug:'cyprus', note:'Three different published answers on home education. We set out all of them.'},
      {name:'T\u00fcrkiye', slug:'turkey', note:'Istanbul, Ankara and Izmir, with a large private and international sector.'},
      {name:'Georgia', slug:'georgia', note:'Tbilisi and Batumi, with a growing internationally connected professional class.'},
      {name:'Azerbaijan', slug:'azerbaijan', note:'Baku and the Caspian energy sector, with a portable subject spine.'},
      {name:'India', slug:'india', note:'A vast market where Cambridge and the IB sit alongside CBSE and ICSE.'},
      {name:'Pakistan', slug:'pakistan', note:'Karachi, Lahore and Islamabad, with O-Level and A-Level long established.'},
      {name:'Bangladesh', slug:'bangladesh', note:'Cambridge is decades old here. Sylhet\u2019s UK ties make UCAS-native A-Levels matter most.'},
      {name:'Nepal', slug:'nepal', note:'A-Levels sit almost entirely in one valley. UTC+5:45 \u2014 the world\u2019s only 45-minute offset.'},
      {name:'Maldives', slug:'maldives', note:'Cambridge and Edexcel are the national route. We supply specialists an island cannot house.'},
      {name:'Myanmar', slug:'myanmar', note:'UTC+6:30 \u2014 after-school teaching lands squarely in our day.'},
      {name:'Thailand', slug:'thailand', note:'Bangkok, Chiang Mai and Phuket, with a very large international sector.'},
      {name:'Vietnam', slug:'vietnam', note:'Ho Chi Minh City and Hanoi, with a fast-growing international market.'},
      {name:'Malaysia', slug:'malaysia', note:'Kuala Lumpur and Penang \u2014 among the strongest value in international schooling anywhere.'},
      {name:'China (Hong Kong & Macau)', slug:'china', note:'Hong Kong and Macau served in full. The mainland position set out honestly first.'},
      {name:'Taiwan', slug:'taiwan', note:'Taipei and the technology corridor, with a substantial expatriate community.'},
      {name:'South Korea', slug:'south-korea', note:'Seoul and Busan, with intense academic competition and a strong private sector.'},
      {name:'Japan', slug:'japan', note:'Tokyo, Osaka and Nagoya, with long-established international schools.'},
      {name:'Australia', slug:'australia', note:'Home education regulated state by state, with registration requirements that differ.'},
      {name:'New Zealand', slug:'new-zealand', note:'A long-standing exemption-based home-education framework.'},
    ],
    faqs:[
      {q:'Which Asian country is easiest for home education?',a:'Israel has the clearest permitted route, by annual Ministry permit, and in practice the Ministry approves the great majority of applications. But a permit is renewed yearly rather than granted once, and we set out the formal directive alongside the practice on our Israel page rather than only the encouraging half.'},
      {q:'Can you teach students in mainland China?',a:'Not compulsory-education-age students resident in the mainland, for subject teaching. The 2021 Double Reduction policy bans for-profit academic tutoring for compulsory-education students and places a strict ban on foreign teachers physically based outside China teaching students in China. Hong Kong and Macau are Special Administrative Regions with their own education systems and we serve families there in the ordinary way.'},
      {q:'Do after-school classes actually work from Nairobi?',a:'Across Asia, yes \u2014 and it is the natural configuration rather than a compromise. Bangladesh is three hours ahead, Nepal two hours forty-five, the Maldives two, Myanmar three and a half, Hong Kong five. In each, a four to eight o\u2019clock local class sits inside our normal teaching day.'},
      {q:'Where Cambridge is already the national system, what do you add?',a:'Teaching capacity, not curriculum. In the Maldives especially, an island of a few thousand people cannot house a Further Mathematics or A-Level Physics specialist at any budget. Four students across four islands plus two elsewhere make a full live class, and the qualification is the one they were already taking.'},
    ],
    conclusion:'Twenty-eight countries, the widest regulatory range we cover, and the best timezone relationships we have anywhere. Pick your country above for what actually applies to you, or book an assessment for your child.',
  },

  // ═══════════════ EUROPE ═══════════════
  'best-online-virtual-homeschool-europe': {
    cat:'online-school', country:'', featured:true,
    img:'linear-gradient(135deg,#0A1A14,#1E2F5F)', splash:'/blog/homeschool-europe.jpg', splashAlt:'A student in Europe studying at home with an online lesson on screen',
    t:'Online, Virtual and Homeschool Education in Europe: A Country-by-Country Guide',
    date:'August 2026 \u00b7 13 min read',
    author:'Brendaliz Chelangat', role:'Head of Academics',
    metaTitle:'Best Online & Virtual School in Europe 2026 | 34-Country Homeschool Guide \u2014 Smartious',
    metaDesc:'Home-education law varies more inside Europe than between Europe and anywhere else \u2014 from outright prohibition to full freedom. Thirty-four countries compared, with examination access and timezones.',
    intro:'Europe is the region where the phrase "is homeschooling legal?" is least useful, because the answer changes completely across a two-hour drive. Germany prohibits it. The United Kingdom permits it with no registration requirement at all. Between those two extremes sit permission tiers, notification tiers, court-tested positions and a handful of genuine grey areas. This guide sets out the tiers properly and links to all thirty-four European countries we teach.',
    sections:[
      {h:'Four tiers, and why the label matters',p:'European home-education law sorts into four groups and confusing them causes real harm. The first is prohibition, where attendance at a school is legally required and exemptions are narrow and medical \u2014 Germany is the best-known example. The second is a permission tier, where home education is lawful but requires official approval, often renewed annually and often conditional on following the national curriculum: Hungary, Slovakia, Bulgaria and Austria sit here in different forms. The third is a notification tier, where a family informs the authority and may then proceed. The fourth is genuine freedom, where no registration or notification is required at all \u2014 the United Kingdom being the clearest case in Europe. A family moving from a fourth-tier country to a first-tier one without checking is the single most common and most costly mistake we see.'},
      {h:'The countries where the answer is genuinely disputed',p:'Two European markets in our coverage do not fit any tier cleanly, and we decline to force them. Cyprus produces at least three substantially different published answers \u2014 one restricting home education to students with special educational needs, disabilities or serious health problems with Ministry-approved teachers; one describing it as legal but stringently regulated by permission; and one describing it as not formally recognised at all, with no approval process. At least one comparative source simply lists Cyprus among countries that prohibit it. We set out all of them and send families to the Ministry, because a family planning a school year on the wrong reading loses far more than a subscription.'},
      {h:'What an online school can honestly add in a well-served region',p:'Europe has the deepest school provision of any region we cover, and we are not going to pretend otherwise. What we add here is narrower than in Africa or Asia and worth stating precisely. First, the subject sets a single timetable cannot sustain \u2014 Further Mathematics or a third science for four pupils is unviable at one school and routine in a live group drawn across countries. Second, places, in markets where mid-year arrivals find every preferred school full. Third, reach into the regions outside capitals where international provision thins sharply, which is true in Poland, Romania, Portugal, Greece and across the Balkans. And fourth, fees, in markets where international schooling is priced for corporate packages rather than local salaries.'},
      {h:'The Balkans, where ten countries give ten different answers',p:'Nowhere illustrates the point better. Albania, North Macedonia, Serbia, Bosnia and Herzegovina, Montenegro, Kosovo, Croatia, Slovenia, Bulgaria and Romania sit within a few hundred kilometres of each other and no two share a framework. Bosnia and Herzegovina administers education through multiple authorities within one country, so the operative rules depend on where a family lives rather than on nationality. Several of these countries are also markets where international provision is concentrated in one city and effectively absent everywhere else, which makes them among the strongest cases for live delivery in Europe.'},
      {h:'Timezones, which are the easiest we deal with',p:'Most of Europe sits one to two hours behind our teaching base in winter and level to one hour behind in summer, with the Iberian peninsula and the UK and Ireland at the wider end. In practical terms an after-school or early-evening class works in every European country we serve. Cyprus is one hour behind in winter and exactly level in summer, which is among the closest relationships we have anywhere. For families, the useful consequence is that our full teaching day is genuinely available rather than compressed into one window.'},
      {h:'University routes, which is where Europe rewards planning',p:'UCAS reads Cambridge A-Levels natively, which matters for a great many European families whose children apply to British universities. EU institutions read A-Levels and the IB Diploma through established equivalence routes they use constantly, and the Netherlands, Ireland and increasingly Germany and the Nordics teach substantial English-medium degree programmes that admit international qualifications directly. The practical advice is the same everywhere: choose the A-Level set with the destination in mind rather than the school, and start that conversation two years before the application rather than during it.'},
    ],
    countryLinksHeading:'Every European country we teach',
    countryLinksIntro:'Thirty-four countries, each with a dedicated hub covering the legal tier that applies, the cities we reach, examination access and the local school market. The note against each is what most distinguishes it.',
    countryLinks:[
      {name:'United Kingdom', slug:'united-kingdom', note:'No registration requirement \u2014 among the freest frameworks in Europe. UCAS reads A-Levels natively.'},
      {name:'Ireland', slug:'ireland', note:'A constitutional right to educate at home, with assessment by the relevant authority.'},
      {name:'Germany', slug:'germany', note:'School attendance legally required. We teach alongside a German school enrolment only.'},
      {name:'France', slug:'france', note:'An authorisation-based framework tightened in recent years.'},
      {name:'Netherlands', slug:'netherlands', note:'Narrow exemption grounds, with a very strong English-medium university sector.'},
      {name:'Belgium', slug:'belgium', note:'Three language communities, three sets of rules within one country.'},
      {name:'Luxembourg', slug:'luxembourg', note:'A trilingual system and a heavily international professional population.'},
      {name:'Switzerland', slug:'switzerland', note:'Cantonal rules \u2014 the framework depends entirely on which canton you live in.'},
      {name:'Austria', slug:'austria', note:'A permission tier with annual external examination requirements.'},
      {name:'Italy', slug:'italy', note:'Parental declaration with annual assessment \u2014 more permissive than most expect.'},
      {name:'Spain', slug:'spain', note:'A contested position with court rulings that families should read carefully.'},
      {name:'Portugal', slug:'portugal', note:'A recognised route with equivalence examinations, plus a large relocated community.'},
      {name:'Greece', slug:'greece', note:'Athens and Thessaloniki, with limited provision across the islands.'},
      {name:'Cyprus', slug:'cyprus', note:'Three different published answers on home education. We set out all of them.'},
      {name:'Poland', slug:'poland', note:'A well-established permitted route with school-attached registration.'},
      {name:'Czech Republic', slug:'czech-republic', note:'A recognised individual-education framework with periodic assessment.'},
      {name:'Slovakia', slug:'slovakia', note:'A permission tier with conditions attached to the qualifications of the teaching adult.'},
      {name:'Hungary', slug:'hungary', note:'A permission tier, with framework changes worth confirming before you plan.'},
      {name:'Romania', slug:'romania', note:'Bucharest, Cluj and Timi\u0219oara, with provision thin outside the main cities.'},
      {name:'Bulgaria', slug:'bulgaria', note:'A restrictive framework where our teaching runs alongside a school enrolment.'},
      {name:'Croatia', slug:'croatia', note:'Zagreb, Split and the coast, with a compact international sector.'},
      {name:'Slovenia', slug:'slovenia', note:'A notification-based route with examination requirements.'},
      {name:'Serbia', slug:'serbia', note:'Belgrade and Novi Sad, with provision concentrated in the capital.'},
      {name:'Bosnia and Herzegovina', slug:'bosnia-and-herzegovina', note:'Multiple education authorities within one country \u2014 your address decides which applies.'},
      {name:'Montenegro', slug:'montenegro', note:'Podgorica and the Tivat yachting coast, with a mobile international community.'},
      {name:'North Macedonia', slug:'north-macedonia', note:'Skopje and a small but growing international sector.'},
      {name:'Albania', slug:'albania', note:'Tirana and the coast, with a fast-changing private school market.'},
      {name:'Kosovo', slug:'kosovo', note:'Pristina and a young, internationally connected population.'},
      {name:'Ukraine', slug:'ukraine', note:'A long-standing external and family-form education framework in national law.'},
      {name:'Denmark', slug:'denmark', note:'A constitutional tradition permitting education outside school, with supervision.'},
      {name:'Sweden', slug:'sweden', note:'Exceptional circumstances only \u2014 among the most restrictive in the Nordics.'},
      {name:'Norway', slug:'norway', note:'Home education permitted with municipal supervision.'},
      {name:'Finland', slug:'finland', note:'Compulsory education rather than compulsory schooling \u2014 a genuine distinction.'},
      {name:'T\u00fcrkiye', slug:'turkey', note:'Istanbul, Ankara and Izmir, spanning Europe and Asia.'},
    ],
    faqs:[
      {q:'Is homeschooling legal in Europe?',a:'There is no single European answer, and treating it as one causes real harm. Germany requires school attendance; the United Kingdom requires no registration at all; and between them sit permission tiers, notification tiers and genuine grey areas. Each of our country pages states which tier applies and cites the framework rather than summarising it away.'},
      {q:'We are moving from the UK to Germany \u2014 does our arrangement continue?',a:'The qualification does; the legal arrangement does not. Education law follows residence, so a family moving into a prohibition-tier country is subject to that country\u2019s rules from the point of residence. This is the single most common and most costly mistake we see in Europe, and it is worth taking advice before the move rather than after.'},
      {q:'Europe has excellent schools \u2014 what would we gain?',a:'Usually one specific thing: a subject set your timetable cannot staff for four pupils. Beyond that, a place if you arrive mid-year to a full school, reach if you live outside a capital, and fees. If your school covers what your child needs, we will tell you so.'},
      {q:'Will UK universities accept A-Levels sat elsewhere in Europe?',a:'Yes, without conversion. UCAS reads Cambridge A-Levels natively wherever they are sat. EU institutions read A-Levels and the IB through established equivalence routes they use every year.'},
    ],
    conclusion:'Thirty-four countries and four genuinely different legal tiers, inside a region small enough to drive across. Pick your country above for the framework that actually applies to you, or book an assessment for your child.',
  },

  // ═══════════════ THE AMERICAS ═══════════════
  'best-online-virtual-homeschool-americas': {
    cat:'online-school', country:'', featured:true,
    img:'linear-gradient(135deg,#0A1020,#1E2F5F)', splash:'/blog/homeschool-americas.jpg', splashAlt:'A student in the Americas learning at home in a live online class',
    t:'Online, Virtual and Homeschool Education in the Americas: A Country-by-Country Guide',
    date:'August 2026 \u00b7 13 min read',
    author:'Brendaliz Chelangat', role:'Head of Academics',
    metaTitle:'Best Online & Virtual School in the Americas 2026 | 18-Country Homeschool Guide \u2014 Smartious',
    metaDesc:'From Puerto Rico\u2019s near-total freedom to Brazil\u2019s Supreme Court ruling and Uruguay\u2019s live litigation \u2014 home-education law across eighteen countries in North, Central and South America.',
    intro:'Latin America produced the most varied set of legal positions we have researched anywhere, and almost none of it is described accurately by the English-language sources families usually find. One country\u2019s Supreme Court has ruled there is no right to home education. Another has proceedings before its courts right now. A third runs a working umbrella-school practice under an online-education regulation. And one territory in this region has the freest framework we have found in ninety-nine countries. This guide sorts them out.',
    sections:[
      {h:'The freest framework we have found anywhere',p:'Puerto Rico. There is no law expressly regulating home education, no registration, no notification, no official registry, no mandatory state curriculum, no routine supervision and no teacher-certification requirement. The mechanism is elegant: under the relevant statute the parent is the non-governmental entity under whose auspices the school operates and is also its director, which is why home educators are exempt from compulsory public school attendance rather than from education. That freedom leaves exactly one gap, and it is the one we fill \u2014 most home educators there lawfully issue their own transcripts, which are self-attested, and an external examination board supplies the independent verification a family cannot supply for itself.'},
      {h:'Where the courts have already spoken',p:'Brazil is the clearest. Its Supreme Federal Court held that there is no subjective public right to home education, which does not exist in Brazilian legislation \u2014 not unconstitutional in principle, but requiring federal legislation that has not been enacted. State laws attempting to create it have been struck down. Uruguay is the opposite case and the most actively contested position in our entire coverage: a constitutional provision supporting parental choice, a 2020 statutory amendment that removed the express enrolment obligation, a referendum that confirmed the law, education authorities who read it differently, and proceedings before the courts. We set out every side of that, including the parts that cut against our commercial interest.'},
      {h:'The countries with a genuine state route',p:'Two are worth knowing about specifically. Chile permits ex\u00e1menes libres, a state examination route that certifies a student without school enrolment \u2014 the only Latin American market in our coverage where a genuine full-time alternative exists through the state. Bolivia is stricter on paper, with education compulsory to bachillerato and the State holding full guardianship over the system, and yet a working practice developed under a government online-education regulation whereby Bolivian schools act as colegios sombrilla, umbrella schools carrying the enrolment and national curriculum for families educating largely at home. We are not an umbrella school and cannot substitute for one \u2014 those services are complementary to ours, and a family aiming abroad often needs both.'},
      {h:'The honest silences',p:'Panama, Guatemala and Venezuela are markets where we could not verify a position on parental home education from a primary instrument, and we say so rather than guessing. The argument we make on all three pages is the same and worth repeating here: an absence of clear regulation is an absence of protection rather than a permission. Where a matter is regulated, a family knows what compliance looks like and can demonstrate it. Where it is unaddressed, there is nothing to demonstrate and no framework to rely on if the question is raised by a school, an authority or a court. That is a weaker position for a family, not a stronger one.'},
      {h:'The timezone problem, stated plainly',p:'This is the region where we are least convenient and we would rather say so than discover it in March. Mexico, Guatemala and Costa Rica sit nine hours behind our teaching base; Colombia, Peru, Ecuador and Panama eight. In all of those our classes land in the local morning and an after-school arrangement is simply not possible from our side. What makes it work is the school day: those countries commonly run turno matutino and vespertino, so an afternoon-shift student has mornings entirely free, which is exactly our window. Further south the picture improves \u2014 Brazil, Argentina, Uruguay and Paraguay sit six hours behind, where mornings and early afternoons both work, and the Dominican Republic, Bolivia, Venezuela and Puerto Rico seven.'},
      {h:'What we would tell a family in this region',p:'Read your own country\u2019s page rather than a regional summary, because the variation here is larger than anywhere. Ask any provider where your child will physically sit the paper, and in markets where we plan that early we do so for a reason. And treat confident one-line answers about Latin American home-education law with suspicion \u2014 several countries here are genuinely unsettled, one has litigation in progress, and a provider who flattens that into a reassuring sentence is telling you something the record does not support.'},
    ],
    countryLinksHeading:'Every country we teach across the Americas',
    countryLinksIntro:'Eighteen countries and territories, each with a dedicated hub covering the legal position in detail, the cities we reach, examination access and the local school market. The note against each is what most distinguishes it.',
    countryLinks:[
      {name:'United States', slug:'usa', note:'Home education regulated state by state, with fifty different sets of requirements.'},
      {name:'Canada', slug:'canada', note:'Provincial frameworks \u2014 the rules depend entirely on which province you live in.'},
      {name:'Puerto Rico', slug:'puerto-rico', note:'The freest framework we have found anywhere. No registration, notification or state curriculum.'},
      {name:'Mexico', slug:'mexico', note:'Compulsory through media superior. Nine hours behind us \u2014 morning classes only.'},
      {name:'Guatemala', slug:'guatemala', note:'Not specifically regulated, which is not the same as permitted. We explain why.'},
      {name:'Costa Rica', slug:'costa-rica', note:'The ministry does not accept the modality. Educaci\u00f3n Abierta is the real mechanism.'},
      {name:'Panama', slug:'panama', note:'No framework we could verify. Dollarised, so fees carry no exchange risk.'},
      {name:'Dominican Republic', slug:'dominican-republic', note:'A constitutional right without an implementing framework. Best clock in the Caribbean.'},
      {name:'Colombia', slug:'colombia', note:'A genuine legal dispute, argued in good faith on both sides. Compulsory ends at fifteen.'},
      {name:'Venezuela', slug:'venezuela', note:'A qualification read in every country your family already has ties to. Fees in USD.'},
      {name:'Ecuador', slug:'ecuador', note:'Educaci\u00f3n en casa is named and regulated \u2014 and is the family\u2019s exclusive responsibility.'},
      {name:'Peru', slug:'peru', note:'Three levels of authority, and no parental home-education route we could establish.'},
      {name:'Brazil', slug:'brazil', note:'The Supreme Federal Court has held there is no right to home education.'},
      {name:'Bolivia', slug:'bolivia', note:'A strict statute, and a working colegio sombrilla practice we sit alongside rather than replace.'},
      {name:'Chile', slug:'chile', note:'Ex\u00e1menes libres \u2014 the only genuine state route to full-time study in Latin America.'},
      {name:'Argentina', slug:'argentina', note:'Compulsory through completion of secondary, across twenty-four jurisdictions.'},
      {name:'Paraguay', slug:'paraguay', note:'A genuine grey area, with rulings reported in both directions.'},
      {name:'Uruguay', slug:'uruguay', note:'The most actively contested position we cover, with proceedings before the courts.'},
    ],
    faqs:[
      {q:'Which country in the Americas has the freest home-education framework?',a:'Puerto Rico, by a considerable margin \u2014 no law expressly regulating it, no registration, no notification, no official registry, no mandatory state curriculum and no teacher-certification requirement. Chile is the most permissive in Latin America proper, because ex\u00e1menes libres provide a genuine state certification route without school enrolment.'},
      {q:'Is homeschooling legal in Brazil?',a:'The Supreme Federal Court held that there is no subjective public right to home education and that it does not exist in Brazilian legislation. It was not held unconstitutional in principle, but creating it would require federal legislation that has not been enacted, and state laws attempting to do so have been struck down.'},
      {q:'Why do you teach in the local morning across Central America?',a:'Because we are nine hours behind and honest about it. In Mexico, Guatemala and Costa Rica an after-school arrangement is impossible from our side. What makes it work is that schools there commonly run turno matutino and vespertino, so an afternoon-shift student has mornings entirely free \u2014 which is exactly our teaching window.'},
      {q:'Several countries here have no clear law. Does that mean we can go ahead?',a:'No, and this is the most important thing on this page. An absence of clear regulation is an absence of protection rather than a permission. Where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to your ministry in writing before you plan a school year around it.'},
    ],
    conclusion:'Eighteen countries, a Supreme Court ruling, live litigation, a state examination route, an umbrella-school practice and the freest framework we have found anywhere \u2014 all in one hemisphere. Pick your country above, or book an assessment for your child.',
  },

  // ═══════════════ FLAGSHIP BRAND ARTICLE ═══════════════
  // Hub of the hub-and-spoke. Links to all four continental pillars
  // (articleLinks) and to twelve flagship country hubs (countryLinks).
  // Every number in this article is verifiable against the site itself.
  // If a figure changes, change it here too — an unverifiable claim on
  // this page undermines every honest claim on the other 250.
  'smartious-homeschool-global': {
    cat:'homeschool', country:'', featured:true,
    img:'linear-gradient(135deg,#080C14,#8B1A2E)', splash:'/blog/smartious-homeschool-global.jpg', splashAlt:'Homeschooled students in different countries learning together in a live Smartious online class',
    t:'Ninety-Nine Countries: What We Learned Building the World\u2019s Most Detailed Guide to Educating Outside School',
    date:'August 2026 \u00b7 14 min read',
    author:'Alfred Ouko', role:'Founder',
    metaTitle:'Smartious Homeschool Global | The World\u2019s Leading Online, Virtual & Homeschool Provider \u2014 99 Countries',
    metaDesc:'Live online Cambridge IGCSE, A-Level, IB and AP across 99 countries and 490 cities, taught from Nairobi since 2019. The legal position for every market, published in full \u2014 including where we could not verify it.',
    intro:'We did not set out to write the most detailed guide to educating outside school in the world. We set out to answer one question honestly for one family in Nairobi, and then found that answering it properly for the next family meant reading the actual law rather than repeating what an aggregator had written. Ninety-nine countries later, that habit has produced something we did not plan and now think is the most valuable thing we own \u2014 and it is free to read.',
    sections:[
      {h:'What we actually built',p:'Ninety-nine country guides. Four hundred and ninety city pages. Two hundred and fifty-two articles. For each country: which ministry administers education, what the compulsory range is, whether parental home education is permitted, prohibited, permitted-by-permit, contested or simply unaddressed, where a student physically sits a Cambridge or Edexcel paper, and what the timezone relationship actually means for a live class. It is the reference we wished existed when we started, and it exists because we would not write a country page until we could say something true about it.'},
      {h:'The rule that shaped everything',p:'Early on we made a decision that has cost us enrolments and that we would make again: we do not claim a country permits home education unless we can point to something that says so. Thirty of our published pages contain an explicit admission that we could not verify a position from a primary instrument. Panama, Guatemala, Venezuela, Jordan, Iraq, Lebanon, Bangladesh, Nepal, Myanmar and others carry a sentence saying, in effect, we do not know and will not guess. Every one of those could have been a confident paragraph that converted better. A family who plans a school year on a confident paragraph that turns out to be wrong carries the consequence; we do not. That asymmetry decided it.'},
      {h:'What we found when we read the law properly',p:'The variation is far larger than the industry admits. Puerto Rico requires no registration, no notification, no state curriculum and no teacher certification \u2014 the freest framework we found anywhere. Germany requires school attendance. Brazil\u2019s Supreme Federal Court has held there is no subjective public right to home education. Uruguay has proceedings before its courts right now, with a constitutional provision on one side and the education authorities on the other. Israel grants annual permits and approves most of them despite a formal directive that reads restrictively. Chile offers ex\u00e1menes libres, a genuine state certification route without school enrolment. Bolivia is strict on paper and yet has a working umbrella-school practice. Cyprus produces three substantially different published answers to the same question, and we set out all three rather than picking one. None of that survives being summarised as "homeschooling laws by country".'},
      {h:'The market that made us narrow the offer',p:'The clearest test of whether a company means what it says is what it does when honesty costs money. In mainland China, the 2021 Double Reduction policy bans for-profit tutoring in academic subjects for compulsory-education students and places a strict ban on foreign teachers physically based outside China teaching students in China. We are a for-profit provider, our teachers are based outside China, and we teach a foreign curriculum. That is three separate points of contact with the policy. So we do not enrol compulsory-education-age students resident in mainland China for subject teaching, our Shanghai, Beijing and Shenzhen pages exist to explain the position rather than to sell, and the constraint is in the opening paragraph rather than a footnote. We serve Hong Kong and Macau, which have their own education systems, in the ordinary way.'},
      {h:'Where we say a competitor is the better answer',p:'Several of our pages tell families to consider someone else. In Puerto Rico, a household that specifically needs an accredited American high school diploma is better served by a US-accredited provider, and we say so \u2014 we are not accredited in the United States and will not imply otherwise. In Bolivia we tell families that a colegio sombrilla carries the Bolivian enrolment and curriculum and that we cannot substitute for one; the two services are complementary and many families need both. In the Maldives we name T\u2019CHERs and HSLDA as genuinely useful and note they do things we do not. In Israel and across the Gulf we say plainly that we cannot obtain or influence a Ministry permit. A provider who has never told you to look elsewhere has not yet had a conversation where it was true.'},
      {h:'The timezone, which is the one structural advantage of teaching from Nairobi',p:'We teach at UTC+3, and this turns out to matter more than anything in our marketing. Jordan and Iraq sit on exactly our clock \u2014 no offset at all, year-round. Israel, Cyprus and Lebanon are one hour off in winter and level in summer. Across the whole of Africa the widest gap is three hours. Bangladesh is three hours ahead, Nepal two hours forty-five, the Maldives two, Myanmar three and a half, Hong Kong five \u2014 all of which put an after-school class squarely inside our teaching day. We are also honest where it does not work: across Mexico, Guatemala, Costa Rica, Colombia, Peru and Ecuador we are eight or nine hours behind, our classes land in the local morning, and an after-school arrangement is impossible from our side. We put that on the page rather than in the third conversation.'},
      {h:'What the teaching actually is',p:'Live classes of four to six students with a subject specialist, from IGCSE through to A-Level, IB Diploma and Advanced Placement, at USD 2,160 to 6,480 a year. Not a curriculum package with a login, not recorded modules, not a one-to-one tutor billed hourly. Every session is recorded so a missed class is never a lost one, and in most markets we run alongside the school a child already attends rather than replacing it \u2014 because in most markets that is the arrangement the law actually supports. The mechanism that makes it work is simple arithmetic: a subject that four students want is unviable at one school anywhere in the world, and routine in a group drawn from six countries.'},
      {h:'Why that arithmetic is the whole business',p:'An island of two thousand people in the Maldives cannot house a Further Mathematics specialist at any budget. Nepal concentrates its entire A-Level sector in one valley, so a family in Pokhara has had to send a sixteen-year-old away and fund a second household. Hong Kong has outstanding schools and waiting lists that leave an October arrival with nowhere to go. A mining family in Kolwezi, a resort family on a Maldivian atoll, a farming family in the Paraguayan Chaco, a petroleum family in Basra \u2014 none of them has a curriculum problem. They have a distribution problem, and it is the same distribution problem in every one of the ninety-nine countries we have written about. That is what we built the school to solve.'},
      {h:'What we would ask you to judge us on',p:'Not on this page. Open the country guide for wherever you live and see whether it tells you something you did not know, cites something you can check, and admits what it does not know. Then ask us the three questions we tell families to ask any provider: what does the law here actually say and can you show me the instrument; where will my child physically sit the paper and have you confirmed capacity for my subjects; is the teaching live and how many students are in the class. We wrote those questions knowing they would be turned on us. That was the point.'},
    ],
    articleLinksHeading:'The four continental guides',
    articleLinksIntro:'Each one compares home-education law, examination access and timezones across a whole region, and links to every country hub within it.',
    articleLinks:[
      {name:'Africa \u2014 20 countries', slug:'best-online-virtual-homeschool-africa', note:'Four legal shapes, an extractive belt that spans six countries, and the widest timezone gap on the continent is three hours.'},
      {name:'Asia and the Pacific \u2014 29 countries', slug:'best-online-virtual-homeschool-asia', note:'The widest regulatory range we cover, from annual permits to an outright constraint on providers based abroad.'},
      {name:'Europe \u2014 34 countries', slug:'best-online-virtual-homeschool-europe', note:'Four genuinely different legal tiers inside a region small enough to drive across.'},
      {name:'The Americas \u2014 18 countries', slug:'best-online-virtual-homeschool-americas', note:'A Supreme Court ruling, live litigation, a state examination route and the freest framework we found anywhere.'},
    ],
    countryLinksHeading:'Twelve country guides worth reading even if you do not live there',
    countryLinksIntro:'These are the ones where what we found genuinely surprised us, and where the published summaries elsewhere are furthest from what the law and the ministries actually say.',
    countryLinks:[
      {name:'Puerto Rico', slug:'puerto-rico', note:'No registration, no notification, no state curriculum. The freest framework in ninety-nine countries.'},
      {name:'Maldives', slug:'maldives', note:'Cambridge and Edexcel are the national secondary route, not a foreign alternative.'},
      {name:'Uruguay', slug:'uruguay', note:'A constitutional argument, a 2020 amendment, a referendum and proceedings before the courts.'},
      {name:'Brazil', slug:'brazil', note:'The Supreme Federal Court has held there is no subjective public right to home education.'},
      {name:'Chile', slug:'chile', note:'Ex\u00e1menes libres \u2014 the only genuine state route to full-time study in Latin America.'},
      {name:'Bolivia', slug:'bolivia', note:'A strict statute and a working umbrella-school practice, which we sit alongside rather than replace.'},
      {name:'Israel', slug:'israel', note:'Annual permits, a restrictive formal directive, and a Ministry that approves most applications.'},
      {name:'Cyprus', slug:'cyprus', note:'Three substantially different published answers to one question. We print all three.'},
      {name:'Iraq', slug:'iraq', note:'Two education authorities in one country \u2014 which applies depends on where you live.'},
      {name:'Nepal', slug:'nepal', note:'An entire A-Level sector inside one valley, and the world\u2019s only forty-five-minute timezone.'},
      {name:'China', slug:'china', note:'The market where we narrowed our own offer, and explain exactly why on the page.'},
      {name:'Kenya', slug:'kenya', note:'Where we started, where we teach from, and the only clock we share with our students exactly.'},
    ],
    faqs:[
      {q:'What makes Smartious different from other online schools?',a:'Three things we can point at rather than assert. Every class is live in a group of four to six with a subject specialist, not recorded modules or a curriculum package. We publish the legal position for all ninety-nine countries we serve, including thirty where we state plainly that we could not verify it. And we decline business where the law does not support it \u2014 most visibly in mainland China, where we explain the constraint instead of selling around it.'},
      {q:'How many countries do you actually teach in?',a:'Ninety-nine, with four hundred and ninety city guides and two hundred and fifty-two articles behind them. Every country hub sets out the ministry, the compulsory range, the home-education position, examination access and the timezone relationship for that specific market.'},
      {q:'Are you accredited?',a:'We teach toward Cambridge International, Pearson Edexcel, the IB Diploma and Advanced Placement \u2014 qualifications set and marked by independent examination boards and read by universities in 160+ countries. We are not a licensed or registered school in the countries we serve, we issue no national qualifications, and we say so on every country page. Where a family specifically needs a national or accredited American diploma, we tell them to look elsewhere.'},
      {q:'What does it cost?',a:'USD 2,160 to 6,480 a year for live small-group teaching through to A-Level, quoted in USD. There is no debenture, no capital levy and no waiting list.'},
      {q:'Can you replace my child\u2019s school?',a:'In a small number of markets, yes. In most, no \u2014 and we build alongside a school enrolment because that is what the law where you live actually supports. Which applies to you is on your country page, and it is the first thing we would want you to read.'},
    ],
    conclusion:'We would rather be the school that told you the truth about your country\u2019s law than the one that told you what you hoped to hear. Read the guide for wherever you live \u2014 it is free, it cites what it can, and it admits what it cannot. Then, if it is useful, book an assessment for your child.',
  },

}
