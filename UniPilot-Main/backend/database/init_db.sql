-- UniPilot Database Initialization Script
-- Re-generated for 100% integrity
-- Dialect: PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom ENUM Types
CREATE TYPE public.enum_attendance_status AS ENUM (
    'present',
    'absent',
    'late',
    'excused',
    'on_leave'
);
CREATE TYPE public.enum_blocks_type AS ENUM (
    'academic',
    'administrative',
    'hostel',
    'other'
);
CREATE TYPE public.enum_book_issues_status AS ENUM (
    'issued',
    'returned',
    'overdue',
    'lost'
);
CREATE TYPE public.enum_books_status AS ENUM (
    'available',
    'out_of_stock',
    'archived'
);
CREATE TYPE public.enum_courses_course_type AS ENUM (
    'theory',
    'lab',
    'project'
);
CREATE TYPE public.enum_departments_type AS ENUM (
    'academic',
    'administrative'
);
CREATE TYPE public.enum_exam_cycles_exam_type AS ENUM (
    'mid_term',
    'semester_end',
    're_exam',
    'internal'
);
CREATE TYPE public.enum_exam_cycles_status AS ENUM (
    'scheduled',
    'ongoing',
    'completed',
    'results_published'
);
CREATE TYPE public.enum_exam_fee_payments_category AS ENUM (
    'registration',
    'supply',
    'reverification',
    'condonation',
    'script_view'
);
CREATE TYPE public.enum_exam_fee_payments_status AS ENUM (
    'pending',
    'completed',
    'failed'
);
CREATE TYPE public.enum_exam_marks_moderation_status AS ENUM (
    'draft',
    'verified',
    'approved',
    'locked'
);
CREATE TYPE public.enum_exam_marks_status AS ENUM (
    'present',
    'absent',
    'malpractice'
);
CREATE TYPE public.enum_exam_registrations_attendance_status AS ENUM (
    'clear',
    'low',
    'condoned'
);
CREATE TYPE public.enum_exam_registrations_fee_status AS ENUM (
    'pending',
    'paid',
    'partially_paid',
    'waived'
);
CREATE TYPE public.enum_exam_registrations_registration_type AS ENUM (
    'regular',
    'supply',
    'combined'
);
CREATE TYPE public.enum_exam_registrations_status AS ENUM (
    'draft',
    'submitted',
    'approved',
    'rejected',
    'blocked'
);
CREATE TYPE public.enum_exam_reverifications_payment_status AS ENUM (
    'pending',
    'paid',
    'waived'
);
CREATE TYPE public.enum_exam_reverifications_status AS ENUM (
    'pending',
    'under_review',
    'completed',
    'rejected'
);
CREATE TYPE public.enum_expenses_payment_mode AS ENUM (
    'cash',
    'upi',
    'cheque',
    'bank_transfer'
);
CREATE TYPE public.enum_expenses_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'paid'
);
CREATE TYPE public.enum_extension_activities_activity_type AS ENUM (
    'nss',
    'ncc',
    'community_service',
    'skill_development',
    'awareness_camp',
    'health_camp',
    'other'
);
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
CREATE TYPE public.enum_faculty_developments_role AS ENUM (
    'participant',
    'resource_person',
    'organizer'
);
CREATE TYPE public.enum_fee_payments_payment_method AS ENUM (
    'cash',
    'online',
    'bank_transfer',
    'cheque',
    'WALLET'
);
CREATE TYPE public.enum_fee_payments_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'partially_paid'
);
CREATE TYPE public.enum_fee_semester_configs_fine_type AS ENUM (
    'none',
    'fixed',
    'percentage'
);
CREATE TYPE public.enum_fee_structures_applies_to AS ENUM (
    'all',
    'hostellers',
    'day_scholars'
);
CREATE TYPE public.enum_fee_structures_fine_type AS ENUM (
    'none',
    'fixed',
    'percentage'
);
CREATE TYPE public.enum_fee_transactions_jvd_quarter AS ENUM (
    'Q1',
    'Q2',
    'Q3',
    'Q4'
);
CREATE TYPE public.enum_fee_transactions_payment_mode AS ENUM (
    'cash',
    'upi',
    'cheque',
    'dd',
    'bank_transfer',
    'scholarship_adjustment'
);
CREATE TYPE public.enum_fee_transactions_payment_status AS ENUM (
    'success',
    'pending',
    'failed',
    'bounced'
);
CREATE TYPE public.enum_fee_waivers_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'disbursed'
);
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
CREATE TYPE public.enum_green_initiatives_status AS ENUM (
    'ongoing',
    'completed'
);
CREATE TYPE public.enum_hostel_allocations_mess_type AS ENUM (
    'veg',
    'non_veg'
);
CREATE TYPE public.enum_hostel_allocations_status AS ENUM (
    'active',
    'checked_out',
    'cancelled'
);
CREATE TYPE public.enum_hostel_beds_status AS ENUM (
    'available',
    'occupied',
    'maintenance'
);
CREATE TYPE public.enum_hostel_buildings_status AS ENUM (
    'active',
    'inactive',
    'maintenance'
);
CREATE TYPE public.enum_hostel_buildings_type AS ENUM (
    'boys',
    'girls',
    'mixed'
);
CREATE TYPE public.enum_hostel_complaints_complaint_type AS ENUM (
    'electrical',
    'plumbing',
    'furniture',
    'cleanliness',
    'other'
);
CREATE TYPE public.enum_hostel_complaints_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);
CREATE TYPE public.enum_hostel_complaints_status AS ENUM (
    'pending',
    'in_progress',
    'resolved',
    'closed'
);
CREATE TYPE public.enum_hostel_fee_structures_mess_type AS ENUM (
    'veg',
    'non_veg'
);
CREATE TYPE public.enum_hostel_fee_structures_room_type AS ENUM (
    'ac',
    'non_ac'
);
CREATE TYPE public.enum_hostel_fines_fine_type AS ENUM (
    'damage',
    'disciplinary',
    'late_payment',
    'curfew_violation',
    'other'
);
CREATE TYPE public.enum_hostel_fines_status AS ENUM (
    'pending',
    'paid',
    'waived',
    'cancelled'
);
CREATE TYPE public.enum_hostel_gate_passes_pass_type AS ENUM (
    'day',
    'long'
);
CREATE TYPE public.enum_hostel_gate_passes_status AS ENUM (
    'out',
    'returned',
    'late',
    'pending',
    'approved',
    'rejected',
    'cancelled'
);
CREATE TYPE public.enum_hostel_mess_fee_structures_mess_type AS ENUM (
    'veg',
    'non_veg'
);
CREATE TYPE public.enum_hostel_room_bills_bill_type AS ENUM (
    'electricity',
    'water',
    'maintenance',
    'internet',
    'cleaning',
    'other'
);
CREATE TYPE public.enum_hostel_room_bills_status AS ENUM (
    'pending',
    'distributed',
    'cancelled'
);
CREATE TYPE public.enum_hostel_rooms_room_type AS ENUM (
    'ac',
    'non_ac'
);
CREATE TYPE public.enum_hostel_rooms_status AS ENUM (
    'available',
    'occupied',
    'maintenance',
    'full'
);
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
CREATE TYPE public.enum_leave_requests_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);
CREATE TYPE public.enum_mous_partner_type AS ENUM (
    'industry',
    'academic_national',
    'academic_international',
    'government',
    'ngo'
);
CREATE TYPE public.enum_mous_scope AS ENUM (
    'research',
    'student_exchange',
    'faculty_exchange',
    'internship',
    'consultancy',
    'joint_program'
);
CREATE TYPE public.enum_mous_status AS ENUM (
    'active',
    'expired',
    'renewed',
    'terminated'
);
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
CREATE TYPE public.enum_naac_infrastructure_status AS ENUM (
    'functional',
    'under_maintenance',
    'non_functional'
);
CREATE TYPE public.enum_nba_surveys_type AS ENUM (
    'Exit',
    'Alumni',
    'Employer',
    'CourseEnd'
);
CREATE TYPE public.enum_patents_patent_type AS ENUM (
    'design',
    'utility',
    'plant'
);
CREATE TYPE public.enum_patents_status AS ENUM (
    'filed',
    'published',
    'granted',
    'licensed'
);
CREATE TYPE public.enum_payslips_status AS ENUM (
    'draft',
    'published',
    'paid'
);
CREATE TYPE public.enum_programs_degree_type AS ENUM (
    'diploma',
    'undergraduate',
    'postgraduate',
    'doctoral'
);
CREATE TYPE public.enum_publications_publication_type AS ENUM (
    'journal',
    'conference',
    'book',
    'book_chapter'
);
CREATE TYPE public.enum_regulations_type AS ENUM (
    'semester',
    'year'
);
CREATE TYPE public.enum_research_projects_funding_type AS ENUM (
    'govt_national',
    'govt_state',
    'industry',
    'international',
    'internal'
);
CREATE TYPE public.enum_research_projects_project_type AS ENUM (
    'major',
    'minor',
    'consultancy',
    'seed_grant'
);
CREATE TYPE public.enum_research_projects_status AS ENUM (
    'ongoing',
    'completed',
    'terminated'
);
CREATE TYPE public.enum_rooms_type AS ENUM (
    'classroom',
    'lab',
    'seminar_hall',
    'staff_room',
    'auditorium',
    'utility'
);
CREATE TYPE public.enum_scholarship_schemes_scheme_type AS ENUM (
    'govt_central',
    'govt_state',
    'institutional',
    'private',
    'merit_based',
    'need_based'
);
CREATE TYPE public.enum_special_trips_status AS ENUM (
    'pending',
    'approved',
    'completed',
    'cancelled'
);
CREATE TYPE public.enum_staff_attendance_status AS ENUM (
    'present',
    'absent',
    'leave',
    'half-day',
    'holiday'
);
CREATE TYPE public.enum_student_awards_award_type AS ENUM (
    'sports',
    'cultural',
    'academic',
    'research',
    'social_service',
    'other'
);
CREATE TYPE public.enum_student_awards_level AS ENUM (
    'international',
    'national',
    'state',
    'university',
    'college'
);
CREATE TYPE public.enum_student_documents_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);
CREATE TYPE public.enum_student_fee_charges_charge_type AS ENUM (
    'hostel_bill',
    'transport_fee',
    'fine',
    'other',
    'exam_reverification',
    'exam_script_view',
    'exam_registration'
);
CREATE TYPE public.enum_student_route_allocations_status AS ENUM (
    'active',
    'suspended',
    'cancelled'
);
CREATE TYPE public.enum_timetable_slots_day_of_week AS ENUM (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
);
CREATE TYPE public.enum_transport_drivers_staff_type AS ENUM (
    'driver',
    'conductor',
    'helper'
);
CREATE TYPE public.enum_transport_vehicles_status AS ENUM (
    'active',
    'maintenance',
    'retired'
);
CREATE TYPE public.enum_transport_vehicles_vehicle_type AS ENUM (
    'bus',
    'van',
    'minibus'
);
CREATE TYPE public.enum_trip_logs_trip_type AS ENUM (
    'regular_morning',
    'regular_evening',
    'special'
);
CREATE TYPE public.enum_users_academic_status AS ENUM (
    'active',
    'promoted',
    'detained',
    'semester_back',
    'graduated',
    'dropout'
);
CREATE TYPE public.enum_users_admission_type AS ENUM (
    'management',
    'convener'
);
CREATE TYPE public.enum_users_gender AS ENUM (
    'male',
    'female',
    'other'
);
CREATE TYPE public.enum_vehicle_route_assignments_shift_type AS ENUM (
    'morning',
    'evening',
    'both'
);

-- 3. Table Definitions
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

CREATE TABLE public.attendance_settings (
    id uuid NOT NULL,
    weekly_off json DEFAULT '["Sunday"]'::json NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);

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

CREATE TABLE public.co_po_maps (
    id uuid NOT NULL,
    course_outcome_id uuid NOT NULL,
    program_outcome_id uuid NOT NULL,
    weightage integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE public.course_outcomes (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    co_code character varying(20) NOT NULL,
    description text NOT NULL,
    target_attainment numeric(5,2) DEFAULT 60,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

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
    programs jsonb DEFAULT '[]'::jsonb
);

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

CREATE TABLE public.fee_categories (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

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

CREATE TABLE public.hostel_beds (
    id uuid NOT NULL,
    room_id uuid NOT NULL,
    bed_number character varying(255) NOT NULL,
    status public.enum_hostel_beds_status DEFAULT 'available'::public.enum_hostel_beds_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

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

CREATE TABLE public.hostel_floors (
    id uuid NOT NULL,
    building_id uuid NOT NULL,
    floor_number integer NOT NULL,
    total_rooms integer DEFAULT 0,
    occupied_rooms integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

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

CREATE TABLE public.permissions (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    module character varying(50) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    description character varying(255)
);

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

CREATE TABLE public.program_outcomes (
    id uuid NOT NULL,
    program_id uuid NOT NULL,
    po_code character varying(20) NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

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

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

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

CREATE TABLE public.sequelize_data (
    name character varying(255) NOT NULL
);

CREATE TABLE public.sequelize_meta (
    name character varying(255) NOT NULL
);

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

CREATE TABLE public.placement_companies (
    id uuid NOT NULL PRIMARY KEY,
    name character varying(200) NOT NULL,
    industry character varying(100),
    website character varying(255),
    logo_url character varying(500),
    address text,
    about text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.job_postings (
    id uuid NOT NULL PRIMARY KEY,
    company_id uuid ,
    role_title character varying(200) NOT NULL,
    job_description text,
    required_skills text[],
    ctc_lpa numeric(10,2),
    work_location character varying(200),
    number_of_positions integer,
    application_deadline timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.placement_drives (
    id uuid NOT NULL PRIMARY KEY,
    job_posting_id uuid ,
    drive_name character varying(200) NOT NULL,
    drive_type character varying(50) DEFAULT 'on_campus',
    drive_date date,
    venue character varying(255),
    mode character varying(50) DEFAULT 'offline',
    registration_start timestamp with time zone,
    registration_end timestamp with time zone,
    registration_form_fields jsonb DEFAULT '[]'::jsonb,
    external_registration_url character varying(500),
    status character varying(50) DEFAULT 'upcoming',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.drive_eligibility (
    id uuid NOT NULL PRIMARY KEY,
    drive_id uuid ,
    min_cgpa numeric(4,2),
    max_backlogs integer,
    eligible_departments uuid[],
    eligible_regulations uuid[],
    gender_preference character varying(20),
    other_criteria text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.drive_rounds (
    id uuid NOT NULL PRIMARY KEY,
    drive_id uuid ,
    round_number integer,
    round_name character varying(100),
    round_type character varying(50),
    round_date date,
    round_time time without time zone,
    venue character varying(255),
    venue_type character varying(50) DEFAULT 'online',
    mode character varying(50) DEFAULT 'offline',
    test_link character varying(500),
    duration_minutes integer,
    is_eliminatory boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.student_placement_profiles (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid ,
    resume_url character varying(500),
    skills text[],
    interests text[],
    preferred_locations text[],
    is_placed boolean DEFAULT false,
    placed_at_company_id uuid ,
    placed_ctc numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Primary Keys
ALTER TABLE ONLY public.admission_configs
    ADD CONSTRAINT admission_configs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.attendance_settings
    ADD CONSTRAINT attendance_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.book_issues
    ADD CONSTRAINT book_issues_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.co_po_maps
    ADD CONSTRAINT co_po_maps_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.course_outcomes
    ADD CONSTRAINT course_outcomes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.exam_cycles
    ADD CONSTRAINT exam_cycles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.exam_fee_payments
    ADD CONSTRAINT exam_fee_payments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.exam_registrations
    ADD CONSTRAINT exam_registrations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.exam_schedules
    ADD CONSTRAINT exam_schedules_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.exam_scripts
    ADD CONSTRAINT exam_scripts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fee_categories
    ADD CONSTRAINT fee_categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fee_payments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fee_semester_configs
    ADD CONSTRAINT fee_semester_configs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fee_transactions
    ADD CONSTRAINT fee_transactions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fee_waivers
    ADD CONSTRAINT fee_waivers_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.graduations
    ADD CONSTRAINT graduations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hall_tickets
    ADD CONSTRAINT hall_tickets_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_attendance
    ADD CONSTRAINT hostel_attendance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_beds
    ADD CONSTRAINT hostel_beds_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_buildings
    ADD CONSTRAINT hostel_buildings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_complaints
    ADD CONSTRAINT hostel_complaints_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_fee_structures
    ADD CONSTRAINT hostel_fee_structures_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_floors
    ADD CONSTRAINT hostel_floors_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_gate_passes
    ADD CONSTRAINT hostel_gate_passes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_mess_fee_structures
    ADD CONSTRAINT hostel_mess_fee_structures_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_room_bills
    ADD CONSTRAINT hostel_room_bills_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_rooms
    ADD CONSTRAINT hostel_rooms_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_stay_logs
    ADD CONSTRAINT hostel_stay_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hostel_visitors
    ADD CONSTRAINT hostel_visitors_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.institution_budgets
    ADD CONSTRAINT institution_budgets_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.institution_settings
    ADD CONSTRAINT institution_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.program_outcomes
    ADD CONSTRAINT program_outcomes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.promotion_criteria
    ADD CONSTRAINT promotion_criteria_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.promotion_evaluations
    ADD CONSTRAINT promotion_evaluations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.regulations
    ADD CONSTRAINT regulations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);
ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.salary_grades
    ADD CONSTRAINT salary_grades_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.scholarship_beneficiaries
    ADD CONSTRAINT scholarship_beneficiaries_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.scholarship_schemes
    ADD CONSTRAINT scholarship_schemes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT section_incharges_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.semester_results
    ADD CONSTRAINT semester_results_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sequelize_data
    ADD CONSTRAINT sequelize_data_pkey PRIMARY KEY (name);
ALTER TABLE ONLY public.sequelize_meta
    ADD CONSTRAINT sequelize_meta_pkey PRIMARY KEY (name);
ALTER TABLE ONLY public.special_trips
    ADD CONSTRAINT special_trips_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.staff_attendance
    ADD CONSTRAINT staff_attendance_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.student_awards
    ADD CONSTRAINT student_awards_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT student_fee_charges_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.transport_drivers
    ADD CONSTRAINT transport_drivers_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.transport_routes
    ADD CONSTRAINT transport_routes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.transport_stops
    ADD CONSTRAINT transport_stops_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.transport_vehicles
    ADD CONSTRAINT transport_vehicles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT trip_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.vehicle_route_assignments
    ADD CONSTRAINT vehicle_route_assignments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);

-- 5. Unique Constraints
ALTER TABLE ONLY public.admission_configs
    ADD CONSTRAINT admission_configs_batch_year_key UNIQUE (batch_year);
ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_code_key UNIQUE (code);
ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_isbn_key UNIQUE (isbn);
ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_isbn_key1 UNIQUE (isbn);
ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_code_key UNIQUE (code);
ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);
ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);
ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key1 UNIQUE (name);
ALTER TABLE ONLY public.fee_transactions
    ADD CONSTRAINT fee_transactions_transaction_number_key UNIQUE (transaction_number);
ALTER TABLE ONLY public.hall_tickets
    ADD CONSTRAINT hall_tickets_ticket_number_key UNIQUE (ticket_number);
ALTER TABLE ONLY public.hall_tickets
    ADD CONSTRAINT hall_tickets_ticket_number_key1 UNIQUE (ticket_number);
ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_date_key UNIQUE (date);
ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_date_key1 UNIQUE (date);
ALTER TABLE ONLY public.institution_settings
    ADD CONSTRAINT institution_settings_setting_key_key UNIQUE (setting_key);
ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);
ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key1 UNIQUE (name);
ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_slug_key1 UNIQUE (slug);
ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_code_key UNIQUE (code);
ALTER TABLE ONLY public.regulations
    ADD CONSTRAINT regulations_name_key UNIQUE (name);
ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);
ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key1 UNIQUE (name);
ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_slug_key1 UNIQUE (slug);
ALTER TABLE ONLY public.salary_grades
    ADD CONSTRAINT salary_grades_name_key UNIQUE (name);
ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public.transport_drivers
    ADD CONSTRAINT transport_drivers_driver_license_number_key UNIQUE (driver_license_number);
ALTER TABLE ONLY public.transport_routes
    ADD CONSTRAINT transport_routes_route_code_key UNIQUE (route_code);
ALTER TABLE ONLY public.transport_vehicles
    ADD CONSTRAINT transport_vehicles_registration_number_key UNIQUE (registration_number);
ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT unique_room_per_block UNIQUE (block_id, room_number);
ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT unique_section_incharge_per_academic_year UNIQUE (program_id, batch_year, section, academic_year);
ALTER TABLE ONLY public.semester_results
    ADD CONSTRAINT unique_semester_result_per_student UNIQUE (student_id, semester, batch_year);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_aadhaar_number_key UNIQUE (aadhaar_number);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_admission_number_key UNIQUE (admission_number);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_biometric_device_id_key UNIQUE (biometric_device_id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key10 UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key11 UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key5 UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key6 UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key7 UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key8 UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key9 UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_passport_number_key UNIQUE (passport_number);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_student_id_key UNIQUE (student_id);

-- 6. Indexes
CREATE INDEX audit_logs_action ON public.audit_logs USING btree (action);
CREATE INDEX audit_logs_entity_type_entity_id ON public.audit_logs USING btree (entity_type, entity_id);
CREATE INDEX audit_logs_user_id ON public.audit_logs USING btree (user_id);
CREATE INDEX courses_department_id ON public.courses USING btree (department_id);
CREATE INDEX courses_is_active ON public.courses USING btree (is_active);
CREATE INDEX courses_program_id ON public.courses USING btree (program_id);
CREATE INDEX departments_hod_id ON public.departments USING btree (hod_id);
CREATE INDEX departments_is_active ON public.departments USING btree (is_active);
CREATE INDEX exam_reverifications_created_at ON public.exam_reverifications USING btree (created_at);
CREATE INDEX exam_reverifications_exam_schedule_id ON public.exam_reverifications USING btree (exam_schedule_id);
CREATE INDEX exam_reverifications_payment_status ON public.exam_reverifications USING btree (payment_status);
CREATE INDEX exam_reverifications_status ON public.exam_reverifications USING btree (status);
CREATE INDEX exam_reverifications_student_id ON public.exam_reverifications USING btree (student_id);
CREATE INDEX exam_scripts_exam_schedule_id ON public.exam_scripts USING btree (exam_schedule_id);
CREATE INDEX exam_scripts_is_visible ON public.exam_scripts USING btree (is_visible);
CREATE INDEX exam_scripts_student_id ON public.exam_scripts USING btree (student_id);
CREATE INDEX graduations_status ON public.graduations USING btree (status);
CREATE INDEX graduations_student_id ON public.graduations USING btree (student_id);
CREATE INDEX hostel_allocations_room_id_status ON public.hostel_allocations USING btree (room_id, status);
CREATE INDEX hostel_allocations_student_id_status ON public.hostel_allocations USING btree (student_id, status);
CREATE INDEX hostel_attendance_student_id_date ON public.hostel_attendance USING btree (student_id, date);
CREATE INDEX hostel_beds_room_id_status ON public.hostel_beds USING btree (room_id, status);
CREATE INDEX hostel_complaints_status ON public.hostel_complaints USING btree (status);
CREATE INDEX hostel_fines_fine_type ON public.hostel_fines USING btree (fine_type);
CREATE INDEX hostel_fines_issued_date ON public.hostel_fines USING btree (issued_date);
CREATE INDEX hostel_fines_status ON public.hostel_fines USING btree (status);
CREATE INDEX hostel_fines_student_id ON public.hostel_fines USING btree (student_id);
CREATE INDEX hostel_gate_passes_student_id_status ON public.hostel_gate_passes USING btree (student_id, status);
CREATE INDEX hostel_room_bill_distributions_allocation_id ON public.hostel_room_bill_distributions USING btree (allocation_id);
CREATE INDEX hostel_room_bill_distributions_room_bill_id ON public.hostel_room_bill_distributions USING btree (room_bill_id);
CREATE INDEX hostel_room_bill_distributions_student_id ON public.hostel_room_bill_distributions USING btree (student_id);
CREATE INDEX hostel_room_bills_bill_type ON public.hostel_room_bills USING btree (bill_type);
CREATE INDEX hostel_room_bills_room_id ON public.hostel_room_bills USING btree (room_id);
CREATE INDEX hostel_room_bills_status ON public.hostel_room_bills USING btree (status);
CREATE INDEX hostel_rooms_building_id_floor_id ON public.hostel_rooms USING btree (building_id, floor_id);
CREATE INDEX hostel_rooms_status ON public.hostel_rooms USING btree (status);
CREATE INDEX hostel_stay_logs_allocation_id ON public.hostel_stay_logs USING btree (allocation_id);
CREATE INDEX hostel_stay_logs_student_id ON public.hostel_stay_logs USING btree (student_id);
CREATE INDEX idx_fee_structures_batch_program_semester ON public.fee_structures USING btree (batch_year, program_id, semester);
CREATE INDEX idx_users_batch_year ON public.users USING btree (batch_year);
CREATE INDEX leave_requests_approver_id ON public.leave_requests USING btree (approver_id);
CREATE INDEX leave_requests_student_id_status ON public.leave_requests USING btree (student_id, status);
CREATE INDEX programs_degree_type ON public.programs USING btree (degree_type);
CREATE INDEX programs_department_id ON public.programs USING btree (department_id);
CREATE INDEX programs_is_active ON public.programs USING btree (is_active);
CREATE INDEX promotion_evaluations_student_id_from_semester ON public.promotion_evaluations USING btree (student_id, from_semester);
CREATE INDEX scholarship_beneficiaries_academic_year ON public.scholarship_beneficiaries USING btree (academic_year);
CREATE INDEX special_trips_status ON public.special_trips USING btree (status);
CREATE INDEX special_trips_trip_date ON public.special_trips USING btree (trip_date);
CREATE INDEX special_trips_vehicle_id ON public.special_trips USING btree (vehicle_id);
CREATE INDEX staff_attendance_date ON public.staff_attendance USING btree (date);
CREATE INDEX student_awards_academic_year ON public.student_awards USING btree (academic_year);
CREATE INDEX student_awards_level ON public.student_awards USING btree (level);
CREATE INDEX student_documents_status ON public.student_documents USING btree (status);
CREATE INDEX student_documents_type ON public.student_documents USING btree (type);
CREATE INDEX student_documents_user_id ON public.student_documents USING btree (user_id);
CREATE INDEX student_fee_charges_category_id ON public.student_fee_charges USING btree (category_id);
CREATE INDEX student_fee_charges_charge_type ON public.student_fee_charges USING btree (charge_type);
CREATE INDEX student_fee_charges_is_paid ON public.student_fee_charges USING btree (is_paid);
CREATE INDEX student_fee_charges_reference_id_reference_type ON public.student_fee_charges USING btree (reference_id, reference_type);
CREATE INDEX student_fee_charges_student_id ON public.student_fee_charges USING btree (student_id);
CREATE INDEX student_route_allocations_academic_year ON public.student_route_allocations USING btree (academic_year);
CREATE INDEX student_route_allocations_route_id ON public.student_route_allocations USING btree (route_id);
CREATE INDEX student_route_allocations_status ON public.student_route_allocations USING btree (status);
CREATE INDEX student_route_allocations_stop_id ON public.student_route_allocations USING btree (stop_id);
CREATE INDEX student_route_allocations_student_id ON public.student_route_allocations USING btree (student_id);
CREATE INDEX transport_drivers_is_active ON public.transport_drivers USING btree (is_active);
CREATE INDEX transport_drivers_staff_type ON public.transport_drivers USING btree (staff_type);
CREATE INDEX transport_routes_is_active ON public.transport_routes USING btree (is_active);
CREATE INDEX transport_stops_is_active ON public.transport_stops USING btree (is_active);
CREATE INDEX transport_stops_route_id ON public.transport_stops USING btree (route_id);
CREATE INDEX transport_stops_stop_sequence ON public.transport_stops USING btree (stop_sequence);
CREATE INDEX transport_vehicles_is_active ON public.transport_vehicles USING btree (is_active);
CREATE INDEX transport_vehicles_status ON public.transport_vehicles USING btree (status);
CREATE INDEX trip_logs_driver_id ON public.trip_logs USING btree (driver_id);
CREATE INDEX trip_logs_route_id ON public.trip_logs USING btree (route_id);
CREATE INDEX trip_logs_trip_date ON public.trip_logs USING btree (trip_date);
CREATE INDEX trip_logs_trip_type ON public.trip_logs USING btree (trip_type);
CREATE INDEX trip_logs_vehicle_id ON public.trip_logs USING btree (vehicle_id);
CREATE INDEX users_department_id ON public.users USING btree (department_id);
CREATE INDEX users_is_active ON public.users USING btree (is_active);
CREATE INDEX users_regulation_id ON public.users USING btree (regulation_id);
CREATE INDEX users_role ON public.users USING btree (role);
CREATE INDEX vehicle_route_assignments_driver_id ON public.vehicle_route_assignments USING btree (driver_id);
CREATE INDEX vehicle_route_assignments_is_active ON public.vehicle_route_assignments USING btree (is_active);
CREATE INDEX vehicle_route_assignments_route_id ON public.vehicle_route_assignments USING btree (route_id);
CREATE INDEX vehicle_route_assignments_vehicle_id ON public.vehicle_route_assignments USING btree (vehicle_id);

-- 7. Foreign Key Constraints (from schema)
ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_timetable_slot_id_fkey FOREIGN KEY (timetable_slot_id) REFERENCES public.timetable_slots(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.book_issues
    ADD CONSTRAINT book_issues_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.book_issues
    ADD CONSTRAINT book_issues_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.book_issues
    ADD CONSTRAINT book_issues_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.co_po_maps
    ADD CONSTRAINT co_po_maps_course_outcome_id_fkey FOREIGN KEY (course_outcome_id) REFERENCES public.course_outcomes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.co_po_maps
    ADD CONSTRAINT co_po_maps_program_outcome_id_fkey FOREIGN KEY (program_outcome_id) REFERENCES public.program_outcomes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.course_outcomes
    ADD CONSTRAINT course_outcomes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_regulation_id_fkey FOREIGN KEY (regulation_id) REFERENCES public.regulations(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.blocks(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_hod_id_fkey FOREIGN KEY (hod_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_department_id_fkey FOREIGN KEY (parent_department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.exam_cycles
    ADD CONSTRAINT exam_cycles_regulation_id_fkey FOREIGN KEY (regulation_id) REFERENCES public.regulations(id);
ALTER TABLE ONLY public.exam_fee_payments
    ADD CONSTRAINT exam_fee_payments_exam_cycle_id_fkey FOREIGN KEY (exam_cycle_id) REFERENCES public.exam_cycles(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.exam_fee_payments
    ADD CONSTRAINT exam_fee_payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_entered_by_fkey FOREIGN KEY (entered_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_exam_schedule_id_fkey FOREIGN KEY (exam_schedule_id) REFERENCES public.exam_schedules(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.exam_registrations
    ADD CONSTRAINT exam_registrations_exam_cycle_id_fkey FOREIGN KEY (exam_cycle_id) REFERENCES public.exam_cycles(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.exam_registrations
    ADD CONSTRAINT exam_registrations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_exam_fee_payment_id_fkey FOREIGN KEY (exam_fee_payment_id) REFERENCES public.exam_fee_payments(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_exam_mark_id_fkey FOREIGN KEY (exam_mark_id) REFERENCES public.exam_marks(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_exam_schedule_id_fkey FOREIGN KEY (exam_schedule_id) REFERENCES public.exam_schedules(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_fee_charge_id_fkey FOREIGN KEY (fee_charge_id) REFERENCES public.student_fee_charges(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.exam_reverifications
    ADD CONSTRAINT exam_reverifications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.exam_schedules
    ADD CONSTRAINT exam_schedules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.exam_schedules
    ADD CONSTRAINT exam_schedules_exam_cycle_id_fkey FOREIGN KEY (exam_cycle_id) REFERENCES public.exam_cycles(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.exam_scripts
    ADD CONSTRAINT exam_scripts_exam_schedule_id_fkey FOREIGN KEY (exam_schedule_id) REFERENCES public.exam_schedules(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.exam_scripts
    ADD CONSTRAINT exam_scripts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.exam_scripts
    ADD CONSTRAINT exam_scripts_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);
ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fee_payments_fee_charge_id_fkey FOREIGN KEY (fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fee_payments_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fee_payments_fee_structure_id_fkey1 FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fee_payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.fee_semester_configs
    ADD CONSTRAINT fee_semester_configs_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.fee_categories(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.fee_transactions
    ADD CONSTRAINT fee_transactions_collected_by_fkey FOREIGN KEY (collected_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.fee_transactions
    ADD CONSTRAINT fee_transactions_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id);
ALTER TABLE ONLY public.fee_transactions
    ADD CONSTRAINT fee_transactions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.fee_waivers
    ADD CONSTRAINT fee_waivers_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.fee_waivers
    ADD CONSTRAINT fee_waivers_fee_category_id_fkey FOREIGN KEY (fee_category_id) REFERENCES public.fee_categories(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.fee_waivers
    ADD CONSTRAINT fee_waivers_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.graduations
    ADD CONSTRAINT graduations_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.graduations
    ADD CONSTRAINT graduations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.hall_tickets
    ADD CONSTRAINT hall_tickets_exam_cycle_id_fkey FOREIGN KEY (exam_cycle_id) REFERENCES public.exam_cycles(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.hall_tickets
    ADD CONSTRAINT hall_tickets_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.hostel_beds(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.hostel_fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_mess_fee_charge_id_fkey FOREIGN KEY (mess_fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_mess_fee_id_fkey FOREIGN KEY (mess_fee_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_mess_fee_structure_id_fkey FOREIGN KEY (mess_fee_structure_id) REFERENCES public.hostel_mess_fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_rent_fee_charge_id_fkey FOREIGN KEY (rent_fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_rent_fee_id_fkey FOREIGN KEY (rent_fee_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.hostel_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_allocations
    ADD CONSTRAINT hostel_allocations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_attendance
    ADD CONSTRAINT hostel_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_beds
    ADD CONSTRAINT hostel_beds_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.hostel_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_complaints
    ADD CONSTRAINT hostel_complaints_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_complaints
    ADD CONSTRAINT hostel_complaints_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.hostel_rooms(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_complaints
    ADD CONSTRAINT hostel_complaints_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_allocation_id_fkey FOREIGN KEY (allocation_id) REFERENCES public.hostel_allocations(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_fee_charge_id_fkey FOREIGN KEY (fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.hostel_fines
    ADD CONSTRAINT hostel_fines_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_floors
    ADD CONSTRAINT hostel_floors_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.hostel_buildings(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_gate_passes
    ADD CONSTRAINT hostel_gate_passes_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_gate_passes
    ADD CONSTRAINT hostel_gate_passes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_allocation_id_fkey FOREIGN KEY (allocation_id) REFERENCES public.hostel_allocations(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_fee_charge_id_fkey FOREIGN KEY (fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_fee_structure_id_fkey1 FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_room_bill_id_fkey FOREIGN KEY (room_bill_id) REFERENCES public.hostel_room_bills(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_room_bill_distributions
    ADD CONSTRAINT hostel_room_bill_distributions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_room_bills
    ADD CONSTRAINT hostel_room_bills_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.hostel_room_bills
    ADD CONSTRAINT hostel_room_bills_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.hostel_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_rooms
    ADD CONSTRAINT hostel_rooms_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.hostel_buildings(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_rooms
    ADD CONSTRAINT hostel_rooms_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.hostel_floors(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_stay_logs
    ADD CONSTRAINT hostel_stay_logs_allocation_id_fkey FOREIGN KEY (allocation_id) REFERENCES public.hostel_allocations(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_stay_logs
    ADD CONSTRAINT hostel_stay_logs_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.hostel_beds(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.hostel_stay_logs
    ADD CONSTRAINT hostel_stay_logs_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.hostel_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_stay_logs
    ADD CONSTRAINT hostel_stay_logs_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.hostel_visitors
    ADD CONSTRAINT hostel_visitors_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.institution_budgets
    ADD CONSTRAINT institution_budgets_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.program_outcomes
    ADD CONSTRAINT program_outcomes_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.promotion_criteria
    ADD CONSTRAINT promotion_criteria_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.promotion_evaluations
    ADD CONSTRAINT promotion_evaluations_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.promotion_evaluations
    ADD CONSTRAINT promotion_evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.blocks(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.salary_grades(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.scholarship_beneficiaries
    ADD CONSTRAINT scholarship_beneficiaries_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.scholarship_beneficiaries
    ADD CONSTRAINT scholarship_beneficiaries_scheme_id_fkey FOREIGN KEY (scheme_id) REFERENCES public.scholarship_schemes(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.scholarship_beneficiaries
    ADD CONSTRAINT scholarship_beneficiaries_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT section_incharges_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT section_incharges_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT section_incharges_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.section_incharges
    ADD CONSTRAINT section_incharges_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.semester_results
    ADD CONSTRAINT semester_results_exam_cycle_id_fkey FOREIGN KEY (exam_cycle_id) REFERENCES public.exam_cycles(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.semester_results
    ADD CONSTRAINT semester_results_published_by_fkey FOREIGN KEY (published_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.semester_results
    ADD CONSTRAINT semester_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.special_trips
    ADD CONSTRAINT special_trips_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.special_trips
    ADD CONSTRAINT special_trips_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.transport_drivers(id);
ALTER TABLE ONLY public.special_trips
    ADD CONSTRAINT special_trips_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.special_trips
    ADD CONSTRAINT special_trips_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.transport_vehicles(id);
ALTER TABLE ONLY public.staff_attendance
    ADD CONSTRAINT staff_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.student_awards
    ADD CONSTRAINT student_awards_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.student_awards
    ADD CONSTRAINT student_awards_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT student_fee_charges_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.fee_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT student_fee_charges_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT student_fee_charges_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.fee_payments(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.student_fee_charges
    ADD CONSTRAINT student_fee_charges_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_fee_charge_id_fkey FOREIGN KEY (fee_charge_id) REFERENCES public.student_fee_charges(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id);
ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.transport_routes(id);
ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_stop_id_fkey FOREIGN KEY (stop_id) REFERENCES public.transport_stops(id);
ALTER TABLE ONLY public.student_route_allocations
    ADD CONSTRAINT student_route_allocations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.blocks(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_course_id_fkey1 FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_faculty_id_fkey1 FOREIGN KEY (faculty_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_timetable_id_fkey FOREIGN KEY (timetable_id) REFERENCES public.timetables(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.transport_stops
    ADD CONSTRAINT transport_stops_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.transport_routes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT trip_logs_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.transport_drivers(id);
ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT trip_logs_logged_by_fkey FOREIGN KEY (logged_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT trip_logs_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.transport_routes(id);
ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT trip_logs_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.transport_vehicles(id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_regulation_id_fkey FOREIGN KEY (regulation_id) REFERENCES public.regulations(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_salary_grade_id_fkey FOREIGN KEY (salary_grade_id) REFERENCES public.salary_grades(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.vehicle_route_assignments
    ADD CONSTRAINT vehicle_route_assignments_conductor_id_fkey FOREIGN KEY (conductor_id) REFERENCES public.transport_drivers(id);
ALTER TABLE ONLY public.vehicle_route_assignments
    ADD CONSTRAINT vehicle_route_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.transport_drivers(id);
ALTER TABLE ONLY public.vehicle_route_assignments
    ADD CONSTRAINT vehicle_route_assignments_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.transport_routes(id);
ALTER TABLE ONLY public.vehicle_route_assignments
    ADD CONSTRAINT vehicle_route_assignments_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.transport_vehicles(id);

-- 8. Foreign Key Constraints (extracted from inline)
ALTER TABLE ONLY public.job_postings ADD CONSTRAINT job_postings_company_id_inline_fkey FOREIGN KEY (company_id) REFERENCES public.placement_companies(id);
ALTER TABLE ONLY public.placement_drives ADD CONSTRAINT placement_drives_job_posting_id_inline_fkey FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id);
ALTER TABLE ONLY public.drive_eligibility ADD CONSTRAINT drive_eligibility_drive_id_inline_fkey FOREIGN KEY (drive_id) REFERENCES public.placement_drives(id);
ALTER TABLE ONLY public.drive_rounds ADD CONSTRAINT drive_rounds_drive_id_inline_fkey FOREIGN KEY (drive_id) REFERENCES public.placement_drives(id);
ALTER TABLE ONLY public.student_placement_profiles ADD CONSTRAINT student_placement_profiles_user_id_inline_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.student_placement_profiles ADD CONSTRAINT student_placement_profiles_placed_at_company_id_inline_fkey FOREIGN KEY (placed_at_company_id) REFERENCES public.placement_companies(id);

-- 9. Additional Modules

-- Proctoring Module
CREATE TABLE IF NOT EXISTS public.proctor_assignments (
    id uuid NOT NULL PRIMARY KEY,
    proctor_id uuid NOT NULL,
    student_id uuid NOT NULL,
    department_id uuid NOT NULL,
    assignment_type character varying(50) DEFAULT 'ACADEMIC'::character varying,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    is_active boolean DEFAULT true,
    assigned_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.proctor_sessions (
    id uuid NOT NULL PRIMARY KEY,
    assignment_id uuid NOT NULL,
    session_date timestamp with time zone NOT NULL,
    session_type character varying(50),
    duration_minutes integer,
    location character varying(200),
    agenda text,
    notes text,
    attendance_status character varying(20) DEFAULT 'SCHEDULED'::character varying,
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.proctor_feedback (
    id uuid NOT NULL PRIMARY KEY,
    assignment_id uuid NOT NULL,
    session_id uuid,
    feedback_text text NOT NULL,
    feedback_category character varying(50),
    severity character varying(20) DEFAULT 'NEUTRAL'::character varying,
    is_visible_to_student boolean DEFAULT false,
    is_visible_to_parent boolean DEFAULT false,
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.proctor_alerts (
    id uuid NOT NULL PRIMARY KEY,
    proctor_id uuid NOT NULL,
    student_id uuid NOT NULL,
    alert_type character varying(50) NOT NULL,
    alert_message text NOT NULL,
    severity character varying(20) DEFAULT 'INFO'::character varying,
    is_read boolean DEFAULT false,
    triggered_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    read_at timestamp with time zone
);

ALTER TABLE ONLY public.proctor_assignments ADD CONSTRAINT proctor_assignments_proctor_id_fkey FOREIGN KEY (proctor_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.proctor_assignments ADD CONSTRAINT proctor_assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.proctor_assignments ADD CONSTRAINT proctor_assignments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.proctor_assignments ADD CONSTRAINT proctor_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.proctor_sessions ADD CONSTRAINT proctor_sessions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.proctor_assignments(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.proctor_sessions ADD CONSTRAINT proctor_sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.proctor_feedback ADD CONSTRAINT proctor_feedback_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.proctor_assignments(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.proctor_feedback ADD CONSTRAINT proctor_feedback_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.proctor_sessions(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.proctor_feedback ADD CONSTRAINT proctor_feedback_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.proctor_alerts ADD CONSTRAINT proctor_alerts_proctor_id_fkey FOREIGN KEY (proctor_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.proctor_alerts ADD CONSTRAINT proctor_alerts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);

CREATE INDEX IF NOT EXISTS idx_proctor_assignments_proctor ON public.proctor_assignments(proctor_id, is_active);
CREATE INDEX IF NOT EXISTS idx_proctor_assignments_student ON public.proctor_assignments(student_id, is_active);
CREATE INDEX IF NOT EXISTS idx_proctor_sessions_assignment ON public.proctor_sessions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_proctor_feedback_assignment ON public.proctor_feedback(assignment_id);
CREATE INDEX IF NOT EXISTS idx_proctor_alerts_proctor_read ON public.proctor_alerts(proctor_id, is_read);

-- Refactored Fee Tables
CREATE TABLE IF NOT EXISTS public.academic_fee_payments (
    id uuid NOT NULL PRIMARY KEY,
    fee_payment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    fee_structure_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_charge_payments (
    id uuid NOT NULL PRIMARY KEY,
    fee_payment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    student_fee_charge_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

ALTER TABLE ONLY public.academic_fee_payments ADD CONSTRAINT academic_fee_payments_fee_payment_id_fkey FOREIGN KEY (fee_payment_id) REFERENCES public.fee_payments(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.academic_fee_payments ADD CONSTRAINT academic_fee_payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.academic_fee_payments ADD CONSTRAINT academic_fee_payments_fee_structure_id_fkey FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id);

ALTER TABLE ONLY public.student_charge_payments ADD CONSTRAINT student_charge_payments_fee_payment_id_fkey FOREIGN KEY (fee_payment_id) REFERENCES public.fee_payments(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.student_charge_payments ADD CONSTRAINT student_charge_payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.student_charge_payments ADD CONSTRAINT student_charge_payments_student_fee_charge_id_fkey FOREIGN KEY (student_fee_charge_id) REFERENCES public.student_fee_charges(id);

-- Missing Placement Module Tables
CREATE TABLE IF NOT EXISTS public.companies (
    id uuid NOT NULL PRIMARY KEY,
    name character varying(255) NOT NULL,
    industry character varying(100),
    location character varying(255),
    website character varying(255),
    company_tier character varying(50) DEFAULT 'regular'::character varying,
    tier_package_min numeric(5,2),
    logo_url character varying(500),
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.company_contacts (
    id uuid NOT NULL PRIMARY KEY,
    company_id uuid,
    name character varying(255) NOT NULL,
    designation character varying(100),
    email character varying(255),
    phone character varying(20),
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.placement_policies (
    id uuid NOT NULL PRIMARY KEY,
    policy_name character varying(255) NOT NULL,
    policy_type character varying(50),
    policy_rules jsonb,
    is_active boolean DEFAULT true,
    academic_year character varying(10),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.placement_notifications (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid,
    notification_type character varying(50),
    title character varying(255),
    message text,
    related_drive_id uuid,
    action_url character varying(500),
    is_read boolean DEFAULT false,
    priority character varying(20) DEFAULT 'normal'::character varying,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.placement_documents (
    id uuid NOT NULL PRIMARY KEY,
    document_type character varying(50),
    related_entity_type character varying(50),
    related_entity_id uuid,
    file_name character varying(255),
    file_url character varying(500),
    file_size_kb integer,
    uploaded_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_applications (
    id uuid NOT NULL PRIMARY KEY,
    drive_id uuid NOT NULL,
    student_id uuid NOT NULL,
    current_round_id uuid,
    status character varying(50) DEFAULT 'applied'::character varying,
    resume_url character varying(500),
    is_shortlisted boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.round_results (
    id uuid NOT NULL PRIMARY KEY,
    round_id uuid NOT NULL,
    student_id uuid NOT NULL,
    status character varying(50),
    score numeric(5,2),
    remarks text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

ALTER TABLE ONLY public.company_contacts ADD CONSTRAINT company_contacts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.placement_notifications ADD CONSTRAINT placement_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.placement_notifications ADD CONSTRAINT placement_notifications_related_drive_id_fkey FOREIGN KEY (related_drive_id) REFERENCES public.placement_drives(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.placement_documents ADD CONSTRAINT placement_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.student_applications ADD CONSTRAINT student_applications_drive_id_fkey FOREIGN KEY (drive_id) REFERENCES public.placement_drives(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.student_applications ADD CONSTRAINT student_applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.student_applications ADD CONSTRAINT student_applications_current_round_id_fkey FOREIGN KEY (current_round_id) REFERENCES public.drive_rounds(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.round_results ADD CONSTRAINT round_results_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.drive_rounds(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.round_results ADD CONSTRAINT round_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_placement_notifications_user_read ON public.placement_notifications(user_id, is_read);
