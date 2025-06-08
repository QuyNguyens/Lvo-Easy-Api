const mongoose = require('mongoose');
const {Types} = mongoose;

const vocabulariesSchema = new mongoose.Schema({
    word: {type: String, require: true},
    meaning: {type: String, require: true},
    example: {type: Array},
    topicId: {type: Types.ObjectId, require: true},
    isSystemVocab: {type: Boolean, require: true},
    createdBy: {type: Types.ObjectId},
    createAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Vocabularies", vocabulariesSchema);