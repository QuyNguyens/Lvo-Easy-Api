const Vocab = require("../models/vocabulariesModel");
const Topic = require("../models/topicModel");
const { Types } = require("mongoose");

class VocabControllers {
  async create(req, res) {
    const {
      word,
      meaning,
      example,
      topicId,
      isSystemVocab,
      createBy,
      topicName,
    } = req.body;

    const wordData = {
      word,
      meaning,
      example,
      topicId: topicId ? new Types.ObjectId(topicId) : undefined,
      isSystemVocab,
    };

    try {
      if (typeof topicName === "string" && topicName.trim() !== "") {
        const topicData = {
          name: topicName.trim(),
          isSystemTopic: isSystemVocab,
          createAt: new Date(),
        };

        if (createBy !== "") {
          topicData.createBy = new Types.ObjectId(createBy);
          wordData.createdBy = new Types.ObjectId(createBy);
        }
        const newTopic = await Topic.create(topicData);
        wordData.topicId = newTopic._id;
      }
      const newWord = await Vocab.create(wordData);

      return res.success(newWord);
    } catch (err) {
      console.error("Error creating vocabulary:", err);
      return res.error("Failed to create vocabulary");
    }
  }

  async getPagination(req, res) {
    const {
      topicId,
      isSystemVocab,
      userId,
      page = 1,
      pageSize = 10,
    } = req.query;

    try {
      const wordsToReview = await Vocab.aggregate([
        {
          $match: {
            topicId: new Types.ObjectId(topicId),
            isSystemVocab: isSystemVocab === "true",
          },
        },
        {
          $lookup: {
            from: "uservocabstatuses",
            localField: "_id",
            foreignField: "vocabId",
            as: "userStatus",
          },
        },
        {
          $unwind: {
            path: "$userStatus",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            "userStatus.userId": new Types.ObjectId(userId),
          },
        },
        {
          $sort: {
            "userStatus.lastStudied": 1,
          },
        },
        {
          $skip: (parseInt(page) - 1) * parseInt(pageSize),
        },
        {
          $limit: parseInt(pageSize),
        },
      ]);
      return res.success(wordsToReview);
    } catch (err) {
      return res.error();
    }
  }

  async getSystemVocabByTopic(req, res) {
    const { topicId, page = 1, pageSize = 10 } = req.query;

    if (!topicId) {
      return res.error("Missing topicId");
    }

    try {
      const vocabs = await Vocab.find({
        topicId: new Types.ObjectId(topicId),
        isSystemVocab: true,
      })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize));

      return res.success(vocabs);
    } catch (err) {
      console.error("Error fetching system vocabularies:", error);
      return res.error();
    }
  }
}

module.exports = new VocabControllers();
