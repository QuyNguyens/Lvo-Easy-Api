const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

const userVocabStatusControllers = require("../controllers/userVocabStatusController");

router.post("/update", verifyToken, userVocabStatusControllers.createOrUpdate);

module.exports = router;
