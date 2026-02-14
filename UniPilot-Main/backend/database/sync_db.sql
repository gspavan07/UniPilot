-- ============================================================================
-- UniPilot: Database Sync Migration
-- Purpose: Sync Supabase DB to match Sequelize Models (Models = Source of Truth)
-- Generated: 2026-02-14
-- Target: db.wntxgiswyebqhnesobfl.supabase.co / postgres
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. drive_eligibility — Major restructure
-- DB has: id, drive_id, min_cgpa, max_backlogs, eligible_departments,
--         eligible_regulations, gender_preference, other_criteria
-- Model expects: id, drive_id, department_ids, regulation_ids, batch_ids,
--                min_cgpa, min_10th_percent, min_inter_percent,
--                max_active_backlogs, max_total_backlogs,
--                min_semester, max_semester, custom_conditions
-- ============================================================================

-- Drop old columns that model doesn't use
ALTER TABLE public.drive_eligibility DROP COLUMN IF EXISTS max_backlogs;
ALTER TABLE public.drive_eligibility DROP COLUMN IF EXISTS eligible_departments;
ALTER TABLE public.drive_eligibility DROP COLUMN IF EXISTS eligible_regulations;
ALTER TABLE public.drive_eligibility DROP COLUMN IF EXISTS gender_preference;
ALTER TABLE public.drive_eligibility DROP COLUMN IF EXISTS other_criteria;

-- Add new columns from model
ALTER TABLE public.drive_eligibility ADD COLUMN IF NOT EXISTS department_ids uuid[];
ALTER TABLE public.drive_eligibility ADD COLUMN IF NOT EXISTS regulation_ids uuid[];
ALTER TABLE public.drive_eligibility ADD COLUMN IF NOT EXISTS batch_ids integer[];
ALTER TABLE public.drive_eligibility ADD COLUMN IF NOT EXISTS min_10th_percent numeric(5,2) DEFAULT 0.0;
ALTER TABLE public.drive_eligibility ADD COLUMN IF NOT EXISTS min_inter_percent numeric(5,2) DEFAULT 0.0;
ALTER TABLE public.drive_eligibility ADD COLUMN IF NOT EXISTS max_active_backlogs integer DEFAULT 0;
ALTER TABLE public.drive_eligibility ADD COLUMN IF NOT EXISTS max_total_backlogs integer;
ALTER TABLE public.drive_eligibility ADD COLUMN IF NOT EXISTS min_semester integer;
ALTER TABLE public.drive_eligibility ADD COLUMN IF NOT EXISTS max_semester integer;
ALTER TABLE public.drive_eligibility ADD COLUMN IF NOT EXISTS custom_conditions jsonb;


-- ============================================================================
-- 2. student_placement_profiles — Complete redesign
-- DB has: id, user_id, resume_url, skills, interests, preferred_locations,
--         is_placed, placed_at_company_id, placed_ctc
-- Model expects: id, student_id (unique), technical_skills, soft_skills,
--                programming_languages, certifications, projects, internships,
--                achievements, linkedin_url, github_url, portfolio_url,
--                resume_versions, resume_url, profile_completion_percentage
-- ============================================================================

-- Drop old columns
ALTER TABLE public.student_placement_profiles DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.student_placement_profiles DROP COLUMN IF EXISTS skills;
ALTER TABLE public.student_placement_profiles DROP COLUMN IF EXISTS interests;
ALTER TABLE public.student_placement_profiles DROP COLUMN IF EXISTS preferred_locations;
ALTER TABLE public.student_placement_profiles DROP COLUMN IF EXISTS is_placed;
ALTER TABLE public.student_placement_profiles DROP COLUMN IF EXISTS placed_at_company_id;
ALTER TABLE public.student_placement_profiles DROP COLUMN IF EXISTS placed_ctc;

-- Add new columns from model
-- NOTE: student_id is NOT NULL. If rows exist, we first add as nullable, then enforce.
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS student_id uuid UNIQUE;
-- If the table had existing rows without student_id, you'd need to UPDATE them first.
-- Then enforce NOT NULL:
ALTER TABLE public.student_placement_profiles ALTER COLUMN student_id SET NOT NULL;
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS technical_skills text[];
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS soft_skills text[];
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS programming_languages text[];
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS certifications jsonb;
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS projects jsonb;
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS internships jsonb;
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS achievements text[];
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS linkedin_url character varying(255);
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS github_url character varying(255);
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS portfolio_url character varying(255);
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS resume_versions jsonb;
ALTER TABLE public.student_placement_profiles ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0;

-- FK: student_id -> users(id)
ALTER TABLE public.student_placement_profiles
    ADD CONSTRAINT student_placement_profiles_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- ============================================================================
-- 3. student_applications — Major field additions
-- DB has: id, drive_id, student_id, current_round_id, status (varchar),
--         resume_url, is_shortlisted
-- Model expects: id, drive_id, student_id, registration_form_data, applied_at,
--                is_eligible, eligibility_check_data, status (ENUM),
--                current_round_id, withdrawal_reason, withdrawn_at
-- ============================================================================

-- Drop old columns not in model
ALTER TABLE public.student_applications DROP COLUMN IF EXISTS resume_url;
ALTER TABLE public.student_applications DROP COLUMN IF EXISTS is_shortlisted;

-- Add new columns from model
ALTER TABLE public.student_applications ADD COLUMN IF NOT EXISTS registration_form_data jsonb;
ALTER TABLE public.student_applications ADD COLUMN IF NOT EXISTS applied_at timestamp with time zone DEFAULT NOW();
ALTER TABLE public.student_applications ADD COLUMN IF NOT EXISTS is_eligible boolean DEFAULT true;
ALTER TABLE public.student_applications ADD COLUMN IF NOT EXISTS eligibility_check_data jsonb;
ALTER TABLE public.student_applications ADD COLUMN IF NOT EXISTS withdrawal_reason text;
ALTER TABLE public.student_applications ADD COLUMN IF NOT EXISTS withdrawn_at timestamp with time zone;

-- Convert status from varchar to ENUM
-- First, normalize any NULL or unexpected values to 'applied'
UPDATE public.student_applications SET status = 'applied'
    WHERE status IS NULL OR status NOT IN ('applied', 'withdrawn', 'shortlisted', 'rejected', 'placed');

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_student_applications_status') THEN
        CREATE TYPE public.enum_student_applications_status AS ENUM (
            'applied', 'withdrawn', 'shortlisted', 'rejected', 'placed'
        );
    END IF;
END $$;

ALTER TABLE public.student_applications
    ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.student_applications
    ALTER COLUMN status TYPE public.enum_student_applications_status
    USING status::public.enum_student_applications_status;
ALTER TABLE public.student_applications
    ALTER COLUMN status SET DEFAULT 'applied';

-- Add unique compound index
CREATE UNIQUE INDEX IF NOT EXISTS student_applications_drive_student_unique
    ON public.student_applications(drive_id, student_id);


-- ============================================================================
-- 4. placements — 6 new columns
-- DB has: id, student_id, company_name, designation, package_lpa,
--         placement_date, offer_letter_url, is_on_campus, academic_year, remarks
-- Model adds: drive_id, job_posting_id, application_id,
--             offer_accepted_at, joining_date, status (ENUM)
-- ============================================================================

ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS drive_id uuid;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS job_posting_id uuid;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS application_id uuid;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS offer_accepted_at timestamp with time zone;
ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS joining_date date;

-- Create ENUM for status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_placements_status') THEN
        CREATE TYPE public.enum_placements_status AS ENUM (
            'offered', 'accepted', 'rejected', 'joined'
        );
    END IF;
END $$;

ALTER TABLE public.placements ADD COLUMN IF NOT EXISTS status public.enum_placements_status DEFAULT 'offered';

-- FK constraints for new columns
ALTER TABLE public.placements
    ADD CONSTRAINT placements_drive_id_fkey
    FOREIGN KEY (drive_id) REFERENCES public.placement_drives(id) ON DELETE SET NULL;
ALTER TABLE public.placements
    ADD CONSTRAINT placements_job_posting_id_fkey
    FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON DELETE SET NULL;
ALTER TABLE public.placements
    ADD CONSTRAINT placements_application_id_fkey
    FOREIGN KEY (application_id) REFERENCES public.student_applications(id) ON DELETE SET NULL;


-- ============================================================================
-- 5. job_postings — 4 new columns
-- DB has: id, company_id, role_title, job_description, required_skills,
--         ctc_lpa, work_location, number_of_positions, application_deadline,
--         is_active
-- Model adds: ctc_breakdown, bond_details, preferred_skills, jd_document_url
-- ============================================================================

ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS ctc_breakdown jsonb;
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS bond_details text;
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS preferred_skills text[];
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS jd_document_url character varying(500);


-- ============================================================================
-- 6. placement_drives — 1 new column
-- Model adds: coordinator_id (UUID FK to users)
-- ============================================================================

ALTER TABLE public.placement_drives ADD COLUMN IF NOT EXISTS coordinator_id uuid;

ALTER TABLE public.placement_drives
    ADD CONSTRAINT placement_drives_coordinator_id_fkey
    FOREIGN KEY (coordinator_id) REFERENCES public.users(id) ON DELETE SET NULL;


-- ============================================================================
-- 7. round_results — Replace 'status' with 'result' ENUM + add uploaded_via
-- DB has: id, round_id, student_id, status (varchar), score, remarks
-- Model expects: id, round_id, student_id, result (ENUM), score, remarks,
--                uploaded_via
-- ============================================================================

-- Drop old status column
ALTER TABLE public.round_results DROP COLUMN IF EXISTS status;

-- Create ENUM for result
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_round_results_result') THEN
        CREATE TYPE public.enum_round_results_result AS ENUM (
            'selected', 'rejected', 'on_hold', 'absent'
        );
    END IF;
END $$;

ALTER TABLE public.round_results ADD COLUMN IF NOT EXISTS result public.enum_round_results_result DEFAULT 'on_hold';
ALTER TABLE public.round_results ADD COLUMN IF NOT EXISTS uploaded_via character varying(20) DEFAULT 'manual';

-- Add unique compound index
CREATE UNIQUE INDEX IF NOT EXISTS round_results_round_student_unique
    ON public.round_results(round_id, student_id);


-- ============================================================================
-- 8. semester_results — Restructure
-- DB has: id (uuid), student_id, semester, batch_year, sgpa,
--         total_credits, earned_credits, exam_cycle_id, published_at,
--         published_by
-- Model expects: id (INTEGER autoincrement), student_id (INTEGER), semester,
--                sgpa, cgpa, total_credits, earned_credits, backlogs, status,
--                is_published, published_at
-- NOTE: The model uses INTEGER IDs while DB uses UUID. We'll keep UUID
--       for backward compatibility but add the missing columns.
-- ============================================================================

-- Drop old columns not in model
ALTER TABLE public.semester_results DROP COLUMN IF EXISTS batch_year;
ALTER TABLE public.semester_results DROP COLUMN IF EXISTS exam_cycle_id;
ALTER TABLE public.semester_results DROP COLUMN IF EXISTS published_by;

-- Add new columns from model
ALTER TABLE public.semester_results ADD COLUMN IF NOT EXISTS cgpa numeric(4,2);
ALTER TABLE public.semester_results ADD COLUMN IF NOT EXISTS backlogs integer DEFAULT 0;
ALTER TABLE public.semester_results ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Create ENUM for status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_semester_results_status') THEN
        CREATE TYPE public.enum_semester_results_status AS ENUM (
            'pass', 'fail', 'detained'
        );
    END IF;
END $$;

ALTER TABLE public.semester_results ADD COLUMN IF NOT EXISTS status public.enum_semester_results_status DEFAULT 'pass';


-- ============================================================================
-- 9. regulations — Rename exam_structure -> courses_list + exam_configuration
-- DB has: id, name, academic_year, type, grading_system, description,
--         is_active, exam_structure, grade_scale
-- Model expects: id, name, academic_year, type, grading_system, description,
--                courses_list, exam_configuration, grade_scale, is_active
-- ============================================================================

-- Drop old column
ALTER TABLE public.regulations DROP COLUMN IF EXISTS exam_structure;

-- Add new columns from model
ALTER TABLE public.regulations ADD COLUMN IF NOT EXISTS courses_list jsonb DEFAULT '{}';
ALTER TABLE public.regulations ADD COLUMN IF NOT EXISTS exam_configuration jsonb DEFAULT '{"course_types": []}';


-- ============================================================================
-- 10. courses — Model doesn't have program_id, semester, regulation_id,
--     is_elective but DB does. Since models are source of truth, we drop them.
-- NOTE: These columns may have data. Check before dropping in production.
-- ============================================================================

ALTER TABLE public.courses DROP COLUMN IF EXISTS program_id;
ALTER TABLE public.courses DROP COLUMN IF EXISTS semester;
ALTER TABLE public.courses DROP COLUMN IF EXISTS regulation_id;
ALTER TABLE public.courses DROP COLUMN IF EXISTS is_elective;


-- ============================================================================
-- 11. fee_waivers — DB has extra columns not in model
-- DB has extra: status (ENUM), is_jvd, jvd_application_id, academic_year
-- Model HAS: applies_to, semester, value_type, percentage, is_active
--            (these were false-flagged by gap analysis — keeping them)
-- ============================================================================

ALTER TABLE public.fee_waivers DROP COLUMN IF EXISTS status;
ALTER TABLE public.fee_waivers DROP COLUMN IF EXISTS is_jvd;
ALTER TABLE public.fee_waivers DROP COLUMN IF EXISTS jvd_application_id;
ALTER TABLE public.fee_waivers DROP COLUMN IF EXISTS academic_year;

-- Cleanup orphaned ENUM type if it exists
DROP TYPE IF EXISTS public.enum_fee_waivers_status;


-- ============================================================================
-- 12. permissions — DB has description column, model doesn't (harmless)
-- We'll keep it as it doesn't break anything. No action needed.
-- ============================================================================
-- No changes needed for permissions.description
-- It exists in DB but not in model - Sequelize will simply ignore it.


-- ============================================================================
-- DONE
-- ============================================================================

COMMIT;
