"use strict";

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const passwordHash = await bcrypt.hash("UniPilot@2026", 10);

    // Helper functions for AP Data
    const apCities = [
      "Kakinada",
      "Rajamahendravaram",
      "Visakhapatnam",
      "Vijayawada",
      "Guntur",
      "Nellore",
      "Tirupati",
      "Anantapur",
      "Kurnool",
    ];
    const apSurnames = [
      "Palla",
      "Ganta",
      "Yalamanchili",
      "Penmetsa",
      "Mudragada",
      "Thota",
      "Nandamuri",
      "Konidela",
      "Daggubati",
      "Nara",
      "Allu",
      "Akkineni",
    ];
    const apFirstNamesMale = [
      "Ravi",
      "Suresh",
      "Venkatesh",
      "Pavan",
      "Rajesh",
      "Murthy",
      "Satyanarayana",
      "Prasad",
      "Lokesh",
      "Kalyan",
      "Nithin",
    ];
    const apFirstNamesFemale = [
      "Lakshmi",
      "Durga",
      "Anjali",
      "Kavita",
      "Sravani",
      "Deepthi",
      "Sirisha",
      "Keerthi",
      "Bhavani",
    ];
    const religions = ["Hindu", "Christian", "Muslim"];
    const castes = ["OC", "BC-A", "BC-B", "BC-D", "SC", "ST"];
    const occupations = [
      "Farmer",
      "Teacher",
      "Engineer",
      "Doctor",
      "Business",
      "Govt Employee",
      "Private Employee",
    ];

    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getPhone = () =>
      `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`;
    const getAadhaar = () =>
      `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const getPAN = () => `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`;
    const getDOB = (minAge, maxAge) => {
      const year =
        new Date().getFullYear() -
        Math.floor(Math.random() * (maxAge - minAge + 1) + minAge);
      const month = Math.floor(Math.random() * 12);
      const day = Math.floor(Math.random() * 28) + 1;
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };

    // ==========================================
    // 1. ENSURE ROLES EXISTS
    // ==========================================
    const requiredRoles = [
      {
        name: "Super Admin",
        slug: "super_admin",
        description: "Full system access",
      },
      { name: "Principal", slug: "principal", description: "Principal" },
      {
        name: "Academics Dean",
        slug: "academics_dean",
        description: "Academics dean",
      },
      {
        name: "Head of Department",
        slug: "hod",
        description: "Department management",
      },
      { name: "Faculty", slug: "faculty", description: "Teaching staff" },
      { name: "Student", slug: "student", description: "Enrolled students" },
      {
        name: "Admission Admin",
        slug: "admission_admin",
        description: "Manages admissions",
      },
      {
        name: "Admission Staff",
        slug: "admission_staff",
        description: "Admission operational staff",
      },
      {
        name: "Finance Admin",
        slug: "finance_admin",
        description: "Manages fees and accounts",
      },
      {
        name: "Finance Staff",
        slug: "finance_staff",
        description: "Finance operational staff",
      },
      {
        name: "Exam Admin",
        slug: "exam_admin",
        description: "Manages exams and results",
      },
      {
        name: "Exam Staff",
        slug: "exam_staff",
        description: "Exam operational staff",
      },
      {
        name: "HR Admin",
        slug: "hr_admin",
        description: "Manages employee records",
      },
      {
        name: "HR Staff",
        slug: "hr_staff",
        description: "HR operational staff",
      },
      {
        name: "Hostel Admin",
        slug: "hostel_admin",
        description: "Full hostel management access",
      },
      {
        name: "Hostel Staff",
        slug: "hostel_staff",
        description: "Day-to-day hostel operations",
      },
      {
        name: "Transport Admin",
        slug: "transport_admin",
        description: "Transport administrative access",
      },
      {
        name: "Transport Staff",
        slug: "transport_staff",
        description: "Transport operational staff",
      },
    ];

    for (const r of requiredRoles) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE slug = '${r.slug}'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT },
      );
      if (!existing) {
        await queryInterface.bulkInsert("roles", [
          {
            id: uuidv4(),
            ...r,
            is_system: true,
            field_config: JSON.stringify({}),
            created_at: now,
            updated_at: now,
          },
        ]);
      }
    }

    const rolesList = await queryInterface.sequelize.query(
      `SELECT id, slug FROM roles`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    const roleMap = rolesList.reduce((acc, r) => {
      acc[r.slug] = r.id;
      return acc;
    }, {});

    // ==========================================
    // 2. ENSURE SALARY GRADE EXISTS
    // ==========================================
    const [existingGrade] = await queryInterface.sequelize.query(
      `SELECT id FROM salary_grades LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    let salaryGradeId = existingGrade?.id;
    if (!salaryGradeId) {
      salaryGradeId = uuidv4();
      await queryInterface.bulkInsert("salary_grades", [
        {
          id: salaryGradeId,
          name: "Standard Grade",
          basic_salary: 50000,
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    // ==========================================
    // 3. SEED DEPARTMENTS (IDEMPOTENT)
    // ==========================================
    const deptDefs = [
      {
        name: "Computer Science and Engineering",
        code: "CSE",
        description:
          "Department specializing in high-performance computing, software engineering, and AI.",
        type: "academic",
        email: "dept.cse@university.in",
        phone: "+91 884 2300001",
        office_location: "Block A, 1st Floor",
        established_date: "2010-06-01",
        is_active: true,
      },
      {
        name: "Information Technology",
        code: "IT",
        description:
          "Department focused on information systems, cybersecurity, and cloud technologies.",
        type: "academic",
        email: "dept.it@university.in",
        phone: "+91 884 2300002",
        office_location: "Block B, 1st Floor",
        established_date: "2012-06-01",
        is_active: true,
      },
    ];

    const deptMap = {};
    for (const d of deptDefs) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM departments WHERE code = '${d.code}'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT },
      );
      if (existing) {
        deptMap[d.code] = existing.id;
      } else {
        const id = uuidv4();
        await queryInterface.bulkInsert("departments", [
          {
            id,
            ...d,
            created_at: now,
            updated_at: now,
          },
        ]);
        deptMap[d.code] = id;
      }
    }

    // ==========================================
    // 4. SEED PROGRAMS (IDEMPOTENT)
    // ==========================================
    const progDefs = deptDefs.map((d) => ({
      name: `B.Tech in ${d.name}`,
      code: `BTECH-${d.code}`,
      description: `Comprehensive 4-year undergraduate program in ${d.name}`,
      degree_type: "undergraduate",
      duration_years: 4,
      total_semesters: 8,
      department_id: deptMap[d.code],
      min_percentage: 60.0,
      max_intake: 120,
      is_active: true,
    }));

    const progMap = {};
    for (const p of progDefs) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM programs WHERE code = '${p.code}'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT },
      );
      if (existing) {
        progMap[p.code.split("-")[1]] = existing.id;
      } else {
        const id = uuidv4();
        await queryInterface.bulkInsert("programs", [
          {
            id,
            ...p,
            created_at: now,
            updated_at: now,
          },
        ]);
        progMap[p.code.split("-")[1]] = id;
      }
    }

    // ==========================================
    // 5. SEED REGULATIONS (IDEMPOTENT)
    // ==========================================
    const regDefs = [
      {
        name: "R20",
        academic_year: "2020-2021",
        type: "semester",
        grading_system: "CBCS",
        description: "Standard regulation for admissions during 2020-2022",
        exam_structure: JSON.stringify({}),
        grade_scale: JSON.stringify([]),
        is_active: true,
      },
      {
        name: "R23",
        academic_year: "2023-2024",
        type: "semester",
        grading_system: "CBCS",
        description: "Revised regulation with enhanced vocational credits",
        exam_structure: JSON.stringify({}),
        grade_scale: JSON.stringify([]),
        is_active: true,
      },
    ];

    const regMap = {};
    for (const r of regDefs) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM regulations WHERE name = '${r.name}'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT },
      );
      if (existing) {
        regMap[r.name] = existing.id;
      } else {
        const id = uuidv4();
        await queryInterface.bulkInsert("regulations", [
          {
            id,
            ...r,
            created_at: now,
            updated_at: now,
          },
        ]);
        regMap[r.name] = id;
      }
    }
    const r20Id = regMap["R20"];
    const r23Id = regMap["R23"];

    // ==========================================
    // 6. SEED COURSES (Check existence per code)
    // ==========================================
    const coursesToInsert = [];
    const deptCodes = ["CSE", "IT"];
    const regs = [
      { id: r20Id, name: "R20" },
      { id: r23Id, name: "R23" },
    ];
    const codesProcessedThisBatch = new Set();

    const getCourseName = (dept, reg, sem, type, index) => {
      const isR23 = reg === "R23";
      if (type === "theory") {
        const r23Subjects = {
          1: [
            "Communicative English",
            "Chemistry",
            "Fundamental of EE",
            "Introduction to Programming",
          ],
          2: [
            "Linear Algebra & Calculus",
            "Engineering Physics",
            "Basic Civil & Mech",
            "Data Structures",
          ],
          3: [
            "Discrete Mathematics",
            "Object Oriented Programming",
            "Computer Organization",
            "Digital Logic Design",
          ],
          4: [
            "Design and Analysis of Algorithms",
            "Operating Systems",
            "Software Engineering",
            "DBMS",
          ],
          6: [
            "Machine Learning",
            "Computer Networks",
            "Web Technologies",
            "Automata Theory",
          ],
          7: [
            "Cloud Computing",
            "Cryptography & Network Security",
            "Big Data",
            "Mobile Computing",
          ],
        };
        const r20Subjects = {
          1: [
            "Mathematics - I",
            "Applied Physics",
            "Programming for C",
            "Communicative English",
          ],
          2: [
            "Mathematics - II",
            "Applied Chemistry",
            "Data Structures",
            "Basic EE",
          ],
          3: [
            "Discrete Mathematical Structures",
            "Data Structures & Algorithms",
            "Digital Logic Design",
            "Python Programming",
          ],
          4: [
            "Probability and Statistics",
            "OS & Software Engineering",
            "DBMS",
            "Computer Organization",
          ],
          6: [
            "Machine Learning",
            "Computer Networks",
            "Web Technologies",
            "Automata Theory",
          ],
          7: [
            "Cloud Computing",
            "Cryptography & Network Security",
            "Big Data",
            "Artificial Intelligence",
          ],
        };
        const subjects = isR23 ? r23Subjects[sem] : r20Subjects[sem];
        return subjects
          ? subjects[index - 1]
          : `${dept} Theory ${reg} ${sem}0${index}`;
      }
      if (type === "lab") {
        return `${dept} ${isR23 ? "Engg" : "Practice"} Lab ${sem}`;
      }
      return `${reg} Environmental Sciences Sem ${sem}`;
    };

    for (const deptCode of deptCodes) {
      for (const reg of regs) {
        for (let sem = 1; sem <= 8; sem++) {
          const commonParams = {
            department_id: deptMap[deptCode],
            program_id: progMap[deptCode],
            semester: sem,
            regulation_id: reg.id,
            description: `Core academic requirement for ${deptCode} under ${reg.name} curriculum.`,
            syllabus_url: null,
            syllabus_data: JSON.stringify([]),
            prerequisites: JSON.stringify([]),
            is_active: true,
            created_at: now,
            updated_at: now,
          };

          const addCourse = async (name, code, credits, type) => {
            if (codesProcessedThisBatch.has(code)) return;
            codesProcessedThisBatch.add(code);

            const [existing] = await queryInterface.sequelize.query(
              `SELECT id FROM courses WHERE code = '${code}'`,
              { type: queryInterface.sequelize.QueryTypes.SELECT },
            );
            if (!existing) {
              coursesToInsert.push({
                ...commonParams,
                id: uuidv4(),
                name,
                code,
                credits,
                course_type: type,
              });
            }
          };

          if (sem === 5) {
            await addCourse(
              "Summer Internship",
              `${deptCode}${reg.name === "R20" ? "20" : "23"}501`,
              2,
              "practical",
            );
          } else if (sem === 8) {
            await addCourse(
              "Major Project",
              `${deptCode}${reg.name === "R20" ? "20" : "23"}801`,
              12,
              "practical",
            );
          } else {
            for (let i = 1; i <= 4; i++) {
              await addCourse(
                getCourseName(deptCode, reg.name, sem, "theory", i),
                `${deptCode}${reg.name === "R20" ? "20" : "23"}${sem}0${i}`,
                3,
                "theory",
              );
            }
            await addCourse(
              getCourseName(deptCode, reg.name, sem, "lab"),
              `${deptCode}${reg.name === "R20" ? "20" : "23"}${sem}05L`,
              2,
              "practical",
            );
            await addCourse(
              getCourseName(deptCode, reg.name, sem, "nc"),
              `NC${reg.name === "R20" ? "20" : "23"}${sem}06`,
              0,
              "theory",
            );
          }
        }
      }
    }
    if (coursesToInsert.length > 0) {
      await queryInterface.bulkInsert("courses", coursesToInsert);
    }

    // ==========================================
    // 7. SEED USERS (Check existence per email)
    // ==========================================
    const users = [];
    const emailsProcessedThisBatch = new Set();

    const getBaseUser = (userType = "staff") => {
      const id = uuidv4();
      const dob = userType === "student" ? getDOB(18, 22) : getDOB(30, 60);
      const gender = getRandom(["male", "female"]);
      const city = getRandom(apCities);
      const firstName =
        gender === "male"
          ? getRandom(apFirstNamesMale)
          : getRandom(apFirstNamesFemale);
      const lastName = getRandom(apSurnames);
      const fatherFirstName = getRandom(apFirstNamesMale);
      const motherFirstName = getRandom(apFirstNamesFemale);
      return {
        id,
        first_name: firstName,
        last_name: lastName,
        phone: getPhone(),
        password_hash: passwordHash,
        is_active: true,
        is_verified: true,
        email_verified_at: now,
        date_of_birth: dob,
        gender: gender,
        address: `D.No ${Math.floor(10 + Math.random() * 90)}, ${getRandom(["Main Road", "Temple Street", "Subhash Road"])}, ${city}`,
        city: city,
        state: "Andhra Pradesh",
        zip_code: String(533001 + Math.floor(Math.random() * 5000)),
        religion: getRandom(religions),
        caste: getRandom(castes),
        nationality: "Indian",
        aadhaar_number: getAadhaar(),
        pan_number: getPAN(),
        passport_number: null,
        biometric_device_id: `BIO-${id.substring(0, 8).toUpperCase()}`,
        bank_details: JSON.stringify({
          bank: getRandom([
            "State Bank of India",
            "HDFC Bank",
            "ICICI Bank",
            "Andhra Bank",
          ]),
          acc: String(Math.floor(100000000000 + Math.random() * 900000000000)),
          branch: city,
          ifsc: "IFSC" + String(Math.floor(1000000 + Math.random() * 9000000)),
        }),
        parent_details: JSON.stringify({
          father_name: fatherFirstName + " " + lastName,
          mother_name: motherFirstName + " " + lastName,
          father_occupation: getRandom(occupations),
          mother_occupation: getRandom(["Housewife", ...occupations]),
          annual_income: Math.floor(100000 + Math.random() * 2000000),
          guardian_phone: getPhone(),
        }),
        previous_academics: JSON.stringify([
          {
            level: userType === "student" ? "Intermediate" : "Post Graduation",
            school: getRandom([
              "Junior College",
              "Andhra University",
              "JNTUK",
              "Sri Chaitanya",
              "Narayana",
            ]),
            board: userType === "student" ? "BIEAP" : "University board",
            passing_year:
              new Date(dob).getFullYear() + (userType === "student" ? 17 : 24),
            percentage: Number((80 + Math.random() * 15).toFixed(2)),
          },
        ]),
        custom_fields: JSON.stringify({
          interest: getRandom(["AI", "Web Dev", "Sports", "Music", "Reading"]),
          blood_group: getRandom(["A+", "B+", "O+", "AB+", "O-"]),
        }),
        bio: `${firstName} is a dedicated individual committed to growth in the ${userType} community.`,
        created_at: now,
        updated_at: now,
        is_temporary_id: false,
      };
    };

    const adminSpecs = [
      {
        role: "super_admin",
        first: "Prabhath",
        last: "Balla",
        des: "Super Administrator",
      },
      {
        role: "principal",
        first: "Dr. Prabhakar",
        last: "Rao",
        des: "Principal",
      },
      {
        role: "academics_dean",
        first: "Prof. Ramana",
        last: "Murthy",
        des: "Academics Dean",
      },
      {
        role: "admission_admin",
        first: "Venkata",
        last: "Ramana",
        des: "Admission Administrator",
      },
      { role: "admission_staff", count: 2, des: "Admission Staff" },
      {
        role: "finance_admin",
        first: "Nageswara",
        last: "Rao",
        des: "Finance Administrator",
      },
      { role: "finance_staff", count: 2, des: "Finance Staff" },
      {
        role: "hr_admin",
        first: "Srinivasa",
        last: "Raju",
        des: "HR Administrator",
      },
      { role: "hr_staff", count: 2, des: "HR Staff" },
      {
        role: "hostel_admin",
        first: "Satish",
        last: "Kumar",
        des: "Chief Warden",
      },
      { role: "hostel_staff", count: 2, des: "Hostel Staff" },
      {
        role: "transport_admin",
        first: "Ramesh",
        last: "Babu",
        des: "Transport Admin",
      },
      { role: "transport_staff", count: 2, des: "Transport Staff" },
    ];

    for (const spec of adminSpecs) {
      const roleId = roleMap[spec.role];
      const count = spec.count || 1;
      for (let i = 1; i <= count; i++) {
        const email = `${spec.role}${count > 1 ? i : ""}@university.in`;
        if (emailsProcessedThisBatch.has(email)) continue;
        emailsProcessedThisBatch.add(email);

        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM users WHERE email = '${email}'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT },
        );
        if (!existing) {
          const u = getBaseUser("staff");
          users.push({
            ...u,
            email,
            first_name: spec.first || u.first_name,
            last_name:
              count > 1
                ? `${spec.last || u.last_name} ${i}`
                : spec.last || u.last_name,
            role: ["super_admin", "admin"].includes(spec.role)
              ? "admin"
              : "staff",
            role_id: roleId,
            designation: spec.des,
            employee_id: `EMP-${spec.role.toUpperCase()}-${i}`,
            joining_date: "2020-01-01",
            salary_grade_id: salaryGradeId,
          });
        }
      }
    }

    for (const dCode in deptMap) {
      const deptId = deptMap[dCode];
      // HOD
      const hodEmail = `hod.${dCode.toLowerCase()}@university.in`;
      if (!emailsProcessedThisBatch.has(hodEmail)) {
        emailsProcessedThisBatch.add(hodEmail);
        const [exHod] = await queryInterface.sequelize.query(
          `SELECT id FROM users WHERE email = '${hodEmail}'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT },
        );
        if (!exHod) {
          const h = getBaseUser("staff");
          users.push({
            ...h,
            first_name: "HOD",
            last_name: dCode,
            email: hodEmail,
            role: "hod",
            role_id: roleMap["hod"],
            department_id: deptId,
            employee_id: `EMP-${dCode}-HOD`,
            designation: "Professor & HOD",
            joining_date: "2015-01-01",
            salary_grade_id: salaryGradeId,
          });
        }
      }
      // 2 Faculty
      for (let i = 1; i <= 2; i++) {
        let f = getBaseUser("staff");
        let fEmail = `${f.first_name.toLowerCase()}.${f.last_name.toLowerCase()}${i}@university.in`;

        // Ensure email is unique within the batch
        while (emailsProcessedThisBatch.has(fEmail)) {
          f = getBaseUser("staff");
          fEmail = `${f.first_name.toLowerCase()}.${f.last_name.toLowerCase()}${i}@university.in`;
        }

        emailsProcessedThisBatch.add(fEmail);
        const [exFac] = await queryInterface.sequelize.query(
          `SELECT id FROM users WHERE email = '${fEmail}'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT },
        );
        if (!exFac) {
          users.push({
            ...f,
            email: fEmail,
            role: "faculty",
            role_id: roleMap["faculty"],
            department_id: deptId,
            employee_id: `EMP-${dCode}-FAC${i}`,
            designation: "Assistant Professor",
            joining_date: "2018-06-01",
            salary_grade_id: salaryGradeId,
          });
        }
      }
    }

    const batches = [2022, 2023, 2024, 2025];
    const sections = ["A", "B"];
    for (const dCode in deptMap) {
      const deptId = deptMap[dCode];
      for (const batch of batches) {
        for (const section of sections) {
          for (let i = 1; i <= 2; i++) {
            const sid = `${batch % 100}${dCode}${section}${i}`;
            const sEmail = `s${sid.toLowerCase()}@university.in`;
            if (emailsProcessedThisBatch.has(sEmail)) continue;
            emailsProcessedThisBatch.add(sEmail);

            const [exStu] = await queryInterface.sequelize.query(
              `SELECT id FROM users WHERE email = '${sEmail}'`,
              { type: queryInterface.sequelize.QueryTypes.SELECT },
            );
            if (!exStu) {
              const s = getBaseUser("student");
              users.push({
                ...s,
                email: sEmail,
                role: "student",
                role_id: roleMap["student"],
                department_id: deptId,
                program_id: progMap[dCode],
                regulation_id: batch === 2022 ? r20Id : r23Id,
                student_id: sid,
                admission_number: `ADM-${sid}`,
                current_semester: batch === 2025 ? 1 : (2025 - batch) * 2 + 1,
                batch_year: batch,
                section: section,
                academic_status: "active",
                admission_date: `${batch}-07-15`,
                is_hosteller: i % 2 === 0,
                requires_transport: i % 2 !== 0,
                admission_type: getRandom(["convener", "management"]),
                is_lateral: false,
              });
            }
          }
        }
      }
    }

    if (users.length > 0) {
      const chunkSize = 50;
      for (let i = 0; i < users.length; i += chunkSize) {
        await queryInterface.bulkInsert("users", users.slice(i, i + chunkSize));
      }
    }

    for (const dCode in deptMap) {
      const [hod] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE first_name = 'HOD' AND last_name = '${dCode}'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT },
      );
      if (hod) {
        await queryInterface.sequelize.query(
          `UPDATE departments SET hod_id = '${hod.id}' WHERE id = '${deptMap[dCode]}';`,
        );
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", {
      email: { [Sequelize.Op.like]: "%@university.in" },
    });
    const depts = await queryInterface.sequelize.query(
      `SELECT id FROM departments WHERE code IN ('CSE', 'IT')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    const deptIds = depts.map((d) => d.id);
    if (deptIds.length > 0) {
      await queryInterface.bulkDelete("courses", { department_id: deptIds });
      await queryInterface.bulkDelete("programs", { department_id: deptIds });
      await queryInterface.bulkDelete("departments", { id: deptIds });
    }
    await queryInterface.bulkDelete("regulations", { name: ["R20", "R23"] });
  },
};
