import mongoose, { Schema, Document } from 'mongoose';

// Define the IUser interface, which extends mongoose.Document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string; // Optional password for Google Auth users
  avatar: string;
  bio: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  role: string;
  department: string[];
  batchYear: number;
  studentId: string;
  orgs: string[];
  createdAt: Date;
  backgroundImage: string[];
  googleAuth: boolean; // Add googleAuth field
}

// Define the User Schema
const UserSchema: Schema<IUser> = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: false },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.googleAuth; // Only require password if not using Google OAuth
    },
  },
  avatar: { type: String },
  bio: { type: String },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    },
  ],
  role: {
    type: String,
    enum: ['student', 'professor', 'alumni', 'admin', 'department', 'club', 'event'],
  },
  department: [
    {
      type: String,
      enum: [
        'College of Business and Accountancy',
        'College of Computer Studies',
        'College of Education',
        'College of Humanities and Social Sciences',
        'College of Law',
        'College of Nursing',
        'College of Science, Engineering, and Architecture',
      ],
    },
  ],
  batchYear: { type: Number },
  studentId: { type: String },
  orgs: [
    {
      type: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  backgroundImage: [
    {
      type: String,
      default: [],
    },
  ],
  googleAuth: { type: Boolean, default: false }, // googleAuth flag to track OAuth users
});

// Export the User model with the IUser type
export const UserModel = mongoose.model<IUser>('User', UserSchema);
