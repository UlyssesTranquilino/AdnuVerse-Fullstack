const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { UserModel } = require('../models/User.model'); // Adjust the import to your User model
const { generateToken } = require('../utils/jwt');  // Make sure generateToken is correctly imported

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email', 'openid'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await UserModel.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new UserModel({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            role: 'student',
            username: profile.emails[0].value.split('@')[0], // Extract username from email
            password: '', // Empty password for OAuth users
            googleAuth: true, // Flag for Google Auth users
          });

          await user.save(); // Save the new user to the database
        }

        // Ensure user._id exists here before calling done
        console.log("User before serialization:", user);
        done(null, user._id);  // Pass only user._id to the session, NOT the entire user object
      } catch (error) {
        console.error('Error during Google authentication:', error);
        done(error, false);
      }
    }
  )
);


// Serialize the user by storing only the user ID in session
passport.serializeUser((userId, done) => {
  console.log("Serializing user with _id:", userId);  // Log the userId being serialized
  done(null, userId);  // Serialize only the _id (userId is stored in the session)
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return done(new Error("User not found"), null);
    }
    console.log("Deserialized user:", user);  // Log the full user object after fetching from DB
    done(null, user);  // Attach the full user object to the session
  } catch (error) {
    done(error, null);  // Handle deserialization error
  }
});

module.exports = passport;  // Export passport for use in your application
