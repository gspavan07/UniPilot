# Contributing to UniPilot

Welcome to the UniPilot team! This document outlines our development workflow and collaboration guidelines to ensure we work fast and break things less.

## 🚀 Quick Start

1.  **Clone the repo**: `git clone <repo-url>`
2.  **Install dependencies**:
    - Backend: `cd backend && npm install`
    - Frontend: `cd frontend && npm install`
3.  **Setup Environment**: Copy `.env.example` to `.env` in both folders.

---

## 🌳 Git Workflow (The "Feature Branch" Strategy)

We use a **Feature Branch Workflow**. This means you generally do not commit directly to `main`.

### 1. Start a New Task

Always create a new branch for your work. Name it descriptively:

- `feature/user-auth` (New features)
- `fix/login-bug` (Bug fixes)
- `chore/update-dependencies` (Maintenance)

```bash
git checkout main
git pull origin main  # Get latest code
git checkout -b feature/my-cool-feature
```

### 2. Do Your Work

- Make small, atomic commits.
- Write clear commit messages: `feat: add user login endpoint` or `fix: resolve button alignment`.

### 3. Database Changes (Migrations & Seeders)

**🚨 IMPORTANT:**

- **Migrations**: ALWAYS commit your migration files. They are the source of truth for the database schema.
  - If you change the DB, create a new migration: `npx sequelize-cli migration:generate --name add-users-table`
- **Seeders**: ALWAYS commit seeders. They help other developers populate their local DB with dummy data.

**When pulling new code:**
Always run migrations to keep your local DB in sync with your teammates:

```bash
# In /backend
npm run migrate:up
```

### 4. Push & Pull Request (PR)

When you are ready to merge:

1.  **Push your branch**:
    ```bash
    git push origin feature/my-cool-feature
    ```
2.  **Open a PR on GitHub**:
    - Go to the repo.
    - Click "Compare & pull request".
    - Describe what you changed.
3.  **Review**:
    - Ask a teammate to review your code.
    - Fix any issues they find.
4.  **Merge**:
    - Once approved, merge the PR into `main`.

---

## 🕵️‍♀️ How to Review & Verify (For Reviewers)

Don't just look at the code on GitHub! You should **run it** to make sure it actually works.

1.  **Get their code**:
    ```bash
    git fetch origin
    git checkout feature/their-feature-branch
    ```
2.  **Update Dependencies**:
    - If they added packages: `npm install`
    - If they added migrations: `npm run migrate`
3.  **Test It**:
    - Start the app (`npm run dev`) and try to break what they built.
    - Check for console errors.
4.  **Finish**:
    - Go back to your work: `git checkout main`
    - Approve (or Request Changes) on GitHub.

---

## 🤝 Collaboration Tips

- **Communicate**: If you are working on `AdmissionService`, tell the team so nobody else touches it at the same time.
- **Pull Often**: Run `git pull origin main` into your feature branch frequently to avoid huge merge conflicts later.

Happy Coding! 🚀
