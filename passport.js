// import passport from "passport";
// import pkg from "passport-google-oauth20"; // Default import
// const { OAuth2Strategy: GoogleStrategy } = pkg;
// import User from "./models/userModel.js";
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_AUTH_REDIRECT_URI,
//     },
//     async (token, tokenSecret, profile, done) => {
//       try {
//         // Here, you would usually find or create a user in your database
//         const user = await User.findOne({ googleId: profile.id });
//         if (!user) {
//           const newUser = new User({
//             googleId: profile.id,
//             fullname: profile.displayName,
//             email: profile.emails[0].value,
//             // Store the token and refreshToken
//             accessToken: token,
//             refreshToken: tokenSecret, // or refresh token if needed
//           });
//           await newUser.save();
//           return done(null, newUser);
//         }
//         return done(null, user);
//       } catch (err) {
//         console.error("Error authenticating Google user:", err);
//         return done(err);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   const user = await User.findById(id);
//   done(null, user);
// });

// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const jwt = require("jsonwebtoken");
// const User = require("./models/User"); // Adjust path if needed

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_AUTH_REDIRECT_URI,
//     },
//     // async (token, tokenSecret, profile, done) => {
//     //   try {
//     //     // Find or create user logic
//     //     const user = await User.findOne({ googleId: profile.id });
//     //     if (!user) {
//     //       const newUser = new User({
//     //         googleId: profile.id,
//     //         fullname: profile.displayName,
//     //         email: profile.emails[0].value,
//     //         accessToken: token,
//     //         refreshToken: tokenSecret,
//     //         password: "defaultpassword",
//     //       });
//     //       await newUser.save();
//     //       return done(null, newUser);
//     //     }
//     //     return done(null, user);
//     //   } catch (err) {
//     //     console.error("Error authenticating Google user:", err);
//     //     return done(err);
//     //   }
//     // }

//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ googleId: profile.id });

//         if (!user) {
//           user = new User({
//             googleId: profile.id,
//             fullname: profile.displayName,
//             email: profile.emails[0].value,
//             password: "defaultpassword", // You can randomize this too
//             photourl: profile.photos?.[0]?.value || null,
//           });
//           await user.save();
//         }

//         // ✅ Generate JWT Token
//         const token = jwt.sign(
//           { id: user._id, email: user.email },
//           process.env.JWT_SECRET,
//           { expiresIn: "1h" }
//         );

//         // ✅ Attach token to user object returned by Passport
//         user.token = token;

//         return done(null, user);
//       } catch (err) {
//         console.error("Error in Google Strategy:", err);
//         return done(err);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   const user = await User.findById(id);
//   done(null, user);
// });

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("./models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_AUTH_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // STEP 1: Check if user already exists by email
        let user = await User.findOne({ email });

        // STEP 2: If not found, create a new user
        if (!user) {
          user = new User({
            googleId: profile.id,
            fullname: profile.displayName,
            email,
            password: "defaultpassword", // You can randomize or hash this if needed
            photourl: profile.photos?.[0]?.value || null,
          });

          await user.save();
        } else {
          // If user exists but googleId is not set, attach it
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        }

        // STEP 3: Generate JWT token
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        user.token = token;

        return done(null, user);
      } catch (err) {
        console.error("Google OAuth Error:", err);
        return done(err, null);
      }
    }
  )
);
