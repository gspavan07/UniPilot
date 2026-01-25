const express = require("express");
const router = express.Router();
const sectionInchargeController = require("../controllers/sectionInchargeController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router
  .route("/")
  .post(
    authorize("admin", "super_admin", "hod"),
    sectionInchargeController.assignSectionIncharge,
  )
  .get(sectionInchargeController.getSectionIncharges);

router
  .route("/:id")
  .delete(
    authorize("admin", "super_admin", "hod"),
    sectionInchargeController.removeSectionIncharge,
  );

module.exports = router;
