// src/types/custom.d.ts
import { UserModel } from '../models/User.model'; // Correct path to UserModel

declare global {
  namespace Express {
    interface Request {
      user?: UserModel; // Add the 'user' property to Request
    }
  }
}
