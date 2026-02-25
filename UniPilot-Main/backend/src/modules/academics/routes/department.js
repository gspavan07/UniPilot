import express from "express";
import {
  getAllDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { authenticate, checkPermission } from "../../../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router
  .route("/")
  .get(getAllDepartments)
  .post(checkPermission("academics:manage"), createDepartment);

router
  .route("/:id")
  .get(getDepartment)
  .put(checkPermission("academics:manage"), updateDepartment)
  .delete(checkPermission("academics:manage"), deleteDepartment);

export default router;
