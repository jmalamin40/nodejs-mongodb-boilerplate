import { ErrorRequestHandler } from 'express';
import { AppError } from '../types';
import { sendError } from '../utils/response';
import { logError } from '../config/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logError('Error occurred:', err);

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message);
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return sendError(res, 400, 'Duplicate field value', 'DUPLICATE_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token', 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired', 'TOKEN_EXPIRED');
  }

  // Default error
  return sendError(res, 500, 'Internal server error');
};