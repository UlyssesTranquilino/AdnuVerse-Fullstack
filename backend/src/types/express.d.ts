import { IUser } from '../models/User.model';  // Import IUser from your models

declare global {
  namespace Express {
    interface Request {
      user?: IUser;  // Make sure the `user` property has the correct type
    }
  }
}