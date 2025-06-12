const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, sparse: true},
  password: { type: String },
  avatar: { type: String },
  googleId: { type: String, sparse: true, },
  facebookId: { type: String, sparse: true, },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
