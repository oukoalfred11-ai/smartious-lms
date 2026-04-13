# 📚 Teacher Profile API Reference

## Overview
The Teacher Profile API provides endpoints for teachers to manage their profile, change passwords, and update email addresses.

**Base URL:** `/api/teacher`  
**Authentication:** JWT Bearer Token (Required for all endpoints)  
**Role Requirement:** `teacher` role  

---

## Endpoints

### 1. Get Teacher Profile
**Endpoint:** `GET /api/teacher/profile`

Retrieve the authenticated teacher's complete profile information.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "profile": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "James",
    "lastName": "Muthomi",
    "email": "j.muthomi@smartious.ac.ke",
    "phone": "+254 745 021 212",
    "bio": "Mathematics teacher with 8 years of experience...",
    "avatar": "JM",
    "avatarColor": "#3B82F6",
    "department": "Mathematics",
    "subjects": ["Mathematics", "Statistics"],
    "qualifications": ["B.Sc. Mathematics", "M.Ed. Secondary Education"],
    "joinedDate": "2018-05-15T00:00:00.000Z",
    "status": "Active",
    "rating": 4.9,
    "reviews": 1840,
    "studentCount": 96,
    "lessonsPerWeek": 12,
    "averageSessionRating": 4.8,
    "lessonsFacilitated": 342
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "No token provided."
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Teacher not found"
}
```

---

### 2. Update Teacher Profile
**Endpoint:** `PATCH /api/teacher/profile`

Update the authenticated teacher's profile information.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+254 712 345 678",
  "bio": "Passionate educator with 10 years of experience..."
}
```

**Validation Rules:**
- `firstName` (required): Non-empty string, trimmed
- `lastName` (required): Non-empty string, trimmed
- `phone` (optional): String, trimmed
- `bio` (optional): String, maximum 500 characters

**Success Response (200):**
```json
{
  "success": true,
  "profile": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "j.muthomi@smartious.ac.ke",
    "phone": "+254 712 345 678",
    "bio": "Passionate educator with 10 years of experience...",
    "avatar": "JD",
    "avatarColor": "#3B82F6",
    "department": "Mathematics",
    "subjects": ["Mathematics", "Statistics"],
    "qualifications": ["B.Sc. Mathematics"],
    "joinedDate": "2018-05-15T00:00:00.000Z",
    "status": "Active",
    "rating": 4.9,
    "reviews": 1840,
    "studentCount": 96,
    "lessonsPerWeek": 12,
    "averageSessionRating": 4.8,
    "lessonsFacilitated": 342
  },
  "message": "Profile updated successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "First name is required"
}
```

---

### 3. Change Password
**Endpoint:** `POST /api/teacher/change-password`

Change the authenticated teacher's password.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "current": "OldPassword123",
  "new": "NewPassword456"
}
```

**Validation Rules:**
- `current` (required): Current password for verification
- `new` (required): New password, minimum 8 characters
- Password is hashed with bcryptjs before storing

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (400 - Too Short):**
```json
{
  "success": false,
  "message": "Password must be at least 8 characters"
}
```

**Error Response (401 - Wrong Current Password):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

### 4. Change Email Address
**Endpoint:** `POST /api/teacher/change-email`

Request an email address change for the authenticated teacher.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "newEmail": "james.new@smartious.ac.ke"
}
```

**Validation Rules:**
- `newEmail` (required): Valid email format with @ symbol
- Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Email must not be already in use by another user
- Email is lowercased before storage

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email changed successfully. Verification email sent.",
  "email": "james.new@smartious.ac.ke"
}
```

**Error Response (400 - Invalid Format):**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

**Error Response (400 - Email in Use):**
```json
{
  "success": false,
  "message": "Email already in use"
}
```

---

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to obtain a token:**
1. Send credentials to `POST /api/auth/login`
2. Response includes `token` field
3. Store token in localStorage as `sm_token`
4. Include in all subsequent requests

**Token expiration:**
- Default: 7 days (set by `JWT_EXPIRES_IN`)
- Expired tokens will return 401 Unauthorized
- User will be redirected to login page

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

**HTTP Status Codes:**
- `200` OK - Request successful
- `400` Bad Request - Validation failed or invalid input
- `401` Unauthorized - No token or invalid token
- `403` Forbidden - User role does not have access
- `404` Not Found - Resource not found
- `500` Internal Server Error - Server error

---

## Usage Examples

### JavaScript/Fetch
```javascript
// Get profile
const response = await fetch('/api/teacher/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
const data = await response.json()
console.log(data.profile)

// Update profile
const updateResponse = await fetch('/api/teacher/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    phone: '+254712345678',
    bio: 'New bio here'
  })
})
const updateData = await updateResponse.json()
```

### Axios (Frontend)
```javascript
import { api } from '@/context/ctx.jsx'

// Get profile - token automatically added from localStorage
const { data } = await api.get('/teacher/profile')
console.log(data.profile)

// Update profile
const { data } = await api.patch('/teacher/profile', {
  firstName: 'John',
  lastName: 'Doe'
})

// Change password
const { data } = await api.post('/teacher/change-password', {
  current: 'OldPass',
  new: 'NewPass'
})

// Change email
const { data } = await api.post('/teacher/change-email', {
  newEmail: 'newemail@example.com'
})
```

### cURL
```bash
# Get profile
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/teacher/profile

# Update profile
curl -X PATCH \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe"}' \
  http://localhost:5000/api/teacher/profile

# Change password
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current":"OldPass","new":"NewPass123"}' \
  http://localhost:5000/api/teacher/change-password
```

---

## Implementation Notes

### Database Schema
The endpoints interact with the User model:

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  bio: String,
  password: String (hashed),
  role: 'teacher',
  department: String,
  subjects: [String],
  qualifications: [String],
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean
}
```

### Security Features
- Passwords hashed with bcryptjs (salt rounds: 12)
- JWT authentication required
- Role-based access control
- Email uniqueness enforced
- Input validation and sanitization
- No password in response data
- Consistent error messages (no information leakage)

### Performance Considerations
- Profile fetch optimized (single database query)
- Email uniqueness check performed once
- Password comparison is async and secure
- No N+1 queries
- Indexed fields: email

---

## Versioning & Updates

**Current Version:** 1.0  
**Last Updated:** April 13, 2026  
**Status:** Production Ready

### Future Enhancements
- Profile picture upload endpoint
- Email verification flow with links
- Activity log endpoint
- Bulk profile updates
- Advanced search/filter options

---

## Support & Questions

For API implementation questions:
1. Check the examples above
2. Review the frontend component at `frontend/src/pages/teacher/TeacherProfile.jsx`
3. Check backend routes at `backend/src/routes/teacher.js`
4. Review error logs and response messages

