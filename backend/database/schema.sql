--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_attendance_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_attendance_status AS ENUM (
    'present',
    'absent',
    'late',
    'excused',
    'on_leave'
);


ALTER TYPE public.enum_attendance_status OWNER TO postgres;

--
-- Name: enum_blocks_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_blocks_type AS ENUM (
    'academic',
    'administrative',
    'hostel',
    'other'
);


ALTER TYPE public.enum_blocks_type OWNER TO postgres;

--
-- Name: enum_book_issues_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_book_issues_status AS ENUM (
    'issued',
    'returned',
    'overdue',
    'lost'
);


ALTER TYPE public.enum_book_issues_status OWNER TO postgres;

--
-- Name: enum_books_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_books_status AS ENUM (
    'available',
    'out_of_stock',
    'archived'
);


ALTER TYPE public.enum_books_status OWNER TO postgres;

--
-- Name: enum_courses_course_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_courses_course_type AS ENUM (
    'theory',
    'lab',
    'project'
);


ALTER TYPE public.enum_courses_course_type OWNER TO postgres;

--
-- Name: enum_departments_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_departments_type AS ENUM (
    'academic',
    'administrative'
);


ALTER TYPE public.enum_departments_type OWNER TO postgres;

--
-- Name: enum_exam_cycles_exam_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_cycles_exam_type AS ENUM (
    'mid_term',
    'semester_end',
    're_exam',
    'internal'
);


ALTER TYPE public.enum_exam_cycles_exam_type OWNER TO postgres;

--
-- Name: enum_exam_cycles_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_cycles_status AS ENUM (
    'scheduled',
    'ongoing',
    'completed',
    'results_published'
);


ALTER TYPE public.enum_exam_cycles_status OWNER TO postgres;

--
-- Name: enum_exam_fee_payments_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_fee_payments_category AS ENUM (
    'registration',
    'supply',
    'reverification',
    'condonation',
    'script_view'
);


ALTER TYPE public.enum_exam_fee_payments_category OWNER TO postgres;

--
-- Name: enum_exam_fee_payments_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_fee_payments_status AS ENUM (
    'pending',
    'completed',
    'failed'
);


ALTER TYPE public.enum_exam_fee_payments_status OWNER TO postgres;

--
-- Name: enum_exam_marks_moderation_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_marks_moderation_status AS ENUM (
    'draft',
    'verified',
    'approved',
    'locked'
);


ALTER TYPE public.enum_exam_marks_moderation_status OWNER TO postgres;

--
-- Name: enum_exam_marks_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_marks_status AS ENUM (
    'present',
    'absent',
    'malpractice'
);


ALTER TYPE public.enum_exam_marks_status OWNER TO postgres;

--
-- Name: enum_exam_registrations_attendance_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_registrations_attendance_status AS ENUM (
    'clear',
    'low',
    'condoned'
);


ALTER TYPE public.enum_exam_registrations_attendance_status OWNER TO postgres;

--
-- Name: enum_exam_registrations_fee_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_registrations_fee_status AS ENUM (
    'pending',
    'paid',
    'partially_paid',
    'waived'
);


ALTER TYPE public.enum_exam_registrations_fee_status OWNER TO postgres;

--
-- Name: enum_exam_registrations_registration_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_registrations_registration_type AS ENUM (
    'regular',
    'supply',
    'combined'
);


ALTER TYPE public.enum_exam_registrations_registration_type OWNER TO postgres;

--
-- Name: enum_exam_registrations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_registrations_status AS ENUM (
    'draft',
    'submitted',
    'approved',
    'rejected',
    'blocked'
);


ALTER TYPE public.enum_exam_registrations_status OWNER TO postgres;

--
-- Name: enum_exam_reverifications_payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_reverifications_payment_status AS ENUM (
    'pending',
    'paid',
    'waived'
);


ALTER TYPE public.enum_exam_reverifications_payment_status OWNER TO postgres;

--
-- Name: enum_exam_reverifications_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_exam_reverifications_status AS ENUM (
    'pending',
    'under_review',
    'completed',
    'rejected'
);


ALTER TYPE public.enum_exam_reverifications_status OWNER TO postgres;

--
-- Name: enum_expenses_payment_mode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_expenses_payment_mode AS ENUM (
    'cash',
    'upi',
    'cheque',
    'bank_transfer'
);


ALTER TYPE public.enum_expenses_payment_mode OWNER TO postgres;

--
-- Name: enum_expenses_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_expenses_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'paid'
);


ALTER TYPE public.enum_expenses_status OWNER TO postgres;

--
-- Name: enum_extension_activities_activity_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_extension_activities_activity_type AS ENUM (
    'nss',
    'ncc',
    'community_service',
    'skill_development',
    'awareness_camp',
    'health_camp',
    'other'
);


ALTER TYPE public.enum_extension_activities_activity_type OWNER TO postgres;

--
-- Name: enum_faculty_developments_program_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_faculty_developments_program_type AS ENUM (
    'fdp',
    'workshop',
    'conference',
    'seminar',
    'webinar',
    'certification',
    'orientation',
    'refresher'
);


ALTER TYPE public.enum_faculty_developments_program_type OWNER TO postgres;

--
-- Name: enum_faculty_developments_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_faculty_developments_role AS ENUM (
    'participant',
    'resource_person',
    'organizer'
);


ALTER TYPE public.enum_faculty_developments_role OWNER TO postgres;

--
-- Name: enum_fee_payments_payment_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_fee_payments_payment_method AS ENUM (
    'cash',
    'online',
    'bank_transfer',
    'cheque',
    'WALLET'
);


ALTER TYPE public.enum_fee_payments_payment_method OWNER TO postgres;

--
-- Name: enum_fee_payments_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_fee_payments_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'partially_paid'
);


ALTER TYPE public.enum_fee_payments_status OWNER TO postgres;

--
-- Name: enum_fee_semester_configs_fine_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_fee_semester_configs_fine_type AS ENUM (
    'none',
    'fixed',
    'percentage'
);


ALTER TYPE public.enum_fee_semester_configs_fine_type OWNER TO postgres;

--
-- Name: enum_fee_structures_applies_to; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_fee_structures_applies_to AS ENUM (
    'all',
    'hostellers',
    'day_scholars'
);


ALTER TYPE public.enum_fee_structures_applies_to OWNER TO postgres;

--
-- Name: enum_fee_structures_fine_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_fee_structures_fine_type AS ENUM (
    'none',
    'fixed',
    'percentage'
);


ALTER TYPE public.enum_fee_structures_fine_type OWNER TO postgres;

--
-- Name: enum_fee_transactions_jvd_quarter; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_fee_transactions_jvd_quarter AS ENUM (
    'Q1',
    'Q2',
    'Q3',
    'Q4'
);


ALTER TYPE public.enum_fee_transactions_jvd_quarter OWNER TO postgres;

--
-- Name: enum_fee_transactions_payment_mode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_fee_transactions_payment_mode AS ENUM (
    'cash',
    'upi',
    'cheque',
    'dd',
    'bank_transfer',
    'scholarship_adjustment'
);


ALTER TYPE public.enum_fee_transactions_payment_mode OWNER TO postgres;

--
-- Name: enum_fee_transactions_payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_fee_transactions_payment_status AS ENUM (
    'success',
    'pending',
    'failed',
    'bounced'
);


ALTER TYPE public.enum_fee_transactions_payment_status OWNER TO postgres;

--
-- Name: enum_fee_waivers_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_fee_waivers_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'disbursed'
);


ALTER TYPE public.enum_fee_waivers_status OWNER TO postgres;

--
-- Name: enum_green_initiatives_initiative_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_green_initiatives_initiative_type AS ENUM (
    'renewable_energy',
    'waste_management',
    'water_conservation',
    'green_building',
    'plantation',
    'carbon_neutrality',
    'plastic_free',
    'energy_audit',
    'other'
);


ALTER TYPE public.enum_green_initiatives_initiative_type OWNER TO postgres;

--
-- Name: enum_green_initiatives_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_green_initiatives_status AS ENUM (
    'ongoing',
    'completed'
);


ALTER TYPE public.enum_green_initiatives_status OWNER TO postgres;

--
-- Name: enum_hostel_allocations_mess_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_allocations_mess_type AS ENUM (
    'veg',
    'non_veg'
);


ALTER TYPE public.enum_hostel_allocations_mess_type OWNER TO postgres;

--
-- Name: enum_hostel_allocations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_allocations_status AS ENUM (
    'active',
    'checked_out',
    'cancelled'
);


ALTER TYPE public.enum_hostel_allocations_status OWNER TO postgres;

--
-- Name: enum_hostel_beds_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_beds_status AS ENUM (
    'available',
    'occupied',
    'maintenance'
);


ALTER TYPE public.enum_hostel_beds_status OWNER TO postgres;

--
-- Name: enum_hostel_buildings_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_buildings_status AS ENUM (
    'active',
    'inactive',
    'maintenance'
);


ALTER TYPE public.enum_hostel_buildings_status OWNER TO postgres;

--
-- Name: enum_hostel_buildings_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_buildings_type AS ENUM (
    'boys',
    'girls',
    'mixed'
);


ALTER TYPE public.enum_hostel_buildings_type OWNER TO postgres;

--
-- Name: enum_hostel_complaints_complaint_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_complaints_complaint_type AS ENUM (
    'electrical',
    'plumbing',
    'furniture',
    'cleanliness',
    'other'
);


ALTER TYPE public.enum_hostel_complaints_complaint_type OWNER TO postgres;

--
-- Name: enum_hostel_complaints_priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_complaints_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE public.enum_hostel_complaints_priority OWNER TO postgres;

--
-- Name: enum_hostel_complaints_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_complaints_status AS ENUM (
    'pending',
    'in_progress',
    'resolved',
    'closed'
);


ALTER TYPE public.enum_hostel_complaints_status OWNER TO postgres;

--
-- Name: enum_hostel_fee_structures_mess_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_fee_structures_mess_type AS ENUM (
    'veg',
    'non_veg'
);


ALTER TYPE public.enum_hostel_fee_structures_mess_type OWNER TO postgres;

--
-- Name: enum_hostel_fee_structures_room_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_fee_structures_room_type AS ENUM (
    'ac',
    'non_ac'
);


ALTER TYPE public.enum_hostel_fee_structures_room_type OWNER TO postgres;

--
-- Name: enum_hostel_fines_fine_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_fines_fine_type AS ENUM (
    'damage',
    'disciplinary',
    'late_payment',
    'curfew_violation',
    'other'
);


ALTER TYPE public.enum_hostel_fines_fine_type OWNER TO postgres;

--
-- Name: enum_hostel_fines_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_fines_status AS ENUM (
    'pending',
    'paid',
    'waived',
    'cancelled'
);


ALTER TYPE public.enum_hostel_fines_status OWNER TO postgres;

--
-- Name: enum_hostel_gate_passes_pass_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_gate_passes_pass_type AS ENUM (
    'day',
    'long'
);


ALTER TYPE public.enum_hostel_gate_passes_pass_type OWNER TO postgres;

--
-- Name: enum_hostel_gate_passes_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_gate_passes_status AS ENUM (
    'out',
    'returned',
    'late',
    'pending',
    'approved',
    'rejected',
    'cancelled'
);


ALTER TYPE public.enum_hostel_gate_passes_status OWNER TO postgres;

--
-- Name: enum_hostel_mess_fee_structures_mess_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_mess_fee_structures_mess_type AS ENUM (
    'veg',
    'non_veg'
);


ALTER TYPE public.enum_hostel_mess_fee_structures_mess_type OWNER TO postgres;

--
-- Name: enum_hostel_room_bills_bill_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_room_bills_bill_type AS ENUM (
    'electricity',
    'water',
    'maintenance',
    'internet',
    'cleaning',
    'other'
);


ALTER TYPE public.enum_hostel_room_bills_bill_type OWNER TO postgres;

--
-- Name: enum_hostel_room_bills_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_room_bills_status AS ENUM (
    'pending',
    'distributed',
    'cancelled'
);


ALTER TYPE public.enum_hostel_room_bills_status OWNER TO postgres;

--
-- Name: enum_hostel_rooms_room_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_rooms_room_type AS ENUM (
    'ac',
    'non_ac'
);


ALTER TYPE public.enum_hostel_rooms_room_type OWNER TO postgres;

--
-- Name: enum_hostel_rooms_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_hostel_rooms_status AS ENUM (
    'available',
    'occupied',
    'maintenance',
    'full'
);


ALTER TYPE public.enum_hostel_rooms_status OWNER TO postgres;

--
-- Name: enum_institution_budgets_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_institution_budgets_category AS ENUM (
    'infrastructure',
    'equipment',
    'library',
    'research',
    'faculty_development',
    'student_welfare',
    'maintenance',
    'administration',
    'other'
);


ALTER TYPE public.enum_institution_budgets_category OWNER TO postgres;

--
-- Name: enum_leave_requests_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_leave_requests_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.enum_leave_requests_status OWNER TO postgres;

--
-- Name: enum_mous_partner_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_mous_partner_type AS ENUM (
    'industry',
    'academic_national',
    'academic_international',
    'government',
    'ngo'
);


ALTER TYPE public.enum_mous_partner_type OWNER TO postgres;

--
-- Name: enum_mous_scope; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_mous_scope AS ENUM (
    'research',
    'student_exchange',
    'faculty_exchange',
    'internship',
    'consultancy',
    'joint_program'
);


ALTER TYPE public.enum_mous_scope OWNER TO postgres;

--
-- Name: enum_mous_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_mous_status AS ENUM (
    'active',
    'expired',
    'renewed',
    'terminated'
);


ALTER TYPE public.enum_mous_status OWNER TO postgres;

--
-- Name: enum_naac_infrastructure_facility_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_naac_infrastructure_facility_type AS ENUM (
    'classroom',
    'laboratory',
    'library',
    'ict_facility',
    'sports',
    'hostel',
    'cafeteria',
    'medical',
    'auditorium',
    'other'
);


ALTER TYPE public.enum_naac_infrastructure_facility_type OWNER TO postgres;

--
-- Name: enum_naac_infrastructure_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_naac_infrastructure_status AS ENUM (
    'functional',
    'under_maintenance',
    'non_functional'
);


ALTER TYPE public.enum_naac_infrastructure_status OWNER TO postgres;

--
-- Name: enum_nba_surveys_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_nba_surveys_type AS ENUM (
    'Exit',
    'Alumni',
    'Employer',
    'CourseEnd'
);


ALTER TYPE public.enum_nba_surveys_type OWNER TO postgres;

--
-- Name: enum_patents_patent_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_patents_patent_type AS ENUM (
    'design',
    'utility',
    'plant'
);


ALTER TYPE public.enum_patents_patent_type OWNER TO postgres;

--
-- Name: enum_patents_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_patents_status AS ENUM (
    'filed',
    'published',
    'granted',
    'licensed'
);


ALTER TYPE public.enum_patents_status OWNER TO postgres;

--
-- Name: enum_payslips_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_payslips_status AS ENUM (
    'draft',
    'published',
    'paid'
);


ALTER TYPE public.enum_payslips_status OWNER TO postgres;

--
-- Name: enum_programs_degree_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_programs_degree_type AS ENUM (
    'diploma',
    'undergraduate',
    'postgraduate',
    'doctoral'
);


ALTER TYPE public.enum_programs_degree_type OWNER TO postgres;

--
-- Name: enum_publications_publication_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_publications_publication_type AS ENUM (
    'journal',
    'conference',
    'book',
    'book_chapter'
);


ALTER TYPE public.enum_publications_publication_type OWNER TO postgres;

--
-- Name: enum_regulations_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_regulations_type AS ENUM (
    'semester',
    'year'
);


ALTER TYPE public.enum_regulations_type OWNER TO postgres;

--
-- Name: enum_research_projects_funding_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_research_projects_funding_type AS ENUM (
    'govt_national',
    'govt_state',
    'industry',
    'international',
    'internal'
);


ALTER TYPE public.enum_research_projects_funding_type OWNER TO postgres;

--
-- Name: enum_research_projects_project_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_research_projects_project_type AS ENUM (
    'major',
    'minor',
    'consultancy',
    'seed_grant'
);


ALTER TYPE public.enum_research_projects_project_type OWNER TO postgres;

--
-- Name: enum_research_projects_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_research_projects_status AS ENUM (
    'ongoing',
    'completed',
    'terminated'
);


ALTER TYPE public.enum_research_projects_status OWNER TO postgres;

--
-- Name: enum_rooms_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_rooms_type AS ENUM (
    'classroom',
    'lab',
    'seminar_hall',
    'staff_room',
    'auditorium',
    'utility'
);


ALTER TYPE public.enum_rooms_type OWNER TO postgres;

--
-- Name: enum_scholarship_schemes_scheme_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_scholarship_schemes_scheme_type AS ENUM (
    'govt_central',
    'govt_state',
    'institutional',
    'private',
    'merit_based',
    'need_based'
);


ALTER TYPE public.enum_scholarship_schemes_scheme_type OWNER TO postgres;

--
-- Name: enum_special_trips_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_special_trips_status AS ENUM (
    'pending',
    'approved',
    'completed',
    'cancelled'
);


ALTER TYPE public.enum_special_trips_status OWNER TO postgres;

--
-- Name: enum_staff_attendance_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_staff_attendance_status AS ENUM (
    'present',
    'absent',
    'leave',
    'half-day',
    'holiday'
);


ALTER TYPE public.enum_staff_attendance_status OWNER TO postgres;

--
-- Name: enum_student_awards_award_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_student_awards_award_type AS ENUM (
    'sports',
    'cultural',
    'academic',
    'research',
    'social_service',
    'other'
);


ALTER TYPE public.enum_student_awards_award_type OWNER TO postgres;

--
-- Name: enum_student_awards_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_student_awards_level AS ENUM (
    'international',
    'national',
    'state',
    'university',
    'college'
);


ALTER TYPE public.enum_student_awards_level OWNER TO postgres;

--
-- Name: enum_student_documents_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_student_documents_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.enum_student_documents_status OWNER TO postgres;

--
-- Name: enum_student_fee_charges_charge_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_student_fee_charges_charge_type AS ENUM (
    'hostel_bill',
    'transport_fee',
    'fine',
    'other',
    'exam_reverification',
    'exam_script_view',
    'exam_registration'
);


ALTER TYPE public.enum_student_fee_charges_charge_type OWNER TO postgres;

--
-- Name: enum_student_route_allocations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_student_route_allocations_status AS ENUM (
    'active',
    'suspended',
    'cancelled'
);


ALTER TYPE public.enum_student_route_allocations_status OWNER TO postgres;

--
-- Name: enum_timetable_slots_day_of_week; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_timetable_slots_day_of_week AS ENUM (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
);


ALTER TYPE public.enum_timetable_slots_day_of_week OWNER TO postgres;

--
-- Name: enum_transport_drivers_staff_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_transport_drivers_staff_type AS ENUM (
    'driver',
    'conductor',
    'helper'
);


ALTER TYPE public.enum_transport_drivers_staff_type OWNER TO postgres;

--
-- Name: enum_transport_vehicles_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_transport_vehicles_status AS ENUM (
    'active',
    'maintenance',
    'retired'
);


ALTER TYPE public.enum_transport_vehicles_status OWNER TO postgres;

--
-- Name: enum_transport_vehicles_vehicle_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_transport_vehicles_vehicle_type AS ENUM (
    'bus',
    'van',
    'minibus'
);


ALTER TYPE public.enum_transport_vehicles_vehicle_type OWNER TO postgres;

--
-- Name: enum_trip_logs_trip_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_trip_logs_trip_type AS ENUM (
    'regular_morning',
    'regular_evening',
    'special'
);


ALTER TYPE public.enum_trip_logs_trip_type OWNER TO postgres;

--
-- Name: enum_users_academic_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_academic_status AS ENUM (
    'active',
    'promoted',
    'detained',
    'semester_back',
    'graduated',
    'dropout'
);


ALTER TYPE public.enum_users_academic_status OWNER TO postgres;

--
-- Name: enum_users_admission_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_admission_type AS ENUM (
    'management',
    'convener'
);


ALTER TYPE public.enum_users_admission_type OWNER TO postgres;

--
-- Name: enum_users_gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_gender AS ENUM (
    'male',
    'female',
    'other'
);


ALTER TYPE public.enum_users_gender OWNER TO postgres;

--
-- Name: enum_vehicle_route_assignments_shift_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_vehicle_route_assignments_shift_type AS ENUM (
    'morning',
    'evening',
    'both'
);


ALTER TYPE public.enum_vehicle_route_assignments_shift_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admission_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admission_configs (
    id uuid NOT NULL,
    batch_year integer NOT NULL,
    university_code character varying(50) DEFAULT 'B11'::character varying NOT NULL,
    id_format character varying(255) DEFAULT '{YY}{UNIV}{BRANCH}{SEQ}'::character varying NOT NULL,
    temp_id_format character varying(255) DEFAULT 'T{YY}{SEQ}'::character varying NOT NULL,
    current_sequence integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    required_documents jsonb DEFAULT '[]'::jsonb NOT NULL,
    field_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    seat_matrix jsonb DEFAULT '{}'::jsonb NOT NULL,
    lateral_id_format character varying(255) DEFAULT 'L{YY}{UNIV}{BRANCH}{SEQ}'::character varying NOT NULL,
    program_sequences jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.admission_configs OWNER TO postgres;

--
-- Name: COLUMN admission_configs.batch_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.admission_configs.batch_year IS 'Academic year this config applies to';


--
-- Name: COLUMN admission_configs.university_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.admission_configs.university_code IS 'University code to be included in IDs';


--
-- Name: COLUMN admission_configs.id_format; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.admission_configs.id_format IS '{YY}=Year, {UNIV}=University Code, {BRANCH}=Program Code, {SEQ}=Sequence';


--
-- Name: COLUMN admission_configs.temp_id_format; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.admission_configs.temp_id_format IS 'Format for temporary IDs';


--
-- Name: COLUMN admission_configs.current_sequence; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.admission_configs.current_sequence IS 'Next available sequence number for this batch';


--
-- Name: COLUMN admission_configs.lateral_id_format; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.admission_configs.lateral_id_format IS 'Format for Lateral Entry IDs';


--
-- Name: COLUMN admission_configs.program_sequences; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.admission_configs.program_sequences IS 'Tracks current sequence number per program ID';


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    course_id uuid,
    date date NOT NULL,
    status public.enum_attendance_status DEFAULT 'present'::public.enum_attendance_status NOT NULL,
    remarks text,
    marked_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    timetable_slot_id uuid,
    batch_year integer,
    section character varying(255)
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: attendance_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance_settings (
    id uuid NOT NULL,
    weekly_off json DEFAULT '["Sunday"]'::json NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.attendance_settings OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    user_id uuid,
    action character varying(255) NOT NULL,
    entity_type character varying(255),
    entity_id character varying(255),
    details jsonb DEFAULT '{}'::jsonb,
    ip_address character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: blocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocks (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(20) NOT NULL,
    type public.enum_blocks_type DEFAULT 'academic'::public.enum_blocks_type,
    description text,
    total_floors integer DEFAULT 1,
    image_url character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.blocks OWNER TO postgres;

--
-- Name: book_issues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.book_issues (
    id uuid NOT NULL,
    book_id uuid NOT NULL,
    student_id uuid NOT NULL,
    issue_date timestamp with time zone NOT NULL,
    due_date timestamp with time zone NOT NULL,
    return_date timestamp with time zone,
    status public.enum_book_issues_status DEFAULT 'issued'::public.enum_book_issues_status,
    fine_amount numeric(10,2) DEFAULT 0,
    remarks text,
    issued_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.book_issues OWNER TO postgres;

--
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    id uuid NOT NULL,
    isbn character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    category character varying(255),
    publisher character varying(255),
    total_copies integer DEFAULT 1,
    available_copies integer DEFAULT 1,
    status public.enum_books_status DEFAULT 'available'::public.enum_books_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.books OWNER TO postgres;

--
-- Name: co_po_maps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.co_po_maps (
    id uuid NOT NULL,
    course_outcome_id uuid NOT NULL,
    program_outcome_id uuid NOT NULL,
    weightage integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.co_po_maps OWNER TO postgres;

--
-- Name: course_outcomes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_outcomes (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    co_code character varying(20) NOT NULL,
    description text NOT NULL,
    target_attainment numeric(5,2) DEFAULT 60,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.course_outcomes OWNER TO postgres;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id uuid NOT NULL,
    name character varying(200) NOT NULL,
    code character varying(20) NOT NULL,
    description text,
    credits integer DEFAULT 3 NOT NULL,
    course_type public.enum_courses_course_type DEFAULT 'theory'::public.enum_courses_course_type,
    department_id uuid NOT NULL,
    program_id uuid,
    semester integer,
    syllabus_url character varying(500),
    prerequisites jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    regulation_id uuid,
    syllabus_data jsonb DEFAULT '[]'::jsonb,
    is_elective boolean DEFAULT false
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: COLUMN courses.program_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.courses.program_id IS 'If null, course is common across programs';


--
-- Name: COLUMN courses.semester; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.courses.semester IS 'Which semester this course is offered in';


--
-- Name: COLUMN courses.syllabus_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.courses.syllabus_url IS 'S3 URL or file path to syllabus PDF';


--
-- Name: COLUMN courses.prerequisites; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.courses.prerequisites IS 'Array of course IDs that are prerequisites';


--
-- Name: COLUMN courses.is_elective; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.courses.is_elective IS 'Whether the course is an elective';


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id uuid NOT NULL,
    name character varying(200) NOT NULL,
    code character varying(20) NOT NULL,
    description text,
    hod_id uuid,
    parent_department_id uuid,
    email character varying(255),
    phone character varying(20),
    office_location character varying(200),
    is_active boolean DEFAULT true,
    established_date date,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    type public.enum_departments_type DEFAULT 'academic'::public.enum_departments_type NOT NULL,
    block_id uuid,
    room_id uuid
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: COLUMN departments.code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.departments.code IS 'e.g., CSE, EEE, MECH';


--
-- Name: COLUMN departments.hod_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.departments.hod_id IS 'Faculty assigned as HOD';


--
-- Name: exam_cycles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_cycles (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status public.enum_exam_cycles_status DEFAULT 'scheduled'::public.enum_exam_cycles_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    batch_year integer,
    semester integer,
    exam_type public.enum_exam_cycles_exam_type DEFAULT 'semester_end'::public.enum_exam_cycles_exam_type,
    weightage integer DEFAULT 0,
    regulation_id uuid,
    cycle_type character varying(50),
    instance_number integer DEFAULT 1,
    component_breakdown jsonb DEFAULT '[]'::jsonb,
    max_marks integer DEFAULT 100,
    passing_marks integer DEFAULT 35,
    reg_start_date date,
    reg_end_date date,
    reg_late_fee_date date,
    regular_fee numeric(10,2) DEFAULT 0,
    supply_fee_per_paper numeric(10,2) DEFAULT 0,
    late_fee_amount numeric(10,2) DEFAULT 0,
    is_attendance_checked boolean DEFAULT true,
    is_fee_checked boolean DEFAULT true,
    exam_mode character varying(50) DEFAULT 'regular'::character varying,
    attendance_condonation_threshold numeric(5,2) DEFAULT 75 NOT NULL,
    attendance_permission_threshold numeric(5,2) DEFAULT 65 NOT NULL,
    is_reverification_open boolean DEFAULT false NOT NULL,
    reverification_start_date date,
    reverification_end_date date,
    reverification_fee_per_paper numeric(10,2) DEFAULT 0 NOT NULL,
    is_script_view_enabled boolean DEFAULT false NOT NULL,
    script_view_fee numeric(10,2) DEFAULT 0 NOT NULL,
    exam_month character varying(20),
    exam_year integer,
    condonation_fee numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.exam_cycles OWNER TO postgres;

--
-- Name: COLUMN exam_cycles.weightage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_cycles.weightage IS 'Weightage percentage for this exam cycle towards final results (0-100)';


--
-- Name: COLUMN exam_cycles.regulation_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_cycles.regulation_id IS 'Links to regulation for exam structure configuration';


--
-- Name: COLUMN exam_cycles.cycle_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_cycles.cycle_type IS 'Type from regulation config: mid_term, end_semester, internal_lab, etc.';


--
-- Name: COLUMN exam_cycles.instance_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_cycles.instance_number IS '1st Mid, 2nd Mid, etc.';


--
-- Name: COLUMN exam_cycles.component_breakdown; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_cycles.component_breakdown IS 'Component structure copied from regulation: [{name, max_marks}]';


--
-- Name: COLUMN exam_cycles.exam_mode; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_cycles.exam_mode IS 'Selection for end_semester: regular, supplementary, combined';


--
-- Name: COLUMN exam_cycles.attendance_condonation_threshold; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_cycles.attendance_condonation_threshold IS 'Attendance percentage below which admin condonation is required';


--
-- Name: COLUMN exam_cycles.attendance_permission_threshold; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_cycles.attendance_permission_threshold IS 'Attendance percentage below which HOD permission is required in addition to condonation';


--
-- Name: COLUMN exam_cycles.exam_month; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_cycles.exam_month IS 'Month of the examination (e.g., Jan, Feb)';


--
-- Name: COLUMN exam_cycles.exam_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_cycles.exam_year IS 'Year of the examination (e.g., 2024)';


--
-- Name: COLUMN exam_cycles.condonation_fee; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_cycles.condonation_fee IS 'Fee charged for attendance condonation';


--
-- Name: exam_fee_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_fee_payments (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    exam_cycle_id uuid NOT NULL,
    category public.enum_exam_fee_payments_category NOT NULL,
    amount numeric(10,2) NOT NULL,
    transaction_id character varying(255),
    payment_method character varying(50) DEFAULT 'online'::character varying,
    status public.enum_exam_fee_payments_status DEFAULT 'completed'::public.enum_exam_fee_payments_status,
    payment_date timestamp with time zone,
    remarks text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.exam_fee_payments OWNER TO postgres;

--
-- Name: exam_marks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_marks (
    id uuid NOT NULL,
    exam_schedule_id uuid NOT NULL,
    student_id uuid NOT NULL,
    marks_obtained numeric(5,2),
    grade character varying(5),
    attendance_status public.enum_exam_marks_status DEFAULT 'present'::public.enum_exam_marks_status,
    remarks text,
    entered_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    moderation_status public.enum_exam_marks_moderation_status DEFAULT 'draft'::public.enum_exam_marks_moderation_status,
    moderation_history jsonb DEFAULT '[]'::jsonb,
    component_scores jsonb,
    is_reverified boolean DEFAULT false NOT NULL,
    reverification_count integer DEFAULT 0 NOT NULL,
    original_marks numeric(5,2),
    reverification_history jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.exam_marks OWNER TO postgres;

--
-- Name: COLUMN exam_marks.component_scores; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_marks.component_scores IS 'Component-wise scores: {assignment: 4, objective: 9, descriptive: 13}';


--
-- Name: exam_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_registrations (
    id uuid NOT NULL,
    exam_cycle_id uuid NOT NULL,
    student_id uuid NOT NULL,
    registered_subjects jsonb DEFAULT '[]'::jsonb,
    registration_type public.enum_exam_registrations_registration_type DEFAULT 'regular'::public.enum_exam_registrations_registration_type,
    fee_status public.enum_exam_registrations_fee_status DEFAULT 'pending'::public.enum_exam_registrations_fee_status,
    total_fee numeric(10,2) DEFAULT 0,
    paid_amount numeric(10,2) DEFAULT 0,
    late_fee_paid boolean DEFAULT false,
    is_fine_waived boolean DEFAULT false,
    attendance_status public.enum_exam_registrations_attendance_status DEFAULT 'clear'::public.enum_exam_registrations_attendance_status,
    attendance_percentage numeric(5,2),
    is_condoned boolean DEFAULT false,
    override_status boolean DEFAULT false,
    override_remarks text,
    status public.enum_exam_registrations_status DEFAULT 'draft'::public.enum_exam_registrations_status,
    hall_ticket_generated boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    has_permission boolean DEFAULT false NOT NULL
);


ALTER TABLE public.exam_registrations OWNER TO postgres;

--
-- Name: COLUMN exam_registrations.registered_subjects; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_registrations.registered_subjects IS 'Array of course IDs {course_id, type: ''regular''|''supply''}';


--
-- Name: COLUMN exam_registrations.has_permission; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_registrations.has_permission IS 'HOD permission granted for attendance <65%';


--
-- Name: exam_reverifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_reverifications (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    exam_schedule_id uuid NOT NULL,
    exam_mark_id uuid NOT NULL,
    original_marks numeric(5,2) NOT NULL,
    revised_marks numeric(5,2),
    status public.enum_exam_reverifications_status DEFAULT 'pending'::public.enum_exam_reverifications_status NOT NULL,
    payment_status public.enum_exam_reverifications_payment_status DEFAULT 'pending'::public.enum_exam_reverifications_payment_status NOT NULL,
    fee_charge_id uuid,
    reason text,
    remarks text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    original_grade character varying(5),
    revised_grade character varying(5),
    semester integer DEFAULT 1 NOT NULL,
    exam_fee_payment_id uuid
);


ALTER TABLE public.exam_reverifications OWNER TO postgres;

--
-- Name: COLUMN exam_reverifications.semester; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_reverifications.semester IS 'Semester for which reverification is requested';


--
-- Name: COLUMN exam_reverifications.exam_fee_payment_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_reverifications.exam_fee_payment_id IS 'Associated centralized exam fee payment';


--
-- Name: exam_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_schedules (
    id uuid NOT NULL,
    exam_cycle_id uuid NOT NULL,
    course_id uuid NOT NULL,
    exam_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    venue character varying(255),
    max_marks integer DEFAULT 100,
    passing_marks integer DEFAULT 35,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    branches jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.exam_schedules OWNER TO postgres;

--
-- Name: COLUMN exam_schedules.branches; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_schedules.branches IS 'Array of program IDs this exam schedule applies to';


--
-- Name: exam_scripts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_scripts (
    id uuid NOT NULL,
    exam_schedule_id uuid NOT NULL,
    student_id uuid NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer NOT NULL,
    uploaded_by uuid NOT NULL,
    uploaded_at timestamp with time zone NOT NULL,
    is_visible boolean DEFAULT false NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    last_viewed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.exam_scripts OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    expense_date date,
    category character varying(50) NOT NULL,
    vendor_id uuid,
    payment_mode public.enum_expenses_payment_mode DEFAULT 'cash'::public.enum_expenses_payment_mode,
    reference_number character varying(100),
    status public.enum_expenses_status DEFAULT 'pending'::public.enum_expenses_status,
    approved_by uuid,
    paid_by uuid,
    receipt_url character varying(500),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: fee_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_categories (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.fee_categories OWNER TO postgres;

--
-- Name: fee_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_payments (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    fee_structure_id uuid,
    amount_paid numeric(10,2) NOT NULL,
    payment_date timestamp with time zone,
    payment_method public.enum_fee_payments_payment_method DEFAULT 'online'::public.enum_fee_payments_payment_method,
    transaction_id character varying(255),
    status public.enum_fee_payments_status DEFAULT 'completed'::public.enum_fee_payments_status,
    receipt_url character varying(255),
    remarks text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    semester integer,
    fee_charge_id uuid
);


ALTER TABLE public.fee_payments OWNER TO postgres;

--
-- Name: COLUMN fee_payments.fee_charge_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fee_payments.fee_charge_id IS 'Reference to student fee charge being paid';


--
-- Name: fee_semester_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_semester_configs (
    id uuid NOT NULL,
    program_id uuid NOT NULL,
    batch_year integer NOT NULL,
    semester integer NOT NULL,
    due_date date,
    fine_type public.enum_fee_semester_configs_fine_type DEFAULT 'none'::public.enum_fee_semester_configs_fine_type,
    fine_amount numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.fee_semester_configs OWNER TO postgres;

--
-- Name: fee_structures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_structures (
    id uuid NOT NULL,
    category_id uuid NOT NULL,
    program_id uuid NOT NULL,
    semester integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    batch_year integer DEFAULT 2025 NOT NULL,
    is_optional boolean DEFAULT false,
    applies_to public.enum_fee_structures_applies_to DEFAULT 'all'::public.enum_fee_structures_applies_to,
    is_active boolean DEFAULT true,
    student_id uuid,
    academic_year character varying(20)
);


ALTER TABLE public.fee_structures OWNER TO postgres;

--
-- Name: COLUMN fee_structures.batch_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fee_structures.batch_year IS 'Admission year/batch for which this fee structure applies';


--
-- Name: COLUMN fee_structures.is_optional; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fee_structures.is_optional IS 'Whether this fee is optional (e.g., Hostel, Transport)';


--
-- Name: COLUMN fee_structures.applies_to; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fee_structures.applies_to IS 'Which type of students this fee applies to';


--
-- Name: COLUMN fee_structures.is_active; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fee_structures.is_active IS 'Whether this fee structure is currently active';


--
-- Name: COLUMN fee_structures.academic_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fee_structures.academic_year IS 'Academic year (e.g., 2024-2025)';


--
-- Name: fee_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_transactions (
    id uuid NOT NULL,
    transaction_number character varying(50) NOT NULL,
    student_id uuid NOT NULL,
    fee_structure_id uuid,
    amount_paid numeric(10,2) NOT NULL,
    payment_date date,
    payment_mode public.enum_fee_transactions_payment_mode DEFAULT 'cash'::public.enum_fee_transactions_payment_mode NOT NULL,
    reference_number character varying(100),
    bank_name character varying(100),
    payment_status public.enum_fee_transactions_payment_status DEFAULT 'success'::public.enum_fee_transactions_payment_status,
    is_jvd_transaction boolean DEFAULT false,
    jvd_quarter public.enum_fee_transactions_jvd_quarter,
    remarks text,
    collected_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.fee_transactions OWNER TO postgres;

--
-- Name: fee_waivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_waivers (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    fee_category_id uuid,
    waiver_type character varying(255),
    amount numeric(10,2) NOT NULL,
    is_approved boolean DEFAULT false,
    approved_at timestamp with time zone,
    approved_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    status public.enum_fee_waivers_status DEFAULT 'pending'::public.enum_fee_waivers_status,
    is_jvd boolean DEFAULT false,
    jvd_application_id character varying(50),
    academic_year character varying(20),
    applies_to character varying(255) DEFAULT 'one_time'::character varying NOT NULL,
    semester integer,
    value_type character varying(255) DEFAULT 'fixed'::character varying NOT NULL,
    percentage numeric(5,2),
    is_active boolean DEFAULT true
);


ALTER TABLE public.fee_waivers OWNER TO postgres;

--
-- Name: COLUMN fee_waivers.applies_to; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fee_waivers.applies_to IS 'all_semesters, specific_semester, one_time';


--
-- Name: COLUMN fee_waivers.value_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fee_waivers.value_type IS 'fixed, percentage';


--
-- Name: graduations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.graduations (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    application_date timestamp with time zone NOT NULL,
    graduation_date timestamp with time zone,
    final_cgpa numeric(3,2),
    academic_clearance boolean DEFAULT false,
    fee_clearance boolean DEFAULT false,
    library_clearance boolean DEFAULT false,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    approved_by uuid,
    remarks text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.graduations OWNER TO postgres;

--
-- Name: hall_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hall_tickets (
    id uuid NOT NULL,
    exam_cycle_id uuid NOT NULL,
    student_id uuid NOT NULL,
    ticket_number character varying(255),
    download_status boolean DEFAULT false,
    is_blocked boolean DEFAULT false,
    block_reason text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hall_tickets OWNER TO postgres;

--
-- Name: holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.holidays (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    date date NOT NULL,
    type character varying(50),
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    target character varying(50) DEFAULT 'staff'::character varying NOT NULL
);


ALTER TABLE public.holidays OWNER TO postgres;

--
-- Name: hostel_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_allocations (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    room_id uuid NOT NULL,
    bed_id uuid,
    fee_structure_id uuid,
    check_in_date timestamp with time zone NOT NULL,
    check_out_date timestamp with time zone,
    status public.enum_hostel_allocations_status DEFAULT 'active'::public.enum_hostel_allocations_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    mess_fee_structure_id uuid,
    rent_fee_id uuid,
    mess_fee_id uuid,
    semester integer,
    academic_year character varying(255),
    scheduled_checkout_semester integer,
    rent_fee_charge_id uuid,
    mess_fee_charge_id uuid
);


ALTER TABLE public.hostel_allocations OWNER TO postgres;

--
-- Name: COLUMN hostel_allocations.rent_fee_charge_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_allocations.rent_fee_charge_id IS 'Reference to student fee charge for hostel rent';


--
-- Name: COLUMN hostel_allocations.mess_fee_charge_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_allocations.mess_fee_charge_id IS 'Reference to student fee charge for hostel mess';


--
-- Name: hostel_attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_attendance (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    date date NOT NULL,
    is_present boolean DEFAULT true,
    night_roll_call boolean DEFAULT false,
    late_entry boolean DEFAULT false,
    late_entry_time time without time zone,
    remarks text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hostel_attendance OWNER TO postgres;

--
-- Name: hostel_beds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_beds (
    id uuid NOT NULL,
    room_id uuid NOT NULL,
    bed_number character varying(255) NOT NULL,
    status public.enum_hostel_beds_status DEFAULT 'available'::public.enum_hostel_beds_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hostel_beds OWNER TO postgres;

--
-- Name: hostel_buildings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_buildings (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type public.enum_hostel_buildings_type NOT NULL,
    total_floors integer DEFAULT 0 NOT NULL,
    total_rooms integer DEFAULT 0 NOT NULL,
    total_capacity integer DEFAULT 0 NOT NULL,
    address text,
    status public.enum_hostel_buildings_status DEFAULT 'active'::public.enum_hostel_buildings_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hostel_buildings OWNER TO postgres;

--
-- Name: hostel_complaints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_complaints (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    room_id uuid,
    complaint_type public.enum_hostel_complaints_complaint_type NOT NULL,
    description text NOT NULL,
    priority public.enum_hostel_complaints_priority DEFAULT 'medium'::public.enum_hostel_complaints_priority,
    status public.enum_hostel_complaints_status DEFAULT 'pending'::public.enum_hostel_complaints_status,
    assigned_to uuid,
    resolution_notes text,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hostel_complaints OWNER TO postgres;

--
-- Name: hostel_fee_structures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_fee_structures (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    room_type public.enum_hostel_fee_structures_room_type NOT NULL,
    base_amount numeric(10,2) NOT NULL,
    security_deposit numeric(10,2) DEFAULT 0,
    academic_year character varying(255),
    semester integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hostel_fee_structures OWNER TO postgres;

--
-- Name: COLUMN hostel_fee_structures.base_amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fee_structures.base_amount IS 'Monthly hostel fee';


--
-- Name: hostel_fines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_fines (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    allocation_id uuid,
    fine_type public.enum_hostel_fines_fine_type NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text NOT NULL,
    issued_date date NOT NULL,
    due_date date NOT NULL,
    status public.enum_hostel_fines_status DEFAULT 'pending'::public.enum_hostel_fines_status NOT NULL,
    issued_by uuid NOT NULL,
    fee_structure_id uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    fee_charge_id uuid
);


ALTER TABLE public.hostel_fines OWNER TO postgres;

--
-- Name: COLUMN hostel_fines.student_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fines.student_id IS 'Student who is fined';


--
-- Name: COLUMN hostel_fines.allocation_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fines.allocation_id IS 'Related hostel allocation';


--
-- Name: COLUMN hostel_fines.fine_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fines.fine_type IS 'Type of fine';


--
-- Name: COLUMN hostel_fines.amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fines.amount IS 'Fine amount in INR';


--
-- Name: COLUMN hostel_fines.reason; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fines.reason IS 'Detailed reason for the fine';


--
-- Name: COLUMN hostel_fines.issued_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fines.issued_date IS 'Date when fine was issued';


--
-- Name: COLUMN hostel_fines.due_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fines.due_date IS 'Payment due date';


--
-- Name: COLUMN hostel_fines.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fines.status IS 'Current status of the fine';


--
-- Name: COLUMN hostel_fines.issued_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fines.issued_by IS 'Admin/staff who issued the fine';


--
-- Name: COLUMN hostel_fines.fee_structure_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fines.fee_structure_id IS 'Linked fee structure entry';


--
-- Name: COLUMN hostel_fines.fee_charge_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_fines.fee_charge_id IS 'Reference to student fee charge for this fine';


--
-- Name: hostel_floors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_floors (
    id uuid NOT NULL,
    building_id uuid NOT NULL,
    floor_number integer NOT NULL,
    total_rooms integer DEFAULT 0,
    occupied_rooms integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hostel_floors OWNER TO postgres;

--
-- Name: hostel_gate_passes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_gate_passes (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    out_time timestamp with time zone,
    expected_return_time timestamp with time zone,
    actual_return_time timestamp with time zone,
    purpose character varying(255),
    destination character varying(255),
    status public.enum_hostel_gate_passes_status DEFAULT 'out'::public.enum_hostel_gate_passes_status,
    approved_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    going_date date,
    coming_date date,
    parent_otp character varying(255),
    is_otp_verified boolean DEFAULT false,
    attendance_synced boolean DEFAULT false,
    pass_type public.enum_hostel_gate_passes_pass_type DEFAULT 'long'::public.enum_hostel_gate_passes_pass_type NOT NULL,
    expected_out_time character varying(255),
    expected_in_time character varying(255)
);


ALTER TABLE public.hostel_gate_passes OWNER TO postgres;

--
-- Name: hostel_mess_fee_structures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_mess_fee_structures (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    mess_type public.enum_hostel_mess_fee_structures_mess_type NOT NULL,
    amount numeric(10,2) NOT NULL,
    academic_year character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hostel_mess_fee_structures OWNER TO postgres;

--
-- Name: hostel_room_bill_distributions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_room_bill_distributions (
    id uuid NOT NULL,
    room_bill_id uuid NOT NULL,
    student_id uuid NOT NULL,
    allocation_id uuid NOT NULL,
    share_amount numeric(10,2) NOT NULL,
    fee_structure_id uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    fee_charge_id uuid
);


ALTER TABLE public.hostel_room_bill_distributions OWNER TO postgres;

--
-- Name: COLUMN hostel_room_bill_distributions.room_bill_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bill_distributions.room_bill_id IS 'Related room bill';


--
-- Name: COLUMN hostel_room_bill_distributions.student_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bill_distributions.student_id IS 'Student who receives a share';


--
-- Name: COLUMN hostel_room_bill_distributions.allocation_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bill_distributions.allocation_id IS 'Related allocation record';


--
-- Name: COLUMN hostel_room_bill_distributions.share_amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bill_distributions.share_amount IS 'Student''s share of the bill in INR';


--
-- Name: COLUMN hostel_room_bill_distributions.fee_structure_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bill_distributions.fee_structure_id IS 'Linked fee structure entry';


--
-- Name: COLUMN hostel_room_bill_distributions.fee_charge_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bill_distributions.fee_charge_id IS 'Reference to student fee charge';


--
-- Name: hostel_room_bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_room_bills (
    id uuid NOT NULL,
    room_id uuid NOT NULL,
    bill_type public.enum_hostel_room_bills_bill_type NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    issue_date date NOT NULL,
    due_date date,
    description text,
    status public.enum_hostel_room_bills_status DEFAULT 'pending'::public.enum_hostel_room_bills_status NOT NULL,
    distributed_at timestamp with time zone,
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    billing_month integer NOT NULL,
    billing_year integer NOT NULL
);


ALTER TABLE public.hostel_room_bills OWNER TO postgres;

--
-- Name: COLUMN hostel_room_bills.room_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bills.room_id IS 'Room for which the bill is generated';


--
-- Name: COLUMN hostel_room_bills.bill_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bills.bill_type IS 'Type of utility bill';


--
-- Name: COLUMN hostel_room_bills.total_amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bills.total_amount IS 'Total bill amount in INR';


--
-- Name: COLUMN hostel_room_bills.issue_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bills.issue_date IS 'Date when bill was issued';


--
-- Name: COLUMN hostel_room_bills.due_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bills.due_date IS 'Payment due date (optional, usually paid with main fees)';


--
-- Name: COLUMN hostel_room_bills.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bills.description IS 'Additional details about the bill';


--
-- Name: COLUMN hostel_room_bills.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bills.status IS 'Bill status';


--
-- Name: COLUMN hostel_room_bills.distributed_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bills.distributed_at IS 'Timestamp when bill was distributed to students';


--
-- Name: COLUMN hostel_room_bills.created_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bills.created_by IS 'Admin/staff who created the bill';


--
-- Name: COLUMN hostel_room_bills.billing_month; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bills.billing_month IS 'Billing month (1-12)';


--
-- Name: COLUMN hostel_room_bills.billing_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_room_bills.billing_year IS 'Billing year';


--
-- Name: hostel_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_rooms (
    id uuid NOT NULL,
    building_id uuid NOT NULL,
    floor_id uuid NOT NULL,
    room_number character varying(255) NOT NULL,
    capacity integer NOT NULL,
    current_occupancy integer DEFAULT 0,
    room_type public.enum_hostel_rooms_room_type DEFAULT 'non_ac'::public.enum_hostel_rooms_room_type,
    amenities jsonb DEFAULT '{}'::jsonb,
    status public.enum_hostel_rooms_status DEFAULT 'available'::public.enum_hostel_rooms_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hostel_rooms OWNER TO postgres;

--
-- Name: COLUMN hostel_rooms.amenities; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.hostel_rooms.amenities IS 'JSON object: {attached_bathroom: true, balcony: false, etc.}';


--
-- Name: hostel_stay_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_stay_logs (
    id uuid NOT NULL,
    allocation_id uuid NOT NULL,
    student_id uuid NOT NULL,
    room_id uuid NOT NULL,
    bed_id uuid,
    check_in_date timestamp with time zone NOT NULL,
    check_out_date timestamp with time zone,
    semester integer NOT NULL,
    academic_year character varying(255) NOT NULL,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hostel_stay_logs OWNER TO postgres;

--
-- Name: hostel_visitors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostel_visitors (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    visitor_name character varying(255) NOT NULL,
    visitor_phone character varying(255),
    relationship character varying(255),
    purpose character varying(255),
    entry_time timestamp with time zone NOT NULL,
    exit_time timestamp with time zone,
    id_proof_type character varying(255),
    id_proof_number character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.hostel_visitors OWNER TO postgres;

--
-- Name: institution_budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.institution_budgets (
    id uuid NOT NULL,
    academic_year character varying(10) NOT NULL,
    department_id uuid,
    category public.enum_institution_budgets_category NOT NULL,
    budget_head character varying(255) NOT NULL,
    allocated_amount numeric(15,2) NOT NULL,
    spent_amount numeric(15,2) DEFAULT 0,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.institution_budgets OWNER TO postgres;

--
-- Name: institution_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.institution_settings (
    id uuid NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    current_admission_sequence integer DEFAULT 1 NOT NULL,
    admission_number_prefix character varying(255) DEFAULT 'ADM'::character varying NOT NULL
);


ALTER TABLE public.institution_settings OWNER TO postgres;

--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_balances (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    leave_type character varying(50) NOT NULL,
    year integer NOT NULL,
    total_credits double precision DEFAULT '0'::double precision,
    used double precision DEFAULT '0'::double precision,
    balance double precision DEFAULT '0'::double precision,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.leave_balances OWNER TO postgres;

--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_requests (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    leave_type character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text NOT NULL,
    status public.enum_leave_requests_status DEFAULT 'pending'::public.enum_leave_requests_status,
    reviewed_by uuid,
    review_remarks text,
    attachment_url character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    approver_id uuid,
    is_half_day boolean DEFAULT false
);


ALTER TABLE public.leave_requests OWNER TO postgres;

--
-- Name: payslips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payslips (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    total_earnings numeric(10,2) NOT NULL,
    total_deductions numeric(10,2) NOT NULL,
    net_salary numeric(10,2) NOT NULL,
    breakdown jsonb DEFAULT '{}'::jsonb,
    status public.enum_payslips_status DEFAULT 'draft'::public.enum_payslips_status,
    generated_date timestamp with time zone,
    payment_date date,
    transaction_ref character varying(255),
    pdf_url character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.payslips OWNER TO postgres;

--
-- Name: COLUMN payslips.breakdown; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.payslips.breakdown IS 'Detailed breakdown of earnings and deductions for this slip';


--
-- Name: COLUMN payslips.transaction_ref; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.payslips.transaction_ref IS 'Bank transaction reference number';


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    module character varying(50) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    description character varying(255)
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: COLUMN permissions.module; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.permissions.module IS 'Group like ''users'', ''departments'', ''analytics''';


--
-- Name: placements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.placements (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    company_name character varying(255) NOT NULL,
    designation character varying(100),
    package_lpa numeric(5,2),
    placement_date date,
    offer_letter_url character varying(500),
    is_on_campus boolean DEFAULT true,
    academic_year character varying(10),
    remarks text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.placements OWNER TO postgres;

--
-- Name: program_outcomes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.program_outcomes (
    id uuid NOT NULL,
    program_id uuid NOT NULL,
    po_code character varying(20) NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.program_outcomes OWNER TO postgres;

--
-- Name: programs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.programs (
    id uuid NOT NULL,
    name character varying(200) NOT NULL,
    code character varying(20) NOT NULL,
    description text,
    degree_type public.enum_programs_degree_type NOT NULL,
    duration_years integer NOT NULL,
    total_semesters integer NOT NULL,
    department_id uuid NOT NULL,
    min_percentage numeric(5,2),
    max_intake integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    is_cbcs boolean DEFAULT false,
    has_choice_based_credit boolean DEFAULT false,
    has_electives boolean DEFAULT false,
    has_skill_enhancement boolean DEFAULT false,
    has_value_added_courses boolean DEFAULT false,
    last_revision_year integer
);


ALTER TABLE public.programs OWNER TO postgres;

--
-- Name: COLUMN programs.duration_years; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.programs.duration_years IS 'Program duration in years';


--
-- Name: COLUMN programs.min_percentage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.programs.min_percentage IS 'Minimum percentage for admission';


--
-- Name: COLUMN programs.max_intake; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.programs.max_intake IS 'Maximum students per batch';


--
-- Name: COLUMN programs.is_cbcs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.programs.is_cbcs IS 'Whether Choice Based Credit System is implemented';


--
-- Name: COLUMN programs.has_choice_based_credit; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.programs.has_choice_based_credit IS 'Whether program offers choice-based credit system';


--
-- Name: COLUMN programs.has_electives; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.programs.has_electives IS 'Whether program has elective courses';


--
-- Name: COLUMN programs.has_skill_enhancement; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.programs.has_skill_enhancement IS 'Whether program has skill enhancement courses (SEC)';


--
-- Name: COLUMN programs.has_value_added_courses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.programs.has_value_added_courses IS 'Whether program offers value-added courses';


--
-- Name: COLUMN programs.last_revision_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.programs.last_revision_year IS 'Year of last curriculum revision';


--
-- Name: promotion_criteria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_criteria (
    id uuid NOT NULL,
    program_id uuid NOT NULL,
    from_semester integer NOT NULL,
    to_semester integer NOT NULL,
    min_attendance_percentage numeric(5,2) DEFAULT 75,
    min_cgpa numeric(3,2),
    max_backlogs_allowed integer DEFAULT 0,
    fee_clearance_required boolean DEFAULT true,
    library_clearance_required boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.promotion_criteria OWNER TO postgres;

--
-- Name: promotion_evaluations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_evaluations (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    from_semester integer NOT NULL,
    to_semester integer NOT NULL,
    evaluation_date timestamp with time zone NOT NULL,
    attendance_percentage numeric(5,2),
    attendance_met boolean,
    cgpa numeric(3,2),
    cgpa_met boolean,
    backlogs_count integer,
    backlogs_met boolean,
    fee_cleared boolean,
    overall_eligible boolean,
    final_status character varying(50),
    remarks text,
    processed_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.promotion_evaluations OWNER TO postgres;

--
-- Name: regulations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regulations (
    id uuid NOT NULL,
    name character varying(50) NOT NULL,
    academic_year character varying(20) NOT NULL,
    type public.enum_regulations_type DEFAULT 'semester'::public.enum_regulations_type NOT NULL,
    grading_system character varying(100) DEFAULT 'CBCS'::character varying,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    exam_structure jsonb DEFAULT '{}'::jsonb,
    grade_scale jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.regulations OWNER TO postgres;

--
-- Name: COLUMN regulations.exam_structure; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.regulations.exam_structure IS 'Defines exam types, components, and calculation formulas for this regulation';


--
-- Name: COLUMN regulations.grade_scale; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.regulations.grade_scale IS 'Array of grade mappings: [{grade, min, max, points}]';


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    field_config jsonb DEFAULT '{}'::jsonb,
    is_system boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: COLUMN roles.field_config; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.roles.field_config IS 'Stores visibility and requirement rules for user fields for this role';


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    id uuid NOT NULL,
    block_id uuid NOT NULL,
    room_number character varying(50) NOT NULL,
    name character varying(255),
    floor_number integer NOT NULL,
    type public.enum_rooms_type DEFAULT 'classroom'::public.enum_rooms_type,
    capacity integer DEFAULT 30,
    exam_capacity integer DEFAULT 15,
    seating_config jsonb,
    facilities jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: COLUMN rooms.capacity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.rooms.capacity IS 'Regular class capacity';


--
-- Name: COLUMN rooms.exam_capacity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.rooms.exam_capacity IS 'Spaced out seating capacity for exams';


--
-- Name: COLUMN rooms.seating_config; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.rooms.seating_config IS 'Grid configuration for auto-seating algorithms';


--
-- Name: salary_grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_grades (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    basic_salary numeric(10,2) NOT NULL,
    allowances jsonb DEFAULT '{}'::jsonb,
    deductions jsonb DEFAULT '{}'::jsonb,
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    leave_policy jsonb DEFAULT '[]'::jsonb,
    lop_config jsonb DEFAULT '{"basis": "basic", "deduction_factor": 1}'::jsonb
);


ALTER TABLE public.salary_grades OWNER TO postgres;

--
-- Name: COLUMN salary_grades.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.salary_grades.name IS 'e.g., Professor Grade A, Admin Level 2';


--
-- Name: COLUMN salary_grades.allowances; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.salary_grades.allowances IS 'Standard allowances for this grade';


--
-- Name: COLUMN salary_grades.deductions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.salary_grades.deductions IS 'Standard deductions for this grade';


--
-- Name: COLUMN salary_grades.leave_policy; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.salary_grades.leave_policy IS 'Leave entitlements: [{name, days, carry_forward}]';


--
-- Name: COLUMN salary_grades.lop_config; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.salary_grades.lop_config IS 'Loss of Pay rules: {basis: ''basic''|''gross'', deduction_factor: 1.0}';


--
-- Name: salary_structures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_structures (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    basic_salary numeric(10,2) DEFAULT 0 NOT NULL,
    hra numeric(10,2) DEFAULT 0,
    allowances jsonb DEFAULT '{}'::jsonb,
    deductions jsonb DEFAULT '{}'::jsonb,
    effective_from date,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    grade_id uuid
);


ALTER TABLE public.salary_structures OWNER TO postgres;

--
-- Name: COLUMN salary_structures.allowances; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.salary_structures.allowances IS 'Key-value pairs for other allowances';


--
-- Name: COLUMN salary_structures.deductions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.salary_structures.deductions IS 'Key-value pairs for fixed deductions like PF, Tax';


--
-- Name: scholarship_beneficiaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scholarship_beneficiaries (
    id uuid NOT NULL,
    scheme_id uuid NOT NULL,
    student_id uuid NOT NULL,
    department_id uuid,
    amount_sanctioned numeric(10,2) NOT NULL,
    amount_disbursed numeric(10,2) DEFAULT 0,
    sanctioned_date date,
    disbursed_date date,
    academic_year character varying(10) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.scholarship_beneficiaries OWNER TO postgres;

--
-- Name: scholarship_schemes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scholarship_schemes (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    scheme_type public.enum_scholarship_schemes_scheme_type NOT NULL,
    funding_agency character varying(255),
    eligibility_criteria text,
    amount_per_student numeric(10,2),
    caste_category character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.scholarship_schemes OWNER TO postgres;

--
-- Name: COLUMN scholarship_schemes.amount_per_student; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.scholarship_schemes.amount_per_student IS 'Average amount per student in INR';


--
-- Name: COLUMN scholarship_schemes.caste_category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.scholarship_schemes.caste_category IS 'SC, ST, BC-A, BC-B, BC-C, BC-D, BC-E, EWS, Minority';


--
-- Name: section_incharges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section_incharges (
    id uuid NOT NULL,
    faculty_id uuid NOT NULL,
    department_id uuid NOT NULL,
    program_id uuid NOT NULL,
    batch_year character varying(10) NOT NULL,
    section character varying(10) NOT NULL,
    academic_year character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    assigned_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.section_incharges OWNER TO postgres;

--
-- Name: semester_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.semester_results (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    semester integer NOT NULL,
    batch_year integer NOT NULL,
    sgpa numeric(4,2) NOT NULL,
    total_credits integer NOT NULL,
    earned_credits integer NOT NULL,
    exam_cycle_id uuid,
    published_at timestamp with time zone,
    published_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.semester_results OWNER TO postgres;

--
-- Name: sequelize_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sequelize_data (
    name character varying(255) NOT NULL
);


ALTER TABLE public.sequelize_data OWNER TO postgres;

--
-- Name: sequelize_meta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sequelize_meta (
    name character varying(255) NOT NULL
);


ALTER TABLE public.sequelize_meta OWNER TO postgres;

--
-- Name: special_trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.special_trips (
    id uuid NOT NULL,
    trip_name character varying(200) NOT NULL,
    trip_date date NOT NULL,
    vehicle_id uuid NOT NULL,
    driver_id uuid NOT NULL,
    destination character varying(200) NOT NULL,
    departure_time time without time zone NOT NULL,
    return_time time without time zone,
    purpose text,
    requested_by uuid,
    approved_by uuid,
    status public.enum_special_trips_status DEFAULT 'pending'::public.enum_special_trips_status,
    total_passengers integer DEFAULT 0,
    remarks text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.special_trips OWNER TO postgres;

--
-- Name: COLUMN special_trips.trip_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.special_trips.trip_name IS 'Trip purpose (e.g., Industrial Visit - CSE)';


--
-- Name: COLUMN special_trips.destination; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.special_trips.destination IS 'Destination location';


--
-- Name: COLUMN special_trips.return_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.special_trips.return_time IS 'Expected return time';


--
-- Name: COLUMN special_trips.purpose; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.special_trips.purpose IS 'Detailed purpose of the trip';


--
-- Name: COLUMN special_trips.requested_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.special_trips.requested_by IS 'User who requested the trip';


--
-- Name: COLUMN special_trips.approved_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.special_trips.approved_by IS 'Transport admin who approved';


--
-- Name: COLUMN special_trips.total_passengers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.special_trips.total_passengers IS 'Number of passengers';


--
-- Name: staff_attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_attendance (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    date date NOT NULL,
    status public.enum_staff_attendance_status DEFAULT 'present'::public.enum_staff_attendance_status NOT NULL,
    check_in_time time without time zone,
    check_out_time time without time zone,
    remarks text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.staff_attendance OWNER TO postgres;

--
-- Name: student_awards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_awards (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    department_id uuid,
    award_name character varying(500) NOT NULL,
    award_type public.enum_student_awards_award_type NOT NULL,
    level public.enum_student_awards_level NOT NULL,
    awarding_body character varying(255) NOT NULL,
    award_date date NOT NULL,
    "position" character varying(50),
    description text,
    academic_year character varying(10) NOT NULL,
    evidence_url character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.student_awards OWNER TO postgres;

--
-- Name: COLUMN student_awards."position"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_awards."position" IS 'e.g., 1st, 2nd, 3rd, Gold Medal';


--
-- Name: student_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_documents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    type character varying(100) NOT NULL,
    file_url character varying(500) NOT NULL,
    status public.enum_student_documents_status DEFAULT 'pending'::public.enum_student_documents_status,
    remarks text,
    verified_by uuid,
    verified_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.student_documents OWNER TO postgres;

--
-- Name: COLUMN student_documents.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_documents.name IS 'Document name e.g. 10th Marksheet, Aadhaar Card';


--
-- Name: COLUMN student_documents.type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_documents.type IS 'Document category';


--
-- Name: COLUMN student_documents.verified_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_documents.verified_by IS 'Staff/Admin who verified the document';


--
-- Name: student_fee_charges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_fee_charges (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    category_id uuid NOT NULL,
    charge_type public.enum_student_fee_charges_charge_type NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text,
    reference_id uuid,
    reference_type character varying(50),
    semester integer NOT NULL,
    academic_year character varying(20),
    is_paid boolean DEFAULT false,
    paid_at timestamp with time zone,
    payment_id uuid,
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.student_fee_charges OWNER TO postgres;

--
-- Name: COLUMN student_fee_charges.student_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.student_id IS 'Student who has this charge';


--
-- Name: COLUMN student_fee_charges.category_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.category_id IS 'Fee category (e.g., Hostel Electricity, Transport)';


--
-- Name: COLUMN student_fee_charges.charge_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.charge_type IS 'Type of individual charge';


--
-- Name: COLUMN student_fee_charges.amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.amount IS 'Charge amount';


--
-- Name: COLUMN student_fee_charges.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.description IS 'Detailed description of the charge';


--
-- Name: COLUMN student_fee_charges.reference_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.reference_id IS 'ID of the source record (e.g., hostel_room_bill.id)';


--
-- Name: COLUMN student_fee_charges.reference_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.reference_type IS 'Type of source record (e.g., hostel_room_bill)';


--
-- Name: COLUMN student_fee_charges.semester; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.semester IS 'Semester when charge was created';


--
-- Name: COLUMN student_fee_charges.academic_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.academic_year IS 'Academic year (e.g., 2024-2025)';


--
-- Name: COLUMN student_fee_charges.is_paid; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.is_paid IS 'Whether this charge has been paid';


--
-- Name: COLUMN student_fee_charges.paid_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.paid_at IS 'When the charge was paid';


--
-- Name: COLUMN student_fee_charges.payment_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.payment_id IS 'Fee payment that settled this charge';


--
-- Name: COLUMN student_fee_charges.created_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_fee_charges.created_by IS 'Admin/staff who created the charge';


--
-- Name: student_route_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_route_allocations (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    route_id uuid NOT NULL,
    stop_id uuid NOT NULL,
    academic_year character varying(20),
    semester integer,
    status public.enum_student_route_allocations_status DEFAULT 'active'::public.enum_student_route_allocations_status,
    allocated_date date,
    fee_structure_id uuid,
    remarks text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    fee_charge_id uuid
);


ALTER TABLE public.student_route_allocations OWNER TO postgres;

--
-- Name: COLUMN student_route_allocations.student_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_route_allocations.student_id IS 'Student allocated to transport';


--
-- Name: COLUMN student_route_allocations.stop_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_route_allocations.stop_id IS 'Pickup/drop stop';


--
-- Name: COLUMN student_route_allocations.academic_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_route_allocations.academic_year IS 'Academic year (e.g., 2024-2025) - optional';


--
-- Name: COLUMN student_route_allocations.semester; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_route_allocations.semester IS 'Semester number';


--
-- Name: COLUMN student_route_allocations.fee_structure_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_route_allocations.fee_structure_id IS 'Linked fee structure entry for transport fee';


--
-- Name: COLUMN student_route_allocations.remarks; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_route_allocations.remarks IS 'Additional notes';


--
-- Name: COLUMN student_route_allocations.fee_charge_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.student_route_allocations.fee_charge_id IS 'Reference to student fee charge for transport fee';


--
-- Name: timetable_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timetable_slots (
    id uuid NOT NULL,
    timetable_id uuid NOT NULL,
    course_id uuid NOT NULL,
    faculty_id uuid NOT NULL,
    day_of_week public.enum_timetable_slots_day_of_week NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    room_number character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    block_id uuid,
    room_id uuid,
    activity_name character varying(255)
);


ALTER TABLE public.timetable_slots OWNER TO postgres;

--
-- Name: COLUMN timetable_slots.activity_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.timetable_slots.activity_name IS 'For non-course activities like ''Coding Training'', ''Sports'', etc.';


--
-- Name: timetables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timetables (
    id uuid NOT NULL,
    program_id uuid NOT NULL,
    semester integer NOT NULL,
    academic_year character varying(255) NOT NULL,
    section character varying(255),
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.timetables OWNER TO postgres;

--
-- Name: transport_drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transport_drivers (
    id uuid NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(255),
    driver_license_number character varying(50),
    license_expiry date,
    address text,
    date_of_birth date,
    date_of_joining date,
    staff_type public.enum_transport_drivers_staff_type DEFAULT 'driver'::public.enum_transport_drivers_staff_type NOT NULL,
    emergency_contact_name character varying(100),
    emergency_contact_phone character varying(20),
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.transport_drivers OWNER TO postgres;

--
-- Name: COLUMN transport_drivers.driver_license_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_drivers.driver_license_number IS 'Driving license number';


--
-- Name: COLUMN transport_drivers.license_expiry; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_drivers.license_expiry IS 'License expiry date';


--
-- Name: COLUMN transport_drivers.address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_drivers.address IS 'Residential address';


--
-- Name: COLUMN transport_drivers.date_of_joining; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_drivers.date_of_joining IS 'Date of joining as transport staff';


--
-- Name: COLUMN transport_drivers.staff_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_drivers.staff_type IS 'Type of transport staff';


--
-- Name: COLUMN transport_drivers.emergency_contact_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_drivers.emergency_contact_name IS 'Emergency contact person name';


--
-- Name: COLUMN transport_drivers.emergency_contact_phone; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_drivers.emergency_contact_phone IS 'Emergency contact phone';


--
-- Name: COLUMN transport_drivers.is_verified; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_drivers.is_verified IS 'Background verification status';


--
-- Name: transport_routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transport_routes (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    route_code character varying(20) NOT NULL,
    distance_km numeric(10,2) NOT NULL,
    start_location character varying(200) NOT NULL,
    end_location character varying(200) DEFAULT 'University Campus'::character varying NOT NULL,
    description text,
    morning_start_time time without time zone,
    evening_start_time time without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.transport_routes OWNER TO postgres;

--
-- Name: COLUMN transport_routes.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_routes.name IS 'Route name (e.g., Route 1 - Kakinada)';


--
-- Name: COLUMN transport_routes.route_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_routes.route_code IS 'Unique route code (e.g., R001)';


--
-- Name: COLUMN transport_routes.distance_km; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_routes.distance_km IS 'Total distance in kilometers';


--
-- Name: COLUMN transport_routes.start_location; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_routes.start_location IS 'Starting point of the route';


--
-- Name: COLUMN transport_routes.end_location; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_routes.end_location IS 'Ending point (usually university)';


--
-- Name: COLUMN transport_routes.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_routes.description IS 'Additional route details';


--
-- Name: COLUMN transport_routes.morning_start_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_routes.morning_start_time IS 'Morning trip start time';


--
-- Name: COLUMN transport_routes.evening_start_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_routes.evening_start_time IS 'Evening trip start time';


--
-- Name: COLUMN transport_routes.is_active; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_routes.is_active IS 'Whether route is currently operational';


--
-- Name: transport_stops; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transport_stops (
    id uuid NOT NULL,
    route_id uuid NOT NULL,
    stop_name character varying(200) NOT NULL,
    stop_sequence integer NOT NULL,
    distance_from_start_km numeric(10,2),
    zone_fee numeric(10,2) NOT NULL,
    morning_pickup_time time without time zone,
    evening_drop_time time without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.transport_stops OWNER TO postgres;

--
-- Name: COLUMN transport_stops.stop_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_stops.stop_name IS 'Name of the stop (e.g., Gandhinagar Circle)';


--
-- Name: COLUMN transport_stops.stop_sequence; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_stops.stop_sequence IS 'Order of stop on the route (1, 2, 3...)';


--
-- Name: COLUMN transport_stops.distance_from_start_km; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_stops.distance_from_start_km IS 'Distance from route start in km';


--
-- Name: COLUMN transport_stops.zone_fee; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_stops.zone_fee IS 'Transport fee for this stop/zone';


--
-- Name: COLUMN transport_stops.morning_pickup_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_stops.morning_pickup_time IS 'Estimated morning pickup time';


--
-- Name: COLUMN transport_stops.evening_drop_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_stops.evening_drop_time IS 'Estimated evening drop time';


--
-- Name: COLUMN transport_stops.is_active; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_stops.is_active IS 'Whether stop is currently in use';


--
-- Name: transport_vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transport_vehicles (
    id uuid NOT NULL,
    registration_number character varying(50) NOT NULL,
    vehicle_type public.enum_transport_vehicles_vehicle_type DEFAULT 'bus'::public.enum_transport_vehicles_vehicle_type NOT NULL,
    seating_capacity integer NOT NULL,
    make_model character varying(100),
    year_of_manufacture integer,
    insurance_number character varying(100),
    insurance_expiry date,
    fitness_certificate_expiry date,
    rc_book_number character varying(100),
    current_mileage numeric(10,2) DEFAULT 0,
    status public.enum_transport_vehicles_status DEFAULT 'active'::public.enum_transport_vehicles_status,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.transport_vehicles OWNER TO postgres;

--
-- Name: COLUMN transport_vehicles.registration_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_vehicles.registration_number IS 'Vehicle registration number';


--
-- Name: COLUMN transport_vehicles.seating_capacity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_vehicles.seating_capacity IS 'Total seats available';


--
-- Name: COLUMN transport_vehicles.make_model; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_vehicles.make_model IS 'Manufacturer and model (e.g., Tata Starbus)';


--
-- Name: COLUMN transport_vehicles.year_of_manufacture; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_vehicles.year_of_manufacture IS 'Manufacturing year';


--
-- Name: COLUMN transport_vehicles.insurance_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_vehicles.insurance_number IS 'Insurance policy number';


--
-- Name: COLUMN transport_vehicles.insurance_expiry; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_vehicles.insurance_expiry IS 'Insurance expiry date';


--
-- Name: COLUMN transport_vehicles.fitness_certificate_expiry; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_vehicles.fitness_certificate_expiry IS 'Fitness certificate expiry date';


--
-- Name: COLUMN transport_vehicles.rc_book_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_vehicles.rc_book_number IS 'Registration certificate number';


--
-- Name: COLUMN transport_vehicles.current_mileage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_vehicles.current_mileage IS 'Current odometer reading in km';


--
-- Name: COLUMN transport_vehicles.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transport_vehicles.status IS 'Operational status';


--
-- Name: trip_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_logs (
    id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    route_id uuid,
    driver_id uuid NOT NULL,
    trip_type public.enum_trip_logs_trip_type DEFAULT 'regular_morning'::public.enum_trip_logs_trip_type NOT NULL,
    trip_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone,
    start_mileage numeric(10,2),
    end_mileage numeric(10,2),
    distance_covered numeric(10,2),
    fuel_consumed numeric(10,2),
    students_transported integer DEFAULT 0,
    remarks text,
    logged_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.trip_logs OWNER TO postgres;

--
-- Name: COLUMN trip_logs.route_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_logs.route_id IS 'Route covered (nullable for special trips)';


--
-- Name: COLUMN trip_logs.start_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_logs.start_time IS 'Actual start time';


--
-- Name: COLUMN trip_logs.end_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_logs.end_time IS 'Actual end time';


--
-- Name: COLUMN trip_logs.start_mileage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_logs.start_mileage IS 'Odometer at start';


--
-- Name: COLUMN trip_logs.end_mileage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_logs.end_mileage IS 'Odometer at end';


--
-- Name: COLUMN trip_logs.distance_covered; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_logs.distance_covered IS 'Calculated distance in km';


--
-- Name: COLUMN trip_logs.fuel_consumed; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_logs.fuel_consumed IS 'Fuel consumption in liters';


--
-- Name: COLUMN trip_logs.students_transported; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_logs.students_transported IS 'Number of students';


--
-- Name: COLUMN trip_logs.remarks; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_logs.remarks IS 'Any incidents or notes';


--
-- Name: COLUMN trip_logs.logged_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_logs.logged_by IS 'User who logged (driver or admin)';


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    password_hash character varying(255) NOT NULL,
    role character varying(255) DEFAULT 'student'::character varying,
    employee_id character varying(50),
    student_id character varying(50),
    department_id uuid,
    program_id uuid,
    batch_year integer,
    current_semester integer,
    academic_status public.enum_users_academic_status DEFAULT 'active'::public.enum_users_academic_status,
    date_of_birth date,
    gender public.enum_users_gender,
    address text,
    city character varying(100),
    state character varying(100),
    zip_code character varying(20),
    profile_picture character varying(500),
    bio text,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    email_verified_at timestamp with time zone,
    last_login timestamp with time zone,
    password_reset_token character varying(255),
    password_reset_expires timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    religion character varying(50),
    caste character varying(50),
    nationality character varying(50) DEFAULT 'Indian'::character varying,
    aadhaar_number character varying(20),
    passport_number character varying(20),
    joining_date date,
    admission_number character varying(50),
    parent_details jsonb DEFAULT '{}'::jsonb,
    previous_academics jsonb DEFAULT '[]'::jsonb,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    role_id uuid,
    bank_details jsonb DEFAULT '{}'::jsonb,
    admission_date date,
    is_hosteller boolean DEFAULT false,
    requires_transport boolean DEFAULT false,
    admission_type public.enum_users_admission_type,
    section character varying(10),
    is_lateral boolean DEFAULT false,
    is_temporary_id boolean DEFAULT false,
    biometric_device_id character varying(50),
    salary_grade_id uuid,
    regulation_id uuid,
    pan_number character varying(20),
    designation character varying(100)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.employee_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.employee_id IS 'For faculty/staff';


--
-- Name: COLUMN users.student_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.student_id IS 'For students';


--
-- Name: COLUMN users.program_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.program_id IS 'For students - their enrolled program';


--
-- Name: COLUMN users.batch_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.batch_year IS 'Year of admission for students';


--
-- Name: COLUMN users.current_semester; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.current_semester IS 'Current semester for students';


--
-- Name: COLUMN users.profile_picture; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.profile_picture IS 'S3 URL or file path';


--
-- Name: COLUMN users.parent_details; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.parent_details IS 'Stores guardian_type, names, jobs, income, emails, and mobile for family';


--
-- Name: COLUMN users.previous_academics; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.previous_academics IS 'Stores academic history as array of objects';


--
-- Name: COLUMN users.custom_fields; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.custom_fields IS 'Store dynamic fields added by admin';


--
-- Name: COLUMN users.bank_details; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.bank_details IS 'Stores bank name, account number, IFSC, branch, and holder name';


--
-- Name: COLUMN users.admission_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.admission_date IS 'Date of admission for students';


--
-- Name: COLUMN users.is_hosteller; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.is_hosteller IS 'Whether student is a hosteller';


--
-- Name: COLUMN users.requires_transport; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.requires_transport IS 'Whether student requires transport facility';


--
-- Name: COLUMN users.admission_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.admission_type IS 'Type of admission for students';


--
-- Name: COLUMN users.section; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.section IS 'Section for students (e.g. A, B, C)';


--
-- Name: COLUMN users.is_lateral; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.is_lateral IS 'Flag for Lateral Entry students';


--
-- Name: COLUMN users.is_temporary_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.is_temporary_id IS 'Flag indicating if the current ID is temporary';


--
-- Name: COLUMN users.biometric_device_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.biometric_device_id IS 'ID used in the physical biometrics device';


--
-- Name: COLUMN users.designation; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.designation IS 'Job title or designation of the employee';


--
-- Name: vehicle_route_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_route_assignments (
    id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    route_id uuid NOT NULL,
    driver_id uuid NOT NULL,
    conductor_id uuid,
    shift_type public.enum_vehicle_route_assignments_shift_type DEFAULT 'both'::public.enum_vehicle_route_assignments_shift_type NOT NULL,
    assigned_from date NOT NULL,
    assigned_to date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.vehicle_route_assignments OWNER TO postgres;

--
-- Name: COLUMN vehicle_route_assignments.driver_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vehicle_route_assignments.driver_id IS 'Primary driver for this route';


--
-- Name: COLUMN vehicle_route_assignments.conductor_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vehicle_route_assignments.conductor_id IS 'Conductor/helper (optional)';


--
-- Name: COLUMN vehicle_route_assignments.shift_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vehicle_route_assignments.shift_type IS 'Which shift this assignment covers';


--
-- Name: COLUMN vehicle_route_assignments.assigned_from; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vehicle_route_assignments.assigned_from IS 'Assignment start date';


--
-- Name: COLUMN vehicle_route_assignments.assigned_to; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vehicle_route_assignments.assigned_to IS 'Assignment end date (null if ongoing)';


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    contact_person character varying(100),
    phone character varying(20),
    email character varying(100),
    address text,
    gst_number character varying(20),
    pan_number character varying(20),
    bank_details jsonb,
    category character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: admission_configs admission_configs_batch_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admission_configs
    ADD CONSTRAINT admission_configs_batch_year_key UNIQUE (batch_year);


--
-- Name: admission_configs admission_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admission_configs
    ADD CONSTRAINT admission_configs_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: attendance_settings attendance_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_settings
    ADD CONSTRAINT attendance_settings_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_code_key UNIQUE (code);


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- Name: book_issues book_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_issues
    ADD CONSTRAINT book_issues_pkey PRIMARY KEY (id);


--
-- Name: books books_isbn_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_isbn_key UNIQUE (isbn);


--
-- Name: books books_isbn_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_isbn_key1 UNIQUE (isbn);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: co_po_maps co_po_maps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.co_po_maps
    ADD CONSTRAINT co_po_maps_pkey PRIMARY KEY (id);


--
-- Name: course_outcomes course_outcomes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_outcomes
    ADD CONSTRAINT course_outcomes_pkey PRIMARY KEY (id);


--
-- Name: courses courses_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_code_key UNIQUE (code);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_name_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key1 UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: exam_cycles exam_cycles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_cycles
    ADD CONSTRAINT exam_cycles_pkey PRIMARY KEY (id);


--
-- Name: exam_fee_payments exam_fee_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_fee_payments
    ADD CONSTRAINT exam_fee_payments_pkey PRIMARY KEY (id);


--
-- Name: exam_marks exam_marks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_pkey PRIMARY KEY (id);


--
-- Name: exam_registrations exam_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_registrations
    ADD CONSTRAINT exam_registrations_pkey PRIMARY KEY (id);


--
-- Name: exam_reverifications exam_reverifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_pkey PRIMARY KEY (id);


--
-- Name: exam_schedules exam_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_schedules
    ADD CONSTRAINT exam_schedules_pkey PRIMARY KEY (id);


--
-- Name: exam_scripts exam_scripts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_scripts
    ADD CONSTRAINT exam_scripts_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: fee_categories fee_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_categories
    ADD CONSTRAINT fee_categories_pkey PRIMARY KEY (id);


--
-- Name: fee_payments fee_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fee_payments_pkey PRIMARY KEY (id);


--
-- Name: fee_semester_configs fee_semester_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_semester_configs
    ADD CONSTRAINT fee_semester_configs_pkey PRIMARY KEY (id);


--
-- Name: fee_structures fee_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_pkey PRIMARY KEY (id);


--
-- Name: fee_transactions fee_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_transactions
    ADD CONSTRAINT fee_transactions_pkey PRIMARY KEY (id);


--
-- Name: fee_transactions fee_transactions_transaction_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_transactions
    ADD CONSTRAINT fee_transactions_transaction_number_key UNIQUE (transaction_number);


--
-- Name: fee_waivers fee_waivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_waivers
    ADD CONSTRAINT fee_waivers_pkey PRIMARY KEY (id);


--
-- Name: graduations graduations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.graduations
    ADD CONSTRAINT graduations_pkey PRIMARY KEY (id);


--
-- Name: hall_tickets hall_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hall_tickets
    ADD CONSTRAINT hall_tickets_pkey PRIMARY KEY (id);


--
-- Name: hall_tickets hall_tickets_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hall_tickets
    ADD CONSTRAINT hall_tickets_ticket_number_key UNIQUE (ticket_number);


--
-- Name: hall_tickets hall_tickets_ticket_number_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hall_tickets
    ADD CONSTRAINT hall_tickets_ticket_number_key1 UNIQUE (ticket_number);


--
-- Name: holidays holidays_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_date_key UNIQUE (date);


--
-- Name: holidays holidays_date_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_date_key1 UNIQUE (date);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: hostel_allocations hostel_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_pkey PRIMARY KEY (id);


--
-- Name: hostel_attendance hostel_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_attendance
    ADD CONSTRAINT hostel_attendance_pkey PRIMARY KEY (id);


--
-- Name: hostel_beds hostel_beds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_beds
    ADD CONSTRAINT hostel_beds_pkey PRIMARY KEY (id);


--
-- Name: hostel_buildings hostel_buildings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_buildings
    ADD CONSTRAINT hostel_buildings_pkey PRIMARY KEY (id);


--
-- Name: hostel_complaints hostel_complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_complaints
    ADD CONSTRAINT hostel_complaints_pkey PRIMARY KEY (id);


--
-- Name: hostel_fee_structures hostel_fee_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_fee_structures
    ADD CONSTRAINT hostel_fee_structures_pkey PRIMARY KEY (id);


--
-- Name: hostel_fines hostel_fines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_pkey PRIMARY KEY (id);


--
-- Name: hostel_floors hostel_floors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_floors
    ADD CONSTRAINT hostel_floors_pkey PRIMARY KEY (id);


--
-- Name: hostel_gate_passes hostel_gate_passes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_gate_passes
    ADD CONSTRAINT hostel_gate_passes_pkey PRIMARY KEY (id);


--
-- Name: hostel_mess_fee_structures hostel_mess_fee_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_mess_fee_structures
    ADD CONSTRAINT hostel_mess_fee_structures_pkey PRIMARY KEY (id);


--
-- Name: hostel_room_bill_distributions hostel_room_bill_distributions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_pkey PRIMARY KEY (id);


--
-- Name: hostel_room_bills hostel_room_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_room_bills
    ADD CONSTRAINT hostel_room_bills_pkey PRIMARY KEY (id);


--
-- Name: hostel_rooms hostel_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_rooms
    ADD CONSTRAINT hostel_rooms_pkey PRIMARY KEY (id);


--
-- Name: hostel_stay_logs hostel_stay_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_stay_logs
    ADD CONSTRAINT hostel_stay_logs_pkey PRIMARY KEY (id);


--
-- Name: hostel_visitors hostel_visitors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_visitors
    ADD CONSTRAINT hostel_visitors_pkey PRIMARY KEY (id);


--
-- Name: institution_budgets institution_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_budgets
    ADD CONSTRAINT institution_budgets_pkey PRIMARY KEY (id);


--
-- Name: institution_settings institution_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_settings
    ADD CONSTRAINT institution_settings_pkey PRIMARY KEY (id);


--
-- Name: institution_settings institution_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_settings
    ADD CONSTRAINT institution_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: payslips payslips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_name_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key1 UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_slug_key UNIQUE (slug);


--
-- Name: permissions permissions_slug_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_slug_key1 UNIQUE (slug);


--
-- Name: placements placements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_pkey PRIMARY KEY (id);


--
-- Name: program_outcomes program_outcomes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_outcomes
    ADD CONSTRAINT program_outcomes_pkey PRIMARY KEY (id);


--
-- Name: programs programs_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_code_key UNIQUE (code);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- Name: promotion_criteria promotion_criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_criteria
    ADD CONSTRAINT promotion_criteria_pkey PRIMARY KEY (id);


--
-- Name: promotion_evaluations promotion_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_evaluations
    ADD CONSTRAINT promotion_evaluations_pkey PRIMARY KEY (id);


--
-- Name: regulations regulations_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regulations
    ADD CONSTRAINT regulations_name_key UNIQUE (name);


--
-- Name: regulations regulations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regulations
    ADD CONSTRAINT regulations_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_name_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key1 UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_slug_key UNIQUE (slug);


--
-- Name: roles roles_slug_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_slug_key1 UNIQUE (slug);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: salary_grades salary_grades_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_grades
    ADD CONSTRAINT salary_grades_name_key UNIQUE (name);


--
-- Name: salary_grades salary_grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_grades
    ADD CONSTRAINT salary_grades_pkey PRIMARY KEY (id);


--
-- Name: salary_structures salary_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_pkey PRIMARY KEY (id);


--
-- Name: salary_structures salary_structures_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_user_id_key UNIQUE (user_id);


--
-- Name: scholarship_beneficiaries scholarship_beneficiaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarship_beneficiaries
    ADD CONSTRAINT scholarship_beneficiaries_pkey PRIMARY KEY (id);


--
-- Name: scholarship_schemes scholarship_schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarship_schemes
    ADD CONSTRAINT scholarship_schemes_pkey PRIMARY KEY (id);


--
-- Name: section_incharges section_incharges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT section_incharges_pkey PRIMARY KEY (id);


--
-- Name: semester_results semester_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semester_results
    ADD CONSTRAINT semester_results_pkey PRIMARY KEY (id);


--
-- Name: sequelize_data sequelize_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sequelize_data
    ADD CONSTRAINT sequelize_data_pkey PRIMARY KEY (name);


--
-- Name: sequelize_meta sequelize_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sequelize_meta
    ADD CONSTRAINT sequelize_meta_pkey PRIMARY KEY (name);


--
-- Name: special_trips special_trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_trips
    ADD CONSTRAINT special_trips_pkey PRIMARY KEY (id);


--
-- Name: staff_attendance staff_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_attendance
    ADD CONSTRAINT staff_attendance_pkey PRIMARY KEY (id);


--
-- Name: student_awards student_awards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_awards
    ADD CONSTRAINT student_awards_pkey PRIMARY KEY (id);


--
-- Name: student_documents student_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_pkey PRIMARY KEY (id);


--
-- Name: student_fee_charges student_fee_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT student_fee_charges_pkey PRIMARY KEY (id);


--
-- Name: student_route_allocations student_route_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_pkey PRIMARY KEY (id);


--
-- Name: timetable_slots timetable_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_pkey PRIMARY KEY (id);


--
-- Name: timetables timetables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_pkey PRIMARY KEY (id);


--
-- Name: transport_drivers transport_drivers_driver_license_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_drivers
    ADD CONSTRAINT transport_drivers_driver_license_number_key UNIQUE (driver_license_number);


--
-- Name: transport_drivers transport_drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_drivers
    ADD CONSTRAINT transport_drivers_pkey PRIMARY KEY (id);


--
-- Name: transport_routes transport_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_routes
    ADD CONSTRAINT transport_routes_pkey PRIMARY KEY (id);


--
-- Name: transport_routes transport_routes_route_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_routes
    ADD CONSTRAINT transport_routes_route_code_key UNIQUE (route_code);


--
-- Name: transport_stops transport_stops_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_stops
    ADD CONSTRAINT transport_stops_pkey PRIMARY KEY (id);


--
-- Name: transport_vehicles transport_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_vehicles
    ADD CONSTRAINT transport_vehicles_pkey PRIMARY KEY (id);


--
-- Name: transport_vehicles transport_vehicles_registration_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_vehicles
    ADD CONSTRAINT transport_vehicles_registration_number_key UNIQUE (registration_number);


--
-- Name: trip_logs trip_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT trip_logs_pkey PRIMARY KEY (id);


--
-- Name: rooms unique_room_per_block; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT unique_room_per_block UNIQUE (block_id, room_number);


--
-- Name: section_incharges unique_section_incharge_per_academic_year; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT unique_section_incharge_per_academic_year UNIQUE (program_id, batch_year, section, academic_year);


--
-- Name: semester_results unique_semester_result_per_student; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semester_results
    ADD CONSTRAINT unique_semester_result_per_student UNIQUE (student_id, semester, batch_year);


--
-- Name: users users_aadhaar_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_aadhaar_number_key UNIQUE (aadhaar_number);


--
-- Name: users users_admission_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_admission_number_key UNIQUE (admission_number);


--
-- Name: users users_biometric_device_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_biometric_device_id_key UNIQUE (biometric_device_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- Name: users users_email_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key10 UNIQUE (email);


--
-- Name: users users_email_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key11 UNIQUE (email);


--
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- Name: users users_email_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);


--
-- Name: users users_email_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);


--
-- Name: users users_email_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key5 UNIQUE (email);


--
-- Name: users users_email_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key6 UNIQUE (email);


--
-- Name: users users_email_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key7 UNIQUE (email);


--
-- Name: users users_email_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key8 UNIQUE (email);


--
-- Name: users users_email_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key9 UNIQUE (email);


--
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- Name: users users_passport_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_passport_number_key UNIQUE (passport_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_student_id_key UNIQUE (student_id);


--
-- Name: vehicle_route_assignments vehicle_route_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_route_assignments
    ADD CONSTRAINT vehicle_route_assignments_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_entity_type_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_entity_type_entity_id ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: courses_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX courses_code ON public.courses USING btree (code);


--
-- Name: courses_department_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX courses_department_id ON public.courses USING btree (department_id);


--
-- Name: courses_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX courses_is_active ON public.courses USING btree (is_active);


--
-- Name: courses_program_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX courses_program_id ON public.courses USING btree (program_id);


--
-- Name: departments_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX departments_code ON public.departments USING btree (code);


--
-- Name: departments_hod_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX departments_hod_id ON public.departments USING btree (hod_id);


--
-- Name: departments_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX departments_is_active ON public.departments USING btree (is_active);


--
-- Name: departments_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX departments_name ON public.departments USING btree (name);


--
-- Name: exam_reverifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX exam_reverifications_created_at ON public.exam_reverifications USING btree (created_at);


--
-- Name: exam_reverifications_exam_schedule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX exam_reverifications_exam_schedule_id ON public.exam_reverifications USING btree (exam_schedule_id);


--
-- Name: exam_reverifications_payment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX exam_reverifications_payment_status ON public.exam_reverifications USING btree (payment_status);


--
-- Name: exam_reverifications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX exam_reverifications_status ON public.exam_reverifications USING btree (status);


--
-- Name: exam_reverifications_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX exam_reverifications_student_id ON public.exam_reverifications USING btree (student_id);


--
-- Name: exam_scripts_exam_schedule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX exam_scripts_exam_schedule_id ON public.exam_scripts USING btree (exam_schedule_id);


--
-- Name: exam_scripts_is_visible; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX exam_scripts_is_visible ON public.exam_scripts USING btree (is_visible);


--
-- Name: exam_scripts_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX exam_scripts_student_id ON public.exam_scripts USING btree (student_id);


--
-- Name: fee_semester_configs_program_id_batch_year_semester; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX fee_semester_configs_program_id_batch_year_semester ON public.fee_semester_configs USING btree (program_id, batch_year, semester);


--
-- Name: graduations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX graduations_status ON public.graduations USING btree (status);


--
-- Name: graduations_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX graduations_student_id ON public.graduations USING btree (student_id);


--
-- Name: hostel_allocations_room_id_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_allocations_room_id_status ON public.hostel_allocations USING btree (room_id, status);


--
-- Name: hostel_allocations_student_id_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_allocations_student_id_status ON public.hostel_allocations USING btree (student_id, status);


--
-- Name: hostel_attendance_student_id_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_attendance_student_id_date ON public.hostel_attendance USING btree (student_id, date);


--
-- Name: hostel_beds_room_id_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_beds_room_id_status ON public.hostel_beds USING btree (room_id, status);


--
-- Name: hostel_complaints_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_complaints_status ON public.hostel_complaints USING btree (status);


--
-- Name: hostel_fines_fine_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_fines_fine_type ON public.hostel_fines USING btree (fine_type);


--
-- Name: hostel_fines_issued_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_fines_issued_date ON public.hostel_fines USING btree (issued_date);


--
-- Name: hostel_fines_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_fines_status ON public.hostel_fines USING btree (status);


--
-- Name: hostel_fines_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_fines_student_id ON public.hostel_fines USING btree (student_id);


--
-- Name: hostel_gate_passes_student_id_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_gate_passes_student_id_status ON public.hostel_gate_passes USING btree (student_id, status);


--
-- Name: hostel_room_bill_distributions_allocation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_room_bill_distributions_allocation_id ON public.hostel_room_bill_distributions USING btree (allocation_id);


--
-- Name: hostel_room_bill_distributions_room_bill_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_room_bill_distributions_room_bill_id ON public.hostel_room_bill_distributions USING btree (room_bill_id);


--
-- Name: hostel_room_bill_distributions_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_room_bill_distributions_student_id ON public.hostel_room_bill_distributions USING btree (student_id);


--
-- Name: hostel_room_bills_bill_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_room_bills_bill_type ON public.hostel_room_bills USING btree (bill_type);


--
-- Name: hostel_room_bills_room_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_room_bills_room_id ON public.hostel_room_bills USING btree (room_id);


--
-- Name: hostel_room_bills_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_room_bills_status ON public.hostel_room_bills USING btree (status);


--
-- Name: hostel_rooms_building_id_floor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_rooms_building_id_floor_id ON public.hostel_rooms USING btree (building_id, floor_id);


--
-- Name: hostel_rooms_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_rooms_status ON public.hostel_rooms USING btree (status);


--
-- Name: hostel_stay_logs_allocation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_stay_logs_allocation_id ON public.hostel_stay_logs USING btree (allocation_id);


--
-- Name: hostel_stay_logs_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hostel_stay_logs_student_id ON public.hostel_stay_logs USING btree (student_id);


--
-- Name: idx_attendance_session_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_attendance_session_unique ON public.attendance USING btree (student_id, date, course_id, timetable_slot_id);


--
-- Name: idx_exam_marks_unique_entry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_exam_marks_unique_entry ON public.exam_marks USING btree (exam_schedule_id, student_id);


--
-- Name: idx_exam_reg_unique_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_exam_reg_unique_student ON public.exam_registrations USING btree (exam_cycle_id, student_id);


--
-- Name: idx_exam_scripts_unique_entry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_exam_scripts_unique_entry ON public.exam_scripts USING btree (student_id, exam_schedule_id);


--
-- Name: idx_fee_semester_config_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_fee_semester_config_unique ON public.fee_semester_configs USING btree (program_id, batch_year, semester);


--
-- Name: idx_fee_structures_batch_program_semester; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fee_structures_batch_program_semester ON public.fee_structures USING btree (batch_year, program_id, semester);


--
-- Name: idx_hall_ticket_unique_entry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_hall_ticket_unique_entry ON public.hall_tickets USING btree (exam_cycle_id, student_id);


--
-- Name: idx_promotion_criteria_unique_sem; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_promotion_criteria_unique_sem ON public.promotion_criteria USING btree (program_id, from_semester, to_semester);


--
-- Name: idx_users_batch_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_batch_year ON public.users USING btree (batch_year);


--
-- Name: leave_balances_user_id_leave_type_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX leave_balances_user_id_leave_type_year ON public.leave_balances USING btree (user_id, leave_type, year);


--
-- Name: leave_requests_approver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX leave_requests_approver_id ON public.leave_requests USING btree (approver_id);


--
-- Name: leave_requests_student_id_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX leave_requests_student_id_status ON public.leave_requests USING btree (student_id, status);


--
-- Name: payslips_user_id_month_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payslips_user_id_month_year ON public.payslips USING btree (user_id, month, year);


--
-- Name: programs_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX programs_code ON public.programs USING btree (code);


--
-- Name: programs_degree_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX programs_degree_type ON public.programs USING btree (degree_type);


--
-- Name: programs_department_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX programs_department_id ON public.programs USING btree (department_id);


--
-- Name: programs_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX programs_is_active ON public.programs USING btree (is_active);


--
-- Name: promotion_evaluations_student_id_from_semester; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_evaluations_student_id_from_semester ON public.promotion_evaluations USING btree (student_id, from_semester);


--
-- Name: scholarship_beneficiaries_academic_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX scholarship_beneficiaries_academic_year ON public.scholarship_beneficiaries USING btree (academic_year);


--
-- Name: special_trips_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX special_trips_status ON public.special_trips USING btree (status);


--
-- Name: special_trips_trip_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX special_trips_trip_date ON public.special_trips USING btree (trip_date);


--
-- Name: special_trips_vehicle_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX special_trips_vehicle_id ON public.special_trips USING btree (vehicle_id);


--
-- Name: staff_attendance_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX staff_attendance_date ON public.staff_attendance USING btree (date);


--
-- Name: staff_attendance_user_id_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX staff_attendance_user_id_date ON public.staff_attendance USING btree (user_id, date);


--
-- Name: student_awards_academic_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_awards_academic_year ON public.student_awards USING btree (academic_year);


--
-- Name: student_awards_level; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_awards_level ON public.student_awards USING btree (level);


--
-- Name: student_documents_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_documents_status ON public.student_documents USING btree (status);


--
-- Name: student_documents_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_documents_type ON public.student_documents USING btree (type);


--
-- Name: student_documents_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_documents_user_id ON public.student_documents USING btree (user_id);


--
-- Name: student_fee_charges_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_fee_charges_category_id ON public.student_fee_charges USING btree (category_id);


--
-- Name: student_fee_charges_charge_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_fee_charges_charge_type ON public.student_fee_charges USING btree (charge_type);


--
-- Name: student_fee_charges_is_paid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_fee_charges_is_paid ON public.student_fee_charges USING btree (is_paid);


--
-- Name: student_fee_charges_reference_id_reference_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_fee_charges_reference_id_reference_type ON public.student_fee_charges USING btree (reference_id, reference_type);


--
-- Name: student_fee_charges_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_fee_charges_student_id ON public.student_fee_charges USING btree (student_id);


--
-- Name: student_route_allocations_academic_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_route_allocations_academic_year ON public.student_route_allocations USING btree (academic_year);


--
-- Name: student_route_allocations_route_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_route_allocations_route_id ON public.student_route_allocations USING btree (route_id);


--
-- Name: student_route_allocations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_route_allocations_status ON public.student_route_allocations USING btree (status);


--
-- Name: student_route_allocations_stop_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_route_allocations_stop_id ON public.student_route_allocations USING btree (stop_id);


--
-- Name: student_route_allocations_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_route_allocations_student_id ON public.student_route_allocations USING btree (student_id);


--
-- Name: transport_drivers_driver_license_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX transport_drivers_driver_license_number ON public.transport_drivers USING btree (driver_license_number) WHERE (driver_license_number IS NOT NULL);


--
-- Name: transport_drivers_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transport_drivers_is_active ON public.transport_drivers USING btree (is_active);


--
-- Name: transport_drivers_staff_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transport_drivers_staff_type ON public.transport_drivers USING btree (staff_type);


--
-- Name: transport_routes_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transport_routes_is_active ON public.transport_routes USING btree (is_active);


--
-- Name: transport_routes_route_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX transport_routes_route_code ON public.transport_routes USING btree (route_code);


--
-- Name: transport_stops_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transport_stops_is_active ON public.transport_stops USING btree (is_active);


--
-- Name: transport_stops_route_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transport_stops_route_id ON public.transport_stops USING btree (route_id);


--
-- Name: transport_stops_stop_sequence; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transport_stops_stop_sequence ON public.transport_stops USING btree (stop_sequence);


--
-- Name: transport_vehicles_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transport_vehicles_is_active ON public.transport_vehicles USING btree (is_active);


--
-- Name: transport_vehicles_registration_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX transport_vehicles_registration_number ON public.transport_vehicles USING btree (registration_number);


--
-- Name: transport_vehicles_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transport_vehicles_status ON public.transport_vehicles USING btree (status);


--
-- Name: trip_logs_driver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX trip_logs_driver_id ON public.trip_logs USING btree (driver_id);


--
-- Name: trip_logs_route_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX trip_logs_route_id ON public.trip_logs USING btree (route_id);


--
-- Name: trip_logs_trip_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX trip_logs_trip_date ON public.trip_logs USING btree (trip_date);


--
-- Name: trip_logs_trip_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX trip_logs_trip_type ON public.trip_logs USING btree (trip_type);


--
-- Name: trip_logs_vehicle_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX trip_logs_vehicle_id ON public.trip_logs USING btree (vehicle_id);


--
-- Name: users_aadhaar_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_aadhaar_number ON public.users USING btree (aadhaar_number) WHERE (aadhaar_number IS NOT NULL);


--
-- Name: users_admission_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_admission_number ON public.users USING btree (admission_number) WHERE (admission_number IS NOT NULL);


--
-- Name: users_department_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_department_id ON public.users USING btree (department_id);


--
-- Name: users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email ON public.users USING btree (email);


--
-- Name: users_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_employee_id ON public.users USING btree (employee_id) WHERE (employee_id IS NOT NULL);


--
-- Name: users_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_is_active ON public.users USING btree (is_active);


--
-- Name: users_regulation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_regulation_id ON public.users USING btree (regulation_id);


--
-- Name: users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role ON public.users USING btree (role);


--
-- Name: users_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_student_id ON public.users USING btree (student_id) WHERE (student_id IS NOT NULL);


--
-- Name: vehicle_route_assignments_driver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vehicle_route_assignments_driver_id ON public.vehicle_route_assignments USING btree (driver_id);


--
-- Name: vehicle_route_assignments_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vehicle_route_assignments_is_active ON public.vehicle_route_assignments USING btree (is_active);


--
-- Name: vehicle_route_assignments_route_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vehicle_route_assignments_route_id ON public.vehicle_route_assignments USING btree (route_id);


--
-- Name: vehicle_route_assignments_vehicle_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vehicle_route_assignments_vehicle_id ON public.vehicle_route_assignments USING btree (vehicle_id);


--
-- Name: attendance attendance_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: attendance attendance_marked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: attendance attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: attendance attendance_timetable_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_timetable_slot_id_fkey FOREIGN KEY (timetable_slot_id) REFERENCES public.timetable_slots(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: book_issues book_issues_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_issues
    ADD CONSTRAINT book_issues_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON UPDATE CASCADE;


--
-- Name: book_issues book_issues_issued_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_issues
    ADD CONSTRAINT book_issues_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: book_issues book_issues_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_issues
    ADD CONSTRAINT book_issues_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: co_po_maps co_po_maps_course_outcome_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.co_po_maps
    ADD CONSTRAINT co_po_maps_course_outcome_id_fkey FOREIGN KEY (course_outcome_id) REFERENCES public.course_outcomes(id) ON DELETE CASCADE;


--
-- Name: co_po_maps co_po_maps_program_outcome_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.co_po_maps
    ADD CONSTRAINT co_po_maps_program_outcome_id_fkey FOREIGN KEY (program_outcome_id) REFERENCES public.program_outcomes(id) ON DELETE CASCADE;


--
-- Name: course_outcomes course_outcomes_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_outcomes
    ADD CONSTRAINT course_outcomes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: courses courses_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE;


--
-- Name: courses courses_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: courses courses_regulation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_regulation_id_fkey FOREIGN KEY (regulation_id) REFERENCES public.regulations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: departments departments_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.blocks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: departments departments_hod_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_hod_id_fkey FOREIGN KEY (hod_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: departments departments_parent_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_department_id_fkey FOREIGN KEY (parent_department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: departments departments_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: exam_cycles exam_cycles_regulation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_cycles
    ADD CONSTRAINT exam_cycles_regulation_id_fkey FOREIGN KEY (regulation_id) REFERENCES public.regulations(id);


--
-- Name: exam_fee_payments exam_fee_payments_exam_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_fee_payments
    ADD CONSTRAINT exam_fee_payments_exam_cycle_id_fkey FOREIGN KEY (exam_cycle_id) REFERENCES public.exam_cycles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exam_fee_payments exam_fee_payments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_fee_payments
    ADD CONSTRAINT exam_fee_payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exam_marks exam_marks_entered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_entered_by_fkey FOREIGN KEY (entered_by) REFERENCES public.users(id);


--
-- Name: exam_marks exam_marks_exam_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_exam_schedule_id_fkey FOREIGN KEY (exam_schedule_id) REFERENCES public.exam_schedules(id) ON UPDATE CASCADE;


--
-- Name: exam_marks exam_marks_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: exam_registrations exam_registrations_exam_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_registrations
    ADD CONSTRAINT exam_registrations_exam_cycle_id_fkey FOREIGN KEY (exam_cycle_id) REFERENCES public.exam_cycles(id) ON DELETE CASCADE;


--
-- Name: exam_registrations exam_registrations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_registrations
    ADD CONSTRAINT exam_registrations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: exam_reverifications exam_reverifications_exam_fee_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_exam_fee_payment_id_fkey FOREIGN KEY (exam_fee_payment_id) REFERENCES public.exam_fee_payments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: exam_reverifications exam_reverifications_exam_mark_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_exam_mark_id_fkey FOREIGN KEY (exam_mark_id) REFERENCES public.exam_marks(id) ON DELETE CASCADE;


--
-- Name: exam_reverifications exam_reverifications_exam_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_exam_schedule_id_fkey FOREIGN KEY (exam_schedule_id) REFERENCES public.exam_schedules(id) ON DELETE CASCADE;


--
-- Name: exam_reverifications exam_reverifications_fee_charge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_fee_charge_id_fkey FOREIGN KEY (fee_charge_id) REFERENCES public.student_fee_charges(id) ON DELETE SET NULL;


--
-- Name: exam_reverifications exam_reverifications_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: exam_reverifications exam_reverifications_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: exam_schedules exam_schedules_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_schedules
    ADD CONSTRAINT exam_schedules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE;


--
-- Name: exam_schedules exam_schedules_exam_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_schedules
    ADD CONSTRAINT exam_schedules_exam_cycle_id_fkey FOREIGN KEY (exam_cycle_id) REFERENCES public.exam_cycles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exam_scripts exam_scripts_exam_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_scripts
    ADD CONSTRAINT exam_scripts_exam_schedule_id_fkey FOREIGN KEY (exam_schedule_id) REFERENCES public.exam_schedules(id) ON DELETE CASCADE;


--
-- Name: exam_scripts exam_scripts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_scripts
    ADD CONSTRAINT exam_scripts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: exam_scripts exam_scripts_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_scripts
    ADD CONSTRAINT exam_scripts_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: expenses expenses_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: expenses expenses_paid_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES public.users(id);


--
-- Name: expenses expenses_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: fee_payments fee_payments_fee_charge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fee_payments_fee_charge_id_fkey FOREIGN KEY (fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fee_payments fee_payments_fee_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fee_payments_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fee_payments fee_payments_fee_structure_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fee_payments_fee_structure_id_fkey1 FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fee_payments fee_payments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fee_payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: fee_semester_configs fee_semester_configs_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_semester_configs
    ADD CONSTRAINT fee_semester_configs_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE CASCADE;


--
-- Name: fee_structures fee_structures_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.fee_categories(id) ON UPDATE CASCADE;


--
-- Name: fee_structures fee_structures_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE;


--
-- Name: fee_structures fee_structures_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: fee_transactions fee_transactions_collected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_transactions
    ADD CONSTRAINT fee_transactions_collected_by_fkey FOREIGN KEY (collected_by) REFERENCES public.users(id);


--
-- Name: fee_transactions fee_transactions_fee_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_transactions
    ADD CONSTRAINT fee_transactions_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id);


--
-- Name: fee_transactions fee_transactions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_transactions
    ADD CONSTRAINT fee_transactions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fee_waivers fee_waivers_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_waivers
    ADD CONSTRAINT fee_waivers_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: fee_waivers fee_waivers_fee_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_waivers
    ADD CONSTRAINT fee_waivers_fee_category_id_fkey FOREIGN KEY (fee_category_id) REFERENCES public.fee_categories(id) ON UPDATE CASCADE;


--
-- Name: fee_waivers fee_waivers_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_waivers
    ADD CONSTRAINT fee_waivers_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: graduations graduations_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.graduations
    ADD CONSTRAINT graduations_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: graduations graduations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.graduations
    ADD CONSTRAINT graduations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: hall_tickets hall_tickets_exam_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hall_tickets
    ADD CONSTRAINT hall_tickets_exam_cycle_id_fkey FOREIGN KEY (exam_cycle_id) REFERENCES public.exam_cycles(id) ON UPDATE CASCADE;


--
-- Name: hall_tickets hall_tickets_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hall_tickets
    ADD CONSTRAINT hall_tickets_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: hostel_allocations hostel_allocations_bed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.hostel_beds(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_allocations hostel_allocations_fee_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.hostel_fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_allocations hostel_allocations_mess_fee_charge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_mess_fee_charge_id_fkey FOREIGN KEY (mess_fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_allocations hostel_allocations_mess_fee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_mess_fee_id_fkey FOREIGN KEY (mess_fee_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_allocations hostel_allocations_mess_fee_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_mess_fee_structure_id_fkey FOREIGN KEY (mess_fee_structure_id) REFERENCES public.hostel_mess_fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_allocations hostel_allocations_rent_fee_charge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_rent_fee_charge_id_fkey FOREIGN KEY (rent_fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_allocations hostel_allocations_rent_fee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_rent_fee_id_fkey FOREIGN KEY (rent_fee_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_allocations hostel_allocations_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.hostel_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_allocations hostel_allocations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_attendance hostel_attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_attendance
    ADD CONSTRAINT hostel_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_beds hostel_beds_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_beds
    ADD CONSTRAINT hostel_beds_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.hostel_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_complaints hostel_complaints_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_complaints
    ADD CONSTRAINT hostel_complaints_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_complaints hostel_complaints_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_complaints
    ADD CONSTRAINT hostel_complaints_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.hostel_rooms(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_complaints hostel_complaints_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_complaints
    ADD CONSTRAINT hostel_complaints_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_fines hostel_fines_allocation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_allocation_id_fkey FOREIGN KEY (allocation_id) REFERENCES public.hostel_allocations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_fines hostel_fines_fee_charge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_fee_charge_id_fkey FOREIGN KEY (fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_fines hostel_fines_fee_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_fines hostel_fines_issued_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: hostel_fines hostel_fines_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_floors hostel_floors_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_floors
    ADD CONSTRAINT hostel_floors_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.hostel_buildings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_gate_passes hostel_gate_passes_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_gate_passes
    ADD CONSTRAINT hostel_gate_passes_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_gate_passes hostel_gate_passes_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_gate_passes
    ADD CONSTRAINT hostel_gate_passes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_room_bill_distributions hostel_room_bill_distributions_allocation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_allocation_id_fkey FOREIGN KEY (allocation_id) REFERENCES public.hostel_allocations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_room_bill_distributions hostel_room_bill_distributions_fee_charge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_fee_charge_id_fkey FOREIGN KEY (fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_room_bill_distributions hostel_room_bill_distributions_fee_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_room_bill_distributions hostel_room_bill_distributions_fee_structure_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_fee_structure_id_fkey1 FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_room_bill_distributions hostel_room_bill_distributions_room_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_room_bill_id_fkey FOREIGN KEY (room_bill_id) REFERENCES public.hostel_room_bills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_room_bill_distributions hostel_room_bill_distributions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_room_bills hostel_room_bills_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_room_bills
    ADD CONSTRAINT hostel_room_bills_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: hostel_room_bills hostel_room_bills_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_room_bills
    ADD CONSTRAINT hostel_room_bills_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.hostel_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_rooms hostel_rooms_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_rooms
    ADD CONSTRAINT hostel_rooms_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.hostel_buildings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_rooms hostel_rooms_floor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_rooms
    ADD CONSTRAINT hostel_rooms_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.hostel_floors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_stay_logs hostel_stay_logs_allocation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_stay_logs
    ADD CONSTRAINT hostel_stay_logs_allocation_id_fkey FOREIGN KEY (allocation_id) REFERENCES public.hostel_allocations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_stay_logs hostel_stay_logs_bed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_stay_logs
    ADD CONSTRAINT hostel_stay_logs_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.hostel_beds(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hostel_stay_logs hostel_stay_logs_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_stay_logs
    ADD CONSTRAINT hostel_stay_logs_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.hostel_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_stay_logs hostel_stay_logs_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_stay_logs
    ADD CONSTRAINT hostel_stay_logs_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hostel_visitors hostel_visitors_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostel_visitors
    ADD CONSTRAINT hostel_visitors_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: institution_budgets institution_budgets_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institution_budgets
    ADD CONSTRAINT institution_budgets_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_balances leave_balances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: leave_requests leave_requests_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: leave_requests leave_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: payslips payslips_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: placements placements_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: program_outcomes program_outcomes_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_outcomes
    ADD CONSTRAINT program_outcomes_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE CASCADE;


--
-- Name: programs programs_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE;


--
-- Name: promotion_criteria promotion_criteria_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_criteria
    ADD CONSTRAINT promotion_criteria_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE;


--
-- Name: promotion_evaluations promotion_evaluations_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_evaluations
    ADD CONSTRAINT promotion_evaluations_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: promotion_evaluations promotion_evaluations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_evaluations
    ADD CONSTRAINT promotion_evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: rooms rooms_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.blocks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salary_structures salary_structures_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.salary_grades(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: salary_structures salary_structures_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: scholarship_beneficiaries scholarship_beneficiaries_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarship_beneficiaries
    ADD CONSTRAINT scholarship_beneficiaries_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: scholarship_beneficiaries scholarship_beneficiaries_scheme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarship_beneficiaries
    ADD CONSTRAINT scholarship_beneficiaries_scheme_id_fkey FOREIGN KEY (scheme_id) REFERENCES public.scholarship_schemes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scholarship_beneficiaries scholarship_beneficiaries_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarship_beneficiaries
    ADD CONSTRAINT scholarship_beneficiaries_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: section_incharges section_incharges_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT section_incharges_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: section_incharges section_incharges_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT section_incharges_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: section_incharges section_incharges_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT section_incharges_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: section_incharges section_incharges_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT section_incharges_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: semester_results semester_results_exam_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semester_results
    ADD CONSTRAINT semester_results_exam_cycle_id_fkey FOREIGN KEY (exam_cycle_id) REFERENCES public.exam_cycles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: semester_results semester_results_published_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semester_results
    ADD CONSTRAINT semester_results_published_by_fkey FOREIGN KEY (published_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: semester_results semester_results_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semester_results
    ADD CONSTRAINT semester_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: special_trips special_trips_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_trips
    ADD CONSTRAINT special_trips_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: special_trips special_trips_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_trips
    ADD CONSTRAINT special_trips_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.transport_drivers(id);


--
-- Name: special_trips special_trips_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_trips
    ADD CONSTRAINT special_trips_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: special_trips special_trips_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_trips
    ADD CONSTRAINT special_trips_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.transport_vehicles(id);


--
-- Name: staff_attendance staff_attendance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_attendance
    ADD CONSTRAINT staff_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: student_awards student_awards_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_awards
    ADD CONSTRAINT student_awards_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: student_awards student_awards_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_awards
    ADD CONSTRAINT student_awards_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_documents student_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: student_documents student_documents_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: student_fee_charges student_fee_charges_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT student_fee_charges_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.fee_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_fee_charges student_fee_charges_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT student_fee_charges_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_fee_charges student_fee_charges_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT student_fee_charges_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.fee_payments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: student_fee_charges student_fee_charges_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT student_fee_charges_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_route_allocations student_route_allocations_fee_charge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_fee_charge_id_fkey FOREIGN KEY (fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: student_route_allocations student_route_allocations_fee_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id);


--
-- Name: student_route_allocations student_route_allocations_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.transport_routes(id);


--
-- Name: student_route_allocations student_route_allocations_stop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_stop_id_fkey FOREIGN KEY (stop_id) REFERENCES public.transport_stops(id);


--
-- Name: student_route_allocations student_route_allocations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: timetable_slots timetable_slots_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.blocks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: timetable_slots timetable_slots_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE;


--
-- Name: timetable_slots timetable_slots_course_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_course_id_fkey1 FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: timetable_slots timetable_slots_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: timetable_slots timetable_slots_faculty_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_faculty_id_fkey1 FOREIGN KEY (faculty_id) REFERENCES public.users(id);


--
-- Name: timetable_slots timetable_slots_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: timetable_slots timetable_slots_timetable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_timetable_id_fkey FOREIGN KEY (timetable_id) REFERENCES public.timetables(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timetables timetables_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: timetables timetables_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE;


--
-- Name: transport_stops transport_stops_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_stops
    ADD CONSTRAINT transport_stops_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.transport_routes(id) ON DELETE CASCADE;


--
-- Name: trip_logs trip_logs_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT trip_logs_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.transport_drivers(id);


--
-- Name: trip_logs trip_logs_logged_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT trip_logs_logged_by_fkey FOREIGN KEY (logged_by) REFERENCES public.users(id);


--
-- Name: trip_logs trip_logs_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT trip_logs_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.transport_routes(id);


--
-- Name: trip_logs trip_logs_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT trip_logs_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.transport_vehicles(id);


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_regulation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_regulation_id_fkey FOREIGN KEY (regulation_id) REFERENCES public.regulations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_salary_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_salary_grade_id_fkey FOREIGN KEY (salary_grade_id) REFERENCES public.salary_grades(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vehicle_route_assignments vehicle_route_assignments_conductor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_route_assignments
    ADD CONSTRAINT vehicle_route_assignments_conductor_id_fkey FOREIGN KEY (conductor_id) REFERENCES public.transport_drivers(id);


--
-- Name: vehicle_route_assignments vehicle_route_assignments_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_route_assignments
    ADD CONSTRAINT vehicle_route_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.transport_drivers(id);


--
-- Name: vehicle_route_assignments vehicle_route_assignments_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_route_assignments
    ADD CONSTRAINT vehicle_route_assignments_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.transport_routes(id);


--
-- Name: vehicle_route_assignments vehicle_route_assignments_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_route_assignments
    ADD CONSTRAINT vehicle_route_assignments_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.transport_vehicles(id);


--
-- PostgreSQL database dump complete
--