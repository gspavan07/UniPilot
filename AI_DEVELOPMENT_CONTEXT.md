# AI Development Context

This file serves as a context guide for AI assistants working on the UniPilot repository. It outlines the architectural decisions, folder structure, and known implementation details.

## Architecture Overview

UniPilot follows a standard Monorepo-style structure (without workspaces configured in root yet) separating `backend` and `frontend`.

### Backend Service (`/backend`)
- **Pattern**: MVC (Model-View-Controller).
- **Entry Point**: `server.js`.
- **Database**: PostgreSQL via Sequelize.
    - **Models**: Located in `src/models`.
    - **Migrations**: Located in `src/migrations`.
- **Controllers**: `src/controllers` contains the business logic.
    - Notable complex controllers: `feeController.js`, `examController.js`, `hostelController.js`, `payrollController.js`.
- **Authentication**: Middleware-based JWT verification (`middleware/auth.js` implied).

### Frontend Application (`/frontend`)
- **Tooling**: Vite + React.
- **Routing**: React Router (`react-router-dom`).
- **State**: Redux Toolkit (`src/store`, `src/redux`).
- **Styling**: Tailwind CSS (`src/index.css`, `tailwind.config.js`).
- **Components**:
    - `src/pages`: Main view components (Page level).
    - `src/components`: Reusable UI components.
    - `src/layouts`: Layout wrappers (implied structure).

## Feature Implementation Status

### Core Modules
| Module | Status | Notes |
| :--- | :--- | :--- |
| **Auth** | ✅ Implemented | JWT, Login, Role management. |
| **Academics** | ✅ Implemented | Courses, Departments, Timetables. |
| **Admissions** | 🚧 In Progress | Controllers exist, payment integration (Razorpay) pending. |
| **Hostel** | ✅ Implemented | Rooms, Allocation, Gate Pass, Fines. |
| **Transport** | ✅ Implemented | Routes, Vehicles. |
| **HR/Payroll** | ✅ Implemented | Attendance, Salary calculation. |
| **Placement** | ✅ Implemented | Drives, Companies, Job Postings. |
| **Library** | ✅ Implemented | Books, Issues. |

### Pending / Known Issues
1.  **Payment Gateway**: Razorpay integration was requested but codebase search shows no implementation in `backend/src`. Needs to be added to `feeController` or `admissionController`.
2.  **frontend/README.md**: Exists but should be consolidated into the root documentation (this task is handled by the current cleanup).
3.  **Tests**: Backend has Jest setup (`npm test`), but coverage needs verification.

## Development Workflows

- **Database Changes**: Always use Sequelize migrations. Do not modify the DB schema manually.
- **Frontend State**: Prefer Redux for global state (User auth, Themes) and local state for simple forms.
- **API Calls**: Use the configured Axios instance (likely in `src/utils` or `src/api`) to handle Authorization headers automatically.

## Important Paths
- **Backend Config**: `/backend/config` & `/backend/.env`
- **Sequelize Models**: `/backend/src/models`
- **Frontend Pages**: `/frontend/src/pages`
- **Frontend Store**: `/frontend/src/store`
