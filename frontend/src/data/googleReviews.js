// Google Business Profile — Smartious Homeschool & Tuition
// Diamond Plaza, Fourth Parklands Ave, Nairobi.
// Rating and quotes are copied from the public profile. Update the count
// here when it grows; every page reads from this file.
//
// These are shown as visible text only. Do not add them as
// aggregateRating/review JSON-LD on our own Organization pages: Google
// treats that as self-serving review markup and does not award stars for it.

export const GOOGLE_RATING = { stars: 4.9, count: 130 }

export const GOOGLE_PROFILE_URL = 'https://share.google/wsClmqRDYfpMGNJyK'
export const GOOGLE_REVIEWS_URL = 'https://search.google.com/local/reviews?placeid=ChIJM59xkrsXLxgRNJot8ptZ1l8'
export const LEAVE_REVIEW_URL = 'https://g.page/r/CTSaLfKbWdZfEAE/review'

export const GOOGLE_REVIEWS = [
  { name: 'Allan H.', context: 'Nairobi parent', rating: 5, text: 'Smartious Homeschooling delivers genuinely effective one-on-one instruction. The teachers are patient, consistent, and skilled at identifying and addressing each learner\'s specific academic gaps. Since enrolling, our child has become more confident, enjoys lessons, and is now performing above grade level. For families in Nairobi seeking a dependable, academically rigorous homeschooling programme with personalised support, Smartious is a standout choice.' },
  { name: 'Google reviewer', context: 'Parent', rating: 5, text: 'I am truly impressed by the level of professionalism at Smartious Homeschool and Tuition. The tutors are not only knowledgeable but also very patient and supportive. They create a comfortable learning environment where children feel free to ask questions. My child now enjoys studying and looks forward to every session.' },
  { name: 'Derrick A.', context: 'Nairobi parent', rating: 5, text: 'Smartious eSchool is exceptional. Professional, caring tutors who truly understand their students and deliver results. Lessons are engaging, personalized, and well-structured, creating a supportive environment where learners thrive. If you want quality education and real academic progress, this is the place to go.' },
  { name: 'Google reviewer', context: 'Parent', rating: 5, text: 'What stands out most about Smartious Homeschool and Tuition is their dedication to each learner. They don\'t rush through topics but ensure the child fully understands before moving forward. The progress my child has made in a short time is impressive. I would definitely recommend them to any parent.' },
  { name: 'Valentine M.', context: 'Nairobi', rating: 5, text: 'I\'m very much pleased by the teaching methods at Smartious eschool, the tutors are caring, they never fail to reach out to their students in any need. Highly recommend!' },
  { name: 'Google reviewer', context: 'Parent', rating: 5, text: 'What I love most about Smartious is how they make learning enjoyable. The tutors use engaging methods that keep children interested throughout the lesson. My child now looks forward to studying instead of avoiding it.' },
  { name: 'Google reviewer', context: 'Homeschool parent', rating: 5, text: 'I have peace of mind as a Smartious Homeschool parent. No more traffic and early morning rush to school. Smartious are the most organized homeschool providers.' },
]

// Stable start offset per page, so neighbouring pages open on different quotes.
export function reviewOffset(seed = '') {
  let h = 0
  for (const c of String(seed)) h = (h + c.charCodeAt(0)) % 9973
  return h % GOOGLE_REVIEWS.length
}
