import "dotenv/config";
import { Client } from "pg";

const schemaMap = {
  core: ["users", "sessions", "roles", "permissions", "role_permissions"],
  academics: [
    "departments",
    "programs",
    "courses",
    "course_faculties",
    "regulations",
    "timetables",
    "timetable_slots",
    "section_incharges",
    "semester_results",
    "attendance",
    "attendance_settings",
    "promotion_criteria",
    "promotion_evaluations",
    "graduations",
    "leave_requests",
    "student_profiles",
    "student_awards",
  ],
  hr: [
    "staff_attendance",
    "leave_balances",
    "salary_structures",
    "payslips",
    "salary_grades",
    "staff_profiles",
  ],
  admissions: ["admission_configs", "student_documents"],
  exams: [
    "exam_audit_logs",
    "exam_cycles",
    "exam_fee_configurations",
    "exam_fee_payments",
    "exam_student_eligibilities",
    "exam_timetables",
    "exam_timetable_history",
    "exam_marks",
    "exam_registrations",
    "exam_reverifications",
    "exam_schedules",
    "exam_scripts",
    "hall_tickets",
    "fee_config_audit_logs",
    "late_fee_slabs",
  ],
  fees: [
    "academic_fee_payments",
    "expenses",
    "fee_categories",
    "fee_payments",
    "fee_semester_configs",
    "fee_structures",
    "fee_transactions",
    "fee_waivers",
    "institution_budgets",
    "scholarship_beneficiaries",
    "scholarship_schemes",
    "student_fee_charges",
    "student_charge_payments",
    "vendors",
  ],
  hostel: [
    "hostel_allocations",
    "hostel_attendance",
    "hostel_beds",
    "hostel_buildings",
    "hostel_complaints",
    "hostel_fee_structures",
    "hostel_fines",
    "hostel_floors",
    "hostel_gate_passes",
    "hostel_mess_fee_structures",
    "hostel_rooms",
    "hostel_room_bills",
    "hostel_room_bill_distributions",
    "hostel_stay_logs",
    "hostel_visitors",
  ],
  infrastructure: ["blocks", "rooms"],
  obe: ["co_po_maps", "course_outcomes", "program_outcomes"],
  notifications: ["notifications"],
  placement: [
    "placement_companies",
    "companies",
    "company_contacts",
    "drive_eligibility",
    "drive_rounds",
    "job_postings",
    "placements",
    "placement_documents",
    "placement_drives",
    "placement_notifications",
    "placement_policies",
    "round_results",
    "student_applications",
    "student_placement_profiles",
  ],
  proctoring: [
    "proctor_sessions",
    "proctor_alerts",
    "proctor_assignments",
    "proctor_feedback",
  ],
  transport: [
    "transport_routes",
    "transport_drivers",
    "transport_vehicles",
    "transport_stops",
    "vehicle_route_assignments",
    "student_route_allocations",
    "special_trips",
    "trip_logs",
  ],
  library: ["books", "book_issues"],
  settings: ["audit_logs", "institution_settings", "holidays"],
};

const expectedSchemas = Object.keys(schemaMap);
const expectedTables = [];
const expectedTableNames = new Set();
const expectedBySchema = new Map();

for (const [schema, tables] of Object.entries(schemaMap)) {
  const set = new Set(tables);
  expectedBySchema.set(schema, set);
  for (const table of tables) {
    expectedTables.push({ schema, table });
    expectedTableNames.add(table);
  }
}

const allowedPublicTables = new Set(["sequelize_meta", "sequelize_data"]);

function logSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function run() {
  const client = new Client({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "unipilot",
    password: process.env.DB_PASSWORD || "password123",
    port: parseInt(process.env.DB_PORT || "5432", 10),
  });

  console.log("Connecting to database...");
  await client.connect();
  console.log(
    `Connected to ${client.database} at ${client.host}:${client.port} as ${client.user}`
  );

  const schemasRes = await client.query(
    "SELECT schema_name FROM information_schema.schemata WHERE schema_name = ANY($1)",
    [expectedSchemas]
  );
  const existingSchemas = new Set(schemasRes.rows.map((r) => r.schema_name));
  const missingSchemas = expectedSchemas.filter((s) => !existingSchemas.has(s));

  logSection("Schemas");
  if (missingSchemas.length === 0) {
    console.log("All expected schemas are present.");
  } else {
    console.log(`Missing schemas (${missingSchemas.length}):`);
    for (const s of missingSchemas) console.log(`- ${s}`);
  }

  const tablesRes = await client.query(
    `SELECT table_schema, table_name
     FROM information_schema.tables
     WHERE table_type = 'BASE TABLE'
       AND (table_schema = ANY($1) OR table_schema = 'public')
     ORDER BY table_schema, table_name`,
    [expectedSchemas]
  );

  const tablesBySchema = new Map();
  const tablesByName = new Map();

  for (const row of tablesRes.rows) {
    if (!tablesBySchema.has(row.table_schema)) {
      tablesBySchema.set(row.table_schema, new Set());
    }
    tablesBySchema.get(row.table_schema).add(row.table_name);

    if (!tablesByName.has(row.table_name)) {
      tablesByName.set(row.table_name, new Set());
    }
    tablesByName.get(row.table_name).add(row.table_schema);
  }

  const missingTables = [];
  const misplacedTables = [];

  for (const { schema, table } of expectedTables) {
    const schemaTables = tablesBySchema.get(schema);
    if (!schemaTables || !schemaTables.has(table)) {
      const foundSchemas = tablesByName.get(table);
      if (foundSchemas && foundSchemas.size > 0) {
        misplacedTables.push({
          table,
          expected: schema,
          actual: Array.from(foundSchemas).sort(),
        });
      } else {
        missingTables.push({ table, expected: schema });
      }
    }
  }

  logSection("Missing Expected Tables");
  if (missingTables.length === 0) {
    console.log("All expected tables are present in their schemas.");
  } else {
    for (const item of missingTables) {
      console.log(`- ${item.expected}.${item.table}`);
    }
  }

  logSection("Misplaced Expected Tables");
  if (misplacedTables.length === 0) {
    console.log("No expected tables found in the wrong schema.");
  } else {
    for (const item of misplacedTables) {
      console.log(
        `- ${item.table} expected in ${item.expected}, found in: ${item.actual.join(
          ", "
        )}`
      );
    }
  }

  const publicTables = tablesBySchema.get("public")
    ? Array.from(tablesBySchema.get("public")).sort()
    : [];
  const publicResidual = publicTables.filter(
    (t) => !allowedPublicTables.has(t)
  );

  logSection("Public Schema Tables (Non-System)");
  if (publicResidual.length === 0) {
    console.log("No non-system tables found in public schema.");
  } else {
    for (const t of publicResidual) {
      const note = expectedTableNames.has(t) ? " (expected)" : "";
      console.log(`- public.${t}${note}`);
    }
  }

  logSection("Unexpected Tables Inside Module Schemas");
  let unexpectedCount = 0;
  for (const [schema, tables] of tablesBySchema.entries()) {
    if (schema === "public") continue;
    const expectedSet = expectedBySchema.get(schema) || new Set();
    const extras = Array.from(tables).filter((t) => !expectedSet.has(t));
    if (extras.length > 0) {
      unexpectedCount += extras.length;
      console.log(`${schema}:`);
      for (const t of extras) {
        console.log(`- ${schema}.${t}`);
      }
    }
  }
  if (unexpectedCount === 0) {
    console.log("No unexpected tables found in module schemas.");
  }

  const hasIssues =
    missingSchemas.length > 0 || missingTables.length > 0 || misplacedTables.length > 0;
  if (hasIssues) {
    console.log("\nResult: Issues detected with schema/table placement.");
    process.exitCode = 1;
  } else {
    console.log("\nResult: Schema isolation looks correct for mapped tables.");
  }

  await client.end();
}

run().catch((err) => {
  console.error("Schema verification failed:", err.message);
  process.exit(1);
});
