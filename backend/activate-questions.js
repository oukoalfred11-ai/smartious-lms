/**
 * activate-questions.js
 * One off devtool. Makes every inactive question in the bank ACTIVE
 * and clears the old needsMarkScheme flag, now that marking is fully
 * manual. Nothing is deleted. Safe to run more than once.
 *
 * Usage (Render shell, from backend/):
 *   node activate-questions.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const Question = require('./src/models/Question');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI is not set.'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected.');

  const total    = await Question.countDocuments({});
  const inactive = await Question.countDocuments({ isActive: false });
  const noArt    = await Question.countDocuments({
    isActive: false,
    $or: [
      { imageNeeded: true, 'artwork.status': { $ne: 'uploaded' } },
      { 'artwork.required': true, 'artwork.status': { $ne: 'uploaded' } },
    ],
  });

  console.log('');
  console.log('Bank total: ' + total + ' question(s), inactive: ' + inactive);
  if (noArt > 0) {
    console.log('Of the inactive, ' + noArt + ' still reference a diagram that was never uploaded.');
    console.log('They will be activated too, so check them in the Needs artwork filter afterwards.');
  }

  const r = await Question.updateMany(
    { $or: [{ isActive: false }, { needsMarkScheme: true }] },
    { $set: { isActive: true, needsMarkScheme: false } }
  );

  const stillInactive = await Question.countDocuments({ isActive: false });
  console.log('');
  console.log('Updated ' + r.modifiedCount + ' question(s).');
  console.log('Inactive remaining: ' + stillInactive + ' (should be 0).');
  console.log('Every question in the bank is now active and available to teachers.');
}

main()
  .catch(e => { console.error('FAILED:', e.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
