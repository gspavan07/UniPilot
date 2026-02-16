const express = require("express");
const {
    getAssignments,
    assignFaculty,
    removeAssignment,
} = require("../controllers/facultyAssignmentController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
// Restrict to Admin and Faculty (HOD usually has faculty role but specific permissions)
// For now allowing faculty role, HOD permission check can be enhanced
router.get("/faculty-assignments", getAssignments);
router.post("/faculty-assignments", authorize("admin", "faculty", "hod"), assignFaculty);
router.delete("/faculty-assignments/:id", authorize("admin", "faculty", "hod"), removeAssignment);

module.exports = router;
