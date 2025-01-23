import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models/user.model';
import { AppError, TokenPayload, UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      accessToken?: string;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'error', 'Authentication required');
    }

    const accessToken = authHeader.split(' ')[1];

    // Verify access token
    const decoded = jwt.verify(accessToken, config.jwt.secret) as TokenPayload;

    // Ensure it's an access token
    if (decoded.type !== 'access') {
      throw new AppError(401, 'error', 'Invalid token type');
    }

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError(401, 'error', 'User no longer exists');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(401, 'error', 'User account is deactivated');
    }

    // Attach user and token to request
    req.user = user;
    req.accessToken = accessToken;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'error', 'Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'error', 'Token expired'));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'error', 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'error', 'Insufficient permissions'));
    }

    next();
  };
};