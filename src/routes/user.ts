import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../schemas/user.schema';
import { UserRole } from '../types';

export const userRouter = Router();

// All routes require authentication and admin role
userRouter.use(authenticate, requireRole([UserRole.ADMIN]));

userRouter.get('/', UserController.getAllUsers);
userRouter.get('/:id', UserController.getUserById);
userRouter.patch('/:id', validate(updateUserSchema), UserController.updateUser);
userRouter.delete('/:id', UserController.deleteUser);