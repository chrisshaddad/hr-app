import { z } from 'zod';
import { userRoleSchema } from './user-role.schema';

export const userCreateRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1).max(255),
  phone: z.string().optional(),
  departmentId: z.uuid().optional(),
  branchId: z.uuid().optional(),
  role: userRoleSchema,
});

export type UserCreateRequest = z.infer<typeof userCreateRequestSchema>;
