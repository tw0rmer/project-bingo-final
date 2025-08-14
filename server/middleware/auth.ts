// Authentication middleware for the bingo game application
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Use environment variable or fallback to a development secret
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-do-not-use-in-production';

// Warn if using default secret in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('WARNING: Using default JWT secret in production. Set JWT_SECRET environment variable.');
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const generateToken = (userId: number, email: string): string => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { id: number; email: string } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    // Verify user exists in database - manually filter since mock DB doesn't handle eq properly
    const allUsers = await db.select().from(users);
    const user = allUsers.find((user: any) => user.id === decoded.id);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};