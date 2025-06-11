const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const uploadAvatar = require("../middleware/uploadAvatar");

router.get("/login-token", userControllers.loginToken);
router.post("/signup", userControllers.signUp);
router.post("/signin", userControllers.signIn);
router.get("/profile", verifyToken, userControllers.getProfile);
router.put(
  "/update",
  verifyToken,
  uploadAvatar.single("file"),
  userControllers.update
);

module.exports = router;
