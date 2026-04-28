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
- [x] Stop importing `backend/src/models/index.js` in app startup.
- [x] Move association setup into per-module init files.
- [x] Ensure each module bootstraps its own models.
- [x] Remove cross-module association definitions.

### Phase 3: Data Ownership Refactor (User Split)
- [x] Create new tables:
  - `student_profiles` (Academics)
  - `staff_profiles` (HR)
- [x] Add migrations to copy data from `users` into new tables.
- [x] Update services and controllers to read from profile tables.
- [x] Keep `users` fields for backward compatibility, mark deprecated.

### Phase 4: Schema Isolation ✅
- [x] Introduce per-module schema names in Sequelize models (`schema: 'academics'`, etc.).
- [x] Add migrations to move tables into module schemas.
- [x] Update DB connection to support multi-schema (`searchPath`).
- [x] Run migration on database.
- [x] Verify backend starts cleanly with new schema layout.

### Phase 5: Cleanup
Status: Complete
- [x] Remove deprecated fields from `core.users` (migration `20260318-drop-deprecated-user-columns`).
- [x] Replace remaining reads/writes to deprecated `users` fields with `StudentProfile` / `StaffProfile` (Core auth/user flows, Proctoring, Placement, Exams, Hostel/Transport, HR Payroll, Promotions).
- [x] Remove deprecated/unused dependencies (`aws-sdk`, `bcryptjs`) and update docs.
- [x] Add contract tests for module APIs (scaffolded).

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
3. Remove global model index + cross-module associations (done).
4. Implement User split and profile tables (Phase 3 COMPLETE: database migrations done, all controllers/services updated to use StudentProfile and StaffProfile).
5. Per-module DB schemas (Phase 4: code changes complete, migration pending).
6. Add contract tests + CI enforcement.

## Refactor Checklist Template (Per Module)
- Replace cross-module model imports with service API calls.
- Remove cross-module Sequelize `include` usage.
- Add missing service methods in owning module.
- Confirm response shape compatibility.
- Add or update unit tests (if present).
- Run lint and fix boundary violations.

## Progress Log
- 2026-03-16: Phase 5 COMPLETE. Added contract-test scaffold and finalized cleanup tasks.
- 2026-03-16: Phase 4 COMPLETE. Migration executed successfully — 94 tables moved across 15 PostgreSQL schemas. Backend verified running on port 3000 with no errors.
- 2026-03-17: Phase 4 follow-up. Added migration `20260317-move-legacy-public-tables.js` to move remaining public tables (attendance_settings, exam_* legacy tables, fee/finance tables, placement_companies) into module schemas. Added `scripts/verify_module_schemas.js` and expanded expected tables to confirm schema isolation.
- 2026-03-16: Fixed missing `User ↔ StudentProfile` and `User ↔ StaffProfile` Sequelize associations. Added as shared-kernel cross-module associations in `bootstrap/models.js`. Also fixed `authService.js` login/getProfile/refresh methods which still used removed cross-module association includes (`department`, `program`, `regulation`, `documents`) — replaced with manual hydration via `AcademicService`.
- 2026-03-16: Phase 3 (Part 2) COMPLETE. Updated all academics, admissions, core, and hr controllers/services to read from `StudentProfile` and `StaffProfile`. Controllers updated: `userController` (getAllUsers, getUser, createUser, updateUser, bulkImportUsers, getStudentSections, getStudentSemesters, getAllBatches, getBatchDetails, bulkUpdateSections), `admissionController` (getAdmissionStats, exportAdmissionData, getSeatMatrix, getFunnelStats, getGeoStats, getGenderStats), `courseController` (getMyCourses), `attendanceController`, `timetableController`. Services updated: `userService` (getDistinctBatchYears, getMostCommonSemesterForBatch).
- 2026-03-16: Phase 3 (Part 1) completed. Created `StudentProfile` and `StaffProfile` models, generated database migrations to extract data from `users`, and marked old fields as deprecated in the `User` model.
- 2026-03-16: Phase 2 completed. Moved all intra-module associations to per-module files, removed cross-module associations entirely, and replaced `src/models/index.js` with `src/bootstrap/models.js`.
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
- Phase 2 complete: Global model index removed, per-module associations, cross-module associations eliminated.
- Phase 3 complete: Student-specific fields now read from `student_profiles` via `StudentProfile` model, staff-specific fields from `staff_profiles` via `StaffProfile` model.
- Pattern for profile access: `CoreService.findByPk(id, { includeProfiles: 'student' })` — yields `user.student_profile.batch_year`, etc.
- All profile writes go through `StudentProfile.create()` / `StaffProfile.create()` in `createUser` and `updateUser` (with `findOrCreate` for updates).
- Backward compatibility maintained: `user.dataValues.batch_year` etc. are remapped from profile data in list and detail endpoints.
- Cross-module associations were intentionally removed; any remaining Sequelize `include` across modules will now throw errors.
- **Exception**: User ↔ StudentProfile and User ↔ StaffProfile associations live in `bootstrap/models.js` as shared-kernel associations. This is the only allowed place for cross-module associations.
- Required pattern: no cross-module model imports, use module service APIs only, and manually hydrate related data to preserve response shapes.
- ESLint guardrail is active in `UniPilot-Main/backend/eslint.config.js`; keep it green.
- Settings service exposes `getGlobalConfig`, `getOrCreateGlobalConfig`, `getSettingByKey`, `getAnySetting` to avoid direct `InstitutionSetting` access.
- Next recommended step: Phase 4 (optional per-module DB schemas) or Phase 5 cleanup (remove deprecated fields from `users` once all paths confirmed working).
- **Phase 4**: Every model now has a `schema: '<module>'` option. All 15 schemas are listed in `database.js` `searchPath`. Migration `20260316-create-module-schemas.js` moves tables from `public` to module schemas. Must run migration before deploying updated models.
