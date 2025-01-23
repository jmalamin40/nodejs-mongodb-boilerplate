import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), AuthController.register);
authRouter.post('/login', authLimiter, validate(loginSchema), AuthController.login);
authRouter.get('/me', authenticate, AuthController.getCurrentUser);
authRouter.post('/logout', authenticate, AuthController.logout);