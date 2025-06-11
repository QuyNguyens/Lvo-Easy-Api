const express = require("express");
const router = express.Router();
const verifyToken = require("../middleWare/authMiddleware");

const userVocabStatusControllers = require("../controllers/userVocabStatusController");

router.post("/update", verifyToken, userVocabStatusControllers.createOrUpdate);

module.exports = router;
