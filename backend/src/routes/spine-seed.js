/**
 * routes/spine-seed.js
 * Seeds / rebuilds the SyllabusTopic spine for a subject.
 * Mounted at /api/spine-seed
 *
 * GET  /api/spine-seed             — list available built-in spines
 * POST /api/spine-seed/:key        — rebuild that spine for all its curricula
 *
 * A spine is: Subject -> SyllabusTopic[] (modules) -> subtopics[] (lessons).
 * One subtopic == one ~1-hour lesson, so subtopic count == lesson count.
 */
const express       = require('express')
const router        = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const Subject       = require('../models/Subject')
const SyllabusTopic = require('../models/SyllabusTopic')

const ok   = (res,data,msg) => res.json({ success:true, data, message:msg||'' })
const fail = (res,code,msg) => res.status(code).json({ success:false, message:msg })

// ── GET / — list built-in spines ────────────────────
router.get('/', auth, (req, res) => {
  const list = Object.entries(SPINES).map(([key, s]) => ({
    key,
    subjectName: s.subjectName,
    curricula:   s.curricula,
    source:      s.sourceSyllabus,
    topics:      s.topics.length,
    lessons:     s.topics.reduce((n,t)=>n+t.lessons.length, 0),
  }))
  return ok(res, { spines: list })
})

// ── POST /:key — rebuild spine ──────────────────────
router.post('/:key', auth, requireRole('admin','ops_manager','dos'), async (req, res) => {
  try {
    const spec = SPINES[req.params.key]
    if (!spec) return fail(res, 404, 'No built-in spine named "'+req.params.key+'".')

    const results = []
    for (const curriculum of spec.curricula) {
      // Exact-ish match, regex-escaped, tolerant of '&' vs 'and' drift
      const esc = spec.subjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp('^'+esc.replace(/\s*&\s*/g, '\\s*(?:&|and)\\s*')+'$', 'i')
      const matches = await Subject.find({ subjectName: pattern, curriculum }).lean()

      if (matches.length === 0) {
        const available = await Subject.find({ curriculum }).select('subjectName').lean()
        results.push({
          curriculum, ok:false,
          message:`Subject "${spec.subjectName}" not found for ${curriculum}. `
            + (available.length
                ? `${available.length} subjects exist for this curriculum — check the exact name.`
                : `No subjects at all for ${curriculum}. Seed subjects first.`),
        })
        continue
      }
      if (matches.length > 1) {
        results.push({
          curriculum, ok:false,
          message:`Ambiguous: ${matches.length} subjects match "${spec.subjectName}" for ${curriculum} (${matches.map(m=>m.subjectName).join(', ')}). Remove the duplicate first.`,
        })
        continue
      }
      const subject = matches[0]

      // Rebuild: clear the old spine for this subject
      const removed = await SyllabusTopic.deleteMany({ subjectId: subject._id })

      let topicOrder = 0, lessonTotal = 0
      for (const t of spec.topics) {
        const subtopics = t.lessons.map((name, i) => ({
          name,
          code: String(t.firstLesson + i).padStart(3,'0'),
          subOrder: i,
          suggestedLessons: 1,
          objectives: [],
        }))
        lessonTotal += subtopics.length
        await SyllabusTopic.create({
          subjectId:   subject._id,
          curriculum,
          subjectName: subject.subjectName,
          topic:       t.topic,
          code:        t.code,
          topicOrder:  topicOrder++,
          subtopics,
          sourceSyllabus: spec.sourceSyllabus,
          isActive:    true,
        })
      }

      results.push({
        curriculum, ok:true,
        subjectName: subject.subjectName,
        subjectId: String(subject._id),
        removed: removed.deletedCount || 0,
        topics:  spec.topics.length,
        lessons: lessonTotal,
      })
    }

    const good = results.filter(r=>r.ok)
    const msg  = good.length
      ? `Rebuilt ${spec.subjectName} spine for ${good.map(r=>r.curriculum).join(', ')} — ${good[0].topics} topics, ${good[0].lessons} lessons each.`
      : 'No spine written. ' + results.map(r=>r.message).join(' ')
    return ok(res, { results }, msg)
  } catch(e) {
    console.error('[spine-seed]', e.message)
    return fail(res, 500, e.message)
  }
})

module.exports = router

// ════════════════════════════════════════════════════
// BUILT-IN SPINES
// Cambridge IGCSE and Edexcel IGCSE Biology share the same
// teaching content and lesson sequence; they differ only in
// exam papers, so both take the identical 130-lesson spine.
// ════════════════════════════════════════════════════
const SPINES = {

  'biology-igcse': {
    subjectName: 'Biology',
    curricula: ['CambridgeIGCSE', 'EdexcelIGCSE'],
    sourceSyllabus: 'IGCSE Biology — 130-lesson scheme of work (Cambridge & Edexcel)',
    topics: [

      // ── UNIT 1: CELLS & BIOLOGICAL PRINCIPLES (1–20) ──
      { code:'1.1', firstLesson:1, topic:'Unit 1 · Characteristics & Classification', lessons:[
        'The 7 Characteristics of Living Organisms (MRS GREN)',
        'The Binomial Naming System & Species Concept',
        'Classification: The 5 Kingdoms & Their Features',
        'Classification of Vertebrates & Arthropods',
        'Constructing & Using Dichotomous Keys',
      ]},
      { code:'1.2', firstLesson:6, topic:'Unit 1 · Cell Structure & Organisation', lessons:[
        'Animal & Plant Cell Structures & Organelles',
        'Bacterial Cells & Specialised Cells',
        'Levels of Organisation: Cells, Tissues, Organs & Systems',
        'Calculating Magnification & Image Size (M = I / A)',
      ]},
      { code:'1.3', firstLesson:10, topic:'Unit 1 · Movement In & Out of Cells', lessons:[
        'Diffusion: Mechanism, Factors & Real-World Examples',
        'Osmosis: Water Potential & Plant/Animal Cell Responses',
        'Practical: Investigating Osmosis in Potato Tissues',
        'Active Transport & Protein Carriers',
      ]},
      { code:'1.4', firstLesson:14, topic:'Unit 1 · Biological Molecules', lessons:[
        'Structure of Carbohydrates, Fats & Proteins',
        'DNA Structure: Double Helix & Base Pairing',
        "Practical: Food Tests (Benedict's, Iodine, Biuret, Ethanol)",
      ]},
      { code:'1.5', firstLesson:17, topic:'Unit 1 · Enzymes', lessons:[
        'Enzyme Action & The Lock-and-Key Model',
        'Factors Affecting Enzymes: Temperature & Denaturation',
        'Factors Affecting Enzymes: pH Effects',
        'Practical: Investigating Enzyme Activity & Catalase',
      ]},

      // ── UNIT 2: PLANT BIOLOGY (21–32) ──
      { code:'2.1', firstLesson:21, topic:'Unit 2 · Plant Nutrition & Photosynthesis', lessons:[
        'Photosynthesis Equation & Energy Transfer',
        'Leaf Structure & Functional Adaptations',
        'Mineral Requirements: Nitrate & Magnesium Ions',
        'Limiting Factors in Photosynthesis (Light, CO2, Temperature)',
        'Practical: Investigating Light Intensity on Aquatic Plants',
        'Practical: Testing a Leaf for Starch',
      ]},
      { code:'2.2', firstLesson:27, topic:'Unit 2 · Transport in Plants', lessons:[
        'Xylem & Phloem Structure and Function',
        'Water Uptake & Root Hair Cells',
        'The Transpiration Stream & Factors Affecting Transpiration',
        'Practical: Using a Potometer to Measure Transpiration',
        'Wilting & Turgor Pressure in Plants',
        'Translocation of Sucrose & Amino Acids in Phloem',
      ]},

      // ── UNIT 3: HUMAN PHYSIOLOGY & HEALTH (33–77) ──
      { code:'3.1', firstLesson:33, topic:'Unit 3 · Human Nutrition & Digestion', lessons:[
        'Balanced Diet: Nutrients, Roles & Energy Demands',
        'Nutrient Deficiency Diseases (Scurvy, Rickets, Anaemia, Kwashiorkor)',
        'Anatomy of the Human Alimentary Canal',
        'Mechanical Digestion & Teeth Types/Care',
        'Chemical Digestion: Amylase, Proteases & Lipases',
        'Functions of Bile & Stomach Acid',
        'Absorption in the Small Intestine: Villi Adaptations',
        'Assimilation & Egestion',
      ]},
      { code:'3.2', firstLesson:41, topic:'Unit 3 · Transport in Animals', lessons:[
        'Double vs. Single Circulatory Systems',
        'Heart Anatomy & Blood Flow Pathway',
        'The Cardiac Cycle & Heart Rate Control',
        'Coronary Heart Disease: Causes, Risk Factors & Prevention',
        'Blood Vessel Structure: Arteries, Veins & Capillaries',
        'Blood Components: Plasma & Red Blood Cells',
        'Blood Components: White Blood Cells & Platelets',
        'Lymphatic System & Tissue Fluid',
      ]},
      { code:'3.3', firstLesson:49, topic:'Unit 3 · Pathogens, Diseases & Immunity', lessons:[
        'Pathogens & Transmissible Diseases',
        'Physical & Chemical Barriers to Infection',
        'Phagocytosis & Antibody Production by Lymphocytes',
        'Active vs. Passive Immunity & Memory Cells',
        'Vaccination Principles & Herd Immunity',
        'Case Study: Cholera, Toxin Mechanism & Oral Rehydration',
      ]},
      { code:'3.4', firstLesson:55, topic:'Unit 3 · Gas Exchange in Humans', lessons:[
        'Structure of the Human Respiratory System',
        'Gas Exchange Surface Adaptations in Alveoli',
        'Mechanics of Breathing: Ventilation',
        'Effects of Exercise on Breathing Rate & Depth',
      ]},
      { code:'3.5', firstLesson:59, topic:'Unit 3 · Respiration', lessons:[
        'Aerobic Respiration Equation & Uses of Energy',
        'Anaerobic Respiration in Humans & Oxygen Debt',
        'Anaerobic Respiration in Yeast & Industrial Fermentation',
        'Practical: Respirometers & Energy Release in Germinating Seeds',
      ]},
      { code:'3.6', firstLesson:63, topic:'Unit 3 · Excretion in Humans', lessons:[
        'Excretory Products & Deamination in the Liver',
        'Kidney Anatomy & The Urinary System',
        'Nephron Function: Ultrafiltration & Selective Reabsorption',
        'Kidney Dialysis vs. Organ Transplantation',
      ]},
      { code:'3.7', firstLesson:67, topic:'Unit 3 · Coordination & Response', lessons:[
        'Central Nervous System, Neurons & Nerve Impulses',
        'Reflex Arcs & Synaptic Transmission',
        'Structure & Function of the Human Eye',
        'Accommodation & Light Reflexes in the Eye',
        'Endocrine System: Hormones vs. Nervous Control',
        'Adrenaline, Insulin, Glucagon, Testosterone & Oestrogen',
        'Plant Tropisms: Phototropism & Gravitropism Mechanism (Auxins)',
      ]},
      { code:'3.8', firstLesson:74, topic:'Unit 3 · Homeostasis', lessons:[
        'Principles of Homeostasis & Negative Feedback Loops',
        'Thermoregulation: Skin Mechanisms & Core Temperature Control',
        'Blood Glucose Regulation: Insulin, Glucagon & Diabetes',
      ]},
      { code:'3.9', firstLesson:77, topic:'Unit 3 · Drugs', lessons:[
        'Antibiotics, Resistance, Alcohol & Anabolic Steroids',
      ]},

      // ── UNIT 4: REPRODUCTION, GENETICS & EVOLUTION (78–98) ──
      { code:'4.1', firstLesson:78, topic:'Unit 4 · Reproduction', lessons:[
        'Asexual Reproduction Principles & Examples',
        'Sexual Reproduction Principles & Meiosis Overview',
        'Flower Anatomy & Insect vs. Wind Pollination',
        'Fertilisation & Seed/Fruit Formation',
        'Human Male & Female Reproductive Systems',
        'The Menstrual Cycle & Hormonal Control (FSH, LH, Oestrogen, Progesterone)',
        'Fertilisation, Pregnancy, Placenta Function & Antenatal Care',
        'Sexually Transmitted Infections (STIs) & HIV/AIDS',
      ]},
      { code:'4.2', firstLesson:86, topic:'Unit 4 · Inheritance & Genetics', lessons:[
        'Chromosomes, Genes, Alleles & Genotype/Phenotype',
        'Mitosis & Cell Division Cycle',
        'Meiosis & Formation of Gametes',
        'Monohybrid Inheritance & Punnett Squares',
        'Codominance & Human ABO Blood Groups',
        'Sex Determination & Sex-Linked Genes (Colour Blindness)',
        'Protein Synthesis: mRNA, Codons & Ribosomes',
      ]},
      { code:'4.3', firstLesson:93, topic:'Unit 4 · Variation & Selection', lessons:[
        'Continuous vs. Discontinuous Variation',
        'Gene Mutations & Causes (Radiation, Mutagens)',
        'Adaptive Features & Hydrophytes/Xerophytes',
        'Natural Selection Mechanism & Antibiotic Resistance Evolution',
        'Selective Breeding in Plants & Animals',
        'Comparing Natural vs. Artificial Selection',
      ]},

      // ── UNIT 5: ECOLOGY, HUMAN IMPACT & BIOTECHNOLOGY (99–115) ──
      { code:'5.1', firstLesson:99, topic:'Unit 5 · Organisms & Environment', lessons:[
        'Ecosystem Terms: Population, Community, Ecosystem, Niche',
        'Food Chains, Food Webs & Trophic Levels',
        'Pyramids of Numbers, Biomass & Energy Efficiency',
        'Carbon Cycle & Role of Microorganisms',
        'Water Cycle Mechanisms',
        'Nitrogen Cycle & Nitrogen-Fixing Bacteria',
        'Population Growth Curves (Lag, Log, Stationary, Death)',
      ]},
      { code:'5.2', firstLesson:106, topic:'Unit 5 · Human Influences on Ecosystems', lessons:[
        'Food Production, Monocultures & Habitat Destruction',
        'Deforestation Impacts & Soil Erosion',
        'Water Pollution: Eutrophication & Sewage Discharge',
        'Greenhouse Gases, Global Warming & Climate Change',
        'Conservation Efforts, Endangered Species & Recycling',
      ]},
      { code:'5.3', firstLesson:111, topic:'Unit 5 · Biotechnology & Genetic Engineering', lessons:[
        'Role of Bacteria & Fungi in Biotechnology',
        'Yeast in Breadmaking & Bioethanol Production',
        'Pectinase, Biological Washing Powders & Lactase',
        'Penicillin Production & Industrial Fermenters',
        'Recombinant DNA Technology & Insulin Production',
      ]},

      // ── UNIT 6: PRACTICAL SKILLS & EXAM PREPARATION (116–130) ──
      { code:'6.1', firstLesson:116, topic:'Unit 6 · Practical Paper Skills', lessons:[
        'Identifying Variables & Designing Controlled Experiments',
        'Data Collection, Table Formatting & Unit Precision',
        'Graph Drawing Rules (Axes, Scales, Line of Best Fit)',
        'Drawing Biological Specimens & Calculating Magnification',
        'Identifying Experimental Errors & Suggesting Improvements',
        'Testing Plan for Unknown Solutions & Gases',
        'Practical Skills Walkthrough (Paper 6)',
      ]},
      { code:'6.2', firstLesson:123, topic:'Unit 6 · Exam Revision & Past Paper Strategy', lessons:[
        'Multiple Choice Technique (Paper 1/2 Strategy)',
        'Command Words: Explain, Describe, Suggest (Paper 3/4 Strategy)',
        'Past Paper Revision: Cells, Molecules & Enzymes',
        'Past Paper Revision: Plant Physiology',
        'Past Paper Revision: Human Systems & Homeostasis',
        'Past Paper Revision: Genetics & Inheritance Calculations',
        'Past Paper Revision: Ecology & Biotechnology',
        'Mock Exam Review & Final Exam Tips',
      ]},

    ],
  },

}
