import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env") });
import { User, Department } from "../src/models/index.js";
import { Op } from "sequelize";

async function debug() {
  try {
    console.log("Using Hardcoded AIML Department...");
    const aiml = {
      id: "1eb78bee-2db6-46e3-b3b5-a5a82eea9f94",
      name: "AIML (Hardcoded)",
    };

    if (false) {
      console.log("No AIML Department found! Listing all:");
      const all = await Department.findAll({ attributes: ["id", "name"] });
      all.forEach((d) => console.log(`- ${d.name} (${d.id})`));
      return;
    }

    // const aiml = depts[0];
    console.log(`Found Dept: ${aiml.name} (${aiml.id})`);

    console.log("Searching for HOD...");
    const hod = await User.findOne({
      where: {
        department_id: aiml.id,
        role: "hod",
      },
    });

    if (!hod) {
      console.log("ERROR: No HOD found for this department!");
      console.log("Listing all users in this dept:");
      const users = await User.findAll({
        where: { department_id: aiml.id },
        attributes: ["id", "first_name", "role"],
      });
      users.forEach((u) => console.log(`- ${u.first_name} (${u.role})`));
    } else {
      console.log(`Found HOD: ${hod.first_name} (${hod.id})`);
    }

    console.log("Searching for Faculty...");
    const faculty = await User.findOne({
      where: {
        department_id: aiml.id,
        role: "faculty",
      },
    });

    if (faculty) {
      console.log(`Found Faculty: ${faculty.first_name} (${faculty.id})`);

      // Simulation
      if (["faculty", "staff"].includes(faculty.role)) {
        console.log(
          `Logic: User Role is ${faculty.role}. Searching for HOD...`
        );
        const foundHod = await User.findOne({
          where: { department_id: faculty.department_id, role: "hod" },
        });
        console.log("Result HOD:", foundHod ? foundHod.id : "NULL");
        if (!foundHod) console.log("fallback to Admin...");
      }
    } else {
      console.log("No Faculty found.");
    }
  } catch (error) {
    console.error(error);
  }
}

debug();
