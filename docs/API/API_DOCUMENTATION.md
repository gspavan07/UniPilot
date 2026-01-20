# UniPilot API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api` (Development)  
**Production URL:** `https://your-domain.com/api`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Authorization & Permissions](#authorization--permissions)
4. [API Modules](#api-modules)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Overview

UniPilot is a comprehensive University Management System designed for Indian universities and colleges. This API provides endpoints for managing all aspects of university operations including admissions, academics, examinations, HR, payroll, and more.

### Key Features

- 🔐 **JWT-based Authentication** - Secure token-based authentication
- 🛡️ **Role-Based Access Control (RBAC)** - Granular permission system
- 📊 **Multi-tenant Ready** - Self-hosted deployment model
- 🇮🇳 **India-Focused** - Tailored for Indian education system
- 📱 **Mobile Support** - RESTful APIs for web and mobile apps

### Architecture

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Cache:** Redis
- **Storage:** AWS S3 / Local Storage
- **Authentication:** JWT (JSON Web Tokens)

### Base Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Operation successful"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    /* additional error details */
  }
}
```

---

## Authentication

UniPilot uses **JWT (JSON Web Tokens)** for authentication. All protected endpoints require a valid JWT token in the Authorization header.

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database

    Client->>API: POST /api/auth/login
    API->>Database: Validate credentials
    Database-->>API: User data
    API-->>Client: JWT Token + User Info
    Client->>API: Request with Authorization header
    API->>API: Verify JWT
    API-->>Client: Protected resource
```

### Middleware: `authenticate`

**Location:** `/backend/src/middleware/auth.js`

**Purpose:** Verifies JWT token and attaches user information to the request object.

**Usage:**

```javascript
const { authenticate } = require("../middleware/auth");
router.get("/protected-route", authenticate, controller);
```

**How it works:**

1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature and expiration
3. Attaches decoded user data to `req.user`
4. Returns 401 if token is invalid or missing

**Request Header:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Decoded Token Structure:**

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "student",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Authorization & Permissions

UniPilot implements a sophisticated **Role-Based Access Control (RBAC)** system with granular permissions.

### Middleware Overview

#### 1. `authorize(...roles)`

**Location:** `/backend/src/middleware/auth.js`

**Purpose:** Checks if the authenticated user has one of the specified roles.

**Usage:**

```javascript
const { authenticate, authorize } = require("../middleware/auth");
router.post(
  "/admin-only",
  authenticate,
  authorize("admin", "super_admin"),
  controller,
);
```

**Parameters:**

- `...roles` - Variable number of role slugs (e.g., 'admin', 'faculty', 'student')

**Behavior:**

- Returns 403 if user's role doesn't match any allowed roles
- Bypasses check for super_admin/admin roles

---

#### 2. `checkPermission(requiredPermission)`

**Location:** `/backend/src/middleware/auth.js`

**Purpose:** Checks if the authenticated user has specific permission(s).

**Usage:**

```javascript
const { authenticate, checkPermission } = require("../middleware/auth");

// Single permission
router.get(
  "/students",
  authenticate,
  checkPermission("students:view"),
  controller,
);

// Multiple permissions (OR logic)
router.get(
  "/users",
  authenticate,
  checkPermission(["users:view", "students:view"]),
  controller,
);
```

**Parameters:**

- `requiredPermission` - String or Array of permission slugs

**Behavior:**

1. Fetches user with role and permissions from database
2. **Auto-approves** for roles: `administrator`, `admin`, `super_admin`
3. Checks if user has at least one of the required permissions
4. Returns 403 if permission is missing

---

### Permission Slugs

All available permissions in the system:

| Module           | Permission Slug               | Description                         |
| ---------------- | ----------------------------- | ----------------------------------- |
| **Dashboard**    |
| Dashboard        | `dashboard:view`              | View dashboard                      |
| **HR & Staff**   |
| Staff            | `hr:staff:view`               | View staff members                  |
| Staff            | `hr:staff:manage`             | Create/edit/delete staff            |
| Payroll          | `hr:payroll:view`             | View payroll data                   |
| Payroll          | `hr:payroll:manage`           | Manage salary structures            |
| Payroll          | `hr:payroll:publish`          | Publish and confirm payouts         |
| Leaves           | `hr:leaves:view`              | View leave requests                 |
| Leaves           | `hr:leaves:manage`            | Approve/reject leaves               |
| Attendance       | `hr:attendance:view`          | View staff attendance               |
| Attendance       | `hr:attendance:manage`        | Mark staff attendance               |
| Onboarding       | `hr:onboarding:access`        | Access onboarding module            |
| **Admissions**   |
| Admissions       | `admissions:view`             | View admission data                 |
| Admissions       | `admissions:manage`           | Manage admissions                   |
| Admissions       | `admissions:config`           | Configure admission settings        |
| **Academics**    |
| Courses          | `academics:courses:view`      | View courses/departments/programs   |
| Courses          | `academics:courses:manage`    | Manage courses/departments/programs |
| Timetable        | `academics:timetable:view`    | View timetables                     |
| Timetable        | `academics:timetable:manage`  | Create/edit timetables              |
| Attendance       | `academics:attendance:view`   | View student attendance             |
| Attendance       | `academics:attendance:manage` | Mark student attendance             |
| Sections         | `academics:sections:manage`   | Manage student sections             |
| Promotion        | `academics:promotion:manage`  | Manage student promotions           |
| **Examinations** |
| Exams            | `exams:view`                  | View exam cycles and schedules      |
| Exams            | `exams:manage`                | Create/edit exam cycles             |
| Results          | `exams:results:view`          | View exam results                   |
| Results          | `exams:results:entry`         | Enter and moderate marks            |
| Results          | `exams:results:publish`       | Publish results                     |
| **Finance**      |
| Fees             | `finance:fees:view`           | View fee structures                 |
| Fees             | `finance:fees:manage`         | Collect payments                    |
| Fees             | `finance:fees:admin`          | Configure fee structures            |
| Fees             | `finance:fees:oversight`      | View all fee data                   |
| **Library**      |
| Books            | `library:books:view`          | View library catalog                |
| Books            | `library:books:manage`        | Add/edit books                      |
| Issues           | `library:issues:manage`       | Issue/return books                  |
| **Users**        |
| Users            | `users:view`                  | View all users                      |
| Users            | `users:manage`                | Create/edit/delete users            |
| Students         | `students:view`               | View students only                  |
| Students         | `students:manage`             | Manage students only                |
| **Proctoring**   |
| Proctoring       | `proctoring:view`             | View proctor assignments            |
| Proctoring       | `proctoring:manage`           | Assign proctors                     |
| Proctoring       | `proctoring:mentor`           | Mentor assigned students            |
| **Settings**     |
| Settings         | `settings:view`               | View system settings                |
| Settings         | `settings:manage`             | Update system settings              |
| Roles            | `settings:roles:view`         | View roles                          |
| Roles            | `settings:roles:manage`       | Create/edit roles                   |

---

### Default Role Permissions

| Role            | Permissions                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **super_admin** | ALL permissions (bypasses all checks)                                                                                                                  |
| **admin**       | ALL permissions (bypasses all checks)                                                                                                                  |
| **hr_admin**    | All HR permissions + dashboard + users:view                                                                                                            |
| **hr**          | All HR permissions + dashboard + users:view                                                                                                            |
| **faculty**     | dashboard:view, academics (view/manage attendance), exams:results:entry, library:books:view                                                            |
| **hod**         | Same as faculty + department-specific management                                                                                                       |
| **student**     | dashboard:view, academics:courses:view, academics:timetable:view, academics:attendance:view, exams:results:view, finance:fees:view, library:books:view |

---

## API Modules

The API is organized into the following modules:

1. [Authentication](#1-authentication-module)
2. [User Management](#2-user-management)
3. [Academic Management](#3-academic-management)
4. [Admissions](#4-admissions)
5. [Attendance](#5-attendance)
6. [Examinations](#6-examinations)
7. [Fee Management](#7-fee-management)
8. [HR & Payroll](#8-hr--payroll)
9. [Library](#9-library)
10. [Timetable](#10-timetable)
11. [Proctoring](#11-proctoring)
12. [Promotion](#12-promotion)
13. [Infrastructure](#13-infrastructure)
14. [Regulations](#14-regulations)
15. [Roles & Permissions](#15-roles--permissions)
16. [Settings](#16-settings)
17. [Biometric](#17-biometric)
18. [Holidays](#18-holidays)

---

## Error Handling

### HTTP Status Codes

| Code | Meaning               | Usage                               |
| ---- | --------------------- | ----------------------------------- |
| 200  | OK                    | Successful GET, PUT, PATCH requests |
| 201  | Created               | Successful POST request             |
| 204  | No Content            | Successful DELETE request           |
| 400  | Bad Request           | Invalid request data                |
| 401  | Unauthorized          | Missing or invalid authentication   |
| 403  | Forbidden             | Insufficient permissions            |
| 404  | Not Found             | Resource not found                  |
| 409  | Conflict              | Duplicate resource                  |
| 422  | Unprocessable Entity  | Validation errors                   |
| 429  | Too Many Requests     | Rate limit exceeded                 |
| 500  | Internal Server Error | Server error                        |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "email",
    "message": "Email already exists"
  }
}
```

---

## Rate Limiting

**Middleware:** `express-rate-limit`  
**Location:** `/backend/src/app.js`

**Limits:**

- **Development:** 10,000 requests per 15 minutes
- **Production:** 100 requests per 15 minutes (configurable via `RATE_LIMIT_MAX_REQUESTS`)

**Response when limit exceeded:**

```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

_This documentation will be expanded with detailed endpoint specifications in the following sections._
