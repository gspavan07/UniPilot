# UniPilot API Documentation - Complete Reference

**Enterprise-Grade University Management System API**

**Version:** 1.0.0  
**Company:** UniPilot (Based in Kakinada, Andhra Pradesh, India)  
**Target Market:** Indian Universities & Colleges (Focus: South India)  
**Last Updated:** January 2026

---

## 📚 Documentation Structure

This API documentation is organized into multiple files for easy navigation:

1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Main overview, authentication, authorization, permissions
2. **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** - Part 1: Auth, Users, Departments, Programs
3. **[API_ENDPOINTS_PART2.md](./API_ENDPOINTS_PART2.md)** - Part 2: Courses, Admissions, Attendance, Exams
4. **[API_ENDPOINTS_PART3.md](./API_ENDPOINTS_PART3.md)** - Part 3: Fee Management, HR & Payroll
5. **[API_ENDPOINTS_PART4.md](./API_ENDPOINTS_PART4.md)** - Part 4: Library, Timetable, Infrastructure, etc.
6. **[API_REFERENCE.md](./API_REFERENCE.md)** - This file (Quick reference guide)

---

## 🚀 Quick Start

### Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication

All protected endpoints require JWT token:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "password123"
  }'

# Use token in subsequent requests
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔐 Middleware Reference

### 1. `authenticate`

- **Location:** `/backend/src/middleware/auth.js`
- **Purpose:** Verifies JWT token
- **Usage:** All protected routes
- **Returns:** 401 if token invalid

### 2. `authorize(...roles)`

- **Location:** `/backend/src/middleware/auth.js`
- **Purpose:** Check user role
- **Usage:** Role-specific routes
- **Example:** `authorize('admin', 'super_admin')`
- **Returns:** 403 if role mismatch

### 3. `checkPermission(permission)`

- **Location:** `/backend/src/middleware/auth.js`
- **Purpose:** Check granular permissions
- **Usage:** Feature-specific routes
- **Example:** `checkPermission('students:manage')`
- **Auto-approves:** `admin`, `super_admin`, `administrator`
- **Returns:** 403 if permission missing

---

## 🎯 Permission Matrix

### Complete Permission List (50+ permissions)

| Module         | View                        | Manage                        | Admin                | Publish                 |
| -------------- | --------------------------- | ----------------------------- | -------------------- | ----------------------- |
| **Dashboard**  | `dashboard:view`            | -                             | -                    | -                       |
| **HR**         |
| Staff          | `hr:staff:view`             | `hr:staff:manage`             | -                    | -                       |
| Payroll        | `hr:payroll:view`           | `hr:payroll:manage`           | -                    | `hr:payroll:publish`    |
| Leaves         | `hr:leaves:view`            | `hr:leaves:manage`            | -                    | -                       |
| Attendance     | `hr:attendance:view`        | `hr:attendance:manage`        | -                    | -                       |
| Onboarding     | -                           | `hr:onboarding:access`        | -                    | -                       |
| **Admissions** |
| Admissions     | `admissions:view`           | `admissions:manage`           | `admissions:config`  | -                       |
| **Academics**  |
| Courses        | `academics:courses:view`    | `academics:courses:manage`    | -                    | -                       |
| Timetable      | `academics:timetable:view`  | `academics:timetable:manage`  | -                    | -                       |
| Attendance     | `academics:attendance:view` | `academics:attendance:manage` | -                    | -                       |
| Sections       | -                           | `academics:sections:manage`   | -                    | -                       |
| Promotion      | -                           | `academics:promotion:manage`  | -                    | -                       |
| **Exams**      |
| Exams          | `exams:view`                | `exams:manage`                | -                    | -                       |
| Results        | `exams:results:view`        | `exams:results:entry`         | -                    | `exams:results:publish` |
| **Finance**    |
| Fees           | `finance:fees:view`         | `finance:fees:manage`         | `finance:fees:admin` | -                       |
| Oversight      | `finance:fees:oversight`    | -                             | -                    | -                       |
| **Library**    |
| Books          | `library:books:view`        | `library:books:manage`        | -                    | -                       |
| Issues         | -                           | `library:issues:manage`       | -                    | -                       |
| **Users**      |
| All Users      | `users:view`                | `users:manage`                | -                    | -                       |
| Students       | `students:view`             | `students:manage`             | -                    | -                       |
| **Proctoring** |
| Proctoring     | `proctoring:view`           | `proctoring:manage`           | -                    | -                       |
| Mentoring      | -                           | `proctoring:mentor`           | -                    | -                       |
| **Settings**   |
| Settings       | `settings:view`             | `settings:manage`             | -                    | -                       |
| Roles          | `settings:roles:view`       | `settings:roles:manage`       | -                    | -                       |

---

## 👥 Role-Based Permissions

### Super Admin / Admin

- **Permissions:** ALL (bypasses all permission checks)
- **Access:** Complete system access

### HR Admin / HR

- **Permissions:** All `hr:*` permissions + `dashboard:view` + `users:view`
- **Access:** HR module, staff management, payroll

### Faculty / Staff / HOD

- **Permissions:**
  - `dashboard:view`
  - `academics:courses:view`
  - `academics:timetable:view`
  - `academics:attendance:manage`
  - `exams:results:entry`
  - `library:books:view`
- **Access:** Academic operations, attendance, marks entry

### Student

- **Permissions:**
  - `dashboard:view`
  - `academics:courses:view`
  - `academics:timetable:view`
  - `academics:attendance:view`
  - `exams:results:view`
  - `finance:fees:view`
  - `library:books:view`
- **Access:** View-only access to personal data

---

## 📊 API Modules Overview

### 1. Authentication (`/api/auth`)

- Register, Login, Logout
- Password reset & change
- Profile management
- **7 endpoints** | **Public + Protected**

### 2. User Management (`/api/users`)

- CRUD operations for users
- Bulk import/export
- Statistics & analytics
- Dynamic permission checking
- **11 endpoints** | **Permission:** Dynamic based on role

### 3. Academic Management

#### Departments (`/api/departments`)

- **5 endpoints** | **Permission:** `academics:courses:manage`

#### Programs (`/api/programs`)

- **5 endpoints** | **Permission:** `academics:courses:manage`

#### Courses (`/api/courses`)

- **5 endpoints** | **Permission:** `academics:courses:view/manage`

### 4. Admissions (`/api/admission`)

- Application tracking
- Document verification
- Seat matrix management
- Bulk ID generation
- **11 endpoints** | **Permission:** `admissions:view/manage`

### 5. Attendance (`/api/attendance`)

- Student attendance tracking
- Leave management
- Statistics & reports
- **7 endpoints** | **Permission:** `academics:attendance:manage`

### 6. Examinations (`/api/exam`)

- Exam cycles & schedules
- Marks entry & moderation
- Results publishing
- Hall ticket generation
- **15 endpoints** | **Permission:** `exams:view/manage/results:*`

### 7. Fee Management (`/api/fees`)

- Fee structures & categories
- Payment collection
- Student fee status
- **12 endpoints** | **Permission:** `finance:fees:*`

### 8. HR & Payroll (`/api/hr`)

- Staff attendance
- Leave management
- Salary structures
- Payslip generation
- Bulk payroll processing
- **25 endpoints** | **Permission:** `hr:*`

### 9. Library (`/api/library`)

- Book management
- Issue/Return tracking
- **5 endpoints** | **Permission:** `library:*`

### 10. Timetable (`/api/timetable`)

- Timetable creation
- Slot management
- **5 endpoints** | **Permission:** `academics:timetable:manage`

### 11. Proctoring (`/api/proctor`)

- Proctor assignment
- Student mentoring
- Feedback & sessions
- **6 endpoints** | **Permission:** `proctoring:*`

### 12. Promotion (`/api/promotion`)

- Promotion criteria
- Eligibility evaluation
- Bulk processing
- **4 endpoints** | **Permission:** `academics:courses:manage`

### 13. Infrastructure (`/api/infrastructure`)

- Block & room management
- Facility tracking
- **8 endpoints** | **Permission:** None (should be added)

### 14. Regulations (`/api/regulations`)

- Academic regulations
- Grade scales
- Exam structures
- **7 endpoints** | **Permission:** Role-based (`admin`, `academics_admin`)

### 15. Roles & Permissions (`/api/roles`)

- Role management
- Permission assignment
- **4 endpoints** | **Permission:** `settings:roles:manage`

### 16. Settings (`/api/settings`)

- System configuration
- University details
- **2 endpoints** | **Permission:** Role-based

### 17. Biometric (`/api/biometric`)

- Device sync
- User mapping
- **2 endpoints** | **Permission:** Public/Role-based

### 18. Holidays (`/api/holidays`)

- Holiday calendar
- **4 endpoints** | **Permission:** Role-based

---

## 📈 Total API Coverage

- **Total Endpoints:** 150+
- **Modules:** 18
- **Permissions:** 50+
- **Roles:** 8+ (customizable)
- **Middleware:** 3 core + specialized

---

## 🔧 Common Request Patterns

### Pagination

```
GET /api/users?page=1&limit=50
```

### Filtering

```
GET /api/users?role=student&department=CS&year=2024&section=A
```

### Search

```
GET /api/users?search=ravi
```

### Date Range

```
GET /api/hr/attendance?start_date=2024-01-01&end_date=2024-01-31
```

### Sorting

```
GET /api/users?sort_by=name&order=asc
```

---

## 📝 Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    /* additional context */
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [
      /* array of items */
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 50,
      "totalPages": 3
    }
  }
}
```

---

## 🚨 HTTP Status Codes

| Code | Meaning               | Usage                      |
| ---- | --------------------- | -------------------------- |
| 200  | OK                    | Successful GET, PUT, PATCH |
| 201  | Created               | Successful POST            |
| 204  | No Content            | Successful DELETE          |
| 400  | Bad Request           | Invalid request data       |
| 401  | Unauthorized          | Missing/invalid token      |
| 403  | Forbidden             | Insufficient permissions   |
| 404  | Not Found             | Resource not found         |
| 409  | Conflict              | Duplicate resource         |
| 422  | Unprocessable Entity  | Validation errors          |
| 429  | Too Many Requests     | Rate limit exceeded        |
| 500  | Internal Server Error | Server error               |

---

## 🛡️ Security Features

### 1. JWT Authentication

- Token-based authentication
- Expiration handling
- Refresh token support

### 2. Role-Based Access Control (RBAC)

- Granular permissions
- Role hierarchy
- Dynamic permission checking

### 3. Rate Limiting

- **Development:** 10,000 requests/15 min
- **Production:** 100 requests/15 min (configurable)

### 4. Input Validation

- Request body validation
- SQL injection prevention
- XSS protection

### 5. Secure File Uploads

- Profile pictures: Protected routes
- Student documents: Secure storage
- Bulk uploads: Validation & sanitization

---

## 🌐 India-Specific Features

### 1. Academic Structure

- Semester system (odd/even)
- Regulation-based grading (R20, R21, etc.)
- CGPA/SGPA calculation
- Backlog management

### 2. Fee Management

- Category-wise fee structure
- Installment support
- Scholarship integration ready

### 3. Attendance

- 75% minimum requirement
- Leave management
- Condonation support

### 4. HR & Payroll

- PF/ESI deductions
- Professional tax
- Indian salary components (HRA, DA, etc.)

### 5. Holidays

- National holidays
- Regional festivals (Sankranti, Ugadi, etc.)
- State-specific holidays

---

## 📞 Support & Contact

**Company:** UniPilot  
**Location:** Kakinada, Andhra Pradesh, India  
**Email:** support@unipilot.com  
**Documentation:** https://docs.unipilot.com

---

## 🔄 Versioning

**Current Version:** 1.0.0  
**API Versioning:** URL-based (`/api/v1/...`)  
**Backward Compatibility:** Maintained for major versions

---

## 📜 License

**License Type:** Proprietary  
**Deployment Model:** Self-hosted (per institution)

---

## 🎓 Best Practices

### 1. Always Use HTTPS in Production

```
https://your-domain.com/api
```

### 2. Store Tokens Securely

- Use httpOnly cookies or secure storage
- Never expose tokens in URLs

### 3. Handle Errors Gracefully

```javascript
try {
  const response = await fetch("/api/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();

  if (!data.success) {
    // Handle error
    console.error(data.error);
  }
} catch (error) {
  // Handle network error
  console.error("Network error:", error);
}
```

### 4. Implement Retry Logic for Failed Requests

```javascript
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 5. Use Pagination for Large Datasets

```javascript
// Fetch all students in batches
let page = 1;
let allStudents = [];
let hasMore = true;

while (hasMore) {
  const response = await fetch(
    `/api/users?role=student&page=${page}&limit=100`,
  );
  const data = await response.json();

  allStudents = [...allStudents, ...data.data.users];
  hasMore = page < data.data.pagination.totalPages;
  page++;
}
```

---

## 🔍 Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"password123"}'

# Get users
curl -X GET http://localhost:3000/api/users?role=student \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import the API collection
2. Set environment variables (base_url, token)
3. Use collection runner for bulk testing

### Using JavaScript (Fetch)

```javascript
// Login
const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "admin@college.edu",
    password: "password123",
  }),
});

const { data } = await loginResponse.json();
const token = data.token;

// Get users
const usersResponse = await fetch(
  "http://localhost:3000/api/users?role=student",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

const users = await usersResponse.json();
console.log(users);
```

---

## 📚 Additional Resources

- **GitHub Repository:** [Link to repo]
- **Postman Collection:** [Link to collection]
- **API Changelog:** [Link to changelog]
- **Support Portal:** [Link to support]

---

**Built with ❤️ by the UniPilot Team**  
**Making University Management Simple & Efficient**

---

_Last Updated: January 2026_
