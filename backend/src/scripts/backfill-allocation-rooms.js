/**
 * BACKFILL AUTO-ALLOCATION GROUP ROOMS
 * ===========================================================
 *
 * For every existing Active allocation, ensures the teacher has
 * a default "auto-allocation" group room and the student is a
 * member. Run ONCE after deploying the allocations.js changes.
 *
 * Safe to run multiple times — idempotent. The script only adds
 * to rooms (via $addToSet); it never removes.
 *
 * USAGE:
 *   cd backend
 *   node src/scripts/backfill-allocation-rooms.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Allocation = require('../models/Allocation');
const User = require('../models/User');
const GroupRoom = require('../models/GroupRoom');

async function ensureRoom(teacher) {
  let room = await GroupRoom.findOne({
    teacher: teacher._id,
    isAutoAllocation: true,
  });
  if (room) return room;

  const teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Teacher';
  room = await GroupRoom.create({
    name: `${teacherName} — All Students`,
    subject: 'General',
    teacher: teacher._id,
    students: [],
    capacity: 100,
    status: 'Active',
    isAutoAllocation: true,
  });
  console.log(`  created room '${room.name}' for teacher ${teacher._id}`);
  return room;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected.');

  const allocs = await Allocation.find({ status: 'Active' }).lean();
  console.log(`Found ${allocs.length} active allocations.`);

  // Group student IDs by teacher
  const byTeacher = new Map();
  for (const a of allocs) {
    const tid = a.teacherId.toString();
    if (!byTeacher.has(tid)) byTeacher.set(tid, new Set());
    byTeacher.get(tid).add(a.studentId.toString());
  }

  let teachersProcessed = 0;
  let totalAdditions = 0;

  for (const [teacherIdStr, studentSet] of byTeacher.entries()) {
    const teacher = await User.findById(teacherIdStr);
    if (!teacher) {
      console.warn(`  teacher ${teacherIdStr} not found, skipping`);
      continue;
    }
    const room = await ensureRoom(teacher);

    const studentIds = [...studentSet];
    const result = await GroupRoom.updateOne(
      { _id: room._id },
      {
        $addToSet: { students: { $each: studentIds } },
        $set: { updatedAt: new Date() },
      }
    );
    if (result.modifiedCount > 0) {
      // We can't tell exactly how many were added by addToSet $each;
      // approximate by checking final size
      const refreshed = await GroupRoom.findById(room._id).lean();
      console.log(`  teacher ${teacher.firstName} ${teacher.lastName}: room now has ${refreshed.students.length} student(s)`);
    }
    teachersProcessed++;
    totalAdditions += studentIds.length;
  }

  console.log(`\nBackfill complete.`);
  console.log(`  Teachers processed: ${teachersProcessed}`);
  console.log(`  Total student-room additions attempted: ${totalAdditions}`);
  console.log(`  (Idempotent: re-running won't duplicate memberships.)`);

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
