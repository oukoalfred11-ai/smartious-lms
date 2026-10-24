/**
 * sync-delivery-mode.js
 * One-off: brings timetable slots and upcoming lessons in line with how
 * their students learn, after students were switched to In-person (or back
 * to Virtual). See src/lib/deliverySync.js for the rule. From now on this
 * happens automatically whenever a student's learning mode is edited.
 *
 * Usage (Render shell, from backend/):
 *   node sync-delivery-mode.js           # preview: lists what would change
 *   node sync-delivery-mode.js --apply   # makes the changes
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { syncDeliveryModes } = require('./src/lib/deliverySync');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI is not set.'); process.exit(1); }
  const apply = process.argv.includes('--apply');
  await mongoose.connect(uri);
  const r = await syncDeliveryModes({ dryRun: !apply });
  const show = (label, list) => {
    console.log(`\n${label}: ${list.length}`);
    for (const c of list.slice(0, 50)) console.log(`  ${c.from} → ${c.to}  ${c.title || ''}${c.at ? '  ' + new Date(c.at).toISOString().slice(0, 16).replace('T', ' ') : ''}`);
    if (list.length > 50) console.log(`  … and ${list.length - 50} more`);
  };
  show('Timetable slots', r.slots);
  show('Upcoming lessons', r.lessons);
  console.log(apply ? '\nDone: changes saved.' : '\nPreview only. Run again with --apply to save these changes.');
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
