const mongoose = require("mongoose");
const { Types } = mongoose;

const userStatusSchema = new mongoose.Schema({
  userId: { type: Types.ObjectId, require: true },
  vocabId: { type: Types.ObjectId, require: true },
  status: { type: Number, require: true, default: 1 },
  lastStudied: { type: Date, default: Date.now },
  nextReminder: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
});

module.exports = mongoose.model("UserVocabStatuses", userStatusSchema);
