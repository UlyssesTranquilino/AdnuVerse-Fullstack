import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import morgan from "morgan";
import methodOverride from "method-override";
import cors from "cors";
import passport from "./config/passport";

// Routes
import userRoutes from "./routes/user.route";
import authRoutes from "./routes/auth.route";
import postRoutes from "./routes/postRoute";
import reelRoutes from "./routes/reelRoute";
import commentRoute from "./routes/commentRoute";
import storyRoutes from "./routes/stories.route";
import notificationRoutes from "./routes/notificationRoutes";

const app = express();

// Log environment variables
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);
console.log("Google Callback URL:", process.env.GOOGLE_CALLBACK_URL);

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(methodOverride("_method"));

// Sessions
app.use(
  session({
    secret: process.env.SECRET_KEY || "your-default-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set true if using HTTPS
  })
);

// ----- CORS CONFIG -----
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://adnu-verse-frontend.vercel.app", // production frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server requests
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// ------------------------

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reels", reelRoutes);
app.use("/api/comments", commentRoute);
app.use("/api/stories", storyRoutes);
app.use("/api/notifications", notificationRoutes);

// Connect to MongoDB and start server
const port = process.env.PORT || 3000;

const connectDB = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to the database!");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Connection Failed!", error);
    process.exit(1);
  }
};

connectDB();
