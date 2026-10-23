/**
 * spineKiswahili.js — Kiswahili spines for every Cambridge and Edexcel stage.
 *
 * Cambridge and Pearson Edexcel publish no Kiswahili framework for Primary,
 * Lower Secondary or A Level (Cambridge IGCSE Swahili 0262 is the only
 * board syllabus, and it lives with the IGCSE spines). These are Smartious
 * schemes, built so Kiswahili runs as one continuous course:
 *
 *   Primary (Stages / Years 1-6)       — shared by Cambridge Primary and Edexcel iPrimary
 *   Lower Secondary (Stages 7-9)       — shared by Cambridge and Edexcel Lower Secondary
 *   IGCSE                              — Cambridge 0262 (spineData.js), both boards
 *   A Level (AS and A2)                — shared by Cambridge A Level and Edexcel IAL
 *
 * Each strand follows the same skills every stage: Kusikiliza na Kuzungumza
 * (listening and speaking), Kusoma (reading), Kuandika (writing), Sarufi
 * (grammar) and, from Stage 4, Fasihi (literature). Each subtopic is one
 * teachable topic with a suggested number of lessons (Primary 2, Lower
 * Secondary and A Level 3), giving roughly 35-80 lessons a year.
 * Topic names give the Kiswahili with an English gloss.
 */

// Build topics from compact lists: [topic, code, [lesson names]].
const build = (rows, perTopic) => rows.map(([topic, code, lessons]) => ({
  topic, code,
  subtopics: lessons.map((name, i) => ({ name, code: `${code}.${i + 1}`, suggestedLessons: perTopic })),
}))

// ── PRIMARY: Stages / Years 1-6 ─────────────────────────────────────
export const KISWAHILI_PRIMARY = build([
  // Stage 1
  ['Stage 1 · Kusikiliza na Kuzungumza (Listening & Speaking)', 'S1-KK', [
    'Salamu: Jambo, Habari, Shikamoo (Greetings and polite replies)',
    'Kujitambulisha: Jina langu ni… (Saying my name)',
    'Familia yangu: mama, baba, dada, kaka (My family)',
    'Nyimbo na michezo ya watoto (Children\'s songs and action games)',
    'Kufuata maagizo mafupi: simama, keti, njoo (Simple classroom instructions)',
    'Rangi na maumbo (Colours and shapes)',
  ]],
  ['Stage 1 · Kusoma (Reading)', 'S1-KS', [
    'Irabu: a, e, i, o, u (The five vowels)',
    'Silabi za konsonanti na irabu: ba be bi bo bu (Consonant-vowel syllables)',
    'Kusoma maneno ya silabi mbili (Reading two-syllable words)',
    'Kusoma sentensi fupi kwa picha (Short sentences with pictures)',
  ]],
  ['Stage 1 · Kuandika (Writing)', 'S1-KA', [
    'Kuandika herufi ndogo na kubwa (Forming small and capital letters)',
    'Kuandika silabi na maneno mafupi (Writing syllables and short words)',
    'Kunakili sentensi fupi (Copying short sentences)',
  ]],
  ['Stage 1 · Msamiati na Sarufi (Vocabulary & Grammar)', 'S1-MS', [
    'Hesabu: moja hadi kumi (Numbers 1-10)',
    'Sehemu za mwili (Parts of the body)',
    'Wanyama wa nyumbani (Animals at home)',
    'Umoja na wingi: mtoto/watoto (Singular and plural, M-WA class)',
    'Kiamsha kinywa na vyakula (Breakfast and food words)',
  ]],
  // Stage 2
  ['Stage 2 · Kusikiliza na Kuzungumza (Listening & Speaking)', 'S2-KK', [
    'Kuuliza na kujibu maswali: nani? nini? wapi? (Who? What? Where?)',
    'Shuleni kwetu: darasa na walimu (Our school)',
    'Siku za wiki na majira (Days of the week and seasons)',
    'Kusimulia hadithi fupi kwa picha (Retelling a picture story)',
    'Mazungumzo dukani (A conversation at the shop)',
  ]],
  ['Stage 2 · Kusoma (Reading)', 'S2-KS', [
    'Silabi changamano: ng\', ny, ch, sh (Digraph syllables)',
    'Kusoma kwa sauti na kwa ufasaha (Reading aloud fluently)',
    'Ufahamu wa hadithi fupi (Understanding a short story)',
    'Kusoma mashairi mafupi ya watoto (Short children\'s poems)',
  ]],
  ['Stage 2 · Kuandika (Writing)', 'S2-KA', [
    'Kuandika sentensi kamili kwa nukta (Full sentences with full stops)',
    'Kuandika kuhusu familia yangu (Writing about my family)',
    'Kuandika orodha na kadi ya salamu (Lists and a greeting card)',
  ]],
  ['Stage 2 · Msamiati na Sarufi (Vocabulary & Grammar)', 'S2-MS', [
    'Hesabu: kumi na moja hadi ishirini (Numbers 11-20)',
    'Ngeli ya KI-VI: kitabu/vitabu (KI-VI noun class)',
    'Vitenzi vya kila siku: kula, kunywa, kucheza (Everyday verbs)',
    'Wakati uliopo: ninasoma, unasoma (Present tense)',
    'Vivumishi vya rangi na ukubwa (Adjectives of colour and size)',
  ]],
  // Stage 3
  ['Stage 3 · Kusikiliza na Kuzungumza (Listening & Speaking)', 'S3-KK', [
    'Kueleza ratiba yangu ya siku (Describing my daily routine)',
    'Kuelekeza njia: kulia, kushoto, moja kwa moja (Giving directions)',
    'Maigizo mafupi: sokoni na hospitalini (Role play: market and clinic)',
    'Methali rahisi na maana zake (Simple proverbs and their meaning)',
    'Kusikiliza na kujibu habari fupi (Listening to a short news item)',
  ]],
  ['Stage 3 · Kusoma (Reading)', 'S3-KS', [
    'Ufahamu: kutafuta habari muhimu (Finding key information)',
    'Kusoma hadithi za wanyama (Animal fables)',
    'Kusoma maagizo na matangazo (Reading instructions and notices)',
    'Kamusi: kutafuta maneno kwa alfabeti (Using a dictionary)',
  ]],
  ['Stage 3 · Kuandika (Writing)', 'S3-KA', [
    'Kuandika aya fupi kuhusu shule (A short paragraph about school)',
    'Barua fupi kwa rafiki (A short letter to a friend)',
    'Kuandika hadithi fupi yenye mwanzo, kati na mwisho (A story with a beginning, middle and end)',
  ]],
  ['Stage 3 · Msamiati na Sarufi (Vocabulary & Grammar)', 'S3-MS', [
    'Ngeli ya N-N: ndizi, nyumba (N-N noun class)',
    'Ngeli ya LI-YA: tunda/matunda (LI-YA noun class)',
    'Wakati uliopita: nilisoma, tulicheza (Past tense)',
    'Wakati ujao: nitasoma (Future tense)',
    'Viunganishi: na, lakini, kwa sababu (Joining words)',
    'Saa na wakati: saa ngapi? (Telling the time in Swahili time)',
  ]],
  // Stage 4
  ['Stage 4 · Kusikiliza na Kuzungumza (Listening & Speaking)', 'S4-KK', [
    'Kujadili mada darasani (Class discussion on a topic)',
    'Kutoa maoni na sababu (Giving opinions with reasons)',
    'Vitendawili: kutega na kutegua (Riddles)',
    'Mahojiano mafupi (Short interviews)',
  ]],
  ['Stage 4 · Kusoma (Reading)', 'S4-KS', [
    'Ufahamu wa makala fupi (Understanding a short article)',
    'Kubainisha wazo kuu (Identifying the main idea)',
    'Kusoma kwa kina na kwa mapana (Intensive and extensive reading)',
  ]],
  ['Stage 4 · Kuandika (Writing)', 'S4-KA', [
    'Insha ya maelezo: siku yangu bora (Descriptive composition)',
    'Barua ya kirafiki yenye anwani na tarehe (Friendly letter format)',
    'Kuandika muhtasari mfupi (A short summary)',
    'Uakifishaji: koma, alama ya kuuliza na ya mshangao (Punctuation)',
  ]],
  ['Stage 4 · Sarufi (Grammar)', 'S4-SA', [
    'Ngeli ya U-I: mti/miti (U-I noun class)',
    'Ngeli ya U-ZI: ukuta/kuta (U-ZI noun class)',
    'Viambishi vya nafsi: ni-, u-, a-, tu-, m-, wa- (Subject prefixes)',
    'Kukanusha: sisomi, hukusoma (Negative forms)',
    'Vivumishi vya idadi na vya kumiliki (Number and possessive adjectives)',
  ]],
  ['Stage 4 · Fasihi (Literature)', 'S4-FA', [
    'Hadithi za fasihi simulizi (Oral literature: folk tales)',
    'Methali na nahau rahisi (Proverbs and simple idioms)',
  ]],
  // Stage 5
  ['Stage 5 · Kusikiliza na Kuzungumza (Listening & Speaking)', 'S5-KK', [
    'Hotuba fupi mbele ya darasa (A short speech to the class)',
    'Mjadala: hoja za kuunga na kupinga (Debate: for and against)',
    'Kusikiliza taarifa na kujibu maswali (Listening to a report)',
    'Lugha ya adabu na heshima (Polite and respectful language)',
  ]],
  ['Stage 5 · Kusoma (Reading)', 'S5-KS', [
    'Ufahamu: maswali ya maana na makisio (Inference questions)',
    'Kusoma kitabu cha hadithi na kujadili (Class reader and discussion)',
    'Kusoma ratiba, jedwali na grafu rahisi (Reading tables and simple charts)',
  ]],
  ['Stage 5 · Kuandika (Writing)', 'S5-KA', [
    'Insha ya masimulizi (Narrative composition)',
    'Barua rasmi fupi (A short formal letter)',
    'Kuandika tangazo na mwaliko (Notices and invitations)',
    'Kuhariri na kusahihisha kazi (Editing and proofreading)',
  ]],
  ['Stage 5 · Sarufi (Grammar)', 'S5-SA', [
    'Ngeli ya KU na ngeli ya mahali PA-KU-MU (KU and place classes)',
    'Ukubwa na udogo wa nomino: jitu, kijitu (Augmentatives and diminutives)',
    'Mnyambuliko wa vitenzi: -ia, -ika, -isha (Verb extensions)',
    'Wakati timilifu: nimesoma (Perfect tense -me-)',
    'Vielezi vya namna, mahali na wakati (Adverbs)',
  ]],
  ['Stage 5 · Fasihi (Literature)', 'S5-FA', [
    'Mashairi: beti, mistari na vina (Poems: verses, lines and rhyme)',
    'Hadithi fupi: wahusika na mandhari (Short story: characters and setting)',
  ]],
  // Stage 6
  ['Stage 6 · Kusikiliza na Kuzungumza (Listening & Speaking)', 'S6-KK', [
    'Mawasilisho ya mradi (Presenting a project)',
    'Kusimulia tukio kwa mpangilio (Recounting an event in order)',
    'Mazungumzo rasmi na yasiyo rasmi (Formal and informal speech)',
  ]],
  ['Stage 6 · Kusoma (Reading)', 'S6-KS', [
    'Ufahamu wa makala ya habari (Understanding a news article)',
    'Kulinganisha maandishi mawili (Comparing two texts)',
    'Msamiati kutokana na muktadha (Vocabulary from context)',
  ]],
  ['Stage 6 · Kuandika (Writing)', 'S6-KA', [
    'Insha ya hoja: faida na hasara (Argument composition)',
    'Ripoti fupi ya tukio la shule (A short school report)',
    'Shajara na blogu (Diary and blog writing)',
    'Muhtasari wa kifungu (Summarising a passage)',
  ]],
  ['Stage 6 · Sarufi (Grammar)', 'S6-SA', [
    'Ngeli zote: marudio na mazoezi (All noun classes: review)',
    'Kirejeshi -o-: kitabu ambacho / kitabu nilichosoma (Relative markers)',
    'Kauli ya kutendwa: kitabu kilisomwa (Passive voice)',
    'Masharti: nikisoma, ningesoma (Conditional -ki-, -nge-)',
    'Usemi halisi na usemi wa taarifa (Direct and reported speech)',
  ]],
  ['Stage 6 · Fasihi (Literature)', 'S6-FA', [
    'Tamthilia fupi: kuigiza (Short play: performance)',
    'Methali, nahau na misemo katika maandishi (Proverbs and idioms in writing)',
    'Maandalizi ya mpito kwenda Sekondari ya Chini (Bridge to Lower Secondary)',
  ]],
], 2)

// ── LOWER SECONDARY: Stages / Years 7-9 ─────────────────────────────
export const KISWAHILI_LOWER_SECONDARY = build([
  // Stage 7
  ['S7 · Mawasiliano (Communication)', 'S7-MW', [
    'Kujitambulisha kwa kina na kueleza mambo ninayopenda (Self and interests)',
    'Mazungumzo ya simu na ujumbe mfupi (Phone calls and text messages)',
    'Kujadili kwa heshima darasani (Respectful class discussion)',
    'Hotuba fupi: siku ya michezo (A short speech)',
  ]],
  ['S7 · Ufahamu (Comprehension)', 'S7-UF', [
    'Ufahamu wa hadithi: wahusika na matukio (Story comprehension)',
    'Ufahamu wa makala: ukweli na maoni (Fact and opinion)',
    'Kubainisha msamiati mpya kwa muktadha (New words in context)',
  ]],
  ['S7 · Uandishi (Writing)', 'S7-UA', [
    'Insha ya maelezo: mahali ninapopapenda (Descriptive essay)',
    'Barua ya kirafiki na barua pepe (Friendly letter and email)',
    'Kumbukumbu za mkutano wa klabu (Club meeting minutes)',
    'Muhtasari: kupunguza maneno bila kupoteza maana (Summary skills)',
  ]],
  ['S7 · Sarufi (Grammar)', 'S7-SA', [
    'Aina za maneno: nomino, kitenzi, kivumishi, kielezi (Parts of speech)',
    'Ngeli na upatanisho wa kisarufi (Noun classes and agreement)',
    'Nyakati: -na-, -li-, -ta-, -me- na hali ya mazoea hu- (Tenses and habitual)',
    'Viambishi awali na tamati (Prefixes and suffixes)',
    'Sentensi sahili na ambatano (Simple and compound sentences)',
  ]],
  ['S7 · Fasihi (Literature)', 'S7-FA', [
    'Fasihi simulizi: hadithi, ngano na visasili (Oral literature genres)',
    'Ushairi: arudhi za shairi la kimapokeo (Traditional poem structure)',
    'Kusoma riwaya fupi ya darasa (Class novella: part 1)',
  ]],
  // Stage 8
  ['S8 · Mawasiliano (Communication)', 'S8-MW', [
    'Mjadala rasmi: kanuni na hoja (Formal debate)',
    'Mahojiano: kuuliza na kujibu kwa kina (Interviews)',
    'Lugha ya mazingira tofauti: sokoni, ofisini, shuleni (Register)',
    'Kutoa maelekezo na maelezo ya hatua (Instructions and processes)',
  ]],
  ['S8 · Ufahamu (Comprehension)', 'S8-UF', [
    'Ufahamu wa tamthilia (Understanding a play)',
    'Kubainisha mtazamo na lengo la mwandishi (Writer\'s view and purpose)',
    'Ufahamu wa matini ya vyombo vya habari (Media texts)',
  ]],
  ['S8 · Uandishi (Writing)', 'S8-UA', [
    'Insha ya hoja: kushawishi msomaji (Persuasive essay)',
    'Barua rasmi: maombi na malalamiko (Formal letters: application and complaint)',
    'Hotuba ya kuandikwa (Writing a speech)',
    'Ripoti: muundo na lugha (Report writing)',
  ]],
  ['S8 · Sarufi (Grammar)', 'S8-SA', [
    'Mnyambuliko: kauli za kutendea, kutendeka, kutendesha, kutendana (Verb derivations)',
    'Virejeshi: amba- na -o- kati na tamati (Relatives)',
    'Kauli ya kutendwa na ya kutenda (Active and passive)',
    'Sentensi changamano (Complex sentences)',
    'Matumizi ya "ndi-" na "si" (Copula and its negative)',
  ]],
  ['S8 · Fasihi (Literature)', 'S8-FA', [
    'Riwaya fupi: dhamira na maudhui (Novella: theme and message)',
    'Tamathali za usemi: tashbihi, sitiari, tashihisi (Figures of speech)',
    'Mashairi huru na ya kimapokeo (Free and traditional verse)',
  ]],
  // Stage 9
  ['S9 · Mawasiliano (Communication)', 'S9-MW', [
    'Mawasilisho ya utafiti mdogo (Presenting a small research project)',
    'Kujadili masuala ya kijamii: mazingira, teknolojia (Social issues)',
    'Mazungumzo ya mtihani wa kuzungumza (Speaking test practice)',
  ]],
  ['S9 · Ufahamu (Comprehension)', 'S9-UF', [
    'Ufahamu wa kina: makisio na tathmini (Inference and evaluation)',
    'Kulinganisha matini mbili kuhusu mada moja (Comparing texts)',
    'Ufahamu wa kusikiliza: rekodi za redio (Listening: radio recordings)',
  ]],
  ['S9 · Uandishi (Writing)', 'S9-UA', [
    'Insha ya kubuni: kujenga wahusika na mvutano (Creative writing)',
    'Tahariri na makala ya gazeti (Editorials and articles)',
    'Uandishi wa kimtihani: kupanga muda na rasimu (Writing under time)',
    'Muhtasari wa kimtihani (Exam-style summary)',
  ]],
  ['S9 · Sarufi (Grammar)', 'S9-SA', [
    'Uchanganuzi wa sentensi: kiima na kiarifu (Sentence analysis)',
    'Ngeli: marudio ya kina na makosa ya kawaida (Noun class review and common errors)',
    'Usemi wa taarifa: mabadiliko ya nyakati (Reported speech)',
    'Msamiati wa kitaaluma na istilahi (Academic vocabulary and terms)',
  ]],
  ['S9 · Fasihi (Literature)', 'S9-FA', [
    'Tamthilia: wahusika na mbinu za kisanaa (Drama: characters and techniques)',
    'Hadithi fupi teule: uchambuzi (Selected short stories: analysis)',
    'Daraja kuelekea IGCSE Swahili 0262 (Bridge to IGCSE)',
  ]],
], 3)

// ── A LEVEL: AS and A2 ──────────────────────────────────────────────
export const KISWAHILI_A_LEVEL = build([
  // AS
  ['AS · Lugha na Jamii (Language and Society)', 'AS-LJ', [
    'Historia ya Kiswahili na kuenea kwake Afrika Mashariki (History and spread of Swahili)',
    'Kiswahili kama lugha ya taifa na lugha rasmi (National and official language)',
    'Lahaja za Kiswahili: Kiunguja, Kimvita, Kiamu (Dialects)',
    'Sheng na lugha ya vijana (Sheng and youth language)',
    'Kiswahili katika vyombo vya habari na teknolojia (Media and technology)',
    'Kiswahili katika elimu na siasa (Education and politics)',
  ]],
  ['AS · Isimu na Sarufi (Linguistics and Grammar)', 'AS-IS', [
    'Fonolojia: sauti za Kiswahili, irabu na konsonanti (Phonology)',
    'Silabi na mkazo (Syllable structure and stress)',
    'Mofolojia: mofimu, viambishi na mzizi (Morphology)',
    'Ngeli: misingi ya kisemantiki na kisintaksia (Noun classes: semantic and syntactic)',
    'Mnyambuliko wa vitenzi kwa kina (Verb extensions in depth)',
    'Sintaksia: aina za sentensi na vishazi (Syntax: sentences and clauses)',
    'Uchanganuzi wa sentensi kwa michoro ya matawi (Tree diagrams)',
  ]],
  ['AS · Ufahamu na Ufupisho (Comprehension and Summary)', 'AS-UF', [
    'Ufahamu wa matini za kitaaluma (Academic texts)',
    'Ufupisho: kanuni na mazoezi (Summary: rules and practice)',
    'Tafsiri: Kiingereza hadi Kiswahili (Translation into Swahili)',
    'Tafsiri: Kiswahili hadi Kiingereza (Translation into English)',
  ]],
  ['AS · Uandishi (Writing)', 'AS-UA', [
    'Insha ya hoja ya kitaaluma (Discursive essay)',
    'Insha ya kubuni yenye mbinu za kisanaa (Creative essay)',
    'Uandishi wa kiofisi: barua, kumbukumbu, ripoti (Functional writing)',
    'Uakifishaji na mtindo (Punctuation and style)',
  ]],
  ['AS · Fasihi Simulizi (Oral Literature)', 'AS-FS', [
    'Dhana na sifa za fasihi simulizi (Concept and features)',
    'Tanzu: hadithi, semi, ushairi simulizi, maigizo (Genres)',
    'Methali, nahau, vitendawili na misemo (Short forms)',
    'Ukusanyaji wa fasihi simulizi uwandani (Fieldwork collection)',
  ]],
  ['AS · Fasihi Andishi: Riwaya (The Novel)', 'AS-RW', [
    'Muundo na mtindo wa riwaya teule (Structure and style)',
    'Dhamira na maudhui (Themes)',
    'Wahusika na uhusika (Characters and characterisation)',
    'Mbinu za kisanaa katika riwaya (Literary techniques)',
    'Kuandika insha ya uchambuzi wa riwaya (Writing a literary essay)',
  ]],
  ['AS · Mazungumzo (Oral Skills)', 'AS-MZ', [
    'Kuwasilisha mada ya utafiti (Presenting a researched topic)',
    'Majadiliano ya masuala ya kisasa (Discussing current issues)',
    'Mazoezi ya mtihani wa mazungumzo (Speaking test practice)',
  ]],
  // A2
  ['A2 · Isimujamii na Isimu Tumizi (Sociolinguistics)', 'A2-IJ', [
    'Uwililugha na wingilugha Afrika Mashariki (Bilingualism and multilingualism)',
    'Kuchanganya na kubadili msimbo (Code-mixing and switching)',
    'Usanifishaji na ukuzaji wa Kiswahili: BAKITA na BAKIKE (Standardisation)',
    'Istilahi na uundaji wa maneno mapya (Terminology and coinage)',
    'Kiswahili kimataifa: Umoja wa Afrika na diaspora (Swahili internationally)',
  ]],
  ['A2 · Isimu ya Juu (Advanced Linguistics)', 'A2-IS', [
    'Semantiki: maana, visawe, vinyume na utata (Semantics)',
    'Pragmatiki: muktadha na matumizi ya lugha (Pragmatics)',
    'Uchanganuzi wa matini (Discourse analysis)',
    'Makosa ya kisarufi na urekebishaji (Error analysis)',
  ]],
  ['A2 · Tafsiri na Ukalimani (Translation and Interpreting)', 'A2-TF', [
    'Nadharia na mbinu za tafsiri (Translation theory and methods)',
    'Tafsiri ya matini za kitaalamu (Specialist texts)',
    'Tafsiri ya kifasihi: methali na mashairi (Literary translation)',
    'Ukalimani: misingi na mazoezi (Interpreting basics)',
  ]],
  ['A2 · Fasihi Andishi: Tamthilia (Drama)', 'A2-TM', [
    'Muundo wa tamthilia teule: maonyesho na matendo (Structure)',
    'Dhamira na migogoro (Themes and conflicts)',
    'Wahusika na mbinu za kitamthilia (Characters and dramatic devices)',
    'Uigizaji na tafsiri ya jukwaani (Performance and staging)',
  ]],
  ['A2 · Fasihi Andishi: Ushairi (Poetry)', 'A2-US', [
    'Ushairi wa kimapokeo: arudhi, vina na mizani (Traditional prosody)',
    'Ushairi huru na mabadiliko yake (Free verse)',
    'Kuchambua shairi: maudhui, muundo na mtindo (Poem analysis)',
    'Washairi teule wa Afrika Mashariki (Selected East African poets)',
  ]],
  ['A2 · Fasihi Andishi: Hadithi Fupi (Short Stories)', 'A2-HF', [
    'Diwani teule ya hadithi fupi: uchambuzi (Selected anthology)',
    'Ulinganisho wa hadithi mbili (Comparing two stories)',
  ]],
  ['A2 · Nadharia ya Fasihi (Literary Theory)', 'A2-NF', [
    'Uhalisia, Umarx na Ufeministi (Realism, Marxism and Feminism)',
    'Ubaada-ukoloni katika fasihi ya Kiswahili (Postcolonial reading)',
    'Kutumia nadharia katika insha ya fasihi (Applying theory in essays)',
  ]],
  ['A2 · Utafiti na Mtihani (Research and Examination)', 'A2-UM', [
    'Mradi wa utafiti: kuchagua mada na mbinu (Research project: topic and method)',
    'Kuandika ripoti ya utafiti (Writing the research report)',
    'Mbinu za kujibu maswali ya mtihani (Exam technique)',
    'Marudio ya jumla na mitihani ya majaribio (Revision and mock papers)',
  ]],
], 3)

const count = (s) => s.reduce((n, t) => n + t.subtopics.reduce((m, x) => m + x.suggestedLessons, 0), 0)
export const KISWAHILI_SOURCES = {
  primary: `Smartious Kiswahili — ${count(KISWAHILI_PRIMARY)}-lesson scheme (Stages / Years 1-6; school-designed, no board framework)`,
  lowerSec: `Smartious Kiswahili — ${count(KISWAHILI_LOWER_SECONDARY)}-lesson scheme (Stages / Years 7-9; school-designed, no board framework)`,
  aLevel: `Smartious Kiswahili — ${count(KISWAHILI_A_LEVEL)}-lesson scheme (AS and A2; school-designed, no board syllabus)`,
}
export const KISWAHILI_MATCH = /\b(swahili|kiswahili)\b/i
