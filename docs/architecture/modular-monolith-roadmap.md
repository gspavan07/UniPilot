# Modular Monolith Roadmap (Remaining Work + Plan)

Date: 2026-02-27
Scope: UniPilot-Main/backend

## Purpose
This document captures the remaining work needed to reach a strict modular monolith per ADR-001 and the execution plan we are following. It is designed so future work can continue without re-reading the entire codebase.

## Architectural Goal (ADR-001)
- Each module owns its data and write logic.
- Cross-module access happens only through module service APIs.
- No cross-module model imports or direct DB access.
- Shared kernel is minimal (Identity/Auth + Access Control).
- Enforced boundaries (lint/CI) to prevent regressions.
- Optional: per-module DB schemas or naming conventions, with explicit migration strategy.

## Current Status (Snapshot)
- Exams module has been refactored to remove cross-module model imports and raw SQL; it now uses module service APIs and manual hydration.
- HR module controllers refactored to use module service APIs (Core, Academics, Settings) and manual hydration.
- New service APIs added for Academics (Attendance, Leave Requests, Timetables), Settings (Holiday + setting lookup), Fees (FeePayment), Notifications.
- Exams cross-module associations removed in `modules/exams/models/associations.js`.
- Backend lint guardrails added to prevent cross-module model imports: `UniPilot-Main/backend/eslint.config.js`.
- Admissions module controllers/services now use Core/Academics/Settings service APIs and avoid cross-module includes.
- Hostel, Placement, Proctoring, Library, Transport, and Settings modules are fully refactored. Cross-module imports removed, replacing models with CoreService and other module APIs, using manual hydration techniques.

## Remaining Work For a “Perfect” Modular Monolith

### A. Enforce Boundary Rules Across All Modules
Current violations exist outside Exams. The lint rule will now flag these. Refactor to services.

High-priority modules with cross-module imports:
- (Phase 1 Completed, all major modules refactored to remove cross-module imports)

Action:
- For each module, replace cross-module model imports with service API calls.
- If a service API is missing, add it in the owning module’s `services/` and expose via `services/index.js`.

### B. Eliminate Global Cross-Module Model Registry
`backend/src/models/index.js` still centralizes models and defines cross-module associations. This breaks strict boundaries.

Action:
- Replace global association wiring with per-module association setup.
- Keep only within-module associations in each module’s `models/`.
- Remove cross-module associations entirely; hydrate relationships via service calls.
- Update any code that relied on `include` across modules to manual hydration.

### C. Replace Remaining Cross-Module Includes
Many controllers/services rely on Sequelize `include` with models from other modules.

Action:
- Replace cross-module `include` usage with manual hydration.
- Keep response shape compatible (attach nested objects manually).
- Ensure query count is controlled via batched service calls.

### D. Define and Enforce Service API Contracts
Module services should be narrow and stable.

Action:
- For each module, define a clear service surface:
  - `findByPk`, `findAll`, `getByIds`, `getMapByIds`
  - High-level business queries (e.g., `getActiveProgramsByDegree`)
- Document contract in module README or inline doc headers.

### E. Add CI Enforcement
Currently only ESLint guardrails exist locally.

Action:
- Add `npm run lint` to CI for backend.
- Fail builds on `no-restricted-imports` violations.

### F. Reduce Shared Kernel Surface
Core should stay small.

Action:
- Audit Core services and models for non-identity concerns.
- Move non-identity logic into owning modules or new modules.

### G. Fix Data Ownership Coupling in Core User Model
`User` contains many cross-domain fields (pro gram_id, regulation_id, salary_grade_id, etc.). This is an architectural coupling point.

Action (phased):
- Split into module-owned profile tables (e.g., `StudentProfile`, `StaffProfile`) owned by Academics/HR.
- Keep `User` minimal: identity, auth, role, status.
- Provide service APIs for profile access.
- Backfill migrations and update code paths gradually.

### H. Templates and Utilities
Some templates or utilities may import cross-module models or rely on global model state.

Action:
- Audit `backend/src/templates` and `backend/src/utils` for cross-module access.
- Replace with service APIs or inject needed data from caller.

## Migration Strategy Plan (DB and Code)

### Strategy Principles
- Keep production stable; avoid large-bang refactors.
- Small increments with backward-compatible changes.
- Use feature flags when needed.
- Migrate data ownership first, then delete old fields.

### Phase 1: Service APIs + Boundary Enforcement
- Create missing module service APIs.
- Replace cross-module imports with service calls.
- Remove cross-module `include` usage; hydrate data manually.
- Enforce lint rule in CI.

### Phase 2: Break Global Model Registry
- Stop importing `backend/src/models/index.js` in app startup.
- Move association setup into per-module init files.
- Ensure each module bootstraps its own models.
- Remove cross-module association definitions.

### Phase 3: Data Ownership Refactor (User Split)
- Create new tables:
  - `student_profiles` (Academics)
  - `staff_profiles` (HR)
- Add migrations to copy data from `users` into new tables.
- Update services and controllers to read from profile tables.
- Keep `users` fields for backward compatibility, mark deprecated.

### Phase 4: Schema Isolation (Optional, but ideal)
- Introduce per-module schema names in Sequelize models (`schema: 'academics'`, etc.).
- Add migrations to move tables into module schemas.
- Update DB connection to support multi-schema.
- Update raw SQL (if any remains) to include schema-qualified tables.

### Phase 5: Cleanup
- Remove deprecated fields from `users`.
- Remove old associations and cleanup unused code.
- Add contract tests for module APIs.

## Execution Plan (Current Path)

1. Enforce boundary rules using lint guards (done for backend).
2. Refactor modules in order of impact:
   - HR (done)
   - Academics (notifications/infrastructure) (done)
   - Hostel (done)
   - Placement (done)
   - Admissions (done)
   - Proctoring (done)
   - Library/Transport/Settings routes (done)
3. Remove global model index + cross-module associations.
4. Implement User split and profile tables.
5. Optionally move to per-module schemas.
6. Add contract tests + CI enforcement.

## Refactor Checklist Template (Per Module)
- Replace cross-module model imports with service API calls.
- Remove cross-module Sequelize `include` usage.
- Add missing service methods in owning module.
- Confirm response shape compatibility.
- Add or update unit tests (if present).
- Run lint and fix boundary violations.

## Progress Log
- 2026-02-27: Exams module refactor completed (services + manual hydration + remove cross-module associations).
- 2026-02-27: HR module controllers refactor completed; added Academics leave/timetable services and Settings holiday/setting lookups.
- 2026-02-27: Academics refactor completed for notifications/infrastructure; added Infrastructure room service and removed cross-module Room/Notification model imports.
- 2026-02-27: Admissions module refactor completed (Core/Academics/Settings services + manual hydration in admissions controllers/services).
- 2026-02-27: Hostel, Placement, Proctoring, Library, Transport, and Settings modules refactored to eliminate cross-module imports; `hydrateListWithUser` helper widely adopted using CoreService APIs.

## Notes for Future Work
- Use `rg "../../.*\/models"` under `backend/src/modules` to find violations.
- Keep response payloads stable for frontend expectations.
- Prefer batched service calls over per-row lookups.

## Handoff Notes (For Another Assistant)
- Refactors completed for Phase 1: Exams, HR, Academics, Admissions, Hostel, Placement, Proctoring, Library, Transport, Settings.
- Cross-module associations were intentionally removed; any remaining Sequelize `include` across modules will now throw errors.
- Required pattern: no cross-module model imports, use module service APIs only, and manually hydrate related data to preserve response shapes.
- ESLint guardrail is active in `UniPilot-Main/backend/eslint.config.js`; keep it green.
- Settings service exposes `getGlobalConfig`, `getOrCreateGlobalConfig`, `getSettingByKey`, `getAnySetting` to avoid direct `InstitutionSetting` access.
