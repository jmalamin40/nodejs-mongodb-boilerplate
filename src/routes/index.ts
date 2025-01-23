import { Router } from 'express';
import { healthRouter } from './health';
import { authRouter } from './auth';
import { userRouter } from './user';

export const routes = Router();

routes.use('/health', healthRouter);
routes.use('/auth', authRouter);
routes.use('/users', userRouter);