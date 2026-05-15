/**
 * subjectImages.js
 * ============================================================
 * Curated Unsplash imagery + colour palette for each subject.
 * Used by both StudentPortal's My Curriculum tab and TeacherPortal's
 * Manage My Subject tab so the visual experience stays consistent.
 *
 * To add a new subject:
 *   1. Pick a clean editorial-style Unsplash photo
 *   2. Use a 800x450 crop for cards (16:9)
 *   3. Pair with a complementary deep colour from the brand range
 *
 * To override per-Subject record: set Subject.coverImage and Subject.color
 * fields in the database — the resolvers below check them first.
 */

export const SUBJECT_IMAGES = {
  'Mathematics':                                      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
  'Maths':                                            'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
  'Further Mathematics':                              'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop',
  'Additional Mathematics':                           'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
  'Algebra I':                                        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
  'Algebra II':                                       'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
  'Geometry':                                         'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop',
  'Pre-Calculus':                                     'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop',
  'Calculus':                                         'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop',
  'AP Calculus AB':                                   'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop',
  'AP Calculus BC':                                   'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop',
  'AP Statistics':                                    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
  'Mathematics: Analysis and Approaches':             'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
  'Mathematics: Applications and Interpretation':     'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',

  'Physics':                                          'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=450&fit=crop',
  'AP Physics 1':                                     'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=450&fit=crop',
  'AP Physics 2':                                     'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=450&fit=crop',

  'Chemistry':                                        'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800&h=450&fit=crop',
  'AP Chemistry':                                     'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800&h=450&fit=crop',

  'Biology':                                          'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=450&fit=crop',
  'AP Biology':                                       'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=450&fit=crop',

  'Combined Science':                                 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop',
  'Integrated Science':                               'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop',
  'Science':                                          'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop',
  'Sciences':                                         'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop',
  'Environmental Management':                         'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=450&fit=crop',
  'Environmental Science':                            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=450&fit=crop',
  'Environmental Systems and Societies':              'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=450&fit=crop',
  'Sports, Exercise and Health Science':              'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop',
  'Sports Science':                                   'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop',
  'Health':                                           'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop',
  'Health Education':                                 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop',

  'English':                                          'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=450&fit=crop',
  'English Language':                                 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=450&fit=crop',
  'English Literature':                               'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=800&h=450&fit=crop',
  'Literature':                                       'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=800&h=450&fit=crop',
  'World Literature':                                 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=800&h=450&fit=crop',
  'English as a Second Language (ESL)':               'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=450&fit=crop',
  'English Language Arts':                            'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=450&fit=crop',
  'AP English Language and Composition':              'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=450&fit=crop',
  'AP English Literature and Composition':            'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=800&h=450&fit=crop',
  'English A: Language and Literature':               'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=450&fit=crop',
  'English A: Literature':                            'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=800&h=450&fit=crop',
  'English B':                                        'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=450&fit=crop',
  'Language and Literature (English)':                'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=450&fit=crop',
  'Literature and Performance':                       'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop',

  'History':                                          'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=450&fit=crop',
  'US History':                                       'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=450&fit=crop',
  'World History':                                    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=450&fit=crop',
  'AP US History':                                    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=450&fit=crop',
  'AP World History':                                 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=450&fit=crop',

  'Geography':                                        'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=450&fit=crop',
  'Social Studies':                                   'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=450&fit=crop',
  'Individuals and Societies':                        'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=450&fit=crop',
  'Global Perspectives':                              'https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=800&h=450&fit=crop',
  'Global Politics':                                  'https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=800&h=450&fit=crop',
  'Politics':                                         'https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=800&h=450&fit=crop',
  'Government':                                       'https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=800&h=450&fit=crop',
  'Citizenship':                                      'https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=800&h=450&fit=crop',
  'Law':                                              'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&h=450&fit=crop',
  'Philosophy':                                       'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=450&fit=crop',
  'Theory of Knowledge':                              'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=450&fit=crop',
  'Extended Essay':                                   'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop',

  'Religious Studies':                                'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=450&fit=crop',
  'Religious Education':                              'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=450&fit=crop',
  'Christian Religious Education':                    'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=450&fit=crop',
  'Islamic Religious Education':                      'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=450&fit=crop',
  'Hindu Religious Education':                        'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=450&fit=crop',

  'Computer Science':                                 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
  'AP Computer Science A':                            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
  'Computing':                                        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
  'ICT':                                              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
  'Information & Communications Technology (ICT)':    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
  'Information Technology':                           'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
  'Information Technology in a Global Society':       'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
  'Design & Technology':                              'https://images.unsplash.com/photo-1581092446327-9b52bd1570c2?w=800&h=450&fit=crop',
  'Design Technology':                                'https://images.unsplash.com/photo-1581092446327-9b52bd1570c2?w=800&h=450&fit=crop',
  'Design':                                           'https://images.unsplash.com/photo-1581092446327-9b52bd1570c2?w=800&h=450&fit=crop',
  'Pre-Technical Studies':                            'https://images.unsplash.com/photo-1581092446327-9b52bd1570c2?w=800&h=450&fit=crop',

  'Business Studies':                                 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop',
  'Business':                                         'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop',
  'Business Management':                              'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop',
  'Economics':                                        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
  'Accounting':                                       'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop',
  'Travel & Tourism':                                 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=450&fit=crop',
  'Agriculture':                                      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&h=450&fit=crop',
  'Home Science':                                     'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=450&fit=crop',

  'Art':                                              'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop',
  'Art & Design':                                     'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop',
  'Visual Arts':                                      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop',
  'Arts (Visual Arts)':                               'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop',
  'Music':                                            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=450&fit=crop',
  'Arts (Music)':                                     'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=450&fit=crop',
  'Drama':                                            'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop',
  'Drama & Theatre Studies':                          'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop',
  'Arts (Drama)':                                     'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop',
  'Theatre':                                          'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop',
  'Performing Arts':                                  'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop',
  'Film':                                             'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop',
  'Film Studies':                                     'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop',
  'Media Studies':                                    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop',
  'Dance':                                            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=450&fit=crop',

  'Physical Education':                               'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop',
  'Physical Education and Sports':                    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop',
  'Physical and Health Education':                    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop',
  'PE':                                               'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop',

  'Psychology':                                       'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=450&fit=crop',
  'AP Psychology':                                    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=450&fit=crop',
  'Sociology':                                        'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=450&fit=crop',
  'Life Skills Education':                            'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=450&fit=crop',
  'Personal, Social, Health Education (PSHE)':        'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=450&fit=crop',

  // ── Languages ──
  'French':                                           'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=450&fit=crop',
  'French B':                                         'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=450&fit=crop',
  'French ab initio':                                 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=450&fit=crop',
  'Spanish':                                          'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=450&fit=crop',
  'Spanish B':                                        'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=450&fit=crop',
  'Spanish ab initio':                                'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=450&fit=crop',
  'German':                                           'https://images.unsplash.com/photo-1554072675-66db59dba46f?w=800&h=450&fit=crop',
  'German B':                                         'https://images.unsplash.com/photo-1554072675-66db59dba46f?w=800&h=450&fit=crop',
  'Italian':                                          'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&h=450&fit=crop',
  'Portuguese':                                       'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=450&fit=crop',
  'Mandarin Chinese':                                 'https://images.unsplash.com/photo-1531219432768-9f540ce7b53b?w=800&h=450&fit=crop',
  'Mandarin B':                                       'https://images.unsplash.com/photo-1531219432768-9f540ce7b53b?w=800&h=450&fit=crop',
  'Japanese':                                         'https://images.unsplash.com/photo-1493997181344-712f2f19d87a?w=800&h=450&fit=crop',
  'Korean':                                           'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&h=450&fit=crop',
  'Russian':                                          'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800&h=450&fit=crop',
  'Turkish':                                          'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&h=450&fit=crop',
  'Hindi':                                            'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=450&fit=crop',
  'Urdu':                                             'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=450&fit=crop',
  'Arabic':                                           'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&h=450&fit=crop',
  'Kiswahili':                                        'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&h=450&fit=crop',
  'Swahili (Kiswahili)':                              'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&h=450&fit=crop',
  'Latin':                                            'https://images.unsplash.com/photo-1552083375-1447ce886485?w=800&h=450&fit=crop',
  'Ancient Greek':                                    'https://images.unsplash.com/photo-1552083375-1447ce886485?w=800&h=450&fit=crop',
  'Kenyan Sign Language':                             'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=800&h=450&fit=crop',
  'Language Acquisition (French)':                    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=450&fit=crop',
  'Language Acquisition (Spanish)':                   'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=450&fit=crop',
  'Language Acquisition (Mandarin)':                  'https://images.unsplash.com/photo-1531219432768-9f540ce7b53b?w=800&h=450&fit=crop',
};

export const SUBJECT_COLOURS = {
  // Math
  'Mathematics': '#7D1025', 'Maths': '#7D1025', 'Further Mathematics': '#5A0B1B',
  'Additional Mathematics': '#7D1025',
  'Algebra I': '#7D1025', 'Algebra II': '#7D1025', 'Geometry': '#7D1025',
  'Pre-Calculus': '#5A0B1B', 'Calculus': '#5A0B1B',
  'AP Calculus AB': '#5A0B1B', 'AP Calculus BC': '#5A0B1B', 'AP Statistics': '#5A0B1B',
  'Mathematics: Analysis and Approaches': '#7D1025',
  'Mathematics: Applications and Interpretation': '#7D1025',

  // Sciences
  'Physics': '#1E3A8A', 'AP Physics 1': '#1E3A8A', 'AP Physics 2': '#1E3A8A',
  'Chemistry': '#166534', 'AP Chemistry': '#166534',
  'Biology': '#7C2D12', 'AP Biology': '#7C2D12',
  'Combined Science': '#0F766E', 'Integrated Science': '#0F766E',
  'Science': '#0F766E', 'Sciences': '#0F766E',
  'Environmental Management': '#15803D', 'Environmental Science': '#15803D',
  'Environmental Systems and Societies': '#15803D',
  'Sports, Exercise and Health Science': '#0E7490', 'Sports Science': '#0E7490',
  'Health': '#059669', 'Health Education': '#059669',

  // English & Literature
  'English': '#6B21A8', 'English Language': '#6B21A8', 'English Literature': '#581C87',
  'Literature': '#581C87', 'World Literature': '#581C87',
  'English as a Second Language (ESL)': '#6B21A8',
  'English Language Arts': '#6B21A8',
  'AP English Language and Composition': '#6B21A8',
  'AP English Literature and Composition': '#581C87',
  'English A: Language and Literature': '#6B21A8',
  'English A: Literature': '#581C87', 'English B': '#6B21A8',
  'Language and Literature (English)': '#6B21A8',
  'Literature and Performance': '#581C87',

  // Humanities
  'History': '#92400E', 'US History': '#92400E', 'World History': '#92400E',
  'AP US History': '#92400E', 'AP World History': '#92400E',
  'Geography': '#0F766E', 'Social Studies': '#0F766E',
  'Individuals and Societies': '#0F766E',
  'Global Perspectives': '#0369A1', 'Global Politics': '#0369A1',
  'Politics': '#0369A1', 'Government': '#0369A1', 'Citizenship': '#0369A1',
  'Law': '#1F2937', 'Philosophy': '#7C2D12',
  'Theory of Knowledge': '#7C2D12', 'Extended Essay': '#7C2D12',
  'Religious Studies': '#7C2D12', 'Religious Education': '#7C2D12',
  'Christian Religious Education': '#7C2D12',
  'Islamic Religious Education': '#7C2D12',
  'Hindu Religious Education': '#7C2D12',

  // Technology
  'Computer Science': '#1F2937', 'AP Computer Science A': '#1F2937',
  'Computing': '#1F2937', 'ICT': '#1F2937',
  'Information & Communications Technology (ICT)': '#1F2937',
  'Information Technology': '#1F2937',
  'Information Technology in a Global Society': '#1F2937',
  'Design & Technology': '#9F1239', 'Design Technology': '#9F1239',
  'Design': '#9F1239', 'Pre-Technical Studies': '#9F1239',

  // Business
  'Business Studies': '#7E22CE', 'Business': '#7E22CE',
  'Business Management': '#7E22CE',
  'Economics': '#9F1239', 'Accounting': '#0E7C7B',
  'Travel & Tourism': '#0EA5E9', 'Agriculture': '#15803D',
  'Home Science': '#BE185D',

  // Arts
  'Art': '#BE185D', 'Art & Design': '#BE185D',
  'Visual Arts': '#BE185D', 'Arts (Visual Arts)': '#BE185D',
  'Music': '#0E7490', 'Arts (Music)': '#0E7490',
  'Drama': '#7C2D12', 'Drama & Theatre Studies': '#7C2D12',
  'Arts (Drama)': '#7C2D12', 'Theatre': '#7C2D12', 'Performing Arts': '#7C2D12',
  'Film': '#1F2937', 'Film Studies': '#1F2937', 'Media Studies': '#1F2937',
  'Dance': '#BE185D',

  // PE
  'Physical Education': '#059669', 'PE': '#059669',
  'Physical Education and Sports': '#059669',
  'Physical and Health Education': '#059669',

  // Social/Psychology
  'Psychology': '#7C3AED', 'AP Psychology': '#7C3AED',
  'Sociology': '#0369A1',
  'Life Skills Education': '#0369A1',
  'Personal, Social, Health Education (PSHE)': '#0369A1',

  // Languages
  'French': '#1E40AF', 'French B': '#1E40AF', 'French ab initio': '#1E40AF',
  'Spanish': '#B91C1C', 'Spanish B': '#B91C1C', 'Spanish ab initio': '#B91C1C',
  'German': '#1F2937', 'German B': '#1F2937',
  'Italian': '#15803D',
  'Portuguese': '#9F1239',
  'Mandarin Chinese': '#9F1239', 'Mandarin B': '#9F1239',
  'Japanese': '#BE185D',
  'Korean': '#0369A1',
  'Russian': '#1F2937',
  'Turkish': '#B91C1C',
  'Hindi': '#9F1239', 'Urdu': '#15803D',
  'Arabic': '#7C2D12',
  'Kiswahili': '#15803D', 'Swahili (Kiswahili)': '#15803D',
  'Latin': '#7C2D12', 'Ancient Greek': '#7C2D12',
  'Kenyan Sign Language': '#0369A1',
  'Language Acquisition (French)': '#1E40AF',
  'Language Acquisition (Spanish)': '#B91C1C',
  'Language Acquisition (Mandarin)': '#9F1239',
};

// Resolvers — accept either a Subject document or a plain name string.
// Falls back to per-subject overrides on the Subject doc first.
export function imageForSubject(subject) {
  if (!subject) return null;
  if (typeof subject === 'string') return SUBJECT_IMAGES[subject] || null;
  if (subject.coverImage) return subject.coverImage;
  return SUBJECT_IMAGES[subject.subjectName] || null;
}

export function colorForSubject(subject, fallback = '#7D1025') {
  if (!subject) return fallback;
  if (typeof subject === 'string') return SUBJECT_COLOURS[subject] || fallback;
  if (subject.color) return subject.color;
  return SUBJECT_COLOURS[subject.subjectName] || fallback;
}
