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
  .post(checkPermission("academics:manage"), createDepartment);

router
  .route("/:id")
  .get(getDepartment)
  .put(checkPermission("academics:manage"), updateDepartment)
  .delete(checkPermission("academics:manage"), deleteDepartment);

module.exports = router;
