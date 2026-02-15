const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login.bind(authController));
// Additional routes if needed
router.get(
  "/me",
  require("../middleware/authMiddleware").protect,
  authController.getProfile.bind(authController),
);

module.exports = router;
