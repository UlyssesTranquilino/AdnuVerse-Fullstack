import { UserModel } from "../models/User.model";
import { IUser } from "../models/User.model"; // Import the IUser interface

// Get all users
export const getUsers = (): Promise<IUser[]> => UserModel.find(); // Query to get all users

// Get user by email
export const getUserByEmail = (email: string): Promise<IUser | null> => {
  return UserModel.findOne({ email }); // Query to get user by email
};

// Get user by ID
export const getUserById = (id: string): Promise<IUser | null> =>
  UserModel.findById(id); // Query to get user by ID

// Create a new user
export const createUser = (values: Record<string, any>): Promise<IUser> => {
  return UserModel.create(values); // This will return an IUser
};

// Delete user by ID
export const deleteUserById = (id: string): Promise<IUser | null> =>
  UserModel.findOneAndDelete({ _id: id }); // Return the deleted user document or null

// Update user by ID
export const updateUserById = (
  id: string,
  values: Record<string, any>
): Promise<IUser | null> =>
  UserModel.findByIdAndUpdate(id, values, { new: true }); // Return the updated user or null
