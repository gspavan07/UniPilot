# 🚀 UniPilot Onboarding & Workflow Guide

This document is the "Master Manual" for the UniPilot repository. It explains how to set up the project, how to work together, and different ways to manage code.

---

## 👥 Part 1: For the Team Lead (You)

### 1.1 Setting Up the Repo

Since you have the repo on GitHub (Private):

1.  **Invite Collaborators**:

    - Go to **Settings** > **Collaborators**.
    - Add your developers by email or username.
    - Give them **Write** access (so they can push branches) but NOT Admin (optional).

2.  **Protect the `main` Branch (CRITICAL)**:
    - Go to **Settings** > **Branches**.
    - Click **Add branch protection rule**.
    - **Branch name pattern**: `main`
    - Check **Require a pull request before merging**.
    - Check **Require approvals** (Set to 1 or 2).
    - _Why?_ This forces everyone (including you!) to use PRs and prevents accidental breaking of the production code.

---

## 🛠 Part 2: For Developers (New Joiners)

**Welcome to the team!** Follow these exact steps to start coding.

### 2.1 Prerequisites

1.  **Install Node.js** (v18 or higher).
2.  **Install PostgreSQL** (v15+).
3.  **Install Git**.

### 2.2 First Time Setup

Open your terminal and run these commands one by one:

```bash
# 1. Clone the repository
git clone <YOUR_REPO_URL>
cd UniPilot

# 2. Setup Backend
cd backend
npm install
cp .env.example .env   # Create env file
# (Ask Team Lead for the correct .env values!)
npm run migrate        # Create database tables
npm run seed           # (Optional) Add dummy data

# 3. Setup Frontend
cd ../frontend
npm install
cp .env.example .env   # If applicable
```

### 2.3 Running the App

You need two terminals open:

**Terminal 1 (Backend):**

```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm run dev
```

---

## 🔄 Part 3: Workflow Strategies (How we work)

You asked about other methods. Here are the 3 industry standards. **We currently recommend Option 1.**

### Option 1: Feature Branch Workflow (Recommended) ⭐

- **Best for**: SaaS apps, moving fast, continuous delivery.
- **The Rule**: `main` is always deployable.
- **Process**:
  1.  Create branch `feature/new-login` from `main`.
  2.  Finish work -> Open PR -> Merge to `main`.
- **Why**: Simple, fast, less "merge hell".

### Option 2: Gitflow Workflow (Legacy / Enterprise)

- **Best for**: "Versioned" software (e.g., Apps released as v1.0, v2.0).
- **The Structure**:
  - `main`: Production code only.
  - `develop`: Integration branch (everything merges here first).
  - `feature/*`: Feature branches off `develop`.
  - `release/*`: Preparing for a new version.
- **Why**: Very strict control.
- **Downside**: Very complex. Overkill for most web apps today.

### Option 3: Trunk-Based Development (Advanced)

- **Best for**: High-frequency teams (Google, Facebook).
- **The Rule**: Everyone commits to `main` directly (or very short-lived branches).
- **Requirement**: You must have VERY STRONG automated testing (CI/CD) because if you break `main`, you block everyone.
- **Why**: Extremely fast.
- **Downside**: High risk without 100% test coverage.

---

## 🧹 Keeping It Clean

- **Don't commit secrets**: Never push `.env` files.
- **Don't commit build artifacts**: No `node_modules/`, `dist/`, or `build/`.
- **Delete old branches**: Once a PR is merged, delete the feature branch.

---

### Need Help?

Contact the Team Lead for access or `.env` credentials.
