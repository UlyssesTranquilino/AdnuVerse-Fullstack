// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.SECRET_KEY;
if (!secretKey) {
  throw new Error('SECRET_KEY is not defined!');
}

// Function to generate the JWT token
export const generateToken = (userId: string, role: string) => {
  const payload = { _id: userId, role };
  const options: jwt.SignOptions = { expiresIn: '24h' };
  return jwt.sign(payload, secretKey, options);
};

// Function to verify the JWT token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, secretKey) as { _id: string; role: string };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;  // If token is invalid or expired
  }
};
