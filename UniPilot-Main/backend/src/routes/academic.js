import express from "express";
import {
    getAssignments,
    assignFaculty,
    removeAssignment,
} from "../controllers/facultyAssignmentController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
// Restrict to Admin and Faculty (HOD usually has faculty role but specific permissions)
// For now allowing faculty role, HOD permission check can be enhanced
router.get("/faculty-assignments", getAssignments);
router.post("/faculty-assignments", authorize("admin", "faculty", "hod"), assignFaculty);
router.delete("/faculty-assignments/:id", authorize("admin", "faculty", "hod"), removeAssignment);

export default router;
