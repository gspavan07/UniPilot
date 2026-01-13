const express = require("express");
const {
  getAllPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} = require("../controllers/programController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router
  .route("/")
  .get(getAllPrograms)
  .post(checkPermission("academics:courses:manage"), createProgram);

router
  .route("/:id")
  .get(getProgram)
  .put(checkPermission("academics:courses:manage"), updateProgram)
  .delete(checkPermission("academics:courses:manage"), deleteProgram);

module.exports = router;
