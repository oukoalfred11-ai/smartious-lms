/**
 * RECONCILE AUTO-ALLOCATION ROOMS
 * ===========================================================
 *
 * Brings auto-allocation GroupRooms into sync with current
 * Allocation state. Safe to run anytime, idempotent (running
 * twice in a row is a no-op).
 *
 * What it does:
 *  1. For every Active allocation whose teacher is currently
 *     usable (active, not on leave), ensures the teacher has
 *     an auto-allocation room AND the student is in it.
 *  2. For every auto-allocation room, removes any student
 *     whose allocation is no longer Active or whose teacher
 *     is no longer usable.
 *  3. Reports a summary of what changed.
 *
 * What it does NOT do:
 *  - Delete empty auto-rooms (kept as historical artefact;
 *    may be repopulated later)
 *  - Touch non-auto rooms (rooms without isAutoAllocation:true)
 *  - Modify allocations (read-only against that collection)
 *
 * "Teacher usable" means: User.isActive !== false AND
 * User.isOnLeave !== true. This matches the filter used by
 * GET /api/allocations (allocations.js line 107-109).
 *
 * USAGE:
 *   cd backend
 *   node src/scripts/reconcile-auto-rooms.js
 *
 * Output: prints additions / removals / created-rooms counts.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Allocation = require('../models/Allocation');
const GroupRoom = require('../models/GroupRoom');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('Connected.');

  // ─────────────────────────────────────────────────────────
  // 1. Build the target state: for each teacher, the set of
  //    student IDs they SHOULD have in their auto-room.
  // ─────────────────────────────────────────────────────────
  const activeAllocations = await Allocation.find({ status: 'Active' })
    .populate('teacherId', 'firstName lastName isActive isOnLeave')
    .lean();

  // Filter: teacher must be usable
  const usableAllocations = activeAllocations.filter(a => {
    if (!a.teacherId) return false;
    if (a.teacherId.isActive === false) return false;
    if (a.teacherId.isOnLeave === true) return false;
    return true;
  });

  console.log(`Found ${activeAllocations.length} Active allocations; ${usableAllocations.length} with usable teacher.`);

  // teacherId → Set of student IDs (strings)
  const target = new Map();
  // teacherId → teacher document (for name when creating rooms)
  const teacherDocs = new Map();

  for (const a of usableAllocations) {
    const tid = a.teacherId._id.toString();
    const sid = a.studentId.toString();
    if (!target.has(tid)) target.set(tid, new Set());
    target.get(tid).add(sid);
    teacherDocs.set(tid, a.teacherId);
  }

  // ─────────────────────────────────────────────────────────
  // 2. Build the current state: for each auto-room, which
  //    students it currently contains.
  // ─────────────────────────────────────────────────────────
  const autoRooms = await GroupRoom.find({ isAutoAllocation: true }).lean();
  console.log(`Found ${autoRooms.length} existing auto-allocation rooms.`);

  // teacherId → room (string→doc)
  const roomByTeacher = new Map();
  for (const r of autoRooms) {
    if (r.teacher) roomByTeacher.set(r.teacher.toString(), r);
  }

  // ─────────────────────────────────────────────────────────
  // 3. Reconcile.
  // ─────────────────────────────────────────────────────────
  let roomsCreated = 0;
  let studentsAdded = 0;
  let studentsRemoved = 0;

  // (a) Teachers in target — ensure room exists with right students
  for (const [tid, studentSet] of target.entries()) {
    const targetIds = new Set([...studentSet].map(s => s.toString()));

    let room = roomByTeacher.get(tid);

    if (!room) {
      // Create new room
      const teacher = teacherDocs.get(tid);
      const teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Teacher';
      const newRoom = await GroupRoom.create({
        name: `${teacherName} — All Students`,
        subject: 'General',
        teacher: tid,
        students: [...targetIds],
        capacity: 100,
        status: 'Active',
        isAutoAllocation: true,
      });
      console.log(`  + created room '${newRoom.name}' with ${targetIds.size} student(s)`);
      roomsCreated++;
      studentsAdded += targetIds.size;
      continue;
    }

    // Existing room — reconcile membership
    const currentIds = new Set((room.students || []).map(id => id.toString()));

    const toAdd = [...targetIds].filter(id => !currentIds.has(id));
    const toRemove = [...currentIds].filter(id => !targetIds.has(id));

    if (toAdd.length > 0 || toRemove.length > 0) {
      await GroupRoom.findByIdAndUpdate(room._id, {
        $set: { students: [...targetIds] }
      });
      if (toAdd.length > 0) {
        console.log(`  + ${room.name}: added ${toAdd.length} student(s)`);
        studentsAdded += toAdd.length;
      }
      if (toRemove.length > 0) {
        console.log(`  - ${room.name}: removed ${toRemove.length} student(s) (no longer have active allocation)`);
        studentsRemoved += toRemove.length;
      }
    }
  }

  // (b) Auto-rooms whose teacher has NO usable active allocations —
  //     empty them but don't delete (admin may want to see the artefact)
  for (const [tid, room] of roomByTeacher.entries()) {
    if (target.has(tid)) continue; // handled in (a)
    const currentIds = (room.students || []).map(id => id.toString());
    if (currentIds.length > 0) {
      await GroupRoom.findByIdAndUpdate(room._id, { $set: { students: [] } });
      console.log(`  - ${room.name}: emptied ${currentIds.length} student(s) (teacher has no usable active allocations)`);
      studentsRemoved += currentIds.length;
    }
  }

  // ─────────────────────────────────────────────────────────
  // 4. Summary
  // ─────────────────────────────────────────────────────────
  console.log('\nReconciliation complete.');
  console.log(`  Rooms created: ${roomsCreated}`);
  console.log(`  Students added: ${studentsAdded}`);
  console.log(`  Students removed: ${studentsRemoved}`);
  console.log(`  (Re-running this script will report 0 changes if already in sync.)`);

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
