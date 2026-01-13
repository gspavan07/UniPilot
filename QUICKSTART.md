# UniPilot - Quick Start Guide

## Prerequisites

Before running the application, you need:

1. **Node.js 18+**: Already installed ✅
2. **PostgreSQL 15+**: Database server
3. **Redis 7+** (Optional for now): Cache server

---

## Option 1: Using Docker (Recommended - Easiest)

If you have Docker installed, everything will be set up automatically:

```bash
# From the root UniPilot directory
docker-compose up -d
```

This will start PostgreSQL, Redis, backend, and frontend automatically!

---

## Option 2: Manual Setup (Local Installation)

### Step 1: Install PostgreSQL

**macOS:**

```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Inside psql, run:
CREATE DATABASE unipilot;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE unipilot TO postgres;
\q

# CRITICAL: Fix permissions WITHIN the unipilot database
psql -U postgres -d unipilot -c "ALTER SCHEMA public OWNER TO postgres; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;"
```

### Step 3: Install Redis (Optional - can skip for now)

**macOS:**

```bash
brew install redis
brew services start redis
```

**Linux:**

```bash
sudo apt install redis-server
sudo systemctl start redis
```

### Step 4: Run Backend

```bash
cd backend

# Install dependencies (already done)
npm install

# Run database migrations
npm run migrate

# Create initial admin user
npm run seed

# Start development server
npm run dev
```

Expected output:

```
✓ Master database connected successfully
✓ Redis connected successfully
🚀 Server running on port 3000
```

### Step 5: Run Frontend

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Expected output:

```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:3001/
```

---

## Quick Test

1. **Backend Health Check:**

   ```bash
   curl http://localhost:3000/health
   ```

2. **Login to Admin:**
   - Open: http://localhost:3001
   - Use Postman/curl to test:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@university.edu","password":"Admin@123"}'
   ```

---

## Initial Admin Credentials

**Email:** `admin@university.edu`  
**Password:** `Admin@123`

⚠️ **CHANGE THIS PASSWORD** after first login!

---

## Troubleshooting

### Database Connection Failed

1. Check if PostgreSQL is running:

   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. Check database exists:

   ```bash
   psql -U postgres -l
   ```

3. Update `.env` file with correct credentials

### Port Already in Use

If port 3000 or 3001 is already in use:

1. Change in `backend/.env`:

   ```
   PORT=3002
   ```

2. Change in `frontend/vite.config.js` and restart

---

## Next Steps After Setup

1. **Change admin password**
2. **Create departments**
3. **Add faculty and students**
4. **Explore the system!**

---

## Docker Alternative (All-in-One)

Don't want to install PostgreSQL and Redis locally? Use Docker Compose:

```bash
# Start everything
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop everything
docker-compose down
```

Database and backend will be ready at:

- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- PostgreSQL: localhost:5432

---

For more details, see the main README.md
