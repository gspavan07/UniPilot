const express = require("express");
const {
  getAllDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router
  .route("/")
  .get(getAllDepartments)
  .post(checkPermission("academics:courses:manage"), createDepartment);

router
  .route("/:id")
  .get(getDepartment)
  .put(checkPermission("academics:courses:manage"), updateDepartment)
  .delete(checkPermission("academics:courses:manage"), deleteDepartment);

module.exports = router;
