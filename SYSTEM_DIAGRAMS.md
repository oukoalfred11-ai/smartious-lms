# Teacher Leave Management - Visual System Overview

## 📋 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SMARTIOUS LEAVE MANAGEMENT                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐           ┌──────────────────────────────┐
│    TEACHER PORTAL            │           │     ADMIN PORTAL             │
├──────────────────────────────┤           ├──────────────────────────────┤
│                              │           │                              │
│ 📅 Leave Requests Page       │           │ 📊 Leave Management Page     │
│ ├─ Apply for Leave           │           │ ├─ Dashboard Stats           │
│ ├─ Calendar Date Picker      │           │ ├─ Request Filtering         │
│ ├─ Leave Type Select         │           │ ├─ Status Tabs               │
│ ├─ Reason Text Area          │           │ ├─ Request Details Modal     │
│ ├─ Submit Button             │           │ ├─ Approve Button            │
│ ├─ Leave History             │           │ ├─ Reject with Reason        │
│ ├─ Statistics               │           │ └─ Affected Students Count   │
│ └─ Upcoming Leave Card       │           │                              │
│                              │           │                              │
└──────────────────────────────┘           └──────────────────────────────┘
         │                                          │
         │                                          │
         ▼                                          ▼
┌──────────────────────────────────────────────────────────────┐
│              EXPRESS.JS BACKEND ROUTES                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Teacher Routes:                  Admin Routes:              │
│  ├─ POST /leave-requests          ├─ GET /leave-requests    │
│  ├─ GET /my-requests              ├─ PATCH /:id/approve     │
│  └─ PATCH /:id/cancel             └─ PATCH /:id/reject      │
│                                                               │
│  Shared:                                                      │
│  └─ GET /pending-count                                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│         NODEMAILER EMAIL SERVICE                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  📧 sendLeaveRequestSubmittedEmail()                         │
│     ↓                                                        │
│  📧 sendAdminLeaveRequestNotification()                      │
│     ↓                                                        │
│  📧 sendLeaveRequestApprovedEmail() OR                       │
│     sendLeaveRequestRejectedEmail()                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│         MONGODB DATABASE                                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Collection: TeacherLeaveRequest                             │
│  ├─ teacherId (indexed)                                      │
│  ├─ leaveStartDate                                           │
│  ├─ leaveEndDate                                             │
│  ├─ leaveType                                                │
│  ├─ status (indexed)                                         │
│  ├─ approvedBy                                               │
│  ├─ affectedAllocations                                      │
│  └─ timestamps                                               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Leave Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│               LEAVE REQUEST LIFECYCLE                              │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: TEACHER APPLIES
┌─────────────────────────────────────────────────────────────────────┐
│ Teacher navigates to Leave Requests                                │
│ └─ Clicks "Apply for Leave"                                        │
│    └─ Selects Leave Type (Personal/Medical/Emergency/Other)       │
│       └─ Picks Start & End dates from Calendar                    │
│          └─ Enters Reason                                          │
│             └─ Clicks Submit                                       │
│                └─ Status: PENDING ⏳                                │
│                   └─ Email 1️⃣ sent to Teacher (confirmation)      │
│                   └─ Email 2️⃣ sent to Admin(s) (notification)     │
└─────────────────────────────────────────────────────────────────────┘

STEP 2: ADMIN REVIEWS
┌─────────────────────────────────────────────────────────────────────┐
│ Admin navigates to Leave Management                                │
│ └─ Sees request in "Pending" tab                                   │
│    └─ Clicks to view full details                                  │
│       └─ Reviews:                                                   │
│          • Teacher name & email                                    │
│          • Leave dates & duration                                  │
│          • Reason for leave                                        │
│          • Number of affected students                             │
└─────────────────────────────────────────────────────────────────────┘

STEP 3: ADMIN DECIDES
┌─────────────────────────────────────────────────────────────────────┐
│ Admin clicks "Approve" OR "Reject"                                 │
│                                                                     │
│ PATH A: APPROVE ✅                                                  │
│ ├─ Status: APPROVED ✅                                              │
│ ├─ System marks affected students                                  │
│ ├─ Teacher status set to "On Leave Approved"                      │
│ └─ Email 3️⃣ sent to Teacher (approval)                             │
│    └─ Teacher sees in "Upcoming Leave" card                        │
│    └─ Students see temporary teacher assignment                    │
│                                                                     │
│ PATH B: REJECT ❌                                                   │
│ ├─ Admin enters rejection reason                                   │
│ ├─ Status: REJECTED ❌                                              │
│ ├─ Email 3️⃣ sent to Teacher (rejection + reason)                   │
│ └─ Teacher can resubmit for different dates                        │
└─────────────────────────────────────────────────────────────────────┘

STEP 4: TEACHER VIEWS RESULT
┌─────────────────────────────────────────────────────────────────────┐
│ Teacher checks Leave Requests page                                 │
│ └─ Sees updated status in history                                  │
│    └─ If Approved ✅:                                               │
│       ├─ Shows in "Upcoming Leave" section                         │
│       ├─ Students auto-reassigned (future feature)                │
│       └─ Can't cancel (approved)                                   │
│    └─ If Rejected ❌:                                               │
│       ├─ Shows rejection reason                                    │
│       └─ Can submit new request                                    │
│    └─ If Pending ⏳:                                                │
│       └─ Can cancel before admin decides                           │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagram

```
TEACHER                      API                          DATABASE
  │                           │                              │
  ├──→ Fill Form              │                              │
  │    • Dates                 │                              │
  │    • Type                  │                              │
  │    • Reason                │                              │
  │                            │                              │
  ├──→ POST /leave-requests ──→│                              │
  │                            │─→ Create Record ──→ 💾 MongoDB
  │                            │                              │
  │                            │─→ Validate ✓                │
  │                            │                              │
  │                            │─→ Find Allocations ←──── 🔍 Query
  │                            │   (affected students)        │
  │                            │                              │
  │                            │─→ Send Emails 📧             │
  │                            │   (teacher + admins)         │
  │                            │                              │
  │    ← 201 Created ──────────│                              │
  │                            │                              │
  └──→ GET /my-requests ──────→│                              │
       (see history)           │─→ Query ──────────→ 🔍 Filter
                               │   Teacher's Requests         │
                               │←──── Fetch ────────── 💾 Results
                               │                              │
                               ←─ Return List                 │
                               │
                               ADMIN
                               │
                               ├──→ GET /leave-requests ──→
                               │    (filter by status)        │
                               │─────→ 🔍 Filter
                               │      "Pending"
                               │←────── Fetch ────────── 💾
                               │
                               ├──→ View Details
                               │
                               ├──→ PATCH /:id/approve ──→
                               │    (or reject)               │
                               │─────→ Update Record ──→ 💾
                               │       • Status
                               │       • Approved By
                               │       • Timestamps
                               │─────→ Send Email 📧
                               │
                               ←─ 200 OK
                               │
```

## 🔐 Authorization & Security Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SECURITY & AUTHORIZATION                        │
└─────────────────────────────────────────────────────────────────────┘

Every Request:
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Check JWT Token                                                 │
│    ✓ Valid   → Continue                                            │
│    ✗ Invalid → 401 Unauthorized                                    │
│                                                                     │
│ 2. Extract User Role                                               │
│    • teacher → Can submit, cancel own, view own                   │
│    • admin   → Can view all, approve, reject                      │
│    • other   → No access                                           │
│                                                                     │
│ 3. Route Authorization                                             │
│    POST /leave-requests                                            │
│    ├─ Requires: teacher role ✓                                    │
│    ├─ Check: Only own record created ✓                            │
│    └─ Validate: Dates, reason, type ✓                             │
│                                                                     │
│    GET /my-requests                                                │
│    ├─ Requires: teacher role ✓                                    │
│    ├─ Filter: Only own requests ✓                                 │
│    └─ Return: Private data only ✓                                 │
│                                                                     │
│    GET /leave-requests                                             │
│    ├─ Requires: admin role ✓                                      │
│    ├─ Filter: By status query param ✓                             │
│    └─ Return: All admin can see ✓                                 │
│                                                                     │
│    PATCH /:id/approve or reject                                    │
│    ├─ Requires: admin role ✓                                      │
│    ├─ Check: Record exists ✓                                      │
│    ├─ Validate: Status is "Pending" ✓                             │
│    └─ Update: Database + Send emails ✓                            │
│                                                                     │
│    PATCH /:id/cancel                                               │
│    ├─ Requires: teacher or admin role ✓                           │
│    ├─ Check: Can only cancel own (teacher) ✓                      │
│    ├─ Validate: Status must be "Pending" ✓                        │
│    └─ Block: Can't cancel approved ✓                              │
└─────────────────────────────────────────────────────────────────────┘

Data Validation:
┌─────────────────────────────────────────────────────────────────────┐
│ • leaveStartDate required                                          │
│ • leaveEndDate required                                            │
│ • leaveEndDate > leaveStartDate (no same-day leave)                │
│ • leaveReason min 5 chars, max 500 chars                           │
│ • leaveType must be in enum                                        │
│ • Teacher must exist and be active                                 │
│ • No overlap with existing approved leave                          │
└─────────────────────────────────────────────────────────────────────┘
```

## 📱 UI Component Hierarchy

```
┌─ TeacherPortal (Page)
│  ├─ Sidebar Navigation
│  │  └─ Leave Requests Menu Item
│  │
│  └─ Main Content Area
│     └─ TeacherLeaveRequest Component
│        ├─ Header (title + button)
│        ├─ Stats Grid (4 KPI cards)
│        ├─ Upcoming Leave Card
│        ├─ Leave History Section
│        │  └─ Leave Request Cards
│        │     └─ Status Badge
│        └─ Apply Leave Modal
│           ├─ Form Group (type select)
│           ├─ Calendar Component
│           │  ├─ Month Navigation
│           │  ├─ Day Grid
│           │  └─ Selected Range Display
│           ├─ Reason Text Area
│           └─ Submit Button

┌─ AdminPortal (Page)
│  ├─ Sidebar Navigation
│  │  └─ Leave Management Menu Item
│  │
│  └─ Main Content Area
│     └─ LeaveManagement Component
│        ├─ Header (title)
│        ├─ Stats Grid (4 KPI cards)
│        ├─ Status Filter Buttons
│        ├─ Leave Requests Table
│        │  └─ Table Rows (click for details)
│        └─ Leave Request Detail Modal
│           ├─ Teacher Card
│           ├─ Details Grid
│           ├─ Duration Alert
│           ├─ Reason Display
│           ├─ Affected Students Alert
│           ├─ Approval Details
│           ├─ Action Buttons
│           └─ Rejection Input (conditional)
```

## 🔗 Database Relationships

```
User (Teacher)
   │
   ├─→ TeacherLeaveRequest (many)
   │   ├─ teacherId (FK)
   │   ├─ approvedBy (FK to User/Admin)
   │   ├─ temporaryReplacementTeacherId (FK)
   │   └─ affectedAllocations (Array of FK to Allocation)
   │
   └─→ Allocation (many)
       └─ When Leave Approved:
          • Allocations marked as affected
          • Future: auto-reassign to temp teacher
          • Students notified of temp teacher
```

## 📞 Email Template Structure

```
Email 1: Leave Submitted (Confirmation to Teacher)
┌─────────────────────────────────────────────────┐
│ HEADER: Leave Request Submitted ✓              │
│ ─────────────────────────────────────────────── │
│ Hi [Teacher Name],                              │
│                                                 │
│ Your leave request has been submitted.          │
│                                                 │
│ DETAILS:                                        │
│ • Type: [Type]                                  │
│ • Period: [Date] to [Date]                      │
│ • Duration: [N] days                            │
│ • Reason: [Reason]                              │
│ • Status: ⏳ Pending Review                      │
│                                                 │
│ NEXT: Admin will review shortly.               │
│ LINK: View in Dashboard                         │
│ ─────────────────────────────────────────────── │
└─────────────────────────────────────────────────┘

Email 2: New Leave Request (Notification to Admin)
┌─────────────────────────────────────────────────┐
│ HEADER: New Leave Request 🔔                    │
│ ─────────────────────────────────────────────── │
│ Hello Admin,                                    │
│                                                 │
│ [Teacher Name] submitted new leave request.    │
│                                                 │
│ DETAILS:                                        │
│ • Teacher: [Name] ([Email])                     │
│ • Type: [Type]                                  │
│ • Period: [Date] to [Date]                      │
│ • Reason: [Reason]                              │
│ • Affected: [N] students                        │
│                                                 │
│ ACTION: Review in admin portal                 │
│ LINK: Approve/Reject                            │
│ ─────────────────────────────────────────────── │
└─────────────────────────────────────────────────┘

Email 3a: Leave Approved (Confirmation to Teacher)
┌─────────────────────────────────────────────────┐
│ HEADER: Leave Approved ✅                       │
│ ─────────────────────────────────────────────── │
│ Hi [Teacher Name],                              │
│                                                 │
│ Great news! Your leave is approved.             │
│                                                 │
│ DETAILS:                                        │
│ • Type: [Type]                                  │
│ • Period: [Date] to [Date]                      │
│ • Approved by: [Admin Name]                     │
│ • Students affected: [N] students               │
│                                                 │
│ NOTE: Students reassigned temporarily.         │
│ ─────────────────────────────────────────────── │
└─────────────────────────────────────────────────┘

Email 3b: Leave Rejected (To Teacher)
┌─────────────────────────────────────────────────┐
│ HEADER: Leave Request Rejected ❌               │
│ ─────────────────────────────────────────────── │
│ Hi [Teacher Name],                              │
│                                                 │
│ Your leave could not be approved.               │
│                                                 │
│ REASON: [Reason provided by admin]              │
│                                                 │
│ REQUEST:                                        │
│ • Type: [Type]                                  │
│ • Period: [Date] to [Date]                      │
│                                                 │
│ NEXT: Submit for different dates                │
│ ─────────────────────────────────────────────── │
└─────────────────────────────────────────────────┘
```

## ⚡ Performance Optimization

```
Database Indexes:
┌─────────────────────────────────────────────────┐
│ • teacherId (frequent filter)                   │
│ • status (frequent filter)                      │
│ • leaveStartDate (range queries)                │
│ • createdAt (sorting)                           │
└─────────────────────────────────────────────────┘

API Response Caching:
┌─────────────────────────────────────────────────┐
│ • GET /my-requests → cache 1 min                │
│ • GET /leave-requests → cache 30 sec            │
│ • GET /pending-count → cache 15 sec             │
└─────────────────────────────────────────────────┘

Frontend Optimization:
┌─────────────────────────────────────────────────┐
│ • Lazy load leave modal                         │
│ • Debounce calendar navigation                  │
│ • Memoize status badge colors                   │
│ • Virtual scroll for large lists                │
└─────────────────────────────────────────────────┘
```

---

This diagram provides a comprehensive visual overview of the teacher leave management system architecture and data flows.

