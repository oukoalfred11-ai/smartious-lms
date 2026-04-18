/**
 * SEED SCRIPT: Populate Subject Collection
 * Run from backend directory: node src/seeds/seedSubjects.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('../models/Subject');

// MongoDB Connection - use .env variable
const MONGO_URI = process.env.MONGODB_URI;

const subjectsData = [
  // ============ IGCSE SUBJECTS ============
  { curriculum: 'IGCSE', subjectName: 'English Language', category: 'Languages' },
  { curriculum: 'IGCSE', subjectName: 'English Literature', category: 'Languages' },
  { curriculum: 'IGCSE', subjectName: 'Mathematics', category: 'Mathematics' },
  { curriculum: 'IGCSE', subjectName: 'Additional Mathematics', category: 'Mathematics' },
  { curriculum: 'IGCSE', subjectName: 'Physics', category: 'Sciences' },
  { curriculum: 'IGCSE', subjectName: 'Chemistry', category: 'Sciences' },
  { curriculum: 'IGCSE', subjectName: 'Biology', category: 'Sciences' },
  { curriculum: 'IGCSE', subjectName: 'Combined Science', category: 'Sciences' },
  { curriculum: 'IGCSE', subjectName: 'History', category: 'Humanities' },
  { curriculum: 'IGCSE', subjectName: 'Geography', category: 'Humanities' },
  { curriculum: 'IGCSE', subjectName: 'Economics', category: 'Humanities' },
  { curriculum: 'IGCSE', subjectName: 'Business Studies', category: 'Humanities' },
  { curriculum: 'IGCSE', subjectName: 'Accounting', category: 'Business' },
  { curriculum: 'IGCSE', subjectName: 'Islamic Studies', category: 'Religion' },
  { curriculum: 'IGCSE', subjectName: 'Religious Studies', category: 'Religion' },
  { curriculum: 'IGCSE', subjectName: 'Art and Design', category: 'Arts' },
  { curriculum: 'IGCSE', subjectName: 'Music', category: 'Arts' },
  { curriculum: 'IGCSE', subjectName: 'Physical Education', category: 'Physical Education' },
  { curriculum: 'IGCSE', subjectName: 'Design and Technology', category: 'Technology' },
  { curriculum: 'IGCSE', subjectName: 'Computer Science', category: 'Technology' },
  { curriculum: 'IGCSE', subjectName: 'Information and Communication Technology', category: 'Technology' },
  { curriculum: 'IGCSE', subjectName: 'Modern Languages (Spanish)', category: 'Languages' },
  { curriculum: 'IGCSE', subjectName: 'Modern Languages (French)', category: 'Languages' },
  { curriculum: 'IGCSE', subjectName: 'Modern Languages (German)', category: 'Languages' },
  { curriculum: 'IGCSE', subjectName: 'Modern Languages (Arabic)', category: 'Languages' },

  // ============ A-LEVEL SUBJECTS ============
  { curriculum: 'A-Level', subjectName: 'English Language', category: 'Languages' },
  { curriculum: 'A-Level', subjectName: 'English Literature', category: 'Languages' },
  { curriculum: 'A-Level', subjectName: 'Mathematics', category: 'Mathematics' },
  { curriculum: 'A-Level', subjectName: 'Further Mathematics', category: 'Mathematics' },
  { curriculum: 'A-Level', subjectName: 'Physics', category: 'Sciences' },
  { curriculum: 'A-Level', subjectName: 'Chemistry', category: 'Sciences' },
  { curriculum: 'A-Level', subjectName: 'Biology', category: 'Sciences' },
  { curriculum: 'A-Level', subjectName: 'History', category: 'Humanities' },
  { curriculum: 'A-Level', subjectName: 'Geography', category: 'Humanities' },
  { curriculum: 'A-Level', subjectName: 'Economics', category: 'Humanities' },
  { curriculum: 'A-Level', subjectName: 'Business Studies', category: 'Humanities' },
  { curriculum: 'A-Level', subjectName: 'Psychology', category: 'Social Sciences' },
  { curriculum: 'A-Level', subjectName: 'Sociology', category: 'Social Sciences' },
  { curriculum: 'A-Level', subjectName: 'Government and Politics', category: 'Humanities' },
  { curriculum: 'A-Level', subjectName: 'Law', category: 'Humanities' },
  { curriculum: 'A-Level', subjectName: 'Accounting', category: 'Business' },
  { curriculum: 'A-Level', subjectName: 'Art and Design', category: 'Arts' },
  { curriculum: 'A-Level', subjectName: 'Music', category: 'Arts' },
  { curriculum: 'A-Level', subjectName: 'Physical Education', category: 'Physical Education' },
  { curriculum: 'A-Level', subjectName: 'Design and Technology', category: 'Technology' },
  { curriculum: 'A-Level', subjectName: 'Computer Science', category: 'Technology' },
  { curriculum: 'A-Level', subjectName: 'Information Technology', category: 'Technology' },
  { curriculum: 'A-Level', subjectName: 'Media Studies', category: 'Humanities' },
  { curriculum: 'A-Level', subjectName: 'Theatre Studies', category: 'Arts' },
  { curriculum: 'A-Level', subjectName: 'Philosophy', category: 'Humanities' },
  { curriculum: 'A-Level', subjectName: 'Spanish', category: 'Languages' },
  { curriculum: 'A-Level', subjectName: 'French', category: 'Languages' },
  { curriculum: 'A-Level', subjectName: 'German', category: 'Languages' },
  { curriculum: 'A-Level', subjectName: 'Arabic', category: 'Languages' },
  { curriculum: 'A-Level', subjectName: 'Environmental Science', category: 'Sciences' },

  // ============ IB DIPLOMA SUBJECTS ============
  { curriculum: 'IB Diploma', subjectName: 'English Language and Literature', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'English B', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'Spanish A', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'Spanish B', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'French A', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'French B', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'German A', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'German B', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'Mandarin A', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'Mandarin B', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'Arabic A', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'Arabic B', category: 'Languages' },
  { curriculum: 'IB Diploma', subjectName: 'Mathematics: Analysis and Approaches', category: 'Mathematics' },
  { curriculum: 'IB Diploma', subjectName: 'Mathematics: Applications and Interpretation', category: 'Mathematics' },
  { curriculum: 'IB Diploma', subjectName: 'Physics', category: 'Sciences' },
  { curriculum: 'IB Diploma', subjectName: 'Chemistry', category: 'Sciences' },
  { curriculum: 'IB Diploma', subjectName: 'Biology', category: 'Sciences' },
  { curriculum: 'IB Diploma', subjectName: 'Environmental Systems and Societies', category: 'Sciences' },
  { curriculum: 'IB Diploma', subjectName: 'Design', category: 'Arts' },
  { curriculum: 'IB Diploma', subjectName: 'Music', category: 'Arts' },
  { curriculum: 'IB Diploma', subjectName: 'Visual Arts', category: 'Arts' },
  { curriculum: 'IB Diploma', subjectName: 'Theatre Arts', category: 'Arts' },
  { curriculum: 'IB Diploma', subjectName: 'Film', category: 'Arts' },
  { curriculum: 'IB Diploma', subjectName: 'History', category: 'Humanities' },
  { curriculum: 'IB Diploma', subjectName: 'Geography', category: 'Humanities' },
  { curriculum: 'IB Diploma', subjectName: 'Economics', category: 'Humanities' },
  { curriculum: 'IB Diploma', subjectName: 'Business Management', category: 'Business' },
  { curriculum: 'IB Diploma', subjectName: 'Psychology', category: 'Social Sciences' },
  { curriculum: 'IB Diploma', subjectName: 'Global Politics', category: 'Humanities' },
  { curriculum: 'IB Diploma', subjectName: 'Philosophy', category: 'Humanities' },
  { curriculum: 'IB Diploma', subjectName: 'Anthropology', category: 'Social Sciences' },
  { curriculum: 'IB Diploma', subjectName: 'Sports, Exercise and Health Science', category: 'Physical Education' },
  { curriculum: 'IB Diploma', subjectName: 'Computer Science', category: 'Technology' },
  { curriculum: 'IB Diploma', subjectName: 'Information Technology in a Global Society', category: 'Technology' },

  // ============ IB MYP SUBJECTS ============
  { curriculum: 'IB MYP', subjectName: 'English', category: 'Languages' },
  { curriculum: 'IB MYP', subjectName: 'Language Acquisition (Spanish)', category: 'Languages' },
  { curriculum: 'IB MYP', subjectName: 'Language Acquisition (French)', category: 'Languages' },
  { curriculum: 'IB MYP', subjectName: 'Language Acquisition (Mandarin)', category: 'Languages' },
  { curriculum: 'IB MYP', subjectName: 'Mathematics', category: 'Mathematics' },
  { curriculum: 'IB MYP', subjectName: 'Sciences', category: 'Sciences' },
  { curriculum: 'IB MYP', subjectName: 'Individuals and Societies', category: 'Humanities' },
  { curriculum: 'IB MYP', subjectName: 'Physical and Health Education', category: 'Physical Education' },
  { curriculum: 'IB MYP', subjectName: 'Arts', category: 'Arts' },
  { curriculum: 'IB MYP', subjectName: 'Design', category: 'Technology' },
  { curriculum: 'IB MYP', subjectName: 'Technology', category: 'Technology' },

  // ============ KENYA CBC SUBJECTS ============
  { curriculum: 'Kenya CBC', subjectName: 'English', category: 'Languages' },
  { curriculum: 'Kenya CBC', subjectName: 'Kiswahili', category: 'Languages' },
  { curriculum: 'Kenya CBC', subjectName: 'Mathematics', category: 'Mathematics' },
  { curriculum: 'Kenya CBC', subjectName: 'Science', category: 'Sciences' },
  { curriculum: 'Kenya CBC', subjectName: 'Social Studies', category: 'Humanities' },
  { curriculum: 'Kenya CBC', subjectName: 'Islamic Religious Education', category: 'Religion' },
  { curriculum: 'Kenya CBC', subjectName: 'Christian Religious Education', category: 'Religion' },
  { curriculum: 'Kenya CBC', subjectName: 'Hindu Religious Education', category: 'Religion' },
  { curriculum: 'Kenya CBC', subjectName: 'Physical Education', category: 'Physical Education' },
  { curriculum: 'Kenya CBC', subjectName: 'Music', category: 'Arts' },
  { curriculum: 'Kenya CBC', subjectName: 'Visual Arts', category: 'Arts' },
  { curriculum: 'Kenya CBC', subjectName: 'Technology', category: 'Technology' },
  { curriculum: 'Kenya CBC', subjectName: 'Computer Studies', category: 'Technology' },

  // ============ BRITISH NATIONAL CURRICULUM (BNC) ============
  { curriculum: 'BNC', subjectName: 'English', category: 'Languages' },
  { curriculum: 'BNC', subjectName: 'Mathematics', category: 'Mathematics' },
  { curriculum: 'BNC', subjectName: 'Science', category: 'Sciences' },
  { curriculum: 'BNC', subjectName: 'Design and Technology', category: 'Technology' },
  { curriculum: 'BNC', subjectName: 'Geography', category: 'Humanities' },
  { curriculum: 'BNC', subjectName: 'History', category: 'Humanities' },
  { curriculum: 'BNC', subjectName: 'Modern Languages (Spanish)', category: 'Languages' },
  { curriculum: 'BNC', subjectName: 'Modern Languages (French)', category: 'Languages' },
  { curriculum: 'BNC', subjectName: 'Modern Languages (German)', category: 'Languages' },
  { curriculum: 'BNC', subjectName: 'Art and Design', category: 'Arts' },
  { curriculum: 'BNC', subjectName: 'Music', category: 'Arts' },
  { curriculum: 'BNC', subjectName: 'Physical Education', category: 'Physical Education' },
  { curriculum: 'BNC', subjectName: 'Computing', category: 'Technology' },
  { curriculum: 'BNC', subjectName: 'Citizenship', category: 'Humanities' },
  { curriculum: 'BNC', subjectName: 'Personal, Social, Health and Economic Education', category: 'Social Studies' },

  // ============ AMERICAN CURRICULUM ============
  { curriculum: 'American', subjectName: 'English Language Arts', category: 'Languages' },
  { curriculum: 'American', subjectName: 'Mathematics', category: 'Mathematics' },
  { curriculum: 'American', subjectName: 'Science', category: 'Sciences' },
  { curriculum: 'American', subjectName: 'Social Studies', category: 'Humanities' },
  { curriculum: 'American', subjectName: 'History', category: 'Humanities' },
  { curriculum: 'American', subjectName: 'US Government', category: 'Humanities' },
  { curriculum: 'American', subjectName: 'Economics', category: 'Humanities' },
  { curriculum: 'American', subjectName: 'Biology', category: 'Sciences' },
  { curriculum: 'American', subjectName: 'Chemistry', category: 'Sciences' },
  { curriculum: 'American', subjectName: 'Physics', category: 'Sciences' },
  { curriculum: 'American', subjectName: 'World Languages (Spanish)', category: 'Languages' },
  { curriculum: 'American', subjectName: 'World Languages (French)', category: 'Languages' },
  { curriculum: 'American', subjectName: 'World Languages (Mandarin)', category: 'Languages' },
  { curriculum: 'American', subjectName: 'Physical Education', category: 'Physical Education' },
  { curriculum: 'American', subjectName: 'Health Education', category: 'Physical Education' },
  { curriculum: 'American', subjectName: 'Visual Arts', category: 'Arts' },
  { curriculum: 'American', subjectName: 'Music', category: 'Arts' },
  { curriculum: 'American', subjectName: 'Performing Arts', category: 'Arts' },
  { curriculum: 'American', subjectName: 'Computer Science', category: 'Technology' },
  { curriculum: 'American', subjectName: 'Technology', category: 'Technology' },
  { curriculum: 'American', subjectName: 'Engineering', category: 'Technology' },
  { curriculum: 'American', subjectName: 'Advanced Placement (AP) Computer Science', category: 'Technology' },
  { curriculum: 'American', subjectName: 'Advanced Placement (AP) Biology', category: 'Sciences' },
  { curriculum: 'American', subjectName: 'Advanced Placement (AP) Chemistry', category: 'Sciences' },
  { curriculum: 'American', subjectName: 'Advanced Placement (AP) Physics', category: 'Sciences' },
  { curriculum: 'American', subjectName: 'Advanced Placement (AP) Calculus', category: 'Mathematics' },
];

async function seedSubjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing subjects
    await Subject.deleteMany({});
    console.log('✓ Cleared existing subjects');

    // Insert subjects
    const result = await Subject.insertMany(subjectsData);
    console.log(`✓ Successfully seeded ${result.length} subjects`);

    // Log summary by curriculum
    const curricula = ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American'];
    for (const curriculum of curricula) {
      const count = await Subject.countDocuments({ curriculum });
      console.log(`  - ${curriculum}: ${count} subjects`);
    }

    await mongoose.connection.close();
    console.log('✓ Seeding complete - connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error during seeding:', error.message);
    process.exit(1);
  }
}

// Run the seed
seedSubjects();

