# UniPilot API Endpoints Reference

**Version:** 1.0.0  
**Last Updated:** January 2026

This document provides detailed specifications for all API endpoints.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Management](#2-user-management)
3. [Departments](#3-departments)
4. [Programs](#4-programs)
5. [Courses](#5-courses)
6. [Admissions](#6-admissions)
7. [Attendance](#7-attendance)
8. [Examinations](#8-examinations)
9. [Fee Management](#9-fee-management)
10. [HR & Payroll](#10-hr--payroll)
11. [Library](#11-library)
12. [Timetable](#12-timetable)
13. [Proctoring](#13-proctoring)
14. [Promotion](#14-promotion)
15. [Infrastructure](#15-infrastructure)
16. [Regulations](#16-regulations)
17. [Roles & Permissions](#17-roles--permissions)
18. [Settings](#18-settings)
19. [Biometric](#19-biometric)
20. [Holidays](#20-holidays)

---

## 1. Authentication

**Base Path:** `/api/auth`  
**Route File:** `/backend/src/routes/auth.js`  
**Controller:** `/backend/src/controllers/authController.js`

### 1.1 Register User

**Endpoint:** `POST /api/auth/register`  
**Authentication:** None (Public)  
**Permission:** None

**Description:** Register a new user account.

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "first_name": "Ravi",
  "last_name": "Kumar",
  "role": "student"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "first_name": "Ravi",
      "last_name": "Kumar",
      "role": "student"
    }
  }
}
```

---

### 1.2 Login

**Endpoint:** `POST /api/auth/login`  
**Authentication:** None (Public)  
**Permission:** None

**Description:** Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "first_name": "Ravi",
      "last_name": "Kumar",
      "role": "student",
      "profile_picture": "/uploads/profiles/avatar.jpg"
    }
  }
}
```

---

### 1.3 Get Profile

**Endpoint:** `GET /api/auth/me`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Description:** Get current authenticated user's profile.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "student@example.com",
    "first_name": "Ravi",
    "last_name": "Kumar",
    "role": "student",
    "department": "Computer Science",
    "profile_picture": "/uploads/profiles/avatar.jpg"
  }
}
```

---

### 1.4 Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`  
**Authentication:** None (Public)  
**Permission:** None

**Description:** Request password reset link.

**Request Body:**

```json
{
  "email": "student@example.com"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

---

### 1.5 Reset Password

**Endpoint:** `POST /api/auth/reset-password`  
**Authentication:** None (Public)  
**Permission:** None

**Description:** Reset password using token from email.

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### 1.6 Change Password

**Endpoint:** `POST /api/auth/change-password`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Description:** Change password for authenticated user.

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 1.7 Logout

**Endpoint:** `POST /api/auth/logout`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Description:** Logout user (invalidate token).

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. User Management

**Base Path:** `/api/users`  
**Route File:** `/backend/src/routes/user.js`  
**Controller:** `/backend/src/controllers/userController.js`

### Middleware: Dynamic Permission Check

The user routes use a special `checkDynamicPermission` middleware that checks permissions based on the `role` query parameter:

- If `?role=student` → Requires `students:view` or `students:manage`
- If `?role=staff` → Requires `hr:staff:view` or `hr:staff:manage`
- If no role specified → Requires `users:view` or `users:manage` (Admin level)

---

### 2.1 Get All Users

**Endpoint:** `GET /api/users`  
**Authentication:** Required (`authenticate`)  
**Permission:** Dynamic based on `?role` parameter

- `users:view` (all users)
- `students:view` (students only)
- `hr:staff:view` (staff only)

**Description:** Get list of users with filtering and pagination.

**Query Parameters:**

```
?role=student          // Filter by role
&department=CS         // Filter by department
&year=2024            // Filter by batch year
&section=A            // Filter by section
&status=active        // Filter by status
&page=1               // Pagination
&limit=50             // Items per page
&search=ravi          // Search by name/email
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "student@example.com",
        "first_name": "Ravi",
        "last_name": "Kumar",
        "role": "student",
        "department": "Computer Science",
        "year": 2024,
        "section": "A",
        "status": "active",
        "profile_picture": "/uploads/profiles/avatar.jpg"
      }
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

### 2.2 Get User by ID

**Endpoint:** `GET /api/users/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** Dynamic (`users:view`, `students:view`, or `hr:staff:view`)

**Description:** Get detailed information about a specific user.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "student@example.com",
    "first_name": "Ravi",
    "last_name": "Kumar",
    "role": "student",
    "department": "Computer Science",
    "program": "B.Tech CSE",
    "year": 2024,
    "section": "A",
    "roll_number": "21CS001",
    "admission_number": "ADM2024001",
    "phone": "+91 9876543210",
    "date_of_birth": "2003-05-15",
    "gender": "male",
    "blood_group": "O+",
    "address": {
      "city": "Kakinada",
      "state": "Andhra Pradesh",
      "pincode": "533001"
    },
    "status": "active",
    "profile_picture": "/uploads/profiles/avatar.jpg"
  }
}
```

---

### 2.3 Create User

**Endpoint:** `POST /api/users`  
**Authentication:** Required (`authenticate`)  
**Permission:** Dynamic (`users:manage`, `students:manage`, or `hr:staff:manage`)  
**Content-Type:** `multipart/form-data` (supports file uploads)

**Description:** Create a new user (student/staff).

**Request Body (Form Data):**

```json
{
  "email": "newstudent@example.com",
  "password": "TempPass123!",
  "first_name": "Priya",
  "last_name": "Sharma",
  "role": "student",
  "department_id": "uuid",
  "program_id": "uuid",
  "year": 2024,
  "section": "B",
  "phone": "+91 9876543210",
  "date_of_birth": "2003-08-20",
  "gender": "female",
  "blood_group": "A+",
  "documents": [
    /* file uploads */
  ]
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "newstudent@example.com",
    "first_name": "Priya",
    "last_name": "Sharma",
    "role": "student",
    "admission_number": "ADM2024150"
  }
}
```

---

### 2.4 Update User

**Endpoint:** `PUT /api/users/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** Dynamic (`users:manage`, `students:manage`, or `hr:staff:manage`)  
**Content-Type:** `multipart/form-data`

**Description:** Update user information.

**Request Body:**

```json
{
  "first_name": "Priya Updated",
  "phone": "+91 9876543211",
  "section": "C",
  "status": "active"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "first_name": "Priya Updated",
    "phone": "+91 9876543211"
  }
}
```

---

### 2.5 Delete User

**Endpoint:** `DELETE /api/users/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** Dynamic (`users:manage`, `students:manage`, or `hr:staff:manage`)

**Description:** Delete a user (soft delete).

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 2.6 Get User Statistics

**Endpoint:** `GET /api/users/stats`  
**Authentication:** Required (`authenticate`)  
**Permission:** Dynamic (`users:view`, `students:view`, or `hr:staff:view`)

**Description:** Get user statistics and analytics.

**Query Parameters:**

```
?role=student          // Filter by role
&department=CS         // Filter by department
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "total": 500,
    "active": 480,
    "inactive": 20,
    "byDepartment": {
      "Computer Science": 150,
      "Mechanical": 120,
      "Civil": 100
    },
    "byYear": {
      "2024": 150,
      "2023": 140,
      "2022": 130
    }
  }
}
```

---

### 2.7 Bulk Import Users

**Endpoint:** `POST /api/users/bulk-import`  
**Authentication:** Required (`authenticate`)  
**Permission:** Dynamic (`users:manage`, `students:manage`, or `hr:staff:manage`)  
**Content-Type:** `multipart/form-data`

**Description:** Import multiple users from Excel/CSV file.

**Request:**

```
file: students.xlsx (Excel file)
```

**Excel Format:**
| email | first_name | last_name | role | department | year | section |
|-------|-----------|-----------|------|------------|------|---------|
| s1@ex.com | Ravi | Kumar | student | CS | 2024 | A |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Bulk import completed",
  "data": {
    "imported": 45,
    "failed": 5,
    "errors": [
      {
        "row": 10,
        "email": "duplicate@ex.com",
        "error": "Email already exists"
      }
    ]
  }
}
```

---

### 2.8 Update Bank Details

**Endpoint:** `PUT /api/users/:id/bank-details`  
**Authentication:** Required (`authenticate`)  
**Permission:** None (users can update their own)

**Description:** Update bank account details for salary/refunds.

**Request Body:**

```json
{
  "account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "branch": "Kakinada Main"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Bank details updated successfully"
}
```

---

### 2.9 Get Student Sections

**Endpoint:** `GET /api/users/sections`  
**Authentication:** Required (`authenticate`)  
**Permission:** Dynamic (`users:view` or `students:view`)

**Description:** Get list of all sections with student counts.

**Query Parameters:**

```
?year=2024
&department=CS
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "section": "A",
      "count": 60,
      "year": 2024,
      "department": "Computer Science"
    },
    {
      "section": "B",
      "count": 58,
      "year": 2024,
      "department": "Computer Science"
    }
  ]
}
```

---

### 2.10 Bulk Update Sections

**Endpoint:** `POST /api/users/bulk-update-sections`  
**Authentication:** Required (`authenticate`)  
**Permission:** `users:manage`, `students:manage`, or `academics:sections:manage`

**Description:** Bulk update student sections.

**Request Body:**

```json
{
  "updates": [
    {
      "user_id": "uuid1",
      "section": "B"
    },
    {
      "user_id": "uuid2",
      "section": "C"
    }
  ]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Sections updated successfully",
  "data": {
    "updated": 2
  }
}
```

---

### 2.11 Get Batch Years

**Endpoint:** `GET /api/users/batch-years`  
**Authentication:** Required (`authenticate`)  
**Permission:** Dynamic (`users:view` or `students:view`)

**Description:** Get list of all batch years.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "years": [2024, 2023, 2022, 2021]
  }
}
```

---

## 3. Departments

**Base Path:** `/api/departments`  
**Route File:** `/backend/src/routes/department.js`  
**Controller:** `/backend/src/controllers/departmentController.js`

### 3.1 Get All Departments

**Endpoint:** `GET /api/departments`  
**Authentication:** Required (`authenticate`)  
**Permission:** None (all authenticated users)

**Description:** Get list of all departments.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Computer Science & Engineering",
      "code": "CSE",
      "hod_id": "uuid",
      "hod_name": "Dr. Ramesh Kumar",
      "total_students": 240,
      "total_faculty": 15,
      "status": "active"
    }
  ]
}
```

---

### 3.2 Get Department by ID

**Endpoint:** `GET /api/departments/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Description:** Get detailed department information.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Computer Science & Engineering",
    "code": "CSE",
    "description": "Department of Computer Science",
    "hod_id": "uuid",
    "hod": {
      "id": "uuid",
      "name": "Dr. Ramesh Kumar",
      "email": "hod.cse@college.edu"
    },
    "programs": [
      {
        "id": "uuid",
        "name": "B.Tech CSE",
        "duration": 4
      }
    ],
    "faculty": 15,
    "students": 240
  }
}
```

---

### 3.3 Create Department

**Endpoint:** `POST /api/departments`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Description:** Create a new department.

**Request Body:**

```json
{
  "name": "Artificial Intelligence & Data Science",
  "code": "AIDS",
  "description": "Department of AI & DS",
  "hod_id": "uuid"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": "uuid",
    "name": "Artificial Intelligence & Data Science",
    "code": "AIDS"
  }
}
```

---

### 3.4 Update Department

**Endpoint:** `PUT /api/departments/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Request Body:**

```json
{
  "name": "AI & Data Science",
  "hod_id": "new-uuid"
}
```

**Response:** `200 OK`

---

### 3.5 Delete Department

**Endpoint:** `DELETE /api/departments/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Response:** `200 OK`

---

## 4. Programs

**Base Path:** `/api/programs`  
**Route File:** `/backend/src/routes/program.js`  
**Controller:** `/backend/src/controllers/programController.js`

### 4.1 Get All Programs

**Endpoint:** `GET /api/programs`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Query Parameters:**

```
?department_id=uuid    // Filter by department
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "B.Tech Computer Science",
      "code": "BTECHCSE",
      "department_id": "uuid",
      "department_name": "Computer Science",
      "duration": 4,
      "total_semesters": 8,
      "degree_type": "undergraduate"
    }
  ]
}
```

---

### 4.2 Get Program by ID

**Endpoint:** `GET /api/programs/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Response:** `200 OK`

---

### 4.3 Create Program

**Endpoint:** `POST /api/programs`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Request Body:**

```json
{
  "name": "M.Tech Computer Science",
  "code": "MTECHCSE",
  "department_id": "uuid",
  "duration": 2,
  "total_semesters": 4,
  "degree_type": "postgraduate"
}
```

**Response:** `201 Created`

---

### 4.4 Update Program

**Endpoint:** `PUT /api/programs/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Response:** `200 OK`

---

### 4.5 Delete Program

**Endpoint:** `DELETE /api/programs/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Response:** `200 OK`

---

## 5. Courses

**Base Path:** `/api/courses`  
**Route File:** `/backend/src/routes/course.js`  
**Controller:** `/backend/src/controllers/courseController.js`

### 5.1 Get All Courses

**Endpoint:** `GET /api/courses`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:view`

**Query Parameters:**

```
?department_id=uuid
&program_id=uuid
&semester=3
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "course_code": "CS301",
      "course_name": "Data Structures",
      "credits": 4,
      "semester": 3,
      "department": "Computer Science",
      "program": "B.Tech CSE",
      "faculty_assigned": "Dr. Kumar"
    }
  ]
}
```

---

### 5.2 Get My Courses (Student)

**Endpoint:** `GET /api/courses/my-courses`  
**Authentication:** Required (`authenticate`)  
**Permission:** None (students can view their own)

**Description:** Get courses assigned to the logged-in student.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "course_code": "CS301",
      "course_name": "Data Structures",
      "credits": 4,
      "semester": 3,
      "faculty": {
        "name": "Dr. Kumar",
        "email": "kumar@college.edu"
      }
    }
  ]
}
```

---

### 5.3 Create Course

**Endpoint:** `POST /api/courses`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Request Body:**

```json
{
  "course_code": "CS401",
  "course_name": "Machine Learning",
  "credits": 4,
  "semester": 7,
  "department_id": "uuid",
  "program_id": "uuid",
  "faculty_id": "uuid"
}
```

**Response:** `201 Created`

---

### 5.4 Update Course

**Endpoint:** `PUT /api/courses/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Response:** `200 OK`

---

### 5.5 Delete Course

**Endpoint:** `DELETE /api/courses/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Response:** `200 OK`

---

## 6. Admissions

**Base Path:** `/api/admission`  
**Route File:** `/backend/src/routes/admission.js`  
**Controller:** `/backend/src/controllers/admissionController.js`

### 6.1 Get Admission Statistics

**Endpoint:** `GET /api/admission/stats`  
**Authentication:** Required (`authenticate`)  
**Permission:** `admissions:view`

**Query Parameters:**

```
?year=2024
&program_id=uuid
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "total_applications": 500,
    "approved": 350,
    "pending": 100,
    "rejected": 50,
    "documents_verified": 300,
    "documents_pending": 200
  }
}
```

---

### 6.2 Get Seat Matrix

**Endpoint:** `GET /api/admission/seat-matrix`  
**Authentication:** Required (`authenticate`)  
**Permission:** `admissions:view`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "program": "B.Tech CSE",
      "total_seats": 60,
      "filled": 58,
      "available": 2,
      "category_wise": {
        "general": { "total": 30, "filled": 30 },
        "obc": { "total": 15, "filled": 14 },
        "sc": { "total": 10, "filled": 9 },
        "st": { "total": 5, "filled": 5 }
      }
    }
  ]
}
```

---

### 6.3 Get Student Documents

**Endpoint:** `GET /api/admission/documents/:userId`  
**Authentication:** Required (`authenticate`)  
**Permission:** `admissions:view`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "documents": [
      {
        "id": "uuid",
        "document_type": "10th_marksheet",
        "file_url": "/uploads/student_docs/10th.pdf",
        "status": "verified",
        "verified_by": "Admin Name",
        "verified_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": "uuid",
        "document_type": "12th_marksheet",
        "file_url": "/uploads/student_docs/12th.pdf",
        "status": "pending",
        "verified_by": null,
        "verified_at": null
      }
    ]
  }
}
```

---

### 6.4 Update Document Status

**Endpoint:** `PUT /api/admission/documents/:id/status`  
**Authentication:** Required (`authenticate`)  
**Permission:** `admissions:manage`

**Request Body:**

```json
{
  "status": "verified",
  "remarks": "All details verified"
}
```

**Response:** `200 OK`

---

### 6.5 Generate Admission Letter

**Endpoint:** `GET /api/admission/letter/:userId`  
**Authentication:** Required (`authenticate`)  
**Permission:** `admissions:view`

**Description:** Generate and download admission letter PDF.

**Response:** `200 OK` (PDF file)

---

### 6.6 Verify Student

**Endpoint:** `POST /api/admission/verify-student/:userId`  
**Authentication:** Required (`authenticate`)  
**Permission:** `admissions:manage`

**Description:** Mark student as verified and activate account.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Student verified successfully"
}
```

---

### 6.7 Get Funnel Statistics

**Endpoint:** `GET /api/admission/funnel`  
**Authentication:** Required (`authenticate`)  
**Permission:** `admissions:view`

**Description:** Get admission funnel analytics.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "stages": [
      { "stage": "Applied", "count": 500 },
      { "stage": "Documents Submitted", "count": 450 },
      { "stage": "Documents Verified", "count": 350 },
      { "stage": "Fee Paid", "count": 320 },
      { "stage": "Admitted", "count": 300 }
    ]
  }
}
```

---

### 6.8 Get Geographic Statistics

**Endpoint:** `GET /api/admission/geo-stats`  
**Authentication:** Required (`authenticate`)  
**Permission:** `admissions:view`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "by_state": {
      "Andhra Pradesh": 250,
      "Telangana": 100,
      "Tamil Nadu": 50
    },
    "by_city": {
      "Kakinada": 80,
      "Visakhapatnam": 70,
      "Vijayawada": 60
    }
  }
}
```

---

### 6.9 Bulk ID Generation - Preview

**Endpoint:** `POST /api/admission/ids/preview`  
**Authentication:** Required (`authenticate`)  
**Permission:** `admissions:manage`

**Request Body:**

```json
{
  "batch_year": 2024,
  "program_id": "uuid",
  "count": 60
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "preview": [
      {
        "temp_id": "TEMP2024001",
        "admission_number": "ADM2024001"
      }
    ],
    "total": 60
  }
}
```

---

### 6.10 Bulk ID Generation - Commit

**Endpoint:** `POST /api/admission/ids/commit`  
**Authentication:** Required (`authenticate`)  
**Permission:** `admissions:manage`

**Request Body:**

```json
{
  "batch_year": 2024,
  "program_id": "uuid",
  "student_ids": ["uuid1", "uuid2"]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "IDs generated successfully",
  "data": {
    "generated": 60
  }
}
```

---

### 6.11 Bulk Photo Upload

**Endpoint:** `POST /api/admission/photos/bulk`  
**Authentication:** Required (`authenticate`)  
**Permission:** `admissions:manage`  
**Content-Type:** `multipart/form-data`

**Description:** Upload student photos in bulk (filename should match admission number).

**Request:**

```
photos[]: ADM2024001.jpg
photos[]: ADM2024002.jpg
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "uploaded": 58,
    "failed": 2,
    "errors": [
      {
        "filename": "ADM2024999.jpg",
        "error": "Student not found"
      }
    ]
  }
}
```

---

## 7. Attendance

**Base Path:** `/api/attendance`  
**Route File:** `/backend/src/routes/attendance.js`  
**Controller:** `/backend/src/controllers/attendanceController.js`

### 7.1 Mark Attendance

**Endpoint:** `POST /api/attendance/mark`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:attendance:manage`

**Description:** Mark attendance for a class session.

**Request Body:**

```json
{
  "session_id": "uuid",
  "date": "2024-01-20",
  "attendance": [
    {
      "student_id": "uuid1",
      "status": "present"
    },
    {
      "student_id": "uuid2",
      "status": "absent"
    },
    {
      "student_id": "uuid3",
      "status": "late"
    }
  ]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "total": 60,
    "present": 58,
    "absent": 2
  }
}
```

---

### 7.2 Get My Attendance (Student)

**Endpoint:** `GET /api/attendance/my-attendance`  
**Authentication:** Required (`authenticate`)  
**Permission:** None (students view their own)

**Query Parameters:**

```
?semester=3
&course_id=uuid
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "overall_percentage": 85.5,
    "courses": [
      {
        "course_code": "CS301",
        "course_name": "Data Structures",
        "total_classes": 40,
        "attended": 35,
        "percentage": 87.5,
        "status": "satisfactory"
      }
    ]
  }
}
```

---

### 7.3 Get Today's Classes (Faculty)

**Endpoint:** `GET /api/attendance/faculty/today`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:attendance:manage`

**Description:** Get today's classes for the logged-in faculty.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "session_id": "uuid",
      "course": "Data Structures",
      "time": "09:00 AM - 10:00 AM",
      "section": "A",
      "room": "Lab-101",
      "attendance_marked": false
    }
  ]
}
```

---

### 7.4 Get Attendance Statistics

**Endpoint:** `GET /api/attendance/stats`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:attendance:manage`

**Query Parameters:**

```
?department_id=uuid
&year=2024
&section=A
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "average_attendance": 82.5,
    "students_below_75": 15,
    "total_students": 60,
    "by_course": [
      {
        "course": "Data Structures",
        "average": 85.0
      }
    ]
  }
}
```

---

### 7.5 Apply for Leave (Student)

**Endpoint:** `POST /api/attendance/leave/apply`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Request Body:**

```json
{
  "start_date": "2024-01-25",
  "end_date": "2024-01-27",
  "reason": "Medical emergency",
  "supporting_document": "file_url"
}
```

**Response:** `201 Created`

---

### 7.6 Get Leave Requests

**Endpoint:** `GET /api/attendance/leave/requests`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:attendance:manage`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "student_name": "Ravi Kumar",
      "start_date": "2024-01-25",
      "end_date": "2024-01-27",
      "reason": "Medical emergency",
      "status": "pending",
      "applied_at": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

### 7.7 Update Leave Status

**Endpoint:** `PUT /api/attendance/leave/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:attendance:manage`

**Request Body:**

```json
{
  "status": "approved",
  "remarks": "Approved for medical reasons"
}
```

**Response:** `200 OK`

---

## 8. Examinations

**Base Path:** `/api/exam`  
**Route File:** `/backend/src/routes/exam.js`  
**Controller:** `/backend/src/controllers/examController.js`

### 8.1 Get Exam Cycles

**Endpoint:** `GET /api/exam/cycles`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:view`

**Query Parameters:**

```
?academic_year=2023-24
&semester=3
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Mid Term 1",
      "exam_type": "mid_term",
      "academic_year": "2023-24",
      "semester": 3,
      "start_date": "2024-02-01",
      "end_date": "2024-02-10",
      "status": "upcoming"
    }
  ]
}
```

---

### 8.2 Create Exam Cycle

**Endpoint:** `POST /api/exam/cycles`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:manage`

**Request Body:**

```json
{
  "name": "End Semester Exam",
  "exam_type": "end_semester",
  "academic_year": "2023-24",
  "semester": 3,
  "start_date": "2024-04-01",
  "end_date": "2024-04-15",
  "regulation_id": "uuid"
}
```

**Response:** `201 Created`

---

### 8.3 Get Exam Schedules

**Endpoint:** `GET /api/exam/schedules`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:view`

**Query Parameters:**

```
?cycle_id=uuid
&department_id=uuid
&year=2024
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "cycle_name": "Mid Term 1",
      "course_code": "CS301",
      "course_name": "Data Structures",
      "exam_date": "2024-02-05",
      "start_time": "09:00 AM",
      "end_time": "12:00 PM",
      "room": "Hall-A",
      "max_marks": 50
    }
  ]
}
```

---

### 8.4 Add Exam Schedule

**Endpoint:** `POST /api/exam/schedules`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:manage`

**Request Body:**

```json
{
  "cycle_id": "uuid",
  "course_id": "uuid",
  "exam_date": "2024-02-05",
  "start_time": "09:00",
  "end_time": "12:00",
  "room_id": "uuid",
  "max_marks": 50
}
```

**Response:** `201 Created`

---

### 8.5 Auto-Generate Timetable

**Endpoint:** `POST /api/exam/schedules/auto-generate`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:manage`

**Request Body:**

```json
{
  "cycle_id": "uuid",
  "start_date": "2024-02-01",
  "sessions_per_day": 2,
  "gap_days": 1
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Timetable generated successfully",
  "data": {
    "schedules_created": 40
  }
}
```

---

### 8.6 Get My Exam Schedules (Student)

**Endpoint:** `GET /api/exam/my-schedules`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "course_code": "CS301",
      "course_name": "Data Structures",
      "exam_date": "2024-02-05",
      "time": "09:00 AM - 12:00 PM",
      "room": "Hall-A",
      "max_marks": 50
    }
  ]
}
```

---

### 8.7 Enter Marks

**Endpoint:** `POST /api/exam/marks/bulk`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:results:entry`

**Request Body:**

```json
{
  "schedule_id": "uuid",
  "marks": [
    {
      "student_id": "uuid1",
      "marks_obtained": 45,
      "is_absent": false
    },
    {
      "student_id": "uuid2",
      "marks_obtained": 0,
      "is_absent": true
    }
  ]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Marks entered successfully",
  "data": {
    "total": 60,
    "entered": 60
  }
}
```

---

### 8.8 Get Schedule Marks

**Endpoint:** `GET /api/exam/marks/:scheduleId`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:results:entry`

**Description:** Get all marks for a specific exam schedule.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "schedule": {
      "course": "Data Structures",
      "max_marks": 50
    },
    "marks": [
      {
        "student_id": "uuid",
        "student_name": "Ravi Kumar",
        "roll_number": "21CS001",
        "marks_obtained": 45,
        "is_absent": false,
        "status": "moderated"
      }
    ]
  }
}
```

---

### 8.9 Update Moderation Status

**Endpoint:** `PUT /api/exam/marks/moderation`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:results:publish`

**Request Body:**

```json
{
  "schedule_id": "uuid",
  "status": "moderated"
}
```

**Response:** `200 OK`

---

### 8.10 Bulk Publish Results

**Endpoint:** `POST /api/exam/marks/bulk-publish`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:results:publish`

**Request Body:**

```json
{
  "cycle_id": "uuid",
  "year": 2024,
  "section": "A"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Results published successfully",
  "data": {
    "students_processed": 60,
    "results_published": 60
  }
}
```

---

### 8.11 Get My Results (Student)

**Endpoint:** `GET /api/exam/my-results`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Query Parameters:**

```
?semester=3
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "semester": 3,
    "sgpa": 8.5,
    "cgpa": 8.3,
    "results": [
      {
        "course_code": "CS301",
        "course_name": "Data Structures",
        "credits": 4,
        "mid_term_1": 45,
        "mid_term_2": 48,
        "end_semester": 85,
        "total": 178,
        "grade": "A",
        "grade_points": 9.0
      }
    ]
  }
}
```

---

### 8.12 Get Consolidated Results

**Endpoint:** `GET /api/exam/consolidated-results`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:results:publish`

**Query Parameters:**

```
?year=2024
&section=A
&semester=3
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "student_id": "uuid",
      "student_name": "Ravi Kumar",
      "roll_number": "21CS001",
      "sgpa": 8.5,
      "cgpa": 8.3,
      "total_credits": 20,
      "status": "pass"
    }
  ]
}
```

---

### 8.13 Generate Hall Tickets

**Endpoint:** `POST /api/exam/hall-ticket/generate`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:manage`

**Request Body:**

```json
{
  "cycle_id": "uuid",
  "student_ids": ["uuid1", "uuid2"]
}
```

**Response:** `200 OK` (PDF file)

---

### 8.14 Bulk Import Marks

**Endpoint:** `POST /api/exam/marks/bulk-import`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:manage`  
**Content-Type:** `multipart/form-data`

**Request:**

```
file: marks.xlsx
```

**Response:** `200 OK`

---

### 8.15 Download Import Template

**Endpoint:** `GET /api/exam/marks/template`  
**Authentication:** Required (`authenticate`)  
**Permission:** `exams:manage`

**Description:** Download Excel template for bulk marks import.

**Response:** `200 OK` (Excel file)

---

## 9. Fee Management

**Base Path:** `/api/fees`  
**Route File:** `/backend/src/routes/fee.js`  
**Controller:** `/backend/src/controllers/feeController.js`

### 9.1 Get My Fee Status (Student)

**Endpoint:** `GET /api/fees/my-status`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Description:** Get fee payment status for logged-in student.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "student_id": "uuid",
    "student_name": "Ravi Kumar",
    "program": "B.Tech CSE",
    "year": 2,
    "semester": 3,
    "total_fee": 75000,
    "paid": 50000,
    "pending": 25000,
    "due_date": "2024-02-15",
    "status": "partial",
    "payments": [
      {
        "id": "uuid",
        "amount": 50000,
        "payment_date": "2024-01-10",
        "payment_mode": "online",
        "receipt_number": "REC2024001",
        "status": "success"
      }
    ],
    "breakdown": [
      {
        "category": "Tuition Fee",
        "amount": 60000,
        "paid": 40000,
        "pending": 20000
      },
      {
        "category": "Lab Fee",
        "amount": 10000,
        "paid": 10000,
        "pending": 0
      },
      {
        "category": "Library Fee",
        "amount": 5000,
        "paid": 0,
        "pending": 5000
      }
    ]
  }
}
```

---

### 9.2 Get Student Fee Status

**Endpoint:** `GET /api/fees/summary/:studentId`  
**Authentication:** Required (`authenticate`)  
**Permission:** `finance:fees:view`

**Description:** Get fee status for a specific student (admin/accounts).

**Response:** `200 OK` (Same structure as above)

---

### 9.3 Get Fee Categories

**Endpoint:** `GET /api/fees/categories`  
**Authentication:** Required (`authenticate`)  
**Permission:** `finance:fees:oversight`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Tuition Fee",
      "description": "Semester tuition fee",
      "is_mandatory": true,
      "is_refundable": false
    },
    {
      "id": "uuid",
      "name": "Lab Fee",
      "description": "Laboratory charges",
      "is_mandatory": true,
      "is_refundable": false
    }
  ]
}
```

---

### 9.4 Create Fee Category

**Endpoint:** `POST /api/fees/categories`  
**Authentication:** Required (`authenticate`)  
**Permission:** `finance:fees:admin`

**Request Body:**

```json
{
  "name": "Sports Fee",
  "description": "Annual sports and athletics fee",
  "is_mandatory": false,
  "is_refundable": true
}
```

**Response:** `201 Created`

---

### 9.5 Get Fee Structures

**Endpoint:** `GET /api/fees/structures`  
**Authentication:** Required (`authenticate`)  
**Permission:** `finance:fees:oversight`

**Query Parameters:**

```
?program_id=uuid
&academic_year=2023-24
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "program": "B.Tech CSE",
      "academic_year": "2023-24",
      "year": 2,
      "semester": 3,
      "total_amount": 75000,
      "components": [
        {
          "category": "Tuition Fee",
          "amount": 60000
        },
        {
          "category": "Lab Fee",
          "amount": 10000
        },
        {
          "category": "Library Fee",
          "amount": 5000
        }
      ],
      "due_date": "2024-02-15"
    }
  ]
}
```

---

### 9.6 Create Fee Structure

**Endpoint:** `POST /api/fees/structures`  
**Authentication:** Required (`authenticate`)  
**Permission:** `finance:fees:admin`

**Request Body:**

```json
{
  "program_id": "uuid",
  "academic_year": "2023-24",
  "year": 2,
  "semester": 3,
  "components": [
    {
      "category_id": "uuid",
      "amount": 60000
    },
    {
      "category_id": "uuid",
      "amount": 10000
    }
  ],
  "due_date": "2024-02-15"
}
```

**Response:** `201 Created`

---

### 9.7 Update Fee Structure

**Endpoint:** `PUT /api/fees/structures/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `finance:fees:admin`

**Response:** `200 OK`

---

### 9.8 Delete Fee Structure

**Endpoint:** `DELETE /api/fees/structures/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `finance:fees:admin`

**Response:** `200 OK`

---

### 9.9 Clone Fee Structure

**Endpoint:** `POST /api/fees/structures/clone`  
**Authentication:** Required (`authenticate`)  
**Permission:** `finance:fees:admin`

**Description:** Clone fee structure from previous year/semester.

**Request Body:**

```json
{
  "source_structure_id": "uuid",
  "target_academic_year": "2024-25",
  "target_semester": 5,
  "adjustment_percentage": 5
}
```

**Response:** `201 Created`

---

### 9.10 Collect Payment

**Endpoint:** `POST /api/fees/payments`  
**Authentication:** Required (`authenticate`)  
**Permission:** `finance:fees:manage`

**Request Body:**

```json
{
  "student_id": "uuid",
  "amount": 25000,
  "payment_mode": "cash",
  "payment_date": "2024-01-20",
  "transaction_id": "TXN123456",
  "remarks": "Partial payment for semester 3"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Payment collected successfully",
  "data": {
    "payment_id": "uuid",
    "receipt_number": "REC2024050",
    "amount": 25000,
    "remaining_balance": 0
  }
}
```

---

### 9.11 Get Semester Configs

**Endpoint:** `GET /api/fees/semester-configs`  
**Authentication:** Required (`authenticate`)  
**Permission:** `finance:fees:admin`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "academic_year": "2023-24",
      "semester": 3,
      "start_date": "2024-01-01",
      "end_date": "2024-05-31",
      "fee_due_date": "2024-02-15"
    }
  ]
}
```

---

### 9.12 Update Semester Config

**Endpoint:** `PUT /api/fees/semester-configs`  
**Authentication:** Required (`authenticate`)  
**Permission:** `finance:fees:admin`

**Request Body:**

```json
{
  "academic_year": "2023-24",
  "semester": 3,
  "fee_due_date": "2024-02-20"
}
```

**Response:** `200 OK`

---

## 10. HR & Payroll

**Base Path:** `/api/hr`  
**Route File:** `/backend/src/routes/hr.js`  
**Controllers:**

- `/backend/src/controllers/staffAttendanceController.js`
- `/backend/src/controllers/payrollController.js`
- `/backend/src/controllers/hrDashboardController.js`

### 10.1 Mark Staff Attendance

**Endpoint:** `POST /api/hr/attendance/mark`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:attendance:manage`

**Request Body:**

```json
{
  "date": "2024-01-20",
  "attendance": [
    {
      "user_id": "uuid1",
      "check_in": "09:00:00",
      "check_out": "17:30:00",
      "status": "present"
    },
    {
      "user_id": "uuid2",
      "status": "absent"
    }
  ]
}
```

**Response:** `200 OK`

---

### 10.2 Get Daily Attendance View

**Endpoint:** `GET /api/hr/attendance/daily-view`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:attendance:manage`

**Query Parameters:**

```
?date=2024-01-20
&department_id=uuid
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "date": "2024-01-20",
    "total_staff": 50,
    "present": 48,
    "absent": 2,
    "late": 3,
    "attendance": [
      {
        "user_id": "uuid",
        "name": "Dr. Kumar",
        "department": "Computer Science",
        "check_in": "09:05:00",
        "check_out": "17:30:00",
        "status": "present",
        "late": true
      }
    ]
  }
}
```

---

### 10.3 Get Staff Attendance Stats

**Endpoint:** `GET /api/hr/attendance`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:attendance:view`

**Query Parameters:**

```
?user_id=uuid
&month=1
&year=2024
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "name": "Dr. Kumar",
    "month": "January 2024",
    "total_working_days": 22,
    "present": 20,
    "absent": 2,
    "late": 3,
    "leaves_taken": 1,
    "percentage": 90.9
  }
}
```

---

### 10.4 Get My Attendance (Staff)

**Endpoint:** `GET /api/hr/my-attendance`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Query Parameters:**

```
?month=1
&year=2024
```

**Response:** `200 OK` (Same structure as above)

---

### 10.5 Apply for Leave (Staff)

**Endpoint:** `POST /api/hr/leave/apply`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Request Body:**

```json
{
  "leave_type": "casual",
  "start_date": "2024-01-25",
  "end_date": "2024-01-26",
  "reason": "Personal work",
  "half_day": false
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Leave application submitted",
  "data": {
    "leave_id": "uuid",
    "status": "pending"
  }
}
```

---

### 10.6 Get Pending Leave Approvals

**Endpoint:** `GET /api/hr/leave/approvals`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:leaves:manage`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee_name": "Dr. Kumar",
      "department": "Computer Science",
      "leave_type": "casual",
      "start_date": "2024-01-25",
      "end_date": "2024-01-26",
      "days": 2,
      "reason": "Personal work",
      "status": "pending",
      "applied_at": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

### 10.7 Get My Leave Requests

**Endpoint:** `GET /api/hr/leave/my-requests`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Response:** `200 OK`

---

### 10.8 Update Leave Status

**Endpoint:** `PUT /api/hr/leave/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:leaves:manage`

**Request Body:**

```json
{
  "status": "approved",
  "remarks": "Approved"
}
```

**Response:** `200 OK`

---

### 10.9 Get Leave Balances

**Endpoint:** `GET /api/hr/leave/balances`  
**Authentication:** Required (`authenticate`)  
**Permission:** None (own) or `hr:leaves:view` (all)

**Query Parameters:**

```
?user_id=uuid  // Optional, for HR to view others
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "name": "Dr. Kumar",
    "leave_balances": [
      {
        "leave_type": "casual",
        "total": 12,
        "used": 3,
        "remaining": 9
      },
      {
        "leave_type": "sick",
        "total": 10,
        "used": 2,
        "remaining": 8
      },
      {
        "leave_type": "earned",
        "total": 15,
        "used": 0,
        "remaining": 15
      }
    ]
  }
}
```

---

### 10.10 Get Salary Structure

**Endpoint:** `GET /api/hr/payroll/structure/:user_id`  
**Authentication:** Required (`authenticate`)  
**Permission:** None (own) or `hr:payroll:view` (others)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "name": "Dr. Kumar",
    "designation": "Associate Professor",
    "salary_grade": "Grade-A",
    "basic_salary": 50000,
    "allowances": [
      {
        "component": "HRA",
        "amount": 15000,
        "percentage": 30
      },
      {
        "component": "DA",
        "amount": 10000,
        "percentage": 20
      },
      {
        "component": "Special Allowance",
        "amount": 5000,
        "is_fixed": true
      }
    ],
    "deductions": [
      {
        "component": "PF",
        "amount": 6000,
        "percentage": 12
      },
      {
        "component": "Professional Tax",
        "amount": 200,
        "is_fixed": true
      }
    ],
    "gross_salary": 80000,
    "total_deductions": 6200,
    "net_salary": 73800
  }
}
```

---

### 10.11 Upsert Salary Structure

**Endpoint:** `POST /api/hr/payroll/structure`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:staff:manage`

**Request Body:**

```json
{
  "user_id": "uuid",
  "salary_grade_id": "uuid",
  "basic_salary": 50000,
  "allowances": [
    {
      "component": "HRA",
      "calculation_type": "percentage",
      "value": 30
    }
  ],
  "deductions": [
    {
      "component": "PF",
      "calculation_type": "percentage",
      "value": 12
    }
  ]
}
```

**Response:** `200 OK`

---

### 10.12 Generate Payslip

**Endpoint:** `POST /api/hr/payroll/generate`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:payroll:manage`

**Request Body:**

```json
{
  "user_id": "uuid",
  "month": 1,
  "year": 2024,
  "working_days": 22,
  "present_days": 20,
  "additional_allowances": [
    {
      "component": "Bonus",
      "amount": 5000
    }
  ],
  "additional_deductions": [
    {
      "component": "Advance Deduction",
      "amount": 2000
    }
  ]
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Payslip generated successfully",
  "data": {
    "payslip_id": "uuid",
    "month": "January 2024",
    "gross_salary": 80000,
    "net_salary": 71800
  }
}
```

---

### 10.13 Get Bulk Payroll Preview

**Endpoint:** `GET /api/hr/payroll/preview-bulk`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:payroll:manage`

**Query Parameters:**

```
?month=1
&year=2024
&department_id=uuid
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "month": "January 2024",
    "total_employees": 50,
    "total_gross": 4000000,
    "total_deductions": 310000,
    "total_net": 3690000,
    "preview": [
      {
        "user_id": "uuid",
        "name": "Dr. Kumar",
        "designation": "Associate Professor",
        "gross_salary": 80000,
        "deductions": 6200,
        "net_salary": 73800,
        "working_days": 22,
        "present_days": 20
      }
    ]
  }
}
```

---

### 10.14 Bulk Generate Payslips

**Endpoint:** `POST /api/hr/payroll/bulk-generate`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:payroll:manage`

**Request Body:**

```json
{
  "month": 1,
  "year": 2024,
  "department_id": "uuid",
  "user_ids": ["uuid1", "uuid2"]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Payslips generated successfully",
  "data": {
    "generated": 50,
    "failed": 0
  }
}
```

---

### 10.15 Get Payslips

**Endpoint:** `GET /api/hr/payroll/payslips`  
**Authentication:** Required (`authenticate`)  
**Permission:** None (own) or `hr:payroll:view` (all)

**Query Parameters:**

```
?user_id=uuid  // Optional
&month=1
&year=2024
&status=published
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee_name": "Dr. Kumar",
      "month": "January 2024",
      "gross_salary": 80000,
      "net_salary": 73800,
      "status": "published",
      "payment_status": "paid",
      "generated_at": "2024-01-31T10:00:00Z"
    }
  ]
}
```

---

### 10.16 Download Payslip PDF

**Endpoint:** `GET /api/hr/payroll/payslip/:id/download`  
**Authentication:** Required (`authenticate`)  
**Permission:** None (own payslip) or `hr:payroll:view`

**Response:** `200 OK` (PDF file)

---

### 10.17 Get Payroll Statistics

**Endpoint:** `GET /api/hr/payroll/stats`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:payroll:view`

**Query Parameters:**

```
?month=1
&year=2024
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "month": "January 2024",
    "total_employees": 50,
    "payslips_generated": 50,
    "payslips_published": 45,
    "payslips_paid": 40,
    "total_gross": 4000000,
    "total_net": 3690000,
    "by_department": [
      {
        "department": "Computer Science",
        "employees": 15,
        "total_net": 1200000
      }
    ]
  }
}
```

---

### 10.18 Export Bank Transfer File

**Endpoint:** `GET /api/hr/payroll/export-bank-file`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:payroll:manage`

**Query Parameters:**

```
?month=1
&year=2024
```

**Description:** Export bank transfer file for salary payment.

**Response:** `200 OK` (CSV/Excel file)

---

### 10.19 Get Publish Stats

**Endpoint:** `GET /api/hr/payroll/publish/stats`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:payroll:publish`

**Query Parameters:**

```
?month=1
&year=2024
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "month": "January 2024",
    "total_payslips": 50,
    "ready_to_publish": 50,
    "already_published": 0
  }
}
```

---

### 10.20 Publish Payslips

**Endpoint:** `POST /api/hr/payroll/publish-payout`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:payroll:publish`

**Request Body:**

```json
{
  "month": 1,
  "year": 2024,
  "payslip_ids": ["uuid1", "uuid2"]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Payslips published successfully",
  "data": {
    "published": 50
  }
}
```

---

### 10.21 Confirm Payment

**Endpoint:** `POST /api/hr/payroll/confirm-payout`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:payroll:publish`

**Request Body:**

```json
{
  "payslip_ids": ["uuid1", "uuid2"],
  "payment_date": "2024-02-01",
  "payment_mode": "bank_transfer",
  "transaction_reference": "TXN123456"
}
```

**Response:** `200 OK`

---

### 10.22 Get Salary Grades

**Endpoint:** `GET /api/hr/payroll/grades`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:payroll:manage`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Grade-A",
      "min_salary": 40000,
      "max_salary": 60000,
      "description": "Associate Professor level"
    }
  ]
}
```

---

### 10.23 Upsert Salary Grade

**Endpoint:** `POST /api/hr/payroll/grades`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:payroll:manage`

**Request Body:**

```json
{
  "name": "Grade-B",
  "min_salary": 60000,
  "max_salary": 80000,
  "description": "Professor level"
}
```

**Response:** `201 Created`

---

### 10.24 Get HR Dashboard Stats

**Endpoint:** `GET /api/hr/dashboard/stats`  
**Authentication:** Required (`authenticate`)  
**Permission:** `hr:staff:view`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "total_staff": 50,
    "present_today": 48,
    "on_leave": 2,
    "pending_leave_approvals": 5,
    "payroll_pending": 10,
    "new_joinings_this_month": 2
  }
}
```

---

### 10.25 Get HOD Dashboard Stats

**Endpoint:** `GET /api/hr/hod/dashboard-stats`  
**Authentication:** Required (`authenticate`)  
**Permission:** None (HOD role)

**Description:** Get department-specific stats for HOD.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "department": "Computer Science",
    "total_faculty": 15,
    "present_today": 14,
    "on_leave": 1,
    "pending_approvals": 2
  }
}
```

---

## 11. Library

**Base Path:** `/api/library`  
**Route File:** `/backend/src/routes/library.js`  
**Controller:** `/backend/src/controllers/libraryController.js`

### 11.1 Get Books

**Endpoint:** `GET /api/library/books`  
**Authentication:** Required (`authenticate`)  
**Permission:** `library:books:view`

**Query Parameters:**

```
?search=data structures
&category=textbook
&author=cormen
&available=true
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Introduction to Algorithms",
      "author": "Cormen, Leiserson, Rivest, Stein",
      "isbn": "978-0262033848",
      "category": "textbook",
      "publisher": "MIT Press",
      "edition": "3rd",
      "total_copies": 10,
      "available_copies": 7,
      "issued_copies": 3
    }
  ]
}
```

---

### 11.2 Add Book

**Endpoint:** `POST /api/library/books`  
**Authentication:** Required (`authenticate`)  
**Permission:** `library:books:manage`

**Request Body:**

```json
{
  "title": "Design Patterns",
  "author": "Gang of Four",
  "isbn": "978-0201633610",
  "category": "textbook",
  "publisher": "Addison-Wesley",
  "edition": "1st",
  "total_copies": 5,
  "rack_number": "CS-A-12"
}
```

**Response:** `201 Created`

---

### 11.3 Get My Books (Student/Staff)

**Endpoint:** `GET /api/library/my-books`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Description:** Get books currently issued to logged-in user.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "issue_id": "uuid",
      "book_title": "Introduction to Algorithms",
      "author": "Cormen et al.",
      "isbn": "978-0262033848",
      "issued_date": "2024-01-10",
      "due_date": "2024-02-10",
      "days_remaining": 5,
      "fine": 0,
      "status": "issued"
    }
  ]
}
```

---

### 11.4 Issue Book

**Endpoint:** `POST /api/library/issue`  
**Authentication:** Required (`authenticate`)  
**Permission:** `library:issues:manage`

**Request Body:**

```json
{
  "user_id": "uuid",
  "book_id": "uuid",
  "due_date": "2024-02-10"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Book issued successfully",
  "data": {
    "issue_id": "uuid",
    "book_title": "Introduction to Algorithms",
    "due_date": "2024-02-10"
  }
}
```

---

### 11.5 Return Book

**Endpoint:** `POST /api/library/return`  
**Authentication:** Required (`authenticate`)  
**Permission:** `library:issues:manage`

**Request Body:**

```json
{
  "issue_id": "uuid",
  "return_date": "2024-02-08",
  "condition": "good",
  "remarks": "Returned in good condition"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Book returned successfully",
  "data": {
    "fine": 0,
    "days_overdue": 0
  }
}
```

---

## 12. Timetable

**Base Path:** `/api/timetable`  
**Route File:** `/backend/src/routes/timetable.js`  
**Controller:** `/backend/src/controllers/timetableController.js`

### 12.1 Initialize Timetable

**Endpoint:** `POST /api/timetable/init`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:timetable:manage`

**Request Body:**

```json
{
  "academic_year": "2023-24",
  "semester": 3,
  "department_id": "uuid",
  "year": 2,
  "section": "A"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Timetable initialized",
  "data": {
    "timetable_id": "uuid"
  }
}
```

---

### 12.2 Add Slot

**Endpoint:** `POST /api/timetable/slots`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:timetable:manage`

**Request Body:**

```json
{
  "timetable_id": "uuid",
  "day": "monday",
  "start_time": "09:00",
  "end_time": "10:00",
  "course_id": "uuid",
  "faculty_id": "uuid",
  "room_id": "uuid",
  "slot_type": "lecture"
}
```

**Response:** `201 Created`

---

### 12.3 Get Timetable by ID

**Endpoint:** `GET /api/timetable/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:timetable:view`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "academic_year": "2023-24",
    "semester": 3,
    "department": "Computer Science",
    "year": 2,
    "section": "A",
    "slots": [
      {
        "day": "monday",
        "start_time": "09:00",
        "end_time": "10:00",
        "course_code": "CS301",
        "course_name": "Data Structures",
        "faculty_name": "Dr. Kumar",
        "room": "Lab-101",
        "slot_type": "lecture"
      }
    ]
  }
}
```

---

### 12.4 Get My Timetable

**Endpoint:** `GET /api/timetable/my/view`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Description:** Get timetable for logged-in student/faculty.

**Response:** `200 OK` (Same structure as above)

---

### 12.5 Find Timetable by Criteria

**Endpoint:** `GET /api/timetable/find`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:timetable:manage`

**Query Parameters:**

```
?department_id=uuid
&year=2
&section=A
&semester=3
```

**Response:** `200 OK`

---

## 13. Proctoring

**Base Path:** `/api/proctor`  
**Route File:** `/backend/src/routes/proctor.js`  
**Controller:** `/backend/src/controllers/proctorController.js`

### 13.1 Assign Proctors

**Endpoint:** `POST /api/proctor/assign`  
**Authentication:** Required (`authenticate`)  
**Permission:** `proctoring:manage`

**Request Body:**

```json
{
  "assignments": [
    {
      "faculty_id": "uuid1",
      "student_ids": ["student-uuid1", "student-uuid2"]
    }
  ]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Proctors assigned successfully",
  "data": {
    "total_assignments": 2
  }
}
```

---

### 13.2 Auto-Assign Proctors

**Endpoint:** `POST /api/proctor/auto-assign`  
**Authentication:** Required (`authenticate`)  
**Permission:** `proctoring:manage`

**Request Body:**

```json
{
  "department_id": "uuid",
  "year": 2,
  "students_per_proctor": 15
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Auto-assignment completed",
  "data": {
    "faculty_assigned": 4,
    "students_assigned": 60
  }
}
```

---

### 13.3 Get My Students (Proctor)

**Endpoint:** `GET /api/proctor/my-students`  
**Authentication:** Required (`authenticate`)  
**Permission:** `proctoring:mentor`

**Description:** Get list of students assigned to logged-in faculty as proctor.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "student_id": "uuid",
      "name": "Ravi Kumar",
      "roll_number": "21CS001",
      "year": 2,
      "section": "A",
      "phone": "+91 9876543210",
      "email": "ravi@example.com",
      "attendance_percentage": 85.5,
      "cgpa": 8.3,
      "last_session": "2024-01-15"
    }
  ]
}
```

---

### 13.4 Add Feedback

**Endpoint:** `POST /api/proctor/feedback`  
**Authentication:** Required (`authenticate`)  
**Permission:** `proctoring:mentor`

**Request Body:**

```json
{
  "student_id": "uuid",
  "feedback": "Student is performing well academically but needs to improve attendance.",
  "rating": 4,
  "category": "academic"
}
```

**Response:** `201 Created`

---

### 13.5 Create Session

**Endpoint:** `POST /api/proctor/sessions`  
**Authentication:** Required (`authenticate`)  
**Permission:** `proctoring:mentor`

**Request Body:**

```json
{
  "student_id": "uuid",
  "session_date": "2024-01-20",
  "duration": 30,
  "topics_discussed": "Academic performance, career guidance",
  "action_items": "Improve attendance, prepare for placements",
  "next_session_date": "2024-02-20"
}
```

**Response:** `201 Created`

---

### 13.6 Get My Proctor (Student)

**Endpoint:** `GET /api/proctor/my-proctor`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Description:** Get proctor details for logged-in student.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "proctor_id": "uuid",
    "name": "Dr. Kumar",
    "designation": "Associate Professor",
    "department": "Computer Science",
    "email": "kumar@college.edu",
    "phone": "+91 9876543210",
    "office_room": "Faculty-201",
    "available_hours": "Mon-Fri 2:00 PM - 4:00 PM"
  }
}
```

---

## 14. Promotion

**Base Path:** `/api/promotion`  
**Route File:** `/backend/src/routes/promotion.js`  
**Controller:** `/backend/src/controllers/promotionController.js`

### 14.1 Upsert Promotion Criteria

**Endpoint:** `POST /api/promotion/criteria`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Request Body:**

```json
{
  "program_id": "uuid",
  "from_year": 2,
  "to_year": 3,
  "min_cgpa": 5.0,
  "min_attendance": 75,
  "max_backlogs": 5,
  "academic_year": "2023-24"
}
```

**Response:** `200 OK`

---

### 14.2 Evaluate Promotion

**Endpoint:** `POST /api/promotion/evaluate`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Request Body:**

```json
{
  "program_id": "uuid",
  "current_year": 2,
  "academic_year": "2023-24"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "total_students": 60,
    "eligible": 55,
    "not_eligible": 5,
    "students": [
      {
        "student_id": "uuid",
        "name": "Ravi Kumar",
        "cgpa": 8.3,
        "attendance": 85.5,
        "backlogs": 0,
        "eligible": true,
        "remarks": "Eligible for promotion"
      }
    ]
  }
}
```

---

### 14.3 Process Bulk Promotion

**Endpoint:** `POST /api/promotion/process`  
**Authentication:** Required (`authenticate`)  
**Permission:** `academics:courses:manage`

**Request Body:**

```json
{
  "student_ids": ["uuid1", "uuid2"],
  "from_year": 2,
  "to_year": 3,
  "academic_year": "2024-25"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Promotion processed successfully",
  "data": {
    "promoted": 55,
    "failed": 5
  }
}
```

---

### 14.4 Apply for Graduation (Student)

**Endpoint:** `POST /api/promotion/graduation/apply`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Request Body:**

```json
{
  "graduation_year": 2024,
  "convocation_preference": "attend"
}
```

**Response:** `201 Created`

---

## 15. Infrastructure

**Base Path:** `/api/infrastructure`  
**Route File:** `/backend/src/routes/infrastructure.js`  
**Controller:** `/backend/src/controllers/infrastructureController.js`

### 15.1 Get All Blocks

**Endpoint:** `GET /api/infrastructure/blocks`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Main Block",
      "code": "MB",
      "floors": 4,
      "total_rooms": 40,
      "description": "Main academic block"
    }
  ]
}
```

---

### 15.2 Create Block

**Endpoint:** `POST /api/infrastructure/blocks`  
**Authentication:** Required (`authenticate`)  
**Permission:** None (should have permission check)

**Request Body:**

```json
{
  "name": "Lab Block",
  "code": "LB",
  "floors": 3,
  "description": "Computer and Engineering labs"
}
```

**Response:** `201 Created`

---

### 15.3 Get Block Details

**Endpoint:** `GET /api/infrastructure/blocks/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Main Block",
    "code": "MB",
    "floors": 4,
    "rooms": [
      {
        "id": "uuid",
        "room_number": "101",
        "floor": 1,
        "capacity": 60,
        "room_type": "classroom",
        "facilities": ["projector", "ac", "whiteboard"]
      }
    ]
  }
}
```

---

### 15.4 Add Room

**Endpoint:** `POST /api/infrastructure/blocks/:id/rooms`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Request Body:**

```json
{
  "room_number": "201",
  "floor": 2,
  "capacity": 60,
  "room_type": "classroom",
  "facilities": ["projector", "ac"]
}
```

**Response:** `201 Created`

---

### 15.5 Generate Rooms

**Endpoint:** `POST /api/infrastructure/blocks/:id/generate`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Description:** Auto-generate multiple rooms for a block.

**Request Body:**

```json
{
  "floor": 2,
  "start_number": 201,
  "end_number": 210,
  "capacity": 60,
  "room_type": "classroom"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Rooms generated successfully",
  "data": {
    "created": 10
  }
}
```

---

### 15.6 Get All Rooms

**Endpoint:** `GET /api/infrastructure/rooms`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Query Parameters:**

```
?block_id=uuid
&room_type=classroom
&available=true
```

**Response:** `200 OK`

---

### 15.7 Update Room

**Endpoint:** `PUT /api/infrastructure/rooms/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Response:** `200 OK`

---

### 15.8 Delete Room

**Endpoint:** `DELETE /api/infrastructure/rooms/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Response:** `200 OK`

---

## 16. Regulations

**Base Path:** `/api/regulations`  
**Route File:** `/backend/src/routes/regulations.js`  
**Controller:** `/backend/src/controllers/regulationController.js`

### 16.1 Get All Regulations

**Endpoint:** `GET /api/regulations`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "R20",
      "description": "Regulation 2020",
      "academic_year": "2020-21",
      "applicable_from": "2020-07-01",
      "is_active": true,
      "programs": ["B.Tech CSE", "B.Tech ECE"]
    }
  ]
}
```

---

### 16.2 Get Regulation by ID

**Endpoint:** `GET /api/regulations/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "R20",
    "description": "Regulation 2020",
    "academic_year": "2020-21",
    "grade_scale": [
      { "grade": "O", "min": 90, "max": 100, "points": 10 },
      { "grade": "A+", "min": 80, "max": 89, "points": 9 },
      { "grade": "A", "min": 70, "max": 79, "points": 8 }
    ],
    "passing_marks": 40,
    "max_backlogs_allowed": 5
  }
}
```

---

### 16.3 Create Regulation

**Endpoint:** `POST /api/regulations`  
**Authentication:** Required (`authenticate`)  
**Permission:** Roles: `admin`, `super_admin`, `academics_admin`

**Request Body:**

```json
{
  "name": "R24",
  "description": "Regulation 2024",
  "academic_year": "2024-25",
  "applicable_from": "2024-07-01",
  "grade_scale": [{ "grade": "O", "min": 90, "max": 100, "points": 10 }],
  "passing_marks": 40
}
```

**Response:** `201 Created`

---

### 16.4 Update Regulation

**Endpoint:** `PUT /api/regulations/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** Roles: `admin`, `super_admin`, `academics_admin`

**Response:** `200 OK`

---

### 16.5 Delete Regulation

**Endpoint:** `DELETE /api/regulations/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** Roles: `admin`, `super_admin`, `academics_admin`

**Response:** `200 OK`

---

### 16.6 Get Exam Structure

**Endpoint:** `GET /api/regulations/:id/exam-structure`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "regulation_id": "uuid",
    "exam_structure": {
      "mid_term_1": { "weightage": 15, "max_marks": 50 },
      "mid_term_2": { "weightage": 15, "max_marks": 50 },
      "end_semester": { "weightage": 70, "max_marks": 100 }
    }
  }
}
```

---

### 16.7 Update Exam Structure

**Endpoint:** `PUT /api/regulations/:id/exam-structure`  
**Authentication:** Required (`authenticate`)  
**Permission:** Roles: `admin`, `super_admin`, `academics_admin`

**Request Body:**

```json
{
  "exam_structure": {
    "mid_term_1": { "weightage": 20, "max_marks": 50 },
    "mid_term_2": { "weightage": 20, "max_marks": 50 },
    "end_semester": { "weightage": 60, "max_marks": 100 }
  }
}
```

**Response:** `200 OK`

---

## 17. Roles & Permissions

**Base Path:** `/api/roles`  
**Route File:** `/backend/src/routes/role.js`  
**Controller:** `/backend/src/controllers/roleController.js`

### 17.1 Get All Roles

**Endpoint:** `GET /api/roles`  
**Authentication:** Required (`authenticate`)  
**Permission:** `settings:roles:manage` or `settings:roles:view`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Faculty",
      "slug": "faculty",
      "description": "Teaching faculty members",
      "is_system": true,
      "permissions_count": 15
    }
  ]
}
```

---

### 17.2 Get All Permissions

**Endpoint:** `GET /api/roles/permissions`  
**Authentication:** Required (`authenticate`)  
**Permission:** `settings:roles:manage` or `settings:roles:view`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "View Dashboard",
      "slug": "dashboard:view",
      "module": "dashboard"
    },
    {
      "id": "uuid",
      "name": "Manage Students",
      "slug": "students:manage",
      "module": "students"
    }
  ]
}
```

---

### 17.3 Create Role

**Endpoint:** `POST /api/roles`  
**Authentication:** Required (`authenticate`)  
**Permission:** `settings:roles:manage`

**Request Body:**

```json
{
  "name": "Lab Assistant",
  "slug": "lab_assistant",
  "description": "Laboratory assistant staff",
  "permission_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `201 Created`

---

### 17.4 Update Role

**Endpoint:** `PUT /api/roles/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** `settings:roles:manage`

**Request Body:**

```json
{
  "name": "Senior Lab Assistant",
  "description": "Senior laboratory assistant",
  "permission_ids": ["uuid1", "uuid2", "uuid3", "uuid4"]
}
```

**Response:** `200 OK`

---

## 18. Settings

**Base Path:** `/api/settings`  
**Route File:** `/backend/src/routes/settingRoutes.js`  
**Controller:** `/backend/src/controllers/settingController.js`

### 18.1 Get Settings

**Endpoint:** `GET /api/settings`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "university_name": "ABC College of Engineering",
    "university_code": "ABC001",
    "address": "Kakinada, Andhra Pradesh",
    "phone": "+91 1234567890",
    "email": "info@abc.edu",
    "website": "https://abc.edu",
    "logo_url": "/uploads/logo.png",
    "academic_year": "2023-24",
    "current_semester": 3
  }
}
```

---

### 18.2 Update Settings

**Endpoint:** `POST /api/settings`  
**Authentication:** Required (`authenticate`)  
**Permission:** Roles: `admin`, `super_admin`, `hr_admin`, `administrator`

**Request Body:**

```json
{
  "university_name": "ABC College of Engineering & Technology",
  "current_semester": 4
}
```

**Response:** `200 OK`

---

## 19. Biometric

**Base Path:** `/api/biometric`  
**Route File:** `/backend/src/routes/biometricRoutes.js`  
**Controller:** `/backend/src/controllers/biometricController.js`

### 19.1 Sync Biometric Data

**Endpoint:** `POST /api/biometric/sync`  
**Authentication:** None (Public - should use API key in production)  
**Permission:** None

**Description:** Endpoint for biometric devices to sync attendance data.

**Request Body:**

```json
{
  "device_id": "DEVICE001",
  "records": [
    {
      "device_user_id": "123",
      "timestamp": "2024-01-20T09:05:00Z",
      "punch_type": "in"
    },
    {
      "device_user_id": "124",
      "timestamp": "2024-01-20T09:10:00Z",
      "punch_type": "in"
    }
  ]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Biometric data synced",
  "data": {
    "processed": 2,
    "failed": 0
  }
}
```

---

### 19.2 Map User to Device

**Endpoint:** `POST /api/biometric/map-user`  
**Authentication:** Required (`authenticate`)  
**Permission:** Roles: `admin`, `hr_admin`

**Description:** Map UniPilot user to biometric device user ID.

**Request Body:**

```json
{
  "user_id": "uuid",
  "device_user_id": "123",
  "device_id": "DEVICE001"
}
```

**Response:** `200 OK`

---

## 20. Holidays

**Base Path:** `/api/holidays`  
**Route File:** `/backend/src/routes/holidayRoutes.js`  
**Controller:** `/backend/src/controllers/holidayController.js`

### 20.1 Get Holidays

**Endpoint:** `GET /api/holidays`  
**Authentication:** Required (`authenticate`)  
**Permission:** None

**Query Parameters:**

```
?year=2024
&month=1
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Republic Day",
      "date": "2024-01-26",
      "type": "national",
      "description": "National holiday"
    },
    {
      "id": "uuid",
      "name": "Sankranti",
      "date": "2024-01-15",
      "type": "festival",
      "description": "Harvest festival"
    }
  ]
}
```

---

### 20.2 Create Holiday

**Endpoint:** `POST /api/holidays`  
**Authentication:** Required (`authenticate`)  
**Permission:** Roles: `admin`, `hr_admin`

**Request Body:**

```json
{
  "name": "Ugadi",
  "date": "2024-04-09",
  "type": "festival",
  "description": "Telugu New Year"
}
```

**Response:** `201 Created`

---

### 20.3 Update Holiday

**Endpoint:** `PUT /api/holidays/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** Roles: `admin`, `hr_admin`

**Request Body:**

```json
{
  "name": "Ugadi (Telugu New Year)",
  "description": "Telugu and Kannada New Year"
}
```

**Response:** `200 OK`

---

### 20.4 Delete Holiday

**Endpoint:** `DELETE /api/holidays/:id`  
**Authentication:** Required (`authenticate`)  
**Permission:** Roles: `admin`, `hr_admin`

**Response:** `200 OK`

---

## Summary

### Total Endpoints: 150+

**By Module:**

- Authentication: 7 endpoints
- User Management: 11 endpoints
- Departments: 5 endpoints
- Programs: 5 endpoints
- Courses: 5 endpoints
- Admissions: 11 endpoints
- Attendance: 7 endpoints
- Examinations: 15 endpoints
- Fee Management: 12 endpoints
- HR & Payroll: 25 endpoints
- Library: 5 endpoints
- Timetable: 5 endpoints
- Proctoring: 6 endpoints
- Promotion: 4 endpoints
- Infrastructure: 8 endpoints
- Regulations: 7 endpoints
- Roles & Permissions: 4 endpoints
- Settings: 2 endpoints
- Biometric: 2 endpoints
- Holidays: 4 endpoints

---

## Quick Reference: Common Patterns

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

### Pagination

```
?page=1&limit=50
```

### Filtering

```
?role=student&department=CS&year=2024
```

### Date Format

```
YYYY-MM-DD (e.g., 2024-01-20)
```

### Time Format

```
HH:MM (24-hour format, e.g., 09:00)
```

---

**End of API Documentation**

For support or questions, contact: support@unipilot.com
