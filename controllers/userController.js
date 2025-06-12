const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

class userControllers {
  handleGoogleLogin = async (profile) => {
    try {
      let user;
      if (profile.type === "google") {
        user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
          });
        }
      } else if (profile.type === "facebook") {
        user = await User.findOne({ facebookId: profile.id });
        if (!user) {
          user = await User.create({
            facebookId: profile.id,
            email: "",
            name: profile.displayName,
            avatar: "",
          });
        }
      }

      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  };

  loginToken = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.error("Unauthorized", 401);
    }
    const { type } = req.query;
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user;
      if (type === "google") {
        user = await User.findOne({ googleId: decoded.id });
      } else if (type === "facebook") {
        user = await User.findOne({ facebookId: decoded.id });
      }

      if (!user) return res.error("User not found", 404);

      const data = {
        userId: user._id,
        email: user?.email,
        avatar: user?.avatar,
        name: user?.name,
      };

      if(type === "facebook"){
        data.avatar = user.avatar
        ? `${req.protocol}://${req.get("host")}/public/avatars/${user.avatar}`
        : null;
      }
      res.success(data, "verify success");
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

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
      const userId = req.body.id;
      const user = await User.findById(userId);
      if (!user) return res.error("User not found",404);

      if(req.body.email){
        const existingEmail = await User.findOne({email: req.body.email});
        if(existingEmail) return res.success("Email is existing",409);
        user.email = req.body.email;
      }

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
