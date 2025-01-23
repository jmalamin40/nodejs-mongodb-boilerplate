import { z } from 'zod';
import { UserRole } from '../types';

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    role: z.enum([UserRole.USER]).optional(),
    isActive: z.boolean().optional(),
  }),
});