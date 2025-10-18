import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import morgan from "morgan";
import methodOverride from "method-override";
import cors from "cors";
import userRoutes from "./routes/user.route";
import authRoutes from "./routes/auth.route";
import postRoutes from "./routes/postRoute";
import reelRoutes from "./routes/reelRoute";
import commentRoute from "./routes/commentRoute";
import storyRoutes from "./routes/stories.route"; // Import the story routes
import notificationRoutes from "./routes/notificationRoutes";
import passport from "./config/passport";
// Add the route

const app = express();
// Log the environment variables to make sure they are loaded correctly
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);
console.log("Google Callback URL:", process.env.GOOGLE_CALLBACK_URL);
// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SECRET_KEY || "your-default-secret", // Your session secret
    resave: false,
    saveUninitialized: true, // Make sure the session is stored correctly
    cookie: { secure: false }, // If you're not using HTTPS, set `secure` to false
  })
);
// Configure CORS to allow your frontend origins and handle preflight
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://adnu-verse-fullstack.vercel.app",
];

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use((req, res, next) => {
  // set simple headers quickly for all responses; the cors middleware will also set them
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // Allow credentials for cookie/session based auth if needed
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.options("*", (req, res) => {
  // quick answer for preflight
  res.header("Access-Control-Allow-Origin", req.header("origin") || "*");
  res.sendStatus(204);
});

app.use(require("cors")(corsOptions));
// Initialize Passport and session
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

// Connect to MongoDB
const port = process.env.PORT || 3000;
const connectDB = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to the database!");
    app.listen(port, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.error("Connection Failed!", error);
    process.exit(1);
  }
};

connectDB();
