import { z } from 'zod';
import { dateSchema } from '../common';
import { userRoleSchema } from './user-role.schema';

export const userDetailResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.email(),
  name: z.string(),
  isConfirmed: z.boolean(),
  role: userRoleSchema,
  organizationId: z.string().uuid().nullable(),
  departmentId: z.string().uuid().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type UserDetailResponse = z.infer<typeof userDetailResponseSchema>;
