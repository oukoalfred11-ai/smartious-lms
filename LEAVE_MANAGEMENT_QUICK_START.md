# Teacher Leave Management - Quick Setup & Testing Guide

## What's New

A complete teacher leave management system with:
- ✅ Teacher-friendly calendar UI for applying leave
- ✅ Admin approval workflow with notifications
- ✅ Email notifications at each stage
- ✅ Real-time admin dashboard
- ✅ Student allocation tracking

## Files Modified/Created

### New Files
```
frontend/src/pages/teacher/TeacherLeaveRequest.jsx       # Teacher leave portal page
frontend/src/pages/admin/pages/LeaveManagement.jsx       # Admin leave management page
backend/src/services/emailService.js                     # Updated with email functions
LEAVE_MANAGEMENT_GUIDE.md                                # Full documentation
```

### Modified Files
```
frontend/src/pages/teacher/TeacherPortal.jsx            # Added leave menu item
frontend/src/pages/admin/AdminPortal.jsx                # Added leave management menu item
frontend/src/pages/admin/pages/Dashboard.jsx            # Added leave management import
backend/src/routes/status-management.js                 # Updated with email notifications
```

## Database

The existing `TeacherLeaveRequest` model is used (already in codebase):
- No migrations needed
- All fields already defined
- Database ready to go

## How to Test

### 1. Start Backend
```bash
cd backend
npm start
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Login as Teacher
- Navigate to teacher portal
- Look for "Leave Requests" in sidebar (under Account section)
- Should show badge with pending count (e.g., "3")

### 4. Teacher Applies for Leave
- Click "Apply for Leave" button
- Select leave type: Personal, Medical, Emergency, or Other
- Use calendar to select start and end dates
- Enter reason for leave
- Click "Submit Leave Request"
- Should see confirmation toast
- Request appears in history as "Pending"

### 5. Check Leave History
- See statistics (Pending, Approved, Rejected)
- See all past/current requests with status
- See upcoming approved leave

### 6. View as Admin
- Login as admin user
- Navigate to "Leave Management" in sidebar (under Users section)
- See all pending leave requests
- Click on a request to see full details
- Has options to Approve or Reject

### 7. Admin Approves Leave
- Click on a pending request
- Review details: teacher, dates, reason, affected students
- Click "Approve Leave"
- Should see success toast
- Request now shows "Approved" status

### 8. Admin Rejects Leave
- Click on another pending request
- Click "Reject" button
- Enter rejection reason (e.g., "Conflicting exams scheduled")
- Confirm rejection
- Request shows "Rejected" status

### 9. Check Teacher Dashboard
- Go back to teacher portal
- See "Upcoming Approved Leave" card
- Shows all approved leave periods
- Can still cancel pending requests

## Email Testing

If SMTP is configured:
- Teacher receives confirmation email when submitting
- All admins notified when leave submitted
- Teacher notified when approved
- Teacher notified when rejected
- Includes direct links to admin portal

If SMTP not configured:
- System still works (just no emails)
- Check backend logs for any email errors

## Features Demonstrated

### Calendar UI
- Interactive date picker
- Highlights selected range
- Disables past dates
- Shows day count

### Status Workflow
- `Pending` → `Approved` or `Rejected` or `Cancelled`
- Color-coded badges (amber for pending, green for approved, red for rejected)
- Only pending can be cancelled

### Notifications
- Real-time toast messages
- Email notifications if configured
- Admin sees pending count in badge
- Teacher sees upcoming leave

### Data Tracking
- All requests stored in database
- Full audit trail (created, approved dates)
- Affected students tracked
- Rejection reasons recorded

## API Endpoints Available

### For Teachers
- `GET /api/leave-requests/my-requests` - Get own leave requests
- `POST /api/leave-requests` - Submit new leave request
- `PATCH /api/leave-requests/:id/cancel` - Cancel pending request

### For Admins
- `GET /api/leave-requests` - Get all requests (filtered by status)
- `GET /api/leave-requests/pending-count` - Count pending
- `PATCH /api/leave-requests/:id/approve` - Approve request
- `PATCH /api/leave-requests/:id/reject` - Reject with reason

## Troubleshooting

### Leave menu not appearing
- Check that auth middleware is working
- Verify user role is "teacher"
- Check browser console for errors

### Can't submit leave request
- Verify end date is after start date
- Verify all fields are filled
- Check backend logs for API errors

### Email not sending
- Verify SMTP_HOST, SMTP_USER, SMTP_PASS in `.env`
- Check backend console for email errors
- Test with configured email client

### Leave request not appearing for admin
- Refresh admin page
- Check that request status is "Pending"
- Look in correct filter tab (should be on "Pending" tab)

## Integration with Allocations

When admin approves leave:
1. System finds all active allocations for that teacher
2. These allocations are marked as affected
3. Count shown in admin approval view
4. Could be used to auto-reassign students (future feature)

## Next Steps / Future Features

1. **Temporary Teacher Assignment**
   - Admin selects substitute teacher when approving
   - Students see replacement for leave period

2. **Leave Balance**
   - Track annual leave days remaining
   - Prevent approving if no days left

3. **Calendar Conflicts**
   - Prevent multiple teachers from being on leave
   - Warn if important events scheduled

4. **Auto-Reassignment**
   - Automatically suggest/assign temporary teachers
   - Update student schedules

5. **Leave Reports**
   - Export leave calendar
   - Analyze patterns
   - Plan coverage

## Success Indicators

✅ Teacher can apply for leave  
✅ Admin receives notification  
✅ Admin can approve/reject  
✅ Teacher receives email updates  
✅ Leave shows in history with correct status  
✅ Affected students tracked  
✅ Can cancel pending requests  
✅ Statistics display correctly  

---

**Status**: Ready for Testing
**Last Updated**: April 19, 2026

