const Vocab = require("../models/vocabulariesModel");
const Topic = require("../models/topicModel");
const UserVocab = require("../models/userVocabStatus");

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

      if (createBy !== "") {
        UserVocab.create({
          vocabId: new Types.ObjectId(newWord._id),
          userId: new Types.ObjectId(createBy),
        });
      }
      return res.success(newWord);
    } catch (err) {
      console.error("Error creating vocabulary:", err);
      return res.error("Failed to create vocabulary");
    }
  }

  async getWordsToReview(req, res) {
    const { topicId, isSystemVocab, userId, limit = 10 } = req.query;

    try {
      const vocab = await Vocab.aggregate([
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
          $limit: parseInt(limit),
        },
        {
          $project: {
            _id: 1,
            word: 1,
            meaning: 1,
            example: 1,
          },
        },
      ]);

      const vocabRandomDocs = await Vocab.aggregate([
        { $match: { topicId: new Types.ObjectId(topicId) } },
        { $sample: { size: 30 } },
        { $project: { word: 1, _id: 0 } },
      ]);
      const vocabRandom = vocabRandomDocs.map((doc) => doc.word);
      return res.success({ vocab, vocabRandom });
    } catch (err) {
      console.error("Error fetching words to review:", err);
      return res.error("Internal Server Error");
    }
  }

  async getWordsToLearn(req, res) {
    const { topicId, userId, limit = 5 } = req.query;

    if (!topicId || !userId) {
      return res.error("Missing topicId or userId", 400);
    }

    try {
      const vocabNotLearned = await Vocab.aggregate([
        {
          $match: {
            topicId: new Types.ObjectId(topicId),
            isSystemVocab: true,
          },
        },
        {
          $lookup: {
            from: "uservocabstatuses",
            let: { vocabId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$vocabId", "$$vocabId"] },
                      { $eq: ["$userId", new Types.ObjectId(userId)] },
                    ],
                  },
                },
              },
            ],
            as: "userStatus",
          },
        },
        {
          $match: {
            userStatus: { $size: 0 },
          },
        },
        { $limit: parseInt(limit) },
        {
          $project: {
            _id: 1,
            word: 1,
            meaning: 1,
            example: 1,
          },
        },
      ]);

      const vocab = await Vocab.aggregate([
        { $match: { topicId: new Types.ObjectId(topicId) } },
        { $sample: { size: 30 } },
        { $project: { word: 1, _id: 0 } },
      ]);
      const vocabRandom = vocab.map((doc) => doc.word);
      return res.success({ vocab:vocabNotLearned, vocabRandom });

    } catch (err) {
      console.error("Error fetching new system words:", err);
      return res.error("Internal Server Error");
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

  async systemCreate(req, res) {
    try {
      const vocabList = req.body;

      if (!Array.isArray(vocabList) || vocabList.length === 0) {
        return res.error("Invalid vocabulary list", 400);
      }

      const formattedVocabList = vocabList.map((vocab) => {
        if (!vocab.word || !vocab.meaning || !vocab.topicId) {
          throw new Error(
            "Missing required fields in one or more vocab entries"
          );
        }

        const baseData = {
          word: vocab.word,
          meaning: vocab.meaning,
          example: vocab.example || [],
          topicId: vocab.topicId,
          isSystemVocab: true,
          createAt: new Date(),
        };

        return baseData;
      });

      const savedVocabularies = await Vocab.insertMany(formattedVocabList);

      return res.success(savedVocabularies);
    } catch (err) {
      console.error("Error creating vocabulary:", err.message);
      return res.error();
    }
  }
}

module.exports = new VocabControllers();
