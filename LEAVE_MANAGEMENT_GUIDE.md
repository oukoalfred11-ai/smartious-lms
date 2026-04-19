# Teacher Leave Management System

## Overview

The Teacher Leave Management System is a comprehensive feature that allows teachers to apply for leave with proper approval workflows and admin portal notifications. It includes:

- 📅 **Interactive Calendar UI** for selecting leave dates
- 📧 **Email Notifications** to teachers and admins
- ✅ **Approval Workflow** with admin review
- 📊 **Leave History & Analytics** in teacher dashboard
- 🔔 **Real-time Admin Notifications** in admin portal menu

## Features

### Teacher Portal

#### Apply for Leave
- Interactive calendar-based date selection
- Support for 4 leave types: Personal, Medical, Emergency, Other
- Reason/details field for context
- Automatic date range validation
- Can cancel pending requests

#### Leave Dashboard
- **Leave Statistics**: View pending, approved, rejected counts
- **Upcoming Leave**: See all approved upcoming leave dates
- **Leave History**: Track all past and current leave requests with status
- **Request Details**: View reason, dates, and approval status

### Admin Portal

#### Leave Management Page
- **Quick Stats**: View pending, approved, rejected, and cancelled requests
- **Filter by Status**: Toggle between different request statuses
- **Detailed View**: Modal with complete request information
- **Approval Action**: Approve or reject with optional rejection reason
- **Affected Students**: See how many students will be impacted

### Email Notifications

Automated emails are sent at each stage:

1. **Leave Submitted**: Confirmation to teacher + notification to all admins
2. **Leave Approved**: Approval notification to teacher with student reassignment info
3. **Leave Rejected**: Rejection notification with reason and next steps

## Technical Architecture

### Backend (Node.js/Express)

**Model: TeacherLeaveRequest**
```javascript
{
  teacherId: ObjectId,
  teacherName: String,
  teacherEmail: String,
  leaveStartDate: Date,
  leaveEndDate: Date,
  leaveReason: String,
  leaveType: String (enum),
  status: String (Pending/Approved/Rejected/Cancelled),
  approvedBy: ObjectId,
  approvalDate: Date,
  rejectionReason: String,
  temporaryReplacementTeacherId: ObjectId,
  affectedAllocations: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

**API Endpoints**

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/leave-requests` | Teacher | Submit leave request |
| GET | `/api/leave-requests/my-requests` | Teacher | Get teacher's own requests |
| GET | `/api/leave-requests` | Admin | Get all leave requests (filtered by status) |
| GET | `/api/leave-requests/pending-count` | Admin | Get pending request count |
| PATCH | `/api/leave-requests/:id/approve` | Admin | Approve leave request |
| PATCH | `/api/leave-requests/:id/reject` | Admin | Reject leave request |
| PATCH | `/api/leave-requests/:id/cancel` | Teacher/Admin | Cancel leave request |

**Validation Rules**
- End date must be after start date
- Only pending requests can be approved/rejected
- Only pending requests can be cancelled
- Teachers can only cancel their own requests
- Admins can cancel any request

**Side Effects on Approval**
- Teacher status set to "On Leave Approved"
- `isOnLeave` flag set to true
- Leave dates stored in teacher profile
- Affected allocations identified and stored
- Emails sent to teacher and all admins
- Student reassignment workflow triggered

### Frontend (React)

**Files Created**

1. **Teacher Portal: `/pages/teacher/TeacherLeaveRequest.jsx`**
   - Calendar component for date selection
   - Form for leave type and reason
   - Leave history list with status badges
   - Statistics cards
   - Modal for applying new leave

2. **Admin Portal: `/pages/admin/pages/LeaveManagement.jsx`**
   - Leave requests table with filtering
   - Detailed modal view
   - Approval/rejection interface
   - Stats dashboard

3. **Integration Updates**
   - Added "Leave Requests" to teacher sidebar
   - Added "Leave Management" to admin sidebar
   - Added badge showing pending leave count

**UI Components Used**
- Modal for forms and details
- Calendar grid for date selection
- Status badges with color coding
- Statistics cards (KPI)
- Table for leave request history
- Form inputs for text, dates, and selects

## User Workflows

### Teacher Workflow

1. **Navigate** to Leave Requests in teacher sidebar
2. **Click** "Apply for Leave" button
3. **Select** leave type (Personal, Medical, Emergency, Other)
4. **Pick Dates** using interactive calendar
5. **Enter** reason for leave
6. **Submit** request for admin review
7. **Track** status in leave history
8. **Receive** email when approved/rejected
9. **Can Cancel** if still pending

### Admin Workflow

1. **View** Leave Management in admin portal
2. **See** Dashboard with request counts
3. **Filter** by status (Pending, Approved, etc.)
4. **Click** on request to view details
5. **Review** teacher info, dates, and reason
6. **Approve** or **Reject** the request
7. **Add** rejection reason if rejecting
8. **System** automatically sends emails to teacher
9. **Monitor** affected student count

## Email Notifications

### To Teacher (on Submit)
- Confirmation that request was received
- Summary of leave details
- Timeline for admin review

### To Admin (on Submit)
- New leave request notification
- Teacher info and dates
- Action link to review in admin portal

### To Teacher (on Approve)
- Confirmation that leave is approved
- Dates and duration confirmed
- Info about student reassignments
- Approved by admin name

### To Teacher (on Reject)
- Rejection notification
- Specific reason for rejection
- Option to resubmit for different dates

## Integration Points

### Student Allocation System
- When leave is approved, affected allocations are identified
- Students with that teacher are flagged for reassignment
- Temporary replacement teacher can be assigned
- System marks allocations as needing attention

### Teacher Profile
- Teacher status updated to "On Leave Approved"
- Leave dates stored in user profile
- `isOnLeave` flag used for visibility/filtering

### Admin Dashboard
- Pending leave count appears in sidebar badge
- Quick stats visible in leave management page

## Database Queries

**Frequently Used Queries**

```javascript
// Get pending requests for admin
TeacherLeaveRequest.find({ status: 'Pending' })
  .populate('teacherId', 'firstName lastName email')
  .sort('-createdAt');

// Get teacher's leave requests
TeacherLeaveRequest.find({ teacherId: id })
  .populate('approvedBy', 'firstName lastName')
  .sort('-createdAt');

// Get approved upcoming leave
TeacherLeaveRequest.find({
  status: 'Approved',
  leaveEndDate: { $gte: new Date() }
}).sort('leaveStartDate');

// Get affected students
Allocation.find({
  teacherId: id,
  status: 'Active'
});
```

## Error Handling

**Validation Errors**
- Missing required fields
- Invalid date range (end before start)
- Already cancelled/rejected

**Business Logic Errors**
- Only pending requests can be approved
- Only pending requests can be rejected
- Teachers can only cancel their own
- End date must be after start date

**Email Errors**
- If email service not configured, logs error but continues
- Doesn't block API operations if emails fail

## Security & Authorization

**Authentication**: `auth` middleware required on all endpoints

**Authorization**:
- Teachers can only view/cancel their own requests
- Admins can view all requests and approve/reject
- Admins can cancel any request

**Data Protection**:
- Sensitive data (rejection reasons) only visible to admins
- Teacher emails in notifications are from system, not visible to users

## Testing

### Manual Testing Steps

1. **Teacher Submits Leave**
   - Navigate to Leave Requests
   - Click Apply for Leave
   - Select dates, type, reason
   - Submit
   - Verify confirmation email (if email configured)
   - Verify request appears in history as "Pending"

2. **Admin Reviews**
   - Navigate to Leave Management
   - Should see pending request
   - Click to view details
   - Verify all details shown
   - Approve the request
   - Verify email to teacher
   - Check teacher's "Upcoming Leave" section

3. **Admin Rejects**
   - Submit another request
   - Click reject in admin panel
   - Add rejection reason
   - Verify rejection email to teacher
   - Verify request shows "Rejected" status

4. **Cancel Request**
   - Submit new request
   - While still "Pending", click Cancel
   - Verify cancelled status
   - Try to cancel approved (should be locked)

### API Testing

```bash
# Submit leave request (as teacher)
POST /api/leave-requests
{
  "leaveStartDate": "2026-03-15",
  "leaveEndDate": "2026-03-17",
  "leaveType": "Personal",
  "leaveReason": "Family trip"
}

# Get teacher's requests
GET /api/leave-requests/my-requests

# Get pending requests (as admin)
GET /api/leave-requests?status=Pending

# Approve request
PATCH /api/leave-requests/{id}/approve

# Reject request
PATCH /api/leave-requests/{id}/reject
{
  "rejectionReason": "Conflicting scheduled exams"
}

# Cancel request
PATCH /api/leave-requests/{id}/cancel
```

## Future Enhancements

1. **Temporary Replacement Teacher Assignment**
   - Admin assigns substitute teacher when approving
   - Student sees replacement teacher info
   - Automatic class schedule updates

2. **Calendar View in Admin**
   - Visual calendar showing when teachers are on leave
   - Conflict detection (too many teachers absent)

3. **Recurring Leave**
   - Annual leave, quarterly breaks
   - Template-based requests

4. **Leave Balance Tracking**
   - Allocate yearly leave days
   - Track used/remaining
   - Warn when approaching limit

5. **Attendance Integration**
   - Mark teacher as absent on leave dates
   - Exclude from attendance reports
   - Generate coverage reports

6. **Notification Preferences**
   - Teachers choose notification method
   - SMS alerts for urgent rejections
   - Digest emails for pending count

## Configuration

No special configuration needed beyond existing email setup.

**Required Environment Variables** (for email):
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM` (optional, defaults to noreply@smartious.ac.ke)

## Support

For issues or questions about the leave management system:
1. Check this documentation
2. Review error messages in browser console
3. Check backend logs for email errors
4. Contact admin support

---

**Status**: ✅ Production Ready
**Version**: 1.0
**Last Updated**: April 19, 2026

