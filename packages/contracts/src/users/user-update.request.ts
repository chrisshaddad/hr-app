import { z } from 'zod';
import { userRoleSchema } from './user-role.schema';

export const userUpdateRequestSchema = z.object({
  email: z.email().optional(),
  password: z.string().min(8).optional(),
  name: z.string().min(1).max(255).optional(),
  phone: z.string().optional(),
  departmentId: z.uuid().optional(),
  branchId: z.uuid().optional(),
  role: userRoleSchema.optional(),
});

export type UserUpdateRequest = z.infer<typeof userUpdateRequestSchema>;
