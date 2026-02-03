import { z } from 'zod';
import { userRoleSchema } from './user-role.schema';

// User profile (optional nested object)
const userProfileSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  hireDate: z.string().nullable(),
  jobTitle: z.string().nullable(),
});

// Response from /auth/me endpoint
export const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  role: userRoleSchema,
  organizationId: z.uuid().nullable(),
  departmentId: z.uuid().nullable(),
  isConfirmed: z.boolean(),
  profile: userProfileSchema.nullable().optional(),
});
export type UserResponse = z.infer<typeof userResponseSchema>;
