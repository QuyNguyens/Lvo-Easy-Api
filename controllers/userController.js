const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

class userControllers {
  signUp = async (req, res) => {
    try {
      const user = await User.create(req.body);
      return res.success(user, "User created", 201);
    } catch (err) {
      return res.error(err.message, 400);
    }
  };

  signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) return res.error("Email not existing!!!", 400);

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return res.error("Password incorrect!!!", 401);

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      const data = {
        userId: user._id,
        email: user.email,
        avatar: (user.avatar = user.avatar
          ? `${req.protocol}://${req.get("host")}/public/avatars/${user.avatar}`
          : null),
        name: user?.name,
        token,
      };
      return res.success(data, "login successful", 201);
    } catch (err) {
      return res.error(err.message, 401);
    }
  };

  getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");

      if (!user) return res.error("User not existing!!!", 404);
      res.success(user, "success", 201);
    } catch (err) {
      return res.error(err.message, 500);
    }
  };

  update = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (req.file) {
        if (user.avatar) {
          const oldAvatarPath = path.join(
            __dirname,
            "..",
            "public",
            "avatars",
            user.avatar
          );
          fs.unlink(oldAvatarPath, (err) => {
            if (err) console.error("Failed to delete old avatar:", err);
          });
        }

        user.avatar = req.file.filename;
      }

      if (req.body.name) {
        user.name = req.body.name;
      }
      if (req.body.password) {
        user.password = req.body.password;
      }

      await user.save();

      (user.avatar = user.avatar
        ? `${req.protocol}://${req.get("host")}/public/avatars/${user.avatar}`
        : null),
        res.success(user);
    } catch (error) {
      console.error(error);
      res.error();
    }
  };
}

module.exports = new userControllers();
