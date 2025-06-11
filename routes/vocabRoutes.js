const express = require("express");
const router = express.Router();
const vocabControllers = require("../controllers/vocabController");
const verifyToken = require("../middleWare/authMiddleware");

router.post("/create", verifyToken, vocabControllers.create);
router.post("/system-create", verifyToken, vocabControllers.systemCreate);
router.get("/topic", verifyToken, vocabControllers.getWordsToReview);
router.get(
  "/topic/system",
  verifyToken,
  vocabControllers.getSystemVocabByTopic
);
router.get("/vocab-learn", verifyToken, vocabControllers.getWordsToLearn);

module.exports = router;
