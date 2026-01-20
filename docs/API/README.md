# UniPilot API Documentation

Welcome to the comprehensive API documentation for **UniPilot** - Enterprise University Management System.

---

## 📖 Documentation Files

This folder contains complete API documentation organized into multiple files for easy navigation:

### 1. **[API_REFERENCE.md](./API_REFERENCE.md)** ⭐ START HERE

**Quick Reference Guide**

- Quick start guide
- Complete permission matrix
- Module overview (150+ endpoints)
- Best practices
- Testing examples
- Common patterns

### 2. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

**Core Concepts & Architecture**

- Overview & architecture
- Authentication flow
- Authorization & RBAC
- Middleware documentation
- Error handling
- Rate limiting
- Security features

### 3. **[API_ENDPOINTS.md](./API_ENDPOINTS.md)**

**Endpoints Part 1**

- Authentication (7 endpoints)
- User Management (11 endpoints)
- Departments (5 endpoints)
- Programs (5 endpoints)

### 4. **[API_ENDPOINTS_PART2.md](./API_ENDPOINTS_PART2.md)**

**Endpoints Part 2**

- Courses (5 endpoints)
- Admissions (11 endpoints)
- Attendance (7 endpoints)
- Examinations (15 endpoints)

### 5. **[API_ENDPOINTS_PART3.md](./API_ENDPOINTS_PART3.md)**

**Endpoints Part 3**

- Fee Management (12 endpoints)
- HR & Payroll (25 endpoints)

### 6. **[API_ENDPOINTS_PART4.md](./API_ENDPOINTS_PART4.md)**

**Endpoints Part 4**

- Library (5 endpoints)
- Timetable (5 endpoints)
- Proctoring (6 endpoints)
- Promotion (4 endpoints)
- Infrastructure (8 endpoints)
- Regulations (7 endpoints)
- Roles & Permissions (4 endpoints)
- Settings (2 endpoints)
- Biometric (2 endpoints)
- Holidays (4 endpoints)

---

## 🚀 Quick Navigation

### By User Role

#### **Super Admin / Admin**

- All endpoints (complete access)
- Start with: [User Management](./API_ENDPOINTS.md#2-user-management)
- Key modules: [Roles & Permissions](./API_ENDPOINTS_PART4.md#17-roles--permissions), [Settings](./API_ENDPOINTS_PART4.md#18-settings)

#### **HR Admin / HR Staff**

- [HR & Payroll](./API_ENDPOINTS_PART3.md#10-hr--payroll) (25 endpoints)
- [User Management](./API_ENDPOINTS.md#2-user-management) (staff only)
- [Holidays](./API_ENDPOINTS_PART4.md#20-holidays)
- [Biometric](./API_ENDPOINTS_PART4.md#19-biometric)

#### **Academics Admin**

- [Departments](./API_ENDPOINTS.md#3-departments)
- [Programs](./API_ENDPOINTS.md#4-programs)
- [Courses](./API_ENDPOINTS_PART2.md#5-courses)
- [Regulations](./API_ENDPOINTS_PART4.md#16-regulations)
- [Timetable](./API_ENDPOINTS_PART4.md#12-timetable)

#### **Admissions Officer**

- [Admissions](./API_ENDPOINTS_PART2.md#6-admissions) (11 endpoints)
- [User Management](./API_ENDPOINTS.md#2-user-management) (students only)

#### **Faculty / HOD**

- [Attendance](./API_ENDPOINTS_PART2.md#7-attendance)
- [Examinations](./API_ENDPOINTS_PART2.md#8-examinations) (marks entry)
- [Proctoring](./API_ENDPOINTS_PART4.md#13-proctoring)
- [Timetable](./API_ENDPOINTS_PART4.md#12-timetable) (view)

#### **Accounts / Finance**

- [Fee Management](./API_ENDPOINTS_PART3.md#9-fee-management) (12 endpoints)

#### **Librarian**

- [Library](./API_ENDPOINTS_PART4.md#11-library) (5 endpoints)

#### **Student**

- [My Attendance](./API_ENDPOINTS_PART2.md#72-get-my-attendance-student)
- [My Results](./API_ENDPOINTS_PART2.md#811-get-my-results-student)
- [My Fee Status](./API_ENDPOINTS_PART3.md#91-get-my-fee-status-student)
- [My Courses](./API_ENDPOINTS_PART2.md#52-get-my-courses-student)
- [My Timetable](./API_ENDPOINTS_PART4.md#124-get-my-timetable)
- [My Proctor](./API_ENDPOINTS_PART4.md#136-get-my-proctor-student)

---

## 🔍 By Feature

### Student Lifecycle

1. [Admissions](./API_ENDPOINTS_PART2.md#6-admissions) - Application to admission
2. [User Management](./API_ENDPOINTS.md#2-user-management) - Student records
3. [Attendance](./API_ENDPOINTS_PART2.md#7-attendance) - Daily tracking
4. [Examinations](./API_ENDPOINTS_PART2.md#8-examinations) - Marks & results
5. [Promotion](./API_ENDPOINTS_PART4.md#14-promotion) - Year progression
6. [Fee Management](./API_ENDPOINTS_PART3.md#9-fee-management) - Payment tracking

### Academic Operations

1. [Departments](./API_ENDPOINTS.md#3-departments) - Department setup
2. [Programs](./API_ENDPOINTS.md#4-programs) - Degree programs
3. [Courses](./API_ENDPOINTS_PART2.md#5-courses) - Course catalog
4. [Regulations](./API_ENDPOINTS_PART4.md#16-regulations) - Academic rules
5. [Timetable](./API_ENDPOINTS_PART4.md#12-timetable) - Class scheduling
6. [Examinations](./API_ENDPOINTS_PART2.md#8-examinations) - Exam management

### HR Operations

1. [User Management](./API_ENDPOINTS.md#2-user-management) - Staff records
2. [HR Attendance](./API_ENDPOINTS_PART3.md#101-mark-staff-attendance) - Staff tracking
3. [Leave Management](./API_ENDPOINTS_PART3.md#105-apply-for-leave-staff) - Leave requests
4. [Payroll](./API_ENDPOINTS_PART3.md#1010-get-salary-structure) - Salary processing
5. [Biometric](./API_ENDPOINTS_PART4.md#19-biometric) - Device integration

### Finance Operations

1. [Fee Structures](./API_ENDPOINTS_PART3.md#95-get-fee-structures) - Fee setup
2. [Payment Collection](./API_ENDPOINTS_PART3.md#910-collect-payment) - Payments
3. [Fee Status](./API_ENDPOINTS_PART3.md#91-get-my-fee-status-student) - Tracking
4. [Payroll](./API_ENDPOINTS_PART3.md#10-hr--payroll) - Staff salaries

---

## 📊 Statistics

- **Total Endpoints:** 150+
- **Modules:** 18
- **Permissions:** 50+
- **Roles:** 8+ (customizable)
- **Documentation Pages:** 6

---

## 🔐 Authentication & Security

All API endpoints (except public auth endpoints) require:

1. **JWT Token** in Authorization header:

   ```
   Authorization: Bearer <your_jwt_token>
   ```

2. **Appropriate Permissions** based on role:
   - See [Permission Matrix](./API_REFERENCE.md#-permission-matrix)
   - See [Middleware Reference](./API_DOCUMENTATION.md#middleware-overview)

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unipilot
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=24h

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Running the API

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

---

## 📝 API Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"password123"}'

# Get students
TOKEN="your_jwt_token"
curl -X GET "http://localhost:3000/api/users?role=student" \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. Import API collection (if available)
2. Set environment variables
3. Run collection tests

### Using JavaScript

```javascript
const API_BASE = "http://localhost:3000/api";

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Get students
const getStudents = async (token) => {
  const response = await fetch(`${API_BASE}/users?role=student`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

---

## 🌐 Base URLs

| Environment | URL                                   |
| ----------- | ------------------------------------- |
| Development | `http://localhost:3000/api`           |
| Staging     | `https://staging.your-domain.com/api` |
| Production  | `https://your-domain.com/api`         |

---

## 📞 Support

**Company:** UniPilot  
**Location:** Kakinada, Andhra Pradesh, India  
**Email:** support@unipilot.com  
**Website:** https://unipilot.com

---

## 🔄 Version History

| Version | Date     | Changes         |
| ------- | -------- | --------------- |
| 1.0.0   | Jan 2026 | Initial release |

---

## 📚 Additional Resources

- **Main README:** [../README.md](../README.md)
- **Contributing Guide:** [../CONTRIBUTING.md](../CONTRIBUTING.md)
- **Onboarding Guide:** [../ONBOARDING.md](../ONBOARDING.md)
- **Quick Start:** [../QUICKSTART.md](../QUICKSTART.md)

---

## 🎯 Common Use Cases

### 1. Student Registration Flow

```
POST /api/users (role=student)
  → GET /api/admission/id-previews
  → POST /api/admission/ids/commit
  → PUT /api/users/:id (update details)
  → POST /api/admission/verify-student/:userId
```

### 2. Marks Entry Flow

```
GET /api/exam/schedules (get exam schedule)
  → GET /api/exam/marks/entry-data/:scheduleId
  → POST /api/exam/marks/bulk (enter marks)
  → PUT /api/exam/marks/moderation (moderate)
  → POST /api/exam/marks/bulk-publish (publish)
```

### 3. Payroll Processing Flow

```
GET /api/hr/payroll/preview-bulk (preview)
  → POST /api/hr/payroll/bulk-generate (generate)
  → GET /api/hr/payroll/publish/stats (verify)
  → POST /api/hr/payroll/publish-payout (publish)
  → POST /api/hr/payroll/confirm-payout (confirm payment)
```

### 4. Fee Collection Flow

```
GET /api/fees/structures (get fee structure)
  → GET /api/fees/summary/:studentId (check status)
  → POST /api/fees/payments (collect payment)
  → GET /api/fees/my-status (student verification)
```

---

## 🔍 Search Tips

Use your editor's search function (Ctrl+F / Cmd+F) to find:

- Specific endpoints: Search for "GET /api/users"
- Permissions: Search for "students:manage"
- Roles: Search for "hr_admin"
- Features: Search for "attendance", "payroll", etc.

---

**Happy Coding! 🚀**

_Built with ❤️ for Indian Universities_
