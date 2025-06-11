const Topic = require("../models/topicModel");
const { Types } = require("mongoose");

class topicControllers {
  async create(req, res) {
    const { name, isSystem } = req.body;

    try {
      const newTopic = {
        name: name,
        isSystemTopic: isSystem,
        createAt: Date.now(),
      };

      const topic = await Topic.create(newTopic);

      if (topic) return res.success(topic, "created success", 201);
    } catch (err) {
      return res.error();
    }
  }

  async getAllTopics(req, res) {
    const { isTopic, userId } = req.query;

    try {
      const isSystemTopic = isTopic === "true";
      const userObjectId = Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : userId;

      const topics = await Topic.aggregate([
        {
          $match: {
            isSystemTopic: isSystemTopic,
            createBy: userObjectId,
          },
        },
        {
          $lookup: {
            from: "vocabularies",
            localField: "_id",
            foreignField: "topicId",
            as: "vocabularies",
          },
        },
        {
          $addFields: {
            vocabularyCount: { $size: "$vocabularies" },
          },
        },
        {
          $lookup: {
            from: "userstatuses",
            let: { topicId: "$_id", userId: userObjectId },
            pipeline: [
              {
                $lookup: {
                  from: "vocabularies",
                  localField: "vocabId",
                  foreignField: "_id",
                  as: "vocab",
                },
              },
              { $unwind: "$vocab" },
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$userId"] },
                      { $eq: ["$vocab.topicId", "$$topicId"] },
                      { $lte: ["$nextReminder", new Date()] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: "$vocab.topicId",
                  count: { $sum: 1 },
                },
              },
            ],
            as: "overdueStatus",
          },
        },
        {
          $addFields: {
            status: {
              $gt: [
                { $ifNull: [{ $arrayElemAt: ["$overdueStatus.count", 0] }, 0] },
                5,
              ],
            },
          },
        },
        {
          $project: {
            vocabularies: 0,
            overdueStatus: 0,
          },
        },
      ]);

      return res.success(topics, "success", 200);
    } catch (error) {
      console.error("Error fetching topics:", error);
      return res.error("Server error");
    }
  }
}

module.exports = new topicControllers();
