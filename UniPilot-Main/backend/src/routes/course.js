const express = require("express");
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
} = require("../controllers/courseController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Student routes
router.get("/my-courses", getMyCourses);

router
  .route("/")
  .get(getAllCourses)
  .post(checkPermission("academics:manage"), createCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(checkPermission("academics:manage"), updateCourse)
  .delete(checkPermission("academics:manage"), deleteCourse);

module.exports = router;
