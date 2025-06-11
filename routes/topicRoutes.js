const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const topicControllers = require("../controllers/topicController");

router.get("/all", verifyToken, topicControllers.getAllTopics);
router.post("/create", verifyToken, topicControllers.create);

module.exports = router;
