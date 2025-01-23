export class AppError extends Error {
  constructor(
    public statusCode: number,
    public status: string,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface TokenPayload {
  userId: string;
  role: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface ApiErrorResponse {
  status: string;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}