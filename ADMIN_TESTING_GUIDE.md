# Admin Portal Testing Guide

**Last Updated:** April 13, 2026  
**Scope:** Technical testing of all admin functionalities for Smartious E-School

---

## 📋 Overview

The Admin Portal is a comprehensive management system with **13 main pages**. This guide helps you systematically test each feature for proper functionality, data integrity, and edge cases.

### Quick Stats
- **13 Admin Pages:** Dashboard, Analytics, Users, Teachers, Curriculum, Billing, Website Editor, Settings, AI Console, Allocations, Payroll, Programmes, Live Lessons, Group Rooms
- **Backend Protection:** All routes require `admin` role + JWT authentication
- **Database:** MongoDB with role-based access control (RBAC)
- **Frontend:** React with state management via context (AuthProvider, StoreProvider)

---

## 🔐 Prerequisites

### 1. Create an Admin Account
```bash
# Via the registration form or direct DB:
# email: admin@smartious.ac.ke
# password: Your_SecurePassword_123
# role: admin
```

### 2. Get JWT Token
Login at `/login` with admin credentials → Copy token from localStorage:
```javascript
// In browser console:
console.log(localStorage.getItem('token'))
```

### 3. API Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://api.smartioushomeschool.com/api`

---

## 🧪 Test Cases by Page

---

### **PAGE 1: DASHBOARD** ✅

#### 1.1 Overview KPIs
**Test:** Verify static KPI cards display correctly
- [ ] Total Students: 2,418 ✓
- [ ] Active Teachers: 127 ✓
- [ ] Revenue KES (Feb): 3.48M ✓
- [ ] Platform Uptime: 99.4% ✓

**API Call:** N/A (static data)
**Expected:** All four cards visible with correct colors and icons

---

#### 1.2 Live Counts
**Test:** Verify dynamic live counters update every ~4.5 seconds
- [ ] Active sessions number changes
- [ ] Live classes running number changes

**Code Logic:**
```javascript
// Simulates updates every 4500ms
setInterval(() => {
  setLiveSessions(278 + Math.floor(Math.random() * 12))
  setLiveClasses(10 + Math.floor(Math.random() * 4))
}, 4500)
```

**Expected:** Numbers change autonomously without user interaction

---

#### 1.3 Add User Modal
**Test:** Create a new user from dashboard
1. Click `+ Add User` button
2. Fill form:
   ```
   First Name: Test
   Last Name: Admin
   Email: testadmin@smartious.ac.ke
   Role: Teacher
   Curriculum: IGCSE
   Plan: Staff
   ```
3. Click `Create User`

**API Call:**
```bash
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "Admin",
  "email": "testadmin@smartious.ac.ke",
  "password": "Welcome@2024",
  "role": "teacher",
  "curriculum": "IGCSE",
  "plan": "Staff",
  "isActive": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Test",
    "lastName": "Admin",
    "email": "testadmin@smartious.ac.ke",
    "role": "teacher",
    "curriculum": "IGCSE",
    "plan": "Staff",
    "isActive": true,
    "createdAt": "2026-04-13T10:30:00.000Z"
  }
}
```

**Error Cases:**
- [ ] Missing email → `400: Email and password are required`
- [ ] Duplicate email → `400: Email already exists`
- [ ] Invalid role → `400: Invalid role enum`

**Toast Messages:**
- ✓ Success: `"Test created! Temp password: Welcome@2024"`
- ✗ Error: `"Could not create user"`

---

#### 1.4 Pending Approvals Modal
**Test:** Review and approve/reject 5 pending registrations
1. Click `5 Pending Approvals` alert
2. Modal shows 5 students with:
   - Name, Curriculum, Plan, Payment Method, Timestamp
3. Test actions:
   - [ ] `Approve` → Approve single
   - [ ] `Reject` → Reject single
   - [ ] `Approve All 5` → Bulk approve

**Expected Behavior:**
- Individual approve: Toast `"Approved: [Name]"`
- Individual reject: Toast `"Rejected: [Name]"`
- Bulk approve: Toast `"All 5 approved — emails sent"`

---

#### 1.5 System Alerts
**Test:** Two active alerts should display
1. **Disk Usage: 78%**
   - Icon: ⚠️ (red)
   - Button: `Fix Now` → Navigate to Settings page
   - [ ] Click button → Page changes to Settings
   
2. **5 Pending Approvals**
   - Icon: ⚠️ (amber)
   - Button: `Review` → Opens pending modal
   - [ ] Click button → Modal appears

---

#### 1.6 Charts
**Test:** Bar charts render correctly
- [ ] Monthly Revenue chart (6 months of data)
- [ ] Enrolment by Service bar chart (5 services)
- [ ] Student Growth trend
- [ ] By Curriculum breakdown

**Expected:** Charts display smoothly with proper colors and labels

---

### **PAGE 2: ANALYTICS & REPORTS** 📊

#### 2.1 KPIs
**Test:** Verify analytics KPIs display
- [ ] Platform Pass Rate: 78% ↑ +3% YoY
- [ ] Avg. Attendance: 91% ↑ +1.4% MoM
- [ ] Retention Rate: 96% ↑ +2% vs last term
- [ ] Avg. Teacher Rating: 4.8/5 (1,840 reviews)

**Expected:** All with correct colors and trends

---

#### 2.2 Charts
- [ ] Student Growth (6 months) bar chart
- [ ] Top Subjects by Enrolment (5 subjects with progress bars)
- [ ] Students by Country (6 countries with flags)
- [ ] Avg. Exam Score by Year Level

---

### **PAGE 3: USER MANAGEMENT** 👥

#### 3.1 User Table & Search
**Test:** Display and filter users
1. Table shows: User, Role, Curriculum, Plan, Status, Last Active, Actions
2. Search functionality:
   - [ ] Search by name: `"Amara"` → Shows Amara Osei
   - [ ] Search by email: `"james"` → Shows Mr. James Muthomi
   - [ ] Case-insensitive
3. Filter dropdowns:
   - [ ] All Roles / Student / Teacher / Parent
   - [ ] All Status / Active / Suspended
   - [ ] All Plans / Basic / Premium / IGCSE Pack

**Expected:** Table updates instantly on filter/search change

---

#### 3.2 Action Buttons
**Test:** User action buttons in table
1. **Edit Button**
   - [ ] Click → Pre-fills modal with user data
   - [ ] Can modify fields
   - [ ] Submit → Updates API (but in demo, shows error "User not found in DB")

2. **Suspend Button**
   - API Call:
     ```bash
     PATCH /api/users/{userId}
     Authorization: Bearer {token}
     { "isActive": false }
     ```
   - [ ] Click → Toast: `"{Name} suspended"`
   - [ ] In demo: Toast: `"User not found in DB — demo data only"`

**Error Handling:**
- [ ] API failure → Shows error in toast

---

#### 3.3 Export CSV
**Test:** Click `Export CSV` button
- [ ] Expected: Toast `"Exporting CSV..."`
- **Note:** Not implemented (UI only)

---

#### 3.4 Pending Approvals Alert
- [ ] Red alert bar shows: `"5 registrations pending approval"`
- [ ] `Approve All` button works
- [ ] `Review Individually` button opens modal

---

### **PAGE 4: TEACHER MANAGEMENT** 🎓

#### 4.1 Teacher Table
**Test:** Display 5 teachers with columns:
- Teacher name + avatar
- Subjects taught
- Student count
- Rating (stars)
- Classes/week
- Status (Active/On Leave)
- Actions (Edit, Leave)

**Data Example:**
```
Mr. James Muthomi | Mathematics | 96 | ⭐4.9 | 12 | Active
```

---

#### 4.2 Teacher Actions
1. **Edit Button**
   - [ ] Pre-fills Add User modal with teacher data
   - [ ] Role locked to "Teacher"
   - [ ] Plan locked to "Staff"
   
2. **Leave Button**
   - [ ] Click → Toast: `"{Name} put on leave"`
   - **Note:** Not connected to API (UI only)

---

#### 4.3 Add Teacher
- [ ] `+ Add Teacher` button opens user modal
- [ ] Create new teacher with role="Teacher", plan="Staff"

---

### **PAGE 5: CURRICULUM MANAGER** 📚

#### 5.1 View Curricula
**Test:** Display all active curricula
- [ ] IGCSE: Cambridge/Pearson Edexcel, 894 students, 12 subjects, Active ✓
- [ ] British Curriculum: UK National Curriculum, 612 students, 10 subjects
- [ ] IB Diploma: International Baccalaureate, 387 students
- [ ] CBC/KCSE: KNEC Kenya, 341 students
- [ ] American: College Board/SAT, 184 students
- [ ] IB Primary: IBO — PYP, 0 students, Draft ✓

**Expected:** Cards display with status color coding (green=Active, gray=Draft)

---

#### 5.2 Add Curriculum
1. Click `+ Add Curriculum`
2. Fill form:
   ```
   Name: Test Curriculum
   Organisation: Test Org
   Grades: Form 1-4
   Subjects: 8
   Status: Active
   Description: Test description
   ```
3. Submit → Toast: `"Test Curriculum added — now visible on website and student registration"`

**API Call:** Store method `store.addCurriculum(form)`
**Expected:** New curriculum appears in list (stored in React context)

---

#### 5.3 Edit Curriculum
1. Click `Edit` on any curriculum card
2. Modify fields (same form)
3. Submit → Toast: `"{Name} updated — changes live on website and portals"`

---

#### 5.4 Activate/Deactivate
- [ ] Click toggle button (green="Deactivate", gray="Activate")
- [ ] Status updates instantly
- Toast shows change

---

#### 5.5 Delete Curriculum
- [ ] Click delete icon
- [ ] Confirm dialog appears
- [ ] Submit → Toast: `"Deleted"`
- [ ] Card removed from list

---

### **PAGE 6: BILLING & PAYMENTS** 💳

#### 6.1 Billing KPIs
- [ ] Feb Revenue (KES): 3.48M ↑ +12% vs Jan
- [ ] Paid Subscriptions: 2,218 ↑ +41 this month
- [ ] Overdue Payments: 43 (KES 64,500 total)
- [ ] Assessment Fees: 1,568 (KES 3.14M YTD)

---

#### 6.2 Plan Pricing Controls
**Test:** Modify and save pricing
```
Individual — Basic:     1,499 KES/month, 3 subjects
Individual — Premium:   2,999 KES/month, Unlimited AI
Group — Basic:          499 KES/month, 10 students
Group — Premium:        999 KES/month, 10 students
```

1. Change one value: `Individual Basic → 1,799`
2. Click `Save Pricing`
3. Expected: Toast `"Pricing saved — live on website and all portals now!"`

**API Call:** `store.updateFees(localFees)`

---

#### 6.3 Additional Fees
- [ ] Assessment Fee (KES, one-time): 2000
- [ ] Learning Centre Discount: 20%
- [ ] Online Discount: 10%
- [ ] Tuition Online (KES): 1000
- [ ] Tuition Home Visit (KES): 1500

---

#### 6.4 Recent Transactions Table
**Test:** View transaction history
Columns: Student, Item, Method, Amount, Date, Status

Example transactions:
```
Grace Mutua     | Premium         | M-Pesa | KES 1,499  | Mar 7 | Paid
Brian Otieno    | IGCSE Pack      | Card   | KES 3,999  | Mar 7 | Paid
Samuel Omondi   | Basic           | M-Pesa | KES 499    | Mar 7 | Pending
David Mwangi    | Basic           | Bank   | KES 499    | Mar 6 | Overdue
```

- [ ] Status badges show correct colors
- [ ] Click `Receipt` button → Toast: `"Viewing receipt"` (not implemented)
- [ ] Click `Export` → Toast: `"Exporting..."`

---

### **PAGE 7: WEBSITE EDITOR** 🌐

#### 7.1 Live Preview
**Test:** Website sections are editable
1. Frame shows preview of smartious.co.ke
2. Five sections with `we-sec` class:
   - Hero Section
   - Trust Bar
   - Services
   - Pricing
   - Footer

#### 7.2 Edit Sections
1. **Hero Section**
   - Click → Shows form with Headline, Sub-headline, Primary Button, Secondary Button
   - Modify: Headline → "Test Headline"
   - [ ] Preview updates live
   - Click `Save Draft` or `Publish Live`

2. **Trust Bar**
   - Click → Edit 4 stat fields
   - Each stat updates preview instantly

3. **Footer**
   - Click → Edit copyright text, email, phone, address

---

#### 7.3 Site-Wide Settings
- [ ] School Name: Can change from "Smartious Homeschool"
- [ ] Brand Colour: 6 color swatches (click to set)
- [ ] Contact Email: editable

---

#### 7.4 Button Actions
- [ ] `Preview` → Toast: `"Opening preview..."`
- [ ] `Save Draft` → Toast: `"Draft saved — not yet live"`
- [ ] `Publish Live` → Toast: `"Published! Changes are now live on the website."`

---

### **PAGE 8: SYSTEM SETTINGS** ⚙️

#### 8.1 General Settings
**Test:** Form inputs for system configuration
- [ ] School Name: `"Smartious E-School"`
- [ ] Tagline: `"World-Class Education, Delivered to Your Home"`
- [ ] Support Email: `support@smartious.co.ke`
- [ ] Admin Phone: `+254 745 021 212`
- [ ] Platform Language: English / Swahili / French
- [ ] Timezone: Africa/Nairobi (EAT +3) / UTC / Europe/London

Click `Save` → Toast: `"General settings saved"`

---

#### 8.2 Feature Toggles
**Test:** Toggle features on/off

| Feature | Description | Default |
|---------|-------------|---------|
| AI Tutor (Mshauri) | Chatbot for all students | ON |
| Live Classrooms | Video sessions for teachers | ON |
| Secure Exam Mode | Tab-switch detection & proctoring | ON |
| Gamification | XP, badges, leaderboards | ON |
| Parent Portal | Parent access to student progress | ON |
| M-Pesa Payments | Accept M-Pesa STK push | ON |
| New Registrations | Allow new student enrolments | ON |
| SMS Notifications | Send SMS to students & parents | ON |
| Beta Features | Experimental features | OFF |
| Maintenance Mode | Lock platform for non-admins | OFF |

**Test:**
1. Click toggle for "Beta Features" → Switch ON
2. Click toggle for "Maintenance Mode" → Switch ON
3. Click `Save` → Toast: `"Feature settings saved"`

**Expected:** Button CSS class changes to show `tog on` or `tog off`

---

#### 8.3 Security Settings
- [ ] Session Timeout: 60 min
- [ ] Max Login Attempts: 5
- [ ] Min Password Length: 8 characters
- [ ] Two-Factor Auth: Optional for all users / Required for admins / Required for all / Disabled
- [ ] IP Allowlist: (textarea, one IP per line)

Click `Save` → Toast: `"Security saved"`

---

#### 8.4 Storage & Performance
**Test:** Disk usage indicator
- [ ] Progress bar shows 78% (390 GB / 500 GB)
- [ ] Breakdown: Recordings 280 GB, Resources 64 GB, DB 46 GB
- [ ] Buttons (test each):
  - [ ] `Archive Old Recordings` → Toast: `"Archiving recordings > 6 months..."`
  - [ ] `Clear CDN Cache` → Toast: `"CDN cache cleared"`
  - [ ] `Optimise Database` → Toast: `"DB optimisation queued"`
  - [ ] `Run Full Backup Now` → Toast: `"Full backup started — ~8 min"`

- [ ] Max Upload (MB): 500
- [ ] CDN Provider: Cloudflare (Active) / AWS CloudFront

---

#### 8.5 API Keys & Integrations
**Test:** Sensitive key display
- [ ] Anthropic API Key: `sk-ant-api03-••••••••`
- [ ] M-Pesa Consumer Key: `••••••••••••••••`
- [ ] M-Pesa Shortcode: `174379`
- [ ] SMTP Server: `smtp.sendgrid.net`
- [ ] Zoom API Key: `••••••••••••••••`

**Expected:** Masked values for sensitive keys, plain text for others
Click `Save` → Toast: `"API keys saved"`

---

#### 8.6 Email Templates
**Test:** Email template manager
Templates listed:
1. Welcome Email (On student registration)
2. Payment Confirmation (After payment success)
3. Exam Reminder (24 hrs before exam)
4. Parent Weekly Report (Sundays 8am)
5. Teacher Onboarding (On teacher account creation)

- [ ] Click any template → Toast: `"Editing: [Template Name]"`
- [ ] Click `Edit` button → (Modal not shown, feature incomplete)

Click `Save` → Toast: `"Templates saved"`

---

### **PAGE 9: AI CONSOLE** 🤖

#### 9.1 Mshauri Usage Stats
**Test:** Display AI usage metrics
```
Total AI chat sessions:      14,847
AI summaries generated:       8,312
Flashcard sets generated:     3,104
Papers AI-marked:             2,847
Exam questions generated:       418
Total API tokens:           84.2M
API cost (Feb):         USD $124.40
Cost vs budget:          62% of $200
```

---

#### 9.2 Model Configuration
**Test:** AI model settings
- [ ] AI Model: `claude-sonnet-4-20250514` (Active) / Other models
- [ ] Max Tokens / Request: 600
- [ ] Monthly Token Budget: 100,000,000
- [ ] Requests / Student / Day: 50
- [ ] AI-Generated Flag Threshold: 25%
- [ ] Plagiarism Flag Threshold: 15%

Click `Save` → Toast: `"AI config saved"`

---

#### 9.3 System Prompts
**Test:** Edit AI behavior

Two text areas:
1. **Student System Prompt**
   - Default: `"You are Mshauri, a warm and encouraging AI tutor..."`
   - Click `Save` → Toast: `"Prompt saved"`

2. **Teacher System Prompt**
   - Default: `"You are Mshauri, an AI marking assistant..."`
   - Click `Save` → Toast: `"Prompt saved"`

---

#### 9.4 Live AI Test Console
**Test:** Interactive AI testing
1. Console shows pre-filled messages:
   - `// Smartious Admin AI Console — Test Mshauri live`
   - `// Type a prompt and press Send or Enter`
   - `● Ready · Model: claude-sonnet-4-20250514`

2. Input field with Send button
3. **Test prompts:**
   ```
   User input:  "Explain Pythagoras Theorem in 2 sentences"
   Expected:    API POST /api/auth/mshauri with message param
   Response:    "In a right-angled triangle, c² = a² + b²..."
   ```

**API Call:**
```bash
POST /api/auth/mshauri
Authorization: Bearer {token}
{ "message": "Explain Pythagoras Theorem in 2 sentences" }
```

**Test Case Variations:**
- [ ] Input: `"hello"` → Should get greeting response
- [ ] Input: `"what should i study"` → Should get mastery-based recommendation
- [ ] Input: `"pythagoras"` → Should explain theorem
- [ ] Input: `"chemistry"` → Should mention periodic table & stoichiometry
- [ ] Input: `"progress"` → Should show student progress stats
- [ ] Press Enter key → Should send (not just button)
- [ ] While loading → Button should be disabled, show `● Thinking...`

---

### **PAGE 10: STUDENT ALLOCATIONS** 🎯

#### 10.1 Allocation Stats
**Test:** Display KPI cards
```
Pending Review:        3 (Awaiting admin confirm)
Active Allocations:  247 (Across all programmes)
Capacity Used:       89% (33 free slots remain)
Auto-Match Rate:     94% (6% need manual review)
```

**Expected:** Cards with proper colors and typography

---

#### 10.2 Allocations Table
**Test:** View all active allocations
Columns: Student, Programme, Teacher, Session Slot, Match Type, Since, Status, Actions

Example rows:
```
Amara Osei    | IGCSE    | Mr. Muthomi | Mon/Wed 10am | Auto   | Jan 2026 | Active
Kofi Mensah   | A-Level  | Dr. Ouma    | Tue/Thu 2pm  | Auto   | Jan 2026 | Active
Grace Mutua   | Homeschool | Ms. Wambua | Mon/Fri 9am | Manual | Feb 2026 | Pending
```

- [ ] Search by student/teacher: Filters table
- [ ] Filter by programme: Filters to selected programme
- [ ] Sort columns: (if implemented)

---

#### 10.3 Allocation Actions
1. **Reassign Button**
   - [ ] Click → Toast: `"Reassignment notification sent"`
   - **Behind scenes:** Calls `store.addAnnouncement()`

2. **Approve Button** (only for Pending status)
   - [ ] Click → Toast: `"{Student} allocation approved — welcome email sent"`

---

#### 10.4 Configuration Buttons
- [ ] `Allocation Rules` → Toast: `"Allocation rules config opening..."`
- [ ] `+ Manual Allocate` → Toast: `"Manual allocation wizard..."`

---

### **PAGE 11: PAYROLL MANAGEMENT** 💰

#### 11.1 Pay Rates Display
**Test:** Rate card shows current rates
```
Daily Attendance:    KES 1,500
Off-Hours Session:   KES 300
Article Read:        KES 3
Video Upload:        KES 100
```

**Expected:** Color-coded cards (green, amber, blue, purple)

---

#### 11.2 Payroll Table
**Test:** Staff payroll data
Columns: Checkbox, Teacher, Attendance, Off-Hours, Article Reads, Videos, Total Earnings, Status, Actions

Example data:
```
Mr. James Muthomi  | 22 | 8 | 142 | 3 | KES 40,126 | Pending
Dr. Achieng Ouma   | 20 | 5 |  89 | 2 | KES 32,467 | Paid
Ms. Njeri Wambua   | 21 | 11| 201 | 4 | KES 37,903 | Pending
Mr. Kariuki Njoroge| 19 | 6 |  67 | 1 | KES 30,201 | Processing
```

---

#### 11.3 Payroll Actions
1. **Pay Now Button**
   - [ ] Click → Toast: `"Paying {Name} via M-Pesa..."`
   - Status badge updates to "Processing" then "Paid"

2. **Row Checkbox**
   - [ ] Check multiple rows for bulk operations

3. **Month Selector**
   - [ ] Default: January 2027
   - [ ] Can select: December 2026, November 2026, etc.

4. **Search**
   - [ ] Search by staff name
   - [ ] Filters table in real-time

---

#### 11.4 Payroll Operations
- [ ] `Export CSV` → Toast: `"Exporting CSV..."`
- [ ] `Run Payroll` → Toast: `"Payroll run complete — 4 staff paid"`

---

### **PAGE 12: PROGRAMMES (IUFP & Study Abroad)** 🌍

#### 12.1 Programme Cards
**Test:** Display all 4 international programmes
```
1. IUFP Foundation Year
   Icon: Graduation cap
   Students: 84
   Countries: UK, USA, Australia, Germany
   Fee: $2,400/year
   Status: Active

2. Study Abroad — UK
   Icon: Globe
   Students: 31
   Countries: London, Manchester, Edinburgh
   Fee: £18,000/year
   Status: Active

3. Study Abroad — USA
   Icon: Shield
   Students: 18
   Countries: New York, Boston, Atlanta
   Fee: $25,000/year
   Status: Active

4. Study Abroad — UAE
   Icon: Building
   Students: 12
   Countries: Dubai, Abu Dhabi
   Fee: $18,000/year
   Status: Active
```

**Expected:** Cards render in responsive grid (auto-fill minmax 280px)

---

#### 12.2 Programme Actions
- [ ] `Manage` button → Toast: `"Managing: {Programme}"`
- [ ] `Edit` button → Toast: `"Editing: {Programme}"`

---

### **PAGE 13: GROUP CLASS ROOMS** 👨‍🎓👩‍🎓

#### 13.1 Room Creation Form
**Test:** Add a new group room

1. Click `+ Create Room`
2. Fill form:
   ```
   Room Name: Mathematics Group A
   Subject: Mathematics
   Curriculum: IGCSE
   Grade/Year: Form 3
   Capacity: 10
   Assigned Teacher: Mr. Muthomi
   Schedule: Mon/Wed 9:00–10:00 AM
   ```
3. Click `Create Room` → Toast: `"Room \"Mathematics Group A\" created — students can now join"`

**API Call:** `store.addGroupRoom(form)`

---

#### 13.2 Room Statistics
**Test:** KPI cards for all rooms
```
Total Rooms:         {count}
Total Students:      {count}
Full Rooms:          {count}
Available Seats:     {count}
```

**Expected:** Numbers update when rooms are added/deleted

---

#### 13.3 Rooms List
**Test:** Each room displays as a card

Example room:
```
┌─────────────────────────────────────────┐
│ Mathematics Group A    [Active] [Full]  │
│ Mr. Muthomi · Mathematics · IGCSE F3 ·  │
│ Mon/Wed 9:00 AM                         │
│                                         │
│ 10/10 students                          │
│ [Roster] [Deactivate] [Delete]         │
│                                         │
│ AM AO KM FW KN JO JM NW FM KN           │
│ (Student avatars)                       │
└─────────────────────────────────────────┘
```

---

#### 13.4 Room Actions
1. **Roster Button**
   - [ ] Click → Toast: `"Room: {Name} — {student list}"`

2. **Deactivate/Activate Button**
   - [ ] Active room: Shows "Deactivate"
   - [ ] Inactive room: Shows "Activate"
   - [ ] Click → Status toggles

3. **Delete Button**
   - [ ] Click → Room removed from list
   - [ ] Toast: `"Room deleted"`

---

#### 13.5 Add Room Form Toggle
- [ ] Click `+ Create Room` → Form appears (borderColor: `var(--g200)`, borderWidth: 2)
- [ ] Click `Cancel` → Form disappears
- [ ] Form fields have proper selects/inputs

---

### **PAGE 14: LIVE LESSONS** 🎥

#### 14.1 Live Session KPIs
```
Active Sessions:    2
Total Students Now: 17
Scheduled Today:    8
Avg. Attendance:    87%
```

---

#### 14.2 Live Sessions List
**Test:** Display 4 lessons with different statuses

```
Live Sessions (with 🔴 dot):
├─ Mathematics — Pythagoras Theorem
│  Mr. Muthomi · IGCSE Form 3 · 6 students attending
│  38 min | [Monitor]
│
└─ Biology — Cell Division
   Dr. Ouma · IGCSE Form 2 · 11 students attending
   12 min | [Monitor]

Upcoming Sessions (with 🔵 dot):
└─ English — Essay Writing
   Ms. Wambua · A-Level Year 12 · Scheduled
   Starting in 28 min

Ended Sessions (with ⚪ dot):
└─ Physics — Newton's Laws
   Mr. Njoroge · IGCSE Form 4 · Recording available
   Ended 14 min ago | [Recording]
```

---

#### 14.3 Session Actions
- [ ] **Live sessions:** `[Monitor]` button → Toast: `"Monitoring {Subject}"`
- [ ] **Ended sessions:** `[Recording]` button → Toast: `"Loading recording..."`

---

## 🔗 Backend API Endpoints Summary

### Authentication
```bash
POST   /api/auth/login              # Login with email/password → returns JWT token
GET    /api/auth/me                 # Get current user (requires JWT)
POST   /api/auth/mshauri            # Test Mshauri AI (requires JWT)
```

### Users (Admin Only)
```bash
GET    /api/users                   # List all users (requires admin role)
POST   /api/users                   # Create user (requires admin role)
PATCH  /api/users/{id}              # Update user (requires admin role)
DELETE /api/users/{id}              # Delete user (requires admin role, not for demo users)
```

### Other Routes (Frontend Context)
```bash
# These use local React state (store.js), not direct API calls:
- Curriculum management (add, update, delete)
- Billing & fees
- Website config
- Settings & features
- Announcements
- Group rooms
```

---

## ✅ Testing Checklist Template

Use this for each test:

```
PAGE: [Name]
FEATURE: [Name]
┌─────────────────────────────────────────┐
│ [ ] Step 1: Action
│ [ ] Step 2: Verify expected result
│ [ ] Step 3: Check error handling
│ [ ] Step 4: Verify toast message
│ [ ] Step 5: Check API call (network tab)
│ [ ] Step 6: Check database state
└─────────────────────────────────────────┘
```

---

## 🐛 Known Issues & Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| User Edit | Partial | Form pre-fills but API returns "demo data only" error |
| User Suspend | Partial | Works in DB but demo data shows error |
| Export CSV | UI Only | Buttons show toast but don't generate file |
| Email Templates | UI Only | Can't actually edit, just shows toast |
| Allocation Rules | UI Only | Button shows toast only |
| Manual Allocate | UI Only | Button shows toast only |
| Website Preview | Partial | Shows mock website, edits stored in context |

---

## 🚀 Quick Test Script (cURL)

### 1. Login as admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartious.ac.ke","password":"Admin@123"}'
```

### 2. List all users
```bash
TOKEN="<paste_token_from_step_1>"
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Create a test user
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Test",
    "lastName":"User",
    "email":"test@smartious.ac.ke",
    "password":"Test@123",
    "role":"student",
    "curriculum":"IGCSE",
    "plan":"Basic"
  }'
```

### 4. Test Mshauri AI
```bash
curl -X POST http://localhost:5000/api/auth/mshauri \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Explain Pythagoras Theorem"}'
```

---

## 📝 Notes

- **Demo Data:** Most list pages show static demo data (from Dashboard.jsx constants)
- **Store Context:** Uses React context for state (Curriculum, Billing, Settings, etc.)
- **No Admin API Routes:** Settings, Website, Curriculum, Billing are all client-side (context)
- **Protected Routes:** All `/admin/*` paths require `role='admin'` in Guard component
- **Token Expiry:** JWT expires in 7 days (JWT_EXPIRES_IN in .env)

---

## 📞 Support

For issues or questions about specific features:
1. Check Network tab (F12) for API calls
2. Check Console for errors
3. Verify JWT token in localStorage
4. Check admin user has `role: "admin"` in database
5. Review backend logs for API errors

---

**Created:** April 13, 2026  
**Version:** 1.0  
**Status:** ✅ Complete for Testing


