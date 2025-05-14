import { Request, Response, NextFunction } from 'express';

// Middleware to check if the user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as Request & { user: any }).user; // Assuming the user is attached to req via JWT

  if (!user || user.role !== 'admin') {
  res.status(403).json({ success: false, error: 'Access denied: Admins only' });
  return 
  }

  next(); // If the user is an admin, proceed to the next middleware or route handler
};
