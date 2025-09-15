import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { prisma } from '../index';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const authenticateSocket = async (
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void
) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};