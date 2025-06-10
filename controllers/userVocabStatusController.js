const userVocab = require("../models/userVocabStatus");

class UserVocabStatusControllers {
  async   createOrUpdate(req, res) {
    const { userId, vocabId, status } = req.body;

    if (!userId || !vocabId) {
      return res.error("require req data!!!", 404);
    }

    const vocabData = {
      userId,
      vocabId,
      status,
    };
    try {
      const existing = await userVocab.findOne({ userId, vocabId });

      if (existing) {
        existing.status = status;
        const now = new Date();
        existing.lastStudied = now;
        existing.nextReminder = new Date(
          now.getTime() + 3 * 24 * 60 * 60 * 1000
        );

        await existing.save();
      } else {    
        await userVocab.create(vocabData);
      }
      return res.success();
    } catch (err) {
      return res.error();
    }
  }
}

module.exports = new UserVocabStatusControllers();
