import express, { Request, Response } from "express";
import passport from "passport";
import { generateToken } from "../utils/jwt"; // Ensure generateToken is correctly imported
import { UserModel } from "../models/User.model"; // Import the User model to fetch full user data

const router = express.Router();

// Google login route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=google_auth_failed",
  }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as any;

      if (!user) {
        res.redirect("http://localhost:5173/login?error=user_not_found");
        return;
      }

      const fullUser = await UserModel.findById(user._id).lean();
      if (!fullUser) {
        res.redirect("http://localhost:5173/login?error=user_not_in_db");
        return;
      }

      const token = generateToken(fullUser._id.toString(), fullUser.role);
      const { password, ...safeUser } = fullUser;

      // Ensure lastName exists
      if (!safeUser.lastName) {
        safeUser.lastName = "";
      }

      // Encode user data for URL
      const encodedUser = encodeURIComponent(JSON.stringify(safeUser));

      // Redirect with token and user data in URL
      res.redirect(
        `http://localhost:5173/auth/google/callback?token=${token}&user=${encodedUser}`
      );
    } catch (error) {
      console.error("Error during Google authentication:", error);
      res.redirect("http://localhost:5173/login?error=auth_error");
    }
  }
);

// Profile route to show the logged-in user's profile
router.get("/profile", (req: Request, res: Response): void => {
  // Explicitly typing req and res
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Manually access the token from the session
  const token = (req.session as any).token; // Explicitly cast session to 'any'

  // Send the complete user object along with the token
  res.status(200).json({
    user: req.user, // The user object is attached to the session by passport
    token: token, // Send the token along with the user data
  });
});

export default router;