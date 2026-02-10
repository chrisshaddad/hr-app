import { z } from 'zod';
import { userRoleSchema } from './user-role.schema';

// Response from /auth/me endpoint
export const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  role: userRoleSchema,
  organizationId: z.uuid().nullable(),
  departmentId: z.uuid().nullable(),
  isConfirmed: z.boolean(),
});
export type UserResponse = z.infer<typeof userResponseSchema>;
