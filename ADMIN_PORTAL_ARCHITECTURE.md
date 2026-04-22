# SMARTIOUS ADMIN PORTAL: COMPLETE SYSTEM ARCHITECTURE

**Last Updated:** April 18, 2026  
**Version:** 2.0 (Fresh Start)  
**Status:** Architecture & Implementation Guide

---

## TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [User Workflows](#user-workflows)
7. [Features & Modules](#features--modules)
8. [Tech Stack](#tech-stack)

---

## SYSTEM OVERVIEW

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    ADMIN PORTAL SYSTEM                        │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              FRONTEND (React + Vite)                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │ │
│  │  │  Dashboard   │  │  Users Mgmt  │  │  Teachers   │   │ │
│  │  ├──────────────┤  ├──────────────┤  ├─────────────┤   │ │
│  │  │ - Analytics  │  │ - Create     │  │ - Create    │   │ │
│  │  │ - Reports    │  │ - Edit       │  │ - List      │   │ │
│  │  │ - Quick View │  │ - Delete     │  │ - Allocate  │   │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘   │ │
│  │                                                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │ │
│  │  │ Allocations  │  │ Curriculum   │  │ Settings    │   │ │
│  │  ├──────────────┤  ├──────────────┤  ├─────────────┤   │ │
│  │  │ - Matching   │  │ - Subjects   │  │ - Config    │   │ │
│  │  │ - Assign     │  │ - Categories │  │ - Profiles  │   │ │
│  │  │ - History    │  │ - Manage     │  │ - Logs      │   │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘   │ │
│  │                                                           │ │
│  │  Global Components:                                       │ │
│  │  - AuthGuard (forcePasswordChange redirect)             │ │
│  │  - TopNav (navigation, logout)                          │ │
│  │  - Sidebar (role-based menu)                            │ │
│  │  - Modal (confirmations, forms)                         │ │
│  │  - Toast (notifications)                                │ │
│  │  - WebSocket (real-time updates)                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            ↕                                   │
│                      HTTP + WebSocket                          │
│                            ↕                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           BACKEND (Express.js + Node.js)                │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │ │
│  │  │ Auth Routes  │  │ User Routes  │  │ Teacher API │   │ │
│  │  ├──────────────┤  ├──────────────┤  ├─────────────┤   │ │
│  │  │ - Login      │  │ - GET all    │  │ - GET list  │   │ │
│  │  │ - Logout     │  │ - POST new   │  │ - POST new  │   │ │
│  │  │ - Register   │  │ - PATCH edit │  │ - PATCH edit│   │ │
│  │  │ - Reset pwd  │  │ - DELETE     │  │ - DELETE    │   │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘   │ │
│  │                                                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │ │
│  │  │ Allocations  │  │ Curriculum   │  │ Socket.io   │   │ │
│  │  ├──────────────┤  ├──────────────┤  ├─────────────┤   │ │
│  │  │ - Match      │  │ - GET        │  │ - Real-time │   │ │
│  │  │ - Assign     │  │ - POST       │  │ - Events    │   │ │
│  │  │ - Notify     │  │ - Update     │  │ - Broadcast │   │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘   │ │
│  │                                                           │ │
│  │  Services Layer:                                          │ │
│  │  - emailService (Nodemailer)                            │ │
│  │  - matchingService (algorithms)                         │ │
│  │  - credentialsService (pwd generation)                  │ │
│  │  - authGuardService (redirects)                         │ │
│  │  - crossBoardMatchingService (subjects)                 │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            ↕                                   │
│                      Mongoose ODM                              │
│                            ↕                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │        MONGODB DATABASE (Cloud Atlas)                   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐ │ │
│  │  │ Users    │  │ Teachers │  │Subject │  │Allocate  │ │ │
│  │  │          │  │          │  │        │  │          │ │ │
│  │  │ - _id    │  │ - _id    │  │ - _id  │  │ - _id    │ │ │
│  │  │ - email  │  │ - email  │  │ - name │  │ - teacher│ │ │
│  │  │ - pwd    │  │ - phone  │  │ - cat  │  │ - student│ │ │
│  │  │ - role   │  │ - subject│  │ - currc│  │ - subject│ │ │
│  │  │ - active │  │ - curric │  │ - board│  │ - matched│ │ │
│  │  └──────────┘  └──────────┘  └────────┘  └──────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## FRONTEND ARCHITECTURE

### Directory Structure

```
frontend/src/
├── pages/
│   ├── admin/
│   │   ├── AdminPortal.jsx          (Main container)
│   │   └── pages/
│   │       ├── Dashboard.jsx         (Analytics & stats)
│   │       ├── Users.jsx             (User management)
│   │       ├── Teachers.jsx          (Teacher management)
│   │       ├── Allocations.jsx       (Matching & assign)
│   │       ├── Curriculum.jsx        (Subjects management)
│   │       ├── Settings.jsx          (Configuration)
│   │       └── Reports.jsx           (Analytics reports)
│   ├── LoginPage.jsx
│   ├── SecureResetPage.jsx
│   └── VerifyEmailPage.jsx
│
├── components/
│   ├── admin/
│   │   ├── AdminNav.jsx              (Top navigation)
│   │   ├── AdminSidebar.jsx          (Role-based menu)
│   │   ├── Dashboard/
│   │   │   ├── StatsCard.jsx
│   │   │   ├── Chart.jsx
│   │   │   └── RecentActivity.jsx
│   │   ├── Users/
│   │   │   ├── UserTable.jsx
│   │   │   ├── UserForm.jsx
│   │   │   └── UserModal.jsx
│   │   ├── Teachers/
│   │   │   ├── TeacherTable.jsx
│   │   │   ├── TeacherForm.jsx
│   │   │   ├── TeacherModal.jsx
│   │   │   └── CurriculumSubjectSelector.jsx
│   │   └── Allocations/
│   │       ├── AllocationTable.jsx
│   │       ├── MatchingPanel.jsx
│   │       ├── SubjectFilter.jsx
│   │       └── AllocationForm.jsx
│   ├── AuthGuard.jsx                 (Password reset guard)
│   ├── ProtectedRoute.jsx
│   └── ui/
│       ├── Modal.jsx
│       ├── Toast.jsx
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Select.jsx
│
├── hooks/
│   ├── useTeacherMenuSync.js         (WebSocket real-time)
│   ├── useAuth.js
│   ├── useFetch.js
│   └── useForm.js
│
├── context/
│   ├── AuthContext.jsx
│   ├── AdminContext.jsx
│   └── SocketContext.jsx
│
├── styles/
│   ├── admin.css
│   ├── components.css
│   └── responsive.css
│
├── utils/
│   ├── api.js                       (Axios instance)
│   ├── validators.js
│   └── formatters.js
│
└── App.jsx

```

### Frontend State Management

```
Global State (Context API):
├── AuthContext
│   ├── user (current logged-in admin)
│   ├── token (JWT)
│   ├── isAuthenticated
│   ├── forcePasswordChange (redirect flag)
│   ├── login(email, password)
│   ├── logout()
│   └── updatePassword(current, new)
│
├── AdminContext
│   ├── dashboard (stats)
│   ├── users (list)
│   ├── teachers (list)
│   ├── allocations (list)
│   ├── selectedUser / selectedTeacher
│   ├── filters (curriculum, status, etc)
│   ├── pagination (page, limit, total)
│   └── actions (create, update, delete)
│
└── SocketContext
    ├── socket (Socket.io instance)
    ├── isConnected (boolean)
    ├── events (TEACHER_CREATED, USER_CREATED, etc)
    └── emit/listen methods
```

---

## BACKEND ARCHITECTURE

### Directory Structure

```
backend/src/
├── index.js                         (Express + Socket.io setup)
│
├── models/                          (Mongoose schemas)
│   ├── User.js                      (Students, Teachers, Admins, Parents)
│   ├── Teacher.js                   (Teacher profile)
│   ├── Subject.js                   (Curriculum subjects)
│   ├── Allocation.js                (Teacher-Student matching)
│   ├── Curriculum.js                (Curriculum boards)
│   ├── GroupRoom.js                 (Group sessions)
│   ├── Payroll.js                   (Payment records)
│   ├── SiteConfig.js                (System settings)
│   └── Programme.js                 (Programs)
│
├── routes/                          (API endpoints)
│   ├── auth.js                      (Authentication)
│   ├── users.js                     (User management)
│   ├── teachers.js                  (Teacher management)
│   ├── allocations.js               (Matching & assignment)
│   ├── subjects.js                  (Curriculum subjects)
│   ├── curriculum.js                (Curriculum boards)
│   ├── dashboard.js                 (Analytics)
│   ├── messages.js                  (Messaging)
│   ├── lessons.js                   (Lesson management)
│   ├── exams.js                     (Exam management)
│   ├── progress.js                  (Student progress)
│   ├── reports.js                   (Reporting)
│   └── settings.js                  (Configuration)
│
├── services/                        (Business logic)
│   ├── emailService.js              (Nodemailer)
│   ├── matchingService.js           (Matching algorithms)
│   ├── credentialsService.js        (Temp password gen)
│   ├── crossBoardMatchingService.js (Subject matching)
│   ├── authGuardService.js          (Auth logic)
│   └── socketService.js             (Real-time events)
│
├── middleware/
│   ├── auth.js                      (JWT verification)
│   ├── errorHandler.js
│   └── roleCheck.js
│
├── seeds/
│   ├── seedSubjects.js              (Curriculum data)
│   ├── seedCurriculum.js
│   └── seedDemo.js
│
└── config/
    ├── database.js
    └── constants.js

```

### Backend Request Flow

```
Client Request
  ↓
Express Middleware (CORS, body parser)
  ↓
Route Handler (/api/...)
  ↓
Authentication Middleware (JWT verify)
  ↓
Role Authorization Middleware
  ↓
Route Logic
  ↓
Service Layer (business logic)
  ↓
Database Operation (Mongoose)
  ↓
Response → Socket.io Broadcast (if needed)
  ↓
JSON Response to Client
```

---

## DATABASE SCHEMA

### User Collection

```javascript
{
  _id: ObjectId,
  
  // Identity
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  
  // Role & Access
  role: Enum["admin", "teacher", "student", "parent", "demo"],
  isActive: Boolean (default: true),
  isDemo: Boolean (default: false),
  isEmailVerified: Boolean (default: false),
  
  // Profile
  phone: String,
  avatar: String (URL),
  bio: String,
  
  // Education
  curriculum: Enum["IGCSE", "A-Level", "IB Diploma", "IB MYP", "Kenya CBC", "BNC", "American"],
  grade: String,
  subjects: [ObjectId] (ref: Subject),
  plan: Enum["Basic", "Premium", "Staff"],
  
  // Relationships
  parentId: ObjectId (ref: User),
  children: [ObjectId] (ref: User),
  linkedStudents: [ObjectId] (ref: User),
  linkedParents: [ObjectId] (ref: User),
  
  // Security
  forcePasswordChange: Boolean (default: true),
  credentialsSentCount: Number (default: 0),
  lastCredentialsSentAt: Date,
  verificationToken: String,
  verificationTokenExpiry: Date,
  
  // Gamification
  xp: Number (default: 0),
  streak: Number (default: 0),
  lastActive: Date,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

### Teacher Collection

```javascript
{
  _id: ObjectId,
  
  // Identity
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: String,
  bio: String,
  
  // Qualification
  curriculum: Enum["IGCSE", "A-Level", "IB Diploma", "IB MYP", "Kenya CBC", "BNC", "American"],
  universalCurriculum: Boolean (default: false),
  subjects: [ObjectId] (ref: Subject),
  qualifications: [String],
  experience: Number (years),
  
  // Status
  status: Enum["Active", "Inactive", "On Leave"],
  rating: Number (0-5),
  totalStudents: Number,
  totalSessions: Number,
  
  // Link to User
  userId: ObjectId (ref: User),
  
  // Metadata
  isDemo: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Subject Collection

```javascript
{
  _id: ObjectId,
  
  // Identity
  subjectName: String (required),
  category: String (e.g., "Science", "Mathematics"),
  code: String,
  
  // Classification
  curriculum: Enum["IGCSE", "A-Level", "IB Diploma", "IB MYP", "Kenya CBC", "BNC", "American"],
  
  // Status
  isActive: Boolean (default: true),
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

### Allocation Collection

```javascript
{
  _id: ObjectId,
  
  // References
  studentId: ObjectId (ref: User, required),
  teacherId: ObjectId (ref: Teacher, required),
  subjects: [ObjectId] (ref: Subject),
  
  // Matching Info
  matchScore: Number (0-100),
  matchType: Enum["Perfect Match", "Partial Match"],
  curriculum: String,
  
  // Status
  status: Enum["Active", "Pending", "Completed", "Cancelled"],
  isActive: Boolean (default: true),
  
  // Tracking
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API ENDPOINTS

### Authentication Routes

```javascript
POST   /api/auth/login
       Request: { email, password }
       Response: { token, user }

POST   /api/auth/logout
       Request: { }
       Response: { success }

POST   /api/auth/secure-reset
       Auth: Required
       Request: { currentPassword, newPassword }
       Response: { success, message }

GET    /api/auth/me
       Auth: Required
       Response: { user }
```

### User Management Routes

```javascript
GET    /api/users
       Auth: Required | Role: admin
       Query: { page, limit, role, status }
       Response: { users, pagination }

POST   /api/users
       Auth: Required | Role: admin
       Request: { firstName, lastName, email, role, curriculum, subjects, phone }
       Response: { user, credentialsSent }

GET    /api/users/:id
       Auth: Required | Role: admin
       Response: { user }

PATCH  /api/users/:id
       Auth: Required | Role: admin
       Request: { firstName, lastName, phone, curriculum, subjects, isActive }
       Response: { user }

DELETE /api/users/:id
       Auth: Required | Role: admin
       Response: { success, message }
```

### Teacher Management Routes

```javascript
GET    /api/teachers
       Query: { page, limit, curriculum, status }
       Response: { teachers, pagination }

POST   /api/teachers
       Auth: Required | Role: admin
       Request: { firstName, lastName, email, curriculum, subjects, experience }
       Response: { teacher, credentialsSent }

GET    /api/teachers/:id
       Response: { teacher }

PATCH  /api/teachers/:id
       Auth: Required | Role: admin
       Request: { firstName, lastName, phone, subjects, curriculum, universalCurriculum }
       Response: { teacher }

DELETE /api/teachers/:id
       Auth: Required | Role: admin
       Response: { success, message }
```

### Allocation Routes

```javascript
GET    /api/allocations
       Auth: Required | Role: admin
       Query: { page, limit, status }
       Response: { allocations, pagination }

POST   /api/allocations
       Auth: Required | Role: admin
       Request: { studentId, teacherId, subjects }
       Response: { allocation }

GET    /api/allocations/:id
       Auth: Required | Role: admin
       Response: { allocation }

PATCH  /api/allocations/:id
       Auth: Required | Role: admin
       Request: { status, teacherId }
       Response: { allocation }

DELETE /api/allocations/:id
       Auth: Required | Role: admin
       Response: { success, message }

GET    /api/allocations/matches/teachers/:studentId
       Auth: Required | Role: admin
       Response: { matches, statistics }

GET    /api/allocations/cross-board/subjects
       Response: { subjects, total }

GET    /api/allocations/cross-board/teachers/subject/:subjectName
       Response: { teachers, total }
```

### Subject Management Routes

```javascript
GET    /api/subjects
       Query: { curriculum, isActive }
       Response: { subjects }

POST   /api/subjects
       Auth: Required | Role: admin
       Request: { subjectName, category, curriculum, code }
       Response: { subject }

PATCH  /api/subjects/:id
       Auth: Required | Role: admin
       Request: { subjectName, category, isActive }
       Response: { subject }

DELETE /api/subjects/:id
       Auth: Required | Role: admin
       Response: { success }
```

### Dashboard Routes

```javascript
GET    /api/dashboard/stats
       Auth: Required | Role: admin
       Response: { totalUsers, totalTeachers, totalStudents, activeAllocations }

GET    /api/dashboard/recent-activity
       Auth: Required | Role: admin
       Query: { limit: 10 }
       Response: { activities }

GET    /api/dashboard/allocations-summary
       Auth: Required | Role: admin
       Response: { total, active, pending, completed }
```

---

## USER WORKFLOWS

### Workflow 1: Admin Login & Dashboard Access

```
1. Admin visits admin portal
   ↓
2. System checks AuthContext for token
   → If no token: Redirect to /login
   → If token exists: Check forcePasswordChange flag
     → If true: Redirect to /account/secure-reset
     → If false: Allow dashboard access
   ↓
3. Admin enters email + password
   ↓
4. Frontend: POST /api/auth/login
   ↓
5. Backend:
   - Find user by email
   - Verify password with bcryptjs
   - Generate JWT token
   - Return user + token + forcePasswordChange flag
   ↓
6. Frontend:
   - Store token in localStorage
   - Store user data in AuthContext
   - If forcePasswordChange = true: Redirect to /account/secure-reset
   - Else: Redirect to /dashboard
   ↓
7. Dashboard displayed with:
   - Welcome message (Hello, Admin)
   - Statistics cards (Total users, teachers, students)
   - Recent activity feed
   - Quick action buttons
```

### Workflow 2: Create New Teacher

```
1. Admin clicks "Add Teacher" button
   ↓
2. Modal opens with form:
   - First Name (required)
   - Last Name (required)
   - Email (required, unique)
   - Phone (optional)
   - Curriculum dropdown (required)
   - Subjects multi-select (populated by curriculum)
   - Universal Curriculum checkbox (optional)
   - Experience field (optional)
   ↓
3. Admin fills form
   ↓
4. Admin clicks "Save"
   ↓
5. Frontend validation:
   - Check required fields
   - Validate email format
   - Ensure curriculum selected
   ↓
6. Frontend: POST /api/teachers
   Request: {
     firstName, lastName, email,
     curriculum, subjects,
     universalCurriculum, experience, phone
   }
   ↓
7. Backend:
   - Validate curriculum (required)
   - Validate email (unique)
   - Create Teacher record in DB
   - Check if User exists
   → If not:
     - Generate 12-char temp password
     - Create User record
     - Link Teacher to User
     - Send credentials email
     - Emit WebSocket event: TEACHER_CREATED
   → If exists:
     - Link existing User to Teacher
   ↓
8. Frontend receives response:
   {
     success: true,
     teacher: { ...details },
     credentialsSent: true,
     message: "Teacher created. Credentials sent to email."
   }
   ↓
9. WebSocket event TEACHER_CREATED received
   - Teacher prepended to menu (no page reload)
   - Success toast notification shown
   ↓
10. Teacher receives email with:
    - Login URL
    - Temporary password
    - Security notice (must change password on first login)
    ↓
11. Teacher logs in with temp password
    ↓
12. Frontend detects forcePasswordChange = true
    - Redirects to /account/secure-reset (AuthGuard)
    ↓
13. Teacher enters:
    - Current password (temporary)
    - New password (8+ chars)
    - Confirm password
    ↓
14. Frontend: POST /api/auth/secure-reset
    Request: { currentPassword, newPassword }
    ↓
15. Backend:
    - Verify current password matches
    - Check new ≠ current
    - Hash new password
    - Update User.password
    - Set forcePasswordChange = false
    ↓
16. Frontend:
    - Show "Password updated successfully"
    - Update localStorage
    - Redirect to /dashboard
    ↓
17. ✅ Teacher now has full access
```

### Workflow 3: Allocate Teacher to Student

```
1. Admin navigates to Allocations page
   ↓
2. Chooses filter mode:
   Option A: By Curriculum
   - Selects curriculum
   - Shows students in that curriculum
   
   Option B: By Subject (Cross-Board)
   - Selects subject name
   - Shows teachers teaching that subject (any board)
   ↓
3. Selects student from list
   ↓
4. System calls: GET /api/allocations/matches/teachers/:studentId
   ↓
5. Backend matchingService:
   - Find student by ID
   - Get student's subjects
   - Query teachers with those subjects
   - Support universalCurriculum flag
   - Calculate match scores (0-100)
   - Sort by score + rating
   - Return sorted list with match details
   ↓
6. Frontend displays matching teachers:
   - Teacher name
   - Curriculum
   - Matching subjects
   - Match score (%)
   - Rating
   - Total students
   ↓
7. Admin selects teacher
   ↓
8. Admin clicks "Allocate"
   ↓
9. Frontend: POST /api/allocations
   Request: { studentId, teacherId, subjects }
   ↓
10. Backend:
    - Validate both exist
    - Create Allocation record
    - Send email to teacher: "New student allocated"
    - Send email to student: "New teacher assigned"
    - Broadcast WebSocket event: ALLOCATION_CREATED
    ↓
11. Frontend:
    - Show success notification
    - Add allocation to list
    - Update allocation count
    ↓
12. ✅ Allocation complete, both parties notified
```

### Workflow 4: Secure Password Reset

```
User State: forcePasswordChange = true (new teacher)
   ↓
1. AuthGuard component detects flag
   ↓
2. Redirects to /account/secure-reset
   ↓
3. SecureResetPage displayed:
   - Current Password field (temporary)
   - New Password field (8+ chars)
   - Confirm Password field
   - Only "Change Password & Continue" and "Logout" buttons active
   ↓
4. User enters:
   - Current: [temporary_password_from_email]
   - New: [secure_new_password]
   - Confirm: [secure_new_password]
   ↓
5. Frontend: POST /api/auth/secure-reset
   Request: { currentPassword, newPassword }
   ↓
6. Backend validation:
   - User authenticated (JWT)
   - Current password matches
   - New password ≠ current password
   - New password 8+ chars
   ↓
7. Backend updates:
   - Hash new password
   - Update User.password
   - Set forcePasswordChange = false
   ↓
8. Frontend:
   - Update localStorage.user.forcePasswordChange = false
   - Show success message
   - Redirect to /dashboard (2 sec delay)
   ↓
9. ✅ User now has unrestricted access
```

---

## FEATURES & MODULES

### Module 1: Dashboard

**Components:**
- StatsCard (Total Users, Teachers, Students, Allocations)
- ActivityFeed (Recent user/teacher/allocation actions)
- QuickActions (Create User, Create Teacher, New Allocation)
- Charts (allocations by curriculum, teachers by subject)

**Data:**
```
Stats: {
  totalUsers: Number,
  totalTeachers: Number,
  totalStudents: Number,
  totalAllocations: Number,
  activeAllocations: Number,
  pendingAllocations: Number
}

RecentActivity: [{
  type: "user_created" | "teacher_created" | "allocation_created",
  user: { name, email },
  timestamp: Date,
  details: String
}]
```

---

### Module 2: User Management

**Features:**
- List all users with pagination
- Filter by: role, status, curriculum, search by email/name
- Create new user (auto-generates temp password, sends email)
- Edit user details (name, phone, curriculum, subjects)
- Delete user (with confirmation)
- View user profile

**User Types:**
- Admin (full access)
- Teacher (access to classes, sessions)
- Student (access to lessons, profile)
- Parent (manage children, links)
- Demo (read-only, protected from deletion)

**Form Fields:**
```
First Name (required)
Last Name (required)
Email (required, unique, validated)
Password (auto-generated, hashed)
Role (dropdown: admin, teacher, student, parent, demo)
Phone (optional)
Curriculum (dropdown if teacher/student)
Subjects (multi-select, populated by curriculum)
Is Active (toggle)
Is Demo (toggle)
```

---

### Module 3: Teacher Management

**Features:**
- List all teachers with pagination
- Filter by: curriculum, status, subject, search
- Create new teacher (+ auto User creation + credentials email)
- Edit teacher: name, phone, subjects, curriculum, universal flag
- Delete teacher
- View teacher profile & students

**Teacher Fields:**
```
First Name (required)
Last Name (required)
Email (required, unique)
Phone (optional)
Curriculum (required dropdown)
Subjects (multi-select, populated by curriculum)
Qualifications (text array)
Experience (years, optional)
Universal Curriculum (checkbox - teaches all boards)
Status (Active, Inactive, On Leave)
Rating (0-5 stars)
Total Students (auto-calculated)
Total Sessions (auto-calculated)
```

**Special Features:**
- "Add All Subjects" button (quick setup)
- Real-time menu sync via WebSocket
- Curriculum validation on creation
- Universal flag support (PHASE 4)

---

### Module 4: Subject Management

**Features:**
- List all subjects (95+ from 7 curriculums)
- Filter by curriculum
- Create new subject (rare)
- Edit subject details
- Deactivate/reactivate subject

**Subject Fields:**
```
Subject Name (e.g., "Mathematics")
Category (e.g., "Science", "Mathematics")
Curriculum (dropdown)
Code (e.g., "MAT101")
Is Active (toggle)
```

**Curriculums Supported:**
- IGCSE (International General Certificate of Secondary Education)
- A-Level (Advanced Level)
- IB Diploma (International Baccalaureate Diploma)
- IB MYP (International Baccalaureate Middle Years Programme)
- Kenya CBC (Competency-Based Curriculum)
- BNC (British National Curriculum)
- American (US Curriculum)

---

### Module 5: Allocation & Matching

**Features:**
- View all allocations
- Create new allocation (with smart matching)
- Edit allocation (reassign teacher)
- Delete allocation
- Matching statistics

**Matching Algorithm:**
```
Input: Student ID
Output: Sorted list of compatible teachers

Algorithm:
1. Get student: curriculum + subjects
2. Find teachers with matching subjects
3. Support universalCurriculum flag (any board)
4. Calculate match score:
   - Base: 50 (curriculum match)
   - Bonus: +50 if all subjects match
5. Sort by: match score (desc) → rating (desc)
6. Return with metadata: name, email, subjects, score

Match Types:
- Perfect Match: 100% (all subjects match)
- Partial Match: 50-99% (some subjects match)
- Curriculum Match: 50% (curriculum only)
```

**Cross-Board Matching (PHASE 6):**
```
Feature: Find teachers by subject name across all curriculums

Example: "Physics"
Returns:
- IGCSE Physics teachers
- A-Level Physics teachers
- IB Diploma Physics teachers
- Kenya CBC Physics teachers
- etc.

Plus: Universal teachers (teach any subject/board)
```

---

### Module 6: Settings & Configuration

**Features:**
- System configuration
- Curriculum settings
- Email configuration (SMTP test)
- Audit logs (if enabled)
- Export data

---

## TECH STACK

### Frontend
```
React 18.2.0           - UI framework
Vite 5.0.8             - Build tool
React Router v6        - Navigation
Axios 1.6.2            - HTTP client
Socket.io-client 4.7.2 - Real-time events
Context API            - State management
CSS3                   - Styling
```

### Backend
```
Express.js 4.18.2      - Web framework
Node.js 18+            - Runtime
Socket.io 4.7.2        - Real-time server
Nodemailer 6.10.1      - Email service
Mongoose 8.0.3         - MongoDB ODM
bcryptjs 2.4.3         - Password hashing
JWT 9.0.2              - Token generation
```

### Database
```
MongoDB Atlas          - Cloud database
Collections: 10+
Documents: 10,000+
```

### Deployment
```
Backend: Render, Heroku, or DigitalOcean
Frontend: Vercel, Netlify
Database: MongoDB Atlas (cloud)
```

---

## SECURITY FEATURES

1. **Authentication**
   - JWT tokens (7-day expiry)
   - Password hashing (bcryptjs, 12 rounds)
   - Secure password reset flow

2. **Authorization**
   - Role-based access control (RBAC)
   - Route protection middleware
   - Admin-only operations

3. **Data Protection**
   - Temporary passwords (12-char, cryptographically secure)
   - forcePasswordChange flag (enforced at login)
   - Rate limiting on credentials email (3 per day)

4. **Validation**
   - Curriculum enum validation
   - Email format validation
   - Required fields checking
   - Input sanitization

5. **Privacy**
   - No passwords in API responses
   - Sensitive data encrypted
   - Audit logging capability

---

## DEPLOYMENT CHECKLIST

```
Frontend:
[ ] Set VITE_API_URL to production backend
[ ] Build: npm run build
[ ] Deploy to Vercel/Netlify
[ ] Test all pages load
[ ] Verify WebSocket connects

Backend:
[ ] Set NODE_ENV=production
[ ] Configure MongoDB Atlas (production DB)
[ ] Set JWT_SECRET to strong value
[ ] Configure SMTP (Gmail App Password)
[ ] Set EMAIL_FROM correctly
[ ] Set CLIENT_URL to frontend URL
[ ] Run npm install (production mode)
[ ] Start: npm run start
[ ] Test all API endpoints

Database:
[ ] Create MongoDB Atlas cluster
[ ] Enable network access
[ ] Run seedSubjects.js
[ ] Verify collections created
[ ] Create backup

Monitoring:
[ ] Set up error logging
[ ] Monitor API response times
[ ] Track email delivery rate
[ ] Monitor WebSocket connections
```

---

## NEXT STEPS

1. **Review** this architecture document
2. **Set up** fresh backend/frontend from this template
3. **Test** each workflow locally
4. **Deploy** to production environment
5. **Monitor** system performance

---

**Architecture Version:** 2.0 (Fresh Start)
**Last Updated:** April 18, 2026
**Status:** Ready for Implementation

