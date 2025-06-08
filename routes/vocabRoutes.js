const express = require("express");
const router = express.Router();
const vocabControllers = require("../controllers/vocabController");
const verifyToken = require("../middleWare/authMiddleWare");

router.post("/create", verifyToken, vocabControllers.create);
router.get("/topic", verifyToken, vocabControllers.getPagination);
router.get(
  "/topic/system",
  verifyToken,
  vocabControllers.getSystemVocabByTopic
);

module.exports = router;
