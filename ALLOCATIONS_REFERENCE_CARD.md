# Student Allocations - Reference Card

## 🎯 Main Workflow at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│              STUDENT ALLOCATIONS WORKFLOW                   │
└─────────────────────────────────────────────────────────────┘

STEP 1: VIEW STUDENTS
┌─────────────────────────────────────────────────────────────┐
│  Admin Portal → Click "Allocations"                         │
│  ↓                                                           │
│  See table of all students with subjects                    │
│  ├─ Search box: Find by name or email                       │
│  ├─ Orange row = pending allocation needed                 │
│  ├─ White row = all subjects allocated                     │
│  └─ "Manage" button on each row                             │
└─────────────────────────────────────────────────────────────┘

STEP 2: SELECT STUDENT
┌─────────────────────────────────────────────────────────────┐
│  Click "Manage" on student row                              │
│  ↓                                                           │
│  Student detail modal opens                                 │
│  ├─ Header shows: Curriculum, Year/Grade, Email            │
│  ├─ Body lists all subjects with status                    │
│  └─ Footer has Close button (X)                             │
└─────────────────────────────────────────────────────────────┘

STEP 3: ALLOCATE SUBJECT
┌─────────────────────────────────────────────────────────────┐
│  In student modal, find subject to allocate                │
│  ↓                                                           │
│  If unallocated (RED): Click "Allocate"                    │
│  If allocated (WHITE): Click "Change"                       │
│  ↓                                                           │
│  Teacher selection modal opens                              │
│  ├─ Shows qualified teachers only                           │
│  ├─ Click teacher to select (blue highlight)              │
│  └─ Click "Allocate" to confirm                             │
│  ↓                                                           │
│  Success! ✓                                                 │
│  ├─ Subject now shows teacher name                         │
│  ├─ Emails sent to teacher & student                       │
│  └─ Allocation saved to database                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Legend

```
🔴 RED / ORANGE
  ├─ Unallocated subject (needs teacher)
  ├─ "Allocate" button color
  ├─ Row background when student has pending
  └─ Pending allocation badge

🟢 GREEN
  ├─ "✓ Complete" status indicator
  ├─ "Change" button color
  ├─ Fully allocated count text
  └─ Success states

🔵 BLUE
  ├─ Teacher selection highlight
  ├─ Curriculum badge
  ├─ Allocated count text
  └─ Primary action color

⚪ WHITE / GRAY
  ├─ Allocated subject background
  ├─ Fully allocated student row
  └─ Neutral/unselected states
```

---

## 📊 Data at a Glance

### Students Table Columns
```
┌──────────────┬────────────┬──────────┬─────────────┬──────────────┬────────┐
│ Student      │ Curriculum │ Year/Gr  │ Allocated   │ Pending      │ Action │
├──────────────┼────────────┼──────────┼─────────────┼──────────────┼────────┤
│ Name + Email │ IGCSE/IB   │ Form 3   │ 3/5         │ 2 pending    │ Manage │
│ (with avatar)│ (badge)    │ (text)   │ (fraction)  │ (badge)      │        │
└──────────────┴────────────┴──────────┴─────────────┴──────────────┴────────┘
```

### Student Modal Content
```
┌─────────────────────────────────────────────────┐
│ Curriculum: IGCSE      Year/Grade: Form 3       │
│ Email: student@...     Total Subjects: 3/5      │
├─────────────────────────────────────────────────┤
│                                                  │
│ ┌─────────────────────────────────────────────┐│
│ │ Mathematics                                  ││
│ │ Teacher: Mr. Muthomi                         ││
│ │                                       [Change]││
│ └─────────────────────────────────────────────┘│
│                                                  │
│ ┌─────────────────────────────────────────────┐│ ← RED BACKGROUND
│ │ Biology                                      ││
│ │ ⚠ No teacher assigned                        ││
│ │                                    [Allocate]││
│ └─────────────────────────────────────────────┘│
│                                                  │
│ ... more subjects ...                           │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🔑 Key Abbreviations

```
IGCSE   = International General Certificate of Secondary Education
IB      = International Baccalaureate
CBC     = Competency Based Curriculum (Kenya)
KCSE    = Kenya Certificate of Secondary Education
API     = Application Programming Interface
3-Point Check = Validation: Student + Subject + Curriculum + Teacher
```

---

## ⚡ Quick Actions Reference

### From Students Table
| Action | Result |
|--------|--------|
| Type in search | Filters students by name or email |
| Click "Manage" | Opens student detail modal |
| Scroll | View more students if list is long |

### From Student Modal
| Action | Result |
|--------|--------|
| Click "Allocate" (red button) | Opens teacher selection modal |
| Click "Change" (green button) | Opens teacher selection modal for reassignment |
| Click [X] or close | Closes modal, saves changes |

### From Teacher Selection Modal
| Action | Result |
|--------|--------|
| Click teacher name | Selects that teacher (blue highlight) |
| Click "Allocate" | Confirms selection, creates allocation |
| Click "Cancel" | Closes modal without saving |

---

## 🚨 Error Messages & Solutions

```
ERROR: "No students with enrolled subjects found"
└─ SOLUTION: Students exist but have no subjects assigned
   → Add subjects to students first
   → Or enroll students in subjects
   → Then return to this page

ERROR: "No qualified teachers for this subject + curriculum"
└─ SOLUTION: No matching teachers found
   → Teacher might not teach this subject
   → Teacher might not teach subject for this curriculum
   → Add specialty to teacher profile first

ERROR: "Loading allocations..."
└─ SOLUTION: Data is loading from server
   → Wait a moment for data to load
   → Check internet connection
   → Try refreshing the page

SUCCESS: "Allocation created successfully"
└─ ACTION TAKEN:
   → Subject now assigned to teacher
   → Emails sent to teacher & student
   → Student's allocation count updated
   → Allocation saved to database
```

---

## 📱 Responsive Design Notes

```
Desktop (1200px+)       Tablet (768-1200px)     Mobile (< 768px)
├─ Full table           ├─ Table scrolls         ├─ Table scrolls
├─ All columns visible  ├─ Some col hidden       ├─ Most col hidden
├─ Modals full size     ├─ Modals 90% width      ├─ Modals full screen
└─ 3 col grid           └─ 2 col grid            └─ 1 col stack
```

---

## 🔐 Security & Validation

```
Authentication
└─ Must be logged in as Admin
   └─ Role check: auth, requireRole('admin')

Authorization
└─ Can only view/allocate their students
   └─ Check: req.user._id === student._id OR admin

Data Validation (3-Point Check)
├─ Student exists and has curriculum
├─ Subject exists and student enrolled
└─ Teacher qualified (has subject specialty for curriculum)

Rate Limiting (Backend)
└─ Standard API rate limits apply

Email Notifications
├─ Teacher notified of allocation
└─ Student notified of teacher assignment
```

---

## 💾 Data Storage

```
Database Collections Used:
├─ Users (students, teachers, admins)
├─ Allocations (student-teacher-subject relationships)
└─ Subjects (subject definitions)

Allocation Record Contains:
├─ studentId (reference to User)
├─ teacherId (reference to User)
├─ subjectId (reference to Subject)
├─ curriculum (denormalized for speed)
├─ status (Active/Pending/Inactive/Completed)
├─ emailsSent (boolean)
├─ createdAt, createdBy
├─ updatedAt, updatedBy
└─ notes (optional)

Unique Constraint:
└─ One teacher per subject per student
   └─ Index: { studentId, subjectId } unique
```

---

## 🎯 Common Scenarios

### Scenario 1: New Student
```
Student enrolls in 4 subjects
├─ Click Manage
├─ See 4 red cards (all unallocated)
├─ Allocate teacher 1 → Subject 1
├─ Allocate teacher 2 → Subject 2
├─ Allocate teacher 3 → Subject 3
├─ Allocate teacher 4 → Subject 4
└─ All now show "✓ Complete" ✅
```

### Scenario 2: Teacher on Leave
```
Subject currently has Teacher A
├─ Click Manage
├─ Find subject with Teacher A name
├─ Click "Change"
├─ Select Teacher B
├─ Confirm allocation
└─ Subject now shows Teacher B ✅
```

### Scenario 3: New Subject Added
```
Student adds 5th subject
├─ Allocation count now shows "4/5"
├─ Click Manage
├─ See the new subject (red card)
├─ Click "Allocate"
├─ Select teacher
└─ Now shows "5/5 Complete" ✅
```

---

## 📈 Performance Considerations

```
Data Loading
├─ Loads all students once
├─ Loads all allocations once
├─ Each teacher lookup hits /suggest-teachers API
└─ Typical load time: < 2 seconds

Search Performance
├─ Client-side filtering (fast)
└─ No API calls needed

Allocation Performance
├─ POST creates allocation (< 1 second)
├─ Emails sent asynchronously
└─ UI refreshes immediately

Recommended Batch Sizes
├─ < 1000 students per view
├─ < 5000 allocations per view
└─ If larger, add pagination
```

---

## 🔗 Related Pages

```
Admin Portal
├─ Dashboard (overview)
├─ Users (add/edit students & teachers)
├─ Teachers (view teacher profiles)
├─ Allocations (THIS PAGE)
├─ Curriculum (manage subject offerings)
└─ ... other admin pages

Each teacher profile should have:
├─ Teaching Specialties (subject + curriculum pairs)
├─ Active/Inactive status
└─ Contact information
```

---

## 📞 Quick Reference Links

- **Quick Start Guide:** ALLOCATIONS_QUICK_START.md
- **Before/After:** ALLOCATIONS_UI_BEFORE_AFTER.md
- **Technical Docs:** ALLOCATIONS_UI_UPDATE.md
- **This Reference:** ALLOCATIONS_REFERENCE_CARD.md

---

**Created:** April 19, 2026  
**Status:** ✅ Ready for Production  
**Version:** 1.0  
**Frontend Build:** ✅ Verified

