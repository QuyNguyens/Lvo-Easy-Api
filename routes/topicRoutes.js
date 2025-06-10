const express = require("express");
const router = express.Router();

const verifyToken = require("../middleWare/authMiddleWare");
const topicControllers = require("../controllers/topicController");

router.get("/all", verifyToken, topicControllers.getAllTopics);
router.post("/create", verifyToken, topicControllers.create);

module.exports = router;
