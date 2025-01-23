import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../types';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const result = await AuthService.register(email, password, name);
      sendSuccess(res, 201, result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      sendSuccess(res, 200, result);
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    sendSuccess(res, 200, {
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
      },
    });
  }

  static async logout(req: Request, res: Response) {
    // In a real application, you might want to invalidate the token
    // This would require implementing a token blacklist or using refresh tokens
    sendSuccess(res, 200, { message: 'Logged out successfully' });
  }
}