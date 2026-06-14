/* eslint-disable */
/**
 * usCities.js — US Tier 1 city landing page data (Phase 1: top metro per state).
 *
 * Each city powers a dedicated landing page at /homeschool-{city-slug}-{state-abbr}.
 * Pattern: state-level legal framework + pricing + voucher inherited from US_STATES,
 * city-level adds unique hook, universities, neighborhoods, hyper-local FAQs.
 *
 * Add Tier 2 cities (Dallas, San Francisco, Orlando, Raleigh, etc.) using same shape.
 */

export const US_CITIES = {
  'houston-tx': {
    name: 'Houston',
    state: 'texas',
    metroPop: '7.5M metro residents',
    uniqueHook: 'Energy industry families homeschool around offshore rotations, global postings, and unpredictable schedules — Smartious live online classes flex with international relocations.',
    topUnis: ['Rice University', 'University of Houston', 'Texas A&M (1hr north)', 'Sam Houston State', 'Houston Baptist'],
    neighborhoods: ['Memorial', 'The Heights', 'River Oaks', 'Sugar Land', 'Katy', 'Cypress-Fairbanks', 'The Woodlands', 'Pearland', 'West University Place'],
    heroPhoto: 'https://images.unsplash.com/photo-1597008641621-cdb2c8c54d5d?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Houston families — built for Rice University, Texas A&M, and Ivy League applications. Real teachers, not Acellus videos. From $180/month USD.',
    proof: 'Houston is home to the largest energy corridor in America. Hundreds of energy and medical-centre families homeschool to align with international postings, hospital schedules, and Texas\'s freedom from paperwork.',
    metaTitle: 'Online Homeschool Houston Texas — Live Cambridge IGCSE & A-Level | Smartious',
    metaDesc: 'Live online homeschool for Houston families. Cambridge IGCSE and A-Level with real teachers on Central Time. Built for Rice, UH, and Ivy League. From $180/month USD. Zero Texas paperwork.',
    faqs: [
      { q: 'Can my Houston child homeschool while parents travel internationally for energy industry work?', a: 'Yes. Houston families with offshore or international postings are core to our model. Live classes run 7 AM – 4 PM CT (a global-friendly window), all sessions are recorded for offshore parents in other time zones, and your child stays academically synchronised regardless of where the family is physically based that month. Texas requires no paperwork to maintain homeschool status during travel.' },
      { q: 'Does Smartious help Houston families apply to Rice University?', a: 'Yes. Rice University accepts Cambridge IGCSE and A-Level qualifications and welcomes homeschool applicants. We provide free Common App support, Rice-specific essay guidance, and recommendation letters from your teaching team. Cambridge A-Level rigour is particularly valued for Rice\'s competitive engineering and pre-med programmes.' },
      { q: 'Which Houston suburbs and neighborhoods do you serve?', a: 'All of Greater Houston including Memorial, The Heights, River Oaks, West University Place, Sugar Land, Katy, Cypress-Fairbanks ISD area, The Woodlands, Pearland, Spring, Kingwood, and Clear Lake. Since we are fully online, your physical neighborhood is not a barrier — families in Houston suburbs and rural areas like Magnolia or Tomball get identical service.' },
    ],
  },

  'los-angeles-ca': {
    name: 'Los Angeles',
    state: 'california',
    metroPop: '13M metro residents',
    uniqueHook: 'Entertainment industry families homeschool to accommodate production schedules, on-set tutoring requirements, and the LA traffic that makes traditional school commutes brutal.',
    topUnis: ['UCLA', 'USC', 'Caltech (Pasadena)', 'Pepperdine', 'LMU', 'Occidental'],
    neighborhoods: ['Westside (Santa Monica, Brentwood, Pacific Palisades)', 'San Fernando Valley', 'South Bay', 'Pasadena & San Gabriel Valley', 'Eastside (Silver Lake, Echo Park)', 'Beverly Hills', 'Malibu', 'Manhattan Beach', 'Hermosa Beach'],
    heroPhoto: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Los Angeles families. Built for UCLA, USC, Caltech, and Ivy League applications. Real teachers, not Acellus videos. From $180/month USD.',
    proof: 'LA entertainment-industry parents and Westside tech families homeschool to escape brutal commutes and to match their children\'s talent or production schedules. Cambridge A-Level qualifications give LA homeschool graduates a meaningful edge in UC system admissions.',
    metaTitle: 'Online Homeschool Los Angeles — Live Cambridge IGCSE & A-Level | UCLA, USC, Caltech | Smartious',
    metaDesc: 'Live online homeschool for Los Angeles families. Cambridge IGCSE and A-Level with PGCE teachers on Pacific Time. Built for UCLA, USC, Caltech and Ivy League admissions. From $180/month USD.',
    faqs: [
      { q: 'Can my LA child homeschool while working in entertainment (acting, music, production)?', a: 'Yes — this is one of our strongest LA use cases. Live classes run 5 AM – 2 PM PT, with all sessions recorded for child actors and performers whose work schedules vary. On-set studio teachers (where required by SAG-AFTRA / Coogan Law) work alongside Smartious curriculum. We provide transcripts that satisfy both California\'s PSA and entertainment-industry educational requirements.' },
      { q: 'Does Smartious help LA homeschool families apply to UCLA, USC, and Caltech?', a: 'Yes. UCLA, USC, and Caltech all accept Cambridge IGCSE and A-Level qualifications. Caltech particularly values Cambridge A-Level rigour for STEM applicants. We provide free Common App, UC application, and Caltech-specific guidance. Our LA graduates routinely matriculate to UCLA Honors, USC Trustee Scholarship, and Caltech with Cambridge-strengthened applications.' },
      { q: 'Which LA neighborhoods and South Bay areas do you serve?', a: 'All of Greater LA including Westside (Santa Monica, Brentwood, Pacific Palisades, Beverly Hills, Westwood), San Fernando Valley, South Bay (Manhattan Beach, Hermosa, Redondo, Torrance), Pasadena & San Gabriel Valley, Eastside (Silver Lake, Echo Park, Highland Park), Malibu, and Long Beach. Since we are online, neighborhood is irrelevant — your child gets identical instruction whether in Santa Monica or Eagle Rock.' },
    ],
  },

  'miami-fl': {
    name: 'Miami',
    state: 'florida',
    metroPop: '6.3M metro residents',
    uniqueHook: 'Miami\'s international and Latin American families use Smartious to maintain English-language instruction alongside Spanish/Portuguese household languages, while accessing the FES-EO voucher of $7,800/year per child.',
    topUnis: ['University of Miami', 'FIU', 'UF (4hr north)', 'Florida State (7hr north)', 'Nova Southeastern', 'Barry University'],
    neighborhoods: ['Coral Gables', 'Coconut Grove', 'Pinecrest', 'Aventura', 'Doral', 'Brickell', 'South Miami', 'Key Biscayne', 'Miami Beach', 'Weston', 'Sunrise (Broward)', 'Boca Raton (Palm Beach)'],
    heroPhoto: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Miami families — fully eligible for the FES-EO voucher of $7,800/year per child via Step Up For Students. Built for UM, FIU, UF, and Ivy League.',
    proof: 'Miami homeschool families uniquely benefit from Florida\'s universal FES-EO voucher AND from Cambridge\'s international recognition — Cambridge IGCSE/A-Level qualifications work for both US universities and Latin American/European university systems if families relocate.',
    metaTitle: 'Online Homeschool Miami — FES-EO Voucher Eligible | Live Cambridge IGCSE & A-Level | Smartious',
    metaDesc: 'Live online homeschool for Miami families. Cambridge IGCSE and A-Level — fully covered by FES-EO voucher ($7,800/year/child via Step Up For Students). Built for University of Miami, FIU, UF. Spanish/Portuguese-bilingual welcome.',
    faqs: [
      { q: 'Does the FES-EO voucher cover Smartious tuition for Miami families?', a: 'Yes — fully. The FES-EO voucher provides approximately $7,800 per child per year via Step Up For Students, distributed through ClassWallet. Smartious Online tier ($2,160/year) uses only 28% of your voucher budget. The remaining $5,640+ can fund textbooks, sports, Spanish-language enrichment, or rollover. Premium 1-on-1 tier ($6,480/year) is also fully voucher-eligible.' },
      { q: 'Can my Miami child attend Smartious while maintaining Spanish or Portuguese at home?', a: 'Yes — many Miami families do exactly this. Our instruction is in English (Cambridge IGCSE and A-Level subjects), which strengthens college applications. Spanish/Portuguese home language is preserved naturally. Some families add Spanish A-Level to their Smartious programme (Spanish 7159 IGCSE or 9716 A-Level) — Cambridge\'s Spanish syllabus is excellent for native speakers seeking university credit.' },
      { q: 'Which Miami-Dade and Broward neighborhoods do you serve?', a: 'All of South Florida including Miami-Dade neighborhoods (Coral Gables, Coconut Grove, Pinecrest, Aventura, Doral, Brickell, Key Biscayne, Miami Beach, South Miami) plus Broward (Weston, Plantation, Sunrise, Cooper City, Pembroke Pines) plus Palm Beach County (Boca Raton, Delray Beach, West Palm Beach). Smartious is fully online so your physical address only matters for university campus visit logistics.' },
    ],
  },

  'charlotte-nc': {
    name: 'Charlotte',
    state: 'north-carolina',
    metroPop: '2.8M metro residents',
    uniqueHook: 'Charlotte\'s banking and finance professionals homeschool to give their children deeper academic preparation than overcrowded Charlotte-Mecklenburg Schools provide — Cambridge qualifications strengthen UNC Chapel Hill, Davidson, and Wake Forest applications.',
    topUnis: ['UNC Chapel Hill (3hr)', 'NC State (2hr)', 'Davidson College', 'UNC Charlotte', 'Wake Forest (1.5hr)', 'Duke (3hr)'],
    neighborhoods: ['Myers Park', 'Eastover', 'Ballantyne', 'SouthPark', 'Dilworth', 'Plaza Midwood', 'Lake Norman (Cornelius, Davidson, Huntersville)', 'Matthews', 'Mint Hill', 'Indian Trail', 'Rock Hill (SC)', 'Fort Mill (SC)'],
    heroPhoto: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Charlotte families. Built for UNC Chapel Hill, Davidson, Duke, and Wake Forest applications. From $180/month USD.',
    proof: 'Charlotte banking families use Cambridge qualifications to position children for UNC Chapel Hill and elite Eastern liberal arts colleges (Davidson, Duke, Wake Forest) — institutions where international curriculum carries meaningful weight in admissions.',
    metaTitle: 'Online Homeschool Charlotte — Live Cambridge IGCSE & A-Level | UNC, Davidson, Duke | Smartious',
    metaDesc: 'Live online homeschool for Charlotte families. Cambridge IGCSE and A-Level with PGCE teachers on Eastern Time. Built for UNC Chapel Hill, Davidson, Duke, Wake Forest. From $180/month USD.',
    faqs: [
      { q: 'How does Smartious work with NC DNPE filing for Charlotte families?', a: 'North Carolina requires Notice of Intent filed with the Division of Non-Public Education (DNPE) once when starting homeschool — not annually. Smartious provides transcripts, attendance records, and curriculum documentation that satisfy NC\'s record-keeping requirements. Mecklenburg County families file directly with DNPE in Raleigh; we coordinate annual standardised test booking through approved providers.' },
      { q: 'Does Smartious help Charlotte families apply to Davidson, Duke, and UNC Chapel Hill?', a: 'Yes. Davidson, Duke, UNC Chapel Hill, Wake Forest, and NC State all accept Cambridge IGCSE and A-Level qualifications. Davidson and Duke evaluate homeschool applicants holistically — Cambridge A-Level rigour stands out in their highly-selective admissions. We provide free Common App, UNC Morehead-Cain Scholarship application support, and recommendation letters.' },
      { q: 'Which Charlotte neighborhoods and South Carolina border areas do you serve?', a: 'All of Greater Charlotte including Myers Park, Eastover, Ballantyne, SouthPark, Dilworth, Plaza Midwood, Lake Norman (Cornelius, Davidson, Huntersville), Matthews, Mint Hill, Indian Trail. Plus South Carolina border families in Rock Hill, Fort Mill, Tega Cay (note: SC families follow South Carolina homeschool law, not NC — we serve both states with state-appropriate compliance documentation).' },
    ],
  },

  'atlanta-ga': {
    name: 'Atlanta',
    state: 'georgia',
    metroPop: '6.3M metro residents',
    uniqueHook: 'Atlanta is the centre of the rapidly-growing Black homeschool movement in America. Combined with strong tech corridor families and access to HOPE Scholarship + Georgia Tech, Atlanta is one of the highest-leverage US homeschool cities.',
    topUnis: ['Georgia Tech', 'Emory', 'UGA (1.5hr)', 'Spelman', 'Morehouse', 'Clark Atlanta', 'Agnes Scott', 'Mercer'],
    neighborhoods: ['Buckhead', 'Brookhaven', 'Sandy Springs', 'Dunwoody', 'Alpharetta', 'Roswell', 'Marietta', 'Decatur', 'East Atlanta', 'Inman Park', 'Virginia-Highland', 'Smyrna', 'Vinings', 'Peachtree Corners', 'Johns Creek'],
    heroPhoto: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Atlanta families. Preserves HOPE Scholarship eligibility while strengthening Georgia Tech, Emory, Spelman, Morehouse, and Ivy League applications.',
    proof: 'Atlanta\'s Black homeschool community has grown 4x in the past decade. Smartious serves Atlanta families across all demographics — HBCU-tracking, Georgia Tech-tracking, and Emory-tracking students all benefit from Cambridge A-Level rigour combined with HOPE Scholarship financial support.',
    metaTitle: 'Online Homeschool Atlanta — HOPE Scholarship Eligible | Live Cambridge IGCSE & A-Level | Smartious',
    metaDesc: 'Live online homeschool for Atlanta families. Cambridge IGCSE and A-Level — preserves HOPE Scholarship eligibility. Built for Georgia Tech, Emory, Spelman, Morehouse. From $180/month USD.',
    faqs: [
      { q: 'How does Smartious work with Georgia\'s Declaration of Intent for Atlanta families?', a: 'Georgia requires an annual Declaration of Intent (DOI) filed between September 1–30 with your local school superintendent. Smartious provides curriculum descriptions, transcripts, and attendance documentation that satisfy Georgia\'s DOI process. Fulton, DeKalb, Cobb, Gwinnett, and Cherokee county families all file with their respective districts. Annual standardised testing required every 3 years — kept in family records, not submitted.' },
      { q: 'Does Smartious help Atlanta families apply to Spelman, Morehouse, Georgia Tech, and Emory?', a: 'Yes. Spelman, Morehouse, Clark Atlanta, Georgia Tech, Emory, UGA, Mercer, and Agnes Scott all accept Cambridge IGCSE and A-Level qualifications. Georgia Tech and Emory particularly value Cambridge A-Level for competitive STEM and pre-med programmes. We provide free Common App, HBCU application support, and HOPE/Zell Miller Scholarship preparation guidance.' },
      { q: 'Which Atlanta neighborhoods and metro counties do you serve?', a: 'All of Greater Atlanta including Buckhead, Brookhaven, Sandy Springs, Dunwoody, Alpharetta, Roswell, Marietta, Decatur, East Atlanta, Inman Park, Virginia-Highland, Smyrna, Vinings, Peachtree Corners, Johns Creek, and rural North Georgia. We serve Fulton, DeKalb, Cobb, Gwinnett, Cherokee, Forsyth, Henry, and Clayton counties identically since instruction is fully online.' },
    ],
  },

  'phoenix-az': {
    name: 'Phoenix',
    state: 'arizona',
    metroPop: '5M metro residents · fastest-growing US metro',
    uniqueHook: 'Phoenix homeschoolers uniquely benefit from Arizona\'s ESA voucher ($7,000-8,000/child) PLUS Arizona\'s zero-paperwork homeschool law. Combined, this makes premium live online education essentially free for Phoenix families.',
    topUnis: ['ASU (Tempe)', 'Grand Canyon University', 'Embry-Riddle (Prescott)', 'University of Arizona (Tucson, 2hr)', 'NAU (Flagstaff, 2hr)', 'Arizona Christian University'],
    neighborhoods: ['Paradise Valley', 'Arcadia', 'Scottsdale', 'Chandler', 'Gilbert', 'Tempe', 'Mesa', 'Glendale', 'Peoria', 'Surprise', 'Goodyear', 'Anthem', 'Cave Creek', 'Carefree', 'Fountain Hills'],
    heroPhoto: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Phoenix families — fully ESA-eligible. Arizona\'s universal voucher ($7,000–8,000/year) covers Smartious tuition completely.',
    proof: 'Arizona is one of only 2 US states (with Florida) that offers a universal homeschool voucher. Phoenix families using ESA + Smartious essentially access premium international live education for free, while preserving every Arizona state freedom.',
    metaTitle: 'Online Homeschool Phoenix — ESA Voucher Eligible | Live Cambridge IGCSE & A-Level | Smartious',
    metaDesc: 'Live online homeschool for Phoenix families. Cambridge IGCSE and A-Level — fully covered by ESA voucher ($7,000-8,000/year/child). Built for ASU, U of A, Grand Canyon. From $180/month USD.',
    faqs: [
      { q: 'How does the Arizona ESA voucher pay for Smartious for Phoenix families?', a: 'Apply for ESA at azed.gov/esa (universal eligibility — no income or special-needs requirement). Upon approval (3-6 weeks), ClassWallet creates your digital wallet with $7,000–8,000. Smartious tuition ($180-540/month) is paid directly from ClassWallet under "online curriculum providers" or "tutoring services." Phoenix families typically use 30-90% of their ESA depending on tier — remaining funds cover textbooks, sports, technology, or rollover.' },
      { q: 'Does Smartious help Phoenix families apply to ASU and University of Arizona?', a: 'Yes. ASU, University of Arizona, Grand Canyon University, Northern Arizona University, and Embry-Riddle all accept Cambridge IGCSE and A-Level qualifications. ASU\'s Barrett Honors College and U of A\'s Honors College particularly value Cambridge A-Level rigour. We provide free Common App, Arizona-specific application support, and recommendation letters.' },
      { q: 'Which Phoenix metro neighborhoods and East Valley/West Valley areas do you serve?', a: 'All of Greater Phoenix including Paradise Valley, Arcadia, Scottsdale, Chandler, Gilbert, Tempe, Mesa, Glendale, Peoria, Surprise, Goodyear, Anthem, Cave Creek, Carefree, Fountain Hills, plus far West Valley (Buckeye, Litchfield Park) and far East Valley (Queen Creek, San Tan Valley, Apache Junction). Maricopa County families across all areas access identical service.' },
    ],
  },

  'nashville-tn': {
    name: 'Nashville',
    state: 'tennessee',
    metroPop: '2.1M metro residents',
    uniqueHook: 'Nashville\'s music industry families homeschool to accommodate touring schedules, recording sessions, late-night performances, and the unpredictable artistic lifestyle. Smartious classes flex with both performer schedules and producer studio time.',
    topUnis: ['Vanderbilt', 'Belmont (music)', 'Lipscomb', 'Tennessee State', 'MTSU (Murfreesboro)', 'University of the South (Sewanee, 1.5hr)'],
    neighborhoods: ['Belle Meade', 'Forest Hills', 'Green Hills', 'East Nashville', 'Germantown', 'Sylvan Park', 'Brentwood', 'Franklin', 'Spring Hill', 'Hendersonville', 'Mt. Juliet', 'Nolensville', 'Berry Hill'],
    heroPhoto: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Nashville families. Built for Vanderbilt, Belmont, and Ivy League applications. Preserves Tennessee Promise and HOPE Scholarship eligibility.',
    proof: 'Nashville\'s music families uniquely benefit from Smartious flexibility. Live morning classes finish by midday, leaving afternoons and evenings for rehearsals, sessions, and tours. Recorded sessions handle touring schedules. Tennessee Promise covers community college; Cambridge A-Level strengthens Vanderbilt and Belmont admissions.',
    metaTitle: 'Online Homeschool Nashville — Live Cambridge IGCSE & A-Level | Vanderbilt, Belmont | Smartious',
    metaDesc: 'Live online homeschool for Nashville families. Cambridge IGCSE and A-Level — flexible for music industry schedules. Built for Vanderbilt, Belmont, MTSU. Preserves TN Promise eligibility. From $180/month USD.',
    faqs: [
      { q: 'Can my Nashville child homeschool while on tour or in the recording studio?', a: 'Yes — this is core to our Nashville model. Live classes run 7 AM – 4 PM CT (most music work is afternoon/evening), all sessions are recorded for catch-up while touring, and your child remains academically synchronised regardless of where the tour bus is parked. Tennessee\'s Church-Related Umbrella school pathway (used by 60% of TN homeschoolers) provides minimal administrative burden during travel periods.' },
      { q: 'Does Smartious help Nashville families apply to Vanderbilt and Belmont?', a: 'Yes. Vanderbilt, Belmont, Lipscomb, MTSU, and Tennessee State all accept Cambridge IGCSE and A-Level qualifications. Vanderbilt particularly values Cambridge A-Level rigour. Belmont welcomes music-track homeschool students with strong academic credentials. We provide free Common App, Vanderbilt-specific application support, and recommendation letters.' },
      { q: 'Which Nashville neighborhoods and Williamson/Davidson County areas do you serve?', a: 'All of Greater Nashville including Belle Meade, Forest Hills, Green Hills, East Nashville, Germantown, Sylvan Park, plus Williamson County (Brentwood, Franklin, Spring Hill, Nolensville), Sumner County (Hendersonville, Gallatin), and Wilson County (Mt. Juliet, Lebanon). Smartious is fully online so any Middle Tennessee family from Murfreesboro to Clarksville accesses identical service.' },
    ],
  },

  'northern-virginia-va': {
    name: 'Northern Virginia',
    state: 'virginia',
    metroPop: '3M residents (Fairfax, Loudoun, Arlington, Prince William)',
    uniqueHook: 'Northern Virginia\'s federal employees, intelligence community professionals, contractors, and embassy families homeschool to handle security-clearance international postings, classified work schedules, and the DC metro\'s brutal commute that makes traditional school impractical.',
    topUnis: ['UVA (Charlottesville, 2hr)', 'Virginia Tech (3hr)', 'George Mason (Fairfax)', 'William & Mary (3hr)', 'JMU (2hr)', 'Georgetown (DC, 30min)', 'Johns Hopkins (Baltimore, 1hr)'],
    neighborhoods: ['McLean', 'Great Falls', 'Vienna', 'Falls Church', 'Reston', 'Herndon', 'Tysons', 'Arlington', 'Alexandria', 'Fairfax City', 'Burke', 'Springfield', 'Ashburn', 'Leesburg', 'Sterling', 'Manassas', 'Woodbridge'],
    heroPhoto: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Northern Virginia families. Built for UVA, William & Mary, Georgetown, Johns Hopkins, and Ivy League applications — designed for DC metro federal and embassy families.',
    proof: 'Northern Virginia has the highest concentration of homeschool families in Virginia — federal employees, defence contractors, embassy staff, and military families homeschool to handle international postings, classified work schedules, and to give children the academic depth that competitive Fairfax County schools also provide but with location and timing flexibility.',
    metaTitle: 'Online Homeschool Northern Virginia — Live Cambridge IGCSE & A-Level | UVA, Georgetown, Johns Hopkins | Smartious',
    metaDesc: 'Live online homeschool for Northern Virginia families (Fairfax, Loudoun, Arlington). Cambridge IGCSE and A-Level for DC metro federal, military, and embassy families. Built for UVA, William & Mary, Georgetown. From $180/month USD.',
    faqs: [
      { q: 'Can my Northern Virginia child homeschool while parents serve overseas with State Department or military?', a: 'Yes — overseas posting is a core Northern Virginia use case. Live classes run 8 AM – 5 PM ET. Embassy and overseas-posted families access recorded sessions on their host-country time zone while maintaining Virginia residency for university in-state tuition purposes. Virginia\'s Home Instruction Statute is fully compatible with overseas posting (Virginia residency rules treat federal/military overseas postings as continuing VA residence).' },
      { q: 'Does Smartious help Northern Virginia families apply to UVA, William & Mary, and Georgetown?', a: 'Yes. UVA, William & Mary, Virginia Tech, JMU, George Mason, Georgetown, and Johns Hopkins all accept Cambridge IGCSE and A-Level qualifications. UVA and William & Mary particularly value Cambridge A-Level rigour. We provide free Common App, UVA Echols/Jefferson Scholar application support, William & Mary Murray Scholar guidance, and recommendation letters.' },
      { q: 'Which Northern Virginia neighborhoods and DC metro counties do you serve?', a: 'All of Northern Virginia including Fairfax County (McLean, Great Falls, Vienna, Reston, Herndon, Tysons, Burke, Springfield, Fairfax City), Loudoun County (Ashburn, Leesburg, Sterling, Purcellville), Arlington County, City of Alexandria, and Prince William County (Manassas, Woodbridge). Plus DC and Maryland border families — Smartious works across state lines since we are fully online.' },
    ],
  },

  'philadelphia-pa': {
    name: 'Philadelphia',
    state: 'pennsylvania',
    metroPop: '6.2M metro residents',
    uniqueHook: 'Philadelphia families navigate Pennsylvania\'s heavy Act 169 paperwork burden — Smartious is uniquely valuable here because our quarterly progress reports, transcripts, and graded coursework give Philadelphia families exactly the portfolio documentation PA\'s annual evaluator requires.',
    topUnis: ['UPenn (Ivy League)', 'Drexel', 'Temple', 'Villanova', 'Saint Joseph\'s', 'La Salle', 'Bryn Mawr', 'Haverford', 'Swarthmore'],
    neighborhoods: ['Center City', 'Rittenhouse Square', 'Society Hill', 'Old City', 'Fairmount', 'Manayunk', 'Chestnut Hill', 'Mt. Airy', 'University City', 'Main Line (Bryn Mawr, Wayne, Ardmore)', 'Bucks County (Doylestown, Newtown)', 'Montgomery County', 'Cherry Hill (NJ)'],
    heroPhoto: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Philadelphia families. Simplifies Pennsylvania Act 169 portfolio compliance. Built for UPenn, Villanova, Drexel, and the Tri-State elite liberal arts colleges.',
    proof: 'Philadelphia families face the heaviest homeschool paperwork in the US (PA Act 169) — but Smartious turns this burden into an advantage. Our detailed transcripts and Cambridge-graded coursework produce some of the strongest UPenn and Bryn Mawr applications in America.',
    metaTitle: 'Online Homeschool Philadelphia — Act 169 Compatible | Live Cambridge IGCSE & A-Level | UPenn | Smartious',
    metaDesc: 'Live online homeschool for Philadelphia families. Cambridge IGCSE and A-Level with full Act 169 portfolio support. Built for UPenn, Villanova, Drexel, Bryn Mawr, Haverford, Swarthmore. From $180/month USD.',
    faqs: [
      { q: 'How does Smartious work with Pennsylvania Act 169 for Philadelphia families?', a: 'PA Act 169 requires a notarised affidavit, portfolio of work, annual evaluator letter, and standardised testing in grades 3, 5, 8. Smartious provides graded coursework, quarterly progress reports, attendance logs, and certified transcripts — exactly the portfolio evidence PA\'s certified evaluators expect. Philadelphia families typically work with evaluators recommended by Pennsylvania Homeschoolers (PHAA) or PHEN.' },
      { q: 'Does Smartious help Philadelphia families apply to UPenn and the Quaker colleges?', a: 'Yes. UPenn (Ivy League), Drexel, Temple, Villanova, Bryn Mawr, Haverford, and Swarthmore all accept Cambridge IGCSE and A-Level qualifications. UPenn particularly values Cambridge A-Level rigour. We provide free Common App, UPenn Wharton/Engineering application support, and Tri-College Consortium application guidance.' },
      { q: 'Which Philadelphia neighborhoods and Main Line areas do you serve?', a: 'All of Greater Philadelphia including Center City (Rittenhouse Square, Society Hill, Old City, Fairmount), University City, Manayunk, Chestnut Hill, Mt. Airy, plus the Main Line (Bryn Mawr, Ardmore, Wayne, Villanova, St. Davids, Radnor), Bucks County (Doylestown, Newtown, Yardley), Montgomery County, Delaware County, and South Jersey (Cherry Hill, Voorhees, Moorestown). Note: South Jersey families follow New Jersey homeschool law, not Pennsylvania.' },
    ],
  },

  'columbus-oh': {
    name: 'Columbus',
    state: 'ohio',
    metroPop: '2.2M metro residents · Ohio\'s fastest-growing metro',
    uniqueHook: 'Columbus tech corridor families (Intel\'s $20B chip facility, JPMorgan Chase, Nationwide HQ, Ohio State research ecosystem) homeschool to give children academic acceleration. Combined with Ohio College Credit Plus — FREE dual-enrollment at Ohio State — Columbus has one of America\'s strongest homeschool-to-elite-university pathways.',
    topUnis: ['Ohio State University', 'Case Western Reserve (2hr north)', 'University of Cincinnati (1.5hr)', 'Miami University (2hr)', 'Ohio University (Athens, 1hr)', 'Otterbein', 'Capital University'],
    neighborhoods: ['Upper Arlington', 'Bexley', 'New Albany', 'Worthington', 'Dublin', 'Powell', 'Westerville', 'Hilliard', 'Grove City', 'Pickerington', 'Gahanna', 'Reynoldsburg', 'German Village', 'Short North', 'Clintonville'],
    heroPhoto: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Columbus families. Stacks with Ohio College Credit Plus — free dual-enrollment at Ohio State. Built for OSU, Case Western, Miami University.',
    proof: 'Columbus families pair Smartious Cambridge IGCSE/A-Level (international rigour for elite admissions) with Ohio\'s College Credit Plus programme (FREE dual-enrollment at Ohio State for homeschoolers aged 13+) — combining international academic depth with American college credit acceleration in a way uniquely possible in Ohio.',
    metaTitle: 'Online Homeschool Columbus Ohio — Live Cambridge IGCSE & A-Level | Ohio State, Case Western | Smartious',
    metaDesc: 'Live online homeschool for Columbus families. Cambridge IGCSE and A-Level — stacks with Ohio College Credit Plus dual-enrollment at OSU. Built for Ohio State, Case Western, Miami University. From $180/month USD.',
    faqs: [
      { q: 'How does Smartious work with Ohio\'s Notification Option for Columbus families?', a: 'Ohio requires annual Notification of Intent to your local school district plus one annual academic assessment (standardised test, certified teacher review, or alternative). Smartious provides transcripts, graded coursework, and assessment documentation that satisfies Columbus City Schools, Dublin City Schools, Olentangy Local, Westerville City Schools, and surrounding district requirements. Religious families can alternatively use Ohio\'s "08 school" pathway.' },
      { q: 'Can my Columbus child combine Smartious with Ohio College Credit Plus at Ohio State?', a: 'Yes — and this is one of the strongest pairings available in any US state. Ohio College Credit Plus lets homeschool students aged 13+ take FREE college courses at Ohio State, Ohio State Newark/Marion/Lima/Mansfield, Columbus State Community College, and all Ohio public universities. We coordinate scheduling so your child does Cambridge IGCSE/A-Level core subjects with Smartious while accumulating free Ohio State credits in electives. Many Columbus homeschool graduates enter OSU with 30+ free college credits already earned.' },
      { q: 'Which Columbus neighborhoods and Central Ohio counties do you serve?', a: 'All of Greater Columbus including Upper Arlington, Bexley, New Albany, Worthington, Dublin, Powell, Westerville, Hilliard, Grove City, Pickerington, Gahanna, German Village, Short North, Clintonville, plus Franklin, Delaware, Licking, Fairfield, Pickaway, and Madison counties. We serve all districts identically since Smartious is fully online.' },
    ],
  },
}

export const US_CITIES_LIST = Object.keys(US_CITIES)

// Reverse index: state slug → array of city slugs in that state
export const US_CITIES_BY_STATE = US_CITIES_LIST.reduce((acc, slug) => {
  const c = US_CITIES[slug]
  if (!acc[c.state]) acc[c.state] = []
  acc[c.state].push(slug)
  return acc
}, {})
