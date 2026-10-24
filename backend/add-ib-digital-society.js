/**
 * add-ib-digital-society.js
 * One-off: creates the IB DP "Digital Society (HL)" and "Digital Society (SL)"
 * subject records (the same as pressing Seed subjects, for these two only), so
 * their spines can be loaded from the Curriculum module. Safe to run more than
 * once: existing records are left as they are.
 *
 * Usage (Render shell, from backend/):
 *   node add-ib-digital-society.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./src/models/Subject');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI is not set.'); process.exit(1); }
  await mongoose.connect(uri);
  for (const subjectName of ['Digital Society (HL)', 'Digital Society (SL)']) {
    const before = await Subject.findOne({ curriculum: 'IBDP', subjectName }).select('_id isActive').lean();
    await Subject.findOneAndUpdate(
      { curriculum: 'IBDP', subjectName },
      { $set: { category: 'Individuals and Societies' }, $setOnInsert: { isActive: true } },
      { upsert: true, new: true },
    );
    console.log(before ? `${subjectName}: already there${before.isActive === false ? ' (inactive: reactivate it in the subject list)' : ''}` : `${subjectName}: created`);
  }
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
