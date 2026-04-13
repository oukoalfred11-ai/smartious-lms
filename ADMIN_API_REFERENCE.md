# Admin Portal - API Reference & Testing Commands

**Date:** April 13, 2026  
**API Base URL:** `http://localhost:5000/api` (dev) | `https://api.smartioushomeschool.com/api` (prod)  
**Authentication:** Bearer Token (JWT)

---

## 🔑 Authentication Endpoints

### 1. LOGIN
**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "admin@smartious.ac.ke",
  "password": "Admin@123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@smartious.ac.ke",
    "role": "admin",
    "plan": "Staff",
    "curriculum": null,
    "grade": null,
    "xp": 0,
    "streak": 0
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartious.ac.ke",
    "password": "Admin@123"
  }'
```

**Response Time:** < 200ms  
**Rate Limit:** 20 requests / 15 minutes per IP  
**Status Codes:** 200 (success), 400 (missing fields), 401 (invalid credentials), 403 (account deactivated)

---

### 2. GET CURRENT USER
**Endpoint:** `GET /api/auth/me`  
**Auth Required:** Yes (Bearer token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@smartious.ac.ke",
    "role": "admin",
    "plan": "Staff",
    "curriculum": null,
    "grade": null,
    "xp": 0,
    "streak": 0
  }
}
```

**cURL:**
```bash
TOKEN="your_jwt_token_here"
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Status Codes:** 200 (success), 401 (invalid/expired token), 403 (deactivated account)

---

### 3. MSHAURI AI ENDPOINT
**Endpoint:** `POST /api/auth/mshauri`  
**Auth Required:** Yes (Bearer token)  
**Rate Limit:** Configurable per admin (default: 50 requests/student/day)

**Request:**
```json
{
  "message": "Explain Pythagoras Theorem in 2 sentences",
  "masteryContext": "Optional context about student mastery levels"
}
```

**Response (Success):**
```json
{
  "success": true,
  "reply": "Pythagoras Theorem: c squared = a squared + b squared, where c is the hypotenuse. Always identify the right angle first. Key triples to memorise: (3,4,5), (5,12,13), (8,15,17). Shall I generate some practice questions at your level?"
}
```

**cURL:**
```bash
TOKEN="your_jwt_token_here"
curl -X POST http://localhost:5000/api/auth/mshauri \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain Pythagoras Theorem in 2 sentences"
  }'
```

**Example Prompts & Expected Responses:**

| Prompt | Expected Response |
|--------|-------------------|
| "hello" | Greeting with student name + focus topic |
| "what should i study" | Recommendations based on mastery levels |
| "pythagoras" | Explains theorem with practice options |
| "chemistry" | Lists key IGCSE chemistry topics |
| "flashcard" | Offers to generate flashcards |
| "exam" | Exam prep advice + weak topic drilling |
| "progress" | Shows student progress stats |

**Status Codes:** 200 (success), 400 (missing message), 401 (auth failed), 500 (API error)

---

## 👥 User Management Endpoints

### 1. LIST ALL USERS
**Endpoint:** `GET /api/users`  
**Auth Required:** Yes + Admin Role  
**Method:** GET  
**Rate Limit:** 200 requests / 15 minutes

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
  "success": true,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Amara",
      "lastName": "Osei",
      "email": "amara.osei@student.smartious.ac.ke",
      "role": "student",
      "curriculum": "IGCSE",
      "grade": "Form 3",
      "plan": "Premium",
      "isActive": true,
      "isDemo": false,
      "xp": 1250,
      "streak": 5,
      "lastActive": "2026-04-13T14:30:00.000Z",
      "createdAt": "2026-03-15T10:00:00.000Z",
      "updatedAt": "2026-04-13T14:30:00.000Z"
    },
    // ... more users
  ]
}
```

**cURL:**
```bash
TOKEN="your_jwt_token_here"
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

**Query Filters:** (Not implemented, but can be added)
```bash
?role=student&status=active&limit=50&sort=-createdAt
```

**Max Results:** 200 users per request (hardcoded limit)  
**Status Codes:** 200 (success), 401 (auth failed), 403 (not admin)

---

### 2. CREATE USER
**Endpoint:** `POST /api/users`  
**Auth Required:** Yes + Admin Role  
**Rate Limit:** 200 requests / 15 minutes

**Request:**
```json
{
  "firstName": "Test",
  "lastName": "Student",
  "email": "test.student@smartious.ac.ke",
  "password": "SecurePassword@2024",
  "role": "student",
  "curriculum": "IGCSE",
  "grade": "Form 3",
  "plan": "Premium",
  "isActive": true,
  "subjects": ["Mathematics", "Biology"]
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "_id": "507f191e810c19729de860ea",
    "firstName": "Test",
    "lastName": "Student",
    "email": "test.student@smartious.ac.ke",
    "role": "student",
    "curriculum": "IGCSE",
    "grade": "Form 3",
    "plan": "Premium",
    "isActive": true,
    "xp": 0,
    "streak": 0,
    "createdAt": "2026-04-13T15:00:00.000Z"
  }
}
```

**cURL:**
```bash
TOKEN="your_jwt_token_here"
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Student",
    "email": "test.student@smartious.ac.ke",
    "password": "SecurePassword@2024",
    "role": "student",
    "curriculum": "IGCSE",
    "grade": "Form 3",
    "plan": "Premium",
    "isActive": true
  }'
```

**Field Validation:**
- `firstName`: Required, string, trimmed
- `lastName`: Required, string, trimmed
- `email`: Required, unique, lowercase
- `password`: Required, min 8 chars, hashed with bcrypt (salt: 12)
- `role`: Enum: `admin`, `teacher`, `student`, `parent`, `demo`
- `curriculum`: String, optional
- `grade`: String, optional
- `plan`: Enum: `Basic`, `Premium`, `IGCSE Pack`, `Staff`
- `isActive`: Boolean, default: true
- `isDemo`: Boolean, default: false

**Error Responses:**

```json
{
  "success": false,
  "message": "Email already exists"
}
```

Status Codes:
- 201 Created ✓
- 400 Bad Request (validation failed)
- 401 Unauthorized
- 403 Forbidden (not admin)

---

### 3. UPDATE USER
**Endpoint:** `PATCH /api/users/{userId}`  
**Auth Required:** Yes + Admin Role

**Request:**
```json
{
  "firstName": "Updated",
  "plan": "IGCSE Pack",
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f191e810c19729de860ea",
    "firstName": "Updated",
    "lastName": "Student",
    "email": "test.student@smartious.ac.ke",
    "role": "student",
    "plan": "IGCSE Pack",
    "isActive": false,
    // ... other fields
  }
}
```

**cURL:**
```bash
TOKEN="your_jwt_token_here"
USER_ID="507f191e810c19729de860ea"
curl -X PATCH http://localhost:5000/api/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

**Important Notes:**
- ✅ Updatable fields: firstName, lastName, curriculum, grade, plan, isActive, subjects, phone, bio, avatar, etc.
- ❌ Cannot update: password (use dedicated endpoint), role/isDemo (if demo user)
- ❌ Demo users cannot be deactivated (isActive locked)
- Password always deleted from response

**Status Codes:**
- 200 OK ✓
- 404 Not Found
- 401 Unauthorized
- 403 Forbidden (not admin or demo user)
- 500 Server Error

---

### 4. DELETE USER
**Endpoint:** `DELETE /api/users/{userId}`  
**Auth Required:** Yes + Admin Role

**Response (Success):**
```json
{
  "success": true,
  "message": "User deleted"
}
```

**cURL:**
```bash
TOKEN="your_jwt_token_here"
USER_ID="507f191e810c19729de860ea"
curl -X DELETE http://localhost:5000/api/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Important Notes:**
- ❌ **Cannot delete demo users** → Returns 403
- Demo users have `isDemo: true` flag
- Use `PATCH` with `isActive: false` to deactivate instead

**Error Response:**
```json
{
  "success": false,
  "message": "Demo users cannot be deleted."
}
```

**Status Codes:**
- 200 OK ✓
- 404 Not Found
- 401 Unauthorized
- 403 Forbidden (demo user or not admin)

---

## 🛡️ Authentication & Security

### JWT Token Structure
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "id": "507f1f77bcf86cd799439011",
  "iat": 1712950000,
  "exp": 1713555000
}

Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), JWT_SECRET)
```

### Token Details
- **Secret:** `JWT_SECRET` (from .env)
- **Expiry:** 7 days (`JWT_EXPIRES_IN=7d`)
- **Algorithm:** HS256

### How to Extract Token
```javascript
// In browser DevTools:
console.log(localStorage.getItem('token'))

// In cURL (macOS/Linux):
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartious.ac.ke","password":"Admin@123"}' \
  | jq -r '.token')
echo $TOKEN
```

### How to Use Token
```bash
# Every API call must include:
Authorization: Bearer {token}

# Example:
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token Validation Flow
```
1. Client sends request with Authorization header
2. Server extracts token from "Bearer {token}" format
3. Server verifies signature using JWT_SECRET
4. Server decodes payload to get user ID
5. Server fetches user from database
6. Server checks:
   - User exists ✓
   - User is active (isActive: true) ✓
   - User has required role (e.g., admin) ✓
7. If all checks pass → Request proceeds
8. If any check fails → Returns 401/403
```

---

## 📊 Data Models

### User Model
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  role: String (enum: admin, teacher, student, parent, demo),
  grade: String,
  curriculum: String,
  subjects: [String],
  phone: String,
  bio: String,
  avatar: String,
  parentId: ObjectId (ref: User),
  children: [ObjectId] (ref: User),
  isActive: Boolean (default: true),
  isDemo: Boolean (default: false),
  plan: String (enum: Basic, Premium, IGCSE Pack, Staff),
  xp: Number (default: 0),
  streak: Number (default: 0),
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Example Documents
```javascript
// Admin
{
  _id: "507f1f77bcf86cd799439011",
  firstName: "Admin",
  lastName: "User",
  email: "admin@smartious.ac.ke",
  password: "$2a$12$...",
  role: "admin",
  isActive: true,
  isDemo: false,
  plan: "Staff",
  createdAt: "2026-01-01T00:00:00.000Z"
}

// Teacher
{
  _id: "507f1f77bcf86cd799439012",
  firstName: "James",
  lastName: "Muthomi",
  email: "j.muthomi@smartious.ac.ke",
  password: "$2a$12$...",
  role: "teacher",
  subjects: ["Mathematics", "Physics"],
  isActive: true,
  isDemo: false,
  plan: "Staff",
  lastActive: "2026-04-13T14:00:00.000Z",
  createdAt: "2026-01-15T00:00:00.000Z"
}

// Student
{
  _id: "507f1f77bcf86cd799439013",
  firstName: "Amara",
  lastName: "Osei",
  email: "amara.osei@student.smartious.ac.ke",
  password: "$2a$12$...",
  role: "student",
  curriculum: "IGCSE",
  grade: "Form 3",
  subjects: ["Mathematics", "Biology", "Chemistry"],
  isActive: true,
  isDemo: false,
  plan: "Premium",
  xp: 1250,
  streak: 5,
  parentId: "507f1f77bcf86cd799439014",
  lastActive: "2026-04-13T15:30:00.000Z",
  createdAt: "2026-03-15T00:00:00.000Z"
}

// Demo User
{
  _id: "507f1f77bcf86cd799439015",
  firstName: "Demo",
  lastName: "Student",
  email: "demo@smartious.ac.ke",
  password: "$2a$12$...",
  role: "student",
  curriculum: "IGCSE",
  grade: "Form 3",
  isActive: true,
  isDemo: true,  // ← Cannot be modified!
  plan: "Premium",
  createdAt: "2026-02-01T00:00:00.000Z"
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Create & Update User
```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartious.ac.ke","password":"Admin@123"}' \
  | jq -r '.token')

# 2. Create new student
RESPONSE=$(curl -s -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@smartious.ac.ke",
    "password": "JohnDoe@2024",
    "role": "student",
    "curriculum": "IGCSE",
    "grade": "Form 4",
    "plan": "Premium"
  }')

USER_ID=$(echo $RESPONSE | jq -r '.user._id')
echo "Created user: $USER_ID"

# 3. Update user
curl -s -X PATCH http://localhost:5000/api/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan": "IGCSE Pack"}' | jq .

# 4. Get all users to verify
curl -s -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" | jq '.users | length'
```

### Scenario 2: Test Role-Based Access Control
```bash
# 1. Create student account
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@smartious.ac.ke","password":"Student@123"}' \
  | jq .

# Expected: Success, but token is for student role

# 2. Try to list all users with student token
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer {student_token}"

# Expected: 403 Forbidden
# Response: {"success": false, "message": "Access denied."}
```

### Scenario 3: Test Demo User Protection
```bash
# 1. Try to update demo user's role
curl -X PATCH http://localhost:5000/api/users/{demo_user_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "teacher"}'

# Expected: Success (role change is silently ignored for demo users)
# Response: User returned without role change

# 2. Try to deactivate demo user
curl -X PATCH http://localhost:5000/api/users/{demo_user_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# Expected: Success (isActive change is silently ignored)
# Response: User returned with isActive still true

# 3. Try to delete demo user
curl -X DELETE http://localhost:5000/api/users/{demo_user_id} \
  -H "Authorization: Bearer $TOKEN"

# Expected: 403 Forbidden
# Response: {"success": false, "message": "Demo users cannot be deleted."}
```

### Scenario 4: Test Input Validation
```bash
# Missing email
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe"}'
# Expected: 400 (Email required)

# Duplicate email
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Test", "lastName": "Admin", "email": "admin@smartious.ac.ke", "password": "Test@123", "role": "student"}'
# Expected: 400 (Email already exists)

# Invalid role
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe", "email": "test@smartious.ac.ke", "password": "Test@123", "role": "superadmin"}'
# Expected: 400 (Invalid role enum)
```

---

## 📈 Performance & Limits

| Metric | Value |
|--------|-------|
| Global Rate Limit | 200 req / 15 min per IP |
| Auth Rate Limit | 20 req / 15 min per IP |
| Max Users Per Request | 200 (hardcoded) |
| Token Expiry | 7 days |
| Password Hash Rounds | 12 (bcrypt) |
| Max Request Body | 10MB |
| DB Response Time | < 100ms |
| API Response Time | < 200ms |

---

## 🔍 Debugging

### Enable Request Logging
```bash
# In backend index.js, add:
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.headers.authorization?.slice(0, 20) + '...');
  next();
});
```

### Check MongoDB Connection
```bash
# In MongoDB shell:
db.admin.ping()
db.users.countDocuments()
db.users.findOne({email: "admin@smartious.ac.ke"})
```

### Verify JWT Secret
```bash
# In .env:
JWT_SECRET=your_secret_key_here

# The secret must be set before starting server
echo $JWT_SECRET
```

### Check Token Claims
```javascript
// Decode JWT in https://jwt.io
// Paste token to see payload

// Or in Node.js:
const jwt = require('jsonwebtoken');
const decoded = jwt.decode(token);
console.log(decoded);
```

---

## 🚀 Deployment Checklist

Before deploying admin panel:

- [ ] All API endpoints tested and working
- [ ] JWT_SECRET configured in production .env
- [ ] MongoDB connection string verified
- [ ] Rate limiting configured for production
- [ ] CORS origins whitelist updated
- [ ] Error handling for network failures
- [ ] Logging configured
- [ ] Monitoring/alerts set up
- [ ] Database backup procedure documented
- [ ] Password reset flow implemented
- [ ] 2FA implementation (if required)
- [ ] Audit logging for admin actions (future)

---

## 📚 Additional Resources

- **JWT Info:** https://jwt.io
- **MongoDB Docs:** https://docs.mongodb.com
- **Express Security:** https://expressjs.com/en/advanced/best-practice-security.html
- **bcryptjs:** https://github.com/dcodeIO/bcrypt.js
- **Rate Limiting:** https://github.com/nfriedly/express-rate-limit

---

**Version:** 1.0  
**Last Updated:** April 13, 2026  
**Status:** ✅ Ready for Testing


