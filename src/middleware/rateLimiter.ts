import rateLimit from 'express-rate-limit';
import { AppError } from '../types';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  handler: (req, res) => {
    throw new AppError(429, 'error', 'Too many requests, please try again later');
  },
});