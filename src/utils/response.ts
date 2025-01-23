import { Response } from 'express';
import { ApiResponse, ApiErrorResponse } from '../types';

export const sendSuccess = <T>(res: Response, statusCode: number, data: T): void => {
  const response: ApiResponse<T> = {
    status: 'success',
    data,
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  code?: string,
  details?: unknown,
): void => {
  const errorResponse: ApiErrorResponse = {
    status: 'error',
    error: {
      message,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
    },
  };
  res.status(statusCode).json(errorResponse);
};