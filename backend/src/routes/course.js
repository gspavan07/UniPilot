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
  .get(checkPermission("academics:courses:view"), getAllCourses)
  .post(checkPermission("academics:courses:manage"), createCourse);

router
  .route("/:id")
  .get(checkPermission("academics:courses:view"), getCourse)
  .put(checkPermission("academics:courses:manage"), updateCourse)
  .delete(checkPermission("academics:courses:manage"), deleteCourse);

module.exports = router;
