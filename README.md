# UniPilot - University Management System

UniPilot is a comprehensive, multi-tenant University Management System designed to streamline educational administration. It offers robust modules for students, staff, HR, infrastructure, and academic management.

## Tech Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL (managed via Sequelize ORM)
- **Authentication**: JWT & bcryptjs
- **File Storage**: AWS S3 (via aws-sdk) & Local uploads
- **Email**: Nodemailer
- **Other**: Redis (caching), Winston (logging), Helmet (security)

### Frontend
- **Framework**: React (Vite)
- **State Management**: Redux Toolkit & React-Redux
- **UI Library**: Tailwind CSS, Headless UI (implied via Tailwind ecosystem), Lucide React (icons)
- **Forms**: React Hook Form using Yup validation
- **HTTP Client**: Axios

## Key Features

- **User Management**: Role-based access control (RBAC) for Admins, Staff, Students, and HR.
- **Academic Management**: Courses, Departments, Programs, Timetables, and Exams.
- **Admissions**: Application processing with payment integration (pending).
- **Student Services**: Hostel management (Rooms, Fines, Gate Passes), Transport, and Library.
- **HR & Payroll**: Staff attendance tracking, Biometric integration, Payroll generation, and Leave management.
- **Placement Cell**: Job postings, Company management, and Student drive tracking.
- **Infrastructure**: Room and facility management.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis (optional, for caching/queues)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository_url>
    cd UniPilot
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    cp .env.example .env  # Configure your environment variables
    npm run migrate       # Run database migrations
    npm run seed          # Seed initial data (optional)
    npm start             # Start the server
    ```

3.  **Setup Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev           # Start the development server
    ```
