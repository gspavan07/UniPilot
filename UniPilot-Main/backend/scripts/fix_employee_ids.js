import { Sequelize, Op } from "sequelize";
import { User, sequelize } from "../src/models/index.js";

async function fixEmployeeIds() {
  try {
    console.log("Starting Employee ID Fix...");

    // 1. Find users who need IDs
    // Roles that should have employee_id
    const staffRoles = [
      "staff",
      "faculty",
      "admin",
      "hr",
      "hr_admin",
      "hod",
      "super_admin",
      "lab_assistant",
      "operator",
    ];

    const users = await User.findAll({
      where: {
        role: { [Op.in]: staffRoles },
        [Op.or]: [{ employee_id: null }, { employee_id: "" }],
      },
    });

    console.log(`Found ${users.length} users missing employee_id.`);

    if (users.length === 0) {
      console.log("No fixes needed.");
      process.exit(0);
    }

    // 2. Determine starting sequence
    // Find last usage of EMP%
    const lastUser = await User.findOne({
      where: {
        employee_id: { [Op.like]: "EMP%" },
      },
      order: [["created_at", "DESC"]], // Heuristic. Ideally parse ID.
      // Better: fetch all EMP IDs and parse max.
    });

    // Fetch all EMP IDs to be safe
    const allEmpUsers = await User.findAll({
      where: { employee_id: { [Op.like]: "EMP%" } },
      attributes: ["employee_id"],
    });

    let maxId = 0;
    allEmpUsers.forEach((u) => {
      const numPart = parseInt(u.employee_id.replace("EMP", ""));
      if (!isNaN(numPart) && numPart > maxId) maxId = numPart;
    });

    console.log(`Current Max Employee ID Sequence: ${maxId}`);

    let currentId = maxId;

    // 3. Update Users
    for (const user of users) {
      currentId++;
      const newId = `EMP${String(currentId).padStart(3, "0")}`;
      console.log(
        `Assigning ${newId} to ${user.first_name} ${user.last_name} (${user.role})`
      );

      await user.update({ employee_id: newId });
    }

    console.log("All IDs assigned successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing IDs:", error);
    process.exit(1);
  }
}

fixEmployeeIds();
