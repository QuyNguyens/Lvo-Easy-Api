const mongoose = require("mongoose");
const { Types } = mongoose;

const topicSchema = new mongoose.Schema({
  name: { type: String, require: true },
  isSystemTopic: { type: Boolean, require: true, default: false },
  createBy: { type: Types.ObjectId },
  createAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Topics", topicSchema);
