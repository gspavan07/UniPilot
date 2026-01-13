# UniPilot - University Management System

## Overview

**Single-instance deployment model**: Each university/college deploys their own isolated instance of UniPilot on their infrastructure.

## Architecture

**Deployment Model**: Self-Hosted

- Each college gets complete software + data isolation
- Deploy on college's own servers or cloud
- Full control over their instance

```
College A (their server) → UniPilot Instance A (Backend + Frontend + DB)
College B (their server) → UniPilot Instance B (Backend + Frontend + DB)
College C (their server) → UniPilot Instance C (Backend + Frontend + DB)
```

## Tech Stack

- **Backend**: Node.js (JavaScript) + Express.js
- **Frontend**: React + Vite + Tailwind CSS
- **Mobile**: React Native
- **Database**: PostgreSQL
- **Cache**: Redis
- **Storage**: AWS S3 or local storage

## Project Structure

```
UniPilot/
├── backend/         # Node.js API server
├── frontend/        # React + Vite web app
├── mobile/          # React Native app
├── docs/            # Documentation
└── docker/          # Docker configurations
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recommended)

### Quick Start with Docker

```bash
# Clone the repository
git clone <repo-url>
cd UniPilot

# Start all services
docker-compose up -d

# Access the application
http://localhost:3001

# Access pgAdmin (Database Dashboard)
http://localhost:5050
- Email: admin@unipilot.com
- Password: admin123

```

### Manual Setup

**1. Database Setup**

```sql
CREATE DATABASE unipilot;
```

**2. Backend**

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run migrate
npm run dev
```

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

**4. Access**

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api

## Features

### Core UMS Features

- ✅ User Management (Students, Faculty, Staff, Admin)
- ✅ Department & HOD Management
- ✅ Student-Faculty Proctoring System
- ✅ Course & Academic Management
- ✅ Attendance Tracking
- ✅ Examination & Grading
- ✅ Student Promotion & Lifecycle
- ✅ Fee Management
- ✅ Alumni Management
- ✅ Notifications (Email, SMS, Push)
- ✅ Analytics & Reporting

### Advanced Features

- 📱 Mobile Apps (iOS & Android)
- 📊 Advanced Analytics
- 🎓 Certificate Generation
- 💳 Payment Gateway Integration
- 📚 Library Management
- 🗓️ Timetable Management

## Deployment Options

### Option 1: Docker Deployment (Recommended)

```bash
docker-compose up -d
```

### Option 2: Kubernetes

```bash
kubectl apply -f k8s/
```

### Option 3: Traditional Server

- Install Node.js, PostgreSQL, Redis
- Run backend and frontend as services
- Use Nginx as reverse proxy

## Configuration

Each instance can be customized via environment variables:

```bash
# University Details
UNIVERSITY_NAME=MIT College
UNIVERSITY_CODE=MIT001

# Features
ENABLE_FEE_MANAGEMENT=true
ENABLE_LIBRARY=true
ENABLE_HOSTEL=false
```

## Support & License

- **License**: Proprietary
- **Support**: Contact your account manager
- **Documentation**: See `/docs` folder

## For Your Company (UniPilot Team)

**Client Management Portal** (To be built separately):

- Track all client deployments
- Monitor health & usage
- Manage licenses
- Provide support tickets
- Remote updates

---

Built with 💙 by the UniPilot Team
