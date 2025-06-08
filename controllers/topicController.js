const Topic = require("../models/topicModel");
const { Types } = require("mongoose");

class topicControllers {
  async create(req, res) {
    const { name, isSystem, createBy } = req.body;

    try {
      const newTopic = {
        name: name,
        isSystemTopic: isSystem,
        createBy: isSystem ? null : createBy,
        createAt: Date.now,
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
          $project: {
            vocabularies: 0,
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
