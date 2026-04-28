// src/bootstrap/models.js
// Bootstraps all module models and runs their intra-module associations

import "../modules/core/models/index.js";
import "../modules/settings/models/index.js";
import "../modules/academics/models/index.js";
import "../modules/proctoring/models/index.js";
import "../modules/fees/models/index.js";
import "../modules/library/models/index.js";
import "../modules/admissions/models/index.js";
import "../modules/hr/models/index.js";
import "../modules/infrastructure/models/index.js";
import "../modules/obe/models/index.js";
import "../modules/notifications/models/index.js";
import "../modules/placement/models/index.js";
import "../modules/transport/models/index.js";
import "../modules/hostel/models/index.js";
import "../modules/exams/models/associations.js"; // Exams module has a separate associations file

// ---------------------------------------------------------------------------
// Cross-Module Shared-Kernel Associations (User <-> Profiles)
// These intentionally cross module boundaries because Profiles are
// the data-ownership bridge between Core (User) and domain modules.
// ---------------------------------------------------------------------------
import { User } from "../modules/core/models/index.js";
import { StudentProfile } from "../modules/academics/models/index.js";
import { StaffProfile } from "../modules/hr/models/index.js";

User.hasOne(StudentProfile, { as: "student_profile", foreignKey: "user_id" });
StudentProfile.belongsTo(User, { as: "user", foreignKey: "user_id" });

User.hasOne(StaffProfile, { as: "staff_profile", foreignKey: "user_id" });
StaffProfile.belongsTo(User, { as: "user", foreignKey: "user_id" });

export default {};
