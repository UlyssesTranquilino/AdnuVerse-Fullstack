// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// src/middleware/authMiddleware.ts

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  console.log('Authenticating JWT...');
  const token = req.headers['authorization']?.split(' ')[1];  // Get token from Authorization header

  console.log('Authorization Header:', req.headers['authorization']);  // Log the header

  if (!token) {
   res.status(403).json({ success: false, error: 'Token is required' });
    return 
  }

  try {
    // Verify the token and decode it
    const decoded = verifyToken(token); 

    if (!decoded) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
       return
    }

    // Attach user info to the request object for use in further route handlers
    (req as Request & { user: any }).user = decoded;

    console.log('User attached to request:', (req as Request & { user: any }).user);  // Log user info

    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('JWT Authentication failed:', error);
    res.status(500).json({ success: false, error: 'Server error during token verification' });
  }
};

