require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require("jsonwebtoken");

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FaceBookStrategy = require('passport-facebook').Strategy;

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const topicRoutes = require('./routes/topicRoutes');
const vocabRoutes = require('./routes/vocabRoutes');
const vocabStatusRoutes = require('./routes/vocabStatusRoutes');

const responseMiddleWare = require('./middleware/responseMiddleware');
const userControllers  = require("./controllers/userController");

const session = require('express-session');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: true
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(express.json());
app.use(responseMiddleWare);

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/vocab', vocabRoutes);
app.use('/api/vocabStatus', vocabStatusRoutes);

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL
    },
    async (req, accessToken, refreshToken, profile, done) =>{
        profile.type = "google";
        const { user, error } = await userControllers.handleGoogleLogin(profile);

        if (error) return done(error, null);
        return done(null, user);
    }
)
)

passport.use(
    new FaceBookStrategy({
        clientID: process.env.FB_CLIENT_ID,
        clientSecret: process.env.FB_CLIENT_SECRET,
        callbackURL: process.env.FB_CALLBACK_URL
    },
    async (req, accessToken, refreshToken, profile, done) =>{
        profile.type = "facebook";
        const { user, error } = await userControllers.handleGoogleLogin(profile);

        if (error) return done(error, null);
        return done(null, user);
    }
)
)


passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

app.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "/login",
}), (req, res) => {
    const token = jwt.sign(
                    { id: req.user.googleId, email: req.user.email },
                    process.env.JWT_SECRET, 
                    { expiresIn: "1d" }
                );
    res.redirect(`${process.env.CALLBACK_FE_URL}${token}&type=google`);
});

app.get("/auth/facebook", passport.authenticate("facebook", {
}));

app.get("/auth/facebook/callback", passport.authenticate("facebook", {
    failureRedirect: "/login",
}), (req, res) => {

    const token = jwt.sign(
                    { id: req.user.facebookId, email: req.user.name },
                    process.env.JWT_SECRET, 
                    { expiresIn: "1d" }
                );
    res.redirect(`${process.env.CALLBACK_FE_URL}${token}&type=facebook`);
});

app.listen(PORT, () => {
    console.log(`server on running on http://localhost:${PORT}`);
});