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
  .post(checkPermission("academics:manage"), createProgram);

router
  .route("/:id")
  .get(getProgram)
  .put(checkPermission("academics:manage"), updateProgram)
  .delete(checkPermission("academics:manage"), deleteProgram);

module.exports = router;
